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

- Node.js LTS y npm
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

## Pruebas y verificaciones

| Comando | Descripción |
| --- | --- |
| `npx tsc --noEmit` | Comprobación de tipos de TypeScript |
| `npm run lint` | Lint con la configuración de Expo (`expo lint`) |
| `npx expo-doctor` | Diagnóstico de dependencias y configuración de Expo |

`npm run test:reportes` ejecuta las pruebas del módulo y su integración con el catálogo. Requiere
Node 24. La configuración de ESLint ya está incluida en el repositorio.

## Estructura del repositorio

```text
src/
  app/                  Rutas de Expo Router (cada archivo es una pantalla)
    (tabs)/             Pestañas: Explorar (galería), Mis reportes y Perfil
    objeto/[id].tsx     Detalle de un objeto
    coincidencias/      Coincidencias de una búsqueda
    publicar.tsx        Publicación de objetos
    buscar.tsx          Registro de búsquedas
    recuperacion/       Solicitud de recuperación
    demo-reportes/      Coincidencias locales, reclamaciones y utilidades demo
  components/           Componentes reutilizables de interfaz
  constants/theme.ts    Tokens de diseño; `Marca` define colores y radios de Findyp
  data/mock/            Datos ficticios en JSON
  hooks/                Hooks de datos y utilidades
  services/             Capa de acceso a datos (proveedores)
  types/findyp.ts       Modelos y enums de dominio
  utils/                Formato de fechas y etiquetas
assets/                 Íconos e imágenes (images/mock: fotos de prueba)
```

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
