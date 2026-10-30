import { useEffect, useState, type ReactNode } from 'react';
import { Button, Text, View } from 'react-native';

import { useSesion } from '@/features/autenticacion/services/sesion';

import { migrarReportesLocales } from './migracion';

export function MigracionReportes({ children }: { children: ReactNode }) {
  const { estado, sesion } = useSesion();
  const id = sesion?.user.id;
  const [intento, setIntento] = useState(0);
  const [resultado, setResultado] = useState<{ id: string; error: string | null } | null>(null);
  const [pospuesta, setPospuesta] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let activo = true;
    migrarReportesLocales(id).then(
      () => { if (activo) setResultado({ id, error: null }); },
      error => { if (activo) setResultado({ id, error: error instanceof Error ? error.message : 'No se pudieron migrar los reportes locales.' }); },
    );
    return () => { activo = false; };
  }, [id, intento]);

  if (estado === 'cargando' || (id && resultado?.id !== id)) {
    return <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}><Text>Preparando tus reportes…</Text></View>;
  }
  if (id && resultado?.error && pospuesta !== id) {
    return <View style={{ flex: 1, justifyContent: 'center', gap: 16, padding: 24 }}>
      <Text>{resultado.error}</Text><Text>Los datos originales siguen en este dispositivo.</Text>
      <Button title="Reintentar" onPress={() => { setResultado(null); setIntento(n => n + 1); }} />
      <Button title="Continuar y migrar después" onPress={() => setPospuesta(id)} />
    </View>;
  }
  return children;
}
