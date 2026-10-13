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
//  TURNO Y FECHA
// ======================================
function getTurnoActual(ahora = new Date()) {
    const min   = ahora.getHours() * 60 + ahora.getMinutes();
    if (min >= 510 && min <= 990)  return 'manana'; // 08:30 - 16:30
    if (min >= 991 || min <= 29)   return 'tarde';  // 16:31 - 00:29
    return 'noche';                                  // 00:30 - 08:29
}

// La fecha sale de la jornada (8:30 a 8:30, sábado hasta el lunes 8:30): ver jornada.js
const getFechaParaGuardar = (ahora = new Date()) => getFechaJornada(ahora);

const getFechaLista = getFechaParaGuardar;

// ======================================
//  MOMENTO DE INICIO DE CARGA
//  El turno, la hora y el día de un registro se toman de cuando el supervisor
//  EMPEZÓ a cargarlo (primer dato tocado), no de cuando apretó "Guardar".
//  Así, lo que se empieza antes de las 00:30 / 08:30 y se guarda después,
//  queda en el turno y día que corresponde.
// ======================================
let inicioCarga = null;
const CARGA_MAX_MS = 60 * 60 * 1000; // si pasó más de 1 h desde que se tocó el form, se toma como carga nueva

document.addEventListener('input',  marcarInicioCarga, true);
document.addEventListener('change', marcarInicioCarga, true);
function marcarInicioCarga(e) {
    const id = (e.target && e.target.id) || '';
    if (!/^(sel-|inp-)/.test(id)) return; // solo el formulario de carga (no el modal de edición)
    const ahora = Date.now();
    if (!inicioCarga || ahora - inicioCarga.getTime() > CARGA_MAX_MS) inicioCarga = new Date(ahora);
}
function getMomentoCarga() {
    if (inicioCarga && Date.now() - inicioCarga.getTime() <= CARGA_MAX_MS) return new Date(inicioCarga);
    return new Date();
}

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
        },
        pan: {
            label: "Pan de Molde",
            productos: {
                "Lactal Chico": { paq: 15 }
            }
        }
    }
};

// ======================================
//  MARCA → LÍNEA
// ======================================
window.actualizarLinea = function () {
    const marca       = document.getElementById('sel-marca').value;
    const selLinea    = document.getElementById('sel-linea');
    const selProducto = document.getElementById('sel-producto');

    selLinea.innerHTML = '<option value="" disabled selected>-- Línea --</option>';
    Object.entries(PRODUCTOS[marca]).forEach(([key, val]) => {
        selLinea.innerHTML += `<option value="${key}">${val.label}</option>`;
    });
    selLinea.disabled = false;
    selProducto.innerHTML = '<option value="" disabled selected>-- Producto --</option>';
    selProducto.disabled  = true;
    resetInputs();
};

// ======================================
//  LÍNEA → PRODUCTO
// ======================================
window.actualizarProducto = function () {
    const marca       = document.getElementById('sel-marca').value;
    const linea       = document.getElementById('sel-linea').value;
    const selProducto = document.getElementById('sel-producto');

    selProducto.innerHTML = '<option value="" disabled selected>-- Producto --</option>';
    Object.keys(PRODUCTOS[marca][linea].productos).forEach(nombre => {
        selProducto.innerHTML += `<option value="${nombre}">${nombre}</option>`;
    });
    selProducto.disabled = false;
    resetInputs();
};

// ======================================
//  PRODUCTO → INFO
// ======================================
window.actualizarInfo = function () {
    const marca    = document.getElementById('sel-marca').value;
    const linea    = document.getElementById('sel-linea').value;
    const producto = document.getElementById('sel-producto').value;
    const paq      = PRODUCTOS[marca][linea].productos[producto].paq;

    document.getElementById('bandeja-texto').innerHTML =
        `<strong>${producto}</strong> — ${paq} paquetes por bandeja × ${BANDEJAS_POR_FILA} bandejas por fila = <strong>${paq * BANDEJAS_POR_FILA} paq/fila</strong>`;
    document.getElementById('bandeja-info').classList.add('visible');

    ['inp-filas', 'inp-bandejas', 'inp-incompletos'].forEach(id => {
        document.getElementById(id).disabled = false;
        document.getElementById(id).value    = '';
    });
    document.getElementById('total-box').classList.remove('visible');
    document.getElementById('guardar-sobrante-btn').disabled = true;
};

// ======================================
//  CALCULAR TOTAL
// ======================================
window.calcularTotal = function () {
    const marca    = document.getElementById('sel-marca').value;
    const linea    = document.getElementById('sel-linea').value;
    const producto = document.getElementById('sel-producto').value;
    if (!marca || !linea || !producto) return;

    const paq         = PRODUCTOS[marca][linea].productos[producto].paq;
    const filas       = parseInt(document.getElementById('inp-filas').value)       || 0;
    const bandejas    = parseInt(document.getElementById('inp-bandejas').value)    || 0;
    const incompletos = parseInt(document.getElementById('inp-incompletos').value) || 0;
    const total = (filas * BANDEJAS_POR_FILA * paq) + (bandejas * paq) + incompletos;

    document.getElementById('total-numero').textContent = total.toLocaleString();
    document.getElementById('total-detalle').textContent =
        `${filas} filas × ${BANDEJAS_POR_FILA} × ${paq} paq  +  ${bandejas} bandejas × ${paq}  +  ${incompletos} sueltos`;
    document.getElementById('total-box').classList.add('visible');
    document.getElementById('guardar-sobrante-btn').disabled = (filas === 0 && bandejas === 0 && incompletos === 0);
};

// ======================================
//  RESET
// ======================================
function resetInputs() {
    document.getElementById('bandeja-info').classList.remove('visible');
    document.getElementById('total-box').classList.remove('visible');
    ['inp-filas', 'inp-bandejas', 'inp-incompletos'].forEach(id => {
        document.getElementById(id).disabled = true;
        document.getElementById(id).value    = '';
    });
    document.getElementById('guardar-sobrante-btn').disabled = true;
}

// ======================================
//  GUARDAR EN FIREBASE
// ======================================
document.getElementById('guardar-sobrante-btn').onclick = function () {
    const marca       = document.getElementById('sel-marca');
    const linea       = document.getElementById('sel-linea');
    const producto    = document.getElementById('sel-producto').value;
    const paq         = PRODUCTOS[marca.value][linea.value].productos[producto].paq;
    const filas       = parseInt(document.getElementById('inp-filas').value)       || 0;
    const bandejas    = parseInt(document.getElementById('inp-bandejas').value)    || 0;
    const incompletos = parseInt(document.getElementById('inp-incompletos').value) || 0;
    const total       = (filas * BANDEJAS_POR_FILA * paq) + (bandejas * paq) + incompletos;
    const marcaLabel  = marca.value === 'romero' ? 'Romero' : 'The Roxy';
    const lineaLabel  = PRODUCTOS[marca.value][linea.value].label;

    const supervisorActual = sessionStorage.getItem('supervisor') || 'No asignado';
    const fmtHora = (d) => d.toLocaleTimeString('es-AR', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });

    const momentoCarga = getMomentoCarga();   // cuándo se empezó a cargar
    const horaActual   = fmtHora(momentoCarga);
    const turnoActual  = getTurnoActual(momentoCarga);
    const fechaGuardar = getFechaParaGuardar(momentoCarga);

    const nuevoRef = db.ref(`historial/${fechaGuardar}/sobrantes`).push({
        marca: marcaLabel, linea: lineaLabel, producto,
        paqPorBandeja: paq, filas, bandejas, incompletos,
        total, supervisor: supervisorActual,
        turno: turnoActual, hora: horaActual, horaGuardado: fmtHora(new Date())
    });

    // Registra en AppStock en el momento (si falla, AppStock lo toma después como respaldo).
    StockSync.registrarSobrante({
        id: nuevoRef.key, fecha: fechaGuardar,
        marca: marcaLabel, linea: lineaLabel, producto,
        paqPorBandeja: paq, total, hora: horaActual
    });

    db.ref(`historial/${fechaGuardar}/supervisores/${turnoActual}`).set(supervisorActual);

    inicioCarga = null;

    // Reset form
    document.getElementById('sel-marca').value      = '';
    document.getElementById('sel-linea').innerHTML  = '<option value="" disabled selected>-- Línea --</option>';
    document.getElementById('sel-linea').disabled   = true;
    document.getElementById('sel-producto').innerHTML = '<option value="" disabled selected>-- Producto --</option>';
    document.getElementById('sel-producto').disabled  = true;
    resetInputs();
};

// ======================================
//  MODAL EDICIÓN SOBRANTE
// ======================================
function abrirModalSobrante(id, s) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-sobrante';

    // Armar opciones de marca
    const marcaOpts = [
        { val: 'romero', label: 'Romero' },
        { val: 'roxy',   label: 'The Roxy' }
    ].map(m => `<option value="${m.val}" ${s.marca === m.label ? 'selected' : ''}>${m.label}</option>`).join('');

    // Armar opciones de línea según marca guardada
    const marcaKey = s.marca === 'Romero' ? 'romero' : 'roxy';
    const lineaOpts = Object.entries(PRODUCTOS[marcaKey]).map(([key, val]) =>
        `<option value="${key}" ${s.linea === val.label ? 'selected' : ''}>${val.label}</option>`
    ).join('');

    // Armar opciones de producto
    const lineaKey = Object.keys(PRODUCTOS[marcaKey]).find(k => PRODUCTOS[marcaKey][k].label === s.linea) || Object.keys(PRODUCTOS[marcaKey])[0];
    const productoOpts = Object.keys(PRODUCTOS[marcaKey][lineaKey].productos).map(p =>
        `<option ${s.producto === p ? 'selected' : ''}>${p}</option>`
    ).join('');

    overlay.innerHTML = `
        <div class="modal-box">
            <h3>✏️ Editar Producción</h3>
            <div class="modal-form">
                <label>Marca</label>
                <select id="edit-s-marca" onchange="actualizarModalLinea()">${marcaOpts}</select>

                <label>Línea</label>
                <select id="edit-s-linea" onchange="actualizarModalProducto()">${lineaOpts}</select>

                <label>Producto</label>
                <select id="edit-s-producto" onchange="recalcularModalTotal()">${productoOpts}</select>

                <label>Filas completas</label>
                <input type="number" id="edit-s-filas" value="${s.filas || 0}" min="0" oninput="recalcularModalTotal()">

                <label>Bandejas sueltas</label>
                <input type="number" id="edit-s-bandejas" value="${s.bandejas || 0}" min="0" oninput="recalcularModalTotal()">

                <label>Paquetes sueltos</label>
                <input type="number" id="edit-s-incompletos" value="${s.incompletos || 0}" min="0" oninput="recalcularModalTotal()">

                <div class="modal-total-box" id="modal-total-box">
                    Total: <strong id="modal-total-num">—</strong> paq.
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-modal-guardar" onclick="guardarSobrante('${id}')">💾 Guardar</button>
                <button class="btn-modal-cancelar" onclick="cerrarModal()">Cancelar</button>
            </div>
        </div>`;

    document.body.appendChild(overlay);
    recalcularModalTotal();
}

window.actualizarModalLinea = function () {
    const marcaKey = document.getElementById('edit-s-marca').value;
    const selLinea = document.getElementById('edit-s-linea');
    selLinea.innerHTML = '';
    Object.entries(PRODUCTOS[marcaKey]).forEach(([key, val]) => {
        selLinea.innerHTML += `<option value="${key}">${val.label}</option>`;
    });
    actualizarModalProducto();
};

window.actualizarModalProducto = function () {
    const marcaKey  = document.getElementById('edit-s-marca').value;
    const lineaKey  = document.getElementById('edit-s-linea').value;
    const selProd   = document.getElementById('edit-s-producto');
    selProd.innerHTML = '';
    Object.keys(PRODUCTOS[marcaKey][lineaKey].productos).forEach(p => {
        selProd.innerHTML += `<option>${p}</option>`;
    });
    recalcularModalTotal();
};

window.recalcularModalTotal = function () {
    const marcaKey    = document.getElementById('edit-s-marca').value;
    const lineaKey    = document.getElementById('edit-s-linea').value;
    const producto    = document.getElementById('edit-s-producto').value;
    if (!marcaKey || !lineaKey || !producto) return;

    const paq         = PRODUCTOS[marcaKey][lineaKey].productos[producto]?.paq || 0;
    const filas       = parseInt(document.getElementById('edit-s-filas').value)       || 0;
    const bandejas    = parseInt(document.getElementById('edit-s-bandejas').value)    || 0;
    const incompletos = parseInt(document.getElementById('edit-s-incompletos').value) || 0;
    const total = (filas * BANDEJAS_POR_FILA * paq) + (bandejas * paq) + incompletos;
    document.getElementById('modal-total-num').textContent = total.toLocaleString();
};

window.guardarSobrante = async function (id) {
    const marcaKey    = document.getElementById('edit-s-marca').value;
    const lineaKey    = document.getElementById('edit-s-linea').value;
    const producto    = document.getElementById('edit-s-producto').value;
    const filas       = parseInt(document.getElementById('edit-s-filas').value)       || 0;
    const bandejas    = parseInt(document.getElementById('edit-s-bandejas').value)    || 0;
    const incompletos = parseInt(document.getElementById('edit-s-incompletos').value) || 0;
    const paq         = PRODUCTOS[marcaKey][lineaKey].productos[producto]?.paq || 0;
    const total       = (filas * BANDEJAS_POR_FILA * paq) + (bandejas * paq) + incompletos;
    const marcaLabel  = marcaKey === 'romero' ? 'Romero' : 'The Roxy';
    const lineaLabel  = PRODUCTOS[marcaKey][lineaKey].label;

    const fechaEdit = fechaActual;
    const refS = db.ref(`historial/${fechaEdit}/sobrantes/${id}`);
    const viejo = (await refS.once('value')).val();
    if (!viejo) { cerrarModal(); return; }

    const cambios = {
        marca: marcaLabel, linea: lineaLabel, producto,
        paqPorBandeja: paq, filas, bandejas, incompletos, total
    };
    cerrarModal();
    await refS.update(cambios);

    // El stock en AppStock se ajusta con la diferencia.
    try {
        await StockSync.editarSobrante({ id, fecha: fechaEdit, viejo, nuevo: { ...viejo, ...cambios } });
    } catch (e) {
        alert('El registro se guardó, pero no se pudo actualizar el stock en AppStock: ' + (e.message || e) + '\nAvisá al administrador.');
    }
};

window.cerrarModal = function () {
    const m = document.getElementById('modal-sobrante') || document.getElementById('modal-tarea');
    if (m) m.remove();
};

// ======================================
//  ESCUCHAR EN TIEMPO REAL
// ======================================
let fechaActual = getFechaLista();
let refActual = null;

const renderSobrantes = (snapshot) => {
    const data  = snapshot.val();
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
                    <span class="item-detalle">
                        ${s.filas} filas × ${BANDEJAS_POR_FILA} × ${s.paqPorBandeja} paq
                        + ${s.bandejas} bandejas × ${s.paqPorBandeja}
                        + ${s.incompletos} sueltos — ${s.hora}
                    </span>
                </div>
                <div class="item-right">
                    <span class="item-total">${s.total.toLocaleString()} paq.</span>
                    <button class="btn-editar" onclick='abrirModalSobrante("${id}", ${JSON.stringify(s)})'>✏️</button>
                    <button class="btn-eliminar" onclick="eliminar('${id}')">❌</button>
                </div>
            </li>`;
    });
};

function suscribir() {
    if (refActual) refActual.off('value');
    fechaActual = getFechaLista();
    refActual = db.ref(`historial/${fechaActual}/sobrantes`);
    refActual.on('value', renderSobrantes);
}
suscribir();

// Si la página queda abierta al cruzar las 08:30 (cambio de "día de producción"),
// re-suscribe el listener a la fecha nueva. Todo lo que escribe usa la misma fecha que se está mostrando.
const refrescarFecha = () => {
    if (getFechaLista() !== fechaActual) suscribir();
};
setInterval(refrescarFecha, 30000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refrescarFecha(); });

// ======================================
//  ELIMINAR
// ======================================
window.eliminar = (id) => {
    if (confirm("¿Eliminar este registro?")) {
        StockSync.borrarSobrante(fechaActual, id).catch(e =>
            alert('No se pudo eliminar: no se pudo actualizar el stock en AppStock (' + (e.message || e) + '). Reintentá.'));
    }
};

window.abrirModalSobrante = abrirModalSobrante;
