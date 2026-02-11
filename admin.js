// Funciones de utilidad para localStorage
function obtenerTareasGuardadas() {
    const tareasJSON = localStorage.getItem('tareas');
    // Devuelve el array de tareas o un array vacío si no hay datos
    return tareasJSON ? JSON.parse(tareasJSON) : []; 
}

function guardarTareas(tareas) {
    // Convierte el array JS a una cadena JSON antes de guardar
    localStorage.setItem('tareas', JSON.stringify(tareas));
}

// Referencias del DOM
const botonAgregar = document.getElementById('add-task-btn');
const listaTareas = document.getElementById('taskList');
const inputCantidad = document.getElementById('taskTitle');
const selectProducto = document.getElementById('task-category');

// -----------------------------------------------------------
// 1. Lógica de Adición de Tareas
// -----------------------------------------------------------

function agregarInformacionALista() {
    
    const indiceSeleccionado = selectProducto.selectedIndex;
    // Usamos el texto para la visualización y el filtrado
    const producto = selectProducto.options[indiceSeleccionado].text; 
    const cantidad = inputCantidad.value;

    if (producto === '-- Selecciona un Producto --' || cantidad.trim() === '') {
        alert('Por favor, selecciona un producto e ingresa una cantidad válida.');
        return;
    }

    // Crea el objeto de la nueva tarea (inicia como NO completada)
    const nuevaTarea = {
        producto: producto,
        cantidad: cantidad,
        completado: false // Estado inicial
    };
    
    // Carga las tareas existentes, añade la nueva y guarda
    let tareas = obtenerTareasGuardadas();
    tareas.push(nuevaTarea);
    guardarTareas(tareas);

    // Vuelve a cargar la lista para que el DOM refleje el cambio
    cargarTareasIniciales();

    // Limpia los campos
    inputCantidad.value = '';
    selectProducto.selectedIndex = 0;
}

// -----------------------------------------------------------
// 2. Lógica de Renderización y Botones (DOM)
// -----------------------------------------------------------

// Muestra la tarea en la lista de admin.html y chequea si está completada
function renderizarTareaEnLista(tarea) {
    const nuevoElementoLista = document.createElement('li');

    let estadoTexto = '';
    if (tarea.completado) {
        // Si está completada, añade el estilo CSS y el ícono
        nuevoElementoLista.classList.add('tarea-completada'); 
        estadoTexto = '✅ (Completado)';
    } else {
        estadoTexto = '⏳ (Pendiente)';
    }

    // Nota: Para la eliminación y completado, la mejor práctica es usar un ID único 
    // (no solo producto y cantidad), pero mantendremos la lógica original por simplicidad.
    nuevoElementoLista.innerHTML = `
        <span>
            Producto: <strong>${tarea.producto}</strong> / Cantidad: ${tarea.cantidad} / Estado: ${estadoTexto}
        </span>
        <div class="task-actions">
            ${!tarea.completado ? `<button onclick="marcarComoCompletado('${tarea.producto}', '${tarea.cantidad}')">✔️ Completar</button>` : ''}
            
            <button onclick="eliminarTarea('${tarea.producto}', '${tarea.cantidad}')"> ❌ Eliminar</button>
        </div>
    `;
    listaTareas.appendChild(nuevoElementoLista);
}

// -----------------------------------------------------------
// 3. Funciones de Modificación y Eliminación
// -----------------------------------------------------------

// Elimina una tarea de localStorage y actualiza el DOM
function eliminarTarea(producto, cantidad) {
    let tareas = obtenerTareasGuardadas();
    
    // Filtra el arreglo, manteniendo solo las tareas que NO coinciden
    // Nota: Solo se eliminará la primera coincidencia en caso de duplicados exactos
    tareas = tareas.filter(t => !(t.producto === producto && t.cantidad === cantidad && t.completado));
    
    guardarTareas(tareas);
    
    // Vuelve a cargar la lista para que el DOM refleje el cambio
    cargarTareasIniciales();
}

/**
 * Marca una tarea como completada en localStorage.
 */
function marcarComoCompletado(producto, cantidad) {
    let tareas = obtenerTareasGuardadas();
    
    // Encuentra la tarea específica
    const tareaIndex = tareas.findIndex(t => t.producto === producto && t.cantidad === cantidad && t.completado === false);
    
    if (tareaIndex !== -1) {
        tareas[tareaIndex].completado = true; // Cambia el estado
        guardarTareas(tareas);
        cargarTareasIniciales(); // Recarga la lista para aplicar el estilo y ocultar el botón
    }
}


// -----------------------------------------------------------
// 4. Inicialización
// -----------------------------------------------------------

// Carga todas las tareas guardadas al iniciar admin.html
function cargarTareasIniciales() {
    listaTareas.innerHTML = ''; // Limpia la lista actual
    const tareas = obtenerTareasGuardadas();
    tareas.forEach(tarea => {
        renderizarTareaEnLista(tarea);
    });
}
function cargarSobrantesIniciales() {
    // Usa la nueva referencia para pintar los sobrantes
    const listaSobrantesDOM = document.getElementById('sobrantesList');

    listaSobrantesDOM.innerHTML = ''; 
    const sobrantes = obtenerSobrantesGuardados();
    sobrantes.forEach(sobrante => {
        renderizarSobranteEnLista(sobrante, listaSobrantesDOM); // Pasa la referencia DOM
    });
}
// Asigna eventos y ejecuta la carga inicial
botonAgregar.addEventListener('click', agregarInformacionALista);
cargarTareasIniciales();