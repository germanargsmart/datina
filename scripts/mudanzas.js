/* Mudanzas y población (25 de noviembre de 2026, docs/roadmap/MUDANZAS.md). Pedido del autor: la versión argentina de "¿Dónde gana y dónde pierde gente
   Guadalajara?" y de la migración entre provincias, con el diseño de Rutas comerciales.
   Lo copia 03_construir_sitio.py a sitio/mudanzas.js y lo pide solo mudanzas.html. Lee datos/mudanzas.json (scripts/mudanzas_sitio.py),
   datos/provincias.geojson, datos/departamentos.topo.json y datos/vecinos.topo.json. Dibuja con D3, sin otra biblioteca.
   Tres vistas: las mudanzas entre jurisdicciones (la matriz del cuadro 15 del Censo 2022), el cambio de población entre los dos censos y las viviendas sin
   personas, estas dos por departamento. Los textos no llevan cifras escritas a mano: salen de los datos.
   Celeste es ganar gente y ámbar perderla: ni bueno ni malo, por eso no van verde y rojo. La trama marca las jurisdicciones cuyo signo depende de cómo se
   cuente a quienes no dijeron de qué provincia venían. */
(() => {
  "use strict";
  const raiz = document.getElementById("mu");
  if (!raiz) return;
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
  // el mismo redondeo que el resto del sitio: mitad hacia arriba
  const dec = (v, n) => (Math.sign(v) * Math.round(Math.abs(v) * 10 ** n + 1e-9) / 10 ** n).toLocaleString("es-AR", {minimumFractionDigits: n, maximumFractionDigits: n});
  const num = v => Math.round(v).toLocaleString("es-AR"), pct = v => dec(v, 1) + "%";
  const masMenos = (v, f) => (v > 0 ? "+" : v < 0 ? "−" : "") + f(Math.abs(v));
  const mil = v => Math.abs(v) >= 1e4 ? dec(v / 1000, 1) + " mil" : num(v);
  const yE = s => (/^h?[ií](?![aeiouáéíóú])/i.test(s) ? "e " : "y ") + s;
  const lista = a => a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " " + yE(a[a.length - 1]);
  const bandera = (c, t = "") => `<img class="mu-flag${t}" src="datos/banderas/${c}.png" alt="" width="28" height="28" loading="lazy">`;
  const RM = matchMedia("(prefers-reduced-motion: reduce)");
  const mayus = s => s[0].toUpperCase() + s.slice(1);
  const PALABRA = ["cero", "una", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez"];
  const CORTO = {"86": "Sgo. del Estero", "94": "T. del Fuego"};
  // dónde se apoya cada jurisdicción en el mapa, donde el centro del dibujo no sirve: CABA en su lugar, Buenos Aires y Tierra del Fuego en su tierra firme
  const LUGAR = {"02": [-58.42, -34.61], "06": [-60.4, -37.1], "94": [-67.6, -54.15], "30": [-59.2, -32.0], "82": [-60.9, -30.4], "22": [-60.6, -26.4], "34": [-59.9, -24.7]};
  const MOTIVO = {uso_temporal: "Vacaciones o fin de semana", alquiler_venta: "En alquiler o en venta", en_construccion: "En construcción",
    residentes_ausentes: "Sus habitantes no estaban", oficina_comercio: "Oficina, consultorio o comercio", otra_situacion: "Otra situación"};
  let D, geo, topo, vec, prov = {}, cods = [], M, deps = [], depDe = {};
  const E = {vista: "mudanzas", medida: "saldo", cada: false, motivo: "", p: "", dep: "", quieto: RM.matches};
  const VISTAS = ["mudanzas", "poblacion", "viviendas"];
  const q = new URLSearchParams(location.search);
  if (VISTAS.includes(q.get("vista"))) E.vista = q.get("vista");

  Promise.all(["datos/mudanzas.json", "datos/provincias.geojson", "datos/departamentos.topo.json", "datos/vecinos.topo.json"].map(u =>
    fetch(u).then(r => { if (!r.ok) throw new Error(u); return r.json(); }))).then(([d, g, t, v]) => {
    D = d; geo = g; topo = t; vec = v;
    preparar();
    if (prov[q.get("provincia")]) E.p = q.get("provincia");
    raiz.setAttribute("aria-busy", "false");
    $("mu-estado").textContent = "Datos cargados.";
    if (window.d3 && window.topojson) armarMapa(); else { $("mu-sin-mapa").hidden = false; }
    E.p && svg ? elegir(E.p) : pintar();
  }).catch(() => { raiz.setAttribute("aria-busy", "false"); $("mu-falla").hidden = false; $("mu-estado").textContent = ""; });

  function preparar() {
    cods = D.prov.map(p => p[0]);
    M = Object.fromEntries(cods.map((o, i) => [o, Object.fromEntries(cods.map((c, j) => [c, D.m[i][j]]))]));
    for (const [c, n, viven, sinDecir, exterior, repartido, p10, p22] of D.prov) {
      const llegan = cods.reduce((s, o) => s + (o !== c ? M[o][c] : 0), 0), van = cods.reduce((s, x) => s + (x !== c ? M[c][x] : 0), 0);
      const saldo = llegan - van;
      prov[c] = {c, n, corto: CORTO[c] || n, viven, sinDecir, exterior, repartido, p10, p22, llegan, van, saldo, dudoso: saldo * repartido <= 0,
        cambio: (p22 / p10 - 1) * 100};
    }
    deps = D.dep.map(([id, n, p10, p22, dif, cambio, juntos, viven, otra, ext, viv, sin, ...mot]) => ({id, n, prov: id.slice(0, 2), p10, p22, dif, cambio, juntos, viven, otra,
      ext, viv, sin, mot: Object.fromEntries(D.motivos.map((k, i) => [k, mot[i]]))}));
    deps.forEach(d => { depDe[d.id] = d; });
  }
  const todas = () => cods.map(c => prov[c]);
  const suma = (a, f) => a.reduce((s, x) => s + f(x), 0);
  const conOrigen = () => suma(todas(), p => p.llegan), sinOrigen = () => suma(todas(), p => p.sinDecir);
  const valor = (p, k = E.medida) => k === "saldo" ? p.saldo : k === "llegan" ? p.llegan : p.van;
  const medido = p => E.cada ? valor(p) / p.viven * 1000 : valor(p);
  const fMed = v => E.medida === "saldo" ? masMenos(v, E.cada ? x => dec(x, 1) : num) : E.cada ? dec(v, 1) : num(v);
  const parteSin = d => (E.motivo ? d.mot[E.motivo] : d.sin) / d.viv * 100;
  const enP = c => `en ${prov[c].n}`;
  const nomDep = d => d.prov === "02" ? `${d.n}, CABA` : `${d.n}, ${prov[d.prov].corto}`;

  // ---- escalas de color
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const CORTES_POB = [-5, 0, 10, 20, 40], CORTES_VIV = [5, 10, 15, 25, 40];
  const clase = (v, cortes) => cortes.filter(c => v >= c).length;
  const colorPob = v => css(`--mu-pob-${clase(v, CORTES_POB) + 1}`), colorViv = v => css(`--mu-viv-${clase(v, CORTES_VIV) + 1}`);
  function colorProv(p) {
    const v = medido(p), max = Math.max(...todas().map(x => Math.abs(medido(x))));
    const t = Math.sqrt(Math.abs(v) / max);
    if (E.medida === "saldo") return p.dudoso ? "url(#mu-trama)" : v >= 0 ? d3.interpolateRgb("#EAF3FB", css("--celeste"))(t) : d3.interpolateRgb("#FDF3DC", "#EDB44A")(t);
    return E.medida === "llegan" ? d3.interpolateRgb("#F3F8FD", css("--celeste"))(t) : d3.interpolateRgb("#FDF6E6", "#EDB44A")(t);
  }

  // ---- los caminos que se dibujan
  function caminos() {
    const l = [];
    if (E.p) {
      for (const c of cods) {
        if (c === E.p) continue;
        if (E.medida !== "van" && M[c][E.p]) l.push({o: c, d: E.p, v: M[c][E.p], t: "llega"});
        if (E.medida !== "llegan" && M[E.p][c]) l.push({o: E.p, d: c, v: M[E.p][c], t: "va"});
      }
      const tope = E.medida === "saldo" ? 7 : 12;
      return ["llega", "va"].flatMap(t => l.filter(x => x.t === t).sort((a, b) => b.v - a.v).slice(0, tope));
    }
    cods.forEach((a, i) => cods.slice(i + 1).forEach(b => {
      if (E.medida === "saldo") {
        const n = M[a][b] - M[b][a];
        l.push(n >= 0 ? {o: a, d: b, v: n, t: "neto"} : {o: b, d: a, v: -n, t: "neto"});
      } else l.push({o: a, d: b, v: M[a][b], t: "bruto"}, {o: b, d: a, v: M[b][a], t: "bruto"});
    }));
    return l.sort((a, b) => b.v - a.v).slice(0, 30);
  }

  // ---- el mapa
  let svg, gZoom, zoom, proy, camino, ancho = 0, alto = 0, centro = {}, capas = {}, anima = 0, puntos = [], feats, depFeats, provFeats;
  const islas = pol => d3.geoCentroid({type: "Polygon", coordinates: pol})[0] > -62;
  function armarMapa() {
    feats = geo.features;
    depFeats = topojson.feature(topo, topo.objects.departamentos).features;
    // las Malvinas van con el color de Tierra del Fuego en las mudanzas: son parte de la provincia en el archivo
    svg = d3.select("#mu-lienzo").append("svg").attr("role", "img").attr("aria-label", "Mapa de la Argentina. Las listas y las tablas tienen los mismos datos");
    const defs = svg.append("defs");
    const tr = defs.append("pattern").attr("id", "mu-trama").attr("width", 7).attr("height", 7).attr("patternUnits", "userSpaceOnUse").attr("patternTransform", "rotate(45)");
    tr.append("rect").attr("width", 7).attr("height", 7).attr("fill", css("--mu-trama-fondo"));
    tr.append("line").attr("y2", 7).attr("stroke", css("--mu-trama-linea")).attr("stroke-width", 2.4);
    defs.append("g").attr("id", "mu-degradados");
    defs.append("clipPath").attr("id", "mu-redondo").append("circle").attr("r", 10);
    gZoom = svg.append("g");
    ["vecinos", "provincias", "departamentos", "islas", "limites", "caminos", "puntos", "nodos"].forEach(k => { capas[k] = gZoom.append("g").attr("class", "mu-c-" + k); });
    zoom = d3.zoom().scaleExtent([1, 14]).filter(ev => ev.type === "wheel" ? ev.ctrlKey : ev.type.startsWith("touch") ? ev.touches.length > 1 : !ev.button)
      .on("zoom", ev => { gZoom.attr("transform", ev.transform); escalar(ev.transform.k); });
    svg.call(zoom).on("dblclick.zoom", null).on("click", ev => { if (ev.target === svg.node() || ev.target.closest(".mu-c-vecinos")) { elegir(""); } });
    raiz.querySelectorAll("[data-z]").forEach(b => b.addEventListener("click", () => {
      if (b.dataset.z === "mas") mover(() => svg.transition().duration(RM.matches ? 0 : 220).call(zoom.scaleBy, 1.7));
      if (b.dataset.z === "menos") mover(() => svg.transition().duration(RM.matches ? 0 : 220).call(zoom.scaleBy, 1 / 1.7));
      if (b.dataset.z === "todo") { mover(() => svg.transition().duration(RM.matches ? 0 : 260).call(zoom.transform, d3.zoomIdentity)); }
      if (b.dataset.z === "mover") { E.quieto = !E.quieto; botonMover(); animar(); }
    }));
    botonMover();
    new ResizeObserver(() => { if (Math.abs($("mu-lienzo").clientWidth - ancho) > 2 || Math.abs($("mu-lienzo").clientHeight - alto) > 2) { medir(); dibujar(); } }).observe($("mu-lienzo"));
    medir();
  }
  const mover = f => f();
  function botonMover() {
    const b = raiz.querySelector('[data-z="mover"]');
    b.classList.toggle("rt-quieto", E.quieto);
    b.setAttribute("aria-label", E.quieto ? "Poner en movimiento" : "Pausar el movimiento");
    b.title = b.getAttribute("aria-label");
  }
  let kActual = 1;
  function escalar(k) {
    kActual = k;
    capas.nodos.selectAll(".mu-nodo").attr("transform", d => `translate(${centro[d.c]}) scale(${1 / k})`);
    capas.puntos.selectAll("circle").attr("r", 2.6 / k);
  }
  function medir() {
    ancho = $("mu-lienzo").clientWidth; alto = $("mu-lienzo").clientHeight;
    if (!ancho || !alto) return;
    svg.attr("viewBox", `0 0 ${ancho} ${alto}`);
    const chico = ancho < 560;
    // en la computadora la ficha va a la izquierda del mapa: la Argentina queda en lo que sobra
    const x0 = chico ? 8 : ancho > 700 ? 318 : ancho * .25, x1 = ancho - (chico ? 8 : 56);
    const cont = {type: "FeatureCollection", features: feats};
    proy = d3.geoMercator().fitExtent([[x0, 20], [x1, alto - (chico ? 12 : 22)]], cont);
    camino = d3.geoPath(proy);
    const marco = d3.geoPath(d3.geoMercator().scale(proy.scale()).translate(proy.translate()).clipExtent([[-40, -40], [ancho + 40, alto + 40]]));
    centro = Object.fromEntries(feats.map(f => {
      const c = f.properties.codigo_indec;
      const partes = f.geometry.type === "MultiPolygon" ? f.geometry.coordinates.filter(p => !islas(p)) : null;
      return [c, proy(LUGAR[c] || d3.geoCentroid(partes && partes.length ? {type: "MultiPolygon", coordinates: partes} : f))];
    }));
    capas.vecinos.selectAll("path").data(topojson.feature(vec, vec.objects.vecinos).features).join("path").attr("d", marco);
    capas.provincias.selectAll("path").data(feats, f => f.properties.codigo_indec).join(en => en.append("path")
      .on("click", (ev, f) => elegir(f.properties.codigo_indec === E.p ? "" : f.properties.codigo_indec))
      .on("pointermove", (ev, f) => senalar(ev, f.properties.codigo_indec)).on("pointerleave", () => { $("mu-tip").hidden = true; foco(""); })).attr("d", camino);
    // las Malvinas, en las vistas por departamento: son parte del país y el censo no se pudo hacer ahí
    const tdf = feats.find(f => f.properties.codigo_indec === "94");
    capas.islas.selectAll("path").data([{type: "MultiPolygon", coordinates: tdf.geometry.coordinates.filter(islas)}]).join(en => en.append("path")
      .on("pointermove", ev => cartel(ev, "<strong>Islas Malvinas</strong><span>Sin dato: no se pudo censar por la ocupación del Reino Unido</span>")).on("pointerleave", () => { $("mu-tip").hidden = true; })).attr("d", camino);
    capas.limites.selectAll("path").data([topojson.mesh(topo, topo.objects.departamentos, (a, b) => a.properties.prov !== b.properties.prov)]).join("path").attr("d", camino);
    capas.departamentos.selectAll("path").data(depFeats, f => f.properties.id).join(en => en.append("path")
      .on("click", (ev, f) => elegirDep(f.properties.id === E.dep ? "" : f.properties.id))
      .on("pointermove", (ev, f) => senalarDep(ev, f.properties.id)).on("pointerleave", () => { $("mu-tip").hidden = true; })).attr("d", camino);
  }
  const curva = (a, b) => {
    const [x1, y1] = centro[a], [x2, y2] = centro[b], dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1;
    const alza = Math.min(.24 * l, 90) + (l < 30 ? 12 : 0);
    return `M${x1},${y1}Q${(x1 + x2) / 2 - dy / l * alza},${(y1 + y2) / 2 + dx / l * alza} ${x2},${y2}`;
  };
  const colorCamino = t => css(t === "llega" ? "--mu-llega" : t === "va" ? "--mu-va" : "--mu-neutro");
  function dibujar() {
    if (!svg || !ancho) return;
    const mud = E.vista === "mudanzas";
    capas.provincias.style("display", mud ? null : "none");
    capas.departamentos.style("display", mud ? "none" : null);
    capas.islas.style("display", mud ? "none" : null);
    raiz.classList.toggle("mu-por-dep", !mud);
    raiz.querySelector('[data-z="mover"]').hidden = !mud;
    if (mud) {
      capas.provincias.selectAll("path").style("fill", f => colorProv(prov[f.properties.codigo_indec]))
        .classed("elegida", f => f.properties.codigo_indec === E.p).classed("lejos", f => E.p && f.properties.codigo_indec !== E.p);
    } else {
      capas.departamentos.selectAll("path").style("fill", f => E.vista === "poblacion" ? colorPob(depDe[f.properties.id].cambio) : colorViv(parteSin(depDe[f.properties.id])))
        .classed("elegida", f => f.properties.id === E.dep).classed("lejos", f => E.p && f.properties.prov !== E.p);
      capas.departamentos.selectAll("path.elegida").raise();
    }
    const l = mud ? caminos().reverse() : [];
    const max = d3.max(l, x => x.v) || 1, grosor = d3.scaleSqrt([0, max], [0, ancho < 560 ? 7 : 10]);
    d3.select("#mu-degradados").selectAll("linearGradient").data(l).join("linearGradient").attr("id", (x, i) => "mu-g" + i).attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", x => centro[x.o][0]).attr("y1", x => centro[x.o][1]).attr("x2", x => centro[x.d][0]).attr("y2", x => centro[x.d][1])
      .html(x => `<stop offset="0" stop-color="${colorCamino(x.t)}" stop-opacity=".12"/><stop offset="1" stop-color="${colorCamino(x.t)}" stop-opacity=".92"/>`);
    capas.caminos.selectAll("g").data(l, x => x.o + x.d + x.t).join(en => {
      const g = en.append("g");
      g.append("path").attr("class", "linea");
      g.append("path").attr("class", "toque").on("pointermove", (ev, x) => cartel(ev, `<strong>De ${esc(prov[x.o].n)} a ${esc(prov[x.d].n)}</strong><span>${x.t === "neto"
        ? `${num(x.v)} personas más que las que hicieron el camino contrario` : `${num(x.v)} personas`}</span>${x.t === "neto" ? `<span>${num(M[x.o][x.d])} fueron y ${num(M[x.d][x.o])} vinieron</span>` : ""}`))
        .on("pointerleave", () => { $("mu-tip").hidden = true; }).on("click", (ev, x) => { ev.stopPropagation(); elegir(E.p === x.d ? x.o : E.p ? (x.o === E.p ? x.d : x.o) : x.d); });
      return g;
    }).order().each(function (x, i) {
      d3.select(this).select(".linea").attr("d", curva(x.o, x.d)).attr("stroke", `url(#mu-g${i})`).attr("stroke-width", Math.max(1.2, grosor(x.v)));
      d3.select(this).select(".toque").attr("d", curva(x.o, x.d));
    });
    // los nodos: la bandera de cada jurisdicción, con su nombre donde entra
    const nodos = mud ? todas() : [];
    const sel = capas.nodos.selectAll("g.mu-nodo").data(nodos, d => d.c).join(en => {
      const g = en.append("g").attr("class", "mu-nodo");
      g.append("circle").attr("class", "aro").attr("r", 11.5);
      g.append("image").attr("href", d => `datos/banderas/${d.c}.png`).attr("x", -16).attr("y", -10).attr("width", 32).attr("height", 20).attr("preserveAspectRatio", "xMidYMid slice")
        .attr("clip-path", "url(#mu-redondo)");
      g.append("text").attr("class", "n");
      g.append("text").attr("class", "v");
      g.on("click", (ev, d) => { ev.stopPropagation(); elegir(d.c === E.p ? "" : d.c); }).on("pointermove", (ev, d) => senalar(ev, d.c)).on("pointerleave", () => { $("mu-tip").hidden = true; foco(""); });
      return g;
    });
    const enCamino = new Set(l.flatMap(x => [x.o, x.d]));
    sel.classed("lejos", d => E.p && !enCamino.has(d.c) && d.c !== E.p).classed("elegida", d => d.c === E.p);
    const chico = ancho < 560, izq = new Set(["58", "50", "70", "26", "78", "46", "10", "38"]);
    const ver = d => !chico || d.c === E.p || (!E.p && Math.abs(medido(d)) >= todas().map(x => Math.abs(medido(x))).sort((a, b) => b - a)[5]);
    sel.select(".n").text(d => ver(d) ? d.corto : "").attr("x", d => izq.has(d.c) ? -15 : 15).attr("y", -1).attr("text-anchor", d => izq.has(d.c) ? "end" : "start");
    sel.select(".v").text(d => ver(d) ? (E.p && d.c !== E.p ? "" : fMed(medido(d))) : "").attr("x", d => izq.has(d.c) ? -15 : 15).attr("y", 11).attr("text-anchor", d => izq.has(d.c) ? "end" : "start")
      .attr("class", d => "v" + (E.medida !== "saldo" ? "" : d.dudoso ? " duda" : d.saldo > 0 ? " gana" : " pierde"));
    sel.filter(ver).raise();
    sel.filter(d => d.c === E.p).raise();
    escalar(kActual);
    puntos = l.filter(x => x.v >= max * .04).flatMap((x, i) => {
      const n = x.v > max * .35 ? 3 : x.v > max * .12 ? 2 : 1;
      return d3.range(n).map(j => ({x, f: (j / n + i * .137) % 1}));
    });
    animar();
    inserto();
  }
  function animar() {
    cancelAnimationFrame(anima);
    const caminoDe = new Map(), linea = capas.caminos.selectAll(".linea").nodes();
    linea.forEach(n => { const x = d3.select(n.parentNode).datum(); caminoDe.set(x, {n, l: n.getTotalLength()}); });
    const c = capas.puntos.selectAll("circle").data(E.quieto ? [] : puntos).join("circle").attr("r", 2.6 / kActual).attr("fill", p => colorCamino(p.x.t));
    if (E.quieto || !puntos.length) return;
    let antes = 0;
    const paso = t => {
      const dt = antes ? Math.min(t - antes, 60) : 16;
      antes = t;
      if (!document.hidden) c.each(function (p) {
        const k = caminoDe.get(p.x);
        if (!k) return;
        p.f = (p.f + dt * 26 / 1000 / Math.max(k.l, 40)) % 1;
        const q2 = k.n.getPointAtLength(p.f * k.l);
        this.setAttribute("cx", q2.x); this.setAttribute("cy", q2.y); this.setAttribute("opacity", Math.min(1, p.f * 6, (1 - p.f) * 6));
      });
      anima = requestAnimationFrame(paso);
    };
    anima = requestAnimationFrame(paso);
  }
  // el recuadro de CABA y el Gran Buenos Aires, que en el mapa del país son un punto
  const GBA = new Set(["06028", "06035", "06091", "06260", "06270", "06274", "06371", "06408", "06410", "06412", "06427", "06434", "06490", "06515", "06539", "06560", "06568", "06658",
    "06749", "06756", "06760", "06805", "06840", "06861"]);
  function inserto() {
    const caja = $("mu-inserto");
    caja.hidden = E.vista === "mudanzas" || ancho < 720 || (E.p && E.p !== "02" && E.p !== "06");
    if (caja.hidden) return;
    const f = depFeats.filter(x => x.properties.prov === "02" || x.properties.prov === "06"), w = 220, h = 190;
    const p = d3.geoMercator().fitExtent([[6, 6], [w - 6, h - 6]], {type: "FeatureCollection", features: depFeats.filter(x => x.properties.prov === "02" || (GBA.has(x.properties.id) && !["06805", "06270", "06274", "06560"].includes(x.properties.id)))});
    const pa = d3.geoPath(d3.geoMercator().scale(p.scale()).translate(p.translate()).clipExtent([[0, 0], [w, h]]));
    const s = d3.select("#mu-inserto-svg").attr("viewBox", `0 0 ${w} ${h}`);
    s.selectAll("path").data(f, x => x.properties.id).join(en => en.append("path").on("click", (ev, x) => elegirDep(x.properties.id)).on("pointermove", (ev, x) => senalarDep(ev, x.properties.id))
      .on("pointerleave", () => { $("mu-tip").hidden = true; })).attr("d", pa)
      .style("fill", x => E.vista === "poblacion" ? colorPob(depDe[x.properties.id].cambio) : colorViv(parteSin(depDe[x.properties.id]))).classed("elegida", x => x.properties.id === E.dep);
  }
  function cartel(ev, html) {
    if (ev.pointerType === "touch") return;
    const t = $("mu-tip"), r = $("mu-mapa").getBoundingClientRect();
    t.innerHTML = html; t.hidden = false;
    const x = ev.clientX - r.left, y = ev.clientY - r.top;
    t.style.left = Math.min(Math.max(8, x + 16 + t.offsetWidth > r.width ? x - t.offsetWidth - 14 : x + 16), r.width - t.offsetWidth - 8) + "px";
    t.style.top = Math.min(Math.max(8, y - 20), r.height - t.offsetHeight - 8) + "px";
  }
  function foco(c) { capas.nodos.selectAll(".mu-nodo").classed("foco", d => d.c === c); }
  function senalar(ev, c) {
    const p = prov[c]; foco(c);
    cartel(ev, `<strong>${bandera(c)}${esc(p.n)}</strong><span>Llegaron ${num(p.llegan)} y se fueron ${num(p.van)}</span><span>Saldo: <b>${masMenos(p.saldo, num)}</b>${p.dudoso ? ", no alcanza para decir si gana o pierde" : ""}</span>`);
  }
  function senalarDep(ev, id) {
    const d = depDe[id];
    cartel(ev, E.vista === "poblacion"
      ? `<strong>${esc(nomDep(d))}</strong><span><b>${masMenos(d.cambio, pct)}</b> de ${D.censo_antes} a ${D.anio}${d.juntos ? ` (${esc(d.juntos)} juntos)` : ""}</span><span>${num(d.p22)} habitantes en ${D.anio}</span>`
      : `<strong>${esc(nomDep(d))}</strong><span><b>${pct(parteSin(d))}</b> de las viviendas, ${E.motivo ? esc(MOTIVO[E.motivo].toLowerCase()) : "sin personas"}</span><span>${num(E.motivo ? d.mot[E.motivo] : d.sin)} de ${num(d.viv)}</span>`);
  }

  // ---- elegir
  function enlace() {
    const u = new URLSearchParams(location.search);
    E.vista === "mudanzas" ? u.delete("vista") : u.set("vista", E.vista);
    E.p ? u.set("provincia", E.p) : u.delete("provincia");
    history.replaceState(null, "", location.pathname + (u.size ? "?" + u : "") + location.hash);
  }
  function elegir(c) {
    E.p = c; E.dep = "";
    $("mu-prov").value = c;
    if (svg) {
      const f = c && feats.find(x => x.properties.codigo_indec === c);
      let t = d3.zoomIdentity;
      if (f && E.vista !== "mudanzas") {
        const g = c === "94" ? {type: "MultiPolygon", coordinates: f.geometry.coordinates.filter(p => !islas(p))} : f;
        const [[a, b], [x, y]] = camino.bounds(g), chico = ancho < 560;
        const disp = chico ? ancho : ancho - 320, k = Math.min(12, .86 / Math.max((x - a) / disp, (y - b) / alto));
        t = d3.zoomIdentity.translate((chico ? 0 : 310) + disp / 2 - k * (a + x) / 2, alto / 2 - k * (b + y) / 2).scale(k);
      }
      svg.transition().duration(RM.matches ? 0 : 280).call(zoom.transform, t);
    }
    pintar();
  }
  function elegirDep(id) { E.dep = id; if (id) { E.p = E.p || ""; } pintar(); }

  // ---- textos, tarjetas y tablas
  const kpi = (t, cifra, sub, clase = "") => `<div class="rt-kpi${clase}"><p class="rt-k-tit">${t}</p>${cifra}<p class="rt-k-sub">${sub}</p></div>`;
  const cifra = s => `<p class="rt-k-cifra">${s}</p>`;
  const conBandera = (c, s) => `<p class="rt-k-cifra rt-k-txt">${bandera(c)}${esc(s)}</p>`;
  const origenes = c => cods.filter(o => o !== c).map(o => ({c: o, v: M[o][c]})).sort((a, b) => b.v - a.v);
  const destinos = c => cods.filter(o => o !== c).map(o => ({c: o, v: M[c][o]})).sort((a, b) => b.v - a.v);
  const pares = () => cods.flatMap(o => cods.filter(d => d !== o).map(d => ({o, d, v: M[o][d]}))).sort((a, b) => b.v - a.v);
  const tramos = () => {
    const nom = [`Perdió ${-CORTES_POB[0]}% o más`, `Perdió menos de ${-CORTES_POB[0]}%`, `Ganó menos de ${CORTES_POB[2]}%`, `Ganó de ${CORTES_POB[2]}% a ${CORTES_POB[3]}%`,
      `Ganó de ${CORTES_POB[3]}% a ${CORTES_POB[4]}%`, `Ganó ${CORTES_POB[4]}% o más`];
    return nom.map((n, i) => ({n, i, l: deps.filter(d => clase(d.cambio, CORTES_POB) === i)}));
  };
  function pintarKpis() {
    const el = $("mu-kpis"), T = todas();
    if (E.vista === "mudanzas") {
      const co = conOrigen(), so = sinOrigen(), par = pares()[0], mejor = [...T].filter(p => !p.dudoso).sort((a, b) => b.saldo - a.saldo)[0];
      el.innerHTML = kpi(`Cambiaron de jurisdicción entre ${D.desde} y ${D.anio}`, cifra(num(co + so)), `${pct((co + so) / suma(T, p => p.viven) * 100)} de las personas de 5 años y más`) +
        kpi("No dijeron de cuál venían", cifra(pct(so / (co + so) * 100)), `${num(so)} personas: el saldo se calcula sin ellas`) +
        kpi("Mayor saldo a favor", conBandera(mejor.c, mejor.n), `${masMenos(mejor.saldo, num)} personas`) +
        kpi("El camino más usado", `<p class="rt-k-cifra rt-k-txt mu-k-par">${bandera(par.o)}${esc(prov[par.o].corto)} <span class="mu-a">a</span> ${bandera(par.d)}${esc(prov[par.d].corto)}</p>`, `${num(par.v)} personas`);
    } else if (E.vista === "poblacion") {
      const p10 = suma(T, p => p.p10), p22 = suma(T, p => p.p22), baja = deps.filter(d => d.cambio < 0), masQue = deps.filter(d => d.cambio > (p22 / p10 - 1) * 100);
      const g = [...deps].filter(d => d.p22 >= 1e4).sort((a, b) => b.cambio - a.cambio)[0];
      el.innerHTML = kpi(`Población en ${D.anio}`, cifra(dec(p22 / 1e6, 1) + " millones"), `${masMenos((p22 / p10 - 1) * 100, pct)} desde ${D.censo_antes}`) +
        kpi("Departamentos que perdieron gente", cifra(`${baja.length} de ${deps.length}`), `Con los partidos y las comunas. Reúnen el ${pct(suma(baja, d => d.p22) / p22 * 100)} de la población`) +
        kpi("Crecieron más que el país", cifra(`${masQue.length} de ${deps.length}`), `Reúnen el ${pct(suma(masQue, d => d.p22) / p22 * 100)} de la población`) +
        kpi("El que más creció", `<p class="rt-k-cifra rt-k-txt">${bandera(g.prov)}${esc(g.n)}</p>`, `${masMenos(g.cambio, pct)}, entre los de 10.000 habitantes o más`);
    } else {
      const v = suma(deps, d => d.viv), s = suma(deps, d => d.sin), mot = D.motivos.map(k => ({k, v: suma(deps, d => d.mot[k])})).sort((a, b) => b.v - a.v)[0];
      const top = [...deps].filter(d => d.viv >= 1e4).sort((a, b) => parteSin(b) - parteSin(a))[0], muchas = deps.filter(d => d.sin / d.viv >= .25);
      el.innerHTML = kpi(`Viviendas sin personas en ${D.anio}`, cifra(dec(s / 1e6, 1) + " millones"), `${pct(s / v * 100)} de las viviendas particulares`) +
        kpi("El motivo más frecuente", `<p class="rt-k-cifra rt-k-txt">${MOTIVO[mot.k]}</p>`, `${pct(mot.v / s * 100)} de las viviendas sin personas`) +
        kpi(E.motivo ? MOTIVO[E.motivo] + ": la mayor parte" : "La mayor parte", `<p class="rt-k-cifra rt-k-txt">${bandera(top.prov)}${esc(top.n)}</p>`, `${pct(parteSin(top))}, entre los de 10.000 viviendas o más`) +
        kpi("Con un cuarto o más sin personas", cifra(`${muchas.length} de ${deps.length}`), "departamentos, partidos y comunas");
    }
  }
  function barraDoble(v, max) {
    const w = Math.abs(v) / max * 50;
    return `<span class="mu-doble" aria-hidden="true"><i class="${v >= 0 ? "g" : "p"}" style="${v >= 0 ? "left:50%" : `right:50%`};width:${w}%"></i></span>`;
  }
  function pintarLado() {
    const ol = $("mu-lado-lista"), tit = $("mu-lado-tit");
    if (E.vista === "mudanzas") {
      tit.textContent = {saldo: "Saldo de cada jurisdicción", llegan: "Adónde llegó más gente", van: "De dónde se fue más gente"}[E.medida] + (E.cada ? ", cada 1.000 personas" : "");
      const l = todas().sort((a, b) => medido(b) - medido(a)), max = Math.max(...l.map(p => Math.abs(medido(p))));
      ol.innerHTML = l.map(p => `<li><button type="button" data-p="${p.c}" aria-pressed="${p.c === E.p}">${bandera(p.c)}<span class="rt-b-n">${esc(p.n)}</span><span class="rt-b-x">${fMed(medido(p))}</span>${
        E.medida === "saldo" ? barraDoble(medido(p), max).replace("mu-doble", "mu-doble" + (p.dudoso ? " duda" : "")) : `<span class="rt-b-barra mu-b-${E.medida}"><i style="width:${medido(p) / max * 100}%"></i></span>`}</button></li>`).join("");
    } else {
      const pob = E.vista === "poblacion", min = pob ? 1e4 : 1e4, f = pob ? d => d.cambio : parteSin;
      const l = deps.filter(d => (!E.p || d.prov === E.p) && (pob ? d.p22 : d.viv) >= (E.p ? 0 : min) && !(pob && ["06466", "94011"].includes(d.id))).sort((a, b) => f(b) - f(a));
      const sup = E.p ? l : l.slice(0, pob ? 15 : 22), max = Math.max(...sup.map(d => Math.abs(f(d))));
      tit.textContent = pob ? (E.p ? `Departamentos de ${prov[E.p].n}` : "Los que más crecieron, desde 10.000 habitantes") : (E.p ? `Departamentos de ${prov[E.p].n}` : "Los que más tienen, desde 10.000 viviendas");
      if (E.p === "02") tit.textContent = "Comunas de CABA";
      if (E.p === "06") tit.textContent = "Partidos de Buenos Aires";
      const fila = d => `<li><button type="button" data-dep="${d.id}" aria-pressed="${d.id === E.dep}"${E.p ? ' class="sin-bandera"' : ""}>${E.p ? "" : bandera(d.prov)}<span class="rt-b-n">${esc((pob && d.juntos ? d.juntos : d.n) + (E.p ? "" : `, ${prov[d.prov].corto}`))}</span><span class="rt-b-x">${
        pob ? masMenos(d.cambio, pct) : pct(f(d))}</span>${pob ? barraDoble(d.cambio, Math.max(max, 1)) : `<span class="rt-b-barra"><i style="width:${f(d) / max * 100}%"></i></span>`}</button></li>`;
      const baja = pob && !E.p ? l.filter(d => d.cambio < 0).reverse() : [];
      ol.innerHTML = sup.map(fila).join("") + (baja.length ? `<li class="mu-corte">Los que perdieron gente, desde 10.000 habitantes</li>` + baja.map(fila).join("") : "");
    }
  }
  function pintarFicha() {
    const el = $("mu-ficha"), c = $("mu-ficha-cuerpo");
    el.hidden = !(E.p || (E.dep && E.vista !== "mudanzas"));
    if (el.hidden) return;
    const fila = (x, t) => `<li><span>${bandera(x.c)}${esc(prov[x.c].n)}</span><b>${num(x.v)}</b><small>${pct(x.v / t * 100)}</small></li>`;
    if (E.vista === "mudanzas") {
      const p = prov[E.p];
      c.innerHTML = `<div class="rt-f-cab">${bandera(p.c)}<div><h3 id="mu-ficha-tit">${esc(p.n)}</h3><p>${p.dudoso ? "No alcanza para decir si gana o pierde gente" : p.saldo > 0 ? "Llegó más gente de la que se fue" : "Se fue más gente de la que llegó"}</p></div></div>
        <dl class="rt-f-datos"><div><dt>Llegaron</dt><dd class="mu-t-llega">${num(p.llegan)}</dd></div><div><dt>Se fueron</dt><dd class="mu-t-va">${num(p.van)}</dd></div>
        <div><dt>Saldo</dt><dd>${masMenos(p.saldo, num)}</dd></div><div><dt>Cada 1.000 de 5 años y más</dt><dd>${masMenos(p.saldo / p.viven * 1000, x => dec(x, 1))}</dd></div></dl>
        <h4>De dónde vinieron</h4><ul class="rt-f-lista">${origenes(E.p).slice(0, 4).map(x => fila(x, p.llegan)).join("")}</ul>
        <h4>Adónde se fueron</h4><ul class="rt-f-lista">${destinos(E.p).slice(0, 4).map(x => fila(x, p.van)).join("")}</ul>
        <p class="mu-f-nota">Además llegaron ${num(p.sinDecir)} personas que no dijeron de qué provincia y ${num(p.exterior)} desde otro país.</p>`;
    } else if (E.dep) {
      const d = depDe[E.dep], mot = D.motivos.map(k => ({k, v: d.mot[k]})).sort((a, b) => b.v - a.v);
      c.innerHTML = `<div class="rt-f-cab">${bandera(d.prov)}<div><h3 id="mu-ficha-tit">${esc(d.n)}</h3><p>${esc(prov[d.prov].n)}</p></div></div>
        <dl class="rt-f-datos"><div><dt>Población en ${D.censo_antes}</dt><dd>${d.p10 == null ? "No existía" : num(d.p10)}</dd></div><div><dt>Población en ${D.anio}</dt><dd>${num(d.p22)}</dd></div>
        <div><dt>Cambio</dt><dd>${masMenos(d.cambio, pct)}</dd></div><div><dt>Viviendas sin personas</dt><dd>${pct(d.sin / d.viv * 100)}</dd></div>
        <div><dt>Llegaron de otra provincia desde ${D.desde}</dt><dd>${num(d.otra)}</dd></div><div><dt>Llegaron de otro país desde ${D.desde}</dt><dd>${num(d.ext)}</dd></div></dl>
        ${d.juntos ? `<p class="mu-f-nota">El cambio es el de ${esc(d.juntos)} juntos: uno se creó entre los dos censos.</p>` : ""}
        <h4>Por qué no había personas</h4><ul class="rt-f-lista">${mot.filter(x => x.v).map(x => `<li><span>${MOTIVO[x.k]}</span><b>${num(x.v)}</b><small>${pct(x.v / d.sin * 100)}</small></li>`).join("")}</ul>`;
    } else {
      const p = prov[E.p], l = deps.filter(d => d.prov === E.p), baja = l.filter(d => d.cambio < 0), viv = suma(l, d => d.viv), sin = suma(l, d => d.sin);
      const mot = D.motivos.map(k => ({k, v: suma(l, d => d.mot[k])})).sort((a, b) => b.v - a.v);
      c.innerHTML = `<div class="rt-f-cab">${bandera(p.c)}<div><h3 id="mu-ficha-tit">${esc(p.n)}</h3><p>${l.length} ${E.p === "02" ? "comunas" : E.p === "06" ? "partidos" : "departamentos"}</p></div></div>
        <dl class="rt-f-datos"><div><dt>Población en ${D.censo_antes}</dt><dd>${num(p.p10)}</dd></div><div><dt>Población en ${D.anio}</dt><dd>${num(p.p22)}</dd></div>
        <div><dt>Cambio</dt><dd>${masMenos(p.cambio, pct)}</dd></div><div><dt>Perdieron gente</dt><dd>${baja.length} de ${l.length}</dd></div>
        <div><dt>Viviendas sin personas</dt><dd>${pct(sin / viv * 100)}</dd></div><div><dt>Son</dt><dd>${num(sin)}</dd></div></dl>
        <h4>Por qué no había personas</h4><ul class="rt-f-lista">${mot.map(x => `<li><span>${MOTIVO[x.k]}</span><b>${num(x.v)}</b><small>${pct(x.v / sin * 100)}</small></li>`).join("")}</ul>`;
    }
  }
  function pintarLeyenda() {
    const el = $("mu-leyenda"), caja = (c, t) => `<span><i style="background:${c}"></i>${t}</span>`;
    if (E.vista === "mudanzas") {
      el.innerHTML = (E.medida === "saldo" ? caja("var(--celeste)", "Gana gente") + caja("#EDB44A", "Pierde gente") + `<span><i class="mu-ley-trama"></i>No se puede decir</span>` : "") +
        (E.p ? (E.medida !== "van" ? `<span><i class="mu-ley-linea" style="--c:var(--mu-llega)"></i>Llegan</span>` : "") + (E.medida !== "llegan" ? `<span><i class="mu-ley-linea" style="--c:var(--mu-va)"></i>Se van</span>` : "")
          : `<span><i class="mu-ley-linea" style="--c:var(--mu-neutro)"></i>${E.medida === "saldo" ? "Diferencia entre ida y vuelta" : "Mudanzas"}</span>`);
    } else {
      const pob = E.vista === "poblacion", c = pob ? CORTES_POB : CORTES_VIV, pre = pob ? "--mu-pob-" : "--mu-viv-";
      const s = v => pob ? masMenos(v, x => dec(x, 0)) : dec(v, 0);
      el.innerHTML = d3range(6).map(i => caja(`var(${pre}${i + 1})`, i === 0 ? `menos de ${s(c[0])}%` : i === 5 ? `${s(c[4])}% o más` : `${s(c[i - 1])} a ${s(c[i])}%`)).join("") + `<span><i class="mu-ley-trama"></i>Sin dato</span>`;
    }
  }
  const d3range = n => Array.from({length: n}, (_, i) => i);
  function pintarFrase() {
    const T = todas(), co = conOrigen(), so = sinOrigen(), gana = T.filter(p => !p.dudoso && p.saldo > 0).sort((a, b) => b.saldo - a.saldo), pierde = T.filter(p => !p.dudoso && p.saldo < 0).sort((a, b) => a.saldo - b.saldo),
      duda = T.filter(p => p.dudoso);
    let s = [];
    if (E.vista === "mudanzas" && !E.p) {
      const par = pares().slice(0, 2);
      s = [`Según el Censo ${D.anio}, ${num(co + so)} personas de 5 años y más vivían en una jurisdicción distinta de la de cinco años antes. ${num(so)} de ellas, el ${pct(so / (co + so) * 100)}, no dijeron de cuál venían.`,
        `Entre las que lo dijeron, ${lista(gana.slice(0, 3).map(p => `${p.n} (${masMenos(p.saldo, num)})`))} recibieron más gente de la que se fue. ${lista(pierde.slice(0, 3).map(p => `${p.n} (${masMenos(p.saldo, num)})`))} tuvieron los mayores saldos en contra. En ${PALABRA[duda.length] || duda.length} jurisdicciones el signo cambia si se cuenta a quienes no dijeron su provincia, así que no se puede decir si ganan o pierden: ${lista(duda.map(p => p.n).sort((a, b) => a.localeCompare(b, "es")))}.`,
        `El camino más usado fue de ${prov[par[0].o].n} a ${prov[par[0].d].n} (${num(par[0].v)} personas), y el segundo, de ${prov[par[1].o].n} a ${prov[par[1].d].n} (${num(par[1].v)}).`];
    } else if (E.vista === "mudanzas") {
      const p = prov[E.p], o = origenes(E.p), d = destinos(E.p), vecinos = o.slice(0, 3);
      s = [`Entre ${D.desde} y ${D.anio}, ${num(p.llegan)} personas de 5 años y más se mudaron a ${p.n} y dijeron desde qué jurisdicción. ${num(p.van)} hicieron el camino contrario. El saldo es de ${masMenos(p.saldo, num)} personas, ${masMenos(p.saldo / p.viven * 1000, x => dec(x, 1))} cada 1.000 habitantes de esa edad.`,
        `La mayor parte vino de ${lista(vecinos.map(x => `${prov[x.c].n} (${pct(x.v / p.llegan * 100)})`))}. Los que se fueron eligieron sobre todo ${lista(d.slice(0, 3).map(x => `${prov[x.c].n} (${pct(x.v / p.van * 100)})`))}.`,
        `Otras ${num(p.sinDecir)} personas llegaron a ${p.n} sin decir de qué provincia, el ${pct(p.sinDecir / (p.sinDecir + p.llegan) * 100)} de las que llegaron de otra. ${p.dudoso
          ? `Si se las reparte en todo el país como a las demás, el saldo pasa a ${masMenos(p.repartido, num)}: cambia de signo, y por eso no se puede decir si gana o pierde gente.`
          : `Si se las reparte en todo el país como a las demás, el saldo pasa a ${masMenos(p.repartido, num)}, con el mismo signo.`} Desde otro país llegaron ${num(p.exterior)}.`];
    } else if (E.vista === "poblacion") {
      const l = E.p ? deps.filter(d => d.prov === E.p) : deps, nom = E.p ? prov[E.p].n : "el país", tipo = E.p === "02" ? "comunas" : E.p === "06" ? "partidos" : "departamentos";
      const p10 = E.p ? prov[E.p].p10 : suma(T, p => p.p10), p22 = E.p ? prov[E.p].p22 : suma(T, p => p.p22), baja = l.filter(d => d.cambio < 0).sort((a, b) => a.cambio - b.cambio);
      s = [`Entre los censos de ${D.censo_antes} y ${D.anio}, la población de ${E.p ? nom : "todo el país"} pasó de ${num(p10)} a ${num(p22)} habitantes (${masMenos((p22 / p10 - 1) * 100, pct)}). ${baja.length
        ? `${baja.length === 1 ? (tipo === "comunas" ? "Una" : "Uno") : mayus(PALABRA[baja.length] || num(baja.length))} de ${tipo === "comunas" ? "sus" : "los"} ${l.length} ${tipo} ${baja.length === 1 ? "tenía" : "tenían"} menos gente que doce años antes.`
        : `Ninguna de las ${l.length} ${tipo} perdió gente.`.replace("Ninguna de las", tipo === "comunas" ? "Ninguna de las" : "Ninguno de los")}`];
      if (!E.p) s.push(`Que un departamento pierda gente no quiere decir que se vaciaron sus casas. El cambio junta los nacimientos, las muertes y las mudanzas, y este dato no los separa.`);
    } else {
      const l = E.p ? deps.filter(d => d.prov === E.p) : deps, v = suma(l, d => d.viv), sin = suma(l, d => d.sin), mot = D.motivos.map(k => ({k, v: suma(l, d => d.mot[k])})).sort((a, b) => b.v - a.v);
      s = [`En el Censo ${D.anio}, ${num(sin)} de las ${num(v)} viviendas particulares ${E.p ? `de ${prov[E.p].n}` : "del país"} no tenían personas presentes (${pct(sin / v * 100)}). Los motivos más frecuentes: ${lista(mot.slice(0, 3).map(x => `${MOTIVO[x.k].toLowerCase()} (${pct(x.v / sin * 100)})`))}.`];
      if (!E.p) {
        const t = tramos(), alto = t[5].l, bajo = t[0].l, medio = t.slice(1, 5).flatMap(x => x.l), r = a => pct(suma(a, d => d.sin) / suma(a, d => d.viv) * 100);
        s.push(`Hay más viviendas sin personas en los dos extremos: ${r(bajo)} en los ${bajo.length} departamentos que perdieron ${-CORTES_POB[0]}% o más de su población y ${r(alto)} en los ${alto.length} que crecieron ${CORTES_POB[4]}% o más, contra ${r(medio)} en los demás. Son pocos departamentos. En los que más crecieron, el ${pct(suma(alto, d => d.mot.uso_temporal) / suma(alto, d => d.sin) * 100)} de las viviendas sin personas son de vacaciones o fin de semana, y en los que más perdieron, el ${pct(suma(bajo, d => d.mot.uso_temporal) / suma(bajo, d => d.sin) * 100)}.`);
      }
    }
    $("mu-frase").innerHTML = s.map(x => `<p>${esc(x)}</p>`).join("");
  }
  function pintarMatriz() {
    const max = Math.sqrt(Math.max(...pares().map(x => x.v)));
    const orden = [...cods].sort((a, b) => prov[a].n.localeCompare(prov[b].n, "es"));
    $("mu-matriz").innerHTML = `<caption class="solo-lector">Personas de 5 años y más según la jurisdicción donde vivían en ${D.desde}, en las filas, y donde vivían en ${D.anio}, en las columnas</caption>
      <thead><tr><th scope="col">De / a</th>${orden.map(c => `<th scope="col" class="${c === E.p ? "marca" : ""}"><span>${esc(prov[c].corto)}</span></th>`).join("")}</tr></thead>
      <tbody>${orden.map(o => `<tr class="${o === E.p ? "marca" : ""}"><th scope="row">${esc(prov[o].corto)}</th>${orden.map(d => o === d ? `<td class="yo">·</td>`
        : `<td class="${d === E.p ? "marca" : ""}" style="--t:${(Math.sqrt(M[o][d]) / max * 100).toFixed(1)}%"${Math.sqrt(M[o][d]) / max > .62 ? ' data-f=""' : ""} title="De ${esc(prov[o].n)} a ${esc(prov[d].n)}: ${num(M[o][d])}">${num(M[o][d])}</td>`).join("")}</tr>`).join("")}</tbody>`;
  }
  let orden = {k: "saldo", sube: false};
  const COLS = [["n", "Jurisdicción", p => p.n, x => esc(x)], ["llegan", "Llegaron", p => p.llegan, num], ["van", "Se fueron", p => p.van, num], ["saldo", "Saldo", p => p.saldo, x => masMenos(x, num)],
    ["cada", "Saldo cada 1.000 de 5 años y más", p => p.saldo / p.viven * 1000, x => masMenos(x, y => dec(y, 1))], ["sin", "Sin decir de dónde", p => p.sinDecir / (p.sinDecir + p.llegan) * 100, pct],
    ["rep", "Saldo si se reparten", p => p.repartido, x => masMenos(x, num)], ["ext", "De otro país", p => p.exterior, num], ["p22", "Población", p => p.p22, num], ["cambio", "Cambio desde el censo anterior", p => p.cambio, x => masMenos(x, pct)]];
  function pintarTabla() {
    const col = COLS.find(x => x[0] === orden.k), T = todas().sort((a, b) => (typeof col[2](a) === "string" ? col[2](a).localeCompare(col[2](b), "es") : col[2](a) - col[2](b)) * (orden.sube ? 1 : -1));
    $("mu-tabla").innerHTML = `<caption class="solo-lector">Las 24 jurisdicciones: mudanzas entre ${D.desde} y ${D.anio} y población</caption><thead><tr>${COLS.map(([k, t]) =>
      `<th scope="col" aria-sort="${orden.k === k ? (orden.sube ? "ascending" : "descending") : "none"}"><button type="button" data-k="${k}">${t}</button></th>`).join("")}</tr></thead>
      <tbody>${T.map(p => `<tr class="${p.c === E.p ? "marca" : ""}">${COLS.map(([k, , v, f], i) => i ? `<td class="${k === "saldo" || k === "cada" ? (p.dudoso ? "duda" : v(p) > 0 ? "gana" : "pierde") : k === "rep" && p.dudoso ? "duda" : ""}">${f(v(p))}</td>`
        : `<th scope="row"><span>${bandera(p.c)}${esc(p.n)}</span></th>`).join("")}</tr>`).join("")}</tbody>`;
  }
  function pintarTramos() {
    const v = suma(deps, d => d.viv), s = suma(deps, d => d.sin), p22 = suma(deps, d => d.p22);
    const fila = (n, l, i) => { const a = suma(l, d => d.viv), b = suma(l, d => d.sin); return `<tr><th scope="row">${i == null ? "" : `<i style="background:var(--mu-pob-${i + 1})"></i>`}${n}</th><td>${num(l.length)}</td><td>${num(suma(l, d => d.p22))}</td><td>${pct(suma(l, d => d.p22) / p22 * 100)}</td><td>${num(a)}</td><td>${pct(b / a * 100)}</td><td>${pct(suma(l, d => d.mot.uso_temporal) / a * 100)}</td></tr>`; };
    $("mu-tramos").innerHTML = `<caption class="solo-lector">Departamentos según cuánto cambió su población entre ${D.censo_antes} y ${D.anio}</caption><thead><tr><th scope="col">Cambio de población</th><th scope="col">Departamentos</th><th scope="col">Población</th><th scope="col">Parte del país</th><th scope="col">Viviendas</th><th scope="col">Sin personas</th><th scope="col">De vacaciones</th></tr></thead>
      <tbody>${tramos().map(t => fila(t.n, t.l, t.i)).join("")}${fila("Todo el país", deps)}</tbody>`;
  }
  function pintarCorredores() {
    const l = pares().filter(x => !E.p || x.o === E.p || x.d === E.p).slice(0, 12), max = l[0].v;
    $("mu-corr-tit").textContent = E.p ? `Los caminos más usados de ${prov[E.p].n}` : "Los caminos más usados";
    $("mu-corr").innerHTML = l.map(x => `<li><button type="button" data-p="${x.o === E.p ? x.d : E.p ? x.o : x.d}"><span class="mu-corr-cab"><span class="rt-c-ruta"><span>${bandera(x.o)}${esc(prov[x.o].corto)}</span> <em>a</em> <span>${bandera(x.d)}${esc(prov[x.d].corto)}</span></span><span class="rt-c-v">${num(x.v)}</span></span>
      <span class="mu-ida" aria-hidden="true"><i class="${x.d === E.p ? "l" : x.o === E.p ? "v" : ""}" style="width:${x.v / max * 100}%"></i></span><span class="rt-c-prod">El camino contrario: ${num(M[x.d][x.o])}</span></button></li>`).join("");
  }
  function pintar() {
    raiz.querySelectorAll(".mu-vistas button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.vista === E.vista)));
    raiz.querySelectorAll(".mu-medidas button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.m === E.medida)));
    raiz.dataset.vista = E.vista;
    $("mu-prov").value = E.p;
    $("mu-cada").checked = E.cada;
    $("mu-motivo").value = E.motivo;
    raiz.querySelectorAll("[data-solo]").forEach(x => { x.hidden = !x.dataset.solo.split(" ").includes(E.vista); });
    $("mu-mapa-tit").textContent = {mudanzas: "De dónde a dónde se mudó la gente", poblacion: "Dónde creció y dónde bajó la población", viviendas: "Dónde hay viviendas sin personas"}[E.vista];
    $("mu-mapa-sub").textContent = {mudanzas: `Personas de 5 años y más, de ${D.desde} a ${D.anio}`, poblacion: `Cambio entre los censos de ${D.censo_antes} y ${D.anio}, por departamento`,
      viviendas: `Parte de las viviendas particulares, ${D.anio}, por departamento`}[E.vista];
    pintarKpis(); pintarLado(); pintarFicha(); pintarLeyenda(); pintarFrase();
    if (E.vista === "mudanzas") { pintarCorredores(); pintarMatriz(); pintarTabla(); } else pintarTramos();
    dibujar(); enlace();
  }
  raiz.addEventListener("click", ev => {
    const b = ev.target.closest("button");
    if (!b) return;
    if (b.dataset.vista) { E.vista = b.dataset.vista; E.dep = ""; const c = E.p; pintar(); if (svg) elegir(c); }
    else if (b.dataset.m) { E.medida = b.dataset.m; pintar(); }
    else if (b.dataset.p) { elegir(b.dataset.p === E.p && b.closest("#mu-lado-lista") ? "" : b.dataset.p); }
    else if (b.dataset.dep) { elegirDep(b.dataset.dep === E.dep ? "" : b.dataset.dep); }
    else if (b.dataset.k) { orden = {k: b.dataset.k, sube: orden.k === b.dataset.k ? !orden.sube : b.dataset.k === "n"}; pintarTabla(); raiz.querySelector(`[data-k="${b.dataset.k}"]`).focus(); }
    else if (b.id === "mu-ficha-cerrar") { E.dep ? elegirDep("") : elegir(""); $("mu-prov").focus(); }
  });
  raiz.addEventListener("keydown", ev => { if (ev.key === "Escape" && (E.p || E.dep)) { E.dep ? elegirDep("") : elegir(""); } });
  $("mu-prov").addEventListener("change", ev => elegir(ev.target.value));
  $("mu-cada").addEventListener("change", ev => { E.cada = ev.target.checked; pintar(); });
  $("mu-motivo").addEventListener("change", ev => { E.motivo = ev.target.value; pintar(); });
})();
