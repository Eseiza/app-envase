/// Funciones de utilidad para localStorage
function obtenerSobrantesGuardados() {
    const sobrantesJSON = localStorage.getItem('sobrantes');
    return sobrantesJSON ? JSON.parse(sobrantesJSON) : []; 
}

function guardarSobrantes(sobrantes) {
    localStorage.setItem('sobrantes', JSON.stringify(sobrantes));
}

// -----------------------------------------------------------
// Referencias del DOM usando los IDs de sobrante.html
// -----------------------------------------------------------
const botonGuardar = document.getElementById('guardar-sobrante-btn');
const listaSobrantes = document.getElementById('taskList');
// const inputCantidad = document.getElementById('detalle-restante'); // ID anterior
const selectProducto = document.getElementById('opcion-restante');

// ✨ NUEVAS REFERENCIAS DE DOM ✨
const inputColumnas = document.getElementById('columnas-restante'); 
const inputFilas = document.getElementById('filas-restante');


// -----------------------------------------------------------
// Lógica de Adición de Sobrantes
// -----------------------------------------------------------

function agregarSobranteALista() {
    
    const indiceSeleccionado = selectProducto.selectedIndex;
    const producto = selectProducto.options[indiceSeleccionado].text;
    
    // Obtener los nuevos valores
    const columnas = inputColumnas.value.trim();
    const filas = inputFilas.value.trim();

    if (producto === '-- Elija un Producto --' || columnas === '' || filas === '') {
        alert('Por favor, selecciona un producto y completa los campos de Columnas y Filas.');
        return;
    }
    
    // Generar un ID único para asegurar una eliminación precisa
    const id = Date.now().toString();

    const nuevoSobrante = {
        id: id, // ID único para fácil eliminación
        producto: producto,
        columnas: columnas, // Campo actualizado
        filas: filas,      // Campo actualizado
        completado: false 
    };
    
    let sobrantes = obtenerSobrantesGuardados();
    sobrantes.push(nuevoSobrante);
    guardarSobrantes(sobrantes);

    cargarSobrantesIniciales();

    // Limpia los campos
    inputColumnas.value = '';
    inputFilas.value = '';
    selectProducto.selectedIndex = 0;
}

// -----------------------------------------------------------
// Lógica de Renderización (ACTUALIZADA)
// -----------------------------------------------------------

function renderizarSobranteEnLista(sobrante) {
    const nuevoElementoLista = document.createElement('li');

    // Modificamos el contenido para mostrar Columnas y Filas
    nuevoElementoLista.innerHTML = `
        <span>
            Producto: <strong>${sobrante.producto}</strong> / Col: ${sobrante.columnas} / Fil: ${sobrante.filas}
        </span>
        <div class="task-actions">
            <button onclick="eliminarSobrante('${sobrante.id}')"> ❌ Eliminar</button>
        </div>
    `;
    listaSobrantes.appendChild(nuevoElementoLista);
}

// -----------------------------------------------------------
// Funciones de Modificación y Eliminación (ACTUALIZADA)
// -----------------------------------------------------------

// Cambiamos la eliminación para que use el ID único en lugar de producto y cantidad
function eliminarSobrante(idAEliminar) {
    let sobrantes = obtenerSobrantesGuardados();
    
    // Filtramos por el ID único
    sobrantes = sobrantes.filter(s => s.id !== idAEliminar);
    
    guardarSobrantes(sobrantes);
    cargarSobrantesIniciales();
}

// -----------------------------------------------------------
// Inicialización
// -----------------------------------------------------------

function cargarSobrantesIniciales() {
    listaSobrantes.innerHTML = '';
    const sobrantes = obtenerSobrantesGuardados();
    sobrantes.forEach(sobrante => {
        renderizarSobranteEnLista(sobrante);
    });
}

// Asigna eventos y ejecuta la carga inicial
botonGuardar.addEventListener('click', agregarSobranteALista);
cargarSobrantesIniciales();