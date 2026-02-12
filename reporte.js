const firebaseConfig = {
    apiKey: "AIzaSyAJgnFCKt_8TT4BpWrDwqy--Oep0raYA18",
    authDomain: "romero-env.firebaseapp.com",
    databaseURL: "https://romero-env-default-rtdb.firebaseio.com",
    projectId: "romero-env",
    storageBucket: "romero-env.firebasestorage.app",
    messagingSenderId: "350498956335",
    appId: "1:350498956335:web:901f91c4d7b983308252da"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const hoy = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');
document.getElementById('fechaReporte').innerText = "Fecha: " + hoy;

db.ref(`historial/${hoy}/sobrantes`).once('value', (snapshot) => {
    const data = snapshot.val();
    const labels = [];
    const valores = [];
    const lista = document.getElementById('listaDetalle');

    if (data) {
        Object.values(data).forEach(s => {
            const total = s.columnas * s.filas;
            labels.push(s.producto);
            valores.push(total);
            lista.innerHTML += `<li style="color:black; border-bottom:1px solid #ddd;">${s.producto}: ${total} unidades</li>`;
        });

        new Chart(document.getElementById('graficoStock'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Unidades Totales',
                    data: valores,
                    backgroundColor: '#e67e22'
                }]
            }
        });
    }
});
