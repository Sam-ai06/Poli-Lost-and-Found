import { crearServicioLocal } from '../services/local';
import { almacen } from '../storage/sqlite';
import { estadoDemo, usuariosDemo } from './data';
// Demo identity lives here; production injects a service backed by the real session.
export const servicioDemo = crearServicioLocal(almacen, { usuarios: usuariosDemo, inicial: estadoDemo });
