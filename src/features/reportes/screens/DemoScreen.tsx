import { Alert } from 'react-native';
import { useReportes } from '../services/ReportesProvider';
import { Boton, ErrorMensaje, Pagina, Tarjeta, Texto, useOperacion } from '../components/ui';

export default function DemoScreen() {
  const { demo, navegacion, notificarCambio } = useReportes();
  const { ocupado, error, ejecutar } = useOperacion();
  if (!demo) return <Pagina titulo="Demostración"><Texto>La aplicación anfitriona no habilitó las utilidades de demostración.</Texto></Pagina>;
  return <Pagina titulo="Utilidades de demostración">
    <Texto secundario>Solo para probar datos ficticios. No es un inicio de sesión real.</Texto>
    <ErrorMensaje error={error} />
    <Tarjeta><Texto>Cambiar usuario</Texto>{demo?.usuarios.map(u => <Boton key={u.id} titulo={`${u.nombre} · ${u.correo}`} disabled={ocupado} secundario onPress={() => void ejecutar(async () => { await demo!.cambiarUsuario(u.id); notificarCambio(); navegacion.verReportes(); })} />)}</Tarjeta>
    <Tarjeta><Texto>Reiniciar registros de demostración</Texto><Texto secundario>Elimina los reportes locales y vuelve a Ana. Las imágenes conservadas no se eliminan automáticamente.</Texto>
      <Boton titulo="Reiniciar datos" disabled={ocupado} secundario onPress={() => Alert.alert('Reiniciar datos', 'Se perderán los registros locales de este módulo.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Reiniciar', style: 'destructive', onPress: () => void ejecutar(async () => { await demo!.reiniciarDemo(); notificarCambio(); navegacion.verReportes(); }) }])} />
    </Tarjeta>
  </Pagina>;
}
