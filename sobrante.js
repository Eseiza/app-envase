// (Misma configuración de Firebase aquí arriba)
const db = firebase.database();
const getFechaHoy = () => new Date().toLocaleDateString('es-AR').replace(/\//g, '-');

document.getElementById('guardar-sobrante-btn').onclick = function() {
    const producto = document.getElementById('opcion-restante').options[document.getElementById('opcion-restante').selectedIndex].text;
    const columnas = document.getElementById('columnas-restante').value;
    const filas = document.getElementById('filas-adicional').value;
    const fecha = getFechaHoy();

    if (!columnas || !filas) return alert("Completa los datos");

    db.ref(`historial/${fecha}/sobrantes`).push({
        producto,
        columnas,
        filas,
        hora: new Date().toLocaleTimeString()
    });

    alert("Enviado al Supervisor");
    window.location.href = "lista.html";
};
