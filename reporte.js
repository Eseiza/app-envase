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

db.ref(historial/${hoy}/sobrantes).once('value', (snapshot) => {
    const data = snapshot.val();
    const labels = [];
    const valores = [];
    const lista = document.getElementById('listaDetalle');

    if (data) {
        Object.values(data).forEach(s => {
            const total = s.columnas * s.filas;
            labels.push(s.producto);
            valores.push(total);
            lista.innerHTML += `
                <li>
                    ${s.producto}
                    <span class="cantidad">${total} unidades</span>
                </li>`;
        });

        new Chart(document.getElementById('graficoStock'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Unidades Totales',
                    data: valores,
                    backgroundColor: '#c8960c',
                    borderColor: '#7a1a0a',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { labels: { color: '#2a1a0a', font: { family: 'Lato' } } }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#6b4c2a' },
                        grid: { color: '#e8dcc8' }
                    },
                    x: {
                        ticks: { color: '#6b4c2a' },
                        grid: { display: false }
                    }
                }
            }
        });
    } else {
        lista.innerHTML = '<li>No hay datos de producción para hoy.</li>';
    }
});
