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

## Transiciones al pasar el mouse (13 de octubre de 2026)

Pedido del autor, después de instalar las skills de transitions.dev (`.claude/skills/`) y correr `npx transitions-agent` (puntaje 55 de 100): "arreglá todas con la escala de Datina". De sus 52 observaciones, 18 eran la copia de `sitio/`, 14 la copia publicada del consultor de pobreza (casi todas del CSS propio de Observable), 8 el Sol de Mayo (decorativo y aprobado), una la cantidad de duraciones distintas (cuenta las del sol y las de Observable) y una el menú, que no cambia al pasar el mouse sobre la sección actual. Quedaban 10 efectos que cambiaban de golpe: 9 en `scripts/datina.css` y los botones del consultor.
- `scripts/datina.css`: el subrayado de los enlaces, de `.enlace` y de los encabezados de la matriz de votaciones, el contorno del mapa de la portada, el texto y la línea de los despliegues de "Para entender los datos", el título de "Sobre nosotros" y el contorno y el grosor del mapa por departamento funden en `--dur-1` con `--ease-out`.
- `pobreza/src/estilo.css`: el fondo de los botones, con `--dur-1` y `--ease-out` copiados de Datina en su `:root`. La copia publicada (`sitio/pobreza/`) cambia recién al volver a armar el consultor (ver pendientes).
- Verificado en Chrome con mouse simulado, en 1440 y 390 píxeles: con el CSS anterior los efectos de `datina.css` pasaban de golpe y ahora están a mitad de camino a los 45 ms y terminan en 150. Armado, sintaxis y prueba de páginas.

## Cifra y texto sin repetir (13 de octubre de 2026)

Primera de las tareas de abajo, hecha primero como prueba en Trabajo y después, con el visto bueno del autor ("seguí con las otras 68 y refiná todo, fijate de sumar animaciones que se puedan"), en todo el sitio. Relevamiento en Chrome de las 114 fichas con pregunta: 95 tienen cifra destacada y en 72 la primera oración del texto repite el número de la cifra con casi las mismas palabras de su leyenda (petróleo 11, construcción y migraciones 6, educación, energía y movilidad 5, el resto entre 1 y 4). Las leyendas repiten además lo que dice la descripción.
- `CLAVE` lleva una tercera parte, la leyenda corta de la ficha: la unidad y a quién se refiere ("por cada 100 habitantes en todo el país"), sin repetir qué se mide ni el período, que ya están en la descripción. "En cifras" y el buscador siguen con la leyenda completa, porque ahí la cifra va sin la descripción.
- El texto empieza por lo que el gráfico no dice: el cambio en el tiempo, el total o la comparación con el país. En Trabajo: el empleo empieza por la variación en doce meses, los salarios por el cambio descontada la inflación, la rotación por quienes llevan más de cinco años y las exportaciones por el total en dólares.
- La imagen descargable sumaba la cifra con su leyenda debajo de la descripción. Al unir la rama principal quedó la versión de "Leyendas y cifra destacada en Descargar imagen" (más abajo), que hace lo mismo con el número al lado de su frase.
- En todo el sitio: 93 de las 95 cifras llevan leyenda corta (canastas y clima conservan la suya, que ya es la que hace falta) y los 72 textos que repetían la cifra empiezan por otra cosa. También las vistas que repetían la cifra (la serie de homicidios, del consumo eléctrico y del gas, la rama horizontal, el horizonte de las reservas y la recaudación por año). Algunos ejemplos: petróleo empieza por lo que va del año, las provincias petroleras por la comparación con diez años antes, la balanza energética por lo que va del año, la canasta por la línea de indigencia del mismo hogar, las cloacas por cuántas jurisdicciones tienen menos de la mitad de los hogares conectados.
- Las 19 fichas con pregunta y sin cifra no cambian: su primera oración es la que da el número que anuncia la descripción.
- `prueba_paginas.mjs` frena si el texto de una ficha repite el número de su cifra destacada (lo busca como número entero: "21" no coincide con "521"). Probado con fichas de mentira y con el sitio: 0 repeticiones.
- Animaciones nuevas, con la escala de Datina: el texto de la ficha funde al cambiar de vista o de provincia (`--dur-2` con un desenfoque de 2 píxeles, la receta "text swap soft" de transitions.dev, solo después de un cambio de quien lee y nunca al llegar la ficha), y la tabla de "Ver tabla" aparece con un fundido y 4 píxeles de desplazamiento. Con movimiento reducido, los dos son solo fundidos.
- Verificado: armado, sintaxis, relevamiento de las 122 fichas en Chrome (sin valores rotos, dobles espacios, punto y coma ni oraciones en minúscula), prueba de páginas con el control nuevo, las dos animaciones medidas en Chrome con y sin movimiento reducido, y capturas en 1440 y 390 píxeles.

## Números en las barras, línea del país y cifras grandes (14 de octubre de 2026)

Segunda de las tareas de abajo, con lo que pidió el autor al encargarla: un sitio dinámico, con buenas animaciones y gráficos limpios, sin mucha carga visual, "los que tienen gráfico de barras y demás deberían tener los números de cada una de ellas arriba", y las cifras grandes como se dicen en la Argentina: un billón es un millón de millones y, si no, miles de millones, nunca el "billion" norteamericano. Relevamiento en Chrome de las 427 vistas de gráfico de las 23 páginas (cada botón y cada opción de cada ficha), en 1440 y 390 píxeles:
- La línea del país (y la de la OCDE) se dibujaba encima de los números y los tachaba en 40 gráficos de barras por provincia. Ahora los números, los nombres de las líneas y las anotaciones van en capas por encima, con su borde del color del fondo, y la línea se corta donde pasa por uno de ellos (con el borde solo, se veía entre los caracteres, sobre todo en la imagen descargable): 0 números tachados en los dos anchos. En el celular, "Promedio OCDE" se salía de la tarjeta en Flora y fauna: si no entra a la derecha de su línea, va a la izquierda.
- Las columnas por año no tenían números (reservas, subsidios, refugio, radicaciones, pozos, fracturas, productividad, potencia, obra pública, ATN, transferencias y áreas de petróleo y gas). Ahora cada columna lleva su total arriba. Si no entran todos (muchos años, sobre todo en el celular), van los que entran sin pisarse: la más alta, la última, uno cada tantas columnas y los picos. Cuando entran todos, el eje y la grilla sobran y no se dibujan. El Congreso no lleva totales (son siempre 257 o 72 bancas), y las franjas del clima, la pirámide y las barras apiladas al 100% quedan como estaban.
- Las barras horizontales ya tenían su número al final: ahora no dibujan la escala de arriba, que repetía lo mismo.
- Animación: el número sigue a su barra mientras crece y cuenta desde cero hasta su valor, en la misma transición de 300 ms (medido en Chrome cada 25 ms). Con movimiento reducido no se mueve.
- Cifras grandes: "billones" ya se usaba bien (un millón de millones). Lo que quedaba en inglés era la "M" de millones ("2,06 M" en salarios, "4,5 M" en turismo, "M l" en el vino) y la coma de miles de d3 en los ejes sin formato propio ("1,000"). Ahora el número va solo y la unidad una vez arriba del gráfico ("Millones de pesos", "Miles de millones de pesos de 2025"), la lectura de las líneas dice "2,15 millones" y d3 usa el formato argentino en todo. `prueba_paginas.mjs` frena si aparece "M", "B", "MM", "bn" o "billion" junto a un número. Probado con una página de mentira: marca solo esas y no "1.000 m de rama", "billones" ni el texto en mayúsculas del diseño.
- Verificado: armado, sintaxis, prueba de páginas (49 páginas, "Todo en orden", con el control nuevo), los dos relevamientos en 1440 y 390 píxeles, el texto de las 50 páginas sin abreviaturas en inglés, capturas en los dos anchos e imagen descargable.

## Leyendas y cifra destacada en "Descargar imagen" (14 de octubre de 2026, aprobado por el autor)

La imagen de la ficha (`imagenFicha` en `datina.js`) dibuja, justo arriba del gráfico, las leyendas que se ven en la ficha y que son HTML fuera del SVG: `.pol-ley` (reservas, pozos terminados, Congreso, transferencias, elecciones y las demás), `.cx-leyenda` y `.ix-leyenda` (Cruces y el índice), cada clave con su cuadradito y en filas que se cortan al ancho, y `.clave-color` como texto con sus colores. Letra, tamaños, colores y separaciones salen de cómo se ven en la página. Las ocultas (otra medida, la vista OCDE) no van. Verificado: armado, sintaxis, prueba de páginas (49, "Todo en orden") y 32 imágenes de 16 fichas y vistas descargadas en Chrome sin ventana, en 1440 y 390 píxeles.

En un segundo commit, la imagen suma la cifra destacada (`.clave`) debajo de la descripción: el número y su frase en una fila, alineados por la base de la letra, y la frase abajo si no entran (respuesta del autor: "al lado del número"). El canvas no toma `font-variation-settings`: el ancho angosto va con `fontStretch` (el más angosto que acepta es 50, la página usa 45, así que el número sale un 5% más ancho) y el tamaño óptico 144 se logra escribiendo a ese tamaño y achicando. En Safari y Firefox viejos, sin `fontStretch`, el número sale con el ancho normal. Con la vista OCDE la imagen no lleva cifra, porque el gráfico ya no muestra lo que dice (pedido del autor). Las fichas de suicidio no tienen cifra y su imagen no cambia.

## Próxima tarea

Orden elegido por el autor el 10 de octubre de 2026 (respuestas en la sesión local), después de la etapa 39:
1. Hecha el 13 de octubre de 2026 (ver arriba): que la descripción, la cifra destacada y la primera oración del texto no repitan lo mismo en cada ficha.
2. Hecha el 14 de octubre de 2026 (ver arriba): la línea del país en las barras por provincia tapaba los valores de las provincias cercanas al promedio. Con ella, el número de cada barra y las cifras grandes en castellano.
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
- Armar de nuevo el consultor de pobreza en la computadora del autor (`npm run build` en `pobreza/` y después `python scripts/03_construir_sitio.py`) para publicar la transición de los botones. En la nube no se puede: Observable baja `@observablehq/duckdb` de jsdelivr, que está bloqueada.
- Revisar que la actualización mensual del 5 de noviembre termine bien (primera con `ubuntu-24.04` fijo y las acciones en su versión 7).
- Conectar el repositorio a Netlify y activar los formularios (contacto).
- Preguntas abiertas al autor: precios de la vivienda por capital (solo fuentes privadas), ingresos por aglomerado de la EPH y votaciones anteriores a 2008.
