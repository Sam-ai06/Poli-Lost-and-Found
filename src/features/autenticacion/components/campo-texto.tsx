import { useState, type ComponentProps, type ComponentRef, type Ref } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ReturnKeyTypeOptions,
} from 'react-native';

import { Icono, type NombreIcono } from '@/components/icono';
import { Marca } from '@/constants/theme';

/** Instancia del campo de texto, para mover el foco entre campos. */
export type CampoRef = ComponentRef<typeof TextInput>;

type TipoCampo = 'correo' | 'contrasena' | 'contrasena_nueva' | 'nombre';

const CONFIGURACION: Record<
  TipoCampo,
  Pick<
    ComponentProps<typeof TextInput>,
    'autoCapitalize' | 'autoComplete' | 'keyboardType' | 'textContentType' | 'inputMode'
  >
> = {
  correo: {
    autoCapitalize: 'none',
    autoComplete: 'email',
    keyboardType: 'email-address',
    textContentType: 'emailAddress',
    inputMode: 'email',
  },
  contrasena: { autoCapitalize: 'none', autoComplete: 'current-password', textContentType: 'password' },
  contrasena_nueva: { autoCapitalize: 'none', autoComplete: 'new-password', textContentType: 'newPassword' },
  nombre: { autoCapitalize: 'words', autoComplete: 'name', textContentType: 'name' },
};

const ICONO: Record<TipoCampo, NombreIcono> = {
  correo: 'correo',
  contrasena: 'candado',
  contrasena_nueva: 'candado',
  nombre: 'perfil',
};

interface CampoTextoProps {
  etiqueta: string;
  tipo: TipoCampo;
  valor: string;
  onCambiar: (texto: string) => void;
  onSalir?: () => void;
  onEnviar?: () => void;
  error?: string | null;
  /** Mensaje positivo, por ejemplo cuando el dominio del correo es válido. */
  exito?: string | null;
  ayuda?: string;
  placeholder?: string;
  returnKeyType?: ReturnKeyTypeOptions;
  ref?: Ref<CampoRef>;
}

export function CampoTexto({
  etiqueta,
  tipo,
  valor,
  onCambiar,
  onSalir,
  onEnviar,
  error,
  exito,
  ayuda,
  placeholder,
  returnKeyType = 'next',
  ref,
}: CampoTextoProps) {
  const [enfocado, setEnfocado] = useState(false);
  const [visible, setVisible] = useState(false);
  const esContrasena = tipo === 'contrasena' || tipo === 'contrasena_nueva';
  const mensaje = error ?? exito ?? ayuda;
  const colorBorde = error
    ? Marca.colores.error
    : enfocado
      ? Marca.colores.primario
      : exito
        ? Marca.colores.exito
        : Marca.colores.borde;

  return (
    <View style={styles.contenedor}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <View style={[styles.campo, { borderColor: colorBorde }, enfocado && styles.campoEnfocado]}>
        <Icono
          nombre={ICONO[tipo]}
          tamano={20}
          color={enfocado ? Marca.colores.primario : Marca.colores.textoSecundario}
        />
        <TextInput
          ref={ref}
          value={valor}
          onChangeText={onCambiar}
          onFocus={() => setEnfocado(true)}
          onBlur={() => {
            setEnfocado(false);
            onSalir?.();
          }}
          onSubmitEditing={onEnviar}
          submitBehavior={returnKeyType === 'next' ? 'submit' : 'blurAndSubmit'}
          returnKeyType={returnKeyType}
          placeholder={placeholder}
          placeholderTextColor={Marca.colores.textoSecundario}
          secureTextEntry={esContrasena && !visible}
          autoCorrect={false}
          accessibilityLabel={etiqueta}
          accessibilityHint={mensaje ?? undefined}
          style={styles.entrada}
          {...CONFIGURACION[tipo]}
        />
        {esContrasena ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            hitSlop={8}
            onPress={() => setVisible((actual) => !actual)}
            style={styles.alternar}>
            <Icono
              nombre={visible ? 'ocultar' : 'mostrar'}
              tamano={20}
              color={Marca.colores.textoSecundario}
            />
          </Pressable>
        ) : null}
      </View>
      {mensaje ? (
        <View style={styles.filaMensaje} accessibilityLiveRegion={error ? 'polite' : 'none'}>
          {error || exito ? (
            <Icono
              nombre={error ? 'alerta' : 'verificado'}
              tamano={16}
              color={error ? Marca.colores.error : Marca.colores.exito}
            />
          ) : null}
          <Text
            accessibilityRole={error ? 'alert' : undefined}
            style={[styles.mensaje, error ? styles.error : exito ? styles.exito : null]}>
            {mensaje}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: 6 },
  etiqueta: { fontSize: 15, fontWeight: '600', color: Marca.colores.texto },
  campo: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderRadius: Marca.radios.medio,
    backgroundColor: Marca.colores.fondoPagina,
  },
  campoEnfocado: { backgroundColor: Marca.colores.fondo },
  entrada: { flex: 1, minHeight: 48, fontSize: 16, color: Marca.colores.texto },
  alternar: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  filaMensaje: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  mensaje: { flex: 1, fontSize: 14, lineHeight: 19, color: Marca.colores.textoSecundario },
  error: { color: Marca.colores.error },
  exito: { color: Marca.colores.exito },
});
