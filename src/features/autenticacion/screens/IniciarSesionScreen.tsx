import { Redirect, router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Boton } from '@/components/boton';
import { Institucion } from '@/constants/institucion';

import { CampoTexto, type CampoRef } from '../components/campo-texto';
import { EnlaceTexto } from '../components/enlace-texto';
import { MensajeEstado } from '../components/mensaje-estado';
import { PantallaAcceso } from '../components/pantalla-acceso';
import { mensajeCorreoVerificado } from '../domain/correo-verificado';
import {
  describirDominios,
  validarContrasenaIngresada,
  validarCorreoInstitucional,
} from '../domain/validacion';
import { useFormularioAcceso } from '../hooks/use-formulario-acceso';
import { iniciarSesion } from '../services/supabase-auth';
import { useSesion } from '../services/sesion';

export default function IniciarSesionScreen() {
  const { estado } = useSesion();
  const correoRef = useRef<CampoRef>(null);
  const contrasenaRef = useRef<CampoRef>(null);
  const [enviando, setEnviando] = useState(false);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const { valores, errores, cambiar, tocar, intentarEnviar } = useFormularioAcceso(
    { correo: '', contrasena: '' },
    ({ correo, contrasena }) => ({
      correo: validarCorreoInstitucional(correo, Institucion.dominiosPermitidos),
      contrasena: validarContrasenaIngresada(contrasena),
    })
  );

  if (estado === 'con_sesion') return <Redirect href="/" />;

  const enviar = async () => {
    const campoInvalido = intentarEnviar();
    if (campoInvalido) {
      (campoInvalido === 'correo' ? correoRef : contrasenaRef).current?.focus();
      return;
    }
    setEnviando(true);
    setErrorServidor(null);
    try {
      await iniciarSesion(valores.correo, valores.contrasena);
      router.replace('/');
    } catch (error) {
      setErrorServidor(error instanceof Error ? error.message : 'No pudimos iniciar sesión.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <PantallaAcceso
      titulo="Hola de nuevo"
      subtitulo="Inicia sesión con tu correo universitario para publicar, buscar y recuperar objetos.">
      <MensajeEstado
        tipo="info"
        texto={`Solo se aceptan correos institucionales que terminen en ${describirDominios(Institucion.dominiosPermitidos)}.`}
      />
      {errorServidor ? <MensajeEstado tipo="error" texto={errorServidor} /> : null}

      <CampoTexto
        ref={correoRef}
        etiqueta="Correo institucional"
        tipo="correo"
        placeholder={Institucion.ejemploCorreo}
        valor={valores.correo}
        onCambiar={cambiar('correo')}
        onSalir={tocar('correo')}
        onEnviar={() => contrasenaRef.current?.focus()}
        error={errores.correo}
        exito={mensajeCorreoVerificado(valores.correo)}
      />
      <CampoTexto
        ref={contrasenaRef}
        etiqueta="Contraseña"
        tipo="contrasena"
        valor={valores.contrasena}
        onCambiar={cambiar('contrasena')}
        onSalir={tocar('contrasena')}
        onEnviar={enviar}
        returnKeyType="go"
        error={errores.contrasena}
      />
      <View style={styles.olvido}>
        <EnlaceTexto
          texto="¿Olvidaste tu contraseña?"
          onPress={() =>
            router.push({ pathname: '/acceso/recuperar', params: { correo: valores.correo } })
          }
        />
      </View>

      <Boton etiqueta="Iniciar sesión" onPress={enviar} cargando={enviando} />
      <EnlaceTexto
        prefijo="¿Aún no tienes cuenta?"
        texto="Crea una"
        onPress={() => router.replace('/acceso/registro')}
      />
    </PantallaAcceso>
  );
}

const styles = StyleSheet.create({
  olvido: { alignItems: 'flex-end', marginTop: -8 },
});
