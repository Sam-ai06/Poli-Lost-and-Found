import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { BarraBusqueda } from '@/components/barra-busqueda';
import { Boton } from '@/components/boton';
import { ChipsFiltro, type OpcionChip } from '@/components/chips-filtro';
import { Encabezado } from '@/components/encabezado';
import { EstadoVista } from '@/components/estado-vista';
import { ObjetoCard } from '@/components/objeto-card';
import { Pantalla } from '@/components/pantalla';
import { Marca } from '@/constants/theme';
import { useDebounce } from '@/hooks/use-debounce';
import { useObjetos } from '@/hooks/use-objetos';
import {
  CATEGORIAS,
  ESTADOS_OBJETO,
  type Categoria,
  type EstadoObjeto,
  type FiltrosObjetos,
  type RangoFecha,
} from '@/types/findyp';
import {
  ETIQUETAS_CATEGORIA,
  ETIQUETAS_ESTADO,
  ETIQUETAS_RANGO_FECHA,
} from '@/utils/formato';

const OPCIONES_CATEGORIA: OpcionChip<Categoria>[] = [
  { valor: null, etiqueta: 'Todos' },
  ...CATEGORIAS.map((valor) => ({ valor, etiqueta: ETIQUETAS_CATEGORIA[valor] })),
];

const OPCIONES_ESTADO: OpcionChip<EstadoObjeto>[] = [
  { valor: null, etiqueta: 'Todos' },
  ...ESTADOS_OBJETO.map((valor) => ({ valor, etiqueta: ETIQUETAS_ESTADO[valor] })),
];

const OPCIONES_FECHA: OpcionChip<Exclude<RangoFecha, 'todas'>>[] = [
  { valor: null, etiqueta: ETIQUETAS_RANGO_FECHA.todas },
  { valor: 'ultimos_7', etiqueta: ETIQUETAS_RANGO_FECHA.ultimos_7 },
  { valor: 'ultimos_30', etiqueta: ETIQUETAS_RANGO_FECHA.ultimos_30 },
];

const ANCHO_MINIMO_COLUMNA = 340;

/** Galería de objetos encontrados: búsqueda, filtros y tarjetas. */
export default function ExplorarScreen() {
  const { width } = useWindowDimensions();
  const columnas = width >= ANCHO_MINIMO_COLUMNA * 2 + 60 ? 2 : 1;

  const [texto, setTexto] = useState('');
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [estado, setEstado] = useState<EstadoObjeto | null>(null);
  const [lugar, setLugar] = useState<string | null>(null);
  const [rangoFecha, setRangoFecha] = useState<Exclude<RangoFecha, 'todas'> | null>(null);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  const textoDiferido = useDebounce(texto);
  const filtros = useMemo<FiltrosObjetos>(
    () => ({ texto: textoDiferido, categoria, estado, lugar, rangoFecha: rangoFecha ?? 'todas' }),
    [textoDiferido, categoria, estado, lugar, rangoFecha]
  );
  const { datos: objetos, cargando, error, recargar } = useObjetos(filtros);

  const opcionesLugar = useMemo<OpcionChip<string>[]>(() => {
    const lugares = new Set<string>(lugar ? [lugar] : []);
    objetos?.forEach(({ lugar_hallazgo }) => lugar_hallazgo && lugares.add(lugar_hallazgo));
    return [
      { valor: null, etiqueta: 'Todos' },
      ...[...lugares].sort().map((valor) => ({ valor, etiqueta: valor })),
    ];
  }, [objetos, lugar]);

  const filtrosActivos = [estado, lugar, rangoFecha].filter(Boolean).length;

  const limpiarFiltros = () => {
    setTexto('');
    setCategoria(null);
    setEstado(null);
    setLugar(null);
    setRangoFecha(null);
  };

  const verDetalle = (id: string) => router.push({ pathname: '/objeto/[id]', params: { id } });

  const cabecera = (
    <View style={styles.cabecera}>
      <View style={styles.hero}>
        <Text style={styles.heroTitulo}>¿Perdiste algo?</Text>
        <Text style={styles.heroTexto}>Explora los objetos encontrados o crea una búsqueda.</Text>
        <Boton etiqueta="Buscar mi objeto" icono="buscar" onPress={() => router.push('/buscar')} />
        <Boton
          etiqueta="Publicar objeto"
          icono="agregar"
          variante="secundario"
          onPress={() => router.push('/publicar')}
        />
      </View>

      <BarraBusqueda
        valor={texto}
        onCambiar={setTexto}
        filtrosAbiertos={filtrosAbiertos}
        onAlternarFiltros={() => setFiltrosAbiertos((abierto) => !abierto)}
        filtrosActivos={filtrosActivos}
      />
      <ChipsFiltro
        etiquetaAccesible="Filtrar por categoría"
        opciones={OPCIONES_CATEGORIA}
        seleccionado={categoria}
        onCambiar={setCategoria}
      />

      {filtrosAbiertos ? (
        <View style={styles.panelFiltros}>
          <Text style={styles.tituloFiltro}>Estado</Text>
          <ChipsFiltro
            etiquetaAccesible="Filtrar por estado"
            opciones={OPCIONES_ESTADO}
            seleccionado={estado}
            onCambiar={setEstado}
          />
          <Text style={styles.tituloFiltro}>Lugar del hallazgo</Text>
          <ChipsFiltro
            etiquetaAccesible="Filtrar por lugar"
            opciones={opcionesLugar}
            seleccionado={lugar}
            onCambiar={setLugar}
          />
          <Text style={styles.tituloFiltro}>Fecha del hallazgo</Text>
          <ChipsFiltro
            etiquetaAccesible="Filtrar por fecha"
            opciones={OPCIONES_FECHA}
            seleccionado={rangoFecha}
            onCambiar={setRangoFecha}
          />
        </View>
      ) : null}
    </View>
  );

  const contenidoVacio = (() => {
    if (error) return <EstadoVista tipo="error" mensaje={error} onReintentar={recargar} />;
    if (cargando && !objetos) return <EstadoVista tipo="cargando" mensaje="Cargando objetos..." />;
    return (
      <View>
        <EstadoVista
          tipo="vacio"
          titulo="No encontramos objetos"
          mensaje="Prueba con otra descripción o cambia los filtros."
        />
        <View style={styles.limpiar}>
          <Boton etiqueta="Limpiar filtros" variante="secundario" compacto onPress={limpiarFiltros} />
        </View>
      </View>
    );
  })();

  return (
    <Pantalla>
      <Encabezado
        titulo="Objetos perdidos"
        accion={
          <Boton
            etiqueta="Publicar objeto"
            icono="agregar"
            compacto
            onPress={() => router.push('/publicar')}
          />
        }
      />
      <FlatList
        key={`columnas-${columnas}`}
        data={error ? [] : (objetos ?? [])}
        keyExtractor={(objeto) => objeto.id}
        numColumns={columnas}
        columnWrapperStyle={columnas > 1 ? styles.fila : undefined}
        ListHeaderComponent={cabecera}
        ListEmptyComponent={contenidoVacio}
        renderItem={({ item }) => (
          <View style={[styles.celda, columnas === 1 && styles.celdaUnica]}>
            <ObjetoCard objeto={item} onVerDetalle={verDetalle} />
          </View>
        )}
        contentContainerStyle={styles.lista}
        keyboardShouldPersistTaps="handled"
      />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  lista: { paddingBottom: 24, gap: 16 },
  cabecera: { gap: 16, paddingBottom: 4 },
  hero: { gap: 12, paddingHorizontal: 20, paddingTop: 20 },
  heroTitulo: { fontSize: 32, fontWeight: '800', color: Marca.colores.texto },
  heroTexto: { fontSize: 16, color: Marca.colores.textoSecundario, marginBottom: 4 },
  panelFiltros: { gap: 8 },
  tituloFiltro: {
    paddingHorizontal: 20,
    fontSize: 14,
    fontWeight: '600',
    color: Marca.colores.textoSecundario,
  },
  fila: { gap: 16, paddingHorizontal: 20 },
  celda: { flex: 1 },
  celdaUnica: { paddingHorizontal: 20 },
  limpiar: { alignItems: 'center' },
});
