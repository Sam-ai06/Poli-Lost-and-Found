import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ColorValue } from 'react-native';

import { Marca } from '@/constants/theme';

/** Íconos semánticos de Findyp: SF Symbols en iOS y Material Symbols en Android/web. */
const ICONOS = {
  buscar: { ios: 'magnifyingglass', android: 'search', web: 'search' },
  agregar: { ios: 'plus', android: 'add', web: 'add' },
  ubicacion: { ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' },
  calendario: { ios: 'calendar', android: 'calendar_today', web: 'calendar_today' },
  entrega: { ios: 'shippingbox', android: 'package_2', web: 'package_2' },
  categoria: { ios: 'tag', android: 'sell', web: 'sell' },
  color: { ios: 'paintpalette', android: 'palette', web: 'palette' },
  siguiente: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  atras: { ios: 'chevron.left', android: 'arrow_back_ios', web: 'arrow_back_ios' },
  filtros: { ios: 'slider.horizontal.3', android: 'tune', web: 'tune' },
  reportes: { ios: 'doc.text', android: 'description', web: 'description' },
  perfil: { ios: 'person', android: 'person', web: 'person' },
  imagen: { ios: 'photo', android: 'image', web: 'image' },
  alerta: { ios: 'exclamationmark.triangle', android: 'error', web: 'error' },
  vacio: { ios: 'tray', android: 'inbox', web: 'inbox' },
  construccion: { ios: 'hammer', android: 'construction', web: 'construction' },
  correo: { ios: 'envelope', android: 'mail', web: 'mail' },
  candado: { ios: 'lock', android: 'lock', web: 'lock' },
  mostrar: { ios: 'eye', android: 'visibility', web: 'visibility' },
  ocultar: { ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' },
  verificado: { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' },
  pendiente: { ios: 'circle', android: 'radio_button_unchecked', web: 'radio_button_unchecked' },
  escudo: { ios: 'checkmark.shield', android: 'verified_user', web: 'verified_user' },
  universidad: { ios: 'graduationcap', android: 'school', web: 'school' },
  salir: { ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' },
  llave: { ios: 'key', android: 'key', web: 'key' },
} satisfies Record<string, Extract<SymbolViewProps['name'], object>>;

export type NombreIcono = keyof typeof ICONOS;

interface IconoProps {
  nombre: NombreIcono;
  tamano?: number;
  color?: ColorValue;
}

export function Icono({ nombre, tamano = 20, color = Marca.colores.texto }: IconoProps) {
  return <SymbolView name={ICONOS[nombre]} size={tamano} tintColor={color} />;
}
