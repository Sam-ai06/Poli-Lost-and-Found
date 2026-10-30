import * as ImagePicker from 'expo-image-picker';

export async function seleccionarImagen(): Promise<string | null> {
  const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
  return resultado.canceled ? null : resultado.assets[0]?.uri ?? null;
}
