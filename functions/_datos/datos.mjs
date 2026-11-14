// Los datos de Datina para otros programas (plan técnico, fase 3, 14 de noviembre de 2026, docs/ia/MCP.md): un servidor MCP de solo lectura
// (POST /api/mcp, functions/api/mcp.js) y una API con las mismas consultas (GET /api/datos/..., functions/api/datos/[[ruta]].js).
// Lee solo los archivos que ya publica el sitio: sitio/datos/catalogo.json (las tablas del Catálogo, de 03_construir_sitio.py), cada tabla
// en CSV, sitio/datos/indicadores.json y sitio/datos/indicadores/ (un archivo por indicador de la tabla larga). No usa base de datos, ni
// claves, ni escribe nada. Cada respuesta lleva la fuente, la fecha de los datos, la licencia y la dirección de la ficha.
//
// Lo que nunca sale (CLAUDE.md, "Temas sensibles", y decisión 5 del autor del 11 de noviembre de 2026):
// - las tablas sensibles del catálogo ("sensible": las que hablan de suicidio, también la de muertes violentas) y las que no tienen la
//   licencia de Datina ("uso_libre": false, las listas de COMNAP)
// - de cualquier tabla, una columna o una fila que nombre el suicidio (filasCSV de functions/_ia/consulta.mjs)
// - las variables de suicidio de la tabla larga: 03 no les escribe archivo ni entrada en el índice, y acá tampoco se ofrecen
// - Elecciones por mesa: no está en el catálogo (el plan pide antes marcar el origen de cada elección, oficial o de 257arg)
// La prueba, sin red: node scripts/prueba_datos_api.mjs
import { SIN_SUICIDIO, COLS_PERIODO, clavePeriodo, normal, filasCSV } from "../_ia/consulta.mjs";

export const VERSION = "1.0.0";
export const TOPES = {filas: 500, resultados: 25, texto: 120};
// las versiones del protocolo MCP que entiende este servidor (la primera es la que propone)
export const PROTOCOLOS = ["2025-06-18", "2025-03-26", "2024-11-05"];
const LICENCIA_CORTA = "Creative Commons Atribución 4.0 (CC BY 4.0), citando a Datina y a la fuente de cada dato";

// ---------- jurisdicciones: el código del INDEC, o el nombre con o sin tildes ----------
const JURIS = {"00": ["argentina", "pais", "total del pais", "total"], "02": ["caba", "ciudad de buenos aires", "capital federal", "ciudad autonoma de buenos aires"],
  "06": ["buenos aires", "provincia de buenos aires"], "10": ["catamarca"], "14": ["cordoba"], "18": ["corrientes"], "22": ["chaco"], "26": ["chubut"],
  "30": ["entre rios"], "34": ["formosa"], "38": ["jujuy"], "42": ["la pampa"], "46": ["la rioja"], "50": ["mendoza"], "54": ["misiones"],
  "58": ["neuquen"], "62": ["rio negro"], "66": ["salta"], "70": ["san juan"], "74": ["san luis"], "78": ["santa cruz"], "82": ["santa fe"],
  "86": ["santiago del estero"], "90": ["tucuman"], "94": ["tierra del fuego", "tierra del fuego, antartida e islas del atlantico sur"]};
const POR_NOMBRE = new Map(Object.entries(JURIS).flatMap(([c, ns]) => ns.map(n => [n, c])));
// "14", "4", "Córdoba" o "cordoba" -> "14". Lo que no se reconoce queda como vino (puede ser un aglomerado, "AGLO")
export function codigoJuris(v) {
  const t = String(v).trim();
  if (/^\d{1,2}$/.test(t)) return t.padStart(2, "0");
  return POR_NOMBRE.get(normal(t)) || t.toUpperCase();
}
const lista = v => (Array.isArray(v) ? v : String(v ?? "").split(",")).map(x => String(x).trim()).filter(Boolean);

// ---------- lo publicado ----------
async function leerJSON(leer, ruta) {
  const r = await leer(ruta);
  if (!r.ok) throw new ErrorDatos(`No se pudo leer ${ruta}.`, 503);
  return r.json();
}
class ErrorDatos extends Error {
  constructor(mensaje, estado = 400) { super(mensaje); this.estado = estado; }
}
// las tablas que se ofrecen: las del índice chico que escribe 03 (sitio/datos/catalogo_api.json, ya sin las sensibles ni las que no tienen la
// licencia de Datina), y otra vez sin nada que nombre el suicidio, por si llegara. Leer el catálogo entero (800 KB) gastaba la mitad de los
// 10 ms de procesador que Cloudflare da a cada pedido
export async function cargarCatalogo(leer) {
  const c = await leerJSON(leer, "/datos/catalogo_api.json");
  const tablas = new Map();
  for (const t of c.tablas || []) {
    if (SIN_SUICIDIO.test(`${t.tabla} ${t.titulo} ${t.descripcion}`)) continue;
    tablas.set(t.tabla, {...t, columnas: (t.columnas || []).filter(x => !SIN_SUICIDIO.test(x))});
  }
  return {tablas, actualizado: c.datos_actualizados};
}
export async function cargarIndicadores(leer) {
  const d = await leerJSON(leer, "/datos/indicadores.json");
  const ind = new Map((d.indicadores || []).filter(i => !SIN_SUICIDIO.test(`${i.variable} ${i.unidad} ${i.fuente}`)).map(i => [i.variable, i]));
  return {ind, actualizado: d.datos_actualizados};
}

// ---------- buscar ----------
// cuántas palabras de la búsqueda aparecen en el texto de cada tabla o indicador (sin tildes ni mayúsculas): primero las que tienen más
const palabras = q => normal(q).split(/[^a-z0-9ñ]+/).filter(w => w.length > 2 && !["los", "las", "del", "que", "por", "con", "una", "cada", "para", "como", "cual", "cuanto", "cuantos", "cuantas"].includes(w));
// `t` ya viene sin tildes ni mayúsculas: el campo "buscar" del índice, que arma 03 (sacar las tildes de 260 tablas en cada pedido gastaba 4 ms)
function puntaje(q, t) {
  const ws = palabras(q);
  return ws.reduce((n, w) => n + (t.includes(w) ? (w.length > 4 ? 2 : 1) : (w.length > 5 && t.includes(w.slice(0, -2)) ? 1 : 0)), 0);
}
const resumenTabla = t => ({tabla: t.tabla, titulo: t.titulo, descripcion: t.descripcion, seccion: t.seccion, cobertura: t.cobertura,
  periodo: t.periodo || null, anio_desde: t.anio_desde ?? null, anio_hasta: t.anio_hasta ?? null, ficha: t.ficha});

export async function buscarTablas(leer, {q = "", seccion = "", limite = TOPES.resultados} = {}) {
  const {tablas, actualizado} = await cargarCatalogo(leer);
  let todas = [...tablas.values()];
  if (seccion) todas = todas.filter(t => normal(t.seccion) === normal(seccion));
  const n = Math.min(Math.max(+limite || TOPES.resultados, 1), 100);
  const con = q.trim()
    ? todas.map(t => [puntaje(q, t.buscar), t]).filter(([p]) => p > 0).sort((a, b) => b[0] - a[0]).map(([, t]) => t)
    : todas;
  return {consulta: q, total: con.length, tablas: con.slice(0, n).map(resumenTabla), datos_actualizados: actualizado,
          ayuda: "describir_tabla da las columnas, la fuente y de dónde sale cada tabla, y leer_tabla sus filas."};
}

// la descripción completa sale del .metadata.json de la tabla (3 KB), solo si la tabla está en el índice de las que se ofrecen
export async function describirTabla(leer, tabla) {
  const {tablas} = await cargarCatalogo(leer);
  const t = tablas.get(String(tabla || "").replace(/\.csv$/, ""));
  if (!t) throw new ErrorDatos(`No hay una tabla "${tabla}" que se pueda leer. Buscala con buscar_tablas.`, 404);
  const m = await leerJSON(leer, `/datos/${t.tabla}.metadata.json`);
  return {...m, tabla: t.tabla, csv: `/datos/${t.tabla}.csv`, columnas: (m.columnas || []).filter(x => !SIN_SUICIDIO.test(x.nombre))};
}

// ---------- leer una tabla ----------
export async function leerTabla(leer, tabla, {jurisdiccion = [], desde = "", hasta = "", columnas = [], limite = TOPES.filas} = {}) {
  const t = await describirTabla(leer, tabla);
  const r = await leer(`/datos/${t.tabla}.csv`);
  if (!r.ok) throw new ErrorDatos(`No se pudo leer la tabla ${t.tabla}.`, 503);
  const juris = lista(jurisdiccion).map(codigoJuris), cols = lista(columnas), avisos = [];
  const d = String(desde || "").trim(), h = String(hasta || "").trim(), n = Math.min(Math.max(+limite || TOPES.filas, 1), TOPES.filas);
  // prefiltros baratos: las líneas que no nombran ninguna de las jurisdicciones pedidas (si la tabla tiene codigo_indec) o ningún año del
  // período pedido no se separan en campos, que es lo que gasta procesador. Los filtros de abajo siguen decidiendo
  const texto = await r.text();
  // en una tabla sin codigo_indec el filtro por jurisdicción no se aplica (lo dice el aviso): se lee como si no lo hubiera
  const conCodigo = /^\uFEFF?[^\n]*\bcodigo_indec\b/.test(texto);
  if (juris.length && !conCodigo) { avisos.push("Esta tabla no tiene una columna codigo_indec: no se filtró por jurisdicción."); juris.length = 0; }
  const pres = [];
  if (juris.length && /^﻿?[^\n]*\bcodigo_indec\b/.test(texto)) pres.push(new RegExp(juris.map(c => `(^|,)"?0?${c.replace(/^0/, "")}"?(,|$)`).join("|")));
  const a0 = +(d.match(/^\d{4}/) || [0])[0], a1 = +(h.match(/^\d{4}/) || [new Date().getFullYear() + 1])[0];
  if (a0 && a1 >= a0 && a1 - a0 < 40) pres.push(new RegExp(Array.from({length: a1 - a0 + 1}, (_, i) => a0 + i).join("|")));
  // sin filtros, se separan solo las filas que se devuelven: las demás solo se cuentan
  const sinFiltro = !juris.length && !d && !h;
  const leida = filasCSV(texto, pres.length ? l => pres.every(x => x.test(l)) : () => true, sinFiltro ? n : Infinity);
  const usar = leida.cab.map((c, i) => SIN_SUICIDIO.test(c) ? -1 : i).filter(i => i >= 0);
  const cab = usar.map(i => leida.cab[i]);
  let filas = leida.filas.map(f => usar.map(i => f[i] ?? ""));
  const pos = c => cab.indexOf(c);
  const faltan = cols.filter(c => pos(c) < 0);
  if (faltan.length) throw new ErrorDatos(`La tabla ${t.tabla} no tiene ${faltan.join(", ")}. Sus columnas: ${cab.join(", ")}.`);
  if (juris.length) {
    const ci = pos("codigo_indec"), s = new Set(juris);
    filas = filas.filter(f => s.has(codigoJuris(f[ci])));
  }
  if (d || h) {
    const cp = COLS_PERIODO.map(pos).find(i => i >= 0);
    if (cp === undefined || !filas.some(f => /^\d{4}/.test(clavePeriodo(f[cp] ?? "")))) avisos.push("Esta tabla no tiene una columna de período con años: no se aplicaron desde ni hasta.");
    else filas = filas.filter(f => { const k = clavePeriodo(f[cp] ?? ""); return /^\d{4}/.test(k) && (!d || k >= d) && (!h || k <= h + "￿"); });
  }
  const total = sinFiltro ? leida.total : filas.length;
  if (total > n) { filas = filas.slice(0, n); avisos.push(`Se devuelven las primeras ${n} de ${total} filas: filtrá por jurisdicción o por período para ver el resto.`); }
  const sel = cols.length ? cols.map(pos) : cab.map((_, i) => i);
  return {tabla: t.tabla, titulo: t.titulo, descripcion: t.descripcion, columnas: sel.map(i => cab[i]), filas: filas.map(f => sel.map(i => f[i])),
          total, avisos, ...procedencia(t)};
}
// lo que acompaña a todo dato: de dónde sale, de cuándo es, cómo se puede usar y dónde verlo en el sitio
const procedencia = t => ({fuente: t.fuente, organismos: t.organismos, actualizacion: t.actualizacion || null,
  descargas: (t.origen || []).map(o => ({archivo: o.archivo.split("/").pop(), organismo: o.organismo,
    fecha: o.descargado ?? o.armado ?? null, ...(o.estado && o.estado !== "ok" ? {aviso: "la última actualización no pudo bajarlo: es el de una descarga anterior"} : {})})),
  datos_actualizados: t.datos_actualizados, licencia: t.licencia || LICENCIA_CORTA, licencia_url: t.licencia_url, ficha: t.ficha, como_citar: t.como_citar});

// ---------- indicadores de la tabla larga ----------
export async function buscarIndicadores(leer, {q = "", limite = TOPES.resultados} = {}) {
  const {ind, actualizado} = await cargarIndicadores(leer);
  const n = Math.min(Math.max(+limite || TOPES.resultados, 1), 100);
  const todos = [...ind.values()];
  const con = q.trim() ? todos.map(i => [puntaje(q, normal(`${i.variable.replace(/_/g, " ")} ${i.unidad} ${i.fuente}`)), i]).filter(([p]) => p > 0)
    .sort((a, b) => b[0] - a[0]).map(([, i]) => i) : todos;
  return {consulta: q, total: con.length, datos_actualizados: actualizado,
          indicadores: con.slice(0, n).map(({variable, unidad, fuente, desde, hasta, ficha}) => ({variable, unidad, fuente, desde, hasta, ficha}))};
}
export async function leerIndicador(leer, variable, {jurisdiccion = [], desde = "", hasta = "", limite = TOPES.filas} = {}) {
  const {ind, actualizado} = await cargarIndicadores(leer);
  const i = ind.get(String(variable || ""));
  if (!i) throw new ErrorDatos(`No hay un indicador "${variable}" que se pueda leer. Buscalo con buscar_indicadores.`, 404);
  const r = await leer(`/datos/indicadores/${i.variable}.csv`);
  if (!r.ok) throw new ErrorDatos(`No se pudo leer el indicador ${i.variable}.`, 503);
  const juris = new Set(lista(jurisdiccion).map(codigoJuris)), d = String(desde || "").trim(), h = String(hasta || "").trim();
  let filas = filasCSV(await r.text()).filas.filter(f => (!juris.size || juris.has(f[0])) &&
    (!d || clavePeriodo(f[2]) >= d) && (!h || clavePeriodo(f[2]) <= h + "￿"));
  const total = filas.length, n = Math.min(Math.max(+limite || TOPES.filas, 1), TOPES.filas), avisos = [];
  if (total > n) { filas = filas.slice(-n); avisos.push(`Se devuelven las últimas ${n} de ${total} filas: filtrá por jurisdicción o por período para ver el resto.`); }
  return {variable: i.variable, unidad: i.unidad, columnas: ["codigo_indec", "territorio", "periodo", "valor"],
          filas: filas.map(f => [f[0], f[1], f[2], f[3] === "" ? null : +f[3]]), total, avisos,
          fuente: i.fuente, datos_actualizados: actualizado, licencia: LICENCIA_CORTA, licencia_url: "https://creativecommons.org/licenses/by/4.0/deed.es",
          ficha: i.ficha, tabla_completa: "/datos/tabla_larga.csv"};
}

// ---------- las herramientas del MCP ----------
const JURIS_DESC = "Jurisdicciones: códigos del INDEC (\"02\" CABA, \"06\" Buenos Aires, \"00\" el país) o nombres (\"Córdoba\"). Vacío para todas.";
const PERIODO_DESC = "Como está en la tabla: año (\"2020\"), año y mes (\"2020-03\") o fecha. Vacío para no limitar.";
export const HERRAMIENTAS = [
  {name: "buscar_tablas", title: "Buscar tablas",
   description: "Busca entre las tablas de Datina (estadísticas públicas de la Argentina y sus 24 jurisdicciones) por tema o palabras. Devuelve el nombre de cada tabla, la pregunta de su ficha, qué mide, la cobertura, los años y la dirección de la ficha.",
   inputSchema: {type: "object", properties: {q: {type: "string", description: "Palabras a buscar, por ejemplo \"desocupación provincias\". Vacío para listar todas."},
     seccion: {type: "string", description: "Sección del sitio, por ejemplo \"Trabajo\". Opcional."},
     limite: {type: "integer", minimum: 1, maximum: 100, description: "Cuántas tablas devolver (25 si no se dice)."}}},
   annotations: {readOnlyHint: true, openWorldHint: false}},
  {name: "describir_tabla", title: "Describir una tabla",
   description: "Describe una tabla de Datina: qué mide, sus columnas, la fuente y sus organismos, cada cuánto se actualiza, el período, de qué archivos sale y cuándo se bajaron, la licencia y cómo citarla.",
   inputSchema: {type: "object", required: ["tabla"], properties: {tabla: {type: "string", description: "Nombre exacto de la tabla, como lo da buscar_tablas."}}},
   annotations: {readOnlyHint: true, openWorldHint: false}},
  {name: "leer_tabla", title: "Leer una tabla",
   description: `Lee las filas de una tabla de Datina, filtradas por jurisdicción y período, con su fuente, su fecha y su licencia. Devuelve hasta ${TOPES.filas} filas.`,
   inputSchema: {type: "object", required: ["tabla"], properties: {tabla: {type: "string"},
     jurisdiccion: {type: "array", items: {type: "string"}, description: JURIS_DESC},
     desde: {type: "string", description: `Primer período. ${PERIODO_DESC}`}, hasta: {type: "string", description: `Último período. ${PERIODO_DESC}`},
     columnas: {type: "array", items: {type: "string"}, description: "Las columnas que querés. Vacío para todas."},
     limite: {type: "integer", minimum: 1, maximum: TOPES.filas}}},
   annotations: {readOnlyHint: true, openWorldHint: false}},
  {name: "buscar_indicadores", title: "Buscar indicadores",
   description: "Busca entre los indicadores de la tabla larga de Datina (una serie por jurisdicción y período, con su unidad y su fuente).",
   inputSchema: {type: "object", properties: {q: {type: "string", description: "Palabras a buscar, por ejemplo \"mortalidad infantil\"."},
     limite: {type: "integer", minimum: 1, maximum: 100}}},
   annotations: {readOnlyHint: true, openWorldHint: false}},
  {name: "leer_indicador", title: "Leer un indicador",
   description: `Lee un indicador de la tabla larga de Datina por jurisdicción y período, con su unidad, su fuente y su licencia. Devuelve hasta ${TOPES.filas} filas, las más recientes.`,
   inputSchema: {type: "object", required: ["variable"], properties: {variable: {type: "string", description: "Nombre exacto, como lo da buscar_indicadores."},
     jurisdiccion: {type: "array", items: {type: "string"}, description: JURIS_DESC},
     desde: {type: "string", description: `Primer período. ${PERIODO_DESC}`}, hasta: {type: "string", description: `Último período. ${PERIODO_DESC}`},
     limite: {type: "integer", minimum: 1, maximum: TOPES.filas}}},
   annotations: {readOnlyHint: true, openWorldHint: false}},
];
const EJECUTAR = {
  buscar_tablas: (leer, a) => buscarTablas(leer, a),
  describir_tabla: (leer, a) => describirTabla(leer, a.tabla),
  leer_tabla: (leer, a) => leerTabla(leer, a.tabla, a),
  buscar_indicadores: (leer, a) => buscarIndicadores(leer, a),
  leer_indicador: (leer, a) => leerIndicador(leer, a.variable, a),
};
const INSTRUCCIONES = "Datina publica estadísticas públicas de la Argentina y de sus 24 jurisdicciones, cada una con su fuente oficial. Para contestar " +
  "con datos: buscar_tablas o buscar_indicadores, después describir_tabla y leer_tabla, o leer_indicador. Cada respuesta trae la fuente, la fecha y " +
  "la dirección de la ficha: citalas. Las cifras se redondean al mostrarlas, no antes. Correlación no es causalidad. No se ofrecen datos sobre suicidio.";

// ---------- respuestas HTTP ----------
const CORS = {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Protocol-Version, Mcp-Session-Id", "Access-Control-Max-Age": "86400"};
const json = (estado, cuerpo, extra = {}) => new Response(JSON.stringify(cuerpo), {status: estado,
  headers: {"Content-Type": "application/json; charset=utf-8", ...CORS, ...extra}});

// POST /api/mcp: JSON-RPC 2.0 por HTTP, sin sesión y sin SSE (cada pedido se contesta con un solo JSON)
export async function responderMCP(request, {leer}) {
  if (request.method === "OPTIONS") return new Response(null, {status: 204, headers: CORS});
  if (request.method !== "POST") return json(405, {error: "El servidor MCP de Datina contesta pedidos POST con JSON-RPC. Ver /api/datos para la API."}, {Allow: "POST, OPTIONS"});
  let m;
  try { m = await request.json(); } catch { return json(400, {jsonrpc: "2.0", id: null, error: {code: -32700, message: "El cuerpo no es JSON."}}); }
  if (Array.isArray(m)) return json(400, {jsonrpc: "2.0", id: null, error: {code: -32600, message: "Un pedido por vez."}});
  if (!m || m.jsonrpc !== "2.0" || typeof m.method !== "string") return json(400, {jsonrpc: "2.0", id: m?.id ?? null, error: {code: -32600, message: "Pedido JSON-RPC inválido."}});
  // una notificación (sin id) no lleva respuesta
  if (m.id === undefined) return new Response(null, {status: 202, headers: CORS});
  const ok = result => json(200, {jsonrpc: "2.0", id: m.id, result}), mal = (code, message) => json(200, {jsonrpc: "2.0", id: m.id, error: {code, message}});
  const p = m.params || {};
  switch (m.method) {
    case "initialize":
      return ok({protocolVersion: PROTOCOLOS.includes(p.protocolVersion) ? p.protocolVersion : PROTOCOLOS[0], capabilities: {tools: {listChanged: false}},
                 serverInfo: {name: "datina", title: "Datina: las 24 Argentinas en números", version: VERSION}, instructions: INSTRUCCIONES});
    case "ping": return ok({});
    case "tools/list": return ok({tools: HERRAMIENTAS});
    case "tools/call": {
      const f = EJECUTAR[p.name];
      if (!f) return mal(-32602, `No hay una herramienta "${p.name}". Las que hay: ${Object.keys(EJECUTAR).join(", ")}.`);
      try {
        const r = await f(leer, p.arguments || {});
        return ok({content: [{type: "text", text: JSON.stringify(r)}], structuredContent: r, isError: false});
      } catch (e) {
        if (!(e instanceof ErrorDatos)) console.log(JSON.stringify({mcp: "error", herramienta: p.name, error: String(e)}));
        return ok({content: [{type: "text", text: e instanceof ErrorDatos ? e.message : "No se pudo contestar. Probá de nuevo."}], isError: true});
      }
    }
    default: return mal(-32601, `Método desconocido: ${m.method}.`);
  }
}

// GET /api/datos/...: lo mismo que el MCP, en JSON
export const RUTAS = {
  "": "esta lista", "tablas?q=&seccion=&limite=": "buscar tablas", "tablas/{tabla}": "describir una tabla",
  "tablas/{tabla}/filas?jurisdiccion=14,02&desde=2020&hasta=2025&columnas=&limite=": "leer una tabla",
  "indicadores?q=&limite=": "buscar indicadores", "indicadores/{variable}?jurisdiccion=&desde=&hasta=&limite=": "leer un indicador",
};
export async function responderAPI(request, {leer, ruta = []}) {
  if (request.method === "OPTIONS") return new Response(null, {status: 204, headers: CORS});
  if (request.method !== "GET" && request.method !== "HEAD") return json(405, {error: "La API de Datina solo contesta GET."}, {Allow: "GET, HEAD, OPTIONS"});
  const u = new URL(request.url), q = k => u.searchParams.get(k) || "";
  const partes = (Array.isArray(ruta) ? ruta : String(ruta).split("/")).filter(Boolean).map(decodeURIComponent);
  const cache = {"Cache-Control": "public, max-age=600"};
  try {
    if (!partes.length) return json(200, {nombre: "API de datos de Datina", version: VERSION, base: "/api/datos/", rutas: RUTAS, mcp: "/api/mcp",
      licencia: LICENCIA_CORTA, aviso: "Solo lectura. No incluye datos sobre suicidio ni Elecciones por mesa."}, cache);
    const [a, b, c, ...resto] = partes;
    if (resto.length) throw new ErrorDatos("Esa dirección no existe. Ver /api/datos.", 404);
    if (a === "tablas" && !b) return json(200, await buscarTablas(leer, {q: q("q"), seccion: q("seccion"), limite: q("limite")}), cache);
    if (a === "tablas" && b && !c) return json(200, await describirTabla(leer, b), cache);
    if (a === "tablas" && b && c === "filas") return json(200, await leerTabla(leer, b, {jurisdiccion: q("jurisdiccion"), desde: q("desde"), hasta: q("hasta"),
      columnas: q("columnas"), limite: q("limite")}), cache);
    if (a === "indicadores" && !b) return json(200, await buscarIndicadores(leer, {q: q("q"), limite: q("limite")}), cache);
    if (a === "indicadores" && b && !c) return json(200, await leerIndicador(leer, b, {jurisdiccion: q("jurisdiccion"), desde: q("desde"), hasta: q("hasta"), limite: q("limite")}), cache);
    throw new ErrorDatos("Esa dirección no existe. Ver /api/datos.", 404);
  } catch (e) {
    if (e instanceof ErrorDatos) return json(e.estado, {error: e.message});
    console.log(JSON.stringify({api: "error", ruta: partes.join("/"), error: String(e)}));
    return json(500, {error: "No se pudo contestar. Probá de nuevo."});
  }
}
