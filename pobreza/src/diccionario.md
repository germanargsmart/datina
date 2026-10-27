---
title: Diccionario de datos
toc: true
---

# Diccionario de datos

Las seis tablas del consultor de pobreza, columna por columna. Todas están en formato Parquet, comprimidas con zstd, y se pueden leer con DuckDB, R, Python, QGIS o Excel con un complemento. Los porcentajes van de 0 a 100. <!-- Lo genera scripts/exportar_parquet.py: si se edita a mano, el próximo export lo pisa. -->

Cómo leer la precisión: el INDEC recomienda leer con cuidado los valores con un coeficiente de variación de entre 16% y 25% y considera no confiables los que superan 25%.

[Volver al consultor de pobreza](./)

## serie_nacional

**Serie nacional de pobreza e indigencia.** Incidencia de la pobreza y la indigencia en el total de 31 aglomerados urbanos, por semestre, desde el segundo semestre de 2016 hasta el primero de 2026. Fuente: INDEC, EPH.

Archivo: `data/serie_nacional.parquet` (80 filas).

| Columna | Tipo | Qué contiene |
|---|---|---|
| `periodo` | texto | Semestre, por ejemplo 1S 2026 |
| `anio` | entero | Año del semestre |
| `semestre` | entero | Semestre del año (1 o 2) |
| `indicador` | texto | pobreza o indigencia |
| `unidad` | texto | personas u hogares (población de referencia) |
| `valor_pct` | decimal | Porcentaje de personas u hogares en esa condición sobre el total de la población de referencia de los 31 aglomerados |

## pobreza_edad

**Pobreza e indigencia por grupo de edad.** Porcentaje de personas pobres e indigentes dentro de cada grupo de edad, total de 31 aglomerados urbanos, por semestre. Incluye los grupos generales (0 a 14, 15 a 29, 30 a 64, 65 y más) y el detalle de niñas, niños y adolescentes (0 a 17 y subgrupos). Fuente: INDEC, EPH.

Archivo: `data/pobreza_edad.parquet` (360 filas).

| Columna | Tipo | Qué contiene |
|---|---|---|
| `periodo` | texto | Semestre, por ejemplo 1S 2026 |
| `anio` | entero | Año del semestre |
| `semestre` | entero | Semestre del año (1 o 2) |
| `grupo_edad` | texto | Grupo de edad en años cumplidos (Total es el total de personas) |
| `serie_grupos` | texto | general (grupos de toda la población) o ninez (0 a 17 años y subgrupos) |
| `indicador` | texto | pobreza o indigencia |
| `valor_pct` | decimal | Porcentaje de personas del grupo de edad que están en esa condición |

## aglomerados

**Aglomerados, regiones y totales en el último semestre.** Datos del primer semestre de 2026 para el total de 31 aglomerados, las 6 regiones estadísticas, los 31 aglomerados (con Gran Buenos Aires dividido en CABA y Partidos del GBA) y los grupos por tamaño. Incluye coeficiente de variación (CV) e intervalo de confianza al 90% de cada incidencia. Fuente: INDEC, EPH, informe técnico del primer semestre de 2026 y anexo de CV.

Archivo: `data/aglomerados.parquet` (42 filas).

| Columna | Tipo | Qué contiene |
|---|---|---|
| `periodo` | texto | Semestre de referencia (1S 2026) |
| `nombre` | texto | Nombre del aglomerado, región o total |
| `tipo` | texto | total, interior, region, aglomerado o tamano (grupo por tamaño del aglomerado) |
| `region` | texto | Región estadística del INDEC a la que pertenece (vacía en totales) |
| `pobreza_personas_pct` | decimal | Porcentaje de personas pobres sobre el total de personas de la unidad |
| `pobreza_personas_cv` | decimal | Coeficiente de variación de pobreza_personas_pct, en %. Entre 16 y 25 leer con cuidado, más de 25 no confiable |
| `pobreza_personas_li` | decimal | Límite inferior del intervalo de confianza al 90% de pobreza_personas_pct, en % |
| `pobreza_personas_ls` | decimal | Límite superior del intervalo de confianza al 90% de pobreza_personas_pct, en % |
| `pobreza_personas_miles` | decimal | Cantidad de personas pobres, en miles |
| `pobreza_hogares_pct` | decimal | Porcentaje de hogares pobres sobre el total de hogares de la unidad |
| `pobreza_hogares_cv` | decimal | Coeficiente de variación de pobreza_hogares_pct, en %. Entre 16 y 25 leer con cuidado, más de 25 no confiable |
| `pobreza_hogares_li` | decimal | Límite inferior del intervalo de confianza al 90% de pobreza_hogares_pct, en % |
| `pobreza_hogares_ls` | decimal | Límite superior del intervalo de confianza al 90% de pobreza_hogares_pct, en % |
| `pobreza_hogares_miles` | decimal | Cantidad de hogares pobres, en miles |
| `indigencia_personas_pct` | decimal | Porcentaje de personas indigentes sobre el total de personas de la unidad |
| `indigencia_personas_cv` | decimal | Coeficiente de variación de indigencia_personas_pct, en %. Entre 16 y 25 leer con cuidado, más de 25 no confiable |
| `indigencia_personas_li` | decimal | Límite inferior del intervalo de confianza al 90% de indigencia_personas_pct, en % |
| `indigencia_personas_ls` | decimal | Límite superior del intervalo de confianza al 90% de indigencia_personas_pct, en % |
| `indigencia_personas_miles` | decimal | Cantidad de personas indigentes, en miles |
| `indigencia_hogares_pct` | decimal | Porcentaje de hogares indigentes sobre el total de hogares de la unidad |
| `indigencia_hogares_cv` | decimal | Coeficiente de variación de indigencia_hogares_pct, en %. Entre 16 y 25 leer con cuidado, más de 25 no confiable |
| `indigencia_hogares_li` | decimal | Límite inferior del intervalo de confianza al 90% de indigencia_hogares_pct, en % |
| `indigencia_hogares_ls` | decimal | Límite superior del intervalo de confianza al 90% de indigencia_hogares_pct, en % |
| `indigencia_hogares_miles` | decimal | Cantidad de hogares indigentes, en miles |
| `total_personas_miles` | decimal | Población total de la unidad, en miles de personas (proyección EPH) |
| `total_hogares_miles` | decimal | Total de hogares de la unidad, en miles |

## aglomerados_serie

**Serie por aglomerado, región y total.** Incidencia de la pobreza y la indigencia por semestre para cada una de las 42 unidades de la tabla aglomerados. Vacío donde el INDEC no publicó dato (Gran Resistencia en el segundo semestre de 2019 y Ushuaia - Río Grande en el segundo semestre de 2020). Fuente: INDEC, EPH.

Archivo: `data/aglomerados_serie.parquet` (3360 filas).

| Columna | Tipo | Qué contiene |
|---|---|---|
| `aglomerado` | texto | Nombre del aglomerado, región o total |
| `tipo` | texto | total, interior, region, aglomerado o tamano |
| `region` | texto | Región estadística del INDEC (vacía en totales) |
| `periodo` | texto | Semestre, por ejemplo 1S 2026 |
| `anio` | entero | Año del semestre |
| `semestre` | entero | Semestre del año (1 o 2) |
| `indicador` | texto | pobreza o indigencia |
| `unidad` | texto | personas u hogares |
| `valor_pct` | decimal | Porcentaje de personas u hogares de la unidad en esa condición (vacío si no hay dato) |

## gba_partidos_comunas

**Partidos del GBA y comunas de CABA (estimación en áreas pequeñas).** Estimación de la pobreza y la indigencia en los 24 partidos del Gran Buenos Aires y las 15 comunas de CABA para el primer semestre de 2026. No es una medición oficial: sale de un modelo estimado con la EPH del primer trimestre de 2026 y aplicado a las características de cada radio censal (Censo 2022), calibrado para reproducir el total oficial de cada dominio (36,9% de personas pobres en los Partidos del GBA y 11,1% en CABA). Intervalos de confianza al 90%, calculados por remuestreo (bootstrap). Población de referencia: la del Censo 2022.

Archivo: `data/gba_partidos_comunas.parquet` (39 filas).

| Columna | Tipo | Qué contiene |
|---|---|---|
| `periodo` | texto | Semestre de referencia de la estimación (1S 2026) |
| `unidad` | texto | Partido del GBA o comuna de CABA |
| `jurisdiccion` | texto | CABA (comunas) o GBA (partidos del conurbano) |
| `zona` | texto | Agrupamiento: Primera corona, Segunda corona, La Matanza, CABA norte, CABA centro o CABA sur |
| `poblacion_censo_2022` | entero | Personas según el Censo 2022 |
| `hogares_censo_2022` | entero | Hogares según el Censo 2022 |
| `pobreza_personas_pct` | decimal | Porcentaje estimado de personas pobres |
| `pobreza_personas_li` | decimal | Límite inferior del intervalo al 90% de pobreza_personas_pct, en % |
| `pobreza_personas_ls` | decimal | Límite superior del intervalo al 90% de pobreza_personas_pct, en % |
| `pobreza_personas_cv` | decimal | Coeficiente de variación bootstrap de pobreza_personas_pct, en % |
| `pobreza_hogares_pct` | decimal | Porcentaje estimado de hogares pobres |
| `pobreza_hogares_li` | decimal | Límite inferior del intervalo al 90% de pobreza_hogares_pct, en % |
| `pobreza_hogares_ls` | decimal | Límite superior del intervalo al 90% de pobreza_hogares_pct, en % |
| `indigencia_personas_pct` | decimal | Porcentaje estimado de personas indigentes |
| `indigencia_personas_li` | decimal | Límite inferior del intervalo al 90% de indigencia_personas_pct, en % |
| `indigencia_personas_ls` | decimal | Límite superior del intervalo al 90% de indigencia_personas_pct, en % |
| `personas_pobres` | entero | Cantidad estimada de personas pobres, sobre la población censal |
| `personas_indigentes` | entero | Cantidad estimada de personas indigentes, sobre la población censal |
| `nbi_hogares_pct` | decimal | Porcentaje de hogares con necesidades básicas insatisfechas (Censo 2022) |
| `privacion_convergente_pct` | decimal | Porcentaje de hogares con privación convergente según el IPMH (Censo 2022) |
| `sin_cobertura_salud_pct` | decimal | Porcentaje de personas sin cobertura de salud por obra social, prepaga o plan estatal (Censo 2022) |
| `hacinamiento_pct` | decimal | Porcentaje de hogares con 2 o más personas por cuarto (Censo 2022) |
| `cloaca_pct` | decimal | Porcentaje de hogares con desagüe a red cloacal (Censo 2022) |
| `inquilinos_pct` | decimal | Porcentaje de hogares inquilinos (Censo 2022) |

## gba_fracciones

**Fracciones censales del GBA y CABA.** El mismo modelo de la tabla gba_partidos_comunas aplicado a cada fracción censal (unidades de unos 3 mil a 20 mil habitantes). Capa exploratoria, sin intervalos de confianza. Período de referencia: primer semestre de 2026. Población de referencia: la del Censo 2022.

Archivo: `data/gba_fracciones.parquet` (1373 filas).

| Columna | Tipo | Qué contiene |
|---|---|---|
| `periodo` | texto | Semestre de referencia de la estimación (1S 2026) |
| `fraccion` | texto | Código de la fracción censal (7 dígitos: provincia, departamento y fracción) |
| `unidad` | texto | Partido del GBA o comuna de CABA que la contiene |
| `jurisdiccion` | texto | CABA o GBA |
| `zona` | texto | Zona de la unidad que la contiene |
| `poblacion_censo_2022` | entero | Personas según el Censo 2022 |
| `pobreza_personas_pct` | decimal | Porcentaje estimado de personas pobres |
| `indigencia_personas_pct` | decimal | Porcentaje estimado de personas indigentes |
| `sin_cobertura_salud_pct` | decimal | Porcentaje de personas sin cobertura de salud (Censo 2022) |
| `nbi_hogares_pct` | decimal | Porcentaje de hogares con necesidades básicas insatisfechas (Censo 2022) |
