import { fechaHoy } from '../domain/index.ts';
import type { Usuario, EstadoLocal } from '../types/index.ts';
export const usuariosDemo: Usuario[] = [
  { id: 'ana', nombre: 'Ana Torres', correo: 'ana.demo@espol.edu.ec' },
  { id: 'diego', nombre: 'Diego Vera', correo: 'diego.demo@espol.edu.ec' },
];
export function estadoDemo(): EstadoLocal {
  const creado_en = new Date().toISOString();
  return { version: 1, usuario_id: 'ana', objetos: [
    { id: 'demo-termo', publicador_id: 'ana', titulo: 'Termo azul encontrado', categoria: 'botellas_termos', descripcion: 'Termo azul de acero encontrado en una mesa.', color: 'Azul', fecha_hallazgo: fechaHoy(), lugar_hallazgo: 'Biblioteca central', imagen_url: null, tipo_imagen: 'fotografia', modalidad_entrega: 'punto_entrega', punto_entrega: 'Recepción de biblioteca', estado: 'disponible', creado_en },
    { id: 'demo-llaves', publicador_id: 'diego', titulo: 'Llaves con llavero', categoria: 'llaves', descripcion: 'Tres llaves con llavero negro.', color: 'Negro', fecha_hallazgo: fechaHoy(), lugar_hallazgo: 'Parqueadero FIEC', imagen_url: null, tipo_imagen: 'fotografia', modalidad_entrega: 'contacto', punto_entrega: null, estado: 'disponible', creado_en },
  ], privados: { 'demo-termo': { contacto: null, caracteristica_reservada: 'Iniciales AT en la base' }, 'demo-llaves': { contacto: 'diego.demo@espol.edu.ec', caracteristica_reservada: 'Llavero de tortuga' } }, busquedas: [], reclamaciones: [] };
}
