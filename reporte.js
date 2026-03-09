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

// Detectar turno actual según hora
function getTurnoActual() {
    const hora = new Date().getHours();
    if (hora >= 5  && hora < 13) return 'manana';
    if (hora >= 13 && hora < 22) return 'tarde';
    return 'noche';
}

// Fecha para noche (si es entre 00:00 y 04:59, pertenece al día anterior)
function getFechaParaTurno(turno) {
    const ahora = new Date();
    if (turno === 'noche' && ahora.getHours() < 5) {
        const ayer = new Date(ahora);
        ayer.setDate(ayer.getDate() - 1);
        return ayer.toLocaleDateString('es-AR').replace(/\//g, '-');
    }
    return ahora.toLocaleDateString('es-AR').replace(/\//g, '-');
}

// ======================================
//  INIT
// ======================================
let chartInstance = null;

const hoy = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');
document.getElementById('fechaReporte').innerText = "Fecha: " + hoy;

// Supervisor desde sessionStorage
const supervisor = sessionStorage.getItem('supervisor') || '—';
document.getElementById('supervisorNombre').innerText = supervisor;

// Marcar turno actual activo
const turnoActual = getTurnoActual();
const btnActual = document.getElementById(`btn-${turnoActual}`);
if (btnActual) btnActual.classList.add('active');

// Cargar turno actual por defecto
cargarTurno(turnoActual);

// ======================================
//  CARGAR TURNO
// ======================================
function cargarTurno(turno) {
    // Marcar botón activo
    document.querySelectorAll('.btn-turno').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(`btn-${turno}`);
    if (btn) btn.classList.add('active');

    // Label del turno
    document.getElementById('turnoLabel').innerText = TURNOS[turno].label;

    const fecha = getFechaParaTurno(turno);
    const { inicio, fin } = TURNOS[turno];

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
            const h = parseInt(s.hora.split(':')[0]);
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
        renderGrafico(labels, valores);
    });
}

// ======================================
//  GRÁFICO
// ======================================
function renderGrafico(labels, valores) {
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }

    if (labels.length === 0) return;

    chartInstance = new Chart(document.getElementById('graficoStock'), {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Paquetes Totales',
                data: valores,
                backgroundColor: '#c8960c',
                borderColor: '#7a1a0a',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#2a1a0a', font: { family: 'Lato' } } }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#6b4c2a' },
                    grid: { color: '#e8dcc8' }
                },
                x: {
                    ticks: { color: '#6b4c2a' },
                    grid: { display: false }
                }
            }
        }
    });
    }
