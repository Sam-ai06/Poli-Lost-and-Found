import { useState } from 'react';
import { Alert } from 'react-native';
import { useReclamaciones } from '../hooks/useReclamaciones';
import { useReportes } from '../services/ReportesProvider';
import { Boton, Cargando, ErrorMensaje, Opciones, Pagina, Tarjeta, Texto } from '../components/ui';

export default function ClaimsScreen() {
  const [tab, setTab] = useState<'recibidas' | 'enviadas'>('recibidas');
  const { servicios } = useReportes();
  const { recibidas, enviadas, listo, ocupado, error, resolver, entregar, recargar, ejecutar } = useReclamaciones();
  const filas = tab === 'recibidas' ? recibidas : enviadas;
  return <Pagina titulo="Reclamaciones">
    <Opciones etiqueta="Solicitudes de recuperación" valor={tab} cambiar={setTab} opciones={[{ valor: 'recibidas', texto: 'Recibidas' }, { valor: 'enviadas', texto: 'Enviadas' }]} />
    <ErrorMensaje error={error} />{ocupado && <Cargando />}
    {error.length > 0 && <Boton titulo="Actualizar" secundario onPress={() => void recargar()} disabled={ocupado} />}
    {listo && filas.length === 0 && <Tarjeta><Texto>No tienes reclamaciones {tab}.</Texto><Texto secundario>{tab === 'recibidas' ? 'Aquí revisarás las solicitudes de tus objetos publicados.' : 'Solicita recuperar un objeto desde una coincidencia de tu búsqueda.'}</Texto></Tarjeta>}
    {filas.map(({ reclamacion: r, objeto, solicitante }) => <Tarjeta key={r.id}>
      <Texto>{objeto.titulo} · {r.estado}</Texto><Texto secundario>{tab === 'recibidas' ? `Solicita: ${solicitante.nombre}` : 'Solicitud enviada por ti'}</Texto>
      <Texto>Detalle privado: {r.detalle_verificacion}</Texto>
      {tab === 'recibidas' && r.estado === 'pendiente' && <>
        <Boton titulo="Aprobar solicitud" disabled={ocupado || objeto.estado !== 'disponible'} onPress={() => Alert.alert('Aprobar solicitud', 'El objeto pasará a recuperación. Confirma la entrega física posteriormente.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Aprobar', onPress: () => void resolver(r.id, 'aprobada') }])} />
        <Boton secundario titulo="Rechazar solicitud" disabled={ocupado} onPress={() => Alert.alert('Rechazar solicitud', 'La solicitud conservará su historial.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Rechazar', onPress: () => void resolver(r.id, 'rechazada') }])} />
      </>}
      {tab === 'recibidas' && r.estado === 'aprobada' && <>
        <Texto secundario>Aprobada. El objeto todavía no consta como entregado.</Texto>
        <Boton titulo="Confirmar entrega física" disabled={ocupado} onPress={() => Alert.alert('¿Ya entregaste el objeto?', 'Se marcarán como entregados el objeto y la reclamación, y como resuelta la búsqueda vinculada. Las otras solicitudes pendientes se cerrarán como rechazadas.', [{ text: 'Todavía no', style: 'cancel' }, { text: 'Sí, confirmar', onPress: () => void entregar(r.id) }])} />
      </>}
      {['aprobada', 'entregada'].includes(r.estado) && <Boton secundario titulo="Ver coordinación de entrega" disabled={ocupado} onPress={() => void ejecutar(async () => {
        const instrucciones = await servicios.obtenerInstruccionesEntrega(r.id);
        Alert.alert('Coordinación de entrega', instrucciones.contacto ?? instrucciones.punto_entrega ?? 'Consulta con quien publicó el objeto.');
      })} />}
    </Tarjeta>)}
  </Pagina>;
}
