const getFechaHoy = () => new Date().toLocaleDateString('es-AR');

function obtenerDatos() {
    return JSON.parse(localStorage.getItem('historial_panificados')) || {};
}

function guardarDatos(data) {
    localStorage.setItem('historial_panificados', JSON.stringify(data));
}

// Agregar pedido nuevo
document.getElementById('add-task-btn').onclick = function() {
    const producto = document.getElementById('task-category').options[document.getElementById('task-category').selectedIndex].text;
    const cantidad = document.getElementById('taskTitle').value;
    const fecha = getFechaHoy();

    if (!cantidad || producto.includes("--")) return alert("Selecciona producto y cantidad");

    let historial = obtenerDatos();
    if (!historial[fecha]) historial[fecha] = { tareas: [], sobrantes: [] };

    historial[fecha].tareas.push({
        id: Date.now(),
        producto,
        cantidad,
        completado: false
    });

    guardarDatos(historial);
    renderizarPanel(fecha);
    document.getElementById('taskTitle').value = "";
};

// Función de renderizado (Sirve para hoy o para fechas anteriores)
function renderizarPanel(fechaAMostrar = getFechaHoy()) {
    const historial = obtenerDatos();
    const datosDia = historial[fechaAMostrar] || { tareas: [], sobrantes: [] };

    // Mostrar Tareas/Pedidos
    const listaT = document.getElementById('taskList');
    listaT.innerHTML = "";
    datosDia.tareas.forEach(t => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span><strong>${t.producto}</strong> - Cant: ${t.cantidad} ${t.completado ? '✅' : '⏳'}</span>
            <button onclick="borrarTarea('${fechaAMostrar}', ${t.id})" style="background:red; color:white; border:none; padding:5px; cursor:pointer;">Eliminar</button>
        `;
        listaT.appendChild(li);
    });

    // Mostrar Sobrantes reportados por operarios
    const listaS = document.getElementById('sobrantesList');
    listaS.innerHTML = "";
    datosDia.sobrantes.forEach(s => {
        const li = document.createElement('li');
        li.innerHTML = `<span>🍞 ${s.producto}: ${s.columnas} col x ${s.filas} fil</span>`;
        listaS.appendChild(li);
    });
}

window.borrarTarea = (fecha, id) => {
    let historial = obtenerDatos();
    historial[fecha].tareas = historial[fecha].tareas.filter(t => t.id !== id);
    guardarDatos(historial);
    renderizarPanel(fecha);
};

// Lógica del buscador de historial
window.consultarHistorial = () => {
    const fechaInput = document.getElementById('fecha-busqueda').value; // Formato yyyy-mm-dd
    if (!fechaInput) return;
    const [aaaa, mm, dd] = fechaInput.split('-');
    const fechaFormateada = `${parseInt(dd)}/${parseInt(mm)}/${aaaa}`;
    renderizarPanel(fechaFormateada);
};

renderizarPanel();
