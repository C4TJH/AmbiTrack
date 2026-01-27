document.addEventListener("DOMContentLoaded", () => {
    const db = firebase.firestore();

    const statReports = document.getElementById("statReports");
    const statZones = document.getElementById("statZones");
    const statUsers = document.getElementById("statUsers");

    // Animate numbers
    const animateValue = (obj, start, end, duration) => {
        if (!obj) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start) + "+";
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    // Fetch Stats
    db.collection("reportes").get().then((querySnapshot) => {
        let totalReports = querySnapshot.size;
        let solvedReports = 0;
        let uniqueAuthors = new Set();

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Count solved
            if (data.status === 'resuelto' || data.categoria === 'resuelto' || data.estado === 'resuelto') {
                solvedReports++;
            }
            // Count unique users (suponiendo que hay un campo authorUid o email)
            if (data.authorUid) {
                uniqueAuthors.add(data.authorUid);
            } else if (data.autor) {
                uniqueAuthors.add(data.autor);
            }
        });

        // Use a minimum of 50 users for display if real data is low to look good, 
        // OR just use real data. User asked for "Real values".
        // Let's use real values but fallback to 0.

        let totalUsers = uniqueAuthors.size;

        // If we want to show "Active Users" maybe we add registered users collection size if available.
        // For now, unique reporters is a safe bet for "Active".

        animateValue(statReports, 0, totalReports, 2000);
        animateValue(statZones, 0, solvedReports, 2000);
        animateValue(statUsers, 0, totalUsers, 2000);

    }).catch((error) => {
        console.error("Error getting stats: ", error);
        statReports.textContent = "Err";
        statZones.textContent = "Err";
        statUsers.textContent = "Err";
    });
});
