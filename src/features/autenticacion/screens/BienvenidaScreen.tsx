import { Redirect, router } from 'expo-router';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Boton } from '@/components/boton';
import { Icono, type NombreIcono } from '@/components/icono';
import { Marca } from '@/constants/theme';

import { EnlaceTexto } from '../components/enlace-texto';
import { PantallaAcceso } from '../components/pantalla-acceso';
import { useSesion } from '../services/sesion';

const BENEFICIOS: { icono: NombreIcono; titulo: string; texto: string }[] = [
  { icono: 'agregar', titulo: 'Publica lo que encuentras', texto: 'Con foto, lugar y punto de entrega.' },
  { icono: 'buscar', titulo: 'Busca lo que perdiste', texto: 'Te mostramos posibles coincidencias.' },
  { icono: 'escudo', titulo: 'Recupéralo con seguridad', texto: 'Solo la comunidad universitaria verificada.' },
];

const OBJETOS: { icono: NombreIcono; texto: string }[] = [
  { icono: 'llave', texto: 'Llaves' },
  { icono: 'reportes', texto: 'Carné' },
  { icono: 'universidad', texto: 'Cuaderno' },
];

export default function BienvenidaScreen() {
  const { estado, continuarComoInvitado } = useSesion();
  if (estado === 'con_sesion') return <Redirect href="/" />;

  const explorar = () => {
    continuarComoInvitado();
    router.replace('/');
  };

  return (
    <PantallaAcceso
      mostrarRegresar={false}
      titulo="Encuentra lo que perdiste en tu campus"
      subtitulo="Findyp conecta a quien encuentra un objeto con su dueño dentro de la universidad."
      ilustracion={<Ilustracion />}>
      <View style={styles.beneficios}>
        {BENEFICIOS.map(({ icono, titulo, texto }) => (
          <View key={titulo} style={styles.beneficio}>
            <View style={styles.iconoBeneficio}>
              <Icono nombre={icono} tamano={22} color={Marca.colores.primario} />
            </View>
            <View style={styles.textos}>
              <Text style={styles.tituloBeneficio}>{titulo}</Text>
              <Text style={styles.textoBeneficio}>{texto}</Text>
            </View>
          </View>
        ))}
      </View>
      <Boton etiqueta="Crear cuenta" icono="universidad" onPress={() => router.push('/acceso/registro')} />
      <Boton
        etiqueta="Iniciar sesión"
        variante="secundario"
        onPress={() => router.push('/acceso/iniciar-sesion')}
      />
      <EnlaceTexto texto="Explorar sin cuenta" onPress={explorar} />
    </PantallaAcceso>
  );
}

/** Objetos flotantes decorativos alrededor de una lupa. */
function Ilustracion() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.ilustracion}>
      <View style={styles.lupa}>
        <Icono nombre="buscar" tamano={40} color={Marca.colores.primario} />
      </View>
      {OBJETOS.map(({ icono, texto }, indice) => (
        <View key={texto} style={[styles.etiquetaObjeto, POSICIONES[indice]]}>
          <Icono nombre={icono} tamano={16} color={Marca.colores.primarioOscuro} />
          <Text style={styles.textoObjeto}>{texto}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  ilustracion: { height: 150, alignItems: 'center', justifyContent: 'center', marginVertical: 4 },
  lupa: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Marca.colores.fondo,
    borderWidth: 6,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  etiquetaObjeto: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Marca.radios.pildora,
    backgroundColor: Marca.colores.fondo,
  },
  textoObjeto: { fontSize: 13, fontWeight: '700', color: Marca.colores.primarioOscuro },
  beneficios: { gap: 14, marginBottom: 4 },
  beneficio: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconoBeneficio: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Marca.colores.primarioSuave,
  },
  textos: { flex: 1, gap: 2 },
  tituloBeneficio: { fontSize: 16, fontWeight: '700', color: Marca.colores.texto },
  textoBeneficio: { fontSize: 14, color: Marca.colores.textoSecundario },
});

const POSICIONES: ViewStyle[] = [
  { top: 6, left: '8%', transform: [{ rotate: '-6deg' }] },
  { top: 18, right: '6%', transform: [{ rotate: '5deg' }] },
  { bottom: 8, left: '22%', backgroundColor: Marca.colores.acento },
];
