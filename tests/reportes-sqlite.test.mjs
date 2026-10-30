import { crearServicioLocal as crearServicioLocal } from '../src/features/reportes/services/local.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { crearAlmacenSQLite } from '../src/features/reportes/storage/snapshot.ts';
import { fechaHoy } from '../src/features/reportes/domain/index.ts';
import { estadoDemo, usuariosDemo } from '../src/features/reportes/demo/data.ts';

test('SQLite real: cerrar conexión y reabrir conserva reportes, imágenes y usuario; reinicio acotado', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'poli-reportes-test-'));
  const ruta = join(dir, 'reportes-v1.db');
  let db;
  function servicio() {
    db = new DatabaseSync(ruta);
    const almacen = crearAlmacenSQLite(async () => ({
      async execAsync(sql) { db.exec(sql); },
      async getFirstAsync(sql) { return db.prepare(sql).get() ?? null; },
      async runAsync(sql, valor) { return db.prepare(sql).run(valor); },
    }));
    return crearServicioLocal(almacen, { usuarios: usuariosDemo, inicial: estadoDemo });
  }
  try {
    let s = servicio();
    db.exec("CREATE TABLE otro_modulo (valor TEXT); INSERT INTO otro_modulo VALUES ('conservar')");
    await s.cambiarUsuario('diego');
    const b = await s.crearBusqueda({ categoria: 'otros', descripcion: 'Cuaderno', color: null, fecha_perdida: fechaHoy(), lugar_aproximado: 'FIEC', imagen_url: 'file:///documents/imagen-persistente.jpg' });
    db.close(); s = servicio();
    assert.equal((await s.usuarioActual()).id, 'diego');
    assert.equal((await s.listarMisBusquedas())[0].id, b.id);
    assert.equal((await s.listarMisBusquedas())[0].imagen_url, 'file:///documents/imagen-persistente.jpg');
    await s.cambiarUsuario('ana');
    const vinculada = await s.crearBusqueda({ categoria: 'llaves', descripcion: 'Llaves con tortuga', color: null, fecha_perdida: null, lugar_aproximado: null, imagen_url: null });
    const r = await s.crearReclamacion({ objeto_id: 'demo-llaves', busqueda_id: vinculada.id, detalle_verificacion: 'Llavero de tortuga' });
    await s.cambiarUsuario('diego'); await s.resolverReclamacion(r.id, 'aprobada');
    db.close(); s = servicio();
    assert.equal((await s.obtenerObjeto('demo-llaves')).estado, 'en_recuperacion');
    assert.equal((await s.listarReclamacionesRecibidas())[0].reclamacion.estado, 'aprobada');
    await s.confirmarEntrega(r.id);
    db.close(); s = servicio(); await s.cambiarUsuario('ana');
    assert.equal((await s.obtenerObjeto('demo-llaves')).estado, 'entregado');
    assert.equal((await s.listarMisReclamaciones())[0].reclamacion.estado, 'entregada');
    assert.equal((await s.listarMisBusquedas())[0].estado, 'resuelta');
    await s.reiniciarDemo();
    assert.equal((await s.usuarioActual()).id, 'ana');
    assert.equal((await s.listarMisBusquedas()).length, 0);
    assert.equal(db.prepare('SELECT valor FROM otro_modulo').get().valor, 'conservar');
  } finally {
    db?.close(); rmSync(join(dir, 'reportes-v1.db'), { force: true }); rmdirSync(dir);
  }
});
