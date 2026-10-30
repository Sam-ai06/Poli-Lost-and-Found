import { router, Stack } from 'expo-router';
import { ReportesProvider, type NavegacionReportes } from '@/features/reportes';
import { servicioDemo } from '@/features/reportes/demo/environment';
import { seleccionarImagen } from '@/features/reportes/storage/images';

const navegacion: NavegacionReportes = {
  verReportes: () => router.dismissTo('/demo-reportes'),
  publicar: id => router.push({ pathname: '/demo-reportes/publicar', params: id ? { id } : {} }),
  buscar: id => router.push({ pathname: '/demo-reportes/buscar', params: id ? { id } : {} }),
  coincidencias: (id, reemplazar) => {
    const destino = { pathname: '/demo-reportes/coincidencias' as const, params: { id } };
    if (reemplazar) router.replace(destino); else router.push(destino);
  },
  abrirDemo: () => router.push('/demo-reportes/demo'),
  abrirReclamaciones: () => router.push('/demo-reportes/reclamaciones'),
  solicitarRecuperacion: (objetoId, busquedaId) => router.push({ pathname: '/demo-reportes/recuperar', params: { objetoId, ...(busquedaId ? { busquedaId } : {}) } }),
};
const imagenes = { seleccionar: seleccionarImagen };
export default function ReportesLayout() {
  return <ReportesProvider servicios={servicioDemo} demo={servicioDemo} imagenes={imagenes} navegacion={navegacion}><Stack screenOptions={{ contentStyle: { backgroundColor: '#F3F4F8' }, headerTintColor: '#5145CD', headerTitleStyle: { color: '#17243B' }, headerBackTitle: 'Atrás' }}>
    <Stack.Screen name="index" options={{ headerShown: false }} />
    <Stack.Screen name="publicar" options={{ title: 'Objeto encontrado' }} />
    <Stack.Screen name="buscar" options={{ title: 'Mi búsqueda' }} />
    <Stack.Screen name="coincidencias" options={{ title: 'Posibles coincidencias' }} />
    <Stack.Screen name="demo" options={{ title: 'Demostración' }} />
    <Stack.Screen name="reclamaciones" options={{ title: 'Reclamaciones' }} />
    <Stack.Screen name="recuperar" options={{ title: 'Recuperar objeto' }} />
  </Stack></ReportesProvider>;
}
