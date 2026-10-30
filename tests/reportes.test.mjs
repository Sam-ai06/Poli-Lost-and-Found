import { crearServicioLocal as factory } from '../src/features/reportes/services/local.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { fechaHoy, fechaValida, validarEstado as validar } from '../src/features/reportes/domain/index.ts';
import { estadoDemo, usuariosDemo } from '../src/features/reportes/demo/data.ts';
const crearServicioLocal = almacen => factory(almacen, { usuarios: usuariosDemo, inicial: estadoDemo });
const validarEstado = raw => validar(raw, usuariosDemo);

function entorno() {
  let datos = null;
  let falla = false;
  const almacen = {
    async leer() { return structuredClone(datos); },
    async guardar(s) { if (falla) throw new Error('Disco lleno'); datos = structuredClone(s); },
  };
  return { servicio: crearServicioLocal(almacen), reiniciar: () => crearServicioLocal(almacen), snapshot: () => structuredClone(datos), fallar: v => { falla = v; } };
}
const objeto = () => ({ titulo: 'Cuaderno rojo', categoria: 'otros', descripcion: 'Cuaderno de notas', color: 'Rojo', imagen_url: 'file:///documents/cuaderno.jpg', tipo_imagen: 'fotografia', fecha_hallazgo: fechaHoy(), lugar_hallazgo: 'FIEC', modalidad_entrega: 'punto_entrega', punto_entrega: 'Recepción', contacto: null, caracteristica_reservada: 'Iniciales privadas' });
const busqueda = () => ({ categoria: 'llaves', descripcion: 'Tres llaves', color: null, fecha_perdida: null, lugar_aproximado: null, imagen_url: null });

test('publica, edita, conserva privados y recupera datos tras crear una nueva instancia', async () => {
  const e = entorno(); const o = await e.servicio.crearObjeto(objeto());
  await e.servicio.actualizarObjeto(o.id, { ...objeto(), titulo: 'Cuaderno de clases' });
  const nuevo = e.reiniciar(); const guardado = (await nuevo.listarMisObjetos()).find(v => v.id === o.id);
  assert.equal(guardado.titulo, 'Cuaderno de clases'); assert.equal(guardado.imagen_url, objeto().imagen_url);
  assert.equal(guardado.caracteristica_reservada, 'Iniciales privadas');
  const publico = await nuevo.obtenerObjeto(o.id);
  assert.equal('caracteristica_reservada' in publico, false); assert.equal('contacto' in publico, false);
});
test('filtra por usuario e impide editar objetos y búsquedas ajenos', async () => {
  const { servicio: s } = entorno(); const o = await s.crearObjeto(objeto()); const b = await s.crearBusqueda(busqueda());
  await s.cambiarUsuario('diego');
  assert.ok((await s.listarMisObjetos()).every(v => v.publicador_id === 'diego'));
  assert.equal((await s.listarMisBusquedas()).length, 0);
  await assert.rejects(s.actualizarObjeto(o.id, objeto()), /propios/);
  await assert.rejects(s.actualizarBusqueda(b.id, busqueda()), /pertenece/);
  await assert.rejects(s.cerrarBusqueda(b.id), /pertenece/);
});
test('búsquedas: crear, editar, coincidencias públicas y cierre con historial', async () => {
  const e = entorno(); const s = e.servicio; const b = await s.crearBusqueda(busqueda());
  await s.actualizarBusqueda(b.id, { ...busqueda(), color: 'Negro' });
  const matches = await s.solicitarCoincidencias(b.id);
  assert.equal(matches[0].id, 'demo-llaves'); assert.ok(matches.every(o => !('contacto' in o)));
  await s.cerrarBusqueda(b.id);
  assert.equal((await e.reiniciar().listarMisBusquedas())[0].estado, 'cerrada');
  await assert.rejects(s.actualizarBusqueda(b.id, busqueda()), /activas/);
});
test('valida fechas reales, campos obligatorios y modalidad de entrega', async () => {
  const { servicio: s } = entorno();
  assert.equal(fechaValida('2025-02-29'), false); assert.equal(fechaValida('2024-02-29'), true);
  await assert.rejects(s.crearObjeto({ ...objeto(), titulo: ' ' }), /Título/);
  await assert.rejects(s.crearObjeto({ ...objeto(), fecha_hallazgo: '2026-02-30' }), /Fecha/);
  await assert.rejects(s.crearObjeto({ ...objeto(), modalidad_entrega: 'contacto' }), /contacto/i);
  await assert.rejects(s.crearBusqueda({ ...busqueda(), categoria: 'inexistente' }), /categoría/);
  await assert.rejects(s.crearBusqueda({ ...busqueda(), fecha_perdida: '2039-12-31' }), /Fecha/);
});
test('fallo de guardado no altera datos; la siguiente operación puede reintentarse', async () => {
  const e = entorno(); await e.servicio.usuarioActual(); const antes = e.snapshot();
  e.fallar(true); await assert.rejects(e.servicio.crearObjeto(objeto()), /Disco lleno/);
  assert.deepEqual(e.snapshot(), antes); e.fallar(false); await e.servicio.crearObjeto(objeto());
  assert.equal((await e.servicio.listarMisObjetos()).length, 2);
});
test('operaciones simultáneas conservan ambos registros y no filtran datos mutables', async () => {
  const { servicio: s } = entorno();
  await Promise.all([s.crearBusqueda(busqueda()), s.crearBusqueda(busqueda())]);
  const result = await s.listarMisBusquedas(); assert.equal(result.length, 2);
  result[0].descripcion = 'Mutado'; assert.equal((await s.listarMisBusquedas())[0].descripcion, 'Tres llaves');
});
test('datos locales incompatibles fallan sin restablecer silenciosamente', () => {
  assert.throws(() => validarEstado({ version: 5 }), /incompatible/);
  const s = estadoDemo(); s.objetos[0].categoria = 'INVALIDO'; assert.throws(() => validarEstado(s), /categoría/);
});

test('reclamación: permisos, rechazo con historial, aprobación y entrega separadas', async () => {
  const e = entorno(), s = e.servicio;
  await assert.rejects(s.crearReclamacion({ objeto_id: 'demo-termo', detalle_verificacion: 'Iniciales' }), /propio/);
  await s.cambiarUsuario('diego');
  const b = await s.crearBusqueda({ ...busqueda(), categoria: 'botellas_termos' });
  const datos = { objeto_id: 'demo-termo', busqueda_id: b.id, detalle_verificacion: 'Iniciales AT en la base' };
  const r = await s.crearReclamacion(datos);
  assert.equal(r.estado, 'pendiente');
  await assert.rejects(s.crearReclamacion(datos), /activa/);
  await assert.rejects(s.resolverReclamacion(r.id, 'aprobada'), /publicó/);
  await assert.rejects(s.confirmarEntrega(r.id), /publicó/);
  await assert.rejects(s.obtenerInstruccionesEntrega(r.id), /después/);
  assert.equal((await s.listarReclamacionesRecibidas()).length, 0);
  assert.equal((await s.listarMisReclamaciones())[0].reclamacion.detalle_verificacion, datos.detalle_verificacion);
  await s.cambiarUsuario('ana');
  assert.equal((await s.listarReclamacionesRecibidas()).length, 1);
  assert.equal((await s.listarMisReclamaciones()).length, 0);
  await assert.rejects(s.confirmarEntrega(r.id), /Primero/);
  await s.resolverReclamacion(r.id, 'rechazada');
  assert.equal((await s.obtenerObjeto('demo-termo')).estado, 'disponible');
  await s.cambiarUsuario('diego'); const otra = await s.crearReclamacion(datos);
  await s.cambiarUsuario('ana'); await s.resolverReclamacion(otra.id, 'aprobada');
  assert.equal((await s.obtenerObjeto('demo-termo')).estado, 'en_recuperacion');
  await assert.rejects(s.resolverReclamacion(otra.id, 'aprobada'), /pendiente/);
  await s.confirmarEntrega(otra.id);
  const nuevo = e.reiniciar();
  assert.equal((await nuevo.obtenerObjeto('demo-termo')).estado, 'entregado');
  await nuevo.cambiarUsuario('diego');
  assert.equal((await nuevo.listarMisBusquedas())[0].estado, 'resuelta');
  assert.deepEqual((await nuevo.listarMisReclamaciones()).map(v => v.reclamacion.estado), ['entregada', 'rechazada']);
  await assert.rejects(nuevo.crearReclamacion(datos), /entregado/);
});

test('no permite vincular una búsqueda ajena ni duplicar solicitudes simultáneas', async () => {
  const { servicio: s } = entorno(); const b = await s.crearBusqueda(busqueda());
  await s.cambiarUsuario('diego');
  await assert.rejects(s.crearReclamacion({ objeto_id: 'demo-termo', busqueda_id: b.id, detalle_verificacion: 'Detalle' }), /tuya/);
  const datos = { objeto_id: 'demo-termo', detalle_verificacion: 'Detalle' };
  const resultados = await Promise.allSettled([s.crearReclamacion(datos), s.crearReclamacion(datos)]);
  assert.equal(resultados.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal((await s.listarMisReclamaciones()).length, 1);
});

test('una sola aprobación por objeto y cierre de otras pendientes al entregar', async () => {
  let datos = null;
  const usuarios = [...usuariosDemo, { id: 'tercero', nombre: 'Tercer usuario', correo: 'tercero@example.test' }];
  const s = factory({ async leer() { return structuredClone(datos); }, async guardar(v) { datos = structuredClone(v); } }, { usuarios, inicial: estadoDemo });
  await s.cambiarUsuario('diego'); const a = await s.crearReclamacion({ objeto_id: 'demo-termo', detalle_verificacion: 'Detalle A' });
  await s.cambiarUsuario('tercero'); const b = await s.crearReclamacion({ objeto_id: 'demo-termo', detalle_verificacion: 'Detalle B' });
  await s.cambiarUsuario('ana');
  const resultados = await Promise.allSettled([s.resolverReclamacion(a.id, 'aprobada'), s.resolverReclamacion(b.id, 'aprobada')]);
  assert.equal(resultados.filter(r => r.status === 'fulfilled').length, 1);
  await s.confirmarEntrega(a.id);
  assert.equal((await s.listarReclamacionesRecibidas()).find(v => v.reclamacion.id === b.id).reclamacion.estado, 'rechazada');
});

test('fallo al confirmar entrega mantiene íntegros objeto, reclamación y búsqueda', async () => {
  const e = entorno(), s = e.servicio;
  await s.cambiarUsuario('diego'); const b = await s.crearBusqueda(busqueda());
  const r = await s.crearReclamacion({ objeto_id: 'demo-termo', busqueda_id: b.id, detalle_verificacion: 'Iniciales' });
  await s.cambiarUsuario('ana'); await s.resolverReclamacion(r.id, 'aprobada');
  const antes = e.snapshot(); e.fallar(true);
  await assert.rejects(s.confirmarEntrega(r.id), /Disco lleno/); assert.deepEqual(e.snapshot(), antes);
  e.fallar(false); await e.reiniciar().confirmarEntrega(r.id);
  assert.equal(e.snapshot().objetos.find(o => o.id === 'demo-termo').estado, 'entregado');
  assert.equal(e.snapshot().reclamaciones[0].estado, 'entregada');
  assert.equal(e.snapshot().busquedas[0].estado, 'resuelta');
});

test('contacto de entrega solo para participantes autorizados, nunca en objetos públicos', async () => {
  const { servicio: s } = entorno();
  const r = await s.crearReclamacion({ objeto_id: 'demo-llaves', detalle_verificacion: 'Tortuga' });
  await assert.rejects(s.obtenerInstruccionesEntrega(r.id), /después/);
  assert.equal('contacto' in await s.obtenerObjeto('demo-llaves'), false);
  await s.cambiarUsuario('diego'); await s.resolverReclamacion(r.id, 'aprobada');
  await s.cambiarUsuario('ana');
  assert.equal((await s.obtenerInstruccionesEntrega(r.id)).contacto, 'diego.demo@espol.edu.ec');
});

test('reinicio explícito recupera un snapshot corrupto sin sobrescribirlo al leer', async () => {
  let datos = { version: 8, corrupto: true };
  const s = crearServicioLocal({ async leer() { return structuredClone(datos); }, async guardar(d) { datos = structuredClone(d); } });
  await assert.rejects(s.listarMisObjetos(), /incompatible/);
  assert.equal(datos.version, 8);
  await s.reiniciarDemo();
  assert.equal((await s.usuarioActual()).id, 'ana');
});
