// Prueba del MCP y la API de datos de Datina (plan técnico, fase 3, 14 de noviembre de 2026, docs/ia/MCP.md): node scripts/prueba_datos_api.mjs
// Corre las funciones de verdad (functions/api/mcp.js y functions/api/datos/[[ruta]].js) contra los archivos ya armados de sitio/ (hace falta
// correr antes 03_construir_sitio.py), sin red. Controla el protocolo MCP (initialize, tools/list, tools/call, notificaciones, errores), las
// mismas consultas por la API, los filtros por jurisdicción y período, los topes, que cada respuesta lleve fuente, fecha, licencia y ficha, y
// que nunca salga nada sensible: ni las tablas de suicidio ni la de muertes violentas, ni una columna, una fila o un indicador sobre suicidio,
// ni las tablas sin la licencia de Datina (COMNAP), ni Elecciones por mesa. También mide cuánto procesador gasta cada consulta.
import { readFileSync, existsSync } from "node:fs";
import { join, dirname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { onRequest as mcp } from "../functions/api/mcp.js";
import { onRequest as api } from "../functions/api/datos/[[ruta]].js";
import { TOPES, codigoJuris } from "../functions/_datos/datos.mjs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITIO_DIR = join(RAIZ, "sitio");
const BASE = "https://datina.prueba";
let fallas = 0, casos = 0;
const ok = (cond, que) => { casos++; if (!cond) { fallas++; console.log("FALLA: " + que); } };
const SUICIDIO = /suicid|autoinflig|autolesi/i;

// lo que hace Cloudflare con env.ASSETS: devuelve el archivo publicado, o 404
const ASSETS = {fetch: async u => {
  const ruta = normalize(decodeURIComponent(new URL(u).pathname));
  const p = join(SITIO_DIR, ruta);
  if (!p.startsWith(SITIO_DIR) || !existsSync(p)) return new Response("", {status: 404});
  return new Response(readFileSync(p));
}};
const llamarMCP = async (cuerpo, metodo = "POST") => {
  const r = await mcp({request: new Request(`${BASE}/api/mcp`, {method: metodo, headers: {"Content-Type": "application/json", Accept: "application/json, text/event-stream"},
    body: metodo === "POST" ? (typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo)) : undefined}), env: {ASSETS}});
  return {estado: r.status, cuerpo: r.status === 202 || r.status === 204 ? null : await r.json(), r};
};
let id = 0;
const herramienta = async (name, args = {}) => (await llamarMCP({jsonrpc: "2.0", id: ++id, method: "tools/call", params: {name, arguments: args}})).cuerpo.result;
const llamarAPI = async (ruta, metodo = "GET") => {
  const u = new URL(`${BASE}/api/datos/${ruta}`);
  const r = await api({request: new Request(u, {method: metodo}), env: {ASSETS}, params: {ruta: u.pathname.replace(/^\/api\/datos\/?/, "").split("/").filter(Boolean)}});
  return {estado: r.status, cuerpo: r.status === 204 ? null : await r.json(), r};
};

if (!existsSync(join(SITIO_DIR, "datos", "catalogo.json")) || !existsSync(join(SITIO_DIR, "datos", "indicadores.json"))) {
  console.log("Falta el sitio armado (sitio/datos/catalogo.json e indicadores.json): correr antes python scripts/03_construir_sitio.py");
  process.exit(1);
}
const CAT = JSON.parse(readFileSync(join(SITIO_DIR, "datos", "catalogo.json"), "utf-8"));
const IND = JSON.parse(readFileSync(join(SITIO_DIR, "datos", "indicadores.json"), "utf-8"));

// ---------- el protocolo MCP ----------
const ini = await llamarMCP({jsonrpc: "2.0", id: ++id, method: "initialize", params: {protocolVersion: "2025-06-18", capabilities: {}, clientInfo: {name: "prueba", version: "1"}}});
ok(ini.estado === 200 && ini.cuerpo.result?.protocolVersion === "2025-06-18", "initialize contesta con la versión pedida");
ok(ini.cuerpo.result?.capabilities?.tools && ini.cuerpo.result?.serverInfo?.name === "datina", "initialize ofrece herramientas y se presenta como datina");
ok(/suicidio/.test(ini.cuerpo.result?.instructions || ""), "las instrucciones avisan que no hay datos sobre suicidio");
const iniVieja = await llamarMCP({jsonrpc: "2.0", id: ++id, method: "initialize", params: {protocolVersion: "1999-01-01"}});
ok(iniVieja.cuerpo.result?.protocolVersion === "2025-06-18", "con una versión desconocida propone la suya");
const notif = await llamarMCP({jsonrpc: "2.0", method: "notifications/initialized"});
ok(notif.estado === 202 && notif.cuerpo === null, "una notificación se contesta con 202 y sin cuerpo");
ok((await llamarMCP({jsonrpc: "2.0", id: ++id, method: "ping"})).cuerpo.result !== undefined, "ping");
const lista = (await llamarMCP({jsonrpc: "2.0", id: ++id, method: "tools/list"})).cuerpo.result.tools;
ok(lista.map(t => t.name).join() === "buscar_tablas,describir_tabla,leer_tabla,buscar_indicadores,leer_indicador", "las cinco herramientas, en orden");
ok(lista.every(t => t.inputSchema?.type === "object" && t.annotations?.readOnlyHint === true && t.description), "cada herramienta con su esquema, su descripción y de solo lectura");
ok((await llamarMCP({jsonrpc: "2.0", id: ++id, method: "no/existe"})).cuerpo.error?.code === -32601, "un método desconocido da -32601");
ok((await llamarMCP("{esto no es json")).cuerpo.error?.code === -32700, "un cuerpo que no es JSON da -32700");
ok((await llamarMCP([{jsonrpc: "2.0", id: 1, method: "ping"}])).cuerpo.error?.code === -32600, "un lote de pedidos da -32600");
ok((await llamarMCP({jsonrpc: "2.0", id: ++id, method: "tools/call", params: {name: "borrar_todo"}})).cuerpo.error?.code === -32602, "una herramienta que no existe da -32602");
ok((await llamarMCP(null, "GET")).estado === 405, "GET /api/mcp da 405 (no hay SSE)");
const pre = await llamarMCP(null, "OPTIONS");
ok(pre.estado === 204 && pre.r.headers.get("Access-Control-Allow-Origin") === "*", "OPTIONS contesta el CORS");

// ---------- buscar, describir y leer ----------
const b = await herramienta("buscar_tablas", {q: "empleo privado registrado provincia"});
ok(!b.isError && b.structuredContent.tablas.some(t => t.tabla === "empleo_provincias"), "buscar empleo privado encuentra empleo_provincias");
ok(b.structuredContent.tablas.length <= TOPES.resultados && b.structuredContent.tablas.every(t => t.ficha?.startsWith("https://")), "hasta 25 resultados, cada uno con su ficha");
const todas = (await herramienta("buscar_tablas", {limite: 100})).structuredContent;
ok(todas.total > 200, `sin palabras lista todas las tablas que se ofrecen (${todas.total})`);
const d = (await herramienta("describir_tabla", {tabla: "empleo_provincias"})).structuredContent;
ok(d.fuente && d.licencia && d.ficha && d.como_citar && d.datos_actualizados && d.origen?.length, "describir trae fuente, licencia, ficha, cita, fecha y origen");
ok(d.origen.every(o => "descargado" in o || "armado" in o), "cada archivo de origen con su fecha (de descarga o de armado)");
ok(!("sensible" in d) && !("uso_libre" in d), "describir no muestra los campos internos");
const l = (await herramienta("leer_tabla", {tabla: "empleo_provincias", jurisdiccion: ["Córdoba", "2"]})).structuredContent;
const ci = l.columnas.indexOf("codigo_indec");
ok(l.total === 2 && l.filas.map(f => f[ci]).sort().join() === "02,14", "leer filtra por nombre y por código de una cifra");
ok(l.fuente && l.licencia && l.ficha && l.datos_actualizados && l.descargas?.length, "leer trae fuente, licencia, ficha, fecha y descargas");
const lc = (await herramienta("leer_tabla", {tabla: "empleo_provincias", columnas: ["territorio", "cada_100"]})).structuredContent;
ok(lc.columnas.join() === "territorio,cada_100" && lc.filas.length === 24, "leer con columnas elegidas");
const serie = CAT.tablas.find(t => t.tabla === "gas_usuario_serie") ? "gas_usuario_serie" : null;
if (serie) {
  const ls = (await herramienta("leer_tabla", {tabla: serie, jurisdiccion: ["00"], desde: "2020", hasta: "2022"})).structuredContent;
  const cp = ls.columnas.findIndex(c => ["periodo", "fecha", "anio"].includes(c));
  ok(ls.total > 0 && ls.filas.every(f => f[cp] >= "2020" && f[cp] < "2023"), `leer filtra por período (${serie}, 2020 a 2022)`);
}
const grande = CAT.tablas.filter(t => !t.sensible && t.uso_libre).sort((a, x) => x.filas - a.filas)[0];
const lg = (await herramienta("leer_tabla", {tabla: grande.tabla})).structuredContent;
ok(lg.filas.length === Math.min(TOPES.filas, lg.total) && (lg.total <= TOPES.filas || lg.avisos.length), `el tope de filas en la tabla más grande (${grande.tabla}, ${lg.total})`);
const err = await herramienta("leer_tabla", {tabla: "empleo_provincias", columnas: ["no_existe"]});
ok(err.isError && /no tiene no_existe/.test(err.content[0].text), "una columna que no existe es un error de la herramienta, con las que hay");
ok((await herramienta("describir_tabla", {tabla: "no_existe"})).isError, "una tabla que no existe es un error de la herramienta");
ok(codigoJuris("Tierra del Fuego") === "94" && codigoJuris("CABA") === "02" && codigoJuris("país") === "00" && codigoJuris("6") === "06", "nombres y códigos de jurisdicción");

// ---------- indicadores ----------
const bi = (await herramienta("buscar_indicadores", {q: "mortalidad infantil"})).structuredContent;
ok(bi.indicadores.some(i => i.variable === "tasa_mortalidad_infantil"), "buscar mortalidad infantil encuentra tasa_mortalidad_infantil");
const li = (await herramienta("leer_indicador", {variable: "tasa_mortalidad_infantil", jurisdiccion: ["Chaco"], desde: "2020"})).structuredContent;
ok(li.total > 0 && li.filas.every(f => f[0] === "22" && f[2] >= "2020" && typeof f[3] === "number"), "leer un indicador por provincia y desde un año, con valores numéricos");
ok(li.unidad && li.fuente && li.licencia && li.datos_actualizados, "el indicador trae unidad, fuente, licencia y fecha");
const nafta = (await herramienta("leer_indicador", {variable: "precio_nafta_super_surtidor"})).structuredContent;
ok(nafta.filas.length === TOPES.filas && nafta.avisos.length && nafta.total > TOPES.filas, "el tope en un indicador largo, con su aviso");

// ---------- nunca lo sensible ----------
const sensibles = CAT.tablas.filter(t => t.sensible).map(t => t.tabla);
ok(sensibles.includes("muertes_violentas"), "el catálogo marca muertes_violentas como sensible");
for (const t of [...sensibles, "suicidio_provincias", "suicidio_serie", "suicidio_edad_sexo"]) {
  ok((await herramienta("describir_tabla", {tabla: t})).isError && (await llamarAPI(`tablas/${t}`)).estado === 404, `la tabla ${t} no se ofrece`);
}
const comnap = CAT.tablas.filter(t => !t.uso_libre).map(t => t.tabla);
ok(comnap.length > 0, "hay tablas sin la licencia de Datina (COMNAP)");
for (const t of comnap) ok((await herramienta("leer_tabla", {tabla: t})).isError, `la tabla ${t}, sin la licencia de Datina, no se ofrece`);
ok(!todas.tablas.some(t => SUICIDIO.test(`${t.tabla} ${t.titulo} ${t.descripcion}`)), "ninguna tabla de la lista habla de suicidio");
for (const q of ["suicidio", "suicidios provincia", "autolesiones"]) {
  const r = (await herramienta("buscar_tablas", {q})).structuredContent, ri = (await herramienta("buscar_indicadores", {q})).structuredContent;
  ok(!JSON.stringify(r.tablas).match(SUICIDIO) && !JSON.stringify(ri.indicadores).match(SUICIDIO), `buscar "${q}" no devuelve nada sobre suicidio`);
}
for (const v of ["victimas_suicidios", "tasa_suicidios_100mil_5_anios_y_mas", "bm_suicidio"]) {
  ok((await herramienta("leer_indicador", {variable: v})).isError, `el indicador ${v} no se ofrece`);
  ok(!existsSync(join(SITIO_DIR, "datos", "indicadores", v + ".csv")), `no hay archivo publicado para ${v}`);
}
ok(!IND.indicadores.some(i => SUICIDIO.test(`${i.variable} ${i.unidad} ${i.fuente}`)), "el índice de indicadores no tiene nada sobre suicidio");
// una tabla que se ofrece y tiene filas o columnas de suicidio (la comparación con la OCDE): no salen
const ocde = CAT.tablas.find(t => !t.sensible && t.uso_libre && t.tabla === "ocde_comparacion");
if (ocde) {
  const lo = (await herramienta("leer_tabla", {tabla: "ocde_comparacion", limite: TOPES.filas})).structuredContent;
  ok(!JSON.stringify(lo).match(SUICIDIO), "de ocde_comparacion no sale ninguna fila ni columna sobre suicidio");
  ok(!JSON.stringify((await herramienta("describir_tabla", {tabla: "ocde_comparacion"})).structuredContent.columnas).match(SUICIDIO), "ni en la descripción de sus columnas");
}
// Elecciones por mesa no está en el catálogo
ok(!CAT.tablas.some(t => t.tabla.startsWith("mesas")), "Elecciones por mesa no está en el catálogo");
ok((await herramienta("leer_tabla", {tabla: "../mesas/indice"})).isError, "no se puede salir de las tablas del catálogo con la ruta");

// ---------- la API: lo mismo en JSON ----------
const raiz = await llamarAPI("");
ok(raiz.estado === 200 && raiz.cuerpo.rutas && raiz.cuerpo.mcp === "/api/mcp", "/api/datos lista las rutas");
ok(raiz.r.headers.get("Access-Control-Allow-Origin") === "*" && /max-age/.test(raiz.r.headers.get("Cache-Control") || ""), "la API con CORS y caché");
const at = await llamarAPI("tablas?q=empleo%20privado%20registrado");
ok(at.cuerpo.tablas.some(t => t.tabla === "empleo_provincias"), "/api/datos/tablas?q= busca");
ok(JSON.stringify((await llamarAPI("tablas/empleo_provincias")).cuerpo) === JSON.stringify(d), "/api/datos/tablas/{tabla} da lo mismo que describir_tabla");
const af = await llamarAPI("tablas/empleo_provincias/filas?jurisdiccion=Córdoba,2");
ok(JSON.stringify(af.cuerpo) === JSON.stringify(l), "/api/datos/tablas/{tabla}/filas da lo mismo que leer_tabla");
ok((await llamarAPI("indicadores?q=mortalidad%20infantil")).cuerpo.indicadores.some(i => i.variable === "tasa_mortalidad_infantil"), "/api/datos/indicadores?q= busca");
ok(JSON.stringify((await llamarAPI("indicadores/tasa_mortalidad_infantil?jurisdiccion=Chaco&desde=2020")).cuerpo) === JSON.stringify(li), "/api/datos/indicadores/{variable} da lo mismo que leer_indicador");
ok((await llamarAPI("indicadores/victimas_suicidios")).estado === 404, "/api/datos no da el indicador de suicidio");
ok((await llamarAPI("tablas/empleo_provincias/otra/cosa")).estado === 404 && (await llamarAPI("cualquiera")).estado === 404, "una dirección que no existe da 404");
ok((await llamarAPI("", "POST")).estado === 405, "la API no acepta POST");
ok((await llamarAPI("tablas/..%2F..%2Findex")).estado === 404, "un nombre de tabla con ../ no sale del catálogo");

// ---------- procesador ----------
// Cloudflare da 10 ms por pedido en el plan gratis (no cuenta la espera por los archivos). Acá se mide el tiempo total de cada consulta,
// con la lectura de los archivos incluida, así que es una cota de arriba: solo avisa si alguna pasa de 50 ms
const medir = async (que, f) => { const t0 = performance.now(); for (let i = 0; i < 5; i++) await f(); return [que, (performance.now() - t0) / 5]; };
const tiempos = [await medir("buscar_tablas", () => herramienta("buscar_tablas", {q: "salario provincia"})),
  await medir("leer_tabla empleo_provincias", () => herramienta("leer_tabla", {tabla: "empleo_provincias"})),
  await medir(`leer_tabla ${grande.tabla} (la más grande)`, () => herramienta("leer_tabla", {tabla: grande.tabla, jurisdiccion: ["14"]})),
  await medir("leer_indicador nafta (el más largo)", () => herramienta("leer_indicador", {variable: "precio_nafta_super_surtidor", jurisdiccion: ["14"]}))];
for (const [que, ms] of tiempos) ok(ms < 50, `${que}: ${ms.toFixed(1)} ms`);

console.log(tiempos.map(([q, ms]) => `${q}: ${ms.toFixed(1)} ms`).join(". ") + ".");
if (fallas) { console.log(`MCP y API de datos: ${fallas} de ${casos} controles fallaron.`); process.exit(1); }
console.log(`MCP y API de datos: ${casos} controles bien.`);
