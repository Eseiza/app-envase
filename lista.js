const firebaseConfig = {
    apiKey: "AIzaSyAJgnFCKt_8TT4BpWrDwqy--Oep0raYA18",
    authDomain: "romero-env.firebaseapp.com",
    databaseURL: "https://romero-env-default-rtdb.firebaseio.com",
    projectId: "romero-env",
    storageBucket: "romero-env.firebasestorage.app",
    messagingSenderId: "350498956335",
    appId: "1:350498956335:web:901f91c4d7b983308252da"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

const getFechaHoy = () => new Date().toLocaleDateString('es-AR').replace(/\//g, '-');

// ESCUCHAR PEDIDOS EN TIEMPO REAL
db.ref(`historial/${getFechaHoy()}/tareas`).on('value', (snapshot) => {
    const tareas = snapshot.val();
    const contenedor = document.getElementById('pedidosList');
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (!tareas) {
        const li = document.createElement('li');
        li.className = 'vacio';
        li.textContent = 'No hay pedidos hoy.';
        contenedor.appendChild(li);
        return;
    }

    Object.entries(tareas).forEach(([id, t]) => {
        const li = document.createElement('li');
        if (t.completado) li.classList.add('completado');

        li.innerHTML = `
            <input type="checkbox" ${t.completado ? 'checked' : ''}
                   onchange="toggleTarea('${id}', ${t.completado})">
            <span>
                ${t.marca ? `[${t.marca}]` : ''} 
                ${t.vuelta ? `Vuelta ${t.vuelta} —` : ''} 
                ${t.producto}: ${t.cantidad} bandejas
            </span>
        `;
        contenedor.appendChild(li);
    });
});

// MARCAR COMO COMPLETADO
window.toggleTarea = (id, estadoActual) => {
    db.ref(`historial/${getFechaHoy()}/tareas/${id}`).update({
        completado: !estadoActual
    });
};
