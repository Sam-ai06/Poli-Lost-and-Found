import type { CoincidenciaDetallada, FiltrosObjetos, ObjetoEncontrado } from '@/types/findyp';

import type { DataProvider } from './data-provider';

const PENDIENTE =
  'SupabaseDataProvider aún no está configurado. Depende de la configuración de Supabase ' +
  '(Participante 3) y del contrato de datos definitivo.';

/**
 * Punto de integración con Supabase.
 *
 * Pendiente (Participante 3): cliente de Supabase, tablas, Storage y políticas RLS.
 * Al implementarlo, cada fila debe convertirse con `normalizarObjeto` (./normalizar)
 * para que los componentes no cambien. Las coincidencias provienen del módulo de
 * matching (Participante 4).
 */
export class SupabaseDataProvider implements DataProvider {
  listarObjetos(_filtros?: FiltrosObjetos): Promise<ObjetoEncontrado[]> {
    return Promise.reject(new Error(PENDIENTE));
  }

  obtenerObjeto(_id: string): Promise<ObjetoEncontrado | null> {
    return Promise.reject(new Error(PENDIENTE));
  }

  obtenerCoincidencias(_busquedaId: string): Promise<CoincidenciaDetallada[]> {
    return Promise.reject(new Error(PENDIENTE));
  }
}
