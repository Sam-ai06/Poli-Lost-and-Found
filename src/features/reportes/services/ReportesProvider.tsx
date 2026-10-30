import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ControlesDemo, ServicioReportes } from '../types';

export interface NavegacionReportes {
  verReportes(): void;
  publicar(id?: string): void;
  buscar(id?: string): void;
  coincidencias(busquedaId: string, reemplazarFormulario?: boolean): void;
  abrirDemo(): void;
  abrirReclamaciones(): void;
  solicitarRecuperacion(objetoId: string, busquedaId?: string): void;
}
export interface ImagenesReportes { seleccionar(): Promise<string | null> }
interface ContextoReportes {
  servicios: ServicioReportes;
  navegacion: NavegacionReportes;
  imagenes: ImagenesReportes;
  demo?: ControlesDemo;
  revision: number;
  notificarCambio(): void;
}
const Contexto = createContext<ContextoReportes | null>(null);
export function ReportesProvider({ servicios, navegacion, imagenes, demo, children }: {
  servicios: ServicioReportes; navegacion: NavegacionReportes; imagenes: ImagenesReportes;
  demo?: ControlesDemo; children: ReactNode;
}) {
  const [revision, setRevision] = useState(0);
  const valor = useMemo(() => ({ servicios, navegacion, imagenes, demo, revision, notificarCambio: () => setRevision(r => r + 1) }), [servicios, navegacion, imagenes, demo, revision]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}
export function useReportes() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('Monta ReportesProvider antes de usar el módulo.');
  return contexto;
}
