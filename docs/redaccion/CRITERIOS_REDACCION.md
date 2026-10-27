# Criterios de la reescritura editorial (26 de octubre de 2026)

Los aplicaron todas las partes de la reescritura global de Datina (`CLAUDE_CODE_REESCRITURA_GLOBAL_DATINA_CON_EJEMPLOS.md`). Se suman a las reglas de `CLAUDE.md` y de `.claude/rules/`, que tienen prioridad. El diagnóstico de partida es la auditoría del 26 de octubre de 2026 (`docs/roadmap/PLAN_MEJORA.md` y `docs/roadmap/auditoria-2026-10/`).

## Qué se cambia y qué no

Se cambia la redacción. No se cambia lo que el sitio informa ni lo que hace.

- Sí: títulos, preguntas, bajadas, textos, notas, pies, botones, opciones, mensajes, etiquetas accesibles, títulos de pestaña y descripciones, cuando el texto nuevo dice lo mismo con más claridad o corrige algo que el texto viejo decía mal.
- No: datos, cálculos, qué cifra se elige, vistas, orden de las fichas, menús, nombres de las secciones en la barra, direcciones, ids, clases, diseño, comportamiento, configuración de la IA (sus instrucciones al modelo incluidas), funciones prendidas o apagadas.
- Lo que para quedar claro necesitaría cambiar un dato, una vista, la estructura o una decisión ya tomada no se hace: se anota como pendiente con la ubicación y una propuesta.

## Forma

- Español rioplatense profesional, con voseo en las instrucciones ("Elegí una provincia", "Tocá una barra"). Nunca "Conocé", "Descubrí" ni "Mirá" en un título.
- Una idea por oración. El sujeto antes del verbo. Oraciones cortas. Sin gerundios de relleno.
- Sin punto y coma en ningún texto visible.
- "y" pasa a "e" delante del sonido de la i. En los textos armados con datos, con `yE()` o `lista()`. En los fijos, escrito a mano.
- Sin adjetivos de valoración ni palabras de folleto: nada de "impacto", "ecosistema", "soluciones", "potenciá", "clave" como adjetivo vacío, "fundamental", "termómetro".
- Fechas en palabras: "24 de octubre de 2026", "primer semestre de 2026", "primer trimestre de 2026". Meses en minúscula.
- Siglas: la primera vez que aparecen en una ficha o en un texto largo, con lo que son o lo que hacen ("CAMMESA, la empresa que administra el mercado eléctrico mayorista"). Después, solo la sigla.
- Unidades completas: qué se cuenta, cada cuánto ("cada 1.000 habitantes"), en qué moneda y de qué momento ("pesos de 2025"), y de qué período.

## Títulos y bajadas

- El título de cada ficha y de cada página es una pregunta concreta que los datos contestan. Neutra, sin cifras ni años, nunca retórica. Las fichas de suicidio y la de muertes violentas conservan su título descriptivo.
- La pregunta dice lo que la ficha mide de verdad: si cuenta visitas, pregunta por visitas, no por personas. Si la cifra es por provincia, la pregunta habla de provincias.
- La bajada (`p.ficha-sub`) dice qué se mide, en qué unidad y de qué período, con el período de `{{ruta}}` o del resumen. No enumera las vistas de la ficha.
- Ninguna pregunta cambia si la página o la ficha no contesta la pregunta nueva.

## Cifras y límites

- Ninguna cifra ni año que cambia con los datos se escribe a mano: sale del resumen (`${...}` en `datina.js`, `{{ruta}}` en la plantilla). Si el texto nuevo necesita una cifra que el resumen no tiene, no se agrega: se anota como pendiente.
- Si la cifra destacada, el texto y el gráfico usan medidas o períodos distintos, el texto lo dice ("en doce meses", "en agosto", "promedio de 2023 a 2025").
- Una relación entre dos datos se describe, no se explica: "van juntos", "las provincias con más X tienden a tener más Y", nunca "X causa Y", "X hace que", "por eso" sin sostén. Se conserva todo "Qué no dice este dato".
- Se conservan las notas metodológicas, las advertencias y las aclaraciones de comparabilidad. Se pueden redactar mejor. No se borran para acortar.
- Si una advertencia que cambia la lectura del gráfico está solo en "Sobre los datos", se suma una oración en el texto visible (por ejemplo, que CAMMESA informa CABA y Buenos Aires juntas).

## Términos fijos

Un mismo concepto se llama igual en todo el sitio.

| Concepto | Se escribe | No se escribe |
|---|---|---|
| La Ciudad Autónoma de Buenos Aires en gráficos y textos | CABA | la Ciudad, Ciudad de Buenos Aires (salvo en un nombre oficial, como "Ciudad de Buenos Aires" de un aglomerado del INDEC) |
| Las 23 provincias y CABA juntas | las 24 jurisdicciones | las 24 provincias |
| Valores ajustados por inflación | descontada la inflación | en pesos de igual valor, a precios de hoy, en pesos del mismo valor |
| Prestación de la ANSES por desempleo | seguro de desempleo (y una vez, en la nota, su nombre oficial: prestación por desempleo) | |
| Pensión no contributiva por invalidez | pensión por invalidez | pensión por discapacidad |
| Segunda vuelta electoral | segunda vuelta | balotaje |
| Transferencias de la Nación que no fija una ley | transferencias no automáticas | transferencias discrecionales |
| Votaciones del Congreso que sigue el sitio | leyes y proyectos clave (incluye proyectos que no fueron ley) | leyes clave |
| La relación entre dos series | correlación (en "Cómo se calcula") y "van juntos" en el texto | "Spearman" en la primera oración |

## Lo que no se toca

- Los nombres oficiales de organismos, leyes, programas, aglomerados del INDEC y categorías de las fuentes. Un nombre de organismo solo se cambia si el propio repositorio ya documenta el nombre correcto (por ejemplo, en `datos/manual/relaciones.json`). Si hay duda, queda como está y se anota.
- Las citas textuales de fuentes (`cita` en `explicadores.json`, `dato` en `provincias_historia.json`).
- Los nombres de las columnas de las tablas que se descargan y las etiquetas que salen de los datos (unidades y fuentes de `tabla_larga.csv`): corregirlas es reprocesar los datos (punto R14 del plan) y queda pendiente.
- Los literales que buscan las pruebas: "Ver tabla", "Cómo se calcula", "Para entender los datos", "Artículos con este dato", "Menú", "País:", "Respuesta rápida:", los botones "Ficha: …" y las respuestas rápidas a "petróleo" y "¿Cuánto se gana en Neuquén?". Si cambia uno, cambia la prueba en el mismo cambio.
- El organismo de cada pie de ficha: el Explorador de relaciones controla que el pie nombre al organismo de sus datos (por su nombre, su sigla o un alias de `datos/manual/relaciones.json`).
- Las salvaguardas de suicidio de `CLAUDE.md`, enteras.
