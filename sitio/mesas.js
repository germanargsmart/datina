(() => {
"use strict";
const raiz = document.getElementById("ms");
if (!raiz) return;
const $ = id => document.getElementById(id);
const BASE = "datos/mesas/";
const VERSION_TABLAS = "5";
const CARGOS = {presidente: "Presidente", diputados: "Diputados nacionales", senadores: "Senadores nacionales"};
const NIVEL_NOMBRE = {presidente: "presidente", diputados: "diputados nacionales", senadores: "senadores nacionales"};
const n0 = v => Number(v).toLocaleString("es-AR");
const pct = v => (Math.round(v * 10 + 1e-9) / 10).toLocaleString("es-AR", {minimumFractionDigits: 1, maximumFractionDigits: 1}) + "%";
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const natural = (a, b) => String(a).localeCompare(String(b), "es", {numeric: true, sensitivity: "base"});
const ent = t => { const v = t === "" || t == null ? null : +t; return Number.isFinite(v) ? v : null; };
const FALLO_HISTORIA = Symbol("la historia no llegó");
let IDX = null, turno = 0;
const estado = {e: "", p: "", s: "", c: "", m: ""};
const pedidas = new Map();
function filasCSV(t) {
const filas = [];
let fila = [], celda = "", comillas = false;
for (let i = 0; i < t.length; i++) {
const c = t[i];
if (comillas) {
if (c === '"') { if (t[i + 1] === '"') { celda += '"'; i++; } else comillas = false; }
else celda += c;
} else if (c === '"') comillas = true;
else if (c === ",") { fila.push(celda); celda = ""; }
else if (c === "\n") { fila.push(celda); filas.push(fila); fila = []; celda = ""; }
else if (c !== "\r") celda += c;
}
if (celda !== "" || fila.length) { fila.push(celda); filas.push(fila); }
return filas;
}
const bajar = ruta => {
if (pedidas.has(ruta)) return pedidas.get(ruta);
const p = fetch(`${BASE}${ruta}?v=${VERSION_TABLAS}`).then(r => { if (!r.ok) throw new Error(`${ruta}: ${r.status}`); return r.text(); }).then(t => {
if (!t.endsWith("\n")) throw new Error(`${ruta}: la tabla llegó cortada`);
const f = filasCSV(t);
if (f.length < 2 || f.some(x => x.length !== f[0].length)) throw new Error(`${ruta}: la tabla no tiene la forma esperada`);
return f;
});
pedidas.set(ruta, p);
p.catch(() => pedidas.delete(ruta));
return p;
};
const col = (cab, n) => cab.indexOf(n);
async function tablaPais(id) {
const f = await bajar(`${id}/pais.csv`), c = f[0];
const i = {cod: col(c, "codigo_indec"), lista: col(c, "lista"), votos: col(c, "votos"), mesas: col(c, "mesas"), el: col(c, "electores"),
vot: col(c, "votantes"), bl: col(c, "blancos"), nu: col(c, "nulos"), re: col(c, "recurridos_impugnados")};
if (i.cod < 0 || i.lista < 0 || i.votos < 0) throw new Error(`${id}/pais.csv: faltan columnas`);
const pv = {};
for (const r of f.slice(1)) {
const p = pv[r[i.cod]] ||= {cod: r[i.cod], listas: [], mesas: ent(r[i.mesas]), electores: ent(r[i.el]), votantes: ent(r[i.vot]),
blancos: ent(r[i.bl]), nulos: ent(r[i.nu]), recurridos: ent(r[i.re])};
p.listas.push([r[i.lista], +r[i.votos]]);
}
return pv;
}
const FIJAS = 8;
async function tablaProvincia(id, cod) {
const f = await bajar(`${id}/${cod}.csv`), c = f[0];
if (c[0] !== "seccion_id" || c[3] !== "mesa" || c[7] !== "recurridos_impugnados") throw new Error(`${id}/${cod}.csv: faltan columnas`);
const listas = c.slice(FIJAS);
const filas = f.slice(1).map(r => ({s: r[0], sn: r[1], c: r[2], m: r[3], e: +r[4], b: +r[5], n: +r[6], r: +r[7], v: r.slice(FIJAS).map(Number)}));
return {listas, filas};
}
async function tablaHistoria(cod) {
const f = await bajar(`circuitos/${cod}.csv`), c = f[0];
const i = Object.fromEntries(c.map((n, k) => [n, k]));
if (!("eleccion" in i) || !("votos_primera" in i)) throw new Error(`circuitos/${cod}.csv: faltan columnas`);
const m = new Map();
for (const r of f.slice(1)) {
const k = `${r[i.seccion_id]}|${r[i.circuito]}`;
if (!m.has(k)) m.set(k, new Map());
m.get(k).set(r[i.eleccion], {mesas: +r[i.mesas], electores: +r[i.electores], votantes: +r[i.votantes], positivos: +r[i.positivos],
primera: r[i.primera], vp: +r[i.votos_primera], segunda: r[i.segunda], vs: +r[i.votos_segunda]});
}
return m;
}
function sumar(filas, n) {
const t = {mesas: filas.length, sinVotos: 0, electores: 0, votantes: 0, positivos: 0, blancos: 0, nulos: 0, recurridos: 0, v: new Array(n).fill(0)};
for (const f of filas) {
let pos = 0;
for (let i = 0; i < n; i++) { t.v[i] += f.v[i]; pos += f.v[i]; }
const vot = pos + f.b + f.n + f.r;
if (vot > 0) t.electores += f.e; else t.sinVotos++;
t.votantes += vot; t.positivos += pos; t.blancos += f.b; t.nulos += f.n; t.recurridos += f.r;
}
return t;
}
const dos = (nombres, votos) => votos.map((v, i) => [nombres[i], v]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]);
const participacion = t => t.electores > 0 && t.votantes != null ? t.votantes / t.electores * 100 : null;
const elec = () => IDX.elecciones.find(e => e.id === estado.e);
const provNombre = cod => IDX.provincias[cod];
const opciones = (sel, lista, valor) => {
sel.innerHTML = lista.map(([v, t]) => `<option value="${esc(v)}">${esc(t)}</option>`).join("");
sel.value = valor;
};
const etiquetaEl = e => e.etiqueta + (e.nivel === "provincia" ? ", solo por provincia" : "");
function pintarControles(el, D) {
opciones($("ms-cargo"), Object.entries(CARGOS), el.cargo);
const mismas = IDX.elecciones.filter(e => e.cargo === el.cargo).sort((a, b) => b.anio - a.anio || (a.vuelta === "segunda" ? -1 : 1));
opciones($("ms-eleccion"), mismas.map(e => [e.id, etiquetaEl(e)]), el.id);
const orden = el.provincias.slice().sort((a, b) => provNombre(a).localeCompare(provNombre(b), "es"));
opciones($("ms-prov"), [["", "Todo el país"], ...orden.map(c => [c, provNombre(c)])], estado.p);
const secc = $("ms-sec"), circ = $("ms-cir"), mesa = $("ms-mesa"), num = $("ms-num");
const apagar = (sel, texto) => { opciones(sel, [["", texto]], ""); sel.disabled = true; };
num.disabled = !D;
$("ms-num-ir").disabled = !D;
num.placeholder = D ? "Por ejemplo, 1234" : el.nivel === "mesa" ? "Elegí una provincia" : "Sin datos en esta elección";
if (!D) {
const t = el.nivel === "mesa" ? "Elegí una provincia" : "Sin datos";
apagar(secc, t); apagar(circ, t); apagar(mesa, t);
return;
}
const nombres = new Map();
for (const f of D.filas) if (!nombres.has(f.s)) nombres.set(f.s, f.sn);
secc.disabled = false;
opciones(secc, [["", "Toda la provincia"], ...[...nombres].sort((a, b) => a[1].localeCompare(b[1], "es", {numeric: true}))], estado.s);
if (!estado.s) { apagar(circ, "Elegí una sección"); apagar(mesa, "Elegí una sección"); return; }
const deSec = D.filas.filter(f => f.s === estado.s);
circ.disabled = false;
opciones(circ, [["", "Toda la sección"], ...[...new Set(deSec.map(f => f.c))].sort(natural).map(c => [c, `Circuito ${c}`])], estado.c);
if (!estado.c) { apagar(mesa, "Elegí un circuito"); return; }
mesa.disabled = false;
opciones(mesa, [["", "Todo el circuito"], ...deSec.filter(f => f.c === estado.c).map(f => f.m).sort(natural).map(m => [m, `Mesa ${m}`])], estado.m);
}
function cifras(t, conMesas) {
const p = participacion(t), items = [];
if (conMesas && t.mesas != null) items.push(["Mesas", n0(t.mesas)]);
if (t.electores) items.push(["Electores", n0(t.electores)]);
if (t.votantes != null) items.push(["Votaron", n0(t.votantes)]);
if (p != null) items.push(["Participación", pct(p)]);
return items.length ? `<dl class="ms-cifras">${items.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join("")}</dl>` : "";
}
function tablaListas(listas, positivos) {
if (!listas.length) return "";
const filas = listas.map(([n, v]) => {
const p = v / positivos * 100;
return `<tr><td class="ms-lista"><span>${esc(n)}</span><span class="ms-barra" style="--v:${p.toFixed(2)}%" aria-hidden="true"></span></td>` +
`<td class="n">${n0(v)}</td><td class="n">${pct(p)}</td></tr>`;
}).join("");
return `<div class="tabla-desliza ms-tabla-listas" tabindex="0" role="region" aria-label="Votos por lista"><table class="tabla-areas">` +
`<caption class="solo-lector">Votos de cada lista y su porcentaje de los votos positivos</caption>` +
`<thead><tr><th scope="col">Lista</th><th scope="col" class="n">Votos</th><th scope="col" class="n">%<span class="ms-ancho"> de positivos</span></th></tr></thead><tbody>${filas}</tbody></table></div>`;
}
function otrosVotos(t) {
if (t.votantes == null || !t.votantes) return "";
const partes = [];
if (t.blancos != null) partes.push(`${n0(t.blancos)} en blanco (${pct(t.blancos / t.votantes * 100)})`);
if (t.nulos != null) partes.push(`${n0(t.nulos)} nulos (${pct(t.nulos / t.votantes * 100)})`);
if (t.recurridos) partes.push(`${n0(t.recurridos)} recurridos, impugnados o de comando (${pct(t.recurridos / t.votantes * 100)})`);
return partes.length ? `<p class="ms-otros">De quienes votaron: ${partes.join(", ")}.</p>` : "";
}
const celdaLista = (nombre, votos, base) => nombre ? `<span class="ms-c-nom">${esc(nombre)}</span> <span class="ms-c-pct">${pct(votos / base * 100)}</span>` : "";
function tablaPartes(titulo, nombreCol, filas, verMesas) {
if (!filas.length) return "";
const cuerpo = filas.map(f => {
const orden = dos(f.nombres, f.votos);
const [a, b] = [orden[0], orden[1]];
const base = orden.reduce((s, x) => s + x[1], 0);
const p = f.part;
return `<tr><th scope="row"><button type="button" class="enlace ms-ir" data-${f.clave}="${esc(f.valor)}">${esc(f.nombre)}</button></th>` +
(verMesas ? `<td class="n ms-ancho">${f.mesas == null ? "" : n0(f.mesas)}</td>` : `<td class="n ms-ancho">${n0(f.electores)}</td>`) +
`<td class="n">${p == null ? "sin dato" : pct(p)}</td>` +
`<td>${a ? celdaLista(a[0], a[1], base) : "sin resultado"}</td><td>${b ? celdaLista(b[0], b[1], base) : ""}</td></tr>`;
}).join("");
return `<section class="ms-bloque" aria-labelledby="ms-partes-tit"><h2 class="ms-sub-tit" id="ms-partes-tit">${esc(titulo)}</h2>` +
`<div class="tabla-desliza ms-tabla-partes" tabindex="0" role="region" aria-labelledby="ms-partes-tit"><table class="tabla-areas">` +
`<thead><tr><th scope="col">${esc(nombreCol)}</th><th scope="col" class="n ms-ancho">${verMesas ? "Mesas" : "Electores"}</th><th scope="col" class="n">Participación</th>` +
`<th scope="col">Lista más votada</th><th scope="col">Segunda</th></tr></thead><tbody>${cuerpo}</tbody></table></div></section>`;
}
function tablaHistorial(el, mapa, nivelTexto) {
if (!mapa) return "";
const lista = IDX.elecciones.filter(e => e.nivel === "mesa" && e.cargo === el.cargo && e.provincias.includes(estado.p))
.sort((a, b) => b.anio - a.anio || (a.vuelta === "segunda" ? -1 : 1));
if (lista.length < 2) return "";
const filas = lista.map(e => {
const h = mapa.get(e.id), yo = e.id === el.id ? ' class="elegida"' : "";
const boton = `<button type="button" class="enlace ms-ir-el" data-e="${e.id}">${esc(e.etiqueta)}</button>`;
if (!h) return `<tr${yo}><th scope="row">${boton}</th><td colspan="3" class="ms-sin">No figura con este código en esa elección</td></tr>`;
return `<tr${yo}><th scope="row">${boton}</th><td class="n">${h.electores > 0 ? pct(h.votantes / h.electores * 100) : "sin dato"}</td>` +
`<td>${h.primera ? celdaLista(h.primera, h.vp, h.positivos) : "sin resultado"}</td><td>${h.segunda ? celdaLista(h.segunda, h.vs, h.positivos) : ""}</td></tr>`;
}).join("");
return `<section class="ms-bloque" aria-labelledby="ms-hist-tit"><h2 class="ms-sub-tit" id="ms-hist-tit">¿Cómo votó ${nivelTexto} en cada elección?</h2>` +
`<p class="ms-sub">${esc(CARGOS[el.cargo])}. La lista más votada y la segunda de cada elección, con su porcentaje de los votos positivos. Las listas cambian de nombre y de alianzas entre una elección y otra.</p>` +
`<div class="tabla-desliza ms-tabla-partes" tabindex="0" role="region" aria-labelledby="ms-hist-tit"><table class="tabla-areas">` +
`<thead><tr><th scope="col">Elección</th><th scope="col" class="n">Participación</th><th scope="col">Lista más votada</th><th scope="col">Segunda</th></tr></thead>` +
`<tbody>${filas}</tbody></table></div></section>`;
}
function lugar(el, D) {
const partes = [];
if (estado.m) partes.push(`Mesa ${estado.m}`);
if (estado.c) partes.push(`Circuito ${estado.c}`);
if (estado.s && D) partes.push(D.filas.find(f => f.s === estado.s).sn);
if (estado.p) partes.push(provNombre(estado.p));
return partes.length ? partes.join(", ") : "Todo el país";
}
const COBERTURA_AVISO = 97;
function avisoCobertura(el) {
const c = estado.p ? el.cobertura?.[estado.p] : el.cobertura_pais;
if (c == null || c >= COBERTURA_AVISO) return "";
return `${estado.p ? `En ${provNombre(estado.p)}, este` : "En todo el país, este"} conteo reúne ${pct(c)} de los votos positivos del escrutinio definitivo: faltan mesas que no se cargaron la noche de la elección.`;
}
function pintar(el, P, D, H, aviso) {
const sub = `${CARGOS[el.cargo]}, ${el.etiqueta}. Escrutinio ${el.recuento}.`;
const cob = avisoCobertura(el);
let resumen = "", listas = [], t = null, partes = "", frase = "", historia = "";
const notas = [];
const pv = el.provincias.map(c => P[c]).filter(Boolean);
if (!estado.p) {
t = {mesas: pv.every(x => x.mesas != null) ? pv.reduce((s, x) => s + x.mesas, 0) : null,
electores: pv.every(x => x.electores != null) ? pv.reduce((s, x) => s + x.electores, 0) : 0,
votantes: pv.every(x => x.votantes != null) ? pv.reduce((s, x) => s + x.votantes, 0) : null,
blancos: pv.every(x => x.blancos != null) ? pv.reduce((s, x) => s + x.blancos, 0) : null,
nulos: pv.every(x => x.nulos != null) ? pv.reduce((s, x) => s + x.nulos, 0) : null,
recurridos: pv.reduce((s, x) => s + (x.recurridos || 0), 0)};
if (el.cargo === "presidente") {
const suma = new Map();
for (const x of pv) for (const [n, v] of x.listas) suma.set(n, (suma.get(n) || 0) + v);
listas = [...suma].sort((a, b) => b[1] - a[1]);
} else {
frase = `Cada jurisdicción vota sus propias listas de ${NIVEL_NOMBRE[el.cargo]}, así que no hay un total de listas para el país. Elegí una provincia para ver las suyas.`;
}
const filas = pv.slice().sort((a, b) => provNombre(a.cod).localeCompare(provNombre(b.cod), "es")).map(x => ({
clave: "p", valor: x.cod, nombre: provNombre(x.cod), mesas: x.mesas, electores: x.electores, part: x.electores && x.votantes != null ? x.votantes / x.electores * 100 : null,
nombres: x.listas.map(l => l[0]), votos: x.listas.map(l => l[1])}));
partes = tablaPartes("¿Cómo votó cada jurisdicción?", "Jurisdicción", filas, el.nivel === "mesa");
} else if (!D) {
const x = P[estado.p];
t = {mesas: null, electores: x.electores || 0, votantes: x.votantes, blancos: x.blancos, nulos: x.nulos, recurridos: x.recurridos || 0};
listas = x.listas.slice().sort((a, b) => b[1] - a[1]);
} else {
const filas = D.filas.filter(f => (!estado.s || f.s === estado.s) && (!estado.c || f.c === estado.c) && (!estado.m || f.m === estado.m));
t = sumar(filas, D.listas.length);
listas = dos(D.listas, t.v);
if (!estado.s || !estado.c) {
const grupo = new Map();
for (const f of filas) {
const k = estado.s ? f.c : f.s;
if (!grupo.has(k)) grupo.set(k, []);
grupo.get(k).push(f);
}
const hijos = [...grupo].map(([k, g]) => {
const s = sumar(g, D.listas.length);
return {clave: estado.s ? "c" : "s", valor: k, nombre: estado.s ? `Circuito ${k}` : g[0].sn, mesas: s.mesas, electores: s.electores, part: participacion(s), nombres: D.listas, votos: s.v};
}).sort((a, b) => natural(a.nombre, b.nombre));
partes = tablaPartes(estado.s ? "¿Cómo votó cada circuito?" : "¿Cómo votó cada sección?", estado.s ? "Circuito" : "Sección", hijos, true);
} else if (!estado.m) {
const hijos = filas.slice().sort((a, b) => natural(a.m, b.m)).map(f => {
const s = sumar([f], D.listas.length);
return {clave: "m", valor: f.m, nombre: `Mesa ${f.m}`, mesas: 1, electores: f.e, part: participacion(s), nombres: D.listas, votos: f.v};
});
partes = tablaPartes("¿Cómo votó cada mesa?", "Mesa", hijos, false);
}
if (estado.m && t.votantes > t.electores && t.electores > 0)
notas.push("Esta mesa registra más votos que electores. Puede ser un error de carga del telegrama, que el escrutinio definitivo corrige.");
if (estado.m && !t.votantes) notas.push("Esta mesa figura sin resultado en el escrutinio provisorio.");
if (!estado.m && t.sinVotos) notas.push(`${n0(t.sinVotos)} de ${n0(t.mesas)} mesas figuran sin resultado en el escrutinio provisorio: la participación no las cuenta.`);
if (estado.s && H === FALLO_HISTORIA) {
historia = `<section class="ms-bloque ms-falla" role="alert"><p>No se pudo bajar la historia de ${estado.c ? "este circuito" : "esta sección"}. Los resultados de esta elección están completos. Al elegir otro lugar se vuelve a intentar.</p></section>`;
} else if (estado.s && H) {
const mapa = H.get(`${estado.s}|${estado.c}`);
historia = tablaHistorial(el, mapa, estado.c ? "este circuito" : "esta sección");
}
}
const positivos = listas.reduce((s, x) => s + x[1], 0);
if (!frase && listas.length >= 2) {
const dondeTxt = !estado.p ? "en el país" : estado.m ? "en esta mesa" : estado.c ? "en este circuito" : estado.s ? "en esta sección" : "en esta jurisdicción";
frase = `La lista más votada ${dondeTxt} fue ${listas[0][0]}, con ${pct(listas[0][1] / positivos * 100)} de los votos positivos, y la segunda, ${listas[1][0]}, con ${pct(listas[1][1] / positivos * 100)}.`;
}
if (el.nivel === "provincia") notas.push("Para esta elección no hay datos que se puedan publicar por debajo de la jurisdicción.");
frase = [frase, ...notas].filter(Boolean).join(" ");
resumen = `<section class="ms-bloque ms-resultado" aria-labelledby="ms-titulo"><h2 class="ms-tit" id="ms-titulo" tabindex="-1">${esc(lugar(el, D))}</h2>` +
`<p class="ms-sub">${esc(sub)}</p>` + (aviso ? `<p class="aviso-serie ms-aviso">${esc(aviso)}</p>` : "") + (cob ? `<p class="aviso-serie ms-aviso">${esc(cob)}</p>` : "") + cifras(t, !estado.m) +
(frase ? `<p class="ms-frase">${esc(frase)}</p>` : "") + tablaListas(listas, positivos) + otrosVotos(t) + `</section>`;
$("ms-resultado").innerHTML = resumen + partes + historia;
const bajarCSV = !estado.p || !D ? `${BASE}${el.id}/pais.csv` : `${BASE}${el.id}/${estado.p}.csv`;
const a = $("ms-bajar");
a.href = bajarCSV;
a.textContent = !estado.p || !D ? "Descargar tabla por jurisdicción (CSV)" : `Descargar las mesas de ${provNombre(estado.p)} (CSV)`;
const ah = $("ms-bajar-hist");
ah.hidden = !(estado.p && D);
if (estado.p) ah.href = `${BASE}circuitos/${estado.p}.csv`;
raiz.setAttribute("aria-busy", "false");
$("ms-estado").textContent = `Resultados de ${lugar(el, D)}.`;
}
function dirección() {
const q = new URLSearchParams();
if (estado.e) q.set("e", estado.e);
for (const k of ["p", "s", "c", "m"]) if (estado[k]) q.set(k, estado[k]);
if (MAPA.ver !== "gana") q.set("ver", MAPA.ver);
if (MAPA.ver === "fuerza" && MAPA.fuerza) q.set("f", MAPA.fuerza);
history.replaceState(null, "", `${location.pathname}?${q}${location.hash}`);
}
const MAPA = {ver: "gana", fuerza: "", ruta: "", doc: null, topo: null, rasgos: null, indice: null, svg: null, capa: null, caminos: null, sel: null, zoom: null, camino: null, W: 0, H: 0, enfoque: "", turno: 0};
const SIN_MESAS = "#EEF1F4";
const TONOS = [.42, .58, .74, .88, 1];
const CORTES = {gana: [40, 50, 60, 70], part: [60, 70, 80, 90], fuerza: [20, 30, 40, 50]};
const COLORES_PART = ["#EEF5FC", "#BBD6EF", "#7FB0DD", "#3F86C6", "#1F5E97"];
const REDUCIR_MOV = matchMedia("(prefers-reduced-motion: reduce)").matches;
const tramo = (cortes, v) => { const i = cortes.findIndex(x => v < x); return i < 0 ? cortes.length : i; };
const mezcla = (color, k) => {
const n = parseInt(color.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(255 + (v - 255) * k));
return `rgb(${c[0]},${c[1]},${c[2]})`;
};
const pedidosJSON = new Map();
const bajarJSON = ruta => {
if (pedidosJSON.has(ruta)) return pedidosJSON.get(ruta);
const p = fetch(BASE + ruta).then(r => { if (!r.ok) throw new Error(`${ruta}: ${r.status}`); return r.json(); });
pedidosJSON.set(ruta, p);
p.catch(() => pedidosJSON.delete(ruta));
return p;
};
const positivosDe = f => { let s = 0; for (let i = 1; i < f[4].length; i += 2) s += f[4][i]; return s; };
const votosFuerza = (doc, f, ix) => { let s = 0; for (let i = 0; i < f[4].length; i += 2) if (doc.fuerza[f[4][i]] === ix) s += f[4][i + 1]; return s; };
const circuitosMesa = f => f[5] || (Array.isArray(f[1]) ? f[1].map(c => c.includes("|") ? c : `${f[0]}|${c}`) : [`${f[0]}|${f[1]}`]);
const seccionDe = f => circuitosMesa(f)[0].split("|")[0];
const claveRasgo = r => `${r.properties.p}|${r.properties.s}|${r.properties.c}`;
function indexar(doc) {
const m = new Map();
for (const cod of Object.keys(doc.provincias)) {
for (const f of doc.provincias[cod].filas) {
f.cod = cod;
for (const c of Array.isArray(f[1]) ? f[1] : [f[1]]) m.set(`${cod}|${c.includes("|") ? c : `${f[0]}|${c}`}`, f);
}
}
return m;
}
function filasEnVista(doc) {
if (!estado.p) return Object.values(doc.provincias).flatMap(p => p.filas);
const filas = doc.provincias[estado.p]?.filas || [];
return estado.s ? filas.filter(f => seccionDe(f) === estado.s) : filas;
}
function colorDe(doc, f) {
if (!f) return SIN_MESAS;
if (MAPA.ver === "part") return f[2] > 0 ? COLORES_PART[tramo(CORTES.part, f[3] / f[2] * 100)] : SIN_MESAS;
const pos = positivosDe(f);
if (!pos) return SIN_MESAS;
if (MAPA.ver === "fuerza") {
const ix = doc.fuerzas.findIndex(x => x.id === MAPA.fuerza);
if (ix < 0) return SIN_MESAS;
return mezcla(doc.fuerzas[ix].c, TONOS[tramo(CORTES.fuerza, votosFuerza(doc, f, ix) / pos * 100)]);
}
return mezcla(doc.fuerzas[doc.fuerza[f[4][0]]].c, TONOS[tramo(CORTES.gana, f[4][1] / pos * 100)]);
}
function textoTip(doc, r) {
const f = MAPA.indice.get(claveRasgo(r)), {p, s, c} = r.properties, pv = doc.provincias[p];
const prov = provNombre(p);
if (!f) return `<b>${c === "0" ? "Zona sin circuito" : `Circuito ${esc(c)}`}</b>${pv?.secciones?.[s] ? `, ${esc(pv.secciones[s])}` : ""}, ${esc(prov)}<br>Sin mesas en esta elección`;
const cs = circuitosMesa(f), sn = pv.secciones[seccionDe(f)] || "";
let lugar;
if (pv.nivel === "seccion") lugar = `${esc(sn)}, ${esc(prov)}`;
else if (cs.length === 1) lugar = `Circuito ${esc(cs[0].split("|")[1])}, ${esc(sn)}, ${esc(prov)}`;
else lugar = `Circuitos ${esc(cs.slice(0, 4).map(x => x.split("|")[1]).join(", "))}${cs.length > 4 ? " y otros" : ""}, ${esc(sn)}`;
const pos = positivosDe(f), filas = [];
for (let i = 0; i < Math.min(6, f[4].length); i += 2) filas.push(`${esc(doc.listas[f[4][i]])}: ${pct(f[4][i + 1] / pos * 100)}`);
if (!pos) filas.push("Sin votos en esta elección");
if (MAPA.ver === "fuerza") {
const ix = doc.fuerzas.findIndex(x => x.id === MAPA.fuerza);
if (ix >= 0 && pos) filas.unshift(`<b>${esc(doc.fuerzas[ix].n)}: ${pct(votosFuerza(doc, f, ix) / pos * 100)}</b>`);
}
if (f[2] > 0) filas.push(`Participación: ${pct(f[3] / f[2] * 100)}`);
return `<b>${lugar}</b><br>${filas.join("<br>")}`;
}
function armarLienzo(doc, topo, ruta) {
const lienzo = $("ms-lienzo");
lienzo.querySelector("svg")?.remove();
const obj = topo.objects[Object.keys(topo.objects)[0]];
const rasgos = topojson.feature(topo, obj).features;
const [x0, y0, x1, y1] = topojson.bbox(topo);
const RAD = Math.PI / 180, my = lat => Math.log(Math.tan(Math.PI / 4 + lat * RAD / 2));
const dx = (x1 - x0) * RAD, dy = my(y1) - my(y0), W = 720, H = Math.round(Math.min(1160, Math.max(420, W * dy / dx)));
const k = Math.min((W - 12) / dx, (H - 12) / dy), ox = (W - dx * k) / 2, oy = (H - dy * k) / 2;
const camino = d3.geoPath(d3.geoTransform({point(lon, lat) { this.stream.point(ox + (lon - x0) * RAD * k, oy + (my(y1) - my(lat)) * k); }}));
const svg = d3.select(lienzo).insert("svg", ":first-child").attr("viewBox", `0 0 ${W} ${H}`).attr("role", "img").attr("preserveAspectRatio", "xMidYMid meet");
const capa = svg.append("g");
const caminos = capa.append("g").attr("class", estado.p ? "ms-cs" : "ms-cs ms-cs-pais").selectAll("path").data(rasgos).join("path").attr("class", "ms-c").attr("d", camino);
const llave = estado.p ? "s" : "p";
capa.append("path").attr("class", "ms-limite").attr("d", camino(topojson.mesh(topo, obj, (a, b) => a.properties[llave] !== b.properties[llave])));
const sel = capa.append("path").attr("class", "ms-sel");
const zoom = d3.zoom().scaleExtent([1, 90]).extent([[0, 0], [W, H]]).translateExtent([[0, 0], [W, H]])
.filter(ev => ev.type === "wheel" ? ev.ctrlKey || ev.metaKey : ev.type === "touchstart" ? ev.touches.length > 1 : !ev.button)
.on("zoom", ev => capa.attr("transform", ev.transform));
svg.call(zoom).on("dblclick.zoom", null);
const delGrupo = ev => { const d = ev.target?.__data__; return d?.properties ? d : null; };
capa.on("pointermove", ev => {
const r = delGrupo(ev);
if (r && typeof mostrarTip === "function") { const [mx, my2] = d3.pointer(ev, lienzo); mostrarTip(lienzo, textoTip(MAPA.doc, r), mx, my2); }
}).on("pointerleave", ev => { if (ev.pointerType === "mouse" && typeof ocultarTip === "function") ocultarTip(); })
.on("click", ev => { const r = delGrupo(ev); if (r) elegirRasgo(r); });
Object.assign(MAPA, {ruta, topo, rasgos, svg, capa, caminos, sel, zoom, camino, W, H, enfoque: ""});
}
function elegirRasgo(r) {
const doc = MAPA.doc;
if (!estado.p) { Object.assign(estado, {p: r.properties.p, s: "", c: "", m: ""}); actualizar(false); return; }
const f = MAPA.indice.get(claveRasgo(r));
if (!f) return;
const cs = circuitosMesa(f), [s, c] = cs[0].split("|");
if (doc.provincias[estado.p].nivel === "seccion" || cs.length > 1) Object.assign(estado, {s, c: "", m: ""});
else Object.assign(estado, {s, c, m: ""});
actualizar(false);
}
function enfocar() {
const clave = `${MAPA.ruta}|${estado.s}`;
if (clave === MAPA.enfoque) return;
MAPA.enfoque = clave;
let t = d3.zoomIdentity;
if (estado.s) {
const dentro = MAPA.rasgos.filter(r => { const f = MAPA.indice.get(claveRasgo(r)); return f ? seccionDe(f) === estado.s : r.properties.s === estado.s; });
if (dentro.length) {
const cajas = dentro.map(r => MAPA.camino.bounds(r));
const a = Math.min(...cajas.map(b => b[0][0])), b = Math.min(...cajas.map(x => x[0][1])), c = Math.max(...cajas.map(x => x[1][0])), d = Math.max(...cajas.map(x => x[1][1]));
const k = Math.max(1, Math.min(90, .92 / Math.max((c - a) / MAPA.W, (d - b) / MAPA.H)));
t = d3.zoomIdentity.translate(MAPA.W / 2, MAPA.H / 2).scale(k).translate(-(a + c) / 2, -(b + d) / 2);
}
}
if (REDUCIR_MOV) MAPA.svg.call(MAPA.zoom.transform, t);
else MAPA.svg.transition().duration(280).call(MAPA.zoom.transform, t);
}
function leyendaGana(doc, filas) {
const cuenta = new Map();
for (const f of filas) {
if (!positivosDe(f)) continue;
const li = f[4][0], ix = doc.fuerza[li], x = cuenta.get(ix) || {n: 0, listas: new Set()};
x.n++; x.listas.add(li);
cuenta.set(ix, x);
}
const orden = [...cuenta].sort((a, b) => b[1].n - a[1].n);
const nombre = ([ix, x]) => x.listas.size === 1 ? doc.listas[[...x.listas][0]] : doc.fuerzas[ix].n;
const renglon = (color, n, cant) => `<div class="ms-ley-fila"><span class="ms-ley-nom">${esc(n)}</span><span class="ms-ley-n">${n0(cant)}</span>` +
`<span class="ms-ley-tonos" aria-hidden="true">${TONOS.map(k => `<i style="background:${mezcla(color, k)}"></i>`).join("")}</span></div>`;
const visibles = orden.slice(0, 9).map(e => renglon(doc.fuerzas[e[0]].c, nombre(e), e[1].n)).join("");
const resto = orden.slice(9).reduce((s, e) => s + e[1].n, 0);
return {html: `<p class="ms-ley-tit">En cuántos lugares fue la más votada. El tono más oscuro es un porcentaje más alto de los votos positivos.</p><p class="ms-ley-esc" aria-hidden="true"><span>menos de ${CORTES.gana[0]}%</span><span>${CORTES.gana.at(-1)}% o más</span></p>` + visibles +
(resto ? `<p class="ms-ley-resto">Otras ${n0(orden.length - 9)} fuerzas ganan en ${n0(resto)} lugares.</p>` : ""), orden, nombre};
}
function leyendaTramos(titulo, cortes, colores, cuentas) {
const nombres = cortes.map((c, i) => i === 0 ? `Menos de ${c}%` : `${cortes[i - 1]} a ${c}%`).concat(`${cortes.at(-1)}% o más`);
return `<p class="ms-ley-tit">${esc(titulo)}</p>` + nombres.map((n, i) =>
`<div class="ms-ley-tramo"><i style="background:${colores[i]}" aria-hidden="true"></i><span class="ms-ley-nom">${n}</span><span class="ms-ley-n">${n0(cuentas[i])}</span></div>`).join("");
}
function pintarVista(el) {
const doc = MAPA.doc, filas = filasEnVista(doc), ver = MAPA.ver;
MAPA.caminos.attr("fill", r => colorDe(doc, MAPA.indice.get(claveRasgo(r))));
const pv = estado.p ? doc.provincias[estado.p] : null;
const clase = pv?.nivel === "seccion" ? "secciones" : "circuitos";
const lugarMapa = [estado.c ? `Circuito ${estado.c}` : "", estado.s ? pv.secciones[estado.s] || "" : "", estado.p ? provNombre(estado.p) : "Todo el país"].filter(Boolean).join(", ");
const donde = estado.s ? (pv.secciones[estado.s] || "esta sección") : estado.p ? provNombre(estado.p) : "todo el país";
let frase = "", leyenda = "";
const conVotos = filas.filter(f => positivosDe(f));
if (ver === "gana") {
const l = leyendaGana(doc, filas);
leyenda = l.html;
if (l.orden.length) {
const primero = l.orden[0];
frase = `En ${donde}, ${l.nombre(primero)} fue la más votada en ${n0(primero[1].n)} de ${n0(conVotos.length)} ${clase}` +
(l.orden[1] ? `, y ${l.nombre(l.orden[1])} en ${n0(l.orden[1][1].n)}.` : ".");
}
} else if (ver === "part") {
const cuentas = [0, 0, 0, 0, 0];
const vals = [];
for (const f of filas) if (f[2] > 0) { const v = f[3] / f[2] * 100; cuentas[tramo(CORTES.part, v)]++; vals.push(v); }
leyenda = leyendaTramos("Participación: votantes por cada 100 electores de las mesas con resultado", CORTES.part, COLORES_PART, cuentas);
if (vals.length) {
vals.sort((a, b) => a - b);
frase = `En ${donde}, la mitad de los ${clase} tuvo una participación de ${pct(vals[Math.floor(vals.length / 2)])} o más. La más baja fue de ${pct(vals[0])} y la más alta, de ${pct(vals.at(-1))}.`;
}
} else {
const ix = doc.fuerzas.findIndex(x => x.id === MAPA.fuerza);
if (ix >= 0) {
const cuentas = [0, 0, 0, 0, 0];
let suma = 0, pos = 0;
for (const f of conVotos) { const p = positivosDe(f), v = votosFuerza(doc, f, ix); cuentas[tramo(CORTES.fuerza, v / p * 100)]++; suma += v; pos += p; }
leyenda = leyendaTramos(`${doc.fuerzas[ix].n}: porcentaje de los votos positivos`, CORTES.fuerza, TONOS.map(k => mezcla(doc.fuerzas[ix].c, k)), cuentas);
if (pos) frase = `En ${donde}, ${doc.fuerzas[ix].n} reunió ${pct(suma / pos * 100)} de los votos positivos.`;
}
}
$("ms-ley").innerHTML = leyenda + `<div class="ms-ley-tramo ms-ley-sin"><i style="background:${SIN_MESAS}" aria-hidden="true"></i><span class="ms-ley-nom">Sin mesas en esta elección</span></div>`;
$("ms-mapa-frase").textContent = frase;
$("ms-mapa-tit").textContent = ver === "gana" ? (pv?.nivel === "seccion" ? "¿Quién ganó en cada sección?" : "¿Quién ganó en cada circuito?") : ver === "part" ? "¿Cuánta gente votó en cada circuito?" : "¿Dónde sacó más votos cada fuerza?";
$("ms-mapa-sub").textContent = `${CARGOS[el.cargo]}, ${el.etiqueta}. ${lugarMapa}. Tocá un lugar para ver sus resultados.`;
MAPA.svg.attr("aria-label", `Mapa de ${donde}. ${frase} Los mismos resultados están en las tablas de abajo.`);
const notas = [];
const secciones = el.provincias.filter(c => doc.provincias[c]?.nivel === "seccion" && (!estado.p || c === estado.p)).map(provNombre);
if (secciones.length) notas.push(`En ${secciones.join(", ").replace(/, ([^,]*)$/, " y $1")}, en esta elección el mapa llega hasta la sección: los códigos de entonces no coinciden con la cartografía de los circuitos.`);
const faltan = el.provincias.filter(c => (doc.provincias[c]?.con ?? 100) < 99.5 && (!estado.p || c === estado.p));
for (const c of faltan.slice(0, 2)) notas.push(`En ${provNombre(c)}, ${pct(100 - doc.provincias[c].con)} de quienes votaron no tiene su circuito en el mapa.`);
$("ms-mapa-nota").textContent = notas.join(" ");
const elegido = estado.c ? MAPA.rasgos.filter(r => { const f = MAPA.indice.get(claveRasgo(r)); return f && circuitosMesa(f).includes(`${estado.s}|${estado.c}`); }) : [];
MAPA.sel.attr("d", elegido.length ? elegido.map(r => MAPA.camino(r)).join("") : null);
const volver = $("ms-mapa-subir");
volver.hidden = !estado.p;
volver.textContent = estado.s ? `Ver toda ${provNombre(estado.p)}` : "Ver todo el país";
enfocar();
}
function pintarControlesMapa(el) {
const doc = MAPA.doc;
for (const b of raiz.querySelectorAll("#ms-mapa [data-ver]")) b.setAttribute("aria-pressed", b.dataset.ver === MAPA.ver);
raiz.querySelector("#ms-mapa .conmutador").style.setProperty("--i", ["gana", "part", "fuerza"].indexOf(MAPA.ver));
const caja = $("ms-mapa-f");
caja.hidden = MAPA.ver !== "fuerza";
if (MAPA.ver === "fuerza") {
const suma = new Map();
for (const f of filasEnVista(doc)) for (let i = 0; i < f[4].length; i += 2) { const ix = doc.fuerza[f[4][i]]; suma.set(ix, (suma.get(ix) || 0) + f[4][i + 1]); }
const orden = [...suma].sort((a, b) => b[1] - a[1]).map(x => x[0]).filter(ix => doc.fuerzas[ix].id !== "otras").slice(0, 15);
if (!orden.some(ix => doc.fuerzas[ix].id === MAPA.fuerza)) MAPA.fuerza = orden.length ? doc.fuerzas[orden[0]].id : "";
opciones($("ms-mapa-fuerza"), orden.map(ix => [doc.fuerzas[ix].id, doc.fuerzas[ix].n]), MAPA.fuerza);
}
const lista = IDX.elecciones.filter(e => e.cargo === el.cargo && e.nivel === "mesa").sort((a, b) => a.anio - b.anio || (a.vuelta === "segunda" ? 1 : -1));
const i = lista.findIndex(e => e.id === el.id);
const ant = $("ms-el-ant"), sig = $("ms-el-sig");
ant.disabled = i <= 0; sig.disabled = i < 0 || i >= lista.length - 1;
ant.dataset.e = i > 0 ? lista[i - 1].id : ""; sig.dataset.e = lista[i + 1]?.id || "";
}
async function pintarMapa(el) {
const yo = ++MAPA.turno, caja = $("ms-mapa"), aviso = $("ms-mapa-falla");
if (el.nivel !== "mesa" || !window.d3 || !window.topojson) { caja.hidden = true; return; }
caja.hidden = false;
aviso.hidden = true;
try {
const doc = await bajarJSON(`mapa/${el.id}.json`);
const ed = estado.p ? doc.provincias[estado.p]?.ed : "";
if (estado.p && !ed) throw new Error(`mapa/${el.id}.json: falta ${estado.p}`);
const ruta = estado.p ? `geo/${ed}/${estado.p}.topo.json` : `geo/pais-${doc.periodo}.topo.json`;
const topo = await bajarJSON(ruta);
if (yo !== MAPA.turno) return;
MAPA.doc = doc;
if (!doc.indice) doc.indice = indexar(doc);
MAPA.indice = doc.indice;
if (MAPA.ruta !== ruta || !MAPA.svg) armarLienzo(doc, topo, ruta);
pintarControlesMapa(el);
pintarVista(el);
if (typeof ocultarTip === "function") ocultarTip();
} catch (e) {
if (yo !== MAPA.turno) return;
console.warn("Elecciones por mesa, el mapa:", e);
$("ms-lienzo").querySelector("svg")?.remove();
MAPA.svg = null; MAPA.ruta = "";
$("ms-ley").innerHTML = "";
$("ms-mapa-frase").textContent = "";
$("ms-mapa-nota").textContent = "";
aviso.hidden = false;
}
}
function escucharMapa() {
const caja = $("ms-mapa");
caja.addEventListener("click", e => {
const b = e.target.closest("button");
if (!b) return;
if (b.dataset.ver) {
MAPA.ver = b.dataset.ver;
pintarMapa(elec()).then(dirección);
} else if (b.id === "ms-el-ant" || b.id === "ms-el-sig") {
if (b.dataset.e) { estado.e = b.dataset.e; actualizar(false); }
} else if (b.id === "ms-mapa-subir") {
if (estado.s) Object.assign(estado, {s: "", c: "", m: ""});
else Object.assign(estado, {p: "", s: "", c: "", m: ""});
actualizar(false);
} else if (b.id === "ms-mapa-reintentar") {
pintarMapa(elec());
} else if (b.dataset.z && MAPA.svg) {
const z = b.dataset.z;
if (z === "todo") { MAPA.enfoque = ""; enfocar(); }
else (REDUCIR_MOV ? MAPA.svg : MAPA.svg.transition().duration(200)).call(MAPA.zoom.scaleBy, z === "mas" ? 2 : .5);
}
});
$("ms-mapa-fuerza").addEventListener("change", e => { MAPA.fuerza = e.target.value; pintarMapa(elec()); dirección(); });
}
async function actualizar(enfocar) {
const yo = ++turno, el = elec();
let aviso = "";
raiz.setAttribute("aria-busy", "true");
$("ms-estado").textContent = "Cargando los resultados.";
$("ms-num-res").textContent = "";
try {
const P = await tablaPais(el.id);
if (estado.p && !el.provincias.includes(estado.p)) {
aviso = `${provNombre(estado.p)} no eligió ${NIVEL_NOMBRE[el.cargo]} en ${el.anio}: se muestra todo el país.`;
Object.assign(estado, {p: "", s: "", c: "", m: ""});
}
if (el.nivel !== "mesa" && estado.s) Object.assign(estado, {s: "", c: "", m: ""});
const D = estado.p && el.nivel === "mesa" ? await tablaProvincia(el.id, estado.p) : null;
if (D) {
const hay = (s, c, m) => D.filas.some(f => f.s === s && (!c || f.c === c) && (!m || f.m === m));
if (estado.m && !hay(estado.s, estado.c, estado.m)) { aviso = `La mesa ${estado.m} no existe en ese circuito en esta elección: se muestra el circuito. Los números de mesa cambian en cada elección.`; estado.m = ""; }
if (estado.c && !hay(estado.s, estado.c)) { aviso = `El circuito ${estado.c} no figura con ese código en esta elección: se muestra la sección.`; estado.c = ""; estado.m = ""; }
if (estado.s && !hay(estado.s)) { aviso = "Esa sección no figura en esta elección: se muestra la provincia."; Object.assign(estado, {s: "", c: "", m: ""}); }
}
let H = null;
if (D && estado.s) H = await tablaHistoria(estado.p).catch(e => { console.warn("Elecciones por mesa:", e); return FALLO_HISTORIA; });
if (yo !== turno) return;
pintarControles(el, D);
pintar(el, P, D, H, aviso);
pintarMapa(el);
dirección();
if (enfocar) {
const t = $("ms-titulo");
t.focus({preventScroll: true});
t.scrollIntoView({block: "start"});
}
} catch (e) {
if (yo !== turno) return;
console.warn("Elecciones por mesa:", e);
raiz.setAttribute("aria-busy", "false");
$("ms-estado").textContent = "No se pudieron cargar los resultados.";
$("ms-resultado").innerHTML = `<div class="ms-bloque ms-falla" role="alert"><p>No se pudo bajar la tabla de esta elección. Puede ser un problema de conexión.</p>` +
`<button type="button" class="boton chico" id="ms-reintentar">Volver a intentar</button></div>`;
$("ms-reintentar").addEventListener("click", () => actualizar(false));
}
}
function cambiarCargo(cargo) {
const ahora = elec();
const candidatas = IDX.elecciones.filter(e => e.cargo === cargo).sort((a, b) => b.anio - a.anio || (a.vuelta === "segunda" ? -1 : 1));
const misma = candidatas.find(e => e.anio === ahora.anio && e.vuelta === "general") || candidatas[0];
estado.e = misma.id;
actualizar(false);
}
function buscarMesa() {
const v = $("ms-num").value.trim().replace(/^0+(?=.)/, "").toUpperCase(), res = $("ms-num-res");
if (!v || !estado.p) return;
tablaProvincia(estado.e, estado.p).then(D => {
const hallada = D.filas.filter(f => f.m === v);
if (!hallada.length) { res.textContent = `No hay una mesa ${v} en ${provNombre(estado.p)} en esta elección.`; return; }
const f = hallada[0];
Object.assign(estado, {s: f.s, c: f.c, m: f.m});
actualizar(true);
}).catch(() => { res.textContent = "No se pudo bajar la tabla de esta provincia. Volvé a intentar."; });
}
function escuchar() {
$("ms-cargo").addEventListener("change", e => cambiarCargo(e.target.value));
$("ms-eleccion").addEventListener("change", e => { estado.e = e.target.value; actualizar(false); });
$("ms-prov").addEventListener("change", e => { Object.assign(estado, {p: e.target.value, s: "", c: "", m: ""}); actualizar(false); });
$("ms-sec").addEventListener("change", e => { Object.assign(estado, {s: e.target.value, c: "", m: ""}); actualizar(false); });
$("ms-cir").addEventListener("change", e => { Object.assign(estado, {c: e.target.value, m: ""}); actualizar(false); });
$("ms-mesa").addEventListener("change", e => { estado.m = e.target.value; actualizar(false); });
$("ms-num-ir").addEventListener("click", buscarMesa);
$("ms-num").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); buscarMesa(); } });
$("ms-resultado").addEventListener("click", e => {
const b = e.target.closest("button");
if (!b) return;
if (b.classList.contains("ms-ir")) {
const d = b.dataset;
if (d.p) Object.assign(estado, {p: d.p, s: "", c: "", m: ""});
else if (d.s) Object.assign(estado, {s: d.s, c: "", m: ""});
else if (d.c) Object.assign(estado, {c: d.c, m: ""});
else if (d.m) estado.m = d.m;
actualizar(true);
} else if (b.classList.contains("ms-ir-el")) {
estado.e = b.dataset.e;
actualizar(true);
}
});
}
async function arrancar() {
try {
const r = await fetch(BASE + "indice.json");
if (!r.ok) throw new Error(`indice.json: ${r.status}`);
IDX = await r.json();
if (!IDX.elecciones?.length) throw new Error("indice.json sin elecciones");
} catch (e) {
console.warn("Elecciones por mesa:", e);
raiz.setAttribute("aria-busy", "false");
$("ms-estado").textContent = "No se pudo cargar la herramienta.";
$("ms-resultado").innerHTML = `<div class="ms-bloque ms-falla" role="alert"><p>No se pudo cargar la lista de elecciones. Puede ser un problema de conexión.</p>` +
`<a class="boton chico" href="">Volver a intentar</a></div>`;
return;
}
const q = new URLSearchParams(location.search);
const pedida = IDX.elecciones.find(e => e.id === q.get("e"));
const inicial = pedida || IDX.elecciones.filter(e => e.cargo === "presidente").sort((a, b) => b.anio - a.anio || (a.vuelta === "segunda" ? -1 : 1))[0];
estado.e = inicial.id;
if (q.get("p") && IDX.provincias[q.get("p")]) {
estado.p = q.get("p");
if (q.get("s")) {
estado.s = q.get("s");
if (q.get("c")) {
estado.c = q.get("c").toUpperCase();
if (q.get("m")) estado.m = q.get("m").toUpperCase();
}
}
}
if (["part", "fuerza"].includes(q.get("ver"))) MAPA.ver = q.get("ver");
if (q.get("f")) MAPA.fuerza = q.get("f");
escuchar();
escucharMapa();
actualizar(false);
}
arrancar();
})();
