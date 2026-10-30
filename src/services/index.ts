import type { DataProvider } from './data-provider';
import { MockDataProvider } from './mock-data-provider';
import { SupabaseDataProvider } from './supabase-data-provider';

export type { DataProvider } from './data-provider';

type FuenteDatos = 'mock' | 'supabase';

/** La galería consulta la misma base que los formularios. */
const FUENTE_DATOS: FuenteDatos = 'supabase';

const proveedores: Record<FuenteDatos, () => DataProvider> = {
  mock: () => new MockDataProvider(),
  supabase: () => new SupabaseDataProvider(),
};

let instancia: DataProvider | null = null;

export function obtenerProveedorDatos(): DataProvider {
  instancia ??= proveedores[FUENTE_DATOS]();
  return instancia;
}
