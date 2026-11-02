// Las búsquedas que más crecen en Google en la Argentina (pedido del autor del 2 de noviembre de 2026: "búsquedas de google de los argentinos
// y timeline, en tiempo real conectado a API gratuito"). La fuente es el RSS público "Trending now" de Google Trends para la Argentina: no
// pide clave ni tiene costo, pero no deja leerse desde el navegador de otro sitio, así que lo lee esta función y lo devuelve en JSON a la
// misma dirección del sitio. Google publica ahí unas veinte búsquedas de las últimas horas, cada una con su tráfico aproximado, la hora en
// que empezó a crecer y algunas noticias que la acompañan. La respuesta se guarda diez minutos en la caché de Cloudflare: el RSS se pide,
// como mucho, seis veces por hora, lo vea quien lo vea.
export const RSS = "https://trends.google.com/trending/rss?geo=AR";
export const DURA = 600; // segundos en la caché

// &amp; y las demás entidades que usa el RSS, y los bloques CDATA
const textoXml = t => (t || "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&amp;/g, "&").trim();
const campo = (bloque, nombre) => textoXml((bloque.match(new RegExp(`<${nombre}>([\\s\\S]*?)</${nombre}>`)) || [])[1]);
// "200+" o "1,000+" pasa a 200 o 1000: el número de abajo de la franja que publica Google
const traficoN = t => Number((t.match(/[\d.,]+/) || ["0"])[0].replace(/[.,]/g, "")) || 0;
// solo enlaces http(s): lo que llega del RSS va a una página, y nunca como javascript: u otra cosa
const seguro = u => /^https?:\/\//i.test(u) ? u : "";

export function leerRss(xml) {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, b]) => {
    const fecha = new Date(campo(b, "pubDate"));
    const trafico = campo(b, "ht:approx_traffic");
    const noticias = [...b.matchAll(/<ht:news_item>([\s\S]*?)<\/ht:news_item>/g)].slice(0, 3).map(([, n]) => ({
      titulo: campo(n, "ht:news_item_title"), url: seguro(campo(n, "ht:news_item_url")), fuente: campo(n, "ht:news_item_source"),
    })).filter(n => n.titulo && n.url);
    return {titulo: campo(b, "title"), trafico, trafico_n: traficoN(trafico), fecha: isNaN(fecha) ? null : fecha.toISOString(), noticias};
  }).filter(i => i.titulo && i.fecha);
  // de la más reciente a la más vieja: es la línea de tiempo
  return items.sort((a, b) => b.fecha.localeCompare(a.fecha));
}

const json = (cuerpo, estado = 200, segundos = DURA) => new Response(JSON.stringify(cuerpo), {status: estado, headers: {
  "Content-Type": "application/json; charset=utf-8", "Cache-Control": estado === 200 ? `public, max-age=${segundos}` : "no-store"}});

// buscar: fetch (en las pruebas, uno simulado). cache: la caché de Cloudflare, si hay. esperar: waitUntil, para guardar sin demorar la respuesta
export async function responder(pedido, {buscar = fetch, cache = null, esperar = p => p} = {}) {
  if (pedido.method !== "GET" && pedido.method !== "HEAD") return json({error: "Solo se puede pedir con GET."}, 405);
  const clave = new Request(new URL("/api/tendencias", pedido.url).toString(), {method: "GET"});
  // el respaldo: la última lectura buena, guardada un día. Si Google no contesta, se muestra esa, con la hora en que se leyó
  const claveRespaldo = new Request(new URL("/api/tendencias?respaldo", pedido.url).toString(), {method: "GET"});
  if (cache) {
    const guardada = await cache.match(clave);
    if (guardada) return guardada;
  }
  // Google a veces rechaza un pedido suelto: se prueba dos veces antes de darlo por caído
  let xml, motivo = "";
  for (let intento = 0; intento < 2 && xml == null; intento++) {
    try {
      const r = await buscar(RSS, {headers: {"User-Agent": "Datina (datina.com.ar)", "Accept": "application/rss+xml, text/xml"}});
      if (!r.ok) throw new Error("Google respondió " + r.status);
      const texto = await r.text();
      if (leerRss(texto).length) xml = texto; else motivo = "Google Trends no devolvió búsquedas";
    } catch (e) {
      // el motivo va en la respuesta (sin datos de nadie: es lo que contestó Google o la red), para saber qué pasó sin abrir los registros
      motivo = String(e?.message || e).slice(0, 200);
    }
  }
  if (xml == null) {
    const respaldo = cache && await cache.match(claveRespaldo);
    if (respaldo) {
      const viejo = await respaldo.json();
      return json({...viejo, respaldo: true, motivo}, 200, 60);
    }
    return json({error: "No se pudieron leer las búsquedas de Google Trends.", motivo}, 502);
  }
  const cuerpo = {fuente: "Google Trends, búsquedas en aumento en la Argentina", rss: RSS, leido: new Date().toISOString(), items: leerRss(xml)};
  const respuesta = json(cuerpo);
  if (cache) esperar(Promise.all([cache.put(clave, respuesta.clone()), cache.put(claveRespaldo, json(cuerpo, 200, 86400))]));
  return respuesta;
}
