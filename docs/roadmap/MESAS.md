# Elecciones por mesa

Herramienta `mesas.html`, en el menú Herramientas, con un enlace desde la ficha de elecciones de Política. Pedido del autor del 4 de noviembre de 2026: "la sección de cada circuito electoral y mesa de las votaciones históricas desde 1983 hasta acá, primero de elecciones a presidente y legislativas a nivel nacional".

## Qué se decidió (respuestas del autor del 4 de noviembre de 2026)

- Mesas y circuitos de 2011 a 2025. De 1983 a 2009, hasta jurisdicción, con el aviso de por qué. El 5 de noviembre de 2026 el autor pidió sumar los departamentos de esos años (ver más abajo).
- Generales y segundas vueltas. Las PASO quedan para otro cambio.
- Página propia en Herramientas.
- Historia por circuito y por sección: en cada elección, las dos listas más votadas y la participación. La mesa no se sigue en el tiempo.

El autor dijo "como hablamos en su momento". Esa charla no está en las sesiones de Datina que se pudieron revisar. Lo único sobre mesas estaba en su proyecto electoral predictivo (`C:\Users\GCBA\Desarrollo aplicación electoral predictiva`), de donde salen las trampas de los archivos.

## Qué existe en cada período (revisado el 4 de noviembre de 2026)

| Período | Nivel más fino | Fuente | ¿Se publica? |
|---|---|---|---|
| 2011 a 2025 | Mesa | Dirección Nacional Electoral, archivos del "estándar de preservación". 2025 sale de datos.gob.ar. CC-BY 4.0 | Sí |
| 2003 a 2009 | Mesa | Atlas Electoral de Andy Tow, por medio de electorAr (`PoliticaArgentina/data_warehouse`) | No sin permiso. El proyecto electoral anotó que la licencia es CC BY-ND. El sitio del Atlas pide iniciar sesión y no se pudo comprobar de primera mano |
| 1983 a 2001 | Circuito y departamento | Base de Ernesto Calvo (el repositorio `azha2005/257arg` dice que no se redistribuye) y base de Lupu y Stokes (por departamento, solo PJ, UCR y otros) | Los circuitos, no sin permiso. Los departamentos sí, por decisión del autor: los publica 257arg con CC BY 4.0 |
| 1983 a 2009 | Jurisdicción | DINE, escrutinio definitivo: `datos/manual/presidenciales_provincia.csv` para presidente y un Excel por año para diputados y senadores | Sí |

Los senadores se eligen por voto directo desde 2001, y por eso no hay senadores antes. Para llegar más abajo hay que pedir permiso a Andy Tow y a Ernesto Calvo: lo decide y lo hace el autor.

## Cómo está armado

- `scripts/elecciones_mesas.py` arma `sitio/datos/mesas/` y `datos/manual/mesas_control.json`. Se corre una vez por elección nueva: 03 no toca esa carpeta y la actualización mensual tampoco.
- `sitio/datos/mesas/indice.json`: las elecciones, su nivel y lo que reúnen del definitivo.
- `sitio/datos/mesas/{eleccion}/pais.csv`: una fila por jurisdicción y lista. `{eleccion}` es `2023-general-presidente`, `2023-segunda-presidente`, `2025-general-diputados`.
- `sitio/datos/mesas/{eleccion}/{codigo_indec}.csv`: una fila por mesa, con una columna por lista. Es también la tabla que se descarga. Las columnas fijas son `seccion_id, seccion, circuito, mesa, electores, blancos, nulos, recurridos_impugnados`.
- `sitio/datos/mesas/circuitos/{codigo_indec}.csv`: cada sección (con `circuito` vacío) y cada circuito en cada elección, con las dos listas más votadas.
- `scripts/mesas.js`: el código de la página. 03 lo copia a `sitio/mesas.js` y lo pide solo `mesas.html`. Baja la tabla de la jurisdicción al elegirla y suma en el navegador. Las tablas no usan D3 ni DuckDB, y el mapa usa D3.
- `scripts/prueba_mesas.py`: la corre 03 al final. Lo publicado tiene que sumar exacto lo que el archivo de origen, jurisdicción por jurisdicción, y dar los resultados conocidos.
- No pasa por `tabla_larga.csv` (son millones de filas), y las tablas no van en el Catálogo: su glob mira solo `sitio/datos/*.csv`, y la página del Catálogo enlaza a la herramienta. No es una ficha, así que no necesita origen en `relaciones.json`.

Medido el 4 de noviembre de 2026: 47 elecciones (22 por mesa), 472 archivos, 87 MB. El mayor es `2025-general-diputados/06.csv`, 2,5 MB. El sitio queda en unos 1.350 archivos, lejos del límite de 20.000 de Cloudflare Pages, y ninguno cerca de los 25 MiB.

Cloudflare comprime el JSON y el texto, pero no el CSV. Por eso `sitio/_headers` (`MESAS_TEXTO` en `03_construir_sitio.py`) sirve `/datos/mesas/*` como `text/plain`: el archivo es el mismo, sigue llamándose `.csv` y los enlaces de descarga llevan el atributo `download`. El peor caso, una sección de Buenos Aires en diputados 2025 (las mesas y la historia), bajó de 5,0 a 1,1 MB, medido en la vista previa del PR #92. `prueba_mesas.py` frena si falta la regla. Las demás tablas CSV del sitio siguen sin comprimir: `tabla_larga.csv` baja 7,1 MB enteros.

Una trampa de esa regla: Cloudflare guarda los encabezados de la primera vez que sirve un archivo y, si el archivo no cambió, no los actualiza al revalidarlo (`cf-cache-status: REVALIDATED`). Las tablas pedidas en los 27 minutos entre el PR #91 y el #92 siguieron llegando como `text/csv` y sin comprimir. Por eso `mesas.js` las pide con `?v=` (`VERSION_TABLAS`). Un cambio futuro en cómo se sirven las tablas tiene que subir ese número. Los enlaces de descarga no lo llevan.

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

## El mapa por circuito (5 de noviembre de 2026)

Pedido del autor: "mapas coropléticos con colores por cada elección para ver los circuitos", como en `azha2005.github.io/257arg`, con el diseño de Datina. Respuestas del autor: va dentro de esta herramienta, la vista de todo el país pinta cada circuito, y los colores son los oficiales de cada fuerza ("rojo para UCR, el azul/celeste que conocés para el peronismo, LLA violeta, guiate por los colores del logo e históricamente vinculados"). El violeta y el rojo de `.claude/rules/visualizaciones.md` tienen acá esa excepción, igual que en el Congreso.

- `scripts/elecciones_mapa.py` arma `sitio/datos/mesas/geo/` (polígonos, 6,9 MB) y `sitio/datos/mesas/mapa/{eleccion}.json` (una fila por lugar, 4,7 MB). Se corre después de `elecciones_mesas.py`, una vez por elección: `python scripts/elecciones_mapa.py --fuentes CARPETA`, y `--solo-resultados` si no cambió la cartografía. Baja unos 150 MB si no los encuentra y tarda unos 5 minutos.
- `datos/manual/mesas_fuerzas.json`: cada lista con su fuerza y cada fuerza con su color. Se armó una vez con los colores de 257arg (CC BY 4.0) y se corrigió a mano. Una lista nueva va ahí: `prueba_mesas.py` frena si falta.
- Fila de `mapa/{eleccion}.json`: `[sección, circuito o circuitos, electores, votantes, [lista, votos, ...] de mayor a menor, circuitos de las mesas si no son esos]`.

Qué cartografía usa cada jurisdicción (`EDICION` en el script):

| Cartografía | Dónde | Por qué |
|---|---|---|
| sigE de la Cámara Nacional Electoral | 19 jurisdicciones | La más completa, cubre toda la provincia |
| Portal anterior de la Cámara | La Rioja, Mendoza, San Luis, Santa Cruz desde 2023 | El sigE rechaza esas descargas (403) |
| Franco Galeano, corte 2021 (CC BY 4.0) | Santa Fe y Santa Cruz hasta 2021 | Sus códigos son los de las mesas de esos años |
| Franco Galeano, corte 2025 (CC BY 4.0) | Santa Fe desde 2023 | La Cámara no trae códigos que se puedan unir |

No se usó Galeano en todo el país: según 257arg, corre CABA unos 500 metros en 2025 y Neuquén unos 230 en 2021, y en Río Negro cubre 15% de la superficie, San Luis 22%, Mendoza 70% y Tierra del Fuego 3%.

Cómo se une un circuito de las mesas con su polígono (`unir()`), en este orden, cada regla por un caso medido: mismo código y sección, el padre sin la letra (364A al 364), los hijos con letra (364 a 364A y 364B), los hijos con dos cifras más de Río Negro (43 a 4301), los parientes de Santa Fe desde 2023, que multiplicó por diez (120 a 121 y 122), el mismo código en otra sección si no se repite en la jurisdicción, y el polígono 0 de la sección, donde Río Negro y Catamarca juntan lo rural. Un grupo conexo de circuitos y polígonos es un lugar del mapa, y sus votos se cuentan una vez.

Si en una elección menos de 95% de los votantes de una jurisdicción encuentra su polígono, sus códigos no son los del mapa y esa elección se pinta sección por sección (`UNION_MINIMA`), en vez de arriesgar uniones falsas: Neuquén hasta 2017, Río Negro hasta 2013 y Tierra del Fuego hasta 2021. La página lo avisa. Con eso, en todas las elecciones por mesa y todas las jurisdicciones, al menos 99,6% de los votantes tiene su lugar en el mapa. `prueba_mesas.py` frena por debajo de 99%.

Control al armar: el mismo código tiene que caer en el mismo lugar que en Galeano. La mediana da 0 km en la mayoría. En Catamarca, Córdoba, La Rioja y Santiago del Estero da de 3 a 6 km porque ahí Galeano reconstruyó los circuitos rurales a mano, no porque el código signifique otra cosa. Queda en `datos/manual/mesas_geo_fuentes.json`.

El gris son circuitos sin mesas en esa elección: 100 de 1.146 en Buenos Aires, y buena parte de la superficie de Catamarca y Tierra del Fuego. Es cómo es el dato, no una unión fallida: pasa igual con la cartografía y las mesas del mismo año, 2025. Si vive gente en esos circuitos, vota en mesas de otro.

La página usa D3 y topojson, ya cargados, con una proyección plana a propósito: con `d3.geoMercator` un anillo que quedó con el giro al revés al simplificar pinta el mundo entero. Si no llega D3 o los polígonos, las tablas siguen andando y solo cae el mapa (`prueba_fallas.mjs`).

Otra elección con el mismo mapa: si su numeración de circuitos cambia, sumar un período en `PERIODOS` y revisar `EDICION`.

## Los departamentos de 1983 a 2009 (5 de noviembre de 2026)

El autor, ante la pregunta de qué hacer en esos años y con la advertencia del permiso a la vista: "usá por departamento". `scripts/elecciones_departamentos.py` lee los `dataset_*.json` de 257arg (20 elecciones: 6 de presidente y 14 de diputados) y la geometría de Rodríguez, CEUR-CONICET (CC BY 2.5 AR). Escribe `{eleccion}/{codigo_indec}.csv` con las columnas de las tablas por mesa, `mapa/{eleccion}.json`, `geo/dep{1991,2001,2010}/` y `geo/pais-dep*.topo.json`, y marca esas elecciones con `nivel: "departamento"` en `indice.json`. Se corre después de `elecciones_mesas.py` y `elecciones_mapa.py`: si `elecciones_mesas.py` reescribe el índice, hay que volver a correrlo con `--solo-resultados`.

**El riesgo que el autor aceptó**: 257arg publica estos agregados con CC BY 4.0, pero de 1983 a 2001 salen de la base de Ernesto Calvo, que el mismo 257arg dice que no redistribuye por no tener documentado el permiso, y de 2003 a 2009 de PolAr, a partir del Atlas de Andy Tow, con una licencia que el proyecto electoral del autor anotó como CC BY-ND. La página cita las tres fuentes. Si Calvo o Tow lo piden, se saca con correr el script sin esas elecciones.

Cómo se usa: el total de cada jurisdicción sigue siendo el oficial de la DINE. Los departamentos van en el mapa y en la tabla de abajo, con el aviso de que no son el escrutinio definitivo.

Trampas de esos archivos:

- **Unidades sin dato propio**: 257arg pone el total de la provincia en un departamento y lo avisa en su `note` ("Sin dato propio"). Sin sacarlo, Tucumán 1991 sumaba 193% (Yerba Buena), y Jujuy y Salta 2001, el doble. Esas unidades no se usan.
- **Provincia repetida en cada departamento**: San Luis 1997 y 1999, Santa Cruz 1999, La Pampa 2003. Se detecta por las líneas idénticas, y se pinta la jurisdicción entera.
- **CABA**: 28 circunscripciones hasta 2007, sin geometría publicada (la de 257arg sale de un archivo que no está en su repositorio). La tabla las lista y el mapa la pinta entera. En 2009 ya son comunas.
- **Nombres**: "Gnral.", "Crnel." y otras abreviaturas se normalizan en `clave()`. La Rioja renombró tres departamentos (General Lavalle a Coronel Felipe Varela, General Sarmiento a Vinchina, Gobernador Gordillo a Chamical): `ALIAS_PROV`. Lo que se une por parecido queda en `datos/manual/mesas_departamentos_control.json`. Queda sin par solo 2 de Abril (Chaco, 1993), creado después del mapa de 1991.
- **Fuerzas**: 257arg arma bloques con color (`candidates` sin `P_`). Los que coinciden con una fuerza del mapa por circuito toman su color. En las presidenciales cada candidato conserva el suyo: en 2003, Menem, Kirchner y Rodríguez Saá son peronistas y compiten entre sí.

Cuánto suman contra el definitivo, en `suma` de cada jurisdicción: casi exacto de 1983 a 1989 y en 1995. Lo más lejos: Formosa diputados 2007 (87,7%) y San Juan presidente 2003 (116,1%). La página avisa si la diferencia pasa de 3%. `prueba_mesas.py` frena fuera de 85% a 118%, porque sería un total que se coló. Diputados 2003 sale de dat.ar y sus cifras no cierran: la página lo dice.

Los senadores de 2001 a 2009 siguen por jurisdicción, con el resultado oficial: `geo/provincias.topo.json`.

## Lo que falta

- Las PASO: 2015 no se puede bajar por mesa y 2023 sale de una copia del Internet Archive.
- Los locales de votación: el archivo de 2025 los trae (escuela y dirección).
- Mesas de 2003 a 2009 y circuitos de 1983 a 2001, con permiso de sus autores.
- Los límites de las 28 circunscripciones de CABA hasta 2007.
- Las elecciones de 1912 a 1973 por departamento: 257arg las tiene, con geometría de cada época.
