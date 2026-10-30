export const categorias = ['documentos', 'llaves', 'electronica', 'botellas_termos', 'ropa', 'otros'] as const;
export type Categoria = (typeof categorias)[number];
export const etiquetas: Record<Categoria, string> = {
  documentos: 'Documentos', llaves: 'Llaves', electronica: 'Electrónica',
  botellas_termos: 'Botellas y termos', ropa: 'Ropa', otros: 'Otros',
};
export type Usuario = { id: string; nombre: string; correo: string };
export type Objeto = {
  id: string; publicador_id: string; titulo: string; categoria: Categoria; descripcion: string;
  color: string | null; fecha_hallazgo: string; lugar_hallazgo: string; imagen_url: string | null;
  tipo_imagen: 'fotografia' | 'referencia'; modalidad_entrega: 'punto_entrega' | 'contacto';
  punto_entrega: string | null; estado: 'disponible' | 'en_recuperacion' | 'entregado'; creado_en: string;
};
// Never include this record in public object responses.
export type PrivadoObjeto = { contacto: string | null; caracteristica_reservada: string | null };
export type ObjetoPropio = Objeto & PrivadoObjeto;
export type NuevoObjeto = Omit<ObjetoPropio, 'id' | 'publicador_id' | 'estado' | 'creado_en'>;
export type Busqueda = {
  id: string; solicitante_id: string; categoria: Categoria; descripcion: string; color: string | null;
  fecha_perdida: string | null; lugar_aproximado: string | null; imagen_url: string | null;
  estado: 'activa' | 'resuelta' | 'cerrada'; creado_en: string;
};
export type NuevaBusqueda = Omit<Busqueda, 'id' | 'solicitante_id' | 'estado' | 'creado_en'>;
// Private: visible only to the claimant and the object's publisher.
export type Reclamacion = {
  id: string; objeto_id: string; solicitante_id: string; busqueda_id: string | null;
  detalle_verificacion: string; estado: 'pendiente' | 'aprobada' | 'rechazada' | 'entregada'; creado_en: string;
};
export type NuevaReclamacion = { objeto_id: string; busqueda_id?: string | null; detalle_verificacion: string };
export type ReclamacionResumen = { reclamacion: Reclamacion; objeto: Objeto; solicitante: Pick<Usuario, 'id' | 'nombre'> };
export type EstadoLocal = {
  version: 1; usuario_id: string; objetos: Objeto[]; privados: Record<string, PrivadoObjeto>; busquedas: Busqueda[]; reclamaciones: Reclamacion[];
};
export interface AlmacenReportes { leer(): Promise<unknown | null>; guardar(estado: EstadoLocal): Promise<void> }
export interface ServicioReportes {
  usuarioActual(): Promise<Usuario>;
  crearObjeto(datos: NuevoObjeto): Promise<ObjetoPropio>;
  listarMisObjetos(): Promise<ObjetoPropio[]>;
  obtenerObjeto(id: string): Promise<Objeto>;
  listarObjetosPublicos(): Promise<Objeto[]>;
  actualizarObjeto(id: string, datos: NuevoObjeto): Promise<ObjetoPropio>;
  crearBusqueda(datos: NuevaBusqueda): Promise<Busqueda>;
  listarMisBusquedas(): Promise<Busqueda[]>;
  actualizarBusqueda(id: string, datos: NuevaBusqueda): Promise<Busqueda>;
  cerrarBusqueda(id: string): Promise<void>;
  solicitarCoincidencias(id: string): Promise<Objeto[]>;
  crearReclamacion(datos: NuevaReclamacion): Promise<Reclamacion>;
  listarMisReclamaciones(): Promise<ReclamacionResumen[]>;
  listarReclamacionesRecibidas(): Promise<ReclamacionResumen[]>;
  resolverReclamacion(id: string, decision: 'aprobada' | 'rechazada'): Promise<void>;
  confirmarEntrega(id: string): Promise<void>;
  obtenerInstruccionesEntrega(id: string): Promise<{ contacto: string | null; punto_entrega: string | null }>;
}

export interface ControlesDemo {
  usuarios: readonly Usuario[];
  cambiarUsuario(id: string): Promise<void>;
  reiniciarDemo(): Promise<void>;
}
