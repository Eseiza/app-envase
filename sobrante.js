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

document.getElementById('guardar-sobrante-btn').onclick = function() {
    const producto = document.getElementById('opcion-restante').options[document.getElementById('opcion-restante').selectedIndex].text;
    const columnas = document.getElementById('columnas-restante').value;
    const filas = document.getElementById('filas-adicional').value;
    const fecha = getFechaHoy();

    if (!columnas || !filas) return alert("Completa los datos");

    db.ref(`historial/${fecha}/sobrantes`).push({
        producto,
        columnas,
        filas,
        hora: new Date().toLocaleTimeString()
    });

    alert("Enviado al Supervisor");
    window.location.href = "lista.html";
};

