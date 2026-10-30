import { useEffect, useRef, useState } from 'react';
import { crearDocumentoMapa } from './documento';
import { leerMensajeMapa } from './domain';
import type { PropsMapa } from './types';

export default function Mapa({ inicial, actual, alSeleccionar, alEstado }: PropsMapa) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [html] = useState(() => crearDocumentoMapa(inicial));
  useEffect(() => {
    function recibir(evento: MessageEvent) {
      if (evento.source !== ref.current?.contentWindow) return;
      const mensaje = leerMensajeMapa(evento.data);
      if (!mensaje) return;
      if (mensaje.tipo === 'seleccion') alSeleccionar(mensaje.coordenadas); else alEstado(mensaje.tipo);
    }
    window.addEventListener('message', recibir);
    return () => window.removeEventListener('message', recibir);
  }, [alSeleccionar, alEstado]);
  useEffect(() => {
    if (actual) ref.current?.contentWindow?.postMessage({ canal: 'findyp-mapa-v1', tipo: 'centrar', coordenadas: actual }, '*');
  }, [actual]);
  // allow-same-origin da al documento el origen de la app; sin él las teselas de
  // OpenStreetMap se piden sin Referer y el servidor responde 403 "Access blocked".
  return <iframe
    ref={ref} title="Mapa interactivo de ESPOL" srcDoc={html} sandbox="allow-scripts allow-same-origin allow-popups"
    style={{ flex: 1, width: '100%', minHeight: 120, border: 0, background: '#E8EAF6' }}
    onError={() => alEstado('error')}
    onLoad={() => { if (actual) ref.current?.contentWindow?.postMessage({ canal: 'findyp-mapa-v1', tipo: 'centrar', coordenadas: actual }, '*'); }}
  />;
}
