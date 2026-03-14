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

const getFechaHoy = () => {
    const hoy = new Date();
    return `${hoy.getDate()}-${hoy.getMonth() + 1}-${hoy.getFullYear()}`;
};

const BANDEJAS_POR_FILA = 14;

const PRODUCTOS = {
    romero: {
        bolleria: {
            label: "Bollería",
            productos: {
                "Pancho":      { paq: 16 },
                "Hamburguesa": { paq: 21 },
                "Super":       { paq: 16 },
                "Max":         { paq: 16 }
            }
        },
        pan: {
            label: "Pan de Molde",
            productos: {
                "Lactal Familiar":  { paq: 10 },
                "Lactal Chico":     { paq: 15 },
                "Salvado Familiar": { paq: 10 },
                "Salvado Chico":    { paq: 15 },
                "Integral":         { paq: 15 },
                "Multicereal":      { paq: 15 }
            }
        }
    },
    roxy: {
        bolleria: {
            label: "Bollería",
            productos: {
                "Pancho":      { paq: 16 },
                "Hamburguesa": { paq: 15 },
                "Super":       { paq: 16 },
                "Max":         { paq: 16 }
            }
        }
    }
};

// MARCA → LÍNEA
window.actualizarLinea = function() {
    const marca = document.getElementById('sel-marca').value;
    const selLinea = document.getElementById('sel-linea');
    const selProducto = document.getElementById('sel-producto');

    selLinea.innerHTML = '<option value="" disabled selected>-- Línea --</option>';
    Object.entries(PRODUCTOS[marca]).forEach(([key, val]) => {
        selLinea.innerHTML += `<option value="${key}">${val.label}</option>`;
    });
    selLinea.disabled = false;

    selProducto.innerHTML = '<option value="" disabled selected>-- Producto --</option>';
    selProducto.disabled = true;
    resetInputs();
};

// LÍNEA → PRODUCTO
window.actualizarProducto = function() {
    const marca = document.getElementById('sel-marca').value;
    const linea = document.getElementById('sel-linea').value;
    const selProducto = document.getElementById('sel-producto');

    selProducto.innerHTML = '<option value="" disabled selected>-- Producto --</option>';
    Object.keys(PRODUCTOS[marca][linea].productos).forEach(nombre => {
        selProducto.innerHTML += `<option value="${nombre}">${nombre}</option>`;
    });
    selProducto.disabled = false;
    resetInputs();
};

// PRODUCTO → INFO
window.actualizarInfo = function() {
    const marca = document.getElementById('sel-marca').value;
    const linea = document.getElementById('sel-linea').value;
    const producto = document.getElementById('sel-producto').value;
    const paq = PRODUCTOS[marca][linea].productos[producto].paq;

    document.getElementById('bandeja-texto').innerHTML =
        `<strong>${producto}</strong> — ${paq} paquetes por bandeja × ${BANDEJAS_POR_FILA} bandejas por fila = <strong>${paq * BANDEJAS_POR_FILA} paq/fila</strong>`;
    document.getElementById('bandeja-info').classList.add('visible');

    document.getElementById('inp-filas').disabled = false;
    document.getElementById('inp-bandejas').disabled = false;
    document.getElementById('inp-incompletos').disabled = false;
    document.getElementById('inp-filas').value = '';
    document.getElementById('inp-bandejas').value = '';
    document.getElementById('inp-incompletos').value = '';
    document.getElementById('total-box').classList.remove('visible');
    document.getElementById('guardar-sobrante-btn').disabled = true;
};

// CALCULAR TOTAL
window.calcularTotal = function() {
    const marca = document.getElementById('sel-marca').value;
    const linea = document.getElementById('sel-linea').value;
    const producto = document.getElementById('sel-producto').value;
    if (!marca || !linea || !producto) return;

    const paq = PRODUCTOS[marca][linea].productos[producto].paq;
    const filas = parseInt(document.getElementById('inp-filas').value) || 0;
    const bandejas = parseInt(document.getElementById('inp-bandejas').value) || 0;
    const incompletos = parseInt(document.getElementById('inp-incompletos').value) || 0;
    const total = (filas * BANDEJAS_POR_FILA * paq) + (bandejas * paq) + incompletos;

    document.getElementById('total-numero').textContent = total.toLocaleString();
    document.getElementById('total-detalle').textContent =
        `${filas} filas × ${BANDEJAS_POR_FILA} × ${paq} paq  +  ${bandejas} bandejas × ${paq}  +  ${incompletos} sueltos`;
    document.getElementById('total-box').classList.add('visible');
    document.getElementById('guardar-sobrante-btn').disabled = (filas === 0 && bandejas === 0 && incompletos === 0);
};

// RESET
function resetInputs() {
    document.getElementById('bandeja-info').classList.remove('visible');
    document.getElementById('total-box').classList.remove('visible');
    ['inp-filas', 'inp-bandejas', 'inp-incompletos'].forEach(id => {
        document.getElementById(id).disabled = true;
        document.getElementById(id).value = '';
    });
    document.getElementById('guardar-sobrante-btn').disabled = true;
}

// GUARDAR
document.getElementById('guardar-sobrante-btn').onclick = function() {
    const marca = document.getElementById('sel-marca');
    const linea = document.getElementById('sel-linea');
    const producto = document.getElementById('sel-producto').value;
    const paq = PRODUCTOS[marca.value][linea.value].productos[producto].paq;
    const filas = parseInt(document.getElementById('inp-filas').value) || 0;
    const bandejas = parseInt(document.getElementById('inp-bandejas').value) || 0;
    const incompletos = parseInt(document.getElementById('inp-incompletos').value) || 0;
    const total = (filas * BANDEJAS_POR_FILA * paq) + (bandejas * paq) + incompletos;
    const marcaLabel = marca.value === 'romero' ? 'Romero' : 'The Roxy';
    const lineaLabel = PRODUCTOS[marca.value][linea.value].label;

    const supervisorActual = sessionStorage.getItem('supervisor') || 'No asignado';
    const horaActual = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    // Determinar turno actual
    const horaNum = new Date().getHours();
    let turnoActual = 'noche';
    if (horaNum >= 5  && horaNum < 13) turnoActual = 'manana';
    else if (horaNum >= 13 && horaNum < 22) turnoActual = 'tarde';

    db.ref(`historial/${getFechaHoy()}/sobrantes`).push({
        marca: marcaLabel,
        linea: lineaLabel,
        producto,
        paqPorBandeja: paq,
        filas,
        bandejas,
        incompletos,
        total,
        supervisor: supervisorActual,
        turno: turnoActual,
        hora: horaActual
    });

    // Guardar supervisor del turno en nodo separado para el historial
    db.ref(`historial/${getFechaHoy()}/supervisores/${turnoActual}`).set(supervisorActual);

    // Auto guardar planilla en Drive
    autoGuardarEnDrive(turnoActual, getFechaHoy(), supervisorActual);

    // Reset form
    document.getElementById('sel-marca').value = '';
    document.getElementById('sel-linea').innerHTML = '<option value="" disabled selected>-- Línea --</option>';
    document.getElementById('sel-linea').disabled = true;
    document.getElementById('sel-producto').innerHTML = '<option value="" disabled selected>-- Producto --</option>';
    document.getElementById('sel-producto').disabled = true;
    resetInputs();
};

// ESCUCHAR EN TIEMPO REAL
db.ref(`historial/${getFechaHoy()}/sobrantes`).on('value', (snapshot) => {
    const data = snapshot.val();
    const lista = document.getElementById('taskList');
    lista.innerHTML = "";

    if (!data) {
        lista.innerHTML = '<li class="vacio">No hay producción registrada hoy.</li>';
        return;
    }

    Object.entries(data).forEach(([id, s]) => {
        lista.innerHTML += `
            <li>
                <div class="item-info">
                    <span class="item-marca">${s.marca} — ${s.linea}</span>
                    <span>${s.producto}</span>
                    <span class="item-detalle">${s.filas} filas × ${BANDEJAS_POR_FILA} × ${s.paqPorBandeja} paq  +  ${s.bandejas} bandejas × ${s.paqPorBandeja}  +  ${s.incompletos} sueltos — ${s.hora}</span>
                </div>
                <div class="item-right">
                    <span class="item-total">${s.total.toLocaleString()} paq.</span>
                    <button class="btn-eliminar" onclick="eliminar('${id}')">❌</button>
                </div>
            </li>`;
    });
});

// ELIMINAR
window.eliminar = (id) => {
    if (confirm("¿Eliminar este registro?")) {
        db.ref(`historial/${getFechaHoy()}/sobrantes/${id}`).remove();
    }
};

// ======================================
//  GOOGLE DRIVE - AUTO GUARDADO
// ======================================

// ⚠️ REEMPLAZÁ ESTOS VALORES CON LOS TUYOS (ver guía)
const GOOGLE_CLIENT_ID = 'TU_CLIENT_ID_AQUI';
const GOOGLE_API_KEY   = 'TU_API_KEY_AQUI';
const FOLDER_RAIZ_ID   = 'TU_FOLDER_ID_AQUI';

const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let tokenClient;
let gapiInited = false;
let gisInited  = false;
let driveAutorizado = false;

// Inicializar GAPI
function gapiLoaded() {
    gapi.load('client', async () => {
        await gapi.client.init({
            apiKey: GOOGLE_API_KEY,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        });
        gapiInited = true;
    });
}

// Inicializar GIS
function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: (resp) => {
            if (!resp.error) driveAutorizado = true;
        },
    });
    gisInited = true;
}

window.addEventListener('load', () => {
    if (typeof gapi !== 'undefined') gapiLoaded();
    if (typeof google !== 'undefined') gisLoaded();
});

// Obtener o crear carpeta en Drive
async function obtenerOCrearCarpeta(nombre, parentId) {
    const res = await gapi.client.drive.files.list({
        q: `name='${nombre}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
        fields: 'files(id)',
    });
    if (res.result.files.length > 0) return res.result.files[0].id;

    const crear = await gapi.client.drive.files.create({
        resource: {
            name: nombre,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId],
        },
        fields: 'id',
    });
    return crear.result.id;
}

// Buscar archivo existente en carpeta
async function buscarArchivo(nombre, carpetaId) {
    const res = await gapi.client.drive.files.list({
        q: `name='${nombre}' and '${carpetaId}' in parents and trashed=false`,
        fields: 'files(id)',
    });
    return res.result.files.length > 0 ? res.result.files[0].id : null;
}

// Generar HTML de la planilla
function generarHTMLPlanilla(turno, fecha, sobrantes, supervisorNombre) {
    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const partes = fecha.split('-');
    const fechaLegible = `${partes[0]} de ${meses[parseInt(partes[1]) - 1]} de ${partes[2]}`;
    const turnoLabel = { manana: 'Turno Mañana', tarde: 'Turno Tarde', noche: 'Turno Noche' }[turno] || turno;

    const { inicio, fin } = { manana: {inicio:5,fin:13}, tarde: {inicio:13,fin:22}, noche: {inicio:22,fin:5} }[turno];

    const registros = Object.values(sobrantes).filter(s => {
        if (!s.hora) return false;
        const h = parseInt(s.hora.split(':')[0], 10);
        if (turno === 'noche') return h >= 22 || h < 5;
        return h >= inicio && h < fin;
    });

    let totalGeneral = 0;
    const filas = registros.map(s => {
        totalGeneral += s.total || 0;
        return `<tr>
            <td>${s.marca||'—'}</td><td>${s.linea||'—'}</td>
            <td><strong>${s.producto}</strong></td>
            <td>${s.filas??'—'}</td><td>${s.bandejas??'—'}</td>
            <td>${s.incompletos??'—'}</td>
            <td><strong>${(s.total||0).toLocaleString()}</strong></td>
            <td>${s.hora||'—'}</td>
        </tr>`;
    }).join('');

    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <style>
        body{font-family:Arial,sans-serif;padding:30px;color:#2a1a0a}
        h1{font-size:20px;border-bottom:3px solid #c8960c;padding-bottom:8px}
        .meta{font-size:13px;color:#6b4c2a;margin-bottom:16px}
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
    <div class="sup">⭐ Supervisor: <strong>${supervisorNombre||'—'}</strong></div>
    <table>
        <thead><tr><th>Marca</th><th>Línea</th><th>Producto</th><th>Filas</th><th>Band.</th><th>Paq. sueltos</th><th>Total paq.</th><th>Hora</th></tr></thead>
        <tbody>${filas}</tbody>
        <tfoot><tr><td colspan="6" style="text-align:right">TOTAL GENERAL</td><td class="tv">${totalGeneral.toLocaleString()}</td><td></td></tr></tfoot>
    </table>
    </body></html>`;
}

// Auto guardar en Drive luego de cada sobrante
async function autoGuardarEnDrive(turno, fecha, supervisorNombre) {
    if (!gapiInited || !gisInited) return;

    // Solicitar autorización si no la tiene
    if (!driveAutorizado) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
        // Esperar hasta que se autorice
        await new Promise(resolve => {
            const check = setInterval(() => {
                if (driveAutorizado) { clearInterval(check); resolve(); }
            }, 500);
        });
    }

    try {
        // Leer todos los sobrantes del día desde Firebase
        const snap = await db.ref(`historial/${fecha}/sobrantes`).once('value');
        const sobrantes = snap.val();
        if (!sobrantes) return;

        const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
        const partes = fecha.split('-');
        const nombreMes = meses[parseInt(partes[1]) - 1];
        const anio = partes[2];
        const turnoLabel = { manana: 'Turno Mañana', tarde: 'Turno Tarde', noche: 'Turno Noche' }[turno];
        const nombreArchivo = `${turnoLabel} - ${fecha}`;

        // Crear estructura de carpetas
        const carpetaAnio  = await obtenerOCrearCarpeta(anio, FOLDER_RAIZ_ID);
        const carpetaMes   = await obtenerOCrearCarpeta(nombreMes, carpetaAnio);
        const carpetaFecha = await obtenerOCrearCarpeta(fecha, carpetaMes);

        const htmlContent = generarHTMLPlanilla(turno, fecha, sobrantes, supervisorNombre);
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const token = gapi.client.getToken().access_token;

        // Buscar si ya existe el archivo
        const archivoExistente = await buscarArchivo(nombreArchivo, carpetaFecha);

        if (archivoExistente) {
            // Actualizar archivo existente
            await fetch(`https://www.googleapis.com/upload/drive/v3/files/${archivoExistente}?uploadType=media`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'text/html' },
                body: blob
            });
        } else {
            // Crear archivo nuevo
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

        console.log(`✅ Drive actualizado: ${anio}/${nombreMes}/${fecha}/${nombreArchivo}`);

    } catch (err) {
        console.error('Error al guardar en Drive:', err);
    }
    }
