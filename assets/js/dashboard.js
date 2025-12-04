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

    // Event Listener para Exportar Excel
    document.getElementById('btnExportExcel').addEventListener('click', exportToExcel);
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
                <button class="action-btn btn-view" onclick="viewReport('${report.id}')" title="Ver Detalle"><i class="fas fa-eye"></i></button>
                <button class="action-btn btn-pdf" onclick="exportToPDF('${report.id}')" title="Exportar PDF" style="background-color: #e74c3c;"><i class="fas fa-file-pdf"></i></button>
                ${status !== 'aprobado' ? `<button class="action-btn btn-approve" onclick="updateStatus('${report.id}', 'aprobado')" title="Aprobar"><i class="fas fa-check"></i></button>` : ''}
                ${status !== 'rechazado' ? `<button class="action-btn btn-reject" onclick="updateStatus('${report.id}', 'rechazado')" title="Rechazar"><i class="fas fa-times"></i></button>` : ''}
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

// --- FUNCIONES DE EXPORTACIÓN ---

// Exportar a Excel
function exportToExcel() {
    if (currentReports.length === 0) {
        alert("No hay reportes para exportar.");
        return;
    }

    // Preparar datos para Excel
    const dataToExport = currentReports.map(report => ({
        Fecha: report.timestamp ? new Date(report.timestamp.toDate()).toLocaleDateString() : 'N/A',
        Título: report.titulo || 'Sin título',
        Categoría: report.categoria || 'General',
        Descripción: report.descripcion || '',
        Autor: report.authorName || 'Anónimo',
        EmailAutor: report.authorEmail || 'N/A',
        Estado: report.status || 'pendiente',
        Ubicación: report.location ? `${report.location.lat}, ${report.location.lng}` : 'N/A'
    }));

    // Crear hoja de trabajo
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reportes");

    // Guardar archivo
    XLSX.writeFile(wb, "Reportes_AmbiTrack.xlsx");
}

// Exportar a PDF (Individual)
window.exportToPDF = function (id) {
    const report = currentReports.find(r => r.id === id);
    if (!report) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Configuración de fuentes y colores
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(44, 62, 80); // Color oscuro
    doc.text("Reporte de Incidente - AmbiTrack", 20, 20);

    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    let yPos = 40;

    // Función auxiliar para agregar líneas
    const addLine = (label, value) => {
        doc.setFont("helvetica", "bold");
        doc.text(`${label}:`, 20, yPos);
        doc.setFont("helvetica", "normal");

        // Manejo de texto largo para descripción
        if (label === "Descripción") {
            const splitText = doc.splitTextToSize(value, 120);
            doc.text(splitText, 60, yPos);
            yPos += (splitText.length * 7);
        } else {
            doc.text(String(value), 60, yPos);
            yPos += 10;
        }
    };

    const date = report.timestamp ? new Date(report.timestamp.toDate()).toLocaleString() : 'N/A';

    addLine("ID Reporte", report.id);
    addLine("Fecha", date);
    addLine("Título", report.titulo || 'Sin título');
    addLine("Categoría", report.categoria || 'General');
    addLine("Estado", report.status || 'pendiente');
    addLine("Autor", report.authorName || 'Anónimo');
    addLine("Email", report.authorEmail || 'N/A');
    addLine("Descripción", report.descripcion || 'Sin descripción');

    if (report.location) {
        addLine("Ubicación", `${report.location.lat}, ${report.location.lng}`);
    }

    // Pie de página
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Generado automáticamente por AmbiTrack System", 20, 280);

    // Guardar PDF
    doc.save(`Reporte_${report.id}.pdf`);
};
