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
import { responder, leerTabla, cargarIndice, elegirTablas, cifraAR, TOPES, MODELO, TOPES_CF, MODELO_CF, AYUDA_SUICIDIO } from "../functions/_ia/consulta.mjs";
import { INDICACIONES_CF } from "../functions/_ia/indicaciones.mjs";
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

// ---------- 6. el motor gratis, Cloudflare Workers AI (26 de octubre de 2026) ----------
// Workers AI simulado: devuelve la respuesta en eventos "data:", cortados en pedazos de 37 bytes (un evento puede quedar partido entre
// dos pedazos), o falla con el mensaje que se le pase
function iaSimulada(respuesta, error = "", pedazos = null) {
  const llamadas = [];
  return {llamadas, run: async (modelo, opciones) => {
    llamadas.push({modelo, opciones});
    if (error) throw new Error(error);
    // un pedazo que es solo un número llega como número, como lo manda Workers AI (26 de octubre de 2026)
    const ev = (pedazos || respuesta.match(/\d+|\D{1,15}/gs) || []).map(x => `data: ${JSON.stringify({response: /^\d+$/.test(x) ? +x : x})}\n\n`).join("") +
      `data: ${JSON.stringify({response: "", usage: {prompt_tokens: 1234, completion_tokens: 56}})}\n\ndata: [DONE]\n\n`;
    const bytes = new TextEncoder().encode(ev);
    return new ReadableStream({start(c) { for (let i = 0; i < bytes.length; i += 37) c.enqueue(bytes.slice(i, i + 37)); c.close(); }});
  }};
}
const leerCF = leerDe({...INDICE, motor: "cloudflare"});
const consultaCF = async (pregunta, ia, env = {}) => {
  const espera = [];
  const resp = await responder(pedir({pregunta}), {env, leer: leerCF, ia, esperar: x => espera.push(x)});
  const ev = resp.status === 200 ? await eventos(resp) : [];
  await Promise.all(espera);
  return {resp, ev, texto: ev.filter(e => e.t === "texto").map(e => e.texto).join(""), error: ev.find(e => e.t === "error")?.texto};
};
{
  const respuesta = "En la Ciudad de Buenos Aires cada usuario residencial usó 1.234,5 metros cúbicos de gas en 2025.\n\nFuente: Fuente de prueba.";
  const ia = iaSimulada(respuesta);
  const {ev, texto, resp} = await silencio(() => consultaCF("¿Cuánto gas usa cada usuario en la Ciudad de Buenos Aires?", ia));
  ok(resp.status === 200 && texto === respuesta, "Workers AI: el texto que llega a la página es el que escribió el modelo, aunque los eventos lleguen partidos");
  ok(ev.filter(e => e.t === "texto").every(e => typeof e.texto === "string"), "Workers AI: los pedazos que llegan como número van a la página como texto");
  ok(ia.llamadas.length === 1 && ia.llamadas[0].modelo === MODELO_CF && MODELO_CF === "@cf/meta/llama-3.3-70b-instruct-fp8-fast", "Workers AI: una sola llamada, con el modelo por omisión");
  const op = ia.llamadas[0].opciones;
  ok(op.stream === true && op.max_tokens === TOPES_CF.tokens && op.temperature === 0.2, "Workers AI: en vivo, con el tope de tokens y poca temperatura");
  ok(op.messages.length === 2 && op.messages[0].role === "system" && op.messages[0].content === INDICACIONES_CF, "Workers AI: con sus instrucciones");
  const u = op.messages[1].content;
  ok(u.startsWith("Pregunta: ¿Cuánto gas usa cada usuario en la Ciudad de Buenos Aires?") && u.includes('Datos de la ficha "¿Cuánto gas usa cada usuario?"'),
     "Workers AI: la pregunta y la tabla que más se le parece");
  ok(!u.includes("gas_usuario_serie.csv"), "Workers AI: sin el nombre del archivo, que el modelo copiaba en la respuesta");
  const csv = u.split("\n\n").at(-1).split("\n");
  ok(csv[0] === "anio | codigo_indec | territorio | m3_usuario" && csv.length > 2 && csv.slice(1).every(l => /^202[45] \| 0[02] \| /.test(l)),
     "Workers AI: de la tabla, solo el país y la Ciudad en los dos últimos años, con las columnas separadas por |");
  ok(csv.slice(1).every(l => /^\d{4} \| \d\d \| [^|]+ \| \d+$/.test(l)), "Workers AI: el consumo redondeado, sin decimales ni punto de miles (con punto, el modelo leía 2.220 como 2,22)");
  ok(!u.includes("actualizados al"), "Workers AI: sin la fecha de actualización del sitio, que el modelo daba como período del dato");
  ok(u.length < TOPES_CF.caracteres * TOPES_CF.tablas + 3000 && !/suicid/i.test(u), "Workers AI: un pedido corto y sin nada sobre suicidio");
  ok(ev.some(e => e.t === "paso" && e.texto === "Leyendo «¿Cuánto gas usa cada usuario?»…") && ev.some(e => e.t === "paso" && e.texto === "Escribiendo la respuesta…"),
     "Workers AI: avisa qué lee y cuándo escribe");
  const fu = ev.find(e => e.t === "fuentes");
  ok(fu && fu.fichas.some(f => f.tabla === "gas_usuario_serie" && f.url === "energia.html#f-gas-usuario") && ev.at(-1).t === "fin", "Workers AI: manda la ficha consultada y termina con fin");
}
{
  const ia = iaSimulada("ok");
  await silencio(() => consultaCF("¿Cuánto gas usaba cada usuario de la Ciudad en 2005?", ia));
  const csv = ia.llamadas[0].opciones.messages[1].content.split("\n\n").at(-1).split("\n").slice(1);
  ok(csv.some(l => l.startsWith("2005 |")) && csv.some(l => l.startsWith("2025 |")), "Workers AI: con un año en la pregunta, las filas de ese año y las últimas");
  const iaMv = iaSimulada("ok");
  await silencio(() => consultaCF("¿Cuántas muertes violentas y homicidios hubo?", iaMv));
  const u = iaMv.llamadas[0]?.opciones.messages[1].content || "";
  ok(u.includes('Datos de la ficha "Muertes violentas"') && u.includes("homicidios") && !/suicid/i.test(u), "Workers AI: muertes violentas sin la columna de suicidios");
}
{
  const casos = [["2073.7800", "nafta", "2074"], ["4094578.9300", "salario", "4094579"], ["37.8500", "pct", "37,9"], ["0.4300", "tasa", "0,43"],
                 ["-12.3400", "var", "-12,3"], ["5680763", "turistas", "5680763"], ["2025", "turistas", "2025"], ["2024.0000", "anio", "2024.0000"],
                 ["06", "codigo_indec", "06"], ["Salta", "territorio", "Salta"], ["2024-05", "periodo", "2024-05"],
                 ["2025.5000", "t", "2025.5000"], ["2025.5000", "semestre", "2025.5000"], ["10.0", "victimas", "10"], ["33.0000", "pct", "33"]];
  const mal = casos.filter(([v, c, e]) => cifraAR(v, c) !== e);
  ok(!mal.length, `Workers AI: las cifras como en la Argentina, redondeadas, sin tocar códigos, años ni textos (${mal.map(([v, c]) => `${v} → ${cifraAR(v, c)}`).join(", ")})`);
  // "¿qué provincia ... más?": la más alta y la más baja de cada columna, del último año y sin el total del país
  const iaMas = iaSimulada("ok");
  await silencio(() => consultaCF("¿Qué provincia usa más gas por usuario?", iaMas));
  const filasGas = readFileSync(join(DATOS, "gas_usuario_serie.csv"), "utf-8").trim().split("\n").slice(1).map(l => l.split(","));
  const ultGas = filasGas.map(f => f[0]).sort().at(-1);
  const topGas = filasGas.filter(f => f[0] === ultGas && f[1] !== "00").sort((a, b) => b[3] - a[3])[0];
  const uMas = iaMas.llamadas[0]?.opciones.messages[1].content || "";
  ok(uMas.includes(`Sin contar el total del país, m3_usuario: la más alta es ${topGas[2]} (`), `Workers AI: con "más", la provincia más alta del último año (${topGas[2]}, ${ultGas})`);
  const iaProv = iaSimulada("ok");
  await silencio(() => consultaCF("¿Cuánto gas usa cada usuario en la Ciudad de Buenos Aires?", iaProv));
  ok(!iaProv.llamadas[0].opciones.messages[1].content.includes("Sin contar el total del país"), "Workers AI: sin \"más\" ni \"menos\", no suma los extremos");
  const iaPegado = iaSimulada("", "", ["Santa Cruz tiene", 4, ".572 glaciares, con", 4, " más que el año", 2025, "."]);
  const r = await silencio(() => consultaCF("¿Cuánto gas usa cada usuario?", iaPegado));
  ok(r.texto === "Santa Cruz tiene 4.572 glaciares, con 4 más que el año 2025.", `Workers AI: un número que llega pegado a una palabra lleva su espacio (${r.texto})`);
}
{
  const ia = iaSimulada("no se usa");
  const {texto, ev} = await silencio(() => consultaCF("¿Cuántos suicidios hubo en Salta?", ia));
  ok(ia.llamadas.length === 0 && texto === AYUDA_SUICIDIO && /135/.test(texto) && /107/.test(texto) && ev.at(-1).t === "fin",
     "Workers AI: sobre suicidio no llama al modelo y contesta con las líneas de ayuda");
  const ia2 = iaSimulada("no se usa");
  const r2 = await silencio(() => consultaCF("¿Qué opinás de los planetas lejanos?", ia2));
  ok(ia2.llamadas.length === 0 && /No encontré tablas/.test(r2.error || ""), "Workers AI: sin tablas que se parezcan no llama al modelo y lo dice");
  const r3 = await silencio(() => consultaCF("¿Cuánto gas usa cada usuario?", iaSimulada("", "4006: you have used up your daily free allocation of 10,000 neurons")));
  ok(/Se renuevan a las 21/.test(r3.error || ""), "Workers AI: con lo gratis del día terminado, dice cuándo vuelve");
  const r4 = await silencio(() => consultaCF("¿Cuánto gas usa cada usuario?", iaSimulada("", "3040: Capacity temporarily exceeded")));
  ok(/muchas consultas/.test(r4.error || ""), "Workers AI: saturado, pide probar en unos minutos");
  const r5 = await silencio(() => consultaCF("¿Cuánto gas usa cada usuario?", iaSimulada("")));
  ok(/no están disponibles/.test(r5.error || "") && !r5.ev.some(e => e.t === "fin"), "Workers AI: una respuesta vacía es un error, no una respuesta");
  const ia6 = iaSimulada("ok");
  await silencio(() => consultaCF("¿Cuánto gas usa cada usuario?", ia6, {DATINA_IA_MODELO_CF: "@cf/mistralai/mistral-small-3.1-24b-instruct"}));
  const ia7 = iaSimulada("ok");
  await silencio(() => consultaCF("¿Cuánto gas usa cada usuario?", ia7, {DATINA_IA_MODELO_CF: "gpt-otro"}));
  ok(ia6.llamadas[0].modelo === "@cf/mistralai/mistral-small-3.1-24b-instruct" && ia7.llamadas[0].modelo === MODELO_CF, "Workers AI: el autor puede elegir otro modelo de Workers AI y nada más");
  const sinIA = await consultaCF("¿Cuánto gas usa cada usuario?", null);
  ok(sinIA.resp.status === 503, "Workers AI: sin la conexión AI no contesta");
  const r8 = await consultaCF("¿Cuánto gas usa cada usuario?", iaSimulada("ok"), {DATINA_IA_MOTOR: "anthropic"});
  ok(r8.resp.status === 503, "con DATINA_IA_MOTOR anthropic y sin la clave, no usa Workers AI");
  const iaFuera = iaSimulada("ok");
  const conClave = await silencio(() => consulta([{bloques: [{texto: "ok"}], fin: "end_turn"}]));
  ok(conClave.texto === "ok" && iaFuera.llamadas.length === 0, "con el índice sin motor, sigue contestando Claude");
}

// períodos que no empiezan con el año (26 de octubre de 2026): los semestres de la pobreza y el número de mes de la estacionalidad
{
  const idx = await cargarIndice(leerDe({actualizado: "26/10/2026", tablas: [
    fila("pobreza_serie", "¿Cuántas personas viven bajo la línea de pobreza?", "pobreza.html#f-pobreza", "Total del país", "2S2016 a 1S2026"),
    fila("energia_estacionalidad", "¿En qué meses se usa más electricidad?", "energia.html#f-meses", "Total del país", "")]}));
  const base = {columnas: [], filtros: []};
  const po = await leerTabla({...base, tabla: "pobreza_serie", desde: "2025", hasta: ""}, idx, leerDe(null));
  const filasPo = po.texto?.split("\n\n").at(-1).split("\n").slice(1) || [];
  ok(filasPo.length >= 2 && filasPo.every(l => /^[12]S202[56],/.test(l)), `los semestres ("1S2026") se filtran por año (${filasPo.join(" / ")})`);
  const es = await leerTabla({...base, tabla: "energia_estacionalidad", desde: "2025", hasta: ""}, idx, leerDe(null));
  ok(es.texto && /no trae años/.test(es.texto) && es.texto.split("\n\n").at(-1).split("\n").length > 2, "una tabla con el número de mes no queda vacía al pedir un período");
}

// ---------- 7. el índice armado, si está ----------
const REAL = join(DATOS, "consulta_ia.json");
if (existsSync(REAL)) {
  const d = JSON.parse(readFileSync(REAL, "utf-8"));
  const idx = await cargarIndice(async ruta => ruta === "/datos/consulta_ia.json" ? new Response(readFileSync(REAL)) : new Response("", {status: 404}));
  ok(d.tablas.length > 100, "el índice armado tiene las tablas del catálogo");
  ok(d.tablas.every(t => existsSync(join(DATOS, t.tabla + ".csv"))), "cada tabla del índice existe en sitio/datos");
  ok(d.tablas.every(t => /^(?:\.\/|[\w-]+\.html)(?:#[\w-]+)?$/.test(t.url)), "cada tabla lleva a una página del sitio");
  ok(!/suicid/i.test(idx.texto), "el texto del índice no nombra el suicidio");
  ok(!d.tablas.some(t => /suicid/i.test(t.tabla + t.titulo)), "ninguna tabla de suicidio en el índice");
  ok(["anthropic", "cloudflare"].includes(d.motor), "el índice armado dice qué motor contesta");
  // las tablas que elige el motor gratis para tres preguntas comunes
  for (const [q, esperada] of [["¿Cuánto se gana en Neuquén?", /salario/], ["¿Cuánta inflación hubo este año?", /ipc|inflacion|precios/],
                               ["¿Cuántos turistas extranjeros llegaron?", /turis|receptivo|eti/]]) {
    const el = elegirTablas(q, idx);
    ok(el.tablas.length && esperada.test(el.tablas.map(t => t.tabla).join(" ")), `el motor gratis elige tablas que sirven para «${q}» (${el.tablas.map(t => t.tabla).join(", ")})`);
  }
  // los años de cada columna de homicidios, que salen de "Qué mide" (el 26 de octubre de 2026 el modelo escribía "el último año")
  const hom = d.tablas.find(t => t.tabla === "homicidios_provincias");
  if (hom) {
    const iaHom = iaSimulada("ok"), espera = [];
    await silencio(async () => eventos(await responder(pedir({pregunta: "¿Qué provincia tiene más homicidios?"}),
      {env: {}, leer: leerDe({...d, motor: "cloudflare"}), ia: iaHom, esperar: x => espera.push(x)})));
    await Promise.all(espera);
    const a = +hom.descripcion.match(/(\d{4})\D*$/)[1], u = iaHom.llamadas[0]?.opciones.messages[1].content || "";
    ok(u.includes(`las víctimas sumadas de ${a - 2} a ${a}`) && u.includes(`cada 100 mil habitantes en ${a}`),
       `el motor gratis dice los años de cada columna de homicidios (${a - 2} a ${a})`);
  }
  console.log(`Índice armado: ${d.tablas.length} tablas, ${idx.texto.length} caracteres en las instrucciones, motor ${d.motor}.`);
} else {
  console.log("Sin sitio/datos/consulta_ia.json (consulta_ia apagado): el índice armado no se revisó.");
}

console.log(fallas ? `${fallas} de ${casos} controles fallaron.` : `Consultas con IA: ${casos} controles bien.`);
process.exit(fallas ? 1 : 0);
