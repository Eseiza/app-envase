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

const getFechaHoy = () => new Date().toLocaleDateString('es-AR').replace(/\//g, '-');

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

    db.ref(`historial/${getFechaHoy()}/sobrantes`).push({
        marca: marcaLabel,
        linea: lineaLabel,
        producto,
        paqPorBandeja: paq,
        filas,
        bandejas,
        incompletos,
        total,
        hora: new Date().toLocaleTimeString()
    });

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
