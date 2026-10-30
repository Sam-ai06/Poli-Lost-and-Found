import { ImagenObjeto } from '@/components/imagen-objeto';
import { useRecuperacion } from '../hooks/useRecuperacion';
import { useReportes } from '../services/ReportesProvider';
import { Boton, Campo, Cargando, ErrorMensaje, Pagina, Tarjeta, Texto } from '../components/ui';

export default function RecoveryScreen({ objetoId, busquedaId }: { objetoId: string; busquedaId?: string }) {
  const { objeto, detalle, setDetalle, enviada, ocupado, error, recargar, solicitar } = useRecuperacion(objetoId, busquedaId);
  const { navegacion } = useReportes();
  return <Pagina titulo="Solicitar recuperación">
    <ErrorMensaje error={error} />{ocupado && <Cargando />}
    {!objeto && error.length > 0 && <Boton secundario titulo="Reintentar" onPress={() => void recargar()} disabled={ocupado} />}
    {objeto && <>
      <Tarjeta>
        <ImagenObjeto objeto={objeto} altoMaximo={240} />
        <Texto>{objeto.titulo}</Texto><Texto>{objeto.descripcion}</Texto>
        <Texto secundario>Encontrado en {objeto.lugar_hallazgo} · {objeto.fecha_hallazgo}</Texto>
        {objeto.punto_entrega && <Texto secundario>Punto de recogida: {objeto.punto_entrega}</Texto>}
      </Tarjeta>
      <Tarjeta><Campo etiqueta="Característica privada para reconocerlo *" valor={detalle} cambiar={setDetalle} multilinea editable={!ocupado && !enviada} placeholder="Describe algo que solo su dueño conocería." />
        <Texto secundario>Solo tú y quien publicó el objeto podrán leer este detalle. La solicitud quedará pendiente de revisión.</Texto>
        <Boton titulo={enviada ? 'Solicitud enviada' : ocupado ? 'Enviando…' : 'Enviar solicitud'} disabled={ocupado || enviada} onPress={() => void solicitar()} />
      </Tarjeta>
    </>}
    <Boton secundario titulo="Ver mis reclamaciones" onPress={navegacion.abrirReclamaciones} disabled={ocupado} />
  </Pagina>;
}
