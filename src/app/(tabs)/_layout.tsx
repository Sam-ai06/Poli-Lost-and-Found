import { Redirect } from 'expo-router';

import AppTabs from '@/components/app-tabs';
import { useSesion } from '@/features/autenticacion';

/** Sin sesión, la app abre la bienvenida salvo que el usuario elija explorar sin cuenta. */
export default function TabsLayout() {
  const { estado, invitado } = useSesion();
  if (estado === 'sin_sesion' && !invitado) return <Redirect href="/acceso/bienvenida" />;
  return <AppTabs />;
}
