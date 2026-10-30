import { useLocalSearchParams } from 'expo-router';
import { MatchesScreen } from '@/features/reportes';
export default function CoincidenciasRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <MatchesScreen key={id} id={id} />;
}
