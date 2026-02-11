// CONFIGURACIÓN DE FIREBASE (Pégala aquí)
const firebaseConfig = {
    // Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
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

