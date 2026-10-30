import { useCallback, useEffect, useState } from 'react';

export interface EstadoRecurso<T> {
  datos: T | null;
  cargando: boolean;
  error: string | null;
  recargar: () => void;
}

interface Resultado<T> {
  origen: (() => Promise<T>) | null;
  intento: number;
  datos: T | null;
  error: string | null;
}

/**
 * Ejecuta una carga asíncrona y expone sus estados. `cargar` debe ser estable
 * (useCallback) y cambiar solo cuando cambian sus parámetros.
 * Conserva los datos previos mientras se recarga para evitar parpadeos.
 */
export function useRecurso<T>(cargar: () => Promise<T>): EstadoRecurso<T> {
  const [intento, setIntento] = useState(0);
  const [resultado, setResultado] = useState<Resultado<T>>({
    origen: null,
    intento: -1,
    datos: null,
    error: null,
  });

  useEffect(() => {
    let vigente = true;
    cargar()
      .then((datos) => {
        if (vigente) setResultado({ origen: cargar, intento, datos, error: null });
      })
      .catch((causa: unknown) => {
        if (!vigente) return;
        const error = causa instanceof Error ? causa.message : 'Error desconocido';
        setResultado((previo) => ({ origen: cargar, intento, datos: previo.datos, error }));
      });
    return () => {
      vigente = false;
    };
  }, [cargar, intento]);

  const recargar = useCallback(() => setIntento((valor) => valor + 1), []);
  const cargando = resultado.origen !== cargar || resultado.intento !== intento;

  return {
    datos: resultado.datos,
    cargando,
    error: cargando ? null : resultado.error,
    recargar,
  };
}
