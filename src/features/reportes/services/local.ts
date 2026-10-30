import type { Usuario, Objeto, Busqueda, Reclamacion, ReclamacionResumen, EstadoLocal, AlmacenReportes, ServicioReportes, ControlesDemo } from '../types/index.ts';
import { copia, exigir, objetoPublico, validarObjeto, validarBusqueda, validarEstado } from '../domain/index.ts';
import { registrarReclamacion, resolverSolicitud, entregarObjeto } from '../domain/reclamaciones.ts';
export function crearServicioLocal(almacen: AlmacenReportes, opciones: { usuarios: readonly Usuario[]; inicial: () => EstadoLocal }): ServicioReportes & ControlesDemo {
  const { usuarios, inicial } = opciones;
  let cola: Promise<unknown> = Promise.resolve();
  // Serialize reads and writes, reload each time; persist a whole snapshot atomically.
  function operar<T>(fn: (s: EstadoLocal) => T | Promise<T>, escribir = false): Promise<T> {
    const tarea = cola.then(async () => {
      const raw = await almacen.leer();
      const s = raw === null ? inicial() : validarEstado(raw, usuarios);
      const result = await fn(s);
      if (escribir || raw === null) await almacen.guardar(validarEstado(s, usuarios));
      return copia(result === undefined ? null : result) as T;
    });
    cola = tarea.catch(() => undefined); return tarea;
  }
  const buscarObjeto = (s: EstadoLocal, id: string) => { const o = s.objetos.find(o => o.id === id); exigir(o, 'El objeto no existe.'); return o; };
  const propio = (s: EstadoLocal, o: Objeto) => { exigir(o.publicador_id === s.usuario_id, 'Solo puedes modificar tus propios objetos.'); return { ...objetoPublico(o), ...s.privados[o.id] }; };
  const buscarBusqueda = (s: EstadoLocal, id: string) => { const b = s.busquedas.find(b => b.id === id); exigir(b && b.solicitante_id === s.usuario_id, 'La búsqueda no existe o no te pertenece.'); return b; };
  const id = () => `r-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  const resumen = (s: EstadoLocal, r: Reclamacion): ReclamacionResumen => {
    const usuario = usuarios.find(u => u.id === r.solicitante_id)!;
    return { reclamacion: r, objeto: objetoPublico(buscarObjeto(s, r.objeto_id)), solicitante: { id: usuario.id, nombre: usuario.nombre } };
  };
  return {
    usuarios,
    usuarioActual: () => operar(s => usuarios.find(u => u.id === s.usuario_id)!),
    crearObjeto: datos => operar(s => {
      validarObjeto(datos); const { contacto, caracteristica_reservada, ...publicos } = datos;
      const o: Objeto = { ...publicos, id: id(), publicador_id: s.usuario_id, estado: 'disponible', creado_en: new Date().toISOString() };
      s.objetos.unshift(objetoPublico(o)); s.privados[o.id] = { contacto: o.modalidad_entrega === 'contacto' ? contacto : null, caracteristica_reservada };
      return propio(s, o);
    }, true),
    listarMisObjetos: () => operar(s => s.objetos.filter(o => o.publicador_id === s.usuario_id).map(o => propio(s, o))),
    obtenerObjeto: id => operar(s => objetoPublico(buscarObjeto(s, id))),
    listarObjetosPublicos: () => operar(s => s.objetos.filter(o => o.estado === 'disponible').map(objetoPublico)),
    actualizarObjeto: (id, datos) => operar(s => {
      validarObjeto(datos); const o = buscarObjeto(s, id); propio(s, o);
      exigir(o.estado === 'disponible', 'Este objeto ya está en recuperación o fue entregado.');
      const actualizado = objetoPublico({ ...o, ...datos, id: o.id, publicador_id: o.publicador_id, estado: o.estado, creado_en: o.creado_en });
      Object.assign(o, actualizado); s.privados[id] = { contacto: datos.modalidad_entrega === 'contacto' ? datos.contacto : null, caracteristica_reservada: datos.caracteristica_reservada };
      return propio(s, o);
    }, true),
    crearBusqueda: datos => operar(s => { validarBusqueda(datos); const b: Busqueda = { categoria: datos.categoria, descripcion: datos.descripcion, color: datos.color, fecha_perdida: datos.fecha_perdida, lugar_aproximado: datos.lugar_aproximado, imagen_url: datos.imagen_url, id: id(), solicitante_id: s.usuario_id, estado: 'activa', creado_en: new Date().toISOString() }; s.busquedas.unshift(b); return b; }, true),
    listarMisBusquedas: () => operar(s => s.busquedas.filter(b => b.solicitante_id === s.usuario_id)),
    actualizarBusqueda: (id, datos) => operar(s => { validarBusqueda(datos); const b = buscarBusqueda(s, id); exigir(b.estado === 'activa', 'Solo puedes editar búsquedas activas.'); Object.assign(b, { categoria: datos.categoria, descripcion: datos.descripcion, color: datos.color, fecha_perdida: datos.fecha_perdida, lugar_aproximado: datos.lugar_aproximado, imagen_url: datos.imagen_url }); return b; }, true),
    cerrarBusqueda: id => operar(s => { const b = buscarBusqueda(s, id); exigir(b.estado === 'activa', 'La búsqueda ya está cerrada o resuelta.'); b.estado = 'cerrada'; }, true),
    // DEMO: replace with the matching module/API. Category filtering is NOT a real match.
    solicitarCoincidencias: id => operar(s => { const b = buscarBusqueda(s, id); return s.objetos.filter(o => o.publicador_id !== s.usuario_id && o.estado === 'disponible' && o.categoria === b.categoria).map(objetoPublico); }),
    crearReclamacion: datos => operar(s => registrarReclamacion(s, datos, id()), true),
    listarMisReclamaciones: () => operar(s => s.reclamaciones.filter(r => r.solicitante_id === s.usuario_id).map(r => resumen(s, r))),
    listarReclamacionesRecibidas: () => operar(s => s.reclamaciones.filter(r => s.objetos.some(o => o.id === r.objeto_id && o.publicador_id === s.usuario_id)).map(r => resumen(s, r))),
    resolverReclamacion: (id, decision) => operar(s => resolverSolicitud(s, id, decision), true),
    confirmarEntrega: id => operar(s => entregarObjeto(s, id), true),
    obtenerInstruccionesEntrega: id => operar(s => {
      const r = s.reclamaciones.find(r => r.id === id); exigir(r, 'La solicitud no existe.');
      const o = buscarObjeto(s, r.objeto_id);
      exigir(o.publicador_id === s.usuario_id || (r.solicitante_id === s.usuario_id && ['aprobada', 'entregada'].includes(r.estado)), 'La coordinación está disponible después de aprobar la solicitud.');
      return { contacto: s.privados[o.id].contacto, punto_entrega: o.punto_entrega };
    }),
    cambiarUsuario: id => operar(s => { exigir(usuarios.some(u => u.id === id), 'Usuario no válido.'); s.usuario_id = id; }, true),
    reiniciarDemo: () => {
      // Explicit demo reset can also recover a corrupt module snapshot.
      const tarea = cola.then(() => almacen.guardar(validarEstado(inicial(), usuarios)));
      cola = tarea.catch(() => undefined); return tarea;
    },
  };
}
