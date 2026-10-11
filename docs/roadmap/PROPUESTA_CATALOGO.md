# Propuesta: catálogo de datos

Borrador del 11 de octubre de 2026. **Aprobado por el autor el mismo día ("aprobado el catálogo como lo propusiste") y hecho:** `catalogo.html`, armado por `scripts/catalogo.py`. Decisiones al construirlo:

- Nombre: "Catálogo de datos" (dirección `catalogo.html`, para no confundirla con la carpeta `datos/`).
- Enlaces: en "Más" (Herramientas, después del Explorador de relaciones), en el pie ("Los datos") y en la portada (Herramientas). No va en la columna Herramientas del mapa del pie, porque ya está en "Los datos".
- "En el catálogo" en el pie de cada ficha: no se sumó (la propuesta lo dejaba a pedido del autor).
- Las 66 tablas que ninguna ficha ofrece en su pie: las de los artículos salen de `datina.js` y las del Explorador de relaciones, de `relaciones.json`. Las otras 44 van en `datos/manual/catalogo.json`, cada una con la ficha, el artículo o la pieza que la usa y su evidencia en el código. Seis no se dibujan (sus cifras van en el texto de la ficha) y lo dicen.
- Las tablas de suicidio quedan afuera, como en el Explorador: en Salud van después de las líneas de ayuda.
- Cobertura: departamentos solo con un código o una fila por departamento (la regla del Explorador leía como departamentos a las capitales, por el % de viviendas en departamento). Una tabla sin columna de territorio dice "Sin desglose territorial".
- El orden es el del sitio: los temas como en la barra y las fichas en su orden, con la tabla del pie primero.
- La búsqueda no encuentra provincias ("Salta"), porque están dentro de las tablas y no en su descripción: el ejemplo del buscador dice "empleo, salarios, INDEC".

## Qué es

Una página nueva, `datos.html`, armada por el constructor como las demás (sin pasar el sitio a otro sistema), donde una persona encuentra, entiende y baja cualquier tabla de Datina sin leer el código. Hoy hay 182 tablas CSV en `sitio/datos/`, una por ficha o vista, más la tabla completa (`tabla_larga.csv`).

## De dónde sale cada dato del catálogo (todo verificable, nada inferido)

| Campo | De dónde sale |
|---|---|
| Título | El título de la ficha que usa la tabla (su pregunta) y la descripción de la ficha (`p.ficha-sub`) |
| Fuente y organismo | `datos/manual/relaciones.json`: cada arista "alimenta" tiene la tabla publicada (`tabla`), la ficha y, por el conjunto de origen, el organismo, ya validado con evidencia en el código |
| Períodos | Las columnas de período de la propia tabla (`anio`, `periodo`, `mes`, `semestre`, `trimestre`), el primero y el último. Muchas tablas por provincia no tienen esa columna (por ejemplo, `salarios_provincias.csv` es un solo mes): ahí el período sale de la descripción de la ficha, que ya lo dice ("mayo de 2026") |
| Cobertura territorial | La columna `codigo_indec`: "país", "24 jurisdicciones", "departamentos" o "capitales", según los códigos que tenga |
| Actualización | `FRECUENCIA` del constructor (la misma frase que ya dice el pie de cada ficha: "Se actualiza cada mes") y la fecha del último proceso |
| Formato | CSV (y la tabla completa). No se ofrece ningún formato que no exista, ni una API |
| Diccionario de variables | Los nombres de las columnas, con la unidad cuando la tabla la trae, y el tipo (número, texto, año) |
| Método | La nota "Sobre los datos" de la ficha |
| Licencia | Pendiente de la decisión del autor (`LICENCIA_OPCIONES.md`). Hasta entonces, la línea dice "Los datos de base son de cada organismo. Citar la fuente" |

Si a una tabla le falta un dato, el catálogo lo muestra vacío. No se completa a mano.

## Cómo se vería (estructura, con el sistema de diseño actual)

Las cifras del esquema son de ejemplo: en la página salen de los datos.

```
Datina › Herramientas
DATOS                                                        (h1, como el antetítulo de las demás páginas)
¿Qué datos puedo bajar?                                       (la pregunta, título grande)
Las 182 tablas de Datina, con su fuente, sus períodos y su cobertura, y la tabla completa con todo.

[ Buscar: empleo, Salta, INDEC…            ]   [Tema ▾] [Organismo ▾] [Cobertura ▾] [Período ▾]
182 tablas · Bajar la tabla completa (CSV, 5,9 MB)

┌──────────────────────────────────────────────────────────────────────────┐
│ ¿Dónde se gana más en un empleo privado registrado?            TRABAJO   │
│ Salario promedio de los asalariados registrados del sector privado...    │
│ OEDE, Secretaría de Trabajo · 24 jurisdicciones · 2015 a mayo de 2026    │
│ Se actualiza cada tres meses                                              │
│ [Ver la ficha] [Vista previa] [Descargar CSV]                            │
└──────────────────────────────────────────────────────────────────────────┘
  (al abrir "Vista previa": las primeras 10 filas y el diccionario de variables)
```

- Filtros con los datos que existen: tema (los grupos y secciones de `GRUPOS`), organismo (las 42 fuentes de `relaciones.json`), cobertura y período.
- Búsqueda como la del Explorador: todas las palabras, sin tildes.
- El estado de la búsqueda y los filtros en el enlace, para poder compartirlo.
- En el celular, una columna. En la computadora, la lista con los filtros arriba.
- Accesible: teclado completo, filtros con `<select>` y botones, la vista previa como tabla con encabezados.

## Conexiones

- Cada tabla del catálogo lleva a su ficha (y a su artículo, si lo usa).
- En cada ficha, el pie ya tiene "Descargar CSV" y "De dónde sale". Se sumaría "En el catálogo" solo si el autor lo quiere (agrega un botón más al pie).
- La tabla completa y el Explorador de relaciones siguen como están.

## Lo que necesita aprobación del autor

1. El nombre: "Datos" o "Catálogo de datos". No "Datos abiertos" hasta que haya licencia.
2. Dónde se enlaza: propuesta, en el menú "Más" dentro de Herramientas (después de Explorador de relaciones), en el pie (columna "Los datos") y en la portada, en el bloque de Herramientas.
3. Si se suma "En el catálogo" al pie de cada ficha.

Con la aprobación, el plan es: armar `scripts/catalogo.py` (lee `relaciones.json`, las tablas y la plantilla, y valida que cada tabla publicada tenga su ficha y su organismo), la página con los filtros y la vista previa, la prueba en la computadora y en el celular, y recién después los enlaces.
