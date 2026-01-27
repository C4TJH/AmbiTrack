// Referencias globales
// db está disponible

const reportsGrid = document.getElementById('reportsGrid');
const filterSelect = document.getElementById('filterCategory');

let allReports = [];

// Cargar reportes al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadReports();
    loadTopCitizens();
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

            // Calculate Stats
            updateGlobalStats(allReports);

            renderReports('todas');

            // Update leaderboard
            loadTopCitizens();
        })
        .catch((error) => {
            console.error("Error cargando reportes:", error);
            reportsGrid.innerHTML = `<p class="error">Error al cargar reportes: ${error.message}</p>`;
        });
}

function updateGlobalStats(reports) {
    const totalReports = reports.length;

    // Count resolved/approved reports
    // Assuming status values might be: 'resuelto', 'aprobado', 'pendiente', 'rechazado'
    const resolvedCount = reports.filter(r => r.status === 'resuelto' || r.status === 'aprobado').length;

    // Calculate rate
    const resolutionRate = totalReports > 0 ? Math.round((resolvedCount / totalReports) * 100) : 0;

    // Update DOM
    // Select elements - user needs to ensure these classes exist in HTML
    const statNumberEls = document.querySelectorAll('.stat-number');
    if (statNumberEls.length >= 2) {
        statNumberEls[0].textContent = totalReports.toLocaleString();
        statNumberEls[1].textContent = `${resolutionRate}%`;
    }
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

// Load Top Citizens Leaderboard
function loadTopCitizens() {
    const rankingList = document.getElementById('rankingList');
    if (!rankingList) return;

    db.collection('reportes')
        .where('status', 'in', ['resuelto', 'aprobado'])
        .get()
        .then((querySnapshot) => {
            // Count reports per user
            const userCounts = {};

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const userId = data.authorId || data.userId;
                const userName = data.authorName || 'Usuario';

                if (userId) {
                    if (!userCounts[userId]) {
                        userCounts[userId] = {
                            name: userName,
                            count: 0
                        };
                    }
                    userCounts[userId].count++;
                }
            });

            // Convert to array and sort
            const topUsers = Object.entries(userCounts)
                .map(([userId, data]) => ({
                    userId,
                    name: data.name,
                    count: data.count
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 3); // Top 3

            // Render leaderboard
            if (topUsers.length === 0) {
                rankingList.innerHTML = `
                    <li>
                        <div style="text-align: center; color: #64748b; padding: 20px 0;">
                            No hay datos disponibles
                        </div>
                    </li>
                `;
                return;
            }

            rankingList.innerHTML = '';
            topUsers.forEach((user, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="rank">${index + 1}</span>
                    <div class="user-info">
                        <span class="name">${user.name}</span>
                        <span class="points">${user.count} reportes</span>
                    </div>
                `;
                rankingList.appendChild(li);
            });
        })
        .catch((error) => {
            console.error("Error cargando top ciudadanos:", error);
            rankingList.innerHTML = `
                <li>
                    <div style="text-align: center; color: #e74c3c; padding: 20px 0; font-size: 0.9rem;">
                        Error al cargar ranking
                    </div>
                </li>
            `;
        });
}
