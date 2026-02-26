const firebaseConfig = {
    apiKey: "AIzaSyAJgnFCKt_8TT4BpWrDwqy--Oep0raYA18",
    authDomain: "romero-env.firebaseapp.com",
    databaseURL: "https://romero-env-default-rtdb.firebaseio.com",
    projectId: "romero-env",
    storageBucket: "romero-env.firebasestorage.app",
    messagingSenderId: "350498956335",
    appId: "1:350498956335:web:901f91c4d7b983308252da"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// ✅ USUARIOS
const USUARIOS = [
    { usuario: "Admin",      contrasena: "admin.2026",      rol: "admin",      redirige: "./admin.html"   },
    { usuario: "Supervisor", contrasena: "supervisor.2026", rol: "supervisor", redirige: "./admin.html"   },
    { usuario: "Operario",   contrasena: "operario.2026",   rol: "operario",   redirige: "./lista.html"   },
    { usuario: "Ventas",     contrasena: "ventas.2026",     rol: "ventas",     redirige: "./reporte.html" }
];

const loginForm = document.getElementById('loginForm');
const messageDisplay = document.getElementById('loginMessage');

loginForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const inputUsername = document.getElementById('username').value;
    const inputPassword = document.getElementById('password').value;
    const supervisorSeleccionado = document.getElementById('supervisor').value;

    if (!supervisorSeleccionado) {
        messageDisplay.textContent = "Por favor, seleccioná un supervisor de turno.";
        messageDisplay.style.color = "red";
        return;
    }

    const usuarioEncontrado = USUARIOS.find(u =>
        u.usuario === inputUsername && u.contrasena === inputPassword
    );

    if (usuarioEncontrado) {
        sessionStorage.setItem('autenticado', 'true');
        sessionStorage.setItem('rol', usuarioEncontrado.rol);
        sessionStorage.setItem('supervisor', supervisorSeleccionado);

        messageDisplay.textContent = "¡Inicio de sesión exitoso! Redirigiendo...";
        messageDisplay.style.color = "green";

        setTimeout(() => {
            window.location.href = usuarioEncontrado.redirige;
        }, 1500);

    } else {
        messageDisplay.textContent = "Error: Usuario o contraseña incorrectos.";
        messageDisplay.style.color = "red";
    }
});

