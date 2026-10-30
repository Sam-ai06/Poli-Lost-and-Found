// Requires two disposable, already-confirmed test accounts; never uses a service key.
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';

const [email1, email2, password] = process.argv.slice(2);
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key || !email1 || !email2 || !password) throw new Error('Faltan los datos de prueba.');
const cliente = () => createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const autor = cliente();
const otro = cliente();
const anonimo = cliente();
const png = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aV4sAAAAASUVORK5CYII=', 'base64'));
const imagenes = [];

function verificar(resultado) { if (resultado.error) throw resultado.error; return resultado.data; }

try {
  const sesion1 = verificar(await autor.auth.signInWithPassword({ email: email1, password }));
  const sesion2 = verificar(await otro.auth.signInWithPassword({ email: email2, password }));
  const user1 = sesion1.user.id;
  const user2 = sesion2.user.id;
  const perfil = verificar(await autor.from('perfiles').select('nombre').eq('id', user1).single());
  assert.equal(perfil.nombre, 'Cuenta de prueba');
  verificar(await autor.from('archivos_migracion_local').upsert({ usuario_id: user1, snapshot: { version: 1, privado: 'respaldo' } }));
  assert.equal(verificar(await otro.from('archivos_migracion_local').select('usuario_id').eq('usuario_id', user1)).length, 0);

  const rutaObjeto = `${user1}/prueba-${Date.now()}.png`;
  const rutaBusqueda = `${user1}/busqueda-${Date.now()}.png`;
  verificar(await autor.storage.from('objetos-imagenes').upload(rutaObjeto, png, { contentType: 'image/png' }));
  imagenes.push(['objetos-imagenes', rutaObjeto]);
  verificar(await autor.storage.from('busquedas-imagenes').upload(rutaBusqueda, png, { contentType: 'image/png' }));
  imagenes.push(['busquedas-imagenes', rutaBusqueda]);

  const objetoId = verificar(await autor.rpc('guardar_reporte', { tipo: 'objeto', datos: {
    titulo: 'Prueba de integración', categoria: 'otros', descripcion: 'Objeto de prueba temporal',
    fecha_hallazgo: '2026-01-01', lugar_hallazgo: 'Biblioteca', tipo_entrega: 'coordinar_contacto',
    contacto: 'privado@example.invalid', caracteristica_reservada: 'Dato reservado', tipo_imagen: 'fotografia', ruta_storage: rutaObjeto,
  } }));
  const publico = verificar(await anonimo.from('objetos').select('id,objeto_imagenes(ruta_storage)').eq('id', objetoId).single());
  assert.equal(publico.objeto_imagenes[0].ruta_storage, rutaObjeto);
  const fotoPublica = await fetch(autor.storage.from('objetos-imagenes').getPublicUrl(rutaObjeto).data.publicUrl);
  assert.equal(fotoPublica.status, 200);

  const busquedaId = verificar(await autor.rpc('guardar_reporte', { tipo: 'busqueda', datos: {
    categoria: 'otros', descripcion: 'Búsqueda de prueba temporal', ruta_storage: rutaBusqueda,
    ubicacion_perdida: { latitud: -2.1, longitud: -79.9 },
  } }));
  assert.equal(verificar(await autor.from('busquedas').select('id').eq('id', busquedaId)).length, 1);
  assert.equal(verificar(await otro.from('busquedas').select('id').eq('id', busquedaId)).length, 0);
  const signed = verificar(await autor.storage.from('busquedas-imagenes').createSignedUrl(rutaBusqueda, 60));
  assert.equal((await fetch(signed.signedUrl)).status, 200);
  assert.ok((await otro.storage.from('busquedas-imagenes').createSignedUrl(rutaBusqueda, 60)).error);
  assert.ok((await otro.storage.from('objetos-imagenes').upload(`${user1}/intruso.png`, png, { contentType: 'image/png' })).error);
  assert.equal(verificar(await otro.from('objetos_detalles_reservados').select('*').eq('objeto_id', objetoId)).length, 0);
  assert.ok((await otro.from('archivos_migracion_local').upsert({ usuario_id: user1, snapshot: {} })).error);
  assert.equal(user1 === user2, false);
  console.log('Autenticación, perfiles, objetos, búsquedas, imágenes y permisos verificados.');
} finally {
  for (const [bucket, ruta] of imagenes) {
    const { error } = await autor.storage.from(bucket).remove([ruta]);
    if (error) console.error('No se pudo eliminar la imagen temporal:', bucket, ruta, error.message);
  }
  await autor.auth.signOut();
  await otro.auth.signOut();
}
