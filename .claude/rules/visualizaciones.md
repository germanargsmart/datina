---
paths:
  - "scripts/datina.js"
  - "scripts/datina.css"
  - "scripts/plantilla.html"
  - "scripts/03_construir_sitio.py"
  - "scripts/iconos_isometricos.py"
  - "sitio/**"
---

# Reglas de gráficos e interfaz

Detalle, medidas y motivos: `docs/historico/etapas-previas.md`, secciones "Reglas de diseño", "Páginas", "Ideas de USAFacts", "Rediseño de la portada y artículos", "Tercera vuelta del diseño", "Grupos y categorías", "Laboratorio" y "Ronda de iteración por etapas" (y, en "Pendientes y próximos pasos", las etapas 29 a 38).

## Arquitectura de páginas

- Todo se cambia en el constructor, la plantilla, `datina.css` o `datina.js`, nunca a mano en `sitio/`.
- Cada sección es una página que sale de la misma plantilla: `03_construir_sitio.py` saca el marcado de las otras secciones y pone `data-pagina` en el `<body>`. Lo que una página necesita de las otras sale del índice del sitio (`D.indice` en `fichas.js`).
- El código de primer nivel de una ficha busca sus elementos con `$("id")` (devuelve un elemento vacío si no existe). Una herramienta entera corta antes con `if (!document.getElementById(...)) return`.
- `datina.js` llama a `DIB[...]` para todo `.grafico[data-g]` y arma el pie de todo `article.ficha`: un componente nuevo que no sea ficha no usa esas clases.
- Las tablas pesadas van en `DIFERIDAS` y se bajan al dibujar su ficha (`cargarTabla`, `conTablas`).
- Grupos y categorías (etapa 36): `GRUPOS` en `03_construir_sitio.py` son los cuatro grupos de temas (Personas y bienestar, Trabajo y economía, Estado y sociedad, Territorio y recursos) y `MENUS` los otros tres menús de la barra (Provincias, Historias con datos y Herramientas). Desde el 23 de octubre de 2026 (Fase 2, respuestas del autor) la barra tiene Temas, Provincias, Historias y Herramientas, cada uno con su menú, y hasta 1080 píxeles un solo botón, "Menú", con esas cuatro partes plegables. "Más" ya no existe. De las dos listas salen la barra, sus menús, la fila del celular, las migas, la fila de cada categoría (`nav.subsecciones`), el pie, el recorrido (`ORDEN`), los filtros por tema del catálogo y la portada (los temas los escribe el constructor, sin esperar a `datina.js`). Entre las dos tienen que nombrar todas las secciones. En los menús los nombres de los grupos se ven en gris, con la misma letra y el mismo tamaño que los enlaces. Los nombres nuevos (Precios y actividad, Sector privado, Instituciones políticas, Cuentas públicas) van solo en el `h2`: ids y direcciones no cambian.
- Índice de capítulos (etapa 6 del plan de mejora): en las páginas con dos capítulos o más (`h2.bloque-grupo` con id `g-…`), `nav.capitulos` debajo de "En cifras". Desde el 28 de octubre de 2026, pedido del autor, tiene el aspecto de la fila de la categoría (`nav.subsecciones`), con "Capítulos" adelante en gris.
- Fichas (etapa 37): pregunta en el `h2` (desde el 25 de octubre de 2026: lo que va debajo del título de la página es h2 y lo que cuelga de eso, h3, sin saltar niveles), `p.ficha-sub` justo debajo (el índice lo necesita así), los controles y el gráfico, y recién después `p.lead`. `datina.js` arma tres grupos, `.ficha-cab`, `.ficha-grafico` y `.ficha-texto`: desde 1080 píxeles la cabeza y el texto a la izquierda y el gráfico a la derecha, más angosto la pregunta, el gráfico y el texto. Las fichas de suicidio (`TEXTO_ANTES`) y las `ancha` quedan aparte.
- El constructor frena el sitio si se repite un id en la plantilla o una clave en `LEAD`, `TX`, `DIB`, `CLAVE`, `EXTRA`, `EN_CIFRAS` o `SERIE_CIFRA`, si una ficha no tiene `FRECUENCIA` o si hay un año reciente escrito a mano fuera de `FIJOS`.

## Sistema de diseño

- Todo valor sale de `:root` en `datina.css`: colores, diez tamaños de letra (`--t-1` a `--t-10`), espacios en la escala del autor (`--e-1` a `--e-11`: 4, 8, 12, 16, 24, 32, 48, 72, 96 y 144, sin `--e-5`) con `--bloque` (24 a 40, entre fichas) y `--capitulo` (48 a 72, solo donde cambia el tema de la página y entre los bloques de la portada: la línea de "Para entender los datos" va a un bloque de la primera ficha), radios (`--r-tarjeta` 18, `--r-panel` 14, `--r-interno` y `--r-control` 10, barras de gráficos 4 con `RADIO_BARRA`), sombras teñidas de azul (nunca negras) y duraciones (`--dur-1` a `--dur-4`: 150 a 300 ms).
- Desde el 27 de octubre de 2026 (plan de mejora, etapa 3, decisión del autor del 25 de octubre) ningún tamaño de letra ni espacio de `datina.css` va escrito a mano fuera de la escala: la letra con `--t-*` y los espacios con `--e-*`. Un valor nuevo se redondea al de la escala más cercano y, si queda justo en el medio, el relleno de lo que se toca (enlaces, botones, campos) sube y lo demás baja ("lo que va junto, junto"), salvo que ya tenga un alto mínimo (los botones de vista). Quedan escritas a mano solo las medidas de dibujo: la marca, el título de la portada, la cruz del mapa, la silueta de carga de cada gráfico (copia sus márgenes), el hueco de la flecha de los selectores, la sangría alineada con un ícono y los ajustes de 0 a 2 píxeles.
- Letra: Roboto Flex (`wdth` 25 a 45 en títulos condensados), Roboto Mono en etiquetas. Reemplazos medidos con `size-adjust` (Roboto y Verdana). Nada de serif ni Arial. La bajada de cada página y todo subtítulo que sigue a un título van en Roboto Flex 340 con tamaño óptico 28 y `--tinta-bajada`, con su reemplazo propio (`--f-bajada`: sin él la página saltaba 0,12 al llegar la letra).
- Colores: celeste y amarillo del sol sobre blanco, rojo del gorro para la marca, violeta (`--ocde`) solo para la OCDE, verde y rojo (`--bueno`, `--malo`, Okabe e Ito) solo en cambios cuya dirección no se discute y nunca en Política. El color nunca va solo. Solo modo claro.
- Botones: principal, secundario, enlace, tarjeta, despliegue y navegación. Nada más.
- Sin viñetas, sin flechas decorativas, sin leyendas cuando se puede etiquetar directo en la línea. Cortes de línea con `text-wrap` y `sinViuda()`.
- Banderas provinciales (24 x 16, `bandera()`) al lado del nombre de una provincia, salvo en los gráficos de 24 provincias y en `<select>`.

## Gráficos

- D3 7.8.5 desde el propio sitio (`sitio/lib/`, copia de `scripts/lib/`). Hasta el 22 de octubre de 2026 venía de cdnjs. Cada elemento tarda 300 ms y el escalonado suma como máximo 150 ms (`DUR_G`, `escalon()`). Con movimiento reducido, solo fundidos.
- Barras por provincia con la línea del país (`cfg.ref` o `cfg.pais`) y "País: X" en el cuadro. Las fichas de suicidio no llevan cuadro ni cifra destacada.
- Cada gráfico reserva su alto mientras carga (`data-forma`, `--alto`, `--alto-c`): nada salta cuando llega.
- Al cambiar de provincia, donde solo cambia el resaltado se cambia el color sin redibujar (`resaltar()`).

## Accesibilidad

- Foco visible, teclado completo, Escape cierra paneles y devuelve el foco, contraste 4,5 a 1 en letra chica, nada que dependa solo del mouse (tocar también funciona), movimiento y transparencia reducidos respetados.
- Toda vista gráfica tiene su alternativa en tabla o lista ("Ver tabla"), desde el 23 de octubre de 2026 en las 143 fichas, y un nombre para lectores de pantalla (`nombreGrafico()` en `lienzo()`: la pregunta de su ficha y dónde están los datos).
- "Saltar al contenido" es la primera parada de Tab en todas las páginas y solo se ve al enfocarlo (Fase 2, paso 6). Las migas van subrayadas.

## Cambios de diseño

El autor pidió el 3 de octubre de 2026 no cambiar el diseño sin preguntar. Lo aprobado después está en el registro histórico: la etapa 27 y las etapas 29 a 38 (rompecabezas de la portada, bandera en dos lugares, "Para entender los datos" al final, menú "Más", Laboratorio y Corte Suprema, gris legible y anotaciones, preguntas como título, grupos y categorías, gráfico antes del texto, bajada y espaciado), y la etapa 39 (10 de octubre de 2026: menos espacio en blanco, sin "Datos rápidos", la barra con los cuatro grupos de la portada y la portada sin Destacados). El 23 de octubre de 2026 el autor aprobó el rediseño de la Fase 2 (`docs/rediseno_fase2.md`): la barra nueva, Curiosidades en Historias con datos, Turismo en Trabajo y economía, las 24 jurisdicciones en el menú Provincias y cuatro datos destacados fijos en la portada. Cualquier otro cambio visual se consulta antes.
