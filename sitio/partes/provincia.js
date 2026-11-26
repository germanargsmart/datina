window.DATINA_PARTES = window.DATINA_PARTES || {};
window.DATINA_PARTES["provincia"] = () => {
const PERFIL_GRUPOS = [["trabajo", "Trabajo"], ["social", "Seguridad social"], ["economia", "Economía"], ["salud", "Salud"], ["educacion", "Educación"], ["seguridad", "Seguridad"],
["poblacion", "Población y migraciones"], ["gobierno", "Gobierno"], ["vivienda", "Vivienda y servicios"], ["energia", "Energía"],
["turismo", "Turismo y naturaleza"], ["capital", "La capital"]];
const CAP_P = [
{id:"a-viviendas-alquiler", g:"capital", cap:true, veces:true, lab:"Viviendas por habitante", det:"viviendas particulares cada 1.000 habitantes, Censo 2022",
d:T.capitales, k:"viviendas_1000", pais:R.capitales_pais.viviendas_1000, f:n0},
{id:"a-viviendas-alquiler", g:"capital", cap:true, veces:true, lab:"Hogares que alquilan en la capital", det:"% de los hogares, Censo 2022",
d:T.capitales, k:"alquila", pais:VV.pct_alquila, f:pct},
{id:"a-viviendas-alquiler", g:"capital", cap:true, veces:true, lab:"Hacinamiento crítico", det:"% de los hogares con más de tres personas por cuarto, Censo 2022",
d:T.capitales, k:"hacinamiento", pais:VV.pct_hacinamiento, f:pct},
];
const PERFIL = [...INDP, ...CAP_P];
const grilla = document.getElementById("prov-grid") || document.createElement("div");
grilla.innerHTML = PERFIL_GRUPOS.map(([g, tit]) => `<section class="perfil-grupo" id="pg-${g}" aria-labelledby="pg-${g}-t"><div class="perfil-cab">` +
`<h2 class="bloque-grupo" id="pg-${g}-t"><span>${tit}</span></h2></div>` +
`<div class="perfil-tarjetas">` + PERFIL.map((c, j) => c.g !== g ? "" : `<a class="tarjeta dp" href="#${c.id}" data-i="${j}"><span class="dp-lab">${c.lab}</span>
  <span class="dp-num"></span><span class="dp-det">${c.det}</span><svg class="dp-tira" aria-hidden="true"></svg><span class="dp-pos"></span><span class="dp-aclara"></span></a>`).join("") +
`</div></section>`).join("");
function tiras() {
grilla.querySelectorAll(".dp").forEach(el => {
const c = PERFIL[+el.dataset.i], nodo = el.querySelector(".dp-tira"), svg = d3.select(nodo);
const w = Math.max(160, nodo.clientWidth || 200), h = 26;
svg.attr("viewBox", `0 0 ${w} ${h}`).selectAll("*").remove();
c.x = d3.scaleLinear().domain(d3.extent([...c.d.map(d => d[c.k]), ...(c.pais == null ? [] : [c.pais])])).range([7, w - 7]);
svg.append("line").attr("x1", 7).attr("x2", w - 7).attr("y1", h/2).attr("y2", h/2).attr("stroke", css("--line")).attr("stroke-width", 2);
svg.selectAll("circle.o").data(c.d).join("circle").attr("class","o").attr("cx", d => c.x(d[c.k])).attr("cy", h/2).attr("r", 3.2)
.attr("fill", css("--celeste")).attr("opacity", .45);
if (c.pais != null) svg.append("line").attr("x1", c.x(c.pais)).attr("x2", c.x(c.pais)).attr("y1", 4).attr("y2", h - 4).attr("stroke", css("--ink")).attr("stroke-width", 1.5);
svg.append("circle").attr("class","elegida").attr("cy", h/2).attr("r", 6.5).attr("fill", css("--celeste-fuerte"))
.attr("stroke", "#fff").attr("stroke-width", 2).attr("opacity", 0);
});
}
function cambiarTexto(el, t, animar) {
if (el.textContent.replaceAll(NBSP, " ") === t) return;
if (!animar || REDUCIR) { el.textContent = t; return; }
el.animate([{opacity:1}, {opacity:0}], {duration:100, easing:"ease-out"}).onfinish = () => {
el.textContent = t;
el.animate([{opacity:0, transform:"translateY(4px)"}, {opacity:1, transform:"none"}], {duration:200, easing:"cubic-bezier(.23,1,.32,1)"});
};
}
function pintarDestaca() {
const caja = document.getElementById("prov-destaca"); if (!caja) return;
const nombre = NOMBRES[prov];
if (!nombre) { caja.hidden = true; caja.innerHTML = ""; return; }
const cand = INDP.map(c => {
const fila = c.d.find(d => d.codigo_indec === prov), n = c.d.length;
if (!fila || fila[c.k] == null || n < 20) return null;
const orden = [...c.d].sort((a, b) => b[c.k] - a[c.k]).findIndex(d => d.codigo_indec === prov) + 1;
return {c, fila, orden, n, lado: orden <= 3 ? 0 : orden > n - 3 ? 1 : -1, extremo: Math.min(orden, n - orden + 1)};
}).filter(x => x && x.lado >= 0).sort((a, b) => a.extremo - b.extremo);
const elegidas = [[], []];
cand.forEach(x => { const l = elegidas[x.lado]; if (l.length < 3 && !l.some(y => y.c.id === x.c.id)) l.push(x); });
const tarjetas = [...elegidas[0], ...elegidas[1]];
caja.hidden = false;
yaEscrito(caja).innerHTML = `<h2 class="bloque-grupo" id="prov-destaca-t">Dónde se destaca</h2>` +
(tarjetas.length ? `<p class="prov-destaca-sub">Los indicadores del perfil en los que ${nombre} tiene una de las tres cifras más altas o más bajas de las 24 jurisdicciones. Que una cifra sea alta o baja no dice si es buena o mala.</p>` +
`<div class="perfil-tarjetas">` + tarjetas.map(({c, fila, orden, n}) => `<a class="tarjeta dp" href="#${c.id}"><span class="dp-lab">${c.lab}</span>` +
`<span class="dp-num">${c.f(fila[c.k])}</span><span class="dp-det">${c.det}</span>` +
`<span class="dp-pos">${puestoTxt(orden, n)}.${c.pais == null ? "" : ` País: ${c.f(c.pais)}.`}</span></a>`).join("") + `</div>`
: `<p class="prov-destaca-sub">En los indicadores del perfil, ${nombre} no tiene ninguna de las tres cifras más altas ni de las tres más bajas de las 24 jurisdicciones.</p>`);
}
let conProv = new URLSearchParams(location.search).get("con");
function pintarCompara() {
const caja = document.getElementById("prov-compara"); if (!caja) return;
if (!NOMBRES[prov]) { caja.hidden = true; caja.innerHTML = ""; return; }
if (!NOMBRES[conProv] || conProv === prov) conProv = null;
const otras = Object.keys(NOMBRES).filter(c => c !== prov).sort((a, b) => NOMBRES[a].localeCompare(NOMBRES[b], "es"));
const val = (c, cod) => { const f = c.d.find(d => d.codigo_indec === cod); return f && f[c.k] != null ? c.f(f[c.k]) : "Sin dato"; };
const tit = conProv ? `${NOMBRES[prov]} y ${NOMBRES[conProv]}` : "";
caja.hidden = false;
caja.innerHTML = `<h2 class="bloque-grupo" id="prov-compara-t">Comparar con otra provincia</h2>` +
`<label class="selector-ficha"><span>Comparar ${NOMBRES[prov]} con</span><select id="compara-sel"><option value="">Elegí una jurisdicción</option>` +
otras.map(c => `<option value="${c}"${c === conProv ? " selected" : ""}>${NOMBRES[c]}</option>`).join("") + `</select></label>` +
(!conProv ? "" : `<div class="tabla-desliza" tabindex="0" role="region" aria-label="Tabla: ${tit}"><table class="tabla-areas tabla-compara">` +
`<caption class="solo-lector">${tit}, con el total del país</caption><thead><tr><th scope="col">Indicador</th><th scope="col" class="n">${NOMBRES[prov]}</th>` +
`<th scope="col" class="n">${NOMBRES[conProv]}</th><th scope="col" class="n">País</th></tr></thead><tbody>` +
PERFIL_GRUPOS.filter(([g]) => g !== "capital").map(([g, t]) => {
const filas = INDP.filter(c => c.g === g && c.d);
return !filas.length ? "" : `<tr class="compara-grupo"><th colspan="4" scope="colgroup">${t}</th></tr>` + filas.map(c =>
`<tr><th scope="row">${c.lab}<small>${c.det}</small></th><td class="n">${val(c, prov)}</td><td class="n">${val(c, conProv)}</td>` +
`<td class="n">${c.pais == null ? "" : c.f(c.pais)}</td></tr>`).join("");
}).join("") + `</tbody></table></div><p class="tabla-nota">Los mismos indicadores del perfil, con su período. Que una cifra sea más alta no dice si ` +
`es mejor o peor.</p>`);
caja.querySelector("#compara-sel").addEventListener("change", ev => {
conProv = ev.target.value || null;
const u = new URL(location.href);
if (conProv) u.searchParams.set("con", conProv); else u.searchParams.delete("con");
history.replaceState(history.state, "", u);
pintarCompara();
document.getElementById("compara-sel").focus();
});
}
function pendientePuesto(s, w) {
const h = 92, izq = 34, der = 34, arr = 8, ab = 22, ini = s[0], fin = s[s.length - 1];
const x = a => +(izq + (a - ini.anio) / (fin.anio - ini.anio) * (w - izq - der)).toFixed(1), y = p => +(arr + (p - 1) / 23 * (h - arr - ab)).toFixed(1);
const marco = p => `<line class="dpp-marco" x1="${izq}" x2="${w - der}" y1="${y(p)}" y2="${y(p)}"/>` +
(Math.abs(y(p) - y(ini.puesto)) > 11 ? `<text class="dpp-eje" x="${izq - 8}" y="${y(p)}" dy=".35em" text-anchor="end">${p}.º</text>` : "");
const entra = x(s[1].anio) - x(ini.anio) >= 30, anio = r => entra || r === ini || r === fin ? r.anio : `’${String(r.anio).slice(2)}`;
return marco(1) + marco(24) +
`<polyline class="dpp-linea" points="${s.map(r => `${x(r.anio)},${y(r.puesto)}`).join(" ")}"/>` +
s.map((r, i) => `<circle class="${i === 0 ? "dpp-ini" : i === s.length - 1 ? "dpp-fin" : "dpp-punto"}" cx="${x(r.anio)}" cy="${y(r.puesto)}" r="${i === 0 ? 3.5 : i === s.length - 1 ? 4.5 : 2.5}">` +
`<title>${r.anio}: puesto ${r.puesto}</title></circle>`).join("") +
`<text class="dpp-eje" x="${izq - 8}" y="${y(ini.puesto)}" dy=".35em" text-anchor="end">${ini.puesto}.º</text>` +
`<text class="dpp-val" x="${w - der + 8}" y="${y(fin.puesto)}" dy=".35em">${fin.puesto}.º</text>` +
s.map(r => `<text class="dpp-anio" x="${x(r.anio)}" y="${h - 4}" text-anchor="middle">${anio(r)}</text>`).join("");
}
function pintarPuestos() {
const caja = document.getElementById("prov-puestos"); if (!caja) return;
if (NOMBRES[prov] && !T.puestos_provincias) { cargarTabla("puestos_provincias").then(pintarPuestos, () => {}); return; }
const filas = (T.puestos_provincias || []).filter(r => r.codigo_indec === prov);
if (!NOMBRES[prov] || !filas.length) { caja.hidden = true; caja.innerHTML = ""; return; }
const num = v => Math.abs(v) >= 1000 ? n0(v) : n1(v);
const series = [...d3.group(filas, r => r.variable).entries()].map(([v, s]) => ({v, s: s.sort((a, b) => a.anio - b.anio)}));
caja.hidden = false;
yaEscrito(caja).innerHTML = `<h2 class="bloque-grupo" id="prov-puestos-t">Cómo cambió su puesto</h2>` +
`<p class="prov-destaca-sub">El lugar de ${NOMBRES[prov]} entre las 24 jurisdicciones, cada dos años. Arriba, el mejor puesto (en mortalidad o robos, la cifra más baja): ` +
`verde si mejoró y rojo si empeoró. El puesto compara con las otras jurisdicciones: la cifra de ${NOMBRES[prov]} puede mejorar aunque el puesto empeore.</p>` +
`<div class="perfil-tarjetas">` +
series.map(({v, s}) => {
const ini = s[0], fin = s[s.length - 1], dif = ini.puesto - fin.puesto, neutro = ini.sentido === "neutro";
const clase = neutro || !dif ? "igual" : dif > 0 ? "sube" : "baja";
const cambio = !dif ? "Mismo puesto" : `${neutro ? "Cambió" : dif > 0 ? "Mejoró" : "Empeoró"} ${Math.abs(dif)} ${Math.abs(dif) === 1 ? "puesto" : "puestos"}`;
return `<a class="tarjeta dp" href="${destinoDe("#" + ini.ficha) || "#" + ini.ficha}"><span class="dp-lab">${ini.indicador}</span>` +
`<span class="dp-det">${ini.unidad}</span><svg class="dp-pendiente ${clase}" data-v="${v}" aria-hidden="true"></svg>` +
`<span class="solo-lector">Puesto por año: ${s.map(r => `${r.anio}, ${r.puesto}`).join(". ")}.</span>` +
`<span class="dp-pos"><b class="dp-cambio ${clase}">${cambio}.</b> En ${ini.anio}, puesto ${ini.puesto} (${num(ini.valor)}). En ${fin.anio}, puesto ${fin.puesto} ` +
`(${num(fin.valor)}).</span></a>`;
}).join("") + `</div><p class="tabla-nota">Más recursos propios cuenta como mejora: es menos dependencia de los fondos nacionales. El gasto en personal va en gris porque ` +
`más gasto no es por sí solo mejor ni peor, y su puesto 1 es la cifra más alta.</p>`;
caja.querySelectorAll(".dp-pendiente").forEach(svg => {
const w = Math.max(160, svg.clientWidth || 200), {s} = series.find(o => o.v === svg.dataset.v);
svg.setAttribute("viewBox", `0 0 ${w} 92`);
svg.innerHTML = pendientePuesto(s, w);
});
}
function pintarCensos() {
const caja = document.getElementById("prov-censos"); if (!caja) return;
const filas = (T.censos_provincias || []).filter(r => r.codigo_indec === prov).sort((a, b) => a.orden - b.orden);
const CZ = R.censos;
if (!NOMBRES[prov] || !filas.length || !CZ) { caja.hidden = true; caja.innerHTML = ""; return; }
const pais = k => (T.censos_pais || []).find(r => r.indicador === k), pv = CZ.pob_var_prov[prov];
const puntos = v => `${v > 0 ? "+" : v < 0 ? "−" : ""}${n1(Math.abs(v))} puntos`;
caja.hidden = false;
yaEscrito(caja).innerHTML = `<h2 class="bloque-grupo" id="prov-censos-t">Cómo cambió entre los censos 2010 y 2022</h2>` +
`<p class="prov-destaca-sub">Entre los censos de 2010 y 2022, la población de ${NOMBRES[prov]} ${pv >= 0 ? "creció" : "bajó"} ${pct(Math.abs(pv))}, ` +
`y la del país, ${pct(CZ.pob_var)}. Estos son los tres indicadores del censo que más cambiaron, en puntos. Que un número suba o baje no dice por ` +
`sí solo si es mejor o peor.</p>` + `<div class="perfil-tarjetas">` + filas.slice(0, 3).map(r => {
const p = pais(r.indicador);
return `<div class="tarjeta dp"><span class="dp-lab">${r.nombre}</span><span class="dp-num">${puntos(r.cambio)}</span><span class="dp-det">${r.unidad}</span>` +
`<span class="dp-pos">De ${pct(r.valor_2010)} en 2010 a ${pct(r.valor_2022)} en 2022.${p ? ` País: de ${pct(p.valor_2010)} a ${pct(p.valor_2022)}.` : ""}</span></div>`;
}).join("") + `</div>` +
`<div class="tabla-desliza" tabindex="0" role="region" aria-label="Tabla: ${NOMBRES[prov]} en los censos 2010 y 2022"><table class="tabla-areas tabla-compara">` +
`<caption class="solo-lector">${NOMBRES[prov]} en los censos 2010 y 2022</caption><thead><tr><th scope="col">Indicador</th><th scope="col" class="n">2010</th>` +
`<th scope="col" class="n">2022</th><th scope="col" class="n">Cambio</th></tr></thead><tbody>` +
filas.map(r => `<tr><th scope="row">${r.nombre}<small>${r.unidad}</small></th><td class="n">${pct(r.valor_2010)}</td><td class="n">${pct(r.valor_2022)}</td>` +
`<td class="n">${puntos(r.cambio)}</td></tr>`).join("") + `</tbody></table></div>` +
`<p class="tabla-nota">Cuadros del INDEC de los censos 2010 y 2022. El de 2010 fue un censo de hecho (contó a las personas donde estaban esa noche) y ` +
`el de 2022, de derecho (donde viven). En 2022 la computadora incluye notebook y tableta, así que su suba puede ser en parte por la pregunta.</p>`;
}
const EST = {prov: null, filas: null, cargando: null, visible: false, capa: "e", nivel: "", fondo: "gris", elegido: null, listo: false};
const EST_CAT = {
e: [["est", "estatal", "estatales", "--celeste-fuerte"], ["priv", "privada", "privadas", "--sol"], ["soc", "de gestión social o cooperativa", "de gestión social o cooperativa", "--ink"]],
h: [["prov", "provincial", "provinciales", "--celeste-fuerte"], ["mun", "municipal", "municipales", "--sol"], ["nac", "nacional", "nacionales", "--ink"],
["univ", "universitario", "universitarios", "--ink"], ["mixta", "mixto", "mixtos", "--ink"]]
};
const EST_DEP_FUERA = {"94028": "Antártida Argentina"};
const EST_IGN = "https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/";
const estColor = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || "#2C74B5";
const estNorm = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const estMes = iso => { const m = /^(\d{4})-(\d{2})/.exec(iso || ""); return m ? `${MESES[+m[2] - 1]} de ${m[1]}` : ""; };
const estPl = (n, uno, varios) => `${n0(n)} ${n === 1 ? uno : varios}`;
const estLista = partes => partes.length < 2 ? partes.join("") : partes.slice(0, -1).join(", ") + " " + yE(partes[partes.length - 1]);
const estDep = c => EST.nombreDep?.[c] || EST_DEP_FUERA[c] || c;
const estVisibles = () => (EST.filas || []).filter(r => r.t === EST.capa && (EST.capa !== "e" || !EST.nivel || r.niv.includes(EST.nivel)));
function estTipo(r) {
const cat = EST_CAT[r.t].find(c => c[0] === r.cat);
if (r.t === "h") {
const clase = r.niv === "ESCIG" ? "general" : r.niv === "ESCIESM" ? "especializado en salud mental" : "especializado";
return `Hospital ${cat ? cat[1] : ""} con internación, ${clase}${r.det ? `: ${r.det.charAt(0).toLowerCase() + r.det.slice(1)}` : ""}`;
}
const niveles = estLista([r.niv.includes("p") ? "primaria" : "", r.niv.includes("t") ? "secundaria técnica" : r.niv.includes("s") ? "secundaria" : ""].filter(Boolean));
return `Escuela ${cat ? cat[1] : ""}, ${niveles}${r.det === "r" ? ", rural" : ""}`;
}
function estNotaPunto(r) {
const la = r.t === "e" ? "la" : "lo";
if (r.u === "c") return `Sin ubicación confirmada: la fuente ${la} pone lejos de su departamento y ninguna fuente oficial confirma dónde está. No se dibuja en el mapa.`;
if (r.u === "n") return "La fuente no da su ubicación. No se dibuja en el mapa.";
const partes = [];
if (r.cor === "p") partes.push(`Ubicación corregida por Datina: la fuente ${la} ponía lejos de su departamento, y se usó ${r.u === "m" ? "su domicilio" : "el centro de su localidad"} según Georef (IGN).`);
else if (r.u === "m") partes.push("Ubicación tomada de su domicilio con Georef (IGN): la fuente daba solo el centro de su localidad.");
else if (r.u === "a") partes.push("Ubicación aproximada: la fuente da el centro de su localidad, no el edificio.");
if (r.cor === "d") partes.push(`Departamento corregido por Datina: la fuente ${la} anota en otro, pero el lugar está en ${estDep(r.dep)} según Georef (IGN).`);
if (r.fk) partes.push(`El punto de la fuente cae a ${estPl(r.fk, "km", "km")} del departamento en que ${la} anota.`);
if (EST_DEP_FUERA[r.dep]) partes.push("Queda fuera del mapa de departamentos del sitio.");
return partes.join(" ");
}
function pintarEstablecimientos() {
const caja = document.getElementById("prov-establecimientos"); if (!caja) return;
if (!NOMBRES[prov]) { caja.hidden = true; EST.prov = null; EST.filas = null; return; }
caja.hidden = false;
if (!EST.listo) estPreparar(caja);
if (EST.prov === prov) { EST.mapa?.invalidateSize(); return; }
Object.assign(EST, {prov, filas: null, cargando: null, elegido: null, marcas: null});
const fp = estMes(caja.dataset.padron), fr = estMes(caja.dataset.refes);
$("est-sub").textContent = `Las escuelas primarias y secundarias y los hospitales públicos con internación de ${NOMBRES[prov]}, sobre el mapa del ` +
`Instituto Geográfico Nacional. Escuelas del padrón oficial${fp ? ` de ${fp}` : ""} y hospitales del registro federal de salud${fr ? ` de ${fr}` : ""}.`;
["est-ley", "est-lead", "est-resultados", "est-tabla", "est-nota"].forEach(id => { $(id).innerHTML = ""; });
$("est-ficha").hidden = true; $("est-q").value = "";
EST.capaPuntos?.remove(); EST.capaDeps?.remove(); EST.anillo?.remove();
EST.capaPuntos = EST.capaDeps = EST.anillo = null;
$("est-lienzo").setAttribute("aria-busy", "true");
if (EST.visible) estCargar();
}
function estPreparar(caja) {
EST.listo = true;
if (!("IntersectionObserver" in window)) EST.visible = true;
else (EST.obs = new IntersectionObserver(es => { EST.visible = es.some(e => e.isIntersecting); if (EST.visible && EST.prov && !EST.filas) estCargar(); },
{rootMargin: "600px 0px"})).observe(caja);
const elegirEn = (id, clave) => $(id).addEventListener("click", ev => {
const b = ev.target.closest("button[data-m]"); if (!b) return;
const bs = [...$(id).querySelectorAll("button")];
bs.forEach(x => x.setAttribute("aria-pressed", String(x === b)));
$(id).style.setProperty("--i", bs.indexOf(b));
EST[clave] = b.dataset.m;
if (clave === "fondo") { estFondo(); return; }
if (clave === "capa") $("est-nivel").hidden = EST.capa !== "e";
if (EST.elegido && EST.elegido.t !== EST.capa) { EST.elegido = null; $("est-ficha").hidden = true; }
if (EST.filas) { estArmar(); estMapa(false); }
});
elegirEn("est-capa", "capa"); elegirEn("est-nivel", "nivel"); elegirEn("est-fondo", "fondo");
$("est-lienzo").querySelector(".ms-zoom").addEventListener("click", ev => {
const b = ev.target.closest("button[data-z]"); if (!b || !EST.mapa) return;
if (b.dataset.z === "todo") estEncuadrar(!REDUCIR);
else EST.mapa[b.dataset.z === "mas" ? "zoomIn" : "zoomOut"](1, {animate: !REDUCIR});
});
$("est-lead").addEventListener("click", ev => {
if (ev.target.closest("#est-reintentar")) { $("est-lead").textContent = ""; $("est-lienzo").setAttribute("aria-busy", "true"); estCargar(); }
});
$("est-q").addEventListener("input", estBuscar);
$("est-resultados").addEventListener("click", ev => {
const b = ev.target.closest("button[data-i]"); if (b) estElegir(EST.filas[+b.dataset.i], true);
});
$("est-ficha").addEventListener("click", ev => {
if (ev.target.closest("[data-cerrar]")) { EST.elegido = null; $("est-ficha").hidden = true; estMarcar(); }
});
}
let estLeaflet = null;
const estCargarLeaflet = () => estLeaflet || (estLeaflet = new Promise((ok, mal) => {
if (window.L) return ok(window.L);
const caja = $("prov-establecimientos"), css = document.createElement("link"), s = document.createElement("script");
css.rel = "stylesheet"; css.href = caja.dataset.leafletCss; document.head.appendChild(css);
s.src = caja.dataset.leaflet; s.onload = () => (window.L ? ok(window.L) : mal());
s.onerror = () => { estLeaflet = null; mal(); };
document.head.appendChild(s);
}));
function estCargar() {
const p = EST.prov, caja = $("prov-establecimientos");
if (!p || EST.cargando === p) return;
EST.cargando = p;
Promise.all([cargarTopoDep(), d3.text(`datos/establecimientos/${p}.csv?v=${caja.dataset.v || ""}`)]).then(([topo, txt]) => {
if (EST.prov !== p) return null;
const num = v => v === "" || v == null ? null : +v;
const mezcla = s => [...s].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
const filas = d3.csvParse(txt, (r, i) => ({...r, i, k: mezcla(r.id || ""), lat: num(r.lat), lon: num(r.lon), fk: num(r.fk)}));
const esperadas = +((caja.dataset.n || "").split(",").find(x => x.startsWith(p + ":")) || ":").split(":")[1];
if ((esperadas && filas.length !== esperadas) || filas.some(r => r.cor === undefined)) throw new Error("tabla incompleta");
return [topo, filas];
}).then(x => {
if (!x || EST.prov !== p) return;
const [topo, filas] = x;
EST.filas = filas;
EST.deps = topojson.feature(topo, topo.objects.departamentos).features.filter(f => f.properties.prov === p);
EST.nombreDep = Object.fromEntries(EST.deps.map(f => [f.properties.id, f.properties.nombre]));
$("est-lienzo").removeAttribute("aria-busy");
estArmar();
estCargarLeaflet().then(() => { if (EST.prov === p) estMapa(true); }, () => {
$("est-mapa").innerHTML = '<p class="nota est-sin-mapa">No se pudo cargar el mapa. El buscador y la tabla por departamento tienen los mismos datos.</p>';
});
}, () => {
if (EST.prov !== p) return;
EST.cargando = null;
$("est-lienzo").removeAttribute("aria-busy");
const t = `No se pudieron cargar las escuelas y los hospitales de ${NOMBRES[p]}.`;
$("est-lead").innerHTML = `${t} <button type="button" class="enlace" id="est-reintentar">Volver a intentar</button>`; avisar(t);
});
}
function estArmar() {
const filas = estVisibles(), esE = EST.capa === "e", nombre = NOMBRES[EST.prov];
const cuenta = c => filas.filter(r => r.cat === c).length;
const sinPunto = filas.filter(r => r.lat == null).length;
$("est-ley").innerHTML = EST_CAT[EST.capa].filter(c => cuenta(c[0])).map(c =>
`<span class="est-cl"><i style="background:var(${c[3]})" aria-hidden="true"></i>${estPl(cuenta(c[0]), c[1], c[2])}</span>`).join("") +
(sinPunto ? `<span class="est-cl est-cl-sin">${estPl(sinPunto, "sin punto en el mapa", "sin punto en el mapa")}: ${sinPunto === 1 ? "está" : "están"} en el buscador</span>` : "");
const porDep = d3.rollup(filas, v => v.length, r => r.dep);
const deps = [...new Set([...EST.deps.map(f => f.properties.id), ...porDep.keys()])];
const top = [...porDep].sort((a, b) => b[1] - a[1] || estDep(a[0]).localeCompare(estDep(b[0])))[0];
const nivel = EST.nivel === "p" ? " con primaria" : EST.nivel === "s" ? " con secundaria" : " primarias y secundarias";
let lead;
if (!filas.length) lead = `${nombre} no tiene ${esE ? "escuelas" + nivel : "hospitales públicos con internación"} en estas fuentes.`;
else if (esE) {
const rurales = filas.filter(r => r.det === "r").length;
lead = `${nombre} tiene ${estPl(filas.length, "escuela", "escuelas")}${filas.length === 1 ? nivel.replace("primarias y secundarias", "primaria o secundaria") : nivel} de educación común: ` +
estLista(EST_CAT.e.filter(c => cuenta(c[0])).map(c => estPl(cuenta(c[0]), c[1], c[2]))) + `. El ${pct(rurales / filas.length * 100)} ${rurales === 1 && filas.length === 1 ? "es rural" : "son rurales"}.` +
(deps.length > 1 && top ? ` El departamento con más es ${estDep(top[0])}, con ${n0(top[1])}.` : "");
} else {
const sinH = deps.filter(d => !porDep.get(d)).length, ti = filas.filter(r => /terapia intensiva/i.test(r.det)).length;
lead = `${nombre} tiene ${estPl(filas.length, "hospital público", "hospitales públicos")} con internación: ` +
estLista(EST_CAT.h.filter(c => cuenta(c[0])).map(c => estPl(cuenta(c[0]), c[1], c[2]))) + `. ` +
`${!ti ? "Ninguno tiene" : ti === filas.length ? (ti === 1 ? "Tiene" : "Todos tienen") : estPl(ti, "tiene", "tienen")} terapia intensiva. ` +
(deps.length > 1 ? (sinH ? `En ${n0(sinH)} de sus ${n0(deps.length)} departamentos no hay ninguno.` : "Todos sus departamentos tienen al menos uno.") : "");
}
$("est-lead").textContent = sinViuda(lead);
const filasDep = deps.map(d => ({d, v: filas.filter(r => r.dep === d)})).sort((a, b) => b.v.length - a.v.length || estDep(a.d).localeCompare(estDep(b.d)));
const cols = esE ? [["Escuelas", v => v.length], ["Con primaria", v => v.filter(r => r.niv.includes("p")).length], ["Con secundaria", v => v.filter(r => r.niv.includes("s")).length],
["Privadas", v => v.filter(r => r.cat === "priv").length], ["Rurales", v => v.filter(r => r.det === "r").length]]
: [["Hospitales", v => v.length], ["Provinciales", v => v.filter(r => r.cat === "prov").length], ["Municipales", v => v.filter(r => r.cat === "mun").length],
["Otros públicos", v => v.filter(r => !["prov", "mun"].includes(r.cat)).length], ["Con terapia intensiva", v => v.filter(r => /terapia intensiva/i.test(r.det)).length]];
const tit = `${esE ? "Escuelas" + nivel : "Hospitales públicos con internación"} de ${nombre}, por departamento`;
$("est-tabla").innerHTML = `<div class="tabla-desliza" tabindex="0" role="region" aria-label="Tabla: ${esc(tit)}"><table class="tabla-areas tabla-compara">` +
`<caption class="solo-lector">${esc(tit)}</caption><thead><tr><th scope="col">Departamento</th>${cols.map(c => `<th scope="col" class="n">${c[0]}</th>`).join("")}</tr></thead><tbody>` +
filasDep.map(x => `<tr><th scope="row">${esc(estDep(x.d))}</th>${cols.map(c => `<td class="n">${n0(c[1](x.v))}</td>`).join("")}</tr>`).join("") + `</tbody></table></div>`;
const todas = EST.filas, caja = $("prov-establecimientos"), de = t => todas.filter(r => r.t === t);
const aprox = de("e").filter(r => r.u === "a").length, sinConf = todas.filter(r => r.u === "c").length;
const corr = estLista([[todas.filter(r => r.cor === "p").length, "ubicación", "ubicaciones"], [todas.filter(r => r.cor === "d").length, "departamento", "departamentos"]]
.filter(c => c[0]).map(c => estPl(...c)));
$("est-nota").innerHTML = `Escuelas: las localizaciones de educación común con primaria o secundaria del Padrón Oficial de Establecimientos Educativos ` +
`(Ministerio de Capital Humano${caja.dataset.padron ? `, ${estMes(caja.dataset.padron)}` : ""}), con su ubicación del Mapa Educativo Nacional. Un mismo edificio puede ` +
`tener dos y una puede dar los dos niveles. Hospitales: los establecimientos públicos con internación del Registro Federal de Establecimientos de Salud ` +
`(Ministerio de Salud${caja.dataset.refes ? `, ${estMes(caja.dataset.refes)}` : ""}), sin las residencias para personas mayores. En ${nombre}, ` +
`${estPl(aprox, "escuela tiene", "escuelas tienen")} ubicación aproximada (el centro de su localidad)` +
(corr ? `, Datina corrigió a mano ${corr} con Georef (IGN)` : "") +
(sinConf ? ` y ${sinConf === 1 ? "una no se dibuja" : `${n0(sinConf)} no se dibujan`} porque ninguna fuente oficial confirma dónde ${sinConf === 1 ? "está" : "están"}` : "") +
`. Mapa de fondo: Instituto Geográfico Nacional. Imagen satelital: Esri, Maxar y Earthstar Geographics. ` +
`<a class="enlace" href="datos/establecimientos/${EST.prov}.csv" download>Descargar la tabla de ${esc(nombre)} (CSV)</a>`;
}
function estCrearMapa() {
const L = window.L, cont = $("est-mapa");
const ign = n => L.tileLayer(`${EST_IGN}${n}@EPSG%3A3857@png/{z}/{x}/{y}.png`, {tms: true, maxZoom: 18,
attribution: '<a href="https://www.ign.gob.ar/">Instituto Geográfico Nacional</a>'});
EST.fondos = {gris: [ign("mapabase_gris")], color: [ign("capabaseargenmap")],
satelite: [L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
{maxZoom: 18, attribution: "Imagen: Esri, Maxar, Earthstar Geographics"}), ign("mapabase_hibrido")]};
const tactil = matchMedia("(pointer: coarse)").matches;
EST.mapa = L.map(cont, {zoomControl: false, scrollWheelZoom: false, dragging: !tactil, tap: false, zoomSnap: .25, minZoom: 3, maxZoom: 18,
zoomAnimation: !REDUCIR, fadeAnimation: !REDUCIR, markerZoomAnimation: !REDUCIR});
EST.mapa.attributionControl.setPrefix('<a href="https://leafletjs.com/">Leaflet</a>');
EST.ren = L.canvas({padding: .3});
cont.addEventListener("wheel", ev => {
if (!(ev.ctrlKey || ev.metaKey)) return;
ev.preventDefault();
EST.mapa.setZoomAround(EST.mapa.mouseEventToContainerPoint(ev), EST.mapa.getZoom() + (ev.deltaY < 0 ? .5 : -.5), {animate: !REDUCIR});
}, {passive: false});
EST.tip = L.tooltip({direction: "top", offset: [0, -6], className: "est-tip"});
EST.mapa.on("zoomend", estBordes);
estFondo();
}
function estFondo() {
if (!EST.mapa) return;
Object.values(EST.fondos).flat().forEach(c => { if (EST.mapa.hasLayer(c)) EST.mapa.removeLayer(c); });
EST.fondos[EST.fondo].forEach(c => c.addTo(EST.mapa).bringToBack());
}
function estMapa(encuadrar) {
if (!window.L || !EST.filas || !$("est-mapa").isConnected) return;
const L = window.L;
if (!EST.mapa) estCrearMapa();
if (!EST.capaDeps) EST.capaDeps = L.geoJSON({type: "FeatureCollection", features: EST.deps},
{interactive: false, style: {color: estColor("--celeste-fuerte"), weight: 1, opacity: .5, fill: false}}).addTo(EST.mapa);
EST.capaPuntos?.remove();
const color = Object.fromEntries(EST_CAT[EST.capa].map(c => [c[0], estColor(c[3])]));
const r = EST.capa === "e" ? 3.5 : 5.5, capa = L.layerGroup();
EST.marcas = new Map();
estVisibles().filter(f => f.lat != null).sort((a, b) => a.k - b.k).forEach(f => {
const m = L.circleMarker([f.lat, f.lon], {renderer: EST.ren, radius: r, color: "#fff", weight: 0, fillColor: color[f.cat] || estColor("--ink"), fillOpacity: .95});
m.on("mouseover", () => { EST.tip.setLatLng(m.getLatLng()).setContent(`<b>${esc(f.nombre)}</b><br>${esc(f.loc)}`); EST.mapa.openTooltip(EST.tip); })
.on("mouseout", () => EST.mapa.closeTooltip(EST.tip))
.on("click", () => estElegir(f, false));
EST.marcas.set(f, m); capa.addLayer(m);
});
EST.capaPuntos = capa.addTo(EST.mapa);
if (encuadrar) estEncuadrar(false);
EST.bordes = null; estBordes(); estMarcar();
const quien = EST.capa === "e" ? "escuelas" : "hospitales públicos";
$("est-mapa").setAttribute("aria-label", `Mapa de ${NOMBRES[EST.prov]} con ${n0(EST.marcas.size)} ${quien}. Con el teclado, las flechas lo mueven y las teclas más y menos ` +
"lo acercan y lo alejan. La misma información está en el buscador y en la tabla por departamento.");
}
const estEncuadrar = anima => { if (EST.mapa && EST.capaDeps) EST.mapa.fitBounds(EST.capaDeps.getBounds(), {padding: [8, 8], animate: anima}); };
function estBordes() {
if (!EST.mapa || !EST.capaPuntos) return;
const z = EST.mapa.getZoom(), w = EST.capa === "h" || z >= 11 ? 1 : 0;
const r = (EST.capa === "e" ? 3.5 : 5.5) * (z >= 14 ? 1.7 : z >= 11 ? 1.3 : z < 7 ? .75 : 1);
if (EST.bordes === `${EST.capa}${w}${r}`) return;
EST.bordes = `${EST.capa}${w}${r}`;
EST.capaPuntos.eachLayer(m => { m.setStyle({weight: w}); m.setRadius(r); });
estMarcar();
}
function estMarcar() {
EST.anillo?.remove(); EST.anillo = null;
const m = EST.elegido && EST.marcas?.get(EST.elegido);
if (m) EST.anillo = window.L.circleMarker(m.getLatLng(), {renderer: EST.ren, radius: m.getRadius() + 4, color: estColor("--rojo"), weight: 2.5,
fill: false, interactive: false}).addTo(EST.mapa);
}
function estBuscar() {
const q = estNorm($("est-q").value.trim()), caja = $("est-resultados");
if (q.length < 2 || !EST.filas) { caja.innerHTML = ""; return; }
const hay = EST.filas.filter(r => estNorm(`${r.nombre} ${r.loc} ${r.dom}`).includes(q));
caja.innerHTML = `<p class="est-cuantos" role="status">${hay.length ? `${estPl(hay.length, "coincide", "coinciden")}${hay.length > 15 ? ": las primeras 15" : ""}` : "Ninguna escuela ni hospital coincide."}</p>` +
hay.slice(0, 15).map(r => `<button type="button" class="enlace" data-i="${r.i}">${esc(r.nombre)}</button><span class="est-r-det">${esc(estTipo(r))}. ${esc(r.loc)}</span>`).join("");
}
function estElegir(r, acercar) {
if (r.t !== EST.capa) $("est-capa").querySelector(`button[data-m="${r.t}"]`).click();
if (r.t === "e" && EST.nivel && !r.niv.includes(EST.nivel)) $("est-nivel").querySelector('button[data-m=""]').click();
EST.elegido = r;
const f = $("est-ficha"), nota = estNotaPunto(r);
f.innerHTML = `<p class="est-f-nom">${esc(r.nombre)}</p><p>${esc(estTipo(r))}.</p><p>${esc([r.dom, r.loc].filter(Boolean).join(", "))}. Departamento ${esc(estDep(r.dep))}.</p>` +
(nota ? `<p class="est-f-nota">${esc(nota)}</p>` : "") + `<button type="button" class="enlace" data-cerrar>Cerrar</button>`;
f.hidden = false;
const m = EST.marcas?.get(r);
if (m && acercar) EST.mapa.setView(m.getLatLng(), Math.max(EST.mapa.getZoom(), 15), {animate: !REDUCIR});
estMarcar();
}
(() => {
const nav = document.getElementById("perfil-indice"), contenido = document.querySelector(".prov-contenido");
if (!nav || !contenido) return;
const btn = nav.querySelector(".pi-btn"), actual = nav.querySelector(".pi-actual"), listas = nav.querySelector(".pi-listas"), enlaces = [...nav.querySelectorAll("a")];
const destino = a => document.getElementById(a.getAttribute("href").slice(1));
const titulo = d => !d || d.hidden ? null : d.id === "prov-historia" ? d.querySelector(".ph:not([hidden]) h2") : d.querySelector("h2");
const marcar = a => {
enlaces.forEach(x => { if (x === a) x.setAttribute("aria-current", "true"); else x.removeAttribute("aria-current"); });
actual.textContent = a ? a.textContent : "";
if (a && nav.scrollHeight > nav.clientHeight) nav.scrollTop = a.offsetTop - nav.clientHeight / 2;
};
const sincronizar = () => {
enlaces.forEach(a => {
const h = titulo(destino(a));
a.closest("li").hidden = !h;
if (h && a.textContent !== h.textContent) a.textContent = h.textContent;
});
nav.querySelectorAll("ul").forEach(ul => { ul.hidden = !ul.querySelector("li:not([hidden])"); });
const marcado = nav.querySelector('a[aria-current="true"]');
if (marcado) marcar(marcado.closest("li").hidden ? null : marcado);
};
let pendiente = false;
new MutationObserver(() => {
if (pendiente) return;
pendiente = true;
requestAnimationFrame(() => { pendiente = false; sincronizar(); });
}).observe(contenido, {subtree: true, childList: true, attributes: true, attributeFilter: ["hidden"]});
sincronizar();
const vigiladas = new Map(enlaces.map(a => [destino(a), a]).filter(([d]) => d));
const adentro = new Set();
const vigia = new IntersectionObserver(es => {
es.forEach(e => { if (e.isIntersecting) adentro.add(e.target); else adentro.delete(e.target); });
const a = enlaces.filter(x => adentro.has(destino(x))).pop();
if (a) marcar(a);
}, {rootMargin: "-25% 0px -74% 0px"});
vigiladas.forEach((a, d) => vigia.observe(d));
const abrir = si => { btn.setAttribute("aria-expanded", si); nav.classList.toggle("abierto", si); };
const abierto = () => btn.getAttribute("aria-expanded") === "true";
btn.addEventListener("click", () => abrir(!abierto()));
listas.addEventListener("click", ev => { if (ev.target.closest("a")) abrir(false); });
nav.addEventListener("keydown", ev => { if (ev.key === "Escape" && abierto()) { abrir(false); btn.focus(); } });
nav.addEventListener("focusout", ev => { if (ev.relatedTarget && !nav.contains(ev.relatedTarget)) abrir(false); });
document.addEventListener("click", ev => { if (abierto() && !nav.contains(ev.target)) abrir(false); });
})();
function pintarPanel(animar) {
const nombre = NOMBRES[prov];
pintarDestaca();
pintarCompara();
pintarPuestos();
pintarCensos();
pintarEstablecimientos();
const pie = $("prov-pie"); if (pie) pie.hidden = !nombre;
if (PAGINA === "provincia") document.title = nombre ? `${nombre} en números | Datina` : TITULO_INICIAL;
cambiarTexto($("prov-titulo-txt"), nombre ? `${nombre} en números` : "¿Cómo se compara tu provincia con el país?", animar);
const pb = $("prov-band"), nueva = nombre ? bandera(prov, "grande") : "";
if (pb.innerHTML !== nueva) { pb.innerHTML = nueva; if (animar && !REDUCIR && nueva) pb.animate([{opacity: 0}, {opacity: 1}], {duration: DUR_C, easing: "ease-out"}); }
const capF = T.capitales.find(r => r.codigo_indec === prov), capT = document.querySelector("#pg-capital-t span");
if (capT) capT.textContent = !capF ? "La capital" : prov === "02" ? "CABA, entre las capitales" : `Su capital, ${capF.territorio}`;
grilla.querySelectorAll(".dp").forEach(el => {
const c = PERFIL[+el.dataset.i], fila = c.d.find(d => d.codigo_indec === prov);
const orden = [...c.d].sort((a, b) => b[c.k] - a[c.k]).findIndex(d => d.codigo_indec === prov) + 1;
const invita = !fila && c.pais == null;
el.querySelector(".dp-num").classList.toggle("invita", invita);
cambiarTexto(el.querySelector(".dp-num"), fila ? c.f(fila[c.k]) : invita ? "Elegí una provincia" : c.f(c.pais), animar);
const vz = fila && c.veces && c.pais != null ? vecesPais(fila[c.k], c.pais, c.veces === "debajo") : "";
el.querySelector(".dp-pos").textContent = fila ? `${c.cap ? puestoTxt(orden, c.d.length, "capitales") : puestoTxt(orden, c.d.length)}.${c.pais == null ? "" : ` País: ${c.f(c.pais)}.`}${vz ? ` Es ${vz}.` : ""}${c.ocde == null ? "" : ` Promedio de la OCDE: ${c.f(c.ocde)}.`}` : c.pais == null ? "Sin total nacional comparable" : nombre ? `Sin dato para ${nombre}: la cifra es la del total del país.` : "Total del país";
el.querySelector(".dp-aclara").textContent = fila ? notaDist(c, prov) : "";
const punto = d3.select(el).select("circle.elegida");
if (!fila) { punto.attr("opacity", 0); return; }
(animar && !REDUCIR && punto.attr("opacity") === "1" ? punto.transition().duration(DUR_G).ease(EASE) : punto)
.attr("cx", c.x(fila[c.k])).attr("opacity", 1);
});
}
function perfilCSV() {
const q = v => /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v);
const tema = Object.fromEntries(PERFIL_GRUPOS), orden_g = PERFIL_GRUPOS.map(([g]) => g);
const filas = [...PERFIL].sort((a, b) => orden_g.indexOf(a.g) - orden_g.indexOf(b.g)).map(c => {
const fila = c.d.find(d => d.codigo_indec === prov);
if (!fila) return null;
const orden = [...c.d].sort((a, b) => b[c.k] - a[c.k]).findIndex(d => d.codigo_indec === prov) + 1;
const pag = UBIC[c.id] || UBIC[(SITIO.alias || {})[c.id]] || "";
return [tema[c.g], c.lab, c.det, fila[c.k], c.pais ?? "", orden, c.d.length, pag ? `${location.origin}/${pag === "inicio" ? "" : pag}#${c.id}` : ""];
}).filter(Boolean);
return [["tema", "indicador", "detalle", "valor", "pais", "puesto", "de", "ficha"], ...filas].map(f => f.map(q).join(",")).join("\n") + "\n";
}
document.getElementById("prov-csv")?.addEventListener("click", () => {
if (!prov) return;
const a = document.createElement("a");
a.href = URL.createObjectURL(new Blob(["﻿" + perfilCSV()], {type: "text/csv;charset=utf-8"}));
a.download = `datina_perfil_${(urlProv(prov) || prov).replace("provincia-", "")}.csv`;
document.body.appendChild(a); a.click(); a.remove();
setTimeout(() => URL.revokeObjectURL(a.href), 1000);
avisar("Perfil descargado");
});
document.getElementById("prov-citar")?.addEventListener("click", async ev => {
if (!prov) return;
const b = ev.currentTarget, hoy = new Date();
const cita = `Datina (${hoy.getFullYear()}). ${NOMBRES[prov]} en números. ${location.origin}/${urlProv(prov)}. ` +
`Consultado el ${hoy.getDate()} de ${MESES[hoy.getMonth()]} de ${hoy.getFullYear()}.`;
let ok = false;
try { await navigator.clipboard.writeText(cita); ok = true; } catch (_) {}
b.textContent = ok ? "Cita copiada" : "No se pudo copiar";
avisar(ok ? "Cita copiada" : "No se pudo copiar");
clearTimeout(b._t); b._t = setTimeout(() => { b.textContent = "Copiar cita"; }, 1800);
});
PERFIL_PROV.tiras = tiras;
PERFIL_PROV.pintar = pintarPanel;
};
