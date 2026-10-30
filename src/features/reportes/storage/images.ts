import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

export async function seleccionarImagen(): Promise<string | null> {
  const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permiso.granted) throw new Error('No hay permiso para acceder a tus fotos. Puedes habilitarlo en los ajustes del teléfono.');
  const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
  if (resultado.canceled || !resultado.assets[0]) return null;
  const imagen = resultado.assets[0];
  const carpeta = new Directory(Paths.document, 'reportes-imagenes');
  carpeta.create({ idempotent: true, intermediates: true });
  const extension = imagen.fileName?.match(/\.(jpg|jpeg|png|heic|webp)$/i)?.[1] ?? 'jpg';
  const destino = new File(carpeta, `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`);
  await new File(imagen.uri).copy(destino);
  return destino.uri;
}
