document.addEventListener("DOMContentLoaded", () => {
    const auth = firebase.auth();
    const btnLogin = document.getElementById("btnLogin");

    // Elementos del menú de usuario
    const userMenu = document.getElementById("userMenu");
    const userGreeting = document.getElementById("userGreeting");
    const userInitial = document.getElementById("userInitial");
    const btnLogout = document.getElementById("btnLogout");
    const adminLink = document.getElementById("adminLink");

    const navbar = document.querySelector(".navbar");

    // Lista de correos de administradores
    const ADMIN_EMAILS = ["catjmartinez2002@gmail.com"];

    // Efecto de scroll en la barra de navegación
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });

    // Alternar menú desplegable
    if (userMenu) {
        userMenu.addEventListener("click", (e) => {
            e.stopPropagation();
            userMenu.classList.toggle("active");
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener("click", () => {
            userMenu.classList.remove("active");
        });
    }

    // Manejar cierre de sesión
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            auth.signOut().then(() => {
                window.location.href = "index.html";
            });
        });
    }

    // Estado de autenticación
    auth.onAuthStateChanged(user => {
        if (user) {
            // Usuario autenticado
            if (btnLogin) btnLogin.style.display = "none";
            if (userMenu) userMenu.style.display = "flex";

            // Obtener nombre o correo
            let displayName = user.displayName;
            if (!displayName) {
                displayName = user.email.split('@')[0];
            }

            // Actualizar interfaz
            if (userGreeting) userGreeting.textContent = displayName;
            if (userInitial) userInitial.textContent = displayName.charAt(0).toUpperCase();

            // Verificación de administrador
            if (ADMIN_EMAILS.includes(user.email)) {
                if (adminLink) adminLink.style.display = "flex";
            }
        } else {
            // Sin usuario
            if (btnLogin) btnLogin.style.display = "flex";
            if (userMenu) userMenu.style.display = "none";
        }
    });
});
