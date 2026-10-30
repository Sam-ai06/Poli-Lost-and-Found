import coincidenciasJson from '@/data/mock/coincidencias.json';
import objetosJson from '@/data/mock/objetos.json';
import type { CoincidenciaDetallada, FiltrosObjetos, ObjetoEncontrado } from '@/types/findyp';

import type { DataProvider } from './data-provider';
import { filtrarObjetos } from './filtrar-objetos';
import { normalizarNivel, normalizarObjeto } from './normalizar';

/** Latencia simulada para poder visualizar los estados de carga. */
const LATENCIA_MS = 300;

function esperar<T>(valor: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(valor), LATENCIA_MS));
}

/** Proveedor de datos ficticios almacenados en `src/data/mock`. */
export class MockDataProvider implements DataProvider {
  private readonly objetos: ObjetoEncontrado[] = objetosJson.map(normalizarObjeto);

  listarObjetos(filtros?: FiltrosObjetos): Promise<ObjetoEncontrado[]> {
    return esperar(filtrarObjetos(this.objetos, filtros));
  }

  obtenerObjeto(id: string): Promise<ObjetoEncontrado | null> {
    return esperar(this.objetos.find((objeto) => objeto.id === id) ?? null);
  }

  obtenerCoincidencias(busquedaId: string): Promise<CoincidenciaDetallada[]> {
    const resultado = coincidenciasJson
      .filter((fila) => fila.busqueda_id === busquedaId)
      .flatMap((fila) => {
        const objeto = this.objetos.find((item) => item.id === fila.objeto_id);
        return objeto
          ? [
              {
                id: fila.id,
                busqueda_id: fila.busqueda_id,
                nivel_similitud: normalizarNivel(fila.nivel_similitud),
                objeto,
              },
            ]
          : [];
      });
    return esperar(resultado);
  }
}
