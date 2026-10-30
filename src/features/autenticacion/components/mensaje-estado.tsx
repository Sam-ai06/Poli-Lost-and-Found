import { StyleSheet, Text, View } from 'react-native';

import { Icono } from '@/components/icono';
import { Marca } from '@/constants/theme';

const TONOS = {
  error: { fondo: Marca.colores.errorSuave, texto: Marca.colores.error, icono: 'alerta' },
  exito: { fondo: Marca.colores.exitoSuave, texto: Marca.colores.exito, icono: 'verificado' },
  info: { fondo: Marca.colores.primarioSuave, texto: Marca.colores.primario, icono: 'universidad' },
} as const;

interface MensajeEstadoProps {
  tipo: keyof typeof TONOS;
  texto: string;
}

/** Aviso destacado. Los errores se anuncian de inmediato a los lectores de pantalla. */
export function MensajeEstado({ tipo, texto }: MensajeEstadoProps) {
  const tono = TONOS[tipo];
  return (
    <View
      accessibilityRole={tipo === 'error' ? 'alert' : undefined}
      accessibilityLiveRegion={tipo === 'error' ? 'assertive' : 'polite'}
      style={[styles.contenedor, { backgroundColor: tono.fondo }]}>
      <Icono nombre={tono.icono} tamano={20} color={tono.texto} />
      <Text style={[styles.texto, { color: tono.texto }]}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: Marca.radios.medio,
  },
  texto: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '500' },
});
