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
//  Mañana: 08:31 - 16:30
//  Tarde:  16:31 - 00:30
//  Noche:  00:31 - 08:30
//  Los límites se expresan en minutos desde medianoche
// ======================================
const TURNOS = {
    manana: { label: 'Turno Mañana', inicioMin: 511,  finMin: 990  }, // 08:31 - 16:30
    tarde:  { label: 'Turno Tarde',  inicioMin: 991,  finMin: 1470 }, // 16:31 - 00:30 (1470 = 24:30 = 30 min del día siguiente)
    noche:  { label: 'Turno Noche',  inicioMin: 31,   finMin: 510  }  // 00:31 - 08:30
};

// Convierte "HH:MM:SS" o "HH:MM" a minutos desde medianoche
function horaAMinutos(horaStr) {
    if (!horaStr) return null;
    const partes = horaStr.split(':');
    const h = parseInt(partes[0], 10);
    const m = parseInt(partes[1], 10) || 0;
    if (isNaN(h)) return null;
    return h * 60 + m;
}

function getTurnoActual() {
    const ahora = new Date();
    const min   = ahora.getHours() * 60 + ahora.getMinutes();
    if (min >= 511  && min <= 990)  return 'manana'; // 08:31 - 16:30
    if (min >= 991  && min <= 1439) return 'tarde';  // 16:31 - 23:59
    if (min >= 0    && min <= 30)   return 'tarde';  // 00:00 - 00:30 (sigue siendo tarde)
    return 'noche';                                   // 00:31 - 08:30
}

function getFechaParaTurno(turno) {
    const ahora = new Date();
    const min   = ahora.getHours() * 60 + ahora.getMinutes();
    // Turno noche: registros entre 00:31 y 08:30 pertenecen al día anterior
    if (turno === 'noche' && min >= 31 && min <= 510) {
        const ayer = new Date(ahora);
        ayer.setDate(ayer.getDate() - 1);
        return `${ayer.getDate()}-${ayer.getMonth() + 1}-${ayer.getFullYear()}`;
    }
    return `${ahora.getDate()}-${ahora.getMonth() + 1}-${ahora.getFullYear()}`;
}

// Filtra si un registro pertenece al turno según su hora
function perteneceAlTurno(horaStr, turno) {
    const min = horaAMinutos(horaStr);
    if (min === null) return false;
    if (turno === 'manana') return min >= 511 && min <= 990;
    if (turno === 'tarde')  return (min >= 991 && min <= 1439) || (min >= 0 && min <= 30);
    if (turno === 'noche')  return min >= 31 && min <= 510;
    return false;
}

// ======================================
//  VARIABLES GLOBALES
// ======================================
let chartInstance  = null;
let calMes, calAnio, fechaSeleccionada = null;

const CAL_MES_INICIO  = 2;
const CAL_ANIO_INICIO = 2026;

let turnoActivo = getTurnoActual();
let fechaActiva = getFechaParaTurno(turnoActivo);

// ======================================
//  INIT
// ======================================
const hoy = (() => {
    const h = new Date();
    return `${h.getDate()}-${h.getMonth() + 1}-${h.getFullYear()}`;
})();

document.getElementById('fechaReporte').innerText = "Fecha: " + hoy;

function cargarSupervisorFirebase(fecha, turno) {
    db.ref(`historial/${fecha}/supervisores/${turno}`).once('value', snap => {
        const sup = snap.val();
        document.getElementById('supervisorNombre').innerText =
            sup || sessionStorage.getItem('supervisor') || '—';
    });
}

const turnoInicial = getTurnoActual();
const btnActual = document.getElementById(`btn-${turnoInicial}`);
if (btnActual) btnActual.classList.add('active');

cargarTurno(turnoInicial);

// ======================================
//  ROL
// ======================================
const rol = sessionStorage.getItem('rol');

if (['admin', 'calidad', 'romero'].includes(rol)) {
    document.getElementById('calendarioSection').style.display = 'block';
    iniciarCalendario();
}

if (rol === 'supervisor' || rol === 'ventas') {
    const chartSection = document.querySelector('.chart-section');
    if (chartSection) chartSection.style.display = 'none';
}

const btnImprimir = document.getElementById('btn-imprimir');
const btnDrive    = document.getElementById('btn-drive');
const btnVolver   = document.getElementById('btn-volver');

if (rol === 'admin') {
    btnImprimir.style.display = 'block';
    btnDrive.style.display    = 'block';
    btnVolver.textContent = '← Volver al Panel';
    btnVolver.onclick = () => window.location.href = 'admin.html';

} else if (rol === 'supervisor') {
    btnImprimir.style.display = 'block';
    btnVolver.textContent = '← Volver al Panel';
    btnVolver.onclick = () => window.location.href = 'admin.html';

} else if (rol === 'ventas') {
    btnVolver.textContent = '🚪 Cerrar Sesión';
    btnVolver.onclick = () => { sessionStorage.clear(); window.location.href = 'index.html'; };

} else if (rol === 'romero') {
    btnImprimir.style.display = 'block';
    btnVolver.textContent = '🚪 Cerrar Sesión';
    btnVolver.onclick = () => { sessionStorage.clear(); window.location.href = 'index.html'; };

} else if (rol === 'calidad') {
    btnImprimir.style.display = 'block';
    btnDrive.style.display    = 'block';
    btnVolver.textContent = '🚪 Cerrar Sesión';
    btnVolver.onclick = () => { sessionStorage.clear(); window.location.href = 'index.html'; };
}

// ======================================
//  CARGAR TURNO (hoy)
// ======================================
function cargarTurno(turno) {
    turnoActivo = turno;
    fechaActiva = getFechaParaTurno(turno);

    document.querySelectorAll('.btn-turno').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(`btn-${turno}`);
    if (btn) btn.classList.add('active');
    document.getElementById('turnoLabel').innerText = TURNOS[turno].label;

    cargarSupervisorFirebase(fechaActiva, turno);

    db.ref(`historial/${fechaActiva}/sobrantes`).once('value', (snapshot) => {
        renderPlanilla(snapshot.val(), turno);
    });
}

// ======================================
//  CARGAR TURNO (fecha específica)
// ======================================
function cargarTurnoPorFecha(turno, fecha) {
    turnoActivo = turno;
    fechaActiva = fecha;

    document.querySelectorAll('.btn-turno').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(`btn-${turno}`);
    if (btn) btn.classList.add('active');
    document.getElementById('turnoLabel').innerText = TURNOS[turno].label;

    cargarSupervisorFirebase(fecha, turno);

    db.ref(`historial/${fecha}/sobrantes`).once('value', (snapshot) => {
        renderPlanilla(snapshot.val(), turno);
    });
}

// ======================================
//  RENDER PLANILLA
// ======================================
function renderPlanilla(data, turno) {
    const tbody = document.getElementById('planillaBody');
    let totalGeneral = 0;

    tbody.innerHTML = '';

    if (!data) {
        tbody.innerHTML = '<tr><td colspan="8" class="vacio">No hay datos para este turno.</td></tr>';
        document.getElementById('totalGeneral').innerText = '—';
        renderGrafico([], []);
        return;
    }

    const registros = Object.values(data).filter(s => perteneceAlTurno(s.hora, turno));

    if (registros.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="vacio">No hay registros en este turno.</td></tr>';
        document.getElementById('totalGeneral').innerText = '—';
        renderGrafico([], []);
        return;
    }

    const totalesPorProducto = {};

    registros.forEach(s => {
        const total = s.total || 0;
        totalGeneral += total;

        // Agrupar para el gráfico
        totalesPorProducto[s.producto] = (totalesPorProducto[s.producto] || 0) + total;

        const bandejas    = s.vueltaCompleta
            ? '<em class="badge-completa-reporte">✔ Vuelta completa</em>'
            : (s.bandejas ?? '—');
        const incompletos = s.vueltaCompleta ? '—' : (s.incompletos ?? '—');
        const filas       = s.vueltaCompleta ? '—' : (s.filas ?? '—');

        tbody.innerHTML += `
            <tr>
                <td>${s.marca || '—'}</td>
                <td>${s.linea || '—'}</td>
                <td><strong>${s.producto}</strong></td>
                <td>${filas}</td>
                <td>${bandejas}</td>
                <td>${incompletos}</td>
                <td class="total-celda">${total.toLocaleString()}</td>
                <td>${s.hora || '—'}</td>
            </tr>`;
    });

    document.getElementById('totalGeneral').innerText = totalGeneral.toLocaleString();
    renderGrafico(Object.keys(totalesPorProducto), Object.values(totalesPorProducto), totalGeneral);
}

// ======================================
//  GRÁFICO DONUT
// ======================================
function renderGrafico(labels, valores, total) {
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    if (labels.length === 0) return;

    chartInstance = new Chart(document.getElementById('graficoStock'), {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: valores,
                backgroundColor: ['#c8960c','#7a1a0a','#e8b84b','#b13009','#6b4c2a','#d4a017','#a0522d','#c46210'],
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
//  CALENDARIO
// ======================================
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
    if (nuevoAnio < CAL_ANIO_INICIO || (nuevoAnio === CAL_ANIO_INICIO && nuevoMes < CAL_MES_INICIO)) return;
    const hoy = new Date();
    if (nuevoAnio > hoy.getFullYear() || (nuevoAnio === hoy.getFullYear() && nuevoMes > hoy.getMonth())) return;
    calMes  = nuevoMes;
    calAnio = nuevoAnio;
    renderCalendario();
}

function renderCalendario() {
    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    document.getElementById('calTitulo').textContent = `${meses[calMes]} ${calAnio}`;

    const grid      = document.getElementById('calGrid');
    grid.innerHTML  = '';
    const primerDia = new Date(calAnio, calMes, 1).getDay();
    const diasEnMes = new Date(calAnio, calMes + 1, 0).getDate();
    const hoy       = new Date();

    for (let i = 0; i < primerDia; i++) {
        const v = document.createElement('div');
        v.className = 'cal-dia vacio';
        grid.appendChild(v);
    }

    for (let d = 1; d <= diasEnMes; d++) {
        const cell     = document.createElement('div');
        cell.className = 'cal-dia';
        const fechaStr = `${d}-${calMes + 1}-${calAnio}`;
        const esHoy    = d === hoy.getDate() && calMes === hoy.getMonth() && calAnio === hoy.getFullYear();
        const esFutura = new Date(calAnio, calMes, d) > hoy;

        const numEl = document.createElement('div');
        numEl.className   = 'dia-num';
        numEl.textContent = d;
        cell.appendChild(numEl);

        if (esHoy)    cell.classList.add('hoy');
        if (esFutura) cell.classList.add('futura');
        if (fechaStr === fechaSeleccionada) cell.classList.add('seleccionado');

        if (!esFutura) {
            cell.onclick = () => seleccionarFecha(fechaStr, cell, d);
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
    document.querySelectorAll('.cal-dia.seleccionado').forEach(c => c.classList.remove('seleccionado'));
    cell.classList.add('seleccionado');
    fechaSeleccionada = fecha;

    document.getElementById('fechaReporte').innerText = `Fecha: ${fecha.replace(/-/g, '/')}`;

    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const info  = document.getElementById('fechaInfo');
    if (info) {
        info.classList.add('visible');
        document.getElementById('fechaInfoTexto').textContent = `${d} de ${meses[calMes]} de ${calAnio}`;
    }

    const turnoActv = document.querySelector('.btn-turno.active');
    const turno = turnoActv ? turnoActv.id.replace('btn-', '') : 'manana';
    cargarTurnoPorFecha(turno, fecha);
}

document.querySelectorAll('.btn-turno').forEach(btn => {
    btn.addEventListener('click', () => {
        const turno = btn.id.replace('btn-', '');
        if (fechaSeleccionada) cargarTurnoPorFecha(turno, fechaSeleccionada);
    });
});

// ======================================
//  GOOGLE DRIVE
// ======================================
const GOOGLE_CLIENT_ID = '49698744393-spo4nq0naa9fbahm628h4c4v3vpc0d4e.apps.googleusercontent.com';
const GOOGLE_API_KEY   = 'AIzaSyDyxsOnSb7KXLuUcbpwdECzYqTLi98Fpmw';
const FOLDER_RAIZ_ID   = '1mlZ9hZNZ24c0gi7PwMGeOsUVOmI7sMtk';
const SCOPES           = 'https://www.googleapis.com/auth/drive.file';

let tokenClient;
let gapiInited      = false;
let gisInited       = false;
let driveAutorizado = false;

window.gapiLoaded = function () {
    gapi.load('client', async () => {
        await gapi.client.init({
            apiKey: GOOGLE_API_KEY,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        });
        gapiInited = true;
    });
};

window.gisLoaded = function () {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: (resp) => {
            if (!resp.error) {
                driveAutorizado = true;
                ejecutarGuardadoDrive();
            } else {
                mostrarEstadoDrive('❌ Autorización cancelada.', 'error');
            }
        },
    });
    gisInited = true;
};

function mostrarEstadoDrive(mensaje, tipo) {
    const el = document.getElementById('drive-status');
    el.style.display = 'block';
    el.textContent   = mensaje;
    el.className     = `drive-status no-print drive-status-${tipo}`;
    if (tipo === 'ok') setTimeout(() => { el.style.display = 'none'; }, 5000);
}

window.guardarEnDrive = function () {
    if (!gapiInited || !gisInited) {
        mostrarEstadoDrive('⏳ Inicializando Google Drive, intentá en unos segundos...', 'info');
        return;
    }
    if (!driveAutorizado) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        ejecutarGuardadoDrive();
    }
};

async function ejecutarGuardadoDrive() {
    const btn = document.getElementById('btn-drive');
    btn.disabled    = true;
    btn.textContent = '☁️ Guardando...';
    mostrarEstadoDrive('⏳ Guardando en Drive...', 'info');

    try {
        const snap      = await db.ref(`historial/${fechaActiva}/sobrantes`).once('value');
        const sobrantes = snap.val();

        const snapSup    = await db.ref(`historial/${fechaActiva}/supervisores/${turnoActivo}`).once('value');
        const supervisor = snapSup.val() || sessionStorage.getItem('supervisor') || '—';

        if (!sobrantes) {
            mostrarEstadoDrive('⚠️ No hay datos para guardar en este turno.', 'error');
            btn.disabled    = false;
            btn.textContent = '☁️ Guardar en Drive';
            return;
        }

        const meses         = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
        const partes        = fechaActiva.split('-');
        const nombreMes     = meses[parseInt(partes[1]) - 1];
        const anio          = partes[2];
        const turnoLabel    = TURNOS[turnoActivo].label;
        const nombreArchivo = `${turnoLabel} - ${fechaActiva}`;

        const carpetaAnio  = await obtenerOCrearCarpeta(anio,        FOLDER_RAIZ_ID);
        const carpetaMes   = await obtenerOCrearCarpeta(nombreMes,   carpetaAnio);
        const carpetaFecha = await obtenerOCrearCarpeta(fechaActiva, carpetaMes);

        const htmlContent = generarHTMLPlanilla(turnoActivo, fechaActiva, sobrantes, supervisor);
        const blob  = new Blob([htmlContent], { type: 'text/html' });
        const token = gapi.client.getToken().access_token;

        const archivoExistente = await buscarArchivo(nombreArchivo, carpetaFecha);

        if (archivoExistente) {
            await fetch(`https://www.googleapis.com/upload/drive/v3/files/${archivoExistente}?uploadType=media`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'text/html' },
                body: blob
            });
        } else {
            const formData = new FormData();
            formData.append('metadata', new Blob([JSON.stringify({
                name: nombreArchivo,
                parents: [carpetaFecha],
                mimeType: 'application/vnd.google-apps.document'
            })], { type: 'application/json' }));
            formData.append('file', blob);

            await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&convert=true', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
        }

        mostrarEstadoDrive(`✅ Guardado: ${anio} / ${nombreMes} / ${fechaActiva} / ${nombreArchivo}`, 'ok');

    } catch (err) {
        console.error('Error Drive:', err);
        mostrarEstadoDrive('❌ Error al guardar en Drive. Revisá la consola.', 'error');
    } finally {
        btn.disabled    = false;
        btn.textContent = '☁️ Guardar en Drive';
    }
}

async function obtenerOCrearCarpeta(nombre, parentId) {
    const res = await gapi.client.drive.files.list({
        q: `name='${nombre}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
        fields: 'files(id)',
    });
    if (res.result.files.length > 0) return res.result.files[0].id;
    const crear = await gapi.client.drive.files.create({
        resource: { name: nombre, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] },
        fields: 'id',
    });
    return crear.result.id;
}

async function buscarArchivo(nombre, carpetaId) {
    const res = await gapi.client.drive.files.list({
        q: `name='${nombre}' and '${carpetaId}' in parents and trashed=false`,
        fields: 'files(id)',
    });
    return res.result.files.length > 0 ? res.result.files[0].id : null;
}

function generarHTMLPlanilla(turno, fecha, sobrantes, supervisorNombre) {
    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const partes = fecha.split('-');
    const fechaLegible = `${partes[0]} de ${meses[parseInt(partes[1]) - 1]} de ${partes[2]}`;
    const turnoLabel   = TURNOS[turno].label;

    const registros = Object.values(sobrantes).filter(s => perteneceAlTurno(s.hora, turno));

    let totalGeneral = 0;
    const filas = registros.map(s => {
        totalGeneral += s.total || 0;
        const bandejasTexto = s.vueltaCompleta ? '✔ Vuelta completa' : (s.bandejas ?? '—');
        return `<tr>
            <td>${s.marca||'—'}</td><td>${s.linea||'—'}</td>
            <td><strong>${s.producto}</strong></td>
            <td>${s.vueltaCompleta ? '—' : (s.filas ?? '—')}</td>
            <td>${bandejasTexto}</td>
            <td>${s.vueltaCompleta ? '—' : (s.incompletos ?? '—')}</td>
            <td><strong>${(s.total||0).toLocaleString()}</strong></td>
            <td>${s.hora||'—'}</td>
        </tr>`;
    }).join('');

    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <style>
        body{font-family:Arial,sans-serif;padding:30px;color:#2a1a0a}
        h1{font-size:20px;border-bottom:3px solid #c8960c;padding-bottom:8px;margin-bottom:6px}
        .meta{font-size:13px;color:#6b4c2a;margin-bottom:12px}
        .sup{background:#f5f0e8;border-left:4px solid #c8960c;padding:8px 12px;margin-bottom:20px;font-size:14px}
        table{width:100%;border-collapse:collapse;font-size:13px}
        thead tr{background:#2a1a0a;color:white}
        th{padding:8px 10px;text-align:left;font-size:11px;text-transform:uppercase}
        tbody tr:nth-child(even){background:#f5f0e8}
        td{padding:8px 10px;border-bottom:1px solid #e8dcc8}
        tfoot tr{background:#f5f0e8;border-top:2px solid #c8960c}
        tfoot td{padding:8px 10px;font-weight:bold}
        .tv{font-size:16px;color:#7a1a0a}
    </style></head><body>
    <h1>Planilla de Control de Producción</h1>
    <div class="meta">${fechaLegible} — ${turnoLabel}</div>
    <div class="sup">⭐ Supervisor: <strong>${supervisorNombre}</strong></div>
    <table>
        <thead><tr>
            <th>Marca</th><th>Línea</th><th>Producto</th>
            <th>Filas</th><th>Band.</th><th>Paq. sueltos</th>
            <th>Total paq.</th><th>Hora</th>
        </tr></thead>
        <tbody>${filas}</tbody>
        <tfoot><tr>
            <td colspan="6" style="text-align:right">TOTAL GENERAL</td>
            <td class="tv">${totalGeneral.toLocaleString()}</td><td></td>
        </tr></tfoot>
    </table>
    </body></html>`;
}
