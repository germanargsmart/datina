const parte = nombre => window.DATINA_PARTES?.[nombre]?.();
let arrancado = false;
const SE_VA = new Error("datina: la página se va a otra dirección");
addEventListener("error", ev => { if (ev.error === SE_VA) { ev.preventDefault(); return; } if (!arrancado) document.querySelectorAll("article.ficha").forEach(f => f.classList.add("visto", "sin-entrada")); });
const D = window.DATINA;
document.querySelectorAll("article.ficha").forEach(f => {
const r = f.getBoundingClientRect();
if (r.height > 0 && r.bottom > 0 && r.top < innerHeight && +getComputedStyle(f).opacity > .01) f.classList.add("visto", "sin-entrada");
});
document.documentElement.classList.add("listo");
const PAGINA = document.body.dataset.pagina || "inicio";
const TITULO_INICIAL = document.title;
const SECCION = PAGINA.startsWith("a-") ? "articulos" : document.querySelector("section.pieza") ? "laboratorio" : PAGINA;
const SITIO = D.indice, UBIC = SITIO.ubic;
const INSERTAR = (() => {
if (!new URLSearchParams(location.search).has("insertar")) return null;
const f = document.getElementById(location.hash.slice(1).split("?")[0]);
if (!f || !f.matches("article.ficha") || ["f-muertes", "f-suicidio", "f-suicidio-prov", "f-edad"].includes(f.id)) return null;
for (let a = f.parentElement; a && a !== document.documentElement; a = a.parentElement) a.classList.add("ins-camino");
f.classList.add("ins-ficha"); document.documentElement.classList.add("insertar");
document.head.insertAdjacentHTML("beforeend", '<base target="_top">');
f.insertAdjacentHTML("beforeend", `<p class="ins-credito">De <a href="${location.origin + location.pathname}#${f.id}">Datina, las 24 Argentinas en números</a></p>`);
return f;
})();
const paginaDe = id => UBIC[id] || UBIC[(SITIO.alias || {})[id]];
const urlPagina = (p, resto = "") => (p === "inicio" ? "./" : p) + resto;
const destinoDe = href => {
const id = href.slice(1).split("?")[0], p = id && paginaDe(id);
if (!p || p === PAGINA) return null;
return urlPagina(p, p === id ? "" : "#" + id);
};
let ANCLA_VIEJA = "";
const ABRIR_VIEJA = {};
{
const h = location.hash.slice(1).split("?")[0], nueva = h && (SITIO.alias || {})[h];
if (nueva) {
const p = paginaDe(nueva);
if (p && p !== PAGINA) { location.replace(urlPagina(p, location.search + location.hash)); throw SE_VA; }
ANCLA_VIEJA = h;
history.replaceState(history.state, "", location.pathname + location.search + "#" + nueva + location.hash.slice(1 + h.length));
addEventListener("load", () => document.getElementById(nueva)?.scrollIntoView(), {once: true});
}
}
addEventListener("hashchange", () => {
const h = location.hash.slice(1).split("?")[0], nueva = h && (SITIO.alias || {})[h];
if (!nueva || paginaDe(nueva) !== PAGINA) return;
history.replaceState(history.state, "", location.pathname + location.search + "#" + nueva + location.hash.slice(1 + h.length));
ABRIR_VIEJA[h]?.();
document.getElementById(nueva)?.scrollIntoView();
});
if (PAGINA === "inicio") {
const q = new URLSearchParams(location.search), h = location.hash.slice(1).split("?")[0], p = h && paginaDe(h);
const destino = h === "provincias" || (q.has("prov") && !h) ? "provincia"
: p && p !== "inicio" ? p : q.has("cx") || q.has("cy") ? "cruces" : q.has("ix") ? "indice" : q.has("dx") ? "diagnostico" : null;
if (destino) { location.replace(urlPagina(destino, location.search + (h === destino || h === "provincias" ? "" : location.hash))); throw SE_VA; }
} else {
const h = location.hash.slice(1).split("?")[0], p = h && paginaDe(h);
if (p && p !== PAGINA && p !== h) { location.replace(urlPagina(p, location.search + location.hash)); throw SE_VA; }
}
const R = D.resumen, T = D.datos, OC = R.ocde;
const huellaHTML = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return (h >>> 0).toString(36); };
const yaEscrito = el => ({ set innerHTML(html) {
const pre = el.dataset.pre; if (pre !== undefined) delete el.dataset.pre;
if (!pre || pre !== huellaHTML(html)) el.innerHTML = html;
} });
const $ = id => document.getElementById(id) || document.createElement("div");
const DIFERIDAS = D.diferidas || {}, pedidas = {};
const deColumnas = t => Array.isArray(t) ? t : t.f.map(r => Object.fromEntries(t.c.map((k, i) => [k, r[i]])));
const cargarTabla = n => T[n] ? Promise.resolve(T[n]) : (pedidas[n] ||= d3.json(`datos/${n}.json?v=${DIFERIDAS[n]}`).then(t => (T[n] = deColumnas(t)),
e => { delete pedidas[n]; throw e; }));
const TABLA_PROPIA = {};
const refrescarTabla = id => {
const f = document.getElementById((SITIO.alias || {})[id] || id), caja = f?.querySelector(".tabla-datos");
if (caja && TABLA_PROPIA[id] && vistaDe(f) === id) TABLA_PROPIA[id]().then(filas => { caja.innerHTML = tablaPropia(filas, id); }, () => {});
};
const vistaDe = f => f.querySelector(".panel-pestana[data-vieja]:not([hidden])")?.dataset.vieja || f.id;
const esperando = el => { el.innerHTML = '<span class="solo-lector">Cargando los datos</span>'; el.setAttribute("aria-busy", "true"); };
const avisar = t => { const a = document.getElementById("aviso"); if (!a) return; a.textContent = ""; setTimeout(() => { a.textContent = t; }, 60); };
const sinDatos = (el, t) => { el.removeAttribute("aria-busy"); el.innerHTML = `<p class="nota">${t}</p>`; avisar(t); };
const conTablas = (g, nombres, dibujo) => a => {
const faltan = (typeof nombres === "function" ? nombres() : nombres).filter(n => !T[n]);
if (!faltan.length) return dibujo(a);
const el = G(g); if (!el) return;
if (!el.querySelector("svg")) esperando(el);
Promise.all(faltan.map(cargarTabla)).then(() => {
dibujo(a);
const f = el.closest(".ficha"), bi = f?.querySelector(".accion.imagen"); if (bi) bi.hidden = !svgUnico(f);
}).catch(() => sinDatos(el, "No se pudieron cargar los datos. Probá recargar la página."));
};
const loc = d3.formatLocale({decimal:",", thousands:".", grouping:[3], currency:["$",""]});
const n0 = loc.format(",.0f"), n1 = loc.format(",.1f"), n2 = loc.format(",.2f");
const fuerza = r => { const a = Math.abs(Number(r.toFixed(2))); return a >= .6 ? "fuerte" : a >= .4 ? "moderada" : a >= .2 ? "débil" : "casi nula"; };
const RESP = {"fuerte": "Sí.", "moderada": "En parte.", "débil": "Apenas.", "casi nula": "No hay un patrón claro."};
const respuestaR = r => RESP[fuerza(r)];
const pct = v => n1(v) + "%";
const kbdF = v => v >= 10 ? n0(v) : n1(v);
const veces = (a, b) => n1(a / b).replace(/,0$/, "");
const vecesPais = (v, pais, soloDebajo) => {
if (!(v >= 0 && pais > 0)) return "";
const r = v / pais;
return r >= 1.5 && !soloDebajo ? `${veces(v, pais)} veces el valor del país` : r < .1 ? "menos de la décima parte del valor del país"
: r < .25 ? `alrededor de la ${["cuarta", "quinta", "sexta", "séptima", "octava", "novena", "décima"][Math.round(1 / r) - 4]} parte del valor del país`
: r < .5 ? "menos de la mitad del valor del país" : "";
};
const conVeces = (v, pais) => { const t = vecesPais(v, pais); return t ? ` (${t})` : ""; };
const puestoTxt = (orden, n, que = n < 24 ? "jurisdicciones con dato" : "jurisdicciones") => `${orden === 1 ? "La cifra más alta" : orden === n ? "La cifra más baja"
: orden <= n / 2 ? `La ${orden}.ª cifra más alta` : `La ${n - orden + 1}.ª cifra más baja`} de las ${n} ${que}`;
const css = k => getComputedStyle(document.documentElement).getPropertyValue(k).trim();
const tip = document.getElementById("tip");
const NBSP = "\u00A0";
function sinViuda(t) {
const p = t.split(" ");
if (p.length < 4) return t;
let i = p.length - 2, grupo = p[i] + NBSP + p[i + 1];
if (grupo.length > 16) return t;
while (i > 1 && p[i - 1].length <= 3 && grupo.length + p[i - 1].length < 16) { i--; grupo = p[i] + NBSP + grupo; }
return [...p.slice(0, i), grupo].join(" ");
}
const CON_TEXTO = "p, li, dd, dt, h1, h2, h3, h4, b, small, .sec-preg, .c-txt";
const atarTexto = el => {
if (!el.matches?.(CON_TEXTO) || el.closest("svg")) return;
const n = el.lastChild;
if (n?.nodeType === 3) { const t = sinViuda(n.nodeValue); if (t !== n.nodeValue) n.nodeValue = t; }
};
const atar = raiz => { atarTexto(raiz); raiz.querySelectorAll?.(CON_TEXTO).forEach(atarTexto); };
const vigiaTextos = new MutationObserver(ms => ms.forEach(m => {
if (m.type === "characterData") { if (m.target.parentElement) atarTexto(m.target.parentElement); return; }
if (m.target.closest?.("svg")) return;
atarTexto(m.target); m.addedNodes.forEach(n => { if (n.nodeType === 1) atar(n); });
}));
const ICONOS = {"periodico": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.210) translate(-4.2 -24)\"><path class=\"s\" d=\"M-38.5 26.4L8.3 53.4L8.3 50.7L-38.5 23.7Z\"/><path class=\"s\" d=\"M46.8 31.2L8.3 53.4L8.3 50.7L46.8 28.5Z\"/><path class=\"l\" d=\"M0 1.5L46.8 28.5L8.3 50.7L-38.5 23.7Z\"/><path class=\"l\" d=\"M-38.5 19.5L8.3 46.5L8.3 43.8L-38.5 16.8Z\"/><path class=\"s\" d=\"M46.8 24.3L8.3 46.5L8.3 43.8L46.8 21.6Z\"/><path class=\"l\" d=\"M0 -5.4L46.8 21.6L8.3 43.8L-38.5 16.8Z\"/><path class=\"s\" d=\"M0 -0.6L38.5 21.6L32.2 25.2L-6.2 3Z\"/><path class=\"s\" d=\"M-9.9 5.1L6.8 14.7L-13 26.1L-29.6 16.5Z\"/><path class=\"k\" d=\"M10.4 17.4L28.1 27.6\"/><path class=\"k\" d=\"M5.7 20.1L23.4 30.3\"/><path class=\"k\" d=\"M1 22.8L18.7 33\"/><path class=\"k\" d=\"M-3.6 25.5L14 35.7\"/><path class=\"k\" d=\"M-8.3 28.2L9.4 38.4\"/></g>"}, "maletin": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.058) translate(-26.6 -1.8)\"><ellipse class=\"s\" cx=\"27\" cy=\"25.2\" rx=\"47\" ry=\"9.3\"/><path class=\"l\" d=\"M-20.8 12L27 39.6L27 3.6L-20.8 -24Z\"/><path class=\"s\" d=\"M47.8 27.6L27 39.6L27 3.6L47.8 -8.4Z\"/><path class=\"l\" d=\"M0 -36L47.8 -8.4L27 3.6L-20.8 -24Z\"/><path class=\"s\" d=\"M9.9 -25.5L9.9 -19.8L7 -18.2L7 -23.9Z\"/><path class=\"s\" d=\"M7 -30.5L22.6 -21.5L19.7 -19.8L4.2 -28.8Z\"/><path class=\"s\" d=\"M22.6 -21.5L22.6 -12.5L19.7 -10.8L19.7 -19.8Z\"/><path class=\"s\" d=\"M4.2 -19.8L4.2 -28.8L19.7 -19.8L19.7 -10.8L16.9 -12.5L16.9 -18.2L7 -23.9L7 -18.2Z\"/><path class=\"k\" d=\"M-20.8 -10.8L27 16.8\"/><path class=\"s\" d=\"M0 4.8L6.2 8.4L6.2 1.2L0 -2.4Z\"/></g>"}, "tienda": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(0.942) translate(-13.1 -5.7)\"><ellipse class=\"s\" cx=\"28.1\" cy=\"34.2\" rx=\"38.2\" ry=\"9.3\"/><path class=\"l\" d=\"M-31.2 18L15.6 45L15.6 11.4L-31.2 -15.6Z\"/><path class=\"s\" d=\"M46.8 27L15.6 45L15.6 11.4L46.8 -6.6Z\"/><path class=\"l\" d=\"M0 -33.6L46.8 -6.6L15.6 11.4L-31.2 -15.6Z\"/><path class=\"s\" d=\"M-26 21L-17.1 26.1L-17.1 5.7L-26 0.6Z\"/><path class=\"l\" d=\"M-13 20.7L10.4 34.2L10.4 21.6L-13 8.1Z\"/><path class=\"k\" d=\"M-1.3 27.4L-1.3 14.8\"/><path class=\"s\" d=\"M-31.2 -12L-21.8 -6.6L-30.7 3.9L-40 -1.5Z\"/><path class=\"s\" d=\"M-40 -1.5L-30.7 3.9L-30.7 6.9L-40 1.5Z\"/><path class=\"l\" d=\"M-21.8 -6.6L-12.5 -1.2L-21.3 9.3L-30.7 3.9Z\"/><path class=\"l\" d=\"M-30.7 3.9L-21.3 9.3L-21.3 12.3L-30.7 6.9Z\"/><path class=\"s\" d=\"M-12.5 -1.2L-3.1 4.2L-12 14.7L-21.3 9.3Z\"/><path class=\"s\" d=\"M-21.3 9.3L-12 14.7L-12 17.7L-21.3 12.3Z\"/><path class=\"l\" d=\"M-3.1 4.2L6.2 9.6L-2.6 20.1L-12 14.7Z\"/><path class=\"l\" d=\"M-12 14.7L-2.6 20.1L-2.6 23.1L-12 17.7Z\"/><path class=\"s\" d=\"M6.2 9.6L15.6 15L6.8 25.5L-2.6 20.1Z\"/><path class=\"s\" d=\"M-2.6 20.1L6.8 25.5L6.8 28.5L-2.6 23.1Z\"/></g>"}, "casa": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(0.881) translate(-7.5 -2.7)\"><ellipse class=\"s\" cx=\"21.8\" cy=\"31.8\" rx=\"35.3\" ry=\"8.5\"/><path class=\"l\" d=\"M-20.8 -36.6L20.8 -12.6L42.1 -4.5L0.5 -28.5Z\"/><path class=\"l\" d=\"M14 -12.9L18.7 -10.2L18.7 -24.6L14 -27.3Z\"/><path class=\"s\" d=\"M23.4 -12.9L18.7 -10.2L18.7 -24.6L23.4 -27.3Z\"/><path class=\"l\" d=\"M18.7 -30L23.4 -27.3L18.7 -24.6L14 -27.3Z\"/><path class=\"l\" d=\"M-36.4 21L0 42L0 15.6L-36.4 -5.4Z\"/><path class=\"s\" d=\"M36.4 21L0 42L0 15.6L36.4 -5.4Z\"/><path class=\"s\" d=\"M39.5 -6L-3.1 18.6L18.2 -14.1Z\"/><path class=\"w\" d=\"M22.9 -0.6L13.5 4.8L13.5 -3L22.9 -8.4Z\"/><path class=\"s\" d=\"M-31.2 24L-22.9 28.8L-22.9 10.8L-31.2 6Z\"/><path class=\"l\" d=\"M-16.6 24L-5.2 30.6L-5.2 19.8L-16.6 13.2Z\"/><path class=\"k\" d=\"M-10.9 27.3L-10.9 16.5\"/><path class=\"s\" d=\"M-20.8 -36.6L20.8 -12.6L-0.5 20.1L-42.1 -3.9Z\"/></g>"}, "botiquin": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.015) translate(-23.9 -0.9)\"><ellipse class=\"s\" cx=\"29.1\" cy=\"27.6\" rx=\"42.6\" ry=\"9.3\"/><path class=\"l\" d=\"M-23.9 13.8L19.7 39L19.7 1.8L-23.9 -23.4Z\"/><path class=\"s\" d=\"M43.6 25.2L19.7 39L19.7 1.8L43.6 -12Z\"/><path class=\"l\" d=\"M0 -37.2L43.6 -12L19.7 1.8L-23.9 -23.4Z\"/><path class=\"s\" d=\"M7 -25.7L7 -21.2L4.2 -19.5L4.2 -24Z\"/><path class=\"s\" d=\"M4.2 -30.6L18.7 -22.2L15.8 -20.6L1.3 -29Z\"/><path class=\"s\" d=\"M18.7 -22.2L18.7 -14.4L15.8 -12.8L15.8 -20.6Z\"/><path class=\"s\" d=\"M1.3 -21.2L1.3 -29L15.8 -20.6L15.8 -12.8L13 -14.4L13 -18.9L4.2 -24L4.2 -19.5Z\"/><path class=\"s\" d=\"M-6 18.1L1.8 22.6L1.8 14.5L8.8 18.6L8.8 9.6L1.8 5.5L1.8 -2.6L-6 -7.1L-6 1L-13 -3L-13 6L-6 10Z\"/></g>"}, "birrete": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.043) translate(-1.8 -12.4)\"><path class=\"l\" d=\"M-22.8 13.2L-22 9.8L-18.1 5.2L-11.4 1.8L-0 0L11.4 1.8L18.1 5.2L22 9.8L22.8 13.2L21.1 31.6L18.5 36.2L13 39.8L2.8 42.2L-8.2 41.4L-15.1 38.7L-19.7 34.7L-21.1 31.6L-21.3 30Z\"/><path class=\"s\" d=\"M0 0L-0 0L11.4 1.8L18.1 5.2L22 9.8L22.8 13.2L21.1 31.6L18.5 36.2L13 39.8L2.8 42.2L0 42Z\"/><path class=\"s\" d=\"M47.8 13.2L0 40.8L0 37.8L47.8 10.2Z\"/><path class=\"s\" d=\"M0 40.8L-47.8 13.2L-47.8 10.2L0 37.8Z\"/><path class=\"s\" d=\"M0 -17.4L47.8 10.2L0 37.8L-47.8 10.2Z\"/><path class=\"s\" d=\"M-4 10.2A4 2.3 0 0 0 4 10.2L4 8.4A4 2.3 0 0 1 -4 8.4Z\"/><ellipse class=\"l\" cx=\"0\" cy=\"8.4\" rx=\"4\" ry=\"2.3\"/><path class=\"wl\" d=\"M0 8.4L47.8 10.2\"/><path class=\"k\" d=\"M47.8 10.2L47.8 25.2\"/><path class=\"s\" d=\"M44.2 31.8L47.8 33.9L47.8 26.1L44.2 24Z\"/><path class=\"s\" d=\"M51.4 31.8L47.8 33.9L47.8 26.1L51.4 24Z\"/><path class=\"s\" d=\"M47.8 21.9L51.4 24L47.8 26.1L44.2 24Z\"/></g>"}, "personas": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.204) translate(-0 -16.4)\"><path class=\"s\" d=\"M-36.6 24.6A10.7 6.2 0 0 0 -15.3 24.6L-15.3 10.2A10.7 6.2 0 0 1 -36.6 10.2Z\"/><path class=\"l\" d=\"M-36.6 10.2A10.7 10.7 0 0 1 -15.3 10.2A10.7 6.2 0 0 1 -36.6 10.2Z\"/><path class=\"s\" d=\"M-26 -0.5A10.7 10.7 0 0 1 -15.3 10.2A10.7 6.2 0 0 1 -26 16.4Z\"/><circle class=\"l\" cx=\"-26\" cy=\"-3.9\" r=\"7\"/><path class=\"s\" d=\"M-26 -10.9A7 7 0 0 1 -26 3.1Z\"/><path class=\"s\" d=\"M15.3 24.6A10.7 6.2 0 0 0 36.6 24.6L36.6 10.2A10.7 6.2 0 0 1 15.3 10.2Z\"/><path class=\"l\" d=\"M15.3 10.2A10.7 10.7 0 0 1 36.6 10.2A10.7 6.2 0 0 1 15.3 10.2Z\"/><path class=\"s\" d=\"M26 -0.5A10.7 10.7 0 0 1 36.6 10.2A10.7 6.2 0 0 1 26 16.4Z\"/><circle class=\"l\" cx=\"26\" cy=\"-3.9\" r=\"7\"/><path class=\"s\" d=\"M26 -10.9A7 7 0 0 1 26 3.1Z\"/><path class=\"s\" d=\"M-13.2 36A13.2 7.6 0 0 0 13.2 36L13.2 18A13.2 7.6 0 0 1 -13.2 18Z\"/><path class=\"l\" d=\"M-13.2 18A13.2 13.2 0 0 1 13.2 18A13.2 7.6 0 0 1 -13.2 18Z\"/><path class=\"s\" d=\"M0 4.8A13.2 13.2 0 0 1 13.2 18A13.2 7.6 0 0 1 0 25.6Z\"/><circle class=\"l\" cx=\"0\" cy=\"0.5\" r=\"8.7\"/><path class=\"s\" d=\"M0 -8.2A8.7 8.7 0 0 1 0 9.2Z\"/></g>"}, "congreso": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(0.885) translate(-9.4 -15.5)\"><path class=\"l\" d=\"M-43.6 25.2L18.7 61.2L18.7 56.4L-43.6 20.4Z\"/><path class=\"s\" d=\"M62.4 36L18.7 61.2L18.7 56.4L62.4 31.2Z\"/><path class=\"l\" d=\"M0 -4.8L62.4 31.2L18.7 56.4L-43.6 20.4Z\"/><path class=\"l\" d=\"M-34.3 19.8L19.7 51L19.7 28.2L-34.3 -3Z\"/><path class=\"s\" d=\"M54 31.2L19.7 51L19.7 28.2L54 8.4Z\"/><path class=\"l\" d=\"M0 -22.8L54 8.4L19.7 28.2L-34.3 -3Z\"/><path class=\"s\" d=\"M-30.7 20.1L-27 22.2L-27 4.2L-30.7 2.1Z\"/><path class=\"s\" d=\"M-21.6 25.3L-17.9 27.4L-17.9 9.5L-21.6 7.3Z\"/><path class=\"s\" d=\"M-12.5 30.6L-8.8 32.7L-8.8 14.7L-12.5 12.6Z\"/><path class=\"s\" d=\"M-3.4 35.8L0.3 37.9L0.3 20L-3.4 17.8Z\"/><path class=\"s\" d=\"M5.7 41.1L9.4 43.2L9.4 25.2L5.7 23.1Z\"/><path class=\"s\" d=\"M14.8 46.3L18.4 48.4L18.4 30.4L14.8 28.3Z\"/><path class=\"l\" d=\"M-17.7 6.6L3.1 18.6L-7.3 4.8Z\"/><path class=\"s\" d=\"M-7.3 4.8L-17.7 6.6L-11.4 3L-1 1.2Z\"/><path class=\"s\" d=\"M3.1 18.6L-7.3 4.8L-1 1.2L9.4 15Z\"/><path class=\"s\" d=\"M-7 2.7A16.9 9.8 0 0 0 26.8 2.7L26.8 -6.3A16.9 9.8 0 0 1 -7 -6.3Z\"/><ellipse class=\"l\" cx=\"9.9\" cy=\"-6.3\" rx=\"16.9\" ry=\"9.8\"/><path class=\"l\" d=\"M-7 -6.3A16.9 16.9 0 0 1 26.8 -6.3A16.9 9.8 0 0 1 -7 -6.3Z\"/><path class=\"s\" d=\"M9.9 -23.2A16.9 16.9 0 0 1 26.8 -6.3A16.9 9.8 0 0 1 9.9 3.5Z\"/><path class=\"s\" d=\"M6.6 -22.8A3.3 1.9 0 0 0 13.2 -22.8L13.2 -28.2A3.3 1.9 0 0 1 6.6 -28.2Z\"/><ellipse class=\"l\" cx=\"9.9\" cy=\"-28.2\" rx=\"3.3\" ry=\"1.9\"/></g>"}, "colectivo": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.121) translate(-18.4 -3.7)\"><path class=\"l\" d=\"M-22.9 7.2L36.9 41.7L36.9 12.9L-22.9 -21.6Z\"/><path class=\"s\" d=\"M59.8 28.5L36.9 41.7L36.9 12.9L59.8 -0.3Z\"/><path class=\"l\" d=\"M0 -34.8L59.8 -0.3L36.9 12.9L-22.9 -21.6Z\"/><path class=\"s\" d=\"M-7.3 1.8L-0.8 5.5L-0.8 -4.7L-7.3 -8.4Z\"/><path class=\"s\" d=\"M1.3 6.7L7.8 10.5L7.8 0.3L1.3 -3.5Z\"/><path class=\"s\" d=\"M9.9 11.7L16.4 15.4L16.4 5.2L9.9 1.5Z\"/><path class=\"s\" d=\"M18.4 16.6L24.9 20.4L24.9 10.2L18.4 6.4Z\"/><path class=\"s\" d=\"M27 21.6L33.5 25.3L33.5 15.1L27 11.4Z\"/><path class=\"s\" d=\"M-18.7 4.8L-11.4 9L-11.4 -10.8L-18.7 -15Z\"/><path class=\"w\" d=\"M57.2 16.2L39.5 26.4L39.5 14.4L57.2 4.2Z\"/><path class=\"s\" d=\"M0.3 20.2L0.1 18.5L-0.4 16.6L-1.2 14.8L-2.2 13L-3.4 11.4L-4.8 10L-6.2 9L-7.7 8.4L-9.1 8.1L-10.3 8.3L-11.3 8.9L-12.1 9.9L-12.6 11.2L-12.7 12.7L-12.6 14.5L-12.1 16.4L-11.3 18.2L-10.3 20L-9.1 21.6L-7.7 23L-6.2 24L-4.8 24.6L-3.4 24.9L-2.2 24.7L-1.2 24.1L-0.4 23.1L0.1 21.8Z\"/><path class=\"w\" d=\"M-3.9 17.8L-4 17.1L-4.2 16.3L-4.6 15.5L-5.1 14.8L-5.6 14.2L-6.2 13.8L-6.8 13.5L-7.4 13.5L-7.9 13.6L-8.3 14L-8.5 14.5L-8.6 15.1L-8.5 15.9L-8.3 16.7L-7.9 17.5L-7.4 18.2L-6.8 18.8L-6.2 19.2L-5.6 19.5L-5.1 19.5L-4.6 19.4L-4.2 19L-4 18.5Z\"/><path class=\"s\" d=\"M30.4 37.6L30.2 35.9L29.8 34L29 32.2L28 30.4L26.7 28.8L25.3 27.4L23.9 26.4L22.5 25.8L21.1 25.5L19.9 25.7L18.8 26.3L18.1 27.3L17.6 28.6L17.4 30.1L17.6 31.9L18.1 33.8L18.8 35.6L19.9 37.4L21.1 39L22.5 40.4L23.9 41.4L25.3 42L26.7 42.3L28 42.1L29 41.5L29.8 40.5L30.2 39.2Z\"/><path class=\"w\" d=\"M26.2 35.2L26.2 34.5L25.9 33.7L25.6 32.9L25.1 32.2L24.5 31.6L23.9 31.2L23.3 30.9L22.7 30.9L22.2 31L21.9 31.4L21.6 31.9L21.6 32.5L21.6 33.3L21.9 34.1L22.2 34.9L22.7 35.6L23.3 36.2L23.9 36.6L24.5 36.9L25.1 36.9L25.6 36.8L25.9 36.4L26.2 35.9Z\"/></g>"}, "rayo": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.350) translate(-17.7 16.2)\"><ellipse class=\"s\" cx=\"17.7\" cy=\"17.4\" rx=\"26.5\" ry=\"5.9\"/><path class=\"l\" d=\"M7.3 4.2L35.3 -18.6L26.5 -13.5L-1.6 9.3Z\"/><path class=\"l\" d=\"M35.3 -18.6L20.3 -27.3L11.4 -22.2L26.5 -13.5Z\"/><path class=\"l\" d=\"M20.3 -27.3L30.1 -46.2L21.3 -41.1L11.4 -22.2Z\"/><path class=\"l\" d=\"M30.1 -46.2L13.5 -55.8L4.7 -50.7L21.3 -41.1Z\"/><path class=\"s\" d=\"M4.7 -50.7L-7.8 -23.7L6.2 -15.6L-1.6 9.3L26.5 -13.5L11.4 -22.2L21.3 -41.1Z\"/></g>"}, "valija": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.137) translate(-18.2 8.3)\"><ellipse class=\"s\" cx=\"21.8\" cy=\"21\" rx=\"32.3\" ry=\"7.6\"/><path class=\"s\" d=\"M-14.1 11.4A3.7 2.1 0 0 0 -6.7 11.4L-6.7 8.1A3.7 2.1 0 0 1 -14.1 8.1Z\"/><path class=\"s\" d=\"M7.8 24A3.7 2.1 0 0 0 15.1 24L15.1 20.7A3.7 2.1 0 0 1 7.8 20.7Z\"/><path class=\"l\" d=\"M-17.7 6.9L14.5 25.5L14.5 -16.5L-17.7 -35.1Z\"/><path class=\"s\" d=\"M32.2 15.3L14.5 25.5L14.5 -16.5L32.2 -26.7Z\"/><path class=\"l\" d=\"M0 -45.3L32.2 -26.7L14.5 -16.5L-17.7 -35.1Z\"/><path class=\"s\" d=\"M-10.9 10.8L-7.8 12.6L-7.8 -29.4L-10.9 -31.2Z\"/><path class=\"s\" d=\"M4.7 19.8L7.8 21.6L7.8 -20.4L4.7 -22.2Z\"/><path class=\"s\" d=\"M6.2 -38.7L6.2 -33.3L3.1 -31.5L3.1 -36.9Z\"/><path class=\"s\" d=\"M3.1 -44.1L14.5 -37.5L11.4 -35.7L0 -42.3Z\"/><path class=\"s\" d=\"M14.5 -37.5L14.5 -28.5L11.4 -26.7L11.4 -35.7Z\"/><path class=\"s\" d=\"M0 -33.3L0 -42.3L11.4 -35.7L11.4 -26.7L8.3 -28.5L8.3 -33.9L3.1 -36.9L3.1 -31.5Z\"/></g>"}, "andes": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.041) translate(-9.4 -18.4)\"><path class=\"l\" d=\"M-5.2 45.8L-41.9 24.6L-1 -27Z\"/><path class=\"k\" d=\"M-2.5 -0.8L-6.7 -11.3L-15.8 -8.4\"/><path class=\"s\" d=\"M31.5 24.6L-5.2 45.8L-1 -27Z\"/><path class=\"w\" d=\"M-1 -27L10.7 -8.4L2.5 -11.3L-2.5 -0.8Z\"/><path class=\"s\" d=\"M35.8 48.6L9.4 63.9L9.4 13.8Z\"/><path class=\"w\" d=\"M9.4 13.8L17.8 24.9L12.3 23.3L9.4 29.8Z\"/><path class=\"l\" d=\"M9.4 63.9L-17.1 48.6L9.4 13.8Z\"/><path class=\"k\" d=\"M9.4 29.8L6.4 23.3L0.9 24.9\"/><path class=\"l\" d=\"M41.6 44.6L22.5 33.6L41.6 9.6Z\"/><path class=\"k\" d=\"M41.6 20.1L39.6 15.8L35.8 16.8\"/><path class=\"s\" d=\"M60.7 33.6L41.6 44.6L41.6 9.6Z\"/><path class=\"w\" d=\"M41.6 9.6L47.3 16.8L43.6 15.8L41.6 20.1Z\"/></g>"}, "mate": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.350) translate(-8.9 -3.7)\"><ellipse class=\"s\" cx=\"16.6\" cy=\"30\" rx=\"26.5\" ry=\"6.4\"/><path class=\"l\" d=\"M-25.4 18.6L-23.8 10.7L-18.8 3.9L-10.7 -3.8L-2 -6.2L7.5 -5.1L13 -1.9L23.8 10.7L25.4 18.6L23.1 26.4L18.9 31.2L12.3 35.7L2.6 38L-7.7 37.2L-16 33.5L-22.1 28.1L-25.1 20.5Z\"/><path class=\"s\" d=\"M0 -6L7.5 -5.1L13 -1.9L23.8 10.7L25.4 18.6L23.1 26.4L18.9 31.2L12.3 35.7L2.6 38L0 37.8Z\"/><path class=\"l\" d=\"M-15.8 2.4A15.8 9.1 0 0 0 15.8 2.4L15.8 -2.4A15.8 9.1 0 0 1 -15.8 -2.4Z\"/><ellipse class=\"l\" cx=\"0\" cy=\"-2.4\" rx=\"15.8\" ry=\"9.1\"/><ellipse class=\"s\" cx=\"0\" cy=\"-2.4\" rx=\"12.1\" ry=\"7\"/><path class=\"k\" d=\"M6.2 -1.8L32.7 -29.1L41.6 -28.5\"/><path class=\"k\" d=\"M6.2 -3.3L32.7 -30.6\"/></g>"}, "dispersion": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.083) translate(-0 -27.1)\"><path class=\"s\" d=\"M-49.9 28.8L0 57.6L0 54.3L-49.9 25.5Z\"/><path class=\"s\" d=\"M49.9 28.8L0 57.6L0 54.3L49.9 25.5Z\"/><path class=\"l\" d=\"M0 -3.3L49.9 25.5L0 54.3L-49.9 25.5Z\"/><path class=\"s\" d=\"M-23.1 25L-17.1 28.5L-17.1 19.5L-23.1 16Z\"/><path class=\"s\" d=\"M-11.2 25L-17.1 28.5L-17.1 19.5L-11.2 16Z\"/><path class=\"l\" d=\"M-17.1 12.6L-11.2 16L-17.1 19.5L-23.1 16Z\"/><path class=\"s\" d=\"M23.1 25.3L29.1 28.8L29.1 8.4L23.1 4.9Z\"/><path class=\"s\" d=\"M35.1 25.3L29.1 28.8L29.1 8.4L35.1 4.9Z\"/><path class=\"l\" d=\"M29.1 1.5L35.1 4.9L29.1 8.4L23.1 4.9Z\"/><path class=\"s\" d=\"M-40.8 25.6L-34.8 29.1L-34.8 24.3L-40.8 20.8Z\"/><path class=\"s\" d=\"M-28.8 25.6L-34.8 29.1L-34.8 24.3L-28.8 20.8Z\"/><path class=\"l\" d=\"M-34.8 17.4L-28.8 20.8L-34.8 24.3L-40.8 20.8Z\"/><path class=\"s\" d=\"M-1.3 25.6L4.7 29.1L4.7 14.7L-1.3 11.2Z\"/><path class=\"s\" d=\"M10.7 25.6L4.7 29.1L4.7 14.7L10.7 11.2Z\"/><path class=\"l\" d=\"M4.7 7.8L10.7 11.2L4.7 14.7L-1.3 11.2Z\"/><path class=\"s\" d=\"M-21 33.4L-15.1 36.9L-15.1 30.3L-21 26.8Z\"/><path class=\"s\" d=\"M-9.1 33.4L-15.1 36.9L-15.1 30.3L-9.1 26.8Z\"/><path class=\"l\" d=\"M-15.1 23.4L-9.1 26.8L-15.1 30.3L-21 26.8Z\"/><path class=\"s\" d=\"M18.4 33.4L24.4 36.9L24.4 19.5L18.4 16Z\"/><path class=\"s\" d=\"M30.4 33.4L24.4 36.9L24.4 19.5L30.4 16Z\"/><path class=\"l\" d=\"M24.4 12.6L30.4 16L24.4 19.5L18.4 16Z\"/><path class=\"s\" d=\"M1.8 34.6L7.8 38.1L7.8 26.1L1.8 22.6Z\"/><path class=\"s\" d=\"M13.8 34.6L7.8 38.1L7.8 26.1L13.8 22.6Z\"/><path class=\"l\" d=\"M7.8 19.2L13.8 22.6L7.8 26.1L1.8 22.6Z\"/></g>"}, "podio": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.266) translate(-14 -6.9)\"><path class=\"l\" d=\"M-21.8 12.6L-5.2 22.2L-5.2 -3L-21.8 -12.6Z\"/><path class=\"s\" d=\"M16.6 9.6L-5.2 22.2L-5.2 -3L16.6 -15.6Z\"/><path class=\"l\" d=\"M0 -25.2L16.6 -15.6L-5.2 -3L-21.8 -12.6Z\"/><path class=\"l\" d=\"M-5.2 22.2L11.4 31.8L11.4 -5.4L-5.2 -15Z\"/><path class=\"s\" d=\"M33.3 19.2L11.4 31.8L11.4 -5.4L33.3 -18Z\"/><path class=\"l\" d=\"M16.6 -27.6L33.3 -18L11.4 -5.4L-5.2 -15Z\"/><path class=\"l\" d=\"M11.4 31.8L28.1 41.4L28.1 24.6L11.4 15Z\"/><path class=\"s\" d=\"M49.9 28.8L28.1 41.4L28.1 24.6L49.9 12Z\"/><path class=\"l\" d=\"M33.3 2.4L49.9 12L28.1 24.6L11.4 15Z\"/><path class=\"s\" d=\"M-16.6 -0L-10.4 3.6L-10.4 0.9L-16.6 -2.7Z\"/><path class=\"s\" d=\"M0 -2.4L6.2 1.2L6.2 -1.5L0 -5.1Z\"/><path class=\"s\" d=\"M16.6 26.4L22.9 30L22.9 27.3L16.6 23.7Z\"/></g>"}, "mosaico": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.136) translate(-0 -20.5)\"><path class=\"l\" d=\"M-14 8.1L0 16.2L0 10.2L-14 2.1Z\"/><path class=\"s\" d=\"M14 8.1L0 16.2L0 10.2L14 2.1Z\"/><path class=\"l\" d=\"M0 -6L14 2.1L0 10.2L-14 2.1Z\"/><path class=\"l\" d=\"M-30.1 17.4L-16.1 25.5L-16.1 9.9L-30.1 1.8Z\"/><path class=\"s\" d=\"M-2.1 17.4L-16.1 25.5L-16.1 9.9L-2.1 1.8Z\"/><path class=\"l\" d=\"M-16.1 -6.3L-2.1 1.8L-16.1 9.9L-30.1 1.8Z\"/><path class=\"l\" d=\"M2.1 17.4L16.1 25.5L16.1 3.9L2.1 -4.2Z\"/><path class=\"s\" d=\"M30.1 17.4L16.1 25.5L16.1 3.9L30.1 -4.2Z\"/><path class=\"l\" d=\"M16.1 -12.3L30.1 -4.2L16.1 3.9L2.1 -4.2Z\"/><path class=\"l\" d=\"M-46.2 26.7L-32.2 34.8L-32.2 25.2L-46.2 17.1Z\"/><path class=\"s\" d=\"M-18.2 26.7L-32.2 34.8L-32.2 25.2L-18.2 17.1Z\"/><path class=\"l\" d=\"M-32.2 9L-18.2 17.1L-32.2 25.2L-46.2 17.1Z\"/><path class=\"l\" d=\"M-14 26.7L0 34.8L0 27.6L-14 19.5Z\"/><path class=\"s\" d=\"M14 26.7L0 34.8L0 27.6L14 19.5Z\"/><path class=\"l\" d=\"M0 11.4L14 19.5L0 27.6L-14 19.5Z\"/><path class=\"l\" d=\"M18.2 26.7L32.2 34.8L32.2 24L18.2 15.9Z\"/><path class=\"s\" d=\"M46.2 26.7L32.2 34.8L32.2 24L46.2 15.9Z\"/><path class=\"l\" d=\"M32.2 7.8L46.2 15.9L32.2 24L18.2 15.9Z\"/><path class=\"l\" d=\"M-30.1 36L-16.1 44.1L-16.1 30.9L-30.1 22.8Z\"/><path class=\"s\" d=\"M-2.1 36L-16.1 44.1L-16.1 30.9L-2.1 22.8Z\"/><path class=\"l\" d=\"M-16.1 14.7L-2.1 22.8L-16.1 30.9L-30.1 22.8Z\"/><path class=\"l\" d=\"M2.1 36L16.1 44.1L16.1 17.7L2.1 9.6Z\"/><path class=\"s\" d=\"M30.1 36L16.1 44.1L16.1 17.7L30.1 9.6Z\"/><path class=\"l\" d=\"M16.1 1.5L30.1 9.6L16.1 17.7L2.1 9.6Z\"/><path class=\"l\" d=\"M-14 45.3L0 53.4L0 45L-14 36.9Z\"/><path class=\"s\" d=\"M14 45.3L0 53.4L0 45L14 36.9Z\"/><path class=\"l\" d=\"M0 28.8L14 36.9L0 45L-14 36.9Z\"/></g>"}, "pin": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.123) translate(-6.5 -22.3)\"><path class=\"s\" d=\"M0 0L18.2 5.1L-23.4 29.1L-41.6 24Z\"/><path class=\"l\" d=\"M18.2 5.1L36.4 21L-5.2 45L-23.4 29.1Z\"/><path class=\"s\" d=\"M36.4 21L54.6 26.1L13 50.1L-5.2 45Z\"/><path class=\"wl\" d=\"M-30.1 21L-9.4 15.2L0.5 15.3\"/><path class=\"k\" d=\"M0.5 15.3L12.5 19.7L24.9 27.6\"/><path class=\"s\" d=\"M27 33.5L16.6 10.6L37.4 10.6Z\"/><circle class=\"s\" cx=\"27\" cy=\"5.9\" r=\"11.4\"/><circle class=\"w\" cx=\"27\" cy=\"5.9\" r=\"4.8\"/></g>"}, "buque": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.074) translate(-22.7 -6.1)\"><ellipse class=\"s\" cx=\"27\" cy=\"26.4\" rx=\"41.2\" ry=\"7.6\"/><path class=\"s\" d=\"M60.3 21L0 -13.8L-22.9 -0.6L37.4 34.2Z\"/><path class=\"s\" d=\"M52 30L60.3 21L37.4 34.2L29.1 43.2Z\"/><path class=\"s\" d=\"M-22.9 -0.6L-18.7 15.6L29.1 43.2L37.4 34.2Z\"/><path class=\"l\" d=\"M0 -13.8L60.3 21L37.4 34.2L-22.9 -0.6Z\"/><path class=\"wl\" d=\"M-20 10.3L31.7 40.2\"/><path class=\"l\" d=\"M-17.1 -0.9L-7.3 4.8L-7.3 -15.6L-17.1 -21.3Z\"/><path class=\"s\" d=\"M9.4 -4.8L-7.3 4.8L-7.3 -15.6L9.4 -25.2Z\"/><path class=\"l\" d=\"M-0.5 -30.9L9.4 -25.2L-7.3 -15.6L-17.1 -21.3Z\"/><path class=\"s\" d=\"M-16.1 -14.1L-8.3 -9.6L-8.3 -13.8L-16.1 -18.3Z\"/><path class=\"l\" d=\"M-5.7 6.3L5.7 12.9L5.7 5.1L-5.7 -1.5Z\"/><path class=\"s\" d=\"M23.4 2.7L5.7 12.9L5.7 5.1L23.4 -5.1Z\"/><path class=\"l\" d=\"M12 -11.7L23.4 -5.1L5.7 5.1L-5.7 -1.5Z\"/><path class=\"s\" d=\"M5.7 12.9L17.1 19.5L17.1 11.7L5.7 5.1Z\"/><path class=\"s\" d=\"M34.8 9.3L17.1 19.5L17.1 11.7L34.8 1.5Z\"/><path class=\"l\" d=\"M23.4 -5.1L34.8 1.5L17.1 11.7L5.7 5.1Z\"/><path class=\"l\" d=\"M5.7 5.1L17.1 11.7L17.1 3.9L5.7 -2.7Z\"/><path class=\"s\" d=\"M34.8 1.5L17.1 11.7L17.1 3.9L34.8 -6.3Z\"/><path class=\"l\" d=\"M23.4 -12.9L34.8 -6.3L17.1 3.9L5.7 -2.7Z\"/><path class=\"s\" d=\"M17.1 19.5L28.6 26.1L28.6 18.3L17.1 11.7Z\"/><path class=\"s\" d=\"M46.2 15.9L28.6 26.1L28.6 18.3L46.2 8.1Z\"/><path class=\"l\" d=\"M34.8 1.5L46.2 8.1L28.6 18.3L17.1 11.7Z\"/><path class=\"l\" d=\"M17.1 11.7L28.6 18.3L28.6 10.5L17.1 3.9Z\"/><path class=\"s\" d=\"M46.2 8.1L28.6 18.3L28.6 10.5L46.2 0.3Z\"/><path class=\"l\" d=\"M34.8 -6.3L46.2 0.3L28.6 10.5L17.1 3.9Z\"/><path class=\"s\" d=\"M28.6 26.1L40 32.7L40 24.9L28.6 18.3Z\"/><path class=\"s\" d=\"M57.7 22.5L40 32.7L40 24.9L57.7 14.7Z\"/><path class=\"l\" d=\"M46.2 8.1L57.7 14.7L40 24.9L28.6 18.3Z\"/></g>"}, "gota": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.333) translate(-21.8 11.3)\"><ellipse class=\"s\" cx=\"21.8\" cy=\"21\" rx=\"29.4\" ry=\"6.8\"/><path class=\"s\" d=\"M34.4 12.1L35.2 11.6L25.9 17L25.1 17.5Z\"/><path class=\"s\" d=\"M35.2 11.6L36 11L26.6 16.4L25.9 17Z\"/><path class=\"s\" d=\"M36 11L36.6 10.3L27.3 15.7L26.6 16.4Z\"/><path class=\"s\" d=\"M36.6 10.3L37.3 9.5L27.9 14.9L27.3 15.7Z\"/><path class=\"s\" d=\"M37.3 9.5L37.8 8.6L28.5 14L27.9 14.9Z\"/><path class=\"s\" d=\"M37.8 8.6L38.3 7.7L28.9 13.1L28.5 14Z\"/><path class=\"s\" d=\"M38.3 7.7L38.7 6.7L29.3 12.1L28.9 13.1Z\"/><path class=\"s\" d=\"M38.7 6.7L39 5.6L29.6 11L29.3 12.1Z\"/><path class=\"s\" d=\"M39 5.6L39.2 4.4L29.9 9.8L29.6 11Z\"/><path class=\"s\" d=\"M39.2 4.4L39.4 3.2L30 8.6L29.9 9.8Z\"/><path class=\"s\" d=\"M39.4 3.2L39.5 1.9L30.1 7.3L30 8.6Z\"/><path class=\"s\" d=\"M39.5 1.9L39.5 0.5L30.1 5.9L30.1 7.3Z\"/><path class=\"s\" d=\"M39.5 0.5L39.4 -0.9L30 4.5L30.1 5.9Z\"/><path class=\"s\" d=\"M39.4 -0.9L39.2 -2.3L29.9 3.1L30 4.5Z\"/><path class=\"s\" d=\"M39.2 -2.3L39 -3.7L29.6 1.7L29.9 3.1Z\"/><path class=\"s\" d=\"M39 -3.7L38.7 -5.2L29.3 0.2L29.6 1.7Z\"/><path class=\"s\" d=\"M38.7 -5.2L38.3 -6.7L28.9 -1.3L29.3 0.2Z\"/><path class=\"s\" d=\"M38.3 -6.7L37.8 -8.2L28.5 -2.8L28.9 -1.3Z\"/><path class=\"s\" d=\"M37.8 -8.2L37.3 -9.7L27.9 -4.3L28.5 -2.8Z\"/><path class=\"s\" d=\"M37.3 -9.7L22.9 -50.4L13.5 -45L27.9 -4.3Z\"/><path class=\"l\" d=\"M-0.9 -20.9L-1.4 -20L-1.9 -19.1L-2.3 -18.1L-2.6 -17L-2.9 -15.8L-3 -14.6L-3.1 -13.3L-3.1 -11.9L-3 -10.5L-2.9 -9.1L-2.6 -7.7L-2.3 -6.2L-1.9 -4.7L-1.4 -3.2L-0.9 -1.7L-0.3 -0.2L0.4 1.3L1.2 2.7L2 4.1L2.8 5.5L3.7 6.9L4.7 8.2L5.7 9.4L6.7 10.6L7.8 11.8L8.9 12.8L10.1 13.8L11.2 14.7L12.4 15.5L13.5 16.2L14.7 16.8L15.8 17.3L17 17.8L18.1 18.1L19.2 18.3L20.3 18.4L21.3 18.5L22.3 18.4L23.3 18.2L24.2 17.9L25.1 17.5L25.9 17L26.6 16.4L27.3 15.7L27.9 14.9L28.5 14L28.9 13.1L29.3 12.1L29.6 11L29.9 9.8L30 8.6L30.1 7.3L30.1 5.9L30 4.5L29.9 3.1L29.6 1.7L29.3 0.2L28.9 -1.3L28.5 -2.8L27.9 -4.3L13.5 -45Z\"/><path class=\"k\" d=\"M2.6 -9.3L4.2 -1.8L8.3 5.4\"/></g>"}, "mamadera": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.350) translate(-9.2 -6.5)\"><ellipse class=\"s\" cx=\"12.5\" cy=\"30\" rx=\"22\" ry=\"5.5\"/><path class=\"s\" d=\"M-14.3 30A14.3 8.3 0 0 0 14.3 30L14.3 7.8A14.3 8.3 0 0 1 -14.3 7.8Z\"/><path class=\"l\" d=\"M-14.3 7.8A14.3 8.3 0 0 0 14.3 7.8L14.3 -3.6A14.3 8.3 0 0 1 -14.3 -3.6Z\"/><path class=\"wl\" d=\"M4.9 30.6A14.3 8.3 0 0 1 -7.2 30\"/><path class=\"wl\" d=\"M4.9 24.6A14.3 8.3 0 0 1 -7.2 24\"/><path class=\"wl\" d=\"M4.9 18.6A14.3 8.3 0 0 1 -7.2 18\"/><path class=\"k\" d=\"M4.9 12.6A14.3 8.3 0 0 1 -7.2 12\"/><path class=\"s\" d=\"M-16.2 -3.6A16.2 9.3 0 0 0 16.2 -3.6L16.2 -10.2A16.2 9.3 0 0 1 -16.2 -10.2Z\"/><ellipse class=\"l\" cx=\"0\" cy=\"-10.2\" rx=\"16.2\" ry=\"9.3\"/><path class=\"l\" d=\"M-9.6 -10.2L-8.1 -15.1L0 -23.7L3.4 -22.4L9 -12.9L9.2 -8.8L4.8 -5.4L-4.8 -5.4L-9.2 -8.8L-9.5 -9.5Z\"/><path class=\"s\" d=\"M0 -23.7L0 -23.7L3.4 -22.4L9 -12.9L9.2 -8.8L4.8 -5.4L0 -5.4Z\"/><path class=\"l\" d=\"M-3.7 -21.6A3.7 3.7 0 0 1 3.7 -21.6A3.7 2.1 0 0 1 -3.7 -21.6Z\"/><path class=\"s\" d=\"M0 -25.3A3.7 3.7 0 0 1 3.7 -21.6A3.7 2.1 0 0 1 0 -19.5Z\"/></g>"}, "monedas": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.053) translate(-6.2 -16.7)\"><path class=\"s\" d=\"M-23.5 19.2A23.5 13.6 0 0 0 23.5 19.2L23.5 14.9A23.5 13.6 0 0 1 -23.5 14.9Z\"/><path class=\"s\" d=\"M-23.5 14.9A23.5 13.6 0 0 0 23.5 14.9L23.5 10.6A23.5 13.6 0 0 1 -23.5 10.6Z\"/><path class=\"s\" d=\"M-23.5 10.6A23.5 13.6 0 0 0 23.5 10.6L23.5 6.2A23.5 13.6 0 0 1 -23.5 6.2Z\"/><path class=\"s\" d=\"M-23.5 6.2A23.5 13.6 0 0 0 23.5 6.2L23.5 1.9A23.5 13.6 0 0 1 -23.5 1.9Z\"/><path class=\"s\" d=\"M-23.5 1.9A23.5 13.6 0 0 0 23.5 1.9L23.5 -2.4A23.5 13.6 0 0 1 -23.5 -2.4Z\"/><path class=\"s\" d=\"M-23.5 -2.4A23.5 13.6 0 0 0 23.5 -2.4L23.5 -6.7A23.5 13.6 0 0 1 -23.5 -6.7Z\"/><path class=\"s\" d=\"M-23.5 -6.7A23.5 13.6 0 0 0 23.5 -6.7L23.5 -11A23.5 13.6 0 0 1 -23.5 -11Z\"/><ellipse class=\"s\" cx=\"0\" cy=\"-11\" rx=\"23.5\" ry=\"13.6\"/><path class=\"wl\" d=\"M23.5 14.9A23.5 13.6 0 0 1 -23.5 14.9\"/><path class=\"wl\" d=\"M23.5 10.6A23.5 13.6 0 0 1 -23.5 10.6\"/><path class=\"wl\" d=\"M23.5 6.2A23.5 13.6 0 0 1 -23.5 6.2\"/><path class=\"wl\" d=\"M23.5 1.9A23.5 13.6 0 0 1 -23.5 1.9\"/><path class=\"wl\" d=\"M23.5 -2.4A23.5 13.6 0 0 1 -23.5 -2.4\"/><path class=\"wl\" d=\"M23.5 -6.7A23.5 13.6 0 0 1 -23.5 -6.7\"/><ellipse class=\"wl\" cx=\"0\" cy=\"-11\" rx=\"14.6\" ry=\"8.4\"/><path class=\"s\" d=\"M-11 44.4A23.5 13.6 0 0 0 36 44.4L36 40.1A23.5 13.6 0 0 1 -11 40.1Z\"/><path class=\"s\" d=\"M-11 40.1A23.5 13.6 0 0 0 36 40.1L36 35.8A23.5 13.6 0 0 1 -11 35.8Z\"/><path class=\"s\" d=\"M-11 35.8A23.5 13.6 0 0 0 36 35.8L36 31.4A23.5 13.6 0 0 1 -11 31.4Z\"/><path class=\"s\" d=\"M-11 31.4A23.5 13.6 0 0 0 36 31.4L36 27.1A23.5 13.6 0 0 1 -11 27.1Z\"/><ellipse class=\"s\" cx=\"12.5\" cy=\"27.1\" rx=\"23.5\" ry=\"13.6\"/><path class=\"wl\" d=\"M36 40.1A23.5 13.6 0 0 1 -11 40.1\"/><path class=\"wl\" d=\"M36 35.8A23.5 13.6 0 0 1 -11 35.8\"/><path class=\"wl\" d=\"M36 31.4A23.5 13.6 0 0 1 -11 31.4\"/><ellipse class=\"wl\" cx=\"12.5\" cy=\"27.1\" rx=\"14.6\" ry=\"8.4\"/></g>"}, "reloj": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.248) translate(-0 -4.8)\"><path class=\"s\" d=\"M-22.8 30A22.8 13.2 0 0 0 22.8 30L22.8 25.8A22.8 13.2 0 0 1 -22.8 25.8Z\"/><ellipse class=\"l\" cx=\"0\" cy=\"25.8\" rx=\"22.8\" ry=\"13.2\"/><path class=\"l\" d=\"M-18 25.8L-16.6 21.8L0.3 4.7L17.4 23.1L17.9 27.2L15.6 31L9 34.8L0 36.2L-9 34.8L-15.6 31L-17.9 27.2Z\"/><path class=\"s\" d=\"M-15.1 25.8L-13.9 22.5L-9.2 18.9L0.2 16L12 20.5L14.9 24.7L14.6 28.1L10.7 31.9L2 34.4L-7.5 33.3L-13 30.1L-14.9 26.9Z\"/><path class=\"l\" d=\"M-18 -16.2L-16.6 -20.2L-11 -24.4L-2.4 -26.5L6.9 -25.8L14.3 -22.5L17.4 -18.9L17.9 -14.8L15.6 -11L-0.3 4.9L-17.4 -13.5L-17.9 -14.8Z\"/><path class=\"s\" d=\"M-5.1 -1.2L2 -3.9L5 -0.4L-0.3 4.9L-5.1 -0.8Z\"/><path class=\"k\" d=\"M0 4.8L0 16.2\"/><path class=\"s\" d=\"M-22.8 -16.2A22.8 13.2 0 0 0 22.8 -16.2L22.8 -20.4A22.8 13.2 0 0 1 -22.8 -20.4Z\"/><ellipse class=\"l\" cx=\"0\" cy=\"-20.4\" rx=\"22.8\" ry=\"13.2\"/><path class=\"s\" d=\"M-22.4 25.8A2.2 1.3 0 0 0 -18 25.8L-18 -16.2A2.2 1.3 0 0 1 -22.4 -16.2Z\"/><path class=\"s\" d=\"M18 25.8A2.2 1.3 0 0 0 22.4 25.8L22.4 -16.2A2.2 1.3 0 0 1 18 -16.2Z\"/></g>"}, "laptop": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.010) translate(-8.6 -2.8)\"><path class=\"l\" d=\"M0 -3.6L48.8 24.6L48.8 -12.6L0 -40.8Z\"/><path class=\"s\" d=\"M51.4 23.1L48.8 24.6L48.8 -12.6L51.4 -14.1Z\"/><path class=\"l\" d=\"M2.6 -42.3L51.4 -14.1L48.8 -12.6L0 -40.8Z\"/><path class=\"s\" d=\"M3.6 -5.7L45.2 18.3L45.2 -11.1L3.6 -35.1Z\"/><path class=\"w\" d=\"M10.4 -5.4L15.1 -2.7L15.1 -11.1L10.4 -13.8Z\"/><path class=\"w\" d=\"M18.7 -0.6L23.4 2.1L23.4 -12.3L18.7 -15Z\"/><path class=\"w\" d=\"M27 4.2L31.7 6.9L31.7 -4.5L27 -7.2Z\"/><path class=\"w\" d=\"M35.3 9L40 11.7L40 -7.5L35.3 -10.2Z\"/><path class=\"l\" d=\"M-34.3 19.8L14.5 48L14.5 44.4L-34.3 16.2Z\"/><path class=\"s\" d=\"M48.8 28.2L14.5 48L14.5 44.4L48.8 24.6Z\"/><path class=\"l\" d=\"M0 -3.6L48.8 24.6L14.5 44.4L-34.3 16.2Z\"/><path class=\"s\" d=\"M0 2.4L38.5 24.6L23.9 33L-14.5 10.8Z\"/><path class=\"wl\" d=\"M9.6 7.9L-4.9 16.3\"/><path class=\"wl\" d=\"M19.2 13.5L4.7 21.9\"/><path class=\"wl\" d=\"M28.8 19L14.3 27.4\"/><path class=\"wl\" d=\"M-7.3 6.6L31.2 28.8\"/><path class=\"l\" d=\"M-4.7 20.7L6.8 27.3L-0.5 31.5L-12 24.9Z\"/></g>"}, "urna": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(0.934) translate(-7.5 -2.4)\"><ellipse class=\"s\" cx=\"22.9\" cy=\"28.8\" rx=\"33.8\" ry=\"9.3\"/><path class=\"l\" d=\"M-41.6 24L0 48L0 10.8L-41.6 -13.2Z\"/><path class=\"s\" d=\"M41.6 24L0 48L0 10.8L41.6 -13.2Z\"/><path class=\"l\" d=\"M0 -37.2L41.6 -13.2L0 10.8L-41.6 -13.2Z\"/><path class=\"s\" d=\"M-9.1 -21.2L13.8 -8L9.1 -5.3L-13.8 -18.5Z\"/><path class=\"l\" d=\"M-8.3 -18L8.3 -8.4L8.3 -33.6L-8.3 -43.2Z\"/><path class=\"k\" d=\"M-4.7 -30.3L-1 -23.4L5.2 -30.6\"/><path class=\"s\" d=\"M-33.3 14.4L-8.3 28.8L-8.3 21.6L-33.3 7.2Z\"/></g>"}, "planilla": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.144) translate(-4.2 -24.7)\"><path class=\"s\" d=\"M-38.5 30.6L8.3 57.6L8.3 54.9L-38.5 27.9Z\"/><path class=\"s\" d=\"M46.8 35.4L8.3 57.6L8.3 54.9L46.8 32.7Z\"/><path class=\"l\" d=\"M0 5.7L46.8 32.7L8.3 54.9L-38.5 27.9Z\"/><path class=\"s\" d=\"M-38.5 23.7L8.3 50.7L8.3 48L-38.5 21Z\"/><path class=\"s\" d=\"M46.8 28.5L8.3 50.7L8.3 48L46.8 25.8Z\"/><path class=\"l\" d=\"M0 -1.2L46.8 25.8L8.3 48L-38.5 21Z\"/><path class=\"l\" d=\"M-38.5 16.8L8.3 43.8L8.3 41.1L-38.5 14.1Z\"/><path class=\"s\" d=\"M46.8 21.6L8.3 43.8L8.3 41.1L46.8 18.9Z\"/><path class=\"l\" d=\"M0 -8.1L46.8 18.9L8.3 41.1L-38.5 14.1Z\"/><path class=\"s\" d=\"M0 -3.3L38.5 18.9L31.7 22.8L-6.8 0.6Z\"/><path class=\"k\" d=\"M-12.7 4L25.7 26.2\"/><path class=\"k\" d=\"M-18.7 7.5L19.7 29.7\"/><path class=\"k\" d=\"M-24.7 10.9L13.8 33.1\"/><path class=\"k\" d=\"M6.2 8.1L-17.1 21.6\"/><path class=\"k\" d=\"M19.2 15.6L-4.2 29.1\"/></g>"}, "portapapeles": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.059) translate(-31.2 17.4)\"><ellipse class=\"s\" cx=\"41.6\" cy=\"21.6\" rx=\"25\" ry=\"5.9\"/><path class=\"s\" d=\"M-4.2 2.4L38.5 27L38.5 -35.4L-4.2 -60Z\"/><path class=\"s\" d=\"M42.6 24.6L38.5 27L38.5 -35.4L42.6 -37.8Z\"/><path class=\"s\" d=\"M0 -62.4L42.6 -37.8L38.5 -35.4L-4.2 -60Z\"/><path class=\"l\" d=\"M-0.5 0.9L34.8 21.3L34.8 -30.9L-0.5 -51.3Z\"/><path class=\"s\" d=\"M3.6 -2.1L10.4 1.8L10.4 -12.6L3.6 -16.5Z\"/><path class=\"s\" d=\"M13.5 3.6L20.3 7.5L20.3 -18.9L13.5 -22.8Z\"/><path class=\"s\" d=\"M23.4 9.3L30.1 13.2L30.1 -6L23.4 -9.9Z\"/><path class=\"k\" d=\"M2.1 -3L32.2 14.4\"/><path class=\"k\" d=\"M3.6 -36.9L30.7 -21.3\"/><path class=\"k\" d=\"M3.6 -42.9L30.7 -27.3\"/><path class=\"s\" d=\"M9.4 -48L22.9 -40.2L22.9 -47.4L9.4 -55.2Z\"/><path class=\"s\" d=\"M28.6 -43.5L22.9 -40.2L22.9 -47.4L28.6 -50.7Z\"/><path class=\"s\" d=\"M15.1 -58.5L28.6 -50.7L22.9 -47.4L9.4 -55.2Z\"/></g>"}, "ciguena": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.048) translate(-24.9 -3.3)\"><ellipse class=\"s\" cx=\"24.9\" cy=\"27.6\" rx=\"44.1\" ry=\"7.6\"/><path class=\"l\" d=\"M-16.6 9.6L41.6 43.2L41.6 39.6L-16.6 6Z\"/><path class=\"s\" d=\"M58.2 33.6L41.6 43.2L41.6 39.6L58.2 30Z\"/><path class=\"l\" d=\"M0 -3.6L58.2 30L41.6 39.6L-16.6 6Z\"/><path class=\"l\" d=\"M-10.9 5.7L3.6 14.1L3.6 2.1L-10.9 -6.3Z\"/><path class=\"s\" d=\"M14 8.1L3.6 14.1L3.6 2.1L14 -3.9Z\"/><path class=\"l\" d=\"M-0.5 -12.3L14 -3.9L3.6 2.1L-10.9 -6.3Z\"/><path class=\"s\" d=\"M6.2 3.6L6 0.9L5.3 -1.9L4.1 -4.8L2.5 -7.5L0.6 -9.9L-1.4 -11.9L-3.6 -13.5L-5.8 -14.5L-7.9 -14.8L-9.8 -14.6L-11.4 -13.7L-12.5 -12.2L-13.3 -10.2L-13.5 -7.8L-13.3 -5.1L-12.5 -2.3L-11.4 0.6L-9.8 3.3L-7.9 5.7L-5.8 7.7L-3.6 9.3L-1.4 10.3L0.6 10.6L2.5 10.4L4.1 9.5L5.3 8L6 6Z\"/><path class=\"w\" d=\"M-0.8 -0.5L-0.9 -1.6L-1.3 -2.7L-2 -3.8L-2.8 -4.7L-3.6 -5.4L-4.5 -5.7L-5.3 -5.7L-5.9 -5.4L-6.4 -4.7L-6.5 -3.8L-6.4 -2.6L-5.9 -1.5L-5.3 -0.4L-4.5 0.5L-3.6 1.2L-2.8 1.5L-2 1.5L-1.3 1.2L-0.9 0.5Z\"/><path class=\"s\" d=\"M18.7 14.4L25.5 -17.7L21.8 -15.6L15.1 16.5Z\"/><path class=\"s\" d=\"M25.5 -17.7L22.3 -19.5L18.7 -17.4L21.8 -15.6Z\"/><path class=\"s\" d=\"M10.9 14.1L15.1 16.5L21.8 -15.6L18.7 -17.4Z\"/><path class=\"s\" d=\"M37.4 25.2L27.5 -16.5L23.9 -14.4L33.8 27.3Z\"/><path class=\"s\" d=\"M27.5 -16.5L24.4 -18.3L20.8 -16.2L23.9 -14.4Z\"/><path class=\"s\" d=\"M29.6 24.9L33.8 27.3L23.9 -14.4L20.8 -16.2Z\"/><path class=\"k\" d=\"M-4.2 -9.6L-6.2 -27\"/><path class=\"s\" d=\"M45.7 -16.2L-2.1 -36.6L-6.8 -33.9L41 -13.5Z\"/><path class=\"s\" d=\"M45.7 -10.8L45.7 -16.2L41 -13.5L41 -8.1Z\"/><path class=\"l\" d=\"M-6.8 -28.5L41 -8.1L41 -13.5L-6.8 -33.9Z\"/><path class=\"s\" d=\"M50.9 -1.8L54 -6L49.4 -3.3L46.2 0.9Z\"/><path class=\"s\" d=\"M54 -6L54 -13.2L49.4 -10.5L49.4 -3.3Z\"/><path class=\"s\" d=\"M54 -13.2L48.8 -21L44.2 -18.3L49.4 -10.5Z\"/><path class=\"s\" d=\"M39 -0.9L46.2 0.9L49.4 -3.3L49.4 -10.5L44.2 -18.3L40 -14.7Z\"/><path class=\"k\" d=\"M49.1 0.4L49.1 28\"/><path class=\"s\" d=\"M45.1 34.6A4 2.3 0 0 0 53.1 34.6L53.1 28A4 2.3 0 0 1 45.1 28Z\"/><ellipse class=\"l\" cx=\"49.1\" cy=\"28\" rx=\"4\" ry=\"2.3\"/></g>"}, "grua": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(0.877) translate(-7.9 6)\"><ellipse class=\"s\" cx=\"10.4\" cy=\"30\" rx=\"47\" ry=\"10.2\"/><path class=\"l\" d=\"M-41.6 24L-10.4 42L-10.4 21.6L-41.6 3.6Z\"/><path class=\"s\" d=\"M18.7 25.2L-10.4 42L-10.4 21.6L18.7 4.8Z\"/><path class=\"l\" d=\"M-12.5 -13.2L18.7 4.8L-10.4 21.6L-41.6 3.6Z\"/><path class=\"s\" d=\"M-39.5 3.6L-36.4 5.4L-36.4 -10.2L-39.5 -12Z\"/><path class=\"s\" d=\"M-33.3 3.6L-36.4 5.4L-36.4 -10.2L-33.3 -12Z\"/><path class=\"s\" d=\"M-36.4 -13.8L-33.3 -12L-36.4 -10.2L-39.5 -12Z\"/><path class=\"s\" d=\"M-26.5 11.1L-23.4 12.9L-23.4 -2.7L-26.5 -4.5Z\"/><path class=\"s\" d=\"M-20.3 11.1L-23.4 12.9L-23.4 -2.7L-20.3 -4.5Z\"/><path class=\"s\" d=\"M-23.4 -6.3L-20.3 -4.5L-23.4 -2.7L-26.5 -4.5Z\"/><path class=\"s\" d=\"M-13.5 18.6L-10.4 20.4L-10.4 4.8L-13.5 3Z\"/><path class=\"s\" d=\"M-7.3 18.6L-10.4 20.4L-10.4 4.8L-7.3 3Z\"/><path class=\"s\" d=\"M-10.4 1.2L-7.3 3L-10.4 4.8L-13.5 3Z\"/><path class=\"l\" d=\"M-41.6 -12L-10.4 6L-10.4 3L-41.6 -15Z\"/><path class=\"s\" d=\"M18.7 -10.8L-10.4 6L-10.4 3L18.7 -13.8Z\"/><path class=\"l\" d=\"M-12.5 -31.8L18.7 -13.8L-10.4 3L-41.6 -15Z\"/><path class=\"l\" d=\"M17.1 38.1L22.9 41.4L22.9 -25.8L17.1 -29.1Z\"/><path class=\"s\" d=\"M28.6 38.1L22.9 41.4L22.9 -25.8L28.6 -29.1Z\"/><path class=\"s\" d=\"M22.9 -32.4L28.6 -29.1L22.9 -25.8L17.1 -29.1Z\"/><path class=\"k\" d=\"M17.1 32.1L22.9 22.2\"/><path class=\"k\" d=\"M17.1 18.9L22.9 9\"/><path class=\"k\" d=\"M17.1 5.7L22.9 -4.2\"/><path class=\"k\" d=\"M17.1 -7.5L22.9 -17.4\"/><path class=\"l\" d=\"M-13 -47.7L44.2 -14.7L44.2 -18.9L-13 -51.9Z\"/><path class=\"s\" d=\"M47.8 -16.8L44.2 -14.7L44.2 -18.9L47.8 -21Z\"/><path class=\"l\" d=\"M-9.4 -54L47.8 -21L44.2 -18.9L-13 -51.9Z\"/><path class=\"s\" d=\"M-13 -39.3L-5.2 -34.8L-5.2 -42L-13 -46.5Z\"/><path class=\"s\" d=\"M0.5 -38.1L-5.2 -34.8L-5.2 -42L0.5 -45.3Z\"/><path class=\"s\" d=\"M-7.3 -49.8L0.5 -45.3L-5.2 -42L-13 -46.5Z\"/><path class=\"k\" d=\"M38.7 -20L38.7 6.4\"/><path class=\"s\" d=\"M32.2 13.8L38.5 17.4L38.5 10.2L32.2 6.6Z\"/><path class=\"s\" d=\"M44.7 13.8L38.5 17.4L38.5 10.2L44.7 6.6Z\"/><path class=\"s\" d=\"M38.5 3L44.7 6.6L38.5 10.2L32.2 6.6Z\"/></g>"}, "billetes": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.054) translate(-13.5 -6.7)\"><ellipse class=\"s\" cx=\"13.5\" cy=\"25.8\" rx=\"42.6\" ry=\"9.3\"/><path class=\"l\" d=\"M-26.5 15.3L17.1 40.5L17.1 33L-26.5 7.8Z\"/><path class=\"s\" d=\"M40 27.3L17.1 40.5L17.1 33L40 19.8Z\"/><path class=\"l\" d=\"M-3.6 -5.4L40 19.8L17.1 33L-26.5 7.8Z\"/><path class=\"k\" d=\"M-26.5 11.5L17.1 36.7\"/><path class=\"s\" d=\"M14.5 5.1L21.8 9.3L-1 22.5L-8.3 18.3Z\"/><path class=\"s\" d=\"M-8.3 25.8L-1 30L-1 22.5L-8.3 18.3Z\"/><path class=\"l\" d=\"M-18.7 8.1L24.9 33.3L24.9 25.8L-18.7 0.6Z\"/><path class=\"s\" d=\"M47.8 20.1L24.9 33.3L24.9 25.8L47.8 12.6Z\"/><path class=\"l\" d=\"M4.2 -12.6L47.8 12.6L24.9 25.8L-18.7 0.6Z\"/><path class=\"k\" d=\"M-18.7 4.3L24.9 29.5\"/><path class=\"s\" d=\"M22.3 -2.1L29.6 2.1L6.8 15.3L-0.5 11.1Z\"/><path class=\"s\" d=\"M-0.5 18.6L6.8 22.8L6.8 15.3L-0.5 11.1Z\"/><path class=\"l\" d=\"M-26.5 1.5L17.1 26.7L17.1 19.2L-26.5 -6Z\"/><path class=\"s\" d=\"M40 13.5L17.1 26.7L17.1 19.2L40 6Z\"/><path class=\"l\" d=\"M-3.6 -19.2L40 6L17.1 19.2L-26.5 -6Z\"/><path class=\"k\" d=\"M-26.5 -2.2L17.1 22.9\"/><path class=\"s\" d=\"M14.5 -8.7L21.8 -4.5L-1 8.7L-8.3 4.5Z\"/><path class=\"s\" d=\"M-8.3 12L-1 16.2L-1 8.7L-8.3 4.5Z\"/><path class=\"l\" d=\"M-20.8 -6.3L22.9 18.9L22.9 11.4L-20.8 -13.8Z\"/><path class=\"s\" d=\"M45.7 5.7L22.9 18.9L22.9 11.4L45.7 -1.8Z\"/><path class=\"l\" d=\"M2.1 -27L45.7 -1.8L22.9 11.4L-20.8 -13.8Z\"/><path class=\"k\" d=\"M-20.8 -10.1L22.9 15.1\"/><path class=\"s\" d=\"M20.3 -16.5L27.5 -12.3L4.7 0.9L-2.6 -3.3Z\"/><path class=\"s\" d=\"M-2.6 4.2L4.7 8.4L4.7 0.9L-2.6 -3.3Z\"/><ellipse class=\"s\" cx=\"25.5\" cy=\"-0.3\" rx=\"7\" ry=\"4\"/><ellipse class=\"s\" cx=\"-0.5\" cy=\"-15.3\" rx=\"3.7\" ry=\"2.1\"/></g>"}, "escudo": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.086) translate(-18.7 14)\"><ellipse class=\"s\" cx=\"18.7\" cy=\"19.2\" rx=\"32.3\" ry=\"6.8\"/><path class=\"l\" d=\"M39.5 1.8L34.3 8.4L26 13.2L31.2 6.6Z\"/><path class=\"l\" d=\"M0 -54L10.4 -50.7L2.1 -45.9L-8.3 -49.2Z\"/><path class=\"l\" d=\"M41.6 -8.4L39.5 1.8L31.2 6.6L33.3 -3.6Z\"/><path class=\"l\" d=\"M10.4 -50.7L20.8 -45.9L12.5 -41.1L2.1 -45.9Z\"/><path class=\"l\" d=\"M20.8 -45.9L31.2 -38.7L22.9 -33.9L12.5 -41.1Z\"/><path class=\"l\" d=\"M41.6 -30L41.6 -8.4L33.3 -3.6L33.3 -25.2Z\"/><path class=\"l\" d=\"M31.2 -38.7L41.6 -30L33.3 -25.2L22.9 -33.9Z\"/><path class=\"s\" d=\"M-8.3 -49.2L2.1 -45.9L12.5 -41.1L22.9 -33.9L33.3 -25.2L33.3 -3.6L31.2 6.6L26 13.2L19.2 16.5L12.5 16.8L5.7 8.7L-1 -2.4L-6.2 -15L-8.3 -27.6Z\"/><path class=\"w\" d=\"M12.5 -29.1L15.4 -17.9L24.1 -12.7L17.2 -10.5L19.6 0.6L12.5 -9.3L5.3 -7.7L7.8 -15.9L0.9 -26.1L9.6 -21.3Z\"/></g>"}, "carrito": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.184) translate(-14.5 0.4)\"><ellipse class=\"s\" cx=\"14.5\" cy=\"22.8\" rx=\"39.7\" ry=\"7.6\"/><path class=\"s\" d=\"M0 -31.2L41.6 -7.2L27 1.2L-14.5 -22.8Z\"/><path class=\"s\" d=\"M41.6 -7.2L36.4 10.8L21.8 19.2L27 1.2Z\"/><path class=\"l\" d=\"M-14.5 -22.8L27 1.2L21.8 19.2L-9.4 1.2Z\"/><path class=\"k\" d=\"M-0.7 -14.8L1.1 7.2\"/><path class=\"k\" d=\"M13.1 -6.8L11.4 13.2\"/><path class=\"k\" d=\"M-12 -10.8L24.4 10.2\"/><path class=\"k\" d=\"M40 -6.3L48.8 -10.8L37.4 -4.2L28.6 0.3\"/><path class=\"k\" d=\"M-8.8 5.7L23.9 24.6\"/><path class=\"l\" d=\"M-1.7 12.5L-1.8 11.6L-2 10.7L-2.4 9.8L-2.9 8.9L-3.5 8.1L-4.2 7.4L-4.9 6.9L-5.7 6.6L-6.3 6.5L-6.9 6.6L-7.5 6.9L-7.8 7.4L-8.1 8L-8.2 8.8L-8.1 9.7L-7.8 10.6L-7.5 11.5L-6.9 12.4L-6.3 13.2L-5.7 13.9L-4.9 14.4L-4.2 14.7L-3.5 14.8L-2.9 14.7L-2.4 14.4L-2 13.9L-1.8 13.3Z\"/><path class=\"l\" d=\"M22.7 26.6L22.6 25.7L22.4 24.8L22 23.9L21.5 23L20.9 22.2L20.2 21.5L19.5 21L18.8 20.7L18.1 20.6L17.5 20.7L17 21L16.6 21.5L16.3 22.1L16.3 22.9L16.3 23.8L16.6 24.7L17 25.6L17.5 26.5L18.1 27.3L18.8 28L19.5 28.5L20.2 28.8L20.9 28.9L21.5 28.8L22 28.5L22.4 28L22.6 27.4Z\"/></g>"}, "globo": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.189) translate(-4.7 -1.8)\"><ellipse class=\"s\" cx=\"9.4\" cy=\"33\" rx=\"27.9\" ry=\"6.4\"/><path class=\"s\" d=\"M-16.2 30A16.2 9.3 0 0 0 16.2 30L16.2 27A16.2 9.3 0 0 1 -16.2 27Z\"/><ellipse class=\"l\" cx=\"0\" cy=\"27\" rx=\"16.2\" ry=\"9.3\"/><path class=\"s\" d=\"M-2.2 27A2.2 1.3 0 0 0 2.2 27L2.2 15A2.2 1.3 0 0 1 -2.2 15Z\"/><ellipse class=\"s\" cx=\"0\" cy=\"15\" rx=\"2.2\" ry=\"1.3\"/><circle class=\"l\" cx=\"0\" cy=\"-7.8\" r=\"27.9\"/><path class=\"s\" d=\"M0 -35.7A27.9 27.9 0 0 1 0 20.1Z\"/><path class=\"k\" d=\"M0 17.9A23.7 13.7 0 0 1 -23.7 4.2\"/><path class=\"wl\" d=\"M23.7 4.2A23.7 13.7 0 0 1 0 17.9\"/><path class=\"k\" d=\"M0 8.3A27.9 16.1 0 0 1 -27.9 -7.8\"/><path class=\"wl\" d=\"M27.9 -7.8A27.9 16.1 0 0 1 0 8.3\"/><path class=\"k\" d=\"M0 -6.1A23.7 13.7 0 0 1 -23.7 -19.8\"/><path class=\"wl\" d=\"M23.7 -19.8A23.7 13.7 0 0 1 0 -6.1\"/></g>"}, "mastil": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.330) translate(-4.6 -1)\"><ellipse class=\"s\" cx=\"4.2\" cy=\"34.8\" rx=\"30.9\" ry=\"6.8\"/><path class=\"l\" d=\"M-14.5 30L0 38.4L0 33.6L-14.5 25.2Z\"/><path class=\"s\" d=\"M14.5 30L0 38.4L0 33.6L14.5 25.2Z\"/><path class=\"l\" d=\"M0 16.8L14.5 25.2L0 33.6L-14.5 25.2Z\"/><path class=\"s\" d=\"M-2.1 25.2A2.1 1.2 0 0 0 2.1 25.2L2.1 -38.4A2.1 1.2 0 0 1 -2.1 -38.4Z\"/><ellipse class=\"s\" cx=\"0\" cy=\"-38.4\" rx=\"2.1\" ry=\"1.2\"/><path class=\"s\" d=\"M1.6 -36.3L13 -32.1L24.4 -22.5L35.9 -18.3L35.9 6.9L24.4 2.7L13 -6.9L1.6 -11.1Z\"/><path class=\"w\" d=\"M1.6 -27.9L13 -23.7L24.4 -14.1L35.9 -9.9L35.9 -1.5L24.4 -5.7L13 -15.3L1.6 -19.5Z\"/><circle class=\"s\" cx=\"18.7\" cy=\"-14.7\" r=\"2.5\"/></g>"}, "matraz": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.295) translate(-6.5 -9.7)\"><ellipse class=\"s\" cx=\"10.4\" cy=\"32.4\" rx=\"28.7\" ry=\"6.8\"/><path class=\"l\" d=\"M-26.1 27.9L-25.2 24L-4.4 -3.3L5.1 -2.9L6.7 -1.6L25.2 24L26.1 27.9L24.8 33.8L22.3 37.4L15.7 41.8L6.7 44.3L-3.4 44.7L-12.9 42.9L-20.4 39L-23.8 35.7L-25.5 31.9L-25.9 29.9Z\"/><path class=\"s\" d=\"M-26.1 27.9L-25.2 24L-14 9.4L-6.7 6.2L4.6 5.8L12.5 8.4L16.3 11.7L25.2 24L26.1 27.9L24.8 33.8L22.3 37.4L15.7 41.8L6.7 44.3L-3.4 44.7L-12.9 42.9L-20.4 39L-23.8 35.7L-25.5 31.9L-25.9 29.9Z\"/><path class=\"wl\" d=\"M17 18.2A17.6 10.2 0 0 1 -17 18.2\"/><circle class=\"w\" cx=\"-10.4\" cy=\"24\" r=\"2\"/><circle class=\"w\" cx=\"5.2\" cy=\"27.6\" r=\"1.4\"/><path class=\"k\" d=\"M1.2 18.9A14.1 8.1 0 0 1 -9.9 16.5\"/><path class=\"k\" d=\"M0.9 12.1A10.7 6.2 0 0 1 -7.5 10.4\"/><path class=\"l\" d=\"M-7.2 0.6A7.2 4.2 0 0 0 7.2 0.6L7.2 -16.8A7.2 4.2 0 0 1 -7.2 -16.8Z\"/><path class=\"l\" d=\"M-9.6 -16.8A9.6 5.5 0 0 0 9.6 -16.8L9.6 -19.8A9.6 5.5 0 0 1 -9.6 -19.8Z\"/><ellipse class=\"l\" cx=\"0\" cy=\"-19.8\" rx=\"9.6\" ry=\"5.5\"/><ellipse class=\"s\" cx=\"0\" cy=\"-19.8\" rx=\"6\" ry=\"3.5\"/></g>"}, "balanza": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.350) translate(-1.4 -4)\"><ellipse class=\"s\" cx=\"7.3\" cy=\"34.2\" rx=\"26.5\" ry=\"6.4\"/><path class=\"s\" d=\"M-15.4 30A15.4 8.9 0 0 0 15.4 30L15.4 26.7A15.4 8.9 0 0 1 -15.4 26.7Z\"/><ellipse class=\"l\" cx=\"0\" cy=\"26.7\" rx=\"15.4\" ry=\"8.9\"/><path class=\"s\" d=\"M-8.8 26.7A8.8 5.1 0 0 0 8.8 26.7L8.8 24A8.8 5.1 0 0 1 -8.8 24Z\"/><ellipse class=\"l\" cx=\"0\" cy=\"24\" rx=\"8.8\" ry=\"5.1\"/><path class=\"k\" d=\"M-19.2 -29.1L-25.7 -11.3\"/><path class=\"k\" d=\"M-19.2 -29.1L-12.7 -3.8\"/><path class=\"s\" d=\"M-31 -7.5L-29.4 -10.9L-22.3 -14.1L-12.1 -12.9L-7.9 -9.3L-7.9 -5.7L-9.9 -3.4L-21.8 2.1L-30.6 -5.7L-30.9 -6.6Z\"/><ellipse class=\"l\" cx=\"-19.2\" cy=\"-7.5\" rx=\"11.8\" ry=\"6.8\"/><path class=\"s\" d=\"M-2.6 24A2.6 1.5 0 0 0 2.6 24L2.6 -17.4A2.6 1.5 0 0 1 -2.6 -17.4Z\"/><ellipse class=\"s\" cx=\"0\" cy=\"-17.4\" rx=\"2.6\" ry=\"1.5\"/><path class=\"l\" d=\"M-22.8 -28L19.8 -3.4L19.8 -6.4L-22.8 -31Z\"/><path class=\"s\" d=\"M22.8 -5L19.8 -3.4L19.8 -6.4L22.8 -8Z\"/><path class=\"s\" d=\"M-19.8 -32.6L22.8 -8L19.8 -6.4L-22.8 -31Z\"/><path class=\"l\" d=\"M-4.6 -19.5A4.6 4.6 0 0 1 4.6 -19.5A4.6 2.6 0 0 1 -4.6 -19.5Z\"/><path class=\"s\" d=\"M0 -24.1A4.6 4.6 0 0 1 4.6 -19.5A4.6 2.6 0 0 1 0 -16.9Z\"/><path class=\"k\" d=\"M19.2 -6.9L12.7 10.9\"/><path class=\"k\" d=\"M19.2 -6.9L25.7 18.4\"/><path class=\"s\" d=\"M7.5 14.7L9 11.3L16.2 8.1L26.4 9.3L30.6 12.9L30.6 16.5L28.6 18.8L16.6 24.3L7.9 16.5L7.6 15.6Z\"/><ellipse class=\"l\" cx=\"19.2\" cy=\"14.7\" rx=\"11.8\" ry=\"6.8\"/></g>"}, "dialogo": {"t": "azul", "d": "<g transform=\"translate(60 60) scale(1.145) translate(-19.7 16.9)\"><ellipse class=\"s\" cx=\"17.7\" cy=\"16.2\" rx=\"22\" ry=\"4.2\"/><path class=\"l\" d=\"M43.6 -31.8L4.7 -54.3L-4.2 -49.2L34.8 -26.7Z\"/><path class=\"l\" d=\"M48.3 4.5L48.3 -23.7L39.5 -18.6L39.5 9.6Z\"/><path class=\"l\" d=\"M48.3 -23.7L43.6 -31.8L34.8 -26.7L39.5 -18.6Z\"/><path class=\"s\" d=\"M-4.2 -10.2L-0.5 -8.1L-3.6 4.5L12 -0.9L34.8 12.3L39.5 9.6L39.5 -18.6L34.8 -26.7L-4.2 -49.2L-8.8 -46.5L-8.8 -18.3Z\"/><path class=\"w\" d=\"M9.1 -22.1L9 -23.1L8.7 -24.2L8.2 -25.3L7.6 -26.4L6.9 -27.4L6.1 -28.2L5.2 -28.8L4.3 -29.2L3.5 -29.3L2.8 -29.2L2.1 -28.9L1.7 -28.3L1.4 -27.5L1.3 -26.5L1.4 -25.5L1.7 -24.4L2.1 -23.3L2.8 -22.2L3.5 -21.2L4.3 -20.4L5.2 -19.8L6.1 -19.4L6.9 -19.3L7.6 -19.4L8.2 -19.7L8.7 -20.3L9 -21.1Z\"/><path class=\"w\" d=\"M19.2 -16.2L19.1 -17.3L18.8 -18.4L18.4 -19.5L17.8 -20.6L17 -21.5L16.2 -22.3L15.3 -23L14.5 -23.3L13.6 -23.5L12.9 -23.4L12.3 -23L11.8 -22.4L11.5 -21.6L11.4 -20.7L11.5 -19.6L11.8 -18.5L12.3 -17.4L12.9 -16.3L13.6 -15.4L14.5 -14.6L15.3 -14L16.2 -13.6L17 -13.4L17.8 -13.5L18.4 -13.9L18.8 -14.5L19.1 -15.3Z\"/><path class=\"w\" d=\"M29.4 -10.4L29.3 -11.4L29 -12.5L28.5 -13.6L27.9 -14.7L27.2 -15.7L26.3 -16.5L25.5 -17.1L24.6 -17.5L23.8 -17.6L23 -17.5L22.4 -17.2L21.9 -16.6L21.7 -15.8L21.6 -14.9L21.7 -13.8L21.9 -12.7L22.4 -11.6L23 -10.5L23.8 -9.5L24.6 -8.7L25.5 -8.1L26.3 -7.7L27.2 -7.6L27.9 -7.7L28.5 -8L29 -8.6L29.3 -9.4Z\"/></g>"}};
const icono = (n, cls = "") => ICONOS[n] ? `<svg class="iso tono-${ICONOS[n].t} ${cls}" viewBox="0 0 120 120" aria-hidden="true" focusable="false">${ICONOS[n].d}</svg>` : "";
document.querySelectorAll("[data-icono]").forEach(el => { el.innerHTML = icono(el.dataset.icono); });
document.querySelectorAll("a[data-correo]").forEach(a => { const c = [...a.dataset.correo].reverse().join(""); a.href = "mailto:" + c; a.textContent = c; });
const formCorreo = document.getElementById("form-correo");
if (formCorreo) {
const dir = [...formCorreo.dataset.correo].reverse().join(""), respaldo = formCorreo.querySelector(".form-respaldo");
const armar = () => {
const d = new FormData(formCorreo), nom = `${d.get("nombre")} ${d.get("apellido")}`.trim().replace(/\s+/g, " ");
return {asunto: `Contacto desde Datina: ${nom}`, cuerpo: `${String(d.get("mensaje")).trim()}\n\n${nom}\n${String(d.get("correo")).trim()}`};
};
formCorreo.hidden = false;
formCorreo.addEventListener("submit", ev => {
ev.preventDefault();
const {asunto, cuerpo} = armar();
location.href = `mailto:${dir}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
respaldo.hidden = false;
});
formCorreo.querySelector("[data-copiar]").addEventListener("click", async ev => {
const {asunto, cuerpo} = armar(), b = ev.currentTarget;
try { await navigator.clipboard.writeText(`Para: ${dir}\nAsunto: ${asunto}\n\n${cuerpo}`); b.textContent = "Mensaje copiado"; }
catch { b.textContent = "No se pudo copiar"; }
});
}
(function sol() {
const NS = "http://www.w3.org/2000/svg", cont = document.getElementById("sol-rayos");
if (!cont) return;
const pt = ([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`;
const recto = "M-4.4,-27 L0,-95 L4.4,-27 Z";
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
const nv = R.nuevos;
const au = R.autos, cu = R.curiosidades, pe = R.pesca, vpq = R.visitas_parque;
const SJ = R.soja;
const DG = R.dengue, VC = R.vacunas;
const fDg = v => v >= 10 ? n0(v) : n1(v);
const yE = s => (/^h?[ií](?![aeiouáéíóú])/i.test(String(s).replace(/<[^>]*>/g, "").replace(/^[^\p{L}\d]+/u, "")) ? "e " : "y ") + s;
const lista = xs => xs.length > 1 ? xs.slice(0, -1).join(", ") + " " + yE(xs[xs.length - 1]) : xs.join("");
const grados = v => (v > 0 ? "+" : "") + n2(v) + " °C";
const e = R.energia, nac = R.nacimientos, s = R.suicidio, em = R.empleo, mo = R.mortalidad, su = R.sube,
pz = R.pisa, es = R.escolarizacion, ap = R.aprender, nt = R.naturaleza, tu = R.turismo, ANT = R.antartida;
const movio = v => `${v < 0 ? "bajaron" : "subieron"} ${n1(Math.abs(v))}%`;
const cambio = v => v === 0 ? "no cambió" : `${v < 0 ? "bajó" : "subió"} ${Math.abs(v)} ${Math.abs(v) === 1 ? "punto" : "puntos"}`;
const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const signo = v => v < 0 ? `cayó ${n1(Math.abs(v))}%` : `creció ${n1(v)}%`;
const enLoQueVa = (o, ultimo, que, sube, baja) => o && o.anio > ultimo
? ` Entre enero y ${MESES[o.mes - 1]} de ${o.anio}, ${que} ${o.var >= 0 ? sube : baja} ${pct(Math.abs(o.var))} respecto de los mismos meses de ${o.anio - 1}.` : "";
const EV = R.envejecimiento, PPY = R.poblacion_proy, CM = R.causas_muerte, SX = R.externo, TRN = R.transito, PNZ = R.pobreza_ninez, MJC = R.mujeres_congreso, ENR = R.tarifa_luz;
const ESC = R.chicos_escuela;
const fLarga = f => `${+f.slice(0, 2)} de ${MESES[+f.slice(3, 5) - 1]} de ${f.slice(6)}`;
function citaFicha(f, url) {
const hoy = new Date(), t = (f.querySelector("h2, h3")?.textContent || "").trim();
const txt = f.querySelector(".pie > span")?.firstChild?.textContent || "";
const fuente = txt.replace(/^\s*Fuentes?:\s*/, "").replace(/\s*Se actualiza[^.]*\.?\s*$/, "").trim().replace(/\.$/, "");
return `Datina (${hoy.getFullYear()}). ${t}${/[?!.]$/.test(t) ? "" : "."} ${fuente ? `Con datos de ${fuente}. ` : ""}${url}. ` +
`Consultado el ${hoy.getDate()} de ${MESES[hoy.getMonth()]} de ${hoy.getFullYear()}.`;
}
const trimTx = t => `${["primer", "segundo", "tercer", "cuarto"][+t[0] - 1]} trimestre de ${t.slice(2)}`;
const saldoTx = v => v >= 0 ? `${n0(v)} millones a favor` : `${n0(-v)} millones en contra`;
const subioBajo = (v, m, f) => `${v >= 0 ? m : f} ${pct(Math.abs(v))}`;
const CM_FRASE = {circulatorias: "las enfermedades del corazón y la circulación", tumores: "los tumores", respiratorias: "las enfermedades respiratorias",
infecciosas: "las enfermedades infecciosas y parasitarias", covid: "el COVID-19", endocrinas: "la diabetes y otras enfermedades endocrinas y metabólicas",
digestivas: "las enfermedades digestivas", externas: "las causas externas"};
const CMG = CM.grupos.filter(g => CM_FRASE[g.k]).sort((a, b) => b.pct - a.pct);
const ADO_INI = "pct_" + nac.anio_ini, ADO_ULT = "pct_" + nac.anio_ult;
const PI = R.piramide, JU = R.jubilaciones, HB = R.haberes, PIN = R.pensiones_invalidez, AU = R.auh, DS = R.desempleo;
const EM = R.empresas;
const PG = R.petroleo, CN = R.construccion, VV = CN.viv;
const CB = R.combustibles;
const SA = R.salarios, DC = R.docentes, IE = R.inversion_edu, SG = R.seguridad;
const ESM = R.economia.salario_minimo;
const EIP = R.economia.ipc, ECB = R.economia.canasta, ESR = R.economia.salarios, EMA = R.economia.actividad, ESU = R.economia.super;
const SQ = R.externo.socios_rubro, VK = R.externo.valor_kilo;
const SQ_RUB = [{k: "pp", lab: "Productos primarios", corto: "primarios"}, {k: "moa", lab: "Manufacturas agropecuarias", corto: "agropecuarias"},
{k: "moi", lab: "Manufacturas industriales", corto: "industriales"}, {k: "ce", lab: "Combustibles y energía", corto: "combustibles"}];
const SQ_USO = [{k: "bi", lab: "Bienes intermedios", corto: "intermedios"}, {k: "pa", lab: "Piezas y accesorios", corto: "piezas"}, {k: "bk", lab: "Bienes de capital", corto: "capital"},
{k: "bc", lab: "Bienes de consumo", corto: "consumo"}, {k: "cl", lab: "Combustibles y lubricantes", corto: "combustibles"}, {k: "va", lab: "Autos de pasajeros", corto: "autos"}];
const PCO = R.precio_consumo, PCO_N = {carne: ["de la carne vacuna", "el consumo por habitante"], yerba: ["de la yerba mate", "lo que despachan los molinos"], vino: ["del vino común", "lo que se vende en el país"]};
const EMY = R.economia.mayoristas;
const ESE = R.economia.sectores_empleo;
const ECR = R.economia.crianza, ECR6 = ECR.edades.at(-1);
const IND = R.economia.industria;
const conSigno = v => (v > 0 ? "+" : "") + pct(v);
const REG_IPC = {"02": ["gba"], "06": ["gba", "pampeana"], "10": ["noroeste"], "14": ["pampeana"], "18": ["noreste"], "22": ["noreste"], "26": ["patagonia"],
"30": ["pampeana"], "34": ["noreste"], "38": ["noroeste"], "42": ["pampeana"], "46": ["noroeste"], "50": ["cuyo"], "54": ["noreste"], "58": ["patagonia"],
"62": ["patagonia"], "66": ["noroeste"], "70": ["cuyo"], "74": ["cuyo"], "78": ["patagonia"], "82": ["pampeana"], "86": ["noroeste"], "90": ["noroeste"],
"94": ["patagonia"]};
const deReg = n => ("de " + REG_ART[n]).replace(/^de el /, "del ");
const REG_ART = {"Gran Buenos Aires": "el Gran Buenos Aires", "Pampeana": "la región Pampeana", "Noreste": "el Noreste", "Noroeste": "el Noroeste", "Cuyo": "Cuyo",
"Patagonia": "la Patagonia"};
const delReg = n => REG_ART[n].startsWith("el ") ? "del " + REG_ART[n].slice(3) : "de " + REG_ART[n];
const inicialMin = t => t.charAt(0).toLowerCase() + t.slice(1);
const cambioPl = v => Math.round(Math.abs(v) * 10) === 0 ? "no cambiaron" : `${v < 0 ? "bajaron" : "subieron"} ${pct(Math.abs(v))}`;
const MG = R.migraciones, MGC = MG.censo, MGD = MG.dnm, MGO = MG.onu, MGH = MG.historia, MGP = MG.departamentos, MGR = MG.refugio;
const depsTop = top => top.every(d => d[1] === top[0][1])
? `${lista(top.map(d => `${d[0]} (${pct(d[2])})`))}, ${top.length === 3 ? "las tres" : "todos"} de ${top[0][1]}`
: lista(top.map(d => `${d[0]} (${d[1]}, ${pct(d[2])})`));
const DSO = R.desocupacion, PZA = R.pobreza_aglomerados, INF = R.informalidad;
const GOB = R.gobierno, GBN = GOB.nacion, GRT = GOB.recaudacion, GBD = GOB.deuda, GBC = GOB.empleo, GBP = GOB.provincial, CPA = R.coparticipacion;
const DPR = R.deuda_provincias;
const milDeuda = v => v >= 1e6 ? `${n2(v / 1e6)} millones` : v >= 1000 ? `${n0(v / 1000)} mil` : n0(v);
const ABN = R.abandono;
const TF = R.telefonia, TVP = R.tv_paga;
const MBS = R.cobertura_suelo;
const MDC = R.medicos;
const HSP = R.establecimientos;
const DHO = R.distancia_hospital;
const PAP = R.privadas_aprender;
const ESP = R.escuelas_primarias, ESS = R.escuelas_secundarias;
const SOC = R.sociedades;
const pesosDeuda = v => `${milDeuda(v)} pesos`;
const sobra = v => v < 0 ? "déficit" : "superávit";
const billones = millones => `${n1(millones / 1e6)} billones de pesos`;
const yCambio = (a, b) => Math.round(Math.abs(a) * 10) && Math.round(Math.abs(b) * 10) && (a < 0) === (b < 0) ? pct(Math.abs(b)) : cambioPct(b);
const unoCada = tasa => n0(Math.round(1e5 / tasa / 100) * 100);
const cambioPct = v => Math.round(Math.abs(v) * 10) === 0 ? "no cambió" : `${v < 0 ? "bajó" : "subió"} ${pct(Math.abs(v))}`;
const millonesM = v => n2(v / 1e6) + " M", ejeM = v => v === 0 ? "0" : n1(v / 1e6) + " M";
const deLas24 = n => n === 24 ? "en las 24 jurisdicciones" : n === 0 ? "en ninguna de las 24 jurisdicciones" : `en ${n} de las 24 jurisdicciones`;
const TILDE_AREA = {rio: "río", leon: "león", maria: "maría", cajon: "cajón", porton: "portón", cañadon: "cañadón", fortin: "fortín",
estacion: "estación", explotacion: "explotación", fraccion: "fracción", cordon: "cordón", volcan: "volcán", oceano: "océano",
octogono: "octógono", guardian: "guardián", hernandez: "hernández", fernandez: "fernández", coiron: "coirón", payun: "payún",
trebol: "trébol", ines: "inés", aguila: "águila", tunuyan: "tunuyán", neuquen: "neuquén", ceron: "cerón", zuñiga: "zúñiga",
martin: "martín", angela: "ángela", saenz: "sáenz", eolico: "eólico", ampliacion: "ampliación", biogas: "biogás"};
const SIGLA_AREA = new Set(["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "cnq", "cn", "cgsj", "ca", "lp", "rn", "ni", "ct", "ctbg",
"ctbrs", "pe", "pah", "mater"]);
const tituloArea = s => String(s || "").trim().toLowerCase()
.replace(/_(\p{L}+)$/u, (m, p) => ` (${(TILDE_AREA[p] || p).replace(/^./, c => c.toUpperCase())})`)
.replace(/[\p{L}\d/.]+/gu, w => SIGLA_AREA.has(w) || /\d/.test(w) && w.length < 6 ? w.toUpperCase() : TILDE_AREA[w] || w)
.replace(/(^|[\s\-(.])([a-záéíóúñü])/g, (m, a, b) => a + b.toUpperCase())
.replace(/ (De|Del|Y)(?= )/g, (m, w) => " " + w.toLowerCase()).replace(/ de (La|Las|Los) /g, (m, w) => ` de ${w.toLowerCase()} `).replace(/ Sa$/, " SA");
const COL_POZOS = ["#B9D3EC", "#7FB0DD", "#3F86C6", "#1F5E97", "#0B2F52"];
const masPct = v => (v > 0 ? "+" : "") + pct(v);
const creceCae = (v, sube = "creció", baja = "cayó") => `${v < 0 ? baja : sube} ${pct(Math.abs(v))}`;
const TRIM_N = ["primer", "segundo", "tercer", "cuarto"];
const NOMBRE_INS = n => n.startsWith("Resto") ? "el grupo de grifería, tubos de acero sin costura y vidrio plano" : n.charAt(0).toLowerCase() + n.slice(1);
const CUENCA_N = {neuquina: "la Neuquina", gsj: "la del Golfo San Jorge", austral: "la Austral", noroeste: "la del Noroeste", cuyana: "la Cuyana"};
const cuencasTxt = c => lista(Object.entries(c).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${CUENCA_N[k]} (${pct(v)})`));
const topViv = k => [...T.vivienda_provincias].sort((a, b) => b[k] - a[k]);
const VIV_IND = {
pct_alquila: {nombre: "Hogares que alquilan", f: pct,
t: () => `En el Censo 2022, el ${pct(VV.pct_propia)} de los hogares era propietario de su vivienda. ` +
`El alquiler era más común en ${CN.viv_top.pct_alquila[0]} (${pct(CN.viv_top.pct_alquila[1])}) y menos en ${CN.viv_low.pct_alquila[0]} (${pct(CN.viv_low.pct_alquila[1])}).`},
pct_hacinamiento: {nombre: "Hogares con hacinamiento crítico", f: pct,
t: () => `En el Censo 2022, el ${pct(VV.pct_hacinamiento)} de los hogares vivía con más de tres personas por cuarto, lo que el INDEC llama hacinamiento crítico. ` +
`Iba del ${pct(CN.viv_top.pct_hacinamiento[1])} en ${CN.viv_top.pct_hacinamiento[0]} al ${pct(CN.viv_low.pct_hacinamiento[1])} en ${CN.viv_low.pct_hacinamiento[0]}.`},
pct_materiales_4: {nombre: "Hogares en viviendas de calidad IV", f: pct,
t: () => `En el Censo 2022, el ${pct(VV.pct_materiales_4)} de los hogares vivía en una vivienda con pisos y techos de la calidad más baja de las cuatro que distingue el INDEC. ` +
`Iba del ${pct(CN.viv_top.pct_materiales_4[1])} en ${CN.viv_top.pct_materiales_4[0]} al ${pct(CN.viv_low.pct_materiales_4[1])} en ${CN.viv_low.pct_materiales_4[0]}.`},
construccion_cada_1000: {nombre: "Viviendas en construcción cada 1.000", f: n1,
t: () => `El día del Censo 2022 había ${n0(CN.viv_abs.en_construccion)} viviendas en construcción, ${n1(VV.construccion_cada_1000)} cada 1.000 viviendas particulares. ` +
`La proporción más alta era la de ${CN.viv_top.construccion_cada_1000[0]} (${n1(CN.viv_top.construccion_cada_1000[1])}) y la más baja, la de ${CN.viv_low.construccion_cada_1000[0]} (${n1(CN.viv_low.construccion_cada_1000[1])}).`},
pct_alquiler_venta: {nombre: "Viviendas en alquiler o venta, sin habitar", f: pct,
t: () => `El día del Censo 2022, el ${pct(VV.pct_alquiler_venta)} de las viviendas particulares no tenía residentes porque se ofrecía en alquiler o en venta. ` +
`La proporción más alta era la de ${CN.viv_top.pct_alquiler_venta[0]} (${pct(CN.viv_top.pct_alquiler_venta[1])}) y la más baja, la de ${CN.viv_low.pct_alquiler_venta[0]} (${pct(CN.viv_low.pct_alquiler_venta[1])}).`},
pct_uso_temporal: {nombre: "Viviendas de uso temporal", f: pct,
t: () => `El día del Censo 2022, el ${pct(VV.pct_uso_temporal)} de las viviendas particulares se usaba para vacaciones, fines de semana o como segunda residencia, sin residentes habituales. ` +
`La proporción más alta era la de ${CN.viv_top.pct_uso_temporal[0]} (${pct(CN.viv_top.pct_uso_temporal[1])}) y la más baja, la de ${CN.viv_low.pct_uso_temporal[0]} (${pct(CN.viv_low.pct_uso_temporal[1])}).`},
};
const CU = {PASO: 100, INDICE: 500, BASE: 3000, R_MAX: 4000, EXAG: 1.5, FI: 36 * Math.PI / 180, GIRO: -0.45, PIE: 250};
const LEAD = {
petroleo: v => v === "cuenca"
? `En ${PG.mes}, el petróleo salió de cinco cuencas: ${cuencasTxt(PG.cuencas_pet)}. La Neuquina abarca Neuquén y partes de Mendoza, Río Negro y La Pampa.`
: `Entre enero y ${MESES[PG.ytd.pet.mes - 1]} de ${PG.ytd.pet.anio}, la producción de petróleo ${creceCae(PG.ytd.pet.var)} frente a los mismos meses de ${PG.ytd.pet.anio - 1}. ` +
`En ${PG.mes}, el ${pct(PG.pct_nc)} salió de pozos no convencionales: el ${pct(PG.pct_shale)} de shale y el resto de tight. ` +
`El promedio anual más bajo de la serie, que empieza en ${PG.anio_ini}, fue el de ${PG.anio_min}, con ${n0(PG.kbd_min)} mil barriles por día.`,
gas: v => v === "cuenca"
? `En ${PG.mes}, el gas salió de estas cuencas: ${cuencasTxt(PG.cuencas_gas)}. La Austral incluye los yacimientos del mar frente a Tierra del Fuego.`
: `Entre enero y ${MESES[PG.ytd.gas.mes - 1]} de ${PG.ytd.gas.anio}, la producción de gas natural ${creceCae(PG.ytd.gas.var)} frente a los mismos meses de ${PG.ytd.gas.anio - 1}. ` +
`En ${PG.mes}, el ${pct(PG.pct_gas_nc)} salió de pozos no convencionales. ` +
`El promedio de ${PG.anio_ult} fue de ${n1(PG.gas_ult)} millones de metros cúbicos por día, y el promedio anual más bajo de la serie, el de ${PG.anio_min_gas}, con ${n1(PG.gas_min)}.`,
"gas-hogares": () => {
const alto = topViv("pct_gas_red").slice(0, 3);
return `En el Censo 2022, el ${pct(VV.pct_garrafa)} de los hogares cocinaba con gas en garrafa. ` +
(CN.gas_nea.length ? `En ${lista(CN.gas_nea)}, menos de ${Math.ceil(CN.gas_nea_max)} de cada 100 hogares cocinaban con gas de red. ` : "") +
`Los porcentajes más altos eran los de ${lista(alto.map(r => `${r.territorio} (${pct(r.pct_gas_red)})`))}.`;
},
"hidro-provincias": v => {
const fila = c => T.hidrocarburos_provincias.find(r => r.territorio === c) || {};
if (v === "gas_mmm3d") {
const t = fila(PG.top_gas);
return `Entre ${PG.v_desde} y ${PG.v_hasta}, ${PG.top_gas} produjo el ${pct(PG.top_gas_pct)} del gas del país: ${n1(t.gas_mmm3d)} millones de metros cúbicos por día, contra ${n1(t.gas_mmm3d_antes)} en los mismos meses de diez años antes. ` +
`Los yacimientos del mar argentino aportaron el ${pct(PG.mar_gas_pct)}.`;
}
return `Entre ${PG.v_desde} y ${PG.v_hasta}, ${PG.top} produjo ${n0(PG.top_kbd)} mil barriles de petróleo por día, contra ${n0(PG.top_antes)} mil en los mismos meses de diez años antes. ` +
`${PG.segundo}, la segunda, produjo ${n0(PG.segundo_kbd)} mil, contra ${n0(PG.segundo_antes)} mil. En total, ${PG.n_prov} provincias producen petróleo o gas, además de los yacimientos del mar de jurisdicción nacional. La formación Vaca Muerta dio el ${pct(PG.vm_pct)} del petróleo del país.`;
},
"areas-hidro": v => {
const gas = v === "gas", t = gas ? PG.areas_gas_top : PG.areas_pet_top;
const cant = x => gas ? `${n1(x)} millones de metros cúbicos de gas por día` : `${kbdF(x)} mil barriles de petróleo por día`;
return `En ${PG.areas_anio}, ${PG.areas_n} áreas de concesión produjeron petróleo o gas. La mitad del ${gas ? "gas" : "petróleo"} del país salió de ${gas ? PG.areas_n50_gas : PG.areas_n50_pet} de ellas` +
`${gas ? `, y las diez que más produjeron sumaron el ${pct(PG.areas_top10_gas)}` : ""}. ` +
`La primera fue ${tituloArea(t.nombre)}, ${t.territorio === "Mar argentino" ? "en el mar argentino" : "en " + t.territorio}, con ${cant(t.v)}, el ${pct(t.pct)} del país` +
(t.nc >= 99.95 ? ", todo de formaciones no convencionales" : t.nc >= 95 ? ", casi todo de formaciones no convencionales" : t.nc > 0 ? `, el ${pct(t.nc)} de formaciones no convencionales` : ", todo de formaciones convencionales") +
`. ${t.antes > 0 ? `En ${PG.areas_anio - 10} producía ${cant(t.antes)}.` : `En ${PG.areas_anio - 10} no producía.`}`;
},
"empresas-hidro": v => {
const e = [...T.hidrocarburos_empresas].filter(r => r.nombre !== "Otras empresas").sort((a, b) => b.pct_gas - a.pct_gas);
return v === "pct_gas"
? `Entre ${PG.v_desde} y ${PG.v_hasta}, la empresa que más gas produjo fue ${e[0].nombre}, con el ${pct(e[0].pct_gas)} del país, seguida por ${e[1].nombre} (${pct(e[1].pct_gas)}) y ${e[2].nombre} (${pct(e[2].pct_gas)}). Un mismo grupo empresario puede aparecer en más de una barra, porque puede declarar con más de una razón social.`
: `Entre ${PG.v_desde} y ${PG.v_hasta}, ${PG.n_empresas} empresas declararon producción de petróleo. Las ${PG.emp_n} del gráfico sumaron el ${pct(100 - PG.emp_resto_pct)}. ` +
`Un mismo grupo empresario puede aparecer en más de una barra, porque puede declarar con más de una razón social.`;
},
"empleo-hidro": () => `En el ${CN.emp_trim}, los puestos asalariados registrados del sector privado en la extracción de petróleo y gas y sus servicios ` +
`${creceCae(CN.pet_emp_var, "crecieron", "cayeron")} frente al ${CN.emp_trim_ant}, en las provincias con dato en los dos trimestres. ${CN.pet_emp_top} es la provincia con más puestos: ${n0(CN.pet_emp_top_v)}. ` +
`CABA aparece en el gráfico porque el registro cuenta cada puesto en la provincia donde la empresa declara a sus trabajadores, que puede no ser la del yacimiento.`,
regalias: v => v === "usd_crudo_hab"
? `En ${PG.reg_usd_anio}, las regalías de petróleo crudo sumaron ${n0(PG.reg_usd_total)} millones de dólares. En ${PG.reg_usd_top} equivalieron a ${n0(PG.reg_usd_top_hab)} dólares por habitante. ` +
`El año más alto de la serie, que empieza en ${PG.reg_usd_ini}, fue ${PG.reg_usd_max_anio}, con ${n0(PG.reg_usd_max)} millones.`
: `En ${PG.reg_anio}, las regalías fueron el 10% o más de los ingresos totales en ${PG.reg_n_10} provincias y quedaron entre el 1% y el 10% en otras ${PG.reg_n_1 - PG.reg_n_10}. ` +
`En las ${24 - PG.reg_n_1} jurisdicciones restantes fueron menos del 1%. El porcentaje suma todas las regalías: las de petróleo y gas, y también las mineras y las hidroeléctricas.` +
(Object.keys(PG.reg_atrasadas).length ? ` ${lista(Object.entries(PG.reg_atrasadas).map(([p, a]) => `${p} va con ${a}`))}, su último año publicado.` : ""),
reservas: v => v === "horizonte"
? `Al ritmo de producción de ${PG.res_anio}, las reservas comprobadas de gas alcanzaban para ${n1(PG.res_hor_gas)} años. ` +
`En ${PG.res_ini}, las de petróleo alcanzaban para ${n1(PG.res_hor_pet_ini)} años y las de gas, para ${n1(PG.res_hor_gas_ini)}.`
: v === "gas"
? `Al 31 de diciembre de ${PG.res_anio}, las reservas comprobadas de gas eran de ${n0(PG.res_gas)} mil millones de metros cúbicos, ${n1(PG.res_hor_gas)} años de producción al ritmo de ese año. ` +
`El ${pct(PG.res_nc_gas)} era no convencional y el ${pct(PG.res_nq_gas)} estaba en Neuquén. En ${PG.res_ini} eran ${n0(PG.res_gas_ini)} mil millones.`
: `Al 31 de diciembre de ${PG.res_anio}, las reservas comprobadas de petróleo eran de ${n0(PG.res_pet)} millones de metros cúbicos, unos ${n0(PG.res_bbl * 1000)} millones de barriles. ` +
`${PG.res_var_pet >= 0 ? "Crecieron" : "Cayeron"} ${pct(Math.abs(PG.res_var_pet))} frente a ${PG.res_anio_ant}. El ${pct(PG.res_nc_pet)} era no convencional y el ${pct(PG.res_nq_pet)} estaba en Neuquén. Las de gas alcanzaban para ${n1(PG.res_hor_gas)} años de producción.`,
"balanza-energetica": () => `En ${PG.bal_anio}, la Argentina exportó ${n0(PG.bal_expo)} millones de dólares en combustibles y energía. Importó ${n0(PG.bal_impo)} millones en combustibles y lubricantes. ` +
(PG.bal_def_n ? `Entre ${PG.bal_def_desde} y ${PG.bal_def_hasta}, el saldo fue negativo en ${PG.bal_def_n} de ${PG.bal_def_hasta - PG.bal_def_desde + 1} años. El déficit más grande fue el de ${PG.bal_def_max_anio}: ${n0(PG.bal_def_max)} millones. ` : "") +
`Entre enero y ${MESES[PG.bal_ytd.mes - 1]} de ${PG.bal_ytd.anio}, el saldo fue de ${saldoTx(PG.bal_ytd.saldo)} y las exportaciones ${creceCae(PG.bal_ytd_expo.var, "crecieron", "cayeron")} frente a los mismos meses de ${PG.bal_ytd.anio - 1}.`,
"mundo-petroleo": v => {
const m = PG.mundo, q = m.neuquen;
return v === "gas_bcm"
? `Según la estimación de la Administración de Información Energética de los Estados Unidos (EIA), en gas natural la Argentina fue el productor número ${m.gas_bcm.puesto} del mundo en ${m.gas_bcm.anio}, con ${n1(m.gas_bcm.arg)} mil millones de metros cúbicos, el ${pct(m.gas_bcm.pct)} del total mundial.`
: `Según la estimación de la Administración de Información Energética de los Estados Unidos (EIA), en ${m.crudo_kbd.anio} la Argentina produjo ${n0(m.crudo_kbd.arg)} mil barriles de petróleo por día, el ${pct(m.crudo_kbd.pct)} del total mundial.` +
(m.crudo_kbd.anio === PG.anio_ult ? ` La Secretaría de Energía, que usa el resto de la página, registra ${n0(PG.kbd_ult)} mil: la EIA estima a todos los países con un mismo criterio.` : "") +
(q ? ` Si Neuquén fuera un país, con ${n0(q.kbd)} mil barriles por día estaría en el puesto ${q.puesto}, entre ${q.arriba} y ${q.abajo}.` : "");
},
productividad: v => v === "metro"
? `Por cada 1.000 metros de rama horizontal, los pozos que empezaron a producir en ${PG.cos_ult} sacaron en su primer año ${n0(PG.bpm_ult)} barriles de petróleo. ` +
(PG.bpm_ult < PG.bpm_max ? `El máximo fue el de los pozos de ${PG.bpm_max_anio}, con ${n0(PG.bpm_max)}. Los pozos de ${PG.cos_ult} son más largos (${n0(PG.rama_m_ult)} metros de rama en promedio, ` +
`contra ${n0(PG.rama_m_bpm_max)}), pero cada metro rindió ${pct(-PG.bpm_var)} menos.` : `Es el máximo desde ${PG.rama_desde}.`)
: v === "curvas"
? `Cada línea suma, mes a mes, el petróleo que sacó en promedio un pozo desde que empezó a producir, según su año de inicio. A los doce meses, un pozo de ${PG.cos_ult} ` +
`había sacado ${n0(PG.curva12_ult)} mil barriles de petróleo y uno de ${PG.curvas[0]}, ${n0(PG.curva12_ini)} mil.`
: `En ${PG.cos_ult} empezaron a producir ${n0(PG.cos_pozos_ult)} pozos petroleros de shale en Vaca Muerta.` +
(PG.cos_max !== PG.cos_ult ? ` Los que más petróleo sacaron en sus primeros doce meses fueron los de ${PG.cos_max}, con ${n0(PG.cos_kbbl_max)} mil barriles en promedio cada uno.`
: ` Son los que más petróleo sacaron en sus primeros doce meses desde ${PG.cos_ini}.`) +
` La serie llega hasta ${PG.cos_ult} porque no todos los pozos que empezaron después cumplieron todavía doce meses de producción.`,
"electricidad-provincias": v => {
if (v === "mes") return `En promedio entre ${e.el_est_desde} y ${e.el_ult}, el mes en que más electricidad consumieron los hogares del país fue ${e.el_mes_max}, con ${n0(e.el_mes_max_kwh)} kWh por habitante, ` +
`y el de menor consumo, ${e.el_mes_min}, con ${n0(e.el_mes_min_kwh)}.`;
if (v === "serie") return `Entre ${e.el_ini} y ${e.el_ult}, el consumo de electricidad de los hogares por habitante ${cambioPct((e.el_pais / e.el_pais_ini - 1) * 100)}. ` +
`En ${e.el_ini} era de ${n0(e.el_pais_ini)} kWh por año` +
(e.el_max_anio === e.el_ult ? `, y el de ${e.el_ult} es el valor más alto de la serie.` : `. El año de mayor consumo fue ${e.el_max_anio}, con ${n0(e.el_max)}.`) +
(e.el_min_anio !== e.el_ini ? ` El de menor consumo fue ${e.el_min_anio}, con ${n0(e.el_min)}.` : "");
const t = e.el_top, b = e.el_bajo;
return `En ${e.el_ult}, los hogares de ${t[0]} consumieron ${n0(t[1])} kilovatios hora (kWh) por habitante${conVeces(t[1], e.el_pais)}, el valor más alto. ` +
`Los de ${b[0]} consumieron ${n0(b[1])}${conVeces(b[1], e.el_pais)}, el más bajo. En ${e.el_res_top[0]}, los hogares fueron el ${pct(e.el_res_top[1])} de la demanda de electricidad, y en ${e.el_res_bajo[0]}, el ${pct(e.el_res_bajo[1])}. ` +
`Los datos son de CAMMESA, la empresa que administra el mercado eléctrico mayorista, que informa juntas CABA y la provincia de Buenos Aires y no incluye Tierra del Fuego.`;
},
"electricidad-sectores": v => {
const P = e.els_pct, g0 = e.els_gwh_ini, g1 = e.els_gwh_ult;
const cambio = k => { const v = (g1[k] / g0[k] - 1) * 100; return `${v < 0 ? "bajó" : "creció"} ${pct(Math.abs(v))}`; };
if (v === "partes") return `En ${e.el_ult}, los hogares usaron el ${pct(P.res)} de la electricidad que registra CAMMESA y los comercios y servicios, el ${pct(P.com)}. ` +
`La parte de las industrias y los grandes comercios va del ${pct(e.els_pct_ind_top[1])} ` +
`de la demanda en ${e.els_pct_ind_top[0]} al ${pct(e.els_pct_ind_bajo[1])} en ${e.els_pct_ind_bajo[0]}. Entre ${e.el_ini} y ${e.el_ult}, la demanda de los hogares ` +
`${cambio("res")}, la de los comercios y servicios ${cambio("com")} y la de las industrias y los grandes comercios ${cambio("ind")}.`;
if (v === "com") {
const t = e.els_com_top, b = e.els_com_bajo;
return `En ${e.el_ult}, los comercios, los servicios y el alumbrado público (los usuarios que no son hogares y demandan una potencia de menos de 300 kilovatios) usaron ${n0(e.els_com)} kWh ` +
`de electricidad por habitante en el país, el ${pct(P.com)} de la demanda. El valor más alto fue el de ${t[0]}, con ${n0(t[1])}${conVeces(t[1], e.els_com)}, ` +
`y el más bajo, el de ${b[0]}, con ${n0(b[1])}${conVeces(b[1], e.els_com)}.`;
}
const t = e.els_ind_top, b = e.els_ind_bajo;
return `En ${e.el_ult}, las industrias y los grandes comercios (los que demandan una potencia de 300 kilovatios o más) usaron ${n0(e.els_ind)} kWh de electricidad por habitante en el país. ` +
`El valor más alto fue el de ${t[0]}, con ${n0(t[1])}${conVeces(t[1], e.els_ind)}, y el más bajo, el de ${b[0]}, ` +
`con ${n0(b[1])}${conVeces(b[1], e.els_ind)}. Donde hay una gran planta industrial o minera, una sola empresa puede concentrar buena parte de la demanda de la provincia.`;
},
salarios: v => {
if (v === "mes") {
const max = SA.real_max_mes === SA.real_desde ? `el de su primer mes, ${SA.real_max_mes}` : `el de ${SA.real_max_mes}`;
return `Descontada la inflación con el índice de precios al consumidor del INDEC, el salario promedio del país de ${SA.mes} fue ` +
`${pct(Math.abs(SA.real_vs_ini))} ${SA.real_vs_ini < 0 ? "más bajo" : "más alto"} que el de ${SA.real_ini_mes}. El más alto de la serie fue ${max}, ` +
`con ${n0(SA.real_max)} pesos de ${SA.mes}, y el más bajo, el de ${SA.real_min_mes}, con ${n0(SA.real_min)}. El gráfico no muestra junio ni diciembre, que incluyen el aguinaldo.`;
}
return `Descontada la inflación, el salario promedio del país ${cambioPct(SA.var_real_12m)} frente a ${SA.ant} y subió ${deLas24(SA.n_suben)}. ` +
`El más alto fue el de ${SA.top[0]}, con ${n0(SA.top[1])} pesos${conVeces(SA.top[1], SA.pais)}, y el más bajo, el de ${SA.bajo[0]}, con ${n0(SA.bajo[1])}${conVeces(SA.bajo[1], SA.pais)}.`;
},
"salario-docente": v => {
if (v === "serie") return `Descontada la inflación con el índice de precios al consumidor del INDEC, el salario promedio de un maestro de grado del país en ${DC.trim} fue ` +
`${pct(Math.abs(DC.real_vs_ini))} ${DC.real_vs_ini < 0 ? "más bajo" : "más alto"} que en ${DC.real_ini}` +
(DC.real_max_trim === DC.real_desde ? `. El trimestre más alto de la serie fue el primero, ${DC.real_desde}, y el más bajo, el de ${DC.real_min_trim}.`
: `. Desde ${DC.real_desde}, el trimestre más alto fue el de ${DC.real_max_trim} y el más bajo, el de ${DC.real_min_trim}.`) + ` Hasta ${DC.fonid_fin} el salario incluía el Fondo Nacional de Incentivo Docente y la conectividad que pagaba la Nación, y desde ${DC.fonid_ini} ` +
`no los incluye. Entre esos dos trimestres, el promedio del país ${cambioPct(DC.fonid_var)}, descontada la inflación.`;
const ex = DC.extra.length === 1 ? ` En ${DC.extra[0][0]}, ese salario incluye una suma extraordinaria de ${n0(DC.extra[0][1])} pesos, que el gráfico suma a su barra.`
: DC.extra.length ? ` En ${lista(DC.extra.map(x => x[0]))}, ese salario incluye sumas extraordinarias, que el gráfico suma a sus barras.` : "";
return `Descontada la inflación, el salario promedio de un maestro de grado del país ${cambioPct(DC.var_real_12m)} frente a ${DC.ant}. ` +
`Con 10 años de antigüedad y jornada simple, el más alto fue el de ${DC.top[0]}, con ${n0(DC.top[1])} pesos brutos por mes${conVeces(DC.top[1], DC.pais)}, ` +
`y el más bajo, el de ${DC.bajo[0]}, con ${n0(DC.bajo[1])}${conVeces(DC.bajo[1], DC.pais)}.` + ex;
},
"inversion-educativa": v => {
if (v === "pct") return `En ${IE.anio}, la educación fue el ${pct(IE.pct_pais)} del gasto público de las provincias en el total del país. La parte más alta fue la de ` +
`${IE.pct_top[0]}, con el ${pct(IE.pct_top[1])}, y la más baja, la de ${IE.pct_bajo[0]}, con el ${pct(IE.pct_bajo[1])}.`;
if (v === "serie") return `Descontada la inflación con el deflactor del PBI, en pesos de ${IE.anio}, la inversión por alumno de gestión estatal del país pasó de ${n0(IE.real_ini)} en ${IE.ini} a ` +
`${n0(IE.pais)} en ${IE.anio}. El año más alto fue ${IE.real_max_anio}, con ${n0(IE.real_max)}, y el más bajo, ${IE.real_min_anio}, con ${n0(IE.real_min)}.`;
return `En ${IE.anio}, la inversión por alumno de las escuelas de gestión estatal fue más alta en ${IE.top[0]}, con ${n0(IE.top[1])} pesos${conVeces(IE.top[1], IE.pais)}, ` +
`y más baja en ${IE.bajo[0]}, con ${n0(IE.bajo[1])}${conVeces(IE.bajo[1], IE.pais)}. La cifra suma lo que gasta cada provincia en educación y lo que le transfiere la Nación.`;
},
delitos: v => {
const t = SG.total_tasa / SG.total_tasa_ant * 100 - 100;
if (v === "serie") return `Desde ${SG.anio_ini}, la tasa de robos del país fue la más alta en ${SG.robos_max_anio}, con ${n0(SG.robos_max)} cada 100.000 habitantes, y en ${SG.anio} ` +
`fue de ${n0(SG.robos)}. Los hurtos pasaron de ${n0(SG.hurtos_ini)} en ${SG.anio_ini} a ${n0(SG.hurtos)} en ${SG.anio}. Las estafas y defraudaciones por medios virtuales, ` +
`que el SNIC cuenta aparte desde ${SG.estafas_ini}, pasaron de ${n0(SG.estafas_tasa_ini)} a ${n0(SG.estafas_tasa)} cada 100.000 habitantes.`;
return `En ${SG.anio}, las fuerzas policiales y de seguridad registraron ${n0(SG.total)} delitos en el país. La tasa cada 100.000 habitantes ` +
`fue un ${pct(Math.abs(t))} ${t < 0 ? "menor" : "mayor"} que en ${SG.anio - 1}. Los más frecuentes, como parte del total, fueron ${lista(SG.tipos.map(([d, , p]) => `${d.toLowerCase()} (${pct(p)})`))}.`;
},
robos: v => {
const r = SG.robos / SG.robos_ant * 100 - 100, h = SG.hurtos / SG.hurtos_ant * 100 - 100;
const deDia = t => t === "CABA" ? " CABA recibe cada día a muchas personas que viven en otras jurisdicciones, pero la tasa se calcula solo con quienes viven en ella." : "";
if (v === "serie") return `Desde ${SG.anio_ini}, la tasa de robos del país fue la más alta en ${SG.robos_max_anio}, con ${n0(SG.robos_max)} cada 100.000 habitantes. ` +
`En ${SG.anio} fue de ${n0(SG.robos)}, y la de hurtos, de ${n0(SG.hurtos)} (en ${SG.anio_ini}, ${n0(SG.robos_ini)} y ${n0(SG.hurtos_ini)}).`;
if (v === "hurtos") return `En ${SG.anio} se registraron ${n0(SG.hurtos)} hurtos cada 100.000 habitantes en el país, un ${pct(Math.abs(h))} ${h < 0 ? "menos" : "más"} que en ${SG.anio - 1}. ` +
`La tasa más alta fue la de ${SG.hurtos_top[0]}, con ${n0(SG.hurtos_top[1])}${conVeces(SG.hurtos_top[1], SG.hurtos)}, y la más baja, la de ` +
`${SG.hurtos_bajo[0]}, con ${n0(SG.hurtos_bajo[1])}${conVeces(SG.hurtos_bajo[1], SG.hurtos)}.${deDia(SG.hurtos_top[0])}`;
return `En ${SG.anio}, la tasa de robos del país ${r < 0 ? "bajó" : "subió"} un ${pct(Math.abs(r))} frente a ${SG.anio - 1}. ` +
`Bajó ${deLas24(SG.n_robos_bajan)}. La tasa más alta fue la de ${SG.robos_top[0]}, con ${n0(SG.robos_top[1])}${conVeces(SG.robos_top[1], SG.robos)}, ` +
`y la más baja, la de ${SG.robos_bajo[0]}, con ${n0(SG.robos_bajo[1])}${conVeces(SG.robos_bajo[1], SG.robos)}.${deDia(SG.robos_top[0])}`;
},
homicidios: v => {
if (v === "serie") return `Desde ${SG.anio_ini}, la tasa de víctimas de homicidios dolosos del país fue la más alta en ${SG.hom_max_anio}, con ${n1(SG.hom_max)} ` +
`cada 100.000 habitantes. En ${SG.anio_ini} fue de ${n1(SG.hom_ini)}` +
(SG.hom_min_anio === SG.anio ? `, y la de ${SG.anio} es la más baja de la serie.` : `, y en ${SG.anio}, de ${n1(SG.hom_tasa)}.`);
return `En ${SG.anio}, ${n0(SG.hom_victimas)} personas fueron víctimas de homicidios dolosos en el país` +
(SG.hom_min_anio === SG.anio ? `, y la tasa fue la más baja desde ${SG.anio_ini}` : "") + `. El ${pct(SG.hom_varones)} de las víctimas eran varones. ` +
`Entre ${SG.hom3_desde} y ${SG.anio}, el país tuvo en promedio ${n1(SG.hom3_pais)} víctimas cada 100.000 habitantes por año. La tasa más alta fue la de ${SG.hom3_top[0]}, con ${n1(SG.hom3_top[1])}${conVeces(SG.hom3_top[1], SG.hom3_pais)}, ` +
`y la más baja, la de ${SG.hom3_bajo[0]}, con ${n1(SG.hom3_bajo[1])}${conVeces(SG.hom3_bajo[1], SG.hom3_pais)}.`;
},
carceles: v => {
if (v === "prov") return `Al 31 de diciembre de ${SG.sn_anio}, la tasa más alta de los servicios penitenciarios provinciales fue la de ${SG.sn_top[0]}, con ${n0(SG.sn_top[1])} ` +
`personas privadas de libertad cada 100.000 habitantes de la provincia, y la más baja, la de ${SG.sn_bajo[0]}, con ${n0(SG.sn_bajo[1])}. Las cárceles del Servicio ` +
`Penitenciario Federal, que van aparte, alojaban a ${n0(SG.sn_spf)} personas. CABA no tiene un servicio penitenciario propio. No se cuentan las personas detenidas en comisarías ni las que tienen prisión domiciliaria.`;
return `Al 31 de diciembre de ${SG.sn_anio} había ${n0(SG.sn_personas)} personas privadas de libertad en las cárceles del país. ` +
`En ${SG.sn_ini} eran ${n0(SG.sn_personas_ini)}, ${n0(SG.sn_tasa_ini)} cada 100.000 habitantes. El ${pct(SG.sn_condenados)} tenía una condena. Las demás estaban procesadas, ` +
`con la causa todavía en trámite, o en otra situación. No se cuentan las personas detenidas en comisarías ni las que tienen prisión domiciliaria.`;
},
"sin-condena": v => {
if (v === "serie") return `En ${SG.sn_ini}, el ${pct(SG.sn_sin_ini)} de las personas privadas de libertad en las cárceles del país no tenía condena. ` +
`En ${SG.sn_anio} fue el ${pct(SG.sn_sin)}${SG.sn_sin < 50 ? ", así que la mayoría tenía condena" : ""}. ` +
`En el Servicio Penitenciario Federal, el ${pct(SG.sn_sin_spf)}.`;
return `Al 31 de diciembre de ${SG.sn_anio}, ` + (SG.sn_sin_mitad ? `en ${SG.sn_sin_mitad} de los ${SG.sn_n_prov} servicios penitenciarios provinciales más de la mitad de las personas presas no tenía condena. `
: `en ninguno de los ${SG.sn_n_prov} servicios penitenciarios provinciales más de la mitad de las personas presas estaba sin condena. `) +
`La parte más alta fue la de ${SG.sn_sin_top[0]}, el ${pct(SG.sn_sin_top[1])}, y la más baja, la de ${SG.sn_sin_bajo[0]}, el ${pct(SG.sn_sin_bajo[1])}. ` +
`En el Servicio Penitenciario Federal, que va aparte, el ${pct(SG.sn_sin_spf)}. La parte depende también de dónde aloja cada provincia a las personas procesadas: ` +
`las que esperan juicio en una comisaría no se cuentan, así que una parte baja no quiere decir por sí sola que haya menos personas presas sin condena.`;
},
"cuentas-nacion": v => {
if (v === "gasto") return `En ${GBN.anio}, el ${pct(GBN.gasto_tipos[0][1])} del gasto primario de la Nación, el que no cuenta los intereses de la deuda, ` +
`fue en ${inicialMin(GBN.gasto_tipos[0][0])}, el ${pct(GBN.gasto_tipos[1][1])} en ${inicialMin(GBN.gasto_tipos[1][0])} y el ${pct(GBN.gasto_tipos[2][1])} ` +
`en ${inicialMin(GBN.gasto_tipos[2][0])}, según la Secretaría de Hacienda. Las transferencias no automáticas de la Nación a cada provincia están en Instituciones políticas, y los ` +
`subsidios a la energía, en Energía.`;
return `En ${GBN.anio}, los ingresos del Sector Público Nacional fueron el ${pct(GBN.ingresos)} del PBI y el gasto sin los intereses de la deuda, el ` +
`${pct(GBN.gasto)}. Después de pagar los intereses ` +
`(${pct(GBN.intereses)} del PBI), el resultado financiero fue un ${sobra(GBN.financiero)} de ${pct(Math.abs(GBN.financiero))}, según la Secretaría ` +
`de Hacienda. Desde ${GBN.desde}, el ${sobra(GBN.fin_min)} financiero más grande fue el de ${GBN.fin_min_anio}, ${pct(Math.abs(GBN.fin_min))} del PBI.` +
(GBN.en_el_anio ? ` Hasta ${GBN.mes}, el resultado primario del año fue un ${sobra(GBN.ytd_primario)} de ${billones(Math.abs(GBN.ytd_primario))} corrientes, y el ` +
`financiero, un ${sobra(GBN.ytd_financiero)} de ${billones(Math.abs(GBN.ytd_financiero))} corrientes.` : "");
},
recaudacion: v => {
if (v === "anio") return `En ${GRT.anio}, la recaudación de impuestos nacionales fue el ${pct(GRT.pbi)} del PBI. Desde ${GRT.desde}, el valor más alto ` +
`fue el de ${GRT.pbi_max_anio}, ${pct(GRT.pbi_max)}, y el más bajo, el de ${GRT.pbi_min_anio}, ${pct(GRT.pbi_min)}. Una parte de lo recaudado se reparte ` +
`en forma automática con las provincias por la coparticipación.`;
return `En los doce meses hasta ${GRT.doce_hasta}, la recaudación de impuestos nacionales sumó ${billones(GRT.doce_millones)} corrientes. Los aportes y ` +
`contribuciones a la seguridad social fueron el ${pct(GRT.seguridad_social)} y Ganancias, el ${pct(GRT.ganancias)}. Los derechos de exportación ` +
`aportaron el ${pct(GRT.exportacion)}. Entre enero y ${MESES[GRT.ytd.mes - 1]} de ${GRT.ytd.anio}, descontada la inflación, la recaudación ` +
`${cambioPct(GRT.ytd.var)} frente a los mismos meses del año anterior.`;
},
deuda: () => `La deuda bruta de la Administración Central sumaba ${n0(GBD.usd_millones)} millones de dólares al ${GBD.fecha}, ` +
`según la Secretaría de Finanzas, e incluye la que tienen otros organismos del propio Estado. A fin de ${GBD.anio} era el ${pct(GBD.pct_anio)} del PBI. Desde ${GBD.desde}, el valor más alto fue el de ` +
`${GBD.max_anio}, ${pct(GBD.max)}, y el más bajo, el de ${GBD.min_anio}, ${pct(GBD.min)}. Como buena parte de la deuda está en moneda extranjera, el ` +
`porcentaje sube cuando el peso se devalúa, aunque la deuda en dólares no cambie.`,
"empleo-publico": v => {
if (v === "nacion") return `En ${GBC.dot_mes}, la administración pública nacional, las empresas y las sociedades del Estado tenían ${n0(GBC.dot_total)} ` +
`personas, según el INDEC: ${n0(GBC.dot_adm)} en la administración y ${n0(GBC.dot_emp)} en las empresas y sociedades. Desde ${GBC.dot_desde}, el primer ` +
`mes de la serie, la cantidad de personas ${cambioPct(GBC.dot_var)}: eran ${n0(GBC.dot_total_ini)}.`;
return `En total, las administraciones de las provincias y de CABA tenían ${n0(GBC.cargos)} cargos ocupados en ${GBC.anio}, ` +
`según la Dirección Nacional de Asuntos Provinciales. Cada 1.000 habitantes, iban de ${n1(GBC.bajo[1])} en ${GBC.bajo[0]} a ${n1(GBC.top[1])} en ${GBC.top[0]}` +
`${conVeces(GBC.top[1], GBC.cada_1000)}. Cuenta cargos, no personas, y no incluye a los municipios ni a las empresas provinciales.`;
},
"impuestos-provinciales": () => `En total, las provincias y CABA recaudaron ${billones(GBP.millones)} de impuestos propios en ${GBP.anio}` + (GBP.faltan.length ? `, sin contar ${lista(GBP.faltan)}` : "") + `, ` +
`según la Dirección Nacional de Asuntos Provinciales. El ${pct(GBP.iibb)} fue de ingresos brutos. La recaudación por habitante iba de ${n0(GBP.bajo[1])} pesos ` +
`en ${GBP.bajo[0]} a ${n0(GBP.top[1])} en ${GBP.top[0]}${conVeces(GBP.top[1], GBP.pais)}.` +
(GBP.faltan.length ? ` ${lista(GBP.faltan)} no ${GBP.faltan.length > 1 ? "tienen" : "tiene"} datos completos del año y no ${GBP.faltan.length > 1 ? "entran" : "entra"} en el total ni en el gráfico.` : ""),
"pobreza-aglomerados": v => {
const C = PZA.cuidado, N = PZA.no_confiable;
if (v === "region") return `En el ${PZA.semestre}, la pobreza iba del ${pct(PZA.reg_min[1])} en ${REG_ART[PZA.reg_min[0]]} al ${pct(PZA.reg_max[1])} en ` +
`${REG_ART[PZA.reg_max[0]]}. En el total de los 31 aglomerados urbanos fue del ${pct(PZA.pais)}. Cada región cuenta solo sus aglomerados urbanos.`;
if (v === "prov") return `En el ${PZA.semestre}, la pobreza en los aglomerados urbanos de cada provincia iba del ${pct(PZA.prov_min[1])} en ` +
`${PZA.prov_min[0]} al ${pct(PZA.prov_max[1])} en ${PZA.prov_max[0]}, y le seguía ${PZA.prov_max2[0]}, con el ${pct(PZA.prov_max2[1])}. En el total de ` +
`los 31 aglomerados fue del ${pct(PZA.pais)}. Mide solo las ciudades que releva la EPH, no el resto de cada provincia.` +
(PZA.prov_varias.length ? ` ${lista(PZA.prov_varias.map(([p, n]) => `${p} (${n})`))} ${PZA.prov_varias.length > 1 ? "juntan" : "junta"} más de un aglomerado.` : "");
return `En el ${PZA.semestre}, la pobreza iba del ${pct(PZA.ag_min[1])} en ${PZA.ag_min[0]} al ${pct(PZA.ag_max[1])} en ${PZA.ag_max[0]}. ` +
`En el total de los 31 aglomerados urbanos fue del ${pct(PZA.pais)}. ` +
(C.length ? `El INDEC pide leer con cuidado ${C.length > 1 ? "las estimaciones" : "la estimación"} de ${lista(C)}, que ${C.length > 1 ? "tienen" : "tiene"} un coeficiente de variación de entre 16% y 25%. ` : "") +
(N.length ? `${N.length > 1 ? "Las" : "La"} de ${lista(N)} ${N.length > 1 ? "pasan" : "pasa"} de 25% y no ${N.length > 1 ? "son confiables" : "es confiable"}. ` : "") +
`Dos ciudades con valores parecidos pueden no ser distintas.`;
},
"empresas-tamano": v => v === "sec"
? `En ${EM.anio}, el ${pct(EM.sec_servicios)} de las empresas privadas con empleados del país eran de servicios, el ${pct(EM.sec_comercio)} de comercio, ` +
`el ${pct(EM.sec_industria)} de la industria, la minería y la energía, el ${pct(EM.sec_agro)} del agro y la pesca, y el ${pct(EM.sec_construccion)} de la ` +
`construcción. El agro iba del ${pct(EM.agro_ext[1][1])} de las empresas en ${EM.agro_ext[1][0]} al ${pct(EM.agro_ext[0][1])} en ${EM.agro_ext[0][0]}.`
: `En ${EM.anio}, el ${pct(EM.tam_micro)} de las empresas privadas de industria, comercio y servicios del país eran microempresas, el ${pct(EM.tam_pequenas)} ` +
`pequeñas, el ${pct(EM.tam_medianas)} medianas y el ${pct(EM.tam_grandes)} grandes. Las microempresas iban del ${pct(EM.micro_ext[1][1])} en ` +
`${EM.micro_ext[1][0]} al ${pct(EM.micro_ext[0][1])} en ${EM.micro_ext[0][0]}. El tamaño es el de toda la empresa: una grande puede tener pocas personas en una provincia.`,
desocupacion: v => v === "serie"
? `En el ${DSO.ultimo}, el ${pct(DSO.pais_ultimo)} de las personas que trabajaban o buscaban trabajo en los 31 aglomerados urbanos estaba desocupada` +
(DSO.pais_anio_antes != null ? `, contra el ${pct(DSO.pais_anio_antes)} un año antes` : "") + `. La tasa más alta desde el ${DSO.ini} fue la del ` +
`${DSO.pico[0]}, el ${pct(DSO.pico[1])}, y la más baja, la del ${DSO.piso[0]}, el ${pct(DSO.piso[1])}. Cada trimestre tiene sus temporadas de trabajo: ` +
`conviene comparar con el mismo trimestre de otro año.`
: `En ${DSO.trimestres}, en promedio, el ${pct(DSO.pais)} de las personas que trabajaban o buscaban trabajo en los 31 aglomerados urbanos estaba ` +
`desocupada: buscaba trabajo y no conseguía. La tasa iba del ${pct(DSO.min[1])} en ${DSO.min[0]} al ${pct(DSO.max[1])} en ${DSO.max[0]}.`,
coparticipacion: v => {
const mill = v => `${n2(v / 1e6)} millones`, at = Object.entries(CPA.atrasadas), sin = at.length ? `, sin contar ${lista(at.map(([p]) => p))}` : "";
if (v === "pct") return `En ${CPA.anio}, la coparticipación federal y los otros impuestos nacionales que se reparten por ley fueron el ${pct(CPA.pct_pais)} de los ` +
`ingresos de las provincias y CABA juntas${sin}. En ${CPA.ini}, el ${pct(CPA.pct_pais_ini)}. En ${CPA.mas_mitad} de las 24 jurisdicciones fueron más de la mitad ` +
`de sus ingresos. La parte más alta fue la de ${CPA.top_pct[0]}, el ${pct(CPA.top_pct[1])}, y la más baja, la de ${CPA.bajo_pct[0]}, el ${pct(CPA.bajo_pct[1])}.` +
at.map(([p, a]) => ` ${p} todavía no publicó ${CPA.anio}: figura con ${a}.`).join("");
return `En ${CPA.anio}, las provincias y CABA recibieron ${billones(CPA.millones)} por la coparticipación federal y otros impuestos nacionales que se ` +
`reparten por ley${sin}: ${mill(CPA.pais_hab)} de pesos por habitante. El ${pct(CPA.federal)} fue coparticipación federal. Por habitante, iba de ` +
`${mill(CPA.bajo_hab[1])} de pesos en ${CPA.bajo_hab[0]} a ${mill(CPA.top_hab[1])} en ${CPA.top_hab[0]}${conVeces(CPA.top_hab[1], CPA.pais_hab)}.` +
at.map(([p, a]) => ` ${p} todavía no publicó ${CPA.anio}: está en la vista en % de sus ingresos, con ${a}, y no en esta, porque los pesos de ${a} no se comparan con los de ${CPA.anio}.`).join("");
},
"deuda-provincias": v => {
const f = DPR.faltan, n = 24 - f.length, nm = DPR.nacion_mitad;
const sin = f.length ? `, sin contar ${lista(f)}, que no ${f.length > 1 ? "informaron" : "informó"} su deuda` : "";
if (v === "acreedor") return `Al ${DPR.fecha_txt}, el ${pct(DPR.pct_bonos)} de la deuda de las provincias y CABA${sin ? sin + "," : ""} era en bonos, el ` +
`${pct(DPR.pct_organismos)}, con organismos internacionales de crédito, el ${pct(DPR.pct_nacion)}, con el Gobierno nacional y sus fondos ` +
`fiduciarios, y el ${pct(DPR.pct_bancos_otros)}, con bancos y otros acreedores. En ${DPR.bonos_mitad} de las ${n} jurisdicciones con datos, los ` +
`bonos eran más de la mitad de su deuda.` + (nm.length ? ` ${lista(nm)} le ${nm.length > 1 ? "debían" : "debía"} más de la mitad a la Nación.` : "");
return `Al ${DPR.fecha_txt}, las provincias y CABA debían ${billones(DPR.millones)}${sin}: ${pesosDeuda(DPR.pais_hab)} por habitante. La deuda ` +
`por habitante iba de ${pesosDeuda(DPR.bajo[1])} en ${DPR.bajo[0]} a ${pesosDeuda(DPR.top[1])} en ${DPR.top[0]}${conVeces(DPR.top[1], DPR.pais_hab)}, ` +
`y le seguía ${DPR.top2[0]}. ${DPR.mayor[0]} debía el ${pct(DPR.mayor[1])} del total. Una deuda alta por habitante no dice por sí sola si es ` +
`mucha para la provincia: eso depende de sus ingresos y de los plazos para pagarla.`;
},
sociedades: v => v === "serie"
? `En ${SOC.anio} se constituyeron ${n0(SOC.total)} sociedades comerciales en el país, y en ${SOC.anio - 1}, ${n0(SOC.total_ant)}. Las sociedades ` +
`por acciones simplificadas (SAS), que existen desde 2017, fueron el ${pct(SOC.pct_sas)} en ${SOC.anio}. La serie sale del registro de ` +
`${SOC.registro}: las sociedades que se dieron de baja pueden no estar, así que los años más viejos pueden quedar cortos.`
: `En ${SOC.anio} se constituyeron ${n0(SOC.total)} sociedades comerciales en el país, ${n1(SOC.pais)} cada 100.000 habitantes, según el ` +
`Registro Nacional de Sociedades. El ${pct(SOC.pct_sas)} fueron sociedades por acciones simplificadas (SAS). La cifra más alta por habitante ` +
`fue la de ${SOC.top[0]}, con ${n1(SOC.top[1])}, y le seguía ${SOC.top2[0]}, con ${n1(SOC.top2[1])}. La más baja, la de ${SOC.bajo[0]}, con ` +
`${n1(SOC.bajo[1])}.` + (SOC.top[0] === "CABA" ? ` CABA concentró el ${pct(SOC.caba_pct)} de las sociedades nuevas del país: se cuentan ` +
`por su domicilio fiscal, que puede no ser donde trabajan.` : ""),
"distancia-hospital": v => v === "terapia"
? `Hasta el hospital público con terapia intensiva más cercano, la mitad de las escuelas rurales del país queda a más de ${n1(DHO.pais_ti)} km en ` +
`línea recta, y el ${pct(DHO.pct_ti_100)}, a más de 100 km. Las distancias más largas son las de ${DHO.top_ti[0]} (${n1(DHO.top_ti[1])} km) ` +
`${yE(DHO.top2_ti[0])} (${n1(DHO.top2_ti[1])} km), y la más corta, la de ${DHO.bajo_ti[0]} (${n1(DHO.bajo_ti[1])} km).`
: `La mitad de las ${n0(DHO.rurales)} escuelas rurales del país queda a más de ${n1(DHO.pais)} km en línea recta del hospital público con ` +
`internación más cercano, y el ${pct(DHO.pct_20)}, a más de 20 km. Las distancias más largas son las de ${DHO.top[0]} (${n1(DHO.top[1])} km) ` +
`${yE(DHO.top2[0])} (${n1(DHO.top2[1])} km), y la más corta, la de ${DHO.bajo[0]} (${n1(DHO.bajo[1])} km).` +
(DHO.pocas.length ? ` ${lista(DHO.pocas.map(x => x[0]))} ${DHO.pocas.length > 1 ? "tienen" : "tiene"} muy pocas escuelas rurales ` +
`(${lista(DHO.pocas.map(x => n0(x[1])))}), y con tan pocas, una sola cambia la mediana.` : ""),
"escuelas-primarias": () => {
const dos = (a, b) => n1(a[1]) === n1(b[1]) ? `${n1(a[1])} en ${a[0]} ${yE(b[0])}` : `${n1(a[1])} en ${a[0]} ${yE(`${n1(b[1])} en ${b[0]}`)}`;
return `En ${ESP.fecha} había ${n0(ESP.primarias)} escuelas primarias en el país, ${n1(ESP.pais)} cada 1.000 chicos de 5 a 14 años. Van de ` +
`${dos(ESP.top, ESP.top2)} a ${dos(ESP.bajo2, ESP.bajo)}. La relación con la parte rural de las primarias es ${fuerza(ESP.r)}: en ` +
`${ESP.rural_top[0]} es rural el ${pct(ESP.rural_top[1])}, y en ${ESP.rural_bajo[0]}, el ${pct(ESP.rural_bajo[1])}.`;
},
"escuelas-secundarias": () => {
const dos = (a, b) => n1(a[1]) === n1(b[1]) ? `${n1(a[1])} en ${a[0]} ${yE(b[0])}` : `${n1(a[1])} en ${a[0]} ${yE(`${n1(b[1])} en ${b[0]}`)}`;
return `En ${ESS.fecha} había ${n0(ESS.secundarias)} escuelas secundarias en el país. Van de ${dos(ESS.top, ESS.top2)} a ` +
`${dos(ESS.bajo2, ESS.bajo)} cada 1.000 chicos de 12 a 17 años. Por cada escuela primaria hay ${n2(ESS.por_primaria_min[1])} secundarias en ` +
`${ESS.por_primaria_min[0]} y ${n2(ESS.por_primaria_max[1])} en ${ESS.por_primaria_max[0]}: depende también de cómo registra cada provincia ` +
`sus escuelas rurales.`;
},
hospitales: v => v === "terapia"
? `En ${HSP.fecha} había ${n0(HSP.con_terapia)} hospitales públicos con terapia intensiva en el país, ${n1(HSP.pais_ti)} cada 100.000 habitantes: ` +
`el ${pct(HSP.pct_terapia)} de los hospitales públicos con internación. La cifra más alta es la de ${HSP.top_ti[0]}, ${n1(HSP.top_ti[1])}, y la ` +
`más baja, la de ${HSP.bajo_ti[0]}, ${n1(HSP.bajo_ti[1])}.`
: `En ${HSP.fecha} había ${n0(HSP.hospitales)} hospitales públicos con internación en el país, ${n1(HSP.pais)} cada 100.000 habitantes. Las ` +
`cifras más altas son las de ${HSP.top[0]} (${n1(HSP.top[1])}) ${yE(HSP.top2[0])} (${n1(HSP.top2[1])}), y las más bajas, las de ` +
`${HSP.bajo[0]} (${n1(HSP.bajo[1])}) ${yE(HSP.bajo2[0])} (${n1(HSP.bajo2[1])}). Cuenta hospitales, no camas: una provincia con muchos ` +
`hospitales chicos queda arriba de una con pocos y grandes.`,
medicos: v => v === "habilitados"
? `A fines de ${MDC.anio} había ${n0(MDC.habilitados)} médicos habilitados en el país, ${n1(MDC.pais_hab)} cada 10.000 habitantes. El ` +
`${pct(MDC.pct_activos)} estaba activo. La parte de habilitados sin actividad fue mayor en ${MDC.inactivos_max[0]}, el ${pct(MDC.inactivos_max[1])}` +
(MDC.inactivos_max[0] === "CABA" ? ", según el OFETHuS sobre todo por médicos extranjeros que emigraron." : ".")
: `A fines de ${MDC.anio} había ${n0(MDC.activos)} médicos activos en el país, ${n1(MDC.pais)} cada 10.000 habitantes. La cifra más alta fue ` +
`la de ${MDC.top[0]}, con ${n1(MDC.top[1])}, y le seguía ${MDC.top2[0]}, con ${n1(MDC.top2[1])}. Las más bajas, las de ${MDC.bajo[0]}, con ` +
`${n1(MDC.bajo[1])}, y ${MDC.bajo2[0]}, con ${n1(MDC.bajo2[1])}.`,
"cobertura-suelo": v => v === "bosque"
? `En ${MBS.ini}, los bosques cubrían el ${pct(MBS.bos_ini)} de la superficie del país, según MapBiomas, y en ${MBS.fin}, el ${pct(MBS.bos)}: ` +
`${n1(MBS.bos_perdida_mha)} millones de hectáreas menos. La provincia que más perdió fue ${MBS.bos_top[0]}: ${n1(MBS.bos_top[1])} millones de ` +
`hectáreas, el ${pct(MBS.bos_top[2])} de los bosques que tenía en ${MBS.ini}.`
: `En ${MBS.ini}, la vegetación natural (bosques, arbustales, pastizales y turberas) cubría el ${pct(MBS.nat_ini)} de la superficie del país, ` +
`según MapBiomas, y en ${MBS.fin}, el ${pct(MBS.nat)}: ${n1(MBS.nat_perdida_mha)} millones de hectáreas menos. Las provincias que más perdieron ` +
`fueron ${MBS.top[0][0]}, del ${pct(MBS.top[0][1])} al ${pct(MBS.top[0][2])} de su superficie, y ${MBS.top[1][0]}, del ${pct(MBS.top[1][1])} al ` +
`${pct(MBS.top[1][2])}.` + (MBS.ganaron.length ? ` En ${lista(MBS.ganaron)}, la parte con vegetación natural creció.` : ""),
telefonia: v => v === "serie"
? `En el ${TF.ini_trim} había ${n1(TF.pais_ini)} accesos de telefonía fija cada 100 hogares en el país, y en el ${TF.trim}, ${n1(TF.pais)}. ` +
`Cada 100 habitantes, de ${n1(TF.pais_hab_ini)} a ${n1(TF.pais_hab)}.`
: `En el ${TF.trim}, había ${n1(TF.pais)} accesos de telefonía fija cada 100 hogares en todo el país. La cifra más alta fue la de ${TF.top[0]}, ` +
`con ${n1(TF.top[1])}, y le seguía ${TF.top2[0]}, con ${n1(TF.top2[1])}. La más baja, la de ${TF.bajo[0]}, con ${n1(TF.bajo[1])}. Desde el ` +
`${TF.ini_trim}, bajó en ${TF.bajaron === 24 ? "las 24 jurisdicciones" : `${TF.bajaron} de las 24 jurisdicciones`}.`,
"tarifa-luz": c => `En ${ENR.mes}, sin impuestos, una casa que consume ${c} kWh por mes pagaba ${n0(ENR["f" + c])} pesos de luz sin subsidio` +
(ENR["s" + c] ? ` y ${n0(ENR["s" + c])} con subsidio` : "") +
(c === "250" ? ". En " : `, el ${pct(ENR["pct" + c])} del salario mínimo sin subsidio. En `) + `${ENR.smvm_desde}, sin subsidio, era ` +
`el ${pct(ENR["pct_ini" + c])}. Entre ${ENR.congelada[0]} y ${ENR.congelada[1]} la factura de 250 kWh no cambió, y con la inflación ` +
`su parte del salario mínimo cayó hasta ${pct(ENR.min[1])} en ${ENR.min[0]}. Desde entonces volvió a subir.`,
"tv-paga": v => v === "serie"
? `En el ${TVP.ini_trim} había en el país ${n1(TVP.pais_ini)} accesos de TV por suscripción cada 100 hogares y ${n1(TVP.sat_ini)} de TV satelital. ` +
`En el ${TVP.trim}, ${n1(TVP.pais)} y ${n1(TVP.sat)}.`
: `La cifra más alta fue la de ${TVP.top[0]}, con ${n1(TVP.top[1])} accesos de TV por suscripción cada 100 hogares, y le seguía ${TVP.top2[0]}, ` +
`con ${n1(TVP.top2[1])}. La más baja, la de ${TVP.bajo[0]}, con ${n1(TVP.bajo[1])}. Desde el ${TVP.ini_prov_trim}, bajó en ` +
`${TVP.bajaron === 24 ? "las 24 jurisdicciones" : `${TVP.bajaron} de las 24 jurisdicciones`}. La TV satelital suma ${n1(TVP.sat)} cada 100 hogares en el país.`,
abandono: v => {
const rg = ABN.regimen_v, reg = lista(ABN.regimen);
if (v === "serie") return `En ${ABN.ini}, el ${pct(ABN.pais_ini)} de los alumnos de la secundaria del país no se volvió a matricular al año siguiente ` +
`y el ${pct(ABN.rep_pais_ini)} repitió. En ${ABN.anio}, el ${pct(ABN.pais)} y el ${pct(ABN.rep_pais)}. En 2020, con la escuela a distancia por ` +
`la pandemia, el abandono fue del ${pct(ABN.pandemia)} y la repitencia, del ${pct(ABN.rep_pandemia)}.` +
(rg.length ? ` La baja del último ciclo incluye el régimen académico nuevo de ${reg}, que según la fuente puede incidir en el total del país.` : "");
if (v === "rep") return `De los alumnos de la secundaria de ${ABN.rep_anio}, el ${pct(ABN.rep_pais)} repitió el año en ${ABN.rep_sig}, en todo el ` +
`país. La repitencia más alta fue la de ${ABN.rep_top[0]}, el ${pct(ABN.rep_top[1])}, y la más baja, la de ${ABN.rep_bajo[0]}, el ${pct(ABN.rep_bajo[1])}.` +
rg.map(([p, , , r, ra]) => ` ${p} no entra en la comparación: con su régimen académico nuevo cuenta como repitientes solo a los alumnos que no ` +
`aprobaron ninguna materia, así que su ${pct(r)} no se compara con las demás ni con su ${pct(ra)} de ${ABN.rep_anio - 1}.`).join("") +
(rg.length ? ` Ese cambio también pesa en el total del país.` : "");
return `De los alumnos de la secundaria de ${ABN.anio}, el ${pct(ABN.pais)} no se volvió a matricular en ${ABN.sig}, en todo el país. El abandono ` +
`más alto fue el de ${ABN.top[0]}, el ${pct(ABN.top[1])}, y le seguía ${ABN.top2[0]}, con el ${pct(ABN.top2[1])}. El más bajo, el de ` +
`${ABN.bajo[0]}, el ${pct(ABN.bajo[1])}.` + (ABN.arriba_10.length ? ` En ${ABN.arriba_10.length} jurisdicciones fue del 10% o más.` : "") +
rg.map(([p, a]) => ` ${p} cuenta a sus alumnos con un régimen académico nuevo desde ${ABN.anio}: según la fuente, eso puede incidir en su ` +
`abandono, el ${pct(a)}, y en el del país.`).join("");
},
refugio: v => {
if (v === "nacionalidad") return `En ${MGR.anio}, las nacionalidades con más solicitudes de refugio fueron la ${MGR.top[0][0].toLowerCase()}, con ` +
`${n0(MGR.top[0][1])}, la ${MGR.top[1][0].toLowerCase()}, con ${n0(MGR.top[1][1])}, y la ${MGR.top[2][0].toLowerCase()}, con ${n0(MGR.top[2][1])}, ` +
`según la Comisión Nacional para los Refugiados (CONARE).`;
if (v === "acnur") {
const A = MGR.acnur, F = MGR.afuera;
return `Según ACNUR, la agencia de las Naciones Unidas para los refugiados, que reúne las cifras de cada gobierno, a fines de ${A.anio} vivían en la Argentina ${n0(A.refugiados)} personas refugiadas y ` +
`${n0(A.solicitantes)} solicitantes de asilo. ACNUR cuenta aparte a ${n0(A.otras)} personas${A.otras_todas && A.otras_origen === "Venezuela" ? " venezolanas" : ""} ` +
`que no figuran como refugiadas ni como solicitantes pero que probablemente necesitan protección internacional. A la vez, ${n0(F.refugiados)} personas ` +
`de origen argentino eran refugiadas y ${n0(F.solicitantes)} solicitaban asilo en otros países, sobre todo en ${lista(F.destinos)}.`;
}
return `En ${MGR.anio}, las solicitudes de reconocimiento de la condición de persona refugiada ante la Comisión Nacional para los Refugiados (CONARE) ` +
`${cambioPl((MGR.solicitudes / MGR.sol_ant - 1) * 100)} frente a las ${n0(MGR.sol_ant)} de ${MGR.anio - 1}. El año con ` +
`más solicitudes desde ${MGR.ini} fue ${MGR.max_anio}, con ${n0(MGR.max)}. En ${MGR.anio}, la CONARE reconoció como refugiadas a ` +
`${n0(MGR.reconocidas)} personas, contra ${n0(MGR.rec_ant)} en ${MGR.anio - 1}.`;
},
supermercados: v => {
if (v === "mes") return `En ${ESU.mes}, las ventas ${ESU.interanual < 0 ? "cayeron" : "crecieron"} ${pct(Math.abs(ESU.interanual))} frente a ${ESU.mes_ant}, ` +
`y en los doce meses hasta ${ESU.mes}, ${ESU.doce < 0 ? "cayeron" : "crecieron"} ${pct(Math.abs(ESU.doce))} frente a los doce anteriores, según el índice del INDEC. ` +
(ESU.vs_max < 0 ? `Sin la estacionalidad, están ${pct(Math.abs(ESU.vs_max))} por debajo de ${ESU.max_mes}, el mes más alto de la serie, que empieza en ${ESU.desde}.`
: `Sin la estacionalidad, están en el nivel más alto de la serie, que empieza en ${ESU.desde}.`);
const P = ESU.prov;
return `Descontada la inflación de cada región, con datos del INDEC, ` + (P.suben && P.bajan
? `las ventas subieron en ${P.suben} jurisdicciones y bajaron en ${P.bajan} en los doce meses hasta ${ESU.mes}: la variación fue de ${conSigno(P.top[1])} en ${P.top[0]} a ${conSigno(P.bajo[1])} en ${P.bajo[0]}.`
: `las ventas ${P.suben ? "subieron" : "bajaron"} en todas las jurisdicciones en los doce meses hasta ${ESU.mes}, de ${conSigno(P.bajo[1])} en ${P.bajo[0]} a ${conSigno(P.top[1])} en ${P.top[0]}.`);
},
"nacidos-otro-pais": v => {
if (v === "mapa") return `Por departamento, entre los de ${n0(MGP.min_pob)} habitantes o más, la parte de la población nacida en otro país es más ` +
`alta en ${depsTop(MGP.top)}. En ${MGP.menos_1} de los ${MGP.n} departamentos del país, menos del 1% de la población nació en otro país.`;
if (v === "pais") return `Los países de nacimiento más frecuentes de las personas nacidas en otro país que vivían en la Argentina en 2022 eran ` +
`${lista(MGC.paises.slice(0, 3).map(p => `${p[0]} (${pct(p[2])})`))}, según el Censo. Las nacidas en países limítrofes eran el ${pct(MGC.limitrofes_pct)} ` +
`de las que declararon su país, y las nacidas en Europa, el ${pct(MGC.europa_pct)}. El ${pct(MGC.no_declarado_pct)} no declaró su país de nacimiento.`;
return `En el Censo 2022, ${n0(MGC.personas)} personas que vivían en el país habían nacido en otro país. La parte de la población nacida en otro país ` +
`era más alta en ${MGC.top[0]}, ${pct(MGC.top[1])}${conVeces(MGC.top[1], MGC.pct)}, y más baja en ${lista(MGC.bajos[0])}, ${pct(MGC.bajos[1])}. ` +
`${MGC.paises[0][0]}, el país de nacimiento más frecuente en el total, era también el primero en ${MGC.primer_pais_n} de las 24 jurisdicciones` +
(MGC.primer_pais_mas[0][1] > MGC.primer_pais_n ? `, y ${MGC.primer_pais_mas[0][0]}, en ${MGC.primer_pais_mas[0][1]}, más que ningún otro país.` : ".");
},
"migracion-interna": v => v === "mapa" ? `Por departamento, entre los de ${n0(MGP.min_pob)} habitantes o más, la parte de la población nacida en ` +
`otra provincia es más alta en ${depsTop(MGP.otra_top)}.` +
(MGP.otra_mitad ? ` En ${MGP.otra_mitad} de los ${MGP.n} departamentos del país, más de la mitad de la población nació en otra provincia.` : "")
: `En el Censo 2022, ${n0(MGC.otra_personas)} personas que vivían en el país habían nacido en otra provincia. ` +
`En proporción a la población de cada provincia, la parte más alta era la de ${MGC.otra_top[0]}` + (MGC.otra_top[1] > 50 ? `, donde más de la mitad había nacido en otra ` +
`provincia (${pct(MGC.otra_top[1])})` : `, con el ${pct(MGC.otra_top[1])}`) + `, y la más baja, la de ${lista(MGC.otra_bajos[0])}, con el ${pct(MGC.otra_bajos[1])}. ` +
`En todo el país, el ${pct(MGC.pct)} había nacido en otro país.`,
"migracion-historia": () => {
const lim = T.migracion_censos.map(r => r.limitrofes_pct).filter(v => v != null);
return `En el primer censo nacional, el de ${MGH.ini}, el ${pct(MGH.ini_pct)} de la población había nacido en otro país. Después del censo de ` +
`${MGH.max_anio}, esa parte bajó: en el Censo 2022 fue el ${pct(MGC.pct)}. Las personas nacidas en países limítrofes ` +
`fueron en todos los censos entre el ${pct(d3.min(lim))} y el ${pct(d3.max(lim))} de la población. Hasta el censo de 1980, la mayoría de las personas ` +
`nacidas en otro país venía de Europa, y desde el de 1991, de los países limítrofes: en 2022, el ${pct(MGC.limitrofes_pct)} de las que declararon su país.`;
},
radicaciones: v => {
if (v === "nacionalidad") return `En ${MGD.anio}, las nacionalidades con más residencias otorgadas fueron ${lista(MGD.top.map(t => `la ${t[0].toLowerCase()} ` +
`(${pct(t[2])})`))}. La Dirección Nacional de Migraciones no publica las residencias por provincia.`;
return `En ${MGD.anio}, la Dirección Nacional de Migraciones otorgó ${n0(MGD.permanentes)} residencias permanentes y ${n0(MGD.temporarias)} temporarias, ` +
`${pct(Math.abs(MGD.var))} ${MGD.var < 0 ? "menos" : "más"} que en el año anterior. Desde ` +
`${MGD.desde}, el año con más fue ${MGD.max_anio}, con ${n0(MGD.max)}, y el que menos, ${MGD.min_anio}, con ${n0(MGD.min)}` +
(MGD.min_anio === 2020 ? ", el año de la pandemia." : ".");
},
"argentinos-exterior": v => {
if (v === "pais") return `A mediados de ${MGO.anio}, los destinos más frecuentes de las personas nacidas en la Argentina que vivían en otro país eran ` +
`${lista(MGO.top.slice(0, 3).map(t => `${t[0]} (${pct(t[2])})`))}, según la estimación de las Naciones Unidas.`;
return `Según la estimación de las Naciones Unidas, en ${MGO.desde} vivían en otro país ${n0(MGO.personas_ini)} personas nacidas en la Argentina, ` +
`y en ${MGO.anio_ant}, ${n0(MGO.personas_ant)}. A mediados de ${MGO.anio} eran ${n1(MGO.personas / MGO.personas_ini)} veces las de ${MGO.desde}.`;
},
inflacion: v => {
if (v === "monto") return `Elegí un monto, el mes en que lo tenías y la región: la calculadora dice cuántos pesos de ${EIP.mes} hacen falta para comprar ` +
`lo mismo, según el índice de precios al consumidor del INDEC de esa región. Las series de las regiones empiezan en diciembre de 2016. Las regiones ` +
`del INDEC son grupos de ciudades donde se relevan los precios, no provincias.`;
if (v === "mes") return `En ${EIP.mes}, el índice de precios al consumidor del país ${cambioPct(EIP.mensual)} frente al mes anterior, según el INDEC. ` +
`Desde ${EIP.m_desde}, la suba de un mes más alta fue la de ${EIP.m_max_mes}, ${pct(EIP.m_max)}, y la más baja, la de ${EIP.m_min_mes}, ${pct(EIP.m_min)}.`;
if (v === "region") return `En los doce meses hasta ${EIP.mes}, los precios subieron más en ${REG_ART[EIP.reg_max[0]]}, ${pct(EIP.reg_max[1])}, y menos en ` +
`${REG_ART[EIP.reg_min[0]]}, ${pct(EIP.reg_min[1])}. En todo el país, ${pct(EIP.interanual)}. Las regiones del INDEC son grupos de ciudades donde se relevan ` +
`los precios, no provincias.`;
const dic = EIP.periodo.endsWith("-12");
return `En ${EIP.mes}, frente al mes anterior, el índice de precios al consumidor del país ${cambioPct(EIP.mensual)}, según el INDEC. ` + (dic ? "" : `En lo que va del año, ${cambioPct(EIP.en_el_anio)}, y en ${EIP.anio_ult}, de diciembre a diciembre, ` +
`la inflación fue de ${pct(EIP.anual)}. `) + `Desde ${EIP.ia_desde}, la variación en doce meses más alta fue la de ${EIP.ia_max_mes}, ${pct(EIP.ia_max)}, ` +
`y la más baja, la de ${EIP.ia_min_mes}, ${pct(EIP.ia_min)}. Por región, en los doce meses hasta ${EIP.mes}, los precios subieron de ${pct(EIP.reg_min[1])} en ${REG_ART[EIP.reg_min[0]]} a ${pct(EIP.reg_max[1])} en ${REG_ART[EIP.reg_max[0]]}.`;
},
"inflacion-rubros": v => {
if (v === "tu") return `Elegí la región y cuánto de tu gasto va a cada rubro: la calculadora dice cuánto subieron tus precios en los doce meses ` +
`hasta ${EIP.mes}. Arranca con los pesos que usa el INDEC en esa región, así da la inflación oficial: si gastás más en alquiler, transporte o ` +
`salud que lo que supone el índice, tu inflación puede ser otra. Los porcentajes no tienen que sumar 100: se reparten en proporción.`;
if (v === "categoria") return `En los doce meses hasta ${EIP.mes}, según el INDEC, los precios regulados ${cambioPl(EIP.regulados)}, los estacionales ${cambioPl(EIP.estacionales)} ` +
`y los demás, que forman la inflación núcleo, ${cambioPl(EIP.nucleo)}. Los regulados son los que están sujetos a regulación o tienen un alto componente de impuestos, y los estacionales, los que cambian con la temporada. ` +
`Los precios de los servicios ${cambioPl(EIP.servicios)} y los de los bienes, ${pct(EIP.bienes)}. El nivel ` +
`general, ${pct(EIP.interanual)}.`;
return `El rubro con la suba más baja fue ${inicialMin(EIP.div_min[0])}, ${pct(EIP.div_min[1])}, según el INDEC.` + (/^Alimentos/.test(EIP.div_max[0] + EIP.div_min[0]) ? "" :
` Los alimentos y las bebidas no alcohólicas ${cambioPl(EIP.div_alim)}.`) + ` El nivel general, ${pct(EIP.interanual)}.`;
},
canastas: v => {
const base = `La canasta básica total marca la línea de pobreza. El hogar de referencia del INDEC lo forman un varón de 35 años, una mujer de 31, ` +
`un hijo de 6 y una hija de 8. Para no quedar bajo la línea de indigencia, ese hogar del Gran Buenos Aires necesitaba ${n0(ECB.cba_hogar)} pesos ` +
`por mes en ${ECB.mes}, el valor de su canasta básica alimentaria. `;
if (v === "precios") return base + `En los doce meses hasta ${ECB.mes}, la canasta básica total ${cambioPct(ECB.ia_cbt)}, la alimentaria ${cambioPct(ECB.ia_cba)} ` +
`y el nivel general de precios del Gran Buenos Aires, ${pct(ECB.ia_ipc_gba)}.`;
return base + `El gráfico muestra la canasta por adulto equivalente, las necesidades de un varón adulto de actividad moderada: en ${ECB.reg_mes}, el último mes del informe semestral del INDEC, la canasta básica total iba de ` +
`${n0(ECB.reg_min[1])} pesos en ${REG_ART[ECB.reg_min[0]]} a ${n0(ECB.reg_max[1])} en ${REG_ART[ECB.reg_max[0]]}.`;
},
industria: v => {
if (v === "mineria") return `En ${IND.mes}, frente a ${IND.mes_ant}, la producción minera ${cambioPct(IND.min_ia)}, según el índice del INDEC. ` +
listaY(IND.grupos.map(([g, x], i) => `${i ? g.charAt(0).toLowerCase() + g.slice(1) : g} ${cambioPct(x)}`)) + ".";
const lado = x => `${pct(Math.abs(x))} ${x < 0 ? "por debajo" : "por encima"}`;
if (v === "mes") return `Sin el efecto de la época del año, en ${IND.ult_mes} la producción de la industria estaba ${lado(IND.ind_base)} de ` +
`${IND.base}, y la de la minería, ${lado(IND.min_base)}.`;
const rama = ([r, x]) => `${r.toLowerCase()}, ${pct(Math.abs(x))}`;
return `${IND.suben === 0 ? "Ninguna" : IND.suben} de las ${IND.n_ramas} ramas de la industria produjo más que en ${IND.mes_ant}. ` +
(IND.max[1] > 0 ? `La que más creció fue ${rama(IND.max)}` : `La que menos cayó fue ${rama(IND.max)}`) +
(IND.min[1] < 0 ? `, y la que más cayó, ${rama(IND.min)}.` : `, y la que menos creció, ${rama(IND.min)}.`) +
` En lo que va del año, la industria ${cambioPct(IND.acum)} frente a los mismos meses del año anterior.`;
},
socios: v => {
const S = SX.socios, sp = T.comercio_socios.find(r => r.tipo === "sin_pais");
const prim = k => [...S.top].sort((a, b) => b[k] - a[k]).slice(0, 3);
if (v === "exporta") { const [a, b, c] = prim("e");
return `Entre ${S.desde} y ${S.hasta}, el primer destino de las exportaciones de bienes fue ${a.n}, con ${n0(a.e)} millones de dólares, el ` +
`${pct(a.e / S.expo * 100)} del total. Le siguieron ${b.n} (${pct(b.e / S.expo * 100)}) ${yE(c.n)} (${pct(c.e / S.expo * 100)}). Otros ` +
`${n0(S.sin_pais)} millones, el ${pct(S.sin_pais_pct)}, se exportaron sin país informado, por el secreto estadístico.`; }
if (v === "importa") { const [a, b, c] = prim("i");
return `Entre ${S.desde} y ${S.hasta}, el primer origen de las importaciones de bienes fue ${a.n}, con ${n0(a.i)} millones de dólares, el ` +
`${pct(a.i / S.impo * 100)} del total. Le siguieron ${b.n} (${pct(b.i / S.impo * 100)}) ${yE(c.n)} (${pct(c.i / S.impo * 100)}).` +
(sp && sp.importaciones / S.impo >= .005 ? ` El ${pct(sp.importaciones / S.impo * 100)} no tiene país de origen informado.` : ""); }
return `Entre ${S.desde} y ${S.hasta}, la Argentina exportó ${n0(S.expo)} millones de dólares en bienes e importó ${n0(S.impo)} millones. ` +
`Con ${S.n_sup} de sus ${S.n} principales socios vendió más de lo que compró, y el mayor saldo a favor fue con ${S.sup[0]}: ${n0(S.sup[1])} millones. ` +
`El ${pct(S.sin_pais_pct)} de lo exportado no tiene país informado, así que lo vendido a cada país, y su saldo, pueden ser más altos que lo que se ve.`;
},
"socios-hist": v => {
const H = SX.socios_hist, imp = v !== "exporta", ser = imp ? H.importa : H.exporta, p1 = ser[0];
const clave = H.importa.reduce((m, x) => x.p1 - x.p0 > m.p1 - m.p0 ? x : m);
const parte = (k, xs = ser) => lista(xs.map(s => `${s.lab} ${pct(s[k])}`));
const base = `Parte de cada país en lo que ${imp ? "importó" : "exportó"} la Argentina: en ${H.desde}, ${parte("p0")}. ` +
`En ${H.anio}, ${imp ? parte("p1", ser.filter(s => s !== clave)) : parte("p1")}. `;
const alto = `El punto más alto de ${p1.lab} fue en ${p1.max[0]}, con el ${pct(p1.max[1])}.`;
if (imp) return base + (H.imp_pasa.length ? `${H.imp_1[1]} le vendió a la Argentina más que ${H.imp_1[0]} en ${lista(H.imp_pasa.map(String))}.` : alto);
return base + alto + ` Desde ${H.sin_pais_desde}, una parte de lo exportado no tiene país informado, por el secreto estadístico: el ${pct(H.sin_pais)} ` +
`en ${H.anio}, frente al ${pct(H.sin_pais_antes)} en ${H.sin_pais_desde - 1}.`;
},
crianza: v => {
const S = ECR.salario;
if (v === "salario") return `En ${S.mes}, criar a un chico de 6 a 12 años costaba ${n0(S.canasta)} pesos por mes: el ${pct(S.pais)} del salario bruto promedio ` +
`de un empleo privado registrado del país, ${n0(S.salario)} pesos. Solo los bienes y servicios, sin el tiempo de cuidado, eran el ${pct(S.bys_pais)}. ` +
`Por provincia va del ${pct(S.min_v)} en ${S.min} al ${pct(S.max_v)} en ${S.max}` +
(S.n_mitad ? `, y en ${S.n_mitad === 1 ? "una jurisdicción" : S.n_mitad + " jurisdicciones"} pasa de la mitad del salario. ` : ". ") +
"La canasta es la misma en todo el país: lo que cambia entre provincias es el salario.";
const caro = ECR.edades.reduce((m, e) => e.tot > m.tot ? e : m), barato = ECR.edades.reduce((m, e) => e.tot < m.tot ? e : m);
const base = `De los ${n0(ECR6.tot)} pesos que costaba en ${ECR.mes} criar a un chico de 6 a 12 años, ${n0(ECR6.bys)} eran bienes y servicios y ` +
`${n0(ECR6.cuid)}, el tiempo de cuidado. `;
if (v === "mes") return base + `Descontada la inflación, entre ${ECR.real_ini} y ${ECR.real_ult} la canasta ` +
listaY(ECR.edades.map(e => `de ${e.lab.toLowerCase().replace(/^de /, "")} ${cambioPct(e.real)}`)) + ".";
const parte = e => pct(e.cuid / e.tot * 100), E0 = ECR.edades[0];
const edad = e => e.lab.toLowerCase().replace(/^de /, "");
return base + (caro === ECR6 ? "Es la edad que más cuesta. La que menos, la de " : `La edad que más cuesta es la de ${edad(caro)}, ${n0(caro.tot)} pesos, y la que menos, la de `) +
`${edad(barato)}, con ${n0(barato.tot)} pesos. El cuidado es ${parte(E0)} del total en los menores de 1 año y ` +
`${parte(ECR6)} en los de 6 a 12.`;
},
"salario-real": () => `En el sector público, el salario registrado ${cambioPct(ESR.real_pub)} en los doce meses hasta ${ESR.mes}, descontada la inflación. Sin descontarla, ` +
`según el índice de salarios del INDEC, el privado ${cambioPct(ESR.nom_priv)} y el público ${pct(ESR.nom_pub)}, y los precios subieron ${pct(ESR.ipc)}. ` +
`Descontada la inflación, frente a ${ESR.base} el privado ` +
`está ${pct(Math.abs(ESR.vs_base_priv))} ${ESR.vs_base_priv < 0 ? "más bajo" : "más alto"} y el público, ${pct(Math.abs(ESR.vs_base_pub))} ` +
`${ESR.vs_base_pub < 0 ? "más bajo" : "más alto"}. El salario privado registrado más alto de la serie fue el de ${ESR.max_priv_mes} ` +
`y el más bajo, el de ${ESR.min_priv_mes}.`,
"socios-que": (v, [A, B, M]) => {
const vende = v === "vende", p = vende ? "e_" : "i_", K = vende ? SQ_RUB : SQ_USO, tot = d => vende ? d.exportaciones : d.importaciones, kilo = d => vende ? d.kilo_expo : d.kilo_impo;
const mayor = d => K.reduce((m, k) => (d[p + k.k] || 0) > (d[p + m.k] || 0) ? k : m), verbo = vende ? "le vendió" : "le compró";
const parte = d => `De lo que ${verbo} a ${d.pais}, el ${pct(d[p + mayor(d).k])} fueron ${mayor(d).lab.toLowerCase()}. `;
const kg = d => kilo(d) == null ? "sin dato" : `${n2(kilo(d))} dólares`;
return `En ${SQ.anio}, la Argentina ${verbo} ${n0(tot(A))} millones de dólares a ${A.pais}` + (A.codigo !== B.codigo ? ` y ${n0(tot(B))} millones a ${B.pais}. ` : ". ") +
parte(A) + (A.codigo !== B.codigo ? parte(B) : "") +
`Cada kilo ${vende ? "vendido" : "comprado"} valió ${kg(A)} con ${A.pais}` + (A.codigo !== B.codigo ? `, ${kg(B)} con ${B.pais}` : "") + ` y ${kg(M)} con todo el mundo.` +
(vende ? ` Hay ${n0(SQ.sin_e)} millones de dólares, el ${pct(SQ.sin_e_pct)} de lo exportado, sin país ni rubro informado por el secreto estadístico: con ellos, estas proporciones podrían ser otras.` : "");
},
"valor-kilo": v => {
if (v === "anual") return `Un kilo importado valió ${n2(VK.impo)} dólares en ${VK.anio}, ${n1(VK.veces)} veces lo que un kilo exportado. Eso no quiere decir que el mismo producto se venda barato y se compre caro: ` +
`el ${pct(VK.pct_kg)} de los kilos exportados son productos primarios y manufacturas agropecuarias, que pesan mucho y valen poco por kilo. La vista por rubro compara cada tipo de bien.`;
const u = T.comercio_valor_kilo.at(-1), punta = (K, p) => { const f = K.map(k => ({lab: k.lab.toLowerCase(), v: u[p + k.k]})).filter(d => d.v != null).sort((a, b) => b.v - a.v); return [f[0], f.at(-1)]; };
const [ea, eb] = punta(SQ_RUB, "expo_"), [ia, ib] = punta(SQ_USO, "impo_");
return `En ${VK.anio}, entre las exportaciones, el kilo que más valió fue el de ${ea.lab} (${n2(ea.v)} dólares) y el que menos, el de ${eb.lab} (${n2(eb.v)}). ` +
`Entre las importaciones, el de ${ia.lab} (${n2(ia.v)}) y el de ${ib.lab} (${n2(ib.v)}). Cada grupo reúne productos muy distintos: no es el precio de un producto.`;
},
"precio-consumo": v => {
const P = PCO[v], [art, cons] = PCO_N[v];
return `Entre ${P.ini} y ${P.fin}, descontada la inflación, el precio ${art} ${cambioPct(P.var_precio)} y ${cons} ${cambioPct(P.var_consumo)}. ` +
`En ${P.n_opuestos} de los ${P.n_anios} cambios de un año al otro, el precio y el consumo fueron en direcciones opuestas. ` +
"Son pocos años y el consumo depende también de los ingresos, de los gustos y de lo que cuestan otros productos: esto no alcanza para decir que el precio lo explica.";
},
mayoristas: v => (v === "nivel" ? `Desde ${EMY.desde}, los precios mayoristas se multiplicaron por ${n1(EMY.veces_ipim)}, los precios al consumidor por ${n1(EMY.veces_ipc)} ` +
`y el dólar mayorista por ${n1(EMY.veces_dolar)}. ` : `En los mismos doce meses, los precios al consumidor subieron ${pct(EMY.ia_ipc)} y el dólar mayorista, ${pct(EMY.ia_dolar)}. ` +
`Dentro de los mayoristas, los productos nacionales subieron ${pct(EMY.ia_nac)} y los importados, ${pct(EMY.ia_imp)}. `) +
`El aumento de los mayoristas de un mes va con el de los precios al consumidor de ${EMY.lag} meses después (correlación de ${n2(EMY.r_may_antes)}, ${fuerza(EMY.r_may_antes)}). ` +
`Al revés, el aumento de los precios al consumidor va menos con el de los mayoristas de ${EMY.lag} meses después (${n2(EMY.r_ipc_antes)}, ${fuerza(EMY.r_ipc_antes)}). ` +
"Que vayan juntos no prueba que uno cause el otro: los dos pueden responder a la misma inflación general.",
"sectores-empleo": v => {
const P = ESE[v], per = v === "uno" ? `Entre ${ESE.desde} y ${ESE.hasta}, frente a los doce meses anteriores` :
`Entre ${ESE.desde} y ${ESE.hasta}, frente a los mismos meses de diez años antes (${ESE.hace10_desde} a ${ESE.hace10_hasta})`;
return `El círculo claro es la actividad de cada sector y el lleno, sus asalariados registrados del sector privado. ${per}, la actividad de toda la economía ` +
`${cambioPct(P.act_pais)} y el empleo registrado privado ${cambioPct(P.emp_pais)}. ` +
(P.sin_empleo.length > 3 ? `En ${P.sin_empleo.length} de los ${ESE.n} sectores la actividad creció y el empleo registrado bajó. La distancia más grande está en ${lista(P.sin_empleo.slice(0, 3))}. `
: P.sin_empleo.length ? `La actividad creció y el empleo registrado bajó en ${lista(P.sin_empleo)}. ` : "En ningún sector creció la actividad mientras bajaba el empleo registrado. ") +
(P.sin_actividad.length ? `Al revés, el empleo creció y la actividad bajó en ${lista(P.sin_actividad)}. ` : "") +
"Que vayan en distinta dirección no dice por qué: puede ser un cambio de productividad, de empleo no registrado o de lo que produce cada sector.";
},
emae: v => {
if (v === "sector") return `En los doce meses hasta ${EMA.mes}, frente a los doce anteriores, crecieron ${EMA.sec_suben} de los 15 sectores de la economía, ` +
`según el INDEC. Los que más crecieron fueron ${EMA.sec_max[0]}, ${pct(EMA.sec_max[1])}, ${yE(EMA.sec_max2[0])}, ${pct(EMA.sec_max2[1])}. ` +
(EMA.sec_min[1] < 0 ? `El que más cayó fue ${EMA.sec_min[0]}, ${pct(-EMA.sec_min[1])}.` : `El que menos creció fue ${EMA.sec_min[0]}, ${pct(EMA.sec_min[1])}.`) +
` Toda la economía, ${pct(EMA.doce)}.`;
return `Frente al mes anterior y sin el efecto de la época del año, la actividad ${cambioPct(EMA.mensual_desest)}, ` +
`según el Estimador Mensual de Actividad Económica del INDEC. En lo que va del año ${cambioPct(EMA.en_el_anio.var)} ` +
`frente a los mismos meses del año anterior, y en los últimos doce meses, ${cambioPct(EMA.doce)}. En ${EMA.anio_ult}, ${cambioPct(EMA.anual)}.`;
},
combustibles: (p, v) => {
const nom = p === "gasoil" ? "el gasoil" : "la nafta súper", nomDe = p === "gasoil" ? "del gasoil" : "de la nafta súper", alto = CB[p + "_alto"], bajo = CB[p + "_bajo"];
if (v === "anio") {
const a = CB.anual_ult, ini = CB.anual_ini, maxA = CB[p + "_anual_max_anio"], minA = CB[p + "_anual_min_anio"], ps = x => `${n0(x)} pesos`;
const ext = [maxA !== a ? `el año más caro fue ${maxA}, con ${ps(CB[p + "_anual_max"])} por litro` : "",
minA !== a ? `el más barato fue ${minA}, con ${ps(CB[p + "_anual_min"])}` : ""].filter(Boolean);
return `En ${a}, el litro ${nomDe} costó en promedio ${ps(CB[p + "_anual"])} en el surtidor (el promedio de la mediana de cada mes)` +
(a === maxA ? `, el precio más alto desde ${ini}, descontada la inflación` : a === minA ? `, el precio más bajo desde ${ini}, descontada la inflación` : "") + "." +
(ext.length ? ` En pesos de ${a}, ${ext.join(", y ")}.` : "") +
(ini !== maxA && ini !== minA ? ` En ${ini}, el primer año completo de la serie, costaba ${ps(CB[p + "_anual_real_ini"])}.` : "");
}
const mx = CB[p + "_max_real_mes"];
if (v === "mes") return `En pesos de ${CB.mes}, el precio mediano ${nomDe} en el surtidor ${cambioPct((CB[p] / CB[p + "_ini_real"] - 1) * 100)} desde ${CB.ini}, ` +
`cuando costaba ${n0(CB[p + "_ini_real"])} pesos por litro${mx === CB.ini ? ", el precio más alto de la serie" : ""}.` +
(mx === CB.mes ? ` El precio de ${CB.mes} es el más alto de la serie.` : mx !== CB.ini ? ` El más alto fue el de ${mx}, con ${n0(CB[p + "_max_real"])} pesos.` : "");
return `En ${CB.mes}, el precio mediano ${nomDe} en el surtidor fue ${pct(Math.abs(CB[p + "_var"]))} ${CB[p + "_var"] >= 0 ? "más alto" : "más bajo"} que en ${CB.mes_antes}: ` +
`descontada la inflación, ${CB[p + "_var_real"] >= 0 ? "subió" : "bajó"} ${pct(Math.abs(CB[p + "_var_real"]))}. ` +
(p === "gasoil" ? `La mitad de las estaciones de servicio del país vendía ${nom} a más de ${n0(CB[p])} pesos por litro y la otra mitad, a menos. ` : "") +
`La mediana más alta fue la de ${alto[0]} (${n0(alto[1])} pesos por litro) y la más baja, la de ${bajo[0]} (${n0(bajo[1])}). ` +
`Las estaciones declaran con demora: ${CB.mes} es el último mes en el que declararon casi todas.`;
},
subsidios: v => {
const pbi = x => n2(x) + "%", y = e.sub_ytd;
const ytd = y ? ` Entre enero y ${MESES[y.mes - 1]} de ${y.anio}, descontada la inflación, sumaron un ${pct(Math.abs(y.var))} ${y.var < 0 ? "menos" : "más"} que en los mismos meses de ${y.anio - 1}.` : "";
const extremos = (a, maxA, maxV, minA, minV, f) => maxA !== a ? ` El más alto fue el de ${maxA}${maxA === e.sub_ini ? ", el primer año con dato" : ""}, con ${f(maxV)}` +
(minA !== a ? `, y el más bajo, el de ${minA}, con ${f(minV)}.` : ".") : minA !== a ? ` El más bajo fue el de ${minA}, con ${f(minV)}.` : "";
const ext = (a, maxA, maxV, minA, minV, f) => (a === minA ? `, el valor más bajo de la serie, que empieza en ${e.sub_ini}` : a === maxA ? `, el valor más alto de la serie, que empieza en ${e.sub_ini}` : "") + "." +
extremos(a, maxA, maxV, minA, minV, f);
const a = e.sub_pbi_anio, lugar = a === e.sub_pbi_min_anio ? "el más bajo" : a === e.sub_pbi_max_anio ? "el más alto" : "";
return v === "pesos"
? `En pesos de ${e.sub_ult}, los subsidios económicos a la energía que registra la Secretaría de Hacienda sumaron ${n0(e.sub_ult_real)} miles de millones en ${e.sub_ult}` +
ext(e.sub_ult, e.sub_real_max_anio, e.sub_real_max, e.sub_real_min_anio, e.sub_real_min, x => n0(x) + " miles de millones") + ytd
: (y ? `Entre enero y ${MESES[y.mes - 1]} de ${y.anio}, los subsidios económicos a la energía que registra la Secretaría de Hacienda sumaron un ` +
`${pct(Math.abs(y.var))} ${y.var < 0 ? "menos" : "más"} que en los mismos meses de ${y.anio - 1}, descontada la inflación. `
: "Los subsidios económicos a la energía son los que registra la Secretaría de Hacienda. ") +
`Como parte del producto interno bruto, ` + (lugar ? `el valor de ${a} es ${lugar} de la serie, que empieza en ${e.sub_ini}.` : `la serie empieza en ${e.sub_ini}.`) +
extremos(a, e.sub_pbi_max_anio, e.sub_pbi_max, e.sub_pbi_min_anio, e.sub_pbi_min, x => "el " + pbi(x));
},
"gas-consumo": v => {
if (v === "mes") return `Entre ${e.gas_est_desde} y ${e.gas_est_hasta}, un usuario residencial consumió en promedio ${n0(e.gas_mes_max_m3)} metros cúbicos de gas en ${e.gas_mes_max} ` +
`y ${n0(e.gas_mes_min_m3)} en ${e.gas_mes_min}: ${n1(e.gas_mes_max_m3 / e.gas_mes_min_m3)} veces más en el mes de mayor consumo.` +
(e.gas_ytd ? ` Entre enero y ${MESES[e.gas_ytd.mes - 1]} de ${e.gas_ytd.anio} consumió ${n0(e.gas_ytd.m3)} metros cúbicos, ${pct(Math.abs(e.gas_ytd.var))} ${e.gas_ytd.var < 0 ? "menos" : "más"} que en los mismos meses de ${e.gas_ytd.anio - 1}.` : "");
if (v === "serie") return `Entre ${e.gas_ini} y ${e.gas_anio}, el consumo promedio de gas de un usuario residencial ${cambioPct((e.gas_pais / e.gas_pais_ini - 1) * 100)}. ` +
`En ${e.gas_ini} era de ${n0(e.gas_pais_ini)} metros cúbicos por año. ` +
`El año de mayor consumo fue ${e.gas_max_anio}, con ${n0(e.gas_max)}, y el de menor, ${e.gas_min_anio}, con ${n0(e.gas_min)}. ` +
`En el mismo período, los usuarios residenciales pasaron de ${n1(e.gas_usuarios_ini / 1e6)} a ${n1(e.gas_usuarios / 1e6)} millones.`;
const t = e.gas_top;
return `En ${e.gas_anio}, un usuario residencial de ${t[0][0]} consumió en promedio ${n0(t[0][1])} metros cúbicos de gas natural, ${n1(e.gas_veces_top)} veces el promedio del país, ` +
`y uno de ${e.gas_bajo[0]}, ${n0(e.gas_bajo[1])}, el valor más bajo. Las cinco provincias patagónicas tenían el ${pct(e.gas_pat_usuarios)} de los usuarios residenciales ` +
`y consumieron el ${pct(e.gas_pat_gas)} del gas residencial.` +
(e.gas_ytd ? ` Entre enero y ${MESES[e.gas_ytd.mes - 1]} de ${e.gas_ytd.anio}, el consumo por usuario del país ${e.gas_ytd.var < 0 ? "bajó" : "subió"} ${pct(Math.abs(e.gas_ytd.var))} frente a los mismos meses de ${e.gas_ytd.anio - 1}.` : "") +
(e.gas_chicas.length ? ` ${lista(e.gas_chicas.map(([p]) => p))} ${e.gas_chicas.length > 1 ? "quedan" : "queda"} afuera por tener menos de ${n0(e.gas_min_usuarios)} usuarios residenciales.` : "") +
(e.gas_sin.length ? ` ${lista(e.gas_sin)} no ${e.gas_sin.length > 1 ? "figuran" : "figura"} en los datos de las distribuidoras.` : "");
},
centrales: v => v === "potencia"
? `En ${e.pot_anio}, las centrales del país tenían ${n0(e.pot_total)} megavatios de potencia instalada: ${pct(e.pot_pct.termica)} térmica, ${pct(e.pot_pct.hidraulica)} hidroeléctrica, ` +
`${pct(e.pot_pct.nuclear)} nuclear, ${pct(e.pot_pct.eolica)} eólica y ${pct(e.pot_pct.solar)} solar. La potencia es la capacidad de generación de las centrales, no la electricidad que generan en el año. ` +
`La eólica y la solar sumaban ${n0(e.pot_renov_ult)} megavatios, contra ${n0(e.pot_renov_ini)} en ${e.pot_ini}.`
: `El listado de centrales de la Secretaría de Energía, actualizado en ${e.cen_fecha}, tiene ${n0(e.cen_n)} centrales: ${n0(e.cen_tec["Térmica"])} térmicas, ` +
`${n0(e.cen_tec["Solar"])} solares, ${n0(e.cen_tec["Eólica"])} eólicas, ${n0(e.cen_tec["Hidroeléctrica"])} hidroeléctricas, ${n0(e.cen_tec["Biomasa y biogás"])} de biomasa o biogás ` +
`y ${n0(e.cen_tec["Nuclear"])} nucleares. La provincia con más centrales eólicas es ${e.cen_top_eol[0]} (${n0(e.cen_top_eol[1])}) y la que tiene más solares, ` +
`${e.cen_top_sol[0]} (${n0(e.cen_top_sol[1])}).`,
"obra-publica": v => v === "serie"
? `En pesos de ${CN.op_ult}, la Nación invirtió ${n0(CN.op_total)} mil millones en obra pública en ${CN.op_ult}: ${n0(CN.op_obras)} mil millones en obras propias y ${n0(CN.op_transf)} mil millones en transferencias de capital a provincias y municipios. ` +
`El máximo de la serie fue en ${CN.op_max_anio}, con ${n0(CN.op_max)} mil millones, y el mínimo, en ${CN.op_min_anio}, con ${n0(CN.op_min)} mil millones.` +
(CN.op_min_anio !== CN.op_ult - 1 ? ` En ${CN.op_ult - 1} había sido de ${n0(CN.op_ant)} mil millones.` : "")
: `En ${CN.op_ult}, la obra pública de la Nación con provincia asignada sumó ${n0(CN.op_hab_pais)} pesos por habitante. ${CN.op_top[0]} recibió la mayor inversión por habitante, ${n0(CN.op_top[1])} pesos${conVeces(CN.op_top[1], CN.op_hab_pais)}, ` +
`y ${CN.op_bajo[0]} la menor, ${n0(CN.op_bajo[1])}${conVeces(CN.op_bajo[1], CN.op_hab_pais)}. La Dirección Nacional de Vialidad ejecutó el ${pct(CN.op_vialidad_pct)} de las obras propias de la Nación, y el ${pct(CN.op_sin_pct)} de esas obras no tiene una provincia asignada.`,
insumos: v => v === "var_ytd"
? `Entre enero y ${CN.ins_mes}, el consumo aparente subió en ${T.isac_insumos.filter(r => r.var_ytd > 0).length} de los ${CN.ins_n} insumos que sigue el ISAC frente a los mismos meses del año anterior. ` +
`El que más creció fue ${NOMBRE_INS([...T.isac_insumos].sort((a, b) => b.var_ytd - a.var_ytd)[0].territorio)} (${masPct(d3.max(T.isac_insumos, r => r.var_ytd))}) y el que más cayó, ${NOMBRE_INS([...T.isac_insumos].sort((a, b) => a.var_ytd - b.var_ytd)[0].territorio)} (${masPct(d3.min(T.isac_insumos, r => r.var_ytd))}).`
: `En los doce meses hasta ${CN.ins_mes}, frente a los doce anteriores, el insumo que más creció fue ${NOMBRE_INS(CN.ins_top)} (${masPct(CN.ins_top_v)}) y el que más cayó, ${NOMBRE_INS(CN.ins_low)} (${masPct(CN.ins_low_v)}). El consumo aparente de cemento portland ${creceCae(CN.cemento_12m)}.`,
};
const RO = R.rotacion, trim = t => `${["primer", "segundo", "tercer", "cuarto"][t[1] - 1]} trimestre de ${t[0]}`;
const DIST = R.distorsiones || {};
const aclara = (clave, terr) => DIST[clave]?.[terr]?.accion === "aclarar" ? ` (${DIST[clave][terr].motivo})` : "";
const notaDist = (c, cod) => { const d = c.dist && DIST[c.dist]?.[NOMBRES[cod]], a = c.otroAnio?.[NOMBRES[cod]];
return [d ? d.corto || d.motivo : "", a ? `Dato de ${a}, el último que publicó.` : ""].filter(Boolean).join(" "); };
const sinContar = (clave, terrs) => terrs.length ? `, sin contar ${terrs.join(" y ")}: ${terrs.map(t => DIST[clave][t].motivo).join(". ")}` : "";
const TX = {
isac: `Entre enero y ${MESES[CN.isac_ytd.mes - 1]} de ${CN.isac_ytd.anio}, la actividad de la construcción medida por el ISAC ${creceCae(CN.isac_ytd.var)} contra los mismos meses de ${CN.isac_ytd.anio - 1}. ` +
`Sin el efecto de la estacionalidad, ${creceCae(CN.isac_mes_desest)} frente al mes anterior y ${creceCae(CN.isac_3m)} entre ${CN.isac_3m_desde} y ${CN.isac_mes} contra los tres meses anteriores. ` +
`El índice sin estacionalidad está ${pct(Math.abs(CN.isac_dif_max))} ${CN.isac_dif_max < 0 ? "por debajo" : "por encima"} del máximo de la serie, de ${CN.isac_max_mes}.`,
permisos: `Entre enero y ${MESES[CN.per_ytd.mes - 1]} de ${CN.per_ytd.anio}, la superficie autorizada ${creceCae(CN.per_ytd.var)} contra los mismos meses de ${CN.per_ytd.anio - 1}, ` +
`y en los últimos doce meses, con ${n1(CN.per_12m)} millones de metros cuadrados, ${creceCae(CN.per_12m_var)} contra los doce anteriores.`,
hipotecas: (CN.hip_var != null ? `Descontada la inflación, los créditos hipotecarios UVA de ${CN.hip_mes} fueron ${pct(Math.abs(CN.hip_var))} ` +
`${CN.hip_var < 0 ? "menos" : "más"} que los del mismo mes del año anterior. ` : "") +
`La tasa promedio fue de ${n1(CN.hip_tasa)}% anual más la actualización de la UVA. El mes con más créditos fue ${CN.hip_max_mes}, con ${n0(CN.hip_max)} mil millones en pesos de ${CN.hip_mes}. ` +
`En todo ${CN.hip_anio} sumaron ${n0(CN.hip_anual)} mil millones` + (CN.hip_anual_max_anio !== CN.hip_anio ? `, contra ${n0(CN.hip_anual_max)} mil millones en ${CN.hip_anual_max_anio}, el año con más créditos,` : `, el año con más créditos,`) +
` y ${n0(CN.hip_anual_min)} mil millones en ${CN.hip_anual_min_anio}, el año con menos.`,
"obra-publica": LEAD["obra-publica"]("prov"),
insumos: LEAD.insumos("var_12m"),
"gas-consumo": LEAD["gas-consumo"]("prov"),
centrales: LEAD.centrales("mapa"),
subsidios: LEAD.subsidios("pbi"),
productividad: LEAD.productividad("pozo"),
costo: `En los doce meses hasta ${CN.costo_mes}, el costo de construir en el Gran Buenos Aires subió ${pct(CN.icc_12)} y los precios al consumidor, ${pct(CN.ipc_12)}. Los materiales subieron ${pct(CN.mat_12)} y la mano de obra, ${pct(CN.mo_12)}.`,
vivienda: VIV_IND.pct_alquila.t(),
petroleo: LEAD["petroleo"]("tipo"),
gas: LEAD["gas"]("tipo"),
"gas-hogares": LEAD["gas-hogares"](),
"hidro-provincias": LEAD["hidro-provincias"]("pet_kbd"),
"areas-hidro": LEAD["areas-hidro"]("pet"),
"empresas-hidro": LEAD["empresas-hidro"]("pct_pet"),
"empleo-hidro": LEAD["empleo-hidro"](),
regalias: LEAD["regalias"]("pct_regalias"),
reservas: LEAD["reservas"]("pet"),
"balanza-energetica": LEAD["balanza-energetica"](),
"mundo-petroleo": LEAD["mundo-petroleo"]("crudo_kbd"),
"exporta-rubros": `La agroindustria, es decir las manufacturas de origen agropecuario, fue el ${pct(SX.rubros.pct.moa)} de lo exportado en ${SX.rubros.anio}, ` +
`la industria, el ${pct(SX.rubros.pct.moi)}, los productos primarios, el ${pct(SX.rubros.pct.primarios)}, y la energía, el ${pct(SX.rubros.pct.combustibles)}` +
(SX.rubros.max_anio !== SX.rubros.anio ? `. El año con más exportaciones de la serie fue ${SX.rubros.max_anio}, con ${n0(SX.rubros.max)} millones de dólares.` : `, en el año con más exportaciones de la serie.`) +
(SX.rubros.ytd_var != null ? ` Entre enero y ${MESES[SX.rubros.ytd_mes - 1]} de ${SX.rubros.ytd_anio} se exportaron ${n0(SX.rubros.ytd)} millones, un ${pct(Math.abs(SX.rubros.ytd_var))} ${SX.rubros.ytd_var >= 0 ? "más" : "menos"} que en los mismos meses del año anterior.` : ""),
"complejos": (() => { const C = SX.complejos, el = n => "el " + n.charAt(0).toLowerCase() + n.slice(1);
return `Los que más exportaron en el ${C.periodo} fueron ${lista(C.top.slice(0, 4).map(x => `${el(x.n)} (${pct(x.pct)})`))}. ` +
`Entre los sectores y los complejos que vendieron más de 500 millones de dólares, el que más creció frente al mismo período del año anterior fue ${el(C.crece.n)}: ${conSigno(C.crece.var)}.`; })(),
"exprov": (() => { const P = SX.provincias, NOM = {primarios: "productos primarios", manufacturas_agro: "manufacturas de origen agropecuario",
manufacturas_industriales: "manufacturas de origen industrial", combustibles_energia: "combustibles y energía"};
const orden = Object.entries(P.principal).sort((a, b) => b[1] - a[1]);
return `Si se clasifica a cada jurisdicción por el rubro que más pesó en sus exportaciones de ${P.anio}, hay ${lista(orden.map(([k, n], i) => `${n} ${i === 0 ? (n === 1 ? "provincia " : "provincias ") : ""}de ${NOM[k]}`))}.`; })(),
"balanza": (() => { const B = SX.balanza, d = B.deficit_anios;
return `En ${B.anio}, la Argentina exportó ${n0(B.expo)} millones de dólares en bienes e importó ${n0(B.impo)} millones: el saldo fue de ${saldoTx(B.saldo)}. ` +
(d.length ? `Desde ${B.desde}, las importaciones superaron a las exportaciones en ${d.length} ${d.length === 1 ? "año" : "años"}, el último en ${d[d.length - 1]}. ` : "") +
`El saldo más alto de la serie fue el de ${B.saldo_max_anio}, con ${n0(B.saldo_max)} millones.` +
(B.ytd_anio > B.anio ? ` Entre enero y ${MESES[B.ytd_mes - 1]} de ${B.ytd_anio}, meses que el gráfico todavía no muestra porque el año está incompleto, las exportaciones ${subioBajo(B.ytd_expo_var, "crecieron", "cayeron")} ` +
`y las importaciones ${subioBajo(B.ytd_impo_var, "crecieron", "cayeron")} frente a los mismos meses del año anterior.` : ""); })(),
"importaciones": (() => { const I = SX.importaciones, p = I.pct;
return `En ${I.anio}, el ${pct(p.intermedios)} de lo importado fueron bienes intermedios, los insumos que se transforman en el país, el ${pct(p.piezas)} piezas y accesorios ` +
`y el ${pct(p.capital)} bienes de capital, como máquinas y equipos. Los bienes de consumo fueron el ${pct(p.consumo)} y los autos, el ${pct(p.vehiculos)}. ` +
`Frente al año anterior, las compras de bienes de consumo ${subioBajo(I.consumo_var, "crecieron", "cayeron")} y las de autos ${subioBajo(I.vehiculos_var, "crecieron", "cayeron")}. ` +
`Las de combustibles tuvieron su máximo en ${I.comb_max_anio}, con ${n0(I.comb_max)} millones de dólares, y en ${I.anio} fueron el ${pct(p.combustibles)} del total.`; })(),
"origen": (() => { const O = SX.origen, t = O.top, x = t.filter(o => o.var != null);
const sube = [...x].sort((a, b) => b.var - a.var)[0], baja = [...x].sort((a, b) => a.var - b.var)[0];
const s = sube && sube.var > 0 ? `${sube.n} (${conSigno(sube.var)})` : "", b = baja && baja.var < 0 ? `${baja.n} (${conSigno(baja.var)})` : "";
return `Después de ${t[0].n} vinieron ${t[1].n} (${pct(t[1].pct)}) ${yE(t[2].n)} (${pct(t[2].pct)}). ` +
`En total se importaron ${n0(O.total)} millones de dólares, ${subioBajo(O.var, "un", "un")} ${O.var >= 0 ? "más" : "menos"} que en los mismos meses del año anterior.` +
(s || b ? ` Entre los cinco primeros orígenes, las compras que más ${s ? "crecieron" : "cayeron"} fueron las de ${s || b}` + (s && b ? ` y las que más cayeron, las de ${b}` : "") + "." : ""); })(),
socios: LEAD.socios("saldo"),
"socios-hist": LEAD["socios-hist"]("importa"),
"cuenta-corriente": (() => { const C = SX.cuenta_corriente, s = C.superavit_anios;
return `En ${C.anio}, el comercio de bienes dejó un saldo de ${saldoTx(C.bienes)}, los servicios, de ${saldoTx(C.servicios)}, el ingreso primario (intereses, utilidades y dividendos), de ${saldoTx(C.primario)} ` +
`y las transferencias, de ${saldoTx(C.secundario)}. El saldo de bienes no coincide con el de la primera ficha porque el balance de pagos los registra y los valúa de otra manera. ` +
(s.length ? `Desde ${C.desde}, la cuenta corriente tuvo superávit en ${s.length} ${s.length === 1 ? "año" : "años"}: ${lista(s.map(String))}.` : `Desde ${C.desde}, la cuenta corriente no tuvo superávit en ningún año.`) +
(C.trim ? ` En el ${trimTx(C.trim)}, el último publicado, el saldo fue de ${saldoTx(C.trim_total)}.` : ""); })(),
"corte-casos": `En ${R.justicia.corte.hasta} llegaron a la Corte Suprema ${n0(R.justicia.corte.ingresados)} casos, ${n1(R.justicia.corte.veces_ingresados)} veces ` +
`los de ${R.justicia.corte.desde}, y la Corte resolvió ${n0(R.justicia.corte.resueltos)} con ${n0(R.justicia.corte.fallos)} fallos: un fallo puede cerrar varios casos iguales a la vez. El ${pct(R.justicia.corte.previsional_pct)} de los casos que llegaron fue a la secretaría que trata los temas previsionales, como jubilaciones y pensiones. ` +
(R.justicia.corte.saldo_desde ? `Desde ${R.justicia.corte.saldo_desde} llegan cada año más casos de los que se resuelven: entre ${R.justicia.corte.saldo_desde} y ` +
`${R.justicia.corte.hasta} entraron ${n0(R.justicia.corte.saldo)} casos más de los que se resolvieron. ` : "") +
`El año con más casos resueltos fue ${R.justicia.corte.max_res_anio}, con ${n0(R.justicia.corte.max_res)}, y el de menos, ${R.justicia.corte.min_res_anio}, ` +
`con ${n0(R.justicia.corte.min_res)}.`,
"jueces-federales": (() => { const F = R.justicia.federal;
return `En ${F.fecha}, la Justicia Federal tenía ${n0(F.cargos)} cargos de juez en ${n0(F.organos)} juzgados, cámaras y tribunales orales que funcionan. De los cargos sin titular, ${n0(F.subrogante)} están ` +
`cubiertos por un subrogante: otro juez, un conjuez o un secretario designado para reemplazar al titular. Los otros ${n0(F.sin_cubrir)} no tienen a nadie designado. ` +
`En ${F.fecha_ant}, el ${pct(F.pct_sin_titular_ant)} de los cargos estaba sin titular. Por habitante, ${F.max.territorio} tiene ${n1(F.max.valor)} cargos cada 100.000 ` +
`habitantes` + (F.max.codigo === "02" ? `, porque ahí están también los tribunales federales que atienden casos de todo el país,` : "") +
` y ${F.min.territorio}, ${n1(F.min.valor)}. El promedio del país es ${n1(F.cada_100mil)}.`; })(),
"fiscalias-federales": (() => { const M = R.justicia.mp, f = T.fiscalias_defensorias_federales,
tot = d => d.fiscalias_cada_100mil + d.defensorias_cada_100mil,
mx = f.reduce((a, d) => tot(d) > tot(a) ? d : a), mn = f.reduce((a, d) => tot(d) < tot(a) ? d : a);
return `Las fiscalías investigan los delitos federales y acusan. Las defensorías públicas oficiales defienden a quien no tiene un abogado particular. Cada fiscalía o defensoría puede tener más de un cargo. ` +
`En ${M.fecha}, ${n0(M.fiscalias_cargos_sin_titular)} de los ${n0(M.fiscalias_cargos)} cargos de fiscal no tenían titular, y ${n0(M.defensorias_cargos_sin_titular)} ` +
`de los ${n0(M.defensorias_cargos)} cargos de defensor. Sumando fiscalías y defensorías, ${mx.territorio} tiene ${n1(tot(mx))} cada 100.000 habitantes y ${mn.territorio}, ${n1(tot(mn))}.`; })(),
"cortes-provinciales": (() => { const P = R.justicia.prov, v = P.cortes_vacantes.map((c, i) => `el de ${c.territorio}${i ? "," : " tenía ocupados"} ${c.ministros} de ${c.ley}`);
const lista = v.length > 1 ? v.slice(0, -1).join(", ") + " " + yE(v.at(-1)) : v[0] || "";
return `En ${P.cortes_ley} de los 24 máximos tribunales se pudo leer en la ley cuántos lugares tienen. De ellos, ${P.cortes_completas} tenían todos sus lugares ocupados ` +
`al 31 de octubre de ${P.anio}` + (lista ? `. ${lista.replace(/^el/, "El")}` : "") +
`. De las ${n0(P.ministros)} personas que integraban los máximos tribunales de las provincias y de CABA, ${n0(P.ministras)} eran mujeres. La Corte Suprema de la Nación tiene hoy ` +
`${R.corte.hoy.length} de los ${R.corte.ley_hoy} jueces que fija la ley.`; })(),
"justicia-provincial": (() => { const P = R.justicia.prov;
return `Las justicias de las provincias y de CABA sumaban ${n0(P.magistratura)} jueces, ${n0(P.fiscales)} fiscales y ${n0(P.defensores)} defensores, sin contar la justicia federal. Por habitante, ` +
`${P.max.magistratura.territorio} tiene la cifra más alta de jueces, ${n1(P.max.magistratura.valor)} cada 100.000 habitantes, y ${P.min.magistratura.territorio} ` +
`la más baja, ${n1(P.min.magistratura.valor)}. La diferencia depende en parte de cuántos juzgados de paz tiene cada provincia` + (P.min.magistratura.territorio === "CABA" ? `. En CABA, además, la mayor parte de la justicia ordinaria es la Justicia Nacional, que este conteo no incluye` : "") + `. En fiscales, el promedio del ` +
`país${P.mp_unico.length ? `, sin ${P.mp_unico.map(m => m.territorio).join(" ni ")},` : ""} es ${n1(P.pais.fiscales)} cada 100.000 habitantes, y en defensores, ${n1(P.pais.defensores)}.`; })(),
"mujeres-congreso": `Hoy hay ${MJC.diputadas} diputadas en ${MJC.dip_bancas} bancas (${pct(MJC.dip)}) y ${MJC.senadoras} senadoras en ${MJC.sen_bancas} ` +
`(${pct(MJC.sen)}). Por provincia, contando sus diputados y sus senadores, la parte de mujeres va de ${pct(MJC.min[1])} en ${MJC.min[0]} a ` +
`${pct(MJC.max[1])} en ${MJC.max[0]}. Las delegaciones chicas cambian mucho con una sola banca.`,
"mujeres-congreso-serie": `En ${MJC.ini}, las mujeres tenían el ${pct(MJC.dip_ini)} de las bancas de Diputados y el ${pct(MJC.sen_ini)} del Senado. ` +
`La ley de cupo de 1991 obligó a poner al menos un 30% de mujeres en lugares con chances en las listas, y desde la elección de 1993 ` +
`la parte de diputadas creció (${pct(MJC.dip_93)} en 1993). En el Senado el salto llegó en 2001, con la primera elección directa. Desde ` +
`2019 rige la ley de paridad, que obliga a alternar mujeres y varones en las listas. Hoy, ${pct(MJC.dip)} en Diputados y ${pct(MJC.sen)} en el Senado.`,
"tarifa-luz": LEAD["tarifa-luz"]("250"),
transito: `De ${TRN.desde} a ${TRN.hasta} murieron en el país unas ${n0(TRN.por_anio)} personas por año en siniestros viales, según el SNIC: ` +
`${n1(TRN.pais)} cada 100.000 habitantes. La tasa más baja es la de ${TRN.min}, ${n1(TRN.min_v)}, y la más alta es ${n1(TRN.veces)} veces esa.`,
"transito-serie": `En ${TRN.ult} murieron ${n0(TRN.ult_v)} personas en siniestros viales en el país, según el SNIC. Desde ${TRN.serie_desde}, el año con más ` +
`muertes fue ${TRN.serie_max}, con ${n0(TRN.serie_max_v)}, y el de menos, ${TRN.serie_min}, con ${n0(TRN.serie_min_v)}.`,
"causas-muerte": `Ajustada por edad, la mortalidad va de ${n0(CM.min_v)} muertes por año cada 100.000 habitantes en ${CM.min} a ${n0(CM.max_v)} en ${CM.max}. ` +
`Sin ajustar por edad, la más alta es la de ${CM.bruta_max} (${n0(CM.bruta_max_v)}${CM.bruta_max === EV.max ? ", con la población más envejecida" : ""})` +
` y la más baja, la de ${CM.bruta_min} (${n0(CM.bruta_min_v)}${CM.bruta_min === EV.min ? ", la más joven" : ""}). ` +
`Por causa, después de ${CM_FRASE[CMG[0].k]} vienen ${CM_FRASE[CMG[1].k]} (${pct(CMG[1].pct)} de las muertes) ${yE(CM_FRASE[CMG[2].k])} (${pct(CMG[2].pct)}).`,
"chicos-escuela": `En ${ESC.anio} hay ${n1(ESC.hoy / 1e6)} millones de chicos de 5 a 14 años en el país. Según las proyecciones del INDEC, en ${ESC.anio_fin} van a ser ` +
`${n1(ESC.fin / 1e6)} millones, unos ${n0(Math.round(Math.abs(ESC.var) / 1000) * 1000)} ${ESC.var < 0 ? "menos" : "más"}. ` +
(ESC.suben.length ? `Suben solo en ${lista(ESC.suben)}. ` : ESC.n_bajan === 24 ? "Bajan en las 24 jurisdicciones. " : "") +
`La que más ${ESC.min_v < 0 ? "baja" : "sube"} en proporción es ${ESC.min_v < 0 ? ESC.min : ESC.max} (${conSigno(ESC.min_v < 0 ? ESC.min_v : ESC.max_v)}) ` +
`y la que menos ${ESC.max_v < 0 ? "baja" : "cambia"}, ${ESC.max} (${conSigno(ESC.max_v)}). ` +
`Los chicos de 5 a 14 años de ${ESC.anio_fin} son los que nazcan entre ${ESC.nacen_desde} y ${ESC.nacen_hasta}. ` +
`Entre ${nac.anio_pico} y ${nac.anio_ult} los nacimientos ya bajaron ${pct(Math.abs(nac.caida))}, según las estadísticas vitales de la DEIS.`,
"poblacion-proy": (PPY.pierden.length === 1 && PPY.pierden[0] === PPY.min
? `${PPY.min} es la única jurisdicción que pierde habitantes hasta ${PPY.anio_fin}: unas ${n0(Math.round(Math.abs(PPY.min_personas) / 1000) * 1000)} personas menos que en ${PPY.anio} (${conSigno(PPY.min_v)}). `
: PPY.pierden.length ? `Pierden habitantes hasta ${PPY.anio_fin} ${lista(PPY.pierden)}. La que más pierde en proporción es ${PPY.min} (${conSigno(PPY.min_v)}). `
: `Todas las jurisdicciones suman habitantes hasta ${PPY.anio_fin}. La que menos crece es ${PPY.min} (${conSigno(PPY.min_v)}). `) +
`La que más crece en proporción es ${PPY.max} (${conSigno(PPY.max_v)}). ` +
(PPY.debajo.length ? `${lista(PPY.debajo)} ${PPY.debajo.length > 1 ? "crecen" : "crece"} menos que el país, así que ${PPY.debajo.length > 1 ? "pierden" : "pierde"} peso en el total` +
(PPY.debajo.includes("Buenos Aires") && PPY.pba_pct_fin < PPY.pba_pct_hoy ? `. La provincia de Buenos Aires pasa de tener el ${pct(PPY.pba_pct_hoy)} de los habitantes del país al ${pct(PPY.pba_pct_fin)}.` : ".") : ""),
empresas: `Cada 1.000 habitantes, ${EM.top} tenía ${n1(EM.top_v)} empresas privadas con empleados${conVeces(EM.top_v, EM.pais_1000)} y ${EM.low}, ${n1(EM.low_v)}${conVeces(EM.low_v, EM.pais_1000)}.`,
dinamica: `En ${EM.ult}, la tasa de entrada, las empresas que abrieron sobre todas las activas en el año, fue de ${pct(EM.te)}, y la de salida, las que cerraron, de ${pct(EM.ts)}. Acá cada empresa cuenta una sola vez, en la provincia donde declara más personal. ` +
`El cambio neto fue ${EM.neta >= 0 ? "positivo" : "negativo"}, de ${n1(Math.abs(EM.neta))} puntos, y ${EM.positivas < 12 ? "solo " : ""}${EM.positivas === 1 ? "una jurisdicción tuvo" : EM.positivas + " jurisdicciones tuvieron"} más aperturas que cierres. ` +
`La tasa de entrada más alta de la serie fue de ${pct(EM.te_max)}, en ${EM.te_max_anio}. Desde ${EM.ini}, cerraron más empresas de las que abrieron en ${EM.anios_negativos} años.`,
rotacion: `Entre el ${trim(RO.desde)} y el ${trim(RO.hasta)}, el ${pct(RO.total_largo)} de las personas asalariadas llevaba más de cinco años en su empleo. ` +
`Llevar un año o menos es más común entre quienes tienen menos de 25 años (${pct(RO.jovenes)}), en los empleos sin descuento jubilatorio (${pct(RO.sin_desc)}, contra ${pct(RO.con_desc)} en los registrados) y en los hogares del quintil de menores ingresos (${pct(RO.q1)}, contra ${pct(RO.q5)} en el de mayores ingresos). ` +
`Según el tipo de trabajo, es más común en el empleo privado (${pct(RO.privado)}) que en el estatal (${pct(RO.estatal)}), en los lugares donde trabajan hasta cinco personas (${pct(RO.chico)}, contra ${pct(RO.grande)} donde trabajan más de 40) y en las tareas no calificadas (${pct(RO.no_calif)}, contra ${pct(RO.profesional)} en las profesionales).`,
piramide: `En ${PI.anio}, la mitad de la población del país tiene menos de unos ${PI.edad_mediana_hoy} años: es la edad mediana. Según las proyecciones del INDEC, en ${PI.anio_fin} esa edad mediana llegará a unos ${PI.edad_mediana_fin} años y los menores de 15 pasarán de ser el ${pct(PI.menores15_hoy)} al ${pct(PI.menores15_fin)} de la población. La base de la pirámide se angosta porque nacen menos chicos y la parte de arriba se ensancha porque se vive más.`,
"pensiones-invalidez": `En ${MESES[PIN.prov_mes - 1]} de ${PIN.prov_anio} había ${n1(PIN.pais_cada_1000)} pensiones no contributivas por invalidez cada 1.000 habitantes en el país. ` +
`${PIN.top} tenía la proporción más alta, ${n1(PIN.top_v)} cada 1.000, y ${PIN.low} la más baja, ${n1(PIN.low_v)}. La provincia de Buenos Aires tenía el ${pct(PIN.pba_pct)} de todas las pensiones.`,
desempleo: DS ? `En ${MESES[DS.prov_mes - 1]} de ${DS.prov_anio} cobraban el seguro de desempleo ${n1(DS.pais_1000)} de cada 1.000 habitantes del país. ` +
`${DS.top} tenía la proporción más alta, ${n1(DS.top_v)} cada 1.000, y ${DS.low} la más baja, ${n1(DS.low_v)}. La provincia de Buenos Aires tenía el ${pct(DS.pba_pct)} de los beneficiarios.` : "",
auh: `En ${MESES[AU.mes - 1]} de ${AU.anio}, ${n0(AU.beneficios)} chicos recibían la AUH, ${n1(AU.pais_100)} cada 100 menores de 18 años. La cobraban ${n0(AU.titulares)} ` +
`titulares. ${AU.top} tenía la proporción más alta, ${n1(AU.top_v)} cada 100, y ${AU.low} la más baja, ${n1(AU.low_v)}.`,
haberes: `En ${HB.anio}${HB.meses < 12 ? `, hasta ${MESES[HB.meses - 1]},` : ""} el haber mínimo de ANSES con los refuerzos que se pagan aparte equivalía al ${pct(HB.pct_min_ad)} del salario ` +
`promedio de los asalariados registrados, y sin ellos, al ${pct(HB.pct_min)}. La jubilación promedio, al ${pct(HB.pct_jub)}. Desde ${HB.ini}, el haber mínimo con refuerzos ` +
`llegó a su punto más alto en ${HB.max_pct.anio}, con el ${pct(HB.max_pct.v)} del salario, y al más bajo en ${HB.min_pct.anio}, con el ${pct(HB.min_pct.v)}.`,
hogares: `En ${e.anio_ult}, el país demandó ${n0(e.gwh_ult)} gigavatios hora (GWh) de electricidad, y los hogares fueron el ${pct(e.pct_res_ult)}. En ${e.anio_ini} eran el ${pct(e.pct_res_ini)}. ` +
`Desde ${e.anio_ini}, la demanda de los hogares ${creceCae(e.crec_res)}, ${e.crec_res > e.crec_emae ? "más" : "menos"} que la actividad económica, ` +
`y la del resto de los usuarios ${creceCae(e.crec_resto)}, ${e.crec_resto > e.crec_emae ? "más" : "menos"} que la economía.` +
enLoQueVa(R.ytd.demanda, e.anio_ult, "la demanda total", "subió", "bajó"),
meses: `El año tiene dos picos de demanda eléctrica, uno por refrigeración en verano y otro por calefacción en invierno. En promedio entre ${e.meses_desde} y ${e.meses_hasta}, ` +
`${e.mes_max} fue el mes de mayor demanda, con ${n0(Math.max(...T.energia_estacionalidad.map(r => r.gwh)))} gigavatios hora (GWh), y ${e.mes_min} el de menor, ` +
`con ${n0(Math.min(...T.energia_estacionalidad.map(r => r.gwh)))}.`,
nacimientos: `En ${nac.anio_ult} se registraron ${n0(nac.n_ult)} nacimientos, ${pct(Math.abs(nac.caida))} menos que en ${nac.anio_pico}, el año con más nacimientos desde ${nac.anio_ini} (${n0(nac.pico)}). El gráfico toma ${nac.anio_ini} como base 100. En el conjunto de los 38 países de la OCDE, la baja entre ${nac.anio_pico} y ${nac.ocde_ult} fue de ${pct(Math.abs(nac.ocde_caida))}.`,
adolescentes: `En ${nac.anio_ini}, ${n1(nac.pct_ini)} de cada 100 nacimientos del país eran de madres menores de 20 años. En cantidad, el máximo desde ${nac.anio_ini} fue de ${n0(nac.ado_pico)} nacimientos, en ${nac.ado_anio_pico}. En ${nac.anio_ult} fueron ${n0(nac.ado_ult)}, ${pct(Math.abs(nac.ado_caida))} menos.`,
suicidio: `En ${s.anio}, el SNIC registró ${n0(s.casos)} suicidios, una tasa de ${n1(s.tasa)} por cada 100.000 habitantes de 5 años y más. En ${s.anio-1}, la tasa había sido de ${n1(s.tasa_prev)}. La de los varones fue de ${n1(s.tasa_v)} y la de las mujeres, de ${n1(s.tasa_m)}.`,
"suicidio-prov": `En ${s.anio}, la tasa nacional fue de ${n1(s.tasa)} suicidios por cada 100.000 habitantes de 5 años y más. El mapa agrupa a las jurisdicciones en cinco tramos con casi la misma cantidad cada uno. ` +
`En las de menos habitantes, unos pocos casos más o menos cambian mucho la tasa de un año a otro.`,
edad: `Sobre ${n0(s.n_sat)} casos registrados entre ${s.sat_desde} y ${s.sat_hasta} con edad y sexo conocidos, el ${pct(s.pct_varones)} fueron varones y el ${pct(s.pct_jovenes)} tenía entre 15 y 29 años.`,
muertes: `En ${s.anio}, el SNIC registró ${n0(s.casos)} suicidios, ${n0(s.homicidios)} homicidios dolosos y ${n0(s.viales)} muertes en siniestros viales. Por cada homicidio hubo ${n1(s.razon_hom)} suicidios. Desde ${s.anio_cruce} los suicidios superan cada año a las muertes viales. El último dato del Registro Nacional de Femicidios de la Justicia Argentina es de ${R.femicidios.anio}: ${n0(R.femicidios.n)} víctimas directas.`,
empleo: `En ${em.mes} había ${n1(em.total_millones)} millones de personas asalariadas registradas en el sector privado. En doce meses, el total del país ${signo(em.var_nac)} y el empleo creció ${deLas24(em.suben)}. El registro cuenta a cada persona en la provincia donde la declara su empleador: por eso CABA suma a muchas personas que viven en el Gran Buenos Aires.`,
mortalidad: `En ${mo.anio_inicio}, la tasa de mortalidad infantil del país era de ${n1(mo.tasa_inicio)} muertes de menores de un año cada 1.000 nacidos vivos. El gráfico compara promedios de tres años: en el de ${mo.tri_act}, la tasa más alta fue la de ${mo.top} (${n1(mo.top_v)}) y la más baja, la de ${mo.low} (${n1(mo.low_v)}). La tasa bajó ${deLas24(mo.bajan)} frente al promedio de ${mo.tri_base}.`,
sube: (su.var_anual == null ? "" : `En ${su.mes} se usaron por día hábil ${pct(Math.abs(su.var_anual))} ${su.var_anual < 0 ? "menos" : "más"} tarjetas SUBE distintas que en ${su.mes_prev}. `) +
`En los primeros días hábiles de marzo de 2020, antes del aislamiento, se usaban ${n2(su.pre_millones)} millones de tarjetas por día hábil` +
(su.vs_pre == null ? ". " : `: en ${su.mes} se usaron ${pct(Math.abs(su.vs_pre))} ${su.vs_pre < 0 ? "menos" : "más"}. `) +
`La SUBE, el Sistema Único de Boleto Electrónico, funciona en el Área Metropolitana de Buenos Aires y en decenas de ciudades del interior, pero no en las que tienen un sistema de pago propio.`,
pisa: `En PISA ${pz.anio}, los estudiantes de 15 años de la Argentina obtuvieron en promedio ${pz.lec} puntos en lectura y ${pz.cie} en ciencias. El promedio de los países de la OCDE fue de ${pz.ocde_lec} y ${pz.ocde_cie} puntos. Frente a ${pz.anio_prev}, el puntaje de la Argentina ${cambio(pz.var_mat)} en matemática, ${cambio(pz.var_lec)} en lectura y ${cambio(pz.var_cie)} en ciencias.`,
escolarizacion: `En ${es.ini}, el ${pct(es.pais_ini)} de los adolescentes del país en edad de cursar la secundaria estaba matriculado en ese nivel. Desde entonces, la tasa subió ${deLas24(es.suben)}${es.bajan.length && es.bajan.length <= 3 ? ` y bajó en ${lista(es.bajan)}` : ""}. La comparación cruza un quiebre de serie: desde 2022, la población de referencia sale del Censo 2022. ` +
`En ${es.fin}, la tasa más alta fue la de ${es.top} (${pct(es.top_v)})` + (es.top_excluidos.length ? `, sin contar ${lista(es.top_excluidos)}, donde llega casi al 100% por diferencias entre la matrícula y la población estimada` : "") +
`. La más baja fue la de ${es.low} (${pct(es.low_v)}).`,
aprender: `En matemática, el ${pct(ap.mat_debajo)} de los estudiantes de 6° grado de primaria del país quedó por debajo del nivel básico en Aprender ${ap.anio}. Por provincia, la parte con nivel satisfactorio o avanzado en matemática fue más alta en ${ap.top} (${pct(ap.top_v)}) y más baja en ${ap.low} (${pct(ap.low_v)}). En lengua, el ${pct(ap.len)} del país alcanzó un nivel satisfactorio o avanzado.`,
protegida: `En ${nt.anio} había ${n0(nt.areas)} áreas protegidas nacionales, provinciales y con designación internacional. Cubrían ${n1(nt.ha_millones)} millones de hectáreas de tierra firme, unos ${n0(nt.m2_pais)} metros cuadrados (m²) por habitante. ` +
`${nt.top} tenía protegido el ${pct(nt.top_v)} de su superficie${conVeces(nt.top_v, nt.pct)} y ${nt.low}, el ${pct(nt.low_v)}${conVeces(nt.low_v, nt.pct)}. Por habitante, la superficie protegida va de ${n0(nt.m2_top_v)} m² en ${nt.m2_top} a ${n1(nt.m2_low_v)} m² en ${nt.m2_low}. ` +
`La fuente suma la superficie de cada designación, así que una misma zona puede contarse más de una vez.`,
parques: `Los primeros parques nacionales, ${nt.pn_primeras}, se crearon en ${nt.pn_primera_anio}. Hoy las áreas protegidas de la Administración de Parques Nacionales suman ${n1(nt.pn_total_millones)} millones de hectáreas: ${n1(nt.pn_terr_millones)} millones en tierra y ${n1(nt.pn_mar_millones)} millones en el mar. La más grande en tierra es ${nt.pn_mayor}, creada en ${nt.pn_mayor_anio}, con ${n0(nt.pn_mayor_ha)} hectáreas. La más reciente es ${nt.pn_ultima}, de ${nt.pn_ultima_anio}.`,
especies: `La segunda área protegida nacional con más especies animales registradas es ${nt.esp_2}, con ${n0(nt.esp_2_v)}. ` +
`El número depende también de cuánto se estudió cada área: las más antiguas e investigadas acumulan más registros, así que no mide por sí solo cuántas especies viven en ella.`,
visitas: `En ${nt.vis_anio}, el ${pct(nt.vis_nr_pct)} de las visitas a los parques nacionales fue de personas que no residen en el país. El máximo de la serie fue en ${nt.vis_max_anio}, con ${n0(nt.vis_max)} visitas, y el mínimo en ${nt.vis_min_anio}, con ${n0(nt.vis_min)}. ` +
`${nt.ytd_frase}, según esta fuente, las visitas ${movio(nt.ytd_var)} frente a los mismos meses del año anterior. ` +
`La pestaña de cada parque usa otra fuente, el tablero de la Secretaría de Turismo y Ambiente, y su comparación de lo que va del año puede dar otro resultado.`,
receptivo: `En los doce meses hasta ${tu.doce_hasta} llegaron ${n0(tu.doce)} turistas que viven fuera del país, ${pct(Math.abs(tu.doce_var))} ${tu.doce_var < 0 ? "menos" : "más"} que en los doce meses anteriores. El máximo de la serie anual fue en ${tu.max_anio}, con ${n0(tu.max)}.`,
hoteles: `El ${pct(tu.eoh_nr_pct)} de los viajeros que se hospedaron en hoteles y parahoteles de las localidades relevadas en ${tu.eoh_anio} no residía en el país. ${tu.eoh_reg} fue la región con más viajeros, con el ${pct(tu.eoh_reg_pct)} del total. El máximo de la serie fue en ${tu.eoh_max_anio}, con ${n1(tu.eoh_max)} millones.`,
eti: `En cantidad, la jurisdicción más visitada en ${tu.eti_anio} por los turistas del exterior que se fueron del país por Ezeiza o Aeroparque fue ${tu.eti_top}, ` +
`con ${n0(tu.eti_top_v)}, y la segunda, ${tu.eti_2}, con ${n0(tu.eti_2_v)}.`,
pobreza: `En el ${R.pobreza.sem}, el ${pct(R.pobreza.ind)} de las personas de los 31 aglomerados urbanos que releva la EPH estaba bajo la línea de indigencia. Un año antes, en el ${R.pobreza.sem_prev}, la pobreza era ${R.pobreza.pob > R.pobreza.pob_prev ? "más baja" : R.pobreza.pob < R.pobreza.pob_prev ? "más alta" : "igual"}: ${pct(R.pobreza.pob_prev)}. La indigencia era del ${pct(R.pobreza.ind_prev)}. El valor más alto de la pobreza en la serie fue ${pct(R.pobreza.max)}, en el ${R.pobreza.max_sem}.`,
"pobreza-ninez": `En el mismo semestre, la pobreza de toda la población era de ${pct(PNZ.ptotal)}: la de los chicos es ${n1(PNZ.veces)} veces esa` +
`${PNZ.siempre_mas ? ", y fue más alta en todos los semestres de la serie" : ""}. Un año antes, en el ${PNZ.anterior}, era de ${pct(PNZ.p0_17_ant)}. ` +
`La más alta de la serie fue ${pct(PNZ.max_v)}, en el ${PNZ.max}, y la más baja, ${pct(PNZ.min_v)}, en el ${PNZ.min}. El ${pct(PNZ.i0_17)} de los chicos ` +
`vivía bajo la línea de indigencia.`,
"pobreza-ninez-edad": `En el ${PNZ.fin} vivía en hogares pobres el ${pct(PNZ.p0_5)} de los chicos de 0 a 5 años, el ${pct(PNZ.p6_11)} de los de 6 a 11 ` +
`y el ${pct(PNZ.p12_17)} de los de 12 a 17. En las personas de 65 años y más, el ${pct(PNZ.p65_y_mas)}.`,
patentes: `Entre ${au.ytd} se inscribieron en los registros del país ${pct(Math.abs(au.ytd_var))} ${au.ytd_var < 0 ? "menos" : "más"} autos nuevos que en el mismo período del año anterior. El máximo de autos de la serie fue en ${au.max_anio}, con ${n0(au.max)}, y el mínimo en ${au.min_anio}, con ${n0(au.min)}. ` +
`La serie de autos cuenta todos los automotores: también camionetas y vehículos de carga.` +
(au.moto_excluidos.length ? ` El total de motos de ${au.anio} no incluye el dato de ${lista(au.moto_excluidos)}, que la ficha siguiente señala como un probable error de la fuente.` : ""),
"patentes-prov": `En ${au.anio}, el valor más alto de autos nuevos inscriptos cada 1.000 habitantes fue el de ${au.top} (${n1(au.top_v)}) y el más bajo, el de ${au.low} (${n1(au.low_v)}). ` +
`Cada inscripción se cuenta en la provincia del registro, que no siempre es donde se usa el vehículo. ` +
`En motos, el valor más alto fue el de ${au.moto_top} (${n1(au.moto_top_v)})${sinContar("patentamientos_provincias.motos_1000", au.moto_excluidos)}. ` +
`El promedio del país en motos fue de ${n1(au.motos_pais_1000)} cada 1.000 habitantes${au.moto_excluidos.length ? `, también sin ${au.moto_excluidos.length > 1 ? "esos datos" : "ese dato"}` : ""}.`,
"electricidad-provincias": LEAD["electricidad-provincias"]("prov"),
"electricidad-sectores": LEAD["electricidad-sectores"]("ind"),
salarios: LEAD.salarios("prov"),
"salario-docente": LEAD["salario-docente"]("prov"),
"inversion-educativa": LEAD["inversion-educativa"]("alumno"),
delitos: LEAD.delitos("tipo"),
robos: LEAD.robos("robos"),
homicidios: LEAD.homicidios("prov"),
"sin-condena": LEAD["sin-condena"]("prov"),
carceles: LEAD.carceles("serie"),
"cuentas-nacion": LEAD["cuentas-nacion"]("resultado"),
recaudacion: LEAD.recaudacion("impuesto"),
deuda: LEAD.deuda(),
"empleo-publico": LEAD["empleo-publico"]("prov"),
"impuestos-provinciales": LEAD["impuestos-provinciales"](),
"pobreza-aglomerados": LEAD["pobreza-aglomerados"]("region"),
"empresas-tamano": LEAD["empresas-tamano"]("tam"),
informalidad: `La parte de los ocupados con un empleo informal iba del ${pct(INF.min[1])} en ${INF.min[0]} al ${pct(INF.max[1])} en ${INF.max[0]}. ` +
`Solo en el ${INF.ultimo}, en el total de los 31 aglomerados, fue el ${pct(INF.pais_ultimo)}.`,
desocupacion: LEAD.desocupacion("ciudad"),
coparticipacion: LEAD.coparticipacion("hab"),
sociedades: LEAD.sociedades("prov"),
"escuelas-primarias": LEAD["escuelas-primarias"](),
"escuelas-secundarias": LEAD["escuelas-secundarias"](),
"privadas-aprender": `En los ${n0(PAP.deps)} departamentos con al menos ${n0(PAP.min)} alumnos de 6° grado evaluados en Aprender ${PAP.anio}, los que tienen ` +
`una parte más grande de escuelas primarias privadas suelen tener ${PAP.r_mat >= 0 ? "más" : "menos"} alumnos con nivel satisfactorio o avanzado. La relación es ` +
(fuerza(PAP.r_mat) === fuerza(PAP.r_len) ? `${fuerza(PAP.r_mat)} en matemática (correlación de ${n2(PAP.r_mat)}) y en lengua (${n2(PAP.r_len)}). `
: `${fuerza(PAP.r_mat)} en matemática (correlación de ${n2(PAP.r_mat)}) y ${fuerza(PAP.r_len)} en lengua (${n2(PAP.r_len)}). `) +
(Math.abs(PAP.prov_r_mat) < Math.abs(PAP.r_mat) - .2 ? `Buena parte es una diferencia entre provincias: dentro de ${PAP.prov}, la provincia con más ` +
`departamentos con dato (${n0(PAP.prov_deps)}), la relación en matemática es ${fuerza(PAP.prov_r_mat)} (${n2(PAP.prov_r_mat)}). `
: `Dentro de ${PAP.prov}, la provincia con más departamentos con dato (${n0(PAP.prov_deps)}), la relación en matemática es ${fuerza(PAP.prov_r_mat)} (${n2(PAP.prov_r_mat)}). `) +
`En todo el país, el ${pct(PAP.mat_privado)} de los alumnos de las escuelas privadas alcanzó el nivel satisfactorio o avanzado en matemática, frente al ` +
`${pct(PAP.mat_estatal)} en las estatales.`,
"distancia-hospital": LEAD["distancia-hospital"]("hospital"),
hospitales: LEAD.hospitales("hospitales"),
medicos: LEAD.medicos("activos"),
"cobertura-suelo": LEAD["cobertura-suelo"]("natural"),
telefonia: LEAD.telefonia("prov"),
"tv-paga": LEAD["tv-paga"]("prov"),
abandono: LEAD.abandono("ab"),
"deuda-provincias": LEAD["deuda-provincias"]("hab"),
refugio: LEAD.refugio("anio"),
supermercados: LEAD.supermercados("prov"),
"nacidos-otro-pais": LEAD["nacidos-otro-pais"]("prov"),
"migracion-interna": LEAD["migracion-interna"](),
"migracion-historia": LEAD["migracion-historia"](),
radicaciones: LEAD.radicaciones("anio"),
"argentinos-exterior": LEAD["argentinos-exterior"]("anio"),
inflacion: LEAD.inflacion("doce"),
"inflacion-rubros": LEAD["inflacion-rubros"]("division"),
"salario-minimo": `En ${ESM.mes}, el salario mínimo, vital y móvil era de ${n0(ESM.smvm)} pesos por mes y la canasta básica total del hogar de ` +
`referencia del INDEC, de ${n0(ESM.cbt_hogar)} pesos. Con un solo salario mínimo ese hogar pagaba ${pct(ESM.pct_cba)} de su canasta alimentaria` +
(ESM.pct_anio_ant != null ? `, y un año antes pagaba ${pct(ESM.pct_anio_ant)} de la total` : "") + `. Desde ${ESM.desde}, el primer mes de la ` +
`serie, el punto más alto fue ${ESM.max[0]}, con ${pct(ESM.max[1])} de la canasta total, y el más bajo, ${ESM.min[0]}, con ${pct(ESM.min[1])}.` +
(ESM.fijado_hasta ? ` El Consejo del Salario ya fijó los aumentos hasta ${ESM.fijado_hasta}, cuando llegará a ${n0(ESM.fijado_valor)} pesos.` : ""),
canastas: LEAD.canastas("region"),
industria: LEAD.industria("industria"),
crianza: LEAD.crianza("edad"),
"salario-real": LEAD["salario-real"](),
"socios-que": LEAD["socios-que"]("vende", SQ.ini),
"valor-kilo": LEAD["valor-kilo"]("anual"),
"precio-consumo": LEAD["precio-consumo"]("carne"),
mayoristas: LEAD.mayoristas("doce"),
"sectores-empleo": LEAD["sectores-empleo"]("uno"),
emae: LEAD.emae("mes"),
combustibles: LEAD.combustibles("nafta", "prov"),
nombres: `En ${cu.nom_anio} se inscribieron ${n0(cu.nena_n)} bebés con el nombre ${cu.nena} ${yE(n0(cu.varon_n))} con el nombre ${cu.varon}. ${cu.varon_prov} fue el nombre de varón más elegido en ${cu.varon_prov_n} de las 24 jurisdicciones. ` +
`En ${cu.nom_ini}, el primer año de la serie, los más inscriptos habían sido ${cu.nena0} para las nenas ${yE(cu.varon0)} para los varones.` +
(cu.lionel_anio ? ` En ${cu.lionel_anio} se inscribieron ${n0(cu.lionel_max)} bebés llamados Lionel, ${veces(cu.lionel_max, cu.lionel_prev)} veces los del año anterior.` : ""),
carne: `Entre enero y ${cu.carne_ytd_hasta}, cada habitante consumió carne vacuna a un ritmo de ${n1(cu.carne_ytd)} kilos por año${cu.carne_min_serie ? ", por debajo del promedio de cualquier año completo de la serie" : ""}. En ${cu.asado_hasta}, un kilo de asado costaba lo mismo que ${n1(cu.asado)} kilos de pollo en el Gran Buenos Aires. En ${cu.asado_ini_anio} equivalía a ${n1(cu.asado_ini)} kilos.`,
vino: `El ${pct(cu.vino_mza)} del vino vendido en el país en ${cu.vino_anio} salió de bodegas de Mendoza.` + enLoQueVa(R.ytd.vino, cu.vino_anio, "las ventas", "subieron", "bajaron"),
yerba: (cu.yerba_max_anio === cu.yerba_anio ? `${cu.yerba_anio} fue el año en que los molinos despacharon más yerba mate desde ${cu.yerba_ini}.`
: `El año en que los molinos despacharon más yerba mate desde ${cu.yerba_ini} fue ${cu.yerba_max_anio}, con ${n1(cu.yerba_max)} millones de kilos.`) + enLoQueVa(R.ytd.yerba, cu.yerba_anio, "los despachos", "subieron", "bajaron"),
cumbres: `Le sigue ${nt.cu_2}, en ${nt.cu_2_prov}, con ${n0(nt.cu_2_v)} metros: ${n0(nt.cu_dif)} menos. ${nt.cu_prov_top_n} de las ${nt.cu_n} cumbres de la tabla del IGN están en ` +
`${nt.cu_prov_top} y el resto, en otras ${nt.cu_provs - 1} provincias. Todas superan los ${n0(Math.floor(nt.cu_ult_v / 100) * 100)} metros: la más baja de la tabla, ${nt.cu_ult}, tiene ${n0(nt.cu_ult_v)}.`,
glaciares: `${cu.gl_top} tiene ${n0(cu.gl_top_v)} glaciares inventariados ${yE(cu.gl_2)}, ${n0(cu.gl_2_v)}, según el Inventario Nacional de Glaciares. ` +
`Entre las dos reúnen el ${pct((cu.gl_top_v + cu.gl_2_v) / cu.gl_total * 100)} de los glaciares inventariados del país. El dato cuenta glaciares, no su superficie: una provincia con muchos glaciares chicos puede tener menos hielo que otra con pocos glaciares grandes.`,
"ant-mapa": `El Consejo de Administradores de Programas Antárticos Nacionales (COMNAP) lista ${ANT.n} instalaciones de ${ANT.paises} países: ${ANT.estaciones} estaciones y el resto entre campamentos, refugios, pistas, laboratorios y depósitos. ` +
`Funcionan todo el año ${ANT.anual} y solo en verano, ${ANT.verano}. En la Península Antártica y las islas cercanas hay ${ANT.peninsula}, de ${ANT.peninsula_paises} países distintos: por eso esa zona tiene su propia vista en el mapa.`,
"ant-bases": `La Argentina tiene ${ANT.arg} bases: ${ANT.arg_anual} funcionan todo el año y ${ANT.arg_verano}, solo en verano. ${ANT.anual_top === "Argentina" ? "Según COMNAP, ningún otro país tiene tantas abiertas todo el año. " : ""}` +
`La más antigua es Orcadas, de ${ANT.bases_ini}, y la más nueva, Belgrano II, de ${ANT.bases_fin}. El Censo 2022 contó ${ANT.censo} personas en las bases permanentes: ${ANT.censo_mujeres} mujeres y ${ANT.censo_varones} varones. ` +
`La capacidad máxima más alta es la de ${ANT.base_cap}: ${ANT.base_cap_v} personas en el momento de mayor actividad.`,
"ant-paises": `${ANT.top} lista ${ANT.top_v} instalaciones, la Argentina ${ANT.arg} ${yE(ANT.tercero)} ${ANT.tercero_v}. Si se cuentan solo las que funcionan todo el año, ${ANT.anual_top === "Argentina" ? "la Argentina" : ANT.anual_top} es la primera, con ${ANT.anual_top_v}. ` +
`En capacidad, ${ANT.cap_top} queda muy por encima: ${n0(ANT.cap_top_v)} personas, ${n0(ANT.cap_max_v)} de ellas en ${ANT.cap_max_base}.`,
"ant-reclamos": `Reclaman sectores de la Antártida ${ANT.reclaman} países. La ley argentina incluye en la provincia de Tierra del Fuego el sector entre los meridianos 25 y 74 Oeste, al sur del paralelo 60. Esos ${ANT.arg_grados} grados de longitud están todos dentro del sector que reclama el Reino Unido, y ${ANT.arg_con_chile} también dentro del que reclama Chile. ` +
`Entre los meridianos 90 y 150 Oeste no reclama ningún país. El Tratado Antártico no reconoce ni rechaza estos reclamos y no admite reclamos nuevos mientras esté en vigor. Según el Instituto Geográfico Nacional, el Sector Antártico Argentino mide ${n0(ANT.sector_km2)} km², el ${pct(ANT.sector_pct)} de la superficie del país contando ese sector y las islas. Hay ${ANT.sector_n} instalaciones de ${ANT.sector_paises} países dentro de esos meridianos.`,
"ant-tratado": `Lo firmaron ${ANT.originales} países en 1959 y empezó a regir en ${ANT.tr_ini}. Hoy son ${ANT.partes}: ${ANT.consultivas} partes consultivas, las únicas que deciden en las reuniones del Tratado, y ${ANT.no_consultivas} que pueden asistir sin decidir. La Argentina y Chile están entre los firmantes originales. El último país en sumarse fue ${ANT.tr_ult}, en ${ANT.tr_ult_anio}. La Secretaría del Tratado funciona en Buenos Aires desde 2004.`,
"ant-zonas": `Hay ${ANT.zaep} zonas antárticas especialmente protegidas, ${ANT.zaea} zonas especialmente administradas y ${ANT.smh} sitios y monumentos históricos. ${ANT.zaep_top} propuso más zonas protegidas, ${ANT.zaep_top_v}, y ${ANT.smh_top} más sitios históricos, ${ANT.smh_top_v}. ` +
`La Argentina propuso ${ANT.arg_zaep} zonas protegidas y ${ANT.arg_smh} sitios históricos, entre ellos los observatorios de la isla Laurie, en Orcadas, y el mástil que dejó la Operación 90 en el Polo Sur. También participa en la zona administrada de la isla Decepción.`,
"ant-temperatura": `Orcadas tiene la serie más larga de las bases argentinas, desde ${ANT.temp.orcadas.ini}: sus últimos diez años con dato estuvieron ${n1(ANT.temp.orcadas.dif)} °C por encima de los primeros diez. La diferencia es de ${n1(ANT.temp.esperanza.dif)} °C en Esperanza, desde ${ANT.temp.esperanza.ini}, ` +
`y de ${n1(ANT.temp.marambio.dif)} °C en Marambio, desde ${ANT.temp.marambio.ini}. En Belgrano II, mucho más al sur y con menos años, es de ${n1(ANT.temp.belgrano_ii.dif)} °C.`,
"ant-hielo": `En septiembre de ${ANT.hielo_fin}, cuando más hielo hay, el mar congelado alrededor de la Antártida cubría ${n2(ANT.hielo_sep)} millones de km², ${n2(ANT.hielo_sep_base - ANT.hielo_sep)} menos que el promedio de 1981 a 2010. El septiembre más bajo de la serie fue el de ${ANT.hielo_sep_min_anio}: ${n2(ANT.hielo_sep_min)} millones. ` +
`En febrero, cuando menos hay, cubría ${n2(ANT.hielo_feb)} millones en ${ANT.hielo_fin}, y el más bajo fue el de ${ANT.hielo_feb_min_anio}: ${n2(ANT.hielo_feb_min)} millones.`,
"ant-turismo": `En la temporada ${ANT.tu_fin} viajaron ${n0(ANT.tu)} personas con empresas de IAATO, la asociación de operadores de turismo antártico: ${n0(ANT.tu_desembarcan)} desembarcaron, ${n0(ANT.tu_crucero)} no bajaron del crucero y ${n0(ANT.tu_campo)} fueron al interior del continente. ` +
`El máximo fue en ${ANT.tu_max_temp}, con ${n0(ANT.tu_max)}. En ${ANT.tu_ini} se contaban ${n0(ANT.tu_ini_v)}, y en la temporada de la pandemia, ${ANT.tu_pandemia}.`,
"ant-presupuesto": `En ${ANT.gasto_anio}, la Nación gastó ${n1(ANT.gasto)} mil millones de pesos en programas antárticos, el ${ANT.gasto_pct.toLocaleString("es-AR")}% de todo su gasto. El ${pct(ANT.gasto_sosten_pct)} fue el Sostén Logístico Antártico del Estado Mayor Conjunto, que paga la campaña y las bases. ` +
`En pesos de ${ANT.gasto_anio}, el máximo fue en ${ANT.gasto_max_anio}, con ${n1(ANT.gasto_max)} mil millones, cuando también se pagaba la reparación del rompehielos Almirante Irízar.`,
clima: (cu.cl_fin === cu.cl_max_anio ? "" : `En ${cu.cl_fin}, la temperatura media del país estuvo ${n2(Math.abs(cu.cl_ult))} °C ${cu.cl_ult < 0 ? "por debajo" : "por encima"} del promedio de 1991 a 2020. `) + `De los ${cu.cl_n_desde2000} años desde 2000, ${cu.cl_pos_desde2000} fueron más cálidos que el promedio de 1991 a 2020. El año más frío de la serie fue ${cu.cl_min_anio} (${grados(cu.cl_min)}).`,
pesca: `En ${pe.anio}, las especies más desembarcadas en los puertos del país fueron ${pe.top[0].toLowerCase()} (${n0(pe.top_t[0])} toneladas), ${pe.top[1].toLowerCase()} (${n0(pe.top_t[1])}) ${yE(pe.top[2].toLowerCase())} (${n0(pe.top_t[2])}). La primera representó el ${pct(pe.top_pct)} del total.`,
"pesca-rio": `En ${pe.rio_anio}, la pesca comercial en ríos y lagunas registró ${n0(pe.rio_total)} toneladas. Las capturas se concentraron en ${lista(pe.rio_provs)}, sobre todo en ${pe.rio_prov_top} (${pct(pe.rio_prov_top_pct)}). ` +
`Solo cuentan las provincias que informan datos, y no entran la pesca deportiva ni la de subsistencia.`,
soja: `En la campaña ${SJ.campania} se sembró soja en ${n0(SJ.n_dep)} departamentos de ${SJ.n_prov} provincias. ${SJ.top[0]}, ${SJ.top[1]} ${yE(SJ.top[2])} ` +
`reunieron el ${pct(SJ.top3_pct)} de la superficie del país. El departamento con más soja fue ${SJ.dep}, en ${SJ.dep_prov}, con ${n0(SJ.dep_ha)} hectáreas, y los diez ` +
`primeros sumaron el ${pct(SJ.dep10_pct)}.`,
dengue: `Sumando las temporadas de la ${DG.prov_desde} a la ${DG.temp}, la tasa más alta fue la de ${DG.top}, con ${fDg(DG.top_v)} casos confirmados cada 100.000 ` +
`habitantes, seguida por la de ${DG.top2}, con ${fDg(DG.top2_v)}. La más baja fue la de ${DG.low}, con ${fDg(DG.low_v)}. En todo el país se confirmaron ` +
`${n0(DG.casos_juntas)} casos en esas temporadas` + (DG.max_pct_juntas != null ? `, el ${pct(DG.max_pct_juntas)} en la de ${DG.max_temp}, la de la epidemia más grande.` : "."),
"dengue-serie": `En la temporada ${DG.temp} se confirmaron ${n0(DG.casos)} casos de dengue en el país, frente a ${n0(DG.casos_ant)} en la ${DG.temp_ant}. ` +
`La epidemia más grande desde la temporada ${DG.ini} fue la de ${DG.max_temp}, con ${n0(DG.max_casos)} casos.`,
vacunas: `En ${VC.anio}, ${VC.bajo95_1} de las 24 jurisdicciones vacunaron con la primera dosis a menos del 95% de los chicos de un año, la cobertura que ` +
`recomienda la Organización Panamericana de la Salud para frenar el sarampión. Las más bajas fueron las de ${VC.low}, ${pct(VC.low_v)}, ${yE(VC.low_b)}, ` +
`${pct(VC.low_b_v)}. En ${VC.ini} eran ${VC.bajo95_1_ini}.`,
"vacunas-2": `La segunda dosis, que se da al entrar a la escuela, quedó debajo del 95% en ${VC.bajo95_2 === 24 ? "las 24 jurisdicciones" : `${VC.bajo95_2} de las 24 jurisdicciones`} ` +
`en ${VC.anio}. La mitad de las jurisdicciones vacunó a menos del ${pct(VC.mediana2)} de los chicos de esa edad, y la cobertura más baja fue la de ${VC.low2}, ` +
`${pct(VC.low2_v)}.`,
"vacunas-serie": `La cobertura mediana de las 24 jurisdicciones en la primera dosis pasó de ${pct(VC.mediana1_ini)} en ${VC.ini} a ${pct(VC.mediana1_2019)} ` +
`en 2019, antes de la pandemia, y a ${pct(VC.mediana1)} en ${VC.anio}. La de la segunda, de ${pct(VC.mediana2_2019)} en 2019 a ${pct(VC.mediana2)}.`,
esperanza: `En ${nv.ev_anio}, la esperanza de vida al nacer de las mujeres del país era de ${n1(nv.ev_m)} años y la de los varones, de ${n1(nv.ev_v)}. Con mujeres y varones juntos, por provincia iba de ${n1(nv.ev_top_v)} años en ${nv.ev_top} a ${n1(nv.ev_low_v)} en ${nv.ev_low}. El gráfico muestra al lado de cada provincia la esperanza de vida de las mujeres.`,
exportaciones: `Por habitante, las exportaciones producidas en ${nv.ex_top} sumaron ${n0(nv.ex_top_v)} dólares${conVeces(nv.ex_top_v, nv.ex_pc_pais)} y las de ${nv.ex_low}, ${n0(nv.ex_low_v)}${conVeces(nv.ex_low_v, nv.ex_pc_pais)}. En total, el país exportó bienes por ${n0(nv.ex_total)} millones de dólares en ${nv.ex_anio}.` + (nv.ex_sem ? ` En el primer semestre de ${nv.ex_sem.anio}, con datos provisorios, las exportaciones sumaron ${n0(nv.ex_sem.total)} millones de dólares, ${pct(Math.abs(nv.ex_sem.var))} ${nv.ex_sem.var >= 0 ? "más" : "menos"} que en el primer semestre de ${nv.ex_sem.anio - 1}, y subieron en ${nv.ex_sem.suben} de las 24 jurisdicciones.` : "") +
"",
cobertura: textoCenso("sin_cobertura"),
internet: `En el ${nv.in_trim}, el valor más alto fue el de ${nv.in_top}, con ${n1(nv.in_top_v)} accesos a internet fijo cada 100 hogares, y el más bajo, el de ${nv.in_low}, con ${n1(nv.in_low_v)}.` +
(DIST["internet_fijo_provincias.accesos_100_hogares"]?.[nv.in_top]?.accion === "aclarar" ? ` ${DIST["internet_fijo_provincias.accesos_100_hogares"][nv.in_top].motivo}.` : "") +
` La velocidad media de bajada iba de ${n1(nv.ve_top_v)} megabits por segundo en ${nv.ve_top} a ${n1(nv.ve_low_v)} en ${nv.ve_low}.`,
extranjeros: `El RENAPER registra ${n0(MG.renaper.personas)} personas nacidas en otro país con DNI argentino, un ${pct(MG.renaper.mas)} más que las que contó el Censo 2022. Los dos cuentan distinto: ` +
`el RENAPER usa el domicilio que figura en cada DNI, que puede estar desactualizado, y el Censo cuenta a quienes viven en cada vivienda. ` +
`${nv.xt_top} tiene la proporción más alta, ${n1(nv.xt_top_v)} cada 100 habitantes. Los países de nacimiento más frecuentes son ${lista(nv.xt_origen)}.`,
"mapa-dep-titulo": `¿Cómo varía cada indicador de un departamento a otro?`,
"mapa-dep": `Cada provincia se divide en departamentos, que en Buenos Aires se llaman partidos y en CABA, comunas: son ${n0(R.departamentos.n)} en todo el país. El mapa reúne datos de varias fuentes: los homicidios, los robos y las muertes viales del Sistema Nacional de Información Criminal (SNIC), la edad de la población según el Registro Nacional de las Personas (RENAPER), el lugar de nacimiento, las viviendas y los hogares según el Censo 2022 del INDEC, las escuelas según el padrón oficial de la Secretaría de Educación y el crecimiento de la población que el INDEC estima hasta ${R.departamentos.pob_fin}. Tocá una provincia para acercarte.`
};
document.querySelectorAll("[data-t]").forEach(el => { if (TX[el.dataset.t]) el.textContent = TX[el.dataset.t]; });
const textosParte = tx => {
Object.assign(TX, tx);
document.querySelectorAll("[data-t]").forEach(el => { if (tx[el.dataset.t]) el.textContent = tx[el.dataset.t]; });
};
const $t = k => document.querySelector(`[data-t="${k}"]`) || document.createElement("p");
const PROV = T.empleo_provincias.map(d => [d.codigo_indec, d.territorio]).sort((a,b) => a[1].localeCompare(b[1],"es"));
const NOMBRES = Object.fromEntries(PROV);
const bandera = (c, cls = "") => NOMBRES[c] || c === "00"
? `<img class="bandera${cls ? " " + cls : ""}" src="datos/banderas/${c}.png" alt="" width="24" height="16" loading="lazy" decoding="async">`
: `<span class="bandera vacia" aria-hidden="true"></span>`;
const COD_PROV = Object.fromEntries([...PROV.map(([c, n]) => [n, c]), ["Ciudad Autónoma de Buenos Aires", "02"], ["Ciudad de Buenos Aires", "02"]]);
const leerProv = () => new URLSearchParams(location.search).get("prov") || new URLSearchParams(location.hash.split("?")[1] || "").get("prov") || document.body.dataset.prov || "";
const urlProv = c => SITIO.prov_pag[c];
let prov = "";
try { prov = leerProv() || localStorage.getItem("prov") || ""; } catch(_) { prov = leerProv(); }
if (!NOMBRES[prov]) prov = "";
else if (leerProv() === prov) try { localStorage.setItem("prov", prov); } catch(_) {}
function elegir(c, desdeHistorial = false) {
const antes = prov;
prov = NOMBRES[c] ? c : "";
desplegable.marcar();
try { localStorage.setItem("prov", prov); } catch(_) {}
if (!desdeHistorial && prov !== antes) {
if (document.body.dataset.prov) { location.assign(prov ? urlProv(prov) : "provincia"); return; }
const u = new URL(location.href);
if (prov) u.searchParams.set("prov", prov); else u.searchParams.delete("prov");
history.pushState({...history.state, prov}, "", u);
}
repintarProv();
}
const alCambiarProv = [];
history.replaceState({...history.state, prov}, "");
addEventListener("popstate", ev => {
const c = ev.state && "prov" in ev.state ? ev.state.prov : null;
if (c === null || c === prov) return;
const ref = document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.closest("article, .explicador, .pasos, .pie-sitio, section");
const top0 = ref?.getBoundingClientRect().top;
elegir(c, true);
if (ref) requestAnimationFrame(() => { if (ref.isConnected) scrollBy({top: ref.getBoundingClientRect().top - top0, behavior: "instant"}); });
});
const desplegable = (() => {
const caja = document.getElementById("elige");
if (!caja) return {marcar() {}};
const btn = document.getElementById("elige-btn"), panel = document.getElementById("elige-panel");
const buscar = document.getElementById("elige-buscar"), lista = document.getElementById("elige-lista"), vacio = document.getElementById("elige-vacio");
const valor = document.getElementById("elige-valor");
const sinTilde = t => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
lista.innerHTML = [["", "Todo el país"], ...PROV].map(([c, n], i) =>
`<li role="option" id="op-${c || "pais"}" data-c="${c}" aria-selected="false"${i === 0 ? ' class="primera"' : ""}>${bandera(c || "00")}<span>${n}</span></li>`).join("");
const items = [...lista.children];
let activa = -1, cierre;
const visibles = () => items.filter(li => !li.hidden);
const activar = i => {
const v = visibles(); if (!v.length) { buscar.removeAttribute("aria-activedescendant"); return; }
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
caja.addEventListener("focusout", ev => { if (btn.getAttribute("aria-expanded") === "true" && !caja.contains(ev.relatedTarget)) cerrar(false); });
const marcar = () => {
valor.textContent = NOMBRES[prov] || "Todo el país";
items.forEach(li => li.setAttribute("aria-selected", li.dataset.c === prov));
};
marcar();
return {marcar};
})();
function nombreGrafico(el) {
const ficha = el.closest("article.ficha"), caja = ficha || el.closest(".nota-graf, .lab-pieza, .breve, section");
const tit = (caja?.querySelector("h3, h2")?.textContent || "").trim();
if (!tit) return "Gráfico";
return `Gráfico: ${tit}` + (ficha?.querySelector(".ver-tabla") ? ". Los datos están en «Ver tabla», debajo" : el.closest(".nota-graf") ? ". Los datos se descargan en CSV al final del artículo" :
el.closest(".breve") ? ". Los datos están en su ficha" : "");
}
function lienzo(el, h, m) {
el.innerHTML = ""; el.removeAttribute("aria-busy"); el.resaltar = null;
const w = Math.max(300, el.clientWidth);
const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${w} ${h}`).attr("role","img").attr("aria-label", nombreGrafico(el));
return {svg, w, h, iw: w - m.l - m.r, ih: h - m.t - m.b, g: svg.append("g").attr("transform", `translate(${m.l},${m.t})`)};
}
function mostrarTip(el, html, x, y) {
const r = el.getBoundingClientRect(), pr = document.body.getBoundingClientRect();
tip.classList.remove("tip-cifra", "abajo"); tip.innerHTML = html; tip.classList.add("on");
const tw = tip.offsetWidth;
let left = r.left - pr.left + x - tw / 2;
left = Math.max(8, Math.min(left, document.documentElement.clientWidth - tw - 8));
tip.style.left = left + "px"; tip.style.top = (r.top - pr.top + y - tip.offsetHeight - 12) + "px";
}
const ocultarTip = () => tip.classList.remove("on");
const ocultarSiMouse = ev => { if (ev.pointerType === "mouse") ocultarTip(); };
function tintaSobre(fondo) {
const lum = c => { const v = [c.r, c.g, c.b].map(x => { x /= 255; return x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4; }); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; };
const l = lum(d3.rgb(fondo)), tinta = css("--ink"), lt = lum(d3.rgb(tinta));
return (1.05) / (l + .05) >= (l + .05) / (lt + .05) ? "#fff" : tinta;
}
document.addEventListener("pointerdown", ev => { if (!ev.target.closest?.(".grafico")) ocultarTip(); });
const REDUCIR = matchMedia("(prefers-reduced-motion: reduce)").matches;
const LLEGADA = window.LLEGADA || {activa: false};
const EASE = d3.easePolyOut.exponent(4);
const DUR_G = 300;
const escalon = (d, i, nodos) => i * Math.min(30, 150 / Math.max(1, nodos.length - 1));
function trazar(path, dash) {
const L = path.node().getTotalLength();
path.attr("stroke-dasharray", `${L} ${L}`).attr("stroke-dashoffset", L)
.transition().duration(DUR_G).ease(EASE).attr("stroke-dashoffset", 0)
.on("end", function() { d3.select(this).attr("stroke-dasharray", dash || null).attr("stroke-dashoffset", null); });
}
const DUR_C = 200;
const pasar = sel => sel.transition("resalte").duration(DUR_C).ease(d3.easeCubicOut);
const claseProv = (d, base) => d.codigo_indec === prov ? "etq-fuerte" : base;
const RADIO_BARRA = 4, rBarra = h => Math.min(RADIO_BARRA, h / 2);
let nRecorte = 0;
const recorte = (svg, x, y, w, h, r) => {
const id = `rb${++nRecorte}`;
svg.append("defs").append("clipPath").attr("id", id).append("rect").attr("x", x).attr("y", y).attr("width", Math.max(0, w)).attr("height", Math.max(0, h)).attr("rx", r);
return `url(#${id})`;
};
const aparecer = (sel, delay = 0) => sel.attr("opacity", 0).transition().delay(Math.min(delay, 150)).duration(DUR_G).ease(d3.easeCubicOut).attr("opacity", 1);
function marcasLog([a, b]) {
const todas = [];
for (let e = Math.floor(Math.log10(a)); e <= Math.ceil(Math.log10(b)); e++)
[1, 2, 5].forEach(m => { const v = +(m * 10 ** e).toPrecision(12); if (v >= a && v <= b) todas.push({v, m}); });
const pot = todas.filter(t => t.m === 1), usar = pot.length >= 3 ? pot : todas, paso = Math.ceil(usar.length / 6);
return usar.filter((_, i) => (usar.length - 1 - i) % paso === 0).map(t => t.v);
}
const marcasAnio = (tv, iw) => { const k = Math.ceil(40 / (iw / Math.max(1, tv.length - 1))); return k > 1 ? tv.filter((_, i) => i % k === 0) : tv; };
function lineas(el, cfg) {
const angosto = el.clientWidth < 520;
const C = lienzo(el, cfg.h ? (angosto ? cfg.h - 20 : cfg.h) : (angosto ? 300 : 340), {t:14, r: angosto ? 92 : 128, b:30, l:44});
const {g, iw, ih} = C, data = cfg.data;
const lec = d3.select(el).insert("p", "svg").attr("class", "lectura-serie").attr("aria-hidden", "true");
const x = d3.scaleLinear().domain(d3.extent(data, d => d[cfg.x])).range([0, iw]);
const vals = [...cfg.series.map(s => s.k), ...(cfg.banda ? [cfg.banda.hi] : [])].flatMap(k => data.map(d => d[k])).filter(v => v != null);
const y = cfg.log ? d3.scaleLog().domain([d3.min(vals) / 1.2, d3.max(vals) * 1.2]).range([ih, 0])
: d3.scaleLinear().domain([cfg.conNegativos ? Math.min(0, d3.min(vals) * 1.06) : cfg.y0 ?? 0, cfg.y1 ?? d3.max(vals) * 1.06]).nice().range([ih, 0]);
const marcas5 = ax => cfg.log ? ax.tickValues(marcasLog(y.domain())) : ax.ticks(5);
g.append("g").attr("class","grilla").call(marcas5(d3.axisLeft(y)).tickSize(-iw).tickFormat("")).call(a => a.select(".domain").remove());
g.append("g").attr("class","eje").call(marcas5(d3.axisLeft(y)).tickFormat(cfg.yf || n0).tickSize(0).tickPadding(8)).call(a => a.select(".domain").remove());
const anios = d3.range(Math.ceil(x.domain()[0]), Math.floor(x.domain()[1]) + 1);
const paso = angosto ? Math.max(2, Math.ceil(anios.length / 6)) : Math.max(1, Math.ceil(anios.length / 12));
g.append("g").attr("class","eje").attr("transform",`translate(0,${ih})`).call(cfg.mensual
? d3.axisBottom(x).tickValues(anios.filter(v => v % paso === 0)).tickFormat(d3.format("d")).tickSizeOuter(0)
: d3.axisBottom(x).tickValues(marcasAnio(x.ticks(angosto ? 4 : 7), iw)).tickFormat(d3.format("d")).tickSizeOuter(0));
if (cfg.ref != null && !cfg.log) {
g.append("line").attr("x1",0).attr("x2",iw).attr("y1",y(cfg.ref)).attr("y2",y(cfg.ref)).attr("stroke",css("--faint")).attr("stroke-width",1).attr("stroke-dasharray", cfg.refLab ? "4 4" : null);
if (cfg.refLab) g.append("text").attr("x", 6).attr("y", y(cfg.ref) + 16).attr("class","etq-suave").text(angosto && cfg.refLabCorto ? cfg.refLabCorto : cfg.refLab);
}
(cfg.eventos || []).filter(e => x(e.x) > 0 && x(e.x) <= iw).forEach((e, i) => {
g.append("line").attr("x1", x(e.x)).attr("x2", x(e.x)).attr("y1", 0).attr("y2", ih).attr("stroke", css("--faint")).attr("stroke-dasharray", "3 3");
g.append("text").attr("x", x(e.x) + 4).attr("y", 10 + (i % (angosto ? 3 : 2)) * 15).attr("class", "etq-suave").text(angosto && e.corto ? e.corto : e.lab);
});
if (cfg.banda) {
const bd = data.filter(d => d[cfg.banda.lo] != null && d[cfg.banda.hi] != null);
const ar = g.append("path").datum(bd).attr("fill", cfg.banda.c || css("--celeste-suave")).attr("opacity", .85)
.attr("d", d3.area().x(d => x(d[cfg.x])).y0(d => y(d[cfg.banda.lo])).y1(d => y(d[cfg.banda.hi])).curve(d3.curveMonotoneX));
if (cfg.anim) aparecer(ar, 150);
}
const etiquetas = [], fin = g.append("g");
cfg.series.forEach(s => {
const serie = data.filter(d => d[s.k] != null);
const trazo = g.append("path").datum(cfg.huecos ? data : serie).attr("fill","none").attr("stroke", s.c).attr("stroke-width", s.w || 2.4)
.attr("stroke-linejoin","round").attr("stroke-linecap","round").attr("stroke-dasharray", s.dash || null)
.attr("d", d3.line().defined(d => d[s.k] != null).x(d => x(d[cfg.x])).y(d => y(d[s.k])).curve(cfg.escalones ? d3.curveStepAfter : d3.curveMonotoneX));
if (cfg.anim) trazar(trazo, s.dash);
const u = serie[serie.length - 1];
fin.append("circle").attr("cx", x(u[cfg.x])).attr("cy", y(u[s.k])).attr("r", 3.5).attr("fill", s.c);
etiquetas.push({y: y(u[s.k]), s, v: u[s.k]});
});
fin.raise();
etiquetas.sort((a,b) => a.y - b.y);
for (let i = 1; i < etiquetas.length; i++) if (etiquetas[i].y - etiquetas[i-1].y < 32) etiquetas[i].y = etiquetas[i-1].y + 32;
etiquetas.forEach(l => {
const t = fin.append("text").attr("x", iw + 10).attr("y", l.y - 4).attr("class","etq-fuerte").style("fill", l.s.ct ? css(l.s.ct) : l.s.c);
t.append("tspan").text(l.s.corto || l.s.lab);
t.append("tspan").attr("x", iw + 10).attr("dy", 15).attr("class","etq-suave").text((cfg.vf || n0)(l.v));
});
if (cfg.anim) aparecer(fin, 800);
const vf = cfg.vf || n0;
const leer = d => `<b>${cfg.xl ? cfg.xl(d) : d[cfg.x]}</b>` +
cfg.series.filter(s => d[s.k] != null).map(s => `<span><i style="background:${s.c}"></i>${s.lab} ${vf(d[s.k])}</span>`).join("") +
(cfg.series.some(s => d[s.k] != null) ? "" : "<span>sin dato en la fuente</span>") +
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
function areasApiladas(el, cfg) {
const angosto = el.clientWidth < 520;
const C = lienzo(el, angosto ? 300 : 340, {t:14, r: angosto ? 96 : 132, b:30, l:44});
const {g, iw, ih} = C, data = cfg.data, series = cfg.series, vf = cfg.vf || n0;
const lec = d3.select(el).insert("p", "svg").attr("class", "lectura-serie").attr("aria-hidden", "true");
const pila = d3.stack().keys(series.map(s => s.k)).value((d, k) => Math.max(0, d[k] || 0))(data);
const x = d3.scaleLinear().domain(d3.extent(data, d => d[cfg.x])).range([0, iw]);
const y = d3.scaleLinear().domain([0, d3.max(pila[pila.length - 1], d => d[1]) * 1.06]).nice().range([ih, 0]);
g.append("g").attr("class","grilla").call(d3.axisLeft(y).ticks(5).tickSize(-iw).tickFormat("")).call(a => a.select(".domain").remove());
g.append("g").attr("class","eje").call(d3.axisLeft(y).ticks(5).tickFormat(cfg.yf || n0).tickSize(0).tickPadding(8)).call(a => a.select(".domain").remove());
const anios = d3.range(Math.ceil(x.domain()[0]), Math.floor(x.domain()[1]) + 1);
const paso = Math.ceil(anios.length / (angosto ? 5 : 10));
g.append("g").attr("class","eje").attr("transform",`translate(0,${ih})`)
.call(d3.axisBottom(x).tickValues(anios.filter(v => (v - anios[0]) % paso === 0)).tickFormat(d3.format("d")).tickSizeOuter(0));
const area = d3.area().x(d => x(d.data[cfg.x])).y0(d => y(d[0])).y1(d => y(d[1])).curve(d3.curveMonotoneX);
const capas = g.append("g");
capas.selectAll("path").data(pila).join("path").attr("fill", (s, i) => series[i].c).attr("d", area);
const tope = g.append("path").datum(data).attr("fill", "none").attr("stroke", css("--ink")).attr("stroke-width", 1.2).attr("stroke-opacity", .55)
.attr("d", d3.line().x(d => x(d[cfg.x])).y(d => y(d3.sum(series, s => Math.max(0, d[s.k] || 0)))).curve(d3.curveMonotoneX));
if (cfg.anim) {
const id = `ap${++nRecorte}`, r = C.svg.append("defs").append("clipPath").attr("id", id).append("rect").attr("x", -2).attr("y", -20).attr("height", ih + 40).attr("width", 0);
capas.attr("clip-path", `url(#${id})`); tope.attr("clip-path", `url(#${id})`);
r.transition().duration(DUR_G).ease(EASE).attr("width", iw + 4).on("end", () => { capas.attr("clip-path", null); tope.attr("clip-path", null); });
}
const ult = pila.map((s, i) => ({s: series[i], y0: s[s.length - 1][0], y1: s[s.length - 1][1]})).filter(o => y(o.y0) - y(o.y1) > 9);
const etq = ult.map(o => ({o, y: (y(o.y0) + y(o.y1)) / 2})).sort((a, b) => b.y - a.y);
for (let i = 1; i < etq.length; i++) if (etq[i - 1].y - etq[i].y < 15) etq[i].y = etq[i - 1].y - 15;
const fin = g.append("g");
etq.forEach(e => fin.append("text").attr("x", iw + 8).attr("y", e.y).attr("dy", ".35em").attr("class", "etq-fuerte").style("fill", e.o.s.ct ? css(e.o.s.ct) : e.o.s.c === "#A9CBEA" ? css("--celeste-fuerte") : e.o.s.c).text(e.o.s.lab));
if (cfg.anim) aparecer(fin, 150);
const total = d => d3.sum(series, s => d[s.k] || 0);
const leer = d => `<b>${cfg.xl ? cfg.xl(d) : d[cfg.x]}</b><span>Total ${vf(total(d))}${cfg.unidad ? " " + cfg.unidad : ""}</span>` +
[...series].reverse().map(s => `<span><i style="background:${s.c}"></i>${s.lab} ${vf(d[s.k] || 0)}</span>`).join("");
const u = data[data.length - 1];
lec.html(leer(u));
const regla = g.append("line").attr("y1", 0).attr("y2", ih).attr("stroke", css("--ink")).attr("stroke-opacity", .5).attr("opacity", 0);
const leerEn = ev => {
const [mx] = d3.pointer(ev), xv = x.invert(mx), d = d3.least(data, r => Math.abs(r[cfg.x] - xv)); if (!d) return;
regla.attr("x1", x(d[cfg.x])).attr("x2", x(d[cfg.x])).attr("opacity", 1); lec.html(leer(d));
};
C.svg.style("touch-action", "pan-y");
g.append("rect").attr("width", iw).attr("height", ih).attr("fill", "transparent").on("pointerdown", leerEn).on("pointermove", leerEn)
.on("pointerleave", ev => { if (ev.pointerType !== "mouse") return; regla.attr("opacity", 0); lec.html(leer(u)); });
}
function recortarEtq(nodo, max) {
if (!(nodo.getComputedTextLength() > max)) return;
const completo = nodo.textContent;
let t = completo;
while (t.length > 1 && nodo.getComputedTextLength() > max) { t = t.slice(0, -1).trimEnd(); nodo.textContent = t + "…"; }
d3.select(nodo).append("title").text(completo);
}
const margenIzq = el => { const t = el.closest(".ficha"), s = el.querySelector("svg"); if (!t || !s) return 0;
const borde = s.getBoundingClientRect().left - t.getBoundingClientRect().left - 4;
return Math.max(0, Math.min(borde, parseFloat(getComputedStyle(t).paddingLeft) || 0)); };
function barrasH(el, cfg) {
const data = cfg.sinOrden ? [...cfg.data] : [...cfg.data].sort((a,b) => d3.descending(a[cfg.k], b[cfg.k]));
const angosto = el.clientWidth < 520, fila = angosto ? 20 : 24;
const izq = angosto ? (cfg.lAngosto || 118) : (cfg.l || 150);
const C = lienzo(el, data.length * fila + 34 + (cfg.ref2 != null ? 14 : 0), {t:24, r:54, b:10, l: izq});
const {g, iw} = C;
const ext = d3.extent(data, d => d[cfg.k]);
const x = d3.scaleLinear().domain([Math.min(0, ext[0]), Math.max(0, ext[1])]).nice().range([0, iw]);
const y = d3.scaleBand().domain(data.map(d => d.codigo_indec)).range([0, data.length * fila]).padding(.28);
g.append("g").attr("class","eje").call(d3.axisTop(x).ticks(angosto ? (cfg.ntAngosto || 2) : (cfg.nt || 5)).tickFormat(cfg.af || n0).tickSize(0).tickPadding(6)).call(a => a.select(".domain").remove());
if (x.domain()[0] < 0) g.append("line").attr("x1",x(0)).attr("x2",x(0)).attr("y1",0).attr("y2",data.length*fila).attr("stroke",css("--faint"));
const filas = g.selectAll("g.f").data(data).join("g").attr("class","f").attr("transform", d => `translate(0,${y(d.codigo_indec)})`);
const marca = cfg.marcar ? (d => cfg.marcar.has(d.codigo_indec)) : (d => d.codigo_indec === prov);
const hayMarca = cfg.marcar ? cfg.marcar.size > 0 : !!prov;
const claseProv = (d, base) => marca(d) ? "etq-fuerte" : base;
const bueno = d => cfg.mejor === "baja" ? d[cfg.k] < 0 : d[cfg.k] > 0;
const colorCambio = (d, t) => d[cfg.k] === 0 ? css("--faint") : css(bueno(d) ? (t ? "--bueno-texto" : "--bueno") : (t ? "--malo-texto" : "--malo"));
const relleno = d => cfg.mejor ? colorCambio(d) : cfg.color ? cfg.color(d) : marca(d) ? css("--celeste-fuerte") : css("--celeste");
const opac = d => hayMarca && !marca(d) ? .55 : 1;
const barras = filas.append("rect").attr("x", d => x(Math.min(0, d[cfg.k]))).attr("height", y.bandwidth()).attr("rx", rBarra(y.bandwidth()))
.attr("width", d => Math.abs(x(d[cfg.k]) - x(0))).attr("fill", relleno).attr("opacity", opac);
const ponerNombre = function(d) { this.textContent = angosto && cfg.corto ? cfg.corto(d) : d.territorio; recortarEtq(this, izq - 10 + margenIzq(el)); };
const nombres = filas.append("text").attr("x", -10).attr("y", y.bandwidth()/2).attr("dy",".35em").attr("text-anchor","end")
.attr("class", d => claseProv(d, "etq")).each(ponerNombre);
const valores = filas.append("text").attr("x", d => d[cfg.k] < 0 ? x(0) + 6 : x(d[cfg.k]) + 6).attr("y", y.bandwidth()/2).attr("dy",".35em")
.attr("class", d => claseProv(d, "etq-suave")).text(d => (cfg.vf || n1)(d[cfg.k]));
if (cfg.mejor) valores.style("fill", d => colorCambio(d, true));
const notas = g.append("g").attr("class", "anotas").attr("pointer-events", "none");
const anotar = () => {
notas.selectAll("*").remove();
if (!cfg.anota) return;
const borde = C.w - izq - 4;
const poner = (d, textos) => {
const yy = y(d.codigo_indec) + y.bandwidth() / 2, fin = x(Math.max(0, d[cfg.k])), largo = fin - x(0);
const vw = valores.filter(v => v === d).node().getComputedTextLength();
for (const tx of textos) {
const t = notas.append("text").attr("class", "anota").attr("y", yy).attr("dy", ".35em").text(tx), w = t.node().getComputedTextLength();
if (fin + 6 + vw + 10 + w <= borde) return t.attr("x", fin + 6 + vw + 10);
if (largo >= w + 16) return t.attr("x", fin - 8).attr("text-anchor", "end").attr("class", "anota adentro" + (marca(d) && !cfg.mejor && !cfg.color ? " sobre-fuerte" : ""))
.style("stroke", d3.interpolateRgb(css("--bg"), relleno(d))(opac(d)));
t.remove();
}
};
const alta = data[0], mia = hayMarca && !cfg.marcar ? data.find(marca) : null, n = data.length;
if (mia === alta) return poner(alta, ["tu provincia, la más alta", "la más alta"]);
poner(alta, ["la más alta"]);
if (mia) { const i = data.indexOf(mia) + 1; poner(mia, [`tu provincia, puesto ${i} de ${n}`, `puesto ${i} de ${n}`, `${i}.º de ${n}`]); }
};
anotar();
if (cfg.marcar) el.resaltar = () => {};
else if (!cfg.cambiaConProv) el.resaltar = () => {
pasar(barras).attr("fill", relleno).attr("opacity", opac);
nombres.attr("class", d => claseProv(d, "etq")).each(ponerNombre); valores.attr("class", d => claseProv(d, "etq-suave"));
anotar();
};
if (cfg.anim) {
barras.attr("x", x(0)).attr("width", 0).transition().delay(escalon).duration(DUR_G).ease(EASE)
.attr("x", d => x(Math.min(0, d[cfg.k]))).attr("width", d => Math.abs(x(d[cfg.k]) - x(0)));
valores.attr("opacity", 0).transition().delay(escalon).duration(DUR_G).attr("opacity", 1);
aparecer(notas, 150);
}
const vf = cfg.vf || n1, pais = cfg.ref ?? cfg.pais, r1v = v => +(+v).toFixed(1);
const filaPais = d => pais == null ? "" : `<br><span class="tip-pais">${cfg.paisLab || "País"}: ${vf(pais)}` + (cfg.dif === "puntos" && r1v(d[cfg.k]) !== r1v(pais)
? `, ${n1(Math.abs(r1v(d[cfg.k]) - r1v(pais)))} puntos ${r1v(d[cfg.k]) > r1v(pais) ? "más" : "menos"}` : "") + "</span>";
const tipFila = cfg.sinTip ? null : cfg.tip ? (d => cfg.tip(d) + filaPais(d)) : pais != null ? (d => `<b>${d.territorio}</b><br>${vf(d[cfg.k])}` + filaPais(d)) : null;
if (tipFila) {
filas.insert("rect", ":first-child").attr("x", -izq).attr("width", iw + izq + 54).attr("height", y.bandwidth()).attr("fill", "transparent");
filas.on("pointerenter", (ev, d) => mostrarTip(el, tipFila(d), izq + x(Math.max(0, d[cfg.k])), 24 + y(d.codigo_indec)))
.on("pointerleave", ocultarSiMouse);
}
if (cfg.ref != null) {
g.append("line").attr("x1",x(cfg.ref)).attr("x2",x(cfg.ref)).attr("y1",-4).attr("y2",data.length*fila).attr("stroke",css("--ink")).attr("stroke-dasharray","3 3").lower();
const rl = g.append("text").attr("x", x(cfg.ref) + 5).attr("y", data.length*fila + 4).attr("class","etq-suave").text(cfg.refLab);
if (rl.node().getComputedTextLength?.() > iw + 50 - x(cfg.ref)) rl.attr("x", x(cfg.ref) - 5).attr("text-anchor", "end");
}
if (cfg.ref2 != null) {
g.append("line").attr("x1",x(cfg.ref2)).attr("x2",x(cfg.ref2)).attr("y1",-4).attr("y2",data.length*fila).attr("stroke",css("--ocde")).attr("stroke-dasharray","4 3").attr("stroke-width",2).lower();
const der = cfg.ref == null || cfg.ref2 >= cfg.ref;
g.append("text").attr("x", x(cfg.ref2) + (der ? 5 : -5)).attr("y", data.length*fila + 18).attr("text-anchor", der ? "start" : "end")
.attr("class","etq-fuerte").attr("fill",css("--ocde")).text(cfg.ref2Lab);
}
notas.raise();
}
function pesas(el, cfg) {
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
g.append("line").attr("x1",x(cfg.ref)).attr("x2",x(cfg.ref)).attr("y1",-4).attr("y2",data.length*fila).attr("stroke",css(cfg.refC || "--ocde")).attr("stroke-dasharray","4 3").attr("stroke-width",2);
const rl = g.append("text").attr("x", x(cfg.ref) + 5).attr("y", data.length*fila + 6).attr("class","etq-fuerte").attr("fill",css(cfg.refC || "--ocde")).text(cfg.refLab);
if (x(cfg.ref) + 5 + rl.node().getComputedTextLength() > iw + 40) rl.attr("x", x(cfg.ref) - 5).attr("text-anchor", "end");
}
const mejoro = d => cfg.mejor === "baja" ? d[b] < d[a] : d[b] > d[a];
const tono = (d, suave) => d[b] === d[a] ? css("--faint") : css(`--${mejoro(d) ? "bueno" : "malo"}${suave ? "-suave" : ""}`);
const opac = d => prov && d.codigo_indec !== prov ? .45 : 1;
const relleno = d => cfg.mejor ? tono(d) : d.codigo_indec === prov ? css("--celeste-fuerte") : css("--celeste");
const f = g.selectAll("g.f").data(data).join("g").attr("transform", d => `translate(0,${y(d.codigo_indec) + y.bandwidth()/2})`)
.attr("opacity", opac);
const tramo = f.append("line").attr("x1", d => x(d[b])).attr("x2", d => x(d[a])).attr("stroke", d => cfg.mejor ? tono(d, true) : css("--celeste-suave")).attr("stroke-width", 5).attr("stroke-linecap","round");
f.append("circle").attr("cx", d => x(d[a])).attr("r", 5).attr("fill", css("--bg")).attr("stroke", css(cfg.mejor ? "--faint" : "--celeste")).attr("stroke-width", 2);
const punto = f.append("circle").attr("cx", d => x(d[b])).attr("r", 5.5).attr("fill", relleno);
const nombres = f.append("text").attr("x", -10).attr("dy",".35em").attr("text-anchor","end").attr("class", d => claseProv(d, "etq")).text(d => d.territorio);
el.resaltar = () => { pasar(f).attr("opacity", opac); pasar(punto).attr("fill", relleno); nombres.attr("class", d => claseProv(d, "etq")); };
const valor = f.append("text").attr("x", d => x(Math.max(d[a], d[b])) + 10).attr("dy",".35em").attr("class","etq-suave").text(d => vf(d[b]));
if (cfg.mejor) valor.style("fill", d => d[b] === d[a] ? null : css(mejoro(d) ? "--bueno-texto" : "--malo-texto"));
if (cfg.anim) {
tramo.attr("x1", d => x(d[a])).transition().delay(escalon).duration(DUR_G).ease(EASE).attr("x1", d => x(d[b]));
punto.attr("cx", d => x(d[a])).transition().delay(escalon).duration(DUR_G).ease(EASE).attr("cx", d => x(d[b]));
valor.attr("opacity", 0).transition().delay(escalon).duration(DUR_G).attr("opacity", 1);
}
const r1v = v => +(+v).toFixed(1);
const cambioTxt = d => { const c = r1v(r1v(d[b]) - r1v(d[a])); return c === 0 ? "Sin cambio" : `${c < 0 ? "Bajó" : "Subió"} ${n1(Math.abs(c))}${cfg.uDif || ""}`; };
f.on("pointerenter", function(ev, d) { const yy = y(d.codigo_indec) + 24; mostrarTip(el, `<b>${d.territorio}</b><br>${la}: ${vf(d[a])}<br>${lb}: ${vf(d[b])}` +
(cfg.mejor ? `<br>${cambioTxt(d)}` : "") + (cfg.pais ? `<br><span class="tip-pais">País: ${vf(cfg.pais[0])} y ${vf(cfg.pais[1])}</span>` : ""), x(d[b]) + (angosto?118:150), yy); })
.on("pointerleave", ocultarSiMouse);
}
function columnas(el, cfg) {
const MES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const C = lienzo(el, 280, {t:26, r:6, b:28, l:6});
const {g, iw, ih} = C, data = cfg.data;
const x = d3.scaleBand().domain(data.map(d => d.mes)).range([0, iw]).padding(.22);
const y = d3.scaleLinear().domain([0, d3.max(data, d => d.gwh) * 1.08]).range([ih, 0]);
const mx = d3.max(data, d => d.gwh), mn = d3.min(data, d => d.gwh);
const cols = g.selectAll("rect").data(data).join("rect").attr("x", d => x(d.mes)).attr("width", x.bandwidth()).attr("rx", rBarra(x.bandwidth()))
.attr("y", d => y(d.gwh)).attr("height", d => ih - y(d.gwh))
.attr("fill", d => d.gwh === mx ? css("--celeste-fuerte") : d.gwh === mn ? css("--sol") : css("--celeste"));
const vals = g.selectAll("text.v").data(data).join("text").attr("class","etq-suave").attr("text-anchor","middle")
.attr("x", d => x(d.mes) + x.bandwidth()/2).attr("y", d => y(d.gwh) - 6)
.text(d => el.clientWidth < 520 ? n1(d.gwh/1000) : n0(d.gwh));
if (cfg.anim) {
cols.attr("y", ih).attr("height", 0).transition().delay(escalon).duration(DUR_G).ease(EASE)
.attr("y", d => y(d.gwh)).attr("height", d => ih - y(d.gwh));
vals.attr("opacity", 0).transition().delay(escalon).duration(DUR_G).attr("opacity", 1);
}
g.append("g").attr("class","eje").attr("transform",`translate(0,${ih})`).call(d3.axisBottom(x).tickFormat(m => MES[m-1]).tickSize(0).tickPadding(8)).call(a => a.select(".domain").remove());
if (el.clientWidth < 520) g.append("text").attr("class","etq-suave").attr("x",0).attr("y",-12).text("Miles de GWh");
}
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
if (cfg.anim) r.attr("opacity", 0).transition().delay(escalon).duration(DUR_G).attr("opacity", 1);
const decadas = data.map(d => d.anio).filter(a => a % 10 === 0 && (!angosto || a % 20 === 0));
g.append("g").attr("class","eje").attr("transform", `translate(0,${ih})`)
.call(d3.axisBottom(x).tickValues(decadas).tickSize(4).tickPadding(6)).call(a => a.select(".domain").remove());
const fmt = v => (v > 0 ? "+" : "") + n2(v) + " °C";
r.on("pointerenter", function(ev, d) { d3.select(this).attr("stroke", css("--ink")).attr("stroke-width", 1.5);
mostrarTip(el, `<b>${d.anio}</b><br>${fmt(d[cfg.k])}`, x(d.anio) + x.bandwidth() / 2 + 4, 10); })
.on("pointerleave", function() { d3.select(this).attr("stroke", null); ocultarTip(); });
}
function apiladasH(el, cfg) {
const data = cfg.data, angosto = el.clientWidth < 520, fila = angosto ? 20 : 24;
const izq = cfg.izq ? cfg.izq(angosto) : cfg.bandera ? (angosto ? 172 : 190) : (angosto ? 112 : 150), xNom = cfg.bandera ? -40 : -10;
const C = lienzo(el, data.length * fila + 30, {t:22, r:18, b:6, l: izq});
const {g, iw} = C;
const x = d3.scaleLinear().domain([0, cfg.max || 100]).range([0, iw]);
const y = d3.scaleBand().domain(data.map(d => d.codigo_indec)).range([0, data.length * fila]).padding(.22);
g.append("g").attr("class","eje").call(d3.axisTop(x).tickValues(cfg.ticks || [0, 25, 50, 75, 100]).tickFormat(cfg.ejeF || (v => v + "%")).tickSize(0).tickPadding(6)).call(a => a.select(".domain").remove());
const f = g.selectAll("g.f").data(data).join("g").attr("class","f").attr("transform", d => `translate(0,${y(d.codigo_indec)})`);
const clase = d => (cfg.fuerte ? cfg.fuerte(d) : d.codigo_indec === prov || d.codigo_indec === "00") ? "etq-fuerte" : "etq";
const opac = d => !cfg.sinProv && prov && d.codigo_indec !== prov && d.codigo_indec !== "00" ? .55 : 1;
const nombres = f.append("text").attr("x", xNom).attr("y", y.bandwidth()/2).attr("dy",".35em").attr("text-anchor","end").attr("class", clase).text(d => d.territorio);
if (cfg.recortar) nombres.each(function() { recortarEtq(this, izq + xNom - 4); });
let esquinas = "";
if (cfg.bandera) {
esquinas = `band${++nRecorte}`;
C.svg.append("defs").append("clipPath").attr("id", esquinas).attr("clipPathUnits", "objectBoundingBox")
.append("rect").attr("width", 1).attr("height", 1).attr("rx", 3 / 24).attr("ry", 3 / 16);
}
if (cfg.bandera) f.each(function(d) {
const v = cfg.bandera(d), s = d3.select(this), y0 = (y.bandwidth() - 16) / 2;
if (typeof v === "number") {
s.append("rect").attr("class", "bandera-grupo").attr("x", -34).attr("y", y0).attr("width", 24).attr("height", 16).attr("rx", 3);
s.append("text").attr("class", "bandera-grupo-n").attr("x", -22).attr("y", y0 + 8).attr("dy", ".35em").attr("text-anchor", "middle").text(v);
} else if (NOMBRES[v]) {
s.append("image").attr("href", `datos/banderas/${v}.png`).attr("x", -34).attr("y", y0).attr("width", 24).attr("height", 16).attr("preserveAspectRatio", "none")
.attr("clip-path", `url(#${esquinas})`);
s.append("rect").attr("class", "bandera-borde").attr("x", -33.5).attr("y", y0 + .5).attr("width", 23).attr("height", 15).attr("rx", 2.5);
}
});
el.resaltar = () => { nombres.attr("class", clase); f.each(function(d) { pasar(d3.select(this).selectAll("rect.parte")).attr("opacity", opac(d)); }); };
f.each(function(d) {
let acc = 0;
const partes = cfg.claves.map(k => { const v = d[k.k] || 0, p = {k, x0: acc, v}; acc += v; return p; });
const tramos = d3.select(this).append("g").attr("clip-path", recorte(C.svg, 0, 0, x(acc) - 1, y.bandwidth(), rBarra(y.bandwidth())));
const r = tramos.selectAll("rect.parte").data(partes).join("rect").attr("class", "parte").attr("y", 0).attr("height", y.bandwidth())
.attr("x", p => x(p.x0)).attr("width", p => Math.max(0, x(p.x0 + p.v) - x(p.x0) - (p.v > 0 ? 1 : 0))).attr("fill", p => p.k.c)
.attr("opacity", opac(d));
const t = d3.select(this).selectAll("text.v").data(partes.filter(p => !cfg.sinValores && x(p.x0 + p.v) - x(p.x0) > 34)).join("text").attr("class","v")
.attr("x", p => x(p.x0) + 5).attr("y", y.bandwidth()/2).attr("dy",".35em").attr("font-size", 11.5).attr("font-family","var(--mono)")
.attr("fill", p => p.k.texto || "#fff").text(p => (cfg.valF || n0)(p.v));
if (cfg.anim) { r.attr("width", 0).transition().duration(DUR_G).ease(EASE).attr("width", p => Math.max(0, x(p.x0 + p.v) - x(p.x0) - (p.v > 0 ? 1 : 0)));
aparecer(t, 150); }
if (cfg.alFinal) { const tf = d3.select(this).append("text").attr("x", x(acc) + 5).attr("y", y.bandwidth()/2).attr("dy",".35em").attr("font-size", 11.5)
.attr("font-family","var(--mono)").attr("fill", "var(--ink)").text(cfg.alFinal(d)); if (cfg.anim) aparecer(tf, 150); }
});
f.on("pointerenter", function(ev, d) {
mostrarTip(el, `<b>${d.territorio}</b>${cfg.tipExtra ? cfg.tipExtra(d) : ""}<br>` + cfg.claves.filter(k => d[k.k] != null).map(k => `<span style="color:${k.c}">■</span> ${k.lab}: ${(cfg.tipF || pct)(d[k.k])}`).join("<br>"),
izq + iw / 2, y(d.codigo_indec) + 22); })
.on("pointerleave", ocultarSiMouse);
}
function columnasApiladas(el, cfg) {
const data = cfg.data, angosto = el.clientWidth < 520;
const C = lienzo(el, angosto ? 300 : 340, {t:14, r:8, b:28, l: cfg.l || 36});
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
const r = d3.select(this).append("g").attr("clip-path", recorte(C.svg, 0, y(acc), x.bandwidth(), ih - y(acc), rBarra(x.bandwidth())))
.selectAll("rect").data(partes).join("rect").attr("width", x.bandwidth()).attr("fill", p => p.k.c)
.attr("y", p => y(p.y0 + p.v)).attr("height", p => y(p.y0) - y(p.y0 + p.v));
if (cfg.anim) r.attr("y", ih).attr("height", 0).transition().delay(x(d.anio) / iw * 150).duration(DUR_G).ease(EASE)
.attr("y", p => y(p.y0 + p.v)).attr("height", p => y(p.y0) - y(p.y0 + p.v));
});
col.append("rect").attr("width", x.bandwidth() + 2).attr("x", -1).attr("height", ih).attr("fill","transparent")
.on("pointerenter", function(ev, d) {
mostrarTip(el, `<b>${d.periodo || d.anio}</b>, ${(cfg.vf || (v => v))(tot(d))} ${cfg.unidad || "bancas"}<br>` + cfg.claves.filter(k => d[k.k]).map(k => `<span style="color:${k.c}">■</span> ${k.lab}: ${(cfg.vf || (v => v))(d[k.k])}`).join("<br>"), (cfg.l || 36) + x(d.anio) + x.bandwidth() / 2, 10); })
.on("pointerleave", ocultarSiMouse);
}
let GEO = null;
const cargarGeo = () => GEO ? Promise.resolve(GEO) : fetch("datos/provincias.geojson").then(r => r.json()).then(j => (GEO = j));
function mapaProv(el, cfg) {
if (!GEO) {
if (!el.querySelector("svg")) esperando(el);
cargarGeo().then(() => mapaProv(el, cfg)).catch(() => sinDatos(el, "No se pudo cargar el mapa."));
return;
}
const val = Object.fromEntries(cfg.filas.filter(r => r.codigo_indec !== "00").map(r => [r.codigo_indec, r]));
const w = Math.min(cfg.max || 560, Math.max(220, el.clientWidth)), h = Math.round(w * 1.55);
el.innerHTML = ""; el.removeAttribute("aria-busy");
const svg = d3.select(el).append("svg").attr("class", "mapa-prov").attr("viewBox", `0 0 ${w} ${h + 44}`).style("max-width", w + "px").attr("role", "img")
.attr("aria-label", `Mapa de las provincias: ${cfg.nombre.toLowerCase()}`);
const proy = d3.geoMercator().fitExtent([[6, 6], [w - 6, h - 6]], GEO), camino = d3.geoPath(proy);
const vals = Object.values(val).map(r => r[cfg.k]).filter(v => v != null).sort(d3.ascending);
const cortes = cfg.cortes || [.2, .4, .6, .8].map(q => d3.quantile(vals, q));
const escala = d3.scaleThreshold().domain(cortes).range(COLORES_DEP);
const color = c => val[c]?.[cfg.k] == null ? css("--line") : escala(val[c][cfg.k]);
const tipo = c => { const r = val[c];
return `<b>${r ? r.territorio : NOMBRES[c]}</b><br>${cfg.nombre}: ${r && r[cfg.k] != null ? cfg.vf(r[cfg.k]) : "sin dato"}` + (cfg.extra && r ? cfg.extra(r) : ""); };
const provs = svg.append("g").selectAll("path").data(GEO.features).join("path").attr("class", "prov").attr("d", camino)
.attr("fill", f => color(f.properties.codigo_indec));
const [cx, cy] = proy([-58.44, -34.61]), lado = Math.max(16, Math.round(w * .045)), bx = Math.min(w - lado - 4, cx + 24), by = cy - lado - 16;
const caba = svg.append("g").attr("class", "caba-aparte");
caba.append("line").attr("x1", cx).attr("y1", cy).attr("x2", bx).attr("y2", by + lado / 2);
caba.append("rect").datum({properties: {codigo_indec: "02"}}).attr("class", "prov").attr("x", bx).attr("y", by).attr("width", lado).attr("height", lado)
.attr("rx", 2).attr("fill", color("02"));
caba.append("text").attr("class", "mp-ley").attr("x", bx + lado / 2).attr("y", by - 4).attr("text-anchor", "middle").text("CABA");
const todas = svg.selectAll(".prov");
const marcar = () => { todas.classed("elegida", d => d.properties.codigo_indec === prov); provs.filter(".elegida").raise(); };
marcar(); el.resaltar = marcar;
if (cfg.anim && !REDUCIR) todas.attr("opacity", 0).transition().delay(escalon).duration(DUR_G).attr("opacity", 1);
todas.on("pointermove pointerdown", (ev, d) => { const [mx, my] = d3.pointer(ev, el); mostrarTip(el, tipo(d.properties.codigo_indec), mx, my); })
.on("pointerleave", ocultarSiMouse);
const paso = Math.min(50, (w - 12) / 5), ley = svg.append("g").attr("transform", `translate(${Math.max(6, w / 2 - paso * 2.5)},${h + 8})`);
COLORES_DEP.forEach((c, i) => ley.append("rect").attr("x", i * paso).attr("width", paso - 2).attr("height", 10).attr("rx", 2).attr("fill", c));
["", ...cortes.map(v => cfg.vf(v))].forEach((t, i) => ley.append("text").attr("class", "mp-ley").attr("x", i * paso).attr("y", 26)
.attr("text-anchor", i ? "middle" : "start").text(t));
}
let TOPO_DEP = null;
const cargarTopoDep = () => TOPO_DEP ? Promise.resolve(TOPO_DEP) : d3.json("datos/departamentos.topo.json").then(t => (TOPO_DEP = t));
const COLORES_DEP = ["#EEF5FC", "#BBD6EF", "#7FB0DD", "#3F86C6", "#1F5E97"];
function mapaDep(el, cfg) {
if (!TOPO_DEP) {
if (!el.querySelector("svg")) esperando(el);
cargarTopoDep().then(() => mapaDep(el, cfg)).catch(() => sinDatos(el, "No se pudo cargar el mapa."));
return;
}
const obj = TOPO_DEP.objects.departamentos, todos = topojson.feature(TOPO_DEP, obj).features;
const val = Object.fromEntries(cfg.filas.map(r => [r.codigo_dep, r[cfg.k]]));
const enProv = NOMBRES[prov] ? todos.filter(f => f.properties.prov === prov) : todos;
const w = Math.min(560, Math.max(220, el.clientWidth)), h = NOMBRES[prov] ? Math.round(w * 1.1) : Math.round(w * 1.55);
el.innerHTML = ""; el.removeAttribute("aria-busy"); el.resaltar = null;
const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${w} ${h + 44}`).attr("role", "img")
.attr("aria-label", `Mapa por departamento: ${cfg.nombre.toLowerCase()}${NOMBRES[prov] ? ", " + NOMBRES[prov] : ""}`);
const proy = d3.geoMercator().fitExtent([[6, 6], [w - 6, h - 6]], {type: "FeatureCollection", features: enProv}), camino = d3.geoPath(proy);
const vals = todos.map(f => val[f.properties.id]).filter(v => v != null).sort(d3.ascending);
const cortes = [.2, .4, .6, .8].map(q => d3.quantile(vals, q));
const escala = d3.scaleThreshold().domain(cortes).range(COLORES_DEP);
const deps = svg.append("g").selectAll("path").data(enProv).join("path").attr("class", "dep").attr("d", camino)
.attr("fill", f => val[f.properties.id] == null ? css("--line") : escala(val[f.properties.id]));
if (cfg.anim && !REDUCIR) deps.attr("opacity", 0).transition().delay(escalon).duration(DUR_G).attr("opacity", 1);
const geoms = NOMBRES[prov] ? {type: "GeometryCollection", geometries: obj.geometries.filter(x => x.properties.prov === prov)} : obj;
svg.append("path").attr("class", "limite").attr("d", camino(topojson.mesh(TOPO_DEP, geoms, (a, b) => a.properties.prov !== b.properties.prov || a === b)));
deps.on("pointermove pointerdown", (ev, f) => {
const v = val[f.properties.id], [mx, my] = d3.pointer(ev, el);
mostrarTip(el, `<b>${f.properties.nombre}</b>, ${NOMBRES[f.properties.prov] || ""}<br>${cfg.nombre}: ${v == null ? cfg.sin || "sin dato" : (cfg.tf || cfg.vf)(v)}` +
(cfg.extra ? cfg.extra(f.properties.id) : ""), mx, my);
}).on("pointerleave", ocultarSiMouse);
const paso = Math.min(50, (w - 12) / (cfg.cero ? 6 : 5)), x0 = cfg.cero ? paso + 4 : 0;
const ley = svg.append("g").attr("transform", `translate(${Math.max(6, w / 2 - (paso * 5 + x0) / 2)},${h + 8})`);
if (cfg.cero) {
ley.append("rect").attr("width", paso - 2).attr("height", 10).attr("rx", 2).attr("fill", css("--line"));
ley.append("text").attr("class", "mp-ley").attr("x", (paso - 2) / 2).attr("y", 26).attr("text-anchor", "middle").text(cfg.cero);
}
COLORES_DEP.forEach((c, i) => ley.append("rect").attr("x", x0 + i * paso).attr("width", paso - 2).attr("height", 10).attr("rx", 2).attr("fill", c));
["", ...cortes.map(v => cfg.vf(v))].forEach((t, i) => ley.append("text").attr("class", "mp-ley").attr("x", x0 + i * paso).attr("y", 26)
.attr("text-anchor", i ? "middle" : "start").text(t));
}
let TOPO_CONC = null;
const cargarConc = () => TOPO_CONC ? Promise.resolve(TOPO_CONC) : d3.json("datos/concesiones.topo.json").then(t => (TOPO_CONC = t));
const PROV_CUENCA = new Set(["Neuquén", "Rio Negro", "Mendoza", "La Pampa"]);
function mapaPozos(el, cfg) {
if (!GEO || !TOPO_CONC) {
if (!el.querySelector("svg")) esperando(el);
Promise.all([cargarGeo(), cargarConc()]).then(() => mapaPozos(el, cfg)).catch(() => sinDatos(el, "No se pudo cargar el mapa."));
return;
}
const cuenca = cfg.vista !== "pais", pozos = T.pozos_no_convencionales;
const w = Math.min(640, Math.max(300, el.clientWidth)), h = Math.round(w * (cuenca ? .92 : 1.55));
el.innerHTML = ""; el.removeAttribute("aria-busy"); el.resaltar = null;
const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${w} ${h}`).attr("role", "img").style("overflow", "hidden")
.attr("aria-label", `Mapa de los ${n0(pozos.length)} pozos no convencionales${cuenca ? " de la cuenca Neuquina" : " del país"} sobre las áreas de concesión`);
const enC = pozos.filter(p => PROV_CUENCA.has(p.provincia)), qx = enC.map(p => p.x).sort(d3.ascending), qy = enC.map(p => p.y).sort(d3.ascending);
const [x0, x1, y0, y1] = [d3.quantile(qx, .02), d3.quantile(qx, .98), d3.quantile(qy, .02), d3.quantile(qy, .98)];
const marco = cuenca ? {type: "MultiPoint", coordinates: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]} : GEO;
const proy = d3.geoMercator().fitExtent([[10, 10], [w - 10, h - 10]], marco), camino = d3.geoPath(proy);
const areas = topojson.feature(TOPO_CONC, TOPO_CONC.objects.concesiones).features;
const prodArea = Object.fromEntries(T.areas_produccion.map(a => [a.codigo, a]));
svg.append("g").selectAll("path").data(GEO.features).join("path").attr("d", camino).attr("fill", css("--superficie-2")).attr("stroke", css("--borde")).attr("stroke-width", .8);
svg.append("g").selectAll("path").data(areas).join("path").attr("d", camino).attr("fill", "#DCE8F4").attr("stroke", "#9DB9D6").attr("stroke-width", .5);
if (cuenca) svg.append("g").selectAll("text").data(GEO.features.map(f => {
const [[a, b], [c, d]] = camino.bounds(f), x0 = Math.max(a, 0), x1 = Math.min(c, w), y0 = Math.max(b, 0), y1 = Math.min(d, h);
return {n: NOMBRES[f.properties.codigo_indec] || f.properties.nombre, x: (x0 + x1) / 2, y: (y0 + y1) / 2, ok: x1 - x0 > 80 && y1 - y0 > 40};
}).filter(d => d.ok)).join("text").attr("class", "etq-suave").attr("x", d => d.x).attr("y", d => d.y).attr("text-anchor", "middle").attr("opacity", .8).text(d => d.n);
const cortes = PG.map_cortes, r = cuenca ? 2.3 : 1.6;
const vis = pozos.map(p => { const [px, py] = proy([p.x, p.y]); return {...p, px, py, c: d3.bisectLeft(cortes, +p.inicio.slice(0, 4)), act: p.pet_bpd > 0 || p.gas_miles_m3d > 0}; })
.filter(p => p.px >= 0 && p.px <= w && p.py >= 0 && p.py <= h).sort((a, b) => a.act - b.act || a.c - b.c);
const opac = p => p.act ? .95 : .35;
const puntos = svg.append("g").selectAll("circle").data(vis).join("circle").attr("cx", p => p.px).attr("cy", p => p.py).attr("r", r)
.attr("fill", p => COL_POZOS[p.c]).attr("opacity", opac);
if (cfg.anim && !REDUCIR) puntos.attr("opacity", 0).transition().delay(p => p.c * 35).duration(DUR_G).attr("opacity", opac);
const borde = svg.append("path").attr("fill", "none").attr("stroke", css("--celeste-fuerte")).attr("stroke-width", 1.6).attr("opacity", 0);
const anillo = svg.append("circle").attr("r", r + 3.5).attr("fill", "none").attr("stroke", css("--ink")).attr("stroke-width", 1.5).attr("opacity", 0);
const dl = d3.Delaunay.from(vis, p => p.px, p => p.py);
const fecha = p => `${MESES[+p.inicio.slice(5, 7) - 1]} de ${p.inicio.slice(0, 4)}`;
const tipPozo = p => `<b>${p.sigla}</b><br>${p.empresa}<br>Área ${tituloArea(p.area)}<br>${p.recurso}, pozo de ${p.tipo.toLowerCase()}<br>Empezó a producir en ${fecha(p)}<br>` +
(p.act ? `En ${PG.map_mes}: ${n0(p.pet_bpd)} barriles de petróleo y ${n1(p.gas_miles_m3d)} mil m³ de gas por día` : `No produjo en ${PG.map_mes}`);
const tipArea = (f, a) => `<b>${tituloArea(f.properties.nombre)}</b>` + (a ? `<br>${a.empresa}<br>En ${PG.areas_anio}: ${kbdF(a.pet_kbd)} mil barriles de petróleo ` +
`y ${n1(a.gas_mmm3d)} millones de m³ de gas por día` + (a.pct_pet_nc > 0 ? `<br>No convencional: ${pct(a.pct_pet_nc)} del petróleo` : "") : `<br>Sin producción en ${PG.areas_anio}`);
const ver = ev => {
const [sx, sy] = d3.pointer(ev, svg.node()), [ex, ey] = d3.pointer(ev, el), p = vis[dl.find(sx, sy)];
if (p && Math.hypot(p.px - sx, p.py - sy) < 10) {
anillo.attr("cx", p.px).attr("cy", p.py).attr("opacity", 1); borde.attr("opacity", 0);
return mostrarTip(el, tipPozo(p), ex, ey);
}
anillo.attr("opacity", 0);
const ll = proy.invert([sx, sy]), f = ll && areas.find(f => d3.geoContains(f, ll));
if (f) { borde.attr("d", camino(f)).attr("opacity", 1); return mostrarTip(el, tipArea(f, prodArea[f.properties.codigo]), ex, ey); }
borde.attr("opacity", 0); ocultarTip();
};
svg.append("rect").attr("width", w).attr("height", h).attr("fill", "transparent").style("touch-action", "pan-y")
.on("pointermove", ver).on("pointerdown", ver).on("pointerleave", () => { anillo.attr("opacity", 0); borde.attr("opacity", 0); ocultarTip(); });
const fi = el.closest(".ficha"), bi = fi?.querySelector(".accion.imagen"); if (bi) bi.hidden = !svgUnico(fi);
}
const MED = {"ant-mapa": "continente", "ant-pais": "Argentina", "ant-temperatura": "orcadas"};
const M = v => n1(v / 1e6) + " M";
const G = k => document.querySelector(`.grafico[data-g="${k}"]`);
const NAR = css("--celeste-fuerte"), FRI = css("--sol-fuerte"), GRIS = css("--faint");
const CENSO_FRASE = {agua_red: "tenía agua de red pública", cloaca: "tenía desagüe del inodoro a red cloacal", internet: "tenía internet en la vivienda",
computadora: "tenía computadora, notebook o tableta", nbi: "tenía al menos una necesidad básica insatisfecha"};
function textoCenso(k) {
const pais = nv.censo[k], [ta, tv] = nv.censo_top[k], [la, lv] = nv.censo_low[k];
if (k === "cloaca") return `En el Censo 2022, la parte de los hogares con desagüe del inodoro a red cloacal iba de ${pct(tv)} en ${ta} a ${pct(lv)} en ${la}.`;
return (k === "sin_cobertura"
? `En el Censo 2022, el ${pct(pais)} de las personas del país no tenía obra social, prepaga ni plan estatal de salud, así que dependía solo del sistema público.`
: `En el Censo 2022, el ${pct(pais)} de los hogares del país ${CENSO_FRASE[k]}.`) + ` El valor más alto fue el de ${ta} (${pct(tv)}) y el más bajo, el de ${la} (${pct(lv)}).`;
}
const textoCantidad = (filas, k, inicio, vista) => {
const ord = [...filas].sort((p, q) => q[k] - p[k]), [p1, p2, p3] = ord, ult = ord[ord.length - 1];
return `${inicio} ${p1.territorio} tenía la mayor cantidad, ${n0(p1[k])}, seguida por ${p2.territorio}, con ${n0(p2[k])}, ${yE(p3.territorio)}, con ${n0(p3[k])}. ` +
`${ult.territorio} tenía la menor, ${n0(ult[k])}. La cantidad sigue sobre todo al tamaño de la población, así que para comparar provincias sirve más la vista ${vista}.`;
};
const ejeMil = v => v >= 1e6 ? (v === 1e6 ? "1 millón" : n1(v / 1e6).replace(/,0$/, "") + " millones") : v >= 1000 ? n0(v / 1000) + " mil" : n0(v);
const protegerDib = base => Object.assign(new Proxy({}, {set(t, k, f) {
t[k] = typeof f !== "function" ? f : (...a) => {
try { return f(...a); } catch (e) {
console.error(`Datina: no se pudo dibujar el gráfico ${k}.`, e);
const el = G(k); if (el) sinDatos(el, "No se pudo dibujar este gráfico.");
}
};
return true;
}}), base);
const DIB = protegerDib({
exportaciones: a => barrasH(G("exportaciones"), {anim:a, data: T.exportaciones_provincias, k:"usd_por_habitante", ref: nv.ex_pc_pais,
tip: d => `<b>${d.territorio}</b><br>${n0(d.usd_por_habitante)} dólares por habitante<br>${n0(d.millones_usd)} millones de dólares en total`,
refLab: `País ${n0(nv.ex_pc_pais)}`, vf: v => n0(v) + " US$", af: n0}),
});
Object.assign(MED, {arArea: ""});
const COL_TIPO = {conv: "#A9CBEA", tight: "#F6B40E", shale: "#1F5E97"};
const mesPer = p => `${MESES[+p.slice(5, 7) - 1]} de ${p.slice(0, 4)}`;
const tPer = p => +p.slice(0, 4) + (+p.slice(5, 7) - 1) / 12;
const leyenda = (id, claves) => { $(id).innerHTML = claves.map(k => `<span><i style="background:${k.c}"></i>${k.lab}</span>`).join(""); };
const listaY = arr => arr.length > 1 ? arr.slice(0, -1).join(", ") + " " + yE(arr[arr.length - 1]) : arr[0];
const ESP_COLOR = {"Peronismo": "#2C74B5", "UCR y aliados": "#D9453B", "PRO": "#F6B40E", "Cambiemos y Juntos por el Cambio": "#F08A24",
"La Libertad Avanza": "#4A2C6F", "Izquierda": "#7A1F2B", "Fuerzas provinciales": "#74ACDF", "Otras fuerzas": "#98A2AE"};
const ESP_TXT = {"Peronismo": "el peronismo", "UCR y aliados": "la UCR y sus aliados", "PRO": "el PRO",
"Cambiemos y Juntos por el Cambio": "Cambiemos y Juntos por el Cambio", "La Libertad Avanza": "La Libertad Avanza",
"Izquierda": "la izquierda", "Fuerzas provinciales": "las fuerzas provinciales", "Otras fuerzas": "otras fuerzas"};
const CG = R.congreso;
const AC = R.anios_congreso, AC_K = {total: "anios_total", dip: "anios_diputados", sen: "anios_senado"};
const AC_CAM = {total: "", dip: " en Diputados", sen: " en el Senado"};
function textoAnios(filas, v, p) {
const k = AC_K[v], [a, ...resto] = filas;
if (!a) return `${NOMBRES[p]} no tuvo legisladores${AC_CAM[v]} desde 1983.`;
const partes = d => v !== "total" ? "" : !(d.anios_senado > 0) ? ", todos en Diputados" : !(d.anios_diputados > 0) ? ", todos en el Senado"
: `, ${n1(d.anios_diputados)} en Diputados y ${n1(d.anios_senado)} en el Senado`;
if (!p && v === "total") {
const cam = !(a.anios_senado > 0) ? "todos sus años en Diputados" : !(a.anios_diputados > 0) ? "todos sus años en el Senado"
: `${n1(a.anios_diputados)} años en Diputados y ${n1(a.anios_senado)} en el Senado`;
const sig = resto.slice(0, 2).map(d => `${d.nombre} (${n1(d[k])})`);
return `Desde 1983, ${n0(AC.personas)} personas ocuparon una banca en el Congreso nacional, ${n0(AC.dos_camaras)} de ellas en las dos cámaras, ` +
`y ${AC.veinte} sumaron 20 años o más (${AC.veinte_siguen === 1 ? "una sigue" : `${AC.veinte_siguen} siguen`} en el cargo). ` +
`El gráfico muestra a las 15 personas con más años. ${a.nombre} sumó ${cam}${a.sigue ? ", y sigue en el cargo" : ""}.` +
(sig.length ? ` Le ${sig.length > 1 ? "siguen" : "sigue"} ${listaY(sig)}.` : "");
}
let t = (p ? `De ${NOMBRES[p]}, quien más años sumó${AC_CAM[v] || " en el Congreso"} desde 1983 es `
: `Desde 1983, quien más años sumó${AC_CAM[v] || " en el Congreso nacional"} es `) + `${a.nombre}: ${n1(a[k])} años${partes(a)}${a.sigue ? ", y sigue en el cargo" : ""}.`;
const sig = resto.slice(0, 2).map(d => `${d.nombre} (${n1(d[k])})`);
if (sig.length) t += ` Le ${sig.length > 1 ? "siguen" : "sigue"} ${listaY(sig)}.`;
if (!p && v === "total") t += ` En total, ${n0(AC.personas)} personas ocuparon una banca en ese tiempo, ${n0(AC.dos_camaras)} de ellas en las dos cámaras, ` +
`y ${AC.veinte} sumaron 20 años o más (${AC.veinte_siguen === 1 ? "una sigue" : `${AC.veinte_siguen} siguen`} en el cargo).`;
return t;
}
TX["anioscong"] = $t("anioscong").textContent = textoAnios(AC.top.map(d => ({nombre: d.nombre, anios_total: d.total, anios_diputados: d.dip,
anios_senado: d.sen, sigue: d.sigue})), "total", "");
CU.tinte = d3.scaleLinear().domain([3000, 4500, 5500, 6400, 7000]).range(["#EADCB8", "#F1E7CF", "#F4EFE4", "#F6F9FC", "#FFFFFF"]).clamp(true);
const RELIEVE = {"aconcagua": "e014295616", "antofalla": "cf3af4401b", "bonete-chico": "6f5c543508", "cerro-bayo": "4756782b44", "cumbre-del-libertador-general-san-martin": "af14c24008", "el-condor": "e177ca8510", "el-muerto": "cea3d18170", "incahuasi": "bf212562b5", "llullaillaco": "5bc6979152", "mercedario": "7f66b6a569", "monte-pissis": "62f9401a2e", "ojos-del-salado": "d680bdf3d8", "tipas": "29fb91180e", "tres-cruces": "298424f80c", "tupungato": "e875cb2653"};
const COL_CORTES = c => [`Hasta ${c[0]}`, `${c[0] + 1} a ${c[1]}`, `${c[1] + 1} a ${c[2]}`, `${c[2] + 1} a ${c[3]}`, `Desde ${c[3] + 1}`].map((lab, i) => ({lab, c: COL_POZOS[i]}));
TX["lab-pozos"] = $t("lab-pozos").textContent = `Cada punto es uno de los ${n0(PG.map_n)} pozos no convencionales que produjeron petróleo o gas desde ${PG.map_ini}, ` +
`con el color del año en que empezó a producir y más claro si no produjo en ${PG.map_mes}. Debajo, las áreas de concesión.`;
DIB["lab-pozos"] = conTablas("lab-pozos", ["pozos_no_convencionales", "areas_produccion"], a => {
leyenda("lab-pozos-ley", COL_CORTES(PG.map_cortes));
mapaPozos(G("lab-pozos"), {anim: a, vista: "cuenca"});
});
const LAB_X = "natalidad", LAB_Y = "mortalidad_infantil", CRU_SR = R.cruces_series || {};
const LAB_A0 = Math.max(CRU_SR[LAB_X][0], CRU_SR[LAB_Y][0]), LAB_A1 = Math.min(CRU_SR[LAB_X][1], CRU_SR[LAB_Y][1]);
const CRU_META = Object.fromEntries(R.cruces.map(m => [m.id, m]));
TX["lab-cruces"] = $t("lab-cruces").textContent = `Cada línea es una jurisdicción: va de su natalidad y su mortalidad infantil en ${LAB_A0} a las de ${LAB_A1}. ` +
`En Cruces se ven año por año, con este par de indicadores o con cualquier otro que tenga serie.`;
let SERIES_CRU = null;
const cargarSeriesCru = () => SERIES_CRU ? Promise.resolve(SERIES_CRU) : d3.csv("datos/cruces_series.csv", d3.autoType).then(filas => {
const s = {};
filas.forEach(r => { const c = String(r.codigo_indec).padStart(2, "0"); ((s[r.id] ||= {})[c] ||= {})[r.anio] = r.valor; });
return (SERIES_CRU = s);
});
DIB["lab-cruces"] = a => {
const el = G("lab-cruces"); if (!el) return;
if (!SERIES_CRU) { esperando(el); cargarSeriesCru().then(() => DIB["lab-cruces"](a)).catch(() => sinDatos(el, "No se pudieron cargar las series.")); return; }
const v = (k, c, an) => SERIES_CRU[k]?.[c]?.[an] ?? null;
const data = PROV.map(([c, nom]) => ({c, nom, x0: v(LAB_X, c, LAB_A0), y0: v(LAB_Y, c, LAB_A0), x1: v(LAB_X, c, LAB_A1), y1: v(LAB_Y, c, LAB_A1)}))
.filter(d => [d.x0, d.y0, d.x1, d.y1].every(x => x != null));
const mx = CRU_META[LAB_X], my = CRU_META[LAB_Y];
$("lab-cruces-ley").innerHTML = `<span><i class="lab-ini"></i>En ${LAB_A0}</span><span><i class="lab-fin"></i>En ${LAB_A1}</span>`;
trayectorias(el, {anim: a, data, xLab: mx.nombre, yLab: my.nombre, fx: loc.format(`,.${mx.dec}f`), fy: loc.format(`,.${my.dec}f`), a0: LAB_A0, a1: LAB_A1});
const bajaX = data.filter(d => d.x1 < d.x0).length, bajaY = data.filter(d => d.y1 < d.y0).length;
el.insertAdjacentHTML("beforeend", `<p class="contexto-grafico">La natalidad bajó en ${bajaX === data.length ? `las ${data.length}` : `${bajaX} de las ${data.length}`} jurisdicciones ` +
`y la mortalidad infantil, en ${bajaY === data.length ? (bajaX === data.length ? "todas" : `las ${data.length}`) : `${bajaY} de las ${data.length}`}. ${mx.nombre}: ${mx.unidad}. ${my.nombre}: ${my.unidad}.</p>`);
};
function trayectorias(el, cfg) {
const angosto = el.clientWidth < 520, data = cfg.data;
const C = lienzo(el, angosto ? 300 : 320, {t: 30, r: 14, b: 42, l: 40});
const {svg, g, iw, ih} = C;
svg.attr("aria-label", `${cfg.yLab} y ${cfg.xLab.toLowerCase()} de ${data.length} jurisdicciones en ${cfg.a0} y en ${cfg.a1}`);
const x = d3.scaleLinear().domain(d3.extent(data.flatMap(d => [d.x0, d.x1]))).nice().range([6, iw]);
const y = d3.scaleLinear().domain(d3.extent(data.flatMap(d => [d.y0, d.y1]))).nice().range([ih, 0]);
g.append("g").attr("class", "grilla").call(d3.axisLeft(y).ticks(5).tickSize(-iw).tickFormat("")).call(e => e.select(".domain").remove());
g.append("g").attr("class", "eje").call(d3.axisLeft(y).ticks(5).tickSize(0).tickPadding(6)).call(e => e.select(".domain").remove());
g.append("g").attr("class", "eje").attr("transform", `translate(0,${ih})`).call(d3.axisBottom(x).ticks(angosto ? 4 : 6).tickSize(0).tickPadding(8))
.call(e => e.select(".domain").remove());
g.append("text").attr("class", "etq-suave").attr("x", iw).attr("y", ih + 36).attr("text-anchor", "end").text(cfg.xLab);
g.append("text").attr("class", "etq-suave").attr("x", -34).attr("y", -16).text(cfg.yLab);
const orden = [...data].sort((p, q) => (p.c === prov) - (q.c === prov));
const col = d => d.c === prov ? css("--celeste-fuerte") : css("--celeste"), op = d => !NOMBRES[prov] || d.c === prov ? 1 : .45;
const lin = g.selectAll("line.tray").data(orden).join("line").attr("class", "tray").attr("x1", d => x(d.x0)).attr("y1", d => y(d.y0))
.attr("x2", d => x(d.x1)).attr("y2", d => y(d.y1)).attr("stroke", col).attr("stroke-width", d => d.c === prov ? 2.4 : 1.4).attr("opacity", op);
g.selectAll("circle.ini").data(orden).join("circle").attr("class", "ini").attr("cx", d => x(d.x0)).attr("cy", d => y(d.y0)).attr("r", 2.6)
.attr("fill", "#fff").attr("stroke", col).attr("stroke-width", 1.2).attr("opacity", op);
const fin = g.selectAll("circle.fin").data(orden).join("circle").attr("class", "fin").attr("cx", d => x(d.x1)).attr("cy", d => y(d.y1)).attr("r", 4.2)
.attr("fill", col).attr("stroke", "#fff").attr("opacity", op);
if (NOMBRES[prov]) {
const d = data.find(d => d.c === prov);
if (d) g.append("text").attr("class", "etq-fuerte").attr("x", x(d.x1) + (x(d.x1) > iw * .7 ? -8 : 8)).attr("y", y(d.y1) + 4)
.attr("text-anchor", x(d.x1) > iw * .7 ? "end" : "start").text(d.nom);
}
if (cfg.anim) {
lin.attr("x2", d => x(d.x0)).attr("y2", d => y(d.y0)).transition().delay(escalon).duration(DUR_G).ease(EASE).attr("x2", d => x(d.x1)).attr("y2", d => y(d.y1));
fin.attr("cx", d => x(d.x0)).attr("cy", d => y(d.y0)).transition().delay(escalon).duration(DUR_G).ease(EASE).attr("cx", d => x(d.x1)).attr("cy", d => y(d.y1));
}
const tip = d => `<b>${d.nom}</b><br>${cfg.xLab}: ${cfg.fx(d.x0)} en ${cfg.a0} y ${cfg.fx(d.x1)} en ${cfg.a1}<br>${cfg.yLab}: ${cfg.fy(d.y0)} en ${cfg.a0} y ${cfg.fy(d.y1)} en ${cfg.a1}`;
const dl = d3.Delaunay.from(data, d => x(d.x1), d => y(d.y1));
const ver = ev => {
const [sx, sy] = d3.pointer(ev, g.node()), [ex, ey] = d3.pointer(ev, el), d = data[dl.find(sx, sy)];
if (d && Math.hypot(x(d.x1) - sx, y(d.y1) - sy) < 16) return mostrarTip(el, tip(d), ex, ey);
ocultarTip();
};
svg.append("rect").attr("width", C.w).attr("height", C.h).attr("fill", "transparent").style("touch-action", "pan-y")
.on("pointermove", ver).on("pointerdown", ver).on("pointerleave", ocultarSiMouse);
}
parte("corte");
const fechaLarga = f => `${+f.slice(8, 10)} de ${MESES[+f.slice(5, 7) - 1]} de ${f.slice(0, 4)}`;
const mayus = t => t.charAt(0).toUpperCase() + t.slice(1);
const PV = R.presupuesto;
const tramosAnios = xs => lista(xs.reduce((acc, a) => { const u = acc[acc.length - 1]; if (u && a === u[1] + 1) u[1] = a; else acc.push([a, a]); return acc; }, [])
.flatMap(([a, b]) => b - a >= 2 ? [`${a} a ${b}`] : b > a ? [String(a), String(b)] : [String(a)]));
function textoPresupuesto(cam) {
const r = PV[cam === "Diputados" ? "dip" : "sen"];
let t = `Hay acta de la votación en general de ${r.n} presupuestos ${cam === "Diputados" ? "en Diputados" : "en el Senado"} entre ${r.desde} y ${r.hasta}. ` +
`En esas votaciones, la parte de los legisladores de fuera del bloque oficialista que votó a favor fue de ${pct(r.min.v)} a ${pct(r.max.v)}. ` +
`La más alta fue la del presupuesto ${r.max.anio}, con el gobierno de ${r.max.pres}, y la más baja, la del presupuesto ${r.min.anio}, con el gobierno de ${r.min.pres}.`;
r.rechazados.forEach(x => { t += ` El presupuesto ${x.anio} fue rechazado el ${fechaLarga(x.fecha)}, con ${x.si} votos a favor y ${x.no} en contra.`; });
t += ` En el de ${r.ult.anio}, votado el ${fechaLarga(r.ult.fecha)}, votó a favor el ${pct(r.ult.v)} de los legisladores de fuera del bloque oficialista.`;
const con = new Set(T.presupuesto_votos.filter(d => d.camara === cam).map(d => d.ejercicio));
const faltan = d3.range(r.desde, r.hasta + 1).filter(a => !con.has(a));
return t + (faltan.length ? ` No figuran los presupuestos ${tramosAnios(faltan)}, que no tienen una votación en general en las actas de la fuente.` : "");
}
TX["presupuesto"] = $t("presupuesto").textContent = textoPresupuesto("Diputados");
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
const mx = d3.mean(data, d => d[cfg.x]), my = d3.mean(data, d => d[cfg.y]);
const b = d3.sum(data, d => (d[cfg.x] - mx) * (d[cfg.y] - my)) / d3.sum(data, d => (d[cfg.x] - mx) ** 2), a0 = my - b * mx;
const [x0, x1] = x.domain();
g.append("line").attr("x1", x(x0)).attr("x2", x(x1)).attr("y1", y(a0 + b * x0)).attr("y2", y(a0 + b * x1)).attr("stroke", css("--muted")).attr("stroke-dasharray","4 4");
const orden = [...data].sort((p, q) => q[cfg.y] - p[cfg.y]);
const etiq = new Set([...orden.slice(0, 3), ...orden.slice(-3)].map(d => d.codigo_indec).concat(prov ? [prov] : [], cfg.marcar || []));
const pt = g.selectAll("circle").data(data).join("circle").attr("cx", d => x(d[cfg.x])).attr("cy", d => y(d[cfg.y])).attr("r", 5.5)
.attr("fill", d => d.codigo_indec === prov ? css("--celeste-fuerte") : css("--celeste")).attr("stroke", "#fff");
const marcados = new Set(cfg.marcar || []), prio = d => d.codigo_indec === prov ? 2 : marcados.has(d.codigo_indec) ? 1 : 0, cajas = [];
data.filter(d => etiq.has(d.codigo_indec)).sort((p, q) => prio(q) - prio(p)).forEach(d => {
const px = x(d[cfg.x]), der = px > iw * .8;
const t = g.append("text").attr("class", d.codigo_indec === prov ? "etq-fuerte lab" : "etq lab").attr("x", px + (der ? -8 : 8))
.attr("text-anchor", der ? "end" : "start").attr("y", y(d[cfg.y]) + 4).text(d.territorio);
const c = t.node().getBBox();
if (cajas.some(o => c.x < o.x + o.width + 6 && o.x < c.x + c.width + 6 && c.y < o.y + o.height && o.y < c.y + c.height)) t.remove();
else cajas.push(c);
});
if (cfg.anim) pt.attr("r", 0).transition().delay(escalon).duration(DUR_G).attr("r", 5.5);
pt.on("pointerenter", (ev, d) => mostrarTip(el, `<b>${d.territorio}</b><br>${cfg.xLab}: ${vx(d[cfg.x])}<br>${cfg.yLab}: ${vy(d[cfg.y])}`, 46 + x(d[cfg.x]), 34 + y(d[cfg.y])))
.on("pointerleave", ocultarSiMouse);
}
const AN = R.ado_nse, MC = R.mi_causas;
$("adonse-sel").innerHTML = AN.indicadores.map(i => `<option value="${i.k}">${i.lab}</option>`).join("");
MED.adonse = AN.indicadores[0].k;
$("adonse-sel").addEventListener("change", ev => { MED.adonse = ev.target.value; cambiarVista("adonse"); });
$("cm-sel").innerHTML = `<option value="total">Todas las causas</option>` + CM.grupos.map(g => `<option value="${g.k}">${g.lab}</option>`).join("");
MED["causas-muerte"] = "total";
$("cm-sel").addEventListener("change", ev => { MED["causas-muerte"] = ev.target.value; cambiarVista("causas-muerte"); });
parte("externo");
const IA = R.ingresos_aglomerados;
const IA_CORTO = {"Ciudad de Buenos Aires": "CABA", "Comodoro Rivadavia-Rada Tilly": "Comodoro Rivadavia", "Viedma-Carmen de Patagones": "Viedma-Patagones",
"San Nicolás-Villa Constitución": "San Nicolás-V. Const.", "Gran Tucumán-Tafí Viejo": "Gran Tucumán", "Santiago del Estero-La Banda": "Santiago-La Banda"};
MED["dengue-temp"] = DG.juntas;
$("dg-sel").innerHTML = [[DG.juntas, `De la ${DG.prov_desde} a la ${DG.temp}, juntas`], ...[...DG.temps_prov].reverse().map(t => [t, t])]
.map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
$("ant-pais").addEventListener("change", ev => { MED["ant-pais"] = ev.target.value; cambiarVista("ant-mapa"); });
$("ant-base").addEventListener("change", ev => { MED["ant-temperatura"] = ev.target.value; cambiarVista("ant-temperatura"); });
$("dg-sel").addEventListener("change", ev => { MED["dengue-temp"] = ev.target.value; cambiarVista("dengue"); });
MED["ipc-reg"] = (REG_IPC[prov] || ["gba"])[0];
$("ipd-sel").value = MED["ipc-reg"];
$("ipd-sel").addEventListener("change", ev => { MED["ipc-reg"] = ev.target.value; cambiarVista("inflacion-rubros"); });
const BV = SX.bcra;
const bcrVar = () => BV.variables.find(x => String(x.id) === MED["bcra-id"]) || BV.variables[0];
const bcrValor = r => r.log10_valor != null ? 10 ** r.log10_valor : r.valor;
$("bcra-sel").innerHTML = d3.groups(BV.variables, x => x.g).map(([g, vs]) => `<optgroup label="${g}">${vs.map(x => `<option value="${x.id}">${x.n}</option>`).join("")}</optgroup>`).join("");
MED["bcra-id"] = String(BV.variables[0].id);
MED["bcra-m"] = "nominal";
$("bcra-sel").addEventListener("change", ev => { MED["bcra-id"] = ev.target.value; cambiarVista("bcra"); });
$("bcra-conm").addEventListener("click", ev => {
const b = ev.target.closest("button[data-m]");
if (!b || b.dataset.m === MED["bcra-m"]) return;
MED["bcra-m"] = b.dataset.m;
cambiarVista("bcra");
});
const TRR = R.transferencias;
const milM = v => `${v >= 10 ? n0(v) : n1(v)} mil millones`;
const PRR = R.presidentes;
parte("politica");
parte("energia");
parte("petroleo");
parte("movilidad");
parte("naturaleza");
parte("poblacion");
parte("migraciones");
parte("salud");
parte("educacion");
parte("pobreza");
parte("trabajo");
parte("economia");
parte("empresas");
parte("construccion");
parte("gobierno");
parte("turismo");
parte("justicia");
parte("seguridad");
parte("curiosidades");
const VT_TIPOS = typeof ViewTransition !== "undefined" && "types" in ViewTransition.prototype;
function cambiarVista(g, dibujar = () => DIB[g](false)) {
const el = G(g);
if (!el || REDUCIR || !VT_TIPOS || document.hidden) return dibujar();
el.style.viewTransitionName = "grafico";
const t = document.startViewTransition({update: dibujar, types: ["grafico"]});
t.ready.catch(() => {});
t.finished.finally(() => { el.style.viewTransitionName = ""; });
}
const SE_MUEVEN = new Set(["piramide"]);
const enPantalla = el => { const r = el.getBoundingClientRect(); return r.height > 0 && r.bottom > 0 && r.top < innerHeight; };
function repintarProv() {
const vistos = Object.keys(DIB).map(k => [k, G(k)]).filter(([, el]) => el && el.closest(".visto"));
vistos.forEach(([, el]) => el.resaltar?.());
const redibujan = vistos.filter(([, el]) => !el.resaltar);
const cambiar = () => { redibujan.forEach(([k]) => DIB[k](false)); PERFIL_PROV.pintar(true); tablaAreas(); alCambiarProv.forEach(f => f()); };
if (REDUCIR || !VT_TIPOS || document.hidden) return cambiar();
const lugares = [...redibujan.filter(([k]) => !SE_MUEVEN.has(k)).map(([, el]) => () => el),
() => document.querySelector(".en-cifras"), () => document.getElementById("prov-destaca")];
const nombrar = () => lugares.forEach((l, i) => { const el = l(); if (el && enPantalla(el)) el.style.viewTransitionName = `cambio-${i}`; });
nombrar();
const t = document.startViewTransition({update: () => { cambiar(); nombrar(); }, types: ["provincia"]});
t.ready.catch(() => {});
t.finished.finally(() => lugares.forEach(l => { const el = l(); if (el) el.style.viewTransitionName = ""; }));
}
function dibujarTodo() { Object.keys(DIB).forEach(k => { const el = G(k); if (el && el.closest(".visto")) DIB[k](false); }); }
$("ar-sel").addEventListener("change", ev => { MED.arArea = ev.target.value; cambiarVista("areas-hidro"); });
document.querySelectorAll(".selector-ficha select[data-g]").forEach(sel => sel.addEventListener("change", () => {
MED[sel.dataset.g] = sel.value; cambiarVista(sel.dataset.g);
}));
const OCDE_VISTA = {
"f-nacimientos": ["nacimientos", "Nacimientos", ["fecundidad"]],
"f-adolescentes": ["adolescentes", "Por provincia", ["fecundidad_adolescente"]],
"f-suicidio": ["suicidio", "Registro del SNIC", ["suicidio"]],
"f-muertes": ["muertes", "Cantidad por año", ["homicidios", "viales"]],
"f-desocupacion": ["desocupacion", "EPH, 31 aglomerados", ["desocupacion"]],
"f-pobreza": ["pobreza", "Pobreza e indigencia", ["pobreza_relativa"]],
"f-receptivo": ["receptivo", "Turistas por año", ["turistas"]],
"f-pesca": ["pesca", "Por especie", ["pesca"]],
};
const OCDE_BOTON = {fecundidad: "Hijos por mujer", fecundidad_adolescente: "Nacimientos cada 1.000 adolescentes",
suicidio: "Tasa estimada por la OMS", homicidios: "Tasa de homicidios", viales: "Tasa de muertes viales",
desocupacion: "Tasa de desocupación", pobreza_relativa: "Pobreza relativa", turistas: "Turistas cada 100 habitantes", pesca: "Pesca por habitante"};
const OCDE_MISMA = new Set(["desocupacion"]);
const OCDE_Y0 = {esperanza_vida: 65};
const OCDE_NOTA = {
pobreza_relativa: "Es la pobreza relativa que usa la OCDE, distinta de la pobreza por canastas del INDEC. En la Argentina el Banco Mundial la calcula con la EPH, que cubre solo los aglomerados urbanos.",
desocupacion: "La Organización Internacional del Trabajo la estima con un modelo para comparar países, para todo el país y no solo para los 31 aglomerados de la EPH, así que puede diferir de la del INDEC.",
turistas: `Son las llegadas de turistas internacionales divididas por la población de cada país. El Banco Mundial no publica esta serie después de ${OC.turistas.anio}.`,
pesca: "Suma la pesca marítima y la continental, y la divide por la población de cada país.",
suicidio: "Son estimaciones de la OMS, distintas de los registros del SNIC y de la DEIS que usa esta sección.",
protegida: "Mide la superficie terrestre dentro de áreas protegidas sin contar dos veces las superposiciones, por eso difiere de la cifra nacional de esta ficha.",
};
const fOC = k => loc.format(`,.${OC[k].dec}f`);
const ANIO_DATOS = +R.actualizado.slice(-4), ocdeViejo = k => OC[k].anio < ANIO_DATOS - 3;
const deOrganismo = t => (/^(Grupo|Banco|Programa|Fondo|Sistema|Instituto)\b/.test(t) ? "del " : /^(ONU|Ember)\b/.test(t) ? "de " : "de la ") + t;
const conUnidad = (k, v) => OC[k].unidad.startsWith("%") ? fOC(k)(v) + OC[k].unidad : `${fOC(k)(v)} ${OC[k].unidad}`;
function textoOCDE(k) {
const o = OC[k], f = fOC(k);
const med = Math.abs(o.ocde - o.mediana) > Math.abs(o.mediana) * .25
? ` La mediana fue ${f(o.mediana)}: unos pocos países con valores extremos mueven el promedio.` : "";
const alto = o.mas_alto === 0 ? `Ninguno de esos ${o.n} países tenía un valor más alto que la Argentina.`
: o.mas_alto === o.n ? `Los ${o.n} países tenían un valor más alto que la Argentina.`
: `${o.mas_alto} de esos ${o.n} países tenían un valor más alto que la Argentina.`;
return `Según la estimación ${deOrganismo(o.origen)} para ${o.anio}, ${o.frase} fue de ${conUnidad(k, o.arg)} en la Argentina y de ${f(o.ocde)} en el promedio simple de los ${o.n} países de la OCDE con dato.${med} ${alto} En ${o.ini}, la Argentina tenía ${f(o.arg_ini)} y el promedio de la OCDE, ${f(o.ocde_ini)}.` +
(ocdeViejo(k) ? ` Es el último año con dato para esta comparación.` : "");
}
const NOTA_A_LA_VISTA = new Set(["f-muertes", "f-suicidio", "f-suicidio-prov", "f-edad"]);
const ICONO_INFO = `<svg class="ico" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="8.2"/><path d="M10 9v5M10 6.2v.1"/></svg>`;
document.querySelectorAll(".tema:not(.herramienta) > article.ficha").forEach(f => {
const notas = f.querySelectorAll(":scope > .nota");
if (!notas.length || NOTA_A_LA_VISTA.has(f.id)) return;
const d = document.createElement("details"); d.className = "sobre";
d.innerHTML = `<summary>${ICONO_INFO}<span>Sobre los datos</span></summary><div class="sobre-panel"></div>`;
d.lastElementChild.append(...notas);
f.querySelector(".pie").prepend(d);
d.addEventListener("toggle", () => {
if (!d.open) return;
const pie = d.closest(".pie");
d.lastElementChild.style.bottom = `${f.getBoundingClientRect().bottom - pie.getBoundingClientRect().top + 8}px`;
document.querySelectorAll(".sobre[open]").forEach(o => { if (o !== d) o.open = false; });
});
});
document.addEventListener("keydown", ev => {
const d = ev.key === "Escape" && document.querySelector(".sobre[open], .compartir[open]");
if (d) { d.open = false; d.querySelector("summary").focus(); }
});
document.addEventListener("pointerdown", ev => document.querySelectorAll(".sobre[open], .compartir[open]").forEach(d => { if (!d.contains(ev.target)) d.open = false; }));
document.addEventListener("focusin", ev => document.querySelectorAll(".compartir[open]").forEach(d => { if (!d.contains(ev.target)) d.open = false; }));
document.addEventListener("toggle", ev => {
const d = ev.target;
if (d.classList?.contains("compartir") && d.open) document.querySelectorAll(".sobre[open], .compartir[open]").forEach(o => { if (o !== d) o.open = false; });
}, true);
const VISTA = {};
Object.entries(OCDE_VISTA).forEach(([id, [g, propio, ks]]) => {
const art = document.getElementById(id), graf = G(g); if (!art || !graf) return;
VISTA[g] = null;
const ancla = graf.previousElementSibling?.classList.contains("clave-color") ? graf.previousElementSibling : graf;
ancla.insertAdjacentHTML("beforebegin", `<div class="ocde-conm" role="group" aria-label="Qué muestra el gráfico">` +
`<button type="button" class="boton chico propio" aria-pressed="true">${propio}</button>` +
ks.map(k => `<button type="button" class="boton chico${ocdeViejo(k) ? " viejo" : ""}" data-k="${k}" aria-pressed="false">OCDE: ${OCDE_BOTON[k]}, ${OC[k].anio}</button>`).join("") + `</div>`);
graf.insertAdjacentHTML("afterend", `<p class="nota ocde-nota" hidden></p>`);
const conm = ancla.previousElementSibling, nota = graf.nextElementSibling, lead = art.querySelector(".lead");
const propios = [...art.querySelectorAll(".sobre, .nota:not(.ocde-nota), .selector-ficha, .conmutador:not(.pestanas), .aviso-serie, .clave-color, .pol-ley")];
conm.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
if (VISTA[g] === (b.dataset.k || null)) return;
VISTA[g] = b.dataset.k || null;
conm.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b));
cambiarVista(g);
}));
const orig = DIB[g];
DIB[g] = a => {
const k = VISTA[g];
if (!k) {
if (lead && lead.dataset.propio != null) { lead.textContent = lead.dataset.propio; delete lead.dataset.propio; }
propios.forEach(e => e.style.display = ""); nota.hidden = true;
return orig(a);
}
if (!T.ocde_comparacion) { d3.csv("datos/ocde_comparacion.csv", d3.autoType).then(f => { T.ocde_comparacion = f; DIB[g](a); },
() => { const el = G(g); if (el) sinDatos(el, "No se pudo cargar la comparación con la OCDE."); }); return; }
const o = OC[k];
if (lead) { if (lead.dataset.propio == null) lead.dataset.propio = lead.textContent; lead.textContent = textoOCDE(k); }
propios.forEach(e => e.style.display = "none"); nota.hidden = false;
nota.innerHTML = (ocdeViejo(k) ? `<strong class="ocde-aviso">Dato de ${o.anio}: tiene más de tres años.</strong> ` : "") + (OCDE_MISMA.has(k) ? `Es la misma medida que la del resto de la ficha, ${o.frase}, en ${o.unidad}. ` : `No es la misma medida que la del resto de la ficha: muestra ${o.frase}${o.unidad.startsWith("por ") ? " " : ", en "}${o.unidad}. `) + `${OCDE_NOTA[k] ? OCDE_NOTA[k] + " " : ""}La línea <span class="ocde-marca">OCDE</span> es el promedio simple de los países miembros con dato ese año. La franja violeta clara va del percentil 25 al 75: ahí está la mitad central de los países. ` +
`Fuente: ${o.fuente || `Banco Mundial, Indicadores del Desarrollo Mundial (serie ${o.serie}), con datos de ${o.origen}`}. Son estimaciones armonizadas para comparar países y pueden diferir de las cifras nacionales de esta ficha. <a href="datos/ocde_comparacion.csv" download>Descargar la comparación (CSV)</a>`;
lineas(graf, {anim: a, data: T.ocde_comparacion.filter(d => d.indicador === k), x: "anio", y0: OCDE_Y0[k] ?? 0,
vf: fOC(k), yf: v => loc.format(",")(v), banda: {lo: "ocde_p25", hi: "ocde_p75", lab: "Mitad central OCDE", c: css("--ocde-suave")},
series: [{k: "argentina", lab: "Argentina", c: NAR, w: 3}, {k: "ocde_promedio", lab: "OCDE", c: css("--ocde"), w: 2.6}]});
};
});
const CX = (() => {
const META = Object.fromEntries(R.cruces.map(m => [m.id, m]));
const FILAS = T.cruces_provincias;
const COLOR_REGION = {CABA: "#18212B", Pampeana: "#2C74B5", NOA: "#B27A00", NEA: "#C8102E", Cuyo: "#7A4FA0", Patagonia: "#74ACDF"};
const CORTO_PROV = {"Santiago del Estero": "Sgo. del Estero", "Tierra del Fuego": "T. del Fuego", "Buenos Aires": "Bs. As."};
const st = {x: "madres_adolescentes", y: "aprender_mat", fuera: new Set(), tam: false, logx: false, logy: false,
my: "mortalidad_infantil", mx: ["madres_adolescentes", "empleo_privado"]};
const q = new URLSearchParams(location.search);
if (META[q.get("cx")]) st.x = q.get("cx");
if (META[q.get("cy")]) st.y = q.get("cy");
(q.get("cf") || "").split(",").filter(c => FILAS.some(f => f.codigo_indec === c)).forEach(c => st.fuera.add(c));
const guardar = () => {
const u = new URL(location.href);
u.searchParams.set("cx", st.x); u.searchParams.set("cy", st.y);
if (st.fuera.size) u.searchParams.set("cf", [...st.fuera].join(",")); else u.searchParams.delete("cf");
history.replaceState(history.state, "", u);
};
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
const pT = (t, df) => ibeta(df / (df + t * t), df / 2, .5);
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
const fm = id => loc.format(`,.${META[id].dec}f`);
const fr = v => loc.format(",.2f")(v);
const fp = p => p < .001 ? "menor a 0,001" : loc.format(",.3f")(p);
const corto = t => CORTO_PROV[t] || t;
const SR = R.cruces_series || {};
let SER = null, cargando = null, reloj = null;
st.anio = null;
const conSerie = () => SR[st.x] && SR[st.y] && Math.max(SR[st.x][0], SR[st.y][0]) < Math.min(SR[st.x][1], SR[st.y][1]);
const anios = () => d3.range(Math.max(SR[st.x][0], SR[st.y][0]), Math.min(SR[st.x][1], SR[st.y][1]) + 1);
const cargar = () => cargando || (cargando = d3.csv("datos/cruces_series.csv", d3.autoType).then(filas => {
SER = {};
filas.forEach(r => { const c = String(r.codigo_indec).padStart(2, "0"); ((SER[r.id] ||= {})[c] ||= {})[r.anio] = r.valor; });
}, e => { cargando = null; avisar("No se pudieron cargar los datos de cada año."); throw e; }));
const valor = (k, c, a) => SER?.[k]?.[c]?.[a] ?? null;
const filas = () => st.anio == null || !SER || !conSerie() ? FILAS
: FILAS.map(f => ({...f, [st.x]: valor(st.x, f.codigo_indec, st.anio), [st.y]: valor(st.y, f.codigo_indec, st.anio)}));
const validos = (ids) => filas().filter(f => !st.fuera.has(f.codigo_indec) && ids.every(k => f[k] != null && isFinite(f[k])));
const logOk = id => FILAS.every(f => f[id] == null || f[id] > 0);
const tx = (id, log) => log ? v => Math.log10(v) : v => v;
if (!document.getElementById("f-cruces")) return {pearson, spearman, simple};
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
`<button type="button" class="enlace cx-chip" data-i="${i}">${META[a].nombre} ${yE(META[b].nombre.toLowerCase())}</button>`).join("");
const sincronizar = () => {
selX.value = st.x; selY.value = st.y; selMY.value = st.my;
["logx", "logy"].forEach(k => {
const id = k === "logx" ? st.x : st.y, cb = document.getElementById(`cx-${k}`);
cb.disabled = !logOk(id); if (cb.disabled) st[k] = false; cb.checked = st[k];
});
document.getElementById("cx-tam").checked = st.tam;
document.getElementById("cx-caba").setAttribute("aria-pressed", st.fuera.has("02"));
const fuera = FILAS.filter(f => st.fuera.has(f.codigo_indec)).sort((p, q) => p.territorio.localeCompare(q.territorio, "es"));
document.getElementById("cx-fuera").hidden = !fuera.length;
document.getElementById("cx-fuera-lista").innerHTML = fuera.map(f => `<li><span class="con-bandera">${bandera(f.codigo_indec)}<span>${f.territorio}</span></span>` +
`<button type="button" class="dx-quitar" data-c="${f.codigo_indec}" aria-label="Volver a sumar ${f.territorio}"><svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M3 3l6 6M9 3l-6 6"/></svg></button></li>`).join("");
document.getElementById("cx-fuera-estado").textContent = fuera.length ? `Fuera del cálculo: ${lista(fuera.map(f => f.territorio))}.` : "";
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
document.getElementById("cx-anio").addEventListener("input", ev => { parar(); cargar().then(() => irAnio(+ev.target.value, false), () => {}); });
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
}, () => {});
});
selX.addEventListener("change", () => { st.x = selX.value; todo(true); });
selY.addEventListener("change", () => { st.y = selY.value; todo(true); });
document.getElementById("cx-cambiar").addEventListener("click", () => { [st.x, st.y] = [st.y, st.x]; [st.logx, st.logy] = [st.logy, st.logx]; todo(true); });
["tam", "logx", "logy"].forEach(k => document.getElementById(`cx-${k}`).addEventListener("change", ev => { st[k] = ev.target.checked; todo(true); }));
document.getElementById("cx-caba").addEventListener("click", () => { st.fuera.has("02") ? st.fuera.delete("02") : st.fuera.add("02"); todo(true); });
document.getElementById("cx-reponer").addEventListener("click", () => { st.fuera.clear(); todo(true); document.getElementById("cx-caba").focus({preventScroll: true}); });
document.getElementById("cx-fuera-lista").addEventListener("click", ev => {
const bt = ev.target.closest(".dx-quitar"); if (!bt) return;
const i = [...document.querySelectorAll("#cx-fuera-lista .dx-quitar")].indexOf(bt);
st.fuera.delete(bt.dataset.c); todo(true);
const quedan = [...document.querySelectorAll("#cx-fuera-lista .dx-quitar")];
(quedan[Math.min(i, quedan.length - 1)] || document.getElementById("cx-caba")).focus({preventScroll: true});
});
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
svg.attr("role", "group").attr("aria-label", `Diagrama de dispersión de ${X.nombre} ${yE(Y.nombre)} por provincia`);
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
const r = st.tam ? d3.scaleSqrt().domain([0, d3.max(FILAS, f => f.poblacion)]).range([3, angosto ? 22 : 30]) : () => angosto ? 5 : 6.5;
const orden = [...todos].sort((a, b) => st.tam ? b.poblacion - a.poblacion : 0);
const pts = g.append("g").attr("class", "cx-pts").selectAll("g").data(orden, d => d.codigo_indec).join("g").attr("class", "cx-punto")
.attr("tabindex", 0).attr("role", "button")
.attr("aria-label", d => `${d.territorio}. ${X.nombre}: ${fm(st.x)(d[st.x])}. ${Y.nombre}: ${fm(st.y)(d[st.y])}. ${st.fuera.has(d.codigo_indec) ? "Fuera del cálculo: al elegirla, vuelve a sumarse" : "Al elegirla, sale del cálculo"}`);
const circ = pts.append("circle").attr("r", d => r(d.poblacion))
.attr("fill", d => st.fuera.has(d.codigo_indec) ? "none" : COLOR_REGION[d.region])
.attr("fill-opacity", st.tam ? .75 : .92)
.attr("stroke", d => st.fuera.has(d.codigo_indec) ? css("--faint") : d.codigo_indec === prov ? css("--ink") : "#fff")
.attr("stroke-width", d => d.codigo_indec === prov ? 2.6 : 1.4).attr("stroke-dasharray", d => st.fuera.has(d.codigo_indec) ? "2 2" : null);
const pos = d => [x(d[st.x]), y(d[st.y])];
pts.attr("transform", d => { const p = previo[d.codigo_indec] || pos(d); return `translate(${p[0]},${p[1]})`; });
if (anim && !REDUCIR) {
pts.transition().duration(Object.keys(previo).length ? 650 : 0).ease(EASE).attr("transform", d => `translate(${pos(d)})`);
if (!Object.keys(previo).length) circ.attr("r", 0).transition().delay(escalon).duration(DUR_G).ease(EASE).attr("r", d => r(d.poblacion));
} else pts.attr("transform", d => `translate(${pos(d)})`);
previo = Object.fromEntries(todos.map(d => [d.codigo_indec, pos(d)]));
if (enSerie && NOMBRES[prov]) {
const cam = anios().filter(a => a <= st.anio).map(a => [valor(st.x, prov, a), valor(st.y, prov, a)]).filter(([a, b]) => a != null && b != null && (!st.logx || a > 0) && (!st.logy || b > 0));
g.insert("path", ".cx-pts").datum(cam).attr("fill", "none").attr("stroke", css("--ink")).attr("stroke-width", 1.4).attr("stroke-dasharray", "2 3").attr("opacity", .7)
.attr("d", d3.line().x(d => x(d[0])).y(d => y(d[1])));
}
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
const alternar = d => { st.fuera.has(d.codigo_indec) ? st.fuera.delete(d.codigo_indec) : st.fuera.add(d.codigo_indec); todo(true); };
pts.on("click", (ev, d) => alternar(d))
.on("keydown", (ev, d) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); alternar(d); } })
.on("blur", ocultarTip)
.on("pointerenter focus", (ev, d) => {
const [px, py] = pos(d), i = datos.indexOf(d);
const res = m && i >= 0 ? `<br>${m.res[i] > 0 ? "Por encima" : "Por debajo"} de la recta` : "";
mostrarTip(el, `<b>${d.territorio}</b><br>${X.nombre}: ${fm(st.x)(d[st.x])}<br>${Y.nombre}: ${fm(st.y)(d[st.y])}${res}`, px + (angosto ? 44 : 58), py + 34);
}).on("pointerleave", ocultarSiMouse);
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
let t = `Con ${m.n} jurisdicciones, la relación es ${fuerza(m.r)} y ${fuerza(m.r) === "casi nula" ? "no muestra una tendencia clara" : sentido} (r = ${fr(m.r)}). `;
t += m.p < .05 ? `Es poco probable que una relación así aparezca solo por azar (valor p ${fp(m.p)}). `
: `Con tan pocos casos, una relación de este tamaño puede aparecer por azar (valor p ${fp(m.p)}), así que no alcanza para afirmar que existe. `;
if (Math.abs(m.r - rho) > .2) t += `La correlación por rangos de Spearman es ${fr(rho)}: la diferencia sugiere que unos pocos casos extremos o una forma no lineal pesan en el resultado. `;
const imax = m.cook.indexOf(Math.max(...m.cook));
if (m.cook[imax] > 4 / m.n && m.n > 6) {
const resto = datos.filter((_, i) => i !== imax), r2 = pearson(resto.map(f => tx(st.x, st.logx)(f[st.x])), resto.map(f => tx(st.y, st.logy)(f[st.y])));
t += `${datos[imax].territorio} es la jurisdicción que más mueve la recta: sin ella, r sería ${fr(r2)}${fuerza(r2) !== fuerza(m.r) ? ` y la relación pasaría a ser ${fuerza(r2)}` : ""}. `;
}
if (X.periodo !== Y.periodo) t += `Los datos no son del mismo período: ${X.nombre} es de ${X.periodo} ${yE(Y.nombre)}, de ${Y.periodo}. `;
lect.textContent = t.trim();
if (st.anio != null && SER && conSerie()) t += ` El gráfico muestra el año ${st.anio}: los valores son de ese año y pueden diferir del último dato, que en algunos indicadores es un promedio de varios años.`;
lect.textContent = t.trim();
const conRes = datos.map((f, i) => ({f, e: m.res[i]})).sort((a, b) => b.e - a.e);
const item = o => `<li><b>${o.f.territorio}</b> ${fm(st.y)(o.f[st.y])}</li>`;
resid.innerHTML = `<div><h3>Más arriba de lo que marca la recta</h3><ol>${conRes.slice(0, 3).map(item).join("")}</ol></div>` +
`<div><h3>Más abajo de lo que marca la recta</h3><ol>${conRes.slice(-3).reverse().map(item).join("")}</ol></div>`;
document.getElementById("cx-tabla").innerHTML = `<thead><tr><th>Jurisdicción</th><th>Región</th><th class="n">${X.nombre}</th><th class="n">${Y.nombre}</th></tr></thead><tbody>` +
[...FILAS].sort((a, b) => a.territorio.localeCompare(b.territorio, "es")).map(f => `<tr${f.codigo_indec === prov ? ' class="elegida"' : ""}><td>${conBandera(f.codigo_indec, f.territorio + (st.fuera.has(f.codigo_indec) ? " (fuera del cálculo)" : ""))}</td><td>${f.region}</td>` +
`<td class="n">${f[st.x] == null ? "s/d" : fm(st.x)(f[st.x])}</td><td class="n">${f[st.y] == null ? "s/d" : fm(st.y)(f[st.y])}</td></tr>`).join("") + `</tbody>`;
document.getElementById("cx-fuentes").textContent = `${X.nombre}: ${X.unidad}, ${X.periodo}. Fuente: ${X.fuente}. ${Y.nombre}: ${Y.unidad}, ${Y.periodo}. Fuente: ${Y.fuente}.`;
}
function matriz() {
const el = G("cruces-matriz"); if (!el || !el.offsetParent) return;
const ids = R.cruces.map(m => m.id).filter(id => id !== "poblacion"), n = ids.length;
const angosto = el.clientWidth < 620, izq = angosto ? 128 : 190, lado = Math.max(18, Math.min(36, (el.clientWidth - izq - 10) / n));
el.innerHTML = "";
const W = izq + lado * n + 10, H = lado * n + (angosto ? 120 : 170);
const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("width", W).attr("role", "group")
.attr("aria-label", "Matriz de correlaciones entre los indicadores provinciales. Usá las flechas para pasar de una celda a otra y Enter para ver la dispersión de ese par");
const color = d3.scaleLinear().domain([-1, 0, 1]).range(["#C8102E", "#F4F1EA", "#2C74B5"]);
const celdas = [];
ids.forEach((a, i) => ids.forEach((b, j) => {
if (j >= i) return;
const d = validos([a, b]); if (d.length < 8) return;
const r = pearson(d.map(f => f[a]), d.map(f => f[b]));
celdas.push({a, b, i, j, r, n: d.length, p: pT(r * Math.sqrt((d.length - 2) / (1 - r * r)), d.length - 2)});
}));
const g = svg.append("g").attr("transform", `translate(${izq},4)`);
const cel = g.selectAll("g").data(celdas).join("g").attr("transform", d => `translate(${d.j * lado},${d.i * lado})`).attr("class", "cx-celda").attr("tabindex", (d, k) => k === 0 ? 0 : -1).attr("role", "button")
.attr("aria-label", d => `${META[d.a].nombre} ${yE(META[d.b].nombre)}: r ${fr(d.r)}`);
cel.append("rect").attr("width", lado - 2).attr("height", lado - 2).attr("fill", d => color(d.r));
if (lado >= 26) cel.append("text").attr("x", (lado - 2) / 2).attr("y", (lado - 2) / 2).attr("dy", ".35em").attr("text-anchor", "middle")
.attr("class", d => "cx-r" + (d.p < .05 ? " sig" : "")).attr("fill", d => tintaSobre(color(d.r))).text(d => loc.format(".1f")(d.r).replace("-0,0", "0,0"));
g.selectAll("text.fila").data(ids).join("text").attr("class", "etq-suave cx-mlab").attr("x", -8).attr("y", (d, i) => i * lado + lado / 2).attr("dy", ".35em").attr("text-anchor", "end")
.text((d, i) => i === 0 ? "" : META[d].nombre.slice(0, angosto ? 18 : 30));
g.selectAll("text.col").data(ids.slice(0, -1)).join("text").attr("class", "etq-suave cx-mlab")
.attr("transform", (d, j) => `translate(${j * lado + lado / 2},${n * lado + 4}) rotate(55)`).attr("dy", ".35em")
.text(d => META[d].nombre.slice(0, angosto ? 16 : 26));
const ir = d => { st.x = d.b; st.y = d.a; st.logx = st.logy = false; todo(false); document.getElementById("tab-cx-disp").click(); document.getElementById("f-cruces").scrollIntoView({behavior: REDUCIR ? "auto" : "smooth"}); };
const mover = (ev, d) => {
const [di, dj] = {ArrowRight: [0, 1], ArrowLeft: [0, -1], ArrowDown: [1, 0], ArrowUp: [-1, 0]}[ev.key] || [];
if (di == null) return;
ev.preventDefault();
for (let k = 1; k < n; k++) {
const sig = celdas.findIndex(c => c.i === d.i + di * k && c.j === d.j + dj * k);
if (sig < 0) continue;
const nodos = cel.nodes(); nodos[celdas.indexOf(d)].setAttribute("tabindex", -1); nodos[sig].setAttribute("tabindex", 0); nodos[sig].focus();
return;
}
};
cel.on("click", (ev, d) => ir(d)).on("keydown", (ev, d) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); ir(d); } else mover(ev, d); })
.on("blur", ocultarTip)
.on("pointerenter focus", (ev, d) => mostrarTip(el, `<b>${META[d.a].nombre}</b> ${yE(`<b>${META[d.b].nombre}</b>`)}<br>r = ${fr(d.r)}, ${d.n} jurisdicciones<br>valor p ${fp(d.p)}<br>Tocá para ver la dispersión`, izq + d.j * lado + lado / 2, d.i * lado))
.on("pointerleave", ocultarSiMouse);
const sig = celdas.filter(c => c.p < .05).length;
document.getElementById("cm-matriz-nota").textContent = `Cada celda es la correlación de Pearson entre dos indicadores en las ${FILAS.length - st.fuera.size} jurisdicciones incluidas. Va de −1, en rojo (cuando uno sube, el otro baja), a 1, en azul (cuando suben juntos). ` +
`En negrita, los pares con valor p menor a 0,05: son ${n0(sig)} de ${n0(celdas.length)}. Con tantos pares, unos ${n0(Math.round(celdas.length * .05))} pueden dar significativos solo por azar: conviene mirar cada uno en la dispersión antes de sacar conclusiones. Tocá una celda para ver su dispersión.`;
}
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
if (anim && !REDUCIR) { tramo.attr("x1", x(0)).attr("x2", x(0)).transition().duration(DUR_G).ease(EASE).attr("x1", r => x(r.lo)).attr("x2", r => x(r.hi)); pto.attr("cx", x(0)).transition().duration(DUR_G).ease(EASE).attr("cx", r => x(r.b)); }
tab.innerHTML = `<thead><tr><th>Variable</th><th class="n">Coeficiente estandarizado</th><th class="n">Intervalo del 95%</th><th class="n">Valor p</th><th class="n">VIF</th></tr></thead><tbody>` +
filas.map(r => `<tr><td>${META[r.k].nombre}</td><td class="n">${fr(r.b)}</td><td class="n">${fr(r.lo)} a ${fr(r.hi)}</td><td class="n">${fp(r.p)}</td><td class="n">${r.vif == null ? "s/d" : loc.format(",.1f")(r.vif)}</td></tr>`).join("") + `</tbody>`;
const sig = filas.filter(r => r.p < .05);
let t = `Con ${res.n} jurisdicciones, ${xs.length === 1 ? "el modelo con la variable elegida reproduce" : `el modelo con las ${xs.length} variables elegidas reproduce`} el ${loc.format(",.0f")(res.r2 * 100)}% de las diferencias entre provincias en «${Y.nombre}» (R² ajustado ${fr(res.r2a)}, valor p del modelo ${fp(res.pF)}). `;
t += sig.length ? `${xs.length > 1 ? "Si las demás variables quedan fijas, l" : "L"}${sig.length > 1 ? "as relaciones con" : "a relación con"} ${lista(sig.map(r => `«${META[r.k].nombre}» (${r.b > 0 ? "positiva" : "negativa"})`))} ${sig.length > 1 ? "siguen siendo claras: es poco probable que se deban" : xs.length > 1 ? "sigue siendo clara: es poco probable que se deba" : "es clara: es poco probable que se deba"} al azar. `
: `${xs.length > 1 ? "Una vez que se tienen en cuenta las demás, ninguna variable muestra por sí sola" : "La variable elegida no muestra"} una relación que se pueda distinguir del azar. `;
if (filas.some(r => r.vif > 5)) t += `Algunas variables explicativas se superponen mucho entre sí (VIF mayor a 5): sus coeficientes por separado no son confiables. `;
if (xs.length > 3) t += `Con tan pocos casos, más de tres variables explicativas vuelven inestable la estimación. `;
out.textContent = t.trim();
}
DIB["cruces-disp"] = dispersion; DIB["cruces-matriz"] = matriz; DIB["cruces-multi"] = multi;
sincronizar();
return {todo, pearson, spearman, simple};
})();
parte("departamentos");
parte("indice");
document.querySelectorAll(".conmutador:not(.pestanas):not([data-propio])").forEach(conm => {
const k = conm.dataset.g;
conm.querySelectorAll("button").forEach((b, i) => b.addEventListener("click", () => {
if (MED[k] === b.dataset.m) return;
MED[k] = b.dataset.m;
conm.style.setProperty("--i", i);
conm.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b));
cambiarVista(conm.dataset.dib || k);
}));
});
const EQUILIBRAR = "#herramientas-grid, .programas-grid, .pie-mapa";
(() => {
const visto = new WeakMap(), vigiladas = new WeakSet(), medidas = new ResizeObserver(es => es.forEach(e => equilibrar(e.target)));
function equilibrar(g) {
const hs = [...g.children].filter(h => !h.hidden), clave = g.clientWidth + ":" + hs.length;
if (visto.get(g) === clave) return;
visto.set(g, clave);
g.style.gridTemplateColumns = ""; hs.forEach(h => { h.style.gridColumn = ""; });
const cs = getComputedStyle(g);
if (!g.clientWidth || !cs.display.includes("grid") || cs.gridAutoFlow.includes("column")) return;
const m = cs.gridTemplateColumns.split(" ").filter(Boolean).length, n = hs.length;
if (m < 2 || n < 2) return;
const filas = Math.ceil(n / m), base = Math.floor(n / filas), extra = n % filas;
const cols = extra ? base * (base + 1) : base;
if (cols === m && !extra) return;
g.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
if (extra) hs.forEach((h, i) => { h.style.gridColumn = `span ${i < extra * (base + 1) ? base : base + 1}`; });
}
const todas = (deNuevo = false) => document.querySelectorAll(EQUILIBRAR).forEach(g => {
if (!vigiladas.has(g)) { vigiladas.add(g); medidas.observe(g); }
if (deNuevo) visto.delete(g);
equilibrar(g);
});
todas();
let pendiente = false;
new MutationObserver(ms => {
if (pendiente || !ms.some(m => m.target.closest?.(EQUILIBRAR) || [...m.addedNodes].some(n => n.matches?.(EQUILIBRAR) || n.querySelector?.(EQUILIBRAR)))) return;
pendiente = true;
requestAnimationFrame(() => { pendiente = false; todas(true); });
}).observe(document.body, {childList: true, subtree: true});
})();
(() => {
const medir = c => {
const bs = [...c.querySelectorAll(":scope > button")], b = bs.find(x => x.getAttribute("aria-pressed") === "true" || x.getAttribute("aria-selected") === "true");
if (!b || !c.offsetWidth) return;
const ws = bs.map(x => x.offsetWidth), distintos = Math.max(...ws) - Math.min(...ws) > 1;
c.classList.toggle("medido", distintos);
if (!distintos) return;
const rc = c.getBoundingClientRect(), rb = b.getBoundingClientRect(), esc = rc.width / c.offsetWidth || 1;
c.style.setProperty("--x", `${(rb.left - rc.left) / esc - c.clientLeft}px`);
c.style.setProperty("--w", `${rb.width / esc}px`);
};
const ro = new ResizeObserver(es => es.forEach(e => medir(e.target)));
const mo = new MutationObserver(ms => new Set(ms.map(m => m.target.closest(".conmutador"))).forEach(c => c && medir(c)));
document.querySelectorAll(".conmutador").forEach(c => {
ro.observe(c);
mo.observe(c, {subtree: true, attributes: true, attributeFilter: ["aria-pressed", "aria-selected"]});
});
})();
document.querySelectorAll(".pestanas").forEach(tl => {
const tabs = [...tl.querySelectorAll('[role="tab"]')], art = tl.closest("article.ficha");
const mostrar = (t, foco) => {
tabs.forEach((x, i) => {
const on = x === t; x.setAttribute("aria-selected", on); x.tabIndex = on ? 0 : -1;
document.getElementById(x.getAttribute("aria-controls")).hidden = !on;
if (on) tl.style.setProperty("--i", i);
});
if (art) {
const id = t.getAttribute("aria-controls");
art.querySelectorAll("[data-panel]").forEach(e => {
e.hidden = e.dataset.panel !== id;
const vm = e.nextElementSibling?.classList.contains("ver-mas") ? e.nextElementSibling : null;
if (e.matches(".lead") && !e.hidden) revisarLargo(e); else if (vm) vm.hidden = true;
});
art.querySelector(".tabla-datos")?.remove();
const vt = art.querySelector(".ver-tabla");
if (vt) { vt.setAttribute("aria-expanded", "false"); vt.querySelector(".lbl").textContent = "Ver tabla"; }
}
if (foco) t.focus();
document.getElementById(t.getAttribute("aria-controls")).querySelectorAll(".grafico[data-g]").forEach(gr => DIB[gr.dataset.g] && DIB[gr.dataset.g](!REDUCIR));
};
tabs.forEach((t, i) => {
t.addEventListener("click", () => mostrar(t));
t.addEventListener("keydown", ev => {
const d = ev.key === "ArrowRight" ? 1 : ev.key === "ArrowLeft" ? -1 : 0;
if (d) { ev.preventDefault(); mostrar(tabs[(i + d + tabs.length) % tabs.length], true); }
});
});
tabs.forEach(t => { const v = document.getElementById(t.getAttribute("aria-controls"))?.dataset.vieja; if (v) ABRIR_VIEJA[v] = () => mostrar(t); });
});
if (ABRIR_VIEJA[ANCLA_VIEJA]) queueMicrotask(ABRIR_VIEJA[ANCLA_VIEJA]);
function tablaAreas() {
const t = document.getElementById("tabla-areas"); if (!t) return;
t.innerHTML = `<thead><tr><th>Área</th><th>Categoría</th><th>Dónde</th><th class="n">Año</th><th class="n">Hectáreas</th></tr></thead><tbody>` +
T.parques_nacionales_lista.map(d => `<tr${NOMBRES[prov] && d.lugar.includes(NOMBRES[prov]) ? ' class="elegida"' : ""}><td>${d.nombre}</td><td>${d.caracter}</td><td>${d.lugar}</td>` +
`<td class="n">${d.anio}</td><td class="n">${n0(d.hectareas)}</td></tr>`).join("") + `</tbody>`;
}
const sg = v => (v > 0 ? "+" : "") + pct(v);
const BZ_Y = SX.balanza.ytd_anio > SX.balanza.anio, BZ_S = BZ_Y ? SX.balanza.ytd_saldo : SX.balanza.saldo;
const BZ_P = BZ_Y ? `entre enero y ${MESES[SX.balanza.ytd_mes - 1]} de ${SX.balanza.ytd_anio}` : `en ${SX.balanza.anio}`;
const BCR_PF = SX.bcra.variables.find(v => v.id === 12) || SX.bcra.variables[0];
const BCR_INI = SX.bcra.variables[0];
const CLAVE = {
"f-petroleo": [`${n0(PG.kbd)} mil`, `barriles de petróleo por día produjo el país en ${PG.mes}${PG.record ? ", el valor más alto de la serie" : ""}`,
`barriles por día en ${PG.mes}${PG.record ? ", el valor más alto de la serie" : ""}`],
"f-gas": [n1(PG.gas), `millones de metros cúbicos de gas natural por día se produjeron en ${PG.mes}`, `millones de m³ por día en ${PG.mes}`],
"f-gas-hogares": [pct(VV.pct_gas_red), `de los hogares cocinaba con gas de red en el Censo 2022. El ${pct(VV.pct_garrafa)}, con gas en garrafa`, "de los hogares del país cocinaba con gas de red"],
"f-hidro-provincias": [pct(PG.top_pct), `del petróleo del país salió de ${PG.top} entre ${PG.v_desde} y ${PG.v_hasta}`, `del petróleo del país salió de ${PG.top}`],
"f-areas-hidro": [pct(PG.areas_top10_pet), `del petróleo del país salió de las diez áreas de concesión que más produjeron en ${PG.areas_anio}`],
"f-pozos": [`${PG.veces} veces`, `más petróleo por día produjo un pozo de shale que uno convencional en ${PG.pozos_mes}`],
"f-empresas-hidro": [pct(PG.emp_top_pct), `del petróleo del país lo produjo ${PG.emp_top} entre ${PG.v_desde} y ${PG.v_hasta}`, `del petróleo del país lo produjo ${PG.emp_top}`],
"f-empleo-hidro": [n0(CN.pet_emp), `puestos asalariados registrados en la extracción de petróleo y gas en el ${CN.emp_trim}, en las provincias con dato`,
"puestos asalariados registrados del sector privado, suma de las provincias con dato"],
"f-regalias": [pct(PG.reg_top_pct), `de los ingresos totales de ${PG.reg_top} fueron regalías en ${PG.reg_anio}`, `de los ingresos totales de ${PG.reg_top}`],
"f-reservas": [`${n1(PG.res_hor_pet)} años`, `de producción de petróleo alcanzan las reservas comprobadas, al ritmo de ${PG.res_anio}`,
`de petróleo, al ritmo de producción de ${PG.res_anio}`],
"f-balanza-energetica": [n0(PG.bal_saldo), `millones de dólares de saldo ${PG.bal_saldo >= 0 ? "positivo" : "negativo"} tuvo el comercio exterior de energía en ${PG.bal_anio}`,
`millones de dólares de saldo ${PG.bal_saldo >= 0 ? "positivo" : "negativo"} en ${PG.bal_anio}`],
"f-fracturas": [n0(PG.fr_etapas), `etapas de fractura informaron las empresas en ${PG.fr_ult} en formaciones no convencionales, el ${pct(PG.fr_vm_pct)} en Vaca Muerta`],
"f-productividad": [`${n0(PG.cos_kbbl_ult)} mil`, `barriles de petróleo sacó en su primer año un pozo de shale de Vaca Muerta que empezó en ${PG.cos_ult}, ${n1(PG.cos_veces)} veces uno de ${PG.cos_ini}`,
`barriles en promedio por pozo que empezó en ${PG.cos_ult}, ${n1(PG.cos_veces)} veces uno de ${PG.cos_ini}`],
"f-gas-consumo": [`${n0(e.gas_pais)} m³`, `de gas natural consumió en promedio un usuario residencial en ${e.gas_anio}, y ${n0(e.gas_top[0][1])} en ${e.gas_top[0][0]}`,
`por usuario, promedio del país en ${e.gas_anio}`],
"f-permisos": [`${n0(CN.per_m2 / 1000)} mil m²`, `autorizaron los permisos de edificación de ${CN.per_municipios} municipios en ${CN.per_mes}` +
(CN.per_var != null ? `, ${pct(Math.abs(CN.per_var))} ${CN.per_var < 0 ? "menos" : "más"} que un año antes` : ""),
`autorizados en ${CN.per_mes} en ${CN.per_municipios} municipios` + (CN.per_var != null ? `, ${pct(Math.abs(CN.per_var))} ${CN.per_var < 0 ? "menos" : "más"} que un año antes` : "")],
"f-hipotecas": [`${n0(CN.hip_ult)} mil millones`, `de pesos en créditos hipotecarios UVA otorgaron los bancos en ${CN.hip_mes}`, `de pesos en ${CN.hip_mes}`],
"f-obra-publica": [`${n0(CN.op_total)} mil millones`, `de pesos invirtió la Nación en obra pública en ${CN.op_ult}, contra ${n0(CN.op_max)} mil millones en ${CN.op_max_anio}, el máximo desde ${CN.op_desde}, todo en pesos de ${CN.op_ult}`],
"f-electricidad-provincias": [`${n0(e.el_pais)} kWh`, `de electricidad por habitante consumieron los hogares del país en ${e.el_ult}`, `por habitante, promedio del país en ${e.el_ult}`],
"f-salarios": [`${n0(SA.pais)} pesos`, `era el salario bruto promedio de los asalariados registrados del sector privado en ${SA.mes}`, "promedio bruto del país"],
"f-salario-docente": [`${n0(DC.pais)} pesos`, `de salario bruto cobraba en promedio un maestro de grado con 10 años de antigüedad en ${DC.trim}`,
"por mes, promedio del país"],
"f-inversion-educativa": [`${n0(IE.pais)} pesos`, `invirtió el Estado por cada alumno de las escuelas estatales en ${IE.anio}`, "por alumno, promedio del país"],
"f-delitos": [n0(SG.total_tasa), `delitos registrados cada 100.000 habitantes en ${SG.anio}`, `delitos cada 100.000 habitantes en ${SG.anio}`],
"f-robos": [n0(SG.robos), `robos registrados cada 100.000 habitantes en ${SG.anio}`, `robos cada 100.000 habitantes en el país en ${SG.anio}`],
"f-homicidios": [n1(SG.hom_tasa), `víctimas de homicidios dolosos cada 100.000 habitantes en ${SG.anio}`, `víctimas cada 100.000 habitantes en el país en ${SG.anio}`],
"f-sin-condena": [pct(SG.sn_sin), `de las personas privadas de libertad en las cárceles del país no tenía condena al 31 de diciembre de ${SG.sn_anio}`,
`sin condena en el país al 31 de diciembre de ${SG.sn_anio}`],
"f-carceles": [n0(SG.sn_tasa), `personas privadas de libertad en cárceles cada 100.000 habitantes al 31 de diciembre de ${SG.sn_anio}`,
`personas cada 100.000 habitantes en el país al 31 de diciembre de ${SG.sn_anio}`],
"f-cuentas-nacion": [pct(Math.abs(GBN.primario)), `del PBI fue el ${sobra(GBN.primario)} primario del Sector Público Nacional en ${GBN.anio}, antes de pagar los intereses de la deuda`,
`del PBI fue el ${sobra(GBN.primario)} primario en ${GBN.anio}, antes de pagar los intereses de la deuda`],
"f-recaudacion": [pct(GRT.iva), `de la recaudación de impuestos nacionales de los doce meses hasta ${GRT.doce_hasta} fue IVA`],
"f-deuda": [pct(GBD.pct), `del PBI era la deuda bruta de la Administración Central al ${GBD.fecha}`, `del PBI al ${GBD.fecha}`],
"f-empleo-publico": [n1(GBC.cada_1000), `cargos ocupados cada 1.000 habitantes tenían las administraciones provinciales en ${GBC.anio}`, "cargos cada 1.000 habitantes en todo el país"],
"f-pobreza-aglomerados": [pct(PZA.reg_max[1]), `de las personas de los aglomerados urbanos ${delReg(PZA.reg_max[0])} estaba bajo la línea de pobreza ` +
`en el ${PZA.semestre}, la región con más pobreza`, `de las personas de los aglomerados urbanos ${delReg(PZA.reg_max[0])}, la región con más pobreza, en el ${PZA.semestre}`],
"f-empresas-tamano": [pct(EM.tam_micro), `de las empresas privadas de industria, comercio y servicios del país eran microempresas en ${EM.anio}`,
`de las empresas de industria, comercio y servicios del país eran microempresas en ${EM.anio}`],
"f-informalidad": [pct(INF.pais), `de los ocupados de los 31 aglomerados urbanos tenía un empleo informal, en promedio, en ${INF.trimestres}, según la EPH del INDEC`,
`de los ocupados tenía un empleo informal, promedio de ${INF.trimestres}`],
"f-desocupacion": [pct(DSO.pais), `de las personas que trabajaban o buscaban trabajo en los 31 aglomerados urbanos estaba desocupada, en promedio, en ${DSO.trimestres}`,
`desocupación de los 31 aglomerados, promedio de ${DSO.trimestres}`],
"f-coparticipacion": [`${n2(CPA.pais_hab / 1e6)} millones de pesos`, `por habitante recibieron las provincias y CABA en ${CPA.anio} por la coparticipación federal y otros ` +
`impuestos nacionales que se reparten por ley` + (Object.keys(CPA.atrasadas).length ? `, sin contar ${lista(Object.keys(CPA.atrasadas))}` : ""),
Object.keys(CPA.atrasadas).length ? "por habitante, promedio de las jurisdicciones con datos" : "por habitante, promedio del país"],
"f-sociedades": [n1(SOC.pais), `sociedades comerciales cada 100.000 habitantes se constituyeron en el país en ${SOC.anio}`,
`sociedades nuevas cada 100.000 habitantes, ${SOC.anio}`],
"f-escuelas-secundarias": [n1(ESS.pais), `escuelas secundarias cada 1.000 chicos de 12 a 17 años había en todo el país en ${ESS.fecha}`,
`escuelas secundarias cada 1.000 chicos de 12 a 17 años, ${ESS.fecha}`],
"f-escuelas-primarias": [n1(ESP.pais), `escuelas primarias cada 1.000 chicos de 5 a 14 años había en todo el país en ${ESP.fecha}`,
`escuelas primarias cada 1.000 chicos de 5 a 14 años, ${ESP.fecha}`],
"f-distancia-hospital": [n1(DHO.pais), `km o más en línea recta separan a la mitad de las escuelas rurales del país del hospital público con ` +
`internación más cercano, en ${DHO.fecha}`, `km de la escuela rural mediana al hospital público más cercano, ${DHO.fecha}`],
"f-hospitales": [n1(HSP.pais), `hospitales públicos con internación cada 100.000 habitantes había en todo el país en ${HSP.fecha}`,
`hospitales públicos con internación cada 100.000 habitantes, ${HSP.fecha}`],
"f-medicos": [n1(MDC.pais), `médicos activos cada 10.000 habitantes había en todo el país a fines de ${MDC.anio}`,
`médicos activos cada 10.000 habitantes, ${MDC.anio}`],
"f-cobertura-suelo": [pct(MBS.nat), `de la superficie del país tenía vegetación natural en ${MBS.fin}, según MapBiomas. En ${MBS.ini}, el ${pct(MBS.nat_ini)}`,
`de la superficie con vegetación natural, ${MBS.fin}`],
"f-tv-paga": [n1(TVP.pais), `accesos de TV por suscripción cada 100 hogares había en todo el país en el ${TVP.trim}`,
`accesos de TV por suscripción cada 100 hogares, ${TVP.trim}`],
"f-telefonia": [n1(TF.pais), `accesos de telefonía fija cada 100 hogares había en todo el país en el ${TF.trim}`,
`accesos de telefonía fija cada 100 hogares, ${TF.trim}`],
"f-abandono": [pct(ABN.pais), `de los alumnos de la secundaria de ${ABN.anio} no se volvió a matricular en ${ABN.sig}, en todo el país`,
`abandono de la secundaria, de ${ABN.anio} a ${ABN.sig}`],
"f-deuda-provincias": [pesosDeuda(DPR.pais_hab), `por habitante debían las provincias y CABA al ${DPR.fecha_txt}` +
(DPR.faltan.length ? `, sin contar ${lista(DPR.faltan)}` : ""), DPR.faltan.length ? "de deuda por habitante, promedio de las jurisdicciones con datos" : "de deuda por habitante, promedio del país"],
"f-impuestos-provinciales": [`${n0(GBP.pais)} pesos`, `por habitante recaudaron de impuestos propios las provincias y CABA en ${GBP.anio}` + (GBP.faltan.length ? `, sin contar ${lista(GBP.faltan)}` : ""), GBP.faltan.length ? "por habitante, promedio de las jurisdicciones con datos" : "por habitante, promedio del país"],
"f-nacidos-otro-pais": [pct(MGC.pct), `de las personas que vivían en el país en 2022 había nacido en otro país, según el Censo`,
"de la población del país, según el Censo"],
"f-migracion-interna": [pct(MGC.otra_pct), `de las personas que vivían en el país en 2022 había nacido en otra provincia, según el Censo`,
"de la población del país había nacido en otra provincia, según el Censo"],
"f-migracion-historia": [pct(MGH.max_pct), `de la población había nacido en otro país en el censo de ${MGH.max_anio}, la parte más alta desde ${MGH.ini}`,
`de la población en el censo de ${MGH.max_anio}, el valor más alto`],
"f-radicaciones": [n0(MGD.total), `residencias otorgó la Dirección Nacional de Migraciones en ${MGD.anio}`, `residencias en ${MGD.anio}`],
"f-argentinos-exterior": [n0(MGO.personas), `personas nacidas en la Argentina vivían en otro país a mediados de ${MGO.anio}, según las Naciones Unidas`,
`personas a mediados de ${MGO.anio}, según las Naciones Unidas`],
"f-inflacion": [pct(EIP.interanual), `subieron los precios al consumidor en los doce meses hasta ${EIP.mes}, según el INDEC`,
`en el país, en los doce meses hasta ${EIP.mes}`],
"f-mayoristas": [pct(EMY.ia_ipim), `subieron los precios mayoristas en los doce meses hasta ${EMY.mes}, según el INDEC`, `en los doce meses hasta ${EMY.mes}`],
"f-inflacion-rubros": [pct(EIP.div_max[1]), `subieron los precios de ${inicialMin(EIP.div_max[0])} en los doce meses hasta ${EIP.mes}, el rubro que más aumentó`,
`${inicialMin(EIP.div_max[0])}, el rubro que más subió`],
"f-salario-minimo": [pct(ESM.pct), `de la canasta básica total de un hogar de cuatro integrantes del Gran Buenos Aires pagaba el salario mínimo en ${ESM.mes}`,
`de la canasta básica total de un hogar de cuatro integrantes pagaba el salario mínimo en ${ESM.mes}`],
"f-canastas": [`${n0(ECB.cbt_hogar)} pesos`, `por mes necesitaba en ${ECB.mes} un hogar de cuatro integrantes del Gran Buenos Aires para no quedar bajo la línea de pobreza`,
`por mes, la canasta básica total de un hogar de cuatro integrantes del Gran Buenos Aires en ${ECB.mes}`],
"f-industria": [pct(Math.abs(IND.ia)), `${IND.ia < 0 ? "cayó" : "creció"} la producción de la industria en ${IND.mes} frente a ${IND.mes_ant}, según el INDEC`,
`${IND.ia < 0 ? "cayó" : "creció"} la producción industrial en ${IND.mes} frente a ${IND.mes_ant}`],
"f-crianza": [`${n0(ECR6.tot)} pesos`, `por mes costaba en ${ECR.mes} criar a un chico de 6 a 12 años, según la canasta de crianza del INDEC`,
`por mes, la canasta de crianza de un chico de 6 a 12 años en ${ECR.mes}`],
"f-salario-real": [pct(Math.abs(ESR.real_priv)), `${ESR.real_priv < 0 ? "bajó" : "subió"} en los doce meses hasta ${ESR.mes} el salario registrado del sector privado, descontada la inflación`,
`${ESR.real_priv < 0 ? "bajó" : "subió"} el salario privado registrado en los doce meses hasta ${ESR.mes}, descontada la inflación`],
"f-emae": [pct(Math.abs(EMA.interanual)), `${EMA.interanual < 0 ? "cayó" : "creció"} la actividad económica en ${EMA.mes} frente a ${EMA.mes_ant}, según el INDEC`,
`${EMA.interanual < 0 ? "cayó" : "creció"} en ${EMA.mes} frente a ${EMA.mes_ant}`],
"f-refugio": [n0(MGR.solicitudes), `solicitudes de refugio se presentaron en la Argentina en ${MGR.anio}, según la CONARE`,
`solicitudes en ${MGR.anio}, según la CONARE`],
"f-supermercados": [pct(Math.abs(ESU.prov.pais)), `${ESU.prov.pais < 0 ? "cayeron" : "crecieron"} las ventas de los supermercados del país, descontada la ` +
`inflación de cada región, en los doce meses hasta ${ESU.mes} frente a los doce anteriores`, `${ESU.prov.pais < 0 ? "cayeron" : "crecieron"} las ventas del país en los doce meses hasta ${ESU.mes}`],
"f-electricidad-sectores": [pct(e.els_pct.ind), `de la electricidad del país la usaron las industrias y los grandes comercios en ${e.el_ult}`,
"de la electricidad del país la usaron las industrias y los grandes comercios"],
"f-combustibles": [`${n0(CB.nafta)} pesos`, `por litro fue el precio mediano de la nafta súper en el surtidor en ${CB.mes}`,
`por litro de nafta súper, mediana del país en ${CB.mes}`],
"f-subsidios": [n2(e.sub_pbi) + "%", `del producto interno bruto fueron los subsidios económicos a la energía en ${e.sub_pbi_anio}, según la Secretaría de Hacienda`,
`del producto interno bruto en ${e.sub_pbi_anio}`],
"f-centrales": [pct(e.pot_pct_renov_ult), `de la potencia eléctrica instalada del país era eólica o solar en ${e.pot_anio}, contra ${pct(e.pot_pct_renov_ini)} en ${e.pot_ini}`],
"f-mundo-petroleo": [`N.º ${PG.mundo.crudo_kbd.puesto}`, `entre los productores de petróleo del mundo fue la Argentina en ${PG.mundo.crudo_kbd.anio}, según la EIA`,
"entre los productores de petróleo, según la EIA"],
"f-isac": [pct(Math.abs(CN.isac_var)), `${CN.isac_var < 0 ? "cayó" : "creció"} la actividad de la construcción en ${CN.isac_mes} frente al mismo mes del año anterior`,
`${CN.isac_var < 0 ? "cayó" : "creció"} en ${CN.isac_mes} frente al mismo mes del año anterior`],
"f-insumos": [`${CN.ins_suben} de ${CN.ins_n}`, `insumos de la construcción tuvieron más consumo aparente en los doce meses hasta ${CN.ins_mes} que en los doce anteriores`,
`insumos tuvieron más consumo en los doce meses hasta ${CN.ins_mes} que en los doce anteriores`],
"f-empleo-construccion": [n0(CN.emp_total), `puestos asalariados registrados en la construcción privada en el ${CN.emp_trim}`, "puestos asalariados registrados en todo el país"],
"f-costo": [pct(Math.abs(CN.icc_real)), `${CN.icc_real < 0 ? "menos" : "más"} cuesta construir en el Gran Buenos Aires que en ${CN.costo_desde}, descontada la inflación`,
`${CN.icc_real < 0 ? "menos" : "más"} cuesta construir que en ${CN.costo_desde}, descontada la inflación`],
"f-vivienda": [pct(VV.pct_alquila), `de los hogares alquilaba su vivienda en el Censo 2022`, "de los hogares del país alquilaba su vivienda"],
"f-hogares": [sg(e.crec_total), `creció la demanda eléctrica total entre ${e.anio_ini} y ${e.anio_ult}. La actividad económica creció ${pct(e.crec_emae)}`,
`creció la demanda eléctrica total. La actividad económica creció ${pct(e.crec_emae)}`],
"f-meses": [sg(e.dif_max_min), `más demanda eléctrica en ${e.mes_max} que en ${e.mes_min}, promedio de ${e.meses_desde} a ${e.meses_hasta}`, `más demanda en ${e.mes_max} que en ${e.mes_min}`],
"f-adolescentes": [n1(nac.pct_ult), `de cada 100 nacimientos de ${nac.anio_ult} fueron de madres menores de 20 años. En ${nac.anio_ini} eran ${n1(nac.pct_ini)}`,
`de cada 100 nacimientos del país en ${nac.anio_ult}`],
"f-chicos-escuela": [conSigno(ESC.var_pct), `${ESC.var_pct < 0 ? "bajan" : "suben"} los chicos de 5 a 14 años del país entre ${ESC.anio} y ${ESC.anio_fin}, según las proyecciones del INDEC`,
`en todo el país entre ${ESC.anio} y ${ESC.anio_fin}`],
"f-poblacion-proy": [conSigno(PPY.var_pct), `va a crecer la población del país entre ${PPY.anio} y ${PPY.anio_fin}, de ${n1(PPY.hoy / 1e6)} a ${n1(PPY.fin / 1e6)} millones de personas, según las proyecciones del INDEC`,
`en todo el país, de ${n1(PPY.hoy / 1e6)} a ${n1(PPY.fin / 1e6)} millones de personas`],
"f-mortalidad": [n1(mo.tasa), `muertes de menores de un año por cada 1.000 nacidos vivos en ${mo.anio}. En ${mo.anio - 1}, ${n1(mo.tasa_prev)}`, `cada 1.000 nacidos vivos en todo el país en ${mo.anio}. En ${mo.anio - 1}, ${n1(mo.tasa_prev)}`],
"f-pisa": [String(pz.mat), `puntos obtuvo la Argentina en matemática en PISA ${pz.anio}. El promedio de la OCDE fue ${pz.ocde_mat}`,
`puntos en matemática en ${pz.anio}, contra ${pz.ocde_mat} del promedio de la OCDE`],
"f-escolarizacion": [pct(es.pais_fin), `de los adolescentes en edad de cursar la secundaria estaba matriculado en ese nivel en ${es.fin}`,
`de los adolescentes del país en edad de cursar la secundaria, en ${es.fin}`],
"f-aprender": [pct(ap.mat), `de los estudiantes de 6° grado alcanzó un nivel satisfactorio o avanzado en matemática en Aprender ${ap.anio}`,
"en matemática, en todo el país"],
"f-empleo": [n1(em.cada_100_pais), `personas asalariadas registradas en el sector privado cada 100 habitantes en ${em.mes}`, "cada 100 habitantes en el país"],
"f-nacimientos": [n0(nac.n_ult), `nacimientos se registraron en la Argentina en ${nac.anio_ult}`, `nacimientos en la Argentina en ${nac.anio_ult}`],
"f-envejecimiento": [n1(EV.hoy), `personas de 65 años o más por cada 100 de 15 a 64 había en el país en ${EV.anio}`,
`personas de 65 años o más por cada 100 de 15 a 64 en el país, ${EV.anio}`],
...(HB ? {"f-haberes": [pct(HB.pct_min_ad), `del salario promedio de los asalariados registrados equivalía el haber mínimo con los refuerzos en ${HB.anio}${HB.meses < 12 ? `, hasta ${MESES[HB.meses - 1]}` : ""}`,
`del salario promedio registrado, el haber mínimo con refuerzos en ${HB.anio}${HB.meses < 12 ? `, hasta ${MESES[HB.meses - 1]}` : ""}`]} : {}),
"f-ingresos-aglomerados": [`${n0(Math.round(IA.ipcf.pais / 1000) * 1000)} pesos`, `por mes por integrante del hogar era la mediana del ingreso en los 31 aglomerados ` +
`urbanos en ${IA.trimestres}, en pesos del ${IA.trimestre}`, `por integrante por mes, mediana de los 31 aglomerados, en pesos del ${IA.trimestre}`],
...(PIN ? {"f-pensiones-invalidez": [n1(PIN.pais_cada_1000), `pensiones no contributivas por invalidez cada 1.000 habitantes había en el país en ${MESES[PIN.prov_mes - 1]} de ${PIN.prov_anio}`,
`pensiones por invalidez cada 1.000 habitantes en el país`]} : {}),
...(AU ? {"f-auh": [n1(AU.pais_100), `hijos con AUH cada 100 menores de 18 años había en el país en ${MESES[AU.mes - 1]} de ${AU.anio}`, "cada 100 menores de 18 años en el país"]} : {}),
...(DS ? {"f-desempleo": [n1(DS.pais_1000), `personas cobraban el seguro de desempleo cada 1.000 habitantes en el país en ${MESES[DS.prov_mes - 1]} de ${DS.prov_anio}`,
"cada 1.000 habitantes en el país"]} : {}),
"f-protegida": [pct(nt.pct), `del territorio continental del país está dentro de áreas protegidas, ${nt.anio}`, "del territorio continental del país"],
"f-parques": [n1(nt.pn_total_millones), `millones de hectáreas protegen las áreas nacionales, el ${pct(nt.pn_pct_mar)} en el mar`, "millones de hectáreas en áreas protegidas nacionales"],
"f-cumbres": [n0(nt.cu_top_v), `metros sobre el nivel del mar: ${nt.cu_top}, en ${nt.cu_top_prov}, la cumbre más alta del país`, `metros: ${nt.cu_top}, la cumbre más alta del país`],
"f-especies": [n0(nt.esp_top_v), `especies animales registradas en ${nt.esp_top}, el área nacional con más registros`, `especies animales registradas en ${nt.esp_top}, el área con más registros`],
"f-visitas": [n1(nt.vis / 1e6), `millones de visitas a parques nacionales en ${nt.vis_anio}`, `millones de visitas en ${nt.vis_anio}`],
"f-receptivo": [n1(tu.turistas / 1e6), `millones de turistas no residentes llegaron al país en ${tu.anio}`, `millones en ${tu.anio}, por todos los pasos de frontera`],
"f-hoteles": [n1(tu.eoh_total), `millones de viajeros se hospedaron en hoteles y parahoteles en ${tu.eoh_anio}`, `millones en ${tu.eoh_anio}, en las localidades relevadas`],
"f-eti": [n1(tu.eti_pc_top_v), `turistas del exterior cada 1.000 habitantes visitaron ${tu.eti_pc_top} en ${tu.eti_anio}, la jurisdicción con más en relación con su población, ` +
`entre los que se fueron del país por Ezeiza o Aeroparque`, `cada 1.000 habitantes visitaron ${tu.eti_pc_top}, la jurisdicción con más en relación con su población`],
"f-pobreza-ninez": [pct(PNZ.p0_17), `de las personas de 0 a 17 años de los 31 aglomerados urbanos vivía en hogares pobres en el ${PNZ.fin}`,
`de los chicos, en hogares pobres en el ${PNZ.fin}`],
"f-pobreza": [pct(R.pobreza.pob), `de las personas de los 31 aglomerados urbanos estaba bajo la línea de pobreza en el ${R.pobreza.sem}`,
`de las personas, bajo la línea de pobreza en el ${R.pobreza.sem}`],
"f-patentes": [n0(au.motos), `motos nuevas se inscribieron en ${au.anio}${au.moto_excluidos.length ? ` (sin contar las de ${lista(au.moto_excluidos)})` : ""}, ` +
`${au.motos > au.autos ? "más" : "menos"} que autos (${n0(au.autos)})`,
`motos en ${au.anio}${au.moto_excluidos.length ? ` sin ${lista(au.moto_excluidos)}` : ""}, ${au.motos > au.autos ? "más" : "menos"} que autos (${n0(au.autos)})`],
"f-patentes-prov": [n1(au.pais_1000), `autos nuevos cada 1.000 habitantes en ${au.anio}`, "autos cada 1.000 habitantes en todo el país"],
"f-pesca": [n0(pe.total), `toneladas de pescados y mariscos desembarcadas en ${pe.anio}`, `toneladas de todas las especies en ${pe.anio}, contra ${n0(pe.total_ini)} en ${pe.ini}`],
"f-pesca-rio": [pct(pe.rio_top_pct), `de la pesca comercial en ríos de ${pe.rio_anio} fue ${pe.rio_top.toLowerCase()}`, `de las toneladas capturadas fue ${pe.rio_top.toLowerCase()}`],
"f-soja": [n1(SJ.millones_ha), `millones de hectáreas se sembraron con soja en el país en la campaña ${SJ.campania}`, "millones de hectáreas sembradas en todo el país"],
"f-nombres": [cu.nena, `${yE(cu.varon)} fueron los nombres más elegidos para los bebés en ${cu.nom_anio}`, `para las nenas ${yE(cu.varon)} para los varones, en todo el país`],
"f-carne": [`${n1(cu.carne_v)} kg`, `de carne vacuna por habitante en ${cu.carne_anio}. En ${cu.carne_ini} eran ${n1(cu.carne_ini_v)} kg`,
`por año en ${cu.carne_anio}, contra ${n1(cu.carne_ini_v)} kg en ${cu.carne_ini}`],
"f-vino": [n0(cu.vino_v), `millones de litros de vino vendidos en el país en ${cu.vino_anio}`,
`millones de litros en ${cu.vino_anio}, ${pct(Math.abs(cu.vino_caida))} ${cu.vino_caida < 0 ? "menos" : "más"} que en ${cu.vino_ini}`],
"f-yerba": [n1(cu.yerba_v), `millones de kilos de yerba mate despacharon los molinos en ${cu.yerba_anio}`, `millones de kilos en ${cu.yerba_anio}, en todo el país`],
"f-ant-mapa": [n0(ANT.n), `instalaciones de ${ANT.paises} países hay en la Antártida, según la lista de ${ANT.comnap_fecha}`, `instalaciones de ${ANT.paises} países`],
"f-ant-bases": [n0(ANT.arg), `bases tiene la Argentina en la Antártida: ${ANT.arg_anual} funcionan todo el año y ${ANT.arg_verano}, solo en verano`, `bases argentinas: ${ANT.arg_anual} funcionan todo el año`],
"f-ant-paises": [n0(ANT.top_v), `instalaciones tiene ${ANT.top}, el país con más. La Argentina tiene ${ANT.arg}`, `instalaciones tiene ${ANT.top}. La Argentina, ${ANT.arg}`],
"f-ant-reclamos": [n0(ANT.reclaman), `países reclaman sectores de la Antártida. Los de la Argentina, Chile y el Reino Unido se superponen`, `países reclaman sectores de la Antártida`],
"f-ant-tratado": [n0(ANT.partes), `países forman parte del Tratado Antártico. ${ANT.consultivas} deciden en sus reuniones`, `países forman parte del Tratado`],
"f-ant-zonas": [n0(ANT.zaep), `zonas antárticas especialmente protegidas hay en ${ANT.ats_fecha}. La Argentina propuso ${ANT.arg_zaep}`, `zonas protegidas. La Argentina propuso ${ANT.arg_zaep}`],
"f-ant-temperatura": [`${n1(ANT.temp.orcadas.dif)} °C`, `más de temperatura media tuvo Orcadas en sus últimos diez años con dato que en los primeros diez, desde ${ANT.temp.orcadas.ini}`, `más en Orcadas que en sus primeros diez años`],
"f-ant-hielo": [`${n1(ANT.hielo_sep)} millones`, `de km² de hielo marino había en septiembre de ${ANT.hielo_fin}, ${n1(ANT.hielo_sep_base - ANT.hielo_sep)} menos que el promedio de 1981 a 2010`, `de km² de hielo marino en septiembre de ${ANT.hielo_fin}`],
"f-ant-turismo": [n0(ANT.tu), `personas visitaron la Antártida con empresas de IAATO en la temporada ${ANT.tu_fin}`, `visitantes en la temporada ${ANT.tu_fin}`],
"f-ant-presupuesto": [`${n1(ANT.gasto)} mil millones`, `de pesos gastó la Nación en programas antárticos en ${ANT.gasto_anio}, el ${ANT.gasto_pct.toLocaleString("es-AR")}% de todo su gasto`, `de pesos en programas antárticos en ${ANT.gasto_anio}`],
"f-glaciares": [n0(cu.gl_total), `glaciares inventariados en ${cu.gl_n} provincias`, `inventariados en todo el país, en ${cu.gl_n} provincias`],
"f-clima": [grados(cu.cl_max), `en ${cu.cl_max_anio} frente al promedio de 1991 a 2020, el año más cálido desde ${cu.cl_ini}`, `en ${cu.cl_max_anio}, el año más cálido de la serie`],
"f-esperanza": [n1(nv.ev_pais), `años de esperanza de vida al nacer en el país en ${nv.ev_anio}`, "años en todo el país, mujeres y varones juntos"],
"f-exporta-rubros": [`${n1(SX.rubros.total / 1000)} mil millones`, `de dólares en bienes exportó la Argentina en ${SX.rubros.anio}`, `de dólares en ${SX.rubros.anio}`],
"f-complejos": [pct(SX.complejos.top[0].pct), `de lo exportado en el ${SX.complejos.periodo} salió del ${SX.complejos.top[0].n.toLowerCase()}, el primero`,
`del ${SX.complejos.top[0].n.toLowerCase()}, el primero`],
"f-destinos": [pct(SX.destinos.top[0].pct), `de las exportaciones del ${SX.destinos.periodo} fue a ${SX.destinos.top[0].n}, el primer país de destino`, `a ${SX.destinos.top[0].n}, el primer país de destino`],
"f-exporta-provincias": [pct(SX.provincias.top3_pct), `de lo que exportó el país en ${SX.provincias.anio} salió de ${lista(SX.provincias.top3)}`,
`de lo exportado por el país salió de ${lista(SX.provincias.top3)}`],
"f-balanza": [`${n0(Math.abs(BZ_S))} millones`, `de dólares de ${BZ_S >= 0 ? "superávit" : "déficit"} comercial ${BZ_P}` +
(SX.balanza.ytd_anio > SX.balanza.anio ? `, contra ${saldoTx(SX.balanza.ytd_saldo_ant)} en los mismos meses del año anterior` : ""), `de dólares de ${BZ_S >= 0 ? "superávit" : "déficit"} comercial ${BZ_P}`],
"f-importaciones": [`${n1(SX.importaciones.total / 1000)} mil millones`, `de dólares en bienes importó la Argentina en ${SX.importaciones.anio}`, `de dólares en ${SX.importaciones.anio}`],
"f-socios": [`${n0(Math.abs(SX.socios.def[1]))} millones`, `de dólares de saldo en contra con ${SX.socios.def[0]} entre ${SX.socios.desde} y ${SX.socios.hasta}, ` +
`el mayor entre los ${SX.socios.n} países con más comercio`, `de saldo en contra con ${SX.socios.def[0]}, el mayor entre los principales socios`],
"f-valor-kilo": [`${n2(VK.expo)} dólares`, `valió un kilo exportado en ${VK.anio}, según el INDEC`, `por kilo exportado en ${VK.anio}`],
"f-socios-hist": (() => { const H = SX.socios_hist, s = H.importa.reduce((m, x) => x.p1 - x.p0 > m.p1 - m.p0 ? x : m);
return [pct(s.p1), `de lo que importó la Argentina en ${H.anio} vino de ${s.lab}, frente al ${pct(s.p0)} en ${H.desde}`, `de lo importado vino de ${s.lab} en ${H.anio}`]; })(),
"f-origen": [pct(SX.origen.top[0].pct), `de lo importado de ${SX.origen.periodo} vino de ${SX.origen.top[0].n}, el primer origen`, `desde ${SX.origen.top[0].n}, el primer origen`],
"f-cuenta-corriente": [`${n0(Math.abs(SX.cuenta_corriente.total))} millones`, `de dólares de ${SX.cuenta_corriente.total < 0 ? "déficit" : "superávit"} en la cuenta corriente en ${SX.cuenta_corriente.anio}: ` +
(SX.cuenta_corriente.total < 0 ? "por bienes, servicios, rentas y transferencias salieron más dólares de los que entraron" : "por bienes, servicios, rentas y transferencias entraron más dólares de los que salieron"), `de dólares de ${SX.cuenta_corriente.total < 0 ? "déficit" : "superávit"} en ${SX.cuenta_corriente.anio}`],
"f-reservas-bcra": [`${n1(SX.reservas.valor / 1000)} mil millones`, `de dólares de reservas brutas tenía el Banco Central el ${fLarga(SX.reservas.fecha)}`, `de dólares el ${fLarga(SX.reservas.fecha)}`],
"f-bcra": BCR_INI.t === "dolar"
? [`${n0(BCR_INI.v)} pesos`, `costaba el ${BCR_INI.n.toLowerCase()}, el ${fLarga(BCR_INI.f)}, según el Banco Central`, `costaba el ${BCR_INI.n.toLowerCase()}, el ${fLarga(BCR_INI.f)}`]
: [pct(BCR_PF.v), `nominal anual pagaban en promedio los plazos fijos a 30 días el ${fLarga(BCR_PF.f)}`, `nominal anual en plazos fijos a 30 días, el ${fLarga(BCR_PF.f)}`],
"f-tarifa-luz": [pct(ENR.pct250), `del salario mínimo costaba en ${ENR.mes} la luz de una casa de Edenor o Edesur que consume 250 kWh por mes, sin impuestos ni subsidio`,
`del salario mínimo, la luz de una casa que consume 250 kWh por mes`],
"f-mujeres-congreso": [pct(MJC.total), `de las bancas del Congreso ocupaban mujeres el ${MJC.fecha}: ${pct(MJC.dip)} en Diputados y ${pct(MJC.sen)} en el Senado`,
`de las bancas del Congreso, ocupadas por mujeres`],
"f-transito": [n1(TRN.max_v), `muertes en siniestros viales por año cada 100.000 habitantes hubo en ${listaY(TRN.max)} de ${TRN.desde} a ${TRN.hasta}, ${TRN.max.length > 1 ? "las tasas más altas" : "la tasa más alta"}`,
`muertes en siniestros viales por año cada 100.000 habitantes en ${listaY(TRN.max)}, ${TRN.max.length > 1 ? "las tasas más altas" : "la tasa más alta"}`],
"f-causas-muerte": [pct(CMG[0].pct), `de las muertes del país de ${CM.desde} a ${CM.hasta} fueron por ${CM_FRASE[CMG[0].k]}, la primera causa`,
`de las muertes del país, por ${CM_FRASE[CMG[0].k]}, la primera causa`],
"f-exportaciones": [n0(nv.ex_pc_pais), `dólares por habitante exportó el país en ${nv.ex_anio}`, "dólares por habitante, promedio del país"],
"f-cobertura": [pct(nv.censo.sin_cobertura), `de las personas no tenía obra social, prepaga ni plan estatal de salud en el Censo 2022`,
"de las personas del país no tenía obra social, prepaga ni plan estatal de salud en el Censo 2022"],
"f-dengue": [fDg(DG.pais_100000_juntas), `casos confirmados de dengue cada 100.000 habitantes hubo en el país de la temporada ${DG.prov_desde} a la ${DG.temp}`,
"casos de dengue cada 100.000 habitantes en el país"],
"f-vacunas": [String(VC.bajo95_1), `de las 24 jurisdicciones vacunaron con la primera dosis de la triple viral a menos del 95% de los chicos de un año en ${VC.anio}`,
"de las 24 jurisdicciones, debajo del 95% en la primera dosis"],
"f-censo": [pct(nv.censo.cloaca), `de los hogares tenía desagüe a red cloacal en el Censo 2022`, "de los hogares del país tenía desagüe a red cloacal"],
"f-internet": [n1(nv.in_pais), `accesos a internet fijo cada 100 hogares en todo el país, en el ${nv.in_trim}`, "accesos a internet fijo cada 100 hogares, en todo el país"],
"f-extranjeros": [n1(nv.xt_pais), `personas nacidas en otro país con DNI argentino cada 100 habitantes, ${nv.xt_corte}`, "cada 100 habitantes, en todo el país"],
"f-fiscal": [pct(R.fiscal.mediana), `fue la mediana de la parte de sus ingresos que las provincias y CABA recaudaron por su cuenta en ${R.fiscal.anio}` +
(Object.keys(R.fiscal.atrasadas).length ? `, sin ${lista(Object.keys(R.fiscal.atrasadas))}` : "") + `: la mitad quedó por debajo y la otra mitad, por encima`],
"f-empresas": [n0(EM.total_pais), `empresas privadas con personal en relación de dependencia había en el país en ${EM.anio}, cada una contada una sola vez (${n1(EM.pais_1000)} cada 1.000 habitantes)`,
`en todo el país, ${n1(EM.pais_1000)} cada 1.000 habitantes`],
"f-dinamica-empresas": [n0(EM.ap), `empresas con empleados abrieron en ${EM.ult} y ${n0(EM.ci)} cerraron`, `abrieron en ${EM.ult} y ${n0(EM.ci)} cerraron`],
"f-rotacion": [pct(RO.total), `de las personas asalariadas de los 31 aglomerados urbanos llevaba un año o menos en su empleo, entre el ${trim(RO.desde)} y el ${trim(RO.hasta)}`,
"de los asalariados de 31 aglomerados urbanos llevaba un año o menos en su empleo"],
"f-sube": [n2(su.total_millones),`millones de tarjetas SUBE distintas usadas en un día hábil típico de ${su.mes}`,
`millones de tarjetas distintas en ${su.mes}, en colectivos, trenes, subtes y lanchas`],
"f-corte-casos": [n0(R.justicia.corte.resueltos), `casos resolvió la Corte Suprema en ${R.justicia.corte.hasta}, con ${n0(R.justicia.corte.fallos)} fallos: un fallo puede cerrar varios casos iguales a la vez`,
`casos resueltos en ${R.justicia.corte.hasta}`],
"f-jueces-federales": [pct(R.justicia.federal.pct_sin_titular), `de los cargos de juez federal no tenía juez titular en ${R.justicia.federal.fecha}`,
"de los cargos de juez federal, sin titular"],
"f-fiscalias-federales": [n0(R.justicia.mp.fiscalias), `fiscalías federales funcionaban en ${R.justicia.mp.fecha}, junto con ${n0(R.justicia.mp.defensorias)} defensorías públicas oficiales`,
`fiscalías federales en ${R.justicia.mp.fecha}`],
"f-cortes-provinciales": [n0(R.justicia.prov.ministros), `ministras y ministros tenían los máximos tribunales de las provincias y de CABA al 31 de octubre de ${R.justicia.prov.anio}`,
`ministras y ministros en los máximos tribunales de las provincias y de CABA`],
"f-justicia-provincial": [n1(R.justicia.prov.pais.magistratura), `jueces cada 100.000 habitantes tenían las justicias de las provincias y de CABA al 31 de octubre de ${R.justicia.prov.anio}, contando la justicia de paz`,
"jueces cada 100.000 habitantes, con la justicia de paz"],
"f-anios-congreso": [`${n1(AC.top[0].total)} años`, `sumó ${AC.top[0].nombre} en el Congreso desde 1983, más que cualquier otra persona`,
`sumó ${AC.top[0].nombre}, más que cualquier otra persona`],
};
const ELU = R.elecciones.filter(x => x.vuelta > 0).at(-1);
const ESP_DIP = Object.keys(CG.dip).sort((a, b) => CG.dip[b] - CG.dip[a]);
const masMenos = (v, mas, menos) => v < 0 ? menos : mas;
const EXTRA = {
"x-pet-shale": ["f-petroleo", pct(PG.pct_nc), `del petróleo de ${PG.mes} salió de pozos no convencionales, contra el ${pct(PG.pct_nc_ult)} en todo ${PG.anio_ult}. ` +
`El shale fue el ${pct(PG.pct_shale)} y el resto, tight`],
"x-pet-ytd": ["f-petroleo", pct(Math.abs(PG.ytd.pet.var)), `${PG.ytd.pet.var < 0 ? "cayó" : "creció"} la producción de petróleo entre enero y ${MESES[PG.ytd.pet.mes - 1]} de ${PG.ytd.pet.anio}, frente a los mismos meses de ${PG.ytd.pet.anio - 1}`],
"x-vaca-muerta": ["f-hidro-provincias", pct(PG.vm_pct), `del petróleo del país salió de la formación Vaca Muerta entre ${PG.v_desde} y ${PG.v_hasta}`],
"x-construccion-ytd": ["f-isac", pct(Math.abs(CN.isac_ytd.var)), `${CN.isac_ytd.var < 0 ? "cayó" : "creció"} la actividad de la construcción entre enero y ${MESES[CN.isac_ytd.mes - 1]} de ${CN.isac_ytd.anio}, frente a los mismos meses del año anterior`],
"x-viviendas-construccion": ["f-vivienda", n0(CN.viv_abs.en_construccion), `viviendas estaban en construcción el día del Censo 2022, ${n1(VV.construccion_cada_1000)} cada 1.000`],
"x-emp-top": ["f-empresas", n1(EM.top_v), `empresas privadas con empleados cada 1.000 habitantes tenía ${EM.top} en ${EM.anio}, la jurisdicción con más. ${EM.low} tenía ${n1(EM.low_v)}`],
"x-emp-saldo": ["f-dinamica-empresas", `${EM.positivas} de 24`, `jurisdicciones abrieron más empresas de las que cerraron en ${EM.ult}. En el país abrieron ${n1(EM.te)} y cerraron ${n1(EM.ts)} de cada 100`],
"x-emp-negativos": ["f-dinamica-empresas", n0(EM.anios_negativos), `años con más cierres que aperturas de empresas desde ${EM.ini}, entre ellos ${lista(EM.ultimos_negativos.map(String))}`],
"x-nombres-prov": ["f-nombres", `${cu.varon_prov_n} de 24`, `jurisdicciones donde ${cu.varon_prov} fue el nombre de varón más inscripto en ${cu.nom_anio}`],
"x-hurtos": ["f-robos", n0(SG.hurtos), `hurtos registrados cada 100.000 habitantes en ${SG.anio}. En ${SG.anio - 1}, ${n0(SG.hurtos_ant)}`],
"x-primer-pais": ["f-nacidos-otro-pais", pct(MGC.paises[0][2]), `de las personas nacidas en otro país que vivían en la Argentina en 2022 había ` +
`nacido en ${MGC.paises[0][0]}`],
"x-inflacion-mes": ["f-inflacion", pct(EIP.mensual), `subieron los precios al consumidor en ${EIP.mes} frente al mes anterior, según el INDEC`],
"x-indigencia": ["f-pobreza", pct(R.pobreza.ind), `de las personas de los 31 aglomerados urbanos estaba bajo la línea de indigencia en el ${R.pobreza.sem}`],
"x-ev-brecha": ["f-esperanza", `${n1(nv.ev_m - nv.ev_v)} años`, `más es la esperanza de vida al nacer de las mujeres que la de los varones: ${n1(nv.ev_m)} contra ${n1(nv.ev_v)} años en ${nv.ev_anio}`],
"x-mi-reducibles": ["f-causas-infantiles", pct(R.mi_causas.reducibles.neonatal), `de las muertes de menores de 28 días de ${R.mi_causas.reducibles.anio} eran reducibles con prevención, diagnóstico o tratamiento oportunos`],
"x-mi-inicio": ["f-mortalidad", n1(mo.tasa_inicio), `muertes de menores de un año cada 1.000 nacidos vivos en ${mo.anio_inicio}. En ${mo.anio}, ${n1(mo.tasa)}`],
"x-aprender-len": ["f-aprender", pct(ap.len), `de los estudiantes de 6° grado alcanzó un nivel satisfactorio o avanzado en lengua en Aprender ${ap.anio}`, true],
"x-aprender-debajo": ["f-aprender", pct(ap.mat_debajo), `de los estudiantes de 6° grado quedó por debajo del nivel básico en matemática en Aprender ${ap.anio}`],
"x-nacimientos": ["f-nacimientos", n0(nac.n_ult), `nacimientos se registraron en ${nac.anio_ult}, ${pct(Math.abs(nac.caida))} menos que en ${nac.anio_pico}`],
"x-edad-mediana": ["f-piramide", `${PI.edad_mediana_hoy} años`, `es la edad mediana de la población en ${PI.anio}. En ${PI.anio_fin} será de ${PI.edad_mediana_fin}, según las proyecciones del INDEC`],
"x-vejez": ["f-envejecimiento", n1(EV.hoy), `personas de 65 años o más por cada 100 de 15 a 64 en ${EV.anio}. En ${EV.anio_fin} serán ${n1(EV.fin)}`],
"x-jubilaciones": ["f-envejecimiento", n2(JU.ratio), `aportantes por cada jubilación o pensión de ANSES en ${JU.mes ? MESES[JU.mes - 1] + " de " : ""}${JU.anio}. En ${JU.max_anio} eran ${n2(JU.max)}`],
"x-balotaje": ["f-elecciones", pct(ELU.pct_ganador), `de los votos positivos obtuvo la fórmula encabezada por ${ELU.ganador} en ${ELU.vuelta === 2 ? "la segunda vuelta" : "la primera vuelta"} de ${ELU.anio}` +
(ELU.vuelta === 2 ? `, y ${pct(100 - ELU.pct_ganador)} la de ${ELU.candidatos.find(c => c.c !== ELU.ganador).c}` : "") + (ELU.provisorio ? ". Datos del escrutinio provisorio" : "")],
"x-representacion": ["f-representacion", `${n1(CG.rep_max_v / CG.rep_min_v)} veces`, `más habitantes por banca de diputado hay en ${CG.rep_max} (${n0(CG.rep_max_v)}) que en ${CG.rep_min} (${n0(CG.rep_min_v)}), con la población de ${CG.anio}`],
"x-congreso": ["f-congreso", `${CG.dip[ESP_DIP[0]]} de ${CG.n_dip}`, `bancas de Diputados tenía ${ESP_TXT[ESP_DIP[0]]} al ${fLarga(CG.fecha)}, más que cualquier otro espacio. Le seguía ${ESP_TXT[ESP_DIP[1]]}, con ${CG.dip[ESP_DIP[1]]}`],
"x-atn": ["f-atn", n0(TRR.n_atn_ult), `provincias recibieron Aportes del Tesoro Nacional (ATN) en ${TRR.ult}, por ${milM(TRR.atn_ult)} de pesos. La ley no fija una fórmula para repartirlos`],
"x-presidentes": ["f-presidentes", `${PRR.amba} de ${PRR.n}`, `presidentes desde 1983, contando a los interinos de 2001, nacieron en el Área Metropolitana de Buenos Aires (AMBA), donde vive el ${pct(PRR.amba_pob)} de la población`],
"x-sube-trenes": ["f-sube", `${n0(su.tren_miles)} mil`, `tarjetas SUBE usadas en trenes en un día hábil típico de ${su.mes}`],
"x-parque-top": ["f-visitas", n0(vpq.top_v), `visitas recibió ${vpq.top}, el parque nacional más visitado en ${vpq.ult}`],
"x-ocupados-construccion": ["f-empleo-construccion", pct(VV.pct_ocupados_construccion), `de las personas ocupadas trabajaba en la construcción en el Censo 2022, con o sin registro`],
"x-sube-var": ["f-sube", pct(Math.abs(su.var_anual)), `${masMenos(su.var_anual, "más", "menos")} tarjetas SUBE se usaron en un día hábil típico de ${su.mes} que en ${su.mes_prev}`],
"x-hogares-crec": ["f-hogares", sg(e.crec_res), `creció la demanda eléctrica de los hogares entre ${e.anio_ini} y ${e.anio_ult}. La del resto de los usuarios, ${sg(e.crec_resto)}`],
"x-demanda-ytd": R.ytd?.demanda && ["f-hogares", sg(R.ytd.demanda.var), `${masMenos(R.ytd.demanda.var, "creció", "cayó")} la demanda eléctrica entre enero y ${MESES[R.ytd.demanda.mes - 1]} de ${R.ytd.demanda.anio}, frente a los mismos meses de ${R.ytd.demanda.anio - 1}`],
"x-demanda-total": ["f-hogares", n0(e.gwh_ult), `gigavatios hora de electricidad se demandaron en el país en ${e.anio_ult}`],
"x-turistas-doce": ["f-receptivo", pct(Math.abs(tu.doce_var)), `${masMenos(tu.doce_var, "más", "menos")} turistas no residentes llegaron en los doce meses hasta ${tu.doce_hasta} que en los doce anteriores${tu.provisorio ? ". Datos provisorios" : ""}`],
"x-hoteles-nr": ["f-hoteles", pct(tu.eoh_nr_pct), `de los viajeros hospedados en hoteles y parahoteles en ${tu.eoh_anio} no residía en el país`],
};
const EN_CIFRAS = {
construccion: ["f-isac", "f-empleo-construccion", "f-costo", "f-vivienda", "x-construccion-ytd", "x-ocupados-construccion", "x-viviendas-construccion", "f-insumos"],
trabajo: ["f-empleo", "f-salarios", "f-rotacion", "f-exportaciones"],
economia: ["f-inflacion", "x-inflacion-mes", "f-canastas", "f-salario-real", "f-emae", "f-supermercados"],
empresas: ["f-empresas", "x-emp-top", "f-dinamica-empresas", "x-emp-saldo", "x-emp-negativos"],
pobreza: ["f-pobreza", "x-indigencia", "f-censo", "f-internet"],
salud: ["f-esperanza", "x-ev-brecha", "f-causas-muerte", "f-mortalidad", "x-mi-reducibles", "x-mi-inicio"],
seguridad: ["f-homicidios", "f-robos", "x-hurtos", "f-carceles", "f-delitos"],
educacion: ["f-aprender", "f-salario-docente", "f-inversion-educativa", "f-escolarizacion", "x-aprender-len", "f-pisa", "x-aprender-debajo"],
externo: ["f-balanza", "f-exporta-rubros", "f-importaciones", "f-reservas-bcra", "f-destinos", "f-cuenta-corriente"],
poblacion: ["x-nacimientos", "f-poblacion-proy", "x-edad-mediana", "x-vejez", "x-jubilaciones", "f-adolescentes"],
gobierno: ["f-cuentas-nacion", "f-recaudacion", "f-deuda", "f-empleo-publico", "f-impuestos-provinciales", "f-fiscal"],
migraciones: ["f-nacidos-otro-pais", "x-primer-pais", "f-radicaciones", "f-argentinos-exterior", "f-migracion-interna", "f-migracion-historia"],
politica: ["x-balotaje", "x-representacion", "x-congreso", "x-atn", "x-presidentes"],
justicia: ["f-corte-casos", "f-jueces-federales", "f-fiscalias-federales", "f-cortes-provinciales", "f-justicia-provincial"],
movilidad: ["f-sube", "f-combustibles", "x-sube-var", "f-patentes", "x-sube-trenes", "f-patentes-prov"],
energia: ["f-hogares", "f-electricidad-provincias", "x-demanda-ytd", "f-gas-hogares", "f-subsidios", "x-hogares-crec", "f-gas-consumo",
"f-meses", "x-demanda-total"],
petroleo: ["f-petroleo", "f-gas", "x-pet-shale", "f-reservas", "f-hidro-provincias", "x-vaca-muerta", "f-mundo-petroleo", "f-balanza-energetica",
"f-pozos", "f-regalias", "f-empleo-hidro"],
turismo: ["f-receptivo", "x-turistas-doce", "f-hoteles", "f-eti", "x-hoteles-nr"],
naturaleza: ["f-protegida", "f-parques", "f-visitas", "f-pesca", "f-especies", "x-parque-top", "f-pesca-rio", "f-soja", "f-clima", "f-glaciares", "f-ant-bases", "f-ant-tratado"],
curiosidades: ["f-nombres", "x-nombres-prov", "f-carne", "f-vino", "f-yerba"],
};
const esc = t => String(t).replace(/[&<>"]/g, c => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;"})[c]);
function conBandera(c, nombre) { return `<span class="con-bandera">${bandera(c)}<span>${esc(nombre)}</span></span>`; }
const nTabla = loc.format(",.2~f");
const TABLA_VISTA = {
"f-cumbres": t => t.map(r => ({cumbre: r.nombre_ign, provincia: r.provincia, altura_m: r.altura_m})),
"f-bcra": t => {
const v = bcrVar(), filas = t.filter(r => r.id === v.id).reverse();
const NOM = {valor_real: v.t === "dolar" ? `a precios de ${mesPer(BV.tcr_mes)}` : `en pesos de ${mesPer(BV.ipc_mes)}`, pct_pbi: "en % del PBI",
tasa_real_mensual: "tasa real a 30 días, %", inflacion_mes_siguiente: "inflación del mes siguiente, %", variacion_12m: "variación en 12 meses, %",
variacion_real_12m: "variación sin inflación, %", inflacion_12m: "inflación de los mismos 12 meses, %", inflacion_12m_siguientes: "inflación de los 12 meses siguientes, %"};
const cols = Object.keys(NOM).filter(c => filas.some(r => r[c] != null));
return filas.map(r => ({mes: r.mes, [`${v.n}, ${v.u}`]: bcrValor(r), ...Object.fromEntries(cols.map(c => [NOM[c], r[c]]))}));
}
};
function tablaPropia(filas, ficha) {
return filas.length ? tablaDatos(filas, ficha) : `<p class="tabla-nota">No hay filas para lo elegido en el gráfico.</p>`;
}
function tablaDatos(filas, ficha = "") {
const MAX = 300, todas = Object.keys(filas[0]);
const cols = todas.includes("territorio") ? ["territorio", ...todas.filter(c => c !== "territorio" && c !== "codigo_indec")] : todas;
const anio = c => filas.every(r => r[c] == null || (Number.isInteger(r[c]) && r[c] >= 1800 && r[c] <= 2100));
const num = Object.fromEntries(cols.map(c => [c, filas.some(r => typeof r[c] === "number")]));
const v = (r, c) => r[c] == null ? "" : typeof r[c] === "number" ? (anio(c) ? String(r[c]) : nTabla(r[c])) : Array.isArray(r[c]) ? r[c].join(", ") : typeof r[c] === "object" ? JSON.stringify(r[c]) : r[c];
const vistas = filas.slice(0, MAX), esTotal = r => r.codigo_indec === "00" || /^total/i.test(String(r.territorio || ""));
const corte = {};
if (!/suicid|f-muertes|f-edad|f-votaciones/.test(ficha)) cols.forEach(c => {
if (!num[c] || anio(c) || /^(codigo_indec|anio|mes|semestre|trimestre|t|orden|edad|lat|lng)$/.test(c)) return;
const xs = vistas.filter(r => !esTotal(r) && typeof r[c] === "number").map(r => r[c]).sort(d3.ascending);
if (xs.length >= 6 && new Set(xs).size > 2) corte[c] = [d3.quantile(xs, .8), d3.quantile(xs, .5)];
});
const clase = (r, c) => !corte[c] || typeof r[c] !== "number" || esTotal(r) ? "" : r[c] >= corte[c][0] ? " q-alto" : r[c] < corte[c][1] ? " q-bajo" : "";
const nombreTabla = esc(document.getElementById(ficha)?.querySelector("h2, h3")?.textContent || "Datos");
return `<div class="tabla-desliza" tabindex="0" role="region" aria-label="Tabla: ${nombreTabla}"><table class="tabla-areas"><caption class="solo-lector">${nombreTabla}</caption><thead><tr>${cols.map(c => `<th${num[c] ? ' class="n"' : ""}>${esc(c.replace(/_/g, " "))}</th>`).join("")}</tr></thead><tbody>` +
vistas.map(r => `<tr${prov && r.codigo_indec === prov ? ' class="elegida"' : ""}>${cols.map(c => `<td${num[c] ? ` class="n${clase(r, c)}"` : ""}>${
c === "territorio" && (NOMBRES[r.codigo_indec] || r.codigo_indec === "00") ? conBandera(r.codigo_indec, v(r, c)) : esc(v(r, c))}</td>`).join("")}</tr>`).join("") +
`</tbody></table></div><p class="tabla-nota">${filas.length > MAX ? `Primeras ${MAX} filas de ${n0(filas.length)}. ` : ""}La tabla completa está en el CSV.` +
(Object.keys(corte).length ? ` En cada columna de números, en azul y negrita el 20% de los valores más altos y en gris los que quedan debajo de la mitad${filas.length > MAX ? " (entre las filas que se ven)" : ""}.` : "") + `</p>`;
}
const svgUnico = f => { const v = [...f.querySelectorAll(".grafico svg")].filter(s => s.getBoundingClientRect().width > 0 && s.viewBox?.baseVal?.width); return v.length === 1 ? v[0] : null; };
const LEY_IMG = ".pol-ley, .clave-color, .cx-leyenda, .ix-leyenda";
const ESTIRAR = {"ultra-condensed": 50, "extra-condensed": 62.5, condensed: 75, "semi-condensed": 87.5, normal: 100, "semi-expanded": 112.5,
expanded: 125, "extra-expanded": 150, "ultra-expanded": 200};
function trozosLey(el) {
const r = [], tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
for (let n; (n = tw.nextNode());) {
const cs = getComputedStyle(n.parentElement), fs = parseFloat(cs.fontSize);
const ejes = Object.fromEntries([...cs.fontVariationSettings.matchAll(/"(\w{4})" (-?[\d.]+)/g)].map(m => [m[1], +m[2]]));
const opsz = ejes.opsz || fs, wdth = ejes.wdth || 100, escala = fs / opsz;
const estira = Object.keys(ESTIRAR).reduce((a, k) => Math.abs(ESTIRAR[k] - wdth) < Math.abs(ESTIRAR[a] - wdth) ? k : a);
const ls = `${(parseFloat(cs.letterSpacing) || 0) / escala}px`;
n.textContent.split(/(\s+)/).filter(Boolean).forEach(t => r.push({t, fs, font: `${cs.fontWeight} ${opsz}px ${cs.fontFamily}`, c: cs.color, estira, ls, escala}));
}
return r;
}
const anchoTrozo = (med, p) => { med.font = p.font; med.fontStretch = p.estira; med.letterSpacing = p.ls; return med.measureText(p.t).width * p.escala; };
function renglonesLey(med, tr, x, x0, ancho, lh) {
const ops = []; let y = 0, esp = 0, pal = [];
const poner = () => {
const an = d3.sum(pal, p => p.an);
if (x > x0 && x + esp + an > ancho) { x = x0; y += lh; } else if (x > x0) x += esp;
pal.forEach(p => { ops.push({...p, x, y: y + (lh - p.fs) / 2, r: y}); x += p.an; });
pal = []; esp = 0;
};
tr.forEach(p => {
const an = anchoTrozo(med, p);
if (p.t.trim()) pal.push({...p, an}); else { if (pal.length) poner(); esp += an; }
});
if (pal.length) poner();
return {ops, x, alto: y + lh, varios: y > 0};
}
function leyendaImg(med, ley, ancho) {
const cs = getComputedStyle(ley), lh = c => parseFloat(c.lineHeight) || parseFloat(c.fontSize) * 1.2;
if (!cs.display.includes("flex")) return {...renglonesLey(med, trozosLey(ley), 0, 0, ancho, lh(cs)), cuad: []};
const gx = parseFloat(cs.columnGap) || 0, gy = parseFloat(cs.rowGap) || 0, ops = [], cuad = [];
let x = 0, y = 0, fila = 0;
[...ley.children].filter(it => it.getClientRects().length && it.textContent.trim()).forEach(it => {
const i = it.querySelector("i"), csI = i && getComputedStyle(i), caja = i?.getBoundingClientRect(), csIt = getComputedStyle(it), tr = trozosLey(it);
const sep = i ? caja.width + (parseFloat(csIt.columnGap) || 0) + (parseFloat(csI.marginRight) || 0) : 0;
const an = sep + d3.sum(tr, p => anchoTrozo(med, p));
if (x > 0 && x + an > ancho) { x = 0; y += fila + gy; fila = 0; }
const r = renglonesLey(med, tr, x + sep, x + sep, ancho, lh(csIt)), rad = csI?.borderTopLeftRadius;
r.ops.forEach(o => ops.push({...o, y: o.y + y}));
if (i) cuad.push({x, y: y + (r.alto - caja.height) / 2, w: caja.width, h: caja.height, fondo: csI.backgroundColor, borde: csI.borderTopColor,
b: ["Top", "Right", "Bottom", "Left"].map(k => parseFloat(csI[`border${k}Width`]) || 0),
radio: rad.endsWith("%") ? parseFloat(rad) / 100 * Math.min(caja.width, caja.height) : parseFloat(rad) || 0});
fila = Math.max(fila, r.alto);
x = r.varios ? ancho : r.x + gx;
});
return {ops, cuad, alto: y + fila};
}
function dibujarLey(ctx, l, x0, y0) {
const transp = c => /^(transparent|rgba\(.*,\s*0\))$/.test(c);
const caja = (x, y, w, h, r) => {
if (w <= 0 || h <= 0) return;
ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2)); else ctx.rect(x, y, w, h); ctx.fill();
};
l.cuad.forEach(q => {
const x = x0 + q.x, y = y0 + q.y, [bt, br, bb, bl] = q.b;
if (bt || br || bb || bl) {
ctx.fillStyle = q.borde; caja(x, y, q.w, q.h, q.radio);
ctx.fillStyle = transp(q.fondo) ? css("--bg") : q.fondo; caja(x + bl, y + bt, q.w - bl - br, q.h - bt - bb, Math.max(0, q.radio - Math.max(...q.b)));
} else if (!transp(q.fondo)) { ctx.fillStyle = q.fondo; caja(x, y, q.w, q.h, q.radio); }
});
l.ops.forEach(o => {
ctx.save(); ctx.font = o.font; ctx.fontStretch = o.estira; ctx.letterSpacing = o.ls; ctx.textBaseline = o.bl || "top"; ctx.fillStyle = o.c;
ctx.translate(x0 + o.x, y0 + o.y); ctx.scale(o.escala, o.escala); ctx.fillText(o.t, 0, 0); ctx.restore();
});
}
function claveImg(med, el, ancho) {
const cs = getComputedStyle(el), gx = parseFloat(cs.columnGap) || 0, gy = parseFloat(cs.rowGap) || 0, ops = [];
const partes = [...el.children].filter(e => e.getClientRects().length && e.textContent.trim()).map(e => {
const c = getComputedStyle(e), tr = trozosLey(e), p = tr.find(q => q.t.trim()), lh = parseFloat(c.lineHeight) || p.fs * 1.2;
anchoTrozo(med, p); const m = med.measureText(p.t), a = (m.fontBoundingBoxAscent ?? m.actualBoundingBoxAscent) * p.escala;
const d = (m.fontBoundingBoxDescent ?? m.actualBoundingBoxDescent) * p.escala;
return {tr, lh, base: (lh + a - d) / 2, tope: parseFloat(c.maxWidth) || Infinity, an: d3.sum(tr, q => anchoTrozo(med, q))};
});
if (!partes.length) return null;
let x = 0, y = 0, fila = [];
const cerrar = () => {
const B = d3.max(fila, p => p.base); let alto = 0;
fila.forEach(p => {
const arriba = B - p.base;
p.ren.ops.forEach(o => ops.push({...o, bl: "alphabetic", y: y + arriba + o.r + p.base}));
alto = Math.max(alto, arriba + p.ren.alto);
});
y += alto + gy; x = 0; fila = [];
};
partes.forEach(p => {
const an = Math.min(p.an, p.tope);
if (fila.length && x + an > ancho) cerrar();
p.ren = renglonesLey(med, p.tr, x, x, Math.min(ancho, x + p.tope), p.lh); fila.push(p); x += an + gx;
});
cerrar();
return {ops, cuad: [], alto: y - gy};
}
async function imagenFicha(f) {
const gr = svgUnico(f)?.closest(".grafico[data-g]");
if (gr && DIB[gr.dataset.g]) DIB[gr.dataset.g](false);
const svg = svgUnico(f); if (!svg) return;
const vb = svg.viewBox.baseVal, w = vb.width, h = vb.height;
const clon = svg.cloneNode(true), orig = [svg, ...svg.querySelectorAll("*")], copia = [clon, ...clon.querySelectorAll("*")];
const P = ["fill", "fill-opacity", "stroke", "stroke-width", "stroke-dasharray", "stroke-opacity", "stroke-linejoin", "stroke-linecap", "paint-order",
"opacity", "font-family", "font-size", "font-weight", "text-anchor", "dominant-baseline", "letter-spacing"];
orig.forEach((n, i) => { const cs = getComputedStyle(n); copia[i].setAttribute("style", P.map(k => `${k}:${cs.getPropertyValue(k)}`).join(";")); });
clon.setAttribute("xmlns", "http://www.w3.org/2000/svg"); clon.setAttribute("width", w); clon.setAttribute("height", h);
await Promise.all([...clon.querySelectorAll("image")].map(async im => {
const b = await (await fetch(im.getAttribute("href"))).blob();
im.setAttribute("href", await new Promise(ok => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(b); }));
}));
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
const fT = `600 24px ${F}`, fS = `400 15px ${F}`, fL = `400 15px ${F}`, fP = `400 12px ${F}`;
const tit = envolver(f.querySelector("h2, h3").textContent, fT), lead = envolver(f.querySelector(".lead")?.textContent || "", fL);
const sub = envolver(f.querySelector(".ficha-sub")?.textContent || "", fS);
const fuente = f.querySelector(".pie > span")?.cloneNode(true);
fuente?.querySelector(".pie-enlaces")?.remove();
const pieL = envolver(`${(fuente?.textContent || "").trim().replace(/\.$/, "")}. Datina, ${location.host}${location.pathname}#${f.id}`, fP);
const leyes = [...f.querySelectorAll(LEY_IMG)].filter(e => e.getClientRects().length && e.textContent.trim()).map(e => leyendaImg(med, e, W - pad * 2))
.filter(l => l.ops.length), eLey = parseFloat(css("--e-3")), altoLey = d3.sum(leyes, l => l.alto + eLey);
const ce = f.querySelector(".clave"), clave = ce?.getClientRects().length && !(gr && VISTA[gr.dataset.g]) ? claveImg(med, ce, W - pad * 2) : null;
const altoClave = clave ? clave.alto + eLey : 0;
const H = pad + tit.length * 30 + (sub.length ? sub.length * 21 + 6 : 0) + altoClave + 10 + lead.length * 21 + 18 + altoLey + h + 22 + pieL.length * 17 + pad;
const cv = document.createElement("canvas"); cv.width = W * E; cv.height = H * E;
const ctx = cv.getContext("2d"); ctx.scale(E, E); ctx.textBaseline = "top";
ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
let yy = pad;
ctx.fillStyle = css("--azul"); ctx.font = fT; tit.forEach(l => { ctx.fillText(l, pad, yy); yy += 30; });
if (sub.length) { yy += 6; ctx.fillStyle = css("--tinta-bajada"); ctx.font = fS; sub.forEach(l => { ctx.fillText(l, pad, yy); yy += 21; }); }
if (clave) { yy += eLey; dibujarLey(ctx, clave, pad, yy); yy += clave.alto; }
yy += 10;
const texto = () => { ctx.fillStyle = css("--tinta-bajada"); ctx.font = fL; lead.forEach(l => { ctx.fillText(l, pad, yy); yy += 21; }); };
const grafico = () => {
leyes.forEach(l => { dibujarLey(ctx, l, pad, yy); yy += l.alto + eLey; });
ctx.drawImage(img, pad + (W - pad * 2 - w) / 2, yy, w, h); yy += h;
};
if (NOTA_A_LA_VISTA.has(f.id)) { texto(); yy += 18; grafico(); } else { grafico(); yy += 18; texto(); }
yy += 12;
ctx.strokeStyle = css("--azul"); ctx.setLineDash([1, 3]); ctx.beginPath(); ctx.moveTo(pad, yy); ctx.lineTo(W - pad, yy); ctx.stroke(); yy += 10;
ctx.fillStyle = css("--muted"); ctx.font = fP; pieL.forEach(l => { ctx.fillText(l, pad, yy); yy += 17; });
URL.revokeObjectURL(url);
cv.toBlob(b => {
const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `datina-${f.id.slice(2)}.png`;
document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}, "image/png");
}
const SIN_RELACIONES = new Set(["f-edad", "f-suicidio", "f-suicidio-prov"]);
const EN_CATALOGO = new Set(["abandono_pais", "abandono_provincias", "actividad_anual", "actividad_mensual", "actividad_sectores", "adulto_equivalente", "anios_congreso", "antartida_bases", "antartida_hielo", "antartida_instalaciones", "antartida_paises", "antartida_presupuesto", "antartida_reclamos", "antartida_temperatura", "antartida_tratado", "antartida_tratado_serie", "antartida_turismo", "antartida_zonas_paises", "apoyo_gobierno_provincias", "aprender_departamentos", "aprender_diagnostico", "aprender_provincias", "areas_produccion", "areas_protegidas_provincias", "areas_serie", "argentinos_exterior", "argentinos_exterior_destinos", "asignaciones_cobertura", "auh_provincias", "balanza_comercial", "balanza_energetica", "bcra_variables", "bcra_variables_lista", "calendario_indec", "canasta_crianza", "canasta_mensual", "canasta_regiones", "capitales", "capitales_eph", "carceles_provincias", "carceles_serie", "carne_vacuna", "causas_muerte_provincias", "censo2022_provincias", "censos_pais", "censos_provincias", "centrales", "chicos_escuela_provincias", "clima_desvio", "cobertura_suelo_pais", "cobertura_suelo_provincias", "cobertura_tipo_provincias", "combustibles_anual", "combustibles_mensual", "combustibles_provincias", "comercio_rubro_pais", "comercio_socios", "comercio_socios_historia", "comercio_valor_kilo", "compras_dolares_anual", "confianza_consumidor", "confianza_gobierno", "confianza_gobierno_elecciones", "confianza_gobierno_gobiernos", "congreso_composicion", "coparticipacion_provincias", "corte_casos", "corte_composicion", "corte_jueces", "corte_jueces_fuentes", "corte_no_asumieron", "corte_presidentes", "costo_anual", "costo_construccion", "crianza_salario", "cruces_provincias", "cruces_series", "cuenta_corriente", "cuentas_nacion", "cumbres_ign", "curvas_vm", "delitos_serie", "delitos_tipo", "dengue_pais", "dengue_provincias", "departamentos", "desembarques_especies", "desembarques_top", "desocupacion_aglomerados", "desocupacion_serie", "deuda_pbi", "deuda_provincias", "diputados_nacionales", "diseno_pozos_vm", "distancia_hospital_provincias", "dolar_inversion_trimestral", "dotacion_nacion", "elecciones_oficiales_diputados", "elecciones_oficiales_gobernador", "elecciones_oficiales_presidente", "elecciones_oficiales_senadores", "elecciones_oficiales_totales", "elecciones_presidenciales", "electricidad_mensual", "electricidad_provincias", "electricidad_sectores", "electricidad_serie", "empleo_construccion_provincias", "empleo_construccion_serie", "empleo_mujeres_departamentos", "empleo_mujeres_edad", "empleo_mujeres_provincias", "empleo_provincias", "empleo_publico_provincias", "empresas_provincias", "empresas_serie_pais", "empresas_tamano_sector", "energia_estacionalidad", "energia_hogares", "envejecimiento_pais", "envejecimiento_provincias", "escolarizacion_secundaria_provincias", "escuelas_primarias_provincias", "escuelas_secundarias_provincias", "especies_areas_nacionales", "esperanza_vida_provincias", "expectativas_inflacion", "exportaciones_cantidades_anual", "exportaciones_complejos", "exportaciones_destinos", "exportaciones_dolar_trimestral", "exportaciones_provincias", "exportaciones_rubros_anual", "extranjeros_provincias", "fiscal_provincias", "fiscalias_defensorias_federales", "fracturas_anual", "gabinetes_origen", "gas_usuario_mensual", "gas_usuario_provincias", "gas_usuario_serie", "gasto_nacion_tipo", "glaciares_provincias", "haberes_previsionales", "hidrocarburos_anual", "hidrocarburos_empresas", "hidrocarburos_mensual", "hidrocarburos_provincias", "hipotecas_mensual", "homicidios_provincias", "hospitales_provincias", "importaciones_origen", "importaciones_usos", "impuestos_provinciales", "industria_ramas", "inflacion_anual", "inflacion_detalle", "inflacion_mensual", "inflacion_personal", "inflacion_regiones", "inflacion_rubros", "informalidad_aglomerados", "informalidad_grupos", "ingresos_aglomerados", "internet_fijo_provincias", "inversion_educativa", "inversion_educativa_serie", "isac_anual", "isac_insumos", "isac_mensual", "jubilaciones_aportantes", "justicia_federal_provincias", "justicia_provincias", "legisladores_por_periodo", "madres_adolescentes_nse", "madres_adolescentes_provincias", "mayoristas_mensual", "medicos_provincias", "migracion_censos", "migraciones_departamentos", "ministros_nacionales", "ministros_provincias", "mortalidad_infantil_causas", "mortalidad_infantil_provincias", "mudanzas_departamentos", "mudanzas_matriz", "mudanzas_provincias", "muertes_violentas", "mujeres_congreso", "mujeres_congreso_provincias", "mundo_hidrocarburos", "nacidos_otro_pais_paises", "nacidos_otro_pais_provincias", "nacimientos", "nafta_dolares_anual", "nafta_dolares_mensual", "nombres_serie", "nombres_top", "obra_publica_provincias", "obra_publica_serie", "ocde_comparacion", "parques_nacionales_historia", "parques_nacionales_lista", "patentamientos_anual", "patentamientos_provincias", "pensiones_invalidez", "pensiones_invalidez_provincias", "permisos_mensual", "pesca_continental", "pesca_continental_provincias", "piramide_poblacion", "pisa_argentina_ocde", "poblacion_proyectada_provincias", "pobreza_aglomerados", "pobreza_ninez", "pobreza_provincias", "pobreza_serie", "potencia_instalada", "pozos_no_convencionales", "pozos_provincias", "pozos_terminados", "pozos_terminados_provincias", "pozos_tipo", "precio_consumo", "presidentes", "prestacion_desempleo", "prestacion_desempleo_provincias", "presupuesto_votos", "privadas_aprender_departamentos", "produccion_mensual", "productividad_vm", "puestos_provincias", "radicaciones_anual", "radicaciones_nacionalidad", "recaudacion_anual", "recaudacion_impuestos", "refugio_acnur", "refugio_nacionalidades", "refugio_solicitudes", "regalias_crudo_serie", "regalias_provincias", "representacion_provincias", "reservas_bcra", "reservas_factores", "reservas_hidrocarburos", "reservas_netas", "reservas_provincias", "robos_provincias", "rotacion_laboral", "rutas_exportaciones", "salario_docente", "salario_docente_serie", "salario_minimo_canasta", "salario_real_mensual", "salarios_provincias", "salarios_serie", "sectores_empleo", "seguridad_serie_prov", "senadores_nacionales", "sociedades_pais", "sociedades_provincias", "soja_departamentos", "soja_pais", "soja_provincias", "sube_dia_habil", "subsidios_energia", "supermercados_mensual", "supermercados_provincias", "tarifa_luz", "telefonia_fija_pais", "telefonia_fija_provincias", "transferencias_acumulado", "transferencias_provincias", "transferencias_serie", "transito_pais", "transito_provincias", "turismo_dolar_mensual", "turistas_extranjeros_provincias", "turistas_no_residentes_anual", "tv_paga_pais", "tv_paga_provincias", "vacunas_provincias", "vacunas_serie", "viajeros_hoteles_anual", "vino_mercado_interno", "visitas_parques_nacionales", "visitas_por_parque", "vivienda_departamentos", "vivienda_provincias", "votaciones_leyes_clave", "voto_legisladores_y_provincia", "yerba_molino"]);
const VARIAS_SECCIONES = new Set([...document.querySelectorAll("article.ficha")].map(f => f.closest(".tema"))).size > 1;
const PARA_ENTENDER = !!document.getElementById("para-entender");
document.querySelectorAll("article.ficha").forEach(f => {
const tituloFicha = f.querySelector("h2, h3");
const t = f.closest(".tema"), tema = VARIAS_SECCIONES && (t?.querySelector(":scope > .tema-nombre") || t?.querySelector("h1, h2"))?.textContent;
if (tema) tituloFicha.insertAdjacentHTML("beforebegin", `<span class="etiqueta">${tema}</span>`);
const c = CLAVE[f.id];
if (c) (f.querySelector(".ficha-sub") || tituloFicha).insertAdjacentHTML("afterend", `<p class="clave"><span class="num">${c[0]}</span><span class="txt">${c[2] || c[1]}</span></p>`);
const pie = f.querySelector(".pie"), csv = pie.querySelector(":scope > a"), otrosCsv = [...pie.querySelectorAll(":scope > a[data-panel]")].filter(a => a !== csv);
const acc = document.createElement("div"); acc.className = "acciones";
const nombre = (csv.getAttribute("href").match(/datos\/(\w+)\.csv/) || [])[1], filas = nombre && T[nombre], propia = TABLA_PROPIA[f.id];
const conTabla = propia || nombre && DIFERIDAS[nombre] || Array.isArray(filas) && filas.length > 0 && typeof filas[0] === "object" ||
[...f.querySelectorAll(".panel-pestana[data-vieja]")].some(x => TABLA_PROPIA[x.dataset.vieja]);
const desc = `aria-describedby="${tituloFicha.id || (tituloFicha.id = f.id + "-tit")}"`;
const enlaces = [PARA_ENTENDER ? `<a class="enlace como-calcula" href="#para-entender" ${desc}>Cómo se calcula</a>` : "",
!f.classList.contains("explorador") && !SIN_RELACIONES.has(f.id) ? `<a class="enlace origen" href="relaciones?n=${f.id}" ${desc}>${PARA_ENTENDER ? "de" : "De"} dónde sale</a>` : ""]
.filter(Boolean);
if (enlaces.length) pie.querySelector(":scope > span")?.insertAdjacentHTML("beforeend", ` <span class="pie-enlaces">${enlaces.join(" y ")}</span>`);
acc.innerHTML = (conTabla ? `<button type="button" class="boton chico accion ver-tabla" aria-expanded="false"><span class="lbl">Ver tabla</span></button>` : "") +
`<details class="compartir"><summary class="boton chico accion"><span class="lbl">Compartir y descargar</span><span class="desp-signo" aria-hidden="true"></span></summary>` +
`<div class="compartir-panel"><button type="button" class="boton chico accion copiar"><span class="lbl">Copiar enlace</span></button>` +
`<button type="button" class="boton chico accion citar"><span class="lbl">Copiar cita</span></button>` +
(f.querySelector(".grafico[data-g]") ? `<button type="button" class="boton chico accion imagen" hidden><span class="lbl">Descargar imagen</span></button>` : "") +
(f.querySelector(".grafico[data-g]") && !NOTA_A_LA_VISTA.has(f.id) ? `<button type="button" class="boton chico accion insertar"><span class="lbl">Copiar código para insertar</span></button>` : "") +
`</div></details>`;
const panel = acc.querySelector(".compartir-panel");
[csv, ...otrosCsv].forEach(a => {
const lbl = a.dataset.panel && a.textContent !== "Descargar tabla (CSV)" ? a.textContent : "Descargar CSV";
a.className = "boton chico accion"; a.innerHTML = `<span class="lbl">${lbl}</span>`; panel.appendChild(a);
});
if (EN_CATALOGO.has(nombre)) panel.insertAdjacentHTML("beforeend", `<a class="boton chico accion" href="catalogo#cat-${nombre}" ${desc}><span class="lbl">Ver en el catálogo</span></a>`);
pie.appendChild(acc);
const tablaActiva = () => (([csv, ...otrosCsv].find(a => !a.hidden) || csv).getAttribute("href").match(/datos\/(\w+)\.csv/) || [])[1] || nombre;
acc.querySelector(".ver-tabla")?.addEventListener("click", async ev => {
const b = ev.currentTarget, abierta = b.getAttribute("aria-expanded") === "true";
if (b.dataset.cargando) return;
let caja = f.querySelector(".tabla-datos");
if (!caja) {
b.dataset.cargando = "1";
let t;
const k = vistaDe(f), pr = TABLA_PROPIA[k];
try { t = await (pr ? pr() : cargarTabla(tablaActiva())); } catch {
f.querySelector(".tabla-error")?.remove();
pie.insertAdjacentHTML("beforebegin", `<p class="nota tabla-error" role="status">No se pudo cargar la tabla. Probá de nuevo.</p>`);
return;
} finally { delete b.dataset.cargando; }
f.querySelector(".tabla-error")?.remove();
caja = document.createElement("div"); caja.className = "tabla-datos";
caja.innerHTML = pr ? tablaPropia(t, k) : tablaDatos(TABLA_VISTA[k] ? TABLA_VISTA[k](t) : t, k); pie.before(caja);
}
caja.hidden = abierta; b.setAttribute("aria-expanded", String(!abierta));
b.querySelector(".lbl").textContent = abierta ? "Ver tabla" : "Ocultar tabla";
});
acc.querySelector(".imagen")?.addEventListener("click", ev => {
const l = ev.currentTarget.querySelector(".lbl");
imagenFicha(f).catch(() => { l.textContent = "No se pudo"; clearTimeout(l._t); l._t = setTimeout(() => { l.textContent = "Descargar imagen"; }, 1800); });
});
const enlace = () => {
const vista = vistaDeFicha(f), q = [prov ? "prov=" + prov : "", vista ? "vista=" + vista : ""].filter(Boolean).join("&");
return location.origin + location.pathname + (q ? "?" + q : "") + "#" + (f.querySelector(".panel-pestana[data-vieja]:not([hidden])")?.dataset.vieja || f.id);
};
const copiar = async (texto, sel, listo, normal) => {
const lbl = acc.querySelector(`${sel} .lbl`);
const cambiar = t => { lbl.classList.add("cambia"); setTimeout(() => { lbl.textContent = t; lbl.classList.remove("cambia"); }, 120); };
let ok = false;
try { await navigator.clipboard.writeText(texto); ok = true; }
catch (_) {
const ta = document.createElement("textarea"); ta.value = texto; ta.setAttribute("readonly", "");
ta.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(ta); ta.select();
try { ok = document.execCommand("copy"); } catch (_) {}
ta.remove();
}
cambiar(ok ? listo : "No se pudo copiar"); avisar(ok ? listo : "No se pudo copiar");
clearTimeout(lbl._t); lbl._t = setTimeout(() => cambiar(normal), 1800);
};
acc.querySelector(".copiar").addEventListener("click", () => copiar(enlace(), ".copiar", "Enlace copiado", "Copiar enlace"));
acc.querySelector(".citar").addEventListener("click", () => copiar(citaFicha(f, enlace()), ".citar", "Cita copiada", "Copiar cita"));
acc.querySelector(".insertar")?.addEventListener("click", () => {
const e = enlace(), i = e.indexOf("#"), u = e.slice(0, i) + (e.slice(0, i).includes("?") ? "&" : "?") + "insertar" + e.slice(i);
copiar(`<iframe src="${u}" title="${tituloFicha.textContent.replace(/"/g, "&quot;")} (Datina)" width="100%" height="900" style="border:0" loading="lazy"></iframe>`,
".insertar", "Código copiado", "Copiar código para insertar");
});
});
document.querySelectorAll(".tema:not(.herramienta) > article.ficha:not(.ancha)").forEach(f => {
const [cab, graf, texto] = ["ficha-cab", "ficha-grafico", "ficha-texto"].map(c => Object.assign(document.createElement("div"), {className: c}));
[...f.children].forEach(el => {
if (el.matches(".pie, .tabla-datos")) return;
(el.matches(".etiqueta, h2, h3, .ficha-sub, .clave") ? cab : el.matches(".lead, .nota:not(.ocde-nota), .ir-consultas") ? texto : graf).appendChild(el);
});
f.prepend(cab, ...(NOTA_A_LA_VISTA.has(f.id) ? [texto, graf] : [graf, texto]));
f.classList.add("horizontal");
});
const INDICE_EXP = matchMedia("(min-width: 761px)");
document.querySelectorAll(".explicador").forEach(ex => {
const botones = [...ex.querySelectorAll(".despliegue")];
const OUT = "cubic-bezier(.23,1,.32,1)", curso = new Map();
const region = b => document.getElementById(b.getAttribute("aria-controls"));
const parar = r => { (curso.get(r) || []).forEach(a => a.cancel()); curso.set(r, []); r.style.overflow = ""; };
const animar = (r, el, cuadros, op) => { const a = el.animate(cuadros, {easing: OUT, ...op}); curso.get(r).push(a); return a; };
const alternar = (btn, abrir) => {
const r = region(btn), cont = r.firstElementChild;
const h0 = r.classList.contains("abierto") ? r.getBoundingClientRect().height : 0;
parar(r);
btn.setAttribute("aria-expanded", String(abrir));
if (abrir) {
r.classList.add("abierto");
const h1 = r.getBoundingClientRect().height;
animar(r, cont, REDUCIR ? [{opacity: 0}, {opacity: 1}] : [{opacity: 0, transform: "translateY(8px)"}, {opacity: 1, transform: "none"}],
{duration: 250, delay: h0 ? 0 : 50, fill: "backwards"});
if (!REDUCIR && h0 !== h1) { r.style.overflow = "hidden"; animar(r, r, [{height: h0 + "px"}, {height: h1 + "px"}], {duration: 250}).finished.then(() => { r.style.overflow = ""; }, () => {}); }
return;
}
animar(r, cont, [{opacity: 1}, {opacity: 0}], {duration: 150, fill: "forwards"});
if (REDUCIR) { r.classList.remove("abierto"); parar(r); return; }
r.style.overflow = "hidden";
animar(r, r, [{height: h0 + "px"}, {height: "0px"}], {duration: 200, fill: "forwards"}).finished.then(() => {
if (btn.getAttribute("aria-expanded") === "false") { r.classList.remove("abierto"); parar(r); }
}, () => {});
};
const mostrar = (btn, fundido) => {
botones.forEach(b => { const r = region(b); parar(r); if (b !== btn) { b.setAttribute("aria-expanded", "false"); r.classList.remove("abierto"); } });
btn.setAttribute("aria-expanded", "true");
const r = region(btn);
r.classList.add("abierto");
if (fundido) animar(r, r.firstElementChild, [{opacity: 0}, {opacity: 1}], {duration: 150});
};
let turno = 0;
botones.forEach(btn => btn.addEventListener("click", async () => {
const mio = ++turno;
if (INDICE_EXP.matches) { if (btn.getAttribute("aria-expanded") !== "true") mostrar(btn, true); return; }
if (btn.getAttribute("aria-expanded") === "true") return alternar(btn, false);
const otro = botones.find(b => b !== btn && b.getAttribute("aria-expanded") === "true");
if (otro && otro.compareDocumentPosition(btn) & Node.DOCUMENT_POSITION_FOLLOWING) {
const r = region(otro);
otro.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-expanded", "true");
parar(r);
if (!REDUCIR) await animar(r, r.firstElementChild, [{opacity: 1}, {opacity: 0}], {duration: 100, fill: "forwards"}).finished.catch(() => {});
if (otro.getAttribute("aria-expanded") === "false") {
const y0 = btn.getBoundingClientRect().top;
r.classList.remove("abierto"); parar(r);
scrollBy(0, btn.getBoundingClientRect().top - y0);
}
if (mio === turno) alternar(btn, true);
return;
}
if (otro) alternar(otro, false);
alternar(btn, true);
}));
ex.addEventListener("keydown", ev => {
const b = ev.target.closest(".despliegue");
if (!b || !INDICE_EXP.matches || (ev.key !== "ArrowDown" && ev.key !== "ArrowUp")) return;
const j = botones.indexOf(b) + (ev.key === "ArrowDown" ? 1 : -1);
if (j < 0 || j >= botones.length) return;
ev.preventDefault(); botones[j].focus(); mostrar(botones[j], true);
});
const asegurar = () => { if (INDICE_EXP.matches && botones.length && !botones.some(b => b.getAttribute("aria-expanded") === "true")) mostrar(botones[0], false); };
asegurar();
INDICE_EXP.addEventListener("change", asegurar);
});
const LINEAS_VER = 6;
function revisarLargo(lead) {
if (lead.classList.contains("abierto")) return;
const linea = parseFloat(getComputedStyle(lead).lineHeight) || 26;
lead.style.setProperty("--alto-plegado", `${LINEAS_VER * linea}px`);
lead.classList.remove("plegado");
const sobra = lead.scrollHeight > (LINEAS_VER + 1.2) * linea;
lead.classList.toggle("plegado", sobra);
let b = lead.nextElementSibling?.classList.contains("ver-mas") ? lead.nextElementSibling : null;
if (sobra && !b) {
b = document.createElement("button"); b.type = "button"; b.className = "enlace ver-mas"; b.textContent = "Ver más";
b.setAttribute("aria-expanded", "false");
lead.after(b);
b.addEventListener("click", () => alternarLargo(lead, b));
}
if (b) b.hidden = !sobra;
}
function alternarLargo(lead, b) {
const abrir = !lead.classList.contains("abierto"), desde = lead.getBoundingClientRect().height;
lead.classList.toggle("abierto", abrir); lead.classList.toggle("plegado", !abrir);
b.textContent = abrir ? "Ver menos" : "Ver más"; b.setAttribute("aria-expanded", String(abrir));
if (REDUCIR) return;
const hasta = lead.getBoundingClientRect().height;
lead.animate([{height: desde + "px"}, {height: hasta + "px"}], {duration: 250, easing: "cubic-bezier(.23,1,.32,1)"});
if (abrir) lead.animate([{opacity: .6}, {opacity: 1}], {duration: 250, easing: "ease-out"});
}
const LEADS = [...document.querySelectorAll(".tema:not(.herramienta) article.ficha .lead")];
const vigiaLargo = new MutationObserver(ms => new Set(ms.map(m => m.target.nodeType === 1 ? m.target.closest(".lead") : m.target.parentElement?.closest(".lead"))).forEach(l => l && revisarLargo(l)));
LEADS.forEach(l => { revisarLargo(l); vigiaLargo.observe(l, {childList: true, characterData: true, subtree: true}); });
let anchoLargo = innerWidth;
addEventListener("resize", () => { if (innerWidth === anchoLargo) return; anchoLargo = innerWidth; LEADS.forEach(revisarLargo); });
if (document.fonts) document.fonts.ready.then(() => LEADS.forEach(revisarLargo));
(() => {
const nav = document.querySelector(".tema > nav.capitulos"); if (!nav) return;
const caps = [...nav.querySelectorAll('a[href^="#g-"]')].map(a => {
const h = document.getElementById(a.getAttribute("href").slice(1)), els = h ? [h] : [];
for (let e = h?.nextElementSibling; e && !e.matches('.bloque-grupo[id^="g-"], .explicador, .pasos'); e = e.nextElementSibling) els.push(e);
return {a, h, els};
}).filter(c => c.h);
if (caps.length < 2) return;
caps.forEach(c => c.h.classList.add("solo-lector"));
let activo = null;
const mostrar = c => {
if (c === activo) return;
activo = c;
caps.forEach(x => { x.a.setAttribute("aria-current", String(x === c)); x.els.forEach(e => e.classList.toggle("cap-fuera", x !== c)); });
c.els.forEach(e => {
if (e.matches("article.ficha.visto")) e.querySelectorAll(".grafico[data-g]").forEach(gr => { if (gr.offsetParent && DIB[gr.dataset.g]) DIB[gr.dataset.g](false); });
e.querySelectorAll(".lead").forEach(l => { if (l.offsetParent) revisarLargo(l); });
});
const n = nav.getBoundingClientRect(), r = c.a.getBoundingClientRect();
if (r.left < n.left || r.right > n.right) nav.scrollLeft += r.left - n.left - (n.width - r.width) / 2;
};
const capDe = id => { const el = id && document.getElementById(id); return el ? caps.find(c => c.els.some(e => e.contains(el))) : null; };
const ancla = () => decodeURIComponent(location.hash.slice(1).split("?")[0]);
nav.addEventListener("click", ev => {
const a = ev.target.closest('a[href^="#g-"]'), c = a && caps.find(x => x.a === a); if (!c) return;
ev.preventDefault();
mostrar(c);
history.replaceState(history.state, "", location.pathname + location.search + a.getAttribute("href"));
});
addEventListener("hashchange", () => {
const id = ancla(), c = capDe(id);
if (!c || c === activo) return;
mostrar(c);
document.getElementById(id).scrollIntoView();
});
const inicial = capDe(ancla());
mostrar(inicial || caps[0]);
if (ancla() && document.getElementById(ancla())) addEventListener("load", () => document.getElementById(ancla())?.scrollIntoView(), {once: true});
})();
parte("diagnostico");
const INDP = [
{id:"f-mortalidad", g:"salud", lab:"Mortalidad infantil", veces:true, det:`muertes de menores de un año cada 1.000 nacidos vivos, promedio ${mo.tri_act}`,
d:T.mortalidad_infantil_provincias, k:"tmi_actual", pais:mo.pais_act, f:n1, ocde:OC.mortalidad_infantil.ocde},
{id:"f-adolescentes", g:"poblacion", lab:"Maternidad adolescente", veces:true, det:`% de los nacimientos de ${nac.anio_ult} con madres menores de 20 años`,
d:T.madres_adolescentes_provincias, k:ADO_ULT, pais:nac.pct_ult, f:pct},
{id:"f-poblacion-proy", g:"poblacion", lab:"Crecimiento de la población", det:`variación de la población proyectada entre ${PPY.anio} y ${PPY.anio_fin}`,
d:T.poblacion_proyectada_provincias.filter(r => r.codigo_indec !== "00"), k:"var_pct", pais:PPY.var_pct, f:conSigno},
{id:"f-escolarizacion", g:"educacion", lab:"Escolarización secundaria", det:`% de los adolescentes en edad de ir a la secundaria que van a ese nivel (tasa neta), ${es.fin}`,
d:T.escolarizacion_secundaria_provincias, k:"tasa_final", pais:es.pais_fin, f:pct},
{id:"f-aprender", g:"educacion", lab:"Aprender, matemática", det:`% de los estudiantes de 6° grado con nivel satisfactorio o avanzado, ${ap.anio}`,
d:T.aprender_provincias, k:"mat_logra", pais:ap.mat, f:pct, dist:"aprender_provincias.mat_logra"},
{id:"f-aprender", g:"educacion", lab:"Aprender, lengua", det:`% de los estudiantes de 6° grado con nivel satisfactorio o avanzado, ${ap.anio}`,
d:T.aprender_provincias, k:"len_logra", pais:ap.len, f:pct, dist:"aprender_provincias.len_logra"},
{id:"f-empleo", g:"trabajo", lab:"Empleo privado registrado", veces:true, det:`asalariados cada 100 habitantes, ${em.mes}`,
d:T.empleo_provincias, k:"cada_100", pais:em.cada_100_pais, f:n1, dist:"empleo_provincias.cada_100"},
{id:"f-empleo", g:"trabajo", lab:"Variación del empleo privado registrado", det:`% en los doce meses hasta ${em.mes}`,
d:T.empleo_provincias, k:"var_12m", pais:em.var_nac, f:sg},
{id:"f-protegida", g:"turismo", lab:"Territorio protegido", veces:true, det:`% de la superficie dentro de áreas protegidas, ${nt.anio}`,
d:T.areas_protegidas_provincias, k:"pct_territorio", pais:nt.pct, f:pct, ocde:OC.protegida.ocde},
{id:"f-esperanza", g:"salud", lab:"Esperanza de vida", det:`años al nacer, ambos sexos, ${nv.ev_anio}`,
d:T.esperanza_vida_provincias, k:"total", pais:nv.ev_pais, f:n1, ocde:OC.esperanza_vida.ocde},
{id:"f-causas-muerte", g:"salud", lab:"Mortalidad ajustada por edad", veces:true, det:`muertes por año cada 100.000 habitantes, descontado el efecto de la edad de la población, promedio ${CM.desde} a ${CM.hasta}`,
d:T.causas_muerte_provincias.filter(r => r.codigo_indec !== "00"), k:"tasa_total", pais:CM.pais, f:n0},
{id:"f-cobertura", g:"salud", lab:"Sin cobertura de salud", veces:true, det:"% de las personas sin obra social, prepaga ni plan estatal, Censo 2022",
d:T.censo2022_provincias, k:"sin_cobertura", pais:nv.censo.sin_cobertura, f:pct},
{id:"f-vacunas", g:"salud", lab:"Vacuna triple viral", det:`% de los chicos de un año vacunados con la primera dosis, ${VC.anio}`,
d:T.vacunas_provincias, k:"dosis1", pais:null, f:pct},
{id:"f-censo", g:"vivienda", lab:"Cloacas", veces:"debajo", det:"% de los hogares con desagüe a red cloacal, Censo 2022",
d:T.censo2022_provincias, k:"cloaca", pais:nv.censo.cloaca, f:pct},
{id:"f-censo", g:"vivienda", lab:"Internet en el hogar", det:"% de los hogares con internet en la vivienda, Censo 2022",
d:T.censo2022_provincias, k:"internet", pais:nv.censo.internet, f:pct},
{id:"f-exportaciones", g:"economia", lab:"Exportaciones", veces:true, det:`dólares por habitante de lo que se produjo en la provincia y se exportó, ${nv.ex_anio}`,
d:T.exportaciones_provincias, k:"usd_por_habitante", pais:nv.ex_pc_pais, f:n0},
{id:"f-fiscal", g:"gobierno", lab:"Recursos propios", det:`% de los ingresos totales de la provincia, ${R.fiscal.anio}. El país suma las cuentas de ` +
`todas las provincias y CABA${R.fiscal.pais_sin.length ? `, sin ${lista(R.fiscal.pais_sin)}` : ""}`,
d:T.fiscal_provincias, k:"autonomia", pais:R.fiscal.pais, f:pct, otroAnio: R.fiscal.atrasadas},
{id:"f-eti", g:"turismo", lab:"Turistas extranjeros", det:`turistas que visitaron la provincia cada 1.000 habitantes, entre los que salieron del país por Ezeiza o Aeroparque, ${tu.eti_anio}`,
d:T.turistas_extranjeros_provincias, k:"cada_1000", pais:null, f:n1},
{id:"f-gas-hogares", g:"energia", lab:"Hogares que cocinan con gas de red", veces:"debajo", det:"% de los hogares, Censo 2022",
d:T.vivienda_provincias, k:"pct_gas_red", pais:VV.pct_gas_red, f:pct},
{id:"f-gas-consumo", g:"energia", lab:"Consumo de gas por usuario", veces:true, det:`m³ de gas natural por usuario residencial en el año, ${e.gas_anio}`,
d:T.gas_usuario_provincias, k:"m3_usuario", pais:e.gas_pais, f:n0},
{id:"f-vivienda", g:"vivienda", lab:"Hogares que alquilan", veces:true, det:"% de los hogares, Censo 2022",
d:T.vivienda_provincias, k:"pct_alquila", pais:VV.pct_alquila, f:pct},
{id:"f-obra-publica", g:"gobierno", lab:"Obra pública de la Nación", veces:true, det:`pesos por habitante en obras con provincia asignada, ${CN.op_ult}`,
d:T.obra_publica_provincias, k:"total_hab", pais:CN.op_hab_pais, f:n0},
{id:"f-electricidad-provincias", g:"energia", lab:"Consumo eléctrico de los hogares", det:`kilovatios hora (kWh) por habitante en el año, ${e.el_ult}`, veces:true,
d:T.electricidad_provincias.filter(r => r.codigo_indec !== "02-06"), k:"kwh_hab", pais:e.el_pais, f:n0},
{id:"f-salarios", g:"trabajo", lab:"Salario privado registrado", veces:true, det:`pesos brutos por mes, promedio de los asalariados registrados del sector privado, ${SA.mes}`,
d:T.salarios_provincias.filter(r => r.codigo_indec !== "00"), k:"salario", pais:SA.pais, f:n0},
{id:"f-salario-docente", g:"educacion", lab:"Salario de un maestro de grado", veces:true, det:`pesos brutos por mes, con 10 años de antigüedad y jornada simple, ${DC.trim}`,
d:T.salario_docente.filter(r => r.codigo_indec !== "00"), k:"bruto", pais:DC.pais, f:n0},
{id:"f-inversion-educativa", g:"educacion", lab:"Inversión en educación por alumno", veces:true, det:`pesos por alumno de las escuelas de gestión estatal, ${IE.anio}`,
d:T.inversion_educativa.filter(r => r.codigo_indec !== "00"), k:"gasto_por_alumno", pais:IE.pais, f:n0},
{id:"f-homicidios", g:"seguridad", lab:"Homicidios dolosos", veces:true, det:`víctimas por año cada 100.000 habitantes, promedio ${SG.hom3_desde} a ${SG.anio}`,
d:T.homicidios_provincias.filter(r => r.codigo_indec !== "00"), k:"tasa_3", pais:SG.hom3_pais, f:n1},
{id:"f-robos", g:"seguridad", lab:"Robos registrados", veces:true, det:`hechos registrados cada 100.000 habitantes, ${SG.anio}`,
d:T.robos_provincias.filter(r => r.codigo_indec !== "00"), k:"robos", pais:SG.robos, f:n0, dist:"robos_provincias.robos"},
{id:"f-empleo-publico", g:"gobierno", lab:"Cargos en la administración provincial", veces:true, det:`cargos cada 1.000 habitantes, sin municipios ni empresas provinciales, ${GBC.anio}`,
d:T.empleo_publico_provincias, k:"cada_1000", pais:GBC.cada_1000, f:n1},
{id:"f-impuestos-provinciales", g:"gobierno", lab:"Impuestos provinciales", veces:true, det:`pesos recaudados por habitante, ${GBP.anio}`,
d:T.impuestos_provinciales.filter(r => r.por_habitante != null), k:"por_habitante", pais:GBP.pais, f:n0},
{id:"f-nacidos-otro-pais", g:"poblacion", lab:"Nacidos en otro país", veces:true, det:"% de la población en viviendas particulares, Censo 2022",
d:T.nacidos_otro_pais_provincias.filter(r => r.codigo_indec !== "00"), k:"pct_otro_pais", pais:MGC.pct, f:n1},
{id:"f-migracion-interna", g:"poblacion", lab:"Nacidos en otra provincia", veces:true, det:"% de la población en viviendas particulares, Censo 2022",
d:T.nacidos_otro_pais_provincias.filter(r => r.codigo_indec !== "00"), k:"pct_otra_provincia", pais:MGC.otra_pct, f:n1},
{id:"f-supermercados", g:"economia", lab:"Ventas en supermercados", det:`variación descontada la inflación, en los doce meses hasta ${ESU.mes}`,
d:T.supermercados_provincias, k:"var_12m", pais:ESU.prov.pais, f:conSigno},
{id:"f-combustibles", g:"economia", lab:"Precio de la nafta súper", det:`pesos por litro en el surtidor, mediana de las estaciones, ${CB.mes}`,
d:T.combustibles_provincias, k:"nafta", pais:CB.nafta, f:n0},
{id:"f-empleo-construccion", g:"trabajo", lab:"Empleo registrado en la construcción", veces:true, det:`asalariados privados cada 1.000 habitantes, ${CN.emp_trim}`,
d:T.empleo_construccion_provincias, k:"construccion_cada_1000", pais:CN.emp_cada_1000, f:n1, dist:"empleo_construccion_provincias.construccion_cada_1000"},
{id:"f-pobreza-aglomerados", g:"social", lab:"Pobreza", veces:true, det:`% de las personas bajo la línea de pobreza en los aglomerados urbanos de la provincia, ${PZA.semestre}`,
d:T.pobreza_provincias, k:"pobreza", pais:PZA.pais, f:pct},
...(PIN ? [{id:"f-pensiones-invalidez", g:"social", lab:"Pensiones por invalidez", veces:true, det:`pensiones no contributivas por invalidez cada 1.000 habitantes, ${MESES[PIN.prov_mes - 1]} de ${PIN.prov_anio}`,
d:T.pensiones_invalidez_provincias.filter(r => r.codigo_indec !== "00"), k:"cada_1000", pais:PIN.pais_cada_1000, f:n1}] : []),
...(AU ? [{id:"f-auh", g:"social", lab:"Asignación Universal por Hijo", veces:true, det:`hijos con AUH cada 100 menores de 18 años, ${MESES[AU.mes - 1]} de ${AU.anio}`,
d:T.auh_provincias.filter(r => r.codigo_indec !== "00"), k:"cada_100_menores", pais:AU.pais_100, f:n1}] : []),
...(DS ? [{id:"f-desempleo", g:"social", lab:"Seguro de desempleo", veces:true, det:`beneficiarios cada 1.000 habitantes, ${MESES[DS.prov_mes - 1]} de ${DS.prov_anio}`,
d:T.prestacion_desempleo_provincias.filter(r => r.codigo_indec !== "00"), k:"cada_1000_habitantes", pais:DS.pais_1000, f:n1}] : []),
];
const PERFIL_PROV = {tiras() {}, pintar() {}};
parte("provincia");
const PREG = [
["¿Cuánto cambiaron los pozos de Vaca Muerta?",
`En ${PG.dv_ini}, un pozo tenía en promedio ${n0(PG.dv_rama_ini)} metros de rama horizontal y ${n1(PG.dv_etapas_ini)} etapas de fractura. En ${PG.fr_ult}, ${n0(PG.dv_rama_ult)} metros y ${n1(PG.dv_etapas_ult)} etapas.`, "#f-fracturas"],
["¿Dónde se siembra más soja?",
`En la campaña ${SJ.campania} se sembraron ${n1(SJ.millones_ha)} millones de hectáreas de soja. ${SJ.top[0]}, ${SJ.top[1]} ${yE(SJ.top[2])} reunieron el ${pct(SJ.top3_pct)}.`, "#f-soja"],
["¿Dónde hubo más casos de dengue?",
`De la temporada ${DG.prov_desde} a la ${DG.temp}, ${DG.top} tuvo ${fDg(DG.top_v)} casos confirmados cada 100.000 habitantes, la tasa más alta. En el país, ${fDg(DG.pais_100000_juntas)}.`, "#f-dengue"],
["¿Dónde se vacuna menos a los chicos?",
`En ${VC.anio}, ${VC.low} vacunó con la primera dosis de la triple viral al ${pct(VC.low_v)} de los chicos de un año, la cobertura más baja. ${VC.bajo95_1} de las 24 jurisdicciones quedaron debajo del 95%.`, "#f-vacunas"],
["¿Cuánto petróleo produce la Argentina?",
`${n0(PG.kbd)} mil barriles por día en ${PG.mes}. El ${pct(PG.pct_shale)} salió de pozos de shale. Según la EIA, en ${PG.mundo.crudo_kbd.anio} la Argentina fue el productor número ${PG.mundo.crudo_kbd.puesto} del mundo.`, "#f-petroleo"],
["¿Cuánto petróleo sale del área de concesión que más produce?",
`En ${PG.areas_anio}, ${tituloArea(PG.areas_pet_top.nombre)}, en ${PG.areas_pet_top.territorio}, produjo ${kbdF(PG.areas_pet_top.v)} mil barriles por día, el ${pct(PG.areas_pet_top.pct)} del petróleo del país.`, "#f-areas-hidro"],
["¿Qué parte de los hogares cocina con gas de red?",
`El ${pct(VV.pct_gas_red)} en el Censo 2022. ` + (CN.gas_nea.length ? `En ${lista(CN.gas_nea)}, menos de ${Math.ceil(CN.gas_nea_max)} de cada 100.` : ""), "#f-gas-hogares"],
["¿Cuánto prestan los bancos para comprar una vivienda?",
`${n0(CN.hip_ult)} mil millones de pesos en créditos hipotecarios UVA en ${CN.hip_mes}. En todo ${CN.hip_anio}, ${n0(CN.hip_anual)} mil millones, contra ${n0(CN.hip_anual_min)} en ${CN.hip_anual_min_anio}, en pesos de ${CN.hip_mes}.`, "#f-hipotecas"],
["¿Cuánta electricidad consumen los hogares?",
`En ${e.el_ult}, los hogares del país consumieron ${n0(e.el_pais)} kilovatios hora por habitante. En ${e.el_top[0]}, ${n0(e.el_top[1])}, y en ${e.el_bajo[0]}, ${n0(e.el_bajo[1])}.`, "#f-electricidad-provincias"],
["¿Cuánto gana en promedio un asalariado registrado del sector privado?",
`En ${SA.mes}, ${n0(SA.pais)} pesos brutos por mes en el sector privado del país. En ${SA.top[0]}, ${n0(SA.top[1])}, y en ${SA.bajo[0]}, ${n0(SA.bajo[1])}.`, "#f-salarios"],
["¿Cuánto cobra un maestro de grado?",
`En ${DC.trim}, ${n0(DC.pais)} pesos brutos por mes en promedio, con 10 años de antigüedad y jornada simple. Según la provincia, va de ${n0(DC.bajo[1])} en ${DC.bajo[0]} a ${n0(DC.top[1])} en ${DC.top[0]}.`, "#f-salario-docente"],
["¿Qué exporta la Argentina?",
`${n0(SX.rubros.total)} millones de dólares en bienes en ${SX.rubros.anio}: el ${pct(SX.rubros.pct.moa)} manufacturas de origen agropecuario, el ${pct(SX.rubros.pct.moi)} de origen industrial, el ${pct(SX.rubros.pct.primarios)} productos primarios y el ${pct(SX.rubros.pct.combustibles)} combustibles y energía.`, "#f-exporta-rubros"],
["¿Adónde exporta la Argentina?",
`En el ${SX.destinos.periodo}, ${lista(SX.destinos.top.slice(0, 3).map(t => `${t.n} (${pct(t.pct)})`))} fueron los primeros destinos.`, "#f-destinos"],
["¿Cuánto vende y cuánto compra la Argentina?",
`En ${SX.balanza.anio}, ${n0(SX.balanza.expo)} millones de dólares de exportaciones de bienes y ${n0(SX.balanza.impo)} millones de importaciones: un saldo de ${saldoTx(SX.balanza.saldo)}.`, "#f-balanza"],
["¿Qué importa la Argentina?",
`${n0(SX.importaciones.total)} millones de dólares en bienes en ${SX.importaciones.anio}: el ${pct(SX.importaciones.pct.intermedios)} bienes intermedios, el ${pct(SX.importaciones.pct.capital + SX.importaciones.pct.piezas)} bienes de capital con sus piezas y el ${pct(SX.importaciones.pct.consumo + SX.importaciones.pct.vehiculos)} bienes de consumo y autos.`, "#f-importaciones"],
["¿De dónde vienen las importaciones?",
`De ${SX.origen.periodo}, ${lista(SX.origen.top.slice(0, 3).map(t => `${t.n} (${pct(t.pct)})`))} fueron los primeros orígenes.`, "#f-origen"],
["¿Cuál fue el saldo de la cuenta corriente del balance de pagos?",
`En ${SX.cuenta_corriente.anio} ${SX.cuenta_corriente.total < 0 ? `salieron ${n0(-SX.cuenta_corriente.total)} millones de dólares más de los que entraron` : `entraron ${n0(SX.cuenta_corriente.total)} millones de dólares más de los que salieron`}: ` +
`los bienes dejaron ${saldoTx(SX.cuenta_corriente.bienes)}, los servicios ${saldoTx(SX.cuenta_corriente.servicios)} y el ingreso primario (intereses, utilidades y dividendos) ${saldoTx(SX.cuenta_corriente.primario)}.`, "#f-cuenta-corriente"],
["¿Cuántas reservas tiene el Banco Central?",
`${n0(SX.reservas.valor)} millones de dólares el ${fLarga(SX.reservas.fecha)}. Un año antes, ${n0(SX.reservas.hace_un_anio)} millones.`, "#f-reservas-bcra"],
["¿Cuánto paga un plazo fijo?",
`${pct(BCR_PF.v)} nominal anual en promedio a 30 días el ${fLarga(BCR_PF.f)}, según el Banco Central. La ficha muestra también el dólar, las demás tasas, el dinero y los préstamos.`, "#f-bcra"],
["¿De qué se muere la gente en la Argentina?",
`De ${CM.desde} a ${CM.hasta}, el ${pct(CMG[0].pct)} de las muertes fue por ${CM_FRASE[CMG[0].k]}. Ajustada por edad, la mortalidad más alta es la de ${CM.max} y la más baja, la de ${CM.min}.`, "#f-causas-muerte"],
["¿Cuánto va a crecer la población?",
`${conSigno(PPY.var_pct)} entre ${PPY.anio} y ${PPY.anio_fin} en todo el país, de ${n1(PPY.hoy / 1e6)} a ${n1(PPY.fin / 1e6)} millones de personas, según las proyecciones del INDEC. La que más crece es ${PPY.max} (${conSigno(PPY.max_v)}) y la que menos, ${PPY.min} (${conSigno(PPY.min_v)}).`, "#f-poblacion-proy"],
["¿Cuántos homicidios hay por año?",
`En ${SG.anio}, ${n0(SG.hom_victimas)} víctimas de homicidios dolosos, ${n1(SG.hom_tasa)} cada 100.000 habitantes. En ${SG.hom_max_anio}, el año más alto desde ${SG.anio_ini}, ${n1(SG.hom_max)}.`, "#f-homicidios"],
["¿Cuánto debe el Estado nacional?",
`${n0(GBD.usd_millones)} millones de dólares al ${GBD.fecha}, el ${pct(GBD.pct)} del PBI, según la Secretaría de Finanzas.`, "#f-deuda"],
["¿En qué gasta la Nación?",
`En ${GBN.anio}, el ${pct(GBN.gasto_tipos[0][1])} del gasto primario fue en ${inicialMin(GBN.gasto_tipos[0][0])} y el ${pct(GBN.gasto_tipos[1][1])} en ${inicialMin(GBN.gasto_tipos[1][0])}.`, "#f-cuentas-nacion"],
["¿Cuántas personas nacidas en otro país viven en la Argentina?",
`${n0(MGC.personas)} en el Censo 2022, el ${pct(MGC.pct)} de la población. El país de nacimiento más frecuente, ${MGC.paises[0][0]}: ${pct(MGC.paises[0][2])}.`, "#f-nacidos-otro-pais"],
["¿Cuántos argentinos viven en otro país?",
`${n0(MGO.personas)} personas nacidas en la Argentina a mediados de ${MGO.anio}, según las Naciones Unidas. El ${pct(MGO.top[0][2])}, en ${MGO.top[0][0]}.`, "#f-argentinos-exterior"],
["¿Cuánto subieron los precios en el último año?",
`${pct(EIP.interanual)} en los doce meses hasta ${EIP.mes}, según el INDEC, y ${pct(EIP.mensual)} en el mes. La región con la suba más alta, ${REG_ART[EIP.reg_max[0]]}, con ${pct(EIP.reg_max[1])}.`, "#f-inflacion"],
["¿Cuántas personas piden refugio en la Argentina por año?",
`En ${MGR.anio}, ${n0(MGR.solicitudes)} solicitudes, según la Comisión Nacional para los Refugiados. Ese año, la Comisión reconoció como refugiadas a ` +
`${n0(MGR.reconocidas)} personas.`, "#f-refugio"],
["¿Venden más o menos los supermercados que hace un año?",
`${ESU.interanual < 0 ? "Menos" : "Más"}: en ${ESU.mes}, descontada la inflación, las ventas fueron ${pct(Math.abs(ESU.interanual))} ` +
`${ESU.interanual < 0 ? "menores" : "mayores"} que en ${ESU.mes_ant}, según el INDEC.`, "#f-supermercados"],
["¿Cuánto necesita un hogar para no ser pobre?",
`${n0(ECB.cbt_hogar)} pesos por mes en ${ECB.mes} para un hogar de cuatro integrantes del Gran Buenos Aires, según la canasta básica total del INDEC.`, "#f-canastas"],
["¿Produce más o menos la industria que hace un año?",
`${IND.ia < 0 ? "Menos" : "Más"}: en ${IND.mes}, la producción de la industria ${cambioPct(IND.ia)} frente a ${IND.mes_ant}, según el índice de producción industrial del INDEC.`, "#f-industria"],
["¿Con qué país tiene la Argentina el mayor déficit comercial?",
`Entre los ${SX.socios.n} países con los que más comercia, con ${SX.socios.def[0]}: entre ${SX.socios.desde} y ${SX.socios.hasta}, la Argentina le compró ${n0(Math.abs(SX.socios.def[1]))} millones de dólares más de lo que le vendió, según el INDEC.`, "#f-socios"],
["¿Cuánto cuesta criar a un chico?",
`${n0(ECR6.tot)} pesos por mes en ${ECR.mes} para un chico de 6 a 12 años, según la canasta de crianza del INDEC: bienes, servicios y tiempo de cuidado.`, "#f-crianza"],
["¿Le ganan los salarios registrados a la inflación?",
`En los doce meses hasta ${ESR.mes}, descontada la inflación, el salario registrado del sector privado ${cambioPct(ESR.real_priv)} y el del sector público ${cambioPct(ESR.real_pub)}.`, "#f-salario-real"],
["¿Cuánta pobreza hay en cada región?",
`En el ${PZA.semestre}, la pobreza iba del ${pct(PZA.reg_min[1])} en ${REG_ART[PZA.reg_min[0]]} al ${pct(PZA.reg_max[1])} en ${REG_ART[PZA.reg_max[0]]}, según la EPH del INDEC.`, "#f-pobreza-aglomerados"],
["¿De qué tamaño son las empresas?",
`En ${EM.anio}, el ${pct(EM.tam_micro)} de las empresas privadas de industria, comercio y servicios eran microempresas y el ${pct(EM.tam_grandes)}, grandes, según el OEDE.`, "#f-empresas-tamano"],
["¿Cuánta gente busca trabajo y no consigue?",
`En el ${DSO.ultimo}, el ${pct(DSO.pais_ultimo)} de las personas que trabajaban o buscaban trabajo en los 31 aglomerados urbanos estaba desocupada, según la EPH del INDEC.`, "#f-desocupacion"],
["¿Cuánto recibe cada provincia por coparticipación?",
`En ${CPA.anio}, las provincias y CABA recibieron ${n2(CPA.pais_hab / 1e6)} millones de pesos por habitante por la coparticipación federal y otros impuestos nacionales. ` +
`Fue el ${pct(CPA.pct_pais)} de sus ingresos.`, "#f-coparticipacion"],
["¿Dónde se crean más empresas?",
`En ${SOC.anio} se constituyeron ${n0(SOC.total)} sociedades comerciales en el país, ${n1(SOC.pais)} cada 100.000 habitantes, según el Registro ` +
`Nacional de Sociedades. El ${pct(SOC.pct_sas)} fueron SAS.`, "#f-sociedades"],
["¿Dónde hay más escuelas primarias por chico?",
`En ${ESP.fecha}, en ${ESP.top[0]}, con ${n1(ESP.top[1])} escuelas primarias cada 1.000 chicos de 5 a 14 años, según el padrón oficial de ` +
`escuelas. En todo el país, ${n1(ESP.pais)}, y la cifra más baja fue la de ${ESP.bajo[0]}, ${n1(ESP.bajo[1])}. Cuenta escuelas, no alumnos.`,
"#f-escuelas-primarias"],
["¿A cuántos kilómetros de un hospital público quedan las escuelas rurales?",
`La mitad de las ${n0(DHO.rurales)} escuelas rurales del país queda a más de ${n1(DHO.pais)} km en línea recta del hospital público con ` +
`internación más cercano, y a más de ${n1(DHO.pais_ti)} km del más cercano con terapia intensiva. En ${DHO.top_ti[0]}, a más de ` +
`${n1(DHO.top_ti[1])} km de la terapia intensiva.`, "#f-distancia-hospital"],
["¿Dónde hay más hospitales públicos por habitante?",
`En ${HSP.fecha}, en ${HSP.top[0]}, con ${n1(HSP.top[1])} hospitales públicos con internación cada 100.000 habitantes, según el Registro Federal de ` +
`Establecimientos de Salud. En todo el país, ${n1(HSP.pais)}, y la cifra más baja fue la de ${HSP.bajo[0]}, ${n1(HSP.bajo[1])}. Cuenta establecimientos, no camas.`,
"#f-hospitales"],
["¿Dónde hay más médicos por habitante?",
`A fines de ${MDC.anio}, en ${MDC.top[0]}, con ${n1(MDC.top[1])} médicos activos cada 10.000 habitantes, según el OFETHuS. En todo el país, ` +
`${n1(MDC.pais)}, y la cifra más baja fue la de ${MDC.bajo[0]}, ${n1(MDC.bajo[1])}.`, "#f-medicos"],
["¿Cuánto monte natural perdió cada provincia?",
`De ${MBS.ini} a ${MBS.fin}, la vegetación natural pasó del ${pct(MBS.nat_ini)} al ${pct(MBS.nat)} de la superficie del país, según MapBiomas. La ` +
`que más perdió fue ${MBS.top[0][0]}.`, "#f-cobertura-suelo"],
["¿Cuántos accesos de telefonía fija hay cada 100 hogares?",
`En el ${TF.trim}, ${n1(TF.pais)} en todo el país, según el ENACOM. En el ${TF.ini_trim}, ${n1(TF.pais_ini)}.`, "#f-telefonia"],
["¿Dónde dejan más la secundaria?",
`De los alumnos de la secundaria de ${ABN.anio}, el ${pct(ABN.pais)} no se volvió a matricular en ${ABN.sig}, según la Secretaría de Educación. ` +
`El abandono más alto fue el de ${ABN.top[0]}, el ${pct(ABN.top[1])}.`, "#f-abandono"],
["¿Qué provincias deben más por habitante?",
`Al ${DPR.fecha_txt}, ${DPR.top[0]}, con ${pesosDeuda(DPR.top[1])} por habitante, según la Subsecretaría de Coordinación Fiscal Provincial. Las provincias ` +
`y CABA debían ${pesosDeuda(DPR.pais_hab)} por habitante, el ${pct(DPR.pct_bonos)} en bonos.`, "#f-deuda-provincias"],
["¿Qué parte de las personas presas no tiene condena?",
`Al 31 de diciembre de ${SG.sn_anio}, el ${pct(SG.sn_sin)} de las personas en cárceles no tenía condena. En ${SG.sn_ini}, el ${pct(SG.sn_sin_ini)}.`, "#f-sin-condena"],
["¿Cuántas personas están presas?",
`Al 31 de diciembre de ${SG.sn_anio}, ${n0(SG.sn_personas)} personas en cárceles, ${n0(SG.sn_tasa)} cada 100.000 habitantes. En ${SG.sn_ini}, ${n0(SG.sn_personas_ini)}.`, "#f-carceles"],
["¿Qué parte de la electricidad usan las industrias y los grandes comercios?",
`En ${e.el_ult}, el ${pct(e.els_pct.ind)} de la demanda eléctrica del país fue de industrias y grandes comercios. En ${e.els_pct_ind_top[0]}, el ${pct(e.els_pct_ind_top[1])}, ` +
`y en ${e.els_pct_ind_bajo[0]}, el ${pct(e.els_pct_ind_bajo[1])}.`, "#f-electricidad-sectores"],
["¿Cuánto cuesta un litro de nafta?",
`En ${CB.mes}, la mitad de las estaciones del país vendía la nafta súper a más de ${n0(CB.nafta)} pesos por litro. La mediana fue de ${n0(CB.nafta_alto[1])} en ${CB.nafta_alto[0]} y de ${n0(CB.nafta_bajo[1])} en ${CB.nafta_bajo[0]}.`, "#f-combustibles"],
["¿Cuánto se destina a subsidiar la energía?",
`Según la Secretaría de Hacienda, en ${e.sub_pbi_anio} los subsidios económicos a la energía fueron el ${n2(e.sub_pbi)}% del producto interno bruto. En ${e.sub_pbi_max_anio}, el ${n2(e.sub_pbi_max)}%.`, "#f-subsidios"],
["¿Cuánto gas consume por año un usuario residencial?",
`${n0(e.gas_pais)} metros cúbicos en promedio en ${e.gas_anio}. En ${e.gas_top[0][0]}, ${n0(e.gas_top[0][1])}, ${veces(e.gas_top[0][1], e.gas_pais)} veces el promedio del país.`, "#f-gas-consumo"],
["¿Cuántos hogares alquilan su vivienda?",
`El ${pct(VV.pct_alquila)} en el Censo 2022: del ${pct(CN.viv_top.pct_alquila[1])} en ${CN.viv_top.pct_alquila[0]} al ${pct(CN.viv_low.pct_alquila[1])} en ${CN.viv_low.pct_alquila[0]}.`, "#f-vivienda"],
["¿Cuánto varía la mortalidad infantil entre provincias?",
`En el promedio de ${mo.tri_act} murieron ${n1(mo.top_v)} de cada 1.000 nacidos vivos en ${mo.top} y ${n1(mo.low_v)} en ${mo.low}: ${veces(mo.top_v, mo.low_v)} veces más.`, "#f-mortalidad"],
["¿Cuántos años de esperanza de vida separan a las provincias?",
`En ${nv.ev_anio}, ${n1(nv.ev_top_v - nv.ev_low_v)} años: ${n1(nv.ev_top_v)} en ${nv.ev_top} y ${n1(nv.ev_low_v)} en ${nv.ev_low}. El promedio de la OCDE fue ${n1(OC.esperanza_vida.ocde)} en ${OC.esperanza_vida.anio}.`, "#f-esperanza"],
["¿Qué parte de los hogares tiene cloacas?",
`El ${pct(nv.censo.cloaca)} en el Censo 2022. Va del ${pct(nv.censo_top.cloaca[1])} en ${nv.censo_top.cloaca[0]} al ${pct(nv.censo_low.cloaca[1])} en ${nv.censo_low.cloaca[0]}.`, "#f-censo"],
["¿Dónde está la Argentina frente a la OCDE en mortalidad infantil?",
`En ${mo.anio}, ${n1(mo.tasa)} muertes de menores de un año cada 1.000 nacidos vivos según la DEIS. En el promedio simple de los países de la OCDE fueron ${n1(OC.mortalidad_infantil.ocde)} en ${OC.mortalidad_infantil.anio}, según la estimación ${deOrganismo(OC.mortalidad_infantil.origen)}, que para la Argentina da ${n1(OC.mortalidad_infantil.arg)}.`, "#f-mortalidad"],
["¿Cuánto cambia lo que se aprende en matemática según la provincia?",
`En ${ap.top}, el ${pct(ap.top_v)} de los chicos de 6° grado alcanzó un nivel satisfactorio o avanzado en Aprender ${ap.anio}. En ${ap.low}, el ${pct(ap.low_v)}.`, "#f-aprender"],
["¿Cuánto bajaron los nacimientos?",
`En ${nac.anio_ult} se registraron ${n0(nac.n_ult)} nacimientos, ${pct(Math.abs(nac.caida))} menos que en ${nac.anio_pico}.`, "#f-nacimientos"],
["¿Cuánto empleo privado registrado hay en cada provincia?",
`${n1(em.top_v)} asalariados registrados del sector privado cada 100 habitantes en ${em.top}${aclara("empleo_provincias.cada_100", em.top)} y ${n1(em.low_v)} en ${em.low}. El país tiene ${n1(em.cada_100_pais)}.`, "#f-empleo"],
["¿A qué distancia está la Argentina del promedio de la OCDE en PISA?",
`A unos ${pz.dif_mat} puntos en matemática en ${pz.anio}: ${pz.mat} contra ${pz.ocde_mat}.`, "#f-pisa"],
["¿Cuántos adolescentes están en la secundaria?",
`El ${pct(es.pais_fin)} en ${es.fin}, ${n1(es.pais_fin - es.pais_ini)} puntos más que en ${es.ini}. En ${es.low}, la más baja, el ${pct(es.low_v)}.`, "#f-escolarizacion"],
["¿Volvió el transporte público al nivel previo a la pandemia?",
`En ${su.mes} se usaron ${n2(su.total_millones)} millones de tarjetas SUBE por día hábil. En los primeros días de marzo de 2020 eran ${n2(su.pre_millones)} millones.`, "#f-sube"],
["¿Qué parte de la electricidad consumen los hogares?",
`El ${pct(e.pct_res_ult)} de la demanda del país en ${e.anio_ult}. En ${e.anio_ini} era el ${pct(e.pct_res_ini)}.`, "#f-hogares"],
["¿En qué mes se usa más electricidad?",
`En ${e.mes_max}: ${pct(e.dif_max_min)} más que en ${e.mes_min}, el mes de menor demanda (promedio de ${e.meses_desde} a ${e.meses_hasta}).`, "#f-meses"],
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
`${vpq.top}, con ${n0(vpq.top_v)} visitas en ${vpq.ult}. Le sigue ${vpq.dos}, con ${n0(vpq.dos_v)}.`, "#f-visitas-parque"],
["¿Qué es lo que más se pesca en el mar argentino?",
`${pe.top[0]}: ${n0(pe.top_t[0])} toneladas en ${pe.anio}, el ${pct(pe.top_pct)} de todo lo desembarcado.`, "#f-pesca"],
["¿Se patentan más autos o más motos?",
`En ${au.anio} se inscribieron ${n0(au.motos)} motos nuevas${au.moto_excluidos.length ? ` (sin contar las de ${lista(au.moto_excluidos)})` : ""} y ${n0(au.autos)} autos.`, "#f-patentes"],
["¿Volvieron los pasajeros al tren y al subte?",
`En ${su.mes}, por día hábil, se usaron ${pct(Math.abs(su.tren_vs_pre))} ${su.tren_vs_pre < 0 ? "menos" : "más"} tarjetas SUBE en el tren y ${pct(Math.abs(su.subte_vs_pre))} ${su.subte_vs_pre < 0 ? "menos" : "más"} en el subte que en marzo de 2020.`, "#f-sube-modos"],
[`¿Cuántos bebés se llamaron Lionel en ${cu.lionel_anio}?`,
`${n0(cu.lionel_max)}, ${veces(cu.lionel_max, cu.lionel_prev)} veces los del año anterior (${n0(cu.lionel_prev)}).`, "#f-nombres"],
["¿Cuánta carne vacuna come un argentino por año?",
`${n1(cu.carne_v)} kilos en ${cu.carne_anio}. En ${cu.carne_ini} eran ${n1(cu.carne_ini_v)}.`, "#f-carne"],
["¿Cuántos kilos de pollo vale un kilo de asado?",
`${n1(cu.asado)} kilos en ${cu.asado_hasta}, en el Gran Buenos Aires. En ${cu.asado_ini_anio} eran ${n1(cu.asado_ini)}.`, "#f-carne"],
[`¿Cuánto vino menos se vende que en ${cu.vino_ini}?`,
`${pct(Math.abs(cu.vino_caida))} menos: ${n0(cu.vino_v)} millones de litros en ${cu.vino_anio} contra ${n0(cu.vino_ini_v)} millones.`, "#f-vino"],
["¿Cuántas bases tiene la Argentina en la Antártida?",
`${ANT.arg}: ${ANT.arg_anual} funcionan todo el año y ${ANT.arg_verano}, solo en verano. La más antigua es Orcadas, de ${ANT.bases_ini}.`, "#f-ant-bases"],
["¿Cuántos países forman parte del Tratado Antártico?",
`${ANT.partes}. ${ANT.consultivas} son partes consultivas, las que deciden en sus reuniones.`, "#f-ant-tratado"],
["¿Cuántas personas visitan la Antártida?",
`${n0(ANT.tu)} en la temporada ${ANT.tu_fin}, con empresas de IAATO.`, "#f-ant-turismo"],
["¿Cuál es la montaña más alta del país?",
`${nt.cu_top}, en ${nt.cu_top_prov}, con ${n0(nt.cu_top_v)} metros según el IGN. Le sigue ${nt.cu_2}, en ${nt.cu_2_prov}, con ${n0(nt.cu_2_v)}.`, "#f-cumbres"],
["¿Qué provincia tiene más glaciares?",
`${cu.gl_top}, con ${n0(cu.gl_top_v)}. Le sigue ${cu.gl_2}, con ${n0(cu.gl_2_v)}.`, "#f-glaciares"],
[`¿Cuál fue el año más cálido desde ${cu.cl_ini}?`,
`${cu.cl_max_anio}, con una temperatura media ${n2(cu.cl_max)} °C por encima del valor de referencia.`, "#f-clima"],
["¿Cómo cambió la maternidad adolescente?",
`En ${nac.anio_ini}, ${n1(nac.pct_ini)} de cada 100 nacimientos eran de madres menores de 20 años. En ${nac.anio_ult}, ${n1(nac.pct_ult)}.`, "#f-adolescentes"],
["¿Quién estuvo más años en el Congreso desde 1983?",
`${AC.top[0].nombre}: ${n1(AC.top[0].total)} años` + (AC.top[0].dip > 0 && AC.top[0].sen > 0 ? " entre Diputados y el Senado" : AC.top[0].sen > 0 ? " en el Senado" : " en Diputados") +
`${AC.top[0].sigue ? ", y sigue en el cargo" : ""}. Le siguen ${AC.top[1].nombre} (${n1(AC.top[1].total)}) y ${AC.top[2].nombre} (${n1(AC.top[2].total)}).`, "#f-anios-congreso"],
["¿Cuántos fallos firma la Corte Suprema por año?",
`${n0(R.justicia.corte.fallos)} en ${R.justicia.corte.hasta}, que cerraron ${n0(R.justicia.corte.resueltos)} casos. Ese año llegaron ${n0(R.justicia.corte.ingresados)} casos nuevos.`, "#f-corte-casos"],
["¿Cuántos jueces federales no tienen titular?",
`El ${pct(R.justicia.federal.pct_sin_titular)} de los ${n0(R.justicia.federal.cargos)} cargos de juez federal, en ${R.justicia.federal.fecha}.`, "#f-jueces-federales"],
["¿Cuántas fiscalías federales hay?",
`${n0(R.justicia.mp.fiscalias)} fiscalías y ${n0(R.justicia.mp.defensorias)} defensorías públicas oficiales de la Justicia Federal en ${R.justicia.mp.fecha}.`, "#f-fiscalias-federales"],
["¿Cuántos jueces tienen las justicias provinciales?",
`${n0(R.justicia.prov.magistratura)} al 31 de octubre de ${R.justicia.prov.anio}, contando la justicia de paz: ${n1(R.justicia.prov.pais.magistratura)} cada 100.000 habitantes.`, "#f-justicia-provincial"],
];
const MENUS = [];
const menuBarra = (btn, panel) => {
if (!btn || !panel) return;
const raiz = document.documentElement;
let t;
const abierto = () => btn.getAttribute("aria-expanded") === "true";
const primero = () => [...panel.querySelectorAll("a, summary")].find(a => a.offsetParent);
const ubicar = () => {
const b = btn.getBoundingClientRect(), caja = btn.closest(".envoltura"), c = caja.getBoundingClientRect(), m = parseFloat(getComputedStyle(caja).paddingLeft);
const izq = c.left + m, der = c.right - m;
if (panel.classList.contains("panel-temas")) { panel.style.width = `${der - izq}px`; panel.style.setProperty("--menu-izq", Math.round(izq) + "px"); return; }
panel.style.setProperty("--menu-izq", Math.round(Math.max(12, Math.min(b.left - 12, der - (panel.offsetWidth || 0)))) + "px");
};
const abrir = () => {
MENUS.forEach(m => m !== yo && m.abierto() && m.cerrar(false));
clearTimeout(t); panel.hidden = false; ubicar(); btn.setAttribute("aria-expanded", "true"); raiz.classList.add("menu-abierto");
requestAnimationFrame(() => panel.classList.add("abierto")); primero().focus({preventScroll: true});
};
const cerrar = (volver) => {
panel.classList.remove("abierto"); btn.setAttribute("aria-expanded", "false"); raiz.classList.remove("menu-abierto");
t = setTimeout(() => panel.hidden = true, 160); if (volver) btn.focus({preventScroll: true});
};
btn.addEventListener("click", () => abierto() ? cerrar(true) : abrir());
panel.addEventListener("click", ev => { if (ev.target.closest("a")) cerrar(false); });
document.addEventListener("keydown", ev => { if (ev.key === "Escape" && abierto()) cerrar(true); });
document.addEventListener("pointerdown", ev => { if (abierto() && !panel.contains(ev.target) && !btn.contains(ev.target)) cerrar(false); });
btn.addEventListener("keydown", ev => { if (ev.key === "Tab" && !ev.shiftKey && abierto()) { ev.preventDefault(); primero().focus({preventScroll: true}); } });
panel.addEventListener("keydown", ev => { if (ev.key === "Tab" && ev.shiftKey && document.activeElement === primero()) { ev.preventDefault(); btn.focus({preventScroll: true}); } });
panel.addEventListener("focusout", ev => { const a = ev.relatedTarget; if (abierto() && a && !panel.contains(a) && a !== btn) cerrar(false); });
addEventListener("resize", () => { if (abierto()) ubicar(); });
const yo = {abierto, cerrar};
MENUS.push(yo);
};
menuBarra(document.getElementById("menu-btn"), document.getElementById("menu-panel"));
document.querySelectorAll(".grupo-btn").forEach(b => menuBarra(b, document.getElementById(b.getAttribute("aria-controls"))));
const SEC = Object.fromEntries(SITIO.secciones.map(([id, t, p, x, herr, f, a, c]) => [id, {id, t, p, x, herr, f, a, c}]));
const nombreSec = id => SEC[id]?.t || "";
parte("articulos");
const artFiltros = document.querySelector("#art-grid .art-filtros");
if (artFiltros) {
const lista = document.getElementById("art-grid"), cuenta = lista.querySelector(".art-cuenta");
artFiltros.hidden = false;
artFiltros.addEventListener("click", ev => {
const b = ev.target.closest("button[data-grupo]"); if (!b) return;
artFiltros.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
lista.querySelectorAll(".art-card").forEach(c => { c.hidden = !!b.dataset.grupo && c.dataset.grupo !== b.dataset.grupo; });
lista.querySelectorAll(".art-bloque").forEach(s => { s.hidden = !s.querySelector(".art-card:not([hidden])"); });
const n = lista.querySelectorAll(".art-card:not([hidden])").length;
cuenta.textContent = `${n} ${n === 1 ? "artículo" : "artículos"}${b.dataset.grupo ? ` de ${b.textContent}` : ""}.`;
});
}
document.querySelectorAll("article.ficha").forEach(f => { const pie = f.querySelector(".pie"), p = pie?.querySelector(":scope > .pie-arts"); if (p) pie.append(p); });
const FECHA_DD = {
"f-ant-bases": () => `Según COMNAP, en ${ANT.comnap_fecha}`,
"f-ant-paises": () => `Según COMNAP, en ${ANT.comnap_fecha}`,
"f-ant-tratado": () => `El último país se sumó en ${ANT.tr_ult_anio}`,
"f-parques": () => `Con las áreas creadas hasta ${nt.pn_ultima_anio}`,
};
document.querySelectorAll(".destacado[data-clave], .dd-dato[data-clave]").forEach(a => {
const id = a.dataset.clave, c = CLAVE[id];
if (!c) { if (a.classList.contains("dd-dato")) a.hidden = true; return; }
const [, num, resto] = String(c[0]).match(/^((?:N\.º )?[+\u2212-]?[\d.,]+%?(?: mil millones| millones| mil)?)\s*(.*)$/) || [, c[0], ""];
const fecha = a.classList.contains("dd-dato") && FECHA_DD[id];
a.querySelector(".c-num").innerHTML = num; a.querySelector(".c-txt").innerHTML = (resto ? resto + " " : "") + c[1] + (fecha ? `. ${fecha()}` : "");
});
const RANGO_DEST = {
"f-esperanza": [() => T.esperanza_vida_provincias, "total", v => n1(v), " años", "Por provincia"],
"f-salarios": [() => T.salarios_provincias, "salario", v => n2(v / 1e6), " millones de pesos", "Por provincia"],
"f-homicidios": [() => T.homicidios_provincias, "tasa_3", n1, "", `Por provincia, en promedio de ${SG.hom3_desde} a ${SG.anio}`],
"f-combustibles": [() => T.combustibles_provincias, "nafta", n0, " pesos", "Por provincia"],
};
const APOYO_DEST = {
"f-desocupacion": () => `En el ${DSO.ultimo}, ${pct(DSO.pais_ultimo)}` + (DSO.pais_anio_antes != null ? `, contra ${pct(DSO.pais_anio_antes)} un año antes.` : "."),
"f-jueces-federales": () => `En ${R.justicia.federal.fecha_ant} era ${pct(R.justicia.federal.pct_sin_titular_ant)}.`,
"f-nacimientos": () => `Son ${pct(Math.abs(nac.caida))} ${nac.caida < 0 ? "menos" : "más"} que en ${nac.anio_pico}, cuando hubo ${n0(nac.pico)}.`,
"f-inflacion": () => `El rubro que más subió fue ${inicialMin(EIP.div_max[0])}: ${pct(EIP.div_max[1])}.`,
"f-pobreza": () => `Un año antes, ${pct(R.pobreza.pob_prev)}. El máximo fue ${pct(R.pobreza.max)}, en el ${R.pobreza.max_sem}.`,
"f-sin-condena": () => `En ${SG.sn_ini} era ${pct(SG.sn_sin_ini)}.`,
"f-ant-bases": () => `Según COMNAP, en ${ANT.comnap_fecha}${ANT.anual_top === "Argentina" ? ", ningún otro país tenía tantas abiertas todo el año" : ""}.`,
};
function pintarRangos() {
document.querySelectorAll(".destacado[data-clave] .c-rango").forEach(el => {
const id = el.closest(".destacado").dataset.clave, r = RANGO_DEST[id];
if (APOYO_DEST[id]) { el.textContent = APOYO_DEST[id](); return; }
if (id === "f-petroleo") {
const fp = NOMBRES[prov] && T.hidrocarburos_provincias.find(x => x.codigo_indec === prov);
el.textContent = `El ${pct(PG.top_pct)} salió de ${PG.top} entre ${PG.v_desde} y ${PG.v_hasta}.` + (!NOMBRES[prov] || fp?.territorio === PG.top ? "" :
fp && fp.pct_pet_pais > 0 ? ` ${NOMBRES[prov]}: ${pct(fp.pct_pet_pais)}.` : ` ${NOMBRES[prov]} no produce petróleo.`);
return;
}
if (!r) return;
const [tabla, k, f, u, ini] = r, filas = tabla().filter(x => x.codigo_indec !== "00" && x[k] != null).sort((a, b) => a[k] - b[k]);
const lo = filas[0], hi = filas[filas.length - 1], fp = filas.find(x => x.codigo_indec === prov);
el.textContent = `${ini}, de ${f(lo[k])}${u} en ${lo.territorio} a ${f(hi[k])} en ${hi.territorio}.` +
(fp && fp !== lo && fp !== hi ? ` ${fp.territorio}: ${f(fp[k])}.` : "");
});
}
if (document.querySelector(".destacado .c-rango")) { pintarRangos(); alCambiarProv.push(pintarRangos); }
(() => {
const caja = document.getElementById("dest-carrusel"); if (!caja) return;
const pista = document.getElementById("destacados"), datos = [...pista.querySelectorAll(".destacado")], puntos = document.getElementById("dest-puntos");
const estado = document.getElementById("dest-estado"), cuenta = document.getElementById("dest-cuenta");
let actual = 0, moviendo = false, reubicando = 0;
const porVez = () => { const paso = datos[1].offsetLeft - datos[0].offsetLeft; return paso > 0 ? Math.max(1, Math.round(pista.clientWidth / paso)) : 1; };
const tandas = () => Math.ceil(datos.length / porVez());
const posicion = i => Math.min(datos[i].offsetLeft - datos[0].offsetLeft, pista.scrollWidth - pista.clientWidth);
const rotulo = i => porVez() === 1 ? `Dato ${i + 1} de ${datos.length}` : `Datos ${i + 1} a ${Math.min(i + porVez(), datos.length)} de ${datos.length}`;
const marcar = (i, avisar) => {
const n = porVez(); actual = i;
[...puntos.children].forEach((b, t) => b.setAttribute("aria-current", String(t === Math.floor(i / n))));
datos.forEach((d, k) => { const ve = k >= i && k < i + n; d.tabIndex = ve ? 0 : -1; if (ve) d.removeAttribute("aria-hidden"); else d.setAttribute("aria-hidden", "true"); });
if (document.activeElement?.closest?.(".destacado")?.getAttribute("aria-hidden")) datos[i].focus({preventScroll: true});
cuenta.textContent = `${i + 1} de ${datos.length}`;
if (avisar) estado.textContent = `${rotulo(i)}: ${datos.slice(i, i + n).map(d => d.querySelector(".c-preg").textContent).join(" ")}`;
};
const ir = n => {
const i = n < 0 ? (tandas() - 1) * porVez() : n >= datos.length ? 0 : n, x = posicion(i), x0 = pista.scrollLeft;
marcar(i, true);
if (REDUCIR || document.hidden || x === x0) { pista.scrollLeft = x; return; }
moviendo = true; pista.style.scrollSnapType = "none";
const t0 = performance.now(), paso = t => {
const p = Math.min(1, Math.max(0, (t - t0) / 280));
pista.scrollLeft = x0 + (x - x0) * (1 - (1 - p) ** 3);
if (p < 1) requestAnimationFrame(paso); else { pista.style.scrollSnapType = ""; moviendo = false; }
};
requestAnimationFrame(paso);
};
const armarPuntos = () => {
puntos.innerHTML = Array.from({length: tandas()}, (_, t) => `<button type="button" class="dest-punto" aria-label="${rotulo(t * porVez())}"></button>`).join("");
[...puntos.children].forEach((b, t) => b.addEventListener("click", () => ir(t * porVez())));
};
caja.querySelector(".dest-ant").addEventListener("click", () => ir(actual - porVez()));
caja.querySelector(".dest-sig").addEventListener("click", () => ir(actual + porVez()));
caja.addEventListener("keydown", ev => { if (ev.key === "ArrowRight" || ev.key === "ArrowLeft") { ev.preventDefault(); ir(actual + (ev.key === "ArrowRight" ? porVez() : -porVez())); } });
pista.addEventListener("scroll", () => {
if (moviendo || reubicando) return;
const n = porVez(), paso = datos[1].offsetLeft - datos[0].offsetLeft;
const i = pista.scrollLeft >= pista.scrollWidth - pista.clientWidth - 2 ? (tandas() - 1) * n : Math.round(pista.scrollLeft / paso / n) * n;
if (i !== actual && datos[i]) marcar(i, true);
}, {passive: true});
let anchoPista = pista.clientWidth, vez = porVez();
const reubicar = () => {
pista.scrollLeft = posicion(actual); reubicando++;
requestAnimationFrame(() => requestAnimationFrame(() => { reubicando--; }));
};
new ResizeObserver(() => {
if (moviendo || pista.clientWidth === anchoPista) return;
anchoPista = pista.clientWidth;
const n = porVez();
if (n !== vez) { vez = n; armarPuntos(); marcar(Math.floor(actual / n) * n, false); }
reubicar();
}).observe(pista);
armarPuntos();
marcar(0, false);
})();
const NFICHAS = SITIO.fichas.filter(f => !f[5]).length;
const nosCifras = document.getElementById("nos-cifras");
if (nosCifras) {
const temas = SITIO.secciones.filter(s => !s[4] && s[0] !== "articulos" && s[0] !== "datos-destacados").length;
nosCifras.innerHTML = [[NFICHAS, "fichas con su tabla"], [24, "jurisdicciones"],
[temas, "secciones temáticas"], [SITIO.articulos.length, "artículos"]].map(([n, t]) => `<div class="nos-cifra"><b>${n}</b><span>${t}</span></div>`).join("");
}
function calcInflacion(el) {
const filas = T.inflacion_mensual, REGS = [["pais", "Todo el país"], ["gba", "Gran Buenos Aires"], ["pampeana", "Pampeana"], ["noreste", "Noreste"],
["noroeste", "Noroeste"], ["cuyo", "Cuyo"], ["patagonia", "Patagonia"]];
const idx = {pais: filas.map(r => r.indice)};
REGS.slice(1).forEach(([k]) => { let v = 100; idx[k] = filas.map((r, i) => i === 0 ? 100 : (v *= 1 + (r[`mensual_${k}`] || 0) / 100)); });
const mesTx = p => `${MESES[+p.slice(5, 7) - 1]} de ${p.slice(0, 4)}`, ult = filas.length - 1;
el.removeAttribute("aria-busy"); el.resaltar = null;
el.innerHTML = `<div class="calc calc-inflacion"><label class="selector-ficha"><span>Monto en pesos</span><input type="number" min="0" step="1000" ` +
`inputmode="numeric" class="ci-monto" value="100000"></label><label class="selector-ficha"><span>Del mes</span><select class="ci-mes">` +
filas.slice(0, ult).map((r, i) => `<option value="${i}">${mesTx(r.periodo)}</option>`).reverse().join("") + `</select></label>` +
`<label class="selector-ficha"><span>En</span><select class="ci-reg">${REGS.map(([k, n]) => `<option value="${k}">${n}</option>`).join("")}</select></label>` +
`<p class="calc-res" aria-live="polite"></p></div>`;
const m = el.querySelector(".ci-monto"), mes = el.querySelector(".ci-mes"), reg = el.querySelector(".ci-reg"), res = el.querySelector(".calc-res");
mes.value = String(Math.max(0, ult - 60));
reg.value = (REG_IPC[prov] || ["pais"])[0];
const calcular = () => {
const k = reg.value, i = +mes.value, v = +m.value, x = idx[k][ult] / idx[k][i], n = REGS.find(r => r[0] === k)[1];
const donde = k === "pais" ? "en todo el país" : `en ${REG_ART[n] || n}`;
res.innerHTML = !(v > 0) ? "Escribí un monto en pesos." : `${n0(v)} pesos de ${mesTx(filas[i].periodo)} ${donde} equivalen a <b>${n0(v * x)} pesos de ` +
`${mesTx(filas[ult].periodo)}</b>: ${x >= 2 ? `los precios se multiplicaron por ${n1(x)}` : `los precios subieron ${pct((x - 1) * 100)}`} en ese tiempo, ` +
`según el índice de precios al consumidor del INDEC.`;
};
el.querySelector(".calc").addEventListener("input", calcular);
el.querySelector(".calc").addEventListener("change", calcular);
calcular();
}
function ipcDetalle(a) {
const el = G("inflacion-rubros"), r = MED["ipc-reg"], ED = EIP.detalle, n = $("ipd-sel").selectedOptions[0].textContent, gen = ED.general[r];
const data = T.inflacion_detalle.filter(d => d["interanual_" + r] != null).map(d => ({codigo_indec: "d" + d.codigo, territorio: d.rubro, corto: d.rubro, ia: d["interanual_" + r], m: d["mensual_" + r],
desc: d.descripcion_indec}));
const ord = [...data].sort((x, y) => y.ia - x.ia), max = ord[0], min = ord[ord.length - 1];
$t("inflacion-rubros").textContent = `En ${REG_ART[n] || n}, en los doce meses hasta ${ED.mes}, el aumento más grande fue el de ${inicialMin(max.territorio)}, ` +
`${pct(max.ia)}, según el INDEC. ` + (min.ia < 0 ? `En cambio, ${inicialMin(min.territorio)} costaba ${pct(-min.ia)} menos que un año antes. ` :
`El más chico, el de ${inicialMin(min.territorio)}, ${pct(min.ia)}. `) + `El nivel general de la región, ${pct(gen)}. El INDEC publica este detalle ` +
`por región y no para el país entero.`;
refrescarTabla("f-inflacion-rubros");
barrasH(el, {anim: a, data, k: "ia", vf: pct, af: v => n0(v) + "%", ref: gen, refLab: `Nivel general ${pct(gen)}`, paisLab: "Nivel general",
l: 190, lAngosto: 150, corto: d => d.corto,
tip: d => `<b>${d.territorio}</b><br>${d.desc}<br>${pct(d.ia)} en los doce meses hasta ${ED.mes}<br>${pct(d.m)} en el mes`});
}
function calcInflacionPersonal(el) {
const filas = T.inflacion_personal, REGS = [["gba", "Gran Buenos Aires"], ["pampeana", "Pampeana"], ["noreste", "Noreste"], ["noroeste", "Noroeste"],
["cuyo", "Cuyo"], ["patagonia", "Patagonia"]];
el.removeAttribute("aria-busy"); el.resaltar = null;
el.innerHTML = `<div class="calc calc-inflacion"><label class="selector-ficha"><span>Región</span><select class="cp-reg">` +
REGS.map(([k, n]) => `<option value="${k}">${n}</option>`).join("") + `</select></label><fieldset class="calc-personas"><legend>Cuánto de tu gasto va a ` +
`cada rubro, en %</legend><div class="cp-rubros"></div><button type="button" class="boton chico cp-volver">Volver a los pesos del INDEC</button></fieldset>` +
`<p class="calc-res" aria-live="polite"></p></div>`;
const reg = el.querySelector(".cp-reg"), caja = el.querySelector(".cp-rubros"), res = el.querySelector(".calc-res");
reg.value = (REG_IPC[prov] || ["gba"])[0];
const deReg = () => filas.filter(r => r.region === reg.value);
const llenar = () => {
caja.innerHTML = deReg().map(r => `<label class="selector-ficha"><span>${r.rubro}</span><input type="number" min="0" max="100" step="0.1" ` +
`inputmode="decimal" data-d="${r.division}" value="${n1(r.peso_efectivo).replace(",", ".")}"></label>`).join("");
};
const calcular = () => {
const var12 = Object.fromEntries(deReg().map(r => [r.division, r.variacion_12m])), n = REGS.find(x => x[0] === reg.value)[1];
const pesos = [...caja.querySelectorAll("input")].map(i => [i.dataset.d, Math.max(0, +i.value || 0)]), tot = pesos.reduce((s, [, w]) => s + w, 0);
const ofi = deReg().reduce((s, r) => s + r.peso_efectivo * r.variacion_12m, 0) / 100;
if (!(tot > 0)) { res.textContent = "Escribí un porcentaje en al menos un rubro."; return; }
const tu = pesos.reduce((s, [d, w]) => s + w * var12[d], 0) / tot;
res.innerHTML = `Con esos pesos, tus precios subieron <b>${pct(tu)}</b> en los doce meses hasta ${EIP.mes} en ${REG_ART[n] || n}. Con los del INDEC, ` +
`${pct(ofi)}.` + (Math.abs(tot - 100) > 0.5 ? ` Tus porcentajes suman ${n1(tot)} y se reparten en proporción.` : "");
};
reg.addEventListener("change", () => { llenar(); calcular(); });
el.querySelector(".cp-volver").addEventListener("click", () => { llenar(); calcular(); caja.querySelector("input").focus(); });
caja.addEventListener("input", calcular);
llenar(); calcular();
}
const citaEj = document.getElementById("cita-ejemplo");
if (citaEj) {
const hoy = new Date();
citaEj.textContent = `Datina (${hoy.getFullYear()}). ¿Dónde se gana más en un empleo privado registrado? Con datos del Observatorio de Empleo y ` +
`Dinámica Empresarial (OEDE), Secretaría de Trabajo, Ministerio de Capital Humano. ${location.origin}/trabajo#f-salarios. Consultado el ${hoy.getDate()} de ` +
`${MESES[hoy.getMonth()]} de ${hoy.getFullYear()}.`;
}
const calDatos = document.getElementById("cal-datos");
if (calDatos) {
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"], hoy = new Date();
const hoyS = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
const titulo = Object.fromEntries(SITIO.fichas.map(f => [f[0], f[2]])), prox = (T.calendario_indec || []).filter(c => c.fecha >= hoyS);
calDatos.innerHTML = prox.length ? prox.map(c => {
const [a, m, d] = c.fecha.split("-").map(Number), p = paginaDe(c.ficha);
return `<li><span class="cal-fecha">${DIAS[new Date(a, m - 1, d).getDay()]} ${d} de ${MESES[m - 1]}${a !== hoy.getFullYear() ? ` de ${a}` : ""}</span>` +
`<span class="cal-inf">${esc(c.informe)}</span>` + (p && titulo[c.ficha] ? `<a href="${urlPagina(p, "#" + c.ficha)}">${esc(titulo[c.ficha])}</a>` : "") + "</li>";
}).join("") : `<li class="cal-vacio">La lista de Datina llega hasta el ${fechaLarga(R.calendario_indec ? R.calendario_indec.hasta : hoyS)}. ` +
"Las fechas siguientes están en el calendario de difusión del INDEC.</li>";
if (prox.length > 10) {
const resto = [...calDatos.children].slice(10), vm = document.createElement("button");
resto.forEach(li => li.hidden = true);
vm.type = "button"; vm.className = "enlace ver-mas"; vm.textContent = `Ver las ${prox.length} fechas`;
vm.addEventListener("click", () => { resto.forEach(li => li.hidden = false); vm.hidden = true; resto[0].querySelector("a")?.focus(); });
calDatos.after(vm);
}
}
const brevesLista = document.getElementById("breves-lista");
if (brevesLista) {
const BREVES = [
{id: "f-nacimientos", t: "nacimientos", dib: (el, a) => lineas(el, {anim: a, h: 220, data: T.nacimientos, x: "anio", y0: 40, ref: 100, refLab: `${T.nacimientos[0].anio} = 100`,
yf: v => v, vf: n0, series: [{k: "idx_argentina", lab: "Argentina", c: NAR, w: 3}, {k: "idx_ocde", lab: "OCDE", c: css("--ocde"), w: 2.6}]})},
{id: "f-receptivo", t: "receptivo", dib: (el, a) => lineas(el, {anim: a, h: 220, data: T.turistas_no_residentes_anual, x: "anio", y0: 0, vf: v => n2(v / 1e6) + " M", yf: M,
series: [{k: "turistas", lab: "Turistas", c: NAR, w: 3}]})},
{id: "f-patentes", t: "patentes", dib: (el, a) => lineas(el, {anim: a, h: 220, data: T.patentamientos_anual, x: "anio", y0: 0, vf: v => n0(v / 1e3) + " mil",
yf: v => n0(v / 1e3) + " mil", series: [{k: "autos", lab: "Autos", c: NAR, w: 3}, {k: "motos", lab: "Motos", c: FRI, w: 2.4}]})},
{id: "f-carne", t: "carne", dib: (el, a) => lineas(el, {anim: a, h: 220, data: T.carne_vacuna, x: "anio", y0: 0, vf: v => n1(v) + " kg", yf: v => v + " kg",
series: [{k: "kg_por_habitante", lab: "Carne vacuna", c: NAR, w: 3}]})},
{id: "f-migracion-historia", t: "migracion-historia", dib: (el, a) => lineas(el, {anim: a, h: 220, data: T.migracion_censos, x: "anio", y0: 0, vf: pct,
yf: v => n0(v) + "%", series: [{k: "nacidos_otro_pais_pct", lab: "Nacidos en otro país", corto: "Otro país", c: NAR},
{k: "limitrofes_pct", lab: "Nacidos en países limítrofes", corto: "Limítrofes", c: FRI}]})},
{id: "f-visitas", t: "visitas", dib: (el, a) => lineas(el, {anim: a, h: 220, data: T.visitas_parques_nacionales, x: "anio", y0: 0, vf: v => n2(v / 1e6) + " M", yf: M,
series: [{k: "total", lab: "Total", c: css("--ink"), w: 2.6}, {k: "residentes", lab: "Residentes", c: NAR, w: 2.4}, {k: "no_residentes", lab: "No residentes", c: FRI, w: 2.4}]})},
];
const FI = Object.fromEntries(SITIO.fichas.map(f => [f[0], f]));
const vale = b => FI[b.id] && paginaDe(b.id) && typeof TX[b.t] === "string";
const lista = BREVES.filter(vale);
brevesLista.innerHTML = lista.map(b => {
const f = FI[b.id], c = CLAVE[b.id], dir = urlPagina(paginaDe(b.id), "#" + b.id);
return `<div class="breve"><h3><a href="${dir}">${esc(f[2])}</a></h3>` + (f[7] ? `<p class="breve-sub">${esc(f[7])}</p>` : "") +
(c ? `<p class="clave"><span class="num">${c[0]}</span><span class="txt">${c[2] || c[1]}</span></p>` : "") +
`<div class="breve-graf" data-b="${b.id}" aria-busy="true"></div><p class="breve-texto">${TX[b.t]}</p>` +
`<a class="enlace" href="${dir}">Ver la ficha completa</a></div>`;
}).join("");
const dibujarBreve = el => { const b = lista.find(x => x.id === el.dataset.b); try { b.dib(el, !REDUCIR); } catch (e) { sinDatos(el, "No se pudo dibujar el gráfico."); } };
const grafs = [...brevesLista.querySelectorAll(".breve-graf")];
if ("IntersectionObserver" in window) {
const obs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { obs.unobserve(e.target); dibujarBreve(e.target); } }), {rootMargin: "200px"});
grafs.forEach(el => obs.observe(el));
} else grafs.forEach(dibujarBreve);
}
const juegoLista = document.getElementById("juego-lista");
if (juegoLista) {
const puntos = x => `${n1(x)} ${Math.abs(x) === 1 ? "punto" : "puntos"}`;
const JUEGO = [
{id: "f-censo", q: "¿Qué parte de los hogares tiene desagüe a red cloacal?", v: nv.censo.cloaca, min: 0, max: 100, paso: 1, f: pct, d: puntos,
dato: v => `${pct(v)} de los hogares, en el Censo 2022`},
{id: "f-esperanza", q: "¿Cuántos años se espera que viva, en promedio, una persona que nace en la Argentina?", v: nv.ev_pais, min: 60, max: 90, paso: 0.5,
f: x => `${n1(x)} años`, d: x => `${n1(x)} años`, dato: v => `${n1(v)} años, con las tablas de mortalidad de ${nv.ev_anio}`},
{id: "f-carne", q: "¿Cuántos kilos de carne vacuna se comen por habitante en un año?", v: cu.carne_v, min: 0, max: 120, paso: 1,
f: x => `${n1(x)} kg`, d: x => `${n1(x)} kg`, dato: v => `${n1(v)} kg por habitante en ${cu.carne_anio}`},
{id: "f-desocupacion", q: "¿Qué parte de quienes trabajan o buscan trabajo está desocupada?", v: DSO.pais, min: 0, max: 30, paso: 0.5, f: pct, d: puntos,
dato: v => `${pct(v)}, en promedio, en ${DSO.trimestres}, en los 31 aglomerados urbanos`},
{id: "f-glaciares", q: "¿Cuántos glaciares hay inventariados en la Argentina?", v: cu.gl_total, min: 0, max: 30000, paso: 500,
f: n0, d: x => `${n0(x)} glaciares`, dato: v => `${n0(v)} glaciares, en ${cu.gl_n} provincias`},
].filter(j => j.v != null && paginaDe(j.id));
juegoLista.innerHTML = JUEGO.map((j, i) => {
const ini = j.min + Math.round((j.max - j.min) / 2 / j.paso) * j.paso;
return `<div class="juego-item"><label class="juego-q" for="jg-${i}">${i + 1}. ${j.q}</label>` +
`<div class="juego-barra"><input type="range" id="jg-${i}" min="${j.min}" max="${j.max}" step="${j.paso}" value="${ini}">` +
`<output for="jg-${i}" class="juego-tu">${j.f(ini)}</output></div>` +
`<button type="button" class="boton chico juego-ver" data-i="${i}">Ver el dato</button><p class="juego-res" aria-live="polite"></p></div>`;
}).join("");
juegoLista.querySelectorAll(".juego-item").forEach((it, i) => {
const j = JUEGO[i], barra = it.querySelector("input"), tu = it.querySelector("output"), res = it.querySelector(".juego-res");
const responder = () => {
const g = +barra.value, dif = Math.abs(g - j.v);
res.innerHTML = `El dato: <b>${j.dato(j.v)}</b>. Tu respuesta: ${j.f(g)}, ` +
(dif < j.paso / 2 ? "justo en el dato." : `${j.d(dif)} ${g > j.v ? "más" : "menos"}.`) +
` <a href="${urlPagina(paginaDe(j.id), "#" + j.id)}">Ver la ficha</a>`;
};
barra.addEventListener("input", () => { tu.textContent = j.f(+barra.value); if (res.textContent) responder(); });
it.querySelector(".juego-ver").addEventListener("click", responder);
});
}
const tendLinea = document.getElementById("tend-linea");
if (tendLinea) {
const tendEstado = document.getElementById("tend-estado");
const local = location.protocol === "file:" || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
const hora = new Intl.DateTimeFormat("es-AR", {timeZone: "America/Argentina/Buenos_Aires", hour: "2-digit", minute: "2-digit", hour12: false});
const dia = new Intl.DateTimeFormat("es-AR", {timeZone: "America/Argentina/Buenos_Aires", day: "numeric", month: "long"});
const hoy = () => dia.format(new Date());
const trafico = i => i.trafico_n ? `Más de ${n0(i.trafico_n)} búsquedas` : "";
const pintar = j => {
const it = j.items || [];
if (!it.length) { tendEstado.textContent = "Google no publicó búsquedas en este momento. Probá de nuevo en unos minutos."; tendLinea.innerHTML = ""; return; }
const max = it.reduce((a, b) => b.trafico_n > a.trafico_n ? b : a);
tendEstado.textContent = `${it.length} búsquedas en aumento. La de más tráfico: ${it.length > 1 ? max.titulo : it[0].titulo}` +
`${max.trafico_n ? `, ${trafico(max).toLowerCase()}` : ""}. ` + (j.respaldo
? `Google no respondió recién: son las búsquedas que se leyeron a las ${hora.format(new Date(j.leido))}.`
: `Actualizado a las ${hora.format(new Date(j.leido || Date.now()))}.`);
tendLinea.innerHTML = it.map(i => {
const f = new Date(i.fecha), otroDia = dia.format(f) !== hoy();
return `<li class="tend-item${i === max ? " fuerte" : ""}"><time class="tend-hora" datetime="${esc(i.fecha)}">${hora.format(f)}${otroDia ? `<br>${esc(dia.format(f))}` : ""}</time>` +
`<div class="tend-cuerpo"><p class="tend-q">${esc(i.titulo)}</p>` + (i.trafico_n ? `<p class="tend-trafico">${trafico(i)}</p>` : "") +
(i.noticias?.length ? `<ul class="tend-noticias">${i.noticias.slice(0, 2).map(n => `<li><a href="${esc(n.url)}" target="_blank" rel="noopener noreferrer">` +
`${esc(n.titulo)}</a> <span>${esc(n.fuente)}</span></li>`).join("")}</ul>` : "") + `</div></li>`;
}).join("");
};
const pedir = () => fetch("/api/tendencias").then(r => r.ok ? r.json() : Promise.reject(r.status)).then(pintar)
.catch(() => { if (!tendLinea.children.length) tendEstado.textContent = "No se pudieron cargar las búsquedas de Google. Probá de nuevo en unos minutos."; });
if (local) tendEstado.textContent = "Las búsquedas en tiempo real se ven en el sitio publicado, datina.com.ar: en esta computadora no hay conexión con Google Trends.";
else {
pedir();
setInterval(() => { if (document.visibilityState === "visible") pedir(); }, 600000);
}
}
const estado = document.getElementById("estado");
if (estado) estado.innerHTML = [`${NFICHAS} fichas`, "24 jurisdicciones", `${SITIO.articulos.length} artículos`].map(t => `<span>${t}</span>`).join(" ");
document.querySelectorAll('a[href^="#"]').forEach(a => { const u = destinoDe(a.getAttribute("href")); if (u) a.href = u; });
document.addEventListener("click", ev => {
const a = ev.target.closest?.('a[href^="#"]');
const u = a && destinoDe(a.getAttribute("href"));
if (u && !ev.ctrlKey && !ev.metaKey && !ev.shiftKey) { ev.preventDefault(); location.href = u; }
});
document.querySelector(".saltar")?.addEventListener("click", ev => {
const destino = document.querySelector("h1") || document.getElementById("contenido");
if (!destino) return;
ev.preventDefault();
if (destino.tagName === "H1") destino.setAttribute("tabindex", "-1");
destino.focus();
});
const SEC_ICONO = {"articulos": "periodico", "provincia": "pin", "trabajo": "maletin", "empresas": "tienda", "pobreza": "casa", "salud": "botiquin", "educacion": "birrete", "poblacion": "personas", "politica": "congreso", "justicia": "balanza", "movilidad": "colectivo", "construccion": "grua", "energia": "rayo", "petroleo": "ciguena", "seguridad": "escudo", "economia": "carrito", "migraciones": "globo", "gobierno": "mastil", "externo": "buque", "turismo": "valija", "naturaleza": "andes", "curiosidades": "mate", "cruces": "dispersion", "indice": "podio", "departamentos": "mosaico", "diagnostico": "portapapeles", "catalogo": "planilla", "laboratorio": "matraz", "mesas": "urna", "rutas": "buque", "migracion-interna": "valija", "datos-destacados": "mosaico", "consulta-ia": "dialogo", "a-empleo-mujeres": "maletin", "a-nombres-provincias": "mosaico", "a-vaca-muerta": "rayo", "a-migracion-interna": "pin", "a-ganador-provincias": "podio", "a-salario-real": "billetes", "a-aportantes": "personas", "a-madres-adolescentes": "mamadera", "a-peso-voto": "congreso", "a-coparticipacion": "balanza", "a-canasta-regiones": "carrito", "a-dolar-inversion": "billetes", "a-compras-dolares": "monedas", "a-turismo-dolar": "valija", "a-nafta-dolares": "ciguena", "a-exportaciones-dolar": "buque", "a-pobreza-desocupacion": "maletin", "a-alquiler-pobreza": "casa", "a-atn-presupuesto": "monedas", "a-viviendas-alquiler": "casa", "a-exportaciones-empleo": "buque", "a-cloacas-mortalidad": "gota", "a-cobertura-esperanza": "reloj", "a-internet-aprender": "laptop", "a-inversion-aprender": "birrete", "corte-suprema": "balanza"};
const pintarCifras = () => {
const sec = document.getElementById(PAGINA), intro = sec?.querySelector(".tema-intro"), orden = EN_CIFRAS[PAGINA];
if (sec && intro && orden && !sec.classList.contains("herramienta")) {
sec.querySelector(".en-cifras")?.remove();
const ids = new Set([...sec.querySelectorAll("article.ficha")].map(f => f.id)), conProv = new Set(), tarjetas = [];
const indp = INDP.filter(c => ids.has(c.id));
if (prov && NOMBRES[prov]) indp.forEach(c => {
const fila = ids.has(c.id) && c.d.find(d => d.codigo_indec === prov); if (!fila) return;
conProv.add(c.id);
const orden = [...c.d].sort((a, b) => b[c.k] - a[c.k]).findIndex(d => d.codigo_indec === prov) + 1;
tarjetas.push(`<a class="tarjeta cifra prov" href="#${c.id}" data-k="p:${INDP.indexOf(c)}"><span class="c-lab">${NOMBRES[prov]}</span><span class="c-num">${c.f(fila[c.k])}</span>` +
`<span class="c-txt">${c.lab}: ${c.det}.${c.pais == null ? "" : ` País: ${c.f(c.pais)}.`} ${puestoTxt(orden, c.d.length)}.</span>` +
(notaDist(c, prov) ? `<span class="c-aclara">${notaDist(c, prov)}</span>` : "") + `</a>`);
});
const pais = orden.map(k => k.startsWith("x-") ? EXTRA[k] && {k, id: EXTRA[k][0], n: EXTRA[k][1], t: EXTRA[k][2], prov: EXTRA[k][3]} : CLAVE[k] && {k, id: k, n: CLAVE[k][0], t: CLAVE[k][1], prov: true})
.filter(c => c && ids.has(c.id) && !(c.prov && conProv.has(c.id)));
const lugar = conProv.size ? 5 - tarjetas.length : indp.length ? 4 : 5;
const marca = conProv.size ? `<span class="c-lab">Todo el país</span>` : "";
pais.slice(0, Math.max(0, lugar)).forEach(c => tarjetas.push(`<a class="tarjeta cifra" href="#${c.id}" data-k="${c.k}">${marca}<span class="c-num">${c.n}</span><span class="c-txt">${c.t}</span></a>`));
if (!conProv.size && indp.length)
tarjetas.push(`<a class="tarjeta cifra invita" href="provincia"><span class="c-lab">Tu provincia</span><span class="c-txt">Elegí una provincia para ver sus datos de esta sección junto a los del país.</span></a>`);
(intro.nextElementSibling?.matches(".subsecciones") ? intro.nextElementSibling : intro).insertAdjacentHTML("afterend", `<div class="en-cifras"><h2>En cifras</h2><div class="cifras-grid">${tarjetas.slice(0, 5).join("")}</div></div>`);
}
};
const semCorto = r => `${r.semestre === 1 ? "1.er" : "2.º"} sem. ${r.anio}`;
const mesCorto = p => { const [y, m] = p.split("-"); return `${MESES[+m - 1].slice(0, 3)} ${y}`; };
const serieM = (tit, d, f, n = 10, hl = null) => ({tit, d: d.filter(x => x[1] != null && isFinite(x[1])).slice(-n), f, hl});
const provM = (tit, filas, k, pais, f) => ({tit, prov: filas.filter(r => r[k] != null && NOMBRES[r.codigo_indec]).map(r => ({c: r.codigo_indec, v: r[k]})), pais, f});
const TOT_DIP = (() => { const r = T.representacion_provincias || []; return r.length ? d3.sum(r, x => x.poblacion) / d3.sum(r, x => x.diputados) : null; })();
const SERIE_CIFRA = {
"f-petroleo": () => serieM("Producción de petróleo, miles de barriles por día, promedio de cada año", T.hidrocarburos_anual.map(r => [r.anio, r.pet_total]), n0),
"x-pet-shale": () => serieM("Petróleo no convencional, % de la producción de cada año", T.hidrocarburos_anual.map(r => [r.anio, r.pct_pet_nc]), pct),
"x-pet-ytd": () => SERIE_CIFRA["f-petroleo"](),
"f-gas": () => serieM("Producción de gas natural, millones de m³ por día, promedio de cada año", T.hidrocarburos_anual.map(r => [r.anio, r.gas_total]), n1),
"f-gas-hogares": () => provM("Hogares que cocinan con gas de red, en %, Censo 2022", T.vivienda_provincias, "pct_gas_red", VV.pct_gas_red, pct),
"f-gas-consumo": () => provM(`Gas natural por usuario residencial, m³ en ${e.gas_anio}`, T.gas_usuario_provincias, "m3_usuario", e.gas_pais, n0),
"f-salarios": () => provM(`Salario bruto promedio, pesos en ${SA.mes}`, T.salarios_provincias, "salario", SA.pais, n0),
"f-salario-docente": () => provM(`Salario bruto de un maestro de grado, pesos en ${DC.trim}`, T.salario_docente, "bruto", DC.pais, n0),
"f-inversion-educativa": () => provM(`Inversión por alumno de gestión estatal, pesos en ${IE.anio}`, T.inversion_educativa, "gasto_por_alumno", IE.pais, n0),
"f-homicidios": () => serieM("Víctimas de homicidios dolosos cada 100.000 habitantes", T.delitos_serie.map(r => [r.anio, r.homicidios]), n1),
"f-robos": () => serieM("Robos registrados cada 100.000 habitantes", T.delitos_serie.map(r => [r.anio, r.robos]), n0),
"x-hurtos": () => serieM("Hurtos registrados cada 100.000 habitantes", T.delitos_serie.map(r => [r.anio, r.hurtos]), n0),
"f-delitos": () => serieM("Delitos registrados cada 100.000 habitantes", T.delitos_serie.map(r => [r.anio, r.total]), n0),
"f-carceles": () => serieM("Personas privadas de libertad cada 100.000 habitantes", T.carceles_serie.map(r => [r.anio, r.tasa]), n0),
"f-cuentas-nacion": () => serieM("Resultado primario del Sector Público Nacional, % del PBI", GBN.mini, pct),
"f-deuda": () => serieM("Deuda bruta de la Administración Central, % del PBI", T.deuda_pbi.map(r => [r.periodo.includes("T") ? `${r.periodo[0]}T ${r.periodo.slice(2)}` : r.periodo, r.pct_pbi]), pct),
"f-empleo-publico": () => provM(`Cargos en la administración provincial cada 1.000 habitantes, ${GBC.anio}`, T.empleo_publico_provincias, "cada_1000", GBC.cada_1000, n1),
"f-impuestos-provinciales": () => provM(`Impuestos provinciales, pesos por habitante, ${GBP.anio}`, T.impuestos_provinciales, "por_habitante", GBP.pais, n0),
"f-nacidos-otro-pais": () => provM("Personas nacidas en otro país, % de la población, 2022", T.nacidos_otro_pais_provincias, "pct_otro_pais", MGC.pct, pct),
"f-migracion-interna": () => provM("Personas nacidas en otra provincia, % de la población, 2022", T.nacidos_otro_pais_provincias, "pct_otra_provincia", MGC.otra_pct, pct),
"f-migracion-historia": () => serieM("Personas nacidas en otro país, % de la población de cada censo", T.migracion_censos.map(r => [r.anio, r.nacidos_otro_pais_pct]),
pct, 11, MGH.max_anio),
"f-radicaciones": () => serieM("Residencias otorgadas por año", T.radicaciones_anual.map(r => [r.anio, r.total]), n0),
"f-argentinos-exterior": () => serieM("Personas nacidas en la Argentina que viven en otro país", T.argentinos_exterior.map(r => [r.anio, r.personas]), n0),
"f-inflacion": () => serieM("Inflación en doce meses, mes a mes", EIP.mini_ia.map(([p, v]) => [mesCorto(p), v]), pct),
"x-inflacion-mes": () => serieM("Inflación de cada mes", EIP.mini_m.map(([p, v]) => [mesCorto(p), v]), pct),
"f-salario-minimo": () => serieM("Salario mínimo, % de la canasta básica total de un hogar de cuatro integrantes del Gran Buenos Aires", ESM.mini.map(([p, v]) => [mesCorto(p), v]), pct),
"f-canastas": () => serieM("Canasta básica total de un hogar de cuatro integrantes del Gran Buenos Aires, pesos", ECB.mini.map(([p, v]) => [mesCorto(p), v]), n0),
"f-salario-real": () => serieM("Salario registrado privado descontada la inflación, cambio en doce meses", ESR.mini.map(([p, v]) => [mesCorto(p), v]), pct),
"f-emae": () => serieM("Actividad económica, cambio frente al mismo mes del año anterior", EMA.mini.map(([p, v]) => [mesCorto(p), v]), pct),
"f-supermercados": () => serieM("Ventas en supermercados, cambio frente al mismo mes del año anterior", ESU.mini.map(([p, v]) => [mesCorto(p), v]), pct),
"f-electricidad-provincias": () => provM(`Electricidad de los hogares, kWh por habitante en ${e.el_ult}`, T.electricidad_provincias, "kwh_hab", e.el_pais, n0),
"f-subsidios": () => serieM("Subsidios económicos a la energía, % del PBI de cada año", T.subsidios_energia.map(r => [r.anio, r.pct_pbi]), v => n2(v) + "%"),
"f-hidro-provincias": () => provM("Petróleo, miles de barriles por día, doce meses más recientes", T.hidrocarburos_provincias, "pet_kbd", null, n0),
"x-vaca-muerta": () => SERIE_CIFRA["f-hidro-provincias"](),
"f-reservas": () => serieM("Reservas comprobadas de petróleo, años de producción", T.reservas_hidrocarburos.map(r => [r.anio, r.horizonte_pet]), n1),
"f-regalias": () => provM("Regalías, % de los ingresos totales de cada provincia", T.regalias_provincias, "pct_regalias", null, pct),
"f-balanza-energetica": () => serieM("Saldo del comercio exterior de energía, millones de dólares por año", T.balanza_energetica.map(r => [r.anio, r.saldo]), n0),
"f-empleo-hidro": () => provM("Puestos asalariados registrados en petróleo y gas", T.empleo_construccion_provincias.filter(r => r.petroleo_gas > 0), "petroleo_gas", null, n0),
"f-isac": () => serieM("Actividad de la construcción, promedio de cada año, índice 2004 = 100", T.isac_anual.map(r => [r.anio, r.isac]), n1),
"x-construccion-ytd": () => SERIE_CIFRA["f-isac"](),
"f-empleo-construccion": () => provM("Asalariados registrados en la construcción cada 1.000 habitantes", T.empleo_construccion_provincias, "construccion_cada_1000", CN.emp_cada_1000, n1),
"x-ocupados-construccion": () => provM("Personas ocupadas en la construcción, % de las ocupadas, Censo 2022", T.vivienda_provincias, "pct_ocupados_construccion", VV.pct_ocupados_construccion, pct),
"f-costo": () => serieM("Costo de la construcción dividido por los precios al consumidor, diciembre de cada año y el último mes", T.costo_anual.map(r => [r.periodo.endsWith("-12") ? r.periodo.slice(0, 4) : MESES[+r.periodo.slice(5, 7) - 1].slice(0, 3) + " " + r.periodo.slice(2, 4), r.icc_real]), n1),
"f-vivienda": () => provM("Hogares que alquilan, en %, Censo 2022", T.vivienda_provincias, "pct_alquila", VV.pct_alquila, pct),
"x-viviendas-construccion": () => provM("Viviendas en construcción cada 1.000 viviendas, Censo 2022", T.vivienda_provincias, "construccion_cada_1000", VV.construccion_cada_1000, n1),
"f-empleo": () => provM("Asalariados privados registrados cada 100 habitantes", T.empleo_provincias, "cada_100", R.empleo.cada_100_pais, n1),
"f-exportaciones": () => provM("Dólares exportados por habitante", T.exportaciones_provincias, "usd_por_habitante", nv.ex_pc_pais, n0),
"f-fiscal": () => provM("Recursos propios, en % de los ingresos de cada provincia", T.fiscal_provincias, "autonomia", null, pct),
"f-empresas": () => provM("Empresas privadas con empleados cada 1.000 habitantes", T.empresas_provincias, "cada_1000_hab", EM.pais_1000, n1),
"x-emp-top": () => SERIE_CIFRA["f-empresas"](),
"f-dinamica-empresas": () => serieM("Cambio neto de empresas por año: tasa de entrada menos tasa de salida", T.empresas_serie_pais.map(r => [r.anio, r.tasa_neta]), sg),
"x-emp-saldo": () => SERIE_CIFRA["f-dinamica-empresas"](),
"x-emp-negativos": () => SERIE_CIFRA["f-dinamica-empresas"](),
"f-pobreza-ninez": () => serieM("Pobreza de las personas de 0 a 17 años en los 31 aglomerados urbanos, por semestre", T.pobreza_ninez.map(r => [semCorto(r), r.pobreza_0_17]), pct, 8),
"f-pobreza": () => serieM("Pobreza en los 31 aglomerados urbanos, por semestre", T.pobreza_serie.map(r => [semCorto(r), r.pobreza_personas]), pct, 8),
"x-indigencia": () => serieM("Indigencia en los 31 aglomerados urbanos, por semestre", T.pobreza_serie.map(r => [semCorto(r), r.indigencia_personas]), pct, 8),
"f-censo": () => provM("Hogares con desagüe a red cloacal, en %, Censo 2022", T.censo2022_provincias, "cloaca", nv.censo.cloaca, pct),
"f-internet": () => provM("Accesos a internet fijo cada 100 hogares", T.internet_fijo_provincias, "accesos_100_hogares", null, n1),
"f-esperanza": () => provM(`Esperanza de vida al nacer, en años, ${nv.ev_anio}`, T.esperanza_vida_provincias, "total", nv.ev_pais, n1),
"f-transito": () => provM(`Muertes en siniestros viales por año cada 100.000 habitantes, ${TRN.desde} a ${TRN.hasta}`, T.transito_provincias, "cada_100000", TRN.pais, n1),
"f-causas-muerte": () => provM(`Muertes por año cada 100.000 habitantes, ajustadas por edad, ${CM.desde} a ${CM.hasta}`, T.causas_muerte_provincias, "tasa_total", CM.pais, n0),
"x-ev-brecha": () => provM(`Años más de esperanza de vida de las mujeres que de los varones, ${nv.ev_anio}`,
T.esperanza_vida_provincias.map(r => ({...r, brecha: r.mujeres - r.varones})), "brecha", nv.ev_m - nv.ev_v, n1),
"f-mortalidad": () => provM(`Mortalidad infantil cada 1.000 nacidos vivos, promedio de ${mo.tri_act}`, T.mortalidad_infantil_provincias, "tmi_actual", mo.pais_act, n1),
"f-aprender": () => provM(`Matemática en 6° grado: % en nivel satisfactorio o avanzado, Aprender ${ap.anio}`, T.aprender_provincias, "mat_logra", ap.mat, pct),
"x-aprender-len": () => provM(`Lengua en 6° grado: % en nivel satisfactorio o avanzado, Aprender ${ap.anio}`, T.aprender_provincias, "len_logra", ap.len, pct),
"x-aprender-debajo": () => provM(`Matemática en 6° grado: % por debajo del nivel básico, Aprender ${ap.anio}`, T.aprender_provincias, "mat_debajo", ap.mat_debajo, pct),
"f-escolarizacion": () => provM(`Escolarización secundaria, en %, ${es.fin}`, T.escolarizacion_secundaria_provincias, "tasa_final", es.pais_fin, pct),
"f-pisa": () => serieM("Argentina en matemática en PISA, por edición (sin 2015, que no es comparable)", T.pisa_argentina_ocde.map(r => [r.anio, r.arg_mat_grafico]), n0),
"x-nacimientos": () => serieM("Nacimientos por año", T.nacimientos.map(r => [r.anio, r.nacimientos]), n0),
"f-adolescentes": () => serieM("Nacimientos de madres menores de 20 años, cada 100, por año", T.nacimientos.map(r => [r.anio, r.pct_madres_menores_20]), n1),
"f-exporta-rubros": () => serieM("Exportaciones de bienes por año, en miles de millones de dólares", T.exportaciones_rubros_anual.map(r => [r.anio, r.total / 1000]), n1, 12),
"f-balanza": () => serieM("Saldo del comercio de bienes por año, en millones de dólares", T.balanza_comercial.map(r => [r.anio, r.saldo]), n0, 12),
"f-importaciones": () => serieM("Importaciones de bienes por año, en miles de millones de dólares", T.balanza_comercial.map(r => [r.anio, r.importaciones / 1000]), n1, 12),
"f-cuenta-corriente": () => serieM("Saldo de la cuenta corriente por año, en millones de dólares", T.cuenta_corriente.map(r => [r.anio, r.cuenta_corriente]), n0, 12),
"f-reservas-bcra": () => T.reservas_bcra && serieM("Reservas del Banco Central, en miles de millones de dólares, diciembre de cada año y el último mes",
T.reservas_bcra.filter((r, i, t) => r.mes.endsWith("-12") || i === t.length - 1).map(r => [r.mes.endsWith("-12") ? r.mes.slice(0, 4) : mesCorto(r.mes), r.millones_usd / 1000]), n1, 12),
"f-exporta-provincias": () => provM(`Exportaciones por provincia de origen, en millones de dólares, ${SX.provincias.anio}`, T.exportaciones_provincias, "millones_usd", null, n0),
"f-poblacion-proy": () => provM(`Variación de la población proyectada entre ${PPY.anio} y ${PPY.anio_fin}, en %`, T.poblacion_proyectada_provincias, "var_pct", PPY.var_pct, conSigno),
"x-vejez": () => serieM("Personas de 65 años o más cada 100 de 15 a 64, proyección del INDEC",
T.envejecimiento_pais.filter(r => (r.anio - T.envejecimiento_pais[0].anio) % 2 === 0 || r.anio === EV.anio).map(r => [r.anio, r.vejez]), n1, 12, EV.anio),
"x-jubilaciones": () => serieM("Aportantes por cada jubilación o pensión de ANSES, por año", T.jubilaciones_aportantes.map(r => [r.anio, r.aportantes_por_beneficio]), n2),
"f-extranjeros": () => provM("Personas nacidas en otro país con DNI argentino, cada 100 habitantes", T.extranjeros_provincias, "cada_100", nv.xt_pais, n1),
"x-representacion": () => provM("Habitantes por banca de diputado", T.representacion_provincias, "hab_por_diputado", TOT_DIP, n0),
"x-atn": () => serieM(`Aportes del Tesoro Nacional por año, en miles de millones de pesos de ${TRR.ult}`, T.transferencias_serie.map(r => [r.anio, r.atn]), n0),
"f-sube": () => serieM("Tarjetas SUBE por día hábil, en millones, por mes", T.sube_dia_habil.map(r => [mesCorto(r.periodo), r.total == null ? null : r.total / 1e6]), n2),
"x-sube-var": () => SERIE_CIFRA["f-sube"](),
"x-sube-trenes": () => serieM("Tarjetas SUBE en trenes por día hábil, en miles, por mes", T.sube_dia_habil.map(r => [mesCorto(r.periodo), r.tren == null ? null : r.tren / 1e3]), n0),
"f-patentes": () => serieM("Motos nuevas inscriptas por año", T.patentamientos_anual.map(r => [r.anio, r.motos]), n0),
"f-patentes-prov": () => provM("Autos nuevos cada 1.000 habitantes", T.patentamientos_provincias, "autos_1000", au.pais_1000, n1),
"f-combustibles": () => provM(`Nafta súper, pesos por litro, mediana de las estaciones, ${CB.mes}`, T.combustibles_provincias, "nafta", CB.nafta, n0),
"f-hogares": () => serieM(`Demanda eléctrica total, índice ${T.energia_hogares[0].anio} = 100`, T.energia_hogares.map(r => [r.anio, r.idx_demanda]), n0),
"x-hogares-crec": () => serieM(`Demanda eléctrica de los hogares, índice ${T.energia_hogares[0].anio} = 100`, T.energia_hogares.map(r => [r.anio, r.idx_residencial]), n0),
"x-demanda-total": () => serieM("Demanda eléctrica total por año, en gigavatios hora", T.energia_hogares.map(r => [r.anio, r.total]), n0),
"x-demanda-ytd": () => SERIE_CIFRA["x-demanda-total"](),
"f-meses": () => serieM("Demanda eléctrica por mes, en gigavatios hora", T.energia_estacionalidad.map(r => [MESES[r.mes - 1].slice(0, 3), r.gwh]), n0, 12, e.mes_max.slice(0, 3)),
"f-receptivo": () => serieM("Turistas no residentes por año, en millones", T.turistas_no_residentes_anual.map(r => [r.anio, r.turistas / 1e6]), n1),
"x-turistas-doce": () => SERIE_CIFRA["f-receptivo"](),
"f-hoteles": () => serieM("Viajeros en hoteles y parahoteles por año, en millones", T.viajeros_hoteles_anual.map(r => [r.anio, r.total / 1e6]), n1),
"x-hoteles-nr": () => serieM("Viajeros en hoteles que no residen en el país, en % del total", T.viajeros_hoteles_anual.map(r => [r.anio, r.no_residentes / r.total * 100]), pct),
"f-eti": () => provM("Turistas del exterior cada 1.000 habitantes", T.turistas_extranjeros_provincias, "cada_1000", null, n1),
"f-protegida": () => provM("Territorio dentro de áreas protegidas, en %", T.areas_protegidas_provincias, "pct_territorio", nt.pct, pct),
"f-parques": () => serieM("Superficie de las áreas protegidas nacionales, millones de hectáreas, por año", T.parques_nacionales_historia.map(r => [r.anio, (r.ha_terrestres + r.ha_marinas) / 1e6]), n1),
"f-visitas": () => serieM("Visitas a parques nacionales por año, en millones", T.visitas_parques_nacionales.map(r => [r.anio, r.total / 1e6]), n1),
"f-pesca": () => serieM("Pescados y mariscos desembarcados por año, en toneladas", T.desembarques_especies.map(r => [r.anio, r.Total]), n0),
"f-carne": () => serieM("Carne vacuna por habitante, en kilos por año", T.carne_vacuna.map(r => [r.anio, r.kg_por_habitante]), n1),
"f-vino": () => serieM("Vino vendido en el país, en millones de litros por año", T.vino_mercado_interno.map(r => [r.anio, r.millones_litros]), n0),
"f-yerba": () => serieM("Yerba mate que despacharon los molinos, en millones de kilos por año", T.yerba_molino.map(r => [r.anio, r.millones_kg]), n1),
"f-clima": () => serieM("Desvío de la temperatura media anual respecto del promedio de 1991 a 2020, en °C", T.clima_desvio.map(r => [r.anio, r.desvio_temperatura]), grados, 10, cu.cl_max_anio),
};
const miniIndp = i => { const c = INDP[i]; return c && provM(`${c.lab}: ${c.det}`, c.d, c.k, c.pais, c.f); };
function htmlMini(o) {
const W = 252, H = 92, top = 16, base = H - 16, esc2 = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;"})[c]);
if (o.prov) {
const d = [...o.prov].sort((a, b) => b.v - a.v), n = d.length, paso = (W - 12) / (n - 1);
const vs = d.map(x => x.v).concat(o.pais == null ? [] : [o.pais]), lo = d3.min(vs), hi = d3.max(vs), pad = (hi - lo) * .08 || 1;
const y = v => base - (v - lo + pad) / (hi - lo + 2 * pad) * (base - top);
const barras = d.map((x, i) => `<circle cx="${(6 + i * paso).toFixed(1)}" cy="${y(x.v).toFixed(1)}" r="${x.c === prov ? 4.5 : 3}" class="${x.c === prov ? "mini-hl" : "mini-b"}"/>`).join("");
const linea = o.pais == null ? "" : `<line x1="0" x2="${W}" y1="${y(o.pais).toFixed(1)}" y2="${y(o.pais).toFixed(1)}" class="mini-pais"/>`;
const elegida = prov && d.find(x => x.c === prov);
const pie = `Más alto: ${esc2(NOMBRES[d[0].c])} (${o.f(d[0].v)}). Más bajo: ${esc2(NOMBRES[d[n - 1].c])} (${o.f(d[n - 1].v)}).` +
(o.pais != null ? ` País: ${o.f(o.pais)}${linea ? ", la línea punteada" : ""}.` : "") + (elegida ? ` En amarillo, ${esc2(NOMBRES[prov])} (${o.f(elegida.v)}).` : "");
return `<span class="mini-tit">${esc2(o.tit)}. Las 24 jurisdicciones, de mayor a menor</span><svg class="mini" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true">${barras}${linea}</svg><span class="mini-pie">${pie}</span>`;
}
const d = o.d, n = d.length, g = 4, bw = (W - g * (n - 1)) / n, hi = o.hl != null ? Math.max(0, d.findIndex(x => String(x[0]) === String(o.hl))) : n - 1;
const max = Math.max(0, d3.max(d, x => x[1])), min = Math.min(0, d3.min(d, x => x[1])), y = v => base - (v - min) / (max - min || 1) * (base - top);
const barras = d.map((x, i) => `<rect x="${(i * (bw + g)).toFixed(1)}" y="${Math.min(y(x[1]), y(0)).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(1, Math.abs(y(x[1]) - y(0))).toFixed(1)}" rx="2" class="${i === hi ? "mini-hl" : "mini-b"}"/>`).join("");
const cx = hi * (bw + g) + bw / 2, ancla = cx < 40 ? "start" : cx > W - 40 ? "end" : "middle";
const valor = `<text x="${(ancla === "start" ? hi * (bw + g) : ancla === "end" ? hi * (bw + g) + bw : cx).toFixed(1)}" y="${(Math.min(y(d[hi][1]), y(0)) - 4).toFixed(1)}" text-anchor="${ancla}" class="mini-v">${esc2(o.f(d[hi][1]))}</text>`;
const cero = min < 0 ? `<line x1="0" x2="${W}" y1="${y(0).toFixed(1)}" y2="${y(0).toFixed(1)}" class="mini-cero"/>` : "";
const rotulos = `<text x="0" y="${H - 2}" class="mini-x">${esc2(d[0][0])}</text><text x="${W}" y="${H - 2}" text-anchor="end" class="mini-x">${esc2(d[n - 1][0])}</text>`;
return `<span class="mini-tit">${esc2(o.tit)}</span><svg class="mini" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true">${cero}${barras}${valor}${rotulos}</svg>`;
}
(() => {
const PUNTERO = matchMedia("(hover: hover) and (pointer: fine)");
let actual = null;
const datoDe = c => { const k = c.dataset.k || ""; return k.startsWith("p:") ? miniIndp(+k.slice(2)) : SERIE_CIFRA[k]?.(); };
const ver = c => {
const o = datoDe(c); if (!o || (o.prov ? o.prov.length < 4 : o.d.length < 3)) return;
tip.innerHTML = htmlMini(o); tip.classList.add("tip-cifra", "on"); actual = c; c.setAttribute("aria-describedby", "tip");
const r = c.getBoundingClientRect(), pr = document.body.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight;
const arriba = r.top - th - 12 > 88;
tip.classList.toggle("abajo", !arriba);
tip.style.left = Math.max(8, Math.min(r.left - pr.left + r.width / 2 - tw / 2, document.documentElement.clientWidth - tw - 8)) + "px";
tip.style.top = (arriba ? r.top - pr.top - th - 10 : r.bottom - pr.top + 10) + "px";
};
const ocultar = () => { if (!actual) return; actual.removeAttribute("aria-describedby"); actual = null; tip.classList.remove("on"); };
const tarjeta = ev => ev.target.closest?.(".en-cifras .cifra");
document.addEventListener("pointerover", ev => { const c = tarjeta(ev); if (c && c !== actual && ev.pointerType === "mouse" && PUNTERO.matches) ver(c); });
document.addEventListener("pointerout", ev => { const c = tarjeta(ev); if (c && c === actual && !c.contains(ev.relatedTarget)) ocultar(); });
document.addEventListener("focusin", ev => { const c = tarjeta(ev); if (c) ver(c); });
document.addEventListener("focusout", ev => { if (tarjeta(ev)) ocultar(); });
document.addEventListener("keydown", ev => { if (ev.key === "Escape") ocultar(); });
let cuadro = 0;
addEventListener("scroll", () => {
if (!actual) return;
if (actual !== document.activeElement) return ocultar();
cancelAnimationFrame(cuadro); cuadro = requestAnimationFrame(() => actual && ver(actual));
}, {passive: true});
})();
(() => {
const conm = document.querySelector(".dd-grupos");
if (!conm) return;
const grupos = [...document.querySelectorAll(".dd-grupo")], bots = [...conm.querySelectorAll("button")];
const esc3 = t => String(t).replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"})[c]);
const tablasDe = id => {
const f = SERIE_CIFRA[id]; if (!f) return [];
const otra = String(f).match(/SERIE_CIFRA\["([\w-]+)"\]/), src = String(f) + (otra && SERIE_CIFRA[otra[1]] ? String(SERIE_CIFRA[otra[1]]) : "");
return [...new Set([...src.matchAll(/\bT\.(\w+)/g)].map(m => m[1]))].filter(n => DIFERIDAS[n] && !T[n]);
};
const W = 240, H = 58, X0 = 4, X1 = W - 4;
function mini(o) {
if (o.d) {
const d = o.d, n = d.length, ys = d.map(x => x[1]), lo = Math.min(...ys), hi = Math.max(...ys), rango = hi - lo || 1;
const x = i => X0 + 4 + i * (X1 - X0 - 8) / (n - 1), y = v => 8 + (1 - (v - lo) / rango) * (H - 30);
const k = o.hl != null ? Math.max(0, d.findIndex(r => String(r[0]) === String(o.hl))) : n - 1;
const linea = d.map((r, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(r[1]).toFixed(1)}`).join("");
const area = `${linea}L${x(n - 1).toFixed(1)} ${H - 18}L${x(0).toFixed(1)} ${H - 18}Z`;
const lab = `${o.tit}: ${o.f(d[0][1])} en ${d[0][0]} y ${o.f(d[n - 1][1])} en ${d[n - 1][0]}`;
return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc3(lab)}"><path class="dd-area" d="${area}"/><path class="dd-linea" d="${linea}"/>` +
`<circle class="dd-punto" cx="${x(k).toFixed(1)}" cy="${y(d[k][1]).toFixed(1)}" r="4.5"/>` +
`<text x="${X0}" y="${H - 2}" class="dd-mx">${esc3(d[0][0])}</text><text x="${X1}" y="${H - 2}" class="dd-mx" text-anchor="end">${esc3(d[n - 1][0])}</text></svg>`;
}
const ps = [...o.prov].sort((a, b) => a.v - b.v), lo = ps[0].v, hi = ps[ps.length - 1].v, rango = hi - lo || 1, x = v => X0 + 6 + (v - lo) / rango * (X1 - X0 - 12);
const pais = o.pais != null && isFinite(o.pais) && o.pais >= lo && o.pais <= hi ? `<line class="dd-pais" x1="${x(o.pais).toFixed(1)}" x2="${x(o.pais).toFixed(1)}" y1="10" y2="${H - 26}"/>` : "";
const lab = `${o.tit}: de ${o.f(lo)} en ${NOMBRES[ps[0].c]} a ${o.f(hi)} en ${NOMBRES[ps[ps.length - 1].c]}` + (o.pais != null ? `, país ${o.f(o.pais)}` : "");
return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc3(lab)}"><line class="dd-eje" x1="${X0}" x2="${X1}" y1="${(H - 26) / 2 + 5}" y2="${(H - 26) / 2 + 5}"/>${pais}` +
ps.map(r => `<circle class="dd-prov" cx="${x(r.v).toFixed(1)}" cy="${(H - 26) / 2 + 5}" r="4"/>`).join("") +
`<text x="${X0}" y="${H - 2}" class="dd-mx">${esc3(NOMBRES[ps[0].c])}</text><text x="${X1}" y="${H - 2}" class="dd-mx" text-anchor="end">${esc3(NOMBRES[ps[ps.length - 1].c])}</text></svg>`;
}
const hechos = new Set();
async function minis(g) {
const datos = [...g.querySelectorAll(".dd-dato")].filter(d => !d.hidden && !hechos.has(d));
datos.forEach(d => hechos.add(d));
await Promise.all([...new Set(datos.flatMap(d => tablasDe(d.dataset.clave)))].map(n => cargarTabla(n).catch(() => null)));
datos.forEach(d => {
let o = null;
try { o = SERIE_CIFRA[d.dataset.clave]?.(); } catch (_) { o = null; }
const caja = d.querySelector(".dd-mini");
if (!o || (o.prov ? o.prov.length < 4 : !o.d || o.d.length < 3)) { d.classList.add("sin-mini"); caja.remove(); return; }
caja.innerHTML = mini(o);
caja.classList.add("lista");
});
}
grupos.forEach(g => [...g.querySelectorAll(".dd-dato")].filter(d => !d.hidden).forEach((d, i) => d.style.setProperty("--k", Math.min(i, 8))));
function elegir(id, guardar = true, animar = true) {
const g = grupos.find(x => x.dataset.grupo === id) || grupos[0];
bots.forEach((b, i) => { const on = b.dataset.g === g.dataset.grupo; b.setAttribute("aria-pressed", on); if (on) conm.style.setProperty("--i", i); });
grupos.forEach(x => { x.hidden = x !== g; x.classList.remove("entra"); });
if (animar) { void g.offsetWidth; g.classList.add("entra"); }
minis(g);
if (!guardar) return;
const u = new URL(location.href);
g === grupos[0] ? u.searchParams.delete("grupo") : u.searchParams.set("grupo", g.dataset.grupo);
history.replaceState(history.state, "", u);
}
conm.hidden = false;
bots.forEach(b => b.addEventListener("click", () => { if (b.getAttribute("aria-pressed") !== "true") elegir(b.dataset.g); }));
elegir(new URLSearchParams(location.search).get("grupo") || grupos[0].dataset.grupo, false, false);
})();
if (PAGINA !== "inicio") {
pintarCifras(); alCambiarProv.push(pintarCifras);
for (const sel of [".pildoras", ".subsecciones"]) {
const cur = document.querySelector(sel + " [aria-current]");
if (!cur) continue;
const fila = cur.parentElement;
let tocada = false, propio = false;
fila.addEventListener("scroll", () => { if (!propio) tocada = true; propio = false; }, {passive: true});
const alinear = () => {
if (tocada) return;
const antes = fila.scrollLeft;
fila.scrollLeft = Math.max(0, antes + cur.getBoundingClientRect().left - fila.getBoundingClientRect().left - (parseFloat(getComputedStyle(fila).paddingLeft) || 0)
- (sel === ".pildoras" ? 0 : 22));
propio = fila.scrollLeft !== antes;
};
requestAnimationFrame(alinear);
document.fonts?.ready.then(() => requestAnimationFrame(alinear));
addEventListener("load", () => requestAnimationFrame(alinear), {once: true});
}
}
(() => {
const btn = document.getElementById("lupa-btn"), caja = document.getElementById("buscador");
const ent = document.getElementById("busca"), res = document.getElementById("busca-res"), est = document.getElementById("busca-estado");
if (!btn) return;
const st = t => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const ir = (id, hash) => { const p = paginaDe(id); return p === PAGINA ? hash : urlPagina(p, hash); };
const MENU_G = {provincias: "Provincias", historias: "Historias", herramientas: "Herramientas"};
const grupoPag = id => MENU_G[SITIO.menu[id]] || "Temas";
const SEC_FICHA = Object.fromEntries(SITIO.fichas.map(f => [f[0], f[1]]));
const FUENTE = Object.fromEntries(SITIO.fichas.map(f => [f[0], f[9] || ""]));
let IDX;
const armar = () => {
IDX = [];
Object.values(SEC).forEach(t => IDX.push({t: t.t, g: grupoPag(t.id), u: urlPagina(t.id), x: t.x, sec: 1}));
IDX.push({t: "Tu provincia", g: "Provincias", u: "provincia", x: "perfil provincia provincias comparar país posición historia", sec: 1});
Object.entries(NOMBRES).forEach(([c, n]) => IDX.push({t: `${n} en números`, g: "Provincias", u: urlProv(c), x: n, sec: 2, c}));
IDX.push({t: "Laboratorio", g: "Historias", u: "laboratorio", x: "piezas visuales gráficos", sec: 1});
IDX.push({t: "¿Qué gobierno designó a cada juez de la Corte Suprema?", g: "Historias", u: "corte-suprema",
x: "corte suprema justicia jueces ministros designación presidentes gobiernos de facto poder judicial laboratorio", sec: 1});
SITIO.lab.forEach(([id, t]) => IDX.push({t, g: "Historias", sm: "Laboratorio", u: "laboratorio#" + id, x: "laboratorio pieza visual"}));
IDX.push({t: "Consultor de pobreza", g: "Temas", u: "pobreza/", x: "pobreza indigencia aglomerado partido comuna consultas sql parquet descargar", sec: 1});
IDX.push({t: "Explorador de relaciones", g: "Datina", u: "relaciones", x: "de dónde sale cada número origen fuentes organismos archivos", sec: 1});
IDX.push({t: "Sobre nosotros", g: "Datina", u: "nosotros", x: "propósito quiénes fuentes principios cómo se hace método"});
IDX.push({t: "Contacto", g: "Datina", u: "contacto", x: "escribir mensaje correo consultas sugerencias"});
SITIO.fichas.forEach(([id, sec, tit, kt, kl, , trasAyuda, sub, ks]) => {
const h = (TX[kt] || tit || "").trim(); if (!h) return;
const ancla = NOTA_A_LA_VISTA.has(id) && trasAyuda ? "#ayuda-suicidio" : "#" + id;
IDX.push({t: h, g: "Fichas", sm: nombreSec(sec), u: ir(id, ancla), x: (TX[ks] || sub || "") + " " + (TX[kl] || "") + " " + (CLAVE[id]?.[1] || ""), f: id});
});
PREG.forEach(([q, a, h]) => {
const vieja = h.slice(1), id = (SITIO.alias || {})[vieja] || vieja;
if (paginaDe(id)) IDX.push({t: q, g: "Fichas", sm: nombreSec(SEC_FICHA[id]), u: ir(vieja, h), x: a, f: id});
});
SITIO.articulos.forEach(([id, titulo, , sec, dek]) => IDX.push({t: titulo, g: "Historias", sm: "Artículo", u: urlPagina(id), x: `${dek}  ${nombreSec(sec)}`, sec: 1}));
IDX.forEach(d => { d.tt = st(d.t); d.xx = st(d.x); });
};
const opcion = (d, id) => `<a href="${d.u}" id="${id}" role="option" tabindex="-1" aria-selected="false"${d.r ? ' class="busca-resp"' : ""}>` +
(d.sm ? `<small>${esc(d.sm)}</small>` : "") + (d.r ? cuerpoResp(d.r) : d.c ? conBandera(d.c, d.t) : esc(d.t)) + "</a>";
const ALIAS_PROV = [["caba", "02"], ["capital federal", "02"], ["ciudad de buenos aires", "02"], ["ciudad autonoma", "02"],
["provincia de buenos aires", "06"], ["pba", "06"]];
const PROVS = [...ALIAS_PROV, ...Object.entries(NOMBRES).map(([c, n]) => [st(n), c])].sort((a, b) => b[0].length - a[0].length);
const VACIAS = new Set(("de del la las el los lo en y e o u a al un una unos unas por para con sin que cuanto cuanta cuantos cuantas como " +
"cual cuales donde quien quienes hay se es son esta estan fue mas menos muy tiene tienen cada su sus provincia provincias pais argentina").split(" "));
const CON_PERFIL = new Set(INDP.filter(e => e.d).map(e => e.id));
const PRINCIPAL = Object.entries({
"f-inflacion": ["inflacion", "precios", "ipc"], "f-salarios": ["salario", "salarios", "sueldo", "sueldos", "gana", "ganan"],
"f-empleo": ["empleo", "asalariados"], "f-empleo-publico": ["empleo publico", "empleados publicos", "cargos publicos"], "f-pobreza": ["pobreza", "pobres", "indigencia"], "f-combustibles": ["nafta", "combustible", "combustibles", "gasoil"],
"f-ant-mapa": ["antartida", "mapa antartida", "bases antartida", "bases antarticas"], "f-ant-bases": ["marambio", "orcadas", "base esperanza", "base carlini", "belgrano ii", "base san martin", "base petrel"],
"f-ant-reclamos": ["sector antartico", "reclamos antartida", "soberania antartida"], "f-ant-tratado": ["tratado antartico", "protocolo de madrid"], "f-ant-zonas": ["zonas protegidas antartida", "monumentos historicos antartida"],
"f-ant-temperatura": ["temperatura antartida", "temperatura orcadas"], "f-ant-hielo": ["hielo marino"], "f-ant-turismo": ["turismo antartico", "turistas antartida"], "f-ant-presupuesto": ["gasto antartida", "irizar", "rompehielos"],
"f-bcra": ["dolar"], "f-petroleo": ["petroleo"], "f-gas": ["gas"], "f-gas-consumo": ["consumo gas"], "f-homicidios": ["homicidios", "homicidio", "asesinatos"],
"f-robos": ["robos", "hurtos"], "f-delitos": ["delitos"], "f-mortalidad": ["mortalidad infantil"], "f-esperanza": ["esperanza vida"],
"f-poblacion-proy": ["poblacion", "habitantes"], "f-chicos-escuela": ["chicos en edad escolar", "edad escolar", "alumnos"], "f-nacimientos": ["nacimientos", "natalidad"], "f-exportaciones": ["exportaciones", "exporta"],
"f-importaciones": ["importaciones"], "f-reservas-bcra": ["reservas"], "f-deuda": ["deuda"], "f-haberes": ["jubilacion", "jubilados", "jubilado"],
"f-auh": ["auh", "asignacion universal"], "f-desempleo": ["desempleo"], "f-aprender": ["aprender"], "f-escolarizacion": ["escolarizacion", "secundaria"],
"f-censo": ["cloacas", "agua red"], "f-cobertura": ["obra social", "prepaga", "cobertura de salud", "sin cobertura"], "f-dengue": ["dengue", "mosquito"], "f-vacunas": ["vacuna", "vacunas", "vacunacion", "sarampion", "triple viral"], "f-internet": ["internet"], "f-glaciares": ["glaciares"], "f-cumbres": ["montaña", "montañas", "cerro", "cerros", "cumbre", "cumbres", "aconcagua", "altura"], "f-receptivo": ["turistas", "turismo"], "f-isac": ["construccion"],
"f-precio-consumo": ["precio de la carne", "precio de la yerba", "precio del vino"], "f-carne": ["carne"], "f-vino": ["vino"], "f-yerba": ["yerba"], "f-electricidad-provincias": ["electricidad", "luz"], "f-subsidios": ["subsidios"],
"f-empresas": ["empresas"], "f-socios-que": ["que le vendemos", "que le compramos", "comparar paises"], "f-valor-kilo": ["valor por kilo", "precio por kilo", "dolares por kilo"], "f-mayoristas": ["precios mayoristas", "mayoristas", "ipim"], "f-sectores-empleo": ["empleo por sector", "productividad"], "f-canastas": ["canasta", "canasta basica"], "f-crianza": ["crianza", "canasta de crianza", "cuota alimentaria"], "f-industria": ["industria", "produccion industrial", "ipi", "mineria"], "f-socios": ["socios comerciales", "saldo con china", "comercio con brasil", "deficit comercial con"], "f-socios-hist": ["historia del comercio exterior", "socios comerciales desde 1986"], "f-emae": ["actividad economica", "emae"], "f-carceles": ["carceles", "presos"], "f-sin-condena": ["sin condena", "presos sin condena", "procesados", "prision preventiva"],
"f-coparticipacion": ["coparticipacion", "coparticipacion federal", "reparto de impuestos"],
"f-sociedades": ["sociedades", "empresas nuevas", "crear empresas", "nuevas sociedades", "emprendimientos"],
"f-medicos": ["medicos", "medicos por habitante", "cantidad de medicos", "medico"],
"f-hospitales": ["hospitales", "hospital", "hospitales publicos", "terapia intensiva", "hospitales por habitante"],
"f-distancia-hospital": ["distancia al hospital", "hospital mas cercano", "lejos del hospital", "escuelas rurales", "acceso a la salud"],
"f-escuelas-primarias": ["escuelas primarias", "escuela primaria", "cantidad de escuelas", "cuantas escuelas", "escuelas por chico"], "f-escuelas-secundarias": ["escuelas secundarias", "escuela secundaria", "colegios secundarios", "secundarias por chico"],
"f-cobertura-suelo": ["monte nativo", "monte natural", "bosques", "desmonte", "deforestacion", "mapbiomas", "vegetacion natural"],
"f-telefonia": ["telefono fijo", "telefonia fija", "linea fija", "telefonia"], "f-tv-paga": ["tv paga", "television paga", "cable", "tv por cable", "tv satelital"],
"f-abandono": ["abandono escolar", "abandono", "repitencia", "repiten", "dejan la escuela", "desercion escolar"],
"f-deuda-provincias": ["deuda provincial", "deuda de las provincias", "deuda por provincia", "bonos provinciales"],
"f-desocupacion": ["desocupacion", "desocupados", "desocupada", "tasa de desocupacion"],
"f-empresas-tamano": ["pymes", "pyme", "microempresas", "tamano de las empresas", "empresas por sector"],
"f-pobreza-aglomerados": ["pobreza por region", "pobreza por ciudad", "pobreza por aglomerado"],
"f-salario-docente": ["maestro", "maestros", "docente", "docentes", "salario docente", "sueldo docente", "salario maestro", "sueldo maestro"], "f-patentes": ["patentes", "autos"], "f-sube": ["sube"]
}).flatMap(([id, ks]) => ks.map(k => [k.split(" "), id]));
const respuesta = (texto, hall) => {
let t = ` ${st(texto).replace(/[^a-z0-9]+/g, " ").trim()} `, c = "";
for (const [n, cod] of PROVS) if (t.includes(` ${n} `)) { c = cod; t = t.replace(` ${n} `, " "); break; }
const tema = t.trim().split(" ").filter(w => w && !VACIAS.has(w));
if (!tema.length) return null;
const sirve = d => d && d.f && !NOTA_A_LA_VISTA.has(d.f) && (c ? CON_PERFIL.has(d.f) : CLAVE[d.f]);
const tiene = d => tema.filter(w => d.tt.includes(w) || d.xx.includes(w)).length;
const pun = d => tiene(d) === tema.length && tema.some(w => d.tt.includes(w)) ? tema.length + tema.filter(w => d.tt.includes(w)).length : 0;
let d = PRINCIPAL.filter(([ks]) => ks.every(k => tema.includes(k))).map(([ks, id]) => ({x: IDX.find(x => x.f === id), n: ks.length}))
.filter(r => sirve(r.x)).sort((a, b) => tiene(b.x) - tiene(a.x) || b.n - a.n)[0]?.x;
if (!d) d = IDX.filter(sirve).map(x => ({x, p: pun(x)})).filter(r => r.p).sort((a, b) => b.p - a.p)[0]?.x;
if (!d && sirve(hall[0]) && tema.some(w => hall[0].tt.includes(w))) d = hall[0];
if (!d) return null;
const fuente = FUENTE[d.f] || "";
if (!c) return {t: CLAVE[d.f][0] + " " + CLAVE[d.f][1], g: "Respuesta rápida", sm: d.sm, u: d.u, r: {cifra: CLAVE[d.f][0], texto: CLAVE[d.f][1] + ".", fuente}};
const parecido = e => tema.filter(w => st(e.lab + " " + e.det).includes(w)).length;
const e = INDP.filter(x => x.id === d.f && x.d).reduce((a, b) => parecido(b) > parecido(a) ? b : a);
const v = e.d.find(r => r.codigo_indec === c)?.[e.k];
if (v == null) return null;
const cifra = e.f(v), det = cifra.endsWith("%") ? e.det.replace(/^%\s*/, "") : e.det, nota = notaDist(e, c).replace(/\.$/, "");
return {t: `${NOMBRES[c]}: ${cifra} ${det}`, g: "Respuesta rápida", sm: e.lab, u: d.u,
r: {c, cifra, texto: `${det}${nota ? ` (${nota})` : ""}. País: ${e.f(e.pais)}.`, fuente}};
};
const cuerpoResp = r => `<span>${r.c ? conBandera(r.c, NOMBRES[r.c]) + ": " : ""}<b>${esc(r.cifra)}</b> ${esc(r.texto)}</span>` +
(r.fuente ? `<span class="busca-fuente">${esc(r.fuente)}</span>` : "");
const pintar = (res, ds, base) => {
const grupos = [];
ds.forEach(d => { let g = grupos.find(x => x.n === d.g); if (!g) grupos.push(g = {n: d.g, ds: []}); g.ds.push(d); });
let i = 0;
res.innerHTML = grupos.map((g, k) => `<div role="group" aria-labelledby="${base}-g${k}"><p class="busca-grupo" id="${base}-g${k}" role="presentation">` +
`${esc(g.n)}</p>` + g.ds.map(d => opcion(d, `${base}-o${i++}`)).join("") + "</div>").join("");
};
const ejemplos = () => SITIO.ejemplos.filter(([id]) => paginaDe(id)).map(([id, q]) => ({t: q, g: "Preguntas de ejemplo", u: ir(id, "#" + id)}));
const buscar = (ent, res, est, base) => {
const texto = ent.value.trim(), pal = st(texto).split(/\s+/).filter(Boolean);
if (!IDX) armar();
if (!pal.length) {
pintar(res, [...ejemplos(), ...IDX.filter(d => d.sm === "Artículo").slice(0, 4).map(d => ({...d, g: "Para empezar"}))], base);
est.textContent = "";
return;
}
const puntaje = (d, todas) => {
const en = pal.filter(w => d.tt.includes(w) || d.xx.includes(w));
if (todas ? en.length < pal.length : !en.length) return 0;
return en.length * 3 + 2 * pal.filter(w => d.tt.includes(w)).length + (d.sec || 0);
};
let hall = IDX.map(d => ({d, p: puntaje(d, true)})).filter(r => r.p);
if (!hall.length) hall = IDX.map(d => ({d, p: puntaje(d, false)})).filter(r => r.p);
hall = hall.sort((a, b) => b.p - a.p).slice(0, 8).map(r => r.d);
const aIA = g => ({t: `Preguntarles a los datos: «${texto}»`, g, u: "consulta-ia?q=" + encodeURIComponent(texto.slice(0, 400))});
if (SITIO.ia && hall.length && pal.length >= 3) hall.push(aIA("Consultas con IA"));
const rr = respuesta(texto, hall);
if (rr) hall.unshift(rr);
if (hall.length) {
pintar(res, hall, base);
est.textContent = (rr ? `Respuesta rápida: ${rr.t}. ` : "") +
(hall.length === 1 ? "1 resultado. Enter para abrirlo." : `${hall.length} resultados. Flechas para recorrerlos, Enter para abrir.`);
} else {
const g = `Nada coincide con «${texto}»`;
pintar(res, [{t: `Buscar «${texto}» en el catálogo de datos`, g, u: "catalogo?q=" + encodeURIComponent(texto)},
...(SITIO.ia ? [aIA(g)] : []), {t: "Ver todos los temas", g, u: "./#secciones"}, ...ejemplos()], base);
est.textContent = `${g}. La lista ofrece buscar en el catálogo de datos, ${SITIO.ia ? "preguntarles a los datos con IA, " : ""}ver los temas o abrir una pregunta de ejemplo.`;
}
};
const combo = (ent, res, est, base) => {
Object.entries({role: "combobox", "aria-autocomplete": "list", "aria-controls": res.id, "aria-expanded": "false"}).forEach(([k, v]) => ent.setAttribute(k, v));
res.setAttribute("role", "listbox"); res.setAttribute("aria-label", "Resultados de la búsqueda"); res.setAttribute("tabindex", "-1");
let activo = -1;
const ops = () => [...res.querySelectorAll('[role="option"]')];
const marcar = i => {
const o = ops(); activo = i;
o.forEach((x, k) => { x.setAttribute("aria-selected", String(k === i)); x.classList.toggle("activo", k === i); });
if (o[i]) { ent.setAttribute("aria-activedescendant", o[i].id); o[i].scrollIntoView({block: "nearest"}); } else ent.removeAttribute("aria-activedescendant");
};
const mostrar = () => { buscar(ent, res, est, base); marcar(-1); ent.setAttribute("aria-expanded", String(ops().length > 0)); };
const cerrado = () => { marcar(-1); ent.setAttribute("aria-expanded", "false"); est.textContent = ""; };
ent.addEventListener("keydown", ev => {
const o = ops();
if ((ev.key === "ArrowDown" || ev.key === "ArrowUp") && o.length) {
ev.preventDefault();
marcar(ev.key === "ArrowDown" ? (activo + 1) % o.length : activo <= 0 ? o.length - 1 : activo - 1);
} else if (ev.key === "Enter") { ev.preventDefault(); (o[activo] || o[0])?.click(); }
});
return {mostrar, cerrado};
};
const lupa = combo(ent, res, est, "bl");
const abrir = () => {
caja.hidden = false; btn.setAttribute("aria-expanded", "true");
lupa.mostrar(); ent.focus({preventScroll: true});
};
const cerrar = volver => { btn.setAttribute("aria-expanded", "false"); caja.hidden = true; lupa.cerrado(); if (volver) btn.focus({preventScroll: true}); };
btn.addEventListener("click", () => btn.getAttribute("aria-expanded") === "true" ? cerrar(true) : abrir());
ent.addEventListener("input", lupa.mostrar);
res.addEventListener("click", ev => { if (ev.target.closest("a")) cerrar(false); });
document.addEventListener("keydown", ev => {
if (ev.key === "Escape" && !caja.hidden) cerrar(true);
else if (ev.key === "/" && caja.hidden && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "")) { ev.preventDefault(); abrir(); }
});
document.addEventListener("pointerdown", ev => { if (!caja.hidden && !caja.contains(ev.target) && !btn.contains(ev.target)) cerrar(false); });
caja.addEventListener("focusout", ev => { const a = ev.relatedTarget; if (!caja.hidden && a && !caja.contains(a) && a !== btn) cerrar(false); });
const entP = document.getElementById("busca-portada"), resP = document.getElementById("busca-portada-res");
const estP = document.getElementById("busca-portada-estado");
if (entP && resP && estP) {
const portada = combo(entP, resP, estP, "bp"), cajaP = entP.closest(".busca-portada");
const cerrarP = () => { resP.hidden = true; resP.innerHTML = ""; portada.cerrado(); };
const abrirP = () => cajaP.classList.add("abierta"), plegarP = () => { if (!entP.value) cajaP.classList.remove("abierta"); };
const ubicarP = () => {
const r = entP.getBoundingClientRect();
Object.assign(resP.style, {left: r.left + "px", top: r.bottom + 6 + "px", width: r.width + "px", maxHeight: Math.max(160, innerHeight - r.bottom - 18) + "px"});
};
addEventListener("scroll", () => { if (!resP.hidden) ubicarP(); }, {passive: true});
addEventListener("resize", () => { if (!resP.hidden) ubicarP(); });
entP.addEventListener("focus", abrirP);
entP.addEventListener("pointerdown", abrirP);
cajaP.addEventListener("transitionend", () => { if (!resP.hidden) ubicarP(); });
entP.addEventListener("input", () => { abrirP(); if (entP.value.trim()) { resP.hidden = false; portada.mostrar(); ubicarP(); } else cerrarP(); });
entP.addEventListener("keydown", ev => { if (ev.key === "Escape") { entP.value = ""; cerrarP(); plegarP(); } });
document.addEventListener("pointerdown", ev => { if (resP.contains(ev.target) || ev.target === entP) return; if (!resP.hidden) cerrarP(); plegarP(); });
entP.addEventListener("focusout", ev => { const a = ev.relatedTarget; if (a && resP.contains(a)) return; if (!resP.hidden && a) cerrarP(); plegarP(); });
}
})();
const vistas = new IntersectionObserver(es => {
let k = 0;
es.forEach(en => {
if (!en.isIntersecting) return;
const f = en.target, retraso = LLEGADA.activa ? 0 : Math.min(k++, 3) * 50;
if (LLEGADA.activa) f.classList.add("sin-entrada"); else f.style.setProperty("--retraso", retraso + "ms");
f.classList.add("visto"); vistas.unobserve(f);
setTimeout(() => {
f.querySelectorAll(".grafico[data-g]").forEach(gr => { if (gr.offsetParent) DIB[gr.dataset.g](!REDUCIR && !LLEGADA.activa); });
const bi = f.querySelector(".accion.imagen"); if (bi) bi.hidden = !svgUnico(f);
}, retraso);
});
}, {threshold: .12, rootMargin: "0px 0px -8% 0px"});
document.querySelectorAll("article.ficha").forEach(f => vistas.observe(f));
addEventListener("beforeprint", () => document.querySelectorAll("article.ficha").forEach(f => {
if (!f.offsetParent) return;
if (!f.classList.contains("visto")) { f.classList.add("visto", "sin-entrada"); vistas.unobserve(f); }
f.querySelectorAll(".grafico[data-g]").forEach(gr => { if (gr.offsetParent && DIB[gr.dataset.g]) DIB[gr.dataset.g](false); });
f.dataset.direccion = location.origin + location.pathname + location.search + "#" + f.id;
}));
const VISTA_INICIAL = new Map();
const controlesDe = f => [...f.querySelectorAll('.conmutador[data-g]:not(.pestanas):not([data-propio]), select[id], select[data-g]')];
const valorControl = c => c.matches("select") ? c.value : c.querySelector('button[aria-pressed="true"]')?.dataset.m;
const claveControl = c => c.matches("select") ? c.id || c.dataset.g : c.dataset.g;
function vistaDeFicha(f) {
return controlesDe(f).filter(c => VISTA_INICIAL.has(c) && valorControl(c) != null && valorControl(c) !== VISTA_INICIAL.get(c))
.map(c => claveControl(c) + ":" + encodeURIComponent(valorControl(c))).join(",");
}
document.querySelectorAll("article.ficha").forEach(f => controlesDe(f).forEach(c => VISTA_INICIAL.set(c, valorControl(c))));
(location.search.match(/[?&]vista=([^&#]*)/)?.[1] || "").split(",").forEach(par => {
const i = par.indexOf(":"); if (i < 1) return;
const k = par.slice(0, i), v = decodeURIComponent(par.slice(i + 1));
const sel = document.getElementById(k)?.matches("select") ? document.getElementById(k) : document.querySelector(`select[data-g="${CSS.escape(k)}"]:not([id])`);
if (sel) {
if (sel.value !== v && [...sel.options].some(o => o.value === v)) { sel.value = v; sel.dispatchEvent(new Event("change")); }
return;
}
document.querySelector(`.conmutador[data-g="${CSS.escape(k)}"]:not(.pestanas):not([data-propio]) button[data-m="${CSS.escape(v)}"]`)?.click();
});
const vistasG = new IntersectionObserver(es => es.forEach(en => {
if (!en.isIntersecting) return;
vistasG.unobserve(en.target);
if (en.target.offsetParent) DIB[en.target.dataset.g](!REDUCIR && !LLEGADA.activa);
}), {threshold: .12, rootMargin: "0px 0px -8% 0px"});
document.querySelectorAll("article.nota .grafico[data-g]").forEach(gr => vistasG.observe(gr));
const vistasL = new IntersectionObserver(es => es.forEach(en => {
if (!en.isIntersecting) return;
const f = en.target; vistasL.unobserve(f); f.classList.add("visto");
f.querySelectorAll(".grafico[data-g]").forEach(gr => { if (gr.offsetParent) DIB[gr.dataset.g](!REDUCIR && !LLEGADA.activa); });
}), {threshold: .12, rootMargin: "0px 0px -8% 0px"});
document.querySelectorAll(".lab-pieza").forEach(f => vistasL.observe(f));
document.querySelectorAll(".menu-panel a, .pie-mapa a").forEach(a => a.setAttribute("aria-current", a.getAttribute("href") === SECCION));
document.querySelectorAll(".grupo-btn").forEach(b => b.setAttribute("aria-current", b.dataset.secs.split(" ").includes(SECCION)));
const CORTO_CHIP = {"Santiago del Estero": "Sgo. del Estero", "Tierra del Fuego": "T. del Fuego"};
const pintarChip = () => {
const chip = document.getElementById("prov-chip"), nom = NOMBRES[prov];
if (chip) {
chip.hidden = !nom;
if (nom) {
document.getElementById("chip-bandera").src = `datos/banderas/${prov}.png`;
document.getElementById("chip-nom").textContent = CORTO_CHIP[nom] || nom;
const a = document.getElementById("chip-prov");
a.href = urlProv(prov);
a.setAttribute("aria-label", `Provincia elegida: ${nom}. Ver su perfil`);
a.title = `${nom}: ver su perfil`;
document.getElementById("chip-borrar").setAttribute("aria-label", `Ver todo el país en lugar de ${nom}`);
}
}
document.querySelectorAll(".migas-prov").forEach(li => { li.hidden = !nom; li.textContent = nom || ""; });
};
pintarChip(); alCambiarProv.push(pintarChip);
document.getElementById("chip-borrar")?.addEventListener("click", () => {
elegir("");
document.getElementById("lupa-btn")?.focus({preventScroll: true});
});
if (PAGINA === "contacto" && new URLSearchParams(location.search).has("enviado") && document.querySelector(".form-contacto")) {
document.querySelector(".form-contacto").hidden = true;
document.getElementById("form-gracias").hidden = false;
}
if (PAGINA === "contacto" && new URLSearchParams(location.search).has("suscripto") && document.getElementById("susc-gracias")) document.getElementById("susc-gracias").hidden = false;
document.querySelectorAll("form.form-suscripcion").forEach(form => {
const boton = form.querySelector(".susc-boton"), estado = form.querySelector(".susc-estado"), correo = form.querySelector("input[type=email]");
const poner = e => { form.querySelectorAll(".susc-e").forEach(x => x.classList.toggle("activa", x.dataset.e === e)); boton.dataset.estado = e; };
form.addEventListener("submit", async ev => {
ev.preventDefault();
if (boton.getAttribute("aria-busy") === "true" || boton.dataset.estado === "ok") return;
boton.setAttribute("aria-busy", "true");
poner("envia");
estado.textContent = "";
try {
const r = await fetch("/", {method: "POST", headers: {"Content-Type": "application/x-www-form-urlencoded"}, body: new URLSearchParams(new FormData(form)).toString()});
if (!r.ok) throw new Error(r.status);
poner("ok");
correo.readOnly = true;
boton.setAttribute("aria-disabled", "true");
estado.textContent = "Listo, tu correo quedó anotado.";
} catch {
poner("listo");
estado.textContent = "No se pudo enviar. Probá de nuevo en un rato.";
}
boton.removeAttribute("aria-busy");
});
});
const barra = document.querySelector(".barra");
if (PAGINA === "inicio" && document.querySelector(".portada"))
new IntersectionObserver(([en]) => barra.classList.toggle("clara", !en.isIntersecting && en.boundingClientRect.top < 0), {rootMargin: "-80px 0px 0px 0px"})
.observe(document.querySelector(".portada"));
else barra.classList.add("clara");
if (!REDUCIR) {
let ultimo = scrollY, pendiente = false;
addEventListener("scroll", () => {
if (pendiente) return;
pendiente = true;
requestAnimationFrame(() => {
pendiente = false;
const y = scrollY, d = y - ultimo;
if (Math.abs(d) < 6) return;
if (!barra.querySelector('[aria-expanded="true"]')) barra.classList.toggle("compacta", d > 0 && y > 120);
ultimo = y;
});
}, {passive: true});
}
addEventListener("keydown", () => document.documentElement.classList.add("teclado"), true);
addEventListener("pointerdown", () => document.documentElement.classList.remove("teclado"), true);
if (location.hash.includes("?")) {
const destino = document.getElementById(location.hash.slice(1).split("?")[0]);
if (destino) requestAnimationFrame(() => destino.scrollIntoView());
}
parte("inicio");
const mostrarHistoria = () => document.querySelectorAll("#prov-historia .ph, .prov-linea").forEach(a => { a.hidden = a.dataset.c !== prov; });
if (document.getElementById("prov-historia")) { mostrarHistoria(); alCambiarProv.push(mostrarHistoria); }
parte("catalogo");
const redibujar = () => { dibujarTodo(); PERFIL_PROV.tiras(); PERFIL_PROV.pintar(false); tablaAreas(); };
redibujar();
atar(document.body);
vigiaTextos.observe(document.body, {subtree: true, childList: true, characterData: true});
let ancho = document.documentElement.clientWidth, espera;
new ResizeObserver(() => {
const w = document.documentElement.clientWidth;
if (w === ancho) return;
ancho = w; clearTimeout(espera); espera = setTimeout(redibujar, 150);
}).observe(document.body);
arrancado = true;
