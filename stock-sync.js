// ============================================================
// Puente app-envase -> AppStock
// Cada vez que se carga, edita o elimina un sobrante (producción), el stock de
// AppStock se actualiza en el momento. Requiere sobrantes-stock.js (misma función
// que usa AppStock, así no se suma dos veces).
// La conexión a AppStock se abre recién al usarla: las páginas de envase inician
// su propia app con "if (!firebase.apps.length)", y si esto se creara antes, esa
// condición dejaría de cumplirse.
// ============================================================
(function () {
    const CONFIG_STOCK = {
        apiKey: "AIzaSyCtMcTuEtRiR05bPQFWcFaXaVfL5hjy-Og",
        authDomain: "appstock-a009e.firebaseapp.com",
        projectId: "appstock-a009e",
        storageBucket: "appstock-a009e.firebasestorage.app",
        messagingSenderId: "908675947079",
        appId: "1:908675947079:web:672cc8896eb3ccd015ef62",
        databaseURL: "https://appstock-a009e-default-rtdb.firebaseio.com"
    };
    const TIMEOUT_MS = 12000;

    function dbStock() {
        const app = firebase.apps.find(a => a.name === 'stock') || firebase.initializeApp(CONFIG_STOCK, 'stock');
        return firebase.database(app);
    }

    function conTimeout(promesa) {
        return Promise.race([
            promesa,
            new Promise((_, rechazar) => setTimeout(
                () => rechazar(new Error('AppStock no respondió (¿sin conexión?).')), TIMEOUT_MS))
        ]);
    }

    function datos(id, fecha, s, paquetes) {
        return {
            id,
            marca: s.marca, linea: s.linea, producto: s.producto,
            paquetes,
            // Para anular no importa (solo se resta lo que ese sobrante había sumado).
            porBandeja: Number(s.paqPorBandeja) || (paquetes === null ? 1 : 0),
            fechaRomero: fecha,
            hora: s.hora || null
        };
    }

    // Alta. Si falla NO bloquea la carga: el sobrante ya quedó en romero-env y AppStock
    // lo toma después como respaldo cuando se abra.
    async function registrarSobrante({ id, fecha, marca, linea, producto, paqPorBandeja, total, hora }) {
        try {
            return await conTimeout(aplicarSobranteEnStock(dbStock(),
                datos(id, fecha, { marca, linea, producto, paqPorBandeja, hora }, Number(total))));
        } catch (e) {
            console.error('[StockSync] No se pudo registrar en AppStock (queda como respaldo):', e);
            return { aplicado: false, error: e };
        }
    }

    // Edición: aplica la diferencia. Si cambió de producto, se resta del anterior y se suma al nuevo.
    async function editarSobrante({ id, fecha, viejo, nuevo }) {
        const db = dbStock();
        const claveVieja = [viejo.marca, viejo.linea, viejo.producto].join('|');
        const claveNueva = [nuevo.marca, nuevo.linea, nuevo.producto].join('|');
        if (claveVieja !== claveNueva) {
            await conTimeout(aplicarSobranteEnStock(db, datos(id, fecha, viejo, null)));
        }
        return conTimeout(aplicarSobranteEnStock(db, { ...datos(id, fecha, nuevo, Number(nuevo.total)), reactivar: true }));
    }

    // Eliminación: primero resta del stock y recién después borra el registro.
    // Si AppStock no responde, no se borra (así el stock no queda inflado).
    async function borrarSobrante(fecha, id) {
        const ref = firebase.database().ref(`historial/${fecha}/sobrantes/${id}`);
        const s = (await ref.once('value')).val();
        if (s) await conTimeout(aplicarSobranteEnStock(dbStock(), datos(id, fecha, s, null)));
        await ref.remove();
    }

    window.StockSync = { registrarSobrante, editarSobrante, borrarSobrante };
})();
