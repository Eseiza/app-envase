// (Misma configuración de Firebase aquí arriba)
const db = firebase.database();
const getFechaHoy = () => new Date().toLocaleDateString('es-AR').replace(/\//g, '-');

db.ref(`historial/${getFechaHoy()}/tareas`).on('value', (snapshot) => {
    const tareas = snapshot.val();
    const contenedor = document.getElementById('pedidosList');
    contenedor.innerHTML = "";

    if (!tareas) {
        contenedor.innerHTML = "<li>No hay pedidos hoy.</li>";
        return;
    }

    Object.values(tareas).forEach(t => {
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" ${t.completado ? 'checked' : ''} onclick="toggleTarea('${t.id}', ${t.completado})">
            <span style="${t.completado ? 'text-decoration:line-through' : ''}">${t.producto} - Cant: ${t.cantidad}</span>
        `;
        contenedor.appendChild(li);
    });
});

window.toggleTarea = (id, estadoActual) => {
    db.ref(`historial/${getFechaHoy()}/tareas/${id}`).update({
        completado: !estadoActual
    });
};
