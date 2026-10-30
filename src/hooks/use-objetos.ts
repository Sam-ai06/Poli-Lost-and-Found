import { useCallback } from 'react';

import { obtenerProveedorDatos } from '@/services';
import type { CoincidenciaDetallada, FiltrosObjetos, ObjetoEncontrado } from '@/types/findyp';

import { useRecurso } from './use-recurso';

export function useObjetos(filtros: FiltrosObjetos) {
  const cargar = useCallback(() => obtenerProveedorDatos().listarObjetos(filtros), [filtros]);
  return useRecurso<ObjetoEncontrado[]>(cargar);
}

export function useObjeto(id: string) {
  const cargar = useCallback(() => obtenerProveedorDatos().obtenerObjeto(id), [id]);
  return useRecurso<ObjetoEncontrado | null>(cargar);
}

export function useCoincidencias(busquedaId: string) {
  const cargar = useCallback(
    () => obtenerProveedorDatos().obtenerCoincidencias(busquedaId),
    [busquedaId]
  );
  return useRecurso<CoincidenciaDetallada[]>(cargar);
}
