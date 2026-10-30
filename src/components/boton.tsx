import { Pressable, StyleSheet, Text } from 'react-native';

import { Icono, type NombreIcono } from '@/components/icono';
import { Marca } from '@/constants/theme';

interface BotonProps {
  etiqueta: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario';
  icono?: NombreIcono;
  compacto?: boolean;
  deshabilitado?: boolean;
}

export function Boton({
  etiqueta,
  onPress,
  variante = 'primario',
  icono,
  compacto = false,
  deshabilitado = false,
}: BotonProps) {
  const esPrimario = variante === 'primario';
  const colorTexto = esPrimario ? Marca.colores.fondo : Marca.colores.primario;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: deshabilitado }}
      disabled={deshabilitado}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        compacto && styles.compacto,
        esPrimario ? styles.primario : styles.secundario,
        pressed && (esPrimario ? styles.primarioPresionado : styles.secundarioPresionado),
        deshabilitado && styles.deshabilitado,
      ]}>
      {icono ? <Icono nombre={icono} tamano={compacto ? 18 : 22} color={colorTexto} /> : null}
      <Text style={[styles.texto, compacto && styles.textoCompacto, { color: colorTexto }]}>
        {etiqueta}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingHorizontal: 20,
    borderRadius: Marca.radios.medio,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  compacto: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: Marca.radios.pequeno,
    gap: 6,
  },
  primario: { backgroundColor: Marca.colores.primario },
  primarioPresionado: { backgroundColor: Marca.colores.primarioPresionado },
  secundario: {
    backgroundColor: Marca.colores.fondo,
    borderWidth: 1.5,
    borderColor: Marca.colores.primarioBorde,
  },
  secundarioPresionado: { backgroundColor: Marca.colores.primarioSuave },
  deshabilitado: { opacity: 0.45 },
  texto: { fontSize: 17, fontWeight: '600' },
  textoCompacto: { fontSize: 15 },
});
