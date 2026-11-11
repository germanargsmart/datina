# Plan técnico: buscadores, IA y datos abiertos

**Propuesto, espera la aprobación del autor.** Las decisiones de abajo sí son del autor. El orden de las fases y la forma de intercalar lo pendiente son la propuesta.

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

- Lighthouse en seis páginas (portada, Trabajo, un artículo, una provincia, Elecciones por mesa, Catálogo) en celular y computadora, y `node scripts/medir_carga.mjs`. Lighthouse se instala con npm: es una descarga chica, que el autor aprueba antes.
- Qué ve un rastreador sin JavaScript: el texto de cada página sin ejecutar `datina.js`.
- Los números quedan en este archivo, para comparar después de las fases 4 y 5.
- Esfuerzo bajo, riesgo nulo.

### Fase 1. `llms.txt` y datos estructurados

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

Inventario del 11 de noviembre de 2026 sobre `docs/roadmap/` y `docs/redaccion/`. Los documentos son registros que crecen hacia abajo y muchos "pendiente" se cierran más abajo: lo marcado **[revisar]** figura como propuesta sin constancia de cierre y se confirma antes de planificarlo. Las letras dicen quién lo mueve: **(C)** Claude puede hacerlo, **(A)** espera una decisión del autor y **(T)** espera a un tercero.

Orden: un solo PR abierto a la vez, como siempre. Entre una fase técnica y la siguiente entra a lo sumo un PR de esta lista. Las tareas con fecha (abajo) van cuando llega su fecha, sin esperar a las fases.

### Ordenar la lista (va con la fase 0, solo documentación)

- `docs/redaccion/PENDIENTES.md` dice 193 cuestiones, pero no se actualizó después del 27 de octubre de 2026 y los PR #15 a #48 resolvieron muchas. Revisarla ítem por ítem y dejar el número real. (C)
- ESTADO dice que siguen abiertas "cinco decisiones del autor" de la reescritura. Según el inventario quedan dos, suicidio y Contacto (abajo): confirmarlo y corregir ESTADO. (C)
- Confirmar cada ítem **[revisar]** de esta sección. (C)

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
- **[revisar]** E15 (una sola regla de bloques en f-legisladores), R8 (exportaciones por habitante en Trabajo y balanza energética repetida), el pie del perfil provincial con CSV, imagen y cómo citar, y las pruebas T2, T11 y T14 de la sección 9 de `PLAN_MEJORA.md`. (C)
- Con una descarga que aprueba el autor: informalidad (cuatro trimestres de la EPH), cobertura de salud por tipo, el IPC con más detalle, TV paga del ENACOM **[revisar]** y lo que queda de la sección 3 de `PLAN_MEJORA.md` **[revisar]** (muertes en el tránsito, chicos en hogares pobres, salario mínimo frente a la canasta, tarifas de luz y gas, turismo interno, votantes y bancas de mujeres). (A, después C)
- F13, la línea de tiempo en los mapas, sigue postergada hasta que un mapa por provincia tenga su serie. **[revisar]** Una segunda corrida mensual después del IPC, la EPH y el EMAE. (A)

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
