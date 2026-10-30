import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Boton } from '@/components/boton';
import { Institucion } from '@/constants/institucion';

import { CampoTexto } from '../components/campo-texto';
import { EnlaceTexto } from '../components/enlace-texto';
import { MensajeEstado } from '../components/mensaje-estado';
import { PantallaAcceso } from '../components/pantalla-acceso';
import { mensajeCorreoVerificado } from '../domain/correo-verificado';
import { normalizarCorreo, validarCorreoInstitucional } from '../domain/validacion';
import { useFormularioAcceso } from '../hooks/use-formulario-acceso';
import { recuperarContrasena } from '../services/supabase-auth';

export default function RecuperarScreen() {
  const { correo: correoInicial } = useLocalSearchParams<{ correo?: string }>();
  const [enviando, setEnviando] = useState(false);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [enviadoA, setEnviadoA] = useState<string | null>(null);

  const { valores, errores, cambiar, tocar, intentarEnviar } = useFormularioAcceso(
    { correo: correoInicial ?? '' },
    ({ correo }) => ({ correo: validarCorreoInstitucional(correo, Institucion.dominiosPermitidos) })
  );

  const enviar = async () => {
    if (intentarEnviar()) return;
    setEnviando(true);
    setErrorServidor(null);
    try {
      await recuperarContrasena(valores.correo);
      setEnviadoA(normalizarCorreo(valores.correo));
    } catch (error) {
      setErrorServidor(error instanceof Error ? error.message : 'No pudimos enviar el enlace.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <PantallaAcceso
      titulo="Recupera tu acceso"
      subtitulo="Te enviaremos un enlace a tu correo institucional para crear una nueva contraseña.">
      {enviadoA ? (
        <MensajeEstado
          tipo="exito"
          texto={`Si existe una cuenta con ${enviadoA}, recibirás el enlace en unos minutos. Revisa también la carpeta de spam.`}
        />
      ) : null}
      {errorServidor ? <MensajeEstado tipo="error" texto={errorServidor} /> : null}
      <CampoTexto
        etiqueta="Correo institucional"
        tipo="correo"
        placeholder={Institucion.ejemploCorreo}
        valor={valores.correo}
        onCambiar={cambiar('correo')}
        onSalir={tocar('correo')}
        onEnviar={enviar}
        returnKeyType="send"
        error={errores.correo}
        exito={mensajeCorreoVerificado(valores.correo)}
      />
      <Boton etiqueta="Enviar enlace" icono="correo" onPress={enviar} cargando={enviando} />
      <EnlaceTexto texto="Volver a iniciar sesión" onPress={() => router.replace('/acceso/iniciar-sesion')} />
    </PantallaAcceso>
  );
}
