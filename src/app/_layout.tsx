import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import '@/lib/supabase';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync();

/**
 * Navegación raíz: las pestañas viven en el grupo (tabs) y las vistas de detalle se
 * apilan encima. Las rutas de otros participantes se registran aquí como marcadores.
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="objeto/[id]" />
        <Stack.Screen name="coincidencias/[busquedaId]" />
        <Stack.Screen name="publicar" />
        <Stack.Screen name="buscar" />
        <Stack.Screen name="recuperacion/[objetoId]" />
      </Stack>
    </ThemeProvider>
  );
}
