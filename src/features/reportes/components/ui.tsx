import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { categorias, etiquetas, type Categoria } from '../types';

export const color = { primario: '#5145CD', texto: '#17243B', fondo: '#F3F4F8', borde: '#DADDE7' };
export const estilos = StyleSheet.create({
  pagina: { flex: 1, backgroundColor: color.fondo }, contenido: { padding: 20, paddingTop: Platform.OS === 'web' ? 80 : 20, paddingBottom: 40, gap: 16, width: '100%', maxWidth: 620, alignSelf: 'center' },
  titulo: { color: color.texto, fontSize: 26, fontWeight: '700', lineHeight: 34 },
  texto: { color: color.texto, lineHeight: 23 }, secundario: { color: '#59667A', lineHeight: 22 },
  tarjeta: { backgroundColor: 'white', padding: 16, borderRadius: 12, gap: 12, borderWidth: 1, borderColor: '#E6E8EF' },
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  campo: { borderWidth: 1, borderColor: color.borde, borderRadius: 12, backgroundColor: 'white', padding: 14, minHeight: 50, fontSize: 16, color: color.texto },
  etiqueta: { fontWeight: '600', color: color.texto }, error: { color: '#A42232', lineHeight: 23 },
  imagen: { width: '100%', height: 190, borderRadius: 12, backgroundColor: '#EAECF4' },
});
export function Texto({ children, secundario = false }: { children: React.ReactNode; secundario?: boolean }) {
  return <ThemedText style={secundario ? estilos.secundario : estilos.texto}>{children}</ThemedText>;
}
export function Pagina({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return <SafeAreaView edges={['top', 'left', 'right']} style={estilos.pagina}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={estilos.contenido}>
        <ThemedText accessibilityRole="header" style={estilos.titulo}>{titulo}</ThemedText>
        {Platform.OS === 'web' && <Texto secundario>Vista previa web: los datos se conservan solo durante esta sesión. Prueba la persistencia en el teléfono.</Texto>}
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
export function Tarjeta({ children }: { children: React.ReactNode }) { return <ThemedView style={estilos.tarjeta}>{children}</ThemedView>; }
export function Boton({ titulo, onPress, disabled = false, secundario = false }: { titulo: string; onPress: () => void; disabled?: boolean; secundario?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => ({ backgroundColor: secundario ? 'white' : color.primario, borderColor: color.primario, borderWidth: 1, minHeight: 48, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, justifyContent: 'center', opacity: disabled ? 0.5 : pressed ? 0.7 : 1 })}>
    <ThemedText style={{ color: secundario ? color.primario : 'white', fontWeight: '600', textAlign: 'center' }}>{titulo}</ThemedText>
  </Pressable>;
}
export function Campo({ etiqueta, valor, cambiar, multilinea = false, max = 2000, placeholder, editable = true }: { etiqueta: string; valor: string; cambiar: (v: string) => void; multilinea?: boolean; max?: number; placeholder?: string; editable?: boolean }) {
  return <View style={{ gap: 8 }}><ThemedText style={estilos.etiqueta}>{etiqueta}</ThemedText>
    <TextInput accessibilityLabel={etiqueta} value={valor} onChangeText={cambiar} editable={editable} maxLength={max} multiline={multilinea} placeholder={placeholder} placeholderTextColor="#758095" autoCapitalize="sentences" style={[estilos.campo, multilinea && { minHeight: 110, textAlignVertical: 'top' }]} />
  </View>;
}
export function Opciones<T extends string>({ etiqueta, valor, opciones, cambiar, disabled = false }: { etiqueta: string; valor: T; opciones: readonly { valor: T; texto: string }[]; cambiar: (v: T) => void; disabled?: boolean }) {
  return <View style={{ gap: 8 }}><ThemedText style={estilos.etiqueta}>{etiqueta}</ThemedText><View style={estilos.fila}>
    {opciones.map(o => <Pressable accessibilityRole="radio" accessibilityState={{ checked: valor === o.valor, disabled }} disabled={disabled} key={o.valor} onPress={() => cambiar(o.valor)} style={{ padding: 12, minHeight: 46, borderRadius: 12, borderWidth: 1, borderColor: valor === o.valor ? color.primario : color.borde, backgroundColor: valor === o.valor ? '#EFEDFF' : 'white' }}><ThemedText style={{ color: valor === o.valor ? color.primario : color.texto }}>{o.texto}</ThemedText></Pressable>)}
  </View></View>;
}
export function CategoriaCampo({ valor, cambiar, disabled }: { valor: Categoria; cambiar: (v: Categoria) => void; disabled?: boolean }) {
  return <Opciones etiqueta="Categoría *" valor={valor} cambiar={cambiar} disabled={disabled} opciones={categorias.map(c => ({ valor: c, texto: etiquetas[c] }))} />;
}
export function ErrorMensaje({ error }: { error: string }) { return error ? <ThemedText accessibilityRole="alert" style={estilos.error}>{error}</ThemedText> : null; }
export function Cargando() { return <ActivityIndicator accessibilityLabel="Cargando" color={color.primario} size="large" />; }
export { useOperacion, mensajeError } from '../hooks/useOperacion';
