// Lighthouse en las seis páginas del plan técnico, en celular y en computadora (fase 0, 11 de noviembre de 2026). No es una prueba: es la
// medición de base que queda en docs/roadmap/PLAN_TECNICO.md para comparar después de las fases 4 y 5. Sirve sitio/ con brotli o gzip, como
// Cloudflare, y corre Lighthouse varias veces por página: anota la mediana de cada puntaje y de los tiempos.
// Lighthouse no es parte del proyecto: se instala aparte (npm install lighthouse@13.6.0 en una carpeta fuera del repositorio) y se le pasa la
// ruta de su cli/index.js en la variable LIGHTHOUSE. Usa el Google Chrome de la computadora (otra ruta: variable CHROME_PATH).
// Uso: LIGHTHOUSE=.../node_modules/lighthouse/cli/index.js node scripts/medir_lighthouse.mjs [celular|computadora] [corridas]
import { createServer } from "node:http";
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { join, extname, normalize } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { brotliCompressSync, gzipSync } from "node:zlib";

const LH = process.env.LIGHTHOUSE;
if (!LH) { console.error("Falta la variable LIGHTHOUSE con la ruta de lighthouse/cli/index.js"); process.exit(1); }
const SITIO = normalize(fileURLToPath(new URL("../sitio/", import.meta.url)));
const PAGINAS = ["index.html", "trabajo.html", "a-coparticipacion.html", "provincia-neuquen.html", "mesas.html", "catalogo.html"];
const MODOS = process.argv[2] ? [process.argv[2]] : ["celular", "computadora"];
const CORRIDAS = Number(process.argv[3] || 3);
const TIPOS = {".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json", ".geojson": "application/json", ".csv": "text/csv; charset=utf-8",
  ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml"};
const COMPRIMIBLE = /^(text\/|application\/(json|xml)|image\/svg)/;
const memo = new Map();
const servidor = createServer((req, res) => {
  let ruta = decodeURIComponent(new URL(req.url, "http://local").pathname);
  if (ruta.endsWith("/")) ruta += "index.html";
  const archivo = normalize(join(SITIO, ruta));
  if (!archivo.startsWith(SITIO)) { res.writeHead(403); res.end(); return; }
  let d;
  try { d = readFileSync(archivo); } catch { res.writeHead(404); res.end(); return; }
  const tipo = TIPOS[extname(archivo)] || "application/octet-stream", acepta = req.headers["accept-encoding"] || "";
  const enc = !COMPRIMIBLE.test(tipo) ? null : /\bbr\b/.test(acepta) ? "br" : /gzip/.test(acepta) ? "gzip" : null;
  const cab = {"Content-Type": tipo};
  if (enc) {
    const k = enc + archivo;
    if (!memo.has(k)) memo.set(k, enc === "br" ? brotliCompressSync(d) : gzipSync(d, {level: 9}));
    d = memo.get(k); cab["Content-Encoding"] = enc;
  }
  res.writeHead(200, cab); res.end(d);
});
await new Promise(r => servidor.listen(0, "127.0.0.1", r));
const B = `http://127.0.0.1:${servidor.address().port}/`;

const CATS = ["performance", "accessibility", "best-practices", "seo"];
const NOMBRE = {performance: "Rendimiento", accessibility: "Accesibilidad", "best-practices": "Prácticas", seo: "SEO"};
const mediana = xs => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const tmp = mkdtempSync(join(tmpdir(), "lh-"));
for (const modo of MODOS) {
  console.log(`\n${modo} (mediana de ${CORRIDAS} corridas)`);
  console.log("Página".padEnd(26) + CATS.map(c => NOMBRE[c].padStart(14)).join("") + "     FCP     LCP     TBT    CLS");
  for (const pg of PAGINAS) {
    const r = {p: {}, fcp: [], lcp: [], tbt: [], cls: []};
    for (let i = 0; i < CORRIDAS; i++) {
      const salida = join(tmp, "r.json");
      const args = [LH, `${B}${pg}`, "--quiet", "--output=json", `--output-path=${salida}`, `--only-categories=${CATS.join(",")}`,
        "--chrome-flags=--headless=new --no-first-run --no-default-browser-check"];
      if (modo === "computadora") args.push("--preset=desktop");
      // sin bloquear: el servidor de este mismo proceso tiene que seguir contestando mientras corre Lighthouse
      await promisify(execFile)(process.execPath, args, {timeout: 180000});
      const j = JSON.parse(readFileSync(salida, "utf8"));
      for (const c of CATS) (r.p[c] ||= []).push(Math.round(100 * (j.categories[c]?.score ?? 0)));
      r.fcp.push(j.audits["first-contentful-paint"].numericValue);
      r.lcp.push(j.audits["largest-contentful-paint"].numericValue);
      r.tbt.push(j.audits["total-blocking-time"].numericValue);
      r.cls.push(j.audits["cumulative-layout-shift"].numericValue);
    }
    const s = ms => (mediana(ms) / 1000).toFixed(1).padStart(6) + "s";
    console.log(pg.padEnd(26) + CATS.map(c => String(mediana(r.p[c])).padStart(14)).join("")
      + `  ${s(r.fcp)}  ${s(r.lcp)}  ${String(Math.round(mediana(r.tbt))).padStart(5)}ms  ${mediana(r.cls).toFixed(3)}`);
  }
}
rmSync(tmp, {recursive: true, force: true});
servidor.close();
process.exit(0);
