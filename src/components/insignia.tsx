import { StyleSheet, Text, View } from 'react-native';

import { Marca } from '@/constants/theme';
import type { EstadoObjeto, NivelSimilitud } from '@/types/findyp';
import { ETIQUETAS_ESTADO, ETIQUETAS_SIMILITUD } from '@/utils/formato';

interface Tono {
  fondo: string;
  texto: string;
  punto: string;
}

const { colores } = Marca;

const TONO_ESTADO: Record<EstadoObjeto, Tono> = {
  disponible: { fondo: colores.exitoSuave, texto: colores.exito, punto: colores.exitoPunto },
  en_recuperacion: {
    fondo: colores.advertenciaSuave,
    texto: colores.advertencia,
    punto: colores.advertencia,
  },
  entregado: { fondo: colores.neutroSuave, texto: colores.neutro, punto: colores.neutro },
};

const TONO_SIMILITUD: Record<NivelSimilitud | 'sin_dato', Tono> = {
  alta: { fondo: colores.exitoSuave, texto: colores.exito, punto: colores.exitoPunto },
  media: { fondo: colores.advertenciaSuave, texto: colores.advertencia, punto: colores.advertencia },
  baja: { fondo: colores.neutroSuave, texto: colores.neutro, punto: colores.neutro },
  sin_dato: { fondo: colores.neutroSuave, texto: colores.neutro, punto: colores.borde },
};

function Insignia({ etiqueta, tono }: { etiqueta: string; tono: Tono }) {
  return (
    <View style={[styles.contenedor, { backgroundColor: tono.fondo }]}>
      <View style={[styles.punto, { backgroundColor: tono.punto }]} />
      <Text style={[styles.texto, { color: tono.texto }]}>{etiqueta}</Text>
    </View>
  );
}

export function InsigniaEstado({ estado }: { estado: EstadoObjeto }) {
  return <Insignia etiqueta={ETIQUETAS_ESTADO[estado]} tono={TONO_ESTADO[estado]} />;
}

/** Muestra el nivel recibido del módulo de matching; `null` significa sin determinar. */
export function InsigniaSimilitud({ nivel }: { nivel: NivelSimilitud | null }) {
  return nivel ? (
    <Insignia etiqueta={ETIQUETAS_SIMILITUD[nivel]} tono={TONO_SIMILITUD[nivel]} />
  ) : (
    <Insignia etiqueta="Similitud sin determinar" tono={TONO_SIMILITUD.sin_dato} />
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: Marca.radios.pildora,
  },
  punto: { width: 9, height: 9, borderRadius: 5 },
  texto: { fontSize: 14, fontWeight: '500' },
});
