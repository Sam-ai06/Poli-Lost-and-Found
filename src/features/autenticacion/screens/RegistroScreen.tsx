import { Redirect, router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { Icono } from '@/components/icono';
import { Institucion } from '@/constants/institucion';
import { Marca } from '@/constants/theme';

import { CampoTexto, type CampoRef } from '../components/campo-texto';
import { EnlaceTexto } from '../components/enlace-texto';
import { MensajeEstado } from '../components/mensaje-estado';
import { PantallaAcceso } from '../components/pantalla-acceso';
import { RequisitosContrasena } from '../components/requisitos-contrasena';
import { mensajeCorreoVerificado } from '../domain/correo-verificado';
import {
  describirDominios,
  normalizarCorreo,
  validarConfirmacion,
  validarContrasenaNueva,
  validarCorreoInstitucional,
  validarNombre,
} from '../domain/validacion';
import { useFormularioAcceso } from '../hooks/use-formulario-acceso';
import { registrarse } from '../services/supabase-auth';
import { useSesion } from '../services/sesion';

type Campo = 'nombre' | 'correo' | 'contrasena' | 'confirmacion';

export default function RegistroScreen() {
  const { estado } = useSesion();
  const nombreRef = useRef<CampoRef>(null);
  const correoRef = useRef<CampoRef>(null);
  const contrasenaRef = useRef<CampoRef>(null);
  const confirmacionRef = useRef<CampoRef>(null);
  const [enviando, setEnviando] = useState(false);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [correoPendiente, setCorreoPendiente] = useState<string | null>(null);

  const { valores, errores, cambiar, tocar, intentarEnviar } = useFormularioAcceso(
    { nombre: '', correo: '', contrasena: '', confirmacion: '' },
    (v) => ({
      nombre: validarNombre(v.nombre),
      correo: validarCorreoInstitucional(v.correo, Institucion.dominiosPermitidos),
      contrasena: validarContrasenaNueva(v.contrasena),
      confirmacion: validarConfirmacion(v.contrasena, v.confirmacion),
    })
  );

  if (estado === 'con_sesion' && !correoPendiente) return <Redirect href="/" />;

  const enviar = async () => {
    const campoInvalido = intentarEnviar();
    if (campoInvalido) {
      const referencias: Record<Campo, typeof nombreRef> = {
        nombre: nombreRef,
        correo: correoRef,
        contrasena: contrasenaRef,
        confirmacion: confirmacionRef,
      };
      referencias[campoInvalido].current?.focus();
      return;
    }
    setEnviando(true);
    setErrorServidor(null);
    try {
      const requiereConfirmacion = await registrarse(valores);
      if (requiereConfirmacion) setCorreoPendiente(normalizarCorreo(valores.correo));
      else router.replace('/');
    } catch (error) {
      setErrorServidor(error instanceof Error ? error.message : 'No pudimos crear tu cuenta.');
    } finally {
      setEnviando(false);
    }
  };

  if (correoPendiente) {
    return (
      <PantallaAcceso
        titulo="Revisa tu correo"
        subtitulo="Confirmamos que perteneces a la universidad con un enlace enviado a tu correo institucional.">
        <View style={styles.confirmacion} accessibilityLiveRegion="polite">
          <View style={styles.iconoExito}>
            <Icono nombre="correo" tamano={36} color={Marca.colores.exito} />
          </View>
          <Text style={styles.tituloExito}>¡Cuenta creada!</Text>
          <Text style={styles.textoExito}>
            Enviamos un enlace de confirmación a{' '}
            <Text style={styles.correo}>{correoPendiente}</Text>. Ábrelo para activar tu cuenta
            y luego inicia sesión.
          </Text>
        </View>
        <Boton etiqueta="Ir a iniciar sesión" onPress={() => router.replace('/acceso/iniciar-sesion')} />
      </PantallaAcceso>
    );
  }

  return (
    <PantallaAcceso
      titulo="Crea tu cuenta"
      subtitulo="Findyp es exclusivo para la comunidad universitaria. Regístrate con tu correo institucional.">
      {errorServidor ? <MensajeEstado tipo="error" texto={errorServidor} /> : null}

      <CampoTexto
        ref={nombreRef}
        etiqueta="Nombre completo"
        tipo="nombre"
        placeholder="Ana Torres"
        valor={valores.nombre}
        onCambiar={cambiar('nombre')}
        onSalir={tocar('nombre')}
        onEnviar={() => correoRef.current?.focus()}
        error={errores.nombre}
      />
      <CampoTexto
        ref={correoRef}
        etiqueta="Correo institucional"
        tipo="correo"
        placeholder={Institucion.ejemploCorreo}
        ayuda={`Debe terminar en ${describirDominios(Institucion.dominiosPermitidos)}.`}
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
        tipo="contrasena_nueva"
        valor={valores.contrasena}
        onCambiar={cambiar('contrasena')}
        onSalir={tocar('contrasena')}
        onEnviar={() => confirmacionRef.current?.focus()}
        error={errores.contrasena}
      />
      <RequisitosContrasena contrasena={valores.contrasena} />
      <CampoTexto
        ref={confirmacionRef}
        etiqueta="Confirmar contraseña"
        tipo="contrasena_nueva"
        valor={valores.confirmacion}
        onCambiar={cambiar('confirmacion')}
        onSalir={tocar('confirmacion')}
        onEnviar={enviar}
        returnKeyType="go"
        error={errores.confirmacion}
      />

      <Boton etiqueta="Crear cuenta" icono="universidad" onPress={enviar} cargando={enviando} />
      <Text style={styles.nota}>
        Te enviaremos un correo para confirmar que la cuenta te pertenece.
      </Text>
      <EnlaceTexto
        prefijo="¿Ya tienes cuenta?"
        texto="Inicia sesión"
        onPress={() => router.replace('/acceso/iniciar-sesion')}
      />
    </PantallaAcceso>
  );
}

const styles = StyleSheet.create({
  confirmacion: { alignItems: 'center', gap: 10, paddingVertical: 8 },
  iconoExito: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Marca.colores.exitoSuave,
  },
  tituloExito: { fontSize: 22, fontWeight: '800', color: Marca.colores.texto },
  textoExito: {
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
    color: Marca.colores.textoSecundario,
  },
  correo: { fontWeight: '700', color: Marca.colores.texto },
  nota: { fontSize: 13, lineHeight: 18, textAlign: 'center', color: Marca.colores.textoSecundario },
});
