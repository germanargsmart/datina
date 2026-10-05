// Prueba de las páginas armadas (etapa 17, octubre de 2026). Abre cada página del sitio en Chrome sin ventana, la recorre para que se
// dibujen los gráficos y revisa que no haya errores de JavaScript, que ningún texto diga NaN, undefined, null o Infinity, ni quede un
// {{dato}} sin completar, que "En cifras" tenga sus cinco tarjetas completas en las 12 secciones (sin provincia y con dos provincias
// elegidas) y que el perfil provincial tenga todos sus valores.
// La corre la actualización mensual después de armar el sitio: si encuentra un problema, se detiene y no se guarda ni se publica nada.
// Uso: node scripts/prueba_paginas.mjs   (Node 22 o más y Google Chrome. Otra ruta de Chrome: variable CHROME)
import { createServer } from "node:http";
import { readFileSync, readdirSync } from "node:fs";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { abrirChrome, espera } from "./cdp.mjs";

const SITIO = normalize(fileURLToPath(new URL("../sitio/", import.meta.url)));
// páginas que solo redirigen a otra
const SALTEAR = new Set(["emprendedores.html"]);
// las 17 secciones con "En cifras" y dos provincias para probarla: Neuquén (con la aclaración de Aprender) y la Ciudad (con la de empleo)
const SECCIONES = ["trabajo", "economia", "empresas", "pobreza", "salud", "seguridad", "educacion", "poblacion", "migraciones", "politica", "movilidad", "construccion", "energia", "petroleo",
  "turismo", "naturaleza", "curiosidades"];
const PROVINCIAS = ["58", "02"];

const TIPOS = {".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json", ".geojson": "application/json", ".csv": "text/csv; charset=utf-8",
  ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8"};
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

const problemas = [];
const ch = await abrirChrome(9500 + Math.floor(Math.random() * 400));
const p = await ch.pestana();
await p.tamano(1280, 900);

// textos visibles y de los gráficos con un valor que no se pudo calcular
const MALOS = `(() => {
  const t = document.body.innerText + "\\n" + [...document.querySelectorAll("svg text")].map(x => x.textContent).join("\\n");
  return [...t.matchAll(/.{0,50}(\\bNaN\\b|\\bundefined\\b|\\bnull\\b|\\bInfinity\\b|\\[object Object\\]|\\{\\{[\\w.]+\\}\\}).{0,30}/g)].map(m => m[0].trim()).slice(0, 5);
})()`;

async function revisarPagina(pg, intento = 1) {
  await p.ir(B + pg, 1200);
  await p.recorrer();
  await espera(500);
  const malos = await p.eval(MALOS), errores = [...p.errores];
  if ((malos.length || errores.length) && intento === 1) return revisarPagina(pg, 2);   // una segunda vez, por si fue la red
  malos.forEach(m => problemas.push(`${pg}: texto con un valor sin calcular: «${m}»`));
  errores.forEach(e => problemas.push(`${pg}: ${e}`));
}

const CIFRAS = `(() => {
  const c = [...document.querySelectorAll(".en-cifras:not(.esqueleto) .cifra")];
  return {n: c.length, vacias: c.filter(x => !x.classList.contains("invita") && !(x.querySelector(".c-num")?.textContent || "").trim()).length,
    nums: c.map(x => (x.querySelector(".c-num")?.textContent || "").trim()), textos: c.map(x => x.innerText.replace(/\\s+/g, " ").trim())};
})()`;
async function revisarCifras(sec, prov) {
  await p.ir(`${B}${sec}.html${prov ? `?prov=${prov}` : ""}`, 1000);
  const r = await p.eval(CIFRAS), donde = `${sec}.html${prov ? ` con la provincia ${prov}` : ""}`;
  if (r.n !== 5) problemas.push(`${donde}: "En cifras" tiene ${r.n} tarjetas y no 5`);
  if (r.vacias) problemas.push(`${donde}: "En cifras" tiene ${r.vacias} tarjetas sin cifra`);
  // la cifra va pegada al texto de la tarjeta: se revisa aparte, y el texto con sus renglones separados
  r.textos.filter((t, i) => /NaN|undefined|null|Infinity/.test(r.nums[i]) || /\bNaN\b|\bundefined\b|\bnull\b|\bInfinity\b/.test(t))
    .forEach(t => problemas.push(`${donde}: tarjeta con un valor sin calcular: «${t.slice(0, 90)}»`));
  p.errores.forEach(e => problemas.push(`${donde}: ${e}`));
}

const paginas = readdirSync(SITIO).filter(f => f.endsWith(".html") && !SALTEAR.has(f)).sort();
for (const pg of paginas) await revisarPagina(pg);
// "En cifras" sin provincia (el perfil nuevo no tiene ninguna guardada) y después con cada provincia
for (const sec of SECCIONES) await revisarCifras(sec, null);
for (const prov of PROVINCIAS) {
  for (const sec of SECCIONES) await revisarCifras(sec, prov);
  await p.ir(`${B}provincia.html?prov=${prov}`, 1200);
  const perfil = await p.eval(`[...document.querySelectorAll("#prov-grid .dp")].map(d => d.querySelector(".dp-num").textContent.trim())`);
  if (!perfil.length || perfil.some(v => !v || /NaN|undefined/.test(v))) problemas.push(`provincia.html con la provincia ${prov}: perfil incompleto (${perfil.join(" | ")})`);
}
await ch.cerrar();
servidor.close();

console.log(`Páginas revisadas: ${paginas.length}. "En cifras": ${SECCIONES.length} secciones, sin provincia y con ${PROVINCIAS.length} provincias.`);
if (problemas.length) {
  console.log(`\nProblemas (${problemas.length}):\n- ` + problemas.join("\n- "));
  process.exit(1);
}
console.log("Todo en orden.");
