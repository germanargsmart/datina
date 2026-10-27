# Inventario global de textos de Datina

Reescritura editorial del 26 de octubre de 2026 (encargo: `CLAUDE_CODE_REESCRITURA_GLOBAL_DATINA_CON_EJEMPLOS.md`). Este índice lo arma `scripts/inventario_textos.py`, que lee las fuentes de verdad de cada texto (la plantilla, el código que arma los textos, el constructor y los archivos de `datos/manual/`), compara la versión del commit de partida con la de ahora y busca cada texto nuevo en las páginas armadas (volcado de `scripts/volcar_textos.mjs`).

**5.175 piezas de texto**: 849 reescrito, 2.872 revisado sin cambios, 1.442 conservado deliberadamente, 12 pendiente de verificación factual.

Criterios: `docs/redaccion/CRITERIOS_REDACCION.md`. Resumen y pendientes: `docs/redaccion/RESUMEN_REESCRITURA_GLOBAL.md`.

## Archivos del inventario

| Archivo | Área | Piezas | Reescritas | Sin cambios | Conservadas | Pendientes |
|---|---|---|---|---|---|---|
| `inventario/G1.md` | Personas y bienestar | 933 | 116 | 496 | 316 | 5 |
| `inventario/G2.md` | Trabajo y economía | 982 | 186 | 558 | 238 | 0 |
| `inventario/G3.md` | Estado y sociedad | 568 | 114 | 319 | 132 | 3 |
| `inventario/G4.md` | Territorio y recursos | 818 | 139 | 503 | 176 | 0 |
| `inventario/G5.md` | Artículos | 59 | 26 | 33 | 0 | 0 |
| `inventario/G6a.md` | Perfil provincial y herramientas de provincias | 135 | 43 | 82 | 10 | 0 |
| `inventario/G6b.md` | Portada, navegación y piezas comunes | 557 | 48 | 461 | 48 | 0 |
| `inventario/G6c.md` | Catálogo, Explorador de relaciones, consultas con IA, consultor de pobreza y README | 494 | 65 | 372 | 55 | 2 |
| `inventario/G7.md` | Historia de las provincias | 629 | 112 | 48 | 467 | 2 |

El inventario completo en un solo archivo, para comprobarlo con un programa: `inventario/inventario.json`.

## Cobertura por tipo de página

| Tipo | Rutas | Piezas que se ven ahí |
|---|---|---|
| Portada | 1 | 54 |
| Artículo | 19 | 946 |
| Perfil provincial | 1 | 1317 |
| Consultor de pobreza | 2 | 69 |
| Herramienta | 7 | 680 |
| Historia con datos | 2 | 119 |
| Página auxiliar | 4 | 241 |
| Sección temática | 19 | 4044 |

El perfil provincial es una sola página (`provincia.html`) que se arma para cada una de las 24 jurisdicciones (`?prov=`): el volcado la recorre con las 24.

## Rutas publicadas

Antes de la reescritura: 55 páginas. Después: 55. Son las mismas.

| Ruta | Tipo | Reescritas | Sin cambios | Conservadas | Pendientes | En el volcado posterior |
|---|---|---|---|---|---|---|
| `404.html` | Página auxiliar | 5 | 32 | 0 | 0 | sí |
| `a-alquiler-pobreza.html` | Artículo | 11 | 43 | 0 | 0 | sí |
| `a-atn-presupuesto.html` | Artículo | 11 | 40 | 0 | 0 | sí |
| `a-cloacas-mortalidad.html` | Artículo | 10 | 42 | 0 | 0 | sí |
| `a-cobertura-adolescentes.html` | Artículo | 11 | 41 | 0 | 0 | sí |
| `a-cobertura-esperanza.html` | Artículo | 10 | 41 | 0 | 0 | sí |
| `a-dolar-inversion.html` | Artículo | 7 | 41 | 0 | 0 | sí |
| `a-empleo-pobreza.html` | Artículo | 11 | 42 | 0 | 0 | sí |
| `a-exportaciones-dolar.html` | Artículo | 5 | 41 | 0 | 0 | sí |
| `a-exportaciones-empleo.html` | Artículo | 11 | 38 | 0 | 0 | sí |
| `a-internet-aprender.html` | Artículo | 13 | 38 | 0 | 0 | sí |
| `a-inversion-aprender.html` | Artículo | 14 | 39 | 0 | 0 | sí |
| `a-milei-empleo.html` | Artículo | 11 | 40 | 0 | 0 | sí |
| `a-nafta-dolares.html` | Artículo | 5 | 36 | 0 | 0 | sí |
| `a-pobreza-desocupacion.html` | Artículo | 12 | 42 | 0 | 0 | sí |
| `a-recursos-empleo.html` | Artículo | 10 | 41 | 0 | 0 | sí |
| `a-turismo-dolar.html` | Artículo | 5 | 36 | 0 | 0 | sí |
| `a-viviendas-alquiler.html` | Artículo | 12 | 41 | 0 | 0 | sí |
| `a-viviendas-hacinamiento.html` | Artículo | 11 | 41 | 0 | 0 | sí |
| `articulos.html` | Artículo | 8 | 35 | 0 | 0 | sí |
| `catalogo.html` | Herramienta | 11 | 106 | 1 | 0 | sí |
| `construccion.html` | Sección temática | 36 | 174 | 70 | 0 | sí |
| `consulta-ia.html` | Herramienta | 8 | 36 | 1 | 1 | sí |
| `contacto.html` | Página auxiliar | 4 | 38 | 0 | 0 | sí |
| `corte-suprema.html` | Historia con datos | 7 | 41 | 0 | 0 | sí |
| `cruces.html` | Herramienta | 22 | 78 | 2 | 0 | sí |
| `curiosidades.html` | Sección temática | 26 | 94 | 16 | 0 | sí |
| `departamentos.html` | Herramienta | 13 | 52 | 7 | 0 | sí |
| `diagnostico.html` | Herramienta | 14 | 69 | 14 | 0 | sí |
| `economia.html` | Sección temática | 41 | 143 | 42 | 0 | sí |
| `educacion.html` | Sección temática | 33 | 141 | 84 | 3 | sí |
| `emprendedores.html` | Página auxiliar | 5 | 27 | 0 | 0 | sí |
| `empresas.html` | Sección temática | 19 | 73 | 9 | 0 | sí |
| `energia.html` | Sección temática | 44 | 150 | 52 | 0 | sí |
| `externo.html` | Sección temática | 25 | 110 | 1 | 0 | sí |
| `gobierno.html` | Sección temática | 25 | 129 | 48 | 0 | sí |
| `index.html` | Portada | 7 | 46 | 1 | 0 | sí |
| `indice.html` | Herramienta | 13 | 47 | 1 | 0 | sí |
| `laboratorio.html` | Historia con datos | 17 | 54 | 0 | 0 | sí |
| `migraciones.html` | Sección temática | 26 | 129 | 30 | 0 | sí |
| `movilidad.html` | Sección temática | 22 | 106 | 18 | 0 | sí |
| `naturaleza.html` | Sección temática | 30 | 113 | 20 | 0 | sí |
| `nosotros.html` | Página auxiliar | 16 | 69 | 45 | 0 | sí |
| `petroleo.html` | Sección temática | 52 | 222 | 70 | 0 | sí |
| `poblacion.html` | Sección temática | 32 | 117 | 53 | 1 | sí |
| `pobreza.html` | Sección temática | 32 | 143 | 63 | 1 | sí |
| `pobreza/diccionario.html` | Consultor de pobreza | 18 | 19 | 0 | 1 | sí |
| `pobreza/index.html` | Consultor de pobreza | 16 | 14 | 0 | 1 | sí |
| `politica.html` | Sección temática | 92 | 269 | 102 | 3 | sí |
| `provincia.html` | Perfil provincial | 232 | 148 | 933 | 4 | sí |
| `relaciones.html` | Herramienta | 16 | 168 | 0 | 0 | sí |
| `salud.html` | Sección temática | 28 | 123 | 72 | 0 | sí |
| `seguridad.html` | Sección temática | 22 | 112 | 30 | 0 | sí |
| `trabajo.html` | Sección temática | 45 | 105 | 52 | 0 | sí |
| `turismo.html` | Sección temática | 24 | 81 | 16 | 0 | sí |

## Piezas sin una ruta asignada

549 piezas que se ven en el sitio no tienen una ruta fija: son textos que arma el código según el dato o la vista (frases de las funciones comunes de `datina.js`, cuadros emergentes, mensajes de error), textos de la barra y el pie que se repiten en todas las páginas o textos apagados (los formularios). Están en su archivo de grupo con su ubicación en el código.

