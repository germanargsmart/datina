# Inventario técnico (D1-01)

Auditoría de solo lectura del 10 de octubre de 2026 sobre el commit b4b1fc1, hecha para preparar el Explorador de relaciones. Sin cambios de código. Líneas al día de esa fecha: si el archivo cambió, buscar el símbolo.

## 1. Mapa de la arquitectura

| # | Qué | Dónde |
|---|---|---|
| 1 | Pipeline: descarga, proceso, pruebas, armado y prueba de páginas, en ese orden también en la actualización mensual | `scripts/01_descargar.py`, `02_procesar.py`, `pruebas_datos.py`, `03_construir_sitio.py`, `prueba_paginas.mjs`; `.github/workflows/actualizar.yml:19-29` |
| 2 | `FUENTES`: diccionario archivo a URL, sin nombre de organismo (el organismo va solo en comentarios). Se amplía en varios lugares y hay funciones de descarga propias | `01_descargar.py:127` (y `:194`, `:201`, `:284`, `:320`); lista de funciones `:1664-1687`; registro `datos/crudo/_registro.csv` (archivo, url, descargado, estado: 148 filas) |
| 3 | `agregar(df, variable, unidad, fuente)`: suma filas a la tabla larga. La fuente es texto libre y no guarda el archivo de origen. 78 llamadas | `02_procesar.py:32-35`; se escribe en `:4711` |
| 4 | `tablas`: nombre a tabla. Cada una se escribe como `sitio/datos/{nombre}.csv`, así que el CSV de una ficha es una clave de `tablas` | `02_procesar.py:4715-4894` |
| 5 | `resumen`: 62 claves de cifras y años. Al final suma `cruces`, `capitales` y `capitales_eph` (listas de `{id, nombre, unidad, periodo, tema, fuente, ficha, dec}`) y `cruces_series` | `02_procesar.py:4905`, `:5300-5312` |
| 6 | Metadatos con estructura: `CRUCES_META` (58 indicadores, 55 con ficha), `CAPITALES_META` (8), `OCDE_META` y `OCDE_FUENTE` | `02_procesar.py:4477`, `:4578`, `:937`, `:981` |
| 7 | `fichas.json`: solo `resumen` y `datos` (168 tablas como listas de filas). No hay un objeto de metadatos por ficha | `sitio/datos/fichas.json` (5,9 MB) |
| 8 | `fichas.js`: `window.DATINA = {resumen, datos, diferidas, indice}`. 40 tablas diferidas van aparte en `sitio/datos/{n}.json` en columnas | `03_construir_sitio.py:333-356` |
| 9 | `D.indice`: `secciones` (23), `fichas` (122: id, sección, título, claves de texto, explorador), `articulos` (18) y `ubic` (603 anclas a página). Sin fuente, unidad ni período | `03_construir_sitio.py:302-328` |
| 10 | Una página por `<section class="tema">` de la plantilla; las herramientas llevan `herramienta`. Redirecciones viejas | `03_construir_sitio.py:276`, `:571-617`, `:645` |
| 11 | Navegación que arma el constructor: `ORDEN` (anterior y siguiente), `relacionadas()` y `pasos()` ("Seguí explorando"), íconos `SEC_ICONO`, mapa del pie, fila de secciones del celular | `03_construir_sitio.py:378-383`, `:406`, `:437-460`, `:472`, `:513-516` |
| 12 | Plantilla: D3 7.8.5 (cdnjs) y topojson-client 3.1.0 (jsdelivr) en el `<head>`, sin SRI; `fichas.js` y `datina.js` al final del `<body>`. Menú escrito a mano (Herramientas en `:58`) | `scripts/plantilla.html:16-18`, `:1902-1903` |
| 13 | Ficha: `h3`, `p.lead[data-t]`, `.grafico[data-g][data-forma]`, `p.nota`, `div.pie > span` ("Fuente: ...") y `a[href="datos/X.csv"]`. El constructor agrega la frecuencia al pie | `plantilla.html:234-245`; `03_construir_sitio.py:160-173` |
| 14 | `datina.js`: una sola función de 6.387 líneas. `PAGINA` y `SECCION` (`:15-17`), redirecciones de enlaces viejos si la página es la portada (`:29-39`), `$` devuelve un elemento vacío si no existe (`:42`), tablas diferidas (`:48-64`), herramientas que cortan si no está su elemento (Cruces `:3839`, `:4140`, `:4229`, `:4771`) | `scripts/datina.js` |
| 15 | `datina.css`: valores en `:root` (colores, letra, espacios, radios, sombras, duraciones), solo modo claro, ajuste del celular en `:95` | `scripts/datina.css:35-95` |
| 16 | Pobreza: proyecto aparte de Observable Framework 1.13 (`pobreza/`, con su `netlify.toml`). Su `dist/` no está en el repositorio: el constructor copia `pobreza/dist` a `sitio/pobreza/` solo si existe | `pobreza/observablehq.config.js`; `03_construir_sitio.py:657-660` |

## 2. Comandos de validación

| Comando | Qué necesita | Resultado de la línea de base |
|---|---|---|
| `python scripts/pruebas_datos.py` | pandas, `tabla_larga.csv`, `fichas.json`, archivos de `datos/crudo/` | 0 sin explicar, 115 explicados, 3 s |
| `python scripts/03_construir_sitio.py` | salidas de 02 y `datos/manual/` | 23 páginas de sección y 18 artículos, 3 s; solo cambian los finales de línea de 50 páginas |
| Sintaxis: `node -e "new Function(require('fs').readFileSync('sitio/datina.js','utf8'))"` | Node | bien |
| `node scripts/prueba_paginas.mjs` | Node 22 y Chrome (variable `CHROME`); recorre todos los `sitio/*.html` salvo `emprendedores.html` y "En cifras" en 18 secciones | ver `ESTADO.md` (en la nube, con el banco local de `.claude/rules/pruebas.md`) |

El constructor frena el sitio si: se repite un id en la plantilla (`:30-32`), hay un año reciente escrito a mano fuera de `FIJOS` (`:39-72`, revisa solo `plantilla.html` y `datina.js`), falta una ruta `{{...}}` del resumen (`:80-89`), una ficha no tiene `FRECUENCIA` o sobra una (`:152-157`), una ficha no tiene pie (`:165-167`), una sección no tiene página (`:281`), se repite una clave de los objetos principales de `datina.js` (`:370-376`) o un ícono no existe (`:383`).

No hay pruebas unitarias de Python ni linter. `h/verificar_citas.py`, que cita el registro histórico, no está en el repositorio.

## 3. Dónde están hoy los metadatos de cada ficha

| Dato | Dónde | ¿Se puede leer con un programa? |
|---|---|---|
| Nombre de la fuente | Pie de cada ficha (`plantilla.html`, 101 textos distintos en 122 fichas, sin enlace); columna `fuente` de la tabla larga (80 textos, 202 variables, una fuente por variable); `fuente` de `CRUCES_META` y `CAPITALES_META` | En parte: es texto libre y el mismo organismo aparece escrito de varias formas ("SNIC, Ministerio de Seguridad" y "Sistema Nacional de Información Criminal (SNIC), Ministerio de Seguridad Nacional"). 35 pies tienen varias fuentes juntas ("Fuentes: A, B y C") |
| URL de la fuente | URLs de descarga en `FUENTES` (por archivo); páginas citables en `datos/manual/explicadores.json` (por sección, no por ficha: 125 bloques, 418 citas) | Sí, pero ninguna está unida a una ficha |
| Período | Claves del resumen (`anio_ult`...), `periodo` de la tabla larga y de `CRUCES_META`; títulos con `{{ruta}}` | En parte: no hay un campo de período por ficha |
| Unidad | `unidad` de la tabla larga y de `CRUCES_META`; `INDP[].det` en `datina.js:4972` | En parte |
| Cobertura territorial | No está escrita: se deduce de las columnas del CSV (`codigo_indec`) y de si la ficha está en `INDP` | No |
| Método y notas | `p.nota` de la plantilla (21 fijas) y notas calculadas en `TX` (104); bloques de `explicadores.json` por sección | No, es texto |
| CSV | `href` del pie: 119 enlaces coinciden con claves de `tablas`; 7 apuntan a archivos escritos aparte (legisladores, votaciones, ministros, departamentos); 3 fichas tienen más de uno | Sí |
| Ficha, sección y título | `D.indice.fichas` y `ubic` | Sí |
| Ficha que usa un indicador de Cruces | `ficha` de `CRUCES_META` y `CAPITALES_META` (todas existen en la plantilla) | Sí |
| Archivo de origen de cada variable | Solo en el código de `02_procesar.py` (`pd.read_csv(CRUDO / "...")` y después `agregar` o `cru[...]`) | No sin trazar el código a mano |

Conclusión: para el explorador hace falta un catálogo escrito a mano (fuentes con sus nombres alternativos, conjuntos y aristas con su evidencia) que el pipeline valide contra lo que ya existe. Detalle en la propuesta de `DECISIONES.md` (D1-02).

## 4. Riesgos de compatibilidad para una página nueva

- Si la página entra en la plantilla como `<section class="tema herramienta">`, se suma sola al recorrido (`ORDEN`), a "Seguí explorando", a la fila del celular, al mapa del pie, al buscador y a la grilla de herramientas de la portada (hoy cuatro en fila: una quinta deja una sola en la última fila). El menú se escribe a mano.
- `datina.js` corre en toda página: arma el pie de todo `article.ficha` (falla si no tiene `h3` y un enlace CSV) y llama a `DIB[...]` sin control para todo `.grafico[data-g]` (`datina.js:6198`). El explorador no debe usar esas clases.
- Sin `data-pagina`, `datina.js` cree que es la portada y corre las redirecciones de enlaces viejos (`:29-33`).
- La revisión de años escritos a mano (`03:69`) mira solo `plantilla.html` y `datina.js`: un archivo nuevo de JavaScript quedaría afuera. Hay que sumarlo a esa revisión.
- La prueba de páginas recorre todo `sitio/*.html`: una página nueva entra sola (bien), y un `null` o `undefined` visible la hace fallar.
- El constructor no borra páginas viejas de `sitio/`: una página hecha a mano sobreviviría sin las huellas `?v=`.
- `netlify.toml` guarda un año solo los archivos con huella que nombra: un archivo nuevo con huella necesita su entrada.
- No hay clases `.grafo`, `.nodo`, `.rel` ni `rx-` en el CSS: el prefijo `rx-` está libre.
- En la nube, la red bloquea las CDN: probar con el banco local (`.claude/rules/pruebas.md`).

## 5. Archivos mínimos para el prototipo (D2-01)

Recomendación: página aislada, armada por el constructor pero fuera de la plantilla y del recorrido.

- Nuevos: `scripts/relaciones.html` (marcado de la página), `scripts/relaciones.js` y `scripts/relaciones.css` (lógica y estilos propios con prefijo `rx-`, usando los valores de `datina.css`), y un catálogo de muestra (`datos/manual/relaciones_muestra.json`, marcado como muestra).
- Cambio chico en `scripts/03_construir_sitio.py`: copiar esos archivos a `sitio/` con su huella `?v=`, escribir `sitio/relaciones.html` y sumar `relaciones.js` a la revisión de años a mano.
- Sin tocar `scripts/datina.js`, la plantilla, `FRECUENCIA`, `ORDEN`, los menús ni el índice. La página carga D3 7.8.5 de la misma dirección y `datina.css` para los valores, pero no `datina.js`: no tiene la barra con menú, buscador ni provincia. Sumarla a la navegación es la tarea D5-01.
- Riesgo de esta opción: la barra de la página es una copia simple. Si el autor prefiere la barra completa, hay que cargar `datina.js` con `data-pagina` propio y revisar qué corre (más riesgo).
