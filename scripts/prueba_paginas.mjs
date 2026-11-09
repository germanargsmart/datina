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

// de las 24 páginas fijas de las provincias (D3) se revisan dos: son la misma página, y el perfil de cada una se controla abajo con provincia.html?prov=
const paginas = readdirSync(SITIO).filter(f => f.endsWith(".html") && !SALTEAR.has(f) && (!f.startsWith("provincia-") || ["provincia-neuquen.html", "provincia-caba.html"].includes(f))).sort();
for (const pg of paginas) {
  await revisarPagina(pg);
  if (pg.startsWith("provincia-")) await p.eval(`localStorage.removeItem("prov")`);  // la página fija deja su provincia elegida: lo demás se revisa sin ella
}
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

// la Antártida (noviembre de 2026), un capítulo de Naturaleza: abre con su dirección, los dos mapas se dibujan, el país elegido cambia los nombres del mapa
// y la vista de la Península los acerca. Cada ficha se dibuja recién al entrar en pantalla
await p.ir(B + "naturaleza.html#g-antartida", 1500);
const ANT_NOMBRES = `[...document.querySelectorAll('.grafico[data-g="ant-mapa"] text')].map(t => t.textContent)`;
const antVer = async id => { await p.eval(`document.getElementById("${id}").scrollIntoView()`); await espera(1500); };
await antVer("f-ant-mapa");
const antCap = JSON.parse(await p.eval(CAP));
if (antCap.tab !== "#g-antartida" || !antCap.vis.includes("f-ant-mapa") || antCap.vis.includes("f-protegida")) problemas.push(`naturaleza.html#g-antartida: a la vista ${antCap.tab} con ${antCap.vis.join(", ")}`);
const antNom = await p.eval(ANT_NOMBRES), antPuntos = await p.eval(`document.querySelectorAll('.grafico[data-g="ant-mapa"] circle').length`);
if (!antNom.includes("Orcadas") || !antNom.includes("Belgrano II") || antPuntos < 113) problemas.push(`naturaleza.html, mapa de la Antártida: ${antPuntos} puntos y los nombres ${antNom.join(", ")}`);
await p.eval(`(() => { const s = document.getElementById("ant-pais"); s.value = "Chile"; s.dispatchEvent(new Event("change")); })()`); await espera(500);
const antChile = await p.eval(ANT_NOMBRES);
if (antChile.includes("Orcadas") || antChile.includes("Marambio")) problemas.push(`naturaleza.html, mapa de la Antártida con Chile elegido: siguen los nombres argentinos (${antChile.join(", ")})`);
await p.eval(`(() => { const s = document.getElementById("ant-pais"); s.value = "Argentina"; s.dispatchEvent(new Event("change")); })()`); await espera(300);
await p.eval(`document.querySelector('.conmutador[data-g="ant-mapa"] button[data-m="peninsula"]').click()`); await espera(500);
const antPen = await p.eval(ANT_NOMBRES);
if (!antPen.includes("Primavera") || !antPen.includes("Cámara") || antPen.includes("Belgrano II")) problemas.push(`naturaleza.html, la Península: ${antPen.join(", ")}`);
await antVer("f-ant-reclamos");
const antRec = await p.eval(`[...document.querySelectorAll('.grafico[data-g="ant-reclamos"] text')].map(t => t.textContent)`);
for (const n of ["Argentina", "Chile", "Reino Unido", "Noruega", "Australia", "Francia", "Nueva Zelanda", "Sin reclamar"]) if (!antRec.includes(n)) problemas.push(`naturaleza.html, mapa de los reclamos: falta ${n}`);
p.errores.forEach(e => problemas.push(`naturaleza.html, la Antártida: ${e}`));

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
const vista = await p.eval(`document.querySelector('.conmutador[data-g="desempleo"] button[aria-pressed="true"]')?.dataset.m + "|" + (document.querySelector('[data-t="desempleo"]')?.textContent || "").slice(0, 200)`);
if (!vista.startsWith("serie|") || !/contra un promedio/.test(vista)) problemas.push(`trabajo.html?vista=desempleo:serie: no abre esa vista (${vista})`);
p.errores.forEach(e => problemas.push(`trabajo.html con ?vista=: ${e}`));

// T9 (plan de mejora, D1): al imprimir sin haber bajado por la página, ninguna ficha a la vista sale en blanco. Se hace lo que hace el
// navegador al imprimir: el aviso de antes de imprimir y la hoja de estilos de impresión. Cada ficha tiene que verse entera, con su
// gráfico dibujado y su dirección debajo
const IMPRIMIR = ["trabajo.html", "salud.html", "naturaleza.html", "provincia.html?prov=58"];
for (const pg of IMPRIMIR) {
  await p.ir(B + pg, 800);
  await p.eval(`dispatchEvent(new Event("beforeprint"))`);
  await p.send("Emulation.setEmulatedMedia", {media: "print"}); await espera(1500);
  const mal = await p.eval(`[...document.querySelectorAll("article.ficha")].filter(f => f.offsetParent).flatMap(f => [
    ...(+getComputedStyle(f).opacity < 1 ? [f.id + " transparente"] : []),
    ...[...f.querySelectorAll(".grafico[data-g]")].filter(g => g.offsetParent && (!g.childElementCount || g.hasAttribute("aria-busy")))
      .map(g => f.id + " con el gráfico " + g.dataset.g + " sin dibujar"),
    ...(f.dataset.direccion ? [] : [f.id + " sin su dirección"])])`);
  await p.send("Emulation.setEmulatedMedia", {media: ""});
  mal.forEach(m => problemas.push(`${pg} al imprimir: ${m}`));
  p.errores.forEach(e => problemas.push(`${pg} al imprimir: ${e}`));
}

// "En cifras" sin provincia (el perfil nuevo no tiene ninguna guardada) y después con cada provincia
for (const sec of SECCIONES) await revisarCifras(sec, null);
for (const prov of PROVINCIAS) {
  for (const sec of SECCIONES) await revisarCifras(sec, prov);
  await p.ir(`${B}provincia.html?prov=${prov}`, 1200);
  const perfil = await p.eval(`[...document.querySelectorAll("#prov-grid .dp")].map(d => d.querySelector(".dp-num").textContent.trim())`);
  if (!perfil.length || perfil.some(v => !v || /NaN|undefined/.test(v))) problemas.push(`provincia.html con la provincia ${prov}: perfil incompleto (${perfil.join(" | ")})`);
}
// la página fija de una provincia (D3): abre su perfil sin nada en la dirección, y elegir otra lleva a la página de esa otra
await p.ir(`${B}provincia-neuquen.html`, 1200);
{
  const fija = await p.eval(`({t: document.title, n: document.querySelectorAll("#prov-grid .dp").length, v: document.getElementById("elige-valor").textContent, s: location.search})`);
  if (!/Neuqu/.test(fija.t) || !fija.n || !/Neuqu/.test(fija.v) || fija.s) problemas.push(`provincia-neuquen.html no abre el perfil de Neuquén: ${JSON.stringify(fija)}`);
  await p.eval(`document.getElementById("elige-btn").click(); document.getElementById("op-66").click()`);
  await new Promise(r => setTimeout(r, 1500));
  const otra = await p.eval(`location.pathname`);
  if (!otra.endsWith("provincia-salta.html")) problemas.push(`en una página fija, elegir Salta lleva a ${otra}`);
  await p.eval(`localStorage.removeItem("prov")`);  // lo que sigue se prueba sin provincia elegida
}
// La página de una provincia (5 de noviembre de 2026, pedido del autor): sin provincias parecidas ni "si fuera un país", todas las tarjetas del
// mismo tamaño, los puestos con el color que corresponde y el menú, al costado desde 1200 píxeles y desplegable en las pantallas más chicas
await p.ir(`${B}provincia-chaco.html`, 1500);
{
  const r = await p.eval(`(() => {
    const cajas = [...document.querySelectorAll(".perfil-tarjetas")], enlaces = [...document.querySelectorAll("#perfil-indice a")];
    const alto = c => Math.round(c.getBoundingClientRect().height), ancho = c => Math.round(c.getBoundingClientRect().width);
    return {
      viejos: /más parecidas|fuera un país/.test(document.querySelector(".prov-contenido").innerText),
      anchos: [...new Set(cajas.flatMap(g => [...g.children].map(ancho)))],
      altos: cajas.filter(g => new Set([...g.children].map(alto)).size > 1).map(g => g.parentElement.id),
      colgada: cajas.filter(g => { const t = [...g.children].map(c => Math.round(c.getBoundingClientRect().top)); return g.children.length > 1 && t.filter(x => x === t[t.length - 1]).length === 1; }).map(g => g.parentElement.id),
      numerados: [...document.querySelectorAll("#prov-grid h2")].filter(h => /^\\d/.test(h.textContent)).length,
      sinDestino: enlaces.filter(a => !document.getElementById(a.getAttribute("href").slice(1))).map(a => a.getAttribute("href")),
      distintos: enlaces.filter(a => a.offsetParent).filter(a => { const d = document.getElementById(a.getAttribute("href").slice(1)); const h = d.id === "prov-historia" ? d.querySelector(".ph:not([hidden]) h2") : d.querySelector("h2"); return !h || h.textContent !== a.textContent; }).map(a => a.textContent),
      lado: {pos: getComputedStyle(document.getElementById("perfil-indice")).position, btn: getComputedStyle(document.querySelector(".pi-btn")).display, vis: enlaces.filter(a => a.offsetParent).length},
      puestos: [...document.querySelectorAll("#prov-puestos .dp")].map(t => {
        const lin = t.querySelector(".dpp-linea"), ps = lin.getAttribute("points").split(" ").map(q => +q.split(",")[1]);
        return {lab: t.querySelector(".dp-lab").textContent, clase: t.querySelector(".dp-pendiente").getAttribute("class"), n: ps.length, sube: ps[ps.length - 1] < ps[0], baja: ps[ps.length - 1] > ps[0],
          dice: t.querySelector(".dp-cambio").textContent, color: getComputedStyle(lin).stroke};
      }),
    };
  })()`);
  if (r.viejos) problemas.push("provincia-chaco.html: siguen las provincias parecidas o si fuera un país");
  if (r.anchos.length !== 1) problemas.push(`provincia-chaco.html: las tarjetas tienen ${r.anchos.length} anchos (${r.anchos.join(", ")})`);
  if (r.altos.length) problemas.push(`provincia-chaco.html: tarjetas de distinto alto en ${r.altos.join(", ")}`);
  if (r.colgada.length) problemas.push(`provincia-chaco.html: una tarjeta sola en la última fila en ${r.colgada.join(", ")}`);
  if (r.numerados) problemas.push(`provincia-chaco.html: ${r.numerados} títulos de temas con número`);
  if (r.sinDestino.length) problemas.push(`provincia-chaco.html: el menú lleva a lo que no existe: ${r.sinDestino.join(", ")}`);
  if (r.distintos.length) problemas.push(`provincia-chaco.html: el menú no dice lo mismo que el título: ${r.distintos.join(", ")}`);
  if (r.lado.pos !== "sticky" || r.lado.btn !== "none" || r.lado.vis !== 17) problemas.push(`provincia-chaco.html en 1280: menú lateral mal ${JSON.stringify(r.lado)}`);
  if (r.puestos.length !== 10) problemas.push(`provincia-chaco.html: ${r.puestos.length} tarjetas de puestos`);
  const COLOR = {sube: "rgb(0, 158, 115)", baja: "rgb(200, 16, 46)", igual: "rgb(86, 96, 108)"};
  for (const t of r.puestos) {
    const clase = t.clase.replace("dp-pendiente ", "");
    const bien = t.n >= 5 && t.color === COLOR[clase] && (clase === "sube" ? t.sube && /^Mejoró/.test(t.dice) : clase === "baja" ? t.baja && /^Empeoró/.test(t.dice) : /^(Mismo puesto|Cambió)/.test(t.dice));
    if (!bien) problemas.push(`provincia-chaco.html, puestos: ${t.lab} no coincide: ${JSON.stringify(t)}`);
    if (t.lab === "Gasto en personal" && clase !== "igual") problemas.push(`provincia-chaco.html: Gasto en personal va en gris y tiene ${clase}`);
  }
  // el menú marca lo que se está viendo
  await p.eval(`document.getElementById("pg-salud").scrollIntoView()`); await espera(400);
  const marcado = await p.eval(`document.querySelector('#perfil-indice a[aria-current="true"]')?.getAttribute("href") || ""`);
  if (marcado !== "#pg-salud") problemas.push(`provincia-chaco.html: bajando a Salud, el menú marca ${marcado || "nada"}`);
  // en el celular, la franja fija que se despliega
  await p.tamano(390, 844); await espera(400);
  const cel = await p.eval(`(async () => {
    const nav = document.getElementById("perfil-indice"), btn = nav.querySelector(".pi-btn"), lista = nav.querySelector(".pi-listas"), vis = () => getComputedStyle(lista).display !== "none";
    const antes = vis(); btn.click(); const abierto = vis() && btn.getAttribute("aria-expanded") === "true", signo = getComputedStyle(nav.querySelector(".desp-signo")).display;
    nav.dispatchEvent(new KeyboardEvent("keydown", {key: "Escape", bubbles: true}));
    const conEscape = !vis() && document.activeElement === btn;
    btn.click(); document.body.click(); const tocandoAfuera = !vis();
    btn.click(); nav.querySelector('a[href="#pg-educacion"]').click(); await new Promise(res => setTimeout(res, 400));
    const h = document.getElementById("pg-educacion-t").getBoundingClientRect(), n = nav.getBoundingClientRect();
    return {antes, abierto, signo, conEscape, tocandoAfuera, cerro: !vis(), debajo: h.top >= n.bottom, dice: nav.querySelector(".pi-actual").textContent, fija: Math.round(n.top),
      corrido: document.documentElement.scrollWidth - document.documentElement.clientWidth};
  })()`);
  if (cel.antes || !cel.abierto || cel.signo === "none" || !cel.conEscape || !cel.tocandoAfuera || !cel.cerro || !cel.debajo || cel.fija !== 62 || cel.dice !== "Educación" || cel.corrido > 0)
    problemas.push(`provincia-chaco.html en 390: el menú desplegable falla ${JSON.stringify(cel)}`);
  await p.tamano(1280, 900);
}
// sin provincia elegida, el menú lleva solo a los temas. La página de Chaco la dejó guardada: lo que sigue se prueba sin ella
await p.eval(`localStorage.removeItem("prov")`);
await p.ir(`${B}provincia.html`, 1500);
{
  const vis = await p.eval(`[...document.querySelectorAll("#perfil-indice a")].filter(a => a.offsetParent).map(a => a.getAttribute("href"))`);
  if (vis.length !== 12 || vis.some(h => !h.startsWith("#pg-"))) problemas.push(`provincia.html sin provincia: el menú tiene ${vis.join(", ")}`);
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
// La página de datos destacados (segunda fase del brief de pulido, 6 de noviembre de 2026): la cifra de cada ficha de los cuatro grupos que tiene una (CLAVE en
// datina.js), en el orden de GRUPOS, ninguna de un tema sensible. Cada dato con su tema, su pregunta, la cifra sola en su línea, su texto con el año y el enlace a
// una ficha que existe. Una sola columna, sin tarjetas, una familia y hasta cuatro tamaños. SIN_ANIO: las cifras cuya fuente no da una fecha
const SIN_ANIO = {"f-especies": "el Sistema de Información de Biodiversidad no fecha sus registros", "f-glaciares": "el inventario no da una sola fecha",
  "f-ant-reclamos": "cada país reclama por una norma de otro año: están en la tabla"};
const SENSIBLES = ["f-muertes", "f-suicidio", "f-suicidio-prov", "f-edad"];
const jsSitio = readFileSync(join(SITIO, "datina.js"), "utf8"), iniClave = jsSitio.indexOf("const CLAVE = {");
const conCifra = new Set([...jsSitio.slice(iniClave, jsSitio.indexOf("\n};", iniClave)).matchAll(/"(f-[\w-]+)":/g)].map(m => m[1]));
await q.ir(B + "datos-destacados.html", 1000);
const dd = JSON.parse(await q.eval(`(() => {
  const datos = [...document.querySelectorAll(".dd-dato")], ind = window.DATINA.indice, t = new Set(), f = new Set();
  const w = document.createTreeWalker(document.querySelector("main .tema"), NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) { if (!n.textContent.trim() || !n.parentElement.closest(".dd-grupo")) continue; const c = getComputedStyle(n.parentElement); t.add(c.fontSize); f.add(c.fontFamily.split(",")[0]); }
  const vis = datos.filter(d => !d.hidden), uno = vis[0]; uno.scrollIntoView({block: "center"}); const r = uno.querySelector(".c-num").getBoundingClientRect();
  return JSON.stringify({
    grupos: [...document.querySelectorAll(".dd-grupo-tit")].map(h => h.textContent),
    indice: [...document.querySelectorAll(".dd-indice a")].map(a => a.getAttribute("href").slice(1)).filter(i => document.getElementById(i)?.matches(".dd-grupo-tit")).length,
    grupoDe: ind.grupos.map(g => [g[1], g[2].flatMap(it => Array.isArray(it) ? it[1] : [it])]),
    fichas: ind.fichas.map(x => [x[0], x[1]]),
    datos: datos.map(d => ({id: d.dataset.clave, oculto: d.hidden, tema: d.querySelector(".dd-tema")?.textContent.trim(), preg: d.querySelector(".dd-preg a")?.textContent.trim(), dest: d.querySelector(".dd-preg a")?.getAttribute("href"),
      num: d.querySelector(".c-num")?.textContent.trim(), txt: d.querySelector(".c-txt")?.textContent.trim()})),
    columnas: new Set(vis.map(d => Math.round(d.getBoundingClientRect().left))).size, tarjetas: document.querySelectorAll(".dd-grupo .tarjeta").length,
    cubre: !!document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)?.closest(".dd-preg a"), t: [...t], f: [...f]}); })()`));
const ddEsperados = dd.grupoDe.flatMap(([, secs]) => secs.flatMap(s => dd.fichas.filter(([id, sec]) => sec === s && conCifra.has(id)).map(([id]) => id)));
if (JSON.stringify(dd.datos.map(d => d.id)) !== JSON.stringify(ddEsperados))
  problemas.push(`datos-destacados.html: los datos no son los ${ddEsperados.length} de los cuatro grupos en su orden (${dd.datos.length} en la página, faltan ${ddEsperados.filter(i => !dd.datos.some(d => d.id === i)).join(", ") || "ninguno"})`);
if (JSON.stringify(dd.grupos) !== JSON.stringify(dd.grupoDe.map(g => g[0])) || dd.indice !== dd.grupos.length) problemas.push(`datos-destacados.html: los grupos no están en el orden de GRUPOS o el índice no lleva a cada uno (${dd.grupos} ${dd.indice})`);
const ddSensibles = dd.datos.filter(d => SENSIBLES.includes(d.id) || /suicid|muertes violentas/i.test(d.preg + " " + d.txt)).map(d => d.id);
if (ddSensibles.length) problemas.push(`datos-destacados.html: temas sensibles en la lista: ${ddSensibles}`);
// un dato cuya fuente no llegó queda oculto (su cifra es de las que pueden faltar en CLAVE) y no frena la actualización: se controlan los que se ven
const ddVisibles = dd.datos.filter(d => !d.oculto);
const ddIncompletos = ddVisibles.filter(d => !d.tema || !d.preg || !d.num || !d.txt).map(d => d.id);
if (ddIncompletos.length) problemas.push(`datos-destacados.html: datos incompletos: ${ddIncompletos}`);
const ddPegadas = ddVisibles.filter(d => /[a-zñáéíóú]/i.test(d.num.replace(/^N\.º /, "").replace(/ (mil millones|millones|mil)$/, ""))).map(d => d.num);
if (ddPegadas.length) problemas.push(`datos-destacados.html: dato con la unidad pegada a la cifra: ${ddPegadas}`);
const ddSinAnio = ddVisibles.filter(d => !/\b(19|20)\d\d\b/.test(d.txt) && !SIN_ANIO[d.id]).map(d => d.id);
if (ddSinAnio.length) problemas.push(`datos-destacados.html: dato sin su año (si la fuente no da una fecha, va en SIN_ANIO con su motivo): ${ddSinAnio}`);
const ddRotos = dd.datos.filter(d => { const [pag, ancla] = (d.dest || "").split("#"); return ancla !== d.id || !existsSync(join(SITIO, pag)) || !readFileSync(join(SITIO, pag), "utf8").includes(`id="${d.id}"`); }).map(d => d.id);
if (ddRotos.length) problemas.push(`datos-destacados.html: el enlace no lleva a la ficha: ${ddRotos}`);
if (dd.columnas !== 1 || dd.tarjetas) problemas.push(`datos-destacados.html: tiene que ser una sola columna, sin tarjetas (${dd.columnas} columnas, ${dd.tarjetas} tarjetas)`);
if (dd.t.length > 4 || dd.f.length !== 1) problemas.push(`datos-destacados.html: la lista lleva ${dd.t.length} tamaños y ${dd.f.length} familias: ${dd.t} ${dd.f}`);
if (!dd.cubre) problemas.push("datos-destacados.html: el enlace de la pregunta no cubre el dato entero");
// una ficha de una página con capítulos: el enlace abre su capítulo
await q.ir(B + dd.datos.find(d => d.id === "f-ant-bases").dest, 1000);
if (!(await q.eval(`!!document.getElementById("f-ant-bases")?.offsetParent`))) problemas.push("datos-destacados.html: el enlace a una ficha de otro capítulo no la deja a la vista");
// La portada (Fase 2, paso 2): los nueve datos destacados con su cifra y su texto, y el buscador, que encuentra una provincia. Desde noviembre
// de 2026 arranca compacto, se abre con el foco y Escape lo cierra
await q.ir(B + "index.html", 1000);
// y desde el 28 de octubre de 2026 (D7), debajo de cada cifra del país, cómo cambia entre las provincias
const destacados = await q.eval(`[...document.querySelectorAll(".destacado")].filter(a => a.querySelector(".c-num").textContent.trim() && a.querySelector(".c-txt").textContent.trim() && a.querySelector(".c-rango")?.textContent.trim()).length`);
if (destacados !== 9) problemas.push(`index.html: ${destacados} de 9 datos destacados con su cifra y su texto de apoyo`);
// de a tres (6 de noviembre de 2026): se ven tres, con las cifras a la misma altura, los controles los cambian, no pasan solos, y en el bloque hay hasta
// cuatro tamaños de letra y dos familias. La cifra va sola en su línea, sin la unidad
const carrusel = () => q.eval(`(() => { const p = document.getElementById("destacados"), d = [...p.querySelectorAll(".destacado")], r = p.getBoundingClientRect(), paso = d[1].offsetLeft - d[0].offsetLeft;
  const vis = d.filter(a => { const b = a.getBoundingClientRect(); return b.left >= r.left - 2 && b.right <= r.right + 2; });
  return {vis: vis.length, actual: [...document.querySelectorAll(".dest-punto")].findIndex(b => b.getAttribute("aria-current") === "true"), foco: d.filter(a => a.tabIndex === 0).length,
    pos: Math.round(p.scrollLeft / paso), cuenta: document.getElementById("dest-cuenta").textContent, alturas: new Set(vis.map(a => Math.round(a.querySelector(".c-num").getBoundingClientRect().top))).size}; })()`);
const c0 = await carrusel();
if (c0.vis !== 3 || c0.actual !== 0 || c0.foco !== 3 || c0.alturas !== 1) problemas.push(`index.html: el carrusel de datos destacados no arranca con tres datos a la vista y las cifras parejas (${JSON.stringify(c0)})`);
await q.eval(`document.querySelector(".dest-sig").click()`);
await espera(450);
const c1 = await carrusel();
if (c1.vis !== 3 || c1.actual !== 1 || c1.pos !== 3) problemas.push(`index.html: "Siguiente" no lleva a los tres datos que siguen (${JSON.stringify(c1)})`);
await q.eval(`document.querySelectorAll(".dest-punto")[2].click()`);
await espera(450);
const c3 = await carrusel();
if (c3.actual !== 2 || c3.pos !== 6) problemas.push(`index.html: el tercer redondel no lleva a los últimos tres datos (${JSON.stringify(c3)})`);
await q.eval(`document.querySelector(".dest-sig").click()`);
await espera(450);
const c2 = await carrusel();
if (c2.actual !== 0 || c2.pos !== 0) problemas.push(`index.html: después de los últimos datos destacados no vuelve a los primeros (${JSON.stringify(c2)})`);
await espera(1500);
if ((await carrusel()).actual !== 0) problemas.push("index.html: el carrusel de datos destacados pasa solo");
const letra = JSON.parse(await q.eval(`(() => { const t = new Set(), f = new Set(), w = document.createTreeWalker(document.querySelector(".destacados"), NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) { if (!n.textContent.trim() || n.parentElement.closest(".solo-lector")) continue; const c = getComputedStyle(n.parentElement); t.add(c.fontSize); f.add(c.fontFamily.split(",")[0]); }
  return JSON.stringify({t: [...t], f: [...f]}); })()`));
if (letra.t.length > 4 || letra.f.length > 2) problemas.push(`index.html: datos destacados con ${letra.t.length} tamaños y ${letra.f.length} familias: ${letra.t} ${letra.f}`);
const cifraSola = await q.eval(`[...document.querySelectorAll(".destacado .c-num")].filter(n => /[a-zñáéíóú]/i.test(n.textContent.replace(/ (mil millones|millones|mil)$/, ""))).map(n => n.textContent).join(", ")`);
if (cifraSola) problemas.push(`index.html: dato destacado con la unidad pegada a la cifra: ${cifraSola}`);
if ((await q.eval(`(() => { const a = document.querySelector(".destacados .dest-carrusel ~ .dest-todos a"); return a ? a.getAttribute("href") + "|" + a.textContent.trim() : ""; })()`)) !== "datos-destacados.html|Ver todos los datos destacados")
  problemas.push('index.html: falta "Ver todos los datos destacados" debajo del carrusel');
// en "Explorá la Argentina por tema" el enlace de cada tema cubre el tema entero, también donde hay subtemas, y cada subtema sigue con su enlace
const temasMal = await q.eval(`[...document.querySelectorAll("#secciones .tg-item")].map(i => { const r = i.getBoundingClientRect(), l = i.querySelector(".tg-link"), f = getComputedStyle(l, "::after");
  const t = i.querySelector("b").textContent;
  scrollTo(0, scrollY + r.top - 200); const r2 = i.getBoundingClientRect();
  const alBorde = [[r2.left + 2, r2.top + 2], [r2.right - 2, r2.bottom - 2]].every(([x, y]) => { const e = document.elementFromPoint(x, y); return e === l || e?.closest(".tg-link") === l; });
  const subs = [...i.querySelectorAll(".tg-subs a")].every(a => { const b = a.getBoundingClientRect(); return document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2) === a; });
  return (f.position !== "absolute" || !alBorde) ? t + ": el enlace no cubre el tema" : !subs ? t + ": un subtema no se puede tocar" : ""; }).filter(Boolean).join(", ")`);
if (temasMal) problemas.push(`index.html: ${temasMal}`);
await q.eval("scrollTo(0, 0)");
// la bajada de cada artículo va en su tarjeta solo en la lista de Artículos, no en la portada (paso 4)
if (await q.eval(`document.querySelectorAll("#art-grid-home .art-dek").length`)) problemas.push("index.html: las tarjetas de artículos llevan bajada (va solo en Artículos)");
// sin ventana, Chrome no avisa que el campo recibió el foco si la pestaña no está al frente: se lo simula mientras se prueba el buscador
await q.send("Emulation.setFocusEmulationEnabled", {enabled: true});
const anchoBusca = () => q.eval(`document.querySelector(".busca-portada").getBoundingClientRect().width`);
if ((await anchoBusca()) > 160) problemas.push(`index.html: el buscador de la portada no arranca compacto (${await anchoBusca()} píxeles)`);
await q.eval(`document.getElementById("busca-portada").focus()`);
await espera(350);
if ((await anchoBusca()) < 280) problemas.push(`index.html: el buscador de la portada no se abre con el foco (${await anchoBusca()} píxeles)`);
await q.send("Input.insertText", {text: "salta"});
await espera(300);
if (!(await q.eval(`document.querySelectorAll('#busca-portada-res a[href="provincia-salta.html"]').length`)))
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
await tecla("Escape");
if ((await anchoBusca()) > 160 || await q.eval(`document.getElementById("busca-portada").value !== "" || !document.getElementById("busca-portada-res").hidden`))
  problemas.push("index.html: Escape no cierra el buscador de la portada");
// las Malvinas son un dibujo: el puntero pasa de largo, no hay enlace y Tierra del Fuego ya no llega hasta ellas (noviembre de 2026)
const malvinas = await q.eval(`(() => { const m = document.querySelector("#mapa .malvinas"), a = document.querySelector('#mapa .provs a[data-c="94"]');
  if (!m) return "no se dibujan"; const r = m.getBoundingClientRect(), t = a.getBoundingClientRect();
  if (!r.width) return "no se ven"; if (m.closest("a")) return "están dentro de un enlace"; if (m.getAttribute("aria-hidden") !== "true") return "sin aria-hidden";
  if (getComputedStyle(m).pointerEvents !== "none") return "reciben el puntero"; if (t.right > r.left) return "Tierra del Fuego llega hasta ellas";
  const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return e && e.closest("a") ? "el centro tiene un enlace" : ""; })()`);
if (malvinas) problemas.push(`index.html: Malvinas: ${malvinas}`);
// el costado del mapa, desde 1200 píxeles: el nombre y la descripción en letra legible y, al hacer clic en cada una de las 24, sus datos sin
// recuadro, sin tapar el sol y sin que los corte el borde de lo azul
for (const W of [1440, 1200]) {
  await q.tamano(W, 900);
  await q.ir(B + "index.html", 4000);
  const lado = await q.eval(`(() => { const l = document.getElementById("mapa-lado"), a = document.querySelector('#mapa .provs a[data-c="78"]');
    if (!l.offsetParent) return "no se ve"; if (document.getElementById("mapa-ayuda").offsetParent) return "sigue la línea de abajo";
    a.dispatchEvent(new PointerEvent("pointerenter")); const t = l.textContent, c = parseFloat(getComputedStyle(l.querySelector(".ml-txt")).fontSize);
    a.dispatchEvent(new PointerEvent("pointerleave")); return !t.includes("Santa Cruz") || !t.includes("Esperanza de vida") ? "no nombra la provincia: " + t : c < 15 ? "letra de " + c : ""; })()`);
  if (lado) problemas.push(`index.html en ${W} píxeles: costado del mapa: ${lado}`);
  const costado = await q.eval(`(() => { const malas = [], sol = document.getElementById("sol").getBoundingClientRect(), por = document.querySelector(".portada").getBoundingClientRect();
    document.querySelectorAll("#mapa .provs a").forEach(a => { a.dispatchEvent(new MouseEvent("click", {bubbles: true, cancelable: true}));
      const t = document.querySelector(".mapa-tarjeta"), r = t.getBoundingClientRect(), cs = getComputedStyle(t);
      if (r.top < sol.bottom && r.left < sol.right && r.right > sol.left) malas.push(a.dataset.c + " tapa el sol");
      if (r.bottom > por.bottom) malas.push(a.dataset.c + " se corta " + Math.round(r.bottom - por.bottom));
      if (cs.boxShadow !== "none" || parseFloat(cs.borderTopWidth) || cs.backgroundColor !== "rgba(0, 0, 0, 0)") malas.push(a.dataset.c + " con recuadro");
      if ([...t.querySelectorAll("small, .mt-lab, b")].some(s => getComputedStyle(s).color !== "rgb(255, 255, 255)")) malas.push(a.dataset.c + " con letra que no se lee sobre el azul"); });
    document.dispatchEvent(new KeyboardEvent("keydown", {key: "Escape"}));
    if (document.getElementById("mapa-lado").hidden) malas.push("Escape no vuelve a la descripción");
    return malas.slice(0, 6).join(", "); })()`);
  if (costado) problemas.push(`index.html en ${W} píxeles: datos de la provincia: ${costado}`);
}
// en el celular, de a uno, con su cuenta: los nueve redondeles no entran
await q.tamano(390, 844);
await q.ir(B + "index.html", 1000);
const cel0 = await carrusel();
if (cel0.foco !== 1 || cel0.cuenta !== "1 de 9" || await q.eval(`getComputedStyle(document.getElementById("dest-puntos")).display !== "none"`)) problemas.push(`index.html en 390 píxeles: el carrusel no arranca de a uno (${JSON.stringify(cel0)})`);
await q.eval(`document.querySelector(".dest-sig").click()`);
await espera(450);
const cel1 = await carrusel();
if (cel1.cuenta !== "2 de 9" || cel1.pos !== 1) problemas.push(`index.html en 390 píxeles: "Siguiente" no pasa al dato que sigue (${JSON.stringify(cel1)})`);
await q.tamano(1280, 900);
await q.send("Emulation.setFocusEmulationEnabled", {enabled: false});
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
  await q.send("Emulation.setFocusEmulationEnabled", {enabled: true});
  await q.eval(`document.getElementById("busca-portada").focus()`);
  await espera(350);
  const portadaD = await q.eval(DESBORDA("busca-portada"));
  await q.send("Emulation.setFocusEmulationEnabled", {enabled: false});
  if (portadaD > 0) problemas.push(`index.html en ${W} píxeles: el texto de ayuda del buscador se corta (${portadaD} píxeles de más)`);
}
await q.ir(B + "trabajo.html", 1000);
if (await q.eval(`[...document.querySelectorAll(".ficha-sub")].some(s => getComputedStyle(s).textAlign !== "left") || ![...document.querySelectorAll(".ficha .lead")].some(s => getComputedStyle(s).textAlign === "justify")`))
  problemas.push("trabajo.html: la descripción debajo de la pregunta no va a la izquierda, o los textos de la ficha dejaron de estar justificados");
q.errores.forEach(e => problemas.push(`menús con el teclado: ${e}`));
await q.tamano(1280, 900);
// Elecciones por mesa (4 de noviembre de 2026): el recorrido de todo el país a una mesa tocando las filas, la historia del circuito, la búsqueda por número, la
// dirección que guarda el lugar, lo que pasa si el lugar no existe en otra elección, una elección sin mesas, el aviso de lo que le falta al provisorio y 320 píxeles.
// Pide lugares y cifras fijas (La Matanza, sección 61, circuito 627, mesa 258, Formosa 80,8%): son resultados de elecciones pasadas y no cambian. Solo cambian si se
// vuelve a correr scripts/elecciones_mesas.py con otras reglas
{
  const antes = q.errores.length;
  const ms = async (u, extra = 1400) => { if (u !== null) await q.ir(B + "mesas.html" + u, extra); else await espera(extra);
    const r = await q.eval(`JSON.stringify({tit: document.getElementById("ms-titulo")?.textContent || "", txt: document.getElementById("ms-resultado").innerText, sec: document.getElementById("ms-sec").disabled,
      cir: document.getElementById("ms-cir").disabled, mesa: document.getElementById("ms-mesa").disabled, filas: document.querySelectorAll(".ms-ir").length, hist: !!document.getElementById("ms-hist-tit"),
      bajar: document.getElementById("ms-bajar").getAttribute("href"), foco: document.activeElement?.id || "", dir: location.search, ancho: document.documentElement.scrollWidth - document.documentElement.clientWidth})`);
    const m = await q.eval(MALOS);
    if (m.length) problemas.push(`mesas.html${u}: valores sin calcular: ${m.join(" | ")}`);
    return JSON.parse(r);
  };
  const toca = sel => q.eval(`document.querySelector(${JSON.stringify(sel)}).click()`);
  let r = await ms("");
  if (r.tit !== "Todo el país" || !r.sec || r.filas !== 24 || !/Milei - Villarruel/.test(r.txt)) problemas.push(`mesas.html: la vista inicial no es la presidencial más reciente con las 24 jurisdicciones (${r.tit}, ${r.filas} filas)`);
  await toca('.ms-ir[data-p="06"]'); r = await ms(null);
  if (!r.tit.startsWith("Buenos Aires") || r.sec || !r.cir || r.filas < 100 || r.foco !== "ms-titulo" || !r.bajar.endsWith("/06.csv")) problemas.push(`mesas.html: tocar Buenos Aires no lleva a sus secciones (${r.tit}, ${r.filas} filas, foco ${r.foco}, ${r.bajar})`);
  await toca(".ms-ir[data-s]"); r = await ms(null);
  if (r.cir || !r.mesa || !r.filas || !r.hist) problemas.push(`mesas.html: una sección sin sus circuitos o su historia (${r.tit}, ${r.filas} filas)`);
  await toca(".ms-ir[data-c]"); r = await ms(null);
  if (!r.tit.startsWith("Circuito") || r.mesa || !r.filas || !r.hist) problemas.push(`mesas.html: un circuito sin sus mesas o su historia (${r.tit}, ${r.filas} filas)`);
  await toca(".ms-ir[data-m]"); r = await ms(null);
  if (!r.tit.startsWith("Mesa") || r.filas || !/Votos de cada lista|% de positivos/.test(r.txt)) problemas.push(`mesas.html: una mesa sin su resultado (${r.tit})`);
  // la búsqueda por número
  r = await ms("?e=2023-general-presidente&p=06");
  await q.eval(`(() => { const i = document.getElementById("ms-num"); i.value = "258"; document.getElementById("ms-num-ir").click(); })()`); r = await ms(null);
  if (!r.tit.startsWith("Mesa 258,") || !/m=258/.test(r.dir)) problemas.push(`mesas.html: buscar la mesa 258 no la abre (${r.tit}, ${r.dir})`);
  await q.eval(`(() => { const i = document.getElementById("ms-num"); i.value = "99999999"; document.getElementById("ms-num-ir").click(); })()`); await espera(400);
  if (!/No hay una mesa/.test(await q.eval(`document.getElementById("ms-num-res").textContent`))) problemas.push("mesas.html: buscar una mesa que no existe no lo dice");
  // el mismo lugar en otra elección
  r = await ms("?e=2011-general-presidente&p=06&s=61&c=627&m=99999999");
  if (!/no existe en ese circuito/.test(r.txt) || !r.tit.startsWith("Circuito 627")) problemas.push(`mesas.html: una mesa que no existe en esa elección no sube al circuito con su aviso (${r.tit})`);
  r = await ms("?e=2025-general-senadores&p=14");
  if (!/no eligió senadores/.test(r.txt) || r.tit !== "Todo el país") problemas.push(`mesas.html: una jurisdicción que no votó senadores no sube al país con su aviso (${r.tit})`);
  // una elección sin mesas
  r = await ms("?e=2005-general-senadores&p=06");
  if (!r.sec || r.filas || !/no hay datos que se puedan publicar/.test(r.txt) || !r.bajar.endsWith("2005-general-senadores/pais.csv")) problemas.push(`mesas.html: los senadores de 2005 no se quedan en la jurisdicción con su aviso (${r.tit}, ${r.bajar})`);
  r = await ms("?e=1983-general-presidente");
  if (!/Alfonsín - Martínez/.test(r.txt) || !/51,8%/.test(r.txt)) problemas.push("mesas.html: 1983 no suma las listas de cada provincia por fórmula");
  // el definitivo arriba y lo que le falta al provisorio debajo (5 de noviembre de 2026: el país y la jurisdicción, con el escrutinio definitivo)
  r = await ms("?e=2015-general-presidente&p=34");
  if (!/Escrutinio definitivo\./.test(r.txt) || !/Las mesas reúnen 80,8% de los votos positivos del definitivo de Formosa/.test(r.txt.replace(/\s+/g, " "))) problemas.push("mesas.html: Formosa 2015 sin el definitivo arriba o sin lo que le falta al provisorio en sus secciones");
  r = await ms("?e=2023-general-presidente&p=34&s=1");
  if (!/Escrutinio provisorio\./.test(r.txt) || /Escrutinio definitivo\./.test(r.txt)) problemas.push("mesas.html: una sección de Formosa 2023 no dice que es el provisorio");
  // el exterior y las cárceles: en la segunda vuelta de 2023, aparte y sin sumar al país, y el padrón país por país
  r = await ms("?e=2023-segunda-presidente", 2000);
  const ext = JSON.parse(await q.eval(`JSON.stringify({opciones: document.getElementById("ms-ext-pais")?.options.length || 0, apagado: document.getElementById("ms-ext-pais")?.disabled, res: document.getElementById("ms-ext-res")?.innerText || ""})`));
  // los títulos llevan un espacio duro antes de la última palabra (sinViuda): se comparan con los espacios iguales
  const txtExt = r.txt.replace(/\s+/g, " ");
  if (!/Escrutinio definitivo\./.test(txtExt) || !/Argentinos que viven en el exterior/.test(txtExt) || !/Personas privadas de libertad/.test(txtExt) || !/no está sumado/.test(txtExt) || !r.bajar.endsWith("definitivo.csv"))
    problemas.push(`mesas.html: la segunda vuelta de 2023 sin el definitivo, sin el exterior y las cárceles aparte o sin su descarga (${r.bajar})`);
  if (ext.opciones < 50 || ext.apagado || !/pueden votar/.test(ext.res)) problemas.push(`mesas.html: el desplegable del exterior no carga el padrón (${ext.opciones} países)`);
  await q.eval(`(() => { const s = document.getElementById("ms-ext-pais"); s.value = "Uruguay"; s.dispatchEvent(new Event("change", {bubbles: true})); })()`); await espera(300);
  if (!/En Uruguay pueden votar/.test(await q.eval(`document.getElementById("ms-ext-res").innerText`)) || !/pais=Uruguay/.test(await q.eval("location.search"))) problemas.push("mesas.html: elegir un país del exterior no lo muestra ni lo guarda en la dirección");
  r = await ms("?e=2019-general-diputados");
  if (!/no publica aparte el voto en el exterior/.test(r.txt.replace(/\s+/g, " ")) || /pueden votar en cada país/.test(r.txt.replace(/\s+/g, " "))) problemas.push("mesas.html: una elección sin el exterior aparte no lo explica, o muestra un padrón de otro año");
  // el mapa (5 de noviembre de 2026): el país por circuito, entrar a una provincia y elegir un circuito tocándolos, los tres modos, la elección anterior, los botones para acercar,
  // la jurisdicción que en esa elección llega solo a la sección y una elección sin mapa
  const mapa = async () => JSON.parse(await q.eval(`JSON.stringify((() => { const cs = [...document.querySelectorAll("#ms-lienzo .ms-c")];
    return {visible: !document.getElementById("ms-mapa").hidden, caminos: cs.length, pintados: cs.filter(c => c.getAttribute("fill") && c.getAttribute("fill") !== "#EEF1F4").length, tit: document.getElementById("ms-mapa-tit").textContent.replace(/\\u00a0/g, " "),
      frase: document.getElementById("ms-mapa-frase").textContent, nota: document.getElementById("ms-mapa-nota").textContent, ley: document.getElementById("ms-ley").innerText, nombre: document.querySelector("#ms-lienzo svg")?.getAttribute("aria-label") || "",
      sel: !!document.querySelector("#ms-lienzo .ms-sel")?.getAttribute("d"), zoom: document.querySelector("#ms-lienzo svg > g")?.getAttribute("transform") || "", falla: !document.getElementById("ms-mapa-falla").hidden, dir: location.search}; })())`));
  // un lugar con mesas propias: no el gris ni el rayado de lo que no tiene mesas, ni el fondo del IGN
  const tocaLugar = (p, s) => q.eval(`(() => { const c = [...document.querySelectorAll("#ms-lienzo .ms-cs .ms-c")].find(x => x.__data__.properties.p === ${JSON.stringify(p)} && (${JSON.stringify(s)} === "" || x.__data__.properties.s === ${JSON.stringify(s)}) && x.getAttribute("fill") !== "#EEF1F4" && !x.getAttribute("fill").startsWith("url("));
    c.dispatchEvent(new MouseEvent("click", {bubbles: true})); })()`);
  await ms("?e=2023-segunda-presidente", 2800);
  let m = await mapa();
  if (!m.visible || m.falla || m.caminos < 5000 || m.pintados < 4800) problemas.push(`mesas.html: el mapa del país no pinta los circuitos (${m.caminos} polígonos, ${m.pintados} pintados)`);
  if (!/Milei - Villarruel/.test(m.ley) || !/Massa - Rossi/.test(m.ley) || !/Sin mesas propias/.test(m.ley) || !/fue la más votada en/.test(m.frase) || !m.nombre.includes("Mapa de todo el país")) problemas.push(`mesas.html: el mapa del país sin su leyenda, su frase o su nombre (${m.frase})`);
  await tocaLugar("06", ""); r = await ms(null, 2800); m = await mapa();
  if (!r.tit.startsWith("Buenos Aires") || m.caminos < 1000 || m.caminos > 1400 || !/p=06/.test(m.dir)) problemas.push(`mesas.html: tocar el mapa del país no entra a la provincia (${r.tit}, ${m.caminos} polígonos)`);
  await tocaLugar("06", "61"); r = await ms(null, 2200); m = await mapa();
  if (!r.tit.startsWith("Circuito") || !/La Matanza/.test(r.tit) || !m.sel || !/s=61/.test(m.dir) || !/scale/.test(m.zoom)) problemas.push(`mesas.html: tocar un circuito no lo elige, no lo marca o no se acerca a su sección (${r.tit}, ${m.dir}, ${m.zoom})`);
  await toca('[data-ver="part"]'); await espera(500); m = await mapa();
  if (!/cuánta gente votó/i.test(m.tit) || !/Menos de 60%/.test(m.ley) || !/ver=part/.test(m.dir) || !m.pintados) problemas.push(`mesas.html: el mapa de participación (${m.tit}, ${m.dir})`);
  await toca('[data-ver="fuerza"]'); await espera(500); m = await mapa();
  if (!/sacó más votos/.test(m.tit) || !/f=/.test(m.dir) || !/reunió/.test(m.frase) || await q.eval(`document.getElementById("ms-mapa-f").hidden`)) problemas.push(`mesas.html: el mapa de cada fuerza (${m.tit}, ${m.frase})`);
  await toca('[data-ver="gana"]'); await espera(300);
  await ms("?e=2023-segunda-presidente&p=02", 2000);
  const antesZoom = (await mapa()).zoom;
  await toca('[data-z="mas"]'); await espera(500); m = await mapa();
  if (m.zoom === antesZoom || !/scale\(2/.test(m.zoom)) problemas.push(`mesas.html: el botón para acercar el mapa no acerca (${m.zoom})`);
  await toca("#ms-el-ant"); r = await ms(null, 2000);
  if (!/e=2023-general-presidente/.test(r.dir)) problemas.push(`mesas.html: "Elección anterior" no lleva a la anterior (${r.dir})`);
  await ms("?e=2015-general-presidente&p=58", 2000); m = await mapa();
  if (!/en cada sección/.test(m.tit) || !/llega hasta la sección/.test(m.nota) || !m.pintados) problemas.push(`mesas.html: Neuquén 2015 no pinta por sección ni avisa (${m.tit}, ${m.nota})`);
  // ninguna provincia gris (pedido del autor del 5 de noviembre de 2026): en Catamarca lo que no tiene mesas propias va rayado con su sección, y Formosa, que la Cámara
  // dibuja solo en los pueblos, se ve entera con el fondo del IGN. Santa Fe llega al departamento con la cartografía del IGN y sus secciones tienen su nombre oficial
  const grises = () => q.eval(`[...document.querySelectorAll("#ms-lienzo .ms-c")].filter(x => x.getAttribute("fill") === "#EEF1F4").length`);
  const rayados = () => q.eval(`[...document.querySelectorAll("#ms-lienzo .ms-c")].filter(x => (x.getAttribute("fill") || "").startsWith("url(")).length`);
  for (const p of ["10", "34", "46", "94"]) {
    await ms(`?e=2025-general-diputados&p=${p}`, 2000); m = await mapa();
    const g = await grises(), ra = await rayados();
    if (g || !ra || !/Sin mesas propias/.test(m.ley)) problemas.push(`mesas.html: en 2025 la jurisdicción ${p} tiene ${g} lugares grises o ninguno rayado (${ra})`);
  }
  r = await ms("?e=2025-general-diputados&p=82", 2000); m = await mapa();
  if (!/llega hasta el departamento/.test(m.nota) || !/Garay/.test(r.txt) || !/Iriondo/.test(r.txt) || /Villa Constitución/.test(r.txt) || await grises()) problemas.push(`mesas.html: Santa Fe 2025 sin su mapa por departamento o sin los nombres oficiales de sus secciones (${m.nota})`);
  r = await ms("?e=2011-general-diputados&p=82&s=1", 1600);
  if (!r.tit.startsWith("La Capital") || !r.hist) problemas.push(`mesas.html: la sección 1 de Santa Fe en 2011 no es La Capital (${r.tit})`);
  // de 1983 a 2009, por departamento (257arg): el mapa del país, tocar uno lo elige, el mismo lugar entre elecciones y CABA y San Luis, que no llegan al departamento
  r = await ms("?e=1983-general-presidente", 2200); m = await mapa();
  if (!/en cada departamento/.test(m.tit) || m.pintados < 450 || !/Raúl Alfonsín/.test(m.ley) || !/base de Ernesto Calvo/.test(m.nota) || !/51,8%/.test(r.txt)) problemas.push(`mesas.html: 1983 sin su mapa por departamento o sin el total oficial (${m.tit}, ${m.pintados} pintados)`);
  await tocaLugar("06", ""); r = await ms(null, 2200); m = await mapa();
  if (!r.tit.startsWith("Buenos Aires") || r.sec || !r.cir || r.filas < 100 || !/Cómo votó cada departamento/.test(r.txt) || !/no son el escrutinio definitivo/.test(r.txt)) problemas.push(`mesas.html: Buenos Aires 1983 sin sus departamentos (${r.tit}, ${r.filas} filas)`);
  await tocaLugar("06", ""); r = await ms(null, 1800); m = await mapa();
  if (!/,\s+Buenos\s+Aires$/.test(r.tit) || !m.sel || !/s=06/.test(m.dir) || r.filas) problemas.push(`mesas.html: tocar un departamento no lo elige ni lo marca (${r.tit}, ${m.dir})`);
  r = await ms("?e=2011-general-presidente&p=06&s=61", 1500);
  await q.eval(`(() => { const s = document.getElementById("ms-eleccion"); s.value = "2007-general-presidente"; s.dispatchEvent(new Event("change", {bubbles: true})); })()`); r = await ms(null, 2200);
  if (!r.tit.startsWith("La Matanza")) problemas.push(`mesas.html: pasar de 2011 a 2007 pierde La Matanza, que tiene otro código en cada nivel (${r.tit})`);
  r = await ms("?e=1995-general-presidente&p=02", 2000); m = await mapa();
  if (r.filas !== 28 || !/Cómo votó cada circunscripción/.test(r.txt) || !/CABA se pinta entera/.test(m.nota) || !m.pintados) problemas.push(`mesas.html: CABA 1995 sin sus 28 circunscripciones (${r.filas} filas, ${m.nota})`);
  r = await ms("?e=1997-general-diputados&p=74", 2000); m = await mapa();
  if (!r.sec || r.filas || !/no hay resultados por departamento/.test(m.nota) || !r.bajar.endsWith("pais.csv")) problemas.push(`mesas.html: San Luis 1997 no se pinta entera con su aviso (${m.nota})`);
  r = await ms("?e=2007-general-senadores", 2000); m = await mapa();
  if (!/en cada jurisdicción/.test(m.tit) || m.pintados !== 8 || !/No eligió senadores/.test(m.ley) || !/no hay datos que se puedan publicar/.test(r.txt)) problemas.push(`mesas.html: los senadores de 2007 sin su mapa por jurisdicción (${m.tit}, ${m.pintados} pintados)`);
  // de 1912 a 1973 (257arg, sin total oficial): el país, CABA por sección hasta 1965 y entera en 1973, una provincia entera, 1951 por circunscripción, lo que reúne y una elección con pocas jurisdicciones
  r = await ms("?e=1946-general-presidente", 2200); m = await mapa();
  if (!/en cada departamento/.test(m.tit) || m.pintados < 300 || !/Juan Domingo Perón/.test(m.ley) || !/Darío Cantón/.test(m.nota) || !/Juan Domingo Perón|Laborista/.test(r.txt)) problemas.push(`mesas.html: 1946 sin su mapa o sin su fuente (${m.tit}, ${m.pintados} pintados, ${m.nota})`);
  r = await ms("?e=1946-general-presidente&p=02", 2200); m = await mapa();
  if (r.filas !== 20 || m.pintados !== 20 || !/Cómo votó cada circunscripción/.test(r.txt)) problemas.push(`mesas.html: CABA 1946 sin sus 20 secciones (${r.filas} filas, ${m.pintados} pintadas)`);
  r = await ms("?e=1973-general-presidente&p=02", 2200); m = await mapa();
  // son 28 circunscripciones, y Lupu y Stokes no trae la 21
  if (r.filas !== 27 || !/CABA se pinta entera/.test(m.nota)) problemas.push(`mesas.html: CABA en marzo de 1973 no se pinta entera con sus 27 circunscripciones con datos (${r.filas} filas, ${m.nota})`);
  r = await ms("?e=1958-general-presidente&p=18", 2000); m = await mapa();
  if (!r.sec || !/no hay resultados por departamento/.test(m.nota)) problemas.push(`mesas.html: Corrientes 1958 no se pinta entera con su aviso (${m.nota})`);
  r = await ms("?e=1951-general-diputados", 2200); m = await mapa();
  if (!/en cada circunscripción/.test(m.tit) || m.pintados < 100 || !/primera elección nacional con voto de las mujeres/.test(m.nota)) problemas.push(`mesas.html: 1951 sin su mapa por circunscripción (${m.tit}, ${m.pintados} pintadas)`);
  r = await ms("?e=1937-general-presidente", 2000); m = await mapa();
  if (!/Hay datos de 4 jurisdicciones, que reúnen 36,9%/.test(m.nota) || !/no votaba/.test(m.ley)) problemas.push(`mesas.html: 1937 no dice cuánto reúne (${m.nota})`);
  r = await ms("?e=1973-septiembre-presidente", 2000);
  if (!/Perón/.test(r.txt) || (await q.eval(`document.getElementById("ms-eleccion").selectedOptions[0].textContent`)) !== "1973, septiembre") problemas.push("mesas.html: septiembre de 1973 no se distingue de marzo");
  // el gobernador por circuito (pedido del autor del 8 de noviembre de 2026): con mesas, el mapa de la jurisdicción baja al circuito con los polígonos
  // de la nacional del mismo año, y tocar uno elige su departamento y su circuito en la tabla. Sin mesas (Santa Fe), sigue por departamento
  r = await ms("?e=2015-general-gobernador&p=90", 2200); m = await mapa();
  const subMapa = () => q.eval(`document.getElementById("ms-mapa-sub").textContent`);
  if (!/en cada circuito/.test(m.tit) || !/escrutinio definitivo mesa por mesa/.test(await subMapa()) || m.pintados < 200 || !/Frente para la Victoria/.test(m.ley))
    problemas.push(`mesas.html: Tucumán 2015 sin el gobernador por circuito (${m.tit}, ${m.pintados} pintados)`);
  await tocaLugar("90", "4"); r = await ms(null, 1800); m = await mapa();
  if (!r.tit.startsWith("Circuito") || !/Monteros/.test(r.tit) || !/s=90070/.test(m.dir) || !/c=/.test(m.dir) || !m.sel) problemas.push(`mesas.html: tocar un circuito del gobernador no lo elige en la tabla (${r.tit}, ${m.dir})`);
  r = await ms("?e=2015-general-gobernador&p=06", 2400); m = await mapa();
  if (!/en cada circuito/.test(m.tit) || !/escrutinio provisorio mesa por mesa/.test(await subMapa()) || m.pintados < 900) problemas.push(`mesas.html: Buenos Aires 2015 sin el gobernador por circuito del provisorio (${m.tit}, ${m.pintados} pintados)`);
  r = await ms("?e=2015-general-gobernador&p=82", 2000); m = await mapa();
  if (!/en cada departamento/.test(m.tit) || m.pintados < 19) problemas.push(`mesas.html: Santa Fe 2015, sin mesas, no sigue por departamento (${m.tit}, ${m.pintados} pintados)`);
  // en el celular no se corre de costado, tampoco con las tablas de abajo a la vista
  await q.tamano(320, 700);
  for (const u of ["?e=2023-general-diputados&p=06&s=61", "?e=2023-general-presidente&p=06&s=61&c=627", "?e=2009-general-diputados&p=06", "?e=2025-general-diputados&ver=fuerza"]) {
    r = await ms(u, 1200);
    if (r.ancho > 0) problemas.push(`mesas.html${u} en 320 píxeles: se corre de costado (${r.ancho} píxeles)`);
  }
  await q.tamano(1280, 900);
  q.errores.slice(antes).forEach(e => problemas.push(`Elecciones por mesa: ${e}`));
}
// "Qué no dice este dato" (pedido del autor del 5 de noviembre de 2026: "queda a la mitad el texto"): desde 900 píxeles el texto llega hasta el borde
// del contenido, en dos columnas, en los cinco lugares donde está armado distinto: artículo, cruce, Corte Suprema, Elecciones por mesa y Diagnóstico
const LIMITES = `(() => {
  const b = [...document.querySelectorAll(".nota-limites,.dx-no-dice")].find(e => e.offsetParent && e.querySelector("li"));
  if (!b) return null;
  const caja = b.parentElement, cs = getComputedStyle(caja);
  const borde = caja.getBoundingClientRect().right - parseFloat(cs.paddingRight) - parseFloat(cs.borderRightWidth);
  return {columnas: new Set([...b.querySelectorAll("li")].map(l => Math.round(l.getBoundingClientRect().x))).size,
          falta: Math.round(borde - b.querySelector("ul").getBoundingClientRect().right)};
})()`;
const LIMITES_PAG = ["a-salario-real.html", "a-alquiler-pobreza.html", "corte-suprema.html", "mesas.html", "diagnostico.html"];
await q.tamano(1280, 900);
for (const pag of LIMITES_PAG) {
  await q.ir(B + pag, 1500);
  let r = await q.eval(LIMITES);
  for (let i = 0; i < 16 && !r; i++) { await new Promise(s => setTimeout(s, 500)); r = await q.eval(LIMITES); }
  if (!r) problemas.push(`${pag}: no aparece "Qué no dice este dato"`);
  else if (r.columnas !== 2 || Math.abs(r.falta) > 2) problemas.push(`${pag}: "Qué no dice este dato" no llena el ancho (${r.columnas} columnas, le faltan ${r.falta} píxeles)`);
}
await q.send("Network.setBlockedURLs", {urls: [...CDN, "*lib/d3-*"]});
await q.ir(B + "trabajo.html", 1200);
const rescate = await q.eval(MIRAR);
if (rescate.d3 !== "undefined") problemas.push("trabajo.html sin D3: D3 se cargó igual y la prueba no probó nada");
if (!rescate.fichas || rescate.ocultas) problemas.push(`trabajo.html sin D3: ${rescate.ocultas} de ${rescate.fichas} fichas invisibles`);
await ch.cerrar();
servidor.close();

console.log(`Páginas revisadas: ${paginas.length}. "En cifras": ${SECCIONES.length} secciones, sin provincia y con ${PROVINCIAS.length} provincias.`);
console.log(`Artículos y fichas: ${ida.size} enlaces de ida y ${vuelta.size} de vuelta. Bajadas en la lista de Artículos: ${bajadas.filter(n => n >= 40).length} de ${nArt}.`);
console.log(`Fichas: ${CUENTA.fichas}, todas con "Ver tabla" y sin el nombre de la sección arriba, ${CUENTA.como} con "Cómo se calcula". "Ver tabla" abierta en ${PROPIAS.length} fichas nuevas. Capítulos de a uno: la fila, un enlace a otro capítulo y una dirección vieja. La Antártida: el capítulo, los dos mapas y las vistas. La vista de una ficha en su dirección. Al imprimir, ninguna ficha en blanco en ${IMPRIMIR.length} páginas.`);
console.log(`Sin cdnjs ni jsDelivr: ${Object.keys(SIN_CDN).length} páginas. Sin D3: las fichas de trabajo.html a la vista. Menús con el teclado, en 1280 y 390 píxeles. Portada: datos destacados y buscador. Lupa: flechas, Enter, sin coincidencias, respuesta rápida y Tab.` +
            (IA ? " Consultas con IA: el buscador las ofrece y la página deja escrita la pregunta del enlace." : ""));
console.log(`Accesibilidad: gráficos con nombre, "Saltar al contenido" y migas subrayadas en ${CUENTA.paginas} páginas, el salto con el teclado y el nombre del mapa. Pulido: textos de ayuda enteros en 360 y 768 píxeles y descripción de las fichas a la izquierda.`);
console.log(`"Qué no dice este dato": a todo el ancho y en dos columnas en ${LIMITES_PAG.length} páginas.`);
console.log(`Datos destacados: ${dd.datos.length} cifras en ${dd.grupos.length} grupos, cada una con su enlace, ${dd.t.length} tamaños de letra. Sin año, por su fuente: ${Object.keys(SIN_ANIO).length}.`);
if (problemas.length) {
  console.log(`\nProblemas (${problemas.length}):\n- ` + problemas.join("\n- "));
  process.exit(1);
}
console.log("Todo en orden.");
