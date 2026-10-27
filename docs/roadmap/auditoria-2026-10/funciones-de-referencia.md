# Funciones de los mejores sitios de datos públicos que Datina no tiene

Informe del investigador de referencias de la auditoría del 26 de octubre de 2026 (ver `docs/roadmap/PLAN_MEJORA.md`, sección 11).

Columna "Verif.": **A**, se abrió la página y se confirmó. **B**, se confirmó por búsqueda sin abrir la página. **C**, no se pudo abrir.

Qué ya tiene Datina y no se propone de nuevo: la dirección guarda la provincia (`prov`), "Tu índice" (`ix`) y el Diagnóstico (`dx`, `dp`), pero no la vista de cada ficha. Ya existe "Si tu provincia fuera un país". No hay "Cómo citar", RSS, estilos de impresión ni insertables. `sitio/_headers` no trae `X-Frame-Options` ni `frame-ancestors`.

## 1. Exploración y gráficos

| Función | Quién la usa | Cómo sería en Datina | Esfuerzo | Verif. |
|---|---|---|---|---|
| Pestañas Gráfico, Mapa y Tabla, con línea de tiempo | Our World in Data, rediseño del 18/10/2023 ([post](https://ourworldindata.org/redesigning-our-interactive-data-visualizations)) | Un deslizador de años en los mapas por provincia ("Mortalidad infantil, 2005 a 2023") | Medio | A |
| Dirección permanente con la vista elegida | Our World in Data guarda `tab`, `country` y `time` ([API](https://docs.owid.io/projects/etl/api/chart-api/)) | `trabajo.html?f=desempleo&vista=serie&anio=2024#f-desempleo`, con el `history.replaceState` que ya usan `ix` y `dx` | Bajo | A |
| Agregar una comparación | DataMéxico, "Agregar Comparación" ([perfil de Jalisco](https://www.economia.gob.mx/datamexico/es/profile/geo/jalisco-jc)) | Mendoza al lado de San Juan en `provincia.html` | Medio | A |
| Perfiles similares | DataMéxico, el mismo perfil | "Provincias parecidas a Chaco" con valores, calculado en 02 | Bajo | A |
| "Tu país" resaltado en todos los gráficos | Atlas de los ODS del Banco Mundial ([Atlas](https://datatopics.worldbank.org/sdgatlas/)) | La provincia elegida resaltada en todas las secciones (`resaltar()` ya existe) | Bajo | A |
| Ranking a lo largo del tiempo | FT Visual Vocabulary, familia "Ranking" ([repositorio](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary)) | Gráfico de pendiente con el puesto de 2014 y el de 2024 | Medio | A |
| Tablas a medida | Statistics Canada ([tabla 17-10-0009-01](https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1710000901)) | Filtrar por provincia y período antes de bajar el CSV del Catálogo | Bajo a medio | A |
| Burbujas animadas con "reproducir" | Gapminder Tools ([herramienta](https://www.gapminder.org/tools/)) | Reproducir los años en Cruces | Medio | C |

## 2. Seguimiento

| Función | Quién la usa | Cómo sería en Datina | Esfuerzo | Verif. |
|---|---|---|---|---|
| Calendario de publicaciones | ONS, con "Add to calendar" y RSS ([calendario](https://www.ons.gov.uk/releasecalendar)) | "Próximos datos" con un .ics que arma 03 desde una tabla en `datos/manual/` | Bajo a medio | A |
| RSS | ONS | Un `feed.xml` que escribe 03 con cada ficha cuyo período cambió | Bajo | A |
| Alertas por correo | ONS, Our World in Data ([suscripción](https://ourworldindata.org/subscribe)), Argendata | Necesita un servicio externo y prender los formularios: decisión del autor | Alto | A y B |
| "Qué cambió este mes" | Ningún sitio lo tiene como página propia | `novedades.html` comparando el resumen con el de la corrida anterior | Bajo a medio | Sin ejemplo |
| Historial de versiones de un dato | ALFRED de la Fed de St. Louis ([ALFRED](https://alfred.stlouisfed.org/)), insertables archivados de Our World in Data ([anuncio](https://ourworldindata.org/new-feature-embed-archived-charts)) | Fotos mensuales comprimidas, o enlaces a los commits | Medio | A |
| Cómo citar | Our World in Data ([gráfico](https://ourworldindata.org/grapher/life-expectancy)), Statistics Canada con DOI | Al pie de cada ficha, con la dirección permanente | Bajo | A |

## 3. Personalización y calculadoras

| Función | Quién la usa | Cómo sería en Datina | Esfuerzo | Verif. |
|---|---|---|---|---|
| Tu inflación personal | ONS ([calculadora](https://www.ons.gov.uk/economy/inflationandpriceindices/articles/howisinflationaffectingyourhouseholdcosts/latest)), Destatis ([calculadora](https://service.destatis.de/inflationsrechner/)) | Región del IPC y reparto del gasto entre las divisiones. Antes, verificar las ponderaciones del INDEC ([IPC](https://www.indec.gob.ar/Nivel4/Tema/3/5/31)) | Medio | A (ONS, Destatis), B (INDEC) |
| Actualizar un monto por la inflación | INE ([calculadora](https://www.ine.es/calcula/)), CBS ([calculadora](https://www.cbs.nl/nl-nl/onze-diensten/leren-met-het-cbs/gereedschappen/prijzen-toen-en-nu)). Chequeado ya tiene la nacional ([calculadora](https://chequeado.com/inflacionacumulada/)) | Por región, para no repetir a Chequeado | Bajo | A y B |
| ¿En qué decil estás? | ONS ([calculadora](https://www.ons.gov.uk/visualisations/dvc1802/calculator/index.html)), IFS ([herramienta](https://ifs.org.uk/tools_and_resources/where_do_you_fit_in)) | Ingreso del hogar contra la EPH por aglomerado | Medio a alto | B |
| Precios de productos | ONS ([herramienta](https://www.ons.gov.uk/economy/inflationandpriceindices/articles/shoppingpricescomparisontool/2023-05-03)) | Precios promedio que publica el INDEC por región (sin verificar la tabla) | Medio | A (ONS) |

## 4. Formatos editoriales

| Función | Quién la usa | Cómo sería en Datina | Esfuerzo | Verif. |
|---|---|---|---|---|
| Datos breves | Our World in Data Data Insights, desde el 6/3/2024 ([anuncio](https://ourworldindata.org/launching-data-insights)) | Un gráfico y 120 palabras armadas desde el resumen | Bajo | A |
| Informe anual | USAFacts Government 10-K ([10-K](https://usafacts.org/government-10-k/)), State of the Union ([informe](https://usafacts.org/state-of-the-union/)), INE España en cifras | "Las 24 Argentinas en cifras 2026", imprimible | Medio | A y B |
| Cómo cambió tu área entre censos | ONS ([herramienta](https://www.ons.gov.uk/visualisations/censusareachanges/)) | "Cómo cambió Jujuy entre 2010 y 2022", por provincia y departamento | Medio | A |
| Perfil con texto generado | DataMéxico, USAFacts ([página](https://usafacts.org/data/topics/people-society/population-and-demographics/our-changing-population)) | Llevar los textos que ya genera Datina a los departamentos | Medio | A |
| Relato con desplazamiento | Flourish ([sitio](https://flourish.studio/)), The Pudding ([portada](https://pudding.cool/)) | Uno o dos artículos insignia, por ejemplo la coparticipación | Medio a alto | A y B |
| Juego diario | The Pudding ([autor](https://pudding.cool/author/russell-goldenberg)) | "¿Qué provincia es?" con tres pistas. Nunca suicidio ni muertes violentas | Medio | B |
| Quiz de estimación | Gapminder Upgrader ([Upgrader](https://www.gapminder.org/upgrader/)) | "¿Cuánto creés que es la desocupación de Córdoba?" | Bajo a medio | B |
| Dibujalo vos | NYT The Upshot ([nota](https://www.nytimes.com/interactive/2015/05/28/upshot/you-draw-it-how-family-income-affects-childrens-college-chances.html)) | Dibujar la pobreza de 2016 a 2025 y ver la real encima | Medio | C |

## 5. Distribución, API e insertables

| Función | Quién la usa | Cómo sería en Datina | Esfuerzo | Verif. |
|---|---|---|---|---|
| API de gráficos (CSV y metadatos) | Our World in Data ([documentación](https://docs.owid.io/projects/etl/api/chart-api/)) | Un `.metadata.json` por tabla y una página "Usar los datos" | Bajo | A |
| Insertables | Our World in Data ([guía](https://ourworldindata.org/how-to-embed)), ONS | `insertar.html?f=...` con "Copiar código" | Bajo a medio | A |
| Vista previa fiel al compartir | Our World in Data | Imagen de Open Graph por ficha, armada por 03 con Chrome | Medio | A |
| PDF o ficha imprimible | DataMéxico, USAFacts 10-K | `@media print` para el perfil provincial, después un PDF por provincia | Bajo con CSS, alto con PDF | A |

## 6. Accesibilidad

| Función | Quién la usa | Cómo sería en Datina | Esfuerzo | Verif. |
|---|---|---|---|---|
| Recorrer los puntos con las flechas | Datawrapper ([blog](https://www.datawrapper.de/blog/keyboard-navigation-dynamic-font-scaling)) | Flechas sobre las barras de las 24 provincias, con el valor anunciado | Medio | B |
| Descripción automática | Datawrapper ([guía](https://academy.datawrapper.de/article/206-how-we-make-sure-our-charts-maps-and-tables-are-accessible)) | Sumar la conclusión de `LEAD` al nombre que ya da `nombreGrafico()` | Bajo | B |
| Sonificación | Highcharts, Comisión Europea | Poco valor para este público | Alto | B |

## Lo que no hay que duplicar

- **Argendata** ([portada](https://argendata.fund.ar/)): páginas temáticas nacionales con preguntas guía, boletín y licencia CC BY-NC-ND 4.0. Lo que diferencia a Datina es lo subnacional y el cruce entre fuentes.
- **Chequeado** ([portada](https://chequeado.com/)): verificación de frases, calculadora de inflación nacional y de alquileres. Datina no califica frases de políticos, y su calculadora tiene que ser regional.

## Las 15 que más valor agregarían, por valor sobre esfuerzo

1. Dirección permanente con la vista de cada ficha (bajo).
2. Cómo citar al pie de cada ficha (bajo).
3. Metadatos por tabla y página "Usar los datos" (bajo).
4. Provincias parecidas en el perfil (bajo).
5. Perfil provincial imprimible (bajo).
6. Datos breves (bajo).
7. RSS y "Qué cambió este mes" (bajo a medio).
8. Calendario de próximos datos con .ics (bajo a medio).
9. Actualizar un monto por inflación, por región (bajo).
10. Tu inflación personal por región y división (medio).
11. Cómo cambió tu provincia o departamento entre los censos 2010 y 2022 (medio).
12. Comparar dos provincias lado a lado en `provincia.html` (medio).
13. Línea de tiempo en los mapas de las fichas (medio).
14. Quiz "¿Cuánto creés que es?", sin suicidio ni muertes violentas (bajo a medio).
15. Insertables de una ficha (bajo a medio).

Siguen: ranking a lo largo del tiempo, "¿En qué decil estás?", recorrer los gráficos con las flechas, "Dibujalo vos" y el juego diario.

## No se pudo verificar

NYT "You Draw It" y FiveThirtyEight (no abre nytimes.com), Gapminder Tools (página vacía), el explorador de Our World in Data y Census maps de la ONS (no se dibujaron los controles), los perfiles por estado de USAFacts (404), World Bank Data360 (redirige a Open Data), DataChile (certificado vencido), Visual Capitalist y Observable (403 y 429), "Tu ciudad en datos" del INE (no se encontró) y las ponderaciones del IPC por región del INDEC (no se abrió la metodología).
