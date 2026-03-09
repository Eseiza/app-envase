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
    manana: { label: '🌅 Turno Mañana',  inicio: 5,  fin: 13 },
    tarde:  { label: '🌇 Turno Tarde',   inicio: 13, fin: 22 },
    noche:  { label: '🌙 Turno Noche',   inicio: 22, fin: 5  }
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

const supervisor = sessionStorage.getItem('supervisor') || '—';
document.getElementById('supervisorNombre').innerText = supervisor;

const turnoActual = getTurnoActual();
const btnActual = document.getElementById(`btn-${turnoActual}`);
if (btnActual) btnActual.classList.add('active');

cargarTurno(turnoActual);

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

