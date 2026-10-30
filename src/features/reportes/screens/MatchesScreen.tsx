import { useEffect, useState } from 'react';
import { Image } from 'react-native';
import type { Objeto } from '../domain';
import { useReportes } from '../services/ReportesProvider';
import { Boton, Cargando, ErrorMensaje, estilos, Pagina, Tarjeta, Texto, useOperacion } from '../components/ui';

export default function MatchesScreen({ id }: { id: string }) {
  const { servicios: reportes, navegacion } = useReportes();
  const [objetos, setObjetos] = useState<Objeto[]>([]);
  const [listo, setListo] = useState(false);
  const { ocupado, error, ejecutar } = useOperacion();
  const cargar = () => ejecutar(async () => { setObjetos(await reportes.solicitarCoincidencias(id)); setListo(true); });
  useEffect(() => {
    void cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  return <Pagina titulo="Búsqueda guardada">
    <Texto secundario>Demostración: estos objetos comparten la categoría de tu búsqueda. El módulo de coincidencias se conectará después.</Texto>
    <ErrorMensaje error={error} />{ocupado && <Cargando />}
    {error.length > 0 && <Boton titulo="Reintentar coincidencias" onPress={() => void cargar()} disabled={ocupado} />}
    {listo && objetos.length === 0 && <Tarjeta><Texto>No hay objetos de esa categoría disponibles por ahora.</Texto><Texto secundario>Tu búsqueda quedó guardada en Mis reportes.</Texto></Tarjeta>}
    {objetos.map(o => <Tarjeta key={o.id}>
      {o.imagen_url && <Image source={{ uri: o.imagen_url }} style={estilos.imagen} accessibilityLabel={o.titulo} />}
      <Texto>{o.titulo}</Texto><Texto>{o.descripcion}</Texto><Texto secundario>Hallazgo: {o.lugar_hallazgo} · {o.fecha_hallazgo}</Texto>
      <Texto secundario>{o.tipo_imagen === 'referencia' ? 'Imagen de referencia' : 'Fotografía real'}</Texto>
      <Boton titulo="Solicitar recuperación" onPress={() => navegacion.solicitarRecuperacion(o.id, id)} disabled={ocupado} />
    </Tarjeta>)}
    <Boton titulo="Ir a Mis reportes" onPress={() => navegacion.verReportes()} />
  </Pagina>;
}
