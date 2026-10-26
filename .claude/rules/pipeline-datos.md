---
paths:
  - "scripts/01_descargar.py"
  - "scripts/02_procesar.py"
  - "scripts/pruebas_datos.py"
  - "scripts/*_historia.py"
  - "scripts/censo_2022*.py"
  - "scripts/*_presupuesto.py"
  - "scripts/legisladores/**"
  - "scripts/ejecutivo/**"
  - "datos/**"
---

# Reglas del pipeline de datos

Texto completo y motivos de cada regla: `docs/historico/etapas-previas.md`, secciones "Formato de datos", "Cómo agregar una ficha", "Comparación con la OCDE", "Explorador de cruces", "Política" y "Advertencias de fuentes conocidas".

## Formato y fuentes

- `tabla_larga.csv`: `codigo_indec, territorio, periodo, variable, valor, unidad, fuente`. Toda variable nueva entra por `agregar()` de `02_procesar.py`. "00" es el total país. Los trimestres se escriben `2T2026`.
- Una fuente principal por indicador: la nacional (INDEC, DEIS, ministerios). Las series `bm_*` del Banco Mundial solo en la comparación con la OCDE, rotuladas "estimación de [organismo] para [año]". El promedio OCDE es el promedio simple de los 38 miembros, solo con dato de al menos 29.
- Población: proyecciones del INDEC 2022 a 2040 (`POB`, de `indec_proyecciones_provincias.csv`). Excepciones declaradas en cada ficha: tasas que publica la fuente (SNIC, DEIS, ENACOM, escolarización, Aprender), series por provincia anteriores a 2022 (población implícita en el SNIC) y edad y origen por departamento (RENAPER).
- Redondeo único: cuatro decimales en las tablas y un solo redondeo al mostrar (`r1()`).
- Toda la inflación sale de los archivos del INDEC (`IPC_INDEC`), pedido del autor.
- Ningún año que cambia con los datos va escrito a mano: claves del resumen sin año en el nombre (`n_ult`, `anio_ult`), salvo las fijas (2019 antes de la pandemia, elecciones de 2023). Las columnas de las tablas sí llevan el año.
- Los casos que el lugar de registro o un error de la fuente distorsionan van en `datos/manual/distorsiones.json` (con su versión corta `corto`).

## Pruebas de datos (`scripts/pruebas_datos.py`)

- Sumas de control, rangos de tasas y porcentajes, períodos faltantes, valores a más de cinco veces la mediana, dos fuentes que difieren más de 2% y mandatos sin huecos.
- Lo explicado va en `ACEPTADAS` con su motivo. Un hallazgo nuevo sin motivo frena el armado y la publicación. Al 10 de octubre de 2026: 0 sin explicar y 115 explicados.

## Cómo agregar una ficha

1. Sumar la fuente en `FUENTES` de `01_descargar.py`.
2. Procesarla en `02_procesar.py`: tabla larga, su tabla en `tablas` y sus cifras clave en `resumen`.
3. En `plantilla.html`: `<article class="ficha">` con su pregunta en el `h2` (desde el 25 de octubre de 2026, antes `h3`) y `p.ficha-sub` justo debajo (la descripción con su período, que nace con texto: `{{ruta}}` del resumen, y si falta un año se suma la clave en `02_procesar.py`), los controles, `<div class="grafico" data-g="..." data-forma="...">`, recién después `<p class="lead" data-t="...">`, nota, fuente y link al CSV. Su id en `FRECUENCIA` de `03_construir_sitio.py` (si falta, el sitio no se arma). En `datina.js`: texto en `TX`, gráfico en `DIB`, cifra en `CLAVE` y, si corresponde, pregunta en `PREG` e indicador en `INDP` (con su grupo `g`).
4. En `datos/manual/relaciones.json` (Explorador de relaciones): el archivo nuevo con su organismo y la relación "alimenta" hacia la ficha, con el texto exacto de la línea que lo lee. Sin eso el sitio no se arma (ver `docs/roadmap/EXPLORADOR.md`).
5. Correr los scripts y revisar en computadora y en celular.

Antes de sumar un id, clave o alias, buscar si ya existe. En `02_procesar.py`, las variables auxiliares de un bloque nuevo llevan un prefijo propio (`_pvm`, `fr_`): buscar antes si el nombre ya se asigna en otro lugar.

## Cruces y artículos

- Solo tasas, porcentajes o valores por habitante. Las tasas de suicidio y los femicidios quedan fuera.
- Honestidad estadística obligatoria: son 24 casos, correlación no es causalidad, promedios provinciales (falacia ecológica), períodos que no coinciden, Spearman distinto de Pearson y la jurisdicción que más mueve la recta.
- Las variables del Censo por municipio no se cruzan en un mismo gráfico con las de la EPH (otra área).

## Política

- Tono neutro: describir, no adjetivar. Espacios políticos con `REGLAS_ESPACIO` de `02_procesar.py` y `scripts/legisladores/familias.py`. "Frente de Todos" antes de junio de 2019 va con la UCR y aliados.
- Cada presupuesto nuevo necesita su acta en `datos/manual/presupuestos.csv`.
- El lugar de nacimiento de los legisladores no se usa (sale de cruzar nombres y tiene errores).

## Fuentes con advertencias

Antes de tocar una fuente, buscar su nombre en "Advertencias de fuentes conocidas" del registro histórico (CAMMESA, combustibles, SNIC, SNEEP, OEDE, IPC, canastas, DNM, Censo 2022, EPH, CONARE, ACNUR, BCRA, Aprender, PISA, SUBE, RENAPER, DEIS y otras): nombres de archivo que cambian, meses incompletos, controles que ya existen y decisiones del autor.
