import type { Categoria, EstadoObjeto, NivelSimilitud, RangoFecha } from '@/types/findyp';

export const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  documentos: 'Documentos',
  llaves: 'Llaves',
  electronica: 'Electrónica',
  botellas_termos: 'Botellas y termos',
  ropa: 'Ropa',
  otros: 'Otros',
};

export const ETIQUETAS_ESTADO: Record<EstadoObjeto, string> = {
  disponible: 'Disponible',
  en_recuperacion: 'En recuperación',
  entregado: 'Entregado',
};

export const ETIQUETAS_SIMILITUD: Record<NivelSimilitud, string> = {
  alta: 'Similitud alta',
  media: 'Similitud media',
  baja: 'Similitud baja',
};

export const ETIQUETAS_RANGO_FECHA: Record<RangoFecha, string> = {
  todas: 'Cualquier fecha',
  ultimos_7: 'Últimos 7 días',
  ultimos_30: 'Últimos 30 días',
};

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** `2026-10-30` → `30 oct 2026`. Devuelve `null` si la fecha no es válida. */
export function formatearFecha(fechaIso: string | null): string | null {
  const coincidencia = fechaIso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!coincidencia) return null;
  const [, anio, mes, dia] = coincidencia;
  const nombreMes = MESES[Number(mes) - 1];
  return nombreMes ? `${Number(dia)} ${nombreMes} ${anio}` : null;
}
