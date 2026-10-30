import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Icono } from '@/components/icono';
import { Institucion } from '@/constants/institucion';
import { Marca } from '@/constants/theme';

/** Logo de la universidad. Sin logo configurado muestra un espacio reservado. */
export function LogoInstitucional({ tamano = 76 }: { tamano?: number }) {
  if (Institucion.logo) {
    return (
      <View style={[styles.marco, { width: tamano, height: tamano }]}>
        <Image
          source={Institucion.logo}
          contentFit="contain"
          accessibilityLabel={`Logo de ${Institucion.nombre}`}
          style={styles.imagen}
        />
      </View>
    );
  }

  return (
    <View
      accessible
      accessibilityLabel="Espacio reservado para el logo de la universidad"
      style={[styles.marco, styles.reservado, { width: tamano, height: tamano }]}>
      <Icono nombre="imagen" tamano={26} color={Marca.colores.textoSuaveSobrePrimario} />
      <Text style={styles.texto}>Tu logo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  marco: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: Marca.radios.grande,
    backgroundColor: Marca.colores.fondo,
  },
  imagen: { width: '100%', height: '100%' },
  reservado: {
    gap: 2,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Marca.colores.textoSuaveSobrePrimario,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  texto: { fontSize: 12, fontWeight: '600', color: Marca.colores.textoSuaveSobrePrimario },
});
