// 1. CONFIGURACIÓN DE FIREBASE (Limpia y corregida)
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

// 2. INICIALIZACIÓN (Modo Compat para que funcione con tus scripts del HTML)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// Función para la fecha
const getFechaHoy = () => new Date().toLocaleDateString('es-AR').replace(/\//g, '-');

// --- AGREGAR TAREA ---
const btnAgregar = document.getElementById('add-task-btn');
if (btnAgregar) {
    btnAgregar.onclick = function() {
        const select = document.getElementById('task-category');
        const producto = select.options[select.selectedIndex].text;
        const cantidad = document.getElementById('taskTitle').value;
        const fecha = getFechaHoy();

        if (!cantidad || producto.includes("--")) return alert("Completa los datos");

        const nuevaRef = db.ref(`historial/${fecha}/tareas`).push();
        nuevaRef.set({
            id: nuevaRef.key,
            producto: producto,
            cantidad: cantidad,
            completado: false
        });
        document.getElementById('taskTitle').value = "";
    };
}

// --- ESCUCHAR CAMBIOS EN TIEMPO REAL ---
db.ref(`historial/${getFechaHoy()}`).on('value', (snapshot) => {
    const data = snapshot.val() || { tareas: {}, sobrantes: {} };
    renderizar(data);
});

function renderizar(data) {
    // Render Tareas
    const listaT = document.getElementById('taskList');
    if (listaT) {
        listaT.innerHTML = "";
        if (data.tareas) {
            Object.values(data.tareas).forEach(t => {
                const li = document.createElement('li');
                li.innerHTML = `<span><b>${t.producto}</b>: ${t.cantidad} ${t.completado ? '✅' : '⏳'}</span>
                                <button onclick="borrarTarea('${t.id}')">❌</button>`;
                listaT.appendChild(li);
            });
        }
    }

    // Render Sobrantes
    const listaS = document.getElementById('sobrantesList');
    if (listaS) {
        listaS.innerHTML = "";
        if (data.sobrantes) {
            Object.values(data.sobrantes).forEach(s => {
                const li = document.createElement('li');
                li.innerHTML = `<span>🍞 ${s.producto}: ${s.columnas} col x ${s.filas} fil</span>`;
                listaS.appendChild(li);
            });
        }
    }
}

window.borrarTarea = (id) => {
    if(confirm("¿Eliminar tarea?")) {
        db.ref(`historial/${getFechaHoy()}/tareas/${id}`).remove();
    }
};
