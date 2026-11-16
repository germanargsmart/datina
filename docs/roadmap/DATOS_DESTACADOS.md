# Datos destacados: búsqueda de ejemplos y las cinco opciones (15 de noviembre de 2026)

Pedido del autor del 15 de noviembre de 2026, con la tabla con filtros ya publicada (PR #146): "preparame algo radicalmente distinto, cinco opciones de los datos destacados, investigá repos de GitHub, páginas web internacionales, lo que fuese el discovery para hacer algo competitivo, lindo". Se armaron los cinco bocetos con los 153 datos reales y sus minigráficos (de `SERIE_CIFRA`), con capturas en 1440 y 390 píxeles. El autor eligió el 1, "Pulso", "sin el botón de todos, solo los filtros, y mucho más lindos, con transiciones más lindas". Está hecho: la regla de diseño en `.claude/rules/visualizaciones.md`.

## Lo que se miró

| Referencia | Qué hace | Qué se tomó |
|---|---|---|
| USAFacts, "Fast facts" y "State of the Union in Numbers" (usafacts.org) | Una oración con la cifra, la unidad y la fecha, con "See the data". Capítulos numerados por tema | La cifra con su oración y su enlace es la unidad de cada dato |
| ONS, "How your area has changed" y "Explore Local Statistics" (Reino Unido, repositorio `ONSdigital/explore-local-statistics-app`, MIT) | Cada indicador de un lugar contra la distribución de todos, con su tendencia, sin tabla de posiciones | La tira de las 24 jurisdicciones con la raya del país |
| ONS, "Census maps" | El tema y el lugar quedan en la dirección y se puede compartir | El grupo en el enlace (`?grupo=estado`) |
| Destatis, "Dashboard Deutschland" (Alemania) | Más de 100 indicadores en celdas, pensado primero para el celular | El tablero de celdas con minigráfico |
| Our World in Data, páginas de datos y su rediseño de 2022 | Primero el resumen y después el detalle. Unidad, período, fuente y fecha a la vista | Cada celda con su unidad y su año, y el enlace a la ficha con el detalle |
| ABS QuickStats (Australia) y Stats NZ | Íconos por tema, el mismo dato en gráfico, tabla y metadatos | Los íconos del sitio en cada celda |
| Gapminder (test de "Factfulness"), NYT "You Draw It" e Ipsos "Perils of Perception" | Primero adivinás, después ves el dato y cuánto le erraste | El boceto 3 |
| The Pudding y las recopilaciones de fin de año (Bloomberg, NYT, FT, en el Data Vis Dispatch de Datawrapper) | Relatos al bajar y mosaicos de tamaños distintos | Los bocetos 4 y 5 |

Repositorios útiles si se retoman las otras opciones: `russellsamora/scrollama` (MIT, pasos al bajar), `EE2dev/you-draw-it` (BSD-3, adivinar dibujando), `fnando/sparkline` (MIT). Los de ONS y The Pudding son de Svelte y Datina usa D3 7.8.5 sin marco: sirven como patrón, no como código. El de Our World in Data (`owid/owid-grapher`) ya no es MIT y no se puede reusar.

No se pudieron leer desde la sesión en la nube: el especial de CBS (Países Bajos), el tablero de Alemania (necesita JavaScript), Bloomberg y Visual Capitalist (403).

## Las cinco opciones

1. **Pulso (elegida)**: un tablero de celdas con el tema, la pregunta, la cifra, qué mide y un minigráfico (la serie del país o las 24 jurisdicciones). Los filtros son los cuatro grupos.
2. **Las 24**: cada dato con sus 24 jurisdicciones en una tira de puntos, la raya del país y una provincia elegida en amarillo. Es lo que más distingue a Datina, pero elegir una provincia fuera de `provincia.html` y de sus 24 páginas va contra una regla del autor: si se retoma, va sin elegir provincia (el nombre al pasar el mouse) o como sección de cada página de provincia.
3. **¿Cuánto creés?**: primero se adivina con un deslizador, después aparece el dato, cuánto se erró y su historia. En tandas de 10 por grupo. Como modo aparte, sin temas sensibles (también se pensó dejar afuera la violencia y la pobreza). En un sitio estático no se puede comparar con lo que contestaron los demás.
4. **La Argentina en 30 números**: un número por pantalla al bajar, con su gráfico grande. El más editorial: pide elegir los 30 y mantener el orden, y necesita el índice completo debajo para quien quiere buscar.
5. **Mural**: tarjetas de tamaños distintos con los íconos del sitio. El tamaño sugiere importancia, y es el más difícil de mantener con la escala de espacios y los seis tipos de botón.

La combinación que proponía la búsqueda: Pulso como página, Las 24 al abrir cada dato y ¿Cuánto creés? como modo aparte, con los mismos datos.

## Cómo se hizo Pulso

- `_datos_destacados` en `03_construir_sitio.py`: el conmutador (`.dd-grupos`, nombres cortos en `_DD_CORTO`), y por grupo una sección con su título y la grilla de celdas (`.dd-dato`, con `.c-num`, `.c-txt` y `.dd-mini`).
- `datina.js`: la cifra y su texto los llena el mismo código de siempre (`CLAVE`, `FECHA_DD`). El Pulso (después de `SERIE_CIFRA`) elige el grupo, lo guarda en el enlace, baja solo las tablas que nombran las funciones de `SERIE_CIFRA` de ese grupo (`DIFERIDAS`) y dibuja cada minigráfico. Si una tabla no llega, la celda queda con la cifra y su texto.
- `datina.css`: desde el 15 de noviembre de 2026, tarjetas blancas del mismo alto sobre un fondo gris claro, la cifra con el color de su grupo y un celeste transparente al apoyar el mouse (desde el 16 de noviembre, sin la pregunta, la bajada ni la leyenda arriba), la entrada escalonada (`dd-entra`, 18 ms entre celdas hasta la novena, en `--dur-3`) y, con movimiento reducido, solo el fundido.
- 76 de los 153 datos tienen minigráfico (42 con serie del país y 34 con las 24 jurisdicciones). Los demás no tienen `SERIE_CIFRA`: sumarles una es lo próximo si el autor quiere todas las celdas con gráfico.
