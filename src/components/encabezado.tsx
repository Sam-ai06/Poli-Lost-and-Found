import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icono } from '@/components/icono';
import { Marca } from '@/constants/theme';

interface EncabezadoProps {
  titulo: string;
  /** Muestra el botón de regreso con este texto (por ejemplo, "Explorar"). */
  regresarA?: string;
  accion?: ReactNode;
}

export function Encabezado({ titulo, regresarA, accion }: EncabezadoProps) {
  const regresar = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View style={styles.contenedor}>
      {regresarA !== undefined ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Regresar a ${regresarA}`}
          onPress={regresar}
          hitSlop={8}
          style={styles.regresar}>
          <Icono nombre="atras" tamano={20} color={Marca.colores.primario} />
          {regresarA ? <Text style={styles.textoRegresar}>{regresarA}</Text> : null}
        </Pressable>
      ) : null}
      <Text accessibilityRole="header" numberOfLines={1} style={styles.titulo}>
        {titulo}
      </Text>
      {accion}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    minHeight: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: Marca.colores.borde,
    backgroundColor: Marca.colores.fondo,
  },
  regresar: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  textoRegresar: { fontSize: 17, color: Marca.colores.primario },
  titulo: { flex: 1, fontSize: 20, fontWeight: '700', color: Marca.colores.texto },
});
