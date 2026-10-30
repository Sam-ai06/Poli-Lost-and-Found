import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { crearServicioLocal } from '../src/features/reportes/services/local.ts';
import { estadoDemo, usuariosDemo } from '../src/features/reportes/demo/data.ts';
import { incorporarCatalogo } from '../src/features/reportes/demo/catalogo.ts';

test('el catálogo del frontend se vincula a reportes sin duplicarse y conserva los estados al reabrir', async () => {
  const catalogo = JSON.parse(readFileSync(new URL('../src/data/mock/objetos.json', import.meta.url), 'utf8'));
  let snapshot = estadoDemo(); // A v1 snapshot created before integrating the frontend.
  const almacen = { async leer() { return structuredClone(snapshot); }, async guardar(s) { snapshot = structuredClone(s); } };
  const crear = () => crearServicioLocal(almacen, { usuarios: usuariosDemo, inicial: estadoDemo, migrar: s => incorporarCatalogo(s, catalogo) });
  let servicio = crear();
  const fotos = await servicio.listarTodosObjetosPublicos();
  assert.equal(fotos.filter(o => o.id === 'obj-002').length, 1);
  assert.equal(fotos.find(o => o.id === 'obj-002').imagen_url, 'mock://llaves-llavero-rojo');
  assert.ok(!fotos.some(o => o.id === 'obj-003')); // Its simulated recovery history is unknown.
  const solicitud = await servicio.crearReclamacion({ objeto_id: 'obj-002', detalle_verificacion: 'Llavero rojo' });
  await servicio.cambiarUsuario('diego');
  await servicio.resolverReclamacion(solicitud.id, 'aprobada');
  servicio = crear();
  assert.equal((await servicio.obtenerObjeto('obj-002')).estado, 'en_recuperacion');
  await servicio.confirmarEntrega(solicitud.id);
  servicio = crear();
  assert.equal((await servicio.obtenerObjeto('obj-002')).estado, 'entregado');
  assert.equal((await servicio.listarTodosObjetosPublicos()).filter(o => o.id === 'obj-002').length, 1);
  assert.equal((await servicio.obtenerObjeto('obj-002')).imagen_url, 'mock://llaves-llavero-rojo');
});
