(() => {
"use strict";
const raiz = document.getElementById("rt");
if (!raiz) return;
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const dec = (v, n) => (Math.round(v * 10 ** n + 1e-9) / 10 ** n).toLocaleString("es-AR", {minimumFractionDigits: n, maximumFractionDigits: n});
const pct = v => dec(v, 1) + "%";
const plata = v => v >= 1000 ? `${dec(v / 1000, 1)} mil millones de dólares` : v >= 10 ? `${dec(v, 0)} millones de dólares` : `${dec(v, 1)} millones de dólares`;
const TOP = 10;
const REDUCIR_MOV = matchMedia("(prefers-reduced-motion: reduce)").matches;
const COLOR = Array.from({length: TOP}, (_, i) => getComputedStyle(document.documentElement).getPropertyValue(`--rt-c${i + 1}`).trim());
let D = null, mapa = null;
const estado = {anio: 0, rubro: "", sub: ""};
function filas() {
return (D.valores[estado.anio] || []).map(([i, v]) => {
const [pais_cod, sub, rubro, salida, modo, destino, linea] = D.caminos[i];
return {pais_cod, pais: D.paises[pais_cod], sub, rubro, salida, modo, destino, linea, v};
}).filter(f => (!estado.rubro || f.rubro === estado.rubro) && (!estado.sub || f.sub === estado.sub));
}
const sinPais = f => f.pais === "Sin país informado";
function porPais(fs) {
const m = new Map();
for (const f of fs) {
if (sinPais(f)) continue;
const p = m.get(f.pais_cod) || {c: f.pais_cod, n: f.pais, v: 0, caminos: new Map()};
p.v += f.v;
const k = f.modo ? `${f.salida}|${f.modo}|${f.destino}` : "";
p.caminos.set(k, (p.caminos.get(k) || 0) + f.v);
m.set(f.pais_cod, p);
}
return [...m.values()].sort((a, b) => b.v - a.v || a.n.localeCompare(b.n, "es")).map(p => {
const [k] = [...p.caminos].sort((a, b) => b[1] - a[1])[0];
const [salida, modo, destino] = k ? k.split("|") : ["", "", ""];
return {...p, salida, modo, destino};
});
}
const camino = p => !p.modo ? "Sin camino dibujado" : p.modo === "avión" ? `En avión desde ${p.salida.replace(" (avión)", "")}`
: p.modo === "tierra" ? `Por tierra, por ${p.destino}` : `Por mar, de ${p.salida} a ${p.destino}`;
const nombreSub = c => D.subrubros[c] ? D.subrubros[c][0] : "Sin rubro informado";
function opcionesSub() {
const sel = $("rt-sub");
const subs = Object.entries(D.subrubros).filter(([, [, r]]) => !estado.rubro || r === estado.rubro)
.sort((a, b) => a[1][0].localeCompare(b[1][0], "es"));
sel.innerHTML = `<option value="">Todos</option>` + subs.map(([c, [n]]) => `<option value="${c}">${esc(n)}</option>`).join("");
sel.value = estado.sub = "";
}
let colorDe = new Map();
function pintar() {
const fs = filas(), tot = fs.reduce((s, f) => s + f.v, 0), ps = porPais(fs), top = ps.slice(0, TOP);
colorDe = new Map(top.map((p, i) => [p.c, COLOR[i]]));
const max = top.length ? top[0].v : 1;
const nombre = estado.sub ? nombreSub(estado.sub).toLowerCase() : estado.rubro ? D.rubros[estado.rubro].toLowerCase() : "";
$("rt-anio-val").textContent = estado.anio;
$("rt-lista-tit").textContent = `Los ${Math.min(TOP, ps.length)} primeros destinos en ${estado.anio}`;
$("rt-lista").innerHTML = top.map((p, i) => `<li><button type="button" data-c="${p.c}" style="--rt-color:${COLOR[i]}">
      <span class="rt-n">${esc(p.n)}</span><span class="rt-x">${pct(100 * p.v / tot)}</span>
      <span class="rt-b" aria-hidden="true"><i style="width:${(100 * p.v / max).toFixed(2)}%"></i></span>
      <span class="rt-d">${plata(p.v)}. ${esc(camino(p))}</span></button></li>`).join("");
const sp = fs.filter(sinPais).reduce((s, f) => s + f.v, 0);
const dib = fs.filter(f => f.modo).reduce((s, f) => s + f.v, 0);
const a = ps[0];
$("rt-frase").textContent = !a ? `No hay exportaciones con lo elegido en ${estado.anio}.` :
`En ${estado.anio} la Argentina exportó ${plata(tot)}${nombre ? " en " + nombre : ""}. El primer destino fue ${a.n}, con ${pct(100 * a.v / tot)} del total. ` +
`El mapa dibuja el ${pct(100 * dib / tot)}: ` + (sp ? `el ${pct(100 * sp / tot)} salió sin país informado (lo que el INDEC publica como confidencial) y ` : "") +
`el resto va a países fuera de la tabla de destinos o sin un camino que se pueda dibujar.`;
$("rt-tabla").innerHTML = `<caption class="solo-lector">Exportaciones${nombre ? " de " + esc(nombre) : ""} por país de destino, ${estado.anio}</caption>` +
`<thead><tr><th scope="col">País</th><th scope="col" class="n">Millones de dólares</th><th scope="col" class="n">% del total</th><th scope="col">Camino principal</th></tr></thead><tbody>` +
ps.map(p => `<tr><th scope="row">${esc(p.n)}</th><td class="n">${dec(p.v, 1)}</td><td class="n">${pct(100 * p.v / tot)}</td><td>${esc(camino(p))}</td></tr>`).join("") +
(sp ? `<tr><th scope="row">Sin país informado</th><td class="n">${dec(sp, 1)}</td><td class="n">${pct(100 * sp / tot)}</td><td>Sin camino dibujado</td></tr>` : "") + `</tbody>`;
if (mapa) mapa.pintar(fs, tot);
raiz.removeAttribute("aria-busy");
}
const cerrarTip = () => $("tip")?.classList.remove("on");
function textoTip(l, tot) {
const prods = [...l.prods].sort((a, b) => b[1] - a[1]).slice(0, 3);
return `<strong>${esc(D.paises[l.c])}</strong><br>${esc(camino(l))}<br>${esc(plata(l.v))} en ${estado.anio}, ${pct(100 * l.v / tot)} de lo elegido` +
(prods.length > 1 || !estado.sub ? `<br>Sobre todo: ${prods.map(([c, v]) => `${esc(nombreSub(c).toLowerCase())} (${pct(100 * v / l.v)})`).join(", ")}` : "");
}
function armarMapa(mundo) {
const W = 960, H = 500, svg = d3.select("#rt-mapa"), lienzo = $("rt-lienzo");
const proy = d3.geoNaturalEarth1().rotate([30, 0]).fitExtent([[8, 8], [W - 8, H - 8]], {type: "Sphere"});
const geo = d3.geoPath(proy);
svg.attr("viewBox", `0 0 ${W} ${H}`);
const capa = svg.append("g");
capa.append("path").attr("class", "rt-esfera").attr("d", geo({type: "Sphere"}));
capa.append("g").selectAll("path").data(topojson.feature(mundo, mundo.objects.countries).features).join("path")
.attr("class", d => "rt-pais" + (d.properties.name === "Argentina" ? " rt-arg" : "")).attr("d", geo);
const gR = capa.append("g"), gT = capa.append("g"), gP = capa.append("g");
const ancho = d3.scaleSqrt().range([0, 9]);
let tot = 1, k = 1;
const zoom = d3.zoom().scaleExtent([1, 12]).extent([[0, 0], [W, H]]).translateExtent([[0, 0], [W, H]])
.filter(ev => ev.type === "wheel" ? ev.ctrlKey || ev.metaKey : ev.type === "touchstart" ? ev.touches.length > 1 : !ev.button)
.on("zoom", ev => { capa.attr("transform", ev.transform); k = ev.transform.k; gP.selectAll("circle").attr("r", 4.5 / k).style("stroke-width", 1 / k); });
svg.call(zoom).on("dblclick.zoom", null);
raiz.querySelector(".rt-zoom").addEventListener("click", e => {
const z = e.target.closest("button")?.dataset.z;
if (!z) return;
const s = REDUCIR_MOV ? svg : svg.transition().duration(200);
if (z === "todo") s.call(zoom.transform, d3.zoomIdentity);
else s.call(zoom.scaleBy, z === "mas" ? 2 : .5);
});
const tip = (ev, l) => {
const t = $("tip");
if (!t) return;
const r = lienzo.getBoundingClientRect(), pr = document.body.getBoundingClientRect(), [x, y] = d3.pointer(ev, lienzo);
t.classList.remove("tip-cifra", "abajo"); t.innerHTML = textoTip(l, tot); t.classList.add("on");
const left = Math.max(8, Math.min(r.left - pr.left + x - t.offsetWidth / 2, document.documentElement.clientWidth - t.offsetWidth - 8));
t.style.left = left + "px"; t.style.top = (r.top - pr.top + y - t.offsetHeight - 12) + "px";
};
gT.on("pointermove", ev => { const l = ev.target.__data__; if (l) { tip(ev, l); mapa.resaltar(l.c); } })
.on("pointerleave", ev => { if (ev.pointerType === "mouse") { cerrarTip(); mapa.resaltar(""); } })
.on("click", ev => { const l = ev.target.__data__; if (l) { tip(ev, l); mapa.resaltar(l.c); } });
document.addEventListener("pointerdown", ev => { if (!ev.target.closest?.("#rt-lienzo")) { cerrarTip(); mapa.resaltar(""); } });
document.addEventListener("keydown", ev => { if (ev.key === "Escape") { cerrarTip(); mapa.resaltar(""); } });
return {
pintar(fs, total) {
tot = total || 1;
const lin = d3.rollups(fs.filter(f => f.modo), v => ({v: d3.sum(v, f => f.v), c: v[0].pais_cod, modo: v[0].modo, salida: v[0].salida, destino: v[0].destino,
prods: d3.rollups(v, w => d3.sum(w, f => f.v), f => f.sub)}), f => f.linea)
.map(([key, x]) => ({key, ...x})).sort((a, b) => b.v - a.v);
ancho.domain([0, d3.max(lin, l => l.v) || 1]);
lin.sort((a, b) => (colorDe.has(a.c) - colorDe.has(b.c)) || b.v - a.v);
const d = l => geo({type: "LineString", coordinates: D.lineas[l.key]});
gR.selectAll("path").data(lin, l => l.key).join("path").attr("class", l => "rt-ruta rt-" + (l.modo === "avión" ? "avion" : l.modo) + (colorDe.has(l.c) ? "" : " rt-otro"))
.attr("data-c", l => l.c).style("stroke", l => colorDe.get(l.c) || null)
.attr("stroke-width", l => Math.max(.7, ancho(l.v))).attr("d", d);
gT.selectAll("path").data(lin, l => l.key).join("path").attr("class", "rt-toque").attr("stroke-width", l => Math.max(10, ancho(l.v) + 6)).attr("d", d);
const usadas = new Set(fs.filter(f => f.modo && D.salidas[f.salida]).map(f => f.salida));
gP.selectAll("circle").data([...usadas].map(s => D.salidas[s])).join("circle").attr("class", "rt-salida").attr("r", 4.5 / k).style("stroke-width", 1 / k)
.attr("cx", p => proy(p)[0]).attr("cy", p => proy(p)[1]);
svg.attr("aria-label", `Mapa del mundo con ${lin.length} caminos simulados de las exportaciones de lo elegido en ${estado.anio}, más gruesos cuanto más se exporta y con un color para cada uno de los diez primeros destinos. La lista y la tabla tienen los mismos datos.`);
},
resaltar(c) { gR.selectAll("path").classed("on", l => !!c && l.c === c).classed("off", l => !!c && l.c !== c); }
};
}
raiz.querySelector(".rt-rubros").addEventListener("click", e => {
const b = e.target.closest("button[data-r]");
if (!b || !D) return;
b.parentNode.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
b.parentNode.style.setProperty("--i", [...b.parentNode.children].indexOf(b));
estado.rubro = b.dataset.r;
opcionesSub();
pintar();
});
$("rt-sub").addEventListener("change", e => { estado.sub = e.target.value; pintar(); });
$("rt-anio").addEventListener("input", e => { estado.anio = +e.target.value; cerrarTip(); pintar(); });
const lista = $("rt-lista"), marcar = e => { const b = e.target.closest("button[data-c]"); if (mapa) mapa.resaltar(b ? b.dataset.c : ""); };
lista.addEventListener("pointerover", marcar);
lista.addEventListener("focusin", marcar);
lista.addEventListener("pointerleave", () => mapa && mapa.resaltar(""));
lista.addEventListener("focusout", e => { if (!lista.contains(e.relatedTarget) && mapa) mapa.resaltar(""); });
$("rt-ver-tabla").addEventListener("click", e => {
const t = $("rt-tabla-caja"), abrir = t.hidden;
t.hidden = !abrir;
e.currentTarget.setAttribute("aria-expanded", String(abrir));
e.currentTarget.textContent = abrir ? "Ocultar tabla" : "Ver tabla";
});
function falla() {
raiz.removeAttribute("aria-busy");
$("rt-estado").textContent = "No se pudieron cargar los datos.";
$("rt-falla").hidden = false;
}
fetch(raiz.dataset.datos).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(d => {
D = d;
estado.anio = D.anio;
const r = $("rt-anio");
Object.assign(r, {min: D.anios[0], max: D.anios[D.anios.length - 1], value: D.anio, disabled: false});
opcionesSub();
$("rt-sub").disabled = false;
$("rt-estado").textContent = "";
pintar();
if (!window.d3 || !window.topojson) { $("rt-mapa-caja").hidden = true; return; }
fetch("datos/mundo-110m.json").then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(m => {
mapa = armarMapa(m);
mapa.pintar(filas(), filas().reduce((s, f) => s + f.v, 0));
}).catch(() => { $("rt-mapa-caja").hidden = true; });
}).catch(falla);
})();
