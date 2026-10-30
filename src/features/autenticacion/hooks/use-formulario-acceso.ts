import { useState } from 'react';

type Errores<T> = Partial<Record<keyof T, string | null>>;

/**
 * Estado de un formulario de acceso. Los errores de un campo se muestran después de que
 * el usuario lo abandona o intenta enviar el formulario, no mientras escribe por primera vez.
 */
export function useFormularioAcceso<T extends Record<string, string>>(
  inicial: T,
  validar: (valores: T) => Errores<T>
) {
  const [valores, setValores] = useState(inicial);
  const [tocados, setTocados] = useState<Partial<Record<keyof T, boolean>>>({});
  const [enviado, setEnviado] = useState(false);

  const errores = validar(valores);
  const erroresVisibles: Errores<T> = {};
  for (const campo of Object.keys(valores) as (keyof T)[]) {
    if (enviado || tocados[campo]) erroresVisibles[campo] = errores[campo] ?? null;
  }

  const cambiar = (campo: keyof T) => (texto: string) =>
    setValores((actuales) => ({ ...actuales, [campo]: texto }));

  const tocar = (campo: keyof T) => () => setTocados((actuales) => ({ ...actuales, [campo]: true }));

  /** Marca el formulario como enviado y devuelve el primer campo con error, o `null`. */
  const intentarEnviar = (): keyof T | null => {
    setEnviado(true);
    return (Object.keys(valores) as (keyof T)[]).find((campo) => errores[campo]) ?? null;
  };

  return { valores, errores: erroresVisibles, cambiar, tocar, intentarEnviar };
}
