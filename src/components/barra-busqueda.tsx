import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Icono } from '@/components/icono';
import { Marca } from '@/constants/theme';

interface BarraBusquedaProps {
  valor: string;
  onCambiar: (texto: string) => void;
  filtrosAbiertos: boolean;
  onAlternarFiltros: () => void;
  filtrosActivos: number;
}

export function BarraBusqueda({
  valor,
  onCambiar,
  filtrosAbiertos,
  onAlternarFiltros,
  filtrosActivos,
}: BarraBusquedaProps) {
  const resaltado = filtrosAbiertos || filtrosActivos > 0;

  return (
    <View style={styles.contenedor}>
      <View style={styles.campo}>
        <Icono nombre="buscar" tamano={20} color={Marca.colores.textoSecundario} />
        <TextInput
          value={valor}
          onChangeText={onCambiar}
          placeholder="Buscar por descripción..."
          placeholderTextColor={Marca.colores.textoSecundario}
          accessibilityLabel="Buscar por descripción"
          returnKeyType="search"
          autoCorrect={false}
          style={styles.entrada}
        />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Más filtros${filtrosActivos ? `, ${filtrosActivos} activos` : ''}`}
        accessibilityState={{ expanded: filtrosAbiertos }}
        onPress={onAlternarFiltros}
        style={[styles.botonFiltros, resaltado && styles.botonFiltrosActivo]}>
        <Icono
          nombre="filtros"
          tamano={20}
          color={resaltado ? Marca.colores.primario : Marca.colores.textoSecundario}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flexDirection: 'row', gap: 8, paddingHorizontal: 20 },
  campo: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: Marca.radios.medio,
    borderWidth: 1,
    borderColor: Marca.colores.borde,
    backgroundColor: Marca.colores.fondo,
  },
  entrada: { flex: 1, minHeight: 44, fontSize: 16, color: Marca.colores.texto },
  botonFiltros: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Marca.radios.medio,
    borderWidth: 1,
    borderColor: Marca.colores.borde,
  },
  botonFiltrosActivo: {
    borderColor: Marca.colores.primarioBorde,
    backgroundColor: Marca.colores.primarioSuave,
  },
});
