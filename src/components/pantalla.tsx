import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Marca, MaxContentWidth } from '@/constants/theme';

/** Contenedor base de cada pantalla: área segura, fondo y ancho máximo centrado. */
export function Pantalla({ children }: PropsWithChildren) {
  return (
    <SafeAreaView edges={['top']} style={styles.areaSegura}>
      <View style={styles.contenido}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  areaSegura: { flex: 1, backgroundColor: Marca.colores.fondoPagina },
  contenido: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    backgroundColor: Marca.colores.fondo,
  },
});
