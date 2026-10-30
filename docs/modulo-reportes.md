# Módulo de reportes — ejecución y pruebas

## Probar en el teléfono

```powershell
npm.cmd ci
npx.cmd expo start --lan
```

En macOS/Linux se pueden usar `npm` y `npx` sin `.cmd`. En este Windows se usó `.cmd` porque la política de PowerShell bloquea los scripts `.ps1` de npm.

Abre el proyecto con un cliente Expo compatible con SDK 58, usando el QR y la misma red local. Los tres módulos añadidos están incluidos en Expo Go según la documentación de SDK 58. Si usas un development build anterior a estos cambios, reconstruye el cliente para incorporar los módulos; luego abre el servidor de desarrollo. Un bundle exportado no sustituye la instalación de un cliente nativo.

En la navegación inferior abre **Mis reportes**. Desde **Explorar** puedes acceder a **Publicar objeto** y **Buscar mi objeto**; la galería mantiene el diseño de `desarrollo-frontend`.

## Recorrido principal

1. Empiezas como **Ana Torres** con un termo azul publicado de demostración.
2. **Publicar objeto encontrado**: elige una imagen de galería, marca fotografía o referencia y completa título, categoría y descripción. Color e imagen pueden quedar sin indicar (`null`).
3. Continúa al segundo paso: fecha `AAAA-MM-DD`, lugar del hallazgo y punto de recogida o contacto. La característica de verificación es privada y opcional. Vuelve al paso anterior para comprobar que los datos se conservan.
4. Publica. El objeto aparece en Mis reportes. Se puede editar mientras está disponible.
5. **Buscar mi objeto**: registra categoría y descripción. Color, fecha, lugar e imagen son opcionales. Al guardar se abre una lista de demostración por categoría; la búsqueda queda guardada aunque la lista esté vacía.
6. En Mis reportes selecciona Búsquedas para consultar, editar o cerrar una búsqueda activa. Cerrar conserva el historial.
7. Cierra completamente la app y vuelve a abrirla. Comprueba que los registros y las fotos guardadas siguen disponibles.

## Reclamación, revisión y entrega

1. Como Ana, registra una búsqueda de categoría **Llaves**. Aparecerán objetos ficticios de Diego, incluido **Llaves con llavero rojo** de la galería.
2. Abre **Solicitar recuperación**, aporta una característica privada y envía. La reclamación queda pendiente y se puede ver en **Reclamaciones → Enviadas**.
3. Vuelve a Mis reportes y abre **Utilidades de demostración**. Cambia a **Diego Vera**.
4. Abre **Reclamaciones → Recibidas** y revisa el detalle privado. Puedes rechazarlo conservando el historial, o aprobarlo.
5. Aprobar cambia el objeto a recuperación, sin marcarlo como entregado. Después de efectuar la entrega física usa **Confirmar entrega física**.
6. Cambia a Ana: la reclamación figura como entregada y la búsqueda vinculada como resuelta. El contacto solo se muestra mediante la consulta autorizada después de aprobar.

También puedes cambiar a Diego y buscar **Botellas y termos** para reclamar el termo publicado por Ana. El selector de usuarios y el reinicio están separados del recorrido normal. El reinicio solo reemplaza los registros del módulo y vuelve a Ana; nunca borra tablas de otro módulo. Los archivos de fotos conservados no se limpian automáticamente para evitar borrar referencias en uso.

## Pantallas y rutas

| Ruta | Pantalla |
| --- | --- |
| `/reportes` | Mis reportes, publicaciones y búsquedas propias. |
| `/publicar?id=…` | Formulario de objeto en dos pasos; `id` opcional para editar. |
| `/buscar?id=…` | Búsqueda; `id` opcional para editar. |
| `/demo-reportes/coincidencias?id=…` | Resultados demo para una búsqueda guardada. |
| `/recuperacion/[objetoId]?busquedaId=…` | Solicitar recuperación; búsqueda vinculada opcional. |
| `/demo-reportes/reclamaciones` | Recibidas/enviadas, revisión y entrega. |
| `/demo-reportes/demo` | Selector de usuario y reinicio de registros ficticios. |

## Contratos y persistencia

Los campos, categorías y estados acordados están en `types/index.ts`. Los datos desconocidos son `null`; fechas calendario usan `AAAA-MM-DD` y marcas de tiempo ISO 8601. No había contratos compartidos adicionales en la base revisada.

Campos adicionales: `PrivadoObjeto.contacto` y `caracteristica_reservada`; ambos separados de `Objeto`. `Reclamacion.busqueda_id` se normaliza a `null` cuando no hay búsqueda. `ReclamacionResumen` une una reclamación privada, un resumen público del objeto y el nombre del solicitante para la revisión autorizada.

Se usa `expo-sqlite`, archivo **`poli-reportes-v1.db`**, tabla **`reportes_snapshot_v1`**, snapshot con `version: 1`. Una escritura SQL reemplaza todo el estado del módulo de forma atómica. La cola de una única instancia del servicio evita actualizaciones intercaladas. Cada lectura y cada guardado validan los datos y la consistencia entre estados. Los snapshots v1 iniciales sin reclamaciones se interpretan con lista vacía.

Las fotos se copian con `expo-file-system` a `Paths.document/reportes-imagenes` y se espera a que termine la copia antes de guardar la URI. No se usan rutas temporales para los reportes guardados. Cancelar un formulario o cambiar una imagen puede dejar archivos sin referencia; su limpieza queda pendiente. Desinstalar la app borra el almacenamiento local.

La vista web usa un adaptador de memoria para revisar la apariencia; recargar el navegador pierde esa sesión. La persistencia objetivo es Android/iOS y no depende de localStorage ni IndexedDB.

La integración del proveedor, identidad real, callbacks de navegación y futuro adaptador HTTP se explica en [integracion-reportes.md](./integracion-reportes.md).

## Verificaciones

Comandos ejecutados:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:reportes
npx.cmd expo export --platform android --output-dir dist/reportes-android
npx.cmd expo export --platform ios --output-dir dist/reportes-ios
npx.cmd expo export --platform web --output-dir dist/reportes-web
```

Lint y typecheck pasan. Las 15 pruebas incluyen creación/edición, permisos, persistencia, errores de guardado, concurrencia, rechazo, aprobación, entrega y privacidad. Una prueba adicional verifica que el catálogo disponible del frontend se migra sin duplicados y que sus reclamaciones conservan el estado al reiniciar.

La prueba SQLite abre una base real en disco, guarda, cierra la conexión, vuelve a abrir y verifica datos y usuario. Repite la reapertura después de la aprobación y de la entrega, comprobando los tres estados relacionados. También comprueba que el reinicio no altera una tabla ajena. Las otras pruebas usan el mismo servicio con almacenamiento en memoria para simular fallos. Conservar una URI no demuestra que la imagen se pueda leer en un teléfono: esa comprobación nativa sigue pendiente. Las pruebas requieren Node 24 (ejecución directa de TypeScript y SQLite incorporado), sin añadir dependencias de pruebas.

En Chrome a 390 px se verificó la galería del frontend, publicación en dos pasos, visibilidad del objeto publicado en la galería y su detalle, búsqueda, coincidencia demo y envío de reclamación. Metro generó correctamente los bundles de Android e iOS de la rama integrada.

No se dispuso de un teléfono/emulador para una prueba interactiva nativa. Requieren prueba manual: permisos de galería denegados o limitados, cancelación, vista previa y lectura de fotos tras cerrar/reabrir, teclado en pantalla pequeña, tamaños de letra grandes, botón Atrás y confirmaciones nativas. Los formularios incluyen scroll, áreas seguras, ajuste de teclado y bloqueo inmediato de operaciones repetidas.

La web es una vista previa: las confirmaciones con `Alert` están destinadas a Android/iOS. En modo oscuro del navegador se observó además un aviso de hidratación del color de fondo del tema raíz de la plantilla, que no bloqueó el recorrido. No se cambió el tema global para resolverlo; queda pendiente junto a la integración visual compartida.

## Pendientes de integración

- Servidor, sesión real, autorización del lado servidor y transacciones HTTP.
- Motor de coincidencias/Gemma: actualmente hay filtrado demo por categoría. La galería visual del compañero ya está integrada con reportes locales.
- Subida/sincronización de imágenes y limpieza de archivos no utilizados.
- Verificación interactiva en dispositivos Android/iOS y comparación de ambas propuestas visuales.

Solicitar recuperación, aprobación, rechazo y confirmación de entrega están implementados en el adaptador local. La integración con el backend real sigue pendiente.
