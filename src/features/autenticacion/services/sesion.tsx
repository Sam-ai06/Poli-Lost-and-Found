import type { Session } from '@supabase/supabase-js';
import { createContext, use, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { observarSesion } from './supabase-auth';

type EstadoSesion = 'cargando' | 'con_sesion' | 'sin_sesion';

interface ContextoSesion {
  estado: EstadoSesion;
  sesion: Session | null;
  /** El usuario eligió explorar sin cuenta durante esta ejecución de la app. */
  invitado: boolean;
  continuarComoInvitado: () => void;
}

const Contexto = createContext<ContextoSesion | null>(null);

export function SesionProvider({ children }: PropsWithChildren) {
  const [sesion, setSesion] = useState<Session | null | undefined>(undefined);
  const [invitado, setInvitado] = useState(false);

  useEffect(() => observarSesion(setSesion), []);

  const valor = useMemo<ContextoSesion>(
    () => ({
      estado: sesion === undefined ? 'cargando' : sesion && !sesion.user.is_anonymous ? 'con_sesion' : 'sin_sesion',
      sesion: sesion ?? null,
      invitado: invitado || !!sesion?.user.is_anonymous,
      continuarComoInvitado: () => setInvitado(true),
    }),
    [sesion, invitado]
  );

  return <Contexto value={valor}>{children}</Contexto>;
}

export function useSesion(): ContextoSesion {
  const contexto = use(Contexto);
  if (!contexto) throw new Error('useSesion debe usarse dentro de SesionProvider.');
  return contexto;
}
