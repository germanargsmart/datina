# Migración interna (pedido del autor, 25 de noviembre de 2026)

Pedido: hacer para la Argentina el estudio "¿Dónde gana y dónde pierde gente Guadalajara?" (documento de Google del 21 de noviembre de 2026), sobre migración, con informes y tablas "como rutas comerciales de lindo".

## Decisiones del autor (25 de noviembre de 2026)

- Las dos cosas, por etapas y en la misma página: las mudanzas entre jurisdicciones, y después el cambio de población por departamento y las viviendas sin personas.
- Herramienta propia en el menú Herramientas, como Rutas comerciales. El artículo `a-migracion-interna` y la ficha `f-migracion-interna` quedan (miden el lugar de nacimiento, que es otra cosa). La ficha enlaza la herramienta en su nota, dentro de "Sobre los datos". El artículo todavía no.
- Descarga aprobada: los cuadros chicos del Censo 2022 de censo.gob.ar (73 archivos, 3,5 MB). La base por radio censal no: es pesada, y los archivos de 2010 por radio de datos.gob.ar dan 404.
- Diseño aprobado con capturas ("todo está perfecto"), con tres cambios: se llama **Migración interna**, con la pregunta "¿Cómo nos movemos los argentinos?" (su propuesta fue "Migración interna: cómo nos movemos los argentinos o algo así"), sin los puntos que se movían sobre las líneas y con las Malvinas sin mouse ni clic, como en la portada. El censo cuenta a todas las personas que viven en el país, también a las nacidas en otro: lo dice "Qué no dice este dato".

## Datos

`scripts/censo_2022_mudanzas.py` (una sola vez) guarda en `datos/manual/`:

- `censo2022_mudanzas_matriz.csv`: el cuadro 15 de migraciones del total del país. Personas de 5 años y más en viviendas particulares, por la jurisdicción donde vivían cinco años antes y donde viven. Suma por fila y por columna.
- `censo2022_mudanzas_departamentos.csv`: la población de 2010 y 2022 (cuadro 1 de cada provincia, da los totales oficiales 40.117.096 y 45.892.285) y dónde vivían en 2017 (cuadro 4). Lezama y Tolhuin se crearon entre los censos.

Las viviendas sin personas y su motivo salen de `censo2022_departamentos.csv`, que ya estaba.

## Lo que hay que saber de la fuente

- "Provincia ignorada" son 314.077 personas que vivían en otra provincia y no dijeron cuál: el 29,5% de las que cambiaron de jurisdicción (7,6% en La Pampa, 51,1% en Tucumán). Lo confirma el cuadro 4: su "otra provincia argentina" es la suma de las otras 23 y de la ignorada, en las 24.
- El saldo sale solo de quienes dijeron su provincia. El de Buenos Aires da +5.196. La nota de la CEPAL encontrada en la búsqueda del 25 de noviembre de 2026 habla de algo más de 5 mil (no se abrió la nota).
- Prueba de robustez: repartiendo a quienes no lo dijeron, en cada destino, como a los demás, el saldo cambia de signo en siete jurisdicciones: Chubut, Corrientes, Jujuy, La Pampa, Santa Fe, Tierra del Fuego y Tucumán. Van con trama y el texto dice que no se puede decir si ganan o pierden. Córdoba, Río Negro, Neuquén, San Luis, Buenos Aires, Entre Ríos, Mendoza, La Rioja y San Juan quedan a favor en las dos cuentas (La Rioja y San Juan, por muy poco).
- No hay tabla de origen y destino entre departamentos: solo cuántos llegaron de otra provincia.
- Valcheta (Río Negro) baja de 7.101 a 4.319 (39,2% menos). Es lo que publica el INDEC, y el RENAPER tiene 5.114 personas en 2026, también muy por debajo de 2010. Las listas van desde 10.000 habitantes, así que no encabeza ninguna.
- El Censo 2010 fue de hecho y el de 2022, de derecho: el cambio de población no es del todo comparable.
- Del documento mexicano no se puede repetir: las viviendas deshabitadas de 2010 por departamento (sin fuente confirmada), la encuesta de 2025 y las zonas chicas. A cambio, el censo argentino dice por qué no había personas en cada vivienda.

## Lenguaje (pedidos del autor del 26 de noviembre de 2026)

"Saldo", "El camino más usado" y "Mayor saldo a favor" no se entendían: el autor pidió un lenguaje más técnico y, sobre los textos, que se entiendan "por cualquiera". Quedó así: los términos de la demografía (saldo migratorio, inmigrantes, emigrantes, flujo migratorio, tasa neta por mil, saldo con origen imputado, matriz de origen y destino, signo indeterminado), cada uno explicado en palabras simples la primera vez que aparece, en oraciones cortas. Tocar una línea o un flujo de la lista abre la ficha del par: cuántas personas fueron en cada sentido, cuántas personas más llegaron a una de las que salieron hacia la otra (el autor pidió el 26 de noviembre de 2026 no decir que una provincia "gana" o "pierde" personas) y qué parte representa de los inmigrantes y emigrantes de cada una (`?flujo=06-62` en la dirección).

## La página

`migracion-interna.html`, en Herramientas, entre Rutas comerciales y el Catálogo. Usa las tarjetas, la ficha y los controles de Rutas (`.rt-*` de `datina.css`), así que **sale después de la rama `claude/rutas-mapa`**, de la que parte. Lo propio lleva `mu-`.

- **02**: escribe `mudanzas_matriz.csv`, `mudanzas_provincias.csv` y `mudanzas_departamentos.csv` (las calcula `mudanzas_sitio.tablas()`), cuatro variables en la tabla larga y `resumen.migraciones.mudanzas`. El cambio de los departamentos que se juntan va una sola vez, en el que ya existía.
- **03**: escribe `datos/mudanzas.json` y `datos/vecinos.topo.json` (los países de alrededor, del mapa del mundo de `scripts/lib`, 41 KB) con `mudanzas_sitio.armar_json()`, y copia `scripts/mudanzas.js`.
- **Tres vistas** (`?vista=poblacion`, `?vista=viviendas`) y la jurisdicción elegida (`?provincia=14`) en la dirección. Dibuja con D3. Sin D3 o sin un mapa quedan las cifras, las listas y las tablas.
- **Los colores**: celeste es saldo positivo y ámbar negativo (ni bueno ni malo, por eso no van verde y rojo), trama donde no se puede decir, y turquesa en las viviendas, para que no se confunda con perder.
- **Las listas** de departamentos van desde 10.000 habitantes o viviendas. Con una provincia elegida llevan todos: es lo que recorre el teclado.
- `f-migracion-interna` la enlaza.
- `prueba_paginas.mjs` y `prueba_fallas.mjs` la recorren, y `prueba_320.mjs` como a todas.
