import { useCallback, useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import { fechaHoy, validarObjeto, type NuevoObjeto } from '../domain';
import { useReportes } from '../services/ReportesProvider';
import { useOperacion } from './useOperacion';

const inicial = (): NuevoObjeto => ({ titulo: '', categoria: 'otros', descripcion: '', color: null, imagen_url: null, tipo_imagen: 'fotografia', fecha_hallazgo: fechaHoy(), lugar_hallazgo: '', modalidad_entrega: 'punto_entrega', punto_entrega: null, contacto: null, caracteristica_reservada: null });
export function useFormularioObjeto(id?: string, activo = true) {
  const { servicios: reportes, navegacion, imagenes, notificarCambio } = useReportes();
  const [datos, setDatos] = useState<NuevoObjeto>(inicial);
  const [paso, setPaso] = useState(1);
  const [listo, setListo] = useState(!id);
  const { ocupado, error, ejecutar } = useOperacion();
  const actualizar = <K extends keyof NuevoObjeto>(key: K, value: NuevoObjeto[K]) => setDatos(d => ({ ...d, [key]: value }));
  const cargar = useCallback(() => ejecutar(async () => {
    const objetos = await reportes.listarMisObjetos();
    const objeto = objetos.find(o => o.id === id);
    if (!objeto) throw new Error('El objeto no existe o no te pertenece.');
    if (objeto.estado !== 'disponible') throw new Error('Este objeto no se puede editar en su estado actual.');
    setDatos(objeto); setListo(true);
  }), [id, ejecutar, reportes]);
  useEffect(() => {
    if (id) void cargar();
  }, [id, cargar]);
  useEffect(() => {
    if (!activo) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (ocupado) return true;
      if (paso === 2) { setPaso(1); return true; }
      return false;
    });
    return () => sub.remove();
  }, [paso, ocupado, activo]);
  const foto = () => ejecutar(async () => { const uri = await imagenes.seleccionar(); if (uri) actualizar('imagen_url', uri); });
  async function guardar() {
    await ejecutar(async () => {
      const normalizado = { ...datos, titulo: datos.titulo.trim(), descripcion: datos.descripcion.trim(), lugar_hallazgo: datos.lugar_hallazgo.trim(), punto_entrega: datos.modalidad_entrega === 'punto_entrega' ? datos.punto_entrega : null, contacto: datos.modalidad_entrega === 'contacto' ? datos.contacto : null };
      validarObjeto(normalizado);
      if (id) await reportes.actualizarObjeto(id, normalizado); else await reportes.crearObjeto(normalizado);
      notificarCambio(); navegacion.verReportes();
    });
  }
  return { datos, paso, setPaso, actualizar, listo, ocupado, error, ejecutar, cargar, foto, guardar };
}
