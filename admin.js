// --- UTILIDADES ---
const getFechaHoy = () => new Date().toLocaleDateString('es-AR');

function obtenerHistorial() {
    return JSON.parse(localStorage.getItem('historial_panificados')) || {};
}

function guardarHistorial(historial) {
    localStorage.setItem('historial_panificados', JSON.stringify(historial));
}

// --- RENDERIZADO ---
function actualizarVista(fechaAMostrar = getFechaHoy()) {
    const historial = obtenerHistorial();
    const datosDia = historial[fechaAMostrar] || { tareas: [], sobrantes: [] };

    // Tareas (Pedidos)
    const listaT = document.getElementById('taskList');
    listaT.innerHTML = "";
    datosDia.tareas.forEach(t => {
        const li = document.createElement('li');
        li.className = t.completado ? "tarea-completada" : "";
        li.innerHTML = `
            <span><strong>${t.producto}</strong>: ${t.cantidad} ${t.completado ? '✅' : '⏳'}</span>
            <button onclick="eliminarTarea('${fechaAMostrar}', ${t.id})">❌</button>
        `;
        listaT.appendChild(li);
    });

    // Sobrantes Reportados
    const listaS = document.getElementById('sobrantesList');
    listaS.innerHTML = "";
    datosDia.sobrantes.forEach(s => {
        const li = document.createElement('li');
        li.innerHTML = `🍞 <strong>${s.producto}</strong>: ${s.columnas} col x ${s.filas} fil`;
        listaS.appendChild(li);
    });
}

// --- ACCIONES ---
document.getElementById('add-task-btn').onclick = function() {
    const producto = document.getElementById('task-category').options[document.getElementById('task-category').selectedIndex].text;
    const cantidad = document.getElementById('taskTitle').value;
    const fecha = getFechaHoy();

    if (!cantidad) return alert("Ingresa cantidad");

    let historial = obtenerHistorial();
    if (!historial[fecha]) historial[fecha] = { tareas: [], sobrantes: [] };

    historial[fecha].tareas.push({ id: Date.now(), producto, cantidad, completado: false });
    guardarHistorial(historial);
    actualizarVista();
};

window.eliminarTarea = (fecha, id) => {
    let historial = obtenerHistorial();
    historial[fecha].tareas = historial[fecha].tareas.filter(t => t.id !== id);
    guardarHistorial(historial);
    actualizarVista(fecha);
};

window.consultarHistorial = () => {
    const fechaInput = document.getElementById('fecha-busqueda').value;
    if (!fechaInput) return;
    const [aaaa, mm, dd] = fechaInput.split('-');
    actualizarVista(`${parseInt(dd)}/${parseInt(mm)}/${aaaa}`);
};

// Carga Inicial
actualizarVista();
