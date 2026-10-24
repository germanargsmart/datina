# Plan de estabilización (Fase 1A)

Auditoría técnica del 22 de octubre de 2026. Solo lectura: no se cambió código ni datos.

## Estado al 24 de octubre de 2026

| Problema | Estado |
|---|---|
| P0-1 (D3 desde cdnjs) | Resuelto: D3 y topojson desde el propio sitio, las fichas visibles si el arranque se corta (commit 7cd2124) |
| P1-1 (ramas desalineadas) | Resuelto: el autor unió a `main` el PR #3 y el de estabilización y producción (#5) el 23 de octubre. Los PR #2 y #4 se cerraron sin unir, con lo rescatable anotado en cada uno |
| P1-2 (la actualización del 5 de noviembre sobre `main`) | La corrida a mano sobre `main` del 23 de octubre (26) bajó todo y se cortó al empezar 02: el SNIC publicó `snic_provincias.csv` en Windows-1252 y antes lo hacía en UTF-8. Arreglado el 24 de octubre en el PR #6 (02 lee los CSV del SNIC en las dos codificaciones). Hay que unir el PR #6 antes del 5 de noviembre: si no, la actualización de ese día se corta igual |
| P1-3 (`pobreza/dist` vieja) | Resuelto: copia solo con `--con-pobreza` (3f33046). El consultor se rearmó el 23 de octubre y otra vez el 24 (ícono de la pestaña) |
| P1-4 (finales de línea) | Resuelto: LF en todo lo que escriben 02 y 03, y `.gitattributes` |
| P1-5 (versiones sin fijar) | Resuelto: `requirements.txt` con las versiones de la última corrida en verde. La corrida 26 las instaló bien |
| P2-1 (orden inestable en 02) | Resuelto: orden estable en las tres tablas. Las guardadas pasan al orden nuevo con la próxima actualización |
| P2-2 (documentos con números viejos) | Resuelto |
| P2-3 (03 deja `sitio/` a medias si frena) | Resuelto el 24 de octubre: `scripts/respaldo_sitio.py` guarda una copia de `sitio/` antes de escribir y la repone si el armado no llega a "Listo" |
| P2-4 (workflow) | Resuelto: concurrency, límite de dos horas, versión de Chrome y `git pull --rebase` antes de subir |
| P2-5 (PDF de reservas en el repositorio) | Pendiente: decisión del autor |
| P2-6 (tablas que 02 deja de armar) | Resuelto el 24 de octubre con un mensaje: el error del catálogo por una tabla sin uso dice que, si 02 ya no la arma, hay que borrar ese archivo. No se borra nada solo, así una tabla que falta por error sigue frenando el armado |
| P2-7 (`fichas.json` publicado sin uso) | Pendiente: decisión del autor (ofrecerlo como descarga o sacarlo de `sitio/`) |
| P2-8 (`re.sub` con argumentos sin nombre) | Resuelto el 24 de octubre: el armado corre sin avisos de Python aun con los avisos convertidos en errores |
| P2-9 (función interna de `ssl` en 01) | Cubierto por la versión fija de Python: la actualización mensual usa Python 3.12 (`actualizar.yml`), que la tiene. Si una versión nueva la saca, los servidores sin certificado intermedio fallan con un aviso y conservan su archivo anterior, sin cortar la actualización. Al subir de versión de Python, revisarlo |
| P2-10 (avisos de pandas por fechas) | Resuelto el 24 de octubre: las filas de la Encuesta de Supermercados se eligen por el tipo de celda |
| P2-11 (navegación) | Resuelto en la Fase 2 (`docs/rediseno_fase2.md`) |
| P2-12 (consultor de pobreza) | En parte: el enlace de vuelta va a Pobreza y hogares y, desde el 24 de octubre, tiene el ícono de la pestaña (ya no hay error en la consola). `./diccionario` sin `.html` anda en Cloudflare, que saca las extensiones. Quedan `lang="es-AR"` (el resto del sitio usa `es`) y Open Graph |
| P2-13 (peso del repositorio) | Pendiente: decisión del autor (dónde guardar `datos/crudo/`) |
| P2-14 (paquetes y ruta de Chrome de los programas de una sola vez) | Resuelto el 24 de octubre: `requirements-extra.txt` y la variable `CHROME` en `banderas.py` e `iconos_isometricos.py` |
| P2-15 (restos en la computadora del autor) | Pendiente: limpieza en la computadora del autor |
| P2-16 (fichas sin "Ver tabla") | Resuelto en la Fase 2, paso 5 |
| P2-17 (un error en un gráfico o un artículo corta todo) | Resuelto el 24 de octubre: cada gráfico y cada artículo protegido, con su aviso, y el error sigue en la consola (la prueba de páginas no deja publicar) |
| P2-18 ("Probá de nuevo" no vuelve a intentar) | Resuelto el 24 de octubre: las cargas que fallan se olvidan, y la OCDE y el mapa de departamentos avisan |
| P2-19 (Explorador sin D3) | Resuelto el 24 de octubre: muestra su aviso de error |
| P2-20 (SRI y dos versiones de D3) | Resuelto con P0-1: D3 y topojson desde el sitio. El consultor baja DuckDB de jsDelivr desde el 23 de octubre (por el límite de Cloudflare) |
| Fuera del plan: 320 píxeles | Resuelto el 24 de octubre: siete páginas y el Explorador se corrían de costado en 320 píxeles (WCAG 1.4.10). Ahora ninguna, en 320, 360 y 390 (`scripts/prueba_320.mjs`). Los arreglos de P2-17 a P2-19 se prueban con `scripts/prueba_fallas.mjs` |
| Sección 7 y paso 8 (publicación) | El autor eligió Cloudflare Pages en lugar de Netlify: `docs/deploy/CLOUDFLARE.md`. Conectarlo lo hace el autor |

## 1. Alcance y método

- **Versión auditada:** la rama `claude/focused-cerf-tn93c3` (PR #3, en borrador), commit 333dede. Es la más nueva y la que va a pasar a `main`. Elegida por el autor.
- **Comparada con:** `main` (b481f1b, 14 de octubre), que es lo que se publicaría hoy, y la copia de la computadora del autor (32b1b4a, 11 de octubre).
- **Cómo:** se sacó una copia del commit 333dede a una carpeta temporal con `git archive`, se leyó el código y se corrieron ahí el armado y las pruebas. Otra copia aparte se usó para correr `02_procesar.py` y `03_construir_sitio.py` y comparar el resultado con lo guardado en el repositorio. Con un programa propio (que usa `scripts/cdp.mjs`) se abrieron `trabajo.html` y `a-milei-empleo.html` en Chrome con y sin acceso a cdnjs. El repositorio del autor no se tocó.
- **Entorno de las pruebas:** Windows 11, Python 3.12.10, pandas 3.0.6, numpy 2.5.3, Node 24.19.0, Google Chrome instalado. El servidor de GitHub Actions usó pandas 3.0.6 y numpy 2.5.4 en su última corrida verde (14 de octubre).
- **No se corrió:** `01_descargar.py` (baja cientos de MB, necesita aprobación), `npm run build` del consultor de pobreza, `scripts/linea_base.mjs` ni nada en Netlify (el repositorio nunca se conectó).

## 2. Resumen ejecutivo

- **Hoy el sitio funciona.** En la rama del PR #3 el sitio se arma sin errores, las siete comprobaciones de Python pasan, la sintaxis de `datina.js` está bien, la prueba en Chrome da "Todo en orden" en 51 páginas, no hay enlaces internos rotos ni anclas que no existan (628 enlaces con ancla revisados), no falta ningún archivo de datos de los 229 que se piden, y las huellas `?v=` coinciden con el contenido de cada archivo. Rearmar el sitio desde las fuentes reproduce lo guardado byte por byte, salvo los finales de línea.
- **Un P0: el sitio entero depende de que D3 llegue desde cdnjs.** Probado en Chrome: con cdnjs bloqueada, `datina.js` se corta en la línea 68, `trabajo.html` deja invisibles sus 5 fichas, sin textos ni gráficos, el menú "Más" no abre y un artículo queda vacío. Hoy no pasa porque cdnjs responde, pero alcanza con que esa CDN falle o que una red la bloquee (ya pasó en las sesiones en la nube).
- **Los demás problemas importantes son de proceso, no de código:**
  1. Hay tres versiones del sitio que no coinciden: `main` (lo que se publicaría) no tiene 124 commits del PR #3, el PR #4 rehace en paralelo una función que el PR #3 ya tiene y toca los mismos archivos, y la copia de la computadora del autor está 87 commits atrás.
  2. La actualización automática del 5 de noviembre corre sobre `main`, que no tiene los arreglos de descarga y de la prueba en Chrome del 12 al 14 de octubre.
  3. En la computadora del autor hay una carpeta `pobreza/dist` del 28 de septiembre: si se arma el sitio ahí, el constructor reemplaza el consultor de pobreza publicado por esa versión vieja.
  4. Los finales de línea: los documentos dicen CRLF, el repositorio está en LF, y armar en Windows reescribe 57 archivos de `sitio/` (y `02_procesar.py`, 203 archivos de datos) solo por eso.
  5. Las versiones de los paquetes de Python no están fijas y la actualización mensual instala lo último cada vez.
- **Nunca se publicó en Netlify**, así que los formularios (contacto y suscripción), la página 404 automática y las cabeceras de caché no se pudieron comprobar. Quedan en "Qué falta verificar".

## 3. Cómo se arma el sitio (proceso real)

### 3.1 Qué es fuente y qué es generado

| Tipo | Archivos | Quién lo escribe |
|---|---|---|
| Fuente, a mano | `scripts/plantilla.html`, `scripts/datina.css`, `scripts/datina.js`, `scripts/relaciones.{html,css,js}`, `scripts/*.py`, `scripts/*.mjs`, `datos/manual/**` (JSON, CSV, banderas, íconos), `netlify.toml`, `.github/workflows/actualizar.yml`, `pobreza/src/**` | El autor o los agentes |
| Fuente, descargada | `datos/crudo/**` (193 archivos, 95 MB) y `datos/crudo/_registro.csv` | `01_descargar.py` |
| Fuente, armada una vez | `datos/manual/censo2022_*.csv`, `banderas/`, `iconos_iso/`, `*_provincias.csv` de presupuesto, `presidenciales_provincia.csv`, `diputados/senadores_nacionales.csv`, `cammesa_demanda_2014_2022.csv`, `combustibles_2004_2023.csv` y `sitio/datos/*.topo.json` | Los programas de una sola vez (`censo_2022*.py`, `banderas.py`, `iconos_isometricos.py`, `geometria_*.py`, `*_presupuesto.py`, `legisladores/build.py`, etc.) |
| Generado | `datos/ordenado/tabla_larga.csv`, `sitio/datos/*.csv`, `sitio/datos/fichas.json` y otros JSON de datos | `02_procesar.py` (02:6017, 6217, 6652 y otras) |
| Generado | `sitio/*.html` (52 páginas), `sitio/datina.css`, `sitio/datina.js`, `sitio/datos/fichas.js`, 44 tablas diferidas `sitio/datos/*.json`, `sitio/datos/banderas/`, `sitio/datos/tabla_larga.csv`, `sitio/relaciones.*`, `sitio/datos/relaciones.json`, `sitio/emprendedores.html` (redirección) | `03_construir_sitio.py` (con `relaciones.py` y `catalogo.py`) |
| Generado aparte, guardado a mano | `sitio/pobreza/**` (74 archivos, 87 MB, incluye DuckDB en WebAssembly) | `npm run build` en `pobreza/` en la computadora del autor. Ni 03 ni el workflow lo arman. 03 lo copia solo si existe `pobreza/dist` (03:977-980) |

### 3.2 Orden y qué hace cada paso

1. `python scripts/01_descargar.py`: baja cada fuente a `datos/crudo/`. No escribe en `datos/manual/` ni en `sitio/`. Nunca termina con error por una fuente caída: captura la excepción y deja el archivo anterior (01:2430-2444). Valida el contenido solo de los archivos que están en `VALIDA` (01:614-616).
2. `python scripts/02_procesar.py`: lee `datos/crudo/`, `datos/manual/`, `pobreza/datos/crudo/ALL.json` y `sitio/datos/departamentos.topo.json`. Escribe `datos/ordenado/tabla_larga.csv` y todo `sitio/datos/*.csv` y `fichas.json`. No usa la red. No borra archivos viejos.
3. `python scripts/pruebas_datos.py`: solo lee. Si hay un hallazgo sin motivo en `ACEPTADAS`, frena.
4. `python scripts/03_construir_sitio.py`: vuelve a correr `pruebas_datos` (03:19), arma todo `sitio/` (lista de 3.1), corre `prueba_relaciones`, `relaciones`, `catalogo`, `prueba_metadatos` y `prueba_encabezados` como funciones (no como programas aparte). Borra y no vuelve a escribir `sitemap.xml` y `robots.txt` mientras `datos/manual/sitio.json` no tenga dirección (03:1010-1015). La huella `?v=` es `sha1(contenido)[:10]` (03:23).
5. `node scripts/prueba_paginas.mjs`: levanta un servidor propio en 127.0.0.1, abre cada página en Chrome sin ventana y busca errores, NaN, undefined, `{{` sin reemplazar y "En cifras" incompleta. Solo lee.
6. El workflow `actualizar.yml` (día 5 a las 12 UTC, y a pedido) hace 1 a 5 en `ubuntu-24.04`, después `git add -A`, commit y `git push` a la rama donde corrió. El `schedule` corre siempre sobre `main`.

### 3.3 Qué se publica

`netlify.toml` (raíz) publica la carpeta `sitio/` sin comando de armado: Netlify sirve lo que está guardado en el repositorio. Fija caché de un año (`immutable`) para `datina.css`, `datina.js`, `datos/fichas.js` y cuatro JSON. Todos se piden con su huella, así que un cambio llega igual. `pobreza/netlify.toml` es para un sitio de Netlify aparte con carpeta base `pobreza/` (no se pudo comprobar si existe): no afecta al sitio principal, pero sus reglas de caché para `/_npm/*` y `/_file/*` tampoco se aplican a `/pobreza/_npm/*`.

## 4. Consistencia: qué se revisó y qué dio

| Tema | Resultado | Evidencia |
|---|---|---|
| Barra, menús de grupo, "Más" y pie | Iguales en las 50 páginas de la plantilla (portada, secciones, 18 artículos, catálogo, contacto y 404). `relaciones.html` tiene una barra simplificada a propósito (relaciones.py:334-339). `sitio/pobreza/` tiene su propia cabecera | Comparación de las 52 páginas |
| Nombres | La categoría "Economía" del menú lleva a `economia.html`, que se llama "Precios y actividad" en su título, en "Más", en el pie y en las píldoras | `03_construir_sitio.py:439`, `sitio/economia.html:6` |
| Listas de herramientas | Tres listas distintas: "Más" tiene el Catálogo y no Artículos, el pie no tiene el Catálogo en Herramientas (va en "Los datos"), las píldoras no tienen Tu provincia ni Relaciones | `sitio/index.html:62` y `:214`, `sitio/trabajo.html:98` |
| CSS y JS | Todas las páginas piden la misma versión de cada archivo (`datina.css?v=a5d876196a`, `datina.js?v=eab6e89474`, `fichas.js?v=db97a0853f`). Rutas relativas. Las huellas coinciden con el sha1 del contenido | Recuento sobre las 52 páginas |
| Plantillas y páginas generadas | Rearmar con 03 da los mismos 57 archivos, idénticos salvo los finales de línea | Comparación byte a byte tras normalizar CRLF |
| Enlaces internos y anclas | 0 enlaces a archivos que no existen, 0 anclas sin destino. También coinciden los 375 destinos del buscador, las 136 fichas con "De dónde sale" y los 205 "En el catálogo" | Revisión propia y `prueba_metadatos.py` |
| 404 | Usa `<base href="/">`, carga estilos y código, tiene la barra completa y `noindex`. Funciona en cualquier profundidad de dirección si el sitio está en la raíz del dominio | `sitio/404.html:4-5` |
| Redirección vieja | `emprendedores.html` lleva a `empresas.html` con JavaScript y `meta refresh` | `03_construir_sitio.py:965-972` |
| Recursos externos | Google Fonts (51 páginas), D3 7.8.5 de cdnjs (51), topojson-client 3.1.0 de jsDelivr (50). Versiones fijas, sin `integrity` (SRI). El consultor de pobreza trae su propio D3 7.9.0 y DuckDB desde `sitio/pobreza/_npm/` | Recuento sobre las páginas |
| Formularios | Contacto: envío común a Netlify Forms (`data-netlify`, `form-name`, campo trampa). Suscripción en el pie de todas las páginas: `fetch("/")` por POST (datina.js:7962). En `relaciones.html`, que no carga `datina.js`, la suscripción se envía de forma común y la página cambia | `sitio/contacto.html:85`, `sitio/index.html:206` |
| Metadatos | Las 51 páginas con plantilla tienen `title`, descripción, `lang="es"`, Open Graph y Twitter (menos la 404, a propósito). Faltan `og:image`, canonical absoluto, `sitemap.xml` y `robots.txt`: esperan la dirección definitiva en `datos/manual/sitio.json` | `03_construir_sitio.py:850-877` |
| Descargas | Existen los 229 archivos `datos/…` que piden `datina.js`, la plantilla y las páginas, las 44 tablas diferidas (`.json` y `.csv`), las 25 banderas y los 205 CSV del catálogo | Recuento sobre `scripts/datina.js`, `scripts/plantilla.html` y `sitio/` |
| Fichas | 143 fichas, cada una en una sola página, sin ids repetidos (el constructor frena si los hay, 03:30-32 y 500-506). 5 no ofrecen "Ver tabla" porque su tabla no está en `fichas.js`: `f-mapa`, `f-legisladores`, `f-votaciones`, `f-votaciones-espacios` y `f-ministros` | `scripts/datina.js:6290-6295` |
| Artículos | Coinciden las 18 notas de la plantilla, los 18 `a-*.html`, el índice y la lista de `datina.js`. El texto de cada artículo y la lista de `articulos.html` los arma `datina.js` en el navegador: el HTML trae la nota vacía | `sitio/a-milei-empleo.html`, `scripts/datina.js:7189-7196`, `:7537` |
| Herramientas | Cruces, Tu índice, Diagnóstico, Departamentos, Tu provincia, Laboratorio, Catálogo y Explorador guardan su estado en la dirección (`?cx`, `?ix`, `?dx`, `?prov`, `?q`, `?n`…). Solo Tu provincia usa el almacenamiento del navegador, dentro de un `try`. Todas piden datos con `fetch` o `d3.json`, así que necesitan un servidor | `scripts/datina.js:1407-1417`, `:5088-5096`, `scripts/relaciones.js:28-29` |
| Consultor de pobreza | DuckDB y los Parquet se sirven desde `sitio/pobreza/` (no de una CDN) y DuckDB se baja recién al abrir el editor de SQL. Necesita un servidor que mande `.wasm` y `.js` con su tipo correcto. No necesita cabeceras especiales (COOP o COEP) | `sitio/pobreza/index.html:96-99`, `:622-623` |

## 5. Problemas encontrados

Prioridades: **P0** rompe la web o impide publicarla. **P1** inconsistencia funcional o problema importante. **P2** menor o mejora posterior. "Verificado" quiere decir que se vio en el archivo o se midió. "Probable" quiere decir que hay evidencia pero falta una prueba.

### P0

| Id | Problema | Archivos | Riesgo | Solución propuesta | Estado |
|---|---|---|---|---|---|
| P0-1 | Todo `datina.js` depende de D3 de cdnjs y no tiene red de seguridad. Marca la página como lista en la línea 10 (con eso `datina.css:940` oculta las fichas) y usa `d3` sin comprobarlo en la línea 68. Las fichas recién se muestran cuando las ve un observador que se arma en la línea 7878, y los textos de las fichas (`LEAD`, `TX`), los menús, el buscador y los artículos se arman en el medio. No hay `try` que lo contenga | `scripts/datina.js:10`, `:68`, `:296`, `:795`, `:7878`, `scripts/datina.css:940-942`, `scripts/plantilla.html:20-21` | Si cdnjs falla o está bloqueada, las páginas probadas (una sección y un artículo) quedan con la barra y el pie y nada más útil: fichas invisibles, sin textos ni gráficos, menús que no abren. Por el código, pasa lo mismo en toda página que carga `datina.js` (50 de 52) | Servir `d3.min.js` 7.8.5 y `topojson-client.min.js` 3.1.0 desde `sitio/` con huella (la prueba de páginas ya sabe usar copias locales con `DATINA_LIBS`). Además, si el arranque de `datina.js` falla, sacar la clase `listo` para que las fichas se vean. Sumar a la prueba de páginas una corrida con cdnjs bloqueada | Probado en Chrome: con cdnjs bloqueada, `trabajo.html` da 5 de 5 fichas invisibles, 5 de 5 textos vacíos, 0 gráficos, "Más" no abre, y el error `d3 is not defined` en `datina.js:68`. Sin bloquear, todo bien |

El punto P1-2 puede sumar un segundo P0 el 5 de noviembre si la actualización falla: el sitio seguiría en pie, pero sin los datos del mes.

### P1

| Id | Problema | Archivos | Riesgo | Solución propuesta | Estado |
|---|---|---|---|---|---|
| P1-1 | Ramas desalineadas: a `main` le faltan 124 commits del PR #3 (204 archivos distintos). El PR #4 (borrador) rehace "cifra y texto sin repetir", que el PR #3 ya tiene, y toca `scripts/datina.js`, `scripts/datina.css`, `scripts/prueba_paginas.mjs` y todas las páginas. El PR #2 (borrador) tiene 3 commits que no están en el PR #3: uno quedó reemplazado (la tabla del Explorador de a 40 filas, contra la de a 30 del PR #3) y los otros dos (auditoría del catálogo en `datos/manual/relaciones.json` y `EXPLORADOR.md`, y el estado en el enlace) necesitan que el autor los mire. La copia del autor está 87 commits atrás | Ramas `main`, `claude/focused-cerf-tn93c3`, `claude/hopeful-curie-3rki8g`, `claude/awesome-cannon-dkbl1m` | Publicar `main` hoy publica una versión sin el catálogo, los h1 ni los metadatos. Unir el PR #3 y el #4 da conflictos en decenas de páginas generadas | El autor revisa y une el PR #3. Después decide qué conservar del #4 y del #2 y los cierra o los rehace sobre `main`. Los conflictos en `sitio/` no se resuelven a mano: se vuelve a armar | Verificado (`git log`, `gh pr list`) |
| P1-2 | La actualización del 5 de noviembre corre el código de `main`, que no tiene los arreglos del 12 al 14 de octubre: planillas del SSPMI en su dirección nueva (200af21), reservas (d356acf), API de Series de Tiempo (90775bb) y el minuto de espera para Chrome (70a0a75). El 12 de octubre, antes de esos arreglos, fallaron tres corridas en la rama del PR #3 (formato inesperado en 4 planillas, `IndexError` en 02, "Chrome no respondió") | `.github/workflows/actualizar.yml`, `scripts/01_descargar.py`, `scripts/cdp.mjs` en `main` | Si falla, no se publican los datos del mes. Si pasa, sube a `main` un commit de datos que choca con el PR #3 | Unir el PR #3 antes del 5 de noviembre. Si no se llega, correr el workflow a mano sobre `main` antes de esa fecha o pausar el `schedule` (decisión del autor) | Probable: las fallas del 12/10 están verificadas en GitHub Actions, la del 5/11 no se puede probar sin descargar |
| P1-3 | `03_construir_sitio.py` borra `sitio/pobreza/` y copia `pobreza/dist` si esa carpeta existe. En la computadora del autor hay una del 28 de septiembre, anterior a los cambios del consultor del 11 de octubre (contraste y foco) y del 13 (DuckDB se baja solo al abrir el editor de SQL) | `scripts/03_construir_sitio.py:977-980`, `pobreza/dist` (local, ignorada por git) | Un armado en la computadora del autor vuelve el consultor a la versión vieja sin avisar, y se sube con el commit siguiente | Copiar `pobreza/dist` solo con una opción explícita (por ejemplo `--con-pobreza`) y avisar en pantalla. Con aprobación del autor, borrar la `pobreza/dist` vieja. Anotar en `pobreza/README.md` cuándo y cómo se rearma | Verificado por contenido: a la `pobreza/dist` local le faltan los 6 JSON de la consulta guiada (`_file/data/*.json`), tiene otro `client.js`, y su `index.html` y `diccionario.html` son distintos de los publicados |
| P1-4 | Finales de línea: el repositorio guarda `sitio/` y `datos/` en LF, pero `CLAUDE.md:91` y `.claude/rules/pruebas.md:22` dicen CRLF. En Windows, 03 escribe con CRLF (`write_text` sin `newline`) y reescribe 57 archivos. 02 reescribe 203 CSV. No hay `.gitattributes` | `scripts/03_construir_sitio.py` (`write_text` en 482, 486, 529, 530, 910, 967 y en `relaciones.py`), `scripts/02_procesar.py` (`to_csv`), `CLAUDE.md`, `.claude/rules/pruebas.md` | Diffs de cientos de archivos sin cambios reales, commits ruidosos, conflictos con los commits del workflow (que arma en Linux) | Escribir siempre con `\n` en 02 y 03, agregar `.gitattributes` para `sitio/` y `datos/`, y corregir los dos documentos | Verificado (medido en las dos copias) |
| P1-5 | Dependencias sin versión fija: `requirements.txt` pide `pandas>=2.0`, `openpyxl>=3.1`, `pyreadstat>=1.2`, `xlrd>=2.0`, `pdfplumber>=0.11`, sin tope. El workflow instala lo último cada mes | `requirements.txt` | Una versión nueva de pandas o numpy puede romper la actualización mensual sin que cambie el código | Fijar las versiones que usó la última corrida verde (pandas 3.0.6, numpy 2.5.4, openpyxl 3.1.5, pyreadstat 1.3.6, xlrd 2.0.2, pdfplumber 0.11.10) y subirlas a propósito | Verificado (registro de la corrida del 14/10). Riesgo, no una falla observada |

### P2

| Id | Problema | Archivos | Solución propuesta | Estado |
|---|---|---|---|---|
| P2-1 | `02_procesar.py` no da siempre lo mismo: con los mismos datos crudos y la misma versión de pandas, `fiscal_provincias.csv`, `regalias_provincias.csv` y `nombres_top.csv` salen con las filas en otro orden (`sort_values` sin orden estable ni desempate). Otros cinco cambian con la fecha del día (años en el Congreso, en la Corte, días de mandato) | `scripts/02_procesar.py:946`, `:1868`, `:2368` y los cálculos con la fecha de hoy | Orden estable con desempate por código de provincia. Documentar qué archivos dependen de la fecha de armado | Verificado (02 corrido en la copia aparte) |
| P2-2 | Documentos con números viejos: `pruebas.md` dice 23 secciones y 50 páginas, `RUNBOOK.md` dice 47, `CLAUDE.md` habla de CRLF. Hoy: 25 secciones, 18 artículos, 52 páginas en `sitio/`, 51 revisadas por la prueba en Chrome, 118 hallazgos explicados | `.claude/rules/pruebas.md:18-22`, `docs/deploy/RUNBOOK.md:14`, `CLAUDE.md:91` | Poner la línea de base medida en esta auditoría | Verificado |
| P2-3 | Si 03 frena tarde (catálogo, relaciones, metadatos, encabezados), ya escribió parte de `sitio/` y no lo deshace | `scripts/03_construir_sitio.py:302`, `:523`, `:998`, `:1001`, `:1020`, `:1025` | Correr esas comprobaciones antes de escribir, o armar en una carpeta temporal y mover al final. En el workflow no pasa nada porque no se sube | Verificado en el código |
| P2-4 | El workflow no tiene `concurrency` ni `timeout-minutes`, hace `git push` sin traer antes lo remoto, y depende de que Chrome venga instalado en la máquina de GitHub | `.github/workflows/actualizar.yml` | Agregar las tres cosas y un paso que muestre la versión de Chrome | Verificado |
| P2-5 | `git add -A` del workflow sube al repositorio los PDF de `datos/crudo/planilla_revisar/` que guarda 01 cuando no puede leer una planilla de reservas. Guardarlos es a propósito (para ajustar el lector, pedido del 12 de octubre), pero no está decidido si deben quedar en el repositorio | `.github/workflows/actualizar.yml:34`, `scripts/01_descargar.py:2268-2328`, `.gitignore` | Decisión del autor: dejarlos, o guardarlos como adjunto de la corrida y sumarlos a `.gitignore` | Verificado en el código |
| P2-6 | 02 no borra los CSV que deja de producir. `catalogo.py` exige que cada CSV publicado tenga uso, así que una tabla retirada frena el armado hasta borrarla a mano | `scripts/02_procesar.py`, `scripts/catalogo.py:205`, `:218` | Lista de tablas retiradas o limpieza controlada | Probable (inferido del código) |
| P2-7 | `sitio/datos/fichas.json` (10,8 MB) se publica pero ninguna página ni el catálogo lo usan. Lo lee solo el constructor | `sitio/datos/fichas.json` | Decidir si se ofrece como descarga o se deja fuera de `sitio/` | Verificado |
| P2-8 | `re.sub` con el cuarto argumento sin nombre: aviso de Python 3.13 que en versiones futuras será error | `scripts/03_construir_sitio.py:682`, `:945`, `:947` | Pasar `count=1` | Verificado |
| P2-9 | 01 usa una función interna de Python (`ssl._ssl._test_decode_cert`) que puede desaparecer en una versión nueva | `scripts/01_descargar.py:37` | Reemplazarla o fijar la versión de Python | Verificado |
| P2-10 | Avisos de pandas por fechas sin formato en supermercados | `scripts/02_procesar.py:4966`, `:4976` | Pasar el formato a `pd.to_datetime` | Verificado (registro de GitHub Actions) |
| P2-11 | Navegación: "Economía" contra "Precios y actividad", tres listas de herramientas distintas, `relaciones.html` sin "Más" ni buscador | Ver sección 4 | Decisión del autor: un solo nombre y una sola lista que salgan de `GRUPOS` | Verificado |
| P2-12 | Consultor de pobreza: el enlace `./diccionario` no lleva `.html` (necesita direcciones "lindas" de Netlify), el enlace a Datina se corrige con JavaScript al cargar, usa `lang="es-AR"` y no tiene Open Graph | `sitio/pobreza/index.html:66-70`, `:699` | Ajustar `pobreza/observablehq.config.js` o el parche que ya aplica 03 (03:983-990) | Verificado |
| P2-13 | Peso del repositorio: 145 MB comprimido, 228 MB en la última versión (95 MB de `datos/crudo/`, 73 MB de DuckDB en WebAssembly). `datos/crudo/` crece con cada actualización | `datos/crudo/`, `sitio/pobreza/_npm/` | Medir el crecimiento mensual y decidir si los crudos van a otro lugar (por ejemplo, adjuntos de una versión de GitHub) | Verificado |
| P2-14 | Faltan en `requirements.txt` los paquetes de los programas de una sola vez (`requests`, `beautifulsoup4`, `pyarrow`), y `banderas.py` e `iconos_isometricos.py` tienen la ruta de Chrome de Windows escrita | `scripts/ejecutivo/`, `scripts/legisladores/`, `pobreza/scripts/exportar_parquet.py`, `scripts/banderas.py:14`, `scripts/iconos_isometricos.py:24` | Un `requirements-extra.txt` y usar la variable `CHROME` como `cdp.mjs` | Verificado |
| P2-15 | Restos locales: tres carpetas de trabajo en `.claude/worktrees/` y ramas locales viejas | Copia del autor | Limpiar con aprobación del autor | Verificado |
| P2-16 | 5 fichas sin "Ver tabla", que `CLAUDE.md` pide como alternativa a los gráficos (tienen "Descargar CSV") | `scripts/datina.js:6293-6295`, fichas `f-mapa`, `f-legisladores`, `f-votaciones`, `f-votaciones-espacios`, `f-ministros` | Que "Ver tabla" también acepte las tablas que se piden aparte (`departamentos`, `legisladores_por_periodo`, `votaciones_leyes_clave`, `ministros_nacionales`) | Verificado (recuento de las 143 fichas). Resuelto el 23 de octubre de 2026 en la Fase 2, paso 5 (`docs/rediseno_fase2.md`) |
| P2-17 | Un error en un gráfico o en un artículo corta todo lo que sigue: `dibujarTodo` no protege cada gráfico y los 14 artículos se calculan al cargar cualquier página. Hoy la prueba en Chrome del workflow lo frena antes de publicar | `scripts/datina.js:4951`, `:7189`, `:8251` | Un `try` por gráfico y calcular cada artículo solo en su página | Verificado en el código |
| P2-18 | "Probá de nuevo" en "Ver tabla" no vuelve a intentar: la carga fallida queda guardada hasta recargar la página. Algunas cargas no avisan si fallan (la comparación con la OCDE y el mapa de departamentos quedan esperando) | `scripts/datina.js:49`, `:6309-6311`, `:5064`, `:5529` | Borrar la promesa fallida y usar el aviso `sinDatos` que ya existe | Verificado en el código |
| P2-19 | El Explorador de relaciones sale en silencio si no llegó D3 | `scripts/relaciones.js:8` | Mostrar el aviso `#rx-error` que ya existe | Verificado |
| P2-20 | Sin SRI (`integrity`) en D3 y topojson, y dos versiones de D3 (7.8.5 en el sitio, 7.9.0 en el consultor) | `scripts/plantilla.html:20-21`, `sitio/pobreza/_npm/` | Se resuelve con P0-1 si las copias pasan a ser locales | Verificado |

## 6. Comandos verificados

Medidos el 22 de octubre de 2026 sobre la copia del commit 333dede (sección 1).

| Comando | Qué hace | ¿Escribe? | Resultado | Tiempo |
|---|---|---|---|---|
| `python scripts/pruebas_datos.py` | Pruebas de los datos | No | 0 hallazgos sin explicar, 118 explicados | 6 s |
| `python scripts/02_procesar.py` | Arma las tablas desde `datos/crudo/` | Sí: `datos/ordenado/`, `sitio/datos/` | Termina bien, sin red. En Windows, 211 archivos distintos de los guardados: 203 solo por los finales de línea, 5 por la fecha del día, 3 por el orden de las filas | 106 s |
| `python scripts/03_construir_sitio.py` | Arma `sitio/` y corre las comprobaciones de relaciones, catálogo, metadatos y encabezados | Sí: `sitio/` | "Listo: sitio/index.html, 25 paginas de seccion y 18 articulos". En Windows reescribe 57 archivos, idénticos salvo los finales de línea | 18 s |
| `python scripts/prueba_encabezados.py -v` | Un h1 por página | No | "Encabezados en orden", con avisos de salto de h1 a h3 ya aceptados | 1 s |
| `python scripts/prueba_metadatos.py` | Metadatos y enlaces internos | No | 52 páginas, en orden | menos de 1 s |
| `python scripts/relaciones.py` | Valida el catálogo del Explorador | No (solo al llamarlo desde 03) | 43 fuentes, 162 conjuntos, 281 relaciones con evidencia | menos de 1 s |
| `python scripts/prueba_relaciones.py` | Rompe el catálogo de 18 formas y controla que se detecte | No | 18 casos detectados, catálogo real sin errores | 1 s |
| `python scripts/catalogo.py` | Cada tabla publicada con su uso | No (solo al llamarlo desde 03) | 205 tablas con uso, 3 de suicidio afuera | 1 s |
| `node -e "new Function(require('fs').readFileSync('sitio/datina.js','utf8'))"` | Sintaxis | No | Bien (también `relaciones.js`) | menos de 1 s |
| `node scripts/prueba_paginas.mjs` | Cada página en Chrome sin ventana | No (perfil temporal de Chrome que borra al final) | 51 páginas, "En cifras" en 19 secciones sin provincia y con 2 provincias, "Todo en orden" | 4 min 5 s |
| Prueba propia con cdnjs bloqueada (no está en el repositorio) | `trabajo.html` y un artículo en Chrome, con y sin cdnjs | No | Ver P0-1 | 30 s |

**Prerrequisitos**

- Python 3.12 con `pip install -r requirements.txt`. `pdfplumber` solo hace falta para `01_descargar.py` y hoy no está instalado en la computadora del autor (lo sumó el PR #3).
- Node 22 o más (usa `fetch` y `WebSocket` sin paquetes) y Google Chrome. Otra ruta de Chrome: variable `CHROME`.
- Internet hacia cdnjs y jsDelivr para la prueba en Chrome, o copias locales con `DATINA_LIBS` (ver `.claude/rules/pruebas.md`).
- Consultor de pobreza: Node, `npm install` dentro de `pobreza/` y Observable Framework 1.13. No se probó en esta auditoría.
- Ver el sitio: un servidor (`cd sitio && python -m http.server 8765`). Abrir los HTML con doble clic no alcanza: los datos se piden con `fetch`.

## 7. Qué podría dejar de funcionar fuera de Netlify

| Función | Por qué depende de Netlify | Qué pasa en otro lado |
|---|---|---|
| Formulario de contacto | Netlify Forms (`data-netlify`, `form-name`, campo trampa) recibe el POST | Un servidor estático responde con error (405 o 501, según el servidor). Hace falta otro servicio de formularios |
| Suscripción del pie (todas las páginas) | `fetch("/")` por POST, lo recibe Netlify Forms | Falla, o muestra "Anotado" sin guardar nada si el servidor responde 200 a un POST. Bajo una subcarpeta apunta a la raíz del dominio |
| Caché de un año para los archivos con huella | `[[headers]]` de `netlify.toml` | Funciona igual, pero más lento. Hay que reescribir las reglas en el formato de cada servicio |
| Página 404 | Netlify sirve `404.html` sola | Cada servidor se configura distinto. Con `<base href="/">`, si el sitio queda en una subcarpeta (por ejemplo, GitHub Pages de proyecto) la 404 pide estilos y código en la raíz equivocada |
| Direcciones sin `.html` | Solo `./diccionario` en el consultor de pobreza | Con `python -m http.server` da 404. GitHub Pages las resuelve |
| Archivos grandes | DuckDB en WebAssembly: 38,7 MB y 34,0 MB | Algunos servicios tienen un máximo por archivo (por ejemplo, Cloudflare Pages). A verificar en la documentación del servicio elegido |
| Tipos de archivo del consultor | Netlify manda `.wasm` como `application/wasm` y `.js` como JavaScript | Un servidor mal configurado rompe los módulos y DuckDB. A probar en el servicio elegido |

No dependen de Netlify, pero sí de un servidor: todo lo que se pide con `fetch` o `d3.json` (mapas, Cruces, Departamentos, Laboratorio, el Explorador, la vista previa del catálogo). Abriendo los archivos con doble clic (`file://`) no anda.

No dependen de Netlify: las huellas `?v=`, los enlaces relativos, el estado en la dirección (`?n=`, `?q=`, `?prov=`), la provincia guardada en el navegador y la redirección de `emprendedores.html`. Tampoco D3, topojson y Google Fonts, que dependen de sus CDN en cualquier servicio (P0-1).

## 8. Qué falta verificar

1. Netlify: que detecte los dos formularios (el de suscripción está en todas las páginas, el de contacto en `contacto.html`), que la 404 se vea con estilos en una dirección profunda (`/a/b/c`), que `datina.js?v=…` responda con `Cache-Control: public, max-age=31536000, immutable`, y que los dos archivos de DuckDB se publiquen. Necesita la cuenta del autor y una vista previa.
2. Que el código de `main` termine bien la actualización del 5 de noviembre (P1-2). Necesita correr `01_descargar.py` (aprobación del autor) o el workflow a mano.
3. Que `npm run build` en `pobreza/` reproduzca lo publicado en `sitio/pobreza/`. No se corrió.
4. `scripts/linea_base.mjs` (capturas, CLS y LCP): no se corrió.
5. Qué pasa si falla solo jsDelivr (topojson) o Google Fonts: no se probó, solo cdnjs.

## 9. Orden recomendado

Cada paso es un commit con su verificación. Los pasos 2 y 8 necesitan al autor.

1. Crear este documento (`docs/plan_estabilizacion.md`).
2. **Autor:** revisar y unir el PR #3 a `main` antes del 5 de noviembre. Decidir qué hacer con los PR #2 y #4. En la computadora del autor: traer la rama al día y borrar la `pobreza/dist` vieja (o rearmarla). Hasta entonces, no armar el sitio en esa carpeta.
3. P1-3: `pobreza/dist` solo se copia con una opción explícita. Es un cambio chico y protege cualquier armado en la computadora del autor.
4. P0-1: D3 y topojson servidos desde `sitio/`, las fichas visibles aunque falle el arranque de `datina.js`, y la prueba de páginas con una corrida sin cdnjs.
5. P1-4: finales de línea en LF en 02 y 03, `.gitattributes` y los dos documentos corregidos.
6. P1-5: versiones fijas en `requirements.txt` y una corrida a mano del workflow para confirmarlas.
7. P2-1 a P2-5: orden estable en 02, documentos al día, comprobaciones antes de escribir, workflow más robusto, PDF de reservas.
8. **Autor:** conectar Netlify, publicar una vista previa y recorrer la sección 8.
9. El resto de los P2, de a uno, cuando el autor los pida (P2-11 necesita una decisión de nombres).

## 10. Cuándo la estabilización está terminada

1. `main` tiene el trabajo vigente y no quedan PR en borrador que toquen `sitio/` sin una decisión.
2. En Windows y en Linux, `python scripts/03_construir_sitio.py` sobre un repositorio limpio deja `git status` sin cambios.
3. `python scripts/02_procesar.py` corrido dos veces seguidas da archivos idénticos. Comparado con lo guardado, solo cambian los archivos de la lista que depende de la fecha.
4. Con una `pobreza/dist` vieja presente, armar no cambia `sitio/pobreza/`.
5. Todas las comprobaciones de la sección 6 pasan: 0 hallazgos sin explicar, relaciones, catálogo, metadatos, encabezados y sintaxis bien, y la prueba en Chrome con "Todo en orden" en 51 páginas o más.
6. Con cdnjs y jsDelivr bloqueadas en Chrome, una sección y un artículo muestran sus fichas, sus textos, sus gráficos y sus menús, y la prueba de páginas lo controla.
7. La actualización mensual termina en verde sobre `main` con versiones fijas, a mano y el 5 de noviembre.
8. En la vista previa de Netlify: portada, una sección, un artículo, el Explorador, el Catálogo, el consultor de pobreza y la 404 en una dirección profunda se ven bien, los dos formularios reciben un envío de prueba y los archivos con huella llevan la caché de un año.
9. `CLAUDE.md`, `.claude/rules/pruebas.md` y `docs/deploy/RUNBOOK.md` dicen los mismos números que se miden.
