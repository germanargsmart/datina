/* Elecciones por mesa (pedido del autor del 4 de noviembre de 2026: "cada circuito electoral y mesa de las votaciones históricas").
   Lo copia 03_construir_sitio.py a sitio/mesas.js y lo pide solo la página mesas.html. Lee las tablas de sitio/datos/mesas/, que arma
   scripts/elecciones_mesas.py (fuentes y límites en docs/roadmap/MESAS.md):
     indice.json                  las elecciones, con su nivel (mesa o provincia)
     {eleccion}/pais.csv          una fila por provincia y lista
     {eleccion}/{provincia}.csv   una fila por mesa, con una columna por lista (se baja al elegir la provincia: la más grande pesa 1,5 MB)
     circuitos/{provincia}.csv    cada sección y circuito en cada elección, con las dos listas más votadas
   Todo se suma en el navegador. Los porcentajes de las listas son sobre los votos positivos, como en la ficha de elecciones de Política.
   La participación cuenta solo las mesas con resultado: en el escrutinio provisorio hay mesas sin cargar, con sus electores y sin votos.
   Va en un archivo aparte de datina.js porque es muy largo para que lo baje cada página. No necesita D3: las barras son HTML.
   Los textos no llevan cifras escritas a mano: salen de las tablas. */
(() => {
  "use strict";
  const raiz = document.getElementById("ms");
  if (!raiz) return;
  const $ = id => document.getElementById(id);
  const BASE = "datos/mesas/";
  // Cloudflare guarda los encabezados de la primera vez que sirve un archivo y, si el archivo no cambió, no los actualiza al revalidarlo. Las tablas pedidas antes de
  // que se sirvieran como texto seguían llegando sin comprimir: con otra dirección se piden de nuevo. Subir este número hace lo mismo si vuelve a pasar.
  // Es 5 y no 2 porque del 1 al 4 se pidieron a mano mientras se publicaba y quedaron guardadas igual: una versión nueva no se prueba antes de publicarla
  const VERSION_TABLAS = "5";
  const CARGOS = {presidente: "Presidente", diputados: "Diputados nacionales", senadores: "Senadores nacionales"};
  const NIVEL_NOMBRE = {presidente: "presidente", diputados: "diputados nacionales", senadores: "senadores nacionales"};
  const n0 = v => Number(v).toLocaleString("es-AR");
  // el mismo redondeo que el resto del sitio: un decimal, mitad hacia arriba
  const pct = v => (Math.round(v * 10 + 1e-9) / 10).toLocaleString("es-AR", {minimumFractionDigits: 1, maximumFractionDigits: 1}) + "%";
  const esc = s => String(s).replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
  const natural = (a, b) => String(a).localeCompare(String(b), "es", {numeric: true, sensitivity: "base"});
  const ent = t => { const v = t === "" || t == null ? null : +t; return Number.isFinite(v) ? v : null; };

  const FALLO_HISTORIA = Symbol("la historia no llegó");
  let IDX = null, turno = 0;
  const estado = {e: "", p: "", s: "", c: "", m: ""};
  const pedidas = new Map();

  /* ---------- las tablas ---------- */
  // un CSV a filas. Las listas pueden llevar comas en el nombre, entre comillas
  function filasCSV(t) {
    const filas = [];
    let fila = [], celda = "", comillas = false;
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (comillas) {
        if (c === '"') { if (t[i + 1] === '"') { celda += '"'; i++; } else comillas = false; }
        else celda += c;
      } else if (c === '"') comillas = true;
      else if (c === ",") { fila.push(celda); celda = ""; }
      else if (c === "\n") { fila.push(celda); filas.push(fila); fila = []; celda = ""; }
      else if (c !== "\r") celda += c;
    }
    if (celda !== "" || fila.length) { fila.push(celda); filas.push(fila); }
    return filas;
  }
  // una tabla cortada o con otra forma es una falla, no una tabla más corta: el aviso es el mismo que si no llega
  const bajar = ruta => {
    if (pedidas.has(ruta)) return pedidas.get(ruta);
    const p = fetch(`${BASE}${ruta}?v=${VERSION_TABLAS}`).then(r => { if (!r.ok) throw new Error(`${ruta}: ${r.status}`); return r.text(); }).then(t => {
      if (!t.endsWith("\n")) throw new Error(`${ruta}: la tabla llegó cortada`);
      const f = filasCSV(t);
      if (f.length < 2 || f.some(x => x.length !== f[0].length)) throw new Error(`${ruta}: la tabla no tiene la forma esperada`);
      return f;
    });
    pedidas.set(ruta, p);
    p.catch(() => pedidas.delete(ruta));   // volver a intentar pide de nuevo
    return p;
  };
  const col = (cab, n) => cab.indexOf(n);

  async function tablaPais(id) {
    const f = await bajar(`${id}/pais.csv`), c = f[0];
    const i = {cod: col(c, "codigo_indec"), lista: col(c, "lista"), votos: col(c, "votos"), mesas: col(c, "mesas"), el: col(c, "electores"),
      vot: col(c, "votantes"), bl: col(c, "blancos"), nu: col(c, "nulos"), re: col(c, "recurridos_impugnados")};
    if (i.cod < 0 || i.lista < 0 || i.votos < 0) throw new Error(`${id}/pais.csv: faltan columnas`);
    const pv = {};
    for (const r of f.slice(1)) {
      const p = pv[r[i.cod]] ||= {cod: r[i.cod], listas: [], mesas: ent(r[i.mesas]), electores: ent(r[i.el]), votantes: ent(r[i.vot]),
        blancos: ent(r[i.bl]), nulos: ent(r[i.nu]), recurridos: ent(r[i.re])};
      p.listas.push([r[i.lista], +r[i.votos]]);
    }
    return pv;
  }
  const FIJAS = 8;   // seccion_id, seccion, circuito, mesa, electores, blancos, nulos, recurridos_impugnados
  async function tablaProvincia(id, cod) {
    const f = await bajar(`${id}/${cod}.csv`), c = f[0];
    if (c[0] !== "seccion_id" || c[3] !== "mesa" || c[7] !== "recurridos_impugnados") throw new Error(`${id}/${cod}.csv: faltan columnas`);
    const listas = c.slice(FIJAS);
    const filas = f.slice(1).map(r => ({s: r[0], sn: r[1], c: r[2], m: r[3], e: +r[4], b: +r[5], n: +r[6], r: +r[7], v: r.slice(FIJAS).map(Number)}));
    return {listas, filas};
  }
  async function tablaHistoria(cod) {
    const f = await bajar(`circuitos/${cod}.csv`), c = f[0];
    const i = Object.fromEntries(c.map((n, k) => [n, k]));
    if (!("eleccion" in i) || !("votos_primera" in i)) throw new Error(`circuitos/${cod}.csv: faltan columnas`);
    const m = new Map();
    for (const r of f.slice(1)) {
      const k = `${r[i.seccion_id]}|${r[i.circuito]}`;
      if (!m.has(k)) m.set(k, new Map());
      m.get(k).set(r[i.eleccion], {mesas: +r[i.mesas], electores: +r[i.electores], votantes: +r[i.votantes], positivos: +r[i.positivos],
        primera: r[i.primera], vp: +r[i.votos_primera], segunda: r[i.segunda], vs: +r[i.votos_segunda]});
    }
    return m;
  }

  /* ---------- las cuentas ---------- */
  // suma mesas: la participación cuenta solo las que tienen resultado
  function sumar(filas, n) {
    const t = {mesas: filas.length, sinVotos: 0, electores: 0, votantes: 0, positivos: 0, blancos: 0, nulos: 0, recurridos: 0, v: new Array(n).fill(0)};
    for (const f of filas) {
      let pos = 0;
      for (let i = 0; i < n; i++) { t.v[i] += f.v[i]; pos += f.v[i]; }
      const vot = pos + f.b + f.n + f.r;
      if (vot > 0) t.electores += f.e; else t.sinVotos++;
      t.votantes += vot; t.positivos += pos; t.blancos += f.b; t.nulos += f.n; t.recurridos += f.r;
    }
    return t;
  }
  const dos = (nombres, votos) => votos.map((v, i) => [nombres[i], v]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]);
  const participacion = t => t.electores > 0 && t.votantes != null ? t.votantes / t.electores * 100 : null;
  const elec = () => IDX.elecciones.find(e => e.id === estado.e);
  const provNombre = cod => IDX.provincias[cod];

  /* ---------- los controles ---------- */
  const opciones = (sel, lista, valor) => {
    sel.innerHTML = lista.map(([v, t]) => `<option value="${esc(v)}">${esc(t)}</option>`).join("");
    sel.value = valor;
  };
  const etiquetaEl = e => e.etiqueta + (e.nivel === "provincia" ? ", solo por provincia" : "");
  function pintarControles(el, D) {
    opciones($("ms-cargo"), Object.entries(CARGOS), el.cargo);
    const mismas = IDX.elecciones.filter(e => e.cargo === el.cargo).sort((a, b) => b.anio - a.anio || (a.vuelta === "segunda" ? -1 : 1));
    opciones($("ms-eleccion"), mismas.map(e => [e.id, etiquetaEl(e)]), el.id);
    const orden = el.provincias.slice().sort((a, b) => provNombre(a).localeCompare(provNombre(b), "es"));
    opciones($("ms-prov"), [["", "Todo el país"], ...orden.map(c => [c, provNombre(c)])], estado.p);
    const secc = $("ms-sec"), circ = $("ms-cir"), mesa = $("ms-mesa"), num = $("ms-num");
    const apagar = (sel, texto) => { opciones(sel, [["", texto]], ""); sel.disabled = true; };
    num.disabled = !D;
    $("ms-num-ir").disabled = !D;
    num.placeholder = D ? "Por ejemplo, 1234" : el.nivel === "mesa" ? "Elegí una provincia" : "Sin datos en esta elección";
    if (!D) {
      const t = el.nivel === "mesa" ? "Elegí una provincia" : "Sin datos";
      apagar(secc, t); apagar(circ, t); apagar(mesa, t);
      return;
    }
    const nombres = new Map();
    for (const f of D.filas) if (!nombres.has(f.s)) nombres.set(f.s, f.sn);
    secc.disabled = false;
    opciones(secc, [["", "Toda la provincia"], ...[...nombres].sort((a, b) => a[1].localeCompare(b[1], "es", {numeric: true}))], estado.s);
    if (!estado.s) { apagar(circ, "Elegí una sección"); apagar(mesa, "Elegí una sección"); return; }
    const deSec = D.filas.filter(f => f.s === estado.s);
    circ.disabled = false;
    opciones(circ, [["", "Toda la sección"], ...[...new Set(deSec.map(f => f.c))].sort(natural).map(c => [c, `Circuito ${c}`])], estado.c);
    if (!estado.c) { apagar(mesa, "Elegí un circuito"); return; }
    mesa.disabled = false;
    opciones(mesa, [["", "Todo el circuito"], ...deSec.filter(f => f.c === estado.c).map(f => f.m).sort(natural).map(m => [m, `Mesa ${m}`])], estado.m);
  }

  /* ---------- lo que se ve ---------- */
  function cifras(t, conMesas) {
    const p = participacion(t), items = [];
    if (conMesas && t.mesas != null) items.push(["Mesas", n0(t.mesas)]);
    if (t.electores) items.push(["Electores", n0(t.electores)]);
    if (t.votantes != null) items.push(["Votaron", n0(t.votantes)]);
    if (p != null) items.push(["Participación", pct(p)]);
    return items.length ? `<dl class="ms-cifras">${items.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join("")}</dl>` : "";
  }
  function tablaListas(listas, positivos) {
    if (!listas.length) return "";
    const filas = listas.map(([n, v]) => {
      const p = v / positivos * 100;
      return `<tr><td class="ms-lista"><span>${esc(n)}</span><span class="ms-barra" style="--v:${p.toFixed(2)}%" aria-hidden="true"></span></td>` +
        `<td class="n">${n0(v)}</td><td class="n">${pct(p)}</td></tr>`;
    }).join("");
    return `<div class="tabla-desliza ms-tabla-listas" tabindex="0" role="region" aria-label="Votos por lista"><table class="tabla-areas">` +
      `<caption class="solo-lector">Votos de cada lista y su porcentaje de los votos positivos</caption>` +
      `<thead><tr><th scope="col">Lista</th><th scope="col" class="n">Votos</th><th scope="col" class="n">%<span class="ms-ancho"> de positivos</span></th></tr></thead><tbody>${filas}</tbody></table></div>`;
  }
  // lo que no va a ninguna lista, en una línea
  function otrosVotos(t) {
    if (t.votantes == null || !t.votantes) return "";
    const partes = [];
    if (t.blancos != null) partes.push(`${n0(t.blancos)} en blanco (${pct(t.blancos / t.votantes * 100)})`);
    if (t.nulos != null) partes.push(`${n0(t.nulos)} nulos (${pct(t.nulos / t.votantes * 100)})`);
    if (t.recurridos) partes.push(`${n0(t.recurridos)} recurridos, impugnados o de comando (${pct(t.recurridos / t.votantes * 100)})`);
    return partes.length ? `<p class="ms-otros">De quienes votaron: ${partes.join(", ")}.</p>` : "";
  }
  const celdaLista = (nombre, votos, base) => nombre ? `<span class="ms-c-nom">${esc(nombre)}</span> <span class="ms-c-pct">${pct(votos / base * 100)}</span>` : "";

  // la tabla del nivel de abajo: cada fila lleva a su lugar
  function tablaPartes(titulo, nombreCol, filas, verMesas) {
    if (!filas.length) return "";
    const cuerpo = filas.map(f => {
      const orden = dos(f.nombres, f.votos);
      const [a, b] = [orden[0], orden[1]];
      const base = orden.reduce((s, x) => s + x[1], 0);
      const p = f.part;
      return `<tr><th scope="row"><button type="button" class="enlace ms-ir" data-${f.clave}="${esc(f.valor)}">${esc(f.nombre)}</button></th>` +
        (verMesas ? `<td class="n ms-ancho">${f.mesas == null ? "" : n0(f.mesas)}</td>` : `<td class="n ms-ancho">${n0(f.electores)}</td>`) +
        `<td class="n">${p == null ? "sin dato" : pct(p)}</td>` +
        `<td>${a ? celdaLista(a[0], a[1], base) : "sin resultado"}</td><td>${b ? celdaLista(b[0], b[1], base) : ""}</td></tr>`;
    }).join("");
    return `<section class="ms-bloque" aria-labelledby="ms-partes-tit"><h2 class="ms-sub-tit" id="ms-partes-tit">${esc(titulo)}</h2>` +
      `<div class="tabla-desliza ms-tabla-partes" tabindex="0" role="region" aria-labelledby="ms-partes-tit"><table class="tabla-areas">` +
      `<thead><tr><th scope="col">${esc(nombreCol)}</th><th scope="col" class="n ms-ancho">${verMesas ? "Mesas" : "Electores"}</th><th scope="col" class="n">Participación</th>` +
      `<th scope="col">Lista más votada</th><th scope="col">Segunda</th></tr></thead><tbody>${cuerpo}</tbody></table></div></section>`;
  }

  function tablaHistorial(el, mapa, nivelTexto) {
    if (!mapa) return "";
    const lista = IDX.elecciones.filter(e => e.nivel === "mesa" && e.cargo === el.cargo && e.provincias.includes(estado.p))
      .sort((a, b) => b.anio - a.anio || (a.vuelta === "segunda" ? -1 : 1));
    if (lista.length < 2) return "";
    const filas = lista.map(e => {
      const h = mapa.get(e.id), yo = e.id === el.id ? ' class="elegida"' : "";
      const boton = `<button type="button" class="enlace ms-ir-el" data-e="${e.id}">${esc(e.etiqueta)}</button>`;
      if (!h) return `<tr${yo}><th scope="row">${boton}</th><td colspan="3" class="ms-sin">No figura con este código en esa elección</td></tr>`;
      return `<tr${yo}><th scope="row">${boton}</th><td class="n">${h.electores > 0 ? pct(h.votantes / h.electores * 100) : "sin dato"}</td>` +
        `<td>${h.primera ? celdaLista(h.primera, h.vp, h.positivos) : "sin resultado"}</td><td>${h.segunda ? celdaLista(h.segunda, h.vs, h.positivos) : ""}</td></tr>`;
    }).join("");
    return `<section class="ms-bloque" aria-labelledby="ms-hist-tit"><h2 class="ms-sub-tit" id="ms-hist-tit">¿Cómo votó ${nivelTexto} en cada elección?</h2>` +
      `<p class="ms-sub">${esc(CARGOS[el.cargo])}. La lista más votada y la segunda de cada elección, con su porcentaje de los votos positivos. Las listas cambian de nombre y de alianzas entre una elección y otra.</p>` +
      `<div class="tabla-desliza ms-tabla-partes" tabindex="0" role="region" aria-labelledby="ms-hist-tit"><table class="tabla-areas">` +
      `<thead><tr><th scope="col">Elección</th><th scope="col" class="n">Participación</th><th scope="col">Lista más votada</th><th scope="col">Segunda</th></tr></thead>` +
      `<tbody>${filas}</tbody></table></div></section>`;
  }

  function lugar(el, D) {
    const partes = [];
    if (estado.m) partes.push(`Mesa ${estado.m}`);
    if (estado.c) partes.push(`Circuito ${estado.c}`);
    if (estado.s && D) partes.push(D.filas.find(f => f.s === estado.s).sn);
    if (estado.p) partes.push(provNombre(estado.p));
    return partes.length ? partes.join(", ") : "Todo el país";
  }

  // qué parte del escrutinio definitivo reúne este conteo (elecciones_mesas.py la mide donde el definitivo está publicado como datos). Por debajo de 97% se avisa:
  // en Formosa, la general de 2015 reúne cuatro de cada cinco votos, porque faltan mesas que no llegaron a cargarse
  const COBERTURA_AVISO = 97;
  function avisoCobertura(el) {
    const c = estado.p ? el.cobertura?.[estado.p] : el.cobertura_pais;
    if (c == null || c >= COBERTURA_AVISO) return "";
    return `${estado.p ? `En ${provNombre(estado.p)}, este` : "En todo el país, este"} conteo reúne ${pct(c)} de los votos positivos del escrutinio definitivo: faltan mesas que no se cargaron la noche de la elección.`;
  }

  function pintar(el, P, D, H, aviso) {
    const sub = `${CARGOS[el.cargo]}, ${el.etiqueta}. Escrutinio ${el.recuento}.`;
    const cob = avisoCobertura(el);
    let resumen = "", listas = [], t = null, partes = "", frase = "", historia = "";
    const notas = [];
    const pv = el.provincias.map(c => P[c]).filter(Boolean);
    if (!estado.p) {
      t = {mesas: pv.every(x => x.mesas != null) ? pv.reduce((s, x) => s + x.mesas, 0) : null,
        electores: pv.every(x => x.electores != null) ? pv.reduce((s, x) => s + x.electores, 0) : 0,
        votantes: pv.every(x => x.votantes != null) ? pv.reduce((s, x) => s + x.votantes, 0) : null,
        blancos: pv.every(x => x.blancos != null) ? pv.reduce((s, x) => s + x.blancos, 0) : null,
        nulos: pv.every(x => x.nulos != null) ? pv.reduce((s, x) => s + x.nulos, 0) : null,
        recurridos: pv.reduce((s, x) => s + (x.recurridos || 0), 0)};
      if (el.cargo === "presidente") {
        const suma = new Map();
        for (const x of pv) for (const [n, v] of x.listas) suma.set(n, (suma.get(n) || 0) + v);
        listas = [...suma].sort((a, b) => b[1] - a[1]);
      } else {
        frase = `Cada jurisdicción vota sus propias listas de ${NIVEL_NOMBRE[el.cargo]}, así que no hay un total de listas para el país. Elegí una provincia para ver las suyas.`;
      }
      const filas = pv.slice().sort((a, b) => provNombre(a.cod).localeCompare(provNombre(b.cod), "es")).map(x => ({
        clave: "p", valor: x.cod, nombre: provNombre(x.cod), mesas: x.mesas, electores: x.electores, part: x.electores && x.votantes != null ? x.votantes / x.electores * 100 : null,
        nombres: x.listas.map(l => l[0]), votos: x.listas.map(l => l[1])}));
      partes = tablaPartes("¿Cómo votó cada jurisdicción?", "Jurisdicción", filas, el.nivel === "mesa");
    } else if (!D) {
      const x = P[estado.p];
      t = {mesas: null, electores: x.electores || 0, votantes: x.votantes, blancos: x.blancos, nulos: x.nulos, recurridos: x.recurridos || 0};
      listas = x.listas.slice().sort((a, b) => b[1] - a[1]);
    } else {
      const filas = D.filas.filter(f => (!estado.s || f.s === estado.s) && (!estado.c || f.c === estado.c) && (!estado.m || f.m === estado.m));
      t = sumar(filas, D.listas.length);
      listas = dos(D.listas, t.v);
      if (!estado.s || !estado.c) {
        const grupo = new Map();
        for (const f of filas) {
          const k = estado.s ? f.c : f.s;
          if (!grupo.has(k)) grupo.set(k, []);
          grupo.get(k).push(f);
        }
        const hijos = [...grupo].map(([k, g]) => {
          const s = sumar(g, D.listas.length);
          return {clave: estado.s ? "c" : "s", valor: k, nombre: estado.s ? `Circuito ${k}` : g[0].sn, mesas: s.mesas, electores: s.electores, part: participacion(s), nombres: D.listas, votos: s.v};
        }).sort((a, b) => natural(a.nombre, b.nombre));
        partes = tablaPartes(estado.s ? "¿Cómo votó cada circuito?" : "¿Cómo votó cada sección?", estado.s ? "Circuito" : "Sección", hijos, true);
      } else if (!estado.m) {
        const hijos = filas.slice().sort((a, b) => natural(a.m, b.m)).map(f => {
          const s = sumar([f], D.listas.length);
          return {clave: "m", valor: f.m, nombre: `Mesa ${f.m}`, mesas: 1, electores: f.e, part: participacion(s), nombres: D.listas, votos: f.v};
        });
        partes = tablaPartes("¿Cómo votó cada mesa?", "Mesa", hijos, false);
      }
      if (estado.m && t.votantes > t.electores && t.electores > 0)
        notas.push("Esta mesa registra más votos que electores. Puede ser un error de carga del telegrama, que el escrutinio definitivo corrige.");
      if (estado.m && !t.votantes) notas.push("Esta mesa figura sin resultado en el escrutinio provisorio.");
      if (!estado.m && t.sinVotos) notas.push(`${n0(t.sinVotos)} de ${n0(t.mesas)} mesas figuran sin resultado en el escrutinio provisorio: la participación no las cuenta.`);
      if (estado.s && H === FALLO_HISTORIA) {
        historia = `<section class="ms-bloque ms-falla" role="alert"><p>No se pudo bajar la historia de ${estado.c ? "este circuito" : "esta sección"}. Los resultados de esta elección están completos. Al elegir otro lugar se vuelve a intentar.</p></section>`;
      } else if (estado.s && H) {
        const mapa = H.get(`${estado.s}|${estado.c}`);
        historia = tablaHistorial(el, mapa, estado.c ? "este circuito" : "esta sección");
      }
    }
    const positivos = listas.reduce((s, x) => s + x[1], 0);
    if (!frase && listas.length >= 2) {
      const dondeTxt = !estado.p ? "en el país" : estado.m ? "en esta mesa" : estado.c ? "en este circuito" : estado.s ? "en esta sección" : "en esta jurisdicción";
      frase = `La lista más votada ${dondeTxt} fue ${listas[0][0]}, con ${pct(listas[0][1] / positivos * 100)} de los votos positivos, y la segunda, ${listas[1][0]}, con ${pct(listas[1][1] / positivos * 100)}.`;
    }
    if (el.nivel === "provincia") notas.push("Para esta elección no hay datos que se puedan publicar por debajo de la jurisdicción.");
    frase = [frase, ...notas].filter(Boolean).join(" ");
    resumen = `<section class="ms-bloque ms-resultado" aria-labelledby="ms-titulo"><h2 class="ms-tit" id="ms-titulo" tabindex="-1">${esc(lugar(el, D))}</h2>` +
      `<p class="ms-sub">${esc(sub)}</p>` + (aviso ? `<p class="aviso-serie ms-aviso">${esc(aviso)}</p>` : "") + (cob ? `<p class="aviso-serie ms-aviso">${esc(cob)}</p>` : "") + cifras(t, !estado.m) +
      (frase ? `<p class="ms-frase">${esc(frase)}</p>` : "") + tablaListas(listas, positivos) + otrosVotos(t) + `</section>`;
    $("ms-resultado").innerHTML = resumen + partes + historia;
    const bajarCSV = !estado.p || !D ? `${BASE}${el.id}/pais.csv` : `${BASE}${el.id}/${estado.p}.csv`;
    const a = $("ms-bajar");
    a.href = bajarCSV;
    a.textContent = !estado.p || !D ? "Descargar tabla por jurisdicción (CSV)" : `Descargar las mesas de ${provNombre(estado.p)} (CSV)`;
    const ah = $("ms-bajar-hist");
    ah.hidden = !(estado.p && D);
    if (estado.p) ah.href = `${BASE}circuitos/${estado.p}.csv`;
    raiz.setAttribute("aria-busy", "false");
    $("ms-estado").textContent = `Resultados de ${lugar(el, D)}.`;
  }

  function dirección() {
    const q = new URLSearchParams();
    if (estado.e) q.set("e", estado.e);
    for (const k of ["p", "s", "c", "m"]) if (estado[k]) q.set(k, estado[k]);
    history.replaceState(null, "", `${location.pathname}?${q}${location.hash}`);
  }

  /* ---------- el recorrido ---------- */
  async function actualizar(enfocar) {
    const yo = ++turno, el = elec();
    let aviso = "";
    raiz.setAttribute("aria-busy", "true");
    $("ms-estado").textContent = "Cargando los resultados.";
    $("ms-num-res").textContent = "";
    try {
      const P = await tablaPais(el.id);
      // la provincia no votó ese cargo en esa elección (los senadores se renuevan por tercios): se sube al país y se avisa
      if (estado.p && !el.provincias.includes(estado.p)) {
        aviso = `${provNombre(estado.p)} no eligió ${NIVEL_NOMBRE[el.cargo]} en ${el.anio}: se muestra todo el país.`;
        Object.assign(estado, {p: "", s: "", c: "", m: ""});
      }
      if (el.nivel !== "mesa" && estado.s) Object.assign(estado, {s: "", c: "", m: ""});
      const D = estado.p && el.nivel === "mesa" ? await tablaProvincia(el.id, estado.p) : null;
      // el lugar elegido puede no existir en otra elección: se sube un nivel y se avisa
      if (D) {
        const hay = (s, c, m) => D.filas.some(f => f.s === s && (!c || f.c === c) && (!m || f.m === m));
        if (estado.m && !hay(estado.s, estado.c, estado.m)) { aviso = `La mesa ${estado.m} no existe en ese circuito en esta elección: se muestra el circuito. Los números de mesa cambian en cada elección.`; estado.m = ""; }
        if (estado.c && !hay(estado.s, estado.c)) { aviso = `El circuito ${estado.c} no figura con ese código en esta elección: se muestra la sección.`; estado.c = ""; estado.m = ""; }
        if (estado.s && !hay(estado.s)) { aviso = "Esa sección no figura en esta elección: se muestra la provincia."; Object.assign(estado, {s: "", c: "", m: ""}); }
      }
      let H = null;
      if (D && estado.s) H = await tablaHistoria(estado.p).catch(e => { console.warn("Elecciones por mesa:", e); return FALLO_HISTORIA; });
      if (yo !== turno) return;
      pintarControles(el, D);
      pintar(el, P, D, H, aviso);
      dirección();
      if (enfocar) {
        const t = $("ms-titulo");
        t.focus({preventScroll: true});
        t.scrollIntoView({block: "start"});
      }
    } catch (e) {
      if (yo !== turno) return;
      console.warn("Elecciones por mesa:", e);
      raiz.setAttribute("aria-busy", "false");
      $("ms-estado").textContent = "No se pudieron cargar los resultados.";
      $("ms-resultado").innerHTML = `<div class="ms-bloque ms-falla" role="alert"><p>No se pudo bajar la tabla de esta elección. Puede ser un problema de conexión.</p>` +
        `<button type="button" class="boton chico" id="ms-reintentar">Volver a intentar</button></div>`;
      $("ms-reintentar").addEventListener("click", () => actualizar(false));
    }
  }

  // al cambiar de cargo se busca la misma elección, y si ese cargo no votó ese año, la más reciente
  function cambiarCargo(cargo) {
    const ahora = elec();
    const candidatas = IDX.elecciones.filter(e => e.cargo === cargo).sort((a, b) => b.anio - a.anio || (a.vuelta === "segunda" ? -1 : 1));
    const misma = candidatas.find(e => e.anio === ahora.anio && e.vuelta === "general") || candidatas[0];
    estado.e = misma.id;
    actualizar(false);
  }

  function buscarMesa() {
    const v = $("ms-num").value.trim().replace(/^0+(?=.)/, "").toUpperCase(), res = $("ms-num-res");
    if (!v || !estado.p) return;
    tablaProvincia(estado.e, estado.p).then(D => {
      const hallada = D.filas.filter(f => f.m === v);
      if (!hallada.length) { res.textContent = `No hay una mesa ${v} en ${provNombre(estado.p)} en esta elección.`; return; }
      const f = hallada[0];
      Object.assign(estado, {s: f.s, c: f.c, m: f.m});
      actualizar(true);
    }).catch(() => { res.textContent = "No se pudo bajar la tabla de esta provincia. Volvé a intentar."; });
  }

  function escuchar() {
    $("ms-cargo").addEventListener("change", e => cambiarCargo(e.target.value));
    $("ms-eleccion").addEventListener("change", e => { estado.e = e.target.value; actualizar(false); });
    $("ms-prov").addEventListener("change", e => { Object.assign(estado, {p: e.target.value, s: "", c: "", m: ""}); actualizar(false); });
    $("ms-sec").addEventListener("change", e => { Object.assign(estado, {s: e.target.value, c: "", m: ""}); actualizar(false); });
    $("ms-cir").addEventListener("change", e => { Object.assign(estado, {c: e.target.value, m: ""}); actualizar(false); });
    $("ms-mesa").addEventListener("change", e => { estado.m = e.target.value; actualizar(false); });
    // sin <form>: 03 saca los formularios del sitio
    $("ms-num-ir").addEventListener("click", buscarMesa);
    $("ms-num").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); buscarMesa(); } });
    $("ms-resultado").addEventListener("click", e => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.classList.contains("ms-ir")) {
        const d = b.dataset;
        if (d.p) Object.assign(estado, {p: d.p, s: "", c: "", m: ""});
        else if (d.s) Object.assign(estado, {s: d.s, c: "", m: ""});
        else if (d.c) Object.assign(estado, {c: d.c, m: ""});
        else if (d.m) estado.m = d.m;
        actualizar(true);
      } else if (b.classList.contains("ms-ir-el")) {
        estado.e = b.dataset.e;
        actualizar(true);
      }
    });
  }

  async function arrancar() {
    try {
      const r = await fetch(BASE + "indice.json");
      if (!r.ok) throw new Error(`indice.json: ${r.status}`);
      IDX = await r.json();
      if (!IDX.elecciones?.length) throw new Error("indice.json sin elecciones");
    } catch (e) {
      console.warn("Elecciones por mesa:", e);
      raiz.setAttribute("aria-busy", "false");
      $("ms-estado").textContent = "No se pudo cargar la herramienta.";
      $("ms-resultado").innerHTML = `<div class="ms-bloque ms-falla" role="alert"><p>No se pudo cargar la lista de elecciones. Puede ser un problema de conexión.</p>` +
        `<a class="boton chico" href="">Volver a intentar</a></div>`;
      return;
    }
    const q = new URLSearchParams(location.search);
    const pedida = IDX.elecciones.find(e => e.id === q.get("e"));
    // sin pedido, la presidencial más reciente
    const inicial = pedida || IDX.elecciones.filter(e => e.cargo === "presidente").sort((a, b) => b.anio - a.anio || (a.vuelta === "segunda" ? -1 : 1))[0];
    estado.e = inicial.id;
    if (q.get("p") && IDX.provincias[q.get("p")]) {
      estado.p = q.get("p");
      if (q.get("s")) {
        estado.s = q.get("s");
        if (q.get("c")) {
          estado.c = q.get("c").toUpperCase();
          if (q.get("m")) estado.m = q.get("m").toUpperCase();
        }
      }
    }
    escuchar();
    actualizar(false);
  }
  arrancar();
})();
