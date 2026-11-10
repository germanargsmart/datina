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
let FALLAR = [], CAMBIOS = [], CORTAR = [];
await p.send("Fetch.enable", {patterns: [{urlPattern: "*datina.js*"}, {urlPattern: "*/lib/*"}, {urlPattern: "*/datos/*"}]});
p.on("Fetch.requestPaused", ev => {
  const u = ev.request.url;
  if (FALLAR.some(f => u.includes(f))) return p.send("Fetch.failRequest", {requestId: ev.requestId, errorReason: "Failed"});
  if (CORTAR.some(f => u.includes(f))) {
    const d = readFileSync(join(SITIO, new URL(u).pathname));
    return p.send("Fetch.fulfillRequest", {requestId: ev.requestId, responseCode: 200, body: d.subarray(0, d.length >> 1).toString("base64"),
      responseHeaders: [{name: "Content-Type", value: "text/csv; charset=utf-8"}]});
  }
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
// se espera a que el gráfico que falla muestre su aviso (hasta 5 segundos): en una máquina lenta la página puede no haber terminado de dibujar
for (let i = 0; i < 50 && !(await p.eval(`document.querySelector('.grafico[data-g="hogares"]')?.textContent || ""`)); i++) await espera(100);
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
caso("Artículo que falla: la portada sigue (las mismas tarjetas de artículos y los datos destacados)", r.tarjetas.split(" ").length === tarjetasAntes.split(" ").length && r.destacados === 12, "antes " + tarjetasAntes + " | ahora " + r.tarjetas);
caso("Artículo que falla: la consola lo anota", p.errores.some(e => /no se pudo armar el artículo a-alquiler-pobreza/.test(e)) && !p.errores.some(e => /^excepción/.test(e)), p.errores.join(" | ").slice(0, 200));
await p.ir(BASE + "a-alquiler-pobreza.html", 1500);
r = await p.eval(`document.getElementById("a-alquiler-pobreza").textContent`);
caso("Artículo que falla: su página lo dice", /No se pudo armar este artículo/.test(r), r.slice(0, 80));
await p.ir(BASE + "a-pobreza-desocupacion.html", 1500); await p.recorrer();
r = JSON.parse(await p.eval(`JSON.stringify({bajada: !!document.querySelector("#a-pobreza-desocupacion .nota-frase mark"), svg: !!document.querySelector("#a-pobreza-desocupacion .grafico svg")})`));
caso("Artículo que falla: otro artículo se arma entero", r.bajada && r.svg, JSON.stringify(r));
CAMBIOS = [];

// 4. P2-18: "Ver tabla" vuelve a intentar después de una falla
// En una página con capítulos se ve uno por vez (28 de octubre de 2026): se busca también en los otros, tocando cada uno. Las fichas del
// capítulo recién abierto que quedan a más de dos pantallas todavía no se dibujaron
let probada = false;
for (const pg of ["politica.html", "pobreza.html", "salud.html", "economia.html", "trabajo.html"]) {
  await p.ir(BASE + pg, 1200);
  let id = "";
  for (let i = 0, nc = await p.eval(`document.querySelectorAll(".capitulos a").length`); i < Math.max(nc, 1) && !id; i++) id = await p.eval(`(() => {
    ${i ? `document.querySelectorAll(".capitulos a")[${i}].click();` : ""}
    const f = [...document.querySelectorAll("article.ficha")].find(f => { const a = f.querySelector(".pie a[href*='datos/']"),
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
  probada = true;
  break;
}
// si ninguna página tiene una ficha para este caso, la prueba no probó nada: eso también es una falla
if (!probada) caso(`"Ver tabla" después de una falla: una ficha con su tabla sin bajar`, false, "no se encontró ninguna");

// 5. P2-18: la comparación con la OCDE avisa si no llega (f-desocupacion, en trabajo.html: hasta el 28 de octubre de 2026 era f-mortalidad,
//    que ya no tiene botones de la OCDE por decisión del autor, y después f-empleo, que los perdió con D6)
FALLAR = ["ocde_comparacion.csv"];
await p.ir(BASE + "trabajo.html", 1200);
await p.eval(`document.getElementById("f-desocupacion").scrollIntoView()`); await espera(1200);
await p.eval(`document.querySelector("#f-desocupacion .ocde-conm button[data-k]").click()`); await espera(1200);
r = await p.eval(`document.querySelector('.grafico[data-g="desocupacion"]').textContent`);
caso("OCDE sin su tabla: aviso", /No se pudo cargar la comparación con la OCDE/.test(sinNbsp(r)), r.slice(0, 80));
FALLAR = [];
await p.eval(`document.querySelector("#f-desocupacion .ocde-conm button.propio").click()`); await espera(900);
await p.eval(`document.querySelector("#f-desocupacion .ocde-conm button[data-k]").click()`); await espera(1500);
r = await p.eval(`!!document.querySelector('.grafico[data-g="desocupacion"] svg')`);
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

// 7. Elecciones por mesa (4 de noviembre de 2026): sin su índice, sin la tabla de la elección, sin la de la provincia, con una tabla cortada a la mitad (una falla, no una
// tabla más corta) y sin la historia (los resultados quedan). Vuelve a intentar sin recargar la página
const MS = `document.getElementById("ms-resultado").innerText`;
FALLAR = ["mesas/indice.json"];
await p.ir(BASE + "mesas.html", 1200);
r = await p.eval(MS); caso("Mesas sin su índice: aviso", /No se pudo cargar la lista de elecciones/.test(sinNbsp(r)), r.slice(0, 80));
FALLAR = ["2023-segunda-presidente/pais.csv"];
await p.ir(BASE + "mesas.html", 1200);
r = await p.eval(MS); caso("Mesas sin la tabla de la elección: aviso", /No se pudo bajar la tabla/.test(sinNbsp(r)), r.slice(0, 80));
FALLAR = [];
await p.eval(`document.getElementById("ms-reintentar").click()`); await espera(900);
r = await p.eval(MS); caso("Mesas: al volver a intentar, se ve", /Milei - Villarruel/.test(r));
FALLAR = ["2023-segunda-presidente/06.csv"];
await p.eval(`document.querySelector('.ms-ir[data-p="06"]').click()`); await espera(900);
r = await p.eval(MS); caso("Mesas sin la tabla de la provincia: aviso", /No se pudo bajar la tabla/.test(sinNbsp(r)), r.slice(0, 80));
FALLAR = [];
await p.eval(`document.getElementById("ms-reintentar").click()`); await espera(1200);
r = await p.eval(`document.getElementById("ms-titulo")?.textContent`); caso("Mesas: al volver a intentar, la provincia", r === "Buenos Aires", r);
CORTAR = ["2023-general-presidente/14.csv"];
await p.ir(BASE + "mesas.html?e=2023-general-presidente&p=14", 1500);
r = await p.eval(MS); caso("Mesas con una tabla cortada: aviso, no números de menos", /No se pudo bajar la tabla/.test(sinNbsp(r)), r.slice(0, 80));
CORTAR = [];
FALLAR = ["circuitos/06.csv"];
await p.ir(BASE + "mesas.html?p=06&s=61", 1500);
r = await p.eval(MS);
caso("Mesas sin la historia: los resultados quedan y lo dice", /La Matanza/.test(r) && /No se pudo bajar la historia/.test(sinNbsp(r)), r.slice(0, 80));
FALLAR = [];
// 8. El mapa de Elecciones por mesa (5 de noviembre de 2026): sin sus polígonos, sin sus datos o sin D3 las tablas siguen enteras, y sin polígonos lo dice y vuelve a intentar
const FALLA_MAPA = `!document.getElementById("ms-mapa-falla").hidden`, CAMINOS = `document.querySelectorAll("#ms-lienzo .ms-c").length`;
FALLAR = ["mesas/geo/"];
await p.ir(BASE + "mesas.html", 1800);
r = await p.eval(MS); caso("Mapa sin sus polígonos: las tablas quedan", /Milei - Villarruel/.test(r), r.slice(0, 80));
caso("Mapa sin sus polígonos: lo dice", await p.eval(FALLA_MAPA));
FALLAR = [];
await p.eval(`document.getElementById("ms-mapa-reintentar").click()`); await espera(1500);
r = await p.eval(CAMINOS); caso("Mapa: al volver a intentar, se dibuja", r > 5000, r);
FALLAR = ["mesas/mapa/"];
await p.ir(BASE + "mesas.html", 1800);
r = await p.eval(MS); caso("Mapa sin sus datos: las tablas quedan", /Milei - Villarruel/.test(r), r.slice(0, 80));
caso("Mapa sin sus datos: lo dice", await p.eval(FALLA_MAPA));
FALLAR = ["lib/d3-"];
await p.ir(BASE + "mesas.html", 1800);
r = await p.eval(MS); caso("Mapa sin D3: las tablas quedan", /Milei - Villarruel/.test(r), r.slice(0, 80));
caso("Mapa sin D3: no se ve", await p.eval(`document.getElementById("ms-mapa").hidden`));
FALLAR = [];

// 8. Escuelas y hospitales de cada provincia (9 de noviembre de 2026): sin la tabla de la provincia o con la tabla cortada a la mitad, la sección
// lo dice (una tabla cortada no es una provincia con menos escuelas) y vuelve a intentar sin recargar. Sin Leaflet, quedan el texto y la tabla
const EST_IR = async () => { await p.ir(BASE + "provincia-chaco.html", 1200); await p.eval(`document.getElementById("prov-establecimientos").scrollIntoView()`); await espera(2500); };
const EST_LEAD = `document.getElementById("est-lead").textContent`;
FALLAR = ["establecimientos/22.csv"];
await EST_IR();
r = await p.eval(EST_LEAD); caso("Escuelas y hospitales sin su tabla: aviso", /No se pudieron cargar las escuelas y los hospitales de Chaco/.test(sinNbsp(r)), r.slice(0, 80));
FALLAR = [];
await p.eval(`document.getElementById("est-reintentar").click()`); await espera(2500);
r = await p.eval(EST_LEAD); caso("Escuelas y hospitales: al volver a intentar, se ve", /^Chaco tiene [\d.]+ escuelas/.test(r), r.slice(0, 60));
CORTAR = ["establecimientos/22.csv"];
await EST_IR();
r = await p.eval(EST_LEAD); caso("Escuelas y hospitales con la tabla cortada: aviso, no menos escuelas", /No se pudieron cargar/.test(sinNbsp(r)), r.slice(0, 80));
CORTAR = [];
FALLAR = ["leaflet-1.9.4"];
await EST_IR();
r = await p.eval(`({lead: ${EST_LEAD}, mapa: document.getElementById("est-mapa").textContent, filas: document.querySelectorAll("#est-tabla tbody tr").length})`);
caso("Escuelas y hospitales sin Leaflet: el texto y la tabla quedan, y el mapa lo dice",
  /^Chaco tiene/.test(r.lead) && /No se pudo cargar el mapa/.test(r.mapa) && r.filas > 20, JSON.stringify(r).slice(0, 120));
FALLAR = [];

// f-cumbres (9 de noviembre de 2026): sin el archivo de relieve de la cumbre, el aviso y la lista quedan, y elegirla de nuevo lo vuelve a pedir
const CU_IR = async () => {
  await p.ir("about:blank", 100);
  await p.ir(BASE + "naturaleza.html#f-cumbres", 1500);
  await p.eval(`document.getElementById("f-cumbres").scrollIntoView()`); await espera(1500);
};
const CU_ESTADO = `({detalle: document.querySelector("#f-cumbres .cu-detalle")?.textContent || "", lista: document.querySelectorAll("#f-cumbres .cu-lista button").length,
  aria: document.querySelector("#f-cumbres .cu-bloque canvas")?.getAttribute("aria-label") || ""})`;
FALLAR = ["datos/relieve/"];
await CU_IR();
r = await p.eval(CU_ESTADO);
caso("Cumbres sin el archivo de relieve: aviso y lista", /No se pudo cargar el relieve/.test(sinNbsp(r.detalle)) && r.lista >= 10, JSON.stringify(r).slice(0, 120));
FALLAR = [];
await p.eval(`document.querySelector("#f-cumbres .cu-lista button").click()`); await espera(1500);
r = await p.eval(CU_ESTADO);
caso("Cumbres: al elegirla de nuevo, se ve", /En la cumbre|lo mismo que el IGN/.test(sinNbsp(r.detalle)) && /Relieve de/.test(r.aria), r.detalle.slice(0, 80));

console.log(res.every(Boolean) ? "Todo bien" : "HAY FALLAS");
await ch.cerrar(); servidor.close(); process.exit(res.every(Boolean) ? 0 : 1);
