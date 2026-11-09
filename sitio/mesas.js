(() => {
"use strict";
const raiz = document.getElementById("ms");
if (!raiz) return;
const $ = id => document.getElementById(id);
const BASE = "datos/mesas/";
const VERSION_TABLAS = "5";
const CARGOS = {presidente: "Presidente", diputados: "Diputados nacionales", senadores: "Senadores nacionales", gobernador: "Gobernador"};
const NIVEL_NOMBRE = {presidente: "presidente", diputados: "diputados nacionales", senadores: "senadores nacionales", gobernador: "gobernador"};
const cargoNombre = (el, p) => el.cargo === "gobernador" && p === "02" ? "Jefe de Gobierno" : CARGOS[el.cargo];
const porMesa = (el, p) => el.nivel === "mesa" || !!el.mesas_en?.[p];
function sinDato(el, p) {
if (el.sin_fuente?.includes(p)) return "Votó, pero no hay un escrutinio oficial publicado en línea";
return el.fuera || `No eligió ${NIVEL_NOMBRE[el.cargo]} en esta elección`;
}
const n0 = v => Number(v).toLocaleString("es-AR");
const pct = v => (Math.round(v * 10 + 1e-9) / 10).toLocaleString("es-AR", {minimumFractionDigits: 1, maximumFractionDigits: 1}) + "%";
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const natural = (a, b) => String(a).localeCompare(String(b), "es", {numeric: true, sensitivity: "base"});
const ent = t => { const v = t === "" || t == null ? null : +t; return Number.isFinite(v) ? v : null; };
const FALLO_HISTORIA = Symbol("la historia no llegó");
let IDX = null, turno = 0;
const estado = {e: "", p: "", s: "", c: "", m: "", ext: ""};
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
async function tablaPais(id, archivo = "pais.csv") {
const f = await bajar(`${id}/${archivo}`), c = f[0];
const i = {cod: col(c, "codigo_indec"), lista: col(c, "lista"), votos: col(c, "votos"), mesas: col(c, "mesas"), el: col(c, "electores"),
vot: col(c, "votantes"), bl: col(c, "blancos"), nu: col(c, "nulos"), re: col(c, "recurridos_impugnados")};
if (i.cod < 0 || i.lista < 0 || i.votos < 0) throw new Error(`${id}/${archivo}: faltan columnas`);
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
const etiquetaEl = e => e.etiqueta + (e.nivel === "provincia" && e.cargo !== "gobernador" ? ", solo por provincia" : "");
function pintarControles(el, D) {
opciones($("ms-cargo"), Object.entries(CARGOS), el.cargo);
const mismas = IDX.elecciones.filter(e => e.cargo === el.cargo).sort((a, b) => b.anio - a.anio || (a.vuelta === "segunda" ? -1 : 1));
opciones($("ms-eleccion"), mismas.map(e => [e.id, etiquetaEl(e)]), el.id);
const orden = el.provincias.slice().sort((a, b) => provNombre(a).localeCompare(provNombre(b), "es"));
opciones($("ms-prov"), [["", "Todo el país"], ...orden.map(c => [c, provNombre(c)])], estado.p);
const secc = $("ms-sec"), circ = $("ms-cir"), mesa = $("ms-mesa"), num = $("ms-num");
const apagar = (sel, texto) => { opciones(sel, [["", texto]], ""); sel.disabled = true; };
const conMesas = !!D && porMesa(el, estado.p);
num.disabled = !conMesas;
$("ms-num-ir").disabled = !conMesas;
num.placeholder = conMesas ? "Por ejemplo, 1234" : el.nivel === "mesa" || (el.mesas_en && !estado.p) ? "Elegí una provincia" : "Sin mesas en esta elección";
if (!D) {
const t = el.nivel === "mesa" ? "Elegí una provincia" : "Sin datos";
apagar(secc, t); apagar(circ, t); apagar(mesa, t);
return;
}
const nombres = new Map();
for (const f of D.filas) if (!nombres.has(f.s)) nombres.set(f.s, f.sn);
secc.disabled = false;
opciones(secc, [["", "Toda la provincia"], ...[...nombres].sort((a, b) => a[1].localeCompare(b[1], "es", {numeric: true}))], estado.s);
if (!conMesas) { apagar(circ, "Sin datos en esta elección"); apagar(mesa, "Sin datos en esta elección"); return; }
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
if (t.nulos != null) partes.push(`${n0(t.nulos)} ${t.nulos === 1 ? "nulo" : "nulos"} (${pct(t.nulos / t.votantes * 100)})`);
if (t.recurridos) partes.push(`${n0(t.recurridos)} ${t.recurridos === 1 ? "recurrido, impugnado" : "recurridos, impugnados"} o de comando (${pct(t.recurridos / t.votantes * 100)})`);
return partes.length ? `<p class="ms-otros">De quienes votaron: ${partes.join(", ")}.</p>` : "";
}
const celdaLista = (nombre, votos, base) => nombre ? `<span class="ms-c-nom">${esc(nombre)}</span> <span class="ms-c-pct">${pct(votos / base * 100)}</span>` : "";
function tablaPartes(titulo, nombreCol, filas, verMesas, nota = "") {
if (!filas.length) return "";
const cuerpo = filas.map(f => {
const orden = dos(f.nombres, f.votos);
const [a, b] = [orden[0], orden[1]];
const base = orden.reduce((s, x) => s + x[1], 0);
const p = f.part;
return `<tr><th scope="row"><button type="button" class="enlace ms-ir" data-${f.clave}="${esc(f.valor)}">${esc(f.nombre)}</button></th>` +
(verMesas ? `<td class="n ms-ancho">${f.mesas == null ? "" : n0(f.mesas)}</td>` : `<td class="n ms-ancho">${f.electores == null ? "sin dato" : n0(f.electores)}</td>`) +
`<td class="n">${p == null ? "sin dato" : pct(p)}</td>` +
`<td>${a ? celdaLista(a[0], a[1], base) : "sin resultado"}</td><td>${b ? celdaLista(b[0], b[1], base) : ""}</td></tr>`;
}).join("");
return `<section class="ms-bloque" aria-labelledby="ms-partes-tit"><h2 class="ms-sub-tit" id="ms-partes-tit">${esc(titulo)}</h2>` + (nota ? `<p class="ms-sub">${esc(nota)}</p>` : "") +
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
const POR_QUE_FALTA = "faltan mesas que no se cargaron la noche de la elección, y el provisorio no cuenta el voto en el exterior ni en las cárceles";
function avisoCobertura(el) {
const c = estado.p ? el.cobertura?.[estado.p] : el.cobertura_pais;
if (c == null || c >= COBERTURA_AVISO) return "";
return `${estado.p ? `En ${provNombre(estado.p)}, las` : "En todo el país, las"} mesas del escrutinio provisorio reúnen ${pct(c)} de los votos positivos del definitivo: ${POR_QUE_FALTA}.`;
}
function pintar(el, P, D, H, aviso, DEF) {
const usaDef = !!DEF && !estado.s;
const T = usaDef ? DEF : P;
const recuento = el.nivel === "mesa" ? (usaDef ? "definitivo" : "provisorio") : el.mesas_en?.[estado.p] && estado.s ? el.mesas_en[estado.p] : el.recuento;
const fecha = estado.p ? el.fechas?.[estado.p] : null;
const sub = `${cargoNombre(el, estado.p)}, ${el.etiqueta}.${fecha ? ` Se votó el ${fecha}.` : ""}${recuento ? ` Escrutinio ${recuento}.` : ""}`;
const cob = usaDef ? "" : avisoCobertura(el);
let resumen = "", listas = [], t = null, partes = "", frase = "", historia = "";
const notas = [];
if (el.definitivo && !DEF && !estado.s) notas.push("No se pudo bajar el escrutinio definitivo: se muestra la suma de las mesas del provisorio.");
const aparte = usaDef ? ["EX", "PL"].map(c => DEF[c]).filter(Boolean) : [];
const pv = el.provincias.map(c => T[c]).filter(Boolean);
if (!estado.p) {
const todos = pv;
t = {mesas: todos.every(x => x.mesas != null) ? todos.reduce((s, x) => s + x.mesas, 0) : null,
electores: pv.every(x => x.electores != null) ? pv.reduce((s, x) => s + x.electores, 0) : 0,
votantes: todos.every(x => x.votantes != null) ? todos.reduce((s, x) => s + x.votantes, 0) : null,
blancos: todos.every(x => x.blancos != null) ? todos.reduce((s, x) => s + x.blancos, 0) : null,
nulos: todos.every(x => x.nulos != null) ? todos.reduce((s, x) => s + x.nulos, 0) : null,
recurridos: todos.reduce((s, x) => s + (x.recurridos || 0), 0)};
if (el.cargo === "presidente") {
const suma = new Map();
for (const x of todos) for (const [n, v] of x.listas) suma.set(n, (suma.get(n) || 0) + v);
listas = [...suma].sort((a, b) => b[1] - a[1]);
} else {
frase = `Cada jurisdicción vota sus propias listas de ${NIVEL_NOMBRE[el.cargo]}, así que no hay un total de listas para el país. Elegí una provincia para ver las suyas.`;
}
const filas = pv.slice().sort((a, b) => provNombre(a.cod).localeCompare(provNombre(b.cod), "es")).map(x => ({
clave: "p", valor: x.cod, nombre: provNombre(x.cod), mesas: x.mesas, electores: x.electores, part: x.electores && x.votantes != null ? x.votantes / x.electores * 100 : null,
nombres: x.listas.map(l => l[0]), votos: x.listas.map(l => l[1])}));
partes = tablaPartes("¿Cómo votó cada jurisdicción?", "Jurisdicción", filas, el.nivel === "mesa" && !usaDef,
!usaDef ? "" : aparte.length ? "Escrutinio definitivo de cada jurisdicción. En esta elección no incluye el voto en el exterior ni en las cárceles: va aparte, más abajo."
: "Escrutinio definitivo de cada jurisdicción, con el voto de sus electores en el exterior y en las cárceles.");
if (usaDef) notas.push(aparte.length ? "El total del país suma los escrutinios definitivos de las jurisdicciones. El voto en el exterior y en las cárceles, que la Cámara Nacional Electoral publicó aparte, no está sumado: va más abajo."
: "El total de cada jurisdicción incluye el voto de sus electores en el exterior y en las cárceles.");
} else if (!D) {
const x = P[estado.p];
t = {mesas: null, electores: x.electores || 0, votantes: x.votantes, blancos: x.blancos, nulos: x.nulos, recurridos: x.recurridos || 0};
listas = x.listas.slice().sort((a, b) => b[1] - a[1]);
} else if (el.nivel === "departamento" && !porMesa(el, estado.p)) {
const filas = D.filas.filter(f => !estado.s || f.s === estado.s);
if (estado.s) {
t = sumar(filas, D.listas.length);
listas = dos(D.listas, t.v);
} else {
const x = P[estado.p];
t = {mesas: null, electores: x.electores || 0, votantes: x.votantes, blancos: x.blancos, nulos: x.nulos, recurridos: x.recurridos || 0};
listas = x.listas.slice().sort((a, b) => b[1] - a[1]);
const circunscripciones = el.rotulo === "circunscripcion" || (estado.p === "02" && filas[0]?.sn.startsWith("Circ"));
const comunas = estado.p === "02" && filas[0]?.sn.startsWith("Comuna");
const hijos = filas.map(f => {
const s = sumar([f], D.listas.length);
return {clave: "s", valor: f.s, nombre: f.sn, mesas: null, electores: s.electores, part: participacion(s), nombres: D.listas, votos: f.v};
}).sort((a, b) => natural(a.nombre, b.nombre));
partes = tablaPartes(circunscripciones ? "¿Cómo votó cada circunscripción?" : comunas ? "¿Cómo votó cada comuna?" : "¿Cómo votó cada departamento?",
circunscripciones ? "Circunscripción" : comunas ? "Comuna" : "Departamento", hijos, false);
}
if (!el.origen) {
if (el.fuente) notas.push(`Estos votos salen de ${el.fuente}. No hay un escrutinio oficial publicado como datos.`);
else notas.push(`${estado.s ? "Este resultado no es" : "Los departamentos no son"} el escrutinio definitivo: ${estado.s ? "sale" : "salen"} de ${el.anio <= 2001 ? "la base de Ernesto Calvo" : "PolAr, a partir del Atlas Electoral de Andy Tow"}, y ${estado.s ? "puede" : "pueden"} no sumar exacto el total de la jurisdicción.`);
}
} else {
const filas = D.filas.filter(f => (!estado.s || f.s === estado.s) && (!estado.c || f.c === estado.c) && (!estado.m || f.m === estado.m));
t = sumar(filas, D.listas.length);
listas = dos(D.listas, t.v);
const x = usaDef ? DEF[estado.p] : el.origen && !estado.s ? P[estado.p] : null;
const rec = el.mesas_en?.[estado.p] || "provisorio";
if (x) {
t = {mesas: null, electores: x.electores || 0, votantes: x.votantes, blancos: x.blancos, nulos: x.nulos, recurridos: x.recurridos || 0};
listas = x.listas.slice().sort((a, b) => b[1] - a[1]);
}
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
const c = el.cobertura?.[estado.p];
const seccion = !el.origen ? ["sección", "Sección"] : estado.p === "02" ? (D.filas[0]?.sn.startsWith("Circ") ? ["circunscripción", "Circunscripción"] : ["comuna", "Comuna"]) : ["departamento", "Departamento"];
partes = tablaPartes(estado.s ? "¿Cómo votó cada circuito?" : `¿Cómo votó cada ${seccion[0]}?`, estado.s ? "Circuito" : seccion[1], hijos, true,
el.origen ? `Escrutinio ${rec} mesa por mesa.` : x ? `Escrutinio provisorio, el único publicado mesa por mesa.${c != null ? ` Las mesas reúnen ${pct(c)} de los votos positivos del definitivo de ${provNombre(estado.p)}: ${POR_QUE_FALTA}.` : ""}` : "");
} else if (!estado.m) {
const hijos = filas.slice().sort((a, b) => natural(a.m, b.m)).map(f => {
const s = sumar([f], D.listas.length);
return {clave: "m", valor: f.m, nombre: `Mesa ${f.m}`, mesas: 1, electores: f.e, part: participacion(s), nombres: D.listas, votos: f.v};
});
partes = tablaPartes("¿Cómo votó cada mesa?", "Mesa", hijos, false);
}
if (estado.m && t.votantes > t.electores && t.electores > 0)
notas.push("Esta mesa registra más votos que electores. Puede ser un error de carga del telegrama, que el escrutinio definitivo corrige.");
if (estado.m && !t.votantes) notas.push(`Esta mesa figura sin resultado en el escrutinio ${rec}.`);
if (!estado.m && !x && t.sinVotos) notas.push(`${n0(t.sinVotos)} de ${n0(t.mesas)} mesas figuran sin resultado en el escrutinio ${rec}: la participación no las cuenta.`);
if (estado.s && H === FALLO_HISTORIA) {
historia = `<section class="ms-bloque ms-falla" role="alert"><p>No se pudo bajar la historia de ${estado.c ? "este circuito" : "esta sección"}. Los resultados de esta elección están completos. Al elegir otro lugar se vuelve a intentar.</p></section>`;
} else if (estado.s && H) {
const mapa = H.get(`${estado.s}|${estado.c}`);
historia = tablaHistorial(el, mapa, estado.c ? "este circuito" : "esta sección");
}
}
const positivos = listas.reduce((s, x) => s + x[1], 0);
if (!frase && listas.length >= 2) {
const enSeccion = !el.origen ? "en esta sección" : estado.p !== "02" ? "en este departamento" : estado.s.startsWith("CABA") ? "en esta circunscripción" : "en esta comuna";
const dondeTxt = !estado.p ? "en el país" : estado.m ? "en esta mesa" : estado.c ? "en este circuito" : estado.s ? enSeccion : "en esta jurisdicción";
frase = `La lista más votada ${dondeTxt} fue ${listas[0][0]}, con ${pct(listas[0][1] / positivos * 100)} de los votos positivos, y la segunda, ${listas[1][0]}, con ${pct(listas[1][1] / positivos * 100)}.`;
}
if (el.nivel === "provincia") notas.push(el.nota_nivel || "Para esta elección no hay datos que se puedan publicar por debajo de la jurisdicción.");
if (estado.p && !estado.s && el.notas?.[estado.p]) notas.push(el.notas[estado.p]);
if (estado.p && !estado.s && el.fuentes?.[estado.p]) notas.push(`Fuente: ${el.fuentes[estado.p]}.`);
if (!estado.p && el.sin_fuente?.length) {
const sin = el.sin_fuente.map(provNombre).sort((a, b) => a.localeCompare(b, "es"));
notas.push(`${sin.join(", ").replace(/, ([^,]*)$/, " y $1")} también ${sin.length === 1 ? "votó" : "votaron"} en ${el.anio}, pero no hay un escrutinio oficial publicado en línea.`);
}
frase = [frase, ...notas].filter(Boolean).join(" ");
resumen = `<section class="ms-bloque ms-resultado" aria-labelledby="ms-titulo"><h2 class="ms-tit" id="ms-titulo" tabindex="-1">${esc(lugar(el, D))}</h2>` +
`<p class="ms-sub">${esc(sub)}</p>` + (aviso ? `<p class="aviso-serie ms-aviso">${esc(aviso)}</p>` : "") + (cob ? `<p class="aviso-serie ms-aviso">${esc(cob)}</p>` : "") + cifras(t, !estado.m && porMesa(el, estado.p)) +
(frase ? `<p class="ms-frase">${esc(frase)}</p>` : "") + tablaListas(listas, positivos) + otrosVotos(t) + `</section>`;
$("ms-resultado").innerHTML = resumen + partes + historia + (!estado.p ? bloqueExterior(el, DEF) : "");
if (!estado.p) llenarPadron(el);
const porJur = !estado.p || !D;
const bajarCSV = porJur ? `${BASE}${el.id}/${DEF ? "definitivo" : "pais"}.csv` : `${BASE}${el.id}/${estado.p}.csv`;
const a = $("ms-bajar");
a.href = bajarCSV;
a.textContent = porJur ? (DEF ? "Descargar el escrutinio definitivo por jurisdicción (CSV)" : "Descargar tabla por jurisdicción (CSV)")
: `Descargar ${porMesa(el, estado.p) ? "las mesas" : "los departamentos"} de ${provNombre(estado.p)} (CSV)`;
const ah = $("ms-bajar-hist");
ah.hidden = !(estado.p && D && el.nivel === "mesa");
if (estado.p) ah.href = `${BASE}circuitos/${estado.p}.csv`;
raiz.setAttribute("aria-busy", "false");
$("ms-estado").textContent = `Resultados de ${lugar(el, D)}.`;
}
function bloqueExterior(el, DEF) {
if (el.nivel !== "mesa") return "";
const ap = DEF ? ["EX", "PL"].filter(c => DEF[c]) : [];
const pad = IDX.exterior?.anio === el.anio ? IDX.exterior : null;
let cuerpo = "";
if (ap.length) {
cuerpo = `<p class="ms-sub">La Cámara Nacional Electoral publicó aparte el voto de los argentinos que viven en el exterior y el de las personas privadas de libertad, en dos planillas que titula "consulta provisoria de totales". No están sumados en el total del país de arriba: las actas de las jurisdicciones dicen que no los incluyen.</p>` +
ap.map(c => {
const x = DEF[c], l = x.listas.slice().sort((a, b) => b[1] - a[1]), pos = l.reduce((s, y) => s + y[1], 0);
const frase = l.length >= 2 ? `<p class="ms-frase">La lista más votada fue ${esc(l[0][0])}, con ${pct(l[0][1] / pos * 100)} de los votos positivos, y la segunda, ${esc(l[1][0])}, con ${pct(l[1][1] / pos * 100)}.</p>` : "";
return `<h3 class="ms-sub-tit ms-sub-tit-3">${c === "EX" ? "Argentinos que viven en el exterior" : "Personas privadas de libertad"}</h3>` + cifras({votantes: x.votantes}, false) + frase +
tablaListas(l, pos) + otrosVotos({votantes: x.votantes, blancos: x.blancos, nulos: x.nulos, recurridos: x.recurridos});
}).join("");
} else if (DEF) {
cuerpo = `<p class="ms-sub">En esta elección la Cámara Nacional Electoral no publica aparte el voto en el exterior ni el de las personas privadas de libertad: va sumado en el escrutinio definitivo de cada jurisdicción, que es el total de arriba. Las mesas del provisorio no lo cuentan.</p>`;
} else {
cuerpo = `<p class="ms-sub">El escrutinio provisorio no cuenta el voto en el exterior ni el de las personas privadas de libertad, y el definitivo de esta elección no está publicado como datos.</p>`;
}
if (pad) {
cuerpo += `<h3 class="ms-sub-tit ms-sub-tit-3">¿Cuántos argentinos pueden votar en cada país?</h3>` +
`<p class="ms-sub">Padrón de ${pad.anio} de la Cámara Nacional Electoral: cada mesa del exterior, con su país, su consulado y la jurisdicción por la que vota cada elector. Los votos de cada país no se publican: la Cámara suma todo el exterior de una jurisdicción en una sola mesa.</p>` +
`<label class="selector-ficha"><span>País</span><select id="ms-ext-pais" disabled><option>Cargando el padrón</option></select></label><div id="ms-ext-res" aria-live="polite"></div>`;
} else {
cuerpo += `<p class="ms-otros">El padrón del exterior país por país está publicado solo para ${IDX.exterior ? IDX.exterior.anio : "una elección"}.</p>`;
}
return `<section class="ms-bloque" aria-labelledby="ms-ext-tit"><h2 class="ms-sub-tit" id="ms-ext-tit">¿Cómo se votó en el exterior y en las cárceles?</h2>${cuerpo}</section>`;
}
let PADRON = null;
async function llenarPadron(el) {
const sel = $("ms-ext-pais");
if (!sel) return;
const yo = turno;
try {
if (!PADRON) {
const f = await bajar(IDX.exterior.archivo), c = f[0];
const i = Object.fromEntries(c.map((n, k) => [n, k]));
if (!("pais" in i) || !("electores" in i) || !("codigo_indec" in i)) throw new Error("padrón del exterior: faltan columnas");
const m = new Map();
for (const r of f.slice(1)) {
const p = m.get(r[i.pais]) || {pais: r[i.pais], electores: 0, mesas: new Set(), consulados: new Map(), prov: new Map()};
const e = +r[i.electores];
p.electores += e;
p.mesas.add(`${r[i.consulado]}|${r[i.mesa]}`);
p.consulados.set(r[i.consulado], (p.consulados.get(r[i.consulado]) || 0) + e);
p.prov.set(r[i.codigo_indec], (p.prov.get(r[i.codigo_indec]) || 0) + e);
m.set(r[i.pais], p);
}
PADRON = [...m.values()].sort((a, b) => a.pais.localeCompare(b.pais, "es"));
}
if (yo !== turno || !$("ms-ext-pais")) return;
const mayores = PADRON.slice().sort((a, b) => b.electores - a.electores);
const total = PADRON.reduce((s, p) => s + p.electores, 0);
const elegido = estado.ext && PADRON.some(p => p.pais === estado.ext) ? estado.ext : mayores[0].pais;
opciones(sel, PADRON.map(p => [p.pais, p.pais]), elegido);
sel.disabled = false;
const mostrar = () => {
const p = PADRON.find(x => x.pais === sel.value);
estado.ext = p.pais;
const provs = [...p.prov].sort((a, b) => b[1] - a[1]);
const cons = [...p.consulados].sort((a, b) => b[1] - a[1]);
const fila = (nombre, n) => `<tr><th scope="row">${esc(nombre)}</th><td class="n">${n0(n)}</td><td class="n">${pct(n / p.electores * 100)}</td></tr>`;
const resto = provs.slice(10);
const filas = provs.slice(0, 10).map(([c, n]) => fila(provNombre(c), n)).join("") +
(resto.length ? fila(resto.length === 1 ? provNombre(resto[0][0]) : `Otras ${resto.length} jurisdicciones`, resto.reduce((s, x) => s + x[1], 0)) : "");
$("ms-ext-res").innerHTML = `<p class="ms-frase">En ${esc(p.pais)} pueden votar ${n0(p.electores)} argentinos (${pct(p.electores / total * 100)} de los ${n0(total)} del exterior), en ${n0(p.mesas.size)} ${p.mesas.size === 1 ? "mesa" : "mesas"} de ${cons.length === 1 ? "una representación" : `${n0(cons.length)} representaciones`}: ${esc(cons.map(x => x[0]).join(", ").replace(/, ([^,]*)$/, " y $1"))}. Votan por la jurisdicción de su último domicilio en el país.</p>` +
`<div class="tabla-desliza ms-tabla-partes" tabindex="0" role="region" aria-label="Electores de ${esc(p.pais)} por jurisdicción"><table class="tabla-areas"><caption class="solo-lector">Electores de ${esc(p.pais)} según la jurisdicción por la que votan</caption>` +
`<thead><tr><th scope="col">Vota por</th><th scope="col" class="n">Electores</th><th scope="col" class="n">%</th></tr></thead><tbody>${filas}</tbody></table></div>`;
};
sel.onchange = () => { mostrar(); dirección(); };
mostrar();
} catch (e) {
console.warn("Elecciones por mesa, el padrón del exterior:", e);
if (yo !== turno || !$("ms-ext-res")) return;
sel.innerHTML = "<option>Sin datos</option>";
$("ms-ext-res").innerHTML = `<p class="ms-otros" role="alert">No se pudo bajar el padrón del exterior. Los resultados de esta elección están completos.</p>`;
}
}
function dirección() {
const q = new URLSearchParams();
if (estado.e) q.set("e", estado.e);
for (const k of ["p", "s", "c", "m"]) if (estado[k]) q.set(k, estado[k]);
if (!estado.p && estado.ext) q.set("pais", estado.ext);
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
const claveRasgo = r => `${r.properties.p}|${r.properties.s ?? ""}|${r.properties.c ?? ""}`;
const nombreLugar = t => String(t).normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "");
const UNIDADES = {circuito: "circuitos", departamento: "departamentos", provincia: "jurisdicciones", circunscripcion: "circunscripciones"};
const FUENTES_DEPTOS = {hasta2001: "la base de Ernesto Calvo", desde2003: "PolAr, a partir del Atlas Electoral de Andy Tow"};
const unidadDe = doc => doc.unidad || "circuito";
const TERRITORIOS = new Set(["22", "26", "34", "42", "54", "58", "62", "78", "94"]);
const sinDatoHistorico = (doc, p) => doc.historica && elec().anio < 1951 && TERRITORIOS.has(p) ? "Territorio nacional: no elegía presidente ni diputados" : "Sin dato de este lugar en esta elección";
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
function porSeccion(doc) {
const m = new Map();
for (const cod of Object.keys(doc.provincias)) {
for (const f of doc.provincias[cod].filas) {
const k = `${cod}|${seccionDe(f)}`, x = m.get(k) || {s: seccionDe(f), e: 0, t: 0, v: new Map()};
x.e += f[2]; x.t += f[3];
for (let i = 0; i < f[4].length; i += 2) x.v.set(f[4][i], (x.v.get(f[4][i]) || 0) + f[4][i + 1]);
m.set(k, x);
}
}
const salida = new Map();
for (const [k, x] of m) {
const fila = [x.s, null, x.e, x.t, [...x.v].sort((a, b) => b[1] - a[1]).flat()];
fila.cod = k.split("|")[0];
fila.seccion = true;
salida.set(k, fila);
}
return salida;
}
const secTabla = r => MAPA.doc?.sec_tabla?.[r.properties.s] ?? r.properties.s;
const seccionDelRasgo = r => MAPA.doc.secciones?.get(`${r.properties.p}|${secTabla(r)}`);
function rayas(color) {
if (color === SIN_MESAS || !MAPA.defs) return color;
const id = `ms-r${color.replace(/[^0-9a-z]/gi, "")}`;
if (!MAPA.defs.select(`#${id}`).size()) {
const p = MAPA.defs.append("pattern").attr("id", id).attr("patternUnits", "userSpaceOnUse").attr("width", 5).attr("height", 5)
.attr("patternTransform", `rotate(45) scale(${1 / (MAPA.k || 1)})`);
p.append("rect").attr("width", 5).attr("height", 5).attr("fill", "#fff");
p.append("rect").attr("width", 2.4).attr("height", 5).attr("fill", color);
}
return `url(#${id})`;
}
function rellenoDe(doc, r) {
const f = MAPA.indice.get(claveRasgo(r));
const propio = f ? colorDe(doc, f) : SIN_MESAS;
if (propio !== SIN_MESAS || unidadDe(doc) !== "circuito") return propio;
const sec = f ? doc.secciones?.get(`${f.cod}|${seccionDe(f)}`) : seccionDelRasgo(r);
return sec ? rayas(colorDe(doc, sec)) : SIN_MESAS;
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
const prov = provNombre(p), unidad = unidadDe(doc);
if (!f && unidad !== "circuito" && elec().origen && pv) return `<b>${esc(prov)}</b><br>Sin datos de este departamento en esta elección`;
if (!f && unidad !== "circuito") return `<b>${esc(prov)}</b><br>${unidad === "provincia" || elec().origen ? sinDato(elec(), p) : sinDatoHistorico(doc, p)}`;
if (!f && !pv) return `<b>${esc(prov)}</b><br>No eligió ${NIVEL_NOMBRE[elec().cargo]} en esta elección`;
if (!f) {
const sec = seccionDelRasgo(r), sn = pv.secciones?.[secTabla(r)] || "";
const lugarSin = `<b>${c == null ? "Zona sin circuito en la cartografía" : c === "0" ? "Zona sin circuito propio" : `Circuito ${esc(c)}`}${sn ? `, ${esc(sn)}` : ""}, ${esc(prov)}</b>`;
if (!sec) return `${lugarSin}<br>Sin mesas en esta elección`;
if (!positivosDe(sec)) return `${lugarSin}<br>${doc.recuento === "definitivo" ? "Sin votos en esta elección, en toda la sección" : "Sin votos cargados en el escrutinio provisorio, en toda la sección. El definitivo de la jurisdicción sí los cuenta"}`;
const pos = positivosDe(sec), l = [];
for (let i = 0; i < Math.min(6, sec[4].length); i += 2) l.push(`${esc(doc.listas[sec[4][i]])}: ${pct(sec[4][i + 1] / pos * 100)}`);
return `${lugarSin}<br>Sin mesas propias: quien vive acá vota en otro circuito. Se pinta, rayado, con el resultado de toda la sección:<br>${l.join("<br>")}`;
}
const cs = circuitosMesa(f), sn = pv.secciones[seccionDe(f)] || "";
let lugar;
if (pv.nivel === "provincia") lugar = `${esc(prov)}, sin dato por departamento`;
else if (unidad === "provincia" || sn === "CABA") lugar = esc(prov);
else if (unidad === "departamento" || pv.nivel === "seccion") lugar = `${esc(sn)}, ${esc(prov)}`;
else if (cs.length === 1) lugar = `Circuito ${esc(cs[0].split("|")[1])}, ${esc(sn)}, ${esc(prov)}`;
else lugar = `Circuitos ${esc(cs.slice(0, 4).map(x => x.split("|")[1]).join(", "))}${cs.length > 4 ? " y otros" : ""}, ${esc(sn)}`;
const pos = positivosDe(f), filas = [];
for (let i = 0; i < Math.min(6, f[4].length); i += 2) filas.push(`${esc(doc.listas[f[4][i]])}: ${pct(f[4][i + 1] / pos * 100)}`);
if (!pos) {
const sec = unidad === "circuito" ? doc.secciones?.get(`${f.cod}|${seccionDe(f)}`) : null;
filas.push(!sec ? "Sin votos en esta elección" : positivosDe(sec) ? "Sin votos cargados en el escrutinio provisorio: se pinta, rayado, con el resultado de toda la sección"
: "Sin votos cargados en el escrutinio provisorio, en toda la sección. El definitivo de la jurisdicción sí los cuenta");
}
if (MAPA.ver === "fuerza") {
const ix = doc.fuerzas.findIndex(x => x.id === MAPA.fuerza);
if (ix >= 0 && pos) filas.unshift(`<b>${esc(doc.fuerzas[ix].n)}: ${pct(votosFuerza(doc, f, ix) / pos * 100)}</b>`);
}
if (f[2] > 0) filas.push(`Participación: ${pct(f[3] / f[2] * 100)}`);
return `<b>${lugar}</b><br>${filas.join("<br>")}`;
}
function armarLienzo(doc, topo, ruta, base) {
const lienzo = $("ms-lienzo");
lienzo.querySelector("svg")?.remove();
const obj = topo.objects[Object.keys(topo.objects)[0]];
const rasgos = topojson.feature(topo, obj).features;
const fondo = base ? topojson.feature(base, base.objects[Object.keys(base.objects)[0]]).features.filter(r => !estado.p || r.properties.p === estado.p) : [];
const [x0, y0, x1, y1] = topojson.bbox(topo);
const RAD = Math.PI / 180, my = lat => Math.log(Math.tan(Math.PI / 4 + lat * RAD / 2));
const dx = (x1 - x0) * RAD, dy = my(y1) - my(y0), W = 720, H = Math.round(Math.min(1160, Math.max(420, W * dy / dx)));
const k = Math.min((W - 12) / dx, (H - 12) / dy), ox = (W - dx * k) / 2, oy = (H - dy * k) / 2;
const camino = d3.geoPath(d3.geoTransform({point(lon, lat) { this.stream.point(ox + (lon - x0) * RAD * k, oy + (my(y1) - my(lat)) * k); }}));
const svg = d3.select(lienzo).insert("svg", ":first-child").attr("viewBox", `0 0 ${W} ${H}`).attr("role", "img").attr("preserveAspectRatio", "xMidYMid meet");
const defs = svg.append("defs");
const capa = svg.append("g");
const fondoSel = capa.append("g").attr("class", "ms-fondo").selectAll("path").data(fondo).join("path").attr("class", "ms-c ms-cf").attr("d", camino);
const caminos = capa.append("g").attr("class", estado.p ? "ms-cs" : "ms-cs ms-cs-pais").selectAll("path").data(rasgos).join("path").attr("class", "ms-c").attr("d", camino);
const llave = estado.p && !ruta.includes("provincias") ? "s" : "p";
capa.append("path").attr("class", "ms-limite").attr("d", camino(topojson.mesh(topo, obj, (a, b) => a.properties[llave] !== b.properties[llave])));
const sel = capa.append("path").attr("class", "ms-sel");
const zoom = d3.zoom().scaleExtent([1, 90]).extent([[0, 0], [W, H]]).translateExtent([[0, 0], [W, H]])
.filter(ev => ev.type === "wheel" ? ev.ctrlKey || ev.metaKey : ev.type === "touchstart" ? ev.touches.length > 1 : !ev.button)
.on("zoom", ev => {
capa.attr("transform", ev.transform);
MAPA.k = ev.transform.k;
defs.selectAll("pattern").attr("patternTransform", `rotate(45) scale(${1 / ev.transform.k})`);
});
svg.call(zoom).on("dblclick.zoom", null);
const delGrupo = ev => { const d = ev.target?.__data__; return d?.properties ? d : null; };
capa.on("pointermove", ev => {
const r = delGrupo(ev);
if (r && typeof mostrarTip === "function") { const [mx, my2] = d3.pointer(ev, lienzo); mostrarTip(lienzo, textoTip(MAPA.doc, r), mx, my2); }
}).on("pointerleave", ev => { if (ev.pointerType === "mouse" && typeof ocultarTip === "function") ocultarTip(); })
.on("click", ev => { const r = delGrupo(ev); if (r) elegirRasgo(r); });
Object.assign(MAPA, {ruta, topo, rasgos, svg, capa, caminos, sel, zoom, camino, W, H, enfoque: "", defs, fondoSel, k: 1, conFondo: !!base});
}
function elegirRasgo(r) {
const doc = MAPA.doc;
if (!estado.p) { Object.assign(estado, {p: r.properties.p, s: "", c: "", m: ""}); actualizar(false); return; }
const f = MAPA.indice.get(claveRasgo(r));
if (!f && unidadDe(doc) === "circuito" && seccionDelRasgo(r)) { Object.assign(estado, {s: secTabla(r), c: "", m: ""}); actualizar(false); return; }
if (!f || doc.provincias[estado.p].nivel === "provincia" || unidadDe(doc) === "provincia" || seccionDe(f) === "CABA") return;
const cs = circuitosMesa(f), [s, c] = cs[0].split("|");
if (unidadDe(doc) === "departamento" || doc.provincias[estado.p].nivel === "seccion" || cs.length > 1) Object.assign(estado, {s, c: "", m: ""});
else Object.assign(estado, {s, c, m: ""});
actualizar(false);
}
function enfocar() {
const clave = `${MAPA.ruta}|${estado.p}|${estado.s}`;
if (clave === MAPA.enfoque) return;
MAPA.enfoque = clave;
let t = d3.zoomIdentity;
const delPais = MAPA.ruta.includes("provincias");
if (estado.s || (estado.p && delPais)) {
const dentro = MAPA.rasgos.filter(r => {
if (!estado.s) return r.properties.p === estado.p;
const f = MAPA.indice.get(claveRasgo(r));
return f ? seccionDe(f) === estado.s : secTabla(r) === estado.s;
});
if (dentro.length) {
const cajas = dentro.map(r => MAPA.camino.bounds(r));
const a = Math.min(...cajas.map(b => b[0][0])), b = Math.min(...cajas.map(x => x[0][1])), c = Math.max(...cajas.map(x => x[1][0])), d = Math.max(...cajas.map(x => x[1][1]));
const k = Math.max(1, Math.min(90, (unidadDe(MAPA.doc) === "circuito" ? .92 : .55) / Math.max((c - a) / MAPA.W, (d - b) / MAPA.H)));
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
const nombre = ([ix, x]) => doc.unidad === "departamento" || x.listas.size > 1 || doc.fuerzas[ix].id === "otras" ? doc.fuerzas[ix].n : doc.listas[[...x.listas][0]];
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
MAPA.caminos.attr("fill", r => rellenoDe(doc, r));
MAPA.fondoSel.attr("fill", r => rellenoDe(doc, r));
const pv = estado.p ? doc.provincias[estado.p] : null, unidad = unidadDe(doc);
const clase = pv?.nivel === "seccion" || (estado.p === "02" && doc.historica && doc.rotulo === "departamento") ? "secciones" : UNIDADES[doc.rotulo || unidad];
const singular = {circuitos: "circuito", secciones: "sección", departamentos: "departamento", jurisdicciones: "jurisdicción", circunscripciones: "circunscripción"}[clase];
const lugarMapa = [estado.c ? `Circuito ${estado.c}` : "", estado.s ? pv.secciones[estado.s] || "" : "", estado.p ? provNombre(estado.p) : "Todo el país"].filter(Boolean).join(", ");
const conPocas = !estado.p && doc.historica && el.provincias.length < 20;
const donde = estado.s ? (pv.secciones[estado.s] || "esta sección") : estado.p ? provNombre(estado.p) : conPocas ? `las ${el.provincias.length} jurisdicciones con datos` : "todo el país";
let frase = "", leyenda = "";
const conVotos = filas.filter(f => positivosDe(f));
if (ver === "gana") {
const l = leyendaGana(doc, filas);
leyenda = l.html;
if (conVotos.length === 1) {
const f = conVotos[0];
frase = `En ${donde}, la lista más votada fue ${doc.listas[f[4][0]]}, con ${pct(f[4][1] / positivosDe(f) * 100)} de los votos positivos.`;
} else if (l.orden.length) {
const primero = l.orden[0];
frase = `En ${donde}, ${l.nombre(primero)} fue la más votada en ${n0(primero[1].n)} de ${n0(conVotos.length)} ${clase}` +
(l.orden[1] ? `, y ${l.nombre(l.orden[1])} en ${n0(l.orden[1][1].n)}.` : ".");
}
} else if (ver === "part") {
const cuentas = [0, 0, 0, 0, 0];
const vals = [];
for (const f of filas) if (f[2] > 0) { const v = f[3] / f[2] * 100; cuentas[tramo(CORTES.part, v)]++; vals.push(v); }
leyenda = leyendaTramos(unidad === "circuito" ? "Participación: votantes por cada 100 electores de las mesas con resultado" : "Participación: votantes por cada 100 electores", CORTES.part, COLORES_PART, cuentas);
if (vals.length > 1) {
vals.sort((a, b) => a - b);
const mitad = ["secciones", "jurisdicciones", "circunscripciones"].includes(clase) ? "la mitad de las" : "la mitad de los";
frase = `En ${donde}, ${mitad} ${clase} tuvo una participación de ${pct(vals[Math.floor(vals.length / 2)])} o más. La más baja fue de ${pct(vals[0])} y la más alta, de ${pct(vals.at(-1))}.`;
} else if (vals.length) {
frase = `En ${donde}, la participación fue de ${pct(vals[0])}.`;
} else {
frase = "Esta elección no trae los electores de cada lugar: el mapa de participación queda sin color.";
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
const grisTxt = doc.historica ? (el.anio < 1951 ? "Sin dato, o territorio nacional que no votaba" : "Sin dato en esta elección")
: unidad === "circuito" ? (!estado.p && el.cargo === "senadores" ? "No eligió senadores en esta elección" : doc.recuento === "definitivo" ? "Sin mesas en esta elección" : "Sin mesas o sin votos cargados en el provisorio")
: {departamento: el.gris || "Sin dato en esta elección", provincia: el.gris || "No eligió senadores en esta elección"}[unidad];
const hayGris = MAPA.rasgos.some(r => rellenoDe(doc, r) === SIN_MESAS) || MAPA.fondoSel.data().some(r => rellenoDe(doc, r) === SIN_MESAS);
$("ms-ley").innerHTML = leyenda +
(unidad === "circuito" ? `<div class="ms-ley-tramo ms-ley-sin"><i class="ms-ley-rayas" aria-hidden="true"></i><span class="ms-ley-nom">Sin mesas propias: el resultado de toda su sección</span></div>` : "") +
(hayGris ? `<div class="ms-ley-tramo ms-ley-sin"><i style="background:${SIN_MESAS}" aria-hidden="true"></i><span class="ms-ley-nom">${grisTxt}</span></div>` : "");
$("ms-mapa-frase").textContent = frase;
$("ms-mapa-tit").textContent = ver === "gana" ? `¿Quién ganó en cada ${singular}?` : ver === "part" ? `¿Cuánta gente votó en cada ${singular}?` : "¿Dónde sacó más votos cada fuerza?";
$("ms-mapa-sub").textContent = `${cargoNombre(el, estado.p)}, ${el.etiqueta}${unidad === "circuito" ? `, escrutinio ${doc.recuento || "provisorio"} mesa por mesa` : ""}. ${lugarMapa}. Tocá un lugar para ver sus resultados.`;
MAPA.svg.attr("aria-label", `Mapa de ${donde}. ${frase} Los mismos resultados están en las tablas de abajo.`);
const notas = [];
const enVista = c => !estado.p || c === estado.p;
const secciones = el.provincias.filter(c => doc.provincias[c]?.nivel === "seccion" && doc.provincias[c]?.ed !== "ign" && unidad === "circuito" && enVista(c)).map(provNombre);
if (secciones.length) notas.push(`En ${secciones.join(", ").replace(/, ([^,]*)$/, " y $1")}, en esta elección el mapa llega hasta la sección: los códigos de entonces no coinciden con la cartografía de los circuitos.`);
const ign = el.provincias.filter(c => doc.provincias[c]?.ed === "ign" && enVista(c)).map(provNombre);
if (ign.length) notas.push(`En ${ign.join(", ").replace(/, ([^,]*)$/, " y $1")} el mapa llega hasta el departamento, con la cartografía del Instituto Geográfico Nacional: la Cámara Nacional Electoral no permite bajar la de sus circuitos. Las tablas sí llegan a cada circuito y a cada mesa.`);
const faltan = el.provincias.filter(c => (doc.provincias[c]?.con ?? 100) < 99.5 && (!estado.p || c === estado.p));
for (const c of faltan.slice(0, 2)) notas.push(`En ${provNombre(c)}, ${pct(100 - doc.provincias[c].con)} de quienes votaron no tiene su circuito en el mapa.`);
if (doc.unidad === "departamento") {
if (!doc.oficial) notas.push(doc.fuente ? `Los votos salen de ${doc.fuente}. No hay un escrutinio oficial publicado como datos.` : `Los departamentos salen de ${FUENTES_DEPTOS[doc.origen]}, no del escrutinio definitivo.`);
if (doc.aviso) notas.push(doc.aviso);
if (doc.reune != null && doc.reune < 95) notas.push(`Hay datos de ${el.provincias.length} jurisdicciones, que reúnen ${pct(doc.reune)} de los votos que publica el resultado nacional de esa elección.`);
else if (doc.reune != null && doc.reune > 102) notas.push(`Estos datos suman ${pct(doc.reune)} de los votos que publica el resultado nacional de esa elección: las dos fuentes no coinciden exacto.`);
const lejos = el.provincias.filter(c => doc.provincias[c]?.suma != null && Math.abs(doc.provincias[c].suma - 100) > 3 && (!estado.p || c === estado.p));
if (estado.p && lejos.length) notas.push(`En ${provNombre(estado.p)}, esta base suma ${pct(doc.provincias[estado.p].suma)} de los votos positivos del definitivo.`);
else if (lejos.length) notas.push(`En ${lejos.length === 1 ? `${provNombre(lejos[0])}, esta base no suma` : `${lejos.length} jurisdicciones, esta base no suma`} lo mismo que el definitivo: la diferencia pasa de 3%.`);
const enteras = el.provincias.filter(c => doc.provincias[c]?.nivel === "provincia" && c !== "02" && (!estado.p || c === estado.p)).map(provNombre);
if (enteras.length) notas.push(`En ${enteras.join(", ").replace(/, ([^,]*)$/, " y $1")} no hay resultados por departamento en esta elección: se pinta la jurisdicción entera.`);
if ((doc.caba_entera ?? doc.periodo !== "dep2010") && (!estado.p || estado.p === "02")) notas.push("CABA se pinta entera: sus datos son por circunscripción y esos límites no están publicados.");
}
$("ms-mapa-nota").textContent = notas.join(" ");
const elegido = estado.c ? MAPA.rasgos.filter(r => { const f = MAPA.indice.get(claveRasgo(r)); return f && circuitosMesa(f).includes(`${estado.s}|${estado.c}`); })
: estado.s && unidad === "departamento" ? MAPA.rasgos.filter(r => { const f = MAPA.indice.get(claveRasgo(r)); return f && seccionDe(f) === estado.s; }) : [];
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
const lista = IDX.elecciones.filter(e => e.cargo === el.cargo).sort((a, b) => a.anio - b.anio || (a.vuelta === "segunda" ? 1 : -1));
const i = lista.findIndex(e => e.id === el.id);
const ant = $("ms-el-ant"), sig = $("ms-el-sig");
ant.disabled = i <= 0; sig.disabled = i < 0 || i >= lista.length - 1;
ant.dataset.e = i > 0 ? lista[i - 1].id : ""; sig.dataset.e = lista[i + 1]?.id || "";
}
async function pintarMapa(el) {
const yo = ++MAPA.turno, caja = $("ms-mapa"), aviso = $("ms-mapa-falla");
if (!window.d3 || !window.topojson) { caja.hidden = true; return; }
caja.hidden = false;
aviso.hidden = true;
try {
let doc = await bajarJSON(`mapa/${el.id}.json`);
if (estado.p && doc.provincias[estado.p]?.circuitos)
doc = await bajarJSON(`mapa/${el.id}/${estado.p}.json`).catch(e => { console.warn("Elecciones por mesa, el mapa por circuito:", e); return doc; });
const ed = estado.p ? doc.provincias[estado.p]?.ed : "";
if (estado.p && !ed) throw new Error(`mapa/${el.id}.json: falta ${estado.p}`);
const ruta = doc.periodo === "provincias" ? "geo/provincias.topo.json" : estado.p ? `geo/${ed}/${estado.p}.topo.json` : `geo/pais-${doc.periodo}.topo.json`;
const topo = await bajarJSON(ruta);
const base = unidadDe(doc) === "circuito" && doc.periodo !== "provincias" ? await bajarJSON("geo/base.topo.json").catch(e => { console.warn("Elecciones por mesa, el fondo del mapa:", e); return null; }) : null;
if (yo !== MAPA.turno) return;
MAPA.doc = doc;
if (!doc.indice) doc.indice = indexar(doc);
if (!doc.secciones && unidadDe(doc) === "circuito") doc.secciones = porSeccion(doc);
MAPA.indice = doc.indice;
if (MAPA.ruta !== ruta || !MAPA.svg || MAPA.conFondo !== !!base) armarLienzo(doc, topo, ruta, base);
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
const DEF = el.definitivo ? await tablaPais(el.id, "definitivo.csv").catch(e => { console.warn("Elecciones por mesa, el definitivo:", e); return null; }) : null;
if (estado.p && !el.provincias.includes(estado.p)) {
aviso = el.sin_fuente?.includes(estado.p) ? `${provNombre(estado.p)} eligió ${NIVEL_NOMBRE[el.cargo]} en ${el.anio}, pero no hay un escrutinio oficial publicado en línea: se muestra todo el país.`
: el.origen ? `${provNombre(estado.p)}: ${el.fuera.charAt(0).toLowerCase()}${el.fuera.slice(1)}. Se muestra todo el país.`
: `${provNombre(estado.p)} no eligió ${NIVEL_NOMBRE[el.cargo]} en ${el.anio}: se muestra todo el país.`;
Object.assign(estado, {p: "", s: "", c: "", m: ""});
}
const hayTabla = porMesa(el, estado.p) || (el.nivel === "departamento" && el.departamentos?.includes(estado.p));
if (!hayTabla && estado.s) Object.assign(estado, {s: "", c: "", m: ""});
if (!porMesa(el, estado.p)) Object.assign(estado, {c: "", m: ""});
const D = estado.p && hayTabla ? await tablaProvincia(el.id, estado.p) : null;
if (D) {
if (estado.s && MAPA.seccion && !D.filas.some(f => f.s === estado.s)) {
const igual = D.filas.find(f => nombreLugar(f.sn) === MAPA.seccion);
if (igual) estado.s = igual.s;
}
const hay = (s, c, m) => D.filas.some(f => f.s === s && (!c || f.c === c) && (!m || f.m === m));
if (estado.m && !hay(estado.s, estado.c, estado.m)) { aviso = `La mesa ${estado.m} no existe en ese circuito en esta elección: se muestra el circuito. Los números de mesa cambian en cada elección.`; estado.m = ""; }
if (estado.c && !hay(estado.s, estado.c)) { aviso = `El circuito ${estado.c} no figura con ese código en esta elección: se muestra la sección.`; estado.c = ""; estado.m = ""; }
if (estado.s && !hay(estado.s)) { aviso = "Esa sección no figura en esta elección: se muestra la provincia."; Object.assign(estado, {s: "", c: "", m: ""}); }
}
let H = null;
if (D && estado.s && el.nivel === "mesa") H = await tablaHistoria(estado.p).catch(e => { console.warn("Elecciones por mesa:", e); return FALLO_HISTORIA; });
if (yo !== turno) return;
MAPA.seccion = D && estado.s ? nombreLugar(D.filas.find(f => f.s === estado.s).sn) : "";
pintarControles(el, D);
pintar(el, P, D, H, aviso, DEF);
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
const suyas = cargo === "gobernador" && estado.p ? candidatas.filter(e => e.provincias.includes(estado.p)) : [];
const misma = candidatas.find(e => e.anio === ahora.anio && e.vuelta === "general" && (!suyas.length || e.provincias.includes(estado.p))) || suyas[0] || candidatas[0];
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
if (q.get("pais")) estado.ext = q.get("pais");
if (q.get("f")) MAPA.fuerza = q.get("f");
escuchar();
escucharMapa();
actualizar(false);
}
arrancar();
})();
