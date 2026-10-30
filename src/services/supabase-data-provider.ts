import { servicioSupabase } from '@/features/reportes/services/supabase';
import type { CoincidenciaDetallada, FiltrosObjetos, ObjetoEncontrado } from '@/types/findyp';

import type { DataProvider } from './data-provider';
import { filtrarObjetos } from './filtrar-objetos';

export class SupabaseDataProvider implements DataProvider {
  async listarObjetos(filtros?: FiltrosObjetos): Promise<ObjetoEncontrado[]> {
    return filtrarObjetos(await servicioSupabase.listarObjetosPublicos(), filtros);
  }

  async obtenerObjeto(id: string): Promise<ObjetoEncontrado | null> {
    try { return await servicioSupabase.obtenerObjeto(id); }
    catch (error) {
      if (error instanceof Error && error.message === 'El objeto no existe o no está disponible.') return null;
      throw error;
    }
  }

  async obtenerCoincidencias(busquedaId: string): Promise<CoincidenciaDetallada[]> {
    const objetos = await servicioSupabase.solicitarCoincidencias(busquedaId);
    return objetos.map(objeto => ({ id: `${busquedaId}-${objeto.id}`, busqueda_id: busquedaId, nivel_similitud: null, objeto }));
  }
}
