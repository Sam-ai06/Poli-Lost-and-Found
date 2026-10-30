import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Encabezado } from '@/components/encabezado';
import { Icono } from '@/components/icono';
import { Pantalla } from '@/components/pantalla';
import { Marca } from '@/constants/theme';

interface ModuloPendienteProps {
  titulo: string;
  responsable: string;
  descripcion: string;
  regresarA?: string;
  children?: ReactNode;
}

/** Marcador de una ruta cuyo contenido implementará otro participante. */
export function ModuloPendiente({
  titulo,
  responsable,
  descripcion,
  regresarA,
  children,
}: ModuloPendienteProps) {
  return (
    <Pantalla>
      <Encabezado titulo={titulo} regresarA={regresarA} />
      <View style={styles.cuerpo}>
        <Icono nombre="construccion" tamano={40} color={Marca.colores.primario} />
        <Text style={styles.titulo}>Módulo en desarrollo</Text>
        <Text style={styles.texto}>{descripcion}</Text>
        <Text style={styles.responsable}>Responsable: {responsable}</Text>
        {children}
      </View>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  cuerpo: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  titulo: { fontSize: 20, fontWeight: '700', color: Marca.colores.texto },
  texto: { fontSize: 15, textAlign: 'center', color: Marca.colores.textoSecundario },
  responsable: { fontSize: 14, fontWeight: '600', color: Marca.colores.primario },
});
