import { useCallback, useEffect, useState } from 'react';
import type { Objeto } from '../types';
import { useReportes } from '../services/ReportesProvider';
import { useOperacion } from './useOperacion';
import { validarReclamacion } from '../domain';

export function useRecuperacion(objetoId: string, busquedaId?: string) {
  const { servicios, navegacion, notificarCambio } = useReportes();
  const [objeto, setObjeto] = useState<Objeto | null>(null);
  const [detalle, setDetalle] = useState('');
  const [enviada, setEnviada] = useState(false);
  const { ocupado, error, ejecutar } = useOperacion();
  const cargar = useCallback(() => ejecutar(async () => {
    const o = await servicios.obtenerObjeto(objetoId);
    const usuario = await servicios.usuarioActual();
    if (o.publicador_id === usuario.id) throw new Error('No puedes reclamar tu propio objeto.');
    if (o.estado !== 'disponible') throw new Error('El objeto ya está en recuperación o fue entregado.');
    const propias = await servicios.listarMisReclamaciones();
    if (propias.some(r => r.objeto.id === objetoId && ['pendiente', 'aprobada'].includes(r.reclamacion.estado))) throw new Error('Ya tienes una solicitud activa para este objeto. Puedes verla en Reclamaciones.');
    setObjeto(o);
  }), [servicios, objetoId, ejecutar]);
  useEffect(() => { void cargar(); }, [cargar]);
  const solicitar = () => ejecutar(async () => {
    if (enviada) return;
    const datos = { objeto_id: objetoId, busqueda_id: busquedaId ?? null, detalle_verificacion: detalle.trim() };
    validarReclamacion(datos); await servicios.crearReclamacion(datos);
    setEnviada(true); notificarCambio(); navegacion.abrirReclamaciones();
  });
  return { objeto, detalle, setDetalle, enviada, ocupado, error, recargar: cargar, solicitar };
}
