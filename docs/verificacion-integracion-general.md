# Verificación de la integración general

La rama de trabajo es `integracion/frontend-formularios`. Se conserva como propuesta revisable antes del último pull a `main`.

## Alcance comprobado

| Rama | Aporte conservado |
| --- | --- |
| `main` (`c0600e3`) | Cliente, SQL y API de Supabase. No se alteró ni desplegó la base remota. |
| `desarrollo-frontend` (`335b527`) | Galería, detalle, imágenes, colores `Marca` y pestañas Explorar / Mis reportes / Perfil. |
| `feature/formularios` (`9314a0c`) | Formularios, persistencia, edición, reclamaciones, permisos y entrega local. |
| `danna` (`b950c29`) | Mapa Leaflet, centro de ESPOL, selección y geolocalización; conectado a la búsqueda móvil. |

## Resultados

| Comprobación | Resultado y evidencia |
| --- | --- |
| Lint y TypeScript | Correctos con las versiones instaladas de Expo 58, React Native y WebView. |
| Pruebas automatizadas | 21 correctas, incluidas las 15 anteriores y 6 de ubicación/integración general. |
| Persistencia SQLite | Una base real se cierra y reabre; conserva usuario, URI de imagen, coordenadas y estados relacionados. |
| Compatibilidad v1 | Una búsqueda sin campo geográfico se abre con `null`. Editar sin enviar ese campo no borra una ubicación existente. |
| Datos inválidos y permisos | Se rechazan rangos incorrectos, cadenas, valores no finitos y edición por otro usuario sin modificar registros. |
| Puente Leaflet → app | Se validan canal y coordenadas; en web se verifica el origen de la ventana. La prueba de navegador rechazó un mensaje de otra ventana. |
| GPS | En navegador, permiso denegado permite seguir seleccionando manualmente. GPS simulado centra sin marcar automáticamente una pérdida. |
| Cancelación | Elegir un punto y cancelar no lo aplica al formulario. |
| Tamaño de pantalla | Vista web de 390×844 y controles de mapa visibles a 320×568. |
| Navegación completa | Mapa → búsqueda guardada → Mis reportes → edición con el mismo punto → coincidencia → reclamación pendiente. |
| Regla de entrega | Prueba automatizada: búsqueda con punto → reclamación → aprobación → entrega → búsqueda resuelta; conserva sus coordenadas. |
| Recursos | El paquete local de Leaflet coincide con las fuentes de Danna; la verificación falla si falta regenerarlo. |
| Android e iOS | Metro generó los bundles de integración. La generación no equivale a instalar o probar una app nativa. |

Las pruebas del navegador se ejecutaron con una ubicación ficticia de ESPOL. No se utilizó una posición personal del usuario.

## Reproducir los controles

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:reportes
npx.cmd expo export --platform android --max-workers 2 --output-dir dist/general-android
npx.cmd expo export --platform ios --max-workers 2 --output-dir dist/general-ios
```

Las pruebas de lógica requieren Node 24. `npm run test:reportes` también comprueba que el mapa generado está actualizado. Si cambia el script fuente, ejecuta `npm run build:mapa` y vuelve a verificar.

## Pendiente antes de considerar la integración de producción

| Área | Qué falta |
| --- | --- |
| Teléfono Android/iOS | Comprobar WebView, permisos reales, GPS apagado, denegado o sin señal; gestos del mapa, Atrás, lector de pantalla y selección tras cerrar/reabrir la app. |
| Red | Verificar en teléfono la pérdida y recuperación de conexión al proveedor de mapas. El componente informa del fallo de tiles sin borrar la búsqueda. |
| Fotos | Verificar permisos nativos y que la imagen copiada continúa legible tras reiniciar. |
| Supabase | El frontend aún usa datos locales. Faltan sesión real, adaptador HTTP, equivalencia de campos y transacciones del servidor con las mismas reglas locales. |
| Coordenadas remotas | La RPC actual no admite `ubicacion_perdida`; requiere migración acordada y validación antes de conectar HTTP. |
| Coincidencias | Sigue la demostración por categoría. La cercanía necesita coordenadas de hallazgo y un contrato con el motor de matching. |

Estos puntos son límites explícitos de lo comprobado. No se presenta el mapa como un cálculo real de coincidencias geográficas ni los bundles como pruebas en teléfono.
