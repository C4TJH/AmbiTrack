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
        loadUserReports(user.uid);
    }
});

document.getElementById("logoutBtn").onclick = () => {
    auth.signOut().then(() => window.location.href = "index.html");
};

// Función para borrar reporte
window.deleteReport = function (reportId) {
    if (!confirm("¿Estás seguro de que deseas cancelar este reporte? Esta acción no se puede deshacer.")) {
        return;
    }

    db.collection('reportes').doc(reportId).delete()
        .then(() => {
            alert("Reporte cancelado exitosamente.");
        })
        .catch((error) => {
            console.error("Error cancelando reporte:", error);
            alert("Error al cancelar el reporte: " + error.message);
        });
};

// Modal Logic
const modal = document.getElementById("reportModal");
const span = document.getElementsByClassName("close-modal")[0];

// Necesitamos buscar el reporte en el array local o volver a pedirlo, 
// pero como ya tenemos los datos en el snapshot, podríamos pasarlos directamente.
// Sin embargo, pasar el objeto entero en el HTML onclick es complicado.
// Mejor guardamos los reportes en una variable global temporal o los buscamos por ID.
let currentReportsMap = {}; // Mapa ID -> Reporte

function loadUserReports(uid) {
    const reportsSection = document.getElementById('myReportsSection');
    const reportsList = document.getElementById('myReportsList');

    reportsSection.style.display = 'block';

    db.collection('reportes')
        .where('uid', '==', uid)
        .onSnapshot((snapshot) => {
            if (snapshot.empty) {
                reportsList.innerHTML = '<p>No has realizado reportes aún.</p>';
                return;
            }

            reportsList.innerHTML = '';
            currentReportsMap = {}; // Limpiar mapa

            const reports = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                data.id = doc.id;
                reports.push(data);
                currentReportsMap[doc.id] = data;
            });

            reports.sort((a, b) => {
                const dateA = a.timestamp ? a.timestamp.toDate() : new Date(0);
                const dateB = b.timestamp ? b.timestamp.toDate() : new Date(0);
                return dateB - dateA;
            });

            reports.forEach(report => {
                const statusClass = `status-${report.status || 'pendiente'}`;
                const dateStr = report.timestamp ? new Date(report.timestamp.toDate()).toLocaleDateString() : 'Fecha pendiente';
                const isPending = (report.status || 'pendiente') === 'pendiente';

                const card = document.createElement('div');
                card.className = `my-report-card ${report.status || 'pendiente'}`;
                card.innerHTML = `
                    <div class="report-info">
                        <h3>${report.titulo}</h3>
                        <p>${dateStr} - ${report.categoria}</p>
                    </div>
                    <div class="report-actions">
                         <button class="btn-icon btn-view" title="Ver detalle" onclick="openReportModal('${report.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${isPending ? `
                        <button class="btn-icon btn-cancel" title="Cancelar reporte" onclick="deleteReport('${report.id}')">
                            <i class="fas fa-trash-alt"></i>
                        </button>` : ''}
                    </div>
                    <div class="report-status ${statusClass}">
                        ${report.status || 'PENDIENTE'}
                    </div>
                `;
                reportsList.appendChild(card);
            });
        }, (error) => {
            console.error("Error cargando mis reportes:", error);
            reportsList.innerHTML = '<p>Error al cargar tus reportes. Verifica la consola.</p>';
        });
}

window.openReportModal = function (reportId) {
    const report = currentReportsMap[reportId];
    if (!report) return;

    document.getElementById("modalTitle").innerText = report.titulo;
    document.getElementById("modalCategory").innerText = report.categoria;
    document.getElementById("modalStatus").innerText = report.status || 'pendiente';
    document.getElementById("modalStatus").className = `report-status status-${report.status || 'pendiente'}`;
    document.getElementById("modalDate").innerText = report.timestamp ? new Date(report.timestamp.toDate()).toLocaleString() : 'Fecha pendiente';
    document.getElementById("modalDescription").innerText = report.descripcion;

    const img = document.getElementById("modalImage");
    if (report.photoUrl) {
        img.src = report.photoUrl;
        img.style.display = "block";
    } else {
        img.style.display = "none";
    }

    modal.style.display = "block";
};

span.onclick = function () {
    modal.style.display = "none";
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

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
        // Limpiar formulario o redirigir
        reportForm.reset();
        statusMsg.innerText = "";
        // window.location.href = "ver_reportes.html"; 

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
