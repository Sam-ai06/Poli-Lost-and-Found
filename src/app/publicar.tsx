import { useCallback, useState } from 'react';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { FoundFormScreen } from '@/features/reportes';

export default function PublicarScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [activo, setActivo] = useState(false);
  useFocusEffect(useCallback(() => { setActivo(true); return () => setActivo(false); }, []));
  return <FoundFormScreen key={id ?? 'nuevo'} id={id} activo={activo} />;
}
