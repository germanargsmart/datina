// Prueba de las páginas en anchos de celular chico (24 de octubre de 2026): abre todas las páginas del sitio armado, el Explorador de
// relaciones en tabla y el consultor de pobreza en 320, 360 y 390 píxeles, las recorre para que se dibuje todo y controla que ninguna se
// corra de costado. 320 es el ancho del zoom del 400% que pide WCAG 2.2 (criterio 1.4.10, "Reflow"). Si una se corre, dice qué elementos
// se salen (los que están dentro de algo con su propio desplazamiento, como las filas de píldoras, no cuentan).
// No la corre la actualización mensual: se corre a mano después de un cambio de diseño (datina.css, la plantilla o textos largos nuevos).
// Uso: node scripts/prueba_320.mjs [ancho1,ancho2]   (Node 22 o más y Google Chrome. Otra ruta de Chrome: variable CHROME)
import { createServer } from "node:http";
import { readFileSync, readdirSync } from "node:fs";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { abrirChrome } from "./cdp.mjs";

const SITIO = normalize(fileURLToPath(new URL("../sitio/", import.meta.url)));
const ANCHOS = (process.argv[2] || "320,360,390").split(",").map(Number);
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
const PAGINAS = [...readdirSync(SITIO).filter(f => f.endsWith(".html") && f !== "emprendedores.html").sort(), "relaciones.html?v=tabla", "pobreza/index.html"];
// los elementos que corren la página: los que pasan el borde derecho sin estar dentro de algo con su propio desplazamiento o recortado
const MEDIR = `(() => { const d = document.documentElement, fuera = [];
  if (d.scrollWidth <= d.clientWidth + 1) return JSON.stringify({sobra: 0, fuera});
  for (const e of document.querySelectorAll("body *")) {
    const q = e.getBoundingClientRect();
    if (!q.width || q.right <= d.clientWidth + 1 || e.closest("svg") || getComputedStyle(e).position === "fixed") continue;
    let a = e.parentElement, encerrado = false;
    for (; a && a !== document.body; a = a.parentElement) if (getComputedStyle(a).overflowX !== "visible" || getComputedStyle(a).position === "fixed") { encerrado = true; break; }
    if (!encerrado && !fuera.some(o => o.contains(e))) fuera.push(e);
  }
  const nombre = e => e.tagName.toLowerCase() + (e.id ? "#" + e.id : "") + (typeof e.className === "string" && e.className.trim() ? "." + e.className.trim().split(/\\s+/).join(".") : "");
  return JSON.stringify({sobra: d.scrollWidth - d.clientWidth, fuera: fuera.slice(0, 4).map(e => nombre(e) + " (" + e.textContent.trim().slice(0, 40) + ")")});
})()`;

const problemas = [];
const ch = await abrirChrome(9500 + Math.floor(Math.random() * 400)), p = await ch.pestana();
for (const w of ANCHOS) {
  await p.tamano(w, 800);
  for (const pg of PAGINAS) {
    await p.ir(B + pg, 900); await p.recorrer(900, 60);
    // en las páginas con capítulos se ve uno por vez (28 de octubre de 2026): se mide cada uno
    for (let i = 0, nc = await p.eval(`document.querySelectorAll(".capitulos a").length`); i < Math.max(nc, 1); i++) {
      if (i) { await p.eval(`document.querySelectorAll(".capitulos a")[${i}].click()`); await p.recorrer(900, 60); }
      const r = JSON.parse(await p.eval(MEDIR));
      if (r.sobra > 1) problemas.push(`${pg}${i ? ` (capítulo ${i + 1})` : ""} en ${w} píxeles se corre ${r.sobra} de costado: ${r.fuera.join(", ")}`);
    }
  }
}
await ch.cerrar(); servidor.close();
if (problemas.length) { console.log(problemas.join("\n")); process.exit(1); }
console.log(`Ninguna página se corre de costado: ${PAGINAS.length} páginas en ${ANCHOS.join(", ")} píxeles.`);
process.exit(0);
