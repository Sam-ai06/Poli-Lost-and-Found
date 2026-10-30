import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { Marca } from '@/constants/theme';

export interface OpcionChip<T extends string> {
  valor: T | null;
  etiqueta: string;
}

interface ChipsFiltroProps<T extends string> {
  opciones: OpcionChip<T>[];
  seleccionado: T | null;
  onCambiar: (valor: T | null) => void;
  etiquetaAccesible: string;
}

/** Fila horizontal de opciones de selección única. `null` representa "Todos". */
export function ChipsFiltro<T extends string>({
  opciones,
  seleccionado,
  onCambiar,
  etiquetaAccesible,
}: ChipsFiltroProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel={etiquetaAccesible}
      contentContainerStyle={styles.fila}>
      {opciones.map(({ valor, etiqueta }) => {
        const activo = valor === seleccionado;
        return (
          <Pressable
            key={valor ?? 'todos'}
            accessibilityRole="button"
            accessibilityState={{ selected: activo }}
            onPress={() => onCambiar(valor)}
            style={[styles.chip, activo && styles.chipActivo]}>
            <Text style={[styles.texto, activo && styles.textoActivo]}>{etiqueta}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fila: { gap: 8, paddingHorizontal: 20 },
  chip: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: Marca.radios.pildora,
    borderWidth: 1,
    borderColor: Marca.colores.borde,
    backgroundColor: Marca.colores.fondo,
  },
  chipActivo: { borderColor: Marca.colores.primarioSuave, backgroundColor: Marca.colores.primarioSuave },
  texto: { fontSize: 15, color: Marca.colores.texto },
  textoActivo: { color: Marca.colores.primario, fontWeight: '600' },
});
