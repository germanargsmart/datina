# Escuelas y hospitales en el mapa de cada provincia

Pedido del autor del 9 de noviembre de 2026: "mapear a través de google maps o las páginas oficiales todos los hospitales nacionales y provinciales, y las escuelas primarias y secundarias, tanto públicas como privadas, de cada una de las provincias. Para ponerlas en un mapa provincia por provincia". Es para profundizar los datos territoriales de las páginas de cada provincia.

Estado: la fase 1 (datos y controles) se unió el 9 de noviembre de 2026 (PR #119). La fase 2, el mapa en la página de cada provincia, quedó armada ese mismo día en la rama `claude/establecimientos-mapa`, con el diseño aprobado por el autor en capturas. Lo que sigue es la fase 3, los cruces.

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
Después de unir la fase 1, el mismo 9 de noviembre, el autor eligió entre opciones (primero contestó "mostrarlos donde dice la fuente, con un aviso" para los puntos fuera de su departamento, y después confirmó la respuesta que le había dado a otra sesión):

5. **Las escuelas con ubicación aproximada (3.552): igual que las demás.** El mismo punto que el resto en el mapa, sin símbolo distinto. La aclaración va solo en la ficha de cada escuela y en la metodología.
6. **Los puntos a más de 1 km de su departamento (208 escuelas y 16 hospitales): corregir a mano los peores.** Se revisan a mano los 16 hospitales y las escuelas que quedan lejos (por ejemplo, a más de 20 km), y se corrige solo lo que se pueda confirmar con una fuente oficial, anotando de dónde sale cada corrección. Los que no se puedan confirmar no se dibujan: siguen contando en su departamento y aparecen en la lista con un aviso. A menos de 1 km es el borde de los límites simplificados y no lleva aviso.
7. **Capturas primero.** El diseño del mapa se le muestra al autor en capturas de 390 y 1440 píxeles antes de abrir el PR de la fase 2.

Con las primeras capturas del mapa, el mismo 9 de noviembre, el autor pidió otro fondo ("el mapa queda feo, los puntos están bien, pero el fondo no me gusta, buscá otros fondos para el mapa no solo división administrativa, para hacerlo más interactivo"). Eligió entre cuatro fondos probados con los mismos puntos:

8. **El fondo: el mapa oficial del Instituto Geográfico Nacional en gris, de entrada**, con un selector para verlo a color (Argenmap) o con la imagen satelital de Esri y los nombres del IGN encima. El relieve del IGN quedó afuera. La decisión 4 cambia: para arrastrar y acercar hasta las calles se suma **Leaflet**, servida desde el propio sitio, y las teselas del fondo se piden a los servidores del IGN y de Esri.
9. Lo que quedó así porque el autor no pidió cambiarlo: las 175 escuelas a menos de 20 km de su departamento se dibujan donde las pone la fuente, con la distancia en su ficha. Los hospitales van en celeste los provinciales, en amarillo los municipales y en negro los nacionales, universitarios y mixtos. La tabla por departamento arranca cerrada.

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

- `escuelas.csv` (5,7 MB): `cueanexo`, `nombre`, `codigo_indec`, `codigo_dep`, `departamento`, `localidad`, `sector`, `ambito`, `primaria`, `secundaria`, `tecnica`, `domicilio`, `lat`, `lon`, `ubicacion` (precisa, mejorada, aproximada, sin dato o sin confirmar), `fuera_km`, `correccion` y `correccion_fuente`.
- `hospitales.csv` (280 KB): `refes_id`, `nombre`, `codigo_indec`, `codigo_dep`, `departamento`, `localidad`, `dependencia`, `tipologia`, `complejidad`, `domicilio`, `lat`, `lon`, `ubicacion`, `fuera_km`, `correccion` y `correccion_fuente`.
- `control.json`: la dirección, la fecha y la licencia de cada fuente, los totales por provincia, por sector y por dependencia, y los resultados de los controles y de las correcciones.

Y lee `correcciones.csv`, la revisión a mano de la fase 2 (abajo).

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

Quedan marcados con `fuera_km`. Los peores se revisaron a mano (abajo).

### Revisión a mano de los peores (decisión 6, 9 de noviembre de 2026)

Se revisaron los 16 hospitales y las 33 escuelas a más de 20 km de su departamento. Para cada uno se juntaron tres datos de Georef (IGN): en qué departamento cae el punto (`/ubicacion`), dónde está la localidad que declara la fuente, buscada por nombre en su provincia (`/localidades` y `/asentamientos`, que tiene los parajes), y si su domicilio se ubica en la calle dentro del departamento declarado (`/direcciones`). Con una sola regla:

- **Punto corregido**: la localidad declarada está, sola, en el departamento declarado y lejos del punto. Estaba mal el punto. Va a su domicilio en la calle si Georef lo encuentra (`mejorada`) y, si no, al centro de su localidad (`aproximada`, que se muestra igual que las demás por la decisión 5).
- **Departamento corregido**: un lugar con el nombre de la localidad o del domicilio está en el departamento donde cae el punto. Estaba mal el departamento. El punto queda y la escuela u hospital pasa a contar en ese departamento.
- **Sin confirmar**: la localidad no aparece, o aparece en los dos departamentos. No se dibuja en el mapa, sigue contando en el departamento que declara la fuente y sale en la lista con un aviso.

Resultado: 33 puntos corregidos (20 escuelas y 13 hospitales), 8 departamentos corregidos (6 escuelas y 2 hospitales) y 8 sin confirmar (7 escuelas y 1 hospital). Cada uno está en `datos/manual/establecimientos/correcciones.csv` con el registro de Georef que lo prueba. `establecimientos.py` lo aplica solo si la fuente sigue diciendo lo mismo que cuando se revisó (el mismo punto, a menos de 100 metros, y el mismo departamento). Si cambió, no lo aplica y lo deja en `control.json` para revisarlo de nuevo. Errores que se repiten: lugares con nombres parecidos ("Vaquería" quedó en Vaqueros, "La Bajada" en Bandera Bajada, San Marcos Sud en San Marcos Sierras) y puntos puestos en la capital de la provincia o en una oficina del ministerio.


**Hospitales**

| Hospital | Provincia | Qué se hizo | Por qué |
|---|---|---|---|
| HOSPITAL RAMON PERALTA DE SAN CARLOS MINAS (10140702231244) | Córdoba | Punto corregido (a su localidad, aproximado) | El punto caía en San Alberto |
| HOSPITAL LUIS MARIA BELLODI MINA CLAVERO (10141262231217) | Córdoba | Punto corregido (a su localidad, aproximado) | El punto caía en San Javier |
| HOSPITAL VECINAL SAN MARCOS SUD (10141822231264) | Córdoba | Punto corregido (a su localidad, aproximado) | El punto caía en San Marcos Sierras (Cruz del Eje), a 289 km de San Marcos Sud |
| HOSPITAL ZONAL TRELEW DR. ADOLFO MARGARA (10260772129042) | Chubut | Punto corregido (a su localidad, aproximado) | El punto caía a 27 km de Trelew, fuera de los departamentos de Georef |
| ESTABLECIMIENTO ASISTENCIAL MATILDE Y VIRGINIA GHIOLDI (10421262153039) | La Pampa | Punto corregido (a su localidad, aproximado) | El punto caía en Quemú Quemú |
| SAMCO DE CARLOS PELLEGRINI - DR. JULIO CORTES BELASCUEN (10821262184076) | Santa Fe | Punto corregido (a su domicilio) | El punto caía en San Lorenzo |
| HOSPITAL DE TRANSITO DE LOS PIRPINTOS (10860562192023) | Santiago del Estero | Punto corregido (a su domicilio) | El punto caía en Juan Felipe Ibarra, a 242 km de Los Pirpintos |
| HOSPITAL DISTRITAL COLONIA EL SIMBOLAR (10861612192033) | Santiago del Estero | Punto corregido (a su localidad, aproximado) | El punto caía en Banda |
| HOSPITAL ZONAL FERNANDEZ DR. RUDECINDO DEL V. CAZZANIGA (10861612192058) | Santiago del Estero | Punto corregido (a su localidad, aproximado) | El punto caía en la ciudad de Santiago del Estero |
| HOSPITAL COLONIA SANTA MARIA (13140912131359) | Córdoba | Punto corregido (a su localidad, aproximado) | El punto caía en Tercero Arriba |
| COMUNIDAD TERAPEUTICA LA EDUVIGIS (13220842127139) | Chaco | Punto corregido (a su localidad, aproximado) | El punto caía en 1° de Mayo. Es rural: el domicilio dice ruta 90 y 4 km de camino vecinal |
| CENTRO RESIDENCIAL DE REHABILITACION Y REINSERCION SOCIAL LAS MORITAS (13900072196064) | Tucumán | Punto corregido (a su localidad, aproximado) | El punto caía 1,2 km dentro de Tafí Viejo. Es rural: ruta 305, km 11 |
| HOSPITAL ILLIA (50140212232547) | Córdoba | Punto corregido (a su localidad, aproximado) | El punto caía en Punilla, cerca de Villa Carlos Paz |
| CENTRO DE SALUD GUADALCAZAR (10340352147309) | Formosa | Departamento corregido: Bermejo | El domicilio dice Guadalcázar, que está en Bermejo, donde cae el punto. El REFES lo anota en Patiño, en Posta Cambio Zalazar |
| HOSPITAL MODULAR TOLHUIN (50940072195790) | Tierra del Fuego | Departamento corregido: Tolhuin | Tolhuin es departamento propio desde 2017. El REFES lo anota todavía en Río Grande |
| ESTABLECIMIENTO SANITARIO PERIFIFERICO DE ENFERMERIA LA ALUMBRERA (10100352124013) | Catamarca | Sin confirmar: no se dibuja | Georef no tiene La Alumbrera en Belén. El punto cae en Tinogasta |

**Escuelas**

| Escuela | Provincia | Qué se hizo | Por qué |
|---|---|---|---|
| INSTITUTO THOMAS EDISON (140577800) | Córdoba | Punto corregido (a su localidad, aproximado) | El punto caía en Río Cuarto, a 201 km de Bialet Massé |
| COLEGIO SECUNDARIO N 58 (380095500) | Jujuy | Punto corregido (a su localidad, aproximado) | El punto caía cerca de San Salvador de Jujuy |
| Programa de Inclusión Educativa Vos Podés Técnico (420021601) | La Pampa | Punto corregido (a su localidad, aproximado) | El punto caía en Santa Rosa. El domicilio es la ruta 35, km 405 |
| 4-258 ESPERANZA DE LAGUNA (500257200) | Mendoza | Punto corregido (a su localidad, aproximado) | El punto caía en Godoy Cruz |
| Aula Sat. Nº 04: ESC. Nº 374 (540004404) | Misiones | Punto corregido (a su localidad, aproximado) | El punto caía en Iguazú. Es un aula satélite en una comunidad mbya sobre la ruta 14 |
| Aula Sat. Nº 04: ESC. Nº 483 (540024204) | Misiones | Punto corregido (a su localidad, aproximado) | El punto caía en Iguazú, en el mismo lugar que otra aula satélite |
| Aula Sat. Nº 01: ESC. Nº 776 (Ex Esc. Nº 863) (540048901) | Misiones | Punto corregido (a su localidad, aproximado) | El punto caía en 25 de Mayo |
| ESCUELA N° 4368 HÉROE NACIONAL GENERAL GÜEMES (660013000) | Salta | Punto corregido (a su localidad, aproximado) | El punto caía en Vaqueros (La Caldera): se confundió Vaquería con Vaqueros |
| AERONAUTICA ARGENTINA Nº 4113 - EX N° 192 (660021700) | Salta | Punto corregido (a su localidad, aproximado) | El punto caía cerca de Tartagal |
| CARMEN GUEMES DE LATORRE EX N° 563 (660044200) | Salta | Punto corregido (a su localidad, aproximado) | El punto caía en La Caldera, en el mismo lugar que otra escuela. Hay tres Bella Vista en Salta: se usa la de Chicoana |
| MARIA LUISA BRAVO DE MATUTE EX N°534 (660077000) | Salta | Punto corregido (a su localidad, aproximado) | El punto caía en la ciudad de Salta |
| ESCUELA DE EDUCACIÓN SECUNDARIA ENRIQUE LARRETA (700093700) | San Juan | Punto corregido (a su localidad, aproximado) | El punto caía en otra Punta del Médano, en 25 de Mayo. El domicilio dice Cochagual, que está en Sarmiento a 3 km de esta |
| ESC.N°323 JUAN W.GEZ (740051601) | San Luis | Punto corregido (a su localidad, aproximado) | El punto caía en General Pedernera. Hay otra Santa Ana en Ayacucho: se usa la de Junín |
| ESCUELA PART. INC. NRO 1152 SAN JOSE (820189100) | Santa Fe | Punto corregido (a su domicilio) | El punto caía en San Justo |
| ANEXO ESCUELA Nº 256 GAUCHO RIVERO (860151601) | Santiago del Estero | Punto corregido (a su localidad, aproximado) | El punto caía en Figueroa |
| CENTRO EXPERIMENTAL Nº 2 FLORENTINO AMEGHINO J/N.14 (860164300) | Santiago del Estero | Punto corregido (a su localidad, aproximado) | El punto caía en Alberdi, a 247 km de Añatuya |
| AGRUPAMIENTO Nº 86077 SEDE ESC Nº 937 (860208900) | Santiago del Estero | Punto corregido (a su localidad, aproximado) | El punto caía en Aguirre, cerca de Colonia Libertad |
| Agrupamiento 86164 Esc. Nº 479 (860219202) | Santiago del Estero | Punto corregido (a su localidad, aproximado) | El punto caía en Bandera Bajada (Figueroa): se confundió La Bajada con Bandera Bajada |
| San Pío de Pietrelcina (860219600) | Santiago del Estero | Punto corregido (a su localidad, aproximado) | El punto caía en Choya, a 132 km de La Banda |
| INST. SAN JOSE (900008900) | Tucumán | Punto corregido (a su localidad, aproximado) | El punto caía en Tafí del Valle |
| I.P.E.A. Nº 306 DR. AMADEO SABATTINI ANEXO PIT PARAJE EL QUICHO (140468301) | Córdoba | Departamento corregido: Cruz del Eje | El anexo funciona en el paraje El Quicho, que está en Cruz del Eje, donde cae el punto. El padrón lo anota en Pocho |
| ESC. N° 94 GRANADERO FRANCISCO GATICA (740002601) | San Luis | Departamento corregido: Libertador General San Martín | El Puesto está en Libertador General San Martín, donde cae el punto. El padrón la anota en Ayacucho |
| ESC. N° 279 SOLDADO ARGENTINO (740006001) | San Luis | Departamento corregido: Chacabuco | El Recuerdo está en Chacabuco, donde cae el punto. El padrón la anota en Juan Martín de Pueyrredón |
| AGRUPAMIENTO Nº 86016 ESC Nº 783 (860198101) | Santiago del Estero | Departamento corregido: General Taboada | El domicilio dice La Simona, que está en General Taboada, donde cae el punto. El padrón la anota en San Martín |
| AGRUPAMIENTO Nº 86016 ESC Nº 501 (860198105) | Santiago del Estero | Departamento corregido: General Taboada | El domicilio dice La Nena, que está en General Taboada, donde cae el punto. El padrón la anota en San Martín |
| AGRUPAMIENTO Nº 86010 ESC Nº 651 (860215205) | Santiago del Estero | Departamento corregido: Quebrachos | El domicilio dice Ramírez de Velazco, que está en Quebrachos, donde cae el punto. El padrón la anota en Jiménez |
| EPEP N° 412 ANEXO 2 (340028902) | Formosa | Sin confirmar: no se dibuja | La localidad dice DESCONOCIDO y el domicilio, entre dos comunidades que Georef no tiene |
| EPEP Nº 188 ANEXO 2 (340029402) | Formosa | Sin confirmar: no se dibuja | Georef no tiene Amarilla. El punto cae en Ramón Lista, a 437 km del departamento Formosa |
| ESC.PRIV.EVANGELICA LAGUNA YACARE (340061700) | Formosa | Sin confirmar: no se dibuja | Georef no tiene Laguna Yacaré |
| Aula Sat. Nº 01: C.F.P. itinerante Nº 01 (E.P.E.T. Nº 03) (540202901) | Misiones | Sin confirmar: no se dibuja | El padrón dice Oberá, pero el domicilio es el Ministerio de Educación en Posadas, donde cae el punto. Es un centro itinerante |
| AGRUPAMIENTO Nº 86077 - ESC N° 180 (860208906) | Santiago del Estero | Sin confirmar: no se dibuja | Hay un Santos Lugares donde cae el punto (Alberdi) y otro en Moreno, el departamento que anota el padrón |
| Agrupamiento N° 86042 Esc. N° 345 (860216806) | Santiago del Estero | Sin confirmar: no se dibuja | Georef no tiene El Porvenir en Río Hondo: hay uno en Alberdi y otro en Pellegrini |
| Agrupamiento 86103 Esc. N° 363 (860219302) | Santiago del Estero | Sin confirmar: no se dibuja | Georef no tiene El Barrialito en Banda: hay un Barrialito en Río Hondo, donde cae el punto, y un El Barrialito en Robles |

**Las otras 175 escuelas fuera de su departamento** (entre 1 y 20 km) no se revisaron: la decisión 6 habla de "los peores". Lectura de esta sesión, para que el autor la confirme con las capturas: se dibujan donde dice la fuente, cuentan en el departamento que declara y su ficha dice a cuántos kilómetros de él cae el punto.

## Cómo sigue (un PR por fase)

**Fase 2. El mapa en la página de cada provincia (hecha el 9 de noviembre de 2026, aprobada por el autor con capturas).** Ver "Fase 2: cómo está armada".

**Fase 3. Los cruces (el valor agregado de Datina).** Cada uno, su PR:

- Escuelas cada 1.000 chicos de 5 a 14 años por provincia, con las proyecciones que ya usa `chicos_escuela` en `02_procesar.py`. Cuenta lugares, no vacantes: decirlo.
- Qué parte de las escuelas es privada en cada departamento (de 44 % en la Ciudad a 3 % en Formosa), en el mapa de departamentos que ya existe.
- Hospitales públicos con terapia intensiva cada 100.000 habitantes por provincia (tipología "alto riesgo con terapia intensiva" del REFES y la población de `POB`).
- A cuántos kilómetros en línea recta queda el hospital público con internación más cercano de cada escuela rural. Las escuelas sirven de marca de dónde vive la gente, sin necesitar población por radio censal. La distancia en línea recta no es la de la ruta: decirlo.
- Las escuelas privadas y los resultados de Aprender por departamento (`aprender_departamentos`), con "Qué no dice este dato".

## Fase 2: cómo está armada (9 de noviembre de 2026)

Una sección de la página de provincia, "Escuelas y hospitales", después de "Cómo cambió entre los censos" y en el menú de la página, en `provincia.html` (escondida con "Todo el país") y en las 24 páginas fijas. No es una ficha: las secciones de la página de provincia llevan títulos que dicen qué son, como "Dónde se destaca", no una pregunta.

- **Los datos.** `scripts/establecimientos_sitio.py`, que corre 03 en cada armado, escribe `sitio/datos/establecimientos/{código}.csv` desde `datos/manual/establecimientos/`: una tabla por jurisdicción con escuelas y hospitales, columnas cortas (Buenos Aires son 1,4 MB y unos 400 KB comprimidos) y sin punto para lo que no se dibuja. 03 le pone a la sección la huella de las tablas (las pide con `?v=`), la fecha de cada fuente (el texto la escribe en palabras: ningún año va a mano) y cuántas filas tiene cada provincia: una tabla que llega cortada es una falla, no una provincia con menos escuelas. `_headers` las sirve como texto para que Cloudflare las comprima, como las de Elecciones por mesa. No van al Catálogo de datos (`catalogo.py` mira solo el primer nivel de `sitio/datos/`): cada sección ofrece la descarga de su provincia.
- **Cuándo baja.** Nada se baja hasta que la sección se acerca a la pantalla (un `IntersectionObserver` guardado en `EST`: sin una referencia, Chrome lo descartaba y no avisaba nunca). Primero la tabla y los departamentos, y con eso se escriben la leyenda, el texto, la tabla por departamento, la nota y el buscador. Después Leaflet (su dirección con huella va en la sección) y el mapa. Si Leaflet no llega, el texto, la tabla y el buscador quedan, y el mapa lo dice.
- **El marcado es fijo.** `pintarPanel` rehace las otras secciones cada vez que cambia el ancho. Esta no: la llena una vez por provincia y, al cambiar el ancho, Leaflet solo se acomoda (`invalidateSize`). Así no se pierden lo buscado, el punto elegido ni el acercamiento.
- **El mapa.** Leaflet 1.9.4 en `scripts/lib/` (de npm, igual byte por byte a la de jsDelivr, licencia BSD-2), sin sus botones: van los del sitio (+, − y Todo) y tres conmutadores (Escuelas u Hospitales, el nivel y el fondo). La rueda acerca solo con Ctrl, y en las pantallas táctiles se mueve con dos dedos, para que un dedo siga bajando la página. Con el teclado, el mapa se mueve con las flechas. Los puntos van en el canvas de Leaflet, en un orden mezclado y siempre el mismo (si no, el último color tapaba a los demás en el conurbano), crecen al acercar y llevan borde blanco solo cuando hay lugar. Al tocar uno, o al elegirlo en el buscador, se abre su ficha debajo del mapa, con la aclaración de su ubicación, y queda marcado con un círculo rojo.
- **Los fondos.** IGN: `capabaseargenmap` (a color), `mapabase_gris` y `mapabase_hibrido` (los nombres, sobre la imagen), en `https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/{capa}@EPSG%3A3857@png/{z}/{x}/{y}.png` con `tms: true` (el eje y va al revés). Esri: `World_Imagery`. No se encontró una licencia escrita de Argenmap: el IGN pide citarlo, y el sector público nacional tiene que usarlo (Decisión Administrativa 797/2022). Esri pide su crédito y el de sus proveedores, y su uso comercial no está claro: Datina no cobra. Si esos servidores no contestan, los puntos se ven igual sobre los departamentos, y las pruebas no cuentan como error una tesela que no llega (`TESELAS` en `scripts/cdp.mjs`). A la escala de toda la provincia, el gris del IGN tiene una línea blanca fina sobre el mar: es de sus teselas.
- **Las pruebas.** `prueba_establecimientos.py` controla que lo publicado sea lo que arman los datos. La prueba de páginas abre Chaco: la sección, el mapa, el texto, la leyenda, la tabla, el buscador con su ficha, Hospitales y el cambio de fondo. La de fallas: sin la tabla, con la tabla cortada (y "Volver a intentar") y sin Leaflet.

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

Decisiones del autor: ninguna pendiente.

Por verificar:

- Si hay población por edad a nivel de departamento del Censo 2022 (`censo2022_departamentos.csv` tiene viviendas y empleo, no edades).
- El contenido de la base de matrícula por escuela, si el autor la baja a mano.
