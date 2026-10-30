# Integración del mapa de Danna

La rama `danna` (`b950c29`) añade Leaflet 1.9.4 y una página con selección de coordenadas en ESPOL. Se incorporó a `integracion/frontend-formularios`, sobre la unificación del frontend, reportes y el `main` con Supabase. El pull request general continúa como borrador.

## Decisión de integración

El mapa es un selector del formulario **Buscar mi objeto**, sin agregar pestañas ni cambiar la galería. Reutiliza el centro de ESPOL y el código de Danna en `mapaespol.js`. En Android/iOS se muestra en `react-native-webview`; en web, en un iframe aislado. El modal usa los controles y colores `Marca` del frontend.

Se corrigió el CSS de `mapeo.html` y se adaptó el script para funcionar tanto de forma independiente como dentro de la aplicación. Leaflet y el script se empaquetan localmente: no se descarga JavaScript de un CDN. Las calles de OpenStreetMap sí requieren conexión, con atribución visible y el caché normal de la plataforma; no se ofrece descarga de mapas sin conexión.

**Mi ubicación actual** solicita únicamente ubicación en primer plano mediante `expo-location`. Centra el mapa y muestra el punto azul y su precisión, pero no selecciona el lugar donde se perdió el objeto. El usuario debe tocar el mapa o mover el marcador morado y confirmar. Esto evita guardar una ubicación de pérdida incorrecta por usar GPS.

Cancelar, usar Atrás de Android o cerrar el modal descarta el borrador y conserva los datos del formulario. El permiso de GPS no es necesario para elegir un punto manualmente. Si el GPS falla o está denegado, se muestra un mensaje; si fallan las imágenes del mapa, se informa sin borrar el punto previo ni el lugar escrito.

## Contrato y persistencia

`Busqueda.ubicacion_perdida` es `null` o un objeto con números finitos:

```ts
type CoordenadasMapa = { latitud: number; longitud: number };
// -90 <= latitud <= 90; -180 <= longitud <= 180
```

El lugar escrito (`lugar_aproximado`) y las coordenadas son independientes. No se inventa una dirección a partir del punto ni se almacena automáticamente la ubicación actual del usuario. La precisión del GPS tampoco se copia al lugar perdido.

El servicio valida las coordenadas antes de crear o editar una búsqueda. Los snapshots SQLite v1 que no tienen el campo se leen como `null`, manteniendo registros e imágenes anteriores. No es necesario reiniciar datos ni cambiar el nombre de la base. En creación, omitir el campo equivale a `null`; en edición, omitirlo conserva el punto existente para permitir interfaces antiguas. Enviar explícitamente `null` lo elimina.

Las búsquedas y sus ubicaciones siguen filtradas por usuario. Las coordenadas de pérdida no se incluyen en los modelos públicos de los objetos ni en las reclamaciones recibidas por otro usuario.

## Archivos y API reutilizable

- `src/features/ubicacion/types.ts`: coordenadas, ubicación actual y mensajes del puente.
- `domain.ts`: validación de coordenadas y decodificación de mensajes; no depende de UI ni de Expo.
- `SelectorUbicacion.tsx`: modal con borrador, confirmación, GPS y cancelación.
- `Mapa.tsx` / `Mapa.web.tsx`: WebView nativa / iframe web; validan los mensajes antes de actualizar el formulario. En web solo se aceptan mensajes del iframe montado.
- `ubicacion-actual.ts`: acceso a GPS en primer plano, con permiso y espera máxima para obtener la posición.
- `documento.ts`: documento HTML compartido con Leaflet local.
- `mapaespol.js`, `mapeo.html`, `leaflet/`: fuentes del mapa original y licencia BSD de Leaflet.
- `scripts/build-mapa-assets.mjs`: genera `src/features/ubicacion/generated/mapa.json` a partir de las fuentes.

```tsx
<SelectorUbicacion
  valor={ubicacionGuardada}
  alCancelar={cerrar}
  alConfirmar={punto => { actualizarBusquedaEnElFormulario(punto); cerrar(); }}
/>
```

El selector no navega ni guarda registros por su cuenta. Otra interfaz puede reutilizarlo y enviar su resultado a `ServicioReportes`. Después de cambiar el script o los recursos de Leaflet, ejecuta `npm run build:mapa`. Las pruebas comprueban que el paquete generado coincide con las fuentes para evitar versiones diferentes entre web y teléfono.

## Límites de la integración actual

La ubicación queda guardada y disponible para el futuro motor de coincidencias. La demo actual sigue filtrando por categoría. **No calcula cercanía**: los objetos encontrados aún no tienen coordenadas de hallazgo. Comparar con el punto de recogida o con la ubicación actual del usuario produciría resultados incorrectos.

La API Supabase actual no admite `ubicacion_perdida`: su RPC restringe los campos y no tiene implementado el contrato geográfico. La interfaz sigue usando el adaptador local; no se envía un dato que el servidor descartaría o rechazaría. Antes de conectar HTTP deben acordarse y aplicar una columna/estructura equivalente, validaciones de rangos y permisos, y mantener la misma semántica `null`/omisión. No se desplegó ni modificó la base remota durante esta integración.

Los builds nativos anteriores a añadir WebView y Location deben reconstruirse para incorporar los módulos. Ambos figuran en la documentación de Expo Go para SDK 58; debe usarse un cliente compatible.

## Probar

1. Ejecuta `npx.cmd expo start --lan` y abre la aplicación en el teléfono.
2. En **Explorar → Buscar mi objeto**, completa categoría y descripción, y escribe un lugar aproximado.
3. Abre **Seleccionar ubicación en el mapa**. La vista comienza en ESPOL; todavía no hay punto elegido.
4. Prueba **Mi ubicación actual**. Aunque centres el mapa, la confirmación permanece deshabilitada hasta elegir un punto de pérdida.
5. Toca el mapa; mueve el marcador si hace falta. Cancela y comprueba que el formulario no tomó ese borrador.
6. Abre otra vez, elige el punto y pulsa **Usar esta ubicación**. Guarda la búsqueda.
7. En **Mis reportes → Búsquedas**, comprueba las coordenadas. Edita la búsqueda y confirma que el mapa abre con el mismo marcador.
8. Prueba quitar el punto, cambiarlo, salir con Atrás y reiniciar la app. El lugar escrito debe conservarse.

Los resultados y lo pendiente antes del pull final están en [verificacion-integracion-general.md](./verificacion-integracion-general.md).

## Referencias

[Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/), [WebView](https://docs.expo.dev/versions/v58.0.0/sdk/webview/), [Location](https://docs.expo.dev/versions/v58.0.0/sdk/location/), [Leaflet 1.9.4](https://leafletjs.com/reference.html) y [uso de tiles de OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/).
