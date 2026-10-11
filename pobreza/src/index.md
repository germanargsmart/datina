---
title: "Pobreza en la Argentina: consultas"
toc: false
sql:
  serie_nacional: ./data/serie_nacional.parquet
  pobreza_edad: ./data/pobreza_edad.parquet
  aglomerados: ./data/aglomerados.parquet
  aglomerados_serie: ./data/aglomerados_serie.parquet
  gba_partidos_comunas: ./data/gba_partidos_comunas.parquet
  gba_fracciones: ./data/gba_fracciones.parquet
---

```js
// Cliente DuckDB (corre en el navegador) con las seis tablas ya cargadas desde los Parquet
import {getDefaultClient} from "npm:@observablehq/duckdb";
const db = await getDefaultClient();

const CELESTE = "#2C74B5";
const SOL = "#F6B40E";
const TINTA = "#1d2733";
const GRIS = "#9aa6b2";

const num1 = (v) => v == null || Number.isNaN(v) ? "sin dato" : Number(v).toLocaleString("es-AR", {minimumFractionDigits: 1, maximumFractionDigits: 1});
const num0 = (v) => v == null ? "sin dato" : Number(v).toLocaleString("es-AR", {maximumFractionDigits: 0});

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

async function consultar(texto) {
  return aFilas(await db.query(texto));
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
  return html`<div class="descargas">${b1}${b2}<span class="nota">${filas.length.toLocaleString("es-AR")} filas. La versión para Excel usa coma decimal.</span></div>`;
}

// Escapa texto para meterlo dentro de un literal SQL
const lit = (s) => `'${String(s).replaceAll("'", "''")}'`;
```

```js
const ultimo = (await consultar(`
  SELECT
    max(CASE WHEN indicador = 'pobreza' AND unidad = 'personas' THEN valor_pct END) AS pob_per,
    max(CASE WHEN indicador = 'indigencia' AND unidad = 'personas' THEN valor_pct END) AS ind_per
  FROM serie_nacional WHERE periodo = '1S 2026'`))[0];
const periodos = (await consultar(`SELECT DISTINCT periodo, anio, semestre FROM serie_nacional ORDER BY anio, semestre`)).map((d) => d.periodo);
```

# Pobreza en la Argentina: consultas

<p class="bajada">Los datos del tablero de pobreza e indigencia, abiertos para consultar, filtrar y descargar. En el primer semestre de 2026, el ${num1(ultimo.pob_per)}% de las personas que viven en los 31 aglomerados urbanos relevados por la EPH estaba bajo la línea de pobreza y el ${num1(ultimo.ind_per)}% bajo la línea de indigencia.</p>

**De dónde salen los datos.** La serie nacional, los grupos de edad y los 31 aglomerados vienen de la Encuesta Permanente de Hogares (EPH) del INDEC, informe técnico de pobreza e indigencia del 1S 2026 (datos provisorios) y su anexo de coeficientes de variación. La serie arranca en el 2S 2016. La EPH cubre solo población urbana de 31 aglomerados (unos 30,1 millones de personas) y no mide provincias.

Las cifras por partido del Gran Buenos Aires, comuna de la Ciudad y fracción censal no son mediciones oficiales. Salen de un modelo de estimación en áreas pequeñas: se estima en los microdatos de la EPH del 1T 2026, se aplica a las características de cada radio del Censo 2022 y se calibra para reproducir el total oficial del 1S 2026 (36,9% de personas pobres en los Partidos del GBA y 11,1% en la Ciudad). Su población de referencia es la censal de 2022.

<p class="aviso"><strong>Cómo leer la precisión.</strong> Cada cifra de la EPH es una estimación por muestra. El coeficiente de variación (CV) mide su error relativo: el INDEC recomienda leer con cuidado los valores con CV entre 16% y 25% y considera no confiables los que superan 25%. Los intervalos de confianza son al 90% y solo existen para el último semestre (aglomerados) y para partidos y comunas (intervalos bootstrap). Las fracciones censales son una capa exploratoria sin intervalos.</p>

## Consulta guiada

Elegí una tabla y los filtros. El resultado se arma con una consulta SQL que se muestra abajo, así podés copiarla o llevarla a la caja de SQL libre para modificarla.

```js
const TABLAS_GUIADAS = new Map([
  ["Serie nacional, 31 aglomerados (2S 2016 a 1S 2026)", "serie_nacional"],
  ["Aglomerados y regiones, serie por semestre", "aglomerados_serie"],
  ["Aglomerados y regiones, 1S 2026 con CV e intervalos", "aglomerados"],
  ["Grupos de edad, 31 aglomerados", "pobreza_edad"],
  ["Partidos del GBA y comunas de la Ciudad, 1S 2026 (estimación)", "gba_partidos_comunas"],
  ["Fracciones censales del GBA y la Ciudad, 1S 2026 (exploratorio)", "gba_fracciones"]
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
        ["Ciudad y conurbano", "todo"],
        ["Solo partidos del GBA", "j:GBA"],
        ["Solo comunas de la Ciudad", "j:CABA"],
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
  ? view(Inputs.select(["Todos los semestres", ...periodos.slice().reverse()], {label: "Semestre", width: 460, value: tabla === "aglomerados_serie" ? "1S 2026" : "Todos los semestres"}))
  : "1S 2026";
```

```js
const buscar = conf.buscar
  ? view(Inputs.text({label: "Buscar", width: 460, placeholder: tabla === "gba_fracciones" ? "Partido, comuna o código de fracción" : "Nombre, por ejemplo Córdoba o Matanza"}))
  : "";
```

```js
// Arma la consulta SQL según la tabla y los filtros elegidos
const guiada = (() => {
  const w = [];
  const ind = `${indicador}_${unidad}`;
  const unaFecha = conf.periodo && periodo !== "Todos los semestres";
  let select, orden, nombreCol, valorCol = "valor_pct", li = null, ls = null, cv = null;

  if (tabla === "serie_nacional") {
    w.push(`indicador = ${lit(indicador)}`, `unidad = ${lit(unidad)}`);
    if (unaFecha) w.push(`periodo = ${lit(periodo)}`);
    select = `periodo, anio, semestre, indicador, unidad, valor_pct`;
    orden = `anio, semestre`;
    nombreCol = null;
  } else if (tabla === "aglomerados_serie" || tabla === "aglomerados") {
    const nom = tabla === "aglomerados" ? "nombre" : "aglomerado";
    if (grupo === "aglo") w.push(`tipo = 'aglomerado'`);
    else if (grupo === "regiones") w.push(`tipo = 'region'`);
    else if (grupo === "totales") w.push(`tipo IN ('total', 'interior', 'tamano')`);
    else if (grupo?.startsWith("r:")) w.push(`tipo = 'aglomerado'`, `region = ${lit(grupo.slice(2))}`);
    if (buscar) w.push(`${nom} ILIKE ${lit("%" + buscar + "%")}`);
    nombreCol = nom;
    if (tabla === "aglomerados_serie") {
      w.push(`indicador = ${lit(indicador)}`, `unidad = ${lit(unidad)}`);
      if (unaFecha) w.push(`periodo = ${lit(periodo)}`);
      select = `aglomerado, region, periodo, anio, semestre, indicador, unidad, valor_pct`;
      orden = unaFecha ? `valor_pct DESC NULLS LAST` : `aglomerado, anio, semestre`;
    } else {
      select = `nombre, tipo, region, periodo,\n  ${ind}_pct AS valor_pct, ${ind}_li AS li_90, ${ind}_ls AS ls_90,\n  ${ind}_cv AS cv, ${ind}_miles AS cantidad_miles`;
      orden = `valor_pct DESC`;
      li = "li_90"; ls = "ls_90"; cv = "cv";
    }
  } else if (tabla === "pobreza_edad") {
    w.push(`indicador = ${lit(indicador)}`, `serie_grupos = ${lit(grupo)}`);
    if (unaFecha) w.push(`periodo = ${lit(periodo)}`);
    select = `periodo, anio, semestre, grupo_edad, indicador, valor_pct`;
    orden = unaFecha ? `valor_pct DESC` : `grupo_edad, anio, semestre`;
    nombreCol = "grupo_edad";
  } else {
    if (grupo?.startsWith("j:")) w.push(`jurisdiccion = ${lit(grupo.slice(2))}`);
    else if (grupo?.startsWith("z:")) w.push(`zona = ${lit(grupo.slice(2))}`);
    if (tabla === "gba_partidos_comunas") {
      if (buscar) w.push(`unidad ILIKE ${lit("%" + buscar + "%")}`);
      const tieneCv = ind === "pobreza_personas";
      select = `unidad, jurisdiccion, zona, periodo, poblacion_censo_2022,\n  ${ind}_pct AS valor_pct, ${ind}_li AS li_90, ${ind}_ls AS ls_90${tieneCv ? `, ${ind}_cv AS cv` : ""},\n  ${indicador === "pobreza" ? "personas_pobres" : "personas_indigentes"}`;
      li = "li_90"; ls = "ls_90"; cv = tieneCv ? "cv" : null;
      nombreCol = "unidad";
    } else {
      if (buscar) w.push(`(unidad ILIKE ${lit("%" + buscar + "%")} OR fraccion LIKE ${lit("%" + buscar + "%")})`);
      select = `fraccion, unidad, zona, periodo, poblacion_censo_2022,\n  ${indicador}_personas_pct AS valor_pct`;
      nombreCol = "fraccion";
    }
    orden = `valor_pct DESC`;
  }
  const sqlTexto = `SELECT ${select}\nFROM ${tabla}${w.length ? "\nWHERE " + w.join("\n  AND ") : ""}\nORDER BY ${orden}`;
  return {sqlTexto, nombreCol, valorCol, li, ls, cv, unaFecha, ind};
})();
```

```js
const filasGuiada = await consultar(guiada.sqlTexto);
```

```js
// Texto que describe exactamente qué mide el gráfico: indicador, unidad, período y población de referencia
const descripcion = (() => {
  const u = unidad === "hogares" ? "hogares" : "personas";
  const que = `${indicador === "pobreza" ? "Pobreza" : "Indigencia"}: % de ${u} ${indicador === "pobreza" ? "bajo la línea de pobreza" : "bajo la línea de indigencia"}`;
  const per = conf.periodo ? (guiada.unaFecha ? periodo : "2S 2016 a 1S 2026") : "1S 2026";
  const pob = {
    serie_nacional: `sobre el total de ${u} de los 31 aglomerados urbanos`,
    aglomerados_serie: `sobre el total de ${u} de cada aglomerado, región o total`,
    aglomerados: `sobre el total de ${u} de cada aglomerado, región o total`,
    pobreza_edad: `sobre el total de personas de cada grupo de edad, 31 aglomerados urbanos`,
    gba_partidos_comunas: `sobre la población censal 2022 de cada partido o comuna (estimación)`,
    gba_fracciones: `sobre la población censal 2022 de cada fracción (estimación exploratoria)`
  }[tabla];
  const fuente = tabla.startsWith("gba")
    ? "Fuente: estimación en áreas pequeñas sobre INDEC, EPH 1T 2026 y Censo 2022, calibrada al 1S 2026."
    : "Fuente: INDEC, EPH.";
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
  if (guiada.cv) notas.push("En amarillo, estimaciones con CV mayor a 16%: leer con cuidado.");
  if (filas.length > tope) notas.push(`Se muestran las ${tope} filas con mayor valor de un total de ${filas.length.toLocaleString("es-AR")}. La tabla tiene todas.`);
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
display(Inputs.table(filasGuiada, {locale: "es-AR", format: formatos(filasGuiada), rows: 12, maxWidth: 1100}));
display(botonesCsv(filasGuiada, `consulta_${tabla}`));
```

<details>
<summary>Ver la consulta SQL de este resultado</summary>

```js
const llevar = html`<button type="button">Llevar esta consulta a la caja de SQL libre</button>`;
llevar.onclick = () => cargarEnEditor(guiada.sqlTexto, true);
display(html`<pre class="sql-generado">${guiada.sqlTexto}</pre>`);
display(llevar);
```

</details>

## SQL libre

Escribí cualquier consulta de DuckDB sobre las seis tablas. Todo corre en tu navegador: nada se envía a un servidor. Podés empezar con uno de estos ejemplos. Los nombres de tablas y columnas están en el [diccionario de datos](./diccionario).

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
  editor.requestSubmit();
  if (desplazar) editor.scrollIntoView({behavior: "smooth", block: "center"});
}
```

```js
display(html`<div class="ejemplos"><span class="nota">Ejemplos:</span>${EJEMPLOS.map((ej) => {
  const b = html`<button type="button">${ej.nombre}</button>`;
  b.onclick = () => cargarEnEditor(ej.sql);
  return b;
})}</div>`);
```

```js
const consultaLibre = view(editor);
```

```js
const resultadoLibre = await (async () => {
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
if (resultadoLibre.vacia) {
  display(html`<p class="nota">Escribí una consulta y apretá Ejecutar consulta.</p>`);
} else if (!resultadoLibre.ok) {
  display(html`<div class="error-sql"><p><strong>No se pudo ejecutar la consulta.</strong> Revisá la sintaxis y los nombres de tablas y columnas (están en el diccionario de datos). Detalle técnico que devolvió DuckDB, en inglés:</p><code>${resultadoLibre.error}</code></div>`);
} else if (!resultadoLibre.filas.length) {
  display(html`<p class="nota">La consulta corrió bien pero no devolvió filas.</p>`);
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
  {tabla: "serie_nacional", archivo: FileAttachment("data/serie_nacional.parquet"), que: "Pobreza e indigencia en personas y hogares, total 31 aglomerados, por semestre desde 2S 2016"},
  {tabla: "pobreza_edad", archivo: FileAttachment("data/pobreza_edad.parquet"), que: "Pobreza e indigencia por grupo de edad, total 31 aglomerados, por semestre"},
  {tabla: "aglomerados", archivo: FileAttachment("data/aglomerados.parquet"), que: "Aglomerados, regiones y totales en el 1S 2026, con CV, intervalos al 90% y cantidades"},
  {tabla: "aglomerados_serie", archivo: FileAttachment("data/aglomerados_serie.parquet"), que: "Serie semestral por aglomerado, región y total"},
  {tabla: "gba_partidos_comunas", archivo: FileAttachment("data/gba_partidos_comunas.parquet"), que: "Estimación 1S 2026 por partido del GBA y comuna de la Ciudad, con intervalos y datos censales de contexto"},
  {tabla: "gba_fracciones", archivo: FileAttachment("data/gba_fracciones.parquet"), que: "Estimación exploratoria 1S 2026 por fracción censal, sin intervalos"}
];
const conteos = Object.fromEntries(
  (await consultar(ARCHIVOS.map((a) => `SELECT '${a.tabla}' AS t, count(*) AS n FROM ${a.tabla}`).join(" UNION ALL "))).map((d) => [d.t, d.n])
);
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
