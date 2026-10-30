**Findyp — Plataforma universitaria de objetos perdidos y encontrados**

Findyp es una aplicación multiplataforma diseñada para facilitar la búsqueda, publicación y recuperación de objetos perdidos dentro de campus universitarios.

La plataforma permite a los estudiantes registrar objetos encontrados, explorar publicaciones mediante filtros, reportar pertenencias extraviadas y consultar posibles coincidencias entre objetos perdidos y encontrados. Incorpora geolocalización mediante mapas interactivos para identificar dónde se extravió un objeto, además de un módulo para gestionar reportes y solicitudes de recuperación.

Desarrollada con **React Native, Expo y TypeScript**, Findyp está diseñada para funcionar en dispositivos móviles y navegadores web. Su arquitectura contempla **Supabase** para la gestión de datos, autenticación y almacenamiento, con una integración al servidor todavía en desarrollo.

Actualmente, el MVP permite demostrar los principales flujos de la aplicación utilizando datos de prueba y almacenamiento local. El proyecto busca ofrecer una solución adaptable a diferentes universidades, promoviendo la colaboración y facilitando la recuperación de pertenencias dentro de la comunidad estudiantil.


## Tecnologías utilizadas

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

- **Lenguajes:** TypeScript y JavaScript.
- **Aplicación:** React Native, React, Expo y Expo Router, con soporte para Android, iOS y web.
- **Mapas:** Leaflet para selección de ubicaciones.
- **Persistencia de demostración:** SQLite en dispositivos móviles y almacenamiento temporal en web.
- **Backend:** Supabase (PostgreSQL, Auth y Storage); conexión con los flujos de usuario todavía en desarrollo.

## Funcionalidades del MVP

### 🔎 Explorar objetos encontrados
- Galería de publicaciones con imágenes e información de los objetos.
- Búsqueda por texto y categorías.
- Filtros por estado, lugar y fecha.
- Pantalla de detalle con la información del objeto seleccionado.

### 📝 Reportar objetos perdidos o encontrados
- Formulario para **publicar un objeto encontrado**.
- Formulario para **registrar la búsqueda de un objeto perdido**.
- Consulta de publicaciones propias desde **Mis reportes**.
- Datos guardados localmente en esta etapa del MVP: SQLite en Android/iOS y durante la sesión en web.

### 📍 Indicar la ubicación en el mapa
- Mapa interactivo con Leaflet para marcar dónde se perdió un objeto.
- Posibilidad de centrar el mapa en la ubicación actual, sin sustituir la ubicación elegida manualmente.
- Las calles del mapa requieren conexión a internet.

### 🧩 Consultar posibles coincidencias
- Pantalla de coincidencias con niveles de similitud entre búsquedas y objetos.
- En el MVP se muestran **coincidencias de demostración**; el procesamiento y la sincronización de datos reales están pendientes de integración.

### 🤝 Gestionar recuperación y reclamaciones
- Flujo de solicitud de recuperación de objetos.
- Visualización de reportes y reclamaciones desde la aplicación.
- Utilidades de demostración para alternar entre usuarios de prueba.

## Estado del desarrollo

| Módulo | Estado actual |
| --- | --- |
| Galería, detalles y filtros | ✅ Disponible en demo |
| Formularios de objetos perdidos y encontrados | ✅ Disponible en demo |
| Selección de ubicación en mapa | ✅ Integrado |
| Mis reportes y reclamaciones | ✅ Funcional con datos locales |
| Coincidencias | 🧪 Ejemplos de demostración |
| Base de datos y API con Supabase | 🚧 Backend preparado; integración parcial |
| Inicio de sesión y sincronización real | ⏳ Pendiente |

> **Nota:** el MVP puede probarse sin conectarse a Supabase mediante datos ficticios. No se debe confundir la demostración local con un servicio de recuperación de objetos ya desplegado para usuarios reales.

## Ejecutar localmente

**Requisitos:** Node.js 24 y npm.

```bash
git clone https://github.com/Sam-ai06/Poli-Lost-and-Found.git
cd Poli-Lost-and-Found
npm install
npm run web
```

Para usarlo en un teléfono, ejecuta `npm start` y abre el proyecto con Expo Go o una compilación de desarrollo compatible.

### Verificaciones

```bash
npm run typecheck
npm run lint
npm run test:reportes
```

## Proyecto adaptable

La identidad visual se centraliza en `src/constants/theme.ts`, lo que facilita personalizar Findyp para otras universidades. El objetivo es que cada institución pueda adaptar la solución a sus espacios y comunidad.

## Licencia

Consulta [LICENSE](LICENSE) para conocer los términos de uso y contribución.
