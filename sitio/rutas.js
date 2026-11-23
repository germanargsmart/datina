(() => {
"use strict";
const raiz = document.getElementById("rt");
if (!raiz) return;
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const dec = (v, n) => (Math.round(v * 10 ** n + 1e-9) / 10 ** n).toLocaleString("es-AR", {minimumFractionDigits: n, maximumFractionDigits: n});
const pct = v => dec(v, 1) + "%";
const plata = v => v >= 1000 ? `${dec(v / 1000, 1)} mil millones de dólares` : `${dec(v, 0)} millones de dólares`;
const MODO = {mar: "por mar", tierra: "por tierra", "avión": "en avión"};
const TOP = 10;
let D = null, mapa = null;
const estado = {rubro: "", sub: ""};
function filas() {
return D.flujos.filter(f => (!estado.rubro || f[3] === estado.rubro) && (!estado.sub || f[2] === estado.sub))
.map(f => ({pais_cod: f[0], pais: f[1], sub: f[2], rubro: f[3], salida: f[4], modo: f[5], destino: f[6], v: f[7], linea: f[8]}));
}
function porPais(fs) {
const m = new Map();
for (const f of fs) {
if (f.pais === "Sin país informado") continue;
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
function opcionesSub() {
const sel = $("rt-sub");
const subs = Object.entries(D.subrubros).filter(([, [, r]]) => !estado.rubro || r === estado.rubro)
.sort((a, b) => a[1][0].localeCompare(b[1][0], "es"));
sel.innerHTML = `<option value="">Todos</option>` + subs.map(([c, [n]]) => `<option value="${c}">${esc(n)}</option>`).join("");
sel.value = estado.sub = "";
}
function pintar() {
const fs = filas(), tot = fs.reduce((s, f) => s + f.v, 0), ps = porPais(fs), top = ps.slice(0, TOP);
const max = top.length ? top[0].v : 1;
const nombre = estado.sub ? D.subrubros[estado.sub][0].toLowerCase() : estado.rubro ? D.rubros[estado.rubro].toLowerCase() : "";
$("rt-lista-tit").textContent = `Los ${Math.min(TOP, ps.length)} primeros destinos`;
$("rt-lista").innerHTML = top.map(p => `<li><button type="button" data-c="${p.c}">
      <span class="rt-n">${esc(p.n)}</span><span class="rt-x">${pct(100 * p.v / tot)}</span>
      <span class="rt-b" aria-hidden="true"><i style="width:${(100 * p.v / max).toFixed(2)}%"></i></span>
      <span class="rt-d">${plata(p.v)}. ${esc(camino(p))}</span></button></li>`).join("");
const sinPais = fs.filter(f => f.pais === "Sin país informado").reduce((s, f) => s + f.v, 0);
const dib = fs.filter(f => f.modo).reduce((s, f) => s + f.v, 0);
const a = ps[0];
$("rt-frase").textContent = !a ? "No hay exportaciones con lo elegido." :
`En ${D.anio} la Argentina exportó ${plata(tot)}${nombre ? " en " + nombre : ""}. El primer destino fue ${a.n}, con ${pct(100 * a.v / tot)} del total. ` +
`El mapa dibuja el ${pct(100 * dib / tot)}: ` + (sinPais ? `el ${pct(100 * sinPais / tot)} salió sin país informado (lo que el INDEC publica como confidencial) y ` : "") +
`el resto va a países fuera de la tabla de destinos o sin un camino que se pueda dibujar.`;
$("rt-tabla").innerHTML = `<caption class="solo-lector">Exportaciones${nombre ? " de " + esc(nombre) : ""} por país de destino, ${D.anio}</caption>` +
`<thead><tr><th scope="col">País</th><th scope="col" class="n">Millones de dólares</th><th scope="col" class="n">% del total</th><th scope="col">Camino principal</th></tr></thead><tbody>` +
ps.map(p => `<tr><th scope="row">${esc(p.n)}</th><td class="n">${dec(p.v, 1)}</td><td class="n">${pct(100 * p.v / tot)}</td><td>${esc(camino(p))}</td></tr>`).join("") +
(sinPais ? `<tr><th scope="row">Sin país informado</th><td class="n">${dec(sinPais, 1)}</td><td class="n">${pct(100 * sinPais / tot)}</td><td>Sin camino dibujado</td></tr>` : "") + `</tbody>`;
if (mapa) mapa.pintar(fs);
raiz.removeAttribute("aria-busy");
}
function armarMapa(mundo) {
const W = 960, H = 500, svg = d3.select("#rt-mapa");
const proy = d3.geoNaturalEarth1().rotate([30, 0]).fitExtent([[8, 8], [W - 8, H - 8]], {type: "Sphere"});
const geo = d3.geoPath(proy);
svg.attr("viewBox", `0 0 ${W} ${H}`);
svg.append("path").attr("class", "rt-esfera").attr("d", geo({type: "Sphere"}));
svg.append("g").selectAll("path").data(topojson.feature(mundo, mundo.objects.countries).features).join("path")
.attr("class", d => "rt-pais" + (d.properties.name === "Argentina" ? " rt-arg" : "")).attr("d", geo);
const gR = svg.append("g"), gP = svg.append("g");
const ancho = d3.scaleSqrt().range([0, 9]);
return {
pintar(fs) {
const lin = d3.rollups(fs.filter(f => f.modo), v => ({v: d3.sum(v, f => f.v), c: v[0].pais_cod, modo: v[0].modo}), f => f.linea)
.map(([k, x]) => ({k, ...x})).sort((a, b) => b.v - a.v);
ancho.domain([0, d3.max(lin, l => l.v) || 1]);
gR.selectAll("path").data(lin, l => l.k).join("path").attr("class", l => "rt-ruta rt-" + (l.modo === "avión" ? "avion" : l.modo)).attr("data-c", l => l.c)
.attr("stroke-width", l => Math.max(.7, ancho(l.v))).attr("d", l => geo({type: "LineString", coordinates: D.lineas[l.k]}));
const usadas = new Set(fs.filter(f => f.modo && D.salidas[f.salida]).map(f => f.salida));
gP.selectAll("circle").data([...usadas].map(s => D.salidas[s])).join("circle").attr("class", "rt-salida").attr("r", 4.5)
.attr("cx", p => proy(p)[0]).attr("cy", p => proy(p)[1]);
svg.attr("aria-label", `Mapa del mundo con ${lin.length} caminos simulados de las exportaciones de lo elegido, más gruesos cuanto más se exporta. La lista y la tabla tienen los mismos datos.`);
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
opcionesSub();
$("rt-sub").disabled = false;
$("rt-estado").textContent = "";
pintar();
if (!window.d3 || !window.topojson) { $("rt-mapa-caja").hidden = true; return; }
fetch("datos/mundo-110m.json").then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(m => {
mapa = armarMapa(m);
mapa.pintar(filas());
}).catch(() => { $("rt-mapa-caja").hidden = true; });
}).catch(falla);
})();
