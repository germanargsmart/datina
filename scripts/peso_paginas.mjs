// Peso de cada página (plan de mejora, T2, 24 de noviembre de 2026, aprobada por el autor ese día): cuánto baja un visitante que abre la
// página por primera vez y la recorre hasta el final, comprimido con gzip como lo manda Cloudflare. Abre cada página de sitio/ en Chrome sin
// ventana y sin caché, baja por toda la página para que se dibuje cada gráfico y suma los archivos del sitio que pidió (la página, el
// estilo, el JavaScript, las tablas, las letras y las imágenes). Lo que llega de afuera (las teselas de los mapas) no cuenta.
// Compara con scripts/peso_paginas.json, el peso anotado de cada página: si alguna creció más de un 20% y más de 50 KB, termina con 1 y dice
// cuáles. Lo corre una vez por semana .github/workflows/semanal.yml, junto con prueba_320.mjs y linea_base.mjs.
// Uso: node scripts/peso_paginas.mjs              (compara con lo anotado)
//      node scripts/peso_paginas.mjs --guardar    (anota los pesos de hoy: después de un cambio que hace crecer una página a propósito)
// Node 22 o más y Google Chrome (otra ruta: variable CHROME).
import { createServer } from "node:http";
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { abrirChrome } from "./cdp.mjs";

const SITIO = normalize(fileURLToPath(new URL("../sitio/", import.meta.url)));
const REGISTRO = fileURLToPath(new URL("./peso_paginas.json", import.meta.url));
const CRECE = 0.2, MINIMO = 50;  // un aviso: más de un 20% y más de 50 KB por encima de lo anotado
const GUARDAR = process.argv.includes("--guardar");
// sin la 404 ni las direcciones viejas que llevan a otra página. Las 24 provincias son la misma página con otros datos: va una sola
const PAGINAS = readdirSync(SITIO).filter(f => f.endsWith(".html") && f !== "404.html"
  && (!f.startsWith("provincia-") || f === "provincia-neuquen.html")
  && !readFileSync(join(SITIO, f), "utf8").includes('http-equiv="refresh"')).sort();
const TIPOS = {".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json", ".geojson": "application/json", ".csv": "text/csv; charset=utf-8",
  ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".woff2": "font/woff2"};
const archivoDe = ruta => {
  if (ruta.endsWith("/")) ruta += "index.html";
  // como Cloudflare Pages: /trabajo sirve trabajo.html
  else if (!/\.[a-z0-9]+$/i.test(ruta)) ruta += ".html";
  return normalize(join(SITIO, ruta));
};
const servidor = createServer((req, res) => {
  const archivo = archivoDe(decodeURIComponent(new URL(req.url, "http://local").pathname));
  if (!archivo.startsWith(SITIO)) { res.writeHead(403); res.end(); return; }
  try { const d = readFileSync(archivo); res.writeHead(200, {"Content-Type": TIPOS[extname(archivo)] || "application/octet-stream"}); res.end(d); }
  catch { res.writeHead(404); res.end(); }
});
await new Promise(r => servidor.listen(0, "127.0.0.1", r));
const B = `http://127.0.0.1:${servidor.address().port}/`;

// lo comprimido de cada archivo, una sola vez: las letras y las imágenes ya vienen comprimidas y Cloudflare no las vuelve a comprimir
const YA = new Set([".woff2", ".webp", ".png", ".jpg", ".wasm", ".parquet"]);
const memo = new Map();
const comprimido = archivo => {
  if (!memo.has(archivo)) { const d = readFileSync(archivo); memo.set(archivo, YA.has(extname(archivo)) ? d.length : gzipSync(d, {level: 6}).length); }
  return memo.get(archivo);
};

const ch = await abrirChrome(9500 + Math.floor(Math.random() * 200)), p = await ch.pestana();
await p.send("Network.enable");
await p.send("Network.setCacheDisabled", {cacheDisabled: true});
await p.tamano(1440, 900);
const hoy = {};
for (const pg of PAGINAS) {
  await p.ir(`${B}${pg}`, 1500);
  await p.recorrer();
  await new Promise(r => setTimeout(r, 800));
  const urls = JSON.parse(await p.eval(`JSON.stringify([location.href, ...performance.getEntriesByType("resource").map(r => r.name)])`));
  const propios = new Set(urls.filter(u => u.startsWith(B)).map(u => archivoDe(decodeURIComponent(new URL(u).pathname))).filter(existsSync));
  hoy[pg] = Math.round([...propios].reduce((s, f) => s + comprimido(f), 0) / 1000);
}
await ch.cerrar();
servidor.close();

if (GUARDAR || !existsSync(REGISTRO)) {
  writeFileSync(REGISTRO, JSON.stringify(hoy, null, 1) + "\n");
  console.log(`Peso de ${PAGINAS.length} páginas anotado en scripts/peso_paginas.json.`);
  process.exit(0);
}
const antes = JSON.parse(readFileSync(REGISTRO, "utf8"));
const filas = PAGINAS.map(pg => [pg, antes[pg], hoy[pg]]);
const crecen = filas.filter(([, a, h]) => a != null && h > a * (1 + CRECE) && h - a > MINIMO);
console.log("Página".padEnd(34) + "  anotado      hoy");
for (const [pg, a, h] of filas) console.log(`${pg.padEnd(34)} ${a == null ? "      -" : String(a).padStart(6) + " KB"} ${String(h).padStart(6)} KB${crecen.some(c => c[0] === pg) ? "  creció" : ""}`);
const nuevas = filas.filter(([, a]) => a == null).map(([pg]) => pg);
if (nuevas.length) console.log(`Sin peso anotado (páginas nuevas): ${nuevas.join(", ")}. Se anotan con --guardar.`);
if (crecen.length) {
  console.log(`\n${crecen.length} ${crecen.length === 1 ? "página creció" : "páginas crecieron"} más de un ${CRECE * 100}% y más de ${MINIMO} KB: ` +
    crecen.map(([pg, a, h]) => `${pg} (${a} a ${h} KB)`).join(", ") +
    ". Si fue a propósito, node scripts/peso_paginas.mjs --guardar y subir scripts/peso_paginas.json.");
  process.exit(1);
}
console.log(`\nNinguna página creció más de un ${CRECE * 100}% y más de ${MINIMO} KB.`);
process.exit(0);
