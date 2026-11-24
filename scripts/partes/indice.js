// Parte de datina.js que usa solo indice.html (Tu índice). Plan técnico, fase 5 (24 de noviembre de 2026): 03_construir_sitio.py la publica
// en sitio/partes/indice.html.js, achicada como datina.js, y solo esa página la pide, antes de datina.js. Acá solo se anota: datina.js la corre
// con parte("indice.html") en el mismo lugar donde estaba este código, así que tiene a mano todo lo que datina.js definió antes y corre en el
// mismo orden que cuando era un solo archivo. Lo que se declara acá adentro queda para esta parte.
window.DATINA_PARTES = window.DATINA_PARTES || {};
window.DATINA_PARTES["indice"] = () => {
/* ---------- tu índice: pesos elegidos por cada persona, al estilo del Índice para una Vida Mejor de la OCDE ---------- */
const IX = (() => {
  const F = T.cruces_provincias, M = Object.fromEntries(R.cruces.map(m => [m.id, m]));
  const LOG = new Set(["velocidad", "turistas_eti", "densidad"]);
  const DIMS = [
    {id: "salud", nombre: "Salud", c: "#C8102E", ind: [["esperanza_vida", 1], ["mortalidad_infantil", -1], ["sin_cobertura", -1]]},
    {id: "educacion", nombre: "Educación", c: "#2C74B5", ind: [["escolarizacion", 1], ["aprender_mat", 1], ["aprender_len", 1]]},
    {id: "trabajo", nombre: "Trabajo y salarios", c: "#B27A00", ind: [["empleo_privado", 1], ["salario", 1]]},  // el salario reemplazó a las exportaciones el 14 de noviembre de 2026 (decisión del autor)
    {id: "vivienda", nombre: "Vivienda y servicios", c: "#7A4FA0", ind: [["agua_red", 1], ["cloaca", 1], ["nbi", -1]]},
    {id: "conectividad", nombre: "Conectividad", c: "#74ACDF", ind: [["internet", 1], ["computadora", 1], ["velocidad", 1]]},
    {id: "seguridad", nombre: "Seguridad", c: "#18212B", ind: [["homicidios", -1], ["robos", -1], ["viales", -1]]},
    {id: "ambiente", nombre: "Ambiente", c: "#3E8E5A", ind: [["protegida", 1]]},
  ].map(d => ({...d, ind: d.ind.filter(([k]) => M[k])})).filter(d => d.ind.length);
  // cada indicador va de 0 (el peor valor entre las 24) a 10 (el mejor)
  const escala = {};
  DIMS.forEach(d => d.ind.forEach(([k, sg]) => {
    const t = v => LOG.has(k) ? Math.log10(v) : v, vals = F.map(f => f[k]).filter(v => v != null).map(t);
    const lo = Math.min(...vals), hi = Math.max(...vals);
    escala[k] = v => v == null ? null : (sg > 0 ? (t(v) - lo) : (hi - t(v))) / (hi - lo) * 10;
  }));
  const puntaje = F.map(f => ({f, dim: Object.fromEntries(DIMS.map(d => {
    const v = d.ind.map(([k]) => escala[k](f[k])).filter(x => x != null);
    return [d.id, v.length ? v.reduce((a, b) => a + b, 0) / v.length : 5];
  }))}));
  let pesos = Object.fromEntries(DIMS.map(d => [d.id, 1]));
  const q = (new URLSearchParams(location.search).get("ix") || "").split(",").map(Number);
  if (q.length === DIMS.length && q.every(v => v >= 0 && v <= 5)) DIMS.forEach((d, i) => pesos[d.id] = q[i]);
  const total = (p, w) => { const sw = DIMS.reduce((a, d) => a + w[d.id], 0) || 1; return DIMS.reduce((a, d) => a + w[d.id] * p.dim[d.id], 0) / sw; };
  const iguales = Object.fromEntries(DIMS.map(d => [d.id, 1]));
  const ordenIgual = [...puntaje].sort((a, b) => total(b, iguales) - total(a, iguales)).map(p => p.f.codigo_indec);

  const caja = document.getElementById("ix-pesos");
  if (!caja) return {puntaje, DIMS};
  caja.innerHTML = DIMS.map(d => `<label class="ix-peso"><i style="background:${d.c}"></i><span>${d.nombre}</span><output id="ixo-${d.id}">${pesos[d.id]}</output>
    <input type="range" min="0" max="5" step="1" value="${pesos[d.id]}" data-d="${d.id}" aria-label="Peso de ${d.nombre}">
    <small>${d.ind.map(([k]) => M[k].nombre).join(", ")}</small></label>`).join("") +
    `<button type="button" class="boton chico ix-reset" id="ix-reset">Pesos iguales</button>`;
  const guardar = () => { const u = new URL(location.href); u.searchParams.set("ix", DIMS.map(d => pesos[d.id]).join(",")); history.replaceState(history.state, "", u); };
  caja.addEventListener("input", ev => {
    const i = ev.target.closest("input"); if (!i) return;
    pesos[i.dataset.d] = +i.value; document.getElementById(`ixo-${i.dataset.d}`).textContent = i.value; guardar(); dibujar(true);
  });
  document.getElementById("ix-reset").addEventListener("click", () => {
    pesos = {...iguales}; caja.querySelectorAll("input").forEach(i => { i.value = 1; document.getElementById(`ixo-${i.dataset.d}`).textContent = 1; }); guardar(); dibujar(true);
  });
  document.getElementById("ix-leyenda").innerHTML = DIMS.map(d => `<span><i style="background:${d.c}"></i>${d.nombre}</span>`).join("");
  // los años de los indicadores salen de su período en Cruces (antes "entre 2022 y 2026" escrito a mano)
  const IX_ANIOS = DIMS.flatMap(d => d.ind.flatMap(([k]) => (String(M[k]?.periodo || "").match(/\d{4}/g) || []).map(Number)));
  document.getElementById("ix-nota").textContent = "Cada indicador se lleva a una escala de 0 a 10: 0 es el peor valor entre las 24 jurisdicciones y 10, el mejor. La velocidad de internet se pasa antes a escala logarítmica, para que un valor extremo no aplaste al resto. Cada dimensión es el promedio de sus indicadores, y el índice, el promedio de las dimensiones con los pesos elegidos. Si a una jurisdicción le falta un indicador, su dimensión se calcula con los demás. Los indicadores son de años distintos, entre " + Math.min(...IX_ANIOS) + " y " + Math.max(...IX_ANIOS) + ". No es un índice oficial: muestra cómo cambia el orden según lo que cada uno valora. Los pesos elegidos quedan en el enlace, para compartirlo.";

  let yPrev = {};
  function dibujar(anim) {
    const el = G("indice"); if (!el || !el.offsetParent) return;
    const sw = DIMS.reduce((a, d) => a + pesos[d.id], 0);
    const datos = [...puntaje].map(p => ({...p, t: total(p, pesos)})).sort((a, b) => b.t - a.t);
    const angosto = el.clientWidth < 520, fila = angosto ? 20 : 24;
    const C = lienzo(el, datos.length * fila + 30, {t: 22, r: 44, b: 8, l: angosto ? 112 : 140});
    const {g, iw} = C, x = d3.scaleLinear().domain([0, 10]).range([0, iw]);
    g.append("g").attr("class", "eje").call(d3.axisTop(x).ticks(5).tickSize(0).tickPadding(6)).call(a => a.select(".domain").remove());
    const filas = g.selectAll("g.f").data(datos, d => d.f.codigo_indec).join("g").attr("class", "f")
      .attr("opacity", d => prov && d.f.codigo_indec !== prov ? .6 : 1);
    const destino = (d, i) => `translate(0,${i * fila})`;
    filas.attr("transform", (d, i) => yPrev[d.f.codigo_indec] != null ? `translate(0,${yPrev[d.f.codigo_indec]})` : destino(d, i));
    if (anim && !REDUCIR) filas.transition().duration(DUR_G).ease(EASE).attr("transform", destino); else filas.attr("transform", destino);
    yPrev = Object.fromEntries(datos.map((d, i) => [d.f.codigo_indec, i * fila]));
    filas.each(function(d) {
      let acc = 0; const gg = d3.select(this);
      DIMS.forEach(dim => {
        const w = sw ? pesos[dim.id] * d.dim[dim.id] / sw : 0;
        gg.append("rect").attr("x", x(acc)).attr("y", 4).attr("height", fila - 9).attr("width", Math.max(0, x(w) - x(0))).attr("fill", dim.c).attr("opacity", .88);
        acc += w;
      });
    });
    filas.append("text").attr("x", -8).attr("y", fila / 2).attr("dy", ".1em").attr("text-anchor", "end")
      .attr("class", d => d.f.codigo_indec === prov ? "etq-fuerte" : "etq").text((d, i) => `${i + 1}. ${d.f.territorio}`);
    filas.append("text").attr("x", d => x(d.t) + 6).attr("y", fila / 2).attr("dy", ".1em").attr("class", "etq-suave").text(d => n1(d.t));
    filas.on("pointerenter", function(ev, d) {
      const [mx, my] = d3.pointer(ev, el);
      mostrarTip(el, `<b>${d.f.territorio}: ${n1(d.t)}</b><br>` + DIMS.map(dim => `<span style="color:${dim.c}">●</span> ${dim.nombre}: ${n1(d.dim[dim.id])}`).join("<br>"), mx, my);
    }).on("pointerleave", ocultarSiMouse);
    // lectura
    const pos = c => datos.findIndex(d => d.f.codigo_indec === c) + 1;
    const mov = datos.map(d => ({d, m: ordenIgual.indexOf(d.f.codigo_indec) + 1 - pos(d.f.codigo_indec)})).sort((a, b) => Math.abs(b.m) - Math.abs(a.m))[0];
    let t = sw === 0 ? "Todos los pesos están en cero: subí al menos uno." :
      `Con estos pesos, ${datos[0].f.territorio} queda primera, con ${n1(datos[0].t)} puntos sobre 10, y ${datos[datos.length - 1].f.territorio}, última, con ${n1(datos[datos.length - 1].t)}.`;
    if (sw && prov) t += ` ${NOMBRES[prov]} queda en el puesto ${pos(prov)} de ${datos.length}.`;
    if (sw && mov.m) t += ` Frente a pesos iguales, la que más cambia es ${mov.d.f.territorio}: ${mov.m > 0 ? "sube" : "baja"} ${Math.abs(mov.m)} ${Math.abs(mov.m) === 1 ? "puesto" : "puestos"}.`;
    document.getElementById("ix-lectura").textContent = t;
  }
  DIB.indice = dibujar;
  return {puntaje, DIMS};
})();
};
