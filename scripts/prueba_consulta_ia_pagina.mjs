// Prueba de la página de las consultas con IA en Chrome (25 de octubre de 2026, docs/ia/CONSULTAS.md): node scripts/prueba_consulta_ia_pagina.mjs
// Necesita el sitio armado con "consulta_ia": true en datos/manual/sitio.json (si no está la página, lo dice y no prueba nada). Sirve sitio/
// y contesta /api/consulta con la función de verdad (functions/_ia/consulta.mjs) y una API de Anthropic simulada, como
// scripts/prueba_consulta_ia.mjs: no hace falta clave ni se gasta nada. Lo que se le pregunta elige qué pasa: una respuesta común, un error
// de la API ("error"), una consulta que tarda ("lento", para probar "Detener") o una respuesta que se corta sin terminar ("cortada").
// Controla, en el celular (390 píxeles) y con movimiento reducido: la pregunta que llega en el enlace, el foco (nunca se pierde en el
// cuerpo de la página y al terminar va al título de la tarjeta), el aviso para lectores de pantalla, la respuesta y sus fichas, los errores
// ("No se pudo contestar", con el enlace al catálogo), "Detener" y que una respuesta cortada no quede como completa.
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "../functions/_ia/anthropic-sdk.mjs";
import { responder } from "../functions/_ia/consulta.mjs";
import { abrirChrome, espera } from "./cdp.mjs";

const SITIO = normalize(fileURLToPath(new URL("../sitio/", import.meta.url)));
// el registro de la función (una línea por consulta, en Cloudflare) no se muestra en la prueba
for (const k of ["log", "error"]) { const f = console[k]; console[k] = (...x) => { if (!String(x[0]).startsWith('{"consulta_ia"')) f(...x); }; }
if (!existsSync(join(SITIO, "consulta-ia.html"))) {
  console.log('Sin sitio/consulta-ia.html: armar con "consulta_ia": true en datos/manual/sitio.json para probar la página. No se probó nada.');
  process.exit(0);
}
const TIPOS = {".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json",
  ".csv": "text/csv; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2"};
const leer = async ruta => {
  const archivo = normalize(join(SITIO, ruta));
  return archivo.startsWith(SITIO) && existsSync(archivo) ? new Response(readFileSync(archivo)) : new Response("", {status: 404});
};

// la API simulada: pide una tabla en la primera vuelta y contesta en la segunda
const sse = (modelo, bloques, fin) => {
  const ev = [], e = (t, d) => ev.push(`event: ${t}\ndata: ${JSON.stringify({type: t, ...d})}\n\n`);
  e("message_start", {message: {id: "msg", type: "message", role: "assistant", model: modelo, content: [], stop_reason: null, stop_sequence: null,
    usage: {input_tokens: 100, output_tokens: 1, cache_read_input_tokens: 0, cache_creation_input_tokens: 0}}});
  bloques.forEach((b, i) => {
    if (b.texto) {
      e("content_block_start", {index: i, content_block: {type: "text", text: ""}});
      for (const p of b.texto.match(/.{1,20}/gs)) e("content_block_delta", {index: i, delta: {type: "text_delta", text: p}});
    } else {
      e("content_block_start", {index: i, content_block: {type: "tool_use", id: "toolu_1", name: "leer_tabla", input: {}}});
      e("content_block_delta", {index: i, delta: {type: "input_json_delta", partial_json: JSON.stringify(b.tabla)}});
    }
    e("content_block_stop", {index: i});
  });
  e("message_delta", {delta: {stop_reason: fin, stop_sequence: null}, usage: {output_tokens: 20}});
  e("message_stop", {});
  return ev.join("");
};
const RESPUESTA = "En la Ciudad de Buenos Aires, cada usuario residencial de gas usó una cantidad de prueba.\n\nFuente: ENARGAS.";
const TABLA = JSON.parse(readFileSync(join(SITIO, "datos", "consulta_ia.json"), "utf-8")).tablas[0].tabla;
const fetchSimulado = async (url, init) => {
  const b = JSON.parse(init.body), preg = String(b.messages[0].content);
  if (preg.includes("error")) return new Response(JSON.stringify({type: "error", error: {type: "rate_limit_error", message: "x"}}),
                                                  {status: 429, headers: {"content-type": "application/json"}});
  if (preg.includes("lento")) await espera(8000);
  const cuerpo = b.messages.length === 1 ? sse(b.model, [{tabla: {tabla: TABLA, columnas: [], filtros: [], desde: "", hasta: ""}}], "tool_use")
                                         : sse(b.model, [{texto: RESPUESTA}], "end_turn");
  return new Response(cuerpo, {status: 200, headers: {"content-type": "text/event-stream"}});
};
const cliente = new Anthropic({apiKey: "clave-de-prueba", fetch: fetchSimulado, maxRetries: 0});
// con el motor gratis (26 de octubre de 2026, "consulta_ia_motor": "cloudflare"), un Workers AI simulado con los mismos casos
const ia = {run: async (modelo, op) => {
  const preg = op.messages[1].content;
  if (preg.includes("error")) throw new Error("3040: Capacity temporarily exceeded");
  if (preg.includes("lento")) await espera(8000);
  const ev = RESPUESTA.match(/.{1,20}/gs).map(x => `data: ${JSON.stringify({response: x})}\n\n`).join("") + "data: [DONE]\n\n";
  return new Response(ev).body;
}};
const MOTOR = JSON.parse(readFileSync(join(SITIO, "datos", "consulta_ia.json"), "utf-8")).motor || "anthropic";

const servidor = createServer(async (req, res) => {
  const u = new URL(req.url, "http://local");
  if (u.pathname === "/api/consulta") {
    let cuerpo = "";
    for await (const c of req) cuerpo += c;
    // una respuesta que empieza y se corta sin el evento "fin" (se cayó la conexión): la arma la prueba, no la función
    if (cuerpo.includes("cortada")) {
      res.writeHead(200, {"Content-Type": "application/x-ndjson"});
      res.end(JSON.stringify({t: "texto", texto: "La respuesta empezó con una cifra de "}) + "\n");
      return;
    }
    // la dirección con su puerto: la función compara el origen del pedido con el suyo
    const r = await responder(new Request(`http://${req.headers.host}${req.url}`, {method: req.method, headers: req.headers, body: req.method === "POST" ? cuerpo : undefined}),
                              {env: {}, leer, cliente, ia});
    res.writeHead(r.status, Object.fromEntries(r.headers));
    for await (const c of r.body) res.write(c);
    res.end();
    return;
  }
  let ruta = decodeURIComponent(u.pathname);
  if (ruta.endsWith("/")) ruta += "index.html";
  const archivo = normalize(join(SITIO, ruta));
  if (!archivo.startsWith(SITIO) || !existsSync(archivo)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, {"Content-Type": TIPOS[extname(archivo)] || "application/octet-stream"});
  res.end(readFileSync(archivo));
});
await new Promise(r => servidor.listen(0, "127.0.0.1", r));
const B = `http://127.0.0.1:${servidor.address().port}/`;

let fallas = 0, casos = 0;
const ok = (cond, que) => { casos++; if (!cond) { fallas++; console.log("FALLA: " + que); } };
const ch = await abrirChrome(9700 + Math.floor(Math.random() * 200)), p = await ch.pestana();
await p.send("Emulation.setEmulatedMedia", {features: [{name: "prefers-reduced-motion", value: "reduce"}]});
await p.tamano(390, 844);
// los textos sin el espacio que no se corta que pone datina.js entre las últimas palabras (sinViuda)
const estado = async () => JSON.parse((await p.eval(`JSON.stringify((() => { const $ = id => document.getElementById(id);
  return {estado: $("ia-estado").textContent, tit: $("ia-respuesta-tit").textContent, texto: $("ia-texto").textContent, caja: !$("ia-respuesta").hidden,
    boton: document.querySelector("#ia-enviar .ia-e.activa")?.textContent, foco: document.activeElement.id || document.activeElement.tagName,
    salida: $("ia-salida").hidden ? "" : $("ia-salida").getAttribute("href"), fichas: [...document.querySelectorAll("#ia-fichas a")].map(a => a.getAttribute("href")),
    eco: $("ia-pregunta-eco").textContent, ocupado: $("ia-form").hasAttribute("aria-busy"), aviso: getComputedStyle($("ia-estado")).display}; })())`)).replace(/\u00a0/g, " "));
const preguntar = q => p.eval(`(() => { document.getElementById("ia-pregunta").value = ${JSON.stringify(q)}; const b = document.getElementById("ia-enviar"); b.focus(); b.click(); })()`);
const hasta = async (cond, ms = 15000) => { let e; for (let t = 0; t < ms; t += 200) { await espera(200); e = await estado(); if (cond(e)) return e; } return e; };

// 1. la pregunta del enlace queda escrita, sin enviarse, y el aviso existe desde la carga (no está oculto para los lectores de pantalla)
const preg = "¿Cuánto gas usa cada usuario en la Ciudad?";
await p.ir(B + "consulta-ia.html?q=" + encodeURIComponent(preg), 800);
let e = await estado();
ok(await p.eval(`document.getElementById("ia-pregunta").value`) === preg && !e.caja && /quedó escrita/.test(e.estado), "la pregunta del enlace queda escrita y se avisa");
ok(e.aviso !== "none", "el aviso para lectores de pantalla está en la página desde que carga");
ok(p.errores.length === 0, "sin errores al cargar: " + p.errores.join(" | "));

// 2. una respuesta común
await preguntar(preg);
await espera(100);
e = await estado();
ok(e.foco !== "BODY", `al preguntar, el foco no se pierde (${e.foco})`);
e = await hasta(x => x.estado === "Respuesta lista.");
ok(e.estado === "Respuesta lista." && e.tit === "Respuesta" && e.texto.replace(/\s+/g, " ").includes("cada usuario residencial de gas") && e.texto.includes("Fuente: ENARGAS."),
   "la respuesta llega entera, con su título");
ok(e.foco === "ia-respuesta-tit", `al terminar, el foco va al título de la tarjeta (${e.foco})`);
ok(e.eco === preg, "la tarjeta repite la pregunta");
// con Claude, la ficha que pidió la API simulada. Con el motor gratis, las que eligió la función: cada ficha con su tabla para bajar
const pares = e.fichas.length >= 2 && e.fichas.length % 2 === 0 && e.fichas.every((f, i) => i % 2 ? /^datos\/\w+\.csv$/.test(f) : /^(?:\.\/|[\w-]+\.html)(?:#[\w-]+)?$/.test(f));
ok(pares && (MOTOR === "cloudflare" || (e.fichas.length === 2 && e.fichas[1] === `datos/${TABLA}.csv`)), `las fichas consultadas y sus tablas para bajar (${e.fichas.join(", ")})`);
ok(!e.ocupado && e.boton === "Preguntar" && !e.salida, "el botón vuelve a Preguntar y no hay enlace de error");
ok(await p.eval(`document.querySelectorAll("#ia-texto p").length`) === 2, "la respuesta va en párrafos");

// 3. un error de la API (la pregunta nombra el gas para que el motor gratis encuentre una tabla y llame al modelo)
await preguntar("¿Cuánto gas usa cada usuario? Una pregunta con error");
e = await hasta(x => !x.ocupado && x.tit !== "Respuesta");
ok(e.tit === "No se pudo contestar" && /muchas consultas/.test(e.texto), `un error se ve como tal (${e.tit}: ${e.texto})`);
ok(e.salida === "catalogo.html?q=" + encodeURIComponent("¿Cuánto gas usa cada usuario? Una pregunta con error"), "ofrece buscar lo escrito en el catálogo");
ok(e.estado === "" && e.foco === "ia-respuesta-tit" && e.fichas.length === 0, "el error no se repite en el aviso y el foco va al título");

// 4. "Detener"
await preguntar("¿Cuánto gas usa cada usuario? Una pregunta lento a propósito");
await espera(800);
e = await estado();
ok(e.ocupado && e.boton === "Detener" && e.foco === "ia-enviar", `mientras trabaja, el botón dice Detener y conserva el foco (${e.boton}, ${e.foco})`);
await p.eval(`document.getElementById("ia-enviar").click()`);
e = await hasta(x => !x.ocupado, 4000);
ok(e.tit === "Consulta detenida" && !e.ocupado && e.boton === "Preguntar", `Detener corta la consulta (${e.tit})`);

// 5. una respuesta que se corta sin terminar
await preguntar("Una respuesta cortada");
e = await hasta(x => !x.ocupado);
ok(e.tit === "No se pudo contestar" && /se cortó antes de terminar/.test(e.texto) && !e.texto.includes("empezó con una cifra"),
   `una respuesta cortada se borra y se avisa (${e.texto})`);

ok(p.errores.length === 0, "sin errores en la página: " + p.errores.join(" | "));
await ch.cerrar(); servidor.close();
console.log(fallas ? `${fallas} de ${casos} controles fallaron.` : `Página de las consultas con IA (motor ${MOTOR}): ${casos} controles bien.`);
process.exit(fallas ? 1 : 0);
