document.addEventListener("DOMContentLoaded", () => {
    const auth = firebase.auth();
    const btnLogin = document.getElementById("btnLogin");
    const userGreeting = document.getElementById("userGreeting");
    const btnLogout = document.getElementById("btnLogout") || document.getElementById("logoutBtn");
    const navMenu = document.querySelector("nav"); // Select the nav container

    // Admin Emails List (Should match dashboard.js)
    const ADMIN_EMAILS = ["catjmartinez2002@gmail.com"];

    // Only proceed if the greeting element exists
    if (!userGreeting) return;

    // Setup logout handler first (if button exists)
    if (btnLogout) {
        // Remove existing listeners to avoid duplicates
        const newBtn = btnLogout.cloneNode(true);
        btnLogout.parentNode.replaceChild(newBtn, btnLogout);
        const logoutButton = newBtn; // Update reference to the new button

        logoutButton.addEventListener("click", () => {
            auth.signOut().then(() => {
                window.location.href = "index.html";
            });
        });

        // IMPORTANT: Set initial state to hidden
        logoutButton.style.display = "none";

        // Then handle auth state changes
        auth.onAuthStateChanged(user => {
            if (user) {
                if (btnLogin) btnLogin.style.display = "none";

                const name = user.displayName || user.email;
                userGreeting.textContent = "Hola, " + name;

                logoutButton.style.display = "inline-block";

                // Check for Admin Access and Inject Link if not present
                if (ADMIN_EMAILS.includes(user.email)) {
                    if (!document.getElementById("adminLink")) {
                        const adminLink = document.createElement("a");
                        adminLink.id = "adminLink";
                        adminLink.href = "dashboard.html";
                        adminLink.textContent = "Admin";
                        // Insert before the login button or at a specific position
                        // Finding the best place: after 'Mapa'
                        const mapLink = document.querySelector('a[href="mapa.html"]');
                        if (mapLink && mapLink.nextSibling) {
                            navMenu.insertBefore(adminLink, mapLink.nextSibling);
                        } else {
                            navMenu.appendChild(adminLink);
                        }
                    }
                }
            } else {
                if (btnLogin) btnLogin.style.display = "inline-block";
                userGreeting.textContent = "";
                logoutButton.style.display = "none";

                // Remove admin link if exists
                const adminLink = document.getElementById("adminLink");
                if (adminLink) adminLink.remove();
            }
        });
    } else {
        // If no logout button, just handle greeting
        auth.onAuthStateChanged(user => {
            if (user) {
                if (btnLogin) btnLogin.style.display = "none";
                const name = user.displayName || user.email;
                userGreeting.textContent = "Hola, " + name;

                // Check for Admin Access (Duplicate logic for robustness)
                if (ADMIN_EMAILS.includes(user.email)) {
                    if (!document.getElementById("adminLink")) {
                        const adminLink = document.createElement("a");
                        adminLink.id = "adminLink";
                        adminLink.href = "dashboard.html";
                        adminLink.textContent = "Admin";
                        const mapLink = document.querySelector('a[href="mapa.html"]');
                        if (mapLink && mapLink.nextSibling) {
                            navMenu.insertBefore(adminLink, mapLink.nextSibling);
                        } else {
                            navMenu.appendChild(adminLink);
                        }
                    }
                }
            } else {
                if (btnLogin) btnLogin.style.display = "inline-block";
                userGreeting.textContent = "";
                const adminLink = document.getElementById("adminLink");
                if (adminLink) adminLink.remove();
            }
        });
    }
});
