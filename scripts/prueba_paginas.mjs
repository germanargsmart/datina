// Prueba de las páginas armadas (etapa 17, octubre de 2026). Abre cada página del sitio en Chrome sin ventana, la recorre para que se
// dibujen los gráficos y revisa que no haya errores de JavaScript, que ningún texto diga NaN, undefined, null o Infinity, ni quede un
// {{dato}} sin completar, que "En cifras" tenga sus cinco tarjetas completas en las 12 secciones (sin provincia y con dos provincias
// elegidas) y que el perfil provincial tenga todos sus valores.
// La corre la actualización mensual después de armar el sitio: si encuentra un problema, se detiene y no se guarda ni se publica nada.
// También abre algunas páginas con cdnjs y jsDelivr bloqueadas, y una sin D3 (ver "Sin las CDN", al final).
// Uso: node scripts/prueba_paginas.mjs   (Node 22 o más y Google Chrome. Otra ruta de Chrome: variable CHROME)
import { createServer } from "node:http";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { abrirChrome, espera } from "./cdp.mjs";

const SITIO = normalize(fileURLToPath(new URL("../sitio/", import.meta.url)));
// páginas que solo redirigen a otra (REDIRECCIONES en 03_construir_sitio.py: una sección vieja o un artículo que se juntó con otro)
const SALTEAR = new Set(readdirSync(SITIO).filter(f => f.endsWith(".html") && readFileSync(join(SITIO, f), "utf8").includes("Esta página se mudó")));
// las 20 secciones con "En cifras" y dos provincias para probarla: Neuquén (con la aclaración de Aprender) y la Ciudad (con la de empleo)
const SECCIONES = ["trabajo", "economia", "empresas", "externo", "pobreza", "salud", "seguridad", "educacion", "poblacion", "migraciones", "politica", "justicia", "gobierno", "movilidad", "construccion", "energia", "petroleo",
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

// términos fijos (plan de mejora, R5 y T12, 27 de octubre de 2026): un mismo concepto se llama igual en todo el sitio (.claude/rules/redaccion.md).
// Ninguna de estas variantes puede estar en el texto visible. "Ciudad de Buenos Aires" sí, en un nombre oficial: el aglomerado del INDEC (en
// la ficha de ingresos por aglomerado) y el Ministerio de Educación de la Ciudad
const TERMINOS = `(() => {
  const agl = document.getElementById("f-ingresos-aglomerados")?.innerText || "";
  const t = (document.body.innerText.replace(agl, "") + "\\n" + [...document.querySelectorAll("svg text")].filter(x => !x.closest("#f-ingresos-aglomerados"))
    .map(x => x.textContent).join("\\n")).replace(/\\s+/g, " ").replace(/Ministerio de Educación de la Ciudad de Buenos Aires/g, "");  // con los espacios que no cortan (sinViuda)
  const MAL = [[/balotaje/i, "segunda vuelta"], [/pesos (de igual|del mismo) valor|a precios de hoy/i, "descontada la inflación"],
    [/transferencias discrecionales/i, "transferencias no automáticas"], [/las 24 provincias/i, "las 24 jurisdicciones"],
    [/pensi[oó]n(es)? (no contributivas? )?por discapacidad/i, "pensión por invalidez"], [/\\bleyes clave\\b/i, "leyes y proyectos clave"],
    [/\\b[Ll]a Ciudad\\b|Ciudad (Autónoma )?de Buenos Aires/, "CABA"]];
  return MAL.flatMap(([rx, bien]) => [...t.matchAll(new RegExp(".{0,40}(" + rx.source + ").{0,30}", rx.flags + "g"))].slice(0, 2).map(m => [m[0].trim(), bien]));
})()`;

// los enlaces entre artículos y fichas (Fase 2, paso 4), como "artículo>ficha": los botones "Ficha: …" de cada artículo (IDA) y los
// "Artículos con este dato" del pie de cada ficha (VUELTA). Tienen que coincidir
const IDA = [], VUELTA = [];
const ENLACES = `[...document.querySelectorAll(".nota-fuentes a[href*='#f-'], .pie-arts a")].map(a => a.closest(".pie-arts")
  ? a.getAttribute("href") + ">" + a.closest("article.ficha").id : location.pathname.slice(1) + ">" + a.getAttribute("href").split("#")[1])`;

// las fichas (Fase 2, paso 5): todas con "Ver tabla", ninguna con el nombre de la sección arriba de la pregunta (cada página tiene una
// sola) y "Cómo se calcula" en todas las de una página con "Para entender los datos", y en ninguna de las demás
const FICHAS = `(() => { const f = [...document.querySelectorAll("article.ficha")], exp = !!document.getElementById("para-entender");
  return {n: f.length, como: f.filter(x => x.querySelector(".pie .como-calcula")).length, sinTabla: f.filter(x => !x.querySelector(".ver-tabla")).map(x => x.id),
    etiquetas: f.filter(x => x.querySelector(".etiqueta")).map(x => x.id), comoMal: f.filter(x => !!x.querySelector(".pie .como-calcula") !== exp).map(x => x.id)}; })()`;
const CUENTA = {fichas: 0, como: 0};

// en las páginas con capítulos se ve uno por vez (28 de octubre de 2026): se recorre cada uno, para que se dibujen sus gráficos y se lean
// sus textos
const CAPITULOS = `document.querySelectorAll(".capitulos a").length`;
async function revisarPagina(pg, intento = 1) {
  await p.ir(B + pg, 1200);
  await p.recorrer();
  await espera(500);
  let malos = await p.eval(MALOS), terminos = await p.eval(TERMINOS);
  for (let i = 1, n = await p.eval(CAPITULOS); i < n; i++) {
    await p.eval(`document.querySelectorAll(".capitulos a")[${i}].click()`);
    await p.recorrer(); await espera(300);
    malos = malos.concat(await p.eval(MALOS)); terminos = terminos.concat(await p.eval(TERMINOS));
  }
  const errores = [...p.errores];
  if ((malos.length || errores.length) && intento === 1) return revisarPagina(pg, 2);   // una segunda vez, por si fue la red
  malos.forEach(m => problemas.push(`${pg}: texto con un valor sin calcular: «${m}»`));
  errores.forEach(e => problemas.push(`${pg}: ${e}`));
  terminos.forEach(([m, bien]) => problemas.push(`${pg}: un término fijo escrito de otra forma (va «${bien}»): «${m}»`));
  (pg.startsWith("a-") ? IDA : VUELTA).push(...await p.eval(ENLACES));
  const fi = await p.eval(FICHAS);
  CUENTA.fichas += fi.n; CUENTA.como += fi.como;
  if (fi.sinTabla.length) problemas.push(`${pg}: fichas sin "Ver tabla": ${fi.sinTabla.join(", ")}`);
  if (fi.etiquetas.length) problemas.push(`${pg}: fichas con el nombre de la sección arriba de la pregunta: ${fi.etiquetas.join(", ")}`);
  if (fi.comoMal.length) problemas.push(`${pg}: "Cómo se calcula" falta o sobra en ${fi.comoMal.join(", ")}`);
  // accesibilidad (paso 6): cada gráfico con nombre para lectores de pantalla (después de recorrer la página, cuando ya se dibujaron),
  // el enlace para saltar al contenido y las migas subrayadas
  const ac = await p.eval(`({sinNombre: [...document.querySelectorAll('[role="img"]')].filter(e => !(e.getAttribute("aria-label") || "").trim() && !e.getAttribute("aria-labelledby")).length,
    saltar: !!document.querySelector('a.saltar[href="#contenido"]') && !!document.getElementById("contenido"),
    migas: [...document.querySelectorAll(".migas a")].filter(a => !getComputedStyle(a).textDecorationLine.includes("underline")).length})`);
  if (ac.sinNombre) problemas.push(`${pg}: ${ac.sinNombre} gráficos sin nombre para lectores de pantalla`);
  if (!ac.saltar) problemas.push(`${pg}: falta "Saltar al contenido" o su destino`);
  if (ac.migas) problemas.push(`${pg}: ${ac.migas} enlaces de las migas sin subrayar`);
  CUENTA.paginas = (CUENTA.paginas || 0) + 1;
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
const ida = new Set(IDA), vuelta = new Set(VUELTA);
if (!ida.size || !vuelta.size) problemas.push(`enlaces entre artículos y fichas: ${ida.size} de ida y ${vuelta.size} de vuelta`);
[...ida].filter(x => !vuelta.has(x)).forEach(x => problemas.push(`${x.split(">")[0]} enlaza a ${x.split(">")[1]}, que no lo enlaza de vuelta`));
[...vuelta].filter(x => !ida.has(x)).forEach(x => problemas.push(`${x.split(">")[1]} enlaza a ${x.split(">")[0]}, que no la enlaza de vuelta`));
// en la lista de Artículos, cada tarjeta con su bajada (paso 4)
await p.ir(B + "articulos.html", 1000);
const bajadas = await p.eval(`[...document.querySelectorAll("#art-grid .art-card")].map(c => (c.querySelector(".art-dek")?.textContent || "").trim().length)`);
const nArt = paginas.filter(x => x.startsWith("a-")).length;
if (bajadas.length !== nArt || bajadas.some(n => n < 40)) problemas.push(`articulos.html: ${bajadas.filter(n => n >= 40).length} de ${nArt} tarjetas con su bajada`);
// etapa 5 del plan de mejora: cada tarjeta con su respuesta, los dos bloques y los filtros por tema
const resp = JSON.parse(await p.eval(`JSON.stringify([...document.querySelectorAll("#art-grid .art-card")].map(c => (c.querySelector(".art-resp")?.textContent || "").trim()))`));
const sinResp = resp.filter(t => t.length < 8 || /NaN|undefined|null|Infinity/.test(t)).length;
if (sinResp) problemas.push(`articulos.html: ${sinResp} tarjetas sin su respuesta`);
const fil = JSON.parse(await p.eval(`(() => {
  const bs = [...document.querySelectorAll("#art-grid .art-filtros button")], vis = () => document.querySelectorAll("#art-grid .art-card:not([hidden])").length;
  const todas = vis(), r = {bloques: document.querySelectorAll("#art-grid .art-bloque").length, botones: bs.length, visible: !bs[0]?.closest("[hidden]"), todas, porGrupo: []};
  bs.slice(1).forEach(b => { b.click(); r.porGrupo.push(vis()); });
  bs[0]?.click(); r.vuelta = vis();
  return JSON.stringify(r);
})()`));
if (fil.bloques !== 2 || fil.botones < 3 || !fil.visible || fil.porGrupo.some(n => !n || n >= fil.todas) || fil.porGrupo.reduce((s, n) => s + n, 0) !== fil.todas || fil.vuelta !== fil.todas)
  problemas.push(`articulos.html: los filtros por tema no andan (${JSON.stringify(fil)})`);
// "Ver tabla" en las cinco fichas que lo tienen desde el paso 5: se abre con filas, y la de legisladores sigue a la provincia elegida
// la tabla de los espacios es la segunda pestaña de f-votaciones desde que se unieron las dos fichas (R7, 28 de octubre de 2026)
const PROPIAS = [["departamentos.html", "f-mapa"], ["politica.html", "f-legisladores"], ["politica.html", "f-votaciones"],
  ["politica.html", "f-votaciones", "tab-f-votaciones-2"], ["politica.html", "f-ministros"]];
const filasDe = id => p.eval(`document.querySelectorAll("#${id} .tabla-datos tbody tr").length`);
for (const [pg, id, pestana] of PROPIAS) {
  await p.ir(B + pg, 1000);
  await p.eval(`location.hash = "${id}"`); await espera(300);   // en una página con capítulos, abre el de la ficha
  if (pestana) await p.eval(`document.getElementById("${pestana}")?.click()`);
  await p.eval(`document.querySelector("#${id} .ver-tabla")?.click()`);
  await espera(1500);
  if (!(await filasDe(id))) problemas.push(`${pg}: "Ver tabla" de ${id} no muestra filas`);
  if (id === "f-legisladores") {
    const leer = () => p.eval(`document.querySelector("#f-legisladores .tabla-datos tbody")?.textContent.slice(0, 300) || ""`);
    const antes = await leer();
    await p.eval(`(() => { const s = document.getElementById("lg-sel"); s.value = "90"; s.dispatchEvent(new Event("change")); })()`);
    await espera(1000);
    if (!antes || antes === await leer()) problemas.push(`${pg}: la tabla de f-legisladores no cambia al elegir otra provincia`);
  }
  p.errores.forEach(e => problemas.push(`${pg}, "Ver tabla" de ${id}: ${e}`));
}
// los capítulos como pestañas (28 de octubre de 2026, pedido del autor): en Instituciones políticas se ve un capítulo por vez y la fila
// marca el elegido. Tocar otro lo abre, y lo mismo hacen el enlace a una ficha de otro capítulo y la dirección vieja de una ficha unida
const CAP = `JSON.stringify({tab: document.querySelector('.capitulos a[aria-current="true"]')?.getAttribute("href") || "", hash: location.hash,
  vis: [...document.querySelectorAll("article.ficha")].filter(f => f.offsetParent).map(f => f.id), pestana: document.querySelector('[role="tab"][aria-selected="true"][id^="tab-f-voto-provincia"]')?.id || ""})`;
const capitulo = async (como, tab, si, no) => {
  const r = JSON.parse(await p.eval(CAP));
  if (r.tab !== tab || !r.vis.includes(si) || r.vis.includes(no)) problemas.push(`politica.html, capítulos (${como}): a la vista ${r.tab || "ninguno"} con ${r.vis.join(", ")}`);
  return r;
};
await p.ir(B + "politica.html", 1000);
await capitulo("al llegar", "#g-elecciones", "f-elecciones", "f-legisladores");
await p.eval(`document.querySelector('.capitulos a[href="#g-congreso"]').click()`); await espera(300);
if ((await capitulo("al tocar El Congreso", "#g-congreso", "f-legisladores", "f-elecciones")).hash !== "#g-congreso") problemas.push("politica.html, capítulos: la dirección no cambia al tocar uno");
await p.eval(`location.hash = "f-atn"`); await espera(400);
await capitulo("con un enlace a #f-atn", "#g-nacion-provincias", "f-atn", "f-legisladores");
await p.ir(B + "contacto.html", 300); await p.ir(B + "politica.html#f-apoyo", 1000);
if ((await capitulo("con la dirección vieja #f-apoyo", "#g-votaciones", "f-voto-provincia", "f-elecciones")).pestana !== "tab-f-voto-provincia-2")
  problemas.push("politica.html#f-apoyo: no abre la pestaña de las transferencias");
p.errores.forEach(e => problemas.push(`politica.html, capítulos: ${e}`));

// la dirección con la vista de cada ficha (plan de mejora, F1, 28 de octubre de 2026): "Copiar enlace" suma la vista elegida
// (?vista=desempleo:serie) y abrir esa dirección la vuelve a elegir
await p.ir(B + "trabajo.html", 1000);
const copiado = await p.eval(`(async () => {
  let u = ""; navigator.clipboard.writeText = async t => { u = t; };
  document.querySelector('.conmutador[data-g="desempleo"] button[data-m="serie"]').click();
  document.querySelector("#f-desempleo .copiar").click(); await new Promise(r => setTimeout(r, 300));
  return u; })()`);
if (!/\?vista=desempleo:serie#f-desempleo$/.test(copiado)) problemas.push(`trabajo.html: "Copiar enlace" no guarda la vista elegida (${copiado})`);
await p.ir(B + "contacto.html", 300); await p.ir(B + "trabajo.html?vista=desempleo:serie#f-desempleo", 1200);
const vista = await p.eval(`document.querySelector('.conmutador[data-g="desempleo"] button[aria-pressed="true"]')?.dataset.m + "|" + (document.querySelector('[data-t="desempleo"]')?.textContent || "").slice(0, 80)`);
if (!vista.startsWith("serie|") || !/contra un promedio/.test(vista)) problemas.push(`trabajo.html?vista=desempleo:serie: no abre esa vista (${vista})`);
p.errores.forEach(e => problemas.push(`trabajo.html con ?vista=: ${e}`));

// "En cifras" sin provincia (el perfil nuevo no tiene ninguna guardada) y después con cada provincia
for (const sec of SECCIONES) await revisarCifras(sec, null);
for (const prov of PROVINCIAS) {
  for (const sec of SECCIONES) await revisarCifras(sec, prov);
  await p.ir(`${B}provincia.html?prov=${prov}`, 1200);
  const perfil = await p.eval(`[...document.querySelectorAll("#prov-grid .dp")].map(d => d.querySelector(".dp-num").textContent.trim())`);
  if (!perfil.length || perfil.some(v => !v || /NaN|undefined/.test(v))) problemas.push(`provincia.html con la provincia ${prov}: perfil incompleto (${perfil.join(" | ")})`);
}

// Sin las CDN (plan de estabilización, P0-1, 22 de octubre de 2026). D3 y topojson se sirven desde sitio/lib/: con cdnjs y jsDelivr
// bloqueadas, cada página tiene que andar igual, sin errores (un pedido a esas CDN aparece como error), con D3 y topojson cargados,
// las fichas a la vista, sus textos y gráficos, y el menú "Más" que abre. Y si falta D3 y el arranque de datina.js se corta, las
// fichas igual se ven (antes quedaban invisibles)
const CDN = ["*cdnjs.cloudflare.com*", "*cdn.jsdelivr.net*"];
const SIN_CDN = {"trabajo.html": {textos: true, graficos: true}, "departamentos.html": {graficos: true}, "a-cloacas-mortalidad.html": {graficos: true},
  "index.html": {}, "relaciones.html": {sinDatina: true}};
const MIRAR = `(() => {
  const f = [...document.querySelectorAll("article.ficha")], btn = document.getElementById("menu-btn");
  btn?.click();
  return {d3: typeof d3, topojson: typeof topojson, fichas: f.length, ocultas: f.filter(x => +getComputedStyle(x).opacity < 0.9).length,
    textosVacios: [...document.querySelectorAll("p.lead")].filter(x => !x.textContent.trim()).length,
    graficos: document.querySelectorAll(".grafico svg, .nota-graf svg").length, masAbre: btn ? btn.getAttribute("aria-expanded") === "true" : null};
})()`;
const q = await ch.pestana();
await q.tamano(1280, 900);
await q.send("Network.enable");
await q.send("Network.setBlockedURLs", {urls: CDN});
for (const [pg, pide] of Object.entries(SIN_CDN)) {
  await q.ir(B + pg, 1200);
  await q.recorrer();
  await espera(500);
  const r = await q.eval(MIRAR), donde = `${pg} sin cdnjs ni jsDelivr`;
  q.errores.forEach(e => problemas.push(`${donde}: ${e}`));
  if (r.d3 !== "object") problemas.push(`${donde}: no cargó D3`);
  if (!pide.sinDatina && r.topojson !== "object") problemas.push(`${donde}: no cargó topojson`);
  if (!pide.sinDatina && !r.masAbre) problemas.push(`${donde}: el menú "Más" no abre`);
  if (r.ocultas) problemas.push(`${donde}: ${r.ocultas} de ${r.fichas} fichas invisibles`);
  if (pide.textos && (!r.fichas || r.textosVacios)) problemas.push(`${donde}: ${r.textosVacios} textos vacíos (${r.fichas} fichas)`);
  if (pide.graficos && !r.graficos) problemas.push(`${donde}: sin gráficos`);
}
// Los menús de la barra con el teclado (Fase 2, 23 de octubre de 2026): Enter abre Temas y lleva el foco adentro, Escape lo cierra y
// devuelve el foco al botón. En el celular, "Menú" abre sus cuatro partes plegadas con el foco en la primera
await q.send("Network.setBlockedURLs", {urls: []});
const tecla = async k => {
  for (const type of ["keyDown", "keyUp"])
    await q.send("Input.dispatchKeyEvent", {type, key: k, code: k, windowsVirtualKeyCode: {Enter: 13, Escape: 27, ArrowDown: 40, Tab: 9}[k], ...(k === "Enter" && type === "keyDown" ? {text: "\r"} : {})});
  await espera(300);
};
const enFoco = () => q.eval("(document.activeElement.id || '') + '|' + document.activeElement.textContent.trim().slice(0, 30)");
// La portada (Fase 2, paso 2): los cuatro datos destacados con su cifra y su texto, y el buscador a la vista, que encuentra una provincia
await q.ir(B + "index.html", 1000);
const destacados = await q.eval(`[...document.querySelectorAll(".destacado")].filter(a => a.querySelector(".c-num").textContent.trim() && a.querySelector(".c-txt").textContent.trim()).length`);
if (destacados !== 4) problemas.push(`index.html: ${destacados} de 4 datos destacados con su cifra`);
// la bajada de cada artículo va en su tarjeta solo en la lista de Artículos, no en la portada (paso 4)
if (await q.eval(`document.querySelectorAll("#art-grid-home .art-dek").length`)) problemas.push("index.html: las tarjetas de artículos llevan bajada (va solo en Artículos)");
await q.eval(`document.getElementById("busca-portada").focus()`);
await q.send("Input.insertText", {text: "salta"});
await espera(300);
if (!(await q.eval(`document.querySelectorAll('#busca-portada-res a[href="provincia.html?prov=66"]').length`)))
  problemas.push("index.html: el buscador de la portada no encuentra Salta");
// con una lista larga, cada resultado que se ve dentro de la lista se puede tocar en su lugar (la portada recorta lo que sobresale y la
// lista quedaba cortada o tapada por lo que sigue en la parte azul)
await q.eval(`(() => { const c = document.getElementById("busca-portada"); c.value = ""; c.dispatchEvent(new Event("input")); })()`);
await q.send("Input.insertText", {text: "empleo"});
await espera(300);
const tapados = await q.eval(`(() => { const res = document.getElementById("busca-portada-res"), caja = res.getBoundingClientRect();
  return [...res.querySelectorAll("a")].filter(a => { const r = a.getBoundingClientRect(), y = r.top + r.height / 2;
    if (y <= caja.top || y >= Math.min(caja.bottom, innerHeight)) return false;
    const el = document.elementFromPoint(r.left + r.width / 2, y); return !el || !a.contains(el); }).length; })()`);
if (tapados) problemas.push(`index.html: ${tapados} resultados del buscador de la portada se ven pero no se pueden tocar`);
q.errores.forEach(e => problemas.push(`portada: ${e}`));
await q.ir(B + "trabajo.html", 1000);
await q.eval(`document.getElementById("gb-temas").focus()`);
await tecla("Enter");
if (!(await q.eval(`!document.getElementById("gm-temas").hidden && document.getElementById("gm-temas").contains(document.activeElement)`)))
  problemas.push(`trabajo.html: Enter en "Temas" no abre su menú con el foco adentro (${await enFoco()})`);
await tecla("Escape");
if (!(await enFoco()).startsWith("gb-temas")) problemas.push(`trabajo.html: Escape no devuelve el foco a "Temas" (${await enFoco()})`);
// El buscador de la lupa (Fase 2, paso 3): las flechas marcan una opción sin sacar el foco del campo y Enter la abre. Sin coincidencias,
// la primera opción lleva al catálogo con lo escrito y el aviso para lectores de pantalla lo dice
const lupa = async txt => {
  await q.ir(B + "trabajo.html", 1000);
  await q.eval(`document.getElementById("lupa-btn").click()`);
  await q.send("Input.insertText", {text: txt});
  await espera(300);
};
await lupa("empleo");
await tecla("ArrowDown");
await tecla("ArrowDown");
const marcada = await q.eval(`(() => { const c = document.getElementById("busca"), o = document.getElementById(c.getAttribute("aria-activedescendant") || "-");
  return o && document.activeElement === c && o.getAttribute("aria-selected") === "true" && o === document.querySelectorAll("#busca-res [role=option]")[1] ? o.getAttribute("href") : ""; })()`);
if (!marcada) problemas.push("trabajo.html: dos flechas abajo en el buscador no marcan la segunda opción con el foco en el campo");
else {
  await tecla("Enter");
  await espera(900);
  const destino = await q.eval("location.pathname + location.search + location.hash");
  if (!destino.endsWith(marcada.replace(/^\.\//, ""))) problemas.push(`trabajo.html: Enter en el buscador no abre la opción marcada (${marcada}, quedó en ${destino})`);
}
await lupa("zzqqxx");
const nada = await q.eval(`document.querySelector("#busca-res [role=option]")?.getAttribute("href") + " | " + document.getElementById("busca-estado")?.textContent`);
if (!nada.startsWith("catalogo.html?q=zzqqxx | Nada coincide")) problemas.push(`trabajo.html: sin coincidencias, el buscador no ofrece el catálogo con lo escrito (${nada})`);
// consultas con IA (docs/ia/CONSULTAS.md), solo si se armaron con "consulta_ia": true: sin coincidencias, la segunda opción lleva lo escrito
// a su página, que lo deja escrito sin enviarlo
const IA = existsSync(join(SITIO, "consulta-ia.html"));
if (IA) {
  const segunda = await q.eval(`document.querySelectorAll("#busca-res [role=option]")[1]?.getAttribute("href")`);
  if (segunda !== "consulta-ia.html?q=zzqqxx") problemas.push(`trabajo.html: sin coincidencias, el buscador no ofrece las consultas con IA (${segunda})`);
  const preg = "¿Cuántos habitantes tiene Salta?";
  await q.ir(B + "consulta-ia.html?q=" + encodeURIComponent(preg), 1000);
  const ia = JSON.parse(await q.eval(`JSON.stringify({v: document.getElementById("ia-pregunta")?.value, oculta: document.getElementById("ia-respuesta")?.hidden,
    etiqueta: !!document.getElementById("ia-pregunta")?.closest("label")?.textContent.trim().startsWith("Tu pregunta"), boton: !!document.getElementById("ia-enviar")})`));
  if (ia.v !== preg || ia.oculta !== true || !ia.etiqueta || !ia.boton) problemas.push(`consulta-ia.html: el formulario no está como se espera (${JSON.stringify(ia)})`);
}
// la respuesta rápida (26 de octubre de 2026): con una ficha, la primera opción es la cifra que ya calcula el sitio, con su fuente, y el aviso
// para lectores de pantalla la dice. Con una provincia, la de esa provincia y la del país. Nunca sobre suicidio
const rapida = async txt => {
  await lupa(txt);
  return JSON.parse(await q.eval(`JSON.stringify((() => { const o = document.querySelector("#busca-res [role=option]");
    return {resp: !!o?.classList.contains("busca-resp"), texto: (o?.textContent || "").replace(/\\s+/g, " "), href: o?.getAttribute("href") || "",
      aviso: document.getElementById("busca-estado").textContent}; })())`));
};
let rr = await rapida("petróleo");
if (!rr.resp || !/\d/.test(rr.texto) || !/Fuentes?:/.test(rr.texto) || !rr.href.endsWith("#f-petroleo") || !rr.aviso.startsWith("Respuesta rápida:"))
  problemas.push(`trabajo.html: "petróleo" no da la respuesta rápida de su ficha (${JSON.stringify(rr)})`);
rr = await rapida("¿Cuánto se gana en Neuquén?");
if (!rr.resp || !rr.texto.includes("Neuquén:") || !rr.texto.includes("País:") || !rr.href.endsWith("#f-salarios"))
  problemas.push(`trabajo.html: "¿Cuánto se gana en Neuquén?" no da el salario de Neuquén y el del país (${JSON.stringify(rr)})`);
for (const t of ["suicidio", "suicidios en Salta"]) {
  rr = await rapida(t);
  if (rr.resp) problemas.push(`trabajo.html: "${t}" da una respuesta rápida (${rr.texto})`);
}
// accesibilidad con el teclado (paso 6): Tab saca el foco de la lupa abierta y la cierra, la primera parada de Tab es "Saltar al
// contenido" y Enter lleva el foco al título, y el mapa de la portada tiene nombre
await tecla("Tab");
if (!(await q.eval(`document.getElementById("buscador").hidden`))) problemas.push(`trabajo.html: Tab no cierra la lupa (foco en ${await enFoco()})`);
await q.ir(B + "trabajo.html", 1000);
await tecla("Tab");
if (!(await q.eval(`document.activeElement.classList.contains("saltar")`))) problemas.push(`trabajo.html: la primera parada de Tab no es "Saltar al contenido" (${await enFoco()})`);
await tecla("Enter");
if (!(await q.eval(`document.activeElement.tagName === "H1"`))) problemas.push(`trabajo.html: "Saltar al contenido" no lleva el foco al título (${await enFoco()})`);
await q.ir(B + "index.html", 1000);
if (!(await q.eval(`(document.getElementById("mapa").getAttribute("aria-label") || "").includes("Provincias") && document.getElementById("mapa").getAttribute("aria-hidden") !== "true"`)))
  problemas.push("index.html: el mapa no dice que la lista de Provincias es su camino con el teclado");
q.errores.forEach(e => problemas.push(`buscador: ${e}`));
await q.tamano(390, 844);
await q.ir(B + "trabajo.html", 1000);
await q.eval(`document.getElementById("menu-btn").focus()`);
await tecla("Enter");
if (!(await enFoco()).endsWith("|Temas")) problemas.push(`trabajo.html en 390 píxeles: "Menú" no abre con el foco en "Temas" (${await enFoco()})`);
// pulido (paso 7): el texto de ayuda de la lupa y el del buscador de la portada entran enteros en su campo en 360 y 768 píxeles (los
// anchos donde antes se cortaban), y la descripción debajo de cada pregunta va alineada a la izquierda (los textos de la ficha siguen
// justificados). Se mide poniendo el texto en el campo: medirlo aparte no cuenta el lugar que el campo de búsqueda reserva a la derecha
const DESBORDA = id => `(() => { const i = document.getElementById("${id}"), v = i.value; i.value = i.placeholder; const d = i.scrollWidth - i.clientWidth; i.value = v; return d; })()`;
for (const W of [360, 768]) {
  await q.tamano(W, 844);
  await q.ir(B + "trabajo.html", 1000);
  await q.eval(`document.getElementById("lupa-btn").click()`);
  await espera(300);
  const lupaD = await q.eval(DESBORDA("busca"));
  if (lupaD > 0) problemas.push(`trabajo.html en ${W} píxeles: el texto de ayuda de la lupa se corta (${lupaD} píxeles de más)`);
  await q.ir(B + "index.html", 1000);
  const portadaD = await q.eval(DESBORDA("busca-portada"));
  if (portadaD > 0) problemas.push(`index.html en ${W} píxeles: el texto de ayuda del buscador se corta (${portadaD} píxeles de más)`);
}
await q.ir(B + "trabajo.html", 1000);
if (await q.eval(`[...document.querySelectorAll(".ficha-sub")].some(s => getComputedStyle(s).textAlign !== "left") || ![...document.querySelectorAll(".ficha .lead")].some(s => getComputedStyle(s).textAlign === "justify")`))
  problemas.push("trabajo.html: la descripción debajo de la pregunta no va a la izquierda, o los textos de la ficha dejaron de estar justificados");
q.errores.forEach(e => problemas.push(`menús con el teclado: ${e}`));
await q.tamano(1280, 900);
await q.send("Network.setBlockedURLs", {urls: [...CDN, "*lib/d3-*"]});
await q.ir(B + "trabajo.html", 1200);
const rescate = await q.eval(MIRAR);
if (rescate.d3 !== "undefined") problemas.push("trabajo.html sin D3: D3 se cargó igual y la prueba no probó nada");
if (!rescate.fichas || rescate.ocultas) problemas.push(`trabajo.html sin D3: ${rescate.ocultas} de ${rescate.fichas} fichas invisibles`);
await ch.cerrar();
servidor.close();

console.log(`Páginas revisadas: ${paginas.length}. "En cifras": ${SECCIONES.length} secciones, sin provincia y con ${PROVINCIAS.length} provincias.`);
console.log(`Artículos y fichas: ${ida.size} enlaces de ida y ${vuelta.size} de vuelta. Bajadas en la lista de Artículos: ${bajadas.filter(n => n >= 40).length} de ${nArt}.`);
console.log(`Fichas: ${CUENTA.fichas}, todas con "Ver tabla" y sin el nombre de la sección arriba, ${CUENTA.como} con "Cómo se calcula". "Ver tabla" abierta en ${PROPIAS.length} fichas nuevas. Capítulos de a uno: la fila, un enlace a otro capítulo y una dirección vieja. La vista de una ficha en su dirección.`);
console.log(`Sin cdnjs ni jsDelivr: ${Object.keys(SIN_CDN).length} páginas. Sin D3: las fichas de trabajo.html a la vista. Menús con el teclado, en 1280 y 390 píxeles. Portada: datos destacados y buscador. Lupa: flechas, Enter, sin coincidencias, respuesta rápida y Tab.` +
            (IA ? " Consultas con IA: el buscador las ofrece y la página deja escrita la pregunta del enlace." : ""));
console.log(`Accesibilidad: gráficos con nombre, "Saltar al contenido" y migas subrayadas en ${CUENTA.paginas} páginas, el salto con el teclado y el nombre del mapa. Pulido: textos de ayuda enteros en 360 y 768 píxeles y descripción de las fichas a la izquierda.`);
if (problemas.length) {
  console.log(`\nProblemas (${problemas.length}):\n- ` + problemas.join("\n- "));
  process.exit(1);
}
console.log("Todo en orden.");
