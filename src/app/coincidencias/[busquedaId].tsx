import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Encabezado } from '@/components/encabezado';
import { EstadoVista } from '@/components/estado-vista';
import { InsigniaSimilitud } from '@/components/insignia';
import { ObjetoCard } from '@/components/objeto-card';
import { Pantalla } from '@/components/pantalla';
import { Marca } from '@/constants/theme';
import { useCoincidencias } from '@/hooks/use-objetos';
import type { NivelSimilitud } from '@/types/findyp';

const ORDEN_NIVEL: Record<NivelSimilitud, number> = { alta: 0, media: 1, baja: 2 };

/**
 * Presenta las coincidencias que entrega el módulo de matching (Participante 4).
 * Solo muestra el nivel recibido; no calcula similitud.
 */
export default function CoincidenciasScreen() {
  const { busquedaId } = useLocalSearchParams<{ busquedaId: string }>();
  const { datos, cargando, error, recargar } = useCoincidencias(busquedaId);

  const coincidencias = useMemo(
    () =>
      [...(datos ?? [])].sort(
        (a, b) =>
          (a.nivel_similitud ? ORDEN_NIVEL[a.nivel_similitud] : 3) -
          (b.nivel_similitud ? ORDEN_NIVEL[b.nivel_similitud] : 3)
      ),
    [datos]
  );

  const vacio = (() => {
    if (error) return <EstadoVista tipo="error" mensaje={error} onReintentar={recargar} />;
    if (cargando && !datos) return <EstadoVista tipo="cargando" mensaje="Buscando coincidencias..." />;
    return (
      <EstadoVista
        tipo="vacio"
        titulo="Aún no hay coincidencias"
        mensaje="Te avisaremos cuando se publique un objeto parecido al que buscas."
      />
    );
  })();

  return (
    <Pantalla>
      <Encabezado titulo="Posibles coincidencias" regresarA="" />
      <FlatList
        data={error ? [] : coincidencias}
        keyExtractor={(coincidencia) => coincidencia.id}
        ListHeaderComponent={
          <Text style={styles.introduccion}>
            Estos objetos encontrados podrían ser el que perdiste. Revisa el detalle de cada uno.
          </Text>
        }
        ListEmptyComponent={vacio}
        renderItem={({ item }) => (
          <View style={styles.celda}>
            <ObjetoCard
              objeto={item.objeto}
              complemento={<InsigniaSimilitud nivel={item.nivel_similitud} />}
              onVerDetalle={(id) => router.push({ pathname: '/objeto/[id]', params: { id } })}
            />
          </View>
        )}
        contentContainerStyle={styles.lista}
      />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  lista: { gap: 16, paddingBottom: 24 },
  introduccion: {
    paddingHorizontal: 20,
    paddingTop: 20,
    fontSize: 16,
    color: Marca.colores.textoSecundario,
  },
  celda: { paddingHorizontal: 20 },
});
