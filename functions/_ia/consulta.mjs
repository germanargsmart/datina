// Consultas con IA (25 de octubre de 2026, pedido del autor: "empezá a integrar IA para consultas generativas con la información").
// Contesta POST /api/consulta (functions/api/consulta.js) con un modelo que lee las tablas del propio sitio. Cómo funciona, qué cuesta y
// cómo se activa: docs/ia/CONSULTAS.md. La prueba, con las API simuladas: node scripts/prueba_consulta_ia.mjs.
//
// Dos motores, según "consulta_ia_motor" de datos/manual/sitio.json (va en el índice) o la variable DATINA_IA_MOTOR:
// - "anthropic": un modelo de Claude que elige y lee las tablas con la herramienta leer_tabla. Necesita la clave ANTHROPIC_API_KEY (un
//   secreto de Cloudflare Pages que pone el autor).
// - "cloudflare" (26 de octubre de 2026, opción gratis): un modelo abierto de Cloudflare Workers AI. La función elige antes las tablas que
//   más se parecen a la pregunta y le pasa solo esas (conversarCF). Necesita la conexión "AI" de Workers AI en Cloudflare Pages, que pone
//   el autor, y entra en los 10.000 "neurons" por día que Cloudflare da gratis.
// Sin eso, o sin el índice sitio/datos/consulta_ia.json, que 03_construir_sitio.py escribe solo con "consulta_ia": true en
// datos/manual/sitio.json, queda apagada.
// El modelo solo puede leer las tablas de ese índice (las del Catálogo de datos, sin las de suicidio) y de cada tabla nunca recibe una
// columna ni una fila que hable de suicidio (CLAUDE.md, "Temas sensibles"). Datina no guarda las preguntas: en el registro de Cloudflare
// queda solo cuántos tokens usó cada consulta.
//
// La respuesta es una línea de JSON por evento (lo lee sitio/consulta-ia.js, que sale de scripts/consulta_ia.js):
//   {"t":"paso","texto"}  {"t":"texto","texto"}  {"t":"reinicio"}  {"t":"fuentes","fichas":[{"titulo","url","tabla"}]}  {"t":"error","texto"}  {"t":"fin"}
import Anthropic from "./anthropic-sdk.mjs";
import { INDICACIONES, INDICACIONES_CF } from "./indicaciones.mjs";

// el modelo, salvo que el autor elija otro con DATINA_IA_MODELO (docs/ia/CONSULTAS.md compara costos)
export const MODELO = "claude-opus-5-5";
// topes de cada consulta: largo de la pregunta, vueltas del modelo (cada lectura de tablas es una vuelta), tokens que puede escribir en
// cada vuelta (contando lo que piensa), filas y caracteres que recibe de cada tabla
export const TOPES = {pregunta: 400, vueltas: 6, tokens: 8000, filas: 300, caracteres: 30000};
const SIN_SUICIDIO = /suicid|autoinflig|autolesi/i;
// la columna de período de cada tabla, la primera que tenga (el año antes que el mes: en algunas tablas "mes" es el número del mes)
const COLS_PERIODO = ["periodo", "fecha", "anio", "año", "mes", "eleccion"];
// los semestres ("1S2026") se comparan como "2026-S1", así entran en el orden de los años (26 de octubre de 2026)
const clavePeriodo = v => { const m = /^(\d)([ST])(\d{4})$/i.exec(v); return m ? `${m[3]}-${m[2].toUpperCase()}${m[1]}` : v; };
const COBERTURA = {"Las 24 jurisdicciones y el total del país": "provincias y país", "Las 24 jurisdicciones": "provincias",
                   "Total del país": "país", "Sin desglose territorial": "sin provincias"};
const NO_ACTIVA = "Las consultas con IA no están activadas.";
const NO_DISPONIBLE = "Las consultas con IA no están disponibles en este momento. Probá más tarde.";
const MUCHAS = "Hay muchas consultas en este momento. Probá de nuevo en unos minutos.";
const NO_PUEDO = "No puedo contestar esa pregunta con los datos de Datina.";

const responderJSON = (estado, cuerpo, extra = {}) => new Response(JSON.stringify(cuerpo), {
  status: estado, headers: {"Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extra}});
// para comparar sin mayúsculas ni tildes (lo que es solo ASCII, que es casi todo, no pasa por normalize)
const normal = s => /^[\x00-\x7f]*$/.test(s) ? s.toLowerCase().trim() : String(s).normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

// ---------- el índice de tablas ----------
// se lee en cada consulta (un archivo del propio sitio): así nunca queda uno viejo después de publicar
export async function cargarIndice(leer) {
  const r = await leer("/datos/consulta_ia.json");
  if (!r.ok) return null;
  const d = await r.json();
  if (!d || !Array.isArray(d.tablas) || !d.tablas.length) return null;
  // el constructor ya deja afuera las tablas que hablan de suicidio: si alguna llegara, tampoco se ofrece
  const tablas = new Map(d.tablas.filter(t => !SIN_SUICIDIO.test(`${t.tabla} ${t.titulo} ${t.descripcion}`)).map(t => [t.tabla, t]));
  // una línea por tabla, siempre en el mismo orden: el texto tiene que ser idéntico entre consultas para que la caché lo reconozca
  const texto = `Índice de las tablas de Datina, con datos actualizados al ${d.actualizado}. Una tabla por línea: nombre | pregunta de su ficha | ` +
    "qué mide | cobertura | período | columnas.\n" + [...tablas.values()].map(t => [t.tabla, t.titulo, t.descripcion, COBERTURA[t.cobertura] || t.cobertura,
      t.periodo, t.columnas.map(c => c[0]).filter(c => !SIN_SUICIDIO.test(c)).join(", ")].join(" | ")).join("\n");
  return {tablas, texto, motor: d.motor, actualizado: d.actualizado};
}

// ---------- leer una tabla ----------
// CSV con comillas: los campos entre comillas pueden tener comas, comillas dobles y saltos de línea. En el plan gratuito, Cloudflare da
// 10 ms de procesador por pedido, y separar los campos es lo que más tarda: antes se descartan las filas que nombran el suicidio y las que
// no pasan el prefiltro (`pasa`), y se separan como mucho `max` filas (las demás solo se cuentan, en `total`)
const CAMPO = /"((?:[^"]|"")*)"|([^,]*)/y;
function campos(l) {
  if (!l.includes('"')) return l.split(",");
  const out = [];
  for (CAMPO.lastIndex = 0; ;) {
    const m = CAMPO.exec(l);
    out.push(m[1] !== undefined ? m[1].replace(/""/g, '"') : m[2]);
    if (CAMPO.lastIndex >= l.length || l[CAMPO.lastIndex] !== ",") break;
    if (++CAMPO.lastIndex === l.length) { out.push(""); break; }
  }
  return out;
}
// si la línea tiene una cantidad impar de comillas, un campo sigue en la línea de abajo
function impar(l) {
  let n = 0;
  for (let j = l.indexOf('"'); j >= 0; j = l.indexOf('"', j + 1)) n++;
  return n % 2 === 1;
}
function filasCSV(texto, pasa = () => true, max = Infinity) {
  const lineas = texto.replace(/^\uFEFF/, "").split("\n"), filas = [];
  let cab = null, total = 0;
  for (let i = 0; i < lineas.length; i++) {
    let l = lineas[i];
    while (impar(l) && i + 1 < lineas.length) l += "\n" + lineas[++i];
    if (l.endsWith("\r")) l = l.slice(0, -1);
    if (l === "") continue;
    if (!cab) { cab = campos(l); continue; }
    if (SIN_SUICIDIO.test(l) || !pasa(l)) continue;
    if (++total <= max) filas.push(campos(l));
  }
  return {cab: cab || [], filas, total};
}
// el prefiltro de un valor: el texto tal cual, sin distinguir mayúsculas ni tildes (es más amplio que el filtro, que compara la celda entera)
const VOCALES = {a: "aáàâä", e: "eéèêë", i: "iíìîï", o: "oóòôö", u: "uúùûü", n: "nñ", c: "cç"};
const patron = v => normal(v).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/[aeiounc]/g, x => `[${VOCALES[x]}]`);
const celdaCSV = v => /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;

// valida lo que pidió el modelo: el esquema estricto ya lo garantiza, pero es una entrada que viene de afuera y se revisa igual
function entradaValida(x) {
  const lista = v => Array.isArray(v) && v.every(s => typeof s === "string");
  return x && typeof x === "object" && typeof x.tabla === "string" && lista(x.columnas) && typeof x.desde === "string" && typeof x.hasta === "string"
    && Array.isArray(x.filtros) && x.filtros.every(f => f && typeof f.columna === "string" && lista(f.valores));
}

export async function leerTabla(entrada, indice, leer) {
  if (!entradaValida(entrada)) return {error: "La consulta a la tabla no tiene el formato esperado: tabla, columnas, filtros, desde y hasta."};
  const info = indice.tablas.get(entrada.tabla.replace(/\.csv$/, ""));
  if (!info) return {error: `No hay ninguna tabla llamada "${entrada.tabla}". Usá un nombre exacto del índice.`};
  const r = await leer(`/datos/${info.tabla}.csv`);
  if (!r.ok) return {error: `No se pudo leer la tabla ${info.tabla}.`};
  // los filtros sin valores no filtran
  const filtros = entrada.filtros.filter(f => f.valores.some(v => v.trim()));
  const variantes = f => f.valores.map(v => v.trim()).filter(Boolean).flatMap(v => f.columna === "codigo_indec" && /^\d$/.test(v) ? [v, "0" + v] : [v]);
  const previos = filtros.map(f => new RegExp(variantes(f).map(patron).join("|"), "i"));
  const conPeriodo = !!(entrada.desde.trim() || entrada.hasta.trim());
  // el prefiltro también por período cuando es un año (26 de octubre de 2026): las líneas que no nombran ningún año del rango no se
  // separan en campos, que es lo que gasta procesador. El filtro de período de abajo sigue decidiendo
  // (no en las tablas cuyo período es solo el número del mes, que no nombran años)
  const a0 = +(entrada.desde.trim().match(/^\d{4}/) || [0])[0], a1 = +(entrada.hasta.trim().match(/^\d{4}/) || [new Date().getFullYear() + 1])[0];
  const colsInfo = info.columnas.map(c => c[0]);
  if (a0 && a1 >= a0 && a1 - a0 < 30 && COLS_PERIODO.find(c => colsInfo.includes(c)) !== "mes")
    previos.push(new RegExp(Array.from({length: a1 - a0 + 1}, (_, i) => a0 + i).join("|")));
  const leida = filasCSV(await r.text(), l => previos.every(x => x.test(l)), filtros.length || conPeriodo ? Infinity : TOPES.filas);
  const cab0 = leida.cab;
  // nunca una columna ni una fila sobre suicidio (en las tablas de muertes violentas y de la comparación con la OCDE)
  const usar = cab0.map((c, i) => SIN_SUICIDIO.test(c) ? -1 : i).filter(i => i >= 0);
  const cab = usar.map(i => cab0[i]);
  let filas = usar.length === cab0.length ? leida.filas : leida.filas.map(f => usar.map(i => f[i] ?? ""));
  const pos = c => cab.indexOf(c);
  const faltan = [...entrada.columnas, ...filtros.map(f => f.columna)].filter(c => pos(c) < 0);
  if (faltan.length) return {error: `La tabla ${info.tabla} no tiene ${faltan.map(c => `"${c}"`).join(", ")}. Sus columnas: ${cab.join(", ")}.`};
  const avisos = [];
  for (const f of filtros) {
    const i = pos(f.columna), cod = f.columna === "codigo_indec";
    const val = new Set(variantes(f).map(v => cod && /^\d$/.test(v) ? "0" + v : normal(v)));
    filas = filas.filter(x => val.has(cod && /^\d$/.test(x[i]) ? "0" + x[i] : normal(x[i] ?? "")));
  }
  if (conPeriodo) {
    const cp = COLS_PERIODO.map(pos).find(i => i >= 0);
    if (cp === undefined) avisos.push("Esta tabla no tiene una columna de período: no se aplicaron desde ni hasta.");
    else if (!filas.some(x => /^\d{4}/.test(clavePeriodo(x[cp] ?? "")))) avisos.push("La columna de período de esta tabla no trae años: no se aplicaron desde ni hasta.");
    else {
      const d = entrada.desde.trim(), h = entrada.hasta.trim();
      filas = filas.filter(x => { const k = clavePeriodo(x[cp] ?? ""); return /^\d{4}/.test(k) && (!d || k >= d) && (!h || k <= h + "\uffff"); });
    }
  }
  // sin filtros, las filas que no se separaron también cuentan
  const total = filtros.length || conPeriodo ? filas.length : leida.total;
  if (total > TOPES.filas) {
    filas = filas.slice(0, TOPES.filas);
    avisos.push(`Se muestran las primeras ${TOPES.filas} de ${total} filas: filtrá por territorio o por período para ver el resto.`);
  }
  const sel = entrada.columnas.length ? entrada.columnas.map(pos) : cab.map((_, i) => i);
  let csv = [sel.map(i => cab[i]), ...filas.map(x => sel.map(i => x[i]))].map(f => f.map(celdaCSV).join(",")).join("\n");
  if (csv.length > TOPES.caracteres) {
    const fin = csv.lastIndexOf("\n", TOPES.caracteres);
    csv = csv.slice(0, fin > 0 ? fin : TOPES.caracteres);
    avisos.push("La tabla quedó cortada por su largo: pedí menos columnas o filtrá más.");
  }
  const columnas = info.columnas.filter(c => !SIN_SUICIDIO.test(c[0])).map(([n, tipo, val]) => `${n} (${tipo.toLowerCase()}: ${val})`).join("; ");
  const datos = [`Tabla ${info.tabla}.csv, de la ficha "${info.titulo}" (sección ${info.seccion}).`,
    info.descripcion && `Qué mide: ${info.descripcion}.`, info.fuente && `Fuente: ${info.fuente} ${info.actualizacion || ""}`.trim(),
    `Cobertura: ${info.cobertura}.` + (info.periodo ? ` Período: ${info.periodo}.` : ""),
    info.unidades?.length && `Unidades: ${info.unidades.join(", ")}.`, info.nota && `Nota de método: ${info.nota}`,
    `Columnas: ${columnas}.`, `Filas que cumplen la consulta: ${total}.`, ...avisos].filter(Boolean);
  return {texto: datos.join("\n") + "\n\n" + csv, info};
}

// ---------- la consulta ----------
const HERRAMIENTAS = [{
  name: "leer_tabla",
  description: "Lee una tabla de Datina, una de las del índice, y devuelve sus filas en CSV con su fuente, sus unidades, su nota de método " +
    `y qué trae cada columna. Devuelve como máximo ${TOPES.filas} filas: filtrá por territorio o por período para traer solo lo necesario.`,
  // strict: el modelo siempre manda un pedido con este esquema. Sin eager_input_streaming: los pedidos son cortos y así la API los
  // valida antes de mandarlos
  strict: true,
  input_schema: {
    type: "object", additionalProperties: false, required: ["tabla", "columnas", "filtros", "desde", "hasta"],
    properties: {
      tabla: {type: "string", description: "Nombre exacto de la tabla, como está en el índice, sin .csv"},
      columnas: {type: "array", items: {type: "string"}, description: "Las columnas que querés ver. Vacío para ver todas."},
      filtros: {type: "array", description: "Cada filtro deja las filas cuya columna tiene alguno de los valores, sin distinguir mayúsculas ni " +
        "tildes. Por ejemplo, codigo_indec con [\"00\", \"14\"]. Vacío para no filtrar.",
        items: {type: "object", additionalProperties: false, required: ["columna", "valores"],
                properties: {columna: {type: "string"}, valores: {type: "array", items: {type: "string"}}}}},
      desde: {type: "string", description: "Primer período que querés, como está en la tabla (año, año-mes o fecha). Vacío para empezar desde el primero."},
      hasta: {type: "string", description: "Último período que querés. Vacío para llegar hasta el último."},
    },
  },
}];

// los modelos con respaldo del lado de la API: si el modelo declina por sus filtros de seguridad, la misma llamada sigue con el que
// recomienda Anthropic para ese caso (fallbacks "default"). Haiku no tiene respaldo
const conRespaldo = m => /^claude-(opus-5|sonnet-5-5|fable-5)/.test(m);

// después de un respaldo a mitad de respuesta, lo que escribió el primer modelo antes de la marca se devuelve solo como texto
function sanear(contenido) {
  const marca = contenido.map(b => b.type).lastIndexOf("fallback");
  return marca < 0 ? contenido : contenido.filter((b, i) => i > marca || b.type === "text");
}

function mensajeDeError(err) {
  if (err instanceof Anthropic.RateLimitError) return MUCHAS;
  if (err instanceof Anthropic.APIError && err.status === 529) return MUCHAS;
  return NO_DISPONIBLE;
}

async function conversar({pregunta, indice, cliente, modelo, leer, enviar, corte}) {
  const mensajes = [{role: "user", content: pregunta}];
  const consultadas = new Map(), uso = {vueltas: 0, entrada: 0, salida: 0, cache_lectura: 0, cache_escritura: 0};
  const sistema = [{type: "text", text: INDICACIONES}, {type: "text", text: indice.texto, cache_control: {type: "ephemeral"}}];
  let final = "error";
  try {
    for (let vuelta = 0; vuelta < TOPES.vueltas; vuelta++) {
      const ultima = vuelta === TOPES.vueltas - 1;
      const params = {
        model: modelo, max_tokens: TOPES.tokens, system: sistema, tools: HERRAMIENTAS, messages: mensajes,
        // en la última vuelta ya no puede leer más tablas: contesta con lo que tiene. Cambiar tool_choice no invalida la caché de las
        // herramientas ni de las instrucciones
        tool_choice: {type: ultima ? "none" : "auto"},
        output_config: {effort: "medium"},
        // además de las instrucciones y el índice, la caché guarda la conversación de una vuelta a la siguiente
        cache_control: {type: "ephemeral"},
        ...(conRespaldo(modelo) ? {betas: ["server-side-fallback-2026-07-01"], fallbacks: "default"} : {}),
      };
      const flujo = cliente.beta.messages.stream(params, {signal: corte.signal});
      let escrito = false;
      flujo.on("text", t => { escrito = true; enviar({t: "texto", texto: t}); });
      const msj = await flujo.finalMessage();
      uso.vueltas++;
      uso.entrada += msj.usage.input_tokens || 0;
      uso.salida += msj.usage.output_tokens || 0;
      uso.cache_lectura += msj.usage.cache_read_input_tokens || 0;
      uso.cache_escritura += msj.usage.cache_creation_input_tokens || 0;
      if (msj.stop_reason === "refusal") {
        enviar({t: "reinicio"});
        enviar({t: "error", texto: NO_PUEDO});
        final = "rechazo";
        return uso;
      }
      const contenido = sanear(msj.content);
      if (msj.stop_reason === "pause_turn") {
        mensajes.push({role: "assistant", content: contenido});
        continue;
      }
      const pedidos = contenido.filter(b => b.type === "tool_use");
      if (!pedidos.length) {
        final = msj.stop_reason === "max_tokens" ? "cortada" : "bien";
        if (final === "cortada") enviar({t: "texto", texto: "\n\n(La respuesta quedó incompleta: probá con una pregunta más acotada.)"});
        break;
      }
      // un pedido cortado por el tope de tokens puede parecer completo: no se ejecuta
      if (msj.stop_reason === "max_tokens") {
        enviar({t: "reinicio"});
        enviar({t: "error", texto: NO_DISPONIBLE});
        final = "cortada";
        return uso;
      }
      // lo que escribió antes de pedir tablas no es la respuesta
      if (escrito) enviar({t: "reinicio"});
      mensajes.push({role: "assistant", content: contenido});
      const resultados = [];
      for (const p of pedidos) {
        const info = p.name === "leer_tabla" && p.input && indice.tablas.get(String(p.input.tabla || "").replace(/\.csv$/, ""));
        if (info) enviar({t: "paso", texto: `Leyendo «${info.titulo}»…`});
        const res = p.name === "leer_tabla" ? await leerTabla(p.input, indice, leer) : {error: `No existe la herramienta ${p.name}.`};
        if (res.info) consultadas.set(res.info.tabla, {titulo: res.info.titulo, url: res.info.url, tabla: res.info.tabla});
        resultados.push(res.error ? {type: "tool_result", tool_use_id: p.id, is_error: true, content: res.error}
                                  : {type: "tool_result", tool_use_id: p.id, content: res.texto});
      }
      if (vuelta + 1 === TOPES.vueltas - 1) {
        resultados.push({type: "text", text: "Ya no quedan lecturas de tablas: contestá con los datos que leíste."});
      }
      mensajes.push({role: "user", content: resultados});
      enviar({t: "paso", texto: "Revisando los datos…"});
    }
    if (final === "error") final = "bien";
    if (consultadas.size) enviar({t: "fuentes", fichas: [...consultadas.values()]});
    enviar({t: "fin"});
  } catch (err) {
    if (corte.signal.aborted) { final = "cortada por quien preguntó"; return uso; }
    // ni la pregunta ni la clave van al registro: solo qué falló
    console.error(JSON.stringify({consulta_ia: "error", estado: err?.status, tipo: err?.error?.error?.type || err?.name, pedido: err?.requestID}));
    enviar({t: "error", texto: mensajeDeError(err)});
  } finally {
    console.log(JSON.stringify({consulta_ia: final, modelo, ...uso, tablas: consultadas.size}));
  }
  return uso;
}

// ---------- el motor gratis: Cloudflare Workers AI (26 de octubre de 2026, opción B de docs/ia/CONSULTAS.md) ----------
// Un modelo abierto, sin herramientas: la función busca en el índice las tablas que más se parecen a la pregunta (como el buscador del
// sitio), las lee con leerTabla (filtradas por la provincia nombrada y por los últimos años) y le manda solo eso. Así cada pregunta gasta
// unos 7.000 tokens de entrada y entran unas 30 por día en lo gratis. Con DATINA_IA_MODELO_CF el autor puede elegir otro modelo
export const MODELO_CF = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
export const TOPES_CF = {tablas: 3, filas: 60, caracteres: 6000, tokens: 700};
const AGOTADO = "Por hoy se terminaron las consultas gratis de Datina. Se renuevan a las 21, hora de Argentina. Mientras, podés buscar el dato en el Catálogo de datos.";
const SIN_TABLAS = "No encontré tablas de Datina sobre eso. Probá con otras palabras o buscá en el Catálogo de datos.";
// sobre suicidio el modelo no se llama: la respuesta es siempre esta (CLAUDE.md, "Temas sensibles")
export const AYUDA_SUICIDIO = "Datina trata ese tema en la sección Salud, sin cifras destacadas ni comparaciones entre provincias. Si vos o alguien cercano " +
  "está pasando un momento difícil, podés pedir ayuda gratis al Centro de Asistencia al Suicida: 135 desde la Ciudad de Buenos Aires y el Gran " +
  "Buenos Aires, (011) 5275-1135 desde todo el país, y en una emergencia, 107.";
// las provincias, para filtrar las tablas por su código (las más largas primero: "Ciudad de Buenos Aires" antes que "Buenos Aires")
const PROVINCIAS = [["ciudad autonoma de buenos aires", "02"], ["ciudad de buenos aires", "02"], ["capital federal", "02"], ["caba", "02"],
  ["provincia de buenos aires", "06"], ["buenos aires", "06"], ["pba", "06"], ["catamarca", "10"], ["cordoba", "14"], ["corrientes", "18"],
  ["chaco", "22"], ["chubut", "26"], ["entre rios", "30"], ["formosa", "34"], ["jujuy", "38"], ["la pampa", "42"], ["la rioja", "46"],
  ["mendoza", "50"], ["misiones", "54"], ["neuquen", "58"], ["rio negro", "62"], ["salta", "66"], ["san juan", "70"], ["san luis", "74"],
  ["santa cruz", "78"], ["santa fe", "82"], ["santiago del estero", "86"], ["tucuman", "90"], ["tierra del fuego", "94"]]
  .sort((a, b) => b[0].length - a[0].length);
const VACIAS = new Set(("del las los que cuanto cuanta cuantos cuantas como cual cuales donde quien quienes hay esta estan fue mas menos muy " +
  "tiene tienen cada sus para con sin por una unos unas provincia provincias pais argentina datos dato cuando entre hasta desde sobre hubo habia " +
  "fue fueron son ano anos este esta estos estas ultimo ultima ultimos ultimas actual hoy").split(" "));
// palabras de todos los días que las tablas dicen de otra manera
const SINONIMOS = {gana: "salario", ganan: "salario", sueldo: "salario", sueldos: "salario", presos: "carcel", plata: "ingreso", trabajo: "empleo",
  luz: "electricidad", nafta: "combustible", bebes: "nacidos", chicos: "menores"};
const raiz = w => w.length > 5 ? w.slice(0, w.length - 2) : w;
// la tabla principal de los temas que más se preguntan (como PRINCIPAL en el buscador del sitio): va primero aunque otra tenga más palabras
// de la pregunta (con "inflación de los últimos doce meses" ganaba la de rubros, que tiene "doce meses" en su pregunta)
const TABLA_PRINCIPAL = {inflacion: "inflacion_mensual", precios: "inflacion_mensual", salario: "salarios_provincias", sueldo: "salarios_provincias",
  gana: "salarios_provincias", pobreza: "pobreza_serie", indigencia: "pobreza_serie", nafta: "combustibles_provincias", petroleo: "hidrocarburos_provincias",
  glaciares: "glaciares_provincias", turistas: "turistas_no_residentes_anual", homicidios: "homicidios_provincias", exporta: "exportaciones_provincias",
  exportaciones: "exportaciones_provincias", empleo: "empleo_provincias", reservas: "reservas_bcra", deuda: "deuda_pbi",
  // "¿cuántos habitantes tiene Córdoba?" elegía la tabla de las capitales (viviendas por habitante) y daba la población de la ciudad
  habitantes: "poblacion_proyectada_provincias", poblacion: "poblacion_proyectada_provincias"};

export function elegirTablas(pregunta, indice) {
  let q = ` ${normal(pregunta).replace(/[^a-z0-9]+/g, " ").trim()} `, prov = "";
  for (const [n, c] of PROVINCIAS) if (q.includes(` ${n} `)) { prov = c; q = q.replace(` ${n} `, " "); break; }
  const anio = (q.match(/\b(19|20)\d\d\b/) || [""])[0];
  // cada palabra y, si tiene, su sinónimo ("gana" está en la pregunta de la ficha de salarios, "salario" en su descripción)
  const crudas = q.trim().split(" ").filter(w => w.length > 2 && !VACIAS.has(w) && !/^\d+$/.test(w));
  const principales = new Set(crudas.map(w => TABLA_PRINCIPAL[w]).filter(Boolean));
  const pal = [...new Set(crudas.flatMap(w => SINONIMOS[w] ? [w, SINONIMOS[w]] : [w]).map(raiz))];
  if (!pal.length) return {prov, anio, tablas: []};
  const puntos = [...indice.tablas.values()].map(t => {
    const tit = normal(t.titulo), desc = normal(`${t.descripcion} ${t.seccion}`), resto = normal(`${t.tabla} ${t.columnas.map(c => c[0]).join(" ")} ${(t.unidades || []).join(" ")}`);
    let p = 0;
    for (const w of pal) p += tit.includes(w) ? 3 : desc.includes(w) ? 2 : resto.includes(w) ? 1 : 0;
    // con una provincia nombrada, mejor las tablas que la tienen
    if (p && prov) p += /24 jurisdicciones/.test(t.cobertura) ? 2 : /Sin desglose|Total del país/.test(t.cobertura) ? -2 : 0;
    // con un año en la pregunta no: la tabla principal suele tener solo los últimos años y la serie larga quedaba afuera
    if (principales.has(t.tabla) && !anio) p += 6;
    return {t, p};
  }).filter(x => x.p > 0).sort((a, b) => b.p - a.p);
  const tope = puntos.length ? Math.max(2, puntos[0].p * 0.6) : 0;
  // "¿qué provincia tiene más...?": muestraCF suma la más alta y la más baja de cada columna
  const extremos = /\b(mas|menos|mayor|menor|mayores|menores|maximo|minimo|primera|ultima|ranking|lidera|encabeza)\b/.test(q) && !prov;
  return {prov, anio, extremos, tablas: puntos.filter(x => x.p >= tope).slice(0, TOPES_CF.tablas).map(x => x.t)};
}

// lo que recibe el modelo de una tabla: lo de leerTabla con la provincia nombrada y los últimos dos años de la tabla, y de las filas, las
// últimas que entran. Si la pregunta nombra un año, también las de ese año
async function muestraCF(info, prov, anio, indice, leer, extremos = false) {
  const cols = new Set(info.columnas.map(c => c[0]));
  const cp = COLS_PERIODO.some(c => cols.has(c));
  const ultimo = (String(info.periodo || "").match(/(\d{4})\D*$/) || [])[1];
  const anioFinal = ultimo || (String(info.descripcion || "").match(/(\d{4})\D*$/) || [])[1];
  const anioInicio = (String(info.periodo || info.descripcion || "").match(/\d{4}/) || [])[0];
  const glosa = COLUMNAS_CF[info.tabla]?.(+anioFinal, +anioInicio);
  const filtros = prov && cols.has("codigo_indec") ? [{columna: "codigo_indec", valores: [prov, "00"]}] : [];
  const partes = async (desde, hasta) => {
    const r = await leerTabla({tabla: info.tabla, columnas: [], filtros, desde, hasta}, indice, leer);
    if (r.error) return null;
    const corte = r.texto.indexOf("\n\n"), filas = r.texto.slice(corte + 2).split("\n");
    return {meta: r.texto.slice(0, corte), cab: filas.shift(), filas, info: r.info};
  };
  const recientes = await partes(cp && ultimo ? String(+ultimo - 1) : "", "");
  if (!recientes) return null;
  let filas = recientes.filas.slice(-TOPES_CF.filas);
  const total = recientes.filas.length;
  if (cp && anio && !(ultimo && +anio >= +ultimo - 1)) {
    const delAnio = await partes(anio, anio);
    if (delAnio?.filas.length) filas = [...delAnio.filas.slice(0, TOPES_CF.filas / 3), ...filas.slice(-TOPES_CF.filas * 2 / 3)];
  }
  // si no entra, se sacan filas del medio: quedan las del año pedido, si hay, y las últimas
  while (filas.length > 2 && filas.join("\n").length > TOPES_CF.caracteres) filas.splice(Math.floor(filas.length / 3), 1);
  const aviso = filas.length < total ? `\nSe muestran ${filas.length} filas de las ${total} que cumplen la consulta.` : "";
  // sin el nombre del archivo, que el modelo copiaba en la respuesta ("según la tabla inflacion_mensual"), y con qué es cada columna
  // cuando el nombre no alcanza
  // (en la línea de las columnas, los rangos también sin punto de miles, como las cifras)
  const meta = recientes.meta.replace(/^Tabla \S+\.csv, de la ficha/, "Datos de la ficha")
    .replace(/^Columnas: .*$/m, l => l.replace(/(\d)\.(?=\d{3}(?!\d))/g, "$1")) +
    (glosa && !/NaN/.test(glosa) ? `\nQué es cada columna: ${glosa}.` : "");
  const cab = campos(recientes.cab);
  const tabla = [cab.join(" | "), ...filas.map(l => campos(l).map((v, i) => cifraAR(v, cab[i] || "")).join(" | "))].join("\n");
  return {texto: `${meta}${aviso}${extremos ? extremosCF(cab, filas) : ""}\n\n${tabla}`, info: recientes.info};
}

// la más alta y la más baja de cada columna numérica, sin el total del país: ordenar 24 filas es donde el modelo gratis se equivocaba
// ("¿Cuál es la provincia con más homicidios?" daba la de la tasa más alta con la cantidad de víctimas de tres años)
function extremosCF(cab, lineas) {
  const ter = cab.indexOf("territorio"), cod = cab.indexOf("codigo_indec");
  if (ter < 0) return "";
  let filas = lineas.map(campos).filter(f => f[cod] !== "00" && !/^(todo el pa[ií]s|total)/i.test(f[ter] || ""));
  // con varios períodos, solo el último: si no, la más alta podía ser de otro año
  const cp = cab.findIndex(c => COLS_PERIODO.includes(c));
  if (cp >= 0) {
    const ult = filas.map(f => clavePeriodo(f[cp] ?? "")).sort().at(-1);
    filas = filas.filter(f => clavePeriodo(f[cp] ?? "") === ult);
  }
  if (filas.length < 5) return "";
  const notas = cab.map((c, i) => {
    if (i === ter || NO_ES_CIFRA.test(c)) return "";
    const v = filas.filter(f => /^-?\d+(\.\d+)?$/.test(f[i] ?? "")).sort((a, b) => b[i] - a[i]);
    if (v.length < 5) return "";
    return `${c}: la más alta es ${v[0][ter]} (${cifraAR(v[0][i], c)}) y la más baja, ${v.at(-1)[ter]} (${cifraAR(v.at(-1)[i], c)})`;
  }).filter(Boolean).slice(0, 8);
  return notas.length ? `\nSin contar el total del país, ${notas.join(". ")}.` : "";
}

// columnas cuyo nombre no alcanza para saber qué miden (con homicidios, el modelo llamó tasa a las víctimas de tres años), con los años
// de la tabla (a, el último, e i, el primero, salen de "Qué mide": el modelo escribía "el último año" sin nombrarlo)
const COLUMNAS_CF = {
  poblacion_proyectada_provincias: (a, i) => `personas_hoy, la población proyectada por el INDEC para ${i}, la de este año. personas_${a}, la ` +
    `proyectada para ${a}. var_personas y var_pct, cuánto cambia de ${i} a ${a}, en personas y en porcentaje. anio_maximo, el año en que la ` +
    `población proyectada llega a su máximo`,
  // las dos tablas de las capitales no traen "Qué mide": el modelo dio la población de la ciudad de Córdoba como la de la provincia
  capitales: () => "territorio, la ciudad capital de la provincia (su municipio, y en la Ciudad de Buenos Aires sus 15 comunas), no la provincia " +
    "entera. poblacion y viviendas, las de esa ciudad en el Censo 2022",
  capitales_eph: () => "territorio, el aglomerado urbano de la capital de la provincia que mide la Encuesta Permanente de Hogares (como Gran La " +
    "Plata), no la provincia entera. aglomerado, su código. pobreza e indigencia, porcentaje de personas. desocupacion y empleo, tasas en " +
    "porcentaje, promedio de los últimos cuatro trimestres. alquila, porcentaje de hogares inquilinos. cv_pobreza y cv_indigencia, el " +
    "coeficiente de variación de esas estimaciones",
  homicidios_provincias: a => `victimas_3, las víctimas sumadas de ${a - 2} a ${a}. tasa_3, víctimas por año cada 100 mil habitantes, en ` +
    `promedio de ${a - 2} a ${a}. victimas, las víctimas de ${a}. tasa, víctimas cada 100 mil habitantes en ${a}. pct_varones, porcentaje de ` +
    `varones entre las víctimas de ${a}`,
};

// las cifras redondeadas y con coma decimal, para que el modelo no tenga que convertirlas (el 26 de octubre de 2026 escribía "2073,78
// pesos"): sin decimales desde 100, uno desde 1 y dos por debajo. Sin punto de miles: con "2.220" la respuesta dijo 2,22 (quizás no el
// modelo sino el corte de textoCF, que perdía los ceros de la derecha). El punto de miles lo pone la página (scripts/consulta_ia.js), porque el modelo perdía cifras al ponerlo. Los enteros, los códigos, los años y los períodos quedan como están
// ("t" es el tiempo como número decimal, 2025,5 para el segundo semestre de 2025)
const NO_ES_CIFRA = /codigo|anio|año|periodo|fecha|mes|eleccion|trimestre|semestre|^t$/i;
export function cifraAR(v, col) {
  if (NO_ES_CIFRA.test(col) || !/^-?\d+\.\d+$/.test(v)) return v;
  const n = +v, a = Math.abs(n), dec = a >= 100 || Number.isInteger(n) ? 0 : a >= 1 ? 1 : 2, f = 10 ** dec;
  // mitad hacia arriba, como r1() del sitio
  const [ent, frac] = (Math.round(a * f + 1e-9) / f).toFixed(dec).split(".");
  return (n < 0 ? "-" : "") + ent + (frac ? "," + frac : "");
}

// Workers AI manda la respuesta como eventos (data: {...}): el texto viene en "response" (o en choices[0].delta.content) y al final "usage".
// A veces un pedazo llega como número y no como texto (el 26 de octubre de 2026, el "4" de "4.094.578"): se pasa siempre a texto, porque la
// página descarta lo que no es texto y la cifra habría quedado cortada. Y se toma tal como vino, no como lo lee JSON.parse, que le saca los
// ceros de la derecha: el "5.680" de "5.680.763" turistas quedaba 5.68 y la página mostraba "5.68.763"
async function* textoCF(flujo) {
  const lector = flujo.getReader(), dec = new TextDecoder();
  let resto = "";
  try {
    for (;;) {
      const {value, done} = await lector.read();
      if (done) break;
      resto += typeof value === "string" ? value : dec.decode(value, {stream: true});
      const lineas = resto.split("\n");
      resto = lineas.pop();
      for (const l of lineas) {
        if (!l.startsWith("data:")) continue;
        const d = l.slice(5).trim();
        if (d === "[DONE]") return;
        let j;
        try { j = JSON.parse(d); } catch (e) { continue; }
        const x = j.response ?? j.choices?.[0]?.delta?.content;
        const tal = typeof x === "number" ? (/"response"\s*:\s*(-?\d[\d.]*(?:[eE][-+]?\d+)?)/.exec(d) || [])[1] : null;
        yield {texto: x == null ? "" : tal ?? String(x), numero: typeof x === "number", uso: j.usage};
      }
    }
  } finally { lector.releaseLock(); }
}

function mensajeDeErrorCF(err) {
  const m = String(err?.message || err);
  if (/4006|daily free allocation|neurons/i.test(m)) return AGOTADO;
  if (/3040|capacity|429|too many|rate limit/i.test(m)) return MUCHAS;
  return NO_DISPONIBLE;
}

async function conversarCF({pregunta, indice, ia, modelo, leer, enviar, corte}) {
  const uso = {entrada: 0, salida: 0};
  let final = "error", n = 0;
  try {
    if (SIN_SUICIDIO.test(normal(pregunta))) {
      enviar({t: "texto", texto: AYUDA_SUICIDIO});
      enviar({t: "fin"});
      final = "ayuda";
      return uso;
    }
    const {prov, anio, extremos, tablas} = elegirTablas(pregunta, indice);
    if (!tablas.length) { enviar({t: "error", texto: SIN_TABLAS}); final = "sin tablas"; return uso; }
    const bloques = [], consultadas = [];
    for (const [i, info] of tablas.entries()) {
      // dos tablas de la misma ficha se anuncian una sola vez
      if (!i || tablas[i - 1].titulo !== info.titulo) enviar({t: "paso", texto: `Leyendo «${info.titulo}»…`});
      const m = await muestraCF(info, prov, anio, indice, leer, extremos);
      if (!m) continue;
      // sin número: el modelo citaba "la tabla 1"
      bloques.push(`---\n${m.texto}`);
      consultadas.push({titulo: m.info.titulo, url: m.info.url, tabla: m.info.tabla});
    }
    n = consultadas.length;
    if (!n) { enviar({t: "error", texto: SIN_TABLAS}); final = "sin tablas"; return uso; }
    enviar({t: "paso", texto: "Escribiendo la respuesta…"});
    const mensajes = [{role: "system", content: INDICACIONES_CF},
      // sin la fecha de actualización del sitio: el modelo la daba como el período del dato
      {role: "user", content: `Pregunta: ${pregunta}\n\nDatos de Datina. Usá solo estos datos.\n\n${bloques.join("\n\n")}`}];
    const flujo = await ia.run(modelo, {messages: mensajes, max_tokens: TOPES_CF.tokens, temperature: 0.2, stream: true});
    let escrito = "";
    for await (const ev of textoCF(flujo)) {
      if (corte.signal.aborted) { final = "cortada por quien preguntó"; return uso; }
      // un pedazo que llegó como número perdió el espacio de adelante ("con4.572"): se repone si viene pegado a una palabra
      const pedazo = ev.numero && /\p{L}$/u.test(escrito) ? " " + ev.texto : ev.texto;
      if (pedazo) { escrito += pedazo; enviar({t: "texto", texto: pedazo}); }
      if (ev.uso) { uso.entrada = ev.uso.prompt_tokens || 0; uso.salida = ev.uso.completion_tokens || 0; }
    }
    if (!escrito.trim()) { enviar({t: "error", texto: NO_DISPONIBLE}); return uso; }
    enviar({t: "fuentes", fichas: consultadas});
    enviar({t: "fin"});
    final = "bien";
  } catch (err) {
    if (corte.signal.aborted) { final = "cortada por quien preguntó"; return uso; }
    // ni la pregunta ni los datos van al registro: solo qué falló
    console.error(JSON.stringify({consulta_ia: "error", motor: "cloudflare", mensaje: String(err?.message || err).slice(0, 200)}));
    enviar({t: "reinicio"});
    enviar({t: "error", texto: mensajeDeErrorCF(err)});
  } finally {
    console.log(JSON.stringify({consulta_ia: final, motor: "cloudflare", modelo, ...uso, tablas: n}));
  }
  return uso;
}

// request: el pedido. env: las variables de Cloudflare (ANTHROPIC_API_KEY, AI, y si se quiere DATINA_IA_MOTOR, DATINA_IA_MODELO o
// DATINA_IA_MODELO_CF). leer(ruta): un archivo del sitio publicado. esperar(promesa): que Cloudflare no corte la función mientras
// escribe. cliente: otro cliente de la API de Anthropic, e ia: otro Workers AI (las pruebas)
export async function responder(request, {env = {}, leer, esperar = () => {}, cliente = null, ia = null}) {
  if (request.method !== "POST") return responderJSON(405, {error: "Usá POST."}, {Allow: "POST"});
  const origen = request.headers.get("Origin");
  if (origen && origen !== new URL(request.url).origin) return responderJSON(403, {error: "Solo desde el sitio de Datina."});
  ia ||= env.AI || null;
  if (!env.ANTHROPIC_API_KEY && !cliente && !ia) return responderJSON(503, {error: NO_ACTIVA});
  const indice = await cargarIndice(leer);
  if (!indice) return responderJSON(503, {error: NO_ACTIVA});
  const motor = ["anthropic", "cloudflare"].includes(env.DATINA_IA_MOTOR) ? env.DATINA_IA_MOTOR : indice.motor === "cloudflare" ? "cloudflare" : "anthropic";
  if (motor === "cloudflare" ? !ia : !env.ANTHROPIC_API_KEY && !cliente) return responderJSON(503, {error: NO_ACTIVA});
  let pregunta = "";
  try {
    // una pregunta de 400 caracteres entra de sobra en 8 KB: un cuerpo más grande no se lee
    const crudo = await request.text();
    const cuerpo = crudo.length <= 8192 ? JSON.parse(crudo) : null;
    pregunta = typeof cuerpo?.pregunta === "string" ? cuerpo.pregunta.replace(/\s+/g, " ").trim() : "";
  } catch (e) { /* cuerpo que no es JSON: va al aviso de abajo */ }
  if (pregunta.length < 3) return responderJSON(400, {error: "Escribí una pregunta."});
  if (pregunta.length > TOPES.pregunta) return responderJSON(400, {error: `La pregunta puede tener hasta ${TOPES.pregunta} caracteres.`});
  const {readable, writable} = new TransformStream();
  const escritor = writable.getWriter(), cod = new TextEncoder(), corte = new AbortController();
  // si quien preguntó cerró la página, se corta la llamada al modelo para no gastar
  const enviar = ev => { escritor.write(cod.encode(JSON.stringify(ev) + "\n")).catch(() => corte.abort()); };
  const cabeceras = {headers: {"Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff"}};
  if (motor === "cloudflare") {
    const modeloCF = /^@cf\/[\w.\/-]+$/.test(env.DATINA_IA_MODELO_CF || "") ? env.DATINA_IA_MODELO_CF : MODELO_CF;
    esperar(conversarCF({pregunta, indice, ia, modelo: modeloCF, leer, enviar, corte}).finally(() => escritor.close().catch(() => {})));
    return new Response(readable, cabeceras);
  }
  const modelo = /^claude-[\w.-]+$/.test(env.DATINA_IA_MODELO || "") ? env.DATINA_IA_MODELO : MODELO;
  cliente ||= new Anthropic({apiKey: env.ANTHROPIC_API_KEY, maxRetries: 2, timeout: 120000,
                              ...(env.ANTHROPIC_BASE_URL ? {baseURL: env.ANTHROPIC_BASE_URL} : {})});
  esperar(conversar({pregunta, indice, cliente, modelo, leer, enviar, corte}).finally(() => escritor.close().catch(() => {})));
  return new Response(readable, cabeceras);
}
