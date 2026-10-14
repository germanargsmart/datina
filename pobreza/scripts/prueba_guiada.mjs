// Prueba de la consulta guiada de src/index.md: desde el 13 de octubre de 2026 se resuelve en JavaScript con las tablas en JSON, para no
// bajar el motor DuckDB (unos 8 MB) al abrir la página. La página sigue mostrando la consulta SQL equivalente, y esta prueba controla
// que las dos den lo mismo en todas las combinaciones de filtros: corre cada consulta SQL en DuckDB sobre los Parquet y la compara con
// el resultado de JavaScript (mismas columnas en el mismo orden, mismas filas y el mismo orden según el ORDER BY).
//
// Uso, desde la carpeta pobreza/ (la primera vez hay que instalar DuckDB para Node, sin sumarlo al proyecto):
//   npm install --no-save @duckdb/node-api
//   node scripts/prueba_guiada.mjs
import {readFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(RAIZ, "src");

let duck;
try {
  duck = await import("@duckdb/node-api");
} catch {
  console.error("Falta DuckDB para Node. Instalalo con: npm install --no-save @duckdb/node-api");
  process.exit(2);
}

// los bloques de código de la página que arman la consulta guiada: el primero (tablas y orden), el de los filtros posibles y el de la consulta
const pagina = readFileSync(join(SRC, "index.md"), "utf8").replace(/\r\n/g, "\n");
const bloques = [...pagina.matchAll(/```js\n([\s\S]*?)```/g)].map((m) => m[1]);
const bloque = (texto) => {
  const b = bloques.find((x) => x.includes(texto));
  if (!b) throw new Error(`no se encontró en index.md el bloque con ${texto}`);
  return b;
};
const codigo = [bloque("const deJson ="), bloque("const conf = {"), bloque("const guiada = (() =>")].join("\n");

const jsonCache = new Map();
const FileAttachment = (ruta) => ({
  json: async () => {
    if (!jsonCache.has(ruta)) jsonCache.set(ruta, JSON.parse(readFileSync(join(SRC, ruta), "utf8")));
    return jsonCache.get(ruta);
  }
});
const AsyncFunction = (async () => {}).constructor;
const armar = new AsyncFunction("FileAttachment", "tabla", "indicador", "unidad", "grupo", "periodo", "buscar",
  `${codigo}\nreturn {conf, opcionesGrupo, periodos: typeof periodos === "undefined" ? null : periodos, sqlTexto: guiada.sqlTexto, filas: guiada.resolver(T[tabla])};`);

// DuckDB con las seis tablas desde los Parquet
const instancia = await duck.DuckDBInstance.create(":memory:");
const con = await instancia.connect();
const TABLAS = ["serie_nacional", "pobreza_edad", "aglomerados", "aglomerados_serie", "gba_partidos_comunas", "gba_fracciones"];
for (const t of TABLAS) await con.run(`CREATE VIEW ${t} AS SELECT * FROM '${join(SRC, "data", t + ".parquet").replace(/\\/g, "/")}'`);
const enDuckDB = async (sql) => {
  const r = await con.runAndReadAll(sql);
  const cols = r.columnNames();
  const filas = r.getRowObjectsJS().map((f) => Object.fromEntries(cols.map((c) => [c, typeof f[c] === "bigint" ? Number(f[c]) : f[c]])));
  return {cols, filas};
};

// los semestres, como en la página (de la serie nacional)
const serie = JSON.parse(readFileSync(join(SRC, "data", "serie_nacional.json"), "utf8"));
const iP = serie.columns.indexOf("periodo"), iA = serie.columns.indexOf("anio"), iS = serie.columns.indexOf("semestre");
const PERIODOS = [...new Set(serie.data.slice().sort((a, b) => a[iA] - b[iA] || a[iS] - b[iS]).map((f) => f[iP]))];
const BUSQUEDAS = ["", "cor", "CÓR", "río", "MATANZA", "comuna 1", "0201", "zzz"];

const igual = (x, y) => x === y || (typeof x === "number" && typeof y === "number" && Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(x)));
const clave = (f, cols) => JSON.stringify(cols.map((c) => f[c]));
let combinaciones = 0, conFilas = 0;
const fallas = [];
for (const tabla of TABLAS) {
  for (const indicador of ["pobreza", "indigencia"]) {
    const {conf, opcionesGrupo} = await armar(FileAttachment, tabla, indicador, "personas", null, "1S 2026", "");
    const unidades = conf.unidad === true || (conf.unidad === "gba" && indicador === "pobreza") ? ["personas", "hogares"] : ["personas"];
    const grupos = conf.grupo ? [...opcionesGrupo.values()] : [null];
    const periodos = conf.periodo ? ["Todos los semestres", ...PERIODOS] : ["1S 2026"];
    const busquedas = conf.buscar ? BUSQUEDAS : [""];
    for (const unidad of unidades) for (const grupo of grupos) for (const periodo of periodos) for (const buscar of busquedas) {
      combinaciones++;
      const js = await armar(FileAttachment, tabla, indicador, unidad, grupo, periodo, buscar);
      const db = await enDuckDB(js.sqlTexto);
      const donde = `${tabla} | ${indicador} | ${unidad} | ${grupo} | ${periodo} | "${buscar}"`;
      const colsJs = js.filas.length ? Object.keys(js.filas[0]) : db.cols;
      if (colsJs.join() !== db.cols.join()) { fallas.push(`${donde}: columnas ${colsJs} contra ${db.cols}`); continue; }
      if (js.filas.length !== db.filas.length) { fallas.push(`${donde}: ${js.filas.length} filas contra ${db.filas.length} de DuckDB`); continue; }
      if (js.filas.length) conFilas++;
      // las mismas filas (sin importar el orden de los empates)...
      const a = js.filas.map((f) => clave(f, db.cols)).sort(), b = db.filas.map((f) => clave(f, db.cols)).sort();
      const distinta = a.findIndex((x, i) => {
        const fx = JSON.parse(x), fy = JSON.parse(b[i]);
        return fx.some((v, j) => !igual(v, fy[j]));
      });
      if (distinta >= 0) { fallas.push(`${donde}: fila distinta ${a[distinta]} contra ${b[distinta]}`); continue; }
      // ...y en el mismo orden según las columnas del ORDER BY
      const ordenCols = js.sqlTexto.split("ORDER BY ")[1].split(",").map((s) => s.trim().split(/\s+/)[0]);
      const mal = js.filas.findIndex((f, i) => ordenCols.some((c) => !igual(f[c], db.filas[i][c])));
      if (mal >= 0) fallas.push(`${donde}: el orden difiere en la fila ${mal + 1}`);
    }
  }
}
console.log(`${combinaciones} combinaciones de filtros (${conFilas} con filas): ${fallas.length ? fallas.length + " con diferencias" : "JavaScript y DuckDB dan lo mismo"}`);
for (const f of fallas.slice(0, 20)) console.log("  " + f);
process.exit(fallas.length ? 1 : 0);
