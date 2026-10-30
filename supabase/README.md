# API de objetos perdidos

La API está desplegada en `https://gbwrmyfotkainzgaseet.supabase.co/functions/v1/api`. Las rutas siguientes son relativas a esa dirección.

Envía `apikey: <EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY>` en cada petición. Para escribir o consultar reclamaciones, envía también `Authorization: Bearer <access_token>` de una sesión de Supabase Auth. La función verifica el token con Supabase Auth y la base de datos comprueba la identidad y los permisos. Las lecturas públicas de objetos no necesitan sesión.

Todos los cuerpos son JSON (`Content-Type: application/json`). Las fechas usan `YYYY-MM-DD`, los identificadores son UUID y los campos opcionales pueden omitirse o enviarse como `null`. Las respuestas de error tienen la forma `{"error":"mensaje"}`; incluyen 400 para datos incorrectos, 401 para sesión ausente o inválida, 403 para falta de permiso, 404 para un recurso no encontrado y 409 para conflictos de estado.

## Rutas

| Método y ruta | Cuerpo o parámetros | Resultado |
| --- | --- | --- |
| `GET /objetos` | `limit` (1–100, por defecto 20), `offset` (0–100000, por defecto 0) | `{data, limit, offset}` con objetos disponibles y sus `objeto_imagenes`. |
| `GET /objetos/:id` | — | Objeto visible con `objeto_imagenes`; el autor también puede ver sus objetos en otros estados. |
| `POST /objetos` | Ver ejemplo | Objeto creado, con `publicado_por` tomado de la sesión. |
| `POST /busquedas` | Ver ejemplo | Búsqueda creada, con `usuario_id` tomado de la sesión. |
| `POST /reclamaciones` | Ver ejemplo | Reclamación pendiente, con `solicitante_id` tomado de la sesión. |
| `GET /reclamaciones` | `objeto_id` opcional; `limit` y `offset` como en el feed | `{data, limit, offset}` con las reclamaciones del solicitante y las recibidas por el autor de un objeto. |
| `PATCH /reclamaciones/:id` | `{"estado":"aprobada"}`, `{"estado":"rechazada"}` o `{"estado":"entregada"}` | Reclamación actualizada. Solo puede gestionarla el autor del objeto. |
| `DELETE /objetos/:id` | — | `{"id":"...","eliminado":true}`. Solo el autor puede eliminarlo. |

Los valores de `categoria` son `documentos`, `llaves`, `electronica`, `botellas_termos`, `ropa` y `otros`.

### Publicar un objeto

```json
{
  "titulo": "Llaves azules",
  "categoria": "llaves",
  "color": "azul",
  "descripcion": "Juego de llaves encontrado cerca de la biblioteca",
  "fecha_hallazgo": "2026-10-01",
  "lugar_hallazgo": "Biblioteca",
  "tipo_entrega": "punto_entrega",
  "punto_entrega": "Recepción"
}
```

`tipo_entrega` acepta `punto_entrega` o `coordinar_contacto`. Para `punto_entrega`, el campo homónimo es obligatorio; para `coordinar_contacto`, debe omitirse o ser `null`. El título debe tener entre 3 y 120 caracteres; la descripción, entre 5 y 2000; y el lugar, entre 2 y 200.

### Registrar una búsqueda

```json
{
  "categoria": "llaves",
  "descripcion": "Perdí un juego de llaves azules",
  "color": "azul",
  "fecha_perdida": "2026-10-01",
  "lugar_aproximado": "Biblioteca"
}
```

Solo `categoria` y `descripcion` son obligatorios. La descripción debe tener entre 5 y 2000 caracteres.

### Solicitar recuperación

```json
{
  "objeto_id": "UUID-del-objeto",
  "busqueda_id": "UUID-de-la-busqueda",
  "prueba_propiedad": "Descripción que permite identificar las llaves"
}
```

`busqueda_id` es opcional y, si se proporciona, debe pertenecer al solicitante. La prueba debe tener entre 5 y 2000 caracteres. No se puede reclamar un objeto propio ni duplicar una reclamación activa.

El autor puede aprobar o rechazar una reclamación pendiente. Aprobarla cambia el objeto a `en_recuperacion`; después se puede marcar esa reclamación como `entregada`, lo que cambia el objeto a `entregado`. No se puede aprobar otra reclamación mientras el objeto está en recuperación. Una reclamación pendiente puede rechazarse incluso si otra ya se aprobó. Los objetos con reclamaciones no se pueden eliminar: la API devuelve 409 para conservar el historial.

La app sube las imágenes de objetos al bucket público `objetos-imagenes` y las imágenes de búsquedas al bucket privado `busquedas-imagenes`. Las tablas guardan la ruta; las imágenes privadas se muestran mediante enlaces temporales. La app usa el RPC `guardar_reporte` para crear o editar el registro y asociar su imagen en una transacción. Los archivos SQL `integracion-app.sql` y `archivo-local.sql` contienen las políticas y la migración aplicadas.

## Ejemplo desde Expo

```ts
import { supabase } from '@/lib/supabase';

const { data: { session } } = await supabase.auth.getSession();
if (!session) throw new Error('Debes iniciar sesión');

const response = await fetch(
  `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/api/busquedas`,
  {
    method: 'POST',
    headers: {
      apikey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ categoria: 'llaves', descripcion: 'Perdí unas llaves azules' }),
  },
);
const result = await response.json();
if (!response.ok) throw new Error(result.error);
```

## Mantenimiento y pruebas

La función está en `functions/api/index.js` y el SQL aplicado al esquema existente en `backend.sql`. El registro de migraciones remoto contiene `backend_operaciones` y `lectura_reclamaciones`. `test-backend.sql` verifica las transiciones y los permisos dentro de una transacción revertida; ejecútalo únicamente en un entorno adecuado para pruebas. La comprobación HTTP sin modificar datos se ejecuta con `node --env-file=.env.local scripts/test-api.mjs`.
