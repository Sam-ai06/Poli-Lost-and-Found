import { supabase } from '@/lib/supabase';

import type { Busqueda, NuevaBusqueda, NuevaReclamacion, NuevoObjeto, Objeto, ObjetoPropio, Reclamacion, ReclamacionResumen, ServicioReportes, Usuario } from '../types';

type Imagen = { ruta_storage: string; tipo?: 'fotografia' | 'referencia'; orden?: number };
type ObjetoFila = Omit<Objeto, 'publicador_id' | 'imagen_url' | 'tipo_imagen' | 'modalidad_entrega'> & {
  publicado_por: string; tipo_entrega: 'punto_entrega' | 'coordinar_contacto'; objeto_imagenes: Imagen[];
  objetos_detalles_reservados?: { detalle: string | null; contacto: string | null } | null;
};
type BusquedaFila = Omit<Busqueda, 'solicitante_id' | 'imagen_url'> & { usuario_id: string; busqueda_imagenes: Imagen[] };
type ReclamacionFila = Omit<Reclamacion, 'detalle_verificacion'> & { prueba_propiedad: string };
type ErrorBD = { message: string; code?: string } | null;

function comprobar(error: ErrorBD) {
  if (error) throw new Error(error.message || 'No se pudo conectar con Supabase.');
}

async function usuario(): Promise<Usuario> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Inicia sesión para guardar y gestionar tus reportes.');
  const { data: perfil, error: errorPerfil } = await supabase.from('perfiles').select('nombre').eq('id', data.user.id).maybeSingle();
  comprobar(errorPerfil);
  return { id: data.user.id, nombre: perfil?.nombre ?? 'Usuario', correo: data.user.email ?? '' };
}

const seleccionObjeto = '*,objeto_imagenes(ruta_storage,tipo,orden)';
const seleccionPropio = `${seleccionObjeto},objetos_detalles_reservados(detalle,contacto)`;
const seleccionBusqueda = '*,busqueda_imagenes(ruta_storage)';

function objeto(fila: ObjetoFila): Objeto {
  const imagen = [...(fila.objeto_imagenes ?? [])].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))[0];
  return {
    id: fila.id, publicador_id: fila.publicado_por, titulo: fila.titulo, categoria: fila.categoria,
    descripcion: fila.descripcion, color: fila.color, fecha_hallazgo: fila.fecha_hallazgo,
    lugar_hallazgo: fila.lugar_hallazgo, punto_entrega: fila.punto_entrega, estado: fila.estado,
    creado_en: fila.creado_en, modalidad_entrega: fila.tipo_entrega === 'punto_entrega' ? 'punto_entrega' : 'contacto',
    tipo_imagen: imagen?.tipo ?? 'fotografia',
    imagen_url: imagen ? supabase.storage.from('objetos-imagenes').getPublicUrl(imagen.ruta_storage).data.publicUrl : null,
  };
}

async function busqueda(fila: BusquedaFila): Promise<Busqueda> {
  const imagen = fila.busqueda_imagenes?.[0];
  let imagen_url: string | null = null;
  if (imagen) {
    const { data, error } = await supabase.storage.from('busquedas-imagenes').createSignedUrl(imagen.ruta_storage, 3600);
    comprobar(error); imagen_url = data?.signedUrl ?? null;
  }
  return { id: fila.id, solicitante_id: fila.usuario_id, categoria: fila.categoria, descripcion: fila.descripcion,
    color: fila.color, fecha_perdida: fila.fecha_perdida, lugar_aproximado: fila.lugar_aproximado,
    ubicacion_perdida: fila.ubicacion_perdida, estado: fila.estado, creado_en: fila.creado_en, imagen_url };
}

function rutaDeUrl(url: string | null, bucket: string): string | null {
  if (!url) return null;
  const base = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  try {
    const parsed = new URL(url);
    const project = new URL(base);
    const prefijos = [`/storage/v1/object/public/${bucket}/`, `/storage/v1/object/sign/${bucket}/`];
    const prefijo = prefijos.find(p => parsed.origin === project.origin && parsed.pathname.startsWith(p));
    return prefijo ? decodeURIComponent(parsed.pathname.slice(prefijo.length)) : null;
  } catch { return null; }
}

async function subirImagen(uri: string | null, bucket: string): Promise<{ ruta: string | null; nueva: boolean }> {
  if (!uri) return { ruta: null, nueva: false };
  const previa = rutaDeUrl(uri, bucket);
  if (previa) return { ruta: previa, nueva: false };
  if (!/^(file:|content:|blob:|data:)/i.test(uri)) throw new Error('Selecciona una imagen de tu dispositivo.');
  const actual = await usuario();
  const respuesta = await fetch(uri);
  if (!respuesta.ok) throw new Error('No se pudo leer la imagen seleccionada.');
  const contenido = await respuesta.arrayBuffer();
  const bytes = new Uint8Array(contenido);
  const texto = (inicio: number, fin: number) => String.fromCharCode(...bytes.slice(inicio, fin));
  const firma = bytes[0] === 0xff && bytes[1] === 0xd8 ? 'image/jpeg'
    : bytes[0] === 0x89 && texto(1, 4) === 'PNG' ? 'image/png'
    : texto(0, 4) === 'RIFF' && texto(8, 12) === 'WEBP' ? 'image/webp'
    : texto(4, 8) === 'ftyp' && ['heic', 'heix', 'hevc', 'hevx'].includes(texto(8, 12)) ? 'image/heic'
    : texto(4, 8) === 'ftyp' && ['mif1', 'msf1', 'heif'].includes(texto(8, 12)) ? 'image/heif' : null;
  const mime = firma ?? uri.match(/^data:(image\/[a-z+]+)[;,]/i)?.[1] ?? respuesta.headers.get('content-type')?.split(';')[0] ?? '';
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'].includes(mime)) throw new Error('Selecciona una imagen JPEG, PNG, WebP o HEIC.');
  if (contenido.byteLength > 10 * 1024 * 1024) throw new Error('La imagen debe pesar como máximo 10 MB.');
  const extensiones: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic', 'image/heif': 'heif' };
  const ruta = `${actual.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extensiones[mime]}`;
  const { error } = await supabase.storage.from(bucket).upload(ruta, contenido, { contentType: mime, upsert: false });
  comprobar(error);
  return { ruta, nueva: true };
}

async function guardar(tipo: 'objeto' | 'busqueda', datos: NuevoObjeto | NuevaBusqueda, id?: string, origen?: string, estado?: string): Promise<string> {
  const bucket = tipo === 'objeto' ? 'objetos-imagenes' : 'busquedas-imagenes';
  if (origen) {
    const actual = await usuario();
    const tabla = tipo === 'objeto' ? 'objetos' : 'busquedas';
    const campo = tipo === 'objeto' ? 'publicado_por' : 'usuario_id';
    const { data: existente, error } = await supabase.from(tabla).select('id').eq(campo, actual.id).eq('origen_local', origen).maybeSingle();
    comprobar(error);
    if (existente) return existente.id;
  }
  const imagen = await subirImagen(datos.imagen_url, bucket);
  const cuerpo = tipo === 'objeto' ? (() => {
    const o = datos as NuevoObjeto;
    return { titulo: o.titulo, categoria: o.categoria, descripcion: o.descripcion, color: o.color, estado,
      fecha_hallazgo: o.fecha_hallazgo, lugar_hallazgo: o.lugar_hallazgo,
      tipo_entrega: o.modalidad_entrega === 'contacto' ? 'coordinar_contacto' : 'punto_entrega',
      punto_entrega: o.punto_entrega, contacto: o.contacto, caracteristica_reservada: o.caracteristica_reservada,
      tipo_imagen: o.tipo_imagen, ruta_storage: imagen.ruta };
  })() : (() => {
    const b = datos as NuevaBusqueda;
    return { categoria: b.categoria, descripcion: b.descripcion, color: b.color, fecha_perdida: b.fecha_perdida, estado,
      lugar_aproximado: b.lugar_aproximado, ubicacion_perdida: b.ubicacion_perdida ?? null, ruta_storage: imagen.ruta };
  })();
  const { data, error } = await supabase.rpc('guardar_reporte', { tipo, datos: cuerpo, recurso_id: id ?? null, origen: origen ?? null });
  if (error) {
    // A confirmed database rejection rolls back the association. A network failure
    // is ambiguous, so keep the file in case the transaction actually committed.
    if (error.code && imagen.nueva && imagen.ruta) await supabase.storage.from(bucket).remove([imagen.ruta]);
    comprobar(error);
  }
  if (typeof data !== 'string') throw new Error('No se pudo confirmar el reporte guardado.');
  return data;
}

async function obtenerObjeto(id: string, propio = false): Promise<ObjetoPropio> {
  const { data, error } = await supabase.from('objetos').select(propio ? seleccionPropio : seleccionObjeto).eq('id', id).maybeSingle();
  comprobar(error);
  if (!data) throw new Error('El objeto no existe o no está disponible.');
  const fila = data as unknown as ObjetoFila;
  return { ...objeto(fila), contacto: fila.objetos_detalles_reservados?.contacto ?? null,
    caracteristica_reservada: fila.objetos_detalles_reservados?.detalle ?? null };
}

async function listarObjetos(propios = false): Promise<ObjetoPropio[]> {
  let query = supabase.from('objetos').select(propios ? seleccionPropio : seleccionObjeto).order('creado_en', { ascending: false });
  if (propios) query = query.eq('publicado_por', (await usuario()).id);
  else query = query.eq('estado', 'disponible');
  const { data, error } = await query; comprobar(error);
  return ((data ?? []) as unknown as ObjetoFila[]).map(fila => ({ ...objeto(fila),
    contacto: fila.objetos_detalles_reservados?.contacto ?? null, caracteristica_reservada: fila.objetos_detalles_reservados?.detalle ?? null }));
}

async function listarBusquedas(): Promise<Busqueda[]> {
  const actual = await usuario();
  const { data, error } = await supabase.from('busquedas').select(seleccionBusqueda).eq('usuario_id', actual.id).order('creado_en', { ascending: false });
  comprobar(error);
  return Promise.all(((data ?? []) as unknown as BusquedaFila[]).map(busqueda));
}

async function rpcOperacion(operacion: string, datos: object, recurso_id: string | null = null) {
  const { data, error } = await supabase.rpc('api_mutar', { operacion, datos, recurso_id });
  comprobar(error); return data;
}

async function reclamaciones(recibidas: boolean): Promise<ReclamacionResumen[]> {
  const actual = await usuario();
  const { data, error } = await supabase.from('reclamaciones').select('*').order('creado_en', { ascending: false });
  comprobar(error);
  const filas = (data ?? []) as ReclamacionFila[];
  const resultados = await Promise.all(filas.map(async fila => {
    const o = await obtenerObjeto(fila.objeto_id);
    if (recibidas ? o.publicador_id !== actual.id : fila.solicitante_id !== actual.id) return null;
    const { data: perfil, error: perfilError } = await supabase.from('perfiles').select('nombre').eq('id', fila.solicitante_id).maybeSingle();
    comprobar(perfilError);
    return { reclamacion: { ...fila, detalle_verificacion: fila.prueba_propiedad }, objeto: o,
      solicitante: { id: fila.solicitante_id, nombre: perfil?.nombre ?? 'Usuario' } };
  }));
  return resultados.filter((r): r is NonNullable<typeof r> => r !== null);
}

export const servicioSupabase: ServicioReportes = {
  usuarioActual: usuario,
  crearObjeto: async datos => obtenerObjeto(await guardar('objeto', datos), true),
  listarMisObjetos: () => listarObjetos(true),
  obtenerObjeto,
  listarObjetosPublicos: () => listarObjetos(),
  listarTodosObjetosPublicos: () => listarObjetos(),
  actualizarObjeto: async (id, datos) => obtenerObjeto(await guardar('objeto', datos, id), true),
  crearBusqueda: async datos => { const id = await guardar('busqueda', datos); const encontrada = (await listarBusquedas()).find(b => b.id === id); if (!encontrada) throw new Error('No se pudo recuperar la búsqueda.'); return encontrada; },
  listarMisBusquedas: listarBusquedas,
  actualizarBusqueda: async (id, datos) => { await guardar('busqueda', datos, id); const encontrada = (await listarBusquedas()).find(b => b.id === id); if (!encontrada) throw new Error('No se pudo recuperar la búsqueda.'); return encontrada; },
  cerrarBusqueda: async id => { const { error } = await supabase.rpc('cerrar_busqueda', { recurso_id: id }); comprobar(error); },
  solicitarCoincidencias: async id => { const actual = await usuario(); const b = (await listarBusquedas()).find(item => item.id === id); if (!b) throw new Error('La búsqueda no existe o no te pertenece.'); return (await listarObjetos()).filter(o => o.categoria === b.categoria && o.publicador_id !== actual.id); },
  crearReclamacion: async (datos: NuevaReclamacion) => { const fila = await rpcOperacion('crear_reclamacion', { objeto_id: datos.objeto_id, busqueda_id: datos.busqueda_id ?? null, prueba_propiedad: datos.detalle_verificacion }) as ReclamacionFila; return { ...fila, detalle_verificacion: fila.prueba_propiedad }; },
  listarMisReclamaciones: () => reclamaciones(false),
  listarReclamacionesRecibidas: () => reclamaciones(true),
  resolverReclamacion: async (id, estado) => { await rpcOperacion('gestionar_reclamacion', { estado }, id); },
  confirmarEntrega: async id => { await rpcOperacion('gestionar_reclamacion', { estado: 'entregada' }, id); },
  obtenerInstruccionesEntrega: async id => { const { data, error } = await supabase.rpc('instrucciones_entrega', { reclamo_id: id }); comprobar(error); return data as { contacto: string | null; punto_entrega: string | null }; },
};

export async function importarReporteLocal(tipo: 'objeto' | 'busqueda', datos: NuevoObjeto | NuevaBusqueda, origen: string, estado: string, usuarioEsperado: string): Promise<string> {
  if ((await usuario()).id !== usuarioEsperado) throw new Error('La sesión cambió durante la migración. Vuelve a iniciar sesión.');
  return guardar(tipo, datos, undefined, origen, estado);
}
