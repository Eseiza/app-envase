// CONFIGURACIÓN DE FIREBASE (Pégala aquí)
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_PROYECTO.firebaseapp.com",
    databaseURL: "https://TU_PROYECTO.firebaseio.com",
    projectId: "TU_PROYECTO",
    storageBucket: "TU_PROYECTO.appspot.com",
    messagingSenderId: "...",
    appId: "..."
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const getFechaHoy = () => new Date().toLocaleDateString('es-AR').replace(/\//g, '-');

// --- AGREGAR TAREA ---
document.getElementById('add-task-btn').onclick = function() {
    const producto = document.getElementById('task-category').options[document.getElementById('task-category').selectedIndex].text;
    const cantidad = document.getElementById('taskTitle').value;
    const fecha = getFechaHoy();

    if (!cantidad || producto.includes("--")) return alert("Completa los datos");

    const nuevaRef = db.ref(`historial/${fecha}/tareas`).push();
    nuevaRef.set({
        id: nuevaRef.key,
        producto,
        cantidad,
        completado: false
    });
    document.getElementById('taskTitle').value = "";
};

// --- ESCUCHAR CAMBIOS EN TIEMPO REAL ---
db.ref(`historial/${getFechaHoy()}`).on('value', (snapshot) => {
    const data = snapshot.val() || { tareas: {}, sobrantes: {} };
    renderizar(data);
});

function renderizar(data) {
    // Render Tareas
    const listaT = document.getElementById('taskList');
    listaT.innerHTML = "";
    if (data.tareas) {
        Object.values(data.tareas).forEach(t => {
            const li = document.createElement('li');
            li.innerHTML = `<span><b>${t.producto}</b>: ${t.cantidad} ${t.completado ? '✅' : '⏳'}</span>
                            <button onclick="borrarTarea('${t.id}')">❌</button>`;
            listaT.appendChild(li);
        });
    }

    // Render Sobrantes
    const listaS = document.getElementById('sobrantesList');
    listaS.innerHTML = "";
    if (data.sobrantes) {
        Object.values(data.sobrantes).forEach(s => {
            const li = document.createElement('li');
            li.innerHTML = `<span>🍞 ${s.producto}: ${s.columnas} col x ${s.filas} fil</span>`;
            listaS.appendChild(li);
        });
    }
}

window.borrarTarea = (id) => {
    db.ref(`historial/${getFechaHoy()}/tareas/${id}`).remove();
};
