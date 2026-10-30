import type { FiltrosObjetos, ObjetoEncontrado, RangoFecha } from '@/types/findyp';

const DIAS_POR_RANGO: Record<Exclude<RangoFecha, 'todas'>, number> = {
  ultimos_7: 7,
  ultimos_30: 30,
};

const MS_POR_DIA = 24 * 60 * 60 * 1000;

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function cumpleRangoFecha(fecha: string | null, rango: RangoFecha, hoy: Date): boolean {
  if (rango === 'todas') return true;
  if (!fecha) return false;
  const diferencia = hoy.getTime() - new Date(`${fecha}T00:00:00`).getTime();
  return diferencia >= 0 && diferencia <= DIAS_POR_RANGO[rango] * MS_POR_DIA;
}

/** Filtra en memoria. Lo usa el proveedor mock; Supabase filtrará en el servidor. */
export function filtrarObjetos(
  objetos: ObjetoEncontrado[],
  filtros: FiltrosObjetos = {},
  hoy: Date = new Date()
): ObjetoEncontrado[] {
  const texto = normalizar(filtros.texto ?? '');

  return objetos.filter((objeto) => {
    if (filtros.categoria && objeto.categoria !== filtros.categoria) return false;
    if (filtros.estado && objeto.estado !== filtros.estado) return false;
    if (filtros.lugar && objeto.lugar_hallazgo !== filtros.lugar) return false;
    if (!cumpleRangoFecha(objeto.fecha_hallazgo, filtros.rangoFecha ?? 'todas', hoy)) return false;
    if (!texto) return true;

    const contenido = [objeto.titulo, objeto.descripcion, objeto.color, objeto.lugar_hallazgo]
      .filter((valor): valor is string => Boolean(valor))
      .map(normalizar)
      .join(' ');
    return contenido.includes(texto);
  });
}
