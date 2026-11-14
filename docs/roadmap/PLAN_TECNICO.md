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
- **Armado el 14 de noviembre de 2026** (`docs/ia/MCP.md`): `/api/mcp` y `/api/datos/...`, cinco herramientas, 71 controles en `scripts/prueba_datos_api.mjs` y la sección en "Usar los datos". Sin Elecciones por mesa, que necesita antes la marca de origen de cada elección: queda pendiente.
- **Antes de publicar, el autor**: aprueba la dirección pública nueva y revisa en el panel de Cloudflare el plan de la cuenta (el MCP comparte con `/api/consulta` el límite de pedidos de las funciones) y que no esté prendido el bloqueo de bots de IA.
- Esfuerzo medio, riesgo bajo en el código. Es una dirección pública nueva.

### Fase 4. El texto en el HTML (en lugar de Next.js)

- Primero, la prueba de que el paso nuevo da siempre los mismos archivos, en Windows y en Linux (`pruebas.yml` controla que `sitio/` sea el que arman las fuentes). Si no se logra, se frena y se vuelve a plantear.
- Después, por partes: el cuerpo de los artículos, los párrafos de interpretación de las fichas y el texto de cada provincia en su página fija.
- Lighthouse antes y después, y la prueba de páginas completa.
- Esfuerzo medio, todavía a confirmar. Riesgo medio.

### Fase 5. Rendimiento

- Medir de nuevo y comparar con la fase 0.
- Partir `datina.js` por página, con cuidado: el 4 de noviembre de 2026 se decidió no partir `fichas.js` porque cada página lee tablas de otras secciones.
- Enlaces internos sin ".html", para evitar la redirección 308 en cada clic. Contra: la vista local con `python -m http.server` deja de andar igual. Decisión del autor antes de hacerlo.
- Esfuerzo medio, riesgo medio.

## Lo que ya estaba pendiente, en el mismo orden

Inventario del 11 de noviembre de 2026 sobre `docs/roadmap/` y `docs/redaccion/`, confirmado contra el código ese mismo día (los puntos que estaban marcados para revisar ya no llevan la marca). Las letras dicen quién lo mueve: **(C)** Claude puede hacerlo, **(A)** espera una decisión del autor y **(T)** espera a un tercero.

Orden: un solo PR abierto a la vez, como siempre. Entre una fase técnica y la siguiente entra a lo sumo un PR de esta lista. Las tareas con fecha (abajo) van cuando llega su fecha, sin esperar a las fases.

### Ordenar la lista (hecho en la fase 0, 11 de noviembre de 2026)

- `docs/redaccion/PENDIENTES.md`: cada cuestión lleva su estado y su evidencia. De 198 quedan 125 abiertas (antes se hablaba de 193: las 198 menos las cinco del PR #12): 84 siguen igual, 26 cambiaron en parte y 15 esperan una decisión del autor. Se resolvieron 73. Los estados los revisaron tres agentes y se controlaron 15 a mano.
- Las decisiones del resumen de la reescritura eran seis, no cinco. Quedan abiertas dos, suicidio y Contacto (abajo). ESTADO corregido.
- Los ítems **[revisar]** se confirmaron contra el código y quedan abajo sin la marca.
- Lo que conviene hacer primero de las 126, porque no cambia el diseño ni espera al autor: los nombres de organismos que todavía no coinciden entre pies, notas y explicadores (turismo en las notas y los explicadores, Capital Humano, costos educativos, DEIS). Los nombres viejos que `relaciones.json` guarda como alias se quedan: son una decisión del autor del 3 de noviembre de 2026 y las descripciones sin período (f-especies, f-glaciares, rotación). (C)

### Escuelas y hospitales (fase 3 de `ESTABLECIMIENTOS.md`)

- Qué parte de las escuelas es privada en cada departamento, en el mapa de departamentos. (C)
- Escuelas privadas y resultados de Aprender por departamento, con "Qué no dice este dato". (C)
- Ver si el Censo 2022 tiene población por edad por departamento. (C)
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
- El bloque de la deuda provincial en "Para entender los datos" de Cuentas públicas. (C)
- Completar las leyes sin verificar de `cortes_provinciales.csv`. (C)
- Zonas protegidas de la Antártida en el mapa (`apa_shape_2024.zip`) y el enlace desde Tierra del Fuego al capítulo. (C)
- E15: el Senado sigue por partido o alianza y Diputados por bloque (`PENDIENTES.md`, Estado y sociedad 7). (C)
- R8, en parte: las exportaciones por habitante siguen en Trabajo (`f-exportaciones`). La balanza energética ya no se repite: queda solo en Petróleo y gas. (C)
- El pie del perfil provincial: la imagen al compartir ya está (D3). Faltan el CSV del perfil y la cita propia (hoy la página de provincia solo enlaza "Usar los datos"). (C)
- Las pruebas T2 (`scripts/linea_base.mjs` existe, pero no corre sola una vez por semana), T11 (banco de preguntas con el modelo de verdad) y T14 (huella de estilos) de la sección 9 de `PLAN_MEJORA.md`: siguen sin hacer. (C)
- Con una descarga que aprueba el autor: informalidad (cuatro trimestres de la EPH), cobertura de salud por tipo, el IPC con más detalle, TV paga del ENACOM (no está en `01_descargar.py`) y lo que queda de la sección 3 de `PLAN_MEJORA.md`, que sigue sin ficha: muertes en el tránsito por provincia, chicos en hogares pobres, salario mínimo frente a la canasta, tarifas de luz y gas, turismo interno (EVyTH), votantes y bancas de mujeres. (A, después C)
- F13, la línea de tiempo en los mapas, sigue postergada hasta que un mapa por provincia tenga su serie. Una segunda corrida mensual después del IPC, la EPH y el EMAE: `actualizar.yml` sigue con una sola, el día 5. (A)

### Decisiones del autor que siguen abiertas

- Suicidio por provincia sin ranking (orden alfabético o mapa) y sacar de f-muertes la razón entre suicidios y homicidios.
- El canal de Contacto (correo del proyecto, issues o sacar la página).
- Portada: el título de los artículos sobre el borde, y el recuadro de la tarjeta del mapa entre 761 y 1199 píxeles.
- Precios de la vivienda por capital: solo hay fuentes privadas.
- Las 52 "decisiones dudosas" del catálogo del Explorador (`EXPLORADOR.md`).
- `fichas.json` publicado sin uso (P2-7), el peso del repositorio (P2-13), y la limpieza de worktrees y ramas viejas en la computadora del autor (P2-15 y las ramas de PR cerrados).

### Fuentes caídas y tareas con fecha

- datos.energia.gob.ar no contesta desde el 23 de octubre de 2026 (nueve descargas con su archivo anterior). SINTA, bloqueado por Cloudflare: el autor puede escribirle a la Secretaría de Turismo y avisar a datos.gob.ar del error de los meses de parques. Aprender sigue con 2025 hasta que salga una base más nueva. (T)
- A principios de 2027: volver a correr `transferencias_presupuesto.py`. A mitad de 2027: `justicia_provincias.py` con el Mapa de Género 2026 y el anuario de la Corte. (C)
- Abril de 2027: avisar al autor que el token de la API del INDEC vence el 1 de mayo de 2027. (A)
- Los datos de la Antártida se actualizan a mano (`antartida_datos.py` y `antartida_presupuesto.py`). (C)

### Next.js

No está en el plan. Se vuelve a evaluar solo si después de la fase 4 los buscadores siguen sin leer las cifras. Si algún día se migra: rama aparte con vista previa, todas las direcciones conservadas o redirigidas con 301, el mismo diseño, ningún dato perdido y Lighthouse antes y después.
