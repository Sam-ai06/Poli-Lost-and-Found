import { router } from 'expo-router';
import type { NavegacionReportes } from '@/features/reportes';

export const navegacionReportes: NavegacionReportes = {
  volver: () => router.canGoBack() ? router.back() : router.replace('/'),
  verReportes: () => router.navigate('/reportes'),
  publicar: id => router.push({ pathname: '/publicar', params: id ? { id } : {} }),
  buscar: id => router.push({ pathname: '/buscar', params: id ? { id } : {} }),
  coincidencias: (id, reemplazar) => {
    const destino = { pathname: '/demo-reportes/coincidencias' as const, params: { id } };
    if (reemplazar) router.replace(destino); else router.push(destino);
  },
  abrirDemo: () => router.push('/demo-reportes/demo'),
  abrirReclamaciones: () => router.push('/demo-reportes/reclamaciones'),
  solicitarRecuperacion: (objetoId, busquedaId) => router.push({ pathname: '/recuperacion/[objetoId]', params: { objetoId, ...(busquedaId ? { busquedaId } : {}) } }),
};
