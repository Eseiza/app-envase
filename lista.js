// 1. CONFIGURACIÓN LIMPIA
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

// 3. ESCUCHAR PEDIDOS EN TIEMPO REAL
db.ref(`historial/${getFechaHoy()}/tareas`).on('value', (snapshot) => {
    const tareas = snapshot.val();
    const contenedor = document.getElementById('pedidosList');
    
    if (!contenedor) return; // Seguridad por si el ID no existe
    
    contenedor.innerHTML = "";

    if (!tareas) {
        contenedor.innerHTML = "<li>No hay pedidos hoy.</li>";
        return;
    }

    Object.values(tareas).forEach(t => {
        const li = document.createElement('li');
        li.style.listStyle = "none";
        li.style.marginBottom = "10px";
        
        li.innerHTML = `
            <label style="font-size: 1.2rem; cursor: pointer;">
                <input type="checkbox" ${t.completado ? 'checked' : ''} 
                       onclick="toggleTarea('${t.id}', ${t.completado})" 
                       style="transform: scale(1.5); margin-right: 10px;">
                <span style="${t.completado ? 'text-decoration:line-through; color:gray' : 'font-weight:bold'}">
                    ${t.producto} - Cant: ${t.cantidad}
                </span>
            </label>
        `;
        contenedor.appendChild(li);
    });
});

// 4. FUNCIÓN PARA MARCAR COMO LISTO
window.toggleTarea = (id, estadoActual) => {
    db.ref(`historial/${getFechaHoy()}/tareas/${id}`).update({
        completado: !estadoActual
    });
};
