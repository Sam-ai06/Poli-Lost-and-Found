import { ModuloPendiente } from '@/components/modulo-pendiente';

/** Punto de integración: formulario de publicación en dos pasos (Participante 2). */
export default function PublicarScreen() {
  return (
    <ModuloPendiente
      titulo="Publicar objeto"
      regresarA=""
      responsable="Participante 2"
      descripcion="Aquí se integrará el formulario para publicar un objeto encontrado."
    />
  );
}
