// Prueba de fallas a propósito (plan de estabilización, P2-17, P2-18 y P2-19, 24 de octubre de 2026). Abre páginas del sitio armado en
// Chrome sin ventana, corta archivos a propósito o sirve datina.js con un error a propósito, y controla que:
// - sin D3, el Explorador de relaciones muestre su aviso;
// - un gráfico que falla deje su aviso, los demás se dibujen y el error quede en la consola (así la prueba de páginas no deja publicar);
// - un artículo que falla no corte la portada ni los otros artículos, y su página lo diga;
// - "Ver tabla" vuelva a pedir la tabla después de una falla, y la comparación con la OCDE y el mapa de departamentos avisen si su archivo
//   no llega y vuelvan a intentar.
// No la corre la actualización mensual. La corre cada PR (.github/workflows/pruebas.yml, desde el 27 de octubre de 2026), y conviene correrla
// a mano antes de subir un cambio en cómo se cargan los datos o se dibujan los gráficos en datina.js.
// Si dice "no está: ...", cambió el código que la prueba rompe a propósito: hay que actualizar ese texto acá.
// Uso: node scripts/prueba_fallas.mjs   (Node 22 o más y Google Chrome. Otra ruta de Chrome: variable CHROME)
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { abrirChrome, espera } from "./cdp.mjs";

const SITIO = normalize(fileURLToPath(new URL("../sitio/", import.meta.url)));
const TIPOS = {".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json", ".geojson": "application/json", ".csv": "text/csv; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml"};
const servidor = createServer((req, res) => {
  let ruta = decodeURIComponent(new URL(req.url, "http://local").pathname);
  if (ruta.endsWith("/")) ruta += "index.html";
  const archivo = normalize(join(SITIO, ruta));
  if (!archivo.startsWith(SITIO)) { res.writeHead(403); res.end(); return; }
  try { const d = readFileSync(archivo); res.writeHead(200, {"Content-Type": TIPOS[extname(archivo)] || "application/octet-stream"}); res.end(d); }
  catch { res.writeHead(404); res.end(); }
});
await new Promise(r => servidor.listen(0, "127.0.0.1", r));
const BASE = `http://127.0.0.1:${servidor.address().port}/`;
const ch = await abrirChrome(9500 + Math.floor(Math.random() * 400)), p = await ch.pestana();
await p.tamano(1440, 900);
// qué hacer con cada pedido: fallar (los que contienen un texto de FALLAR) o cambiar datina.js (CAMBIOS)
let FALLAR = [], CAMBIOS = [];
await p.send("Fetch.enable", {patterns: [{urlPattern: "*datina.js*"}, {urlPattern: "*/lib/*"}, {urlPattern: "*/datos/*"}]});
p.on("Fetch.requestPaused", ev => {
  const u = ev.request.url;
  if (FALLAR.some(f => u.includes(f))) return p.send("Fetch.failRequest", {requestId: ev.requestId, errorReason: "Failed"});
  if (CAMBIOS.length && /\/datina\.js/.test(u)) {
    let s = readFileSync(join(SITIO, "datina.js"), "utf8");
    for (const [a, b] of CAMBIOS) { if (!s.includes(a)) throw new Error("no está: " + a); s = s.replace(a, b); }
    return p.send("Fetch.fulfillRequest", {requestId: ev.requestId, responseCode: 200, body: Buffer.from(s).toString("base64"),
      responseHeaders: [{name: "Content-Type", value: "text/javascript; charset=utf-8"}]});
  }
  p.send("Fetch.continueRequest", {requestId: ev.requestId});
});
// el sitio junta las últimas palabras de cada texto con espacios que no se cortan (sinViuda): se comparan como espacios comunes
const sinNbsp = t => t.replace(/\s+/g, " ");
const res = [];
const caso = (nombre, ok, detalle = "") => { res.push(ok); console.log((ok ? "bien  " : "MAL   ") + nombre + (detalle ? " (" + detalle + ")" : "")); };

// 1. P2-19: sin D3, el Explorador avisa
FALLAR = ["/lib/d3"];
await p.ir(BASE + "relaciones.html", 1500);
let r = await p.eval(`(() => { const e = document.getElementById("rx-error"); return JSON.stringify({vis: !e.hidden, t: e.textContent}); })()`);
r = JSON.parse(r); caso("Explorador sin D3: aviso a la vista", r.vis && /No se pudo cargar el programa/.test(r.t), r.t);
FALLAR = [];
await p.ir(BASE + "relaciones.html", 1500);
r = await p.eval(`document.getElementById("rx-error").hidden`); caso("Explorador con D3: sin aviso", r === true);

// 2. P2-17: un gráfico que falla (hogares, en energia.html)
CAMBIOS = [['hogares: a => lineas(G("hogares")', 'hogares: a => null.x || lineas(G("hogares")']];
await p.ir(BASE + "energia.html", 1500); await p.recorrer();
r = JSON.parse(await p.eval(`(() => { const g = [...document.querySelectorAll(".grafico[data-g]")].filter(e => e.offsetParent);
  return JSON.stringify({hog: document.querySelector('.grafico[data-g="hogares"]').textContent, otros: g.filter(e => e.dataset.g !== "hogares" && e.querySelector("svg")).length, total: g.length}); })()`));
caso("Gráfico que falla: su aviso", /No se pudo dibujar este gráfico/.test(sinNbsp(r.hog)), r.hog);
caso("Gráfico que falla: los demás se dibujan", r.otros === r.total - 1, `${r.otros} de ${r.total - 1}`);
caso("Gráfico que falla: la consola lo anota (la prueba de páginas lo ve)", p.errores.some(e => /no se pudo dibujar el gráfico hogares/.test(e)), p.errores.length + " errores");

// 3. P2-17: un artículo que falla (a-alquiler-pobreza)
await p.ir(BASE + "index.html", 1500);
const tarjetasAntes = await p.eval(`[...document.querySelectorAll("#art-grid-home .art-card")].map(a => a.getAttribute("href")).join(" ")`);
CAMBIOS = [["try { a.c = partesArt(a)", 'try { a.c = a.id === "a-alquiler-pobreza" ? null.x : partesArt(a)']];
await p.ir(BASE + "index.html", 1500);
r = JSON.parse(await p.eval(`JSON.stringify({tarjetas: [...document.querySelectorAll("#art-grid-home .art-card")].map(a => a.getAttribute("href")).join(" "), destacados: [...document.querySelectorAll(".destacado .c-num")].filter(e => e.textContent.trim()).length})`));
caso("Artículo que falla: la portada sigue (las mismas tarjetas de artículos y los datos destacados)", r.tarjetas.split(" ").length === tarjetasAntes.split(" ").length && r.destacados === 4, "antes " + tarjetasAntes + " | ahora " + r.tarjetas);
caso("Artículo que falla: la consola lo anota", p.errores.some(e => /no se pudo armar el artículo a-alquiler-pobreza/.test(e)) && !p.errores.some(e => /^excepción/.test(e)), p.errores.join(" | ").slice(0, 200));
await p.ir(BASE + "a-alquiler-pobreza.html", 1500);
r = await p.eval(`document.getElementById("a-alquiler-pobreza").textContent`);
caso("Artículo que falla: su página lo dice", /No se pudo armar este artículo/.test(r), r.slice(0, 80));
await p.ir(BASE + "a-pobreza-desocupacion.html", 1500); await p.recorrer();
r = JSON.parse(await p.eval(`JSON.stringify({bajada: !!document.querySelector("#a-pobreza-desocupacion .nota-frase mark"), svg: !!document.querySelector("#a-pobreza-desocupacion .grafico svg")})`));
caso("Artículo que falla: otro artículo se arma entero", r.bajada && r.svg, JSON.stringify(r));
CAMBIOS = [];

// 4. P2-18: "Ver tabla" vuelve a intentar después de una falla
for (const pg of ["politica.html", "pobreza.html", "salud.html", "economia.html", "trabajo.html"]) {
  await p.ir(BASE + pg, 1200);
  const id = await p.eval(`(() => { const f = [...document.querySelectorAll("article.ficha")].find(f => { const a = f.querySelector(".pie a[href*='datos/']"),
    n = (a?.getAttribute("href").match(/datos\\/(\\w+)\\.csv/) || [])[1]; return n && DATINA.diferidas[n] && !DATINA.datos[n] && f.querySelector(".ver-tabla") && f.getBoundingClientRect().top > innerHeight * 2; });
    return f ? f.id + "|" + f.querySelector(".pie a[href*='datos/']").getAttribute("href").match(/datos\\/(\\w+)\\.csv/)[1] : ""; })()`);
  if (!id) continue;
  const [fid, n] = id.split("|");
  FALLAR = [`/datos/${n}.json`];
  await p.eval(`document.querySelector("#${fid} .ver-tabla").click()`); await espera(800);
  const err = await p.eval(`!!document.querySelector("#${fid} .tabla-error")`);
  FALLAR = [];
  await p.eval(`document.querySelector("#${fid} .ver-tabla").click()`); await espera(1200);
  r = JSON.parse(await p.eval(`JSON.stringify({filas: document.querySelectorAll("#${fid} .tabla-datos tr").length, error: !!document.querySelector("#${fid} .tabla-error")})`));
  caso(`"Ver tabla" en ${pg}#${fid} (${n}): la falla avisa y el segundo intento carga`, err && r.filas > 1 && !r.error, JSON.stringify({err, ...r}));
  break;
}

// 5. P2-18: la comparación con la OCDE avisa si no llega (f-mortalidad, en salud.html)
FALLAR = ["ocde_comparacion.csv"];
await p.ir(BASE + "salud.html", 1200);
await p.eval(`document.getElementById("f-mortalidad").scrollIntoView()`); await espera(1200);
await p.eval(`document.querySelector("#f-mortalidad .ocde-conm button[data-k]").click()`); await espera(1200);
r = await p.eval(`document.querySelector('.grafico[data-g="mortalidad"]').textContent`);
caso("OCDE sin su tabla: aviso", /No se pudo cargar la comparación con la OCDE/.test(sinNbsp(r)), r.slice(0, 80));
FALLAR = [];
await p.eval(`document.querySelector("#f-mortalidad .ocde-conm button.propio").click()`); await espera(900);
await p.eval(`document.querySelector("#f-mortalidad .ocde-conm button[data-k]").click()`); await espera(1500);
r = await p.eval(`!!document.querySelector('.grafico[data-g="mortalidad"] svg')`);
caso("OCDE: al volver a elegirla, se dibuja", r === true);

// 6. P2-18: el mapa de departamentos avisa si no llega y vuelve a intentar
FALLAR = ["departamentos.topo.json"];
await p.ir(BASE + "departamentos.html", 1200);
await p.eval(`document.getElementById("f-mapa").scrollIntoView()`); await espera(1500);
r = await p.eval(`document.querySelector('.grafico[data-g="mapa-dep"]').textContent`);
caso("Mapa de departamentos sin su archivo: aviso", /No se pudo cargar el mapa/.test(sinNbsp(r)), r.slice(0, 80));
FALLAR = [];
await p.eval(`(() => { const s = document.getElementById("mp-ind"); s.selectedIndex = 1; s.dispatchEvent(new Event("change")); })()`); await espera(2000);
r = await p.eval(`document.querySelectorAll('.grafico[data-g="mapa-dep"] path.dep').length`);
caso("Mapa de departamentos: al cambiar el indicador, se dibuja", r > 100, r + " departamentos");

console.log(res.every(Boolean) ? "Todo bien" : "HAY FALLAS");
await ch.cerrar(); servidor.close(); process.exit(res.every(Boolean) ? 0 : 1);
