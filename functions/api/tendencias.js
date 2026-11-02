// GET /api/tendencias: las búsquedas que más crecen en Google en la Argentina, para Curiosidades (2 de noviembre de 2026). Lo que hace está
// en functions/_tendencias/tendencias.mjs. No usa claves ni secretos: lee un RSS público de Google Trends
import { responder } from "../_tendencias/tendencias.mjs";

export const onRequest = contexto => responder(contexto.request, {
  cache: globalThis.caches?.default ?? null,
  esperar: promesa => contexto.waitUntil(promesa),
});
