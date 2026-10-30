import coincidenciasJson from '@/data/mock/coincidencias.json';
import objetosJson from '@/data/mock/objetos.json';
import type { CoincidenciaDetallada, FiltrosObjetos, ObjetoEncontrado } from '@/types/findyp';

import type { DataProvider } from './data-provider';
import { filtrarObjetos } from './filtrar-objetos';
import { normalizarNivel, normalizarObjeto } from './normalizar';
import { resolverFuenteImagen } from '@/data/mock/imagenes';
import { servicioDemo } from '@/features/reportes/demo/environment';

/** La galería de demostración solo muestra objetos cuya imagen se puede visualizar. */
function tieneImagenVisible(objeto: ObjetoEncontrado): boolean {
  return objeto.imagen_url !== null && resolverFuenteImagen(objeto.imagen_url) !== null;
}

/** Latencia simulada para poder visualizar los estados de carga. */
const LATENCIA_MS = 300;

function esperar<T>(valor: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(valor), LATENCIA_MS));
}

/** Proveedor de datos ficticios almacenados en `src/data/mock`. */
export class MockDataProvider implements DataProvider {
  private readonly objetos: ObjetoEncontrado[] = objetosJson.map(normalizarObjeto);

  async listarObjetos(filtros?: FiltrosObjetos): Promise<ObjetoEncontrado[]> {
    const locales = await servicioDemo.listarTodosObjetosPublicos();
    const idsLocales = new Set(locales.map(o => o.id));
    const todos = [...locales, ...this.objetos.filter(o => !idsLocales.has(o.id))];
    return esperar(filtrarObjetos(todos.filter(tieneImagenVisible), filtros));
  }

  async obtenerObjeto(id: string): Promise<ObjetoEncontrado | null> {
    const locales = await servicioDemo.listarTodosObjetosPublicos();
    return esperar(locales.find(o => o.id === id) ?? this.objetos.find((objeto) => objeto.id === id) ?? null);
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
