// 1. CONFIGURACIÓN LIMPIA (Sin imports ni duplicados)
const firebaseConfig = {
  apiKey: "AIzaSyAJgnFCKt_8TT4BpWrDwqy--Oep0raYA18",
  authDomain: "romero-env.firebaseapp.com",
  databaseURL: "https://romero-env-default-rtdb.firebaseio.com",
  projectId: "romero-env",
  storageBucket: "romero-env.firebasestorage.app",
  messagingSenderId: "350498956335",
  appId: "1:350498956335:web:901f91c4d7b983308252da",
  measurementId: "G-4WWNKPPBMG"
};

// 2. INICIALIZACIÓN
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

const getFechaHoy = () => new Date().toLocaleDateString('es-AR').replace(/\//g, '-');

// 3. LOGICA DEL BOTÓN
const btnGuardar = document.getElementById('guardar-sobrante-btn');

if (btnGuardar) {
    btnGuardar.onclick = function() {
        const productoSelect = document.getElementById('opcion-restante');
        const producto = productoSelect.options[productoSelect.selectedIndex].text;
        const columnas = document.getElementById('columnas-restante').value;
        const filas = document.getElementById('filas-adicional').value;
        const fecha = getFechaHoy();

        // Validación básica
        if (!columnas || !filas || producto.includes("--")) {
            return alert("Por favor, completa todos los campos (Producto, Columnas y Filas)");
        }

        // 4. GUARDAR EN FIREBASE
        db.ref(`historial/${fecha}/sobrantes`).push({
            producto: producto,
            columnas: columnas,
            filas: filas,
            hora: new Date().toLocaleTimeString()
        }).then(() => {
            alert("Reporte enviado con éxito al supervisor");
            window.location.href = "lista.html"; // Regresa a la lista de tareas
        }).catch((error) => {
            alert("Error al enviar: " + error.message);
        });
    };
}
