import { StyleSheet, Text, View } from 'react-native';

import { Icono } from '@/components/icono';
import { Marca } from '@/constants/theme';

import { requisitosContrasena } from '../domain/validacion';

/** Lista de requisitos que se actualiza mientras el usuario escribe. */
export function RequisitosContrasena({ contrasena }: { contrasena: string }) {
  return (
    <View accessibilityLabel="Requisitos de la contraseña" style={styles.lista}>
      {requisitosContrasena(contrasena).map(({ id, descripcion, cumple }) => (
        <View
          key={id}
          accessible
          accessibilityLabel={`${cumple ? 'Cumplido' : 'Pendiente'}: ${descripcion}`}
          style={styles.fila}>
          <Icono
            nombre={cumple ? 'verificado' : 'pendiente'}
            tamano={16}
            color={cumple ? Marca.colores.exito : Marca.colores.textoSecundario}
          />
          <Text style={[styles.texto, cumple && styles.cumple]}>{descripcion}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  lista: { gap: 4, marginTop: -6 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  texto: { fontSize: 14, color: Marca.colores.textoSecundario },
  cumple: { color: Marca.colores.exito },
});
