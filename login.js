const firebaseConfig = {
    apiKey: "AIzaSyAJgnFCKt_8TT4BpWrDwqy--Oep0raYA18",
    authDomain: "romero-env.firebaseapp.com",
    databaseURL: "https://romero-env-default-rtdb.firebaseio.com",
    projectId: "romero-env",
    storageBucket: "romero-env.firebasestorage.app",
    messagingSenderId: "350498956335",
    appId: "1:350498956335:web:901f91c4d7b983308252da"
    measurementId: "G-4WWNKPPBMG"
};


// Inicializar Firebase (Solo si no está inicializado)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const USUARIO_VALIDO = "adminpro";
const CONTRASENA_VALIDA = "12345"; 

const loginForm = document.getElementById('loginForm');
const messageDisplay = document.getElementById('loginMessage');

loginForm.addEventListener('submit', function(event) {
    event.preventDefault(); 
    
    const inputUsername = document.getElementById('username').value;
    const inputPassword = document.getElementById('password').value;

    if (inputUsername === USUARIO_VALIDO && inputPassword === CONTRASENA_VALIDA) {
        
        // --- PASO CLAVE: GUARDAR LA SESIÓN ---
        // Esto le dice a las otras páginas que el usuario ya se identificó
        sessionStorage.setItem('autenticado', 'true');
        
        messageDisplay.textContent = "¡Inicio de sesión exitoso! Redirigiendo...";
        messageDisplay.style.color = "green";
        
        setTimeout(() => {
            window.location.href = "./admin.html"; 
        }, 1500);

    } else {
        messageDisplay.textContent = "Error: Usuario o contraseña incorrectos.";
        messageDisplay.style.color = "red";
    }
});

