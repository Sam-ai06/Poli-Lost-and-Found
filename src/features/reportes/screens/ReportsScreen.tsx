import { useState } from 'react';
import { Alert, Image } from 'react-native';
import { ImagenObjeto } from '@/components/imagen-objeto';
import { textoCoordenadas } from '@/features/ubicacion';
import { etiquetas, type Busqueda } from '../domain';
import { useReportes } from '../services/ReportesProvider';
import { useMisReportes } from '../hooks/useMisReportes';
import { Boton, Cargando, ErrorMensaje, estilos, Opciones, Pagina, Tarjeta, Texto } from '../components/ui';

export default function ReportsScreen() {
  const { navegacion, demo } = useReportes();
  const [tab, setTab] = useState<'objetos' | 'busquedas'>('objetos');
  const { objetos, busquedas, usuario, listo, ocupado, error, recargar, cerrarBusqueda } = useMisReportes();
  const nombre = usuario?.nombre;
  const cerrar = (b: Busqueda) => Alert.alert('Cerrar búsqueda', 'Dejará de estar activa y conservarás su historial.', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Cerrar búsqueda', onPress: () => void cerrarBusqueda(b.id) },
  ]);
  return <Pagina titulo="Mis reportes" inicio>
    <Texto secundario>{nombre ? `${nombre} · Comunidad ESPOL` : 'Comunidad ESPOL'}</Texto>
    <Boton titulo="Publicar objeto encontrado" disabled={ocupado} onPress={() => navegacion.publicar()} />
    <Boton titulo="Buscar mi objeto" secundario disabled={ocupado} onPress={() => navegacion.buscar()} />
    <Boton titulo="Reclamaciones recibidas y enviadas" secundario disabled={ocupado} onPress={navegacion.abrirReclamaciones} />
    <Opciones etiqueta="Tus reportes" valor={tab} cambiar={setTab} opciones={[{ valor: 'objetos', texto: 'Publicados' }, { valor: 'busquedas', texto: 'Búsquedas' }]} />
    <ErrorMensaje error={error} />
    {ocupado && <Cargando />}
    {error.length > 0 && <Boton titulo="Reintentar" secundario disabled={ocupado} onPress={() => void recargar()} />}
    {listo && (tab === 'objetos' ? objetos.length === 0 ? <Tarjeta><Texto>Aún no has publicado objetos.</Texto><Texto secundario>Publica uno para ayudar a alguien a recuperarlo.</Texto></Tarjeta> : objetos.map(o => <Tarjeta key={o.id}>
      {o.imagen_url && <ImagenObjeto objeto={o} altoMaximo={240} />}
      <Texto>{o.titulo}</Texto><Texto secundario>{etiquetas[o.categoria]} · {o.estado.replaceAll('_', ' ')}</Texto>
      <Texto>{o.descripcion}</Texto><Texto secundario>Encontrado: {o.lugar_hallazgo} · {o.fecha_hallazgo}</Texto>
      <Texto secundario>{o.modalidad_entrega === 'punto_entrega' ? `Recogida: ${o.punto_entrega}` : `Contacto privado: ${o.contacto}`}</Texto>
      {o.caracteristica_reservada && <Texto secundario>Solo tú · Verificación: {o.caracteristica_reservada}</Texto>}
      {o.estado === 'disponible' && <Boton secundario titulo="Editar objeto" disabled={ocupado} onPress={() => navegacion.publicar(o.id)} />}
    </Tarjeta>) : busquedas.length === 0 ? <Tarjeta><Texto>Aún no has guardado búsquedas.</Texto><Texto secundario>Describe lo que perdiste para empezar.</Texto></Tarjeta> : busquedas.map(b => <Tarjeta key={b.id}>
      {b.imagen_url && <Image source={{ uri: b.imagen_url }} style={estilos.imagen} accessibilityLabel="Imagen de búsqueda" />}
      <Texto>{etiquetas[b.categoria]} · {b.estado}</Texto><Texto>{b.descripcion}</Texto>
      <Texto secundario>{b.color ? `Color: ${b.color}` : 'Sin color indicado'} · {b.fecha_perdida ?? 'Fecha desconocida'}</Texto>
      <Texto secundario>{b.lugar_aproximado ?? 'Sin lugar aproximado'}</Texto>
      {b.ubicacion_perdida && <Texto secundario>Ubicación en el mapa: {textoCoordenadas(b.ubicacion_perdida)}</Texto>}
      {b.estado === 'activa' && <>
        <Boton secundario titulo="Editar búsqueda" disabled={ocupado} onPress={() => navegacion.buscar(b.id)} />
        <Boton secundario titulo="Ver posibles coincidencias" disabled={ocupado} onPress={() => navegacion.coincidencias(b.id)} />
        <Boton secundario titulo="Cerrar búsqueda" disabled={ocupado} onPress={() => cerrar(b)} />
      </>}
    </Tarjeta>))}
    {demo && <Boton secundario titulo="Utilidades de demostración" disabled={ocupado} onPress={() => navegacion.abrirDemo()} />}
  </Pagina>;
}
