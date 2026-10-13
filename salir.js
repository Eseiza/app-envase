// Cierra la sesión de cualquier botón con data-salir
document.querySelectorAll('[data-salir]').forEach(function (b) {
    b.addEventListener('click', function () {
        sessionStorage.clear();
        window.location.href = 'index.html';
    });
});
