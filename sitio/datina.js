(() => {
const D = window.DATINA;

/* ---------- páginas: cada sección vive en su propio archivo (salud.html, politica.html) ---------- */
// Todas las páginas comparten el mismo marcado y el constructor oculta las secciones ajenas.
const PAGINA = document.body.dataset.pagina || "inicio";
// sección a la que pertenece la página: en un artículo es "articulos"
const SECCION = PAGINA.startsWith("a-") ? "articulos" : PAGINA;
const paginaDe = el => el?.closest(".nota")?.id || el?.closest(".tema")?.id || "inicio";
const urlPagina = (p, resto = "") => (p === "inicio" ? "./" : p + ".html") + resto;
// Los enlaces de cuando todo estaba en una sola página (#f-empleo?prov=30, #salud, ?cx=, ?ix=) llevan a la página nueva
if (PAGINA === "inicio") {
  const q = new URLSearchParams(location.search), h = location.hash.slice(1).split("?")[0], el = h && document.getElementById(h);
  const destino = h === "provincias" || (q.has("prov") && !h) ? "provincia"
    : el && paginaDe(el) !== "inicio" ? paginaDe(el) : q.has("cx") || q.has("cy") ? "cruces" : q.has("ix") ? "indice" : null;
  if (destino) { location.replace(urlPagina(destino, location.search + (h === destino || h === "provincias" ? "" : location.hash))); return; }
}
const R = D.resumen, T = D.datos, OC = R.ocde;
// Las tablas más pesadas (elecciones, transferencias por provincia, pirámide y apoyo al gobierno) van en archivos aparte
// y se bajan recién cuando se dibuja una ficha que las usa, como la lista de legisladores
const DIFERIDAS = D.diferidas || {}, pedidas = {};
const cargarTabla = n => T[n] ? Promise.resolve(T[n]) : (pedidas[n] ||= d3.json(`datos/${n}.json?v=${DIFERIDAS[n]}`).then(t => (T[n] = t)));
// Dibujo de una ficha que necesita tablas diferidas (lista fija o función que la devuelve): avisa mientras llegan y después dibuja
const conTablas = (g, nombres, dibujo) => a => {
  const faltan = (typeof nombres === "function" ? nombres() : nombres).filter(n => !T[n]);
  if (!faltan.length) return dibujo(a);
  const el = G(g); if (!el) return;
  if (!el.querySelector("svg")) el.innerHTML = '<p class="nota">Cargando los datos…</p>';
  Promise.all(faltan.map(cargarTabla)).then(() => {
    dibujo(a);
    // "Descargar imagen" se muestra solo si la ficha tiene un gráfico: ahora que está dibujado, se vuelve a mirar
    const f = el.closest(".ficha"), bi = f?.querySelector(".accion.imagen"); if (bi) bi.hidden = !svgUnico(f);
  }).catch(() => { el.innerHTML = '<p class="nota">No se pudieron cargar los datos.</p>'; });
};
const loc = d3.formatLocale({decimal:",", thousands:".", grouping:[3], currency:["$",""]});
const n0 = loc.format(",.0f"), n1 = loc.format(",.1f"), n2 = loc.format(",.2f");
const pct = v => n1(v) + "%";
const css = k => getComputedStyle(document.documentElement).getPropertyValue(k).trim();
const tip = document.getElementById("tip");
/* Cortes de línea: una palabra sola en la última línea ("cada / año") queda fea. Además de text-wrap en el CSS, que no todos
   los navegadores tienen, se unen con un espacio que no se corta las dos últimas palabras de cada texto y las palabras
   cortas que las preceden ("en el hogar", "una solución"), sin armar grupos de más de 16 caracteres. */
const NBSP = "\u00A0";
function sinViuda(t) {
  const p = t.split(" ");
  if (p.length < 4) return t;
  let i = p.length - 2, grupo = p[i] + NBSP + p[i + 1];
  if (grupo.length > 16) return t;
  while (i > 1 && p[i - 1].length <= 3 && grupo.length + p[i - 1].length < 16) { i--; grupo = p[i] + NBSP + grupo; }
  return [...p.slice(0, i), grupo].join(" ");
}
const CON_TEXTO = "p, li, dd, dt, h2, h3, h4, b, small, .sec-preg, .dest-txt, .c-txt, .rot-q";
const atarTexto = el => {
  if (!el.matches?.(CON_TEXTO) || el.closest("svg")) return;
  const n = el.lastChild;
  if (n?.nodeType === 3) { const t = sinViuda(n.nodeValue); if (t !== n.nodeValue) n.nodeValue = t; }
};
const atar = raiz => { atarTexto(raiz); raiz.querySelectorAll?.(CON_TEXTO).forEach(atarTexto); };
// los textos que se escriben después (al elegir una provincia, al cambiar de vista o en las preguntas que rotan) también
const vigiaTextos = new MutationObserver(ms => ms.forEach(m => {
  if (m.type === "characterData") { if (m.target.parentElement) atarTexto(m.target.parentElement); return; }
  if (m.target.closest?.("svg")) return;
  atarTexto(m.target); m.addedNodes.forEach(n => { if (n.nodeType === 1) atar(n); });
}));
// Íconos isométricos propios (scripts/iconos_isometricos.py), los inserta el constructor desde datos/manual/iconos_iso.
// Cada uno tiene su tono (azul, hondo u oro) y el CSS decide los colores según dónde va.
const ICONOS = {"periodico": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.267) translate(-4.2 -24)\"><path class=\"s\" d=\"M-38.5 26.4L8.3 53.4L8.3 50.7L-38.5 23.7Z\"/><path class=\"s\" d=\"M46.8 31.2L8.3 53.4L8.3 50.7L46.8 28.5Z\"/><path class=\"l\" d=\"M0 1.5L46.8 28.5L8.3 50.7L-38.5 23.7Z\"/><path class=\"l\" d=\"M-38.5 19.5L8.3 46.5L8.3 43.8L-38.5 16.8Z\"/><path class=\"s\" d=\"M46.8 24.3L8.3 46.5L8.3 43.8L46.8 21.6Z\"/><path class=\"l\" d=\"M0 -5.4L46.8 21.6L8.3 43.8L-38.5 16.8Z\"/><path class=\"s\" d=\"M0 -0.6L38.5 21.6L32.2 25.2L-6.2 3Z\"/><path class=\"s\" d=\"M-9.9 5.1L6.8 14.7L-13 26.1L-29.6 16.5Z\"/><path class=\"k\" d=\"M10.4 17.4L28.1 27.6\"/><path class=\"k\" d=\"M5.7 20.1L23.4 30.3\"/><path class=\"k\" d=\"M1 22.8L18.7 33\"/><path class=\"k\" d=\"M-3.6 25.5L14 35.7\"/><path class=\"k\" d=\"M-8.3 28.2L9.4 38.4\"/></g>"}, "maletin": {"t": "hondo", "d": "<g transform=\"translate(60 60) scale(1.139) translate(-26.6 -1.8)\"><ellipse class=\"s\" cx=\"27\" cy=\"25.2\" rx=\"47\" ry=\"9.3\"/><path class=\"l\" d=\"M-20.8 12L27 39.6L27 3.6L-20.8 -24Z\"/><path class=\"s\" d=\"M47.8 27.6L27 39.6L27 3.6L47.8 -8.4Z\"/><path class=\"l\" d=\"M0 -36L47.8 -8.4L27 3.6L-20.8 -24Z\"/><path class=\"s\" d=\"M9.9 -25.5L9.9 -19.8L7 -18.2L7 -23.9Z\"/><path class=\"s\" d=\"M7 -30.5L22.6 -21.5L19.7 -19.8L4.2 -28.8Z\"/><path class=\"s\" d=\"M22.6 -21.5L22.6 -12.5L19.7 -10.8L19.7 -19.8Z\"/><path class=\"s\" d=\"M4.2 -19.8L4.2 -28.8L19.7 -19.8L19.7 -10.8L16.9 -12.5L16.9 -18.2L7 -23.9L7 -18.2Z\"/><path class=\"k\" d=\"M-20.8 -10.8L27 16.8\"/><path class=\"s\" d=\"M0 4.8L6.2 8.4L6.2 1.2L0 -2.4Z\"/></g>"}, "tienda": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.016) translate(-13.1 -5.7)\"><ellipse class=\"s\" cx=\"28.1\" cy=\"34.2\" rx=\"38.2\" ry=\"9.3\"/><path class=\"l\" d=\"M-31.2 18L15.6 45L15.6 11.4L-31.2 -15.6Z\"/><path class=\"s\" d=\"M46.8 27L15.6 45L15.6 11.4L46.8 -6.6Z\"/><path class=\"l\" d=\"M0 -33.6L46.8 -6.6L15.6 11.4L-31.2 -15.6Z\"/><path class=\"s\" d=\"M-26 21L-17.1 26.1L-17.1 5.7L-26 0.6Z\"/><path class=\"l\" d=\"M-13 20.7L10.4 34.2L10.4 21.6L-13 8.1Z\"/><path class=\"k\" d=\"M-1.3 27.4L-1.3 14.8\"/><path class=\"s\" d=\"M-31.2 -12L-21.8 -6.6L-30.7 3.9L-40 -1.5Z\"/><path class=\"s\" d=\"M-40 -1.5L-30.7 3.9L-30.7 6.9L-40 1.5Z\"/><path class=\"l\" d=\"M-21.8 -6.6L-12.5 -1.2L-21.3 9.3L-30.7 3.9Z\"/><path class=\"l\" d=\"M-30.7 3.9L-21.3 9.3L-21.3 12.3L-30.7 6.9Z\"/><path class=\"s\" d=\"M-12.5 -1.2L-3.1 4.2L-12 14.7L-21.3 9.3Z\"/><path class=\"s\" d=\"M-21.3 9.3L-12 14.7L-12 17.7L-21.3 12.3Z\"/><path class=\"l\" d=\"M-3.1 4.2L6.2 9.6L-2.6 20.1L-12 14.7Z\"/><path class=\"l\" d=\"M-12 14.7L-2.6 20.1L-2.6 23.1L-12 17.7Z\"/><path class=\"s\" d=\"M6.2 9.6L15.6 15L6.8 25.5L-2.6 20.1Z\"/><path class=\"s\" d=\"M-2.6 20.1L6.8 25.5L6.8 28.5L-2.6 23.1Z\"/></g>"}, "casa": {"t": "oro", "d": "<g transform=\"translate(60 60) scale(1.089) translate(-7.5 -2.7)\"><ellipse class=\"s\" cx=\"21.8\" cy=\"31.8\" rx=\"35.3\" ry=\"8.5\"/><path class=\"l\" d=\"M-20.8 -36.6L20.8 -12.6L42.1 -4.5L0.5 -28.5Z\"/><path class=\"l\" d=\"M14 -12.9L18.7 -10.2L18.7 -24.6L14 -27.3Z\"/><path class=\"s\" d=\"M23.4 -12.9L18.7 -10.2L18.7 -24.6L23.4 -27.3Z\"/><path class=\"l\" d=\"M18.7 -30L23.4 -27.3L18.7 -24.6L14 -27.3Z\"/><path class=\"l\" d=\"M-36.4 21L0 42L0 15.6L-36.4 -5.4Z\"/><path class=\"s\" d=\"M36.4 21L0 42L0 15.6L36.4 -5.4Z\"/><path class=\"s\" d=\"M39.5 -6L-3.1 18.6L18.2 -14.1Z\"/><path class=\"w\" d=\"M22.9 -0.6L13.5 4.8L13.5 -3L22.9 -8.4Z\"/><path class=\"s\" d=\"M-31.2 24L-22.9 28.8L-22.9 10.8L-31.2 6Z\"/><path class=\"l\" d=\"M-16.6 24L-5.2 30.6L-5.2 19.8L-16.6 13.2Z\"/><path class=\"k\" d=\"M-10.9 27.3L-10.9 16.5\"/><path class=\"s\" d=\"M-20.8 -36.6L20.8 -12.6L-0.5 20.1L-42.1 -3.9Z\"/></g>"}, "botiquin": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.129) translate(-23.9 -0.9)\"><ellipse class=\"s\" cx=\"29.1\" cy=\"27.6\" rx=\"42.6\" ry=\"9.3\"/><path class=\"l\" d=\"M-23.9 13.8L19.7 39L19.7 1.8L-23.9 -23.4Z\"/><path class=\"s\" d=\"M43.6 25.2L19.7 39L19.7 1.8L43.6 -12Z\"/><path class=\"l\" d=\"M0 -37.2L43.6 -12L19.7 1.8L-23.9 -23.4Z\"/><path class=\"s\" d=\"M7 -25.7L7 -21.2L4.2 -19.5L4.2 -24Z\"/><path class=\"s\" d=\"M4.2 -30.6L18.7 -22.2L15.8 -20.6L1.3 -29Z\"/><path class=\"s\" d=\"M18.7 -22.2L18.7 -14.4L15.8 -12.8L15.8 -20.6Z\"/><path class=\"s\" d=\"M1.3 -21.2L1.3 -29L15.8 -20.6L15.8 -12.8L13 -14.4L13 -18.9L4.2 -24L4.2 -19.5Z\"/><path class=\"s\" d=\"M-6 18.1L1.8 22.6L1.8 14.5L8.8 18.6L8.8 9.6L1.8 5.5L1.8 -2.6L-6 -7.1L-6 1L-13 -3L-13 6L-6 10Z\"/></g>"}, "birrete": {"t": "hondo", "d": "<g transform=\"translate(60 60) scale(1.088) translate(-1.8 -12.4)\"><path class=\"l\" d=\"M-22.8 13.2L-22 9.8L-18.1 5.2L-11.4 1.8L-0 0L11.4 1.8L18.1 5.2L22 9.8L22.8 13.2L21.1 31.6L18.5 36.2L13 39.8L2.8 42.2L-8.2 41.4L-15.1 38.7L-19.7 34.7L-21.1 31.6L-21.3 30Z\"/><path class=\"s\" d=\"M0 0L-0 0L11.4 1.8L18.1 5.2L22 9.8L22.8 13.2L21.1 31.6L18.5 36.2L13 39.8L2.8 42.2L0 42Z\"/><path class=\"s\" d=\"M47.8 13.2L0 40.8L0 37.8L47.8 10.2Z\"/><path class=\"s\" d=\"M0 40.8L-47.8 13.2L-47.8 10.2L0 37.8Z\"/><path class=\"l\" d=\"M0 -17.4L47.8 10.2L0 37.8L-47.8 10.2Z\"/><path class=\"s\" d=\"M-4 10.2A4 2.3 0 0 0 4 10.2L4 8.4A4 2.3 0 0 1 -4 8.4Z\"/><ellipse class=\"l\" cx=\"0\" cy=\"8.4\" rx=\"4\" ry=\"2.3\"/><path class=\"k\" d=\"M0 8.4L47.8 10.2L47.8 25.2\"/><path class=\"s\" d=\"M44.2 31.8L47.8 33.9L47.8 26.1L44.2 24Z\"/><path class=\"s\" d=\"M51.4 31.8L47.8 33.9L47.8 26.1L51.4 24Z\"/><path class=\"s\" d=\"M47.8 21.9L51.4 24L47.8 26.1L44.2 24Z\"/></g>"}, "personas": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.350) translate(-0 -16.4)\"><path class=\"s\" d=\"M-36.6 24.6A10.7 6.2 0 0 0 -15.3 24.6L-15.3 10.2A10.7 6.2 0 0 1 -36.6 10.2Z\"/><path class=\"l\" d=\"M-36.6 10.2A10.7 10.7 0 0 1 -15.3 10.2A10.7 6.2 0 0 1 -36.6 10.2Z\"/><path class=\"s\" d=\"M-26 -0.5A10.7 10.7 0 0 1 -15.3 10.2A10.7 6.2 0 0 1 -26 16.4Z\"/><circle class=\"l\" cx=\"-26\" cy=\"-3.9\" r=\"7\"/><path class=\"s\" d=\"M-26 -10.9A7 7 0 0 1 -26 3.1Z\"/><path class=\"s\" d=\"M15.3 24.6A10.7 6.2 0 0 0 36.6 24.6L36.6 10.2A10.7 6.2 0 0 1 15.3 10.2Z\"/><path class=\"l\" d=\"M15.3 10.2A10.7 10.7 0 0 1 36.6 10.2A10.7 6.2 0 0 1 15.3 10.2Z\"/><path class=\"s\" d=\"M26 -0.5A10.7 10.7 0 0 1 36.6 10.2A10.7 6.2 0 0 1 26 16.4Z\"/><circle class=\"l\" cx=\"26\" cy=\"-3.9\" r=\"7\"/><path class=\"s\" d=\"M26 -10.9A7 7 0 0 1 26 3.1Z\"/><path class=\"s\" d=\"M-13.2 36A13.2 7.6 0 0 0 13.2 36L13.2 18A13.2 7.6 0 0 1 -13.2 18Z\"/><path class=\"l\" d=\"M-13.2 18A13.2 13.2 0 0 1 13.2 18A13.2 7.6 0 0 1 -13.2 18Z\"/><path class=\"s\" d=\"M0 4.8A13.2 13.2 0 0 1 13.2 18A13.2 7.6 0 0 1 0 25.6Z\"/><circle class=\"l\" cx=\"0\" cy=\"0.5\" r=\"8.7\"/><path class=\"s\" d=\"M0 -8.2A8.7 8.7 0 0 1 0 9.2Z\"/></g>"}, "congreso": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.019) translate(-9.4 -15.5)\"><path class=\"l\" d=\"M-43.6 25.2L18.7 61.2L18.7 56.4L-43.6 20.4Z\"/><path class=\"s\" d=\"M62.4 36L18.7 61.2L18.7 56.4L62.4 31.2Z\"/><path class=\"l\" d=\"M0 -4.8L62.4 31.2L18.7 56.4L-43.6 20.4Z\"/><path class=\"l\" d=\"M-34.3 19.8L19.7 51L19.7 28.2L-34.3 -3Z\"/><path class=\"s\" d=\"M54 31.2L19.7 51L19.7 28.2L54 8.4Z\"/><path class=\"l\" d=\"M0 -22.8L54 8.4L19.7 28.2L-34.3 -3Z\"/><path class=\"s\" d=\"M-30.7 20.1L-27 22.2L-27 4.2L-30.7 2.1Z\"/><path class=\"s\" d=\"M-21.6 25.3L-17.9 27.4L-17.9 9.5L-21.6 7.3Z\"/><path class=\"s\" d=\"M-12.5 30.6L-8.8 32.7L-8.8 14.7L-12.5 12.6Z\"/><path class=\"s\" d=\"M-3.4 35.8L0.3 37.9L0.3 20L-3.4 17.8Z\"/><path class=\"s\" d=\"M5.7 41.1L9.4 43.2L9.4 25.2L5.7 23.1Z\"/><path class=\"s\" d=\"M14.8 46.3L18.4 48.4L18.4 30.4L14.8 28.3Z\"/><path class=\"l\" d=\"M-17.7 6.6L3.1 18.6L-7.3 4.8Z\"/><path class=\"s\" d=\"M-7.3 4.8L-17.7 6.6L-11.4 3L-1 1.2Z\"/><path class=\"s\" d=\"M3.1 18.6L-7.3 4.8L-1 1.2L9.4 15Z\"/><path class=\"s\" d=\"M-7 2.7A16.9 9.8 0 0 0 26.8 2.7L26.8 -6.3A16.9 9.8 0 0 1 -7 -6.3Z\"/><ellipse class=\"l\" cx=\"9.9\" cy=\"-6.3\" rx=\"16.9\" ry=\"9.8\"/><path class=\"l\" d=\"M-7 -6.3A16.9 16.9 0 0 1 26.8 -6.3A16.9 9.8 0 0 1 -7 -6.3Z\"/><path class=\"s\" d=\"M9.9 -23.2A16.9 16.9 0 0 1 26.8 -6.3A16.9 9.8 0 0 1 9.9 3.5Z\"/><path class=\"s\" d=\"M6.6 -22.8A3.3 1.9 0 0 0 13.2 -22.8L13.2 -28.2A3.3 1.9 0 0 1 6.6 -28.2Z\"/><ellipse class=\"l\" cx=\"9.9\" cy=\"-28.2\" rx=\"3.3\" ry=\"1.9\"/></g>"}, "colectivo": {"t": "hondo", "d": "<g transform=\"translate(60 60) scale(1.307) translate(-18.4 -3.7)\"><path class=\"l\" d=\"M-22.9 7.2L36.9 41.7L36.9 12.9L-22.9 -21.6Z\"/><path class=\"s\" d=\"M59.8 28.5L36.9 41.7L36.9 12.9L59.8 -0.3Z\"/><path class=\"l\" d=\"M0 -34.8L59.8 -0.3L36.9 12.9L-22.9 -21.6Z\"/><path class=\"s\" d=\"M-7.3 1.8L-0.8 5.5L-0.8 -4.7L-7.3 -8.4Z\"/><path class=\"s\" d=\"M1.3 6.7L7.8 10.5L7.8 0.3L1.3 -3.5Z\"/><path class=\"s\" d=\"M9.9 11.7L16.4 15.4L16.4 5.2L9.9 1.5Z\"/><path class=\"s\" d=\"M18.4 16.6L24.9 20.4L24.9 10.2L18.4 6.4Z\"/><path class=\"s\" d=\"M27 21.6L33.5 25.3L33.5 15.1L27 11.4Z\"/><path class=\"s\" d=\"M-18.7 4.8L-11.4 9L-11.4 -10.8L-18.7 -15Z\"/><path class=\"w\" d=\"M57.2 16.2L39.5 26.4L39.5 14.4L57.2 4.2Z\"/><path class=\"s\" d=\"M0.3 20.2L0.1 18.5L-0.4 16.6L-1.2 14.8L-2.2 13L-3.4 11.4L-4.8 10L-6.2 9L-7.7 8.4L-9.1 8.1L-10.3 8.3L-11.3 8.9L-12.1 9.9L-12.6 11.2L-12.7 12.7L-12.6 14.5L-12.1 16.4L-11.3 18.2L-10.3 20L-9.1 21.6L-7.7 23L-6.2 24L-4.8 24.6L-3.4 24.9L-2.2 24.7L-1.2 24.1L-0.4 23.1L0.1 21.8Z\"/><path class=\"w\" d=\"M-3.9 17.8L-4 17.1L-4.2 16.3L-4.6 15.5L-5.1 14.8L-5.6 14.2L-6.2 13.8L-6.8 13.5L-7.4 13.5L-7.9 13.6L-8.3 14L-8.5 14.5L-8.6 15.1L-8.5 15.9L-8.3 16.7L-7.9 17.5L-7.4 18.2L-6.8 18.8L-6.2 19.2L-5.6 19.5L-5.1 19.5L-4.6 19.4L-4.2 19L-4 18.5Z\"/><path class=\"s\" d=\"M30.4 37.6L30.2 35.9L29.8 34L29 32.2L28 30.4L26.7 28.8L25.3 27.4L23.9 26.4L22.5 25.8L21.1 25.5L19.9 25.7L18.8 26.3L18.1 27.3L17.6 28.6L17.4 30.1L17.6 31.9L18.1 33.8L18.8 35.6L19.9 37.4L21.1 39L22.5 40.4L23.9 41.4L25.3 42L26.7 42.3L28 42.1L29 41.5L29.8 40.5L30.2 39.2Z\"/><path class=\"w\" d=\"M26.2 35.2L26.2 34.5L25.9 33.7L25.6 32.9L25.1 32.2L24.5 31.6L23.9 31.2L23.3 30.9L22.7 30.9L22.2 31L21.9 31.4L21.6 31.9L21.6 32.5L21.6 33.3L21.9 34.1L22.2 34.9L22.7 35.6L23.3 36.2L23.9 36.6L24.5 36.9L25.1 36.9L25.6 36.8L25.9 36.4L26.2 35.9Z\"/></g>"}, "rayo": {"t": "oro", "d": "<g transform=\"translate(60 60) scale(1.350) translate(-17.7 16.2)\"><ellipse class=\"s\" cx=\"17.7\" cy=\"17.4\" rx=\"26.5\" ry=\"5.9\"/><path class=\"s\" d=\"M7.3 4.2L35.3 -18.6L26.5 -13.5L-1.6 9.3Z\"/><path class=\"s\" d=\"M35.3 -18.6L20.3 -27.3L11.4 -22.2L26.5 -13.5Z\"/><path class=\"s\" d=\"M20.3 -27.3L30.1 -46.2L21.3 -41.1L11.4 -22.2Z\"/><path class=\"s\" d=\"M30.1 -46.2L13.5 -55.8L4.7 -50.7L21.3 -41.1Z\"/><path class=\"l\" d=\"M4.7 -50.7L-7.8 -23.7L6.2 -15.6L-1.6 9.3L26.5 -13.5L11.4 -22.2L21.3 -41.1Z\"/></g>"}, "valija": {"t": "hondo", "d": "<g transform=\"translate(60 60) scale(1.350) translate(-18.2 8.3)\"><ellipse class=\"s\" cx=\"21.8\" cy=\"21\" rx=\"32.3\" ry=\"7.6\"/><path class=\"s\" d=\"M-14.1 11.4A3.7 2.1 0 0 0 -6.7 11.4L-6.7 8.1A3.7 2.1 0 0 1 -14.1 8.1Z\"/><path class=\"s\" d=\"M7.8 24A3.7 2.1 0 0 0 15.1 24L15.1 20.7A3.7 2.1 0 0 1 7.8 20.7Z\"/><path class=\"l\" d=\"M-17.7 6.9L14.5 25.5L14.5 -16.5L-17.7 -35.1Z\"/><path class=\"s\" d=\"M32.2 15.3L14.5 25.5L14.5 -16.5L32.2 -26.7Z\"/><path class=\"l\" d=\"M0 -45.3L32.2 -26.7L14.5 -16.5L-17.7 -35.1Z\"/><path class=\"s\" d=\"M-10.9 10.8L-7.8 12.6L-7.8 -29.4L-10.9 -31.2Z\"/><path class=\"s\" d=\"M4.7 19.8L7.8 21.6L7.8 -20.4L4.7 -22.2Z\"/><path class=\"s\" d=\"M6.2 -38.7L6.2 -33.3L3.1 -31.5L3.1 -36.9Z\"/><path class=\"s\" d=\"M3.1 -44.1L14.5 -37.5L11.4 -35.7L0 -42.3Z\"/><path class=\"s\" d=\"M14.5 -37.5L14.5 -28.5L11.4 -26.7L11.4 -35.7Z\"/><path class=\"s\" d=\"M0 -33.3L0 -42.3L11.4 -35.7L11.4 -26.7L8.3 -28.5L8.3 -33.9L3.1 -36.9L3.1 -31.5Z\"/></g>"}, "andes": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.052) translate(-9.4 -18.4)\"><path class=\"l\" d=\"M-5.2 45.8L-41.9 24.6L-1 -27Z\"/><path class=\"k\" d=\"M-2.5 -0.8L-6.7 -11.3L-15.8 -8.4\"/><path class=\"s\" d=\"M31.5 24.6L-5.2 45.8L-1 -27Z\"/><path class=\"w\" d=\"M-1 -27L10.7 -8.4L2.5 -11.3L-2.5 -0.8Z\"/><path class=\"s\" d=\"M35.8 48.6L9.4 63.9L9.4 13.8Z\"/><path class=\"w\" d=\"M9.4 13.8L17.8 24.9L12.3 23.3L9.4 29.8Z\"/><path class=\"l\" d=\"M9.4 63.9L-17.1 48.6L9.4 13.8Z\"/><path class=\"k\" d=\"M9.4 29.8L6.4 23.3L0.9 24.9\"/><path class=\"l\" d=\"M41.6 44.6L22.5 33.6L41.6 9.6Z\"/><path class=\"k\" d=\"M41.6 20.1L39.6 15.8L35.8 16.8\"/><path class=\"s\" d=\"M60.7 33.6L41.6 44.6L41.6 9.6Z\"/><path class=\"w\" d=\"M41.6 9.6L47.3 16.8L43.6 15.8L41.6 20.1Z\"/></g>"}, "mate": {"t": "oro", "d": "<g transform=\"translate(60 60) scale(1.350) translate(-8.1 -3.7)\"><path class=\"l\" d=\"M-25.4 18.6L-23.8 10.7L-18.8 3.9L-10.7 -3.8L-2 -6.2L7.5 -5.1L13 -1.9L23.8 10.7L25.4 18.6L23.1 26.4L18.9 31.2L12.3 35.7L2.6 38L-7.7 37.2L-16 33.5L-22.1 28.1L-25.1 20.5Z\"/><path class=\"s\" d=\"M0 -6L7.5 -5.1L13 -1.9L23.8 10.7L25.4 18.6L23.1 26.4L18.9 31.2L12.3 35.7L2.6 38L0 37.8Z\"/><path class=\"l\" d=\"M-15.8 2.4A15.8 9.1 0 0 0 15.8 2.4L15.8 -2.4A15.8 9.1 0 0 1 -15.8 -2.4Z\"/><ellipse class=\"l\" cx=\"0\" cy=\"-2.4\" rx=\"15.8\" ry=\"9.1\"/><ellipse class=\"s\" cx=\"0\" cy=\"-2.4\" rx=\"12.1\" ry=\"7\"/><path class=\"k\" d=\"M6.2 -1.8L32.7 -29.1L41.6 -28.5\"/><path class=\"k\" d=\"M6.2 -3.3L32.7 -30.6\"/></g>"}, "dispersion": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.083) translate(-0 -27.1)\"><path class=\"l\" d=\"M-49.9 28.8L0 57.6L0 54.3L-49.9 25.5Z\"/><path class=\"s\" d=\"M49.9 28.8L0 57.6L0 54.3L49.9 25.5Z\"/><path class=\"l\" d=\"M0 -3.3L49.9 25.5L0 54.3L-49.9 25.5Z\"/><path class=\"l\" d=\"M-23.1 25L-17.1 28.5L-17.1 19.5L-23.1 16Z\"/><path class=\"s\" d=\"M-11.2 25L-17.1 28.5L-17.1 19.5L-11.2 16Z\"/><path class=\"l\" d=\"M-17.1 12.6L-11.2 16L-17.1 19.5L-23.1 16Z\"/><path class=\"l\" d=\"M23.1 25.3L29.1 28.8L29.1 8.4L23.1 4.9Z\"/><path class=\"s\" d=\"M35.1 25.3L29.1 28.8L29.1 8.4L35.1 4.9Z\"/><path class=\"l\" d=\"M29.1 1.5L35.1 4.9L29.1 8.4L23.1 4.9Z\"/><path class=\"l\" d=\"M-40.8 25.6L-34.8 29.1L-34.8 24.3L-40.8 20.8Z\"/><path class=\"s\" d=\"M-28.8 25.6L-34.8 29.1L-34.8 24.3L-28.8 20.8Z\"/><path class=\"l\" d=\"M-34.8 17.4L-28.8 20.8L-34.8 24.3L-40.8 20.8Z\"/><path class=\"l\" d=\"M-1.3 25.6L4.7 29.1L4.7 14.7L-1.3 11.2Z\"/><path class=\"s\" d=\"M10.7 25.6L4.7 29.1L4.7 14.7L10.7 11.2Z\"/><path class=\"l\" d=\"M4.7 7.8L10.7 11.2L4.7 14.7L-1.3 11.2Z\"/><path class=\"l\" d=\"M-21 33.4L-15.1 36.9L-15.1 30.3L-21 26.8Z\"/><path class=\"s\" d=\"M-9.1 33.4L-15.1 36.9L-15.1 30.3L-9.1 26.8Z\"/><path class=\"l\" d=\"M-15.1 23.4L-9.1 26.8L-15.1 30.3L-21 26.8Z\"/><path class=\"l\" d=\"M18.4 33.4L24.4 36.9L24.4 19.5L18.4 16Z\"/><path class=\"s\" d=\"M30.4 33.4L24.4 36.9L24.4 19.5L30.4 16Z\"/><path class=\"l\" d=\"M24.4 12.6L30.4 16L24.4 19.5L18.4 16Z\"/><path class=\"l\" d=\"M1.8 34.6L7.8 38.1L7.8 26.1L1.8 22.6Z\"/><path class=\"s\" d=\"M13.8 34.6L7.8 38.1L7.8 26.1L13.8 22.6Z\"/><path class=\"l\" d=\"M7.8 19.2L13.8 22.6L7.8 26.1L1.8 22.6Z\"/></g>"}, "podio": {"t": "oro", "d": "<g transform=\"translate(60 60) scale(1.350) translate(-14 -6.9)\"><path class=\"l\" d=\"M-21.8 12.6L-5.2 22.2L-5.2 -3L-21.8 -12.6Z\"/><path class=\"s\" d=\"M16.6 9.6L-5.2 22.2L-5.2 -3L16.6 -15.6Z\"/><path class=\"l\" d=\"M0 -25.2L16.6 -15.6L-5.2 -3L-21.8 -12.6Z\"/><path class=\"l\" d=\"M-5.2 22.2L11.4 31.8L11.4 -5.4L-5.2 -15Z\"/><path class=\"s\" d=\"M33.3 19.2L11.4 31.8L11.4 -5.4L33.3 -18Z\"/><path class=\"l\" d=\"M16.6 -27.6L33.3 -18L11.4 -5.4L-5.2 -15Z\"/><path class=\"l\" d=\"M11.4 31.8L28.1 41.4L28.1 24.6L11.4 15Z\"/><path class=\"s\" d=\"M49.9 28.8L28.1 41.4L28.1 24.6L49.9 12Z\"/><path class=\"l\" d=\"M33.3 2.4L49.9 12L28.1 24.6L11.4 15Z\"/><path class=\"s\" d=\"M-16.6 -0L-10.4 3.6L-10.4 0.9L-16.6 -2.7Z\"/><path class=\"s\" d=\"M0 -2.4L6.2 1.2L6.2 -1.5L0 -5.1Z\"/><path class=\"s\" d=\"M16.6 26.4L22.9 30L22.9 27.3L16.6 23.7Z\"/></g>"}, "mosaico": {"t": "hondo", "d": "<g transform=\"translate(60 60) scale(1.168) translate(-0 -20.5)\"><path class=\"l\" d=\"M-14 8.1L0 16.2L0 10.2L-14 2.1Z\"/><path class=\"s\" d=\"M14 8.1L0 16.2L0 10.2L14 2.1Z\"/><path class=\"l\" d=\"M0 -6L14 2.1L0 10.2L-14 2.1Z\"/><path class=\"l\" d=\"M-30.1 17.4L-16.1 25.5L-16.1 9.9L-30.1 1.8Z\"/><path class=\"s\" d=\"M-2.1 17.4L-16.1 25.5L-16.1 9.9L-2.1 1.8Z\"/><path class=\"l\" d=\"M-16.1 -6.3L-2.1 1.8L-16.1 9.9L-30.1 1.8Z\"/><path class=\"l\" d=\"M2.1 17.4L16.1 25.5L16.1 3.9L2.1 -4.2Z\"/><path class=\"s\" d=\"M30.1 17.4L16.1 25.5L16.1 3.9L30.1 -4.2Z\"/><path class=\"l\" d=\"M16.1 -12.3L30.1 -4.2L16.1 3.9L2.1 -4.2Z\"/><path class=\"l\" d=\"M-46.2 26.7L-32.2 34.8L-32.2 25.2L-46.2 17.1Z\"/><path class=\"s\" d=\"M-18.2 26.7L-32.2 34.8L-32.2 25.2L-18.2 17.1Z\"/><path class=\"l\" d=\"M-32.2 9L-18.2 17.1L-32.2 25.2L-46.2 17.1Z\"/><path class=\"l\" d=\"M-14 26.7L0 34.8L0 27.6L-14 19.5Z\"/><path class=\"s\" d=\"M14 26.7L0 34.8L0 27.6L14 19.5Z\"/><path class=\"l\" d=\"M0 11.4L14 19.5L0 27.6L-14 19.5Z\"/><path class=\"l\" d=\"M18.2 26.7L32.2 34.8L32.2 24L18.2 15.9Z\"/><path class=\"s\" d=\"M46.2 26.7L32.2 34.8L32.2 24L46.2 15.9Z\"/><path class=\"l\" d=\"M32.2 7.8L46.2 15.9L32.2 24L18.2 15.9Z\"/><path class=\"l\" d=\"M-30.1 36L-16.1 44.1L-16.1 30.9L-30.1 22.8Z\"/><path class=\"s\" d=\"M-2.1 36L-16.1 44.1L-16.1 30.9L-2.1 22.8Z\"/><path class=\"l\" d=\"M-16.1 14.7L-2.1 22.8L-16.1 30.9L-30.1 22.8Z\"/><path class=\"l\" d=\"M2.1 36L16.1 44.1L16.1 17.7L2.1 9.6Z\"/><path class=\"s\" d=\"M30.1 36L16.1 44.1L16.1 17.7L30.1 9.6Z\"/><path class=\"l\" d=\"M16.1 1.5L30.1 9.6L16.1 17.7L2.1 9.6Z\"/><path class=\"l\" d=\"M-14 45.3L0 53.4L0 45L-14 36.9Z\"/><path class=\"s\" d=\"M14 45.3L0 53.4L0 45L14 36.9Z\"/><path class=\"l\" d=\"M0 28.8L14 36.9L0 45L-14 36.9Z\"/></g>"}, "pin": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.123) translate(-6.5 -22.3)\"><path class=\"l\" d=\"M0 0L18.2 5.1L-23.4 29.1L-41.6 24Z\"/><path class=\"s\" d=\"M18.2 5.1L36.4 21L-5.2 45L-23.4 29.1Z\"/><path class=\"l\" d=\"M36.4 21L54.6 26.1L13 50.1L-5.2 45Z\"/><path class=\"k\" d=\"M-30.1 21L-9.4 15.2L0.5 15.3\"/><path class=\"wl\" d=\"M0.5 15.3L12.5 19.7L24.9 27.6\"/><path class=\"s\" d=\"M27 33.5L16.6 10.6L37.4 10.6Z\"/><circle class=\"s\" cx=\"27\" cy=\"5.9\" r=\"11.4\"/><circle class=\"w\" cx=\"27\" cy=\"5.9\" r=\"4.8\"/></g>"}, "buque": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.186) translate(-22.7 -6.1)\"><ellipse class=\"s\" cx=\"27\" cy=\"26.4\" rx=\"41.2\" ry=\"7.6\"/><path class=\"s\" d=\"M60.3 21L0 -13.8L-22.9 -0.6L37.4 34.2Z\"/><path class=\"s\" d=\"M52 30L60.3 21L37.4 34.2L29.1 43.2Z\"/><path class=\"s\" d=\"M-22.9 -0.6L-18.7 15.6L29.1 43.2L37.4 34.2Z\"/><path class=\"l\" d=\"M0 -13.8L60.3 21L37.4 34.2L-22.9 -0.6Z\"/><path class=\"wl\" d=\"M-20 10.3L31.7 40.2\"/><path class=\"l\" d=\"M-17.1 -0.9L-7.3 4.8L-7.3 -15.6L-17.1 -21.3Z\"/><path class=\"s\" d=\"M9.4 -4.8L-7.3 4.8L-7.3 -15.6L9.4 -25.2Z\"/><path class=\"l\" d=\"M-0.5 -30.9L9.4 -25.2L-7.3 -15.6L-17.1 -21.3Z\"/><path class=\"s\" d=\"M-16.1 -14.1L-8.3 -9.6L-8.3 -13.8L-16.1 -18.3Z\"/><path class=\"l\" d=\"M-5.7 6.3L5.7 12.9L5.7 5.1L-5.7 -1.5Z\"/><path class=\"s\" d=\"M23.4 2.7L5.7 12.9L5.7 5.1L23.4 -5.1Z\"/><path class=\"l\" d=\"M12 -11.7L23.4 -5.1L5.7 5.1L-5.7 -1.5Z\"/><path class=\"s\" d=\"M5.7 12.9L17.1 19.5L17.1 11.7L5.7 5.1Z\"/><path class=\"s\" d=\"M34.8 9.3L17.1 19.5L17.1 11.7L34.8 1.5Z\"/><path class=\"l\" d=\"M23.4 -5.1L34.8 1.5L17.1 11.7L5.7 5.1Z\"/><path class=\"l\" d=\"M5.7 5.1L17.1 11.7L17.1 3.9L5.7 -2.7Z\"/><path class=\"s\" d=\"M34.8 1.5L17.1 11.7L17.1 3.9L34.8 -6.3Z\"/><path class=\"l\" d=\"M23.4 -12.9L34.8 -6.3L17.1 3.9L5.7 -2.7Z\"/><path class=\"s\" d=\"M17.1 19.5L28.6 26.1L28.6 18.3L17.1 11.7Z\"/><path class=\"s\" d=\"M46.2 15.9L28.6 26.1L28.6 18.3L46.2 8.1Z\"/><path class=\"l\" d=\"M34.8 1.5L46.2 8.1L28.6 18.3L17.1 11.7Z\"/><path class=\"l\" d=\"M17.1 11.7L28.6 18.3L28.6 10.5L17.1 3.9Z\"/><path class=\"s\" d=\"M46.2 8.1L28.6 18.3L28.6 10.5L46.2 0.3Z\"/><path class=\"l\" d=\"M34.8 -6.3L46.2 0.3L28.6 10.5L17.1 3.9Z\"/><path class=\"s\" d=\"M28.6 26.1L40 32.7L40 24.9L28.6 18.3Z\"/><path class=\"s\" d=\"M57.7 22.5L40 32.7L40 24.9L57.7 14.7Z\"/><path class=\"l\" d=\"M46.2 8.1L57.7 14.7L40 24.9L28.6 18.3Z\"/></g>"}, "gota": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.350) translate(-21.8 11.3)\"><ellipse class=\"s\" cx=\"21.8\" cy=\"21\" rx=\"29.4\" ry=\"6.8\"/><path class=\"s\" d=\"M34.4 12.1L35.2 11.6L25.9 17L25.1 17.5Z\"/><path class=\"s\" d=\"M35.2 11.6L36 11L26.6 16.4L25.9 17Z\"/><path class=\"s\" d=\"M36 11L36.6 10.3L27.3 15.7L26.6 16.4Z\"/><path class=\"s\" d=\"M36.6 10.3L37.3 9.5L27.9 14.9L27.3 15.7Z\"/><path class=\"s\" d=\"M37.3 9.5L37.8 8.6L28.5 14L27.9 14.9Z\"/><path class=\"s\" d=\"M37.8 8.6L38.3 7.7L28.9 13.1L28.5 14Z\"/><path class=\"s\" d=\"M38.3 7.7L38.7 6.7L29.3 12.1L28.9 13.1Z\"/><path class=\"s\" d=\"M38.7 6.7L39 5.6L29.6 11L29.3 12.1Z\"/><path class=\"s\" d=\"M39 5.6L39.2 4.4L29.9 9.8L29.6 11Z\"/><path class=\"s\" d=\"M39.2 4.4L39.4 3.2L30 8.6L29.9 9.8Z\"/><path class=\"s\" d=\"M39.4 3.2L39.5 1.9L30.1 7.3L30 8.6Z\"/><path class=\"s\" d=\"M39.5 1.9L39.5 0.5L30.1 5.9L30.1 7.3Z\"/><path class=\"s\" d=\"M39.5 0.5L39.4 -0.9L30 4.5L30.1 5.9Z\"/><path class=\"s\" d=\"M39.4 -0.9L39.2 -2.3L29.9 3.1L30 4.5Z\"/><path class=\"s\" d=\"M39.2 -2.3L39 -3.7L29.6 1.7L29.9 3.1Z\"/><path class=\"s\" d=\"M39 -3.7L38.7 -5.2L29.3 0.2L29.6 1.7Z\"/><path class=\"s\" d=\"M38.7 -5.2L38.3 -6.7L28.9 -1.3L29.3 0.2Z\"/><path class=\"s\" d=\"M38.3 -6.7L37.8 -8.2L28.5 -2.8L28.9 -1.3Z\"/><path class=\"s\" d=\"M37.8 -8.2L37.3 -9.7L27.9 -4.3L28.5 -2.8Z\"/><path class=\"s\" d=\"M37.3 -9.7L22.9 -50.4L13.5 -45L27.9 -4.3Z\"/><path class=\"l\" d=\"M-0.9 -20.9L-1.4 -20L-1.9 -19.1L-2.3 -18.1L-2.6 -17L-2.9 -15.8L-3 -14.6L-3.1 -13.3L-3.1 -11.9L-3 -10.5L-2.9 -9.1L-2.6 -7.7L-2.3 -6.2L-1.9 -4.7L-1.4 -3.2L-0.9 -1.7L-0.3 -0.2L0.4 1.3L1.2 2.7L2 4.1L2.8 5.5L3.7 6.9L4.7 8.2L5.7 9.4L6.7 10.6L7.8 11.8L8.9 12.8L10.1 13.8L11.2 14.7L12.4 15.5L13.5 16.2L14.7 16.8L15.8 17.3L17 17.8L18.1 18.1L19.2 18.3L20.3 18.4L21.3 18.5L22.3 18.4L23.3 18.2L24.2 17.9L25.1 17.5L25.9 17L26.6 16.4L27.3 15.7L27.9 14.9L28.5 14L28.9 13.1L29.3 12.1L29.6 11L29.9 9.8L30 8.6L30.1 7.3L30.1 5.9L30 4.5L29.9 3.1L29.6 1.7L29.3 0.2L28.9 -1.3L28.5 -2.8L27.9 -4.3L13.5 -45Z\"/><path class=\"k\" d=\"M2.6 -9.3L4.2 -1.8L8.3 5.4\"/></g>"}, "mamadera": {"t": "hondo", "d": "<g transform=\"translate(60 60) scale(1.350) translate(-9.2 -6.5)\"><ellipse class=\"s\" cx=\"12.5\" cy=\"30\" rx=\"22\" ry=\"5.5\"/><path class=\"l\" d=\"M-14.3 30A14.3 8.3 0 0 0 14.3 30L14.3 -3.6A14.3 8.3 0 0 1 -14.3 -3.6Z\"/><path class=\"k\" d=\"M4.9 30.6A14.3 8.3 0 0 1 -7.2 30\"/><path class=\"k\" d=\"M4.9 24.6A14.3 8.3 0 0 1 -7.2 24\"/><path class=\"k\" d=\"M4.9 18.6A14.3 8.3 0 0 1 -7.2 18\"/><path class=\"k\" d=\"M4.9 12.6A14.3 8.3 0 0 1 -7.2 12\"/><path class=\"s\" d=\"M-16.2 -3.6A16.2 9.3 0 0 0 16.2 -3.6L16.2 -10.2A16.2 9.3 0 0 1 -16.2 -10.2Z\"/><ellipse class=\"l\" cx=\"0\" cy=\"-10.2\" rx=\"16.2\" ry=\"9.3\"/><path class=\"l\" d=\"M-9.6 -10.2L-8.1 -15.1L0 -23.7L3.4 -22.4L9 -12.9L9.2 -8.8L4.8 -5.4L-4.8 -5.4L-9.2 -8.8L-9.5 -9.5Z\"/><path class=\"s\" d=\"M0 -23.7L0 -23.7L3.4 -22.4L9 -12.9L9.2 -8.8L4.8 -5.4L0 -5.4Z\"/><path class=\"l\" d=\"M-3.7 -21.6A3.7 3.7 0 0 1 3.7 -21.6A3.7 2.1 0 0 1 -3.7 -21.6Z\"/><path class=\"s\" d=\"M0 -25.3A3.7 3.7 0 0 1 3.7 -21.6A3.7 2.1 0 0 1 0 -19.5Z\"/></g>"}, "monedas": {"t": "oro", "d": "<g transform=\"translate(60 60) scale(1.308) translate(-6.2 -16.7)\"><path class=\"s\" d=\"M-23.5 19.2A23.5 13.6 0 0 0 23.5 19.2L23.5 14.9A23.5 13.6 0 0 1 -23.5 14.9Z\"/><path class=\"s\" d=\"M-23.5 14.9A23.5 13.6 0 0 0 23.5 14.9L23.5 10.6A23.5 13.6 0 0 1 -23.5 10.6Z\"/><path class=\"s\" d=\"M-23.5 10.6A23.5 13.6 0 0 0 23.5 10.6L23.5 6.2A23.5 13.6 0 0 1 -23.5 6.2Z\"/><path class=\"s\" d=\"M-23.5 6.2A23.5 13.6 0 0 0 23.5 6.2L23.5 1.9A23.5 13.6 0 0 1 -23.5 1.9Z\"/><path class=\"s\" d=\"M-23.5 1.9A23.5 13.6 0 0 0 23.5 1.9L23.5 -2.4A23.5 13.6 0 0 1 -23.5 -2.4Z\"/><path class=\"s\" d=\"M-23.5 -2.4A23.5 13.6 0 0 0 23.5 -2.4L23.5 -6.7A23.5 13.6 0 0 1 -23.5 -6.7Z\"/><path class=\"s\" d=\"M-23.5 -6.7A23.5 13.6 0 0 0 23.5 -6.7L23.5 -11A23.5 13.6 0 0 1 -23.5 -11Z\"/><ellipse class=\"s\" cx=\"0\" cy=\"-11\" rx=\"23.5\" ry=\"13.6\"/><path class=\"wl\" d=\"M23.5 14.9A23.5 13.6 0 0 1 -23.5 14.9\"/><path class=\"wl\" d=\"M23.5 10.6A23.5 13.6 0 0 1 -23.5 10.6\"/><path class=\"wl\" d=\"M23.5 6.2A23.5 13.6 0 0 1 -23.5 6.2\"/><path class=\"wl\" d=\"M23.5 1.9A23.5 13.6 0 0 1 -23.5 1.9\"/><path class=\"wl\" d=\"M23.5 -2.4A23.5 13.6 0 0 1 -23.5 -2.4\"/><path class=\"wl\" d=\"M23.5 -6.7A23.5 13.6 0 0 1 -23.5 -6.7\"/><ellipse class=\"wl\" cx=\"0\" cy=\"-11\" rx=\"14.6\" ry=\"8.4\"/><path class=\"s\" d=\"M-11 44.4A23.5 13.6 0 0 0 36 44.4L36 40.1A23.5 13.6 0 0 1 -11 40.1Z\"/><path class=\"s\" d=\"M-11 40.1A23.5 13.6 0 0 0 36 40.1L36 35.8A23.5 13.6 0 0 1 -11 35.8Z\"/><path class=\"s\" d=\"M-11 35.8A23.5 13.6 0 0 0 36 35.8L36 31.4A23.5 13.6 0 0 1 -11 31.4Z\"/><path class=\"s\" d=\"M-11 31.4A23.5 13.6 0 0 0 36 31.4L36 27.1A23.5 13.6 0 0 1 -11 27.1Z\"/><ellipse class=\"s\" cx=\"12.5\" cy=\"27.1\" rx=\"23.5\" ry=\"13.6\"/><path class=\"wl\" d=\"M36 40.1A23.5 13.6 0 0 1 -11 40.1\"/><path class=\"wl\" d=\"M36 35.8A23.5 13.6 0 0 1 -11 35.8\"/><path class=\"wl\" d=\"M36 31.4A23.5 13.6 0 0 1 -11 31.4\"/><ellipse class=\"wl\" cx=\"12.5\" cy=\"27.1\" rx=\"14.6\" ry=\"8.4\"/></g>"}, "reloj": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.350) translate(-0 -4.8)\"><path class=\"s\" d=\"M-22.8 30A22.8 13.2 0 0 0 22.8 30L22.8 25.8A22.8 13.2 0 0 1 -22.8 25.8Z\"/><ellipse class=\"l\" cx=\"0\" cy=\"25.8\" rx=\"22.8\" ry=\"13.2\"/><path class=\"l\" d=\"M-18 25.8L-16.6 21.8L0.3 4.7L17.4 23.1L17.9 27.2L15.6 31L9 34.8L0 36.2L-9 34.8L-15.6 31L-17.9 27.2Z\"/><path class=\"s\" d=\"M-15.1 25.8L-13.9 22.5L-9.2 18.9L0.2 16L12 20.5L14.9 24.7L14.6 28.1L10.7 31.9L2 34.4L-7.5 33.3L-13 30.1L-14.9 26.9Z\"/><path class=\"l\" d=\"M-18 -16.2L-16.6 -20.2L-11 -24.4L-2.4 -26.5L6.9 -25.8L14.3 -22.5L17.4 -18.9L17.9 -14.8L15.6 -11L-0.3 4.9L-17.4 -13.5L-17.9 -14.8Z\"/><path class=\"s\" d=\"M-5.1 -1.2L2 -3.9L5 -0.4L-0.3 4.9L-5.1 -0.8Z\"/><path class=\"k\" d=\"M0 4.8L0 16.2\"/><path class=\"s\" d=\"M-22.8 -16.2A22.8 13.2 0 0 0 22.8 -16.2L22.8 -20.4A22.8 13.2 0 0 1 -22.8 -20.4Z\"/><ellipse class=\"l\" cx=\"0\" cy=\"-20.4\" rx=\"22.8\" ry=\"13.2\"/><path class=\"s\" d=\"M-22.4 25.8A2.2 1.3 0 0 0 -18 25.8L-18 -16.2A2.2 1.3 0 0 1 -22.4 -16.2Z\"/><path class=\"s\" d=\"M18 25.8A2.2 1.3 0 0 0 22.4 25.8L22.4 -16.2A2.2 1.3 0 0 1 18 -16.2Z\"/></g>"}, "laptop": {"t": "hondo", "d": "<g transform=\"translate(60 60) scale(1.196) translate(-8.6 -2.8)\"><path class=\"l\" d=\"M0 -3.6L48.8 24.6L48.8 -12.6L0 -40.8Z\"/><path class=\"s\" d=\"M51.4 23.1L48.8 24.6L48.8 -12.6L51.4 -14.1Z\"/><path class=\"l\" d=\"M2.6 -42.3L51.4 -14.1L48.8 -12.6L0 -40.8Z\"/><path class=\"s\" d=\"M3.6 -5.7L45.2 18.3L45.2 -11.1L3.6 -35.1Z\"/><path class=\"w\" d=\"M10.4 -5.4L15.1 -2.7L15.1 -11.1L10.4 -13.8Z\"/><path class=\"w\" d=\"M18.7 -0.6L23.4 2.1L23.4 -12.3L18.7 -15Z\"/><path class=\"w\" d=\"M27 4.2L31.7 6.9L31.7 -4.5L27 -7.2Z\"/><path class=\"w\" d=\"M35.3 9L40 11.7L40 -7.5L35.3 -10.2Z\"/><path class=\"l\" d=\"M-34.3 19.8L14.5 48L14.5 44.4L-34.3 16.2Z\"/><path class=\"s\" d=\"M48.8 28.2L14.5 48L14.5 44.4L48.8 24.6Z\"/><path class=\"l\" d=\"M0 -3.6L48.8 24.6L14.5 44.4L-34.3 16.2Z\"/><path class=\"s\" d=\"M0 2.4L38.5 24.6L23.9 33L-14.5 10.8Z\"/><path class=\"wl\" d=\"M9.6 7.9L-4.9 16.3\"/><path class=\"wl\" d=\"M19.2 13.5L4.7 21.9\"/><path class=\"wl\" d=\"M28.8 19L14.3 27.4\"/><path class=\"wl\" d=\"M-7.3 6.6L31.2 28.8\"/><path class=\"l\" d=\"M-4.7 20.7L6.8 27.3L-0.5 31.5L-12 24.9Z\"/></g>"}, "urna": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.099) translate(-7.5 -2.4)\"><ellipse class=\"s\" cx=\"22.9\" cy=\"28.8\" rx=\"33.8\" ry=\"9.3\"/><path class=\"l\" d=\"M-41.6 24L0 48L0 10.8L-41.6 -13.2Z\"/><path class=\"s\" d=\"M41.6 24L0 48L0 10.8L41.6 -13.2Z\"/><path class=\"l\" d=\"M0 -37.2L41.6 -13.2L0 10.8L-41.6 -13.2Z\"/><path class=\"s\" d=\"M-9.1 -21.2L13.8 -8L9.1 -5.3L-13.8 -18.5Z\"/><path class=\"l\" d=\"M-8.3 -18L8.3 -8.4L8.3 -33.6L-8.3 -43.2Z\"/><path class=\"k\" d=\"M-4.7 -30.3L-1 -23.4L5.2 -30.6\"/><path class=\"s\" d=\"M-33.3 14.4L-8.3 28.8L-8.3 21.6L-33.3 7.2Z\"/></g>"}};
const icono = (n, cls = "") => ICONOS[n] ? `<svg class="iso tono-${ICONOS[n].t} ${cls}" viewBox="0 0 120 120" aria-hidden="true" focusable="false">${ICONOS[n].d}</svg>` : "";
// Sol de Mayo chico para los botones de entrada: 16 rayos alternados y el disco, gira al pasar el mouse
const SOL_BOTON = (() => {
  const p = (a, r) => `${(Math.sin(a) * r).toFixed(1)} ${(-Math.cos(a) * r).toFixed(1)}`;
  let rayos = "";
  for (let i = 0; i < 16; i++) {
    const a = i * Math.PI / 8, w = .12, L = i % 2 ? 36 : 47;
    rayos += `M${p(a - w, 19)}L${p(a, L)}L${p(a + w, 19)}Z`;
  }
  return `<svg class="sol-ir" viewBox="-50 -50 100 100" aria-hidden="true" focusable="false"><path d="${rayos}"/><circle r="21"/></svg>`;
})();
document.querySelectorAll("[data-icono]").forEach(el => { el.innerHTML = icono(el.dataset.icono); });

/* ---------- Sol de Mayo ---------- */
(function sol() {
  const NS = "http://www.w3.org/2000/svg", cont = document.getElementById("sol-rayos");
  const pt = ([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`;
  const recto = "M-4.4,-27 L0,-95 L4.4,-27 Z";
  // rayo flamígero: una onda que se afina hacia la punta
  const izq = [], der = [];
  for (let k = 0; k <= 30; k++) {
    const t = k / 30, yy = -(27 + t * 60), c = 5.4 * Math.sin(t * Math.PI * 2.4) * (.3 + .7 * t);
    const hw = 4.3 * Math.pow(1 - t, .9) + .2;
    izq.push([c - hw, yy]); der.push([c + hw, yy]);
  }
  const flama = "M" + izq.map(pt).join("L") + "L" + der.reverse().map(pt).join("L") + "Z";
  for (let i = 0; i < 32; i++) {
    const g = document.createElementNS(NS, "g"); g.setAttribute("transform", `rotate(${i * 11.25})`);
    const n = document.createElementNS(NS, "g"); n.setAttribute("class", "nace"); n.style.setProperty("--i", i);
    const p = document.createElementNS(NS, "path");
    p.setAttribute("class", i % 2 ? "rayo flama" : "rayo"); p.setAttribute("d", i % 2 ? flama : recto);
    if (i % 2) p.style.setProperty("--i", i);
    n.appendChild(p); g.appendChild(n); cont.appendChild(g);
  }
  // ráfaga de líneas finas, como en un grabado: largos irregulares pero fijos
  const rafaga = document.getElementById("sol-rafaga");
  for (let i = 0; i < 144; i++) {
    const a = i * 2.5 * Math.PI / 180, largo = 104 + 22 * Math.abs(Math.sin(i * 12.9898) * 1.7 % 1);
    const l = document.createElementNS(NS, "line");
    l.setAttribute("x1", (Math.cos(a) * 36).toFixed(2)); l.setAttribute("y1", (Math.sin(a) * 36).toFixed(2));
    l.setAttribute("x2", (Math.cos(a) * largo).toFixed(2)); l.setAttribute("y2", (Math.sin(a) * largo).toFixed(2));
    rafaga.appendChild(l);
  }
  const svg = document.getElementById("sol");
  new IntersectionObserver(es => es.forEach(en => svg.classList.toggle("quieto", !en.isIntersecting))).observe(svg);
})();

/* ---------- textos ---------- */
const nv = R.nuevos;
const au = R.autos, cu = R.curiosidades, pe = R.pesca, vpq = R.visitas_parque;
const lista = xs => xs.length > 1 ? xs.slice(0, -1).join(", ") + " y " + xs[xs.length - 1] : xs.join("");
const grados = v => (v > 0 ? "+" : "") + n2(v) + " °C";
const e = R.energia, nac = R.nacimientos, s = R.suicidio, em = R.empleo, mo = R.mortalidad, su = R.sube,
  pz = R.pisa, es = R.escolarizacion, ap = R.aprender, nt = R.naturaleza, tu = R.turismo;
const movio = v => `${v < 0 ? "bajaron" : "subieron"} ${n1(Math.abs(v))}%`;
const cambio = v => v === 0 ? "no cambió" : `${v < 0 ? "bajó" : "subió"} ${Math.abs(v)} ${Math.abs(v) === 1 ? "punto" : "puntos"}`;
const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const signo = v => v < 0 ? `cayó ${n1(Math.abs(v))}%` : `creció ${n1(v)}%`;
const enLoQueVa = (o, ultimo, que, sube, baja) => o && o.anio > ultimo
  ? ` Entre enero y ${MESES[o.mes - 1]} de ${o.anio}, ${que} ${o.var >= 0 ? sube : baja} ${pct(Math.abs(o.var))} respecto de los mismos meses de ${o.anio - 1}.` : "";
const EV = R.envejecimiento;
const PI = R.piramide, JU = R.jubilaciones;
const EM = R.empresas;
const RO = R.rotacion, trim = t => `${["primer", "segundo", "tercer", "cuarto"][t[1] - 1]} trimestre de ${t[0]}`;
const TX = {
  "adonse-titulo": `Madres menores de 20 años y nivel socioeconómico por provincia`,
  "adonse-nota": `Cada punto es una provincia. En el eje vertical, el porcentaje de los nacimientos de ${R.ado_nse.anio} cuya madre tenía menos de 20 años (RENAPER). En el horizontal, el indicador elegido del Censo 2022. La línea punteada es solo una guía de la tendencia. ` +
    `La correlación es la de rangos de Spearman, que va de menos 1 a 1: cerca de 0 no hay relación, cerca de 1 o de menos 1 la relación es fuerte. Con 24 provincias, valores menores a 0,4 pueden deberse al azar. Una correlación no prueba que una cosa cause la otra: muestra que van juntas.`,
  "causas-titulo": `De qué mueren los bebés antes del primer año, por provincia, ${R.mi_causas.anios[0]} a ${R.mi_causas.anios[1]}`,
  "causas-nota": `Porcentaje de las muertes de menores de un año de cada provincia según el grupo de causa (capítulos de la CIE-10), sumando ${R.mi_causas.anios[0]} a ${R.mi_causas.anios[1]} porque en las provincias chicas hay pocas muertes por año. Las provincias están ordenadas por su tasa de mortalidad infantil del período, de mayor a menor. ` +
    `Según la DEIS, en ${R.mi_causas.reducibles.anio} el ${pct(R.mi_causas.reducibles.neonatal)} de las muertes de menores de 28 días y el ${pct(R.mi_causas.reducibles.posneonatal)} de las de 28 días a 11 meses del país eran reducibles con prevención, diagnóstico o tratamiento oportunos. Ese dato no se publica por provincia y no se puede calcular con los datos abiertos, que solo traen la causa con tres caracteres. ` +
    `Las correlaciones comparan la tasa de cada grupo de causas con el porcentaje de población sin obra social ni prepaga del Censo 2022.`,
  "envejecimiento-titulo": `Personas de 65 años o más por cada 100 en edad de trabajar, ${EV.anio} y 2040`,
  envejecimiento: `En ${EV.anio} hay ${n1(EV.hoy)} personas de 65 años o más por cada 100 de entre 15 y 64 años: unas ${n1(EV.trab_hoy)} personas en edad de trabajar por cada persona mayor. ` +
    `Según las proyecciones del INDEC, en 2040 serán ${n1(EV.fin)}, unas ${n1(EV.trab_fin)} por cada una. La relación más alta es la de ${EV.max} (${n1(EV.max_v)}) y la más baja, la de ${EV.min} (${n1(EV.min_v)}).`,
  "empresas-titulo": `Empresas privadas con empleados cada 1.000 habitantes, ${EM.anio}`,
  empresas: `En ${EM.anio} había ${n0(EM.total_pais)} empresas privadas con al menos una persona en relación de dependencia, unas ${n1(EM.pais_1000)} cada 1.000 habitantes. ${EM.top} tenía ${n1(EM.top_v)} cada 1.000 y ${EM.low}, ${n1(EM.low_v)}.`,
  "empresas-nota": `Empresas que declaran personal ante la seguridad social. No incluye a quienes trabajan solos como monotributistas o autónomos sin empleados, ni al personal de casas particulares. Una empresa con personal en varias provincias se cuenta en cada una, por eso las provincias suman más que el total del país. La población es la proyección 2025 del INDEC.`,
  "dinamica-titulo": `Apertura y cierre de empresas privadas, ${EM.ini} a ${EM.ult}`,
  dinamica: `En ${EM.ult} abrieron ${n0(EM.ap)} empresas con empleados y cerraron ${n0(EM.ci)}: una tasa de entrada de ${pct(EM.te)} y una de salida de ${pct(EM.ts)} sobre el total de empresas. ` +
    `El cambio neto fue ${EM.neta >= 0 ? "positivo" : "negativo"}, de ${pct(Math.abs(EM.neta))}, y solo ${EM.positivas === 1 ? "una provincia tuvo" : EM.positivas + " provincias tuvieron"} más aperturas que cierres. ` +
    `La tasa de entrada más alta de la serie fue ${pct(EM.te_max)}, en ${EM.te_max_anio}. Desde ${EM.ini}, el cambio neto fue negativo en ${EM.anios_negativos} años.`,
  "dinamica-nota": `Se cuentan las empresas locales: cada empresa es local en la provincia donde declara la mayor parte de su personal, así que las provincias suman el total del país. Una empresa abre cuando declara empleados por primera vez y cierra cuando pasa un año (cuatro trimestres) sin declarar personal. ` +
    `Las tasas dividen aperturas y cierres por todas las empresas activas en el año. La vista por provincia muestra el cambio neto de ${EM.ult}. El OEDE separa la provincia de Buenos Aires en partidos del Gran Buenos Aires y resto, que acá se suman.`,
  "rotacion-titulo": `Asalariados con un año o menos en su empleo actual, ${RO.desde[0] === RO.hasta[0] ? RO.hasta[0] : RO.desde[0] + " y " + RO.hasta[0]}`,
  rotacion: `Entre el ${trim(RO.desde)} y el ${trim(RO.hasta)}, el ${pct(RO.total)} de las personas asalariadas de los 31 aglomerados urbanos llevaba un año o menos en su empleo y el ${pct(RO.total_largo)} más de cinco años. ` +
    `La rotación se concentra en quienes tienen menos de 25 años (${pct(RO.jovenes)}), en los empleos sin descuento jubilatorio (${pct(RO.sin_desc)}, contra ${pct(RO.con_desc)} en los registrados) y en los hogares del quintil de menores ingresos (${pct(RO.q1)}, contra ${pct(RO.q5)} en el de mayores ingresos).`,
  "rotacion-nota": `Procesamiento propio de las bases usuarias de la Encuesta Permanente de Hogares del INDEC, con ${n0(RO.casos)} respuestas de los cuatro últimos trimestres publicados. Se usa la pregunta sobre cuánto tiempo hace que la persona trabaja en ese empleo en forma continua, que se hace a los asalariados salvo el servicio doméstico. ` +
    `La antigüedad corta no siempre significa rotación: también incluye a quienes consiguieron su primer empleo o volvieron a trabajar. La generación se calcula con la edad declarada. Los quintiles ordenan a las personas por el ingreso per cápita de su hogar y usan el ponderador de ingresos del INDEC. La encuesta cubre solo aglomerados urbanos y no permite resultados confiables por provincia con este detalle.`,
  "piramide-titulo": `Población por edad y sexo, ${PI.anio} y 2040`,
  piramide: `En ${PI.anio} la mitad de la población del país tiene menos de ${PI.edad_mediana_hoy} años, aproximadamente. Según las proyecciones del INDEC, en 2040 esa edad mediana llegará a unos ${PI.edad_mediana_2040} años y los menores de 15 pasarán de ser el ${pct(PI.menores15_hoy)} al ${pct(PI.menores15_2040)} de la población. La base de la pirámide se angosta porque nacen menos chicos y la parte de arriba se ensancha porque se vive más.`,
  "piramide-nota": `Cada barra es el porcentaje de la población total de la jurisdicción que tiene esa edad y ese sexo, en grupos de cinco años (el último reúne a las personas de 90 años o más). Las barras llenas son ${PI.anio} y el contorno, 2040. Al elegir una provincia, la pirámide pasa a mostrarla. La edad mediana se estima dentro de los grupos de cinco años.`,
  "jubilaciones-titulo": `Aportantes por cada beneficio previsional de ANSES, ${JU.ini} a ${JU.anio}`,
  jubilaciones: `En ${JU.mes ? MESES[JU.mes - 1] + " de " : ""}${JU.anio} había ${n2(JU.ratio)} aportantes por cada jubilación o pensión de los regímenes que administra ANSES: ${n0(JU.aportantes)} personas aportando y ${n0(JU.beneficios)} beneficios. El valor más alto de la serie fue ${n2(JU.max)} en ${JU.max_anio} y el más bajo, ${n2(JU.min)} en ${JU.min_anio}. ` +
    `La demografía empuja en la misma dirección: según las proyecciones del INDEC, las personas de 15 a 64 años por cada persona de 65 o más pasan de ${n1(EV.trab_hoy)} en ${EV.anio} a ${n1(EV.trab_fin)} en 2040.`,
  "jubilaciones-nota": `Promedio anual de aportantes y de beneficios. El último año es el último mes disponible. Los aportantes incluyen asalariados, autónomos, monotributistas y trabajadoras de casas particulares, también jubilados que siguen aportando. Desde abril de 2019 se cuentan solo los beneficios no suspendidos y hasta 2008 la serie incluye el sistema de capitalización. ` +
    `La cantidad de aportantes depende del empleo registrado, no solo de la edad de la población. No se compara entre provincias porque varias mantienen su propia caja previsional para empleados públicos, fuera de ANSES.`,
  "envejecimiento-nota": `Relación de dependencia de la vejez: personas de 65 años o más sobre personas de 15 a 64, por 100. No todas las personas de 15 a 64 trabajan ni todas las mayores están jubiladas, pero es la medida habitual para anticipar la presión sobre el sistema previsional y la demanda de cuidados. ` +
    `Las personas mayores pasan de ser el ${pct(EV.pct_mayores_hoy)} de la población en ${EV.anio} al ${pct(EV.pct_mayores_fin)} en 2040. El círculo claro marca ${EV.anio} y el oscuro 2040.`,
  hogares: `En 2025 los hogares explicaron el ${pct(e.pct_res_2025)} de la electricidad demandada en el país, frente al ${pct(e.pct_res_2005)} de 2005. Entre ambos años la demanda residencial creció ${pct(e.crec_res)} y la del resto de los usuarios creció ${pct(e.crec_resto)}.`,
  actividad: `Entre 2005 y 2025 la demanda eléctrica total creció ${pct(e.crec_total)} y la actividad económica medida por el EMAE creció ${pct(e.crec_emae)}. En 2025 el país demandó ${n0(e.gwh_2025)} gigavatios hora (GWh).` +
    enLoQueVa(R.ytd.demanda, 2025, "la demanda total", "subió", "bajó"),
  meses: `En promedio entre 2023 y 2025, ${e.mes_max} fue el mes de mayor demanda eléctrica y ${e.mes_min} el de menor. La diferencia entre ambos fue de ${pct(e.dif_max_min)}. El año tiene dos picos, uno por refrigeración en verano y otro por calefacción en invierno.`,
  "meses-nota": `Promedio mensual de la demanda total en GWh para 2023, 2024 y 2025. El último mes disponible en la fuente es ${e.ultimo_mes}.`,
  nacimientos: `En 2024 se registraron ${n0(nac.n_2024)} nacimientos, ${pct(Math.abs(nac.caida))} menos que los ${n0(nac.pico)} de ${nac.anio_pico}. En el conjunto de los 38 países de la OCDE, la baja entre ${nac.anio_pico} y ${nac.ocde_ult} fue de ${pct(Math.abs(nac.ocde_caida))}.`,
  adolescentes: `En 2012, ${n1(nac.pct_2012)} de cada 100 nacimientos del país correspondían a madres de entre 10 y 19 años. En 2024 fueron ${n1(nac.pct_2024)} de cada 100. En cantidad pasaron de ${n0(nac.ado_pico)} en ${nac.ado_anio_pico} a ${n0(nac.ado_2024)} en 2024, una caída de ${pct(Math.abs(nac.ado_caida))}.`,
  suicidio: `En ${s.anio} el SNIC registró ${n0(s.casos)} suicidios, una tasa de ${n1(s.tasa)} por cada 100.000 habitantes. En ${s.anio-1} la tasa había sido ${n1(s.tasa_prev)}. La tasa de los varones (${n1(s.tasa_v)}) más que triplica la de las mujeres (${n1(s.tasa_m)}).`,
  "suicidio-prov-titulo": `Tasa de suicidios por provincia, ${s.anio}`,
  "suicidio-prov": `${s.top} registró la tasa más alta, con ${n1(s.top_tasa)} suicidios por cada 100.000 habitantes, y ${s.low} la más baja, con ${n1(s.low_tasa)}. La tasa nacional fue ${n1(s.tasa)}.`,
  edad: `Sobre ${n0(s.n_sat)} casos registrados entre 2017 y 2024 con edad y sexo conocidos, el ${pct(s.pct_varones)} fueron varones y el ${pct(s.pct_jovenes)} tenía entre 15 y 29 años.`,
  muertes: `En ${s.anio} se registraron ${n0(s.casos)} suicidios, ${n0(s.homicidios)} homicidios dolosos y ${n0(s.viales)} muertes en siniestros viales. Por cada homicidio hubo ${n1(s.razon_hom)} suicidios. Desde ${s.anio_cruce} los suicidios superan cada año a las muertes viales. En ${R.femicidios.anio} la Justicia registró ${n0(R.femicidios.n)} víctimas directas de femicidio.`,
  "muertes-nota": `Cantidad de víctimas por año. Homicidios dolosos y muertes en siniestros viales según el mismo registro del SNIC. Femicidios: víctimas directas según el Registro Nacional de Femicidios de la Justicia Argentina. La figura se incorporó al Código Penal en diciembre de 2012 (Ley 26.791) y los datos abiertos del registro empiezan en ${R.femicidios.ini}. Incluye travesticidios y transfemicidios.`,
  "empleo-titulo": `Asalariados privados registrados por provincia, ${em.mes}`,
  empleo: `En ${em.mes} había ${n1(em.total_millones)} millones de personas asalariadas registradas en el sector privado, ${n1(em.cada_100_pais)} por cada 100 habitantes. En los doce meses previos el total nacional ${signo(em.var_nac)} y ${em.suben} de las 24 jurisdicciones registraron aumentos.`,
  "mortalidad-titulo": `Tasa de mortalidad infantil por provincia, ${mo.tri_base} y ${mo.tri_act}`,
  mortalidad: `En ${mo.anio} murieron en el país ${n1(mo.tasa)} de cada 1.000 nacidos vivos antes de cumplir un año. En ${mo.anio-1} la tasa había sido ${n1(mo.tasa_prev)} y en ${mo.anio_inicio}, ${n1(mo.tasa_inicio)}. En el promedio de ${mo.tri_act} la tasa más alta fue la de ${mo.top} (${n1(mo.top_v)}) y la más baja la de ${mo.low} (${n1(mo.low_v)}). La tasa bajó en ${mo.bajan} de las 24 jurisdicciones respecto de ${mo.tri_base}.`,
  "mortalidad-nota": `Defunciones de menores de un año por cada 1.000 nacidos vivos, según la provincia de residencia de la madre. En las provincias con pocos nacimientos la tasa de un solo año varía mucho, por eso se compara el promedio de tres años. El círculo claro marca ${mo.tri_base} y el lleno ${mo.tri_act}. La tabla descargable incluye también el valor de ${mo.anio}. La línea punteada azul marca el promedio simple de los países de la OCDE en ${OC.mortalidad_infantil.anio}, según el Banco Mundial.`,
  "sube-titulo": `Tarjetas SUBE usadas por día hábil, 2020 a ${su.mes.slice(-4)}`,
  sube: `En ${su.mes}, en un día hábil típico se usaron ${n2(su.total_millones)} millones de tarjetas SUBE distintas en colectivos, trenes, subtes y lanchas${su.var_anual == null ? "" : `, ${n1(Math.abs(su.var_anual))}% ${su.var_anual < 0 ? "menos" : "más"} que en ${su.mes_prev}`}. En los primeros días hábiles de marzo de 2020, antes del aislamiento, eran ${n2(su.pre_millones)} millones.`,
  "sube-nota": `Cantidad de tarjetas distintas que registraron al menos un viaje en el día. Se toma la mediana de los días hábiles de cada mes, así los feriados o paros no bajan el valor del mes. En ${su.mes} se usaron por día ${n1(su.colectivo_millones)} millones de tarjetas en colectivo, ${n0(su.tren_miles)} mil en tren y ${n0(su.subte_miles)} mil en subte (una tarjeta que combina modos cuenta en cada uno). La SUBE funciona en el AMBA y en decenas de ciudades del interior. No incluye ciudades con sistemas de pago propios. Último día disponible en la fuente: ${su.ultimo_dia}.`,
  "pisa-titulo": `Resultados de la Argentina en las pruebas PISA, 2000 a ${pz.anio}`,
  pisa: `En PISA ${pz.anio}, los estudiantes de 15 años de la Argentina obtuvieron en promedio ${pz.mat} puntos en matemática, ${pz.lec} en lectura y ${pz.cie} en ciencias. El promedio de los países de la OCDE fue de ${pz.ocde_mat}, ${pz.ocde_lec} y ${pz.ocde_cie} puntos. En matemática la diferencia fue de ${pz.dif_mat} puntos. Frente a ${pz.anio_prev}, el puntaje de la Argentina ${cambio(pz.var_mat)} en matemática, ${cambio(pz.var_lec)} en lectura y ${cambio(pz.var_cie)} en ciencias.`,
  "pisa-nota": `Puntaje promedio de los estudiantes de 15 años escolarizados que rindieron la prueba. La OCDE excluyó de las comparaciones el resultado nacional de 2015 por problemas de cobertura de la muestra. Por eso ese año no aparece en el gráfico, aunque figura en la tabla descargable. En 2000 esta fuente solo tiene el puntaje de lectura. El promedio OCDE es el promedio simple de los países miembros en cada ciclo.`,
  "escolarizacion-titulo": `Tasa neta de escolarización secundaria por provincia, ${es.ini} y ${es.fin}`,
  escolarizacion: `En ${es.fin}, el ${pct(es.pais_fin)} de los adolescentes en edad de cursar la secundaria estaba matriculado en ese nivel. En ${es.ini} era el ${pct(es.pais_ini)}. La tasa subió en ${es.suben} de las 24 jurisdicciones. En ${es.fin} fue más alta en ${es.top} (${pct(es.top_v)}) y más baja en ${es.low} (${pct(es.low_v)}).`,
  "escolarizacion-nota": `Alumnos de 12 a 17 años (13 a 17 en las provincias con secundaria de cinco años) matriculados en el nivel secundario, incluidas la educación especial y la de jóvenes y adultos, sobre la población de esa edad. Desde 2022 la población de referencia son las proyecciones del INDEC basadas en el Censo 2022, así que parte del cambio entre 2021 y 2022 responde al cambio de denominador. Algunos valores superan el 100% por diferencias entre la matrícula y la proyección de población. El círculo claro marca ${es.ini} y el lleno ${es.fin}.`,
  "aprender-titulo": `Estudiantes de 6° grado con nivel satisfactorio o avanzado en Aprender por provincia, ${ap.anio}`,
  aprender: `En Aprender ${ap.anio}, el ${pct(ap.mat)} de los estudiantes de 6° grado de primaria del país alcanzó un nivel satisfactorio o avanzado en matemática y el ${pct(ap.len)} en lengua. En matemática, el ${pct(ap.mat_debajo)} quedó por debajo del nivel básico. Por provincia, el porcentaje en matemática fue más alto en ${ap.top} (${pct(ap.top_v)}) y más bajo en ${ap.low} (${pct(ap.low_v)}).`,
  "aprender-nota": `Aprender es la evaluación nacional del Ministerio de Educación. En ${ap.anio} fue censal para 6° grado de primaria. Los porcentajes están calculados sobre la base agregada por departamento, sector y ámbito que publica el Ministerio, y cuentan solo a quienes tienen un nivel de desempeño asignado. Por eso pueden diferir levemente de los del informe oficial.`,
  "protegida-titulo": `Superficie protegida por provincia, ${nt.anio}`,
  protegida: `En ${nt.anio} había ${n0(nt.areas)} áreas protegidas nacionales, provinciales y con designación internacional, que cubrían ${n1(nt.ha_millones)} millones de hectáreas: el ${pct(nt.pct)} del territorio continental del país, unos ${n0(nt.m2_pais)} metros cuadrados por habitante. ${nt.top} tenía protegido el ${pct(nt.top_v)} de su superficie y ${nt.low} el ${pct(nt.low_v)}. Por habitante, la superficie protegida va de ${n0(nt.m2_top_v)} m² en ${nt.m2_top} a ${n1(nt.m2_low_v)} m² en ${nt.m2_low}.`,
  "protegida-nota": `Superficie terrestre dentro de áreas protegidas de jurisdicción nacional o provincial y de sitios con designación internacional, como reservas de biosfera y sitios Ramsar. La fuente suma la superficie de cada designación, así que una misma zona puede contarse más de una vez. No incluye las áreas marinas. Los metros cuadrados por habitante usan la población 2025 proyectada por el INDEC. La línea punteada azul marca el promedio simple de los países de la OCDE en ${OC.protegida.anio} según el Banco Mundial, que usa otra base (la Base Mundial de Áreas Protegidas) y no suma superposiciones.`,
  "parques-titulo": `Superficie de las áreas protegidas nacionales según año de creación, ${nt.anio_ini} a ${nt.anio_fin}`,
  parques: `Los primeros parques nacionales, ${nt.pn_primeras}, se crearon en ${nt.pn_primera_anio}. Hoy la Administración de Parques Nacionales tiene ${nt.pn_n} áreas protegidas, con ${n1(nt.pn_terr_millones)} millones de hectáreas terrestres y ${n1(nt.pn_mar_millones)} millones marinas. La más grande en tierra es ${nt.pn_mayor}, creada en ${nt.pn_mayor_anio}, con ${n0(nt.pn_mayor_ha)} hectáreas. La más reciente es ${nt.pn_ultima}, de ${nt.pn_ultima_anio}.`,
  "parques-nota": `Superficie acumulada según el año de creación de cada área, con su superficie actual. No refleja ampliaciones posteriores ni cambios de categoría.`,
  "especies-titulo": `Especies animales registradas en las áreas protegidas nacionales, las 15 con más registros`,
  especies: `${nt.esp_top} es el área protegida nacional con más especies animales registradas: ${n0(nt.esp_top_v)}. Le sigue ${nt.esp_2}, con ${n0(nt.esp_2_v)}.`,
  "especies-nota": `Especies animales, vertebradas e invertebradas, registradas en cada área protegida nacional terrestre según el Sistema de Información de Biodiversidad. El número también refleja cuánto se estudió cada lugar: las áreas más antiguas e investigadas acumulan más registros, por eso no mide por sí solo la riqueza de fauna.`,
  "visitas-titulo": `Visitas a parques nacionales, ${nt.vis_ini_anio} a ${nt.vis_anio}`,
  visitas: `En ${nt.vis_anio} los parques nacionales recibieron ${n0(nt.vis)} visitas. El ${pct(nt.vis_nr_pct)} correspondió a personas que no residen en el país. El máximo de la serie fue en ${nt.vis_max_anio}, con ${n0(nt.vis_max)}, y el mínimo en ${nt.vis_min_anio}, con ${n0(nt.vis_min)}. ${nt.ytd_frase} las visitas ${movio(nt.ytd_var)} respecto del mismo período del año anterior.`,
  "visitas-nota": `Visitas registradas en los parques nacionales con control de ingreso. Una persona que entra dos veces cuenta como dos visitas. Solo se muestran años completos. La fuente no publica datos abiertos por parque.`,
  "receptivo-titulo": `Turistas no residentes que llegaron a la Argentina, ${tu.anio_ini} a ${tu.anio}`,
  receptivo: `En ${tu.anio} llegaron ${n0(tu.turistas)} turistas que viven fuera del país. El máximo de la serie fue en ${tu.max_anio}, con ${n0(tu.max)}. En los doce meses a ${tu.doce_hasta} fueron ${n0(tu.doce)}, ${pct(Math.abs(tu.doce_var))} ${tu.doce_var < 0 ? "menos" : "más"} que en los doce meses anteriores.`,
  "receptivo-nota": `Viajes de turistas no residentes, es decir personas que viven en otro país y pasan al menos una noche en la Argentina, por todos los pasos aéreos, terrestres y fluviales. Solo se muestran años completos.${tu.provisorio ? " Los últimos meses son datos provisorios." : ""}`,
  "hoteles-titulo": `Viajeros hospedados en hoteles y parahoteles, ${tu.eoh_ini} a ${tu.eoh_anio}`,
  hoteles: `En ${tu.eoh_anio} se hospedaron ${n1(tu.eoh_total)} millones de viajeros en hoteles y parahoteles de las localidades relevadas. El ${pct(tu.eoh_nr_pct)} no residía en el país. ${tu.eoh_reg} fue la región con más viajeros, con el ${pct(tu.eoh_reg_pct)} del total. El máximo de la serie fue en ${tu.eoh_max_anio}, con ${n1(tu.eoh_max)} millones.`,
  "hoteles-nota": `Encuesta de Ocupación Hotelera, que releva hoteles y parahoteles de las principales localidades turísticas agrupadas en siete regiones. No publica datos por provincia. El último mes publicado es ${tu.eoh_ultimo}, por eso el último año completo es ${tu.eoh_anio}. El INDEC informó que, al no renovarse el convenio de financiamiento con la Secretaría de Turismo, la encuesta se reformulará y su difusión se reprogramará. El Instituto de Estadística de la Ciudad de Buenos Aires continúa el relevamiento solo en la Ciudad.`,
  "eti-titulo": `Turistas extranjeros que visitaron cada provincia y salieron por Ezeiza o Aeroparque, ${tu.eti_anio}`,
  eti: `En ${tu.eti_anio}, ${n0(tu.eti_top_v)} turistas no residentes que se fueron del país por Ezeiza o Aeroparque habían visitado ${tu.eti_top} y ${n0(tu.eti_2_v)} ${tu.eti_2}. En relación con su población, el valor más alto fue el de ${tu.eti_pc_top}, con ${n1(tu.eti_pc_top_v)} turistas cada 1.000 habitantes.`,
  "eti-nota": `Encuesta de Turismo Internacional. Solo cubre a los turistas que dejan el país por los aeropuertos de Ezeiza y Aeroparque, así que subestima a las provincias que reciben turistas por otros pasos, como las limítrofes. Un turista que visitó varias provincias cuenta en cada una. La cantidad por habitante usa la población 2025 proyectada por el INDEC. Desde 2026 el INDEC reformula esta encuesta y reprogramó su difusión porque no se renovó el convenio de financiamiento con la Secretaría de Turismo.`,
  "pobreza-titulo": `Pobreza e indigencia en los 31 aglomerados urbanos, ${R.pobreza.ini} a ${R.pobreza.fin}`,
  pobreza: `En el ${R.pobreza.sem}, el ${pct(R.pobreza.pob)} de las personas que viven en los 31 aglomerados urbanos relevados por la EPH estaba bajo la línea de pobreza y el ${pct(R.pobreza.ind)} bajo la línea de indigencia. Un año antes, en el ${R.pobreza.sem_prev}, eran ${pct(R.pobreza.pob_prev)} y ${pct(R.pobreza.ind_prev)}. El valor más alto de la serie fue ${pct(R.pobreza.max)}, en el ${R.pobreza.max_sem}.`,
  "pobreza-nota": `Porcentaje de personas en hogares cuyos ingresos no alcanzan la canasta básica total (pobreza) o la canasta básica alimentaria (indigencia). La EPH releva solo los 31 aglomerados urbanos, no el total del país ni las provincias. En la página de consultas están los aglomerados, los partidos del Gran Buenos Aires y las comunas de la Ciudad, con sus intervalos de confianza.`,
  "mapa-areas-nota": `Color: porcentaje de la superficie de cada provincia dentro de áreas protegidas de cualquier jurisdicción, ${nt.anio}. Círculos: áreas protegidas nacionales terrestres, con tamaño proporcional a su superficie. Pasá el cursor para ver los valores.`,
  "lista-areas-nota": `Las ${nt.pn_n} áreas protegidas de la Administración de Parques Nacionales, ordenadas por año de creación. Superficie actual en hectáreas según el Sistema de Información de Biodiversidad.`,
  "sube-modos-titulo": `Tarjetas SUBE usadas por día hábil en trenes y subtes, 2020 a ${su.mes.slice(-4)}`,
  "sube-modos": `En ${su.mes}, en un día hábil típico se usaron ${n0(su.tren_miles)} mil tarjetas en trenes y ${n0(su.subte_miles)} mil en subtes. En los primeros días hábiles de marzo de 2020 eran ${n0(su.tren_pre_miles)} mil y ${n0(su.subte_pre_miles)} mil: el tren ${su.tren_vs_pre < 0 ? "tiene" : "suma"} ${pct(Math.abs(su.tren_vs_pre))} ${su.tren_vs_pre < 0 ? "menos" : "más"} y el subte ${pct(Math.abs(su.subte_vs_pre))} ${su.subte_vs_pre < 0 ? "menos" : "más"}. En colectivo la diferencia es de ${su.colectivo_vs_pre > 0 ? "+" : ""}${pct(su.colectivo_vs_pre)}.`,
  "sube-modos-nota": `Mediana de las tarjetas distintas que viajaron cada día hábil en cada modo. El subte funciona solo en la Ciudad de Buenos Aires y los trenes con SUBE, sobre todo en el Área Metropolitana.`,
  "patentes-titulo": `Autos y motos nuevos inscriptos por año, ${au.ini} a ${au.anio}`,
  patentes: `En ${au.anio} se inscribieron ${n0(au.autos)} autos y ${n0(au.motos)} motos nuevos en los registros del país. El máximo de autos de la serie fue en ${au.max_anio}, con ${n0(au.max)}, y el mínimo en ${au.min_anio}, con ${n0(au.min)}. Entre ${au.ytd} se inscribieron ${pct(Math.abs(au.ytd_var))} ${au.ytd_var < 0 ? "menos" : "más"} autos que en el mismo período del año anterior.`,
  "patentes-nota": `Inscripciones iniciales de vehículos cero kilómetro. Automotores incluye autos, camionetas y vehículos de carga. Los datos de motos empiezan en ${au.motos_ini}.`,
  "patentes-prov-titulo": `Autos y motos nuevos por cada 1.000 habitantes, por provincia, ${au.anio}`,
  "patentes-prov": `En ${au.anio} se inscribieron ${n1(au.pais_1000)} autos y ${n1(au.motos_pais_1000)} motos nuevos cada 1.000 habitantes. En autos el valor más alto fue el de ${au.top} (${n1(au.top_v)}) y el más bajo el de ${au.low} (${n1(au.low_v)}). En motos el más alto fue el de ${au.moto_top} (${n1(au.moto_top_v)}).`,
  "patentes-prov-nota": `La provincia es la del registro donde se hizo la inscripción, que no siempre coincide con el lugar donde se usa el vehículo. Por eso algunas jurisdicciones muestran valores muy altos. La población es la proyección 2025 del INDEC.`,
  "nombres-titulo": `Nombres más elegidos para los bebés, ${cu.nom_anio}`,
  nombres: `En ${cu.nom_anio} los nombres más inscriptos en el país fueron ${cu.nena} (${n0(cu.nena_n)}) para las nenas y ${cu.varon} (${n0(cu.varon_n)}) para los varones. En ${cu.nom_ini} habían sido ${cu.nena0} y ${cu.varon0}. ${cu.varon_prov} fue el nombre de varón más elegido en ${cu.varon_prov_n} de las 24 jurisdicciones.`,
  "nombres-nota": `Cantidad de veces que cada nombre fue inscripto como nombre de pila en el Registro Nacional de las Personas. Los nombres se muestran como los registra el RENAPER, sin tildes. Al elegir una provincia, el gráfico muestra sus diez nombres más frecuentes.`,
  "carne-titulo": `Consumo de carne vacuna por habitante, ${cu.carne_ini} a ${cu.carne_anio}`,
  carne: `En ${cu.carne_anio} cada habitante consumió en promedio ${n1(cu.carne_v)} kilos de carne vacuna, contra ${n1(cu.carne_ini_v)} en ${cu.carne_ini}. En lo que va de ${cu.carne_ytd_hasta.slice(-4)}, hasta ${cu.carne_ytd_hasta}, el ritmo es de ${n1(cu.carne_ytd)} kilos por año${cu.carne_min_serie ? ", el más bajo de la serie" : ""}. En ${cu.asado_hasta}, un kilo de asado costaba lo mismo que ${n1(cu.asado)} kilos de pollo en el Gran Buenos Aires. En ${cu.asado_ini_anio} equivalía a ${n1(cu.asado_ini)}.`,
  "carne-nota": `Consumo aparente por habitante estimado a partir de la producción y el comercio exterior. Cada mes se expresa como tasa anual y el valor de cada año es el promedio de sus meses. Solo se muestran años completos.`,
  "vino-titulo": `Vino vendido en el mercado interno, ${cu.vino_ini} a ${cu.vino_anio}`,
  vino: `En ${cu.vino_anio} se vendieron en el país ${n0(cu.vino_v)} millones de litros de vino, ${pct(Math.abs(cu.vino_caida))} ${cu.vino_caida < 0 ? "menos" : "más"} que en ${cu.vino_ini}, cuando fueron ${n0(cu.vino_ini_v)} millones. El ${pct(cu.vino_mza)} salió de bodegas de Mendoza.` + enLoQueVa(R.ytd.vino, cu.vino_anio, "las ventas", "subieron", "bajaron"),
  "vino-nota": `Despachos de vino al mercado interno informados por el Instituto Nacional de Vitivinicultura. La provincia es la de origen del vino, no la del lugar donde se consume.`,
  "yerba-titulo": `Yerba mate que salió de los molinos, ${cu.yerba_ini} a ${cu.yerba_anio}`,
  yerba: `En ${cu.yerba_anio} los molinos despacharon ${n1(cu.yerba_v)} millones de kilos de yerba mate. El máximo de la serie fue en ${cu.yerba_max_anio}, con ${n1(cu.yerba_max)} millones.` + enLoQueVa(R.ytd.yerba, cu.yerba_anio, "los despachos", "subieron", "bajaron"),
  "yerba-nota": `Salida de molino informada por el Instituto Nacional de la Yerba Mate: yerba elaborada que despachan los molinos. Solo se muestran años completos.`,
  "glaciares-titulo": `Glaciares por provincia`,
  glaciares: `El Inventario Nacional de Glaciares registra ${n0(cu.gl_total)} glaciares en ${cu.gl_n} provincias. ${cu.gl_top} tiene ${n0(cu.gl_top_v)} y ${cu.gl_2}, ${n0(cu.gl_2_v)}.`,
  "glaciares-nota": `Cantidad de glaciares y cuerpos de hielo inventariados por el Instituto Argentino de Nivología, Glaciología y Ciencias Ambientales (IANIGLA). Las provincias que no aparecen no tienen glaciares inventariados.`,
  "clima-titulo": `Diferencia de la temperatura media anual del país con su valor de referencia, ${cu.cl_ini} a ${cu.cl_fin}`,
  clima: `${cu.cl_max_anio} fue el año más cálido desde ${cu.cl_ini}: la temperatura media del país estuvo ${n2(cu.cl_max)} °C por encima del valor de referencia. De los ${cu.cl_n_desde2000} años desde 2000, ${cu.cl_pos_desde2000} fueron más cálidos que la referencia. El año más frío de la serie fue ${cu.cl_min_anio} (${grados(cu.cl_min)}).`,
  "clima-nota": `Desvío de la temperatura media anual del país respecto del período de referencia que usa el Servicio Meteorológico Nacional. Cada franja es un año: celeste, más frío que la referencia, y rojo, más cálido. Pasá el cursor para ver el valor.`,
  "visitas-parque-titulo": `Visitas por parque nacional, ${vpq.ult}${vpq.par ? ` y ${vpq.par}` : ""}`,
  "visitas-parque": `${vpq.top} (${vpq.top_lugar}) fue el parque nacional más visitado en ${vpq.ult}, con ${n0(vpq.top_v)} visitas: el ${pct(vpq.pct_top)} del total. Le siguió ${vpq.dos}, con ${n0(vpq.dos_v)}. En 2019, antes de la pandemia, ${vpq.top} había recibido ${n0(vpq.top_2019)}.` +
    (vpq.par ? ` Entre enero y ${MESES[vpq.par_mes - 1]} de ${vpq.par}, las visitas a los parques nacionales fueron un ${pct(Math.abs(vpq.par_var))} ${vpq.par_var >= 0 ? "más altas" : "más bajas"} que en los mismos meses de ${vpq.par - 1}.` : ""),
  "vp-b1": String(vpq.ult), "vp-b2": vpq.par ? `${vpq.par}, ene a ${MESES[vpq.par_mes - 1].slice(0, 3)}` : "",
  "visitas-parque-nota": `Visitas registradas en ${vpq.n} áreas protegidas nacionales con control de ingreso. El tablero de la Secretaría de Turismo no tiene un enlace de descarga fijo: la exportación completa, mes a mes desde 2008, se guarda en el repositorio y hay que renovarla a mano.`,
  "pesca-titulo": `Desembarques de pesca marítima de las tres especies principales, ${pe.ini} a ${pe.anio}`,
  pesca: `En ${pe.anio} se desembarcaron ${n0(pe.total)} toneladas de pescados y mariscos en los puertos del país, contra ${n0(pe.total_ini)} en ${pe.ini}. Las especies principales fueron ${pe.top[0].toLowerCase()} (${n0(pe.top_t[0])} toneladas), ${pe.top[1].toLowerCase()} (${n0(pe.top_t[1])}) y ${pe.top[2].toLowerCase()} (${n0(pe.top_t[2])}). La primera representó el ${pct(pe.top_pct)} del total.`,
  "pesca-nota": `Capturas de la flota comercial desembarcadas en puertos argentinos, en toneladas, según la Subsecretaría de Pesca y Acuicultura. La tabla descargable incluye el total de todas las especies.`,
  "pesca-rio-titulo": `Pesca comercial en ríos por especie, ${pe.rio_anio}`,
  "pesca-rio": `En ${pe.rio_anio} la pesca comercial en aguas continentales registró ${n0(pe.rio_total)} toneladas. El ${pct(pe.rio_top_pct)} fue ${pe.rio_top.toLowerCase()}. Las capturas informadas se concentraron en ${lista(pe.rio_provs)}, sobre todo en ${pe.rio_prov_top} (${pct(pe.rio_prov_top_pct)}).`,
  "pesca-rio-nota": `Captura comercial registrada en ríos y lagunas de las provincias que informan datos, en toneladas. No incluye la pesca deportiva ni la de subsistencia. La tabla descargable muestra cada especie por provincia.`,
  "esperanza-titulo": `Esperanza de vida al nacer por provincia y sexo, ${nv.ev_anio}`,
  esperanza: `En ${nv.ev_anio}, la esperanza de vida al nacer en el país era de ${n1(nv.ev_pais)} años: ${n1(nv.ev_m)} para las mujeres y ${n1(nv.ev_v)} para los varones. Por provincia iba de ${n1(nv.ev_top_v)} años en ${nv.ev_top} a ${n1(nv.ev_low_v)} en ${nv.ev_low}.`,
  "esperanza-nota": `Años que viviría en promedio una persona nacida en ${nv.ev_anio} si se mantuvieran las tasas de mortalidad por edad de ese año. El círculo claro marca a los varones y el lleno a las mujeres. El INDEC publica tablas para 2020, 2021 y 2022, y las de 2020 y 2021 reflejan la mortalidad de la pandemia de covid-19. La línea punteada azul marca el promedio simple de los países de la OCDE en ${OC.esperanza_vida.anio}, para ambos sexos, según el Banco Mundial.`,
  "exportaciones-titulo": `Exportaciones por habitante según provincia de origen, ${nv.ex_anio}`,
  exportaciones: `En ${nv.ex_anio} el país exportó bienes por ${n0(nv.ex_total)} millones de dólares, unos ${n0(nv.ex_pc_pais)} dólares por habitante. Por habitante, las exportaciones producidas en ${nv.ex_top} sumaron ${n0(nv.ex_top_v)} dólares y las de ${nv.ex_low}, ${n0(nv.ex_low_v)}.` + (nv.ex_sem ? ` En el primer semestre de ${nv.ex_sem.anio}, con datos provisorios, sumaron ${n0(nv.ex_sem.total)} millones de dólares, ${pct(Math.abs(nv.ex_sem.var))} ${nv.ex_sem.var >= 0 ? "más" : "menos"} que en el primer semestre de ${nv.ex_sem.anio - 1}, y subieron en ${nv.ex_sem.suben} de las 24 jurisdicciones.` : ""),
  "exportaciones-nota": `Valor FOB de los bienes exportados según la provincia donde se produjeron. El ${pct(nv.ex_provincial_pct)} del total tiene una provincia de origen identificada. El resto sale de la plataforma continental, es mercadería extranjera o tiene origen indeterminado. La tabla descargable separa productos primarios, manufacturas agropecuarias, manufacturas industriales y combustibles. La población es la proyección 2025 del INDEC.`,
  "censo-titulo": `Servicios, equipamiento y cobertura de salud por provincia, Censo 2022`,
  "censo-nota": `Hogares y personas en viviendas particulares según el Censo 2022. Agua de red: agua corriente de red pública. Cloacas: inodoro con descarga de agua y desagüe a red pública. Internet: conexión en la vivienda, incluida la del celular. Necesidades básicas insatisfechas: hacinamiento, vivienda precaria, sin baño, chicos sin escuela o baja capacidad de subsistencia, según la definición del INDEC. El INDEC no publica estos totales provinciales en un archivo propio: se suman desde los resultados por radio censal, así que pueden diferir levemente de sus cuadros.`,
  "internet-titulo": `Internet fijo por provincia, ${nv.in_trim}`,
  internet: `En el ${nv.in_trim}, ${nv.in_top} tenía ${n1(nv.in_top_v)} accesos a internet fijo cada 100 hogares y ${nv.in_low}, ${n1(nv.in_low_v)}. La velocidad media de bajada iba de ${n1(nv.ve_top_v)} megabits por segundo en ${nv.ve_top} a ${n1(nv.ve_low_v)} en ${nv.ve_low}.`,
  "internet-nota": `Accesos a internet fijo informados por las empresas prestadoras al ENACOM, divididos por la cantidad de hogares. Incluye conexiones de empresas y oficinas, por eso algunas jurisdicciones superan los 100. La velocidad es el promedio de la velocidad contratada de bajada. No incluye internet por celular, que sí cuenta el Censo 2022 en la ficha anterior.`,
  "extranjeros-titulo": `Personas nacidas en otro país por provincia, junio de 2026`,
  extranjeros: `Por cada 100 habitantes del país hay ${n1(nv.xt_pais)} personas nacidas en otro país con documento argentino. ${nv.xt_top} tiene el valor más alto, con ${n1(nv.xt_top_v)}. Los países de nacimiento más frecuentes son ${lista(nv.xt_origen)}.`,
  "extranjeros-nota": `Personas nacidas en el extranjero identificadas por el RENAPER, según la provincia de su domicilio. No incluye a quienes viven en el país sin DNI argentino. La población es la proyección 2025 del INDEC.`,
  "fiscal-titulo": `Recursos propios, resultado fiscal y gasto en personal por provincia, ${R.fiscal.anio}`,
  "fiscal-nota": `Administración pública no financiera de cada provincia, ejecución del año completo según el Ministerio de Economía. Recursos propios: ingresos corrientes menos los tributos de origen nacional, como la coparticipación, y las transferencias, más los recursos propios de capital, sobre los ingresos totales. Incluye impuestos provinciales y regalías. Resultado financiero: ingresos totales menos gastos totales, sobre los ingresos totales. Gasto en personal: sueldos y cargas sociales sobre el gasto total. La serie desde ${R.fiscal.ini} está en el explorador de cruces.` +
    Object.entries(R.fiscal.atrasadas).map(([p, a]) => ` ${p} todavía no publicó ${R.fiscal.anio}: figura con ${a}.`).join(""),
  "mapa-dep-titulo": `Indicadores de los ${R.departamentos.n} departamentos del país`,
  "mapa-dep": `Cada provincia se divide en departamentos, partidos o comunas. Este mapa muestra datos de seguridad del SNIC y la estructura de edad y el origen de la población identificada por el RENAPER en cada uno. Elegí una provincia arriba para acercarte.`,
  actualizado: `Datos descargados y procesados el ${R.actualizado}.`
};
document.querySelectorAll("[data-t]").forEach(el => { if (TX[el.dataset.t]) el.textContent = TX[el.dataset.t]; });

/* ---------- provincias ---------- */
const PROV = T.empleo_provincias.map(d => [d.codigo_indec, d.territorio]).sort((a,b) => a[1].localeCompare(b[1],"es"));
const NOMBRES = Object.fromEntries(PROV);
// La provincia se puede compartir en el enlace (?prov=30) y se recuerda en este navegador
const leerProv = () => new URLSearchParams(location.search).get("prov") || new URLSearchParams(location.hash.split("?")[1] || "").get("prov") || "";
let prov = "";
try { prov = leerProv() || localStorage.getItem("prov") || ""; } catch(_) { prov = leerProv(); }
if (!NOMBRES[prov]) prov = "";
function elegir(c) {
  prov = NOMBRES[c] ? c : "";
  desplegable.marcar();
  try { localStorage.setItem("prov", prov); } catch(_) {}
  const u = new URL(location.href);
  if (prov) u.searchParams.set("prov", prov); else u.searchParams.delete("prov");
  history.replaceState(null, "", u);
  dibujarTodo(); pintarPanel(true); tablaAreas();
}

/* Desplegable propio: botón chico, panel con buscador y lista en dos columnas.
   Teclado: flechas para moverse, Enter para elegir, Escape para cerrar. */
const desplegable = (() => {
  const caja = document.getElementById("elige"), btn = document.getElementById("elige-btn"), panel = document.getElementById("elige-panel");
  const buscar = document.getElementById("elige-buscar"), lista = document.getElementById("elige-lista"), vacio = document.getElementById("elige-vacio");
  const valor = document.getElementById("elige-valor");
  const sinTilde = t => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  lista.innerHTML = [["", "Todo el país"], ...PROV].map(([c, n], i) =>
    `<li role="option" id="op-${c || "pais"}" data-c="${c}" aria-selected="false"${i === 0 ? ' class="primera"' : ""}>${n}</li>`).join("");
  const items = [...lista.children];
  let activa = -1, cierre;
  const visibles = () => items.filter(li => !li.hidden);
  const activar = i => {
    const v = visibles(); if (!v.length) return;
    activa = (i + v.length) % v.length;
    items.forEach(li => li.classList.remove("activa"));
    v[activa].classList.add("activa"); v[activa].scrollIntoView({block: "nearest"});
    buscar.setAttribute("aria-activedescendant", v[activa].id);
  };
  const abrir = () => {
    clearTimeout(cierre); panel.hidden = false; btn.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() => panel.classList.add("abierto"));
    buscar.value = ""; filtrar(); buscar.focus();
    activar(Math.max(0, visibles().findIndex(li => li.dataset.c === prov)));
  };
  const cerrar = (volver) => {
    panel.classList.remove("abierto"); btn.setAttribute("aria-expanded", "false");
    cierre = setTimeout(() => { panel.hidden = true; }, 130);
    if (volver) btn.focus();
  };
  const filtrar = () => {
    const q = sinTilde(buscar.value.trim());
    items.forEach(li => { li.hidden = q !== "" && !sinTilde(li.textContent).includes(q); });
    vacio.hidden = visibles().length > 0; activar(0);
  };
  btn.addEventListener("click", () => btn.getAttribute("aria-expanded") === "true" ? cerrar(true) : abrir());
  buscar.addEventListener("input", filtrar);
  buscar.addEventListener("keydown", ev => {
    if (ev.key === "ArrowDown") { ev.preventDefault(); activar(activa + 1); }
    else if (ev.key === "ArrowUp") { ev.preventDefault(); activar(activa - 1); }
    else if (ev.key === "Enter") { ev.preventDefault(); const li = visibles()[activa]; if (li) { elegir(li.dataset.c); cerrar(true); } }
    else if (ev.key === "Escape") { ev.preventDefault(); cerrar(true); }
  });
  lista.addEventListener("click", ev => { const li = ev.target.closest("li"); if (li) { elegir(li.dataset.c); cerrar(true); } });
  document.addEventListener("pointerdown", ev => { if (!caja.contains(ev.target) && btn.getAttribute("aria-expanded") === "true") cerrar(false); });
  const marcar = () => {
    valor.textContent = NOMBRES[prov] || "Todo el país";
    items.forEach(li => li.setAttribute("aria-selected", li.dataset.c === prov));
  };
  marcar();
  return {marcar};
})();

/* ---------- utilidades de gráfico ---------- */
function lienzo(el, h, m) {
  el.innerHTML = "";
  const w = Math.max(300, el.clientWidth);
  const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${w} ${h}`).attr("role","img");
  return {svg, w, h, iw: w - m.l - m.r, ih: h - m.t - m.b, g: svg.append("g").attr("transform", `translate(${m.l},${m.t})`)};
}
function mostrarTip(el, html, x, y) {
  const r = el.getBoundingClientRect(), pr = document.body.getBoundingClientRect();
  tip.innerHTML = html; tip.classList.add("on");
  const tw = tip.offsetWidth;
  let left = r.left - pr.left + x - tw / 2;
  left = Math.max(8, Math.min(left, document.documentElement.clientWidth - tw - 8));
  tip.style.left = left + "px"; tip.style.top = (r.top - pr.top + y - tip.offsetHeight - 12) + "px";
}
const ocultarTip = () => tip.classList.remove("on");
document.addEventListener("pointerdown", ev => { if (!ev.target.closest?.(".grafico")) ocultarTip(); });

/* Animación de entrada: solo la primera vez que el gráfico aparece en pantalla, nunca con movimiento reducido */
const REDUCIR = matchMedia("(prefers-reduced-motion: reduce)").matches;
const EASE = d3.easePolyOut.exponent(4);
function trazar(path, dash) {
  const L = path.node().getTotalLength();
  path.attr("stroke-dasharray", `${L} ${L}`).attr("stroke-dashoffset", L)
    .transition().duration(1100).ease(EASE).attr("stroke-dashoffset", 0)
    .on("end", function() { d3.select(this).attr("stroke-dasharray", dash || null).attr("stroke-dashoffset", null); });
}
const aparecer = (sel, delay) => sel.attr("opacity", 0).transition().delay(delay).duration(320).ease(d3.easeCubicOut).attr("opacity", 1);

function lineas(el, cfg) {
  const angosto = el.clientWidth < 520;
  const C = lienzo(el, cfg.h ? (angosto ? cfg.h - 20 : cfg.h) : (angosto ? 300 : 340), {t:14, r: angosto ? 92 : 128, b:30, l:44});
  const {g, iw, ih} = C, data = cfg.data;
  const lec = d3.select(el).insert("p", "svg").attr("class", "lectura-serie").attr("aria-hidden", "true");
  const x = d3.scaleLinear().domain(d3.extent(data, d => d[cfg.x])).range([0, iw]);
  const vals = [...cfg.series.map(s => s.k), ...(cfg.banda ? [cfg.banda.hi] : [])].flatMap(k => data.map(d => d[k])).filter(v => v != null);
  const y = d3.scaleLinear().domain([cfg.y0 ?? 0, d3.max(vals) * 1.06]).nice().range([ih, 0]);
  g.append("g").attr("class","grilla").call(d3.axisLeft(y).ticks(5).tickSize(-iw).tickFormat("")).call(a => a.select(".domain").remove());
  g.append("g").attr("class","eje").call(d3.axisLeft(y).ticks(5).tickFormat(cfg.yf || n0).tickSize(0).tickPadding(8)).call(a => a.select(".domain").remove());
  g.append("g").attr("class","eje").attr("transform",`translate(0,${ih})`).call(cfg.mensual
    ? d3.axisBottom(x).tickValues(d3.range(Math.ceil(x.domain()[0]), Math.floor(x.domain()[1]) + 1).filter(v => !angosto || v % 2 === 0)).tickFormat(d3.format("d")).tickSizeOuter(0)
    : d3.axisBottom(x).ticks(angosto ? 4 : 7).tickFormat(d3.format("d")).tickSizeOuter(0));
  if (cfg.ref != null) {
    g.append("line").attr("x1",0).attr("x2",iw).attr("y1",y(cfg.ref)).attr("y2",y(cfg.ref)).attr("stroke",css("--faint")).attr("stroke-width",1).attr("stroke-dasharray", cfg.refLab ? "4 4" : null);
    if (cfg.refLab) g.append("text").attr("x", 6).attr("y", y(cfg.ref) + 16).attr("class","etq-suave").text(angosto && cfg.refLabCorto ? cfg.refLabCorto : cfg.refLab);
  }
  if (cfg.banda) {
    const bd = data.filter(d => d[cfg.banda.lo] != null && d[cfg.banda.hi] != null);
    const ar = g.append("path").datum(bd).attr("fill", cfg.banda.c || css("--celeste-suave")).attr("opacity", .85)
      .attr("d", d3.area().x(d => x(d[cfg.x])).y0(d => y(d[cfg.banda.lo])).y1(d => y(d[cfg.banda.hi])).curve(d3.curveMonotoneX));
    if (cfg.anim) aparecer(ar, 150);
  }
  const etiquetas = [], fin = g.append("g");
  cfg.series.forEach(s => {
    const serie = data.filter(d => d[s.k] != null);
    const trazo = g.append("path").datum(serie).attr("fill","none").attr("stroke", s.c).attr("stroke-width", s.w || 2.4)
      .attr("stroke-linejoin","round").attr("stroke-linecap","round").attr("stroke-dasharray", s.dash || null)
      .attr("d", d3.line().x(d => x(d[cfg.x])).y(d => y(d[s.k])).curve(cfg.escalones ? d3.curveStepAfter : d3.curveMonotoneX));
    if (cfg.anim) trazar(trazo, s.dash);
    const u = serie[serie.length - 1];
    fin.append("circle").attr("cx", x(u[cfg.x])).attr("cy", y(u[s.k])).attr("r", 3.5).attr("fill", s.c);
    etiquetas.push({y: y(u[s.k]), s, v: u[s.k]});
  });
  fin.raise();
  // etiquetas directas sin solaparse
  etiquetas.sort((a,b) => a.y - b.y);
  for (let i = 1; i < etiquetas.length; i++) if (etiquetas[i].y - etiquetas[i-1].y < 32) etiquetas[i].y = etiquetas[i-1].y + 32;
  etiquetas.forEach(l => {
    const t = fin.append("text").attr("x", iw + 10).attr("y", l.y - 4).attr("class","etq-fuerte").style("fill", l.s.c);
    t.append("tspan").text(l.s.lab);
    t.append("tspan").attr("x", iw + 10).attr("dy", 15).attr("class","etq-suave").text((cfg.vf || n0)(l.v));
  });
  if (cfg.anim) aparecer(fin, 800);
  // Lectura por punto en una línea fija arriba del gráfico (idea de USAFacts): muestra el último dato y, al pasar el mouse
  // o deslizar el dedo, el período elegido. El dedo no tapa el valor. Deslizar en vertical sigue moviendo la página.
  const vf = cfg.vf || n0;
  const leer = d => `<b>${cfg.xl ? cfg.xl(d) : d[cfg.x]}</b>` +
    cfg.series.filter(s => d[s.k] != null).map(s => `<span><i style="background:${s.c}"></i>${s.lab} ${vf(d[s.k])}</span>`).join("") +
    (cfg.banda && d[cfg.banda.lo] != null ? `<span><i style="background:${cfg.banda.c || css("--celeste-suave")}"></i>${cfg.banda.lab} ${vf(d[cfg.banda.lo])} a ${vf(d[cfg.banda.hi])}</span>` : "");
  const ult = [...data].reverse().find(d => cfg.series.some(s => d[s.k] != null));
  lec.html(ult ? leer(ult) : "");
  const regla = g.append("line").attr("y1",0).attr("y2",ih).attr("stroke",css("--faint")).attr("opacity",0);
  const marcas = g.append("g").attr("opacity", 0);
  const puntos = marcas.selectAll("circle").data(cfg.series).join("circle").attr("r", 4.5).attr("fill", s => s.c).attr("stroke", "#fff").attr("stroke-width", 2);
  const leerEn = ev => {
    const [mx] = d3.pointer(ev); const xv = x.invert(mx);
    const d = d3.least(data, r => Math.abs(r[cfg.x] - xv)); if (!d) return;
    const a = x(d[cfg.x]);
    regla.attr("x1", a).attr("x2", a).attr("opacity", 1);
    marcas.attr("opacity", 1);
    puntos.attr("cx", a).attr("cy", s => d[s.k] != null ? y(d[s.k]) : 0).attr("opacity", s => d[s.k] != null ? 1 : 0);
    lec.html(leer(d));
  };
  C.svg.style("touch-action", "pan-y");
  g.append("rect").attr("width",iw).attr("height",ih).attr("fill","transparent")
    .on("pointerdown", leerEn).on("pointermove", leerEn)
    .on("pointerleave", ev => {
      if (ev.pointerType !== "mouse") return;
      regla.attr("opacity",0); marcas.attr("opacity",0); lec.html(ult ? leer(ult) : "");
    });
}

function barrasH(el, cfg) {
  const data = [...cfg.data].sort((a,b) => d3.descending(a[cfg.k], b[cfg.k]));
  const angosto = el.clientWidth < 520, fila = angosto ? 20 : 24;
  const izq = angosto ? (cfg.lAngosto || 118) : (cfg.l || 150);
  const C = lienzo(el, data.length * fila + 34 + (cfg.ref2 != null ? 14 : 0), {t:24, r:54, b:10, l: izq});
  const {g, iw} = C;
  const ext = d3.extent(data, d => d[cfg.k]);
  const x = d3.scaleLinear().domain([Math.min(0, ext[0]), Math.max(0, ext[1])]).nice().range([0, iw]);
  const y = d3.scaleBand().domain(data.map(d => d.codigo_indec)).range([0, data.length * fila]).padding(.28);
  g.append("g").attr("class","eje").call(d3.axisTop(x).ticks(angosto ? (cfg.ntAngosto || 2) : 5).tickFormat(cfg.af || n0).tickSize(0).tickPadding(6)).call(a => a.select(".domain").remove());
  if (x.domain()[0] < 0) g.append("line").attr("x1",x(0)).attr("x2",x(0)).attr("y1",0).attr("y2",data.length*fila).attr("stroke",css("--faint"));
  const filas = g.selectAll("g.f").data(data).join("g").attr("class","f").attr("transform", d => `translate(0,${y(d.codigo_indec)})`);
  const barras = filas.append("rect").attr("x", d => x(Math.min(0, d[cfg.k]))).attr("height", y.bandwidth()).attr("rx", 2)
    .attr("width", d => Math.abs(x(d[cfg.k]) - x(0)))
    .attr("fill", d => d.codigo_indec === prov ? css("--celeste-fuerte") : (cfg.color ? cfg.color(d) : css("--celeste")))
    .attr("opacity", d => prov && d.codigo_indec !== prov ? .55 : 1);
  filas.append("text").attr("x", -10).attr("y", y.bandwidth()/2).attr("dy",".35em").attr("text-anchor","end")
    .attr("class", d => d.codigo_indec === prov ? "etq-fuerte" : "etq").text(d => d.territorio);
  const valores = filas.append("text").attr("x", d => d[cfg.k] < 0 ? x(0) + 6 : x(d[cfg.k]) + 6).attr("y", y.bandwidth()/2).attr("dy",".35em")
    .attr("class", d => d.codigo_indec === prov ? "etq-fuerte" : "etq-suave").text(d => (cfg.vf || n1)(d[cfg.k]));
  if (cfg.anim) {
    barras.attr("x", x(0)).attr("width", 0).transition().delay((d,i) => i * 18).duration(700).ease(EASE)
      .attr("x", d => x(Math.min(0, d[cfg.k]))).attr("width", d => Math.abs(x(d[cfg.k]) - x(0)));
    valores.attr("opacity", 0).transition().delay((d,i) => 300 + i * 18).duration(300).attr("opacity", 1);
  }
  if (cfg.tip) {
    // toda la fila responde, no solo la barra, y el cuadro muestra los valores absolutos que la barra no dice
    filas.insert("rect", ":first-child").attr("x", -izq).attr("width", iw + izq + 54).attr("height", y.bandwidth()).attr("fill", "transparent");
    filas.on("pointerenter", (ev, d) => mostrarTip(el, cfg.tip(d), izq + x(Math.max(0, d[cfg.k])), 24 + y(d.codigo_indec)))
      .on("pointerleave", ocultarTip);
  }
  if (cfg.ref != null) {
    g.append("line").attr("x1",x(cfg.ref)).attr("x2",x(cfg.ref)).attr("y1",-4).attr("y2",data.length*fila).attr("stroke",css("--ink")).attr("stroke-dasharray","3 3");
    g.append("text").attr("x", x(cfg.ref) + 5).attr("y", data.length*fila + 4).attr("class","etq-suave").text(cfg.refLab);
  }
  if (cfg.ref2 != null) {
    g.append("line").attr("x1",x(cfg.ref2)).attr("x2",x(cfg.ref2)).attr("y1",-4).attr("y2",data.length*fila).attr("stroke",css("--ocde")).attr("stroke-dasharray","4 3").attr("stroke-width",2);
    const der = cfg.ref == null || cfg.ref2 >= cfg.ref;
    g.append("text").attr("x", x(cfg.ref2) + (der ? 5 : -5)).attr("y", data.length*fila + 18).attr("text-anchor", der ? "start" : "end")
      .attr("class","etq-fuerte").attr("fill",css("--ocde")).text(cfg.ref2Lab);
  }
}

function pesas(el, cfg) {
  // Dos momentos por provincia: círculo claro = a (antes), círculo lleno = b (después)
  const {a, b, la, lb} = cfg, vf = cfg.vf || (v => n1(v) + "%");
  const data = [...cfg.data].sort((p,q) => d3.descending(p[b], q[b]));
  const angosto = el.clientWidth < 520, fila = angosto ? 20 : 24;
  const C = lienzo(el, data.length * fila + 34 + (cfg.ref != null ? 12 : 0), {t:24, r:44, b:10, l: angosto ? 118 : 150});
  const {g, iw} = C;
  const x = d3.scaleLinear().domain([cfg.x0 ?? 0, d3.max(data, d => Math.max(d[a], d[b])) * 1.02]).nice().range([0, iw]);
  const y = d3.scaleBand().domain(data.map(d => d.codigo_indec)).range([0, data.length*fila]).padding(.3);
  g.append("g").attr("class","grilla").call(d3.axisTop(x).ticks(5).tickSize(-data.length*fila).tickFormat("")).call(s => s.select(".domain").remove());
  g.append("g").attr("class","eje").call(d3.axisTop(x).ticks(5).tickFormat(cfg.af || (v => v + "%")).tickSize(0).tickPadding(6)).call(s => s.select(".domain").remove());
  if (cfg.ref != null) {
    g.append("line").attr("x1",x(cfg.ref)).attr("x2",x(cfg.ref)).attr("y1",-4).attr("y2",data.length*fila).attr("stroke",css("--ocde")).attr("stroke-dasharray","4 3").attr("stroke-width",2);
    g.append("text").attr("x", x(cfg.ref) + 5).attr("y", data.length*fila + 6).attr("class","etq-fuerte").attr("fill",css("--ocde")).text(cfg.refLab);
  }
  const f = g.selectAll("g.f").data(data).join("g").attr("transform", d => `translate(0,${y(d.codigo_indec) + y.bandwidth()/2})`)
    .attr("opacity", d => prov && d.codigo_indec !== prov ? .45 : 1);
  const tramo = f.append("line").attr("x1", d => x(d[b])).attr("x2", d => x(d[a])).attr("stroke", css("--celeste-suave")).attr("stroke-width", 5).attr("stroke-linecap","round");
  f.append("circle").attr("cx", d => x(d[a])).attr("r", 5).attr("fill", css("--bg")).attr("stroke", css("--celeste")).attr("stroke-width", 2);
  const punto = f.append("circle").attr("cx", d => x(d[b])).attr("r", 5.5).attr("fill", d => d.codigo_indec === prov ? css("--celeste-fuerte") : css("--celeste"));
  f.append("text").attr("x", -10).attr("dy",".35em").attr("text-anchor","end").attr("class", d => d.codigo_indec === prov ? "etq-fuerte" : "etq").text(d => d.territorio);
  const valor = f.append("text").attr("x", d => x(Math.max(d[a], d[b])) + 10).attr("dy",".35em").attr("class","etq-suave").text(d => vf(d[b]));
  if (cfg.anim) {
    // el punto viaja desde el valor de antes hasta el de después: la animación cuenta el cambio
    tramo.attr("x1", d => x(d[a])).transition().delay((d,i) => 200 + i * 22).duration(900).ease(EASE).attr("x1", d => x(d[b]));
    punto.attr("cx", d => x(d[a])).transition().delay((d,i) => 200 + i * 22).duration(900).ease(EASE).attr("cx", d => x(d[b]));
    valor.attr("opacity", 0).transition().delay((d,i) => 700 + i * 22).duration(300).attr("opacity", 1);
  }
  f.on("pointerenter", function(ev, d) { const yy = y(d.codigo_indec) + 24; mostrarTip(el, `<b>${d.territorio}</b><br>${la}: ${vf(d[a])}<br>${lb}: ${vf(d[b])}`, x(d[b]) + (angosto?118:150), yy); })
   .on("pointerleave", ocultarTip);
}

function columnas(el, cfg) {
  const MES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const C = lienzo(el, 280, {t:26, r:6, b:28, l:6});
  const {g, iw, ih} = C, data = cfg.data;
  const x = d3.scaleBand().domain(data.map(d => d.mes)).range([0, iw]).padding(.22);
  const y = d3.scaleLinear().domain([0, d3.max(data, d => d.gwh) * 1.08]).range([ih, 0]);
  const mx = d3.max(data, d => d.gwh), mn = d3.min(data, d => d.gwh);
  const cols = g.selectAll("rect").data(data).join("rect").attr("x", d => x(d.mes)).attr("width", x.bandwidth()).attr("rx", 2)
    .attr("y", d => y(d.gwh)).attr("height", d => ih - y(d.gwh))
    .attr("fill", d => d.gwh === mx ? css("--celeste-fuerte") : d.gwh === mn ? css("--sol") : css("--celeste"));
  const vals = g.selectAll("text.v").data(data).join("text").attr("class","etq-suave").attr("text-anchor","middle")
    .attr("x", d => x(d.mes) + x.bandwidth()/2).attr("y", d => y(d.gwh) - 6)
    .text(d => el.clientWidth < 520 ? n1(d.gwh/1000) : n0(d.gwh));
  if (cfg.anim) {
    cols.attr("y", ih).attr("height", 0).transition().delay((d,i) => i * 35).duration(700).ease(EASE)
      .attr("y", d => y(d.gwh)).attr("height", d => ih - y(d.gwh));
    vals.attr("opacity", 0).transition().delay((d,i) => 350 + i * 35).duration(300).attr("opacity", 1);
  }
  g.append("g").attr("class","eje").attr("transform",`translate(0,${ih})`).call(d3.axisBottom(x).tickFormat(m => MES[m-1]).tickSize(0).tickPadding(8)).call(a => a.select(".domain").remove());
  if (el.clientWidth < 520) g.append("text").attr("class","etq-suave").attr("x",0).attr("y",-12).text("Miles de GWh");
}

// Barras horizontales por grupo (no por provincia), con una línea de referencia
function barrasGrupos(el, cfg) {
  const data = cfg.data, angosto = el.clientWidth < 520, fila = 32;
  const izq = angosto ? 128 : 190;
  const C = lienzo(el, data.length * fila + 40, {t:24, r:56, b:16, l: izq});
  const {g, iw} = C;
  const x = d3.scaleLinear().domain([0, d3.max(data, d => d[cfg.k]) * 1.05]).nice().range([0, iw]);
  const y = d3.scaleBand().domain(data.map(d => d.grupo)).range([0, data.length * fila]).padding(.3);
  g.append("g").attr("class","eje").call(d3.axisTop(x).ticks(angosto ? 3 : 5).tickFormat(v => v + "%").tickSize(0).tickPadding(6)).call(a => a.select(".domain").remove());
  const f = g.selectAll("g.f").data(data).join("g").attr("transform", d => `translate(0,${y(d.grupo)})`);
  const b = f.append("rect").attr("height", y.bandwidth()).attr("width", d => x(d[cfg.k])).attr("fill", css("--celeste"));
  f.append("text").attr("x", -10).attr("y", y.bandwidth()/2).attr("dy",".35em").attr("text-anchor","end").attr("class","etq").text(d => d.grupo);
  const v = f.append("text").attr("x", d => x(d[cfg.k]) + 6).attr("y", y.bandwidth()/2).attr("dy",".35em").attr("class","etq-fuerte").text(d => pct(d[cfg.k]));
  if (cfg.ref != null) {
    g.append("line").attr("x1", x(cfg.ref)).attr("x2", x(cfg.ref)).attr("y1", -4).attr("y2", data.length * fila).attr("stroke", css("--ink")).attr("stroke-dasharray","3 3");
    g.append("text").attr("x", x(cfg.ref) + 5).attr("y", data.length * fila + 12).attr("class","etq-suave").text(cfg.refLab);
  }
  if (cfg.anim) {
    b.attr("width", 0).transition().delay((d,i) => i * 40).duration(700).ease(EASE).attr("width", d => x(d[cfg.k]));
    aparecer(v, 400);
  }
}

// Pirámide de población: barras llenas para el año en curso y contorno para 2040, en porcentaje del total
function piramidePob(el, cfg) {
  const filas = cfg.data.filter(d => d.codigo_indec === cfg.cod);
  const th = d3.sum(filas, d => d.personas_hoy), tf = d3.sum(filas, d => d.personas_2040);
  const edades = [...new Set(filas.map(d => d.edad))].sort((a, b) => a - b);
  const data = edades.map(e => {
    const v = filas.find(d => d.edad === e && d.sexo === "varones"), m = filas.find(d => d.edad === e && d.sexo === "mujeres");
    return {edad: e, lab: e >= 90 ? "90+" : `${e}-${e + 4}`, vh: v.personas_hoy / th * 100, mh: m.personas_hoy / th * 100, vf: v.personas_2040 / tf * 100, mf: m.personas_2040 / tf * 100};
  });
  const angosto = el.clientWidth < 520, fila = angosto ? 17 : 20;
  const C = lienzo(el, data.length * fila + 64, {t:48, r:8, b:16, l:8});
  const {g, iw} = C, centro = iw / 2, gap = angosto ? 22 : 28;
  const mx = d3.max(data, d => Math.max(d.vh, d.mh, d.vf, d.mf));
  const x = d3.scaleLinear().domain([0, mx]).range([0, centro - gap - 6]);
  const y = d3.scaleBand().domain(data.map(d => d.edad).reverse()).range([0, data.length * fila]).padding(.14);
  g.append("text").attr("x", centro).attr("y", -30).attr("text-anchor","middle").attr("class","etq-fuerte").text(cfg.nombre);
  g.append("text").attr("x", centro - gap).attr("y", -12).attr("text-anchor","end").attr("class","etq-fuerte").attr("fill",css("--celeste-fuerte")).text("Varones");
  g.append("text").attr("x", centro + gap).attr("y", -12).attr("class","etq-fuerte").attr("fill",css("--sol-fuerte")).text("Mujeres");
  const f = g.selectAll("g.f").data(data).join("g").attr("transform", d => `translate(0,${y(d.edad)})`);
  const v = f.append("rect").attr("x", d => centro - gap - x(d.vh)).attr("width", d => x(d.vh)).attr("height", y.bandwidth()).attr("fill", css("--celeste"));
  const m = f.append("rect").attr("x", centro + gap).attr("width", d => x(d.mh)).attr("height", y.bandwidth()).attr("fill", css("--sol"));
  const ov = f.append("rect").attr("x", d => centro - gap - x(d.vf)).attr("width", d => x(d.vf)).attr("height", y.bandwidth()).attr("fill","none").attr("stroke", css("--ink")).attr("stroke-width", 1.2);
  const om = f.append("rect").attr("x", centro + gap).attr("width", d => x(d.mf)).attr("height", y.bandwidth()).attr("fill","none").attr("stroke", css("--ink")).attr("stroke-width", 1.2);
  f.append("text").attr("x", centro).attr("y", y.bandwidth()/2).attr("dy",".35em").attr("text-anchor","middle").attr("class","etq-suave").style("font-size", angosto ? "10px" : null).text(d => d.lab);
  f.append("rect").attr("x", 0).attr("width", iw).attr("height", y.bandwidth()).attr("fill","transparent")
    .on("pointermove", (ev, d) => mostrarTip(el, `<b>${d.lab} años</b><br>Varones: ${n1(d.vh)}% en ${cfg.anio} y ${n1(d.vf)}% en 2040<br>Mujeres: ${n1(d.mh)}% en ${cfg.anio} y ${n1(d.mf)}% en 2040`, centro, y(d.edad) + 48))
    .on("pointerleave", ocultarTip);
  const ley = g.append("g").attr("transform", `translate(${centro - 56},${data.length * fila + 8})`);
  ley.append("rect").attr("width", 12).attr("height", 9).attr("fill", css("--celeste"));
  ley.append("text").attr("x", 16).attr("y", 9).attr("class","etq-suave").text(String(cfg.anio));
  ley.append("rect").attr("x", 64).attr("width", 12).attr("height", 9).attr("fill","none").attr("stroke", css("--ink"));
  ley.append("text").attr("x", 80).attr("y", 9).attr("class","etq-suave").text("2040");
  if (cfg.anim) {
    v.attr("x", centro - gap).attr("width", 0).transition().delay((d,i) => i * 20).duration(700).ease(EASE).attr("x", d => centro - gap - x(d.vh)).attr("width", d => x(d.vh));
    m.attr("width", 0).transition().delay((d,i) => i * 20).duration(700).ease(EASE).attr("width", d => x(d.mh));
    aparecer(ov, 700); aparecer(om, 700);
  }
}

function piramide(el, cfg) {
  const data = cfg.data, fila = 22, angosto = el.clientWidth < 520;
  const C = lienzo(el, data.length * fila + 40, {t:30, r:10, b:10, l:10});
  const {g, iw} = C, centro = iw / 2, gap = angosto ? 34 : 44;
  const mx = d3.max(data, d => Math.max(d.pct_varones, d.pct_mujeres));
  const x = d3.scaleLinear().domain([0, mx]).range([0, centro - gap - 34]);
  const y = d3.scaleBand().domain(data.map(d => d.edad).reverse()).range([0, data.length*fila]).padding(.2);
  g.append("text").attr("x", centro - gap).attr("y", -12).attr("text-anchor","end").attr("class","etq-fuerte").attr("fill",css("--celeste-fuerte")).text("Varones");
  g.append("text").attr("x", centro + gap).attr("y", -12).attr("class","etq-fuerte").attr("fill",css("--sol-fuerte")).text("Mujeres");
  const f = g.selectAll("g.f").data(data).join("g").attr("transform", d => `translate(0,${y(d.edad)})`);
  const v = f.append("rect").attr("x", d => centro - gap - x(d.pct_varones)).attr("width", d => x(d.pct_varones)).attr("height", y.bandwidth()).attr("rx",2).attr("fill", css("--celeste"));
  const m = f.append("rect").attr("x", centro + gap).attr("width", d => x(d.pct_mujeres)).attr("height", y.bandwidth()).attr("rx",2).attr("fill", css("--sol"));
  f.append("text").attr("x", centro).attr("y", y.bandwidth()/2).attr("dy",".35em").attr("text-anchor","middle").attr("class","etq-suave").text(d => d.edad.replace(" y más","+").replace("Menos de ","<"));
  const tv = f.append("text").attr("x", d => centro - gap - x(d.pct_varones) - 5).attr("y", y.bandwidth()/2).attr("dy",".35em").attr("text-anchor","end").attr("class","etq-suave").text(d => n1(d.pct_varones) + "%");
  const tm = f.append("text").attr("x", d => centro + gap + x(d.pct_mujeres) + 5).attr("y", y.bandwidth()/2).attr("dy",".35em").attr("class","etq-suave").text(d => n1(d.pct_mujeres) + "%");
  if (cfg.anim) {
    v.attr("x", centro - gap).attr("width", 0).transition().delay((d,i) => i * 25).duration(700).ease(EASE)
      .attr("x", d => centro - gap - x(d.pct_varones)).attr("width", d => x(d.pct_varones));
    m.attr("width", 0).transition().delay((d,i) => i * 25).duration(700).ease(EASE).attr("width", d => x(d.pct_mujeres));
    aparecer(tv, 500); aparecer(tm, 500);
  }
}


// Franjas de temperatura: un rectángulo por año, del celeste (más frío) al rojo (más cálido)
function franjas(el, cfg) {
  const data = cfg.data, angosto = el.clientWidth < 520;
  const C = lienzo(el, angosto ? 190 : 230, {t:8, r:4, b:30, l:4});
  const {g, iw, ih} = C;
  const x = d3.scaleBand().domain(data.map(d => d.anio)).range([0, iw]).padding(0);
  const ext = d3.max(data, d => Math.abs(d[cfg.k]));
  const color = d3.scaleLinear().domain([-ext, -ext / 2, 0, ext / 2, ext])
    .range(["#2C74B5", "#9CC4EA", "#F4F1EA", "#F0A35A", "#C8102E"]).clamp(true);
  const r = g.selectAll("rect").data(data).join("rect").attr("x", d => x(d.anio)).attr("width", x.bandwidth() + .5)
    .attr("y", 0).attr("height", ih).attr("fill", d => color(d[cfg.k]));
  if (cfg.anim) r.attr("opacity", 0).transition().delay((d, i) => i * 14).duration(260).attr("opacity", 1);
  const decadas = data.map(d => d.anio).filter(a => a % 10 === 0 && (!angosto || a % 20 === 0));
  g.append("g").attr("class","eje").attr("transform", `translate(0,${ih})`)
    .call(d3.axisBottom(x).tickValues(decadas).tickSize(4).tickPadding(6)).call(a => a.select(".domain").remove());
  const fmt = v => (v > 0 ? "+" : "") + n2(v) + " °C";
  r.on("pointerenter", function(ev, d) { d3.select(this).attr("stroke", css("--ink")).attr("stroke-width", 1.5);
      mostrarTip(el, `<b>${d.anio}</b><br>${fmt(d[cfg.k])}`, x(d.anio) + x.bandwidth() / 2 + 4, 10); })
   .on("pointerleave", function() { d3.select(this).attr("stroke", null); ocultarTip(); });
}



/* Barras horizontales apiladas al 100%: una fila por provincia (elecciones) */
function apiladasH(el, cfg) {
  const data = cfg.data, angosto = el.clientWidth < 520, fila = angosto ? 20 : 24;
  const C = lienzo(el, data.length * fila + 30, {t:22, r:8, b:6, l: angosto ? 112 : 150});
  const {g, iw} = C;
  const x = d3.scaleLinear().domain([0, 100]).range([0, iw]);
  const y = d3.scaleBand().domain(data.map(d => d.codigo_indec)).range([0, data.length * fila]).padding(.22);
  g.append("g").attr("class","eje").call(d3.axisTop(x).tickValues([0, 25, 50, 75, 100]).tickFormat(v => v + "%").tickSize(0).tickPadding(6)).call(a => a.select(".domain").remove());
  const f = g.selectAll("g.f").data(data).join("g").attr("class","f").attr("transform", d => `translate(0,${y(d.codigo_indec)})`);
  f.append("text").attr("x", -10).attr("y", y.bandwidth()/2).attr("dy",".35em").attr("text-anchor","end")
    .attr("class", d => d.codigo_indec === prov || d.codigo_indec === "00" ? "etq-fuerte" : "etq").text(d => d.territorio);
  f.each(function(d) {
    let acc = 0;
    const partes = cfg.claves.map(k => { const v = d[k.k] || 0, p = {k, x0: acc, v}; acc += v; return p; });
    const r = d3.select(this).selectAll("rect").data(partes).join("rect").attr("y", 0).attr("height", y.bandwidth())
      .attr("x", p => x(p.x0)).attr("width", p => Math.max(0, x(p.x0 + p.v) - x(p.x0) - (p.v > 0 ? 1 : 0))).attr("fill", p => p.k.c)
      .attr("opacity", prov && d.codigo_indec !== prov && d.codigo_indec !== "00" ? .55 : 1);
    const t = d3.select(this).selectAll("text.v").data(partes.filter(p => x(p.x0 + p.v) - x(p.x0) > 34)).join("text").attr("class","v")
      .attr("x", p => x(p.x0) + 5).attr("y", y.bandwidth()/2).attr("dy",".35em").attr("font-size", 11.5).attr("font-family","var(--mono)")
      .attr("fill", p => p.k.texto || "#fff").text(p => n0(p.v));
    if (cfg.anim) { r.attr("width", 0).transition().delay(i => 0).duration(700).ease(EASE).attr("width", p => Math.max(0, x(p.x0 + p.v) - x(p.x0) - (p.v > 0 ? 1 : 0)));
      t.attr("opacity", 0).transition().delay(500).duration(300).attr("opacity", 1); }
  });
  f.on("pointerenter", function(ev, d) {
      mostrarTip(el, `<b>${d.territorio}</b><br>` + cfg.claves.filter(k => d[k.k] != null).map(k => `<span style="color:${k.c}">■</span> ${k.lab}: ${pct(d[k.k])}`).join("<br>"),
        (angosto ? 112 : 150) + iw / 2, y(d.codigo_indec) + 22); })
   .on("pointerleave", ocultarTip);
}

/* Columnas apiladas por año (composición del Congreso) */
function columnasApiladas(el, cfg) {
  const data = cfg.data, angosto = el.clientWidth < 520;
  const C = lienzo(el, angosto ? 300 : 340, {t:14, r:8, b:28, l:36});
  const {g, iw, ih} = C;
  const x = d3.scaleBand().domain(data.map(d => d.anio)).range([0, iw]).padding(.18);
  const tot = d => d3.sum(cfg.claves, k => d[k.k] || 0);
  const y = d3.scaleLinear().domain([0, d3.max(data, tot)]).nice().range([ih, 0]);
  g.append("g").attr("class","grilla").call(d3.axisLeft(y).ticks(5).tickSize(-iw).tickFormat("")).call(a => a.select(".domain").remove());
  g.append("g").attr("class","eje").call(d3.axisLeft(y).ticks(5).tickSize(0).tickPadding(6).tickFormat(cfg.af || null)).call(a => a.select(".domain").remove());
  g.append("g").attr("class","eje").attr("transform",`translate(0,${ih})`)
    .call(d3.axisBottom(x).tickValues(data.map(d => d.anio).filter((a, i) => cfg.cadaTick ? i % (angosto ? cfg.cadaTick * 2 : cfg.cadaTick) === 0 : a % (angosto ? 8 : 4) === 0))
      .tickSize(0).tickPadding(8)).call(a => a.select(".domain").remove());
  const col = g.selectAll("g.c").data(data).join("g").attr("class","c").attr("transform", d => `translate(${x(d.anio)},0)`);
  col.each(function(d) {
    let acc = 0;
    const partes = cfg.claves.map(k => { const v = d[k.k] || 0, p = {k, y0: acc, v}; acc += v; return p; });
    const r = d3.select(this).selectAll("rect").data(partes).join("rect").attr("width", x.bandwidth()).attr("fill", p => p.k.c)
      .attr("y", p => y(p.y0 + p.v)).attr("height", p => y(p.y0) - y(p.y0 + p.v));
    if (cfg.anim) r.attr("y", ih).attr("height", 0).transition().delay(x(d.anio) / iw * 500).duration(600).ease(EASE)
      .attr("y", p => y(p.y0 + p.v)).attr("height", p => y(p.y0) - y(p.y0 + p.v));
  });
  col.append("rect").attr("width", x.bandwidth() + 2).attr("x", -1).attr("height", ih).attr("fill","transparent")
    .on("pointerenter", function(ev, d) {
      mostrarTip(el, `<b>${d.periodo || d.anio}</b>, ${(cfg.vf || (v => v))(tot(d))} ${cfg.unidad || "bancas"}<br>` + cfg.claves.filter(k => d[k.k]).map(k => `<span style="color:${k.c}">■</span> ${k.lab}: ${(cfg.vf || (v => v))(d[k.k])}`).join("<br>"), 36 + x(d.anio) + x.bandwidth() / 2, 10); })
    .on("pointerleave", ocultarTip);
}

/* Mapa de provincias: color según el porcentaje del territorio protegido y círculos para las áreas nacionales */
let GEO = null;
function mapaAreas(anim) {
  const el = G("mapa-areas");
  if (!el || !el.offsetParent) return;
  if (!GEO) { fetch("datos/provincias.geojson").then(r => r.json()).then(j => { GEO = j; mapaAreas(anim); }).catch(() => {}); return; }
  el.innerHTML = "";
  const w = Math.min(560, el.clientWidth), h = Math.round(w * 1.62) + 40;
  const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${w} ${h}`).attr("role", "img")
    .attr("aria-label", "Mapa de la Argentina con el porcentaje de territorio protegido por provincia");
  const proy = d3.geoMercator().fitExtent([[6, 6], [w - 6, h - 92]], GEO), camino = d3.geoPath(proy);
  const val = Object.fromEntries(T.areas_protegidas_provincias.map(d => [d.codigo_indec, d]));
  const cortes = [5, 10, 15, 20, 30], colores = ["#EEF5FC", "#D2E4F5", "#A9CBEA", "#7DAEDD", "#4C8DCA", "#2C74B5"];
  const escala = d3.scaleThreshold().domain(cortes).range(colores);
  const provs = svg.append("g").selectAll("path").data(GEO.features).join("path")
    .attr("class", d => "prov" + (d.properties.codigo_indec === prov ? " elegida" : "")).attr("d", camino)
    .attr("fill", d => escala(val[d.properties.codigo_indec]?.pct_territorio ?? 0));
  provs.filter(".elegida").raise();
  provs.on("pointermove", (ev, d) => {
      const v = val[d.properties.codigo_indec], [mx, my] = d3.pointer(ev, el);
      mostrarTip(el, `<b>${v ? v.territorio : d.properties.nombre}</b><br>${v ? pct(v.pct_territorio) : "Sin dato"} del territorio protegido` +
        (v ? `<br>${n0(v.ha_terrestres)} hectáreas` : ""), mx, my);
    }).on("pointerleave", ocultarTip);
  const areas = T.parques_nacionales_lista.filter(d => !d.marina && d.lat != null && d.lng != null);
  const r = d3.scaleSqrt().domain([0, d3.max(areas, d => d.hectareas)]).range([1.6, w < 420 ? 11 : 15]);
  const burb = svg.append("g").selectAll("circle").data(areas.sort((a, b) => b.hectareas - a.hectareas)).join("circle")
    .attr("class", "burbuja").attr("cx", d => proy([d.lng, d.lat])[0]).attr("cy", d => proy([d.lng, d.lat])[1]).attr("r", d => r(d.hectareas));
  if (anim) burb.attr("opacity", 0).transition().delay((d, i) => 200 + i * 12).duration(300).attr("opacity", 1);
  burb.on("pointermove", (ev, d) => { const [mx, my] = d3.pointer(ev, el);
      mostrarTip(el, `<b>${d.nombre}</b><br>${d.caracter}, ${d.anio}<br>${n0(d.hectareas)} hectáreas`, mx, my); })
    .on("pointerleave", ocultarTip);
  // leyenda
  const ley = svg.append("g").attr("class", "leyenda-mapa").attr("transform", `translate(${Math.max(6, w / 2 - 138)},${h - 38})`);
  const et = ["0", "5", "10", "15", "20", "30%"];
  colores.forEach((c, i) => {
    ley.append("rect").attr("x", i * 46).attr("width", 44).attr("height", 10).attr("rx", 2).attr("fill", c);
    ley.append("text").attr("x", i * 46).attr("y", 26).text(et[i]);
  });
  ley.append("text").attr("x", 0).attr("y", -6).text("% del territorio protegido");
}

/* ---------- fichas ---------- */
const MED = {dinamica: "pais", rotacion: "edad", fiscal: "autonomia", censo: "cloaca", internet: "accesos_100_hogares", empleo: "cada_100", pisa: "mat", aprender: "mat", protegida: "pct_territorio", eti: "cada_1000", "patentes-prov": "autos_1000", nombres: "F", "visitas-parque": "visitas_2022"};
const M = v => n1(v / 1e6) + " M";
const G = k => document.querySelector(`.grafico[data-g="${k}"]`);
const NAR = css("--celeste-fuerte"), FRI = css("--sol-fuerte"), GRIS = css("--faint");
const CENSO_FRASE = {agua_red: "tenía agua de red pública", cloaca: "tenía desagüe del inodoro a red cloacal", internet: "tenía internet en la vivienda",
  computadora: "tenía computadora, notebook o tableta", nbi: "tenía al menos una necesidad básica insatisfecha"};
function textoCenso(k) {
  const pais = nv.censo[k], [ta, tv] = nv.censo_top[k], [la, lv] = nv.censo_low[k];
  return (k === "sin_cobertura"
    ? `En el Censo 2022, el ${pct(pais)} de las personas del país no tenía obra social, prepaga ni plan estatal de salud, así que dependía solo del sistema público.`
    : `En el Censo 2022, el ${pct(pais)} de los hogares del país ${CENSO_FRASE[k]}.`) + ` El valor más alto fue el de ${ta} (${pct(tv)}) y el más bajo, el de ${la} (${pct(lv)}).`;
}
const DIB = {
  hogares: a => lineas(G("hogares"), {anim:a, data: T.energia_hogares, x:"anio", y0:80, ref:100, yf: v => v,
    series:[{k:"idx_residencial", lab:"Hogares", c:NAR, w:3}, {k:"idx_resto", lab:"Resto", c:FRI}], vf: v => n0(v)}),
  actividad: a => lineas(G("actividad"), {anim:a, data: T.energia_hogares, x:"anio", y0:80, ref:100, yf: v => v,
    series:[{k:"idx_demanda", lab:"Electricidad", c:NAR, w:3}, {k:"idx_emae", lab:"Actividad", c:GRIS}], vf: v => n0(v)}),
  meses: a => columnas(G("meses"), {anim:a, data: T.energia_estacionalidad}),
  nacimientos: a => {
    lineas(G("nacimientos"), {anim:a, data: T.nacimientos, x:"anio", y0:40, ref:100, refLab: `${T.nacimientos[0].anio} = 100`, yf: v => v, vf: n0,
      xl: d => `${d.anio}<br><span class="suave">Argentina: ${n0(d.nacimientos)} nacimientos${d.nacimientos_ocde ? `<br>OCDE: ${n1(d.nacimientos_ocde / 1e6)} millones` : ""}</span>`,
      series:[{k:"idx_argentina", lab:"Argentina", c:NAR, w:3}, {k:"idx_ocde", lab:"OCDE", c:css("--ocde"), w:2.6}]}); },
  envejecimiento: a => pesas(G("envejecimiento"), {anim:a, data: T.envejecimiento_provincias, a:"vejez_hoy", b:"vejez_2040", la: String(EV.anio), lb:"2040", vf: n1, af: v => v}),
  adolescentes: a => pesas(G("adolescentes"), {anim:a, data: T.madres_adolescentes_provincias, a:"pct_2012", b:"pct_2024", la:"2012", lb:"2024"}),
  mortalidad: a => pesas(G("mortalidad"), {anim:a, data: T.mortalidad_infantil_provincias, a:"tmi_base", b:"tmi_actual", la: mo.tri_base, lb: mo.tri_act,
    vf: n1, af: v => v, ref: OC.mortalidad_infantil.ocde, refLab: `Promedio OCDE ${OC.mortalidad_infantil.anio}: ${n1(OC.mortalidad_infantil.ocde)}`}),
  sube: a => lineas(G("sube"), {anim:a, data: T.sube_dia_habil, x:"t", y0:0, mensual:true, ref: su.pre_millones * 1e6,
    refLab: "Marzo de 2020, antes del aislamiento", refLabCorto: "Marzo de 2020", vf: v => n2(v / 1e6) + " M", yf: v => n1(v / 1e6) + " M",
    xl: d => { const [y, m] = d.periodo.split("-"); return `${MESES[+m - 1]} ${y}`; },
    series:[{k:"total", lab:"Tarjetas", c:NAR, w:2.4}]}),
  suicidio: a => lineas(G("suicidio"), {anim:a, data: T.suicidio_serie, x:"anio", y0:0, vf: n1, yf: v => v,
    series:[{k:"tasa_varones", lab:"Varones", c:NAR, w:2}, {k:"tasa", lab:"Total", c:css("--ink"), w:2.6}, {k:"tasa_mujeres", lab:"Mujeres", c:FRI, w:2}]}),
  "suicidio-prov": a => barrasH(G("suicidio-prov"), {anim:a, data: T.suicidio_provincias, k:"tasa", ref: R.suicidio.tasa, refLab:`País ${n1(R.suicidio.tasa)}`}),
  edad: a => piramide(G("edad"), {anim:a, data: T.suicidio_edad_sexo}),
  empresas: a => barrasH(G("empresas"), {anim:a, data: T.empresas_provincias, k:"cada_1000_hab", ref: EM.pais_1000,
    tip: d => `<b>${d.territorio}</b><br>${n1(d.cada_1000_hab)} cada 1.000 habitantes<br>${n0(d.empresas)} empresas con empleados`, refLab: `País ${n1(EM.pais_1000)}`}),
  dinamica: a => MED.dinamica === "pais"
    ? lineas(G("dinamica"), {anim:a, data: T.empresas_serie_pais, x:"anio", y0:0, vf: v => n1(v) + "%", yf: v => v + "%",
        series: [{k:"tasa_entrada", c: css("--celeste-fuerte"), lab:"Aperturas"}, {k:"tasa_salida", c: css("--sol-fuerte"), lab:"Cierres"}]})
    : barrasH(G("dinamica"), {anim:a, data: T.empresas_provincias, k:`tasa_neta_${EM.ult}`, vf: v => (v > 0 ? "+" : "") + n1(v) + "%", af: v => v + "%",
        ref: EM.neta, refLab: `País ${n1(EM.neta)}%`, color: d => d[`tasa_neta_${EM.ult}`] < 0 ? css("--sol") : css("--celeste")}),
  rotacion: a => barrasGrupos(G("rotacion"), {anim:a, data: T.rotacion_laboral.filter(d => d.dimension === MED.rotacion).sort((x, y) => x.orden - y.orden),
    k:"pct_un_anio_o_menos", ref: RO.total, refLab: `Total ${pct(RO.total)}`}),
  piramide: conTablas("piramide", ["piramide_poblacion"], a => piramidePob(G("piramide"), {anim:a, data: T.piramide_poblacion, cod: prov || "00", nombre: prov ? NOMBRES[prov] : "Total del país", anio: PI.anio})),
  jubilaciones: a => lineas(G("jubilaciones"), {anim:a, data: T.jubilaciones_aportantes, x:"anio", y0:0, vf: n2, yf: v => n1(v),
    series: [{k:"aportantes_por_beneficio", c: css("--celeste-fuerte"), lab:"Por beneficio"}], xl: d => d.mes ? `${MESES[d.mes - 1]} de ${d.anio}` : d.anio}),
  muertes: a => lineas(G("muertes"), {anim:a, data: T.muertes_violentas, x:"anio", y0:0,
    series:[{k:"suicidios", lab:"Suicidios", c:NAR, w:3}, {k:"siniestros_viales", lab:"Viales", c:FRI}, {k:"homicidios", lab:"Homicidios", c:GRIS},
      {k:"femicidios", lab:"Femicidios", c:css("--rojo"), w:2.4}]}),
  pisa: a => lineas(G("pisa"), {anim:a, data: T.pisa_argentina_ocde, x:"anio", y0:340, yf: v => v,
    series:[{k:`arg_${MED.pisa}_grafico`, lab:"Argentina", c:NAR, w:3}, {k:`ocde_${MED.pisa}`, lab:"Promedio OCDE", c:css("--ocde"), w:2.6}]}),
  escolarizacion: a => pesas(G("escolarizacion"), {anim:a, data: T.escolarizacion_secundaria_provincias, a:"tasa_inicio", b:"tasa_final",
    la: String(es.ini), lb: String(es.fin), x0: 50}),
  aprender: a => barrasH(G("aprender"), {anim:a, data: T.aprender_provincias, k:`${MED.aprender}_logra`,
    ref: MED.aprender === "mat" ? ap.mat : ap.len, refLab: `País ${pct(MED.aprender === "mat" ? ap.mat : ap.len)}`,
    vf: v => n1(v) + "%", af: v => v + "%"}),
  protegida: a => MED.protegida === "pct_territorio"
    ? barrasH(G("protegida"), {anim:a, data: T.areas_protegidas_provincias, k:"pct_territorio", ref: nt.pct, refLab:`País ${pct(nt.pct)}`,
        ref2: OC.protegida.ocde, ref2Lab: `Promedio OCDE ${pct(OC.protegida.ocde)}`, vf: v => n1(v) + "%", af: v => v + "%"})
    : barrasH(G("protegida"), {anim:a, data: T.areas_protegidas_provincias, k:"m2_por_habitante", ref: nt.m2_pais, refLab:`País ${n0(nt.m2_pais)} m²`,
        vf: v => n0(v) + " m²", af: v => n0(v)}),
  parques: a => lineas(G("parques"), {anim:a, data: T.parques_nacionales_historia, x:"anio", y0:0, escalones:true, vf: v => M(v) + " ha", yf: M,
    series:[{k:"ha_terrestres", lab:"Terrestres", c:NAR, w:3}, {k:"ha_marinas", lab:"Marinas", c:FRI, w:2.4}]}),
  especies: a => barrasH(G("especies"), {anim:a, data: T.especies_areas_nacionales, k:"animales", vf: n0, af: n0, l: 250, lAngosto: 170}),
  "sube-modos": a => lineas(G("sube-modos"), {anim:a, data: T.sube_dia_habil, x:"t", y0:0, mensual:true,
    ref: su.tren_pre_miles * 1e3, refLab: "Trenes, marzo de 2020", refLabCorto: "Trenes, marzo 2020",
    vf: v => n0(v / 1e3) + " mil", yf: v => n0(v / 1e3) + " mil",
    xl: d => { const [y, m] = d.periodo.split("-"); return `${MESES[+m - 1]} ${y}`; },
    series:[{k:"tren", lab:"Trenes", c:NAR, w:2.4}, {k:"subte", lab:"Subtes", c:FRI, w:2.4}]}),
  patentes: a => lineas(G("patentes"), {anim:a, data: T.patentamientos_anual, x:"anio", y0:0, vf: v => n0(v / 1e3) + " mil", yf: v => n0(v / 1e3) + " mil",
    series:[{k:"autos", lab:"Autos", c:NAR, w:3}, {k:"motos", lab:"Motos", c:FRI, w:2.4}]}),
  "patentes-prov": a => barrasH(G("patentes-prov"), {anim:a, data: T.patentamientos_provincias, k: MED["patentes-prov"],
    ref: MED["patentes-prov"] === "autos_1000" ? au.pais_1000 : au.motos_pais_1000,
    refLab: `País ${n1(MED["patentes-prov"] === "autos_1000" ? au.pais_1000 : au.motos_pais_1000)}`, vf: n1, af: n0}),
  visitas: a => lineas(G("visitas"), {anim:a, data: T.visitas_parques_nacionales, x:"anio", y0:0, vf: v => n2(v / 1e6) + " M", yf: M,
    series:[{k:"total", lab:"Total", c:css("--ink"), w:2.6}, {k:"residentes", lab:"Residentes", c:NAR, w:2.4}, {k:"no_residentes", lab:"No residentes", c:FRI, w:2.4}]}),
  receptivo: a => lineas(G("receptivo"), {anim:a, data: T.turistas_no_residentes_anual, x:"anio", y0:0, vf: v => n2(v / 1e6) + " M", yf: M,
    series:[{k:"turistas", lab:"Turistas", c:NAR, w:3}]}),
  hoteles: a => lineas(G("hoteles"), {anim:a, data: T.viajeros_hoteles_anual, x:"anio", y0:0, vf: v => n1(v / 1e6) + " M", yf: M,
    series:[{k:"residentes", lab:"Residentes", c:NAR, w:3}, {k:"no_residentes", lab:"No residentes", c:FRI, w:2.4}]}),
  eti: a => MED.eti === "cada_1000"
    ? barrasH(G("eti"), {anim:a, data: T.turistas_extranjeros_provincias, k:"cada_1000", vf: n1, af: n0})
    : barrasH(G("eti"), {anim:a, data: T.turistas_extranjeros_provincias, k:"turistas", vf: n0, af: v => n0(v / 1000) + " mil"}),
  pobreza: a => lineas(G("pobreza"), {anim:a, data: T.pobreza_serie, x:"t", y0:0, mensual:true, vf: v => n1(v) + "%", yf: v => v + "%",
    xl: d => `${d.semestre === 1 ? "Primer" : "Segundo"} semestre ${d.anio}`,
    series:[{k:"pobreza_personas", lab:"Pobreza", c:NAR, w:3}, {k:"indigencia_personas", lab:"Indigencia", c:FRI, w:2.4}]}),
  "mapa-areas": a => mapaAreas(a),
  "visitas-parque": a => barrasH(G("visitas-parque"), {anim:a, data: T.visitas_por_parque.filter(d => d[MED["visitas-parque"]] != null),
    k: MED["visitas-parque"], vf: n0, af: v => n0(v / 1000) + " mil", l: 270, lAngosto: 175}),
  pesca: a => lineas(G("pesca"), {anim:a, data: T.desembarques_especies, x:"anio", y0:0, vf: v => n0(v / 1000) + " mil t", yf: v => n0(v / 1000) + " mil",
    series: pe.top.map((k, i) => ({k, lab: k.replace(" argentino", "").replace(" argentina", ""), c: [NAR, FRI, GRIS][i], w: i ? 2.4 : 3}))}),
  "pesca-rio": a => barrasH(G("pesca-rio"), {anim:a, data: T.pesca_continental, k:"toneladas", vf: v => n0(v) + " t", af: n0}),
  nombres: a => {
    const cod = NOMBRES[prov] ? prov : "00";
    document.getElementById("contexto-nombres").textContent = `${NOMBRES[prov] || "Total del país"}, ${cu.nom_anio}. Diez nombres más frecuentes.`;
    barrasH(G("nombres"), {anim:a, data: T.nombres_top.filter(d => d.codigo_indec === cod && d.sexo === MED.nombres)
      .map(d => ({codigo_indec: d.nombre, territorio: d.nombre, cantidad: d.cantidad})), k:"cantidad", vf: n0, af: n0});
  },
  carne: a => lineas(G("carne"), {anim:a, data: T.carne_vacuna, x:"anio", y0:0, vf: v => n1(v) + " kg", yf: v => v + " kg",
    series:[{k:"kg_por_habitante", lab:"Carne vacuna", c:NAR, w:3}]}),
  vino: a => lineas(G("vino"), {anim:a, data: T.vino_mercado_interno, x:"anio", y0:0, vf: v => n0(v) + " M l", yf: v => n0(v) + " M",
    series:[{k:"millones_litros", lab:"Vino", c:NAR, w:3}]}),
  yerba: a => lineas(G("yerba"), {anim:a, data: T.yerba_molino, x:"anio", y0:0, vf: v => n1(v) + " M kg", yf: v => n0(v) + " M",
    series:[{k:"millones_kg", lab:"Yerba", c:NAR, w:3}]}),
  glaciares: a => barrasH(G("glaciares"), {anim:a, data: T.glaciares_provincias, k:"glaciares", vf: n0, af: n0}),
  clima: a => franjas(G("clima"), {anim:a, data: T.clima_desvio, k:"desvio_temperatura"}),
  esperanza: a => pesas(G("esperanza"), {anim:a, data: T.esperanza_vida_provincias, a:"varones", b:"mujeres", la:"Varones", lb:"Mujeres",
    vf: v => n1(v) + " años", af: v => v, x0: 66, ref: OC.esperanza_vida.ocde, refLab: `Promedio OCDE ${OC.esperanza_vida.anio}: ${n1(OC.esperanza_vida.ocde)}`}),
  exportaciones: a => barrasH(G("exportaciones"), {anim:a, data: T.exportaciones_provincias, k:"usd_por_habitante", ref: nv.ex_pc_pais,
    tip: d => `<b>${d.territorio}</b><br>${n0(d.usd_por_habitante)} US$ por habitante<br>${n0(d.millones_usd)} millones de US$ en total`,
    refLab: `País ${n0(nv.ex_pc_pais)}`, vf: v => n0(v) + " US$", af: n0}),
  fiscal: a => {
    const k = MED.fiscal, d = T.fiscal_provincias, fz = R.fiscal, ord = [...d].sort((p, q) => q[k] - p[k]);
    document.querySelector('[data-t="fiscal"]').textContent = k === "autonomia"
      ? `En ${fz.anio}, los recursos propios, sobre todo impuestos provinciales y regalías, fueron el ${pct(fz.top_v)} de los ingresos de ${fz.top} y el ${pct(fz.low_v)} de los de ${fz.low}. En la provincia del medio fueron el ${pct(fz.mediana)}, contra el ${pct(fz.mediana_ini)} en ${fz.ini}. El resto llega de la Nación, por coparticipación y otras transferencias.`
      : k === "resultado"
      ? `En ${fz.anio}, ${fz.superavit} provincias cerraron con superávit financiero y ${fz.deficit} con déficit. El mayor superávit, en proporción a sus ingresos, fue el de ${ord[0].territorio} (${sg(ord[0].resultado)}) y el mayor déficit el de ${ord[ord.length - 1].territorio} (${sg(ord[ord.length - 1].resultado)}).`
      : `En ${fz.anio}, los sueldos y cargas sociales fueron el ${pct(ord[0].personal)} del gasto de ${ord[0].territorio} y el ${pct(ord[ord.length - 1].personal)} del de ${ord[ord.length - 1].territorio}.`;
    barrasH(G("fiscal"), {anim:a, data: d, k, vf: v => (k === "resultado" && v > 0 ? "+" : "") + n1(v) + "%", af: v => v + "%",
      color: k === "resultado" ? (r => r.resultado < 0 ? css("--sol") : css("--celeste")) : null});
  },
  censo: a => {
    document.querySelector('[data-t="censo"]').textContent = textoCenso(MED.censo);
    barrasH(G("censo"), {anim:a, data: T.censo2022_provincias, k: MED.censo, ref: nv.censo[MED.censo], refLab: `País ${pct(nv.censo[MED.censo])}`,
      vf: v => n1(v) + "%", af: v => v + "%"});
  },
  internet: a => MED.internet === "mbps"
    ? barrasH(G("internet"), {anim:a, data: T.internet_fijo_provincias, k:"mbps", vf: v => n0(v) + " Mbps", af: n0})
    : barrasH(G("internet"), {anim:a, data: T.internet_fijo_provincias, k:"accesos_100_hogares", vf: n1, af: n0}),
  extranjeros: a => barrasH(G("extranjeros"), {anim:a, data: T.extranjeros_provincias, k:"cada_100", ref: nv.xt_pais, refLab: `País ${n1(nv.xt_pais)}`, vf: n1, af: n0}),
  empleo: a => MED.empleo === "cada_100"
    ? barrasH(G("empleo"), {anim:a, data: T.empleo_provincias, k:"cada_100", ref: R.empleo.cada_100_pais,
        tip: d => `<b>${d.territorio}</b><br>${n1(d.cada_100)} cada 100 habitantes<br>${n0(d.miles * 1000)} asalariados registrados<br>${n0(d.poblacion)} habitantes`, refLab:`País ${n1(R.empleo.cada_100_pais)}`})
    : barrasH(G("empleo"), {anim:a, data: T.empleo_provincias, k:"var_12m",
        tip: d => `<b>${d.territorio}</b><br>${n0(d.miles * 1000)} asalariados registrados<br>${n0(d.miles_hace12 * 1000)} doce meses antes`, vf: v => (v > 0 ? "+" : "") + n1(v) + "%", af: v => v + "%",
        color: d => d.var_12m < 0 ? css("--sol") : css("--celeste")}),
};

/* ---------- política ---------- */
const listaY = arr => arr.length > 1 ? arr.slice(0, -1).join(", ") + " y " + arr[arr.length - 1] : arr[0];
const ESP_COLOR = {"Peronismo": "#2C74B5", "UCR y aliados": "#D9453B", "PRO": "#F6B40E", "Cambiemos y Juntos por el Cambio": "#F08A24",
  "La Libertad Avanza": "#4A2C6F", "Izquierda": "#7A1F2B", "Fuerzas provinciales": "#74ACDF", "Otras fuerzas": "#98A2AE"};
const ESP_VARIANTE = {"Peronismo": ["#2C74B5", "#6FA3D8", "#A9CBEA"], "Otras fuerzas": ["#56606C", "#98A2AE", "#C3CAD2"]};
const ESP_TXT = {"Peronismo": "el peronismo", "UCR y aliados": "la UCR y sus aliados", "PRO": "el PRO",
  "Cambiemos y Juntos por el Cambio": "Cambiemos y Juntos por el Cambio", "La Libertad Avanza": "La Libertad Avanza",
  "Izquierda": "la izquierda", "Fuerzas provinciales": "las fuerzas provinciales", "Otras fuerzas": "otras fuerzas"};
const EL = Object.fromEntries(R.elecciones.map(e => [e.id, e]));
const nombreEl = e => `${e.anio}${e.vuelta === 0 ? ", PASO" : e.vuelta === 2 ? ", segunda vuelta" : e.anio === 2015 || e.anio === 2023 ? ", primera vuelta" : e.anio >= 2011 ? ", generales" : ""}`;
const nomListas = c => listaY(c.listas.map(l => `${l.n} (${pct(l.pct)})`));
MED.elecciones = R.elecciones[R.elecciones.length - 1].id;
document.getElementById("el-sel").innerHTML = [...R.elecciones].reverse().map(e => `<option value="${e.id}">${nombreEl(e)}</option>`).join("");
function clavesEl(e) {
  const usados = {};
  const cl = e.candidatos.map(c => {
    const i = usados[c.espacio] = (usados[c.espacio] ?? -1) + 1;
    const col = (ESP_VARIANTE[c.espacio] || [ESP_COLOR[c.espacio]])[Math.min(i, 2)] || ESP_COLOR[c.espacio];
    const paso = e.vuelta === 0;
    return {k: c.c, lab: paso ? c.fuerza : c.c, fuerza: paso ? listaY(c.listas.map(l => l.n)) : c.fuerza, c: col, texto: ["#F6B40E", "#F08A24", "#A9CBEA", "#C3CAD2", "#74ACDF", "#6FA3D8"].includes(col) ? "#18212B" : "#fff"};
  });
  const hayOtras = T.elecciones_presidenciales.some(d => d.eleccion === e.id && d.candidato === "Otras" && d.pct > 0);
  return hayOtras ? [...cl, {k: "Otras", lab: "Otras", c: "#E4E9EF", texto: "#18212B"}] : cl;
}
DIB.elecciones = conTablas("elecciones", ["elecciones_presidenciales"], a => {
  const e = EL[MED.elecciones], cl = clavesEl(e), filas = {};
  T.elecciones_presidenciales.filter(d => d.eleccion === e.id).forEach(d => {
    (filas[d.codigo_indec] ??= {codigo_indec: d.codigo_indec, territorio: d.territorio})[d.candidato] = d.pct; });
  const g0 = cl[0].k, pais = filas["00"];
  const resto = Object.values(filas).filter(d => d.codigo_indec !== "00").sort((p, q) => (q[g0] || 0) - (p[g0] || 0));
  const gan = e.candidatos.find(c => c.c === e.ganador);
  const intro = e.vuelta === 2 ? `En la segunda vuelta de ${e.anio}` : e.anio === 2015 || e.anio === 2023 ? `En la primera vuelta de ${e.anio}` : `En la elección de ${e.anio}`;
  const internas = e.candidatos.filter(c => c.listas.length > 1);
  document.querySelector('[data-t="elecciones"]').textContent = e.vuelta === 0
    ? `En las PASO de ${e.anio}, la agrupación más votada fue la de ${e.ganador} (${gan.fuerza}), con el ${pct(e.pct_ganador)} de los votos positivos del país, ` +
      `y fue la primera en ${e.prov_ganador} de las 24 jurisdicciones. Su porcentaje más alto fue el de ${e.max_prov} (${pct(e.max_v)}) y el más bajo, el de ${e.min_prov} (${pct(e.min_v)}). ` +
      (internas.length ? internas.map(c => `En ${c.fuerza} compitieron ${nomListas(c)}. `).join("") : "Ninguna de las cuatro agrupaciones más votadas tuvo interna. ") +
      `Votó el ${pct(e.participacion)} de los electores habilitados.` + (e.provisorio ? " Son datos del escrutinio provisorio." : "")
    : `${intro}, la fórmula de ${e.ganador} (${gan.fuerza}) obtuvo el ${pct(e.pct_ganador)} de los votos positivos del país ` +
    `y fue la más votada en ${e.prov_ganador} de las 24 jurisdicciones. Su porcentaje más alto fue el de ${e.max_prov} (${pct(e.max_v)}) y el más bajo, el de ${e.min_prov} (${pct(e.min_v)}). ` +
    `Votó el ${pct(e.participacion)} de los electores habilitados.` + (e.provisorio ? " Son datos del escrutinio provisorio." : "");
  document.getElementById("el-ley").innerHTML = cl.map(k => `<span><i style="background:${k.c}"></i><b>${k.lab}</b>${k.fuerza ? ` <small>${k.fuerza}</small>` : ""}</span>`).join("");
  apiladasH(G("elecciones"), {anim: a, data: [pais, ...resto], claves: cl});
});
MED.congreso = "Diputados";
const CG = R.congreso;
document.querySelector('[data-t="congreso-titulo"]').textContent = `Composición del Congreso por espacio político en cada período legislativo, 1983 a ${CG.anio + 2}`;
DIB.congreso = a => {
  const cam = MED.congreso, esp = CG.espacios, v = cam === "Diputados" ? CG.dip : CG.sen, n = cam === "Diputados" ? CG.n_dip : CG.n_sen;
  const ord = esp.filter(k => v[k]).sort((p, q) => v[q] - v[p]);
  document.querySelector('[data-t="congreso"]').textContent = cam === "Diputados"
    ? `Al ${CG.fecha}, en la Cámara de Diputados ${ESP_TXT[ord[0]]} tenía ${v[ord[0]]} de las ${n} bancas, ${ESP_TXT[ord[1]]} ${v[ord[1]]} y ${ESP_TXT[ord[2]]} ${v[ord[2]]}. El gráfico muestra el reparto al empezar cada período desde la vuelta de la democracia.`
    : `Al ${CG.fecha}, en el Senado ${ESP_TXT[ord[0]]} tenía ${v[ord[0]]} de las ${n} bancas, ${ESP_TXT[ord[1]]} ${v[ord[1]]} y ${ESP_TXT[ord[2]]} ${v[ord[2]]}.`;
  const filas = T.congreso_composicion.filter(d => d.camara === cam);
  const cl = esp.filter(k => filas.some(d => d[k] > 0)).map(k => ({k, lab: k, c: ESP_COLOR[k]}));
  document.getElementById("cg-ley").innerHTML = cl.map(k => `<span><i style="background:${k.c}"></i>${k.lab}</span>`).join("");
  columnasApiladas(G("congreso"), {anim: a, data: filas, claves: cl, cadaTick: 2});
};
document.getElementById("lg-sel").innerHTML = PROV.map(([c, nom]) => `<option value="${c}">${nom}</option>`).join("");
const LG_PER = CG.periodos, LG_ULT = LG_PER[LG_PER.length - 1];
document.getElementById("lg-per").innerHTML = [...LG_PER].reverse().map(a => `<option value="${a}">${a} a ${a + 2}${a === LG_ULT ? " (el actual)" : ""}</option>`).join("");
MED.legisladores = null; MED.lgPer = LG_ULT;
let LGP = null, lgCargando = null;
const lgCargar = () => lgCargando || (lgCargando = d3.json("datos/legisladores_por_periodo.json").then(j => { LGP = j; }));
["lg-sel", "lg-per"].forEach(id => document.getElementById(id).addEventListener("change", ev => {
  if (id === "lg-sel") MED.legisladores = ev.target.value; else MED.lgPer = +ev.target.value;
  DIB.legisladores();
}));
const lgMes = t => t === "sin fecha" ? "sin fecha" : `${MESES[+t.slice(5, 7) - 1]} de ${t.slice(0, 4)}`;
DIB.legisladores = () => {
  const c = MED.legisladores || prov || "02", per = MED.lgPer, el = G("legisladores");
  document.getElementById("lg-sel").value = c; document.getElementById("lg-per").value = per;
  if (!LGP) { el.innerHTML = '<p class="nota">Cargando la lista…</p>'; lgCargar().then(DIB.legisladores).catch(() => { el.innerHTML = '<p class="nota">No se pudo cargar la lista.</p>'; }); return; }
  // fila: [periodo, cámara, provincia, nombre, bloque, espacio, desde, hasta, a quién reemplaza]
  const F = LGP.filas.filter(f => f[0] === per && f[2] === c);
  const nom = i => { const n = LGP.nombres[i], k = n.indexOf(", "); return k < 0 ? n : `${n.slice(k + 2)} ${n.slice(0, k)}`; };
  const bancas = cam => {
    const filas = F.filter(f => f[1] === cam), sig = new Map(filas.filter(f => f[8] >= 0).map(f => [f[8], f]));
    return filas.filter(f => f[8] < 0).sort((p, q) => LGP.nombres[p[3]].localeCompare(LGP.nombres[q[3]], "es")).map(h => {
      const partes = [];
      let cur = h, n = 0;
      while (sig.has(cur[3]) && n++ < 8) {
        const s_ = sig.get(cur[3]);
        partes.push(`${cur[7] ? `hasta ${lgMes(cur[7])}, ` : ""}siguió ${nom(s_[3])}${s_[6] === "sin fecha" ? ", sin fecha de asunción" : s_[6] ? ` desde ${lgMes(s_[6])}` : ""}`);
        cur = s_;
      }
      if (cur[7]) partes.push(`hasta ${lgMes(cur[7])}`);
      return {h, texto: partes.length ? ` (${partes.join(", luego ")})` : "", cambios: n};
    });
  };
  const li = b => `<li><i style="background:${ESP_COLOR[LGP.espacios[b.h[5]]]}"></i><span>${nom(b.h[3])}${b.texto}</span>` +
    `<small>${LGP.bloques[b.h[4]]}${b.h[6] && b.h[6] !== "sin fecha" ? ` · desde ${lgMes(b.h[6])}` : ""}</small></li>`;
  const dip = bancas(0), sen = bancas(1);
  const cuenta = arr => CG.espacios.filter(k => arr.some(b => LGP.espacios[b.h[5]] === k))
    .map(k => `${arr.filter(b => LGP.espacios[b.h[5]] === k).length} de ${ESP_TXT[k]}`.replace(" de el ", " del "));
  const cambios = d3.sum([...dip, ...sen], b => b.cambios);
  document.querySelector('[data-t="legisladores"]').textContent = `En el período ${per} a ${per + 2}, ${NOMBRES[c]} ${per === LG_ULT ? "tiene" : "tuvo"} ` +
    `${dip.length} bancas de diputados y ${sen.length} de senadores nacionales. En Diputados: ${listaY(cuenta(dip))}. En el Senado: ${listaY(cuenta(sen))}. ` +
    (cambios ? `Hubo ${cambios === 1 ? "un cambio" : `${cambios} cambios`} de legislador ${per === LG_ULT ? "en lo que va del" : "durante el"} período, que ${cambios === 1 ? "figura" : "figuran"} entre paréntesis.`
      : `No hubo cambios de legisladores ${per === LG_ULT ? "en lo que va del" : "durante el"} período.`);
  el.innerHTML = `<div class="senado"><h4>Senado</h4><ul>${sen.map(li).join("")}</ul></div><div><h4>Diputados</h4><ul>${dip.map(li).join("")}</ul></div>`;
};




/* ---------- votaciones nominales en el Congreso ---------- */
const VT = R.votaciones, VT_LEY = Object.fromEntries(VT.leyes.map(l => [l.k, l]));
const VOTO_COL = ["", "#2C7A5B", "#C0504D", "#E3A92B", "#C3CAD2"], VOTO_LAB = ["", "A favor", "En contra", "Abstención", "Ausente"];
const ESP_CORTO = {"Peronismo": "Peronismo", "UCR y aliados": "UCR y aliados", "PRO": "PRO", "Cambiemos y Juntos por el Cambio": "Cambiemos y JxC",
  "La Libertad Avanza": "LLA", "Izquierda": "Izquierda", "Fuerzas provinciales": "Provinciales", "Otras fuerzas": "Otras"};
const fechaLarga = f => `${+f.slice(8, 10)} de ${MESES[+f.slice(5, 7) - 1]} de ${f.slice(0, 4)}`;
const ESP_PLURAL = new Set(["UCR y aliados", "Fuerzas provinciales", "Otras fuerzas"]);
const mayus = t => t.charAt(0).toUpperCase() + t.slice(1);
const deEsp = e => ("de " + ESP_TXT[e]).replace(/^de el /, "del ");
// postura de la mayoría de un espacio: [a favor, en contra, abstenciones, ausentes]
const postura = c => { const [si, no, ab, au] = c; return si + no + ab < au ? "aus" : si > no + ab ? "si" : no > si + ab ? "no" : "div"; };
const nomVt = n => { const t = w => w.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()).replace(/ (De|Del|La|Las|Los|Y) /g, m => m.toLowerCase());
  const k = n.indexOf(","); return k < 0 ? t(n) : `${t(n.slice(k + 1).trim())} ${t(n.slice(0, k))}`; };
function resumenEspacios(esp) {
  const gr = {si: [], no: [], div: [], aus: []};
  VT.espacios.filter(e => esp[e]).forEach(e => gr[postura(esp[e])].push(e));
  const plural = arr => arr.length > 1 || ESP_PLURAL.has(arr[0]);
  const txt = arr => listaY(arr.map(e => ESP_TXT[e])), verbo = arr => plural(arr) ? "votaron" : "votó";
  let s = gr.si.length && gr.no.length ? `En su mayoría, ${txt(gr.si)} ${verbo(gr.si)} a favor, y ${txt(gr.no)}, en contra.`
    : gr.si.length ? `En su mayoría, ${txt(gr.si)} ${verbo(gr.si)} a favor.` : gr.no.length ? `En su mayoría, ${txt(gr.no)} ${verbo(gr.no)} en contra.` : "";
  if (gr.div.length) s += ` ${mayus(txt(gr.div))} ${plural(gr.div) ? "se dividieron" : "se dividió"}.`;
  if (gr.aus.length) s += ` La mayoría de los legisladores ${listaY(gr.aus.map(deEsp))} no estuvo en la votación.`;
  return s.trim();
}
document.querySelector('[data-t="votaciones-titulo"]').textContent = `Cómo votó cada espacio político las leyes clave, ${VT.leyes[0].anio} a ${VT.leyes[VT.leyes.length - 1].anio}`;
document.getElementById("vt-sel").innerHTML = [...VT.leyes].reverse().map(l => `<option value="${l.k}">${l.anio}, ${l.nombre}</option>`).join("");
MED.vtLey = VT.leyes[VT.leyes.length - 1].k; MED.votaciones = "Diputados"; MED.vtmatriz = "Diputados";
let VTJ = null, vtCargando = null;
const vtCargar = () => vtCargando || (vtCargando = d3.json("datos/votaciones_leyes_clave.json").then(j => { VTJ = j; }));
const vtConm = (g, cam) => {  // pone el conmutador de una ficha en la cámara indicada
  const conm = document.querySelector(`.conmutador[data-g="${g}"]`);
  conm.querySelectorAll("button").forEach((b, i) => { const on = b.dataset.m === cam; b.setAttribute("aria-pressed", on); if (on) conm.style.setProperty("--i", i); });
};
document.getElementById("vt-sel").addEventListener("change", ev => { MED.vtLey = ev.target.value; DIB.votaciones(!REDUCIR); DIB.vtmatriz(false); });
function puntosVoto(el, cfg) {
  const w = Math.max(300, el.clientWidth), angosto = w < 560;
  const paso = cfg.senado ? (angosto ? 13 : 16) : (angosto ? 8.6 : 10.5), r = paso * .4;
  const labW = angosto ? 0 : 170, arriba = angosto ? 34 : 0, cols = Math.max(8, Math.floor((w - labW) / paso));
  let alto = 0;
  const lay = cfg.filas.map(f => { const y0 = alto; alto += arriba + Math.max(Math.ceil(f.v.length / cols) * paso, angosto ? 0 : 38) + 14; return {f, y0}; });
  const C = lienzo(el, alto, {t: 0, r: 0, b: 0, l: 0}), g = C.g;
  lay.forEach(({f, y0}, j) => {
    const cu = [1, 2, 3, 4].map(k => f.v.filter(x => x[4] === k).length);
    const det = [[0, "a favor"], [1, "en contra"], [2, cu[2] === 1 ? "abstención" : "abstenciones"], [3, cu[3] === 1 ? "ausente" : "ausentes"]].filter(([i]) => cu[i]).map(([i, t]) => `${cu[i]} ${t}`).join(", ");
    g.append("text").attr("class", "etq-fuerte").attr("x", 0).attr("y", y0 + 13).text(ESP_CORTO[f.e]);
    g.append("text").attr("class", "etq-suave").attr("x", 0).attr("y", y0 + 29).text(det);
    const pt = g.append("g").selectAll("circle").data(f.v).join("circle")
      .attr("cx", (d, i) => labW + (i % cols) * paso + paso / 2).attr("cy", (d, i) => y0 + arriba + Math.floor(i / cols) * paso + paso / 2).attr("r", r)
      .attr("fill", d => d[4] === 4 ? "none" : VOTO_COL[d[4]]).attr("stroke", d => d[3] === prov && prov ? css("--ink") : d[4] === 4 ? VOTO_COL[4] : "none")
      .attr("stroke-width", d => d[3] === prov && prov ? 2 : 1.2);
    pt.on("pointerenter", function(ev, d) {
      mostrarTip(el, `<b>${nomVt(VTJ.nombres[d[0]])}</b><br>${VTJ.bloques[d[1]]}<br>${NOMBRES[d[3]] || "Sin provincia"}<br>${VOTO_LAB[d[4]]}`, +this.getAttribute("cx"), +this.getAttribute("cy"));
    }).on("pointerleave", ocultarTip);
    if (cfg.anim) pt.attr("opacity", 0).transition().delay(j * 90).duration(300).attr("opacity", 1);
  });
}
DIB.votaciones = a => {
  const L = VT_LEY[MED.vtLey], cam = MED.votaciones, C = L.camaras[cam], el = G("votaciones");
  document.getElementById("vt-sel").value = L.k;
  const t = C ? C.total : null, en = cam === "Diputados" ? "En Diputados" : "En el Senado";
  const base = `${L.que} ` + (C
    ? `${en}, el ${fechaLarga(C.fecha)}, votaron ${t.si} a favor y ${t.no} en contra` + (t.abs ? `, hubo ${t.abs} ${t.abs === 1 ? "abstención" : "abstenciones"}` : "") +
      (t.aus ? ` y ${t.aus} ${t.aus === 1 ? "legislador no estuvo" : "legisladores no estuvieron"}.` : " y no faltó nadie.") + ` ${resumenEspacios(C.espacios)} `
    : `El Senado no publica el acta con el voto de cada senador de esta ley. `) + L.desenlace;
  const lead = document.querySelector('[data-t="votaciones"]');
  lead.textContent = base;
  document.getElementById("vt-ley").innerHTML = [1, 2, 3, 4].map(k => `<span><i style="${k === 4 ? `border:1.5px solid ${VOTO_COL[4]};border-radius:50%;box-sizing:border-box` : `background:${VOTO_COL[k]};border-radius:50%`}"></i>${VOTO_LAB[k]}</span>`).join("") +
    (prov ? `<span><i style="border:2px solid var(--ink);border-radius:50%;box-sizing:border-box"></i>${NOMBRES[prov]}</span>` : "");
  if (!C) { el.innerHTML = `<p class="nota">El Senado no publica el acta con el voto de cada senador de esta votación. Elegí Diputados para verla.</p>`; return; }
  if (!VTJ) { el.innerHTML = '<p class="nota">Cargando los votos…</p>'; vtCargar().then(() => DIB.votaciones(a)).catch(() => { el.innerHTML = '<p class="nota">No se pudieron cargar los votos.</p>'; }); return; }
  const V = VTJ.votos[`${L.k}|${cam}`];
  const filas = VT.espacios.map((e, i) => ({e, v: V.filter(x => x[2] === i).sort((p, q) => p[4] - q[4] || VTJ.nombres[p[0]].localeCompare(VTJ.nombres[q[0]], "es"))})).filter(f => f.v.length);
  if (prov) {
    const mio = V.filter(x => x[3] === prov), cu = [1, 2, 3, 4].map(k => mio.filter(x => x[4] === k).length);
    const fr = [[0, "votó a favor", "votaron a favor"], [1, "votó en contra", "votaron en contra"], [2, "se abstuvo", "se abstuvieron"], [3, "no estuvo", "no estuvieron"]]
      .filter(([i]) => cu[i]).map(([i, s1, s2]) => `${cu[i]} ${cu[i] === 1 ? s1 : s2}`);
    if (mio.length) lead.textContent = base + ` De ${mio.length === 1 ? "el legislador" : `los ${mio.length} ${cam === "Diputados" ? "diputados" : "senadores"}`} de ${NOMBRES[prov]}, ${listaY(fr)}.`.replace("De el ", "Del ");
  }
  puntosVoto(el, {anim: a, filas, senado: cam === "Senado"});
};
// Plataformas electorales nacionales 2023 presentadas ante la Justicia Nacional Electoral (Cámara Nacional Electoral).
// Solo los espacios con una plataforma nacional inequívoca: la UCR y el PRO la presentaron juntos dentro de Juntos por el Cambio.
const CNE_2023 = "https://www.electoral.gob.ar/nuevo/paginas/pdf/plataformas/2023/GENERALES/";
const PLATAFORMA_2023 = {
  "Peronismo": ["Unión por la Patria", "ON 134 UNION POR LA PATRIA PLATAFORMA.pdf"],
  "La Libertad Avanza": ["La Libertad Avanza", "ON 135 LA LIBERTAD AVANZA PLATAFORMA.pdf"],
  "PRO": ["Juntos por el Cambio", "ON 132 JUNTOS POR EL CAMBIO.pdf"],
  "UCR y aliados": ["Juntos por el Cambio", "ON 132 JUNTOS POR EL CAMBIO.pdf"],
  "Cambiemos y Juntos por el Cambio": ["Juntos por el Cambio", "ON 132 JUNTOS POR EL CAMBIO.pdf"],
  "Izquierda": ["Frente de Izquierda y de Trabajadores Unidad", "ON 136 FRENTE DE IZQUIERDA Y DE TRABAJADORES - UNIDAD PLATAFORMA.pdf"],
};
const plataformaCelda = e => {
  const pl = PLATAFORMA_2023[e];
  return pl ? `<td class="plat"><a href="${CNE_2023 + encodeURIComponent(pl[1])}" target="_blank" rel="noopener" title="Plataforma de ${pl[0]}, elecciones 2023">PDF</a></td>` : `<td class="sin">·</td>`;
};
DIB.vtmatriz = a => {
  const cam = MED.vtmatriz, el = G("vtmatriz");
  const leyes = VT.leyes.filter(l => l.camaras[cam]);
  const esp = VT.espacios.filter(e => leyes.filter(l => d3.sum(l.camaras[cam].espacios[e] || []) >= 3).length >= 3);
  const col = d3.scaleLinear().domain([0, 50, 100]).range([VOTO_COL[2], "#EEF1F4", VOTO_COL[1]]);
  const celda = (l, e) => {
    const c = l.camaras[cam] && l.camaras[cam].espacios[e];
    if (!l.camaras[cam]) return "";
    if (!c || !d3.sum(c)) return `<td class="sin">·</td>`;
    const tit = `${e}: ${c[0]} a favor, ${c[1]} en contra, ${c[2]} abstenciones y ${c[3]} ausentes`;
    if (postura(c) === "aus") return `<td class="sin" title="${tit}">aus.</td>`;
    const p = c[0] / (c[0] + c[1] + c[2]) * 100, fondo = col(p);
    return `<td title="${tit}" style="background:${fondo};color:${Math.abs(p - 50) > 30 ? "#fff" : "#18212B"}">${Math.round(p)}</td>`;
  };
  el.innerHTML = `<table><thead><tr><th>Ley</th>${esp.map(e => `<th>${ESP_CORTO[e]}</th>`).join("")}</tr></thead><tbody>` +
    [...VT.leyes].reverse().map(l => `<tr role="button" tabindex="0" data-k="${l.k}"${l.k === MED.vtLey ? ' class="elegida"' : ""}><td class="ley">${l.nombre}<small>${l.camaras[cam] ? l.camaras[cam].fecha.slice(0, 4) : l.anio}</small></td>` +
      (l.camaras[cam] ? esp.map(e => celda(l, e)).join("") : `<td class="sin" colspan="${esp.length}">El Senado no publica el acta nominal</td>`) + "</tr>").join("") + "</tbody>" +
    `<tfoot><tr><td class="ley">Plataforma 2023<small>qué propuso</small></td>${esp.map(plataformaCelda).join("")}</tr></tfoot></table>`;
  el.querySelectorAll("tr[data-k]").forEach(tr => {
    const ir = () => {
      MED.vtLey = tr.dataset.k; MED.votaciones = VT_LEY[tr.dataset.k].camaras[cam] ? cam : "Diputados"; vtConm("votaciones", MED.votaciones);
      DIB.votaciones(!REDUCIR); DIB.vtmatriz(false);
      document.getElementById("f-votaciones").scrollIntoView({behavior: REDUCIR ? "auto" : "smooth", block: "start"});
    };
    tr.addEventListener("click", ir); tr.addEventListener("keydown", ev => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); ir(); } });
  });
  // coincidencias entre espacios: leyes en que la mayoría de los dos votó igual
  const pares = [];
  esp.forEach((e1, i) => esp.slice(i + 1).forEach(e2 => {
    let n = 0, igual = 0;
    leyes.forEach(l => { const c1 = l.camaras[cam].espacios[e1], c2 = l.camaras[cam].espacios[e2];
      if (!c1 || !c2) return; const p1 = postura(c1), p2 = postura(c2);
      if ((p1 === "si" || p1 === "no") && (p2 === "si" || p2 === "no")) { n++; if (p1 === p2) igual++; } });
    if (n >= 6) pares.push({e1, e2, n, igual, f: igual / n});
  }));
  pares.sort((p, q) => q.f - p.f || q.n - p.n);
  const mas = pares[0], menos = pares[pares.length - 1];
  document.querySelector('[data-t="vtm"]').textContent = `${cam === "Diputados" ? "En Diputados" : "En el Senado"} hay acta nominal de ${leyes.length} de las ${VT.leyes.length} leyes clave. ` +
    (mas ? `Contando la postura de la mayoría de cada espacio, ${ESP_TXT[mas.e1]} y ${ESP_TXT[mas.e2]} votaron igual en ${mas.igual} de las ${mas.n} leyes en que los dos tomaron posición, ` +
      `y ${ESP_TXT[menos.e1]} y ${ESP_TXT[menos.e2]} votaron distinto en ${menos.n - menos.igual} de ${menos.n}. ` : "") + `Tocá una ley para ver el voto de cada legislador.`;
};
document.querySelector('[data-t="vtm-titulo"]').textContent = `Leyes clave: qué parte de cada espacio político votó a favor, ${VT.leyes[0].anio} a ${VT.leyes[VT.leyes.length - 1].anio}`;
const AP = VT.apoyo, AP_A = Object.fromEntries(AP.anios.map(x => [x.anio, x]));
MED.apoyo = "atn_hab"; MED.apAnio = AP.hasta;
document.getElementById("ap-sel").innerHTML = [...AP.anios].reverse().map(x => `<option value="${x.anio}">${x.anio} (${x.presidente})</option>`).join("");
document.getElementById("ap-sel").addEventListener("change", ev => { MED.apAnio = +ev.target.value; DIB.apoyo(!REDUCIR); });
document.querySelector('[data-t="apoyo-titulo"]').textContent = `Apoyo al gobierno de los legisladores de cada provincia y transferencias discrecionales, ${AP.desde} a ${AP.hasta}`;
DIB.apoyo = conTablas("apoyo", ["apoyo_gobierno_provincias"], a => {
  const y = MED.apAnio, A = AP_A[y], k = MED.apoyo, rr = x => k === "atn_hab" ? x.r_atn : x.r_otras, r = rr(A);
  const nomT = k === "atn_hab" ? "los ATN" : "las otras transferencias no automáticas";
  const serie = AP.anios.filter(x => rr(x) != null), pos = serie.filter(x => rr(x) >= .4).map(x => String(x.anio)), neg = serie.filter(x => rr(x) <= -.4).map(x => String(x.anio));
  document.getElementById("ap-sel").value = y;
  document.querySelector('[data-t="apoyo"]').textContent = `En ${y}, con ${A.presidente} en la presidencia, hubo ${A.votaciones} votaciones divididas en el Congreso. ` +
    `Los diputados y senadores de ${A.max} que no eran del bloque oficialista votaron como ese bloque en el ${pct(A.max_v)} de los casos, y los de ${A.min}, en el ${pct(A.min_v)}. ` +
    (r == null ? `Ese año solo ${A.n_atn} provincias recibieron ATN, muy pocas para medir una relación. `
      : `La relación entre ese apoyo y ${nomT} por habitante fue ${fuerza(r)} (correlación de ${n2(r)})` + (k === "atn_hab" && A.n_atn < 24 ? `, con ${A.n_atn} provincias que recibieron ATN` : "") + `. `) +
    `Entre ${AP.desde} y ${AP.hasta}, la relación fue positiva y al menos moderada, es decir que las provincias que más acompañaron recibieron más, en ` +
    (pos.length ? `${pos.length === 1 ? "un año" : `${pos.length} años`} (${listaY(pos)})` : "ningún año") +
    (neg.length ? `, y fue al revés en ${listaY(neg)}.` : `, y en ningún año fue al revés.`);
  dispersion(G("apoyo"), {anim: a, data: T.apoyo_gobierno_provincias.filter(d => d.anio === y), x: k, y: "apoyo",
    xLab: `${k === "atn_hab" ? "ATN" : "Otras no automáticas"} por habitante, pesos de ${TRR.ult}`, yLab: "Votos como el bloque oficialista",
    fx: v => n0(v), vx: v => n0(v) + " pesos"});
});

document.querySelector('[data-t="votaciones-nota"]').textContent = `Votación en general de cada ley en cada cámara, según el acta de votación nominal. Cada punto es un legislador: pasá el cursor o tocá un punto para ver quién es. ` +
    `Ausente incluye a quien estaba en la sesión pero no votó. Quien preside la sesión solo vota si hay empate y no figura en el acta. ` +
    `El espacio de cada legislador sale del bloque que registra el acta, con la misma clasificación que la composición del Congreso, pero el PRO y la UCR siempre van por separado. ` +
    `La selección de leyes es propia: leyes muy debatidas o con efectos amplios, de todos los gobiernos desde ${R.votaciones.leyes[0].anio}. ` +
    `El Senado no publica el acta nominal de ${listaY(R.votaciones.leyes.filter(l => !l.camaras.Senado).map(l => `${l.nombre.charAt(0).toLowerCase() + l.nombre.slice(1)} de ${l.anio}`))}. ` +
    `Las actas salen de la copia de los sitios oficiales que mantiene el proyecto abierto ¿Cómo Votó?, de Rodrigo Quiroga, con ${n0(R.votaciones.n_dip)} votaciones de Diputados desde ${R.votaciones.dip_desde} y ${n0(R.votaciones.n_sen)} del Senado desde ${R.votaciones.sen_desde}, hasta el ${fechaLarga(R.votaciones.ult)}. ` +
    `Se cotejaron con los datos abiertos de la Cámara de Diputados (todas las actas de 2011 a 2019) y con el sitio del Senado (todas las de estas leyes y una muestra), sin diferencias.`;
/* voto de los legisladores y voto de su provincia al presidente */
const RV = R.votaciones.representacion.filter(g => g.r != null);
const rvClave = g => g.presidente + "|" + g.eleccion;
const rvNombre = g => `${g.presidente}, ${g.anios[0] === g.anios[1] ? g.anios[0] : g.anios[0] + " a " + g.anios[1]} (elección ${g.eleccion})`;
const rvSel = document.getElementById("vprov-sel");
rvSel.innerHTML = RV.map(g => `<option value="${rvClave(g)}">${rvNombre(g)}</option>`).join("");
MED.vprov = rvClave(RV[RV.length - 1]); rvSel.value = MED.vprov;
const rvFuerza = r => Math.abs(r) < .2 ? "casi nula" : Math.abs(r) < .4 ? "débil" : Math.abs(r) < .6 ? "moderada" : "fuerte";
document.querySelector('[data-t="vprov-titulo"]').textContent = `Voto de los legisladores en las leyes clave y voto de su provincia al presidente, ${RV[0].anios[0]} a ${RV[RV.length - 1].anios[1]}`;
document.querySelector('[data-t="vprov"]').textContent =
  `En las leyes clave de cada gobierno, la correlación de Spearman entre el voto al presidente en la primera vuelta y la coincidencia de los legisladores de cada provincia con el bloque oficialista fue ` +
  RV.map(g => `${n2(g.r).replace("-", "menos ")} con ${g.presidente} (${g.leyes} ${g.leyes === 1 ? "ley" : "leyes"} entre ${g.anios[0]} y ${g.anios[1]}, ${rvFuerza(g.r)})`).join(", ") + ".";
DIB.vprov = a => {
  const g = RV.find(x => rvClave(x) === MED.vprov);
  dispersion(G("vprov"), {anim: a, data: T.voto_legisladores_y_provincia.filter(d => d.presidente === g.presidente && d.eleccion === g.eleccion),
    x: "pct_presidente", y: "pct_coincide", xLab: `Votos de ${g.presidente} en la primera vuelta de ${g.eleccion}`, yLab: "Votos de sus legisladores que coincidieron con el oficialismo"});
};
document.querySelector('[data-t="vprov-nota"]').textContent = `Cada punto es una provincia. El eje horizontal es el porcentaje de votos positivos que sacó el presidente en esa provincia en la primera vuelta de la elección que lo llevó al gobierno. ` +
  `El vertical, el porcentaje de los votos de sus diputados y senadores presentes que coincidió con la posición del bloque oficialista en las leyes clave de ese gobierno, contando también a los del propio bloque oficialista. ` +
  `Los legisladores fueron elegidos en distintos años, no solo en esa elección, y con pocas leyes por gobierno el resultado es frágil. La correlación de Spearman compara el orden de las provincias en las dos medidas: no prueba que un voto explique el otro.`;
document.querySelector('[data-t="vtm-nota"]').textContent = `Cada celda muestra el porcentaje de los legisladores presentes de ese espacio que votó a favor en la votación en general: verde es a favor y rojo, en contra. ` +
    `"aus." indica que la mayoría del espacio no estuvo en la votación y el punto, que el espacio no tenía legisladores en esa cámara o tenía menos de tres. ` +
    `En la comparación entre espacios, un espacio toma posición en una ley cuando más de la mitad de sus presentes votó lo mismo. Espacios con legisladores en al menos tres de estas votaciones. ` +
    `La última fila enlaza la plataforma electoral nacional que cada alianza presentó ante la Justicia Nacional Electoral para las elecciones de 2023, publicada por la Cámara Nacional Electoral: lo que cada espacio propuso, junto a lo que votó. ` +
    `La UCR y el PRO la presentaron juntos, dentro de Juntos por el Cambio. Las fuerzas provinciales y las otras fuerzas no tienen una plataforma nacional única.`;
document.querySelector('[data-t="apoyo-nota"]').textContent = `En cada votación dividida, aquella en la que al menos una cuarta parte de los presentes votó distinto que el bloque oficialista, se mira si cada diputado y senador de otro bloque votó igual que él. ` +
    `El porcentaje suma las dos cámaras y todas las votaciones divididas del año, no solo las leyes clave. El bloque oficialista es el más numeroso del espacio del presidente en cada cámara. ` +
    `Transferencias por habitante del mismo año, en pesos de ${R.transferencias.ult}. La correlación es la de rangos de Spearman entre las 24 jurisdicciones, de menos 1 a 1: cerca de 0 no hay relación. ` +
    `No se calcula para los ATN cuando los recibieron menos de 8 provincias. Que dos cosas vayan juntas no prueba que una cause la otra: las provincias gobernadas por aliados del gobierno suelen tener legisladores que lo acompañan y también más acceso a esos fondos.`;

/* ---------- por qué: dispersión simple entre dos variables provinciales ---------- */
function dispersion(el, cfg) {
  const data = cfg.data.filter(d => d[cfg.x] != null && d[cfg.y] != null), angosto = el.clientWidth < 520;
  const C = lienzo(el, angosto ? 320 : 380, {t:34, r:16, b:44, l:46});
  const {g, iw, ih} = C;
  const x = d3.scaleLinear().domain(d3.extent(data, d => d[cfg.x])).nice().range([8, iw]);
  const y = d3.scaleLinear().domain(cfg.yAuto ? d3.extent(data, d => d[cfg.y]) : [0, d3.max(data, d => d[cfg.y])]).nice().range([ih, 0]);
  g.append("g").attr("class","grilla").call(d3.axisLeft(y).ticks(5).tickSize(-iw).tickFormat("")).call(a => a.select(".domain").remove());
  const fx = cfg.fx || (v => v + "%"), fy = cfg.fy || (v => v + "%"), vx = cfg.vx || pct, vy = cfg.vy || pct;
  g.append("g").attr("class","eje").call(d3.axisLeft(y).ticks(5).tickSize(0).tickPadding(6).tickFormat(fy)).call(a => a.select(".domain").remove());
  g.append("g").attr("class","eje").attr("transform",`translate(0,${ih})`).call(d3.axisBottom(x).ticks(angosto ? 4 : 6).tickSize(0).tickPadding(8).tickFormat(fx)).call(a => a.select(".domain").remove());
  g.append("text").attr("class","etq-suave").attr("x", iw).attr("y", ih + 38).attr("text-anchor","end").text(cfg.xLab);
  g.append("text").attr("class","etq-suave").attr("x", -40).attr("y", -20).text(cfg.yLab);
  // recta de mínimos cuadrados, solo como guía visual
  const mx = d3.mean(data, d => d[cfg.x]), my = d3.mean(data, d => d[cfg.y]);
  const b = d3.sum(data, d => (d[cfg.x] - mx) * (d[cfg.y] - my)) / d3.sum(data, d => (d[cfg.x] - mx) ** 2), a0 = my - b * mx;
  const [x0, x1] = x.domain();
  g.append("line").attr("x1", x(x0)).attr("x2", x(x1)).attr("y1", y(a0 + b * x0)).attr("y2", y(a0 + b * x1)).attr("stroke", css("--muted")).attr("stroke-dasharray","4 4");
  const orden = [...data].sort((p, q) => q[cfg.y] - p[cfg.y]);
  const etiq = new Set([...orden.slice(0, 3), ...orden.slice(-3)].map(d => d.codigo_indec).concat(prov ? [prov] : [], cfg.marcar || []));
  const pt = g.selectAll("circle").data(data).join("circle").attr("cx", d => x(d[cfg.x])).attr("cy", d => y(d[cfg.y])).attr("r", 5.5)
    .attr("fill", d => d.codigo_indec === prov ? css("--celeste-fuerte") : css("--celeste")).attr("stroke", "#fff");
  // etiquetas sin superponerse: la provincia elegida primero, después las de los extremos
  const puestas = [], conLab = data.filter(d => etiq.has(d.codigo_indec)).sort((p, q) => (q.codigo_indec === prov) - (p.codigo_indec === prov)).filter(d => {
    const px = x(d[cfg.x]), py = y(d[cfg.y]);
    if (puestas.some(([qx, qy]) => Math.abs(qx - px) < 90 && Math.abs(qy - py) < 13)) return false;
    puestas.push([px, py]); return true;
  });
  g.selectAll("text.lab").data(conLab).join("text").attr("class", d => d.codigo_indec === prov ? "etq-fuerte lab" : "etq lab")
    .attr("x", d => x(d[cfg.x]) + (x(d[cfg.x]) > iw * .8 ? -8 : 8)).attr("text-anchor", d => x(d[cfg.x]) > iw * .8 ? "end" : "start")
    .attr("y", d => y(d[cfg.y]) + 4).text(d => d.territorio);
  if (cfg.anim) pt.attr("r", 0).transition().delay((d, i) => i * 20).duration(400).attr("r", 5.5);
  pt.on("pointerenter", (ev, d) => mostrarTip(el, `<b>${d.territorio}</b><br>${cfg.xLab}: ${vx(d[cfg.x])}<br>${cfg.yLab}: ${vy(d[cfg.y])}`, 46 + x(d[cfg.x]), 34 + y(d[cfg.y])))
    .on("pointerleave", ocultarTip);
}
const fuerza = r => Math.abs(r) >= .7 ? "fuerte" : Math.abs(r) >= .4 ? "moderada" : "débil";
const AN = R.ado_nse, MC = R.mi_causas;
document.getElementById("adonse-sel").innerHTML = AN.indicadores.map(i => `<option value="${i.k}">${i.lab}</option>`).join("");
MED.adonse = AN.indicadores[0].k;
document.getElementById("adonse-sel").addEventListener("change", ev => { MED.adonse = ev.target.value; DIB.adonse(!REDUCIR); });
DIB.adonse = a => {
  const i = AN.indicadores.find(x => x.k === MED.adonse), otros = AN.indicadores.filter(x => x !== i);
  const rel = x => `${fuerza(x.r)}${x.r < 0 ? " e inversa" : ""}`;
  document.querySelector('[data-t="adonse"]').textContent = `Las provincias con más nacimientos de madres menores de 20 años suelen ser también las de peores indicadores socioeconómicos. ` +
    `Con ${i.lab.toLowerCase()} la relación es ${rel(i)} (correlación de ${n2(i.r)}): donde ese indicador es más alto, la proporción de madres adolescentes tiende a ser ${i.r > 0 ? "más alta" : "más baja"}. ` +
    `Con los otros indicadores del Censo, la relación es ${listaY(otros.map(o => `${rel(o)} con ${o.lab.toLowerCase()} (${n2(o.r)})`))}.`;
  dispersion(G("adonse"), {anim: a, data: T.madres_adolescentes_nse, x: i.k, y: "pct_2024", xLab: `${i.lab}, 2022`, yLab: `Nacimientos de madres menores de 20, ${AN.anio}`});
};
const CAUSA_COL = {perinatales: "#2C74B5", malformaciones: "#74ACDF", respiratorias: "#F6B40E", infecciosas: "#D9453B", externas: "#7A1F2B", mal_definidas: "#C3CAD2", otras: "#E4E9EF"};
DIB.causas = a => {
  const gr = MC.grupos, gk = Object.fromEntries(gr.map(x => [x.k, x]));
  const vida = ["respiratorias", "infecciosas", "externas"], sumaVida = d3.sum(vida, k => gk[k].pct);
  const fuertes = gr.filter(x => Math.abs(x.r_cobertura) >= .4).sort((p, q) => q.r_cobertura - p.r_cobertura);
  document.querySelector('[data-t="causas"]').textContent = `Entre ${MC.anios[0]} y ${MC.anios[1]} murieron en el país ${n0(MC.muertes)} bebés antes de cumplir un año. ` +
    `El ${pct(gk.perinatales.pct)} por afecciones perinatales, como la prematurez y las complicaciones del embarazo y el parto, y el ${pct(gk.malformaciones.pct)} por malformaciones congénitas. ` +
    `Las enfermedades respiratorias, las infecciosas y las causas externas, que suelen estar más ligadas a las condiciones de vida, sumaron el ${pct(sumaVida)}. ` +
    (fuertes.length ? `En las provincias con más población sin obra social ni prepaga, la mortalidad por ${listaY(fuertes.map(x => `${x.lab.toLowerCase()} (correlación de ${n2(x.r_cobertura)})`))} tiende a ser más alta.` : "");
  const cl = gr.map(x => ({k: x.k, lab: x.lab, c: CAUSA_COL[x.k], texto: ["#F6B40E", "#74ACDF", "#C3CAD2", "#E4E9EF"].includes(CAUSA_COL[x.k]) ? "#18212B" : "#fff"}));
  document.getElementById("causas-ley").innerHTML = cl.map(k => `<span><i style="background:${k.c}"></i>${k.lab}</span>`).join("");
  const filas = T.mortalidad_infantil_causas, pais = filas.find(d => d.codigo_indec === "00");
  apiladasH(G("causas"), {anim: a, claves: cl, data: [pais, ...filas.filter(d => d.codigo_indec !== "00").sort((p, q) => q.tasa - p.tasa)]});
};

/* ---------- transferencias de la Nación a las provincias ---------- */
const TRR = R.transferencias, TRS = T.transferencias_serie, TRA = T.transferencias_acumulado;
const milM = v => v >= 1000 ? `${n1(v / 1000)} billones` : `${v >= 10 ? n0(v) : n1(v)} mil millones`;
const TR_COL = {atn: "#2C74B5", otras: "#74ACDF", ley: "#C3CAD2"};
const TR_LAB = {atn: "ATN", otras: "Otras no automáticas", ley: "Por ley o por fallo"};
const trOpciones = sel => { document.getElementById(sel).innerHTML = [`<option value="serie">Total del país por año</option>`, `<option value="acum">Por provincia, suma de ${TRR.desde} a ${TRR.ult}</option>`,
  ...d3.range(TRR.ult, TRR.desde - 1, -1).map(a => `<option value="${a}">Por provincia, ${a}</option>`)].join(""); };
trOpciones("atn-sel"); trOpciones("tr-sel");
MED.atn = "serie"; MED.transferencias = String(TRR.ult);
["atn", "tr"].forEach(id => document.getElementById(`${id}-sel`).addEventListener("change", ev => {
  const g = id === "atn" ? "atn" : "transferencias"; MED[g] = ev.target.value; DIB[g](!REDUCIR); }));
document.querySelector('[data-t="atn-titulo"]').textContent = `Aportes del Tesoro Nacional (ATN) a las provincias, ${TRR.desde} a ${TRR.ult}`;
document.querySelector('[data-t="transferencias-titulo"]').textContent = `Transferencias no automáticas de la Nación a las provincias, ${TRR.desde} a ${TRR.ult}`;
document.querySelector('[data-t="atn-nota"]').textContent = `Pesos de ${TRR.ult}, ajustados por el deflactor del PBI. Crédito devengado del presupuesto nacional, con la provincia de destino. Incluye los ATN a provincias y municipios. ` +
  `Los ATN salen del Fondo de Aportes del Tesoro Nacional, que se forma con parte de la coparticipación y que el gobierno nacional reparte sin fórmula. Desde 2017 el presupuesto los identifica como actividad propia. ` +
  `Entre 2002 y 2016 se toman los del programa de asistencia financiera a provincias del Ministerio del Interior financiados con ese fondo. Antes de 2000 casi todos figuran sin provincia, por eso la serie empieza ese año. ` +
  `Por habitante con las proyecciones de población del INDEC de cada año. La suma del período es la suma de lo recibido por habitante en cada año.`;
document.querySelector('[data-t="transferencias-nota"]').textContent = `Pesos de ${TRR.ult}, ajustados por el deflactor del PBI. Crédito devengado del presupuesto nacional en transferencias corrientes y de capital a gobiernos provinciales y municipales, con la provincia de destino. ` +
  `No incluye la coparticipación ni las demás transferencias automáticas, que no pasan por el presupuesto. Se separan las fijadas por ley o por fallo judicial: coparticipación de la Ciudad y de Tierra del Fuego cuando pasaba por el presupuesto, Fondo Federal Solidario, ` +
  `Fondo Nacional de Incentivo Docente, devolución del 15% de la coparticipación, policía de la Ciudad y cautelar de la Corte Suprema a favor de la Ciudad. Las otras no automáticas incluyen obras, vivienda, programas sociales y de salud y la asistencia financiera del Tesoro. Por provincia se muestran las otras no automáticas por habitante.`;
function trProvincias(el, k, anio, a) {
  const acum = anio === "acum", data = acum ? TRA : T.transferencias_provincias.filter(d => d.anio === +anio);
  barrasH(el, {anim: a, data, k: `${k}_hab`, vf: n0, af: v => v >= 1e6 ? `${n1(v / 1e6)} M` : v >= 1e3 ? `${n0(v / 1e3)} mil` : n0(v),
    color: () => TR_COL[k], l: 150, ntAngosto: 2});
  return data;
}
DIB.atn = conTablas("atn", () => /^\d+$/.test(MED.atn) ? ["transferencias_provincias"] : [], a => {
  const v = MED.atn, el = G("atn"), t = document.querySelector('[data-t="atn"]');
  document.getElementById("atn-sel").value = v;
  if (v === "serie") {
    t.textContent = `El año con más ATN fue ${TRR.atn_pico_anio}, con ${milM(TRR.atn_pico_v)} de pesos de ${TRR.ult}. En ${TRR.ult} se repartieron ${milM(TRR.atn_ult)} entre ${TRR.n_atn_ult} provincias. ` +
      `Los montos dependen de cada gobierno y de cada año, porque no hay una fórmula de reparto.`;
    columnasApiladas(el, {anim: a, data: TRS, claves: [{k: "atn", lab: "ATN", c: TR_COL.atn}], cadaTick: 5, unidad: `mil millones de pesos de ${TRR.ult}`, vf: n1, af: n0});
    return;
  }
  const data = trProvincias(el, "atn", v, a);
  if (v === "acum") {
    t.textContent = `Sumando lo recibido por habitante entre ${TRR.desde} y ${TRR.ult}, ${TRR.atn_acum_max} fue la provincia con más ATN (${n0(TRR.atn_acum_max_v)} pesos de ${TRR.ult} por habitante) y ${TRR.atn_acum_min} la que menos (${n0(TRR.atn_acum_min_v)}). ` +
      `La provincia de Buenos Aires recibió el ${pct(TRA.find(d => d.codigo_indec === "06").atn_pct)} de los ATN del período y tiene el ${pct(TRA.find(d => d.codigo_indec === "06").pob_pct)} de la población del país.`;
    return;
  }
  const con = data.filter(d => d.atn > 0).sort((p, q) => q.atn_hab - p.atn_hab), sin = data.filter(d => d.atn === 0).map(d => d.territorio);
  const tot = TRS.find(d => d.anio === +v).atn;
  t.textContent = con.length
    ? `En ${v} el gobierno nacional repartió ${milM(tot)} de pesos de ${TRR.ult} en ATN entre ${con.length} provincias. Por habitante, la que más recibió fue ${con[0].territorio} (${n0(con[0].atn_hab)} pesos) ` +
      `y la que menos, ${con[con.length - 1].territorio} (${n0(con[con.length - 1].atn_hab)}).` + (sin.length ? ` No recibieron ATN: ${listaY(sin)}.` : "")
    : `En ${v} no hubo ATN asignados a provincias.`;
});
DIB.transferencias = conTablas("transferencias", () => /^\d+$/.test(MED.transferencias) ? ["transferencias_provincias"] : [], a => {
  const v = MED.transferencias, el = G("transferencias"), t = document.querySelector('[data-t="transferencias"]'), ley = document.getElementById("tr-ley");
  document.getElementById("tr-sel").value = v;
  if (v === "serie") {
    const cl = ["otras", "atn", "ley"].map(k => ({k, lab: TR_LAB[k], c: TR_COL[k]}));
    ley.hidden = false; ley.innerHTML = cl.map(k => `<span><i style="background:${k.c}"></i>${k.lab}</span>`).join("");
    t.textContent = `Las transferencias no automáticas, sin contar los ATN, llegaron a su máximo en ${TRR.otras_pico_anio}, con ${milM(TRR.otras_pico_v)} de pesos de ${TRR.ult}. En ${TRR.ult} fueron ${milM(TRR.otras_ult)}.`;
    columnasApiladas(el, {anim: a, data: TRS, claves: cl, cadaTick: 5, unidad: `mil millones de pesos de ${TRR.ult}`, vf: n1, af: n0});
    return;
  }
  ley.hidden = true;
  const data = trProvincias(el, "otras", v, a).slice().sort((p, q) => q.otras_hab - p.otras_hab);
  const pais = v === "acum" ? null : d3.sum(data, d => d.otras) * 1e6 / d3.sum(data, d => d.pob);
  t.textContent = v === "acum"
    ? `Sumando lo recibido por habitante entre ${TRR.desde} y ${TRR.ult}, ${data[0].territorio} fue la provincia con más transferencias no automáticas (${n0(data[0].otras_hab)} pesos de ${TRR.ult} por habitante) y ${data[data.length - 1].territorio} la que menos (${n0(data[data.length - 1].otras_hab)}).`
    : `En ${v}, las transferencias no automáticas sin contar los ATN fueron de ${n0(pais)} pesos de ${TRR.ult} por habitante en el promedio del país. ${data[0].territorio} recibió ${n0(data[0].otras_hab)} por habitante y ${data[data.length - 1].territorio}, ${n0(data[data.length - 1].otras_hab)}.`;
});

const ORIGEN_COLOR = {"Ciudad de Buenos Aires": "#2C74B5", "Conurbano": "#74ACDF", "Resto de Buenos Aires": "#A9CBEA", "Otras provincias": "#F6B40E", "Otro país": "#98A2AE"};
const ORIGEN_TEXTO = {"Ciudad de Buenos Aires": "#fff", "Conurbano": "#18212B", "Resto de Buenos Aires": "#18212B", "Otras provincias": "#18212B", "Otro país": "#18212B"};
const leyOrigen = ks => ks.map(k => `<span><i style="background:${ORIGEN_COLOR[k]}"></i>${k}</span>`).join("");
const PRR = R.presidentes, GBR = R.gabinetes;
const apellido = n => ({"Cristina Fernández de Kirchner": "Fernández de Kirchner", "Adolfo Rodríguez Saá": "Rodríguez Saá", "Fernando de la Rúa": "De la Rúa",
  "Interinos de 2001": "Interinos de 2001"})[n] || n.split(" ").slice(-1)[0];
DIB.presidentes = a => {
  const P = T.presidentes, el = G("presidentes");
  document.querySelector('[data-t="presidentes"]').textContent = `De los ${PRR.n} presidentes desde 1983, contando a los interinos de 2001, ${PRR.amba} nacieron en el AMBA, ` +
    `donde vive el ${pct(PRR.amba_pob)} de la población: ${listaY(PRR.amba_nombres.map(apellido))}. Entre todos gobernaron ${n1(PRR.anios_amba)} de los ${n1(PRR.anios)} años, ` +
    `el ${pct(PRR.pct_tiempo_amba)} del tiempo. Los doce nacieron en ${PRR.prov_distintas} jurisdicciones distintas.`;
  const usados = [...new Set(P.map(d => d.origen))];
  document.getElementById("pr-ley").innerHTML = leyOrigen(Object.keys(ORIGEN_COLOR).filter(k => usados.includes(k)));
  // franja de tiempo: cada presidencia ocupa el ancho de los días que gobernó
  const angosto = el.clientWidth < 520, C = lienzo(el, 74, {t:8, r:4, b:26, l:4}), {g, iw} = C;
  const t0 = new Date(P[0].inicio), t1 = new Date();
  const x = d3.scaleTime().domain([t0, t1]).range([0, iw]);
  const fin = d => d.fin ? new Date(d.fin) : t1;
  const r = g.selectAll("rect").data(P).join("rect").attr("x", d => x(new Date(d.inicio))).attr("y", 0).attr("height", 38)
    .attr("width", d => Math.max(1.5, x(fin(d)) - x(new Date(d.inicio)) - 1)).attr("fill", d => ORIGEN_COLOR[d.origen]);
  g.selectAll("text.n").data(P.filter(d => x(fin(d)) - x(new Date(d.inicio)) > (angosto ? 44 : 60))).join("text").attr("class","n")
    .attr("x", d => x(new Date(d.inicio)) + 5).attr("y", 23).attr("font-size", 12).attr("fill", d => ORIGEN_TEXTO[d.origen]).text(d => apellido(d.nombre));
  g.append("g").attr("class","eje").attr("transform","translate(0,42)").call(d3.axisBottom(x).ticks(angosto ? 4 : 8).tickSize(0).tickPadding(8)).call(s => s.select(".domain").remove());
  if (a) r.attr("opacity", 0).transition().delay((d, i) => i * 60).duration(300).attr("opacity", 1);
  r.on("pointerenter", (ev, d) => mostrarTip(el, `<b>${d.nombre}</b><br>${d.inicio.slice(0, 4)} a ${d.fin ? d.fin.slice(0, 4) : "hoy"}<br>Nació en ${d.lugar_nacimiento}, ${d.provincia}`,
      4 + x(new Date(d.inicio)) + (x(fin(d)) - x(new Date(d.inicio))) / 2, 8)).on("pointerleave", ocultarTip);
  document.getElementById("pr-lista").innerHTML = P.map(d => `<li><i style="background:${ORIGEN_COLOR[d.origen]}"></i><span>${d.nombre}${d.interino ? " (interino)" : ""}, ${d.inicio.slice(0, 4)} a ${d.fin ? d.fin.slice(0, 4) : "hoy"}</span>` +
    `<small>${d.lugar_nacimiento === d.provincia || d.provincia.startsWith("Ciudad") ? d.provincia.replace("Ciudad Autónoma de Buenos Aires", "Ciudad de Buenos Aires") : `${d.lugar_nacimiento}, ${d.provincia}`}</small></li>`).join("");
};
MED.ministros = "gobierno";
document.querySelector('[data-t="ministros-titulo"]').textContent = `Ministros nacionales según lugar de nacimiento, 1983 a ${new Date().getFullYear()}`;
DIB.ministros = a => {
  document.querySelector('[data-t="ministros"]').textContent = `De las ${GBR.personas} personas que fueron ministros o jefes de gabinete desde 1983, se conoce el lugar de nacimiento de ${GBR.con_dato}. ` +
    `El ${pct(GBR.pct_amba)} nació en el AMBA, que tiene el ${pct(PRR.amba_pob)} de la población, y ${GBR.caba} en la Ciudad de Buenos Aires. ` +
    (GBR.max_gob.length > 1 ? `Los gabinetes con más nacidos en el AMBA fueron los de ${listaY(GBR.max_gob.map(apellido))} (${pct(GBR.max_gob_v)} cada uno)` : `El gabinete con más nacidos en el AMBA fue el de ${apellido(GBR.max_gob[0])} (${pct(GBR.max_gob_v)})`) + ` y el que menos, el de ${apellido(GBR.min_gob)} (${pct(GBR.min_gob_v)}). ` +
    (GBR.sin_ministro.length ? `Ninguna de esas personas nació en ${listaY(GBR.sin_ministro).replace(/ y ([^y]+)$/, " ni $1")}.` : "");
  const ley = document.getElementById("mi-ley");
  if (MED.ministros === "gobierno") {
    const ks = Object.keys(ORIGEN_COLOR).filter(k => T.gabinetes_origen.some(d => d[k] > 0));
    ley.innerHTML = leyOrigen(ks); ley.hidden = false;
    apiladasH(G("ministros"), {anim: a, claves: ks.map(k => ({k, lab: k, c: ORIGEN_COLOR[k], texto: ORIGEN_TEXTO[k]})),
      data: T.gabinetes_origen.map(d => ({...d, codigo_indec: d.gobierno, territorio: apellido(d.gobierno)}))});
  } else {
    ley.hidden = true;
    barrasH(G("ministros"), {anim: a, data: T.ministros_provincias, k: "ministros", vf: n0, af: n0});
  }
};
DIB.representacion = a => {
  const rp = T.representacion_provincias, prom = d3.sum(rp, d => d.poblacion) / 257;
  document.querySelector('[data-t="representacion"]').textContent = `Cada provincia elige al menos cinco diputados y tres senadores, sin importar su población. ` +
    `Por eso en ${CG.rep_min} hay una banca de diputado cada ${n0(CG.rep_min_v)} habitantes y en ${CG.rep_max}, una cada ${n0(CG.rep_max_v)}. ` +
    `Sumando las dos cámaras, ${CG.peso_max} tiene ${n1(CG.peso_max_v)} veces las bancas que le corresponderían por su población y ${CG.peso_min}, ${n2(CG.peso_min_v)} veces.`;
  barrasH(G("representacion"), {anim: a, data: rp, k: "hab_por_diputado", ref: prom, refLab: `País ${n0(prom)}`, vf: v => n0(v), af: v => n0(v / 1000) + " mil"});
};
// Solo se redibujan los gráficos de tarjetas que ya entraron en pantalla: el resto se dibuja al llegar
function dibujarTodo() { Object.keys(DIB).forEach(k => { const el = G(k); if (el && el.closest(".visto")) DIB[k](false); }); }

document.querySelectorAll(".selector-ficha select[data-g]").forEach(sel => sel.addEventListener("change", () => {
  MED[sel.dataset.g] = sel.value; DIB[sel.dataset.g](!REDUCIR);
}));

/* ---------- la OCDE dentro de cada gráfico, al estilo de las páginas de país del Banco Mundial ----------
   Si la unidad coincide, el promedio OCDE es una línea violeta en el mismo gráfico (nacimientos, mortalidad infantil,
   esperanza de vida, áreas protegidas y PISA). Si no, el gráfico suma botones que lo redibujan con la Argentina y la OCDE. */
const OCDE_VISTA = {  // ficha: [gráfico, nombre de la vista propia, indicadores OCDE]
  "f-nacimientos": ["nacimientos", "Nacimientos", ["fecundidad"]],
  "f-adolescentes": ["adolescentes", "Por provincia", ["fecundidad_adolescente"]],
  "f-mortalidad": ["mortalidad", "Por provincia", ["gasto_salud"]],
  "f-escolarizacion": ["escolarizacion", "Por provincia", ["secundaria"]],
  "f-suicidio": ["suicidio", "Registro del SNIC", ["suicidio"]],
  "f-muertes": ["muertes", "Cantidad por año", ["homicidios", "viales"]],
  "f-empleo": ["empleo", "Por provincia", ["empleo", "desocupacion"]],
  "f-pobreza": ["pobreza", "Pobreza e indigencia", ["pobreza_relativa", "gini"]],
  "f-internet": ["internet", "Por provincia", ["internet"]],
  "f-hogares": ["hogares", "Hogares y resto", ["electricidad", "co2"]],
  "f-receptivo": ["receptivo", "Turistas por año", ["turistas"]],
  "f-pesca": ["pesca", "Por especie", ["pesca"]],
};
const OCDE_BOTON = {fecundidad: "Hijos por mujer", fecundidad_adolescente: "Fecundidad adolescente", gasto_salud: "Gasto en salud",
  secundaria: "Terminan el ciclo básico", suicidio: "Tasa estimada por la OMS", homicidios: "Homicidios", viales: "Siniestros viales",
  empleo: "Tasa de empleo", desocupacion: "Desocupación", pobreza_relativa: "Pobreza relativa", gini: "Gini", internet: "Uso de internet",
  electricidad: "Electricidad por habitante", co2: "CO₂ por habitante", turistas: "Turistas por habitante", pesca: "Pesca por habitante"};
const OCDE_Y0 = {esperanza_vida: 65, secundaria: 60, empleo: 40, internet: 0};
const OCDE_NOTA = {
  pobreza_relativa: "Es una medida de pobreza relativa, la que usa la OCDE, distinta de la pobreza por canastas del INDEC. En la Argentina el Banco Mundial la calcula con la EPH, que cubre solo los aglomerados urbanos.",
  gini: "En la Argentina el Banco Mundial lo calcula con la EPH, que cubre solo los aglomerados urbanos.",
  turistas: "Llegadas de turistas internacionales dividido por la población de cada país. El Banco Mundial no publica esta serie después de 2019.",
  internet: "Personas que usaron internet en los últimos tres meses, desde cualquier dispositivo.",
  pesca: "Toneladas de pesca de captura, marítima y continental, dividido por la población de cada país.",
  suicidio: "Estimaciones de la OMS ajustadas por edad, distintas de los registros del SNIC y de la DEIS que usa esta sección.",
  protegida: "Mide la superficie terrestre dentro de áreas protegidas sin contar dos veces las superposiciones, por eso difiere de la cifra nacional de esta ficha.",
};
const fOC = k => loc.format(`,.${OC[k].dec}f`);
const conUnidad = (k, v) => OC[k].unidad.startsWith("%") ? fOC(k)(v) + OC[k].unidad : `${fOC(k)(v)} ${OC[k].unidad}`;
function textoOCDE(k) {
  const o = OC[k], f = fOC(k);
  const med = Math.abs(o.ocde - o.mediana) > Math.abs(o.mediana) * .25
    ? ` La mediana fue ${f(o.mediana)}: unos pocos países con valores extremos mueven el promedio.` : "";
  const alto = o.mas_alto === 0 ? `Ninguno de esos ${o.n} países tenía un valor más alto que la Argentina.`
    : o.mas_alto === o.n ? `Los ${o.n} países tenían un valor más alto que la Argentina.`
    : `${o.mas_alto} de esos ${o.n} países tenían un valor más alto que la Argentina.`;
  return `En ${o.anio}, ${o.frase} fue de ${conUnidad(k, o.arg)} en la Argentina y de ${f(o.ocde)} en el promedio simple de los ${o.n} países de la OCDE con dato.${med} ${alto} En ${o.ini} los valores eran ${f(o.arg_ini)} y ${f(o.ocde_ini)}.`;
}
/* Notas metodológicas plegadas bajo "Sobre los datos" para acortar la página. Quedan a la vista
   las de las herramientas (advertencias estadísticas) y las de suicidio (el SNIC es un registro policial). */
const NOTA_A_LA_VISTA = new Set(["f-muertes", "f-suicidio", "f-suicidio-prov", "f-edad"]);
document.querySelectorAll(".tema:not(.herramienta) > article.ficha").forEach(f => {
  const notas = f.querySelectorAll(":scope > .nota");
  if (!notas.length || NOTA_A_LA_VISTA.has(f.id)) return;
  const d = document.createElement("details"); d.className = "sobre";
  d.innerHTML = "<summary>Sobre los datos</summary>";
  notas[0].before(d); d.append(...notas);
});

const VISTA = {};
Object.entries(OCDE_VISTA).forEach(([id, [g, propio, ks]]) => {
  const art = document.getElementById(id), graf = G(g); if (!art || !graf) return;
  VISTA[g] = null;
  graf.insertAdjacentHTML("beforebegin", `<div class="ocde-conm" role="group" aria-label="Qué muestra el gráfico">` +
    `<button type="button" class="boton chico propio" aria-pressed="true">${propio}</button>` +
    ks.map(k => `<button type="button" class="boton chico" data-k="${k}" aria-pressed="false">OCDE: ${OCDE_BOTON[k]}</button>`).join("") + `</div>`);
  graf.insertAdjacentHTML("afterend", `<p class="nota ocde-nota" hidden></p>`);
  const conm = graf.previousElementSibling, nota = graf.nextElementSibling, lead = art.querySelector(".lead");
  const propios = [...art.querySelectorAll(".sobre, .nota:not(.ocde-nota), .selector-ficha, .conmutador:not(.pestanas)")];
  conm.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
    if (VISTA[g] === (b.dataset.k || null)) return;
    VISTA[g] = b.dataset.k || null;
    conm.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b));
    DIB[g](!REDUCIR);
  }));
  const orig = DIB[g];
  DIB[g] = a => {
    const k = VISTA[g];
    if (!k) {
      if (lead && lead.dataset.propio != null) { lead.textContent = lead.dataset.propio; delete lead.dataset.propio; }
      propios.forEach(e => e.style.display = ""); nota.hidden = true;
      return orig(a);
    }
    if (!T.ocde_comparacion) { d3.csv("datos/ocde_comparacion.csv", d3.autoType).then(f => { T.ocde_comparacion = f; DIB[g](a); }); return; }
    const o = OC[k];
    if (lead) { if (lead.dataset.propio == null) lead.dataset.propio = lead.textContent; lead.textContent = textoOCDE(k); }
    propios.forEach(e => e.style.display = "none"); nota.hidden = false;
    nota.innerHTML = `Unidad: ${o.unidad}. ${OCDE_NOTA[k] ? OCDE_NOTA[k] + " " : ""}La línea <span class="ocde-marca">OCDE</span> es el promedio simple de los países miembros con dato ese año y la franja violeta clara va del percentil 25 al 75: ahí está la mitad de los países. ` +
      `Fuente: Banco Mundial, Indicadores del Desarrollo Mundial (serie ${o.serie}), con datos de ${o.origen}. Son estimaciones armonizadas para comparar países y pueden diferir de las cifras nacionales de esta ficha. <a href="datos/ocde_comparacion.csv" download>Descargar la comparación (CSV)</a>`;
    lineas(graf, {anim: a, data: T.ocde_comparacion.filter(d => d.indicador === k), x: "anio", y0: OCDE_Y0[k] ?? 0,
      vf: fOC(k), yf: v => loc.format(",")(v), banda: {lo: "ocde_p25", hi: "ocde_p75", lab: "Mitad central OCDE", c: css("--ocde-suave")},
      series: [{k: "argentina", lab: "Argentina", c: NAR, w: 3}, {k: "ocde_promedio", lab: "OCDE", c: css("--ocde"), w: 2.6}]});
  };
});

/* ---------- cruces: explorador de indicadores provinciales ----------
   Dispersión con recta de regresión, matriz de correlaciones y regresión múltiple.
   Inspirado en los exploradores regionales de la OCDE, Eurostat, Gapminder y el Atlas de Desarrollo Humano de Brasil.
   Todas las cuentas se hacen en el navegador. */
const CX = (() => {
  const META = Object.fromEntries(R.cruces.map(m => [m.id, m]));
  const FILAS = T.cruces_provincias;
  const COLOR_REGION = {CABA: "#18212B", Pampeana: "#2C74B5", NOA: "#B27A00", NEA: "#C8102E", Cuyo: "#7A4FA0", Patagonia: "#74ACDF"};
  const CORTO_PROV = {"Santiago del Estero": "Sgo. del Estero", "Tierra del Fuego": "T. del Fuego", "Buenos Aires": "Bs. As."};
  const st = {x: "madres_adolescentes", y: "aprender_mat", fuera: new Set(), tam: false, logx: false, logy: false,
              my: "mortalidad_infantil", mx: ["madres_adolescentes", "empleo_privado"]};
  // estado compartible en el enlace: ?cx=...&cy=...&cf=02,94
  const q = new URLSearchParams(location.search);
  if (META[q.get("cx")]) st.x = q.get("cx");
  if (META[q.get("cy")]) st.y = q.get("cy");
  (q.get("cf") || "").split(",").filter(c => FILAS.some(f => f.codigo_indec === c)).forEach(c => st.fuera.add(c));
  const guardar = () => {
    const u = new URL(location.href);
    u.searchParams.set("cx", st.x); u.searchParams.set("cy", st.y);
    if (st.fuera.size) u.searchParams.set("cf", [...st.fuera].join(",")); else u.searchParams.delete("cf");
    history.replaceState(null, "", u);
  };

  /* ---- estadística ---- */
  const media = a => a.reduce((s, v) => s + v, 0) / a.length;
  function pearson(x, y) {
    const mx = media(x), my = media(y); let sxy = 0, sxx = 0, syy = 0;
    for (let i = 0; i < x.length; i++) { const a = x[i] - mx, b = y[i] - my; sxy += a * b; sxx += a * a; syy += b * b; }
    return sxy / Math.sqrt(sxx * syy);
  }
  function rangos(a) {
    const idx = a.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]), r = new Array(a.length);
    for (let i = 0; i < idx.length;) {
      let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
      for (let k = i; k <= j; k++) r[idx[k][1]] = (i + j) / 2 + 1;
      i = j + 1;
    }
    return r;
  }
  const spearman = (x, y) => pearson(rangos(x), rangos(y));
  // función beta incompleta regularizada (Numerical Recipes), para los valores p de t y F
  function lgamma(z) {
    const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, .1208650973866179e-2, -.5395239384953e-5];
    let x = z, y = z, t = x + 5.5; t -= (x + .5) * Math.log(t); let s = 1.000000000190015;
    for (const k of c) s += k / ++y;
    return -t + Math.log(2.5066282746310005 * s / x);
  }
  function betacf(a, b, x) {
    let qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < 1e-30) d = 1e-30; d = 1 / d; let h = d;
    for (let m = 1; m <= 200; m++) {
      const m2 = 2 * m; let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30; c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30; d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30; c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30; d = 1 / d;
      const del = d * c; h *= del; if (Math.abs(del - 1) < 3e-12) break;
    }
    return h;
  }
  function ibeta(x, a, b) {
    if (x <= 0) return 0; if (x >= 1) return 1;
    const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b;
  }
  const pT = (t, df) => ibeta(df / (df + t * t), df / 2, .5);            // p a dos colas
  const pF = (f, d1, d2) => ibeta(d2 / (d2 + d1 * f), d2 / 2, d1 / 2);
  function tCrit(df) { let lo = 0, hi = 50; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; pT(m, df) > .05 ? lo = m : hi = m; } return (lo + hi) / 2; }
  function simple(x, y) {
    const n = x.length, mx = media(x), my = media(y); let sxx = 0, sxy = 0, syy = 0;
    for (let i = 0; i < n; i++) { sxx += (x[i] - mx) ** 2; sxy += (x[i] - mx) * (y[i] - my); syy += (y[i] - my) ** 2; }
    const b = sxy / sxx, a = my - b * mx, res = y.map((v, i) => v - (a + b * x[i]));
    const sse = res.reduce((s, e) => s + e * e, 0), s2 = sse / (n - 2), se = Math.sqrt(s2 / sxx), t = b / se;
    const h = x.map(v => 1 / n + (v - mx) ** 2 / sxx), cook = res.map((e, i) => e * e / (2 * s2) * h[i] / (1 - h[i]) ** 2);
    return {n, a, b, r: sxy / Math.sqrt(sxx * syy), r2: 1 - sse / syy, p: pT(t, n - 2), s2, sxx, mx, res, cook, tc: tCrit(n - 2)};
  }
  function invertir(M) {
    const n = M.length, A = M.map((f, i) => [...f, ...f.map((_, j) => +(i === j))]);
    for (let c = 0; c < n; c++) {
      let piv = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
      if (Math.abs(A[piv][c]) < 1e-12) return null;
      [A[c], A[piv]] = [A[piv], A[c]];
      const d = A[c][c]; for (let j = 0; j < 2 * n; j++) A[c][j] /= d;
      for (let r = 0; r < n; r++) if (r !== c) { const f = A[r][c]; for (let j = 0; j < 2 * n; j++) A[r][j] -= f * A[c][j]; }
    }
    return A.map(f => f.slice(n));
  }
  // Regresión múltiple con variables estandarizadas: los coeficientes se comparan entre sí
  function multiple(y, xs) {
    const n = y.length, k = xs.length, z = a => { const m = media(a), s = Math.sqrt(a.reduce((t, v) => t + (v - m) ** 2, 0) / (n - 1)); return a.map(v => (v - m) / s); };
    const zy = z(y), zx = xs.map(z), X = zy.map((_, i) => [1, ...zx.map(c => c[i])]);
    const XtX = X[0].map((_, a) => X[0].map((_, b) => X.reduce((s, f) => s + f[a] * f[b], 0)));
    const inv = invertir(XtX); if (!inv) return null;
    const Xty = X[0].map((_, a) => X.reduce((s, f, i) => s + f[a] * zy[i], 0));
    const beta = inv.map(f => f.reduce((s, v, j) => s + v * Xty[j], 0));
    const sse = zy.reduce((s, v, i) => s + (v - X[i].reduce((t, x, j) => t + x * beta[j], 0)) ** 2, 0), sst = zy.reduce((s, v) => s + v * v, 0);
    const df = n - k - 1, s2 = sse / df, r2 = 1 - sse / sst, tc = tCrit(df);
    const Rxx = zx.map(a => zx.map(b => a.reduce((s, v, i) => s + v * b[i], 0) / (n - 1))), Rinv = invertir(Rxx);
    const coef = beta.slice(1).map((b, j) => { const se = Math.sqrt(s2 * inv[j + 1][j + 1]); return {b, se, p: pT(b / se, df), lo: b - tc * se, hi: b + tc * se, vif: Rinv ? Rinv[j][j] : null}; });
    const F = (r2 / k) / ((1 - r2) / df);
    return {n, k, df, r2, r2a: 1 - (1 - r2) * (n - 1) / df, coef, pF: pF(F, k, df)};
  }

  /* ---- utilidades ---- */
  const fm = id => loc.format(`,.${META[id].dec}f`);
  const fr = v => loc.format(",.2f")(v);
  const fp = p => p < .001 ? "menor a 0,001" : loc.format(",.3f")(p);
  const corto = t => CORTO_PROV[t] || t;
  // Evolución en el tiempo: las series por año se bajan aparte, solo cuando alguien las pide
  const SR = R.cruces_series || {};
  let SER = null, cargando = null, reloj = null;
  st.anio = null;
  const conSerie = () => SR[st.x] && SR[st.y] && Math.max(SR[st.x][0], SR[st.y][0]) < Math.min(SR[st.x][1], SR[st.y][1]);
  const anios = () => d3.range(Math.max(SR[st.x][0], SR[st.y][0]), Math.min(SR[st.x][1], SR[st.y][1]) + 1);
  const cargar = () => cargando || (cargando = d3.csv("datos/cruces_series.csv", d3.autoType).then(filas => {
    SER = {};
    filas.forEach(r => { const c = String(r.codigo_indec).padStart(2, "0"); ((SER[r.id] ||= {})[c] ||= {})[r.anio] = r.valor; });
  }));
  const valor = (k, c, a) => SER?.[k]?.[c]?.[a] ?? null;
  const filas = () => st.anio == null || !SER || !conSerie() ? FILAS
    : FILAS.map(f => ({...f, [st.x]: valor(st.x, f.codigo_indec, st.anio), [st.y]: valor(st.y, f.codigo_indec, st.anio)}));
  const validos = (ids) => filas().filter(f => !st.fuera.has(f.codigo_indec) && ids.every(k => f[k] != null && isFinite(f[k])));
  const logOk = id => FILAS.every(f => f[id] == null || f[id] > 0);
  const tx = (id, log) => log ? v => Math.log10(v) : v => v;
  const fuerza = r => { const a = Math.abs(r); return a < .1 ? "prácticamente nula" : a < .3 ? "débil" : a < .5 ? "moderada" : a < .7 ? "fuerte" : "muy fuerte"; };

  /* ---- controles ---- */
  const selX = document.getElementById("cx-x"), selY = document.getElementById("cx-y"), selMY = document.getElementById("cm-y");
  const temas = [...new Set(R.cruces.map(m => m.tema))];
  const opciones = temas.map(t => `<optgroup label="${t}">` + R.cruces.filter(m => m.tema === t)
    .map(m => `<option value="${m.id}">${m.nombre}${R.cruces_series?.[m.id] ? ` (serie desde ${R.cruces_series[m.id][0]})` : ""}</option>`).join("") + `</optgroup>`).join("");
  [selX, selY, selMY].forEach(s => s.innerHTML = opciones);
  const listaMX = document.getElementById("cm-x");
  listaMX.innerHTML = R.cruces.map(m => `<label><input type="checkbox" value="${m.id}"> ${m.nombre}</label>`).join("");
  const SUG = [["empleo_privado", "homicidios"], ["madres_adolescentes", "aprender_mat"], ["madres_adolescentes", "mortalidad_infantil"], ["empleo_privado", "autos"],
               ["densidad", "robos"], ["protegida", "turistas_eti"], ["escolarizacion", "aprender_len"]]
    .filter(([a, b]) => META[a] && META[b]);
  document.getElementById("cx-sug").innerHTML = SUG.map(([a, b], i) =>
    `<button type="button" class="enlace cx-chip" data-i="${i}">${META[a].nombre} y ${META[b].nombre.toLowerCase()}</button>`).join("");

  const sincronizar = () => {
    selX.value = st.x; selY.value = st.y; selMY.value = st.my;
    ["logx", "logy"].forEach(k => {
      const id = k === "logx" ? st.x : st.y, cb = document.getElementById(`cx-${k}`);
      cb.disabled = !logOk(id); if (cb.disabled) st[k] = false; cb.checked = st[k];
    });
    document.getElementById("cx-tam").checked = st.tam;
    document.getElementById("cx-caba").setAttribute("aria-pressed", st.fuera.has("02"));
    listaMX.querySelectorAll("input").forEach(i => { i.checked = st.mx.includes(i.value); i.disabled = i.value === st.my; });
  };
  const barraTiempo = () => {
    const caja = document.getElementById("cx-tiempo"), ok = conSerie();
    caja.hidden = !ok; if (!ok) { parar(); st.anio = null; return; }
    const as = anios(), rango = document.getElementById("cx-anio");
    rango.min = as[0]; rango.max = as[as.length - 1];
    if (st.anio != null && (st.anio < as[0] || st.anio > as[as.length - 1])) st.anio = as[as.length - 1];
    rango.value = st.anio ?? as[as.length - 1];
    document.getElementById("cx-anio-v").textContent = st.anio ?? "Último dato";
    document.getElementById("cx-ultimo").hidden = st.anio == null;
    document.getElementById("cx-play").textContent = reloj ? "Pausar" : st.anio == null ? `Ver la evolución desde ${as[0]}` : "Reproducir";
  };
  const parar = () => { clearInterval(reloj); reloj = null; };
  const todo = (anim) => { sincronizar(); barraTiempo(); guardar(); DIB["cruces-disp"](anim); DIB["cruces-matriz"](false); DIB["cruces-multi"](false); };
  const irAnio = (a, anim) => { st.anio = a; barraTiempo(); DIB["cruces-disp"](anim); };
  document.getElementById("cx-anio").addEventListener("input", ev => { parar(); cargar().then(() => irAnio(+ev.target.value, false)); });
  document.getElementById("cx-ultimo").addEventListener("click", () => { parar(); irAnio(null, true); });
  document.getElementById("cx-play").addEventListener("click", () => {
    if (reloj) { parar(); barraTiempo(); return; }
    cargar().then(() => {
      const as = anios();
      if (st.anio == null || st.anio >= as[as.length - 1]) st.anio = as[0];
      irAnio(st.anio, true);
      reloj = setInterval(() => {
        if (st.anio >= as[as.length - 1]) { parar(); barraTiempo(); return; }
        irAnio(st.anio + 1, true);
      }, REDUCIR ? 1200 : 800);
      barraTiempo();
    });
  });
  selX.addEventListener("change", () => { st.x = selX.value; todo(true); });
  selY.addEventListener("change", () => { st.y = selY.value; todo(true); });
  document.getElementById("cx-cambiar").addEventListener("click", () => { [st.x, st.y] = [st.y, st.x]; [st.logx, st.logy] = [st.logy, st.logx]; todo(true); });
  ["tam", "logx", "logy"].forEach(k => document.getElementById(`cx-${k}`).addEventListener("change", ev => { st[k] = ev.target.checked; todo(true); }));
  document.getElementById("cx-caba").addEventListener("click", () => { st.fuera.has("02") ? st.fuera.delete("02") : st.fuera.add("02"); todo(true); });
  document.getElementById("cx-reponer").addEventListener("click", () => { st.fuera.clear(); todo(true); });
  document.getElementById("cx-sug").addEventListener("click", ev => {
    const b = ev.target.closest(".cx-chip"); if (!b) return;
    [st.x, st.y] = SUG[+b.dataset.i]; st.logx = false; st.logy = false; todo(true);
  });
  selMY.addEventListener("change", () => { st.my = selMY.value; st.mx = st.mx.filter(k => k !== st.my); todo(false); DIB["cruces-multi"](true); });
  listaMX.addEventListener("change", ev => {
    const v = ev.target.value;
    if (ev.target.checked) { if (st.mx.length >= 4) { ev.target.checked = false; document.getElementById("cm-aviso").textContent = "Con 24 casos se pueden sumar hasta cuatro variables explicativas."; return; } st.mx.push(v); }
    else st.mx = st.mx.filter(k => k !== v);
    document.getElementById("cm-aviso").textContent = "";
    DIB["cruces-multi"](true);
  });

  /* ---- dispersión ---- */
  let previo = {};
  function dispersion(anim) {
    const el = G("cruces-disp"); if (!el || !el.offsetParent) return;
    const enSerie = st.anio != null && SER && conSerie();
    const X = enSerie ? {...META[st.x], periodo: String(st.anio)} : META[st.x], Y = enSerie ? {...META[st.y], periodo: String(st.anio)} : META[st.y];
    const datos = validos([st.x, st.y]), todos = filas().filter(f => f[st.x] != null && f[st.y] != null);
    const todosAnios = k => enSerie ? Object.values(SER[k]).flatMap(o => Object.entries(o).filter(([a]) => +a >= anios()[0] && +a <= anios().at(-1)).map(([, v]) => v)) : todos.map(f => f[k]);
    const angosto = el.clientWidth < 560;
    const C = lienzo(el, angosto ? 400 : 500, {t: 34, r: angosto ? 14 : 24, b: 50, l: angosto ? 44 : 58});
    const {g, iw, ih, svg} = C;
    svg.attr("aria-label", `Diagrama de dispersión de ${X.nombre} y ${Y.nombre} por provincia`);
    const esc = (id, log, rango) => {
      const ext = d3.extent(todosAnios(id).filter(v => !log || v > 0));
      if (log) return d3.scaleLog().domain([ext[0] / 1.15, ext[1] * 1.15]).range(rango);
      const pad = (ext[1] - ext[0]) * .06 || 1;
      return d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).nice().range(rango);
    };
    const x = esc(st.x, st.logx, [0, iw]), y = esc(st.y, st.logy, [ih, 0]);
    const fx = st.logx ? v => loc.format(",~r")(+v.toPrecision(2)) : v => loc.format(",")(v);
    const fy = st.logy ? v => loc.format(",~r")(+v.toPrecision(2)) : v => loc.format(",")(v);
    g.append("g").attr("class", "grilla").call(d3.axisLeft(y).ticks(5).tickSize(-iw).tickFormat("")).call(a => a.select(".domain").remove());
    g.append("g").attr("class", "grilla").attr("transform", `translate(0,${ih})`).call(d3.axisBottom(x).ticks(angosto ? 4 : 6).tickSize(-ih).tickFormat("")).call(a => a.select(".domain").remove());
    g.append("g").attr("class", "eje").call(d3.axisLeft(y).ticks(5, st.logy ? "~r" : undefined).tickFormat(fy).tickSize(0).tickPadding(8)).call(a => a.select(".domain").remove());
    g.append("g").attr("class", "eje").attr("transform", `translate(0,${ih})`).call(d3.axisBottom(x).ticks(angosto ? 4 : 6).tickFormat(fx).tickSize(0).tickPadding(8)).call(a => a.select(".domain").remove());
    const ajustar = (t, max) => { const n = t.node(); let txt = n.textContent; while (n.getComputedTextLength() > max && txt.length > 8) { txt = txt.slice(0, -2); n.textContent = txt.trimEnd() + "…"; } };
    ajustar(g.append("text").attr("class", "cx-eje-tit").attr("x", iw).attr("y", ih + 42).attr("text-anchor", "end").text(`${X.nombre}: ${X.unidad}`), iw);
    ajustar(g.append("text").attr("class", "cx-eje-tit").attr("x", -(angosto ? 44 : 58) + 2).attr("y", -18).text(`${Y.nombre}: ${Y.unidad}`), iw + 40);
    // recta y franja de confianza del 95%, en la escala que se ve (logarítmica si está elegida)
    const tX = tx(st.x, st.logx), tY = tx(st.y, st.logy), inv = v => st.logy ? 10 ** v : v;
    let m = null;
    if (datos.length >= 5) {
      m = simple(datos.map(f => tX(f[st.x])), datos.map(f => tY(f[st.y])));
      const [x0, x1] = d3.extent(datos, f => tX(f[st.x])), pasos = d3.range(0, 41).map(i => x0 + (x1 - x0) * i / 40);
      const banda = pasos.map(v => { const yh = m.a + m.b * v, e = m.tc * Math.sqrt(m.s2 * (1 / m.n + (v - m.mx) ** 2 / m.sxx)); return {v, lo: inv(yh - e), hi: inv(yh + e), yh: inv(yh)}; });
      const px = v => x(st.logx ? 10 ** v : v), py = v => Math.max(-20, Math.min(ih + 20, y(v)));
      g.append("clipPath").attr("id", "cx-clip").append("rect").attr("width", iw).attr("height", ih);
      const capa = g.append("g").attr("clip-path", "url(#cx-clip)");
      const ar = capa.append("path").datum(banda).attr("fill", css("--celeste-suave")).attr("opacity", .8)
        .attr("d", d3.area().x(d => px(d.v)).y0(d => py(d.lo)).y1(d => py(d.hi)));
      const ln = capa.append("path").datum(banda).attr("fill", "none").attr("stroke", css("--azul")).attr("stroke-width", 2)
        .attr("d", d3.line().x(d => px(d.v)).y(d => py(d.yh)));
      if (anim && !REDUCIR) { aparecer(ar, 250); trazar(ln); }
    }
    // puntos
    const r = st.tam ? d3.scaleSqrt().domain([0, d3.max(FILAS, f => f.poblacion)]).range([3, angosto ? 22 : 30]) : () => angosto ? 5 : 6.5;
    const orden = [...todos].sort((a, b) => st.tam ? b.poblacion - a.poblacion : 0);
    const pts = g.append("g").attr("class", "cx-pts").selectAll("g").data(orden, d => d.codigo_indec).join("g").attr("class", "cx-punto")
      .attr("tabindex", 0).attr("role", "button")
      .attr("aria-label", d => `${d.territorio}: ${fm(st.x)(d[st.x])} y ${fm(st.y)(d[st.y])}. ${st.fuera.has(d.codigo_indec) ? "Fuera del cálculo, tocá para sumarla" : "Tocá para sacarla del cálculo"}`);
    const circ = pts.append("circle").attr("r", d => r(d.poblacion))
      .attr("fill", d => st.fuera.has(d.codigo_indec) ? "none" : COLOR_REGION[d.region])
      .attr("fill-opacity", st.tam ? .75 : .92)
      .attr("stroke", d => st.fuera.has(d.codigo_indec) ? css("--faint") : d.codigo_indec === prov ? css("--ink") : "#fff")
      .attr("stroke-width", d => d.codigo_indec === prov ? 2.6 : 1.4).attr("stroke-dasharray", d => st.fuera.has(d.codigo_indec) ? "2 2" : null);
    const pos = d => [x(d[st.x]), y(d[st.y])];
    pts.attr("transform", d => { const p = previo[d.codigo_indec] || pos(d); return `translate(${p[0]},${p[1]})`; });
    if (anim && !REDUCIR) {
      pts.transition().duration(Object.keys(previo).length ? 650 : 0).ease(EASE).attr("transform", d => `translate(${pos(d)})`);
      if (!Object.keys(previo).length) circ.attr("r", 0).transition().delay((d, i) => 120 + i * 18).duration(420).ease(EASE).attr("r", d => r(d.poblacion));
    } else pts.attr("transform", d => `translate(${pos(d)})`);
    previo = Object.fromEntries(todos.map(d => [d.codigo_indec, pos(d)]));
    // estela: el recorrido de la provincia elegida hasta el año que se muestra
    if (enSerie && NOMBRES[prov]) {
      const cam = anios().filter(a => a <= st.anio).map(a => [valor(st.x, prov, a), valor(st.y, prov, a)]).filter(([a, b]) => a != null && b != null && (!st.logx || a > 0) && (!st.logy || b > 0));
      g.insert("path", ".cx-pts").datum(cam).attr("fill", "none").attr("stroke", css("--ink")).attr("stroke-width", 1.4).attr("stroke-dasharray", "2 3").attr("opacity", .7)
        .attr("d", d3.line().x(d => x(d[0])).y(d => y(d[1])));
    }
    // etiquetas: primero la provincia elegida y las más alejadas de la recta; cada una prueba cuatro lugares
    // y se omite si pisa a otra o a un punto (se lee igual al pasar el cursor)
    const cajas = todos.map(d => { const [px, py] = pos(d), rr = r(d.poblacion); return [px - rr, py - rr, px + rr, py + rr]; });
    const pisa = (b, lista) => lista.some(c => b[0] < c[2] && b[2] > c[0] && b[1] < c[3] && b[3] > c[1]);
    const peso = d => d.codigo_indec === prov ? 1e9 : m ? Math.abs(d[st.y] - (st.logy ? 10 ** (m.a + m.b * tX(d[st.x])) : m.a + m.b * tX(d[st.x]))) / (Math.abs(d[st.y]) + 1e-9) : 0;
    const puestas = [], et = [];
    [...todos].sort((a, b) => peso(b) - peso(a)).forEach(d => {
      const [px, py] = pos(d), rr = r(d.poblacion) + 3, txt = corto(d.territorio), w = txt.length * 6.1 + 2, h = 12;
      const lugares = [[px + rr, py + 4, "start"], [px - rr, py + 4, "end"], [px, py - rr - 3, "middle"], [px, py + rr + 11, "middle"]];
      for (const [lx, ly, an] of lugares) {
        const x0 = an === "start" ? lx : an === "end" ? lx - w : lx - w / 2, b = [x0, ly - h + 2, x0 + w, ly + 2];
        if (b[0] < 0 || b[2] > iw || b[1] < -30 || b[3] > ih) continue;
        const otras = cajas.filter((c, i) => todos[i] !== d);
        if (pisa(b, puestas) || pisa(b, otras)) continue;
        puestas.push(b); et.push({d, x: lx, y: ly, an}); return;
      }
    });
    const lab = g.append("g").selectAll("text").data(et).join("text").attr("class", l => "cx-lab" + (l.d.codigo_indec === prov ? " elegida" : "") + (st.fuera.has(l.d.codigo_indec) ? " fuera" : ""))
      .attr("x", l => l.x).attr("y", l => l.y).attr("text-anchor", l => l.an)
      .text(l => corto(l.d.territorio));
    if (anim && !REDUCIR) aparecer(lab, 500);
    // interacción
    const alternar = d => { st.fuera.has(d.codigo_indec) ? st.fuera.delete(d.codigo_indec) : st.fuera.add(d.codigo_indec); todo(true); };
    pts.on("click", (ev, d) => alternar(d))
      .on("keydown", (ev, d) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); alternar(d); } })
      .on("pointerenter", (ev, d) => {
        const [px, py] = pos(d), i = datos.indexOf(d);
        const res = m && i >= 0 ? `<br>${m.res[i] > 0 ? "Por encima" : "Por debajo"} de la recta` : "";
        mostrarTip(el, `<b>${d.territorio}</b><br>${X.nombre}: ${fm(st.x)(d[st.x])}<br>${Y.nombre}: ${fm(st.y)(d[st.y])}${res}`, px + (angosto ? 44 : 58), py + 34);
      }).on("pointerleave", ocultarTip);
    // leyenda de regiones
    document.getElementById("cx-leyenda").innerHTML = Object.entries(COLOR_REGION).map(([k, c]) => `<span><i style="background:${c}"></i>${k}</span>`).join("") +
      (st.tam ? `<span class="nota-tam">Tamaño: población</span>` : "");
    estadisticas(m, datos, X, Y);
  }

  function estadisticas(m, datos, X, Y) {
    const caja = document.getElementById("cx-stats"), lect = document.getElementById("cx-lectura"), resid = document.getElementById("cx-residuos");
    if (!m) { caja.innerHTML = ""; lect.textContent = "Hacen falta al menos cinco jurisdicciones con dato para calcular la relación."; resid.innerHTML = ""; return; }
    const xs = datos.map(f => tx(st.x, st.logx)(f[st.x])), ys = datos.map(f => tx(st.y, st.logy)(f[st.y]));
    const rho = spearman(xs, ys), log = st.logx || st.logy;
    caja.innerHTML = [["Jurisdicciones", m.n], ["r de Pearson", fr(m.r)], ["R²", fr(m.r2)], ["ρ de Spearman", fr(rho)], ["Valor p", fp(m.p)]]
      .map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join("") + (log ? `<div class="aclara">Calculado sobre el logaritmo de ${st.logx && st.logy ? "ambos ejes" : st.logx ? "el eje horizontal" : "el eje vertical"}</div>` : "");
    const sentido = `${m.r > 0 ? "positiva" : "negativa"}: las jurisdicciones con valores más altos en «${X.nombre}» tienden a tener valores ${m.r > 0 ? "más altos" : "más bajos"} en «${Y.nombre}»`;
    let t = `Con ${m.n} jurisdicciones, la relación es ${fuerza(m.r)} y ${Math.abs(m.r) < .1 ? "no muestra una tendencia clara" : sentido} (r = ${fr(m.r)}). `;
    t += m.p < .05 ? `Es poco probable que una relación así aparezca solo por azar (valor p ${fp(m.p)}). `
      : `Con tan pocos casos, una relación de este tamaño puede aparecer por azar (valor p ${fp(m.p)}), así que no alcanza para afirmar que existe. `;
    if (Math.abs(m.r - rho) > .2) t += `La correlación por rangos de Spearman es ${fr(rho)}: la diferencia indica que unos pocos casos extremos o una forma no lineal pesan en el resultado. `;
    const imax = m.cook.indexOf(Math.max(...m.cook));
    if (m.cook[imax] > 4 / m.n && m.n > 6) {
      const resto = datos.filter((_, i) => i !== imax), r2 = pearson(resto.map(f => tx(st.x, st.logx)(f[st.x])), resto.map(f => tx(st.y, st.logy)(f[st.y])));
      t += `${datos[imax].territorio} es la jurisdicción que más mueve la recta: sin ella, r sería ${fr(r2)}. `;
    }
    if (X.periodo !== Y.periodo) t += `Los datos no son del mismo período: ${X.nombre} es de ${X.periodo} y ${Y.nombre}, de ${Y.periodo}. `;
    lect.textContent = t.trim();
    if (st.anio != null && SER && conSerie()) t += ` Mostrando ${st.anio}: los valores son anuales y pueden diferir del último dato, que en algunos indicadores es un promedio de varios años.`;
    lect.textContent = t.trim();
    const conRes = datos.map((f, i) => ({f, e: m.res[i]})).sort((a, b) => b.e - a.e);
    const item = o => `<li><b>${o.f.territorio}</b> ${fm(st.y)(o.f[st.y])}</li>`;
    resid.innerHTML = `<div><h4>Más arriba de lo que marca la recta</h4><ol>${conRes.slice(0, 3).map(item).join("")}</ol></div>` +
      `<div><h4>Más abajo de lo que marca la recta</h4><ol>${conRes.slice(-3).reverse().map(item).join("")}</ol></div>`;
    // tabla del par
    document.getElementById("cx-tabla").innerHTML = `<thead><tr><th>Jurisdicción</th><th>Región</th><th class="n">${X.nombre}</th><th class="n">${Y.nombre}</th></tr></thead><tbody>` +
      [...FILAS].sort((a, b) => a.territorio.localeCompare(b.territorio, "es")).map(f => `<tr${f.codigo_indec === prov ? ' class="elegida"' : ""}><td>${f.territorio}${st.fuera.has(f.codigo_indec) ? " (fuera del cálculo)" : ""}</td><td>${f.region}</td>` +
        `<td class="n">${f[st.x] == null ? "s/d" : fm(st.x)(f[st.x])}</td><td class="n">${f[st.y] == null ? "s/d" : fm(st.y)(f[st.y])}</td></tr>`).join("") + `</tbody>`;
    document.getElementById("cx-fuentes").textContent = `${X.nombre}: ${X.unidad}, ${X.periodo}. Fuente: ${X.fuente}. ${Y.nombre}: ${Y.unidad}, ${Y.periodo}. Fuente: ${Y.fuente}.`;
  }

  /* ---- matriz de correlaciones ---- */
  function matriz() {
    const el = G("cruces-matriz"); if (!el || !el.offsetParent) return;
    const ids = R.cruces.map(m => m.id).filter(id => id !== "poblacion"), n = ids.length;
    const angosto = el.clientWidth < 620, izq = angosto ? 128 : 190, lado = Math.max(18, Math.min(36, (el.clientWidth - izq - 10) / n));
    el.innerHTML = "";
    const W = izq + lado * n + 10, H = lado * n + (angosto ? 120 : 170);
    const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("width", W).attr("role", "img")
      .attr("aria-label", "Matriz de correlaciones entre los indicadores provinciales");
    const color = d3.scaleLinear().domain([-1, 0, 1]).range(["#C8102E", "#F4F1EA", "#2C74B5"]);
    const celdas = [];
    ids.forEach((a, i) => ids.forEach((b, j) => {
      if (j >= i) return;
      const d = validos([a, b]); if (d.length < 8) return;
      const r = pearson(d.map(f => f[a]), d.map(f => f[b]));
      celdas.push({a, b, i, j, r, n: d.length, p: pT(r * Math.sqrt((d.length - 2) / (1 - r * r)), d.length - 2)});
    }));
    const g = svg.append("g").attr("transform", `translate(${izq},4)`);
    const cel = g.selectAll("g").data(celdas).join("g").attr("transform", d => `translate(${d.j * lado},${d.i * lado})`).attr("class", "cx-celda").attr("tabindex", 0).attr("role", "button")
      .attr("aria-label", d => `${META[d.a].nombre} y ${META[d.b].nombre}: r ${fr(d.r)}`);
    cel.append("rect").attr("width", lado - 2).attr("height", lado - 2).attr("fill", d => color(d.r));
    if (lado >= 26) cel.append("text").attr("x", (lado - 2) / 2).attr("y", (lado - 2) / 2).attr("dy", ".35em").attr("text-anchor", "middle")
      .attr("class", d => "cx-r" + (d.p < .05 ? " sig" : "")).attr("fill", d => Math.abs(d.r) > .55 ? "#fff" : css("--ink")).text(d => loc.format(".1f")(d.r).replace("-0,0", "0,0"));
    g.selectAll("text.fila").data(ids).join("text").attr("class", "etq-suave cx-mlab").attr("x", -8).attr("y", (d, i) => i * lado + lado / 2).attr("dy", ".35em").attr("text-anchor", "end")
      .text((d, i) => i === 0 ? "" : META[d].nombre.slice(0, angosto ? 18 : 30));
    // nombres de las columnas, debajo y en diagonal
    g.selectAll("text.col").data(ids.slice(0, -1)).join("text").attr("class", "etq-suave cx-mlab")
      .attr("transform", (d, j) => `translate(${j * lado + lado / 2},${n * lado + 4}) rotate(55)`).attr("dy", ".35em")
      .text(d => META[d].nombre.slice(0, angosto ? 16 : 26));
    const ir = d => { st.x = d.b; st.y = d.a; st.logx = st.logy = false; todo(false); document.getElementById("tab-cx-disp").click(); document.getElementById("f-cruces").scrollIntoView({behavior: REDUCIR ? "auto" : "smooth"}); };
    cel.on("click", (ev, d) => ir(d)).on("keydown", (ev, d) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); ir(d); } })
      .on("pointerenter", (ev, d) => mostrarTip(el, `<b>${META[d.a].nombre}</b> y <b>${META[d.b].nombre}</b><br>r = ${fr(d.r)}, ${d.n} jurisdicciones<br>valor p ${fp(d.p)}<br>Tocá para ver la dispersión`, izq + d.j * lado + lado / 2, d.i * lado))
      .on("pointerleave", ocultarTip);
    const sig = celdas.filter(c => c.p < .05).length;
    document.getElementById("cm-matriz-nota").textContent = `Cada celda es la correlación de Pearson entre dos indicadores, de −1 (rojo) a 1 (azul), con las ${FILAS.length - st.fuera.size} jurisdicciones incluidas. ` +
      `En negrita, las que tienen valor p menor a 0,05: son ${sig} de ${celdas.length} pares. Con tantos pares, unos ${Math.round(celdas.length * .05)} pueden dar significativos solo por azar, así que conviene mirar cada uno en la dispersión antes de sacar conclusiones. Tocá una celda para abrirla.`;
  }

  /* ---- regresión múltiple ---- */
  function multi(anim) {
    const el = G("cruces-multi"); if (!el || !el.offsetParent) return;
    const Y = META[st.my], xs = st.mx.filter(k => k !== st.my), out = document.getElementById("cm-lectura"), tab = document.getElementById("cm-tabla");
    el.innerHTML = "";
    if (!xs.length) { out.textContent = "Elegí al menos una variable explicativa."; tab.innerHTML = ""; return; }
    const d = validos([st.my, ...xs]);
    const res = d.length > xs.length + 3 ? multiple(d.map(f => f[st.my]), xs.map(k => d.map(f => f[k]))) : null;
    if (!res) { out.textContent = "No se puede estimar el modelo con estas variables: hay muy pocos casos o dos variables miden casi lo mismo."; tab.innerHTML = ""; return; }
    const filas = xs.map((k, j) => ({k, ...res.coef[j]}));
    const angosto = el.clientWidth < 560;
    const C = lienzo(el, filas.length * 46 + 50, {t: 30, r: 20, b: 16, l: angosto ? 130 : 210});
    const {g, iw} = C, ext = Math.max(1, d3.max(filas, f => Math.max(Math.abs(f.lo), Math.abs(f.hi))));
    const x = d3.scaleLinear().domain([-ext, ext]).nice().range([0, iw]), yb = d3.scaleBand().domain(xs).range([0, filas.length * 46]).padding(.3);
    g.append("g").attr("class", "eje").call(d3.axisTop(x).ticks(5).tickFormat(v => loc.format(",")(v)).tickSize(0).tickPadding(8)).call(a => a.select(".domain").remove());
    g.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", 0).attr("y2", filas.length * 46).attr("stroke", css("--ink")).attr("stroke-dasharray", "3 3");
    const f = g.selectAll("g.f").data(filas).join("g").attr("transform", r => `translate(0,${yb(r.k) + yb.bandwidth() / 2})`);
    const tramo = f.append("line").attr("x1", r => x(r.lo)).attr("x2", r => x(r.hi)).attr("stroke", r => r.p < .05 ? css("--azul") : css("--faint")).attr("stroke-width", 3);
    const pto = f.append("circle").attr("cx", r => x(r.b)).attr("r", 6.5).attr("fill", r => r.p < .05 ? css("--azul") : "#fff").attr("stroke", r => r.p < .05 ? css("--azul") : css("--faint")).attr("stroke-width", 2);
    f.append("text").attr("x", -10).attr("dy", ".35em").attr("text-anchor", "end").attr("class", "etq").text(r => META[r.k].nombre.slice(0, angosto ? 20 : 34));
    if (anim && !REDUCIR) { tramo.attr("x1", x(0)).attr("x2", x(0)).transition().duration(600).ease(EASE).attr("x1", r => x(r.lo)).attr("x2", r => x(r.hi)); pto.attr("cx", x(0)).transition().duration(600).ease(EASE).attr("cx", r => x(r.b)); }
    tab.innerHTML = `<thead><tr><th>Variable</th><th class="n">Coeficiente estandarizado</th><th class="n">Intervalo del 95%</th><th class="n">Valor p</th><th class="n">VIF</th></tr></thead><tbody>` +
      filas.map(r => `<tr><td>${META[r.k].nombre}</td><td class="n">${fr(r.b)}</td><td class="n">${fr(r.lo)} a ${fr(r.hi)}</td><td class="n">${fp(r.p)}</td><td class="n">${r.vif == null ? "s/d" : loc.format(",.1f")(r.vif)}</td></tr>`).join("") + `</tbody>`;
    const sig = filas.filter(r => r.p < .05);
    let t = `Con ${res.n} jurisdicciones, ${xs.length === 1 ? "la variable elegida explica" : `las ${xs.length} variables elegidas explican`} en conjunto el ${loc.format(",.0f")(res.r2 * 100)}% de las diferencias entre provincias en «${Y.nombre}» (R² ajustado ${fr(res.r2a)}, valor p del modelo ${fp(res.pF)}). `;
    t += sig.length ? `Con las demás variables fijas, ${lista(sig.map(r => `«${META[r.k].nombre}» (${r.b > 0 ? "relación positiva" : "relación negativa"})`))} ${sig.length > 1 ? "mantienen" : "mantiene"} una relación distinta de cero. `
      : `Ninguna variable tiene, por sí sola, una relación distinta de cero una vez que se consideran las demás. `;
    if (filas.some(r => r.vif > 5)) t += `Algunas variables explicativas están muy correlacionadas entre sí (VIF mayor a 5): sus coeficientes por separado no son confiables. `;
    if (xs.length > 3) t += `Con tan pocos casos, más de tres variables explicativas vuelven inestable la estimación. `;
    out.textContent = t.trim();
  }

  DIB["cruces-disp"] = dispersion; DIB["cruces-matriz"] = matriz; DIB["cruces-multi"] = multi;
  sincronizar();
  return {todo, pearson, spearman, simple};
})();

/* ---------- mapa de los departamentos: se carga solo al llegar ---------- */
const MAPA_DEP = (() => {
  const META = R.departamentos.meta, sel = document.getElementById("mp-ind");
  sel.innerHTML = Object.entries(META).map(([k, m]) => `<option value="${k}">${m.nombre}</option>`).join("");
  let ind = "homicidios", topo = null, filas = null, cargando = null;
  sel.addEventListener("change", () => { ind = sel.value; DIB["mapa-dep"](!REDUCIR); });
  document.getElementById("mp-pais").addEventListener("click", () => elegir(""));
  const cargar = () => cargando || (cargando = Promise.all([d3.json("datos/departamentos.topo.json"), d3.csv("datos/departamentos.csv", d3.autoType)])
    .then(([t, f]) => { topo = t; filas = Object.fromEntries(f.map(r => [String(r.id).padStart(5, "0"), r])); }));
  const MIN_POB = 10000;
  function dibujar(anim) {
    const el = G("mapa-dep"); if (!el || !el.offsetParent) return;
    if (!topo) { cargar().then(() => dibujar(anim)); return; }
    const m = META[ind], obj = topo.objects.departamentos, todos = topojson.feature(topo, obj).features;
    const enProv = NOMBRES[prov] ? todos.filter(f => f.properties.prov === prov) : todos;
    el.innerHTML = "";
    const w = Math.min(560, el.clientWidth), h = NOMBRES[prov] ? Math.round(w * 1.1) : Math.round(w * 1.55);
    const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${w} ${h + 44}`).attr("role", "img").attr("aria-label", `Mapa de ${m.nombre} por departamento`);
    const proy = d3.geoMercator().fitExtent([[6, 6], [w - 6, h - 6]], {type: "FeatureCollection", features: enProv}), camino = d3.geoPath(proy);
    const vals = todos.map(f => filas[f.properties.id]?.[ind]).filter(v => v != null);
    const cortes = d3.quantile(vals.sort(d3.ascending), .2) != null ? [.2, .4, .6, .8].map(q => d3.quantile(vals, q)) : [];
    const colores = ["#EEF5FC", "#BBD6EF", "#7FB0DD", "#3F86C6", "#1F5E97"];
    const escala = d3.scaleThreshold().domain(cortes).range(colores);
    const deps = svg.append("g").selectAll("path").data(enProv).join("path").attr("class", "dep").attr("d", camino)
      .attr("fill", f => { const v = filas[f.properties.id]?.[ind]; return v == null ? "#E4E9EF" : escala(v); });
    if (anim && !REDUCIR) deps.attr("opacity", 0).transition().delay((d, i) => Math.min(400, i * 2)).duration(300).attr("opacity", 1);
    const geoms = NOMBRES[prov] ? {type: "GeometryCollection", geometries: obj.geometries.filter(g => g.properties.prov === prov)} : obj;
    svg.append("path").attr("class", "limite").attr("d", camino(topojson.mesh(topo, geoms, (a, b) => a.properties.prov !== b.properties.prov || a === b)));
    const f1 = d3.format(",.1f"), fv = v => v == null ? "sin dato" : loc.format(",.1f")(v);
    deps.on("pointermove", (ev, f) => {
      const r = filas[f.properties.id] || {}, [mx, my] = d3.pointer(ev, el);
      mostrarTip(el, `<b>${f.properties.nombre}</b>, ${r.provincia || ""}<br>${m.nombre}: ${fv(r[ind])}` +
        (r.poblacion_identificada ? `<br>${n0(r.poblacion_identificada)} personas identificadas` : ""), mx, my);
    }).on("pointerleave", ocultarTip)
      .on("click", (ev, f) => { if (!NOMBRES[prov]) elegir(f.properties.prov); });
    // leyenda de quintiles
    const ley = svg.append("g").attr("transform", `translate(${Math.max(6, w / 2 - 125)},${h + 8})`);
    colores.forEach((c, i) => ley.append("rect").attr("x", i * 50).attr("width", 48).attr("height", 10).attr("fill", c));
    ["", ...cortes.map(v => loc.format(",.1f")(v))].forEach((t, i) => ley.append("text").attr("class", "mp-ley").attr("x", i * 50).attr("y", 26).attr("text-anchor", i ? "middle" : "start").text(t));
    // lista lateral
    const lugar = NOMBRES[prov] || "Todo el país";
    document.getElementById("mp-lugar").textContent = `${lugar}: ${m.nombre.toLowerCase()}`;
    document.getElementById("mp-pais").hidden = !NOMBRES[prov];
    const lista = enProv.map(f => ({f, r: filas[f.properties.id]})).filter(o => o.r && o.r[ind] != null && (o.r.poblacion_identificada || 0) >= MIN_POB)
      .sort((a, b) => b.r[ind] - a.r[ind]);
    const item = o => `<li>${o.f.properties.nombre}${NOMBRES[prov] ? "" : ` (${o.r.provincia})`} <span>${fv(o.r[ind])}</span></li>`;
    document.getElementById("mp-lista").innerHTML = lista.length
      ? `<h4>Valores más altos</h4><ol>${lista.slice(0, 5).map(item).join("")}</ol><h4>Valores más bajos</h4><ol>${lista.slice(-5).reverse().map(item).join("")}</ol>` : "";
    document.getElementById("mp-nota").textContent = `${m.nombre}: ${m.unidad}. Fuente: ${m.fuente}. El color divide a los departamentos en cinco grupos del mismo tamaño. ` +
      `En los departamentos con poca población, unos pocos casos mueven mucho una tasa, por eso las listas solo incluyen los que tienen al menos ${n0(MIN_POB)} personas identificadas y las tasas del SNIC usan el promedio de tres años. ` +
      `Los datos del SNIC son hechos registrados por las fuerzas de seguridad según el lugar donde ocurrieron. El RENAPER cuenta personas con DNI según su domicilio y publica la Ciudad de Buenos Aires sin separar por comuna, así que sus 15 comunas muestran el mismo valor. Tocá una provincia en el mapa para acercarte.`;
  }
  DIB["mapa-dep"] = dibujar;
})();

/* ---------- tu índice: pesos elegidos por cada persona, al estilo del Índice para una Vida Mejor de la OCDE ---------- */
const IX = (() => {
  const F = T.cruces_provincias, M = Object.fromEntries(R.cruces.map(m => [m.id, m]));
  const LOG = new Set(["exportaciones", "velocidad", "turistas_eti", "densidad"]);
  const DIMS = [
    {id: "salud", nombre: "Salud", c: "#C8102E", ind: [["esperanza_vida", 1], ["mortalidad_infantil", -1], ["sin_cobertura", -1]]},
    {id: "educacion", nombre: "Educación", c: "#2C74B5", ind: [["escolarizacion", 1], ["aprender_mat", 1], ["aprender_len", 1]]},
    {id: "trabajo", nombre: "Trabajo y producción", c: "#B27A00", ind: [["empleo_privado", 1], ["exportaciones", 1]]},
    {id: "vivienda", nombre: "Vivienda y servicios", c: "#7A4FA0", ind: [["agua_red", 1], ["cloaca", 1], ["nbi", -1]]},
    {id: "conectividad", nombre: "Conectividad", c: "#74ACDF", ind: [["internet", 1], ["computadora", 1], ["velocidad", 1]]},
    {id: "seguridad", nombre: "Seguridad", c: "#18212B", ind: [["homicidios", -1], ["robos", -1], ["viales", -1]]},
    {id: "ambiente", nombre: "Ambiente", c: "#3E8E5A", ind: [["protegida", 1]]},
  ].map(d => ({...d, ind: d.ind.filter(([k]) => M[k])})).filter(d => d.ind.length);
  // cada indicador va de 0 (el peor valor entre las 24) a 10 (el mejor)
  const escala = {};
  DIMS.forEach(d => d.ind.forEach(([k, sg]) => {
    const t = v => LOG.has(k) ? Math.log10(v) : v, vals = F.map(f => f[k]).filter(v => v != null).map(t);
    const lo = Math.min(...vals), hi = Math.max(...vals);
    escala[k] = v => v == null ? null : (sg > 0 ? (t(v) - lo) : (hi - t(v))) / (hi - lo) * 10;
  }));
  const puntaje = F.map(f => ({f, dim: Object.fromEntries(DIMS.map(d => {
    const v = d.ind.map(([k]) => escala[k](f[k])).filter(x => x != null);
    return [d.id, v.length ? v.reduce((a, b) => a + b, 0) / v.length : 5];
  }))}));
  let pesos = Object.fromEntries(DIMS.map(d => [d.id, 1]));
  const q = (new URLSearchParams(location.search).get("ix") || "").split(",").map(Number);
  if (q.length === DIMS.length && q.every(v => v >= 0 && v <= 5)) DIMS.forEach((d, i) => pesos[d.id] = q[i]);
  const total = (p, w) => { const sw = DIMS.reduce((a, d) => a + w[d.id], 0) || 1; return DIMS.reduce((a, d) => a + w[d.id] * p.dim[d.id], 0) / sw; };
  const iguales = Object.fromEntries(DIMS.map(d => [d.id, 1]));
  const ordenIgual = [...puntaje].sort((a, b) => total(b, iguales) - total(a, iguales)).map(p => p.f.codigo_indec);

  const caja = document.getElementById("ix-pesos");
  caja.innerHTML = DIMS.map(d => `<label class="ix-peso"><i style="background:${d.c}"></i><span>${d.nombre}</span><output id="ixo-${d.id}">${pesos[d.id]}</output>
    <input type="range" min="0" max="5" step="1" value="${pesos[d.id]}" data-d="${d.id}" aria-label="Peso de ${d.nombre}">
    <small>${d.ind.map(([k]) => M[k].nombre).join(", ")}</small></label>`).join("") +
    `<button type="button" class="boton chico ix-reset" id="ix-reset">Pesos iguales</button>`;
  const guardar = () => { const u = new URL(location.href); u.searchParams.set("ix", DIMS.map(d => pesos[d.id]).join(",")); history.replaceState(null, "", u); };
  caja.addEventListener("input", ev => {
    const i = ev.target.closest("input"); if (!i) return;
    pesos[i.dataset.d] = +i.value; document.getElementById(`ixo-${i.dataset.d}`).textContent = i.value; guardar(); dibujar(true);
  });
  document.getElementById("ix-reset").addEventListener("click", () => {
    pesos = {...iguales}; caja.querySelectorAll("input").forEach(i => { i.value = 1; document.getElementById(`ixo-${i.dataset.d}`).textContent = 1; }); guardar(); dibujar(true);
  });
  document.getElementById("ix-leyenda").innerHTML = DIMS.map(d => `<span><i style="background:${d.c}"></i>${d.nombre}</span>`).join("");
  document.getElementById("ix-nota").textContent = "Cada indicador se lleva a una escala de 0 a 10, donde 0 es el peor valor entre las 24 jurisdicciones y 10 el mejor. Exportaciones y velocidad de internet se miden en logaritmo, para que un valor extremo no aplaste al resto. Cada dimensión es el promedio de sus indicadores y el índice es el promedio de las dimensiones según los pesos elegidos. Los indicadores son de años distintos, entre 2022 y 2026, y cada barra muestra cuánto aporta cada dimensión. No es un índice oficial: es una forma de ver qué pasa con el orden según lo que cada uno valora. Los pesos elegidos quedan en el enlace para compartirlo.";

  let yPrev = {};
  function dibujar(anim) {
    const el = G("indice"); if (!el || !el.offsetParent) return;
    const sw = DIMS.reduce((a, d) => a + pesos[d.id], 0);
    const datos = [...puntaje].map(p => ({...p, t: total(p, pesos)})).sort((a, b) => b.t - a.t);
    const angosto = el.clientWidth < 520, fila = angosto ? 20 : 24;
    const C = lienzo(el, datos.length * fila + 30, {t: 22, r: 44, b: 8, l: angosto ? 112 : 140});
    const {g, iw} = C, x = d3.scaleLinear().domain([0, 10]).range([0, iw]);
    g.append("g").attr("class", "eje").call(d3.axisTop(x).ticks(5).tickSize(0).tickPadding(6)).call(a => a.select(".domain").remove());
    const filas = g.selectAll("g.f").data(datos, d => d.f.codigo_indec).join("g").attr("class", "f")
      .attr("opacity", d => prov && d.f.codigo_indec !== prov ? .6 : 1);
    const destino = (d, i) => `translate(0,${i * fila})`;
    filas.attr("transform", (d, i) => yPrev[d.f.codigo_indec] != null ? `translate(0,${yPrev[d.f.codigo_indec]})` : destino(d, i));
    if (anim && !REDUCIR) filas.transition().duration(500).ease(EASE).attr("transform", destino); else filas.attr("transform", destino);
    yPrev = Object.fromEntries(datos.map((d, i) => [d.f.codigo_indec, i * fila]));
    filas.each(function(d) {
      let acc = 0; const gg = d3.select(this);
      DIMS.forEach(dim => {
        const w = sw ? pesos[dim.id] * d.dim[dim.id] / sw : 0;
        gg.append("rect").attr("x", x(acc)).attr("y", 4).attr("height", fila - 9).attr("width", Math.max(0, x(w) - x(0))).attr("fill", dim.c).attr("opacity", .88);
        acc += w;
      });
    });
    filas.append("text").attr("x", -8).attr("y", fila / 2).attr("dy", ".1em").attr("text-anchor", "end")
      .attr("class", d => d.f.codigo_indec === prov ? "etq-fuerte" : "etq").text((d, i) => `${i + 1}. ${d.f.territorio}`);
    filas.append("text").attr("x", d => x(d.t) + 6).attr("y", fila / 2).attr("dy", ".1em").attr("class", "etq-suave").text(d => n1(d.t));
    filas.on("pointerenter", function(ev, d) {
      const [mx, my] = d3.pointer(ev, el);
      mostrarTip(el, `<b>${d.f.territorio}: ${n1(d.t)}</b><br>` + DIMS.map(dim => `<span style="color:${dim.c}">●</span> ${dim.nombre}: ${n1(d.dim[dim.id])}`).join("<br>"), mx, my);
    }).on("pointerleave", ocultarTip);
    // lectura
    const pos = c => datos.findIndex(d => d.f.codigo_indec === c) + 1;
    const mov = datos.map(d => ({d, m: ordenIgual.indexOf(d.f.codigo_indec) + 1 - pos(d.f.codigo_indec)})).sort((a, b) => Math.abs(b.m) - Math.abs(a.m))[0];
    let t = sw === 0 ? "Todos los pesos están en cero: subí al menos uno." :
      `Con estos pesos, ${datos[0].f.territorio} queda primera, con ${n1(datos[0].t)} puntos de 10, y ${datos[datos.length - 1].f.territorio} última, con ${n1(datos[datos.length - 1].t)}.`;
    if (sw && prov) t += ` ${NOMBRES[prov]} queda en el puesto ${pos(prov)}.`;
    if (sw && mov.m) t += ` Frente a pesos iguales, la que más cambia es ${mov.d.f.territorio}: ${mov.m > 0 ? "sube" : "baja"} ${Math.abs(mov.m)} ${Math.abs(mov.m) === 1 ? "puesto" : "puestos"}.`;
    document.getElementById("ix-lectura").textContent = t;
  }
  DIB.indice = dibujar;
  return {puntaje, DIMS};
})();

/* ---------- provincias parecidas y "si tu provincia fuera un país" ---------- */
const PARECIDAS = (() => {
  const F = T.cruces_provincias, ids = R.cruces.map(m => m.id).filter(k => k !== "poblacion");
  const LOG = new Set(["exportaciones", "velocidad", "turistas_eti", "densidad", "robos"]);
  const z = {};
  ids.forEach(k => {
    const t = v => LOG.has(k) ? Math.log10(v) : v, vals = F.map(f => f[k]).filter(v => v != null).map(t);
    const m = vals.reduce((a, b) => a + b, 0) / vals.length, s = Math.sqrt(vals.reduce((a, v) => a + (v - m) ** 2, 0) / (vals.length - 1));
    z[k] = v => v == null ? null : (t(v) - m) / s;
  });
  const dist = (a, b) => { let s = 0, n = 0; ids.forEach(k => { const x = z[k](a[k]), y = z[k](b[k]); if (x != null && y != null) { s += (x - y) ** 2; n++; } }); return Math.sqrt(s / n); };
  return c => {
    const a = F.find(f => f.codigo_indec === c); if (!a) return [];
    return F.filter(f => f !== a).map(f => ({f, d: dist(a, f)})).sort((p, q) => p.d - q.d);
  };
})();
function pintarExtra() {
  const caja = document.getElementById("prov-extra"); if (!caja) return;
  if (!NOMBRES[prov]) {
    caja.innerHTML = `<div><h3>Provincias parecidas</h3><p class="suave">Elegí una provincia para ver cuáles se le parecen más en los ${R.cruces.length - 1} indicadores del explorador.</p></div>` +
      `<div><h3>Si tu provincia fuera un país</h3><p class="suave">Elegí una provincia para compararla con los países del mundo.</p></div>`;
    return;
  }
  const lista = PARECIDAS(prov), ev = T.esperanza_vida_provincias.find(d => d.codigo_indec === prov), mi = T.mortalidad_infantil_provincias.find(d => d.codigo_indec === prov);
  const cerca = (k, v) => T.mundo_paises.filter(p => p[k] != null).sort((a, b) => Math.abs(a[k] - v) - Math.abs(b[k] - v))[0];
  const pe = ev && cerca("esperanza_vida", ev.total), pm = mi && cerca("mortalidad_infantil", mi.tmi_actual);
  caja.innerHTML = `<div><h3>Provincias más parecidas a ${NOMBRES[prov]}</h3><ol>` +
    lista.slice(0, 3).map(o => `<li><button type="button" class="enlace" data-c="${o.f.codigo_indec}">${o.f.territorio}</button></li>`).join("") + `</ol>` +
    `<p class="suave">La más distinta es ${lista[lista.length - 1].f.territorio}. Se compara la distancia en los ${R.cruces.length - 1} indicadores del explorador, cada uno medido en desvíos respecto del promedio de las 24.</p></div>` +
    `<div><h3>Si ${NOMBRES[prov]} fuera un país</h3><ul>` +
    (pe ? `<li>Su esperanza de vida, ${n1(ev.total)} años en ${nv.ev_anio}, se parece a la de <b>${pe.pais}</b> (${n1(pe.esperanza_vida)}).</li>` : "") +
    (pm ? `<li>Su mortalidad infantil, ${n1(mi.tmi_actual)} cada 1.000 nacidos vivos en ${mo.tri_act}, se parece a la de <b>${pm.pais}</b> (${n1(pm.mortalidad_infantil)} en ${pm.mortalidad_infantil_anio}).</li>` : "") +
    `</ul><p class="suave">Países según el Banco Mundial. La Argentina en su conjunto tiene ${n1(nv.ev_pais)} años de esperanza de vida y el promedio de la OCDE, ${n1(OC.esperanza_vida.ocde)}.</p></div>`;
  caja.querySelectorAll("button[data-c]").forEach(b => b.addEventListener("click", () => elegir(b.dataset.c)));
}

document.querySelectorAll(".conmutador:not(.pestanas)").forEach(conm => {
  const k = conm.dataset.g;
  conm.querySelectorAll("button").forEach((b, i) => b.addEventListener("click", () => {
    if (MED[k] === b.dataset.m) return;
    MED[k] = b.dataset.m;
    conm.style.setProperty("--i", i);
    conm.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b));
    DIB[k](!REDUCIR);
  }));
});

/* ---------- pestañas dentro de una tarjeta ---------- */
document.querySelectorAll(".pestanas").forEach(tl => {
  const tabs = [...tl.querySelectorAll('[role="tab"]')];
  const mostrar = (t, foco) => {
    tabs.forEach((x, i) => {
      const on = x === t; x.setAttribute("aria-selected", on); x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute("aria-controls")).hidden = !on;
      if (on) tl.style.setProperty("--i", i);
    });
    if (foco) t.focus();
    // los gráficos de una pestaña oculta no tienen ancho: se dibujan al mostrarse
    document.getElementById(t.getAttribute("aria-controls")).querySelectorAll(".grafico[data-g]").forEach(gr => DIB[gr.dataset.g] && DIB[gr.dataset.g](!REDUCIR));
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => mostrar(t));
    t.addEventListener("keydown", ev => {
      const d = ev.key === "ArrowRight" ? 1 : ev.key === "ArrowLeft" ? -1 : 0;
      if (d) { ev.preventDefault(); mostrar(tabs[(i + d + tabs.length) % tabs.length], true); }
    });
  });
});

/* ---------- listado de áreas protegidas nacionales ---------- */
function tablaAreas() {
  const t = document.getElementById("tabla-areas");
  t.innerHTML = `<thead><tr><th>Área</th><th>Categoría</th><th>Dónde</th><th class="n">Año</th><th class="n">Hectáreas</th></tr></thead><tbody>` +
    T.parques_nacionales_lista.map(d => `<tr${NOMBRES[prov] && d.lugar.includes(NOMBRES[prov]) ? ' class="elegida"' : ""}><td>${d.nombre}</td><td>${d.caracter}</td><td>${d.lugar}</td>` +
      `<td class="n">${d.anio}</td><td class="n">${n0(d.hectareas)}</td></tr>`).join("") + `</tbody>`;
}

/* ---------- tarjetas: etiqueta, cifra clave y acciones ---------- */
const sg = v => (v > 0 ? "+" : "") + pct(v);
// Cifra destacada de cada ficha. La sección de salud mental no lleva cifra destacada, para no dramatizar.
const CLAVE = {
  "f-hogares": [pct(e.pct_res_2025), "de la electricidad demandada en el país en 2025 correspondió a los hogares"],
  "f-actividad": [sg(e.crec_total), `creció la demanda eléctrica total entre 2005 y 2025. La actividad económica creció ${pct(e.crec_emae)}`],
  "f-meses": [sg(e.dif_max_min), `más demanda eléctrica en ${e.mes_max} que en ${e.mes_min}, promedio de 2023 a 2025`],
  "f-adolescentes": [n1(nac.pct_2024), `de cada 100 nacimientos de 2024 fueron de madres de 10 a 19 años. En 2012 eran ${n1(nac.pct_2012)}`],
  "f-mortalidad": [n1(mo.tasa), `muertes de menores de un año por cada 1.000 nacidos vivos en ${mo.anio}`],
  "f-pisa": [String(pz.mat), `puntos obtuvo la Argentina en matemática en PISA ${pz.anio}. El promedio de la OCDE fue ${pz.ocde_mat}`],
  "f-escolarizacion": [pct(es.pais_fin), `de los adolescentes en edad de cursar la secundaria estaba matriculado en ese nivel en ${es.fin}`],
  "f-aprender": [pct(ap.mat), `de los estudiantes de 6° grado alcanzó un nivel satisfactorio o avanzado en matemática en Aprender ${ap.anio}`],
  "f-empleo": [n1(em.cada_100_pais), `personas asalariadas registradas en el sector privado por cada 100 habitantes, ${em.mes}`],
  "f-protegida": [pct(nt.pct), `del territorio continental del país está dentro de áreas protegidas, ${nt.anio}`],
  "f-parques": [n0(nt.pn_n), `áreas protegidas nacionales. Las primeras se crearon en ${nt.pn_primera_anio}`],
  "f-especies": [n0(nt.esp_top_v), `especies animales registradas en ${nt.esp_top}, el área nacional con más registros`],
  "f-visitas": [n1(nt.vis / 1e6), `millones de visitas a parques nacionales en ${nt.vis_anio}`],
  "f-receptivo": [n1(tu.turistas / 1e6), `millones de turistas no residentes llegaron al país en ${tu.anio}`],
  "f-hoteles": [n1(tu.eoh_total), `millones de viajeros se hospedaron en hoteles y parahoteles en ${tu.eoh_anio}`],
  "f-eti": [n0(tu.eti_top_v), `turistas extranjeros que salieron por Ezeiza o Aeroparque visitaron ${tu.eti_top} en ${tu.eti_anio}`],
  "f-pobreza": [pct(R.pobreza.pob), `de las personas de los 31 aglomerados urbanos estaba bajo la línea de pobreza en el ${R.pobreza.sem}`],
  "f-sube-modos": [`${n0(su.tren_miles)} mil`, `tarjetas SUBE usadas en trenes en un día hábil típico de ${su.mes}`],
  "f-patentes": [n0(au.motos), `motos nuevas se inscribieron en ${au.anio}, más que autos (${n0(au.autos)})`],
  "f-patentes-prov": [n1(au.pais_1000), `autos nuevos cada 1.000 habitantes en ${au.anio}`],
  "f-visitas-parque": [n0(vpq.top_v), `visitas recibió ${vpq.top}, el parque nacional más visitado en 2022`],
  "f-pesca": [n0(pe.total), `toneladas de pescados y mariscos desembarcadas en ${pe.anio}`],
  "f-pesca-rio": [pct(pe.rio_top_pct), `de la pesca comercial en ríos de ${pe.rio_anio} fue ${pe.rio_top.toLowerCase()}`],
  "f-nombres": [cu.nena, `y ${cu.varon} fueron los nombres más elegidos para los bebés en ${cu.nom_anio}`],
  "f-carne": [`${n1(cu.carne_v)} kg`, `de carne vacuna por habitante en ${cu.carne_anio}. En ${cu.carne_ini} eran ${n1(cu.carne_ini_v)} kg`],
  "f-vino": [n0(cu.vino_v), `millones de litros de vino vendidos en el país en ${cu.vino_anio}`],
  "f-yerba": [n1(cu.yerba_v), `millones de kilos de yerba mate salieron de los molinos en ${cu.yerba_anio}`],
  "f-glaciares": [n0(cu.gl_total), `glaciares inventariados en ${cu.gl_n} provincias`],
  "f-clima": [grados(cu.cl_max), `en ${cu.cl_max_anio}, el año más cálido desde ${cu.cl_ini}`],
  "f-esperanza": [n1(nv.ev_pais), `años de esperanza de vida al nacer en el país en ${nv.ev_anio}`],
  "f-exportaciones": [n0(nv.ex_pc_pais), `dólares por habitante exportó el país en ${nv.ex_anio}`],
  "f-censo": [pct(nv.censo.cloaca), `de los hogares tenía desagüe a red cloacal en el Censo 2022`],
  "f-internet": [n1(nv.in_top_v), `accesos a internet fijo cada 100 hogares en ${nv.in_top}, el valor más alto, en el ${nv.in_trim}`],
  "f-extranjeros": [n1(nv.xt_pais), `personas nacidas en otro país cada 100 habitantes, junio de 2026`],
  "f-fiscal": [pct(R.fiscal.mediana), `de los ingresos de la provincia del medio fueron recursos propios en ${R.fiscal.anio}. El resto llegó de la Nación`],
  "f-empresas": [n0(EM.total_pais), `empresas privadas con personal en relación de dependencia en ${EM.anio}, ${n1(EM.pais_1000)} cada 1.000 habitantes`],
  "f-dinamica-empresas": [n0(EM.ap), `empresas con empleados abrieron en ${EM.ult} y ${n0(EM.ci)} cerraron`],
  "f-rotacion": [pct(RO.total), `de las personas asalariadas de los 31 aglomerados urbanos llevaba un año o menos en su empleo, entre el ${trim(RO.desde)} y el ${trim(RO.hasta)}`],
  "f-sube": [n2(su.total_millones),`millones de tarjetas SUBE distintas usadas en un día hábil típico de ${su.mes}`],
};
const esc = t => String(t).replace(/[&<>"]/g, c => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;"})[c]);
const nTabla = loc.format(",.2~f");
// Tabla de la ficha dentro de la tarjeta (idea de USAFacts), con las mismas filas que el CSV
function tablaDatos(filas) {
  const MAX = 300, todas = Object.keys(filas[0]);
  const cols = todas.includes("territorio") ? ["territorio", ...todas.filter(c => c !== "territorio" && c !== "codigo_indec")] : todas;
  const anio = c => filas.every(r => r[c] == null || (Number.isInteger(r[c]) && r[c] >= 1800 && r[c] <= 2100));
  const num = Object.fromEntries(cols.map(c => [c, filas.some(r => typeof r[c] === "number")]));
  const v = (r, c) => r[c] == null ? "" : typeof r[c] === "number" ? (anio(c) ? String(r[c]) : nTabla(r[c])) : Array.isArray(r[c]) ? r[c].join(", ") : typeof r[c] === "object" ? JSON.stringify(r[c]) : r[c];
  return `<div class="tabla-desliza"><table class="tabla-areas"><thead><tr>${cols.map(c => `<th${num[c] ? ' class="n"' : ""}>${esc(c.replace(/_/g, " "))}</th>`).join("")}</tr></thead><tbody>` +
    filas.slice(0, MAX).map(r => `<tr${prov && r.codigo_indec === prov ? ' class="elegida"' : ""}>${cols.map(c => `<td${num[c] ? ' class="n"' : ""}>${esc(v(r, c))}</td>`).join("")}</tr>`).join("") +
    `</tbody></table></div><p class="tabla-nota">${filas.length > MAX ? `Primeras ${MAX} filas de ${n0(filas.length)}. ` : ""}La tabla completa está en el CSV.</p>`;
}
// Imagen de la ficha: título, texto, gráfico y fuente en un PNG de doble resolución
const svgUnico = f => { const v = [...f.querySelectorAll(".grafico svg")].filter(s => s.getBoundingClientRect().width > 0 && s.viewBox?.baseVal?.width); return v.length === 1 ? v[0] : null; };
async function imagenFicha(f) {
  // se vuelve a dibujar sin animación para no capturar barras o líneas a medio camino
  const gr = svgUnico(f)?.closest(".grafico[data-g]");
  if (gr && DIB[gr.dataset.g]) DIB[gr.dataset.g](false);
  const svg = svgUnico(f); if (!svg) return;
  const vb = svg.viewBox.baseVal, w = vb.width, h = vb.height;
  const clon = svg.cloneNode(true), orig = [svg, ...svg.querySelectorAll("*")], copia = [clon, ...clon.querySelectorAll("*")];
  const P = ["fill", "fill-opacity", "stroke", "stroke-width", "stroke-dasharray", "stroke-opacity", "stroke-linejoin", "stroke-linecap", "paint-order",
    "opacity", "font-family", "font-size", "font-weight", "text-anchor", "dominant-baseline", "letter-spacing"];
  orig.forEach((n, i) => { const cs = getComputedStyle(n); copia[i].setAttribute("style", P.map(k => `${k}:${cs.getPropertyValue(k)}`).join(";")); });
  clon.setAttribute("xmlns", "http://www.w3.org/2000/svg"); clon.setAttribute("width", w); clon.setAttribute("height", h);
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clon)], {type: "image/svg+xml;charset=utf-8"}));
  const img = new Image();
  await new Promise((ok, mal) => { img.onload = ok; img.onerror = mal; img.src = url; });
  const E = 2, pad = 32, W = Math.max(w, 600) + pad * 2, F = css("--f") || "Roboto, Verdana, sans-serif";
  const med = document.createElement("canvas").getContext("2d");
  const envolver = (t, font) => {
    med.font = font; const lin = []; let l = "";
    t.split(/\s+/).filter(Boolean).forEach(p => { const n = l ? l + " " + p : p; if (l && med.measureText(n).width > W - pad * 2) { lin.push(l); l = p; } else l = n; });
    if (l) lin.push(l); return lin;
  };
  const fT = `600 24px ${F}`, fL = `400 15px ${F}`, fP = `400 12px ${F}`;
  const tit = envolver(f.querySelector("h3").textContent, fT), lead = envolver(f.querySelector(".lead")?.textContent || "", fL);
  const pieL = envolver(`${f.querySelector(".pie span")?.textContent || ""}. Datina, ${location.host}${location.pathname}#${f.id}`, fP);
  const H = pad + tit.length * 30 + 10 + lead.length * 21 + 18 + h + 22 + pieL.length * 17 + pad;
  const cv = document.createElement("canvas"); cv.width = W * E; cv.height = H * E;
  const ctx = cv.getContext("2d"); ctx.scale(E, E); ctx.textBaseline = "top";
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
  let yy = pad;
  ctx.fillStyle = css("--azul"); ctx.font = fT; tit.forEach(l => { ctx.fillText(l, pad, yy); yy += 30; }); yy += 10;
  ctx.fillStyle = css("--ink"); ctx.font = fL; lead.forEach(l => { ctx.fillText(l, pad, yy); yy += 21; }); yy += 18;
  ctx.drawImage(img, pad + (W - pad * 2 - w) / 2, yy, w, h); yy += h + 12;
  ctx.strokeStyle = css("--azul"); ctx.setLineDash([1, 3]); ctx.beginPath(); ctx.moveTo(pad, yy); ctx.lineTo(W - pad, yy); ctx.stroke(); yy += 10;
  ctx.fillStyle = css("--muted"); ctx.font = fP; pieL.forEach(l => { ctx.fillText(l, pad, yy); yy += 17; });
  URL.revokeObjectURL(url);
  cv.toBlob(b => {
    const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `datina-${f.id.slice(2)}.png`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }, "image/png");
}
document.querySelectorAll("article.ficha").forEach(f => {
  const h3 = f.querySelector("h3");
  const tema = f.closest(".tema")?.querySelector("h2")?.textContent;
  if (tema) h3.insertAdjacentHTML("beforebegin", `<span class="etiqueta">${tema}</span>`);
  const c = CLAVE[f.id];
  if (c) h3.insertAdjacentHTML("afterend", `<p class="clave"><span class="num">${c[0]}</span><span class="txt">${c[1]}</span></p>`);
  const pie = f.querySelector(".pie"), csv = pie.querySelector("a");
  const acc = document.createElement("div"); acc.className = "acciones";
  const nombre = (csv.getAttribute("href").match(/datos\/(\w+)\.csv/) || [])[1], filas = nombre && T[nombre];
  const conTabla = nombre && DIFERIDAS[nombre] || Array.isArray(filas) && filas.length > 0 && typeof filas[0] === "object";
  acc.innerHTML = `<button type="button" class="boton chico accion copiar"><span class="lbl">Copiar enlace</span></button>` +
    (conTabla ? `<button type="button" class="boton chico accion ver-tabla" aria-expanded="false"><span class="lbl">Ver tabla</span></button>` : "") +
    (f.querySelector(".grafico[data-g]") ? `<button type="button" class="boton chico accion imagen" hidden><span class="lbl">Descargar imagen</span></button>` : "");
  csv.className = "boton chico accion"; csv.innerHTML = `<span class="lbl">Descargar CSV</span>`;
  acc.appendChild(csv); pie.appendChild(acc);
  acc.querySelector(".ver-tabla")?.addEventListener("click", async ev => {
    const b = ev.currentTarget, abierta = b.getAttribute("aria-expanded") === "true";
    if (b.dataset.cargando) return;
    let caja = f.querySelector(".tabla-datos");
    if (!caja) { b.dataset.cargando = "1"; const t = await cargarTabla(nombre).finally(() => delete b.dataset.cargando); caja = document.createElement("div"); caja.className = "tabla-datos"; caja.innerHTML = tablaDatos(t); pie.before(caja); }
    caja.hidden = abierta; b.setAttribute("aria-expanded", String(!abierta));
    b.querySelector(".lbl").textContent = abierta ? "Ver tabla" : "Ocultar tabla";
  });
  acc.querySelector(".imagen")?.addEventListener("click", ev => {
    const l = ev.currentTarget.querySelector(".lbl");
    imagenFicha(f).catch(() => { l.textContent = "No se pudo"; clearTimeout(l._t); l._t = setTimeout(() => { l.textContent = "Descargar imagen"; }, 1800); });
  });
  const lbl = acc.querySelector(".copiar .lbl");
  const cambiar = t => { lbl.classList.add("cambia"); setTimeout(() => { lbl.textContent = t; lbl.classList.remove("cambia"); }, 120); };
  acc.querySelector(".copiar").addEventListener("click", async () => {
    const url = location.origin + location.pathname + (prov ? "?prov=" + prov : "") + "#" + f.id;
    let ok = false;
    try { await navigator.clipboard.writeText(url); ok = true; }
    catch (_) {
      // alternativa para navegadores que bloquean el portapapeles
      const ta = document.createElement("textarea"); ta.value = url; ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(ta); ta.select();
      try { ok = document.execCommand("copy"); } catch (_) {}
      ta.remove();
    }
    cambiar(ok ? "Enlace copiado" : "No se pudo copiar");
    clearTimeout(lbl._t); lbl._t = setTimeout(() => cambiar("Copiar enlace"), 1800);
  });
});

/* ---------- las 24: perfil de la provincia elegida ---------- */
// Solo indicadores con dato por provincia. Las tasas de suicidio quedan fuera: no se presentan como ranking.
const INDP = [
  {id:"f-mortalidad", lab:"Mortalidad infantil", det:`muertes de menores de un año cada 1.000 nacidos vivos, promedio ${mo.tri_act}`,
    d:T.mortalidad_infantil_provincias, k:"tmi_actual", pais:mo.pais_act, f:n1, ocde:OC.mortalidad_infantil.ocde},
  {id:"f-adolescentes", lab:"Maternidad adolescente", det:"% de los nacimientos de 2024 con madres de 10 a 19 años",
    d:T.madres_adolescentes_provincias, k:"pct_2024", pais:nac.pct_2024, f:pct},
  {id:"f-escolarizacion", lab:"Escolarización secundaria", det:`tasa neta de escolarización, ${es.fin}`,
    d:T.escolarizacion_secundaria_provincias, k:"tasa_final", pais:es.pais_fin, f:pct},
  {id:"f-aprender", lab:"Aprender, matemática", det:`% de 6° grado con nivel satisfactorio o avanzado, ${ap.anio}`,
    d:T.aprender_provincias, k:"mat_logra", pais:ap.mat, f:pct},
  {id:"f-aprender", lab:"Aprender, lengua", det:`% de 6° grado con nivel satisfactorio o avanzado, ${ap.anio}`,
    d:T.aprender_provincias, k:"len_logra", pais:ap.len, f:pct},
  {id:"f-empleo", lab:"Empleo privado registrado", det:`asalariados cada 100 habitantes, ${em.mes}`,
    d:T.empleo_provincias, k:"cada_100", pais:em.cada_100_pais, f:n1},
  {id:"f-empleo", lab:"Variación del empleo privado", det:`% en los doce meses a ${em.mes}`,
    d:T.empleo_provincias, k:"var_12m", pais:em.var_nac, f:sg},
  {id:"f-protegida", lab:"Territorio protegido", det:`% de la superficie dentro de áreas protegidas, ${nt.anio}`,
    d:T.areas_protegidas_provincias, k:"pct_territorio", pais:nt.pct, f:pct, ocde:OC.protegida.ocde},
  {id:"f-esperanza", lab:"Esperanza de vida", det:`años al nacer, ambos sexos, ${nv.ev_anio}`,
    d:T.esperanza_vida_provincias, k:"total", pais:nv.ev_pais, f:n1, ocde:OC.esperanza_vida.ocde},
  {id:"f-censo", lab:"Sin cobertura de salud", det:"% de las personas sin obra social, prepaga ni plan estatal, 2022",
    d:T.censo2022_provincias, k:"sin_cobertura", pais:nv.censo.sin_cobertura, f:pct},
  {id:"f-censo", lab:"Cloacas", det:"% de los hogares con desagüe a red cloacal, 2022",
    d:T.censo2022_provincias, k:"cloaca", pais:nv.censo.cloaca, f:pct},
  {id:"f-censo", lab:"Internet en el hogar", det:"% de los hogares, 2022",
    d:T.censo2022_provincias, k:"internet", pais:nv.censo.internet, f:pct},
  {id:"f-exportaciones", lab:"Exportaciones", det:`dólares por habitante, ${nv.ex_anio}`,
    d:T.exportaciones_provincias, k:"usd_por_habitante", pais:nv.ex_pc_pais, f:n0},
  {id:"f-fiscal", lab:"Recursos propios", det:`% de los ingresos totales de la provincia, ${R.fiscal.anio}`,
    d:T.fiscal_provincias, k:"autonomia", pais:R.fiscal.mediana, f:pct},
  {id:"f-eti", lab:"Turistas extranjeros", det:`cada 1.000 habitantes, salidos por Ezeiza o Aeroparque, ${tu.eti_anio}`,
    d:T.turistas_extranjeros_provincias, k:"cada_1000", pais:null, f:n1},
];
const grilla = document.getElementById("prov-grid");
grilla.innerHTML = INDP.map((c, i) => `<a class="tarjeta dp" href="#${c.id}" data-i="${i}"><span class="dp-lab">${c.lab}</span>
  <span class="dp-num"></span><span class="dp-det">${c.det}</span><svg class="dp-tira" aria-hidden="true"></svg><span class="dp-pos"></span></a>`).join("");
// Tira con las 24 provincias: puntos claros, raya oscura para el país y punto grande para la elegida
function tiras() {
  grilla.querySelectorAll(".dp").forEach(el => {
    const c = INDP[+el.dataset.i], nodo = el.querySelector(".dp-tira"), svg = d3.select(nodo);
    const w = Math.max(160, nodo.clientWidth || 200), h = 26;
    svg.attr("viewBox", `0 0 ${w} ${h}`).selectAll("*").remove();
    c.x = d3.scaleLinear().domain(d3.extent([...c.d.map(d => d[c.k]), ...(c.pais == null ? [] : [c.pais])])).range([7, w - 7]);
    svg.append("line").attr("x1", 7).attr("x2", w - 7).attr("y1", h/2).attr("y2", h/2).attr("stroke", css("--line")).attr("stroke-width", 2);
    svg.selectAll("circle.o").data(c.d).join("circle").attr("class","o").attr("cx", d => c.x(d[c.k])).attr("cy", h/2).attr("r", 3.2)
      .attr("fill", css("--celeste")).attr("opacity", .45);
    if (c.pais != null) svg.append("line").attr("x1", c.x(c.pais)).attr("x2", c.x(c.pais)).attr("y1", 4).attr("y2", h - 4).attr("stroke", css("--ink")).attr("stroke-width", 1.5);
    svg.append("circle").attr("class","elegida").attr("cy", h/2).attr("r", 6.5).attr("fill", css("--celeste-fuerte"))
      .attr("stroke", "#fff").attr("stroke-width", 2).attr("opacity", 0);
  });
}
function cambiarTexto(el, t, animar) {
  if (el.textContent.replaceAll(NBSP, " ") === t) return;
  if (!animar || REDUCIR) { el.textContent = t; return; }
  el.animate([{opacity:1, filter:"blur(0)"}, {opacity:0, filter:"blur(3px)"}], {duration:120, easing:"ease-out"}).onfinish = () => {
    el.textContent = t;
    el.animate([{opacity:0, filter:"blur(3px)", transform:"translateY(4px)"}, {opacity:1, filter:"blur(0)", transform:"none"}],
      {duration:300, easing:"cubic-bezier(.23,1,.32,1)"});
  };
}
function pintarPanel(animar) {
  const nombre = NOMBRES[prov];
  pintarExtra();
  cambiarTexto(document.getElementById("prov-titulo"), nombre ? `${nombre} en números` : "Elegí una de las 24", animar);
  grilla.querySelectorAll(".dp").forEach(el => {
    const c = INDP[+el.dataset.i], fila = c.d.find(d => d.codigo_indec === prov);
    const orden = [...c.d].sort((a, b) => b[c.k] - a[c.k]).findIndex(d => d.codigo_indec === prov) + 1;
    cambiarTexto(el.querySelector(".dp-num"), fila ? c.f(fila[c.k]) : c.pais == null ? "Elegí una" : c.f(c.pais), animar);
    el.querySelector(".dp-pos").textContent = fila ? `Posición ${orden} de ${c.d.length}, de mayor a menor.${c.pais == null ? "" : ` País: ${c.f(c.pais)}.`}${c.ocde == null ? "" : ` OCDE: ${c.f(c.ocde)}.`}` : c.pais == null ? "Sin total nacional comparable" : "Total del país";
    const punto = d3.select(el).select("circle.elegida");
    if (!fila) { punto.attr("opacity", 0); return; }
    // el punto viaja de la provincia anterior a la nueva
    (animar && !REDUCIR && punto.attr("opacity") === "1" ? punto.transition().duration(450).ease(EASE) : punto)
      .attr("cx", c.x(fila[c.k])).attr("opacity", 1);
  });
}

/* ---------- preguntas que rotan de a una ---------- */
const veces = (a, b) => n1(a / b).replace(/,0$/, "");
const PREG = [
  ["¿Cuánto varía la mortalidad infantil entre provincias?",
   `En el promedio de ${mo.tri_act} murieron ${n1(mo.top_v)} de cada 1.000 nacidos vivos en ${mo.top} y ${n1(mo.low_v)} en ${mo.low}: ${veces(mo.top_v, mo.low_v)} veces más.`, "#f-mortalidad"],
  ["¿Cuántos años de esperanza de vida separan a las provincias?",
   `En ${nv.ev_anio}, ${n1(nv.ev_top_v - nv.ev_low_v)} años: ${n1(nv.ev_top_v)} en ${nv.ev_top} y ${n1(nv.ev_low_v)} en ${nv.ev_low}. El promedio de la OCDE fue ${n1(OC.esperanza_vida.ocde)} en ${OC.esperanza_vida.anio}.`, "#f-esperanza"],
  ["¿Qué parte de los hogares tiene cloacas?",
   `El ${pct(nv.censo.cloaca)} en el Censo 2022. Va del ${pct(nv.censo_top.cloaca[1])} en ${nv.censo_top.cloaca[0]} al ${pct(nv.censo_low.cloaca[1])} en ${nv.censo_low.cloaca[0]}.`, "#f-censo"],
  ["¿Dónde está la Argentina frente a la OCDE en mortalidad infantil?",
   `En ${OC.mortalidad_infantil.anio}, ${n1(OC.mortalidad_infantil.arg)} muertes de menores de un año cada 1.000 nacidos vivos, contra ${n1(OC.mortalidad_infantil.ocde)} en el promedio simple de los países de la OCDE.`, "#f-mortalidad"],
  ["¿Cuánto cambia lo que se aprende en matemática según la provincia?",
   `En ${ap.top}, el ${pct(ap.top_v)} de los chicos de 6° grado alcanzó un nivel satisfactorio o avanzado en Aprender ${ap.anio}. En ${ap.low}, el ${pct(ap.low_v)}.`, "#f-aprender"],
  ["¿Cuántos bebés menos nacen que hace una década?",
   `En 2024 se registraron ${n0(nac.n_2024)} nacimientos, ${pct(Math.abs(nac.caida))} menos que en ${nac.anio_pico}.`, "#f-nacimientos"],
  ["¿Cuánto empleo privado registrado hay en cada provincia?",
   `${n1(em.top_v)} asalariados cada 100 habitantes en ${em.top} y ${n1(em.low_v)} en ${em.low}. El país tiene ${n1(em.cada_100_pais)}.`, "#f-empleo"],
  ["¿A qué distancia está la Argentina del promedio de la OCDE en PISA?",
   `A ${pz.dif_mat} puntos en matemática en ${pz.anio}: ${pz.mat} contra ${pz.ocde_mat}.`, "#f-pisa"],
  ["¿Cuántos adolescentes están en la secundaria?",
   `El ${pct(es.pais_fin)} en ${es.fin}, ${n1(es.pais_fin - es.pais_ini)} puntos más que en ${es.ini}. En ${es.low}, el ${pct(es.low_v)}.`, "#f-escolarizacion"],
  ["¿Volvió el transporte público al nivel previo a la pandemia?",
   `En ${su.mes} se usaron ${n2(su.total_millones)} millones de tarjetas SUBE por día hábil. En los primeros días de marzo de 2020 eran ${n2(su.pre_millones)} millones.`, "#f-sube"],
  ["¿Qué parte de la electricidad consumen los hogares?",
   `El ${pct(e.pct_res_2025)} de la demanda del país en 2025. En 2005 era el ${pct(e.pct_res_2005)}.`, "#f-hogares"],
  ["¿En qué mes se usa más electricidad?",
   `En ${e.mes_max}: ${pct(e.dif_max_min)} más que en ${e.mes_min}, el mes de menor demanda (promedio de 2023 a 2025).`, "#f-meses"],
  ["¿Qué provincia tiene más territorio protegido?",
   `${nt.top}: el ${pct(nt.top_v)} de su superficie está dentro de áreas protegidas. En ${nt.low}, el ${pct(nt.low_v)}.`, "#f-protegida"],
  ["¿Cuántos metros cuadrados protegidos hay por habitante?",
   `${n0(nt.m2_pais)} en todo el país. Van de ${n0(nt.m2_top_v)} m² en ${nt.m2_top} a ${n1(nt.m2_low_v)} m² en ${nt.m2_low}.`, "#f-protegida"],
  ["¿Cuál es el parque nacional más grande en tierra?",
   `${nt.pn_mayor}, creado en ${nt.pn_mayor_anio}, con ${n0(nt.pn_mayor_ha)} hectáreas.`, "#f-parques"],
  ["¿En qué área protegida se registraron más especies animales?",
   `En ${nt.esp_top}: ${n0(nt.esp_top_v)} especies. Le sigue ${nt.esp_2}, con ${n0(nt.esp_2_v)}.`, "#f-especies"],
  [`¿Volvió el turismo extranjero al nivel de ${tu.max_anio}?`,
   `En los doce meses a ${tu.doce_hasta} llegaron ${n0(tu.doce)} turistas no residentes, ${pct(Math.abs((tu.doce / tu.max - 1) * 100))} ${tu.doce < tu.max ? "menos" : "más"} que en ${tu.max_anio}.`, "#f-receptivo"],
  ["¿Cuánta pobreza hay en las ciudades del país?",
   `En el ${R.pobreza.sem}, el ${pct(R.pobreza.pob)} de las personas de los 31 aglomerados urbanos estaba bajo la línea de pobreza. El pico fue ${pct(R.pobreza.max)}, en el ${R.pobreza.max_sem}.`, "#f-pobreza"],
  ["¿Cuál es el parque nacional más visitado?",
   `${vpq.top}, con ${n0(vpq.top_v)} visitas en 2022. Le sigue ${vpq.dos}, con ${n0(vpq.dos_v)}.`, "#f-visitas-parque"],
  ["¿Qué es lo que más se pesca en el mar argentino?",
   `${pe.top[0]}: ${n0(pe.top_t[0])} toneladas en ${pe.anio}, el ${pct(pe.top_pct)} de todo lo desembarcado.`, "#f-pesca"],
  ["¿Se patentan más autos o más motos?",
   `En ${au.anio} se inscribieron ${n0(au.motos)} motos nuevas y ${n0(au.autos)} autos.`, "#f-patentes"],
  ["¿Volvieron los pasajeros al tren y al subte?",
   `En ${su.mes} viajaban por día hábil ${pct(Math.abs(su.tren_vs_pre))} ${su.tren_vs_pre < 0 ? "menos" : "más"} tarjetas en tren y ${pct(Math.abs(su.subte_vs_pre))} ${su.subte_vs_pre < 0 ? "menos" : "más"} en subte que en marzo de 2020.`, "#f-sube-modos"],
  [`¿Cuántos bebés se llamaron Lionel en ${cu.lionel_anio}?`,
   `${n0(cu.lionel_max)}, ${veces(cu.lionel_max, cu.lionel_prev)} veces los del año anterior (${n0(cu.lionel_prev)}).`, "#f-nombres"],
  ["¿Cuánta carne vacuna come un argentino por año?",
   `${n1(cu.carne_v)} kilos en ${cu.carne_anio}. En ${cu.carne_ini} eran ${n1(cu.carne_ini_v)}.`, "#f-carne"],
  ["¿Cuántos kilos de pollo vale un kilo de asado?",
   `${n1(cu.asado)} kilos en ${cu.asado_hasta}, en el Gran Buenos Aires. En ${cu.asado_ini_anio} eran ${n1(cu.asado_ini)}.`, "#f-carne"],
  [`¿Cuánto vino menos se vende que en ${cu.vino_ini}?`,
   `${pct(Math.abs(cu.vino_caida))} menos: ${n0(cu.vino_v)} millones de litros en ${cu.vino_anio} contra ${n0(cu.vino_ini_v)} millones.`, "#f-vino"],
  ["¿Qué provincia tiene más glaciares?",
   `${cu.gl_top}, con ${n0(cu.gl_top_v)}. Le sigue ${cu.gl_2}, con ${n0(cu.gl_2_v)}.`, "#f-glaciares"],
  [`¿Cuál fue el año más cálido desde ${cu.cl_ini}?`,
   `${cu.cl_max_anio}, con una temperatura media ${n2(cu.cl_max)} °C por encima del valor de referencia.`, "#f-clima"],
  ["¿Cómo cambió la maternidad adolescente?",
   `En 2012, ${n1(nac.pct_2012)} de cada 100 nacimientos eran de madres de 10 a 19 años. En 2024, ${n1(nac.pct_2024)}.`, "#f-adolescentes"],
];
(function carrusel() {
  const rot = document.getElementById("rotador"), q = rot.querySelector(".rot-q"), a = rot.querySelector(".rot-a");
  const cuerpo = rot.querySelector(".rot-cuerpo"), barra = rot.querySelector(".rot-barra i");
  const bPausa = rot.querySelector(".rot-pausa"), bSig = rot.querySelector(".rot-sig");
  const DUR = 7000, freno = {pausa: false, puntero: false, foco: false, fuera: false};
  let i = 0, prog;
  const frenado = () => Object.values(freno).some(Boolean);
  const aplicar = () => { if (prog) frenado() ? prog.pause() : prog.play(); };
  function correr() {
    prog?.cancel();
    prog = barra.animate([{transform:"scaleX(0)"}, {transform:"scaleX(1)"}], {duration: DUR, easing: "linear", fill: "forwards"});
    prog.onfinish = () => mostrar(i + 1, true);
    aplicar();
  }
  function mostrar(n, animar) {
    i = (n + PREG.length) % PREG.length;
    const [pq, pa, h] = PREG[i];
    const poner = () => {
      q.textContent = pq; q.href = h; a.textContent = pa;
      if (animar) cuerpo.animate(REDUCIR ? [{opacity:0}, {opacity:1}]
        : [{opacity:0, transform:"translateY(10px)", filter:"blur(4px)"}, {opacity:1, transform:"none", filter:"blur(0)"}],
        {duration: REDUCIR ? 200 : 480, easing: "cubic-bezier(.23,1,.32,1)"});
      correr();
    };
    if (!animar) return poner();
    const sale = cuerpo.animate(REDUCIR ? [{opacity:1}, {opacity:0}]
      : [{opacity:1, transform:"none", filter:"blur(0)"}, {opacity:0, transform:"translateY(-6px)", filter:"blur(4px)"}],
      {duration: 180, easing: "ease-out", fill: "forwards"});
    sale.onfinish = () => { poner(); sale.cancel(); };
  }
  bPausa.addEventListener("click", () => {
    freno.pausa = !freno.pausa; bPausa.setAttribute("aria-pressed", freno.pausa);
    bPausa.textContent = freno.pausa ? "Seguir" : "Pausar"; aplicar();
  });
  bSig.addEventListener("click", () => mostrar(i + 1, true));
  rot.addEventListener("pointerenter", () => { freno.puntero = true; aplicar(); });
  rot.addEventListener("pointerleave", () => { freno.puntero = false; aplicar(); });
  rot.addEventListener("focusin", () => { freno.foco = true; aplicar(); });
  rot.addEventListener("focusout", () => { freno.foco = false; aplicar(); });
  new IntersectionObserver(([en]) => { freno.fuera = !en.isIntersecting; aplicar(); }).observe(rot);
  // Reserva el alto de la pregunta más larga para que el resto de la portada no salte
  const medir = () => {
    cuerpo.style.minHeight = "0px"; let alto = 0;
    PREG.forEach(([pq, pa]) => { q.textContent = pq; a.textContent = pa; alto = Math.max(alto, cuerpo.offsetHeight); });
    cuerpo.style.minHeight = alto + "px";
    const [pq, pa, h] = PREG[i]; q.textContent = pq; q.href = h; a.textContent = pa;
  };
  medir(); new ResizeObserver(() => medir()).observe(rot.parentElement);
  mostrar(0, false);
})();

/* menú de temas */
(() => {
  const btn = document.getElementById("menu-btn"), panel = document.getElementById("menu-panel");
  let t;
  const abrir = () => { clearTimeout(t); panel.hidden = false; btn.setAttribute("aria-expanded", "true"); requestAnimationFrame(() => panel.classList.add("abierto")); panel.querySelector("a").focus({preventScroll: true}); };
  const cerrar = (volver) => { panel.classList.remove("abierto"); btn.setAttribute("aria-expanded", "false"); t = setTimeout(() => panel.hidden = true, 160); if (volver) btn.focus(); };
  btn.addEventListener("click", () => btn.getAttribute("aria-expanded") === "true" ? cerrar(true) : abrir());
  panel.addEventListener("click", ev => { if (ev.target.closest("a")) cerrar(false); });
  document.addEventListener("keydown", ev => { if (ev.key === "Escape" && btn.getAttribute("aria-expanded") === "true") cerrar(true); });
  document.addEventListener("pointerdown", ev => { if (!panel.contains(ev.target) && ev.target !== btn && btn.getAttribute("aria-expanded") === "true") cerrar(false); });
})();

/* ---------- artículos: preguntas respondidas cruzando dos indicadores de las 24 jurisdicciones ----------
   Los números y las frases que dependen de ellos se calculan acá desde la tabla de cruces, así se actualizan solos.
   A mano van solo la pregunta (data-titulo en el marcado), el contexto y los límites propios de cada cruce, sin cifras.
   Las advertencias generales (pocos casos, correlación no es causalidad, promedios provinciales, períodos distintos,
   Spearman y Pearson que difieren) se agregan siempre que corresponden. */
const ART = [
  {id: "a-exportaciones-empleo", x: "exportaciones", y: "empleo_privado", espera: 1, icono: "buque", sec: "trabajo", frec: "Se actualiza cada año",
    lx: "exportaciones por habitante", ly: "empleo privado registrado", ux: "dólares por habitante", uy: "asalariados cada 100 habitantes",
    dek: "Lo que cada provincia le vende al mundo, frente a cuántas personas tienen un empleo privado registrado.",
    contexto: "Exportar trae dólares a una provincia, pero no todas las actividades necesitan la misma cantidad de personas para producir lo mismo. Este cruce pone una cosa al lado de la otra, provincia por provincia.",
    limites: ["El registro previsional asigna cada empleo a la provincia donde está inscripto el empleador. Por eso la Ciudad de Buenos Aires aparece muy alta, aunque parte de esos trabajos se hagan en otras provincias.",
      "Las exportaciones se cuentan según la provincia donde se produjo la mercadería, no según dónde está la empresa que la vende."]},
  {id: "a-cloacas-mortalidad", x: "cloaca", y: "mortalidad_infantil", espera: -1, icono: "gota", sec: "salud", frec: "Se actualiza cada año",
    lx: "hogares con cloacas", ly: "mortalidad infantil", ux: "% de los hogares", uy: "muertes cada 1.000 nacidos vivos",
    dek: "El acceso a la red cloacal según el último censo, frente a las muertes de bebés menores de un año.",
    contexto: "El saneamiento forma parte de las condiciones en las que nace y crece un bebé. Este cruce compara la cobertura de cloacas de cada provincia con su tasa de mortalidad infantil.",
    limites: ["La mortalidad infantil es un promedio de tres años, porque en las provincias con pocos nacimientos la tasa de un solo año salta mucho.",
      "La mortalidad infantil depende también de la atención durante el embarazo y el parto, que este cruce no mide."]},
  {id: "a-cobertura-adolescentes", x: "sin_cobertura", y: "madres_adolescentes", espera: 1, icono: "mamadera", sec: "poblacion", frec: "Se actualiza cada año",
    lx: "personas sin obra social ni prepaga", ly: "maternidad adolescente", ux: "% de las personas", uy: "% de los nacimientos",
    dek: "La cobertura de salud del último censo, frente a la parte de los nacimientos que son de madres adolescentes.",
    contexto: "En la Argentina, la obra social llega sobre todo con el empleo registrado. Por eso este cruce usa la falta de cobertura como una aproximación a las condiciones económicas de cada provincia.",
    limites: ["La ficha de maternidad adolescente compara el mismo dato con otros indicadores del Censo, como las necesidades básicas insatisfechas y el secundario completo de los adultos."]},
  {id: "a-recursos-empleo", x: "autonomia_fiscal", y: "empleo_privado", espera: 1, icono: "monedas", sec: "trabajo", frec: "Se actualiza cada año",
    lx: "recursos propios", ly: "empleo privado registrado", ux: "% de los ingresos", uy: "asalariados cada 100 habitantes",
    dek: "Qué parte de sus ingresos recauda cada provincia, frente a cuánto empleo privado registrado tiene.",
    contexto: "Las provincias se financian con lo que recaudan y con lo que reciben de la Nación. Una economía privada más grande puede dejar más impuestos propios, pero también pesan la coparticipación y las decisiones de cada gobierno.",
    limites: ["Los recursos propios incluyen impuestos provinciales y otros ingresos, como las regalías. Una provincia con petróleo o minería puede recaudar mucho sin tener mucho empleo privado."]},
  {id: "a-cobertura-esperanza", x: "sin_cobertura", y: "esperanza_vida", espera: -1, yAuto: true, icono: "reloj", sec: "salud", frec: "Se actualiza con cada censo",
    lx: "personas sin obra social ni prepaga", ly: "esperanza de vida", ux: "% de las personas", uy: "años",
    dek: "La esperanza de vida al nacer de cada provincia, frente a la parte de su población sin obra social ni prepaga.",
    contexto: "La esperanza de vida resume en un número las condiciones de mortalidad de un período. La falta de obra social o prepaga se usa acá como una aproximación a las condiciones de vida, no como una medida del acceso a la salud: el hospital público atiende a todas las personas.",
    limites: ["La esperanza de vida de 2020 y 2021 refleja la pandemia de COVID-19. Conviene mirar el año del dato antes de compararlo con otros períodos."]},
  {id: "a-internet-aprender", x: "internet", y: "aprender_mat", espera: 1, icono: "laptop", sec: "educacion", frec: "Se actualiza con cada Aprender",
    lx: "hogares con internet", ly: "matemática en Aprender", ux: "% de los hogares", uy: "% de 6° grado en nivel satisfactorio o avanzado",
    dek: "La conexión a internet en los hogares según el último censo, frente a los resultados de 6° grado en la evaluación Aprender.",
    contexto: "Internet en el hogar suele acompañar a otras ventajas, como más ingresos o más años de estudio de los adultos. Por eso este cruce sirve para ver una desigualdad, no para medir el efecto de internet en el aprendizaje.",
    limites: ["El cálculo propio de Aprender sobre la base agregada difiere levemente del informe oficial."]},
  {id: "a-milei-empleo", x: "empleo_privado", y: "voto_milei_2023", espera: 1, icono: "urna", sec: "politica", frec: "El empleo se actualiza cada mes",
    lx: "empleo privado registrado", ly: "voto a Milei en el balotaje", ux: "asalariados cada 100 habitantes", uy: "% de los votos positivos",
    dek: "Cómo se repartió el voto del balotaje presidencial según el peso del empleo privado registrado en cada provincia.",
    contexto: "El balotaje enfrentó a dos fórmulas con propuestas económicas distintas. Este cruce describe cómo se repartió el voto según el peso del empleo privado registrado en cada provincia, sin juzgar las razones de cada elector.",
    limites: ["Votan todas las personas habilitadas, y el empleo privado registrado cubre solo a una parte de quienes trabajan.",
      "El resultado es el del escrutinio provisorio, el único publicado como datos abiertos para esa elección."]},
];
const META_CX = Object.fromEntries(R.cruces.map(m => [m.id, m]));
const rTxt = r => n2(r).replace(/[-−]/, "menos ");
const fuerzaArt = r => { const a = Math.abs(r); return a >= .6 ? "fuerte" : a >= .4 ? "moderada" : a >= .2 ? "débil" : "casi nula"; };
// "% de los hogares" se pega al número (45,2%) y el resto de la unidad va después
const partesU = u => u.startsWith("%") ? ["%", u.replace(/^%\s*/, "")] : ["", u];
function calcularArt(a) {
  const F = T.cruces_provincias.filter(f => f[a.x] != null && f[a.y] != null);
  const xs = F.map(f => f[a.x]), ys = F.map(f => f[a.y]);
  const S = CX.simple(xs, ys), iCook = d3.maxIndex(S.cook), sinC = F.filter((_, i) => i !== iCook);
  return {F, n: F.length, rs: CX.spearman(xs, ys), rp: CX.pearson(xs, ys), rs2: CX.spearman(sinC.map(f => f[a.x]), sinC.map(f => f[a.y])),
    cook: F[iCook], arriba: F[d3.maxIndex(S.res)], abajo: F[d3.minIndex(S.res)]};
}
function textoArt(a, c) {
  const Mx = META_CX[a.x], My = META_CX[a.y];
  const fx = v => loc.format(`,.${Mx.dec}f`)(v), fy = v => loc.format(`,.${My.dec}f`)(v);
  const [px, rx] = partesU(a.ux), [py, ry] = partesU(a.uy);
  const vx = f => `${fx(f[a.x])}${px} ${rx}`, vy = f => `${fy(f[a.y])}${py} ${ry}`;
  const ab = Math.abs(c.rs), mismo = Math.sign(c.rs) === a.espera;
  const respuesta = ab < .2 ? "No hay un patrón claro." : !mismo ? "No: la relación va en sentido contrario." : ab >= .4 ? "Sí, en general." : "Apenas.";
  const bajada = ab < .2
    ? `En las ${c.n} jurisdicciones con dato, conocer el nivel de ${a.lx} casi no ayuda a anticipar el de ${a.ly}. La correlación de Spearman es de ${rTxt(c.rs)}, en una escala que va de menos 1 a 1.`
    : `En las ${c.n} jurisdicciones con dato, las que tienen más ${a.lx} tienden a tener valores ${c.rs > 0 ? "más altos" : "más bajos"} de ${a.ly}. La relación es ${fuerzaArt(c.rs)}: la correlación de Spearman es de ${rTxt(c.rs)}, en una escala que va de menos 1 a 1.`;
  const ord = [...c.F].sort((p, q) => q[a.x] - p[a.x]), top = ord.slice(0, 3), bajo = ord.slice(-3).reverse();
  // "22,0 en Neuquén, 14,9 en Santa Cruz y 13,7 en Santa Fe": el nombre separa los números, sin ambigüedad con la coma decimal
  const enProv = fs => listaY(fs.map(f => `${fy(f[a.y])}${py} en ${f.territorio}`));
  const extremos = `Las tres jurisdicciones con más ${a.lx} son ${listaY(top.map(f => `${f.territorio} (${vx(f)})`))}. ` +
    `En ${a.ly}, los valores son ${enProv(top)} (${ry}). ` +
    `Las tres con menos son ${listaY(bajo.map(f => `${f.territorio} (${vx(f)})`))}. En ${a.ly}, esas tres tienen ${enProv(bajo)}.`;
  const excep = `Las que más se apartan de la tendencia son ${c.arriba.territorio}, con ${vy(c.arriba)} y ${vx(c.arriba)}, por encima de la línea del gráfico, ` +
    `y ${c.abajo.territorio}, con ${vy(c.abajo)} y ${vx(c.abajo)}, por debajo.`;
  const peso = `${c.cook.territorio} es la jurisdicción que más pesa en el resultado. ` + (Math.abs(c.rs2 - c.rs) < .05
    ? `Sin ella, la correlación casi no cambia: pasa de ${rTxt(c.rs)} a ${rTxt(c.rs2)}, así que el resultado no depende de un solo caso.`
    : `Sin ella, la correlación de Spearman pasa de ${rTxt(c.rs)} a ${rTxt(c.rs2)}` + (fuerzaArt(c.rs2) !== fuerzaArt(c.rs) ? `, una relación ${fuerzaArt(c.rs2)}.` : "."));
  const lim = [`Son ${c.n} casos. Con tan pocos, una o dos jurisdicciones pueden cambiar el resultado.`,
    "Una correlación no prueba que una cosa cause la otra. Las dos pueden responder a otros factores que este cruce no mide.",
    "Son promedios de cada jurisdicción: no dicen qué pasa con cada persona ni con los municipios de una misma provincia.",
    ...(Mx.periodo !== My.periodo ? [`Los períodos no coinciden: el dato de ${a.lx} es de ${Mx.periodo} y el de ${a.ly}, de ${My.periodo}.`] : []),
    ...(Math.abs(c.rs - c.rp) > .2 ? [`La correlación de Pearson, que pesa más los valores extremos, da ${rTxt(c.rp)}. La diferencia con la de Spearman indica que unos pocos casos influyen mucho.`] : []),
    ...a.limites];
  return {respuesta, bajada, extremos, excep, peso, lim, vx, vy};
}
const fuenteArt = m => m.fuente.includes(m.periodo) ? m.fuente : `${m.fuente} (${m.periodo})`;
const nombreSec = id => document.getElementById(id)?.querySelector("h2")?.textContent || "";
const tarjetaArt = a => `<a class="tarjeta art-card" href="${urlPagina(a.id)}"><span class="art-ico">${icono(a.icono)}</span>` +
  `<span class="art-txt"><b>${a.titulo}</b><small>${nombreSec(a.sec)}. ${a.frec}</small></span></a>`;
ART.forEach(a => {
  const nota = document.getElementById(a.id);
  a.titulo = nota.dataset.titulo; a.c = calcularArt(a); a.t = textoArt(a, a.c);
});
ART.forEach(a => {
  const {c, t} = a, Mx = META_CX[a.x], My = META_CX[a.y], key = "art-" + a.id;
  const ficha = id => { const el = id && document.getElementById(id); return el ? urlPagina(paginaDe(el), "#" + id) : null; };
  const fichas = [...new Map([[Mx.ficha, Mx.nombre], [My.ficha, My.nombre]]).entries()].filter(([id]) => ficha(id));
  const [px] = partesU(a.ux), [py] = partesU(a.uy);
  document.getElementById(a.id).innerHTML =
    `<a class="nota-volver" href="articulos.html">Artículos</a>` +
    `<div class="nota-cab"><span class="nota-ico">${icono(a.icono)}</span><div><p class="nota-meta">${nombreSec(a.sec)}. ${a.frec}</p><h2 class="nota-tit">${a.titulo}</h2></div></div>` +
    `<p class="nota-bajada"><mark>${t.respuesta}</mark> ${t.bajada}</p><p>${a.contexto}</p>` +
    `<div class="nota-graf"><h3>${Mx.nombre} y ${My.nombre.toLowerCase()} por jurisdicción</h3><div class="grafico" data-g="${key}"></div>` +
    `<p class="nota-pie-graf">Cada punto es una jurisdicción. La línea punteada muestra la tendencia.</p></div>` +
    `<p>${t.extremos}</p><p>${t.excep}</p><p>${t.peso}</p>` +
    `<div class="nota-limites"><h2>Qué no dice este dato</h2><ul>${t.lim.map(l => `<li>${l}</li>`).join("")}</ul></div>` +
    `<div class="nota-fuentes"><p>Fuentes: ${fuenteArt(Mx)} y ${fuenteArt(My)}.</p><div class="acciones">` +
    fichas.map(([id, nom]) => `<a class="boton chico accion" href="${ficha(id)}">Ficha: ${nom.toLowerCase()}</a>`).join("") +
    `<a class="boton chico accion" href="cruces.html?cx=${a.x}&cy=${a.y}">Abrir en Cruces</a><a class="boton chico accion" href="datos/cruces_provincias.csv" download>Descargar CSV</a></div></div>` +
    `<nav class="nota-otras" aria-label="Otros artículos"><h2>Otros artículos</h2><div class="art-grid">${ART.filter(o => o !== a).slice(0, 3).map(tarjetaArt).join("")}</div></nav>`;
  // en el gráfico van con nombre las jurisdicciones que menciona el texto
  DIB[key] = anim => dispersion(G(key), {anim, data: c.F, x: a.x, y: a.y, yAuto: a.yAuto, xLab: Mx.nombre, yLab: My.nombre,
    marcar: [c.arriba, c.abajo, c.cook].map(f => f.codigo_indec),
    fx: v => n0(v) + px, fy: v => n0(v) + py, vx: v => a.t.vx({[a.x]: v}), vy: v => a.t.vy({[a.y]: v})});
});
const artGrid = document.getElementById("art-grid");
if (artGrid) artGrid.innerHTML = ART.map(tarjetaArt).join("");
const artHome = document.getElementById("art-grid-home");
if (artHome) artHome.innerHTML = ART.slice(0, 6).map(tarjetaArt).join("");

/* portada: tres destacados. El artículo destacado es el de la relación más marcada */
const destGrid = document.getElementById("dest-grid");
// el gorro frigio de la marca, en un botón redondo: invita a entrar sin usar una flecha genérica

if (destGrid) {
  // los artículos de política no van destacados por un cálculo automático
  const fuerte = ART.filter(a => a.sec !== "politica").sort((p, q) => Math.abs(q.c.rs) - Math.abs(p.c.rs))[0];
  const D3 = [
    {cls: "azul", ico: "pin", eb: "Tu provincia", href: "provincia.html",
      tit: prov && NOMBRES[prov] ? `${NOMBRES[prov]} en números` : "Las 24, una por una",
      txt: "Cada provincia junto al total del país y su posición entre las 24, en todos los indicadores con dato provincial."},
    {cls: "amarilla", ico: fuerte.icono, eb: "Artículo", href: urlPagina(fuerte.id), tit: fuerte.titulo, txt: fuerte.dek},
    {cls: "hondo", ico: "congreso", eb: "Congreso", href: "#f-votaciones-espacios",
      tit: "Qué votó cada espacio en las leyes clave",
      txt: "Los votos nominales de diputados y senadores, ley por ley, junto a la plataforma electoral que presentó cada alianza."},
  ];
  destGrid.innerHTML = D3.map(d => `<a class="tarjeta dest ${d.cls}" href="${d.href}"><span class="dest-arte">${icono(d.ico)}</span>` +
    `<span class="dest-cuerpo"><span class="dest-eb">${d.eb}</span><b>${d.tit}</b><span class="dest-txt">${d.txt}</span>` +
    `<span class="dest-ir" aria-hidden="true">${SOL_BOTON}</span></span></a>`).join("");
}

/* Sobre nosotros: cifras contadas en el propio sitio */
const nosCifras = document.getElementById("nos-cifras");
if (nosCifras) {
  const temas = document.querySelectorAll(".tema:not(.herramienta):not(#articulos)").length;
  nosCifras.innerHTML = [[document.querySelectorAll("article.ficha:not(.explorador)").length, "fichas con su tabla"], [24, "jurisdicciones"],
    [temas, "secciones temáticas"], [ART.length, "artículos de cruces"]].map(([n, t]) => `<div class="nos-cifra"><b>${n}</b><span>${t}</span></div>`).join("");
}

/* recuadro de estado de la portada */
document.getElementById("estado").innerHTML =
  `<span><b>${document.querySelectorAll("article.ficha:not(.explorador)").length}</b> fichas</span><span><b>24</b> jurisdicciones</span>`;

/* Enlaces a fichas que viven en otra página (perfil provincial, preguntas, cruces): llevan a esa página */
const destinoDe = href => {
  const id = href.slice(1).split("?")[0], el = id && document.getElementById(id);
  if (!el) return null;
  const p = paginaDe(el);
  return p === PAGINA ? null : urlPagina(p, p === id ? "" : "#" + id);
};
document.querySelectorAll('a[href^="#"]').forEach(a => { const u = destinoDe(a.getAttribute("href")); if (u) a.href = u; });
document.addEventListener("click", ev => {
  const a = ev.target.closest?.('a[href^="#"]');
  const u = a && destinoDe(a.getAttribute("href"));
  if (u && !ev.ctrlKey && !ev.metaKey && !ev.shiftKey) { ev.preventDefault(); location.href = u; }
});

/* portada: una tarjeta por sección */
const SEC_ICONO = {articulos: "periodico", trabajo: "maletin", empresas: "tienda", pobreza: "casa", salud: "botiquin", educacion: "birrete",
  poblacion: "personas", politica: "congreso", movilidad: "colectivo", energia: "rayo", turismo: "valija", naturaleza: "andes",
  curiosidades: "mate", cruces: "dispersion", indice: "podio", departamentos: "mosaico"};
const grillaSec = document.getElementById("secciones-grid");
if (grillaSec) grillaSec.innerHTML = [...document.querySelectorAll(".tema")].map(sec => {
  const n = sec.querySelectorAll("article.ficha:not(.explorador)").length;
  const preg = sec.querySelector(".tema-intro .pregunta")?.textContent || "";
  const na = sec.querySelectorAll("article.nota").length;
  return `<a class="tarjeta sec-tarjeta${sec.classList.contains("herramienta") ? " herr" : ""}" href="${urlPagina(sec.id)}">${icono(SEC_ICONO[sec.id], "sec-ico")}` +
    `<span class="sec-tipo">${sec.classList.contains("herramienta") ? "Herramienta" : na ? na + " artículos" : n === 1 ? "1 ficha" : n + " fichas"}</span>` +
    `<b>${sec.querySelector("h2").textContent}</b><span class="sec-preg">${preg}</span></a>`;
}).join("");

/* pie de cada página de sección: anterior y siguiente */
if (PAGINA !== "inicio") {
  const todas = [...document.querySelectorAll(".tema")], i = todas.findIndex(t => t.id === PAGINA), sec = todas[i];
  const ir = (t, rot) => t ? `<a href="${urlPagina(t.id)}"><small>${rot}</small>${t.querySelector("h2").textContent}</a>` : "<span></span>";
  if (sec) sec.insertAdjacentHTML("beforeend", `<nav class="sec-pasos" aria-label="Otras secciones">${ir(todas[i - 1], "Anterior")}<a class="sec-todas" href="./#secciones"><small>Datina</small>Todas las secciones</a>${ir(todas[i + 1], "Siguiente")}</nav>`);
}

/* La respuesta primero (idea de USAFacts): las cifras clave de la sección arriba, antes de la explicación.
   Salen de CLAVE y del perfil provincial (INDP), así que no hay cifras nuevas escritas a mano y el suicidio queda afuera.
   Con una provincia elegida, sus indicadores reemplazan a la cifra del país de la misma ficha. */
if (PAGINA !== "inicio") {
  const sec = document.getElementById(PAGINA), intro = sec?.querySelector(".tema-intro");
  if (sec && intro && !sec.classList.contains("herramienta")) {
    const ids = new Set([...sec.querySelectorAll("article.ficha")].map(f => f.id)), conProv = new Set(), tarjetas = [];
    if (prov && NOMBRES[prov]) INDP.forEach(c => {
      const fila = ids.has(c.id) && c.d.find(d => d.codigo_indec === prov); if (!fila) return;
      conProv.add(c.id);
      const orden = [...c.d].sort((a, b) => b[c.k] - a[c.k]).findIndex(d => d.codigo_indec === prov) + 1;
      tarjetas.push(`<a class="tarjeta cifra prov" href="#${c.id}"><span class="c-lab">${NOMBRES[prov]}</span><span class="c-num">${c.f(fila[c.k])}</span>` +
        `<span class="c-txt">${c.lab}: ${c.det}.${c.pais == null ? "" : ` País: ${c.f(c.pais)}.`} Posición ${orden} de ${c.d.length}, de mayor a menor.</span></a>`);
    });
    ids.forEach(id => { const c = CLAVE[id]; if (c && !conProv.has(id)) tarjetas.push(`<a class="tarjeta cifra" href="#${id}"><span class="c-num">${c[0]}</span><span class="c-txt">${c[1]}</span></a>`); });
    if (!conProv.size && INDP.some(c => ids.has(c.id)))
      tarjetas.push(`<a class="tarjeta cifra invita" href="provincia.html"><span class="c-lab">Tu provincia</span><span class="c-txt">Elegí una provincia para ver sus datos de esta sección junto a los del país.</span></a>`);
    if (tarjetas.length >= 2) intro.insertAdjacentHTML("afterend", `<div class="en-cifras"><h3>En cifras</h3><div class="cifras-grid">${tarjetas.join("")}</div></div>`);
  }
  // en el celular, una fila de secciones que se desliza de costado, con la actual marcada
  if (sec?.closest(".tema")) {
    const nav = document.createElement("nav"); nav.className = "pildoras"; nav.setAttribute("aria-label", "Secciones");
    nav.innerHTML = [...document.querySelectorAll(".tema")].map(t => `<a href="${urlPagina(t.id)}"${t.id === SECCION ? ' aria-current="page"' : ""}>${t.querySelector("h2").textContent}</a>`).join("");
    sec.prepend(nav);
    const cur = nav.querySelector("[aria-current]");
    if (cur) requestAnimationFrame(() => { nav.scrollLeft = cur.offsetLeft - 22; });
  }
}

/* buscador de la lupa: secciones, fichas, preguntas y artículos de todo el sitio (cada página tiene todo el marcado) */
(() => {
  const btn = document.getElementById("lupa-btn"), caja = document.getElementById("buscador");
  const ent = document.getElementById("busca"), res = document.getElementById("busca-res");
  if (!btn) return;
  const st = t => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const ir = (el, hash) => { const p = paginaDe(el); return p === PAGINA ? hash : urlPagina(p, hash); };
  let IDX;
  const armar = () => {
    IDX = [];
    document.querySelectorAll(".tema").forEach(t => IDX.push({t: t.querySelector("h2").textContent, s: t.classList.contains("herramienta") ? "Herramienta" : "Sección",
      u: urlPagina(t.id), x: t.querySelector(".tema-intro")?.textContent || "", sec: 1}));
    IDX.push({t: "Tu provincia", s: "Sección", u: "provincia.html", x: "perfil provincia provincias comparar país posición", sec: 1});
    Object.entries(NOMBRES).forEach(([c, n]) => IDX.push({t: `${n} en números`, s: "Tu provincia", u: `provincia.html?prov=${c}`, x: n, sec: 2}));
    IDX.push({t: "Sobre nosotros", s: "Datina", u: "nosotros.html", x: "propósito quiénes fuentes principios cómo se hace"});
    document.querySelectorAll("article.ficha").forEach(f => {
      const h = f.querySelector("h3")?.textContent.trim(); if (!h) return;
      // las fichas de suicidio llevan a las líneas de ayuda, que van justo antes
      const ayuda = document.getElementById("ayuda-suicidio");
      const ancla = NOTA_A_LA_VISTA.has(f.id) && ayuda && (ayuda.compareDocumentPosition(f) & Node.DOCUMENT_POSITION_FOLLOWING) ? "#ayuda-suicidio" : "#" + f.id;
      IDX.push({t: h, s: f.closest(".tema")?.querySelector("h2")?.textContent || "", u: ir(f, ancla), x: (f.querySelector(".lead")?.textContent || "") + " " + (CLAVE[f.id]?.[1] || "")});
    });
    PREG.forEach(([q, a, h]) => { const el = document.getElementById(h.slice(1)); if (el) IDX.push({t: q, s: "Pregunta", u: ir(el, h), x: a}); });
    ART.forEach(a => IDX.push({t: a.titulo, s: "Artículo", u: urlPagina(a.id), x: a.dek + " " + a.t.bajada, sec: 1}));
    IDX.forEach(d => { d.tt = st(d.t); d.xx = st(d.x); });
  };
  const fila = d => `<a href="${d.u}"><small>${esc(d.s)}</small>${esc(d.t)}</a>`;
  const buscar = () => {
    const pal = st(ent.value.trim()).split(/\s+/).filter(Boolean);
    if (!IDX) armar();
    if (!pal.length) {
      // sin texto, sugerencias: los artículos
      res.innerHTML = `<p class="busca-sug">Para empezar</p>` + IDX.filter(d => d.s === "Artículo").slice(0, 4).map(fila).join("");
      return;
    }
    const puntaje = (d, todas) => {
      const en = pal.filter(w => d.tt.includes(w) || d.xx.includes(w));
      if (todas ? en.length < pal.length : !en.length) return 0;
      return en.length * 3 + 2 * pal.filter(w => d.tt.includes(w)).length + (d.sec || 0);
    };
    let hall = IDX.map(d => ({d, p: puntaje(d, true)})).filter(r => r.p);
    // si ninguna entrada tiene todas las palabras ("salta empleo"), se muestran las que tienen alguna
    if (!hall.length) hall = IDX.map(d => ({d, p: puntaje(d, false)})).filter(r => r.p);
    hall = hall.sort((a, b) => b.p - a.p).slice(0, 8);
    res.innerHTML = hall.length ? hall.map(({d}) => fila(d)).join("") : `<p class="busca-sug">Nada coincide con la búsqueda. Probá con otra palabra.</p>`;
  };
  const abrir = () => {
    caja.hidden = false; btn.setAttribute("aria-expanded", "true");
    buscar(); ent.focus({preventScroll: true});
  };
  const cerrar = volver => { btn.setAttribute("aria-expanded", "false"); caja.hidden = true; if (volver) btn.focus(); };
  btn.addEventListener("click", () => btn.getAttribute("aria-expanded") === "true" ? cerrar(true) : abrir());
  ent.addEventListener("input", buscar);
  ent.addEventListener("keydown", ev => { if (ev.key === "Enter") { const a = res.querySelector("a"); if (a) { ev.preventDefault(); a.click(); } } });
  res.addEventListener("click", ev => { if (ev.target.closest("a")) cerrar(false); });
  document.addEventListener("keydown", ev => {
    if (ev.key === "Escape" && !caja.hidden) cerrar(true);
    else if (ev.key === "/" && caja.hidden && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "")) { ev.preventDefault(); abrir(); }
  });
  document.addEventListener("pointerdown", ev => { if (!caja.hidden && !caja.contains(ev.target) && !btn.contains(ev.target)) cerrar(false); });
})();

/* aparición de cada tarjeta y de su gráfico al entrar en pantalla, una sola vez */
const vistas = new IntersectionObserver(es => es.forEach(en => {
  if (!en.isIntersecting) return;
  const f = en.target; f.classList.add("visto"); vistas.unobserve(f);
  f.querySelectorAll(".grafico[data-g]").forEach(gr => { if (gr.offsetParent) DIB[gr.dataset.g](!REDUCIR); });
  const bi = f.querySelector(".accion.imagen"); if (bi) bi.hidden = !svgUnico(f);
}), {threshold: .12, rootMargin: "0px 0px -8% 0px"});
document.querySelectorAll("article.ficha, article.nota").forEach(f => vistas.observe(f));

/* navegación activa: la sección de esta página */
document.querySelectorAll(".temas a, .menu-panel a, .sobre-link").forEach(a => a.setAttribute("aria-current", a.getAttribute("href") === SECCION + ".html"));

/* la barra superior es azul sobre la portada y clara en el resto */
const barra = document.querySelector(".barra");
if (PAGINA === "inicio")
  new IntersectionObserver(([en]) => barra.classList.toggle("clara", !en.isIntersecting && en.boundingClientRect.top < 0), {rootMargin: "-80px 0px 0px 0px"})
    .observe(document.querySelector(".portada"));
else barra.classList.add("clara");

/* enlaces compartidos del tipo salud.html#f-mortalidad?prov=30: llevar a la ficha */
if (location.hash.includes("?")) {
  const destino = document.getElementById(location.hash.slice(1).split("?")[0]);
  if (destino) requestAnimationFrame(() => destino.scrollIntoView());
}

/* ---------- mapa de fondo: el mundo visto desde la Argentina ---------- */
async function mapa() {
  const el = document.getElementById("mapa"), por = document.querySelector(".portada");
  let mundo;
  try { mundo = await fetch("datos/mundo-110m.json").then(r => r.json()); } catch (_) { return; }
  const paises = topojson.feature(mundo, mundo.objects.countries).features;
  const dibujar = () => {
    const W = por.clientWidth, H = por.clientHeight, angosto = W < 760;
    // La Argentina (unos 34 grados de norte a sur, 0,6 radianes) se ubica en el espacio libre: en pantallas anchas,
    // en el hueco entre el texto y el sol, arriba del panel de preguntas. En el celular, detrás de ese panel.
    const pr = por.getBoundingClientRect(), sl = document.getElementById("sol").getBoundingClientRect();
    const textoDer = Math.max(...[...document.querySelector(".portada-texto").children].map(c => c.getBoundingClientRect().right));
    const pn = document.querySelector(".portada .rotador")?.getBoundingClientRect();
    let esc, cx, cy;
    if (!angosto) {
      const arriba = 20, abajo = (pn ? pn.top : pr.bottom) - pr.top - 20, hueco = Math.max(160, sl.left - textoDer);
      esc = Math.max(170, Math.min((abajo - arriba) / .64, hueco / .34, W * .3));
      cx = (textoDer + sl.left) / 2 - pr.left; cy = arriba + (abajo - arriba) * .5;
    } else {
      esc = Math.max(240, W * .62); cx = W * .78; cy = pn ? pn.top - pr.top + pn.height * .5 : H * .7;
    }
    const proy = d3.geoAzimuthalEquidistant().rotate([64, 38]).clipAngle(179.9).scale(esc).translate([cx, cy]);
    const camino = d3.geoPath(proy), svg = d3.select(el).attr("viewBox", `0 0 ${W} ${H}`);
    svg.selectAll("*").remove();
    svg.append("path").attr("class","grat").attr("d", camino(d3.geoGraticule().step([20, 20])()));
    svg.append("path").attr("class","esfera").attr("d", camino({type: "Sphere"}));
    [15, 40, 65, 90, 115, 140, 165].forEach(r =>
      svg.append("path").attr("class","anillo").attr("d", camino(d3.geoCircle().center([-64, -38]).radius(r)())));
    // Argentina continental y las Islas Malvinas, en celeste
    svg.append("g").selectAll("path").data(paises).join("path")
      .attr("class", d => d.id === "032" || d.id === "238" ? "arg" : "tierra").attr("d", camino)
      .sort((a, b) => (a.id === "032" || a.id === "238") - (b.id === "032" || b.id === "238"));
    el.classList.add("listo");
  };
  dibujar();
  // la tipografía condensada cambia el alto del texto: se recalcula cuando termina de cargar
  if (document.fonts) document.fonts.ready.then(dibujar);
  let ancho = por.clientWidth, t;
  new ResizeObserver(() => { if (por.clientWidth === ancho) return; ancho = por.clientWidth; clearTimeout(t); t = setTimeout(dibujar, 150); }).observe(por);
}
if (PAGINA === "inicio") mapa();

/* primer dibujo y redibujo al cambiar el ancho */
const redibujar = () => { dibujarTodo(); tiras(); pintarPanel(false); tablaAreas(); };
redibujar();
atar(document.body);
vigiaTextos.observe(document.body, {subtree: true, childList: true, characterData: true});
let ancho = document.documentElement.clientWidth, espera;
new ResizeObserver(() => {
  const w = document.documentElement.clientWidth;
  if (w === ancho) return;
  ancho = w; clearTimeout(espera); espera = setTimeout(redibujar, 150);
}).observe(document.body);
})();
