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

// ======================================
//  TURNO Y FECHA — horarios actualizados
//  Mañana: 08:31 - 16:30
//  Tarde:  16:31 - 00:30
//  Noche:  00:31 - 08:30 (fecha del día anterior)
// ======================================
function getTurnoActual() {
    const ahora = new Date();
    const min   = ahora.getHours() * 60 + ahora.getMinutes();
    if (min >= 511 && min <= 990)  return 'manana'; // 08:31 - 16:30
    if (min >= 991 || min <= 30)   return 'tarde';  // 16:31 - 00:30
    return 'noche';                                  // 00:31 - 08:30
}

function getFechaParaTurno() {
    const ahora = new Date();
    const min   = ahora.getHours() * 60 + ahora.getMinutes();
    // Turno noche de madrugada → pertenece al día anterior
    if (min >= 31 && min <= 510) {
        const ayer = new Date(ahora);
        ayer.setDate(ayer.getDate() - 1);
        return `${ayer.getDate()}-${ayer.getMonth() + 1}-${ayer.getFullYear()}`;
    }
    return `${ahora.getDate()}-${ahora.getMonth() + 1}-${ahora.getFullYear()}`;
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

    const select = document.createElement('select');
    select.id = 'rolSelect';

    const placeholder = document.createElement('option');
    placeholder.value    = '';
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.textContent = '-- Seleccioná un rol --';
    select.appendChild(placeholder);

    ROLES.forEach(r => {
        const opt = document.createElement('option');
        opt.value       = r.value;
        opt.textContent = `${r.icon}  ${r.label}`;
        select.appendChild(opt);
    });

    select.addEventListener('change', function () {
        seleccionarRol(this.value, null);
    });

    grid.parentNode.insertBefore(select, grid);
});

// ─── SELECCIÓN DE ROL ──────────────────────────────────
window.seleccionarRol = function (rol, elemento) {
    rolSeleccionado = rol;

    if (elemento) {
        document.querySelectorAll('.rol-btn').forEach(b => b.classList.remove('active'));
        elemento.classList.add('active');
    }

    document.getElementById('formBody').classList.add('visible');

    const supervisorGroup  = document.getElementById('supervisorGroup');
    const supervisorSelect = document.getElementById('supervisor');

    if (rol === 'supervisor') {
        supervisorGroup.classList.add('visible');
        supervisorSelect.required = true;
    } else {
        supervisorGroup.classList.remove('visible');
        supervisorSelect.required = false;
        supervisorSelect.value    = '';
    }

    document.getElementById('btnIngresar').disabled    = false;
    document.getElementById('btnIngresar').textContent = 'Iniciar Sesión';
};

// ─── SUBMIT ────────────────────────────────────────────
document.getElementById('loginForm').addEventListener('submit', function (event) {
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

        // ✅ Turno y fecha correctos según horarios actualizados
        const turno = getTurnoActual();
        const fecha = getFechaParaTurno();
        db.ref(`historial/${fecha}/supervisores/${turno}`).set(supervisor);
    }

    const usuarioEncontrado = USUARIOS.find(u =>
        u.usuario    === inputUsername &&
        u.contrasena === inputPassword &&
        u.rol        === rolSeleccionado
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
