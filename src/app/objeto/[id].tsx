import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { Encabezado } from '@/components/encabezado';
import { EstadoVista } from '@/components/estado-vista';
import { FilaDato } from '@/components/fila-dato';
import { ImagenObjeto } from '@/components/imagen-objeto';
import { InsigniaEstado } from '@/components/insignia';
import { Pantalla } from '@/components/pantalla';
import { Marca } from '@/constants/theme';
import { useObjeto } from '@/hooks/use-objetos';
import { ETIQUETAS_CATEGORIA, formatearFecha } from '@/utils/formato';

/** Detalle completo de un objeto encontrado. */
export default function DetalleObjetoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { datos: objeto, cargando, error, recargar } = useObjeto(id);

  const contenido = (() => {
    if (error) return <EstadoVista tipo="error" mensaje={error} onReintentar={recargar} />;
    if (cargando && !objeto) return <EstadoVista tipo="cargando" />;
    if (!objeto) {
      return (
        <EstadoVista
          tipo="vacio"
          titulo="Objeto no encontrado"
          mensaje="Es posible que la publicación haya sido retirada."
        />
      );
    }

    return (
      <>
        <ScrollView contentContainerStyle={styles.cuerpo}>
          <ImagenObjeto objeto={objeto} altoMaximo={360} />
          <View style={styles.resumen}>
            <InsigniaEstado estado={objeto.estado} />
            <Text style={styles.titulo}>{objeto.titulo}</Text>
            {objeto.descripcion ? <Text style={styles.descripcion}>{objeto.descripcion}</Text> : null}
          </View>
          <View>
            <FilaDato icono="ubicacion" etiqueta="Encontrado en" valor={objeto.lugar_hallazgo} />
            <FilaDato
              icono="calendario"
              etiqueta="Fecha del hallazgo"
              valor={formatearFecha(objeto.fecha_hallazgo)}
            />
            <FilaDato icono="entrega" etiqueta="Punto de entrega" valor={objeto.punto_entrega} />
            <FilaDato
              icono="categoria"
              etiqueta="Categoría"
              valor={ETIQUETAS_CATEGORIA[objeto.categoria]}
            />
            <FilaDato icono="color" etiqueta="Color" valor={objeto.color} />
          </View>
        </ScrollView>

        {/* Punto de integración: el flujo de recuperación lo implementa el Participante 2. */}
        <View style={styles.pie}>
          <Boton
            etiqueta={
              objeto.estado === 'disponible' ? 'Solicitar recuperación' : 'No disponible para recuperar'
            }
            deshabilitado={objeto.estado !== 'disponible'}
            onPress={() =>
              router.push({ pathname: '/recuperacion/[objetoId]', params: { objetoId: objeto.id } })
            }
          />
        </View>
      </>
    );
  })();

  return (
    <Pantalla>
      <Encabezado titulo="Objetos perdidos" regresarA="Explorar" />
      {contenido}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  cuerpo: { padding: 16, gap: 20 },
  resumen: { gap: 10, paddingHorizontal: 4 },
  titulo: { fontSize: 34, fontWeight: '800', color: Marca.colores.texto },
  descripcion: { fontSize: 18, color: Marca.colores.textoSecundario },
  pie: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Marca.colores.borde,
    backgroundColor: Marca.colores.fondo,
  },
});
