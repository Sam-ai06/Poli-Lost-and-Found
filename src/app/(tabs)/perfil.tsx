import { ModuloPendiente } from '@/components/modulo-pendiente';

/** Punto de integración: datos de la cuenta con Supabase Auth (Participante 3). */
export default function PerfilScreen() {
  return (
    <ModuloPendiente
      titulo="Perfil"
      responsable="Participante 3"
      descripcion="Aquí se mostrará la información de la cuenta cuando se configure la autenticación."
    />
  );
}
