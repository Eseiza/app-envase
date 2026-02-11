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

document.getElementById('guardar-sobrante-btn').onclick = function() {
    const producto = document.getElementById('opcion-restante').options[document.getElementById('opcion-restante').selectedIndex].text;
    const columnas = document.getElementById('columnas-restante').value;
    const filas = document.getElementById('filas-adicional').value; // ID Corregido según tu HTML
    const fecha = getFechaHoy();

    if (!columnas || !filas || producto.includes("--")) {
        return alert("Por favor, completa todos los campos del sobrante.");
    }

    let historial = JSON.parse(localStorage.getItem('historial_panificados')) || {};
    if (!historial[fecha]) historial[fecha] = { tareas: [], sobrantes: [] };

    historial[fecha].sobrantes.push({
        id: Date.now(),
        producto,
        columnas,
        filas
    });

    localStorage.setItem('historial_panificados', JSON.stringify(historial));
    alert("Reporte guardado con éxito.");
    window.location.href = "lista.html"; // Redirige al operario a la lista
};

