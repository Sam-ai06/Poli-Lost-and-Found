import { useCallback, useRef, useState } from 'react';
export function mensajeError(e: unknown) { return e instanceof Error ? e.message : 'No se pudo completar la operación. Inténtalo otra vez.'; }
export function useOperacion() {
  const bloqueo = useRef(false);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState('');
  const ejecutar = useCallback(async (fn: () => Promise<void>) => {
    if (bloqueo.current) return;
    bloqueo.current = true; setOcupado(true); setError('');
    try { await fn(); } catch (e) { setError(mensajeError(e)); }
    finally { bloqueo.current = false; setOcupado(false); }
  }, []);
  return { ocupado, error, setError, ejecutar };
}
