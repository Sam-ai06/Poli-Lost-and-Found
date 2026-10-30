import { Image } from 'react-native';
import { validarPasoObjeto } from '../domain';
import { Boton, Campo, CategoriaCampo, Cargando, ErrorMensaje, estilos, Opciones, Pagina, Tarjeta, Texto } from '../components/ui';
import { useFormularioObjeto } from '../hooks/useFormularioObjeto';
import { useReportes } from '../services/ReportesProvider';
const nullable = (v: string) => v === '' ? null : v;
export default function FoundFormScreen({ id, activo = true }: { id?: string; activo?: boolean }) {
  const { datos, paso, setPaso, actualizar, listo, ocupado, error, ejecutar, cargar, foto, guardar } = useFormularioObjeto(id, activo);
  const { navegacion } = useReportes();
  return <Pagina titulo={id ? 'Editar objeto' : 'Publicar objeto encontrado'} alVolver={() => { if (!ocupado) { if (paso === 2) setPaso(1); else navegacion.volver(); } }}>
    <Texto secundario>Paso {paso} de 2 · {paso === 1 ? 'El objeto' : 'Hallazgo y entrega'}</Texto>
    <ErrorMensaje error={error} />
    {!listo ? <>{ocupado ? <Cargando /> : <Boton titulo="Reintentar carga" onPress={() => void cargar()} />}</> : <>
      <Texto secundario>Los campos con * son obligatorios. Tus datos se conservan al avanzar y volver entre pasos.</Texto>
      {paso === 1 ? <Tarjeta>
        {datos.imagen_url ? <Image accessibilityLabel="Vista previa del objeto" source={{ uri: datos.imagen_url }} style={estilos.imagen} /> : <Texto secundario>Añade una foto para que sea más fácil reconocerlo.</Texto>}
        <Boton secundario titulo={datos.imagen_url ? 'Cambiar imagen' : 'Elegir de la galería'} onPress={() => void foto()} disabled={ocupado} />
        {datos.imagen_url && <Boton secundario titulo="Quitar imagen" onPress={() => actualizar('imagen_url', null)} disabled={ocupado} />}
        <Opciones etiqueta="Tipo de imagen *" valor={datos.tipo_imagen} cambiar={v => actualizar('tipo_imagen', v)} disabled={ocupado} opciones={[{ valor: 'fotografia', texto: 'Fotografía real' }, { valor: 'referencia', texto: 'Referencia' }]} />
        <Campo etiqueta="Título *" valor={datos.titulo} cambiar={v => actualizar('titulo', v)} max={100} editable={!ocupado} placeholder="Ej. Termo azul de acero" />
        <CategoriaCampo valor={datos.categoria} cambiar={v => actualizar('categoria', v)} disabled={ocupado} />
        <Campo etiqueta="Color (opcional)" valor={datos.color ?? ''} cambiar={v => actualizar('color', nullable(v))} max={80} editable={!ocupado} />
        <Campo etiqueta="Descripción pública *" valor={datos.descripcion} cambiar={v => actualizar('descripcion', v)} multilinea editable={!ocupado} placeholder="Describe el objeto sin revelar señales privadas." />
        <Boton titulo="Continuar al hallazgo" disabled={ocupado} onPress={() => void ejecutar(async () => { validarPasoObjeto(datos); setPaso(2); })} />
      </Tarjeta> : <Tarjeta>
        <Campo etiqueta="Fecha del hallazgo *" valor={datos.fecha_hallazgo} cambiar={v => actualizar('fecha_hallazgo', v)} placeholder="AAAA-MM-DD" max={10} editable={!ocupado} />
        <Campo etiqueta="Lugar donde lo encontraste *" valor={datos.lugar_hallazgo} cambiar={v => actualizar('lugar_hallazgo', v)} max={200} editable={!ocupado} placeholder="Ej. Biblioteca central" />
        <Opciones etiqueta="¿Cómo se entregará? *" valor={datos.modalidad_entrega} cambiar={v => actualizar('modalidad_entrega', v)} disabled={ocupado} opciones={[{ valor: 'punto_entrega', texto: 'Punto de entrega' }, { valor: 'contacto', texto: 'Coordinar contacto' }]} />
        {datos.modalidad_entrega === 'punto_entrega' ? <Campo etiqueta="Lugar donde se recoge *" valor={datos.punto_entrega ?? ''} cambiar={v => actualizar('punto_entrega', nullable(v))} max={200} editable={!ocupado} placeholder="Ej. Recepción de biblioteca" /> : <Campo etiqueta="Medio de contacto privado *" valor={datos.contacto ?? ''} cambiar={v => actualizar('contacto', nullable(v))} max={200} editable={!ocupado} placeholder="Correo o teléfono" />}
        <Texto secundario>El lugar del hallazgo y el punto de recogida pueden ser diferentes.</Texto>
        <Campo etiqueta="Característica reservada (opcional)" valor={datos.caracteristica_reservada ?? ''} cambiar={v => actualizar('caracteristica_reservada', nullable(v))} multilinea editable={!ocupado} placeholder="Ej. Iniciales grabadas en la base" />
        <Texto secundario>Solo tú puedes consultar la característica reservada y el contacto. No aparecen en el resumen público.</Texto>
        <Boton secundario titulo="Volver al objeto" onPress={() => setPaso(1)} disabled={ocupado} />
        <Boton titulo={ocupado ? 'Guardando…' : id ? 'Guardar cambios' : 'Publicar objeto'} onPress={() => void guardar()} disabled={ocupado} />
      </Tarjeta>}
    </>}
  </Pagina>;
}
