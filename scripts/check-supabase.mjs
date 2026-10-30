const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error('Faltan las variables de Supabase en .env.local.');
}

const response = await fetch(`${url}/auth/v1/settings`, {
  headers: { apikey: key },
  signal: AbortSignal.timeout(15000),
});

if (!response.ok) {
  throw new Error(`La API de Supabase devolvió HTTP ${response.status}.`);
}

const settings = await response.json();
if (!settings.external) {
  throw new Error('La API no devolvió una configuración válida.');
}
console.log('Conexión con la API de Supabase verificada.');
