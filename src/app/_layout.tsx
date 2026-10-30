import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { SesionProvider } from '@/features/autenticacion';
import { ReportesProvider } from '@/features/reportes';
import { servicioSupabase } from '@/features/reportes/services/supabase';
import { MigracionReportes } from '@/features/reportes/services/MigracionReportes';
import { seleccionarImagen } from '@/features/reportes/storage/images';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { navegacionReportes } from '@/integrations/reportes-demo';

const imagenes = { seleccionar: seleccionarImagen };

SplashScreen.preventAutoHideAsync();

/**
 * Navegación raíz: las pestañas viven en el grupo (tabs) y las vistas de detalle se
 * apilan encima. Las rutas de otros participantes se registran aquí como marcadores.
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SesionProvider>
      <AnimatedSplashOverlay />
      <MigracionReportes>
      <ReportesProvider servicios={servicioSupabase} imagenes={imagenes} navegacion={navegacionReportes}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
          <Stack.Screen name="acceso" />
        <Stack.Screen name="objeto/[id]" />
        <Stack.Screen name="coincidencias/[busquedaId]" />
        <Stack.Screen name="publicar" />
        <Stack.Screen name="buscar" />
        <Stack.Screen name="recuperacion/[objetoId]" />
      </Stack>
      </ReportesProvider>
      </MigracionReportes>
      </SesionProvider>
    </ThemeProvider>
  );
}
