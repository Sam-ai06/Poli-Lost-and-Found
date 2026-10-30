import { useEffect, useState } from 'react';

/** Devuelve `valor` después de `retrasoMs` sin cambios. */
export function useDebounce<T>(valor: T, retrasoMs = 250): T {
  const [diferido, setDiferido] = useState(valor);

  useEffect(() => {
    const temporizador = setTimeout(() => setDiferido(valor), retrasoMs);
    return () => clearTimeout(temporizador);
  }, [valor, retrasoMs]);

  return diferido;
}
