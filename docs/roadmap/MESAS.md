# Elecciones por mesa

Herramienta `mesas.html`, en el menú Herramientas, con un enlace desde la ficha de elecciones de Política. Pedido del autor del 4 de noviembre de 2026: "la sección de cada circuito electoral y mesa de las votaciones históricas desde 1983 hasta acá, primero de elecciones a presidente y legislativas a nivel nacional".

## Qué se decidió (respuestas del autor del 4 de noviembre de 2026)

- Mesas y circuitos de 2011 a 2025. De 1983 a 2009, hasta jurisdicción, con el aviso de por qué.
- Generales y segundas vueltas. Las PASO quedan para otro cambio.
- Página propia en Herramientas.
- Historia por circuito y por sección: en cada elección, las dos listas más votadas y la participación. La mesa no se sigue en el tiempo.

El autor dijo "como hablamos en su momento". Esa charla no está en las sesiones de Datina que se pudieron revisar. Lo único sobre mesas estaba en su proyecto electoral predictivo (`C:\Users\GCBA\Desarrollo aplicación electoral predictiva`), de donde salen las trampas de los archivos.

## Qué existe en cada período (revisado el 4 de noviembre de 2026)

| Período | Nivel más fino | Fuente | ¿Se publica? |
|---|---|---|---|
| 2011 a 2025 | Mesa | Dirección Nacional Electoral, archivos del "estándar de preservación". 2025 sale de datos.gob.ar. CC-BY 4.0 | Sí |
| 2003 a 2009 | Mesa | Atlas Electoral de Andy Tow, por medio de electorAr (`PoliticaArgentina/data_warehouse`) | No sin permiso. El proyecto electoral anotó que la licencia es CC BY-ND. El sitio del Atlas pide iniciar sesión y no se pudo comprobar de primera mano |
| 1983 a 2001 | Circuito y departamento | Base de Ernesto Calvo (el repositorio `azha2005/257arg` dice que no se redistribuye) y base de Lupu y Stokes (por departamento, solo PJ, UCR y otros) | No sin permiso |
| 1983 a 2009 | Jurisdicción | DINE, escrutinio definitivo: `datos/manual/presidenciales_provincia.csv` para presidente y un Excel por año para diputados y senadores | Sí |

Los senadores se eligen por voto directo desde 2001, y por eso no hay senadores antes. Para llegar más abajo hay que pedir permiso a Andy Tow y a Ernesto Calvo: lo decide y lo hace el autor.

## Cómo está armado

- `scripts/elecciones_mesas.py` arma `sitio/datos/mesas/` y `datos/manual/mesas_control.json`. Se corre una vez por elección nueva: 03 no toca esa carpeta y la actualización mensual tampoco.
- `sitio/datos/mesas/indice.json`: las elecciones, su nivel y lo que reúnen del definitivo.
- `sitio/datos/mesas/{eleccion}/pais.csv`: una fila por jurisdicción y lista. `{eleccion}` es `2023-general-presidente`, `2023-segunda-presidente`, `2025-general-diputados`.
- `sitio/datos/mesas/{eleccion}/{codigo_indec}.csv`: una fila por mesa, con una columna por lista. Es también la tabla que se descarga. Las columnas fijas son `seccion_id, seccion, circuito, mesa, electores, blancos, nulos, recurridos_impugnados`.
- `sitio/datos/mesas/circuitos/{codigo_indec}.csv`: cada sección (con `circuito` vacío) y cada circuito en cada elección, con las dos listas más votadas.
- `scripts/mesas.js`: el código de la página. 03 lo copia a `sitio/mesas.js` y lo pide solo `mesas.html`. Baja la tabla de la jurisdicción al elegirla y suma en el navegador. No usa D3 ni DuckDB.
- `scripts/prueba_mesas.py`: la corre 03 al final. Lo publicado tiene que sumar exacto lo que el archivo de origen, jurisdicción por jurisdicción, y dar los resultados conocidos.
- No pasa por `tabla_larga.csv` (son millones de filas), y las tablas no van en el Catálogo: su glob mira solo `sitio/datos/*.csv`, y la página del Catálogo enlaza a la herramienta. No es una ficha, así que no necesita origen en `relaciones.json`.

Medido el 4 de noviembre de 2026: 47 elecciones (22 por mesa), 472 archivos, 87 MB. El mayor es `2025-general-diputados/06.csv`, 2,5 MB. El sitio queda en unos 1.350 archivos, lejos del límite de 20.000 de Cloudflare Pages, y ninguno cerca de los 25 MiB.

Cloudflare comprime el JSON y el texto, pero no el CSV. Por eso `sitio/_headers` (`MESAS_TEXTO` en `03_construir_sitio.py`) sirve `/datos/mesas/*` como `text/plain`: el archivo es el mismo, sigue llamándose `.csv` y los enlaces de descarga llevan el atributo `download`. El peor caso, una sección de Buenos Aires en diputados 2025 (las mesas y la historia), bajó de 5,0 a 1,1 MB, medido en la vista previa del PR #92. `prueba_mesas.py` frena si falta la regla. Las demás tablas CSV del sitio siguen sin comprimir: `tabla_larga.csv` baja 7,1 MB enteros.

## Sumar una elección nueva

1. Sumar el ZIP en `ZIPS` de `scripts/elecciones_mesas.py`. Si es presidencial, sumar las fórmulas en `FORMULAS`.
2. `python scripts/elecciones_mesas.py --cache CARPETA --trabajo CARPETA`. Lee todos los ZIP, unos 15 minutos, y baja lo que no encuentre (unos 300 MB, con aprobación del autor). `--solo 2027-general` lee uno solo y `--sin-leer` arma con lo ya leído, unos 3 minutos. La computadora del autor ya tiene los ZIP en `Desarrollo aplicación electoral predictiva\data\raw\dine_zip` y `mininterior_2025`.
3. Si `prueba_mesas.py` falla, mirar por qué antes de tocar los bordes.
4. `python scripts/correr_02_con_fecha.py` (los años del resumen) y `python scripts/03_construir_sitio.py`.

## Trampas de los archivos

- 2021 escribe los tipos de voto en plural ("BLANCOS", "NULOS") y los demás años en singular. Un tipo desconocido frena el armado.
- El mismo circuito llega como "0557 ", "000557" o "557", y la mesa como "0001" o "1". Se normalizan los dos, y se conserva la letra ("0062A" pasa a "62A").
- "Diputados/as de la Ciudad" es la Legislatura de CABA, no la Cámara nacional.
- En 2013, 909 mesas (las 9000, de extranjeros) no traen electores ni votos para diputados. Se sacan y se cuentan en el control.
- El código de sección es estable de 2011 a 2025. Lo que cambia es la escritura ("Matanza", "La Matanza", "LA MATANZA"): 72 de 531 secciones. Se usa el nombre más largo que no venga todo en mayúsculas.
- En presidente antes de 2011 el partido cambia de una provincia a otra, porque las alianzas son provinciales. Se agrupa por fórmula: así 1983 da 51,75% y no 51,34%.
- Errores de tipeo de los Excel, corregidos solo cuando son imposibles (cambia la cantidad de dígitos): votantes de La Rioja en senadores 2001 (14.642, suman 146.421), votantes de Santiago del Estero en diputados 2013 (51.006, suman 510.066), electores de Tierra del Fuego en diputados 2005 (7.065 con 55.700 votantes). También se saca una fila "DIREFENCIA EN ACTAS" de presidente 2007 en Río Negro. Una diferencia menor queda como la publica la fuente.
- En 1987 votaron diputados 23 jurisdicciones (no está Tierra del Fuego), y hay 8 por año en senadores desde 2003.

## Cuánto del definitivo reúne el provisorio

Es la advertencia más importante de la herramienta. Los archivos por mesa son el conteo de la noche de la elección, y les faltan mesas que no se llegaron a cargar. En el país la diferencia es chica, de 96,6% a 99,2% de los votos positivos, pero en algunas jurisdicciones es grande:

| Elección | Jurisdicción | Reúne del definitivo |
|---|---|---|
| Diputados 2015 | Formosa | 77,2% |
| Presidente 2015, primera vuelta | Formosa | 80,8% (el archivo trae 1.050 mesas y el de la segunda vuelta, 1.301) |
| Diputados 2013 | Formosa | 83,6% |
| Presidente 2015, primera vuelta | Catamarca | 85,3% |
| Presidente 2019 | Corrientes | 85,6% |

La página lo avisa por debajo de 97% (`COBERTURA_AVISO` en `mesas.js`). Se mide contra el definitivo de la DINE: presidente 2011 a 2019 y legislativas 2011 a 2019. Las legislativas desde 2021 y las presidenciales de 2023 no tienen un definitivo publicado como datos, así que ahí la página no puede avisar. `prueba_mesas.py` frena si una jurisdicción sale de 75% a 101,5%.

La participación tampoco coincide exacto con la ficha de elecciones de Política, a propósito. La ficha divide por todos los electores del archivo y la herramienta, solo por los de las mesas con resultado: en la segunda vuelta de 2023 da 75,8% en la ficha y 76,3% acá, porque 765 mesas figuran sin cargar.

## Lo que falta

- Las PASO: 2015 no se puede bajar por mesa y 2023 sale de una copia del Internet Archive.
- Los locales de votación: el archivo de 2025 los trae (escuela y dirección).
- Un mapa por circuito: la Cámara Nacional Electoral publica las geometrías en `mapa2.electoral.gov.ar/descargas`.
- Mesas de 2003 a 2009 y circuitos de 1983 a 2001, con permiso de sus autores.
