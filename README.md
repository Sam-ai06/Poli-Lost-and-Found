# Findyp

Findyp es una aplicación de objetos perdidos y encontrados para universidades y campus
universitarios. Permite publicar objetos encontrados, explorarlos en una galería, registrar
búsquedas de objetos perdidos, consultar posibles coincidencias y gestionar la recuperación y
entrega de cada objeto.

La identidad visual está centralizada para que otras universidades puedan adaptarla.

## Supabase

El proyecto está conectado a `poli-lost-and-found` en Supabase.

- Panel: https://supabase.com/dashboard/project/gbwrmyfotkainzgaseet
- Cliente compartido: `src/lib/supabase.ts`. Usa `import { supabase } from '@/lib/supabase'` para realizar consultas.
- La configuración local vive en `.env.local` (ignorado por Git). En otro equipo, copia `.env.example` a `.env.local` y completa la URL y la clave pública del panel.
- Solo usa claves públicas en `EXPO_PUBLIC_*`; nunca incluyas claves secretas o `service_role`.
- Las sesiones se conservan con el almacenamiento local de Expo en móvil y el del navegador en web.
- Comprueba la API con `node --env-file=.env.local scripts/check-supabase.mjs`.

La base de datos incluye tablas de objetos, búsquedas y reclamaciones. La [documentación del backend](supabase/README.md) describe las rutas disponibles, la autenticación y sus formatos. La aplicación todavía no incluye pantallas de autenticación ni conecta los reportes locales al servidor.

Integración basada en la [guía oficial de Supabase para Expo](https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native).

## Tecnologías

- [Expo](https://expo.dev) SDK 58 con React Native 0.88 y React 19 (Android, iOS y web)
- [Expo Router](https://docs.expo.dev/router/introduction/): navegación basada en archivos
- TypeScript
- Supabase (PostgreSQL, Storage y Auth) como backend; la integración está en desarrollo

## Requisitos previos

- Node.js 24 y npm (`npm run test:reportes` requiere Node 24)
- Git
- Para probar en un teléfono: la app Expo Go o una development build. Para emuladores: Android
  Studio o Xcode.

## Instalación

```bash
git clone https://github.com/Sam-ai06/Poli-Lost-and-Found.git
cd Poli-Lost-and-Found
npm install
```

Para agregar dependencias, usa `npx expo install <paquete>` en lugar de `npm install <paquete>`,
así se instalan versiones compatibles con el SDK de Expo.

## Variables de entorno

La demostración de la galería y los reportes funciona con datos ficticios locales sin variables
de entorno. Para usar el cliente Supabase o las pruebas del backend, copia `.env.example` a
`.env.local` y configura la URL y la clave pública indicadas en [Supabase](#supabase).

## Ejecución local

| Comando | Descripción |
| --- | --- |
| `npm start` (equivale a `npx expo start`) | Inicia el servidor de desarrollo de Expo |
| `npm run web` | Inicia la aplicación en el navegador |
| `npm run android` | Inicia la aplicación en un emulador o dispositivo Android |
| `npm run ios` | Inicia la aplicación en el simulador de iOS (requiere macOS) |

Desde GitHub Codespaces o una red distinta a la del teléfono, usa `npx expo start --tunnel`.

No ejecutes `npm run reset-project`: es un script de la plantilla de Expo que mueve el código de
`src/app` a otra carpeta.

### Probar la aplicación

1. Ejecuta `npm install` y luego `npm run web`.
2. Abre `http://localhost:8081`. En GitHub Codespaces, abre la pestaña **Puertos** y usa la
   dirección reenviada del puerto 8081. La primera carga puede tardar mientras Metro empaqueta.
3. Recorrido sugerido:
   - **Explorar**: galería con búsqueda por texto, categorías y el panel de filtros (estado, lugar
     y fecha). **Ver detalle** abre la información completa del objeto.
   - **Buscar mi objeto** y **Publicar objeto**: formularios del módulo de reportes.
   - `/coincidencias/busqueda-demo`: coincidencias de ejemplo con su nivel de similitud.
   - **Mis reportes**: publicaciones y búsquedas propias, reclamaciones y **Utilidades de
     demostración**, que permiten cambiar entre los dos usuarios de prueba.

En web, los reportes creados se conservan solo durante la sesión del navegador; en Android e iOS
se guardan en SQLite. La aplicación funciona con datos de prueba y no necesita `.env.local`.

## Pruebas y verificaciones

| Comando | Descripción |
| --- | --- |
| `npm run typecheck` (equivale a `npx tsc --noEmit`) | Comprobación de tipos de TypeScript |
| `npm run lint` | Lint con la configuración de Expo incluida en `eslint.config.js` |
| `node --test tests/autenticacion.test.mjs` | Pruebas de validación del correo institucional y la contraseña |
| `npm run test:reportes` | Pruebas del módulo de reportes y de su integración con el catálogo (Node 24) |
| `npx expo-doctor` | Diagnóstico de dependencias y configuración de Expo |
| `node --env-file=.env.local scripts/check-supabase.mjs` | Comprueba la conexión con Supabase |
| `node --env-file=.env.local scripts/test-api.mjs` | Prueba la API desplegada en Supabase |

Los dos últimos comandos requieren `.env.local` y se conectan al proyecto real de Supabase.
Antes de ejecutar `scripts/test-api.mjs`, revisa la sección de pruebas de
[la documentación del backend](supabase/README.md).

## Estructura del repositorio

```text
src/
  app/                    Rutas de Expo Router (cada archivo es una pantalla)
    (tabs)/               Pestañas: Explorar (galería), Mis reportes y Perfil
    objeto/[id].tsx       Detalle de un objeto
    coincidencias/        Coincidencias de una búsqueda
    publicar.tsx          Publicación de objetos
    buscar.tsx            Registro de búsquedas
    recuperacion/         Solicitud de recuperación
    demo-reportes/        Coincidencias locales, reclamaciones y utilidades demo
    acceso/               Bienvenida, inicio de sesión, registro y recuperación
  components/             Componentes reutilizables de interfaz
  constants/theme.ts      Tokens de diseño; `Marca` define colores y radios de Findyp
  constants/institucion.ts Dominios de correo permitidos y logo de la universidad
  data/mock/              Datos ficticios en JSON e imágenes de prueba
  features/autenticacion/ Acceso: validación, Supabase Auth, sesión y pantallas
  features/reportes/      Módulo de reportes: pantallas, hooks, dominio y almacenamiento local
  hooks/                  Hooks de datos y utilidades
  integrations/           Integración del catálogo con los reportes de demostración
  lib/                    Cliente de Supabase y almacenamiento de sesión
  services/               Capa de acceso a datos (proveedores)
  types/                  Modelos y enums de dominio
  utils/                  Formato de fechas y etiquetas
assets/                   Íconos e imágenes (images/mock: fotos de prueba)
docs/                     Documentación del módulo de reportes y su integración
scripts/                  Comprobaciones de Supabase y pruebas de la API
supabase/                 Función de la API, SQL del backend y su documentación
tests/                    Pruebas automatizadas (`node --test`)
```

## Acceso y autenticación

Las pantallas de acceso están en `src/app/acceso/` y su lógica en `src/features/autenticacion/`:
bienvenida, inicio de sesión, registro y recuperación de contraseña.

- Solo se aceptan correos universitarios. Los dominios se configuran en
  `src/constants/institucion.ts` (`dominiosPermitidos`); `edu.ec` acepta cualquier universidad
  ecuatoriana, por ejemplo `espol.edu.ec`.
- El logo de la universidad se configura en el mismo archivo (`logo`). Mientras sea `null`, las
  pantallas muestran un espacio reservado.
- Usa Supabase Auth con el cliente de `src/lib/supabase.ts`. Sin `.env.local`, las pantallas se
  muestran igual y avisan que el acceso no está configurado.
- Sin sesión, la app abre la bienvenida; **Explorar sin cuenta** permite usar la demostración.
- La validación del dominio se hace en la aplicación. Para que sea obligatoria, el backend también
  debe rechazar registros de otros dominios (pendiente del Participante 3).
- Pruebas de las reglas de validación: `node --test tests/autenticacion.test.mjs`.

## Capa de acceso a datos

Las pantallas no consultan Supabase directamente. Usan los hooks de `src/hooks/use-objetos.ts`,
que obtienen un `DataProvider` mediante `obtenerProveedorDatos()` (`src/services/index.ts`).

- `MockDataProvider`: combina `src/data/mock/*.json` con los reportes públicos del almacenamiento
  local. Es el proveedor activo. Sus imágenes están en `assets/images/mock` y se referencian como
  `mock://<clave>` (ver `src/data/mock/imagenes.ts`). Los objetos disponibles del catálogo se
  incorporan una sola vez a los datos de demostración; los que ya aparecen como entregados o en
  recuperación siguen siendo solo lectura hasta contar con su historial real.
- `SupabaseDataProvider`: esqueleto pendiente de la configuración de Supabase.

Operaciones disponibles: `listarObjetos(filtros)`, `obtenerObjeto(id)` y
`obtenerCoincidencias(busquedaId)`. Para cambiar de proveedor, modifica `FUENTE_DATOS` en
`src/services/index.ts`.

Los modelos de `src/types/findyp.ts` son provisionales hasta que exista `docs/contrato-datos.md`.
Los campos marcados con `@pendiente` deben validarse con ese contrato; si cambian, se ajustan
los tipos y `src/services/normalizar.ts`, sin modificar los componentes.

Los formularios y reclamaciones usan el adaptador local en `src/features/reportes`, con SQLite en
Android/iOS. La pestaña **Mis reportes** permite cambiar entre los dos usuarios de demostración desde
sus utilidades. Los datos reales, autenticación, coincidencias y permisos del servidor aún requieren
integración. Consulta [módulo de reportes](docs/modulo-reportes.md) y
[guía de integración](docs/integracion-reportes.md).

## Personalización para otra universidad

Edita el objeto `Marca` en `src/constants/theme.ts` (nombre, colores y radios). Los lugares de
hallazgo provienen de los datos, no del código.

## Cómo contribuir

1. Actualiza tu copia local: `git checkout main && git pull`.
2. Crea una rama por funcionalidad, por ejemplo `git checkout -b feature/nombre-funcionalidad`.
3. Respeta la división de responsabilidades del equipo y el contrato de datos.
4. Antes de abrir un pull request, ejecuta `npx tsc --noEmit` y `npm run lint`.
5. Usa mensajes de commit descriptivos y solicita revisión de al menos un integrante.

## Licencia

Consulta el archivo [LICENSE](LICENSE).
