import type { CoordenadasMapa, MensajeMapa } from './types.ts';

export function coordenadasValidas(valor: unknown): valor is CoordenadasMapa {
  if (!valor || typeof valor !== 'object') return false;
  const p = valor as CoordenadasMapa;
  return typeof p.latitud === 'number' && Number.isFinite(p.latitud) && Math.abs(p.latitud) <= 90 &&
    typeof p.longitud === 'number' && Number.isFinite(p.longitud) && Math.abs(p.longitud) <= 180;
}
export function normalizarCoordenadas(valor: unknown): CoordenadasMapa | null {
  if (valor === null || valor === undefined) return null;
  if (!coordenadasValidas(valor)) throw new Error('La ubicación del mapa debe tener latitud y longitud válidas.');
  return { latitud: valor.latitud, longitud: valor.longitud };
}
export function leerMensajeMapa(valor: unknown): MensajeMapa | null {
  let mensaje = valor;
  if (typeof mensaje === 'string') {
    if (mensaje.length > 2000) return null;
    try { mensaje = JSON.parse(mensaje); } catch { return null; }
  }
  if (!mensaje || typeof mensaje !== 'object') return null;
  const m = mensaje as MensajeMapa;
  if (m.canal !== 'findyp-mapa-v1') return null;
  if (m.tipo === 'seleccion') {
    if (!coordenadasValidas(m.coordenadas)) return null;
    return { canal: m.canal, tipo: m.tipo, coordenadas: { latitud: m.coordenadas.latitud, longitud: m.coordenadas.longitud } };
  }
  return ['listo', 'error_tiles', 'tiles_listos'].includes(m.tipo) ? { canal: m.canal, tipo: m.tipo } : null;
}
export function textoCoordenadas(p: CoordenadasMapa): string {
  return `${p.latitud.toFixed(6)}, ${p.longitud.toFixed(6)}`;
}
