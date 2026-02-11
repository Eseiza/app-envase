const firebaseConfig = {
    // PEGA AQUÍ TUS DATOS DE FIREBASE
    apiKey: "...",
    authDomain: "...",
    databaseURL: "...",
    projectId: "...",
    storageBucket: "...",
    messagingSenderId: "...",
    appId: "..."
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const getFechaHoy = () => new Date().toLocaleDateString('es-AR').replace(/\//g, '-');

const USUARIO_VALIDO = "adminpro";
const CONTRASENA_VALIDA = "12345"; 

const loginForm = document.getElementById('loginForm');
const messageDisplay = document.getElementById('loginMessage');

loginForm.addEventListener('submit', function(event) {
    event.preventDefault(); 
    
    const inputUsername = document.getElementById('username').value;
    const inputPassword = document.getElementById('password').value;

    if (inputUsername === USUARIO_VALIDO && inputPassword === CONTRASENA_VALIDA) {
        
        messageDisplay.textContent = "¡Inicio de sesión exitoso! Redirigiendo a la página de administración...";
        messageDisplay.style.color = "green";
        
        // Redirección a la página de administración
        setTimeout(() => {
            window.location.href = "admin.html"; 
        }, 1500); 

    } else {
        messageDisplay.textContent = "Error: Usuario o contraseña incorrectos.";
        messageDisplay.style.color = "red";
    }

});
