---
title: "Consultor de pobreza | Datina"
toc: false
---

```js
// Las seis tablas, en JSON (columnas y filas). La consulta guiada se resuelve con ellas en JavaScript: el motor DuckDB pesa
// unos 8 MB y se baja recién cuando la persona abre el editor de SQL libre (más abajo). Las genera scripts/exportar_parquet.py
// junto con los Parquet, con los mismos valores
const deJson = ({columns, data}) => data.map((f) => Object.fromEntries(columns.map((c, i) => [c, f[i]])));
const [jsSerie, jsEdad, jsAglo, jsAgloSerie, jsPartidos, jsFracciones] = await Promise.all([
  FileAttachment("data/serie_nacional.json").json(), FileAttachment("data/pobreza_edad.json").json(),
  FileAttachment("data/aglomerados.json").json(), FileAttachment("data/aglomerados_serie.json").json(),
  FileAttachment("data/gba_partidos_comunas.json").json(), FileAttachment("data/gba_fracciones.json").json()
]);
const T = {serie_nacional: deJson(jsSerie), pobreza_edad: deJson(jsEdad), aglomerados: deJson(jsAglo),
  aglomerados_serie: deJson(jsAgloSerie), gba_partidos_comunas: deJson(jsPartidos), gba_fracciones: deJson(jsFracciones)};

// Orden como el ORDER BY de DuckDB: de menor a mayor o de mayor a menor, con los vacíos al final
const comparar = (x, y) => x === y ? 0 : x == null ? 1 : y == null ? -1 : x < y ? -1 : 1;
const asc = (...cols) => (a, b) => { for (const c of cols) { const r = comparar(a[c], b[c]); if (r) return r; } return 0; };
const desc = (col) => (a, b) => a[col] == null || b[col] == null ? comparar(a[col], b[col]) : comparar(b[col], a[col]);

const CELESTE = "#2C74B5";
const SOL = "#F6B40E";
const TINTA = "#1d2733";
const GRIS = "#9aa6b2";

const num1 = (v) => v == null || Number.isNaN(v) ? "sin dato" : Number(v).toLocaleString("es-AR", {minimumFractionDigits: 1, maximumFractionDigits: 1});
const num0 = (v) => v == null ? "sin dato" : Number(v).toLocaleString("es-AR", {maximumFractionDigits: 0});
// el semestre en palabras para los textos y el selector ("1S 2026" pasa a "Primer semestre de 2026"): los datos, las tablas y la
// consulta SQL lo conservan como viene
const semestreLargo = (p) => String(p).replace(/^([12])S (\d{4})$/, (_, s, a) => `${s === "1" ? "Primer" : "Segundo"} semestre de ${a}`);

// Convierte el resultado de DuckDB (tabla Arrow) en filas comunes de JavaScript.
// Los enteros grandes (BigInt) y los decimales se pasan a número para poder graficarlos y exportarlos.
function aFilas(tabla) {
  const campos = tabla.schema.fields;
  const escalas = new Map(campos.map((f) => [f.name, f.type?.scale ?? null]));
  return tabla.toArray().map((fila) => {
    const o = {};
    for (const f of campos) {
      let v = fila[f.name];
      if (typeof v === "bigint") v = Number(v);
      else if (v != null && typeof v === "object" && !(v instanceof Date) && ArrayBuffer.isView(v) && escalas.get(f.name) != null) {
        v = Number(String(v)) / 10 ** escalas.get(f.name);
      }
      o[f.name] = v;
    }
    return o;
  });
}

// Formato de columnas para las tablas: números con coma decimal, años y códigos como texto
function formatos(filas) {
  const f = {};
  const cols = filas.length ? Object.keys(filas[0]) : [];
  for (const c of cols) {
    if (/^(anio|semestre|fraccion)$/.test(c)) f[c] = (v) => v == null ? "" : String(v);
    else if (/(_pct|_cv|_li|_ls|_miles|_90|_pp)$|^cv$|^pobreza_1s/.test(c)) f[c] = (v) => v == null ? "" : num1(v);
  }
  return f;
}

// Exporta filas a CSV. Variante "excel": punto y coma como separador y coma decimal.
function csv(filas, excel = false) {
  if (!filas.length) return "";
  const sep = excel ? ";" : ",";
  const cols = Object.keys(filas[0]);
  const celda = (v) => {
    if (v == null) return "";
    let s = typeof v === "number" && excel ? String(v).replace(".", ",") : String(v);
    return /[",;\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
  };
  return [cols.join(sep), ...filas.map((r) => cols.map((c) => celda(r[c])).join(sep))].join("\n");
}

function botonesCsv(filas, nombre) {
  const bajar = (excel) => {
    const blob = new Blob(["﻿" + csv(filas, excel)], {type: "text/csv;charset=utf-8"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${nombre}${excel ? "_excel" : ""}.csv`;
    document.body.append(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  };
  const b1 = html`<button type="button">Descargar CSV</button>`;
  const b2 = html`<button type="button">Descargar CSV para Excel</button>`;
  b1.onclick = () => bajar(false);
  b2.onclick = () => bajar(true);
  return html`<div class="descargas">${b1}${b2}<span class="nota">${filas.length.toLocaleString("es-AR")} filas. La versión para Excel separa las columnas con punto y coma y usa coma decimal.</span></div>`;
}

// Escapa texto para meterlo dentro de un literal SQL
const lit = (s) => `'${String(s).replaceAll("'", "''")}'`;
```

```js
const ultimoDe = (ind) => T.serie_nacional.find((d) => d.periodo === "1S 2026" && d.indicador === ind && d.unidad === "personas")?.valor_pct;
const ultimo = {pob_per: ultimoDe("pobreza"), ind_per: ultimoDe("indigencia")};
const periodos = [...new Set(T.serie_nacional.slice().sort(asc("anio", "semestre")).map((d) => d.periodo))];
```

# ¿Cuánta pobreza hay en cada aglomerado, partido y comuna?

<p class="bajada">Acá podés consultar, filtrar y descargar los datos de pobreza e indigencia de la Encuesta Permanente de Hogares (EPH) del INDEC y las estimaciones por partido del Gran Buenos Aires y comuna de CABA. En el primer semestre de 2026, el ${num1(ultimo.pob_per)}% de las personas que viven en los 31 aglomerados urbanos que releva la EPH estaba bajo la línea de pobreza y el ${num1(ultimo.ind_per)}%, bajo la de indigencia.</p>

**De dónde salen los datos.** La serie nacional, los grupos de edad y los 31 aglomerados vienen de la EPH del INDEC: del informe técnico de pobreza e indigencia del primer semestre de 2026, con datos provisorios, y de su anexo de coeficientes de variación. La serie empieza en el segundo semestre de 2016. La EPH cubre solo la población urbana de 31 aglomerados, unos 30,1 millones de personas, y no da datos por provincia.

Las cifras por partido del Gran Buenos Aires, comuna de CABA y fracción censal no son mediciones oficiales. Salen de un modelo de estimación en áreas pequeñas. El modelo se estima con los microdatos de la EPH del primer trimestre de 2026, se aplica a las características de cada radio del Censo 2022 y se calibra para que coincida con el total oficial del primer semestre de 2026: 36,9% de personas pobres en los Partidos del GBA y 11,1% en CABA. La población de referencia es la del Censo 2022.

<p class="aviso"><strong>Cómo leer la precisión.</strong> Cada cifra de la EPH es una estimación hecha con una muestra. El coeficiente de variación (CV) mide su error relativo: el INDEC recomienda leer con cuidado los valores con un CV de entre 16% y 25% y considera no confiables los que superan el 25%. Los intervalos de confianza, al 90%, solo están para el último semestre de los aglomerados y para los partidos y las comunas, donde se calcularon por remuestreo (bootstrap). Las fracciones censales son una capa exploratoria, sin intervalos.</p>

## Consulta guiada

Elegí una tabla y los filtros. Debajo del resultado está la consulta SQL que lo produce: podés copiarla o llevarla al editor de SQL libre para cambiarla. En las tablas y en los gráficos, 1S y 2S quieren decir primer y segundo semestre.

```js
const TABLAS_GUIADAS = new Map([
  ["Serie nacional de los 31 aglomerados, por semestre desde 2016", "serie_nacional"],
  ["Aglomerados y regiones, serie por semestre", "aglomerados_serie"],
  ["Aglomerados y regiones, último semestre, con CV e intervalos", "aglomerados"],
  ["Grupos de edad, 31 aglomerados", "pobreza_edad"],
  ["Partidos del GBA y comunas de CABA, último semestre (estimación)", "gba_partidos_comunas"],
  ["Fracciones censales del GBA y CABA, último semestre (exploratoria)", "gba_fracciones"]
]);
const tabla = view(Inputs.select(TABLAS_GUIADAS, {label: "Tabla", value: "aglomerados", width: 460}));
```

```js
// Qué filtros tienen sentido para cada tabla
const conf = {
  serie_nacional: {unidad: true, periodo: true, grupo: false, buscar: false},
  aglomerados_serie: {unidad: true, periodo: true, grupo: true, buscar: true},
  aglomerados: {unidad: true, periodo: false, grupo: true, buscar: true},
  pobreza_edad: {unidad: false, periodo: true, grupo: true, buscar: false},
  gba_partidos_comunas: {unidad: "gba", periodo: false, grupo: true, buscar: true},
  gba_fracciones: {unidad: false, periodo: false, grupo: true, buscar: true}
}[tabla];

const REGIONES = ["Gran Buenos Aires", "Cuyo", "Noreste", "Noroeste", "Pampeana", "Patagonia"];
const ZONAS = ["Primera corona", "Segunda corona", "La Matanza", "CABA norte", "CABA centro", "CABA sur"];

const opcionesGrupo =
  tabla === "aglomerados" || tabla === "aglomerados_serie"
    ? new Map([
        ["Todos los aglomerados", "aglo"],
        ["Las 6 regiones estadísticas", "regiones"],
        ["Totales y grupos por tamaño", "totales"],
        ...REGIONES.map((r) => [`Aglomerados de la región ${r}`, "r:" + r])
      ])
    : tabla === "pobreza_edad"
    ? new Map([["Grupos generales (0 a 14, 15 a 29, 30 a 64, 65 y más)", "general"], ["Niñez y adolescencia (0 a 17 y subgrupos)", "ninez"]])
    : new Map([
        ["CABA y partidos del GBA", "todo"],
        ["Solo partidos del GBA", "j:GBA"],
        ["Solo comunas de CABA", "j:CABA"],
        ...ZONAS.map((z) => [`Zona ${z}`, "z:" + z])
      ]);

const etiquetaGrupo = tabla === "pobreza_edad" ? "Grupos de edad" : tabla.startsWith("gba") ? "Zona" : "Nivel o región";
```

```js
const indicador = view(Inputs.radio(new Map([["Pobreza", "pobreza"], ["Indigencia", "indigencia"]]), {label: "Indicador", value: "pobreza"}));
```

```js
const unidadInput = conf.unidad === true
  ? Inputs.radio(new Map([["Personas", "personas"], ["Hogares", "hogares"]]), {label: "Contar", value: "personas"})
  : conf.unidad === "gba" && indicador === "pobreza"
  ? Inputs.radio(new Map([["Personas", "personas"], ["Hogares", "hogares"]]), {label: "Contar", value: "personas"})
  : Inputs.radio(new Map([["Personas", "personas"]]), {label: "Contar", value: "personas", disabled: true});
const unidad = view(unidadInput);
```

```js
const grupo = conf.grupo ? view(Inputs.select(opcionesGrupo, {label: etiquetaGrupo, width: 460})) : null;
```

```js
const periodo = conf.periodo
  ? view(Inputs.select(["Todos los semestres", ...periodos.slice().reverse()], {label: "Semestre", format: semestreLargo, width: 460, value: tabla === "aglomerados_serie" ? "1S 2026" : "Todos los semestres"}))
  : "1S 2026";
```

```js
const buscar = conf.buscar
  ? view(Inputs.text({label: "Buscar", width: 460, placeholder: tabla === "gba_fracciones" ? "Partido, comuna o código de fracción" : "Nombre, por ejemplo Córdoba o Matanza"}))
  : "";
```

```js
// Arma la consulta según la tabla y los filtros elegidos: cada condición, cada columna y el orden van en SQL (para mostrar la
// consulta y llevarla al editor) y en JavaScript (para resolverla sin DuckDB). scripts/prueba_guiada.mjs controla que las dos
// den lo mismo en todas las combinaciones de filtros
const guiada = (() => {
  const w = [], filtros = [];
  const donde = (sql, fn) => { w.push(sql); filtros.push(fn); };
  const es = (col, v) => donde(`${col} = ${lit(v)}`, (d) => d[col] === v);
  // ILIKE '%texto%' (sin distinguir mayúsculas) y LIKE '%texto%'
  const ilike = (v) => String(v ?? "").toLowerCase().includes(buscar.toLowerCase());
  const like = (v) => String(v ?? "").includes(buscar);
  const ind = `${indicador}_${unidad}`;
  const unaFecha = conf.periodo && periodo !== "Todos los semestres";
  // select: el texto SQL. columnas: [nombre en el resultado, columna de la tabla]
  let select, columnas, orden, ordenar, nombreCol, valorCol = "valor_pct", li = null, ls = null, cv = null;
  const mismas = (s) => s.split(",").map((c) => [c.trim(), c.trim()]);

  if (tabla === "serie_nacional") {
    es("indicador", indicador); es("unidad", unidad);
    if (unaFecha) es("periodo", periodo);
    select = `periodo, anio, semestre, indicador, unidad, valor_pct`;
    columnas = mismas(select);
    orden = `anio, semestre`; ordenar = asc("anio", "semestre");
    nombreCol = null;
  } else if (tabla === "aglomerados_serie" || tabla === "aglomerados") {
    const nom = tabla === "aglomerados" ? "nombre" : "aglomerado";
    if (grupo === "aglo") es("tipo", "aglomerado");
    else if (grupo === "regiones") es("tipo", "region");
    else if (grupo === "totales") donde(`tipo IN ('total', 'interior', 'tamano')`, (d) => ["total", "interior", "tamano"].includes(d.tipo));
    else if (grupo?.startsWith("r:")) { es("tipo", "aglomerado"); es("region", grupo.slice(2)); }
    if (buscar) donde(`${nom} ILIKE ${lit("%" + buscar + "%")}`, (d) => ilike(d[nom]));
    nombreCol = nom;
    if (tabla === "aglomerados_serie") {
      es("indicador", indicador); es("unidad", unidad);
      if (unaFecha) es("periodo", periodo);
      select = `aglomerado, region, periodo, anio, semestre, indicador, unidad, valor_pct`;
      columnas = mismas(select);
      orden = unaFecha ? `valor_pct DESC NULLS LAST` : `aglomerado, anio, semestre`;
      ordenar = unaFecha ? desc("valor_pct") : asc("aglomerado", "anio", "semestre");
    } else {
      select = `nombre, tipo, region, periodo,\n  ${ind}_pct AS valor_pct, ${ind}_li AS li_90, ${ind}_ls AS ls_90,\n  ${ind}_cv AS cv, ${ind}_miles AS cantidad_miles`;
      columnas = [...mismas("nombre, tipo, region, periodo"), ["valor_pct", `${ind}_pct`], ["li_90", `${ind}_li`], ["ls_90", `${ind}_ls`],
        ["cv", `${ind}_cv`], ["cantidad_miles", `${ind}_miles`]];
      orden = `valor_pct DESC`; ordenar = desc("valor_pct");
      li = "li_90"; ls = "ls_90"; cv = "cv";
    }
  } else if (tabla === "pobreza_edad") {
    es("indicador", indicador); es("serie_grupos", grupo);
    if (unaFecha) es("periodo", periodo);
    select = `periodo, anio, semestre, grupo_edad, indicador, valor_pct`;
    columnas = mismas(select);
    orden = unaFecha ? `valor_pct DESC` : `grupo_edad, anio, semestre`;
    ordenar = unaFecha ? desc("valor_pct") : asc("grupo_edad", "anio", "semestre");
    nombreCol = "grupo_edad";
  } else {
    if (grupo?.startsWith("j:")) es("jurisdiccion", grupo.slice(2));
    else if (grupo?.startsWith("z:")) es("zona", grupo.slice(2));
    if (tabla === "gba_partidos_comunas") {
      if (buscar) donde(`unidad ILIKE ${lit("%" + buscar + "%")}`, (d) => ilike(d.unidad));
      const tieneCv = ind === "pobreza_personas";
      const cantidad = indicador === "pobreza" ? "personas_pobres" : "personas_indigentes";
      select = `unidad, jurisdiccion, zona, periodo, poblacion_censo_2022,\n  ${ind}_pct AS valor_pct, ${ind}_li AS li_90, ${ind}_ls AS ls_90${tieneCv ? `, ${ind}_cv AS cv` : ""},\n  ${cantidad}`;
      columnas = [...mismas("unidad, jurisdiccion, zona, periodo, poblacion_censo_2022"), ["valor_pct", `${ind}_pct`], ["li_90", `${ind}_li`],
        ["ls_90", `${ind}_ls`], ...(tieneCv ? [["cv", `${ind}_cv`]] : []), [cantidad, cantidad]];
      li = "li_90"; ls = "ls_90"; cv = tieneCv ? "cv" : null;
      nombreCol = "unidad";
    } else {
      if (buscar) donde(`(unidad ILIKE ${lit("%" + buscar + "%")} OR fraccion LIKE ${lit("%" + buscar + "%")})`, (d) => ilike(d.unidad) || like(d.fraccion));
      select = `fraccion, unidad, zona, periodo, poblacion_censo_2022,\n  ${indicador}_personas_pct AS valor_pct`;
      columnas = [...mismas("fraccion, unidad, zona, periodo, poblacion_censo_2022"), ["valor_pct", `${indicador}_personas_pct`]];
      nombreCol = "fraccion";
    }
    orden = `valor_pct DESC`; ordenar = desc("valor_pct");
  }
  const sqlTexto = `SELECT ${select}\nFROM ${tabla}${w.length ? "\nWHERE " + w.join("\n  AND ") : ""}\nORDER BY ${orden}`;
  const resolver = (filas) => filas.filter((d) => filtros.every((f) => f(d)))
    .map((d) => Object.fromEntries(columnas.map(([n, c]) => [n, d[c] ?? null]))).sort(ordenar);
  return {sqlTexto, resolver, nombreCol, valorCol, li, ls, cv, unaFecha, ind};
})();
```

```js
const filasGuiada = guiada.resolver(T[tabla]);
```

```js
// Texto que describe exactamente qué mide el gráfico: indicador, unidad, período y población de referencia
const descripcion = (() => {
  const u = unidad === "hogares" ? "hogares" : "personas";
  const que = `${indicador === "pobreza" ? "Pobreza" : "Indigencia"}: % de ${u} ${indicador === "pobreza" ? "bajo la línea de pobreza" : "bajo la línea de indigencia"}`;
  const per = conf.periodo ? (guiada.unaFecha ? semestreLargo(periodo) : "Segundo semestre de 2016 a primer semestre de 2026") : "Primer semestre de 2026";
  const pob = {
    serie_nacional: `sobre el total de ${u} de los 31 aglomerados urbanos`,
    aglomerados_serie: `sobre el total de ${u} de cada aglomerado, región o total`,
    aglomerados: `sobre el total de ${u} de cada aglomerado, región o total`,
    pobreza_edad: `sobre el total de personas de cada grupo de edad, 31 aglomerados urbanos`,
    gba_partidos_comunas: `sobre la población del Censo 2022 de cada partido o comuna (estimación)`,
    gba_fracciones: `sobre la población del Censo 2022 de cada fracción (estimación exploratoria)`
  }[tabla];
  const fuente = tabla.startsWith("gba")
    ? "Fuente: estimación en áreas pequeñas con datos del INDEC (EPH del primer trimestre de 2026 y Censo 2022), calibrada al primer semestre de 2026."
    : "Fuente: INDEC, Encuesta Permanente de Hogares.";
  return {titulo: `${que}, ${pob}. ${per}.`, fuente};
})();
```

```js
function graficoGuiado(filas, width) {
  if (!filas.length) return html`<p class="nota">No hay filas para graficar con estos filtros.</p>`;
  const valor = guiada.valorCol;
  const nombre = tabla === "serie_nacional" ? null : guiada.nombreCol;
  const multiPeriodo = conf.periodo && !guiada.unaFecha;
  const estilo = {fontFamily: "var(--sans-serif)", fontSize: "12px"};
  const pct = (d) => `${d}%`;

  if (multiPeriodo) {
    // Línea en el tiempo
    const series = nombre ? [...new Set(filas.map((d) => d[nombre]))] : [null];
    const pocas = series.length <= 6;
    const paleta = [CELESTE, SOL, TINTA, "#7fb2df", "#b07d00", GRIS];
    const ticks = periodos.filter((_, i) => i % 2 === 1);
    return Plot.plot({
      width,
      height: 380,
      marginLeft: 48,
      marginRight: 20,
      style: estilo,
      x: {type: "point", domain: periodos, ticks, label: null, tickRotate: width < 640 ? -45 : 0},
      y: {grid: true, zero: true, label: "% de " + (unidad === "hogares" ? "hogares" : "personas"), tickFormat: pct},
      color: nombre && pocas ? {domain: series, range: paleta, legend: true} : undefined,
      marks: [
        Plot.ruleY([0]),
        Plot.lineY(filas.filter((d) => d[valor] != null), {
          x: "periodo", y: valor, z: nombre ?? undefined,
          stroke: nombre ? (pocas ? nombre : CELESTE) : CELESTE,
          strokeOpacity: nombre && !pocas ? 0.35 : 1,
          strokeWidth: 2.2
        }),
        Plot.dot(filas.filter((d) => d[valor] != null), {
          x: "periodo", y: valor, fill: nombre && pocas ? nombre : CELESTE, r: 2.5,
          tip: {format: {x: true, y: (v) => num1(v) + "%", fill: true, z: true}},
          channels: nombre ? {Nombre: nombre} : undefined
        }),
      ]
    });
  }

  // Ranking de barras horizontales
  const tope = 40;
  const datos = filas.filter((d) => d[valor] != null).slice(0, tope);
  const cvAlto = (d) => guiada.cv && d[guiada.cv] != null && d[guiada.cv] > 16;
  const nombreB = nombre ?? "periodo";
  const etiqueta = (d) => String(d[nombreB]).replace("Ciudad Autónoma de Buenos Aires", "CABA");
  const largo = Math.max(...datos.map((d) => etiqueta(d).length));
  // en pantallas angostas el margen de los nombres no puede pasar del 42% del ancho (a 320 píxeles quedaba un ancho negativo para
  // las barras y el gráfico daba errores): los nombres que no entran se cortan con puntos suspensivos
  const izq = Math.min(260, 12 + largo * 6.6, Math.round(width * 0.42)), letras = Math.floor((izq - 12) / 6.6);
  const g = Plot.plot({
    width,
    height: datos.length * 22 + 50,
    marginLeft: izq,
    marginRight: 50,
    style: estilo,
    x: {grid: true, label: "% de " + (unidad === "hogares" ? "hogares" : "personas"), labelAnchor: "left", tickFormat: pct, axis: "top"},
    color: {type: "identity"},
    y: {domain: datos.map(etiqueta), label: null, tickFormat: (s) => s.length > letras ? s.slice(0, letras - 1) + "…" : s},
    marks: [
      Plot.barX(datos, {
        x: valor, y: etiqueta,
        fill: (d) => cvAlto(d) ? SOL : CELESTE,
        fillOpacity: guiada.li ? 0.35 : 0.9,
        tip: {format: {x: (v) => num1(v) + "%", y: true, fill: false}},
        channels: guiada.cv ? {"CV %": (d) => d[guiada.cv]} : undefined
      }),
      guiada.li ? Plot.ruleY(datos, {y: etiqueta, x1: guiada.li, x2: guiada.ls, stroke: TINTA, strokeWidth: 1.2}) : null,
      guiada.li ? Plot.dot(datos, {y: etiqueta, x: valor, fill: (d) => cvAlto(d) ? "#b07d00" : CELESTE, r: 3.5}) : null,
      Plot.text(datos, {x: guiada.ls ?? valor, y: etiqueta, text: (d) => num1(d[valor]) + "%", dx: 6, textAnchor: "start", fill: TINTA}),
      Plot.ruleX([0])
    ]
  });
  const notas = [];
  if (guiada.li) notas.push("La línea horizontal es el intervalo de confianza al 90%.");
  if (guiada.cv) notas.push("En amarillo, las estimaciones con un CV mayor a 16%, que hay que leer con cuidado.");
  if (filas.length > tope) notas.push(`El gráfico muestra las ${tope} filas con el valor más alto, de un total de ${filas.length.toLocaleString("es-AR")}. La tabla tiene todas.`);
  return html`${g}${notas.length ? html`<p class="pie-grafico">${notas.join(" ")}</p>` : ""}`;
}
```

```js
tabla === "gba_partidos_comunas" && indicador === "indigencia"
  ? html`<p class="nota">Para indigencia en partidos y comunas solo hay estimación en personas.</p>`
  : tabla === "gba_fracciones"
  ? html`<p class="nota">Las fracciones solo tienen estimación en personas y no tienen intervalos de confianza. Usalas para explorar, no para comparar decimales.</p>`
  : html`<span></span>`
```

<p class="titulo-grafico">${descripcion.titulo}</p>

```js
display(resize((width) => graficoGuiado(filasGuiada, width)));
```

<p class="pie-grafico">${descripcion.fuente}</p>

```js
// encabezados en castellano para leer la tabla: el CSV y la consulta SQL conservan los nombres de las columnas
const encabezadosGuiada = {
  periodo: "Período", anio: "Año", semestre: "Semestre (1 o 2)", indicador: "Indicador", unidad: tabla.startsWith("gba") ? "Partido o comuna" : "Unidad",
  valor_pct: `${indicador === "pobreza" ? "Pobreza" : "Indigencia"} (% de ${unidad === "hogares" ? "hogares" : "personas"})`,
  li_90: "Mínimo (intervalo al 90%)", ls_90: "Máximo (intervalo al 90%)", cv: "Error relativo (CV, %)",
  cantidad_miles: `${unidad === "hogares" ? "Hogares" : "Personas"} ${indicador === "pobreza" ? "pobres" : "indigentes"} (miles)`,
  nombre: "Aglomerado, región o total", aglomerado: "Aglomerado, región o total", tipo: "Tipo", region: "Región", grupo_edad: "Grupo de edad",
  jurisdiccion: "Jurisdicción", zona: "Zona", fraccion: "Fracción censal", poblacion_censo_2022: "Población (Censo 2022)",
  personas_pobres: "Personas pobres (estimación)", personas_indigentes: "Personas indigentes (estimación)"
};
display(Inputs.table(filasGuiada, {locale: "es-AR", format: formatos(filasGuiada), header: encabezadosGuiada, rows: 12, maxWidth: 1100}));
display(botonesCsv(filasGuiada, `consulta_${tabla}`));
```

<details>
<summary>Ver la consulta SQL de este resultado</summary>

```js
const llevar = html`<button type="button">Llevar esta consulta al editor de SQL libre</button>`;
llevar.onclick = () => cargarEnEditor(guiada.sqlTexto, true);
display(html`<pre class="sql-generado">${guiada.sqlTexto}</pre>`);
display(llevar);
```

</details>

## SQL libre

Escribí cualquier consulta de DuckDB sobre las seis tablas. Todo corre en tu navegador: nada se envía a un servidor. El motor de consultas se baja al abrir el editor, que trae ejemplos para empezar. Los nombres de tablas y columnas están en el [diccionario de datos](./diccionario).

```js
// El editor usa DuckDB, que corre en el navegador y pesa unos 8 MB: se baja recién cuando la persona abre el editor (o lleva a él
// la consulta guiada), no al abrir la página
const sqlAbierto = Mutable(false);
const abrirSql = () => { sqlAbierto.value = true; };
const suave = () => matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
```

```js
const EJEMPLOS = [
  {
    nombre: "Serie nacional de pobreza en personas",
    sql: `-- Pobreza en personas, % del total de personas de los 31 aglomerados, por semestre
SELECT periodo, valor_pct
FROM serie_nacional
WHERE indicador = 'pobreza' AND unidad = 'personas'
ORDER BY anio, semestre`
  },
  {
    nombre: "Aglomerados con CV alto",
    sql: `-- Aglomerados cuya pobreza en personas del 1S 2026 tiene CV mayor a 16%
SELECT nombre, region, pobreza_personas_pct, pobreza_personas_cv,
       pobreza_personas_li, pobreza_personas_ls
FROM aglomerados
WHERE tipo = 'aglomerado' AND pobreza_personas_cv > 16
ORDER BY pobreza_personas_cv DESC`
  },
  {
    nombre: "Cambio interanual por aglomerado",
    sql: `-- Diferencia en puntos porcentuales de la pobreza en personas entre 1S 2025 y 1S 2026
SELECT a.aglomerado, a.region,
       a.valor_pct AS pobreza_1s2025, b.valor_pct AS pobreza_1s2026,
       round(b.valor_pct - a.valor_pct, 1) AS cambio_pp
FROM aglomerados_serie a
JOIN aglomerados_serie b USING (aglomerado, indicador, unidad)
WHERE a.periodo = '1S 2025' AND b.periodo = '1S 2026'
  AND a.indicador = 'pobreza' AND a.unidad = 'personas' AND a.tipo = 'aglomerado'
ORDER BY cambio_pp DESC`
  },
  {
    nombre: "Personas pobres por zona del GBA",
    sql: `-- Personas pobres estimadas por zona, 1S 2026, sobre población del Censo 2022
SELECT zona,
       sum(poblacion_censo_2022) AS poblacion,
       sum(personas_pobres) AS personas_pobres,
       round(100.0 * sum(personas_pobres) / sum(poblacion_censo_2022), 1) AS pobreza_pct
FROM gba_partidos_comunas
GROUP BY zona
ORDER BY pobreza_pct DESC`
  }
];
```

```js
// Editor: un formulario cuyo valor es la consulta. Se ejecuta con el botón o con Ctrl + Enter.
const editor = (() => {
  const form = html`<form class="sql-libre">
    <label for="sql-libre-texto" class="nota">Consulta SQL</label>
    <textarea id="sql-libre-texto" name="q" rows="10" spellcheck="false" autocomplete="off" autocapitalize="off"></textarea>
    <div class="acciones"><button type="submit" class="principal">Ejecutar consulta</button><span class="nota">También con Ctrl + Enter</span></div>
  </form>`;
  form.q.value = EJEMPLOS[0].sql;
  form.value = EJEMPLOS[0].sql;
  form.onsubmit = (e) => {
    e.preventDefault();
    form.value = form.q.value;
    form.dispatchEvent(new Event("input", {bubbles: true}));
  };
  form.q.onkeydown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); form.requestSubmit(); }
  };
  return form;
})();

function cargarEnEditor(texto, desplazar = false) {
  editor.q.value = texto;
  editor.value = texto;
  editor.dispatchEvent(new Event("input", {bubbles: true}));
  abrirSql();
  // si el editor estaba cerrado aparece en el cuadro siguiente
  if (desplazar) setTimeout(() => editor.scrollIntoView({behavior: suave(), block: "center"}), 60);
}
```

```js
if (!sqlAbierto) {
  const b = html`<button type="button" class="principal">Abrir el editor de SQL</button>`;
  b.onclick = () => { abrirSql(); setTimeout(() => editor.q.focus(), 60); };
  display(html`<div class="descargas">${b}<span class="nota">Baja el motor de consultas DuckDB, unos 8 MB. La primera vez puede tardar unos segundos.</span></div>`);
} else {
  display(html`<div class="ejemplos"><span class="nota">Ejemplos:</span>${EJEMPLOS.map((ej) => {
    const b = html`<button type="button">${ej.nombre}</button>`;
    b.onclick = () => cargarEnEditor(ej.sql);
    return b;
  })}</div>`);
}
```

```js
const consultaLibre = sqlAbierto ? view(editor) : "";
```

```js
// DuckDB con las seis tablas, desde los Parquet, solo con el editor abierto. Desde el 23 de octubre de 2026 el motor se baja de
// jsDelivr, su CDN oficial, en la misma versión que traía el sitio (1.29.0): sus dos archivos (36 y 41 MB) superan el máximo de 25 MB
// por archivo de Cloudflare Pages, donde se publica Datina, y ya no van adentro del sitio. La consulta guiada no usa DuckDB y anda igual
// sin jsDelivr. Cada tabla queda como una vista con el nombre de su archivo, como con el cliente de Observable que se usaba antes
const DUCKDB = "https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.29.0/+esm";
const PARQUET = {
  serie_nacional: FileAttachment("data/serie_nacional.parquet"), pobreza_edad: FileAttachment("data/pobreza_edad.parquet"),
  aglomerados: FileAttachment("data/aglomerados.parquet"), aglomerados_serie: FileAttachment("data/aglomerados_serie.parquet"),
  gba_partidos_comunas: FileAttachment("data/gba_partidos_comunas.parquet"), gba_fracciones: FileAttachment("data/gba_fracciones.parquet")
};
const db = sqlAbierto ? await (async () => {
  const duckdb = await import(DUCKDB);
  const bundle = await duckdb.selectBundle(duckdb.getJsDelivrBundles());
  // el trabajador viene de otro dominio: se arma desde un Blob que lo importa
  const trabajador = URL.createObjectURL(new Blob([`importScripts("${bundle.mainWorker}");`], {type: "text/javascript"}));
  const motor = new duckdb.AsyncDuckDB(new duckdb.VoidLogger(), new Worker(trabajador));
  await motor.instantiate(bundle.mainModule, bundle.pthreadWorker);
  URL.revokeObjectURL(trabajador);
  const con = await motor.connect();
  for (const [nombre, archivo] of Object.entries(PARQUET)) {
    await motor.registerFileBuffer(`${nombre}.parquet`, new Uint8Array(await archivo.arrayBuffer()));
    await con.query(`CREATE VIEW ${nombre} AS SELECT * FROM read_parquet('${nombre}.parquet')`);
  }
  return {query: (texto) => con.query(texto)};
})() : null;
```

```js
async function consultar(texto) {
  return aFilas(await db.query(texto));
}
```

```js
const resultadoLibre = !db ? {ok: false, cerrado: true} : await (async () => {
  const texto = consultaLibre.trim();
  if (!texto) return {ok: false, vacia: true};
  const t0 = performance.now();
  try {
    const filas = await consultar(texto);
    return {ok: true, filas, ms: performance.now() - t0};
  } catch (e) {
    return {ok: false, error: String(e?.message ?? e)};
  }
})();
```

```js
if (resultadoLibre.cerrado) {
  // el editor todavía no se abrió
} else if (resultadoLibre.vacia) {
  display(html`<p class="nota">Escribí una consulta y apretá Ejecutar consulta.</p>`);
} else if (!resultadoLibre.ok) {
  display(html`<div class="error-sql"><p><strong>No se pudo ejecutar la consulta.</strong> Revisá la sintaxis y los nombres de tablas y columnas (están en el diccionario de datos). Detalle técnico que devolvió DuckDB, en inglés:</p><code>${resultadoLibre.error}</code></div>`);
} else if (!resultadoLibre.filas.length) {
  display(html`<p class="nota">La consulta funcionó, pero no devolvió ninguna fila.</p>`);
} else {
  display(html`<p class="nota">Resultado en ${num0(resultadoLibre.ms)} milisegundos.</p>`);
  display(Inputs.table(resultadoLibre.filas, {locale: "es-AR", format: formatos(resultadoLibre.filas), rows: 15, maxWidth: 1100}));
  display(botonesCsv(resultadoLibre.filas, "consulta_sql_libre"));
}
```

## Descargar los datos

Cada tabla está en formato Parquet, un formato abierto y liviano que se lee con DuckDB, R, Python, QGIS o Power BI. El detalle de cada columna está en el [diccionario de datos](./diccionario).

```js
const ARCHIVOS = [
  {tabla: "serie_nacional", archivo: FileAttachment("data/serie_nacional.parquet"), que: "Pobreza e indigencia en personas y hogares, total de los 31 aglomerados, por semestre desde el segundo semestre de 2016"},
  {tabla: "pobreza_edad", archivo: FileAttachment("data/pobreza_edad.parquet"), que: "Pobreza e indigencia por grupo de edad, total de los 31 aglomerados, por semestre"},
  {tabla: "aglomerados", archivo: FileAttachment("data/aglomerados.parquet"), que: "Aglomerados, regiones y totales en el primer semestre de 2026, con CV, intervalos de confianza al 90% y cantidades"},
  {tabla: "aglomerados_serie", archivo: FileAttachment("data/aglomerados_serie.parquet"), que: "Serie semestral por aglomerado, región y total"},
  {tabla: "gba_partidos_comunas", archivo: FileAttachment("data/gba_partidos_comunas.parquet"), que: "Estimación del primer semestre de 2026 por partido del GBA y comuna de CABA, con intervalos y datos del Censo 2022 como contexto"},
  {tabla: "gba_fracciones", archivo: FileAttachment("data/gba_fracciones.parquet"), que: "Estimación exploratoria del primer semestre de 2026 por fracción censal, sin intervalos"}
];
const conteos = Object.fromEntries(ARCHIVOS.map((a) => [a.tabla, T[a.tabla].length]));
display(html`<table class="lista-tablas">
  <thead><tr><th>Tabla</th><th>Qué contiene</th><th style="text-align:right">Filas</th><th>Archivo</th></tr></thead>
  <tbody>${ARCHIVOS.map((a) => html`<tr>
    <td><code>${a.tabla}</code></td>
    <td>${a.que}</td>
    <td style="text-align:right">${num0(conteos[a.tabla])}</td>
    <td><a href=${a.archivo.href} download=${a.tabla + ".parquet"}>${a.tabla}.parquet</a></td>
  </tr>`)}</tbody>
</table>`);
```

<p class="nota">Para leer un archivo con DuckDB en tu computadora: <code>SELECT * FROM 'aglomerados.parquet'</code>. En R: <code>arrow::read_parquet("aglomerados.parquet")</code>. En Python: <code>pandas.read_parquet("aglomerados.parquet")</code>.</p>
