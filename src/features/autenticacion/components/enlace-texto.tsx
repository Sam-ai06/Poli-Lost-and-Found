import { Pressable, StyleSheet, Text } from 'react-native';

import { Marca } from '@/constants/theme';

interface EnlaceTextoProps {
  texto: string;
  onPress: () => void;
  prefijo?: string;
}

/** Enlace de texto con área táctil de al menos 44 px. */
export function EnlaceTexto({ texto, onPress, prefijo }: EnlaceTextoProps) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={prefijo ? `${prefijo} ${texto}` : texto}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.area, pressed && styles.presionado]}>
      <Text style={styles.texto}>
        {prefijo ? <Text style={styles.prefijo}>{prefijo} </Text> : null}
        <Text style={styles.enlace}>{texto}</Text>
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  area: { minHeight: 44, justifyContent: 'center', alignSelf: 'center' },
  presionado: { opacity: 0.6 },
  texto: { fontSize: 15, textAlign: 'center' },
  prefijo: { color: Marca.colores.textoSecundario },
  enlace: { color: Marca.colores.primario, fontWeight: '700', textDecorationLine: 'underline' },
});
