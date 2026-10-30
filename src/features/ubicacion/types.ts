export type CoordenadasMapa = { latitud: number; longitud: number };
export type UbicacionActual = CoordenadasMapa & { precision: number | null };
export type MensajeMapa =
  | { canal: 'findyp-mapa-v1'; tipo: 'seleccion'; coordenadas: CoordenadasMapa }
  | { canal: 'findyp-mapa-v1'; tipo: 'listo' | 'error_tiles' | 'tiles_listos' };
export interface PropsMapa {
  inicial: CoordenadasMapa | null;
  actual: UbicacionActual | null;
  alSeleccionar(coordenadas: CoordenadasMapa): void;
  alEstado(estado: 'listo' | 'error_tiles' | 'tiles_listos' | 'error'): void;
}
