# Datina

Números de las 24 Argentinas. Sitio estático de estadísticas públicas de la Argentina con valor agregado: cada cifra trae qué mide, de qué año es, de dónde sale y su tabla descargable. Lema: "Las 24 Argentinas en números". El diferencial es la desagregación subnacional y los cruces entre fuentes. Inspiración: The Pudding, Our World in Data, USAFacts. Antecedente local que no se duplica: Argendata (Fundar). La carpeta conserva el nombre viejo del proyecto.

El autor no programa. Claude Code es el asistente principal: explicar cada cambio en lenguaje simple, ejecutar los scripts y verificar el resultado antes de dar algo por terminado.

## Al empezar una sesión

1. Leer `docs/roadmap/ESTADO.md` (qué se hizo y cuál es la próxima tarea) y solo el documento del tema de la tarea.
2. Revisar `git status` y no pisar trabajo local.
3. Las reglas por tipo de archivo están en `.claude/rules/` (se cargan solas al tocar esos archivos). La historia completa de las etapas 1 a 38 (decisiones del autor, advertencias de cada fuente, medidas) está en `docs/historico/etapas-previas.md`: buscar ahí por título de sección antes de cambiar algo que ya tiene historia, sin leerla entera.
4. Cada tarea: un cambio funcional, un commit. Informe final breve: archivos, qué cambió, pruebas y resultado, riesgos, siguiente tarea.

## Estructura

```
scripts/01_descargar.py        baja cada fuente tal como la publica el organismo a datos/crudo/ (FUENTES: archivo -> URL)
scripts/02_procesar.py         arma datos/ordenado/tabla_larga.csv, sitio/datos/fichas.json y un CSV por tabla
scripts/03_construir_sitio.py  corre pruebas_datos.py y escribe sitio/datos/fichas.js, sitio/datina.css, sitio/datina.js y una página por sección
scripts/plantilla.html         el marcado de todas las secciones: títulos, textos fijos y fichas
scripts/datina.css / datina.js el diseño (valores en :root) y los textos calculados, gráficos (D3 7.8.5 desde cdnjs) y comportamiento
scripts/pruebas_datos.py       pruebas de los datos: si fallan, no se arma ni se publica
scripts/relaciones.py          arma el Explorador de relaciones (relaciones.html) desde datos/manual/relaciones.json y lo valida
scripts/catalogo.py            arma la lista del Catálogo de datos (catalogo.html) y valida que cada tabla publicada tenga dónde se usa (datos/manual/catalogo.json)
scripts/prueba_paginas.mjs     prueba de las páginas armadas en Chrome sin ventana (usa scripts/cdp.mjs)
scripts/*_historia.py, censo_2022_*.py, banderas.py, iconos_isometricos.py, geometria_*.py, *_presupuesto.py
                               programas que se corren una sola vez o una vez por año y guardan en datos/manual/
datos/manual/                  datos armados a mano o una sola vez, explicadores.json, distorsiones.json, banderas, íconos
pobreza/                       consultor de pobreza aparte (Observable Framework, DuckDB, Parquet): ver pobreza/README.md
sitio/                         lo único que se publica (Netlify, netlify.toml). Nunca se edita a mano: sale de scripts/
docs/roadmap/                  plan vigente, estado, decisiones, criterios de aceptación e inventario
.github/workflows/actualizar.yml  actualización automática mensual (día 5): descarga, procesa, prueba, arma y publica
```

## Comandos

- Todo: `python scripts/01_descargar.py && python scripts/02_procesar.py && python scripts/03_construir_sitio.py`, y después `node scripts/prueba_paginas.mjs` (Node 22 o más y Chrome, de 3 a 5 minutos).
- No correr `01_descargar.py` para cambios visuales ni sin aprobación del autor: baja cientos de MB.
- Armar sin descargar: `python scripts/03_construir_sitio.py` (corre antes `pruebas_datos.py`). No toca `sitio/pobreza/`: el consultor de pobreza se arma aparte (`pobreza/README.md`) y entra al sitio solo con `python scripts/03_construir_sitio.py --con-pobreza`.
- Sintaxis del JavaScript, después de tocar `datina.js`: `node -e "new Function(require('fs').readFileSync('sitio/datina.js','utf8'))"`.
- Catálogo del Explorador de relaciones: `python scripts/relaciones.py` (lo valida) y `python scripts/prueba_relaciones.py` (prueba el validador). 03 corre los dos.
- Ver el sitio: `cd sitio && python -m http.server 8765`.
- Detalle por tipo de cambio y cómo probar en un entorno sin acceso a las CDN: `.claude/rules/pruebas.md`.

## Reglas de datos (resumen; completas en `.claude/rules/pipeline-datos.md`)

- `tabla_larga.csv` siempre con `codigo_indec, territorio, periodo, variable, valor, unidad, fuente`. Toda variable nueva entra por `agregar()` de `02_procesar.py`. Códigos INDEC de dos dígitos ("02" CABA, "06" Buenos Aires), "00" total país.
- Una fuente principal por indicador, la nacional. El Banco Mundial (`bm_*`) solo en la comparación con la OCDE.
- Un solo módulo de población: proyecciones del INDEC base Censo 2022 (`POB`). Excepciones declaradas en cada ficha.
- Redondeo único, al mostrar (`r1()`, mitad hacia arriba). Las tablas guardan cuatro decimales.
- Ningún año que cambia con los datos va escrito a mano: sale del resumen (`{{ruta}}` en la plantilla). El constructor frena el sitio si encuentra uno.
- Los textos se generan desde `resumen`, nunca con cifras escritas a mano.
- Toda ficha nueva necesita su origen en `datos/manual/relaciones.json` (Explorador de relaciones, `docs/roadmap/EXPLORADOR.md`): sin eso, 03 no arma el sitio.
- No tocar `datos/crudo/` a mano ni ejecutar descargas masivas sin aprobación.
- Un hallazgo nuevo de `pruebas_datos.py` sin motivo en `ACEPTADAS` frena el armado y la publicación.

## Reglas de redacción (obligatorias)

- Español rioplatense. Desde la etapa 37, el título de cada ficha y el de cada página es una pregunta. Regla del autor: "Pregunta concreta + respuesta cuantificable" ("¿Dónde se gana más?", nunca "Conocé…", "Descubrí…" o "Mirá…"). Neutra, sin cifras ni años, nunca retórica. Debajo va la descripción con su período (`p.ficha-sub`, "Tasa de mortalidad infantil por provincia, 2021 a 2023"), fija y con `{{ruta}}`. Las fichas de suicidio y la de muertes violentas conservan su título descriptivo, sin pregunta.
- Orden de prioridad visual del autor, que no se invierte: la pregunta, el dato o el gráfico, la interpretación, la fuente y la metodología. En la plantilla el texto (`p.lead`) va después del gráfico (el constructor lo controla), salvo en las fichas de suicidio y las anchas.
- Toda cifra se explica completa: qué mide, unidad, año y población de referencia.
- Usar siempre el dato más reciente disponible.
- No usar punto y coma en ningún texto visible.
- Tono neutro en temas políticos: describir, no adjetivar.
- "y" pasa a "e" delante del sonido de la i: todo texto que une datos con " y " usa `yE()`.
- Correlación no es causalidad: los cruces y artículos lo dicen siempre, con sus límites ("Qué no dice este dato").

## Temas sensibles (suicidio)

- Nunca usar ni mostrar las columnas de modalidad, lugar u hora de la base SAT del SNIC. Solo año, edad y sexo.
- Las líneas de ayuda (135 desde CABA y GBA, (011) 5275-1135 desde todo el país, 107 en emergencias) van justo antes de la primera ficha que muestra suicidios, al final de Salud.
- Sin rankings, cifra destacada, juegos ni lenguaje dramático. Las tasas de suicidio no entran en el perfil provincial, Cruces, "En cifras" ni artículos. Aclarar que el SNIC es un registro policial y que la DEIS usa otra metodología.

## Diseño (resumen; completo en `.claude/rules/visualizaciones.md`)

- Roboto Flex con reemplazos medidos (Roboto, Verdana). Nada de serif ni Arial. Roboto Mono para etiquetas. La bajada de cada página, en Roboto Flex 340 con su propio reemplazo (`--f-bajada`).
- Colores de la bandera sobre fondo blanco: celeste (`--celeste`, `--celeste-fuerte`) y el amarillo del Sol de Mayo (`--sol`). Nada de azul marino. Solo modo claro. Violeta solo para la OCDE. Verde y rojo solo para cambios buenos o malos indiscutidos.
- Todo valor sale de `:root` en `datina.css` (colores, letra, espacios, radios, sombras, duraciones). Espacios en la escala del autor (4, 8, 12, 16, 24, 32, 48, 72, 96 y 144) con tres ritmos: dentro de un componente, entre bloques (`--bloque`, de 24 a 40) y entre capítulos (`--capitulo`, de 48 a 72, solo donde cambia el tema de la página). El autor pidió el 10 de octubre de 2026 menos espacio en blanco: lo que va junto, junto. Ninguna animación de interfaz pasa de 300 ms. Respetar movimiento reducido.
- Las secciones se ordenan en grupos y categorías que salen de `GRUPOS` en `03_construir_sitio.py`: la barra (los cuatro grupos, cada uno con su menú, y "Más"), migas, pie, portada y recorrido. Barra y portada usan siempre el mismo orden y los mismos nombres.
- Seis tipos de botón y nada más. Sin viñetas. Sin flechas decorativas.
- La provincia se elige solo en `provincia.html`.
- Accesibilidad: foco visible, teclado completo, contraste 4,5 a 1, "Ver tabla" como alternativa a los gráficos, nada que dependa solo del mouse.
- Cambios visuales que el autor no aprobó explícitamente: consultarlos antes.

## Errores que ya pasaron (no repetir)

- Ids y claves repetidas: antes de sumar un id, una clave o un alias, buscar si ya existe (en la etapa 25 una ficha pisó a otra).
- Nombres auxiliares cortos en `02_procesar.py` (`_pv`, `_nq`, `_pr`) pisaron otros: usar un prefijo propio del bloque y buscar antes.
- En `datina.js`, `TX` y `LEAD` se evalúan al cargar y solo pueden usar lo definido antes en el archivo.
- Al editar con Python desde la terminal, las barras invertidas pueden llegar cambiadas: escribir el script en un archivo. En Windows, `Path.write_text` escribe CRLF: en archivos con LF, leer y escribir bytes.
- Las páginas armadas en `sitio/` del repositorio tienen finales CRLF (se arman en Windows): armar en Linux cambia todas las líneas. Si solo cambió eso, no subirlo.

## Publicación

Netlify toma la carpeta `sitio/`. La actualización del día 5 republica sola cuando el repositorio está conectado. Cambios de infraestructura, DNS, servidores o secretos: siempre con revisión del autor, nunca desde un agente.
