const firebaseConfig = {
    // PEGA AQUÍ TUS DATOS DE FIREBASE
    apiKey: "...",
    authDomain: "...",
    databaseURL: "...",
    projectId: "...",
    storageBucket: "...",
    messagingSenderId: "...",
    appId: "..."
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const getFechaHoy = () => new Date().toLocaleDateString('es-AR').replace(/\//g, '-');

const getFechaHoy = () => new Date().toLocaleDateString('es-AR');

function renderizarListaOperario() {
    const historial = JSON.parse(localStorage.getItem('historial_panificados')) || {};
    const hoy = historial[getFechaHoy()] || { tareas: [] };
    const contenedor = document.getElementById('pedidosList');

    contenedor.innerHTML = hoy.tareas.length === 0 ? "<li>No hay pedidos para hoy</li>" : "";

    hoy.tareas.forEach(tarea => {
        const li = document.createElement('li');
        li.style.display = "flex";
        li.style.alignItems = "center";
        li.style.gap = "10px";
        
        li.innerHTML = `
            <input type="checkbox" ${tarea.completado ? 'checked' : ''} 
                style="transform: scale(1.5);"
                onclick="cambiarEstado(${tarea.id})">
            <span style="${tarea.completado ? 'text-decoration: line-through; color: gray;' : 'font-weight: bold;'}">
                ${tarea.producto.toUpperCase()} — CANTIDAD: ${tarea.cantidad}
            </span>
        `;
        contenedor.appendChild(li);
    });
}

window.cambiarEstado = (id) => {
    let historial = JSON.parse(localStorage.getItem('historial_panificados'));
    const hoy = getFechaHoy();
    const index = historial[hoy].tareas.findIndex(t => t.id === id);
    
    historial[hoy].tareas[index].completado = !historial[hoy].tareas[index].completado;
    localStorage.setItem('historial_panificados', JSON.stringify(historial));
    renderizarListaOperario();
};

renderizarListaOperario();

