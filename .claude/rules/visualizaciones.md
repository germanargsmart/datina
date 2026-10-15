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
- Grupos y categorías (etapa 36): `GRUPOS` en `03_construir_sitio.py` es la única fuente de la barra (desde la etapa 39, los cuatro grupos de la portada como botones con su menú, `GRUPOS_BARRA`, y "Y además" en "Más"; hasta 1080 píxeles, solo "Más" con todos los temas), la lista de temas del menú "Más", la fila del celular, las migas, la fila de cada categoría (`nav.subsecciones`), el pie, el recorrido (`ORDEN`) y la portada (los temas los escribe el constructor, sin esperar a `datina.js`). Tiene que nombrar todas las secciones. Los nombres nuevos (Precios y actividad, Sector privado, Instituciones políticas, Cuentas públicas) van solo en el `h2`: ids y direcciones no cambian.
- Fichas (etapa 37): pregunta en el `h3`, `p.ficha-sub` justo debajo (el índice lo necesita así), los controles y el gráfico, y recién después `p.lead`. `datina.js` arma tres grupos, `.ficha-cab`, `.ficha-grafico` y `.ficha-texto`: desde 1080 píxeles la cabeza y el texto a la izquierda y el gráfico a la derecha, más angosto la pregunta, el gráfico y el texto. Las fichas de suicidio (`TEXTO_ANTES`) y las `ancha` quedan aparte.
- El constructor frena el sitio si se repite un id en la plantilla o una clave en `LEAD`, `TX`, `DIB`, `CLAVE`, `EXTRA`, `EN_CIFRAS` o `SERIE_CIFRA`, si una ficha no tiene `FRECUENCIA` o si hay un año reciente escrito a mano fuera de `FIJOS`.

## Sistema de diseño

- Todo valor sale de `:root` en `datina.css`: colores, diez tamaños de letra (`--t-1` a `--t-10`), espacios en la escala del autor (`--e-1` a `--e-11`: 4, 8, 12, 16, 24, 32, 48, 72, 96 y 144, sin `--e-5`) con `--bloque` (24 a 40, entre fichas) y `--capitulo` (48 a 72, solo donde cambia el tema de la página y entre los bloques de la portada: la línea de "Para entender los datos" va a un bloque de la primera ficha), radios (`--r-tarjeta` 18, `--r-panel` 14, `--r-interno` y `--r-control` 10, barras de gráficos 4 con `RADIO_BARRA`), sombras teñidas de azul (nunca negras) y duraciones (`--dur-1` a `--dur-4`: 150 a 300 ms).
- Letra: Roboto Flex (`wdth` 25 a 45 en títulos condensados), Roboto Mono en etiquetas. Reemplazos medidos con `size-adjust` (Roboto y Verdana). Nada de serif ni Arial. La bajada de cada página y todo subtítulo que sigue a un título van en Roboto Flex 340 con tamaño óptico 28 y `--tinta-bajada`, con su reemplazo propio (`--f-bajada`: sin él la página saltaba 0,12 al llegar la letra).
- Colores: celeste y amarillo del sol sobre blanco, rojo del gorro para la marca, violeta (`--ocde`) solo para la OCDE, verde y rojo (`--bueno`, `--malo`, Okabe e Ito) solo en cambios cuya dirección no se discute y nunca en Política. El color nunca va solo. Solo modo claro.
- Botones: principal, secundario, enlace, tarjeta, despliegue y navegación. Nada más.
- Sin viñetas, sin flechas decorativas, sin leyendas cuando se puede etiquetar directo en la línea. Cortes de línea con `text-wrap` y `sinViuda()`.
- Banderas provinciales (24 x 16, `bandera()`) al lado del nombre de una provincia, salvo en los gráficos de 24 provincias y en `<select>`.

## Gráficos

- D3 7.8.5 desde cdnjs. Cada elemento tarda 300 ms y el escalonado suma como máximo 150 ms (`DUR_G`, `escalon()`). Con movimiento reducido, solo fundidos.
- Barras por provincia con la línea del país (`cfg.ref` o `cfg.pais`) y "País: X" en el cuadro. Las fichas de suicidio no llevan cuadro ni cifra destacada.
- Números en las barras (14 de octubre de 2026, pedido del autor: "los que tienen gráfico de barras y demás deberían tener los números de cada una de ellas arriba", con gráficos limpios y sin mucha carga visual):
  - `barrasH` y `barrasGrupos` llevan el valor al final de cada barra y no dibujan escala. Los números, los nombres de las líneas de referencia y las anotaciones van en capas por encima de la línea del país y de la OCDE, con su borde del color del fondo, y la línea se corta donde pasa por uno de ellos (`lineaConHuecos()`: antes la tachaba en las provincias cercanas al promedio).
  - `columnasApiladas` lleva el total arriba de cada columna. Si no entran todos (muchos años, sobre todo en el celular), van los que entran sin pisarse ni quedar encima de una columna vecina más alta: la más alta, la última, uno cada tantas columnas y los picos. Si entran todos, no dibuja eje ni grilla. El Congreso no lleva totales (`sinTotal`): son siempre las mismas bancas. Las franjas del clima, la pirámide y las barras apiladas al 100% quedan como estaban.
  - La unidad que el número no dice va una vez arriba: `cfg.eje` en las barras y columnas (o la de `cfg.unidad`) y `cfg.yUnidad` en las líneas. Nunca "M" ni "B": `mill()`, `millones()`, `ejeMill()` y `milMn()` en `datina.js`. d3 usa el formato argentino también en los ejes sin formato propio (`d3.formatDefaultLocale`).
  - El número sigue a su barra mientras crece y cuenta hasta su valor, en la misma transición (`contar()`). Con movimiento reducido no se mueve.
- Cada gráfico reserva su alto mientras carga (`data-forma`, `--alto`, `--alto-c`): nada salta cuando llega.
- Al cambiar de provincia, donde solo cambia el resaltado se cambia el color sin redibujar (`resaltar()`).

## Accesibilidad

- Foco visible, teclado completo, Escape cierra paneles y devuelve el foco, contraste 4,5 a 1 en letra chica, nada que dependa solo del mouse (tocar también funciona), movimiento y transparencia reducidos respetados.
- Toda vista gráfica tiene su alternativa en tabla o lista ("Ver tabla").

## Cambios de diseño

El autor pidió el 3 de octubre de 2026 no cambiar el diseño sin preguntar. Lo aprobado después está en el registro histórico: la etapa 27 y las etapas 29 a 38 (rompecabezas de la portada, bandera en dos lugares, "Para entender los datos" al final, menú "Más", Laboratorio y Corte Suprema, gris legible y anotaciones, preguntas como título, grupos y categorías, gráfico antes del texto, bajada y espaciado), y la etapa 39 (10 de octubre de 2026: menos espacio en blanco, sin "Datos rápidos", la barra con los cuatro grupos de la portada y la portada sin Destacados). Cualquier otro cambio visual se consulta antes.
