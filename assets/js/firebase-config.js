// Firebase versión global (NO modular)
const firebaseConfig = {
    apiKey: "AIzaSyBBbBrX3WbJ49pURaxNoQjXHL_4VX_udeU",
    authDomain: "ambitrack-2bb46.firebaseapp.com",
    projectId: "ambitrack-2bb46",
    storageBucket: "ambitrack-2bb46.firebasestorage.app",
    messagingSenderId: "89677839264",
    appId: "1:89677839264:web:a8b057dbcdbf02f5dc02c5",
    measurementId: "G-WKK6M6KP54"
};

// Inicializar Firebase global
firebase.initializeApp(firebaseConfig);

// Exportar globales
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
