// Volcado del texto que ve el lector (reescritura editorial del 26 de octubre de 2026, y la prueba T8 de docs/roadmap/PLAN_MEJORA.md).
// Abre en Chrome sin ventana cada página armada de sitio/ (también las del consultor de pobreza) y el perfil de las 24 jurisdicciones,
// recorre cada página para que se dibujen los gráficos y guarda en un JSON, por página:
// - el título de la pestaña, la descripción y las etiquetas Open Graph,
// - el texto visible de cada bloque (cada ficha, cada sección y lo que queda afuera: barra, migas, pie), con los <details> abiertos y los
//   elementos [hidden] a la vista, para que entren las notas y las aclaraciones que se despliegan,
// - los textos de los gráficos (svg text) de cada ficha,
// - los atributos que leen los lectores de pantalla o que aparecen al pasar el mouse (aria-label, title, alt, placeholder),
// - y las variantes: en cada ficha, cada botón de vista y hasta 12 opciones de cada selector, con el texto de la ficha después de elegirlo.
// Con dos volcados (antes y después de un cambio), "--comparar" escribe qué bloques cambiaron.
// Uso: node scripts/volcar_textos.mjs salida.json            (todas las páginas)
//      node scripts/volcar_textos.mjs salida.json trabajo.html provincia.html?prov=58   (solo esas)
//      node scripts/volcar_textos.mjs --comparar antes.json despues.json cambios.md
// Node 22 o más y Google Chrome (otra ruta: variable CHROME). Unos 15 minutos para el sitio entero.
import { createServer } from "node:http";
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { abrirChrome, espera } from "./cdp.mjs";

const SITIO = normalize(fileURLToPath(new URL("../sitio/", import.meta.url)));

if (process.argv[2] === "--comparar") {
  const [a, b, salida] = process.argv.slice(3);
  const A = JSON.parse(readFileSync(a, "utf8")), B = JSON.parse(readFileSync(b, "utf8"));
  const lineas = ["# Cambios en el texto visible", "", "De cada bloque que cambió, los renglones que se fueron (-) y los que llegaron (+). " +
    "Un mismo cambio que se repite en varias páginas (la barra, el pie, el perfil de cada provincia) va una sola vez, con la lista de páginas.", ""];
  let iguales = 0, distintos = 0;
  const grupos = new Map(), enOtras = new Map();
  for (const pg of [...new Set([...Object.keys(A), ...Object.keys(B)])].sort()) {
    const pa = A[pg] || {}, pb = B[pg] || {};
    const claves = new Map();
    const juntar = (x, lado) => {
      if (!x.bloques) return;
      claves.set("title", {...claves.get("title"), [lado]: x.title}); claves.set("meta", {...claves.get("meta"), [lado]: JSON.stringify(x.meta)});
      x.bloques.forEach(bl => claves.set("bloque " + bl.id, {...claves.get("bloque " + bl.id), [lado]: bl.texto}));
      x.bloques.forEach(bl => { if (bl.oculto) claves.set("texto plegado " + bl.id, {...claves.get("texto plegado " + bl.id), [lado]: bl.oculto}); });
      Object.entries(x.svg || {}).forEach(([k, v]) => claves.set("gráfico " + k, {...claves.get("gráfico " + k), [lado]: v}));
      claves.set("atributos", {...claves.get("atributos"), [lado]: (x.atributos || []).join("\n")});
      (x.variantes || []).forEach(v => claves.set(`variante ${v.ficha} ${v.control}=${v.valor}`, {...claves.get(`variante ${v.ficha} ${v.control}=${v.valor}`), [lado]: v.texto}));
    };
    juntar(pa, "a"); juntar(pb, "b");
    const cambios = [...claves].filter(([, v]) => v.a !== v.b);
    iguales += claves.size - cambios.length; distintos += cambios.length;
    // de las vistas de una ficha solo van los renglones que no se vieron ya en la ficha misma
    const yaVistos = new Map();
    for (const [k, v] of cambios) {
      const ra = (v.a ?? "").split("\n"), rb = (v.b ?? "").split("\n"), sa = new Set(ra), sb = new Set(rb);
      let rs = [...ra.filter(l => !sb.has(l)).map(l => "- " + l), ...rb.filter(l => !sa.has(l)).map(l => "+ " + l)];
      const ficha = k.startsWith("variante ") ? k.split(" ")[1] : k.startsWith("bloque ") ? k.slice(7) : null;
      if (ficha && k.startsWith("variante ")) rs = rs.filter(l => !(yaVistos.get(ficha) || new Set()).has(l));
      if (ficha) yaVistos.set(ficha, new Set([...(yaVistos.get(ficha) || []), ...rs]));
      // un bloque que se repite en muchas páginas (la historia de las provincias en cada perfil) muestra sus renglones una sola vez
      const antes = enOtras.get(k) || new Set();
      const nuevos = rs.filter(l => !antes.has(l));
      if (rs.length && !nuevos.length) continue;
      if (nuevos.length < rs.length) rs = [...nuevos, `(y ${rs.length - nuevos.length} renglones ya mostrados en otra página)`];
      enOtras.set(k, new Set([...antes, ...nuevos]));
      if (!rs.length && k.startsWith("variante ")) continue;
      const dif = rs.join("\n") || "(solo cambió el orden de los renglones)";
      const g = grupos.get(k + "\u0000" + dif) || {k, dif, pags: []};
      g.pags.push(pg); grupos.set(k + "\u0000" + dif, g);
    }
  }
  for (const g of [...grupos.values()].sort((x, y) => x.pags[0].localeCompare(y.pags[0]) || x.k.localeCompare(y.k))) {
    const pags = g.pags.length > 8 ? `${g.pags.slice(0, 8).join(", ")} y ${g.pags.length - 8} más` : g.pags.join(", ");
    lineas.push(`## ${g.k}`, "", `Páginas: ${pags}`, "", "```diff", g.dif, "```", "");
  }
  lineas.splice(2, 0, `Bloques iguales: ${iguales}. Bloques con cambios: ${distintos} (${grupos.size} cambios distintos). Antes: ${a}. Después: ${b}.`, "");
  writeFileSync(salida, lineas.join("\n"), "utf8");
  console.log(`${distintos} bloques con cambios y ${iguales} iguales: ${salida}`);
  process.exit(0);
}

const SALIDA = process.argv[2];
if (!SALIDA) { console.error("Uso: node scripts/volcar_textos.mjs salida.json [páginas]"); process.exit(1); }
// las 24 jurisdicciones, en el orden de los códigos del INDEC
const CODIGOS = ["02", "06", "10", "14", "18", "22", "26", "30", "34", "38", "42", "46", "50", "54", "58", "62", "66", "70", "74", "78", "82", "86", "90", "94"];
const todas = () => [...readdirSync(SITIO).filter(f => f.endsWith(".html")).sort(),
  ...(existsSync(join(SITIO, "pobreza")) ? readdirSync(join(SITIO, "pobreza")).filter(f => f.endsWith(".html")).map(f => "pobreza/" + f) : []),
  ...CODIGOS.map(c => `provincia.html?prov=${c}`)];
const PAGINAS = process.argv.length > 3 ? process.argv.slice(3) : todas();

const TIPOS = {".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json", ".geojson": "application/json", ".csv": "text/csv; charset=utf-8",
  ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8",
  ".wasm": "application/wasm", ".parquet": "application/octet-stream"};
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

// lo que se lee de la página: los bloques son las fichas, las piezas y las secciones con id (sin repetir lo que ya está en una ficha),
// y "resto" junta lo que queda afuera de todos (barra, migas, pie)
const LEER = `(() => {
  document.querySelectorAll("details").forEach(d => { d.open = true; });
  document.querySelectorAll("[hidden]").forEach(e => { if (!e.closest("svg") && e.id !== "tip") e.hidden = false; });
  const limpio = t => (t || "").replace(/[ \\t]+/g, " ").replace(/\\n\\s*\\n+/g, "\\n").trim();
  const meta = {};
  document.querySelectorAll('meta[name="description"], meta[property^="og:"], meta[name^="twitter:"]').forEach(m => { meta[m.getAttribute("name") || m.getAttribute("property")] = m.getAttribute("content"); });
  const raices = [...document.querySelectorAll("article[id], section[id], aside[id], nav[id], main, header, footer")]
    .filter(e => !e.parentElement.closest("article[id]"));
  // de una sección con fichas adentro solo va lo que no es ficha. La copia se mide fuera de la pantalla: innerText necesita que
  // el elemento esté en la página para respetar los saltos de línea
  const textoDe = copia => { const d = document.createElement("div"); d.style.cssText = "position:absolute;left:-99999px;width:1200px";
    d.appendChild(copia); document.body.appendChild(d); const t = d.innerText; d.remove(); return t; };
  // lo que está plegado o escondido con estilos (los paneles de "Para entender los datos", "Sobre los datos") no sale en innerText:
  // va aparte, del textContent con un salto después de cada bloque, sin los renglones que ya se ven
  const BLOQ = "p, li, h1, h2, h3, h4, h5, h6, div, dt, dd, button, option, summary, td, th, figcaption, label, small";
  const bloques = [];
  for (const r of raices) {
    const copia = r.cloneNode(true);
    copia.querySelectorAll("article[id], section[id], svg, script, style, template").forEach(x => { if (x !== copia) x.remove(); });
    const oc = copia.cloneNode(true);
    oc.querySelectorAll(BLOQ).forEach(x => x.after(document.createTextNode("\\n")));
    const texto = limpio(textoDe(copia));
    const vistos = new Set(texto.split("\\n"));
    const oculto = limpio(oc.textContent).split("\\n").map(l => l.trim()).filter(l => l && !vistos.has(l)).join("\\n");
    if (texto || oculto) bloques.push({id: r.id || r.tagName.toLowerCase(), texto, ...(oculto ? {oculto} : {})});
  }
  const svg = {};
  document.querySelectorAll("article.ficha[id], article.nota[id], article.lab-pieza[id], section.pieza[id]").forEach(f => {
    const t = [...f.querySelectorAll("svg text")].map(x => x.textContent.trim()).filter(Boolean);
    if (t.length) svg[f.id] = [...new Set(t)].join(" | ");
  });
  const atributos = [...new Set([...document.querySelectorAll("[aria-label], [title], [alt], [placeholder], [aria-description]")]
    .flatMap(e => ["aria-label", "title", "alt", "placeholder", "aria-description"].filter(a => e.hasAttribute(a) && e.getAttribute(a).trim())
      .map(a => a + ": " + e.getAttribute(a).trim())))].sort();
  return {title: document.title, lang: document.documentElement.lang, meta, bloques, svg, atributos};
})()`;

// las vistas de cada ficha: botones de los conmutadores y opciones de los selectores (hasta 12 por selector)
const CONTROLES = `[...document.querySelectorAll("article.ficha[id]")].flatMap(f => [
  ...[...f.querySelectorAll(".conmutador button, [role=group] button")].map((b, i) => ({ficha: f.id, tipo: "boton", i, valor: b.dataset.m || b.textContent.trim()})),
  ...[...f.querySelectorAll("select")].flatMap((s, j) => [...s.options].slice(0, 12).map((o, i) => ({ficha: f.id, tipo: "select", j, i, valor: o.value}))),
])`;
const elegir = c => c.tipo === "boton"
  ? `(() => { const b = document.getElementById(${JSON.stringify(c.ficha)}).querySelectorAll(".conmutador button, [role=group] button")[${c.i}]; b?.click(); return !!b; })()`
  : `(() => { const s = document.getElementById(${JSON.stringify(c.ficha)}).querySelectorAll("select")[${c.j}]; if (!s) return false; s.selectedIndex = ${c.i}; s.dispatchEvent(new Event("change", {bubbles: true})); s.dispatchEvent(new Event("input", {bubbles: true})); return true; })()`;
const TEXTO_FICHA = id => `(() => { const f = document.getElementById(${JSON.stringify(id)}); if (!f) return "";
  const c = f.cloneNode(true); c.querySelectorAll("svg, script, style, .tabla-datos").forEach(x => x.remove());
  const d = document.createElement("div"); d.style.cssText = "position:absolute;left:-99999px;width:1200px"; d.appendChild(c); document.body.appendChild(d);
  const t = d.innerText; d.remove();
  const g = [...f.querySelectorAll("svg text")].map(x => x.textContent.trim()).filter(Boolean);
  return (t.replace(/[ \\t]+/g, " ").replace(/\\n\\s*\\n+/g, "\\n").trim() + (g.length ? "\\n[gráfico] " + [...new Set(g)].join(" | ") : "")); })()`;

const ch = await abrirChrome(9100 + Math.floor(Math.random() * 300));
const p = await ch.pestana();
await p.tamano(1440, 900);
const res = {};
const t0 = Date.now();
for (const pg of PAGINAS) {
  try {
    await p.ir(B + pg, 1200);
    await p.recorrer();
    await espera(700);
    const variantes = [];
    // las variantes, antes de leer la página: así la lectura final queda con la vista inicial de cada ficha
    if (!pg.startsWith("pobreza/")) {
      const controles = await p.eval(CONTROLES);
      const porFicha = {};
      for (const c of controles) (porFicha[c.ficha] ||= []).push(c);
      for (const [ficha, cs] of Object.entries(porFicha)) {
        await p.eval(`document.getElementById(${JSON.stringify(ficha)})?.scrollIntoView()`);
        for (const c of cs) {
          if (!(await p.eval(elegir(c)))) continue;
          await espera(450);
          variantes.push({ficha, control: c.tipo === "boton" ? "vista" : `selector${c.j}`, valor: c.valor, texto: await p.eval(TEXTO_FICHA(ficha))});
        }
        // vuelve a la vista inicial (el primer botón y la opción elegida al cargar no siempre son la primera, así que se recarga al final)
      }
      if (variantes.length) { await p.ir(B + pg, 1200); await p.recorrer(); await espera(700); }
    }
    const leido = await p.eval(LEER);
    res[pg] = {...leido, variantes, errores: [...p.errores]};
    console.log(`${pg}: ${leido.bloques.length} bloques, ${variantes.length} variantes${p.errores.length ? `, ${p.errores.length} errores` : ""}`);
  } catch (e) {
    res[pg] = {error: String(e)};
    console.log(`${pg}: ERROR ${e}`);
  }
}
writeFileSync(SALIDA, JSON.stringify(res, null, 1), "utf8");
console.log(`Listo: ${Object.keys(res).length} páginas en ${Math.round((Date.now() - t0) / 1000)} s, ${SALIDA}`);
await ch.cerrar();
servidor.close();
process.exit(0);
