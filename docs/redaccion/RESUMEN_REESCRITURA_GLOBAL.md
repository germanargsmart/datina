# Reescritura editorial global de Datina: resumen

26 de octubre de 2026, sobre `main` en el commit ec326a6. Encargo: `CLAUDE_CODE_REESCRITURA_GLOBAL_DATINA_CON_EJEMPLOS.md`. Diagnóstico de partida: la auditoría del mismo día (`docs/roadmap/PLAN_MEJORA.md` y `docs/roadmap/auditoria-2026-10/`). Los cambios están en el árbol de trabajo, sin commit, sin push y sin publicar.

## En pocas palabras

- **1.138 cambios de redacción** en 20 archivos fuente, en todas las páginas del sitio: 55 páginas armadas más el perfil de las 24 jurisdicciones.
- **Ningún dato cambió.** El resumen de los datos (`sitio/datos/fichas.json`) solo cambió en 20 textos: nombres de leyes, de dos indicadores de Cruces y de un organismo, y cuatro aclaraciones. La tabla larga y las demás tablas quedaron iguales, salvo el nombre de las leyes en `votaciones_leyes_clave.csv`.
- **Mismas páginas y mismas direcciones**: 55 antes y 55 después (`verificacion/rutas_antes.txt` y `rutas_despues.txt`).
- **Todas las pruebas pasan** (ver "Pruebas").
- **Inventario completo**: 5.175 piezas de texto, cada una con su original, su texto nuevo, su estado, su motivo y dónde se comprobó (`INVENTARIO_COPY_GLOBAL.md` y `inventario/`).
- **198 cuestiones pendientes**, todas listadas con su ruta, su archivo y una propuesta (`PENDIENTES.md`). Casi todas son correcciones de datos, cambios de estructura o decisiones del autor, que el encargo deja afuera.

## Cómo se hizo

1. Se armó el sitio sin descargar nada y se guardó el texto que ve el lector en cada página, con cada vista de cada ficha y el perfil de las 24 jurisdicciones (`scripts/volcar_textos.mjs`, 79 páginas). Ese fue el "antes".
2. Nueve revisores, uno por grupo de páginas, leyeron el encargo, `CLAUDE.md`, los criterios comunes (`CRITERIOS_REDACCION.md`) y la auditoría de su grupo. Revisaron cada texto de su grupo en la plantilla, en el código que arma los textos, en el constructor y en `datos/manual/`, y entregaron sus propuestas en `docs/redaccion/propuestas/` con el motivo de cada cambio. No tocaron el repositorio.
3. La sesión principal revisó las propuestas, corrigió las que se leían mal o chocaban entre grupos, las aplicó como reemplazos exactos sobre las fuentes (`propuestas/principal.json` registra sus propios cambios) y armó el sitio después de cada tanda.
4. Tres grupos cambiaron textos que pasan por el procesamiento de datos (los nombres de las leyes, dos indicadores de Cruces y las aclaraciones de `distorsiones.json`). Se corrió `02_procesar.py` sin descargar nada, con la fecha de la última actualización (24 de octubre de 2026), para que la única diferencia fueran esos textos. Se comprobó campo por campo que ningún número cambió.
5. El consultor de pobreza se rearmó (`npm run build`), pasó su prueba y se copió al sitio (`--con-pobreza`).
6. Se volvió a volcar el texto de todas las páginas ("después") y `scripts/inventario_textos.py` armó el inventario: compara cada pieza del commit de partida con la de ahora y busca el texto nuevo en las páginas armadas.

## Páginas y rutas revisadas

| Tipo | Rutas | Grupo |
|---|---|---|
| Portada | `index.html` | G6b |
| Secciones temáticas | `poblacion`, `migraciones`, `salud`, `educacion`, `pobreza`, `trabajo`, `economia`, `empresas` (y su redirección `emprendedores`), `construccion`, `gobierno`, `externo`, `turismo`, `politica`, `seguridad`, `energia`, `petroleo`, `movilidad`, `naturaleza`, `curiosidades` | G1, G2, G3, G4 |
| Historias con datos | `articulos.html` y los 18 `a-*.html`, `laboratorio.html`, `corte-suprema.html` | G5, G3 |
| Perfil provincial | `provincia.html` con las 24 jurisdicciones (`?prov=02` a `?prov=94`), su historia y sus 12 temas | G6a, G7 |
| Herramientas | `cruces`, `indice`, `departamentos`, `diagnostico`, `catalogo`, `relaciones`, `consulta-ia` | G6a, G1, G6c |
| Consultor de pobreza | `pobreza/index.html`, `pobreza/diccionario.html` | G6c |
| Páginas auxiliares | `nosotros`, `contacto`, `404` | G6b |
| Comunes a todas | barra, menús, migas, pie, "Seguí explorando", títulos de pestaña, descripciones y Open Graph, pie de cada ficha, "Sobre los datos", la lupa y su respuesta rápida, vistas OCDE, mensajes de carga y de error | G6b |
| Presentación del proyecto | `README.md` | G6c |

La cobertura por ruta, con la cantidad de textos reescritos, revisados, conservados y pendientes en cada una, está en `INVENTARIO_COPY_GLOBAL.md`.

## Archivos fuente modificados

| Archivo | Cambios | Qué se reescribió |
|---|---|---|
| `scripts/plantilla.html` | 267 | Preguntas de página y de ficha, bajadas, intros, notas, pies, botones, opciones, aria-label, Nosotros, 404, Laboratorio, Corte |
| `scripts/datina.js` | 570 | Textos que arman las fichas (`LEAD`, `TX`), cifras destacadas (`CLAVE`, `EXTRA`), "En cifras", rótulos y cuadros de los gráficos, perfil provincial, artículos (`textoArt`, `ART_SERIE`), respuestas del buscador (`PREG`), vistas OCDE, mensajes |
| `scripts/03_construir_sitio.py` | 23 | Descripciones de pestaña y para compartir, preguntas de los destacados de la portada, "Tus datos" de Nosotros, rótulos de la historia provincial, tarjetas de las herramientas |
| `scripts/02_procesar.py` | 3 | Nombres de tres indicadores de Cruces y del organismo de Educación |
| `scripts/catalogo.py`, `scripts/relaciones.py`, `scripts/relaciones.html`, `scripts/relaciones.js` | 21 | Catálogo de datos y Explorador de relaciones (los nombres de organismos con paréntesis dobles, R11 del plan) |
| `datos/manual/explicadores.json` | 45 | "Para entender los datos" y glosario |
| `datos/manual/provincias_historia.json` | 111 | La historia de las 24 jurisdicciones |
| `datos/manual/leyes_clave.csv` | 9 | Nombres y descripciones de las leyes y proyectos que sigue el sitio |
| `datos/manual/relaciones.json`, `distorsiones.json`, `programas_educacion.json` | 15 | Nombres de organismos, aclaraciones y programas |
| `pobreza/src/index.md`, `diccionario.md`, `observablehq.config.js`, `scripts/exportar_parquet.py`, `README.md` | 71 | El consultor de pobreza |
| `README.md` | 3 | La presentación de Datina |

Además se sumaron dos programas: `scripts/volcar_textos.mjs` (el texto que ve el lector, y la comparación de dos volcados) y `scripts/inventario_textos.py` (el inventario). Los dos son la prueba T8 que pedía el plan.

### Cambios de código que solo cambian lo que se lee

Ninguno cambia un dato, un cálculo ni una vista. Se listan porque no son reemplazos de texto puro:

- `03_construir_sitio.py`: Nosotros saca el párrafo de los formularios cuando están apagados (antes describía formularios que no existen) y suma adónde va la pregunta de las consultas con IA según el motor, con lo que dice `docs/ia/CONSULTAS.md`. Los cuatro datos destacados de la portada tienen su propia pregunta, que habla del país como su cifra. La descripción de cada pestaña cambia según sea un tema, una herramienta o Artículos.
- `datina.js`: una sola frase para el puesto de una provincia (`puestoTxt`: "La 3.ª cifra más baja de las 24 jurisdicciones"), en el perfil, en "En cifras" y en el mapa de la portada. Algunas frases eligen entre dos formas según un valor que ya estaba calculado (más o menos que autos, "con dato" cuando faltan jurisdicciones).
- `catalogo.py` y `relaciones.js`: la sigla de un organismo se muestra solo si no está ya en su nombre.
- `pobreza/src/index.md`: los semestres en palabras ("primer semestre de 2026") y la tabla con nombres de columna legibles en lugar de los internos.

## Criterios aplicados

Están completos en `CRITERIOS_REDACCION.md`. Los que más cambios produjeron:

- **Preguntas que dicen lo que se mide.** Visitas y no personas, porcentajes y no cantidades, "del exterior" para los no residentes, "registrados" donde solo hay empleo registrado, "pensión por invalidez" y no "por discapacidad". Las herramientas, la Corte y el Laboratorio pasaron a tener preguntas.
- **Bajadas con unidad y período**, sin enumerar las vistas de la ficha.
- **La cifra destacada, el texto y el gráfico, alineados**: cuando usan medidas o períodos distintos, el texto lo dice (mortalidad infantil 2023 y 2024, envejecimiento 2026 y 2040, esperanza de vida total y por sexo, homicidios 2025 y promedio 2023 a 2025, canastas por hogar y por adulto, fallos y casos de la Corte, fiscalías y cargos).
- **Advertencias a la vista**: lo que cambiaba la lectura y estaba solo en "Sobre los datos" pasó al texto (CAMMESA junta CABA y Buenos Aires, el SIPA cuenta donde declara la empresa, La Pampa con datos de 2024, la suma de provincias del OEDE, el alcance de la SUBE, las comisarías que no cuenta el SNEEP).
- **Términos fijos**: CABA, "las 24 jurisdicciones", "descontada la inflación", "seguro de desempleo", "segunda vuelta", "transferencias no automáticas", "leyes y proyectos clave".
- **Neutralidad**: nombres de leyes descriptivos ("Reasignación de partidas por el jefe de Gabinete", "Reforma laboral", "Pago a los bonistas fuera de los canjes (holdouts)", "Aporte extraordinario sobre los grandes patrimonios") y "Qué no dice este dato" donde se cruzan votos y fondos.
- **Correlación no es causa**: los artículos dejan de abrir con "Spearman" y su escala, la bajada dice la relación en los dos sentidos, los límites propios de cada artículo van antes que los generales y se sumaron límites que faltaban (el tamaño de las provincias en los ATN, solo bienes en las exportaciones, las causas de la mortalidad infantil).
- **Siglas explicadas la primera vez** (SIPA, OEDE, SNIC, RENAPER, CAMMESA, PAN) y **una idea por oración**, sobre todo en las intros, las notas y la historia de las provincias.

## Lo que se conservó a propósito

En el inventario figuran como "conservado deliberadamente", con su motivo:

- Las citas textuales de las fuentes (`cita` de `explicadores.json`) y los títulos de los documentos citados en la historia de las provincias.
- Los nombres oficiales de organismos, leyes, programas, aglomerados del INDEC ("Ciudad de Buenos Aires", "Partidos del GBA") y categorías de las fuentes.
- Las instrucciones al modelo de las consultas con IA (`functions/_ia/indicaciones.mjs`): son configuración y cambian lo que contesta el sitio.
- Los literales que buscan las pruebas ("Ver tabla", "Cómo se calcula", "Para entender los datos", "Artículos con este dato", "Menú", "País:", los botones "Ficha: …").
- Los nombres de las secciones y los menús (los controla la prueba de navegación y son estructura).
- Los títulos descriptivos de las fichas de suicidio y de muertes violentas, las líneas de ayuda y la aclaración del SNIC y la DEIS.
- Los nombres de personas, partidos, bloques, áreas petroleras y empresas, como vienen de cada fuente.
- Las etiquetas de los datos que se descargan (unidades y fuentes de `tabla_larga.csv`): normalizarlas es reprocesar los datos (R14 del plan).

## Lo que no se pudo resolver sin validar un hecho

Quedan como "pendiente de verificación factual" en el inventario y en `PENDIENTES.md`:

- **Historia de las provincias**: los textos se armaron con los extractos del buscador y el propio archivo pide abrir cada fuente antes de publicar. En Santiago del Estero no está claro a quién se refiere "en su mayoría bilingües". En Tucumán, si la provincia de 1814 incluía a Santiago del Estero y Catamarca. Hay liderazgos de hoy sin año (avícola en Entre Ríos, algodón en Santiago del Estero, azúcar y limón en Tucumán), fuentes no oficiales (dos notas de Los Andes y una página de Wikipedia en inglés) y ocho fuentes con dirección http que la lista omite.
- **Nombres de organismos**: hay tres nombres para el organismo de turismo y ninguno está documentado como el vigente. La Coordinación de costos educativos aparece con dos nombres. PISA, "de Alumnos" o "de Estudiantes".
- **Datos que podrían estar desactualizados o tener un cambio de método**: el escrutinio definitivo de 2023 (el sitio usa el provisorio), la caída de los robos de 2025 en las 24 jurisdicciones (verificar si el SNIC cambió la carga), la designación de García-Mansilla en la Corte, la exención del impuesto a los combustibles en la zona sur, si el 4,0% de potencia nuclear incluye Atucha I.

## Pendientes

`PENDIENTES.md` lista los 198, por grupo, con la ruta, el archivo, el fragmento, el motivo y la propuesta. Por tipo:

- **Errores de datos** (no se tocaron): los 11 diputados del PRO con el bloque "Partido Bloquista de San Juan" (E1), el total de empresas que suma provincias (E2), las motos de Tierra del Fuego en el total del país (E3), los pozos de archivos de fechas distintas (E13), el "País: 40,3%" de los recursos propios, que es la mediana de las provincias.
- **Cifras destacadas que miden otra cosa que su gráfico** (elegir otra cifra es cálculo): f-bcra, f-supermercados, f-recaudacion, f-eti, f-fracturas, f-corte-casos, f-fiscalias-federales, x-pet-shale. El texto ya nombra la diferencia.
- **Cálculo**: la escala única de "fuerte, moderada, débil" y los umbrales de las respuestas de los artículos (E4 y E5), las mitades por mediana y los casos que se apartan por su orden.
- **Estructura y navegación**: unir fichas casi iguales, mover fichas de página, la página de Justicia, el índice de capítulos, el orden del perfil provincial, el menú de Herramientas, "Naturaleza y ambiente", el título de la pestaña del perfil al elegir una provincia.
- **Diseño**: las flechas decorativas de "Seguí explorando", sacar los botones OCDE que no responden la pregunta de su ficha, las barras sin unidad.
- **Contenido nuevo**: las fichas de desocupación, informalidad y coparticipación, "Para entender los datos" de Sector externo, "Quién lo hace" y "Cómo citar" en Nosotros.

## Decisiones para el autor, en una tanda

La opción recomendada va primero.

1. **Suicidio por provincia** (barras de mayor a menor que nombran la más alta y la más baja, en tensión con "sin rankings", y la razón suicidios por homicidio en f-muertes): orden alfabético sin superlativos y sin la razón · mapa · como está.
2. **Artículos del voto a Milei y del hacinamiento**: reemplazar el de Milei por "¿Qué candidato ganó en cada provincia desde 1983?" y retirar el de hacinamiento · rehacerlos con otros datos · como están.
3. **Contacto**: un correo del proyecto · los "issues" del repositorio · sacar la página del pie.
4. **Ejemplo en el campo de Consultas con IA**: uno solo, en ese campo · sin ejemplo.
5. **Organismo de turismo**: confirmar el nombre vigente para unificarlo en los pies.
6. **Un PR de datos** con los errores E1, E2, E3 y E13 y el rótulo de la mediana fiscal, cada uno con su prueba, como propone la etapa 1 del plan.

## Pruebas

| Prueba | Resultado |
|---|---|
| `python scripts/03_construir_sitio.py` (corre `pruebas_datos.py`, relaciones y su validador, catálogo, consultor, metadatos, encabezados y navegación) | Arma 26 páginas de sección y 18 artículos. 0 hallazgos de datos sin explicar (121 explicados). 46 fuentes, 167 conjuntos y 291 relaciones con evidencia. 209 tablas, todas con su uso. 53 páginas con la misma barra, menús y pie. Encabezados en orden |
| Sintaxis de `sitio/datina.js` | Bien |
| `node scripts/prueba_paginas.mjs` | "Todo en orden": 52 páginas, 148 fichas, "En cifras" en 19 secciones sin provincia y con dos, 29 enlaces de ida y vuelta entre artículos y fichas, la lupa y su respuesta rápida, accesibilidad y pulido |
| `node scripts/prueba_320.mjs` | Ninguna página se corre de costado: 54 páginas en 320, 360 y 390 píxeles |
| `node scripts/prueba_fallas.mjs` | Todo bien (cargas cortadas a propósito) |
| `node scripts/prueba_consulta_ia.mjs` y `prueba_consulta_ia_pagina.mjs` | 101 y 19 controles bien |
| `python scripts/prueba_relaciones.py` | 18 casos rotos detectados y el catálogo real sin errores |
| Consultor de pobreza: `npm run build` y `node scripts/prueba_guiada.mjs` | Arma las dos páginas. 6.864 combinaciones de filtros: JavaScript y DuckDB dan lo mismo |
| `02_procesar.py` (con la fecha del 24 de octubre de 2026) | Solo cambian 20 textos del resumen y los nombres de las leyes de una tabla. Ningún número |
| Revisión en el navegador, 1440 y 390 píxeles | Portada, Salud, Seguridad, el perfil de Neuquén, un artículo: los textos nuevos entran sin cortes. Los botones OCDE más largos pasan a dos renglones en el celular |

## Control de cobertura

- **Rutas**: las mismas 55 páginas antes y después. El volcado recorrió 79 vistas: las 55 páginas y el perfil de cada una de las 24 jurisdicciones, con cada botón de vista y hasta 12 opciones de cada selector, y el texto plegado de "Para entender los datos" y "Sobre los datos".
- **Fuentes**: el inventario lee 28 archivos, todos los que producen texto publicado (la plantilla, `datina.js`, el constructor, el catálogo, el Explorador, las consultas con IA, el consultor de pobreza, los JSON y CSV de `datos/manual/` con texto, los nombres de Cruces de `02_procesar.py` y el README). De los 20 archivos modificados, 19 están entre ellos. El que falta es `pobreza/README.md`, documentación técnica (una línea, ver "Lo que no se hizo").
- **Piezas**: 5.175. 849 reescritas, 2.872 revisadas sin cambios, 1.442 conservadas a propósito con su motivo y 12 pendientes de verificar un hecho. Ninguna quedó sin estado.
- **Las 849 reescritas, comprobadas**:
  - 769 aparecen en la página armada (vista inicial, otra vista de su ficha o texto plegado).
  - 14 se comprobaron al evaluar en la página, con los datos reales, los textos que arma `datina.js` (752 textos evaluados: cifras destacadas, cada vista, series de "En cifras", respuestas del buscador y notas OCDE, ninguno con un valor vacío: `verificacion/textos_evaluados.json`).
  - 3 se comprobaron a mano en el navegador (la consulta guiada del consultor de pobreza).
  - 3 son del README, que no se publica en el sitio.
  - 11 son textos cortos, armados con datos o sin un pedazo fijo que buscar.
  - 49 son condicionales: cuadros que aparecen al pasar el mouse, mensajes de error, estados de las herramientas (Cruces, Tu índice, el Explorador) y la consulta guiada con otras tablas. No salen en el volcado automático. Pasaron la sintaxis y la prueba de páginas, que abre menús, la lupa y "Ver tabla" y controla que ningún texto diga undefined o NaN.
- **Búsqueda del texto viejo**: en 39 piezas reescritas, un pedazo del texto anterior sigue en alguna página. Se revisaron una por una: son frases que otra fuente repite con razón ("víctimas cada 100.000 habitantes por año" en otra ficha, el título de una tabla en el Catálogo o en el Explorador, "Siniestros viales" en el Catálogo, "Las que más se apartan de la tendencia" cuando sí hay tendencia, el botón "Consultar pobreza por aglomerado, partido y comuna" de Pobreza y hogares, que nombra una acción, o el nombre de un ministerio de la Ciudad en una fuente citada). El inventario las marca en su verificación.
- **Texto visible**: 1.695 bloques cambiaron entre el volcado de antes y el de después. Cada cambio, con los renglones que se fueron y los que llegaron, está en `verificacion/cambios_visibles.md`.
- **Lo que no quedó revisado**: nada. Los 198 pendientes de `PENDIENTES.md` son cambios que exceden la redacción (datos, estructura, diseño, cálculo), decisiones del autor o hechos por verificar, y cada uno tiene su ruta, su archivo y una propuesta.

## Lo que no se hizo

- No se hizo commit, push ni deploy, y no se tocó infraestructura.
- No se probaron las consultas con IA con el modelo real. Sus instrucciones no cambiaron, pero el índice de tablas que lee el modelo (`sitio/datos/consulta_ia.json`) sí: lleva las preguntas de las fichas y las descripciones de las secciones, que se reescribieron. Las 101 y 19 pruebas pasan con el modelo simulado. Conviene repetir la prueba con preguntas reales en la vista previa de Cloudflare antes de unir, como se hizo con el PR #11.
- No se corrió `01_descargar.py`.
- No se actualizó `docs/roadmap/ESTADO.md` ni otra documentación de mantenimiento: el encargo lo pide así. La única excepción es una línea de `pobreza/README.md` (paso 2), que buscaba "1S 2026" y ahora el consultor lo escribe en palabras.
- El sitio armado (`sitio/`) cambió porque se volvió a armar: los cambios de `sitio/` son el resultado de los cambios en las fuentes.

## Unión con los arreglos de datos (27 de octubre de 2026)

La reescritura se subió a la rama `redaccion-local` (commit cc7b6bf, sobre ec326a6) y se unió con `main` después del PR #12, que corrigió los errores de datos E1, E2, E3, E13 y el "País" de los recursos propios del perfil. Esos cinco pendientes de `PENDIENTES.md` quedan resueltos, y también la decisión 6 de este resumen ("Un PR de datos"). Siete textos de la reescritura se escribieron antes de esos arreglos y se ajustaron al unir:

| Dónde | Texto de la reescritura | Cómo quedó |
|---|---|---|
| `datina.js`, cifra de "En cifras" de `f-empresas` | "…sumadas las 24 jurisdicciones (… cada 1.000 habitantes). Una empresa con personal en varias provincias cuenta en cada una" | "…había en el país en {año}, cada una contada una sola vez (… cada 1.000 habitantes)". La versión corta, "en todo el país", queda como en `main` |
| `datina.js`, `empresas-nota` | "…por eso la suma de las provincias, que es la cifra destacada, es mayor que la cantidad de empresas que hay en el país" | "…por eso la suma de las provincias es mayor que el total del país, que cuenta a cada empresa una sola vez, en la provincia donde tiene más empleo" |
| `explicadores.json`, Sector privado | "La cifra destacada de la primera ficha es esa suma" | "La cifra destacada de la primera ficha es el total del país, que cuenta a cada empresa una sola vez. Para ese total y para estudiar aperturas y cierres…" |
| `datina.js`, `patentes` | "El total de motos de {año} incluye el dato de Tierra del Fuego…" | "…no incluye el dato de Tierra del Fuego…" |
| `datina.js`, `patentes-prov` | "El promedio del país en motos fue de … con ese dato incluido" | "…también sin ese dato". El resto, como la reescritura |
| `datina.js`, cifra destacada de `f-patentes` | Sin aclarar las motos excluidas | La de `main`: "(sin contar las de Tierra del Fuego)" |
| `datina.js`, `mapa-pozos-nota` y la tarjeta de recursos propios del perfil | "al pasar el mouse o tocar un área" y el nuevo detalle de turistas extranjeros | Los dos textos de la reescritura, más la explicación de E13 (las cantidades del mapa salen del mismo resumen que la ficha de pozos) y el país sumado de `main` |

`02_procesar.py` se corrió sin descargar nada, con la fecha de la última actualización (24 de octubre de 2026). El resumen de datos quedó igual al de `main` salvo los mismos 20 textos que cambió la reescritura, y igual al de la rama salvo los 24 campos que corrigió el PR #12. Ningún otro número cambió.
