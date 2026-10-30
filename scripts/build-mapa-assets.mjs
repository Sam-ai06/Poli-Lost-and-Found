import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

// Keep Leaflet and Danna's runtime local to the app, without a JS CDN at runtime.
const carpeta = new URL('../src/features/ubicacion/generated/', import.meta.url);
const leer = ruta => readFileSync(new URL(ruta, import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const paquete = {
  leaflet: leer('../leaflet/leaflet.js').replace(/\/\/# sourceMappingURL=.*$/gm, ''),
  css: leer('../leaflet/leaflet.css'),
  mapa: leer('../mapaespol.js'),
};
const archivo = new URL('mapa.json', carpeta);
const contenido = JSON.stringify(paquete);
if (process.argv.includes('--check')) {
  if (readFileSync(archivo, 'utf8').trimEnd() !== contenido) throw new Error('El mapa empaquetado está desactualizado. Ejecuta npm run build:mapa.');
  console.log('Mapa empaquetado coincide con las fuentes de Danna.');
} else {
  mkdirSync(carpeta, { recursive: true }); writeFileSync(archivo, contenido + '\n');
  console.log('Mapa Leaflet local actualizado.');
}
