// POST /api/mcp: el servidor MCP de solo lectura de Datina (plan técnico, fase 3, 14 de noviembre de 2026, docs/ia/MCP.md). Lo que hace está en
// functions/_datos/datos.mjs. Lee los archivos que ya publica el sitio: no usa claves, base de datos ni secretos
import { responderMCP } from "../_datos/datos.mjs";

export const onRequest = contexto => responderMCP(contexto.request, {
  leer: ruta => contexto.env.ASSETS.fetch(new URL(ruta, contexto.request.url)),
});
