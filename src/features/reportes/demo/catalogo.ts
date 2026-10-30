import { fechaHoy, fechaValida } from '../domain/index.ts';
import { categorias, type EstadoLocal, type Objeto } from '../types/index.ts';

type EntradaCatalogo = {
  id: string; titulo: string; descripcion: string | null; categoria: string;
  color: string | null; imagen_url: string | null; tipo_imagen: string | null;
  lugar_hallazgo: string | null; fecha_hallazgo: string | null;
  punto_entrega: string | null; estado: string;
};

// Only bridge available gallery fixtures. Other mock states remain read-only until
// the server provides their real recovery history and publisher identity.
export function incorporarCatalogo(estado: EstadoLocal, catalogo: readonly EntradaCatalogo[]): boolean {
  let cambio = false;
  for (const item of catalogo) {
    if (item.estado !== 'disponible' || estado.objetos.some(o => o.id === item.id)) continue;
    if (!categorias.some(c => c === item.categoria)) continue;
    const fecha = fechaValida(item.fecha_hallazgo) && item.fecha_hallazgo <= fechaHoy() ? item.fecha_hallazgo : fechaHoy();
    const o: Objeto = {
      id: item.id, publicador_id: 'diego', titulo: item.titulo,
      categoria: item.categoria as Objeto['categoria'], descripcion: item.descripcion || 'Sin descripción',
      color: item.color, fecha_hallazgo: fecha, lugar_hallazgo: item.lugar_hallazgo || 'No indicado',
      imagen_url: item.imagen_url, tipo_imagen: item.tipo_imagen === 'referencia' ? 'referencia' : 'fotografia',
      modalidad_entrega: item.punto_entrega ? 'punto_entrega' : 'contacto', punto_entrega: item.punto_entrega,
      estado: 'disponible', creado_en: new Date().toISOString(),
    };
    estado.objetos.push(o);
    estado.privados[o.id] = { contacto: o.modalidad_entrega === 'contacto' ? 'diego.demo@espol.edu.ec' : null, caracteristica_reservada: null };
    cambio = true;
  }
  return cambio;
}
