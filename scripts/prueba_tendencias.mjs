// Prueba de las búsquedas de Google (functions/_tendencias/tendencias.mjs, 2 de noviembre de 2026), sin red: lee un RSS de ejemplo con la forma
// del de Google Trends y simula a Google y a la caché de Cloudflare. Uso: node scripts/prueba_tendencias.mjs
import { leerRss, responder, RSS } from "../functions/_tendencias/tendencias.mjs";

const EJEMPLO = `<?xml version="1.0" encoding="UTF-8"?><rss xmlns:ht="https://trends.google.com/trending/rss" version="2.0"><channel>
<item><title>ipc</title><ht:approx_traffic>200+</ht:approx_traffic><pubDate>Mon, 2 Nov 2026 05:50:00 -0800</pubDate>
<ht:news_item><ht:news_item_title>Los alimentos &amp; la inflaci&#243;n</ht:news_item_title><ht:news_item_url>https://www.ejemplo.com/a</ht:news_item_url><ht:news_item_source>Diario</ht:news_item_source></ht:news_item>
<ht:news_item><ht:news_item_title>Malo</ht:news_item_title><ht:news_item_url>javascript:alert(1)</ht:news_item_url><ht:news_item_source>X</ht:news_item_source></ht:news_item>
</item>
<item><title>River &quot;vs&quot; Boca</title><ht:approx_traffic>2,000+</ht:approx_traffic><pubDate>Mon, 2 Nov 2026 09:10:00 -0800</pubDate></item>
<item><title>sin fecha</title><ht:approx_traffic>100+</ht:approx_traffic><pubDate>no es una fecha</pubDate></item>
</channel></rss>`;

let fallas = 0;
const ver = (ok, texto) => { console.log(`${ok ? "bien " : "FALLA"} ${texto}`); if (!ok) fallas++; };

const items = leerRss(EJEMPLO);
ver(items.length === 2, `dos búsquedas válidas (la que no tiene fecha queda afuera): ${items.length}`);
ver(items[0].titulo === 'River "vs" Boca', `la más reciente primero y las entidades leídas: ${items[0].titulo}`);
ver(items[0].trafico === "2,000+" && items[0].trafico_n === 2000, `el tráfico como texto y como número: ${items[0].trafico} y ${items[0].trafico_n}`);
ver(items[1].noticias.length === 1 && items[1].noticias[0].titulo === "Los alimentos & la inflación", "las noticias, sin el enlace que no es http");
ver(items[1].fecha === "2026-11-02T13:50:00.000Z", `la hora pasada a UTC: ${items[1].fecha}`);

// la función completa, con Google y la caché simulados
const caja = new Map(), cache = {match: async r => caja.get(r.url)?.clone(), put: async (r, resp) => { caja.set(r.url, resp); }};
let pedidos = 0, guardar = [];
const google = async url => { pedidos++; ver(url === RSS, "pide el RSS de la Argentina"); return new Response(EJEMPLO, {status: 200}); };
const pedido = new Request("https://datina.com.ar/api/tendencias?x=1");
let r = await responder(pedido, {buscar: google, cache, esperar: p => guardar.push(p)});
await Promise.all(guardar);
const cuerpo = await r.json();
ver(r.status === 200 && cuerpo.items.length === 2, `responde 200 con las búsquedas: ${r.status}`);
ver(/max-age=600/.test(r.headers.get("Cache-Control")), `se guarda diez minutos: ${r.headers.get("Cache-Control")}`);
r = await responder(pedido, {buscar: google, cache});
ver(r.status === 200 && pedidos === 1, `la segunda vez sale de la caché, sin pedirle de nuevo a Google: ${pedidos} pedido`);
r = await responder(new Request("https://datina.com.ar/api/tendencias"), {buscar: async () => new Response("", {status: 503})});
ver(r.status === 502 && (await r.json()).error, "si Google falla, avisa con un error y no lo guarda");
r = await responder(new Request("https://datina.com.ar/api/tendencias"), {buscar: async () => { throw new Error("sin red"); }});
ver(r.status === 502 && r.headers.get("Cache-Control") === "no-store", "sin red, también avisa");
r = await responder(new Request("https://datina.com.ar/api/tendencias"), {buscar: async () => new Response("<rss></rss>", {status: 200})});
ver(r.status === 502, "un RSS vacío no se publica como si no hubiera búsquedas");
r = await responder(new Request("https://datina.com.ar/api/tendencias", {method: "POST"}), {buscar: google});
ver(r.status === 405, "solo acepta GET");
// un pedido que falla y el segundo que anda: se reintenta
let n = 0;
r = await responder(new Request("https://datina.com.ar/api/tendencias"), {buscar: async () => ++n === 1 ? new Response("", {status: 429}) : new Response(EJEMPLO, {status: 200})});
ver(r.status === 200 && n === 2, `si Google rechaza un pedido, lo prueba otra vez: ${n} pedidos`);
// sin la lectura de diez minutos pero con el respaldo del día: lo devuelve marcado
caja.delete("https://datina.com.ar/api/tendencias");
r = await responder(pedido, {buscar: async () => new Response("", {status: 503}), cache});
const viejo = await r.json();
ver(r.status === 200 && viejo.respaldo === true && viejo.items.length === 2 && /Google respondió 503/.test(viejo.motivo),
  "si Google no contesta, devuelve la última lectura buena, marcada como respaldo");
ver(/max-age=60\b/.test(r.headers.get("Cache-Control")), `el respaldo se guarda solo un minuto: ${r.headers.get("Cache-Control")}`);

console.log(fallas ? `${fallas} fallas` : "Búsquedas de Google: todo bien");
process.exit(fallas ? 1 : 0);
