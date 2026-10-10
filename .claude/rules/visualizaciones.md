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

Detalle, medidas y motivos: `docs/historico/etapas-previas.md`, secciones "Reglas de diseño", "Páginas", "Ideas de USAFacts", "Rediseño de la portada y artículos", "Tercera vuelta del diseño" y "Ronda de iteración por etapas".

## Arquitectura de páginas

- Todo se cambia en el constructor, la plantilla, `datina.css` o `datina.js`, nunca a mano en `sitio/`.
- Cada sección es una página que sale de la misma plantilla: `03_construir_sitio.py` saca el marcado de las otras secciones y pone `data-pagina` en el `<body>`. Lo que una página necesita de las otras sale del índice del sitio (`D.indice` en `fichas.js`).
- El código de primer nivel de una ficha busca sus elementos con `$("id")` (devuelve un elemento vacío si no existe). Una herramienta entera corta antes con `if (!document.getElementById(...)) return`.
- `datina.js` llama a `DIB[...]` para todo `.grafico[data-g]` y arma el pie de todo `article.ficha`: un componente nuevo que no sea ficha no usa esas clases.
- Las tablas pesadas van en `DIFERIDAS` y se bajan al dibujar su ficha (`cargarTabla`, `conTablas`).
- El constructor frena el sitio si se repite un id en la plantilla o una clave en `LEAD`, `TX`, `DIB`, `CLAVE`, `EXTRA`, `EN_CIFRAS` o `SERIE_CIFRA`, si una ficha no tiene `FRECUENCIA` o si hay un año reciente escrito a mano fuera de `FIJOS`.

## Sistema de diseño

- Todo valor sale de `:root` en `datina.css`: colores, diez tamaños de letra (`--t-1` a `--t-10`), espacios múltiplos de 4 (`--e-1` a `--e-10`), radios (`--r-tarjeta` 18, `--r-panel` 14, `--r-interno` y `--r-control` 10, barras de gráficos 4 con `RADIO_BARRA`), sombras teñidas de azul (nunca negras) y duraciones (`--dur-1` a `--dur-4`: 150 a 300 ms).
- Letra: Roboto Flex (`wdth` 25 a 45 en títulos condensados), Roboto Mono en etiquetas. Reemplazos medidos con `size-adjust` (Roboto y Verdana). Nada de serif ni Arial.
- Colores: celeste y amarillo del sol sobre blanco, rojo del gorro para la marca, violeta (`--ocde`) solo para la OCDE, verde y rojo (`--bueno`, `--malo`, Okabe e Ito) solo en cambios cuya dirección no se discute y nunca en Política. El color nunca va solo. Solo modo claro.
- Botones: principal, secundario, enlace, tarjeta, despliegue y navegación. Nada más.
- Sin viñetas, sin flechas decorativas, sin leyendas cuando se puede etiquetar directo en la línea. Cortes de línea con `text-wrap` y `sinViuda()`.
- Banderas provinciales (24 x 16, `bandera()`) al lado del nombre de una provincia, salvo en los gráficos de 24 provincias y en `<select>`.

## Gráficos

- D3 7.8.5 desde cdnjs. Cada elemento tarda 300 ms y el escalonado suma como máximo 150 ms (`DUR_G`, `escalon()`). Con movimiento reducido, solo fundidos.
- Barras por provincia con la línea del país (`cfg.ref` o `cfg.pais`) y "País: X" en el cuadro. Las fichas de suicidio no llevan cuadro ni cifra destacada.
- Cada gráfico reserva su alto mientras carga (`data-forma`, `--alto`, `--alto-c`): nada salta cuando llega.
- Al cambiar de provincia, donde solo cambia el resaltado se cambia el color sin redibujar (`resaltar()`).

## Accesibilidad

- Foco visible, teclado completo, Escape cierra paneles y devuelve el foco, contraste 4,5 a 1 en letra chica, nada que dependa solo del mouse (tocar también funciona), movimiento y transparencia reducidos respetados.
- Toda vista gráfica tiene su alternativa en tabla o lista ("Ver tabla").

## Cambios de diseño

El autor pidió el 3 de octubre de 2026 no cambiar el diseño sin preguntar. Lo aprobado después está en el registro histórico (etapa 27). Cualquier otro cambio visual se consulta antes.
