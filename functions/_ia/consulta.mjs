// Consultas con IA (25 de octubre de 2026, pedido del autor: "empezá a integrar IA para consultas generativas con la información").
// Contesta POST /api/consulta (functions/api/consulta.js) con un modelo de Claude que lee las tablas del propio sitio. Cómo funciona, qué
// cuesta y cómo se activa: docs/ia/CONSULTAS.md. La prueba, con la API simulada: node scripts/prueba_consulta_ia.mjs.
//
// Queda apagada sin la clave ANTHROPIC_API_KEY (un secreto de Cloudflare Pages que pone el autor) o sin el índice
// sitio/datos/consulta_ia.json, que 03_construir_sitio.py escribe solo con "consulta_ia": true en datos/manual/sitio.json.
// El modelo solo puede leer las tablas de ese índice (las del Catálogo de datos, sin las de suicidio) y de cada tabla nunca recibe una
// columna ni una fila que hable de suicidio (CLAUDE.md, "Temas sensibles"). Datina no guarda las preguntas: en el registro de Cloudflare
// queda solo cuántos tokens usó cada consulta.
//
// La respuesta es una línea de JSON por evento (lo lee sitio/consulta-ia.js, que sale de scripts/consulta_ia.js):
//   {"t":"paso","texto"}  {"t":"texto","texto"}  {"t":"reinicio"}  {"t":"fuentes","fichas":[{"titulo","url","tabla"}]}  {"t":"error","texto"}  {"t":"fin"}
import Anthropic from "./anthropic-sdk.mjs";
import { INDICACIONES } from "./indicaciones.mjs";

// el modelo, salvo que el autor elija otro con DATINA_IA_MODELO (docs/ia/CONSULTAS.md compara costos)
export const MODELO = "claude-opus-5-5";
// topes de cada consulta: largo de la pregunta, vueltas del modelo (cada lectura de tablas es una vuelta), tokens que puede escribir en
// cada vuelta (contando lo que piensa), filas y caracteres que recibe de cada tabla
export const TOPES = {pregunta: 400, vueltas: 6, tokens: 8000, filas: 300, caracteres: 30000};
const SIN_SUICIDIO = /suicid|autoinflig|autolesi/i;
const COLS_PERIODO = ["periodo", "fecha", "mes", "anio", "año", "eleccion"];
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
  return {tablas, texto};
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
    else {
      const d = entrada.desde.trim(), h = entrada.hasta.trim();
      filas = filas.filter(x => /^\d{4}/.test(x[cp]) && (!d || x[cp] >= d) && (!h || x[cp] <= h + "\uffff"));
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

// request: el pedido. env: las variables de Cloudflare (ANTHROPIC_API_KEY, y si se quiere DATINA_IA_MODELO). leer(ruta): un archivo
// del sitio publicado. esperar(promesa): que Cloudflare no corte la función mientras escribe. cliente: otro cliente de la API (la prueba)
export async function responder(request, {env = {}, leer, esperar = () => {}, cliente = null}) {
  if (request.method !== "POST") return responderJSON(405, {error: "Usá POST."}, {Allow: "POST"});
  const origen = request.headers.get("Origin");
  if (origen && origen !== new URL(request.url).origin) return responderJSON(403, {error: "Solo desde el sitio de Datina."});
  if (!env.ANTHROPIC_API_KEY && !cliente) return responderJSON(503, {error: NO_ACTIVA});
  const indice = await cargarIndice(leer);
  if (!indice) return responderJSON(503, {error: NO_ACTIVA});
  let pregunta = "";
  try {
    // una pregunta de 400 caracteres entra de sobra en 8 KB: un cuerpo más grande no se lee
    const crudo = await request.text();
    const cuerpo = crudo.length <= 8192 ? JSON.parse(crudo) : null;
    pregunta = typeof cuerpo?.pregunta === "string" ? cuerpo.pregunta.replace(/\s+/g, " ").trim() : "";
  } catch (e) { /* cuerpo que no es JSON: va al aviso de abajo */ }
  if (pregunta.length < 3) return responderJSON(400, {error: "Escribí una pregunta."});
  if (pregunta.length > TOPES.pregunta) return responderJSON(400, {error: `La pregunta puede tener hasta ${TOPES.pregunta} caracteres.`});
  const modelo = /^claude-[\w.-]+$/.test(env.DATINA_IA_MODELO || "") ? env.DATINA_IA_MODELO : MODELO;
  cliente ||= new Anthropic({apiKey: env.ANTHROPIC_API_KEY, maxRetries: 2, timeout: 120000,
                              ...(env.ANTHROPIC_BASE_URL ? {baseURL: env.ANTHROPIC_BASE_URL} : {})});
  const {readable, writable} = new TransformStream();
  const escritor = writable.getWriter(), cod = new TextEncoder(), corte = new AbortController();
  // si quien preguntó cerró la página, se corta la llamada al modelo para no gastar tokens
  const enviar = ev => { escritor.write(cod.encode(JSON.stringify(ev) + "\n")).catch(() => corte.abort()); };
  esperar(conversar({pregunta, indice, cliente, modelo, leer, enviar, corte}).finally(() => escritor.close().catch(() => {})));
  return new Response(readable, {headers: {"Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store",
                                           "X-Content-Type-Options": "nosniff"}});
}
