(() => {
const D = window.DATINA;
/* Formas de carga (etapa 6). Si el código tardó en llegar, las fichas ya se ven con su silueta (datina.css las muestra a
   los 400 ms): las que están en pantalla se completan en su lugar, sin entrada propia. "listo" saca la disposición de carga
   antes de medir nada (por ejemplo el largo de los textos para "Ver más"). Desde acá, las fichas aparecen al llegar a la pantalla. */
document.querySelectorAll("article.ficha").forEach(f => {
  const r = f.getBoundingClientRect();
  if (r.height > 0 && r.bottom > 0 && r.top < innerHeight && +getComputedStyle(f).opacity > .01) f.classList.add("visto", "sin-entrada");
});
document.documentElement.classList.add("listo");

/* ---------- páginas: cada sección vive en su propio archivo (salud.html, politica.html) ----------
   Cada página trae solo el marcado de su sección. Lo que hace falta saber de las otras (títulos, fichas y en qué página
   está cada ancla) sale del índice del sitio, que arma el constructor desde la plantilla (D.indice). */
const PAGINA = document.body.dataset.pagina || "inicio";
// sección a la que pertenece la página: en un artículo es "articulos"
const SECCION = PAGINA.startsWith("a-") ? "articulos" : PAGINA;
const SITIO = D.indice, UBIC = SITIO.ubic;
// página donde está un ancla (una ficha, una sección o un artículo)
const paginaDe = id => UBIC[id];
const urlPagina = (p, resto = "") => (p === "inicio" ? "./" : p + ".html") + resto;
// enlace a una ficha (#f-empleo): si está en otra página, la dirección de esa página
const destinoDe = href => {
  const id = href.slice(1).split("?")[0], p = id && paginaDe(id);
  if (!p || p === PAGINA) return null;
  return urlPagina(p, p === id ? "" : "#" + id);
};
// Los enlaces de cuando todo estaba en una sola página (#f-empleo?prov=30, #salud, ?cx=, ?ix=) llevan a la página nueva
if (PAGINA === "inicio") {
  const q = new URLSearchParams(location.search), h = location.hash.slice(1).split("?")[0], p = h && paginaDe(h);
  const destino = h === "provincias" || (q.has("prov") && !h) ? "provincia"
    : p && p !== "inicio" ? p : q.has("cx") || q.has("cy") ? "cruces" : q.has("ix") ? "indice" : q.has("dx") ? "diagnostico" : null;
  if (destino) { location.replace(urlPagina(destino, location.search + (h === destino || h === "provincias" ? "" : location.hash))); return; }
} else {
  // y en cualquier página, un enlace a una ficha que pasó a otra página (energia.html#f-petroleo, de cuando Petróleo y gas estaba en
  // Energía) lleva a la página donde está ahora
  const h = location.hash.slice(1).split("?")[0], p = h && paginaDe(h);
  if (p && p !== PAGINA && p !== h) { location.replace(urlPagina(p, location.search + location.hash)); return; }
}
const R = D.resumen, T = D.datos, OC = R.ocde;
// Elementos de una ficha que puede no estar en esta página: si falta, se usa uno suelto y esas líneas no tienen efecto
const $ = id => document.getElementById(id) || document.createElement("div");
// Las tablas más pesadas (elecciones, transferencias por provincia, pirámide y apoyo al gobierno) van en archivos aparte
// y se bajan recién cuando se dibuja una ficha que las usa, como la lista de legisladores
const DIFERIDAS = D.diferidas || {}, pedidas = {};
// las tablas diferidas llegan en columnas ({c: nombres, f: filas}, etapa 19): se vuelven a armar como objetos
const deColumnas = t => Array.isArray(t) ? t : t.f.map(r => Object.fromEntries(t.c.map((k, i) => [k, r[i]])));
const cargarTabla = n => T[n] ? Promise.resolve(T[n]) : (pedidas[n] ||= d3.json(`datos/${n}.json?v=${DIFERIDAS[n]}`).then(t => (T[n] = deColumnas(t))));
/* Mientras llegan los datos de un gráfico, el contenedor queda vacío y muestra la silueta de su forma (data-forma en la plantilla,
   dibujada por datina.css) con el alto que va a tener, así nada salta cuando llega. Los lectores de pantalla oyen "Cargando". */
const esperando = el => { el.innerHTML = '<span class="solo-lector">Cargando los datos</span>'; el.setAttribute("aria-busy", "true"); };
const sinDatos = (el, t) => { el.removeAttribute("aria-busy"); el.innerHTML = `<p class="nota">${t}</p>`; };
// Dibujo de una ficha que necesita tablas diferidas (lista fija o función que la devuelve): muestra la silueta mientras llegan y después dibuja
const conTablas = (g, nombres, dibujo) => a => {
  const faltan = (typeof nombres === "function" ? nombres() : nombres).filter(n => !T[n]);
  if (!faltan.length) return dibujo(a);
  const el = G(g); if (!el) return;
  if (!el.querySelector("svg")) esperando(el);
  Promise.all(faltan.map(cargarTabla)).then(() => {
    dibujo(a);
    // "Descargar imagen" se muestra solo si la ficha tiene un gráfico: ahora que está dibujado, se vuelve a mirar
    const f = el.closest(".ficha"), bi = f?.querySelector(".accion.imagen"); if (bi) bi.hidden = !svgUnico(f);
  }).catch(() => sinDatos(el, "No se pudieron cargar los datos."));
};
const loc = d3.formatLocale({decimal:",", thousands:".", grouping:[3], currency:["$",""]});
const n0 = loc.format(",.0f"), n1 = loc.format(",.1f"), n2 = loc.format(",.2f");
const pct = v => n1(v) + "%";
const kbdF = v => v >= 10 ? n0(v) : n1(v);
// una cifra sobre otra, con un decimal y sin ",0": "2 veces", "2,3 veces"
const veces = (a, b) => n1(a / b).replace(/,0$/, "");
// cuánto se aparta una provincia del país (etapa 21, como los perfiles del regulador de energía de Canadá): solo si llega a 1,5 veces o
// queda por debajo de la mitad, y solo para valores por habitante, tasas y porcentajes, nunca para variaciones con signo. Con soloDebajo
// (porcentajes que llegan a 100, como las cloacas), solo si queda muy por debajo
const vecesPais = (v, pais, soloDebajo) => {
  if (!(v >= 0 && pais > 0)) return "";
  const r = v / pais;
  return r >= 1.5 && !soloDebajo ? `${veces(v, pais)} veces el promedio del país` : r < .1 ? "menos de la décima parte del promedio del país"
    : r < .25 ? "menos de la cuarta parte del promedio del país" : r < .5 ? "menos de la mitad del promedio del país" : "";
};
const conVeces = (v, pais) => { const t = vecesPais(v, pais); return t ? ` (${t})` : ""; };
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
const ICONOS = /*ICONOS*/{};
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
  if (!cont) return;
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
// La "y" pasa a "e" delante de una palabra que empieza con el sonido de la i ("Misiones e Iguazú", "e INDEC"), salvo si la i forma
// un diptongo ("agua y hielo"). yE(s) devuelve la conjunción con la palabra, sin mirar las etiquetas ni los signos del principio.
const yE = s => (/^h?[ií](?![aeiouáéíóú])/i.test(String(s).replace(/<[^>]*>/g, "").replace(/^[^\p{L}\d]+/u, "")) ? "e " : "y ") + s;
const lista = xs => xs.length > 1 ? xs.slice(0, -1).join(", ") + " " + yE(xs[xs.length - 1]) : xs.join("");
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
// columnas de maternidad adolescente por provincia: llevan el primer y el último año de la DEIS (pct_2012, pct_2024...)
const ADO_INI = "pct_" + nac.anio_ini, ADO_ULT = "pct_" + nac.anio_ult;
const PI = R.piramide, JU = R.jubilaciones;
const EM = R.empresas;
// Petróleo y gas, y construcción y vivienda (etapa 18): resúmenes, ayudas y los textos que cambian con la vista de cada ficha
// (el de la vista inicial va en TX, así se ve antes de que se dibuje el gráfico)
const PG = R.petroleo, CN = R.construccion, VV = CN.viv;
const CB = R.combustibles;  // precios de los combustibles en el surtidor (etapa 21)
// salarios, salario docente, inversión en educación y seguridad (etapa 23)
const SA = R.salarios, DC = R.docentes, IE = R.inversion_edu, SG = R.seguridad;
// Economía y precios (etapa 25): la inflación, las canastas, los salarios y la actividad, todo del INDEC
const EIP = R.economia.ipc, ECB = R.economia.canasta, ESR = R.economia.salarios, EMA = R.economia.actividad, ESU = R.economia.super;
const conSigno = v => (v > 0 ? "+" : "") + pct(v);
// regiones del índice de precios del INDEC (Cuadro 5 de su metodología de 2019): grupos de ciudades, no provincias. La provincia de Buenos
// Aires está en dos: los 24 partidos, en el Gran Buenos Aires, y el resto, en la Pampeana
const REG_IPC = {"02": ["gba"], "06": ["gba", "pampeana"], "10": ["noroeste"], "14": ["pampeana"], "18": ["noreste"], "22": ["noreste"], "26": ["patagonia"],
  "30": ["pampeana"], "34": ["noreste"], "38": ["noroeste"], "42": ["pampeana"], "46": ["noroeste"], "50": ["cuyo"], "54": ["noreste"], "58": ["patagonia"],
  "62": ["patagonia"], "66": ["noroeste"], "70": ["cuyo"], "74": ["cuyo"], "78": ["patagonia"], "82": ["pampeana"], "86": ["noroeste"], "90": ["noroeste"],
  "94": ["patagonia"]};
const REG_ART = {"Gran Buenos Aires": "el Gran Buenos Aires", "Pampeana": "la región Pampeana", "Noreste": "el Noreste", "Noroeste": "el Noroeste", "Cuyo": "Cuyo",
  "Patagonia": "la Patagonia"};
// la región de la provincia elegida, en una frase, con el valor de una tabla de regiones: "Chaco está en el Noreste: 37,0%."
const enSuRegion = (filas, k, f) => {
  const regs = REG_IPC[prov]; if (!regs) return "";
  const v = r => filas.find(x => x.codigo === r);
  if (regs.length === 2) return ` La provincia de Buenos Aires está en dos regiones: los 24 partidos, en el Gran Buenos Aires, con ${f(v("gba")[k])}, y el resto, ` +
    `en la región Pampeana, con ${f(v("pampeana")[k])}.`;
  return ` ${NOMBRES[prov]} está en ${REG_ART[v(regs[0]).region]}: ${f(v(regs[0])[k])}.`;
};
const inicialMin = t => t.charAt(0).toLowerCase() + t.slice(1);
// como cambioPct, para un sujeto en plural: "subieron 4,0%", "bajaron 1,3%" o "no cambiaron"
const cambioPl = v => Math.round(Math.abs(v) * 10) === 0 ? "no cambiaron" : `${v < 0 ? "bajaron" : "subieron"} ${pct(Math.abs(v))}`;
// Migraciones (etapa 25): el Censo 2022, la serie de los censos, las residencias de la DNM y los argentinos en el exterior (Naciones Unidas)
const MG = R.migraciones, MGC = MG.censo, MGD = MG.dnm, MGO = MG.onu, MGH = MG.historia, MGP = MG.departamentos, MGR = MG.refugio;
// los departamentos más altos: "Comuna 1 (24,6%), Comuna 3 (20,3%) y Comuna 8 (20,2%), las tres de CABA" si son de la misma provincia, y si no,
// "Lago Argentino (Santa Cruz, 56,4%), ..."
const depsTop = top => top.every(d => d[1] === top[0][1])
  ? `${lista(top.map(d => `${d[0]} (${pct(d[2])})`))}, ${top.length === 3 ? "las tres" : "todos"} de ${top[0][1]}`
  : lista(top.map(d => `${d[0]} (${d[1]}, ${pct(d[2])})`));
// en los mapas de Migraciones, con una provincia elegida: de dónde a dónde va el valor entre sus departamentos de 10.000 habitantes o más
// (si tiene menos de dos, entre todos)
const rangoDep = (filas, k, que) => {
  const enP = filas.filter(r => r.codigo_indec === prov), grandes = enP.filter(r => r.poblacion_vp >= MGP.min_pob), base = grandes.length > 1 ? grandes : enP;
  if (base.length < 2) return "";
  const hi = base.reduce((p, q) => q[k] > p[k] ? q : p), lo = base.reduce((p, q) => q[k] < p[k] ? q : p);
  return `En ${NOMBRES[prov]}, la parte de la población ${que} va de ${pct(lo[k])} en ${lo.departamento} a ${pct(hi[k])} en ${hi.departamento}` +
    (base === grandes && grandes.length < enP.length ? `, entre los departamentos de ${n0(MGP.min_pob)} habitantes o más.` : ".");
};
// Gobierno (etapa 25): las cuentas de la Nación, la recaudación, la deuda, el empleo público y los impuestos de las provincias
const GOB = R.gobierno, GBN = GOB.nacion, GRT = GOB.recaudacion, GBD = GOB.deuda, GBC = GOB.empleo, GBP = GOB.provincial;
// superávit o déficit, en palabras
const sobra = v => v < 0 ? "déficit" : "superávit";
// millones de pesos en billones (un millón de millones)
const billones = millones => `${n1(millones / 1e6)} billones de pesos`;
// el segundo de dos cambios seguidos, sin repetir el verbo si va en la misma dirección que el primero: "subió 1,7% frente al mes anterior y 33,5% en un año"
const yCambio = (a, b) => Math.round(Math.abs(a) * 10) && Math.round(Math.abs(b) * 10) && (a < 0) === (b < 0) ? pct(Math.abs(b)) : cambioPct(b);
// un caso cada cuántos habitantes, redondeado a la centena (la equivalencia que usa usafacts.org: "uno cada 27.600 habitantes")
const unoCada = tasa => n0(Math.round(1e5 / tasa / 100) * 100);
// cuánto cambió un valor, en palabras: "bajó 1,3%", "subió 4,0%" o "no cambió"
const cambioPct = v => Math.round(Math.abs(v) * 10) === 0 ? "no cambió" : `${v < 0 ? "bajó" : "subió"} ${pct(Math.abs(v))}`;
// en cuántas de las 24 jurisdicciones pasó algo: "en 5 de las 24", "en las 24" o "en ninguna"
// millones de pesos en los gráficos, como en el resto del sitio: "4,09 M" en las barras y "2 M" en los ejes
const millonesM = v => n2(v / 1e6) + " M", ejeM = v => v === 0 ? "0" : n1(v / 1e6) + " M";
// nombres cortos de los tipos de delito, para el gráfico en el celular
const CORTO_DEL = {"Otros delitos contra la propiedad": "Otros contra la propiedad", "Lesiones culposas en siniestros viales": "Lesiones en tránsito",
  "Infracciones a la ley de estupefacientes": "Estupefacientes", "Delitos de otras leyes especiales": "Otras leyes especiales",
  "Delitos contra la administración pública": "Administración pública", "Otros delitos contra las personas": "Otros contra las personas",
  "Otros delitos contra la integridad sexual": "Otros delitos sexuales", "Abusos sexuales con acceso carnal": "Abusos con acceso carnal",
  "Delitos contra la seguridad pública": "Seguridad pública", "Otros delitos contra la libertad": "Otros contra la libertad",
  "Homicidios dolosos": "Homicidios dolosos", "Lesiones culposas por otros hechos": "Otras lesiones culposas",
  "Tentativas de homicidio doloso": "Tentativas de homicidio", "Muertes en siniestros viales": "Muertes en tránsito"};
const deLas24 = n => n === 24 ? "en las 24 jurisdicciones" : n === 0 ? "en ninguna de las 24 jurisdicciones" : `en ${n} de las 24 jurisdicciones`;
// centrales eléctricas: un color por tecnología, el mismo en el mapa y en la potencia del país
const TEC_CEN = [{k: "termica", lab: "Térmica", c: "#8C9AAB"}, {k: "hidraulica", lab: "Hidroeléctrica", c: "#2C74B5"}, {k: "nuclear", lab: "Nuclear", c: "#85340A"},
  {k: "eolica", lab: "Eólica", c: "#74ACDF"}, {k: "solar", lab: "Solar", c: "#F6B40E"}, {k: "biogas", lab: "Biomasa y biogás", c: "#5E9E6E"}];
const COL_CEN = Object.fromEntries(TEC_CEN.map(t => [t.lab, t.c]));
// nombres de áreas de concesión: la fuente los escribe en mayúsculas y sin tildes
const tituloArea = s => String(s || "").trim().toLowerCase().replace(/(^|[\s\-(.])([a-záéíóúñü])/g, (m, a, b) => a + b.toUpperCase())
  .replace(/ (De|Del|Y) /g, (m, w) => ` ${w.toLowerCase()} `).replace(/ Sa$/, " SA");
// mapa de pozos no convencionales: un tono por grupo de años de inicio, del más viejo (claro) al más nuevo (oscuro)
const COL_POZOS = ["#B9D3EC", "#7FB0DD", "#3F86C6", "#1F5E97", "#0B2F52"];
const masPct = v => (v > 0 ? "+" : "") + pct(v);
const creceCae = (v, sube = "creció", baja = "cayó") => `${v < 0 ? baja : sube} ${pct(Math.abs(v))}`;
const TRIM_N = ["primer", "segundo", "tercer", "cuarto"];
// en el celular, los nombres largos de los insumos van abreviados (el nombre completo está en la tabla)
const CORTO_INS = {"Mosaicos graníticos y calcáreos": "Mosaicos", "Pisos y revestimientos cerámicos": "Pisos cerámicos", "Resto (grifería, tubos y vidrio)": "Grifería, tubos, vidrio"};
const NOMBRE_INS = n => n.startsWith("Resto") ? "el grupo de grifería, tubos de acero sin costura y vidrio plano" : n.charAt(0).toLowerCase() + n.slice(1);
const CUENCA_N = {neuquina: "la Neuquina", gsj: "la del Golfo San Jorge", austral: "la Austral", noroeste: "la del Noroeste", cuyana: "la Cuyana"};
const cuencasTxt = c => lista(Object.entries(c).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${CUENCA_N[k]} (${pct(v)})`));
const topViv = k => [...T.vivienda_provincias].sort((a, b) => b[k] - a[k]);
const VIV_IND = {
  pct_alquila: {nombre: "Hogares que alquilan", f: pct,
    t: () => `En el Censo 2022, el ${pct(VV.pct_alquila)} de los hogares alquilaba su vivienda y el ${pct(VV.pct_propia)} era propietario. ` +
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
const NOTA_VIV = k => `Datos del Censo 2022 sumados desde los radios censales. Un hogar son las personas que comparten la vivienda y los gastos de comida. ` +
  (k === "pct_materiales_4" ? `La calidad de los materiales es una clasificación del INDEC según el material de los pisos y los techos y la presencia de cielorraso: la calidad IV es la de materiales de baja calidad tanto en el piso como en el techo. Se calcula sobre los hogares con dato. ` : "") +
  `El día del censo, el ${pct(VV.pct_sin_personas)} de las viviendas particulares no tenía personas presentes, y el INDEC registró el motivo: uso temporal, oficina o comercio, alquiler o venta, construcción, residentes que no estaban ese día u otra situación. ` +
  `Por eso el selector muestra motivos por separado y no un total de viviendas vacías: una parte de las viviendas sin personas presentes tiene residentes habituales. ` +
  `En el mapa, el color divide a los departamentos en cinco grupos del mismo tamaño. Si elegís una provincia en Tu provincia, el mapa se acerca a ella.`;
const LEAD = {
  petroleo: v => v === "cuenca"
    ? `En ${PG.mes}, el petróleo salió de cinco cuencas: ${cuencasTxt(PG.cuencas_pet)}. La Neuquina abarca Neuquén y partes de Mendoza, Río Negro y La Pampa.`
    : `En ${PG.mes} la Argentina produjo ${n0(PG.kbd)} mil barriles de petróleo por día${PG.record ? `, el valor más alto de la serie, que empieza en ${PG.anio_ini}` : ""}. ` +
      `El ${pct(PG.pct_shale)} salió de pozos de shale. Entre enero y ${MESES[PG.ytd.pet.mes - 1]} la producción ${creceCae(PG.ytd.pet.var)} frente a los mismos meses de ${PG.ytd.pet.anio - 1}. ` +
      `El promedio anual más bajo de la serie fue el de ${PG.anio_min}, con ${n0(PG.kbd_min)} mil barriles por día.`,
  gas: v => v === "cuenca"
    ? `En ${PG.mes}, el gas salió de estas cuencas: ${cuencasTxt(PG.cuencas_gas)}. La Austral incluye los yacimientos del mar frente a Tierra del Fuego.`
    : `En ${PG.mes} se produjeron ${n1(PG.gas)} millones de metros cúbicos de gas natural por día, el ${pct(PG.pct_gas_nc)} de pozos no convencionales. ` +
      `Entre enero y ${MESES[PG.ytd.gas.mes - 1]} la producción ${creceCae(PG.ytd.gas.var)} frente a los mismos meses de ${PG.ytd.gas.anio - 1}. ` +
      `En ${PG.anio_ult} el promedio fue de ${n1(PG.gas_ult)} millones por día. El más bajo de la serie fue el de ${PG.anio_min_gas}, con ${n1(PG.gas_min)}.`,
  "gas-hogares": () => {
    const alto = topViv("pct_gas_red").slice(0, 3);
    return `En el Censo 2022, el ${pct(VV.pct_gas_red)} de los hogares cocinaba con gas de red y el ${pct(VV.pct_garrafa)} con gas en garrafa. ` +
      (CN.gas_nea.length ? `En ${lista(CN.gas_nea)}, menos de ${Math.ceil(CN.gas_nea_max)} de cada 100 hogares cocinaba con gas de red. ` : "") +
      `Donde más hogares lo tenían era en ${lista(alto.map(r => `${r.territorio} (${pct(r.pct_gas_red)})`))}.`;
  },
  "hidro-provincias": v => {
    const fila = c => T.hidrocarburos_provincias.find(r => r.territorio === c) || {};
    if (v === "gas_mmm3d") {
      const t = fila(PG.top_gas);
      return `Entre ${PG.v_desde} y ${PG.v_hasta}, ${PG.top_gas} produjo el ${pct(PG.top_gas_pct)} del gas del país: ${n1(t.gas_mmm3d)} millones de metros cúbicos por día, contra ${n1(t.gas_mmm3d_antes)} en los mismos meses de diez años antes. ` +
        `Los yacimientos del mar argentino aportaron el ${pct(PG.mar_gas_pct)}.`;
    }
    return `Entre ${PG.v_desde} y ${PG.v_hasta}, ${PG.top} produjo el ${pct(PG.top_pct)} del petróleo del país: ${n0(PG.top_kbd)} mil barriles por día, contra ${n0(PG.top_antes)} mil en los mismos meses de diez años antes. ` +
      `${PG.segundo}, la segunda, produjo ${n0(PG.segundo_kbd)} mil, contra ${n0(PG.segundo_antes)} mil. En total, ${PG.n_prov} provincias producen petróleo o gas. La formación Vaca Muerta dio el ${pct(PG.vm_pct)} del petróleo del país.`;
  },
  // áreas de concesión (etapa 21): el último año completo. El texto de un área elegida lo arma textoArea()
  "areas-hidro": v => {
    const gas = v === "gas", t = gas ? PG.areas_gas_top : PG.areas_pet_top;
    const cant = x => gas ? `${n1(x)} millones de metros cúbicos de gas por día` : `${kbdF(x)} mil barriles de petróleo por día`;
    return `En ${PG.areas_anio}, ${PG.areas_n} áreas de concesión produjeron petróleo o gas. La mitad del ${gas ? "gas" : "petróleo"} del país salió de ${gas ? PG.areas_n50_gas : PG.areas_n50_pet} de ellas, ` +
      `y las diez que más produjeron sumaron el ${pct(gas ? PG.areas_top10_gas : PG.areas_top10_pet)}. ` +
      `La primera fue ${tituloArea(t.nombre)}, ${t.territorio === "Mar argentino" ? "en el mar argentino" : "en " + t.territorio}, con ${cant(t.v)}, el ${pct(t.pct)} del país` +
      (t.nc >= 99.95 ? ", todo de formaciones no convencionales" : t.nc >= 95 ? ", casi todo de formaciones no convencionales" : t.nc > 0 ? `, el ${pct(t.nc)} de formaciones no convencionales` : ", todo de formaciones convencionales") +
      `. ${t.antes > 0 ? `En ${PG.areas_anio - 10} producía ${cant(t.antes)}.` : `En ${PG.areas_anio - 10} no producía.`}`;
  },
  pozos: () => {
    const p = T.pozos_provincias.find(r => r.territorio === PG.pozos_top) || {};
    return `En ${PG.pozos_mes} produjeron petróleo o gas ${n0(PG.pozos)} pozos. Los ${n0(PG.pozos_shale)} de shale, el ${pct(PG.pct_pozos_shale)} del total, dieron el ${pct(PG.pct_pet_shale_pozos)} del petróleo. ` +
      `Un pozo de shale produjo en promedio ${n0(PG.bpd_shale)} barriles por día y uno convencional, ${n1(PG.bpd_conv)}: ${PG.veces} veces menos. ` +
      `${PG.pozos_top} es la provincia con más pozos en producción: ${n0(PG.pozos_top_n)}, ${n0(p.convencional)} de ellos convencionales.`;
  },
  "empresas-hidro": v => {
    const e = [...T.hidrocarburos_empresas].filter(r => r.nombre !== "Otras empresas").sort((a, b) => b.pct_gas - a.pct_gas);
    return v === "pct_gas"
      ? `Entre ${PG.v_desde} y ${PG.v_hasta}, la empresa que más gas produjo fue ${e[0].nombre}, con el ${pct(e[0].pct_gas)} del país, seguida por ${e[1].nombre} (${pct(e[1].pct_gas)}) y ${e[2].nombre} (${pct(e[2].pct_gas)}).`
      : `Entre ${PG.v_desde} y ${PG.v_hasta}, ${PG.emp_top} produjo el ${pct(PG.emp_top_pct)} del petróleo del país. Declararon producción de petróleo ${PG.n_empresas} empresas, y las ${PG.emp_n} del gráfico sumaron el ${pct(100 - PG.emp_resto_pct)}.`;
  },
  "empleo-hidro": () => `En el ${CN.emp_trim}, la extracción de petróleo y gas y sus servicios tenía ${n0(CN.pet_emp)} puestos asalariados registrados en el sector privado. ` +
    `Frente al mismo trimestre del año anterior, en las provincias con dato en los dos trimestres, los puestos ${creceCae(CN.pet_emp_var, "crecieron", "cayeron")}. ${CN.pet_emp_top} tenía ${n0(CN.pet_emp_top_v)}.`,
  regalias: v => v === "usd_crudo_hab"
    ? `En ${PG.reg_usd_anio}, las regalías de petróleo crudo sumaron ${n0(PG.reg_usd_total)} millones de dólares. En ${PG.reg_usd_top} equivalieron a ${n0(PG.reg_usd_top_hab)} dólares por habitante. ` +
      `El año más alto de la serie, que empieza en ${PG.reg_usd_ini}, fue ${PG.reg_usd_max_anio}, con ${n0(PG.reg_usd_max)} millones.`
    : `En ${PG.reg_anio}, las regalías fueron el ${pct(PG.reg_top_pct)} de los ingresos totales de ${PG.reg_top}. Superaron el 10% de los ingresos en ${PG.reg_n_10} provincias y el 1% en ${PG.reg_n_1}. En las otras ${24 - PG.reg_n_1}, menos del 1%.`,
  reservas: v => v === "horizonte"
    ? `Al ritmo de producción de ${PG.res_anio}, las reservas comprobadas alcanzaban para ${n1(PG.res_hor_pet)} años de petróleo y ${n1(PG.res_hor_gas)} años de gas. En ${PG.res_ini} eran ${n1(PG.res_hor_pet_ini)} y ${n1(PG.res_hor_gas_ini)} años.`
    : v === "gas"
    ? `Al 31 de diciembre de ${PG.res_anio}, las reservas comprobadas de gas eran de ${n0(PG.res_gas)} mil millones de metros cúbicos, ${n1(PG.res_hor_gas)} años de producción al ritmo de ese año. ` +
      `El ${pct(PG.res_nc_gas)} era no convencional y el ${pct(PG.res_nq_gas)} estaba en Neuquén. En ${PG.res_ini} eran ${n0(PG.res_gas_ini)} mil millones.`
    : `Al 31 de diciembre de ${PG.res_anio}, las reservas comprobadas de petróleo eran de ${n0(PG.res_pet)} millones de metros cúbicos, unos ${n1(PG.res_bbl)} mil millones de barriles: ${n1(PG.res_hor_pet)} años de producción al ritmo de ese año. ` +
      `${PG.res_var_pet >= 0 ? "Crecieron" : "Cayeron"} ${pct(Math.abs(PG.res_var_pet))} frente a ${PG.res_anio_ant}. El ${pct(PG.res_nc_pet)} era no convencional y el ${pct(PG.res_nq_pet)} estaba en Neuquén.`,
  "balanza-energetica": () => `En ${PG.bal_anio}, la Argentina exportó ${n0(PG.bal_expo)} millones de dólares en combustibles y energía e importó ${n0(PG.bal_impo)} millones en combustibles y lubricantes: un saldo ${PG.bal_saldo >= 0 ? "positivo" : "negativo"} de ${n0(Math.abs(PG.bal_saldo))} millones. ` +
    (PG.bal_def_n ? `Entre ${PG.bal_def_desde} y ${PG.bal_def_hasta} el saldo fue negativo en ${PG.bal_def_n} de ${PG.bal_def_hasta - PG.bal_def_desde + 1} años, con el déficit más grande en ${PG.bal_def_max_anio}: ${n0(PG.bal_def_max)} millones. ` : "") +
    `Entre enero y ${MESES[PG.bal_ytd.mes - 1]} de ${PG.bal_ytd.anio}, el saldo fue de ${n0(PG.bal_ytd.saldo)} millones y las exportaciones ${creceCae(PG.bal_ytd_expo.var, "crecieron", "cayeron")} frente a los mismos meses del año anterior.`,
  "mundo-petroleo": v => {
    const m = PG.mundo, q = m.neuquen;
    return v === "gas_bcm"
      ? `Según la estimación de la Administración de Información Energética de los Estados Unidos (EIA), en gas natural la Argentina fue el productor número ${m.gas_bcm.puesto} del mundo en ${m.gas_bcm.anio}, con ${n1(m.gas_bcm.arg)} mil millones de metros cúbicos, el ${pct(m.gas_bcm.pct)} del total mundial.`
      : `Según la estimación de la Administración de Información Energética de los Estados Unidos (EIA), en ${m.crudo_kbd.anio} la Argentina fue el productor de petróleo número ${m.crudo_kbd.puesto} del mundo, con ${n0(m.crudo_kbd.arg)} mil barriles por día, el ${pct(m.crudo_kbd.pct)} del total mundial.` +
        (q ? ` Si Neuquén fuera un país, con ${n0(q.kbd)} mil barriles por día estaría en el puesto ${q.puesto}, entre ${q.arriba} y ${q.abajo}.` : "");
  },
  // fracturas y pozos terminados (etapa 19): años completos, el último puede subir porque las empresas informan con demora
  fracturas: v => v === "rama"
    ? `En ${PG.fr_ult}, los pozos de Vaca Muerta tuvieron en promedio ${n0(PG.dv_rama_ult)} metros de rama horizontal, el tramo del pozo que avanza en horizontal dentro de la formación. ` +
      `En ${PG.dv_ini} eran ${n0(PG.dv_rama_ini)} metros: la rama es ${n1(PG.dv_rama_ult / PG.dv_rama_ini)} veces más larga.`
    : v === "etapas_pozo"
    ? `Cada pozo de Vaca Muerta fracturado en ${PG.fr_ult} llevó en promedio ${n1(PG.dv_etapas_ult)} etapas de fractura y ${n0(PG.dv_arena_ult)} toneladas de arena. ` +
      `En ${PG.dv_ini} eran ${n1(PG.dv_etapas_ini)} etapas y ${n0(PG.dv_arena_ini)} toneladas.`
    : `En ${PG.fr_ult}, las empresas informaron ${n0(PG.fr_etapas)} etapas de fractura en formaciones no convencionales${PG.fr_record ? ", el máximo de la serie" : ""}, ` +
      `${PG.fr_var >= 0 ? pct(PG.fr_var) + " más" : pct(-PG.fr_var) + " menos"} que en ${PG.fr_ult - 1} y ${PG.fr_veces} veces las de ${PG.fr_ini}. ` +
      `El ${pct(PG.fr_vm_pct)} fue en Vaca Muerta. Se bombearon ${n1(PG.fr_arena_mt)} millones de toneladas de arena.`,
  "pozos-terminados": v => v === "prov"
    ? `Entre ${PG.pt_v_desde} y ${PG.pt_mes} se terminaron ${n0(PG.pt_12m)} pozos de petróleo y gas, ` +
      `${PG.pt_12m >= PG.pt_12m_ant ? n0(PG.pt_12m - PG.pt_12m_ant) + " más" : n0(PG.pt_12m_ant - PG.pt_12m) + " menos"} que en los doce meses anteriores. ` +
      `${PG.pt_top} concentró el ${pct(PG.pt_top_pct)}, con ${n0(PG.pt_top_n)} pozos.`
    : `En ${PG.pt_anio} se terminaron ${n0(PG.pt_total)} pozos de petróleo y gas: ${n0(PG.pt_explot)} de explotación y ${n0(PG.pt_explor)} de exploración o de avanzada. ` +
      (PG.pt_total < PG.pt_max ? `El máximo de la serie fue en ${PG.pt_max_anio}, con ${n0(PG.pt_max)}. Hoy se terminan menos pozos, pero en Vaca Muerta cada uno tiene una rama horizontal ` +
        `${n1(PG.dv_rama_ult / PG.dv_rama_ini)} veces más larga que en ${PG.dv_ini}.` : "Es el máximo de la serie."),
  // productividad de los pozos de Vaca Muerta por año de inicio (etapa 19): años completos
  productividad: v => v === "metro"
    ? `Por cada 1.000 metros de rama horizontal, los pozos que empezaron a producir en ${PG.cos_ult} sacaron en su primer año ${n0(PG.bpm_ult)} barriles de petróleo. ` +
      (PG.bpm_ult < PG.bpm_max ? `El máximo fue el de los pozos de ${PG.bpm_max_anio}, con ${n0(PG.bpm_max)}: los pozos de ${PG.cos_ult} son más largos (${n0(PG.rama_m_ult)} metros de rama en promedio, ` +
        `contra ${n0(PG.rama_m_bpm_max)}), pero cada metro rindió ${pct(-PG.bpm_var)} menos.` : `Es el máximo desde ${PG.rama_desde}.`)
    : v === "curvas"
    ? `Producción acumulada promedio de un pozo según los meses desde que empezó a producir, por año de inicio. A los doce meses, un pozo de ${PG.cos_ult} ` +
      `había sacado ${n0(PG.curva12_ult)} mil barriles de petróleo y uno de ${PG.curvas[0]}, ${n0(PG.curva12_ini)} mil.`
    : `Un pozo petrolero de shale de Vaca Muerta que empezó a producir en ${PG.cos_ult} sacó en promedio ${n0(PG.cos_kbbl_ult)} mil barriles de petróleo en sus primeros doce meses, ` +
      `${n1(PG.cos_veces)} veces lo que uno de ${PG.cos_ini}` +
      (PG.cos_max !== PG.cos_ult ? `. El máximo fue el de los pozos de ${PG.cos_max}, con ${n0(PG.cos_kbbl_max)} mil barriles.` : `, el máximo de la serie.`),
  "mapa-pozos": v => `Desde ${PG.map_ini}, ${n0(PG.map_n)} pozos no convencionales produjeron petróleo o gas, y ${n0(PG.map_activos)} siguieron produciendo en ${PG.map_mes}: ` +
    `${n0(PG.map_shale)} de shale y ${n0(PG.map_tight)} de tight. El ${pct(PG.map_pct_nq)} de los que producen está en Neuquén. Las áreas con más pozos en producción son ` +
    `${lista(PG.map_top_areas.map(([a, n]) => `${tituloArea(a)} (${n0(n)})`))}.` +
    (v === "pais" && PG.map_otras.length ? ` Fuera de la cuenca Neuquina hay pozos no convencionales en producción en ${lista(PG.map_otras.map(([p, n]) => `${p} (${n0(n)})`))}.` : ""),
  // consumo eléctrico de los hogares por provincia (etapa 21, CAMMESA): la Ciudad y la provincia de Buenos Aires van juntas
  "electricidad-provincias": v => {
    if (v === "mes") return `Entre ${e.el_est_desde} y ${e.el_ult}, el mes en que más electricidad consumieron los hogares del país fue ${e.el_mes_max}, con ${n0(e.el_mes_max_kwh)} kWh por habitante, ` +
      `y el de menor consumo, ${e.el_mes_min}, con ${n0(e.el_mes_min_kwh)}.`;
    if (v === "serie") return `En ${e.el_ini}, los hogares consumían ${n0(e.el_pais_ini)} kWh de electricidad por habitante por año, y en ${e.el_ult}, ${n0(e.el_pais)}` +
      (e.el_max_anio === e.el_ult ? ", el valor más alto de la serie." : `. El año de mayor consumo fue ${e.el_max_anio}, con ${n0(e.el_max)}.`) +
      (e.el_min_anio !== e.el_ini ? ` El de menor consumo fue ${e.el_min_anio}, con ${n0(e.el_min)}.` : "");
    const t = e.el_top, b = e.el_bajo;
    return `En ${e.el_ult}, los hogares consumieron ${n0(e.el_pais)} kilovatios hora (kWh) de electricidad por habitante, según la demanda residencial que registra CAMMESA. ` +
      `El consumo más alto fue el de ${t[0]}, con ${n0(t[1])}${conVeces(t[1], e.el_pais)}, y el más bajo, el de ${b[0]}, con ${n0(b[1])}${conVeces(b[1], e.el_pais)}. ` +
      `En ${e.el_res_top[0]}, los hogares fueron el ${pct(e.el_res_top[1])} de la demanda de electricidad, y en ${e.el_res_bajo[0]}, el ${pct(e.el_res_bajo[1])}.`;
  },
  // demanda eléctrica de comercios e industrias por provincia (etapa 23, CAMMESA): por habitante en cada categoría de tarifa y las partes de
  // la demanda de cada provincia. La Ciudad y la provincia de Buenos Aires van juntas, como en los hogares
  "electricidad-sectores": v => {
    const P = e.els_pct, g0 = e.els_gwh_ini, g1 = e.els_gwh_ult;
    // cuánto cambió la demanda de cada categoría en el país desde el primer año
    const cambio = k => { const v = (g1[k] / g0[k] - 1) * 100; return `${v < 0 ? "bajó" : "creció"} ${pct(Math.abs(v))}`; };
    if (v === "partes") return `En ${e.el_ult}, los hogares usaron el ${pct(P.res)} de la electricidad que registra CAMMESA, los comercios y servicios el ${pct(P.com)} ` +
      `y las industrias y los grandes comercios el ${pct(P.ind)}. La parte de las industrias y los grandes comercios va del ${pct(e.els_pct_ind_top[1])} ` +
      `de la demanda en ${e.els_pct_ind_top[0]} al ${pct(e.els_pct_ind_bajo[1])} en ${e.els_pct_ind_bajo[0]}. Entre ${e.el_ini} y ${e.el_ult}, la demanda de los hogares ` +
      `${cambio("res")}, la de los comercios y servicios ${cambio("com")} y la de las industrias y los grandes comercios ${cambio("ind")}.`;
    if (v === "com") {
      const t = e.els_com_top, b = e.els_com_bajo;
      return `En ${e.el_ult}, los comercios, los servicios y el alumbrado público (los usuarios que no son hogares y demandan menos de 300 kW) usaron ${n0(e.els_com)} kWh ` +
        `de electricidad por habitante en el país, el ${pct(P.com)} de la demanda. El valor más alto fue el de ${t[0]}, con ${n0(t[1])}${conVeces(t[1], e.els_com)}, ` +
        `y el más bajo, el de ${b[0]}, con ${n0(b[1])}${conVeces(b[1], e.els_com)}.`;
    }
    const t = e.els_ind_top, b = e.els_ind_bajo;
    return `En ${e.el_ult}, las industrias y los grandes comercios (los que demandan 300 kW o más) usaron ${n0(e.els_ind)} kWh de electricidad por habitante en el país, ` +
      `el ${pct(P.ind)} de la demanda. El valor más alto fue el de ${t[0]}, con ${n0(t[1])}${conVeces(t[1], e.els_ind)}, y el más bajo, el de ${b[0]}, ` +
      `con ${n0(b[1])}${conVeces(b[1], e.els_ind)}.`;
  },
  // salarios de los asalariados registrados privados por provincia (etapa 23, OEDE): el último mes sin aguinaldo o la serie en pesos de igual valor
  salarios: v => {
    if (v === "mes") {
      const max = SA.real_max_mes === SA.real_desde ? `el de su primer mes, ${SA.real_max_mes}` : `el de ${SA.real_max_mes}`;
      return `En pesos de igual valor (descontada la inflación con el índice de precios al consumidor del INDEC), el salario promedio del país de ${SA.mes} fue ` +
        `${pct(Math.abs(SA.real_vs_ini))} ${SA.real_vs_ini < 0 ? "más bajo" : "más alto"} que el de ${SA.real_ini_mes}. El más alto de la serie fue ${max}, ` +
        `con ${n0(SA.real_max)} pesos de ${SA.mes}, y el más bajo, el de ${SA.real_min_mes}, con ${n0(SA.real_min)}. El gráfico no muestra junio ni diciembre, que incluyen el aguinaldo.`;
    }
    return `En ${SA.mes}, el salario bruto promedio de los asalariados registrados del sector privado fue de ${n0(SA.pais)} pesos en el país. ` +
      `El más alto fue el de ${SA.top[0]}, con ${n0(SA.top[1])}${conVeces(SA.top[1], SA.pais)}, y el más bajo, el de ${SA.bajo[0]}, con ${n0(SA.bajo[1])}${conVeces(SA.bajo[1], SA.pais)}. ` +
      `Descontada la inflación, el salario del país ${cambioPct(SA.var_real_12m)} frente a ${SA.ant}, y subió ${deLas24(SA.n_suben)}.`;
  },
  // salario de un maestro de grado con 10 años de antigüedad (etapa 23, Coordinación de Evaluación de Costos Educativos)
  "salario-docente": v => {
    if (v === "serie") return `En pesos de igual valor (con el índice de precios al consumidor del INDEC), el salario promedio de un maestro de grado del país en ${DC.trim} fue ` +
      `${pct(Math.abs(DC.real_vs_ini))} ${DC.real_vs_ini < 0 ? "más bajo" : "más alto"} que en ${DC.real_ini}` +
      (DC.real_max_trim === DC.real_desde ? `. El trimestre más alto de la serie fue el primero, ${DC.real_desde}, y el más bajo, el de ${DC.real_min_trim}.`
        : `. Desde ${DC.real_desde}, el trimestre más alto fue el de ${DC.real_max_trim} y el más bajo, el de ${DC.real_min_trim}.`) + ` Hasta ${DC.fonid_fin} el salario incluía el Fondo Nacional de Incentivo Docente y la conectividad que pagaba la Nación, y desde ${DC.fonid_ini} ` +
      `no los incluye. Entre esos dos trimestres, el promedio del país ${cambioPct(DC.fonid_var)} en pesos de igual valor.`;
    const ex = DC.extra.length === 1 ? ` En ${DC.extra[0][0]}, ese salario incluye una suma extraordinaria de ${n0(DC.extra[0][1])} pesos.`
      : DC.extra.length ? ` En ${lista(DC.extra.map(x => x[0]))}, ese salario incluye sumas extraordinarias.` : "";
    return `En ${DC.trim}, un maestro de grado de primaria con 10 años de antigüedad y jornada simple cobraba un salario bruto de ${n0(DC.pais)} pesos por mes en promedio en el país. ` +
      `El más alto fue el de ${DC.top[0]}, con ${n0(DC.top[1])}${conVeces(DC.top[1], DC.pais)}, y el más bajo, el de ${DC.bajo[0]}, con ${n0(DC.bajo[1])}${conVeces(DC.bajo[1], DC.pais)}.` +
      ex + ` Descontada la inflación, el promedio del país ${cambioPct(DC.var_real_12m)} frente a ${DC.ant}.`;
  },
  // inversión en educación por alumno de gestión estatal (etapa 23, Coordinación de Evaluación de Costos Educativos)
  "inversion-educativa": v => {
    if (v === "pct") return `En ${IE.anio}, la educación fue el ${pct(IE.pct_pais)} del gasto público de las provincias en el total del país. La parte más alta fue la de ` +
      `${IE.pct_top[0]}, con el ${pct(IE.pct_top[1])}, y la más baja, la de ${IE.pct_bajo[0]}, con el ${pct(IE.pct_bajo[1])}.`;
    if (v === "serie") return `En pesos de ${IE.anio} (con el deflactor del PBI), la inversión por alumno de gestión estatal del país pasó de ${n0(IE.real_ini)} en ${IE.ini} a ` +
      `${n0(IE.pais)} en ${IE.anio}. La más alta fue la de ${IE.real_max_anio}, con ${n0(IE.real_max)}, y la más baja, la de ${IE.real_min_anio}, con ${n0(IE.real_min)}.`;
    return `En ${IE.anio}, el Estado invirtió ${n0(IE.pais)} pesos por cada alumno de las escuelas de gestión estatal del país, con lo que gastan las provincias en educación ` +
      `y lo que les transfiere la Nación. El valor más alto fue el de ${IE.top[0]}, con ${n0(IE.top[1])}${conVeces(IE.top[1], IE.pais)}, y el más bajo, el de ${IE.bajo[0]}, ` +
      `con ${n0(IE.bajo[1])}${conVeces(IE.bajo[1], IE.pais)}.`;
  },
  // seguridad (etapa 23, SNIC y SNEEP): delitos por tipo, robos y hurtos, homicidios dolosos y personas privadas de libertad
  delitos: v => {
    const t = SG.total_tasa / SG.total_tasa_ant * 100 - 100;
    if (v === "serie") return `Desde ${SG.anio_ini}, la tasa de robos del país fue la más alta en ${SG.robos_max_anio}, con ${n0(SG.robos_max)} cada 100.000 habitantes, y en ${SG.anio} ` +
      `fue de ${n0(SG.robos)}. Los hurtos pasaron de ${n0(SG.hurtos_ini)} en ${SG.anio_ini} a ${n0(SG.hurtos)} en ${SG.anio}. Las estafas y defraudaciones por medios virtuales, ` +
      `que el SNIC cuenta aparte desde ${SG.estafas_ini}, pasaron de ${n0(SG.estafas_tasa_ini)} a ${n0(SG.estafas_tasa)} cada 100.000 habitantes.`;
    return `En ${SG.anio}, las fuerzas policiales y de seguridad registraron ${n0(SG.total)} delitos en el país, ${n0(SG.total_tasa)} cada 100.000 habitantes, ` +
      `un ${pct(Math.abs(t))} ${t < 0 ? "menos" : "más"} que en ${SG.anio - 1}. Los más frecuentes fueron ${lista(SG.tipos.map(([d, , p]) => `${d.toLowerCase()} (${pct(p)})`))}.`;
  },
  robos: v => {
    const r = SG.robos / SG.robos_ant * 100 - 100, h = SG.hurtos / SG.hurtos_ant * 100 - 100;
    // la Ciudad recibe cada día a muchas personas que viven en otras jurisdicciones: se dice en la misma oración que la nombra
    const deDia = t => t === "CABA" ? ", que cada día recibe a muchas personas que viven en otras jurisdicciones" : "";
    if (v === "serie") return `Desde ${SG.anio_ini}, la tasa de robos del país fue la más alta en ${SG.robos_max_anio}, con ${n0(SG.robos_max)} cada 100.000 habitantes. ` +
      `En ${SG.anio} fue de ${n0(SG.robos)}, y la de hurtos, de ${n0(SG.hurtos)} (en ${SG.anio_ini}, ${n0(SG.robos_ini)} y ${n0(SG.hurtos_ini)}).`;
    if (v === "hurtos") return `En ${SG.anio} se registraron ${n0(SG.hurtos)} hurtos cada 100.000 habitantes en el país, un ${pct(Math.abs(h))} ${h < 0 ? "menos" : "más"} que en ${SG.anio - 1}. ` +
      `La tasa más alta fue la de ${SG.hurtos_top[0]}, con ${n0(SG.hurtos_top[1])}${conVeces(SG.hurtos_top[1], SG.hurtos)}${deDia(SG.hurtos_top[0])}, y la más baja, la de ` +
      `${SG.hurtos_bajo[0]}, con ${n0(SG.hurtos_bajo[1])}${conVeces(SG.hurtos_bajo[1], SG.hurtos)}.`;
    return `En ${SG.anio} se registraron ${n0(SG.robos)} robos cada 100.000 habitantes en el país, un ${pct(Math.abs(r))} ${r < 0 ? "menos" : "más"} que en ${SG.anio - 1}, y la tasa ` +
      `bajó ${deLas24(SG.n_robos_bajan)}. La más alta fue la de ${SG.robos_top[0]}, con ${n0(SG.robos_top[1])}${conVeces(SG.robos_top[1], SG.robos)}${deDia(SG.robos_top[0])}, ` +
      `y la más baja, la de ${SG.robos_bajo[0]}, con ${n0(SG.robos_bajo[1])}${conVeces(SG.robos_bajo[1], SG.robos)}.`;
  },
  homicidios: v => {
    if (v === "serie") return `La tasa de víctimas de homicidios dolosos del país pasó de ${n1(SG.hom_ini)} cada 100.000 habitantes en ${SG.anio_ini} a ${n1(SG.hom_tasa)} en ` +
      `${SG.anio}. La más alta fue la de ${SG.hom_max_anio}, con ${n1(SG.hom_max)}` + (SG.hom_min_anio === SG.anio ? `, y la de ${SG.anio} es la más baja de la serie.` : ".");
    return `En ${SG.anio}, ${n0(SG.hom_victimas)} personas fueron víctimas de homicidios dolosos en el país, ${n1(SG.hom_tasa)} cada 100.000 habitantes: una cada ` +
      `${unoCada(SG.hom_tasa)} habitantes` + (SG.hom_min_anio === SG.anio ? `, la tasa más baja desde ${SG.anio_ini}` : "") + `. El ${pct(SG.hom_varones)} eran varones. ` +
      `Entre ${SG.hom3_desde} y ${SG.anio}, la tasa más alta fue la de ${SG.hom3_top[0]}, con ${n1(SG.hom3_top[1])} por año${conVeces(SG.hom3_top[1], SG.hom3_pais)}, ` +
      `y la más baja, la de ${SG.hom3_bajo[0]}, con ${n1(SG.hom3_bajo[1])}${conVeces(SG.hom3_bajo[1], SG.hom3_pais)}.`;
  },
  carceles: v => {
    if (v === "prov") return `Al 31 de diciembre de ${SG.sn_anio}, la tasa más alta de los servicios penitenciarios provinciales fue la de ${SG.sn_top[0]}, con ${n0(SG.sn_top[1])} ` +
      `personas privadas de libertad cada 100.000 habitantes de la provincia, y la más baja, la de ${SG.sn_bajo[0]}, con ${n0(SG.sn_bajo[1])}. Las cárceles del Servicio ` +
      `Penitenciario Federal alojaban a ${n0(SG.sn_spf)} personas. La Ciudad de Buenos Aires no tiene un servicio penitenciario propio.`;
    return `Al 31 de diciembre de ${SG.sn_anio} había ${n0(SG.sn_personas)} personas privadas de libertad en las cárceles del país, ${n0(SG.sn_tasa)} cada 100.000 habitantes. ` +
      `En ${SG.sn_ini} eran ${n0(SG.sn_personas_ini)}, ${n0(SG.sn_tasa_ini)} cada 100.000. El ${pct(SG.sn_condenados)} tenía una condena, y las demás estaban procesadas, ` +
      `con la causa en trámite, o en otra situación.`;
  },
  // ---- gobierno (etapa 25)
  "cuentas-nacion": v => {
    if (v === "gasto") return `En ${GBN.anio}, el ${pct(GBN.gasto_tipos[0][1])} del gasto primario de la Nación, el que no cuenta los intereses de la deuda, ` +
      `fue en ${inicialMin(GBN.gasto_tipos[0][0])}, el ${pct(GBN.gasto_tipos[1][1])} en ${inicialMin(GBN.gasto_tipos[1][0])} y el ${pct(GBN.gasto_tipos[2][1])} ` +
      `en ${inicialMin(GBN.gasto_tipos[2][0])}, según la Secretaría de Hacienda. Las transferencias de la Nación a cada provincia están en Política, y los ` +
      `subsidios a la energía, en Energía.`;
    return `En ${GBN.anio}, los ingresos del Sector Público Nacional fueron el ${pct(GBN.ingresos)} del PBI y el gasto sin los intereses de la deuda, el ` +
      `${pct(GBN.gasto)}: el resultado primario fue un ${sobra(GBN.primario)} de ${pct(Math.abs(GBN.primario))} del PBI. Después de pagar los intereses ` +
      `(${pct(GBN.intereses)} del PBI), el resultado financiero fue un ${sobra(GBN.financiero)} de ${pct(Math.abs(GBN.financiero))}, según la Secretaría ` +
      `de Hacienda. Desde ${GBN.desde}, el ${sobra(GBN.fin_min)} financiero más grande fue el de ${GBN.fin_min_anio}, ${pct(Math.abs(GBN.fin_min))} del PBI.` +
      (GBN.en_el_anio ? ` Hasta ${GBN.mes}, el resultado primario del año fue un ${sobra(GBN.ytd_primario)} de ${billones(Math.abs(GBN.ytd_primario))}, y el ` +
        `financiero, un ${sobra(GBN.ytd_financiero)} de ${billones(Math.abs(GBN.ytd_financiero))}.` : "");
  },
  recaudacion: v => {
    if (v === "anio") return `En ${GRT.anio}, la recaudación de impuestos nacionales fue el ${pct(GRT.pbi)} del PBI. Desde ${GRT.desde}, el valor más alto ` +
      `fue el de ${GRT.pbi_max_anio}, ${pct(GRT.pbi_max)}, y el más bajo, el de ${GRT.pbi_min_anio}, ${pct(GRT.pbi_min)}. Una parte de lo recaudado se reparte ` +
      `en forma automática con las provincias por la coparticipación.`;
    return `En los doce meses hasta ${GRT.doce_hasta}, la recaudación de impuestos nacionales sumó ${billones(GRT.doce_millones)}: el ${pct(GRT.iva)} fue IVA, ` +
      `el ${pct(GRT.seguridad_social)}, aportes y contribuciones a la seguridad social, y el ${pct(GRT.ganancias)}, Ganancias. Los derechos de exportación ` +
      `aportaron el ${pct(GRT.exportacion)}. Entre enero y ${MESES[GRT.ytd.mes - 1]} de ${GRT.ytd.anio}, descontada la inflación, la recaudación ` +
      `${cambioPct(GRT.ytd.var)} frente a los mismos meses del año anterior.`;
  },
  deuda: () => `Al ${GBD.fecha}, la deuda bruta de la Administración Central era de ${n0(GBD.usd_millones)} millones de dólares, el ${pct(GBD.pct)} ` +
    `del PBI, según la Secretaría de Finanzas. A fin de ${GBD.anio} era el ${pct(GBD.pct_anio)}. Desde ${GBD.desde}, el valor más alto fue el de ` +
    `${GBD.max_anio}, ${pct(GBD.max)}, y el más bajo, el de ${GBD.min_anio}, ${pct(GBD.min)}. Como buena parte de la deuda está en moneda extranjera, el ` +
    `porcentaje sube cuando el peso se devalúa, aunque la deuda en dólares no cambie.`,
  "empleo-publico": v => {
    if (v === "nacion") return `En ${GBC.dot_mes}, la administración pública nacional, las empresas y las sociedades del Estado tenían ${n0(GBC.dot_total)} ` +
      `personas, según el INDEC: ${n0(GBC.dot_adm)} en la administración y ${n0(GBC.dot_emp)} en las empresas y sociedades. Desde ${GBC.dot_desde}, el primer ` +
      `mes de la serie, la dotación ${cambioPct(GBC.dot_var)}: eran ${n0(GBC.dot_total_ini)} personas.`;
    return `En ${GBC.anio}, las administraciones de las provincias y de la Ciudad tenían ${n0(GBC.cargos)} cargos ocupados, ${n1(GBC.cada_1000)} cada 1.000 ` +
      `habitantes, según la Dirección Nacional de Asuntos Provinciales. Iban de ${n1(GBC.bajo[1])} en ${GBC.bajo[0]} a ${n1(GBC.top[1])} en ${GBC.top[0]}` +
      `${conVeces(GBC.top[1], GBC.cada_1000)}. Cuenta cargos, no personas, y no incluye a los municipios ni a las empresas provinciales.`;
  },
  "impuestos-provinciales": () => `En ${GBP.anio}, las provincias y la Ciudad recaudaron ${billones(GBP.millones)} de impuestos propios, ${n0(GBP.pais)} ` +
    `pesos por habitante, según la Dirección Nacional de Asuntos Provinciales. El ${pct(GBP.iibb)} fue de ingresos brutos. Iba de ${n0(GBP.bajo[1])} pesos ` +
    `por habitante en ${GBP.bajo[0]} a ${n0(GBP.top[1])} en ${GBP.top[0]}${conVeces(GBP.top[1], GBP.pais)}.` +
    (GBP.faltan.length ? ` ${lista(GBP.faltan)} no ${GBP.faltan.length > 1 ? "tienen" : "tiene"} datos completos del año.` : ""),
  // refugio (etapa 26): las solicitudes y las personas reconocidas de la CONARE, y las personas refugiadas y solicitantes de asilo de ACNUR
  refugio: v => {
    if (v === "nacionalidad") return `En ${MGR.anio}, las nacionalidades con más solicitudes de refugio fueron la ${MGR.top[0][0].toLowerCase()}, con ` +
      `${n0(MGR.top[0][1])}, la ${MGR.top[1][0].toLowerCase()}, con ${n0(MGR.top[1][1])}, y la ${MGR.top[2][0].toLowerCase()}, con ${n0(MGR.top[2][1])}, ` +
      `según la Comisión Nacional para los Refugiados (CONARE).`;
    if (v === "acnur") {
      const A = MGR.acnur, F = MGR.afuera;
      return `Según ACNUR, que reúne las cifras de cada gobierno, a fines de ${A.anio} vivían en la Argentina ${n0(A.refugiados)} personas refugiadas y ` +
        `${n0(A.solicitantes)} solicitantes de asilo. ACNUR cuenta aparte a ${n0(A.otras)} personas${A.otras_todas && A.otras_origen === "Venezuela" ? " venezolanas" : ""} ` +
        `que no figuran como refugiadas ni como solicitantes pero que probablemente necesitan protección internacional. A la vez, ${n0(F.refugiados)} personas ` +
        `de origen argentino eran refugiadas y ${n0(F.solicitantes)} solicitaban asilo en otros países, sobre todo en ${lista(F.destinos)}.`;
    }
    return `En ${MGR.anio} se presentaron ${n0(MGR.solicitudes)} solicitudes de reconocimiento de la condición de persona refugiada ante la Comisión ` +
      `Nacional para los Refugiados (CONARE), ${MGR.solicitudes === MGR.sol_ant ? "las mismas" : MGR.solicitudes < MGR.sol_ant ? "menos" : "más"} que las ${n0(MGR.sol_ant)} de ${MGR.anio - 1}. El año con ` +
      `más solicitudes desde ${MGR.ini} fue ${MGR.max_anio}, con ${n0(MGR.max)}. En ${MGR.anio}, la CONARE reconoció como refugiadas a ` +
      `${n0(MGR.reconocidas)} personas, contra ${n0(MGR.rec_ant)} en ${MGR.anio - 1}.`;
  },
  // ventas en supermercados (etapa 26): el país con el índice del INDEC, y cada provincia con sus ventas llevadas a pesos de igual valor con
  // el índice de precios de su región
  supermercados: v => {
    if (v === "mes") return `En ${ESU.mes}, las ventas de los supermercados en pesos de igual valor fueron ${pct(Math.abs(ESU.interanual))} ` +
      `${ESU.interanual < 0 ? "menores" : "mayores"} que en ${ESU.mes_ant}, según el INDEC. En los doce meses hasta ${ESU.mes} ` +
      `${ESU.doce < 0 ? "cayeron" : "crecieron"} ${pct(Math.abs(ESU.doce))} frente a los doce anteriores. ` +
      (ESU.vs_max < 0 ? `Sin la estacionalidad, están ${pct(Math.abs(ESU.vs_max))} por debajo de ${ESU.max_mes}, el mes más alto de la serie, que empieza en ${ESU.desde}.`
        : `Sin la estacionalidad, están en el nivel más alto de la serie, que empieza en ${ESU.desde}.`);
    const P = ESU.prov;
    return `En los doce meses hasta ${ESU.mes}, las ventas de los supermercados en pesos de igual valor ${P.pais < 0 ? "cayeron" : "crecieron"} ` +
      `${pct(Math.abs(P.pais))} en todo el país frente a los doce anteriores, con los precios de los bienes de cada región. ` + (P.suben && P.bajan
        ? `Subieron en ${P.suben} jurisdicciones y bajaron en ${P.bajan}: la variación fue de ${conSigno(P.top[1])} en ${P.top[0]} a ${conSigno(P.bajo[1])} en ${P.bajo[0]}.`
        : `${P.suben ? "Subieron" : "Bajaron"} en todas las jurisdicciones, de ${conSigno(P.bajo[1])} en ${P.bajo[0]} a ${conSigno(P.top[1])} en ${P.top[0]}.`);
  },
  // ---- migraciones (etapa 25)
  "nacidos-otro-pais": v => {
    // vista Mapa (etapa 26): los tres departamentos más altos entre los de 10.000 habitantes o más
    if (v === "mapa") return `Por departamento, entre los de ${n0(MGP.min_pob)} habitantes o más, la parte de la población nacida en otro país es más ` +
      `alta en ${depsTop(MGP.top)}. En ${MGP.menos_1} de los ${MGP.n} departamentos del país, menos del 1% de la población nació en otro país.`;
    if (v === "pais") return `Los países de nacimiento más frecuentes de las personas nacidas en otro país que vivían en la Argentina en 2022 eran ` +
      `${lista(MGC.paises.slice(0, 3).map(p => `${p[0]} (${pct(p[2])})`))}, según el Censo. Las nacidas en países limítrofes eran el ${pct(MGC.limitrofes_pct)} ` +
      `de las que declararon su país, y las nacidas en Europa, el ${pct(MGC.europa_pct)}. El ${pct(MGC.no_declarado_pct)} no declaró su país de nacimiento.`;
    return `En el Censo 2022, el ${pct(MGC.pct)} de las personas que vivían en el país había nacido en otro país: ${n0(MGC.personas)} personas. La parte ` +
      `más alta era la de ${MGC.top[0]}, ${pct(MGC.top[1])}${conVeces(MGC.top[1], MGC.pct)}, y la más baja, la de ${lista(MGC.bajos[0])}, ${pct(MGC.bajos[1])}. ` +
      `El país de nacimiento más frecuente era ${MGC.paises[0][0]} en ${MGC.primer_pais_n} de las 24 jurisdicciones.`;
  },
  "migracion-interna": v => v === "mapa" ? `Por departamento, entre los de ${n0(MGP.min_pob)} habitantes o más, la parte de la población nacida en ` +
    `otra provincia es más alta en ${depsTop(MGP.otra_top)}.` +
    (MGP.otra_mitad ? ` En ${MGP.otra_mitad} de los ${MGP.n} departamentos del país, más de la mitad de la población nació en otra provincia.` : "")
    : `En el Censo 2022, el ${pct(MGC.otra_pct)} de las personas que vivían en el país había nacido en otra provincia: ` +
    `${n0(MGC.otra_personas)} personas. La parte más alta era la de ${MGC.otra_top[0]}` + (MGC.otra_top[1] > 50 ? `, donde más de la mitad había nacido en otra ` +
    `provincia: ${pct(MGC.otra_top[1])}` : `, ${pct(MGC.otra_top[1])}`) + `, y la más baja, la de ${lista(MGC.otra_bajos[0])}, ${pct(MGC.otra_bajos[1])}. ` +
    `Y el ${pct(MGC.pct)} había nacido en otro país.`,
  "migracion-historia": () => {
    const lim = T.migracion_censos.map(r => r.limitrofes_pct).filter(v => v != null);
    return `En el primer censo nacional, el de ${MGH.ini}, el ${pct(MGH.ini_pct)} de la población había nacido en otro país. La parte más alta fue la del ` +
      `censo de ${MGH.max_anio}, ${pct(MGH.max_pct)}, y desde entonces bajó: en el Censo 2022 fue el ${pct(MGC.pct)}. Las personas nacidas en países limítrofes ` +
      `fueron en todos los censos entre el ${pct(d3.min(lim))} y el ${pct(d3.max(lim))} de la población. Hasta el censo de 1980, la mayoría de las personas ` +
      `nacidas en otro país venía de Europa, y desde el de 1991, de los países limítrofes: en 2022, el ${pct(MGC.limitrofes_pct)} de las que declararon su país.`;
  },
  radicaciones: v => {
    if (v === "nacionalidad") return `En ${MGD.anio}, las nacionalidades con más residencias otorgadas fueron ${lista(MGD.top.map(t => `la ${t[0].toLowerCase()} ` +
      `(${pct(t[2])})`))}. La Dirección Nacional de Migraciones no publica las residencias por provincia.`;
    return `En ${MGD.anio}, la Dirección Nacional de Migraciones resolvió a favor ${n0(MGD.total)} trámites de residencia: ${n0(MGD.permanentes)} ` +
      `permanentes y ${n0(MGD.temporarias)} temporarias. Fueron ${pct(Math.abs(MGD.var))} ${MGD.var < 0 ? "menos" : "más"} que en el año anterior. Desde ` +
      `${MGD.desde}, el año con más fue ${MGD.max_anio}, con ${n0(MGD.max)}, y el que menos, ${MGD.min_anio}, con ${n0(MGD.min)}` +
      (MGD.min_anio === 2020 ? ", el año de la pandemia." : ".");
  },
  "argentinos-exterior": v => {
    if (v === "pais") return `A mediados de ${MGO.anio}, los destinos más frecuentes de las personas nacidas en la Argentina que vivían en otro país eran ` +
      `${lista(MGO.top.slice(0, 3).map(t => `${t[0]} (${pct(t[2])})`))}, según la estimación de las Naciones Unidas.`;
    return `Según la estimación de las Naciones Unidas, a mediados de ${MGO.anio} vivían en otro país ${n0(MGO.personas)} personas nacidas en la Argentina, ` +
      `${n1(MGO.personas / MGO.personas_ini)} veces las de ${MGO.desde}. En ${MGO.anio_ant} eran ${n0(MGO.personas_ant)}.`;
  },
  // ---- economía y precios (etapa 25): todo del INDEC
  inflacion: v => {
    if (v === "mes") return `En ${EIP.mes}, el índice de precios al consumidor del país ${cambioPct(EIP.mensual)} frente al mes anterior, según el INDEC. ` +
      `Desde ${EIP.m_desde}, la suba de un mes más alta fue la de ${EIP.m_max_mes}, ${pct(EIP.m_max)}, y la más baja, la de ${EIP.m_min_mes}, ${pct(EIP.m_min)}.`;
    if (v === "region") return `En los doce meses hasta ${EIP.mes}, los precios subieron más en ${REG_ART[EIP.reg_max[0]]}, ${pct(EIP.reg_max[1])}, y menos en ` +
      `${REG_ART[EIP.reg_min[0]]}, ${pct(EIP.reg_min[1])}. En todo el país, ${pct(EIP.interanual)}. Las regiones del INDEC son grupos de ciudades donde se relevan ` +
      `los precios, no provincias.`;
    const dic = EIP.periodo.endsWith("-12");
    return `En ${EIP.mes}, el índice de precios al consumidor del país ${cambioPct(EIP.mensual)} frente al mes anterior y ${yCambio(EIP.mensual, EIP.interanual)} frente a ` +
      `${EIP.mes_ant}, según el INDEC. ` + (dic ? "" : `En lo que va del año, ${cambioPct(EIP.en_el_anio)}, y en ${EIP.anio_ult}, de diciembre a diciembre, ` +
      `la inflación fue de ${pct(EIP.anual)}. `) + `Desde ${EIP.ia_desde}, la variación en doce meses más alta fue la de ${EIP.ia_max_mes}, ${pct(EIP.ia_max)}, ` +
      `y la más baja, la de ${EIP.ia_min_mes}, ${pct(EIP.ia_min)}.`;
  },
  "inflacion-rubros": v => {
    if (v === "categoria") return `En los doce meses hasta ${EIP.mes}, los precios regulados, los que están sujetos a regulación o tienen un alto componente de ` +
      `impuestos, ${cambioPl(EIP.regulados)}, los estacionales, que cambian con la temporada, ${cambioPl(EIP.estacionales)}, y los demás, la inflación núcleo, ` +
      `${cambioPl(EIP.nucleo)}, según el INDEC. Los precios de los servicios ${cambioPl(EIP.servicios)} y los de los bienes, ${pct(EIP.bienes)}. El nivel ` +
      `general, ${pct(EIP.interanual)}.`;
    return `En los doce meses hasta ${EIP.mes}, el rubro con la suba más alta fue ${inicialMin(EIP.div_max[0])}, ${pct(EIP.div_max[1])}, y el de la más baja, ` +
      `${inicialMin(EIP.div_min[0])}, ${pct(EIP.div_min[1])}, según el INDEC.` + (/^Alimentos/.test(EIP.div_max[0] + EIP.div_min[0]) ? "" :
      ` Los alimentos y las bebidas no alcohólicas ${cambioPl(EIP.div_alim)}.`) + ` El nivel general, ${pct(EIP.interanual)}.`;
  },
  canastas: v => {
    const base = `En ${ECB.mes}, un hogar de cuatro integrantes del Gran Buenos Aires (un varón de 35 años, una mujer de 31, un hijo de 6 y una hija de 8) ` +
      `necesitaba ${n0(ECB.cbt_hogar)} pesos por mes para no quedar bajo la línea de pobreza, el valor de su canasta básica total según el INDEC, y ` +
      `${n0(ECB.cba_hogar)} para no quedar bajo la línea de indigencia, el de su canasta básica alimentaria. `;
    if (v === "precios") return base + `En doce meses, la canasta básica total ${cambioPct(ECB.ia_cbt)} y la alimentaria ${cambioPct(ECB.ia_cba)}, ` +
      `y los precios del Gran Buenos Aires, ${pct(ECB.ia_ipc_gba)}.`;
    return base + `Por adulto equivalente, en ${ECB.reg_mes}, el último mes del informe semestral del INDEC, la canasta básica total iba de ` +
      `${n0(ECB.reg_min[1])} pesos en ${REG_ART[ECB.reg_min[0]]} a ${n0(ECB.reg_max[1])} en ${REG_ART[ECB.reg_max[0]]}.`;
  },
  "salario-real": () => `En los doce meses hasta ${ESR.mes}, según el índice de salarios del INDEC, el salario de los asalariados registrados del sector ` +
    `privado ${cambioPct(ESR.nom_priv)} y el del sector público, ${pct(ESR.nom_pub)}, y los precios subieron ${pct(ESR.ipc)}. Descontada la inflación, el ` +
    `salario registrado privado ${cambioPct(ESR.real_priv)} y el público ${cambioPct(ESR.real_pub)}. Frente a ${ESR.base}, en pesos de igual valor, el privado ` +
    `está ${pct(Math.abs(ESR.vs_base_priv))} ${ESR.vs_base_priv < 0 ? "más bajo" : "más alto"} y el público, ${pct(Math.abs(ESR.vs_base_pub))} ` +
    `${ESR.vs_base_pub < 0 ? "más bajo" : "más alto"}. El salario privado registrado más alto de la serie, descontada la inflación, fue el de ${ESR.max_priv_mes} ` +
    `y el más bajo, el de ${ESR.min_priv_mes}.`,
  emae: v => {
    if (v === "sector") return `En los doce meses hasta ${EMA.mes}, frente a los doce anteriores, crecieron ${EMA.sec_suben} de los 15 sectores de la economía, ` +
      `según el INDEC. Los que más crecieron fueron ${EMA.sec_max[0]}, ${pct(EMA.sec_max[1])}, ${yE(EMA.sec_max2[0])}, ${pct(EMA.sec_max2[1])}. ` +
      (EMA.sec_min[1] < 0 ? `El que más cayó fue ${EMA.sec_min[0]}, ${pct(-EMA.sec_min[1])}.` : `El que menos creció fue ${EMA.sec_min[0]}, ${pct(EMA.sec_min[1])}.`) +
      ` Toda la economía, ${pct(EMA.doce)}.`;
    return `En ${EMA.mes}, la actividad económica ${cambioPct(EMA.interanual)} frente a ${EMA.mes_ant} y ${yCambio(EMA.interanual, EMA.mensual_desest)} frente al mes anterior, ` +
      `sin el efecto de la época del año, según el Estimador Mensual de Actividad Económica del INDEC. En lo que va del año ${cambioPct(EMA.en_el_anio.var)} ` +
      `frente a los mismos meses del año anterior, y en los últimos doce meses, ${cambioPct(EMA.doce)}. En ${EMA.anio_ult}, ${cambioPct(EMA.anual)}.`;
  },
  // precios de los combustibles en el surtidor (etapa 21): la mediana de las estaciones, por provincia o mes a mes en pesos del último mes,
  // y desde la etapa 22 año por año desde el primer año completo de la Resolución 1104/2004, en pesos del último año con deflactor
  combustibles: (p, v) => {
    const nom = p === "gasoil" ? "el gasoil" : "la nafta súper", nomDe = p === "gasoil" ? "del gasoil" : "de la nafta súper", alto = CB[p + "_alto"], bajo = CB[p + "_bajo"];
    if (v === "anio") {
      // el último año contra el más caro y el más barato, sin nombrar dos veces el mismo año
      const a = CB.anual_ult, ini = CB.anual_ini, maxA = CB[p + "_anual_max_anio"], minA = CB[p + "_anual_min_anio"], ps = x => `${n0(x)} pesos`;
      const ext = [maxA !== a ? `el año más caro fue ${maxA}, con ${ps(CB[p + "_anual_max"])} por litro` : "",
        minA !== a ? `el más barato fue ${minA}, con ${ps(CB[p + "_anual_min"])}` : ""].filter(Boolean);
      return `En ${a}, el litro ${nomDe} costó en promedio ${ps(CB[p + "_anual"])} en el surtidor (el promedio de la mediana de cada mes)` +
        (a === maxA ? `, el precio más alto desde ${ini} en pesos de igual valor` : a === minA ? `, el precio más bajo desde ${ini} en pesos de igual valor` : "") + "." +
        (ext.length ? ` En pesos de ${a}, ${ext.join(", y ")}.` : "") +
        (ini !== maxA && ini !== minA ? ` En ${ini}, el primer año completo de la serie, costaba ${ps(CB[p + "_anual_real_ini"])}.` : "");
    }
    // el máximo en pesos del último mes se nombra una sola vez: puede ser el primer mes, el último u otro
    const mx = CB[p + "_max_real_mes"];
    if (v === "mes") return `En pesos de ${CB.mes}, el precio mediano ${nomDe} en el surtidor pasó de ${n0(CB[p + "_ini_real"])} pesos por litro en ${CB.ini}` +
      `${mx === CB.ini ? ", el más alto de la serie," : ""} a ${n0(CB[p])} en ${CB.mes}${mx === CB.mes ? ", el más alto de la serie" : ""}.` +
      (mx !== CB.ini && mx !== CB.mes ? ` El más alto fue el de ${mx}, con ${n0(CB[p + "_max_real"])} pesos.` : "");
    return `En ${CB.mes}, la mitad de las estaciones de servicio del país vendía ${nom} a más de ${n0(CB[p])} pesos por litro y la otra mitad, a menos. ` +
      `La mediana más alta fue la de ${alto[0]} (${n0(alto[1])}) y la más baja, la de ${bajo[0]} (${n0(bajo[1])}). ` +
      `Frente a ${CB.mes_antes}, el precio ${CB[p + "_var"] >= 0 ? "subió" : "bajó"} ${pct(Math.abs(CB[p + "_var"]))}: descontada la inflación, ${CB[p + "_var_real"] >= 0 ? "subió" : "bajó"} ${pct(Math.abs(CB[p + "_var_real"]))}.`;
  },
  // subsidios económicos a la energía (etapa 21): la serie oficial de la Secretaría de Hacienda
  subsidios: v => {
    const pbi = x => n2(x) + "%", y = e.sub_ytd;
    const ytd = y ? ` Entre enero y ${MESES[y.mes - 1]} de ${y.anio} sumaron un ${pct(Math.abs(y.var))} ${y.var < 0 ? "menos" : "más"} que en los mismos meses de ${y.anio - 1}, en pesos de igual valor.` : "";
    // el año del dato contra el máximo y el mínimo de la serie, sin repetir un año que ya se nombró
    const ext = (a, maxA, maxV, minA, minV, f) => (a === minA ? `, el valor más bajo de la serie, que empieza en ${e.sub_ini}` : a === maxA ? `, el valor más alto de la serie, que empieza en ${e.sub_ini}` : "") + "." +
      (maxA !== a ? ` El más alto fue el de ${maxA}${maxA === e.sub_ini ? ", el primer año" : ""}, con ${f(maxV)}` + (minA !== a ? `, y el más bajo, el de ${minA}, con ${f(minV)}.` : ".")
        : minA !== a ? ` El más bajo fue el de ${minA}, con ${f(minV)}.` : "");
    return v === "pesos"
      ? `En pesos de ${e.sub_ult}, los subsidios económicos a la energía que registra la Secretaría de Hacienda sumaron ${n0(e.sub_ult_real)} miles de millones en ${e.sub_ult}` +
        ext(e.sub_ult, e.sub_real_max_anio, e.sub_real_max, e.sub_real_min_anio, e.sub_real_min, x => n0(x) + " miles de millones") + ytd
      : `En ${e.sub_pbi_anio}, los subsidios económicos a la energía que registra la Secretaría de Hacienda fueron el ${pbi(e.sub_pbi)} del producto interno bruto` +
        ext(e.sub_pbi_anio, e.sub_pbi_max_anio, e.sub_pbi_max, e.sub_pbi_min_anio, e.sub_pbi_min, x => "el " + pbi(x)) + ytd;
  },
  "gas-consumo": v => {
    if (v === "mes") return `Entre ${e.gas_est_desde} y ${e.gas_est_hasta}, un usuario residencial consumió en promedio ${n0(e.gas_mes_max_m3)} metros cúbicos de gas en ${e.gas_mes_max} ` +
      `y ${n0(e.gas_mes_min_m3)} en ${e.gas_mes_min}: ${n1(e.gas_mes_max_m3 / e.gas_mes_min_m3)} veces más en el mes de mayor consumo.` +
      (e.gas_ytd ? ` Entre enero y ${MESES[e.gas_ytd.mes - 1]} de ${e.gas_ytd.anio} consumió ${n0(e.gas_ytd.m3)} metros cúbicos, ${pct(Math.abs(e.gas_ytd.var))} ${e.gas_ytd.var < 0 ? "menos" : "más"} que en los mismos meses de ${e.gas_ytd.anio - 1}.` : "");
    if (v === "serie") return `En ${e.gas_ini}, un usuario residencial consumía en promedio ${n0(e.gas_pais_ini)} metros cúbicos de gas por año, y en ${e.gas_anio}, ${n0(e.gas_pais)}. ` +
      `El año de mayor consumo fue ${e.gas_max_anio}, con ${n0(e.gas_max)}, y el de menor, ${e.gas_min_anio}, con ${n0(e.gas_min)}. ` +
      `En el mismo período, los usuarios residenciales pasaron de ${n1(e.gas_usuarios_ini / 1e6)} a ${n1(e.gas_usuarios / 1e6)} millones.`;
    const t = e.gas_top;
    return `En ${e.gas_anio}, un usuario residencial de gas natural consumió en promedio ${n0(e.gas_pais)} metros cúbicos. En ${t[0][0]} el promedio fue de ${n0(t[0][1])}, ` +
      `${n1(e.gas_veces_top)} veces el del país, y le siguieron ${t[1][0]} (${n0(t[1][1])}) y ${t[2][0]} (${n0(t[2][1])}). El más bajo fue el de ${e.gas_bajo[0]} (${n0(e.gas_bajo[1])}). ` +
      `Las cinco provincias patagónicas tienen el ${pct(e.gas_pat_usuarios)} de los usuarios residenciales y recibieron el ${pct(e.gas_pat_gas)} de su gas.`;
  },
  centrales: v => v === "potencia"
    ? `En ${e.pot_anio} el país tenía ${n0(e.pot_total)} megavatios de potencia eléctrica instalada: ${pct(e.pot_pct.termica)} térmica, ${pct(e.pot_pct.hidraulica)} hidráulica, ` +
      `${pct(e.pot_pct.nuclear)} nuclear, ${pct(e.pot_pct.eolica)} eólica y ${pct(e.pot_pct.solar)} solar. La eólica y la solar sumaban ${n0(e.pot_renov_ult)} megavatios, ` +
      `el ${pct(e.pot_pct_renov_ult)} del total, contra ${n0(e.pot_renov_ini)} megavatios (${pct(e.pot_pct_renov_ini)}) en ${e.pot_ini}.`
    : `El listado de centrales de la Secretaría de Energía, actualizado en ${e.cen_fecha}, tiene ${n0(e.cen_n)} centrales: ${n0(e.cen_tec["Térmica"])} térmicas, ` +
      `${n0(e.cen_tec["Solar"])} solares, ${n0(e.cen_tec["Eólica"])} eólicas, ${n0(e.cen_tec["Hidroeléctrica"])} hidroeléctricas, ${n0(e.cen_tec["Biomasa y biogás"])} de biomasa o biogás ` +
      `y ${n0(e.cen_tec["Nuclear"])} nucleares. La provincia con más centrales eólicas es ${e.cen_top_eol[0]} (${n0(e.cen_top_eol[1])}) y la que tiene más solares, ` +
      `${e.cen_top_sol[0]} (${n0(e.cen_top_sol[1])}).`,
  "obra-publica": v => v === "serie"
    ? `En pesos de ${CN.op_ult}, la Nación invirtió ${n0(CN.op_total)} miles de millones en obra pública en ${CN.op_ult}: ${n0(CN.op_obras)} en obras propias y ${n0(CN.op_transf)} en transferencias de capital a provincias y municipios. ` +
      `El máximo de la serie fue en ${CN.op_max_anio}, con ${n0(CN.op_max)} miles de millones, y el mínimo, en ${CN.op_min_anio}, con ${n0(CN.op_min)}.` +
      (CN.op_min_anio !== CN.op_ult - 1 ? ` En ${CN.op_ult - 1} había sido de ${n0(CN.op_ant)} miles de millones.` : "")
    : `En ${CN.op_ult}, la obra pública de la Nación con provincia asignada sumó ${n0(CN.op_hab_pais)} pesos por habitante. ${CN.op_top[0]} recibió la mayor inversión por habitante, ${n0(CN.op_top[1])} pesos${conVeces(CN.op_top[1], CN.op_hab_pais)}, ` +
      `y ${CN.op_bajo[0]} la menor, ${n0(CN.op_bajo[1])}${conVeces(CN.op_bajo[1], CN.op_hab_pais)}. La Dirección Nacional de Vialidad ejecutó el ${pct(CN.op_vialidad_pct)} de las obras propias de la Nación, y el ${pct(CN.op_sin_pct)} de esas obras no tiene una provincia asignada.`,
  insumos: v => v === "var_ytd"
    ? `Entre enero y ${CN.ins_mes}, el consumo aparente subió en ${T.isac_insumos.filter(r => r.var_ytd > 0).length} de los ${CN.ins_n} insumos que sigue el ISAC frente a los mismos meses del año anterior. ` +
      `El que más creció fue ${NOMBRE_INS([...T.isac_insumos].sort((a, b) => b.var_ytd - a.var_ytd)[0].territorio)} (${masPct(d3.max(T.isac_insumos, r => r.var_ytd))}) y el que más cayó, ${NOMBRE_INS([...T.isac_insumos].sort((a, b) => a.var_ytd - b.var_ytd)[0].territorio)} (${masPct(d3.min(T.isac_insumos, r => r.var_ytd))}).`
    : `En los doce meses hasta ${CN.ins_mes}, el consumo aparente subió en ${CN.ins_suben} de los ${CN.ins_n} insumos que sigue el ISAC frente a los doce meses anteriores. ` +
      `El que más creció fue ${NOMBRE_INS(CN.ins_top)} (${masPct(CN.ins_top_v)}) y el que más cayó, ${NOMBRE_INS(CN.ins_low)} (${masPct(CN.ins_low_v)}). El consumo aparente de cemento portland varió ${masPct(CN.cemento_12m)}.`,
  "empleo-construccion": v => `En el ${CN.emp_trim} había ${n0(CN.emp_total)} puestos asalariados registrados en la construcción privada, el ${pct(CN.emp_pct)} del empleo privado registrado y ${n1(CN.emp_cada_1000)} cada 1.000 habitantes. ` +
    `Frente al ${CN.emp_trim_ant}, los puestos ${creceCae(CN.emp_var, "crecieron", "cayeron")}` +
    (v === "var_construccion" ? ` y ${CN.emp_suben} de las 24 jurisdicciones tuvieron más que un año antes.` : v === "serie" ? `. El máximo de la serie fue de ${n0(CN.emp_max)} puestos, en el ${CN.emp_max_trim}.` :
      `. ${CN.emp_top} tenía ${n1(CN.emp_top_v)} cada 1.000 habitantes${conVeces(CN.emp_top_v, CN.emp_cada_1000)} y ${CN.emp_low}, ${n1(CN.emp_low_v)}${conVeces(CN.emp_low_v, CN.emp_cada_1000)}.`),
};
const RO = R.rotacion, trim = t => `${["primer", "segundo", "tercer", "cuarto"][t[1] - 1]} trimestre de ${t[0]}`;
// casos distorsionados por el lugar de registro o por un error de la fuente (datos/manual/distorsiones.json): el motivo va en
// la misma oración que nombra el máximo, o el caso queda fuera del máximo
const DIST = R.distorsiones || {};
const aclara = (clave, terr) => DIST[clave]?.[terr]?.accion === "aclarar" ? ` (${DIST[clave][terr].motivo})` : "";
// en las tarjetas (perfil, "En cifras" y el mapa de la portada) va la versión corta del motivo, si el indicador tiene un caso distorsionado
const notaDist = (c, cod) => { const d = c.dist && DIST[c.dist]?.[NOMBRES[cod]]; return d ? d.corto || d.motivo : ""; };
const sinContar = (clave, terrs) => terrs.length ? `, sin contar ${terrs.join(" y ")}: ${terrs.map(t => DIST[clave][t].motivo).join(". ")}` : "";
const TX = {
  // ---- construcción y vivienda (etapa 18)
  isac: `En ${CN.isac_mes}, la actividad de la construcción medida por el ISAC ${creceCae(CN.isac_var)} frente al mismo mes del año anterior. ` +
    `Entre enero y ${MESES[CN.isac_ytd.mes - 1]} de ${CN.isac_ytd.anio} ${creceCae(CN.isac_ytd.var)} contra los mismos meses de ${CN.isac_ytd.anio - 1}. ` +
    `Sin el efecto de la estacionalidad, ${creceCae(CN.isac_mes_desest)} frente al mes anterior y ${creceCae(CN.isac_3m)} entre ${CN.isac_3m_desde} y ${CN.isac_mes} contra los tres meses anteriores. ` +
    `El índice sin estacionalidad está ${pct(Math.abs(CN.isac_dif_max))} ${CN.isac_dif_max < 0 ? "por debajo" : "por encima"} del máximo de la serie, de ${CN.isac_max_mes}.`,
  permisos: `En ${CN.per_mes}, los permisos de edificación de ${CN.per_municipios} municipios autorizaron ${n0(CN.per_m2 / 1000)} mil metros cuadrados para construir` +
    (CN.per_var != null ? `, ${pct(Math.abs(CN.per_var))} ${CN.per_var < 0 ? "menos" : "más"} que en el mismo mes del año anterior` : "") +
    `. Entre enero y ${MESES[CN.per_ytd.mes - 1]} de ${CN.per_ytd.anio} la superficie autorizada ${creceCae(CN.per_ytd.var)} contra los mismos meses de ${CN.per_ytd.anio - 1}, ` +
    `y en los últimos doce meses, con ${n1(CN.per_12m)} millones de metros cuadrados, ${creceCae(CN.per_12m_var)} contra los doce anteriores.`,
  "permisos-nota": `Superficie cubierta que registran los permisos de edificación de obras privadas, nuevas y ampliaciones, en una nómina de ${CN.per_municipios} municipios que elige el INDEC, en miles de metros cuadrados. ` +
    `No es el total del país y no se publica por provincia. El INDEC armó la serie desde ${CN.per_desde} con la nómina actual: las de nóminas anteriores son otras muestras y no se pueden unir con ella. ` +
    `Los últimos meses son provisorios. El promedio de doce meses suaviza los saltos de un mes a otro.`,
  hipotecas: `En ${CN.hip_mes}, los bancos otorgaron ${n0(CN.hip_ult)} mil millones de pesos en créditos hipotecarios UVA` +
    (CN.hip_var != null ? `, ${pct(Math.abs(CN.hip_var))} ${CN.hip_var < 0 ? "menos" : "más"} que en el mismo mes del año anterior en pesos de igual valor` : "") +
    `, con una tasa promedio de ${n1(CN.hip_tasa)}% anual más la actualización de la UVA. El mes con más créditos fue ${CN.hip_max_mes}, con ${n0(CN.hip_max)} mil millones en pesos de ${CN.hip_mes}. ` +
    `En todo ${CN.hip_anio} sumaron ${n0(CN.hip_anual)} mil millones` + (CN.hip_anual_max_anio !== CN.hip_anio ? `, contra ${n0(CN.hip_anual_max)} en ${CN.hip_anual_max_anio}, el año con más créditos,` : `, el año con más créditos,`) +
    ` y ${n0(CN.hip_anual_min)} en ${CN.hip_anual_min_anio}, el año con menos.`,
  "hipotecas-nota": `Préstamos hipotecarios en unidades de valor adquisitivo (UVA) que los bancos acordaron cada mes con personas y empresas, según el Banco Central, en miles de millones de pesos de ${CN.hip_mes}, ` +
    `llevados con el índice de precios al consumidor del INDEC, que empieza en diciembre de 2016. La tasa es el promedio de las del mes, ponderado por el monto de cada préstamo. No incluye los créditos hipotecarios en pesos sin UVA ni los en dólares. ` +
    `El Banco Central no publica los créditos hipotecarios por provincia: su estadística de préstamos por localidad no los separa del resto y asigna cada préstamo a la sucursal que lo otorga.`,
  "obra-publica": LEAD["obra-publica"]("prov"),
  "obra-publica-nota": `Crédito devengado de la Administración Pública Nacional, según Presupuesto Abierto, en pesos de ${CN.op_ult} con el deflactor del producto interno bruto. ` +
    `Las obras propias son las construcciones que paga la Nación, como rutas, diques o edificios, incluidas las de participación público-privada. Las transferencias de capital son los fondos que la Nación da a provincias y municipios para sus propias obras y equipos, ` +
    `y también forman parte de las transferencias "otras no automáticas" de la sección Política. Cada gasto se asigna a la provincia donde está la obra: las que abarcan varias provincias o todo el país quedan sin provincia y se cuentan solo en el total del país. ` +
    `Por habitante, con la población de cada año. No incluye lo que la Nación transfiere para obras a empresas del Estado y fondos fiduciarios, que no figuran con su provincia.`,
  "isac-nota": `El ISAC del INDEC sigue la actividad de la construcción con el consumo aparente de un conjunto de insumos, como cemento, hierro, ladrillos, asfalto y pinturas: lo que se despacha al mercado interno de la producción nacional más lo que se importa. ` +
    `Es un índice con base 2004 = 100. La serie sin estacionalidad saca los movimientos que se repiten todos los años en los mismos meses, como los de las vacaciones, y sirve para comparar un mes con el anterior. Como un solo mes puede moverse mucho, el texto suma la comparación de los tres últimos meses con los tres anteriores, la que usa la oficina de estadística del Reino Unido para la construcción. ` +
    `Desde ${CN.isac_ini}, el promedio anual más alto fue el de ${CN.isac_anual_max} y el más bajo, el de ${CN.isac_anual_min}. En ${CN.isac_anio_ult} el promedio fue ${n1(CN.isac_anual_ult)}, contra ${n1(CN.isac_anual_ant)} el año anterior.`,
  insumos: LEAD.insumos("var_12m"),
  "insumos-nota": `Variación del consumo aparente de cada insumo (lo despachado al mercado interno de la producción nacional más lo importado), medida con su índice del ISAC (base 2004 = 100): los doce meses hasta ${CN.ins_mes} contra los doce anteriores, o lo que va del año contra los mismos meses del año anterior. ` +
    `El INDEC publica juntos la grifería, los tubos de acero sin costura y el vidrio plano, porque por el secreto estadístico no puede difundir sus variaciones por separado.`,
  "empleo-construccion": LEAD["empleo-construccion"]("construccion_cada_1000"),
  fracturas: LEAD.fracturas("etapas"),
  "fracturas-nota": `Fracturas que las empresas informan a la Secretaría de Energía (Adjunto IV), contadas por el año en que empezó cada una, en formaciones no convencionales. ` +
    `Las empresas informan con demora, así que las de ${PG.fr_ult} todavía pueden sumar más. La rama horizontal y las etapas por pozo son promedios de los pozos de Vaca Muerta ` +
    `según el año de su primera fractura, y la rama cuenta solo los pozos que la informan. La fuente aclara que son datos preliminares, sujetos a revisión.`,
  "pozos-terminados": LEAD["pozos-terminados"]("anio"),
  "gas-consumo": LEAD["gas-consumo"]("prov"),
  "gas-consumo-nota": `Gas que las distribuidoras entregaron en el año a sus usuarios residenciales (domiciliarios), dividido por el promedio de esos usuarios, según los datos operativos del ENARGAS. ` +
    `El ENARGAS cuenta clientes y no hogares: un edificio con caldera central para calefacción o agua caliente es un solo usuario, y los usuarios de las subdistribuidoras, que llevan el gas desde la red de una distribuidora hasta un grupo de usuarios, no figuran. ` +
    `Es el gas entregado en cada mes, que no coincide exactamente con el facturado. El consumo depende del clima de cada lugar y de lo frío que sea cada invierno, y también de la tarifa: ` +
    `la Patagonia, el departamento de Malargüe y la Puna tienen el régimen de zona fría (ver Para entender los datos). ` +
    (e.gas_chicas.length ? `${lista(e.gas_chicas.map(([t, u]) => `${t} (${n0(u)} usuarios)`))} ${e.gas_chicas.length > 1 ? "tienen" : "tiene"} menos de ${n0(e.gas_min_usuarios)} usuarios residenciales ` +
      `y no se ${e.gas_chicas.length > 1 ? "comparan" : "compara"}. ` : "") +
    (e.gas_sin.length ? `${lista(e.gas_sin)} no ${e.gas_sin.length > 1 ? "figuran" : "figura"} en los datos de las distribuidoras. ` : "") +
    `Para tener una referencia, en Gran Bretaña un medidor residencial consumió en promedio ${n0(e.gas_ru.kwh)} kilovatios hora de gas en ${e.gas_ru.anio}, con la corrección por clima de su fuente, ` +
    `el Departamento de Seguridad Energética y Cero Neto del Reino Unido: unos ${n0(e.gas_ru.m3)} metros cúbicos de gas de 9.300 kilocalorías, en una conversión aproximada.` +
    (e.gas_ru.ar ? ` Ese año, un usuario residencial de la Argentina consumió ${n0(e.gas_ru.ar)} metros cúbicos.` : ""),
  centrales: LEAD.centrales("mapa"),
  "centrales-nota": `Centrales del listado de la Secretaría de Energía, con datos de CAMMESA, actualizado en ${e.cen_fecha}. El tamaño de cada círculo es su potencia, y las ` +
    `${n0(e.cen_sin_pot)} centrales que no la informan (${n0(e.cen_mem_sin_pot)} de ellas conectadas al mercado eléctrico mayorista) van como círculos vacíos: por eso la potencia no se suma ` +
    `por provincia. La potencia del país es la que publica CAMMESA para cada año, por tecnología: la térmica reúne ciclos combinados, turbinas a gas, turbinas de vapor y motores diésel, ` +
    `y la hidráulica incluye las centrales de menos de 50 megavatios.`,
  subsidios: LEAD.subsidios("pbi"), "subsidios-nota": `Gasto corriente en subsidios económicos a la energía del Sector Público Nacional no Financiero, en base caja, ` +
    `según el Informe Mensual de Ingresos y Gastos que la Secretaría de Hacienda publica desde ${e.sub_ini}. Es la serie oficial tal como la publica Hacienda: el sitio no arma su propia definición de subsidio. ` +
    `El PBI es el del INDEC a precios corrientes. Los pesos de ${e.sub_ult} usan el deflactor del PBI, y la comparación de lo que va del año, el índice de precios al consumidor del INDEC. ` +
    `La Oficina de Presupuesto del Congreso sigue los subsidios con otro criterio (cuenta los gastos devengados de la Administración Nacional), y sus cifras pueden diferir.`,
  "mapa-pozos": LEAD["mapa-pozos"]("cuenca"),
  "mapa-pozos-nota": `Cada punto es un pozo no convencional que produjo petróleo o gas alguna vez, según la producción por pozo del Capítulo IV, en la ubicación que informa ` +
    `la Secretaría de Energía (en unos pocos pozos la latitud y la longitud vienen cambiadas y se corrigen). El color dice el año en que empezó a producir, y los que no produjeron en ` +
    `${PG.map_mes} van más claros. Las áreas son las concesiones de explotación, con una geometría simplificada: al pasar el mouse por un área se ve lo que produjo en ${PG.areas_anio}. ` +
    `La vista de la cuenca Neuquina abarca Neuquén, Río Negro, Mendoza y La Pampa.`,
  productividad: LEAD.productividad("pozo"),
  "productividad-nota": `Pozos de shale de Vaca Muerta que la producción por pozo del Capítulo IV clasifica como petrolíferos, según el año del primer mes con producción. ` +
    `El primer año son los doce meses desde ese inicio, y los meses sin declaración cuentan como cero. Van solo los años de inicio en los que todos los pozos ya tienen doce meses de historia ` +
    `(los datos llegan a ${MESES[+PG.cos_ult_nc.slice(5, 7) - 1]} de ${PG.cos_ult_nc.slice(0, 4)}). La rama horizontal sale de los datos de fractura: por cada 1.000 metros cuentan los pozos que la informan, desde ${PG.rama_desde}, ` +
    `el primer año con al menos 50. Las curvas siguen a cada año de inicio mientras al menos el 80% de sus pozos tiene esos meses de historia.`,
  "pozos-terminados-nota": `Pozos terminados por tipo, según la Secretaría de Energía. Por provincia, los doce meses más recientes, entre ${PG.pt_v_desde} y ${PG.pt_mes}.` +
    (T.pozos_terminados_provincias.some(r => r.codigo_indec === "mar") ? ` "Mar argentino" son los pozos del mar a más de doce millas de la costa, de jurisdicción nacional.` : ""),
  "empleo-construccion-nota": `Asalariados registrados del sector privado en la construcción (rama 45 de la clasificación de actividades), según el SIPA, en promedio del trimestre. ` +
    `El SIPA asigna cada puesto a la provincia donde declara el empleador, no donde está la obra: una empresa con sede en la Ciudad que construye en otra provincia suma en la Ciudad. ` +
    `No incluye a quienes trabajan por su cuenta ni el empleo no registrado: el Censo 2022 contó ${n0(CN.viv_abs.constructores)} personas ocupadas en la construcción, con o sin registro (ver la ficha de abajo). ` +
    `La población es la proyección ${R.anio_pob} del INDEC. La provincia de Buenos Aires suma los partidos del Gran Buenos Aires y el resto de la provincia, que el OEDE publica por separado.`,
  trabajadores: `En el Censo 2022, ${n0(CN.viv_abs.constructores)} personas dijeron trabajar en la construcción: el ${pct(VV.pct_ocupados_construccion)} de las personas ocupadas que informaron la rama de actividad. ` +
    `La proporción va del ${pct(CN.viv_top.pct_ocupados_construccion[1])} en ${CN.viv_top.pct_ocupados_construccion[0]} al ${pct(CN.viv_low.pct_ocupados_construccion[1])} en ${CN.viv_low.pct_ocupados_construccion[0]}.`,
  "trabajadores-nota": `Personas ocupadas según la actividad de la empresa, el negocio o la institución donde trabajan, contadas en el lugar donde viven y no donde está la obra. ` +
    `Incluye a asalariados con y sin registro, a quienes trabajan por su cuenta y a patrones. El porcentaje se calcula sobre las personas ocupadas con la rama informada: el ${pct(VV.pct_sin_rama)} no respondió o su respuesta no alcanzó para clasificarla. ` +
    `En el mapa, el color divide a los departamentos en cinco grupos del mismo tamaño. Si elegís una provincia en Tu provincia, el mapa se acerca a ella.`,
  costo: `En los doce meses hasta ${CN.costo_mes}, el costo de construir en el Gran Buenos Aires subió ${pct(CN.icc_12)} y los precios al consumidor, ${pct(CN.ipc_12)}. Los materiales subieron ${pct(CN.mat_12)} y la mano de obra, ${pct(CN.mo_12)}. ` +
    `Medido contra los precios al consumidor, el costo de construir quedó ${pct(Math.abs(CN.icc_real))} ${CN.icc_real < 0 ? "por debajo" : "por encima"} de su nivel de ${CN.costo_desde}.`,
  "costo-nota": `Índice del Costo de la Construcción del INDEC para el Gran Buenos Aires: lo que cuesta construir viviendas modelo, con materiales, mano de obra y gastos generales. ` +
    `Para compararlo con la inflación, cada índice se divide por el Índice de Precios al Consumidor nacional y se lleva a 100 en ${CN.costo_desde} (la línea punteada): arriba de 100, construir se encareció más que el promedio de los precios, y abajo, menos. ` +
    `El INDEC publica el índice como variación de cada mes desde noviembre de 2015, y el sitio encadena esas variaciones (el resultado coincide con el índice que el INDEC publica desde enero de 2022).`,
  vivienda: VIV_IND.pct_alquila.t(),
  "vivienda-nota": NOTA_VIV("pct_alquila"),
  // ---- petróleo y gas (etapa 18)
  petroleo: LEAD["petroleo"]("tipo"), "petroleo-nota": `Producción declarada por las empresas en el Capítulo IV de la Resolución SE 319/1993, que la Secretaría de Energía publica en metros cúbicos. ` +
    `Para pasarla a barriles por día se usan los días de cada mes y el mismo factor que la Secretaría aplica en su serie, ${n2(PG.bbl)} barriles por metro cúbico. ` +
    `Shale y tight son las dos formas de explotación no convencional que define la Ley 27.007: el shale sale de formaciones de esquisto o pizarra y el tight, de areniscas compactas. ` +
    `El último mes puede cambiar cuando lleguen declaraciones atrasadas.`,
  gas: LEAD["gas"]("tipo"), "gas-nota": `Millones de metros cúbicos por día: la producción de cada mes, que la Secretaría de Energía publica en miles de metros cúbicos, dividida por sus días. ` +
    `El tight gas es el que sale de areniscas compactas y el shale gas, de formaciones de esquisto o pizarra (Ley 27.007). El último mes puede cambiar cuando lleguen declaraciones atrasadas.`,
  "gas-hogares": LEAD["gas-hogares"](), "gas-hogares-nota": `Combustible que el hogar usa principalmente para cocinar, según el Censo 2022. El gas de red es el que llega por cañería de una distribuidora. El zeppelin es un tanque de gas a granel en el lugar. ` +
    `En el mapa, cada departamento muestra el porcentaje de hogares que cocina con gas de red, en cinco grupos del mismo tamaño. Si elegís una provincia en Tu provincia, el mapa se acerca a ella.`,
  "hidro-provincias": LEAD["hidro-provincias"]("pet_kbd"), "hidro-provincias-nota": `Promedio de los doce meses en miles de barriles de petróleo y en millones de metros cúbicos de gas por día. ` +
    `"Mar argentino" son los yacimientos del mar a más de doce millas de la costa, que son del Estado nacional (la fuente los llama Estado Nacional). Al pasar el mouse, cada barra muestra la parte del país, la parte no convencional y la producción de los mismos meses diez años antes, entre ${PG.v10_desde} y ${PG.v10_hasta}.`,
  "areas-hidro": LEAD["areas-hidro"]("pet"), "areas-hidro-nota": `Promedio de cada año en miles de barriles de petróleo y en millones de metros cúbicos de gas por día, según lo que declaran las empresas para cada área de concesión en el Capítulo IV. ` +
    `La empresa de cada área es la que declaró la mayor parte de su producción en ${PG.areas_anio}. No convencional es lo que sale de formaciones de shale y tight, y convencional, el resto. ` +
    `"Mar argentino" son las áreas del mar a más de doce millas de la costa, que son del Estado nacional. ` +
    (PG.areas_incompletos.length ? `En ${lista(PG.areas_incompletos.map(String))} la fuente tiene algún mes que no llega al 99% del total del país: en esos años, lo que produjo cada área puede quedar algo por debajo. ` : "") +
    `Elegí un área en la lista para ver lo que produjo cada año desde ${PG.areas_ini}. Si elegiste una provincia en Tu provincia, sus áreas se resaltan entre las 15 que más producen.`,
  pozos: LEAD["pozos"](), "pozos-nota": `Pozos que declararon producción de petróleo o de gas en el mes. La producción de petróleo por pozo divide el petróleo del mes por los días del mes y por los pozos que produjeron petróleo, así que un pozo que produjo solo algunos días baja el promedio. Un mismo pozo puede producir petróleo y gas. ` +
    `Con el factor de la Secretaría, un barril equivale a unos ${n0(1000 / PG.bbl)} litros.`,
  "empresas-hidro": LEAD["empresas-hidro"]("pct_pet"), "empresas-hidro-nota": `Producción declarada por cada empresa en el Capítulo IV, como operadora de sus áreas: en las áreas compartidas, la producción figura a nombre de la empresa que la declara. ` +
    `Los nombres se muestran sin la forma societaria y la tabla los trae como los publica la fuente. Un mismo grupo puede declarar con más de una razón social. Las demás ${PG.n_empresas - PG.emp_n} empresas que declararon producción sumaron el ${pct(PG.emp_resto_pct)} del petróleo.`,
  "empleo-hidro": LEAD["empleo-hidro"](), "empleo-hidro-nota": `Asalariados registrados del sector privado en la extracción de petróleo y gas y sus servicios (rama 11 de la clasificación de actividades), según el SIPA, en promedio del trimestre. ` +
    `El SIPA asigna cada puesto a la provincia donde declara el empleador: por eso la Ciudad de Buenos Aires, donde tienen sede muchas empresas, aparece con empleo petrolero. ` +
    `Las provincias con pocos puestos no se muestran porque el OEDE no publica esos datos por el secreto estadístico. La serie del país suma las provincias con dato.`,
  regalias: LEAD["regalias"]("pct_regalias"), "regalias-nota": `Las regalías son lo que las empresas pagan a la provincia dueña del recurso por lo que extraen. El porcentaje sale de las cuentas de cada provincia (esquema ahorro-inversión-financiamiento del Ministerio de Economía) e incluye todas las regalías, también las mineras y las hidroeléctricas, sobre los ingresos totales.` +
    (Object.keys(PG.reg_atrasadas).length ? ` ${lista(Object.entries(PG.reg_atrasadas).map(([p, a]) => `${p} va con ${a}`))}, su último año publicado.` : "") +
    ` Los dólares por habitante son solo las regalías de petróleo crudo que publica la Secretaría de Energía, divididas por la población ${R.anio_pob}. La Secretaría publica las de gas en pesos y no se suman acá. Las del mar argentino, ${n1(PG.reg_usd_mar)} millones de dólares en ${PG.reg_usd_anio}, son del Estado nacional.`,
  reservas: LEAD["reservas"]("pet"), "reservas-nota": `Reservas comprobadas al 31 de diciembre que las empresas declaran a la Secretaría de Energía según la Resolución SE 324/2006, hasta el final de la vida útil de los yacimientos: lo que se puede extraer con razonable certeza con la técnica y los precios de ese momento. ` +
    `Desde 2017 la Secretaría separa las convencionales de las no convencionales. Los años de producción dividen las reservas por la producción de ese año: no son un pronóstico, porque las reservas cambian con la exploración, la tecnología y los precios.`,
  "balanza-energetica": LEAD["balanza-energetica"](), "balanza-energetica-nota": `Exportaciones del rubro combustibles y energía e importaciones de combustibles y lubricantes, según el Intercambio Comercial Argentino del INDEC, en millones de dólares de cada año. ` +
    `Son dos clasificaciones distintas, una por rubro y otra por uso económico, pero cubren lo mismo en lo principal: petróleo crudo, gas y combustibles.`,
  "mundo-petroleo": LEAD["mundo-petroleo"]("crudo_kbd"), "mundo-petroleo-nota": `Petróleo crudo con condensado y gas natural seco, según las estadísticas internacionales de la Administración de Información Energética de los Estados Unidos (EIA), que estima a todos los países con un mismo criterio. ` +
    (PG.mundo.crudo_kbd.anio === PG.anio_ult ? `Para la Argentina estima ${n0(PG.mundo.crudo_kbd.arg)} mil barriles por día en ${PG.anio_ult}, y la serie de la Secretaría de Energía que usa el resto de la página da ${n0(PG.kbd_ult)} mil. ` : "") +
    `El dato de Neuquén es de la Secretaría de Energía. El gas llega hasta ${PG.mundo.gas_bcm.anio}, el último año que la EIA publica para casi todos los países. Se muestran los países que producen más que la Argentina y algunos de los que siguen.`,
  "adonse-titulo": `Madres menores de 20 años y nivel socioeconómico por provincia`,
  "adonse-nota": `Cada punto es una provincia. En el eje vertical, el porcentaje de los nacimientos de ${R.ado_nse.anio} cuya madre tenía menos de 20 años (DEIS, estadísticas vitales). En el horizontal, el indicador elegido del Censo 2022. La línea punteada es solo una guía de la tendencia. ` +
    `La correlación es la de rangos de Spearman, que va de menos 1 a 1: cerca de 0 no hay relación, cerca de 1 o de menos 1 la relación es fuerte. Con 24 provincias, valores menores a 0,4 pueden deberse al azar. Una correlación no prueba que una cosa cause la otra: muestra que van juntas.`,
  "causas-titulo": `De qué mueren los bebés antes del primer año, por provincia, ${R.mi_causas.anios[0]} a ${R.mi_causas.anios[1]}`,
  "causas-nota": `Porcentaje de las muertes de menores de un año de cada provincia según el grupo de causa (capítulos de la CIE-10), sumando ${R.mi_causas.anios[0]} a ${R.mi_causas.anios[1]} porque en las provincias chicas hay pocas muertes por año. Las provincias están ordenadas por su tasa de mortalidad infantil del período, de mayor a menor. ` +
    `Según la DEIS, en ${R.mi_causas.reducibles.anio} el ${pct(R.mi_causas.reducibles.neonatal)} de las muertes de menores de 28 días y el ${pct(R.mi_causas.reducibles.posneonatal)} de las de 28 días a 11 meses del país eran reducibles con prevención, diagnóstico o tratamiento oportunos. Ese dato no se publica por provincia y no se puede calcular con los datos abiertos, que solo traen la causa con tres caracteres. ` +
    `Las correlaciones comparan la tasa de cada grupo de causas con el porcentaje de población sin obra social ni prepaga del Censo 2022.`,
  "envejecimiento-titulo": `Personas de 65 años o más por cada 100 en edad de trabajar, ${EV.anio} y ${EV.anio_fin}`,
  envejecimiento: `En ${EV.anio} hay ${n1(EV.hoy)} personas de 65 años o más por cada 100 de entre 15 y 64 años: unas ${n1(EV.trab_hoy)} personas en edad de trabajar por cada persona mayor. ` +
    `Según las proyecciones del INDEC, en ${EV.anio_fin} serán ${n1(EV.fin)}, unas ${n1(EV.trab_fin)} por cada una. La relación más alta es la de ${EV.max} (${n1(EV.max_v)}) y la más baja, la de ${EV.min} (${n1(EV.min_v)}).`,
  "empresas-titulo": `Empresas privadas con empleados cada 1.000 habitantes, ${EM.anio}`,
  empresas: `En ${EM.anio} había ${n0(EM.total_pais)} empresas privadas con al menos una persona en relación de dependencia, unas ${n1(EM.pais_1000)} cada 1.000 habitantes. ${EM.top} tenía ${n1(EM.top_v)} cada 1.000 y ${EM.low}, ${n1(EM.low_v)}.`,
  "empresas-nota": `Empresas que declaran personal ante la seguridad social. No incluye a quienes trabajan solos como monotributistas o autónomos sin empleados, ni al personal de casas particulares. Una empresa con personal en varias provincias se cuenta en cada una, por eso las provincias suman más que el total del país. La población es la proyección ${R.anio_pob} del INDEC.`,
  "dinamica-titulo": `Apertura y cierre de empresas privadas, ${EM.ini} a ${EM.ult}`,
  dinamica: `En ${EM.ult} abrieron ${n0(EM.ap)} empresas con empleados y cerraron ${n0(EM.ci)}: una tasa de entrada de ${pct(EM.te)} y una de salida de ${pct(EM.ts)} sobre el total de empresas. ` +
    `El cambio neto fue ${EM.neta >= 0 ? "positivo" : "negativo"}, de ${pct(Math.abs(EM.neta))}, y solo ${EM.positivas === 1 ? "una provincia tuvo" : EM.positivas + " provincias tuvieron"} más aperturas que cierres. ` +
    `La tasa de entrada más alta de la serie fue ${pct(EM.te_max)}, en ${EM.te_max_anio}. Desde ${EM.ini}, el cambio neto fue negativo en ${EM.anios_negativos} años.`,
  "dinamica-nota": `Se cuentan las empresas locales: cada empresa es local en la provincia donde declara la mayor parte de su personal, así que las provincias suman el total del país. Una empresa abre cuando declara empleados por primera vez y cierra cuando pasa un año (cuatro trimestres) sin declarar personal, con el cierre fechado en el primer trimestre sin empleo: por eso la serie llega hasta un año antes que el empleo. El OEDE no marca ese último año como provisorio. ` +
    `Las tasas dividen aperturas y cierres por todas las empresas activas en el año. La vista por provincia muestra el cambio neto de ${EM.ult}. El OEDE separa la provincia de Buenos Aires en partidos del Gran Buenos Aires y resto, que acá se suman.`,
  "rotacion-titulo": `Asalariados con un año o menos en su empleo actual, ${RO.desde[0] === RO.hasta[0] ? RO.hasta[0] : RO.desde[0] + " y " + RO.hasta[0]}`,
  rotacion: `Entre el ${trim(RO.desde)} y el ${trim(RO.hasta)}, el ${pct(RO.total)} de las personas asalariadas de los 31 aglomerados urbanos llevaba un año o menos en su empleo y el ${pct(RO.total_largo)} más de cinco años. ` +
    `La rotación se concentra en quienes tienen menos de 25 años (${pct(RO.jovenes)}), en los empleos sin descuento jubilatorio (${pct(RO.sin_desc)}, contra ${pct(RO.con_desc)} en los registrados) y en los hogares del quintil de menores ingresos (${pct(RO.q1)}, contra ${pct(RO.q5)} en el de mayores ingresos). ` +
    `Según el tipo de trabajo, es más común en el empleo privado (${pct(RO.privado)}) que en el estatal (${pct(RO.estatal)}), en los lugares donde trabajan hasta cinco personas (${pct(RO.chico)}, contra ${pct(RO.grande)} donde trabajan más de 40) y en las tareas no calificadas (${pct(RO.no_calif)}, contra ${pct(RO.profesional)} en las profesionales).`,
  "rotacion-nota": `Procesamiento propio de las bases usuarias de la Encuesta Permanente de Hogares del INDEC, con ${n0(RO.casos)} respuestas de los cuatro últimos trimestres publicados. Se usa la pregunta sobre cuánto tiempo hace que la persona trabaja en ese empleo en forma continua, que se hace a los asalariados salvo el servicio doméstico. ` +
    `La antigüedad corta no siempre significa rotación: también incluye a quienes consiguieron su primer empleo o volvieron a trabajar. La generación se calcula con la edad declarada. Las personas en el lugar de trabajo son todas las que trabajan allí, en los tramos que usa el INDEC. La calificación es la de la tarea y no la de la persona, según el Clasificador Nacional de Ocupaciones del INDEC: mide la complejidad de lo que se hace en ese puesto. Los quintiles ordenan a las personas por el ingreso per cápita de su hogar y usan el ponderador de ingresos del INDEC. La encuesta cubre solo aglomerados urbanos y no permite resultados confiables por provincia con este detalle.`,
  "piramide-titulo": `Población por edad y sexo, ${PI.anio} y ${PI.anio_fin}`,
  piramide: `En ${PI.anio} la mitad de la población del país tiene menos de ${PI.edad_mediana_hoy} años, aproximadamente. Según las proyecciones del INDEC, en ${PI.anio_fin} esa edad mediana llegará a unos ${PI.edad_mediana_fin} años y los menores de 15 pasarán de ser el ${pct(PI.menores15_hoy)} al ${pct(PI.menores15_fin)} de la población. La base de la pirámide se angosta porque nacen menos chicos y la parte de arriba se ensancha porque se vive más.`,
  "piramide-nota": `Cada barra es el porcentaje de la población total de la jurisdicción que tiene esa edad y ese sexo, en grupos de cinco años (el último reúne a las personas de 90 años o más). Las barras llenas son ${PI.anio} y el contorno, ${PI.anio_fin}. Al elegir una provincia, la pirámide pasa a mostrarla. La edad mediana se estima dentro de los grupos de cinco años.`,
  "jubilaciones-titulo": `Aportantes por cada beneficio previsional de ANSES, ${JU.ini} a ${JU.anio}`,
  jubilaciones: `En ${JU.mes ? MESES[JU.mes - 1] + " de " : ""}${JU.anio} había ${n2(JU.ratio)} aportantes por cada jubilación o pensión de los regímenes que administra ANSES: ${n0(JU.aportantes)} personas aportando y ${n0(JU.beneficios)} beneficios. El valor más alto de la serie fue ${n2(JU.max)} en ${JU.max_anio} y el más bajo, ${n2(JU.min)} en ${JU.min_anio}. ` +
    `La demografía empuja en la misma dirección: según las proyecciones del INDEC, las personas de 15 a 64 años por cada persona de 65 o más pasan de ${n1(EV.trab_hoy)} en ${EV.anio} a ${n1(EV.trab_fin)} en ${EV.anio_fin}.`,
  "jubilaciones-nota": `Promedio anual de aportantes y de beneficios. El último año es el último mes disponible. Los aportantes incluyen asalariados, autónomos, monotributistas y trabajadoras de casas particulares, también jubilados que siguen aportando. Desde abril de 2019 se cuentan solo los beneficios no suspendidos y hasta 2008 la serie incluye el sistema de capitalización. ` +
    `La cantidad de aportantes depende del empleo registrado, no solo de la edad de la población. No se compara entre provincias porque varias mantienen su propia caja previsional para empleados públicos, fuera de ANSES.`,
  "envejecimiento-nota": `Relación de dependencia de la vejez: personas de 65 años o más sobre personas de 15 a 64, por 100. No todas las personas de 15 a 64 trabajan ni todas las mayores están jubiladas, pero es la medida habitual para anticipar la presión sobre el sistema previsional y la demanda de cuidados. ` +
    `Las personas mayores pasan de ser el ${pct(EV.pct_mayores_hoy)} de la población en ${EV.anio} al ${pct(EV.pct_mayores_fin)} en ${EV.anio_fin}. El círculo claro marca ${EV.anio} y el oscuro ${EV.anio_fin}.`,
  hogares: `En ${e.anio_ult} los hogares explicaron el ${pct(e.pct_res_ult)} de la electricidad demandada en el país, frente al ${pct(e.pct_res_ini)} de ${e.anio_ini}. Entre ambos años la demanda residencial creció ${pct(e.crec_res)} y la del resto de los usuarios creció ${pct(e.crec_resto)}.`,
  actividad: `Entre ${e.anio_ini} y ${e.anio_ult} la demanda eléctrica total creció ${pct(e.crec_total)} y la actividad económica medida por el EMAE creció ${pct(e.crec_emae)}. En ${e.anio_ult} el país demandó ${n0(e.gwh_ult)} gigavatios hora (GWh).` +
    enLoQueVa(R.ytd.demanda, e.anio_ult, "la demanda total", "subió", "bajó"),
  meses: `En promedio entre ${e.meses_desde} y ${e.meses_hasta}, ${e.mes_max} fue el mes de mayor demanda eléctrica y ${e.mes_min} el de menor. La diferencia entre ambos fue de ${pct(e.dif_max_min)}. El año tiene dos picos, uno por refrigeración en verano y otro por calefacción en invierno.`,
  "meses-nota": `Promedio mensual de la demanda total en GWh para ${e.meses_desde}, ${e.meses_desde + 1} y ${e.meses_hasta}. El último mes disponible en la fuente es ${e.ultimo_mes}.`,
  nacimientos: `En ${nac.anio_ult} se registraron ${n0(nac.n_ult)} nacimientos, ${pct(Math.abs(nac.caida))} menos que los ${n0(nac.pico)} de ${nac.anio_pico}. En el conjunto de los 38 países de la OCDE, la baja entre ${nac.anio_pico} y ${nac.ocde_ult} fue de ${pct(Math.abs(nac.ocde_caida))}.`,
  adolescentes: `En ${nac.anio_ini}, ${n1(nac.pct_ini)} de cada 100 nacimientos del país correspondían a madres menores de 20 años. En ${nac.anio_ult} fueron ${n1(nac.pct_ult)} de cada 100. En cantidad pasaron de ${n0(nac.ado_pico)} en ${nac.ado_anio_pico} a ${n0(nac.ado_ult)} en ${nac.anio_ult}, una caída de ${pct(Math.abs(nac.ado_caida))}.`,
  suicidio: `En ${s.anio} el SNIC registró ${n0(s.casos)} suicidios, una tasa de ${n1(s.tasa)} por cada 100.000 habitantes de 5 años y más. En ${s.anio-1} la tasa había sido ${n1(s.tasa_prev)}. La tasa de los varones (${n1(s.tasa_v)}) más que triplica la de las mujeres (${n1(s.tasa_m)}).`,
  "suicidio-prov-titulo": `Tasa de suicidios por provincia, ${s.anio}`,
  "suicidio-prov": `${s.top} registró la tasa más alta, con ${n1(s.top_tasa)} suicidios por cada 100.000 habitantes de 5 años y más, y ${s.low} la más baja, con ${n1(s.low_tasa)}. La tasa nacional fue ${n1(s.tasa)}.`,
  edad: `Sobre ${n0(s.n_sat)} casos registrados entre ${s.sat_desde} y ${s.sat_hasta} con edad y sexo conocidos, el ${pct(s.pct_varones)} fueron varones y el ${pct(s.pct_jovenes)} tenía entre 15 y 29 años.`,
  muertes: `En ${s.anio} se registraron ${n0(s.casos)} suicidios, ${n0(s.homicidios)} homicidios dolosos y ${n0(s.viales)} muertes en siniestros viales. Por cada homicidio hubo ${n1(s.razon_hom)} suicidios. Desde ${s.anio_cruce} los suicidios superan cada año a las muertes viales. En ${R.femicidios.anio} la Justicia registró ${n0(R.femicidios.n)} víctimas directas de femicidio.`,
  "muertes-nota": `Cantidad de víctimas por año. Homicidios dolosos y muertes en siniestros viales según el mismo registro del SNIC. Femicidios: víctimas directas según el Registro Nacional de Femicidios de la Justicia Argentina. La figura se incorporó al Código Penal en diciembre de 2012 (Ley 26.791) y los datos abiertos del registro empiezan en ${R.femicidios.ini}. Incluye travesticidios y transfemicidios.`,
  "empleo-titulo": `Asalariados privados registrados por provincia, ${em.mes}`,
  empleo: `En ${em.mes} había ${n1(em.total_millones)} millones de personas asalariadas registradas en el sector privado, ${n1(em.cada_100_pais)} por cada 100 habitantes. En los doce meses previos el total nacional ${signo(em.var_nac)} y ${em.suben} de las 24 jurisdicciones registraron aumentos.`,
  "mortalidad-titulo": `Tasa de mortalidad infantil por provincia, ${mo.tri_base} y ${mo.tri_act}`,
  mortalidad: `En ${mo.anio} murieron en el país ${n1(mo.tasa)} de cada 1.000 nacidos vivos antes de cumplir un año. En ${mo.anio-1} la tasa había sido ${n1(mo.tasa_prev)} y en ${mo.anio_inicio}, ${n1(mo.tasa_inicio)}. En el promedio de ${mo.tri_act} la tasa más alta fue la de ${mo.top} (${n1(mo.top_v)}) y la más baja la de ${mo.low} (${n1(mo.low_v)}). La tasa bajó en ${mo.bajan} de las 24 jurisdicciones respecto de ${mo.tri_base}.`,
  "mortalidad-nota": `Defunciones de menores de un año por cada 1.000 nacidos vivos, según la provincia de residencia de la madre. En las provincias con pocos nacimientos la tasa de un solo año varía mucho, por eso se compara el promedio de tres años. El círculo claro marca ${mo.tri_base} y el lleno ${mo.tri_act}. La tabla descargable incluye también el valor de ${mo.anio}. La línea punteada azul marca el promedio simple de los países de la OCDE en ${OC.mortalidad_infantil.anio}, según el Banco Mundial.`,
  "sube-titulo": `Tarjetas SUBE usadas por día hábil, 2020 a ${su.mes.slice(-4)}`,
  sube: `En ${su.mes}, en un día hábil típico se usaron ${n2(su.total_millones)} millones de tarjetas SUBE distintas en colectivos, trenes, subtes y lanchas${su.var_anual == null ? "" : `, ${n1(Math.abs(su.var_anual))}% ${su.var_anual < 0 ? "menos" : "más"} que en ${su.mes_prev}`}. En los primeros días hábiles de marzo de 2020, antes del aislamiento, eran ${n2(su.pre_millones)} millones.`,
  "sube-nota": `Cantidad de tarjetas distintas que registraron al menos un viaje en el día. Se toma la mediana de los días hábiles de cada mes, así los feriados o paros no bajan el valor del mes. En ${su.mes} se usaron por día ${n1(su.colectivo_millones)} millones de tarjetas en colectivo, ${n0(su.tren_miles)} mil en tren y ${n0(su.subte_miles)} mil en subte (una tarjeta que combina modos cuenta en cada uno). La SUBE funciona en el AMBA y en decenas de ciudades del interior. No incluye ciudades con sistemas de pago propios. Cuenta tarjetas y no pasajeros: quien paga con tarjeta bancaria, celular o QR, donde se puede, no aparece. ` +
    (su.faltan.length ? `La fuente no publica ningún día de ${su.faltan.join(" ni de ")}: el gráfico deja el hueco. ` : "") +
    (su.lancha_salto ? `Desde ${su.lancha_salto} la cantidad de tarjetas en lanchas de la serie se multiplica de un mes a otro, y la fuente no explica por qué. ` : "") +
    `Último día disponible en la fuente: ${su.ultimo_dia}.`,
  "pisa-titulo": `Resultados de la Argentina en las pruebas PISA, 2000 a ${pz.anio}`,
  pisa: `En PISA ${pz.anio}, los estudiantes de 15 años de la Argentina obtuvieron en promedio ${pz.mat} puntos en matemática, ${pz.lec} en lectura y ${pz.cie} en ciencias. El promedio de los países de la OCDE fue de ${pz.ocde_mat}, ${pz.ocde_lec} y ${pz.ocde_cie} puntos. En matemática la diferencia fue de ${pz.dif_mat} puntos. Frente a ${pz.anio_prev}, el puntaje de la Argentina ${cambio(pz.var_mat)} en matemática, ${cambio(pz.var_lec)} en lectura y ${cambio(pz.var_cie)} en ciencias.`,
  "pisa-nota": `Puntaje promedio de los estudiantes de 15 años escolarizados que rindieron la prueba. La OCDE excluyó de las comparaciones el resultado nacional de 2015 por problemas de cobertura de la muestra. Por eso ese año no aparece en el gráfico, aunque figura en la tabla descargable. En 2000 esta fuente solo tiene el puntaje de lectura. El promedio OCDE es el promedio simple de los países miembros en cada ciclo.`,
  "escolarizacion-titulo": `Tasa neta de escolarización secundaria por provincia, ${es.ini} y ${es.fin}`,
  escolarizacion: `En ${es.fin}, el ${pct(es.pais_fin)} de los adolescentes en edad de cursar la secundaria estaba matriculado en ese nivel. En ${es.ini} era el ${pct(es.pais_ini)}. La tasa subió en ${es.suben} de las 24 jurisdicciones, aunque la comparación cruza un quiebre de serie: desde 2022 la población de referencia sale del Censo 2022. ` +
    `En ${es.fin} fue más alta en ${es.top} (${pct(es.top_v)})` + (es.top_excluidos.length ? `, sin contar ${es.top_excluidos.join(", ").replace(/, ([^,]*)$/, " y $1")}, donde la tasa llega casi al 100% por diferencias entre la matrícula y la población estimada,` : "") +
    ` y más baja en ${es.low} (${pct(es.low_v)}).`,
  "escolarizacion-nota": `Alumnos de 12 a 17 años (13 a 17 en las provincias con secundaria de cinco años) matriculados en el nivel secundario, incluidas la educación especial y la de jóvenes y adultos, sobre la población de esa edad. Desde 2022 la población de referencia son las proyecciones del INDEC basadas en el Censo 2022, así que parte del cambio entre 2021 y 2022 responde al cambio de denominador. Algunos valores superan el 100% por diferencias entre la matrícula y la proyección de población. El círculo claro marca ${es.ini} y el lleno ${es.fin}.`,
  "aprender-titulo": `Estudiantes de 6° grado con nivel satisfactorio o avanzado en Aprender por provincia, ${ap.anio}`,
  aprender: `En Aprender ${ap.anio}, el ${pct(ap.mat)} de los estudiantes de 6° grado de primaria del país alcanzó un nivel satisfactorio o avanzado en matemática y el ${pct(ap.len)} en lengua. En matemática, el ${pct(ap.mat_debajo)} quedó por debajo del nivel básico. Por provincia, el porcentaje en matemática fue más alto en ${ap.top} (${pct(ap.top_v)}) y más bajo en ${ap.low} (${pct(ap.low_v)}).`,
  "aprender-nota": `Aprender es la evaluación nacional del Ministerio de Educación. En ${ap.anio} fue censal para 6° grado de primaria. Los porcentajes están calculados sobre la base agregada por departamento, sector y ámbito que publica el Ministerio, y cuentan solo a quienes tienen un nivel de desempeño asignado. Por eso pueden diferir levemente de los del informe oficial.${DIST["aprender_provincias.mat_logra"]?.["Neuquén"] ? ` En Neuquén, ${DIST["aprender_provincias.mat_logra"]["Neuquén"].motivo}.` : ""}`,
  "protegida-titulo": `Superficie protegida por provincia, ${nt.anio}`,
  protegida: `En ${nt.anio} había ${n0(nt.areas)} áreas protegidas nacionales, provinciales y con designación internacional, que cubrían ${n1(nt.ha_millones)} millones de hectáreas: el ${pct(nt.pct)} del territorio continental del país, unos ${n0(nt.m2_pais)} metros cuadrados por habitante. ${nt.top} tenía protegido el ${pct(nt.top_v)} de su superficie${conVeces(nt.top_v, nt.pct)} y ${nt.low} el ${pct(nt.low_v)}${conVeces(nt.low_v, nt.pct)}. Por habitante, la superficie protegida va de ${n0(nt.m2_top_v)} m² en ${nt.m2_top} a ${n1(nt.m2_low_v)} m² en ${nt.m2_low}.`,
  "protegida-nota": `Superficie terrestre dentro de áreas protegidas de jurisdicción nacional o provincial y de sitios con designación internacional, como reservas de biosfera y sitios Ramsar. La fuente suma la superficie de cada designación, así que una misma zona puede contarse más de una vez. No incluye las áreas marinas. Los metros cuadrados por habitante usan la población ${R.anio_pob} proyectada por el INDEC. La línea punteada azul marca el promedio simple de los países de la OCDE en ${OC.protegida.anio} según el Banco Mundial, que usa otra base (la Base Mundial de Áreas Protegidas) y no suma superposiciones.`,
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
  "eti-nota": `Encuesta de Turismo Internacional. Solo cubre a los turistas que dejan el país por los aeropuertos de Ezeiza y Aeroparque, así que subestima a las provincias que reciben turistas por otros pasos, como las limítrofes. Un turista que visitó varias provincias cuenta en cada una. La cantidad por habitante usa la población ${R.anio_pob} proyectada por el INDEC. Desde 2026 el INDEC reformula esta encuesta y reprogramó su difusión porque no se renovó el convenio de financiamiento con la Secretaría de Turismo.`,
  "pobreza-titulo": `Pobreza e indigencia en los 31 aglomerados urbanos, ${R.pobreza.ini} a ${R.pobreza.fin}`,
  pobreza: `En el ${R.pobreza.sem}, el ${pct(R.pobreza.pob)} de las personas que viven en los 31 aglomerados urbanos relevados por la EPH estaba bajo la línea de pobreza y el ${pct(R.pobreza.ind)} bajo la línea de indigencia. Un año antes, en el ${R.pobreza.sem_prev}, eran ${pct(R.pobreza.pob_prev)} y ${pct(R.pobreza.ind_prev)}. El valor más alto de la serie fue ${pct(R.pobreza.max)}, en el ${R.pobreza.max_sem}.`,
  "pobreza-nota": `Porcentaje de personas en hogares cuyos ingresos no alcanzan la canasta básica total (pobreza) o la canasta básica alimentaria (indigencia). La EPH releva solo los 31 aglomerados urbanos, no el total del país ni las provincias. En la página de consultas están los aglomerados, los partidos del Gran Buenos Aires y las comunas de la Ciudad, con sus intervalos de confianza.`,
  "mapa-areas-nota": `Color: porcentaje de la superficie de cada provincia dentro de áreas protegidas de cualquier jurisdicción, ${nt.anio}. Círculos: áreas protegidas nacionales terrestres, con tamaño proporcional a su superficie. Pasá el cursor para ver los valores.`,
  "lista-areas-nota": `Las ${nt.pn_n} áreas protegidas de la Administración de Parques Nacionales, ordenadas por año de creación. Superficie actual en hectáreas según el Sistema de Información de Biodiversidad.`,
  "sube-modos-titulo": `Tarjetas SUBE usadas por día hábil en trenes y subtes, 2020 a ${su.mes.slice(-4)}`,
  "sube-modos": `En ${su.mes}, en un día hábil típico se usaron ${n0(su.tren_miles)} mil tarjetas en trenes y ${n0(su.subte_miles)} mil en subtes. En los primeros días hábiles de marzo de 2020 eran ${n0(su.tren_pre_miles)} mil y ${n0(su.subte_pre_miles)} mil: el tren ${su.tren_vs_pre < 0 ? "tiene" : "suma"} ${pct(Math.abs(su.tren_vs_pre))} ${su.tren_vs_pre < 0 ? "menos" : "más"} y el subte ${pct(Math.abs(su.subte_vs_pre))} ${su.subte_vs_pre < 0 ? "menos" : "más"}, aunque desde diciembre de 2024 parte de los viajes en subte se paga sin SUBE y no figura en estos datos. En colectivo la diferencia es de ${su.colectivo_vs_pre > 0 ? "+" : ""}${pct(su.colectivo_vs_pre)}.`,
  "sube-modos-nota": `Mediana de las tarjetas distintas que viajaron cada día hábil en cada modo. El subte funciona solo en la Ciudad de Buenos Aires y los trenes con SUBE, sobre todo en el Área Metropolitana. ` +
    `Desde diciembre de 2024 el subte acepta tarjetas bancarias y celulares sin contacto, y desde mayo de 2025 pagos con QR: esos viajes no usan la SUBE y no están en estos datos, así que la baja de tarjetas en el subte no es lo mismo que una baja de pasajeros.`,
  "patentes-titulo": `Autos y motos nuevos inscriptos por año, ${au.ini} a ${au.anio}`,
  patentes: `En ${au.anio} se inscribieron ${n0(au.autos)} autos y ${n0(au.motos)} motos nuevos en los registros del país. El máximo de autos de la serie fue en ${au.max_anio}, con ${n0(au.max)}, y el mínimo en ${au.min_anio}, con ${n0(au.min)}. Entre ${au.ytd} se inscribieron ${pct(Math.abs(au.ytd_var))} ${au.ytd_var < 0 ? "menos" : "más"} autos que en el mismo período del año anterior.`,
  "patentes-nota": `Inscripciones iniciales de vehículos cero kilómetro. Automotores incluye autos, camionetas y vehículos de carga. Los datos de motos empiezan en ${au.motos_ini}.`,
  "patentes-prov-titulo": `Autos y motos nuevos por cada 1.000 habitantes, por provincia, ${au.anio}`,
  "patentes-prov": `En ${au.anio} se inscribieron ${n1(au.pais_1000)} autos y ${n1(au.motos_pais_1000)} motos nuevos cada 1.000 habitantes. En autos el valor más alto fue el de ${au.top} (${n1(au.top_v)}) y el más bajo el de ${au.low} (${n1(au.low_v)}). En motos el más alto fue el de ${au.moto_top} (${n1(au.moto_top_v)})${sinContar("patentamientos_provincias.motos_1000", au.moto_excluidos)}.`,
  "electricidad-provincias": LEAD["electricidad-provincias"]("prov"), "electricidad-provincias-nota": `Demanda residencial que los distribuidores declaran cada mes a CAMMESA, por provincia, ` +
    `dividida por la población de cada año (proyecciones del INDEC desde 2022 y la población implícita en las tasas del SNIC antes). La parte de los hogares se calcula sobre las tres categorías de tarifa ` +
    `que publica CAMMESA: residencial, comercial e industrial o comercial grande. CAMMESA no separa la Ciudad de Buenos Aires de la provincia, así que van juntas, y no informa Tierra del Fuego: ` +
    `el valor del país es el de las demás jurisdicciones. La serie empieza en ${e.el_ini} porque antes CAMMESA contaba el alumbrado público como residencial. ` +
    `Los últimos meses son provisorios (el último publicado es ${e.el_hasta}). Si elegís la Ciudad o la provincia de Buenos Aires en Tu provincia, el gráfico resalta la fila de las dos.`,
  "electricidad-sectores": LEAD["electricidad-sectores"]("ind"), "electricidad-sectores-nota": `Demanda que los distribuidores y los grandes usuarios declaran ` +
    `cada mes a CAMMESA, por provincia y categoría de tarifa, dividida por la población del año (proyecciones del INDEC). Comercios y servicios son los usuarios de las ` +
    `distribuidoras que no son hogares y demandan menos de 300 kW, con los clubes y el alumbrado público. Industrias y grandes comercios son las demandas de 300 kW o más: ` +
    `las que abastecen las distribuidoras y los grandes usuarios que compran su energía en el mercado mayorista, que CAMMESA registra en la provincia donde consumen. ` +
    `Por eso, donde hay una gran planta industrial o minera, una sola empresa puede explicar buena parte de la demanda de la provincia. CAMMESA no separa la Ciudad de ` +
    `Buenos Aires de la provincia, así que van juntas, y no informa Tierra del Fuego: el valor del país es el de las demás jurisdicciones. ` +
    `Los últimos meses son provisorios (el último publicado es ${e.el_hasta}).`,
  salarios: LEAD.salarios("prov"), "salarios-nota": `Remuneración bruta promedio por todo concepto (antes de los aportes y las contribuciones) de los asalariados ` +
    `registrados del sector privado, por puesto de trabajo: una persona con dos empleos cuenta dos veces. Cada puesto se cuenta en la provincia donde el trabajador ` +
    `está declarado. Es un promedio y no una mediana, así que unos pocos sueldos muy altos lo suben. Junio y diciembre incluyen el aguinaldo: por eso la comparación ` +
    `entre provincias usa ${SA.mes}, el último mes publicado sin aguinaldo (el último es ${SA.ult}). La provincia de Buenos Aires reúne los partidos del Gran Buenos Aires ` +
    `y el resto de la provincia, pesados por su empleo. No incluye el empleo público ni el trabajo no registrado. Los dos últimos años son provisorios.`,
  "salario-docente": LEAD["salario-docente"]("prov"), "salario-docente-nota": `Salario bruto por mes de un cargo de referencia, no el promedio de lo que cobran los ` +
    `docentes: maestro de grado de primaria, jornada simple, con 10 años de antigüedad, con lo que paga cada provincia. Incluye los adicionales comunes al cargo, como ` +
    `zona o residencia donde se pagan, y las sumas extraordinarias del trimestre. Hasta ${DC.fonid_fin} incluía también el Fondo Nacional de Incentivo Docente y la ` +
    `conectividad que pagaba la Nación. El país es el promedio ponderado que publica la fuente. Los datos son provisorios y cada edición revisa trimestres anteriores.`,
  "inversion-educativa": LEAD["inversion-educativa"]("alumno"), "inversion-educativa-nota": `Gasto público en educación por alumno de gestión estatal: lo que gasta ` +
    `cada provincia en educación más las transferencias no automáticas de la Nación, sin lo que se transfiere a las escuelas de gestión privada, dividido por los ` +
    `alumnos de las escuelas estatales. La parte del gasto público no cuenta esas transferencias de la Nación. Pesos de cada año, y en la serie, pesos de ${IE.anio} ` +
    `con el deflactor del PBI. Datos provisorios.`,
  delitos: LEAD.delitos("tipo"), "delitos-nota": `El SNIC reúne los hechos que registran las fuerzas policiales y de seguridad, y en algunas provincias el Ministerio Público ` +
    `Fiscal, en sus primeras actuaciones: los delitos que nadie denuncia ni detecta no figuran, y algunos de los registrados pueden no confirmarse después. Cada hecho ` +
    `cuenta un delito. El total suma los delitos de todos los tipos salvo las contravenciones, y el gráfico muestra los catorce más frecuentes (la tabla tiene todos). Tasas cada 100.000 habitantes con las proyecciones de población del INDEC ` +
    `de cada momento (desde 2022, con base en el Censo 2022). Entre 2009 y 2013, el SNIC completó el total del país porque faltan datos de Buenos Aires y de Córdoba.`,
  robos: LEAD.robos("robos"), "robos-nota": `Hechos que registran las fuerzas policiales y de seguridad, cada 100.000 habitantes. El robo es quedarse con algo ajeno con fuerza ` +
    `en las cosas o violencia en las personas, y el hurto, sin fuerza ni violencia. Los robos no incluyen las tentativas ni los agravados por el resultado de lesiones o ` +
    `muertes, que el SNIC cuenta aparte. Las diferencias entre provincias dependen también de cuánto se denuncia y de cómo registra cada fuerza.`,
  homicidios: LEAD.homicidios("prov"), "homicidios-nota": `Víctimas de homicidios dolosos, cuando se quita la vida a una persona con intención de hacerlo, que registran ` +
    `las fuerzas policiales y de seguridad. En las provincias, la tasa suma ${SG.hom3_desde} a ${SG.anio} sobre la población del INDEC de esos años, porque donde hay ` +
    `pocos casos la tasa de un solo año cambia mucho. Las muertes en siniestros viales y los femicidios están en la ficha de muertes de Salud.`,
  carceles: LEAD.carceles("serie"), "carceles-nota": `Censo de las personas alojadas en establecimientos penitenciarios al 31 de diciembre de cada año. No incluye a las ` +
    `personas detenidas en comisarías ni a las que tienen prisión domiciliaria. Por provincia, cada servicio penitenciario provincial sobre la población de su provincia: ` +
    `las cárceles federales van aparte y una cárcel puede alojar a personas detenidas por la justicia de otra provincia. El país, sobre la población que usa el SNIC. ` +
    `El salto de 2004 viene del dato de la provincia de Buenos Aires de ese año, mucho más alto que el de los años vecinos.`,
  // ---- gobierno (etapa 25)
  "cuentas-nacion": LEAD["cuentas-nacion"]("resultado"), "cuentas-nacion-nota": `Informe mensual de ingresos y gastos del Sector Público Nacional ` +
    `no Financiero de la Secretaría de Hacienda, en base caja: lo que efectivamente entra y sale cada mes. Como parte del PBI a precios corrientes del ` +
    `INDEC de cada año completo, y los últimos años del PBI son provisorios. Los ingresos son los que le quedan a la Nación: lo que se reparte en forma ` +
    `automática con las provincias por la coparticipación no está. Las utilidades que transfiere el Banco Central no cuentan como ingreso, y los intereses ` +
    `son netos de los que se paga el propio Estado. Las transferencias corrientes a las provincias son las que no son automáticas. ` +
    `Los ingresos de enero de 2026 incluyen la venta de las acciones del Estado en centrales hidroeléctricas.`,
  recaudacion: LEAD.recaudacion("impuesto"), "recaudacion-nota": `Recursos tributarios nacionales de la Dirección Nacional de Investigaciones y Análisis ` +
    `Fiscal: lo que cobran la ARCA y otros organismos nacionales, antes de repartir entre la Nación y las provincias. Como parte del PBI a precios ` +
    `corrientes del INDEC de cada año completo. Lo que va del año, en pesos de igual valor con el índice de precios al consumidor del INDEC. La ley de ` +
    `coparticipación reparte con las provincias casi todos los impuestos nacionales, pero no los derechos de exportación y de importación.`,
  deuda: LEAD.deuda(), "deuda-nota": `Deuda bruta de la Administración Central según la Secretaría de Finanzas: la deuda en situación de pago normal, ` +
    `los atrasos y la deuda que todavía no entró en las reestructuraciones, también la que tienen otros organismos del propio Estado. Como parte del ` +
    `PBI, como la publica la Secretaría para cada fin de año y para cada trimestre del año en curso. No incluye la deuda de las provincias ni la del ` +
    `Banco Central.`,
  "empleo-publico": LEAD["empleo-publico"]("prov"), "empleo-publico-nota": `Cargos ocupados en las administraciones públicas provinciales (administración ` +
    `central, organismos descentralizados y cuentas especiales) del personal permanente y temporario, según la Dirección Nacional de Asuntos ` +
    `Provinciales, con la población del INDEC del año. Cuenta cargos, no personas: alguien puede tener dos cargos. Cada provincia informa los suyos` +
    (GBC.presupuestados.length ? `, y ${lista(GBC.presupuestados)} ${GBC.presupuestados.length > 1 ? "informan" : "informa"} los cargos ` +
      `presupuestados en lugar de los ocupados` : "") + `. La vista de la Nación es la dotación de la administración pública nacional, las empresas y ` +
    `las sociedades del Estado que publica el INDEC: no incluye las universidades, el sistema de ciencia y tecnología, el servicio exterior ni el ` +
    `personal militar y de seguridad, y tiene meses con datos estimados por el INDEC.`,
  "impuestos-provinciales": LEAD["impuestos-provinciales"](), "impuestos-provinciales-nota": `Recursos tributarios de origen provincial: ingresos ` +
    `brutos, inmobiliario, sellos, automotor y otros, según la Dirección Nacional de Asuntos Provinciales, que replica lo que publica la dirección de ` +
    `rentas de cada provincia. Por habitante con la población del INDEC. Las provincias no cobran los mismos impuestos: en algunas, el automotor lo ` +
    `cobran los municipios. Las finanzas de cada provincia, con lo que recibe de la Nación, están en la ficha siguiente.`,
  refugio: LEAD.refugio("anio"), "refugio-nota": `Solicitudes de reconocimiento de la condición de persona refugiada presentadas cada año ante la ` +
    `CONARE, que decide quién es reconocida como refugiada, y personas reconocidas, según sus estadísticas de ${MGR.anio}. La CONARE las publica solo ` +
    `en PDF: el sitio copia sus cuadros. Las cifras de ACNUR son las personas refugiadas y solicitantes de asilo que vivían en el país a fin de cada ` +
    `año, que informa cada gobierno: no se suman a las solicitudes, que son trámites de cada año. ACNUR cuenta aparte a las otras personas que ` +
    `necesitan protección internacional, que no figuran como refugiadas ni como solicitantes de asilo.`,
  supermercados: LEAD.supermercados("prov"), "supermercados-nota": `Encuesta de Supermercados del INDEC: un panel fijo de empresas de supermercados ` +
    `con alguna boca de 200 m² o más, o que suman esa superficie entre todas sus bocas, que no es una muestra al azar. Las ventas incluyen el IVA. La serie mes a mes es el índice del país que publica el ` +
    `INDEC a precios constantes, que descuenta los precios de cada grupo de artículos con el índice de precios al consumidor del país. El INDEC publica ` +
    `las ventas de cada provincia solo a precios corrientes: el sitio las lleva a pesos de ${ESU.mes} con el índice de precios de los bienes de su región ` +
    `(en la provincia de Buenos Aires, los 24 partidos del Gran Buenos Aires con el de esa región y el resto con el de la región Pampeana), así que la ` +
    `variación del país de ese gráfico difiere un poco de la del índice del INDEC. No se comparan las ventas por habitante: dependen de cuántos locales ` +
    `del panel hay en cada provincia.`,
  // ---- migraciones (etapa 25)
  "nacidos-otro-pais": LEAD["nacidos-otro-pais"]("prov"), "nacidos-otro-pais-nota": `Personas que vivían en viviendas particulares y nacieron en ` +
    `otro país, según el Censo 2022 del INDEC, como parte de toda la población en viviendas particulares de cada provincia. Es el primer censo de derecho: ` +
    `cuenta a cada persona donde vive habitualmente. El país de nacimiento es el que declaró cada persona, y el ${pct(MGC.no_declarado_pct)} no lo declaró ` +
    `(en algunas provincias, muchas más: el texto lo aclara cuando pasa de la quinta parte). Con una provincia elegida, la vista por país muestra los de ` +
    `esa provincia. El mapa usa los cuadros de cada provincia, con un dato por departamento, partido o comuna: al pasar el mouse muestra también el ` +
    `origen más frecuente entre quienes declararon su país, donde lo declararon al menos 100 personas. El RENAPER identifica más personas nacidas en ` +
    `otro país, porque cuenta documentos con el domicilio declarado: está en la ficha de abajo.`,
  "migracion-interna": LEAD["migracion-interna"](), "migracion-interna-nota": `Personas que vivían en viviendas particulares según dónde nacieron: en la ` +
    `misma provincia, en otra provincia o en otro país, según el Censo 2022 del INDEC. Cuenta dónde nació cada persona y dónde vive, no cuándo se mudó ni ` +
    `cuántas veces. El mapa usa los cuadros de cada provincia, con un dato por departamento, partido o comuna, y divide a los departamentos en cinco ` +
    `grupos del mismo tamaño.`,
  "migracion-historia": LEAD["migracion-historia"](), "migracion-historia-nota": `Personas nacidas en otro país como parte de la población total de ` +
    `cada censo nacional. Hasta 2001, según el INDEC (Aquí se cuenta, número 12, 2004), y en 2010 y 2022, según la publicación del Censo 2022 sobre ` +
    `migraciones. Los nacidos en países limítrofes (Bolivia, Brasil, Chile, Paraguay y Uruguay) hasta 2001 son los de esa publicación del INDEC, y los de ` +
    `2022 los calcula el sitio con el cuadro de países de nacimiento del Censo 2022, sobre la población en viviendas particulares. Para 2010 no hay un dato ` +
    `publicado con la misma definición. Hasta 2001 los censos contaban a cada persona donde pasó la noche del censo, y el de 2022, donde vive habitualmente.`,
  radicaciones: LEAD.radicaciones("anio"), "radicaciones-nota": `Trámites de residencia resueltos a favor por la Dirección Nacional de Migraciones, ` +
    `por año y nacionalidad. Cuenta trámites, no personas: alguien puede recibir una residencia temporaria un año y la permanente otro. La residencia ` +
    `permanente es para quien quiere establecerse en el país, y la temporaria, para quien viene por un tiempo, por ejemplo a trabajar o a estudiar. ` +
    `Las personas de los países del Mercosur y asociados tienen un trámite propio por nacionalidad. No hay datos por provincia.`,
  "argentinos-exterior": LEAD["argentinos-exterior"]("anio"), "argentinos-exterior-nota": `Estimación de la División de Población de las Naciones Unidas ` +
    `(International Migrant Stock), a mediados de cada año, con los censos y los registros de cada país de destino: no es un conteo. En la mayoría de los ` +
    `países cuenta a las personas nacidas en la Argentina, y en algunos, a las de nacionalidad argentina. No es comparable con las cifras de los censos ` +
    `del país. La lista de destinos no incluye las Islas Malvinas.`,
  // ---- economía y precios (etapa 25)
  inflacion: LEAD.inflacion("doce"), "inflacion-nota": `Índice de precios al consumidor del INDEC, base diciembre de 2016 = 100: mide cuánto cambia el costo de una ` +
    `canasta fija de bienes y servicios que compran los hogares de las ciudades del país. Las variaciones del mes y de doce meses son las que publica el INDEC, con ` +
    `un decimal, y la de lo que va del año sale del índice. El índice del país empieza en diciembre de 2016: no hay uno anterior para todo el país. Las regiones son ` +
    `grupos de ciudades donde se relevan los precios. El Gran Buenos Aires es la Ciudad de Buenos Aires y los 24 partidos que la rodean. La región Pampeana reúne el ` +
    `resto de la provincia de Buenos Aires, con el Gran La Plata, y Córdoba, Entre Ríos, La Pampa y Santa Fe. Las demás reúnen estas provincias: Noreste (Corrientes, ` +
    `Chaco, Formosa y Misiones), Noroeste (Catamarca, Jujuy, La Rioja, Salta, Santiago del Estero y Tucumán), Cuyo (Mendoza, San Juan y San Luis) y Patagonia (Chubut, ` +
    `Neuquén, Río Negro, Santa Cruz y Tierra del Fuego). Con una provincia elegida, el gráfico muestra su región.`,
  "inflacion-rubros": LEAD["inflacion-rubros"]("division"), "inflacion-rubros-nota": `Variación de los precios de cada rubro en los doce meses hasta ${EIP.mes}, ` +
    `en todo el país, según el INDEC. Los rubros son las doce divisiones de la clasificación del consumo que usa el índice. Los precios regulados son los de los ` +
    `combustibles para la vivienda, la electricidad, el agua, los sistemas de salud, el transporte público, el funcionamiento y el mantenimiento de los vehículos, ` +
    `con la nafta, el correo, el teléfono, la educación formal y los cigarrillos. Los estacionales, los de las frutas, las verduras, la ropa exterior, el transporte ` +
    `por turismo y el alojamiento. La inflación núcleo es la de los demás. La tabla tiene también la variación de cada rubro en las seis regiones.`,
  canastas: LEAD.canastas("region"), "canastas-nota": `Canasta básica alimentaria: los alimentos que cubren las necesidades de energía y de proteínas de un varón ` +
    `adulto de actividad moderada, el adulto equivalente. La canasta básica total suma los demás bienes y servicios, como la ropa, el transporte, la educación y la ` +
    `salud. Las dos se valorizan con los precios del índice de precios al consumidor. Un hogar es pobre si sus ingresos no alcanzan para su canasta básica total, e ` +
    `indigente si no alcanzan para la alimentaria. Lo que necesita cada hogar depende de cuántas personas lo forman, su edad y su sexo: el hogar de cuatro ` +
    `integrantes del ejemplo del INDEC equivale a ${n2(ECB.adultos_hogar)} adultos equivalentes. Las canastas de las seis regiones salen cada semestre, con el informe ` +
    `de pobreza del INDEC: la última es de ${ECB.reg_mes}. Cuántas personas son pobres está en Pobreza y hogares.`,
  "salario-real": LEAD["salario-real"](), "salario-real-nota": `Índice de salarios del INDEC dividido por el índice de precios al consumidor del país, con ` +
    `${ESR.base} = 100, el primer mes del índice de precios del país. El índice de salarios tiene ponderaciones fijas: mide cuánto cambian los salarios, no cuánto ` +
    `cobra en promedio cada persona. El del sector privado no registrado no se compara con los precios del mismo mes, porque sale de la Encuesta Permanente de ` +
    `Hogares y llega con cinco meses de rezago. Los salarios promedio de cada provincia están en Trabajo.`,
  emae: LEAD.emae("mes"), "emae-nota": `Estimador Mensual de Actividad Económica del INDEC, base 2004 = 100: un indicador provisorio de cómo ` +
    `cambia el producto interno bruto a precios constantes, que se arma con información parcial. El INDEC revisa la serie completa con cada publicación. La serie sin ` +
    `estacionalidad quita el efecto de la época del año, para comparar un mes con el anterior. Por sector, los últimos doce meses frente a los doce anteriores, ` +
    `porque algunos, como la pesca y el agro, cambian mucho de un mes a otro. Sin los impuestos netos de subsidios, que el INDEC suma al total.`,
  combustibles: LEAD.combustibles("nafta", "prov"), "combustibles-nota": `La mediana de los precios en el surtidor que cada estación de servicio declara para el mes a la Secretaría de Energía ` +
    `(Resolución 1104/2004): la mitad de las estaciones cobra más y la otra mitad, menos. Solo la venta al público en bocas de expendio con movimiento en el mes, y sin los precios ` +
    `que se alejan a menos de la mitad o a más del doble de la mediana del país, en su mayoría cargados divididos por mil. La nafta súper es la de 92 a 95 octanos y el gasoil, el de grado 2. ` +
    `Las estaciones declaran con demora: el último mes es el más reciente en el que declararon casi todas (${n0(CB.estaciones)} vendieron nafta súper al público en ${CB.mes}). ` +
    `La serie mes a mes pasa los precios a pesos de ${CB.mes} con el índice de precios al consumidor del INDEC. La serie año por año es el promedio de la mediana ` +
    `de los doce meses de cada año, desde ${CB.anual_ini}, el primer año completo desde que rige la resolución, y pasa los precios a pesos de ${CB.anual_ult} con el deflactor ` +
    `del producto interno bruto que publica el Banco Mundial, porque el índice de precios al consumidor del INDEC para todo el país empieza en diciembre de 2016.`,
  "patentes-prov-nota": `La provincia es la del registro donde se hizo la inscripción, que no siempre coincide con el lugar donde se usa el vehículo. Por eso algunas jurisdicciones muestran valores muy altos. La población es la proyección ${R.anio_pob} del INDEC.`,
  "nombres-titulo": `Nombres más elegidos para los bebés, ${cu.nom_anio}`,
  nombres: `En ${cu.nom_anio} los nombres más inscriptos en el país fueron ${cu.nena} (${n0(cu.nena_n)}) para las nenas ${yE(cu.varon)} (${n0(cu.varon_n)}) para los varones. En ${cu.nom_ini} habían sido ${cu.nena0} ${yE(cu.varon0)}. ${cu.varon_prov} fue el nombre de varón más elegido en ${cu.varon_prov_n} de las 24 jurisdicciones.`,
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
  pesca: `En ${pe.anio} se desembarcaron ${n0(pe.total)} toneladas de pescados y mariscos en los puertos del país, contra ${n0(pe.total_ini)} en ${pe.ini}. Las especies principales fueron ${pe.top[0].toLowerCase()} (${n0(pe.top_t[0])} toneladas), ${pe.top[1].toLowerCase()} (${n0(pe.top_t[1])}) ${yE(pe.top[2].toLowerCase())} (${n0(pe.top_t[2])}). La primera representó el ${pct(pe.top_pct)} del total.`,
  "pesca-nota": `Capturas de la flota comercial desembarcadas en puertos argentinos, en toneladas, según la Subsecretaría de Pesca y Acuicultura. La tabla descargable incluye el total de todas las especies.`,
  "pesca-rio-titulo": `Pesca comercial en ríos por especie, ${pe.rio_anio}`,
  "pesca-rio": `En ${pe.rio_anio} la pesca comercial en aguas continentales registró ${n0(pe.rio_total)} toneladas. El ${pct(pe.rio_top_pct)} fue ${pe.rio_top.toLowerCase()}. Las capturas informadas se concentraron en ${lista(pe.rio_provs)}, sobre todo en ${pe.rio_prov_top} (${pct(pe.rio_prov_top_pct)}).`,
  "pesca-rio-nota": `Captura comercial registrada en ríos y lagunas de las provincias que informan datos, en toneladas. No incluye la pesca deportiva ni la de subsistencia. La tabla descargable muestra cada especie por provincia.`,
  "esperanza-titulo": `Esperanza de vida al nacer por provincia y sexo, ${nv.ev_anio}`,
  esperanza: `En ${nv.ev_anio}, la esperanza de vida al nacer en el país era de ${n1(nv.ev_pais)} años: ${n1(nv.ev_m)} para las mujeres y ${n1(nv.ev_v)} para los varones. Por provincia iba de ${n1(nv.ev_top_v)} años en ${nv.ev_top} a ${n1(nv.ev_low_v)} en ${nv.ev_low}.`,
  "esperanza-nota": `Años que viviría en promedio una persona nacida en ${nv.ev_anio} si se mantuvieran las tasas de mortalidad por edad de ese año. El círculo claro marca a los varones y el lleno a las mujeres. El INDEC publica tablas para 2020, 2021 y 2022, y las de 2020 y 2021 reflejan la mortalidad de la pandemia de covid-19. La línea punteada azul marca el promedio simple de los países de la OCDE en ${OC.esperanza_vida.anio}, para ambos sexos, según el Banco Mundial.`,
  "exportaciones-titulo": `Exportaciones por habitante según provincia de origen, ${nv.ex_anio}`,
  exportaciones: `En ${nv.ex_anio} el país exportó bienes por ${n0(nv.ex_total)} millones de dólares, unos ${n0(nv.ex_pc_pais)} dólares por habitante. Por habitante, las exportaciones producidas en ${nv.ex_top} sumaron ${n0(nv.ex_top_v)} dólares${conVeces(nv.ex_top_v, nv.ex_pc_pais)} y las de ${nv.ex_low}, ${n0(nv.ex_low_v)}${conVeces(nv.ex_low_v, nv.ex_pc_pais)}.` + (nv.ex_sem ? ` En el primer semestre de ${nv.ex_sem.anio}, con datos provisorios, sumaron ${n0(nv.ex_sem.total)} millones de dólares, ${pct(Math.abs(nv.ex_sem.var))} ${nv.ex_sem.var >= 0 ? "más" : "menos"} que en el primer semestre de ${nv.ex_sem.anio - 1}, y subieron en ${nv.ex_sem.suben} de las 24 jurisdicciones.` : ""),
  "exportaciones-nota": `Valor FOB de los bienes exportados según la provincia donde se produjeron. El ${pct(nv.ex_provincial_pct)} del total tiene una provincia de origen identificada. El resto sale de la plataforma continental, es mercadería extranjera o tiene origen indeterminado. La tabla descargable separa productos primarios, manufacturas agropecuarias, manufacturas industriales y combustibles. La población es la proyección ${R.anio_pob} del INDEC.`,
  "censo-titulo": `Servicios, equipamiento y cobertura de salud por provincia, Censo 2022`,
  "censo-nota": `Hogares y personas en viviendas particulares según el Censo 2022. Agua de red: agua corriente de red pública. Cloacas: inodoro con descarga de agua y desagüe a red pública. Internet: conexión en la vivienda, incluida la del celular. Necesidades básicas insatisfechas: hacinamiento, vivienda precaria, sin baño, chicos sin escuela o baja capacidad de subsistencia, según la definición del INDEC. El INDEC no publica estos totales provinciales en un archivo propio: se suman desde los resultados por radio censal, así que pueden diferir levemente de sus cuadros.`,
  "internet-titulo": `Internet fijo por provincia, ${nv.in_trim}`,
  internet: `En el ${nv.in_trim}, ${nv.in_top} tenía ${n1(nv.in_top_v)} accesos a internet fijo cada 100 hogares${aclara("internet_fijo_provincias.accesos_100_hogares", nv.in_top)} y ${nv.in_low}, ${n1(nv.in_low_v)}. La velocidad media de bajada iba de ${n1(nv.ve_top_v)} megabits por segundo en ${nv.ve_top} a ${n1(nv.ve_low_v)} en ${nv.ve_low}.`,
  "internet-nota": `Accesos a internet fijo informados por las empresas prestadoras al ENACOM, divididos por la cantidad de hogares. Incluye conexiones de empresas y oficinas, por eso algunas jurisdicciones superan los 100. La velocidad es el promedio de la velocidad contratada de bajada. No incluye internet por celular, que sí cuenta el Censo 2022 en la ficha anterior.`,
  "extranjeros-titulo": `Personas nacidas en otro país con documento argentino por provincia, ${nv.xt_corte}`,
  extranjeros: `Por cada 100 habitantes del país hay ${n1(nv.xt_pais)} personas nacidas en otro país con documento argentino. ${nv.xt_top} tiene el valor más alto, con ${n1(nv.xt_top_v)}. Los países de nacimiento más frecuentes son ${lista(nv.xt_origen)}. ` +
    `En total, el RENAPER identifica ${n0(MG.renaper.personas)} personas nacidas en otro país, un ${pct(MG.renaper.mas)} más que las que contó el Censo 2022: ` +
    `cuenta documentos con el domicilio que declaró cada persona, que puede estar desactualizado, mientras que el censo cuenta a quienes viven en cada vivienda.`,
  "extranjeros-nota": `Personas nacidas en el extranjero identificadas por el RENAPER, según la provincia del domicilio que declararon en su DNI: es un registro de domicilios declarados, no un conteo de quienes viven en cada provincia, y puede tener domicilios desactualizados. No incluye a quienes viven en el país sin DNI argentino. La población es la proyección ${R.anio_pob} del INDEC.`,
  "fiscal-titulo": `Recursos propios, resultado fiscal y gasto en personal por provincia, ${R.fiscal.anio}`,
  "fiscal-nota": `Administración pública no financiera de cada provincia, ejecución del año completo según el Ministerio de Economía. Recursos propios: ingresos corrientes menos los tributos de origen nacional, como la coparticipación, y las transferencias, más los recursos propios de capital, sobre los ingresos totales. Incluye impuestos provinciales y regalías. Resultado financiero: ingresos totales menos gastos totales, sobre los ingresos totales. Gasto en personal: sueldos y cargas sociales sobre el gasto total. La serie desde ${R.fiscal.ini} está en el explorador de cruces.` +
    Object.entries(R.fiscal.atrasadas).map(([p, a]) => ` ${p} todavía no publicó ${R.fiscal.anio}: figura con ${a}.`).join(""),
  "mapa-dep-titulo": `Indicadores de los ${R.departamentos.n} departamentos del país`,
  "mapa-dep": `Cada provincia se divide en departamentos, partidos o comunas. Este mapa muestra datos de seguridad del SNIC, la estructura de edad de la población identificada por el RENAPER y, según el Censo 2022, dónde nació la población y cómo son las viviendas y los hogares en cada uno. Tocá una provincia para acercarte.`,
  actualizado: `Datos descargados y procesados el ${R.actualizado}.`
};
document.querySelectorAll("[data-t]").forEach(el => { if (TX[el.dataset.t]) el.textContent = TX[el.dataset.t]; });
const $t = k => document.querySelector(`[data-t="${k}"]`) || document.createElement("p");

/* ---------- provincias ---------- */
const PROV = T.empleo_provincias.map(d => [d.codigo_indec, d.territorio]).sort((a,b) => a[1].localeCompare(b[1],"es"));
const NOMBRES = Object.fromEntries(PROV);
/* Banderas provinciales (etapa 7): miniaturas de 72 x 48 (scripts/banderas.py) que se ven a 24 x 16, con el mismo recorte y el
   mismo borde para las 24. Van siempre al lado del nombre: para los lectores de pantalla son decorativas (texto alternativo vacío).
   Donde va "Todo el país" o el total nacional va la bandera argentina (desde octubre de 2026; antes quedaba el lugar vacío).
   Van en un elemento propio, nunca dentro de un texto que se reescribe entero (cambiarTexto o textContent lo borrarían). */
// "00" es la bandera nacional, para "Todo el país" y el total del país (octubre de 2026)
const bandera = (c, cls = "") => NOMBRES[c] || c === "00"
  ? `<img class="bandera${cls ? " " + cls : ""}" src="datos/banderas/${c}.png" alt="" width="24" height="16" loading="lazy" decoding="async">`
  : `<span class="bandera vacia" aria-hidden="true"></span>`;
// código de una provincia por su nombre, como lo escriben otras fuentes (presidentes, gabinetes)
const COD_PROV = Object.fromEntries([...PROV.map(([c, n]) => [n, c]), ["Ciudad Autónoma de Buenos Aires", "02"], ["Ciudad de Buenos Aires", "02"]]);
// La provincia se puede compartir en el enlace (?prov=30) y se recuerda en este navegador
const leerProv = () => new URLSearchParams(location.search).get("prov") || new URLSearchParams(location.hash.split("?")[1] || "").get("prov") || "";
let prov = "";
try { prov = leerProv() || localStorage.getItem("prov") || ""; } catch(_) { prov = leerProv(); }
if (!NOMBRES[prov]) prov = "";
// una provincia que llega en el enlace queda elegida también para las otras páginas
else if (leerProv() === prov) try { localStorage.setItem("prov", prov); } catch(_) {}
function elegir(c, desdeHistorial = false) {
  const antes = prov;
  prov = NOMBRES[c] ? c : "";
  desplegable.marcar();
  try { localStorage.setItem("prov", prov); } catch(_) {}
  if (!desdeHistorial && prov !== antes) {
    const u = new URL(location.href);
    if (prov) u.searchParams.set("prov", prov); else u.searchParams.delete("prov");
    history.pushState({...history.state, prov}, "", u);
  }
  repintarProv();
}
// lo que, además de los gráficos y el perfil, depende de la provincia elegida (indicador, migas, "En cifras", destacados)
const alCambiarProv = [];
// cada entrada del historial recuerda su provincia: "atrás" y "adelante" la restituyen sin agregar entradas.
// Lo que se está mirando queda en su lugar: el navegador llevaría la página a la altura que tenía cuando se cambió la provincia
// (lo hace después de este aviso, por eso se corrige en el cuadro siguiente, antes de dibujarlo)
history.replaceState({...history.state, prov}, "");
addEventListener("popstate", ev => {
  const c = ev.state && "prov" in ev.state ? ev.state.prov : null;
  if (c === null || c === prov) return;
  const ref = document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.closest("article, .explicador, .pasos, .pie-sitio, section");
  const top0 = ref?.getBoundingClientRect().top;
  elegir(c, true);
  if (ref) requestAnimationFrame(() => { if (ref.isConnected) scrollBy({top: ref.getBoundingClientRect().top - top0, behavior: "instant"}); });
});

/* Desplegable propio: botón chico, panel con buscador y lista en dos columnas.
   Teclado: flechas para moverse, Enter para elegir, Escape para cerrar. */
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
    // el botón cerrado, sin bandera (etapa 30): la de la provincia elegida ya está en la barra y en el título del perfil
    valor.textContent = NOMBRES[prov] || "Todo el país";
    items.forEach(li => li.setAttribute("aria-selected", li.dataset.c === prov));
  };
  marcar();
  return {marcar};
})();

/* ---------- utilidades de gráfico ---------- */
function lienzo(el, h, m) {
  el.innerHTML = ""; el.removeAttribute("aria-busy"); el.resaltar = null;
  const w = Math.max(300, el.clientWidth);
  const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${w} ${h}`).attr("role","img");
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
document.addEventListener("pointerdown", ev => { if (!ev.target.closest?.(".grafico")) ocultarTip(); });

/* Animación de entrada: solo la primera vez que el gráfico aparece en pantalla, nunca con movimiento reducido */
const REDUCIR = matchMedia("(prefers-reduced-motion: reduce)").matches;
// la plantilla anota si la página llegó con una transición de vista desde otra página (evento pagereveal)
const LLEGADA = window.LLEGADA || {activa: false};
const EASE = d3.easePolyOut.exponent(4);
/* Movimiento de los gráficos: cada elemento tarda 300 ms y el escalonado entre el primero y el último suma como máximo 150 ms,
   así cada gráfico queda completo en menos de medio segundo. escalon() se usa en .delay(): d3 le pasa la lista de elementos. */
const DUR_G = 300;
const escalon = (d, i, nodos) => i * Math.min(30, 150 / Math.max(1, nodos.length - 1));
function trazar(path, dash) {
  const L = path.node().getTotalLength();
  path.attr("stroke-dasharray", `${L} ${L}`).attr("stroke-dashoffset", L)
    .transition().duration(DUR_G).ease(EASE).attr("stroke-dashoffset", 0)
    .on("end", function() { d3.select(this).attr("stroke-dasharray", dash || null).attr("stroke-dashoffset", null); });
}
/* Al cambiar de provincia, donde solo cambia el resaltado el color pasa de una provincia a la otra en 200 ms, sin redibujar:
   cada gráfico que resalta la provincia deja en su contenedor una función resaltar(). La transición lleva nombre propio
   para no cortar el dibujo de entrada si todavía está en marcha. */
const DUR_C = 200;
const pasar = sel => sel.transition("resalte").duration(DUR_C).ease(d3.easeCubicOut);
const claseProv = (d, base) => d.codigo_indec === prov ? "etq-fuerte" : base;
/* Barras redondeadas (octubre de 2026): las barras simples llevan las puntas redondeadas (4 px, o la mitad del grosor si es menor).
   Las apiladas se redondean enteras con un recorte (clipPath), así las uniones entre tramos quedan rectas. */
const RADIO_BARRA = 4, rBarra = h => Math.min(RADIO_BARRA, h / 2);
let nRecorte = 0;
const recorte = (svg, x, y, w, h, r) => {
  const id = `rb${++nRecorte}`;
  svg.append("defs").append("clipPath").attr("id", id).append("rect").attr("x", x).attr("y", y).attr("width", Math.max(0, w)).attr("height", Math.max(0, h)).attr("rx", r);
  return `url(#${id})`;
};
// rótulos y marcas que acompañan al dibujo: aparecen a mitad del trazo, nunca después del tope
const aparecer = (sel, delay = 0) => sel.attr("opacity", 0).transition().delay(Math.min(delay, 150)).duration(DUR_G).ease(d3.easeCubicOut).attr("opacity", 1);

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
  // en las series mensuales, un año en cada marca (en el celular, uno cada dos), y si son muchos años, uno cada dos o cada cuatro (etapa 25:
  // el EMAE desde 2004 amontonaba 23 años)
  const anios = d3.range(Math.ceil(x.domain()[0]), Math.floor(x.domain()[1]) + 1);
  const paso = angosto ? Math.max(2, Math.ceil(anios.length / 6)) : Math.max(1, Math.ceil(anios.length / 12));
  g.append("g").attr("class","eje").attr("transform",`translate(0,${ih})`).call(cfg.mensual
    ? d3.axisBottom(x).tickValues(anios.filter(v => v % paso === 0)).tickFormat(d3.format("d")).tickSizeOuter(0)
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
    // con cfg.huecos, un período sin dato corta la línea (SUBE: meses que la fuente no publica). Sin eso, la línea lo saltea
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
  // etiquetas directas sin solaparse
  etiquetas.sort((a,b) => a.y - b.y);
  for (let i = 1; i < etiquetas.length; i++) if (etiquetas[i].y - etiquetas[i-1].y < 32) etiquetas[i].y = etiquetas[i-1].y + 32;
  etiquetas.forEach(l => {
    const t = fin.append("text").attr("x", iw + 10).attr("y", l.y - 4).attr("class","etq-fuerte").style("fill", l.s.c);
    t.append("tspan").text(l.s.corto || l.s.lab);
    t.append("tspan").attr("x", iw + 10).attr("dy", 15).attr("class","etq-suave").text((cfg.vf || n0)(l.v));
  });
  if (cfg.anim) aparecer(fin, 800);
  // Lectura por punto en una línea fija arriba del gráfico (idea de USAFacts): muestra el último dato y, al pasar el mouse
  // o deslizar el dedo, el período elegido. El dedo no tapa el valor. Deslizar en vertical sigue moviendo la página.
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

/* Áreas apiladas por mes (etapa 18): la producción de petróleo y de gas por tipo de recurso o por cuenca. La misma grilla, los mismos
   ejes y la misma lectura que las líneas: arriba del gráfico, el último mes y, al pasar el mouse o deslizar el dedo, el mes elegido
   con cada parte y el total. Cada capa lleva su nombre a la derecha, a la altura de su último tramo, si tiene lugar. */
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
  // el borde de arriba de la pila, para leer el total
  const tope = g.append("path").datum(data).attr("fill", "none").attr("stroke", css("--ink")).attr("stroke-width", 1.2).attr("stroke-opacity", .55)
    .attr("d", d3.line().x(d => x(d[cfg.x])).y(d => y(d3.sum(series, s => Math.max(0, d[s.k] || 0)))).curve(d3.curveMonotoneX));
  if (cfg.anim) {
    // el dibujo entra de izquierda a derecha, como el trazo de las líneas
    const id = `ap${++nRecorte}`, r = C.svg.append("defs").append("clipPath").attr("id", id).append("rect").attr("x", -2).attr("y", -20).attr("height", ih + 40).attr("width", 0);
    capas.attr("clip-path", `url(#${id})`); tope.attr("clip-path", `url(#${id})`);
    r.transition().duration(DUR_G).ease(EASE).attr("width", iw + 4).on("end", () => { capas.attr("clip-path", null); tope.attr("clip-path", null); });
  }
  // nombres a la derecha, a la mitad del último tramo de cada capa, sin pisarse
  const ult = pila.map((s, i) => ({s: series[i], y0: s[s.length - 1][0], y1: s[s.length - 1][1]})).filter(o => y(o.y0) - y(o.y1) > 9);
  const etq = ult.map(o => ({o, y: (y(o.y0) + y(o.y1)) / 2})).sort((a, b) => b.y - a.y);
  for (let i = 1; i < etq.length; i++) if (etq[i - 1].y - etq[i].y < 15) etq[i].y = etq[i - 1].y - 15;
  const fin = g.append("g");
  etq.forEach(e => fin.append("text").attr("x", iw + 8).attr("y", e.y).attr("dy", ".35em").attr("class", "etq-fuerte").style("fill", e.o.s.c === "#A9CBEA" ? css("--celeste-fuerte") : e.o.s.c).text(e.o.s.lab));
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

// un nombre que se saldría de la tarjeta se corta con puntos suspensivos y el nombre completo queda al pasar el mouse
// (antes lo cortaba el borde de la pantalla, sobre todo en el celular). Puede ocupar el margen de la tarjeta, como siempre
function recortarEtq(nodo, max) {
  if (!(nodo.getComputedTextLength() > max)) return;
  const completo = nodo.textContent;
  let t = completo;
  while (t.length > 1 && nodo.getComputedTextLength() > max) { t = t.slice(0, -1).trimEnd(); nodo.textContent = t + "…"; }
  d3.select(nodo).append("title").text(completo);
}

// lugar de más a la izquierda del gráfico: el margen de la tarjeta (en las fichas horizontales, lo mismo hacia el texto)
const margenIzq = el => { const t = el.closest(".ficha"), s = el.querySelector("svg"); if (!t || !s) return 0;
  const borde = s.getBoundingClientRect().left - t.getBoundingClientRect().left - 4;
  return Math.max(0, Math.min(borde, parseFloat(getComputedStyle(t).paddingLeft) || 0)); };

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
  // lo que depende de la provincia elegida: se usa al dibujar y otra vez en resaltar(). Con cfg.marcar (un Set de códigos) se
  // resaltan esas provincias y el gráfico no sigue a la provincia elegida del sitio (diagnóstico educativo)
  const marca = cfg.marcar ? (d => cfg.marcar.has(d.codigo_indec)) : (d => d.codigo_indec === prov);
  const hayMarca = cfg.marcar ? cfg.marcar.size > 0 : !!prov;
  const claseProv = (d, base) => marca(d) ? "etq-fuerte" : base;
  // cfg.mejor ("sube" o "baja", etapa 16): verde si el cambio es bueno y rojo si es malo. Cuando el color dice algo (cfg.mejor o
  // cfg.color), la provincia elegida se distingue solo por la opacidad de las demás y su nombre en negrita, sin pisar el color
  const bueno = d => cfg.mejor === "baja" ? d[cfg.k] < 0 : d[cfg.k] > 0;
  const colorCambio = (d, t) => d[cfg.k] === 0 ? css("--faint") : css(bueno(d) ? (t ? "--bueno-texto" : "--bueno") : (t ? "--malo-texto" : "--malo"));
  const relleno = d => cfg.mejor ? colorCambio(d) : cfg.color ? cfg.color(d) : marca(d) ? css("--celeste-fuerte") : css("--celeste");
  const opac = d => hayMarca && !marca(d) ? .55 : 1;
  const barras = filas.append("rect").attr("x", d => x(Math.min(0, d[cfg.k]))).attr("height", y.bandwidth()).attr("rx", rBarra(y.bandwidth()))
    .attr("width", d => Math.abs(x(d[cfg.k]) - x(0))).attr("fill", relleno).attr("opacity", opac);
  // el nombre se vuelve a poner (y a cortar si no entra) también al cambiar de provincia, porque en negrita ocupa más
  const ponerNombre = function(d) { this.textContent = angosto && cfg.corto ? cfg.corto(d) : d.territorio; recortarEtq(this, izq - 10 + margenIzq(el)); };
  const nombres = filas.append("text").attr("x", -10).attr("y", y.bandwidth()/2).attr("dy",".35em").attr("text-anchor","end")
    .attr("class", d => claseProv(d, "etq")).each(ponerNombre);
  const valores = filas.append("text").attr("x", d => d[cfg.k] < 0 ? x(0) + 6 : x(d[cfg.k]) + 6).attr("y", y.bandwidth()/2).attr("dy",".35em")
    .attr("class", d => claseProv(d, "etq-suave")).text(d => (cfg.vf || n1)(d[cfg.k]));
  if (cfg.mejor) valores.style("fill", d => colorCambio(d, true));
  // si los datos mismos cambian con la provincia (los nombres más frecuentes), se redibuja
  if (cfg.marcar) el.resaltar = () => {};
  else if (!cfg.cambiaConProv) el.resaltar = () => {
    pasar(barras).attr("fill", relleno).attr("opacity", opac);
    nombres.attr("class", d => claseProv(d, "etq")).each(ponerNombre); valores.attr("class", d => claseProv(d, "etq-suave"));
  };
  if (cfg.anim) {
    barras.attr("x", x(0)).attr("width", 0).transition().delay(escalon).duration(DUR_G).ease(EASE)
      .attr("x", d => x(Math.min(0, d[cfg.k]))).attr("width", d => Math.abs(x(d[cfg.k]) - x(0)));
    valores.attr("opacity", 0).transition().delay(escalon).duration(DUR_G).attr("opacity", 1);
  }
  // el cuadro (etapa 16): los valores absolutos de cfg.tip, o el valor de la fila, y siempre que haya dato del país una fila "País"
  // (cfg.ref es la línea del país en el gráfico, cfg.pais el valor sin línea). Con cfg.dif = "puntos", también la diferencia en puntos.
  // Sin cuadro en el gráfico de suicidios (cfg.sinTip)
  const vf = cfg.vf || n1, pais = cfg.ref ?? cfg.pais, r1v = v => +(+v).toFixed(1);
  const filaPais = d => pais == null ? "" : `<br><span class="tip-pais">${cfg.paisLab || "País"}: ${vf(pais)}` + (cfg.dif === "puntos" && r1v(d[cfg.k]) !== r1v(pais)
    ? `, ${n1(Math.abs(r1v(d[cfg.k]) - r1v(pais)))} puntos ${r1v(d[cfg.k]) > r1v(pais) ? "más" : "menos"}` : "") + "</span>";
  const tipFila = cfg.sinTip ? null : cfg.tip ? (d => cfg.tip(d) + filaPais(d)) : pais != null ? (d => `<b>${d.territorio}</b><br>${vf(d[cfg.k])}` + filaPais(d)) : null;
  if (tipFila) {
    // toda la fila responde, no solo la barra, y el cuadro muestra los valores absolutos que la barra no dice
    filas.insert("rect", ":first-child").attr("x", -izq).attr("width", iw + izq + 54).attr("height", y.bandwidth()).attr("fill", "transparent");
    filas.on("pointerenter", (ev, d) => mostrarTip(el, tipFila(d), izq + x(Math.max(0, d[cfg.k])), 24 + y(d.codigo_indec)))
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
  // cfg.mejor ("sube" o "baja", etapa 16): el punto de después y el tramo en verde si el cambio es bueno y en rojo si es malo, y la
  // provincia elegida se distingue solo por la opacidad de las demás y su nombre en negrita
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
    // el punto viaja desde el valor de antes hasta el de después: la animación cuenta el cambio
    tramo.attr("x1", d => x(d[a])).transition().delay(escalon).duration(DUR_G).ease(EASE).attr("x1", d => x(d[b]));
    punto.attr("cx", d => x(d[a])).transition().delay(escalon).duration(DUR_G).ease(EASE).attr("cx", d => x(d[b]));
    valor.attr("opacity", 0).transition().delay(escalon).duration(DUR_G).attr("opacity", 1);
  }
  // el cuadro (etapa 16): los dos valores, el cambio en palabras si es un cambio en el tiempo y los valores del país (cfg.pais)
  const r1v = v => +(+v).toFixed(1);
  const cambioTxt = d => { const c = r1v(r1v(d[b]) - r1v(d[a])); return c === 0 ? "Sin cambio" : `${c < 0 ? "Bajó" : "Subió"} ${n1(Math.abs(c))}${cfg.uDif || ""}`; };
  f.on("pointerenter", function(ev, d) { const yy = y(d.codigo_indec) + 24; mostrarTip(el, `<b>${d.territorio}</b><br>${la}: ${vf(d[a])}<br>${lb}: ${vf(d[b])}` +
      (cfg.mejor ? `<br>${cambioTxt(d)}` : "") + (cfg.pais ? `<br><span class="tip-pais">País: ${vf(cfg.pais[0])} y ${vf(cfg.pais[1])}</span>` : ""), x(d[b]) + (angosto?118:150), yy); })
   .on("pointerleave", ocultarTip);
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
  const b = f.append("rect").attr("height", y.bandwidth()).attr("rx", rBarra(y.bandwidth())).attr("width", d => x(d[cfg.k])).attr("fill", css("--celeste"));
  f.append("text").attr("x", -10).attr("y", y.bandwidth()/2).attr("dy",".35em").attr("text-anchor","end").attr("class","etq").text(d => d.grupo);
  const v = f.append("text").attr("x", d => x(d[cfg.k]) + 6).attr("y", y.bandwidth()/2).attr("dy",".35em").attr("class","etq-fuerte").text(d => pct(d[cfg.k]));
  if (cfg.ref != null) {
    g.append("line").attr("x1", x(cfg.ref)).attr("x2", x(cfg.ref)).attr("y1", -4).attr("y2", data.length * fila).attr("stroke", css("--ink")).attr("stroke-dasharray","3 3");
    g.append("text").attr("x", x(cfg.ref) + 5).attr("y", data.length * fila + 12).attr("class","etq-suave").text(cfg.refLab);
  }
  if (cfg.anim) {
    b.attr("width", 0).transition().delay(escalon).duration(DUR_G).ease(EASE).attr("width", d => x(d[cfg.k]));
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
  // al cambiar de provincia, cada barra pasa del valor de la anterior al de la nueva (300 ms), con la escala de cada una
  const antes = !cfg.anim && !REDUCIR && el.pir && el.pir.cod !== cfg.cod ? el.pir : null;
  el.pir = {cod: cfg.cod, mx, d: Object.fromEntries(data.map(d => [d.edad, d]))};
  const titulo = g.append("text").attr("x", centro).attr("y", -30).attr("text-anchor","middle").attr("class","etq-fuerte").text(cfg.nombre);
  g.append("text").attr("x", centro - gap).attr("y", -12).attr("text-anchor","end").attr("class","etq-fuerte").attr("fill",css("--celeste-fuerte")).text("Varones");
  g.append("text").attr("x", centro + gap).attr("y", -12).attr("class","etq-fuerte").attr("fill",css("--sol-fuerte")).text("Mujeres");
  const f = g.selectAll("g.f").data(data).join("g").attr("transform", d => `translate(0,${y(d.edad)})`);
  const rx = rBarra(y.bandwidth());
  const v = f.append("rect").attr("x", d => centro - gap - x(d.vh)).attr("width", d => x(d.vh)).attr("height", y.bandwidth()).attr("rx", rx).attr("fill", css("--celeste"));
  const m = f.append("rect").attr("x", centro + gap).attr("width", d => x(d.mh)).attr("height", y.bandwidth()).attr("rx", rx).attr("fill", css("--sol"));
  const ov = f.append("rect").attr("x", d => centro - gap - x(d.vf)).attr("width", d => x(d.vf)).attr("height", y.bandwidth()).attr("rx", rx).attr("fill","none").attr("stroke", css("--ink")).attr("stroke-width", 1.2);
  const om = f.append("rect").attr("x", centro + gap).attr("width", d => x(d.mf)).attr("height", y.bandwidth()).attr("rx", rx).attr("fill","none").attr("stroke", css("--ink")).attr("stroke-width", 1.2);
  f.append("text").attr("x", centro).attr("y", y.bandwidth()/2).attr("dy",".35em").attr("text-anchor","middle").attr("class","etq-suave").style("font-size", angosto ? "10px" : null).text(d => d.lab);
  f.append("rect").attr("x", 0).attr("width", iw).attr("height", y.bandwidth()).attr("fill","transparent")
    .on("pointermove", (ev, d) => mostrarTip(el, `<b>${d.lab} años</b><br>Varones: ${n1(d.vh)}% en ${cfg.anio} y ${n1(d.vf)}% en ${PI.anio_fin}<br>Mujeres: ${n1(d.mh)}% en ${cfg.anio} y ${n1(d.mf)}% en ${PI.anio_fin}`, centro, y(d.edad) + 48))
    .on("pointerleave", ocultarTip);
  const ley = g.append("g").attr("transform", `translate(${centro - 56},${data.length * fila + 8})`);
  ley.append("rect").attr("width", 12).attr("height", 9).attr("fill", css("--celeste"));
  ley.append("text").attr("x", 16).attr("y", 9).attr("class","etq-suave").text(String(cfg.anio));
  ley.append("rect").attr("x", 64).attr("width", 12).attr("height", 9).attr("fill","none").attr("stroke", css("--ink"));
  ley.append("text").attr("x", 80).attr("y", 9).attr("class","etq-suave").text(PI.anio_fin);
  if (cfg.anim) {
    v.attr("x", centro - gap).attr("width", 0).transition().delay(escalon).duration(DUR_G).ease(EASE).attr("x", d => centro - gap - x(d.vh)).attr("width", d => x(d.vh));
    m.attr("width", 0).transition().delay(escalon).duration(DUR_G).ease(EASE).attr("width", d => x(d.mh));
    aparecer(ov, 700); aparecer(om, 700);
  }
  if (antes) {
    const xa = d3.scaleLinear().domain([0, antes.mx]).range(x.range()), va = d => antes.d[d.edad] || d;
    const ir = sel => sel.transition().duration(DUR_G).ease(EASE);
    ir(v.attr("x", d => centro - gap - xa(va(d).vh)).attr("width", d => xa(va(d).vh))).attr("x", d => centro - gap - x(d.vh)).attr("width", d => x(d.vh));
    ir(m.attr("width", d => xa(va(d).mh))).attr("width", d => x(d.mh));
    ir(ov.attr("x", d => centro - gap - xa(va(d).vf)).attr("width", d => xa(va(d).vf))).attr("x", d => centro - gap - x(d.vf)).attr("width", d => x(d.vf));
    ir(om.attr("width", d => xa(va(d).mf))).attr("width", d => x(d.mf));
    titulo.attr("opacity", 0).transition().duration(DUR_C).attr("opacity", 1);
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
  const v = f.append("rect").attr("x", d => centro - gap - x(d.pct_varones)).attr("width", d => x(d.pct_varones)).attr("height", y.bandwidth()).attr("rx", rBarra(y.bandwidth())).attr("fill", css("--celeste"));
  const m = f.append("rect").attr("x", centro + gap).attr("width", d => x(d.pct_mujeres)).attr("height", y.bandwidth()).attr("rx", rBarra(y.bandwidth())).attr("fill", css("--sol"));
  f.append("text").attr("x", centro).attr("y", y.bandwidth()/2).attr("dy",".35em").attr("text-anchor","middle").attr("class","etq-suave").text(d => d.edad.replace(" y más","+").replace("Menos de ","<"));
  const tv = f.append("text").attr("x", d => centro - gap - x(d.pct_varones) - 5).attr("y", y.bandwidth()/2).attr("dy",".35em").attr("text-anchor","end").attr("class","etq-suave").text(d => n1(d.pct_varones) + "%");
  const tm = f.append("text").attr("x", d => centro + gap + x(d.pct_mujeres) + 5).attr("y", y.bandwidth()/2).attr("dy",".35em").attr("class","etq-suave").text(d => n1(d.pct_mujeres) + "%");
  if (cfg.anim) {
    v.attr("x", centro - gap).attr("width", 0).transition().delay(escalon).duration(DUR_G).ease(EASE)
      .attr("x", d => centro - gap - x(d.pct_varones)).attr("width", d => x(d.pct_varones));
    m.attr("width", 0).transition().delay(escalon).duration(DUR_G).ease(EASE).attr("width", d => x(d.pct_mujeres));
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
  if (cfg.anim) r.attr("opacity", 0).transition().delay(escalon).duration(DUR_G).attr("opacity", 1);
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
  // con banderas, el lugar de los nombres crece lo que ocupa la bandera y un poco más ("Fernández de Kirchner" entra entero en el celular)
  const izq = cfg.izq ? cfg.izq(angosto) : cfg.bandera ? (angosto ? 172 : 190) : (angosto ? 112 : 150), xNom = cfg.bandera ? -40 : -10;
  // a la derecha, lugar para que el "100%" del eje no se corte
  const C = lienzo(el, data.length * fila + 30, {t:22, r:18, b:6, l: izq});
  const {g, iw} = C;
  // por defecto, porcentajes de 0 a 100 (cfg.max, cfg.ticks y cfg.ejeF cambian la escala, como en los años en el Congreso)
  const x = d3.scaleLinear().domain([0, cfg.max || 100]).range([0, iw]);
  const y = d3.scaleBand().domain(data.map(d => d.codigo_indec)).range([0, data.length * fila]).padding(.22);
  g.append("g").attr("class","eje").call(d3.axisTop(x).tickValues(cfg.ticks || [0, 25, 50, 75, 100]).tickFormat(cfg.ejeF || (v => v + "%")).tickSize(0).tickPadding(6)).call(a => a.select(".domain").remove());
  const f = g.selectAll("g.f").data(data).join("g").attr("class","f").attr("transform", d => `translate(0,${y(d.codigo_indec)})`);
  const clase = d => (cfg.fuerte ? cfg.fuerte(d) : d.codigo_indec === prov || d.codigo_indec === "00") ? "etq-fuerte" : "etq";
  // con cfg.sinProv, las filas no son provincias (personas, años) y la provincia elegida no aclara las demás
  const opac = d => !cfg.sinProv && prov && d.codigo_indec !== prov && d.codigo_indec !== "00" ? .55 : 1;
  const nombres = f.append("text").attr("x", xNom).attr("y", y.bandwidth()/2).attr("dy",".35em").attr("text-anchor","end").attr("class", clase).text(d => d.territorio);
  // nombres largos (personas): se cortan con puntos suspensivos y el completo queda en el cuadro
  if (cfg.recortar) nombres.each(function() { recortarEtq(this, izq + xNom - 4); });
  // banderas con las esquinas redondeadas como en el resto del sitio: un recorte para todas (en proporción a cada imagen)
  let esquinas = "";
  if (cfg.bandera) {
    esquinas = `band${++nRecorte}`;
    C.svg.append("defs").append("clipPath").attr("id", esquinas).attr("clipPathUnits", "objectBoundingBox")
      .append("rect").attr("width", 1).attr("height", 1).attr("rx", 3 / 24).attr("ry", 3 / 16);
  }
  if (cfg.bandera) f.each(function(d) {
    // bandera de 24 x 16 con el mismo borde que en el resto del sitio, o un ícono neutro si la fila reúne a varias provincias
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
    const t = d3.select(this).selectAll("text.v").data(partes.filter(p => x(p.x0 + p.v) - x(p.x0) > 34)).join("text").attr("class","v")
      .attr("x", p => x(p.x0) + 5).attr("y", y.bandwidth()/2).attr("dy",".35em").attr("font-size", 11.5).attr("font-family","var(--mono)")
      .attr("fill", p => p.k.texto || "#fff").text(p => n0(p.v));
    if (cfg.anim) { r.attr("width", 0).transition().duration(DUR_G).ease(EASE).attr("width", p => Math.max(0, x(p.x0 + p.v) - x(p.x0) - (p.v > 0 ? 1 : 0)));
      aparecer(t, 150); }
    // un texto al final de la barra (el total de años)
    if (cfg.alFinal) { const tf = d3.select(this).append("text").attr("x", x(acc) + 5).attr("y", y.bandwidth()/2).attr("dy",".35em").attr("font-size", 11.5)
      .attr("font-family","var(--mono)").attr("fill", "var(--ink)").text(cfg.alFinal(d)); if (cfg.anim) aparecer(tf, 150); }
  });
  f.on("pointerenter", function(ev, d) {
      mostrarTip(el, `<b>${d.territorio}</b>${cfg.tipExtra ? cfg.tipExtra(d) : ""}<br>` + cfg.claves.filter(k => d[k.k] != null).map(k => `<span style="color:${k.c}">■</span> ${k.lab}: ${(cfg.tipF || pct)(d[k.k])}`).join("<br>"),
        izq + iw / 2, y(d.codigo_indec) + 22); })
   .on("pointerleave", ocultarTip);
}

/* Columnas apiladas por año (composición del Congreso) */
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
    .on("pointerleave", ocultarTip);
}

/* Mapa de provincias: color según el porcentaje del territorio protegido y círculos para las áreas nacionales */
let GEO = null;
const cargarGeo = () => GEO ? Promise.resolve(GEO) : fetch("datos/provincias.geojson").then(r => r.json()).then(j => (GEO = j));
function mapaAreas(anim) {
  const el = G("mapa-areas");
  if (!el || !el.offsetParent) return;
  if (!GEO) { cargarGeo().then(() => mapaAreas(anim)).catch(() => {}); return; }
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
  el.resaltar = () => { provs.attr("class", d => "prov" + (d.properties.codigo_indec === prov ? " elegida" : "")); provs.filter(".elegida").raise(); };
  provs.on("pointermove", (ev, d) => {
      const v = val[d.properties.codigo_indec], [mx, my] = d3.pointer(ev, el);
      mostrarTip(el, `<b>${v ? v.territorio : d.properties.nombre}</b><br>${v ? pct(v.pct_territorio) : "Sin dato"} del territorio protegido` +
        (v ? `<br>${n0(v.ha_terrestres)} hectáreas` : ""), mx, my);
    }).on("pointerleave", ocultarTip);
  const areas = T.parques_nacionales_lista.filter(d => !d.marina && d.lat != null && d.lng != null);
  const r = d3.scaleSqrt().domain([0, d3.max(areas, d => d.hectareas)]).range([1.6, w < 420 ? 11 : 15]);
  const burb = svg.append("g").selectAll("circle").data(areas.sort((a, b) => b.hectareas - a.hectareas)).join("circle")
    .attr("class", "burbuja").attr("cx", d => proy([d.lng, d.lat])[0]).attr("cy", d => proy([d.lng, d.lat])[1]).attr("r", d => r(d.hectareas));
  if (anim) burb.attr("opacity", 0).transition().delay(escalon).duration(DUR_G).attr("opacity", 1);
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

/* Mapa por departamento (etapa 18): un indicador del Censo 2022 en los 527 departamentos, con la geometría de la herramienta de
   departamentos (se baja una sola vez para todas las fichas). El color divide a los departamentos en cinco grupos del mismo tamaño.
   Con una provincia elegida en Tu provincia, el mapa se acerca a ella y la mantiene en su escala de colores del país. Tocar el mapa
   no elige la provincia: eso se hace solo en Tu provincia. */
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
  const w = Math.min(560, Math.max(300, el.clientWidth)), h = NOMBRES[prov] ? Math.round(w * 1.1) : Math.round(w * 1.55);
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
  deps.on("pointermove", (ev, f) => {
    const v = val[f.properties.id], [mx, my] = d3.pointer(ev, el);
    mostrarTip(el, `<b>${f.properties.nombre}</b>, ${NOMBRES[f.properties.prov] || ""}<br>${cfg.nombre}: ${v == null ? "sin dato" : cfg.vf(v)}` +
      (cfg.extra ? cfg.extra(f.properties.id) : ""), mx, my);
  }).on("pointerleave", ocultarTip);
  // leyenda: los cinco grupos con sus cortes
  const ley = svg.append("g").attr("transform", `translate(${Math.max(6, w / 2 - 125)},${h + 8})`);
  COLORES_DEP.forEach((c, i) => ley.append("rect").attr("x", i * 50).attr("width", 48).attr("height", 10).attr("rx", 2).attr("fill", c));
  ["", ...cortes.map(v => cfg.vf(v))].forEach((t, i) => ley.append("text").attr("class", "mp-ley").attr("x", i * 50).attr("y", 26)
    .attr("text-anchor", i ? "middle" : "start").text(t));
}

/* Mapa de los pozos no convencionales (etapa 19): cada pozo es un punto con el color del año en que empezó a producir, sobre las áreas de
   concesión. Dos vistas: la cuenca Neuquina y todo el país. Al pasar el mouse (o tocar), el pozo más cercano, a menos de 10 píxeles, o el
   área que queda debajo. No sigue a la provincia elegida: la cuenca cruza provincias, y la provincia se elige solo en Tu provincia. */
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
  // el fondo (provincias y áreas) se dibuja entero: el gráfico lo recorta a su recuadro
  const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${w} ${h}`).attr("role", "img").style("overflow", "hidden")
    .attr("aria-label", `Mapa de los ${n0(pozos.length)} pozos no convencionales${cuenca ? " de la cuenca Neuquina" : " del país"} sobre las áreas de concesión`);
  // la cuenca se encuadra con el 96% central de sus pozos, así unos pocos alejados no achican el resto
  const enC = pozos.filter(p => PROV_CUENCA.has(p.provincia)), qx = enC.map(p => p.x).sort(d3.ascending), qy = enC.map(p => p.y).sort(d3.ascending);
  const [x0, x1, y0, y1] = [d3.quantile(qx, .02), d3.quantile(qx, .98), d3.quantile(qy, .02), d3.quantile(qy, .98)];
  const marco = cuenca ? {type: "MultiPoint", coordinates: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]} : GEO;
  const proy = d3.geoMercator().fitExtent([[10, 10], [w - 10, h - 10]], marco), camino = d3.geoPath(proy);
  const areas = topojson.feature(TOPO_CONC, TOPO_CONC.objects.concesiones).features;
  const prodArea = Object.fromEntries(T.areas_produccion.map(a => [a.codigo, a]));
  svg.append("g").selectAll("path").data(GEO.features).join("path").attr("d", camino).attr("fill", css("--superficie-2")).attr("stroke", css("--borde")).attr("stroke-width", .8);
  svg.append("g").selectAll("path").data(areas).join("path").attr("d", camino).attr("fill", "#DCE8F4").attr("stroke", "#9DB9D6").attr("stroke-width", .5);
  // en la cuenca, el nombre de cada provincia en el centro de la parte que se ve, debajo de los pozos
  if (cuenca) svg.append("g").selectAll("text").data(GEO.features.map(f => {
    const [[a, b], [c, d]] = camino.bounds(f), x0 = Math.max(a, 0), x1 = Math.min(c, w), y0 = Math.max(b, 0), y1 = Math.min(d, h);
    return {n: NOMBRES[f.properties.codigo_indec] || f.properties.nombre, x: (x0 + x1) / 2, y: (y0 + y1) / 2, ok: x1 - x0 > 80 && y1 - y0 > 40};
  }).filter(d => d.ok)).join("text").attr("class", "etq-suave").attr("x", d => d.x).attr("y", d => d.y).attr("text-anchor", "middle").attr("opacity", .8).text(d => d.n);
  const cortes = PG.map_cortes, r = cuenca ? 2.3 : 1.6;
  const vis = pozos.map(p => { const [px, py] = proy([p.x, p.y]); return {...p, px, py, c: d3.bisectLeft(cortes, +p.inicio.slice(0, 4)), act: p.pet_bpd > 0 || p.gas_miles_m3d > 0}; })
    .filter(p => p.px >= 0 && p.px <= w && p.py >= 0 && p.py <= h).sort((a, b) => a.act - b.act || a.c - b.c);  // los que producen y los más nuevos, arriba
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
  // el mapa termina de dibujarse después de bajar la geometría: recién ahí se sabe si va "Descargar imagen"
  const fi = el.closest(".ficha"), bi = fi?.querySelector(".accion.imagen"); if (bi) bi.hidden = !svgUnico(fi);
}

/* Mapa de las centrales eléctricas (etapa 19): un círculo por central, con el color de su tecnología y el tamaño de su potencia. Las que no
   informan potencia van vacías, con un tamaño fijo. Al pasar el mouse (o tocar), la central más cercana a menos de 12 píxeles. */
function mapaCentrales(el, cfg) {
  if (!GEO) {
    if (!el.querySelector("svg")) esperando(el);
    cargarGeo().then(() => mapaCentrales(el, cfg)).catch(() => sinDatos(el, "No se pudo cargar el mapa."));
    return;
  }
  const w = Math.min(560, Math.max(300, el.clientWidth)), h = Math.round(w * 1.55);
  el.innerHTML = ""; el.removeAttribute("aria-busy"); el.resaltar = null;
  const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${w} ${h}`).attr("role", "img").style("overflow", "hidden")
    .attr("aria-label", `Mapa de las ${n0(T.centrales.length)} centrales eléctricas del listado de la Secretaría de Energía, por tecnología y potencia`);
  const proy = d3.geoMercator().fitExtent([[6, 6], [w - 6, h - 6]], GEO), camino = d3.geoPath(proy);
  svg.append("g").selectAll("path").data(GEO.features).join("path").attr("d", camino).attr("fill", css("--superficie-2")).attr("stroke", css("--borde")).attr("stroke-width", .8);
  const radio = d3.scaleSqrt().domain([0, d3.max(T.centrales, c => c.potencia_mw)]).range([2.2, w > 400 ? 15 : 11]);
  const vis = T.centrales.map(c => { const [px, py] = proy([c.x, c.y]); return {...c, px, py, r: c.potencia_mw ? radio(c.potencia_mw) : 2.8}; })
    .sort((a, b) => b.r - a.r);  // las grandes abajo, así no tapan a las chicas
  const circ = svg.append("g").selectAll("circle").data(vis).join("circle").attr("cx", c => c.px).attr("cy", c => c.py).attr("r", c => c.r)
    .attr("fill", c => c.potencia_mw ? COL_CEN[c.tecnologia] : "#fff").attr("fill-opacity", .85)
    .attr("stroke", c => c.potencia_mw ? "#fff" : COL_CEN[c.tecnologia]).attr("stroke-width", c => c.potencia_mw ? .6 : 1.4);
  if (cfg.anim && !REDUCIR) circ.attr("opacity", 0).transition().delay(escalon).duration(DUR_G).attr("opacity", 1);
  const anillo = svg.append("circle").attr("fill", "none").attr("stroke", css("--ink")).attr("stroke-width", 1.5).attr("opacity", 0);
  const dl = d3.Delaunay.from(vis, c => c.px, c => c.py);
  const tip = c => `<b>${tituloArea(c.nombre)}</b><br>${c.detalle}<br>${c.potencia_mw ? n0(c.potencia_mw) + " megavatios" : "Sin dato de potencia en el listado"}` +
    `<br>${[c.departamento, c.provincia].filter(Boolean).join(", ")}<br>${c.sistema}`;
  const ver = ev => {
    const [sx, sy] = d3.pointer(ev, svg.node()), [ex, ey] = d3.pointer(ev, el), c = vis[dl.find(sx, sy)];
    if (c && Math.hypot(c.px - sx, c.py - sy) < Math.max(12, c.r)) { anillo.attr("cx", c.px).attr("cy", c.py).attr("r", c.r + 3).attr("opacity", 1); return mostrarTip(el, tip(c), ex, ey); }
    anillo.attr("opacity", 0); ocultarTip();
  };
  svg.append("rect").attr("width", w).attr("height", h).attr("fill", "transparent").style("touch-action", "pan-y")
    .on("pointermove", ver).on("pointerdown", ver).on("pointerleave", () => { anillo.attr("opacity", 0); ocultarTip(); });
  const fi = el.closest(".ficha"), bi = fi?.querySelector(".accion.imagen"); if (bi) bi.hidden = !svgUnico(fi);
}

/* ---------- fichas ---------- */
const MED = {dinamica: "pais", rotacion: "edad", fiscal: "autonomia", censo: "cloaca", internet: "accesos_100_hogares", empleo: "cada_100", pisa: "mat", aprender: "mat", protegida: "pct_territorio", eti: "cada_1000", "patentes-prov": "autos_1000", nombres: "F", "visitas-parque": "visitas_ult"};
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
  envejecimiento: a => pesas(G("envejecimiento"), {anim:a, data: T.envejecimiento_provincias, a:"vejez_hoy", b:"vejez_2040", la: String(EV.anio), lb: String(EV.anio_fin), vf: n1, af: v => v,
    pais: [EV.hoy, EV.fin]}),
  adolescentes: a => pesas(G("adolescentes"), {anim:a, data: T.madres_adolescentes_provincias, a: ADO_INI, b: ADO_ULT, la: String(nac.anio_ini), lb: String(nac.anio_ult),
    mejor: "baja", uDif: " puntos", pais: [nac.pct_ini, nac.pct_ult]}),
  mortalidad: a => pesas(G("mortalidad"), {anim:a, data: T.mortalidad_infantil_provincias, a:"tmi_base", b:"tmi_actual", la: mo.tri_base, lb: mo.tri_act,
    mejor: "baja", pais: [mo.pais_base, mo.pais_act],
    vf: n1, af: v => v, ref: OC.mortalidad_infantil.ocde, refLab: `Promedio OCDE ${OC.mortalidad_infantil.anio}: ${n1(OC.mortalidad_infantil.ocde)}`}),
  sube: a => lineas(G("sube"), {anim:a, data: T.sube_dia_habil, x:"t", y0:0, mensual:true, huecos:true, ref: su.pre_millones * 1e6,
    refLab: "Marzo de 2020, antes del aislamiento", refLabCorto: "Marzo de 2020", vf: v => n2(v / 1e6) + " M", yf: v => n1(v / 1e6) + " M",
    xl: d => { const [y, m] = d.periodo.split("-"); return `${MESES[+m - 1]} ${y}`; },
    series:[{k:"total", lab:"Tarjetas", c:NAR, w:2.4}]}),
  suicidio: a => lineas(G("suicidio"), {anim:a, data: T.suicidio_serie, x:"anio", y0:0, vf: n1, yf: v => v,
    series:[{k:"tasa_varones", lab:"Varones", c:NAR, w:2}, {k:"tasa", lab:"Total", c:css("--ink"), w:2.6}, {k:"tasa_mujeres", lab:"Mujeres", c:FRI, w:2}]}),
  "suicidio-prov": a => barrasH(G("suicidio-prov"), {anim:a, data: T.suicidio_provincias, k:"tasa", ref: R.suicidio.tasa, refLab:`País ${n1(R.suicidio.tasa)}`, sinTip: true}),
  edad: a => piramide(G("edad"), {anim:a, data: T.suicidio_edad_sexo}),
  empresas: a => barrasH(G("empresas"), {anim:a, data: T.empresas_provincias, k:"cada_1000_hab", ref: EM.pais_1000,
    tip: d => `<b>${d.territorio}</b><br>${n1(d.cada_1000_hab)} cada 1.000 habitantes<br>${n0(d.empresas)} empresas con empleados`, refLab: `País ${n1(EM.pais_1000)}`}),
  dinamica: a => ($("clave-dinamica").hidden = MED.dinamica === "pais") ? lineas(G("dinamica"), {anim:a, data: T.empresas_serie_pais, x:"anio", y0:0, vf: v => n1(v) + "%", yf: v => v + "%",
        series: [{k:"tasa_entrada", c: css("--celeste-fuerte"), lab:"Aperturas"}, {k:"tasa_salida", c: css("--sol-fuerte"), lab:"Cierres"}]})
    : barrasH(G("dinamica"), {anim:a, data: T.empresas_provincias, k:`tasa_neta_${EM.ult}`, vf: v => (v > 0 ? "+" : "") + n1(v) + "%", af: v => v + "%",
        ref: EM.neta, refLab: `País ${n1(EM.neta)}%`, mejor: "sube"}),
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
    la: String(es.ini), lb: String(es.fin), x0: 50, mejor: "sube", uDif: " puntos", pais: [es.pais_ini, es.pais_fin]}),
  aprender: a => barrasH(G("aprender"), {anim:a, data: T.aprender_provincias, k:`${MED.aprender}_logra`,
    ref: MED.aprender === "mat" ? ap.mat : ap.len, refLab: `País ${pct(MED.aprender === "mat" ? ap.mat : ap.len)}`,
    vf: v => n1(v) + "%", af: v => v + "%", dif: "puntos"}),
  protegida: a => MED.protegida === "pct_territorio"
    ? barrasH(G("protegida"), {anim:a, data: T.areas_protegidas_provincias, k:"pct_territorio", ref: nt.pct, refLab:`País ${pct(nt.pct)}`,
        ref2: OC.protegida.ocde, ref2Lab: `Promedio OCDE ${OC.protegida.anio}: ${pct(OC.protegida.ocde)}`, vf: v => n1(v) + "%", af: v => v + "%", dif: "puntos"})
    : barrasH(G("protegida"), {anim:a, data: T.areas_protegidas_provincias, k:"m2_por_habitante", ref: nt.m2_pais, refLab:`País ${n0(nt.m2_pais)} m²`,
        vf: v => n0(v) + " m²", af: v => n0(v)}),
  parques: a => lineas(G("parques"), {anim:a, data: T.parques_nacionales_historia, x:"anio", y0:0, escalones:true, vf: v => M(v) + " ha", yf: M,
    series:[{k:"ha_terrestres", lab:"Terrestres", c:NAR, w:3}, {k:"ha_marinas", lab:"Marinas", c:FRI, w:2.4}]}),
  especies: a => barrasH(G("especies"), {anim:a, data: T.especies_areas_nacionales, k:"animales", vf: n0, af: n0, l: 250, lAngosto: 170}),
  "sube-modos": a => lineas(G("sube-modos"), {anim:a, data: T.sube_dia_habil, x:"t", y0:0, mensual:true, huecos:true,
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
      .map(d => ({codigo_indec: d.nombre, territorio: d.mostrar || d.nombre, cantidad: d.cantidad})), k:"cantidad", vf: n0, af: n0, cambiaConProv: true});
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
    vf: v => n1(v) + " años", af: v => v, x0: 66, ref: OC.esperanza_vida.ocde, refLab: `Promedio OCDE ${OC.esperanza_vida.anio}: ${n1(OC.esperanza_vida.ocde)}`,
    pais: [nv.ev_v, nv.ev_m]}),
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
      vf: v => n1(v) + "%", af: v => v + "%", dif: "puntos"});
  },
  internet: a => MED.internet === "mbps"
    ? barrasH(G("internet"), {anim:a, data: T.internet_fijo_provincias, k:"mbps", vf: v => n0(v) + " Mbps", af: n0})
    : barrasH(G("internet"), {anim:a, data: T.internet_fijo_provincias, k:"accesos_100_hogares", vf: n1, af: n0}),
  extranjeros: a => barrasH(G("extranjeros"), {anim:a, data: T.extranjeros_provincias, k:"cada_100", ref: nv.xt_pais, refLab: `País ${n1(nv.xt_pais)}`, vf: n1, af: n0}),
  empleo: a => ($("clave-empleo").hidden = MED.empleo === "cada_100") ? barrasH(G("empleo"), {anim:a, data: T.empleo_provincias, k:"cada_100", ref: R.empleo.cada_100_pais,
        tip: d => `<b>${d.territorio}</b><br>${n1(d.cada_100)} cada 100 habitantes<br>${n0(d.miles * 1000)} asalariados registrados<br>${n0(d.poblacion)} habitantes`, refLab:`País ${n1(R.empleo.cada_100_pais)}`})
    : barrasH(G("empleo"), {anim:a, data: T.empleo_provincias, k:"var_12m",
        tip: d => `<b>${d.territorio}</b><br>${n0(d.miles * 1000)} asalariados registrados<br>${n0(d.miles_hace12 * 1000)} doce meses antes`, vf: v => (v > 0 ? "+" : "") + n1(v) + "%", af: v => v + "%",
        mejor: "sube", pais: R.empleo.var_nac}),
};

/* ---------- petróleo y gas, construcción y vivienda (etapa 18) ---------- */
Object.assign(MED, {refugio: "anio", supermercados: "prov", "cuentas-nacion": "resultado", recaudacion: "impuesto", "empleo-publico": "prov", "nacidos-otro-pais": "prov", "migracion-interna": "prov", radicaciones: "anio", "argentinos-exterior": "anio", inflacion: "doce", "inflacion-rubros": "division", canastas: "region", emae: "mes", "electricidad-provincias": "prov", "electricidad-sectores": "ind", salarios: "prov", "salario-docente": "prov", "inversion-educativa": "alumno",
  delitos: "tipo", robos: "robos", homicidios: "prov", carceles: "serie", combustibles: "nafta", "combustibles-vista": "prov", subsidios: "pbi", "obra-publica": "prov", "gas-consumo": "prov", centrales: "mapa", "mapa-pozos": "cuenca", productividad: "pozo", fracturas: "etapas", "pozos-terminados": "anio", petroleo: "tipo", gas: "tipo", "gas-hogares-vista": "prov", "hidro-provincias": "pet_kbd", "areas-hidro": "pet", arArea: "", pozos: "pozo", "empresas-hidro": "pct_pet",
  "empleo-hidro": "prov", regalias: "pct_regalias", reservas: "pet", "mundo-petroleo": "crudo_kbd", insumos: "var_12m",
  "empleo-construccion": "construccion_cada_1000", "trabajadores-vista": "prov", vivienda: "pct_alquila", "vivienda-vista": "prov"});
const COL_TIPO = {conv: "#A9CBEA", tight: "#F6B40E", shale: "#1F5E97"};
const SERIES_TIPO = p => [{k: `${p}_conv`, lab: "Convencional", c: COL_TIPO.conv}, {k: `${p}_tight`, lab: "Tight", c: COL_TIPO.tight}, {k: `${p}_shale`, lab: "Shale", c: COL_TIPO.shale}];
const SERIES_CUENCA = p => [["cuyana", "Cuyana", "#C3CAD2"], ["noroeste", "Noroeste", "#F6B40E"], ["austral", "Austral", "#A9CBEA"], ["gsj", "Golfo San Jorge", "#74ACDF"],
  ["neuquina", "Neuquina", "#1F5E97"]].map(([k, lab, c]) => ({k: `${p}_${k}`, lab, c}));
const conT = r => ({...r, t: r.anio + (r.mes - 1) / 12});
const mesP = r => `${MESES[r.mes - 1]} de ${r.anio}`;
const mesPer = p => `${MESES[+p.slice(5, 7) - 1]} de ${p.slice(0, 4)}`;
const tPer = p => +p.slice(0, 4) + (+p.slice(5, 7) - 1) / 12;
const leyenda = (id, claves) => { $(id).innerHTML = claves.map(k => `<span><i style="background:${k.c}"></i>${k.lab}</span>`).join(""); };
// los gráficos que cambian entre barras y mapa: la leyenda de las barras se oculta con el mapa
const bblF = v => v >= 100 ? n0(v) : n1(v);
// áreas de concesión (etapa 21): las chicas se cuentan en barriles o en miles de metros cúbicos, para que no digan "0,0 mil"
const CUENCA_DE = {"Golfo San Jorge": "del Golfo San Jorge", Noroeste: "del Noroeste", Noreste: "del Noreste"};
const cantArea = (v, gas) => gas ? (v >= .1 ? `${n1(v)} millones de metros cúbicos` : `${n0(v * 1000)} mil metros cúbicos`) + " de gas por día"
  : (v >= 1 ? `${kbdF(v)} mil barriles` : `${n0(v * 1000)} barriles`) + " de petróleo por día";
function textoArea(r, tot, gas) {
  const k = gas ? "gas_mmm3d" : "pet_kbd", nc = gas ? r.pct_gas_nc : r.pct_pet_nc, p = gas ? r.pct_gas_pais : r.pct_pet_pais;
  const t = `${tituloArea(r.nombre)} está ${r.territorio === "Mar argentino" ? "en el mar argentino, a más de doce millas de la costa" : "en " + r.territorio}, en la cuenca ${CUENCA_DE[r.cuenca] || r.cuenca}. `;
  if (!(r[k] > 0)) return t + `En ${PG.areas_anio} no produjo ${gas ? "gas" : "petróleo"}.`;
  const mx = d3.greatest(tot, d => d.v);
  return t + `En ${PG.areas_anio} produjo ${cantArea(r[k], gas)}, ${p < .05 ? "menos del 0,1%" : "el " + pct(p)} del país, ` +
    (nc >= 99.95 ? "todo de formaciones no convencionales" : nc > 0 ? `el ${pct(nc)} de formaciones no convencionales` : "todo de formaciones convencionales") +
    `, y ${r.empresa} declaró la mayor parte. ` +
    (mx.anio === PG.areas_anio ? `Es su año de mayor producción desde ${PG.areas_ini}.` : `Su año de mayor producción fue ${mx.anio}, con ${cantArea(mx.v, gas)}.`);
}
Object.assign(DIB, {
  petroleo: conTablas("petroleo", ["hidrocarburos_mensual"], a => {
    $t("petroleo").textContent = LEAD.petroleo(MED.petroleo);
    areasApiladas(G("petroleo"), {anim: a, data: T.hidrocarburos_mensual.map(conT), x: "t", series: MED.petroleo === "cuenca" ? SERIES_CUENCA("pet") : SERIES_TIPO("pet"),
      vf: kbdF, yf: n0, xl: mesP, unidad: "mil barriles por día"});
  }),
  gas: conTablas("gas", ["hidrocarburos_mensual"], a => {
    $t("gas").textContent = LEAD.gas(MED.gas);
    areasApiladas(G("gas"), {anim: a, data: T.hidrocarburos_mensual.map(conT), x: "t", series: MED.gas === "cuenca" ? SERIES_CUENCA("gas") : SERIES_TIPO("gas"),
      vf: n1, yf: n0, xl: mesP, unidad: "millones de m³ por día"});
  }),
  "gas-hogares": conTablas("gas-hogares", () => MED["gas-hogares-vista"] === "mapa" ? ["vivienda_departamentos"] : [], a => {
    const mapa = MED["gas-hogares-vista"] === "mapa";
    $("gas-hogares-ley").hidden = mapa;
    if (mapa) return mapaDep(G("gas-hogares"), {anim: a, filas: T.vivienda_departamentos, k: "pct_gas_red", nombre: "Hogares que cocinan con gas de red", vf: pct});
    const cl = [{k: "pct_gas_red", lab: "Gas de red", c: "#1F5E97"}, {k: "pct_zeppelin", lab: "Gas a granel (zeppelin)", c: "#74ACDF", texto: "#18212B"},
      {k: "pct_garrafa", lab: "Garrafa", c: "#F6B40E", texto: "#18212B"}, {k: "pct_electricidad", lab: "Electricidad", c: "#C6DCF1", texto: "#18212B"},
      {k: "pct_lena", lab: "Leña o carbón", c: "#85340A"}];
    leyenda("gas-hogares-ley", cl);
    const filas = [{codigo_indec: "00", territorio: "Todo el país", ...VV}, ...[...T.vivienda_provincias].sort((p, q) => q.pct_gas_red - p.pct_gas_red)];
    apiladasH(G("gas-hogares"), {anim: a, claves: cl, data: filas});
  }),
  "hidro-provincias": a => {
    const k = MED["hidro-provincias"], gas = k === "gas_mmm3d";
    $t("hidro-provincias").textContent = LEAD["hidro-provincias"](k);
    barrasH(G("hidro-provincias"), {anim: a, data: T.hidrocarburos_provincias.filter(d => d[k] > .005), k, vf: gas ? n1 : kbdF, af: n0,
      tip: d => `<b>${d.territorio}</b><br>` + (gas ? `${n1(d.gas_mmm3d)} millones de m³ por día<br>${pct(d.pct_gas_pais)} del gas del país<br>No convencional: ${pct(d.pct_gas_nc || 0)}<br>Diez años antes: ${n1(d.gas_mmm3d_antes)}`
        : `${kbdF(d.pet_kbd)} mil barriles por día<br>${pct(d.pct_pet_pais)} del petróleo del país<br>No convencional: ${pct(d.pct_pet_nc || 0)}<br>Diez años antes: ${kbdF(d.pet_kbd_antes)}`)});
  },
  "areas-hidro": conTablas("areas-hidro", () => MED.arArea ? ["areas_produccion", "areas_serie"] : ["areas_produccion"], a => {
    const gas = MED["areas-hidro"] === "gas", k = gas ? "gas_mmm3d" : "pet_kbd", el = G("areas-hidro"), sel = $("ar-sel");
    // la lista se arma la primera vez: las áreas de cada provincia, en orden alfabético
    if (sel.options.length < 2) d3.groups(T.areas_produccion, r => r.territorio).sort((p, q) => p[0].localeCompare(q[0], "es")).forEach(([t, rs]) => {
      const g = document.createElement("optgroup"); g.label = t;
      rs.map(r => [r.codigo, tituloArea(r.nombre)]).sort((p, q) => p[1].localeCompare(q[1], "es")).forEach(([c, n]) => g.append(new Option(n, c)));
      sel.append(g);
    });
    const r = MED.arArea && T.areas_produccion.find(x => x.codigo === MED.arArea);
    $("areas-hidro-ley").hidden = !r;
    if (!r) {
      $t("areas-hidro").textContent = LEAD["areas-hidro"](MED["areas-hidro"]);
      const filas = [...T.areas_produccion].sort((p, q) => q[k] - p[k]).slice(0, 15).map(x => ({...x, provNom: x.territorio, prov: x.codigo_indec, codigo_indec: x.codigo, territorio: tituloArea(x.nombre)}));
      barrasH(el, {anim: a, data: filas, k, vf: gas ? n1 : kbdF, af: n0, l: 196, lAngosto: 150, marcar: new Set(filas.filter(x => x.prov === prov).map(x => x.codigo_indec)),
        tip: d => `<b>${d.territorio}</b><br>${d.provNom}, cuenca ${CUENCA_DE[d.cuenca] || d.cuenca}<br>${d.empresa}<br>${cantArea(d[k], gas)}<br>${pct(gas ? d.pct_gas_pais : d.pct_pet_pais)} del país<br>` +
          `No convencional: ${pct((gas ? d.pct_gas_nc : d.pct_pet_nc) || 0)}<br>En ${PG.areas_anio - 10}: ${d[k + "_antes"] > 0 ? cantArea(d[k + "_antes"], gas) : "sin producción"}`});
      el.resaltar = null;  // con otra provincia elegida se vuelve a dibujar, con sus áreas resaltadas
      return;
    }
    const p = gas ? "gas" : "pet", porAnio = new Map(T.areas_serie.filter(x => x.codigo === r.codigo).map(x => [x.anio, x]));
    const tot = d3.range(PG.areas_ini, PG.areas_anio + 1).map(y => { const x = porAnio.get(y) || {}; return {anio: y, conv: x[p + "_conv"] || 0, nc: x[p + "_nc"] || 0}; })
      .map(d => ({...d, v: d.conv + d.nc}));
    $t("areas-hidro").textContent = textoArea(r, tot, gas);
    const cl = [{k: "conv", lab: "Convencional", c: COL_TIPO.conv}, {k: "nc", lab: "No convencional", c: COL_TIPO.shale}];
    leyenda("areas-hidro-ley", cl);
    const mx = d3.max(tot, d => d.v);
    if (!mx) return sinDatos(el, `${tituloArea(r.nombre)} no produjo ${gas ? "gas" : "petróleo"} entre ${PG.areas_ini} y ${PG.areas_anio}.`);
    // las áreas chicas, en barriles o en miles de metros cúbicos por día
    const m = (gas ? mx < .1 : mx < 1) ? 1000 : 1, data = tot.map(d => ({anio: d.anio, conv: d.conv * m, nc: d.nc * m})), alto = mx * m;
    columnasApiladas(el, {anim: a, claves: cl, cadaTick: 2, l: 44, data, vf: alto >= 10 ? n0 : n1, af: alto >= 10 ? n0 : n1,
      unidad: gas ? (m > 1 ? "mil m³ de gas por día" : "millones de m³ de gas por día") : (m > 1 ? "barriles de petróleo por día" : "mil barriles de petróleo por día")});
  }),
  pozos: a => {
    const t = T.pozos_tipo;
    $("pozos-ley").hidden = MED.pozos === "pozo";
    if (MED.pozos === "pozo") return barrasH(G("pozos"), {anim: a, data: t.map(r => ({...r, codigo_indec: r.tipo, territorio: r.nombre})), k: "bpd_pozo_pet", vf: v => bblF(v) + " barriles", af: n0,
      tip: d => `<b>${d.nombre}</b><br>${bblF(d.bpd_pozo_pet)} barriles de petróleo por día por pozo<br>${n0(d.pozos_pet)} pozos que produjeron petróleo<br>${n0(d.pozos)} pozos con petróleo o gas`});
    const cl = [{k: "convencional", lab: "Convencionales", c: COL_TIPO.conv, texto: "#18212B"}, {k: "tight", lab: "Tight", c: COL_TIPO.tight, texto: "#18212B"}, {k: "shale", lab: "Shale", c: COL_TIPO.shale}];
    leyenda("pozos-ley", cl);
    const fila = (id, nombre, col) => ({codigo_indec: id, territorio: nombre, ...Object.fromEntries(t.map(r => [r.tipo, r[col]]))});
    apiladasH(G("pozos"), {anim: a, claves: cl, data: [fila("pozos", "Pozos", "pct_pozos"), fila("pet", "Petróleo", "pct_pet"), fila("gas", "Gas", "pct_gas")]});
  },
  "empresas-hidro": a => {
    const k = MED["empresas-hidro"], gas = k === "pct_gas";
    $t("empresas-hidro").textContent = LEAD["empresas-hidro"](k);
    barrasH(G("empresas-hidro"), {anim: a, data: T.hidrocarburos_empresas.filter(r => r.nombre !== "Otras empresas").map((r, i) => ({...r, codigo_indec: "e" + i, territorio: r.nombre})),
      k, vf: pct, af: v => v + "%", l: 196, lAngosto: 158,
      tip: d => `<b>${d.nombre}</b><br>${pct(d[k])} del ${gas ? "gas" : "petróleo"} del país<br>` + (gas ? `${n1(d.gas_mmm3d)} millones de m³ por día` : `${kbdF(d.pet_kbd)} mil barriles por día`)});
  },
  "empleo-hidro": conTablas("empleo-hidro", () => MED["empleo-hidro"] === "serie" ? ["empleo_construccion_serie"] : [], a => {
    if (MED["empleo-hidro"] === "serie") return lineas(G("empleo-hidro"), {anim: a, data: T.empleo_construccion_serie.map(r => ({...r, t: r.anio + (r.trimestre - 1) / 4})), x: "t",
      series: [{k: "petroleo_gas", lab: "País", c: NAR}], y0: 0, vf: n0, yf: v => n0(v / 1000) + " mil", xl: r => `${TRIM_N[r.trimestre - 1]} trimestre de ${r.anio}`});
    barrasH(G("empleo-hidro"), {anim: a, data: T.empleo_construccion_provincias.filter(d => d.petroleo_gas > 0), k: "petroleo_gas", vf: n0, af: n0,
      tip: d => `<b>${d.territorio}</b><br>${n0(d.petroleo_gas)} puestos asalariados registrados<br>${n1(d.petroleo_gas_cada_1000)} cada 1.000 habitantes`});
  }),
  regalias: a => {
    const k = MED.regalias, usd = k === "usd_crudo_hab";
    $t("regalias").textContent = LEAD.regalias(k);
    barrasH(G("regalias"), {anim: a, data: usd ? T.regalias_provincias.filter(d => d.usd_crudo_hab > 0) : T.regalias_provincias, k,
      vf: usd ? n0 : v => n1(v) + "%", af: usd ? n0 : v => v + "%",
      tip: d => `<b>${d.territorio}</b><br>Regalías: ${pct(d.pct_regalias)} de los ingresos totales en ${d.anio_aif}` +
        (d.usd_crudo_hab > 0 ? `<br>Petróleo crudo: ${n1(d.usd_crudo_millones)} millones de dólares en ${PG.reg_usd_anio}, ${n0(d.usd_crudo_hab)} por habitante` : "")});
  },
  reservas: a => {
    const k = MED.reservas, d = T.reservas_hidrocarburos;
    $t("reservas").textContent = LEAD.reservas(k);
    $("reservas-ley").hidden = k === "horizonte";
    if (k === "horizonte") return lineas(G("reservas"), {anim: a, data: d, x: "anio", series: [{k: "horizonte_pet", lab: "Petróleo", c: NAR}, {k: "horizonte_gas", lab: "Gas", c: FRI}],
      y0: 0, vf: v => n1(v) + " años", yf: n0});
    const gas = k === "gas", tot = gas ? "gas_miles_millones_m3" : "pet_millones_m3", pc = gas ? "pct_gas_nc" : "pct_pet_nc";
    const cl = [{k: "sd", lab: "Sin separar (hasta 2016)", c: "#C3CAD2"}, {k: "conv", lab: "Convencionales", c: COL_TIPO.conv}, {k: "nc", lab: "No convencionales", c: COL_TIPO.shale}];
    leyenda("reservas-ley", cl);
    columnasApiladas(G("reservas"), {anim: a, claves: cl, cadaTick: 2, vf: n0, af: n0, unidad: gas ? "miles de millones de m³" : "millones de m³",
      data: d.map(r => r[pc] == null ? {anio: r.anio, sd: r[tot]} : {anio: r.anio, conv: r[tot] * (1 - r[pc] / 100), nc: r[tot] * r[pc] / 100})});
  },
  fracturas: a => {
    const k = MED.fracturas;
    $t("fracturas").textContent = LEAD.fracturas(k);
    $("fracturas-ley").hidden = k !== "etapas";
    if (k === "etapas") {
      const cl = [{k: "etapas_vm", lab: "Vaca Muerta", c: COL_TIPO.shale}, {k: "etapas_otras", lab: "Otras formaciones", c: COL_TIPO.tight}];
      leyenda("fracturas-ley", cl);
      return columnasApiladas(G("fracturas"), {anim: a, claves: cl, cadaTick: 2, vf: n0, af: v => v >= 1000 ? n0(v / 1000) + " mil" : n0(v), l: 46,
        unidad: "etapas", data: T.fracturas_anual});
    }
    const rama = k === "rama";
    columnasApiladas(G("fracturas"), {anim: a, cadaTick: 2, l: 46, data: T.diseno_pozos_vm.filter(r => r.anio >= PG.dv_ini),
      vf: rama ? n0 : n1, af: n0, unidad: rama ? "metros por pozo" : "etapas por pozo",
      claves: [{k: rama ? "rama_m" : "etapas_pozo", lab: rama ? "Rama horizontal" : "Etapas de fractura", c: COL_TIPO.shale}]});
  },
  "pozos-terminados": a => {
    const k = MED["pozos-terminados"];
    $t("pozos-terminados").textContent = LEAD["pozos-terminados"](k);
    $("pozos-terminados-ley").hidden = k !== "anio";
    if (k === "prov") return barrasH(G("pozos-terminados"), {anim: a, data: T.pozos_terminados_provincias, k: "total", vf: n0, af: n0,
      tip: d => `<b>${d.territorio}</b><br>${n0(d.total)} pozos terminados<br>Explotación: ${n0(d.explotacion)}<br>Exploración y avanzada: ${n0(d.exploracion + d.avanzada)}` +
        `<br>Servicio: ${n0(d.servicio)}<br>Doce meses antes: ${n0(d.total_antes)}`});
    const cl = [{k: "explotacion", lab: "Explotación", c: COL_TIPO.shale}, {k: "exploracion", lab: "Exploración", c: COL_TIPO.tight},
      {k: "avanzada", lab: "Avanzada", c: "#74ACDF"}, {k: "servicio", lab: "Servicio", c: "#C3CAD2"}];
    leyenda("pozos-terminados-ley", cl);
    columnasApiladas(G("pozos-terminados"), {anim: a, claves: cl, cadaTick: 2, vf: n0, af: n0, l: 40, unidad: "pozos", data: T.pozos_terminados});
  },
  productividad: a => {
    const k = MED.productividad;
    $t("productividad").textContent = LEAD.productividad(k);
    if (k === "curvas") {
      const tonos = ["#BBD6EF", "#7FB0DD", "#3F86C6", "#2C74B5", "#1F5E97", "#0F3D66"].slice(-PG.curvas.length);
      return lineas(G("productividad"), {anim: a, data: T.curvas_vm, x: "mes", y0: 0, vf: v => n0(v) + " mil", yf: n0, xl: r => `Mes ${r.mes}`,
        series: PG.curvas.map((c, i) => ({k: `c${c}`, lab: String(c), c: tonos[i], w: c === PG.cos_ult ? 3 : 2}))});
    }
    const metro = k === "metro";
    columnasApiladas(G("productividad"), {anim: a, cadaTick: 2, l: metro ? 50 : 40, vf: n0, af: metro ? v => n0(v / 1000) + " mil" : n0,
      unidad: metro ? "barriles cada 1.000 m de rama" : "mil barriles por pozo",
      data: metro ? T.productividad_vm.filter(r => r.bbl_por_1000m != null) : T.productividad_vm,
      claves: [{k: metro ? "bbl_por_1000m" : "pet_12m_kbbl", lab: "Primer año", c: COL_TIPO.shale}]});
  },
  "mapa-pozos": conTablas("mapa-pozos", ["pozos_no_convencionales", "areas_produccion"], a => {
    const k = MED["mapa-pozos"], c = PG.map_cortes;
    $t("mapa-pozos").textContent = LEAD["mapa-pozos"](k);
    leyenda("mapa-pozos-ley", [`Hasta ${c[0]}`, `${c[0] + 1} a ${c[1]}`, `${c[1] + 1} a ${c[2]}`, `${c[2] + 1} a ${c[3]}`, `Desde ${c[3] + 1}`].map((lab, i) => ({lab, c: COL_POZOS[i]})));
    mapaPozos(G("mapa-pozos"), {anim: a, vista: k});
  }),
  "gas-consumo": conTablas("gas-consumo", () => ({mes: ["gas_usuario_mensual"], serie: ["gas_usuario_serie"]})[MED["gas-consumo"]] || [], a => {
    const k = MED["gas-consumo"], el = G("gas-consumo"), fp = T.gas_usuario_provincias.find(r => r.codigo_indec === prov);
    let txt = LEAD["gas-consumo"](k);
    if (k === "prov") {
      $t("gas-consumo").textContent = txt;
      const antes = "m3_usuario_" + (e.gas_anio - 10);
      return barrasH(el, {anim: a, data: T.gas_usuario_provincias, k: "m3_usuario", vf: n0, af: n0, ref: e.gas_pais, refLab: `País ${n0(e.gas_pais)}`,
        tip: d => `<b>${d.territorio}</b><br>${n0(d.m3_usuario)} m³ por usuario, ${n1(d.veces_pais)} veces el promedio del país<br>${n0(d.usuarios)} usuarios residenciales` +
          (d[antes] != null ? `<br>En ${e.gas_anio - 10}: ${n0(d[antes])} m³ por usuario` : "")});
    }
    // el país y, si la provincia elegida tiene dato, su línea
    const filas = (tabla, x) => {
      const suya = fp ? new Map(tabla.filter(r => r.codigo_indec === prov).map(r => [r[x], r.m3_usuario])) : null;
      return tabla.filter(r => r.codigo_indec === "00").map(r => ({[x]: r[x], pais: r.m3_usuario, prov: suya ? suya.get(r[x]) ?? null : null}));
    };
    const series = [{k: "pais", lab: "Todo el país", c: NAR}, ...(fp ? [{k: "prov", lab: fp.territorio, c: FRI}] : [])];
    if (k === "mes") {
      if (fp) {
        const m = d3.rollup(T.gas_usuario_mensual.filter(r => r.codigo_indec === prov && +r.periodo.slice(0, 4) >= e.gas_est_desde && +r.periodo.slice(0, 4) <= e.gas_est_hasta),
          v => d3.mean(v, r => r.m3_usuario), r => +r.periodo.slice(5, 7));
        const mx = d3.greatest(m, ([, v]) => v), mn = d3.least(m, ([, v]) => v);
        txt += ` En ${fp.territorio}, ${n0(mx[1])} metros cúbicos en ${MESES[mx[0] - 1]} y ${n0(mn[1])} en ${MESES[mn[0] - 1]}.`;
      }
      $t("gas-consumo").textContent = txt;
      return lineas(el, {anim: a, data: filas(T.gas_usuario_mensual, "periodo").map(r => ({...r, t: tPer(r.periodo)})), x: "t", series, y0: 0, vf: n0, yf: n0,
        xl: r => mesPer(r.periodo)});
    }
    if (fp) {
      const s = T.gas_usuario_serie.filter(r => r.codigo_indec === prov);
      txt += ` En ${fp.territorio}, ${n0(s[0].m3_usuario)} metros cúbicos en ${s[0].anio} y ${n0(fp.m3_usuario)} en ${e.gas_anio}.`;
    }
    $t("gas-consumo").textContent = txt;
    lineas(el, {anim: a, data: filas(T.gas_usuario_serie, "anio"), x: "anio", series, y0: 0, vf: n0, yf: n0});
  }),
  centrales: conTablas("centrales", () => MED.centrales === "mapa" ? ["centrales"] : [], a => {
    const k = MED.centrales;
    $t("centrales").textContent = LEAD.centrales(k);
    leyenda("centrales-ley", TEC_CEN);
    if (k === "mapa") return mapaCentrales(G("centrales"), {anim: a});
    columnasApiladas(G("centrales"), {anim: a, claves: TEC_CEN, cadaTick: 3, vf: n0, af: v => v >= 1000 ? n0(v / 1000) + " mil" : n0(v), l: 46,
      unidad: "megavatios", data: T.potencia_instalada});
  }),
  "electricidad-provincias": conTablas("electricidad-provincias", () => ({mes: ["electricidad_mensual"], serie: ["electricidad_serie"]})[MED["electricidad-provincias"]] || [], a => {
    const k = MED["electricidad-provincias"], el = G("electricidad-provincias");
    // la Ciudad y la provincia de Buenos Aires son una sola fila en CAMMESA: con cualquiera de las dos elegida, se usa esa fila
    const cod = prov === "02" || prov === "06" ? "02-06" : prov, fp = T.electricidad_provincias.find(r => r.codigo_indec === cod);
    let txt = LEAD["electricidad-provincias"](k);
    if (k === "prov") {
      $t("electricidad-provincias").textContent = txt;
      barrasH(el, {anim: a, data: T.electricidad_provincias, k: "kwh_hab", vf: n0, af: n0, ref: e.el_pais, refLab: `País ${n0(e.el_pais)}`, marcar: new Set(fp ? [cod] : []),
        tip: d => `<b>${d.territorio}</b><br>${n0(d.kwh_hab)} kWh por habitante<br>${n0(d.gwh)} GWh residenciales en ${e.el_ult}<br>Los hogares, ${pct(d.pct_residencial)} de la demanda` +
          (d.kwh_hab_antes != null ? `<br>En ${e.el_ult - 10}: ${n0(d.kwh_hab_antes)} kWh por habitante` : "")});
      el.resaltar = null;  // con otra provincia elegida se vuelve a dibujar
      return;
    }
    // el país y, con una provincia elegida, su línea
    const filas = (tabla, x) => {
      const suya = fp ? new Map(tabla.filter(r => r.codigo_indec === cod).map(r => [r[x], r.kwh_hab])) : null;
      return tabla.filter(r => r.codigo_indec === "00").map(r => ({[x]: r[x], pais: r.kwh_hab, prov: suya ? suya.get(r[x]) ?? null : null}));
    };
    const series = [{k: "pais", lab: "Todo el país", c: NAR}, ...(fp ? [{k: "prov", lab: fp.territorio, c: FRI}] : [])];
    if (k === "mes") {
      if (fp) {
        const m = d3.rollup(T.electricidad_mensual.filter(r => r.codigo_indec === cod && +r.periodo.slice(0, 4) >= e.el_est_desde && +r.periodo.slice(0, 4) <= e.el_ult),
          v => d3.mean(v, r => r.kwh_hab), r => +r.periodo.slice(5, 7));
        const mx = d3.greatest(m, ([, v]) => v), mn = d3.least(m, ([, v]) => v);
        txt += ` En ${fp.territorio}, el de más consumo fue ${MESES[mx[0] - 1]}, con ${n0(mx[1])} kWh por habitante, y el de menos, ${MESES[mn[0] - 1]}, con ${n0(mn[1])}.`;
      }
      $t("electricidad-provincias").textContent = txt;
      return lineas(el, {anim: a, data: filas(T.electricidad_mensual, "periodo").map(r => ({...r, t: tPer(r.periodo)})), x: "t", series, y0: 0, vf: n0, yf: n0,
        xl: r => mesPer(r.periodo), mensual: true});
    }
    if (fp) {
      const s = T.electricidad_serie.filter(r => r.codigo_indec === cod);
      txt += ` En ${fp.territorio}, ${n0(s[0].kwh_hab)} kWh por habitante en ${s[0].anio} y ${n0(fp.kwh_hab)} en ${e.el_ult}.`;
    }
    $t("electricidad-provincias").textContent = txt;
    lineas(el, {anim: a, data: filas(T.electricidad_serie, "anio"), x: "anio", series, y0: 0, vf: n0, yf: n0});
  }),
  // comercios e industrias (etapa 23): kWh por habitante de cada categoría o las partes de la demanda de cada provincia
  "electricidad-sectores": a => {
    const k = MED["electricidad-sectores"], el = G("electricidad-sectores");
    // la Ciudad y la provincia de Buenos Aires son una sola fila en CAMMESA: con cualquiera de las dos elegida, se usa esa fila
    const cod = prov === "02" || prov === "06" ? "02-06" : prov, fp = prov ? T.electricidad_sectores.find(r => r.codigo_indec === cod) : null;
    const cl = [{k: "pct_res", lab: "Hogares", c: "#74ACDF", texto: "#18212B"}, {k: "pct_com", lab: "Comercios y servicios", c: "#F6B40E", texto: "#18212B"},
      {k: "pct_ind", lab: "Industrias y grandes comercios", c: "#1F5E97"}];
    let txt = LEAD["electricidad-sectores"](k);
    $("electricidad-sectores-ley").hidden = k !== "partes";
    if (k === "partes") {
      leyenda("electricidad-sectores-ley", cl);
      if (fp) txt += ` En ${fp.territorio}, los hogares son el ${pct(fp.pct_res)} de la demanda, los comercios y servicios el ${pct(fp.pct_com)} y las industrias y los grandes comercios el ${pct(fp.pct_ind)}.`;
      $t("electricidad-sectores").textContent = txt;
      // la fila de la Ciudad y la provincia lleva el código de la que está elegida, para que se resalte; con otra provincia se vuelve a dibujar
      const pais = T.electricidad_sectores.find(r => r.codigo_indec === "00"), suya = r => r.codigo_indec === "02-06" && cod === "02-06" ? {...r, codigo_indec: prov} : r;
      apiladasH(el, {anim: a, claves: cl, data: [{...pais, territorio: "Todo el país"}, ...T.electricidad_sectores.filter(r => r.codigo_indec !== "00").sort((p, q) => q.pct_ind - p.pct_ind).map(suya)]});
      el.resaltar = null;
      return;
    }
    const col = k === "com" ? "kwh_hab_com" : "kwh_hab_ind", ref = k === "com" ? e.els_com : e.els_ind;
    if (fp) txt += ` En ${fp.territorio}, ${n0(fp[col])} kWh por habitante${conVeces(fp[col], ref)}.`;
    $t("electricidad-sectores").textContent = txt;
    barrasH(el, {anim: a, data: T.electricidad_sectores.filter(r => r.codigo_indec !== "00"), k: col, vf: n0, af: n0, ref, refLab: `País ${n0(ref)}`, marcar: new Set(fp ? [cod] : []),
      tip: d => `<b>${d.territorio}</b><br>${n0(d[col])} kWh por habitante en ${e.el_ult}<br>De su demanda: hogares ${pct(d.pct_res)}, comercios y servicios ${pct(d.pct_com)}, ` +
        `industrias y grandes comercios ${pct(d.pct_ind)}`});
    el.resaltar = null;  // con otra provincia elegida se vuelve a dibujar
  },
  // salarios (etapa 23): por provincia en el último mes sin aguinaldo, o mes a mes en pesos de igual valor con la línea de la provincia elegida
  salarios: conTablas("salarios", () => MED.salarios === "mes" ? ["salarios_serie"] : [], a => {
    const el = G("salarios"), fp = T.salarios_provincias.find(r => r.codigo_indec === prov);
    let txt = LEAD.salarios(MED.salarios);
    if (MED.salarios === "mes") {
      const suya = fp ? new Map(T.salarios_serie.filter(r => r.codigo_indec === prov).map(r => [r.periodo, r.salario_real])) : null;
      const data = T.salarios_serie.filter(r => r.codigo_indec === "00").map(r => ({periodo: r.periodo, t: tPer(r.periodo), pais: r.salario_real, prov: suya ? suya.get(r.periodo) ?? null : null}));
      if (fp) txt += ` En ${fp.territorio}, el salario de ${SA.mes} ${cambioPct(fp.var_real_12m)} frente a ${SA.ant} en pesos de igual valor.`;
      $t("salarios").textContent = txt;
      return lineas(el, {anim: a, data, x: "t", y0: 0, vf: millonesM, yf: ejeM, xl: r => mesPer(r.periodo), mensual: true,
        series: [{k: "pais", lab: "Todo el país", c: NAR}, ...(fp ? [{k: "prov", lab: fp.territorio, c: FRI}] : [])]});
    }
    if (fp && fp.territorio !== SA.top[0] && fp.territorio !== SA.bajo[0]) txt += ` En ${fp.territorio}, ${n0(fp.salario)} pesos${conVeces(fp.salario, SA.pais)}.`;
    $t("salarios").textContent = txt;
    barrasH(el, {anim: a, data: T.salarios_provincias.filter(r => r.codigo_indec !== "00"), k: "salario", vf: millonesM, af: ejeM, ref: SA.pais, refLab: `País ${millonesM(SA.pais)}`,
      tip: d => `<b>${d.territorio}</b><br>${n0(d.salario)} pesos en ${SA.mes}<br>Descontada la inflación, ${cambioPct(d.var_real_12m)} frente a ${SA.ant}`});
  }),
  // salario de un maestro de grado (etapa 23): por provincia en el último trimestre, o trimestre a trimestre en pesos de igual valor
  "salario-docente": conTablas("salario-docente", () => MED["salario-docente"] === "serie" ? ["salario_docente_serie"] : [], a => {
    const el = G("salario-docente"), fp = T.salario_docente.find(r => r.codigo_indec === prov);
    let txt = LEAD["salario-docente"](MED["salario-docente"]);
    if (MED["salario-docente"] === "serie") {
      const suya = fp ? new Map(T.salario_docente_serie.filter(r => r.codigo_indec === prov).map(r => [r.periodo, r.bruto_real])) : null;
      const data = T.salario_docente_serie.filter(r => r.codigo_indec === "00").map(r => ({periodo: r.periodo, t: tPer(r.periodo), pais: r.bruto_real, prov: suya ? suya.get(r.periodo) ?? null : null}));
      if (fp) txt += ` En ${fp.territorio}, el salario de ${DC.trim} ${cambioPct(fp.var_real_12m)} frente a ${DC.ant} en pesos de igual valor.`;
      $t("salario-docente").textContent = txt;
      return lineas(el, {anim: a, data, x: "t", y0: 0, vf: millonesM, yf: ejeM, xl: r => mesPer(r.periodo),
        series: [{k: "pais", lab: "Promedio del país", c: NAR}, ...(fp ? [{k: "prov", lab: fp.territorio, c: FRI}] : [])]});
    }
    if (fp && fp.territorio !== DC.top[0] && fp.territorio !== DC.bajo[0]) txt += ` En ${fp.territorio}, ${n0(fp.bruto)} pesos${conVeces(fp.bruto, DC.pais)}.`;
    $t("salario-docente").textContent = txt;
    barrasH(el, {anim: a, data: T.salario_docente.filter(r => r.codigo_indec !== "00"), k: "bruto", vf: millonesM, af: ejeM, ref: DC.pais, refLab: `País ${millonesM(DC.pais)}`,
      tip: d => `<b>${d.territorio}</b><br>${n0(d.bruto)} pesos brutos en ${DC.trim}` + (d.extra > 0 ? `<br>Incluye una suma extraordinaria de ${n0(d.extra)}` : "") +
        `<br>Descontada la inflación, ${cambioPct(d.var_real_12m)} frente a ${DC.ant}`});
  }),
  // inversión en educación (etapa 23): por alumno, como parte del gasto público o año por año en pesos del último año
  "inversion-educativa": conTablas("inversion-educativa", () => MED["inversion-educativa"] === "serie" ? ["inversion_educativa_serie"] : [], a => {
    const k = MED["inversion-educativa"], el = G("inversion-educativa"), fp = T.inversion_educativa.find(r => r.codigo_indec === prov);
    let txt = LEAD["inversion-educativa"](k);
    if (k === "serie") {
      const suya = fp ? new Map(T.inversion_educativa_serie.filter(r => r.codigo_indec === prov).map(r => [r.anio, r.por_alumno_real])) : null;
      const data = T.inversion_educativa_serie.filter(r => r.codigo_indec === "00").map(r => ({anio: r.anio, pais: r.por_alumno_real, prov: suya ? suya.get(r.anio) ?? null : null}));
      if (fp) txt += ` En ${fp.territorio}, ${n0(fp.gasto_por_alumno)} pesos por alumno en ${IE.anio}.`;
      $t("inversion-educativa").textContent = txt;
      return lineas(el, {anim: a, data, x: "anio", y0: 0, vf: millonesM, yf: ejeM,
        series: [{k: "pais", lab: "Todo el país", c: NAR}, ...(fp ? [{k: "prov", lab: fp.territorio, c: FRI}] : [])]});
    }
    const pctV = k === "pct", col = pctV ? "pct_gasto" : "gasto_por_alumno", ref = pctV ? IE.pct_pais : IE.pais, f = pctV ? pct : millonesM;
    const nombradas = pctV ? [IE.pct_top[0], IE.pct_bajo[0]] : [IE.top[0], IE.bajo[0]];
    if (fp && !nombradas.includes(fp.territorio)) txt += pctV ? ` En ${fp.territorio}, el ${pct(fp.pct_gasto)}.` : ` En ${fp.territorio}, ${n0(fp.gasto_por_alumno)} pesos por alumno${conVeces(fp.gasto_por_alumno, IE.pais)}.`;
    $t("inversion-educativa").textContent = txt;
    barrasH(el, {anim: a, data: T.inversion_educativa.filter(r => r.codigo_indec !== "00"), k: col, vf: f, af: pctV ? f : ejeM, ref, refLab: `País ${f(ref)}`,
      tip: d => `<b>${d.territorio}</b><br>${n0(d.gasto_por_alumno)} pesos por alumno de gestión estatal<br>La educación, ${pct(d.pct_gasto)} del gasto público, ${IE.anio}`});
  }),
  // delitos por tipo en el país (etapa 23): los catorce tipos más frecuentes (la tabla tiene todos), o las tasas año por año.
  // En el celular, los nombres largos van en una versión corta
  delitos: a => {
    const el = G("delitos");
    $t("delitos").textContent = LEAD.delitos(MED.delitos);
    if (MED.delitos === "serie") return lineas(el, {anim: a, data: T.delitos_serie, x: "anio", y0: 0, vf: n0, yf: n0, series: [{k: "robos", lab: "Robos", c: NAR},
      {k: "hurtos", lab: "Hurtos", c: FRI}, {k: "amenazas", lab: "Amenazas", c: css("--azul-hondo")}, {k: "lesiones", lab: "Lesiones dolosas", c: css("--muted")}]});
    // los códigos van con una letra delante: un código de delito no tiene que coincidir con el de la provincia elegida
    const data = T.delitos_tipo.slice(0, 14).map(r => ({codigo_indec: "d" + r.codigo, territorio: r.delito, tasa: r.tasa, hechos: r.hechos, pct: r.pct}));
    barrasH(el, {anim: a, data, k: "tasa", vf: n0, af: n0, l: 236, lAngosto: 150, corto: d => CORTO_DEL[d.territorio] || d.territorio,
      tip: d => `<b>${d.territorio}</b><br>${n0(d.hechos)} hechos en ${SG.anio}<br>${n0(d.tasa)} cada 100.000 habitantes<br>${pct(d.pct)} de los delitos registrados`});
  },
  // robos y hurtos por provincia (etapa 23), o la serie del país con las líneas de la provincia elegida
  robos: conTablas("robos", () => MED.robos === "serie" ? ["seguridad_serie_prov"] : [], a => {
    const k = MED.robos, el = G("robos"), fp = T.robos_provincias.find(r => r.codigo_indec === prov);
    let txt = LEAD.robos(k);
    if (k === "serie") {
      const suya = fp ? new Map(T.seguridad_serie_prov.filter(r => r.codigo_indec === prov).map(r => [r.anio, r])) : null;
      const data = T.delitos_serie.map(r => ({anio: r.anio, robos: r.robos, hurtos: r.hurtos, robos_p: suya?.get(r.anio)?.robos ?? null, hurtos_p: suya?.get(r.anio)?.hurtos ?? null}));
      if (fp) txt += ` En ${fp.territorio}, ${n0(fp.robos)} robos y ${n0(fp.hurtos)} hurtos cada 100.000 habitantes en ${SG.anio}.`;
      $t("robos").textContent = txt;
      return lineas(el, {anim: a, data, x: "anio", y0: 0, vf: n0, yf: n0, series: [{k: "robos", lab: "Robos en el país", c: NAR}, {k: "hurtos", lab: "Hurtos en el país", c: css("--azul-hondo")},
        ...(fp ? [{k: "robos_p", lab: `Robos en ${fp.territorio}`, c: FRI}, {k: "hurtos_p", lab: `Hurtos en ${fp.territorio}`, c: css("--sol-borde")}] : [])]});
    }
    const ref = k === "hurtos" ? SG.hurtos : SG.robos, nombradas = k === "hurtos" ? [SG.hurtos_top[0], SG.hurtos_bajo[0]] : [SG.robos_top[0], SG.robos_bajo[0]];
    if (fp && !nombradas.includes(fp.territorio)) txt += ` En ${fp.territorio}, ${n0(fp[k])} cada 100.000 habitantes${conVeces(fp[k], ref)}.`;
    $t("robos").textContent = txt;
    barrasH(el, {anim: a, data: T.robos_provincias.filter(r => r.codigo_indec !== "00"), k, vf: n0, af: n0, ref, refLab: `País ${n0(ref)}`,
      tip: d => `<b>${d.territorio}</b><br>${n0(d[k])} ${k} cada 100.000 habitantes en ${SG.anio}<br>En ${SG.anio - 1}, ${n0(d[k + "_ant"])}`});
  }),
  // homicidios dolosos (etapa 23): tasa de tres años por provincia, o la serie del país con la línea de la provincia elegida
  homicidios: conTablas("homicidios", () => MED.homicidios === "serie" ? ["seguridad_serie_prov"] : [], a => {
    const el = G("homicidios"), fp = T.homicidios_provincias.find(r => r.codigo_indec === prov);
    let txt = LEAD.homicidios(MED.homicidios);
    if (MED.homicidios === "serie") {
      const suya = fp ? new Map(T.seguridad_serie_prov.filter(r => r.codigo_indec === prov).map(r => [r.anio, r.homicidios])) : null;
      const data = T.delitos_serie.map(r => ({anio: r.anio, pais: r.homicidios, prov: suya ? suya.get(r.anio) ?? null : null}));
      if (fp) txt += ` En ${fp.territorio}, ${n1(fp.tasa)} en ${SG.anio}.`;
      $t("homicidios").textContent = txt;
      return lineas(el, {anim: a, data, x: "anio", y0: 0, vf: n1, yf: n0,
        series: [{k: "pais", lab: "Todo el país", c: NAR}, ...(fp ? [{k: "prov", lab: fp.territorio, c: FRI}] : [])]});
    }
    if (fp && fp.territorio !== SG.hom3_top[0] && fp.territorio !== SG.hom3_bajo[0]) txt += ` En ${fp.territorio}, ${n1(fp.tasa_3)} por año entre ${SG.hom3_desde} y ${SG.anio}${conVeces(fp.tasa_3, SG.hom3_pais)}: ${n0(fp.victimas_3)} víctimas en tres años.`;
    $t("homicidios").textContent = txt;
    barrasH(el, {anim: a, data: T.homicidios_provincias.filter(r => r.codigo_indec !== "00"), k: "tasa_3", vf: n1, af: n0, ref: SG.hom3_pais, refLab: `País ${n1(SG.hom3_pais)}`,
      tip: d => `<b>${d.territorio}</b><br>${n1(d.tasa_3)} víctimas cada 100.000 habitantes por año, ${SG.hom3_desde} a ${SG.anio}<br>${n0(d.victimas_3)} víctimas en esos tres años<br>En ${SG.anio}: ${n0(d.victimas)}`});
  }),
  // personas privadas de libertad (etapa 23, SNEEP): el país año por año o cada servicio penitenciario provincial
  carceles: a => {
    const el = G("carceles"), fp = T.carceles_provincias.find(r => r.codigo_indec === prov);
    let txt = LEAD.carceles(MED.carceles);
    if (MED.carceles === "prov") {
      if (fp) txt += ` En ${fp.territorio}, ${n0(fp.tasa)} cada 100.000 habitantes: ${n0(fp.personas)} personas, el ${pct(fp.pct_condenados)} con condena.`;
      $t("carceles").textContent = txt;
      return barrasH(el, {anim: a, data: T.carceles_provincias, k: "tasa", vf: n0, af: n0,
        tip: d => `<b>${d.territorio}</b><br>${n0(d.personas)} personas en el servicio penitenciario provincial al 31 de diciembre de ${SG.sn_anio}<br>${n0(d.tasa)} cada 100.000 habitantes<br>${pct(d.pct_condenados)} con condena`});
    }
    $t("carceles").textContent = txt;
    lineas(el, {anim: a, data: T.carceles_serie, x: "anio", y0: 0, vf: n0, yf: n0, series: [{k: "tasa", lab: "Todo el país", c: NAR}]});
  },
  // inflación (etapa 25): en doce meses o mes a mes, el país y la región de la provincia elegida, o las seis regiones en el último mes
  inflacion: conTablas("inflacion", () => MED.inflacion === "region" ? [] : ["inflacion_mensual"], a => {
    const v = MED.inflacion, el = G("inflacion"), regs = REG_IPC[prov] || [];
    let txt = LEAD.inflacion(v);
    if (v === "region") {
      txt += enSuRegion(T.inflacion_regiones, "interanual", pct);
      $t("inflacion").textContent = txt;
      const data = T.inflacion_regiones.filter(r => r.codigo !== "nacional").map(r => ({codigo_indec: "r-" + r.codigo, territorio: r.region, ia: r.interanual,
        m: r.mensual, anio: r.en_el_anio}));
      barrasH(el, {anim: a, data, k: "ia", vf: pct, af: v => n0(v) + "%", ref: EIP.interanual, refLab: `País ${pct(EIP.interanual)}`, l: 150, lAngosto: 128,
        marcar: new Set(regs.map(r => "r-" + r)),
        tip: d => `<b>${d.territorio}</b><br>${pct(d.ia)} en los doce meses hasta ${EIP.mes}<br>${pct(d.m)} en el mes<br>${pct(d.anio)} en lo que va del año`});
      el.resaltar = null;  // con otra provincia elegida se vuelve a dibujar
      return;
    }
    const k = v === "mes" ? "mensual" : "interanual";
    txt += enSuRegion(T.inflacion_regiones, v === "mes" ? "mensual" : "interanual", pct);
    $t("inflacion").textContent = txt;
    const nom = Object.fromEntries(T.inflacion_regiones.map(r => [r.codigo, r.region]));
    const data = T.inflacion_mensual.filter(r => r[k] != null).map(r => ({periodo: r.periodo, t: tPer(r.periodo), pais: r[k],
      ...Object.fromEntries(regs.map(g => [g, r[k + "_" + g]]))}));
    lineas(el, {anim: a, data, x: "t", y0: 0, vf: pct, yf: v => n0(v) + "%", xl: r => mesPer(r.periodo), mensual: true,
      series: [{k: "pais", lab: "Todo el país", c: NAR}, ...regs.map((g, i) => ({k: g, lab: nom[g], c: i ? css("--sol-borde") : FRI}))]});
  }),
  // inflación por rubro (etapa 25): las doce divisiones, las tres categorías o los bienes y los servicios, en los doce meses hasta el último mes
  "inflacion-rubros": a => {
    const g = MED["inflacion-rubros"];
    $t("inflacion-rubros").textContent = LEAD["inflacion-rubros"](g);
    // los códigos van con una letra delante: un código de rubro no tiene que coincidir con el de la provincia elegida
    const data = T.inflacion_rubros.filter(r => r.grupo === g).map(r => ({codigo_indec: "i" + r.codigo, territorio: r.rubro, corto: r.corto, ia: r.interanual, m: r.mensual}));
    barrasH(G("inflacion-rubros"), {anim: a, data, k: "ia", vf: pct, af: v => n0(v) + "%", ref: EIP.interanual, refLab: `Nivel general ${pct(EIP.interanual)}`,
      paisLab: "Nivel general", l: g === "division" ? 236 : 150, lAngosto: 150, corto: d => d.corto,
      tip: d => `<b>${d.territorio}</b><br>${pct(d.ia)} en los doce meses hasta ${EIP.mes}<br>${pct(d.m)} en el mes`});
  },
  // canastas básicas (etapa 25): las seis regiones en el último mes del informe semestral, o la del Gran Buenos Aires frente a los precios
  canastas: conTablas("canastas", () => MED.canastas === "precios" ? ["canasta_mensual"] : [], a => {
    const v = MED.canastas, el = G("canastas"), regs = REG_IPC[prov] || [];
    let txt = LEAD.canastas(v);
    if (v === "precios") {
      $t("canastas").textContent = txt;
      const data = T.canasta_mensual.filter(r => r.interanual_cbt != null).map(r => ({periodo: r.periodo, t: tPer(r.periodo), cbt: r.interanual_cbt,
        cba: r.interanual_cba, ipc: r.interanual_ipc_gba}));
      return lineas(el, {anim: a, data, x: "t", y0: 0, vf: pct, yf: v => n0(v) + "%", xl: r => mesPer(r.periodo), mensual: true,
        series: [{k: "cbt", lab: "Canasta básica total", corto: "Total", c: NAR}, {k: "cba", lab: "Canasta básica alimentaria", corto: "Alimentaria", c: FRI},
          {k: "ipc", lab: "Precios del Gran Buenos Aires", corto: "Precios", c: css("--muted"), dash: "4 3"}]});
    }
    txt += enSuRegion(T.canasta_regiones, "cbt", v => n0(v) + " pesos por adulto equivalente");
    $t("canastas").textContent = txt;
    const data = T.canasta_regiones.map(r => ({codigo_indec: "r-" + r.codigo, territorio: r.region, cbt: r.cbt, cba: r.cba, ia: r.interanual_cbt}));
    barrasH(el, {anim: a, data, k: "cbt", vf: n0, af: v => n0(v / 1000) + " mil", l: 150, lAngosto: 128, marcar: new Set(regs.map(r => "r-" + r)),
      tip: d => `<b>${d.territorio}</b><br>Canasta básica total: ${n0(d.cbt)} pesos<br>Canasta básica alimentaria: ${n0(d.cba)} pesos` +
        (d.ia != null ? `<br>La total, en doce meses: ${cambioPct(d.ia)}` : "")});
    el.resaltar = null;  // con otra provincia elegida se vuelve a dibujar
  }),
  // salarios registrados descontada la inflación (etapa 25): índice del INDEC dividido por el IPC, diciembre de 2016 = 100
  "salario-real": conTablas("salario-real", () => ["salario_real_mensual"], a => {
    $t("salario-real").textContent = LEAD["salario-real"]();
    lineas(G("salario-real"), {anim: a, data: T.salario_real_mensual.map(r => ({...r, t: tPer(r.periodo)})), x: "t", y0: 0, vf: n1, yf: n0,
      xl: r => mesPer(r.periodo), mensual: true, series: [{k: "privado", lab: "Privado registrado", c: NAR}, {k: "publico", lab: "Público", c: FRI}]});
  }),
  // actividad económica (etapa 25): el EMAE sin estacionalidad mes a mes, o cada sector en los últimos doce meses
  emae: conTablas("emae", () => MED.emae === "mes" ? ["actividad_mensual"] : [], a => {
    const v = MED.emae, el = G("emae");
    $t("emae").textContent = LEAD.emae(v);
    if (v === "mes") return lineas(el, {anim: a, data: T.actividad_mensual.map(r => ({...r, t: tPer(r.periodo)})), x: "t", y0: 0, vf: n1, yf: n0,
      xl: r => mesPer(r.periodo), mensual: true, series: [{k: "desestacionalizada", lab: "Sin estacionalidad", corto: "Actividad", c: NAR}]});
    const data = T.actividad_sectores.map(r => ({codigo_indec: "s" + r.letra, territorio: r.sector, corto: r.corto, v: r.doce_meses, ia: r.interanual}));
    barrasH(el, {anim: a, data, k: "v", vf: pct, af: v => n0(v) + "%", ref: EMA.doce, refLab: `Toda la economía ${pct(EMA.doce)}`, paisLab: "Toda la economía",
      l: 236, lAngosto: 150, corto: d => d.corto,
      tip: d => `<b>${d.territorio}</b><br>${pct(d.v)} en los doce meses hasta ${EMA.mes}, frente a los doce anteriores<br>${pct(d.ia)} en el mes, frente a ${EMA.mes_ant}`});
  }),
  // refugio (etapa 26): solicitudes por año, por nacionalidad en el último año, o personas refugiadas y solicitantes de asilo en el país
  refugio: conTablas("refugio", () => ({nacionalidad: ["refugio_nacionalidades"], acnur: ["refugio_acnur"]})[MED.refugio] || [], a => {
    const v = MED.refugio, el = G("refugio");
    $t("refugio").textContent = LEAD.refugio(v);
    if (v === "nacionalidad") return barrasH(el, {anim: a, data: T.refugio_nacionalidades.map((r, i) => ({codigo_indec: "n" + i, territorio: r.nacionalidad,
      solicitudes: r.solicitudes, pct: r.pct})), k: "solicitudes", vf: n0, af: n0, l: 236, lAngosto: 150,
      corto: d => d.territorio.replace(/ \(\d+ nacionalidades\)/, ""),
      tip: d => `<b>${d.territorio}</b><br>${n0(d.solicitudes)} solicitudes en ${MGR.anio}<br>${pct(d.pct)} del total`});
    if (v === "acnur") return lineas(el, {anim: a, data: T.refugio_acnur, x: "anio", y0: 0, vf: n0, yf: n0,
      series: [{k: "refugiados", lab: "Personas refugiadas", corto: "Refugiadas", c: NAR}, {k: "solicitantes", lab: "Solicitantes de asilo", corto: "Solicitantes", c: FRI}]});
    columnasApiladas(el, {anim: a, data: T.refugio_solicitudes, vf: n0, af: n0, unidad: "solicitudes",
      claves: [{k: "solicitudes", lab: "Solicitudes", c: css("--celeste-fuerte")}]});
  }),
  // ventas en supermercados (etapa 26): la variación de cada provincia en doce meses, o el índice del país mes a mes
  supermercados: conTablas("supermercados", () => MED.supermercados === "mes" ? ["supermercados_mensual"] : [], a => {
    const v = MED.supermercados, el = G("supermercados"), fp = T.supermercados_provincias.find(r => r.codigo_indec === prov);
    let txt = LEAD.supermercados(v);
    if (v === "mes") {
      $t("supermercados").textContent = txt;
      return lineas(el, {anim: a, data: T.supermercados_mensual.map(r => ({...r, t: tPer(r.periodo)})), x: "t", y0: 0, vf: n1, yf: n0,
        xl: r => mesPer(r.periodo), mensual: true, series: [{k: "desestacionalizada", lab: "Sin estacionalidad", corto: "Ventas", c: NAR}]});
    }
    if (fp && fp.territorio !== ESU.prov.top[0] && fp.territorio !== ESU.prov.bajo[0]) txt += ` En ${fp.territorio}, ${conSigno(fp.var_12m)}.`;
    $t("supermercados").textContent = txt;
    barrasH(el, {anim: a, data: T.supermercados_provincias, k: "var_12m", vf: conSigno, af: v => n0(v) + "%", ref: ESU.prov.pais,
      refLab: `País ${conSigno(ESU.prov.pais)}`, tip: d => `<b>${d.territorio}</b><br>${conSigno(d.var_12m)} en los doce meses hasta ${ESU.mes}, ` +
        `frente a los doce anteriores<br>${conSigno(d.var_mes)} en ${ESU.mes}, frente a ${ESU.mes_ant}<br>Precios de la región ${d.region}`});
  }),
  // personas nacidas en otro país (etapa 25, Censo 2022): por provincia, o los países de nacimiento del país o de la provincia elegida
  "nacidos-otro-pais": conTablas("nacidos-otro-pais", () => ({pais: ["nacidos_otro_pais_paises"], mapa: ["migraciones_departamentos"]})[MED["nacidos-otro-pais"]] || [], a => {
    const v = MED["nacidos-otro-pais"], el = G("nacidos-otro-pais"), fp = T.nacidos_otro_pais_provincias.find(r => r.codigo_indec === prov);
    let txt = LEAD["nacidos-otro-pais"](v);
    const nd = fp && fp.pct_pais_no_declarado > 20 ? ` El ${pct(fp.pct_pais_no_declarado)} no declaró su país de nacimiento.` : "";
    if (v === "mapa") {
      const filas = T.migraciones_departamentos, porDep = Object.fromEntries(filas.map(r => [r.codigo_dep, r]));
      $t("nacidos-otro-pais").textContent = (fp ? rangoDep(filas, "pct_otro_pais", "nacida en otro país") + " " : "") + txt;
      return mapaDep(el, {anim: a, filas, k: "pct_otro_pais", nombre: "Nacidos en otro país", vf: pct, extra: id => {
        const r = porDep[id];
        // en dos renglones cortos: el cuadro no corta las líneas y en el celular no entraría en uno
        return (r && r.primer_pais ? `<br>Origen más frecuente: ${r.primer_pais}<br>${pct(r.pct_primer_pais)} de quienes declararon su país` : "") +
          (r && r.pct_no_declarado > 20 ? `<br>No declaró su país: ${pct(r.pct_no_declarado)}` : "");
      }});
    }
    if (v === "pais") {
      const cod = fp ? prov : "00", filas = T.nacidos_otro_pais_paises.filter(r => r.codigo_indec === cod && r.pais !== "País no declarado");
      // con una provincia elegida, el gráfico muestra sus países: el texto lo dice primero
      if (fp) txt = `En ${fp.territorio}, los países de nacimiento más frecuentes de las personas nacidas en otro país eran ` +
        `${lista(filas.slice(0, 3).map(r => `${r.pais} (${pct(r.pct)})`))}, según el Censo 2022.${nd} En todo el país: ` + inicialMin(txt.replace(/, según el Censo\./, "."));
      $t("nacidos-otro-pais").textContent = txt;
      barrasH(el, {anim: a, data: filas.map((r, i) => ({codigo_indec: "p" + i, territorio: r.pais, personas: r.personas, pct: r.pct})), k: "personas",
        vf: n0, af: v => v >= 1e3 ? n0(v / 1e3) + " mil" : n0(v), l: 150, lAngosto: 118, cambiaConProv: true,
        tip: d => `<b>${d.territorio}</b><br>${n0(d.personas)} personas<br>${pct(d.pct)} de las nacidas en otro país${fp ? " que vivían en " + fp.territorio : ""}`});
      return;
    }
    if (fp && fp.territorio !== MGC.top[0] && !MGC.bajos[0].includes(fp.territorio)) txt += ` En ${fp.territorio}, el ${pct(fp.pct_otro_pais)}` +
      `${conVeces(fp.pct_otro_pais, MGC.pct)}: ${n0(fp.en_otro_pais)} personas, sobre todo de ${fp.primer_pais}.${nd}`;
    $t("nacidos-otro-pais").textContent = txt;
    barrasH(el, {anim: a, data: T.nacidos_otro_pais_provincias.filter(r => r.codigo_indec !== "00"), k: "pct_otro_pais", vf: n1, af: n0, ref: MGC.pct,
      refLab: `País ${n1(MGC.pct)}`, tip: d => `<b>${d.territorio}</b><br>${pct(d.pct_otro_pais)} de la población<br>${n0(d.en_otro_pais)} personas<br>` +
        `País más frecuente: ${d.primer_pais}`});
  }),
  // dónde nacieron las personas que viven en cada provincia (etapa 25, Censo 2022)
  "migracion-interna": conTablas("migracion-interna", () => MED["migracion-interna"] === "mapa" ? ["migraciones_departamentos"] : [], a => {
    const fp = T.nacidos_otro_pais_provincias.find(r => r.codigo_indec === prov), mapa = MED["migracion-interna"] === "mapa";
    $("migracion-interna-ley").hidden = mapa;
    if (mapa) {
      $t("migracion-interna").textContent = (fp ? rangoDep(T.migraciones_departamentos, "pct_otra_provincia", "nacida en otra provincia") + " " : "") +
        LEAD["migracion-interna"]("mapa");
      return mapaDep(G("migracion-interna"), {anim: a, filas: T.migraciones_departamentos, k: "pct_otra_provincia", nombre: "Nacidos en otra provincia", vf: pct});
    }
    const cl = [{k: "pct_la_provincia", lab: "En la provincia", c: "#1F5E97"}, {k: "pct_otra_provincia", lab: "En otra provincia", c: "#74ACDF", texto: "#18212B"},
      {k: "pct_otro_pais", lab: "En otro país", c: "#F6B40E", texto: "#18212B"}];
    leyenda("migracion-interna-ley", cl);
    let txt = LEAD["migracion-interna"]();
    if (fp && fp.territorio !== MGC.otra_top[0] && !MGC.otra_bajos[0].includes(fp.territorio)) txt += ` En ${fp.territorio}, el ${pct(fp.pct_otra_provincia)}` +
      ` había nacido en otra provincia y el ${pct(fp.pct_otro_pais)}, en otro país.`;
    $t("migracion-interna").textContent = txt;
    const pais = T.nacidos_otro_pais_provincias.find(r => r.codigo_indec === "00");
    apiladasH(G("migracion-interna"), {anim: a, claves: cl, data: [{...pais, territorio: "Todo el país"},
      ...T.nacidos_otro_pais_provincias.filter(r => r.codigo_indec !== "00").sort((p, q) => q.pct_la_provincia - p.pct_la_provincia)]});
  }),
  // personas nacidas en otro país en cada censo nacional (etapa 25)
  "migracion-historia": a => lineas(G("migracion-historia"), {anim: a, data: T.migracion_censos, x: "anio", y0: 0, vf: pct, yf: v => n0(v) + "%",
    series: [{k: "nacidos_otro_pais_pct", lab: "Nacidos en otro país", corto: "Otro país", c: NAR},
      {k: "limitrofes_pct", lab: "Nacidos en países limítrofes", corto: "Limítrofes", c: FRI}]}),
  // residencias otorgadas por la Dirección Nacional de Migraciones (etapa 25): por año, o por nacionalidad en el último año
  radicaciones: conTablas("radicaciones", () => MED.radicaciones === "nacionalidad" ? ["radicaciones_nacionalidad"] : [], a => {
    const v = MED.radicaciones, el = G("radicaciones"), cl = [{k: "permanentes", lab: "Permanentes", c: NAR}, {k: "temporarias", lab: "Temporarias", c: css("--celeste")}];
    $t("radicaciones").textContent = LEAD.radicaciones(v);
    leyenda("radicaciones-ley", cl);
    $("radicaciones-ley").hidden = v !== "anio";
    if (v === "nacionalidad") {
      const filas = T.radicaciones_nacionalidad.filter(r => r.anio === MGD.anio && r.nacionalidad !== "Otras nacionalidades").slice(0, 12);
      return barrasH(el, {anim: a, data: filas.map((r, i) => ({codigo_indec: "n" + i, territorio: r.nacionalidad, total: r.total, permanentes: r.permanentes,
        temporarias: r.temporarias, pct: r.pct})), k: "total", vf: n0, af: v => v >= 1e3 ? n0(v / 1e3) + " mil" : n0(v), l: 150, lAngosto: 118,
        tip: d => `<b>${d.territorio}</b><br>${n0(d.total)} residencias en ${MGD.anio}<br>${n0(d.permanentes)} permanentes y ${n0(d.temporarias)} temporarias<br>` +
          `${pct(d.pct)} del total`});
    }
    columnasApiladas(el, {anim: a, data: T.radicaciones_anual, vf: n0, af: v => n0(v / 1e3) + " mil", unidad: "residencias otorgadas", cadaTick: 1, claves: cl});
  }),
  // personas nacidas en la Argentina que viven en otro país (etapa 25, Naciones Unidas): por año, o por país de destino
  "argentinos-exterior": conTablas("argentinos-exterior", () => MED["argentinos-exterior"] === "pais" ? ["argentinos_exterior_destinos"] : [], a => {
    const v = MED["argentinos-exterior"], el = G("argentinos-exterior");
    $t("argentinos-exterior").textContent = LEAD["argentinos-exterior"](v);
    if (v === "pais") return barrasH(el, {anim: a, data: T.argentinos_exterior_destinos.slice(0, 12).map((r, i) => ({codigo_indec: "d" + i, territorio: r.pais,
      personas: r.personas, inicio: r.personas_inicio, pct: r.pct})), k: "personas", vf: n0, af: v => v >= 1e3 ? n0(v / 1e3) + " mil" : n0(v), l: 150, lAngosto: 118,
      tip: d => `<b>${d.territorio}</b><br>${n0(d.personas)} personas en ${MGO.anio}<br>${pct(d.pct)} del total<br>En ${MGO.desde}, ${n0(d.inicio)}`});
    lineas(el, {anim: a, data: T.argentinos_exterior, x: "anio", y0: 0, vf: n0, yf: v => v === 0 ? "0" : n1(v / 1e6) + " M",
      series: [{k: "personas", lab: "Nacidos en la Argentina", corto: "Personas", c: NAR}]});
  }),
  // cuentas del Sector Público Nacional (etapa 25): el resultado primario y el financiero como parte del PBI, o en qué se gasta
  "cuentas-nacion": a => {
    const v = MED["cuentas-nacion"], el = G("cuentas-nacion");
    $t("cuentas-nacion").textContent = LEAD["cuentas-nacion"](v);
    if (v === "gasto") return barrasH(el, {anim: a, data: T.gasto_nacion_tipo.map((r, i) => ({codigo_indec: "g" + i, territorio: r.tipo, corto: r.tipo
      .replace("Jubilaciones, pensiones y otras prestaciones sociales", "Prestaciones sociales").replace("Transferencias corrientes a las provincias", "A provincias")
      .replace("Otros gastos de funcionamiento", "Otros de funcionamiento"), pct: r.pct_gasto_primario, pbi: r.pct_pbi, millones: r.millones})), k: "pct", vf: pct,
      af: v => n0(v) + "%", l: 290, lAngosto: 150, corto: d => d.corto,
      tip: d => `<b>${d.territorio}</b><br>${pct(d.pct)} del gasto primario de ${GBN.anio}<br>${n2(d.pbi)}% del PBI<br>${billones(d.millones)}`});
    const lo = d3.min(T.cuentas_nacion, r => Math.min(r.resultado_primario_pbi, r.resultado_financiero_pbi));
    lineas(el, {anim: a, data: T.cuentas_nacion, x: "anio", y0: Math.floor(lo) - 1, ref: 0, vf: pct, yf: v => n0(v) + "%",
      series: [{k: "resultado_primario_pbi", lab: "Resultado primario", corto: "Primario", c: NAR}, {k: "resultado_financiero_pbi", lab: "Resultado financiero", corto: "Financiero", c: FRI}]});
  },
  // recaudación de impuestos nacionales (etapa 25): cada impuesto en los últimos doce meses, o el total como parte del PBI año por año
  recaudacion: a => {
    const v = MED.recaudacion, el = G("recaudacion");
    $t("recaudacion").textContent = LEAD.recaudacion(v);
    if (v === "anio") return lineas(el, {anim: a, data: T.recaudacion_anual, x: "anio", y0: 0, vf: pct, yf: v => n0(v) + "%",
      series: [{k: "total_pbi", lab: "Recaudación nacional", corto: "Recaudación", c: NAR}]});
    barrasH(el, {anim: a, data: T.recaudacion_impuestos.map((r, i) => ({codigo_indec: "t" + i, territorio: r.impuesto, corto: r.impuesto
      .replace("Aportes y contribuciones a la seguridad social", "Seguridad social").replace("Derechos de importación y tasa de estadística", "Derechos de importación")
      .replace("Débitos y créditos bancarios", "Débitos y créditos"), pct: r.pct, millones: r.millones_12_meses})), k: "pct", vf: pct, af: v => n0(v) + "%",
      l: 290, lAngosto: 150, corto: d => d.corto, tip: d => `<b>${d.territorio}</b><br>${pct(d.pct)} de lo recaudado<br>${billones(d.millones)} en doce meses`});
  },
  // deuda bruta de la Administración Central como parte del PBI (etapa 25): cada fin de año y los trimestres del año en curso
  deuda: a => {
    $t("deuda").textContent = LEAD.deuda();
    lineas(G("deuda"), {anim: a, data: T.deuda_pbi, x: "x", y0: 0, vf: pct, yf: v => n0(v) + "%",
      xl: r => r.periodo.includes("T") ? `${["primer", "segundo", "tercer", "cuarto"][+r.periodo[0] - 1]} trimestre de ${r.periodo.slice(2)}` : `fin de ${r.periodo}`,
      series: [{k: "pct_pbi", lab: "Deuda bruta", corto: "Deuda", c: NAR}]});
  },
  // empleo público (etapa 25): cargos en las administraciones provinciales cada 1.000 habitantes, o la dotación de la administración nacional
  "empleo-publico": a => {
    const v = MED["empleo-publico"], el = G("empleo-publico"), fp = T.empleo_publico_provincias.find(r => r.codigo_indec === prov);
    let txt = LEAD["empleo-publico"](v);
    if (v === "nacion") {
      $t("empleo-publico").textContent = txt;
      return lineas(el, {anim: a, data: T.dotacion_nacion.map(r => ({...r, t: tPer(r.periodo)})), x: "t", y0: 0, vf: n0, yf: v => v === 0 ? "0" : n0(v / 1e3) + " mil",
        xl: r => mesPer(r.periodo), mensual: true, series: [{k: "total", lab: "Total", c: NAR}, {k: "administracion", lab: "Administración pública nacional",
        corto: "Administración", c: css("--azul-hondo")}, {k: "empresas", lab: "Empresas y sociedades del Estado", corto: "Empresas", c: FRI}]});
    }
    if (fp && fp.territorio !== GBC.top[0] && fp.territorio !== GBC.bajo[0]) txt += ` En ${fp.territorio}, ${n1(fp.cada_1000)}${conVeces(fp.cada_1000, GBC.cada_1000)}: ` +
      `${n0(fp.cargos)} cargos.`;
    $t("empleo-publico").textContent = txt;
    barrasH(el, {anim: a, data: T.empleo_publico_provincias, k: "cada_1000", vf: n1, af: n0, ref: GBC.cada_1000, refLab: `País ${n1(GBC.cada_1000)}`,
      tip: d => `<b>${d.territorio}</b><br>${n1(d.cada_1000)} cargos cada 1.000 habitantes<br>${n0(d.cargos)} cargos en ${GBC.anio}<br>En ${GBC.inicio}, ${n0(d.cargos_inicio)}`});
  },
  // impuestos provinciales por habitante (etapa 25)
  "impuestos-provinciales": a => {
    const fp = T.impuestos_provinciales.find(r => r.codigo_indec === prov && r.por_habitante != null);
    let txt = LEAD["impuestos-provinciales"]();
    if (fp && fp.territorio !== GBP.top[0] && fp.territorio !== GBP.bajo[0]) txt += ` En ${fp.territorio}, ${n0(fp.por_habitante)} pesos por habitante` +
      `${conVeces(fp.por_habitante, GBP.pais)}, y el ${pct(fp.pct_ingresos_brutos)} de ingresos brutos.`;
    $t("impuestos-provinciales").textContent = txt;
    barrasH(G("impuestos-provinciales"), {anim: a, data: T.impuestos_provinciales.filter(r => r.por_habitante != null), k: "por_habitante", vf: millonesM, af: ejeM,
      ref: GBP.pais, refLab: `País ${millonesM(GBP.pais)}`, tip: d => `<b>${d.territorio}</b><br>${n0(d.por_habitante)} pesos por habitante en ${GBP.anio}<br>` +
        `${billones(d.millones)}<br>${pct(d.pct_ingresos_brutos)} de ingresos brutos`});
  },
  combustibles: conTablas("combustibles", () => MED["combustibles-vista"] === "mes" ? ["combustibles_mensual"] : [], a => {
    const p = MED.combustibles, el = G("combustibles"), fp = T.combustibles_provincias.find(r => r.codigo_indec === prov);
    let txt = LEAD.combustibles(p, MED["combustibles-vista"]);
    if (MED["combustibles-vista"] === "anio") {
      // el país y, con una provincia elegida, su línea (en pesos del último año)
      const suya = fp ? new Map(T.combustibles_anual.filter(r => r.codigo_indec === prov).map(r => [r.anio, r[p + "_real"]])) : null;
      if (fp && suya.has(CB.anual_ult)) txt += ` En ${fp.territorio}, ${n0(suya.get(CB.anual_ult))} pesos en ${CB.anual_ult}.`;
      $t("combustibles").textContent = txt;
      return lineas(el, {anim: a, x: "anio", y0: 0, vf: n0, yf: n0,
        data: T.combustibles_anual.filter(r => r.codigo_indec === "00").map(r => ({anio: r.anio, pais: r[p + "_real"], prov: suya ? suya.get(r.anio) ?? null : null})),
        series: [{k: "pais", lab: "Todo el país", c: NAR}, ...(fp ? [{k: "prov", lab: fp.territorio, c: FRI}] : [])]});
    }
    if (MED["combustibles-vista"] === "mes") {
      // el país y, con una provincia elegida, su línea
      const suya = fp ? new Map(T.combustibles_mensual.filter(r => r.codigo_indec === prov).map(r => [r.periodo, r[p + "_real"]])) : null;
      if (fp) txt += ` En ${fp.territorio}, ${n0(suya.get(CB.periodo))} pesos en ${CB.mes}.`;
      $t("combustibles").textContent = txt;
      return lineas(el, {anim: a, x: "t", y0: 0, vf: n0, yf: n0, xl: r => mesPer(r.periodo), mensual: true,
        data: T.combustibles_mensual.filter(r => r.codigo_indec === "00").map(r => ({t: tPer(r.periodo), periodo: r.periodo, pais: r[p + "_real"], prov: suya ? suya.get(r.periodo) ?? null : null})),
        series: [{k: "pais", lab: "Todo el país", c: NAR}, ...(fp ? [{k: "prov", lab: fp.territorio, c: FRI}] : [])]});
    }
    $t("combustibles").textContent = txt;
    barrasH(el, {anim: a, data: T.combustibles_provincias, k: p, vf: n0, af: n0, ref: CB[p], refLab: `País ${n0(CB[p])}`,
      tip: d => `<b>${d.territorio}</b><br>${n0(d[p])} pesos por litro<br>${n0(d[p + "_estaciones"])} estaciones<br>En ${CB.mes_antes}: ${n0(d[p + "_antes"])}`});
  }),
  subsidios: a => {
    const pbi = MED.subsidios === "pbi";
    $t("subsidios").textContent = LEAD.subsidios(MED.subsidios);
    columnasApiladas(G("subsidios"), {anim: a, cadaTick: 2, l: 44, data: pbi ? T.subsidios_energia.filter(r => r.pct_pbi != null) : T.subsidios_energia,
      vf: pbi ? v => n2(v) + "%" : n0, af: pbi ? v => n1(v) + "%" : n0, unidad: pbi ? "del PBI" : `miles de millones de pesos de ${e.sub_ult}`,
      claves: [{k: pbi ? "pct_pbi" : "miles_millones_reales", lab: "Subsidios a la energía", c: NAR}]});
  },
  "balanza-energetica": a => lineas(G("balanza-energetica"), {anim: a, data: T.balanza_energetica, x: "anio", ref: 0,
    series: [{k: "exportaciones", lab: "Exportaciones", c: NAR}, {k: "importaciones", lab: "Importaciones", c: FRI}, {k: "saldo", lab: "Saldo", c: css("--ink"), w: 1.8, dash: "4 3"}],
    y0: Math.min(0, d3.min(T.balanza_energetica, r => r.saldo)), vf: n0, yf: n0}),
  "mundo-petroleo": a => {
    const k = MED["mundo-petroleo"], gas = k === "gas_bcm", q = PG.mundo.neuquen;
    $t("mundo-petroleo").textContent = LEAD["mundo-petroleo"](k);
    const filas = T.mundo_hidrocarburos.filter(r => r.variable === k).map(r => ({codigo_indec: r.iso3, territorio: r.pais, v: r.valor, puesto: r.puesto}));
    if (!gas && q) filas.push({codigo_indec: "NQN", territorio: "Neuquén (provincia)", v: q.kbd});
    barrasH(G("mundo-petroleo"), {anim: a, data: filas, k: "v", vf: gas ? n1 : n0, af: n0, l: 168, lAngosto: 142, marcar: new Set(["ARG", "NQN"]),
      color: d => d.codigo_indec === "ARG" ? css("--celeste-fuerte") : d.codigo_indec === "NQN" ? css("--sol") : css("--celeste"),
      tip: d => `<b>${d.territorio}</b><br>${gas ? n1(d.v) + " mil millones de m³" : n0(d.v) + " mil barriles por día"}<br>` +
        (d.puesto ? `Puesto ${d.puesto} en el mundo` : `Provincia de la Argentina: estaría en el puesto ${q.puesto}`)});
  },
  permisos: a => lineas(G("permisos"), {anim: a, data: T.permisos_mensual.map(r => ({...r, m2: r.superficie_m2 / 1000, m2_12: r.m2_12m == null ? null : r.m2_12m / 1000, t: tPer(r.periodo)})),
    x: "t", series: [{k: "m2", lab: "Por mes", c: css("--celeste"), w: 1.6}, {k: "m2_12", lab: "Promedio de doce meses", c: NAR}], y0: 0, vf: n0, yf: n0, xl: r => mesPer(r.periodo)}),
  hipotecas: a => lineas(G("hipotecas"), {anim: a, data: T.hipotecas_mensual.map(r => ({...r, t: tPer(r.periodo)})), x: "t",
    series: [{k: "miles_millones", lab: "Por mes", c: NAR}], y0: 0, vf: n0, yf: n0, xl: r => mesPer(r.periodo)}),
  "obra-publica": a => {
    const k = MED["obra-publica"];
    $t("obra-publica").textContent = LEAD["obra-publica"](k);
    const cl = [{k: "obras", lab: "Obras de la Nación", c: "#1F5E97"}, {k: "transf", lab: "Transferencias de capital a provincias y municipios", c: "#74ACDF", texto: "#18212B"}];
    $("obra-publica-ley").hidden = k !== "serie";
    if (k === "serie") {
      leyenda("obra-publica-ley", cl);
      return columnasApiladas(G("obra-publica"), {anim: a, claves: cl, cadaTick: 5, vf: n0, af: n0, l: 46, unidad: `miles de millones de pesos de ${CN.op_ult}`, data: T.obra_publica_serie});
    }
    barrasH(G("obra-publica"), {anim: a, data: T.obra_publica_provincias, k: "total_hab", vf: n0, af: v => n0(v / 1000) + " mil", ref: CN.op_hab_pais, refLab: `País ${n0(CN.op_hab_pais)}`,
      tip: d => `<b>${d.territorio}</b><br>${n0(d.total_hab)} pesos por habitante<br>Obras de la Nación: ${n0(d.obras_hab)}<br>Transferencias de capital: ${n0(d.transf_hab)}`});
  },
  isac: conTablas("isac", ["isac_mensual"], a => lineas(G("isac"), {anim: a, data: T.isac_mensual.map(r => ({...r, t: tPer(r.periodo)})), x: "t",
    y0: Math.floor(d3.min(T.isac_mensual, r => Math.min(r.original, r.desestacionalizada)) / 20) * 20,
    series: [{k: "original", lab: "Original", c: css("--celeste"), w: 1.6}, {k: "desestacionalizada", lab: "Sin estacionalidad", c: NAR}], vf: n1, yf: n0, xl: r => mesPer(r.periodo)})),
  insumos: a => {
    const k = MED.insumos;
    $t("insumos").textContent = LEAD.insumos(k);
    barrasH(G("insumos"), {anim: a, data: T.isac_insumos, k, vf: masPct, af: v => v + "%", l: 210, lAngosto: 152, corto: d => CORTO_INS[d.territorio] || d.territorio});
  },
  "empleo-construccion": conTablas("empleo-construccion", () => MED["empleo-construccion"] === "serie" ? ["empleo_construccion_serie"] : [], a => {
    const k = MED["empleo-construccion"];
    $t("empleo-construccion").textContent = LEAD["empleo-construccion"](k);
    $("clave-empleo-construccion").hidden = k !== "var_construccion";
    if (k === "serie") return lineas(G("empleo-construccion"), {anim: a, data: T.empleo_construccion_serie.map(r => ({...r, t: r.anio + (r.trimestre - 1) / 4})), x: "t",
      series: [{k: "construccion", lab: "País", c: NAR}], y0: 0, vf: n0, yf: v => n0(v / 1000) + " mil", xl: r => `${TRIM_N[r.trimestre - 1]} trimestre de ${r.anio}`});
    const tip = d => `<b>${d.territorio}</b><br>${n0(d.construccion)} puestos asalariados registrados<br>${n1(d.construccion_cada_1000)} cada 1.000 habitantes<br>${pct(d.pct_construccion)} del empleo privado registrado`;
    if (k === "var_construccion") return barrasH(G("empleo-construccion"), {anim: a, data: T.empleo_construccion_provincias, k, vf: masPct, af: v => v + "%", mejor: "sube", pais: CN.emp_var, tip});
    barrasH(G("empleo-construccion"), {anim: a, data: T.empleo_construccion_provincias, k, vf: n1, af: n0, ref: CN.emp_cada_1000, refLab: `País ${n1(CN.emp_cada_1000)}`, tip});
  }),
  trabajadores: conTablas("trabajadores", () => MED["trabajadores-vista"] === "mapa" ? ["vivienda_departamentos"] : [], a => MED["trabajadores-vista"] === "mapa"
    ? mapaDep(G("trabajadores"), {anim: a, filas: T.vivienda_departamentos, k: "pct_ocupados_construccion", nombre: "Personas ocupadas en la construcción", vf: pct})
    : barrasH(G("trabajadores"), {anim: a, data: T.vivienda_provincias, k: "pct_ocupados_construccion", ref: VV.pct_ocupados_construccion,
        refLab: `País ${pct(VV.pct_ocupados_construccion)}`, vf: v => n1(v) + "%", af: v => v + "%", dif: "puntos"})),
  costo: conTablas("costo", ["costo_construccion"], a => lineas(G("costo"), {anim: a, data: T.costo_construccion.map(r => ({...r, t: tPer(r.periodo)})), x: "t",
    y0: Math.floor(d3.min(T.costo_construccion, r => Math.min(r.icc_real, r.materiales_real, r.mano_obra_real)) / 10) * 10,
    ref: 100,
    series: [{k: "icc_real", lab: "Costo total", c: NAR}, {k: "materiales_real", lab: "Materiales", c: css("--celeste"), w: 1.8}, {k: "mano_obra_real", lab: "Mano de obra", c: FRI, w: 1.8}],
    vf: n1, yf: n0, xl: r => mesPer(r.periodo)})),
  vivienda: conTablas("vivienda", () => MED["vivienda-vista"] === "mapa" ? ["vivienda_departamentos"] : [], a => {
    const k = MED.vivienda, ind = VIV_IND[k];
    $t("vivienda").textContent = ind.t();
    $t("vivienda-nota").textContent = NOTA_VIV(k);
    if (MED["vivienda-vista"] === "mapa") return mapaDep(G("vivienda"), {anim: a, filas: T.vivienda_departamentos, k, nombre: ind.nombre, vf: ind.f});
    const pc = k.startsWith("pct");
    barrasH(G("vivienda"), {anim: a, data: T.vivienda_provincias, k, ref: VV[k], refLab: `País ${pc ? pct(VV[k]) : n1(VV[k])}`,
      vf: pc ? (v => n1(v) + "%") : n1, af: pc ? (v => v + "%") : n0, dif: pc ? "puntos" : null});
  }),
});

/* ---------- política ---------- */
const listaY = arr => arr.length > 1 ? arr.slice(0, -1).join(", ") + " " + yE(arr[arr.length - 1]) : arr[0];
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
$("el-sel").innerHTML = [...R.elecciones].reverse().map(e => `<option value="${e.id}">${nombreEl(e)}</option>`).join("");
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
TX["congreso-titulo"] = $t("congreso-titulo").textContent = `Composición del Congreso por espacio político en cada período legislativo, 1983 a ${CG.anio + 2}`;
DIB.congreso = a => {
  const cam = MED.congreso, esp = CG.espacios, v = cam === "Diputados" ? CG.dip : CG.sen, n = cam === "Diputados" ? CG.n_dip : CG.n_sen;
  const ord = esp.filter(k => v[k]).sort((p, q) => v[q] - v[p]);
  document.querySelector('[data-t="congreso"]').textContent = cam === "Diputados"
    ? `Al ${CG.fecha}, en la Cámara de Diputados ${ESP_TXT[ord[0]]} tenía ${v[ord[0]]} de las ${n} bancas, ${ESP_TXT[ord[1]]} ${v[ord[1]]} y ${ESP_TXT[ord[2]]} ${v[ord[2]]}. El gráfico muestra el reparto al 1 de marzo de cada período desde la vuelta de la democracia, así que la última barra puede diferir de hoy por cambios de bloque y reemplazos. Tocá un espacio en la leyenda para ver cómo votó las leyes clave.`
    : `Al ${CG.fecha}, en el Senado ${ESP_TXT[ord[0]]} tenía ${v[ord[0]]} de las ${n} bancas, ${ESP_TXT[ord[1]]} ${v[ord[1]]} y ${ESP_TXT[ord[2]]} ${v[ord[2]]}. Tocá un espacio en la leyenda para ver cómo votó las leyes clave.`;
  const filas = T.congreso_composicion.filter(d => d.camara === cam);
  const cl = esp.filter(k => filas.some(d => d[k] > 0)).map(k => ({k, lab: k, c: ESP_COLOR[k]}));
  document.getElementById("cg-ley").innerHTML = cl.map(k => VT.espacios.includes(k.k)
    ? `<button type="button" class="esp-btn" data-e="${k.k}" aria-haspopup="dialog"><i style="background:${k.c}"></i>${k.lab}</button>`
    : `<span><i style="background:${k.c}"></i>${k.lab}</span>`).join("");
  columnasApiladas(G("congreso"), {anim: a, data: filas, claves: cl, cadaTick: 2});
};
$("lg-sel").innerHTML = PROV.map(([c, nom]) => `<option value="${c}">${nom}</option>`).join("");
const LG_PER = CG.periodos, LG_ULT = LG_PER[LG_PER.length - 1];
$("lg-per").innerHTML = [...LG_PER].reverse().map(a => `<option value="${a}">${a} a ${a + 2}${a === LG_ULT ? " (el actual)" : ""}</option>`).join("");
MED.legisladores = null; MED.lgPer = LG_ULT;
let LGP = null, lgCargando = null;
const lgCargar = () => lgCargando || (lgCargando = d3.json("datos/legisladores_por_periodo.json").then(j => { LGP = j; }));
["lg-sel", "lg-per"].forEach(id => $(id).addEventListener("change", ev => {
  if (id === "lg-sel") MED.legisladores = ev.target.value; else MED.lgPer = +ev.target.value;
  DIB.legisladores();
}));
const lgMes = t => t === "sin fecha" ? "sin fecha" : `${MESES[+t.slice(5, 7) - 1]} de ${t.slice(0, 4)}`;
/* Hemiciclo (etapa 28): un punto por banca, en filas de semicírculos, agrupadas por espacio en el orden de la leyenda de la composición
   (de izquierda a derecha) y, dentro de cada espacio, por provincia. Con una provincia elegida, sus bancas quedan resaltadas, y al pasar
   el mouse o tocar cerca de una banca, el cuadro dice quién la ocupa. Las bancas se reparten entre las filas según su largo */
function hemiciclo(el, bancas, prov, tipBanca) {
  el.innerHTML = "";
  const n = bancas.length, W = Math.max(240, el.clientWidth), filas = n > 150 ? 9 : n > 60 ? 6 : 4;
  // el radio de afuera deja lugar para el punto de la banca, así las de los bordes no se cortan
  const geo = R => {
    const r0 = R * (n > 150 ? .36 : .34), radios = d3.range(filas).map(i => r0 + (R - r0) * i / (filas - 1));
    const porFila = radios.map(r => Math.floor(n * r / d3.sum(radios)));
    for (let i = filas - 1, falta = n - d3.sum(porFila); falta > 0; falta--, i = (i + filas - 1) % filas) porFila[i]++;
    return {radios, porFila, rb: Math.min((R - r0) / (filas - 1), Math.PI * r0 / Math.max(1, porFila[0] - 1)) * .42};
  };
  const R = W / 2 - geo(W / 2).rb - 1, {radios, porFila, rb} = geo(R), H = R + 2 * rb + 2;
  const pos = radios.flatMap((r, i) => d3.range(porFila[i]).map(j => {
    const t = Math.PI * (1 - j / Math.max(1, porFila[i] - 1));
    return {x: W / 2 + r * Math.cos(t), y: R + rb + 1 - r * Math.sin(t), t, r};
  })).sort((p, q) => q.t - p.t || p.r - q.r);
  const orden = [...bancas].sort((p, q) => p.e - q.e || p.prov.localeCompare(q.prov) || p.nom.localeCompare(q.nom, "es"));
  orden.forEach((b, i) => Object.assign(b, pos[i]));
  const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("role", "img")
    .attr("aria-label", `${n} bancas: ` + listaY(CG.espacios.filter(k => orden.some(b => LGP.espacios[b.e] === k))
      .map(k => `${orden.filter(b => LGP.espacios[b.e] === k).length} ${deEsp(k)}`)));
  svg.selectAll("circle.banca").data(orden).join("circle").attr("class", "banca").attr("cx", b => b.x).attr("cy", b => b.y).attr("r", rb)
    .attr("fill", b => ESP_COLOR[LGP.espacios[b.e]]).attr("opacity", b => !prov || b.prov === prov ? 1 : .45);
  const anillo = svg.append("circle").attr("r", rb + 2.5).attr("fill", "none").attr("stroke", "var(--ink)").attr("stroke-width", 1.5)
    .attr("opacity", 0).attr("pointer-events", "none");
  const dl = d3.Delaunay.from(orden, b => b.x, b => b.y);
  const ver = ev => {
    const [sx, sy] = d3.pointer(ev, svg.node()), [ex, ey] = d3.pointer(ev, el), b = orden[dl.find(sx, sy)];
    if (b && Math.hypot(b.x - sx, b.y - sy) < rb * 3) { anillo.attr("cx", b.x).attr("cy", b.y).attr("opacity", 1); return mostrarTip(el, tipBanca(b), ex, ey); }
    anillo.attr("opacity", 0); ocultarTip();
  };
  svg.append("rect").attr("width", W).attr("height", H).attr("fill", "transparent").style("touch-action", "pan-y")
    .on("pointermove", ver).on("pointerdown", ver).on("pointerleave", () => { anillo.attr("opacity", 0); ocultarTip(); });
}
DIB.legisladores = () => {
  const c = MED.legisladores || prov || "02", per = MED.lgPer, el = G("legisladores");
  document.getElementById("lg-sel").value = c; document.getElementById("lg-per").value = per;
  if (!LGP) { esperando(el); lgCargar().then(DIB.legisladores).catch(() => sinDatos(el, "No se pudo cargar la lista.")); return; }
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
    `<small>${LGP.bloques[b.h[4]]}${b.h[6] && b.h[6] !== "sin fecha" ? `, desde ${lgMes(b.h[6])}` : ""}</small></li>`;
  const dip = bancas(0), sen = bancas(1);
  const cuenta = arr => CG.espacios.filter(k => arr.some(b => LGP.espacios[b.h[5]] === k))
    .map(k => `${arr.filter(b => LGP.espacios[b.h[5]] === k).length} de ${ESP_TXT[k]}`.replace(" de el ", " del "));
  const cambios = d3.sum([...dip, ...sen], b => b.cambios);
  document.querySelector('[data-t="legisladores"]').textContent = `En el período ${per} a ${per + 2}, ${NOMBRES[c]} ${per === LG_ULT ? "tiene" : "tuvo"} ` +
    `${dip.length} bancas de diputados y ${sen.length} de senadores nacionales. En Diputados: ${listaY(cuenta(dip))}. En el Senado: ${listaY(cuenta(sen))}. ` +
    (cambios ? `Hubo ${cambios === 1 ? "un cambio" : `${cambios} cambios`} de legislador ${per === LG_ULT ? "en lo que va del" : "durante el"} período, que ${cambios === 1 ? "figura" : "figuran"} entre paréntesis.`
      : `No hubo cambios de legisladores ${per === LG_ULT ? "en lo que va del" : "durante el"} período.`);
  el.removeAttribute("aria-busy");
  // hemiciclos de las dos cámaras, arriba de la lista: quién ocupa cada banca en la fecha de la composición del período
  const bh = (LGP.hemiciclo[per] || []).map(([cam, p, i, bl, e]) => ({cam, prov: p, nom: nom(i), bloque: LGP.bloques[bl], e}));
  const ley = arr => CG.espacios.filter(k => arr.some(b => LGP.espacios[b.e] === k))
    .map(k => `<span><i style="background:${ESP_COLOR[k]}"></i>${k} <b>${arr.filter(b => LGP.espacios[b.e] === k).length}</b></span>`).join("");
  // las bancas se resaltan solo con una provincia elegida (en el sitio o en la lista): sin elegir, la lista muestra CABA pero el hemiciclo, todo
  const marcada = MED.legisladores || (NOMBRES[prov] ? prov : "");
  const cuantas = cam => bh.filter(b => b.cam === cam).length;
  const hemi = cam => `<figure class="hemi ha-f${cam}"><h4>${cam ? "Senado" : "Diputados"}, ${cuantas(cam)} bancas</h4><div class="hemi-svg" data-cam="${cam}"></div></figure>`;
  el.innerHTML = `<div class="lg-hemis">${hemi(0)}${hemi(1)}` +
    [0, 1].map(cam => `<div class="pol-ley ha-l${cam}">${ley(bh.filter(b => b.cam === cam))}</div>`).join("") +
    `<p class="hemi-pie">Cada punto es una banca, con quien la ocupaba ${per === LG_ULT ? "hoy" : `el ${fechaLarga(LGP.hemiciclo_fecha[per])}`}. ` +
    `Los espacios van en el orden de la leyenda y, dentro de cada uno, por provincia. ` +
    (marcada ? `Las bancas de ${NOMBRES[marcada]} quedan resaltadas.` : "Al elegir una provincia, sus bancas quedan resaltadas.") + `</p></div>` +
    `<div class="senado"><h4>Senado</h4><ul>${sen.map(li).join("")}</ul></div><div><h4>Diputados</h4><ul>${dip.map(li).join("")}</ul></div>`;
  const tipBanca = b => `<b>${b.nom}</b><br>${bandera(b.prov)}${NOMBRES[b.prov]}<br>${b.bloque}`;
  el.querySelectorAll(".hemi-svg").forEach(h => hemiciclo(h, bh.filter(b => b.cam === +h.dataset.cam), marcada, tipBanca));
};




/* ---------- legisladores con más años en el Congreso desde 1983 (etapa 28) ----------
   Los años de cada persona en cada cámara salen de 02_procesar.py (tabla anios_congreso, que se baja al dibujar la ficha). Sin provincia,
   las 15 personas con más años, y con una provincia, las 10 de esa provincia (cada persona va con la provincia por la que estuvo más años) */
const AC = R.anios_congreso, AC_K = {total: "anios_total", dip: "anios_diputados", sen: "anios_senado"};
const AC_CAM = {total: "", dip: " en Diputados", sen: " en el Senado"};
function textoAnios(filas, v, p) {
  const k = AC_K[v], [a, ...resto] = filas;
  if (!a) return `${NOMBRES[p]} no tuvo legisladores${AC_CAM[v]} desde 1983.`;
  const partes = d => v !== "total" ? "" : !(d.anios_senado > 0) ? ", todos en Diputados" : !(d.anios_diputados > 0) ? ", todos en el Senado"
    : `, ${n1(d.anios_diputados)} en Diputados y ${n1(d.anios_senado)} en el Senado`;
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
MED.anioscong = "total";
DIB.anioscong = conTablas("anioscong", ["anios_congreso"], a => {
  const el = G("anioscong"); if (!el) return;
  const v = MED.anioscong, k = AC_K[v], p = NOMBRES[prov] ? prov : "";
  const filas = T.anios_congreso.filter(d => d[k] > 0 && (!p || d.codigo_indec === p))
    .sort((x, y) => y[k] - x[k] || x.nombre.localeCompare(y.nombre, "es")).slice(0, p ? 10 : 15);
  const claves = [{k: "dip", lab: "Diputados", c: css("--azul")}, {k: "sen", lab: "Senado", c: css("--celeste"), texto: css("--ink")}]
    .filter(c => v === "total" || c.k === v);
  const data = filas.map((d, i) => ({...d, codigo_indec: "a" + i, prov: d.codigo_indec, territorio: d.nombre,
    dip: v === "sen" ? 0 : d.anios_diputados, sen: v === "dip" ? 0 : d.anios_senado}));
  const tope = (d3.max(filas, d => d[k]) || 1) * 1.18, marcas = d3.range(0, tope, 10);
  apiladasH(el, {anim: a, data, claves, bandera: d => d.prov, max: tope, ticks: marcas, ejeF: x => x === marcas[marcas.length - 1] ? `${x} años` : x,
    izq: angosto => angosto ? 176 : 236, recortar: true, sinProv: true, tipF: x => `${n1(x)} años`, alFinal: d => n1(d[k]), fuerte: d => d.sigue,
    tipExtra: d => `<br>${bandera(d.prov)}${d.provincias}` + (d.periodos_diputados ? `<br>Diputados: ${d.periodos_diputados}` : "") +
      (d.periodos_senado ? `<br>Senado: ${d.periodos_senado}` : "") + `<br>${d.espacios}` + (d.sigue ? "<br>Sigue en el cargo" : "")});
  // con otra provincia cambian las filas: el gráfico se vuelve a dibujar
  el.resaltar = null;
  $t("anioscong").textContent = textoAnios(filas, v, p);
});


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
TX["votaciones-titulo"] = $t("votaciones-titulo").textContent = `Cómo votó cada espacio político las leyes clave, ${VT.leyes[0].anio} a ${VT.leyes[VT.leyes.length - 1].anio}`;
// Leyes de efecto directo (etapa 12): las que cambian, o proponían cambiar, algo que llega a la vida diaria de muchas personas o
// hogares. Selección propia en la columna efecto_directo de leyes_clave.csv: en la lista van primero, en su grupo
const opcionLey = l => `<option value="${l.k}">${l.anio}, ${l.nombre}</option>`;
$("vt-sel").innerHTML = `<optgroup label="Leyes de efecto directo">${[...VT.leyes].reverse().filter(l => l.ed).map(opcionLey).join("")}</optgroup>` +
  `<optgroup label="Otras leyes clave">${[...VT.leyes].reverse().filter(l => !l.ed).map(opcionLey).join("")}</optgroup>`;
MED.vtLey = VT.leyes[VT.leyes.length - 1].k; MED.votaciones = "Diputados"; MED.vtmatriz = "Diputados"; MED.vtfiltro = "todas";
// el conmutador de la tabla por espacio (todas o solo las de efecto directo) redibuja la tabla
DIB.vtfiltro = () => DIB.vtmatriz(false);
let VTJ = null, vtCargando = null;
const vtCargar = () => vtCargando || (vtCargando = d3.json("datos/votaciones_leyes_clave.json").then(j => { VTJ = j; }));
const vtConm = (g, cam) => {  // pone el conmutador de una ficha en la cámara indicada
  const conm = document.querySelector(`.conmutador[data-g="${g}"]`);
  conm.querySelectorAll("button").forEach((b, i) => { const on = b.dataset.m === cam; b.setAttribute("aria-pressed", on); if (on) conm.style.setProperty("--i", i); });
};
$("vt-sel").addEventListener("change", ev => { MED.vtLey = ev.target.value; cambiarVista("votaciones"); DIB.vtmatriz(false); });
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
    if (cfg.anim) pt.attr("opacity", 0).transition().delay(Math.min(150, j * 30)).duration(DUR_G).attr("opacity", 1);
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
  if (!VTJ) { esperando(el); vtCargar().then(() => DIB.votaciones(a)).catch(() => sinDatos(el, "No se pudieron cargar los votos.")); return; }
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
  return pl ? `<td class="plat"><a href="${CNE_2023 + encodeURIComponent(pl[1])}" target="_blank" rel="noopener" title="Plataforma de ${pl[0]}, elecciones 2023">PDF</a></td>` : `<td class="sin">—</td>`;
};
DIB.vtmatriz = a => {
  const cam = MED.vtmatriz, el = G("vtmatriz"), soloEd = MED.vtfiltro === "ed";
  const filas = VT.leyes.filter(l => !soloEd || l.ed);
  const leyes = filas.filter(l => l.camaras[cam]);
  const esp = VT.espacios.filter(e => leyes.filter(l => d3.sum(l.camaras[cam].espacios[e] || []) >= 3).length >= 3);
  const col = d3.scaleLinear().domain([0, 50, 100]).range([VOTO_COL[2], "#EEF1F4", VOTO_COL[1]]);
  const celda = (l, e) => {
    const c = l.camaras[cam] && l.camaras[cam].espacios[e];
    if (!l.camaras[cam]) return "";
    if (!c || !d3.sum(c)) return `<td class="sin">—</td>`;
    const tit = `${e}: ${c[0]} a favor, ${c[1]} en contra, ${c[2]} abstenciones y ${c[3]} ausentes`;
    if (postura(c) === "aus") return `<td class="sin" title="${tit}">aus.</td>`;
    const p = c[0] / (c[0] + c[1] + c[2]) * 100, fondo = col(p);
    return `<td title="${tit}" style="background:${fondo};color:${Math.abs(p - 50) > 30 ? "#fff" : "#18212B"}">${Math.round(p)}</td>`;
  };
  el.innerHTML = `<table><thead><tr><th>Ley</th>${esp.map(e => `<th><button type="button" class="esp-btn" data-e="${e}" aria-haspopup="dialog">${ESP_CORTO[e]}</button></th>`).join("")}</tr></thead><tbody>` +
    [...filas].reverse().map(l => `<tr role="button" tabindex="0" data-k="${l.k}"${l.k === MED.vtLey ? ' class="elegida"' : ""}><td class="ley">${l.nombre}<small>${l.camaras[cam] ? l.camaras[cam].fecha.slice(0, 4) : l.anio}${l.ed ? ", efecto directo" : ""}</small></td>` +
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
  document.querySelector('[data-t="vtm"]').textContent = `${cam === "Diputados" ? "En Diputados" : "En el Senado"} hay acta nominal de ${leyes.length} de las ${filas.length} leyes ${soloEd ? "de efecto directo" : "clave"}. ` +
    (mas ? `Contando la postura de la mayoría de cada espacio, ${ESP_TXT[mas.e1]} y ${ESP_TXT[mas.e2]} votaron igual en ${mas.igual} de las ${mas.n} leyes en que los dos tomaron posición, ` +
      `y ${ESP_TXT[menos.e1]} y ${ESP_TXT[menos.e2]} votaron distinto en ${menos.n - menos.igual} de ${menos.n}. ` : "") +
    `Tocá una ley para ver el voto de cada legislador, o el nombre de un espacio para ver su recorrido ley por ley.`;
};
/* Perfil de un espacio político (etapa 9, octubre de 2026, de la devolución que orientó la ronda: "al tocar un bloque, mostrar qué
   propone, qué votó y sus leyes principales"). Se abre al tocar su nombre en la tabla de leyes clave o su color en la leyenda del
   Congreso. Lleva su plataforma de 2023 (solo el enlace: no se resume ni se interpreta), cuántas leyes clave votó a favor y en contra
   en cada cámara y, ley por ley, qué cambia y cómo votó la mayoría del espacio. Todo sale de las actas. */
const POSTURA_CORTA = {si: "A favor", no: "En contra", div: "Dividido", aus: "Ausente"}, POSTURA_COL = {si: 1, no: 2, div: 3, aus: 4};
let dlgEsp = null;
const conLegisladores = (l, cam, e) => l.camaras[cam] && d3.sum(l.camaras[cam].espacios[e] || []) > 0;
function cerrarEspacio() {
  if (!dlgEsp?.open) return;
  if (REDUCIR) return dlgEsp.close();
  dlgEsp.animate([{opacity: 1}, {opacity: 0}], {duration: 150, easing: "ease-out"}).onfinish = () => dlgEsp.close();
}
function abrirEspacio(e) {
  if (!dlgEsp) {
    dlgEsp = document.createElement("dialog"); dlgEsp.className = "esp-dialogo"; dlgEsp.setAttribute("aria-labelledby", "esp-tit");
    document.body.appendChild(dlgEsp);
    dlgEsp.addEventListener("click", ev => {
      if (ev.target === dlgEsp) return cerrarEspacio();   // tocar afuera del cuadro
      if (ev.target.closest(".esp-cerrar")) return cerrarEspacio();
      const ver = ev.target.closest(".esp-ver");
      if (ver) {
        const k = ver.dataset.k; dlgEsp.close();
        MED.vtLey = k; MED.votaciones = VT_LEY[k].camaras.Diputados ? "Diputados" : "Senado"; vtConm("votaciones", MED.votaciones);
        DIB.votaciones(!REDUCIR); DIB.vtmatriz(false);
        document.getElementById("f-votaciones").scrollIntoView({behavior: REDUCIR ? "auto" : "smooth", block: "start"});
      }
    });
    dlgEsp.addEventListener("cancel", ev => { ev.preventDefault(); cerrarEspacio(); });   // Escape
  }
  const en = cam => cam === "Diputados" ? "En Diputados" : "En el Senado";
  const resumen = ["Diputados", "Senado"].map(cam => {
    const total = VT.leyes.filter(l => l.camaras[cam]).length, leyes = VT.leyes.filter(l => conLegisladores(l, cam, e));
    if (!leyes.length) return `${en(cam)} no tuvo legisladores en ninguna de las ${total} leyes clave con acta nominal.`;
    const n = {si: 0, no: 0, div: 0, aus: 0}; leyes.forEach(l => n[postura(l.camaras[cam].espacios[e])]++);
    const partes = [n.si && `votó a favor en ${n.si}`, n.no && `en contra en ${n.no}`, n.div && `se dividió en ${n.div}`, n.aus && `no estuvo en ${n.aus}`].filter(Boolean);
    return `${en(cam)} tuvo legisladores en ${leyes.length === total ? `las ${total}` : `${leyes.length} de las ${total}`} leyes clave con acta nominal, y la mayoría del espacio ${listaY(partes)}.`;
  }).join(" ");
  const pl = PLATAFORMA_2023[e];
  const plat = pl ? `<a href="${CNE_2023 + encodeURIComponent(pl[1])}" target="_blank" rel="noopener">Plataforma electoral de ${pl[0]}</a> <small>(PDF presentado ante la Cámara Nacional Electoral)</small>`
    : `Este grupo reúne a partidos distintos y no tiene una plataforma nacional única.`;
  const voto = (l, cam) => {
    if (!l.camaras[cam]) return `<li><span>${cam}</span><em class="sin">Sin acta nominal publicada</em></li>`;
    const c = l.camaras[cam].espacios[e];
    if (!c || !d3.sum(c)) return `<li><span>${cam}</span><em class="sin">Sin legisladores del espacio</em></li>`;
    const p = postura(c), det = [[0, "a favor"], [1, "en contra"], [2, c[2] === 1 ? "abstención" : "abstenciones"], [3, c[3] === 1 ? "ausente" : "ausentes"]]
      .filter(([i]) => c[i]).map(([i, t]) => `${c[i]} ${t}`).join(", ");
    return `<li><span>${cam}</span><em style="--pv:${VOTO_COL[POSTURA_COL[p]]}">${POSTURA_CORTA[p]}</em><small>${det}</small></li>`;
  };
  const leyes = [...VT.leyes].reverse().filter(l => conLegisladores(l, "Diputados", e) || conLegisladores(l, "Senado", e));
  dlgEsp.innerHTML = `<div class="esp-cab"><i style="background:${ESP_COLOR[e]}" aria-hidden="true"></i><div><p class="esp-eb">Espacio político</p><h3 id="esp-tit">${e}</h3></div>` +
    `<button type="button" class="boton chico esp-cerrar">Cerrar</button></div><div class="esp-cuerpo"><p class="esp-res">${resumen}</p>` +
    `<div class="esp-plat"><p class="esp-eb">Qué propuso en 2023</p><p>${plat}</p></div>` +
    `<h4 class="esp-eb">Ley por ley</h4><ol class="esp-leyes">` + leyes.map(l => `<li class="esp-ley"><div><b>${l.nombre}</b><small>${l.anio}</small></div><p>${l.que}</p>` +
      `<ul class="esp-votos">${voto(l, "Diputados")}${voto(l, "Senado")}</ul><button type="button" class="enlace esp-ver" data-k="${l.k}">Ver el voto de cada legislador</button></li>`).join("") +
    `</ol><p class="nota">Postura de la mayoría de los legisladores del espacio en la votación en general, según el acta de cada cámara. ` +
    `El espacio de cada legislador sale del bloque que registra el acta, con la clasificación propia de esta sección. La selección de leyes también es propia.</p></div>`;
  dlgEsp.showModal(); dlgEsp.scrollTop = 0;
  // como los menús: 200 ms, y sin animación si se abrió con el teclado
  if (!document.documentElement.classList.contains("teclado"))
    dlgEsp.animate(REDUCIR ? [{opacity: 0}, {opacity: 1}] : [{opacity: 0, transform: "translateY(8px) scale(.98)"}, {opacity: 1, transform: "none"}], {duration: 200, easing: "cubic-bezier(.23,1,.32,1)"});
}
document.addEventListener("click", ev => { const b = ev.target.closest(".esp-btn"); if (b) abrirEspacio(b.dataset.e); });

TX["vtm-titulo"] = $t("vtm-titulo").textContent = `Leyes clave: qué parte de cada espacio político votó a favor, ${VT.leyes[0].anio} a ${VT.leyes[VT.leyes.length - 1].anio}`;
const AP = VT.apoyo, AP_A = Object.fromEntries(AP.anios.map(x => [x.anio, x]));
MED.apoyo = "atn_hab"; MED.apAnio = AP.hasta;
$("ap-sel").innerHTML = [...AP.anios].reverse().map(x => `<option value="${x.anio}">${x.anio} (${x.presidente})</option>`).join("");
$("ap-sel").addEventListener("change", ev => { MED.apAnio = +ev.target.value; cambiarVista("apoyo"); });
TX["apoyo-titulo"] = $t("apoyo-titulo").textContent = `Apoyo al gobierno de los legisladores de cada provincia y transferencias discrecionales, ${AP.desde} a ${AP.hasta}`;
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

TX["votaciones-nota"] = $t("votaciones-nota").textContent = `Votación en general de cada ley en cada cámara, según el acta de votación nominal. Cada punto es un legislador: pasá el cursor o tocá un punto para ver quién es. Leyes de efecto directo: las que cambian, o proponían cambiar, algo que llega a la vida diaria de muchas personas o de muchos hogares, como los ingresos, las jubilaciones, los impuestos que pagan los asalariados, los derechos civiles, la salud o el trabajo. Es una selección propia y revisable, que incluye los proyectos que no se aprobaron. ` +
    `Ausente incluye a quien estaba en la sesión pero no votó. Quien preside la sesión solo vota si hay empate y no figura en el acta. ` +
    `El espacio de cada legislador sale del bloque que registra el acta, con la misma clasificación que la composición del Congreso, pero el PRO y la UCR siempre van por separado. ` +
    `La selección de leyes es propia: leyes muy debatidas o con efectos amplios, de todos los gobiernos desde ${R.votaciones.leyes[0].anio}. ` +
    `El Senado no publica el acta nominal de ${listaY(R.votaciones.leyes.filter(l => !l.camaras.Senado).map(l => `${l.nombre.charAt(0).toLowerCase() + l.nombre.slice(1)} de ${l.anio}`))}. ` +
    `Las actas salen de la copia de los sitios oficiales que mantiene el proyecto abierto ¿Cómo Votó?, de Rodrigo Quiroga, con ${n0(R.votaciones.n_dip)} votaciones de Diputados desde ${R.votaciones.dip_desde} y ${n0(R.votaciones.n_sen)} del Senado desde ${R.votaciones.sen_desde}, hasta el ${fechaLarga(R.votaciones.ult)}. ` +
    `Se cotejaron con los datos abiertos de la Cámara de Diputados (todas las actas de 2011 a 2019) y con el sitio del Senado (todas las de estas leyes y una muestra), sin diferencias.`;
/* ---------- cómo votaron el presupuesto los legisladores de fuera del bloque oficialista (etapa 28) ----------
   Votación en general de cada presupuesto en cada cámara (datos/manual/presupuestos.csv). Las barras reparten a todos los legisladores de fuera
   del bloque oficialista entre a favor, en contra, abstención y ausente: las ausencias cuentan */
const PV = R.presupuesto, PV_K = ["fuera_a_favor", "fuera_en_contra", "fuera_abstencion", "fuera_ausente"];
const PV_CLAVES = [1, 2, 3, 4].map((v, i) => ({k: PV_K[i], lab: VOTO_LAB[v], c: VOTO_COL[v], texto: v >= 3 ? css("--ink") : null}));
if ($("pv-ley")) $("pv-ley").innerHTML = PV_CLAVES.map(k => `<span><i style="background:${k.c}"></i>${k.lab}</span>`).join("");
MED.presupuesto = "Diputados";
// años seguidos como un tramo: "1998 a 2000, 2003, 2004 y 2007"
const tramosAnios = xs => lista(xs.reduce((acc, a) => { const u = acc[acc.length - 1]; if (u && a === u[1] + 1) u[1] = a; else acc.push([a, a]); return acc; }, [])
  .flatMap(([a, b]) => b - a >= 2 ? [`${a} a ${b}`] : b > a ? [String(a), String(b)] : [String(a)]));
function textoPresupuesto(cam) {
  const r = PV[cam === "Diputados" ? "dip" : "sen"];
  let t = `${cam === "Diputados" ? "En Diputados" : "En el Senado"}, en la votación en general de los ${r.n} presupuestos con acta entre ${r.desde} y ${r.hasta}, ` +
    `la parte de los legisladores de fuera del bloque oficialista que votó a favor fue de ${pct(r.min.v)} a ${pct(r.max.v)}. ` +
    `La más alta fue la del presupuesto ${r.max.anio}, con el gobierno de ${r.max.pres}, y la más baja, la del presupuesto ${r.min.anio}, con el gobierno de ${r.min.pres}.`;
  r.rechazados.forEach(x => { t += ` El presupuesto ${x.anio} fue rechazado el ${fechaLarga(x.fecha)}, con ${x.si} votos a favor y ${x.no} en contra.`; });
  t += ` En el del ${r.ult.anio}, votado el ${fechaLarga(r.ult.fecha)}, votó a favor el ${pct(r.ult.v)} de los legisladores de fuera del bloque oficialista.`;
  // los años sin votación en general en las actas, desde los datos
  const con = new Set(T.presupuesto_votos.filter(d => d.camara === cam).map(d => d.ejercicio));
  const faltan = d3.range(r.desde, r.hasta + 1).filter(a => !con.has(a));
  return t + (faltan.length ? ` No figuran los presupuestos ${tramosAnios(faltan)}, que no tienen una votación en general en las actas de la fuente.` : "");
}
TX["presupuesto"] = $t("presupuesto").textContent = textoPresupuesto("Diputados");
DIB.presupuesto = a => {
  const cam = MED.presupuesto, el = G("presupuesto"); if (!el) return;
  const data = T.presupuesto_votos.filter(d => d.camara === cam).map(d => ({...d, codigo_indec: String(d.ejercicio), territorio: `${d.ejercicio}, ${d.presidente}`}));
  apiladasH(el, {anim: a, data, claves: PV_CLAVES, sinProv: true, izq: angosto => angosto ? 150 : 214, recortar: true,
    tipExtra: d => `<br>Votado el ${fechaLarga(d.fecha)}<br>Resultado: ${d.a_favor} a favor y ${d.en_contra} en contra${d.aprobado ? "" : ", rechazado"}` +
      `<br>Bloque oficialista: ${d.bloque_oficialista}<br>De fuera: ${d.fuera} legisladores`});
  $t("presupuesto").textContent = textoPresupuesto(cam);
};

/* voto de los legisladores y voto de su provincia al presidente */
const RV = R.votaciones.representacion.filter(g => g.r != null);
const rvClave = g => g.presidente + "|" + g.eleccion;
const rvNombre = g => `${g.presidente}, ${g.anios[0] === g.anios[1] ? g.anios[0] : g.anios[0] + " a " + g.anios[1]} (elección ${g.eleccion})`;
const rvSel = $("vprov-sel");
rvSel.innerHTML = RV.map(g => `<option value="${rvClave(g)}">${rvNombre(g)}</option>`).join("");
MED.vprov = rvClave(RV[RV.length - 1]); rvSel.value = MED.vprov;
const rvFuerza = r => Math.abs(r) < .2 ? "casi nula" : Math.abs(r) < .4 ? "débil" : Math.abs(r) < .6 ? "moderada" : "fuerte";
TX["vprov-titulo"] = $t("vprov-titulo").textContent = `Voto de los legisladores en las leyes clave y voto de su provincia al presidente, ${RV[0].anios[0]} a ${RV[RV.length - 1].anios[1]}`;
TX["vprov"] = $t("vprov").textContent = 
  `En las leyes clave de cada gobierno, la correlación de Spearman entre el voto al presidente en la primera vuelta y la coincidencia de los legisladores de cada provincia con el bloque oficialista fue ` +
  RV.map(g => `${n2(g.r).replace("-", "menos ")} con ${g.presidente} (${g.leyes} ${g.leyes === 1 ? "ley" : "leyes"} entre ${g.anios[0]} y ${g.anios[1]}, ${rvFuerza(g.r)})`).join(", ") + ".";
DIB.vprov = a => {
  const g = RV.find(x => rvClave(x) === MED.vprov);
  dispersion(G("vprov"), {anim: a, data: T.voto_legisladores_y_provincia.filter(d => d.presidente === g.presidente && d.eleccion === g.eleccion),
    x: "pct_presidente", y: "pct_coincide", xLab: `Votos de ${g.presidente} en la primera vuelta de ${g.eleccion}`, yLab: "Votos de sus legisladores que coincidieron con el oficialismo"});
};
TX["vprov-nota"] = $t("vprov-nota").textContent = `Cada punto es una provincia. El eje horizontal es el porcentaje de votos positivos que sacó el presidente en esa provincia en la primera vuelta de la elección que lo llevó al gobierno. ` +
  `El vertical, el porcentaje de los votos de sus diputados y senadores presentes que coincidió con la posición del bloque oficialista en las leyes clave de ese gobierno, contando también a los del propio bloque oficialista. ` +
  `Los legisladores fueron elegidos en distintos años, no solo en esa elección, y con pocas leyes por gobierno el resultado es frágil. La correlación de Spearman compara el orden de las provincias en las dos medidas: no prueba que un voto explique el otro.`;
TX["vtm-nota"] = $t("vtm-nota").textContent = `Cada celda muestra el porcentaje de los legisladores presentes de ese espacio que votó a favor en la votación en general: verde es a favor y rojo, en contra. ` +
    `"aus." indica que la mayoría del espacio no estuvo en la votación y el punto, que el espacio no tenía legisladores en esa cámara o tenía menos de tres. ` +
    `En la comparación entre espacios, un espacio toma posición en una ley cuando más de la mitad de sus presentes votó lo mismo. Espacios con legisladores en al menos tres de estas votaciones. ` +
    `La última fila enlaza la plataforma electoral nacional que cada alianza presentó ante la Justicia Nacional Electoral para las elecciones de 2023, publicada por la Cámara Nacional Electoral: lo que cada espacio propuso, junto a lo que votó. ` +
    `La UCR y el PRO la presentaron juntos, dentro de Juntos por el Cambio. Las fuerzas provinciales y las otras fuerzas no tienen una plataforma nacional única. ` +
    `Leyes de efecto directo: las que cambian, o proponían cambiar, algo que llega a la vida diaria de muchas personas o de muchos hogares, como los ingresos, las jubilaciones, los impuestos que pagan los asalariados, los derechos civiles, la salud o el trabajo. Es una selección propia y revisable, que incluye los proyectos que no se aprobaron.`;
TX["apoyo-nota"] = $t("apoyo-nota").textContent = `En cada votación dividida, aquella en la que al menos una cuarta parte de los presentes votó distinto que el bloque oficialista, se mira si cada diputado y senador de otro bloque votó igual que él. ` +
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
  if (cfg.anim) pt.attr("r", 0).transition().delay(escalon).duration(DUR_G).attr("r", 5.5);
  pt.on("pointerenter", (ev, d) => mostrarTip(el, `<b>${d.territorio}</b><br>${cfg.xLab}: ${vx(d[cfg.x])}<br>${cfg.yLab}: ${vy(d[cfg.y])}`, 46 + x(d[cfg.x]), 34 + y(d[cfg.y])))
    .on("pointerleave", ocultarTip);
}
const fuerza = r => Math.abs(r) >= .7 ? "fuerte" : Math.abs(r) >= .4 ? "moderada" : "débil";
const AN = R.ado_nse, MC = R.mi_causas;
$("adonse-sel").innerHTML = AN.indicadores.map(i => `<option value="${i.k}">${i.lab}</option>`).join("");
MED.adonse = AN.indicadores[0].k;
$("adonse-sel").addEventListener("change", ev => { MED.adonse = ev.target.value; cambiarVista("adonse"); });
DIB.adonse = a => {
  const i = AN.indicadores.find(x => x.k === MED.adonse), otros = AN.indicadores.filter(x => x !== i);
  const rel = x => `${fuerza(x.r)}${x.r < 0 ? " e inversa" : ""}`;
  document.querySelector('[data-t="adonse"]').textContent = `Las provincias con más nacimientos de madres menores de 20 años suelen ser también las de peores indicadores socioeconómicos. ` +
    `Con ${i.lab.toLowerCase()} la relación es ${rel(i)} (correlación de ${n2(i.r)}): donde ese indicador es más alto, la proporción de madres adolescentes tiende a ser ${i.r > 0 ? "más alta" : "más baja"}. ` +
    `Con los otros indicadores del Censo, la relación es ${listaY(otros.map(o => `${rel(o)} con ${o.lab.toLowerCase()} (${n2(o.r)})`))}.`;
  dispersion(G("adonse"), {anim: a, data: T.madres_adolescentes_nse, x: i.k, y: ADO_ULT, xLab: `${i.lab}, 2022`, yLab: `Nacimientos de madres menores de 20, ${AN.anio}`});
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
const trOpciones = sel => { $(sel).innerHTML = [`<option value="serie">Total del país por año</option>`, `<option value="acum">Por provincia, suma de ${TRR.desde} a ${TRR.ult}</option>`,
  ...d3.range(TRR.ult, TRR.desde - 1, -1).map(a => `<option value="${a}">Por provincia, ${a}</option>`)].join(""); };
trOpciones("atn-sel"); trOpciones("tr-sel");
MED.atn = "serie"; MED.transferencias = String(TRR.ult);
["atn", "tr"].forEach(id => $(`${id}-sel`).addEventListener("change", ev => {
  const g = id === "atn" ? "atn" : "transferencias"; MED[g] = ev.target.value; cambiarVista(g); }));
TX["atn-titulo"] = $t("atn-titulo").textContent = `Aportes del Tesoro Nacional (ATN) a las provincias, ${TRR.desde} a ${TRR.ult}`;
TX["transferencias-titulo"] = $t("transferencias-titulo").textContent = `Transferencias no automáticas de la Nación a las provincias, ${TRR.desde} a ${TRR.ult}`;
TX["atn-nota"] = $t("atn-nota").textContent = `Pesos de ${TRR.ult}, ajustados por el deflactor del PBI. La tabla por provincia está en millones de pesos y el total por año, en miles de millones. Crédito devengado del presupuesto nacional, con la provincia de destino. Incluye los ATN a provincias y municipios. ` +
  `Los ATN salen del Fondo de Aportes del Tesoro Nacional, que se forma con parte de la coparticipación y que el gobierno nacional reparte sin fórmula. Desde 2017 el presupuesto los identifica como actividad propia. ` +
  `Entre 2002 y 2016 se toman los del programa de asistencia financiera a provincias del Ministerio del Interior financiados con ese fondo. Antes de 2000 casi todos figuran sin provincia, por eso la serie empieza ese año. ` +
  `Por habitante con las proyecciones de población del INDEC de cada año. La suma del período es la suma de lo recibido por habitante en cada año.`;
TX["transferencias-nota"] = $t("transferencias-nota").textContent = `Pesos de ${TRR.ult}, ajustados por el deflactor del PBI. La tabla por provincia está en millones de pesos y el total por año, en miles de millones. Crédito devengado del presupuesto nacional en transferencias corrientes y de capital a gobiernos provinciales y municipales, con la provincia de destino. ` +
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
  const r = g.append("g").attr("clip-path", recorte(C.svg, 0, 0, iw, 38, RADIO_BARRA)).selectAll("rect").data(P).join("rect").attr("x", d => x(new Date(d.inicio))).attr("y", 0).attr("height", 38)
    .attr("width", d => Math.max(1.5, x(fin(d)) - x(new Date(d.inicio)) - 1)).attr("fill", d => ORIGEN_COLOR[d.origen]);
  g.selectAll("text.n").data(P.filter(d => x(fin(d)) - x(new Date(d.inicio)) > (angosto ? 44 : 60))).join("text").attr("class","n")
    .attr("x", d => x(new Date(d.inicio)) + 5).attr("y", 23).attr("font-size", 12).attr("fill", d => ORIGEN_TEXTO[d.origen]).text(d => apellido(d.nombre));
  g.append("g").attr("class","eje").attr("transform","translate(0,42)").call(d3.axisBottom(x).ticks(angosto ? 4 : 8).tickSize(0).tickPadding(8)).call(s => s.select(".domain").remove());
  if (a) r.attr("opacity", 0).transition().delay(escalon).duration(DUR_G).attr("opacity", 1);
  r.on("pointerenter", (ev, d) => mostrarTip(el, `<b>${d.nombre}</b><br>${d.inicio.slice(0, 4)} a ${d.fin ? d.fin.slice(0, 4) : "hoy"}<br>Nació en ${d.lugar_nacimiento}, ${d.provincia}`,
      4 + x(new Date(d.inicio)) + (x(fin(d)) - x(new Date(d.inicio))) / 2, 8)).on("pointerleave", ocultarTip);
  document.getElementById("pr-lista").innerHTML = P.map(d => `<li><i style="background:${ORIGEN_COLOR[d.origen]}"></i>${bandera(COD_PROV[d.provincia])}<span>${d.nombre}${d.interino ? " (interino)" : ""}, ${d.inicio.slice(0, 4)} a ${d.fin ? d.fin.slice(0, 4) : "hoy"}</span>` +
    `<small>${d.lugar_nacimiento === d.provincia || d.provincia.startsWith("Ciudad") ? d.provincia.replace("Ciudad Autónoma de Buenos Aires", "Ciudad de Buenos Aires") : `${d.lugar_nacimiento}, ${d.provincia}`}</small></li>`).join("");
};
MED.ministros = "gobierno";
TX["ministros-titulo"] = $t("ministros-titulo").textContent = `Ministros nacionales según lugar de nacimiento, 1983 a ${new Date().getFullYear()}`;
DIB.ministros = a => {
  document.querySelector('[data-t="ministros"]').textContent = `De las ${GBR.personas} personas que fueron ministros o jefes de gabinete desde 1983, se conoce el lugar de nacimiento de ${GBR.con_dato}. ` +
    `El ${pct(GBR.pct_amba)} nació en el AMBA, que tiene el ${pct(PRR.amba_pob)} de la población, y ${GBR.caba} en la Ciudad de Buenos Aires. ` +
    (GBR.max_gob.length > 1 ? `Los gabinetes con más nacidos en el AMBA fueron los de ${listaY(GBR.max_gob.map(apellido))} (${pct(GBR.max_gob_v)} cada uno)` : `El gabinete con más nacidos en el AMBA fue el de ${apellido(GBR.max_gob[0])} (${pct(GBR.max_gob_v)})`) + ` y el que menos, el de ${apellido(GBR.min_gob)} (${pct(GBR.min_gob_v)}). ` +
    (GBR.sin_ministro.length ? `Ninguna de esas personas nació en ${listaY(GBR.sin_ministro).replace(/ y ([^y]+)$/, " ni $1")}.` : "");
  const ley = document.getElementById("mi-ley");
  if (MED.ministros === "gobierno") {
    const ks = Object.keys(ORIGEN_COLOR).filter(k => T.gabinetes_origen.some(d => d[k] > 0));
    ley.innerHTML = leyOrigen(ks); ley.hidden = false;
    const INTERINOS = T.presidentes.filter(p => p.interino && p.inicio.startsWith("2001"));
    const presi = n => T.presidentes.find(p => p.nombre === n);
    apiladasH(G("ministros"), {anim: a, claves: ks.map(k => ({k, lab: k, c: ORIGEN_COLOR[k], texto: ORIGEN_TEXTO[k]})),
      data: T.gabinetes_origen.map(d => ({...d, codigo_indec: d.gobierno, territorio: apellido(d.gobierno)})),
      bandera: d => d.gobierno === "Interinos de 2001" ? INTERINOS.length : COD_PROV[presi(d.gobierno)?.provincia],
      tipExtra: d => d.gobierno === "Interinos de 2001"
        ? "<br>" + INTERINOS.map(p => `${bandera(COD_PROV[p.provincia])} ${apellido(p.nombre)}, nacido en ${p.provincia.replace("Ciudad Autónoma de Buenos Aires", "la Ciudad de Buenos Aires")}`).join("<br>")
        : (p => p ? `<br>${bandera(COD_PROV[p.provincia])} Nacido en ${p.provincia.replace("Ciudad Autónoma de Buenos Aires", "la Ciudad de Buenos Aires")}` : "")(presi(d.gobierno))});
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
/* Cambio de vista de un gráfico (botones OCDE, selectores y conmutadores de cada ficha): no se repite la animación de entrada.
   El gráfico se redibuja quieto y la versión nueva funde sobre la anterior (200 ms), con una transición de vista del navegador.
   Donde no hay soporte, o con movimiento reducido, cambia de una vez. La transición de valores llega en la etapa 6. */
const VT_TIPOS = typeof ViewTransition !== "undefined" && "types" in ViewTransition.prototype;
function cambiarVista(g, dibujar = () => DIB[g](false)) {
  const el = G(g);
  if (!el || REDUCIR || !VT_TIPOS || document.hidden) return dibujar();
  el.style.viewTransitionName = "grafico";
  const t = document.startViewTransition({update: dibujar, types: ["grafico"]});
  // si otra vista empieza antes de que termine esta (dos toques seguidos), el navegador la saltea: no es un error
  t.ready.catch(() => {});
  t.finished.finally(() => { el.style.viewTransitionName = ""; });
}
/* Al cambiar de provincia (etapa 6), según qué cambia en cada lugar:
   - solo el resaltado: el color pasa de una provincia a la otra en 200 ms (resaltar() de cada gráfico, sin redibujar);
   - los valores: la pirámide de población y los puntos del perfil provincial viajan de unos a otros en 300 ms;
   - lo demás que está en pantalla (gráficos cuyos datos o rótulos cambian, "En cifras", provincias parecidas) funde sobre
     lo anterior en 200 ms, con una transición de vista en la que la página queda quieta. Cada pieza lleva un nombre propio.
   Lo que está fuera de la pantalla se redibuja de una vez. Con movimiento reducido quedan solo los cambios de color. */
const SE_MUEVEN = new Set(["piramide"]);
const enPantalla = el => { const r = el.getBoundingClientRect(); return r.height > 0 && r.bottom > 0 && r.top < innerHeight; };
function repintarProv() {
  const vistos = Object.keys(DIB).map(k => [k, G(k)]).filter(([, el]) => el && el.closest(".visto"));
  vistos.forEach(([, el]) => el.resaltar?.());
  const redibujan = vistos.filter(([, el]) => !el.resaltar);
  const cambiar = () => { redibujan.forEach(([k]) => DIB[k](false)); pintarPanel(true); tablaAreas(); alCambiarProv.forEach(f => f()); };
  if (REDUCIR || !VT_TIPOS || document.hidden) return cambiar();
  // "En cifras" se arma de nuevo: su lugar se busca antes y después del cambio
  const lugares = [...redibujan.filter(([k]) => !SE_MUEVEN.has(k)).map(([, el]) => () => el),
    () => document.querySelector(".en-cifras"), () => document.getElementById("prov-extra")];
  const nombrar = () => lugares.forEach((l, i) => { const el = l(); if (el && enPantalla(el)) el.style.viewTransitionName = `cambio-${i}`; });
  nombrar();
  const t = document.startViewTransition({update: () => { cambiar(); nombrar(); }, types: ["provincia"]});
  t.ready.catch(() => {});
  t.finished.finally(() => lugares.forEach(l => { const el = l(); if (el) el.style.viewTransitionName = ""; }));
}
// Solo se redibujan los gráficos de tarjetas que ya entraron en pantalla: el resto se dibuja al llegar
function dibujarTodo() { Object.keys(DIB).forEach(k => { const el = G(k); if (el && el.closest(".visto")) DIB[k](false); }); }

$("ar-sel").addEventListener("change", ev => { MED.arArea = ev.target.value; cambiarVista("areas-hidro"); });
document.querySelectorAll(".selector-ficha select[data-g]").forEach(sel => sel.addEventListener("change", () => {
  MED[sel.dataset.g] = sel.value; cambiarVista(sel.dataset.g);
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
  "f-hipotecas": ["hipotecas", "Créditos nuevos", ["credito_hogares"]],
  "f-centrales": ["centrales", "Centrales y potencia", ["eolica_solar"]],
};
const OCDE_BOTON = {fecundidad: "Hijos por mujer", fecundidad_adolescente: "Fecundidad adolescente", gasto_salud: "Gasto en salud",
  secundaria: "Terminan el ciclo básico", suicidio: "Tasa estimada por la OMS", homicidios: "Homicidios", viales: "Siniestros viales",
  empleo: "Tasa de empleo", desocupacion: "Desocupación", pobreza_relativa: "Pobreza relativa", gini: "Gini", internet: "Uso de internet",
  electricidad: "Electricidad por habitante", co2: "CO₂ por habitante", turistas: "Turistas por habitante", pesca: "Pesca por habitante", credito_hogares: "Crédito a los hogares", eolica_solar: "Eólica y solar en la generación"};
const OCDE_Y0 = {esperanza_vida: 65, secundaria: 60, empleo: 40, internet: 0};
const OCDE_NOTA = {
  pobreza_relativa: "Es una medida de pobreza relativa, la que usa la OCDE, distinta de la pobreza por canastas del INDEC. En la Argentina el Banco Mundial la calcula con la EPH, que cubre solo los aglomerados urbanos.",
  gini: "En la Argentina el Banco Mundial lo calcula con la EPH, que cubre solo los aglomerados urbanos.",
  turistas: "Llegadas de turistas internacionales dividido por la población de cada país. El Banco Mundial no publica esta serie después de 2019.",
  internet: "Personas que usaron internet en los últimos tres meses, desde cualquier dispositivo.",
  pesca: "Toneladas de pesca de captura, marítima y continental, dividido por la población de cada país.",
  suicidio: "Estimaciones de la OMS ajustadas por edad, distintas de los registros del SNIC y de la DEIS que usa esta sección.",
  eolica_solar: "Participación de la energía eólica y la solar en la electricidad generada en el año, no en la potencia instalada que muestra el resto de la ficha. " +
    "Ember arma sus cifras con fuentes de cada país y pueden diferir de las de CAMMESA.",
  credito_hogares: `Préstamos de todos los sectores a las familias y a las instituciones sin fines de lucro que las sirven, como porcentaje del producto interno bruto, al cierre de cada año: ` +
    `incluye los créditos hipotecarios, los personales y los de tarjetas. El Banco de Pagos Internacionales publica este dato para ${OC.credito_hogares.n} de los 38 miembros de la OCDE, y el promedio es el de esos países.`,
  protegida: "Mide la superficie terrestre dentro de áreas protegidas sin contar dos veces las superposiciones, por eso difiere de la cifra nacional de esta ficha.",
};
const fOC = k => loc.format(`,.${OC[k].dec}f`);
// un dato de la OCDE con más de tres años lleva una marca visible (en el botón y arriba de la nota)
const ANIO_DATOS = +R.actualizado.slice(-4), ocdeViejo = k => OC[k].anio < ANIO_DATOS - 3;
// "de la División de Población...", "del Grupo Interinstitucional...": el organismo que estima cada serie, con su artículo
const deOrganismo = t => (/^(Grupo|Banco|Programa|Fondo|Sistema|Instituto)\b/.test(t) ? "del " : /^(ONU|Ember)\b/.test(t) ? "de " : "de la ") + t;
const conUnidad = (k, v) => OC[k].unidad.startsWith("%") ? fOC(k)(v) + OC[k].unidad : `${fOC(k)(v)} ${OC[k].unidad}`;
function textoOCDE(k) {
  const o = OC[k], f = fOC(k);
  const med = Math.abs(o.ocde - o.mediana) > Math.abs(o.mediana) * .25
    ? ` La mediana fue ${f(o.mediana)}: unos pocos países con valores extremos mueven el promedio.` : "";
  const alto = o.mas_alto === 0 ? `Ninguno de esos ${o.n} países tenía un valor más alto que la Argentina.`
    : o.mas_alto === o.n ? `Los ${o.n} países tenían un valor más alto que la Argentina.`
    : `${o.mas_alto} de esos ${o.n} países tenían un valor más alto que la Argentina.`;
  return `Según la estimación ${deOrganismo(o.origen)} para ${o.anio}, ${o.frase} fue de ${conUnidad(k, o.arg)} en la Argentina y de ${f(o.ocde)} en el promedio simple de los ${o.n} países de la OCDE con dato.${med} ${alto} En ${o.ini} los valores eran ${f(o.arg_ini)} y ${f(o.ocde_ini)}.` +
    (ocdeViejo(k) ? ` Es el último año que publica el Banco Mundial para esta comparación.` : "");
}
/* Notas metodológicas: van en "Sobre los datos", un ícono de información en el pie de la ficha que abre un cuadro con ellas.
   La fuente sigue a la vista en el pie. Quedan a la vista las notas de las herramientas (advertencias estadísticas)
   y las de suicidio (el SNIC es un registro policial). */
const NOTA_A_LA_VISTA = new Set(["f-muertes", "f-suicidio", "f-suicidio-prov", "f-edad"]);
const ICONO_INFO = `<svg class="ico" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="8.2"/><path d="M10 9v5M10 6.2v.1"/></svg>`;
document.querySelectorAll(".tema:not(.herramienta) > article.ficha").forEach(f => {
  const notas = f.querySelectorAll(":scope > .nota");
  if (!notas.length || NOTA_A_LA_VISTA.has(f.id)) return;
  const d = document.createElement("details"); d.className = "sobre";
  d.innerHTML = `<summary>${ICONO_INFO}<span>Sobre los datos</span></summary><div class="sobre-panel"></div>`;
  d.lastElementChild.append(...notas);
  f.querySelector(".pie").prepend(d);
  // el cuadro se abre arriba del pie, desde el ícono
  d.addEventListener("toggle", () => {
    if (!d.open) return;
    const pie = d.closest(".pie");
    d.lastElementChild.style.bottom = `${f.getBoundingClientRect().bottom - pie.getBoundingClientRect().top + 8}px`;
    document.querySelectorAll(".sobre[open]").forEach(o => { if (o !== d) o.open = false; });
  });
});
// se cierra con Escape o tocando afuera
document.addEventListener("keydown", ev => {
  const d = ev.key === "Escape" && document.querySelector(".sobre[open]");
  if (d) { d.open = false; d.querySelector("summary").focus(); }
});
document.addEventListener("pointerdown", ev => document.querySelectorAll(".sobre[open]").forEach(d => { if (!d.contains(ev.target)) d.open = false; }));

const VISTA = {};
Object.entries(OCDE_VISTA).forEach(([id, [g, propio, ks]]) => {
  const art = document.getElementById(id), graf = G(g); if (!art || !graf) return;
  VISTA[g] = null;
  // la línea que explica los colores (etapa 16) queda entre los botones y el gráfico
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
    if (!T.ocde_comparacion) { d3.csv("datos/ocde_comparacion.csv", d3.autoType).then(f => { T.ocde_comparacion = f; DIB[g](a); }); return; }
    const o = OC[k];
    if (lead) { if (lead.dataset.propio == null) lead.dataset.propio = lead.textContent; lead.textContent = textoOCDE(k); }
    propios.forEach(e => e.style.display = "none"); nota.hidden = false;
    nota.innerHTML = (ocdeViejo(k) ? `<strong class="ocde-aviso">Dato de ${o.anio}: tiene más de tres años.</strong> ` : "") + `Unidad: ${o.unidad}. ${OCDE_NOTA[k] ? OCDE_NOTA[k] + " " : ""}La línea <span class="ocde-marca">OCDE</span> es el promedio simple de los países miembros con dato ese año y la franja violeta clara va del percentil 25 al 75: ahí está la mitad de los países. ` +
      `Fuente: ${o.fuente || `Banco Mundial, Indicadores del Desarrollo Mundial (serie ${o.serie}), con datos de ${o.origen}`}. Son estimaciones armonizadas para comparar países y pueden diferir de las cifras nacionales de esta ficha. <a href="datos/ocde_comparacion.csv" download>Descargar la comparación (CSV)</a>`;
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
    history.replaceState(history.state, "", u);
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
    // lo que quedó fuera del cálculo (etapa 16): cada jurisdicción con su cruz, y "Volver a sumar todas" solo si hay alguna afuera
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
  // al volver a sumar todas, el botón desaparece: el foco pasa a "Sin CABA"
  document.getElementById("cx-reponer").addEventListener("click", () => { st.fuera.clear(); todo(true); document.getElementById("cx-caba").focus({preventScroll: true}); });
  // la cruz de cada jurisdicción la vuelve a sumar, y el foco pasa a la que quedó en su lugar (o a "Sin CABA" si no queda ninguna)
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
    svg.attr("aria-label", `Diagrama de dispersión de ${X.nombre} ${yE(Y.nombre)} por provincia`);
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
      if (!Object.keys(previo).length) circ.attr("r", 0).transition().delay(escalon).duration(DUR_G).ease(EASE).attr("r", d => r(d.poblacion));
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
    if (X.periodo !== Y.periodo) t += `Los datos no son del mismo período: ${X.nombre} es de ${X.periodo} ${yE(Y.nombre)}, de ${Y.periodo}. `;
    lect.textContent = t.trim();
    if (st.anio != null && SER && conSerie()) t += ` Mostrando ${st.anio}: los valores son anuales y pueden diferir del último dato, que en algunos indicadores es un promedio de varios años.`;
    lect.textContent = t.trim();
    const conRes = datos.map((f, i) => ({f, e: m.res[i]})).sort((a, b) => b.e - a.e);
    const item = o => `<li><b>${o.f.territorio}</b> ${fm(st.y)(o.f[st.y])}</li>`;
    resid.innerHTML = `<div><h4>Más arriba de lo que marca la recta</h4><ol>${conRes.slice(0, 3).map(item).join("")}</ol></div>` +
      `<div><h4>Más abajo de lo que marca la recta</h4><ol>${conRes.slice(-3).reverse().map(item).join("")}</ol></div>`;
    // tabla del par
    document.getElementById("cx-tabla").innerHTML = `<thead><tr><th>Jurisdicción</th><th>Región</th><th class="n">${X.nombre}</th><th class="n">${Y.nombre}</th></tr></thead><tbody>` +
      [...FILAS].sort((a, b) => a.territorio.localeCompare(b.territorio, "es")).map(f => `<tr${f.codigo_indec === prov ? ' class="elegida"' : ""}><td>${conBandera(f.codigo_indec, f.territorio + (st.fuera.has(f.codigo_indec) ? " (fuera del cálculo)" : ""))}</td><td>${f.region}</td>` +
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
      .attr("aria-label", d => `${META[d.a].nombre} ${yE(META[d.b].nombre)}: r ${fr(d.r)}`);
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
    if (anim && !REDUCIR) { tramo.attr("x1", x(0)).attr("x2", x(0)).transition().duration(DUR_G).ease(EASE).attr("x1", r => x(r.lo)).attr("x2", r => x(r.hi)); pto.attr("cx", x(0)).transition().duration(DUR_G).ease(EASE).attr("cx", r => x(r.b)); }
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
  if (!sel) return;
  sel.innerHTML = Object.entries(META).map(([k, m]) => `<option value="${k}">${m.nombre}</option>`).join("");
  // cerca: la provincia que se acercó en este mapa y la del sitio en ese momento (si la del sitio cambia, el mapa vuelve a seguirla)
  let ind = "homicidios", topo = null, filas = null, cargando = null, cerca = null;
  sel.addEventListener("change", () => { ind = sel.value; cambiarVista("mapa-dep"); });
  document.getElementById("mp-pais").addEventListener("click", () => { cerca = {c: "", de: prov}; cambiarVista("mapa-dep"); });
  const cargar = () => cargando || (cargando = Promise.all([d3.json("datos/departamentos.topo.json"), d3.csv("datos/departamentos.csv", d3.autoType)])
    .then(([t, f]) => { topo = t; filas = Object.fromEntries(f.map(r => [String(r.id).padStart(5, "0"), r])); }));
  const MIN_POB = 10000, MIN_HOG = 3000;  // las listas del censo se cortan por hogares, las demás por personas identificadas
  function dibujar(anim) {
    const el = G("mapa-dep"); if (!el || !el.offsetParent) return;
    if (!topo) { cargar().then(() => dibujar(anim)); return; }
    const m = META[ind], censo = m.fuente.startsWith("INDEC"), obj = topo.objects.departamentos, todos = topojson.feature(topo, obj).features;
    const pv = cerca && cerca.de === prov ? cerca.c : prov;  // tocar una provincia la acerca sin elegirla en todo el sitio
    const enProv = NOMBRES[pv] ? todos.filter(f => f.properties.prov === pv) : todos;
    el.innerHTML = "";
    const w = Math.min(560, el.clientWidth), h = NOMBRES[pv] ? Math.round(w * 1.1) : Math.round(w * 1.55);
    const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${w} ${h + 44}`).attr("role", "img").attr("aria-label", `Mapa de ${m.nombre} por departamento`);
    const proy = d3.geoMercator().fitExtent([[6, 6], [w - 6, h - 6]], {type: "FeatureCollection", features: enProv}), camino = d3.geoPath(proy);
    const vals = todos.map(f => filas[f.properties.id]?.[ind]).filter(v => v != null);
    const cortes = d3.quantile(vals.sort(d3.ascending), .2) != null ? [.2, .4, .6, .8].map(q => d3.quantile(vals, q)) : [];
    const colores = ["#EEF5FC", "#BBD6EF", "#7FB0DD", "#3F86C6", "#1F5E97"];
    const escala = d3.scaleThreshold().domain(cortes).range(colores);
    const deps = svg.append("g").selectAll("path").data(enProv).join("path").attr("class", "dep").attr("d", camino)
      .attr("fill", f => { const v = filas[f.properties.id]?.[ind]; return v == null ? "#E4E9EF" : escala(v); });
    if (anim && !REDUCIR) deps.attr("opacity", 0).transition().delay(escalon).duration(DUR_G).attr("opacity", 1);
    const geoms = NOMBRES[pv] ? {type: "GeometryCollection", geometries: obj.geometries.filter(g => g.properties.prov === pv)} : obj;
    svg.append("path").attr("class", "limite").attr("d", camino(topojson.mesh(topo, geoms, (a, b) => a.properties.prov !== b.properties.prov || a === b)));
    const f1 = d3.format(",.1f"), fv = v => v == null ? "sin dato" : loc.format(",.1f")(v);
    deps.on("pointermove", (ev, f) => {
      const r = filas[f.properties.id] || {}, [mx, my] = d3.pointer(ev, el);
      mostrarTip(el, `<b>${f.properties.nombre}</b>, ${r.provincia || ""}<br>${m.nombre}: ${fv(r[ind])}` +
        (censo ? (r.hogares ? `<br>${n0(r.hogares)} hogares en el Censo 2022` : "") : r.poblacion_identificada ? `<br>${n0(r.poblacion_identificada)} personas identificadas` : ""), mx, my);
    }).on("pointerleave", ocultarTip)
      .on("click", (ev, f) => { if (!NOMBRES[pv]) { cerca = {c: f.properties.prov, de: prov}; ocultarTip(); cambiarVista("mapa-dep"); } });
    // leyenda de quintiles
    const ley = svg.append("g").attr("transform", `translate(${Math.max(6, w / 2 - 125)},${h + 8})`);
    colores.forEach((c, i) => ley.append("rect").attr("x", i * 50).attr("width", 48).attr("height", 10).attr("fill", c));
    ["", ...cortes.map(v => loc.format(",.1f")(v))].forEach((t, i) => ley.append("text").attr("class", "mp-ley").attr("x", i * 50).attr("y", 26).attr("text-anchor", i ? "middle" : "start").text(t));
    // lista lateral
    const lugar = NOMBRES[pv] || "Todo el país";
    document.getElementById("mp-lugar").innerHTML = conBandera(NOMBRES[pv] ? pv : "00", `${lugar}: ${m.nombre.toLowerCase()}`);
    document.getElementById("mp-pais").hidden = !NOMBRES[pv];
    const lista = enProv.map(f => ({f, r: filas[f.properties.id]})).filter(o => o.r && o.r[ind] != null && (censo ? (o.r.hogares || 0) >= MIN_HOG : (o.r.poblacion_identificada || 0) >= MIN_POB))
      .sort((a, b) => b.r[ind] - a.r[ind]);
    const item = o => `<li>${o.f.properties.nombre}${NOMBRES[pv] ? "" : ` (${o.r.provincia})`} <span>${fv(o.r[ind])}</span></li>`;
    document.getElementById("mp-lista").innerHTML = lista.length
      ? `<h4>Valores más altos</h4><ol>${lista.slice(0, 5).map(item).join("")}</ol><h4>Valores más bajos</h4><ol>${lista.slice(-5).reverse().map(item).join("")}</ol>` : "";
    document.getElementById("mp-nota").textContent = `${m.nombre}: ${m.unidad}. Fuente: ${m.fuente}. El color divide a los departamentos en cinco grupos del mismo tamaño. ` + (censo
      ? `Los porcentajes del Censo 2022 se calculan sobre todos los hogares (o todas las viviendas) de cada departamento, y el censo cuenta a cada persona en la vivienda donde vive habitualmente. ` +
        `A diferencia del RENAPER, separa las 15 comunas de la Ciudad de Buenos Aires. Las listas solo incluyen los departamentos con al menos ${n0(MIN_HOG)} hogares. Tocá una provincia en el mapa para acercarte.`
      : `En los departamentos con poca población, unos pocos casos mueven mucho una tasa, por eso las listas solo incluyen los que tienen al menos ${n0(MIN_POB)} personas identificadas y las tasas del SNIC usan el promedio de tres años. ` +
      `Los datos del SNIC son hechos registrados por las fuerzas de seguridad según el lugar donde ocurrieron. El RENAPER cuenta personas con DNI según el domicilio que declararon, que puede no ser donde viven hoy: es un registro de domicilios, no un conteo de residentes. Publica la Ciudad de Buenos Aires sin separar por comuna, así que sus 15 comunas muestran el mismo valor. Tocá una provincia en el mapa para acercarte.`);
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
  if (!caja) return {puntaje, DIMS};
  caja.innerHTML = DIMS.map(d => `<label class="ix-peso"><i style="background:${d.c}"></i><span>${d.nombre}</span><output id="ixo-${d.id}">${pesos[d.id]}</output>
    <input type="range" min="0" max="5" step="1" value="${pesos[d.id]}" data-d="${d.id}" aria-label="Peso de ${d.nombre}">
    <small>${d.ind.map(([k]) => M[k].nombre).join(", ")}</small></label>`).join("") +
    `<button type="button" class="boton chico ix-reset" id="ix-reset">Pesos iguales</button>`;
  const guardar = () => { const u = new URL(location.href); u.searchParams.set("ix", DIMS.map(d => pesos[d.id]).join(",")); history.replaceState(history.state, "", u); };
  caja.addEventListener("input", ev => {
    const i = ev.target.closest("input"); if (!i) return;
    pesos[i.dataset.d] = +i.value; document.getElementById(`ixo-${i.dataset.d}`).textContent = i.value; guardar(); dibujar(true);
  });
  document.getElementById("ix-reset").addEventListener("click", () => {
    pesos = {...iguales}; caja.querySelectorAll("input").forEach(i => { i.value = 1; document.getElementById(`ixo-${i.dataset.d}`).textContent = 1; }); guardar(); dibujar(true);
  });
  document.getElementById("ix-leyenda").innerHTML = DIMS.map(d => `<span><i style="background:${d.c}"></i>${d.nombre}</span>`).join("");
  // los años de los indicadores salen de su período en Cruces (antes "entre 2022 y 2026" escrito a mano)
  const IX_ANIOS = DIMS.flatMap(d => d.ind.flatMap(([k]) => (String(M[k]?.periodo || "").match(/\d{4}/g) || []).map(Number)));
  document.getElementById("ix-nota").textContent = "Cada indicador se lleva a una escala de 0 a 10, donde 0 es el peor valor entre las 24 jurisdicciones y 10 el mejor. Exportaciones y velocidad de internet se miden en logaritmo, para que un valor extremo no aplaste al resto. Cada dimensión es el promedio de sus indicadores y el índice es el promedio de las dimensiones según los pesos elegidos. Los indicadores son de años distintos, entre " + Math.min(...IX_ANIOS) + " y " + Math.max(...IX_ANIOS) + ", y cada barra muestra cuánto aporta cada dimensión. No es un índice oficial: es una forma de ver qué pasa con el orden según lo que cada uno valora. Los pesos elegidos quedan en el enlace para compartirlo.";

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
    if (anim && !REDUCIR) filas.transition().duration(DUR_G).ease(EASE).attr("transform", destino); else filas.attr("transform", destino);
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
    lista.slice(0, 3).map(o => `<li><button type="button" class="enlace con-bandera" data-c="${o.f.codigo_indec}">${bandera(o.f.codigo_indec)}<span>${o.f.territorio}</span></button></li>`).join("") + `</ol>` +
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
    cambiarVista(conm.dataset.dib || k);
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
  const t = document.getElementById("tabla-areas"); if (!t) return;
  t.innerHTML = `<thead><tr><th>Área</th><th>Categoría</th><th>Dónde</th><th class="n">Año</th><th class="n">Hectáreas</th></tr></thead><tbody>` +
    T.parques_nacionales_lista.map(d => `<tr${NOMBRES[prov] && d.lugar.includes(NOMBRES[prov]) ? ' class="elegida"' : ""}><td>${d.nombre}</td><td>${d.caracter}</td><td>${d.lugar}</td>` +
      `<td class="n">${d.anio}</td><td class="n">${n0(d.hectareas)}</td></tr>`).join("") + `</tbody>`;
}

/* ---------- tarjetas: etiqueta, cifra clave y acciones ---------- */
const sg = v => (v > 0 ? "+" : "") + pct(v);
// Cifra destacada de cada ficha. La sección de salud mental no lleva cifra destacada, para no dramatizar.
const CLAVE = {
  "f-petroleo": [`${n0(PG.kbd)} mil`, `barriles de petróleo por día produjo el país en ${PG.mes}${PG.record ? ", el valor más alto de la serie" : ""}`],
  "f-gas": [n1(PG.gas), `millones de metros cúbicos de gas natural por día se produjeron en ${PG.mes}`],
  "f-gas-hogares": [pct(VV.pct_gas_red), `de los hogares cocinaba con gas de red en el Censo 2022. El ${pct(VV.pct_garrafa)}, con gas en garrafa`],
  "f-hidro-provincias": [pct(PG.top_pct), `del petróleo del país salió de ${PG.top} entre ${PG.v_desde} y ${PG.v_hasta}`],
  "f-areas-hidro": [pct(PG.areas_top10_pet), `del petróleo del país salió de las diez áreas de concesión que más produjeron en ${PG.areas_anio}`],
  "f-pozos": [`${PG.veces} veces`, `más petróleo por día produjo un pozo de shale que uno convencional en ${PG.pozos_mes}`],
  "f-empresas-hidro": [pct(PG.emp_top_pct), `del petróleo del país lo produjo ${PG.emp_top} entre ${PG.v_desde} y ${PG.v_hasta}`],
  "f-empleo-hidro": [n0(CN.pet_emp), `puestos asalariados registrados en la extracción de petróleo y gas en el ${CN.emp_trim}`],
  "f-regalias": [pct(PG.reg_top_pct), `de los ingresos totales de ${PG.reg_top} fueron regalías en ${PG.reg_anio}`],
  "f-reservas": [`${n1(PG.res_hor_pet)} años`, `de producción de petróleo alcanzan las reservas comprobadas, al ritmo de ${PG.res_anio}`],
  "f-balanza-energetica": [n0(PG.bal_saldo), `millones de dólares de saldo ${PG.bal_saldo >= 0 ? "positivo" : "negativo"} tuvo el comercio exterior de energía en ${PG.bal_anio}`],
  "f-fracturas": [`${n0(PG.dv_rama_ult)} m`, `de rama horizontal tuvo en promedio un pozo de Vaca Muerta fracturado en ${PG.fr_ult}, contra ${n0(PG.dv_rama_ini)} m en ${PG.dv_ini}`],
  "f-pozos-terminados": [n0(PG.pt_total), `pozos de petróleo y gas se terminaron en ${PG.pt_anio}, contra ${n0(PG.pt_max)} en ${PG.pt_max_anio}`],
  "f-productividad": [`${n0(PG.cos_kbbl_ult)} mil`, `barriles de petróleo sacó en su primer año un pozo de shale de Vaca Muerta que empezó en ${PG.cos_ult}, ${n1(PG.cos_veces)} veces uno de ${PG.cos_ini}`],
  "f-mapa-pozos": [n0(PG.map_activos), `pozos no convencionales produjeron petróleo o gas en ${PG.map_mes}, el ${pct(PG.map_pct_nq)} en Neuquén`],
  "f-gas-consumo": [`${n0(e.gas_pais)} m³`, `de gas natural consumió en promedio un usuario residencial en ${e.gas_anio}, y ${n0(e.gas_top[0][1])} en ${e.gas_top[0][0]}`],
  "f-permisos": [`${n0(CN.per_m2 / 1000)} mil m²`, `autorizaron los permisos de edificación de ${CN.per_municipios} municipios en ${CN.per_mes}` +
    (CN.per_var != null ? `, ${pct(Math.abs(CN.per_var))} ${CN.per_var < 0 ? "menos" : "más"} que un año antes` : "")],
  "f-hipotecas": [`${n0(CN.hip_ult)} mil millones`, `de pesos en créditos hipotecarios UVA otorgaron los bancos en ${CN.hip_mes}`],
  "f-obra-publica": [`${n0(CN.op_total)} mil millones`, `de pesos invirtió la Nación en obra pública en ${CN.op_ult}. El máximo desde ${CN.op_desde} fue de ${n0(CN.op_max)} mil millones, en ${CN.op_max_anio}, en pesos del mismo valor`],
  "f-electricidad-provincias": [`${n0(e.el_pais)} kWh`, `de electricidad por habitante consumieron los hogares del país en ${e.el_ult}`],
  "f-salarios": [`${n0(SA.pais)} pesos`, `era el salario bruto promedio de los asalariados registrados del sector privado en ${SA.mes}`],
  "f-salario-docente": [`${n0(DC.pais)} pesos`, `de salario bruto cobraba en promedio un maestro de grado con 10 años de antigüedad en ${DC.trim}`],
  "f-inversion-educativa": [`${n0(IE.pais)} pesos`, `invirtió el Estado por cada alumno de las escuelas estatales en ${IE.anio}`],
  "f-delitos": [n0(SG.total_tasa), `delitos registrados cada 100.000 habitantes en ${SG.anio}`],
  "f-robos": [n0(SG.robos), `robos registrados cada 100.000 habitantes en ${SG.anio}`],
  "f-homicidios": [n1(SG.hom_tasa), `víctimas de homicidios dolosos cada 100.000 habitantes en ${SG.anio}`],
  "f-carceles": [n0(SG.sn_tasa), `personas privadas de libertad en cárceles cada 100.000 habitantes al 31 de diciembre de ${SG.sn_anio}`],
  "f-cuentas-nacion": [pct(Math.abs(GBN.primario)), `del PBI fue el ${sobra(GBN.primario)} primario del Sector Público Nacional en ${GBN.anio}, antes de pagar los intereses de la deuda`],
  "f-recaudacion": [pct(GRT.pbi), `del PBI fue la recaudación de impuestos nacionales en ${GRT.anio}`],
  "f-deuda": [pct(GBD.pct), `del PBI era la deuda bruta de la Administración Central al ${GBD.fecha}`],
  "f-empleo-publico": [n1(GBC.cada_1000), `cargos ocupados cada 1.000 habitantes tenían las administraciones provinciales en ${GBC.anio}`],
  "f-impuestos-provinciales": [`${n0(GBP.pais)} pesos`, `por habitante recaudaron de impuestos propios las provincias y la Ciudad en ${GBP.anio}`],
  "f-nacidos-otro-pais": [pct(MGC.pct), `de las personas que vivían en el país en 2022 había nacido en otro país, según el Censo`],
  "f-migracion-interna": [pct(MGC.otra_pct), `de las personas que vivían en el país en 2022 había nacido en otra provincia, según el Censo`],
  "f-migracion-historia": [pct(MGH.max_pct), `de la población había nacido en otro país en el censo de ${MGH.max_anio}, la parte más alta desde ${MGH.ini}`],
  "f-radicaciones": [n0(MGD.total), `residencias otorgó la Dirección Nacional de Migraciones en ${MGD.anio}`],
  "f-argentinos-exterior": [n0(MGO.personas), `personas nacidas en la Argentina vivían en otro país a mediados de ${MGO.anio}, según las Naciones Unidas`],
  "f-inflacion": [pct(EIP.interanual), `subieron los precios al consumidor en los doce meses hasta ${EIP.mes}, según el INDEC`],
  "f-inflacion-rubros": [pct(EIP.div_max[1]), `subieron los precios de ${inicialMin(EIP.div_max[0])} en los doce meses hasta ${EIP.mes}, el rubro que más aumentó`],
  "f-canastas": [`${n0(ECB.cbt_hogar)} pesos`, `por mes necesitaba en ${ECB.mes} un hogar de cuatro integrantes del Gran Buenos Aires para no quedar bajo la línea de pobreza`],
  "f-salario-real": [pct(Math.abs(ESR.real_priv)), `${ESR.real_priv < 0 ? "bajó" : "subió"} en los doce meses hasta ${ESR.mes} el salario registrado del sector privado, descontada la inflación`],
  "f-emae": [pct(Math.abs(EMA.interanual)), `${EMA.interanual < 0 ? "cayó" : "creció"} la actividad económica en ${EMA.mes} frente a ${EMA.mes_ant}, según el INDEC`],
  "f-refugio": [n0(MGR.solicitudes), `solicitudes de refugio se presentaron en la Argentina en ${MGR.anio}, según la CONARE`],
  "f-supermercados": [pct(Math.abs(ESU.interanual)), `${ESU.interanual < 0 ? "cayeron" : "crecieron"} las ventas de los supermercados en pesos de igual ` +
    `valor en ${ESU.mes} frente a ${ESU.mes_ant}, según el INDEC`],
  "f-electricidad-sectores": [pct(e.els_pct.ind), `de la electricidad del país la usaron las industrias y los grandes comercios en ${e.el_ult}`],
  "f-combustibles": [`${n0(CB.nafta)} pesos`, `por litro fue el precio mediano de la nafta súper en el surtidor en ${CB.mes}`],
  "f-subsidios": [n2(e.sub_pbi) + "%", `del producto interno bruto fueron los subsidios económicos a la energía en ${e.sub_pbi_anio}, según la Secretaría de Hacienda`],
  "f-centrales": [pct(e.pot_pct_renov_ult), `de la potencia eléctrica instalada del país era eólica o solar en ${e.pot_anio}, contra ${pct(e.pot_pct_renov_ini)} en ${e.pot_ini}`],
  "f-mundo-petroleo": [`N.º ${PG.mundo.crudo_kbd.puesto}`, `entre los productores de petróleo del mundo fue la Argentina en ${PG.mundo.crudo_kbd.anio}, según la EIA`],
  "f-isac": [pct(Math.abs(CN.isac_var)), `${CN.isac_var < 0 ? "cayó" : "creció"} la actividad de la construcción en ${CN.isac_mes} frente al mismo mes del año anterior`],
  "f-insumos": [`${CN.ins_suben} de ${CN.ins_n}`, `insumos de la construcción tuvieron más consumo aparente en los doce meses hasta ${CN.ins_mes} que en los doce anteriores`],
  "f-empleo-construccion": [n0(CN.emp_total), `puestos asalariados registrados en la construcción privada en el ${CN.emp_trim}`],
  "f-trabajadores": [pct(VV.pct_ocupados_construccion), `de las personas ocupadas trabajaba en la construcción en el Censo 2022, con o sin registro`],
  "f-costo": [pct(Math.abs(CN.icc_real)), `${CN.icc_real < 0 ? "menos" : "más"} que los precios al consumidor subió el costo de construir desde ${CN.costo_desde}`],
  "f-vivienda": [pct(VV.pct_alquila), `de los hogares alquilaba su vivienda en el Censo 2022`],
  "f-hogares": [pct(e.pct_res_ult), `de la electricidad demandada en el país en ${e.anio_ult} correspondió a los hogares`],
  "f-actividad": [sg(e.crec_total), `creció la demanda eléctrica total entre ${e.anio_ini} y ${e.anio_ult}. La actividad económica creció ${pct(e.crec_emae)}`],
  "f-meses": [sg(e.dif_max_min), `más demanda eléctrica en ${e.mes_max} que en ${e.mes_min}, promedio de ${e.meses_desde} a ${e.meses_hasta}`],
  "f-adolescentes": [n1(nac.pct_ult), `de cada 100 nacimientos de ${nac.anio_ult} fueron de madres de 10 a 19 años. En ${nac.anio_ini} eran ${n1(nac.pct_ini)}`],
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
  "f-visitas-parque": [n0(vpq.top_v), `visitas recibió ${vpq.top}, el parque nacional más visitado en ${vpq.ult}`],
  "f-pesca": [n0(pe.total), `toneladas de pescados y mariscos desembarcadas en ${pe.anio}`],
  "f-pesca-rio": [pct(pe.rio_top_pct), `de la pesca comercial en ríos de ${pe.rio_anio} fue ${pe.rio_top.toLowerCase()}`],
  "f-nombres": [cu.nena, `${yE(cu.varon)} fueron los nombres más elegidos para los bebés en ${cu.nom_anio}`],
  "f-carne": [`${n1(cu.carne_v)} kg`, `de carne vacuna por habitante en ${cu.carne_anio}. En ${cu.carne_ini} eran ${n1(cu.carne_ini_v)} kg`],
  "f-vino": [n0(cu.vino_v), `millones de litros de vino vendidos en el país en ${cu.vino_anio}`],
  "f-yerba": [n1(cu.yerba_v), `millones de kilos de yerba mate salieron de los molinos en ${cu.yerba_anio}`],
  "f-glaciares": [n0(cu.gl_total), `glaciares inventariados en ${cu.gl_n} provincias`],
  "f-clima": [grados(cu.cl_max), `en ${cu.cl_max_anio}, el año más cálido desde ${cu.cl_ini}`],
  "f-esperanza": [n1(nv.ev_pais), `años de esperanza de vida al nacer en el país en ${nv.ev_anio}`],
  "f-exportaciones": [n0(nv.ex_pc_pais), `dólares por habitante exportó el país en ${nv.ex_anio}`],
  "f-censo": [pct(nv.censo.cloaca), `de los hogares tenía desagüe a red cloacal en el Censo 2022`],
  "f-internet": [n1(nv.in_top_v), `accesos a internet fijo cada 100 hogares en ${nv.in_top}, el valor más alto, en el ${nv.in_trim}${DIST["internet_fijo_provincias.accesos_100_hogares"]?.[nv.in_top] ? ", contando también los accesos de empresas y organizaciones" : ""}`],
  "f-extranjeros": [n1(nv.xt_pais), `personas nacidas en otro país cada 100 habitantes, ${nv.xt_corte}`],
  "f-fiscal": [pct(R.fiscal.mediana), `de los ingresos de la provincia del medio fueron recursos propios en ${R.fiscal.anio}. El resto llegó de la Nación`],
  "f-empresas": [n0(EM.total_pais), `empresas privadas con personal en relación de dependencia en ${EM.anio}, ${n1(EM.pais_1000)} cada 1.000 habitantes`],
  "f-dinamica-empresas": [n0(EM.ap), `empresas con empleados abrieron en ${EM.ult} y ${n0(EM.ci)} cerraron`],
  "f-rotacion": [pct(RO.total), `de las personas asalariadas de los 31 aglomerados urbanos llevaba un año o menos en su empleo, entre el ${trim(RO.desde)} y el ${trim(RO.hasta)}`],
  "f-sube": [n2(su.total_millones),`millones de tarjetas SUBE distintas usadas en un día hábil típico de ${su.mes}`],
  "f-anios-congreso": [`${n1(AC.top[0].total)} años`, `sumó ${AC.top[0].nombre} en el Congreso desde 1983, más que cualquier otra persona`],
};
/* "En cifras" (etapa 15, pedido del autor: todas las secciones con la misma cantidad de tarjetas que Trabajo y finanzas, del mismo
   ancho y llenando la fila, "siempre con valores que agreguen valor, no solo de relleno"). Cinco tarjetas en cada sección.
   EN_CIFRAS lleva las candidatas de cada sección en orden de prioridad: un id de ficha usa su cifra destacada (CLAVE) y un id que
   empieza con "x-" usa una cifra de EXTRA ([ficha a la que lleva, cifra, texto, y true si es la versión del país de un indicador
   provincial]). Sin una provincia elegida: las cuatro primeras y "Tu provincia" si la sección tiene datos por provincia (INDP), o las
   cinco primeras si no tiene. Con una provincia: sus indicadores primero y después las cifras del país que no los repiten, hasta cinco,
   con la bandera argentina para que se lean como del país. Todas salen de resumen, sin cifras escritas a mano, y sin suicidio. */
const ELU = R.elecciones.filter(x => x.vuelta > 0).at(-1);
const ESP_DIP = Object.keys(CG.dip).sort((a, b) => CG.dip[b] - CG.dip[a]);
const masMenos = (v, mas, menos) => v < 0 ? menos : mas;
const EXTRA = {
  "x-pet-shale": ["f-petroleo", pct(PG.pct_shale), `del petróleo de ${PG.mes} salió de pozos de shale. En ${PG.anio_ult}, la producción no convencional fue el ${pct(PG.pct_nc_ult)} del total`],
  "x-pet-ytd": ["f-petroleo", pct(Math.abs(PG.ytd.pet.var)), `${PG.ytd.pet.var < 0 ? "cayó" : "creció"} la producción de petróleo entre enero y ${MESES[PG.ytd.pet.mes - 1]} de ${PG.ytd.pet.anio}, frente a los mismos meses de ${PG.ytd.pet.anio - 1}`],
  "x-vaca-muerta": ["f-hidro-provincias", pct(PG.vm_pct), `del petróleo del país salió de la formación Vaca Muerta entre ${PG.v_desde} y ${PG.v_hasta}`],
  "x-construccion-ytd": ["f-isac", pct(Math.abs(CN.isac_ytd.var)), `${CN.isac_ytd.var < 0 ? "cayó" : "creció"} la actividad de la construcción entre enero y ${MESES[CN.isac_ytd.mes - 1]} de ${CN.isac_ytd.anio}, frente a los mismos meses del año anterior`],
  "x-viviendas-construccion": ["f-vivienda", n0(CN.viv_abs.en_construccion), `viviendas estaban en construcción el día del Censo 2022, ${n1(VV.construccion_cada_1000)} cada 1.000`],
  "x-emp-top": ["f-empresas", n1(EM.top_v), `empresas privadas cada 1.000 habitantes en ${EM.top}, la jurisdicción con más, en ${EM.anio}. En ${EM.low}, ${n1(EM.low_v)}`],
  "x-emp-saldo": ["f-dinamica-empresas", `${EM.positivas} de 24`, `jurisdicciones abrieron más empresas de las que cerraron en ${EM.ult}. En el país abrieron ${n1(EM.te)} y cerraron ${n1(EM.ts)} de cada 100`],
  "x-emp-negativos": ["f-dinamica-empresas", n0(EM.anios_negativos), `años con más cierres que aperturas de empresas desde ${EM.ini}, entre ellos ${lista(EM.ultimos_negativos.map(String))}`],
  "x-hurtos": ["f-robos", n0(SG.hurtos), `hurtos registrados cada 100.000 habitantes en ${SG.anio}. En ${SG.anio - 1}, ${n0(SG.hurtos_ant)}`],
  "x-primer-pais": ["f-nacidos-otro-pais", pct(MGC.paises[0][2]), `de las personas nacidas en otro país que vivían en la Argentina en 2022 había ` +
    `nacido en ${MGC.paises[0][0]}`],
  "x-inflacion-mes": ["f-inflacion", pct(EIP.mensual), `subieron los precios al consumidor en ${EIP.mes} frente al mes anterior, según el INDEC`],
  "x-indigencia": ["f-pobreza", pct(R.pobreza.ind), `de las personas de los 31 aglomerados urbanos estaba bajo la línea de indigencia en el ${R.pobreza.sem}`],
  "x-ev-brecha": ["f-esperanza", `${n1(nv.ev_m - nv.ev_v)} años`, `más es la esperanza de vida al nacer de las mujeres que la de los varones: ${n1(nv.ev_m)} contra ${n1(nv.ev_v)}, ${nv.ev_anio}`],
  "x-mi-reducibles": ["f-causas-infantiles", pct(R.mi_causas.reducibles.neonatal), `de las muertes de menores de 28 días de ${R.mi_causas.reducibles.anio} eran reducibles con prevención, diagnóstico o tratamiento oportunos`],
  "x-mi-inicio": ["f-mortalidad", n1(mo.tasa_inicio), `muertes de menores de un año cada 1.000 nacidos vivos en ${mo.anio_inicio}. En ${mo.anio}, ${n1(mo.tasa)}`],
  "x-aprender-len": ["f-aprender", pct(ap.len), `de los estudiantes de 6° grado alcanzó un nivel satisfactorio o avanzado en lengua en Aprender ${ap.anio}`, true],
  "x-aprender-debajo": ["f-aprender", pct(ap.mat_debajo), `de los estudiantes de 6° grado quedó por debajo del nivel básico en matemática en Aprender ${ap.anio}`],
  "x-nacimientos": ["f-nacimientos", n0(nac.n_ult), `nacimientos se registraron en ${nac.anio_ult}, ${pct(Math.abs(nac.caida))} menos que en ${nac.anio_pico}`],
  "x-edad-mediana": ["f-piramide", `${PI.edad_mediana_hoy} años`, `es la edad mediana de la población en ${PI.anio}. En ${PI.anio_fin} será de ${PI.edad_mediana_fin}, según las proyecciones del INDEC`],
  "x-vejez": ["f-envejecimiento", n1(EV.hoy), `personas de 65 años o más por cada 100 de 15 a 64 en ${EV.anio}. En ${EV.anio_fin} serán ${n1(EV.fin)}`],
  "x-jubilaciones": ["f-jubilaciones", n2(JU.ratio), `aportantes por cada jubilación o pensión de ANSES en ${JU.mes ? MESES[JU.mes - 1] + " de " : ""}${JU.anio}. En ${JU.max_anio} eran ${n2(JU.max)}`],
  "x-balotaje": ["f-elecciones", pct(ELU.pct_ganador), `de los votos positivos obtuvo la fórmula encabezada por ${ELU.ganador} en ${ELU.vuelta === 2 ? "el balotaje" : "la primera vuelta"} de ${ELU.anio}` +
    (ELU.vuelta === 2 ? `, y ${pct(100 - ELU.pct_ganador)} la de ${ELU.candidatos.find(c => c.c !== ELU.ganador).c}` : "") + (ELU.provisorio ? ". Escrutinio provisorio" : "")],
  "x-representacion": ["f-representacion", `${n1(CG.rep_max_v / CG.rep_min_v)} veces`, `más habitantes por banca de diputado hay en ${CG.rep_max} (${n0(CG.rep_max_v)}) que en ${CG.rep_min} (${n0(CG.rep_min_v)}), ${CG.anio}`],
  "x-congreso": ["f-congreso", `${CG.dip[ESP_DIP[0]]} de ${CG.n_dip}`, `bancas de Diputados tenía ${ESP_TXT[ESP_DIP[0]]} al ${CG.fecha}, el espacio con más. Le seguía ${ESP_TXT[ESP_DIP[1]]}, con ${CG.dip[ESP_DIP[1]]}`],
  "x-atn": ["f-atn", n0(TRR.n_atn_ult), `provincias recibieron aportes del Tesoro Nacional (ATN) en ${TRR.ult}, por ${milM(TRR.atn_ult)} de pesos. No hay una fórmula de reparto`],
  "x-presidentes": ["f-presidentes", `${PRR.amba} de ${PRR.n}`, `presidentes desde 1983 nacieron en el AMBA, donde vive el ${pct(PRR.amba_pob)} de la población`],
  "x-sube-var": ["f-sube", pct(Math.abs(su.var_anual)), `${masMenos(su.var_anual, "más", "menos")} tarjetas SUBE se usaron en un día hábil típico de ${su.mes} que en ${su.mes_prev}`],
  "x-hogares-crec": ["f-hogares", sg(e.crec_res), `creció la demanda eléctrica de los hogares entre ${e.anio_ini} y ${e.anio_ult}. La del resto de los usuarios, ${sg(e.crec_resto)}`],
  "x-demanda-ytd": R.ytd?.demanda && ["f-actividad", sg(R.ytd.demanda.var), `${masMenos(R.ytd.demanda.var, "creció", "cayó")} la demanda eléctrica entre enero y ${MESES[R.ytd.demanda.mes - 1]} de ${R.ytd.demanda.anio}, frente a los mismos meses de ${R.ytd.demanda.anio - 1}`],
  "x-demanda-total": ["f-actividad", n0(e.gwh_ult), `gigavatios hora de electricidad se demandaron en el país en ${e.anio_ult}`],
  "x-turistas-doce": ["f-receptivo", pct(Math.abs(tu.doce_var)), `${masMenos(tu.doce_var, "más", "menos")} turistas no residentes llegaron en los doce meses hasta ${tu.doce_hasta} que en los doce anteriores${tu.provisorio ? ". Datos provisorios" : ""}`],
  "x-hoteles-nr": ["f-hoteles", pct(tu.eoh_nr_pct), `de los viajeros hospedados en hoteles y parahoteles en ${tu.eoh_anio} no residía en el país`],
};
const EN_CIFRAS = {
  construccion: ["f-isac", "f-empleo-construccion", "f-costo", "f-vivienda", "x-construccion-ytd", "f-trabajadores", "x-viviendas-construccion", "f-insumos"],
  trabajo: ["f-empleo", "f-salarios", "f-rotacion", "f-exportaciones"],
  economia: ["f-inflacion", "x-inflacion-mes", "f-canastas", "f-salario-real", "f-emae", "f-supermercados"],
  empresas: ["f-empresas", "x-emp-top", "f-dinamica-empresas", "x-emp-saldo", "x-emp-negativos"],
  pobreza: ["f-pobreza", "x-indigencia", "f-censo", "f-internet"],
  salud: ["f-esperanza", "x-ev-brecha", "f-mortalidad", "x-mi-reducibles", "x-mi-inicio"],
  // Seguridad (etapa 23): tiene datos por provincia (homicidios y robos) y suma la tarjeta "Tu provincia"
  seguridad: ["f-homicidios", "f-robos", "x-hurtos", "f-carceles", "f-delitos"],
  educacion: ["f-aprender", "f-salario-docente", "f-inversion-educativa", "f-escolarizacion", "x-aprender-len", "f-pisa", "x-aprender-debajo"],
  poblacion: ["x-nacimientos", "x-edad-mediana", "x-vejez", "x-jubilaciones", "f-adolescentes"],
  gobierno: ["f-cuentas-nacion", "f-recaudacion", "f-deuda", "f-empleo-publico", "f-impuestos-provinciales", "f-fiscal"],
  migraciones: ["f-nacidos-otro-pais", "x-primer-pais", "f-radicaciones", "f-argentinos-exterior", "f-migracion-interna", "f-migracion-historia"],
  politica: ["x-balotaje", "x-representacion", "x-congreso", "x-atn", "x-presidentes"],
  movilidad: ["f-sube", "f-combustibles", "x-sube-var", "f-patentes", "f-sube-modos", "f-patentes-prov"],
  // Energía y Petróleo y gas, en dos páginas desde la etapa 22: Energía tiene datos por provincia (la electricidad y el gas de los
  // hogares) y suma la tarjeta "Tu provincia", Petróleo y gas no
  energia: ["f-hogares", "f-electricidad-provincias", "x-demanda-ytd", "f-gas-hogares", "f-subsidios", "x-hogares-crec", "f-gas-consumo",
    "f-actividad", "f-meses", "x-demanda-total"],
  petroleo: ["f-petroleo", "f-gas", "x-pet-shale", "f-reservas", "f-hidro-provincias", "x-vaca-muerta", "f-mundo-petroleo", "f-balanza-energetica",
    "f-pozos", "f-regalias", "f-empleo-hidro"],
  turismo: ["f-receptivo", "x-turistas-doce", "f-hoteles", "f-eti", "x-hoteles-nr"],
  naturaleza: ["f-protegida", "f-parques", "f-visitas", "f-pesca", "f-especies", "f-visitas-parque", "f-pesca-rio"],
  curiosidades: ["f-nombres", "f-carne", "f-vino", "f-yerba", "f-clima", "f-glaciares"],
};
const esc = t => String(t).replace(/[&<>"]/g, c => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;"})[c]);
// nombre de una provincia con su bandera (tablas, listas, buscador, migas)
function conBandera(c, nombre) { return `<span class="con-bandera">${bandera(c)}<span>${esc(nombre)}</span></span>`; }
const nTabla = loc.format(",.2~f");
// Tabla de la ficha dentro de la tarjeta (idea de USAFacts), con las mismas filas que el CSV
function tablaDatos(filas, ficha = "") {
  const MAX = 300, todas = Object.keys(filas[0]);
  const cols = todas.includes("territorio") ? ["territorio", ...todas.filter(c => c !== "territorio" && c !== "codigo_indec")] : todas;
  const anio = c => filas.every(r => r[c] == null || (Number.isInteger(r[c]) && r[c] >= 1800 && r[c] <= 2100));
  const num = Object.fromEntries(cols.map(c => [c, filas.some(r => typeof r[c] === "number")]));
  const v = (r, c) => r[c] == null ? "" : typeof r[c] === "number" ? (anio(c) ? String(r[c]) : nTabla(r[c])) : Array.isArray(r[c]) ? r[c].join(", ") : typeof r[c] === "object" ? JSON.stringify(r[c]) : r[c];
  // Resaltado (etapa 16, idea de un tablero que compartió el autor): en cada columna de números, el 20% más alto en azul y negrita y lo
  // que queda debajo de la mitad en gris, para leer la tabla sin el gráfico. Se calcula sobre las filas que se ven, sin el total del país.
  // No va en las fichas de suicidio (nada que se lea como ranking) ni en columnas de años, meses, códigos, edades o coordenadas
  const vistas = filas.slice(0, MAX), esTotal = r => r.codigo_indec === "00" || /^total/i.test(String(r.territorio || ""));
  const corte = {};
  if (!/suicid|f-muertes|f-edad/.test(ficha)) cols.forEach(c => {
    if (!num[c] || anio(c) || /^(codigo_indec|anio|mes|semestre|trimestre|t|orden|edad|lat|lng)$/.test(c)) return;
    const xs = vistas.filter(r => !esTotal(r) && typeof r[c] === "number").map(r => r[c]).sort(d3.ascending);
    if (xs.length >= 6 && new Set(xs).size > 2) corte[c] = [d3.quantile(xs, .8), d3.quantile(xs, .5)];
  });
  const clase = (r, c) => !corte[c] || typeof r[c] !== "number" || esTotal(r) ? "" : r[c] >= corte[c][0] ? " q-alto" : r[c] < corte[c][1] ? " q-bajo" : "";
  return `<div class="tabla-desliza"><table class="tabla-areas"><thead><tr>${cols.map(c => `<th${num[c] ? ' class="n"' : ""}>${esc(c.replace(/_/g, " "))}</th>`).join("")}</tr></thead><tbody>` +
    vistas.map(r => `<tr${prov && r.codigo_indec === prov ? ' class="elegida"' : ""}>${cols.map(c => `<td${num[c] ? ` class="n${clase(r, c)}"` : ""}>${
      c === "territorio" && (NOMBRES[r.codigo_indec] || r.codigo_indec === "00") ? conBandera(r.codigo_indec, v(r, c)) : esc(v(r, c))}</td>`).join("")}</tr>`).join("") +
    `</tbody></table></div><p class="tabla-nota">${filas.length > MAX ? `Primeras ${MAX} filas de ${n0(filas.length)}. ` : ""}La tabla completa está en el CSV.` +
    (Object.keys(corte).length ? ` En cada columna de números, en azul y negrita el 20% de los valores más altos y en gris los que quedan debajo de la mitad${filas.length > MAX ? " (entre las filas que se ven)" : ""}.` : "") + `</p>`;
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
  const fT = `600 24px ${F}`, fL = `400 15px ${F}`, fP = `400 12px ${F}`;
  const tit = envolver(f.querySelector("h3").textContent, fT), lead = envolver(f.querySelector(".lead")?.textContent || "", fL);
  const pieL = envolver(`${f.querySelector(".pie > span")?.textContent || ""}. Datina, ${location.host}${location.pathname}#${f.id}`, fP);
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
  const pie = f.querySelector(".pie"), csv = pie.querySelector(":scope > a");
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
    if (!caja) { b.dataset.cargando = "1"; const t = await cargarTabla(nombre).finally(() => delete b.dataset.cargando); caja = document.createElement("div"); caja.className = "tabla-datos"; caja.innerHTML = tablaDatos(t, f.id); pie.before(caja); }
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

/* Fichas horizontales: el texto (etiqueta, título, cifra, texto y notas a la vista) en una columna y el gráfico con sus
   controles en otra. El pie y la tabla van debajo, a todo el ancho. En pantallas angostas las dos columnas se apilan
   como antes (display: contents). Las fichas con clase "ancha" en la plantilla, y las herramientas, quedan apiladas. */
document.querySelectorAll(".tema:not(.herramienta) > article.ficha:not(.ancha)").forEach(f => {
  const texto = document.createElement("div"), graf = document.createElement("div");
  texto.className = "ficha-texto"; graf.className = "ficha-grafico";
  [...f.children].forEach(el => {
    if (el.matches(".pie, .tabla-datos")) return;
    (el.matches(".etiqueta, h3, .clave, .lead, .nota:not(.ocde-nota)") ? texto : graf).appendChild(el);
  });
  f.prepend(texto, graf);
  f.classList.add("horizontal");
});

/* "Para entender los datos" (octubre de 2026): una lista de botones de despliegue, cada uno con su texto justo debajo, de a uno.
   Abrir: el texto crece hasta su alto (250 ms) y entra con un fundido y 8 px hacia arriba. Si había otro abierto, se cierra al mismo
   tiempo. Cerrar: se achica en 200 ms. Con movimiento reducido el alto cambia de una vez y queda el fundido. */
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
  let turno = 0;
  botones.forEach(btn => btn.addEventListener("click", async () => {
    const mio = ++turno;
    if (btn.getAttribute("aria-expanded") === "true") return alternar(btn, false);
    const otro = botones.find(b => b !== btn && b.getAttribute("aria-expanded") === "true");
    if (otro && otro.compareDocumentPosition(btn) & Node.DOCUMENT_POSITION_FOLLOWING) {
      // el abierto está más arriba: si se cerrara despacio, el botón tocado se correría hacia arriba todo ese alto. Su texto se va
      // en 100 ms con el alto quieto, y después se saca de una vez con la página corrida lo mismo, así el botón tocado no se mueve.
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
});

/* "Ver más": los textos de las fichas que pasan de siete líneas se muestran en seis, con un botón para leer el resto.
   Lo que queda a la vista sigue diciendo qué mide la cifra, su unidad y su año (la cifra destacada y el comienzo del texto).
   Se revisa cada vez que el texto cambia (provincia, vistas OCDE) y cuando cambia el ancho. */
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
  // la altura es lo único que se anima, solo acá: 250 ms
  const hasta = lead.getBoundingClientRect().height;
  lead.animate([{height: desde + "px"}, {height: hasta + "px"}], {duration: 250, easing: "cubic-bezier(.23,1,.32,1)"});
  if (abrir) lead.animate([{opacity: .6}, {opacity: 1}], {duration: 250, easing: "ease-out"});
}
const LEADS = [...document.querySelectorAll(".tema:not(.herramienta) article.ficha .lead")];
const vigiaLargo = new MutationObserver(ms => new Set(ms.map(m => m.target.nodeType === 1 ? m.target.closest(".lead") : m.target.parentElement?.closest(".lead"))).forEach(l => l && revisarLargo(l)));
LEADS.forEach(l => { revisarLargo(l); vigiaLargo.observe(l, {childList: true, characterData: true, subtree: true}); });
let anchoLargo = innerWidth;
addEventListener("resize", () => { if (innerWidth === anchoLargo) return; anchoLargo = innerWidth; LEADS.forEach(revisarLargo); });
// y cuando llega la letra del sitio: con la de reemplazo, más ancha, un texto de siete líneas parecía de ocho y quedaba plegado
if (document.fonts) document.fonts.ready.then(() => LEADS.forEach(revisarLargo));

/* ---------- diagnóstico educativo (etapa 10, octubre de 2026) ----------
   Describe posiciones y diferencias, sin recomendar (decisión 19 de la ronda de iteración). Reutiliza la tabla de cruces
   (Censo 2022) y suma la base de Aprender por sector, ámbito y departamento (aprender_diagnostico, y aparte aprender_departamentos).
   El tema y las provincias quedan en el enlace (?dx=mat&dp=22,34) y nunca cambian la provincia elegida del sitio. */
(() => {
  const selTema = document.getElementById("dx-tema");
  if (!selTema) return;
  const RD = R.diagnostico, DX = Object.fromEntries(T.aprender_diagnostico.map(f => [f.codigo_indec, f]));
  const CR = Object.fromEntries(T.cruces_provincias.map(f => [f.codigo_indec, f]));
  const P24 = PROV.map(([c]) => c), MAX = 6, MIN = RD.min, AP = `Aprender ${RD.anio}, Ministerio de Educación`;
  const r1 = x => +x.toFixed(1);   // el mismo redondeo que muestra pct(): las diferencias salen de los valores que se ven
  const IND = {
    mat: {nombre: "Aprender, matemática", corto: "matemática en Aprender", v: c => DX[c]?.mat_logra, pais: DX["00"].mat_logra, anio: RD.anio, cita: AP,
      ficha: "#f-aprender", dist: "aprender_provincias.mat_logra", que: "de los estudiantes de 6° grado alcanzó el nivel satisfactorio o avanzado en matemática"},
    len: {nombre: "Aprender, lengua", corto: "lengua en Aprender", v: c => DX[c]?.len_logra, pais: DX["00"].len_logra, anio: RD.anio, cita: AP,
      ficha: "#f-aprender", dist: "aprender_provincias.len_logra", que: "de los estudiantes de 6° grado alcanzó el nivel satisfactorio o avanzado en lengua"},
    sob: {nombre: "Sobreedad en 6° grado", corto: "sobreedad en 6° grado", v: c => DX[c]?.sobreedad, pais: DX["00"].sobreedad, anio: RD.anio, cita: AP,
      que: "de los estudiantes de 6° grado tiene al menos un año más que la edad teórica, que es de 11 años"},
    esc: {nombre: "Escolarización secundaria", corto: "escolarización secundaria", v: c => DX[c]?.esc_hasta, pais: DX["00"].esc_hasta, anio: RD.esc_hasta,
      cita: `DiNIEE, Ministerio de Educación, ${RD.esc_hasta}`, ficha: "#f-escolarizacion",
      que: "de los adolescentes en edad de ir a la secundaria está matriculado en ese nivel (tasa neta)"},
    int: {nombre: "Internet en el hogar", corto: "internet en el hogar", v: c => CR[c]?.internet, pais: nv.censo.internet, anio: 2022, cita: "INDEC, Censo 2022",
      ficha: "#f-censo", que: "de los hogares tiene internet"},
    com: {nombre: "Computadora en el hogar", corto: "computadora en el hogar", v: c => CR[c]?.computadora, pais: nv.censo.computadora, anio: 2022,
      cita: "INDEC, Censo 2022", ficha: "#f-censo", que: "de los hogares tiene computadora, notebook o tableta"},
    adu: {nombre: "Adultos con secundario completo", corto: "adultos con secundario completo", v: c => CR[c]?.pct_25mas_secundario_completo_o_mas,
      pais: RD.adultos_pais, anio: 2022, cita: "INDEC, Censo 2022", ficha: "#f-adolescentes-nse", que: "de las personas de 25 años o más terminó la secundaria"},
  };
  const TEMAS = [
    {id: "mat", nombre: "Matemática en 6° grado", ind: ["mat"], area: "mat"},
    {id: "len", nombre: "Lengua en 6° grado", ind: ["len"], area: "len"},
    {id: "sob", nombre: "Sobreedad en 6° grado", ind: ["sob"], area: "sob"},
    {id: "esc", nombre: "Adolescentes en la secundaria", ind: ["esc"]},
    {id: "con", nombre: "Internet y computadora en casa", ind: ["int", "com"]},
    {id: "adu", nombre: "Adultos con secundario completo", ind: ["adu"]},
  ];
  // puesto entre las 24 (de mayor a menor) y cuánto se separan las provincias entre sí en cada indicador (desvío estándar)
  const ST = Object.fromEntries(Object.entries(IND).map(([k, ind]) => {
    const vals = P24.map(ind.v).filter(v => v != null), m = d3.mean(vals);
    return [k, {vals, sd: Math.sqrt(d3.sum(vals, v => (v - m) ** 2) / (vals.length - 1))}];
  }));
  const puesto = (k, c) => { const v = IND[k].v(c); return v == null ? null : 1 + ST[k].vals.filter(x => x > v).length; };
  const dif = (k, c) => r1(IND[k].v(c)) - r1(IND[k].pais);
  const vsPais = (k, c) => {
    const d = dif(k, c);
    return Math.abs(d) < .05 ? `Igual al valor de todo el país, ${pct(IND[k].pais)}.` : `${n1(Math.abs(d))} puntos ${d > 0 ? "más" : "menos"} que todo el país, ${pct(IND[k].pais)}.`;
  };
  const unos = x => n0(x < 1000 ? Math.round(x / 10) * 10 : Math.round(x / 100) * 100);
  const cita = k => ` <cite>${IND[k].cita}</cite>` + (IND[k].ficha ? ` <a class="enlace" href="${destinoDe(IND[k].ficha) || IND[k].ficha}">Ver la ficha</a>` : "");
  const motivo = (k, c) => IND[k].dist && DIST[IND[k].dist]?.[NOMBRES[c]]?.motivo;
  const unidad = c => c === "02" ? "comunas" : c === "06" ? "partidos" : "departamentos";
  let DEP = null, tema = "mat", sel = [];
  const q = new URLSearchParams(location.search);
  if (TEMAS.some(t => t.id === q.get("dx"))) tema = q.get("dx");
  sel = (q.get("dp") || "").split(",").filter((c, i, a) => NOMBRES[c] && a.indexOf(c) === i).slice(0, MAX);
  if (!q.has("dp") && prov && NOMBRES[prov]) sel = [prov];
  const tm = () => TEMAS.find(t => t.id === tema);

  // dentro de la provincia (Aprender): sector con su composición socioeconómica, ámbito, departamentos y cuántos quedaron debajo del básico
  function dentro(c, area) {
    const f = DX[c], col = area === "sob" ? "sobreedad" : area + "_logra", out = [];
    const v = s => f[`${col}_${s}`];
    if (v("estatal") != null && v("privado") != null)
      out.push(`Escuelas estatales ${pct(v("estatal"))} y privadas ${pct(v("privado"))}. En las estatales, el ${pct(f.nse_q1_estatal)} de los estudiantes pertenece al 20% del país con menor nivel socioeconómico, y en las privadas el ${pct(f.nse_q1_privado)}.`);
    else if (v("estatal") != null) out.push(`Las escuelas privadas tienen menos de ${MIN} estudiantes de 6° grado: no se muestra su porcentaje.`);
    if (v("urbano") != null && v("rural") != null) out.push(`Escuelas urbanas ${pct(v("urbano"))} y rurales ${pct(v("rural"))}.`);
    else if (f.n_rural > 0) out.push(`Las escuelas rurales tienen menos de ${MIN} estudiantes de 6° grado: no se muestra su porcentaje.`);
    if (c !== "00" && area !== "sob" && DEP) {
      const deps = DEP.filter(d => d.codigo_indec === c), con = deps.filter(d => d[col] != null).sort((a, b) => b[col] - a[col]);
      const chicos = deps.length - con.length;
      if (con.length > 1)
        out.push(`Entre sus ${con.length} ${unidad(c)} con ${MIN} estudiantes o más, el valor va de ${pct(con[0][col])} en ${con[0].departamento} a ${pct(con[con.length - 1][col])} en ${con[con.length - 1].departamento}.` +
          (chicos ? ` ${chicos === 1 ? "Otro tiene" : `Otros ${chicos} tienen`} menos estudiantes y no se ${chicos === 1 ? "muestra" : "muestran"}.` : ""));
    }
    if (area !== "sob") out.push(`Unos ${unos(f[area + "_debajo_n"])} estudiantes de 6° grado quedaron por debajo del nivel básico, el ${pct(f[area + "_debajo"])}.`);
    return out;
  }
  // los valores más altos y más bajos entre las 24, y dónde se aleja más del país en relación con cuánto se separan las provincias
  function resumenProv(c) {
    const ks = Object.keys(IND).filter(k => IND[k].v(c) != null), altos = [], bajos = [];
    ks.forEach(k => { const p = puesto(k, c), n = ST[k].vals.length; if (p <= 5) altos.push(IND[k].corto); else if (p > n - 5) bajos.push(IND[k].corto); });
    const lejos = ks.map(k => ({k, z: dif(k, c) / ST[k].sd})).sort((a, b) => Math.abs(b.z) - Math.abs(a.z))[0];
    const t = [];
    if (altos.length) t.push(`Está entre las cinco provincias con valores más altos en ${lista(altos)}.`);
    if (bajos.length) t.push(`Está entre las cinco con valores más bajos en ${lista(bajos)}.`);
    if (lejos && Math.abs(lejos.z) >= .1) t.push(`Donde más se aleja del valor de todo el país, teniendo en cuenta cuánto se separan las provincias entre sí, es en ${IND[lejos.k].corto}, ${lejos.z > 0 ? "por encima" : "por debajo"}.`);
    return t.join(" ");
  }
  const tabla = c => `<div class="tabla-desliza"><table class="tabla-areas dx-tabla"><caption class="solo-lector">Indicadores de educación de ${NOMBRES[c]}</caption>` +
    `<thead><tr><th>Indicador</th><th class="n">Valor</th><th class="n">Puesto</th><th class="n">Todo el país</th></tr></thead><tbody>` +
    Object.keys(IND).filter(k => IND[k].v(c) != null).map(k => `<tr${tm().ind.includes(k) ? ' class="elegida"' : ""}><td>${IND[k].nombre}<small>${IND[k].cita}</small></td>` +
      `<td class="n" data-l="Valor">${pct(IND[k].v(c))}</td><td class="n" data-l="Puesto">${puesto(k, c)} de ${ST[k].vals.length}</td><td class="n" data-l="Todo el país">${pct(IND[k].pais)}</td></tr>`).join("") +
    `</tbody></table></div><p class="dx-pie-tabla">Puesto entre las 24 provincias, ordenadas de mayor a menor valor.</p>`;
  function tarjeta(c) {
    const t = tm(), avisos = new Set(t.ind.map(k => motivo(k, c)).filter(Boolean));
    let h = `<article class="dx-prov"><h4>${conBandera(c, NOMBRES[c])}</h4>`;
    avisos.forEach(m => { h += `<p class="dx-aviso">${NOMBRES[c]}: ${m}.</p>`; });
    t.ind.forEach(k => {
      h += `<p class="dx-cifra"><b>${pct(IND[k].v(c))}</b> ${IND[k].que}.</p>` +
        `<p class="dx-pos">Puesto ${puesto(k, c)} de ${ST[k].vals.length}, de mayor a menor. ${vsPais(k, c)}${cita(k)}</p>`;
    });
    if (t.id === "esc") {
      const f = DX[c];
      h += `<p class="dx-linea">Entre ${RD.esc_desde} y ${RD.esc_hasta}, con la misma población de referencia, pasó de ${pct(f.esc_desde)} a ${pct(f.esc_hasta)}.` +
        (f.esc_hasta >= 99.5 ? " Un valor cercano a 100 o mayor refleja diferencias entre la matrícula y la proyección de población." : "") + `</p>`;
    }
    if (t.area) h += `<h5>Dentro de la provincia</h5><ul class="dx-lista">${dentro(c, t.area).map(x => `<li>${x}</li>`).join("")}</ul>`;
    h += `<h5>Sus indicadores de educación</h5>${tabla(c)}<p class="dx-linea">${resumenProv(c)}</p></article>`;
    return h;
  }
  function tarjetaPais() {
    const t = tm();
    let h = `<article class="dx-prov dx-pais"><h4>${conBandera("00", "Todo el país")}</h4>`;
    t.ind.forEach(k => {
      const orden = P24.filter(c => IND[k].v(c) != null).sort((a, b) => IND[k].v(b) - IND[k].v(a));
      const arriba = orden.filter(c => k !== "esc" || IND[k].v(c) < 99.5), afuera = orden.filter(c => !arriba.includes(c));
      h += `<p class="dx-cifra"><b>${pct(IND[k].pais)}</b> ${IND[k].que}.</p><p class="dx-pos">Las provincias van de ${pct(IND[k].v(arriba[0]))} en ${NOMBRES[arriba[0]]} a ` +
        `${pct(IND[k].v(orden[orden.length - 1]))} en ${NOMBRES[orden[orden.length - 1]]}` +
        (afuera.length ? `, sin contar ${lista(afuera.map(c => NOMBRES[c]))}, con valores de 100 o cercanos por diferencias entre la matrícula y la proyección de población` : "") + `.${cita(k)}</p>`;
    });
    if (t.area) h += `<h5>Dentro del país</h5><ul class="dx-lista">${dentro("00", t.area).map(x => `<li>${x}</li>`).join("")}</ul>`;
    return h + `<p class="dx-ayuda">Sumá una o más provincias arriba para ver su diagnóstico.</p></article>`;
  }
  function conjunto() {
    const t = tm();
    if (sel.length < 2 || !t.area) return "";
    const n = d3.sum(sel, c => DX[c].n), tot = DX["00"].n;
    let x = `Las ${sel.length} provincias elegidas reúnen unos ${unos(n)} estudiantes de 6° grado, el ${pct(n / tot * 100)} del país`;
    if (t.area !== "sob") {
      const d = d3.sum(sel, c => DX[c][t.area + "_debajo_n"]), dt = DX["00"][t.area + "_debajo_n"];
      x += `, y unos ${unos(d)} de los que quedaron por debajo del nivel básico en ${t.area === "mat" ? "matemática" : "lengua"}, el ${pct(d / dt * 100)} de los de todo el país`;
    }
    return `<p class="dx-conjunto">${x}. <cite>${AP}</cite></p>`;
  }
  function contexto() {
    const t = tm(), pz = R.pisa;
    if (!["mat", "len"].includes(t.id)) return "";
    const a = t.id === "mat" ? ["matemática", pz.mat, pz.ocde_mat] : ["lectura", pz.lec, pz.ocde_lec];
    return `<p class="dx-contexto"><b>Contexto del país.</b> En PISA ${pz.anio}, que evalúa a estudiantes de 15 años y no tiene resultados por provincia, la Argentina obtuvo ${n0(a[1])} puntos en ${a[0]} y el promedio de los países de la OCDE, ${n0(a[2])}. <cite>OCDE, PISA</cite></p>`;
  }
  function noDice() {
    const t = tm(), x = ["Describe posiciones y diferencias. No dice qué hacer ni por qué cada provincia está donde está."];
    if (t.area) x.push("La diferencia entre escuelas estatales y privadas refleja también quiénes asisten a cada una: por eso va junto al nivel socioeconómico de sus estudiantes.",
      `Aprender mide 6° grado de primaria en ${RD.anio}: no habla de toda la trayectoria escolar.`,
      `Los grupos de menos de ${MIN} estudiantes no muestran porcentajes. La fuente oculta los departamentos más chicos, con unos ${unos(RD.enmascarados.alumnos)} estudiantes en total, que cuentan en su provincia pero no en la lista.`);
    if (t.id === "esc") x.push(`La escolarización se compara desde ${RD.esc_desde}, porque ese año cambió la población de referencia.`);
    if (["con", "adu"].includes(t.id)) x.push("El Censo 2022 es el último dato por provincia: no muestra lo que cambió después.");
    if (sel.length) x.push(`Los indicadores de la tabla son de años distintos, entre 2022 y ${Math.max(RD.anio, RD.esc_hasta)}.`);
    return x.map(y => `<li>${y}</li>`).join("");
  }

  const salida = document.getElementById("dx-salida"), eleg = document.getElementById("dx-elegidas"), sumar = document.getElementById("dx-sumar");
  selTema.innerHTML = TEMAS.map(t => `<option value="${t.id}">${t.nombre}</option>`).join("");
  function pintarControles() {
    selTema.value = tema;
    const lleno = sel.length >= MAX;
    sumar.innerHTML = `<option value="">${lleno ? `Hasta ${MAX} provincias` : "Elegí una provincia"}</option>` +
      PROV.map(([c, n]) => `<option value="${c}"${sel.includes(c) ? " disabled" : ""}>${n}</option>`).join("");
    sumar.disabled = lleno;
    eleg.innerHTML = sel.length
      ? `<ul class="dx-chips" aria-label="Provincias elegidas">${sel.map(c => `<li>${conBandera(c, NOMBRES[c])}<button type="button" class="dx-quitar" data-c="${c}" aria-label="Quitar ${NOMBRES[c]}">` +
          `<svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M3 3l6 6M9 3l-6 6"/></svg></button></li>`).join("")}</ul>` +
        (sel.length > 1 ? `<button type="button" class="enlace dx-limpiar">Quitar todas</button>` : "")
      : `<p class="dx-vacio">Sin provincias elegidas: abajo se ve todo el país.</p>`;
  }
  function pintar(cambio) {
    pintarControles();
    salida.innerHTML = conjunto() + (sel.length ? sel.map(tarjeta).join("") : tarjetaPais()) + contexto();
    document.getElementById("dx-no-dice").innerHTML = noDice();
    const k = tm().ind[0];
    document.getElementById("dx-grafico-tit").textContent = `${IND[k].nombre}, ${IND[k].anio}. Las 24 provincias, de mayor a menor`;
    document.getElementById("dx-estado").textContent = `Diagnóstico de ${tm().nombre.toLowerCase()} para ${sel.length ? lista(sel.map(c => NOMBRES[c])) : "todo el país"}.`;
    if (cambio) {
      salida.animate([{opacity: 0}, {opacity: 1}], {duration: 200, easing: "cubic-bezier(.23,1,.32,1)"});
      const el = G("diagnostico");
      if (el && el.closest(".visto")) cambiarVista("diagnostico");
    }
  }
  const guardar = () => { const u = new URL(location.href); u.searchParams.set("dx", tema); u.searchParams.set("dp", sel.join(",")); history.replaceState(history.state, "", u); };
  selTema.addEventListener("change", () => { tema = selTema.value; guardar(); pintar(true); });
  sumar.addEventListener("change", () => {
    const c = sumar.value;
    if (c && !sel.includes(c) && sel.length < MAX) { sel.push(c); guardar(); pintar(true); }
    sumar.focus({preventScroll: true});
  });
  eleg.addEventListener("click", ev => {
    const b = ev.target.closest(".dx-quitar"), todas = ev.target.closest(".dx-limpiar");
    if (!b && !todas) return;
    const i = b ? sel.indexOf(b.dataset.c) : -1;
    sel = todas ? [] : sel.filter(c => c !== b.dataset.c);
    guardar(); pintar(true);
    // el foco pasa a la provincia que quedó en ese lugar, o a la lista para sumar
    const sig = eleg.querySelectorAll(".dx-quitar")[Math.min(Math.max(i, 0), sel.length - 1)];
    (todas || !sig ? sumar : sig).focus({preventScroll: true});
  });
  DIB.diagnostico = a => {
    const el = G("diagnostico"); if (!el) return;
    const k = tm().ind[0];
    barrasH(el, {anim: a, data: P24.map(c => ({codigo_indec: c, territorio: NOMBRES[c], v: IND[k].v(c)})).filter(d => d.v != null), k: "v",
      vf: pct, af: v => v + "%", ref: IND[k].pais, refLab: `País ${pct(IND[k].pais)}`, marcar: new Set(sel)});
  };
  pintar(false);
  cargarTabla("aprender_departamentos").then(t => { DEP = t; pintar(false); });
})();

/* ---------- las 24: perfil de la provincia elegida ---------- */
// Solo indicadores con dato por provincia. Las tasas de suicidio quedan fuera: no se presentan como ranking.
const INDP = [
  {id:"f-mortalidad", g:"salud", lab:"Mortalidad infantil", veces:true, det:`muertes de menores de un año cada 1.000 nacidos vivos, promedio ${mo.tri_act}`,
    d:T.mortalidad_infantil_provincias, k:"tmi_actual", pais:mo.pais_act, f:n1, ocde:OC.mortalidad_infantil.ocde},
  {id:"f-adolescentes", g:"poblacion", lab:"Maternidad adolescente", veces:true, det:`% de los nacimientos de ${nac.anio_ult} con madres menores de 20 años`,
    d:T.madres_adolescentes_provincias, k:ADO_ULT, pais:nac.pct_ult, f:pct},
  {id:"f-escolarizacion", g:"educacion", lab:"Escolarización secundaria", det:`tasa neta de escolarización, ${es.fin}`,
    d:T.escolarizacion_secundaria_provincias, k:"tasa_final", pais:es.pais_fin, f:pct},
  {id:"f-aprender", g:"educacion", lab:"Aprender, matemática", det:`% de 6° grado con nivel satisfactorio o avanzado, ${ap.anio}`,
    d:T.aprender_provincias, k:"mat_logra", pais:ap.mat, f:pct, dist:"aprender_provincias.mat_logra"},
  {id:"f-aprender", g:"educacion", lab:"Aprender, lengua", det:`% de 6° grado con nivel satisfactorio o avanzado, ${ap.anio}`,
    d:T.aprender_provincias, k:"len_logra", pais:ap.len, f:pct, dist:"aprender_provincias.len_logra"},
  {id:"f-empleo", g:"trabajo", lab:"Empleo privado registrado", veces:true, det:`asalariados cada 100 habitantes, ${em.mes}`,
    d:T.empleo_provincias, k:"cada_100", pais:em.cada_100_pais, f:n1, dist:"empleo_provincias.cada_100"},
  {id:"f-empleo", g:"trabajo", lab:"Variación del empleo privado", det:`% en los doce meses a ${em.mes}`,
    d:T.empleo_provincias, k:"var_12m", pais:em.var_nac, f:sg},
  {id:"f-protegida", g:"turismo", lab:"Territorio protegido", veces:true, det:`% de la superficie dentro de áreas protegidas, ${nt.anio}`,
    d:T.areas_protegidas_provincias, k:"pct_territorio", pais:nt.pct, f:pct, ocde:OC.protegida.ocde},
  {id:"f-esperanza", g:"salud", lab:"Esperanza de vida", det:`años al nacer, ambos sexos, ${nv.ev_anio}`,
    d:T.esperanza_vida_provincias, k:"total", pais:nv.ev_pais, f:n1, ocde:OC.esperanza_vida.ocde},
  {id:"f-censo", g:"salud", lab:"Sin cobertura de salud", veces:true, det:"% de las personas sin obra social, prepaga ni plan estatal, 2022",
    d:T.censo2022_provincias, k:"sin_cobertura", pais:nv.censo.sin_cobertura, f:pct},
  {id:"f-censo", g:"vivienda", lab:"Cloacas", veces:"debajo", det:"% de los hogares con desagüe a red cloacal, 2022",
    d:T.censo2022_provincias, k:"cloaca", pais:nv.censo.cloaca, f:pct},
  {id:"f-censo", g:"vivienda", lab:"Internet en el hogar", det:"% de los hogares, 2022",
    d:T.censo2022_provincias, k:"internet", pais:nv.censo.internet, f:pct},
  {id:"f-exportaciones", g:"economia", lab:"Exportaciones", veces:true, det:`dólares por habitante, ${nv.ex_anio}`,
    d:T.exportaciones_provincias, k:"usd_por_habitante", pais:nv.ex_pc_pais, f:n0},
  {id:"f-fiscal", g:"gobierno", lab:"Recursos propios", det:`% de los ingresos totales de la provincia, ${R.fiscal.anio}`,
    d:T.fiscal_provincias, k:"autonomia", pais:R.fiscal.mediana, f:pct},
  {id:"f-eti", g:"turismo", lab:"Turistas extranjeros", det:`cada 1.000 habitantes, salidos por Ezeiza o Aeroparque, ${tu.eti_anio}`,
    d:T.turistas_extranjeros_provincias, k:"cada_1000", pais:null, f:n1},
  {id:"f-gas-hogares", g:"energia", lab:"Gas de red para cocinar", veces:"debajo", det:"% de los hogares, Censo 2022",
    d:T.vivienda_provincias, k:"pct_gas_red", pais:VV.pct_gas_red, f:pct},
  {id:"f-gas-consumo", g:"energia", lab:"Consumo de gas por usuario", veces:true, det:`m³ por usuario residencial de gas natural, ${e.gas_anio}`,
    d:T.gas_usuario_provincias, k:"m3_usuario", pais:e.gas_pais, f:n0},
  {id:"f-vivienda", g:"vivienda", lab:"Hogares que alquilan", veces:true, det:"% de los hogares, Censo 2022",
    d:T.vivienda_provincias, k:"pct_alquila", pais:VV.pct_alquila, f:pct},
  {id:"f-obra-publica", g:"gobierno", lab:"Obra pública de la Nación", veces:true, det:`pesos por habitante, ${CN.op_ult}`,
    d:T.obra_publica_provincias, k:"total_hab", pais:CN.op_hab_pais, f:n0},
  // CAMMESA no separa la Ciudad de la provincia de Buenos Aires ni informa Tierra del Fuego: esas tres muestran el valor del país
  {id:"f-electricidad-provincias", g:"energia", lab:"Consumo eléctrico de los hogares", det:`kWh por habitante, ${e.el_ult}`, veces:true,
    d:T.electricidad_provincias.filter(r => r.codigo_indec !== "02-06"), k:"kwh_hab", pais:e.el_pais, f:n0},
  {id:"f-salarios", g:"trabajo", lab:"Salario promedio de los asalariados registrados privados", veces:true, det:`pesos por mes, bruto, ${SA.mes}`,
    d:T.salarios_provincias.filter(r => r.codigo_indec !== "00"), k:"salario", pais:SA.pais, f:n0},
  {id:"f-salario-docente", g:"educacion", lab:"Salario de un maestro de grado", veces:true, det:`pesos por mes, bruto, con 10 años de antigüedad, ${DC.trim}`,
    d:T.salario_docente.filter(r => r.codigo_indec !== "00"), k:"bruto", pais:DC.pais, f:n0},
  {id:"f-inversion-educativa", g:"educacion", lab:"Inversión en educación por alumno", veces:true, det:`pesos por alumno de gestión estatal, ${IE.anio}`,
    d:T.inversion_educativa.filter(r => r.codigo_indec !== "00"), k:"gasto_por_alumno", pais:IE.pais, f:n0},
  {id:"f-homicidios", g:"seguridad", lab:"Homicidios dolosos", veces:true, det:`víctimas cada 100.000 habitantes por año, ${SG.hom3_desde} a ${SG.anio}`,
    d:T.homicidios_provincias.filter(r => r.codigo_indec !== "00"), k:"tasa_3", pais:SG.hom3_pais, f:n1},
  {id:"f-robos", g:"seguridad", lab:"Robos registrados", veces:true, det:`cada 100.000 habitantes, ${SG.anio}`,
    d:T.robos_provincias.filter(r => r.codigo_indec !== "00"), k:"robos", pais:SG.robos, f:n0, dist:"robos_provincias.robos"},
  {id:"f-empleo-publico", g:"gobierno", lab:"Cargos en la administración provincial", veces:true, det:`cada 1.000 habitantes, ${GBC.anio}`,
    d:T.empleo_publico_provincias, k:"cada_1000", pais:GBC.cada_1000, f:n1},
  {id:"f-impuestos-provinciales", g:"gobierno", lab:"Impuestos provinciales", veces:true, det:`pesos por habitante, ${GBP.anio}`,
    d:T.impuestos_provinciales.filter(r => r.por_habitante != null), k:"por_habitante", pais:GBP.pais, f:n0},
  {id:"f-nacidos-otro-pais", g:"poblacion", lab:"Nacidos en otro país", veces:true, det:"% de la población en viviendas particulares, Censo 2022",
    d:T.nacidos_otro_pais_provincias.filter(r => r.codigo_indec !== "00"), k:"pct_otro_pais", pais:MGC.pct, f:n1},
  {id:"f-migracion-interna", g:"poblacion", lab:"Nacidos en otra provincia", veces:true, det:"% de la población en viviendas particulares, Censo 2022",
    d:T.nacidos_otro_pais_provincias.filter(r => r.codigo_indec !== "00"), k:"pct_otra_provincia", pais:MGC.otra_pct, f:n1},
  {id:"f-supermercados", g:"economia", lab:"Ventas en supermercados", det:`variación en pesos de igual valor, doce meses hasta ${ESU.mes}`,
    d:T.supermercados_provincias, k:"var_12m", pais:ESU.prov.pais, f:conSigno},
  {id:"f-combustibles", g:"economia", lab:"Precio de la nafta súper", det:`pesos por litro en el surtidor, mediana de las estaciones, ${CB.mes}`,
    d:T.combustibles_provincias, k:"nafta", pais:CB.nafta, f:n0},
  {id:"f-empleo-construccion", g:"trabajo", lab:"Empleo registrado en la construcción", veces:true, det:`asalariados privados cada 1.000 habitantes, ${CN.emp_trim}`,
    d:T.empleo_construccion_provincias, k:"construccion_cada_1000", pais:CN.emp_cada_1000, f:n1, dist:"empleo_construccion_provincias.construccion_cada_1000"},
];
// el perfil por tema, con un índice arriba (etapa 27, pedido del autor, como los perfiles de USAFacts). Cada indicador lleva su tema en g. El
// último grupo es la capital de la provincia, con los datos del censo de su municipio y su puesto entre las 24 capitales. El constructor
// deja la misma estructura con tarjetas vacías mientras carga (lee PERFIL_GRUPOS y los g de acá)
const PERFIL_GRUPOS = [["trabajo", "Trabajo"], ["economia", "Economía"], ["salud", "Salud"], ["educacion", "Educación"], ["seguridad", "Seguridad"],
  ["poblacion", "Población y migraciones"], ["gobierno", "Gobierno"], ["vivienda", "Vivienda y servicios"], ["energia", "Energía"],
  ["turismo", "Turismo y naturaleza"], ["capital", "La capital"]];
const CAP_P = [
  {id:"a-viviendas-hacinamiento", g:"capital", cap:true, veces:true, lab:"Viviendas por habitante", det:"viviendas particulares cada 1.000 habitantes, Censo 2022",
    d:T.capitales, k:"viviendas_1000", pais:R.capitales_pais.viviendas_1000, f:n0},
  {id:"a-viviendas-alquiler", g:"capital", cap:true, veces:true, lab:"Hogares que alquilan", det:"% de los hogares, Censo 2022",
    d:T.capitales, k:"alquila", pais:VV.pct_alquila, f:pct},
  {id:"a-viviendas-hacinamiento", g:"capital", cap:true, veces:true, lab:"Hacinamiento crítico", det:"% de los hogares con más de tres personas por cuarto, Censo 2022",
    d:T.capitales, k:"hacinamiento", pais:VV.pct_hacinamiento, f:pct},
];
const PERFIL = [...INDP, ...CAP_P];
const grilla = document.getElementById("prov-grid") || document.createElement("div");
grilla.innerHTML = `<nav class="perfil-indice" id="perfil-indice" aria-label="Temas del perfil"><ol>` +
  PERFIL_GRUPOS.map(([g, tit], i) => `<li><a class="enlace" href="#pg-${g}">${i + 1}. ${tit}</a></li>`).join("") + `</ol></nav>` +
  PERFIL_GRUPOS.map(([g, tit], i) => `<section class="perfil-grupo" id="pg-${g}" aria-labelledby="pg-${g}-t"><div class="perfil-cab">` +
    `<h3 class="bloque-grupo" id="pg-${g}-t">${i + 1}. <span>${tit}</span></h3><a class="enlace" href="#perfil-indice">Volver al índice</a></div>` +
    `<div class="perfil-tarjetas">` + PERFIL.map((c, j) => c.g !== g ? "" : `<a class="tarjeta dp" href="#${c.id}" data-i="${j}"><span class="dp-lab">${c.lab}</span>
  <span class="dp-num"></span><span class="dp-det">${c.det}</span><svg class="dp-tira" aria-hidden="true"></svg><span class="dp-pos"></span><span class="dp-aclara"></span></a>`).join("") +
    `</div></section>`).join("");
// Tira con las 24 provincias: puntos claros, raya oscura para el país y punto grande para la elegida
function tiras() {
  grilla.querySelectorAll(".dp").forEach(el => {
    const c = PERFIL[+el.dataset.i], nodo = el.querySelector(".dp-tira"), svg = d3.select(nodo);
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
  el.animate([{opacity:1}, {opacity:0}], {duration:100, easing:"ease-out"}).onfinish = () => {
    el.textContent = t;
    el.animate([{opacity:0, transform:"translateY(4px)"}, {opacity:1, transform:"none"}], {duration:200, easing:"cubic-bezier(.23,1,.32,1)"});
  };
}
function pintarPanel(animar) {
  const nombre = NOMBRES[prov];
  pintarExtra();
  cambiarTexto($("prov-titulo-txt"), nombre ? `${nombre} en números` : "Elegí una de las 24", animar);
  const pb = $("prov-band"), nueva = nombre ? bandera(prov, "grande") : "";
  if (pb.innerHTML !== nueva) { pb.innerHTML = nueva; if (animar && !REDUCIR && nueva) pb.animate([{opacity: 0}, {opacity: 1}], {duration: DUR_C, easing: "ease-out"}); }
  // el título del grupo de la capital lleva su nombre
  const capF = T.capitales.find(r => r.codigo_indec === prov), capT = document.querySelector("#pg-capital-t span");
  if (capT) capT.textContent = !capF ? "La capital" : prov === "02" ? "La Ciudad, entre las capitales" : `Su capital, ${capF.territorio}`;
  grilla.querySelectorAll(".dp").forEach(el => {
    const c = PERFIL[+el.dataset.i], fila = c.d.find(d => d.codigo_indec === prov);
    const orden = [...c.d].sort((a, b) => b[c.k] - a[c.k]).findIndex(d => d.codigo_indec === prov) + 1;
    cambiarTexto(el.querySelector(".dp-num"), fila ? c.f(fila[c.k]) : c.pais == null ? "Elegí una" : c.f(c.pais), animar);
    const vz = fila && c.veces && c.pais != null ? vecesPais(fila[c.k], c.pais, c.veces === "debajo") : "";
    el.querySelector(".dp-pos").textContent = fila ? `${c.cap ? `Puesto ${orden} entre las ${c.d.length} capitales` : `Posición ${orden} de ${c.d.length}`}, de mayor a menor.${c.pais == null ? "" : ` País: ${c.f(c.pais)}.`}${vz ? ` Es ${vz}.` : ""}${c.ocde == null ? "" : ` OCDE: ${c.f(c.ocde)}.`}` : c.pais == null ? "Sin total nacional comparable" : "Total del país";
    el.querySelector(".dp-aclara").textContent = fila ? notaDist(c, prov) : "";
    const punto = d3.select(el).select("circle.elegida");
    if (!fila) { punto.attr("opacity", 0); return; }
    // el punto viaja de la provincia anterior a la nueva
    (animar && !REDUCIR && punto.attr("opacity") === "1" ? punto.transition().duration(DUR_G).ease(EASE) : punto)
      .attr("cx", c.x(fila[c.k])).attr("opacity", 1);
  });
}

/* ---------- preguntas que rotan de a una ---------- */
const PREG = [
  ["¿Cuánto cambiaron los pozos de Vaca Muerta?",
   `En ${PG.dv_ini}, un pozo tenía en promedio ${n0(PG.dv_rama_ini)} metros de rama horizontal y ${n1(PG.dv_etapas_ini)} etapas de fractura. En ${PG.fr_ult}, ${n0(PG.dv_rama_ult)} metros y ${n1(PG.dv_etapas_ult)} etapas.`, "#f-fracturas"],
  ["¿Cuánto petróleo produce la Argentina?",
   `${n0(PG.kbd)} mil barriles por día en ${PG.mes}, el ${pct(PG.pct_shale)} de pozos de shale. Según la EIA, en ${PG.mundo.crudo_kbd.anio} fue el productor número ${PG.mundo.crudo_kbd.puesto} del mundo.`, "#f-petroleo"],
  ["¿Cuánto petróleo sale de una sola área de concesión?",
   `En ${PG.areas_anio}, ${tituloArea(PG.areas_pet_top.nombre)}, en ${PG.areas_pet_top.territorio}, produjo ${kbdF(PG.areas_pet_top.v)} mil barriles por día, el ${pct(PG.areas_pet_top.pct)} del petróleo del país.`, "#f-areas-hidro"],
  ["¿Cuántos hogares cocinan con gas de red?",
   `El ${pct(VV.pct_gas_red)} en el Censo 2022. ` + (CN.gas_nea.length ? `En ${lista(CN.gas_nea)}, menos de ${Math.ceil(CN.gas_nea_max)} de cada 100.` : ""), "#f-gas-hogares"],
  ["¿Cuánto prestan los bancos para comprar una vivienda?",
   `${n0(CN.hip_ult)} mil millones de pesos en créditos hipotecarios UVA en ${CN.hip_mes}. En todo ${CN.hip_anio}, ${n0(CN.hip_anual)} mil millones, contra ${n0(CN.hip_anual_min)} en ${CN.hip_anual_min_anio}, en pesos de igual valor.`, "#f-hipotecas"],
  ["¿Cuánta electricidad consumen los hogares?",
   `En ${e.el_ult}, ${n0(e.el_pais)} kilovatios hora por habitante en el país. En ${e.el_top[0]}, ${n0(e.el_top[1])}, y en ${e.el_bajo[0]}, ${n0(e.el_bajo[1])}.`, "#f-electricidad-provincias"],
  ["¿Cuánto gana en promedio un asalariado registrado?",
   `En ${SA.mes}, ${n0(SA.pais)} pesos brutos por mes en el sector privado del país. En ${SA.top[0]}, ${n0(SA.top[1])}, y en ${SA.bajo[0]}, ${n0(SA.bajo[1])}.`, "#f-salarios"],
  ["¿Cuánto cobra un maestro de grado?",
   `En ${DC.trim}, ${n0(DC.pais)} pesos brutos por mes en promedio, con 10 años de antigüedad y jornada simple. Va de ${n0(DC.bajo[1])} en ${DC.bajo[0]} a ${n0(DC.top[1])} en ${DC.top[0]}.`, "#f-salario-docente"],
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
  ["¿Cuántas personas pidieron refugio en la Argentina el último año?",
   `En ${MGR.anio}, ${n0(MGR.solicitudes)} solicitudes, según la Comisión Nacional para los Refugiados. Ese año reconoció como refugiadas a ` +
   `${n0(MGR.reconocidas)} personas.`, "#f-refugio"],
  ["¿Venden más o menos los supermercados que hace un año?",
   `${ESU.interanual < 0 ? "Menos" : "Más"}: en ${ESU.mes}, las ventas en pesos de igual valor fueron ${pct(Math.abs(ESU.interanual))} ` +
   `${ESU.interanual < 0 ? "menores" : "mayores"} que en ${ESU.mes_ant}, según el INDEC.`, "#f-supermercados"],
  ["¿Cuánto necesita un hogar para no ser pobre?",
   `${n0(ECB.cbt_hogar)} pesos por mes en ${ECB.mes}, un hogar de cuatro integrantes del Gran Buenos Aires, según la canasta básica total del INDEC.`, "#f-canastas"],
  ["¿Le ganan los salarios a la inflación?",
   `En los doce meses hasta ${ESR.mes}, descontada la inflación, el salario registrado del sector privado ${cambioPct(ESR.real_priv)} y el del sector público ${cambioPct(ESR.real_pub)}.`, "#f-salario-real"],
  ["¿Cuántas personas están presas?",
   `Al 31 de diciembre de ${SG.sn_anio}, ${n0(SG.sn_personas)} personas en cárceles, ${n0(SG.sn_tasa)} cada 100.000 habitantes. En ${SG.sn_ini}, ${n0(SG.sn_personas_ini)}.`, "#f-carceles"],
  ["¿Qué parte de la electricidad usan las industrias?",
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
  ["¿Cuántos bebés menos nacen que hace una década?",
   `En ${nac.anio_ult} se registraron ${n0(nac.n_ult)} nacimientos, ${pct(Math.abs(nac.caida))} menos que en ${nac.anio_pico}.`, "#f-nacimientos"],
  ["¿Cuánto empleo privado registrado hay en cada provincia?",
   `${n1(em.top_v)} asalariados cada 100 habitantes en ${em.top}${aclara("empleo_provincias.cada_100", em.top)} y ${n1(em.low_v)} en ${em.low}. El país tiene ${n1(em.cada_100_pais)}.`, "#f-empleo"],
  ["¿A qué distancia está la Argentina del promedio de la OCDE en PISA?",
   `A ${pz.dif_mat} puntos en matemática en ${pz.anio}: ${pz.mat} contra ${pz.ocde_mat}.`, "#f-pisa"],
  ["¿Cuántos adolescentes están en la secundaria?",
   `El ${pct(es.pais_fin)} en ${es.fin}, ${n1(es.pais_fin - es.pais_ini)} puntos más que en ${es.ini}. En ${es.low}, el ${pct(es.low_v)}.`, "#f-escolarizacion"],
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
   `En ${nac.anio_ini}, ${n1(nac.pct_ini)} de cada 100 nacimientos eran de madres menores de 20 años. En ${nac.anio_ult}, ${n1(nac.pct_ult)}.`, "#f-adolescentes"],
  ["¿Quién estuvo más años en el Congreso desde 1983?",
   `${AC.top[0].nombre}: ${n1(AC.top[0].total)} años` + (AC.top[0].dip > 0 && AC.top[0].sen > 0 ? " entre Diputados y el Senado" : AC.top[0].sen > 0 ? " en el Senado" : " en Diputados") +
   `${AC.top[0].sigue ? ", y sigue en el cargo" : ""}. Le siguen ${AC.top[1].nombre} (${n1(AC.top[1].total)}) y ${AC.top[2].nombre} (${n1(AC.top[2].total)}).`, "#f-anios-congreso"],
];
(function carrusel() {
  const rot = document.getElementById("rotador"); if (!rot) return;
  const q = rot.querySelector(".rot-q"), a = rot.querySelector(".rot-a");
  const cuerpo = rot.querySelector(".rot-cuerpo"), barra = rot.querySelector(".rot-barra i"), cuenta = document.getElementById("rot-cuenta");
  const bPausa = rot.querySelector(".rot-pausa"), bSig = rot.querySelector(".rot-sig"), bAnt = rot.querySelector(".rot-ant");
  const DUR = 7000, freno = {pausa: REDUCIR, puntero: false, foco: false, fuera: false};
  // con movimiento reducido arranca en pausa: "Seguir" lo pone en marcha
  if (REDUCIR) { bPausa.setAttribute("aria-pressed", "true"); bPausa.textContent = "Seguir"; }
  let i = 0, prog;
  const frenado = () => Object.values(freno).some(Boolean);
  const aplicar = () => { if (prog) frenado() ? prog.pause() : prog.play(); };
  function correr() {
    prog?.cancel();
    prog = barra.animate([{transform:"scaleX(0)"}, {transform:"scaleX(1)"}], {duration: DUR, easing: "linear", fill: "forwards"});
    prog.onfinish = () => mostrar(i + 1, true);
    aplicar();
  }
  const poner = () => {
    const [pq, pa, h] = PREG[i];
    q.textContent = pq; q.href = destinoDe(h) || h; a.textContent = pa;
    cuenta.textContent = `${i + 1} de ${PREG.length}`;
  };
  function mostrar(n, animar, paso = 1) {
    i = (n + PREG.length) % PREG.length;
    const entrar = () => {
      poner();
      if (animar) cuerpo.animate(REDUCIR ? [{opacity:0}, {opacity:1}]
        : [{opacity:0, transform:`translateX(${paso * 12}px)`}, {opacity:1, transform:"none"}],
        {duration: REDUCIR ? 200 : 300, easing: "cubic-bezier(.23,1,.32,1)"});
      correr();
    };
    if (!animar) return entrar();
    const sale = cuerpo.animate(REDUCIR ? [{opacity:1}, {opacity:0}]
      : [{opacity:1, transform:"none"}, {opacity:0, transform:`translateX(${-paso * 8}px)`}],
      {duration: 150, easing: "ease-out", fill: "forwards"});
    sale.onfinish = () => { entrar(); sale.cancel(); };
  }
  bPausa.addEventListener("click", () => {
    freno.pausa = !freno.pausa; bPausa.setAttribute("aria-pressed", freno.pausa);
    bPausa.textContent = freno.pausa ? "Seguir" : "Pausar"; aplicar();
  });
  bSig.addEventListener("click", () => mostrar(i + 1, true, 1));
  bAnt.addEventListener("click", () => mostrar(i - 1, true, -1));
  rot.addEventListener("pointerenter", () => { freno.puntero = true; aplicar(); });
  rot.addEventListener("pointerleave", () => { freno.puntero = false; aplicar(); });
  rot.addEventListener("focusin", () => { freno.foco = true; aplicar(); });
  rot.addEventListener("focusout", () => { freno.foco = false; aplicar(); });
  new IntersectionObserver(([en]) => { freno.fuera = !en.isIntersecting; aplicar(); }).observe(rot);
  // Reserva el alto de la pregunta más larga para que la página no salte. Desde octubre de 2026 los controles van debajo del
  // texto (orden de lectura): el texto se centra en el alto reservado, así los botones no se mueven al cambiar de pregunta
  const medir = () => {
    cuerpo.style.minHeight = "0px"; let alto = 0;
    PREG.forEach(([pq, pa]) => { q.textContent = pq; a.textContent = pa; alto = Math.max(alto, cuerpo.offsetHeight); });
    cuerpo.style.minHeight = alto + "px";
    poner();
  };
  // y otra vez cuando termina de llegar la letra: medido con la de reemplazo, el alto podía quedar de más (etapa 13)
  medir(); new ResizeObserver(() => medir()).observe(rot.parentElement); document.fonts?.ready.then(medir);
  mostrar(0, false);
})();

/* menú de secciones (etapa 14): un panel de vidrio fuera de la barra, alineado con el botón. En el celular ocupa la pantalla
   debajo de la barra y la página queda quieta detrás (clase menu-abierto en la raíz) */
(() => {
  const btn = document.getElementById("menu-btn"), panel = document.getElementById("menu-panel"), raiz = document.documentElement;
  let t;
  const abierto = () => btn.getAttribute("aria-expanded") === "true", primero = () => panel.querySelector("a");
  const ubicar = () => panel.style.setProperty("--menu-izq", Math.round(btn.getBoundingClientRect().left) + "px");
  // los botones de la barra están fijos arriba: sin preventScroll, Chrome corre la página para "mostrarlos" al darles el foco
  const abrir = () => {
    clearTimeout(t); ubicar(); panel.hidden = false; btn.setAttribute("aria-expanded", "true"); raiz.classList.add("menu-abierto");
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
  // el panel va después de la barra en la página: con Tab se entra desde el botón, con Mayúscula y Tab se vuelve a él, y si el
  // foco sale hacia otro lugar de la página el menú se cierra
  btn.addEventListener("keydown", ev => { if (ev.key === "Tab" && !ev.shiftKey && abierto()) { ev.preventDefault(); primero().focus({preventScroll: true}); } });
  panel.addEventListener("keydown", ev => { if (ev.key === "Tab" && ev.shiftKey && document.activeElement === primero()) { ev.preventDefault(); btn.focus({preventScroll: true}); } });
  panel.addEventListener("focusout", ev => { const a = ev.relatedTarget; if (abierto() && a && !panel.contains(a) && a !== btn) cerrar(false); });
  addEventListener("resize", () => { if (abierto()) ubicar(); });
})();

/* ---------- artículos: preguntas respondidas cruzando dos indicadores de las 24 jurisdicciones ----------
   Los números y las frases que dependen de ellos se calculan acá desde la tabla de cruces, así se actualizan solos.
   A mano van solo la pregunta (data-titulo en el marcado), el contexto y los límites propios de cada cruce, sin cifras.
   Las advertencias generales (pocos casos, correlación no es causalidad, promedios provinciales, períodos distintos,
   Spearman y Pearson que difieren) se agregan siempre que corresponden. */
// La precisión de la pobreza de cada capital, como la califica la nota del INDEC: con un coeficiente de variación de entre 16% y 25%, con
// cuidado, y de más de 25%, no confiable (etapa 27). Las capitales de cada grupo salen del resumen.
const CV_EPH = (() => {
  const r = R.capitales_eph_res, C = r.cuidado, N = r.no_confiable;
  const ini = "El INDEC publica la precisión de cada estimación de pobreza (su coeficiente de variación): pide considerar con cuidado las que tienen entre 16% y 25%, y como no confiables las que pasan de 25%.";
  if (!C.length && !N.length) return `${ini} En el ${r.semestre}, ninguna capital llega a 16%.`;
  const c = C.length ? `${C.length > 1 ? "las" : "la"} de ${lista(C)} ${C.length > 1 ? "están" : "está"} entre 16% y 25%` : "ninguna capital está entre 16% y 25%";
  const n = N.length ? `${N.length > 1 ? "las" : "la"} de ${lista(N)} ${N.length > 1 ? "pasan" : "pasa"} de 25%` : "ninguna pasa de 25%";
  return `${ini} En el ${r.semestre}, ${c}, y ${n}.`;
})();
// La unidad de los artículos de la EPH: el aglomerado, que no es el municipio del censo
const LIM_AGLO = "Cada capital es su aglomerado urbano según la Encuesta Permanente de Hogares, que en algunos casos junta dos ciudades, como Rawson con Trelew o Ushuaia con Río Grande. Es un área distinta del municipio que usan los artículos de las viviendas, que salen del censo.";
const ART = [
  // etapa 27: tres artículos de las capitales con la Encuesta Permanente de Hogares (tabla capitales_eph, por aglomerado)
  {id: "a-pobreza-desocupacion", tabla: "capitales_eph", x: "desocupacion", y: "pobreza", espera: 1, frec: "La desocupación se actualiza cada trimestre",
    lx: "desocupación", ly: "pobreza", ux: "% de la población económicamente activa", uy: "% de las personas",
    dek: "La desocupación de cada capital de provincia en el último año, frente a la parte de sus habitantes bajo la línea de pobreza, según la Encuesta Permanente de Hogares.",
    contexto: "La desocupación y la pobreza miden cosas distintas: una cuenta a quienes buscan trabajo y no lo consiguen, y la otra mira si los ingresos del hogar alcanzan para la canasta básica. Este cruce pone una al lado de la otra, capital por capital, con la Encuesta Permanente de Hogares del INDEC.",
    limites: [LIM_AGLO,
      "La EPH es una encuesta por muestra, y en los aglomerados chicos la desocupación de un trimestre es poco precisa. Por eso se usa el promedio de los últimos cuatro trimestres: si en uno el INDEC no publicó el dato por tener pocos casos, el promedio usa los otros tres.",
      CV_EPH,
      "Una persona puede tener trabajo y ser pobre: la desocupación no dice cuánto se gana."]},
  {id: "a-empleo-pobreza", tabla: "capitales_eph", x: "empleo", y: "pobreza", espera: -1, frec: "El empleo se actualiza cada trimestre",
    lx: "empleo", ly: "pobreza", ux: "% de la población", uy: "% de las personas",
    dek: "La parte de la población de cada capital de provincia que trabaja, en el último año, frente a la parte de sus habitantes bajo la línea de pobreza, según la Encuesta Permanente de Hogares.",
    contexto: "La desocupación cuenta solo a quienes buscan trabajo y no lo consiguen: quien dejó de buscar, o no busca, no figura. La tasa de empleo mira otra cosa, la parte de toda la población que trabaja. Este cruce la compara, capital por capital, con la parte de las personas bajo la línea de pobreza, según la Encuesta Permanente de Hogares del INDEC.",
    limites: [LIM_AGLO,
      "La tasa de empleo se calcula sobre toda la población, con los chicos y las personas mayores: una capital con una parte mayor de personas en edad de trabajar tiende a tener, solo por eso, una tasa más alta.",
      "La EPH es una encuesta por muestra, y en los aglomerados chicos la tasa de un trimestre es poco precisa. Por eso se usa el promedio de los últimos cuatro trimestres.",
      CV_EPH,
      "Tener trabajo no dice cuánto se gana ni si el trabajo está registrado."]},
  {id: "a-alquiler-pobreza", tabla: "capitales_eph", x: "pobreza", y: "alquila", espera: -1, frec: "La parte de los hogares que alquila se actualiza cada trimestre",
    lx: "pobreza", ly: "hogares que alquilan", ux: "% de las personas", uy: "% de los hogares",
    dek: "La parte de los habitantes de cada capital de provincia bajo la línea de pobreza, frente a la parte de sus hogares que alquila, según la Encuesta Permanente de Hogares.",
    contexto: "Quien no tiene una vivienda propia suele alquilarla, y para alquilar hacen falta ingresos con los que pagar el contrato. Este cruce compara, capital por capital, la parte de las personas bajo la línea de pobreza con la parte de los hogares que alquila, según la Encuesta Permanente de Hogares del INDEC.",
    limites: [LIM_AGLO,
      "La parte de los hogares que alquila es un cálculo propio con las bases de la EPH de los últimos cuatro trimestres publicados. El censo de 2022, que cuenta todo el municipio, da cifras parecidas pero no iguales.",
      "La EPH pregunta si el hogar alquila la vivienda, no cuánto paga ni desde cuándo.",
      CV_EPH]},
  // etapa 26: artículos de las 24 capitales de provincia, con la tabla de las capitales (Censo 2022 por municipio). Van antes que los de
  // las provincias porque son los más nuevos
  {id: "a-viviendas-hacinamiento", tabla: "capitales", x: "viviendas_1000", y: "hacinamiento", espera: -1, frec: "Se actualiza con cada censo",
    lx: "viviendas por habitante", ly: "hacinamiento crítico", ux: "viviendas cada 1.000 habitantes", uy: "% de los hogares",
    dek: "Cuántas viviendas hay cada 1.000 habitantes en cada capital de provincia, frente a la parte de sus hogares con más de tres personas por cuarto.",
    contexto: "Para saber si alcanzan las viviendas suele contarse cuántas hay cada 1.000 habitantes, la misma medida que se usa para comparar países. En la Argentina no hay una estadística oficial de precios de la vivienda que permita comparar las capitales, pero el censo sí cuenta cuántas personas viven en cada cuarto. Este cruce pone una cosa al lado de la otra, capital por capital.",
    limites: ["Las viviendas por habitante dependen también de cuántas personas viven en cada hogar: donde los hogares son más grandes hay menos viviendas por habitante, aunque cada hogar tenga la suya.",
      "Las viviendas incluyen las que no tenían personas presentes el día del censo, como las de uso temporal, las que estaban en alquiler o venta y las que se estaban construyendo.",
      "Cada capital es su municipio, y la Ciudad de Buenos Aires, sus 15 comunas. En Mendoza y San Juan el municipio es solo el centro de una ciudad mucho más grande, y el de San Miguel de Tucumán incluye una parte del departamento de Lules.",
      "No hay una estadística oficial de precios de venta o de alquiler de viviendas que permita comparar las 24 capitales. Por eso este cruce no dice si las viviendas cuestan más o menos donde hay más."]},
  {id: "a-viviendas-alquiler", tabla: "capitales", x: "viviendas_1000", y: "alquila", espera: 1, frec: "Se actualiza con cada censo",
    lx: "viviendas por habitante", ly: "hogares que alquilan", ux: "viviendas cada 1.000 habitantes", uy: "% de los hogares",
    dek: "Cuántas viviendas hay cada 1.000 habitantes en cada capital de provincia, frente a la parte de sus hogares que alquila la vivienda donde vive.",
    contexto: "Quien no tiene una vivienda propia suele alquilarla, y para eso tiene que haber viviendas en alquiler. Este cruce compara, capital por capital, cuántas viviendas hay por habitante con la parte de los hogares que alquila, según el último censo.",
    limites: ["Las viviendas por habitante dependen también de cuántas personas viven en cada hogar: donde los hogares son más grandes hay menos viviendas por habitante, aunque cada hogar tenga la suya.",
      "El censo pregunta si el hogar alquila la vivienda, no cuánto paga ni desde cuándo.",
      "Cada capital es su municipio, y la Ciudad de Buenos Aires, sus 15 comunas. En Mendoza y San Juan el municipio es solo el centro de una ciudad mucho más grande, y el de San Miguel de Tucumán incluye una parte del departamento de Lules.",
      "No hay una estadística oficial de precios de venta o de alquiler de viviendas que permita comparar las 24 capitales. Por eso este cruce no dice si alquilar cuesta más o menos donde hay más viviendas."]},
  {id: "a-atn-presupuesto", x: "atn_hab", y: "apoyo_presupuesto", espera: 1, frec: "Se actualiza cada año",
    lx: "ATN por habitante", ly: "apoyo al presupuesto", ux: "pesos por habitante por año", uy: "% de los votos",
    dek: "Los Aportes del Tesoro Nacional que recibió cada provincia por habitante, frente a la parte de los votos de sus diputados y senadores de fuera del bloque oficialista que fue a favor del presupuesto nacional.",
    contexto: "Los Aportes del Tesoro Nacional (ATN) son un fondo para atender emergencias y desequilibrios financieros de las provincias, y los asigna el Ministerio del Interior. El presupuesto es la ley que fija cada año los gastos y los recursos de la administración nacional, y para aprobarlo el gobierno suele necesitar votos de otros bloques. Este cruce compara, provincia por provincia, cuánto recibió cada una en ATN por habitante con cuánto votaron a favor del presupuesto sus legisladores de fuera del bloque oficialista.",
    limites: [
      "Cada provincia suma los votos de sus diputados y senadores de fuera del bloque oficialista en todos esos presupuestos: son pocas personas que votan muchas veces, y las ausencias cuentan como votos que no fueron a favor.",
      "El bloque oficialista es el más numeroso del espacio del presidente: los aliados del gobierno de otros bloques cuentan como de fuera, así que suman las provincias cuyos legisladores suelen acompañar al gobierno de turno.",
      "Que vayan juntos no dice si los ATN se reparten según el apoyo de los legisladores, si los legisladores votan según los ATN que recibe su provincia o si las dos cosas dependen de la relación de cada gobernador con el gobierno nacional."]},
  {id: "a-exportaciones-empleo", x: "exportaciones", y: "empleo_privado", espera: 1, frec: "Se actualiza cada año",
    lx: "exportaciones por habitante", ly: "empleo privado registrado", ux: "dólares por habitante", uy: "asalariados cada 100 habitantes",
    dek: "Lo que cada provincia le vende al mundo, frente a cuántas personas tienen un empleo privado registrado.",
    contexto: "Exportar trae dólares a una provincia, pero no todas las actividades necesitan la misma cantidad de personas para producir lo mismo. Este cruce pone una cosa al lado de la otra, provincia por provincia.",
    limites: ["El registro previsional asigna cada empleo a la provincia donde está inscripto el empleador. Por eso la Ciudad de Buenos Aires aparece muy alta, aunque parte de esos trabajos se hagan en otras provincias.",
      "Las exportaciones se cuentan según la provincia donde se produjo la mercadería, no según dónde está la empresa que la vende."]},
  {id: "a-cloacas-mortalidad", x: "cloaca", y: "mortalidad_infantil", espera: -1, frec: "Se actualiza cada año",
    lx: "hogares con cloacas", ly: "mortalidad infantil", ux: "% de los hogares", uy: "muertes cada 1.000 nacidos vivos",
    dek: "El acceso a la red cloacal según el último censo, frente a las muertes de bebés menores de un año.",
    contexto: "El saneamiento forma parte de las condiciones en las que nace y crece un bebé. Este cruce compara la cobertura de cloacas de cada provincia con su tasa de mortalidad infantil.",
    limites: ["La mortalidad infantil es un promedio de tres años, porque en las provincias con pocos nacimientos la tasa de un solo año salta mucho.",
      "La mortalidad infantil depende también de la atención durante el embarazo y el parto, que este cruce no mide."]},
  {id: "a-cobertura-adolescentes", x: "sin_cobertura", y: "madres_adolescentes", espera: 1, frec: "Se actualiza cada año",
    lx: "personas sin obra social ni prepaga", ly: "maternidad adolescente", ux: "% de las personas", uy: "% de los nacimientos",
    dek: "La cobertura de salud del último censo, frente a la parte de los nacimientos que son de madres adolescentes.",
    contexto: "En la Argentina, la obra social llega sobre todo con el empleo registrado. Por eso este cruce usa la falta de cobertura como una aproximación a las condiciones económicas de cada provincia.",
    limites: ["La ficha de maternidad adolescente compara el mismo dato con otros indicadores del Censo, como las necesidades básicas insatisfechas y el secundario completo de los adultos."]},
  {id: "a-recursos-empleo", x: "autonomia_fiscal", y: "empleo_privado", espera: 1, frec: "Se actualiza cada año",
    lx: "recursos propios", ly: "empleo privado registrado", ux: "% de los ingresos", uy: "asalariados cada 100 habitantes",
    dek: "Qué parte de sus ingresos recauda cada provincia, frente a cuánto empleo privado registrado tiene.",
    contexto: "Las provincias se financian con lo que recaudan y con lo que reciben de la Nación. Una economía privada más grande puede dejar más impuestos propios, pero también pesan la coparticipación y las decisiones de cada gobierno.",
    limites: ["Los recursos propios incluyen impuestos provinciales y otros ingresos, como las regalías. Una provincia con petróleo o minería puede recaudar mucho sin tener mucho empleo privado."]},
  {id: "a-cobertura-esperanza", x: "sin_cobertura", y: "esperanza_vida", espera: -1, yAuto: true, frec: "Se actualiza con cada censo",
    lx: "personas sin obra social ni prepaga", ly: "esperanza de vida", ux: "% de las personas", uy: "años",
    dek: "La esperanza de vida al nacer de cada provincia, frente a la parte de su población sin obra social ni prepaga.",
    contexto: "La esperanza de vida resume en un número las condiciones de mortalidad de un período. La falta de obra social o prepaga se usa acá como una aproximación a las condiciones de vida, no como una medida del acceso a la salud: el hospital público atiende a todas las personas.",
    limites: ["La esperanza de vida de 2020 y 2021 refleja la pandemia de COVID-19. Conviene mirar el año del dato antes de compararlo con otros períodos."]},
  {id: "a-internet-aprender", x: "internet", y: "aprender_mat", espera: 1, frec: "Se actualiza con cada Aprender",
    lx: "hogares con internet", ly: "matemática en Aprender", ux: "% de los hogares", uy: "% de 6° grado en nivel satisfactorio o avanzado",
    dek: "La conexión a internet en los hogares según el último censo, frente a los resultados de 6° grado en la evaluación Aprender.",
    contexto: "Internet en el hogar suele acompañar a otras ventajas, como más ingresos o más años de estudio de los adultos. Por eso este cruce sirve para ver una desigualdad, no para medir el efecto de internet en el aprendizaje.",
    limites: ["El cálculo propio de Aprender sobre la base agregada difiere levemente del informe oficial."]},
  // etapa 24: la inversión por alumno (Coordinación de Evaluación de Costos Educativos) frente a Aprender
  {id: "a-inversion-aprender", x: "gasto_alumno", y: "aprender_mat", espera: 1, frec: "Se actualiza cada año",
    lx: "inversión en educación por alumno", ly: "matemática en Aprender", ux: "pesos por alumno de gestión estatal por año", uy: "% de 6° grado en nivel satisfactorio o avanzado",
    dek: "Lo que invierte el Estado por cada alumno de las escuelas estatales de cada provincia, frente a los resultados de 6° grado en la evaluación Aprender.",
    contexto: "La mayor parte de lo que se invierte en educación son los salarios docentes, y sostener escuelas cuesta distinto en cada territorio. Este cruce mira si las provincias que más invierten por alumno son también las que tienen mejores resultados en matemática.",
    limites: ["La inversión está en pesos de cada año, sin ajustar por lo que cuesta vivir en cada provincia ni por el tamaño de las escuelas: donde hay pocos alumnos por escuela o los salarios son más altos, cada alumno cuesta más.",
      "Aprender evalúa a los alumnos de 6° grado de las escuelas estatales y privadas, y la inversión cuenta solo a los de gestión estatal.",
      "El cálculo propio de Aprender sobre la base agregada difiere levemente del informe oficial."]},
  {id: "a-milei-empleo", x: "empleo_privado", y: "voto_milei_2023", espera: 1, frec: "El empleo se actualiza cada mes",
    lx: "empleo privado registrado", ly: "voto a Milei en el balotaje", ux: "asalariados cada 100 habitantes", uy: "% de los votos positivos",
    dek: "Cómo se repartió el voto del balotaje presidencial según el peso del empleo privado registrado en cada provincia.",
    contexto: "El balotaje enfrentó a dos fórmulas con propuestas económicas distintas. Este cruce describe cómo se repartió el voto según el peso del empleo privado registrado en cada provincia, sin juzgar las razones de cada elector.",
    limites: ["Votan todas las personas habilitadas, y el empleo privado registrado cubre solo a una parte de quienes trabajan.",
      "El resultado es el del escrutinio provisorio, el único publicado como datos abiertos para esa elección."]},
];
const META_CX = Object.fromEntries(R.cruces.map(m => [m.id, m]));
// cada artículo de cruces usa la tabla de las provincias o, con tabla: "capitales", la de las 24 capitales (etapa 26), con su metadato y su
// forma de nombrar los casos
const tablaArt = a => a.tabla || "cruces_provincias";
const META_TAB = {cruces_provincias: META_CX, capitales: Object.fromEntries(R.capitales.map(m => [m.id, m])),
  capitales_eph: Object.fromEntries(R.capitales_eph.map(m => [m.id, m]))};
const CASOS_ART = {
  cruces_provincias: {s: "jurisdicción", pl: "jurisdicciones", prom: "Son promedios de cada jurisdicción: no dicen qué pasa con cada persona ni con los municipios de una misma provincia."},
  capitales: {s: "capital", pl: "capitales", prom: "Son promedios de cada ciudad: no dicen qué pasa con cada persona ni con los barrios de una misma ciudad."},
  capitales_eph: {s: "capital", pl: "capitales", prom: "Son promedios de cada aglomerado: no dicen qué pasa con cada persona ni con los barrios de una misma ciudad."}};
// "del primer semestre de 2026", "de los cuatro trimestres hasta...", "de 2022": el período detrás de "es de" (etapa 27)
const delPer = p => /^(primer|segundo|tercer|cuarto) /.test(p) ? "del " + p : "de " + p;
const rTxt = r => n2(r).replace(/[-−]/, "menos ");
// la primera letra en minúscula, salvo que el nombre empiece con un nombre propio (antes se bajaba todo: "voto a milei", etapa 24)
const minusc = t => /^(Aprender|PISA|ATN)/.test(t) ? t : t.charAt(0).toLowerCase() + t.slice(1);
const fuerzaArt = r => { const a = Math.abs(r); return a >= .6 ? "fuerte" : a >= .4 ? "moderada" : a >= .2 ? "débil" : "casi nula"; };
// "% de los hogares" se pega al número (45,2%) y el resto de la unidad va después
const partesU = u => u.startsWith("%") ? ["%", u.replace(/^%\s*/, "")] : ["", u];
function calcularArt(a) {
  const F = T[tablaArt(a)].filter(f => f[a.x] != null && f[a.y] != null);
  const xs = F.map(f => f[a.x]), ys = F.map(f => f[a.y]);
  const S = CX.simple(xs, ys), iCook = d3.maxIndex(S.cook), sinC = F.filter((_, i) => i !== iCook);
  return {F, n: F.length, rs: CX.spearman(xs, ys), rp: CX.pearson(xs, ys), rs2: CX.spearman(sinC.map(f => f[a.x]), sinC.map(f => f[a.y])),
    cook: F[iCook], arriba: F[d3.maxIndex(S.res)], abajo: F[d3.minIndex(S.res)]};
}
function textoArt(a, c) {
  const Mx = META_TAB[tablaArt(a)][a.x], My = META_TAB[tablaArt(a)][a.y], U = CASOS_ART[tablaArt(a)];
  const fx = v => loc.format(`,.${Mx.dec}f`)(v), fy = v => loc.format(`,.${My.dec}f`)(v);
  const [px, rx] = partesU(a.ux), [py, ry] = partesU(a.uy);
  const vx = f => `${fx(f[a.x])}${px} ${rx}`, vy = f => `${fy(f[a.y])}${py} ${ry}`;
  const ab = Math.abs(c.rs), mismo = Math.sign(c.rs) === a.espera;
  const respuesta = ab < .2 ? "No hay un patrón claro." : !mismo ? "No: la relación va en sentido contrario." : ab >= .4 ? "Sí, en general." : "Apenas.";
  const bajada = ab < .2
    ? `En las ${c.n} ${U.pl} con dato, conocer el nivel de ${a.lx} casi no ayuda a anticipar el de ${a.ly}. La correlación de Spearman es de ${rTxt(c.rs)}, en una escala que va de menos 1 a 1.`
    : `En las ${c.n} ${U.pl} con dato, las que tienen más ${a.lx} tienden a tener valores ${c.rs > 0 ? "más altos" : "más bajos"} de ${a.ly}. La relación es ${fuerzaArt(c.rs)}: la correlación de Spearman es de ${rTxt(c.rs)}, en una escala que va de menos 1 a 1.`;
  const ord = [...c.F].sort((p, q) => q[a.x] - p[a.x]), top = ord.slice(0, 3), bajo = ord.slice(-3).reverse();
  // "22,0 en Neuquén, 14,9 en Santa Cruz y 13,7 en Santa Fe": el nombre separa los números, sin ambigüedad con la coma decimal
  const enProv = fs => listaY(fs.map(f => `${fy(f[a.y])}${py} en ${f.territorio}`));
  const extremos = `Las tres ${U.pl} con más ${a.lx} son ${listaY(top.map(f => `${f.territorio} (${vx(f)})`))}. ` +
    `En ${a.ly}, los valores son ${enProv(top)} (${ry}). ` +
    `Las tres con menos son ${listaY(bajo.map(f => `${f.territorio} (${vx(f)})`))}. En ${a.ly}, esas tres tienen ${enProv(bajo)}.`;
  const excep = `Las que más se apartan de la tendencia son ${c.arriba.territorio}, con ${vy(c.arriba)} y ${vx(c.arriba)}, por encima de la línea del gráfico, ` +
    `y ${c.abajo.territorio}, con ${vy(c.abajo)} y ${vx(c.abajo)}, por debajo.`;
  const peso = `${c.cook.territorio} es la ${U.s} que más pesa en el resultado. ` + (Math.abs(c.rs2 - c.rs) < .05
    ? `Sin ella, la correlación casi no cambia: pasa de ${rTxt(c.rs)} a ${rTxt(c.rs2)}, así que el resultado no depende de un solo caso.`
    : `Sin ella, la correlación de Spearman pasa de ${rTxt(c.rs)} a ${rTxt(c.rs2)}` + (fuerzaArt(c.rs2) !== fuerzaArt(c.rs) ? `, una relación ${fuerzaArt(c.rs2)}.` : "."));
  const lim = [`Son ${c.n} casos. Con tan pocos, una o dos ${U.pl} pueden cambiar el resultado.`,
    "Una correlación no prueba que una cosa cause la otra. Las dos pueden responder a otros factores que este cruce no mide.",
    U.prom,
    ...(Mx.periodo !== My.periodo ? [`Los períodos no coinciden: el dato de ${a.lx} es ${delPer(Mx.periodo)} y el de ${a.ly}, ${delPer(My.periodo)}.`] : []),
    ...(Math.abs(c.rs - c.rp) > .2 ? [`La correlación de Pearson, que pesa más los valores extremos, da ${rTxt(c.rp)}. La diferencia con la de Spearman indica que unos pocos casos influyen mucho.`] : []),
    ...a.limites];
  return {respuesta, bajada, extremos, excep, peso, lim, vx, vy};
}
const fuenteArt = m => m.fuente.includes(m.periodo) ? m.fuente : `${m.fuente} (${m.periodo})`;
const SEC = Object.fromEntries(SITIO.secciones.map(([id, t, p, x, herr, f, a, c]) => [id, {id, t, p, x, herr, f, a, c}]));
const nombreSec = id => SEC[id]?.t || "";
const tarjetaArt = a => `<a class="tarjeta art-card" href="${urlPagina(a.id)}"><span class="art-ico">${icono(a.icono)}</span>` +
  `<span class="art-txt"><b style="view-transition-name:t-${a.id}">${a.titulo}</b><small>${nombreSec(a.sec)}. ${a.frec}</small></span></a>`;
// título, ícono y sección de cada artículo: de la plantilla (data-titulo, data-ico y data-sec), por el índice del sitio
const DAT_ART = Object.fromEntries(SITIO.articulos.map(([id, titulo, icono, sec]) => [id, {titulo, icono, sec}]));
ART.forEach(a => { Object.assign(a, DAT_ART[a.id]); a.c = calcularArt(a); a.t = textoArt(a, a.c); });
ART.forEach(a => {
  const {c, t} = a, tabla = tablaArt(a), Mx = META_TAB[tabla][a.x], My = META_TAB[tabla][a.y], U = CASOS_ART[tabla], key = "art-" + a.id;
  const ficha = id => id && paginaDe(id) ? urlPagina(paginaDe(id), "#" + id) : null;
  const fichas = [...new Map([[Mx.ficha, Mx.nombre], [My.ficha, My.nombre]]).entries()].filter(([id]) => ficha(id));
  const [px] = partesU(a.ux), [py] = partesU(a.uy), fts = [...new Set([fuenteArt(Mx), fuenteArt(My)])];
  const nota = document.getElementById(a.id); if (!nota) return;
  nota.innerHTML =
    `<div class="nota-cab"><span class="nota-ico">${icono(a.icono)}</span><div><p class="nota-meta">${nombreSec(a.sec)}. ${a.frec}</p><h2 class="nota-tit" style="view-transition-name:t-${a.id}">${a.titulo}</h2></div></div>` +
    `<p class="nota-bajada"><mark>${t.respuesta}</mark> ${t.bajada}</p><p>${a.contexto}</p>` +
    `<div class="nota-graf"><h3>${Mx.nombre} ${yE(minusc(My.nombre))} por ${U.s}</h3><div class="grafico" data-g="${key}"></div>` +
    `<p class="nota-pie-graf">Cada punto es una ${U.s}. La línea punteada muestra la tendencia.</p></div>` +
    `<p>${t.extremos}</p><p>${t.excep}</p><p>${t.peso}</p>` +
    `<div class="nota-limites"><h2>Qué no dice este dato</h2><ul>${t.lim.map(l => `<li>${l}</li>`).join("")}</ul></div>` +
    `<div class="nota-fuentes"><p>${fts.length > 1 ? "Fuentes" : "Fuente"}: ${listaY(fts)}.</p><div class="acciones">` +
    fichas.map(([id, nom]) => `<a class="boton chico accion" href="${ficha(id)}">Ficha: ${nom.toLowerCase()}</a>`).join("") +
    (tabla === "cruces_provincias" ? `<a class="boton chico accion" href="cruces.html?cx=${a.x}&cy=${a.y}">Abrir en Cruces</a>` : "") +
    `<a class="boton chico accion" href="datos/${tabla}.csv" download>Descargar CSV</a></div></div>`;
  // en el gráfico van con nombre las jurisdicciones que menciona el texto
  DIB[key] = anim => dispersion(G(key), {anim, data: c.F, x: a.x, y: a.y, yAuto: a.yAuto, xLab: Mx.nombre, yLab: My.nombre,
    marcar: [c.arriba, c.abajo, c.cook].map(f => f.codigo_indec),
    fx: v => n0(v) + px, fy: v => n0(v) + py, vx: v => a.t.vx({[a.x]: v}), vy: v => a.t.vy({[a.y]: v})});
});
/* ---------- artículos con series del país (etapa 22): preguntas que se responden cruzando series en el tiempo ----------
   Las cifras salen del resumen (02_procesar.py las calcula sobre los trimestres) y las tablas de los gráficos se bajan aparte, al abrir el
   artículo. A mano van solo la pregunta (data-titulo en el marcado), el contexto y los límites propios, sin cifras. Las correlaciones se
   describen con la misma escala que los artículos de cruces, leída sobre el valor que se muestra, y la respuesta destacada sale de los datos.
   Para sumar uno: su nota en la plantilla, sus cifras en el resumen, sus tablas en DIFERIDAS y su entrada acá. */
const DL = R.dolar;
const r100 = r => Math.round(r * 100) / 100, fz = r => fuerzaArt(r100(r)), ab = r => Math.abs(r100(r));
const ORD_T = ["1.er", "2.º", "3.er", "4.º"], triCorto = r => `${ORD_T[r.trimestre - 1]} trim. ${r.anio}`;
const pctAbs = v => pct(Math.abs(v));
const PLURAL = {"fuerte": "fuertes", "moderada": "moderadas", "débil": "débiles", "casi nula": "casi nulas"};
// dos relaciones a la vez: "las dos relaciones son débiles" o "la primera relación es fuerte y la segunda, moderada"
const dosRel = (r1, r2) => fz(r1) === fz(r2) ? `las dos relaciones son ${PLURAL[fz(r1)]}` : `la primera relación es ${fz(r1)} y la segunda, ${fz(r2)}`;
const ART_SERIE = [{
  id: "a-dolar-inversion", frec: "Se actualiza cada trimestre", tablas: ["dolar_inversion_trimestral", "compras_dolares_anual"],
  dek: "El dólar en términos reales, la inversión en máquinas importadas y en construcción, lo que cuesta construir medido en dólares y las compras de dólares de personas y empresas.",
  fichas: [["f-isac", "actividad de la construcción"], ["f-costo", "costo de la construcción"], ["f-hipotecas", "créditos hipotecarios"]],
  csv: [["dolar_inversion_trimestral", "Descargar CSV por trimestre"], ["compras_dolares_anual", "Descargar CSV de las compras de dólares"]],
  fuentes: "Banco Central de la República Argentina, índice de tipo de cambio real multilateral, e INDEC y Banco Central vía API de Series de Tiempo: " +
    "inversión bruta interna fija (oferta y demanda globales), tipo de cambio de referencia (Comunicación \"A\" 3500) y balance cambiario",
  texto: () => {
    const d = DL, sin = d.primeros_hasta + 1;
    // la respuesta: las dos relaciones más claras (la parte importada de la inversión y la construcción del año siguiente), en toda la
    // serie y sin sus seis primeros años
    const full = Math.max(ab(d.rs_imp), ab(d.rs_sig)), sinP = Math.max(ab(d.rs_imp_sin), ab(d.rs_sig_sin));
    const respuesta = full < .4 ? "No hay un patrón claro." : sinP < .4 ? "En parte, y sobre todo en los primeros años de la serie." : "Sí, en general.";
    const dirImp = d.rs_imp < 0 ? "pesaron menos" : "pesaron más", dirSig = d.rs_sig < 0 ? "crecer más" : "crecer menos";
    const bajada = `Desde el ${d.desde}, con el dólar más caro en términos reales, las máquinas y equipos importados ${dirImp} en la inversión, ` +
      `y cuando construir fue más barato en dólares, la inversión en construcción tendió a ${dirSig} en el año siguiente. ` +
      `En toda la serie, ${dosRel(d.rs_imp, d.rs_sig)}, y desde ${sin}, ${dosRel(d.rs_imp_sin, d.rs_sig_sin)}. ` +
      `Cuánto se invierte en total, de un año a otro, tiene una relación ${fz(d.rs_var_total)} con lo que cambia el dólar.`;
    const contexto = "El tipo de cambio mueve los precios relativos. Con un dólar caro, lo que se trae de afuera cuesta más pesos, y lo que se hace en el país, " +
      `como una obra, cuesta menos dólares. Este artículo pone al lado, trimestre por trimestre desde ${d.desde_anio}, el dólar en términos reales, la inversión ` +
      "en máquinas y equipos y en construcción, lo que cuesta construir medido en dólares y las compras de dólares de personas y empresas.";
    // 1. el dólar real y lo que cuesta construir en dólares
    const extremo = (q, max, min, nom) => q === max ? `, el ${nom} más alto de la serie` : q === min ? `, el ${nom} más bajo de la serie` : "";
    const s1 = `El índice de tipo de cambio real multilateral del Banco Central compara los precios de la Argentina con los de sus principales socios comerciales, ` +
      `medidos en la misma moneda. Cuando sube, el dólar y las otras monedas están más caros frente a los precios del país. En el ${d.ult}, el índice estaba ` +
      `${pctAbs(d.itcrm_vs_prom)} ${d.itcrm_vs_prom < 0 ? "por debajo" : "por encima"} de su promedio desde ${d.desde_anio}${extremo(d.ult, d.itcrm_max, d.itcrm_min, "valor")}.` +
      (d.itcrm_max !== d.ult ? ` El más alto fue el del ${d.itcrm_max}` + (d.itcrm_min !== d.ult ? `, y el más bajo, el del ${d.itcrm_min}.` : ".") : ` El más bajo fue el del ${d.itcrm_min}.`) +
      ` Lo que cuesta construir medido en dólares ${ab(d.rs_espejo) >= .7 ? "va casi en espejo" : "tiende a moverse en sentido contrario"}: la correlación de Spearman entre los dos índices es de ${rTxt(d.rs_espejo)}, en una escala que va ` +
      `de menos 1 a 1. Es lo esperable, porque los dos comparan los precios del país con el dólar, en sentido contrario. En el ${d.ult}, construir costaba en dólares un ` +
      `${pctAbs(d.costo_vs_prom)} ${d.costo_vs_prom < 0 ? "menos" : "más"} que el promedio${extremo(d.ult, d.costo_max, d.costo_min, "valor")}.` +
      (d.costo_max !== d.ult ? ` El trimestre más caro fue el ${d.costo_max}.` : "");
    // 2. qué parte de la inversión va a equipos importados, y cuánto cambia la inversión con el dólar
    const sImp = ab(d.rs_imp) < .2 ? `La parte de la inversión que va a máquinas, equipos y vehículos importados casi no se mueve con el dólar real.`
      : `La parte de la inversión que va a máquinas, equipos y vehículos importados es mayor cuando el dólar está ${d.rs_imp < 0 ? "barato" : "caro"} en términos reales.`;
    const maxVar = Math.max(ab(d.rs_var_total), ab(d.rs_var_imp), ab(d.rs_var_nac), ab(d.rs_var_cons));
    const s2 = `${sImp} En el tercio de los trimestres con el dólar real más bajo, fue en promedio el ${pct(d.imp_dolar_barato)} de toda la inversión, y en el tercio ` +
      `con el dólar más alto, el ${pct(d.imp_dolar_caro)}. La correlación de Spearman es de ${rTxt(d.rs_imp)}, una relación ${fz(d.rs_imp)}, y desde ${sin} es de ` +
      `${rTxt(d.rs_imp_sin)}, una relación ${fz(d.rs_imp_sin)}. En el ${d.ult}, la parte importada era del ${pct(d.imp_ult)}.`;
    const s2b = `Frente al mismo trimestre del año anterior, la correlación entre lo que cambió el dólar real y lo que cambió la inversión es de ${rTxt(d.rs_var_total)} ` +
      `para la inversión total, de ${rTxt(d.rs_var_imp)} para los equipos importados, de ${rTxt(d.rs_var_nac)} para los nacionales y de ${rTxt(d.rs_var_cons)} ` +
      `para la construcción. ` + (maxVar < .2 ? "Con valores tan cerca de cero, el cambio del dólar casi no anticipa cuánto cambia la inversión ese año."
        : maxVar < .4 ? `Son relaciones débiles: cuando el dólar real sube, la inversión de ese año tiende a ${d.rs_var_total < 0 ? "caer" : "subir"}, con muchas excepciones.`
        : `Cuando el dólar real sube, la inversión de ese año tiende a ${d.rs_var_total < 0 ? "caer" : "subir"}.`);
    // 3. lo que cuesta construir en dólares y la construcción del año siguiente
    const cambio = v => `${v < 0 ? "cayó" : "creció"} ${pctAbs(v)}`;
    const s3 = (ab(d.rs_sig) < .2 ? `Lo que costaba construir en dólares casi no anticipa lo que pasó con la construcción en el año siguiente. `
      : `Cuando construir fue más barato en dólares, la inversión en construcción tendió a ${dirSig} en el año siguiente. `) +
      `En el tercio de los trimestres con la construcción más barata en dólares, la inversión en construcción ${cambio(d.sig_barato)} en los cuatro trimestres ` +
      `siguientes, si se toma el valor del medio de esos trimestres (la mediana). En el tercio intermedio ${cambio(d.sig_medio)} y en el más caro, ${cambio(d.sig_caro)}. ` +
      `La correlación de Spearman es de ${rTxt(d.rs_sig)}, una relación ${fz(d.rs_sig)}. ` +
      `Pero ${d.barato_primeros} de esos ${d.barato_n} trimestres más baratos son de ${d.desde_anio} a ${d.primeros_hasta}, los primeros años de la serie, después de la ` +
      `devaluación de 2002. Desde ${sin}, la correlación es de ${rTxt(d.rs_sig_sin)}, una relación ${fz(d.rs_sig_sin)}.`;
    // 4. las compras de dólares de personas y empresas
    const y = d.fae_ytd;
    const s4 = `En ${d.fae_anio}, las personas y las empresas compraron en neto ${n0(d.fae_ult)} millones de dólares en billetes y divisas en el mercado oficial de cambios` +
      (d.fae_max_anio === d.fae_anio ? `, el monto más alto desde ${d.fae_ini}.` : `. El año más alto desde ${d.fae_ini} fue ${d.fae_max_anio}, con ${n0(d.fae_max)} millones.`) +
      (y ? ` Entre enero y ${MESES[y.mes - 1]} de ${y.anio} compraron ${n0(y.millones)} millones, frente a ${n0(y.ant)} en los mismos meses de ${y.anio - 1}.` : "") +
      (d.fae_neg.length ? ` En ${listaY(d.fae_neg.map(String))}, vendieron más de lo que compraron.` : "") +
      ` Por trimestre, estas compras ${ab(d.rs_fae) < .2 ? "no muestran una relación con el nivel del dólar real" : `tienen una relación ${fz(d.rs_fae)} con el nivel del dólar real`} ` +
      `(la correlación de Spearman es de ${rTxt(d.rs_fae)}). En buena parte de estos años hubo límites para comprar dólares, que cambian cuánto se puede comprar.`;
    const lim = [`Son ${d.n} trimestres de una sola economía, y los trimestres seguidos no son casos independientes: una misma crisis o una misma recuperación pesa ` +
      "en varios a la vez, y eso puede hacer que una relación parezca más fuerte de lo que es.",
      "Una correlación no prueba que una cosa cause la otra. En los mismos trimestres cambiaron también la actividad, el crédito, las tasas de interés, los " +
      "impuestos y las reglas para comprar dólares.",
      "La pandemia de COVID-19 hizo caer la construcción en 2020 y rebotar en 2021: esos trimestres son los puntos más alejados del gráfico de la construcción. " +
      "La correlación de Spearman, que usa el orden de los valores y no su tamaño, pesa menos esos extremos.",
      "El índice de tipo de cambio real compara con una canasta de monedas de los principales socios comerciales, no solo con el dólar estadounidense, y usa " +
      "los tipos de cambio oficiales. Entre fines de 2011 y fines de 2015, y entre septiembre de 2019 y abril de 2025, las personas tuvieron límites para comprar " +
      "dólares al tipo de cambio oficial.",
      "Lo que cuesta construir en dólares es el índice de precios implícitos de la inversión en construcción del INDEC (lo invertido en construcción a precios de " +
      "cada año, dividido por lo mismo a precios de 2004), pasado a dólares con el tipo de cambio de referencia del Banco Central. No es el precio del metro " +
      "cuadrado de una vivienda.",
      "Las compras de dólares son las del mercado oficial de cambios que registra el Banco Central, del sector privado no financiero (personas, empresas e " +
      "inversores institucionales), en neto: compras menos ventas. " +
      "No dicen en qué se usaron esos dólares, si quedaron guardados, si se depositaron en un banco del país o si sirvieron para comprar una vivienda o hacer una obra.",
      "La inversión se mide en pesos de 2004, y el INDEC revisa los últimos trimestres en cada publicación."];
    return {respuesta, bajada, contexto, lim, secciones: [
      {g: "dolar-espejo", tit: "El dólar real y lo que cuesta construir en dólares, por trimestre", forma: "lineas",
        pie: `Índices, con el promedio desde ${d.desde_anio} = 100. Un índice más alto del dólar real es un dólar más caro frente a los precios del país.`, txt: [s1]},
      {g: "dolar-equipos", tit: "Parte de la inversión que va a máquinas y equipos importados, según el dólar real", forma: "puntos",
        pie: "Cada punto es un trimestre. La línea punteada muestra la tendencia. La inversión se mide en pesos de 2004.", txt: [s2, s2b]},
      {g: "dolar-construccion", tit: "Lo que cuesta construir en dólares y lo que cambia la construcción en el año siguiente", forma: "puntos",
        pie: `Cada punto es un trimestre: lo que costaba construir en dólares (promedio desde ${d.desde_anio} = 100) y cuánto cambió la inversión en construcción en los cuatro trimestres siguientes.`, txt: [s3]},
      {g: "dolar-compras", tit: "Compras netas de dólares de personas y empresas, por año", forma: "lineas",
        pie: "Millones de dólares de cada año: compras menos ventas de billetes y divisas del sector privado no financiero (personas, empresas e inversores institucionales) en el mercado oficial de cambios.", txt: [s4]},
    ]};
  },
  // los gráficos de cada sección, con las tablas del artículo ya cargadas
  dib: {
    "dolar-espejo": (el, a) => lineas(el, {anim: a, x: "t", y0: 0, vf: n0, yf: n0, xl: triCorto,
      data: T.dolar_inversion_trimestral.map(r => ({...r, t: r.anio + (r.trimestre - 1) / 4})),
      series: [{k: "indice_dolar_real", lab: "Dólar real", c: NAR}, {k: "indice_construccion_usd", lab: "Construir en dólares", c: FRI}]}),
    "dolar-equipos": (el, a) => dispersion(el, {anim: a, x: "itcrm", y: "pct_equipo_importado", yAuto: true,
      data: T.dolar_inversion_trimestral.map(r => ({...r, codigo_indec: r.periodo, territorio: triCorto(r)})),
      marcar: [T.dolar_inversion_trimestral.at(-1).periodo], xLab: "Dólar real (índice del Banco Central)", yLab: "Equipos importados, % de la inversión",
      fx: n0, fy: v => n0(v) + "%", vx: n1, vy: pct}),
    "dolar-construccion": (el, a) => dispersion(el, {anim: a, x: "indice_construccion_usd", y: "construccion_anio_siguiente", yAuto: true,
      data: T.dolar_inversion_trimestral.filter(r => r.construccion_anio_siguiente != null).map(r => ({...r, codigo_indec: r.periodo, territorio: triCorto(r)})),
      xLab: "Lo que cuesta construir en dólares (índice)", yLab: "Cambio de la construcción en el año siguiente",
      fx: n0, fy: v => n0(v) + "%", vx: n1, vy: v => (v > 0 ? "+" : "") + pct(v)}),
    "dolar-compras": (el, a) => lineas(el, {anim: a, x: "anio", y0: Math.min(0, d3.min(T.compras_dolares_anual, r => r.millones_usd)), ref: 0, vf: n0, yf: n0,
      data: T.compras_dolares_anual, series: [{k: "millones_usd", lab: "Compras netas", c: NAR}]}),
  },
}, {
  // etapa 24: el turismo internacional y el dólar real, mes por mes (SINTA y BCRA)
  id: "a-turismo-dolar", frec: "Se actualiza cada mes", tablas: ["turismo_dolar_mensual"],
  dek: "Cuántos turistas extranjeros llegan y cuántos residentes viajan al exterior, mes por mes, frente al dólar en términos reales.",
  fichas: [["f-receptivo", "turistas extranjeros"]],
  csv: [["turismo_dolar_mensual", "Descargar CSV por mes"]],
  fuentes: "Ministerio de Turismo y Deportes, SINTA, estimación de turismo internacional (viajes de turistas no residentes y residentes), y Banco Central " +
    "de la República Argentina, índices de tipo de cambio real multilateral y bilaterales",
  texto: () => {
    const t = R.turismo_dolar;
    const respuesta = ab(t.rs_llegan) >= .4 && ab(t.rs_salen) >= .4 ? "Sí, en general." : ab(t.rs_llegan) >= .4 || ab(t.rs_salen) >= .4 ? "En parte." : "No hay un patrón claro.";
    const salen = t.rs_salen < 0 ? "viajan menos" : "viajan más", llegan = t.rs_llegan > 0 ? "llegan más" : "llegan menos";
    const bajada = `Cuando el dólar real sube frente al mismo mes del año anterior, ${salen} residentes al exterior y ${llegan} turistas extranjeros: ` +
      `${dosRel(t.rs_salen, t.rs_llegan)}. Los meses de la pandemia, con las fronteras cerradas o con restricciones, no se cuentan.`;
    const contexto = "Un dólar caro abarata los viajes a la Argentina para quien llega con otra moneda y encarece los viajes al exterior para quien cobra " +
      "en pesos. Este artículo pone al lado, mes por mes, cuántos turistas extranjeros llegan, cuántos residentes viajan al exterior y el dólar en términos reales.";
    const dif = t.balanza_12m < 0 ? `salieron ${n0(-t.balanza_12m)} más de los que llegaron` : `llegaron ${n0(t.balanza_12m)} más de los que salieron`;
    const s1 = `En los doce meses hasta ${t.ult} llegaron ${n0(t.llegan_12m)} turistas extranjeros y viajaron al exterior ${n0(t.salen_12m)} residentes: ${dif}. ` +
      `Las llegadas fueron las más altas de la serie en los doce meses hasta ${t.llegan_12m_max_mes}, con ${n0(t.llegan_12m_max)}, y las salidas, en los doce meses ` +
      `hasta ${t.salen_12m_max_mes}, con ${n0(t.salen_12m_max)}. Entre ${t.pand_ini} y ${t.pand_fin} llegó menos de la mitad de los turistas que en el mismo mes ` +
      `de 2019. En ${t.tcr_ult}, el dólar real estaba ${pctAbs(t.tcr_vs_prom)} ${t.tcr_vs_prom < 0 ? "por debajo" : "por encima"} de su promedio desde ${t.desde}.`;
    const s2 = `Si se compara cada mes con el mismo mes del año anterior, cuando el dólar real sube, ${salen} residentes al exterior: la correlación de Spearman ` +
      `entre los dos cambios es de ${rTxt(t.rs_salen)}, una relación ${fz(t.rs_salen)}, en una escala que va de menos 1 a 1. Para las llegadas de turistas ` +
      `extranjeros es de ${rTxt(t.rs_llegan)}, una relación ${fz(t.rs_llegan)}. Con los meses de la pandemia adentro, las correlaciones son de ` +
      `${rTxt(t.rs_salen_con)} y de ${rTxt(t.rs_llegan_con)}. La balanza de los últimos doce meses, las llegadas menos las salidas, tiene una relación ` +
      `${fz(t.rs_balanza)} con el dólar real promedio de esos doce meses (${rTxt(t.rs_balanza)}): ` +
      (t.rs_balanza > 0 ? "con el dólar más caro, la diferencia se inclina hacia las llegadas." : "con el dólar más caro, la diferencia se inclina hacia las salidas.");
    const s3 = `${t.brasil_primero ? "Brasil es el país del que llegan más turistas" : "Brasil es uno de los países de los que llegan más turistas"}: fue el ` +
      `${pct(t.pct_brasil)} de las llegadas de los últimos doce meses. El tipo de cambio real con Brasil sube cuando la Argentina se abarata para quien viaja ` +
      `con reales. Frente al mismo mes del año anterior, la correlación entre lo que cambió ese tipo de cambio y lo que cambiaron las llegadas desde Brasil es de ` +
      `${rTxt(t.rs_brasil)}, una relación ${fz(t.rs_brasil)}. Con Chile es de ${rTxt(t.rs_chile)}, ${fz(t.rs_chile)}, y con Uruguay, de ${rTxt(t.rs_uruguay)}, ${fz(t.rs_uruguay)}.`;
    const lim = [`Los meses entre ${t.pand_ini} y ${t.pand_fin} quedaron fuera de las correlaciones principales: con las fronteras cerradas o con restricciones, ` +
      "los viajes no dependían del dólar. También quedaron afuera los meses que se comparan con uno de ese período. La ventana sale de los datos: son los meses " +
      "desde 2020 en que llegó menos de la mitad de los turistas que en el mismo mes de 2019, así que el mes en que empezaron a caer los viajes queda en las correlaciones.",
      "Son meses de una sola economía, y los meses seguidos no son casos independientes: una misma devaluación o una misma temporada pesa en varios a la vez.",
      "Una correlación no prueba que una cosa cause la otra. También cuentan los ingresos en cada país, los vuelos y los pasos de frontera, las temporadas y los feriados.",
      "El índice de tipo de cambio real usa los tipos de cambio oficiales. Entre fines de 2011 y fines de 2015, y entre septiembre de 2019 y abril de 2025, las " +
      "personas tuvieron límites para comprar dólares, y los gastos con tarjeta en el exterior tuvieron recargos e impuestos: lo que pagaba un turista podía estar lejos del tipo de cambio oficial.",
      "Se cuentan viajes de turistas, no personas: quien viaja dos veces en un año cuenta dos veces.",
      `Los datos desde ${t.provisorio_desde} son provisorios.`];
    return {respuesta, bajada, contexto, lim, secciones: [
      {g: "turismo-flujos", tit: "Turistas que llegan y que salen en los últimos doce meses", forma: "lineas",
        pie: `Viajes de turistas en los doce meses que terminan en cada mes, en millones. Las salidas de residentes empiezan en ${t.desde_salen}.`, txt: [s1]},
      {g: "turismo-salidas", tit: "Cuánto cambió el dólar real y cuánto cambiaron los viajes de residentes al exterior", forma: "puntos",
        pie: "Cada punto es un mes, frente al mismo mes del año anterior. Sin los meses de la pandemia. La línea punteada muestra la tendencia.", txt: [s2]},
      {g: "turismo-brasil", tit: "El tipo de cambio real con Brasil y los turistas que llegan desde Brasil", forma: "puntos",
        pie: "Cada punto es un mes, frente al mismo mes del año anterior. Sin los meses de la pandemia. La línea punteada muestra la tendencia.", txt: [s3]},
    ]};
  },
  dib: {
    "turismo-flujos": (el, a) => lineas(el, {anim: a, x: "t", y0: 0, vf: v => n1(v / 1e6) + " M", yf: v => v === 0 ? "0" : n0(v / 1e6) + " M", xl: r => mesPer(r.mes),
      data: T.turismo_dolar_mensual.filter(r => r.llegan_12m != null).map(r => ({...r, t: tPer(r.mes)})), mensual: true,
      series: [{k: "llegan_12m", lab: "Llegan", c: NAR}, {k: "salen_12m", lab: "Salen", c: FRI}]}),
    "turismo-salidas": (el, a) => {
      const data = T.turismo_dolar_mensual.filter(r => r.var_valida && r.var_salen != null && r.var_tcr_itcrm != null).map(r => ({...r, codigo_indec: r.mes, territorio: mesPer(r.mes)}));
      return dispersion(el, {anim: a, data, x: "var_tcr_itcrm", y: "var_salen", yAuto: true, marcar: [data.at(-1).mes],
        xLab: "Cambio del dólar real", yLab: "Cambio de los viajes al exterior", fx: v => n0(v) + "%", fy: v => n0(v) + "%",
        vx: v => (v > 0 ? "+" : "") + pct(v), vy: v => (v > 0 ? "+" : "") + pct(v)});
    },
    "turismo-brasil": (el, a) => {
      const data = T.turismo_dolar_mensual.filter(r => r.var_valida && r.var_llegan_brasil != null && r.var_tcr_brasil != null).map(r => ({...r, codigo_indec: r.mes, territorio: mesPer(r.mes)}));
      return dispersion(el, {anim: a, data, x: "var_tcr_brasil", y: "var_llegan_brasil", yAuto: true, marcar: [data.at(-1).mes],
        xLab: "Cambio del tipo de cambio real con Brasil", yLab: "Cambio de los turistas de Brasil", fx: v => n0(v) + "%", fy: v => n0(v) + "%",
        vx: v => (v > 0 ? "+" : "") + pct(v), vy: v => (v > 0 ? "+" : "") + pct(v)});
    },
  },
}, {
  // etapa 24: la nafta súper en dólares al tipo de cambio oficial y el petróleo Brent, mes por mes
  id: "a-nafta-dolares", frec: "Se actualiza cada mes", tablas: ["nafta_dolares_mensual", "nafta_dolares_anual"],
  dek: "El precio de la nafta súper en el surtidor medido en dólares al tipo de cambio oficial, frente al precio internacional del petróleo.",
  fichas: [["f-combustibles", "precio de los combustibles"]],
  csv: [["nafta_dolares_mensual", "Descargar CSV por mes"], ["nafta_dolares_anual", "Descargar CSV por año"]],
  fuentes: "Secretaría de Energía, precios en estaciones de servicio (Resolución 1104/2004), Banco Central de la República Argentina, tipo de cambio de " +
    "referencia (Comunicación \"A\" 3500), y Administración de Información Energética de los Estados Unidos (EIA), precio del petróleo Brent",
  texto: () => {
    const t = R.nafta_dolares, usd = v => n2(v), m = Math.max(ab(t.rs_var), ab(t.rs_nivel));
    const respuesta = m >= .6 ? "Sí, en general." : m >= .4 ? "En parte." : "No hay un patrón claro.";
    const bajada = `Al tipo de cambio oficial, cuando el petróleo Brent sube frente al mismo mes del año anterior, la nafta en dólares tiende a ` +
      `${t.rs_var > 0 ? "subir" : "bajar"}: la relación es ${fz(t.rs_var)}. Entre los precios de cada mes, la relación es ${fz(t.rs_nivel)}` +
      (ab(t.rs_nivel) < .4 ? ": hubo años con el petróleo caro y la nafta barata en dólares, y al revés." : ".");
    const contexto = "La nafta se hace con petróleo, que se compra y se vende en dólares en todo el mundo. En el precio del surtidor también pesan los impuestos, " +
      `la refinación, el transporte y la distribución. Este artículo compara, mes por mes desde ${t.desde}, el precio de la nafta súper medido en dólares al ` +
      "tipo de cambio oficial con el del petróleo Brent, una referencia internacional.";
    const s1 = `En ${t.ult}, el litro de nafta súper costaba ${n0(t.nafta)} pesos en la mediana de las estaciones del país: ${usd(t.nafta_usd)} dólares al tipo de ` +
      `cambio oficial de referencia. Un litro de petróleo Brent costaba ${usd(t.brent_litro)} dólares (${n2(t.brent)} el barril). Medida en dólares, la nafta ` +
      `fue la más cara en ${t.usd_max_mes}, con ${usd(t.usd_max)}, y la más barata en ${t.usd_min_mes}, con ${usd(t.usd_min)}.`;
    const s2 = `Si se compara cada mes con el mismo mes del año anterior, la correlación de Spearman entre lo que cambió el Brent y lo que cambió la nafta en ` +
      `dólares es de ${rTxt(t.rs_var)}, una relación ${fz(t.rs_var)}, en una escala que va de menos 1 a 1, y desde ${t.sin_desde}, de ${rTxt(t.rs_var_sin)}, ` +
      `${fz(t.rs_var_sin)}. Entre los precios de cada mes, sin compararlos con el año anterior, es de ${rTxt(t.rs_nivel)}, una relación ${fz(t.rs_nivel)}.`;
    const s3 = "Un litro de nafta cuesta más que un litro de petróleo, porque suma la refinación, los impuestos, el transporte y la distribución. Pero esa " +
      `diferencia cambió mucho: en ${t.veces_min_anio}, la nafta costó en promedio ${n1(t.veces_min)} veces lo que un litro de Brent, y en ${t.veces_max_anio}, ` +
      `${n1(t.veces_max)} veces. En ${t.veces_ult_anio} fueron ${n1(t.veces_ult)} veces. El año más caro de la nafta en dólares fue ${t.usd_anio_max_anio}, con ` +
      `${usd(t.usd_anio_max)} dólares por litro en promedio. En ${t.veces_ult_anio} costó ${usd(t.usd_anio_ult)}.`;
    const lim = ["El precio en dólares usa el tipo de cambio oficial de referencia del Banco Central (Comunicación \"A\" 3500). Entre fines de 2011 y fines de " +
      "2015, y entre septiembre de 2019 y abril de 2025, las personas tuvieron límites para comprar dólares, y con otros tipos de cambio el precio en dólares de esos años sería más bajo.",
      "Es la mediana de los precios que declaran las estaciones de servicio de todo el país para la nafta súper: la mitad cobraba más y la otra mitad, menos. " +
      "No es el precio de una estación ni de una marca.",
      "El Brent es un precio internacional de referencia, el del petróleo del Mar del Norte. El petróleo que procesan las refinerías del país puede tener otro precio.",
      "Una correlación no prueba que una cosa cause la otra, y los meses seguidos no son casos independientes: una misma devaluación pesa en varios a la vez.",
      "Los promedios de cada año cuentan solo los años completos."];
    return {respuesta, bajada, contexto, lim, secciones: [
      {g: "nafta-dolares", tit: "La nafta súper y el petróleo Brent, en dólares por litro", forma: "lineas",
        pie: "Dólares por litro. La nafta, al tipo de cambio oficial de referencia, mediana de las estaciones del país. El Brent, promedio de cada mes (un barril tiene 158,987 litros).", txt: [s1]},
      {g: "nafta-cambios", tit: "Cuánto cambió el petróleo y cuánto cambió la nafta en dólares", forma: "puntos",
        pie: "Cada punto es un mes, frente al mismo mes del año anterior. La línea punteada muestra la tendencia.", txt: [s2]},
      {g: "nafta-veces", tit: "Cuántas veces costó un litro de nafta lo que un litro de petróleo, por año", forma: "lineas",
        pie: "Promedio de cada año completo: la nafta en dólares dividida por el Brent por litro.", txt: [s3]},
    ]};
  },
  dib: {
    "nafta-dolares": (el, a) => lineas(el, {anim: a, x: "t", y0: 0, vf: n2, yf: n1, xl: r => mesPer(r.mes), mensual: true,
      data: T.nafta_dolares_mensual.map(r => ({...r, t: tPer(r.mes)})),
      series: [{k: "nafta_usd", lab: "Nafta súper", c: NAR}, {k: "brent_litro", lab: "Petróleo Brent", c: FRI}]}),
    "nafta-cambios": (el, a) => {
      const data = T.nafta_dolares_mensual.filter(r => r.var_brent != null && r.var_nafta_usd != null).map(r => ({...r, codigo_indec: r.mes, territorio: mesPer(r.mes)}));
      return dispersion(el, {anim: a, data, x: "var_brent", y: "var_nafta_usd", yAuto: true, marcar: [data.at(-1).mes],
        xLab: "Cambio del Brent", yLab: "Cambio de la nafta en dólares", fx: v => n0(v) + "%", fy: v => n0(v) + "%",
        vx: v => (v > 0 ? "+" : "") + pct(v), vy: v => (v > 0 ? "+" : "") + pct(v)});
    },
    "nafta-veces": (el, a) => lineas(el, {anim: a, x: "anio", y0: 0, vf: n1, yf: n0, data: T.nafta_dolares_anual,
      series: [{k: "veces", lab: "Veces", c: NAR}]}),
  },
}, {
  // etapa 24: las cantidades exportadas por rubro y el dólar real, trimestre por trimestre (INDEC y BCRA)
  id: "a-exportaciones-dolar", frec: "Se actualiza cada trimestre", tablas: ["exportaciones_dolar_trimestral", "exportaciones_cantidades_anual"],
  dek: "Las cantidades que exporta el país, sin el efecto de los precios, por gran rubro y trimestre por trimestre, frente al dólar en términos reales.",
  fichas: [["f-exportaciones", "exportaciones por provincia"]],
  csv: [["exportaciones_dolar_trimestral", "Descargar CSV por trimestre"], ["exportaciones_cantidades_anual", "Descargar CSV por año"]],
  fuentes: "INDEC, índices de valor, precio y cantidad de las exportaciones de bienes e intercambio comercial argentino, vía API de Series de Tiempo, y Banco " +
    "Central de la República Argentina, índices de tipo de cambio real multilateral y bilateral con Brasil",
  texto: () => {
    const t = R.exportaciones_dolar, rs = t.rs, mx = Math.max(ab(rs.total), ab(t.rs_moi_brasil));
    const respuesta = mx >= .4 ? "Sí, en general." : mx >= .2 ? "Apenas." : "No hay un patrón claro.";
    const sube = rs.total > 0 ? "crecer" : "caer";
    const bajada = `Cuando el dólar real sube frente al año anterior, las cantidades que exporta el país medio año después tienden a ${sube} ` +
      `un poco: la relación es ${fz(rs.total)}. En el mismo trimestre, la relación es ${fz(t.rs_mismo)}. Las cantidades de combustibles y de productos ` +
      "primarios cambiaron mucho en estos años, con el dólar caro o barato.";
    const contexto = "Con un dólar caro, lo que se produce en el país cuesta menos dólares en el exterior y cada dólar que se vende rinde más pesos. Pero " +
      "cuánto se exporta depende también de las cosechas, de los precios en el mundo, de lo que se puede producir y de los impuestos a las exportaciones. " +
      `Este artículo compara, trimestre por trimestre desde ${t.desde_anio}, las cantidades que exporta el país, sin el efecto de los precios, con el dólar ` +
      "en términos reales.";
    const P = t.pct;
    const s1 = `En los doce meses hasta ${t.doce_hasta}, el país exportó ${n0(t.doce_total)} millones de dólares: el ${pct(P.moa)} fueron manufacturas de ` +
      `origen agropecuario, el ${pct(P.moi)}, manufacturas de origen industrial, el ${pct(P.primarios)}, productos primarios, y el ${pct(P.combustibles)}, ` +
      `combustibles y energía. Medidas en cantidades, sin el efecto de los precios, las exportaciones de ${t.anio_ult} fueron ` +
      (t.total_max_anio === t.anio_ult ? `las más altas desde ${t.desde_anio}. ` : `menores que las de ${t.total_max_anio}, el año más alto desde ${t.desde_anio}. `) +
      `Las de combustibles se multiplicaron por ${n1(t.comb_veces)} desde ${t.comb_min_anio}, y las de productos primarios tuvieron su mayor caída en ` +
      `${t.pp_caida_anio}, cuando bajaron ${pctAbs(t.pp_caida)} frente al año anterior.`;
    const s2 = `Si se compara cada trimestre con el mismo del año anterior, la correlación de Spearman entre lo que cambió el dólar real medio año antes y ` +
      `lo que cambiaron las cantidades exportadas es de ${rTxt(rs.total)}, una relación ${fz(rs.total)}, en una escala que va de menos 1 a 1, y desde ` +
      `${t.sin_desde}, de ${rTxt(t.rs_sin)}. Con el dólar del mismo trimestre es de ${rTxt(t.rs_mismo)}, y con el de un año antes, de ${rTxt(t.rs_anio)}. ` +
      `Por rubro, con medio año de rezago, es de ${rTxt(rs.primarios)} en los productos primarios, de ${rTxt(rs.moa)} en las manufacturas de origen ` +
      `agropecuario, de ${rTxt(rs.moi)} en las de origen industrial y de ${rTxt(rs.combustibles)} en los combustibles.`;
    const s3 = "Brasil es uno de los principales socios comerciales del país. Con el tipo de cambio real con Brasil de medio año antes, la relación de las " +
      `manufacturas de origen industrial es de ${rTxt(t.rs_moi_brasil)}, una relación ${fz(t.rs_moi_brasil)}` +
      (ab(t.rs_moi_brasil) > ab(rs.moi) ? `, algo más marcada que con el dólar real multilateral (${rTxt(rs.moi)})` : `, frente a ${rTxt(rs.moi)} con el dólar real multilateral`) +
      `, y desde ${t.sin_desde}, de ${rTxt(t.rs_moi_brasil_sin)}.`;
    const lim = ["Son trimestres de una sola economía, y los trimestres seguidos no son casos independientes: una misma crisis o una misma cosecha pesa en varios a la vez.",
      "Una correlación no prueba que una cosa cause la otra. En los mismos años cambiaron las cosechas, los precios internacionales, la producción de petróleo " +
      "y gas, los impuestos a las exportaciones y las reglas para cobrar los dólares de lo que se exporta.",
      "El índice de tipo de cambio real usa los tipos de cambio oficiales. En algunos períodos, los exportadores pudieron cobrar parte de sus ventas a tipos " +
      "de cambio distintos del oficial.",
      "Los índices de cantidad del INDEC son trimestrales, con 2004 = 100, y el INDEC revisa los últimos trimestres en cada publicación.",
      "La parte de cada rubro en las exportaciones se mide en dólares, así que cambia también con los precios internacionales."];
    return {respuesta, bajada, contexto, lim, secciones: [
      {g: "export-cantidades", tit: "Cantidades exportadas por gran rubro, promedio de cada año", forma: "lineas",
        pie: `Índices de cantidad del INDEC, ${t.desde_anio} = 100, sin el efecto de los precios. Años completos.`, txt: [s1]},
      {g: "export-dolar", tit: "Cuánto cambió el dólar real medio año antes y cuánto cambiaron las cantidades exportadas", forma: "puntos",
        pie: "Cada punto es un trimestre, frente al mismo trimestre del año anterior. La línea punteada muestra la tendencia.", txt: [s2]},
      {g: "export-brasil", tit: "El tipo de cambio real con Brasil y las manufacturas de origen industrial", forma: "puntos",
        pie: "Cada punto es un trimestre: el cambio del tipo de cambio real con Brasil de medio año antes y el de las cantidades de manufacturas de origen industrial exportadas.", txt: [s3]},
    ]};
  },
  dib: {
    "export-cantidades": (el, a) => lineas(el, {anim: a, x: "anio", y0: 0, vf: n0, yf: n0, data: T.exportaciones_cantidades_anual,
      series: [{k: "primarios", lab: "Productos primarios", c: NAR}, {k: "moa", lab: "Manufacturas agropecuarias", c: FRI},
        {k: "moi", lab: "Manufacturas industriales", c: css("--azul-hondo")}, {k: "combustibles", lab: "Combustibles", c: css("--sol-borde")}]}),
    "export-dolar": (el, a) => {
      const data = T.exportaciones_dolar_trimestral.filter(r => r.var_tcr_antes != null && r.var_total != null).map(r => ({...r, codigo_indec: r.periodo, territorio: triCorto(r)}));
      return dispersion(el, {anim: a, data, x: "var_tcr_antes", y: "var_total", yAuto: true, marcar: [data.at(-1).periodo],
        xLab: "Cambio del dólar real, medio año antes", yLab: "Cambio de las cantidades exportadas", fx: v => n0(v) + "%", fy: v => n0(v) + "%",
        vx: v => (v > 0 ? "+" : "") + pct(v), vy: v => (v > 0 ? "+" : "") + pct(v)});
    },
    "export-brasil": (el, a) => {
      const data = T.exportaciones_dolar_trimestral.filter(r => r.var_tcr_brasil_antes != null && r.var_moi != null).map(r => ({...r, codigo_indec: r.periodo, territorio: triCorto(r)}));
      return dispersion(el, {anim: a, data, x: "var_tcr_brasil_antes", y: "var_moi", yAuto: true, marcar: [data.at(-1).periodo],
        xLab: "Cambio del tipo de cambio real con Brasil, medio año antes", yLab: "Cambio de las manufacturas industriales", fx: v => n0(v) + "%", fy: v => n0(v) + "%",
        vx: v => (v > 0 ? "+" : "") + pct(v), vy: v => (v > 0 ? "+" : "") + pct(v)});
    },
  },
}];
ART_SERIE.forEach(a => {
  Object.assign(a, DAT_ART[a.id]);
  const nota = document.getElementById(a.id); if (!nota) return;
  const t = a.texto(), ficha = id => id && paginaDe(id) ? urlPagina(paginaDe(id), "#" + id) : null;
  nota.innerHTML =
    `<div class="nota-cab"><span class="nota-ico">${icono(a.icono)}</span><div><p class="nota-meta">${nombreSec(a.sec)}. ${a.frec}</p><h2 class="nota-tit" style="view-transition-name:t-${a.id}">${a.titulo}</h2></div></div>` +
    `<p class="nota-bajada"><mark>${t.respuesta}</mark> ${t.bajada}</p><p>${t.contexto}</p>` +
    t.secciones.map(s => `<div class="nota-graf"><h3>${s.tit}</h3><div class="grafico" data-g="art-${s.g}" data-forma="${s.forma}"></div>` +
      `<p class="nota-pie-graf">${s.pie}</p></div>` + s.txt.map(p => `<p>${p}</p>`).join("")).join("") +
    `<div class="nota-limites"><h2>Qué no dice este dato</h2><ul>${t.lim.map(l => `<li>${l}</li>`).join("")}</ul></div>` +
    `<div class="nota-fuentes"><p>Fuentes: ${a.fuentes}.</p><div class="acciones">` +
    a.fichas.filter(([id]) => ficha(id)).map(([id, nom]) => `<a class="boton chico accion" href="${ficha(id)}">Ficha: ${nom}</a>`).join("") +
    a.csv.map(([n, lab]) => `<a class="boton chico accion" href="datos/${n}.csv" download>${lab}</a>`).join("") + `</div></div>`;
  Object.entries(a.dib).forEach(([g, f]) => { DIB["art-" + g] = conTablas("art-" + g, a.tablas, anim => f(G("art-" + g), anim)); });
});
// todos los artículos, primero los de series (los más nuevos)
const ARTS = [...ART_SERIE, ...ART];
const artGrid = document.getElementById("art-grid");
if (artGrid) artGrid.innerHTML = ARTS.map(tarjetaArt).join("");
const artHome = document.getElementById("art-grid-home");
if (artHome) artHome.innerHTML = ARTS.slice(0, 3).map(tarjetaArt).join("");   // una fila: el resto, en "Todos los artículos"

/* portada: tres destacados. El artículo destacado es el de la relación más marcada */
const destGrid = document.getElementById("dest-grid");
// el gorro frigio de la marca, en un botón redondo: invita a entrar sin usar una flecha genérica

const pintarDestacados = () => {
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
};
if (destGrid) { pintarDestacados(); alCambiarProv.push(pintarDestacados); }

/* Sobre nosotros: cifras contadas en el propio sitio */
const NFICHAS = SITIO.fichas.filter(f => !f[5]).length;
const nosCifras = document.getElementById("nos-cifras");
if (nosCifras) {
  const temas = SITIO.secciones.filter(s => !s[4] && s[0] !== "articulos").length;
  nosCifras.innerHTML = [[NFICHAS, "fichas con su tabla"], [24, "jurisdicciones"],
    [temas, "secciones temáticas"], [ARTS.length, "artículos de cruces"]].map(([n, t]) => `<div class="nos-cifra"><b>${n}</b><span>${t}</span></div>`).join("");
}

/* recuadro de estado de la portada */
const estado = document.getElementById("estado");
if (estado) estado.innerHTML = [`${NFICHAS} fichas`, "24 jurisdicciones", `${ARTS.length} artículos`].map(t => `<span>${t}</span>`).join(" ");

/* Enlaces a fichas que viven en otra página (perfil provincial, preguntas, cruces): llevan a esa página */
document.querySelectorAll('a[href^="#"]').forEach(a => { const u = destinoDe(a.getAttribute("href")); if (u) a.href = u; });
document.addEventListener("click", ev => {
  const a = ev.target.closest?.('a[href^="#"]');
  const u = a && destinoDe(a.getAttribute("href"));
  if (u && !ev.ctrlKey && !ev.metaKey && !ev.shiftKey) { ev.preventDefault(); location.href = u; }
});

/* portada: una tarjeta por sección */
// ícono de cada página (secciones, tu provincia y artículos): lo pone el constructor, que también lo usa en el final de página
const SEC_ICONO = /*SEC_ICONO*/{};
const grillaSec = document.getElementById("secciones-grid");
const tarjetaSec = sec => {
  const n = sec.f, na = sec.a;
  return `<a class="tarjeta sec-tarjeta${sec.herr ? " herr" : ""}" href="${urlPagina(sec.id)}">${icono(SEC_ICONO[sec.id], "sec-ico")}` +
    `<span class="sec-tipo">${sec.herr ? "Herramienta" : na ? na + " artículos" : n === 1 ? "1 ficha" : n + " fichas"}</span>` +
    `<b style="view-transition-name:t-${sec.id}">${sec.t}</b><span class="sec-preg">${sec.c || sec.p}</span></a>`;
};
// en la tarjeta va la pregunta corta de la sección, si tiene una (data-corta en la plantilla)
// sin la tarjeta de Artículos, que tienen su bloque más arriba. Con las 14 secciones (Petróleo y gas volvió a tener su página en la
// etapa 22) ninguna fila queda con una sola tarjeta, en ningún ancho: por eso "Tu provincia", que se sumó cuando eran 13 para llegar a
// 14, ya no va en la grilla (se llega por el primer destacado, "Elegí tu provincia" y el menú)
if (grillaSec) grillaSec.innerHTML = Object.values(SEC).filter(s => !s.herr && s.id !== "articulos").map(tarjetaSec).join("");
// Mostrar menos de entrada (octubre de 2026): dos filas de secciones y un botón que despliega el resto en el lugar. Las tarjetas
// ocultas siguen en la página: solo las esconde el CSS, con la cantidad justa para cada ancho (dos filas de 4, 3 o 2)
if (grillaSec) {
  grillaSec.classList.add("plegada");
  grillaSec.insertAdjacentHTML("afterend", `<button type="button" class="boton ver-todas" aria-expanded="false" aria-controls="secciones-grid">Ver todas las secciones</button>`);
  const bTodas = grillaSec.nextElementSibling;
  bTodas.addEventListener("click", () => {
    const antes = new Set([...grillaSec.children].filter(t => t.offsetParent));
    const abrir = grillaSec.classList.contains("plegada");
    grillaSec.classList.toggle("plegada", !abrir);
    bTodas.setAttribute("aria-expanded", String(abrir)); bTodas.textContent = abrir ? "Ver menos secciones" : "Ver todas las secciones";
    if (abrir) [...grillaSec.children].filter(t => !antes.has(t)).forEach((t, k) =>
      t.animate(REDUCIR ? [{opacity: 0}, {opacity: 1}] : [{opacity: 0, transform: "translateY(8px)"}, {opacity: 1, transform: "none"}],
        {duration: 250, delay: Math.min(150, k * 30), easing: "cubic-bezier(.23,1,.32,1)", fill: "backwards"}));
  });
}
const grillaHerr = document.getElementById("herramientas-grid");
if (grillaHerr) grillaHerr.innerHTML = Object.values(SEC).filter(s => s.herr).map(tarjetaSec).join("");

/* La respuesta primero (idea de USAFacts): las cifras clave de la sección arriba, antes de la explicación.
   Salen de EN_CIFRAS (ver arriba) y del perfil provincial (INDP), así que no hay cifras nuevas escritas a mano y el suicidio queda afuera.
   Con una provincia elegida, sus indicadores reemplazan a la cifra del país de la misma ficha. Siempre cinco tarjetas (etapa 15). */
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
      // sin bandera (etapa 30): la de la provincia elegida ya está en la barra, y el nombre distingue sus tarjetas de las del país
      tarjetas.push(`<a class="tarjeta cifra prov" href="#${c.id}" data-k="p:${INDP.indexOf(c)}"><span class="c-lab">${NOMBRES[prov]}</span><span class="c-num">${c.f(fila[c.k])}</span>` +
        `<span class="c-txt">${c.lab}: ${c.det}.${c.pais == null ? "" : ` País: ${c.f(c.pais)}.`} Posición ${orden} de ${c.d.length}, de mayor a menor.</span>` +
        (notaDist(c, prov) ? `<span class="c-aclara">${notaDist(c, prov)}</span>` : "") + `</a>`);
    });
    // las cifras del país: una cifra destacada (CLAVE) se saca si su ficha ya muestra la de la provincia, y una de EXTRA solo si es la versión del país
    const pais = orden.map(k => k.startsWith("x-") ? EXTRA[k] && {k, id: EXTRA[k][0], n: EXTRA[k][1], t: EXTRA[k][2], prov: EXTRA[k][3]} : CLAVE[k] && {k, id: k, n: CLAVE[k][0], t: CLAVE[k][1], prov: true})
      .filter(c => c && ids.has(c.id) && !(c.prov && conProv.has(c.id)));
    const lugar = conProv.size ? 5 - tarjetas.length : indp.length ? 4 : 5;
    const marca = conProv.size ? `<span class="c-lab">Todo el país</span>` : "";
    pais.slice(0, Math.max(0, lugar)).forEach(c => tarjetas.push(`<a class="tarjeta cifra" href="#${c.id}" data-k="${c.k}">${marca}<span class="c-num">${c.n}</span><span class="c-txt">${c.t}</span></a>`));
    if (!conProv.size && indp.length)
      tarjetas.push(`<a class="tarjeta cifra invita" href="provincia.html"><span class="c-lab">Tu provincia</span><span class="c-txt">Elegí una provincia para ver sus datos de esta sección junto a los del país.</span></a>`);
    intro.insertAdjacentHTML("afterend", `<div class="en-cifras"><h3>En cifras</h3><div class="cifras-grid">${tarjetas.slice(0, 5).join("")}</div></div>`);
  }
};
/* Minigráfico de cada tarjeta de "En cifras" (etapa 16, idea de un tablero que compartió el autor). Resuelve lo que en octubre de 2026
   descartó los minigráficos dentro de las tarjetas (a 48 x 18 píxeles no se leían): al pasar el mouse por una tarjeta, o con el foco del
   teclado, un cuadro más grande muestra la serie del país de esa cifra (hasta diez datos, con el de la tarjeta resaltado en amarillo) o,
   si la ficha solo tiene datos por provincia, las 24 provincias ordenadas con la línea del país. En las pantallas táctiles no aparece:
   tocar la tarjeta lleva a la ficha. Las tarjetas sin datos para eso (por ejemplo las de Política, salvo los ATN) no muestran nada. */
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
  // gobierno (etapa 25)
  "f-cuentas-nacion": () => serieM("Resultado primario del Sector Público Nacional, % del PBI", GBN.mini, pct),
  "f-recaudacion": () => serieM("Recaudación de impuestos nacionales, % del PBI", T.recaudacion_anual.map(r => [r.anio, r.total_pbi]), pct),
  "f-deuda": () => serieM("Deuda bruta de la Administración Central, % del PBI", T.deuda_pbi.map(r => [r.periodo.includes("T") ? `${r.periodo[0]}T ${r.periodo.slice(2)}` : r.periodo, r.pct_pbi]), pct),
  "f-empleo-publico": () => provM(`Cargos en la administración provincial cada 1.000 habitantes, ${GBC.anio}`, T.empleo_publico_provincias, "cada_1000", GBC.cada_1000, n1),
  "f-impuestos-provinciales": () => provM(`Impuestos provinciales, pesos por habitante, ${GBP.anio}`, T.impuestos_provinciales, "por_habitante", GBP.pais, n0),
  // migraciones (etapa 25)
  "f-nacidos-otro-pais": () => provM("Personas nacidas en otro país, % de la población, 2022", T.nacidos_otro_pais_provincias, "pct_otro_pais", MGC.pct, pct),
  "f-migracion-interna": () => provM("Personas nacidas en otra provincia, % de la población, 2022", T.nacidos_otro_pais_provincias, "pct_otra_provincia", MGC.otra_pct, pct),
  "f-migracion-historia": () => serieM("Personas nacidas en otro país, % de la población de cada censo", T.migracion_censos.map(r => [r.anio, r.nacidos_otro_pais_pct]),
    pct, 11, MGH.max_anio),
  "f-radicaciones": () => serieM("Residencias otorgadas por año", T.radicaciones_anual.map(r => [r.anio, r.total]), n0),
  "f-argentinos-exterior": () => serieM("Personas nacidas en la Argentina que viven en otro país", T.argentinos_exterior.map(r => [r.anio, r.personas]), n0),
  // economía y precios (etapa 25): los últimos diez meses de cada cifra
  "f-inflacion": () => serieM("Inflación en doce meses, mes a mes", EIP.mini_ia.map(([p, v]) => [mesCorto(p), v]), pct),
  "x-inflacion-mes": () => serieM("Inflación de cada mes", EIP.mini_m.map(([p, v]) => [mesCorto(p), v]), pct),
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
  "f-trabajadores": () => provM("Personas ocupadas en la construcción, % de las ocupadas, Censo 2022", T.vivienda_provincias, "pct_ocupados_construccion", VV.pct_ocupados_construccion, pct),
  "f-costo": () => serieM("Costo de la construcción dividido por los precios al consumidor, diciembre de cada año y el último mes", T.costo_anual.map(r => [r.periodo.endsWith("-12") ? r.periodo.slice(0, 4) : MESES[+r.periodo.slice(5, 7) - 1].slice(0, 3) + " " + r.periodo.slice(2, 4), r.icc_real]), n1),
  "f-vivienda": () => provM("Hogares que alquilan, en %, Censo 2022", T.vivienda_provincias, "pct_alquila", VV.pct_alquila, pct),
  "x-viviendas-construccion": () => provM("Viviendas en construcción cada 1.000 viviendas, Censo 2022", T.vivienda_provincias, "construccion_cada_1000", VV.construccion_cada_1000, n1),
  "f-empleo": () => provM("Asalariados privados registrados cada 100 habitantes", T.empleo_provincias, "cada_100", R.empleo.cada_100_pais, n1),
  "f-exportaciones": () => provM("Dólares exportados por habitante", T.exportaciones_provincias, "usd_por_habitante", nv.ex_pc_pais, n0),
  "f-fiscal": () => provM("Recursos propios, en % de los ingresos de cada provincia", T.fiscal_provincias, "autonomia", null, pct),
  "f-empresas": () => provM("Empresas privadas con empleados cada 1.000 habitantes", T.empresas_provincias, "cada_1000_hab", EM.pais_1000, n1),
  "x-emp-top": () => SERIE_CIFRA["f-empresas"](),
  "f-dinamica-empresas": () => serieM("Saldo de empresas por año: aperturas menos cierres, en % del total", T.empresas_serie_pais.map(r => [r.anio, r.tasa_neta]), sg),
  "x-emp-saldo": () => SERIE_CIFRA["f-dinamica-empresas"](),
  "x-emp-negativos": () => SERIE_CIFRA["f-dinamica-empresas"](),
  "f-pobreza": () => serieM("Pobreza en los 31 aglomerados urbanos, por semestre", T.pobreza_serie.map(r => [semCorto(r), r.pobreza_personas]), pct, 8),
  "x-indigencia": () => serieM("Indigencia en los 31 aglomerados urbanos, por semestre", T.pobreza_serie.map(r => [semCorto(r), r.indigencia_personas]), pct, 8),
  "f-censo": () => provM("Hogares con desagüe a red cloacal, en %, Censo 2022", T.censo2022_provincias, "cloaca", nv.censo.cloaca, pct),
  "f-internet": () => provM("Accesos a internet fijo cada 100 hogares", T.internet_fijo_provincias, "accesos_100_hogares", null, n1),
  "f-esperanza": () => provM(`Esperanza de vida al nacer, en años, ${nv.ev_anio}`, T.esperanza_vida_provincias, "total", nv.ev_pais, n1),
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
  "x-vejez": () => serieM("Personas de 65 años o más cada 100 de 15 a 64, proyección del INDEC",
    T.envejecimiento_pais.filter(r => (r.anio - T.envejecimiento_pais[0].anio) % 2 === 0 || r.anio === EV.anio).map(r => [r.anio, r.vejez]), n1, 12, EV.anio),
  "x-jubilaciones": () => serieM("Aportantes por cada jubilación o pensión de ANSES, por año", T.jubilaciones_aportantes.map(r => [r.anio, r.aportantes_por_beneficio]), n2),
  "f-extranjeros": () => provM("Personas nacidas en otro país cada 100 habitantes", T.extranjeros_provincias, "cada_100", nv.xt_pais, n1),
  "x-representacion": () => provM("Habitantes por banca de diputado", T.representacion_provincias, "hab_por_diputado", TOT_DIP, n0),
  "x-atn": () => serieM(`Aportes del Tesoro Nacional por año, en miles de millones de pesos de ${TRR.ult}`, T.transferencias_serie.map(r => [r.anio, r.atn]), n0),
  "f-sube": () => serieM("Tarjetas SUBE por día hábil, en millones, por mes", T.sube_dia_habil.map(r => [mesCorto(r.periodo), r.total == null ? null : r.total / 1e6]), n2),
  "x-sube-var": () => SERIE_CIFRA["f-sube"](),
  "f-sube-modos": () => serieM("Tarjetas SUBE en trenes por día hábil, en miles, por mes", T.sube_dia_habil.map(r => [mesCorto(r.periodo), r.tren == null ? null : r.tren / 1e3]), n0),
  "f-patentes": () => serieM("Motos nuevas inscriptas por año", T.patentamientos_anual.map(r => [r.anio, r.motos]), n0),
  "f-patentes-prov": () => provM("Autos nuevos cada 1.000 habitantes", T.patentamientos_provincias, "autos_1000", au.pais_1000, n1),
  "f-combustibles": () => provM(`Nafta súper, pesos por litro, mediana de las estaciones, ${CB.mes}`, T.combustibles_provincias, "nafta", CB.nafta, n0),
  "f-hogares": () => serieM("Parte de la demanda eléctrica de los hogares, por año", T.energia_hogares.map(r => [r.anio, r.pct_residencial]), pct),
  "x-hogares-crec": () => serieM(`Demanda eléctrica de los hogares, índice ${T.energia_hogares[0].anio} = 100`, T.energia_hogares.map(r => [r.anio, r.idx_residencial]), n0),
  "f-actividad": () => serieM(`Demanda eléctrica total, índice ${T.energia_hogares[0].anio} = 100`, T.energia_hogares.map(r => [r.anio, r.idx_demanda]), n0),
  "x-demanda-total": () => serieM("Demanda eléctrica total por año, en gigavatios hora", T.energia_hogares.map(r => [r.anio, r.total]), n0),
  "x-demanda-ytd": () => SERIE_CIFRA["x-demanda-total"](),
  "f-meses": () => serieM("Demanda eléctrica por mes, en gigavatios hora", T.energia_estacionalidad.map(r => [MESES[r.mes - 1].slice(0, 3), r.gwh]), n0, 12, e.mes_max.slice(0, 3)),
  "f-receptivo": () => serieM("Turistas no residentes por año, en millones", T.turistas_no_residentes_anual.map(r => [r.anio, r.turistas / 1e6]), n1),
  "x-turistas-doce": () => SERIE_CIFRA["f-receptivo"](),
  "f-hoteles": () => serieM("Viajeros en hoteles y parahoteles por año, en millones", T.viajeros_hoteles_anual.map(r => [r.anio, r.total / 1e6]), n1),
  "x-hoteles-nr": () => serieM("Viajeros en hoteles que no residen en el país, en % del total", T.viajeros_hoteles_anual.map(r => [r.anio, r.no_residentes / r.total * 100]), pct),
  "f-eti": () => provM("Turistas extranjeros cada 1.000 habitantes", T.turistas_extranjeros_provincias, "cada_1000", null, n1),
  "f-protegida": () => provM("Territorio dentro de áreas protegidas, en %", T.areas_protegidas_provincias, "pct_territorio", nt.pct, pct),
  "f-parques": () => serieM("Áreas protegidas nacionales, por año", T.parques_nacionales_historia.map(r => [r.anio, r.areas]), n0),
  "f-visitas": () => serieM("Visitas a parques nacionales por año, en millones", T.visitas_parques_nacionales.map(r => [r.anio, r.total / 1e6]), n1),
  "f-pesca": () => serieM("Pescados y mariscos desembarcados por año, en toneladas", T.desembarques_especies.map(r => [r.anio, r.Total]), n0),
  "f-carne": () => serieM("Carne vacuna por habitante, en kilos por año", T.carne_vacuna.map(r => [r.anio, r.kg_por_habitante]), n1),
  "f-vino": () => serieM("Vino vendido en el país, en millones de litros por año", T.vino_mercado_interno.map(r => [r.anio, r.millones_litros]), n0),
  "f-yerba": () => serieM("Yerba mate que salió de los molinos, en millones de kilos por año", T.yerba_molino.map(r => [r.anio, r.millones_kg]), n1),
  "f-clima": () => serieM("Desvío de la temperatura media anual respecto de la referencia del SMN, en °C", T.clima_desvio.map(r => [r.anio, r.desvio_temperatura]), grados, 10, cu.cl_max_anio),
};
// la tarjeta de una provincia elegida: sus 24 valores, con la provincia resaltada
const miniIndp = i => { const c = INDP[i]; return c && provM(`${c.lab}: ${c.det}`, c.d, c.k, c.pais, c.f); };
// el dibujo: barras de una serie (la de la tarjeta en amarillo, con su valor) o las 24 provincias ordenadas, con la línea del país
function htmlMini(o) {
  const W = 252, H = 92, top = 16, base = H - 16, esc2 = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;"})[c]);
  if (o.prov) {
    // un punto por provincia, ordenadas de mayor a menor: sin barras, la escala no necesita empezar en cero y se ven las diferencias
    // aunque los valores estén cerca (la esperanza de vida va de 72 a 79 años)
    const d = [...o.prov].sort((a, b) => b.v - a.v), n = d.length, paso = (W - 12) / (n - 1);
    const vs = d.map(x => x.v).concat(o.pais == null ? [] : [o.pais]), lo = d3.min(vs), hi = d3.max(vs), pad = (hi - lo) * .08 || 1;
    const y = v => base - (v - lo + pad) / (hi - lo + 2 * pad) * (base - top);
    const barras = d.map((x, i) => `<circle cx="${(6 + i * paso).toFixed(1)}" cy="${y(x.v).toFixed(1)}" r="${x.c === prov ? 4.5 : 3}" class="${x.c === prov ? "mini-hl" : "mini-b"}"/>`).join("");
    const linea = o.pais == null ? "" : `<line x1="0" x2="${W}" y1="${y(o.pais).toFixed(1)}" y2="${y(o.pais).toFixed(1)}" class="mini-pais"/>`;
    const elegida = prov && d.find(x => x.c === prov);
    const pie = `Más alto: ${esc2(NOMBRES[d[0].c])} (${o.f(d[0].v)}). Más bajo: ${esc2(NOMBRES[d[n - 1].c])} (${o.f(d[n - 1].v)}).` +
      (o.pais != null ? ` País: ${o.f(o.pais)}${linea ? ", la línea punteada" : ""}.` : "") + (elegida ? ` En amarillo, ${esc2(NOMBRES[prov])} (${o.f(elegida.v)}).` : "");
    return `<span class="mini-tit">${esc2(o.tit)}. Las 24 provincias, de mayor a menor</span><svg class="mini" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true">${barras}${linea}</svg><span class="mini-pie">${pie}</span>`;
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
    // arriba de la tarjeta, o debajo si arriba no entra (la barra fija ocupa los primeros 72 píxeles)
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
  // al bajar por la página el cuadro se cierra, salvo que la tarjeta tenga el foco del teclado (el navegador corre la página al darle
  // el foco para que no quede debajo de la barra): ahí el cuadro se reacomoda
  let cuadro = 0;
  addEventListener("scroll", () => {
    if (!actual) return;
    if (actual !== document.activeElement) return ocultar();
    cancelAnimationFrame(cuadro); cuadro = requestAnimationFrame(() => actual && ver(actual));
  }, {passive: true});
})();
if (PAGINA !== "inicio") {
  pintarCifras(); alCambiarProv.push(pintarCifras);
  // en el celular, la fila de secciones (la escribe el constructor) se desliza hasta la actual
  const cur = document.querySelector(".pildoras [aria-current]");
  if (cur) requestAnimationFrame(() => { cur.parentElement.scrollLeft = cur.offsetLeft - 22; });
}

/* buscador de la lupa: secciones, fichas, preguntas y artículos de todo el sitio (cada página tiene todo el marcado) */
(() => {
  const btn = document.getElementById("lupa-btn"), caja = document.getElementById("buscador");
  const ent = document.getElementById("busca"), res = document.getElementById("busca-res");
  if (!btn) return;
  const st = t => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const ir = (id, hash) => { const p = paginaDe(id); return p === PAGINA ? hash : urlPagina(p, hash); };
  let IDX;
  const armar = () => {
    IDX = [];
    Object.values(SEC).forEach(t => IDX.push({t: t.t, s: t.herr ? "Herramienta" : "Sección", u: urlPagina(t.id), x: t.x, sec: 1}));
    IDX.push({t: "Tu provincia", s: "Sección", u: "provincia.html", x: "perfil provincia provincias comparar país posición", sec: 1});
    Object.entries(NOMBRES).forEach(([c, n]) => IDX.push({t: `${n} en números`, s: "Tu provincia", u: `provincia.html?prov=${c}`, x: n, sec: 2, c}));
    IDX.push({t: "Sobre nosotros", s: "Datina", u: "nosotros.html", x: "propósito quiénes fuentes principios cómo se hace"});
    SITIO.fichas.forEach(([id, sec, tit, kt, kl, , trasAyuda]) => {
      // el título y el texto de muchas fichas se calculan (TX): en otra página se leen de ahí
      const h = (TX[kt] || tit || "").trim(); if (!h) return;
      // las fichas de suicidio llevan a las líneas de ayuda, que van justo antes
      const ancla = NOTA_A_LA_VISTA.has(id) && trasAyuda ? "#ayuda-suicidio" : "#" + id;
      IDX.push({t: h, s: nombreSec(sec), u: ir(id, ancla), x: (TX[kl] || "") + " " + (CLAVE[id]?.[1] || "")});
    });
    PREG.forEach(([q, a, h]) => { if (paginaDe(h.slice(1))) IDX.push({t: q, s: "Pregunta", u: ir(h.slice(1), h), x: a}); });
    ART.forEach(a => IDX.push({t: a.titulo, s: "Artículo", u: urlPagina(a.id), x: a.dek + " " + a.t.bajada, sec: 1}));
    IDX.forEach(d => { d.tt = st(d.t); d.xx = st(d.x); });
  };
  const fila = d => `<a href="${d.u}"><small>${esc(d.s)}</small>${d.c ? conBandera(d.c, d.t) : esc(d.t)}</a>`;
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
  const cerrar = volver => { btn.setAttribute("aria-expanded", "false"); caja.hidden = true; if (volver) btn.focus({preventScroll: true}); };
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
// Si entran varias juntas, cada una 50 ms después de la anterior (hasta 150). Las que ya se ven al llegar desde otra página
// no tienen entrada propia: entran con la página, para que no se sumen dos movimientos
const vistas = new IntersectionObserver(es => {
  let k = 0;
  es.forEach(en => {
    if (!en.isIntersecting) return;
    const f = en.target, retraso = LLEGADA.activa ? 0 : Math.min(k++, 3) * 50;
    if (LLEGADA.activa) f.classList.add("sin-entrada"); else f.style.setProperty("--retraso", retraso + "ms");
    f.classList.add("visto"); vistas.unobserve(f);
    setTimeout(() => {
      f.querySelectorAll(".grafico[data-g]").forEach(gr => { if (gr.offsetParent) DIB[gr.dataset.g](!REDUCIR && !LLEGADA.activa); });
      // "Descargar imagen" solo si la ficha tiene un gráfico: se mira después de dibujarlo
      const bi = f.querySelector(".accion.imagen"); if (bi) bi.hidden = !svgUnico(f);
    }, retraso);
  });
}, {threshold: .12, rootMargin: "0px 0px -8% 0px"});
document.querySelectorAll("article.ficha").forEach(f => vistas.observe(f));
// En los artículos se mira cada gráfico por separado (etapa 22): un artículo con varios gráficos es más alto que la pantalla, y en el
// celular el 12% del artículo no entraba nunca a la vista, así que sus gráficos no se dibujaban
const vistasG = new IntersectionObserver(es => es.forEach(en => {
  if (!en.isIntersecting) return;
  vistasG.unobserve(en.target);
  if (en.target.offsetParent) DIB[en.target.dataset.g](!REDUCIR && !LLEGADA.activa);
}), {threshold: .12, rootMargin: "0px 0px -8% 0px"});
document.querySelectorAll("article.nota .grafico[data-g]").forEach(gr => vistasG.observe(gr));

/* navegación activa: la sección de esta página, en la barra, el menú y el pie */
document.querySelectorAll(".temas a, .menu-panel a, .pie-mapa a").forEach(a => a.setAttribute("aria-current", a.getAttribute("href") === SECCION + ".html"));

/* Provincia elegida: un indicador en la barra con su bandera, que lleva al perfil y la borra ("Ver todo el país").
   No la elige: eso se hace solo en provincia.html. También aparece al final de las migas. */
const CORTO_CHIP = {"Santiago del Estero": "Sgo. del Estero", "Tierra del Fuego": "T. del Fuego"};
const pintarChip = () => {
  const chip = document.getElementById("prov-chip"), nom = NOMBRES[prov];
  if (chip) {
    chip.hidden = !nom;
    if (nom) {
      document.getElementById("chip-bandera").src = `datos/banderas/${prov}.png`;
      document.getElementById("chip-nom").textContent = CORTO_CHIP[nom] || nom;
      const a = document.getElementById("chip-prov");
      a.href = `provincia.html?prov=${prov}`;
      a.setAttribute("aria-label", `Provincia elegida: ${nom}. Ver su perfil`);
      a.title = `${nom}: ver su perfil`;
      document.getElementById("chip-borrar").setAttribute("aria-label", `Ver todo el país en lugar de ${nom}`);
    }
  }
  // en las migas, solo el nombre (etapa 30): la bandera de la provincia elegida va en la barra y en el título de su perfil
  document.querySelectorAll(".migas-prov").forEach(li => { li.hidden = !nom; li.textContent = nom || ""; });
};
pintarChip(); alCambiarProv.push(pintarChip);
document.getElementById("chip-borrar")?.addEventListener("click", () => {
  elegir("");
  // el foco no se pierde cuando el indicador desaparece (sin correr la página: la lupa está en la barra fija)
  document.getElementById("lupa-btn")?.focus({preventScroll: true});
});

/* contacto: aviso después de enviar el formulario (Netlify vuelve a esta página con ?enviado=1) */
if (PAGINA === "contacto" && new URLSearchParams(location.search).has("enviado")) {
  document.querySelector(".form-contacto").hidden = true;
  document.getElementById("form-gracias").hidden = false;
}

/* la barra superior es azul sobre la portada y clara en el resto */
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
      // con un menú o el buscador abiertos la barra no cambia
      if (!barra.querySelector('[aria-expanded="true"]')) barra.classList.toggle("compacta", d > 0 && y > 120);
      ultimo = y;
    });
  }, {passive: true});
}

/* Paneles (Secciones, buscador, provincia): abiertos con el teclado aparecen sin animación */
addEventListener("keydown", () => document.documentElement.classList.add("teclado"), true);
addEventListener("pointerdown", () => document.documentElement.classList.remove("teclado"), true);

/* enlaces compartidos del tipo salud.html#f-mortalidad?prov=30: llevar a la ficha */
if (location.hash.includes("?")) {
  const destino = document.getElementById(location.hash.slice(1).split("?")[0]);
  if (destino) requestAnimationFrame(() => destino.scrollIntoView());
}

/* ---------- portada: el mundo visto desde la Argentina y las 24 provincias ----------
   Proyección azimutal equidistante centrada en la Argentina, ajustada para que el país llene su lugar en la portada
   (a la derecha del texto, o debajo en el celular). Los anillos marcan distancias iguales desde el centro del país.
   Cada provincia lleva a su perfil. El mapa no recibe el foco del teclado: "Elegí tu provincia" hace lo mismo. */
async function mapa() {
  const el = document.getElementById("mapa"), por = document.querySelector(".portada");
  const caja = document.getElementById("portada-mapa"), ayuda = document.getElementById("mapa-ayuda");
  // Rompecabezas (6 de octubre de 2026, pedido del autor): las provincias llegan desde afuera y se arman en el país, de la más lejana
  // del centro a la más cercana, y con el país armado nace el sol. Mientras tanto la portada lleva "armando" (ver datina.css). Se arma
  // una sola vez, con el dibujo definitivo: un redibujo en medio (la letra que llega tarde, un cambio de ancho) deja todo en su lugar.
  // Con movimiento reducido no hay rompecabezas
  let pendiente = !REDUCIR && por.classList.contains("armando"), vuelo = null;
  const soltar = () => { clearTimeout(seguro); clearTimeout(vuelo); vuelo = null; pendiente = false; por.classList.remove("armando"); };
  const seguro = setTimeout(soltar, 10000);   // el sol nunca se queda esperando, aunque los datos del mapa tarden
  if (!pendiente) soltar();
  // Cada provincia sale de afuera, sobre la línea que la une con el centro del país (el de los anillos), con un poco de desvío y de giro,
  // como una pieza suelta. El desvío sale del código de la provincia, así el rompecabezas es siempre el mismo
  const CENTRO = [-64, -38], DUR_P = 750, PASO_P = 50;
  const azar = (c, k) => { const v = Math.sin(+c * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
  const rompecabezas = (enlaces, camino, proy, bp) => {
    pendiente = false;
    const [cx, cy] = proy(CENTRO), alto = bp[1][1] - bp[0][1];
    const piezas = enlaces.nodes().map(a => {
      const d = d3.select(a).datum(), c = d.properties.codigo_indec, [x, y] = camino.centroid(d);
      const ang = Math.atan2(y - cy, x - cx) + (azar(c, 1) - .5) * .6, lejos = alto * (.55 + .3 * azar(c, 2));
      return {a, dist: d3.geoDistance(d3.geoCentroid(d), CENTRO), dx: Math.cos(ang) * lejos, dy: Math.sin(ang) * lejos, giro: (azar(c, 3) - .5) * 50};
    }).sort((p, q) => q.dist - p.dist);
    piezas.forEach((p, i) => {
      const t = {delay: i * PASO_P, fill: "backwards"};
      p.a.animate([{transform: `translate(${p.dx.toFixed(1)}px,${p.dy.toFixed(1)}px) rotate(${p.giro.toFixed(1)}deg)`}, {transform: "none"}],
        {...t, duration: DUR_P, easing: "cubic-bezier(.16,1,.3,1)"});
      p.a.animate([{opacity: 0}, {opacity: 1}], {...t, duration: 300, easing: "ease-out"});
    });
    // el sol empieza a nacer cuando la última pieza está llegando
    vuelo = setTimeout(soltar, (piezas.length - 1) * PASO_P + DUR_P * .7);
  };
  let mundo;
  try { [mundo] = await Promise.all([fetch("datos/mundo-110m.json").then(r => r.json()), cargarGeo()]); } catch (_) { soltar(); return; }
  // la Argentina y las Malvinas del mapa del mundo no se dibujan: van las provincias, con su contorno oficial
  const paises = topojson.feature(mundo, mundo.objects.countries).features.filter(d => d.id !== "032" && d.id !== "238");
  // con mouse se hace clic, en el celular se toca
  const AYUDA = matchMedia("(hover:hover) and (pointer:fine)").matches ? "Hacé clic en una provincia para ver sus datos" : ayuda.textContent;
  ayuda.textContent = AYUDA;
  const dibujar = (armar = false) => {
    const W = por.clientWidth, H = por.clientHeight, angosto = W < 760;
    const pr = por.getBoundingClientRect(), c = caja.getBoundingClientRect(), sl = document.getElementById("sol").getBoundingClientRect();
    // el país ocupa el lugar del mapa. En pantallas anchas deja libre la esquina del sol
    const x0 = c.left - pr.left, y0 = c.top - pr.top + (angosto ? 0 : 12);
    const x1 = c.right - pr.left - (angosto ? 0 : sl.width * .55), y1 = c.bottom - pr.top - ayuda.offsetHeight - 10;
    const proy = d3.geoAzimuthalEquidistant().rotate([64, 38]).clipAngle(179.9).fitExtent([[x0, y0], [x1, y1]], GEO);
    // en pantallas anchas la Argentina va al borde izquierdo de su lugar, cerca del texto (antes quedaba centrada y lejos)
    if (!angosto) { const b0 = d3.geoPath(proy).bounds(GEO), t0 = proy.translate(); proy.translate([t0[0] + x0 + 8 - b0[0][0], t0[1]]); }
    const camino = d3.geoPath(proy), svg = d3.select(el).attr("viewBox", `0 0 ${W} ${H}`);
    // la ayuda va pegada debajo del país, como instrucción del mapa
    const bp = camino.bounds(GEO);
    ayuda.style.left = `${(bp[0][0] + bp[1][0]) / 2 - (c.left - pr.left)}px`;
    ayuda.style.top = `${bp[1][1] - (c.top - pr.top) + 10}px`;
    ZONA_MAPA = {der: bp[1][0] - (c.left - pr.left), arr: bp[0][1] - (c.top - pr.top), aba: bp[1][1] - (c.top - pr.top)};
    svg.selectAll("*").remove();
    svg.append("path").attr("class","grat").attr("d", camino(d3.geoGraticule().step([10, 10])()));
    [10, 20, 30, 45, 60, 80, 100, 130, 160].forEach(r =>
      svg.append("path").attr("class","anillo").attr("d", camino(d3.geoCircle().center([-64, -38]).radius(r)())));
    svg.append("g").selectAll("path").data(paises).join("path").attr("class", "tierra").attr("d", camino);
    const g = svg.append("g").attr("class", "provs");
    const enlaces = g.selectAll("a").data(GEO.features).join("a")
      .attr("href", d => `provincia.html?prov=${d.properties.codigo_indec}`).attr("tabindex", -1)
      .attr("data-c", d => d.properties.codigo_indec);
    enlaces.append("path").attr("d", camino);
    // la Ciudad de Buenos Aires es un punto a esta escala: un círculo para poder tocarla
    const [cx, cy] = proy(d3.geoCentroid(GEO.features.find(f => f.properties.codigo_indec === "02")));
    g.select('a[data-c="02"]').raise().append("circle").attr("cx", cx).attr("cy", cy).attr("r", angosto ? 6 : 5);
    // el rompecabezas: mientras está pendiente, las provincias esperan sin verse hasta el dibujo definitivo
    if (vuelo) soltar();
    if (armar && pendiente) rompecabezas(enlaces, camino, proy, bp);
    else if (pendiente) g.style("opacity", 0);
    enlaces.on("pointerenter", (ev, d) => { const c = d.properties.codigo_indec; ayuda.innerHTML = conBandera(c, `${NOMBRES[c]}: ver sus datos`); })
      .on("pointerleave", () => { ayuda.textContent = AYUDA; })
      // tocar una provincia abre una tarjeta con datos de su perfil (pedido del autor, octubre de 2026). No la elige: eso se hace
      // solo en provincia.html, al que lleva el botón de la tarjeta
      .on("click", (ev, d) => { ev.preventDefault(); tarjetaMapa(d.properties.codigo_indec); });
    marcarMapa();
    el.classList.add("listo");
  };
  dibujar();
  // la tipografía condensada cambia el alto del texto: se recalcula cuando termina de cargar, y ese es el dibujo que se arma como
  // rompecabezas. Si la letra tarda más de dos segundos y medio, se arma igual, y el redibujo de cuando llegue deja todo en su lugar
  let armado = false;
  const armar = () => { if (!armado) { armado = true; dibujar(true); } };
  if (document.fonts) document.fonts.ready.then(() => armado ? dibujar() : armar()); else armar();
  setTimeout(armar, 2500);
  let ancho = por.clientWidth, t;
  new ResizeObserver(() => { if (por.clientWidth === ancho) return; ancho = por.clientWidth; clearTimeout(t); t = setTimeout(dibujar, 150); }).observe(por);
}
// Tarjeta del mapa: cuatro indicadores del perfil con su posición entre las 24 y el enlace al perfil completo.
// Al lado del país en pantallas anchas y debajo del mapa en el celular. Se cierra con Escape, con "Cerrar" o tocando afuera
let ZONA_MAPA = null, tarjetaM = null;
const MAPA_IND = ["Empleo privado registrado", "Esperanza de vida", "Mortalidad infantil", "Aprender, matemática"];
function tarjetaMapa(c) {
  const caja = document.getElementById("portada-mapa");
  if (!tarjetaM) {
    tarjetaM = document.createElement("div"); tarjetaM.className = "mapa-tarjeta"; tarjetaM.setAttribute("role", "region");
    caja.appendChild(tarjetaM);
    tarjetaM.addEventListener("click", ev => { if (ev.target.closest(".mt-cerrar")) cerrarTarjetaMapa(); });
    document.addEventListener("keydown", ev => { if (ev.key === "Escape") cerrarTarjetaMapa(); });
    document.addEventListener("pointerdown", ev => { if (tarjetaM.classList.contains("abierta") && !tarjetaM.contains(ev.target) && !ev.target.closest("#mapa .provs")) cerrarTarjetaMapa(); });
  }
  const filas = INDP.filter(x => MAPA_IND.includes(x.lab)).map(x => {
    const f = x.d.find(d => d.codigo_indec === c); if (!f) return "";
    const pos = [...x.d].sort((a, b) => b[x.k] - a[x.k]).findIndex(d => d.codigo_indec === c) + 1;
    return `<li><span class="mt-lab">${x.lab}</span><b>${x.f(f[x.k])}</b><small>${pos}.º de ${x.d.length}, de mayor a menor. País: ${x.f(x.pais)}</small>` +
      (notaDist(x, c) ? `<small class="mt-aclara">${notaDist(x, c)}</small>` : "") + `</li>`;
  }).join("");
  tarjetaM.setAttribute("aria-label", `Datos de ${NOMBRES[c]}`);
  tarjetaM.innerHTML = `<div class="mt-cab">${conBandera(c, NOMBRES[c])}<button type="button" class="mt-cerrar" aria-label="Cerrar"><span aria-hidden="true">×</span></button></div>` +
    `<ul>${filas}</ul><a class="boton principal chico" href="provincia.html?prov=${c}">Ver perfil completo</a>`;
  if (ZONA_MAPA && innerWidth >= 760) { tarjetaM.style.left = `${ZONA_MAPA.der + 20}px`; tarjetaM.style.top = `${Math.max(0, ZONA_MAPA.arr + 40)}px`; }
  else { tarjetaM.style.left = ""; tarjetaM.style.top = ""; }
  document.querySelectorAll("#mapa .provs a").forEach(a => a.classList.toggle("tocada", a.dataset.c === c));
  const nueva = !tarjetaM.classList.contains("abierta");
  tarjetaM.classList.add("abierta");
  if (nueva) tarjetaM.animate(REDUCIR ? [{opacity: 0}, {opacity: 1}] : [{opacity: 0, transform: "translateY(6px)"}, {opacity: 1, transform: "none"}], {duration: 200, easing: "cubic-bezier(.23,1,.32,1)"});
}
function cerrarTarjetaMapa() {
  if (!tarjetaM?.classList.contains("abierta")) return;
  tarjetaM.classList.remove("abierta");
  document.querySelectorAll("#mapa .provs a.tocada").forEach(a => a.classList.remove("tocada"));
}
// la provincia elegida, en amarillo
const marcarMapa = () => document.querySelectorAll("#mapa .provs a").forEach(a => a.classList.toggle("elegida", a.dataset.c === prov));
alCambiarProv.push(marcarMapa);
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
