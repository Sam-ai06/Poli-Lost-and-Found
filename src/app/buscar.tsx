import { useLocalSearchParams } from 'expo-router';
import { SearchFormScreen } from '@/features/reportes';

export default function BuscarScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <SearchFormScreen key={id ?? 'nueva'} id={id} />;
}
