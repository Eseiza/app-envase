// Utilidades para LocalStorage
function obtenerTareasGuardadas() {
    const tareasJSON = localStorage.getItem('tareas');
    return tareasJSON ? JSON.parse(tareasJSON) : []; 
}

function guardarTareas(tareas) {
    localStorage.setItem('tareas', JSON.stringify(tareas));
}

// NUEVA: Utilidad para obtener sobrantes
function obtenerSobrantesGuardados() {
    const sobrantesJSON = localStorage.getItem('sobrantes');
    return sobrantesJSON ? JSON.parse(sobrantesJSON) : [];
}

// Referencias del DOM
const botonAgregar = document.getElementById('add-task-btn');
const listaTareas = document.getElementById('taskList');
const listaSobrantesDOM = document.getElementById('sobrantesList'); // Referencia del HTML
const inputCantidad = document.getElementById('taskTitle');
const selectProducto = document.getElementById('task-category');

// --- Gestión de Pedidos ---
function agregarInformacionALista() {
    const producto = selectProducto.options[selectProducto.selectedIndex].text; 
    const cantidad = inputCantidad.value;

    if (selectProducto.selectedIndex === 0 || cantidad.trim() === '') {
        alert('Por favor, selecciona un producto e ingresa una cantidad.');
        return;
    }

    const nuevaTarea = {
        id: Date.now(), // ID único para evitar errores al borrar
        producto,
        cantidad,
        completado: false 
    };
    
    let tareas = obtenerTareasGuardadas();
    tareas.push(nuevaTarea);
    guardarTareas(tareas);
    cargarTareasIniciales();

    inputCantidad.value = '';
    selectProducto.selectedIndex = 0;
}

function renderizarTareaEnLista(tarea) {
    const nuevoElementoLista = document.createElement('li');
    if (tarea.completado) nuevoElementoLista.classList.add('tarea-completada'); 

    nuevoElementoLista.innerHTML = `
        <span><strong>${tarea.producto}</strong> - Cant: ${tarea.cantidad} ${tarea.completado ? '✅' : '⏳'}</span>
        <div class="task-actions">
            ${!tarea.completado ? `<button onclick="marcarComoCompletado(${tarea.id})">✔️</button>` : ''}
            <button onclick="eliminarTarea(${tarea.id})">❌</button>
        </div>
    `;
    listaTareas.appendChild(nuevoElementoLista);
}

// --- Gestión de Sobrantes (Panel Admin) ---
function cargarSobrantesAdmin() {
    if (!listaSobrantesDOM) return;
    listaSobrantesDOM.innerHTML = '';
    const sobrantes = obtenerSobrantesGuardados();
    
    sobrantes.forEach(s => {
        const li = document.createElement('li');
        li.innerHTML = `<span>🍞 <strong>${s.producto}</strong>: ${s.columnas} col x ${s.filas} fil</span>`;
        listaSobrantesDOM.appendChild(li);
    });
}

// --- Funciones Globales (para los botones onclick) ---
window.marcarComoCompletado = (id) => {
    let tareas = obtenerTareasGuardadas();
    const index = tareas.findIndex(t => t.id === id);
    if (index !== -1) {
        tareas[index].completado = true;
        guardarTareas(tareas);
        cargarTareasIniciales();
    }
};

window.eliminarTarea = (id) => {
    let tareas = obtenerTareasGuardadas();
    tareas = tareas.filter(t => t.id !== id);
    guardarTareas(tareas);
    cargarTareasIniciales();
};

function cargarTareasIniciales() {
    listaTareas.innerHTML = '';
    obtenerTareasGuardadas().forEach(renderizarTareaEnLista);
}

// Inicialización
botonAgregar.addEventListener('click', agregarInformacionALista);
cargarTareasIniciales();
cargarSobrantesAdmin();
