const firebaseConfig = {
    apiKey: "AIzaSyAJgnFCKt_8TT4BpWrDwqy--Oep0raYA18",
    authDomain: "romero-env.firebaseapp.com",
    databaseURL: "https://romero-env-default-rtdb.firebaseio.com",
    projectId: "romero-env",
    storageBucket: "romero-env.firebasestorage.app",
    messagingSenderId: "350498956335",
    appId: "1:350498956335:web:901f91c4d7b983308252da"
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
    const supervisorSeleccionado = document.getElementById('supervisor').value; // ✅ NUEVO

    // Validar que se haya seleccionado un supervisor
    if (!supervisorSeleccionado) {
        messageDisplay.textContent = "Por favor, selecciona un supervisor de turno.";
        messageDisplay.style.color = "red";
        return;
    }

    if (inputUsername === USUARIO_VALIDO && inputPassword === CONTRASENA_VALIDA) {
        
        // --- GUARDAR LA SESIÓN ---
        sessionStorage.setItem('autenticado', 'true');
        sessionStorage.setItem('supervisor', supervisorSeleccionado); // ✅ NUEVO

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
