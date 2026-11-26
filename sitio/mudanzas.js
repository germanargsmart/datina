(() => {
"use strict";
const raiz = document.getElementById("mu");
if (!raiz) return;
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
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
const LUGAR = {"02": [-58.42, -34.61], "06": [-60.4, -37.1], "94": [-67.6, -54.15], "30": [-59.2, -32.0], "82": [-60.9, -30.4], "22": [-60.6, -26.4], "34": [-59.9, -24.7]};
const MOTIVO = {uso_temporal: "Vacaciones o fin de semana", alquiler_venta: "En alquiler o en venta", en_construccion: "En construcción",
residentes_ausentes: "Sus habitantes no estaban", oficina_comercio: "Oficina, consultorio o comercio", otra_situacion: "Otra situación"};
let D, geo, topo, vec, prov = {}, cods = [], M, deps = [], depDe = {};
const E = {vista: "mudanzas", medida: "saldo", cada: false, motivo: "", p: "", dep: "", par: ""};
const VISTAS = ["mudanzas", "poblacion", "viviendas"];
const q = new URLSearchParams(location.search);
if (VISTAS.includes(q.get("vista"))) E.vista = q.get("vista");
const bajar = u => fetch(u).then(r => { if (!r.ok) throw new Error(u); return r.json(); });
const mapas = Promise.all(["datos/provincias.geojson", "datos/departamentos.topo.json", "datos/vecinos.topo.json"].map(bajar)).catch(() => null);
bajar("datos/mudanzas.json").then(async d => {
D = d;
preparar();
if (prov[q.get("provincia")]) E.p = q.get("provincia");
else if (/^\d\d-\d\d$/.test(q.get("flujo") || "") && q.get("flujo").split("-").every(c => prov[c])) E.par = q.get("flujo");
const m = await mapas;
raiz.setAttribute("aria-busy", "false");
$("mu-estado").textContent = "Datos cargados.";
if (m && window.d3 && window.topojson) { [geo, topo, vec] = m; armarMapa(); } else { $("mu-sin-mapa").hidden = false; }
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
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const CORTES_POB = [-5, 0, 10, 20, 40], CORTES_VIV = [5, 10, 15, 25, 40];
const clase = (v, cortes) => cortes.filter(c => v >= c).length;
const colorPob = v => css(`--mu-pob-${clase(v, CORTES_POB) + 1}`), colorViv = v => css(`--mu-viv-${clase(v, CORTES_VIV) + 1}`);
function colorProv(p) {
const v = medido(p), max = Math.max(...todas().map(x => Math.abs(medido(x))));
const t = Math.sqrt(Math.abs(v) / max);
if (E.medida === "saldo") return p.dudoso ? "url(#mu-trama)" : v >= 0 ? d3.interpolateRgb(css("--mu-gana-claro"), css("--celeste"))(t) : d3.interpolateRgb(css("--mu-pierde-claro"), css("--mu-pierde"))(t);
return E.medida === "llegan" ? d3.interpolateRgb(css("--mu-gana-claro"), css("--celeste"))(t) : d3.interpolateRgb(css("--mu-pierde-claro"), css("--mu-pierde"))(t);
}
function caminos() {
const l = [];
if (E.par) {
const [a, b] = E.par.split("-");
return [{o: a, d: b, v: M[a][b], t: "va"}, {o: b, d: a, v: M[b][a], t: "llega"}];
}
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
let svg, gZoom, zoom, proy, camino, ancho = 0, alto = 0, centro = {}, capas = {}, feats, depFeats, provFeats, malvinas;
const islas = pol => d3.geoCentroid({type: "Polygon", coordinates: pol})[0] > -62;
function armarMapa() {
feats = geo.features;
depFeats = topojson.feature(topo, topo.objects.departamentos).features;
const tdf = feats.find(f => f.properties.codigo_indec === "94");
malvinas = {type: "MultiPolygon", coordinates: tdf.geometry.coordinates.filter(islas)};
provFeats = feats.map(f => f === tdf ? {...tdf, geometry: {type: "MultiPolygon", coordinates: tdf.geometry.coordinates.filter(p => !islas(p))}} : f);
svg = d3.select("#mu-lienzo").append("svg").attr("role", "img").attr("aria-label", "Mapa de la Argentina. Las listas y las tablas tienen los mismos datos");
const defs = svg.append("defs");
const tr = defs.append("pattern").attr("id", "mu-trama").attr("width", 7).attr("height", 7).attr("patternUnits", "userSpaceOnUse").attr("patternTransform", "rotate(45)");
tr.append("rect").attr("width", 7).attr("height", 7).attr("fill", css("--mu-trama-fondo"));
tr.append("line").attr("y2", 7).attr("stroke", css("--mu-trama-linea")).attr("stroke-width", 2.4);
defs.append("g").attr("id", "mu-degradados");
defs.append("clipPath").attr("id", "mu-redondo").append("circle").attr("r", 10);
gZoom = svg.append("g");
["vecinos", "provincias", "departamentos", "islas", "limites", "caminos", "nodos"].forEach(k => { capas[k] = gZoom.append("g").attr("class", "mu-c-" + k); });
zoom = d3.zoom().scaleExtent([1, 14]).filter(ev => ev.type === "wheel" ? ev.ctrlKey : ev.type.startsWith("touch") ? ev.touches.length > 1 : !ev.button)
.on("zoom", ev => { gZoom.attr("transform", ev.transform); escalar(ev.transform.k); });
svg.call(zoom).on("dblclick.zoom", null).on("click", ev => { if (ev.target === svg.node() || ev.target.closest(".mu-c-vecinos")) { elegir(""); } });
raiz.querySelectorAll("[data-z]").forEach(b => b.addEventListener("click", () => {
if (b.dataset.z === "mas") svg.transition().duration(RM.matches ? 0 : 220).call(zoom.scaleBy, 1.7);
if (b.dataset.z === "menos") svg.transition().duration(RM.matches ? 0 : 220).call(zoom.scaleBy, 1 / 1.7);
if (b.dataset.z === "todo") svg.transition().duration(RM.matches ? 0 : 260).call(zoom.transform, d3.zoomIdentity);
}));
new ResizeObserver(() => { if (Math.abs($("mu-lienzo").clientWidth - ancho) > 2 || Math.abs($("mu-lienzo").clientHeight - alto) > 2) { medir(); dibujar(); } }).observe($("mu-lienzo"));
medir();
}
let kActual = 1;
function escalar(k) {
kActual = k;
capas.nodos.selectAll(".mu-nodo").attr("transform", d => `translate(${centro[d.c]}) scale(${1 / k})`);
}
function medir() {
ancho = $("mu-lienzo").clientWidth; alto = $("mu-lienzo").clientHeight;
if (!ancho || !alto) return;
svg.attr("viewBox", `0 0 ${ancho} ${alto}`);
const chico = ancho < 560;
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
capas.provincias.selectAll("path").data(provFeats, f => f.properties.codigo_indec).join(en => en.append("path")
.on("click", (ev, f) => elegir(f.properties.codigo_indec === E.p ? "" : f.properties.codigo_indec))
.on("pointermove", (ev, f) => senalar(ev, f.properties.codigo_indec)).on("pointerleave", () => { $("mu-tip").hidden = true; foco(""); })).attr("d", camino);
capas.islas.selectAll("path").data([malvinas]).join("path").attr("d", camino);
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
capas.islas.selectAll("path").style("fill", mud ? colorProv(prov["94"]) : "url(#mu-trama)").classed("lejos", mud && E.p && E.p !== "94");
raiz.classList.toggle("mu-por-dep", !mud);
if (mud) {
capas.provincias.selectAll("path").style("fill", f => colorProv(prov[f.properties.codigo_indec]))
.classed("elegida", f => f.properties.codigo_indec === E.p || (E.par && E.par.includes(f.properties.codigo_indec)))
.classed("lejos", f => (E.p && f.properties.codigo_indec !== E.p) || (E.par && !E.par.split("-").includes(f.properties.codigo_indec)));
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
g.append("path").attr("class", "toque").on("pointermove", (ev, x) => cartel(ev, cartelPar(x.o, x.d) + "<em>Tocá la línea para ver el detalle</em>"))
.on("pointerleave", () => { $("mu-tip").hidden = true; }).on("click", (ev, x) => { ev.stopPropagation(); $("mu-tip").hidden = true; elegirPar(x.o, x.d); });
return g;
}).order().each(function (x, i) {
d3.select(this).select(".linea").attr("d", curva(x.o, x.d)).attr("stroke", `url(#mu-g${i})`).attr("stroke-width", Math.max(1.2, grosor(x.v)));
d3.select(this).select(".toque").attr("d", curva(x.o, x.d));
});
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
sel.classed("lejos", d => (E.p || E.par) && !enCamino.has(d.c) && d.c !== E.p).classed("elegida", d => d.c === E.p || enCamino.has(d.c) && !!E.par);
const chico = ancho < 560, izq = new Set(["58", "50", "70", "26", "78", "46", "10", "38"]);
const ver = d => !chico || d.c === E.p || (E.par && enCamino.has(d.c)) || (!E.p && Math.abs(medido(d)) >= todas().map(x => Math.abs(medido(x))).sort((a, b) => b - a)[5]);
sel.select(".n").text(d => ver(d) ? d.corto : "").attr("x", d => izq.has(d.c) ? -15 : 15).attr("y", -1).attr("text-anchor", d => izq.has(d.c) ? "end" : "start");
sel.select(".v").text(d => ver(d) ? (E.p && d.c !== E.p ? "" : fMed(medido(d))) : "").attr("x", d => izq.has(d.c) ? -15 : 15).attr("y", 11).attr("text-anchor", d => izq.has(d.c) ? "end" : "start")
.attr("class", d => "v" + (E.medida !== "saldo" ? "" : d.dudoso ? " duda" : d.saldo > 0 ? " gana" : " pierde"));
sel.filter(ver).raise();
sel.filter(d => d.c === E.p).raise();
escalar(kActual);
inserto();
}
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
cartel(ev, `<strong>${bandera(c)}${esc(p.n)}</strong><span>Inmigrantes interprovinciales: <b>${num(p.llegan)}</b></span><span>Emigrantes interprovinciales: <b>${num(p.van)}</b></span>` +
`<span>Saldo migratorio: <b>${masMenos(p.saldo, num)}</b>${p.dudoso ? " (signo indeterminado)" : ""}</span>`);
}
const neto = (a, b) => {
const n = M[a][b] - M[b][a], [x, y] = n > 0 ? [b, a] : [a, b];
return n === 0 ? "Fueron tantas personas en un sentido como en el otro" : `Llegaron a ${prov[x].n} ${num(Math.abs(n))} personas más de las que salieron hacia ${prov[y].n}`;
};
const saldoPar = (a, b) => { const n = M[a][b] - M[b][a]; return n === 0 ? "0" : `${masMenos(Math.abs(n), num)} para ${prov[n > 0 ? b : a].n}`; };
const cartelPar = (a, b) => `<strong>${bandera(a)}${esc(prov[a].n)} y ${bandera(b)}${esc(prov[b].n)}</strong>` +
`<span>De ${esc(prov[a].n)} a ${esc(prov[b].n)}: <b>${num(M[a][b])}</b> personas</span><span>De ${esc(prov[b].n)} a ${esc(prov[a].n)}: <b>${num(M[b][a])}</b> personas</span><span>${esc(neto(a, b))}</span>`;
function senalarDep(ev, id) {
const d = depDe[id];
cartel(ev, E.vista === "poblacion"
? `<strong>${esc(nomDep(d))}</strong><span><b>${masMenos(d.cambio, pct)}</b> de ${D.censo_antes} a ${D.anio}${d.juntos ? ` (${esc(d.juntos)} juntos)` : ""}</span><span>${num(d.p22)} habitantes en ${D.anio}</span>`
: `<strong>${esc(nomDep(d))}</strong><span><b>${pct(parteSin(d))}</b> de las viviendas, ${E.motivo ? esc(MOTIVO[E.motivo].toLowerCase()) : "sin personas"}</span><span>${num(E.motivo ? d.mot[E.motivo] : d.sin)} de ${num(d.viv)}</span>`);
}
function enlace() {
const u = new URLSearchParams(location.search);
E.vista === "mudanzas" ? u.delete("vista") : u.set("vista", E.vista);
E.p ? u.set("provincia", E.p) : u.delete("provincia");
E.par ? u.set("flujo", E.par) : u.delete("flujo");
history.replaceState(null, "", location.pathname + (u.size ? "?" + u : "") + location.hash);
}
function elegirPar(a, b) {
E.par = a && b ? `${a}-${b}` : ""; E.p = ""; E.dep = "";
$("mu-prov").value = "";
if (svg) svg.transition().duration(RM.matches ? 0 : 280).call(zoom.transform, d3.zoomIdentity);
pintar();
}
function elegir(c) {
E.p = c; E.dep = ""; E.par = "";
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
const kpi = (t, cifra, sub, clase = "") => `<div class="rt-kpi${clase}"><p class="rt-k-tit">${t}</p>${cifra}<p class="rt-k-sub">${sub}</p></div>`;
const cifra = s => `<p class="rt-k-cifra">${s}</p>`;
const conBandera = (c, s) => `<p class="rt-k-cifra rt-k-txt">${bandera(c)}${esc(s)}</p>`;
const origenes = c => cods.filter(o => o !== c).map(o => ({c: o, v: M[o][c]})).sort((a, b) => b.v - a.v);
const destinos = c => cods.filter(o => o !== c).map(o => ({c: o, v: M[c][o]})).sort((a, b) => b.v - a.v);
const pares = () => cods.flatMap(o => cods.filter(d => d !== o).map(d => ({o, d, v: M[o][d]}))).sort((a, b) => b.v - a.v);
const tramos = () => {
const nom = [`Bajó ${-CORTES_POB[0]}% o más`, `Bajó menos de ${-CORTES_POB[0]}%`, `Subió menos de ${CORTES_POB[2]}%`, `Subió de ${CORTES_POB[2]}% a ${CORTES_POB[3]}%`,
`Subió de ${CORTES_POB[3]}% a ${CORTES_POB[4]}%`, `Subió ${CORTES_POB[4]}% o más`];
return nom.map((n, i) => ({n, i, l: deps.filter(d => clase(d.cambio, CORTES_POB) === i)}));
};
function pintarKpis() {
const el = $("mu-kpis"), T = todas();
if (E.vista === "mudanzas") {
const co = conOrigen(), so = sinOrigen(), par = pares()[0], mejor = [...T].filter(p => !p.dudoso).sort((a, b) => b.saldo - a.saldo)[0];
el.innerHTML = kpi(`Migrantes interprovinciales, ${D.desde} a ${D.anio}`, cifra(num(co + so)), `personas que se mudaron de una provincia a otra: el ${pct((co + so) / suma(T, p => p.viven) * 100)} de la población de 5 años y más`) +
kpi("No dijeron de qué provincia venían", cifra(pct(so / (co + so) * 100)), `${num(so)} personas: el saldo migratorio se calcula sin ellas`) +
kpi("Mayor saldo migratorio positivo", conBandera(mejor.c, mejor.n), `${masMenos(mejor.saldo, num)}: llegaron ${num(mejor.llegan)} personas y se fueron ${num(mejor.van)}`) +
kpi("Principal flujo migratorio", `<p class="rt-k-cifra rt-k-txt mu-k-par"><span class="mu-a">de</span> ${bandera(par.o)}${esc(prov[par.o].corto)} <span class="mu-a">a</span> ${bandera(par.d)}${esc(prov[par.d].corto)}</p>`,
`${num(par.v)} personas. En sentido contrario, ${num(M[par.d][par.o])}`);
} else if (E.vista === "poblacion") {
const p10 = suma(T, p => p.p10), p22 = suma(T, p => p.p22), baja = deps.filter(d => d.cambio < 0), masQue = deps.filter(d => d.cambio > (p22 / p10 - 1) * 100);
const g = [...deps].filter(d => d.p22 >= 1e4).sort((a, b) => b.cambio - a.cambio)[0];
el.innerHTML = kpi(`Población en ${D.anio}`, cifra(dec(p22 / 1e6, 1) + " millones"), `${masMenos((p22 / p10 - 1) * 100, pct)} desde ${D.censo_antes}`) +
kpi(`Departamentos con menos habitantes que en ${D.censo_antes}`, cifra(`${baja.length} de ${deps.length}`), `Con los partidos y las comunas. Reúnen el ${pct(suma(baja, d => d.p22) / p22 * 100)} de la población`) +
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
tit.textContent = {saldo: "Saldo migratorio por jurisdicción", llegan: "Inmigrantes interprovinciales por jurisdicción de destino", van: "Emigrantes interprovinciales por jurisdicción de origen"}[E.medida] +
(E.cada ? ", por mil habitantes" : "");
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
ol.innerHTML = sup.map(fila).join("") + (baja.length ? `<li class="mu-corte">Los que bajaron de población, desde 10.000 habitantes</li>` + baja.map(fila).join("") : "");
}
}
function pintarFicha() {
const el = $("mu-ficha"), c = $("mu-ficha-cuerpo");
el.hidden = !(E.p || (E.par && E.vista === "mudanzas") || (E.dep && E.vista !== "mudanzas"));
if (el.hidden) return;
const fila = (x, t) => `<li><span>${bandera(x.c)}${esc(prov[x.c].n)}</span><b>${num(x.v)}</b><small>${pct(x.v / t * 100)}</small></li>`;
if (E.vista === "mudanzas" && E.par) {
const [a, b] = E.par.split("-"), A = prov[a], B = prov[b], parte = (t, v, de) => `<li><span>${t}</span><small>${pct(v / de * 100)}</small></li>`;
c.innerHTML = `<div class="rt-f-cab mu-f-cab-par">${bandera(a)}${bandera(b)}<div><h3 id="mu-ficha-tit">${esc(A.n)} y ${esc(B.n)}</h3><p>Flujo migratorio entre las dos jurisdicciones, ${D.desde} a ${D.anio}</p></div></div>
        <dl class="rt-f-datos mu-f-par"><div><dt>De ${esc(A.n)} a ${esc(B.n)}</dt><dd class="mu-t-va">${num(M[a][b])} personas</dd></div><div><dt>De ${esc(B.n)} a ${esc(A.n)}</dt><dd class="mu-t-llega">${num(M[b][a])} personas</dd></div>
        <div><dt>Saldo del intercambio</dt><dd>${esc(saldoPar(a, b))}</dd></div><div><dt>Flujo total, en los dos sentidos</dt><dd>${num(M[a][b] + M[b][a])} personas</dd></div></dl>
        <h4>Qué parte de cada flujo representa</h4><ul class="rt-f-lista mu-f-partes">
          ${parte(`De los emigrantes de ${esc(A.n)}, fueron a ${esc(B.n)}`, M[a][b], A.van)}${parte(`De los inmigrantes de ${esc(B.n)}, vinieron de ${esc(A.n)}`, M[a][b], B.llegan)}
          ${parte(`De los emigrantes de ${esc(B.n)}, fueron a ${esc(A.n)}`, M[b][a], B.van)}${parte(`De los inmigrantes de ${esc(A.n)}, vinieron de ${esc(B.n)}`, M[b][a], A.llegan)}</ul>
        <p class="mu-f-nota">Los porcentajes de inmigrantes cuentan solo a quienes dijeron de qué provincia venían.</p>`;
} else if (E.vista === "mudanzas") {
const p = prov[E.p];
c.innerHTML = `<div class="rt-f-cab">${bandera(p.c)}<div><h3 id="mu-ficha-tit">${esc(p.n)}</h3><p>${p.dudoso ? "Saldo migratorio de signo indeterminado" : p.saldo > 0 ? "Saldo migratorio positivo" : "Saldo migratorio negativo"}</p></div></div>
        <dl class="rt-f-datos"><div><dt>Inmigrantes</dt><dd class="mu-t-llega">${num(p.llegan)}</dd></div><div><dt>Emigrantes</dt><dd class="mu-t-va">${num(p.van)}</dd></div>
        <div><dt>Saldo migratorio</dt><dd>${masMenos(p.saldo, num)}</dd></div><div><dt>Tasa neta por mil habitantes</dt><dd>${masMenos(p.saldo / p.viven * 1000, x => dec(x, 1))}</dd></div></dl>
        <h4>Principales orígenes de los inmigrantes</h4><ul class="rt-f-lista">${origenes(E.p).slice(0, 4).map(x => fila(x, p.llegan)).join("")}</ul>
        <h4>Principales destinos de los emigrantes</h4><ul class="rt-f-lista">${destinos(E.p).slice(0, 4).map(x => fila(x, p.van)).join("")}</ul>
        <p class="mu-f-nota">Además, ${num(p.sinDecir)} inmigrantes no declararon su jurisdicción de origen y ${num(p.exterior)} personas residían en el exterior en ${D.desde}. La tasa es por mil habitantes de 5 años y más.</p>`;
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
        <div><dt>Cambio</dt><dd>${masMenos(p.cambio, pct)}</dd></div><div><dt>Bajaron de población</dt><dd>${baja.length} de ${l.length}</dd></div>
        <div><dt>Viviendas sin personas</dt><dd>${pct(sin / viv * 100)}</dd></div><div><dt>Son</dt><dd>${num(sin)}</dd></div></dl>
        <h4>Por qué no había personas</h4><ul class="rt-f-lista">${mot.map(x => `<li><span>${MOTIVO[x.k]}</span><b>${num(x.v)}</b><small>${pct(x.v / sin * 100)}</small></li>`).join("")}</ul>`;
}
}
function pintarLeyenda() {
const el = $("mu-leyenda"), caja = (c, t) => `<span><i style="background:${c}"></i>${t}</span>`;
if (E.vista === "mudanzas") {
const linea = (c, t) => `<span><i class="mu-ley-linea" style="--c:var(${c})"></i>${t}</span>`;
el.innerHTML = (E.medida === "saldo" ? caja("var(--celeste)", "Saldo migratorio positivo") + caja("var(--mu-pierde)", "Saldo migratorio negativo") + `<span><i class="mu-ley-trama"></i>Signo indeterminado</span>` : "") +
(E.par ? linea("--mu-va", `De ${prov[E.par.slice(0, 2)].corto} a ${prov[E.par.slice(3)].corto}`) + linea("--mu-llega", `De ${prov[E.par.slice(3)].corto} a ${prov[E.par.slice(0, 2)].corto}`)
: E.p ? (E.medida !== "van" ? linea("--mu-llega", "Inmigración") : "") + (E.medida !== "llegan" ? linea("--mu-va", "Emigración") : "")
: linea("--mu-neutro", E.medida === "saldo" ? "Flujo neto entre dos jurisdicciones" : "Flujo migratorio"));
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
if (E.vista === "mudanzas" && !E.p && !E.par) {
const [p1, p2] = pares(), inverso = p2.o === p1.d && p2.d === p1.o, [g1, ...gs] = gana.slice(0, 3), [q1, ...qs] = pierde.slice(0, 3);
s = [`Entre ${D.desde} y ${D.anio}, ${num(co + so)} personas se mudaron de una provincia a otra. Se cuentan las de 5 años y más, porque el censo pregunta dónde vivía cada persona cinco años antes. El ${pct(so / (co + so) * 100)} no dijo en qué provincia vivía antes.`,
`El saldo migratorio de una provincia es la gente que llegó (inmigrantes) menos la que se fue (emigrantes). ${g1.n} tuvo el saldo más alto: llegaron ${num(g1.saldo)} personas más de las que se fueron. Le siguen ${lista(gs.map(p => `${p.n} (${masMenos(p.saldo, num)})`))}. ${q1.n} tuvo el más bajo: se fueron ${num(-q1.saldo)} personas más de las que llegaron. Le siguen ${lista(qs.map(p => `${p.n} (${masMenos(p.saldo, num)})`))}.`,
`En ${PALABRA[duda.length] || duda.length} jurisdicciones no se puede saber si el saldo migratorio es positivo o negativo: ${lista(duda.map(p => p.n).sort((a, b) => a.localeCompare(b, "es")))}. Su saldo cambia de signo según de dónde hayan venido quienes no dijeron su provincia.`,
`El flujo más grande fue de ${prov[p1.o].n} a ${prov[p1.d].n}: ${num(p1.v)} personas. En sentido contrario fueron ${num(M[p1.d][p1.o])}${inverso ? ", el segundo flujo más grande del país." : `. El segundo flujo más grande fue de ${prov[p2.o].n} a ${prov[p2.d].n}: ${num(p2.v)} personas.`}`];
} else if (E.vista === "mudanzas" && E.par) {
const [a, b] = E.par.split("-"), A = prov[a], B = prov[b], n = M[a][b] - M[b][a], [G, P] = n >= 0 ? [B, A] : [A, B], [g, pc] = n >= 0 ? [b, a] : [a, b];
s = [`Entre ${D.desde} y ${D.anio}, ${num(M[a][b])} personas se mudaron de ${A.n} a ${B.n} y ${num(M[b][a])} hicieron el camino inverso. ${neto(a, b)}.`,
`Los que llegaron a ${G.n} desde ${P.n} son el ${pct(M[pc][g] / G.llegan * 100)} de sus inmigrantes que dijeron de dónde venían. Para ${P.n}, los que se fueron a ${G.n} son el ${pct(M[pc][g] / P.van * 100)} de sus emigrantes.`];
} else if (E.vista === "mudanzas") {
const p = prov[E.p], o = origenes(E.p), d = destinos(E.p), signo = p.saldo >= 0 ? "positivo" : "negativo";
s = [`Entre ${D.desde} y ${D.anio} llegaron a ${p.n} ${num(p.llegan)} personas de otras provincias (inmigrantes) y se fueron ${num(p.van)} (emigrantes). El saldo migratorio es ${signo}: ${p.saldo >= 0
? `llegaron ${num(p.saldo)} personas más de las que se fueron` : `se fueron ${num(-p.saldo)} personas más de las que llegaron`}. Equivale a una tasa neta de ${masMenos(p.saldo / p.viven * 1000, x => dec(x, 1))} por cada mil habitantes de 5 años y más.`,
`La mayoría de los que llegaron vino de ${lista(o.slice(0, 3).map(x => `${prov[x.c].n} (${pct(x.v / p.llegan * 100)})`))}. Los que se fueron eligieron sobre todo ${lista(d.slice(0, 3).map(x => `${prov[x.c].n} (${pct(x.v / p.van * 100)})`))}.`,
`Además llegaron ${num(p.sinDecir)} personas que no dijeron de qué provincia venían, el ${pct(p.sinDecir / (p.sinDecir + p.llegan) * 100)} de los que llegaron. ${p.dudoso
? `Si se las reparte como al resto, el saldo pasa a ${masMenos(p.repartido, num)} y cambia de signo: por eso no se puede saber si el saldo de ${p.n} es positivo o negativo.`
: `Aun si se las reparte como al resto, el saldo sigue siendo ${signo} (${masMenos(p.repartido, num)}).`} También llegaron ${num(p.exterior)} personas que vivían en otro país.`];
} else if (E.vista === "poblacion") {
const l = E.p ? deps.filter(d => d.prov === E.p) : deps, nom = E.p ? prov[E.p].n : "el país", tipo = E.p === "02" ? "comunas" : E.p === "06" ? "partidos" : "departamentos";
const p10 = E.p ? prov[E.p].p10 : suma(T, p => p.p10), p22 = E.p ? prov[E.p].p22 : suma(T, p => p.p22), baja = l.filter(d => d.cambio < 0).sort((a, b) => a.cambio - b.cambio);
s = [`Entre los censos de ${D.censo_antes} y ${D.anio}, la población de ${E.p ? nom : "todo el país"} pasó de ${num(p10)} a ${num(p22)} habitantes (${masMenos((p22 / p10 - 1) * 100, pct)}). ${baja.length
? `${baja.length === 1 ? (tipo === "comunas" ? "Una" : "Uno") : mayus(PALABRA[baja.length] || num(baja.length))} de ${tipo === "comunas" ? "sus" : "los"} ${l.length} ${tipo} ${baja.length === 1 ? "tenía" : "tenían"} menos habitantes que doce años antes.`
: `Ninguna de las ${l.length} ${tipo} bajó de población.`.replace("Ninguna de las", tipo === "comunas" ? "Ninguna de las" : "Ninguno de los")}`];
if (!E.p) s.push(`Que un departamento tenga menos habitantes no quiere decir que se vaciaron sus casas. El cambio junta los nacimientos, las muertes y las mudanzas, y este dato no los separa.`);
} else {
const l = E.p ? deps.filter(d => d.prov === E.p) : deps, v = suma(l, d => d.viv), sin = suma(l, d => d.sin), mot = D.motivos.map(k => ({k, v: suma(l, d => d.mot[k])})).sort((a, b) => b.v - a.v);
s = [`En el Censo ${D.anio}, ${num(sin)} de las ${num(v)} viviendas particulares ${E.p ? `de ${prov[E.p].n}` : "del país"} no tenían personas presentes (${pct(sin / v * 100)}). Los motivos más frecuentes: ${lista(mot.slice(0, 3).map(x => `${MOTIVO[x.k].toLowerCase()} (${pct(x.v / sin * 100)})`))}.`];
if (!E.p) {
const t = tramos(), alto = t[5].l, bajo = t[0].l, medio = t.slice(1, 5).flatMap(x => x.l), r = a => pct(suma(a, d => d.sin) / suma(a, d => d.viv) * 100);
s.push(`Hay más viviendas sin personas en los dos extremos: ${r(bajo)} en los ${bajo.length} departamentos cuya población bajó ${-CORTES_POB[0]}% o más y ${r(alto)} en los ${alto.length} que crecieron ${CORTES_POB[4]}% o más, contra ${r(medio)} en los demás. Son pocos departamentos. En los que más crecieron, el ${pct(suma(alto, d => d.mot.uso_temporal) / suma(alto, d => d.sin) * 100)} de las viviendas sin personas son de vacaciones o fin de semana, y en los que más bajaron, el ${pct(suma(bajo, d => d.mot.uso_temporal) / suma(bajo, d => d.sin) * 100)}.`);
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
const COLS = [["n", "Jurisdicción", p => p.n, x => esc(x)], ["llegan", "Inmigrantes", p => p.llegan, num], ["van", "Emigrantes", p => p.van, num], ["saldo", "Saldo migratorio", p => p.saldo, x => masMenos(x, num)],
["cada", "Tasa neta por mil", p => p.saldo / p.viven * 1000, x => masMenos(x, y => dec(y, 1))], ["sin", "Inmigrantes sin origen declarado", p => p.sinDecir / (p.sinDecir + p.llegan) * 100, pct],
["rep", "Saldo con origen imputado", p => p.repartido, x => masMenos(x, num)], ["ext", "Residían en el exterior", p => p.exterior, num], ["p22", "Población", p => p.p22, num], ["cambio", "Variación intercensal", p => p.cambio, x => masMenos(x, pct)]];
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
$("mu-corr-tit").textContent = E.p ? `Principales flujos migratorios de ${prov[E.p].n}` : "Principales flujos migratorios";
$("mu-corr").innerHTML = l.map(x => `<li><button type="button" data-par="${x.o}-${x.d}" aria-pressed="${E.par === `${x.o}-${x.d}`}"><span class="mu-corr-cab"><span class="rt-c-ruta"><em>de</em> <span>${bandera(x.o)}${esc(prov[x.o].corto)}</span> <em>a</em> <span>${bandera(x.d)}${esc(prov[x.d].corto)}</span></span><span class="rt-c-v">${num(x.v)}</span></span>
      <span class="mu-ida" aria-hidden="true"><i class="${x.d === E.p ? "l" : x.o === E.p ? "v" : ""}" style="width:${x.v / max * 100}%"></i></span><span class="rt-c-prod">En sentido contrario: ${num(M[x.d][x.o])}. Saldo: ${esc(saldoPar(x.o, x.d))}.</span></button></li>`).join("");
}
function pintar() {
const act = document.activeElement, caja = act && act.closest && act.closest("#mu-lado-lista,#mu-corr"), k = caja && (act.dataset.p ? "p" : act.dataset.dep ? "dep" : act.dataset.par ? "par" : "");
const sel = k ? `#${caja.id} [data-${k}="${act.dataset[k]}"]` : "";
raiz.querySelectorAll(".mu-vistas button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.vista === E.vista)));
raiz.querySelectorAll(".mu-medidas button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.m === E.medida)));
raiz.dataset.vista = E.vista;
$("mu-prov").value = E.p;
$("mu-cada").checked = E.cada;
$("mu-motivo").value = E.motivo;
raiz.querySelectorAll("[data-solo]").forEach(x => { x.hidden = !x.dataset.solo.split(" ").includes(E.vista); });
$("mu-mapa-tit").textContent = {mudanzas: "Flujos migratorios entre jurisdicciones", poblacion: "Dónde creció y dónde bajó la población", viviendas: "Dónde hay viviendas sin personas"}[E.vista];
$("mu-mapa-sub").textContent = {mudanzas: `Migrantes interprovinciales de 5 años y más, de ${D.desde} a ${D.anio}`, poblacion: `Cambio entre los censos de ${D.censo_antes} y ${D.anio}, por departamento`,
viviendas: `Parte de las viviendas particulares, ${D.anio}, por departamento`}[E.vista];
pintarKpis(); pintarLado(); pintarFicha(); pintarLeyenda(); pintarFrase();
if (E.vista === "mudanzas") { pintarCorredores(); pintarMatriz(); pintarTabla(); } else pintarTramos();
if (sel) document.querySelector(sel)?.focus({preventScroll: true});
dibujar(); enlace();
}
raiz.addEventListener("click", ev => {
const b = ev.target.closest("button");
if (!b) return;
if (b.dataset.vista) { E.vista = b.dataset.vista; E.dep = ""; const c = E.p; pintar(); if (svg) elegir(c); }
else if (b.dataset.m) { E.medida = b.dataset.m; pintar(); }
else if (b.dataset.p) { elegir(b.dataset.p === E.p && b.closest("#mu-lado-lista") ? "" : b.dataset.p); }
else if (b.dataset.dep) { elegirDep(b.dataset.dep === E.dep ? "" : b.dataset.dep); }
else if (b.dataset.par) { const [x, y] = b.dataset.par.split("-"); E.par === b.dataset.par ? elegirPar("", "") : elegirPar(x, y); }
else if (b.dataset.k) { orden = {k: b.dataset.k, sube: orden.k === b.dataset.k ? !orden.sube : b.dataset.k === "n"}; pintarTabla(); raiz.querySelector(`[data-k="${b.dataset.k}"]`).focus(); }
else if (b.id === "mu-ficha-cerrar") { E.dep ? elegirDep("") : E.par ? elegirPar("", "") : elegir(""); $("mu-prov").focus(); }
});
document.addEventListener("keydown", ev => {
if (ev.key !== "Escape" || !(E.p || E.dep || E.par) || !(document.activeElement === document.body || raiz.contains(document.activeElement))) return;
E.dep ? elegirDep("") : E.par ? elegirPar("", "") : elegir("");
});
$("mu-prov").addEventListener("change", ev => elegir(ev.target.value));
$("mu-cada").addEventListener("change", ev => { E.cada = ev.target.checked; pintar(); });
$("mu-motivo").addEventListener("change", ev => { E.motivo = ev.target.value; pintar(); });
})();
