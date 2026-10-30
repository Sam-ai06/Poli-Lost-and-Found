import { NativeTabs } from 'expo-router/native-tabs';

import { Marca } from '@/constants/theme';

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor={Marca.colores.fondo}
      tintColor={Marca.colores.primario}
      indicatorColor={Marca.colores.primarioSuave}
      iconColor={{ default: Marca.colores.textoSecundario, selected: Marca.colores.primario }}
      labelStyle={{
        default: { color: Marca.colores.textoSecundario },
        selected: { color: Marca.colores.primario },
      }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Explorar</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="reportes">
        <NativeTabs.Trigger.Label>Mis reportes</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="doc.text" md="description" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="perfil">
        <NativeTabs.Trigger.Label>Perfil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person" md="person" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
