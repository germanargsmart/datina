# Escuelas y hospitales en el mapa de cada provincia

Pedido del autor del 9 de noviembre de 2026: "mapear a través de google maps o las páginas oficiales todos los hospitales nacionales y provinciales, y las escuelas primarias y secundarias, tanto públicas como privadas, de cada una de las provincias. Para ponerlas en un mapa provincia por provincia". Es para profundizar los datos territoriales de las páginas de cada provincia.

Estado: plan, sin código. Las cuatro decisiones de diseño están tomadas (abajo). Lo próximo es la fase 1. Las fuentes se bajaron una vez para revisarlas (fuera del repositorio) el 9 de noviembre de 2026. Las cifras de abajo salen de esa revisión.

## Las fuentes (verificadas el 9 de noviembre de 2026)

| Qué | Fuente y dirección | Qué trae | Fecha y licencia |
|---|---|---|---|
| Escuelas | Padrón Oficial de Establecimientos Educativos, DIEE, Ministerio de Capital Humano. `https://www.argentina.gob.ar/sites/default/files/2026.06.16_padron_oficial_establecimientos_educativos_die_icse.xlsx` (se encuentra con `package_show?id=padron-oficial-de-establecimientos-educativos` en datos.gob.ar, porque el nombre cambia con la fecha). XLSX de 15,6 MB | 64.696 localizaciones (CUE-anexo) con jurisdicción, sector, ámbito urbano o rural, departamento y localidad con su código INDEC, nombre, domicilio y una columna por oferta (inicial, primaria, secundaria, técnica, especial, adultos...). **No trae coordenadas** | Actualizado al 16/6/2026. CC BY 4.0 |
| Ubicación de las escuelas | Mapa Educativo Nacional, servicio WFS. `https://mapa.educacion.gob.ar/geoserver/ows?service=WFS&version=2.0.0&request=GetFeature&typeNames=publico:establecimiento_educativo&outputFormat=csv` (19 MB) | Un punto por CUE-anexo, con la precisión de la ubicación (`pre`: PRECISA o APROXIMADA), gestión, ámbito y niveles. Se une con el padrón por el CUE-anexo: 64.695 de 64.696 (ver "Trampas") | El servicio no declara licencia. Sale del padrón, que es CC BY 4.0: citar a la DIEE |
| Hospitales | Registro Federal de Establecimientos de Salud (REFES), Ministerio de Salud, versión georreferenciada. `https://sisa.msal.gov.ar/datos/descargas/georef/files/refes_georef.zip` (2,9 MB, un CSV adentro). La versión anual en datos.salud.gob.ar es la del 15/12/2025 | 39.445 establecimientos de todo tipo, con origen del financiamiento (nacional, provincial, municipal, privado...), tipología (con o sin internación, complejidad), departamento, localidad, domicilio, latitud y longitud | Se regenera todos los días (el del 9/11/2026, a las 7 UTC). CC BY 4.0 |
| Alumnos por escuela (opcional) | Base de datos por escuela 2025, Relevamiento Anual, en datos.gob.ar | Matrícula y secciones por escuela | Los enlaces son de SharePoint y devuelven una página, no el archivo: **habría que bajarlo a mano**. Sin verificar el contenido |

### Por qué no Google Maps

Las dos fuentes oficiales ya traen las coordenadas, así que Google no agrega ubicaciones. Y no sirve para lo que pide el autor:

- No dice quién sostiene un hospital (nacional, provincial, municipal o privado), que es justo la distinción del pedido.
- Su categoría "hospital" mezcla clínicas, sanatorios y consultorios, y no distingue escuela primaria de secundaria.
- La API cobra por consulta, y sus condiciones no permiten guardar los resultados ni mostrarlos sobre un mapa que no sea el de Google.

Sirve solo para mirar a mano una muestra de puntos dudosos durante el control de calidad. Desde el mapa del sitio sí se puede ofrecer un enlace "Ver en un mapa" con las coordenadas de cada lugar.

## Qué cuenta como escuela y como hospital

- **Una escuela es una localización del padrón (CUE-anexo)**, la unidad que usa el Ministerio. Un mismo edificio puede tener dos localizaciones (una primaria a la mañana y una secundaria a la noche) y una localización puede dar primaria y secundaria.
- Se cuentan las de **educación común** con primaria o con secundaria (la técnica del INET va con la secundaria). Especial y adultos quedan afuera, o como filtro más adelante.
- **Un hospital es un establecimiento con internación** del REFES (tipologías ESCI: general y especializados), **sin las residencias** (ESCIRES, 2.754 hogares de ancianos y viviendas con apoyo, que triplicarían a los privados).
- Los centros de atención primaria sin internación (CAPS) no son hospitales. Son donde está la mayor parte de la atención pública, y pueden ser una capa aparte.

## Lo que dicen los números (primer perfil, 9 de noviembre de 2026)

### Escuelas

35.347 localizaciones de educación común con primaria o secundaria: 22.630 con primaria y 13.750 con secundaria (1.033 tienen las dos). Estatales 27.791, privadas 7.499 y de gestión social o cooperativa 57. La ubicación es aproximada en 4.283 (12 %).

| Provincia | Total | Con primaria | Con secundaria | % privadas | % rurales | % con ubicación aproximada |
|---|---|---|---|---|---|---|
| Buenos Aires | 10.611 | 5.880 | 4.731 | 31,9 | 17,5 | 0,2 |
| Córdoba | 3.083 | 2.006 | 1.103 | 24,3 | 38,4 | 32,0 |
| Santa Fe | 2.629 | 1.689 | 952 | 24,5 | 34,2 | 1,5 |
| Entre Ríos | 1.818 | 1.246 | 581 | 17,7 | 50,2 | 0,4 |
| Misiones | 1.775 | 1.242 | 634 | 11,2 | 42,5 | 10,3 |
| Santiago del Estero | 1.743 | 1.219 | 572 | 5,3 | 82,6 | 36,3 |
| Chaco | 1.563 | 1.158 | 406 | 11,8 | 54,3 | 3,8 |
| Mendoza | 1.293 | 879 | 415 | 21,7 | 33,0 | 58,8 |
| Tucumán | 1.282 | 742 | 559 | 20,5 | 51,6 | 1,0 |
| Corrientes | 1.176 | 897 | 340 | 8,7 | 63,9 | 34,9 |
| Ciudad de Buenos Aires | 1.125 | 890 | 518 | 44,1 | 0,0 | 0,5 |
| Salta | 1.086 | 812 | 350 | 10,8 | 49,6 | 0,2 |
| Formosa | 905 | 583 | 343 | 3,4 | 67,7 | 33,5 |
| Jujuy | 660 | 423 | 253 | 8,5 | 51,1 | 2,0 |
| Catamarca | 657 | 443 | 233 | 4,3 | 69,7 | 36,4 |
| San Juan | 644 | 423 | 286 | 16,1 | 43,3 | 45,5 |
| Río Negro | 622 | 399 | 226 | 22,3 | 26,0 | 18,0 |
| San Luis | 567 | 360 | 391 | 8,5 | 58,4 | 3,9 |
| Neuquén | 546 | 378 | 171 | 17,9 | 32,1 | 1,8 |
| La Rioja | 477 | 338 | 186 | 7,8 | 61,0 | 32,1 |
| Chubut | 434 | 249 | 188 | 18,4 | 31,8 | 0,7 |
| La Pampa | 350 | 193 | 168 | 9,1 | 37,7 | 1,4 |
| Santa Cruz | 203 | 118 | 91 | 22,7 | 12,3 | 2,0 |
| Tierra del Fuego | 98 | 63 | 53 | 21,4 | 6,1 | 0,0 |

En esta tabla "% privadas" incluye las de gestión social o cooperativa (en el sitio van aparte). Las provincias con más ubicaciones aproximadas son las más rurales: justo donde más importa saber dónde queda cada escuela.

### Hospitales

3.809 establecimientos con internación (sin residencias): 1.468 públicos, 2.244 privados y 97 de otras dependencias (fuerzas armadas y de seguridad, obras sociales, servicios penitenciarios, mutuales). Los públicos se reparten así: 1.033 provinciales, 409 municipales, 12 nacionales, 10 universitarios y 4 mixtos. Les faltan coordenadas a 42 públicos (3 %), 16 de ellos en Córdoba.

**El pedido literal ("nacionales y provinciales") deja afuera casi todo el AMBA**, porque el REFES anota como municipales a los hospitales de la Ciudad y a la mayoría de los del conurbano:

| Provincia | Públicos con internación | Solo nacionales y provinciales |
|---|---|---|
| Ciudad de Buenos Aires | 40 | 2 |
| Buenos Aires | 344 | 94 |
| Córdoba | 160 | 44 |
| Santa Fe | 137 | 127 |
| Las otras 20 provincias | 787 | casi todos (un municipal en Catamarca, uno en Tucumán y un nacional en Santa Cruz) |

## Decisiones del autor (9 de noviembre de 2026)

1. **Qué hospitales: todos los públicos con internación** (nacionales, provinciales, municipales, universitarios y mixtos: 1.468), con un filtro por dependencia. Así la Ciudad y el conurbano no quedan vacíos. Los privados no van.
2. **Las escuelas con ubicación aproximada: mejorarlas antes** con la API Georef del Estado (`https://apis.datos.gob.ar/georef/api/direcciones`, oficial y gratis, acepta muchas direcciones en un solo pedido). Va en la fase 1. Ver abajo lo que dio la prueba.
3. **Gestión social o cooperativa: aparte**, como tercera categoría con su color y su filtro (57 escuelas primarias o secundarias).
4. **El mapa: el del sitio**, D3 sobre los límites de los departamentos, con acercamiento y sin calles. Sin bibliotecas ni servicios nuevos.

### Prueba de Georef con las aproximadas (9 de noviembre de 2026)

De las 4.283 escuelas primarias o secundarias con ubicación aproximada, 205 no tienen domicilio. De las otras se probó una muestra de 218 (hasta 12 por provincia), mandando el domicilio tal como está en el padrón y el código de departamento:

- 49 (22 %) dieron un resultado y solo 24 (11 %) con el número de la calle, que es lo único que mejora de verdad la ubicación. El resto queda en el centro de la calle o no aparece.
- La mitad de los resultados cae a menos de 200 metros del punto aproximado, pero hay casos a 149 km: un resultado se acepta solo si cae dentro de su departamento y cerca de su localidad.
- Los domicilios que fallan son de dos tipos. Unos tienen arreglo: barrio pegado al final ("9 DE JULIO 1080 CENTRO"), "AV." o "AVDA.", "E/" para "entre", "S/N". Otros no: parajes y cuarteles rurales ("PARAJE LAGUNA GRANDE", "CUARTEL VII").

Lo esperable, limpiando los domicilios antes, es mejorar entre una de cada diez y una de cada tres. **La mayoría va a seguir aproximada**, sobre todo las rurales. Queda para decidir en la fase 2 cómo se muestran esas (la recomendación sigue siendo otro símbolo, con la aclaración en la leyenda). Cada escuela guarda de dónde sale su punto: Mapa Educativo (precisa), Georef (mejorada) o Mapa Educativo (aproximada).

## Cómo se armaría (un PR por fase)

**Fase 1. Datos y control de calidad (no cambia el sitio).** `scripts/establecimientos.py`, que se corre a mano, como `elecciones_mesas.py`: baja las tres fuentes a una carpeta temporal, se queda con las columnas que se usan y escribe un CSV por provincia en `datos/manual/establecimientos/`, con la fecha de cada fuente. No va a `datos/crudo/` (que está en git y ya pesa 157 MB) ni a la actualización mensual: el padrón cambia una o dos veces por año. Teléfono y correo no se guardan. Las escuelas aproximadas pasan por Georef con el domicilio limpio, y un punto nuevo se acepta solo con número de calle, dentro de su departamento y cerca de su localidad. Con `scripts/prueba_establecimientos.py`, los controles de abajo y un informe por provincia.

**Fase 2. El mapa en la página de cada provincia.** Una ficha nueva en `provincia.html` y en las 24 páginas fijas (la provincia se elige solo ahí), que baja el archivo de su provincia cuando la ficha aparece en pantalla. Pregunta con respuesta que se cuenta, por ejemplo "¿Cuántas escuelas y hospitales hay en cada departamento?", con dos vistas (escuelas y hospitales) y filtros (primaria o secundaria, estatal, privada o social y cooperativa, dependencia del hospital). Puntos en canvas, no en SVG: Buenos Aires tiene más de 10.600 escuelas. "Ver tabla" da la tabla por departamento y una lista con buscador ("buscá tu escuela"). Lleva su origen en `relaciones.json`, su lugar en `catalogo.json`, la fecha en la descripción con `{{ruta}}` y el texto después del gráfico. El diseño se le muestra al autor con capturas antes de armarlo.

**Fase 3. Los cruces (el valor agregado de Datina).** Cada uno, su PR:

- Escuelas cada 1.000 chicos de 5 a 14 años por provincia, con las proyecciones que ya usa `chicos_escuela` en `02_procesar.py`. Cuenta lugares, no vacantes: decirlo.
- Qué parte de las escuelas es privada en cada departamento (de 44 % en la Ciudad a 3 % en Formosa), en el mapa de departamentos que ya existe.
- Hospitales públicos con terapia intensiva cada 100.000 habitantes por provincia (tipología "alto riesgo con terapia intensiva" del REFES y la población de `POB`).
- A cuántos kilómetros en línea recta queda el hospital público con internación más cercano de cada escuela rural. Las escuelas sirven de marca de dónde vive la gente, sin necesitar población por radio censal. La distancia en línea recta no es la de la ruta: decirlo.
- Las escuelas privadas y los resultados de Aprender por departamento (`aprender_departamentos`), con "Qué no dice este dato".

## Controles de calidad (fase 1, después en `pruebas_datos.py`)

- Cada punto cae dentro del departamento que declara (con `departamentos.topo.json`). Medir cuántos no y decidir qué hacer con ellos.
- Ningún CUE-anexo ni código REFES repetido (hoy ninguno en el padrón ni en el REFES, uno en la capa del mapa).
- Coordenadas que faltan, fuera del país o con latitud y longitud invertidas (en el REFES hoy hay 12 fuera del país y 2 posiblemente invertidas, de todo tipo de establecimiento).
- Muchos puntos en la misma coordenada: 244 escuelas comparten 67 puntos, casi seguro el centro de su localidad.
- Los totales por provincia coinciden con los del padrón y con los del REFES.
- La fecha de cada fuente queda guardada y sale en la descripción de la ficha.

## Trampas de los archivos

- El padrón tiene el encabezado en dos filas (la 12 y la 13 de la hoja), con títulos de bloque arriba y nombres repetidos abajo ("Primario" aparece en común, especial y adultos). Buscar la fila por su contenido y leer las columnas por bloque.
- El CSV del servicio WFS escribe `POINT (latitud longitud)`, al revés que el GeoJSON.
- El resumen de la capa del Mapa Educativo dice "Padrón 05/09/2023", pero coincide con el padrón de junio de 2026 salvo en dos casos: el CUE-anexo 700118500 (Estrella de San Juan) aparece dos veces, con el mismo punto, y el 500192200 (Conejitos del Sol, Mendoza, de gestión social) no tiene punto. Unir sin duplicar y avisar las que queden sin punto.
- En el REFES, `DEPARTAMENTO_ID` tiene tres cifras: hay que anteponerle `PROVINCIA_ID` para llegar a las cinco de `departamentos.topo.json`. El padrón ya trae las cinco.
- En el REFES, `PROVINCIA_NOMBRE` no coincide con `PROVINCIA_ID` en algunas filas de Buenos Aires, Neuquén y Salta: usar siempre el código.
- El REFES llama "Municipal" a los hospitales de la Ciudad de Buenos Aires.
- Una escuela queda en la Antártida: la Escuela Provincial Nº 38 de Tierra del Fuego (CUE-anexo 940011700), en la Base Esperanza. Cae fuera de los departamentos del mapa (se quitaron los sectores antártico y de islas). Va en la lista, no en el mapa.
- El padrón trae al final tres columnas con proporciones sin documentar ("Total de hogares", "Hogares con población de 3 a 17", "Población de 3 a 17"). No se usan.

## Lo que falta verificar

- Si hay población por edad a nivel de departamento del Censo 2022 (`censo2022_departamentos.csv` tiene viviendas y empleo, no edades).
- El contenido de la base de matrícula por escuela, si el autor la baja a mano.
- Cuántos puntos caen fuera de su departamento.
