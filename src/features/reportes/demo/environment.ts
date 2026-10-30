import { crearServicioLocal } from '../services/local';
import { almacen } from '../storage/sqlite';
import { estadoDemo, usuariosDemo } from './data';
import objetosDemo from '@/data/mock/objetos.json';
import { incorporarCatalogo } from './catalogo';
// Demo identity lives here; production injects a service backed by the real session.
export const servicioDemo = crearServicioLocal(almacen, { usuarios: usuariosDemo, inicial: estadoDemo, migrar: estado => incorporarCatalogo(estado, objetosDemo) });
