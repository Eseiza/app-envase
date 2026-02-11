const pedidosList = document.getElementById('pedidosList');

// Funciones de utilidad para localStorage
function obtenerPedidos() {
    const tareasJSON = localStorage.getItem('tareas');
    return tareasJSON ? JSON.parse(tareasJSON) : [];
}

function guardarPedidos(pedidos) {
    localStorage.setItem('tareas', JSON.stringify(pedidos));
}

// Función para alternar el estado 'completado'
function toggleCompletado(index) {
    let pedidos = obtenerPedidos();
    
    // Cambia el estado del pedido en el índice específico
    pedidos[index].completado = !pedidos[index].completado; 
    
    guardarPedidos(pedidos);
    mostrarPedidos(); // Refresca la lista
}

// Carga y muestra los pedidos
function mostrarPedidos() {
    const pedidos = obtenerPedidos();
    
    pedidosList.innerHTML = ''; // Limpiar lista
    
    if (pedidos.length === 0) {
        pedidosList.innerHTML = '<li>No hay pedidos ingresados.</li>';
        return;
    }
    
    pedidos.forEach((pedido, index) => {
        const item = document.createElement('li');
        
        // Aplica la clase si está completado para el estilo CSS
        if (pedido.completado) {
            item.classList.add('completado');
        }

        // Crea el checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = pedido.completado; 
        checkbox.onclick = () => toggleCompletado(index); 

        // Contenido del texto
        const textoPedido = document.createElement('span');
        textoPedido.innerHTML = `
            📦 PRODUCTO: ${pedido.producto} /   CANTIDAD: ${pedido.cantidad}
        `;

        item.appendChild(checkbox);
        item.appendChild(textoPedido);
        pedidosList.appendChild(item);
    });
}

// Carga la lista automáticamente al abrir lista.html
mostrarPedidos();