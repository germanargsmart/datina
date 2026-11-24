// Huella de estilos (plan de mejora, T14, 24 de noviembre de 2026): una herramienta para usar a mano antes y después de un cambio de diseño que
// no tendría que verse. Abre cada página en Chrome sin ventana, con movimiento reducido, baja por toda la página para que se dibuje cada ficha
// y guarda, de cada elemento visible, su lugar en la página y los estilos que se ven (letra, tamaño, color, fondo, márgenes, rellenos, bordes y
// radios). Con --comparar dice qué cambió entre dos huellas. Se usó una así para el cambio de h3 a h2 del 25 de octubre de 2026, y no había
// quedado en scripts/. No es una prueba que corra sola: la huella depende de los datos, así que las dos tienen que salir del mismo armado.
// Uso: node scripts/huella_estilos.mjs ANTES.json                    (las seis páginas de siempre, en 1440 y 390 píxeles)
//      node scripts/huella_estilos.mjs ANTES.json --todas            (todas las páginas de sitio/, varios minutos)
//      node scripts/huella_estilos.mjs ANTES.json --paginas trabajo.html,index.html --anchos 1440
//      ... cambio, python scripts/03_construir_sitio.py ...
//      node scripts/huella_estilos.mjs DESPUES.json (con las mismas opciones)
//      node scripts/huella_estilos.mjs --comparar ANTES.json DESPUES.json   (termina con 1 si algo cambió)
// Los archivos de la huella van fuera del repositorio (pesan varios MB). Node 22 o más y Google Chrome (otra ruta: variable CHROME).
import { createServer } from "node:http";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { abrirChrome } from "./cdp.mjs";

const args = process.argv.slice(2);
const opcion = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };

if (args[0] === "--comparar") {
  const [a, b] = [args[1], args[2]].map(f => JSON.parse(readFileSync(f, "utf8")));
  const difs = [];
  for (const clave of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[clave] || {}, y = b[clave] || {};
    if (!a[clave] || !b[clave]) { difs.push(`${clave}: está solo en ${a[clave] ? "la primera" : "la segunda"} huella`); continue; }
    for (const el of new Set([...Object.keys(x), ...Object.keys(y)])) {
      if (x[el] === y[el]) continue;
      if (x[el] == null || y[el] == null) { difs.push(`${clave} ${el}: ${x[el] == null ? "nuevo" : "ya no está"}`); continue; }
      // solo las propiedades que cambiaron, no la línea entera
      const px = Object.fromEntries(x[el].split("; ").map(s => s.split("=")));
      const py = Object.fromEntries(y[el].split("; ").map(s => s.split("=")));
      const cambios = Object.keys({...px, ...py}).filter(k => px[k] !== py[k]).map(k => `${k} ${px[k]} → ${py[k]}`);
      difs.push(`${clave} ${el}: ${cambios.join(", ")}`);
    }
  }
  if (!difs.length) { console.log("Las dos huellas son iguales."); process.exit(0); }
  console.log(`${difs.length} diferencias:`);
  difs.slice(0, 200).forEach(d => console.log("  " + d));
  if (difs.length > 200) console.log(`  ... y ${difs.length - 200} más`);
  process.exit(1);
}

const salida = args[0];
if (!salida || salida.startsWith("--")) { console.error("Falta el archivo de la huella: node scripts/huella_estilos.mjs ARCHIVO.json"); process.exit(2); }
const SITIO = normalize(fileURLToPath(new URL("../sitio/", import.meta.url)));
const SEIS = ["index.html", "trabajo.html", "a-coparticipacion.html", "provincia-neuquen.html", "departamentos.html", "catalogo.html"];
// sin la 404 ni las direcciones viejas que llevan a otra página (REDIRECCIONES en 03_construir_sitio.py)
const PAGINAS = opcion("--paginas") ? opcion("--paginas").split(",")
  : args.includes("--todas")
  ? readdirSync(SITIO).filter(f => f.endsWith(".html") && f !== "404.html" && !readFileSync(join(SITIO, f), "utf8").includes('http-equiv="refresh"')).sort()
  : SEIS;
const ANCHOS = (opcion("--anchos") || "1440,390").split(",").map(Number);
const TIPOS = {".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json", ".geojson": "application/json", ".csv": "text/csv; charset=utf-8",
  ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2"};
const servidor = createServer((req, res) => {
  let ruta = decodeURIComponent(new URL(req.url, "http://local").pathname);
  if (ruta.endsWith("/")) ruta += "index.html";
  // como Cloudflare Pages: /trabajo sirve trabajo.html
  else if (!/\.[a-z0-9]+$/i.test(ruta)) ruta += ".html";
  const archivo = normalize(join(SITIO, ruta));
  if (!archivo.startsWith(SITIO)) { res.writeHead(403); res.end(); return; }
  try { const d = readFileSync(archivo); res.writeHead(200, {"Content-Type": TIPOS[extname(archivo)] || "application/octet-stream"}); res.end(d); }
  catch { res.writeHead(404); res.end(); }
});
await new Promise(r => servidor.listen(0, "127.0.0.1", r));
const B = `http://127.0.0.1:${servidor.address().port}/`;

// cada elemento visible, nombrado por su camino desde el body (etiqueta, id o clases y su lugar entre los hermanos), con su caja redondeada al
// píxel y los estilos que se ven. Los dibujos de los gráficos (lo que hay dentro de cada svg) quedan afuera: cambian con los datos y los mide
// la prueba de páginas. El svg mismo sí entra, con su caja
const MEDIR = `(() => {
  const PROPS = ["display", "position", "font-family", "font-size", "font-weight", "font-stretch", "font-style", "font-variation-settings",
    "line-height", "letter-spacing", "text-transform", "text-align", "text-decoration-line", "color", "background-color", "background-image",
    "margin-top", "margin-right", "margin-bottom", "margin-left", "padding-top", "padding-right", "padding-bottom", "padding-left",
    "border-top-width", "border-right-width", "border-bottom-width", "border-left-width", "border-top-color", "border-bottom-color",
    "border-top-left-radius", "box-shadow", "gap", "opacity", "visibility"];
  // el nombre de cada elemento: su id o, si no tiene, su primera clase. Las demás clases suelen ser de estado (la barra "clara" arriba de la
  // portada, el sol "quieto"): si cambian, lo que cambia en serio es un estilo, y eso sí se compara
  const nombre = e => e.tagName.toLowerCase() + (e.id ? "#" + e.id : e.classList.length ? "." + e.classList[0] : "");
  const camino = e => { const p = []; for (; e && e !== document.body; e = e.parentElement) {
    const h = e.parentElement ? [...e.parentElement.children].filter(x => x.tagName === e.tagName) : [];
    p.unshift(nombre(e) + (h.length > 1 && !e.id ? ":" + (h.indexOf(e) + 1) : "")); } return p.join(" > "); };
  const res = {};
  for (const e of document.body.querySelectorAll("*")) {
    if (e.closest("svg") && e.tagName.toLowerCase() !== "svg") continue;
    // lo de adentro de los mapas con calles (Leaflet y MapLibre): las teselas llegan de servidores de afuera, cada vez en otro orden
    if (e.parentElement && e.parentElement.closest(".leaflet-container, .maplibregl-map")) continue;
    if (/^(SCRIPT|STYLE|TEMPLATE|NOSCRIPT)$/.test(e.tagName) || e.id === "tip") continue;
    const r = e.getBoundingClientRect();
    if (!r.width && !r.height) continue;
    const cs = getComputedStyle(e);
    res[camino(e)] = ["x=" + Math.round(r.left + scrollX), "y=" + Math.round(r.top + scrollY), "w=" + Math.round(r.width), "h=" + Math.round(r.height),
      ...PROPS.map(p => p + "=" + cs.getPropertyValue(p))].join("; ");
  }
  return res;
})()`;

const ch = await abrirChrome(9700 + Math.floor(Math.random() * 200)), p = await ch.pestana();
await p.send("Emulation.setEmulatedMedia", {features: [{name: "prefers-reduced-motion", value: "reduce"}]});
const huella = {};
let n = 0;
for (const W of ANCHOS) {
  await p.tamano(W, 900);
  for (const pg of PAGINAS) {
    await p.ir(`${B}${pg}`, 1500);
    await p.recorrer();  // los gráficos se dibujan al entrar en pantalla: baja por toda la página y vuelve arriba
    await new Promise(r => setTimeout(r, 600));  // lo que cambia al volver arriba (la barra de la portada) termina de cambiar
    huella[`${pg} en ${W}`] = await p.eval(MEDIR);
    n += Object.keys(huella[`${pg} en ${W}`]).length;
    if (p.errores.length) console.log(`${pg} en ${W}: ${p.errores.slice(0, 3).join(" | ")}`);
  }
}
await ch.cerrar();
servidor.close();
writeFileSync(salida, JSON.stringify(huella));
console.log(`Huella de estilos: ${PAGINAS.length} ${PAGINAS.length === 1 ? "página" : "páginas"} en ${ANCHOS.join(" y ")} píxeles, ${n} elementos, en ${salida}.`);
