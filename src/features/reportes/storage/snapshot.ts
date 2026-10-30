import type { AlmacenReportes, EstadoLocal } from '../types/index.ts';

// Database port: the same SQL can be verified on disk without React Native.
export interface ConexionSnapshot {
  execAsync(sql: string): Promise<void>;
  getFirstAsync<T>(sql: string): Promise<T | null>;
  runAsync(sql: string, valor: string): Promise<unknown>;
}
export function crearAlmacenSQLite(abrir: () => Promise<ConexionSnapshot>): AlmacenReportes {
  let conexion: Promise<ConexionSnapshot> | undefined;
  async function base() {
    if (!conexion) conexion = (async () => {
      const db = await abrir();
      await db.execAsync('CREATE TABLE IF NOT EXISTS reportes_snapshot_v1 (id INTEGER PRIMARY KEY CHECK (id = 1), payload TEXT NOT NULL)');
      return db;
    })().catch(error => { conexion = undefined; throw error; });
    return conexion;
  }
  return {
    async leer() {
      const fila = await (await base()).getFirstAsync<{ payload: string }>('SELECT payload FROM reportes_snapshot_v1 WHERE id = 1');
      return fila ? JSON.parse(fila.payload) : null;
    },
    async guardar(estado: EstadoLocal) {
      // One statement: either the entire snapshot changes, or nothing changes.
      await (await base()).runAsync('INSERT INTO reportes_snapshot_v1 (id, payload) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET payload = excluded.payload', JSON.stringify(estado));
    },
  };
}
