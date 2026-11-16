// El texto en el HTML (plan técnico, fase 4, 16 de noviembre de 2026, aprobado por el autor el 11 de noviembre): los rastreadores de los
// buscadores de IA no ejecutan JavaScript, y el texto con cifras de Datina (el cuerpo de los artículos y la interpretación de cada ficha) lo
// escribe datina.js al cargar. Este paso, el último del armado (lo corre 03_construir_sitio.py), abre cada página en Chrome sin ventana, toma
// ese texto y lo deja escrito en el HTML. Al cargar, datina.js lo vuelve a escribir igual, así que la página no cambia a la vista.
// Para que armar dos veces dé los mismos archivos (pruebas.yml lo controla):
// - el reloj de la página queda fijo en la fecha de los datos (el argumento, AAAA-MM-DD), no en el día del armado,
// - Chrome arranca sin nada guardado (ninguna provincia elegida), no baja por la página (no se dibuja ningún gráfico fuera de la primera
//   pantalla) y espera a que no quede nada por bajar,
// - de cada artículo se guarda lo primero que datina.js escribe en él, antes de que se dibujen sus gráficos, y de cada párrafo con su texto
//   calculado (data-t), su texto sin marcas,
// - en las 24 páginas fijas de las provincias (tercera parte, el mismo día), las tarjetas del perfil, "Dónde se destaca", "Cómo cambió su
//   puesto" y los censos, ya completos y sin sus gráficos (cada svg queda vacío: los dibuja datina.js, que al cargar vuelve a escribir todo).
//   "Comparar con otra provincia" no entra: es un selector.
// Uso: node scripts/texto_en_html.mjs 2026-11-15   (Node 22 o más y Google Chrome: otra ruta, variable CHROME)
import { createServer } from "node:http";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { abrirChrome, espera } from "./cdp.mjs";

const SITIO = normalize(fileURLToPath(new URL("../sitio/", import.meta.url)));
const fecha = process.argv[2] || "";
if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) { console.error("Uso: node scripts/texto_en_html.mjs AAAA-MM-DD (la fecha de los datos)"); process.exit(2); }
const [a, m, d] = fecha.split("-").map(Number);
// las 12 del mediodía de la Argentina
const RELOJ = Date.UTC(a, m - 1, d, 15);

const TIPOS = {".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json", ".geojson": "application/json", ".csv": "text/csv; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml",
  ".ico": "image/x-icon", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8"};
const servidor = createServer((req, res) => {
  let ruta = decodeURIComponent(new URL(req.url, "http://local").pathname);
  if (ruta.endsWith("/")) ruta += "index.html";
  else if (!/\.[a-z0-9]+$/i.test(ruta)) ruta += ".html";
  const archivo = normalize(join(SITIO, ruta));
  if (!archivo.startsWith(SITIO)) { res.writeHead(403); res.end(); return; }
  try { const b = readFileSync(archivo); res.writeHead(200, {"Content-Type": TIPOS[extname(archivo)] || "application/octet-stream"}); res.end(b); }
  catch { res.writeHead(404); res.end(); }
});
await new Promise(r => servidor.listen(0, "127.0.0.1", r));
const B = `http://127.0.0.1:${servidor.address().port}/`;

// las páginas con algo para escribir: un artículo o un párrafo calculado. Sin las redirecciones ni la 404
const leer = f => readFileSync(join(SITIO, f), "utf8");
const PAGINAS = readdirSync(SITIO).filter(f => f.endsWith(".html") && f !== "404.html").filter(f => {
  const h = leer(f);
  return !h.includes("Esta página se mudó") && (/<article class="nota"/.test(h) || /\sdata-t="/.test(h) || /<body[^>]*\sdata-prov="/.test(h));
}).sort();

// lo que corre en la página antes que datina.js: el reloj fijo y el registro de lo primero que se escribe en cada artículo
const ANTES = `{
  const D = Date, T = ${RELOJ};
  function F(...a) { if (!new.target) return new D(T).toString(); return new D(...(a.length ? a : [T])); }
  F.prototype = D.prototype; F.now = () => T; F.UTC = D.UTC; F.parse = D.parse; window.Date = F;
  window.__notas = {};
  const ih = Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML");
  Object.defineProperty(Element.prototype, "innerHTML", {configurable: true, get() { return ih.get.call(this); }, set(v) {
    if (this.matches && this.matches("article.nota") && this.id && !(this.id in window.__notas)) window.__notas[this.id] = String(v);
    ih.set.call(this, v);
  }});
}`;

// las secciones de la página fija de cada provincia que arma datina.js con sus datos
const PROV = ["prov-grid", "prov-destaca", "prov-puestos", "prov-censos"];
const LEER = `(() => ({notas: window.__notas, dt: [...document.querySelectorAll("[data-t]")].map(e => [e.dataset.t, e.textContent]),
  prov: document.body.dataset.prov ? Object.fromEntries(${JSON.stringify(PROV)}.map(id => document.getElementById(id)).filter(Boolean).map(e => {
    const c = e.cloneNode(true); c.querySelectorAll("svg").forEach(s => s.replaceChildren());
    // los enlaces a una ficha de otra página (#f-empleo) los resuelve datina.js al tocarlos: en el HTML van con la dirección de su página,
    // como hace destinoDe en datina.js
    const I = window.DATINA.indice, pag = id => I.ubic[id] || I.ubic[(I.alias || {})[id]];
    c.querySelectorAll('a[href^="#"]').forEach(a => { const id = a.getAttribute("href").slice(1).split("?")[0], p = id && pag(id);
      if (p && p !== document.body.dataset.pagina) a.setAttribute("href", (p === "inicio" ? "./" : p) + (p === id ? "" : "#" + id)); });
    return [e.id, {html: c.innerHTML, oculto: e.hidden}]; })) : {}}))()`;

async function pestana(ch) {
  const p = await ch.pestana();
  await p.send("Network.enable");
  let enVuelo = 0, ultimo = Date.now();
  p.on("Network.requestWillBeSent", () => { enVuelo++; ultimo = Date.now(); });
  const fin = () => { enVuelo = Math.max(0, enVuelo - 1); ultimo = Date.now(); };
  p.on("Network.loadingFinished", fin); p.on("Network.loadingFailed", fin);
  await p.send("Page.addScriptToEvaluateOnNewDocument", {source: ANTES});
  await p.tamano(1440, 900);
  // espera a que no quede nada por bajar durante medio segundo (hasta 15 segundos)
  p.quieta = async () => { const t0 = Date.now(); while (Date.now() - t0 < 15000) { if (!enVuelo && Date.now() - ultimo > 500) return; await espera(100); } };
  p.reiniciar = () => { enVuelo = 0; ultimo = Date.now(); };
  return p;
}

const ch = await abrirChrome(9351);
const resultado = {}, problemas = [];
const cola = [...PAGINAS];
await Promise.all(Array.from({length: 4}, async () => {
  const p = await pestana(ch);
  for (let f; (f = cola.shift()); ) {
    p.reiniciar();
    await p.ir(B + f.replace(/\.html$/, "").replace(/^index$/, ""), 300);
    await p.quieta();
    resultado[f] = await p.eval(LEER);
    if (p.errores.length) problemas.push(`${f}: ${p.errores.slice(0, 3).join(" | ")}`);
  }
}));
await ch.cerrar();
servidor.close();
if (problemas.length) { console.error("Errores en las páginas al tomar su texto: el texto no se escribió.\n" + problemas.join("\n")); process.exit(1); }

const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// el contenido de un elemento con su id: desde su etiqueta hasta la que la cierra, contando las del mismo nombre que se abren adentro
function reemplazar(h, id, html, oculto) {
  const m = new RegExp(`<([a-z]+)\\b[^>]*\\sid="${reEsc(id)}"[^>]*>`).exec(h);
  if (!m) return null;
  const tag = m[1], ini = m.index + m[0].length, re = new RegExp(`<${tag}\\b|</${tag}>`, "g");
  re.lastIndex = ini;
  let n = 1, x;
  while ((x = re.exec(h))) { n += x[0].startsWith("</") ? -1 : 1; if (!n) break; }
  if (n) return null;
  const abre = m[0].replace(/\shidden(?=[\s>])/, "").replace(/>$/, oculto ? " hidden>" : ">");
  return h.slice(0, m.index) + abre + html + h.slice(x.index);
}
let nArt = 0, nPar = 0, nProv = 0;
for (const f of PAGINAS) {
  let h = leer(f);
  const {notas, dt, prov} = resultado[f];
  for (const [id, {html, oculto}] of Object.entries(prov)) {
    const nuevo = reemplazar(h, id, html, oculto);
    if (nuevo == null) { console.error(`${f}: no se encontró dónde termina #${id}`); process.exit(1); }
    h = nuevo; nProv++;
  }
  for (const [id, html] of Object.entries(notas)) {
    const re = new RegExp(`(<article class="nota"[^>]*\\bid="${reEsc(id)}"[^>]*>)(</article>)`);
    if (re.test(h)) { h = h.replace(re, (_, a, b) => a + html + b); nArt++; }
  }
  // un párrafo por clave: si la página tiene dos con la misma, no se escribe ninguno (no se sabe cuál es cuál)
  const cuenta = {};
  dt.forEach(([k]) => { cuenta[k] = (cuenta[k] || 0) + 1; });
  for (const [k, t] of dt) {
    if (cuenta[k] !== 1 || !t.trim()) continue;
    const re = new RegExp(`(<([a-z0-9]+)\\b[^>]*\\sdata-t="${reEsc(k)}"[^>]*>)(</\\2>)`);
    if ((h.match(new RegExp(re.source, "g")) || []).length === 1) { h = h.replace(re, (_, a, _t, b) => a + esc(t) + b); nPar++; }
  }
  writeFileSync(join(SITIO, f), h);
}
console.log(`Texto en el HTML: ${PAGINAS.length} páginas, ${nArt} artículos, ${nPar} párrafos calculados y ${nProv} secciones de las provincias.`);
