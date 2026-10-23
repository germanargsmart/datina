// Línea de base visual (11 de octubre de 2026). Abre las páginas principales en Chrome sin ventana en nueve anchos (320 a 1920
// píxeles) y con el zoom del navegador al 200% y al 400% (el mismo ancho visible con el doble o el cuádruple de píxeles por punto),
// recorre cada página para que se dibujen los gráficos, guarda una captura de la pantalla de arriba y revisa:
// - que la página no se corra de costado (ancho del documento mayor que la ventana) ni haya elementos visibles que se salgan,
// - que los textos de los gráficos no queden por debajo de 10 píxeles en pantalla (en el celular, la información esencial),
// - las métricas que el navegador puede medir en una carga de prueba: CLS (cuánto salta la página) y LCP (cuándo aparece lo más
//   grande). Son de una sola carga local, no de usuarios reales: sirven para comparar, no como resultado de campo.
// Uso: node scripts/linea_base.mjs [carpeta]   (por defecto linea_base/AAAA-MM-DD, que no se sube al repositorio)
// D3 y topojson vienen del propio sitio (sitio/lib/) desde el 22 de octubre de 2026: no hace falta acceso a cdnjs ni a jsDelivr.
// Otra ruta de Chrome: variable CHROME.
import { createServer } from "node:http";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { abrirChrome, espera } from "./cdp.mjs";

const RAIZ = normalize(fileURLToPath(new URL("../", import.meta.url)));
const SITIO = join(RAIZ, "sitio") + "/";
const FECHA = new Date().toISOString().slice(0, 10);
const SALIDA = process.argv[2] || join(RAIZ, "linea_base", FECHA);
mkdirSync(SALIDA, { recursive: true });

const PAGINAS = [
  ["portada", "index.html"], ["seccion", "trabajo.html"], ["perfil", "provincia.html?prov=58"], ["ficha", "petroleo.html#f-hidro-provincias"],
  ["articulo", "a-milei-empleo.html"], ["buscador", "index.html", "document.getElementById('lupa-btn').click()"],
  ["explorador", "relaciones.html"], ["pobreza", "pobreza/"],
];
const ANCHOS = [320, 360, 390, 430, 768, 1024, 1280, 1440, 1920];
// zoom: a 1280 píxeles de ventana con el 200% se ve como 640 de ancho con píxeles dobles, y con el 400%, como 320 con cuádruples
const ZOOMS = [["zoom200", 640, 2], ["zoom400", 320, 4]];

const TIPOS = {".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json", ".geojson": "application/json", ".csv": "text/csv; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml",
  ".wasm": "application/wasm", ".parquet": "application/octet-stream", ".woff2": "font/woff2"};
const servidor = createServer((req, res) => {
  let ruta = decodeURIComponent(new URL(req.url, "http://local").pathname);
  if (ruta.endsWith("/")) ruta += "index.html";
  const archivo = normalize(join(SITIO, ruta));
  if (!archivo.startsWith(SITIO)) { res.writeHead(403); res.end(); return; }
  try { const d = readFileSync(archivo); res.writeHead(200, {"Content-Type": TIPOS[extname(archivo)] || "application/octet-stream"}); res.end(d); }
  catch { res.writeHead(404); res.end(); }
});
await new Promise(r => servidor.listen(0, "127.0.0.1", r));
const B = `http://127.0.0.1:${servidor.address().port}/`;

const ch = await abrirChrome(9700 + Math.floor(Math.random() * 200));
const p = await ch.pestana();
// las métricas se anotan desde que empieza la carga
await p.send("Page.addScriptToEvaluateOnNewDocument", {source: `
  window.__lb = {cls: 0, lcp: 0};
  new PerformanceObserver(l => l.getEntries().forEach(e => { if (!e.hadRecentInput) __lb.cls += e.value; })).observe({type: "layout-shift", buffered: true});
  new PerformanceObserver(l => l.getEntries().forEach(e => { __lb.lcp = Math.max(__lb.lcp, e.startTime); })).observe({type: "largest-contentful-paint", buffered: true});`});

const REVISAR = `(() => {
  const ancho = document.documentElement.clientWidth;
  const corrida = document.documentElement.scrollWidth > ancho + 1;
  const fuera = [...document.querySelectorAll("main *, header *, footer *")].filter(el => {
    if (!el.offsetParent && getComputedStyle(el).position !== "fixed") return false;
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) return false;
    // lo que está adentro de algo que se desliza de costado (filas de secciones, tablas) no cuenta
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) { const o = getComputedStyle(a).overflowX; if (o === "auto" || o === "scroll" || o === "hidden") return false; }
    return r.right > ancho + 1 || r.left < -1;
  }).slice(0, 5).map(el => el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (el.classList[0] ? "." + el.classList[0] : ""));
  const chicos = [...document.querySelectorAll(".grafico svg text")].filter(t => {
    const r = t.getBoundingClientRect(); if (!r.height || !t.textContent.trim()) return false;
    const svg = t.ownerSVGElement, esc = svg.getBoundingClientRect().width / (svg.viewBox.baseVal.width || svg.getBoundingClientRect().width);
    return parseFloat(getComputedStyle(t).fontSize) * esc < 10;
  });
  const fichas = new Set(chicos.map(t => t.closest("article")?.id || "?"));
  return {corrida, fuera, chicos: chicos.length, fichasConChicos: [...fichas].slice(0, 6), cls: +__lb.cls.toFixed(3), lcp: Math.round(__lb.lcp)};
})()`;

const filas = [];
async function caso(nombre, pagina, accion, ancho, escala, etiqueta) {
  await p.send("Emulation.setDeviceMetricsOverride", {width: ancho, height: 900, deviceScaleFactor: escala, mobile: ancho < 768});
  await p.ir(B + pagina, 1500);
  if (accion) { await p.eval(accion); await espera(500); }
  const lb = await p.eval("JSON.stringify(window.__lb)");
  await p.recorrer(800, 120);
  if (accion) { await p.eval(accion); await espera(400); }
  const r = await p.eval(REVISAR);
  r.lcp = JSON.parse(lb).lcp;
  const s = await p.send("Page.captureScreenshot", {format: "png"});
  writeFileSync(join(SALIDA, `${nombre}-${etiqueta}.png`), Buffer.from(s.data, "base64"));
  filas.push({pagina: nombre, caso: etiqueta, ...r, errores: p.errores.length});
}
for (const [nombre, pagina, accion] of PAGINAS) {
  for (const a of ANCHOS) await caso(nombre, pagina, accion, a, 1, String(a));
  for (const [et, a, esc] of ZOOMS) await caso(nombre, pagina, accion, a, esc, et);
}
await ch.cerrar(); servidor.close();

writeFileSync(join(SALIDA, "resultado.json"), JSON.stringify({fecha: FECHA, filas}, null, 1));
const problemas = filas.filter(f => f.corrida || f.fuera.length || f.errores);
console.log(`Línea de base ${FECHA}: ${filas.length} capturas en ${SALIDA}`);
console.log(`Con la página corrida de costado o elementos afuera: ${problemas.length}`);
problemas.forEach(f => console.log(`  ${f.pagina} ${f.caso}: ${f.corrida ? "página corrida " : ""}${f.fuera.join(", ")}${f.errores ? ` ${f.errores} errores de JavaScript` : ""}`));
const chicas = filas.filter(f => f.chicos && Number(f.caso) < 768);
console.log(`En el celular, con textos de gráficos de menos de 10 píxeles: ${chicas.length}`);
chicas.forEach(f => console.log(`  ${f.pagina} ${f.caso}: ${f.chicos} textos (${f.fichasConChicos.join(", ")})`));
const cls = filas.map(f => f.cls).sort((a, b) => b - a), lcp = filas.map(f => f.lcp).sort((a, b) => b - a);
console.log(`CLS máximo ${cls[0]}, LCP máximo ${lcp[0]} ms (carga local de prueba, no medición de usuarios reales)`);
