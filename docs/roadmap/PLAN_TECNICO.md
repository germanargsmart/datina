# Plan técnico: buscadores, IA y datos abiertos

**Aprobado por el autor el 11 de noviembre de 2026** ("Apruebo el plan"), con las decisiones de abajo, el orden de las fases y la forma de intercalar lo pendiente.

Preparado el 11 de noviembre de 2026 a partir del feedback técnico que recibió el autor, evaluado contra el sitio publicado y el repositorio en `main` (commit aa5a1109). Reúne en un solo orden el trabajo técnico nuevo y todo lo que ya estaba pendiente. Nada de lo que estaba en curso se pausa (decisión del autor del 11 de noviembre de 2026).

## El feedback y qué se decidió

| Punto del feedback | Qué había | Qué se hace |
|---|---|---|
| 1. No invertir en UX/UI por ahora | Trabajo visual en curso (escuelas y hospitales, otros cargos electorales, pendientes de redacción) | No se pausa nada. Lo pendiente entra en este plan, después de las fases técnicas o intercalado donde no choca |
| 2. Pasar a Next.js por SEO | Cada página con título, descripción y canonical propios, Open Graph con imagen, `sitemap.xml` (85 direcciones), `robots.txt` abierto, `Article` en 25 artículos y `Dataset` en la portada. Los rastreadores de IA reciben 200 (probado con su nombre, sin mirar el panel de Cloudflare) | **No se migra.** El problema real es otro (abajo) y se resuelve dentro del armado actual (fase 4). Se vuelve a evaluar solo si la fase 4 no alcanza |
| 3. `llms.txt` y similares | No existe (404) | Fase 1 |
| 4. Carga más dinámica y rendimiento | D2 (4 de noviembre de 2026): tablas a demanda y `datina.js` achicado, 408 KB con brotli en la primera visita. Hoy `sitio/datina.js` pesa 1,25 MB sin comprimir y lo baja entero cada página | Fase 5, con una medición nueva antes de tocar nada |
| 5. MCP de solo lectura, o una API | 269 CSV descargables con dirección fija, 265 metadatos (`*.metadata.json`) y el índice de las consultas con IA | Fases 2 y 3 |

### El problema que Next.js resolvería, sin Next.js

Las cifras y los textos que las interpretan los escribe `datina.js` después de cargar la página. En el HTML publicado:

- los párrafos de interpretación de cada ficha están vacíos (`<p class="lead" data-t="empleo"></p>` en `trabajo.html`),
- el cuerpo de los artículos está vacío (`<article class="nota" ...></article>` en `a-salario-real.html`),
- las 24 páginas fijas de las provincias tienen el mismo texto: cambian el título, la descripción y la imagen, y los datos de la provincia los pone `datina.js`.

Google ejecuta JavaScript, con demora. Los rastreadores de los buscadores de IA en general no: hoy leen las preguntas y las descripciones, pero no las respuestas.

Next.js lo resolvería escribiendo el texto en el HTML al armar, pero obliga a reescribir `datina.js`, la plantilla y `03_construir_sitio.py` y a rehacer las pruebas: semanas de trabajo y riesgo alto de perder datos o diseño. Lo mismo se logra con un paso más al final del armado: abrir cada página en el Chrome sin ventana que ya usan las pruebas (`scripts/cdp.mjs`) y guardar en el HTML el texto que escribió `datina.js`, que al cargar lo vuelve a escribir igual (fase 4).

## Decisiones del autor del 11 de noviembre de 2026

1. **Decimales**: `tabla_larga.csv` se redondea a cuatro decimales, como dice la regla. Hoy 15.751 valores de 101 variables tienen más (por ejemplo, 29.559005574601997). Lo que se muestra no cambia: se redondea al mostrar.
2. **Código "00"**: los 31 aglomerados urbanos de la EPH (40 filas de pobreza e indigencia en `tabla_larga.csv`) pasan a tener un código propio, distinto del total del país. Las dos variables ya llevan `_31_aglomerados` en el nombre, así que el riesgo de mezclarlas es menor de lo que parecía, pero el MCP filtra por código. La regla dice que los códigos son los del INDEC, de dos dígitos, con "00" para el país: el código nuevo se elige para que encaje en esa regla, o la regla se cambia en el mismo commit, y `pruebas_datos.py` tiene que aceptarlo. Revisar que las fichas de pobreza lo lean bien.
3. **CABA**: un solo nombre en `tabla_larga.csv`, "CABA". Hoy 833 filas dicen "Ciudad Autónoma de Buenos Aires" (combustibles, salarios, seguridad y otras). Cambia solo la columna del nombre.
4. **Población de referencia**: cada ficha por habitante usa la proyección del INDEC del mismo año que su dato y lo dice en su nota. Ojo con el alcance: la mayoría de las tablas por habitante usan hoy la proyección 2025, también para datos de 2026 (Trabajo lo dice: "La población es la proyección 2025 del INDEC" para el empleo de junio de 2026), y hospitales y deuda de las provincias usan la de 2026. Con esta decisión cambian sobre todo las de 2025. Primer paso, antes de mover ninguna cifra: una tabla para el autor con cada ficha, el período de su dato, el año de población que usa, si lo declara y qué cifra se mueve. El autor la mira y confirma.

Antes de aplicar las decisiones 1 a 4 se busca su historia (`ACEPTADAS` en `scripts/pruebas_datos.py`, la sección 1 de `PLAN_MEJORA.md` y `docs/historico/etapas-previas.md`). Si aparece una decisión anterior del autor que diga otra cosa, se le vuelve a preguntar antes de cambiar nada.
5. **Suicidio**: las tres variables de suicidio de `tabla_larga.csv` (`victimas_suicidios`, `tasa_suicidios_100mil_5_anios_y_mas`, `bm_suicidio`) quedan fuera del MCP, la API y `llms.txt`. La descarga de la tabla completa queda como está. Tampoco entran las tablas `suicidio_*` ni la de muertes violentas, como en las consultas con IA.
6. **Elecciones por mesa en el MCP y la API**: solo lo oficial (DINE y justicias electorales). Queda afuera lo que viene de 257arg. El consultor de pobreza no entra.
7. **Orden**: el MCP antes que el texto en el HTML, como pidió el autor.
8. **Nada se pausa**: el trabajo visual y editorial pendiente sigue en este plan.

## Regla para todo lo público

`llms.txt`, los datos estructurados, el MCP y la API salen del catálogo (`scripts/catalogo.py`), nunca de "todo lo que hay en `sitio/datos/`". Una tabla nueva entra por el catálogo y hereda de ahí si es sensible, su fuente, su fecha y su licencia.

## Fases técnicas

Una fase por vez, un PR cada una (o más de uno si es grande), commits chicos. Antes de dar una fase por terminada: lo que pide `.claude/rules/pruebas.md` para ese tipo de cambio, abrir las páginas, revisar enlaces y descargas.

### Fase 0. Medición de base (sin cambios visibles)

- Lighthouse en seis páginas (portada, Trabajo, un artículo, una provincia, Elecciones por mesa, Catálogo) en celular y computadora, y `node scripts/medir_carga.mjs`. Lighthouse se instala con npm, fuera del repositorio (189 MB con sus dependencias), con la aprobación del autor.
- Qué ve un rastreador sin JavaScript: el texto de cada página sin ejecutar `datina.js`.
- Los números quedan en este archivo, para comparar después de las fases 4 y 5.
- Esfuerzo bajo, riesgo nulo.

#### Medición de base del 11 de noviembre de 2026 (`main` en 51351183)

**Carga** (`node scripts/medir_carga.mjs`: Chrome sin ventana, procesador 4 veces más lento, sin caché, mediana de 5 cargas. Los tiempos cambian de una computadora a otra y de una corrida a otra: se comparan dos corridas en la misma computadora).

| Archivo | Sin comprimir | gzip | brotli |
|---|---|---|---|
| `datos/fichas.js` | 1.010 KB | 216 KB | 160 KB |
| `datina.js` | 1.247 KB | 359 KB | 275 KB |
| `datina.css` | 213 KB | 51 KB | 42 KB |

| Página | JavaScript | Tareas | Datos que baja |
|---|---|---|---|
| `contacto.html` | 160 ms | 425 ms | 1.010 KB |
| `index.html` | 173 ms | 2.169 ms | 1.118 KB |
| `trabajo.html` | 166 ms | 908 ms | 1.010 KB |
| `politica.html` | 163 ms | 875 ms | 1.010 KB |
| `provincia-neuquen.html` | 202 ms | 1.047 ms | 1.229 KB |
| `a-coparticipacion.html` | 145 ms | 589 ms | 1.010 KB |

**Qué ve un rastreador sin JavaScript** (`node scripts/medir_rastreador.mjs --todas`, nuevo en esta fase: cada página abierta con JavaScript y sin él, contando el contenido sin la barra, los menús ni el pie. Con JavaScript baja por toda la página antes de contar. No cuenta la 404 ni las seis direcciones viejas que llevan a otra página).

| 85 páginas | Sin JavaScript | Con JavaScript |
|---|---|---|
| Palabras | 391.711 (75%) | 520.107 |
| Cifras | 24.328 (55%) | 43.877 |
| Páginas sin título (h1) | 25 | 0 |
| Párrafos de interpretación vacíos | 209 de 212 | 11 de 212 |

La columna que se compara después es la de sin JavaScript: la otra cambia un poco de una corrida a otra (Trabajo dio 123, 142 y 144 cifras). Las 11 interpretaciones vacías aun con JavaScript son de Instituciones políticas (8), Precios y actividad (2) y Sector externo (1), probablemente fichas de capítulos que no están a la vista: se revisa en la fase 4.

El total esconde lo peor, porque el Catálogo y las páginas de provincia ya tienen casi todo su texto en el HTML:

- Los 24 artículos y Corte Suprema: 3 palabras sin JavaScript, ninguna cifra y sin título (de unas 1.100 a 1.400 palabras con JavaScript).
- Las páginas de tema muestran entre 34% y 59% de sus palabras y entre 16% y 42% de sus cifras (Trabajo: 1.475 de 2.958 palabras y 47 de 144 cifras).
- La portada: 307 de 675 palabras y 6 de 65 cifras. Datos destacados: 7 de 412 cifras. Artículos: 12 de 169 cifras. Explorador de relaciones: 13% de las palabras y ninguna cifra.
- Bien: Catálogo (100%), `provincia-neuquen.html` (86%) y Elecciones por mesa (78% de las palabras, 47% de las cifras).

La fase 4 se da por cumplida cuando los artículos y las interpretaciones tienen su texto sin JavaScript. El detalle por página queda en la salida del script.

**Lighthouse 13.6.0** (`scripts/medir_lighthouse.mjs`, nuevo en esta fase: sirve `sitio/` en la computadora con brotli, como Cloudflare, y anota la mediana de 3 corridas. Lighthouse no entra al proyecto: el autor aprobó bajarlo el 11 de noviembre de 2026 y se instala en una carpeta aparte, 189 MB con sus dependencias. Mide en la computadora, sin la demora de la red real: sirve para comparar antes y después, no para compararse con otros sitios. La copia de esta medición estaba en una carpeta temporal: para comparar en las fases 4 y 5 se vuelve a instalar la misma versión, 13.6.0).

Celular (el preajuste de Lighthouse: teléfono de gama media y 4G lenta simulados):

| Página | Rendimiento | Accesibilidad | Prácticas | SEO | Primer texto | Mayor elemento | Bloqueo | Corrimiento |
|---|---|---|---|---|---|---|---|---|
| `index.html` | 56 | 86 | 100 | 100 | 4,4 s | 6,3 s | 546 ms | 0,000 |
| `trabajo.html` | 70 | 96 | 100 | 100 | 4,4 s | 4,4 s | 228 ms | 0,002 |
| `a-coparticipacion.html` | 67 | 96 | 100 | 100 | 4,3 s | 5,5 s | 150 ms | 0,012 |
| `provincia-neuquen.html` | 38 | 97 | 100 | 100 | 4,6 s | 6,0 s | 310 ms | 0,687 |
| `mesas.html` | 65 | 97 | 100 | 100 | 4,3 s | 4,3 s | 415 ms | 0,004 |
| `catalogo.html` | 59 | 97 | 100 | 100 | 4,9 s | 4,9 s | 441 ms | 0,000 |

Computadora:

| Página | Rendimiento | Accesibilidad | Prácticas | SEO | Primer texto | Mayor elemento | Bloqueo | Corrimiento |
|---|---|---|---|---|---|---|---|---|
| `index.html` | 97 | 90 | 100 | 100 | 0,9 s | 1,2 s | 33 ms | 0,010 |
| `trabajo.html` | 99 | 96 | 100 | 100 | 0,8 s | 0,8 s | 6 ms | 0,004 |
| `a-coparticipacion.html` | 98 | 96 | 100 | 100 | 0,8 s | 1,0 s | 4 ms | 0,005 |
| `provincia-neuquen.html` | 76 | 97 | 100 | 100 | 0,9 s | 0,9 s | 25 ms | 0,581 |
| `mesas.html` | 91 | 97 | 100 | 100 | 0,8 s | 0,8 s | 32 ms | 0,174 |
| `catalogo.html` | 98 | 97 | 100 | 100 | 0,9 s | 0,9 s | 56 ms | 0,004 |

Lo que explica los números (de los informes de Lighthouse de la portada y de Neuquén):

- **El primer texto tarda lo mismo en todas las páginas, unos 4,4 s en celular**, porque la página espera a bajar y correr D3 (en el `<head>`, sin `defer`), `fichas.js` y `datina.js` antes de pintar. Es lo primero que mira la fase 5.
- **Elecciones por mesa también se corre un poco en la computadora** (0,174, arriba del 0,1 aceptable, y casi nada en celular).
- **La página de provincia se corre mientras carga** (0,58 a 0,69, lo aceptable es menos de 0,1): `div.prov-cuerpo`, dentro de `section#provincias`, cambia de alto cuando `datina.js` pone los datos. Por eso tiene 38 en celular. Va a la fase 5, o antes si el autor lo pide, porque se nota al leer.
- **Accesibilidad de la portada (86 y 90)**, cuatro fallas:
  - las cifras de los datos destacados (`span.c-num`, `#2c74b5` sobre `#edf2f8`) tienen contraste 4,36 a 1, debajo del 4,5 que pide la regla. Es un cambio de color: lo aprueba el autor. (A)
  - los 24 enlaces del mapa (`tabindex="-1"`) no tienen nombre que lea un lector de pantalla. (C)
  - el cartel del mapa (`#tip`, `role="tooltip"`) no tiene nombre. (C)
  - algunos enlaces de los temas quedan muy juntos para tocarlos con el dedo. (A)
- Prácticas y SEO dan 100 en las seis páginas. El SEO de Lighthouse no ve el problema de la fase 4: solo controla título, descripción, enlaces y que la página se pueda rastrear.

### Fase 1. `llms.txt` y datos estructurados

**Hecha el 11 de noviembre de 2026** (rama `claude/fase1-llms`): `sitio/llms.txt` (unos 127 KB: primero cómo bajar los datos, después cada página con su pregunta, igual que el sitemap, y al final las 261 tablas), un `Dataset` por tabla en la página de su ficha (261: quedan afuera `muertes_violentas` y las tres de COMNAP, cuya licencia no es la de Datina), `lastmod` con la fecha de los datos y los controles en `prueba_metadatos.py`. La regla de lo sensible quedó en una sola función, `tabla_sensible()`, que usan también las Consultas con IA. Las descripciones de muchas páginas son genéricas ("Cada dato con su fuente, su período y su tabla para descargar"): mejorarlas es la cuestión Catálogo 1 de `PENDIENTES.md`.

- `sitio/llms.txt`, armado por 03 desde `GRUPOS`, `MENUS` y el catálogo: qué es Datina, las secciones con su pregunta, cómo descargar los datos, la licencia (CC BY 4.0) y, cuando exista, cómo conectar el MCP.
- `Dataset` de schema.org para cada tabla del catálogo (en `catalogo.html` o en la página de su ficha), con su `DataDownload`, fuente, período, cobertura y licencia, para Google Dataset Search.
- `lastmod` en `sitemap.xml`, con la fecha de la última actualización de los datos (no la del día del armado, para que armar otro día dé los mismos archivos).
- Controles nuevos en `scripts/prueba_metadatos.py`.
- Esfuerzo bajo, riesgo bajo. No cambia nada visible.

### Fase 2. Capa de datos única

- Las decisiones 1 a 4 de arriba, cada una en su commit, con su prueba en `pruebas_datos.py` y el resumen comparado antes y después.
- Un solo archivo publicado, `sitio/datos/catalogo.json`, armado por `catalogo.py`: por tabla, el nombre, la pregunta de su ficha, qué mide, la fuente, la **fecha real de descarga** (de `datos/crudo/_registro.csv`, para las tablas de una descarga, o la fecha de `datos/manual/` para las armadas a mano), la frecuencia, la cobertura, el período, las columnas, la licencia, la ficha y si es sensible. De ahí salen `llms.txt`, los `Dataset`, el MCP y la API.
- Una prueba nueva que compare `tabla_larga.csv` con los CSV de cada ficha donde miden lo mismo. El 11 de noviembre de 2026 solo se comparó a mano el empleo privado registrado (las 24 provincias, igual) y la población de 13 tablas con la proyección del INDEC.
- Corregir `docs/ia/CONSULTAS.md`, que habla de 208 tablas en el índice (hoy el catálogo tiene 265).
- Esfuerzo medio, riesgo medio (toca datos: correr con `scripts/correr_02_con_fecha.py`).

### Fase 3. MCP de solo lectura y API

- Una función de Cloudflare Pages, como `/api/consulta`, que habla MCP por HTTP (sin estado) y lee los archivos ya publicados: sin base de datos, sin clave, sin escribir nada.
- Herramientas: buscar tablas, describir una tabla, leer una tabla filtrada por jurisdicción y período, y leer un indicador de `tabla_larga.csv`. Cada respuesta lleva la fuente, la fecha, la licencia y el enlace a la ficha.
- La API, con el mismo código: direcciones `GET` que devuelven lo mismo en JSON.
- Lo sensible se filtra por fila, no solo por tabla: las tres variables de suicidio no salen nunca de `tabla_larga.csv`.
- Elecciones por mesa (`sitio/datos/mesas/`) no está hoy en el catálogo. Requisito previo: una marca de origen por elección (oficial o 257arg) y su entrada en el catálogo. El MCP ofrece solo las oficiales.
- Prueba sin red, como `prueba_consulta_ia.mjs`, que controla también que lo sensible y lo que no es oficial no salgan.
- Una página corta en "Usar los datos" que explique cómo conectarlo.
- **Armado el 14 de noviembre de 2026** (`docs/ia/MCP.md`): `/api/mcp` y `/api/datos/...`, cinco herramientas, 71 controles en `scripts/prueba_datos_api.mjs` y la sección en "Usar los datos". Sin Elecciones por mesa, que necesita antes la marca de origen de cada elección. **Sumada el 15 de noviembre de 2026**: los resultados oficiales por jurisdicción, en cinco tablas del Catálogo (`scripts/elecciones_oficiales.py`, `docs/ia/MCP.md`).
- **Antes de publicar, el autor**: aprueba la dirección pública nueva y revisa en el panel de Cloudflare el plan de la cuenta (el MCP comparte con `/api/consulta` el límite de pedidos de las funciones) y que no esté prendido el bloqueo de bots de IA.
- Esfuerzo medio, riesgo bajo en el código. Es una dirección pública nueva.

### Fase 4. El texto en el HTML (en lugar de Next.js)

- Primero, la prueba de que el paso nuevo da siempre los mismos archivos, en Windows y en Linux (`pruebas.yml` controla que `sitio/` sea el que arman las fuentes). Si no se logra, se frena y se vuelve a plantear.
- Después, por partes: el cuerpo de los artículos, los párrafos de interpretación de las fichas y el texto de cada provincia en su página fija.
- Lighthouse antes y después, y la prueba de páginas completa.
- Esfuerzo medio, todavía a confirmar. Riesgo medio.

#### Primera y segunda parte, hechas el 16 de noviembre de 2026

`scripts/texto_en_html.mjs`, el último paso de 03: abre cada página en el Chrome sin ventana de las pruebas, con el reloj en la fecha de los datos, sin provincia elegida y sin bajar por la página, y deja escrito en el HTML lo primero que `datina.js` escribe en cada artículo (antes de que se dibujen sus gráficos) y el texto de cada párrafo calculado (`data-t`: la interpretación de cada ficha y sus notas). Al cargar, `datina.js` lo vuelve a escribir igual. Bloquear D3 para no dibujar gráficos no sirve: sin D3, `datina.js` se corta al arrancar y no escribe los textos. Dos armados seguidos dan los mismos archivos, y `pruebas.yml` lo sigue controlando. Tarda unos 30 segundos (47 páginas en cuatro pestañas). Por eso 03 necesita Node 22 o más y Chrome, y los dos flujos instalan Node antes del armado.

| 85 páginas, sin JavaScript | 11 de noviembre | 16 de noviembre |
|---|---|---|
| Palabras | 391.711 (75%) | 453.427 (86%) |
| Cifras | 24.328 (55%) | 28.841 (65%) |
| Páginas sin título (h1) | 25 | 0 |
| Interpretaciones vacías | 209 de 212 | 47 de 220 |

Los 24 artículos y Corte Suprema se leen enteros sin JavaScript. Quedan: el texto propio de cada provincia en su página fija (la tercera parte: hoy las 24 muestran sin JavaScript el mismo texto, sin sus cifras, y su párrafo de escuelas y hospitales vacío), los 12 párrafos de los capítulos de Instituciones políticas que no están a la vista y unos pocos de Precios y actividad, Sector externo, Cuentas públicas, Población, Pobreza y hogares y Salud, que se escriben cuando se dibuja su gráfico.

#### Tercera parte, hecha el mismo día

En las 24 páginas fijas, `texto_en_html.mjs` escribe también las tarjetas del perfil, "Dónde se destaca", "Cómo cambió su puesto" y los censos, ya completos y sin sus gráficos (cada `svg` queda vacío), con los enlaces a las fichas de otra página resueltos como lo hace `destinoDe`. "Comparar con otra provincia" no entra: es un selector. Y 03 escribe en cada página fija su título ("Neuquén en números"), su línea de habitantes y su historia, a la vista: antes llevaba el título de la página general y las historias de las 24, ocultas, así que un buscador leía el mismo texto en las 24 páginas. Las otras 23 ya no van (cada página pasa de 226 KB a 84 KB).

| 85 páginas, sin JavaScript | 11 de noviembre | 16 de noviembre, al final |
|---|---|---|
| Palabras | 75% | 88% (204.069 de 231.306) |
| Cifras | 55% | 87% (25.291 de 29.000) |
| Páginas sin título (h1) | 25 | 0 |
| Interpretaciones vacías | 209 de 212 | 47 de 220 |

El total de palabras con JavaScript baja de 524.786 a 231.306 porque las páginas fijas ya no repiten las 24 historias. Cada página de provincia da ahora 91% o 92% de sus palabras y 94% o 95% de sus cifras sin JavaScript. Las interpretaciones que siguen vacías: el párrafo de escuelas y hospitales de cada provincia (se escribe cuando llega su tabla), los capítulos de Instituciones políticas que no están a la vista y unas pocas que se escriben al dibujar su gráfico. La fase 4 queda cumplida según su criterio (los artículos y las interpretaciones con texto sin JavaScript). Falta medir Lighthouse antes y después, con la fase 5.

### Fase 5. Rendimiento

- Medir de nuevo y comparar con la fase 0.
- Partir `datina.js` por página, con cuidado: el 4 de noviembre de 2026 se decidió no partir `fichas.js` porque cada página lee tablas de otras secciones.
  **Empezado el 24 de noviembre de 2026** (el autor pidió "comenzá con los trabajos grandes"). Cómo: `datina.js` dejó de ser una función que se llama a sí misma (sus 657 nombres de nivel superior no chocan con los del navegador, D3, topojson, Leaflet ni MapLibre: se controló en Chrome), así que lo que declara queda a mano de otros scripts. El código de una sola página va en `scripts/partes/<página>.js`, que se anota en `window.DATINA_PARTES`, y `datina.js` lo corre con `parte("<página>")` en el mismo lugar donde estaba: el orden de todo es el mismo de antes. 03 publica las partes achicadas en `sitio/partes/`, las pide solo en su página antes de `datina.js` (con su huella y la caché larga) y frena si una parte no tiene su llamada o al revés. Los tres cortes del arranque cuando la página se va a otra dirección pasaron de `return` a un error propio (`SE_VA`) que no se anota en la consola. Primer paso: las cinco herramientas que ya cortaban solas fuera de su página (Catálogo, Departamentos, Tu índice, Diagnóstico y el mapa de la portada). La huella de estilos de nueve páginas en 1440 y 390 píxeles da igual que antes.
  **Segundo paso, el 25 de noviembre de 2026: Instituciones políticas, con las transferencias** (`scripts/partes/politica.js`, que pide solo `politica.html`). El orden cambió: política va antes que los artículos, que eran los primeros de la lista, porque los artículos necesitan antes que 03 deje calculado lo que usan todas las páginas, y política no. Son siete tramos de `datina.js` (elecciones, Congreso, legisladores y hemiciclos; las bancas de mujeres y los años en el Congreso; las votaciones, el presupuesto y el voto por provincia; la confianza en el gobierno; las transferencias; y los presidentes, los ministros y la representación), que van a la parte en su orden y corren con `parte("politica")` donde terminaba el último, después de la representación: así todo lo que usan ya está definido, y entre esos tramos el núcleo no lee nada de ellos al cargar. Quedan en el núcleo, donde estaban, los nombres que leen otras páginas: `listaY` (textos de otras secciones y artículos), `ESP_COLOR` (el artículo de los ganadores por provincia), `ESP_TXT`, `CG` y `PRR` ("En cifras"), `AC` con `AC_K`, `AC_CAM` y `textoAnios` (la cifra destacada y las respuestas rápidas de la lupa), `fechaLarga` (el calendario), `mayus` (la Corte), y `TRR` y `milM` ("En cifras" y el minigráfico de los ATN). También quedan los dos textos de política que la lupa lee de `TX` en todas las páginas, `TX["anioscong"]` y `TX["presupuesto"]`, con lo que necesitan (`PV`, `tramosAnios` y `textoPresupuesto`). Tres líneas se partieron para dejar en el núcleo solo lo que hace falta (`PV`, `TRR` y `PRR`). Los nombres se revisaron con un análisis de alcance del código (acorn y eslint-scope): el núcleo no usa nada que declare solo la parte, ninguno se declara en los dos, y la parte no usa nada del núcleo declarado después de su llamada. `sitio/datina.js` bajó de 1.238.017 a 1.168.065 bytes (de 272,1 a 256,4 KB en brotli: 15,7 KB menos en todas las páginas), y `sitio/partes/politica.js` pesa 70.086 bytes (20,3 KB en brotli). La huella de estilos de seis páginas (Instituciones políticas, la portada, Trabajo, Neuquén, un artículo y Curiosidades) en 1440 y 390 píxeles da igual que antes, y en `politica.html`, abierta con el `datina.js` de antes y con el de ahora, los cuatro capítulos dan los mismos textos, los mismos gráficos (elemento por elemento), los mismos selectores y los mismos diálogos de los espacios, sin errores en la consola. En las demás páginas faltan solo las entradas de política de `DIB`, `MED`, `TABLA_PROPIA` y siete notas de `TX` que solo usa esa página. 03 controla ahora las claves repetidas de `LEAD`, `TX`, `DIB` y las demás también en las partes (con o sin sangría, porque ahí muchas van dentro de una función), y `prueba_escala.mjs` busca otra escala de fuerza también en `sitio/partes/`. En el catálogo de datos, tres evidencias pasaron a `scripts/partes/politica.js`.
  **Tercer paso, el 25 de noviembre de 2026: el comercio exterior** (`scripts/partes/externo.js`, que pide solo `externo.html`). Eran cuatro tramos de `datina.js`: los dibujos de "¿Qué le vende y qué le compra la Argentina a cada país?" y del valor por kilo, que estaban dentro del `Object.assign(DIB, {...})` grande y en la parte pasan a `DIB["socios-que"] = ...` y `DIB["valor-kilo"] = ...` (son funciones que corren recién al dibujar, así que llevarlas más abajo no cambia nada); los dos selectores de países de esa ficha, que estaban entre el código de Salud; el bloque del sector externo (`RUB_EX`, `corto`, `RUB_IM` y los dibujos de las exportaciones por rubro, los complejos, los destinos, las exportaciones por provincia, la balanza, las importaciones por uso y por origen, los socios, los socios en la historia, la cuenta corriente y las reservas netas, con sus vistas de entrada en `MED`), y las reservas brutas (`DIB["reservas-bcra"]`). Van a la parte en ese orden y corren con `parte("externo")` donde empezaba el bloque del sector externo: el orden entre los dibujos de la página es el de antes, y nada del núcleo los lee al cargar. Quedan en el núcleo los nombres que leen los textos (`LEAD` y `TX`, que lee la lupa), las cifras destacadas, `PREG`, `SERIE_CIFRA` y "En cifras" en todas las páginas: `SX`, `SQ`, `VK`, `SQ_RUB`, `SQ_USO`, `BZ_Y`, `BZ_S`, `BZ_P`, `BCR_PF` y `BCR_INI`, y `DIB.exportaciones`, que es de Trabajo y del perfil de provincia. El análisis de alcance (acorn y eslint-scope) da lo mismo que en el paso anterior: el núcleo no usa nada que declare solo la parte, ninguno se declara en los dos, y la parte no usa nada del núcleo declarado después de su llamada (solo `cambiarVista`, una función, adentro de un evento). `sitio/datina.js` bajó de 1.168.065 a 1.150.761 bytes (de 256,4 a 253,1 KB en brotli: 3,3 KB menos en todas las páginas), y `sitio/partes/externo.js` pesa 17.430 bytes (5,0 KB en brotli). La huella de estilos de seis páginas (Sector externo, la portada, Trabajo, Neuquén, el artículo de las exportaciones y el dólar, y Curiosidades) en 1440 y 390 píxeles da igual que antes, y `externo.html`, abierta con el sitio de antes y con el de ahora en 1440 y 390 píxeles, sin provincia y con Entre Ríos en el enlace, da en sus cuatro capítulos los mismos textos y los mismos gráficos (su HTML entero), también después de tocar cada botón de sus siete conmutadores y de las pestañas de las reservas, de cambiar los dos países de "¿Qué le vende...?" y de elegir otra provincia (los destinos se vuelven a dibujar), sin errores en la consola. Ninguna evidencia del catálogo de datos ni del Explorador citaba el código movido.
  **Cuarto paso, el 25 de noviembre de 2026: la Corte Suprema** (`scripts/partes/corte.js`), la primera parte que piden dos páginas: `laboratorio.html` (la pieza `lab-corte`, quiénes estaban cada año) y `corte-suprema.html` (la nota `#l-corte`, que arma `PIEZAS` en 03). Para eso 03 suma `PARTE_EN = {"corte": ["laboratorio", "corte-suprema"]}`: una parte que está ahí la piden las páginas de su lista y su archivo lleva el nombre de la parte, y las demás siguen como antes (la pide solo la página de su nombre). Se mantienen los controles de siempre (cada archivo de parte con su `parte("...");` en `datina.js` y al revés) y se suman dos: cada nombre de `PARTE_EN` tiene su archivo, y cada página que pide una parte se arma (si no, 03 frena al final, después de armar todas). Era un solo tramo de `datina.js`, que va entero a la parte y corre con `parte("corte")` en el mismo lugar, después de las trayectorias del Laboratorio: los grupos y sus colores (`CO`, `CO_G`, `CO_DE`, `coClaves`), la leyenda que resalta un grupo con sus cinco escuchadores de `.co-btn` en `document`, los tres dibujos (`filasCorte`, `areasCorte` y `cuadradosCorte`, con `coAbreviar`), la pieza del Laboratorio (`TX["lab-corte"]` y `DIB["lab-corte"]`) y la nota de la página (`notaCorte`, con los dibujos `cs-tiempo`, `cs-composicion` y `cs-presidentes`). `TX["lab-corte"]` también va: la lupa lee de `TX` solo los textos de las fichas (`SITIO.fichas`) y la pieza no es una ficha. Queda en el núcleo `mayus`, que usa también el núcleo y que la parte lee recién al pasar el mouse por un juez (`tipJuez`), aunque se declara después de la llamada, como antes. El análisis de alcance (acorn y eslint-scope) da lo mismo que en los pasos anteriores: el núcleo, las otras partes, `mesas.js`, `rutas.js`, `consulta_ia.js` y las pruebas no usan nada que declare solo la parte, ninguno se declara en los dos, y la parte no usa nada del núcleo declarado después de su llamada salvo `mayus`, adentro de una función. `prueba_encabezados.py` cuenta los `<h1 class="nota-tit"` de `datina.js` y de sus partes (el de la Corte se fue con ella). En el catálogo de datos, cuatro evidencias pasaron a `scripts/partes/corte.js`. `sitio/datina.js` bajó de 1.151.782 a 1.127.085 bytes (de 253,3 a 247,6 KB en brotli: 5,7 KB menos en todas las páginas), y `sitio/partes/corte.js` pesa 24.807 bytes (7,8 KB en brotli). La huella de estilos de seis páginas (la Corte, el Laboratorio, Justicia, la portada, Trabajo y Neuquén) en 1440 y 390 píxeles da igual que antes, y `corte-suprema.html` y `laboratorio.html`, abiertas con el sitio de antes y con el de ahora en 1440 y 390 píxeles (con el reloj fijo: la línea de tiempo llega hasta hoy), dan el mismo HTML entero de `<main>`, también después de pasar el mouse, poner el foco, tocar y volver a tocar cada uno de los 24 botones de la leyenda de la Corte y los 8 del Laboratorio, de cambiar el ancho con un grupo elegido y de pasar el mouse por los jueces (el cuadro de cada uno), sin errores en la consola. Solo esas dos páginas piden `partes/corte.js`, antes de `datina.js`.
  Lo que sigue, en este orden (relevamiento del 24 de noviembre de 2026, en brotli de cada bloque del código sin achicar): los artículos (59 KB, el bloque más grande; antes hace falta que 03 deje calculados "Artículos con este dato", las tarjetas de la portada y de la página Artículos y lo que la lupa lee de ellos), el perfil de provincia (17 KB), y los textos y gráficos de cada sección (`LEAD`, `TX` y `DIB`, 102 KB entre los tres). `CLAVE`, `INDP`, `PREG` y `SERIE_CIFRA` quedan en el núcleo: los usan la lupa, "En cifras", el perfil y la portada de todas las páginas.
- Enlaces internos sin ".html", para evitar la redirección 308 en cada clic. Contra: la vista local con `python -m http.server` deja de andar igual. Hecho el 16 de noviembre de 2026 con la aprobación del autor: los enlaces de las páginas, de `datina.js`, del Catálogo, del Explorador, de la API y de Consultas con IA van sin el `.html`, los servidores de las pruebas responden como Cloudflare, `prueba_metadatos.py` marca un enlace interno con `.html`, y para ver el sitio está `python scripts/servir.py`.
- Esfuerzo medio, riesgo medio.

#### Hecho el 16 de noviembre de 2026

Con el texto ya en el HTML (fase 4), tres cambios:

1. **D3, topojson, `fichas.js` y `datina.js` con `defer`**: la página se pinta sin esperar a bajarlos y correrlos. El 11 de octubre de 2026 se había probado y descartado porque la página se mostraba vacía y saltaba (comentario en `scripts/plantilla.html`): ahora el texto ya está. El Explorador de relaciones sigue cargando D3 sin `defer`.
2. **`scrollbar-gutter: stable`** en `html`: con `defer` la página se pinta antes de terminar de leerse, todavía corta y sin barra de desplazamiento, y al aparecer la barra todo se corría 7 píxeles (0,20 en las páginas de provincia en computadora, encontrado en la traza de Lighthouse).
3. **No volver a escribir lo que ya está** (`yaEscrito` en `datina.js`, `data-pre` en `texto_en_html.mjs`): la huella FNV-1a de lo que `datina.js` escribió en cada artículo y en Dónde se destaca, Cómo cambió su puesto y los censos. Si coincide, no reescribe: reescribirlo hacía que el navegador contara el texto como pintado recién al correr el script. Si no coincide, escribe como antes.

`medir_lighthouse.mjs` necesitaba `--no-sandbox` en Linux, como `cdp.mjs`. Lighthouse 13.6.0, en `/home/user/lighthouse` en la sesión en la nube. Medición del mismo día, mediana de 3 corridas. "Antes" es `main` con la fase 4 ya unida.

| Celular | Antes | Después | Primer texto | Mayor elemento |
|---|---|---|---|---|
| `index.html` | 71 | 96 | 4,3 → 1,5 s | 4,3 → 1,5 s |
| `trabajo.html` | 71 | 95 | 4,4 → 1,5 s | 4,4 → 1,5 s |
| `a-coparticipacion.html` | 72 | 99 | 4,3 → 1,5 s | 4,6 → 1,5 s |
| `provincia-neuquen.html` | 62 | 86 | 4,6 → 1,6 s | 5,9 → 3,3 s |
| `mesas.html` | 61 | 79 | 4,5 → 1,6 s | 4,5 → 1,6 s |
| `catalogo.html` | 83 | 92 | 2,1 → 1,7 s | 2,1 → 1,7 s |

| Computadora | Antes | Después | Primer texto | Corrimiento |
|---|---|---|---|---|
| `index.html` | 96 | 100 | 0,9 → 0,5 s | 0,022 → 0,012 |
| `trabajo.html` | 98 | 100 | 0,9 → 0,5 s | 0,017 → 0,017 |
| `a-coparticipacion.html` | 97 | 100 | 0,9 → 0,5 s | 0,004 → 0,004 |
| `provincia-neuquen.html` | 98 | 100 | 0,9 → 0,6 s | 0,016 → 0,016 |
| `mesas.html` | 91 | 92 | 0,9 → 0,5 s | 0,171 → 0,171 |
| `catalogo.html` | 93 | 94 | 0,5 → 0,5 s | 0,149 → 0,149 |

Contra la medición de base del 11 de noviembre, Neuquén en celular pasó de 38 a 86 y su corrimiento de 0,687 a 0. El mismo día, el de Elecciones por mesa: el pie y los límites aparecían arriba y saltaban al llegar el mapa y el resultado. Ahora no se ven (siguen en su lugar) mientras `#ms-resultado` está vacío: de 0,171 a 0,010, y de 92 a 95 en computadora. El 17 de noviembre, con la respuesta del autor, las letras desde el propio sitio (`scripts/fuentes/web/`, `sitio/fuentes/`): el corrimiento del Catálogo era la bajada, que con la letra de reemplazo ocupaba un renglón más hasta que llegaba Roboto Flex de Google. En computadora el Catálogo pasó de 0,149 a 0 y de 94 a 100, Elecciones por mesa a 100, y el primer texto bajó de 0,5 a 0,3 s en las seis páginas. En celular el primer texto bajó de 1,5 a 0,9 s y Neuquén pasó de 86 a 96, pero la portada bajó de 96 a 73: con las letras pedidas antes (preload), su bajada se pinta enseguida con Roboto Flex y pasa a ser el elemento más grande, y la simulación de celular lento de Lighthouse le carga la descarga de la letra (6 s, cuando en la página se pinta a los 0,33 s). Se probó sin preload: la portada volvía a 91, pero el Catálogo volvía a saltar en computadora (0,149) y en celular saltaban el artículo (0,21), Elecciones por mesa (0,26) y Neuquén (0,14). Queda con preload: quien entra ve la letra correcta enseguida y nada salta. Antes quedaban: el corrimiento del Catálogo en computadora (el del Catálogo era 0,004 el 11 de noviembre: lo cambió algo de los días siguientes, no esta fase), el bloqueo de Elecciones por mesa en celular (700 ms) y partir `datina.js` por página, que sigue en el plan con cuidado: cada página baja 1,2 MB de JavaScript (280 KB comprimido), aunque ya no frena la primera pintura.

## Lo que ya estaba pendiente, en el mismo orden

Inventario del 11 de noviembre de 2026 sobre `docs/roadmap/` y `docs/redaccion/`, confirmado contra el código ese mismo día (los puntos que estaban marcados para revisar ya no llevan la marca). Las letras dicen quién lo mueve: **(C)** Claude puede hacerlo, **(A)** espera una decisión del autor y **(T)** espera a un tercero.

Orden: un solo PR abierto a la vez, como siempre. Entre una fase técnica y la siguiente entra a lo sumo un PR de esta lista. Las tareas con fecha (abajo) van cuando llega su fecha, sin esperar a las fases.

### Ordenar la lista (hecho en la fase 0, 11 de noviembre de 2026)

- `docs/redaccion/PENDIENTES.md`: cada cuestión lleva su estado y su evidencia. De 198 quedan 125 abiertas (antes se hablaba de 193: las 198 menos las cinco del PR #12): 84 siguen igual, 26 cambiaron en parte y 15 esperan una decisión del autor. Se resolvieron 73. Los estados los revisaron tres agentes y se controlaron 15 a mano.
- Las decisiones del resumen de la reescritura eran seis, no cinco. Quedan abiertas dos, suicidio y Contacto (abajo). ESTADO corregido.
- Los ítems **[revisar]** se confirmaron contra el código y quedan abajo sin la marca.
- Lo que conviene hacer primero de las 126, porque no cambia el diseño ni espera al autor: los nombres de organismos que todavía no coinciden entre pies, notas y explicadores (turismo en las notas y los explicadores, Capital Humano, costos educativos, DEIS). Los nombres viejos que `relaciones.json` guarda como alias se quedan: son una decisión del autor del 3 de noviembre de 2026 y las descripciones sin período (f-especies, f-glaciares, rotación). (C)

### Escuelas y hospitales (fase 3 de `ESTABLECIMIENTOS.md`)

- ~~Qué parte de las escuelas es privada en cada departamento, en el mapa de departamentos.~~ Hecho el 24 de noviembre de 2026: un indicador más del mapa de Departamentos.
- ~~Escuelas privadas y resultados de Aprender por departamento, con "Qué no dice este dato".~~ Hecho el 24 de noviembre de 2026: `f-privadas-aprender` en Educación.
- Ver si el Censo 2022 tiene población por edad por departamento. (C) Revisado el 24 de noviembre de 2026: la base por radio censal ya no está en datos.gob.ar, y la edad por departamento que hay es la del RENAPER. Corregido el 25 de noviembre de 2026: la base sigue, con otra dirección (detalle en `ESTABLECIMIENTOS.md`).
- Las 175 escuelas a entre 1 y 20 km de su departamento: confirmar que quedan donde dice la fuente. (A)
- La secundaria por chico, solo si el autor la pide. Matrícula por escuela: hay que bajarla a mano de SharePoint. (A)

### Elecciones (`MESAS.md` y `ELECCIONES_PROVINCIAS.md`)

- Para hacer: el gobernador por departamento antes de 1983 (Amaral para 1946, Entre Ríos de 1935 a 1943 y la Junta bonaerense de 1963), la forma de elección (directa o por colegio) donde falta comprobarla, las PASO (2015 no se baja por mesa y 2023 está solo en el Internet Archive) con la transferencia de votos de 2011 a 2023, los locales de votación de 2025, los límites de las 28 circunscripciones de CABA hasta 2007, los convencionales de 1948 y 1957 y las elecciones de 1931, 1960 y 1963. (C)
- Desde la computadora del autor, porque la nube no los abre: el Internet Archive de la DINE, el Atlas de Tow, HathiTrust, apym.hcdn, Memorias del Interior, Formosa de 1958 a 1973 y El Litoral. (C)
- Segunda etapa, con legisladores provinciales, intendentes y concejales: cuando el autor la pida. Las segundas elecciones del mismo año (Buenos Aires 1913 y 1931) piden cambiar la clave. (A)
- Pedidos de acceso a la información (Cámara Nacional Electoral, DINE, juzgados de la Capital de 1996 y 1997 y juntas provinciales) y permisos (Andy Tow, Ernesto Calvo, Solís Carnicer y el Instituto Histórico). Los hace el autor y después contesta un tercero. (A y T)
- El padrón del exterior de otros años (la Cámara publica solo el de 2023), San Juan 1987 sin fuente y Corrientes 1992 anulada. (T)

### Plan de mejora y funciones

- El resto de D2: reordenar el código que corre al comienzo. Va con la fase 5. (C)
- ~~El bloque de la deuda provincial en "Para entender los datos" de Cuentas públicas.~~ Hecho el 24 de noviembre de 2026: "La deuda de las provincias", con las notas de la planilla trimestral de la Subsecretaría de Coordinación Fiscal Provincial como citas.
- Completar las leyes sin verificar de `cortes_provinciales.csv`. (C) El 24 de noviembre de 2026 se verificaron Jujuy (9, Ley 4055 según la 5878, texto del Poder Judicial) y Santa Fe (7, Ley 14.292 y Constitución de 2025). Falta Chaco: el digesto de la Legislatura y el sitio del Poder Judicial no respondieron desde la nube, y la única copia es la del INECIP (cinco miembros, artículo 16). Se puede confirmar desde la computadora del autor.
- Zonas protegidas de la Antártida en el mapa (`apa_shape_2024.zip`). (C) El enlace desde Tierra del Fuego al capítulo está hecho desde el 24 de noviembre de 2026.
- E15: el Senado sigue por partido o alianza y Diputados por bloque (`PENDIENTES.md`, Estado y sociedad 7). (A) El 24 de noviembre de 2026 se vio que las actas de Cómo Votó no dan el bloque de cada período (repiten uno solo por senador, a veces posterior) y que la única fuente oficial por bloque es el listado actual del Senado: el autor decide si se usa para el período en curso, con una regla mixta.
- R8, en parte: las exportaciones por habitante siguen en Trabajo (`f-exportaciones`). La balanza energética ya no se repite: queda solo en Petróleo y gas. (C)
- ~~El pie del perfil provincial~~: hecho el 24 de noviembre de 2026. Con una provincia elegida, al final de la página, "Descargar el perfil (CSV)" (las cifras de las tarjetas con el tema, el detalle, el valor del país, el puesto y la dirección de su ficha, armado en el navegador por `perfilCSV()` de `datina.js`) y "Copiar cita" ("Datina (año). Chaco en números. Dirección. Consultado el día."). La imagen al compartir ya estaba (D3).
- T2 está hecha desde el 24 de noviembre de 2026: `.github/workflows/semanal.yml` corre los lunes sobre `main` `prueba_320.mjs`, `scripts/peso_paginas.mjs` (nuevo: el peso comprimido de cada página contra `scripts/peso_paginas.json`) y `linea_base.mjs`. La prueba T11 (banco de preguntas con el modelo de verdad) de la sección 9 de `PLAN_MEJORA.md`: sigue sin hacer. (C) T14 (huella de estilos) está hecha desde el 24 de noviembre de 2026: `scripts/huella_estilos.mjs`, a mano, como dice `.claude/rules/pruebas.md`.
- Con una descarga que aprueba el autor: informalidad (cuatro trimestres de la EPH), cobertura de salud por tipo, el IPC con más detalle, TV paga del ENACOM (no está en `01_descargar.py`) y lo que queda de la sección 3 de `PLAN_MEJORA.md`, que sigue sin ficha: muertes en el tránsito por provincia, chicos en hogares pobres, salario mínimo frente a la canasta, tarifas de luz y gas, turismo interno (EVyTH), votantes y bancas de mujeres. (A, después C)
- F13, la línea de tiempo en los mapas, sigue postergada hasta que un mapa por provincia tenga su serie. Una segunda corrida mensual después del IPC, la EPH y el EMAE: `actualizar.yml` sigue con una sola, el día 5. (A)

### Decisiones del autor que siguen abiertas

- Suicidio por provincia sin ranking (orden alfabético o mapa) y sacar de f-muertes la razón entre suicidios y homicidios.
- El canal de Contacto (correo del proyecto, issues o sacar la página).
- Portada: el título de los artículos sobre el borde, y el recuadro de la tarjeta del mapa entre 761 y 1199 píxeles.
- Precios de la vivienda por capital: solo hay fuentes privadas.
- Las 52 "decisiones dudosas" del catálogo del Explorador (`EXPLORADOR.md`).
- `fichas.json` publicado sin uso (P2-7), el peso del repositorio (P2-13), y la limpieza de worktrees y ramas viejas en la computadora del autor (P2-15 y las ramas de PR cerrados).

### Respuestas del autor del 24 de noviembre de 2026

El autor contestó todas las decisiones abiertas que se le pasaron ese día ("pasame todas las opciones que necesiten mi decisión, y luego comenzá con los trabajos grandes"). Cada una va en su PR, una por vez, intercaladas con los trabajos grandes:

- E15, el Senado por bloque: **queda como está**, por partido o alianza y con el aviso del texto. No se suma el listado del Senado.
- Descargas nuevas aprobadas: **la serie nacional de internet fijo de ENACOM** (para la cifra del país de f-internet, Personas 16 de `PENDIENTES.md`) y **las zonas protegidas de la Antártida** (`apa_shape_2024.zip`, para el mapa de Naturaleza). El Censo 2022 por radio censal, no.
- f-rotacion: **sacar la opción "Generación"** del selector.
- Pruebas: **T2 sí** (un flujo semanal de GitHub con `prueba_320.mjs`, `linea_base.mjs` y el peso de cada página). T11 (el modelo de verdad) no, por ahora.
- f-suicidio-prov: **un mapa** en lugar de las barras de mayor a menor, y un texto sin nombrar la tasa más alta ni la más baja. Es un cambio visual: va con capturas. Hecho el 25 de noviembre de 2026: `mapaProv`, el mismo de las pensiones por invalidez (cinco tramos de casi la misma cantidad de jurisdicciones, CABA aparte), con la tasa y los casos de cada una al pasar el mouse. El texto da la tasa nacional y avisa que en las jurisdicciones de menos habitantes pocos casos mueven mucho la tasa. 02 ya no calcula `top` ni `low` de suicidio, así que tampoco están en `fichas.js`. "Ver tabla" sigue en el orden de los códigos del INDEC, sin ordenar por la tasa.
- f-muertes: **quedan** la razón entre suicidios y homicidios y el año del cruce con las muertes viales.
- Contacto: **un correo del proyecto**. Falta que el autor pase la dirección; hasta entonces la página queda como está.
- Las flechas de "Anterior", "Siguiente" y "al final de la página": el autor dijo sacarlas, y ya no estaban (`FLECHA_ANT` y `FLECHA_SIG` vacías y la línea de "Para entender los datos" sin flecha).
- "De efecto directo" en Instituciones políticas: pasa a **"Vida diaria"** en todo el sitio (botón, selector, tabla y notas).
- "Grafo" en el Explorador de relaciones: **queda**.
- El índice por provincia, grupo de trabajo: el autor eligió la tasa de empleo, pero el 14 de noviembre de 2026 ya había reemplazado las exportaciones por el salario (`datina.js`, "Trabajo y salarios"), y la tasa de empleo de la EPH es por aglomerado, no por provincia. Se le avisa y queda el salario hasta que conteste.
- Los textos de historia de las 24 provincias: **avisarlo en Fuentes** (que salen de los resúmenes de los buscadores de cada página citada, sin la verificación una por una).
- El Laboratorio: **quedan** el hemiciclo y los años en el Congreso.
- La serie de muertes violentas: **queda en Salud**, con el enlace desde Seguridad.
- f-parques: la cifra destacada pasa a **la superficie protegida**, con cuánto es mar.
- Consultas con IA: **nombrar el modelo**, tomado por 03 de la función al armar.

### Repaso del 25 de noviembre de 2026

Con las respuestas del autor de ese día. La lista de arriba, "Decisiones del autor que siguen abiertas", queda como registro de cómo estaba el 11 de noviembre.

- Suicidio por provincia: hecho (PR #179, mapa sin nombrar extremos). f-muertes queda como estaba.
- Portada: **ya estaba decidida** el 14 de noviembre de 2026, con capturas (`DECISIONES.md`): los artículos quedan como están, con el ícono a la izquierda, y la tarjeta del mapa entre 761 y 1199 píxeles va más clara y sin borde ni sombra. La nota que la daba por abierta estaba desactualizada.
- Las 52 dudas del Explorador: **ya estaban resueltas** el 14 de noviembre de 2026 (`EXPLORADOR.md`): son dudas sobre a qué organismo asignar cada archivo, no relaciones dudosas, y quedaron como estaban. El 25 de noviembre se le preguntó al autor como si fueran relaciones dudosas y eligió sacarlas: se le explicó el error y no se tocaron, porque sacarlas deja fichas sin origen y 03 no arma el sitio.
- Contacto: el autor eligió `contacto@datina.com.ar`, con Email Routing de Cloudflare reenviando a su correo. Lo configura él en Cloudflare (toca los registros de correo del dominio). El autor lo configuró y lo probó desde otra dirección ese mismo día, y la página de Contacto pasó a mostrar `contacto@datina.com.ar` (`correo_contacto` de `datos/manual/sitio.json`). Ningún archivo del sitio muestra ya el correo personal del autor. Ese mismo día el autor pidió poder escribirle desde la página, con nombre, apellido y mensaje. Eligió primero la versión sin servidor: Enviar abre el programa de correo de quien escribe con el mensaje armado para `contacto@datina.com.ar` (asunto "Contacto desde Datina" con el nombre). El autor pidió después sumar el correo: es obligatorio y va al pie del mensaje, así se le responde a esa dirección aunque se escriba desde otra cuenta. Si no se abre, aparece cómo copiar el mensaje. Sin JavaScript se ve solo la dirección. El envío desde la página, sin abrir nada, queda para más adelante: Cloudflare Pages no puede mandar correos, así que hace falta un Worker aparte con `send_email`, unido al sitio por un Service binding, y Turnstile contra los robots. Lo configura el autor en el panel, con una guía.
- Precios de la vivienda por capital: el autor eligió una fuente privada citada. Lo que se encontró ese día:
  - Ninguna fuente privada cubre las 24 capitales. Reporte Inmobiliario da alquileres de 7 capitales (Córdoba, Mendoza, Neuquén, Posadas, Salta, Santa Fe y San Miguel de Tucumán), trimestral desde 2009, en pesos y con la serie completa paga. Los índices de la Universidad de San Andrés con Mercado Libre (Excel mensual gratis desde 2018) cubren solo el AMBA, Córdoba y Rosario. Zonaprop, CABA, el Gran Buenos Aires, Córdoba y Rosario, en PDF.
  - Ninguna tiene una licencia que deje republicar sus cifras en una tabla descargable: Reporte Inmobiliario permite transcribir citando y pide autorización expresa para reproducir, la de San Andrés no dice nada, Argenprop lo prohíbe y los términos de Zonaprop no se pudieron leer.
  - Casi todas miden el precio de los avisos, no el de cierre (en CABA, el índice M² Real de RE/MAX y UCEMA da cerca de 5% menos), y miden distinto entre sí: Neuquén aparece entre 1.920 y 3.034 dólares por metro cuadrado según la fuente.
  - Opciones que se le pasaron al autor: pedir permiso por escrito (sobre todo a San Andrés), una ficha solo con texto o dejarlo afuera. Espera su respuesta.
- Repositorio y ramas: el autor pidió borrarlas sin romper nada. En GitHub hay 46 ramas viejas enteras dentro de `main` (borrarlas no pierde nada) y 5 con trabajo que no llegó a `main` (`claude/awesome-cannon-dkbl1m`, `claude/epic-gauss-wd7u38`, `claude/fase2-poblacion`, `claude/hopeful-curie-3rki8g` y `claude/snic-formato-nuevo`), que quedan. Los permisos de la sesión no dejaron borrarlas desde Claude: se le pasó al autor cómo hacerlo desde GitHub y los comandos para su computadora, que solo borran ramas ya unidas (`git branch -d`). La historia del repositorio no se reescribe.
- `fichas.json` publicado sin uso (P2-7): **ya estaba hecho**. Desde el 14 de noviembre de 2026, 03 borra `sitio/datos/fichas.json` al armar y el sitio usa solo `fichas.js`.

### Fuentes caídas y tareas con fecha

- datos.energia.gob.ar no contesta desde el 23 de octubre de 2026 (nueve descargas con su archivo anterior). SINTA, bloqueado por Cloudflare: el autor puede escribirle a la Secretaría de Turismo y avisar a datos.gob.ar del error de los meses de parques. Aprender sigue con 2025 hasta que salga una base más nueva. (T)
- A principios de 2027: volver a correr `transferencias_presupuesto.py`. A mitad de 2027: `justicia_provincias.py` con el Mapa de Género 2026 y el anuario de la Corte. (C)
- Abril de 2027: avisar al autor que el token de la API del INDEC vence el 1 de mayo de 2027. (A)
- Los datos de la Antártida se actualizan a mano (`antartida_datos.py` y `antartida_presupuesto.py`). (C)

### Next.js

No está en el plan. Se vuelve a evaluar solo si después de la fase 4 los buscadores siguen sin leer las cifras. Si algún día se migra: rama aparte con vista previa, todas las direcciones conservadas o redirigidas con 301, el mismo diseño, ningún dato perdido y Lighthouse antes y después.
