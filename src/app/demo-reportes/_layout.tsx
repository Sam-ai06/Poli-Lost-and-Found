import { Stack } from 'expo-router';
import { Marca } from '@/constants/theme';

export default function ReportesLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Marca.colores.fondoPagina }, headerTintColor: Marca.colores.primario, headerBackTitle: 'Atrás' }}>
    <Stack.Screen name="index" options={{ headerShown: false }} />
    <Stack.Screen name="publicar" options={{ title: 'Objeto encontrado' }} />
    <Stack.Screen name="buscar" options={{ title: 'Mi búsqueda' }} />
    <Stack.Screen name="coincidencias" options={{ title: 'Posibles coincidencias' }} />
    <Stack.Screen name="demo" options={{ title: 'Demostración' }} />
    <Stack.Screen name="reclamaciones" options={{ title: 'Reclamaciones' }} />
    <Stack.Screen name="recuperar" options={{ title: 'Recuperar objeto' }} />
  </Stack>;
}
