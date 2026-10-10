// Explorador de relaciones (plan Datina Lab). Página aparte: no usa datina.js. Lee datos/relaciones.json, que arma scripts/relaciones.py
// desde el catálogo datos/manual/relaciones.json, y lo muestra como grafo (D3) y como tabla, con la misma información en las dos vistas.
// El grafo se calcula entero antes de dibujarse (sin simulación: tres columnas ordenadas) y se dibuja quieto: no hay movimiento que
// seguir con la vista, así que no cambia con movimiento reducido.
(function () {
  "use strict";
  const raiz = document.getElementById("relaciones");
  if (!raiz || !window.d3) return;
  const $ = id => document.getElementById(id);
  const REDUCIR = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ANGOSTO = matchMedia("(max-width: 760px)");
  const TIPO_NOMBRE = {fuente: "Organismo", conjunto: "Archivo", indicador: "Ficha"};
  const TIPO_ORDEN = {fuente: 0, conjunto: 1, indicador: 2};
  const SIMBOLO = {fuente: d3.symbolCircle, conjunto: d3.symbolSquare, indicador: d3.symbolDiamond};
  const TAM = {fuente: 150, conjunto: 70, indicador: 90};
  const REL = {publica: "publica", alimenta: "alimenta", calcula: "se calcula a partir de"};
  const ICONO = {fuente: '<circle r="6" class="rx-n-fuente"/>', conjunto: '<rect x="-5.5" y="-5.5" width="11" height="11" class="rx-n-conjunto"/>',
    indicador: '<path d="M0-7L7 0 0 7-7 0Z" class="rx-n-indicador"/>'};
  const esc = t => String(t ?? "").replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"})[c]);
  const sinTildes = t => String(t ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  const E = {vista: ANGOSTO.matches ? "tabla" : "grafo", elegido: null, foco: null, tipos: new Set(["fuente", "conjunto", "indicador"])};
  let D, N, porId, entra, sale, visibles = [], zoom, svg, capa, transformacion = d3.zoomIdentity, inicial = d3.zoomIdentity;

  fetch(raiz.dataset.datos).then(r => r.json()).then(datos => { D = datos; preparar(); dibujarTodo(); })
    .catch(() => { $("rx-vacio-grafo").hidden = false; $("rx-vacio-grafo").textContent = "No se pudieron cargar los datos del explorador."; });

  function preparar() {
    N = D.nodos;
    porId = new Map(N.map(n => [n.id, n]));
    entra = new Map(N.map(n => [n.id, []]));
    sale = new Map(N.map(n => [n.id, []]));
    for (const a of D.aristas) { sale.get(a.de).push(a); entra.get(a.a).push(a); }
    // tema de cada nodo: el de sus fichas (un archivo o un organismo puede servir a varias secciones)
    const temas = n => {
      if (n._temas) return n._temas;
      n._temas = new Set(n.tipo === "indicador" ? [n.seccion] : []);
      for (const a of sale.get(n.id)) if (a.tipo !== "calcula") for (const t of temas(porId.get(a.a))) n._temas.add(t);
      return n._temas;
    };
    N.forEach(temas);
    $("rx-muestra").hidden = !D.muestra;
  }

  // ---------- qué se ve ----------
  function calcularVisibles() {
    visibles = N.filter(n => E.tipos.has(n.tipo));
    const vis = new Set(visibles.map(n => n.id));
    return {nodos: visibles, aristas: D.aristas.filter(a => vis.has(a.de) && vis.has(a.a))};
  }

  function dibujarTodo() {
    const v = calcularVisibles();
    contar(v);
    dibujarGrafo(v);
    dibujarTabla(v);
    mostrarVista();
  }

  function contar(v) {
    const n = t => v.nodos.filter(x => x.tipo === t).length;
    $("rx-cuenta").textContent = `${n("fuente")} organismos, ${n("conjunto")} archivos y ${n("indicador")} fichas`;
  }

  // ---------- grafo ----------
  function dibujarGrafo(v) {
    const caja = $("rx-grafo");
    const ancho = caja.clientWidth || 900, alto = caja.clientHeight || 600;
    svg = d3.select("#rx-svg").attr("viewBox", `0 0 ${ancho} ${alto}`);
    svg.selectAll("*").remove();
    svg.append("defs").append("marker").attr("id", "rx-flecha").attr("viewBox", "0 -4 8 8").attr("refX", 14).attr("markerWidth", 7)
      .attr("markerHeight", 7).attr("orient", "auto").append("path").attr("d", "M0,-4L8,0L0,4").attr("fill", "var(--muted)");
    capa = svg.append("g");
    const nodos = v.nodos.map(n => Object.assign(n, {x: undefined, y: undefined}));
    // Tres columnas (organismos, archivos y fichas) y, dentro de cada una, un orden que cruza pocas líneas: cada punto va a la altura
    // promedio de sus vecinos de la columna de al lado (método del baricentro, unas vueltas hacia cada lado). Es una disposición fija:
    // no hay simulación ni movimiento.
    const PASO = 20, W = Math.max(ancho, 960);
    const X = {fuente: W * 0.14, conjunto: W * 0.44, indicador: W * 0.70};
    const col = {fuente: [], conjunto: [], indicador: []};
    for (const n of ordenados(nodos)) col[n.tipo].push(n);
    const vis = new Set(nodos.map(n => n.id));
    const vecinosEn = (n, tipo) => [...entra.get(n.id).map(a => a.de), ...sale.get(n.id).map(a => a.a)]
      .filter(id => vis.has(id) && porId.get(id).tipo === tipo).map(id => porId.get(id));
    const pos = new Map();
    const fijar = t => col[t].forEach((n, i) => pos.set(n.id, i / Math.max(1, col[t].length - 1)));
    // las fichas empiezan agrupadas por sección, en el orden del sitio
    const ordenSec = new Map(D.secciones.map((s, i) => [s[0], i]));
    col.indicador.sort((a, b) => (ordenSec.get(a.seccion) ?? 99) - (ordenSec.get(b.seccion) ?? 99) || a.nombre.localeCompare(b.nombre, "es"));
    ["fuente", "conjunto", "indicador"].forEach(fijar);
    const baricentro = (t, desde) => {
      const m = n => { const vs = vecinosEn(n, desde); return vs.length ? d3.mean(vs, x => pos.get(x.id)) : pos.get(n.id); };
      const val = new Map(col[t].map(n => [n.id, m(n)]));
      col[t].sort((a, b) => val.get(a.id) - val.get(b.id));
      fijar(t);
    };
    for (let i = 0; i < 4; i++) {
      baricentro("conjunto", "indicador"); baricentro("fuente", "conjunto");
      baricentro("conjunto", "fuente"); baricentro("indicador", "conjunto");
    }
    const H = PASO * Math.max(col.fuente.length, col.conjunto.length, col.indicador.length, 8);
    for (const t of ["fuente", "conjunto", "indicador"]) {
      const paso = Math.min(H / Math.max(1, col[t].length), t === "fuente" ? 48 : 32);
      const alto0 = paso * (col[t].length - 1);
      col[t].forEach((n, i) => { n.x = X[t]; n.y = (H - alto0) / 2 + i * paso; });
    }
    const enlaces = v.aristas.map(a => ({source: porId.get(a.de), target: porId.get(a.a), tipo: a.tipo}));
    const arco = d => {
      if (d.source.x === d.target.x) {
        const dy = Math.abs(d.target.y - d.source.y), x = d.source.x + Math.min(120, 20 + dy / 3);
        return `M${d.source.x},${d.source.y}C${x},${d.source.y} ${x},${d.target.y} ${d.target.x},${d.target.y}`;
      }
      const dx = d.target.x - d.source.x;
      return `M${d.source.x},${d.source.y}C${d.source.x + dx / 2},${d.source.y} ${d.target.x - dx / 2},${d.target.y} ${d.target.x},${d.target.y}`;
    };
    capa.append("g").selectAll("path").data(enlaces).join("path")
      .attr("class", d => `rx-arista ${d.tipo}`).attr("d", arco)
      .attr("marker-end", d => d.tipo === "calcula" ? "url(#rx-flecha)" : null);
    const g = capa.append("g").selectAll("g").data(nodos, n => n.id).join("g")
      .attr("class", n => `rx-nodo ${n.tipo}`).attr("transform", n => `translate(${n.x},${n.y})`)
      .on("click", (ev, n) => { ev.stopPropagation(); elegir(n.id); });
    g.append("path").attr("d", n => d3.symbol(SIMBOLO[n.tipo], TAM[n.tipo])());
    g.append("text").attr("x", n => n.tipo === "fuente" ? -10 : 9).attr("dy", "0.32em")
      .attr("text-anchor", n => n.tipo === "fuente" ? "end" : "start").text(n => n.tipo === "fuente" ? (n.sigla || n.nombre) : corto(n.nombre));
    g.append("title").text(n => `${TIPO_NOMBRE[n.tipo]}: ${n.nombre}`);
    svg.on("click", () => elegir(null));

    zoom = d3.zoom().scaleExtent([0.15, 6]).filter(ev => (ev.type !== "wheel" || ev.ctrlKey || ev.metaKey) && !ev.button)
      .on("zoom", ev => {
        transformacion = ev.transform;
        capa.attr("transform", ev.transform);
        $("rx-grafo").classList.toggle("rx-cerca", ev.transform.k > 1.6);
      });
    svg.call(zoom).on("dblclick.zoom", null);
    // vista inicial: todo el ancho, desde arriba (con muchos puntos el alto no entra: se baja arrastrando)
    if (nodos.length) {
      const [x0, x1] = d3.extent(nodos, n => n.x), [y0, y1] = d3.extent(nodos, n => n.y);
      const k = Math.min(1.6, (ancho - 40) / (x1 - x0 + 360), (alto - 80) / Math.max(1, Math.min(y1 - y0, alto * 2.2)));
      const alto1 = (y1 - y0) * k;
      const ty = alto1 < alto - 80 ? (alto - alto1) / 2 - y0 * k : 56 - y0 * k;
      inicial = d3.zoomIdentity.translate(ancho / 2 - ((x0 + x1) / 2 + 60) * k, ty).scale(k);
      svg.call(zoom.transform, inicial);
    }
    if (!REDUCIR) capa.attr("opacity", 0).transition().duration(300).attr("opacity", 1);
    $("rx-vacio-grafo").hidden = nodos.length > 0;
    if (!nodos.length) $("rx-vacio-grafo").textContent = "No hay nada para mostrar con estos filtros.";
    resaltar();
  }

  const corto = t => t.length > 48 ? t.slice(0, 46) + "…" : t;

  // lo que se resalta al elegir un punto: toda la cadena hacia arriba (de dónde sale) y hacia abajo (a qué lleva)
  function vecinos(id) {
    const s = new Set([id]);
    if (!id) return s;
    const subir = x => { for (const a of entra.get(x)) if (!s.has(a.de)) { s.add(a.de); subir(a.de); } };
    const bajar = x => { for (const a of sale.get(x)) if (!s.has(a.a)) { s.add(a.a); bajar(a.a); } };
    subir(id); bajar(id);
    return s;
  }

  function resaltar() {
    if (!capa) return;
    const sel = E.elegido, vec = vecinos(sel);
    capa.selectAll(".rx-nodo").classed("elegido", n => n.id === sel).classed("vecina", n => sel && vec.has(n.id) && n.id !== sel)
      .classed("foco", n => n.id === E.foco).classed("rx-tenue", n => sel && !vec.has(n.id));
    const enCadena = d => vec.has(d.source.id) && vec.has(d.target.id);
    capa.selectAll(".rx-arista").classed("vecina", d => sel && enCadena(d)).classed("rx-tenue", d => sel && !enCadena(d));
    document.querySelectorAll("#rx-filas tr").forEach(tr => tr.classList.toggle("elegido", tr.dataset.id === sel));
  }

  function elegir(id) {
    E.elegido = id;
    resaltar();
    const n = id && porId.get(id);
    $("rx-estado").textContent = n ? `${TIPO_NOMBRE[n.tipo]} elegido: ${n.nombre}. ${entra.get(id).length + sale.get(id).length} relaciones.` : "";
  }

  // zoom con los botones y el teclado
  const zoomPor = k => svg.transition().duration(REDUCIR ? 0 : 200).call(zoom.scaleBy, k);
  $("rx-mas").addEventListener("click", () => zoomPor(1.5));
  $("rx-menos").addEventListener("click", () => zoomPor(1 / 1.5));
  $("rx-reset").addEventListener("click", () => svg.transition().duration(REDUCIR ? 0 : 200).call(zoom.transform, inicial));
  $("rx-centrar").addEventListener("click", centrar);
  function centrar() {
    const n = porId.get(E.elegido || E.foco);
    if (!n || n.x == null) return;
    const caja = $("rx-grafo"), k = Math.max(transformacion.k, 1.8);
    svg.transition().duration(REDUCIR ? 0 : 200).call(zoom.transform,
      d3.zoomIdentity.translate(caja.clientWidth / 2, caja.clientHeight / 2).scale(k).translate(-n.x, -n.y));
  }
  // teclado en el grafo: las flechas recorren los puntos en el orden de la tabla, Enter elige, Escape suelta
  $("rx-svg").addEventListener("keydown", ev => {
    const orden = ordenados(visibles);
    if (!orden.length) return;
    let i = orden.findIndex(n => n.id === E.foco);
    if (["ArrowDown", "ArrowRight"].includes(ev.key)) i = Math.min(orden.length - 1, i + 1);
    else if (["ArrowUp", "ArrowLeft"].includes(ev.key)) i = Math.max(0, i - 1);
    else if (ev.key === "Home") i = 0;
    else if (ev.key === "End") i = orden.length - 1;
    else if (ev.key === "Enter" || ev.key === " ") { if (E.foco) elegir(E.foco); ev.preventDefault(); return; }
    else if (ev.key === "Escape") { elegir(null); return; }
    else if (ev.key === "+" || ev.key === "=") { zoomPor(1.5); return; }
    else if (ev.key === "-") { zoomPor(1 / 1.5); return; }
    else if (ev.key === "0") { svg.call(zoom.transform, inicial); return; }
    else return;
    ev.preventDefault();
    E.foco = orden[Math.max(0, i)].id;
    const n = porId.get(E.foco);
    $("rx-estado").textContent = `${TIPO_NOMBRE[n.tipo]}: ${n.nombre}. ${i + 1} de ${orden.length}.`;
    resaltar();
    centrar();
  });

  const ordenados = lista => lista.slice().sort((a, b) => TIPO_ORDEN[a.tipo] - TIPO_ORDEN[b.tipo] || a.nombre.localeCompare(b.nombre, "es"));

  // ---------- tabla ----------
  function dibujarTabla(v) {
    const vis = new Set(v.nodos.map(n => n.id));
    const boton = id => { const n = porId.get(id); return `<button type="button" class="enlace" data-ir="${esc(id)}">${esc(n.tipo === "fuente" ? (n.sigla || n.nombre) : n.nombre)}</button>`; };
    const lista = arr => arr.length ? `<ul class="rx-rel">${arr.map(x => `<li>${x}</li>`).join("")}</ul>` : "<span aria-label=\"ninguna\">—</span>";
    const tema = n => [...n._temas].map(t => (D.secciones.find(s => s[0] === t) || [, t])[1]).join(", ");
    $("rx-filas").innerHTML = ordenados(v.nodos).map(n => `<tr data-id="${esc(n.id)}">
      <td><svg viewBox="-8 -8 16 16" aria-hidden="true">${ICONO[n.tipo]}</svg>${TIPO_NOMBRE[n.tipo]}</td>
      <td>${boton(n.id)}</td><td>${esc(tema(n))}</td>
      <td>${lista(entra.get(n.id).filter(a => vis.has(a.de)).map(a => boton(a.de) + (a.tipo === "calcula" ? " (se calcula a partir de)" : "")))}</td>
      <td>${lista(sale.get(n.id).filter(a => vis.has(a.a)).map(a => boton(a.a)))}</td></tr>`).join("");
    $("rx-vacio-tabla").hidden = v.nodos.length > 0;
    $("rx-vacio-tabla").textContent = "No hay nada para mostrar con estos filtros.";
    resaltar();
  }
  $("rx-filas").addEventListener("click", ev => {
    const b = ev.target.closest("[data-ir]");
    if (b) elegir(b.dataset.ir);
  });

  // ---------- vista y filtros de tipo ----------
  function mostrarVista() {
    $("rx-grafo").hidden = E.vista !== "grafo";
    $("rx-tabla").hidden = E.vista !== "tabla";
    const conm = $("rx-vista");
    conm.querySelectorAll("button").forEach((b, i) => {
      const si = b.dataset.vista === E.vista;
      b.setAttribute("aria-pressed", si);
      if (si) conm.style.setProperty("--i", i);
    });
  }
  $("rx-vista").addEventListener("click", ev => {
    const b = ev.target.closest("button[data-vista]");
    if (!b || b.dataset.vista === E.vista) return;
    E.vista = b.dataset.vista;
    mostrarVista();
    // el grafo se dibuja con el tamaño real de su caja, que es cero mientras está oculta
    if (E.vista === "grafo") dibujarGrafo(calcularVisibles());
  });
  document.querySelectorAll(".rx-tipo").forEach(b => b.addEventListener("click", () => {
    const t = b.dataset.tipo, si = b.getAttribute("aria-pressed") !== "true";
    if (!si && E.tipos.size === 1) return;
    b.setAttribute("aria-pressed", si);
    si ? E.tipos.add(t) : E.tipos.delete(t);
    dibujarTodo();
  }));
  let espera;
  addEventListener("resize", () => { clearTimeout(espera); espera = setTimeout(() => { if (D && E.vista === "grafo") dibujarGrafo(calcularVisibles()); }, 200); });
})();
