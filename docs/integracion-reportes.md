# Integración del módulo de reportes

Implementación aislada en `src/features/reportes/`. La propuesta visual se puede sustituir sin cambiar contratos, validaciones, reglas ni registros guardados. No hay importaciones de Expo Router en el módulo: las conexiones de navegación están en `src/app/demo-reportes/`.

## Estructura y exportaciones

| Carpeta | Responsabilidad |
| --- | --- |
| `types/` | `Usuario`, `Objeto`, `ObjetoPropio`, `Busqueda`, `Reclamacion`, entradas de creación, `ServicioReportes`, `AlmacenReportes` y contratos demo. |
| `domain/` | Validaciones de campos y datos recibidos; reglas de reclamación, aprobación y entrega; proyección de objetos públicos. Sin componentes ni APIs nativas. |
| `services/` | `ReportesProvider`, contratos de navegación/imágenes y servicio asíncrono local. |
| `storage/` | Adaptador SQLite e importación persistente de imágenes. Variante web solo para vista previa en memoria. |
| `hooks/` | Formularios, consulta de reportes/reclamaciones, recuperación y protección contra envíos repetidos. |
| `components/`, `screens/` | Propuesta visual; reutiliza `ThemedText` y `ThemedView`. Colores y estilos propios, sin reemplazar el tema global. |
| `demo/` | Usuarios, registros ficticios y composición del adaptador local. |

`index.ts` es la entrada pública. Exporta tipos, `crearServicioLocal`, `crearAlmacenSQLite`, validaciones, proveedor, contratos `NavegacionReportes`/`ImagenesReportes`, pantallas y hooks:

- `useReportes`: servicios, navegación, imágenes, revisión y `notificarCambio`.
- `useFormularioObjeto(id?, activo?)`: datos, paso, actualización, carga, foto, guardado, errores y bloqueo de envío. `activo` controla el manejo de Atrás de Android.
- `useFormularioBusqueda(id?)`: datos, actualización, carga y guardado.
- `useMisReportes`: usuario, objetos, búsquedas, carga, errores, recarga y cierre.
- `useRecuperacion(objetoId, busquedaId?)`: resumen público, detalle privado y solicitud.
- `useReclamaciones`: recibidas/enviadas, carga, aprobación/rechazo y entrega.
- `useOperacion`: exclusión de operaciones repetidas y presentación de errores.

## Montar proveedor y pantallas

```tsx
import {
  ReportesProvider, ReportsScreen,
  type ServicioReportes, type NavegacionReportes,
} from '@/features/reportes';

// Los suministra la aplicación anfitriona.
declare const servicios: ServicioReportes;
declare const navegacion: NavegacionReportes;
declare const imagenes: { seleccionar(): Promise<string | null> };

export function MiSeccion() {
  return (
    <ReportesProvider servicios={servicios} navegacion={navegacion} imagenes={imagenes}>
      <ReportsScreen />
    </ReportesProvider>
  );
}
```

Debe estar dentro del contexto de áreas seguras y del tema existente de la aplicación. `FoundFormScreen` y `SearchFormScreen` reciben `id?: string` para edición. `MatchesScreen` recibe `id` de búsqueda; `RecoveryScreen` recibe `objetoId` y `busquedaId?`. Se pueden abrir desde cualquier pantalla, sin depender del flujo demo. Al cambiar de identificador se recomienda usar `key={id}` como hacen las rutas incluidas.

El anfitrión implementa los callbacks de `NavegacionReportes`: ver reportes, publicar, buscar, coincidencias, abrir demo, abrir reclamaciones y solicitar recuperación. Las pantallas no conocen rutas externas. Para una apariencia diferente, usa los mismos hooks dentro de tus propios componentes y conserva el proveedor; no es necesario reutilizar estas pantallas.

## Identidad

Las pantallas no incluyen identificadores de usuarios ficticios. El servicio responde a `usuarioActual()` y aplica permisos a cada operación. La demo suministra dos usuarios desde `demo/data.ts`; el selector queda en una utilidad separada y se habilita únicamente si el proveedor recibe `demo`.

En producción, implementa `ServicioReportes` usando la sesión real. Al cambiar de sesión, monta el proveedor con `key={session.user.id}` y una instancia de servicio asociada a esa identidad para descartar estado visual de la sesión anterior. No envíes un `publicador_id` o `solicitante_id` elegido por el formulario: el servidor debe obtenerlo de la sesión autenticada.

## Sustituir persistencia y conectar servidor

El adaptador local usa una sola instancia de servicio y una cola para serializar operaciones. `AlmacenReportes` ofrece `leer(): Promise<unknown | null>` y `guardar(estado)`. Puede sustituirse por otro almacenamiento local sin modificar las reglas.

Para HTTP, implementa las operaciones de `ServicioReportes` y pásalas al proveedor. Las pantallas y hooks quedan iguales. El servidor debe validar los DTO recibidos y las respuestas, aplicar autorización y realizar la entrega en una transacción. No se debe enviar el snapshot SQLite completo como contrato de una API pública.

El contrato incluye crear/listar/actualizar objetos y búsquedas; cerrar búsquedas; obtener resumen y lista públicos; solicitar coincidencias; crear/listar reclamaciones; resolverlas; confirmar entrega y consultar instrucciones autorizadas. Los errores deben rechazarse como `Error` con un mensaje presentable. Las mutaciones realizadas por otra interfaz deben llamar a `notificarCambio()` para refrescar las consultas montadas.

`solicitarCoincidencias(busquedaId)` es el punto de integración con el módulo del compañero. La implementación local está marcada `DEMO`: filtra objetos disponibles de otros usuarios por categoría. No ejecuta Gemma ni pretende ser un motor real de coincidencias.

Las imágenes se obtienen mediante `ImagenesReportes`. El adaptador móvil copia la selección a documentos de la app antes de devolverla. El adaptador HTTP deberá subir ese archivo y sustituir su URI local por una URL del servidor. Una cancelación devuelve `null`; un permiso denegado o un fallo de copia rechaza la promesa y conserva los datos del formulario.

## Privacidad y consistencia

`Objeto` es público. `ObjetoPropio` agrega `contacto` y `caracteristica_reservada`, almacenados por separado y consultables por el publicador. La proyección pública selecciona explícitamente sus campos y excluye los privados.

`Reclamacion.detalle_verificacion` solo está en las consultas privadas del solicitante y del publicador. El contacto de entrega se puede consultar mediante una operación separada por el publicador o por el solicitante aprobado; la característica reservada del publicador nunca se entrega al solicitante.

Las reglas en `domain/reclamaciones.ts` son reutilizables sin UI. Rechazar conserva historial. Aprobar cambia a `en_recuperacion`; entregar es otra acción que cambia objeto/reclamación/búsqueda vinculada conjuntamente y rechaza las demás pendientes. Una búsqueda cerrada que estaba vinculada se marca `resuelta` al completar su entrega. Los permisos locales son una simulación, no una barrera de seguridad del servidor.

## Archivos compartidos modificados

- `src/components/app-tabs.tsx`: una entrada nativa `demo-reportes`; conserva las entradas existentes.
- `src/components/app-tabs.web.tsx`: entrada equivalente y ajuste puntual del tipo `ref` de `TabTriggerSlotProps`, incompatible con la versión instalada de React Native.
- `src/hooks/use-color-scheme.web.ts`: comentario de excepción de lint para la hidratación de la plantilla; sin cambiar su comportamiento.
- `src/types/styles.d.ts`: declaraciones de CSS faltantes en la base, necesarias para typecheck.
- `package.json` y lockfile: tres dependencias de ejecución para imágenes/almacenamiento, herramientas ESLint que faltaban y comandos de comprobación.
- `eslint.config.js`: configuración generada por Expo, ausente en la base.
- `tsconfig.json`: permite importar extensiones `.ts` para probar lógica directamente con Node 24, sin añadir un framework de pruebas.
- `app.json`: plugins de SQLite y selección de fotos; mensaje de permiso en español, cámara y micrófono desactivados para este módulo.

No se sustituyeron las pantallas existentes, el layout raíz ni el tema global. No se ejecutó `reset-project`. La rama local es `feature/formularios`, desde `main` (`5eb9af3`); al comenzar la carpeta estaba vacía. No se publicó nada en GitHub.

## Documentación consultada

Se comprobaron las versiones instaladas y las APIs exigidas por `AGENTS.md`:

- [Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/), [índice para agentes](https://docs.expo.dev/llms.txt).
- [SQLite](https://docs.expo.dev/versions/v58.0.0/sdk/sqlite/), [FileSystem](https://docs.expo.dev/versions/v58.0.0/sdk/filesystem/), [ImagePicker](https://docs.expo.dev/versions/v58.0.0/sdk/imagepicker/).
- [Native tabs](https://docs.expo.dev/router/advanced/native-tabs/), [layouts de navegación](https://docs.expo.dev/router/basics/navigation-layouts/), [áreas seguras](https://docs.expo.dev/versions/v58.0.0/sdk/safe-area-context/), [teclado](https://reactnative.dev/docs/keyboardavoidingview).
