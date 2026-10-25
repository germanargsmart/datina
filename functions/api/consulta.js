// POST /api/consulta: las consultas con IA de Datina (25 de octubre de 2026, docs/ia/CONSULTAS.md). Cloudflare Pages convierte cada archivo
// de functions/ en una dirección del sitio: este es el único, así que el resto del sitio se sigue sirviendo sin pasar por acá. Lo que hace
// está en functions/_ia/consulta.mjs (las carpetas que empiezan con _ no son direcciones). Las tablas se leen del mismo sitio publicado
import { responder } from "../_ia/consulta.mjs";

export const onRequest = contexto => responder(contexto.request, {
  env: contexto.env,
  leer: ruta => contexto.env.ASSETS.fetch(new URL(ruta, contexto.request.url)),
  esperar: promesa => contexto.waitUntil(promesa),
});
