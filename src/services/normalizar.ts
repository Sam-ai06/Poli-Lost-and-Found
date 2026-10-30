import {
  CATEGORIAS,
  ESTADOS_OBJETO,
  NIVELES_SIMILITUD,
  TIPOS_IMAGEN,
  type ObjetoEncontrado,
} from '@/types/findyp';

/**
 * Adaptadores entre los datos crudos de una fuente (JSON, Supabase) y los modelos de
 * dominio. Si el contrato definitivo renombra campos, se ajustan aquí.
 */

type Registro = Record<string, unknown>;

function esUno<T extends string>(valores: readonly T[], valor: unknown): valor is T {
  return typeof valor === 'string' && (valores as readonly string[]).includes(valor);
}

function textoONulo(valor: unknown): string | null {
  return typeof valor === 'string' && valor.trim() !== '' ? valor : null;
}

export function normalizarObjeto(fila: Registro): ObjetoEncontrado {
  return {
    id: String(fila.id),
    titulo: textoONulo(fila.titulo) ?? 'Objeto sin título',
    descripcion: textoONulo(fila.descripcion),
    categoria: esUno(CATEGORIAS, fila.categoria) ? fila.categoria : 'otros',
    color: textoONulo(fila.color),
    imagen_url: textoONulo(fila.imagen_url),
    tipo_imagen: esUno(TIPOS_IMAGEN, fila.tipo_imagen) ? fila.tipo_imagen : null,
    lugar_hallazgo: textoONulo(fila.lugar_hallazgo),
    fecha_hallazgo: textoONulo(fila.fecha_hallazgo),
    punto_entrega: textoONulo(fila.punto_entrega),
    estado: esUno(ESTADOS_OBJETO, fila.estado) ? fila.estado : 'disponible',
  };
}

export function normalizarNivel(valor: unknown) {
  return esUno(NIVELES_SIMILITUD, valor) ? valor : null;
}
