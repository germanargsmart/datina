# Pobreza en la Argentina: consultas

Sitio web que publica los datos del tablero de pobreza e indigencia como tablas abiertas y consultables. Cualquier persona puede filtrar los datos con menús, escribir consultas SQL propias, ver gráficos y descargar todo en Parquet o CSV.

Todo corre en el navegador de quien visita la página. No hay servidor ni base de datos que mantener: el sitio es un conjunto de archivos estáticos, igual que los otros tableros, así que se publica en Netlify de la misma manera.

## Qué hay en la carpeta

| Carpeta o archivo | Para qué sirve |
|---|---|
| `datos/crudo/ALL.json` | Los datos de origen, extraídos del tablero unificado. Es lo único que hay que reemplazar cada semestre. |
| `scripts/exportar_parquet.py` | Convierte `ALL.json` en seis tablas Parquet, las mismas en JSON y el diccionario de datos. |
| `src/data/*.parquet` | Las seis tablas que se ofrecen para descargar y que usa el editor de SQL libre. |
| `src/data/*.json` | Las mismas tablas, con los mismos valores, para la consulta guiada (que no usa DuckDB). |
| `scripts/prueba_guiada.mjs` | Prueba que la consulta guiada dé lo mismo que su consulta SQL en DuckDB, en todas las combinaciones de filtros. |
| `scripts/rearmar_cache.py` | Rearma la caché de librerías desde el consultor publicado, para armar sin acceso a jsDelivr. |
| `src/index.md` | La página de consultas (texto, filtros, gráficos y caja de SQL). |
| `src/diccionario.md` | Diccionario de datos. Se genera solo con el script de Python, no hace falta editarlo. |
| `src/estilo.css` | Colores y tipografía. |
| `observablehq.config.js` | Título del sitio, encabezado y pie. |
| `netlify.toml` | Instrucciones para que Netlify arme y publique el sitio. |
| `dist/` | El sitio listo para publicar. Se genera con `npm run build` y git no lo guarda. Lo publicado es su copia en `sitio/pobreza/` de Datina (ver "Publicar junto con Datina"). |

El sitio está hecho con [Observable Framework](https://observablehq.com/framework/), una herramienta que convierte páginas escritas en Markdown en un sitio estático.

## Qué necesitás tener instalado

- **Python 3** con `pandas` y `pyarrow` (para generar los Parquet). Si falta pyarrow: `pip install pyarrow`.
- **Node.js** versión 18 o más nueva (para armar el sitio). En esta computadora quedó instalado para el usuario con winget.

La primera vez, abrí una terminal en esta carpeta y corré:

```
npm install
```

Eso descarga Observable Framework en la carpeta `node_modules`. Se hace una sola vez.

## Actualizar los datos cada semestre

1. **Reemplazá los datos de origen.** Poné el nuevo `ALL.json` en `datos/crudo/ALL.json`, con la misma estructura que el actual. Si en el futuro los datos llegan en otro formato (por ejemplo cuadros sueltos del INDEC), hay que adaptar la función `construir` de `scripts/exportar_parquet.py`, que es la única parte que lee el origen.
2. **Revisá el período.** Si el semestre nuevo no es el 1S 2026, cambiá la línea `PERIODO_ULTIMO = "1S 2026"` en `scripts/exportar_parquet.py`. En `src/index.md` buscá los textos que mencionan 1S 2026, 1T 2026, "primer semestre de 2026", "primer trimestre de 2026" o los totales de calibración (36,9% y 11,1%) y actualizalos.
3. **Generá las tablas.** En la terminal, desde esta carpeta:

   ```
   python scripts/exportar_parquet.py
   ```

   Tiene que mostrar las seis tablas con su cantidad de filas y avisar que escribió el diccionario. Escribe cada tabla en Parquet y en JSON: los dos tienen que subirse.
4. **Armá el sitio.**

   ```
   npm run build
   ```

   Si termina sin errores, la carpeta `dist` tiene el sitio nuevo. Para publicarlo junto con Datina, seguí "Publicar junto con Datina", más abajo.

   Si el armado falla porque no puede bajar algo de `cdn.jsdelivr.net` (una computadora sin la caché de Observable o un entorno sin acceso a esa dirección), corré antes `python scripts/rearmar_cache.py`: arma la caché con las librerías del consultor ya publicado.

5. **Probá la consulta guiada** si cambiaste su código o las tablas. La consulta guiada se resuelve en JavaScript con los JSON, y la página muestra la consulta SQL equivalente. Esta prueba corre cada consulta en DuckDB y la compara con el resultado de JavaScript, en todas las combinaciones de filtros (unas 7.000):

   ```
   npm install --no-save @duckdb/node-api
   node scripts/prueba_guiada.mjs
   ```

   Tiene que terminar con "JavaScript y DuckDB dan lo mismo".

## Ver el sitio en tu computadora antes de publicarlo

Mientras editás, la vista previa se actualiza sola cada vez que guardás un archivo:

```
npm run dev
```

Después abrí en el navegador la dirección `http://127.0.0.1:3000`. Para cortarla, apretá Ctrl + C en la terminal.

Importante: no uses los puertos 8000 ni 8765, que ya usan otros sitios en esta computadora. Por eso la vista previa está configurada en el 3000.

## Publicar junto con Datina

Datina publica el consultor desde `sitio/pobreza/`, que está guardado en el repositorio. Ni la actualización mensual ni un armado común de Datina lo cambian: desde el 22 de octubre de 2026, `python scripts/03_construir_sitio.py` deja `sitio/pobreza/` como está aunque exista `pobreza/dist`, y avisa al final si encontró esa carpeta y de cuándo es. Así, un armado viejo que quedó en la computadora no reemplaza el consultor publicado sin que nadie lo note.

Para publicar un armado nuevo:

1. Armá el consultor (pasos 3 y 4 de "Actualizar los datos cada semestre") y, si cambiaste la consulta guiada, corré su prueba (paso 5).
2. Desde la carpeta de Datina, corré `python scripts/03_construir_sitio.py --con-pobreza`. Copia `pobreza/dist` a `sitio/pobreza/` y muestra la fecha del armado que copió. Si `pobreza/dist` no tiene un armado (falta su `index.html`), frena sin tocar nada.
3. Mirá el consultor en el navegador (`cd sitio && python -m http.server 8765` y abrí `http://127.0.0.1:8765/pobreza/`): la consulta guiada, el editor de SQL y un ejemplo, y el primer enlace de la cabecera ("Datina: Pobreza y hogares", lleva a `pobreza.html`).

Desde el 23 de octubre de 2026 el editor de SQL baja DuckDB de jsDelivr, su CDN oficial, en la versión 1.29.0, y DuckDB baja de su servidor la extensión para leer Parquet al usarla. Antes iban adentro del sitio, pero sus dos archivos (36 y 41 MB) superan el máximo de 25 MB por archivo de Cloudflare Pages, donde se publica Datina. Con eso el consultor pasó de 88 MB a 7. La consulta guiada no usa DuckDB y anda igual sin acceso a jsDelivr. Si alguna vez se publica en un lugar sin ese límite y se quiere el motor adentro otra vez, el código está en `src/index.md`, en el bloque "DuckDB con las seis tablas".
4. Revisá con `git status` que los cambios de `sitio/pobreza/` sean los que esperabas y subilos con el resto.

La prueba `python scripts/prueba_pobreza.py` controla este comportamiento, y el armado de Datina la corre antes de empezar.

## Publicar en Netlify como sitio aparte

Estas dos opciones son para publicar el consultor solo, en un sitio de Netlify propio. Para Datina no hacen falta.

**Opción A, conectada a un repositorio (recomendada).** Subí esta carpeta a un repositorio de GitHub, creá un sitio nuevo en Netlify a partir de ese repositorio y dejá la configuración que trae `netlify.toml`:

- Build command: `npm run build`
- Publish directory: `dist`

Cada vez que subas cambios al repositorio, Netlify vuelve a armar y publicar el sitio. Netlify no corre Python: los Parquet se generan en tu computadora (paso 3) y se suben junto con el resto.

**Opción B, a mano.** Corré `npm run build` y arrastrá la carpeta `dist` (no el proyecto entero) a [app.netlify.com/drop](https://app.netlify.com/drop), o usá `netlify deploy --prod --dir=dist` si tenés la herramienta de Netlify instalada.

## Límites y avisos

- Las cifras por partido, comuna y fracción son estimaciones de un modelo, no mediciones oficiales. La página lo aclara y muestra los intervalos de confianza y el coeficiente de variación donde existen.
- El motor de consultas (DuckDB, unos 8 MB comprimido) se baja recién cuando alguien abre el editor de SQL libre. Desde el 13 de octubre de 2026, la página y la consulta guiada bajan unos 0,36 MB comprimidos (antes, 8,5 MB). Después queda en caché.
- La página necesita conexión a internet para cargar la tipografía Roboto Flex desde Google Fonts. Si no está disponible, usa Roboto o Verdana.
- Los mapas del tablero original no están incluidos en esta página. Los Parquet no guardan geometrías.
