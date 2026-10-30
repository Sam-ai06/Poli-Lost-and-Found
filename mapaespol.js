

const espol = [-2.1455, -79.9660];


const map = L.map('map').setView(espol, 16);
let marcadorSeleccionado = null;

map.on("click", function(evento) {
    const latitud = evento.latlng.lat;
    const longitud = evento.latlng.lng;

    // Guardar las coordenadas
    document.getElementById("latitud").value = latitud;
    document.getElementById("longitud").value = longitud;

    // Mostrar las coordenadas
    document.getElementById("ubicacionSeleccionada").textContent =
        "Ubicación seleccionada: " +
        latitud.toFixed(6) + ", " +
        longitud.toFixed(6);

    // Colocar o mover el marcador
    if (marcadorSeleccionado) {
        marcadorSeleccionado.setLatLng(evento.latlng);
    } else {
        marcadorSeleccionado = L.marker(evento.latlng).addTo(map);
    }

    marcadorSeleccionado.bindPopup("Lugar donde se perdió el objeto").openPopup();
});


let marcadorUsuario = null;
let circuloPrecision = null;

function obtenerUbicacion() {

    // Comprobar disponibilidad de geolocalización
    if (!navigator.geolocation) {
        alert("Tu navegador no admite geolocalización.");
        return;
    }

    // Solicitar ubicación
    navigator.geolocation.getCurrentPosition(

        function(posicion) {

            // Obtener latitud y longitud
            const lat = posicion.coords.latitude;
            const lng = posicion.coords.longitude;
            const precision = posicion.coords.accuracy;

            const ubicacion = [lat, lng];

            // Centrar mapa
            map.setView(ubicacion, 18);

            // Eliminar marcador anterior
            if (marcadorUsuario) {
                map.removeLayer(marcadorUsuario);
            }

            if (circuloPrecision) {
                map.removeLayer(circuloPrecision);
            }

            // Crear marcador del usuario
            marcadorUsuario = L.marker(ubicacion)
                .addTo(map)
                .bindPopup("<b>Tu ubicación actual</b>")
                .openPopup();

            // Mostrar precisión
            circuloPrecision = L.circle(ubicacion, {
                radius: precision,
                color: "blue",
                fillOpacity: 0.15
            }).addTo(map);

            alert("¡Ubicación encontrada!");

            console.log("Latitud:", lat);
            console.log("Longitud:", lng);
            console.log("Precisión:", precision);

        },

        function(error) {

            if (error.code === 1) {
                alert("Debes permitir el acceso a tu ubicación.");
            } else if (error.code === 2) {
                alert("No se pudo determinar tu ubicación.");
            } else if (error.code === 3) {
                alert("Se agotó el tiempo de espera.");
            }

        },

        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }
    );
}

// Conectar el botón con la función
document.getElementById("btnUbicacion")
    .addEventListener("click", obtenerUbicacion);


L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution: '&copy; OpenStreetMap contributors'
    }
).addTo(map);

L.marker(espol)
    .addTo(map)
    .bindPopup(
        '<b>ESPOL</b><br>Campus Gustavo Galindo - Prosperina'
    )
    .openPopup();

