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

- D3-02: `scripts/prueba_relaciones.py` rompe una copia del catálogo de 18 formas (relaciones huérfanas, evidencia que no está en el código o fuera del repositorio, tipos que no corresponden, fichas sin origen, archivos y organismos sin uso, ciclos, fichas de suicidio, pies que no nombran al organismo, repetidos) y controla que el validador marque cada una. 03 la corre antes de armar el explorador (0,8 segundos). Las evidencias se buscan una sola vez por corrida.

- D4-01: revisión de accesibilidad (0 P0, 12 P1, 8 P2) y correcciones, detalle en `REVISION_A11Y.md`. Panel en el flujo hasta 1080 píxeles, tabla apilada en el celular, foco y contraste, anuncios, zona de toque y datos raros. Prueba de páginas: 47, "Todo en orden".

- D4-02: regresión del sitio completo. `pruebas_datos.py` 0 sin explicar y 115 explicados (igual que la línea de base); catálogo y validador bien; el armado deja las 46 páginas anteriores, `datina.css`, `datina.js` y `fichas.js` idénticas a las del repositorio salvo los finales de línea (`git diff --ignore-cr-at-eol` vacío fuera del explorador); las 115 fichas del explorador llevan a una página con esa ancla y a CSV que existen; prueba de páginas 47, "Todo en orden".

- D5-01: el explorador está enlazado desde el menú "Secciones" (Herramientas), el mapa del pie de todas las páginas y "Cómo se hace" de Sobre nosotros, sin tocar `datina.js`. Definiciones, límites, dudas del catálogo y mantenimiento en `EXPLORADOR.md`; "Cómo agregar una ficha" suma el paso del catálogo.

- D7-01 y D7-02: `docs/deploy/ARQUITECTURA.md` (qué se publica, comparación de opciones y decisión), `RUNBOOK.md` y `CHANGELOG_DEPLOY.md`. Decisión: publicación estática (Netlify, ya configurado). Nada necesita contenedor: Dokploy (el nombre correcto de "Docploy", verificado) tendría sentido recién con un servicio propio. Sin instalar nada ni tocar servidores.

## Unión con las etapas 29 a 38 (10 de octubre de 2026)

La rama del plan salió del commit b4b1fc1 (5 de octubre) y, mientras tanto, la computadora del autor sumó las etapas 29 a 38 (6 y 7 de octubre, 18 commits): rompecabezas de la portada, bandera de la provincia elegida en dos lugares, "Para entender los datos" al final, menú "Más", Laboratorio y la Corte Suprema, "24 jurisdicciones" y anotaciones, preguntas como título en las 18 secciones, grupos y categorías, el gráfico antes del texto y la bajada con el espaciado editorial. Detalle en `docs/historico/etapas-previas.md`, "Pendientes y próximos pasos". Se unieron en un commit de unión:
- `CLAUDE.md` breve de la rama, con la regla de redacción vigente (preguntas) y el resumen de diseño al día. El registro histórico pasó a ser el `CLAUDE.md` completo del 7 de octubre.
- El enlace al Explorador en el menú "Más" y en el pie, que desde la etapa 36 salen de `GRUPOS`.
- El Explorador toma el nombre de cada ficha de su `h3`, que ahora es la pregunta. El catálogo validó sin cambios (241 relaciones con evidencia).
- Verificado: armado, sintaxis, catálogo y validador, prueba de páginas, el Explorador y el pie con "De dónde sale" en 1440 y 390 píxeles.

## Etapa 39: menos espacio, barra y portada con el mismo orden (10 de octubre de 2026)

Pedido del autor: "demasiado espacio en blanco sin sentido y poco de diseñador", "es rarísimo que en la portada tengas Explorá la Argentina por tema y una categorización, mientras que en las pestañas del header tengas los temas sueltos" y "sacá ese recuadro de preguntas que van pasando". Respuestas: "4 grupos con menú" y la portada "Sin Destacados".
- Sin "Datos rápidos". Sus preguntas (`PREG`) siguen en el buscador.
- Espaciado: `--bloque` de 24 a 40 y `--capitulo` de 48 a 72 (eran 48 a 72 y 96 a 144), la línea de "Para entender los datos" a un bloque de la primera ficha, fichas con 28 de relleno y el pie con 48. La portada pasó de 4.461 a 2.844 píxeles de alto en la computadora y de 6.510 a 5.007 en el celular, Trabajo de 6.366 a 5.788 (de 9.217 a 8.841 en el celular) y Precios y actividad de 7.260 a 6.636. Medido con una herramienta que busca franjas sin texto, imagen ni control: en las secciones no queda ninguna de 48 píxeles o más en la computadora.
- La barra: los cuatro grupos de la portada, cada uno con su menú (el mismo código que "Más", de a uno abierto), el de la página actual marcado, y "Más" con Tu provincia, Curiosidades, los artículos, las herramientas y Datina. Entra de 1081 a 1440 píxeles con Tierra del Fuego elegida (24 de margen en el peor caso). En el Explorador de relaciones, que no carga `datina.js`, los grupos son enlaces a su columna de la portada.
- La portada: lo azul con el mapa, "Explorá la Argentina por tema" (columnas sin panel gris, escritas por el constructor), Artículos (el de la relación más marcada primero, que era el destacado) y Herramientas. Sin Destacados: "Tu provincia" ya está en lo azul y las votaciones, en Instituciones políticas.
- Verificado: armado, sintaxis, prueba de páginas (49), la barra en seis anchos con y sin provincia, los menús con el mouse y el teclado, el celular, el buscador y la página quieta al cargar (portada 0,001 en la computadora y 0 en el celular).

## La misma frase una sola vez: muestra en Trabajo (10 de octubre de 2026)

Medido en el sitio armado (Chrome sin ventana, 1440 píxeles): 116 fichas con pregunta, 97 con cifra destacada y unas 100 donde la leyenda de la cifra y la primera oración del texto (o la descripción y el texto) dicen casi lo mismo. Regla propuesta, cada pieza con un solo trabajo:
- Descripción (`p.ficha-sub`): qué mide, por dónde y cuándo. No cambia.
- Cifra destacada: el número con su unidad y una leyenda corta que dice solo lo que la descripción no dice (el alcance o la población de referencia: "promedio bruto del país", "cada 100 habitantes en el país"). Va como tercer elemento de `CLAVE` (`[cifra, texto completo, leyenda corta]`). El texto completo sigue en "En cifras" y en el buscador, que se leen sin la descripción. Sin leyenda corta, la ficha usa el texto completo como antes.
- Texto (`p.lead`): empieza por lo que ni la cifra ni el gráfico dicen (el cambio en el tiempo, la distancia entre extremos, el total, el contexto) y no repite la cifra destacada. Conserva las unidades y los períodos de cada cifra nueva.
- La imagen que baja "Descargar imagen" suma la cifra con su leyenda debajo de la descripción, porque el texto ya no la repite.

Aplicado en las cuatro fichas de Trabajo (empleo, salarios, rotación y exportaciones). Salarios ya no necesita "Ver más" en la computadora.


Orden elegido por el autor el 10 de octubre de 2026 (respuestas en la sesión local), después de la etapa 39:
1. Que la descripción, la cifra destacada y la primera oración del texto no repitan lo mismo en cada ficha (en salarios, la misma frase tres veces). Muestra en Trabajo hecha (arriba): falta la aprobación del autor y, después, aplicarlo sección por sección al resto.
2. La línea del país en las barras por provincia tapa los valores de las provincias cercanas al promedio.
3. Etapa 40: la población de cada provincia hasta 2040 (proyecciones del INDEC) y las causas de muerte por provincia (DEIS, tasas ajustadas por edad, causas externas agrupadas sin separar el suicidio). Cada ficha nueva necesita su origen en `relaciones.json`.
4. Opcional: la silueta de "En cifras" de Trabajo mide 140 píxeles y las tarjetas más, y con una red muy lenta la página salta 45 píxeles al llegar el código.

## Plan del Explorador (anterior a la unión)

Todo lo que se podía hacer sin el autor está hecho. Lo que sigue necesita al autor:
1. Revisar y unir el PR del plan.
2. D7-03 a D7-06: elegir dónde publicar (recomendado: Netlify), conectar el repositorio y el dominio, activar el formulario, verificar y probar volver atrás (`docs/deploy/RUNBOOK.md`).
3. Revisar las decisiones dudosas del catálogo (`EXPLORADOR.md`).

Fase 6, primer caso de uso (pedido del autor, 10/10/2026: "hacé lo del enlace en el pie de cada ficha"): botón "De dónde sale" entre las acciones del pie de las 115 fichas del explorador, que abre `relaciones.html?n=<ficha>` con el detalle de esa ficha a la vista. No va en las herramientas ni en las fichas de suicidios (la lista sale de `scripts/relaciones.py`, `EXCLUIDAS`, y el constructor se la pasa a `datina.js`). Verificado: 115 botones, todos hacia una ficha del explorador y con su título asociado para lectores de pantalla, pie en una fila en la computadora y en tres en el celular, prueba de páginas 47, "Todo en orden".

## Pendientes heredados del sitio

Detalle en `docs/historico/etapas-previas.md`, sección "Pendientes y próximos pasos" (hasta la etapa 38).

- Volver a correr `scripts/transferencias_presupuesto.py` a principios de 2027.
- Revisar que la actualización mensual del 5 de noviembre termine bien (primera con `ubuntu-24.04` fijo y las acciones en su versión 7).
- Conectar el repositorio a Netlify y activar los formularios (contacto).
- Preguntas abiertas al autor: precios de la vivienda por capital (solo fuentes privadas), ingresos por aglomerado de la EPH y votaciones anteriores a 2008.
