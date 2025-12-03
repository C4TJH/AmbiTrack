// Referencias globales
// db está disponible

const reportsGrid = document.getElementById('reportsGrid');
const filterSelect = document.getElementById('filterCategory');

let allReports = [];

// Cargar reportes al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadReports();
});

// Escuchar cambios en el filtro
filterSelect.addEventListener('change', () => {
    renderReports(filterSelect.value);
});

function loadReports() {
    db.collection('reportes')
        .orderBy('timestamp', 'desc')
        .get()
        .then((querySnapshot) => {
            allReports = [];
            querySnapshot.forEach((doc) => {
                allReports.push({ id: doc.id, ...doc.data() });
            });
            renderReports('todas');
        })
        .catch((error) => {
            console.error("Error cargando reportes:", error);
            reportsGrid.innerHTML = '<p class="error">Error al cargar reportes.</p>';
        });
}

function renderReports(category) {
    reportsGrid.innerHTML = '';

    const filtered = category === 'todas'
        ? allReports
        : allReports.filter(r => r.categoria === category);

    if (filtered.length === 0) {
        reportsGrid.innerHTML = '<p class="no-results">No hay reportes en esta categoría.</p>';
        return;
    }

    filtered.forEach(report => {
        const card = document.createElement('div');
        card.className = 'report-card';

        const date = report.timestamp ? new Date(report.timestamp.toDate()).toLocaleDateString() : 'Fecha desconocida';
        const imgUrl = report.photoUrl || 'assets/img/placeholder.png'; // Fallback si no hay foto

        card.innerHTML = `
            <div class="card-image" style="background-image: url('${imgUrl}')"></div>
            <div class="card-content">
                <span class="badge ${report.categoria}">${report.categoria}</span>
                <h3>${report.titulo}</h3>
                <p class="desc">${report.descripcion}</p>
                <div class="meta">
                    <span>📅 ${date}</span>
                    ${report.authorName ? `<span>👤 ${report.authorName}</span>` : ''}
                </div>
            </div>
        `;

        // Opcional: Click para ver detalle o mapa
        // card.onclick = () => window.location.href = `mapa.html?lat=${report.location.lat}&lng=${report.location.lng}`;

        reportsGrid.appendChild(card);
    });
}
