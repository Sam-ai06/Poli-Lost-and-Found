import { useLocalSearchParams } from 'expo-router';
import { RecoveryScreen } from '@/features/reportes';

export default function RecuperacionScreen() {
  const { objetoId, busquedaId } = useLocalSearchParams<{ objetoId: string; busquedaId?: string }>();
  return <RecoveryScreen key={`${objetoId}:${busquedaId ?? ''}`} objetoId={objetoId} busquedaId={busquedaId} />;
}
