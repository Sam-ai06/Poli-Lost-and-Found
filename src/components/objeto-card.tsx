import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icono } from '@/components/icono';
import { ImagenObjeto } from '@/components/imagen-objeto';
import { InsigniaEstado } from '@/components/insignia';
import { Marca, SombraTarjeta } from '@/constants/theme';
import type { ObjetoEncontrado } from '@/types/findyp';
import { ETIQUETAS_CATEGORIA, formatearFecha } from '@/utils/formato';

interface ObjetoCardProps {
  objeto: ObjetoEncontrado;
  onVerDetalle: (id: string) => void;
  /** Contenido adicional, por ejemplo el nivel de similitud de una coincidencia. */
  complemento?: ReactNode;
}

export function ObjetoCard({ objeto, onVerDetalle, complemento }: ObjetoCardProps) {
  const fecha = formatearFecha(objeto.fecha_hallazgo);

  return (
    <View style={[styles.tarjeta, SombraTarjeta]}>
      <ImagenObjeto objeto={objeto} altoMaximo={240} />
      {complemento ? <View style={styles.complemento}>{complemento}</View> : null}

      <View style={styles.cabecera}>
        <Text numberOfLines={2} style={styles.titulo}>
          {objeto.titulo}
        </Text>
        <InsigniaEstado estado={objeto.estado} />
      </View>
      <Text numberOfLines={2} style={styles.descripcion}>
        {objeto.descripcion ?? ETIQUETAS_CATEGORIA[objeto.categoria]}
      </Text>

      <View style={styles.metadatos}>
        <View style={styles.dato}>
          <Icono nombre="ubicacion" tamano={18} color={Marca.colores.textoSecundario} />
          <Text numberOfLines={1} style={styles.textoDato}>
            {objeto.lugar_hallazgo ?? 'Lugar no indicado'}
          </Text>
        </View>
        <View style={styles.dato}>
          <Icono nombre="calendario" tamano={18} color={Marca.colores.textoSecundario} />
          <Text style={styles.textoDato}>{fecha ?? 'Sin fecha'}</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver detalle de ${objeto.titulo}`}
        onPress={() => onVerDetalle(objeto.id)}
        style={({ pressed }) => [styles.botonDetalle, pressed && styles.botonPresionado]}>
        <Text style={styles.textoBoton}>Ver detalle</Text>
        <Icono nombre="siguiente" tamano={18} color={Marca.colores.texto} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flex: 1,
    padding: 12,
    gap: 6,
    borderRadius: Marca.radios.grande,
    borderWidth: 1,
    borderColor: Marca.colores.borde,
    backgroundColor: Marca.colores.fondo,
  },
  complemento: { marginTop: 4 },
  cabecera: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  titulo: { flex: 1, fontSize: 19, fontWeight: '700', color: Marca.colores.texto },
  descripcion: { fontSize: 15, color: Marca.colores.textoSecundario },
  metadatos: {
    marginTop: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  dato: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  textoDato: { fontSize: 15, color: Marca.colores.textoSecundario },
  botonDetalle: {
    marginTop: 8,
    minHeight: 44,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Marca.radios.pequeno,
    borderWidth: 1,
    borderColor: Marca.colores.borde,
  },
  botonPresionado: { backgroundColor: Marca.colores.neutroSuave },
  textoBoton: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600', color: Marca.colores.texto },
});
