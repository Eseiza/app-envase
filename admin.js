if (sessionStorage.getItem('autenticado') !== 'true') {
    window.location.href = "index.html";
}

const firebaseConfig = {
    apiKey: "AIzaSyAJgnFCKt_8TT4BpWrDwqy--Oep0raYA18",
    authDomain: "romero-env.firebaseapp.com",
    databaseURL: "https://romero-env-default-rtdb.firebaseio.com",
    projectId: "romero-env",
    storageBucket: "romero-env.firebasestorage.app",
    messagingSenderId: "350498956335",
    appId: "1:350498956335:web:901f91c4d7b983308252da"
};

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const db = firebase.database();
const getFechaHoy = () => new Date().toLocaleDateString('es-AR').replace(/\//g, '-');

let miGrafico;

// AGREGAR ORDEN
document.getElementById('add-task-btn').onclick = function() {
    const p = document.getElementById('task-category');
    const producto = p.options[p.selectedIndex].text;
    const cantidad = document.getElementById('taskTitle').value;
    if (!cantidad || p.value === "") return alert("Faltan datos de la orden");

    db.ref(`historial/${getFechaHoy()}/tareas`).push({
        producto, cantidad, completado: false
    });
    document.getElementById('taskTitle').value = "";
};

// ACTUALIZACIÓN EN TIEMPO REAL
db.ref(`historial/${getFechaHoy()}`).on('value', (snapshot) => {
    const data = snapshot.val() || { tareas: {}, sobrantes: {} };
    
    // Lista de Pedidos
    const listaT = document.getElementById('taskList');
    listaT.innerHTML = "";
    if (data.tareas) {
        Object.keys(data.tareas).forEach(id => {
            const t = data.tareas[id];
            listaT.innerHTML += `<li>${t.producto}: ${t.cantidad} bandejas ${t.completado ? '✅' : '⏳'} 
                                 <button class="no-print" onclick="borrarTarea('${id}')">❌</button></li>`;
        });
    }

    // Reporte de Stock y Gráfico
    const listaS = document.getElementById('sobrantesList');
    listaS.innerHTML = "";
    const labels = [];
    const valores = [];

    if (data.sobrantes) {
        Object.values(data.sobrantes).forEach(s => {
            const totalUnidades = s.columnas * s.filas;
            labels.push(s.producto);
            valores.push(totalUnidades);
            listaS.innerHTML += `<li>${s.producto}: <b>${totalUnidades} un.</b> (${s.columnas}x${s.filas}) a las ${s.hora}</li>`;
        });
        dibujarGrafico(labels, valores);
    }
});

function dibujarGrafico(labels, valores) {
    const ctx = document.getElementById('graficoStock').getContext('2d');
    if (miGrafico) miGrafico.destroy();
    miGrafico = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Unidades Producidas',
                data: valores,
                backgroundColor: '#e67e22',
                borderColor: '#d35400',
                borderWidth: 1
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}

window.borrarTarea = (id) => { if(confirm("¿Eliminar orden?")) db.ref(`historial/${getFechaHoy()}/tareas/${id}`).remove(); };
window.cerrarSesion = () => { sessionStorage.clear(); window.location.href="index.html"; };
window.descargarReporte = () => { window.print(); };
