import test from 'node:test';
import assert from 'node:assert/strict';
import { coordenadasValidas, normalizarCoordenadas, leerMensajeMapa } from '../src/features/ubicacion/domain.ts';
import { crearServicioLocal } from '../src/features/reportes/services/local.ts';
import { estadoDemo, usuariosDemo } from '../src/features/reportes/demo/data.ts';

const punto = { latitud: -2.1455, longitud: -79.966 };
const datos = () => ({ categoria: 'llaves', descripcion: 'Llaves junto a la biblioteca', color: null, fecha_perdida: null, lugar_aproximado: 'Biblioteca', imagen_url: null, ubicacion_perdida: { ...punto } });
function entorno() {
  let snapshot = null;
  const almacen = { async leer() { return structuredClone(snapshot); }, async guardar(s) { snapshot = structuredClone(s); } };
  return { crear: () => crearServicioLocal(almacen, { usuarios: usuariosDemo, inicial: estadoDemo }), almacen };
}

test('coordenadas: acepta cero y límites; rechaza texto, valores infinitos e incompletos', () => {
  for (const p of [punto, { latitud: 0, longitud: 0 }, { latitud: 90, longitud: -180 }]) assert.equal(coordenadasValidas(p), true);
  for (const p of [null, {}, { latitud: 91, longitud: 1 }, { latitud: 1, longitud: -181 }, { latitud: NaN, longitud: 1 }, { latitud: 1, longitud: Infinity }, { latitud: '-2.1', longitud: -79 }]) assert.equal(coordenadasValidas(p), false);
  assert.equal(normalizarCoordenadas(undefined), null);
  assert.throws(() => normalizarCoordenadas({ latitud: 100, longitud: 1 }), /ubicación/);
  assert.deepEqual(normalizarCoordenadas({ ...punto, precision: 20, secreto: 'no copiar' }), punto);
});

test('puente del mapa: descarta mensajes ajenos, malformados o demasiado grandes', () => {
  for (const mensaje of ['mal JSON', 'x'.repeat(2001), { tipo: 'seleccion', coordenadas: punto }, { canal: 'otro', tipo: 'seleccion', coordenadas: punto }, { canal: 'findyp-mapa-v1', tipo: 'seleccion', coordenadas: { latitud: 999, longitud: 0 } }]) assert.equal(leerMensajeMapa(mensaje), null);
  const mensaje = { canal: 'findyp-mapa-v1', tipo: 'seleccion', coordenadas: punto };
  assert.deepEqual(leerMensajeMapa(JSON.stringify(mensaje)), mensaje);
  assert.deepEqual(leerMensajeMapa({ ...mensaje, token: 'no copiar' }), mensaje);
});

test('mapa: crear, editar, reabrir y quitar el punto mantiene independiente el lugar escrito', async () => {
  const e = entorno(); let s = e.crear();
  const entrada = datos(); const b = await s.crearBusqueda(entrada);
  entrada.ubicacion_perdida.latitud = 0;
  s = e.crear();
  let guardada = (await s.listarMisBusquedas())[0];
  assert.deepEqual(guardada.ubicacion_perdida, punto);
  assert.equal(guardada.lugar_aproximado, 'Biblioteca');
  const nuevo = { latitud: -2.1444, longitud: -79.9677 };
  await s.actualizarBusqueda(b.id, { ...datos(), ubicacion_perdida: nuevo });
  assert.deepEqual((await e.crear().listarMisBusquedas())[0].ubicacion_perdida, nuevo);
  const interfazAntigua = datos(); delete interfazAntigua.ubicacion_perdida;
  await s.actualizarBusqueda(b.id, interfazAntigua);
  assert.deepEqual((await s.listarMisBusquedas())[0].ubicacion_perdida, nuevo);
  await s.actualizarBusqueda(b.id, { ...datos(), ubicacion_perdida: null });
  guardada = (await s.listarMisBusquedas())[0];
  assert.equal(guardada.ubicacion_perdida, null); assert.equal(guardada.lugar_aproximado, 'Biblioteca');
});

test('búsquedas v1 sin mapa se abren con coordenadas null sin alterar otros registros', async () => {
  const e = entorno(), s = e.crear(); const b = await s.crearBusqueda(datos());
  const antiguo = await e.almacen.leer(); delete antiguo.busquedas[0].ubicacion_perdida;
  await e.almacen.guardar(antiguo);
  const [migrada] = await e.crear().listarMisBusquedas();
  assert.equal(migrada.id, b.id); assert.equal(migrada.ubicacion_perdida, null); assert.equal(migrada.lugar_aproximado, 'Biblioteca');
  assert.equal((await s.listarMisObjetos())[0].id, 'demo-termo');
});

test('coordenadas inválidas o cambios de un usuario ajeno no alteran la búsqueda guardada', async () => {
  const e = entorno(), s = e.crear(); const b = await s.crearBusqueda(datos());
  const antes = await e.almacen.leer();
  await assert.rejects(s.actualizarBusqueda(b.id, { ...datos(), ubicacion_perdida: { latitud: 100, longitud: 0 } }), /ubicación/);
  assert.deepEqual(await e.almacen.leer(), antes);
  await s.cambiarUsuario('diego');
  assert.equal((await s.listarMisBusquedas()).length, 0);
  await assert.rejects(s.actualizarBusqueda(b.id, datos()), /pertenece/);
});

test('flujo general: búsqueda con mapa → coincidencia → reclamación → entrega conserva el punto', async () => {
  const e = entorno(); let s = e.crear(); const b = await s.crearBusqueda(datos());
  const coincidencias = await s.solicitarCoincidencias(b.id);
  assert.equal(coincidencias[0].id, 'demo-llaves');
  assert.ok(coincidencias.every(o => !('ubicacion_perdida' in o)));
  const r = await s.crearReclamacion({ objeto_id: coincidencias[0].id, busqueda_id: b.id, detalle_verificacion: 'Llavero de tortuga' });
  await s.cambiarUsuario('diego'); await s.resolverReclamacion(r.id, 'aprobada'); await s.confirmarEntrega(r.id);
  s = e.crear(); await s.cambiarUsuario('ana');
  const [resuelta] = await s.listarMisBusquedas();
  assert.equal(resuelta.estado, 'resuelta'); assert.deepEqual(resuelta.ubicacion_perdida, punto);
  assert.equal((await s.obtenerObjeto('demo-llaves')).estado, 'entregado');
  assert.equal((await s.listarMisReclamaciones())[0].reclamacion.estado, 'entregada');
});
