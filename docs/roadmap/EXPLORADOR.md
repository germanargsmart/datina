# Explorador de relaciones: definiciones, límites y mantenimiento

Página `relaciones.html` (enlazada desde el menú "Secciones", grupo Herramientas, el mapa del pie, "Cómo se hace" de Sobre nosotros y el botón "De dónde sale" del pie de cada ficha, que la abre con esa ficha elegida: `relaciones.html?n=f-...`). Responde "¿de dónde sale cada número?".

## Qué muestra

- **Organismo** (fuente): quien publica el archivo que baja Datina. 41 al 10 de octubre de 2026.
- **Archivo** (conjunto de datos): lo que baja `01_descargar.py` a `datos/crudo/`, lo que está en `datos/manual/` o lo que arma un programa que se corre una vez. 143.
- **Ficha** (indicador): cada ficha del sitio, salvo las tres de suicidios y las cuatro herramientas. 115.
- **Publica**: el organismo publica el archivo. Sale del campo `fuente` de cada archivo en el catálogo.
- **Alimenta**: un programa del sitio lee el archivo para armar la tabla, las cifras o las notas de la ficha, incluidas sus vistas de comparación (por ejemplo, con la OCDE). La evidencia es la línea que lo lee o que lo lleva a la ficha. 235 al 10 de octubre de 2026.
- **Se calcula a partir de**: la cifra de una ficha usa la tabla o la cifra de otra (3 casos: madres adolescentes y nivel socioeconómico, nacidos en otro país en el Censo y el RENAPER, transferencias y apoyo al gobierno). Dos fichas que usan los mismos archivos no quedan unidas por eso: cada una se une a sus archivos.

Cada ficha muestra además lo que ya está escrito en el sitio: título, sección, la fuente como figura en su pie, la frecuencia, la nota fija, el CSV, la unidad (de la tabla larga), el período y la cobertura (leídos de su CSV).

## Qué no muestra

- Si un indicador influye en otro o si dos indicadores van juntos: eso está en Cruces y en los artículos.
- Relaciones por tema: dos fichas de Salud no quedan unidas por ser de Salud.
- El productor original como organismo cuando otro lo republica: el organismo es quien publica el archivo que baja Datina, y el productor original va en el nombre del archivo (PISA y la generación eólica y solar figuran como Our World in Data, con la OCDE y Ember en el nombre; las votaciones, como ¿Cómo Votó?, el proyecto abierto que copia las actas oficiales).
- Los documentos de "Para entender los datos": son por sección, no por ficha.
- Las fichas sobre suicidios (reglas de temas sensibles).

## Decisiones dudosas que quedaron anotadas

Los agentes que rastrearon el catálogo anotaron 52 dudas. Las principales, por si el autor quiere cambiarlas en `datos/manual/relaciones.json`:

- Archivos de la API de Series de Tiempo que mezclan series de varios organismos: se asignaron al que produce la serie que usa la ficha (`energia_emae.csv` a CAMMESA, el ISAC al INDEC, los subsidios a Hacienda).
- Selecciones armadas a mano (leyes clave, actas del presupuesto): organismo "Datina (selección propia)".
- Presidentes y ministros: Wikimedia (Wikipedia y Wikidata), como dice Sobre nosotros.
- Cuentas provinciales (`aif_provincias.xlsx`): Dirección Nacional de Asuntos Provinciales.
- Glaciares y clima: CIAM (Ministerio de Ambiente), que publica los archivos de IANIGLA y del Servicio Meteorológico Nacional.
- Carne, vino y yerba: Subsecretaría de Programación Microeconómica, que publica los indicadores sectoriales.
- Relaciones que solo sirven de control (la serie del país que decide qué meses están completos en petróleo y gas, `gas_residencial_pais.csv` en las pruebas) no se dibujan.

## Auditoría del 10 de octubre de 2026 (D6-01)

Tres revisores de solo lectura controlaron las 242 relaciones del catálogo contra el código: que lo leído en la línea de evidencia llegue de verdad a la ficha y que el organismo sea quien publica el archivo. Resultado: 1 incorrecta y 12 dudosas. Cambios:

- Se sacaron 3 relaciones: la población implícita del SNIC hacia la electricidad de comercios e industrias (solo se usa para años que esa ficha no muestra), y "se calcula a partir de" de las leyes clave y de las elecciones hacia el voto de los legisladores y de su provincia (las fichas comparten los archivos, que ya están unidos a las dos, pero una no usa la tabla de la otra).
- Organismos: los dos archivos del catálogo de Our World in Data pasan a ese organismo, con el productor original en el nombre (antes, OCDE y Ember), y el registro del año de Aprender (`aprender_meta.json`, que arma la descarga) pasa a Datina.
- Evidencias corregidas: los nombres de país del Banco Mundial en los productores del mundo (citaba la línea de otra ficha) y el cuadro 1 del Censo en la serie de los censos (citaba un control y no el cálculo).
- Quedaron como están, con la definición de "alimenta" precisada: las comparaciones con la OCDE que se ven con un botón, la advertencia de años incompletos en las áreas de concesión, la nota de Gran Bretaña en el consumo de gas y las vistas por región o por año que usan otra tabla que la del CSV del pie.
- Sigue sin poder verificarse desde el repositorio quién publica el tablero del que se extrajo a mano `pobreza/datos/crudo/ALL.json` (figura como INDEC, como dice el pie de la ficha): pregunta para el autor.

## Mantenimiento

- Ficha nueva: sumar en `datos/manual/relaciones.json` el archivo (si es nuevo, con su organismo y la línea de `01_descargar.py` que lo nombra) y la relación "alimenta" con el texto exacto de la línea de `02_procesar.py` que lo lee. Si falta, `03_construir_sitio.py` no arma el sitio y dice qué ficha no tiene origen.
- Si un cambio en `02_procesar.py` borra o cambia una línea citada como evidencia, el armado lo marca: actualizar el texto citado.
- Validar sin armar: `python scripts/relaciones.py`. Probar el validador: `python scripts/prueba_relaciones.py`.
- Si el pie de una ficha nombra al organismo de otra forma, sumar ese nombre a `alias` del organismo (el validador exige que el pie nombre al menos uno de los organismos de los que salen sus datos).
