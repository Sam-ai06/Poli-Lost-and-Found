import { useCallback, useEffect, useState } from 'react';
import type { ReclamacionResumen } from '../types';
import { useReportes } from '../services/ReportesProvider';
import { useOperacion } from './useOperacion';

export function useReclamaciones() {
  const { servicios, revision, notificarCambio } = useReportes();
  const [vista, setVista] = useState<{ revision: number; recibidas: ReclamacionResumen[]; enviadas: ReclamacionResumen[] } | null>(null);
  const { ocupado, error, ejecutar } = useOperacion();
  const cargar = useCallback(() => ejecutar(async () => {
    const recibidas = await servicios.listarReclamacionesRecibidas();
    const enviadas = await servicios.listarMisReclamaciones();
    setVista({ revision, recibidas, enviadas });
  }), [servicios, revision, ejecutar]);
  useEffect(() => { void cargar(); }, [cargar]);
  const resolver = (id: string, decision: 'aprobada' | 'rechazada') => ejecutar(async () => { await servicios.resolverReclamacion(id, decision); notificarCambio(); });
  const entregar = (id: string) => ejecutar(async () => { await servicios.confirmarEntrega(id); notificarCambio(); });
  const listo = vista?.revision === revision;
  return { recibidas: listo ? vista.recibidas : [], enviadas: listo ? vista.enviadas : [], listo, ocupado, error, resolver, entregar, recargar: cargar, ejecutar };
}
