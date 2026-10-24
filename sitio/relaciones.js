// Explorador de relaciones (plan Datina Lab). Página aparte: no usa datina.js. Lee datos/relaciones.json, que arma scripts/relaciones.py
// desde el catálogo datos/manual/relaciones.json, y lo muestra como grafo (D3) y como tabla, con la misma información en las dos vistas.
// El grafo se calcula entero antes de dibujarse (sin simulación: tres columnas ordenadas) y se dibuja quieto: no hay movimiento que
// seguir con la vista, así que no cambia con movimiento reducido.
(function () {
  "use strict";
  const raiz = document.getElementById("relaciones");
  if (!raiz) return;
  // sin D3 (el archivo no llegó) el explorador no se puede armar: se avisa en lugar de dejar la página sin nada (estabilización, P2-19)
  if (!window.d3) {
    const p = document.getElementById("rx-error");
    if (p) { p.hidden = false; p.textContent = "No se pudo cargar el programa que dibuja el explorador. Probá recargar la página."; }
    return;
  }
  const $ = id => document.getElementById(id);
  const MOV = matchMedia("(prefers-reduced-motion: reduce)");
  const dur = ms => MOV.matches ? 0 : ms;
  const ANGOSTO = matchMedia("(max-width: 760px)");
  // hasta 1080 píxeles el panel va debajo de la vista, en el flujo de la página (nunca tapa nada); más ancho, en su columna
  const MAS_ANGOSTO = matchMedia("(max-width: 1080px)");
  const TIPO_NOMBRE = {fuente: "Organismo", conjunto: "Archivo", indicador: "Ficha"};
  const ELEGIDO = {fuente: "elegido", conjunto: "elegido", indicador: "elegida"};
  const TIPO_ORDEN = {fuente: 0, conjunto: 1, indicador: 2};
  const SIMBOLO = {fuente: d3.symbolCircle, conjunto: d3.symbolSquare, indicador: d3.symbolDiamond};
  const TAM = {fuente: 150, conjunto: 70, indicador: 90};
  const ICONO = {fuente: '<circle r="6" class="rx-n-fuente"/>', conjunto: '<rect x="-5.5" y="-5.5" width="11" height="11" class="rx-n-conjunto"/>',
    indicador: '<path d="M0-7L7 0 0 7-7 0Z" class="rx-n-indicador"/>'};
  const esc = t => String(t ?? "").replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"})[c]);
  const sinTildes = t => String(t ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const plural = (k, uno, varios) => `${k} ${k === 1 ? uno : varios}`;
  const lista_ = v => Array.isArray(v) ? v : [];

  const Q = new URLSearchParams(location.search);
  const E = {vista: Q.get("v") || (ANGOSTO.matches ? "tabla" : "grafo"), elegido: null, foco: null, q: Q.get("q") || "", tema: Q.get("t") || "",
    fuente: Q.get("o") || "", tipos: new Set(["fuente", "conjunto", "indicador"])};
  if (!["grafo", "tabla"].includes(E.vista)) E.vista = "grafo";
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const fecha = f => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(f || ""); return m ? `${+m[3]} de ${MESES[m[2] - 1]} de ${m[1]}` : f; };
  let pasoFicha = 20, anchoDibujo = 0;
  let D, N, porId, entra, sale, visibles = [], zoom, svg, capa, transformacion = d3.zoomIdentity, inicial = d3.zoomIdentity;

  fetch(raiz.dataset.datos)
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(datos => {
      D = datos; preparar(); llenarFiltros(); dibujarTodo();
      // al llegar desde "De dónde sale" de una ficha, el detalle de esa ficha recibe el foco (en pantallas angostas la página baja hasta él)
      const n = Q.get("n");
      if (n && porId.has(n)) { elegir(n, true); centrar(); } else elegir(null, false);
    })
    .catch(err => {
      console.warn("Explorador de relaciones:", err);
      const p = $("rx-error");
      p.hidden = false;
      p.textContent = D ? "Algunos datos del explorador vinieron incompletos y no se pudo dibujar todo. La tabla puede seguir sirviendo." :
        "No se pudieron cargar los datos del explorador. Probá recargar la página.";
    });

  // datos raros (una relación con un extremo que no está, un nombre que falta) no rompen la página: se completan o se dejan afuera
  function preparar() {
    N = lista_(D.nodos).filter(n => n && n.id && TIPO_NOMBRE[n.tipo]);
    for (const n of N) { n.nombre = String(n.nombre || n.id); n.unidad = lista_(n.unidad); n.csv = lista_(n.csv); }
    D.secciones = lista_(D.secciones);
    porId = new Map(N.map(n => [n.id, n]));
    D.aristas = lista_(D.aristas).filter(a => a && porId.has(a.de) && porId.has(a.a));
    for (const a of D.aristas) a.evidencia = lista_(a.evidencia).filter(e => e && e.archivo);
    entra = new Map(N.map(n => [n.id, []]));
    sale = new Map(N.map(n => [n.id, []]));
    for (const a of D.aristas) { sale.get(a.de).push(a); entra.get(a.a).push(a); }
    // tema de cada nodo: el de sus fichas (un archivo o un organismo puede servir a varias secciones)
    const temas = (n, en = new Set()) => {
      if (n._temas) return n._temas;
      if (en.has(n.id)) return new Set();
      en.add(n.id);
      const t = new Set(n.tipo === "indicador" && n.seccion ? [n.seccion] : []);
      for (const a of sale.get(n.id)) if (a.tipo !== "calcula") for (const x of temas(porId.get(a.a), en)) t.add(x);
      return (n._temas = t);
    };
    N.forEach(n => temas(n));
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
    // lo elegido que deja de verse con los filtros se suelta (el panel no muestra algo que no está)
    if (E.elegido && !visibles.some(n => n.id === E.elegido)) elegir(null, false);
    contar(v);
    if (E.vista === "grafo") dibujarGrafo(v);
    dibujarTabla(v);
    vacio(v);
    mostrarVista();
    guardarEnlace();
  }

  function contar(v) {
    const n = t => v.nodos.filter(x => x.tipo === t).length;
    let t = `${plural(n("fuente"), "organismo", "organismos")}, ${plural(n("conjunto"), "archivo", "archivos")} y ${plural(n("indicador"), "ficha", "fichas")}`;
    if (E.q) {
      const k = v.nodos.filter(coincide).length;
      t = k ? `${plural(k, "resultado", "resultados")} para «${E.q}», entre ${t}` : `Ningún resultado para «${E.q}»`;
    }
    $("rx-cuenta").textContent = t;
    return t;
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
    anchoDibujo = ancho;
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
    const X = {fuente: W * 0.16, conjunto: W * 0.45, indicador: W * 0.68};
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
      .on("click", (ev, n) => { ev.stopPropagation(); E.foco = n.id; elegir(n.id); });
    // zona de toque de 24 píxeles, más grande que el dibujo del punto
    g.append("circle").attr("class", "rx-toque").attr("r", 12);
    g.append("circle").attr("class", "rx-anillo").attr("r", 11);
    g.append("path").attr("class", "rx-forma").attr("d", n => d3.symbol(SIMBOLO[n.tipo], TAM[n.tipo])());
    g.append("text").attr("x", n => n.tipo === "fuente" ? -10 : 9).attr("dy", "0.32em")
      .attr("text-anchor", n => n.tipo === "fuente" ? "end" : "start").text(n => n.tipo === "fuente" ? (n.sigla || n.nombre) : corto(n.nombre));
    g.append("title").text(n => `${TIPO_NOMBRE[n.tipo]}: ${n.nombre}`);
    svg.on("click", () => elegir(null, false));

    zoom = d3.zoom().scaleExtent([0.15, 6]).filter(ev => (ev.type !== "wheel" || ev.ctrlKey || ev.metaKey) && !ev.button)
      .on("zoom", ev => {
        transformacion = ev.transform;
        capa.attr("transform", ev.transform);
        escalar(ev.transform.k);
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
    if (dur(300)) capa.attr("opacity", 0).transition().duration(300).attr("opacity", 1);
    resaltar();
  }

  const corto = t => t.length > 40 ? t.slice(0, 38) + "…" : t;
  // al alejar, los puntos y los nombres se achican menos que el dibujo, así se siguen viendo y leyendo
  function escalar(k) {
    const s = Math.min(1.7, Math.max(1, 1 / k));
    capa.selectAll(".rx-nodo").attr("transform", n => `translate(${n.x},${n.y}) scale(${s})`);
    capa.selectAll(".rx-nodo text").attr("font-size", n => (n.tipo === "fuente" ? 12 : 11) / (k * s));
    // los nombres de las fichas se ven siempre cuando hay lugar entre una y otra; los de los archivos, al acercarse
    $("rx-grafo").classList.toggle("rx-fichas-con-nombre", pasoFicha * k >= 14);
    $("rx-grafo").classList.toggle("rx-cerca", k >= 1.3);
  }

  // lo que se resalta al elegir un punto: toda la cadena hacia arriba (de dónde sale) y hacia abajo (a qué lleva)
  function vecinos(id) {
    if (!id) return new Set();
    const s = cadena(id, "arriba");
    for (const x of cadena(id, "abajo")) s.add(x);
    return s;
  }

  function resaltar() {
    const sel = E.elegido, vec = vecinos(sel), q = !!E.q;
    if (capa) {
      capa.selectAll(".rx-nodo").classed("elegido", n => n.id === sel).classed("vecina", n => sel && vec.has(n.id) && n.id !== sel)
        .classed("foco", n => n.id === E.foco).classed("encontrado", n => q && !sel && coincide(n))
        .classed("rx-tenue", n => n.id !== E.foco && (sel ? !vec.has(n.id) : q && !coincide(n)));
      const enCadena = d => vec.has(d.source.id) && vec.has(d.target.id);
      capa.selectAll(".rx-arista").classed("vecina", d => sel && enCadena(d)).classed("rx-tenue", d => sel ? !enCadena(d) : q && !(coincide(d.source) && coincide(d.target)));
      capa.selectAll(".rx-nodo.foco").raise();
    }
    document.querySelectorAll("#rx-filas tr").forEach(tr => {
      const si = tr.dataset.id === sel;
      tr.classList.toggle("elegido", si);
      const b = tr.querySelector("th [data-ir]");
      if (b) si ? b.setAttribute("aria-current", "true") : b.removeAttribute("aria-current");
    });
  }

  // ---------- elegir y el panel de detalle ----------
  let origen = null;
  // mover: llevar el foco al panel (al tocar un punto, una fila o un enlace del panel). Con Enter en el grafo el foco se queda ahí
  function elegir(id, mover = true) {
    if (id && !porId.has(id)) id = null;
    const antes = E.elegido;
    E.elegido = id;
    if (id) E.foco = id;
    // elegido desde el grafo o el panel, puede estar más abajo de las filas que se ven: la tabla se alarga hasta mostrarlo
    if (id && !document.querySelector(`#rx-filas tr[data-id="${CSS.escape(id)}"]`)) dibujarTabla(calcularVisibles(), false);
    resaltar();
    panel(id ? porId.get(id) : null);
    guardarEnlace();
    const n = id && porId.get(id);
    if (!n) return;
    const rel = entra.get(id).length + sale.get(id).length;
    if (mover) {
      // el panel se anuncia por su título al recibir el foco: no se repite en la región de estado
      const a = document.activeElement;
      if (!antes && a && a !== document.body && !$("rx-panel").contains(a)) origen = a;
      $("rx-panel").scrollTop = 0;
      // en pantallas angostas el panel va debajo de la vista: la página baja hasta su título (el panel puede ser más alto que la pantalla)
      $("rx-panel").focus({preventScroll: true});
      if (MAS_ANGOSTO.matches) $("rx-panel").scrollIntoView({block: "start"});
    } else {
      anunciar(`${TIPO_NOMBRE[n.tipo]} ${ELEGIDO[n.tipo]}: ${n.nombre}. ${plural(rel, "relación", "relaciones")}. El detalle está a continuación: apretá Tab.`);
    }
  }
  const anunciar = t => { $("rx-estado").textContent = ""; requestAnimationFrame(() => { $("rx-estado").textContent = t; }); };

  const ev = e => e ? `<div class="rx-ev"><p>${esc(e.archivo)}, línea ${esc(e.linea)}</p><code>${esc(e.texto)}</code></div>` : "";
  const ir = id => {
    const n = porId.get(id);
    if (!n) return esc(id);
    return `<button type="button" class="enlace" data-ir="${esc(id)}">${esc(n.nombre)}${n.tipo === "fuente" && n.sigla && n.sigla !== n.nombre ? ` (${esc(n.sigla)})` : ""}</button>`;
  };
  const fila = (t, v) => v ? `<dt>${t}</dt><dd>${v}</dd>` : "";
  function panel(n) {
    const p = $("rx-panel"), cuerpo = $("rx-p-cuerpo");
    $("rx-cerrar").hidden = !n;
    // el salto del comienzo de la tabla lleva al detalle de lo elegido o, sin nada elegido, a lo que sigue
    $("rx-saltar-tabla").textContent = n ? `Ir al detalle de ${n.nombre}` : "Saltar la tabla";
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
      h += `<dl>${fila("Lo publica", n.fuente ? ir(n.fuente) : "")}${fila("Archivo", `<code>${esc(n.ruta)}</code>`)}${fila("Dirección de descarga", !n.url ? "" : /[{}]|\.\.\.|AAAA/.test(n.url)
        ? `<code>${esc(n.url)}</code><span class="rx-nota">La dirección cambia con cada edición: el programa la arma o la busca en la página del organismo.</span>`
        : `<a class="enlace" href="${esc(n.url)}" rel="noopener">${esc(n.url)}</a>`)}`
        + `${fila("Cómo llega", esc(n.origen))}${fila("Última descarga", d ? esc(fecha(d.fecha)) + (d.estado === "ok" ? ", se bajó bien" : ", falló: el sitio usa el archivo anterior") : "")}`
        + `${fila("Dónde lo baja o lo arma el sitio", ev(n.evidencia))}</dl>`;
      h += `<h4>Alimenta ${a.length === 1 ? "una ficha" : a.length + " fichas"}</h4><ul>${a.map(x => `<li>${ir(x.a)}${x.evidencia.map(ev).join("")}</li>`).join("")}</ul>`;
    } else {
      h += `<dl>${fila("Sección", n.seccion ? `<a class="enlace" href="${esc(n.seccion + ".html")}">${esc(n.seccion_nombre || n.seccion)}</a>` : "")}`
        + `${fila("Fuente, como figura en la ficha", esc(n.fuente_texto))}${fila("Frecuencia", esc(n.frecuencia))}`
        + `${fila("Unidad", esc(n.unidad.join(", ")))}${fila("Período de la tabla", esc(n.periodo))}${fila("Cobertura", esc(n.cobertura))}`
        + `${fila("Nota de la ficha", esc(n.nota))}</dl>`;
      const arch = de.filter(x => x.tipo === "alimenta"), calc = de.filter(x => x.tipo === "calcula"), usa = a.filter(x => x.tipo === "calcula");
      h += `<h4>De dónde salen sus datos</h4><ul>${arch.map(x => { const c = porId.get(x.de); return `<li>${ir(x.de)}${c.fuente && porId.has(c.fuente) ? `<p class="rx-nota">Lo publica ${ir(c.fuente)}</p>` : ""}${x.evidencia.map(ev).join("")}</li>`; }).join("")}</ul>`;
      if (calc.length) h += `<h4>Se calcula a partir de</h4><ul>${calc.map(x => `<li>${ir(x.de)}${x.evidencia.map(ev).join("")}</li>`).join("")}</ul>`;
      if (usa.length) h += `<h4>Se usa para calcular</h4><ul>${usa.map(x => `<li>${ir(x.a)}</li>`).join("")}</ul>`;
      h += `<div class="rx-acciones">${n.url ? `<a class="boton principal chico" href="${esc(n.url)}">Abrir la ficha</a>` : ""}`
        + n.csv.map(c => `<a class="boton chico" href="${esc(c)}" download>Descargar ${esc(String(c).replace(/^datos\//, ""))}</a>`).join("") + "</div>";
    }
    cuerpo.innerHTML = h;
  }
  $("rx-p-cuerpo").addEventListener("click", e => {
    const b = e.target.closest("[data-ir]");
    if (!b) return;
    elegir(b.dataset.ir);
    centrar();
  });
  function cerrarPanel() {
    const id = E.elegido;
    elegir(null, false);
    // el foco vuelve a donde estaba; si se perdió (en algunos navegadores tocar no enfoca), a la fila o al grafo
    const fila = id && document.querySelector(`#rx-filas tr[data-id="${CSS.escape(id)}"] th [data-ir]`);
    const o = origen && document.contains(origen) && !origen.closest("[hidden]") ? origen : (E.vista === "tabla" && fila) || (E.vista === "grafo" ? $("rx-svg") : $("rx-buscar"));
    origen = null;
    o.focus({preventScroll: !MAS_ANGOSTO.matches});
  }
  $("rx-cerrar").addEventListener("click", cerrarPanel);
  // la tabla es larga y el detalle va después: un salto al comienzo evita recorrerla entera con Tab (revisión de accesibilidad, punto 15)
  $("rx-saltar-tabla").addEventListener("click", e => {
    e.preventDefault();
    if (E.elegido) {
      $("rx-panel").focus({preventScroll: true});
      if (MAS_ANGOSTO.matches) $("rx-panel").scrollIntoView({block: "start"});
    } else $("rx-definiciones").focus();
  });
  // Escape cierra el panel, salvo que se esté escribiendo en el buscador o eligiendo en una lista (ahí Escape es de ese control)
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape" || !E.elegido || e.defaultPrevented) return;
    if (e.target.closest && (e.target.closest(".rx-controles") || e.target === $("rx-svg"))) return;
    cerrarPanel();
  });
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
  $("rx-tema").addEventListener("change", e => { E.tema = e.target.value; dibujarTodo(); anunciar(contar(calcularVisibles())); });
  $("rx-fuente").addEventListener("change", e => { E.fuente = e.target.value; dibujarTodo(); anunciar(contar(calcularVisibles())); });
  let tecla, aviso;
  function buscar() {
    clearTimeout(tecla);
    const q = $("rx-buscar").value.trim();
    if (q === E.q) return;
    E.q = q;
    if (E.elegido) elegir(null, false);
    const v = calcularVisibles();
    const t = contar(v);
    dibujarTabla(v); vacio(v); resaltar(); guardarEnlace();
    encuadrarResultados();
    // el resultado se anuncia cuando se deja de escribir, no con cada letra
    clearTimeout(aviso);
    aviso = setTimeout(() => anunciar(t), 700);
  }
  $("rx-buscar").addEventListener("input", () => { clearTimeout(tecla); tecla = setTimeout(buscar, 150); });
  // Enter en el buscador elige la mejor coincidencia: primero lo que empieza con lo buscado, después las fichas, los organismos y los archivos
  $("rx-buscar").addEventListener("keydown", e => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    buscar();
    const q = sinTildes(E.q), rango = {indicador: 0, fuente: 1, conjunto: 2};
    const empieza = n => sinTildes(n.nombre).startsWith(q) || sinTildes(n.sigla).startsWith(q) ? 0 : 1;
    const r = visibles.filter(coincide).sort((a, b) => empieza(a) - empieza(b) || rango[a.tipo] - rango[b.tipo] || a.nombre.localeCompare(b.nombre, "es"));
    if (E.q && r.length) { elegir(r[0].id); centrar(); }
  });

  // ---------- zoom con los botones y el teclado ----------
  const zoomPor = k => svg && svg.transition().duration(dur(200)).call(zoom.scaleBy, k);
  $("rx-mas").addEventListener("click", () => zoomPor(1.5));
  $("rx-menos").addEventListener("click", () => zoomPor(1 / 1.5));
  $("rx-reset").addEventListener("click", () => svg && svg.transition().duration(dur(200)).call(zoom.transform, inicial));
  $("rx-centrar").addEventListener("click", () => centrar());
  function encuadrar(pts, kMax = 1.6) {
    if (!svg || E.vista !== "grafo" || !pts.length) return;
    const caja = $("rx-grafo"), w = caja.clientWidth, h = caja.clientHeight;
    const [x0, x1] = d3.extent(pts, x => x.x), [y0, y1] = d3.extent(pts, x => x.y);
    const k = Math.max(0.3, Math.min(kMax, (w - 300) / Math.max(1, x1 - x0), (h - 120) / Math.max(1, y1 - y0)));
    svg.transition().duration(dur(250)).call(zoom.transform,
      d3.zoomIdentity.translate(w / 2, h / 2).scale(k).translate(-(x0 + x1) / 2 - 80 / k, -(y0 + y1) / 2));
  }
  const conPos = ids => [...ids].map(x => porId.get(x)).filter(x => x && x.x != null && visibles.includes(x));
  // Centrar encuadra la cadena del punto elegido o, con el teclado, el punto que tiene el foco
  function centrar(soloFoco = false) {
    const id = soloFoco ? E.foco : (E.elegido || E.foco);
    if (!id) return;
    encuadrar(conPos(!soloFoco && E.elegido ? vecinos(id) : [id]), soloFoco ? Math.max(1.3, transformacion.k) : 1.6);
  }
  function encuadrarResultados() {
    if (!E.q) return;
    const r = conPos(visibles.filter(coincide).map(n => n.id));
    if (r.length && r.length <= 60) encuadrar(r, 1.4);
  }
  // teclado en el grafo: las flechas recorren los puntos en el orden de la tabla, Enter elige, Escape suelta
  $("rx-svg").addEventListener("keydown", e => {
    const orden = ordenados(visibles);
    if (!orden.length) return;
    let i = orden.findIndex(n => n.id === E.foco);
    if (["ArrowDown", "ArrowRight"].includes(e.key)) i = Math.min(orden.length - 1, i + 1);
    else if (["ArrowUp", "ArrowLeft"].includes(e.key)) i = Math.max(0, i - 1);
    else if (e.key === "Home") i = 0;
    else if (e.key === "End") i = orden.length - 1;
    else if (e.key === "Enter" || e.key === " ") { if (E.foco) elegir(E.foco, false); e.preventDefault(); return; }
    else if (e.key === "Escape") { if (E.elegido) { elegir(null, false); anunciar("Sin elegir."); e.preventDefault(); } return; }
    else if (e.key === "+" || e.key === "=") { zoomPor(1.5); return; }
    else if (e.key === "-") { zoomPor(1 / 1.5); return; }
    else if (e.key === "0") { svg.call(zoom.transform, inicial); return; }
    else return;
    e.preventDefault();
    E.foco = orden[Math.max(0, i)].id;
    const n = porId.get(E.foco);
    anunciar(`${TIPO_NOMBRE[n.tipo]}: ${n.nombre}. ${i + 1} de ${orden.length}.`);
    resaltar();
    centrar(true);
  });

  const ordenados = lista => lista.slice().sort((a, b) => TIPO_ORDEN[a.tipo] - TIPO_ORDEN[b.tipo] || a.nombre.localeCompare(b.nombre, "es"));

  // ---------- tabla: lo mismo que el grafo, en filas ----------
  // de a 30 filas (auditoría de UX del 22 de octubre de 2026, pedido del autor): con las 341 a la vista, en el celular, donde la tabla es
  // la vista inicial, la página medía unas 121 pantallas. Se ven las primeras 30 de lo que coincide con la búsqueda y los filtros, y
  // "Mostrar más" suma otras 30. Lo elegido siempre está a la vista: si está más abajo, se muestran todas las filas hasta llegar a eso
  const PASO_FILAS = 30;
  let topeFilas = PASO_FILAS;
  function dibujarTabla(v, reiniciar = true) {
    const vis = new Set(v.nodos.map(n => n.id));
    const boton = id => { const n = porId.get(id); return `<button type="button" class="enlace" data-ir="${esc(id)}">${esc(n.tipo === "fuente" ? (n.sigla || n.nombre) : n.nombre)}</button>`; };
    const lista = arr => arr.length ? `<ul class="rx-rel">${arr.map(x => `<li>${x}</li>`).join("")}</ul>` : '<span aria-hidden="true">—</span><span class="rx-oculto">ninguna</span>';
    const tema = n => [...n._temas].map(t => (D.secciones.find(s => s[0] === t) || [, t])[1]).join(", ");
    const filas = ordenados(v.nodos.filter(coincide)), i = E.elegido ? filas.findIndex(n => n.id === E.elegido) : -1;
    if (reiniciar) topeFilas = PASO_FILAS;
    if (i >= topeFilas) topeFilas = Math.ceil((i + 1) / PASO_FILAS) * PASO_FILAS;
    const resto = filas.length - Math.min(filas.length, topeFilas);
    $("rx-mas-filas").hidden = resto <= 0;
    $("rx-mas-filas").textContent = resto <= 0 ? "" : resto === 1 ? "Mostrar la última fila" : resto <= PASO_FILAS ? `Mostrar las ${resto} filas que quedan` : `Mostrar ${PASO_FILAS} filas más (quedan ${resto})`;
    $("rx-filas").innerHTML = filas.slice(0, topeFilas).map(n => `<tr data-id="${esc(n.id)}">
      <td data-col="Tipo"><span><svg viewBox="-8 -8 16 16" aria-hidden="true">${ICONO[n.tipo]}</svg>${TIPO_NOMBRE[n.tipo]}</span></td>
      <th scope="row" data-col="Nombre">${boton(n.id)}</th><td data-col="Tema">${esc(tema(n)) || '<span aria-hidden="true">—</span>'}</td>
      <td data-col="Viene de">${lista(entra.get(n.id).filter(a => vis.has(a.de)).map(a => boton(a.de) + (a.tipo === "calcula" ? " (se calcula a partir de esta)" : "")))}</td>
      <td data-col="Lleva a">${lista(sale.get(n.id).filter(a => vis.has(a.a)).map(a => boton(a.a) + (a.tipo === "calcula" ? " (se calcula a partir de esta)" : "")))}</td></tr>`).join("");
    resaltar();
  }
  $("rx-filas").addEventListener("click", e => {
    const b = e.target.closest("[data-ir]");
    if (b) elegir(b.dataset.ir);
  });
  // las filas que se suman: el foco va al nombre de la primera, para seguir desde ahí con el teclado o el lector de pantalla
  $("rx-mas-filas").addEventListener("click", () => {
    const antes = $("rx-filas").rows.length;
    topeFilas += PASO_FILAS;
    dibujarTabla(calcularVisibles(), false);
    $("rx-filas").rows[antes]?.querySelector("th [data-ir]")?.focus();
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
  $("rx-vista").addEventListener("click", e => {
    const b = e.target.closest("button[data-vista]");
    if (!b || b.dataset.vista === E.vista) return;
    E.vista = b.dataset.vista;
    mostrarVista();
    // el grafo se dibuja con el tamaño real de su caja, que es cero mientras está oculta
    if (E.vista === "grafo") { dibujarGrafo(calcularVisibles()); centrar(); }
    guardarEnlace();
  });
  document.querySelectorAll(".rx-tipo").forEach(b => b.addEventListener("click", () => {
    const t = b.dataset.tipo, si = b.getAttribute("aria-pressed") !== "true";
    if (!si && E.tipos.size === 1) { anunciar("Tiene que quedar al menos un tipo a la vista."); return; }
    b.setAttribute("aria-pressed", si);
    si ? E.tipos.add(t) : E.tipos.delete(t);
    document.querySelectorAll(".rx-tipo").forEach(x => x.setAttribute("aria-disabled", E.tipos.size === 1 && x.getAttribute("aria-pressed") === "true"));
    dibujarTodo();
  }));
  // solo se redibuja si cambia el ancho (en el celular, la barra del navegador cambia el alto al bajar) y se conserva lo elegido
  let espera;
  addEventListener("resize", () => {
    clearTimeout(espera);
    espera = setTimeout(() => {
      if (!D || E.vista !== "grafo" || $("rx-grafo").clientWidth === anchoDibujo) return;
      dibujarGrafo(calcularVisibles());
      centrar();
    }, 200);
  });
})();
