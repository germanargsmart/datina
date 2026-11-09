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
| 2011 a 2021 | Jurisdicción, definitivo | DINE: Excel por año (2011 a 2019), un CSV en ZIP (2017) y un RAR con un Excel por distrito exportado del sistema de la Cámara (2021) | Sí |
| 2023 y 2025 | Jurisdicción, definitivo | Cámara Nacional Electoral: actas de escrutinio definitivo de cada junta, escaneadas, transcriptas en `datos/manual/mesas_definitivo_actas.csv` | Sí |
| 2011 a 2025 | Mesa, definitivo | Cámara Nacional Electoral, `padron.gob.ar/publica`: de a una consulta y con código de seguridad | No como datos |
| 2023 | Exterior por mesa y país | Cámara Nacional Electoral, padrón del Registro de Electores Residentes en el Exterior: país, consulado, mesa, distrito y electores. Votos por país: ninguna fuente | El padrón sí |

Los senadores se eligen por voto directo desde 2001, y por eso no hay senadores antes. Para llegar más abajo hay que pedir permiso a Andy Tow y a Ernesto Calvo: lo decide y lo hace el autor.

## El escrutinio definitivo (pedido del autor del 5 de noviembre de 2026)

El autor pidió "para todas las elecciones el escrutinio definitivo y no el provisorio". Ningún organismo publica el definitivo mesa por mesa como datos: la Cámara lo muestra en `padron.gob.ar/publica`, de a una consulta y con un código de seguridad (captcha), que está para que no lo lea un programa, así que no se baja de ahí. La DINE y las actas de la Cámara traen el total de cada distrito. El autor eligió (respuesta del mismo día): el total del país y el de cada jurisdicción con el definitivo, en todas las elecciones, y las secciones, los circuitos y las mesas con el provisorio, rotulados, con lo que reúnen a la vista.

- `scripts/elecciones_definitivo.py` escribe `sitio/datos/mesas/{eleccion}/definitivo.csv` (una fila por jurisdicción y lista, con el nombre de lista de las mesas) y suma a cada elección del índice `definitivo` (fuente) y `cobertura`. Se corre después de los otros cuatro programas: `elecciones_mesas.py` reescribe el índice. No baja más de unos MB.
- Las actas de 2023 (general y segunda vuelta) y 2025 son escaneos. Se transcribieron el 5 de noviembre de 2026 con la página de cada número, y cada distrito cierra: las listas, los blancos y los nulos suman exacto los emitidos. Los recurridos e impugnados ya vienen resueltos (declarados válidos, nulos o blancos) y están dentro de esos totales: se anotan, no se suman. El total nacional de 2023 da exacto el oficial (Massa 9.853.492, Milei 8.034.990, Bullrich 6.379.023).
- Errores de las actas, anotados en `datos/manual/mesas_definitivo_control.json`: San Juan y Corrientes en 2023 y Corrientes y Santa Fe en 2025 escriben un total de afirmativos que suma o resta los blancos o los nulos (manda la suma de las listas, que cierra con los emitidos). Corrientes 2025 dice 651.679 electores y su propio 59,99% da 951.679 (`CORRECCIONES`). San Luis no dice cuántos electores tiene: se usa el padrón por distrito de la Cámara (`total_electores_2023.zip` y `total_electores2025.zip`), que no cuenta el exterior.
- El nombre de cada lista del definitivo se empareja con el de las mesas (`emparejar()`): igual, por palabras (con abreviaturas como "Izq." y "Trab."), y por último la única con votos compatibles. Todos los pares se revisaron a mano. Los que parecen raros son la misma lista: en San Juan 2011 la UCR fue dentro de UDESO, y en Santa Fe 2023 la lista de Schiaretti se llamó "La Fuerza de Santa Fe".
- La página: el país y cada jurisdicción con el definitivo, y la tabla de secciones dice "Escrutinio provisorio" y qué parte del definitivo reúnen las mesas. Si `definitivo.csv` no llega, muestra la suma de las mesas y lo avisa.

## El exterior y las cárceles (pedido del autor del 5 de noviembre de 2026)

"Sumen las actas de voto en el exterior y lo pongas aparte, y en un desplegable pueda ver país por país, y el voto en las cárceles." El autor pidió buscar qué une cada mesa con su país. Lo encontrado:

- El sistema de la Cámara guarda el exterior de cada distrito como una sola sección (900), un solo circuito y una sola mesa, y las cárceles como otra (800): se ve en los menús de `padron.gob.ar/publica`, que se cargan sin código, y en el Excel de 2021 de la DINE ("Residentes Exterior: 1 mesa"). Los votos país por país no existen en ningún sistema público: solo en las actas de cada consulado, en papel.
- Lo que sí une la mesa con el país es el padrón del exterior de 2023 de la Cámara (`ResidentesExteriorGenerales2023.rar`): país, consulado, número de mesa, distrito por el que vota y electores. Va en `sitio/datos/mesas/exterior/padron-2023.csv` (449.909 electores, 86 países, 302 mesas), con los errores de tipeo de la fuente corregidos (`PAISES` y `CIUDADES`). No hay padrón de otros años en la página de la Cámara.
- En la segunda vuelta de 2023 la Cámara publicó aparte el total del exterior (RERE) y el de las cárceles (REPL), en planillas que titula "consulta provisoria de totales". Siete actas de distrito dicen que no los incluyen y la suma de los 24 distritos da Milei 14.554.560 y Massa 11.598.720. Por eso van en `definitivo.csv` con los códigos `EX` y `PL`, la página los muestra aparte y no los suma al país. En las demás elecciones van dentro del total de cada distrito (las actas cuentan sus mesas especiales).
- La página: un bloque debajo de las jurisdicciones, en la vista del país, con el exterior y las cárceles cuando están aparte y el desplegable del padrón en las elecciones de 2023 (`?pais=` guarda el país elegido).

## Cómo está armado

- `scripts/elecciones_mesas.py` arma `sitio/datos/mesas/` y `datos/manual/mesas_control.json`. Se corre una vez por elección nueva: 03 no toca esa carpeta y la actualización mensual tampoco.
- `sitio/datos/mesas/indice.json`: las elecciones, su nivel y lo que reúnen del definitivo.
- `sitio/datos/mesas/{eleccion}/pais.csv`: una fila por jurisdicción y lista. `{eleccion}` es `2023-general-presidente`, `2023-segunda-presidente`, `2025-general-diputados`.
- `sitio/datos/mesas/{eleccion}/{codigo_indec}.csv`: una fila por mesa, con una columna por lista. Es también la tabla que se descarga. Las columnas fijas son `seccion_id, seccion, circuito, mesa, electores, blancos, nulos, recurridos_impugnados`.
- `sitio/datos/mesas/circuitos/{codigo_indec}.csv`: cada sección (con `circuito` vacío) y cada circuito en cada elección, con las dos listas más votadas.
- `scripts/mesas.js`: el código de la página. 03 lo copia a `sitio/mesas.js` y lo pide solo `mesas.html`. Baja la tabla de la jurisdicción al elegirla y suma en el navegador. Las tablas no usan D3 ni DuckDB, y el mapa usa D3.
- `scripts/prueba_mesas.py`: la corre 03 al final. Lo publicado tiene que sumar exacto lo que el archivo de origen, jurisdicción por jurisdicción, y dar los resultados conocidos. Desde el 5 de noviembre de 2026 también controla el definitivo de cada elección por mesa (todas las jurisdicciones, las sumas y el resultado nacional), los nombres oficiales de las secciones de Santa Fe, el padrón del exterior y el fondo del mapa.
- Orden para rearmar todo: `elecciones_mesas.py`, `elecciones_mapa.py`, `elecciones_departamentos.py`, `elecciones_antiguas.py`, `elecciones_definitivo.py` y `elecciones_jurisdiccion.py`. `elecciones_mesas.py` borra `sitio/datos/mesas/` entero: para cambiar solo las elecciones por mesa conviene correrlo hacia otra carpeta y copiar lo suyo, como se hizo el 5 de noviembre de 2026 (comparando: todo lo que no era Santa Fe dio igual byte por byte).
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
- El código de sección es estable de 2011 a 2025 en 23 jurisdicciones. Lo que cambia es la escritura ("Matanza", "La Matanza", "LA MATANZA"). Se usa el nombre más largo que no venga todo en mayúsculas.
- **Santa Fe renumeró sus secciones en 2023** (encontrado el 5 de noviembre de 2026). Hasta 2021 la DINE las numeraba por orden alfabético (1 Belgrano, 9 La Capital, 13 Rosario) y en 2011 y 2013 partía La Capital (la 10) y Rosario (la 14 y la 15), sin nombre. Desde 2023 usa el código oficial (1 La Capital, 13 Rosario, 17 Belgrano). Como se suponía estable, las secciones de Santa Fe llevaban el nombre de otro departamento en todas las elecciones y la historia mezclaba dos. `SANTA_FE_HASTA_2021` pasa cada una al código de 2023, con su nombre oficial: las filas son las mismas y solo cambian el código y el nombre.
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

La tabla de secciones de cada jurisdicción lo dice siempre, y por debajo de 97% (`COBERTURA_AVISO` en `mesas.js`) también las secciones y los circuitos. Desde el 5 de noviembre de 2026 se mide en todas las elecciones por mesa (`elecciones_definitivo.py`): 2021 reúne 98,5% en diputados, 2023 98,1% en presidente (la menor, San Juan, 94,9%), la segunda vuelta 99,4% y 2025 99,0%. `prueba_mesas.py` frena si una jurisdicción sale de 75% a 101,5%.

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
| Portal anterior de la Cámara | La Rioja, Mendoza, San Luis y Santa Cruz | El sigE rechaza esas descargas (403). En Santa Cruz hasta 2021, que usaba otra numeración, se pinta sección por sección (`POR_SECCION`) |
| Departamentos del IGN (`sitio/datos/departamentos.topo.json`, de Georef) | Santa Fe | La Cámara no permite bajar sus circuitos ("un administrador deshabilitó la exportación de esta capa") ni trae códigos que se puedan unir. Se pinta por departamento |

Solo cartografía oficial, por pedido del autor del 5 de noviembre de 2026 ("Solo deja fuentes oficiales"): hasta ese día Santa Fe y Santa Cruz hasta 2021 usaban la de Franco Galeano (CC BY 4.0), y `geo/g21` y `geo/g25` se borraron. Ese día la Cámara rechazaba desde la nube el portal anterior entero ("Request Rejected") y el sigE de Santa Fe y Santa Cruz, así que el mapa se rearmó con `--desde-publicado`, que lee los circuitos de la geometría ya publicada y solo dibuja lo que cambia. En Mendoza (8), San Luis (11) y Santa Cruz (11) había circuitos sin sección en esa cartografía (no se pudo leer el nombre del departamento): toman la de sus mesas (`reparar_secciones()`), sin tocar la geometría.

**Ninguna provincia gris** (pedido del autor del 5 de noviembre de 2026: "algunas provincias queda gris, todo gris"). No faltaban mesas: era la cartografía. La Cámara dibuja en Catamarca, La Rioja y Tierra del Fuego los pueblos como circuitos y deja el campo como un polígono 0 por sección, sin mesas, y en Formosa dibuja casi solo los pueblos. Ahora:
- debajo de los circuitos va el fondo `geo/base.topo.json`: los 527 departamentos del IGN con su sección electoral (`ALIAS_IGN` y `clave_nombre()` para los que se escriben distinto, como "Nueve de Julio" y "9 de Julio"),
- lo que no tiene mesas propias (el fondo, el polígono 0, un circuito sin mesas o con mesas sin cargar) se pinta rayado con el resultado de toda su sección (`porSeccion()` y `rayas()` en `mesas.js`), con su fila en la leyenda y su explicación al pasar. Tocarlo elige la sección.
- el gris queda solo donde el provisorio no tiene nada: las provincias que no eligen senadores, Antofagasta de la Sierra en 2019 (el provisorio no trae ninguna de sus mesas) y en la segunda vuelta de 2023 (trae sus 7 mesas sin un voto cargado), y Tolhuin en 2015 (no era una sección). La leyenda dice "Sin mesas o sin votos cargados en el provisorio".

Cómo se une un circuito de las mesas con su polígono (`unir()`), en este orden, cada regla por un caso medido: mismo código y sección, el padre sin la letra (364A al 364), los hijos con letra (364 a 364A y 364B), los hijos con dos cifras más de Río Negro (43 a 4301), los parientes de Santa Fe desde 2023, que multiplicó por diez (120 a 121 y 122), el mismo código en otra sección si no se repite en la jurisdicción, y el polígono 0 de la sección, donde Río Negro y Catamarca juntan lo rural. Un grupo conexo de circuitos y polígonos es un lugar del mapa, y sus votos se cuentan una vez.

Si en una elección menos de 95% de los votantes de una jurisdicción encuentra su polígono, sus códigos no son los del mapa y esa elección se pinta sección por sección (`UNION_MINIMA`), en vez de arriesgar uniones falsas: Neuquén hasta 2017, Río Negro hasta 2013 y Tierra del Fuego hasta 2021. La página lo avisa. Con eso, en todas las elecciones por mesa y todas las jurisdicciones, al menos 99,6% de los votantes tiene su lugar en el mapa. `prueba_mesas.py` frena por debajo de 99%.

Hasta el 5 de noviembre de 2026 había un control contra la cartografía de Galeano (el mismo código en el mismo lugar): salió con ella.

Al rearmar con la geometría publicada cambió un detalle en Catamarca y Formosa: unos pocos circuitos (por ejemplo 13|110 y 16|148 en Catamarca) no tienen polígono en la geometría publicada, porque el simplificado los borró por diminutos, y antes apuntaban a un dibujo que no existía. Ahora caen en el polígono 0 de su sección.

La página usa D3 y topojson, ya cargados, con una proyección plana a propósito: con `d3.geoMercator` un anillo que quedó con el giro al revés al simplificar pinta el mundo entero. Si no llega D3 o los polígonos, las tablas siguen andando y solo cae el mapa (`prueba_fallas.mjs`).

Otra elección con el mismo mapa: si su numeración de circuitos cambia, sumar un período en `PERIODOS` y revisar `EDICION`.

## Los departamentos de 1983 a 2009 (5 de noviembre de 2026)

El autor, ante la pregunta de qué hacer en esos años y con la advertencia del permiso a la vista: "usá por departamento". `scripts/elecciones_departamentos.py` lee los `dataset_*.json` de 257arg (20 elecciones: 6 de presidente y 14 de diputados) y la geometría de Rodríguez, CEUR-CONICET (CC BY 2.5 AR). Escribe `{eleccion}/{codigo_indec}.csv` con las columnas de las tablas por mesa, `mapa/{eleccion}.json`, `geo/dep{1991,2001,2010}/` y `geo/pais-dep*.topo.json`, y marca esas elecciones con `nivel: "departamento"` en `indice.json`. Se corre después de `elecciones_mesas.py` y `elecciones_mapa.py`: si `elecciones_mesas.py` reescribe el índice, hay que volver a correrlo con `--solo-resultados`.

**El riesgo que el autor aceptó**: 257arg publica estos agregados con CC BY 4.0, pero de 1983 a 2001 salen de la base de Ernesto Calvo, que el mismo 257arg dice que no redistribuye por no tener documentado el permiso, y de 2003 a 2009 de PolAr, a partir del Atlas de Andy Tow, con una licencia que el proyecto electoral del autor anotó como CC BY-ND. La página cita las tres fuentes. Si Calvo o Tow lo piden, se saca con correr el script sin esas elecciones.

**La mención visible** (pedido del autor del 5 de noviembre de 2026: "257 AR como fuente, eso sácalo. Solo deja fuentes oficiales", y ante la pregunta de si sacar también sus datos, "saca la mención, no el trabajo hecho"): el pie de la herramienta y las notas del mapa y de las tablas nombran a los autores originales (Cantón, Lupu y Stokes, Calvo, PolAr), y 257arg queda solo como crédito en "Para entender los datos", porque su licencia CC BY 4.0 obliga a citarlo mientras se usen sus transcripciones y sus colores de partida. Para que no aparezca en ningún lado habría que sacar esos datos.

Cómo se usa: el total de cada jurisdicción sigue siendo el oficial de la DINE. Los departamentos van en el mapa y en la tabla de abajo, con el aviso de que no son el escrutinio definitivo.

Trampas de esos archivos:

- **Unidades sin dato propio**: 257arg pone el total de la provincia en un departamento y lo avisa en su `note` ("Sin dato propio"). Sin sacarlo, Tucumán 1991 sumaba 193% (Yerba Buena), y Jujuy y Salta 2001, el doble. Esas unidades no se usan.
- **Provincia repetida en cada departamento**: San Luis 1997 y 1999, Santa Cruz 1999, La Pampa 2003. Se detecta por las líneas idénticas, y se pinta la jurisdicción entera.
- **CABA**: 28 circunscripciones hasta 2007, sin geometría publicada (la de 257arg sale de un archivo que no está en su repositorio). La tabla las lista y el mapa la pinta entera. En 2009 ya son comunas.
- **Nombres**: "Gnral.", "Crnel." y otras abreviaturas se normalizan en `clave()`. La Rioja renombró tres departamentos (General Lavalle a Coronel Felipe Varela, General Sarmiento a Vinchina, Gobernador Gordillo a Chamical): `ALIAS_PROV`. Lo que se une por parecido queda en `datos/manual/mesas_departamentos_control.json`. Queda sin par solo 2 de Abril (Chaco, 1993), creado después del mapa de 1991.
- **Fuerzas**: 257arg arma bloques con color (`candidates` sin `P_`). Los que coinciden con una fuerza del mapa por circuito toman su color. En las presidenciales cada candidato conserva el suyo: en 2003, Menem, Kirchner y Rodríguez Saá son peronistas y compiten entre sí.

Cuánto suman contra el definitivo, en `suma` de cada jurisdicción: casi exacto de 1983 a 1989 y en 1995. Lo más lejos: Formosa diputados 2007 (87,7%) y San Juan presidente 2003 (116,1%). La página avisa si la diferencia pasa de 3%. `prueba_mesas.py` frena fuera de 85% a 118%, porque sería un total que se coló. Diputados 2003 sale de dat.ar y sus cifras no cierran: la página lo dice.

Los senadores de 2001 a 2009 siguen por jurisdicción, con el resultado oficial: `geo/provincias.topo.json`.

## De 1912 a 1973 (5 de noviembre de 2026)

El autor eligió seguir con estos años entre los datos de 257arg que quedaban. `scripts/elecciones_antiguas.py` lee 20 atlas (7 de presidente, contando las dos de 1973, y 13 de diputados), con la geometría de Rodríguez de cada época: 1914 hasta 1940, 1947 para 1946 y 1948, 1960 de 1954 a 1962 y 1970 para 1965 y 1973. Escribe `{eleccion}/pais.csv`, `{eleccion}/{codigo_indec}.csv`, `mapa/{eleccion}.json`, `geo/dep{1914,1947,1960,1970}/`, `geo/circ1951/` y `geo/pais-*.topo.json`, suma las elecciones a `indice.json` y cambia `desde` en `mesas_control.json`, de donde sale el año de la página (`correr_02_con_fecha.py` lo lleva al resumen). Va en un programa aparte para no tocar lo que ya andaba de 1983 en adelante, y usa las funciones de `elecciones_departamentos.py`. Si `elecciones_mesas.py` reescribe el índice, hay que correr los dos.

La diferencia con 1983 a 2009: acá no hay total oficial como datos. `pais.csv` suma lo que trae la fuente, y `reune` compara con el resultado nacional del atlas. La página lo dice si baja de 95% o pasa de 102%.

| Elección | Reúne | Lo más importante |
|---|---|---|
| 1912 | 40,5% | 4 jurisdicciones |
| 1914 | 78,4% | 8 jurisdicciones |
| 1916 a 1930 | 85,5% a 103,2% | 8 a 15 jurisdicciones |
| 1937 | 36,9% | 4 jurisdicciones |
| 1940 | 60,9% | 5 jurisdicciones |
| 1946 | 100% | Perón 53,7%, igual que el resultado nacional |
| 1948 | 89,3% | Lupu y Stokes: pocas fuerzas |
| 1951 | 100% | Por circunscripción, con los límites aproximados de 257arg |
| 1954 a 1965 | 97,4% a 100% | Frondizi 49,5% en 1958, igual que el resultado nacional |
| 1973 | 94,3% y 93,5% | Lupu y Stokes: pocas fuerzas |

Trampas:

- **Una lista en la fuerza equivocada**: en septiembre de 1973 Perón daba 86,3% y el resultado nacional dice 61,9%. Se asignaba cada lista al bloque ganador del primer lugar que encabezaba, y donde la UCR salía primera entre listas sueltas el bloque era el de Perón, que suma dos. Ahora manda el color del bloque, también en `elecciones_departamentos.py`. `prueba_mesas.py` controla cinco repartos.
- **Códigos repetidos en la base**: el mapa de 1947 repite el código de La Plata y Las Conchas, y el de Montecarlo y San Pedro. Al disolver eran un solo polígono: `codigo_geo()`.
- **Nombres viejos**: `ALIAS_ANTIGUOS`, con cada equivalencia por provincia. El parecido de letras mandaba Tercero Abajo a Tercero Arriba, que es otro departamento. Quedan sin polígono solo unos pocos, como General Taboada hasta 1930, Rivadavia en La Rioja de 1946 a 1958 y dos partidos creados después del mapa de 1960: están en `datos/manual/mesas_antiguas_control.json`, con todo lo unido por parecido.
- **CABA**: 20 secciones hasta 1965. El mapa de 1960 y el de 1970 traen distritos escolares, así que se usan las secciones de `Departamentos_1960_secc CF`. En 1973 son 28: se pinta entera.
- **Comodoro Rivadavia** (1951): gobernación militar de entonces. Se suma a Chubut en las tablas.

Lo que hay que tener presente al leer: hasta 1948 votaban solo los varones, los territorios nacionales no votaban, antes de 1973 (salvo 1951) se votaba a electores, hubo denuncias de fraude en los años treinta y el peronismo estuvo proscripto en la mayor parte de las elecciones de 1955 a 1972. La página lo dice en "Qué no dice este dato".

## Gobernadores y senadores por la Capital de 1983 a 1995 (7 de noviembre de 2026)

Pedido del autor: "sumá los senadores por la Capital y los gobernadores". El mapa de las fuentes de cada jurisdicción está en `docs/roadmap/ELECCIONES_PROVINCIAS.md`. Solo fuentes oficiales: el autor pidió además quitar las licencias y presentar como propios los datos de otros (las tablas de Andy Tow que trae PolAr, el CD de Cantón y Jorrat, la tesis de Solís Carnicer), y eso no se hizo. Donde no hay un escrutinio oficial en línea, la elección queda como hueco y la página lo dice.

- `datos/manual/mesas_jurisdiccion.csv`: una fila por elección, jurisdicción y lista, con `cargo` (gobernador o senadores), la fecha, los totales repetidos en cada fila, la fuente, la dirección del documento y una nota para la página. Transcripto el 7 de noviembre de 2026 a mano, con la ayuda de `pdftotext`, desde los documentos de cada organismo:
  - Buenos Aires, 1983 a 2023: PDF de gobernador de la Junta Electoral (`juntaelectoral.gba.gov.ar/resultados/`) y sus CSV de 2003 en adelante (`provinciaEstadisticasHistoricasAcsv.php`, por POST con el año), que dan exacto lo mismo.
  - CABA, 2000 a 2023 (jefe de Gobierno): el Tribunal Superior de Justicia (la carpeta "Elecciones anteriores" de su sitio y sus acordadas) y el Tribunal Electoral (2023). 2015 coincide exacto con la suma de BA Data por mesa.
  - Tucumán, 2003 a 2023: la Junta Electoral Provincial. En 2015, 2019 y 2023 coincide exacto con la suma de sus PDF mesa por mesa.
  - Entre Ríos, 1983, 1991, 1999 y 2011 a 2023: el archivo electoral del gobierno provincial (planillas de la DINE y del Ministerio del Interior, por una API pública), el Tribunal Electoral (2019) y la Dirección de Estadística y Censos (2023).
  - Corrientes, 1983 a 2017 y 2025: la Subdirección de Cómputos (`elecciones.corrientes.gob.ar`: el servidor no manda su certificado intermedio, Sectigo OV R36, y hay que sumarlo sin apagar la verificación) y la API de la Junta Electoral (2025).
  - Senadores por la Capital: las planillas de la DINE de 1983, 1989, 1992 y 1995.
  - Las otras 19 jurisdicciones, transcriptas el 8 de noviembre de 2026 (PR #112), cada una con su organismo en `ELECCIONES_PROVINCIAS.md`: Córdoba (2003 a 2023), Santa Fe (1991 a 2023), Mendoza (2019 y 2023), Chubut (1983 a 2023), Misiones (1975 y 1983 a 2023), Chaco (1983 a 2023, con la segunda vuelta de 1995), Jujuy (1983 y 2003 a 2023), Salta (2011 a 2023), Catamarca (2019 y 2023), La Rioja (2019), San Juan (2019), Santiago del Estero (2013 y 2017), Santa Cruz (2019), Tierra del Fuego (la segunda vuelta de 2003, 2019 y 2023) y Neuquén, Río Negro y La Pampa (2019 y 2023). San Luis y Formosa no tienen nada accesible desde la nube. Cuando la provincia no publica su escrutinio, la fuente es la Dirección Nacional Electoral (su Observatorio Político Electoral en 2019 y sus informes de 2023, solo los que dicen "escrutinio definitivo") o el acta de la Junta Electoral Nacional, cuando se votó con las nacionales.
  - `datos/manual/mesas_jurisdiccion_pendiente.csv`: lo oficial anterior a 1983 que todavía no entra en la página (Catamarca, La Rioja y Santiago del Estero en 1946 y 1949, Chaco en 1973), con las mismas columnas. Espera el paso de 1912 a 1983.
- `scripts/elecciones_jurisdiccion.py` lee ese CSV y escribe `{eleccion}/pais.csv`, `mapa/{eleccion}.json` (el mapa por jurisdicción, con `geo/provincias.topo.json`) y las elecciones del índice, marcadas con `"origen": "jurisdiccion"`, con `fechas`, `fuentes`, `notas`, `sin_fuente`, `fuera`, `gris` y `nota_nivel` (los lee `mesas.js`). Antes de escribir saca lo que armó la vez anterior, así que correrlo dos veces da lo mismo. Frena si una fila no tiene fuente o dirección, si los totales de una jurisdicción no se repiten igual, si hay un punto y coma en un texto visible o si las listas, los blancos y los nulos no suman los votantes. Las excepciones, con su diferencia exacta, están en `DIFERENCIAS` (18 el 8 de noviembre de 2026), y la nota de cada una lo dice: Corrientes 2017 (las alianzas suman 9 votos más que los válidos del mismo documento) y 2025 (230 votos de personas privadas de libertad que la Junta no reparte entre las fórmulas), y los documentos que no cierran, casi todos de 1987 en los informes de la DINE.
- `CALENDARIO`: las elecciones de gobernador de cada una de las 24 jurisdicciones desde 1983 ("AAAA" la general y "AAAA segunda" el balotaje), según `ELECCIONES_PROVINCIAS.md`, con las de años distintos (Catamarca 1988, Córdoba 1998, Santiago del Estero 2002, 2005 y 2008, Corrientes 1993 y 2001). Lo que está en el calendario y no tiene datos se votó sin escrutinio oficial en línea: el programa lo calcula (`sin_fuente()`) y la página dice "votó, pero no hay un escrutinio oficial publicado en línea". Lo que no está en el calendario no se votó: con las 24 mapeadas, la página dice "no eligió gobernador en esta elección". Una elección cargada que no está en su calendario frena el programa. Las de un año sin ninguna jurisdicción con fuente no tienen elección en la página: CABA 1996, Córdoba 1998, Santiago del Estero 2002 y 2008, Corrientes 2021 y la segunda vuelta de Corrientes 2001, entre otras.
- Los colores: primero las reglas que dependen de la jurisdicción y del año (`PRIMERO`: el Frente de Todos de Corrientes antes de 2019 y Encuentro por Corrientes antes de 2015 son de la UCR, el autonomismo y el liberalismo correntinos van con el Pacto Autonomista Liberal), después `mesas_fuerzas.json` y por último `REGLAS`. Tres fuerzas nuevas, solo en estos mapas: la Alianza de 1999, el Frente País Solidario y el Pacto Autonomista Liberal. Lo que no entra en ninguna va en "Otras fuerzas", como el Partido Nuevo de Corrientes o Fuerza Porteña. Desde el PR #112, los frentes provinciales que no dejan dudas: el Frente Progresista de Santa Fe con el socialismo, los frentes del PJ de cada provincia con el peronismo (el Frente Chaqueño, Elegí en Mendoza, Juntos en Santa Fe en 2019), los de Cambiemos con su color, y Chubut Somos Todos y el Partido Acción Chubutense con el suyo. Los que no son claros quedan en "Otras fuerzas", como Sáenz en Salta o Melella en Tierra del Fuego.
- Decisiones de la transcripción: los nombres de las listas sin los candidatos (unas fuentes los traen y otras no), y la fórmula electa en la nota cuando un documento oficial la nombra. Cuando varias listas llevaron la misma fórmula y la fuente acumula sus votos (Buenos Aires 1999, CABA 2000 a 2011), van en una sola fila con todos los nombres (`suma_a`). Corrientes 1983 y 1987 detallan solo los partidos más votados: el resto va como "Otras listas sin detalle en la fuente", con la diferencia exacta. Sin electores donde la fuente no los da, o donde no cuenta a todos los que votan (CABA 2011 y 2015, sin los extranjeros): ahí no hay participación.
- Errores de las fuentes corregidos, cada uno en su nota: Buenos Aires 1991 (2.771.3644, un dígito de más) y 2003 (los blancos del PDF no cierran y los del CSV de la Junta sí), y nombres mal escritos en CABA (Micheti, Guidici). La lista 72 de CABA en 2000 se llama "Blanco": va como Partido Blanco, para no confundirla con los votos en blanco.
- `prueba_mesas.py` controla que cada jurisdicción publicada dé lo mismo que lo transcripto, que lleve fecha y fuente, que ninguna figure a la vez con datos y sin fuente y quién ganó en 48 elecciones conocidas, al menos una de cada jurisdicción con datos.
- Para sumar una elección: sus filas en `mesas_jurisdiccion.csv`, que esté en el `CALENDARIO` de su jurisdicción y `python scripts/elecciones_jurisdiccion.py`. Si `elecciones_mesas.py` reescribe el índice, hay que volver a correrlo.

### Por departamento y por mesa (pedido del autor del 7 de noviembre de 2026, PR #111)

"Seguí con los departamentos y mesas", después de unir el #110. Mismas reglas: solo fuentes oficiales.

- `datos/manual/mesas_jurisdiccion_departamentos.csv`: una fila por elección, departamento y lista, con el código del INDEC del departamento en la cartografía de su época (`epoca()`: hasta 1993 la de 1991, hasta 2007 la de 2001, después la de 2010) y la fuente de cada fila. Las listas llevan el mismo nombre que en `mesas_jurisdiccion.csv` y el programa las acumula igual. Cubre Buenos Aires por partido de 2003 a 2023 (CSV por distrito de la Junta Electoral, con el código del INDEC y los electores del CSV del Ministerio de Gobierno), Entre Ríos en 1991, 1999 y de 2011 a 2023, Tucumán de 2015 a 2023 (suma de sus mesas), CABA por comuna de 2011 a 2023 y por circunscripción en 2000 y 2007, y Corrientes en 1991, 1993, 1997, 2001, 2009, 2013, 2017 (Subdirección de Cómputos) y 2025 (Junta Electoral, por municipio, llevado a departamento). En Corrientes 2017 las alianzas suman de 1 a 47 votos más que los válidos del mismo documento en 13 departamentos: se publican como vienen, con un tope por departamento (`DIFERENCIAS_DEP`).
- `datos/manual/mesas_gobernador/{eleccion}-{codigo_indec}.csv`: una fila por mesa, con el departamento, el circuito sin ceros adelante, la mesa, los electores (0 donde la fuente no los da), blancos, nulos y recurridos (en CABA 2023, con los votos de comando). Tucumán de 2015 a 2023 (la Junta Electoral Provincial, definitivo), Corrientes en 2013 y 2017 (la Subdirección de Cómputos, definitivo) y 2025 (la API de la Junta Electoral, definitivo, sin las 45 mesas de las personas privadas de libertad, que la Junta publica aparte: sus 230 votos positivos están en el total de la jurisdicción sin repartir entre las fórmulas y en los departamentos, sumados en cada municipio) y CABA en la segunda vuelta de 2007 (planilla del Tribunal Superior, anterior a resolver 79 votos recurridos), 2015, 2019 y 2023 (BA Data: definitivo, salvo 2023, provisorio). Desde el PR #112, Buenos Aires, Entre Ríos y Jujuy en 2011, del provisorio por mesa de la DINE (`2011-provisorios_generales.zip`, el mismo de las elecciones nacionales, que trae también el gobernador de San Juan, San Luis y Santa Cruz, sin total oficial en línea). Jujuy no tiene departamentos oficiales: el mapa la pinta entera con el total oficial y la tabla baja por departamento hasta la mesa, y al provisorio le falta Valle Grande entero. Cada sección de la DINE se une por nombre con el departamento de la tabla oficial de la misma elección (los que se escriben distinto, como "Matanza" y "La Matanza", se unieron uno por uno). La sección 2 de Entre Ríos, sin nombre en 2011 y 2013, es la parte rural de Paraná: sus 39 circuitos pasan a la sección de Paraná desde 2015. Las mesas de CABA de las personas privadas de libertad que no tienen comuna quedan afuera, y en 2015 los extranjeros y las cárceles van en una fila por comuna.
- La elección pasa a `nivel: "departamento"` si alguna jurisdicción tiene departamentos, con `departamentos` y, donde hay mesas, `mesas_en` (`{codigo: "definitivo" o "provisorio"}`). La tabla de esa jurisdicción es por mesa, con el departamento como sección, y el mapa sigue por departamento. Las que no tienen departamentos se pintan enteras, y CABA antes de 2009 también: sus circunscripciones van solo en la tabla.
- `JUNTOS_EN_EL_MAPA`: Lezama se separó de Chascomús en 2009 y la cartografía de 2010 los tiene en un solo polígono, con otro código. En la tabla van separados y en el mapa se suman.
- Las notas de cada jurisdicción las escribe el programa con los datos: cuánto les falta a los departamentos o a las mesas para el total oficial (y por qué, en `MOTIVO_DEP` y `MOTIVO_MESAS`), y lo que la tabla por mesa deja afuera aunque sume lo mismo (`APARTE_MESAS`), y de dónde salen si no es la misma fuente que el total. Los departamentos suman casi siempre unos pocos votos menos: la fuente no reparte los de las cárceles o los de extranjeros.
- `mesas.js`: `porMesa(el, p)` dice qué jurisdicciones llegan a la mesa. Con departamentos oficiales la página no dice "no es el escrutinio definitivo", nombra comunas y circunscripciones en CABA, y las notas de la jurisdicción van solo en su vista.
- `prueba_mesas.py` controla que cada tabla por departamento o por mesa dé lo mismo que lo transcripto, sin mesas ni departamentos repetidos.

### Las 24 jurisdicciones por departamento y lo que faltaba desde 1983 (pedidos del autor del 8 de noviembre de 2026, PR #113 y #114)

Dos pedidos después de publicar el #112. El primero: "pongo Santa Fe o alguna otra provincia y cuando veo por departamento, veo todo pintado al mismo color… Así en todas las provincias con todos los que tenés datos de todas las elecciones". El segundo: "scrapeá Wikipedia para los datos que te faltan… no pongas fuente Wikipedia, sino poné la fuente primaria".

- Por departamento, del escrutinio oficial de cada provincia (`mesas_jurisdiccion_departamentos.csv`, PR #113): Santa Fe (1991 a 2023), Córdoba (2003 a 2023), Chaco y Salta (2011 a 2023), Jujuy (2003 a 2015), Misiones (2015 a 2023), Mendoza (2003 a 2015 y 2023), La Rioja (2003, 2007 y 2023), La Pampa (2007 y 2011), Neuquén y Tucumán (2003 y 2007), San Juan (2003 a 2011), San Luis y Santa Cruz (2003 y 2011), Río Negro (2003) y Tierra del Fuego (la segunda vuelta de 2003 y las dos vueltas de 2015). Casi todos suman exacto el total oficial. Lo que les falta va en la nota, con su motivo en `MOTIVO_DEP` (las mesas de las cárceles, de las fuerzas de seguridad o de la Antártida, que la fuente no reparte). En Jujuy y Misiones los departamentos no llevan electores (`SIN_ELECTORES_DEP`): el padrón municipal suma a los extranjeros, que votan intendente y no gobernador.
- Por mesa (`mesas_gobernador/`): Chaco de 2011 a 2023 y Salta de 2011 a 2023 (definitivo de sus tribunales, sin los votos observados e impugnados que el Tribunal de Salta resolvió por municipio), y el provisorio de la DINE donde hay total oficial (`DINE_MESAS`): Buenos Aires de 2011 a 2023, Entre Ríos y Jujuy en 2011 y 2015, Chubut y Misiones en 2015 y Catamarca en 2019 y 2023, cada uno con lo que el provisorio no llegó a cargar. Cada sección de la DINE se une por nombre con el departamento de la tabla oficial, y los nombres que se escriben distinto van en `ALIAS` del programa que armó la tabla.
- `departamentos_de_mesas()`: donde hay mesas y no departamentos oficiales, los departamentos salen de sumar las mesas, para que el mapa pinte quién ganó en cada uno. La nota empieza "Por departamento y por mesa" y dice que no es el total oficial. Los departamentos sin ninguna mesa quedan sin pintar, con su nombre en la nota, y el cartel del mapa dice "Sin datos de este departamento en esta elección".
- Los colores de los frentes provinciales que no dejan dudas (`PRIMERO` y `REGLAS`): el Frente Progresista con el socialismo y la Alianza Santafesina y Unidos para Cambiar Santa Fe con la UCR, el Frente Renovador de Misiones con el suyo, los frentes del PJ de Chaco, Córdoba (1991) y Corrientes (2021) con el peronismo, el Frente Cívico y Social de Catamarca con la UCR, también en 2007, cuando fue con el Frente para la Victoria. Lo que no es claro va en "Otras fuerzas", como la Confederación Formoseña Frente de Todos de 2003, que fue contra el lema del PJ.
- Lo que faltaba desde 1983: de 151 elecciones de gobernador sin fuente quedan 15, de 278 en los calendarios. La mayoría sale de los informes "Resultados históricos" de la Dirección Nacional Electoral (1983 a 2007), que ya no están en mininterior.gob.ar y se leen en el Internet Archive: la fuente dice "copia del Internet Archive" y enlaza la copia. Formosa, que no tenía ninguna, tiene desde el #114 las once de 1983 a 2023.
- La Wikipedia, como pidió el autor, se usó como guía hacia la fuente primaria, con estas reglas. Si el documento oficial que cita se pudo abrir, la fuente es solo el organismo, y las cifras salen del documento. Si no, la fuente nombra al organismo y dice "en la transcripción de la Wikipedia", con el enlace a la versión del artículo (`oldid`), y la nota dice que no se pudo comparar con el original: poner solo el organismo diría algo falso sobre de dónde sale la cifra, y la licencia CC BY-SA de la Wikipedia pide nombrarla. Lo que la Wikipedia toma de un diario, de un escrutinio provisorio, de un trabajo académico o del Atlas de Andy Tow quedó afuera hasta la decisión del autor del 9 de noviembre de 2026 ("publicalas con su fuente real"): desde el PR #116 se publica, como se lee abajo.
- Correcciones de las fuentes, cada una en su nota: Córdoba 2003 (el circuito de Saldán, en Colón), Tucumán 2007 (Simoca: 188 votos en blanco, no 1.885) y Jujuy 1983 (el cuadro del Tribunal resuelve las cifras dudosas del acta). En Córdoba 1987 y 1991 el documento de la DINE corrige a la Wikipedia, que repite los votantes de 1983 y da a la UCeDé 36.537 votos en vez de 32.459.

### El gobernador por circuito (8 de noviembre de 2026, PR #115)

Después de publicar el #114 el autor pidió "seguí con lo que falta". Su primer pedido de ese día decía "no veo por cada departamento, circuito, quién ganó": con el #113 el gobernador llegó al departamento, y desde el #115 llega al circuito donde hay mesas.

- `circuitos_de_mapa()` en `elecciones_jurisdiccion.py`: para cada jurisdicción con tabla por mesa, une cada circuito con la sección de la elección nacional del mismo año (diputados, o presidente si no hay) por su código, que no se repite dentro de una jurisdicción (medido en las nacionales de 2011 a 2023), y si no está, por el circuito sin la letra (64A con 64). Las filas copian los lugares de `mapa/{nacional}.json`, así que se dibujan con sus mismos polígonos (`ed` y `periodo` de la nacional), y llevan al final las claves de la tabla del gobernador (`departamento|circuito`), que es lo que se elige al tocarlas. `sec_tabla` une la sección de la nacional con el departamento de la tabla, para el rayado de los circuitos sin mesas propias y para acercar el mapa a un departamento.
- Se escribe en `mapa/{eleccion}/{codigo}.json`, con las mismas listas y fuerzas que `mapa/{eleccion}.json`, `unidad: "circuito"` y `recuento` (definitivo o provisorio). El mapa del país sigue por departamento: `mapa/{eleccion}.json` marca con `circuitos` las jurisdicciones que lo tienen, y `mesas.js` lo baja al entrar a una de ellas. Si no llega, sigue por departamento.
- Son 30 mapas, de 2011 a 2025: CABA, Buenos Aires, Catamarca, Corrientes, Chaco, Chubut, Entre Ríos, Jujuy, Misiones, Salta y Tucumán, entre 98,2% (Salta 2011 y 2015, por circuitos con letra que la nacional no separa) y 100% de los votantes. La segunda vuelta de CABA en 2007 no tiene mapa por circuito: no hay una nacional por mesa ese año.
- `prueba_mesas.py` controla que cada circuito de la tabla esté una sola vez, que el mapa no sume más votantes que las mesas, que diga cuánto muestra y que muestre al menos 97%. La prueba de páginas abre Tucumán y Buenos Aires 2015, toca un circuito y controla que Santa Fe, sin mesas, siga por departamento.

### Las elecciones sin escrutinio oficial en línea, con su fuente real (9 de noviembre de 2026, PR #116)

Decisión del autor, después de publicar el #115: "publicalas con su fuente real". Son 13 elecciones de gobernador que no tienen ningún escrutinio oficial publicado en línea: Catamarca 1988 (un trabajo académico, Carrera) y 2003 (el Atlas Electoral de Andy Tow), Córdoba 1998 (una tabla de la Wikipedia sin fuente, cuyos votos de Unión por Córdoba coinciden exacto con el acta del Juzgado), La Rioja 2011 (el escrutinio provisorio del gobierno provincial) y 2015 (tabla sin fuente), San Juan 2015 (el provisorio del Ministerio del Interior) y 2023 (una planilla sin membrete publicada por Tiempo de San Juan), San Luis 1999 (el provisorio en el informe de la DINE), Santiago del Estero 2002 (Vommaro), 2005 (Tow), 2008 (López Pepa) y 2025 (El Liberal), y Tierra del Fuego en la segunda vuelta de 2011 (tabla sin fuente). Casi todas llegan por la transcripción de la Wikipedia, y la fuente lo dice.

- `NO_OFICIAL` en `elecciones_jurisdiccion.py`: cada una con el recuento que dice la página, "provisorio" si la fuente cuenta parte de las mesas, "definitivo" si dice que lo es (Santiago del Estero 2025) y nada si no se sabe. El índice lleva `no_oficial` y `recuentos`. Una entrada que ya no está en la tabla frena el programa.
- `mesas.js`: en la jurisdicción, "No hay un escrutinio oficial publicado en línea. Fuente: …" y el recuento propio. En el país, qué jurisdicciones no lo tienen. Una elección con solo esas jurisdicciones (Catamarca 1988) no dice "Escrutinio definitivo".
- Quedan sin datos San Juan 1987, sin ninguna fuente encontrada, y Corrientes 1992, que se anuló.
- Lo copiado de la Wikipedia queda como está, y las elecciones que salen de la DINE y no del tribunal provincial (Mendoza, San Juan y Santa Cruz 2019, Neuquén, Río Negro y La Pampa 2019 y 2023) también: decisiones del autor del mismo día.

### Los gobernadores de 1912 a 1982 (9 de noviembre de 2026, PR #117)

Decisión del autor, después de publicar el #116: "para antes de 1983 usa las que tienen restricción, citalas". Tres ayudantes armaron, cada uno con su período, las tablas, el calendario y un informe (en el trabajo de la sesión, `g83/`), con estas reglas: primero lo oficial que se pueda abrir, después lo académico con su licencia, después la Wikipedia con lo que cita, y si dos fuentes no coinciden, la más completa y cercana a lo oficial, con la diferencia en la nota.

- Son 223 elecciones nuevas, de 271 en el calendario de esos años (`datos/manual/mesas_jurisdiccion_calendario.csv`, con la fecha y si fue directa o por colegio electoral). De 1912 a 1945, 84: oficiales solo las de Entre Ríos de 1935, 1939 y 1943 (el archivo provincial, por departamento, sumado), y el resto de Luzi (Buenos Aires 1913 y 1918), la tesis de Solís Carnicer (Corrientes 1919, 1921 y 1925), la de Fleitas (Jujuy), Cantón, Piñeiro, otros trabajos y la Wikipedia, que muchas veces cita las Memorias del Ministerio del Interior o los diarios de Santa Fe. De 1946 a 1957, 39: 18 de la publicación del Ministerio del Interior de 1952, leídas de la imagen y controladas contra Amaral (*Perón presidente*, 2018), que da las mismas cifras, y el resto de la Wikipedia, sobre todo con los expedientes de la Cámara de Diputados de 1952. De 1958 a 1982, 93: la mayoría de la publicación del Archivo General de la Nación y de los expedientes de Diputados, en la transcripción de la Wikipedia, y los PDF escaneados de la Junta bonaerense de 1963. Más las siete que esperaban en `mesas_jurisdiccion_pendiente.csv`, que se borró.
- PolAr se usó poco: compara mal antes de 1973 (en Buenos Aires 1958 da a la UCRI 1.093.965 votos y la publicación del AGN, 1.354.156) y tiene errores visibles (restos negativos, partidos invertidos, el Partido Blanco de Río Negro tomado como votos en blanco). Quedó solo donde no hay otra fuente, con la nota.
- Chaco 1973: el Acta 14/73 del Tribunal escribe 64.893 votos para la UCR y 3.555 para el Intransigente, que suman 254 más que los válidos que fija el Acta 13/73. Son 64.839 y 3.355, como da la publicación del AGN: se corrigió, con la nota.
- `mesas_jurisdiccion_no_oficial.csv`: 87 de esas elecciones no tienen fuente oficial (trabajos académicos, diarios, PolAr y tablas sin fuente). Las que llegan por la transcripción de la Wikipedia de un documento oficial (las Memorias del Interior, los expedientes de Diputados, la publicación del AGN) cuentan como oficiales, como desde 1983.
- `mesas_jurisdiccion_diferencias.csv`: las 37 que no cierran en su documento, con la diferencia exacta, casi todas votantes que el documento cuenta y no reparte ("diferencia de actas"). Las lee el programa junto con `DIFERENCIAS`.
- `por_que_no()`: los territorios nacionales no elegían gobernador hasta su primera elección (Chaco y La Pampa 1953, Misiones 1955, Formosa, Neuquén, Río Negro, Chubut y Santa Cruz 1958, Tierra del Fuego 1991), y la Capital no elegía su gobierno hasta 1996. El índice lo lleva en `fuera_j` y la página lo dice.
- Los colores de antes de 1983 (`PRIMERO`): el peronismo de 1946 a 1955 y los partidos neoperonistas de la proscripción (Unión Popular, Tres Banderas, los movimientos populares provinciales), la UCRI de 1958 a 1963, los conservadores (el Partido Demócrata Nacional, la Concordancia y los demócratas provinciales) y los antipersonalistas, con el color de los mapas nacionales de esos años donde lo hay. Bloquistas y lencinistas no van con la UCR.
- No están: las segundas elecciones de 1913 y 1931 en Buenos Aires (la clave año y vuelta admite una por jurisdicción), las anuladas de 1962 sin cifras confiables y las que no tienen ninguna fuente (casi toda La Rioja, San Juan y San Luis antes de 1946).

## Lo que falta

- En una segunda etapa, los legisladores provinciales, los intendentes y los concejales (decisión del autor del 9 de noviembre de 2026), y el gobernador por departamento antes de 1983 donde hay fuente (Amaral trae 1946 en las 14 provincias, el archivo de Entre Ríos 1935 a 1943 y la Junta bonaerense 1963 por sección): `docs/roadmap/ELECCIONES_PROVINCIAS.md`, "Qué sigue y qué decide el autor".
- El definitivo mesa por mesa y los votos del exterior por consulado: solo los tiene la Cámara Nacional Electoral. El camino es un pedido de acceso a la información pública (Ley 27.275) a la Cámara: lo decide y lo hace el autor.
- El padrón del exterior de otros años: la Cámara publica solo el de 2023.

- Las PASO: 2015 no se puede bajar por mesa y 2023 sale de una copia del Internet Archive.
- Los locales de votación: el archivo de 2025 los trae (escuela y dirección).
- Mesas de 2003 a 2009 y circuitos de 1983 a 2001, con permiso de sus autores.
- Los límites de las 28 circunscripciones de CABA hasta 2007.
- Las PASO de 2011 a 2023 y las estimaciones de cómo pasan los votos de una elección a otra: 257arg las tiene.
- Convencionales de 1948 y 1957, y las elecciones que 257arg no transcribió, como 1931, 1960 y 1963.
