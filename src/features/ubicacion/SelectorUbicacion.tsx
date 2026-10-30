import { useEffect, useRef, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Boton } from '@/components/boton';
import { Marca } from '@/constants/theme';
import Mapa from './Mapa';
import { textoCoordenadas } from './domain';
import { obtenerUbicacionActual } from './ubicacion-actual';
import type { CoordenadasMapa, UbicacionActual } from './types';

export function SelectorUbicacion({ valor, alConfirmar, alCancelar }: {
  valor: CoordenadasMapa | null; alConfirmar(punto: CoordenadasMapa): void; alCancelar(): void;
}) {
  const compacto = useWindowDimensions().height < 700;
  const [borrador, setBorrador] = useState(valor);
  const [actual, setActual] = useState<UbicacionActual | null>(null);
  const [gps, setGps] = useState(false);
  const [errorGps, setErrorGps] = useState('');
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'error_tiles' | 'tiles_listos' | 'error'>('cargando');
  const [intento, setIntento] = useState(0);
  const vigente = useRef(true);
  const bloqueoGps = useRef(false);
  useEffect(() => { vigente.current = true; return () => { vigente.current = false; }; }, []);
  async function localizar() {
    if (bloqueoGps.current) return;
    bloqueoGps.current = true; setGps(true); setErrorGps('');
    try { const p = await obtenerUbicacionActual(); if (vigente.current) setActual(p); }
    catch (e) { if (vigente.current) setErrorGps(e instanceof Error ? e.message : 'No se pudo obtener tu ubicación.'); }
    finally { bloqueoGps.current = false; if (vigente.current) setGps(false); }
  }
  return <Modal visible animationType="slide" onRequestClose={alCancelar}>
    <SafeAreaView style={styles.pagina}>
      <ScrollView style={{ maxHeight: compacto ? 165 : 240, flexGrow: 0 }} contentContainerStyle={styles.cabecera}>
        <Text accessibilityRole="header" style={styles.titulo}>¿Dónde perdiste el objeto?</Text>
        {!compacto && <Text style={styles.secundario}>Toca el mapa o mueve el marcador. El punto morado indica el lugar de pérdida.</Text>}
        <Boton etiqueta={gps ? 'Buscando tu ubicación…' : 'Mi ubicación actual'} variante="secundario" compacto deshabilitado={gps} onPress={() => void localizar()} />
        <Text style={styles.secundario}>El GPS centra el mapa; tú eliges el lugar de pérdida.</Text>
        {errorGps.length > 0 && <Text accessibilityRole="alert" style={styles.error}>{errorGps}</Text>}
      </ScrollView>
      <View style={styles.mapa}>
        <Mapa key={intento} inicial={borrador} actual={actual} alSeleccionar={setBorrador} alEstado={setEstado} />
      </View>
      <View style={styles.pie}>
        {estado === 'cargando' && <Text style={styles.secundario}>Preparando mapa…</Text>}
        {estado === 'error_tiles' && <Text accessibilityRole="alert" style={styles.error}>No se pudieron cargar las calles. Revisa tu conexión antes de confirmar el punto.</Text>}
        {estado === 'error' && <><Text accessibilityRole="alert" style={styles.error}>No se pudo abrir el mapa. Puedes cancelar y conservar el lugar escrito.</Text><Boton etiqueta="Reintentar mapa" compacto variante="secundario" onPress={() => { setEstado('cargando'); setIntento(i => i + 1); }} /></>}
        <Text accessibilityLiveRegion="polite" style={styles.coordenadas}>{borrador ? `Punto seleccionado: ${textoCoordenadas(borrador)}` : 'Todavía no has elegido un punto.'}</Text>
        <View style={{ gap: 10, flexDirection: compacto ? 'row' : 'column' }}>
          <View style={compacto && { flex: 1 }}><Boton etiqueta="Usar esta ubicación" deshabilitado={!borrador || estado === 'error'} onPress={() => { if (borrador) alConfirmar(borrador); }} /></View>
          <View style={compacto && { flex: 1 }}><Boton etiqueta="Cancelar mapa" variante="secundario" onPress={alCancelar} /></View>
        </View>
      </View>
    </SafeAreaView>
  </Modal>;
}
const styles = StyleSheet.create({
  pagina: { flex: 1, backgroundColor: Marca.colores.fondoPagina },
  cabecera: { padding: 16, gap: 8 }, mapa: { flex: 1, minHeight: 120 },
  titulo: { fontSize: 21, fontWeight: '700', color: Marca.colores.texto },
  secundario: { color: Marca.colores.textoSecundario, fontSize: 14, lineHeight: 20 },
  error: { color: Marca.colores.error, fontSize: 14, lineHeight: 20 },
  pie: { padding: 16, gap: 10, backgroundColor: Marca.colores.fondo },
  coordenadas: { color: Marca.colores.texto, fontSize: 15 },
});
