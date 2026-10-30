import * as Location from 'expo-location';
import type { UbicacionActual } from './types';

export async function obtenerUbicacionActual(): Promise<UbicacionActual> {
  const permiso = await Location.requestForegroundPermissionsAsync();
  if (!permiso.granted) throw new Error('No hay permiso de ubicación. Puedes elegir el punto manualmente en el mapa.');
  if (!await Location.hasServicesEnabledAsync()) throw new Error('La ubicación del teléfono está desactivada. Puedes seleccionar el lugar manualmente.');
  let temporizador: ReturnType<typeof setTimeout> | undefined;
  try {
    const p = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise<never>((_, reject) => { temporizador = setTimeout(() => reject(new Error('No se pudo obtener tu ubicación a tiempo. Elige un punto en el mapa.')), 15000); }),
    ]);
    return { latitud: p.coords.latitude, longitud: p.coords.longitude, precision: Number.isFinite(p.coords.accuracy) && p.coords.accuracy !== null ? p.coords.accuracy : null };
  } finally { clearTimeout(temporizador); }
}
