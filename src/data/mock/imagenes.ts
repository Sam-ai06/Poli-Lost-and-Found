import type { ImageSource } from 'expo-image';

/** Módulo de imagen empaquetado (`require`) o URL remota. */
export type FuenteImagen = number | ImageSource;

/**
 * Imágenes de prueba empaquetadas con la app. Los datos mock usan URLs con el esquema
 * `mock://<clave>`; las URLs reales (por ejemplo, de Supabase Storage) se usan sin cambios.
 */
const IMAGENES_MOCK: Record<string, number> = {
  'termo-azul': require('@/assets/images/mock/termo-azul.jpg'),
  'llaves-llavero-rojo': require('@/assets/images/mock/llaves-llavero-rojo.jpg'),
  'estuche-audifonos': require('@/assets/images/mock/estuche-audifonos.jpg'),
  'billetera-cafe': require('@/assets/images/mock/billetera-cafe.jpg'),
  'calculadora-cientifica': require('@/assets/images/mock/calculadora-cientifica.jpg'),
  'cuaderno-verde': require('@/assets/images/mock/cuaderno-verde.jpg'),
  'gafas-negras': require('@/assets/images/mock/gafas-negras.jpg'),
  'cargador-blanco': require('@/assets/images/mock/cargador-blanco.jpg'),
  'mochila-negra': require('@/assets/images/mock/mochila-negra.jpg'),
  'botella-plateada': require('@/assets/images/mock/botella-plateada.jpg'),
  'paraguas-amarillo': require('@/assets/images/mock/paraguas-amarillo.jpg'),
  'gorra-azul': require('@/assets/images/mock/gorra-azul.jpg'),
};

const PREFIJO_MOCK = 'mock://';

/** Convierte `imagen_url` en una fuente de imagen. Devuelve `null` si la imagen mock no existe. */
export function resolverFuenteImagen(url: string): FuenteImagen | null {
  if (!url.startsWith(PREFIJO_MOCK)) return { uri: url };
  return IMAGENES_MOCK[url.slice(PREFIJO_MOCK.length)] ?? null;
}
