if (sessionStorage.getItem('autenticado') !== 'true') {
    window.location.href = "index.html";
}

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

let miGrafico;

// ✅ NUEVO: Mostrar el supervisor de turno
const supervisor = sessionStorage.getItem('supervisor');
const supervisorEl = document.getElementById('supervisor-nombre');
if (supervisor && supervisorEl) {
    supervisorEl.textContent = supervisor;
} else if (supervisorEl) {
    supervisorEl.textContent = 'No asignado';
}

// PRODUCTOS POR CATEGORÍA
const productosPorCategoria = {
    bolleria: ["Pancho", "Super", "Hamburguesa", "Max"],
    pan: ["Lactal Familiar", "Lactal Chico", "Salvado Familiar", "Salvado Chico", "Integral", "Multicereal"]
};

const categoriasPorMarca = {
    roxy: ["bolleria"],
    romero: ["bolleria", "pan"]
};

const categoriaLabels = {
    bolleria: "Bollería",
    pan: "Pan"
};

const selectMarca = document.getElementById('task-marca');
const selectCategoria = document.getElementById('task-categoria');
const selectProducto = document.getElementById('task-category');

// MARCA → LÍNEA
selectMarca.addEventListener('change', function() {
    const categorias = categoriasPorMarca[this.value] || [];

    selectCategoria.innerHTML = '<option value="" disabled selected>-- Línea --</option>';
    categorias.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = categoriaLabels[c];
        selectCategoria.appendChild(opt);
    });
    selectCategoria.disabled = false;

    // Resetear producto
    selectProducto.innerHTML = '<option value="" disabled selected>-- Producto --</option>';
    selectProducto.disabled = true;
});

// CATEGORÍA → PRODUCTO
selectCategoria.addEventListener('change', function() {
    const productos = productosPorCategoria[this.value] || [];

    selectProducto.innerHTML = '<option value="" disabled selected>-- Selecciona un Producto --</option>';
    productos.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.toLowerCase().replace(/ /g, '-');
        opt.textContent = p;
        selectProducto.appendChild(opt);
    });
    selectProducto.disabled = false;
});

// AGREGAR ORDEN
document.getElementById('add-task-btn').onclick = function() {
    const marca = selectMarca.options[selectMarca.selectedIndex].text;
    const categoria = selectCategoria.options[selectCategoria.selectedIndex].text;
    const producto = selectProducto.options[selectProducto.selectedIndex].text;
    const cantidad = document.getElementById('taskTitle').value;
    const vuelta = document.getElementById('taskVuelta').value;

    if (!vuelta || selectMarca.value === "" || selectCategoria.value === "" || selectProducto.value === "" || !cantidad) {
        return alert("Faltan datos de la orden");
    }

    db.ref(`historial/${getFechaHoy()}/tareas`).push({
        marca, categoria, producto, cantidad, vuelta, completado: false
    });

    // Reset form
    document.getElementById('taskTitle').value = "";
    document.getElementById('taskVuelta').value = "";
    selectMarca.value = "";
    selectCategoria.innerHTML = '<option value="" disabled selected>-- Línea --</option>';
    selectCategoria.disabled = true;
    selectProducto.innerHTML = '<option value="" disabled selected>-- Producto --</option>';
    selectProducto.disabled = true;
};

// ACTUALIZACIÓN EN TIEMPO REAL
db.ref(`historial/${getFechaHoy()}`).on('value', (snapshot) => {
    const data = snapshot.val() || { tareas: {}, sobrantes: {} };
    
    // Lista de Pedidos
    const listaT = document.getElementById('taskList');
    listaT.innerHTML = "";
    if (data.tareas) {
        Object.keys(data.tareas).forEach(id => {
            const t = data.tareas[id];
            listaT.innerHTML += `<li>Vuelta ${t.vuelta} — [${t.marca}] ${t.producto}: ${t.cantidad} bandejas ${t.completado ? '✅' : '⏳'} 
                                 <button class="no-print" onclick="borrarTarea('${id}')">❌</button></li>`;
        });
    }

    // Reporte de Stock y Gráfico
    const listaS = document.getElementById('sobrantesList');
    listaS.innerHTML = "";
    const labels = [];
    const valores = [];

    if (data.sobrantes) {
        Object.values(data.sobrantes).forEach(s => {
            const totalUnidades = s.columnas * s.filas;
            labels.push(s.producto);
            valores.push(totalUnidades);
            listaS.innerHTML += `<li>${s.producto}: <b>${totalUnidades} un.</b> (${s.columnas}x${s.filas}) a las ${s.hora}</li>`;
        });
        dibujarGrafico(labels, valores);
    }
});

function dibujarGrafico(labels, valores) {
    const ctx = document.getElementById('graficoStock').getContext('2d');
    if (miGrafico) miGrafico.destroy();
    miGrafico = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Unidades Producidas',
                data: valores,
                backgroundColor: '#e67e22',
                borderColor: '#d35400',
                borderWidth: 1
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}

window.borrarTarea = (id) => { if(confirm("¿Eliminar orden?")) db.ref(`historial/${getFechaHoy()}/tareas/${id}`).remove(); };
window.cerrarSesion = () => { sessionStorage.clear(); window.location.href="index.html"; };
window.descargarReporte = () => { window.print(); };
