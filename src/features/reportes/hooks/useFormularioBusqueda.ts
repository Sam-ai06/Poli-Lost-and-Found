import { useCallback, useEffect, useState } from 'react';
import { validarBusqueda, type NuevaBusqueda } from '../domain';
import { useReportes } from '../services/ReportesProvider';
import { useOperacion } from './useOperacion';

export function useFormularioBusqueda(id?: string) {
  const { servicios: reportes, navegacion, notificarCambio } = useReportes();
  const [datos, setDatos] = useState<NuevaBusqueda>({ categoria: 'otros', descripcion: '', color: null, fecha_perdida: null, lugar_aproximado: null, imagen_url: null });
  const [listo, setListo] = useState(!id);
  const { ocupado, error, ejecutar } = useOperacion();
  const actualizar = <K extends keyof NuevaBusqueda>(k: K, v: NuevaBusqueda[K]) => setDatos(d => ({ ...d, [k]: v }));
  const cargar = useCallback(() => ejecutar(async () => {
    const b = (await reportes.listarMisBusquedas()).find(b => b.id === id);
    if (!b || b.estado !== 'activa') throw new Error('La búsqueda no existe, no te pertenece o ya no está activa.');
    setDatos(b); setListo(true);
  }), [ejecutar, reportes, id]);
  useEffect(() => {
    if (id) void cargar();
  }, [id, cargar]);
  const guardar = () => ejecutar(async () => {
    const normalizado = { ...datos, descripcion: datos.descripcion.trim() };
    validarBusqueda(normalizado);
    const b = id ? await reportes.actualizarBusqueda(id, normalizado) : await reportes.crearBusqueda(normalizado);
    notificarCambio(); navegacion.coincidencias(b.id, true);
  });
  return { datos, actualizar, listo, ocupado, error, ejecutar, cargar, guardar };
}
