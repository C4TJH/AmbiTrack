document.addEventListener("DOMContentLoaded", () => {
    const auth = firebase.auth();
    const btnLogin = document.getElementById("btnLogin");
    const userGreeting = document.getElementById("userGreeting");
    const btnLogout = document.getElementById("btnLogout") || document.getElementById("logoutBtn");
    const navMenu = document.querySelector("nav");

    // Admin Emails List
    const ADMIN_EMAILS = ["catjmartinez2002@gmail.com"];

    if (!userGreeting) return;

    // Handle Logout
    if (btnLogout) {
        // Clone to remove old listeners
        const newBtn = btnLogout.cloneNode(true);
        btnLogout.parentNode.replaceChild(newBtn, btnLogout);
        const logoutButton = newBtn;

        logoutButton.addEventListener("click", () => {
            auth.signOut().then(() => {
                window.location.href = "index.html";
            });
        });

        // Auth State Listener
        auth.onAuthStateChanged(user => {
            if (user) {
                if (btnLogin) btnLogin.style.display = "none";

                // Get Name or Email
                let displayName = user.displayName;
                if (!displayName) {
                    displayName = user.email.split('@')[0];
                }

                // Simple Text Greeting
                userGreeting.textContent = `Hola, ${displayName}`;
                userGreeting.style.display = "inline-block";

                logoutButton.style.display = "inline-block";

                // Admin Link
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
                userGreeting.style.display = "none";
                logoutButton.style.display = "none";

                const adminLink = document.getElementById("adminLink");
                if (adminLink) adminLink.remove();
            }
        });
    }
});
