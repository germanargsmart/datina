(() => {
"use strict";
const raiz = document.getElementById("rt");
if (!raiz) return;
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const dec = (v, n) => (Math.round(v * 10 ** n + 1e-9) / 10 ** n).toLocaleString("es-AR", {minimumFractionDigits: n, maximumFractionDigits: n});
const pct = v => dec(v, 1) + "%";
const plata = v => v >= 1000 ? `${dec(v / 1000, 1)} mil millones de dólares` : v >= 10 ? `${dec(v, 0)} millones de dólares` : `${dec(v, 1)} millones de dólares`;
const corto = v => v >= 1000 ? `US$ ${dec(v / 1000, 1)} mil M` : `US$ ${dec(v, v >= 10 ? 0 : 1)} M`;
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const VIAS = ["mar", "tierra", "avión"];
const NOMBRE_VIA = {mar: "Por mar", tierra: "Por tierra", "avión": "En avión"};
const COLOR = {mar: css("--rt-mar"), tierra: css("--rt-tierra"), "avión": css("--rt-avion")};
const TOP = 10;
const MUNDO = [[-126, -56], [152, 66]], AIRE = {top: 8, bottom: 64, left: 8, right: 8};
const ICONO = {mar: {s: "M12 4v6M8 13V9h8v4M3 20.5c1.5 0 1.5-1.2 3-1.2s1.5 1.2 3 1.2 1.5-1.2 3-1.2 1.5 1.2 3 1.2 1.5-1.2 3-1.2 1.5 1.2 3 1.2", f: "M4 13h16l-2.2 4.2H6.2z"},
tierra: {s: "M3 7h11v9H3zM14 10h4l3 3v3h-7", f: "M5.4 17.5a2.1 2.1 0 1 0 4.2 0a2.1 2.1 0 1 0-4.2 0M14.9 17.5a2.1 2.1 0 1 0 4.2 0a2.1 2.1 0 1 0-4.2 0"},
"avión": {s: "", f: "M21 3.5c-1-1-2.6-.7-3.6.3L14 7.2 5 5 3.5 6.5l7.3 4L7.2 14l-2.7-.4L3 15l3.6 2.4L9 21l1.5-1.5-.4-2.7 3.5-3.6 4 7.3L19 19l-2.2-9 3.4-3.4c1-1 1.4-2.4.8-3.1z"}};
const icono = m => `<svg class="rt-ico" viewBox="0 0 24 24" aria-hidden="true">${ICONO[m].s ? `<path d="${ICONO[m].s}"/>` : ""}${ICONO[m].f ? `<path class="f" d="${ICONO[m].f}"/>` : ""}</svg>`;
const LETRA = {mar: "m", tierra: "t", "avión": "a"};
const sello = m => `<span class="rt-sello rt-k-${LETRA[m]}">${icono(m)}</span>`;
const EMOJI = {101: "🐴", 102: "🦐", 103: "🍯", 104: "🥕", 105: "🍋", 106: "🌾", 107: "🌱", 108: "🍂", 109: "🐑", 110: "🧶", 111: "⛏️", 199: "🌿", 201: "🥩", 202: "🐟",
203: "🧀", 204: "🥚", 205: "🥜", 206: "🧉", 207: "🍞", 208: "🌻", 209: "🍬", 210: "🥫", 211: "🍷", 212: "🥣", 213: "🌳", 214: "🐂", 215: "🧣", 299: "🧺", 302: "🧪", 303: "🧴",
304: "⚙️", 305: "👜", 306: "📄", 307: "👕", 308: "👟", 309: "🧱", 310: "🥇", 311: "🔩", 312: "🔌", 313: "🚗", 314: "🚁", 399: "🏭", 401: "🛢️", 402: "⛽", 403: "💧", 404: "🔥",
405: "💡", 499: "🏭"};
const emoji = c => `<span class="rt-emoji" aria-hidden="true">${EMOJI[c] || "📦"}</span>`;
const bandera = c => D.banderas.includes(c) ? `<img class="rt-flag" src="${raiz.dataset.banderas}${c.toLowerCase()}.svg" alt="" width="20" height="20">`
: `<span class="rt-flag rt-flag-sin" aria-hidden="true"></span>`;
const sinAvion = s => s.replace(" (avión)", "");
const emojiSalida = id => D.pasos[id] ? "🛂" : id.includes("avión") ? "🛫" : "⚓";
const REDUCIR_MOV = matchMedia("(prefers-reduced-motion: reduce)").matches;
const CELULAR = matchMedia("(max-width: 767px)");
let D = null, mapa = null, jugando = null;
const estado = {anio: 0, rubro: "", sub: "", vias: new Set(VIAS), sel: null, capas: {vehiculos: true, salidas: true, etiquetas: true, secundarias: true}};
let vista = null;
const sinPais = f => D.paises[f.pais_cod] === "Sin país informado";
const nombreSub = c => D.subrubros[c] ? D.subrubros[c][0] : "Sin rubro informado";
function filasDe(anio) {
return (D.valores[anio] || []).map(([i, v]) => {
const [pais_cod, sub, rubro, salida, modo, destino, linea] = D.caminos[i];
return {pais_cod, sub, rubro, salida, modo, destino, linea, v};
}).filter(f => (!estado.rubro || f.rubro === estado.rubro) && (!estado.sub || f.sub === estado.sub));
}
const todasLasVias = () => estado.vias.size === VIAS.length;
const porVia = fs => todasLasVias() ? fs : fs.filter(f => estado.vias.has(f.modo));
const suma = fs => fs.reduce((s, f) => s + f.v, 0);
function agrupar(fs, clave) {
const m = new Map();
for (const f of fs) { const k = clave(f); if (k == null) continue; m.set(k, (m.get(k) || 0) + f.v); }
return [...m].sort((a, b) => b[1] - a[1]);
}
const salidaDe = f => f.modo === "tierra" && !D.salidas[f.salida] ? f.destino : f.salida;
function calcular() {
const base = filasDe(estado.anio), fs = porVia(base), tot = suma(fs);
const conPais = fs.filter(f => !sinPais(f));
const destinos = agrupar(conPais, f => f.pais_cod);
const rango = new Map(destinos.map(([c], i) => [c, i + 1]));
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
const nombreFiltro = () => estado.sub ? nombreSub(estado.sub).toLowerCase() : estado.rubro ? D.rubros[estado.rubro].toLowerCase() : "";
const viasTexto = () => todasLasVias() ? "" : ` (solo ${[...estado.vias].map(m => NOMBRE_VIA[m].toLowerCase()).join(" y ")})`;
const camino = r => r.m === "avión" ? `En avión desde ${r.s.replace(" (avión)", "")}` : r.m === "tierra" ? `Por tierra, por ${r.d}` : `Por mar, de ${r.s} a ${r.d}`;
function pintarVias() {
raiz.querySelectorAll(".rt-via").forEach(b => {
const m = b.dataset.via, p = vista.totBase ? 100 * vista.viaTot[m] / vista.totBase : 0;
b.setAttribute("aria-pressed", String(estado.vias.has(m)));
b.querySelector("b").textContent = pct(p);
if (!b.querySelector(".rt-ico")) b.querySelector("i").innerHTML = icono(m);
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
function barras(el, items, total, nombre, marca, attr) {
const max = items.length ? items[0][1] : 1;
el.innerHTML = items.length ? items.map(([k, v]) => `<li><button type="button" ${attr}="${esc(k)}">${marca(k)}
      <span class="rt-b-n">${esc(nombre(k))}</span><span class="rt-b-x">${pct(100 * v / total)}</span>
      <span class="rt-b-barra" aria-hidden="true"><i style="width:${(100 * v / max).toFixed(2)}%"></i></span>
      <span class="rt-b-d">${esc(corto(v))}</span></button></li>`).join("") : `<li class="rt-nada">Nada con estos filtros.</li>`;
}
const VUELTA = 2 * Math.PI * 19;
const anillo = (m, p) => `<span class="rt-anillo rt-an-${LETRA[m]}"><span class="rt-an-o"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="19"/>${p > 0 ? `<circle class="v" cx="24" cy="24" r="19"
    stroke-dasharray="${(VUELTA * p / 100).toFixed(2)} ${VUELTA.toFixed(2)}" transform="rotate(-90 24 24)"/>` : ""}</svg>${icono(m)}</span><span class="rt-an-t"><b>${pct(p)}</b> ${NOMBRE_VIA[m].toLowerCase()}</span></span>`;
function pintarTarjetas() {
const {tot, prev, destinos, productos, corredores, viaTot, totBase, sinCamino} = vista;
const nombre = nombreFiltro();
const varia = prev ? (tot / prev - 1) * 100 : null;
const pd = destinos[0], pp = productos[0];
$("rt-mapa-sub").textContent = `${nombre ? nombre.charAt(0).toUpperCase() + nombre.slice(1) : "Todas las exportaciones"}, ${estado.anio}. Los caminos son simulados`;
$("rt-kpis").innerHTML = `
      <div class="rt-kpi"><p class="rt-k-tit">Exportado en ${estado.anio}${esc(viasTexto())}</p><p class="rt-k-cifra">${tot ? esc(corto(tot)) : "Sin datos"}</p>
        <p class="rt-k-sub">${varia == null ? "Primer año de la serie" : `${varia >= 0 ? "+" : "−"}${pct(Math.abs(varia))} frente a ${estado.anio - 1}`}</p></div>
      <div class="rt-kpi rt-kpi-vias"><p class="rt-k-tit">Por vía de transporte</p><p class="rt-k-anillos">${VIAS.map(m => anillo(m, totBase ? 100 * viaTot[m] / totBase : 0)).join("")}</p>
        ${sinCamino ? `<p class="rt-k-sub">${pct(100 * sinCamino / totBase)} sin camino en el mapa</p>` : ""}</div>
      <div class="rt-kpi"><p class="rt-k-tit">Principal destino</p><p class="rt-k-cifra rt-k-txt">${pd ? `${bandera(pd[0])}<span>${esc(D.paises[pd[0]])}</span>` : "Sin datos"}</p>
        <p class="rt-k-sub">${pd ? `${pct(100 * pd[1] / tot)} de lo exportado${nombre ? " en " + esc(nombre) : ""}` : ""}</p></div>
      <div class="rt-kpi"><p class="rt-k-tit">Principal producto</p><p class="rt-k-cifra rt-k-txt">${pp ? `${emoji(pp[0])}<span>${esc(nombreSub(pp[0]))}</span>` : "Sin datos"}</p>
        <p class="rt-k-sub">${pp ? `${pct(100 * pp[1] / tot)} de lo exportado` : ""}</p></div>`;
barras($("rt-destinos"), destinos.slice(0, TOP), tot, c => D.paises[c], bandera, "data-pais");
barras($("rt-productos"), productos.slice(0, TOP), tot, nombreSub, emoji, "data-sub");
const cmax = corredores.length ? corredores[0][1] : 1;
$("rt-corredores").innerHTML = corredores.length ? corredores.slice(0, TOP).map(([k, v]) => {
const [s, c, m] = k.split("|"), lider = agrupar(vista.fs.filter(f => f.salida === s && f.pais_cod === c && f.modo === m), f => f.sub)[0];
return `<li><button type="button" data-corr="${esc(k)}">${sello(m)}<span class="rt-c-ruta">${esc(sinAvion(s))} a <span>${bandera(c)}${esc(D.paises[c])}</span></span>
        <span class="rt-c-v">${esc(corto(v))}</span><span class="rt-c-prod"><span class="solo-lector">${NOMBRE_VIA[m]}.</span> ${lider ? `${emoji(lider[0])} ${esc(nombreSub(lider[0]))}` : ""}</span>
        <span class="rt-c-barra rt-an-${LETRA[m]}" aria-hidden="true"><i style="width:${(100 * v / cmax).toFixed(2)}%"></i></span></button></li>`;
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
function lista(items, nombre, total, marca) {
return `<ol class="rt-f-lista">${items.map(([k, v]) => `<li><span>${marca ? marca(k) : ""}<span>${esc(nombre(k))}</span></span><b>${esc(corto(v))}</b><small>${pct(100 * v / total)}</small></li>`).join("")}</ol>`;
}
const datosFicha = pares => `<dl class="rt-f-datos">${pares.filter(p => p && p[1]).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>`;
const parte = p => `<p class="rt-f-barra" aria-hidden="true"><i style="width:${Math.min(100, p).toFixed(2)}%"></i></p>`;
const cabFicha = (marca, que, tit) => `<div class="rt-f-cab">${marca}<div><h3 id="rt-ficha-tit">${esc(tit)}</h3><p>${esc(que)}</p></div></div>`;
function fichaHTML(sel) {
const fs = vista.fs, tot = vista.tot || 1;
if (sel.tipo === "pais") {
const de = fs.filter(f => f.pais_cod === sel.id), v = suma(de), p = 100 * v / tot;
return cabFicha(bandera(sel.id), "País de destino", D.paises[sel.id])
+ datosFicha([[`Compró en ${estado.anio}`, corto(v)], ["Parte del total", pct(p)], ["Puesto", vista.rango.has(sel.id) ? `${vista.rango.get(sel.id)} de ${vista.destinos.length}` : ""], ["Llega a", D.puertos[sel.id] || ""]]) + parte(p)
+ `<h4>Por dónde sale</h4>${lista(agrupar(de, f => f.modo ? `${f.modo}|${f.modo === "tierra" ? f.destino : sinAvion(f.salida)}` : "|Sin camino dibujado").slice(0, 5), k => k.split("|")[1], v || 1, k => k[0] === "|" ? "" : sello(k.split("|")[0]))}
        <h4>Qué compra</h4>${lista(agrupar(de, f => f.sub || null).slice(0, 5), nombreSub, v || 1, emoji)}`;
}
if (sel.tipo === "salida") {
const de = fs.filter(f => f.modo && salidaDe(f) === sel.id || (f.modo === "tierra" && f.destino === sel.id)), v = suma(de), p = 100 * v / tot;
return cabFicha(`<span class="rt-emoji" aria-hidden="true">${emojiSalida(sel.id)}</span>`, D.pasos[sel.id] ? "Paso de frontera" : sel.id.includes("avión") ? "Aeropuerto de salida" : "Puerto de salida", sinAvion(sel.id))
+ datosFicha([[`Salió en ${estado.anio}`, corto(v)], ["Parte del total", pct(p)]]) + parte(p)
+ `<h4>Adónde va</h4>${lista(agrupar(de, f => f.pais_cod).slice(0, 5), c => D.paises[c], v || 1, bandera)}
        <h4>Qué sale por acá</h4>${lista(agrupar(de, f => f.sub || null).slice(0, 5), nombreSub, v || 1, emoji)}`;
}
const de = sel.tipo === "linea" ? fs.filter(f => f.linea === sel.id) : fs.filter(f => `${f.salida}|${f.pais_cod}|${f.modo}` === sel.id);
const v = suma(de), f0 = de[0] || {}, p = 100 * v / tot, km = f0.linea && D.km[f0.linea];
return cabFicha(f0.modo ? sello(f0.modo) : "", `Ruta ${f0.modo ? NOMBRE_VIA[f0.modo].toLowerCase() : ""}`, `${sinAvion(f0.salida || "")} a ${D.paises[f0.pais_cod] || ""}`)
+ datosFicha([[`Pasó en ${estado.anio}`, corto(v)], ["Parte del total", pct(p)], f0.modo === "tierra" ? ["Cruza por", f0.destino] : ["Llega a", D.puertos[f0.pais_cod] || D.paises[f0.pais_cod]], km ? ["Distancia simulada", `${dec(km, 0)} km`] : null]) + parte(p)
+ `<h4>Qué lleva</h4>${lista(agrupar(de, f => f.sub || null).slice(0, 5), nombreSub, v || 1, emoji)}`;
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
function pintar() {
calcular();
$("rt-anio-val").textContent = estado.anio;
pintarVias();
pintarProducto();
pintarTarjetas();
if (mapa) mapa.datos();
if (estado.sel) {
const queda = estado.sel.tipo === "pais" ? vista.rango.has(estado.sel.id) : estado.sel.tipo === "linea" ? vista.rutas.some(r => r.k === estado.sel.id) : true;
if (queda) { $("rt-ficha-cuerpo").innerHTML = fichaHTML(estado.sel); if (mapa) mapa.foco(estado.sel); } else cerrarFicha();
}
raiz.removeAttribute("aria-busy");
}
function mostrarTip(html, x, y) {
const t = $("rt-tip"), caja = $("rt-mapa-caja");
t.innerHTML = html; t.hidden = false;
t.style.left = Math.max(8, Math.min(x + 14, caja.clientWidth - t.offsetWidth - 8)) + "px";
t.style.top = Math.max(8, y - t.offsetHeight - 10) + "px";
}
const ocultarTip = () => { $("rt-tip").hidden = true; };
const mezcla = (a, b) => { const n = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), p = n(a), q = n(b); return k => `rgb(${p.map((x, i) => Math.round(x + (q[i] - x) * k)).join(",")})`; };
const curvas = new Map();
function curva(k) {
if (curvas.has(k)) return curvas.get(k);
let l = D.lineas[k];
for (let v = 0; v < 3 && k in D.km; v++) {
const s = [l[0]];
for (let i = 0; i < l.length - 1; i++) { const [a, b] = [l[i], l[i + 1]]; s.push([a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25], [a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75]); }
s.push(l[l.length - 1]); l = s;
}
curvas.set(k, l);
return l;
}
const trayectos = new Map();
function trayecto(k) {
if (trayectos.has(k)) return trayectos.get(k);
const y = lat => Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)) * 180 / Math.PI;
const l = curva(k), ac = [0];
for (let i = 1; i < l.length; i++) ac.push(ac[i - 1] + Math.hypot(l[i][0] - l[i - 1][0], y(l[i][1]) - y(l[i - 1][1])));
const t = {l, ac, largo: ac[ac.length - 1] || 1};
trayectos.set(k, t);
return t;
}
function enTrayecto(t, u) {
const d = u * t.largo;
let a = 0, b = t.ac.length - 1;
while (b - a > 1) { const c = (a + b) >> 1; if (t.ac[c] <= d) a = c; else b = c; }
const q = (d - t.ac[a]) / (t.ac[b] - t.ac[a] || 1);
return [t.l[a][0] + (t.l[b][0] - t.l[a][0]) * q, t.l[a][1] + (t.l[b][1] - t.l[a][1]) * q];
}
function dibujoVehiculo(m, color) {
const R = 2, n = 32 * R, cv = document.createElement("canvas");
cv.width = cv.height = n;
const g = cv.getContext("2d");
g.shadowColor = "rgba(24,33,43,.35)"; g.shadowBlur = 3 * R; g.shadowOffsetY = R;
g.fillStyle = "#fff"; g.beginPath(); g.arc(n / 2, n / 2, 13 * R, 0, 7); g.fill();
g.shadowColor = "transparent";
g.fillStyle = color; g.beginPath(); g.arc(n / 2, n / 2, 11 * R, 0, 7); g.fill();
g.translate(n / 2, n / 2); g.scale(R * .6, R * .6); g.translate(-12, -12);
g.strokeStyle = g.fillStyle = "#fff"; g.lineWidth = 2; g.lineCap = g.lineJoin = "round";
if (ICONO[m].s) g.stroke(new Path2D(ICONO[m].s));
if (ICONO[m].f) g.fill(new Path2D(ICONO[m].f));
return g.getImageData(0, 0, n, n);
}
function armarMapa(mundo) {
const seguido = anillo => { let ant = null; return anillo.map(([lon, lat]) => { if (ant != null) lon += 360 * Math.round((ant - lon) / 360); ant = lon; return [lon, lat]; }); };
const tierra = topojson.feature(mundo, mundo.objects.countries);
tierra.features = tierra.features.filter(f => f.properties.name !== "Antarctica" && f.geometry).map(f => ({...f, geometry: {type: f.geometry.type,
coordinates: f.geometry.type === "Polygon" ? f.geometry.coordinates.map(seguido) : f.geometry.coordinates.map(pol => pol.map(seguido))}}));
const codigo = new Map(Object.entries(D.iso).map(([c, n]) => [n, c]));
const ARG = ["Argentina", "Falkland Is.", "S. Geo. and the Is."];
for (const f of tierra.features) f.properties = {c: ARG.includes(f.properties.name) ? "AR" : codigo.get(String(f.id).padStart(3, "0")) || ""};
const fondo = css("--rt-oceano"), suelo = css("--rt-suelo"), borde = css("--rt-borde"), arg = css("--rt-arg"), nodo = css("--rt-nodo"), costa = css("--rt-costa");
const compra = mezcla(css("--rt-compra-1"), css("--rt-compra-2"));
const m = new maplibregl.Map({
container: "rt-lienzo", attributionControl: {compact: true, customAttribution: "Natural Earth · searoute (Eurostat)"},
style: {version: 8, sources: {}, layers: [{id: "oceano", type: "background", paint: {"background-color": fondo}}]},
bounds: MUNDO, fitBoundsOptions: {padding: AIRE}, minZoom: 0, maxZoom: 7, dragRotate: false, pitchWithRotate: false, touchPitch: false,
cooperativeGestures: true, renderWorldCopies: true,
locale: {"CooperativeGesturesHandler.WindowsHelpText": "Para acercar, Ctrl y la rueda del mouse", "CooperativeGesturesHandler.MacHelpText": "Para acercar, ⌘ y la rueda del mouse",
"CooperativeGesturesHandler.MobileHelpText": "Para mover el mapa, dos dedos"}
});
m.touchZoomRotate.disableRotation();
const vacio = {type: "FeatureCollection", features: []};
const etiquetas = new Map(), nombres = [];
let listo = false, flota = [], quieto = REDUCIR_MOV, reloj = 0, antes = 0, aLaVista = true, focoAhora;
m.on("load", () => {
m.addSource("tierra", {type: "geojson", data: tierra});
m.addLayer({id: "costa", type: "line", source: "tierra", paint: {"line-color": costa, "line-width": 5, "line-blur": 4, "line-opacity": 0.7}});
m.addLayer({id: "tierra", type: "fill", source: "tierra", paint: {"fill-color": suelo}});
m.addLayer({id: "bordes", type: "line", source: "tierra", paint: {"line-color": borde, "line-width": 0.6}});
for (const s of ["rutas", "nodos", "flota"]) m.addSource(s, {type: "geojson", data: vacio});
const junta = {"line-cap": "round", "line-join": "round"};
m.addLayer({id: "halo", type: "line", source: "rutas", layout: junta, paint: {"line-color": "#ffffff", "line-width": ["+", ["get", "w"], 2.5], "line-opacity": 0.6}});
m.addLayer({id: "rutas", type: "line", source: "rutas", filter: ["!=", ["get", "m"], "avión"], layout: junta,
paint: {"line-color": ["match", ["get", "m"], "tierra", COLOR.tierra, COLOR.mar], "line-width": ["get", "w"], "line-opacity": 0.65}});
m.addLayer({id: "aereas", type: "line", source: "rutas", filter: ["==", ["get", "m"], "avión"], layout: {"line-cap": "butt"},
paint: {"line-color": COLOR["avión"], "line-width": ["get", "w"], "line-opacity": 0.65, "line-dasharray": [2.5, 1.8]}});
m.addLayer({id: "nodos", type: "circle", source: "nodos", paint: {"circle-radius": ["get", "r"], "circle-color": ["match", ["get", "t"], "destino", "#ffffff", nodo],
"circle-stroke-color": ["case", ["get", "b"], "#ffffff", ["match", ["get", "t"], "destino", nodo, "#ffffff"]], "circle-stroke-width": ["case", ["get", "b"], 2, ["match", ["get", "t"], "destino", 1.25, 1.5]]}});
for (const v of VIAS) m.addImage("v-" + v, dibujoVehiculo(v, COLOR[v]), {pixelRatio: 2});
m.addLayer({id: "flota-halo", type: "circle", source: "flota", filter: ["==", ["get", "s"], 1],
paint: {"circle-radius": 21, "circle-color": ["match", ["get", "m"], "tierra", COLOR.tierra, "avión", COLOR["avión"], COLOR.mar], "circle-opacity": 0.22}});
m.addLayer({id: "flota", type: "symbol", source: "flota", layout: {"icon-image": ["concat", "v-", ["get", "m"]], "icon-allow-overlap": true, "icon-ignore-placement": true,
"icon-size": ["interpolate", ["linear"], ["zoom"], 0, ["case", ["==", ["get", "s"], 1], 1, 0.74], 3, ["case", ["==", ["get", "s"], 1], 1.2, 1]]},
paint: {"icon-opacity": ["get", "o"]}});
for (const [n, p] of [["Océano Atlántico", [-47, 35]], ["Océano Pacífico", [-103, -48]], ["Océano Índico", [84, -33]]]) {
const el = document.createElement("span");
el.className = "rt-oceano"; el.textContent = n; el.setAttribute("aria-hidden", "true");
nombres.push(new maplibregl.Marker({element: el, opacityWhenCovered: "0"}).setLngLat(p).addTo(m));
}
listo = true;
if (CELULAR.matches) {
m.jumpTo(delCelular());
const cr = m.getContainer().querySelector(".maplibregl-ctrl-attrib");
if (cr) { cr.classList.remove("maplibregl-compact-show"); cr.removeAttribute("open"); }
}
api.datos();
if (estado.sel) api.foco(estado.sel);
if ("IntersectionObserver" in window) new IntersectionObserver(es => { aLaVista = es[es.length - 1].isIntersecting; if (aLaVista) andar(); }).observe($("rt-mapa-caja"));
api.mover(!quieto);
});
const CUANTOS = {mar: 8, tierra: 3, "avión": 3};
function armarFlota(visibles) {
const n = {mar: 0, tierra: 0, "avión": 0}, ya = new Set(), previa = new Map(flota.map(v => [v.k, v]));
flota = [];
for (const r of [...visibles].sort((a, b) => b.v - a.v)) {
if (n[r.m] >= CUANTOS[r.m] || ya.has(r.c + r.m)) continue;
ya.add(r.c + r.m);
const t = trayecto(r.k);
flota.push({k: r.k, c: r.c, m: r.m, s: r.s, d: r.d, t, dura: 9 + t.largo / 5, u: previa.has(r.k) ? previa.get(r.k).u : 0.1 + (0.45 + 0.618 * n[r.m]) % 0.8});
n[r.m]++;
}
}
function cuadroFlota() {
const f = focoAhora, es = v => !f ? null : f.tipo === "pais" ? v.c === f.id : f.tipo === "linea" ? v.k === f.id : f.tipo === "salida" ? v.s === f.id || v.d === f.id : `${v.s}|${v.c}|${v.m}` === f.id;
m.getSource("flota").setData({type: "FeatureCollection", features: (estado.capas.vehiculos ? flota : []).map(v => {
const si = es(v), punta = Math.max(0, Math.min(1, v.u * 14, (1 - v.u) * 14));
return {type: "Feature", properties: {k: v.k, m: v.m, s: si ? 1 : 0, o: punta * (si === false ? 0.15 : 1)}, geometry: {type: "Point", coordinates: enTrayecto(v.t, v.u)}};
})});
}
function andar() {
cancelAnimationFrame(reloj);
if (quieto || !aLaVista || !estado.capas.vehiculos) return;
reloj = requestAnimationFrame(ahora => {
const dt = ahora - antes;
if (dt >= 32) {
if (dt < 400) for (const v of flota) v.u = (v.u + dt / 1000 / v.dura) % 1;
antes = ahora;
cuadroFlota();
}
andar();
});
}
const capasToque = ["rutas", "aereas", "nodos", "flota"];
const queHay = e => {
const f = m.queryRenderedFeatures([[e.point.x - 4, e.point.y - 4], [e.point.x + 4, e.point.y + 4]], {layers: capasToque})[0];
if (!f) return null;
const p = f.properties;
if (f.layer.id === "nodos") return p.t === "destino" ? {tipo: "pais", id: p.id} : {tipo: "salida", id: p.id};
return {tipo: "linea", id: p.k};
};
const tipHTML = sel => {
if (sel.tipo === "pais") { const v = suma(vista.fs.filter(f => f.pais_cod === sel.id)); return `<strong>${bandera(sel.id)}${esc(D.paises[sel.id])}</strong><span>${esc(corto(v))}, ${pct(100 * v / (vista.tot || 1))}</span>`; }
if (sel.tipo === "salida") return `<strong>${emojiSalida(sel.id)} ${esc(sinAvion(sel.id))}</strong><span>Tocá para ver qué sale por acá</span>`;
const r = vista.rutas.find(x => x.k === sel.id);
const lider = r && [...r.prods].sort((a, b) => b[1] - a[1])[0];
return r ? `<strong>${bandera(r.c)}${esc(D.paises[r.c])}</strong><span>${esc(camino(r))}</span><span>${esc(corto(r.v))}, ${pct(100 * r.v / (vista.tot || 1))}</span>${lider && lider[0] ? `<span>${EMOJI[lider[0]] || "📦"} ${esc(nombreSub(lider[0]))}</span>` : ""}` : "";
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
m.on("zoomend", () => { raiz.dataset.zoom = m.getZoom().toFixed(2); });
const ancho = v => v > 0 ? 0.7 + 6.3 * Math.sqrt(v / (api.max || 1)) : 0;
const delCelular = () => {
const {clientWidth: w, clientHeight: h} = m.getContainer(), zoom = Math.max(0, Math.log2(h / 512));
return {zoom, center: [-103 + 180 * w / (512 * 2 ** zoom), 2]};
};
const conNombre = () => vista.destinos.slice(0, TOP).map(([c]) => c).filter(c => D.lugares[c]);
const api = {
max: 1,
datos() {
if (!listo) return;
const rutas = vista.rutas, rango = vista.rango;
api.max = Math.max(1, ...rutas.map(r => r.v));
const visibles = rutas.filter(r => estado.capas.secundarias || (rango.get(r.c) || 99) <= TOP).sort((a, b) => a.v - b.v);
m.getSource("rutas").setData({type: "FeatureCollection", features: visibles.map(r => ({type: "Feature",
properties: {k: r.k, c: r.c, m: r.m, s: r.s, d: r.d, w: ancho(r.v), rk: rango.get(r.c) || 99}, geometry: {type: "LineString", coordinates: curva(r.k)}}))});
armarFlota(visibles);
const nodos = new Map();
const sumar = (id, t, punto, v) => { if (!punto) return; const n = nodos.get(t + id) || {id, t, punto, v: 0}; n.v += v; nodos.set(t + id, n); };
for (const r of visibles) {
if (estado.capas.salidas) {
sumar(r.s, "salida", D.salidas[r.s], r.v);
if (r.m === "tierra") sumar(r.d, "salida", D.pasos[r.d], r.v);
}
sumar(r.c, "destino", D.lugares[r.c], r.v);
}
const conBandera = new Set(estado.capas.etiquetas ? conNombre() : []);
const nmax = Math.max(1, ...[...nodos.values()].map(n => n.v));
m.getSource("nodos").setData({type: "FeatureCollection", features: [...nodos.values()].map(n => ({type: "Feature",
properties: {id: n.id, t: n.t, b: n.t === "destino" && conBandera.has(n.id), r: n.t === "destino" && conBandera.has(n.id) ? 10.5 : (n.t === "destino" ? 2 : 3) + 3 * Math.sqrt(n.v / nmax)}, geometry: {type: "Point", coordinates: n.punto}}))});
api.etiquetas();
focoAhora = undefined;
api.foco(estado.sel, true);
},
etiquetas() {
const z = m.getZoom(), quiero = new Map();
if (estado.capas.etiquetas) conNombre().forEach((c, i) => quiero.set(c, i < 5 || z >= 1.9));
if (estado.capas.salidas && z >= 3.4) for (const s of Object.keys({...D.salidas, ...D.pasos})) quiero.set("⚓" + s, true);
for (const [c, e] of etiquetas) if (!quiero.has(c)) { e.mk.remove(); etiquetas.delete(c); }
for (const [c, con] of quiero) {
if (!etiquetas.has(c)) {
const el = document.createElement("span"), s = c[0] === "⚓" ? c.slice(1) : "";
const izq = !s && ["CL", "PE", "EC", "MX"].includes(c);
el.className = s ? "rt-etiq-salida" : izq ? "rt-etiq rt-izq" : "rt-etiq"; el.setAttribute("aria-hidden", "true");
el.innerHTML = s ? esc(sinAvion(s)) : `${bandera(c)}<span>${esc(D.paises[c])}</span>`;
etiquetas.set(c, {el, mk: new maplibregl.Marker({element: el, anchor: izq ? "right" : "left", offset: [s ? 9 : izq ? 10 : -10, 0], opacityWhenCovered: "0"}).setLngLat(s ? D.salidas[s] || D.pasos[s] : D.lugares[c]).addTo(m)});
}
etiquetas.get(c).el.classList.toggle("rt-sola", !con);
}
for (const mk of nombres) mk.getElement().hidden = z > 3;
},
paises(sel) {
const max = vista.destinos.length ? vista.destinos[0][1] : 1, con = new Map(vista.destinos.filter(([c]) => D.iso[c]).map(([c, v]) => [c, compra((v / max) ** 0.75)]));
if (sel && sel.tipo === "pais" && D.iso[sel.id]) con.set(sel.id, css("--celeste"));
m.setPaintProperty("tierra", "fill-color", ["match", ["get", "c"], "AR", arg, ...[...con].flat(), suelo]);
},
mover(si) {
quieto = !si;
const b = raiz.querySelector('[data-z="mover"]'), t = quieto ? "Poner en movimiento" : "Pausar el movimiento";
b.classList.toggle("rt-quieto", quieto);
b.setAttribute("aria-label", t); b.title = t;
andar();
},
vehiculos() { if (listo) { cuadroFlota(); andar(); } },
get quieto() { return quieto; },
foco(sel, soloPintura) {
if (!listo) return;
const igual = focoAhora !== undefined && JSON.stringify(focoAhora) === JSON.stringify(sel);
focoAhora = sel || null;
if (igual) { if (!soloPintura && sel) api.encuadrar(sel); return; }
cuadroFlota();
api.paises(sel);
const suyo = !sel ? "" : sel.tipo === "pais" ? sel.id : sel.tipo === "linea" ? (vista.rutas.find(r => r.k === sel.id) || {}).c : sel.tipo === "corredor" ? sel.id.split("|")[1] : "";
for (const [c, e] of etiquetas) if (c[0] !== "⚓") e.el.classList.toggle("rt-lejos", !!sel && sel.tipo !== "salida" && c !== suyo);
let cond = null;
if (sel) cond = sel.tipo === "pais" ? ["==", ["get", "c"], sel.id] : sel.tipo === "linea" ? ["==", ["get", "k"], sel.id]
: sel.tipo === "salida" ? ["any", ["==", ["get", "s"], sel.id], ["==", ["get", "d"], sel.id]]
: ["all", ["==", ["get", "s"], sel.id.split("|")[0]], ["==", ["get", "c"], sel.id.split("|")[1]], ["==", ["get", "m"], sel.id.split("|")[2]]];
const op = cond ? ["case", cond, 1, 0.06] : ["case", ["<=", ["get", "rk"], TOP], 0.82, 0.38];
m.setPaintProperty("rutas", "line-opacity", op);
m.setPaintProperty("aereas", "line-opacity", op);
m.setPaintProperty("halo", "line-opacity", cond ? ["case", cond, 0.95, 0] : ["case", ["<=", ["get", "rk"], TOP], 0.6, 0]);
const nodoCond = !sel ? null : sel.tipo === "pais" ? ["==", ["get", "id"], sel.id] : sel.tipo === "salida" ? ["==", ["get", "id"], sel.id] : null;
m.setPaintProperty("nodos", "circle-opacity", sel ? (nodoCond ? ["case", nodoCond, 1, 0.35] : 0.35) : 1);
m.setPaintProperty("nodos", "circle-stroke-opacity", sel ? (nodoCond ? ["case", nodoCond, 1, 0.35] : 0.35) : 1);
if (!soloPintura && sel) api.encuadrar(sel);
},
encuadrar(sel) {
const pts = [];
if (sel.tipo === "pais") { const l = D.lugares[sel.id]; if (l) pts.push(D.salidas["Gran Rosario"] || [-60.6, -33], l); }
else if (sel.tipo === "salida") { const p = D.salidas[sel.id] || D.pasos[sel.id]; if (p) { m.easeTo({center: p, zoom: Math.max(m.getZoom(), 3), duration: REDUCIR_MOV ? 0 : 280}); return; } }
else vista.rutas.filter(r => sel.tipo === "linea" ? r.k === sel.id : `${r.s}|${r.c}|${r.m}` === sel.id).forEach(r => pts.push(...curva(r.k)));
if (pts.length < 2) return;
const lon = pts.map(p => p[0]), lat = pts.map(p => p[1]);
m.fitBounds([[Math.min(...lon), Math.min(...lat)], [Math.max(...lon), Math.max(...lat)]], {padding: m.getContainer().clientWidth > 640 ? {top: 40, bottom: 60, left: 340, right: 60} : 30, maxZoom: 4.5, duration: REDUCIR_MOV ? 0 : 280});
},
centrar() {
const duration = REDUCIR_MOV ? 0 : 280;
if (CELULAR.matches) m.easeTo({...delCelular(), duration}); else m.fitBounds(MUNDO, {padding: AIRE, duration});
},
zoom(d) { (d > 0 ? m.zoomIn : m.zoomOut).call(m, {duration: REDUCIR_MOV ? 0 : 200}); },
globo(si) {
$("rt-mapa-caja").classList.toggle("rt-globo", si);
m.setProjection({type: si ? "globe" : "mercator"});
if (si) m.jumpTo({center: [-32, -18], zoom: Math.log2(Math.min(m.getContainer().clientHeight, m.getContainer().clientWidth) * 1.08 * Math.PI / 512) + Math.log2(Math.cos(18 * Math.PI / 180))}); else api.centrar();
},
mapa: m
};
return api;
}
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
raiz.querySelector(".rt-capas").addEventListener("change", e => { const c = e.target.dataset.capa; if (!c) return; estado.capas[c] = e.target.checked; if (!mapa) return; if (c === "vehiculos") mapa.vehiculos(); else mapa.datos(); });
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
else if (z === "mover") mapa.mover(mapa.quieto);
else { const si = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", String(si)); mapa.globo(si); }
});
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
function sinMapa() { $("rt-lienzo").hidden = true; raiz.querySelector(".rt-ctrl").hidden = true; raiz.querySelector(".rt-vias").hidden = true; $("rt-sin-mapa").hidden = false; }
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
