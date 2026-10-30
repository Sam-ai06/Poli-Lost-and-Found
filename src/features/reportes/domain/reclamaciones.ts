import type { EstadoLocal, NuevaReclamacion, Reclamacion } from '../types/index.ts';
import { exigir, validarReclamacion } from './index.ts';

export function registrarReclamacion(s: EstadoLocal, datos: NuevaReclamacion, id: string): Reclamacion {
  validarReclamacion(datos);
  const objeto = s.objetos.find(o => o.id === datos.objeto_id);
  exigir(objeto, 'El objeto no existe.');
  exigir(objeto.publicador_id !== s.usuario_id, 'No puedes reclamar tu propio objeto.');
  exigir(objeto.estado === 'disponible', 'El objeto ya está en recuperación o fue entregado.');
  exigir(!s.reclamaciones.some(r => r.objeto_id === objeto.id && r.solicitante_id === s.usuario_id && ['pendiente', 'aprobada'].includes(r.estado)), 'Ya tienes una solicitud activa para este objeto.');
  if (datos.busqueda_id) exigir(s.busquedas.some(b => b.id === datos.busqueda_id && b.solicitante_id === s.usuario_id && b.estado === 'activa'), 'La búsqueda vinculada debe ser tuya y estar activa.');
  const r: Reclamacion = { id, objeto_id: objeto.id, solicitante_id: s.usuario_id, busqueda_id: datos.busqueda_id ?? null, detalle_verificacion: datos.detalle_verificacion.trim(), estado: 'pendiente', creado_en: new Date().toISOString() };
  s.reclamaciones.unshift(r); return r;
}
function recibida(s: EstadoLocal, id: string) {
  const r = s.reclamaciones.find(r => r.id === id);
  exigir(r, 'La reclamación no existe.');
  const o = s.objetos.find(o => o.id === r.objeto_id);
  exigir(o && o.publicador_id === s.usuario_id, 'Solo quien publicó el objeto puede revisar o confirmar su entrega.');
  return { r, o };
}
export function resolverSolicitud(s: EstadoLocal, id: string, decision: 'aprobada' | 'rechazada') {
  exigir(['aprobada', 'rechazada'].includes(decision), 'Decisión no válida.');
  const { r, o } = recibida(s, id);
  exigir(r.estado === 'pendiente', 'Solo puedes resolver una solicitud pendiente.');
  if (decision === 'aprobada') {
    exigir(o.estado === 'disponible' && !s.reclamaciones.some(otra => otra.objeto_id === o.id && otra.estado === 'aprobada'), 'Ya hay una recuperación aprobada para este objeto.');
    o.estado = 'en_recuperacion';
  }
  r.estado = decision;
}
export function entregarObjeto(s: EstadoLocal, id: string) {
  const { r, o } = recibida(s, id);
  exigir(r.estado === 'aprobada' && o.estado === 'en_recuperacion', 'Primero aprueba la solicitud y realiza la entrega física.');
  r.estado = 'entregada'; o.estado = 'entregado';
  if (r.busqueda_id) {
    const b = s.busquedas.find(b => b.id === r.busqueda_id);
    exigir(b && b.solicitante_id === r.solicitante_id, 'La búsqueda vinculada no es válida.'); b.estado = 'resuelta';
  }
  // Preserve the history and close outstanding requests for an unavailable object.
  for (const otra of s.reclamaciones) if (otra.objeto_id === o.id && otra.estado === 'pendiente') otra.estado = 'rechazada';
}
