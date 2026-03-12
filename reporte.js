const firebaseConfig = {
    apiKey: "AIzaSyAJgnFCKt_8TT4BpWrDwqy--Oep0raYA18",
    authDomain: "romero-env.firebaseapp.com",
    databaseURL: "https://romero-env-default-rtdb.firebaseio.com",
    projectId: "romero-env",
    storageBucket: "romero-env.firebasestorage.app",
    messagingSenderId: "350498956335",
    appId: "1:350498956335:web:901f91c4d7b983308252da"
};

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const db = firebase.database();

// ======================================
//  TURNOS
// ======================================
const TURNOS = {
    manana: { label: 'Turno Mañana',  inicio: 5,  fin: 13 },
    tarde:  { label: 'Turno Tarde',   inicio: 13, fin: 22 },
    noche:  { label: 'Turno Noche',   inicio: 22, fin: 5  }
};

function getTurnoActual() {
    const hora = new Date().getHours();
    if (hora >= 5  && hora < 13) return 'manana';
    if (hora >= 13 && hora < 22) return 'tarde';
    return 'noche';
}

function getFechaParaTurno(turno) {
    const ahora = new Date();
    if (turno === 'noche' && ahora.getHours() < 5) {
        const ayer = new Date(ahora);
        ayer.setDate(ayer.getDate() - 1);
        return `${ayer.getDate()}-${ayer.getMonth() + 1}-${ayer.getFullYear()}`;
    }
    return `${ahora.getDate()}-${ahora.getMonth() + 1}-${ahora.getFullYear()}`;
}

// ======================================
//  INIT
// ======================================
let chartInstance = null;

const hoy = (() => { const h = new Date(); return `${h.getDate()}-${h.getMonth() + 1}-${h.getFullYear()}`; })();
document.getElementById('fechaReporte').innerText = "Fecha: " + hoy;

const supervisor = sessionStorage.getItem('supervisor') || '—';
document.getElementById('supervisorNombre').innerText = supervisor;

// Función para cargar supervisor desde Firebase según fecha y turno
function cargarSupervisorFirebase(fecha, turno) {
    db.ref(`historial/${fecha}/supervisores/${turno}`).once('value', snap => {
        const sup = snap.val();
        document.getElementById('supervisorNombre').innerText = sup || '—';
    });
}

const turnoActual = getTurnoActual();
const btnActual = document.getElementById(`btn-${turnoActual}`);
if (btnActual) btnActual.classList.add('active');

cargarTurno(turnoActual);

// Personalizar según rol
const rol = sessionStorage.getItem('rol');

// Mostrar calendario solo para admin, calidad y romero
if (['admin', 'calidad', 'romero'].includes(rol)) {
    document.getElementById('calendarioSection').style.display = 'block';
    iniciarCalendario();
}

// Ocultar gráfico para supervisor, ventas y romero
if (rol === 'supervisor' || rol === 'ventas') {
    const chartSection = document.querySelector('.chart-section');
    if (chartSection) chartSection.style.display = 'none';
}

// Configurar botones según rol
const btnImprimir = document.getElementById('btn-imprimir');
const btnVolver   = document.getElementById('btn-volver');

if (rol === 'admin') {
    // Admin: imprimir + volver al panel
    btnImprimir.style.display = 'block';
    btnVolver.textContent = '← Volver al Panel';
    btnVolver.onclick = () => window.location.href = 'admin.html';

} else if (rol === 'supervisor') {
    // Supervisor: imprimir + volver al panel
    btnImprimir.style.display = 'block';
    btnVolver.textContent = '← Volver al Panel';
    btnVolver.onclick = () => window.location.href = 'admin.html';

} else if (rol === 'ventas') {
    // Ventas: SIN imprimir, solo cerrar sesión
    btnImprimir.style.display = 'none';
    btnVolver.textContent = '🚪 Cerrar Sesión';
    btnVolver.onclick = () => { sessionStorage.clear(); window.location.href = 'index.html'; };

} else if (rol === 'romero') {
    // Romero: igual que Calidad, con gráfico + imprimir + cerrar sesión
    btnImprimir.style.display = 'block';
    btnVolver.textContent = '🚪 Cerrar Sesión';
    btnVolver.onclick = () => { sessionStorage.clear(); window.location.href = 'index.html'; };

} else if (rol === 'calidad') {
    // Calidad: imprimir + cerrar sesión
    btnImprimir.style.display = 'block';
    btnVolver.textContent = '🚪 Cerrar Sesión';
    btnVolver.onclick = () => { sessionStorage.clear(); window.location.href = 'index.html'; };
}

// ======================================
//  CARGAR TURNO
// ======================================
function cargarTurno(turno) {
    document.querySelectorAll('.btn-turno').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(`btn-${turno}`);
    if (btn) btn.classList.add('active');

    document.getElementById('turnoLabel').innerText = TURNOS[turno].label;

    const fecha = getFechaParaTurno(turno);
    const { inicio, fin } = TURNOS[turno];

    // Cargar supervisor del turno desde Firebase
    cargarSupervisorFirebase(fecha, turno);

    db.ref(`historial/${fecha}/sobrantes`).once('value', (snapshot) => {
        const data = snapshot.val();
        const tbody = document.getElementById('planillaBody');
        const labels = [];
        const valores = [];
        let totalGeneral = 0;

        tbody.innerHTML = '';

        if (!data) {
            tbody.innerHTML = '<tr><td colspan="8" class="vacio">No hay datos para este turno.</td></tr>';
            document.getElementById('totalGeneral').innerText = '—';
            renderGrafico([], []);
            return;
        }

        // Filtrar por horario del turno
        const registros = Object.values(data).filter(s => {
            if (!s.hora) return false;
            const h = parseInt(s.hora.split(':')[0], 10);
            if (isNaN(h)) return false;
            if (turno === 'noche') return h >= 22 || h < 5;
            return h >= inicio && h < fin;
        });

        if (registros.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="vacio">No hay registros en este turno.</td></tr>';
            document.getElementById('totalGeneral').innerText = '—';
            renderGrafico([], []);
            return;
        }

        registros.forEach(s => {
            const total = s.total || 0;
            totalGeneral += total;
            labels.push(s.producto);
            valores.push(total);

            tbody.innerHTML += `
                <tr>
                    <td>${s.marca || '—'}</td>
                    <td>${s.linea || '—'}</td>
                    <td><strong>${s.producto}</strong></td>
                    <td>${s.filas ?? '—'}</td>
                    <td>${s.bandejas ?? '—'}</td>
                    <td>${s.incompletos ?? '—'}</td>
                    <td class="total-celda">${total.toLocaleString()}</td>
                    <td>${s.hora || '—'}</td>
                </tr>`;
        });

        document.getElementById('totalGeneral').innerText = totalGeneral.toLocaleString();
        renderGrafico(labels, valores, totalGeneral);
    });
}

// ======================================
//  GRÁFICO DONUT
// ======================================
function renderGrafico(labels, valores, total) {
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }

    if (labels.length === 0) return;

    chartInstance = new Chart(document.getElementById('graficoStock'), {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: valores,
                backgroundColor: ['#c8960c', '#7a1a0a', '#e8b84b', '#b13009', '#6b4c2a', '#d4a017', '#a0522d', '#c46210'],
                borderColor: '#fff',
                borderWidth: 3,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#2a1a0a',
                        font: { family: 'Lato', size: 13 },
                        padding: 16,
                        usePointStyle: true,
                        pointStyleWidth: 12
                    }
                },
                tooltip: {
                    callbacks: {
                        label: ctx => {
                            const pct = total > 0 ? Math.round(ctx.parsed / total * 100) : 0;
                            return ` ${ctx.label}: ${ctx.parsed.toLocaleString()} paq. (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
}


// ======================================
//  CALENDARIO HISTORIAL
// ======================================
let calMes, calAnio, fechaSeleccionada = null;

const CAL_MES_INICIO  = 2;    // Marzo (0-indexado)
const CAL_ANIO_INICIO = 2026;

function iniciarCalendario() {
    const hoy = new Date();
    calMes  = hoy.getMonth();
    calAnio = hoy.getFullYear();
    renderCalendario();
}

function cambiarMes(dir) {
    let nuevoMes  = calMes + dir;
    let nuevoAnio = calAnio;

    if (nuevoMes > 11) { nuevoMes = 0;  nuevoAnio++; }
    if (nuevoMes < 0)  { nuevoMes = 11; nuevoAnio--; }

    // No permitir ir antes de marzo 2026
    if (nuevoAnio < CAL_ANIO_INICIO || (nuevoAnio === CAL_ANIO_INICIO && nuevoMes < CAL_MES_INICIO)) return;

    // No permitir ir más allá del mes actual
    const hoy = new Date();
    if (nuevoAnio > hoy.getFullYear() || (nuevoAnio === hoy.getFullYear() && nuevoMes > hoy.getMonth())) return;

    calMes  = nuevoMes;
    calAnio = nuevoAnio;
    renderCalendario();
}

function renderCalendario() {
    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    document.getElementById('calTitulo').textContent = `${meses[calMes]} ${calAnio}`;

    const grid = document.getElementById('calGrid');
    grid.innerHTML = '';

    // Cabecera días
    ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].forEach(d => {
        const h = document.createElement('div');
        h.className = 'cal-dia-header';
        h.textContent = d;
        grid.appendChild(h);
    });

    const primerDia = new Date(calAnio, calMes, 1).getDay();
    const diasEnMes = new Date(calAnio, calMes + 1, 0).getDate();
    const hoy = new Date();

    // Espacios vacíos
    for (let i = 0; i < primerDia; i++) {
        const vacio = document.createElement('div');
        vacio.className = 'cal-dia vacio';
        grid.appendChild(vacio);
    }

    // Días del mes
    for (let d = 1; d <= diasEnMes; d++) {
        const cell = document.createElement('div');
        cell.className = 'cal-dia';

        const fechaStr = `${d}-${calMes + 1}-${calAnio}`;
        const esHoy    = d === hoy.getDate() && calMes === hoy.getMonth() && calAnio === hoy.getFullYear();
        const esFutura = new Date(calAnio, calMes, d) > hoy;

        // Número del día
        const numEl = document.createElement('div');
        numEl.className = 'dia-num';
        numEl.textContent = d;
        cell.appendChild(numEl);

        if (esHoy)    cell.classList.add('hoy');
        if (esFutura) cell.classList.add('futura');
        if (fechaStr === fechaSeleccionada) cell.classList.add('seleccionado');

        if (!esFutura) {
            cell.onclick = () => seleccionarFecha(fechaStr, cell, d);
            // Verificar si hay datos en Firebase para ese día
            db.ref(`historial/${fechaStr}/sobrantes`).once('value', snap => {
                if (snap.exists()) {
                    const punto = document.createElement('span');
                    punto.className = 'punto-dato';
                    cell.appendChild(punto);
                }
            });
        }

        grid.appendChild(cell);
    }
}

function seleccionarFecha(fecha, cell, d) {
    // Quitar selección anterior
    document.querySelectorAll('.cal-dia.seleccionado').forEach(c => c.classList.remove('seleccionado'));
    cell.classList.add('seleccionado');
    fechaSeleccionada = fecha;

    // Actualizar fecha mostrada en el header
    document.getElementById('fechaReporte').innerText = `Fecha: ${fecha.replace(/-/g, '/')}`;

    // Mostrar info de fecha seleccionada
    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const info = document.getElementById('fechaInfo');
    if (info) {
        info.classList.add('visible');
        document.getElementById('fechaInfoTexto').textContent = `${d} de ${meses[calMes]} de ${calAnio}`;
    }

    // Recargar turno activo con la fecha seleccionada
    const turnoActivo = document.querySelector('.btn-turno.active');
    const turno = turnoActivo ? turnoActivo.id.replace('btn-', '') : 'manana';
    cargarTurnoPorFecha(turno, fecha);
}

// Versión de cargarTurno que acepta una fecha específica
function cargarTurnoPorFecha(turno, fecha) {
    document.querySelectorAll('.btn-turno').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(`btn-${turno}`);
    if (btn) btn.classList.add('active');
    document.getElementById('turnoLabel').innerText = TURNOS[turno].label;

    const { inicio, fin } = TURNOS[turno];

    // Cargar supervisor del turno desde Firebase
    cargarSupervisorFirebase(fecha, turno);

    db.ref(`historial/${fecha}/sobrantes`).once('value', (snapshot) => {
        const data = snapshot.val();
        const tbody = document.getElementById('planillaBody');
        const labels = [];
        const valores = [];
        let totalGeneral = 0;
        tbody.innerHTML = '';

        if (!data) {
            tbody.innerHTML = '<tr><td colspan="8" class="vacio">No hay datos para este turno.</td></tr>';
            document.getElementById('totalGeneral').innerText = '—';
            renderGrafico([], []);
            return;
        }

        const registros = Object.values(data).filter(s => {
            if (!s.hora) return false;
            const h = parseInt(s.hora.split(':')[0], 10);
            if (isNaN(h)) return false;
            if (turno === 'noche') return h >= 22 || h < 5;
            return h >= inicio && h < fin;
        });

        if (registros.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="vacio">No hay registros en este turno.</td></tr>';
            document.getElementById('totalGeneral').innerText = '—';
            renderGrafico([], []);
            return;
        }

        registros.forEach(s => {
            const total = s.total || 0;
            totalGeneral += total;
            labels.push(s.producto);
            valores.push(total);
            tbody.innerHTML += `
                <tr>
                    <td>${s.marca || '—'}</td>
                    <td>${s.linea || '—'}</td>
                    <td><strong>${s.producto}</strong></td>
                    <td>${s.filas ?? '—'}</td>
                    <td>${s.bandejas ?? '—'}</td>
                    <td>${s.incompletos ?? '—'}</td>
                    <td class="total-celda">${total.toLocaleString()}</td>
                    <td>${s.hora || '—'}</td>
                </tr>`;
        });

        document.getElementById('totalGeneral').innerText = totalGeneral.toLocaleString();
        renderGrafico(labels, valores, totalGeneral);
    });
}

// Sobrescribir los botones de turno para usar fecha seleccionada si hay una
document.querySelectorAll('.btn-turno').forEach(btn => {
    btn.addEventListener('click', () => {
        const turno = btn.id.replace('btn-', '');
        if (fechaSeleccionada) {
            cargarTurnoPorFecha(turno, fechaSeleccionada);
        }
    });
});
   
