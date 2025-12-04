// Referencias DOM
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');

const formLoginEmail = document.getElementById('formLoginEmail');
const formRegister = document.getElementById('formRegister');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');

const loginGoogleBtn = document.getElementById('loginGoogle');

// activar Formularios
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
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al iniciar sesión con Google: ' + error.message
                });
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
                // chequea si el email esta verificado
                if (!userCredential.user.emailVerified) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Verificación requerida',
                        text: 'Por favor verifica tu correo electrónico antes de iniciar sesión.'
                    });
                    firebase.auth().signOut();
                } else {
                    window.location.href = "index.html";
                }
            })
            .catch((error) => {
                console.error("Login error:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error de inicio de sesión',
                    text: error.message
                });
            });
    });
}

// Registro
if (formRegister) {
    formRegister.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;

        if (password !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Las contraseñas no coinciden'
            });
            return;
        }

        if (password.length < 6) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'La contraseña debe tener al menos 6 caracteres'
            });
            return;
        }

        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // enviar verificacion de email
                userCredential.user.sendEmailVerification()
                    .then(() => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Cuenta creada',
                            text: 'Se ha enviado un correo de verificación a tu email. Por favor verifícalo para iniciar sesión.',
                            confirmButtonText: 'Entendido'
                        }).then(() => {
                            // Switch to login view
                            registerForm.classList.add('hidden');
                            loginForm.classList.remove('hidden');
                            firebase.auth().signOut();
                        });
                    });
            })
            .catch((error) => {
                console.error("Register error:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al registrar',
                    text: error.message
                });
            });
    });
}

// olvido de contraseña
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', async (e) => {
        e.preventDefault();

        const { value: email } = await Swal.fire({
            title: 'Recuperar Contraseña',
            input: 'email',
            inputLabel: 'Ingresa tu correo electrónico',
            inputPlaceholder: 'ejemplo@correo.com',
            showCancelButton: true,
            confirmButtonText: 'Enviar correo',
            cancelButtonText: 'Cancelar'
        });

        if (email) {
            firebase.auth().sendPasswordResetEmail(email)
                .then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Correo enviado',
                        text: 'Revisa tu bandeja de entrada para restablecer tu contraseña.'
                    });
                })
                .catch((error) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo enviar el correo: ' + error.message
                    });
                });
        }
    });
}
