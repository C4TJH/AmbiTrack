// Configuración de Admins
const ADMIN_EMAILS = ["catjmartinez2002@gmail.com"];

// Referencias DOM
const statsTotal = document.getElementById('statTotal');
const statsPending = document.getElementById('statPending');
const statsApproved = document.getElementById('statApproved');
const statsRejected = document.getElementById('statRejected');
const tableBody = document.getElementById('reportsTableBody');
const adminEmailSpan = document.getElementById('adminEmail');

// Modal DOM
const modal = document.getElementById('reportModal');
const modalTitle = document.getElementById('modalTitle');
const modalCategory = document.getElementById('modalCategory');
const modalDesc = document.getElementById('modalDesc');
const modalAuthor = document.getElementById('modalAuthor');
const modalDate = document.getElementById('modalDate');
const modalImage = document.getElementById('modalImage');

let currentReports = [];
let map;
let marker;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
});

// Verificar Autenticación y Permisos
function checkAdminAuth() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            if (ADMIN_EMAILS.includes(user.email)) {
                adminEmailSpan.textContent = user.email;
                loadDashboardData();
            } else {
                alert("Acceso denegado. No tienes permisos de administrador.");
                window.location.href = 'index.html';
            }
        } else {
            window.location.href = 'login.html';
        }
    });
}

// Cargar datos
function loadDashboardData() {
    db.collection('reportes')
        .orderBy('timestamp', 'desc')
        .onSnapshot((snapshot) => {
            currentReports = [];
            snapshot.forEach(doc => {
                currentReports.push({ id: doc.id, ...doc.data() });
            });
            updateStats();
            renderTable();
        }, (error) => {
            console.error("Error cargando reportes:", error);
        });
}

// Actualizar Estadísticas
function updateStats() {
    const total = currentReports.length;
    const pending = currentReports.filter(r => !r.status || r.status === 'pendiente').length;
    const approved = currentReports.filter(r => r.status === 'aprobado').length;
    const rejected = currentReports.filter(r => r.status === 'rechazado').length;

    statsTotal.textContent = total;
    statsPending.textContent = pending;
    statsApproved.textContent = approved;
    statsRejected.textContent = rejected;

    updateChart(currentReports);
}

// Chart Instance
let reportsChart = null;

function updateChart(reports) {
    const ctx = document.getElementById('reportsChart').getContext('2d');

    // Count by Category
    const categories = {};
    reports.forEach(r => {
        const cat = r.categoria || 'Otros';
        categories[cat] = (categories[cat] || 0) + 1;
    });

    const labels = Object.keys(categories);
    const data = Object.values(categories);

    if (reportsChart) {
        reportsChart.destroy();
    }

    reportsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Reportes por Categoría',
                data: data,
                backgroundColor: [
                    '#2ecc71',
                    '#3498db',
                    '#e74c3c',
                    '#f1c40f',
                    '#9b59b6',
                    '#e67e22'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'Distribución de Reportes'
                }
            }
        }
    });
}

// Renderizar Tabla
function renderTable() {
    tableBody.innerHTML = '';

    currentReports.forEach(report => {
        const tr = document.createElement('tr');
        const status = report.status || 'pendiente';
        const date = report.timestamp ? new Date(report.timestamp.toDate()).toLocaleDateString() : 'N/A';

        tr.innerHTML = `
            <td>${date}</td>
            <td>${report.titulo || 'Sin título'}</td>
            <td>${report.categoria || 'General'}</td>
            <td>${report.authorName || 'Anónimo'}</td>
            <td><span class="status-badge ${status}">${status}</span></td>
            <td>
                <button class="action-btn btn-view" onclick="viewReport('${report.id}')">Ver</button>
                ${status !== 'aprobado' ? `<button class="action-btn btn-approve" onclick="updateStatus('${report.id}', 'aprobado')">Aprobar</button>` : ''}
                ${status !== 'rechazado' ? `<button class="action-btn btn-reject" onclick="updateStatus('${report.id}', 'rechazado')">Rechazar</button>` : ''}
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// Actualizar Estado
window.updateStatus = function (id, newStatus) {
    if (confirm(`¿Estás seguro de cambiar el estado a ${newStatus}?`)) {
        db.collection('reportes').doc(id).update({
            status: newStatus
        }).then(() => {
            console.log("Estado actualizado");
        }).catch((error) => {
            console.error("Error actualizando estado:", error);
            alert("Error al actualizar el estado");
        });
    }
};

// Ver Detalle (Modal)
window.viewReport = function (id) {
    const report = currentReports.find(r => r.id === id);
    if (!report) return;

    // Llenar datos
    modalTitle.textContent = report.titulo;
    modalCategory.textContent = report.categoria;
    modalDesc.textContent = report.descripcion;
    modalAuthor.textContent = report.authorName || 'Anónimo';
    modalDate.textContent = report.timestamp ? new Date(report.timestamp.toDate()).toLocaleString() : 'Fecha desconocida';

    if (report.photoUrl) {
        modalImage.src = report.photoUrl;
        modalImage.style.display = 'block';
    } else {
        modalImage.style.display = 'none';
    }

    // Mostrar Modal
    modal.classList.add('active');

    // Inicializar Mapa
    initModalMap(report.location);
};

window.closeModal = function () {
    modal.classList.remove('active');
};

// Cerrar al hacer clic fuera
window.onclick = function (event) {
    if (event.target == modal) {
        closeModal();
    }
}

function initModalMap(location) {
    // Si no hay ubicación, usar default
    const pos = location || { lat: 19.4326, lng: -99.1332 };

    if (!map) {
        map = new google.maps.Map(document.getElementById("modalMap"), {
            center: pos,
            zoom: 15,
        });
    } else {
        map.setCenter(pos);
        map.setZoom(15);
    }

    if (marker) marker.setMap(null);

    if (location) {
        marker = new google.maps.Marker({
            position: pos,
            map: map,
            title: "Ubicación del Reporte"
        });
    }
}
