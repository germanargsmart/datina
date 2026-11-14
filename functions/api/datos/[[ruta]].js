// GET /api/datos/...: la API de datos de Datina, con las mismas consultas que el MCP (plan técnico, fase 3, 14 de noviembre de 2026,
// docs/ia/MCP.md). Lo que hace está en functions/_datos/datos.mjs. [[ruta]] toma todo lo que sigue a /api/datos/
import { responderAPI } from "../../_datos/datos.mjs";

export const onRequest = contexto => responderAPI(contexto.request, {
  leer: ruta => contexto.env.ASSETS.fetch(new URL(ruta, contexto.request.url)),
  ruta: contexto.params.ruta || [],
});
