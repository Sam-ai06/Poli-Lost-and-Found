import type { CoincidenciaDetallada, FiltrosObjetos, ObjetoEncontrado } from '@/types/findyp';

/**
 * Contrato que deben cumplir todas las fuentes de datos de Findyp.
 * La interfaz de usuario solo depende de esta abstracción.
 */
export interface DataProvider {
  listarObjetos(filtros?: FiltrosObjetos): Promise<ObjetoEncontrado[]>;
  obtenerObjeto(id: string): Promise<ObjetoEncontrado | null>;
  obtenerCoincidencias(busquedaId: string): Promise<CoincidenciaDetallada[]>;
}
