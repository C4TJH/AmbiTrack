// Referencias globales
// auth, db, storage están disponibles

let map;

function initMap() {
    // Ubicación por defecto (ej. Ciudad de México) - Se puede ajustar o usar geolocalización
    const defaultPos = { lat: 19.4326, lng: -99.1332 };

    map = new google.maps.Map(document.getElementById("map"), {
        center: defaultPos,
        zoom: 12,
        styles: [
            {
                "featureType": "poi",
                "stylers": [{ "visibility": "off" }]
            }
        ]
    });

    // Intentar centrar en ubicación del usuario
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                map.setCenter(pos);
                new google.maps.Marker({
                    position: pos,
                    map: map,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 7,
                        fillColor: "#4285F4",
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "white",
                    },
                    title: "Tu ubicación"
                });
            },
            () => {
                console.log("No se pudo obtener ubicación para centrar el mapa.");
            }
        );
    }

    loadReports();
}

function loadReports() {
    db.collection("reportes").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.location) {
                addMarker(data);
            }
        });
    }).catch((error) => {
        console.error("Error al cargar reportes:", error);
    });
}

function addMarker(report) {
    const marker = new google.maps.Marker({
        position: report.location,
        map: map,
        title: report.titulo
    });

    const contentString = `
        <div class="info-window">
            <h3>${report.titulo}</h3>
            <p><strong>Categoría:</strong> ${report.categoria}</p>
            <p>${report.descripcion}</p>
            ${report.photoUrl ? `<img src="${report.photoUrl}" alt="Foto" style="max-width:150px; border-radius:5px;">` : ''}
            <p><small>${new Date(report.timestamp?.toDate()).toLocaleDateString()}</small></p>
        </div>
    `;

    const infoWindow = new google.maps.InfoWindow({
        content: contentString
    });

    marker.addListener("click", () => {
        infoWindow.open(map, marker);
    });
}

// Auth check removed - Map is publicly accessible
// Users can view the map without logging in
auth.onAuthStateChanged(user => {
    // Map is accessible to everyone, no redirect needed
    console.log(user ? "Usuario autenticado" : "Usuario no autenticado");
});
