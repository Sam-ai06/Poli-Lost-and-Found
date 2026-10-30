/* global Deno */
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
};

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

async function handler(request) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

  const url = new URL(request.url);
  const match = url.pathname.match(/^(?:\/functions\/v1)?\/api\/(objetos|busquedas|reclamaciones)(?:\/([^/]+))?\/?$/);
  if (!match) return json({ error: 'Ruta no encontrada.' }, 404);
  const [, resource, id] = match;
  if (id && !uuid.test(id)) return json({ error: 'El identificador debe ser un UUID válido.' }, 400);
  const method = request.method;
  const isRead = method === 'GET' && (resource === 'objetos' || (resource === 'reclamaciones' && !id));
  const action = method === 'POST' && !id ? { objetos: 'crear_objeto', busquedas: 'crear_busqueda', reclamaciones: 'crear_reclamacion' }[resource]
    : method === 'PATCH' && resource === 'reclamaciones' && id ? 'gestionar_reclamacion'
    : method === 'DELETE' && resource === 'objetos' && id ? 'eliminar_objeto' : null;
  if (!isRead && !action) return json({ error: 'Método o ruta no admitidos.' }, 405);

  const base = Deno.env.get('SUPABASE_URL');
  const keys = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS');
  const key = keys ? JSON.parse(keys).default : Deno.env.get('SUPABASE_ANON_KEY');
  if (!base || !key) return json({ error: 'El servidor no está configurado.' }, 500);
  const authorization = request.headers.get('Authorization');
  const headers = { apikey: key, ...(authorization ? { Authorization: authorization } : {}) };

  try {
    if (action || resource === 'reclamaciones') {
      if (!authorization?.startsWith('Bearer ')) return json({ error: 'Inicia sesión para realizar esta operación.' }, 401);
      const authResponse = await fetch(`${base}/auth/v1/user`, { headers });
      if (!authResponse.ok) return json({ error: 'La sesión no es válida o ha caducado.' }, 401);
    }

    if (isRead) {
      if (resource === 'reclamaciones') {
        const limit = url.searchParams.get('limit') ?? '20';
        const offset = url.searchParams.get('offset') ?? '0';
        if (!/^\d+$/.test(limit) || !/^\d+$/.test(offset) || Number(limit) < 1 || Number(limit) > 100 || Number(offset) > 100000) {
          return json({ error: 'Paginación inválida: limit debe estar entre 1 y 100, y offset entre 0 y 100000.' }, 400);
        }
        const query = new URLSearchParams({ select: '*', order: 'creado_en.desc,id.desc', limit, offset });
        const objetoId = url.searchParams.get('objeto_id');
        if (objetoId && !uuid.test(objetoId)) return json({ error: 'El identificador debe ser un UUID válido.' }, 400);
        if (objetoId) query.set('objeto_id', `eq.${objetoId}`);
        const response = await fetch(`${base}/rest/v1/reclamaciones?${query}`, { headers });
        if (!response.ok) return json({ error: 'No se pudieron consultar las reclamaciones.' }, response.status >= 500 ? 502 : response.status);
        return json({ data: await response.json(), limit: Number(limit), offset: Number(offset) });
      }
      const query = new URLSearchParams({ select: '*,objeto_imagenes(id,ruta_storage,tipo,orden)' });
      if (id) query.set('id', `eq.${id}`);
      else {
        const limit = url.searchParams.get('limit') ?? '20';
        const offset = url.searchParams.get('offset') ?? '0';
        if (!/^\d+$/.test(limit) || !/^\d+$/.test(offset) || Number(limit) < 1 || Number(limit) > 100 || Number(offset) > 100000) {
          return json({ error: 'Paginación inválida: limit debe estar entre 1 y 100, y offset entre 0 y 100000.' }, 400);
        }
        query.set('estado', 'eq.disponible');
        query.set('order', 'creado_en.desc,id.desc');
        query.set('limit', limit);
        query.set('offset', offset);
      }
      const response = await fetch(`${base}/rest/v1/objetos?${query}`, { headers });
      if (!response.ok) return json({ error: 'No se pudieron consultar los objetos.' }, response.status >= 500 ? 502 : response.status);
      const data = await response.json();
      if (id) return data.length ? json(data[0]) : json({ error: 'Objeto no encontrado.' }, 404);
      return json({ data, limit: Number(query.get('limit')), offset: Number(query.get('offset')) });
    }

    let body = {};
    if (method !== 'DELETE') {
      try { body = await request.json(); } catch { return json({ error: 'El cuerpo debe ser JSON válido.' }, 400); }
      if (!body || Array.isArray(body) || typeof body !== 'object') return json({ error: 'El cuerpo debe ser un objeto JSON.' }, 400);
    }
    const response = await fetch(`${base}/rest/v1/rpc/api_mutar`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ operacion: action, datos: body, recurso_id: id ?? null }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (response.status >= 400 && response.status < 500) {
        return json({ error: error.message || 'Datos inválidos.' }, response.status);
      }
      console.error('Error de base de datos:', error.code);
      return json({ error: 'No se pudo completar la operación.' }, 500);
    }
    const data = await response.json();
    return json(data, method === 'POST' ? 201 : 200);
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    return json({ error: 'No se pudo conectar con Supabase.' }, 502);
  }
}

if (import.meta.main) Deno.serve(handler);
export { handler };
