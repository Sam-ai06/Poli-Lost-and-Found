import { categorias } from '../types/index.ts';
import type { Usuario, Objeto, NuevoObjeto, NuevaBusqueda, EstadoLocal, NuevaReclamacion } from '../types/index.ts';
import { normalizarCoordenadas } from '../../ubicacion/domain.ts';
export * from '../types/index.ts';
export const copia = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
export function exigir(condicion: unknown, mensaje: string): asserts condicion { if (!condicion) throw new Error(mensaje); }
function texto(v: unknown, nombre: string, max = 2000): asserts v is string {
  exigir(typeof v === 'string' && v.trim().length > 0 && v.length <= max, `${nombre}: completa el campo (máximo ${max} caracteres).`);
}
function opcional(v: unknown, nombre: string, max = 2000): asserts v is string | null {
  exigir(v === null || (typeof v === 'string' && v.trim().length > 0 && v.length <= max), `${nombre}: valor no válido.`);
}
export function fechaValida(v: unknown): v is string {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T12:00:00Z`);
  return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0, 10) === v;
}
function base(d: NuevaBusqueda) {
  exigir(d !== null && typeof d === 'object', 'Datos no válidos.');
  exigir(categorias.includes(d.categoria), 'Selecciona una categoría.');
  texto(d.descripcion, 'Descripción'); opcional(d.color, 'Color', 80); opcional(d.imagen_url, 'Imagen');
}
export function validarPasoObjeto(d: NuevoObjeto) {
  base(d as unknown as NuevaBusqueda); texto(d.titulo, 'Título', 100);
  exigir(['fotografia', 'referencia'].includes(d.tipo_imagen), 'Selecciona el tipo de imagen.');
}
export function validarObjeto(d: NuevoObjeto) {
  validarPasoObjeto(d);
  exigir(fechaValida(d.fecha_hallazgo), 'Fecha del hallazgo: usa AAAA-MM-DD y una fecha real.');
  exigir(d.fecha_hallazgo <= fechaHoy(), 'El hallazgo no puede tener una fecha futura.');
  texto(d.lugar_hallazgo, 'Lugar del hallazgo', 200);
  exigir(['fotografia', 'referencia'].includes(d.tipo_imagen), 'Selecciona el tipo de imagen.');
  exigir(['punto_entrega', 'contacto'].includes(d.modalidad_entrega), 'Selecciona cómo entregar.');
  opcional(d.punto_entrega, 'Punto de entrega', 200); opcional(d.contacto, 'Contacto', 200);
  opcional(d.caracteristica_reservada, 'Característica reservada');
  if (d.modalidad_entrega === 'punto_entrega') texto(d.punto_entrega, 'Punto de entrega', 200);
  else texto(d.contacto, 'Medio de contacto', 200);
}
export function validarBusqueda(d: NuevaBusqueda) {
  base(d); opcional(d.lugar_aproximado, 'Lugar aproximado', 200);
  normalizarCoordenadas(d.ubicacion_perdida);
  exigir(d.fecha_perdida === null || (fechaValida(d.fecha_perdida) && d.fecha_perdida <= fechaHoy()), 'Fecha aproximada: usa AAAA-MM-DD y una fecha pasada o actual.');
}
export function validarReclamacion(d: NuevaReclamacion) {
  exigir(d !== null && typeof d === 'object', 'Solicitud no válida.');
  texto(d.objeto_id, 'Objeto'); texto(d.detalle_verificacion, 'Característica privada');
  opcional(d.busqueda_id ?? null, 'Búsqueda vinculada');
}
export function fechaHoy() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
// Validate storage/server data before trusting it. Corrupt data is never silently reset.
export function validarEstado(raw: unknown, usuarios: readonly Usuario[]): EstadoLocal {
  exigir(raw !== null && typeof raw === 'object', 'No se pudieron leer los datos locales.');
  const s = copia(raw) as EstadoLocal;
  // Compatibility with the first v1 snapshot before claims were enabled.
  if (s.reclamaciones === undefined) s.reclamaciones = [];
  exigir(s.version === 1 && usuarios.some(u => u.id === s.usuario_id) && Array.isArray(s.objetos) && Array.isArray(s.busquedas) && s.privados && typeof s.privados === 'object', 'Formato local incompatible.');
  const ids = new Set<string>();
  for (const o of s.objetos) {
    texto(o.id, 'Identificador'); exigir(!ids.has(o.id), 'Identificador duplicado.'); ids.add(o.id);
    exigir(usuarios.some(u => u.id === o.publicador_id), 'Publicador no válido.');
    const p = s.privados[o.id]; exigir(p, 'Faltan datos privados.'); validarObjeto({ ...o, ...p });
    exigir(['disponible', 'en_recuperacion', 'entregado'].includes(o.estado), 'Estado de objeto no válido.');
    exigir(typeof o.creado_en === 'string' && !Number.isNaN(Date.parse(o.creado_en)), 'Marca de tiempo no válida.');
  }
  for (const b of s.busquedas) {
    // Older v1 searches had only a textual place; never invent coordinates.
    b.ubicacion_perdida = normalizarCoordenadas(b.ubicacion_perdida);
    texto(b.id, 'Identificador'); exigir(!ids.has(b.id), 'Identificador duplicado.'); ids.add(b.id);
    validarBusqueda(b); exigir(usuarios.some(u => u.id === b.solicitante_id), 'Solicitante no válido.');
    exigir(['activa', 'resuelta', 'cerrada'].includes(b.estado), 'Estado de búsqueda no válido.');
    exigir(typeof b.creado_en === 'string' && !Number.isNaN(Date.parse(b.creado_en)), 'Marca de tiempo no válida.');
  }
  exigir(Array.isArray(s.reclamaciones), 'Formato de reclamaciones no válido.');
  const activas = new Set<string>();
  for (const r of s.reclamaciones) {
    texto(r.id, 'Identificador'); exigir(!ids.has(r.id), 'Identificador duplicado.'); ids.add(r.id);
    validarReclamacion(r);
    exigir(['pendiente', 'aprobada', 'rechazada', 'entregada'].includes(r.estado), 'Estado de reclamación no válido.');
    exigir(typeof r.creado_en === 'string' && !Number.isNaN(Date.parse(r.creado_en)), 'Marca de tiempo no válida.');
    const o = s.objetos.find(o => o.id === r.objeto_id);
    exigir(o && usuarios.some(u => u.id === r.solicitante_id) && o.publicador_id !== r.solicitante_id, 'Reclamación con participantes no válidos.');
    exigir(r.busqueda_id === null || s.busquedas.some(b => b.id === r.busqueda_id && b.solicitante_id === r.solicitante_id), 'Búsqueda vinculada no válida.');
    if (r.estado === 'pendiente' || r.estado === 'aprobada') {
      const clave = `${r.objeto_id}:${r.solicitante_id}`;
      exigir(!activas.has(clave), 'Reclamación activa duplicada.'); activas.add(clave);
      exigir(o.estado !== 'entregado', 'Un objeto entregado no puede tener solicitudes activas.');
    }
    if (r.estado === 'aprobada') exigir(o.estado === 'en_recuperacion', 'Aprobación y objeto inconsistentes.');
    if (r.estado === 'entregada') {
      exigir(o.estado === 'entregado', 'Entrega y objeto inconsistentes.');
      if (r.busqueda_id) exigir(s.busquedas.find(b => b.id === r.busqueda_id)?.estado === 'resuelta', 'Entrega y búsqueda inconsistentes.');
    }
  }
  for (const o of s.objetos) {
    const aprobadas = s.reclamaciones.filter(r => r.objeto_id === o.id && r.estado === 'aprobada').length;
    const entregadas = s.reclamaciones.filter(r => r.objeto_id === o.id && r.estado === 'entregada').length;
    exigir(aprobadas === (o.estado === 'en_recuperacion' ? 1 : 0) && entregadas === (o.estado === 'entregado' ? 1 : 0), 'Estados de recuperación inconsistentes.');
  }
  return copia(s);
}
export function objetoPublico(o: Objeto): Objeto {
  // Explicit projection also strips unexpected/private properties from incoming records.
  return { id: o.id, publicador_id: o.publicador_id, titulo: o.titulo, categoria: o.categoria, descripcion: o.descripcion, color: o.color, fecha_hallazgo: o.fecha_hallazgo, lugar_hallazgo: o.lugar_hallazgo, imagen_url: o.imagen_url, tipo_imagen: o.tipo_imagen, modalidad_entrega: o.modalidad_entrega, punto_entrega: o.punto_entrega, estado: o.estado, creado_en: o.creado_en };
}
