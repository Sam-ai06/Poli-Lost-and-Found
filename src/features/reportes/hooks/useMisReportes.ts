import { useCallback, useEffect, useState } from 'react';
import type { Busqueda, ObjetoPropio, Usuario } from '../types';
import { useReportes } from '../services/ReportesProvider';
import { useOperacion } from './useOperacion';

export function useMisReportes() {
  const { servicios, revision, notificarCambio } = useReportes();
  const [vista, setVista] = useState<{ revision: number; usuario: Usuario; objetos: ObjetoPropio[]; busquedas: Busqueda[] } | null>(null);
  const { ocupado, error, ejecutar } = useOperacion();
  const cargar = useCallback(() => ejecutar(async () => {
    const usuario = await servicios.usuarioActual();
    const objetos = await servicios.listarMisObjetos();
    const busquedas = await servicios.listarMisBusquedas();
    setVista({ revision, usuario, objetos, busquedas });
  }), [servicios, revision, ejecutar]);
  useEffect(() => { void cargar(); }, [cargar]);
  const listo = vista?.revision === revision;
  const cerrarBusqueda = (id: string) => ejecutar(async () => { await servicios.cerrarBusqueda(id); notificarCambio(); });
  return {
    objetos: listo ? vista.objetos : [], busquedas: listo ? vista.busquedas : [],
    usuario: listo ? vista.usuario : null, listo, ocupado, error, recargar: cargar, cerrarBusqueda,
  };
}
