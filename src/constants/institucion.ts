import type { ImageSource } from 'expo-image';

/**
 * Configuración institucional del acceso. Otra universidad puede adaptar Findyp
 * cambiando únicamente estos valores.
 */
export const Institucion: {
  nombre: string;
  /**
   * Sufijos de dominio aceptados para registrarse e iniciar sesión. `edu.ec` acepta
   * cualquier subdominio, por ejemplo `espol.edu.ec` o `est.ups.edu.ec`.
   */
  dominiosPermitidos: readonly string[];
  ejemploCorreo: string;
  /**
   * Logo de la universidad. Agrega la imagen en `assets/images` y reemplaza `null` por
   * `require('@/assets/images/logo-universidad.png')`.
   */
  logo: number | ImageSource | null;
} = {
  nombre: 'Tu universidad',
  dominiosPermitidos: ['edu.ec'],
  ejemploCorreo: 'nombre@universidad.edu.ec',
  logo: null,
};
