import type { Session, SupabaseClient } from '@supabase/supabase-js';

import { Institucion } from '@/constants/institucion';

import { normalizarCorreo, validarCorreoInstitucional } from '../domain/validacion';

export class ErrorAutenticacion extends Error {}

const MENSAJE_SIN_CONFIGURACION =
  'El inicio de sesión aún no está configurado en este equipo. Copia .env.example a .env.local con los datos de Supabase y reinicia la app.';

let clientePromesa: Promise<SupabaseClient> | null = null;

/**
 * Carga el cliente compartido bajo demanda: `@/lib/supabase` lanza un error si faltan
 * las variables de entorno, y así la app sigue funcionando en modo demostración.
 */
function obtenerCliente(): Promise<SupabaseClient> {
  clientePromesa ??= import('@/lib/supabase')
    .then((modulo) => modulo.supabase)
    .catch(() => {
      clientePromesa = null;
      throw new ErrorAutenticacion(MENSAJE_SIN_CONFIGURACION);
    });
  return clientePromesa;
}

const MENSAJES_SUPABASE: [RegExp, string][] = [
  [/invalid login credentials/i, 'Correo o contraseña incorrectos.'],
  [/email not confirmed/i, 'El servidor aún exige confirmar el correo. Contacta al administrador para habilitar el acceso directo.'],
  [/already registered|already exists/i, 'Ya existe una cuenta con este correo. Inicia sesión.'],
  [/rate limit|too many/i, 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.'],
  [/password/i, 'La contraseña no cumple los requisitos del servidor.'],
  [/fetch|network/i, 'No hay conexión con el servidor. Revisa tu internet.'],
];

function traducirError(error: unknown): ErrorAutenticacion {
  if (error instanceof ErrorAutenticacion) return error;
  const mensaje = error instanceof Error ? error.message : String(error);
  const traduccion = MENSAJES_SUPABASE.find(([patron]) => patron.test(mensaje));
  return new ErrorAutenticacion(traduccion?.[1] ?? 'No pudimos completar la solicitud. Inténtalo de nuevo.');
}

/** Validación en el cliente; la regla definitiva debe aplicarla también el servidor. */
function exigirCorreoInstitucional(correo: string): string {
  const error = validarCorreoInstitucional(correo, Institucion.dominiosPermitidos);
  if (error) throw new ErrorAutenticacion(error);
  return normalizarCorreo(correo);
}

export async function iniciarSesion(correo: string, contrasena: string): Promise<void> {
  const email = exigirCorreoInstitucional(correo);
  try {
    const cliente = await obtenerCliente();
    const { error } = await cliente.auth.signInWithPassword({ email, password: contrasena });
    if (error) throw error;
  } catch (error) {
    throw traducirError(error);
  }
}

export interface DatosRegistro {
  nombre: string;
  correo: string;
  contrasena: string;
}

/** Crea la cuenta e inicia sesión sin confirmación por correo. */
export async function registrarse({ nombre, correo, contrasena }: DatosRegistro): Promise<void> {
  const email = exigirCorreoInstitucional(correo);
  try {
    const cliente = await obtenerCliente();
    const { data, error } = await cliente.auth.signUp({
      email,
      password: contrasena,
      options: { data: { nombre_completo: nombre.trim() } },
    });
    if (error) throw error;
    if (!data.session) {
      throw new ErrorAutenticacion(
        'No se pudo iniciar sesión. Si ya tienes una cuenta, inicia sesión; si es nueva, el administrador debe desactivar Confirm email en Supabase.'
      );
    }
  } catch (error) {
    throw traducirError(error);
  }
}

export async function recuperarContrasena(correo: string): Promise<void> {
  const email = exigirCorreoInstitucional(correo);
  try {
    const cliente = await obtenerCliente();
    const { error } = await cliente.auth.resetPasswordForEmail(email);
    if (error) throw error;
  } catch (error) {
    throw traducirError(error);
  }
}

export async function cerrarSesion(): Promise<void> {
  try {
    const cliente = await obtenerCliente();
    const { error } = await cliente.auth.signOut();
    if (error) throw error;
  } catch (error) {
    throw traducirError(error);
  }
}

/**
 * Notifica la sesión actual y sus cambios. Sin configuración de Supabase informa
 * `null` (sin sesión). Devuelve la función para cancelar la suscripción.
 */
export function observarSesion(alCambiar: (sesion: Session | null) => void): () => void {
  let cancelar: (() => void) | null = null;
  let activo = true;

  obtenerCliente()
    .then(async (cliente) => {
      const { data } = await cliente.auth.getSession();
      if (!activo) return;
      alCambiar(data.session);
      const { data: suscripcion } = cliente.auth.onAuthStateChange((_evento, sesion) =>
        alCambiar(sesion)
      );
      cancelar = () => suscripcion.subscription.unsubscribe();
    })
    .catch(() => {
      if (activo) alCambiar(null);
    });

  return () => {
    activo = false;
    cancelar?.();
  };
}
