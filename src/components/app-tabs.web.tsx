import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  type TabListProps,
  type TabTriggerSlotProps,
} from 'expo-router/ui';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icono, type NombreIcono } from '@/components/icono';
import { Marca, MaxContentWidth } from '@/constants/theme';

export default function AppTabs() {
  return (
    <Tabs style={styles.contenedor}>
      <TabSlot style={styles.contenido} />
      <TabList asChild>
        <BarraTabs>
          <TabTrigger name="index" href="/" asChild>
            <TabButton icono="buscar">Explorar</TabButton>
          </TabTrigger>
          <TabTrigger name="reportes" href="/reportes" asChild>
            <TabButton icono="reportes">Mis reportes</TabButton>
          </TabTrigger>
          <TabTrigger name="perfil" href="/perfil" asChild>
            <TabButton icono="perfil">Perfil</TabButton>
          </TabTrigger>
        </BarraTabs>
      </TabList>
    </Tabs>
  );
}

/** Los TabTrigger deben ser hijos directos de este componente para que TabList los registre. */
function BarraTabs({ children, ...props }: TabListProps) {
  return (
    <View {...props} style={styles.barra}>
      <View style={styles.barraInterna}>{children}</View>
    </View>
  );
}

type TabButtonProps = Omit<TabTriggerSlotProps, 'ref'> & { icono: NombreIcono; children: string };

export function TabButton({ icono, children, isFocused, ...props }: TabButtonProps) {
  const color = isFocused ? Marca.colores.primario : Marca.colores.textoSecundario;
  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      style={({ pressed }) => [styles.boton, pressed && styles.presionado]}>
      <Icono nombre={icono} tamano={26} color={color} />
      <Text style={[styles.etiqueta, { color }]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: Marca.colores.fondoPagina },
  contenido: { flex: 1 },
  barra: {
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: Marca.colores.borde,
    backgroundColor: Marca.colores.fondo,
  },
  barraInterna: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    paddingVertical: 8,
  },
  boton: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 4 },
  presionado: { opacity: 0.7 },
  etiqueta: { fontSize: 14 },
});
