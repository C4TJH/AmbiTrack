const provider = new firebase.auth.GoogleAuthProvider();

document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("loginGoogle");

    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            firebase.auth()
                .signInWithPopup(provider)
                .then(() => {
                    window.location.href = "index.html";
                })
                .catch((error) => {
                    console.error("Login error:", error);
                    alert("Error al iniciar sesión");
                });
        });
    }
});
