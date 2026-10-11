# Comprobaciones por tipo de cambio

Ningún cambio está terminado hasta correr lo que corresponde y mirar el resultado. No alcanza con que "deberían pasar".

| Cambio | Qué correr |
|---|---|
| Solo documentación (`docs/`, `CLAUDE.md`, `.claude/`) | Revisar el diff. Nada más. |
| Datos (`02_procesar.py`, `datos/manual/`) | `python scripts/02_procesar.py`, `python scripts/pruebas_datos.py` (0 sin explicar), comparar el resumen antes y después |
| Plantilla, constructor, CSS o JS | `python scripts/03_construir_sitio.py`, sintaxis de `sitio/datina.js`, `node scripts/prueba_paginas.mjs`, y revisar la página en 390 y 1440 píxeles |
| Página o herramienta nueva | Lo anterior, más teclado, movimiento reducido, celular y que las demás páginas no cambien |
| Explorador de relaciones (`datos/manual/relaciones.json`, `scripts/relaciones.*`) | `python scripts/relaciones.py` (valida el catálogo: cada relación con su evidencia en el código), `python scripts/prueba_relaciones.py` (rompe el catálogo de 18 formas y controla que el validador lo marque), el armado y la prueba de páginas. 03 corre las dos primeras y no arma el sitio si fallan |
| Encabezados de las páginas | `python scripts/prueba_encabezados.py -v` (un h1 por página, con las excepciones explicadas). 03 la corre al final y no da el sitio por armado si falla |
| Descargas (`01_descargar.py`) | Solo con aprobación del autor |

Línea de base del 10 de octubre de 2026 (commit b4b1fc1): `pruebas_datos.py` 0 sin explicar y 115 explicados (3 segundos), `03_construir_sitio.py` arma 23 páginas de sección y 18 artículos (3 segundos), sintaxis bien. Detalle en `docs/roadmap/ESTADO.md`.

## Finales de línea

Las páginas de `sitio/` en el repositorio tienen CRLF porque el autor arma en Windows. Armar en Linux reescribe las 50 páginas con LF. Para ver si cambió algo más: `git diff --ignore-cr-at-eol --stat sitio`. Si solo cambiaron los finales de línea, devolverlas con `git checkout -- sitio`.

## Entornos en la nube sin acceso a las CDN

En las sesiones de Claude Code en la nube la red puede bloquear cdnjs y jsdelivr (D3 y topojson). Desde el 11 de octubre de 2026 la prueba de páginas acepta copias locales, sin tocar el repositorio:

1. Bajar del registro npm (permitido) `npm pack d3@7.8.5 topojson-client@3.1.0` en una carpeta temporal, descomprimirlos y juntar `d3.min.js` y `topojson-client.min.js` en una carpeta.
2. Correr `DATINA_LIBS=<esa carpeta> CHROME=/opt/pw-browsers/chromium node scripts/prueba_paginas.mjs` desde el repositorio. El navegador recibe las copias en lugar de pedirlas a las CDN. Sin la variable, todo va a las CDN, como en la actualización mensual.

Las letras de Google Fonts tampoco cargan ahí: las capturas usan las letras de reemplazo, así que no sirven para comparar píxeles con las de la computadora del autor.
