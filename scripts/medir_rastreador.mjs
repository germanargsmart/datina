// Qué texto ve un rastreador que no ejecuta JavaScript (plan técnico, fase 0, 11 de noviembre de 2026). No es una prueba: es la medición de base
// que queda en docs/roadmap/PLAN_TECNICO.md para comparar después de la fase 4 (el texto en el HTML). Abre cada página dos veces en Chrome sin
// ventana, una con JavaScript y otra sin él, y cuenta las palabras y las cifras del contenido (sin la barra, los menús ni el pie), si el título
// (h1) tiene texto y cuántos párrafos de interpretación (p.lead) quedan vacíos.
// Uso: node scripts/medir_rastreador.mjs            (las seis páginas del plan)
//      node scripts/medir_rastreador.mjs --todas    (todas las páginas de sitio/, unos 6 minutos)
// Node 22 o más y Google Chrome (otra ruta: variable CHROME).
import { createServer } from "node:http";
import { readFileSync, readdirSync } from "node:fs";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { abrirChrome } from "./cdp.mjs";

const SITIO = normalize(fileURLToPath(new URL("../sitio/", import.meta.url)));
const SEIS = ["index.html", "trabajo.html", "a-coparticipacion.html", "provincia-neuquen.html", "mesas.html", "catalogo.html"];
const PAGINAS = process.argv.includes("--todas")
  ? readdirSync(SITIO).filter(f => f.endsWith(".html") && f !== "404.html").sort()
  : SEIS;
const TIPOS = {".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json", ".geojson": "application/json", ".csv": "text/csv; charset=utf-8",
  ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2"};
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

// el contenido: el cuerpo sin la barra, los menús, el pie, el código ni los dibujos. textContent y no innerText: un rastreador lee también
// lo que está oculto (los capítulos que no están a la vista)
const MEDIR = `(() => {
  const c = document.body.cloneNode(true);
  c.querySelectorAll("header, nav, footer, script, style, template, svg, noscript").forEach(e => e.remove());
  const t = c.textContent.replace(/\\s+/g, " ").trim();
  const h1 = document.querySelector("h1");
  const leads = [...document.querySelectorAll("p.lead")];
  return {palabras: t ? t.split(" ").length : 0, cifras: (t.match(/\\d[\\d.,]*/g) || []).length,
    h1: !!(h1 && h1.textContent.trim()), leads: leads.length, vacios: leads.filter(p => !p.textContent.trim()).length};
})()`;

const ch = await abrirChrome(9500 + Math.floor(Math.random() * 200)), p = await ch.pestana();
const filas = [];
for (const pg of PAGINAS) {
  const r = {};
  for (const [modo, sinJs] of [["con", false], ["sin", true]]) {
    await p.send("Emulation.setScriptExecutionDisabled", {value: sinJs});
    await p.ir(`${B}${pg}`, sinJs ? 300 : 1500);
    r[modo] = await p.eval(MEDIR);
  }
  filas.push([pg, r]);
  const pct = r.con.palabras ? Math.round(100 * r.sin.palabras / r.con.palabras) : 100;
  console.log(`${pg.padEnd(34)} palabras ${String(r.sin.palabras).padStart(6)} de ${String(r.con.palabras).padStart(6)} (${String(pct).padStart(3)}%)`
    + `  cifras ${String(r.sin.cifras).padStart(5)} de ${String(r.con.cifras).padStart(5)}  h1 ${r.sin.h1 ? "sí" : "NO"}`
    + `  interpretaciones vacías ${r.sin.vacios} de ${r.sin.leads}`);
}
if (filas.length > 1) {
  const s = (m, k) => filas.reduce((a, [, r]) => a + r[m][k], 0);
  console.log(`\n${filas.length} páginas: palabras ${s("sin", "palabras")} de ${s("con", "palabras")}`
    + ` (${Math.round(100 * s("sin", "palabras") / s("con", "palabras"))}%), cifras ${s("sin", "cifras")} de ${s("con", "cifras")}`
    + ` (${Math.round(100 * s("sin", "cifras") / s("con", "cifras"))}%), sin h1 sin JavaScript ${filas.filter(([, r]) => !r.sin.h1).length},`
    + ` interpretaciones vacías ${s("sin", "vacios")} de ${s("sin", "leads")}`);
}
await ch.cerrar();
servidor.close();
process.exit(0);
