import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Boton as BotonFindyp } from '@/components/boton';
import { Icono } from '@/components/icono';
import { Marca } from '@/constants/theme';
import { useReportes } from '../services/ReportesProvider';
import { categorias, etiquetas, type Categoria } from '../types';

export const color = { primario: Marca.colores.primario, texto: Marca.colores.texto, fondo: Marca.colores.fondoPagina, borde: Marca.colores.borde };
export const estilos = StyleSheet.create({
  pagina: { flex: 1, backgroundColor: color.fondo }, contenido: { padding: 20, paddingBottom: 40, gap: 16, width: '100%', maxWidth: 620, alignSelf: 'center' },
  titulo: { color: color.texto, fontSize: 20, fontWeight: '700', lineHeight: 28, flex: 1 },
  texto: { color: color.texto, lineHeight: 23 }, secundario: { color: Marca.colores.textoSecundario, lineHeight: 22 },
  tarjeta: { backgroundColor: Marca.colores.fondo, padding: 16, borderRadius: Marca.radios.grande, gap: 12, borderWidth: 1, borderColor: Marca.colores.borde },
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  campo: { borderWidth: 1, borderColor: color.borde, borderRadius: 12, backgroundColor: 'white', padding: 14, minHeight: 50, fontSize: 16, color: color.texto },
  etiqueta: { fontWeight: '600', color: color.texto }, error: { color: '#A42232', lineHeight: 23 },
  imagen: { width: '100%', height: 190, borderRadius: 12, backgroundColor: '#EAECF4' },
});
export function Texto({ children, secundario = false }: { children: React.ReactNode; secundario?: boolean }) {
  return <ThemedText style={secundario ? estilos.secundario : estilos.texto}>{children}</ThemedText>;
}
export function Pagina({ titulo, children, inicio = false, alVolver }: { titulo: string; children: React.ReactNode; inicio?: boolean; alVolver?: () => void }) {
  const { navegacion } = useReportes();
  return <SafeAreaView edges={['top', 'left', 'right']} style={estilos.pagina}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={{ minHeight: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 16, borderBottomWidth: 1, borderBottomColor: Marca.colores.borde, backgroundColor: Marca.colores.fondo }}>
        {!inicio && <Pressable accessibilityRole="button" accessibilityLabel="Volver" hitSlop={8} onPress={alVolver ?? navegacion.volver}><Icono nombre="atras" tamano={20} color={color.primario} /></Pressable>}
        <ThemedText accessibilityRole="header" style={estilos.titulo}>{titulo}</ThemedText>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={estilos.contenido}>
        {Platform.OS === 'web' && <Texto secundario>Vista previa web: los datos se conservan solo durante esta sesión. Prueba la persistencia en el teléfono.</Texto>}
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
export function Tarjeta({ children }: { children: React.ReactNode }) { return <ThemedView style={estilos.tarjeta}>{children}</ThemedView>; }
export function Boton({ titulo, onPress, disabled = false, secundario = false }: { titulo: string; onPress: () => void; disabled?: boolean; secundario?: boolean }) {
  return <BotonFindyp etiqueta={titulo} onPress={onPress} deshabilitado={disabled} variante={secundario ? 'secundario' : 'primario'} />;
}
export function Campo({ etiqueta, valor, cambiar, multilinea = false, max = 2000, placeholder, editable = true }: { etiqueta: string; valor: string; cambiar: (v: string) => void; multilinea?: boolean; max?: number; placeholder?: string; editable?: boolean }) {
  return <View style={{ gap: 8 }}><ThemedText style={estilos.etiqueta}>{etiqueta}</ThemedText>
    <TextInput accessibilityLabel={etiqueta} value={valor} onChangeText={cambiar} editable={editable} maxLength={max} multiline={multilinea} placeholder={placeholder} placeholderTextColor="#758095" autoCapitalize="sentences" style={[estilos.campo, multilinea && { minHeight: 110, textAlignVertical: 'top' }]} />
  </View>;
}
export function Opciones<T extends string>({ etiqueta, valor, opciones, cambiar, disabled = false }: { etiqueta: string; valor: T; opciones: readonly { valor: T; texto: string }[]; cambiar: (v: T) => void; disabled?: boolean }) {
  return <View style={{ gap: 8 }}><ThemedText style={estilos.etiqueta}>{etiqueta}</ThemedText><View style={estilos.fila}>
    {opciones.map(o => <Pressable accessibilityRole="radio" accessibilityState={{ checked: valor === o.valor, disabled }} disabled={disabled} key={o.valor} onPress={() => cambiar(o.valor)} style={{ padding: 12, minHeight: 46, borderRadius: Marca.radios.medio, borderWidth: 1, borderColor: valor === o.valor ? color.primario : color.borde, backgroundColor: valor === o.valor ? Marca.colores.primarioSuave : Marca.colores.fondo }}><ThemedText style={{ color: valor === o.valor ? color.primario : color.texto }}>{o.texto}</ThemedText></Pressable>)}
  </View></View>;
}
export function CategoriaCampo({ valor, cambiar, disabled }: { valor: Categoria; cambiar: (v: Categoria) => void; disabled?: boolean }) {
  return <Opciones etiqueta="Categoría *" valor={valor} cambiar={cambiar} disabled={disabled} opciones={categorias.map(c => ({ valor: c, texto: etiquetas[c] }))} />;
}
export function ErrorMensaje({ error }: { error: string }) { return error ? <ThemedText accessibilityRole="alert" style={estilos.error}>{error}</ThemedText> : null; }
export function Cargando() { return <ActivityIndicator accessibilityLabel="Cargando" color={color.primario} size="large" />; }
export { useOperacion, mensajeError } from '../hooks/useOperacion';
