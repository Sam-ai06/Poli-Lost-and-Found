import recursos from './generated/mapa.json';
import { normalizarCoordenadas } from './domain';
import type { CoordenadasMapa } from './types';

export function crearDocumentoMapa(inicial: CoordenadasMapa | null): string {
  const seleccion = normalizarCoordenadas(inicial);
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"><meta name="referrer" content="strict-origin-when-cross-origin"><style>${recursos.css}
    html,body,#map{height:100%;width:100%;margin:0;padding:0}body{background:#E8EAF6}#map{font-family:Arial,sans-serif}
    .findyp-pin{display:block;width:24px;height:24px;background:#4F46E5;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 1px 6px #475569}
    .leaflet-control-attribution{font-size:11px!important}
    </style></head><body><div id="map" aria-label="Mapa de ESPOL para seleccionar el lugar de pérdida"></div>
    <script>window.FINDYP_MAP_CONFIG=${JSON.stringify({ seleccion })};</script><script>${recursos.leaflet}</script><script>${recursos.mapa}</script></body></html>`;
}
