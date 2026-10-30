# Integración del módulo de reportes

Implementación aislada en `src/features/reportes/`. Los contratos, reglas y registros pueden reutilizarse con otra interfaz. No hay importaciones de Expo Router en el módulo: el adaptador de navegación está en `src/integrations/reportes-demo.ts` y las rutas en `src/app/`.

## Estructura y exportaciones

| Carpeta | Responsabilidad |
| --- | --- |
| `types/` | `Usuario`, `Objeto`, `ObjetoPropio`, `Busqueda`, `Reclamacion`, entradas de creación, `ServicioReportes`, `AlmacenReportes` y contratos demo. |
| `domain/` | Validaciones de campos y datos recibidos; reglas de reclamación, aprobación y entrega; proyección de objetos públicos. Sin componentes ni APIs nativas. |
| `services/` | `ReportesProvider`, contratos de navegación/imágenes y servicio asíncrono local. |
| `storage/` | Adaptador SQLite e importación persistente de imágenes. Variante web solo para vista previa en memoria. |
| `hooks/` | Formularios, consulta de reportes/reclamaciones, recuperación y protección contra envíos repetidos. |
| `components/`, `screens/` | Interfaz de reportes integrada con los botones, imágenes y tokens `Marca` de `desarrollo-frontend`. |
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

El anfitrión implementa los callbacks de `NavegacionReportes`: volver, ver reportes, publicar, buscar, coincidencias, abrir demo, abrir reclamaciones y solicitar recuperación. Las pantallas no conocen rutas externas. Para una apariencia diferente, usa los mismos hooks dentro de tus propios componentes y conserva el proveedor; no es necesario reutilizar estas pantallas.

## Identidad

Las pantallas no incluyen identificadores de usuarios ficticios. El servicio responde a `usuarioActual()` y aplica permisos a cada operación. La demo suministra dos usuarios desde `demo/data.ts`; el selector queda en una utilidad separada y se habilita únicamente si el proveedor recibe `demo`.

En producción, implementa `ServicioReportes` usando la sesión real. Al cambiar de sesión, monta el proveedor con `key={session.user.id}` y una instancia de servicio asociada a esa identidad para descartar estado visual de la sesión anterior. No envíes un `publicador_id` o `solicitante_id` elegido por el formulario: el servidor debe obtenerlo de la sesión autenticada.

## Sustituir persistencia y conectar servidor

El adaptador local usa una sola instancia de servicio y una cola para serializar operaciones. `AlmacenReportes` ofrece `leer(): Promise<unknown | null>` y `guardar(estado)`. Puede sustituirse por otro almacenamiento local sin modificar las reglas.

Para HTTP, implementa las operaciones de `ServicioReportes` y pásalas al proveedor. Las pantallas y hooks quedan iguales. El servidor debe validar los DTO recibidos y las respuestas, aplicar autorización y realizar la entrega en una transacción. No se debe enviar el snapshot SQLite completo como contrato de una API pública.

El contrato incluye crear/listar/actualizar objetos y búsquedas; cerrar búsquedas; obtener resumen y lista públicos; solicitar coincidencias; crear/listar reclamaciones; resolverlas; confirmar entrega y consultar instrucciones autorizadas. Los errores deben rechazarse como `Error` con un mensaje presentable. Las mutaciones realizadas por otra interfaz deben llamar a `notificarCambio()` para refrescar las consultas montadas.

`solicitarCoincidencias(busquedaId)` es el punto de integración con el módulo del compañero. La implementación local está marcada `DEMO`: filtra objetos disponibles de otros usuarios por categoría. No ejecuta Gemma ni pretende ser un motor real de coincidencias.

La búsqueda ahora puede incluir `ubicacion_perdida: { latitud, longitud } | null`, seleccionada con el módulo de Danna. La migración de snapshots antiguos y la semántica de edición se detallan en [integracion-mapa.md](./integracion-mapa.md). Este campo no cambia el filtro demo ni está admitido por la RPC remota actual: su soporte debe acordarse antes de sustituir el servicio local por HTTP.

Las imágenes se obtienen mediante `ImagenesReportes`. El adaptador móvil copia la selección a documentos de la app antes de devolverla. El adaptador HTTP deberá subir ese archivo y sustituir su URI local por una URL del servidor. Una cancelación devuelve `null`; un permiso denegado o un fallo de copia rechaza la promesa y conserva los datos del formulario.

## Privacidad y consistencia

`Objeto` es público. `ObjetoPropio` agrega `contacto` y `caracteristica_reservada`, almacenados por separado y consultables por el publicador. La proyección pública selecciona explícitamente sus campos y excluye los privados.

`Reclamacion.detalle_verificacion` solo está en las consultas privadas del solicitante y del publicador. El contacto de entrega se puede consultar mediante una operación separada por el publicador o por el solicitante aprobado; la característica reservada del publicador nunca se entrega al solicitante.

Las reglas en `domain/reclamaciones.ts` son reutilizables sin UI. Rechazar conserva historial. Aprobar cambia a `en_recuperacion`; entregar es otra acción que cambia objeto/reclamación/búsqueda vinculada conjuntamente y rechaza las demás pendientes. Una búsqueda cerrada que estaba vinculada se marca `resuelta` al completar su entrega. Los permisos locales son una simulación, no una barrera de seguridad del servidor.

## Unificación con frontend y main

La rama de integración parte del `main` con Supabase (`c0600e3`), incorpora `desarrollo-frontend`
(`335b527`) y `feature/formularios` (`9314a0c`). Conserva las pestañas **Explorar**, **Mis reportes**
y **Perfil**, el tema `Marca` y los componentes del frontend. Los marcadores de publicación, búsqueda,
reportes y recuperación se conectaron a las pantallas funcionales.

El layout raíz monta un único proveedor de reportes. El cliente Supabase y el backend se conservaron;
se eliminó únicamente su importación anticipada del layout para que la demo local pueda arrancar sin
credenciales. La conexión real debe realizarse mediante el adaptador HTTP autenticado.

El `MockDataProvider` combina el catálogo original con objetos públicos locales. La función de
migración incorpora una sola vez al almacenamiento los objetos mock disponibles, asignándoles el
publicador ficticio Diego; esto permite probar solicitudes desde el detalle de la galería y mantener
sus estados. Las entradas mock inicialmente entregadas o en recuperación permanecen de solo lectura,
porque no existe su historial de reclamaciones. No se inventan usuarios ni historial reales.

`package.json`, `package-lock.json` y `app.json` combinan las dependencias y plugins de ambas ramas.
`tsconfig.json` permite probar la lógica directamente con Node 24. No se ejecutó `reset-project`.

## Documentación consultada

Se comprobaron las versiones instaladas y las APIs exigidas por `AGENTS.md`:

- [Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/), [índice para agentes](https://docs.expo.dev/llms.txt).
- [SQLite](https://docs.expo.dev/versions/v58.0.0/sdk/sqlite/), [FileSystem](https://docs.expo.dev/versions/v58.0.0/sdk/filesystem/), [ImagePicker](https://docs.expo.dev/versions/v58.0.0/sdk/imagepicker/).
- [Native tabs](https://docs.expo.dev/router/advanced/native-tabs/), [layouts de navegación](https://docs.expo.dev/router/basics/navigation-layouts/), [áreas seguras](https://docs.expo.dev/versions/v58.0.0/sdk/safe-area-context/), [teclado](https://reactnative.dev/docs/keyboardavoidingview).
