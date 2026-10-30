import type { DataProvider } from './data-provider';
import { MockDataProvider } from './mock-data-provider';
import { SupabaseDataProvider } from './supabase-data-provider';

export type { DataProvider } from './data-provider';

type FuenteDatos = 'mock' | 'supabase';

/** Cambiar a 'supabase' cuando el Participante 3 complete la configuración. */
const FUENTE_DATOS: FuenteDatos = 'mock';

const proveedores: Record<FuenteDatos, () => DataProvider> = {
  mock: () => new MockDataProvider(),
  supabase: () => new SupabaseDataProvider(),
};

let instancia: DataProvider | null = null;

export function obtenerProveedorDatos(): DataProvider {
  instancia ??= proveedores[FUENTE_DATOS]();
  return instancia;
}
