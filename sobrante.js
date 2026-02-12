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

document.getElementById('guardar-sobrante-btn').onclick = function() {
    const p = document.getElementById('opcion-restante');
    const col = document.getElementById('columnas-restante').value;
    const fil = document.getElementById('filas-adicional').value;

    if (!col || !fil || p.value === "") return alert("Complete los datos técnicos");

    db.ref(`historial/${new Date().toLocaleDateString('es-AR').replace(/\//g, '-')}/sobrantes`).push({
        producto: p.options[p.selectedIndex].text,
        columnas: col,
        filas: fil,
        hora: new Date().toLocaleTimeString()
    });

    alert("Stock reportado con éxito");
    window.location.href = "lista.html";
};
