import * as SQLite from 'expo-sqlite';
import { crearAlmacenSQLite } from './snapshot';
export const almacen = crearAlmacenSQLite(() => SQLite.openDatabaseAsync('poli-reportes-v1.db'));
