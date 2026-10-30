import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Icono } from '@/components/icono';
import { Marca } from '@/constants/theme';
import { resolverFuenteImagen } from '@/data/mock/imagenes';
import type { ObjetoEncontrado } from '@/types/findyp';
import { ETIQUETAS_CATEGORIA } from '@/utils/formato';

const ETIQUETA_TIPO = { fotografia: 'Fotografía', referencia: 'Imagen de referencia' } as const;

interface ImagenObjetoProps {
  objeto: Pick<ObjetoEncontrado, 'imagen_url' | 'tipo_imagen' | 'categoria' | 'titulo'>;
  /** Alto máximo en píxeles; el ancho ocupa todo el contenedor con proporción 4:3. */
  altoMaximo: number;
}

/** Imagen del objeto con su etiqueta de tipo. Sin imagen, muestra un marcador por categoría. */
export function ImagenObjeto({ objeto, altoMaximo }: ImagenObjetoProps) {
  const fuente = objeto.imagen_url ? resolverFuenteImagen(objeto.imagen_url) : null;

  return (
    <View style={[styles.contenedor, { maxHeight: altoMaximo }]}>
      {fuente ? (
        <Image
          source={fuente}
          accessibilityLabel={objeto.titulo}
          contentFit="cover"
          transition={150}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={styles.marcador}>
          <Icono nombre="imagen" tamano={36} color={Marca.colores.primarioBorde} />
          <Text style={styles.textoMarcador}>{ETIQUETAS_CATEGORIA[objeto.categoria]}</Text>
        </View>
      )}
      {objeto.tipo_imagen ? (
        <View style={styles.etiqueta}>
          <Text style={styles.textoEtiqueta}>{ETIQUETA_TIPO[objeto.tipo_imagen]}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    width: '100%',
    aspectRatio: 4 / 3,
    overflow: 'hidden',
    borderRadius: Marca.radios.medio,
    backgroundColor: Marca.colores.imagenFondo,
  },
  marcador: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  textoMarcador: { fontSize: 13, color: Marca.colores.textoSecundario },
  etiqueta: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: Marca.radios.pequeno,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  textoEtiqueta: { fontSize: 13, fontWeight: '500', color: Marca.colores.texto },
});
