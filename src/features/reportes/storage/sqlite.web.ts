import type { AlmacenReportes, EstadoLocal } from '../types';
// Browser preview only. Real persistence is implemented by storage.ts for Android/iOS.
let snapshot: EstadoLocal | null = null;
export const almacen: AlmacenReportes = {
  async leer() { return snapshot === null ? null : JSON.parse(JSON.stringify(snapshot)); },
  async guardar(estado) { snapshot = JSON.parse(JSON.stringify(estado)); },
};
