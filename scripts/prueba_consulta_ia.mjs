// Prueba de las consultas con IA (25 de octubre de 2026, docs/ia/CONSULTAS.md): node scripts/prueba_consulta_ia.mjs
// Corre la función de verdad (functions/_ia/consulta.mjs, con la biblioteca de Anthropic empaquetada) contra una API simulada: cada
// respuesta del modelo está escrita acá como los eventos que manda la API, así no hace falta clave ni se gasta nada. Las tablas son las de
// sitio/datos/. Controla lo que se le pide a la API (modelo, caché, respaldo, herramienta), lo que recibe el modelo de cada tabla (filtros,
// topes y nada sobre suicidio), lo que llega a la página y los casos en que no contesta. Si existe sitio/datos/consulta_ia.json (armado con
// "consulta_ia": true), revisa también ese índice.
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "../functions/_ia/anthropic-sdk.mjs";
import { responder, leerTabla, cargarIndice, TOPES, MODELO } from "../functions/_ia/consulta.mjs";
import { onRequest } from "../functions/api/consulta.js";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATOS = join(RAIZ, "sitio", "datos");
const SITIO = "https://datina.prueba";
let fallas = 0, casos = 0;
const ok = (cond, que) => { casos++; if (!cond) { fallas++; console.log("FALLA: " + que); } };

// un índice chico con tablas reales: una por provincia y año con más filas que el tope, las dos que traen suicidios y una con comillas
const fila = (tabla, titulo, url, cobertura, periodo) => {
  const cab = readFileSync(join(DATOS, tabla + ".csv"), "utf-8").split("\n")[0].trim().split(",");
  return {tabla, titulo, descripcion: "Descripción de prueba", seccion: "Prueba", url, fuente: "Fuente de prueba.", actualizacion: "Se actualiza cada año.",
          cobertura, periodo, filas: 1, columnas: cab.map(c => [c, "Texto", "valores"]), unidades: [], nota: "Nota de prueba."};
};
const INDICE = {actualizado: "25/10/2026", tablas: [
  fila("gas_usuario_serie", "¿Cuánto gas usa cada usuario?", "energia.html#f-gas-usuario", "Las 24 jurisdicciones y el total del país", "1993 a 2025"),
  fila("muertes_violentas", "Muertes violentas", "seguridad.html#f-muertes", "Total del país", "2000 a 2024"),
  fila("ocde_comparacion", "¿Cómo está la Argentina frente a la OCDE?", "cruces.html#f-ocde", "Sin desglose territorial", "1995 a 2024"),
  fila("votaciones_leyes_clave", "¿Cómo votaron las leyes clave?", "politica.html#f-votaciones", "Sin desglose territorial", "2006 a 2025"),
]};
const leerDe = indice => async ruta => {
  if (ruta === "/datos/consulta_ia.json") return indice ? new Response(JSON.stringify(indice)) : new Response("", {status: 404});
  const m = ruta.match(/^\/datos\/(\w+)\.csv$/);
  if (m && existsSync(join(DATOS, m[1] + ".csv"))) return new Response(readFileSync(join(DATOS, m[1] + ".csv")));
  return new Response("", {status: 404});
};
const leer = leerDe(INDICE);

// ---------- la API simulada ----------
// cada respuesta: los bloques (texto, pedido de tabla o marca de respaldo), por qué terminó y los tokens. Devuelve lo que pidió cada llamada
function apiSimulada(respuestas) {
  const pedidos = [];
  const fetch = async (url, init) => {
    const cuerpo = JSON.parse(init.body);
    pedidos.push({url: String(url), cuerpo, cabeceras: Object.fromEntries(new Headers(init.headers))});
    const r = respuestas[Math.min(pedidos.length - 1, respuestas.length - 1)];
    if (r.estado) return new Response(JSON.stringify({type: "error", error: {type: "rate_limit_error", message: "muchas"}}),
                                      {status: r.estado, headers: {"content-type": "application/json"}});
    const ev = [];
    const sse = (tipo, datos) => ev.push(`event: ${tipo}\ndata: ${JSON.stringify({type: tipo, ...datos})}\n\n`);
    sse("message_start", {message: {id: "msg_" + pedidos.length, type: "message", role: "assistant", model: cuerpo.model, content: [],
                                    stop_reason: null, stop_sequence: null,
                                    usage: {input_tokens: 100, output_tokens: 1, cache_read_input_tokens: 50, cache_creation_input_tokens: 10}}});
    r.bloques.forEach((b, i) => {
      if (b.texto !== undefined) {
        sse("content_block_start", {index: i, content_block: {type: "text", text: ""}});
        for (const pedazo of b.texto.match(/.{1,12}/gs) || []) sse("content_block_delta", {index: i, delta: {type: "text_delta", text: pedazo}});
      } else if (b.tabla !== undefined) {
        sse("content_block_start", {index: i, content_block: {type: "tool_use", id: b.id, name: "leer_tabla", input: {}}});
        sse("content_block_delta", {index: i, delta: {type: "input_json_delta", partial_json: JSON.stringify(
          {tabla: b.tabla, columnas: b.columnas || [], filtros: b.filtros || [], desde: b.desde || "", hasta: b.hasta || ""})}});
      } else if (b.respaldo) {
        sse("content_block_start", {index: i, content_block: {type: "fallback", from: {model: cuerpo.model}, to: {model: "claude-opus-5"}}});
      }
      sse("content_block_stop", {index: i});
    });
    sse("message_delta", {delta: {stop_reason: r.fin, stop_sequence: null}, usage: {output_tokens: 20}});
    sse("message_stop", {});
    return new Response(ev.join(""), {status: 200, headers: {"content-type": "text/event-stream", "request-id": "req_prueba"}});
  };
  return {pedidos, cliente: new Anthropic({apiKey: "clave-de-prueba", fetch, maxRetries: 0})};
}

// lee todos los eventos que llegan a la página
async function eventos(resp) {
  const texto = await resp.text();
  return texto.split("\n").filter(Boolean).map(l => JSON.parse(l));
}
const pedir = (cuerpo, extra = {}) => new Request(SITIO + "/api/consulta", {method: "POST", headers: {"Content-Type": "application/json",
  Origin: SITIO, ...extra.cabeceras}, body: typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo)});
const consulta = async (respuestas, pregunta = "¿Cuánto gas usa cada usuario en la Ciudad?") => {
  const api = apiSimulada(respuestas);
  const espera = [];
  const resp = await responder(pedir({pregunta}), {env: {}, leer, cliente: api.cliente, esperar: p => espera.push(p)});
  const ev = await eventos(resp);
  await Promise.all(espera);
  return {api, ev, resp, texto: ev.filter(e => e.t === "texto").map(e => e.texto).join("")};
};
const silencio = async f => { const [l, e] = [console.log, console.error]; console.log = console.error = () => {}; try { return await f(); } finally { console.log = l; console.error = e; } };

// ---------- 1. una consulta completa: lee una tabla y contesta ----------
{
  const resp = "En la Ciudad de Buenos Aires cada usuario residencial usó 1.234,5 metros cúbicos de gas en 2025.\n\nFuente: Fuente de prueba.";
  const {api, ev, texto, resp: r} = await silencio(() => consulta([
    {bloques: [{tabla: "gas_usuario_serie", id: "toolu_1", filtros: [{columna: "codigo_indec", valores: ["00", "2"]}], desde: "2020"}], fin: "tool_use"},
    {bloques: [{texto: resp}], fin: "end_turn"},
  ]));
  ok(r.headers.get("Content-Type").startsWith("application/x-ndjson"), "la respuesta va como líneas de JSON");
  ok(texto === resp, "el texto que llega a la página es el que escribió el modelo");
  ok(ev.some(e => e.t === "paso" && e.texto === "Leyendo «¿Cuánto gas usa cada usuario?»…"), "avisa qué ficha está leyendo");
  const fu = ev.find(e => e.t === "fuentes");
  ok(fu && fu.fichas.length === 1 && fu.fichas[0].url === "energia.html#f-gas-usuario" && fu.fichas[0].tabla === "gas_usuario_serie", "manda la ficha consultada");
  ok(ev.at(-1).t === "fin", "termina con fin");
  ok(api.pedidos.length === 2, "dos llamadas a la API");
  const [p1, p2] = api.pedidos;
  ok(p1.url.endsWith("/v1/messages?beta=true") || p1.url.endsWith("/v1/messages"), "llama a /v1/messages");
  ok(p1.cuerpo.model === MODELO && MODELO === "claude-opus-5-5", "usa el modelo por omisión");
  ok(p1.cuerpo.stream === true, "pide la respuesta en vivo");
  ok(p1.cuerpo.max_tokens === TOPES.tokens, "con el tope de tokens");
  ok(p1.cuerpo.output_config?.effort === "medium", "con el esfuerzo explícito");
  ok(p1.cuerpo.thinking === undefined, "sin configurar el pensamiento (en Opus 5.5 siempre es adaptativo)");
  ok(p1.cuerpo.fallbacks === "default" && (p1.cabeceras["anthropic-beta"] || "").includes("server-side-fallback-2026-07-01"), "con el respaldo de la API");
  ok(p1.cabeceras["x-api-key"] === "clave-de-prueba" || p1.cabeceras.authorization === "Bearer clave-de-prueba", "con la clave");
  ok(p1.cuerpo.system.length === 2 && p1.cuerpo.system[1].cache_control?.type === "ephemeral" && p1.cuerpo.cache_control?.type === "ephemeral",
     "con caché en el índice y en la conversación");
  ok(p1.cuerpo.system[1].text.includes("gas_usuario_serie | ¿Cuánto gas usa cada usuario?"), "el índice va en las instrucciones");
  ok(!/suicid/i.test(p1.cuerpo.system[1].text), "el índice no nombra columnas de suicidio");
  ok(p1.cuerpo.tools.length === 1 && p1.cuerpo.tools[0].name === "leer_tabla" && p1.cuerpo.tools[0].strict === true, "una herramienta, estricta");
  ok(p1.cuerpo.tool_choice.type === "auto", "puede elegir leer tablas");
  ok(JSON.stringify(p1.cuerpo.system) === JSON.stringify(p2.cuerpo.system) && JSON.stringify(p1.cuerpo.tools) === JSON.stringify(p2.cuerpo.tools),
     "instrucciones y herramientas idénticas entre vueltas (la caché las reconoce)");
  const res = p2.cuerpo.messages[2].content[0];
  ok(p2.cuerpo.messages[1].role === "assistant" && p2.cuerpo.messages[1].content.some(b => b.type === "tool_use" && b.id === "toolu_1"),
     "devuelve el pedido del modelo tal cual");
  ok(res.type === "tool_result" && res.tool_use_id === "toolu_1" && !res.is_error, "manda la tabla como resultado");
  const csv = res.content.split("\n\n").at(-1).split("\n");
  ok(csv[0] === "anio,codigo_indec,territorio,m3_usuario", "con su encabezado");
  ok(csv.length > 2 && csv.slice(1).every(l => /^20(2\d),0[02],/.test(l)), "solo el país y la Ciudad desde 2020 (el código 2 se lee como 02)");
  ok(/Fuente: Fuente de prueba\. Se actualiza cada año\./.test(res.content) && res.content.includes("Nota de método: Nota de prueba."), "con su fuente y su nota");
}

// ---------- 2. lo que recibe el modelo de cada tabla ----------
{
  const idx = await cargarIndice(leer);
  const base = {columnas: [], filtros: [], desde: "", hasta: ""};
  const mv = await leerTabla({...base, tabla: "muertes_violentas"}, idx, leer);
  ok(mv.texto && !/suicid/i.test(mv.texto) && mv.texto.includes("homicidios"), "muertes violentas sin la columna de suicidios");
  const oc = await leerTabla({...base, tabla: "ocde_comparacion"}, idx, leer);
  ok(oc.texto && !/suicid/i.test(oc.texto) && oc.texto.includes("fecundidad"), "comparación con la OCDE sin las filas de suicidio");
  const todo = await leerTabla({...base, tabla: "gas_usuario_serie"}, idx, leer);
  ok(todo.texto.includes(`Se muestran las primeras ${TOPES.filas} de`) && todo.texto.split("\n\n").at(-1).split("\n").length === TOPES.filas + 1,
     "una tabla larga llega cortada en el tope de filas, con el aviso");
  const per = await leerTabla({...base, tabla: "gas_usuario_serie", desde: "2024", hasta: "2024", columnas: ["anio", "m3_usuario"]}, idx, leer);
  const lp = per.texto.split("\n\n").at(-1).split("\n");
  ok(lp[0] === "anio,m3_usuario" && lp.length > 1 && lp.slice(1).every(l => l.startsWith("2024,")), "período y columnas elegidas");
  const vot = await leerTabla({...base, tabla: "votaciones_leyes_clave", filtros: [{columna: "legislador", valores: ["ocaña, graciela"]}]}, idx, leer);
  ok(vot.texto && vot.texto.includes('"OCAÑA, GRACIELA"'), "campos con comillas y comas, y filtro sin distinguir mayúsculas");
  const no = await leerTabla({...base, tabla: "../../functions/_ia/consulta"}, idx, leer);
  ok(no.error && /No hay ninguna tabla/.test(no.error), "no lee nada fuera del índice");
  const sui = await leerTabla({...base, tabla: "suicidios_provincias"}, idx, leer);
  ok(sui.error, "no lee una tabla que no está en el índice");
  const col = await leerTabla({...base, tabla: "muertes_violentas", columnas: ["suicidios"]}, idx, leer);
  ok(col.error && col.error.includes("no tiene") && !col.error.includes("suicidios,"), "no da la columna de suicidios aunque la pidan");
  const mal = await leerTabla({tabla: "gas_usuario_serie"}, idx, leer);
  ok(mal.error, "un pedido incompleto vuelve como error");
}

// ---------- 3. cuándo no contesta ----------
{
  const api = apiSimulada([{bloques: [{texto: "x"}], fin: "end_turn"}]);
  const r1 = await responder(new Request(SITIO + "/api/consulta"), {env: {}, leer, cliente: api.cliente});
  ok(r1.status === 405 && r1.headers.get("Allow") === "POST", "GET: 405");
  const r2 = await responder(pedir({pregunta: "¿Hola?"}, {cabeceras: {Origin: "https://otro.sitio"}}), {env: {}, leer, cliente: api.cliente});
  ok(r2.status === 403, "desde otro sitio: 403");
  const r3 = await responder(pedir({pregunta: "¿Cuánto gas se usa?"}), {env: {}, leer});
  ok(r3.status === 503 && (await r3.json()).error === "Las consultas con IA no están activadas.", "sin clave: 503, no activadas");
  const r4 = await responder(pedir({pregunta: "¿Cuánto gas se usa?"}), {env: {ANTHROPIC_API_KEY: "x"}, leer: leerDe(null)});
  ok(r4.status === 503, "sin índice (consulta_ia apagado): 503");
  const r5 = await responder(pedir({pregunta: " "}), {env: {}, leer, cliente: api.cliente});
  ok(r5.status === 400, "pregunta vacía: 400");
  const r6 = await responder(pedir({pregunta: "x".repeat(TOPES.pregunta + 1)}), {env: {}, leer, cliente: api.cliente});
  ok(r6.status === 400, "pregunta demasiado larga: 400");
  const r7 = await responder(pedir("no es json"), {env: {}, leer, cliente: api.cliente});
  ok(r7.status === 400, "cuerpo que no es JSON: 400");
  const r8 = await responder(pedir({pregunta: "¿Hola?", relleno: "x".repeat(9000)}), {env: {}, leer, cliente: api.cliente});
  ok(r8.status === 400, "cuerpo de más de 8 KB: 400");
  ok(api.pedidos.length === 0, "en ninguno de esos casos se llamó a la API");
}

// ---------- 4. rechazo, error de la API, tope de vueltas y respaldo a mitad de camino ----------
{
  const {ev} = await silencio(() => consulta([{bloques: [], fin: "refusal"}]));
  ok(ev.some(e => e.t === "error" && e.texto === "No puedo contestar esa pregunta con los datos de Datina.") && !ev.some(e => e.t === "fin"),
     "si el modelo declina, lo dice sin respuesta");
}
{
  const {ev, texto} = await silencio(() => consulta([{bloques: [{texto: "Una respuesta que se cortó"}], fin: "max_tokens"}]));
  ok(texto.endsWith("(La respuesta quedó incompleta: probá con una pregunta más acotada.)") && ev.at(-1).t === "fin", "una respuesta cortada lo avisa");
}
{
  const {api, ev} = await silencio(() => consulta([{bloques: [{tabla: "gas_usuario_serie", id: "toolu_c"}], fin: "max_tokens"}]));
  ok(api.pedidos.length === 1 && ev.some(e => e.t === "error") && !ev.some(e => e.t === "paso"), "un pedido de tabla cortado no se ejecuta");
}
{
  const {ev} = await silencio(() => consulta([{estado: 429}]));
  ok(ev.some(e => e.t === "error" && /muchas consultas/.test(e.texto)), "con la API saturada, pide probar más tarde");
}
{
  const pide = {bloques: [{texto: "Busco."}, {tabla: "gas_usuario_serie", id: "toolu_x", desde: "2025"}], fin: "tool_use"};
  const {api, ev} = await silencio(() => consulta([pide, pide, pide, pide, pide, {bloques: [{texto: "Con lo que leí, esto."}], fin: "end_turn"}]));
  ok(api.pedidos.length === TOPES.vueltas, `no pasa de ${TOPES.vueltas} vueltas`);
  const ultimo = api.pedidos.at(-1).cuerpo;
  ok(ultimo.tool_choice.type === "none", "en la última vuelta ya no puede pedir tablas");
  ok(ultimo.messages.at(-1).content.some(b => b.type === "text" && /Ya no quedan lecturas/.test(b.text)), "y se le avisa");
  ok(ev.filter(e => e.t === "reinicio").length === 5, "lo escrito antes de cada lectura se borra de la página");
  ok(ev.filter(e => e.t === "texto").map(e => e.texto).join("").endsWith("Con lo que leí, esto."), "la respuesta final llega");
}
{
  const {api} = await silencio(() => consulta([
    {bloques: [{texto: "Leo "}, {tabla: "muertes_violentas", id: "toolu_antes"}, {respaldo: true}, {tabla: "gas_usuario_serie", id: "toolu_despues"}], fin: "tool_use"},
    {bloques: [{texto: "Listo."}], fin: "end_turn"},
  ]));
  const [asis, usu] = api.pedidos[1].cuerpo.messages.slice(1);
  ok(!asis.content.some(b => b.id === "toolu_antes") && asis.content.some(b => b.id === "toolu_despues") && !asis.content.some(b => b.type === "fallback"),
     "después de un respaldo, el pedido del primer modelo no se devuelve ni se ejecuta");
  ok(usu.content.length === 1 && usu.content[0].tool_use_id === "toolu_despues", "solo se lee la tabla que pidió el segundo modelo");
}

// ---------- 5. la función de Cloudflare Pages ----------
{
  const api = apiSimulada([{bloques: [{texto: "ok"}], fin: "end_turn"}]);
  const r = await onRequest({request: new Request(SITIO + "/api/consulta"), env: {ASSETS: {fetch: () => new Response("")}}, waitUntil: () => {}});
  ok(r.status === 405, "functions/api/consulta.js contesta con la misma lógica");
  ok(api.pedidos.length === 0, "y sin llamar a la API");
  const sinClave = await onRequest({request: pedir({pregunta: "¿Cuánto gas se usa?"}), env: {ASSETS: {fetch: u => leer(new URL(u).pathname)}}, waitUntil: () => {}});
  ok(sinClave.status === 503, "sin el secreto ANTHROPIC_API_KEY no contesta");
}

// ---------- 6. el índice armado, si está ----------
const REAL = join(DATOS, "consulta_ia.json");
if (existsSync(REAL)) {
  const d = JSON.parse(readFileSync(REAL, "utf-8"));
  const idx = await cargarIndice(async ruta => ruta === "/datos/consulta_ia.json" ? new Response(readFileSync(REAL)) : new Response("", {status: 404}));
  ok(d.tablas.length > 100, "el índice armado tiene las tablas del catálogo");
  ok(d.tablas.every(t => existsSync(join(DATOS, t.tabla + ".csv"))), "cada tabla del índice existe en sitio/datos");
  ok(d.tablas.every(t => /^(?:\.\/|[\w-]+\.html)(?:#[\w-]+)?$/.test(t.url)), "cada tabla lleva a una página del sitio");
  ok(!/suicid/i.test(idx.texto), "el texto del índice no nombra el suicidio");
  ok(!d.tablas.some(t => /suicid/i.test(t.tabla + t.titulo)), "ninguna tabla de suicidio en el índice");
  console.log(`Índice armado: ${d.tablas.length} tablas, ${idx.texto.length} caracteres en las instrucciones.`);
} else {
  console.log("Sin sitio/datos/consulta_ia.json (consulta_ia apagado): el índice armado no se revisó.");
}

console.log(fallas ? `${fallas} de ${casos} controles fallaron.` : `Consultas con IA: ${casos} controles bien.`);
process.exit(fallas ? 1 : 0);
