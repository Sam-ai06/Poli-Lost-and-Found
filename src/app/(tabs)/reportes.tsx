import { ModuloPendiente } from '@/components/modulo-pendiente';

/** Punto de integración: publicaciones y búsquedas propias (Participante 2). */
export default function ReportesScreen() {
  return (
    <ModuloPendiente
      titulo="Mis reportes"
      responsable="Participante 2"
      descripcion="Aquí se mostrarán tus publicaciones y búsquedas registradas."
    />
  );
}
