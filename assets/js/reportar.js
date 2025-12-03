// Referencia a los servicios globales de Firebase (ya inicializados en firebase-config.js)
// auth, db, storage están disponibles globalmente

const reportForm = document.getElementById('reportForm');
const statusMsg = document.getElementById('statusMsg');

// Verificar autenticación al cargar
auth.onAuthStateChanged(user => {
    if (!user) {
        window.location.href = "login.html?redirect=reportar.html";
    } else {
        document.getElementById("userInfo").innerText = "Reportando como: " + (user.displayName || user.email);
    }
});

document.getElementById("logoutBtn").onclick = () => {
    auth.signOut().then(() => window.location.href = "index.html");
};

// Manejo del formulario
reportForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const user = auth.currentUser;
    if (!user) {
        alert("Debes iniciar sesión para reportar.");
        return;
    }

    // Obtener valores
    const titulo = document.getElementById('titulo').value;
    const categoria = document.getElementById('categoria').value;
    const descripcion = document.getElementById('descripcion').value;
    const fotoFile = document.getElementById('foto').files[0];

    if (!titulo || !categoria || !descripcion || !fotoFile) {
        alert("Por favor completa todos los campos e incluye una foto.");
        return;
    }

    statusMsg.innerText = "Obteniendo ubicación...";
    
    try {
        const location = await getUserLocation();
        
        statusMsg.innerText = "Subiendo foto...";
        const photoUrl = await uploadPhoto(fotoFile, user.uid);

        statusMsg.innerText = "Guardando reporte...";
        await saveReportToFirestore({
            uid: user.uid,
            authorName: user.displayName || user.email,
            titulo,
            categoria,
            descripcion,
            photoUrl,
            location, // { lat, lng }
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'pendiente' // Estado inicial
        });

        alert("Reporte enviado con éxito!");
        window.location.href = "ver_reportes.html"; // O index, según prefieras

    } catch (error) {
        console.error("Error al reportar:", error);
        statusMsg.innerText = "Error: " + error.message;
    }
});

function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocalización no soportada por el navegador."));
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    reject(new Error("No se pudo obtener la ubicación. Asegúrate de permitir el acceso GPS."));
                }
            );
        }
    });
}

async function uploadPhoto(file, uid) {
    // Crear referencia: reportes/UID/TIMESTAMP_nombrearchivo
    const storageRef = storage.ref();
    const fileName = `${Date.now()}_${file.name}`;
    const fileRef = storageRef.child(`reportes/${uid}/${fileName}`);
    
    const snapshot = await fileRef.put(file);
    return await snapshot.ref.getDownloadURL();
}

async function saveReportToFirestore(data) {
    return db.collection('reportes').add(data);
}
