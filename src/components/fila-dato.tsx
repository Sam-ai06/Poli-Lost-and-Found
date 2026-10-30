import { StyleSheet, Text, View } from 'react-native';

import { Icono, type NombreIcono } from '@/components/icono';
import { Marca } from '@/constants/theme';

interface FilaDatoProps {
  icono: NombreIcono;
  etiqueta: string;
  valor: string | null;
}

/** Fila de información del detalle. Los valores `null` se muestran como "No indicado". */
export function FilaDato({ icono, etiqueta, valor }: FilaDatoProps) {
  return (
    <View style={styles.fila}>
      <Icono nombre={icono} tamano={26} color={Marca.colores.texto} />
      <View style={styles.textos}>
        <Text style={styles.etiqueta}>{etiqueta}</Text>
        <Text style={[styles.valor, !valor && styles.sinValor]}>{valor ?? 'No indicado'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Marca.colores.borde,
  },
  textos: { flex: 1, gap: 2 },
  etiqueta: { fontSize: 15, color: Marca.colores.textoSecundario },
  valor: { fontSize: 18, color: Marca.colores.texto },
  sinValor: { color: Marca.colores.textoSecundario, fontStyle: 'italic' },
});
