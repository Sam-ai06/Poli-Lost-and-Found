import { router } from 'expo-router';

import { Boton } from '@/components/boton';
import { ModuloPendiente } from '@/components/modulo-pendiente';

/** Datos de prueba: búsqueda definida en src/data/mock/coincidencias.json. */
const BUSQUEDA_DEMO = 'busqueda-demo';

/**
 * Punto de integración: el registro de búsquedas es del Participante 2. Al guardar una
 * búsqueda debe navegar a `/coincidencias/[busquedaId]` con el id generado.
 */
export default function BuscarScreen() {
  return (
    <ModuloPendiente
      titulo="Buscar mi objeto"
      regresarA=""
      responsable="Participante 2"
      descripcion="Aquí se integrará el formulario para registrar la búsqueda de un objeto perdido.">
      <Boton
        etiqueta="Ver coincidencias de ejemplo"
        variante="secundario"
        compacto
        onPress={() =>
          router.push({
            pathname: '/coincidencias/[busquedaId]',
            params: { busquedaId: BUSQUEDA_DEMO },
          })
        }
      />
    </ModuloPendiente>
  );
}
