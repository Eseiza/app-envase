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
const db = firebase.database();
const getFechaHoy = () => new Date().toLocaleDateString('es-AR').replace(/\//g, '-');

db.ref(`historial/${getFechaHoy()}/tareas`).on('value', (snapshot) => {
    const tareas = snapshot.val();
    const contenedor = document.getElementById('pedidosList');
    contenedor.innerHTML = "";

    if (!tareas) {
        contenedor.innerHTML = "<li>No hay pedidos hoy.</li>";
        return;
    }

    Object.values(tareas).forEach(t => {
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" ${t.completado ? 'checked' : ''} onclick="toggleTarea('${t.id}', ${t.completado})">
            <span style="${t.completado ? 'text-decoration:line-through' : ''}">${t.producto} - Cant: ${t.cantidad}</span>
        `;
        contenedor.appendChild(li);
    });
});

window.toggleTarea = (id, estadoActual) => {
    db.ref(`historial/${getFechaHoy()}/tareas/${id}`).update({
        completado: !estadoActual
    });
};

