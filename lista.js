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

// La fecha sale de la jornada (8:30 a 8:30, sábado hasta el lunes 8:30): ver jornada.js
const getFechaHoy = () => getFechaJornada();

// ESCUCHAR PEDIDOS EN TIEMPO REAL
let fechaActual = getFechaHoy();
let refActual = null;

const renderTareas = (snapshot) => {
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

        // Mostrar "Vuelta completa" o la cantidad de bandejas
        const cantidadTexto = t.vueltaCompleta
            ? '<span class="badge-vuelta-completa">✔ Vuelta completa</span>'
            : `${t.cantidad} bandejas`;

        li.innerHTML = `
            <input type="checkbox" ${t.completado ? 'checked' : ''}
                   onchange="toggleTarea('${id}', ${t.completado})">
            <span>
                ${t.marca ? `[${t.marca}]` : ''}
                ${t.vuelta ? `Vuelta ${t.vuelta} —` : ''}
                ${t.producto}: ${cantidadTexto}
            </span>
        `;
        contenedor.appendChild(li);
    });
};

function suscribir() {
    if (refActual) refActual.off('value');
    fechaActual = getFechaHoy();
    refActual = db.ref(`historial/${fechaActual}/tareas`);
    refActual.on('value', renderTareas);
}
suscribir();

// Si la página queda abierta al cruzar las 08:30 (cambio de "día de producción"),
// re-suscribe el listener a la fecha nueva. Todo lo que escribe usa la misma fecha que se está mostrando.
const refrescarFecha = () => {
    if (getFechaHoy() !== fechaActual) suscribir();
};
setInterval(refrescarFecha, 30000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refrescarFecha(); });

// MARCAR COMO COMPLETADO
window.toggleTarea = (id, estadoActual) => {
    db.ref(`historial/${fechaActual}/tareas/${id}`).update({
        completado: !estadoActual
    });
};
