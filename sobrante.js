const getFechaHoy = () => new Date().toLocaleDateString('es-AR');

document.getElementById('guardar-sobrante-btn').onclick = function() {
    const producto = document.getElementById('opcion-restante').options[document.getElementById('opcion-restante').selectedIndex].text;
    const columnas = document.getElementById('columnas-restante').value;
    const filas = document.getElementById('filas-adicional').value; // ID Corregido
    const fecha = getFechaHoy();

    if (!columnas || !filas) return alert("Completa los datos");

    let historial = JSON.parse(localStorage.getItem('historial_panificados')) || {};
    if (!historial[fecha]) historial[fecha] = { tareas: [], sobrantes: [] };

    historial[fecha].sobrantes.push({
        id: Date.now(),
        producto,
        columnas,
        filas
    });

    localStorage.setItem('historial_panificados', JSON.stringify(historial));
    alert("Sobrante guardado en el historial de hoy.");
    window.location.href = "lista.html"; // Vuelve a la lista tras reportar
};
