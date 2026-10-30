import { ModuloPendiente } from '@/components/modulo-pendiente';

/** Punto de integración: solicitud de recuperación y entrega (Participante 2). */
export default function RecuperacionScreen() {
  return (
    <ModuloPendiente
      titulo="Solicitar recuperación"
      regresarA=""
      responsable="Participante 2"
      descripcion="Aquí se integrará el flujo para solicitar la recuperación del objeto. El id del objeto llega como parámetro objetoId."
    />
  );
}
