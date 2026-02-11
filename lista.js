const getFechaHoy = () => new Date().toLocaleDateString('es-AR');

function mostrarPedidosOperario() {
    const historial = JSON.parse(localStorage.getItem('historial_panificados')) || {};
    const hoy = historial[getFechaHoy()] || { tareas: [] };
    const listaDOM = document.getElementById('pedidosList');

    listaDOM.innerHTML = "";

    if (hoy.tareas.length === 0) {
        listaDOM.innerHTML = "<li>No hay pedidos para hoy.</li>";
        return;
    }

    hoy.tareas.forEach(tarea => {
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" ${tarea.completado ? 'checked' : ''} 
                onclick="toggleTarea(${tarea.id})">
            <span style="${tarea.completado ? 'text-decoration:line-through' : ''}">
                ${tarea.producto} - Cant: ${tarea.cantidad}
            </span>
        `;
        listaDOM.appendChild(li);
    });
}

window.toggleTarea = (id) => {
    let historial = JSON.parse(localStorage.getItem('historial_panificados'));
    const fecha = getFechaHoy();
    const index = historial[fecha].tareas.findIndex(t => t.id === id);
    
    historial[fecha].tareas[index].completado = !historial[fecha].tareas[index].completado;
    localStorage.setItem('historial_panificados', JSON.stringify(historial));
    mostrarPedidosOperario();
};

mostrarPedidosOperario();
