// Cuánto baja y cuánto JavaScript corre cada página (plan de mejora, D2, 4 de noviembre de 2026). No es una prueba: es la medición que queda en
// docs/roadmap/ESTADO.md antes y después de un cambio de rendimiento. Con el procesador 4 veces más lento y sin caché, la mediana de 5 cargas de cada
// página, en Chrome sin ventana. El tiempo cambia de una computadora a otra: se comparan dos corridas en la misma, no con otra medición.
// Uso: node scripts/medir_carga.mjs   (Node 22 o más y Google Chrome. Otra ruta de Chrome: variable CHROME)
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { brotliCompressSync, gzipSync } from "node:zlib";
import { abrirChrome } from "./cdp.mjs";

const SITIO = normalize(fileURLToPath(new URL("../sitio/", import.meta.url)));
const PAGINAS = ["contacto.html", "index.html", "trabajo.html", "politica.html", "provincia-neuquen.html", "a-coparticipacion.html"];
const CARGAS = 5;
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
const B = `http://127.0.0.1:${servidor.address().port}/`;

const kb = n => (n / 1000).toFixed(0).padStart(5) + " KB";
for (const f of ["datos/fichas.js", "datina.js", "datina.css"]) {
  const b = readFileSync(join(SITIO, f));
  console.log(`${f.padEnd(16)} ${kb(b.length)}, gzip ${kb(gzipSync(b, {level: 9}).length)}, brotli ${kb(brotliCompressSync(b).length)}`);
}

const ch = await abrirChrome(9700 + Math.floor(Math.random() * 200)), p = await ch.pestana();
await p.send("Performance.enable");
await p.send("Network.enable");
await p.send("Network.setCacheDisabled", {cacheDisabled: true});
await p.send("Emulation.setCPUThrottlingRate", {rate: 4});
const mediana = xs => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
for (const pg of PAGINAS) {
  const js = [], tarea = [], bytes = [];
  for (let i = 0; i < CARGAS; i++) {
    await p.ir(`${B}${pg}`, 2000);
    const m = Object.fromEntries((await p.send("Performance.getMetrics")).metrics.map(x => [x.name, x.value]));
    js.push(m.ScriptDuration * 1000);
    tarea.push(m.TaskDuration * 1000);
    bytes.push(await p.eval(`performance.getEntriesByType("resource").filter(r => /\\/datos\\/.*\\.(js|json)/.test(r.name)).reduce((s, r) => s + r.decodedBodySize, 0)`));
  }
  console.log(`${pg.padEnd(26)} JavaScript ${mediana(js).toFixed(0).padStart(5)} ms, tareas ${mediana(tarea).toFixed(0).padStart(5)} ms, datos ${kb(mediana(bytes))}`);
}
await ch.cerrar();
servidor.close();
process.exit(0);
