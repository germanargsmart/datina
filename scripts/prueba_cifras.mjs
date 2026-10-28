// Prueba de "cifras dobles" (plan de mejora, E11 y T7, 27 de octubre de 2026). La auditoría encontró fichas cuya cifra destacada medía otra
// cosa que su gráfico: la tasa del plazo fijo arriba de un gráfico del dólar, las ventas de un mes arriba de las de doce meses, los fallos
// arriba de los casos. Regla: la cifra destacada, la descripción y la vista inicial usan la misma medida y el mismo período.
// Controla que el número de la cifra destacada de cada ficha esté escrito en su vista inicial: en el texto del gráfico (rótulos, valores, la
// línea del país) o en su "Ver tabla". Las fichas que muestran a propósito otra cifra van en EXCEPCIONES, con el motivo.
// Cuando se armó la prueba, 44 fichas no cumplían la regla al pie de la letra. Casi todas muestran una cifra derivada de lo que grafican
// (una variación, un total, el valor del país sobre un gráfico por provincia), pero ninguna se revisó todavía una por una: van en
// SIN_REVISAR. La prueba falla si aparece una ficha nueva sin su cifra en la vista inicial, o si una de las listas ya la tiene (hay que
// sacarla). Revisar una de SIN_REVISAR: o se cambia su cifra (como se hizo con E11) o pasa a EXCEPCIONES con su motivo.
// Uso: node scripts/prueba_cifras.mjs   (Node 22 o más y Google Chrome, después de armar el sitio. Otra ruta de Chrome: variable CHROME)
// La corre cada PR (.github/workflows/pruebas.yml).
import { createServer } from "node:http";
import { readFileSync, readdirSync } from "node:fs";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { abrirChrome } from "./cdp.mjs";

// ficha -> motivo. Solo fichas cuya cifra destacada es, a propósito, un dato que no está escrito en la vista inicial
const EXCEPCIONES = {
  "f-envejecimiento": "el gráfico y «Ver tabla» muestran cada provincia en los dos años, y el valor del país, que contesta la pregunta, va en el texto",
  "f-pensiones-invalidez": "el mapa y «Ver tabla» muestran cada provincia, y el valor del país cada 1.000 habitantes, que contesta la pregunta, va en el texto",
};
// D8 (28 de octubre de 2026): toda ficha lleva cifra destacada, salvo las de estas excepciones, que dice la regla de .claude/rules/visualizaciones.md.
// La prueba falla si una ficha no tiene cifra y no está acá, o si una de acá tiene cifra
const POLITICA = "Instituciones políticas: ningún resultado político se destaca sobre otro, sus cifras van en el texto y en «En cifras»";
const SENSIBLE = "suicidio y muertes violentas: sin cifra destacada por la regla de temas sensibles";
const ENCUESTA = "encuesta de opinión: un número grande sugiere una precisión que la encuesta no tiene";
const RELACION = "relación entre dos medidas: la respuesta es la relación, que el texto dice con la escala de fuerza";
const REPARTO = "cómo se reparte un total (por edad o por causa): ningún número solo contesta la pregunta";
const SIN_CIFRA = {
  "f-elecciones": POLITICA, "f-presidentes": POLITICA, "f-ministros": POLITICA, "f-confianza-gobierno": POLITICA, "f-legisladores": POLITICA,
  "f-representacion": POLITICA, "f-congreso": POLITICA, "f-votaciones": POLITICA, "f-voto-provincia": POLITICA, "f-presupuesto": POLITICA, "f-atn": POLITICA,
  "f-muertes": SENSIBLE, "f-suicidio": SENSIBLE, "f-suicidio-prov": SENSIBLE, "f-edad": SENSIBLE,
  "f-expectativas": ENCUESTA, "f-confianza-consumidor": ENCUESTA,
  "f-adolescentes-nse": RELACION,
  "f-piramide": REPARTO, "f-causas-infantiles": REPARTO,
};
// las que ya estaban así el 27 de octubre de 2026, sin revisar una por una (ver arriba). No se suman fichas nuevas a esta lista
const SIN_REVISAR = new Set([
  "f-adolescentes", "f-areas-hidro", "f-balanza", "f-canastas", "f-causas-muerte", "f-centrales", "f-cortes-provinciales",
  "f-costo", "f-delitos", "f-electricidad-sectores", "f-emae", "f-empleo-construccion", "f-empleo-hidro", "f-empresas", "f-escolarizacion",
  "f-esperanza", "f-exporta-provincias", "f-exporta-rubros", "f-fiscalias-federales", "f-gas-hogares", "f-glaciares", "f-hidro-provincias",
  "f-hogares", "f-homicidios", "f-hoteles", "f-importaciones", "f-impuestos-provinciales", "f-insumos", "f-inversion-educativa", "f-isac",
  "f-jueces-federales", "f-meses", "f-migracion-interna", "f-mortalidad", "f-obra-publica", "f-pesca-rio",
  "f-productividad", "f-radicaciones", "f-receptivo", "f-reservas-bcra", "f-salario-real", "f-salarios"
]);

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
const PAGINAS = readdirSync(SITIO).filter(f => f.endsWith(".html") && !f.startsWith("a-") && readFileSync(join(SITIO, f), "utf8").includes('class="ficha'));

// lo que se busca de cada ficha, en la página: el número de la cifra destacada y el texto de la vista inicial
const LEER = `(async () => {
  const fuera = [];
  for (const f of document.querySelectorAll("article.ficha")) {
    // en una página con capítulos, solo las del capítulo a la vista (las de los otros no se dibujaron). Las herramientas no llevan cifra
    const num = f.querySelector(".clave .num"); if (!f.offsetParent || f.closest(".herramienta")) continue;
    if (!num) { fuera.push({id: f.id, sin: true}); continue; }
    const g = f.querySelector(".grafico");
    // los textos del SVG enteros (con sus tspan) y las hojas del HTML, separados para que dos números no se peguen
    const graf = g ? [...g.querySelectorAll("text"), ...[...g.querySelectorAll("span, b, div, li, td")].filter(e => !e.children.length)]
      .map(e => e.textContent).join(" | ") : "";
    let tabla = "";
    const b = f.querySelector(".ver-tabla");
    if (b) { b.click(); for (let i = 0; i < 40 && !f.querySelector(".tabla-datos table, .tabla-datos .tabla-nota"); i++) await new Promise(r => setTimeout(r, 100));
      tabla = [...f.querySelectorAll(".tabla-datos td, .tabla-datos th")].map(c => c.textContent).join(" | "); b.click(); }
    fuera.push({id: f.id, num: num.textContent, graf, tabla});
  }
  return fuera;
})()`;

// el número de la cifra: el primer número que no es un año ("1.550 pesos" -> "1.550", "N.º 21" -> "21", "2,7%" -> "2,7")
const numero = t => (t.match(/\d[\d.]*(,\d+)?/g) || []).find(x => !/^(19|20)\d\d$/.test(x));
const esta = (n, texto) => new RegExp(`(^|[^\\d.,])${n.replace(/\./g, "\\.")}(?![\\d]|,\\d)`).test(texto);

const ch = await abrirChrome(9500 + Math.floor(Math.random() * 400)), p = await ch.pestana();
await p.tamano(1440, 900);
const fallas = [], usadas = new Set();
let revisadas = 0;
for (const pg of PAGINAS) {
  await p.ir(BASE + pg, 800);
  await p.recorrer();
  // en las páginas con capítulos se ve uno por vez (28 de octubre de 2026): se recorre cada uno
  for (let i = 0, nc = await p.eval(`document.querySelectorAll(".capitulos a").length`); i < Math.max(nc, 1); i++) {
    if (i) { await p.eval(`document.querySelectorAll(".capitulos a")[${i}].click()`); await p.recorrer(); }
    for (const f of await p.eval(LEER)) {
      if (f.sin) { if (SIN_CIFRA[f.id]) usadas.add(f.id); else fallas.push(`${pg}#${f.id}: no tiene cifra destacada y no es una de las excepciones (SIN_CIFRA)`); continue; }
      revisadas++;
      const n = numero(f.num);
      if (!n || esta(n, f.graf) || esta(n, f.tabla)) continue;
      if (EXCEPCIONES[f.id] || SIN_REVISAR.has(f.id)) { usadas.add(f.id); continue; }
      fallas.push(`${pg}#${f.id}: la cifra «${f.num}» no está en la vista inicial (ni en el gráfico ni en «Ver tabla»)`);
    }
  }
}
await ch.cerrar(); servidor.close();
for (const id of [...Object.keys(EXCEPCIONES), ...SIN_REVISAR]) if (!usadas.has(id)) fallas.push(`${id} está en una lista pero su cifra ya está en la vista inicial: sacarla`);
for (const id of Object.keys(SIN_CIFRA)) if (!usadas.has(id)) fallas.push(`${id} está en SIN_CIFRA pero tiene cifra destacada o ya no existe: sacarla`);
if (fallas.length) {
  console.error(`Cifras destacadas: ${fallas.length} con problemas`);
  for (const f of fallas) console.error("  " + f);
  process.exit(1);
}
console.log(`Cifras destacadas: ${revisadas} fichas en ${PAGINAS.length} páginas. Cada cifra está en su vista inicial, salvo ${Object.keys(EXCEPCIONES).length} ` +
  `excepciones con motivo y ${SIN_REVISAR.size} fichas que ya estaban así y esperan revisión. Sin cifra, ${Object.keys(SIN_CIFRA).length} fichas, todas con su motivo.`);
