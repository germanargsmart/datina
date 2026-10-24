# Revisión de accesibilidad del Explorador (D4-01)

Revisión de solo lectura del 10 de octubre de 2026 (revisor `revisor-visual-a11y`) sobre el código y capturas en 390, 768, 1024 y 1440 píxeles, más pruebas con Chrome sin ventana (teclado real, movimiento reducido). Resultado: ningún problema P0, 12 P1 y 8 P2. Qué se hizo con cada uno:

| # | Prioridad | Problema | Estado |
|---|---|---|---|
| 1 | P1 | Hasta 1080 píxeles el panel subía desde abajo y tapaba el grafo y la tabla | Corregido: hasta 1080 el panel va debajo de la vista, en el flujo de la página, y la página lo lleva a la vista al elegir |
| 2 | P1 | La hoja no era modal y el foco podía quedar tapado. `aside` dentro de `main` | Corregido: ya no hay hoja encima. El panel es una `section` con nombre (región) |
| 3 | P1 | La cruz de cerrar se iba con el desplazamiento de la hoja | Corregido: sin hoja, el panel es parte de la página |
| 4 | P1 | La evidencia se cortaba y no se podía desplazar con el teclado | Corregido: el código corta la línea donde haga falta y se lee entero |
| 5 | P1 | El punto con el foco del teclado no mostraba su nombre y su marca casi no se distinguía | Corregido: anillo celeste fuerte y nombre a la vista; los nombres de los archivos aparecen al acercarse |
| 6 | P1 | Con un punto elegido, las flechas llevaban el foco a un punto atenuado o fuera de la vista | Corregido: el punto con el foco nunca se atenúa y la vista lo sigue; elegir con el mouse o la tabla mueve también el foco del teclado |
| 7 | P1 | El foco amarillo no llegaba a 3 a 1 | Corregido: celeste fuerte (4,9 a 1), como el resto del sitio |
| 8 | P1 | Las líneas del grafo tenían 1,7 a 1 de contraste | Corregido: `#7F91A6` (3,2 a 1) |
| 9 | P1 | En el celular la tabla cortaba "Lleva a" y ocultaba "Tema" | Corregido: cada fila es un bloque con sus cinco datos |
| 10 | P1 | Puntos chicos para tocar y el grafo atrapaba el desplazamiento | Corregido en parte: zona de toque de 24 píxeles y grafo de 55 % del alto en el celular, con lugar para desplazar la página por fuera. El grafo sigue tomando el gesto de arrastrar (es como se mueve), y en el celular la vista inicial es la tabla |
| 11 | P1 | Cambiar el tamaño de la ventana borraba la vista | Corregido: solo se redibuja si cambia el ancho, y se vuelve a encuadrar lo elegido |
| 12 | P1 | El nombre de "Inicio" no contenía el texto visible | Corregido: "Inicio: volver a la vista inicial" |
| 13 | P2 | Anuncios con errores ("Ficha elegido") y repetidos | Corregido: género y número, un solo anuncio, el resultado de la búsqueda se anuncia al dejar de escribir y Enter en el grafo dice dónde está el detalle |
| 14 | P2 | La fila elegida se marcaba solo con color y sus enlaces no llegaban a 4,5 a 1 | Corregido: barra al costado, `aria-current` y enlaces en azul hondo (6,0 a 1) |
| 15 | P2 | La tabla era menos clara que el grafo para lectores de pantalla | Corregido: el nombre es el encabezado de su fila, "ninguna" se lee, y "se calcula a partir de" se marca en las dos columnas. Desde el 14 de octubre de 2026, al comienzo de la tabla hay un salto que aparece con el foco del teclado: "Ir al detalle de" lo elegido o, sin nada elegido, "Saltar la tabla" |
| 16 | P2 | Datos raros rompían la página con un mensaje equivocado | Corregido: se descartan las relaciones con extremos que no están, se completan nombres y listas, y el error va en una región de alerta |
| 17 | P2 | El foco se perdía al cerrar en algunos navegadores y el panel no volvía arriba | Corregido: si el foco se perdió, vuelve a la fila o al grafo, y el panel vuelve arriba al cambiar |
| 18 | P2 | Filtros silenciosos o frágiles | Corregido: se anuncia que tiene que quedar un tipo, lo elegido que deja de verse se suelta, Enter usa lo escrito aunque no haya pasado la espera, Escape en el buscador o en una lista no cierra el panel, el buscador tiene 16 píxeles en el celular (iOS no acerca la página) y el grafo encuadra los resultados |
| 19 | P2 | Nombres cortados en el grafo y bordes de controles débiles | Corregido en parte: nombres de hasta 40 caracteres, buscador con borde azul y botones de tipo con borde gris oscuro. El nombre completo está en el panel y en la tabla |
| 20 | P2 | Movimiento reducido y márgenes | Corregido: botones quietos al presionar con movimiento reducido, y se lee el ajuste en cada animación. Sin hoja fija, no aplican los márgenes de la muesca ni el marco del sitio |

Verificado después de corregir: teclado real en Chrome (orden de tabulación, flechas, Enter, Escape, foco que vuelve), lo mismo con movimiento reducido, capturas en 390 y 1024, sin errores en la consola y prueba de páginas (47, "Todo en orden").


## Revisión del sitio completo (11 de octubre de 2026)

Revisor de accesibilidad en solo lectura sobre datina.css, datina.js, la plantilla y el Explorador: 0 P0, 9 P1 y 6 P2. Resuelto:
- Contraste: textos de ejemplo de los buscadores con `--faint-texto` (4,88 a 1, eran 3,67 y 2,59), texto claro sobre el azul de la barra y de la portada a 0,95 de opacidad (4,6 a 1, eran 4,09 y 4,2), la provincia elegida en la lista en `--azul-hondo` (5,6 a 1, era 4,04), y el texto de las celdas de las dos matrices elegido entre blanco y tinta según cuál contrasta más (`tintaSobre`).
- Zoom: sin `maximum-scale=1` en el consultor de pobreza (el constructor lo saca en cada armado).
- Teclado: la matriz de correlaciones de Cruces es un solo lugar de Tab y se recorre con las flechas (eran unas 1.600 paradas), sus celdas y los puntos de la dispersión muestran el cuadro con el foco y están en un svg con role group; el buscador de provincias tiene señal de foco; el selector se cierra al salir con Tab; las tablas de "Ver tabla" se desplazan con el teclado (región con nombre y caption).
- Toque: los cuadros de los gráficos ya no se borran al levantar el dedo (se ocultan al salir solo con el mouse, y con el dedo tocando afuera); las notas dicen "Pasá el cursor o tocá".
- Carga y errores: "Ver tabla" avisa si no pudo cargar, el mapa de áreas protegidas también, y una región `#aviso` anuncia los errores de carga y "Enlace copiado". El selector anuncia "Ninguna provincia coincide" y no deja `aria-activedescendant` apuntando a una opción oculta.
- Celular: a 320 píxeles el cuadro corta en renglones y la página no se corre de costado.

Verificado en Chrome sin ventana (matriz con flechas y foco, tabla con región, toque, 320 píxeles sin corrimiento, selector) y prueba de páginas: 49, "Todo en orden".

Quedaban cuatro, por ser cambios más grandes o de diseño. Resueltos el 11 de octubre de 2026 (el autor pidió avanzar con todos los pendientes):
- Matriz de votaciones: cada ley es un botón dentro de su celda, con `aria-pressed` en la elegida (antes la fila era `tr role="button"`), y el detalle de los votos va como texto para lectores además del `title`. Con el mouse se sigue tocando toda la fila.
- El borde del foco ya no se corta en las filas que se deslizan (`.subsecciones`, la fila del celular, "En cifras" y las sugerencias de Cruces): va hacia adentro (`outline-offset` negativo), sin cambiar el diseño.
- Los tamaños de letra (`--t-1` a `--t-10`) están en rem: con 16 píxeles se ven igual y siguen la letra que elige la persona.
- Los mapas de áreas protegidas y de departamentos, las burbujas de los parques y la pirámide muestran el cuadro también al tocar (`pointerdown`).

Verificado: la matriz con el teclado (Tab y Enter) en 1440 y 390 píxeles, el peso y el tamaño de la letra iguales y la prueba de páginas.

## Reflow en 320 píxeles (24 de octubre de 2026)

WCAG 2.2, criterio 1.4.10: con 320 píxeles de ancho (el zoom del 400%) ninguna página tiene que correrse de costado. Medido en todas las páginas, siete y el Explorador en tabla se corrían de 2 a 74 píxeles:
- botones con textos largos que no podían partirse (los de los artículos, los de la OCDE y "Mostrar más");
- la lectura de la serie del selector del BCRA;
- los programas de Educación, con columnas de 300 píxeles como mínimo.

Ahora un botón o una lectura que no entra en su lugar pasa a dos renglones parejos, y la grilla de programas toma el ancho que hay. Si entran, quedan como antes. Verificado con `scripts/prueba_320.mjs`: 53 páginas en 320, 360 y 390 píxeles, ninguna corrida de costado.
