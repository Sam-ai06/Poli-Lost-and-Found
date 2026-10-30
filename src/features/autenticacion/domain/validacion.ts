/**
 * Reglas de validación del acceso. No depende de React ni de Supabase para poder
 * probarse con `node --test`.
 */

const FORMATO_CORREO = /^[^\s@]+@([a-z0-9-]+\.)+[a-z]{2,}$/;
export const LONGITUD_MINIMA_CONTRASENA = 8;

export function normalizarCorreo(correo: string): string {
  return correo.trim().toLowerCase();
}

/** Dominio del correo, o `null` si el formato no es válido. */
export function dominioDeCorreo(correo: string): string | null {
  const normalizado = normalizarCorreo(correo);
  return FORMATO_CORREO.test(normalizado) ? normalizado.split('@')[1] : null;
}

/**
 * Un dominio es institucional si termina en uno de los sufijos permitidos y tiene al
 * menos un nivel antes de él: `espol.edu.ec` es válido, `edu.ec` no.
 */
export function esDominioPermitido(dominio: string, permitidos: readonly string[]): boolean {
  return permitidos.some((sufijo) => dominio.endsWith(`.${sufijo.toLowerCase()}`));
}

export function describirDominios(permitidos: readonly string[]): string {
  return permitidos.map((sufijo) => `.${sufijo}`).join(' o ');
}

export function validarCorreoInstitucional(
  correo: string,
  permitidos: readonly string[]
): string | null {
  if (!correo.trim()) return 'Ingresa tu correo institucional.';
  const dominio = dominioDeCorreo(correo);
  if (!dominio) return 'Revisa el formato del correo, por ejemplo nombre@universidad.edu.ec.';
  if (!esDominioPermitido(dominio, permitidos)) {
    return `Usa tu correo universitario: debe terminar en ${describirDominios(permitidos)}.`;
  }
  return null;
}

export interface RequisitoContrasena {
  id: 'longitud' | 'letra' | 'numero';
  descripcion: string;
  cumple: boolean;
}

export function requisitosContrasena(contrasena: string): RequisitoContrasena[] {
  return [
    {
      id: 'longitud',
      descripcion: `Al menos ${LONGITUD_MINIMA_CONTRASENA} caracteres`,
      cumple: contrasena.length >= LONGITUD_MINIMA_CONTRASENA,
    },
    { id: 'letra', descripcion: 'Al menos una letra', cumple: /\p{L}/u.test(contrasena) },
    { id: 'numero', descripcion: 'Al menos un número', cumple: /\d/.test(contrasena) },
  ];
}

export function validarContrasenaNueva(contrasena: string): string | null {
  if (!contrasena) return 'Crea una contraseña.';
  const pendiente = requisitosContrasena(contrasena).find((requisito) => !requisito.cumple);
  return pendiente ? `La contraseña necesita: ${pendiente.descripcion.toLowerCase()}.` : null;
}

export function validarContrasenaIngresada(contrasena: string): string | null {
  return contrasena ? null : 'Ingresa tu contraseña.';
}

export function validarConfirmacion(contrasena: string, confirmacion: string): string | null {
  if (!confirmacion) return 'Repite la contraseña.';
  return contrasena === confirmacion ? null : 'Las contraseñas no coinciden.';
}

export function validarNombre(nombre: string): string | null {
  const limpio = nombre.trim();
  if (!limpio) return 'Ingresa tu nombre.';
  return limpio.length >= 3 ? null : 'El nombre debe tener al menos 3 caracteres.';
}
