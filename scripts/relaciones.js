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

  const Q = new URLSearchParams(location.search);
  const E = {vista: Q.get("v") || (ANGOSTO.matches ? "tabla" : "grafo"), elegido: null, foco: null, q: Q.get("q") || "", tema: Q.get("t") || "",
    fuente: Q.get("o") || "", tipos: new Set(["fuente", "conjunto", "indicador"])};
  if (!["grafo", "tabla"].includes(E.vista)) E.vista = "grafo";
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const fecha = f => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(f || ""); return m ? `${+m[3]} de ${MESES[m[2] - 1]} de ${m[1]}` : f; };
  let pasoFicha = 20;
  let D, N, porId, entra, sale, visibles = [], zoom, svg, capa, transformacion = d3.zoomIdentity, inicial = d3.zoomIdentity;

  fetch(raiz.dataset.datos).then(r => r.json()).then(datos => { D = datos; preparar(); llenarFiltros(); dibujarTodo(); elegir(Q.get("n") && porId.has(Q.get("n")) ? Q.get("n") : null, false); centrar(); })
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
  function cadena(id, dir) {
    const s = new Set([id]);
    const ir = x => { for (const a of (dir === "arriba" ? entra : sale).get(x)) { const y = dir === "arriba" ? a.de : a.a; if (!s.has(y)) { s.add(y); ir(y); } } };
    ir(id);
    return s;
  }
  function calcularVisibles() {
    let base = N;
    if (E.tema) {
      const s = new Set();
      for (const n of N) if (n.tipo === "indicador" && n.seccion === E.tema) for (const x of cadena(n.id, "arriba")) s.add(x);
      base = base.filter(n => s.has(n.id));
    }
    if (E.fuente && porId.has(E.fuente)) {
      const s = cadena(E.fuente, "abajo");
      base = base.filter(n => s.has(n.id));
    }
    visibles = base.filter(n => E.tipos.has(n.tipo));
    const vis = new Set(visibles.map(n => n.id));
    return {nodos: visibles, aristas: D.aristas.filter(a => vis.has(a.de) && vis.has(a.a))};
  }

  function dibujarTodo() {
    const v = calcularVisibles();
    contar(v);
    dibujarGrafo(v);
    dibujarTabla(v);
    vacio(v);
    mostrarVista();
    guardarEnlace();
  }

  function contar(v) {
    const n = t => v.nodos.filter(x => x.tipo === t).length;
    const plural = (k, uno, varios) => `${k} ${k === 1 ? uno : varios}`;
    let t = `${plural(n("fuente"), "organismo", "organismos")}, ${plural(n("conjunto"), "archivo", "archivos")} y ${plural(n("indicador"), "ficha", "fichas")}`;
    if (E.q) {
      const k = v.nodos.filter(x => coincide(x)).length;
      t = k ? `${plural(k, "resultado", "resultados")} para «${E.q}», entre ${t}` : `Ningún resultado para «${E.q}»`;
    }
    $("rx-cuenta").textContent = t;
  }

  // ---------- buscador ----------
  const palabras = () => sinTildes(E.q).split(/\s+/).filter(Boolean);
  function coincide(n) {
    const ps = palabras();
    if (!ps.length) return true;
    if (!n._busca) n._busca = sinTildes([n.nombre, n.sigla, n.id, n.ruta, n.fuente_texto, n.depende, n.seccion_nombre].filter(Boolean).join(" "));
    return ps.every(p => n._busca.includes(p));
  }
  function vacio(v) {
    const k = E.q ? v.nodos.filter(coincide).length : v.nodos.length;
    const msj = !v.nodos.length ? "No hay nada para mostrar con estos filtros. Probá con otro tema u organismo."
      : `Ningún organismo, archivo ni ficha coincide con «${E.q}». Probá con otra palabra o sacá los filtros.`;
    for (const id of ["rx-vacio-grafo", "rx-vacio-tabla"]) { $(id).hidden = k > 0; $(id).textContent = k > 0 ? "" : msj; }
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
    const PASO = 20;
    const col = {fuente: [], conjunto: [], indicador: []};
    for (const n of ordenados(nodos)) col[n.tipo].push(n);
    // escala inicial: todo el alto si entra, y si no, puntos a unos 12 píxeles uno del otro (se baja arrastrando). El ancho del dibujo
    // sale de esa escala, así las tres columnas ocupan el ancho de la caja
    const Halto = PASO * Math.max(col.fuente.length, col.conjunto.length, col.indicador.length, 8);
    const k0 = Math.max(0.6, Math.min(1.4, (alto - 90) / Halto));
    const W = (ancho - 60) / k0;
    const X = {fuente: W * 0.16, conjunto: W * 0.45, indicador: W * 0.70};
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
    const H = Halto;
    for (const t of ["fuente", "conjunto", "indicador"]) {
      const paso = Math.min(H / Math.max(1, col[t].length), 60);
      if (t === "indicador") pasoFicha = paso;
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
      .attr("class", n => `rx-nodo ${n.tipo}`)
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
        escalar(ev.transform.k);
        $("rx-grafo").classList.toggle("rx-cerca", ev.transform.k > 1.6);
      });
    svg.call(zoom).on("dblclick.zoom", null);
    // vista inicial: todo el ancho, desde arriba (con muchos puntos el alto no entra: se baja arrastrando)
    if (nodos.length) {
      const [y0, y1] = d3.extent(nodos, n => n.y);
      const alto1 = (y1 - y0) * k0;
      const ty = alto1 < alto - 90 ? (alto - alto1) / 2 - y0 * k0 : 64 - y0 * k0;
      inicial = d3.zoomIdentity.translate(30, ty).scale(k0);
      svg.call(zoom.transform, inicial);
    }
    if (!REDUCIR) capa.attr("opacity", 0).transition().duration(300).attr("opacity", 1);
    resaltar();
  }

  const corto = t => t.length > 48 ? t.slice(0, 46) + "…" : t;
  // al alejar, los puntos y los nombres se achican menos que el dibujo, así se siguen viendo y leyendo
  function escalar(k) {
    const s = Math.min(1.7, Math.max(1, 1 / k));
    capa.selectAll(".rx-nodo").attr("transform", n => `translate(${n.x},${n.y}) scale(${s})`);
    capa.selectAll(".rx-nodo text").attr("font-size", n => (n.tipo === "fuente" ? 12 : 11) / (k * s));
    // los nombres de las fichas se ven siempre cuando hay lugar entre una y otra
    $("rx-grafo").classList.toggle("rx-fichas-con-nombre", pasoFicha * k >= 14);
  }

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
    const sel = E.elegido, vec = vecinos(sel), q = !!E.q;
    capa.selectAll(".rx-nodo").classed("elegido", n => n.id === sel).classed("vecina", n => sel && vec.has(n.id) && n.id !== sel)
      .classed("foco", n => n.id === E.foco).classed("encontrado", n => q && !sel && coincide(n))
      .classed("rx-tenue", n => sel ? !vec.has(n.id) : q && !coincide(n));
    const enCadena = d => vec.has(d.source.id) && vec.has(d.target.id);
    capa.selectAll(".rx-arista").classed("vecina", d => sel && enCadena(d)).classed("rx-tenue", d => sel ? !enCadena(d) : q && !(coincide(d.source) && coincide(d.target)));
    document.querySelectorAll("#rx-filas tr").forEach(tr => tr.classList.toggle("elegido", tr.dataset.id === sel));
  }

  let origen = null;
  function elegir(id, mover = true) {
    if (id && !porId.has(id)) id = null;
    const antes = E.elegido;
    E.elegido = id;
    resaltar();
    panel(id ? porId.get(id) : null);
    const n = id && porId.get(id);
    $("rx-estado").textContent = n ? `${TIPO_NOMBRE[n.tipo]} elegido: ${n.nombre}. ${entra.get(id).length + sale.get(id).length} relaciones.` : "";
    guardarEnlace();
    if (n && mover) {
      if (!antes && document.activeElement && !$("rx-panel").contains(document.activeElement)) origen = document.activeElement;
      $("rx-panel").focus({preventScroll: !ANGOSTO.matches && !matchMedia("(max-width: 1080px)").matches});
    }
  }

  // ---------- panel de detalle ----------
  const MAS_ANGOSTO = matchMedia("(max-width: 1080px)");
  const ev = e => e ? `<p class="rx-ev">${esc(e.archivo)}, línea ${e.linea}<code>${esc(e.texto)}</code></p>` : "";
  const ir = id => { const n = porId.get(id); return `<button type="button" class="enlace" data-ir="${esc(id)}">${esc(n.nombre)}${n.tipo === "fuente" && n.sigla && n.sigla !== n.nombre ? ` (${esc(n.sigla)})` : ""}</button>`; };
  const fila = (t, v) => v ? `<dt>${t}</dt><dd>${v}</dd>` : "";
  function panel(n) {
    const p = $("rx-panel"), cuerpo = $("rx-p-cuerpo");
    $("rx-cuerpo").classList.toggle("abierto", !!n);
    $("rx-cerrar").hidden = !n;
    if (!n) {
      $("rx-p-tipo").textContent = "Detalle";
      $("rx-p-titulo").textContent = "Elegí un punto o una fila";
      cuerpo.innerHTML = '<p class="rx-p-vacio">Acá aparece de dónde sale y a qué lleva cada organismo, archivo o ficha, con la evidencia de cada relación.</p>';
      p.hidden = MAS_ANGOSTO.matches;
      return;
    }
    p.hidden = false;
    $("rx-p-tipo").textContent = TIPO_NOMBRE[n.tipo];
    $("rx-p-titulo").textContent = n.nombre;
    let h = "";
    const de = entra.get(n.id), a = sale.get(n.id);
    if (n.tipo === "fuente") {
      const fichas = [...cadena(n.id, "abajo")].map(x => porId.get(x)).filter(x => x.tipo === "indicador");
      h += `<dl>${fila("Sigla", esc(n.sigla))}${fila("Depende de", esc(n.depende))}${fila("Sitio", n.url ? `<a class="enlace" href="${esc(n.url)}" rel="noopener">${esc(n.url.replace(/^https?:\/\//, ""))}</a>` : "")}</dl>`;
      h += `<h4>Publica ${a.length === 1 ? "un archivo que usa" : a.length + " archivos que usa"} Datina</h4><ul>${a.map(x => `<li>${ir(x.a)}</li>`).join("")}</ul>`;
      h += `<h4>Fichas que usan sus datos (${fichas.length})</h4><ul>${ordenados(fichas).map(x => `<li>${ir(x.id)}</li>`).join("")}</ul>`;
    } else if (n.tipo === "conjunto") {
      const d = n.descarga;
      h += `<dl>${fila("Lo publica", ir(n.fuente))}${fila("Archivo", `<code>${esc(n.ruta)}</code>`)}${fila("Dirección de descarga", !n.url ? "" : /[{}]|\.\.\.|AAAA/.test(n.url)
        ? `<code>${esc(n.url)}</code><span class="rx-ev">La dirección cambia con cada edición: el programa la arma o la busca en la página del organismo.</span>`
        : `<a class="enlace" href="${esc(n.url)}" rel="noopener">${esc(n.url)}</a>`)}`
        + `${fila("Cómo llega", esc(n.origen))}${fila("Última descarga", d ? esc(fecha(d.fecha)) + (d.estado === "ok" ? ", se bajó bien" : ", falló: el sitio usa el archivo anterior") : "")}`
        + `${fila("Dónde lo baja o lo arma el sitio", ev(n.evidencia))}</dl>`;
      h += `<h4>Alimenta ${a.length === 1 ? "una ficha" : a.length + " fichas"}</h4><ul>${a.map(x => `<li>${ir(x.a)}${x.evidencia.map(ev).join("")}</li>`).join("")}</ul>`;
    } else {
      h += `<dl>${fila("Sección", n.url ? `<a class="enlace" href="${esc(n.seccion + ".html")}">${esc(n.seccion_nombre)}</a>` : esc(n.seccion_nombre))}`
        + `${fila("Fuente, como figura en la ficha", esc(n.fuente_texto))}${fila("Frecuencia", esc(n.frecuencia))}`
        + `${fila("Unidad", esc((n.unidad || []).join(", ")))}${fila("Período de la tabla", esc(n.periodo))}${fila("Cobertura", esc(n.cobertura))}`
        + `${fila("Nota de la ficha", esc(n.nota))}</dl>`;
      const arch = de.filter(x => x.tipo === "alimenta"), calc = de.filter(x => x.tipo === "calcula"), usa = a.filter(x => x.tipo === "calcula");
      h += `<h4>De dónde salen sus datos</h4><ul>${arch.map(x => { const c = porId.get(x.de); return `<li>${ir(x.de)}${c.fuente ? `<br><small>Lo publica ${ir(c.fuente)}</small>` : ""}${x.evidencia.map(ev).join("")}</li>`; }).join("")}</ul>`;
      if (calc.length) h += `<h4>Se calcula a partir de</h4><ul>${calc.map(x => `<li>${ir(x.de)}${x.evidencia.map(ev).join("")}</li>`).join("")}</ul>`;
      if (usa.length) h += `<h4>Se usa para calcular</h4><ul>${usa.map(x => `<li>${ir(x.a)}</li>`).join("")}</ul>`;
      h += `<div class="rx-acciones">${n.url ? `<a class="boton principal chico" href="${esc(n.url)}">Abrir la ficha</a>` : ""}`
        + (n.csv || []).map(c => `<a class="boton chico" href="${esc(c)}" download>Descargar ${esc(c.replace(/^datos\//, ""))}</a>`).join("") + "</div>";
    }
    cuerpo.innerHTML = h;
  }
  $("rx-p-cuerpo").addEventListener("click", e => {
    const b = e.target.closest("[data-ir]");
    if (!b) return;
    elegir(b.dataset.ir);
    if (E.vista === "grafo") centrar();
  });
  function cerrarPanel() {
    elegir(null, false);
    const o = origen && document.contains(origen) && !origen.closest("[hidden]") ? origen : (E.vista === "grafo" ? $("rx-svg") : $("rx-buscar"));
    origen = null;
    o.focus({preventScroll: true});
  }
  $("rx-cerrar").addEventListener("click", cerrarPanel);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && E.elegido && !e.defaultPrevented && document.activeElement !== $("rx-svg")) cerrarPanel(); });
  MAS_ANGOSTO.addEventListener("change", () => panel(E.elegido ? porId.get(E.elegido) : null));

  // ---------- el estado queda en el enlace, para compartirlo ----------
  function guardarEnlace() {
    const q = new URLSearchParams();
    if (E.elegido) q.set("n", E.elegido);
    if (E.vista !== (ANGOSTO.matches ? "tabla" : "grafo")) q.set("v", E.vista);
    if (E.tema) q.set("t", E.tema);
    if (E.fuente) q.set("o", E.fuente);
    if (E.q) q.set("q", E.q);
    const s = q.toString();
    history.replaceState(null, "", location.pathname + (s ? "?" + s : "") + location.hash);
  }

  // ---------- filtros ----------
  function llenarFiltros() {
    const tema = $("rx-tema"), org = $("rx-fuente");
    for (const [id, t] of D.secciones) tema.add(new Option(t, id));
    for (const n of N.filter(x => x.tipo === "fuente").sort((a, b) => a.nombre.localeCompare(b.nombre, "es")))
      org.add(new Option(n.sigla && n.sigla !== n.nombre ? `${n.nombre} (${n.sigla})` : n.nombre, n.id));
    tema.value = D.secciones.some(s => s[0] === E.tema) ? E.tema : (E.tema = "");
    org.value = porId.has(E.fuente) ? E.fuente : (E.fuente = "");
    $("rx-buscar").value = E.q;
  }
  $("rx-tema").addEventListener("change", e => { E.tema = e.target.value; dibujarTodo(); });
  $("rx-fuente").addEventListener("change", e => { E.fuente = e.target.value; dibujarTodo(); });
  let tecla;
  $("rx-buscar").addEventListener("input", e => {
    clearTimeout(tecla);
    tecla = setTimeout(() => {
      E.q = e.target.value.trim();
      if (E.elegido) { E.elegido = null; panel(null); }
      const v = calcularVisibles();
      contar(v); dibujarTabla(v); vacio(v); resaltar(); guardarEnlace();
    }, 150);
  });
  // Enter en el buscador elige el primer resultado
  $("rx-buscar").addEventListener("keydown", e => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    // primero lo que empieza con lo buscado, después las fichas, los organismos y los archivos
    const q = sinTildes(E.q), rango = {indicador: 0, fuente: 1, conjunto: 2};
    const r = visibles.filter(coincide).sort((a, b) =>
      (sinTildes(a.nombre).startsWith(q) || sinTildes(a.sigla).startsWith(q) ? 0 : 1) - (sinTildes(b.nombre).startsWith(q) || sinTildes(b.sigla).startsWith(q) ? 0 : 1)
      || rango[a.tipo] - rango[b.tipo] || a.nombre.localeCompare(b.nombre, "es"));
    if (E.q && r.length) { elegir(r[0].id); centrar(); }
  });

  // zoom con los botones y el teclado
  const zoomPor = k => svg.transition().duration(REDUCIR ? 0 : 200).call(zoom.scaleBy, k);
  $("rx-mas").addEventListener("click", () => zoomPor(1.5));
  $("rx-menos").addEventListener("click", () => zoomPor(1 / 1.5));
  $("rx-reset").addEventListener("click", () => svg.transition().duration(REDUCIR ? 0 : 200).call(zoom.transform, inicial));
  $("rx-centrar").addEventListener("click", centrar);
  // encuadra la cadena del punto elegido (o el punto con el foco del teclado)
  function centrar() {
    if (!svg || E.vista !== "grafo") return;
    const id = E.elegido || E.foco, n = porId.get(id);
    if (!n || n.x == null) return;
    const caja = $("rx-grafo"), w = caja.clientWidth, h = caja.clientHeight;
    const pts = [...(E.elegido ? vecinos(id) : [id])].map(x => porId.get(x)).filter(x => x && x.x != null && visibles.includes(x));
    const [x0, x1] = d3.extent(pts, x => x.x), [y0, y1] = d3.extent(pts, x => x.y);
    const k = Math.max(0.3, Math.min(1.6, (w - 320) / Math.max(1, x1 - x0), (h - 120) / Math.max(1, y1 - y0)));
    svg.transition().duration(REDUCIR ? 0 : 250).call(zoom.transform,
      d3.zoomIdentity.translate(w / 2, h / 2).scale(k).translate(-(x0 + x1) / 2 - 60 / k, -(y0 + y1) / 2));
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
    else if (ev.key === "Enter" || ev.key === " ") { if (E.foco) elegir(E.foco, false); ev.preventDefault(); return; }
    else if (ev.key === "Escape") { if (E.elegido) { elegir(null, false); ev.preventDefault(); } return; }
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
    $("rx-filas").innerHTML = ordenados(v.nodos.filter(coincide)).map(n => `<tr data-id="${esc(n.id)}">
      <td><svg viewBox="-8 -8 16 16" aria-hidden="true">${ICONO[n.tipo]}</svg>${TIPO_NOMBRE[n.tipo]}</td>
      <td>${boton(n.id)}</td><td>${esc(tema(n))}</td>
      <td>${lista(entra.get(n.id).filter(a => vis.has(a.de)).map(a => boton(a.de) + (a.tipo === "calcula" ? " (se calcula a partir de)" : "")))}</td>
      <td>${lista(sale.get(n.id).filter(a => vis.has(a.a)).map(a => boton(a.a)))}</td></tr>`).join("");
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
    $("rx-ayuda-grafo").hidden = E.vista !== "grafo";
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
    if (E.vista === "grafo") { dibujarGrafo(calcularVisibles()); centrar(); }
    guardarEnlace();
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
