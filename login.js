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
const db = firebase.database();

const getFechaHoy = () => {
    const hoy = new Date();
    return `${hoy.getDate()}-${hoy.getMonth() + 1}-${hoy.getFullYear()}`;
};

function getTurnoActual() {
    const h = new Date().getHours();
    if (h >= 5  && h < 13) return 'manana';
    if (h >= 13 && h < 22) return 'tarde';
    return 'noche';
}

// ─── USUARIOS ─────────────────────────────────────────
const USUARIOS = [
    { usuario: "admin",      contrasena: "admin.2026",      rol: "admin",      redirige: "./admin.html"   },
    { usuario: "calidad",    contrasena: "calidad.2026",    rol: "calidad",    redirige: "./reporte.html" },
    { usuario: "operario",   contrasena: "operario.2026",   rol: "operario",   redirige: "./lista.html"   },
    { usuario: "romero",     contrasena: "romero.2026",     rol: "romero",     redirige: "./reporte.html" },
    { usuario: "supervisor", contrasena: "supervisor.2026", rol: "supervisor", redirige: "./admin.html"   },
    { usuario: "ventas",     contrasena: "ventas.2026",     rol: "ventas",     redirige: "./reporte.html" }
];

const ROLES = [
    { value: "admin",      label: "Admin",      icon: "🔑" },
    { value: "calidad",    label: "Calidad",    icon: "🔬" },
    { value: "operario",   label: "Operario",   icon: "⚙️" },
    { value: "romero",     label: "Romero",     icon: "👁️" },
    { value: "supervisor", label: "Supervisor", icon: "⭐" },
    { value: "ventas",     label: "Ventas",     icon: "📊" }
];

let rolSeleccionado = null;

// ─── REEMPLAZAR GRILLA POR SELECT ─────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.roles-grid');
    if (!grid) return;

    // Crear select de rol
    const select = document.createElement('select');
    select.id = 'rolSelect';

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.textContent = '-- Seleccioná un rol --';
    select.appendChild(placeholder);

    ROLES.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.value;
        opt.textContent = `${r.icon}  ${r.label}`;
        select.appendChild(opt);
    });

    select.addEventListener('change', function() {
        seleccionarRol(this.value, null);
    });

    // Insertar antes del grid (que queda oculto por CSS)
    grid.parentNode.insertBefore(select, grid);
});

// ─── SELECCIÓN DE ROL ──────────────────────────────────
window.seleccionarRol = function(rol, elemento) {
    rolSeleccionado = rol;

    // Mantener compatibilidad con botones (por si acaso)
    if (elemento) {
        document.querySelectorAll('.rol-btn').forEach(b => b.classList.remove('active'));
        elemento.classList.add('active');
    }

    // Mostrar formulario
    document.getElementById('formBody').classList.add('visible');

    // Mostrar/ocultar supervisor
    const supervisorGroup = document.getElementById('supervisorGroup');
    const supervisorSelect = document.getElementById('supervisor');
    if (rol === 'supervisor') {
        supervisorGroup.classList.add('visible');
        supervisorSelect.required = true;
    } else {
        supervisorGroup.classList.remove('visible');
        supervisorSelect.required = false;
        supervisorSelect.value = '';
    }

    document.getElementById('btnIngresar').disabled = false;
    document.getElementById('btnIngresar').textContent = 'Iniciar Sesión';
};

// ─── SUBMIT ────────────────────────────────────────────
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const inputUsername  = document.getElementById('username').value.trim().toLowerCase();
    const inputPassword  = document.getElementById('password').value.trim();
    const messageDisplay = document.getElementById('loginMessage');

    if (!rolSeleccionado) {
        messageDisplay.textContent = "Por favor, seleccioná un rol.";
        messageDisplay.style.color = "red";
        return;
    }

    if (rolSeleccionado === 'supervisor') {
        const supervisor = document.getElementById('supervisor').value;
        if (!supervisor) {
            messageDisplay.textContent = "Por favor, seleccioná un supervisor de turno.";
            messageDisplay.style.color = "red";
            return;
        }
        sessionStorage.setItem('supervisor', supervisor);
        const turno = getTurnoActual();
        db.ref(`historial/${getFechaHoy()}/supervisores/${turno}`).set(supervisor);
    }

    const usuarioEncontrado = USUARIOS.find(u =>
        u.usuario === inputUsername &&
        u.contrasena === inputPassword &&
        u.rol === rolSeleccionado
    );

    if (usuarioEncontrado) {
        sessionStorage.setItem('autenticado', 'true');
        sessionStorage.setItem('rol', usuarioEncontrado.rol);

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
