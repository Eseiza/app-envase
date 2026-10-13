// ============================================================
// JORNADA DE PRODUCCIÓN (fecha con la que se guarda todo en historial/{fecha})
//
//   LUNES      lunes 8:30      -> martes 8:30
//   MARTES     martes 8:30     -> miércoles 8:30
//   MIÉRCOLES  miércoles 8:30  -> jueves 8:30
//   JUEVES     jueves 8:30     -> viernes 8:30
//   VIERNES    viernes 8:30    -> sábado 8:30
//   SÁBADO     sábado 8:30     -> lunes 8:30   (incluye todo el domingo)
//
// Regla: antes de las 8:30 se pertenece a la jornada del día anterior, y el
// domingo no existe como jornada (cae en el sábado).
// Devuelve el formato que usa la base: d-m-aaaa (sin ceros a la izquierda).
// ============================================================
function getFechaJornada(momento) {
    const d = new Date(momento ? new Date(momento).getTime() : Date.now());
    const min = d.getHours() * 60 + d.getMinutes();
    if (min < 510) d.setDate(d.getDate() - 1);        // antes de 08:30 -> jornada del día anterior
    if (d.getDay() === 0) d.setDate(d.getDate() - 1); // domingo -> sábado
    return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
}
