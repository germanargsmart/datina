---
paths:
  - "scripts/plantilla.html"
  - "scripts/datina.js"
  - "datos/manual/explicadores.json"
  - "datos/manual/distorsiones.json"
  - "docs/redaccion/**"
---

# Términos fijos

Un mismo concepto se llama igual en todo el sitio (plan de mejora, R5, 27 de octubre de 2026). La tabla completa, con lo que no se toca (nombres oficiales, citas, literales que buscan las pruebas), está en `docs/redaccion/CRITERIOS_REDACCION.md`.

| Se escribe | No se escribe |
|---|---|
| CABA | la Ciudad, Ciudad de Buenos Aires, Ciudad Autónoma de Buenos Aires (salvo en un nombre oficial: el aglomerado "Ciudad de Buenos Aires" del INDEC, el Ministerio de Educación de la Ciudad) |
| las 24 jurisdicciones | las 24 provincias |
| descontada la inflación | en pesos de igual valor, a precios de hoy, en pesos del mismo valor |
| seguro de desempleo (en la nota, una vez, su nombre oficial: prestación por desempleo) | |
| pensión por invalidez | pensión por discapacidad (la nacional no contributiva) |
| segunda vuelta | balotaje |
| transferencias no automáticas | transferencias discrecionales |
| leyes y proyectos clave | leyes clave |
| correlación (en "Cómo se calcula") y "van juntos" en el texto | "Spearman" en la primera oración |

La prueba de páginas (`TERMINOS` en `scripts/prueba_paginas.mjs`) busca las variantes en el texto visible de cada página y frena el PR si encuentra una. Un término nuevo se suma en la tabla de arriba, en `CRITERIOS_REDACCION.md` y en `TERMINOS`, en el mismo cambio. Los ids y los comentarios del código no cuentan (`x-balotaje` queda).

Los nombres de legisladores, bloques y empresas los arregla `02_procesar.py` (`scripts/nombres_propios.py`, `nombre_empresa()`), y las unidades y fuentes de la tabla larga, `lg_texto()`: no se corrigen a mano en los textos.
