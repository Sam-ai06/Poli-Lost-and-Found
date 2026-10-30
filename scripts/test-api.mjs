import assert from 'node:assert/strict';

const base = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/api`;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!key || !process.env.EXPO_PUBLIC_SUPABASE_URL) throw new Error('Falta la configuración de Supabase.');

async function call(path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: { apikey: key, ...options.headers },
    signal: AbortSignal.timeout(15000),
  });
  return { status: response.status, body: await response.json() };
}

const feed = await call('/objetos');
assert.equal(feed.status, 200);
assert.ok(Array.isArray(feed.body.data));
assert.equal((await call('/objetos/no-es-uuid')).status, 400);
assert.equal((await call('/objetos/00000000-0000-4000-8000-000000000000')).status, 404);
assert.equal((await call('/objetos?limit=101')).status, 400);
assert.equal((await call('/objetos', { method: 'POST', headers: { Authorization: 'Bearer invalid' } })).status, 401);
for (const [method, path] of [
  ['POST', '/objetos'],
  ['POST', '/busquedas'],
  ['POST', '/reclamaciones'],
  ['PATCH', '/reclamaciones/00000000-0000-4000-8000-000000000000'],
  ['DELETE', '/objetos/00000000-0000-4000-8000-000000000000'],
  ['GET', '/reclamaciones'],
]) {
  assert.equal((await call(path, { method })).status, 401, `${method} ${path}`);
}
console.log('API: feed, detalle, validación y protección de operaciones comprobados.');
