import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { Marca } from '@/constants/theme';

export function LogoApp({ tamano = 76 }: { tamano?: number }) {
  return (
    <Image
      source={require('../../../../assets/images/logo-findyp.jpeg')}
      contentFit="contain"
      accessibilityLabel="Logo de Findyp"
      style={[styles.imagen, { width: tamano, height: tamano }]}
    />
  );
}

const styles = StyleSheet.create({
  imagen: { borderRadius: Marca.radios.grande },
});
