// Referencias DOM
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');

const formLoginEmail = document.getElementById('formLoginEmail');
const formRegister = document.getElementById('formRegister');

const loginGoogleBtn = document.getElementById('loginGoogle');

// Toggle Forms
if (showRegisterBtn) {
    showRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    });
}

if (showLoginBtn) {
    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });
}

// Google Login
const provider = new firebase.auth.GoogleAuthProvider();

if (loginGoogleBtn) {
    loginGoogleBtn.addEventListener("click", () => {
        firebase.auth()
            .signInWithPopup(provider)
            .then(() => {
                window.location.href = "index.html";
            })
            .catch((error) => {
                console.error("Login error:", error);
                alert("Error al iniciar sesión con Google: " + error.message);
            });
    });
}

// Email/Password Login
if (formLoginEmail) {
    formLoginEmail.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Check if email is verified
                if (!userCredential.user.emailVerified) {
                    alert("Por favor verifica tu correo electrónico antes de iniciar sesión.");
                    firebase.auth().signOut();
                } else {
                    window.location.href = "index.html";
                }
            })
            .catch((error) => {
                console.error("Login error:", error);
                alert("Error: " + error.message);
            });
    });
}

// Registration
if (formRegister) {
    formRegister.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;

        if (password !== confirmPassword) {
            alert("Las contraseñas no coinciden");
            return;
        }

        if (password.length < 6) {
            alert("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Send Verification Email
                userCredential.user.sendEmailVerification()
                    .then(() => {
                        alert("Cuenta creada con éxito. Se ha enviado un correo de verificación a tu email. Por favor verifícalo para iniciar sesión.");
                        // Switch to login view
                        registerForm.classList.add('hidden');
                        loginForm.classList.remove('hidden');
                        firebase.auth().signOut(); // Force logout so they login again after verification
                    });
            })
            .catch((error) => {
                console.error("Register error:", error);
                alert("Error al registrar: " + error.message);
            });
    });
}
