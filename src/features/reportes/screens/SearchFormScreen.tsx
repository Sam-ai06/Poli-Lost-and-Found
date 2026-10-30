import { useState } from 'react';
import { Image, Keyboard } from 'react-native';
import { SelectorUbicacion, textoCoordenadas } from '@/features/ubicacion';
import { useReportes } from '../services/ReportesProvider';
import { Boton, Campo, CategoriaCampo, Cargando, ErrorMensaje, estilos, Pagina, Tarjeta, Texto } from '../components/ui';
import { useFormularioBusqueda } from '../hooks/useFormularioBusqueda';
export default function SearchFormScreen({ id }: { id?: string }) {
  const { datos, actualizar, listo, ocupado, error, ejecutar, cargar, guardar } = useFormularioBusqueda(id);
  const { imagenes } = useReportes();
  const [mapaAbierto, setMapaAbierto] = useState(false);
  return <Pagina titulo={id ? 'Editar búsqueda' : 'Buscar mi objeto'}>
    <Texto secundario>Cuéntanos qué perdiste. Los campos con * son obligatorios.</Texto>
    <ErrorMensaje error={error} />
    {!listo ? ocupado ? <Cargando /> : <Boton titulo="Reintentar carga" onPress={() => void cargar()} /> : <Tarjeta>
      <CategoriaCampo valor={datos.categoria} cambiar={v => actualizar('categoria', v)} disabled={ocupado} />
      <Campo etiqueta="Descripción *" valor={datos.descripcion} cambiar={v => actualizar('descripcion', v)} multilinea editable={!ocupado} placeholder="¿Cómo era? Incluye detalles que recuerdes." />
      <Campo etiqueta="Color (opcional)" valor={datos.color ?? ''} cambiar={v => actualizar('color', v || null)} max={80} editable={!ocupado} />
      <Campo etiqueta="Fecha aproximada (opcional)" valor={datos.fecha_perdida ?? ''} cambiar={v => actualizar('fecha_perdida', v || null)} placeholder="AAAA-MM-DD" max={10} editable={!ocupado} />
      <Campo etiqueta="Lugar aproximado (opcional)" valor={datos.lugar_aproximado ?? ''} cambiar={v => actualizar('lugar_aproximado', v || null)} max={200} editable={!ocupado} />
      <Texto secundario>{datos.ubicacion_perdida ? `Ubicación en el mapa: ${textoCoordenadas(datos.ubicacion_perdida)}` : 'También puedes marcar el lugar aproximado en el mapa de ESPOL.'}</Texto>
      <Boton secundario titulo={datos.ubicacion_perdida ? 'Cambiar ubicación en el mapa' : 'Seleccionar ubicación en el mapa'} disabled={ocupado} onPress={() => { Keyboard.dismiss(); setMapaAbierto(true); }} />
      {datos.ubicacion_perdida && <Boton secundario titulo="Quitar ubicación del mapa" disabled={ocupado} onPress={() => actualizar('ubicacion_perdida', null)} />}
      {datos.imagen_url && <Image source={{ uri: datos.imagen_url }} accessibilityLabel="Imagen de referencia de la búsqueda" style={estilos.imagen} />}
      <Boton secundario titulo={datos.imagen_url ? 'Cambiar imagen' : 'Añadir imagen (opcional)'} disabled={ocupado} onPress={() => void ejecutar(async () => { const uri = await imagenes.seleccionar(); if (uri) actualizar('imagen_url', uri); })} />
      {datos.imagen_url && <Boton secundario titulo="Quitar imagen" disabled={ocupado} onPress={() => actualizar('imagen_url', null)} />}
      <Boton titulo={ocupado ? 'Guardando…' : id ? 'Guardar cambios' : 'Guardar búsqueda'} disabled={ocupado} onPress={() => void guardar()} />
    </Tarjeta>}
    {mapaAbierto && <SelectorUbicacion valor={datos.ubicacion_perdida ?? null} alCancelar={() => setMapaAbierto(false)} alConfirmar={punto => { actualizar('ubicacion_perdida', punto); setMapaAbierto(false); }} />}
  </Pagina>;
}
