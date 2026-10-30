import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/boton';
import { Encabezado } from '@/components/encabezado';
import { Icono } from '@/components/icono';
import { Pantalla } from '@/components/pantalla';
import { Marca } from '@/constants/theme';
import { cerrarSesion, useSesion } from '@/features/autenticacion';

/** Datos básicos de la cuenta. El perfil completo depende del backend (Participante 3). */
export default function PerfilScreen() {
  const { sesion } = useSesion();
  const [saliendo, setSaliendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const salir = async () => {
    setSaliendo(true);
    setError(null);
    try {
      await cerrarSesion();
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : 'No pudimos cerrar la sesión.');
      setSaliendo(false);
    }
  };

  if (!sesion) {
    return (
      <Pantalla>
        <Encabezado titulo="Perfil" />
        <View style={styles.cuerpo}>
          <View style={styles.avatar}>
            <Icono nombre="perfil" tamano={36} color={Marca.colores.primario} />
          </View>
          <Text style={styles.titulo}>Estás explorando sin cuenta</Text>
          <Text style={styles.texto}>
            Inicia sesión con tu correo institucional para publicar objetos, registrar búsquedas y
            solicitar recuperaciones.
          </Text>
          <View style={styles.acciones}>
            <Boton etiqueta="Iniciar sesión" onPress={() => router.push('/acceso/iniciar-sesion')} />
            <Boton
              etiqueta="Crear cuenta"
              variante="secundario"
              onPress={() => router.push('/acceso/registro')}
            />
          </View>
        </View>
      </Pantalla>
    );
  }

  const correo = sesion.user.email ?? '';
  const nombre =
    typeof sesion.user.user_metadata?.nombre_completo === 'string'
      ? sesion.user.user_metadata.nombre_completo
      : correo.split('@')[0];
  const iniciales = nombre
    .split(/\s+/)
    .slice(0, 2)
    .map((parte: string) => parte[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <Pantalla>
      <Encabezado titulo="Perfil" />
      <View style={styles.cuerpo}>
        <View style={[styles.avatar, styles.avatarSesion]}>
          <Text style={styles.iniciales}>{iniciales}</Text>
        </View>
        <Text style={styles.titulo}>{nombre}</Text>
        <Text style={styles.texto}>{correo}</Text>
        <View style={styles.insignia}>
          <Icono nombre="escudo" tamano={18} color={Marca.colores.exito} />
          <Text style={styles.textoInsignia}>Cuenta universitaria · {correo.split('@')[1]}</Text>
        </View>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <View style={styles.acciones}>
          <Boton
            etiqueta="Cerrar sesión"
            icono="salir"
            variante="secundario"
            onPress={salir}
            cargando={saliendo}
          />
        </View>
      </View>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  cuerpo: { flex: 1, alignItems: 'center', gap: 12, padding: 24, paddingTop: 40 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Marca.colores.primarioSuave,
  },
  avatarSesion: { backgroundColor: Marca.colores.primario },
  iniciales: { fontSize: 30, fontWeight: '800', color: Marca.colores.textoSobrePrimario },
  titulo: { fontSize: 22, fontWeight: '800', textAlign: 'center', color: Marca.colores.texto },
  texto: { fontSize: 15, lineHeight: 22, textAlign: 'center', color: Marca.colores.textoSecundario },
  insignia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Marca.radios.pildora,
    backgroundColor: Marca.colores.exitoSuave,
  },
  textoInsignia: { fontSize: 14, fontWeight: '600', color: Marca.colores.exito },
  error: { fontSize: 14, color: Marca.colores.error, textAlign: 'center' },
  acciones: { width: '100%', maxWidth: 360, gap: 12, marginTop: 12 },
});
