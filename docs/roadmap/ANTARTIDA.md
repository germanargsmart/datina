# La Antártida en Datina

Pedido del autor del 5 de noviembre de 2026: "datos de la antártida, antártida argentina, bases que hay, un mapa con las bases de argentina, de los demás países, el tratado, etc. Todo. Y fijate dónde lo podés agregar".

## Decisiones del autor (5 de noviembre de 2026)

- **Dónde va:** un capítulo de Naturaleza y ambiente (`#g-antartida`), no una página propia. Como un capítulo necesita otro al lado para que aparezca la fila, las fichas que ya estaban quedaron en "Ambiente y recursos" (`#g-ambiente`), sin cambiar de orden.
- **Reclamos:** los siete sectores, con el argentino resaltado. El texto describe cada norma, sin tomar posición, como la historia de Tierra del Fuego.
- **Datos fijos:** no entran en la descarga del día 5. Se actualizan a mano, volviendo a correr los programas. Por eso las fichas dicen "Se actualiza a mano" (`a_mano` en `FRASE_FRECUENCIA` de 03) y no llevan aviso de atraso.
- **PR:** esperó a que se uniera el #104 (un solo PR por vez), y se abrió el 6 de noviembre de 2026.

## Qué hay

Diez fichas, en este orden: mapa de las bases, las 13 bases argentinas, países con más bases, reclamos, Tratado, zonas protegidas, temperatura en las bases, hielo marino, turismo y gasto. Tres bloques de "Para entender los datos" (el Tratado, cómo llegó la Argentina y cómo se cuentan las bases y el sector) y cinco términos del glosario.

## De dónde sale cada cosa

| Archivo en `datos/manual/` | Sale de | Cómo se actualiza |
|---|---|---|
| `antartida_instalaciones.csv` | COMNAP, `Facilities_Nov2024.csv` (comnap.aq). Uso libre educativo y sin fines comerciales, citando a COMNAP: lo dice el pie de las fichas | `scripts/antartida_datos.py`, con la dirección del archivo nuevo en `COMNAP` y `ANT_COMNAP_FECHA` en 02 |
| `antartida_tratado.csv` | Secretaría del Tratado, `ats.aq/devAS/Parties` | `scripts/antartida_datos.py` (frena si no son 58 partes: cambiar el control) |
| `antartida_zonas.csv` | Secretaría del Tratado: el PDF del estado de las zonas y el Excel de los sitios históricos | `scripts/antartida_datos.py` (necesita `pypdf`; frena si cambia la cantidad de zonas) |
| `antartida_temperaturas.csv` | READER, British Antarctic Survey | `scripts/antartida_datos.py` |
| `antartida_hielo.csv` | NSIDC, Sea Ice Index, G02135 versión 4 | `scripts/antartida_datos.py` |
| `antartida_presupuesto.csv` y `_detalle.csv` | Presupuesto Abierto, un ZIP por año | `scripts/antartida_presupuesto.py` (unos 90 MB). 02 frena si faltan años, como el de transferencias |
| `antartida_bases.csv` | A mano: Cancillería y Comando Conjunto Antártico | A mano. 02 frena si el año o la condición difieren de COMNAP |
| `antartida_reclamos.csv` | A mano, con la fuente de cada fila | A mano |
| `antartida_turismo.csv` | A mano, de los informes de IAATO a la Reunión Consultiva (columna `fuente`). Cada número se controló contra el PDF | A mano, con el informe de cada año. IAATO también recibe pedidos de datos con un formulario |
| `antartida_superficies.csv`, `antartida_censos.csv` | A mano: IGN, Cancillería, INDEC | A mano |

La geometría (`sitio/datos/antartida.topo.json`) sale de `scripts/geometria_antartida.py`: Natural Earth, dominio público, escala 1:50 millones para el continente y 1:10 millones para la Península. 03 no la toca. Los 81 del Censo 2022 salen de la API del INDEC, que ya se bajaba (`indec_api_estimaciones_poblacion_departamento_2022_2035.json`): repite el mismo número todos los años porque es el conteo del censo.

## Diferencias entre fuentes (no resolverlas en silencio)

- **Superficie:** el valor vigente del IGN es 873.718 km², incluidas las Orcadas, sin contar unos 530.000 km² de barreras de hielo (`DivisionPolitica` y `odc-15-almiron` en ign.gob.ar). Los 965.597 km² que circulan son la medición anterior. La Cancillería sigue con 1.461.597 km² en total y 965.314 km² de tierra firme. La ficha da el IGN y menciona a la Cancillería.
- **Petrel:** permanente para el Comando Conjunto, para la página de Antártida de la Cancillería y para COMNAP, y temporaria para la página de bases de la Dirección Nacional del Antártico (6 y 7). Se usan 7 y 6, y la nota lo dice. Petrel es de 1952 como refugio y de 1967 como destacamento: se usa 1952, como la Cancillería y COMNAP.
- **Carlini y Brown:** figuran a cargo de la Cancillería. En agosto de 2024 se anunció el pase a Defensa y no se encontró norma publicada al 5 de noviembre de 2026. Si aparece, cambiar `antartida_bases.csv` y la nota. Tampoco se resolvió cómo convive con el anexo del Decreto 368/2018.
- **Esperanza y Primavera:** la página de historia del Comando Conjunto da otras fechas que sus propias fichas (17 de diciembre de 1953 y 3 de marzo de 1977). Se usan las fichas: 1952, como la Cancillería y COMNAP, y 8 de marzo de 1977.
- **Matienzo:** la página de la Cancillería repite las coordenadas de Decepción. Las coordenadas del mapa son las de COMNAP.
- **Censos:** en 2010 fueron 190 en el departamento y 17 en Orcadas, contada en Islas del Atlántico Sur. En 2022 fueron 81 y no se encontró explicación de la baja. En 2001 y antes el INDEC da los dos departamentos juntos: los 142 y 163 que circulan como "Antártida Argentina" son la suma.
- **Turismo:** IAATO no publica un total por temporada de toda la serie. Se muestra la suma de su desglose. En 2023-24 publicó 122.072 y la suma da 124.418, y en 2024-25 publicó 118.491 y la suma da 118.162. En 2025-26 coinciden. No hay un porcentaje oficial de cuántos visitantes salen de Ushuaia: el "90%" que circula no tiene fuente. Lo que se publica es el 64,4% de los cruceristas del puerto de Ushuaia que van en cruceros antárticos (2023-24).
- **Francia:** el año y los límites de su reclamo vienen de fuentes secundarias. Australia, de un documento del gobierno noruego. El primer reclamo argentino no tiene una fecha oficial clara (1940 o 1942): la tabla da la norma que fija el territorio (1957) y la que fija los límites actuales (2009).
- **COMNAP:** Zhongshan Skiway figura con latitud norte. `antartida_datos.py` le cambia el signo y frena si aparece otro caso. McMurdo trae "1,200" en la capacidad. Macquarie está al norte del paralelo 60.

## Cómo se calcula

- **Temperatura:** cada mes menos su promedio de 1991 a 2020, promediado por año, con al menos diez meses con dato. No se promedia directo porque READER tiene huecos, sobre todo desde 2020, y según qué mes falte daría más frío o más calor. El año de la descarga, sin terminar, no entra. El promedio móvil de diez años pide ocho con dato.
- **Reclamos:** los grados se cuentan de a uno, con `_ant_grados` en 02. El sector argentino son 49 grados, todos dentro del británico y 21 también dentro del chileno. Los 60 grados sin reclamar se controlan contra los meridianos 90 y 150 Oeste. "En el sector" es lat ≤ -60 y lon entre -74 y -25.
- **Gasto:** las filas cuyo programa, subprograma, proyecto, actividad u obra dice "antártic" (no "Antártida": traería el edificio "Antártida Argentina" de la Justicia, un jardín de infantes y rutas de Tierra del Fuego), más el Irízar por su nombre. Se clasifica por lo que dice la fila y no por el ministerio: la Dirección Nacional del Antártico estuvo en Defensa hasta 2003, y el Sostén Logístico fue una actividad de Planeamiento Militar Conjunto entre 2004 y 2006. **El salto de 2021 en "Fuerzas" es en parte de rótulo:** el Alistamiento Antártico empieza a figurar con ese nombre en 2020 y 2021. El detalle fila por fila queda en `antartida_presupuesto_detalle.csv`. Pesos del último año con el deflactor del PBI, como las transferencias: el IPC del INDEC empieza en 2016.

## Mapas

Proyección estereográfica centrada en el polo, con el meridiano 60 Oeste arriba: Mercator no llega al polo. La tierra no lleva borde porque el polígono de Natural Earth corta el globo por el meridiano 180 y esa línea se vería en el Mar de Ross. Los sectores se dibujan como figuras en la pantalla, no como polígonos del globo. El nombre de cada banda va adentro si entra y afuera si no (Francia, 6 grados).

## Lo que quedó afuera

- Las zonas protegidas no están en el mapa: la Secretaría publica los polígonos de 2024 (`apa_shape_2024.zip`) y dos zonas son de 2026.
- La informalidad de los datos de COMNAP sobre dotación de invierno: la única dotación oficial que se encontró es Esperanza. Por eso se muestra la capacidad máxima, no la dotación.
- Un enlace desde la página de Tierra del Fuego al capítulo.
