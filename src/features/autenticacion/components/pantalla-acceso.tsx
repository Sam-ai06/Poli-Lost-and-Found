import { router } from 'expo-router';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icono } from '@/components/icono';
import { Marca } from '@/constants/theme';

import { LogoInstitucional } from './logo-institucional';

interface PantallaAccesoProps {
  titulo: string;
  subtitulo: string;
  children: ReactNode;
  /** Ilustración opcional bajo el encabezado (pantalla de bienvenida). */
  ilustracion?: ReactNode;
  mostrarRegresar?: boolean;
}

/** Estructura común de las pantallas de acceso: encabezado de marca y tarjeta del formulario. */
export function PantallaAcceso({
  titulo,
  subtitulo,
  children,
  ilustracion,
  mostrarRegresar = true,
}: PantallaAccesoProps) {
  const regresar = () =>
    router.canGoBack() ? router.back() : router.replace('/acceso/bienvenida');

  return (
    <View style={styles.fondo}>
      <Decoracion />
      <SafeAreaView style={styles.areaSegura}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.areaSegura}>
          <ScrollView
            contentContainerStyle={styles.desplazable}
            keyboardShouldPersistTaps="handled">
            <View style={styles.columna}>
              <View style={styles.barraSuperior}>
                {mostrarRegresar ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Regresar"
                    hitSlop={8}
                    onPress={regresar}
                    style={({ pressed }) => [styles.regresar, pressed && styles.presionado]}>
                    <Icono nombre="atras" tamano={20} color={Marca.colores.textoSobrePrimario} />
                  </Pressable>
                ) : null}
              </View>

              <View style={styles.encabezado}>
                <View style={styles.marcas}>
                  <LogoInstitucional />
                  <View style={styles.separador} />
                  <View>
                    <Text style={styles.nombreApp}>{Marca.nombre}</Text>
                    <Text style={styles.lema}>Objetos perdidos del campus</Text>
                  </View>
                </View>
                {ilustracion}
                <Text accessibilityRole="header" style={styles.titulo}>
                  {titulo}
                </Text>
                <Text style={styles.subtitulo}>{subtitulo}</Text>
              </View>

              <View style={styles.tarjeta}>{children}</View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

/** Formas decorativas del fondo; se ocultan a los lectores de pantalla. */
function Decoracion() {
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}>
      <View style={[styles.circulo, styles.circuloGrande]} />
      <View style={[styles.circulo, styles.circuloAcento]} />
      <View style={[styles.circulo, styles.circuloPequeno]} />
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, overflow: 'hidden', backgroundColor: Marca.colores.primario },
  areaSegura: { flex: 1 },
  desplazable: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 32 },
  columna: { width: '100%', maxWidth: 480, alignSelf: 'center', gap: 20 },
  barraSuperior: { minHeight: 48, justifyContent: 'center' },
  regresar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  presionado: { opacity: 0.7 },
  encabezado: { gap: 10 },
  marcas: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 8 },
  separador: { width: 1, height: 44, backgroundColor: 'rgba(255, 255, 255, 0.35)' },
  nombreApp: { fontSize: 26, fontWeight: '800', color: Marca.colores.textoSobrePrimario },
  lema: { fontSize: 14, color: Marca.colores.textoSuaveSobrePrimario },
  titulo: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: Marca.colores.textoSobrePrimario,
  },
  subtitulo: { fontSize: 16, lineHeight: 23, color: Marca.colores.textoSuaveSobrePrimario },
  tarjeta: {
    gap: 16,
    padding: 24,
    borderRadius: 28,
    backgroundColor: Marca.colores.fondo,
    ...Platform.select({
      web: { boxShadow: '0 20px 40px rgba(15, 23, 42, 0.25)' },
      default: {
        shadowColor: '#0F172A',
        shadowOpacity: 0.2,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 8,
      },
    }),
  },
  circulo: { position: 'absolute', borderRadius: 999 },
  circuloGrande: {
    width: 420,
    height: 420,
    top: -180,
    right: -160,
    backgroundColor: Marca.colores.primarioOscuro,
    opacity: 0.55,
  },
  circuloAcento: {
    width: 140,
    height: 140,
    top: 90,
    left: -70,
    backgroundColor: Marca.colores.acento,
    opacity: 0.85,
  },
  circuloPequeno: {
    width: 220,
    height: 220,
    bottom: -60,
    right: -80,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});
