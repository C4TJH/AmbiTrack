document.addEventListener("DOMContentLoaded", () => {
    const auth = firebase.auth();
    const btnLogin = document.getElementById("btnLogin");
    const userGreeting = document.getElementById("userGreeting");
    const btnLogout = document.getElementById("btnLogout") || document.getElementById("logoutBtn");

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
            } else {
                if (btnLogin) btnLogin.style.display = "inline-block";
                userGreeting.textContent = "";
                logoutButton.style.display = "none";
            }
        });
    } else {
        // If no logout button, just handle greeting
        auth.onAuthStateChanged(user => {
            if (user) {
                if (btnLogin) btnLogin.style.display = "none";
                const name = user.displayName || user.email;
                userGreeting.textContent = "Hola, " + name;
            } else {
                if (btnLogin) btnLogin.style.display = "inline-block";
                userGreeting.textContent = "";
            }
        });
    }
});
