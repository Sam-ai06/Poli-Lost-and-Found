import { almacen } from '../storage/sqlite';
import type { EstadoLocal } from '../types';
import { supabase } from '@/lib/supabase';
import { importarReporteLocal } from './supabase';

const CLAVE = 'findyp.migracion-reportes.v1';
let pendiente: { usuarioId: string; tarea: Promise<void> } | null = null;

/** Importa solo registros creados en el dispositivo, nunca los datos de ejemplo. */
export async function migrarReportesLocales(usuarioId: string): Promise<void> {
  if (pendiente?.usuarioId === usuarioId) return pendiente.tarea;
  const tarea = ejecutarMigracion(usuarioId);
  pendiente = { usuarioId, tarea };
  try { await tarea; } finally { if (pendiente?.tarea === tarea) pendiente = null; }
}

async function ejecutarMigracion(usuarioId: string): Promise<void> {
  const raw = await almacen.leer();
  if (raw === null) return;
  const estado = raw as EstadoLocal;
  if (estado.version !== 1 || !Array.isArray(estado.objetos) || !Array.isArray(estado.busquedas) || !estado.privados) {
    throw new Error('No se pudieron leer los reportes locales para migrarlos. Tus datos siguen en el dispositivo.');
  }
  const objetos = estado.objetos.filter(o => o.id.startsWith('r-'));
  const busquedas = estado.busquedas.filter(b => b.id.startsWith('r-'));
  const reclamaciones = (estado.reclamaciones ?? []).filter(r => r.id.startsWith('r-'));
  if (!objetos.length && !busquedas.length && !reclamaciones.length) return;
  const asignada = globalThis.localStorage?.getItem(CLAVE);
  if (asignada && asignada !== usuarioId) return;
  globalThis.localStorage?.setItem(CLAVE, usuarioId);
  const { data: sesion, error: errorSesion } = await supabase.auth.getUser();
  if (errorSesion || sesion.user?.id !== usuarioId) throw new Error('La sesión cambió durante la migración. Vuelve a iniciar sesión.');
  const { error: errorArchivo } = await supabase.from('archivos_migracion_local').upsert({ usuario_id: usuarioId, snapshot: estado });
  if (errorArchivo) throw new Error('No se pudo guardar el respaldo de tus reportes locales.');
  for (const o of objetos) {
    const privado = estado.privados[o.id];
    if (!privado) throw new Error('Faltan datos de un reporte local. Tus datos siguen en el dispositivo.');
    await importarReporteLocal('objeto', { ...o, ...privado }, o.id, o.estado, usuarioId);
  }
  for (const b of busquedas) await importarReporteLocal('busqueda', b, b.id, b.estado, usuarioId);
}
