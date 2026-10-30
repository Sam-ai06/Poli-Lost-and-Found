/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/**
 * Identidad visual de Findyp. Otra universidad puede personalizar la aplicación
 * cambiando únicamente estos valores.
 */
export const Marca = {
  nombre: 'Findyp',
  colores: {
    primario: '#4F46E5',
    primarioPresionado: '#4338CA',
    primarioSuave: '#EEF0FF',
    primarioBorde: '#C7CAF7',
    primarioOscuro: '#312E81',
    acento: '#F59E0B',
    textoSobrePrimario: '#FFFFFF',
    textoSuaveSobrePrimario: '#E0E7FF',
    texto: '#0F172A',
    textoSecundario: '#64748B',
    fondo: '#FFFFFF',
    fondoPagina: '#F8F9FC',
    borde: '#E2E8F0',
    exito: '#15803D',
    exitoPunto: '#16A34A',
    exitoSuave: '#DCFCE7',
    advertencia: '#B45309',
    advertenciaSuave: '#FEF3C7',
    neutro: '#475569',
    neutroSuave: '#F1F5F9',
    error: '#B91C1C',
    errorSuave: '#FEE2E2',
    imagenFondo: '#E8EAF6',
  },
  radios: {
    pequeno: 8,
    medio: 12,
    grande: 16,
    pildora: 999,
  },
} as const;

export const SombraTarjeta = Platform.select({
  web: { boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)' },
  default: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
