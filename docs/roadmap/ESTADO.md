# Estado del plan

Plan: `DATINA_LAB.md`. Solo la próxima tarea y lo necesario para retomarla.

## Línea de base (D0-01, 10 de octubre de 2026, commit b4b1fc1)

- `git status`: limpio. Rama de trabajo `claude/awesome-cannon-dkbl1m` (igual a `main`).
- `python scripts/pruebas_datos.py`: 0 hallazgos sin explicar, 115 explicados (3 s).
- `python scripts/03_construir_sitio.py`: "Listo: sitio/index.html, 23 paginas de seccion y 18 articulos" (3 s). Reescribe las 50 páginas de `sitio/` solo por los finales de línea (CRLF del repositorio contra LF de Linux): `git diff --ignore-cr-at-eol` no muestra cambios. Avisos de Python 3.13 por `re.sub` con `count` posicional (no frenan nada).
- Sintaxis de `sitio/datina.js`: bien.
- `node scripts/prueba_paginas.mjs`: en la nube las CDN de D3 y topojson están bloqueadas y la prueba falla por eso. Con el banco local de `.claude/rules/pruebas.md`: 46 páginas, 18 secciones con "En cifras", "Todo en orden" (3 min 41 s).
- No se corrió `01_descargar.py` ni `02_procesar.py`.

## Hecho

- D0-02: `CLAUDE.md` breve (89 líneas). El texto anterior completo, sin cambios, en `docs/historico/etapas-previas.md`. Reglas por tema en `.claude/rules/` y tres revisores de solo lectura en `.claude/agents/`.

- D1-01: `INVENTARIO.md`. Hallazgo principal: no hay metadatos de fuente por ficha que se puedan leer con un programa (los pies son texto libre y el organismo de cada archivo descargado va en comentarios), así que el explorador necesita un catálogo escrito a mano y validado. Recomendación: página aislada armada por el constructor, sin tocar `datina.js` ni la plantilla.

- D1-02 (borrador): `PROPUESTA_EXPLORADOR.md` con el modelo, las relaciones, las validaciones, lo que no se puede afirmar, la muestra y la pantalla. Cinco decisiones "pendiente" en `DECISIONES.md`.

- Aprobación del autor (10/10/2026): "aprobá todo", seguir el plan hasta el final.
- D2-01: `relaciones.html` aislada, armada por `scripts/relaciones.py` desde el catálogo (`datos/manual/relaciones.json`, por ahora la muestra de Seguridad y Salud: 6 organismos, 16 archivos, 8 fichas). Grafo en tres columnas y tabla con las mismas entidades, conmutador entre las dos y filtro por tipo. Sin tocar `datina.js` ni la plantilla. Pruebas: armado bien, catálogo bien, sintaxis bien, prueba de páginas en el banco: 47 páginas, "Todo en orden".

- D2-02: buscador (todas las palabras, sin tildes; Enter elige la mejor coincidencia), filtros por tema y por organismo, panel de detalle (al costado en pantallas anchas, como hoja desde abajo en las angostas) con la evidencia de cada relación, y el estado en el enlace (`?n=`, `?q=`, `?t=`, `?o=`, `?v=`). Prueba de páginas: 47, "Todo en orden".

- D3-01: catálogo completo en `datos/manual/relaciones.json`: 42 organismos, 143 archivos, 115 fichas (todas salvo las tres de suicidios y las cuatro herramientas), 236 relaciones "alimenta" y 5 "se calcula a partir de", cada una con su evidencia. Lo rastrearon seis agentes por grupo de secciones y lo validó el programa. Los títulos que calcula `datina.js` se leen de ahí al armar (no se copian a mano). El grafo encuadra la cadena del punto elegido, reparte los organismos en todo el alto y muestra los nombres de las fichas cuando hay lugar. `sitio/datos/relaciones.json` pesa 257 KB. Prueba de páginas: 47, "Todo en orden".

## Próxima tarea

D3-02: pruebas automáticas del validador del catálogo (que fallen con relaciones huérfanas, evidencias que no existen o metadatos incompletos).

## Pendientes heredados del sitio

Detalle en `docs/historico/etapas-previas.md`, sección "Pendientes y próximos pasos" y estado de la etapa 28.

- Volver a correr `scripts/transferencias_presupuesto.py` a principios de 2027.
- Revisar que la actualización mensual del 5 de noviembre termine bien (primera con `ubuntu-24.04` fijo y las acciones en su versión 7).
- Conectar el repositorio a Netlify y activar los formularios (contacto).
- Preguntas abiertas al autor: precios de la vivienda por capital (solo fuentes privadas), ingresos por aglomerado de la EPH y votaciones anteriores a 2008.
