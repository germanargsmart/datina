# El MCP y la API de datos (plan técnico, fase 3)

Armado el 14 de noviembre de 2026 (`PLAN_TECNICO.md`, fase 3). Sirven para que otros programas, y los asistentes de IA, lean los datos de Datina sin pasar por las páginas. Los dos son de solo lectura, sin clave, sin base de datos y sin escribir nada. Leen los mismos archivos que publica el sitio.

## Qué hay

- **Servidor MCP**: `POST /api/mcp` (`functions/api/mcp.js`). MCP es el protocolo con el que un asistente de IA, como Claude, usa herramientas de otro sitio. Se agrega como "conector personalizado" con la dirección `https://datina.com.ar/api/mcp`. Contesta JSON-RPC por HTTP, un pedido por vez, sin sesión y sin SSE (`GET` da 405, como pide el protocolo para un servidor sin SSE).
- **API de datos**: `GET /api/datos/...` (`functions/api/datos/[[ruta]].js`), con las mismas consultas en JSON:
  - `/api/datos`: la lista de direcciones.
  - `/api/datos/tablas?q=empleo&seccion=Trabajo`: buscar tablas.
  - `/api/datos/tablas/empleo_provincias`: describir una tabla.
  - `/api/datos/tablas/empleo_provincias/filas?jurisdiccion=14,02&desde=2020&hasta=2025&columnas=territorio,cada_100`: leer sus filas.
  - `/api/datos/indicadores?q=mortalidad`: buscar indicadores de la tabla larga.
  - `/api/datos/indicadores/tasa_mortalidad_infantil?jurisdiccion=Chaco&desde=2020`: leer un indicador.
- Lo que hace está en `functions/_datos/datos.mjs`. Las herramientas del MCP son cinco: `buscar_tablas`, `describir_tabla`, `leer_tabla`, `buscar_indicadores` y `leer_indicador`.
- Cada respuesta lleva la fuente, la fecha de los datos, la licencia, la dirección de la ficha y, en las tablas, de qué archivos salen y el día en que se bajó cada uno.
- La jurisdicción se puede pedir por código del INDEC ("14", "2") o por nombre ("Córdoba", "CABA", "país").
- Topes: 500 filas por respuesta (con un aviso si hay más) y 25 resultados por búsqueda (hasta 100 con `limite`).

## Qué archivos lee

Los escribe `03_construir_sitio.py`:

- `sitio/datos/catalogo_api.json`: el índice chico de las tablas que se ofrecen, con el texto para buscar ya sin tildes.
- `sitio/datos/<tabla>.metadata.json`: la descripción completa de cada tabla, la misma de `catalogo.json`.
- `sitio/datos/<tabla>.csv`: las filas.
- `sitio/datos/indicadores.json` y `sitio/datos/indicadores/<variable>.csv`: un archivo por indicador de la tabla larga (255, unos 2 MB). La tabla larga entera pesa 7 MB y no entra en el procesador que da Cloudflare a cada pedido.

## Qué no ofrece nunca

- Las tablas sensibles del catálogo: las que hablan de suicidio y la de muertes violentas (decisión 5 del autor del 11 de noviembre de 2026, CLAUDE.md, "Temas sensibles").
- De cualquier tabla, una columna o una fila que nombre el suicidio.
- Los tres indicadores de suicidio de la tabla larga: 03 no les escribe archivo.
- Las tablas sin la licencia de Datina (las listas de COMNAP de la Antártida).
- Elecciones por mesa, que no está en el catálogo. El plan pide antes marcar el origen de cada elección (oficial o 257arg) y ofrecer solo las oficiales: queda para después.

## Procesador

El plan gratis de Cloudflare da 10 ms de procesador por pedido, y las funciones del sitio comparten el límite de 100.000 pedidos por día con Consultas con IA. Medido el 14 de noviembre de 2026 con los archivos en memoria: buscar tablas, unos 3,6 ms. Describir una tabla, 3,4. Leer la tabla de empleo, 2,6. Leer la tabla más grande (`bcra_variables`, 534 KB), entre 4 y 5. Leer el indicador más largo (la nafta, 6.500 filas), 3,8. Para que entre se hicieron tres cosas: el índice chico, los prefiltros por jurisdicción y año (las líneas que no los nombran no se separan en campos) y, sin filtros, separar solo las filas que se devuelven.

## Pruebas

`node scripts/prueba_datos_api.mjs`, con el sitio armado y sin red. La corre cada PR. Son 71 controles:

- el protocolo: `initialize`, las notificaciones, `tools/list`, los errores, `GET` y `OPTIONS`;
- las búsquedas, la descripción, la lectura con filtros y los topes;
- que la API dé lo mismo que el MCP;
- que no salga nada sensible, ni las tablas de COMNAP, ni Elecciones por mesa;
- el tiempo de cada consulta.

## Antes de publicar (decisión del autor)

Unir el PR publica las dos direcciones. Antes, según el plan, el autor:

1. Aprueba las direcciones públicas `https://datina.com.ar/api/mcp` y `https://datina.com.ar/api/datos`.
2. Revisa en el panel de Cloudflare el plan de la cuenta: el MCP y la API comparten con Consultas con IA el límite de pedidos de las funciones.
3. Revisa que no esté prendido el bloqueo de bots de IA ("AI Scrapers and Crawlers" o "Block AI bots"), que cortaría justo a los asistentes que se quiere atender.
