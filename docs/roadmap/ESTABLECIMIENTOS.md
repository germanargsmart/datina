# Escuelas y hospitales en el mapa de cada provincia

Pedido del autor del 9 de noviembre de 2026: "mapear a través de google maps o las páginas oficiales todos los hospitales nacionales y provinciales, y las escuelas primarias y secundarias, tanto públicas como privadas, de cada una de las provincias. Para ponerlas en un mapa provincia por provincia". Es para profundizar los datos territoriales de las páginas de cada provincia.

Estado: la fase 1 (datos y controles) está hecha desde el 9 de noviembre de 2026. `scripts/establecimientos.py` escribe `datos/manual/establecimientos/` y `scripts/prueba_establecimientos.py` lo controla. El sitio todavía no cambió. Lo próximo es la fase 2, el mapa, con dos decisiones del autor pendientes (al final).

## Las fuentes (verificadas el 9 de noviembre de 2026)

| Qué | Fuente y dirección | Qué trae | Fecha y licencia |
|---|---|---|---|
| Escuelas | Padrón Oficial de Establecimientos Educativos, DIEE, Ministerio de Capital Humano. `https://www.argentina.gob.ar/sites/default/files/2026.06.16_padron_oficial_establecimientos_educativos_die_icse.xlsx` (se encuentra con `package_show?id=padron-oficial-de-establecimientos-educativos` en datos.gob.ar, porque el nombre cambia con la fecha). XLSX de 15,6 MB | 64.696 localizaciones (CUE-anexo) con jurisdicción, sector, ámbito urbano o rural, departamento y localidad con su código INDEC, nombre, domicilio y una columna por oferta (inicial, primaria, secundaria, técnica, especial, adultos...). **No trae coordenadas** | Actualizado al 16/6/2026. CC BY 4.0 |
| Ubicación de las escuelas | Mapa Educativo Nacional, servicio WFS. `https://mapa.educacion.gob.ar/geoserver/ows?service=WFS&version=2.0.0&request=GetFeature&typeNames=publico:establecimiento_educativo&outputFormat=csv` (19 MB) | Un punto por CUE-anexo, con la precisión de la ubicación (`pre`: PRECISA o APROXIMADA), gestión, ámbito y niveles. Se une con el padrón por el CUE-anexo: 64.695 de 64.696 (ver "Trampas") | El servicio no declara licencia. Sale del padrón, que es CC BY 4.0: citar a la DIEE |
| Hospitales | Registro Federal de Establecimientos de Salud (REFES), Ministerio de Salud, versión georreferenciada. `https://sisa.msal.gov.ar/datos/descargas/georef/files/refes_georef.zip` (2,9 MB, un CSV adentro). La versión anual en datos.salud.gob.ar es la del 15/12/2025 | 39.445 establecimientos de todo tipo, con origen del financiamiento (nacional, provincial, municipal, privado...), tipología (con o sin internación, complejidad), departamento, localidad, domicilio, latitud y longitud | Se regenera todos los días (el del 9/11/2026, a las 7 UTC). CC BY 4.0 |
| Límites de los departamentos | Georef (IGN), `https://infra.datos.gob.ar/georef/departamentos.geojson` (1,2 MB, 529 departamentos) | Para controlar que cada punto caiga en su departamento. Es la misma fuente de `sitio/datos/departamentos.topo.json`, con más detalle | |
| Domicilios | API Georef, `https://apis.datos.gob.ar/georef/api/direcciones` | Ubica un domicilio en la calle. Hasta 1.000 por pedido (con 1.001 contesta el error 1008) | Oficial y gratis |
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
- **Un hospital es un establecimiento público con internación** del REFES (tipologías ESCI: general y especializados), **sin las residencias** (ESCIRES, 2.754 hogares de ancianos y viviendas con apoyo, que triplicarían a los privados).
- Los centros de atención primaria sin internación (CAPS) no son hospitales. Son donde está la mayor parte de la atención pública, y pueden ser una capa aparte.

## Decisiones del autor (9 de noviembre de 2026)

1. **Qué hospitales: todos los públicos con internación** (nacionales, provinciales, municipales, universitarios y mixtos: 1.468), con un filtro por dependencia. Así la Ciudad y el conurbano no quedan vacíos. Los privados no van.
2. **Las escuelas con ubicación aproximada: mejorarlas antes** con la API Georef. Hecho en la fase 1: ver "Georef" abajo.
3. **Gestión social o cooperativa: aparte**, como tercera categoría con su color y su filtro (57 escuelas primarias o secundarias).
4. **El mapa: el del sitio**, D3 sobre los límites de los departamentos, con acercamiento y sin calles. Sin bibliotecas ni servicios nuevos.

## Lo que dicen los números (9 de noviembre de 2026)

### Escuelas

35.346 localizaciones de educación común con primaria o secundaria: 22.629 con primaria y 13.750 con secundaria (1.033 tienen las dos). Estatales 27.790, privadas 7.499 y de gestión social o cooperativa 57. Rurales 13.225. El Mapa Educativo da ubicación aproximada para 4.283 (12 %). Después de Georef quedan 3.552 (10 %).

| Provincia | Total | Con primaria | Con secundaria | % privadas | % rurales | % aproximadas en el Mapa Educativo | % aproximadas después de Georef |
|---|---|---|---|---|---|---|---|
| Buenos Aires | 10.611 | 5.880 | 4.731 | 31,9 | 17,5 | 0,2 | 0,2 |
| Córdoba | 3.083 | 2.006 | 1.103 | 24,3 | 38,4 | 32,0 | 20,7 |
| Santa Fe | 2.629 | 1.689 | 952 | 24,5 | 34,2 | 1,5 | 1,1 |
| Entre Ríos | 1.818 | 1.246 | 581 | 17,4 | 50,2 | 0,4 | 0,4 |
| Misiones | 1.775 | 1.242 | 634 | 11,2 | 42,5 | 10,3 | 10,3 |
| Santiago del Estero | 1.743 | 1.219 | 572 | 5,3 | 82,6 | 36,3 | 35,4 |
| Chaco | 1.563 | 1.158 | 406 | 10,0 | 54,3 | 3,8 | 3,8 |
| Mendoza | 1.293 | 879 | 415 | 21,7 | 33,0 | 58,8 | 44,5 |
| Tucumán | 1.282 | 742 | 559 | 20,5 | 51,6 | 1,0 | 1,0 |
| Corrientes | 1.176 | 897 | 340 | 8,7 | 63,9 | 34,9 | 23,3 |
| Ciudad de Buenos Aires | 1.125 | 890 | 518 | 44,1 | 0,0 | 0,5 | 0,2 |
| Salta | 1.086 | 812 | 350 | 10,8 | 49,6 | 0,2 | 0,2 |
| Formosa | 905 | 583 | 343 | 3,4 | 67,7 | 33,5 | 32,9 |
| Jujuy | 660 | 423 | 253 | 7,6 | 51,1 | 2,0 | 2,0 |
| Catamarca | 657 | 443 | 233 | 4,3 | 69,7 | 36,4 | 36,4 |
| San Juan | 643 | 422 | 286 | 16,2 | 43,2 | 45,6 | 45,6 |
| Río Negro | 622 | 399 | 226 | 20,4 | 26,0 | 18,0 | 15,8 |
| San Luis | 567 | 360 | 391 | 8,5 | 58,4 | 3,9 | 3,9 |
| Neuquén | 546 | 378 | 171 | 17,9 | 32,1 | 1,8 | 1,6 |
| La Rioja | 477 | 338 | 186 | 7,8 | 61,0 | 32,1 | 32,1 |
| Chubut | 434 | 249 | 188 | 16,6 | 31,8 | 0,7 | 0,7 |
| La Pampa | 350 | 193 | 168 | 9,1 | 37,7 | 1,4 | 1,1 |
| Santa Cruz | 203 | 118 | 91 | 22,7 | 12,3 | 2,0 | 2,0 |
| Tierra del Fuego | 98 | 63 | 53 | 21,4 | 6,1 | 0,0 | 0,0 |

"% privadas" no cuenta las de gestión social o cooperativa. Las provincias con más ubicaciones aproximadas son las más rurales: justo donde más importa saber dónde queda cada escuela. El primer perfil de la mañana del 9 de noviembre contaba 35.347 escuelas: una estaba dos veces en el Mapa Educativo (ver "Trampas").

### Hospitales

3.809 establecimientos con internación (sin residencias): 1.468 públicos, 2.244 privados y 97 de otras dependencias (fuerzas armadas y de seguridad, obras sociales, servicios penitenciarios, mutuales). Los públicos se reparten así: 1.033 provinciales, 409 municipales, 12 nacionales, 10 universitarios y 4 mixtos. Les faltan coordenadas a 42 públicos (3 %), 16 de ellos en Córdoba.

**El pedido literal ("nacionales y provinciales") dejaba afuera casi todo el AMBA**, porque el REFES anota como municipales a los hospitales de la Ciudad y a la mayoría de los del conurbano. Por eso la decisión 1:

| Provincia | Públicos con internación | Solo nacionales y provinciales |
|---|---|---|
| Ciudad de Buenos Aires | 40 | 2 |
| Buenos Aires | 344 | 94 |
| Córdoba | 160 | 44 |
| Santa Fe | 137 | 127 |
| Las otras 20 provincias | 787 | casi todos (un municipal en Catamarca, uno en Tucumán y un nacional en Santa Cruz) |

## Fase 1: cómo está armada (9 de noviembre de 2026)

`python scripts/establecimientos.py --cache CARPETA` baja las fuentes a una carpeta fuera del repositorio (unos 40 MB, lo que ya está no se vuelve a bajar), se queda con lo que va al mapa y escribe en `datos/manual/establecimientos/`:

- `escuelas.csv` (5,7 MB): `cueanexo`, `nombre`, `codigo_indec`, `codigo_dep`, `departamento`, `localidad`, `sector`, `ambito`, `primaria`, `secundaria`, `tecnica`, `domicilio`, `lat`, `lon`, `ubicacion` (precisa, mejorada, aproximada o sin dato) y `fuera_km`.
- `hospitales.csv` (280 KB): `refes_id`, `nombre`, `codigo_indec`, `codigo_dep`, `departamento`, `localidad`, `dependencia`, `tipologia`, `complejidad`, `domicilio`, `lat`, `lon`, `ubicacion` y `fuera_km`.
- `control.json`: la dirección, la fecha y la licencia de cada fuente, los totales por provincia, por sector y por dependencia, y los resultados de los controles.

No va a `datos/crudo/` (que está en git y ya pesa 157 MB) ni a la actualización mensual: se corre a mano cuando sale un padrón nuevo, una o dos veces por año. Teléfono, correo y CUIT no se guardan. El nombre de cada departamento sale de Georef, el mismo para escuelas y hospitales. Frena si una fuente cambia de forma: columnas que faltan, un sector, una dependencia o una tipología con internación nuevos, códigos repetidos o los ejes del Mapa Educativo al revés. Una dependencia nueva del REFES hay que decidir si es pública antes de seguir.

`python scripts/prueba_establecimientos.py` corre sin red en cada PR (`pruebas.yml`): la limpieza de domicilios (22 casos), qué punto de Georef se acepta, los códigos del REFES, el padrón, el Mapa Educativo y el REFES leídos de archivos de juguete, el control de departamentos con un cuadrado con un hueco, y lo escrito contra su `control.json`.

### Georef

De las 4.283 escuelas aproximadas, 2.179 no tienen un domicilio que Georef pueda ubicar por calle: sin domicilio, "S/N", rutas, kilómetros, parajes, cuarteles, lotes, manzanas o casas de barrio. Las otras 2.104 se mandaron limpias (sin barrio ni piso al final, "AV." como "AVENIDA", "E/" como "entre", sin "N°"), con el código de su departamento:

- **731 aceptadas (17 % de las aproximadas)**: con número de calle o esquina, en su departamento y a menos de 10 km del punto aproximado. Pasan a "mejorada". Casi todas en Córdoba (350), Mendoza (185) y Corrientes (136).
- 1.323 sin resultado, 41 a más de 10 km y 9 sin número de calle: quedan aproximadas.

La prueba de la mañana, con los domicilios sin limpiar, había mejorado el 11 %. La mayoría sigue aproximada, sobre todo las rurales: cómo mostrarlas lo decide el autor antes de la fase 2.

### Puntos fuera de su departamento

Con los límites de Georef, que están simplificados, a menos de 1 km del departamento cuenta como borde y no como error (462 escuelas y 15 hospitales). Más lejos:

- **208 escuelas** (0,6 %): 146 con ubicación precisa y 62 aproximadas. La mitad, a menos de 4 km. Las más lejanas están a cientos de kilómetros, por ejemplo una escuela del departamento Formosa con el punto a 437 km. No se sabe si está mal el punto o el departamento.
- **16 hospitales**: el Hospital Vecinal San Marcos Sud (departamento Unión, Córdoba) tiene el punto a 219 km, cerca de San Marcos Sierras, y el de Tránsito de Los Pirpintos (Copo, Santiago del Estero) a 227 km. El Hospital Modular Tolhuin queda a 35 km de Río Grande porque el REFES todavía lo anota en ese departamento, del que se separó Tolhuin.

Quedan marcados con `fuera_km`. Qué hacer con ellos en el mapa lo decide el autor antes de la fase 2.

## Cómo sigue (un PR por fase)

**Fase 2. El mapa en la página de cada provincia.** Una ficha nueva en `provincia.html` y en las 24 páginas fijas (la provincia se elige solo ahí), que baja el archivo de su provincia cuando la ficha aparece en pantalla (un CSV por provincia en `sitio/datos/establecimientos/`, armado desde `datos/manual/establecimientos/`). Pregunta con respuesta que se cuenta, por ejemplo "¿Cuántas escuelas y hospitales hay en cada departamento?", con dos vistas (escuelas y hospitales) y filtros (primaria o secundaria, estatal, privada o social y cooperativa, dependencia del hospital). Puntos en canvas, no en SVG: Buenos Aires tiene más de 10.600 escuelas. "Ver tabla" da la tabla por departamento y una lista con buscador ("buscá tu escuela"). Lleva su origen en `relaciones.json`, su lugar en `catalogo.json`, la fecha en la descripción con `{{ruta}}` y el texto después del gráfico. El diseño se le muestra al autor con capturas antes de armarlo.

**Fase 3. Los cruces (el valor agregado de Datina).** Cada uno, su PR:

- Escuelas cada 1.000 chicos de 5 a 14 años por provincia, con las proyecciones que ya usa `chicos_escuela` en `02_procesar.py`. Cuenta lugares, no vacantes: decirlo.
- Qué parte de las escuelas es privada en cada departamento (de 44 % en la Ciudad a 3 % en Formosa), en el mapa de departamentos que ya existe.
- Hospitales públicos con terapia intensiva cada 100.000 habitantes por provincia (tipología "alto riesgo con terapia intensiva" del REFES y la población de `POB`).
- A cuántos kilómetros en línea recta queda el hospital público con internación más cercano de cada escuela rural. Las escuelas sirven de marca de dónde vive la gente, sin necesitar población por radio censal. La distancia en línea recta no es la de la ruta: decirlo.
- Las escuelas privadas y los resultados de Aprender por departamento (`aprender_departamentos`), con "Qué no dice este dato".

## Trampas de los archivos

- El padrón tiene el encabezado en dos filas (la 12 y la 13 de la hoja), con títulos de bloque arriba y nombres repetidos abajo ("Primario" aparece en común, especial y adultos). Se busca la fila por su contenido y las columnas por bloque. Cada oferta se marca con un 1.
- El CSV del servicio WFS escribe `POINT (latitud longitud)`, al revés que el GeoJSON.
- El resumen de la capa del Mapa Educativo dice "Padrón 05/09/2023", pero coincide con el padrón de junio de 2026 salvo en dos casos: el CUE-anexo 700118500 (Estrella de San Juan) aparece dos veces, con el mismo punto, y el 500192200 (Conejitos del Sol, Mendoza, de gestión social) no tiene punto (es un jardín: no entra).
- El REFES no usa siempre los códigos de departamento del INDEC: en la Ciudad numera las comunas del 1 al 15 (el INDEC va de 7 en 7: la Comuna 1 es 02007 y la 15, 02105), y en Tierra del Fuego (Río Grande 94007 y Ushuaia 94014, hoy 94008 y 94015) y Chascomús (06217, hoy 06218) conserva códigos viejos. `codigo_dep_refes()` los traduce, y un código que Georef no conoce queda en el control.
- En el REFES, `PROVINCIA_NOMBRE` no coincide con `PROVINCIA_ID` en cinco filas (en Buenos Aires, Neuquén y Salta): se usa siempre el código.
- El REFES llama "Municipal" a los hospitales de la Ciudad de Buenos Aires.
- Una escuela queda en la Antártida: la Escuela Provincial Nº 38 de Tierra del Fuego (CUE-anexo 940011700), en la Base Esperanza. Georef tiene su departamento, pero el mapa del sitio no (`departamentos.topo.json` quita los sectores antártico y de islas). En la fase 2 va en la lista, no en el mapa.
- El padrón trae al final tres columnas con proporciones sin documentar ("Total de hogares", "Hogares con población de 3 a 17", "Población de 3 a 17"). No se usan.

## Pendiente

Decisiones del autor antes de la fase 2:

- Cómo se muestran las 3.552 escuelas que siguen aproximadas. La recomendación sigue siendo otro símbolo (un círculo vacío) con la aclaración en la leyenda.
- Qué se hace con los 208 puntos de escuelas y los 16 de hospitales que caen a más de 1 km de su departamento: mostrarlos donde dice la fuente con un aviso, o dejarlos solo en la lista.

Por verificar:

- Si hay población por edad a nivel de departamento del Censo 2022 (`censo2022_departamentos.csv` tiene viviendas y empleo, no edades).
- El contenido de la base de matrícula por escuela, si el autor la baja a mano.
