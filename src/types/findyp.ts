/**
 * Modelos de dominio de Findyp.
 *
 * PROVISIONAL: `docs/contrato-datos.md` aún no existe. Los enums siguen los valores
 * acordados por el equipo; los nombres de campos marcados con @pendiente deben
 * validarse con el Participante 3 cuando se publique el contrato. Si cambian, solo
 * deben ajustarse este archivo y los proveedores de datos (src/services), no los
 * componentes visuales.
 */

export const CATEGORIAS = [
  'documentos',
  'llaves',
  'electronica',
  'botellas_termos',
  'ropa',
  'otros',
] as const;
export type Categoria = (typeof CATEGORIAS)[number];

export const TIPOS_IMAGEN = ['fotografia', 'referencia'] as const;
export type TipoImagen = (typeof TIPOS_IMAGEN)[number];

export const ESTADOS_OBJETO = ['disponible', 'en_recuperacion', 'entregado'] as const;
export type EstadoObjeto = (typeof ESTADOS_OBJETO)[number];

export const ESTADOS_BUSQUEDA = ['activa', 'resuelta', 'cerrada'] as const;
export type EstadoBusqueda = (typeof ESTADOS_BUSQUEDA)[number];

export const ESTADOS_SOLICITUD = ['pendiente', 'aprobada', 'rechazada', 'entregada'] as const;
export type EstadoSolicitud = (typeof ESTADOS_SOLICITUD)[number];

export const NIVELES_SIMILITUD = ['alta', 'media', 'baja'] as const;
export type NivelSimilitud = (typeof NIVELES_SIMILITUD)[number];

/** Objeto encontrado y publicado. Los valores desconocidos se representan con `null`. */
export interface ObjetoEncontrado {
  id: string;
  /** @pendiente nombre de campo por validar con el contrato. */
  titulo: string;
  descripcion: string | null;
  categoria: Categoria;
  /** @pendiente nombre de campo por validar con el contrato. */
  color: string | null;
  /** @pendiente URL pública de Supabase Storage; nombre por validar. */
  imagen_url: string | null;
  tipo_imagen: TipoImagen | null;
  /** @pendiente nombre de campo por validar con el contrato. */
  lugar_hallazgo: string | null;
  /** Fecha ISO `AAAA-MM-DD`. @pendiente nombre de campo por validar. */
  fecha_hallazgo: string | null;
  /** @pendiente nombre de campo por validar con el contrato. */
  punto_entrega: string | null;
  estado: EstadoObjeto;
}

/**
 * Coincidencia entregada por el módulo de matching (Participante 4) junto con el
 * objeto candidato. @pendiente estructura por validar con el contrato.
 */
export interface CoincidenciaDetallada {
  id: string;
  busqueda_id: string;
  nivel_similitud: NivelSimilitud | null;
  objeto: ObjetoEncontrado;
}

export type RangoFecha = 'todas' | 'ultimos_7' | 'ultimos_30';

export interface FiltrosObjetos {
  texto?: string;
  categoria?: Categoria | null;
  estado?: EstadoObjeto | null;
  lugar?: string | null;
  rangoFecha?: RangoFecha;
}
