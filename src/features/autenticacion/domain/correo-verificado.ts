import { Institucion } from '@/constants/institucion';

import { dominioDeCorreo, esDominioPermitido } from './validacion';

/** Mensaje positivo cuando el correo pertenece a un dominio universitario permitido. */
export function mensajeCorreoVerificado(correo: string): string | null {
  const dominio = dominioDeCorreo(correo);
  return dominio && esDominioPermitido(dominio, Institucion.dominiosPermitidos)
    ? `Dominio universitario válido: ${dominio}`
    : null;
}
