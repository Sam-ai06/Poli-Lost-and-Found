/* Mapa de Danna, adaptado para compartir la selección con Expo y la página original. */
(function () {
  'use strict';
  var configuracion = window.FINDYP_MAP_CONFIG || {};
  var canal = 'findyp-mapa-v1';
  var espol = [-2.1455, -79.9660];
  var map = L.map('map').setView(espol, 16);
  var marcadorSeleccionado = null;
  var marcadorUsuario = null;
  var circuloPrecision = null;
  var texto = document.getElementById('ubicacionSeleccionada');
  var falloTiles = false;

  function validar(punto) {
    return punto && typeof punto.latitud === 'number' && typeof punto.longitud === 'number' &&
      Number.isFinite(punto.latitud) && Number.isFinite(punto.longitud) &&
      Math.abs(punto.latitud) <= 90 && Math.abs(punto.longitud) <= 180;
  }
  function emitir(tipo, coordenadas) {
    var mensaje = { canal: canal, tipo: tipo };
    if (coordenadas) mensaje.coordenadas = coordenadas;
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(mensaje));
    else if (window.parent !== window) window.parent.postMessage(mensaje, '*');
  }
  function seleccionar(punto, notificar) {
    if (!validar(punto)) return;
    var posicion = [punto.latitud, punto.longitud];
    if (marcadorSeleccionado) marcadorSeleccionado.setLatLng(posicion);
    else {
      marcadorSeleccionado = L.marker(posicion, {
        draggable: true,
        icon: L.divIcon({ className: 'findyp-marker', html: '<span class="findyp-pin"></span>', iconSize: [28, 36], iconAnchor: [14, 34] })
      }).addTo(map);
      marcadorSeleccionado.on('dragend', function () {
        var puntoMovido = marcadorSeleccionado.getLatLng();
        seleccionar({ latitud: puntoMovido.lat, longitud: puntoMovido.lng }, true);
      });
    }
    marcadorSeleccionado.bindPopup('Lugar donde se perdió el objeto');
    var latitud = document.getElementById('latitud');
    var longitud = document.getElementById('longitud');
    if (latitud) latitud.value = String(punto.latitud);
    if (longitud) longitud.value = String(punto.longitud);
    if (texto) texto.textContent = 'Ubicación seleccionada: ' + punto.latitud.toFixed(6) + ', ' + punto.longitud.toFixed(6);
    if (notificar) emitir('seleccion', { latitud: punto.latitud, longitud: punto.longitud });
  }
  function centrarUbicacion(punto) {
    if (!validar(punto)) return;
    var posicion = [punto.latitud, punto.longitud];
    map.setView(posicion, 17);
    if (marcadorUsuario) map.removeLayer(marcadorUsuario);
    if (circuloPrecision) map.removeLayer(circuloPrecision);
    marcadorUsuario = L.circleMarker(posicion, { radius: 8, color: '#2563EB', fillColor: '#3B82F6', fillOpacity: 1 }).addTo(map).bindPopup('Tu ubicación actual');
    if (Number.isFinite(punto.precision) && punto.precision > 0) circuloPrecision = L.circle(posicion, { radius: punto.precision, color: '#2563EB', fillOpacity: 0.1 }).addTo(map);
    // Centering the GPS must never overwrite where the object was lost.
  }
  map.on('click', function (evento) { seleccionar({ latitud: evento.latlng.lat, longitud: evento.latlng.lng }, true); });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).on('tileerror', function () { falloTiles = true; emitir('error_tiles'); }).on('tileload', function () { if (!falloTiles) emitir('tiles_listos'); }).addTo(map);
  L.circleMarker(espol, { radius: 5, color: '#64748B' }).addTo(map).bindPopup('ESPOL · Campus Gustavo Galindo');
  if (validar(configuracion.seleccion)) {
    seleccionar(configuracion.seleccion, false);
    map.setView([configuracion.seleccion.latitud, configuracion.seleccion.longitud], 17);
  }
  window.mapaEspol = { centrarUbicacion: centrarUbicacion };
  window.addEventListener('message', function (evento) {
    if (evento.source !== window.parent) return;
    var mensaje = evento.data;
    if (mensaje && mensaje.canal === canal && mensaje.tipo === 'centrar') centrarUbicacion(mensaje.coordenadas);
  });
  var boton = document.getElementById('btnUbicacion');
  if (boton) boton.addEventListener('click', function () {
    if (!navigator.geolocation) { texto.textContent = 'Este navegador no permite obtener tu ubicación. Puedes seleccionar un punto manualmente.'; return; }
    boton.disabled = true;
    navigator.geolocation.getCurrentPosition(function (posicion) {
      boton.disabled = false;
      centrarUbicacion({ latitud: posicion.coords.latitude, longitud: posicion.coords.longitude, precision: posicion.coords.accuracy });
      texto.textContent = 'Mapa centrado en tu ubicación actual. Toca dónde perdiste el objeto.';
    }, function () {
      boton.disabled = false;
      texto.textContent = 'No se pudo obtener tu ubicación. Puedes elegir el punto directamente en el mapa.';
    }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 0 });
  });
  emitir('listo');
}());
