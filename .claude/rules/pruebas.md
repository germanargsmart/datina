# Comprobaciones por tipo de cambio

Ningún cambio está terminado hasta correr lo que corresponde y mirar el resultado. No alcanza con que "deberían pasar".

| Cambio | Qué correr |
|---|---|
| Solo documentación (`docs/`, `CLAUDE.md`, `.claude/`) | Revisar el diff. Nada más. |
| Datos (`02_procesar.py`, `datos/manual/`) | `python scripts/02_procesar.py`, `python scripts/pruebas_datos.py` (0 sin explicar), comparar el resumen antes y después |
| Plantilla, constructor, CSS o JS | `python scripts/03_construir_sitio.py`, sintaxis de `sitio/datina.js`, `node scripts/prueba_paginas.mjs`, y revisar la página en 390 y 1440 píxeles |
| Página o herramienta nueva | Lo anterior, más teclado, movimiento reducido, celular y que las demás páginas no cambien |
| Explorador de relaciones (`datos/manual/relaciones.json`, `scripts/relaciones.*`) | `python scripts/relaciones.py` (valida el catálogo: cada relación con su evidencia en el código), `python scripts/prueba_relaciones.py` (rompe el catálogo de 18 formas y controla que el validador lo marque), el armado y la prueba de páginas. 03 corre las dos primeras y no arma el sitio si fallan |
| Catálogo de datos (`scripts/catalogo.py`, `datos/manual/catalogo.json`) | `python scripts/catalogo.py` (cada tabla de `sitio/datos/` con su ficha, artículo o pieza, y cada evidencia en el código), el armado y la prueba de páginas. 03 lo corre y no arma el sitio si falla. Una tabla nueva que ninguna ficha ofrece en su pie va en `catalogo.json` |
| Encabezados de las páginas | `python scripts/prueba_encabezados.py -v` (un h1 por página, con las excepciones explicadas). 03 la corre al final y no da el sitio por armado si falla |
| Navegación (`GRUPOS` y `MENUS` en `03_construir_sitio.py`, barra, menús, pie) | `python scripts/prueba_navegacion.py` (la misma barra, los mismos menús y el mismo pie en todas las páginas, cada sección una vez en los menús, las 52 direcciones del 22 de octubre de 2026 y ninguna página sin enlaces que lleguen a ella). 03 la corre al final. La prueba de páginas abre y cierra los menús con el teclado en 1280 y 390 píxeles, en la portada controla los cuatro datos destacados y el buscador a la vista, y en la lupa recorre los resultados con las flechas, abre uno con Enter y controla que sin coincidencias ofrezca el catálogo con lo escrito. También controla que cada botón "Ficha: …" de un artículo tenga su vuelta en "Artículos con este dato" del pie de esa ficha, y al revés, y que las tarjetas de la página Artículos lleven su bajada y las de la portada no. En las fichas controla que todas tengan "Ver tabla", que ninguna lleve el nombre de la sección arriba de la pregunta y que "Cómo se calcula" esté solo en las páginas con "Para entender los datos", y abre "Ver tabla" en las cinco fichas que arman su tabla con lo elegido en el gráfico. En accesibilidad controla en todas las páginas que ningún gráfico quede sin nombre, "Saltar al contenido" con su destino y las migas subrayadas, y con el teclado, que la primera parada sea el salto, que Enter lleve el foco al título, que Tab cierre la lupa y que el mapa de la portada tenga nombre |
| Metadatos y enlaces internos | `python scripts/prueba_metadatos.py` (title y descripción propios, Open Graph, nada que apunte a un dominio que no sea el de `datos/manual/sitio.json`, enlaces internos que existen). 03 la corre al final |
| Consultor de pobreza (`pobreza/`) | Desde `pobreza/`: `npm run build` (sin acceso a jsDelivr, antes `python scripts/rearmar_cache.py`), `node scripts/prueba_guiada.mjs` (consulta guiada igual a DuckDB en todas las combinaciones, con `npm install --no-save @duckdb/node-api` la primera vez) y después, desde la raíz, `python scripts/03_construir_sitio.py --con-pobreza`, que copia `pobreza/dist` a `sitio/pobreza/` (sin la opción, `sitio/pobreza/` no se toca). Probar en el navegador la consulta guiada, abrir el editor de SQL, un ejemplo y llevar la consulta guiada al editor |
| Copia del consultor al sitio (`scripts/consultor_pobreza.py`) | `python scripts/prueba_pobreza.py` (un armado normal no reemplaza `sitio/pobreza/` aunque exista `pobreza/dist`, `--con-pobreza` lo copia y sin armado frena). 03 la corre antes de armar y no arma el sitio si falla |
| Descargas (`01_descargar.py`) | Solo con aprobación del autor |

Línea de base del 10 de octubre de 2026 (commit b4b1fc1): `pruebas_datos.py` 0 sin explicar y 115 explicados (3 segundos), `03_construir_sitio.py` arma 23 páginas de sección y 18 artículos (3 segundos), sintaxis bien. Detalle en `docs/roadmap/ESTADO.md`.

## Finales de línea

Las páginas de `sitio/` en el repositorio tienen CRLF porque el autor arma en Windows. Armar en Linux reescribe las 50 páginas con LF. Para ver si cambió algo más: `git diff --ignore-cr-at-eol --stat sitio`. Si solo cambiaron los finales de línea, devolverlas con `git checkout -- sitio`.

## Entornos en la nube sin acceso a las CDN

En las sesiones de Claude Code en la nube la red puede bloquear cdnjs y jsdelivr. Desde el 22 de octubre de 2026 eso ya no afecta: D3 7.8.5 y topojson-client 3.1.0 se sirven desde el propio sitio (`sitio/lib/`, que 03 copia byte por byte de `scripts/lib/`, con las licencias), así que la prueba de páginas corre igual: `CHROME=/opt/pw-browsers/chromium node scripts/prueba_paginas.mjs`. La variable `DATINA_LIBS`, que servía copias en lugar de las CDN, ya no existe.

La prueba de páginas abre además algunas páginas con cdnjs y jsDelivr bloqueadas (tienen que andar sin errores, con fichas, textos, gráficos y menú) y `trabajo.html` sin D3 (las fichas tienen que verse igual, por la red de seguridad del arranque de `datina.js`). Para cambiar de versión de D3 o de topojson: reemplazar el archivo de `scripts/lib/` (bajado de npm y comparado byte por byte con el de la CDN), y su nombre en `LIBS` de `03_construir_sitio.py` y en `scripts/plantilla.html`.

Las letras de Google Fonts tampoco cargan ahí: las capturas usan las letras de reemplazo, así que no sirven para comparar píxeles con las de la computadora del autor.
