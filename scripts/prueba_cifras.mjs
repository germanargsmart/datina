// Prueba de "cifras dobles" (plan de mejora, E11 y T7, 27 de octubre de 2026). La auditoría encontró fichas cuya cifra destacada medía otra
// cosa que su gráfico: la tasa del plazo fijo arriba de un gráfico del dólar, las ventas de un mes arriba de las de doce meses, los fallos
// arriba de los casos. Regla: la cifra destacada, la descripción y la vista inicial usan la misma medida y el mismo período.
// Controla que el número de la cifra destacada de cada ficha esté escrito en su vista inicial: en el texto del gráfico (rótulos, valores, la
// línea del país) o en su "Ver tabla". Las fichas que muestran a propósito otra cifra van en EXCEPCIONES, con el motivo.
// Cuando se armó la prueba, 44 fichas no cumplían la regla al pie de la letra y quedaron en una lista aparte, sin revisar. El 28 de octubre
// de 2026 se revisaron una por una las 42 que quedaban (las otras dos cambiaron su cifra con D8): todas muestran el valor del país sobre un
// gráfico por provincia, el total, una cifra que sale de lo que se grafica (una suma, una diferencia, una parte) o el mismo número con otra
// unidad o más decimales. Ninguna muestra otro período ni otra medida que su ficha: pasaron a EXCEPCIONES, cada una con su motivo. La prueba
// falla si aparece una ficha nueva sin su cifra en la vista inicial y sin motivo, o si una de EXCEPCIONES ya la tiene (hay que sacarla).
// Uso: node scripts/prueba_cifras.mjs   (Node 22 o más y Google Chrome, después de armar el sitio. Otra ruta de Chrome: variable CHROME)
// La corre cada PR (.github/workflows/pruebas.yml).
import { createServer } from "node:http";
import { readFileSync, readdirSync } from "node:fs";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { abrirChrome } from "./cdp.mjs";

// los dos motivos que más se repiten en EXCEPCIONES
const PAIS = "el gráfico y «Ver tabla» muestran cada provincia, y el valor del país, que contesta la pregunta, va en el texto";
const TOTAL = "el gráfico y «Ver tabla» muestran cada provincia, y el total del país, que contesta la pregunta, va en el texto";
// ficha -> motivo. Solo fichas cuya cifra destacada es, a propósito, un dato que no está escrito en la vista inicial
const EXCEPCIONES = {
  "f-envejecimiento": "el gráfico y «Ver tabla» muestran cada provincia en los dos años, y el valor del país, que contesta la pregunta, va en el texto",
  "f-pensiones-invalidez": "el mapa y «Ver tabla» muestran cada provincia, y el valor del país cada 1.000 habitantes, que contesta la pregunta, va en el texto",
  "f-soja": "el mapa y «Ver tabla» muestran cada departamento, y el total del país, en millones de hectáreas, va en el texto de «Evolución» y en la tabla de esa vista",
  // revisadas una por una el 28 de octubre de 2026
  "f-isac": "es la variación interanual del último mes de la serie del gráfico: «Ver tabla» la da con dos decimales y signo",
  "f-insumos": "cuenta las barras del gráfico que están por encima de cero",
  "f-obra-publica": "el gráfico muestra el gasto por habitante de cada provincia, y el total del país, en los mismos pesos y el mismo año, va en el texto",
  "f-empleo-construccion": "el gráfico muestra los puestos cada 1.000 habitantes de cada provincia y la tabla, la cantidad de cada una: el total del país va en el texto",
  "f-costo": "es 100 menos el índice del costo total que muestra el gráfico (diciembre de 2016 = 100, descontada la inflación)",
  "f-canastas": "la vista inicial muestra la canasta por adulto equivalente de cada región, y la cifra, la de un hogar de cuatro del Gran Buenos Aires, la que contesta la pregunta, que el texto explica",
  "f-salario-real": "es la variación de los últimos doce meses del índice del gráfico: «Ver tabla» la da con dos decimales y signo",
  "f-emae": "es la variación interanual del último mes de la serie del gráfico: «Ver tabla» la da con dos decimales y signo",
  "f-escolarizacion": PAIS,
  "f-inversion-educativa": PAIS,
  "f-empresas": "el gráfico muestra las empresas cada 1.000 habitantes de cada provincia y la tabla, la cantidad de cada una: el total del país va en el texto",
  "f-hogares": "es el índice de la demanda eléctrica del gráfico en su último año menos 100",
  "f-electricidad-sectores": "el gráfico muestra la demanda por habitante de cada provincia, y la cifra, la parte de la electricidad del país que usan las industrias y los grandes comercios, que el texto explica",
  "f-meses": "compara dos barras del gráfico, enero y abril: es la diferencia entre las dos, en porcentaje",
  "f-centrales": "el mapa muestra cada central, y la parte eólica y solar de la potencia sale de la otra vista, la potencia por tecnología",
  "f-gas-hogares": "el gráfico da el valor del país sin decimales y el texto, con uno",
  "f-balanza": "la cifra es lo que va del año, más reciente que el último año completo del gráfico (regla del dato más reciente), y el texto lo explica",
  "f-exporta-rubros": "el gráfico da el mismo total en millones de dólares y la cifra, en miles de millones",
  "f-exporta-provincias": "suma la parte de las tres primeras provincias de la tabla",
  "f-importaciones": "el gráfico da el mismo total en millones de dólares y la cifra, en miles de millones",
  "f-reservas-bcra": "el gráfico da el mismo valor en millones de dólares y la cifra, en miles de millones",
  "f-impuestos-provinciales": PAIS,
  "f-jueces-federales": PAIS,
  "f-fiscalias-federales": TOTAL,
  "f-cortes-provinciales": TOTAL,
  "f-migracion-interna": "el gráfico da el valor del país sin decimales y el texto, con uno",
  "f-radicaciones": "el gráfico y la tabla muestran cada nacionalidad, y el total del año, que contesta la pregunta, va en el texto",
  "f-pesca-rio": "es la parte de la primera barra del gráfico en el total",
  "f-glaciares": TOTAL,
  "f-hidro-provincias": "«Ver tabla» da la misma parte con dos decimales",
  "f-areas-hidro": "suma la parte de las diez áreas del gráfico",
  "f-productividad": "«Ver tabla» da el mismo promedio en miles de barriles, con decimales",
  "f-empleo-hidro": TOTAL,
  "f-adolescentes": PAIS,
  "f-esperanza": PAIS,
  "f-causas-muerte": "el gráfico muestra la tasa de cada provincia, y la cifra, la parte de las muertes del país por la primera causa, que el texto explica",
  "f-mortalidad": PAIS,
  "f-delitos": "es la suma de las tasas de todos los tipos de delito de la tabla",
  "f-homicidios": PAIS,
  "f-salarios": PAIS,
  "f-receptivo": "el gráfico da el mismo valor con dos decimales",
  "f-hoteles": "es la suma de las dos series del gráfico, residentes y no residentes",
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
      if (EXCEPCIONES[f.id]) { usadas.add(f.id); continue; }
      fallas.push(`${pg}#${f.id}: la cifra «${f.num}» no está en la vista inicial (ni en el gráfico ni en «Ver tabla»)`);
    }
  }
}
await ch.cerrar(); servidor.close();
for (const id of Object.keys(EXCEPCIONES)) if (!usadas.has(id)) fallas.push(`${id} está en una lista pero su cifra ya está en la vista inicial: sacarla`);
for (const id of Object.keys(SIN_CIFRA)) if (!usadas.has(id)) fallas.push(`${id} está en SIN_CIFRA pero tiene cifra destacada o ya no existe: sacarla`);
if (fallas.length) {
  console.error(`Cifras destacadas: ${fallas.length} con problemas`);
  for (const f of fallas) console.error("  " + f);
  process.exit(1);
}
console.log(`Cifras destacadas: ${revisadas} fichas en ${PAGINAS.length} páginas. Cada cifra está en su vista inicial, salvo ${Object.keys(EXCEPCIONES).length} ` +
  `excepciones con motivo. Sin cifra, ${Object.keys(SIN_CIFRA).length} fichas, todas con su motivo.`);
