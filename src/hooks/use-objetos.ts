import { useCallback } from 'react';

import { obtenerProveedorDatos } from '@/services';
import { useReportes } from '@/features/reportes';
import type { CoincidenciaDetallada, FiltrosObjetos, ObjetoEncontrado } from '@/types/findyp';

import { useRecurso } from './use-recurso';

export function useObjetos(filtros: FiltrosObjetos) {
  const { revision } = useReportes();
  const cargar = useCallback(() => { void revision; return obtenerProveedorDatos().listarObjetos(filtros); }, [filtros, revision]);
  return useRecurso<ObjetoEncontrado[]>(cargar);
}

export function useObjeto(id: string) {
  const { revision } = useReportes();
  const cargar = useCallback(() => { void revision; return obtenerProveedorDatos().obtenerObjeto(id); }, [id, revision]);
  return useRecurso<ObjetoEncontrado | null>(cargar);
}

export function useCoincidencias(busquedaId: string) {
  const cargar = useCallback(
    () => obtenerProveedorDatos().obtenerCoincidencias(busquedaId),
    [busquedaId]
  );
  return useRecurso<CoincidenciaDetallada[]>(cargar);
}
