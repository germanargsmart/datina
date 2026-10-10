# Explorador de relaciones: definiciones, límites y mantenimiento

Página `relaciones.html` (enlazada desde el menú "Secciones", grupo Herramientas, el mapa del pie y "Cómo se hace" de Sobre nosotros). Responde "¿de dónde sale cada número?".

## Qué muestra

- **Organismo** (fuente): quien publica el archivo que baja Datina. 42 al 10 de octubre de 2026.
- **Archivo** (conjunto de datos): lo que baja `01_descargar.py` a `datos/crudo/`, lo que está en `datos/manual/` o lo que arma un programa que se corre una vez. 143.
- **Ficha** (indicador): cada ficha del sitio, salvo las tres de suicidios y las cuatro herramientas. 115.
- **Publica**: el organismo publica el archivo. Sale del campo `fuente` de cada archivo en el catálogo.
- **Alimenta**: un programa del sitio lee el archivo para armar la tabla de la ficha. La evidencia es la línea que lo lee (y a veces la que arma la tabla).
- **Se calcula a partir de**: la cifra de una ficha usa la de otra (5 casos: madres adolescentes y nivel socioeconómico, nacidos en otro país en el Censo y el RENAPER, transferencias y apoyo al gobierno, voto al presidente y voto de los legisladores, leyes clave y voto de los legisladores).

Cada ficha muestra además lo que ya está escrito en el sitio: título, sección, la fuente como figura en su pie, la frecuencia, la nota fija, el CSV, la unidad (de la tabla larga), el período y la cobertura (leídos de su CSV).

## Qué no muestra

- Si un indicador influye en otro o si dos indicadores van juntos: eso está en Cruces y en los artículos.
- Relaciones por tema: dos fichas de Salud no quedan unidas por ser de Salud.
- El productor original cuando otro lo republica: el organismo es quien publica el archivo que baja Datina (por ejemplo, PISA figura como OCDE porque así lo cita el sitio, aunque el archivo venga de Our World in Data; las votaciones figuran como ¿Cómo Votó?, el proyecto abierto que copia las actas oficiales).
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

## Mantenimiento

- Ficha nueva: sumar en `datos/manual/relaciones.json` el archivo (si es nuevo, con su organismo y la línea de `01_descargar.py` que lo nombra) y la relación "alimenta" con el texto exacto de la línea de `02_procesar.py` que lo lee. Si falta, `03_construir_sitio.py` no arma el sitio y dice qué ficha no tiene origen.
- Si un cambio en `02_procesar.py` borra o cambia una línea citada como evidencia, el armado lo marca: actualizar el texto citado.
- Validar sin armar: `python scripts/relaciones.py`. Probar el validador: `python scripts/prueba_relaciones.py`.
- Si el pie de una ficha nombra al organismo de otra forma, sumar ese nombre a `alias` del organismo (el validador exige que el pie nombre al menos uno de los organismos de los que salen sus datos).
