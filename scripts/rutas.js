/* Rutas comerciales (23 de noviembre de 2026, docs/roadmap/RUTAS_COMERCIALES.md). Rediseño del 25 de noviembre de 2026, pedido del autor: el mapa en
   MapLibre GL (como el de los cables submarinos), las rutas coloreadas por vía (mar, tierra y avión), foco y contexto al señalar o elegir algo, una
   ficha con el detalle, los filtros por vía, rubro, producto y año (con Reproducir), las capas y las tarjetas de cifras, destinos, productos y
   corredores, sincronizadas con el mapa.
   Lo copia 03_construir_sitio.py a sitio/rutas.js y lo pide solo rutas.html. Lee sitio/datos/rutas.json (scripts/rutas_sitio.py): cada camino (país,
   producto, salida, modo y destino) una vez, cuánto pasó por él cada año y la línea de cada uno. El mapa del mundo es Natural Earth a 1:50 millones
   (world-atlas, en sitio/lib) y lo convierte topojson-client. MapLibre (sitio/lib) dibuja con WebGL: sin MapLibre o sin WebGL quedan las tarjetas y
   "Ver tabla". Los textos no llevan cifras escritas a mano: salen de los datos. */
(() => {
  "use strict";
  const raiz = document.getElementById("rt");
  if (!raiz) return;
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
  // el mismo redondeo que el resto del sitio: mitad hacia arriba
  const dec = (v, n) => (Math.round(v * 10 ** n + 1e-9) / 10 ** n).toLocaleString("es-AR", {minimumFractionDigits: n, maximumFractionDigits: n});
  const pct = v => dec(v, 1) + "%";
  const plata = v => v >= 1000 ? `${dec(v / 1000, 1)} mil millones de dólares` : v >= 10 ? `${dec(v, 0)} millones de dólares` : `${dec(v, 1)} millones de dólares`;
  const corto = v => v >= 1000 ? `US$ ${dec(v / 1000, 1)} mil M` : `US$ ${dec(v, v >= 10 ? 0 : 1)} M`;
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const VIAS = ["mar", "tierra", "avión"];
  const NOMBRE_VIA = {mar: "Por mar", tierra: "Por tierra", "avión": "En avión"};
  const COLOR = {mar: css("--rt-mar"), tierra: css("--rt-tierra"), "avión": css("--rt-avion")};
  const TOP = 10;
  const REDUCIR_MOV = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const CELULAR = matchMedia("(max-width: 767px)");
  let D = null, mapa = null, jugando = null;
  const estado = {anio: 0, rubro: "", sub: "", vias: new Set(VIAS), sel: null, capas: {salidas: true, etiquetas: true, secundarias: true}};
  let vista = null;  // lo calculado para lo elegido: filas, totales, rutas, destinos, productos, corredores

  /* ---------- los datos de lo elegido ---------- */
  const sinPais = f => D.paises[f.pais_cod] === "Sin país informado";
  const nombreSub = c => D.subrubros[c] ? D.subrubros[c][0] : "Sin rubro informado";
  function filasDe(anio) {
    return (D.valores[anio] || []).map(([i, v]) => {
      const [pais_cod, sub, rubro, salida, modo, destino, linea] = D.caminos[i];
      return {pais_cod, sub, rubro, salida, modo, destino, linea, v};
    }).filter(f => (!estado.rubro || f.rubro === estado.rubro) && (!estado.sub || f.sub === estado.sub));
  }
  // con las tres vías prendidas cuenta todo lo exportado (también lo que no tiene camino); con alguna apagada, solo lo de las vías prendidas
  const todasLasVias = () => estado.vias.size === VIAS.length;
  const porVia = fs => todasLasVias() ? fs : fs.filter(f => estado.vias.has(f.modo));
  const suma = fs => fs.reduce((s, f) => s + f.v, 0);
  function agrupar(fs, clave) {
    const m = new Map();
    for (const f of fs) { const k = clave(f); if (k == null) continue; m.set(k, (m.get(k) || 0) + f.v); }
    return [...m].sort((a, b) => b[1] - a[1]);
  }
  // el punto de paso de una ruta por tierra (el paso de frontera) o de llegada (el puerto o la ciudad del país)
  const salidaDe = f => f.modo === "tierra" && !D.salidas[f.salida] ? f.destino : f.salida;
  function calcular() {
    const base = filasDe(estado.anio), fs = porVia(base), tot = suma(fs);
    const conPais = fs.filter(f => !sinPais(f));
    const destinos = agrupar(conPais, f => f.pais_cod);
    const rango = new Map(destinos.map(([c], i) => [c, i + 1]));
    // las rutas del mapa: una por línea, con su país, su vía, su salida y lo que pasó por ella
    const rutas = new Map();
    for (const f of fs) {
      if (!f.modo || !f.linea) continue;
      const r = rutas.get(f.linea) || {k: f.linea, c: f.pais_cod, m: f.modo, s: f.salida, d: f.destino, v: 0, prods: new Map()};
      r.v += f.v; r.prods.set(f.sub, (r.prods.get(f.sub) || 0) + f.v);
      rutas.set(f.linea, r);
    }
    const corredores = agrupar(fs.filter(f => f.modo), f => `${f.salida}|${f.pais_cod}|${f.modo}`);
    const prev = D.valores[estado.anio - 1] ? suma(porVia(filasDe(estado.anio - 1))) : null;
    const viaTot = Object.fromEntries(VIAS.map(m => [m, suma(base.filter(f => f.modo === m))]));
    vista = {base, fs, tot, prev, totBase: suma(base), viaTot, sinCamino: suma(base.filter(f => !f.modo)), destinos, rango, rutas: [...rutas.values()],
      productos: agrupar(fs, f => f.sub || null), corredores, sinPaisTot: suma(fs.filter(sinPais))};
  }

  /* ---------- textos de lo elegido ---------- */
  const nombreFiltro = () => estado.sub ? nombreSub(estado.sub).toLowerCase() : estado.rubro ? D.rubros[estado.rubro].toLowerCase() : "";
  const viasTexto = () => todasLasVias() ? "" : ` (solo ${[...estado.vias].map(m => NOMBRE_VIA[m].toLowerCase()).join(" y ")})`;
  const camino = r => r.m === "avión" ? `En avión desde ${r.s.replace(" (avión)", "")}` : r.m === "tierra" ? `Por tierra, por ${r.d}` : `Por mar, de ${r.s} a ${r.d}`;

  /* ---------- la barra de filtros ---------- */
  function pintarVias() {
    raiz.querySelectorAll(".rt-via").forEach(b => {
      const m = b.dataset.via, p = vista.totBase ? 100 * vista.viaTot[m] / vista.totBase : 0;
      b.setAttribute("aria-pressed", String(estado.vias.has(m)));
      b.querySelector("b").textContent = pct(p);
      b.setAttribute("aria-label", `${NOMBRE_VIA[m]}: ${pct(p)} de lo exportado. ${estado.vias.has(m) ? "Prendido" : "Apagado"}`);
    });
  }
  function opcionesProducto() {
    const subs = Object.entries(D.subrubros).filter(([, [, r]]) => !estado.rubro || r === estado.rubro).sort((a, b) => a[1][0].localeCompare(b[1][0], "es"));
    $("rt-prods").innerHTML = subs.map(([, [n]]) => `<option value="${esc(n)}"></option>`).join("");
  }
  function pintarProducto() {
    const p = $("rt-prod-elegido");
    p.hidden = !estado.sub;
    p.querySelector("span").textContent = estado.sub ? `Producto: ${nombreSub(estado.sub)}` : "";
    if (!estado.sub) $("rt-prod").value = "";
  }

  /* ---------- las tarjetas ---------- */
  function barras(el, items, total, nombre, extra, attr) {
    const max = items.length ? items[0][1] : 1;
    el.innerHTML = items.length ? items.map(([k, v], i) => `<li><button type="button" ${attr}="${esc(k)}">
      <span class="rt-b-n">${extra(k, i)}${esc(nombre(k))}</span><span class="rt-b-x">${pct(100 * v / total)}</span>
      <span class="rt-b-barra" aria-hidden="true"><i style="width:${(100 * v / max).toFixed(2)}%"></i></span>
      <span class="rt-b-d">${plata(v)}</span></button></li>`).join("") : `<li class="rt-nada">Nada con estos filtros.</li>`;
  }
  function pintarTarjetas() {
    const {tot, prev, destinos, productos, corredores, viaTot, totBase, sinCamino} = vista;
    const nombre = nombreFiltro();
    const varia = prev ? (tot / prev - 1) * 100 : null;
    const pd = destinos[0], pp = productos[0];
    const tramo = (m, v) => v > 0 ? `<i class="rt-k-${m === "avión" ? "a" : m === "tierra" ? "t" : m === "mar" ? "m" : "s"}" style="width:${(100 * v / totBase).toFixed(2)}%" title="${NOMBRE_VIA[m] || "Sin camino"}"></i>` : "";
    $("rt-kpis").innerHTML = `
      <div class="rt-card rt-kpi"><p class="rt-k-tit">Exportado en ${estado.anio}${esc(viasTexto())}</p><p class="rt-k-cifra">${tot ? esc(corto(tot)) : "Sin datos"}</p>
        <p class="rt-k-sub">${varia == null ? "Primer año de la serie" : `${varia >= 0 ? "+" : "−"}${pct(Math.abs(varia))} frente a ${estado.anio - 1}`}</p></div>
      <div class="rt-card rt-kpi"><p class="rt-k-tit">Por vía de transporte</p><p class="rt-k-pila" aria-hidden="true">${VIAS.map(m => tramo(m, viaTot[m])).join("")}${tramo("", sinCamino)}</p>
        <p class="rt-k-sub">${VIAS.map(m => `${NOMBRE_VIA[m]} ${pct(totBase ? 100 * viaTot[m] / totBase : 0)}`).join(" · ")}${sinCamino ? ` · sin camino ${pct(100 * sinCamino / totBase)}` : ""}</p></div>
      <div class="rt-card rt-kpi"><p class="rt-k-tit">Principal destino</p><p class="rt-k-cifra rt-k-txt">${pd ? esc(D.paises[pd[0]]) : "Sin datos"}</p>
        <p class="rt-k-sub">${pd ? `${pct(100 * pd[1] / tot)} de lo exportado${nombre ? " en " + esc(nombre) : ""}` : ""}</p></div>
      <div class="rt-card rt-kpi"><p class="rt-k-tit">Principal producto</p><p class="rt-k-cifra rt-k-txt">${pp ? esc(nombreSub(pp[0])) : "Sin datos"}</p>
        <p class="rt-k-sub">${pp ? `${pct(100 * pp[1] / tot)} de lo exportado` : ""}</p></div>`;
    barras($("rt-destinos"), destinos.slice(0, TOP), tot, c => D.paises[c], c => `<span class="rt-cod">${esc(c)}</span>`, "data-pais");
    barras($("rt-productos"), productos.slice(0, TOP), tot, nombreSub, () => "", "data-sub");
    $("rt-corredores").innerHTML = corredores.length ? corredores.slice(0, 8).map(([k, v]) => {
      const [s, c, m] = k.split("|"), lider = agrupar(vista.fs.filter(f => f.salida === s && f.pais_cod === c && f.modo === m), f => f.sub)[0];
      return `<li><button type="button" data-corr="${esc(k)}"><span class="rt-c-ruta">${esc(s.replace(" (avión)", ""))} <span aria-hidden="true">→</span><span class="solo-lector">a</span> ${esc(D.paises[c])}</span>
        <span class="rt-insignia rt-ins-${m === "avión" ? "a" : m === "tierra" ? "t" : "m"}">${NOMBRE_VIA[m].replace("Por ", "").replace("En ", "")}</span>
        <span class="rt-c-prod">${lider ? esc(nombreSub(lider[0])) : ""}</span><span class="rt-c-v">${esc(corto(v))}</span></button></li>`;
    }).join("") : `<li class="rt-nada">Nada con estos filtros.</li>`;
    const sp = vista.sinPaisTot, dib = suma(vista.fs.filter(f => f.modo));
    $("rt-frase").textContent = !tot ? `No hay exportaciones con estos filtros en ${estado.anio}.` :
      `En ${estado.anio} la Argentina exportó ${plata(tot)}${nombre ? " en " + nombre : ""}${viasTexto()}. ` + (pd ? `El primer destino fue ${D.paises[pd[0]]}, con ${pct(100 * pd[1] / tot)} del total. ` : "") +
      `El mapa dibuja el ${pct(100 * dib / tot)}` + (sp ? `: el ${pct(100 * sp / tot)} salió sin país informado (lo que el INDEC publica como confidencial) y el resto va a países fuera de la tabla de destinos o sin un camino que se pueda dibujar.` : ".");
    $("rt-tabla").innerHTML = `<caption class="solo-lector">Exportaciones${nombre ? " de " + esc(nombre) : ""} por país de destino, ${estado.anio}</caption>` +
      `<thead><tr><th scope="col">País</th><th scope="col" class="n">Millones de dólares</th><th scope="col" class="n">% del total</th><th scope="col">Camino principal</th></tr></thead><tbody>` +
      destinos.map(([c, v]) => { const r = vista.rutas.filter(x => x.c === c).sort((a, b) => b.v - a.v)[0];
        return `<tr><th scope="row">${esc(D.paises[c])}</th><td class="n">${dec(v, 1)}</td><td class="n">${pct(100 * v / tot)}</td><td>${r ? esc(camino(r)) : "Sin camino dibujado"}</td></tr>`; }).join("") +
      (sp ? `<tr><th scope="row">Sin país informado</th><td class="n">${dec(sp, 1)}</td><td class="n">${pct(100 * sp / tot)}</td><td>Sin camino dibujado</td></tr>` : "") + `</tbody>`;
    $("rt-vacio").hidden = tot > 0;
  }

  /* ---------- la ficha de lo elegido ---------- */
  function lista(items, nombre, total) {
    return `<ol class="rt-f-lista">${items.map(([k, v]) => `<li><span>${esc(nombre(k))}</span><b>${esc(corto(v))}</b><small>${pct(100 * v / total)}</small></li>`).join("")}</ol>`;
  }
  function fichaHTML(sel) {
    const fs = vista.fs, tot = vista.tot || 1;
    if (sel.tipo === "pais") {
      const de = fs.filter(f => f.pais_cod === sel.id), v = suma(de);
      return `<p class="rt-f-cab"><span class="rt-cod">${esc(sel.id)}</span> Destino</p><h3 id="rt-ficha-tit">${esc(D.paises[sel.id])}</h3>
        <p class="rt-f-cifra">${esc(plata(v))} en ${estado.anio}</p><p class="rt-f-sub">${pct(100 * v / tot)} de lo exportado${esc(nombreFiltro() ? " en " + nombreFiltro() : "")}. Puesto ${vista.rango.get(sel.id) || "-"} entre los destinos</p>
        <h4>Por dónde sale</h4>${lista(agrupar(de, f => f.modo ? `${NOMBRE_VIA[f.modo]}, ${f.modo === "tierra" ? "por " + f.destino : "desde " + f.salida.replace(" (avión)", "")}` : "Sin camino dibujado"), k => k, v || 1)}
        <h4>Qué compra</h4>${lista(agrupar(de, f => f.sub || null).slice(0, 5), nombreSub, v || 1)}`;
    }
    if (sel.tipo === "salida") {
      const de = fs.filter(f => f.modo && salidaDe(f) === sel.id || (f.modo === "tierra" && f.destino === sel.id)), v = suma(de);
      return `<p class="rt-f-cab">${D.pasos[sel.id] ? "Paso de frontera" : sel.id.includes("avión") ? "Aeropuerto de salida" : "Puerto de salida"}</p><h3 id="rt-ficha-tit">${esc(sel.id.replace(" (avión)", ""))}</h3>
        <p class="rt-f-cifra">${esc(plata(v))} en ${estado.anio}</p><p class="rt-f-sub">${pct(100 * v / tot)} de lo exportado con estos filtros</p>
        <h4>Adónde va</h4>${lista(agrupar(de, f => f.pais_cod).slice(0, 5), c => D.paises[c], v || 1)}
        <h4>Qué sale por acá</h4>${lista(agrupar(de, f => f.sub || null).slice(0, 5), nombreSub, v || 1)}`;
    }
    // una ruta o un corredor
    const de = sel.tipo === "linea" ? fs.filter(f => f.linea === sel.id) : fs.filter(f => `${f.salida}|${f.pais_cod}|${f.modo}` === sel.id);
    const v = suma(de), f0 = de[0] || {}, r = {m: f0.modo, s: f0.salida || "", d: f0.destino || ""};
    return `<p class="rt-f-cab"><span class="rt-insignia rt-ins-${r.m === "avión" ? "a" : r.m === "tierra" ? "t" : "m"}">${esc(NOMBRE_VIA[r.m] || "")}</span> Ruta</p>
      <h3 id="rt-ficha-tit">${esc(r.s.replace(" (avión)", ""))} a ${esc(D.paises[f0.pais_cod] || "")}</h3><p class="rt-f-cifra">${esc(plata(v))} en ${estado.anio}</p>
      <p class="rt-f-sub">${esc(f0.modo ? camino(r) : "")}. ${pct(100 * v / tot)} de lo exportado con estos filtros</p>
      <h4>Qué lleva</h4>${lista(agrupar(de, f => f.sub || null).slice(0, 5), nombreSub, v || 1)}`;
  }
  function abrirFicha(sel, desdeTeclado) {
    estado.sel = sel;
    $("rt-ficha-cuerpo").innerHTML = fichaHTML(sel);
    $("rt-ficha").hidden = false;
    if (desdeTeclado) $("rt-ficha").focus();
    if (mapa) mapa.foco(sel);
    ocultarTip();
  }
  function cerrarFicha() {
    estado.sel = null;
    $("rt-ficha").hidden = true;
    if (mapa) mapa.foco(null);
  }

  /* ---------- todo junto ---------- */
  function pintar() {
    calcular();
    $("rt-anio-val").textContent = estado.anio;
    pintarVias();
    pintarProducto();
    pintarTarjetas();
    if (mapa) mapa.datos();
    // la ficha sigue abierta con los datos nuevos, salvo que lo elegido ya no tenga nada
    if (estado.sel) {
      const queda = estado.sel.tipo === "pais" ? vista.rango.has(estado.sel.id) : estado.sel.tipo === "linea" ? vista.rutas.some(r => r.k === estado.sel.id) : true;
      if (queda) { $("rt-ficha-cuerpo").innerHTML = fichaHTML(estado.sel); if (mapa) mapa.foco(estado.sel); } else cerrarFicha();
    }
    raiz.removeAttribute("aria-busy");
  }

  /* ---------- el cuadro chico al pasar el mouse (solo con mouse: en el celular, la ficha) ---------- */
  function mostrarTip(html, x, y) {
    const t = $("rt-tip"), caja = $("rt-mapa-caja");
    t.innerHTML = html; t.hidden = false;
    t.style.left = Math.max(8, Math.min(x + 14, caja.clientWidth - t.offsetWidth - 8)) + "px";
    t.style.top = Math.max(8, y - t.offsetHeight - 10) + "px";
  }
  const ocultarTip = () => { $("rt-tip").hidden = true; };

  /* ---------- el mapa ---------- */
  function armarMapa(mundo) {
    // los países que cruzan el meridiano 180 (Rusia, Fiyi, las Aleutianas) saltan de 180 a -180 y MapLibre los dibujaría con una raya de punta a punta del
    // mapa: cada anillo sigue de largo, sin saltos, y el mapa lo repite del otro lado. La Antártida no hace falta (no llega ningún camino)
    const seguido = anillo => { let ant = null; return anillo.map(([lon, lat]) => { if (ant != null) lon += 360 * Math.round((ant - lon) / 360); ant = lon; return [lon, lat]; }); };
    const tierra = topojson.feature(mundo, mundo.objects.countries);
    tierra.features = tierra.features.filter(f => f.properties.name !== "Antarctica" && f.geometry).map(f => ({...f, geometry: {type: f.geometry.type,
      coordinates: f.geometry.type === "Polygon" ? f.geometry.coordinates.map(seguido) : f.geometry.coordinates.map(pol => pol.map(seguido))}}));
    const fondo = css("--rt-oceano"), suelo = css("--rt-suelo"), borde = css("--rt-borde"), arg = css("--rt-arg"), nodo = css("--rt-nodo");
    const m = new maplibregl.Map({
      container: "rt-lienzo", attributionControl: {compact: true, customAttribution: "Natural Earth · searoute (Eurostat)"},
      style: {version: 8, sources: {}, layers: [{id: "oceano", type: "background", paint: {"background-color": fondo}}]},
      bounds: [[-125, -58], [150, 70]], fitBoundsOptions: {padding: 8}, minZoom: 0.4, maxZoom: 7, dragRotate: false, pitchWithRotate: false, touchPitch: false,
      // como en Elecciones por mesa: la rueda sigue bajando la página y un dedo también. Se acerca con Ctrl y la rueda, con dos dedos o con los botones
      cooperativeGestures: true, renderWorldCopies: true,
      locale: {"CooperativeGesturesHandler.WindowsHelpText": "Para acercar, Ctrl y la rueda del mouse", "CooperativeGesturesHandler.MacHelpText": "Para acercar, ⌘ y la rueda del mouse",
        "CooperativeGesturesHandler.MobileHelpText": "Para mover el mapa, dos dedos"}
    });
    m.touchZoomRotate.disableRotation();
    const vacio = {type: "FeatureCollection", features: []};
    const etiquetas = new Map();
    let listo = false;
    m.on("load", () => {
      m.addSource("tierra", {type: "geojson", data: tierra});
      m.addLayer({id: "tierra", type: "fill", source: "tierra", paint: {"fill-color": ["case", ["==", ["get", "name"], "Argentina"], arg, suelo]}});
      m.addLayer({id: "bordes", type: "line", source: "tierra", paint: {"line-color": borde, "line-width": 0.5}});
      m.addSource("rutas", {type: "geojson", data: vacio});
      m.addSource("nodos", {type: "geojson", data: vacio});
      m.addLayer({id: "halo", type: "line", source: "rutas", layout: {"line-cap": "round", "line-join": "round"},
        paint: {"line-color": "#ffffff", "line-width": ["+", ["get", "w"], 4], "line-opacity": 0}});
      m.addLayer({id: "rutas", type: "line", source: "rutas", filter: ["!=", ["get", "m"], "avión"], layout: {"line-cap": "round", "line-join": "round"},
        paint: {"line-color": ["match", ["get", "m"], "tierra", COLOR.tierra, COLOR.mar], "line-width": ["get", "w"], "line-opacity": 0.65}});
      m.addLayer({id: "aereas", type: "line", source: "rutas", filter: ["==", ["get", "m"], "avión"], layout: {"line-cap": "butt"},
        paint: {"line-color": COLOR["avión"], "line-width": ["get", "w"], "line-opacity": 0.65, "line-dasharray": [2, 1.6]}});
      m.addLayer({id: "nodos", type: "circle", source: "nodos", paint: {"circle-radius": ["get", "r"], "circle-color": ["match", ["get", "t"], "destino", "#ffffff", nodo],
        "circle-stroke-color": ["match", ["get", "t"], "destino", nodo, "#ffffff"], "circle-stroke-width": 1.5, "circle-opacity": 1}});
      listo = true;
      api.datos();
      if (estado.sel) api.foco(estado.sel);
    });
    // señalar y elegir: una ruta, un nodo de salida o de llegada
    const capasToque = ["rutas", "aereas", "nodos"];
    const queHay = e => {
      const f = m.queryRenderedFeatures([[e.point.x - 4, e.point.y - 4], [e.point.x + 4, e.point.y + 4]], {layers: capasToque})[0];
      if (!f) return null;
      const p = f.properties;
      if (f.layer.id === "nodos") return p.t === "destino" ? {tipo: "pais", id: p.id} : {tipo: "salida", id: p.id};
      return {tipo: "linea", id: p.k};
    };
    const tipHTML = sel => {
      if (sel.tipo === "pais") { const v = suma(vista.fs.filter(f => f.pais_cod === sel.id)); return `<strong>${esc(D.paises[sel.id])}</strong><br>${esc(corto(v))}, ${pct(100 * v / (vista.tot || 1))}`; }
      if (sel.tipo === "salida") return `<strong>${esc(sel.id.replace(" (avión)", ""))}</strong><br>Tocá para ver qué sale por acá`;
      const r = vista.rutas.find(x => x.k === sel.id);
      return r ? `<strong>${esc(D.paises[r.c])}</strong><br>${esc(camino(r))}<br>${esc(corto(r.v))}, ${pct(100 * r.v / (vista.tot || 1))}` : "";
    };
    m.on("mousemove", e => {
      if (!listo) return;
      const sel = queHay(e);
      m.getCanvas().style.cursor = sel ? "pointer" : "";
      if (sel && !CELULAR.matches) { mostrarTip(tipHTML(sel), e.point.x, e.point.y); api.foco(sel, true); }
      else { ocultarTip(); api.foco(estado.sel, true); }
    });
    m.getCanvas().addEventListener("mouseleave", () => { ocultarTip(); if (listo) api.foco(estado.sel, true); });
    m.on("click", e => { if (!listo) return; const sel = queHay(e); if (sel) abrirFicha(sel); else if (estado.sel) cerrarFicha(); });
    m.on("zoom", () => api.etiquetas());
    // el zoom a la vista, para las pruebas de la página (scripts/prueba_paginas.mjs)
    m.on("zoomend", () => { raiz.dataset.zoom = m.getZoom().toFixed(2); });

    const ancho = v => v > 0 ? 0.8 + 9 * Math.sqrt(v / (api.max || 1)) : 0;
    const api = {
      max: 1,
      datos() {
        if (!listo) return;
        const rutas = vista.rutas, rango = vista.rango;
        api.max = Math.max(1, ...rutas.map(r => r.v));
        const visibles = rutas.filter(r => estado.capas.secundarias || (rango.get(r.c) || 99) <= TOP).sort((a, b) => a.v - b.v);
        m.getSource("rutas").setData({type: "FeatureCollection", features: visibles.map(r => ({type: "Feature",
          properties: {k: r.k, c: r.c, m: r.m, s: r.s, d: r.d, w: ancho(r.v), rk: rango.get(r.c) || 99}, geometry: {type: "LineString", coordinates: D.lineas[r.k]}}))});
        // los nodos: las salidas y los pasos, por lo que sale por ellos, y la llegada de cada país, por lo que recibe
        const nodos = new Map();
        const sumar = (id, t, punto, v) => { if (!punto) return; const n = nodos.get(t + id) || {id, t, punto, v: 0}; n.v += v; nodos.set(t + id, n); };
        for (const r of visibles) {
          if (estado.capas.salidas) {
            sumar(r.s, "salida", D.salidas[r.s], r.v);
            if (r.m === "tierra") sumar(r.d, "salida", D.pasos[r.d], r.v);
          }
          sumar(r.c, "destino", D.lugares[r.c], r.v);
        }
        const nmax = Math.max(1, ...[...nodos.values()].map(n => n.v));
        m.getSource("nodos").setData({type: "FeatureCollection", features: [...nodos.values()].map(n => ({type: "Feature",
          properties: {id: n.id, t: n.t, r: (n.t === "destino" ? 2.5 : 3.5) + 4 * Math.sqrt(n.v / nmax)}, geometry: {type: "Point", coordinates: n.punto}}))});
        api.etiquetas();
        api.foco(estado.sel, true);
      },
      // los nombres de los diez primeros destinos: los cinco primeros siempre y los demás al acercar
      etiquetas() {
        const quiero = estado.capas.etiquetas ? vista.destinos.slice(0, m.getZoom() >= 1.6 ? TOP : 5).map(([c]) => c).filter(c => D.lugares[c]) : [];
        for (const [c, mk] of etiquetas) if (!quiero.includes(c)) { mk.remove(); etiquetas.delete(c); }
        for (const c of quiero) {
          if (etiquetas.has(c)) continue;
          const el = document.createElement("span");
          el.className = "rt-etiq"; el.textContent = D.paises[c]; el.setAttribute("aria-hidden", "true");
          etiquetas.set(c, new maplibregl.Marker({element: el, anchor: "left", offset: [7, 0]}).setLngLat(D.lugares[c]).addTo(m));
        }
      },
      // foco y contexto: lo elegido (o lo señalado) a pleno y con halo, lo demás casi transparente
      foco(sel, soloPintura) {
        if (!listo) return;
        let cond = null;
        if (sel) cond = sel.tipo === "pais" ? ["==", ["get", "c"], sel.id] : sel.tipo === "linea" ? ["==", ["get", "k"], sel.id]
          : sel.tipo === "salida" ? ["any", ["==", ["get", "s"], sel.id], ["==", ["get", "d"], sel.id]]
          : ["all", ["==", ["get", "s"], sel.id.split("|")[0]], ["==", ["get", "c"], sel.id.split("|")[1]], ["==", ["get", "m"], sel.id.split("|")[2]]];
        const op = cond ? ["case", cond, 1, 0.12] : 0.65;
        m.setPaintProperty("rutas", "line-opacity", op);
        m.setPaintProperty("aereas", "line-opacity", op);
        m.setPaintProperty("halo", "line-opacity", cond ? ["case", cond, 0.9, 0] : 0);
        const nodoCond = !sel ? null : sel.tipo === "pais" ? ["==", ["get", "id"], sel.id] : sel.tipo === "salida" ? ["==", ["get", "id"], sel.id] : null;
        m.setPaintProperty("nodos", "circle-opacity", sel ? (nodoCond ? ["case", nodoCond, 1, 0.35] : 0.35) : 1);
        m.setPaintProperty("nodos", "circle-stroke-opacity", sel ? (nodoCond ? ["case", nodoCond, 1, 0.35] : 0.35) : 1);
        if (!soloPintura && sel) api.encuadrar(sel);
      },
      // acercarse a lo elegido
      encuadrar(sel) {
        const pts = [];
        if (sel.tipo === "pais") { const l = D.lugares[sel.id]; if (l) pts.push(D.salidas["Gran Rosario"] || [-60.6, -33], l); }
        else if (sel.tipo === "salida") { const p = D.salidas[sel.id] || D.pasos[sel.id]; if (p) { m.easeTo({center: p, zoom: Math.max(m.getZoom(), 3), duration: REDUCIR_MOV ? 0 : 280}); return; } }
        else vista.rutas.filter(r => sel.tipo === "linea" ? r.k === sel.id : `${r.s}|${r.c}|${r.m}` === sel.id).forEach(r => pts.push(...D.lineas[r.k]));
        if (pts.length < 2) return;
        const lon = pts.map(p => p[0]), lat = pts.map(p => p[1]);
        m.fitBounds([[Math.min(...lon), Math.min(...lat)], [Math.max(...lon), Math.max(...lat)]], {padding: m.getContainer().clientWidth > 900 ? {top: 40, bottom: 40, left: 40, right: 360} : 30, maxZoom: 4.5, duration: REDUCIR_MOV ? 0 : 280});
      },
      centrar() { m.fitBounds([[-125, -58], [150, 70]], {padding: 8, duration: REDUCIR_MOV ? 0 : 280}); },
      zoom(d) { (d > 0 ? m.zoomIn : m.zoomOut).call(m, {duration: REDUCIR_MOV ? 0 : 200}); },
      globo(si) { m.setProjection({type: si ? "globe" : "mercator"}); },
      mapa: m
    };
    return api;
  }

  /* ---------- los controles ---------- */
  function elegirRubro(r) {
    estado.rubro = r; estado.sub = "";
    raiz.querySelectorAll(".rt-rubros button").forEach((x, i) => { const si = x.dataset.r === r; x.setAttribute("aria-pressed", String(si)); if (si) x.parentNode.style.setProperty("--i", i); });
    opcionesProducto();
  }
  function restablecer() {
    estado.vias = new Set(VIAS); estado.sel = null;
    elegirRubro("");
    $("rt-ficha").hidden = true;
    pintar();
  }
  raiz.querySelector(".rt-vias").addEventListener("click", e => {
    const b = e.target.closest(".rt-via"); if (!b || !D) return;
    const m = b.dataset.via;
    if (estado.vias.has(m)) estado.vias.delete(m); else estado.vias.add(m);
    pintar();
  });
  raiz.querySelector(".rt-rubros").addEventListener("click", e => { const b = e.target.closest("button[data-r]"); if (!b || !D) return; elegirRubro(b.dataset.r); pintar(); });
  $("rt-prod").addEventListener("change", e => {
    const t = e.target.value.trim().toLowerCase();
    const hit = Object.entries(D.subrubros).find(([, [n]]) => n.toLowerCase() === t) || (t ? Object.entries(D.subrubros).find(([, [n]]) => n.toLowerCase().includes(t)) : null);
    if (!hit) return;
    estado.sub = hit[0];
    if (estado.rubro && hit[1][1] !== estado.rubro) elegirRubro(""), (estado.sub = hit[0]);
    e.target.value = hit[1][0];
    pintar();
  });
  $("rt-prod-quitar").addEventListener("click", () => { estado.sub = ""; pintar(); $("rt-prod").focus(); });
  $("rt-anio").addEventListener("input", e => { estado.anio = +e.target.value; ocultarTip(); pintar(); });
  // Reproducir: un año cada poco más de un segundo, del primero al último. Con movimiento reducido igual avanza, sin animaciones en el mapa
  function parar() { clearInterval(jugando); jugando = null; $("rt-play").setAttribute("aria-pressed", "false"); $("rt-play").textContent = "Reproducir"; }
  $("rt-play").addEventListener("click", () => {
    if (jugando) return parar();
    const r = $("rt-anio");
    if (+r.value >= +r.max) { r.value = r.min; estado.anio = +r.min; pintar(); }
    $("rt-play").setAttribute("aria-pressed", "true"); $("rt-play").textContent = "Pausa";
    jugando = setInterval(() => {
      if (+r.value >= +r.max) return parar();
      r.value = +r.value + 1; estado.anio = +r.value; pintar();
    }, 1200);
  });
  raiz.querySelector(".rt-capas").addEventListener("change", e => { const c = e.target.dataset.capa; if (!c) return; estado.capas[c] = e.target.checked; if (mapa) mapa.datos(); });
  // las tarjetas: señalar ilumina en el mapa, elegir abre la ficha (destino y corredor) o filtra (producto)
  const marca = el => el.dataset.pais ? {tipo: "pais", id: el.dataset.pais} : el.dataset.corr ? {tipo: "corredor", id: el.dataset.corr} : null;
  for (const id of ["rt-destinos", "rt-corredores"]) {
    const el = $(id);
    el.addEventListener("pointerover", e => { const b = e.target.closest("button"); if (b && mapa) mapa.foco(marca(b), true); });
    el.addEventListener("pointerleave", () => mapa && mapa.foco(estado.sel, true));
    el.addEventListener("focusin", e => { const b = e.target.closest("button"); if (b && mapa) mapa.foco(marca(b), true); });
    el.addEventListener("focusout", e => { if (!el.contains(e.relatedTarget) && mapa) mapa.foco(estado.sel, true); });
    el.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; abrirFicha(marca(b), e.detail === 0);
      if (mapa) $("rt-mapa-caja").scrollIntoView({behavior: REDUCIR_MOV ? "auto" : "smooth", block: "nearest"}); });
  }
  $("rt-productos").addEventListener("click", e => { const b = e.target.closest("button[data-sub]"); if (!b) return; estado.sub = b.dataset.sub; pintar(); });
  $("rt-ficha-cerrar").addEventListener("click", cerrarFicha);
  raiz.querySelectorAll("[data-restablecer]").forEach(b => b.addEventListener("click", restablecer));
  raiz.querySelector(".rt-ctrl").addEventListener("click", e => {
    const b = e.target.closest("button[data-z]"); if (!b || !mapa) return;
    const z = b.dataset.z;
    if (z === "mas" || z === "menos") mapa.zoom(z === "mas" ? 1 : -1);
    else if (z === "todo") mapa.centrar();
    else { const si = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", String(si)); b.textContent = si ? "Plano" : "Globo"; mapa.globo(si); }
  });
  // el panel de filtros: en la computadora va a la vista; en el celular abre abajo y se cierra con Listo, Escape o tocando afuera
  const panel = $("rt-panel"), btnPanel = $("rt-filtros-btn");
  const abrirPanel = si => { raiz.classList.toggle("rt-panel-abierto", si); btnPanel.setAttribute("aria-expanded", String(si)); if (si) panel.querySelector("button, input").focus(); else btnPanel.focus(); };
  btnPanel.addEventListener("click", () => abrirPanel(!raiz.classList.contains("rt-panel-abierto")));
  $("rt-panel-cerrar").addEventListener("click", () => abrirPanel(false));
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (raiz.classList.contains("rt-panel-abierto")) abrirPanel(false);
    else if (!$("rt-ficha").hidden) cerrarFicha();
  });
  $("rt-ver-tabla").addEventListener("click", e => {
    const t = $("rt-tabla-caja"), abrir = t.hidden;
    t.hidden = !abrir;
    e.currentTarget.setAttribute("aria-expanded", String(abrir));
    e.currentTarget.textContent = abrir ? "Ocultar tabla" : "Ver tabla";
  });

  /* ---------- arranque ---------- */
  function sinMapa() { $("rt-lienzo").hidden = true; raiz.querySelector(".rt-ctrl").hidden = true; $("rt-sin-mapa").hidden = false; }
  fetch(raiz.dataset.datos).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(d => {
    D = d;
    estado.anio = D.anio;
    Object.assign($("rt-anio"), {min: D.anios[0], max: D.anios[D.anios.length - 1], value: D.anio, disabled: false});
    $("rt-play").disabled = false; $("rt-prod").disabled = false;
    opcionesProducto();
    $("rt-estado").textContent = "";
    pintar();
    if (!window.maplibregl || !window.topojson) return sinMapa();
    fetch(raiz.dataset.mundo).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(mundo => {
      try { mapa = armarMapa(mundo); } catch (_) { mapa = null; return sinMapa(); }
      mapa.mapa.on("error", ev => { if (/webgl/i.test(String(ev && ev.error && ev.error.message))) sinMapa(); });
    }).catch(sinMapa);
  }).catch(() => {
    raiz.removeAttribute("aria-busy");
    $("rt-estado").textContent = "No se pudieron cargar los datos.";
    $("rt-falla").hidden = false;
    sinMapa();
  });
})();
