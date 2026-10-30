import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { Icono } from '@/components/icono';
import { Marca } from '@/constants/theme';

type EstadoVistaProps =
  | { tipo: 'cargando'; mensaje?: string }
  | { tipo: 'vacio'; titulo: string; mensaje?: string }
  | { tipo: 'error'; mensaje: string; onReintentar: () => void };

/** Estados de carga, ausencia de resultados y error, compartidos por todas las vistas. */
export function EstadoVista(props: EstadoVistaProps) {
  if (props.tipo === 'cargando') {
    return (
      <View style={styles.contenedor} accessibilityLiveRegion="polite">
        <ActivityIndicator size="large" color={Marca.colores.primario} />
        <Text style={styles.mensaje}>{props.mensaje ?? 'Cargando...'}</Text>
      </View>
    );
  }

  if (props.tipo === 'vacio') {
    return (
      <View style={styles.contenedor}>
        <Icono nombre="vacio" tamano={40} color={Marca.colores.textoSecundario} />
        <Text style={styles.titulo}>{props.titulo}</Text>
        {props.mensaje ? <Text style={styles.mensaje}>{props.mensaje}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.contenedor} accessibilityRole="alert">
      <Icono nombre="alerta" tamano={40} color={Marca.colores.error} />
      <Text style={styles.titulo}>No se pudo cargar la información</Text>
      <Text style={styles.mensaje}>{props.mensaje}</Text>
      <Boton etiqueta="Reintentar" variante="secundario" compacto onPress={props.onReintentar} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  titulo: { fontSize: 17, fontWeight: '600', textAlign: 'center', color: Marca.colores.texto },
  mensaje: { fontSize: 15, textAlign: 'center', color: Marca.colores.textoSecundario },
});
