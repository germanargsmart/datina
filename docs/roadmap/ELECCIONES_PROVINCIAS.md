# Elecciones de cada jurisdicción desde la primera

Pedido del autor del 7 de noviembre de 2026, con el enlace a `azha2005.github.io/257arg/capital/` (104 elecciones porteñas de 1864 a 2007 por parroquia y circunscripción): "profundicemos el trabajo electoral. Para eso vas a buscar todas las provincias que tengan votación desde su primera votación en las páginas electorales, ya sea el Poder Judicial Nacional, el Poder Judicial de la Provincia. Arrancá mapeando la Ciudad de Buenos Aires, Provincia de Buenos Aires, Tucumán, Entre Ríos, Corrientes, las fundacionales, y que tengan registro de las elecciones, todas las elecciones, ya sea a gobernador, a presidente y a diputados nacionales, senadores nacionales".

Este documento es el mapa: qué elecciones hubo en cada jurisdicción, quién publica sus resultados, hasta qué nivel (jurisdicción, sección o departamento, circuito, mesa), en qué formato y con qué permiso. No suma nada al sitio todavía: lo que se sume sale de acá, con la decisión del autor. Las otras 19 jurisdicciones siguen el mismo esquema, en otra tanda.

Revisado el 7 de noviembre de 2026 desde la nube. Cada dirección dice qué contestó ese día. Un 403 o un corte de conexión desde la nube no quiere decir que la página no exista: varios organismos rechazan las conexiones que no vienen de la Argentina.

## Lo principal

| Jurisdicción | Gobernador (o jefe de Gobierno) oficial en línea | Por mesa, oficial | Huecos más grandes |
|---|---|---|---|
| CABA | 2000 a 2025: Tribunal Superior de Justicia, Tribunal Electoral, BA Data e IDECBA | 2013 a 2025 en BA Data (2023 y 2025 provisorios por mesa), y la segunda vuelta de 2007 | 1996 sin fuente oficial digital, legisladores 1997 en ninguna fuente, el Concejo Deliberante de 1918 a 1993 |
| Buenos Aires | 1963 por sección (escaneado), 1973 y 1983 a 1999 el total, 2003 a 2025 por distrito y sección: Junta Electoral. 2005 a 2023 por municipio: Ministerio de Gobierno, CC BY 4.0 | Ninguno como datos (solo la consulta de a una mesa de la Cámara, 2015 a 2023) | El gobernador por partido antes de 2003 y todo lo de 1913 a 1962 |
| Tucumán | 2003 a 2011 por sección y 2015 a 2023 por mesa: Junta Electoral Provincial | 2015, 2019 y 2023, con circuito | 1983 a 1999 sin nada oficial en línea |
| Entre Ríos | 1935, 1939, 1950, 1991, 1999 y 2011 a 2023 por departamento, 1963, 1973 y 1983 el total: archivo del gobierno provincial, Tribunal Electoral y DGEC | 2011, en el provisorio de la DINE que Datina ya baja | 1987, 1995, 2003 y 2007 sin nada oficial en línea |
| Corrientes | 1983 a 2019 (departamento desde 1989, mesa desde 2011): Subdirección de Cómputos. 2025 por mesa: API de la Junta Electoral | 2011 a 2019 y 2025 | 2021 en ninguna fuente accesible |

Para lo anterior a 1983 no hay fuentes oficiales en línea salvo excepciones: los escrutinios de Entre Ríos desde 1935 en el archivo provincial, los electores de gobernador de Buenos Aires de 1963 en la Junta Electoral y la publicación del Ministerio del Interior de 1952 (1946 a 1951), escaneada por la Biblioteca del Congreso. El resto está en papel (las publicaciones del Ministerio del Interior de 1946, 1963 y 1973, el fondo de la Dirección Nacional Electoral en el AGN, los diarios de sesiones de las legislaturas) o en libros con derechos vigentes (Cantón, Cantón y Jorrat, Solís Carnicer, Luzi, Amaral, Ferrari, Walter). Antes de la ley Sáenz Peña, el gobernador lo elegían la Legislatura o un colegio electoral en las cinco, y casi no hay votos publicados.

## Qué tiene Datina hoy

La herramienta Elecciones por mesa (`mesas.html`, `docs/roadmap/MESAS.md`) tiene solo cargos nacionales: presidente, diputados y senadores. Ningún gobernador, ninguna elección provincial y nada antes de 1912. En las cinco jurisdicciones de esta tanda (`sitio/datos/mesas/indice.json`, 7 de noviembre de 2026):

| Jurisdicción | Elecciones | Desde | Lo que falta entre 1912 y 1983 |
|---|---|---|---|
| CABA | 59 | 1912 | Las que 257arg no transcribió (1913, 1919, 1924, 1931, 1934, 1936, 1938, 1942, 1957, 1960 y 1963) y los senadores por la Capital |
| Buenos Aires | 56 | 1914 | 1912, 1937, 1940 y las mismas de arriba |
| Tucumán | 56 | 1916 | 1912, 1914, 1918 y las mismas de arriba |
| Entre Ríos | 57 | 1914 | 1912, 1937 y las mismas de arriba |
| Corrientes | 56 | 1914 | 1912, 1937, 1940 y las mismas de arriba |

Los senadores entran desde 2001, cuando empezó el voto directo, y cada jurisdicción elige los suyos cada seis años: los años sin senadores de cada una no son huecos.

## Fuentes nacionales (sirven para las 24 jurisdicciones)

| Fuente | Organismo | Tipo | Años | Cargos | Nivel | Formato | Dirección | Respuesta el 7 de noviembre | Condiciones |
|---|---|---|---|---|---|---|---|---|---|
| Resultados electorales | Dirección Nacional Electoral (Ministerio del Interior) | Ejecutivo nacional | 1983 a 2023 | Presidente, diputados y senadores nacionales. Ningún cargo provincial | Jurisdicción (definitivo). Mesa desde 2011 (provisorio) | Un Excel por año y cargo, ZIP por mesa | `argentina.gob.ar/dine/resultados-electorales` y `/elecciones-AAAA` | 200 | Datos públicos (CC BY 4.0 en datos.gob.ar) |
| Senadores por la Capital | Dirección Nacional Electoral | Ejecutivo nacional | 1983, 1992 y 1995 | Senadores nacionales por la Capital, con voto popular | Jurisdicción | Excel | `argentina.gob.ar/sites/default/files/resultados_1983_senadores_nacionales_0.xlsx`, `resultados_1992_...` y `resultados_1995_...` | 200 | Datos públicos |
| Actas de escrutinio definitivo | Cámara Nacional Electoral (Poder Judicial de la Nación) | Judicial nacional | 2017 a 2025 | Cargos nacionales | Jurisdicción | PDF escaneado | `electoral.gob.ar/nuevo/paginas/btn/pe.php` (una página por elección) | 200 | Públicas. Datina ya usa las de 2023 y 2025 |
| Escrutinio por mesa | Cámara Nacional Electoral | Judicial nacional | 2011 a 2025 | Cargos nacionales, y los provinciales que se votaron el mismo día con el sistema nacional (Buenos Aires 2015, 2019 y 2023) | Mesa | Consulta de a una, con código de seguridad | `padron.gob.ar/publica` | (ver `MESAS.md`) | No se baja como datos |
| Micrositio "Recorriendo las elecciones" | Dirección Nacional Electoral | Ejecutivo nacional | 1983 en adelante | Cargos nacionales | | Página interactiva | `recorriendo.elecciones.gob.ar` | Sin respuesta (502 del proxy) | |
| Escrutinios definitivos de PolAr | PolAr, Juan Pablo Ruiz Nicolini, a partir de las tablas del Atlas Electoral de Andy Tow | Académico | 1946 a 2019 | Gobernador (y jefe de Gobierno) y presidente | Jurisdicción | CSV (`lista, votos, electores`) | `raw.githubusercontent.com/PoliticaArgentina/data_warehouse/master/electorAr/data/escrutinios_definitivos/{distrito}_gober_gral{año}.csv` | 200 | El repositorio es MIT, pero los datos son tablas del Atlas de Tow, que no declara licencia. Es la única base de gobernadores que se encontró como datos |
| Atlas Electoral de Andy Tow | Andy Tow | Académico | 1946 a 2019 | Todos, incluidos gobernadores | Jurisdicción y departamento | HTML | `andytow.com/atlas/totalpais/` | 401 (pide iniciar sesión) | Sin licencia declarada. El proyecto electoral del autor anotó CC BY-ND para las mesas |
| Atlas electorales argentinos (257arg) | azhadron, elfiguretti e itsahardlife | Académico, transcripciones | 1864 a 2025 | Cargos nacionales y, en la Capital, jefe de Gobierno, Legislatura y convencionales | Departamento, circunscripción, parroquia | JSON y JS | `azha2005.github.io/257arg/` | 200 | CC BY 4.0 sobre lo propio. Los datos de terceros conservan sus términos (`LICENSE-DATA.md`) |
| Materiales para el estudio de la sociología política en la Argentina | Darío Cantón, Instituto Di Tella (1968) | Académico | 1912 a 1966 | Cargos nacionales | Departamento | Libro | No está en línea | | Derechos de autor del libro. 257arg lo transcribió en parte |

Los gobernadores de PolAr que existen como archivo para las cinco jurisdicciones de esta tanda (probados uno por uno el 7 de noviembre de 2026):

| Jurisdicción | Años |
|---|---|
| CABA (jefe de Gobierno) | 1996, 2000, 2003, 2007, 2011, 2015 y 2019 (sin la segunda vuelta como archivo aparte) |
| Buenos Aires | 1958, 1962, 1963, 1973, y de 1983 a 2019 cada cuatro años |
| Tucumán | De 1983 a 2019 cada cuatro años |
| Entre Ríos | 1958, 1962, 1963, 1973, y de 1983 a 2019 cada cuatro años |
| Corrientes | 1958, 1962, 1963, 1973, 1983, 1987, 1991, 1993, 1997, 2001, 2005, 2009 y 2017, con las segundas vueltas en archivos aparte (`corrientes_gober_balota1997.csv` y siguientes). Faltan 2013, 2021 y 2025 |

La Dirección Nacional Electoral no publica ningún resultado definitivo de gobernador. Su escrutinio provisorio por mesa (los ZIP de 2011 en adelante y la API de `resultados.mininterior.gob.ar`) sí trae las categorías provinciales y municipales que se votaron el mismo día con las nacionales, como los legisladores de la CABA o los intendentes de Buenos Aires. El definitivo de esas categorías lo hace cada provincia, con su junta o tribunal electoral, aunque se voten el mismo día que las nacionales.

## Fuentes secundarias e históricas nacionales (pedido del autor del 7 de noviembre de 2026)

El autor pidió sumar "fuentes secundarias también, como libros de historia, tal cual hizo 257arg". 257arg trabaja así: transcribe a mano, con un control por OCR, las tablas de libros y expedientes escaneados (Cantón 1968, los expedientes de diplomas de la Cámara de Diputados de 1912 a 1922, diarios de época, una planilla del Archivo General de la Nación), y guarda en cada dato la página de donde salió. Lo que sirve para todo el país:

| Obra | Autor u organismo | Qué trae | Nivel | Dónde está | Respuesta el 7 de noviembre | Derechos |
|---|---|---|---|---|---|---|
| *Materiales para el estudio de la sociología política en la Argentina*, tomos I y II (Instituto Di Tella, 1968) | Darío Cantón | Tomo I: resultados de las elecciones nacionales por provincia de 1912 a 1965 (capítulo III), elecciones provinciales de gobernador de los años veinte en Catamarca, Córdoba, Entre Ríos, Mendoza, Salta, San Juan, San Luis y Santa Fe (capítulo IV), los reglamentos electorales y la lista de archivos que usó. Tomo II: las tablas por departamento | Provincia y departamento | Internet Archive, `archive.org/details/1968-materiales-para-el-estudio-de-la-sociologia-1` y `-2`, con PDF y texto | 200 | Copia subida por un particular. El tomo I lleva una marca de dominio público que puso quien lo subió, no la editorial: el libro tiene derechos vigentes. 257arg transcribió parte del tomo II |
| *Elecciones y partidos políticos en la Argentina. Historia, interpretación y balance 1910-1966* (Siglo XXI, 1973) | Darío Cantón | Análisis con cuadros | Provincia | Internet Archive, `eleccionesyparti0000cant`, solo préstamo | 200 | Derechos vigentes |
| *Las Fuerzas Armadas restituyen el imperio de la soberanía popular. Las elecciones generales de 1946*, dos tomos | Ministerio del Interior (Imprenta de la Cámara de Diputados, 1946) | Los resultados de 1946, incluidos los gobernadores | Departamento, según la Wikipedia que lo cita | Solo fichas de catálogo. No se encontró copia digital | | Publicación oficial |
| Fondo DNE01, serie "Resultados electorales" 1934-1975 | Archivo General de la Nación (Dirección Nacional Electoral) | Planillas por provincia y sexo con inscriptos, votantes y votos por partido. Carpetas de constituyentes 1957, legislativas 1960 y 1962, y presidenciales y legislativas 1963 | Departamento, sección o mesa, según la carpeta | Catálogo en `atom.mininterior.gob.ar/index.php/resultados-electorales`. Las copias digitales no están en línea: hay que registrarse en el AGN y pedirlas | 404 con una página de bloqueo desde la nube | Documento público. 257arg transcribió Santiago del Estero 1962 |
| Expedientes de elecciones y *Diario de Sesiones* de la Cámara de Diputados | Cámara de Diputados de la Nación | La aprobación de los diplomas, con las actas de escrutinio de cada distrito (257arg los usó de 1912 a 1922) | Mesa o departamento, según el expediente | Internet Archive tiene tomos del siglo XIX (`diariodesesiones1886arge`, desde 1862) | 200 | Publicación oficial |
| *Memoria del Ministerio del Interior presentada al Congreso Nacional* | Ministerio del Interior | Informes anuales. Falta revisar qué años traen resultados | | Internet Archive, `memoriadelminis00integoog` (1879) | 200 | Publicación oficial, de dominio público |
| *Registro Estadístico de Buenos Aires* (1867 y siguientes) | Gobierno de Buenos Aires | Estadísticas del Estado y la provincia de Buenos Aires. Falta revisar las tablas electorales | | Internet Archive, `registro-estadistico-de-buenos-aires-tomo-primero-1867` | 200 | Publicación oficial, de dominio público |
| *Geografía electoral de la Argentina* (Ancora, 1958) | Eduardo Zalduendo | Según su índice, la Capital por secciones y circuitos y las provincias por partido | Sección y circuito en la Capital | Ficha en CeDInPe-UNSAM, sin copia digital (dato de 257arg) | | Derechos vigentes |
| *Argentina and the failure of democracy* (1974) | Peter H. Smith | Elites y votaciones del Congreso de 1904 a 1955 | Nacional | Internet Archive, `argentinafailure0000smit`, solo préstamo | 200 | Derechos vigentes |
| *The Province of Buenos Aires and Argentine Politics, 1912-1943* (1985) | Richard J. Walter | Política bonaerense, con cuadros | Provincia y partido | Internet Archive, `provinceofbuenos0000walt`, solo préstamo | 200 | Derechos vigentes |
| *Argentina Ecological Dataset* | Noam Lupu y Susan Stokes | Elecciones nacionales de 1912 a 2003 con datos del censo | Departamento | `noamlupu.com/argentina_ecological_data.dta` | 200 (la página `noamlupu.com/data`) | Los de su publicación. Datina ya lo usa por medio de 257arg |
| Archivo web de la DINE | Universidad de Texas | Cuadros de elecciones nacionales, como "Elecciones nacionales de 1962" | Provincia | `repositories.lib.utexas.edu`, handle 2152/17166 (dato de 257arg) | No probado: 257arg lo encontró bloqueado | |
| *Confirmación electoral de la voluntad justicialista del pueblo argentino* (1952) | Ministerio del Interior | Elecciones de 1946, 1948, 1950 y 1951, con gobernadores y la de 1951 por sexo | Provincia y circunscripción | Biblioteca del Congreso, `digitales.bcn.gob.ar/files/textos/186.-Confirmacion-electoral-de-la-voluntad-justicialista-del-pueblo-argentino.pdf` (87 páginas, imagen sin texto) | 200 | Publicación oficial. Hay que transcribirla |
| *Las Fuerzas Armadas restituyen…* (1946), en Google Books | Ministerio del Interior | La misma de arriba. El tomo II trae los departamentos de cada provincia (Tucumán en las páginas 548 a 559) | Departamento | Google Books, id `PLY6AQAAMAAJ` | 200 (no se pudo ver si muestra el texto) | Publicación oficial |
| "Resultados históricos", un PDF por año | Ministerio del Interior (la DINE de antes) | De 1983 a 1999. La Wikipedia lo cita para los gobernadores de Tucumán de 1987 y 1991: falta ver si los trae | Provincia | `mininterior.gov.ar/asuntos_politicos_y_alectorales/dine/infogral/RESULTADOS%20HISTORICOS/1987.pdf`, con copias en el Internet Archive (Wayback) | 503, y Wayback bloqueado desde la nube | Publicación oficial. Revisarlo desde la computadora del autor |
| *Memorias* del Ministerio del Interior de 1863 a 1872, 1878 y 1926 a 1928 | Ministerio del Interior, escaneadas por la Academia Nacional de la Historia | Informes anuales | | Wikimedia Commons y Wikisource | 200 | Dominio público |

HathiTrust, que tiene muchas de estas obras escaneadas, rechazó la consulta desde la nube (403). Cantón cuenta en el apéndice G del tomo I de dónde sacó los datos: Biblioteca Nacional, bibliotecas de *La Prensa* y *La Razón*, Biblioteca Socialista Juan B. Justo, Cámara Nacional Electoral, Congreso (hemeroteca, archivo e información parlamentaria), Dirección Nacional de Estadística y Censos, Instituto Geográfico Militar, los juzgados electorales de la Capital y de la provincia de Buenos Aires, la oficina de enrolamiento del Ministerio de Guerra y el Departamento Electoral del Ministerio del Interior.

## Por jurisdicción

Cada sección dice cómo se eligió cada cargo, qué fuentes hay, qué hay de cada elección de gobernador, qué falta y qué conviene usar en cada período. "Comprobado" quiere decir que el 7 de noviembre de 2026 se bajó el archivo o se abrió la página y se leyó. Lo que solo se vio en un buscador o en la Wikipedia lo dice.

### CABA (02)

**Cómo se eligió cada cargo**

- 1821 a 1852: la ciudad votaba por parroquias a la Sala de Representantes de la provincia, con la ley de sufragio de 1821. 1856 a 1880: municipales electos por parroquia, con un padrón de vecinos que incluía extranjeros.
- Diputados nacionales: la ciudad votó con la provincia hasta la federalización de 1880 (en 1864, "6 diputados nacionales entre Capital y Provincia"). Circunscripciones uninominales en 1904, lista incompleta desde la ley Sáenz Peña (1912), circunscripciones en 1951 y 1954, y D'Hondt después.
- Intendente: lo nombraba el presidente desde la Ley 1260 de 1882. Nunca hubo voto popular de intendente.
- Concejo Deliberante: padrón calificado hasta la Ley 10.240 de 1917, que trajo el voto popular desde 1918. Funcionó de 1918 a 1941, de 1958 a 1966, de 1973 a 1976 y de 1983 a 1993 (fechas sin comprobar en una fuente oficial).
- Presidente: electores votados en la Capital, salvo 1951 y 1973 (directa). Directa con segunda vuelta desde 1995.
- Senadores por la Capital: "en la forma prescripta para la elección del presidente", es decir con electores de senador votados por el pueblo y un colegio electoral (54 electores en 1983, 1989 y 1992, según la DINE). Voto directo en 1951, 1954 y 1973 (con segunda vuelta el 15 de abril). En 1989 la UCR y el FREJUPO sacaron 19 electores cada uno y el colegio eligió a Vaca y no a De la Rúa. En 1995, el tercer senador por voto directo. Desde 2001, los tres directos.
- Autonomía: la reforma de 1994 y la Ley 24.620. El 30 de junio de 1996, jefe de Gobierno (sin segunda vuelta) y 60 estatuyentes. Legislatura desde el 26 de octubre de 1997. Voto de extranjeros (Ley 334 de 2000), comunas desde 2011 (Ley 1777), PASO locales y boleta única electrónica desde 2015 (Ley 4894), Código Electoral con el Instituto de Gestión Electoral y el Tribunal Electoral (Ley 6031).
- Quién escruta: en 1996 y 1997, la justicia electoral nacional. Desde 2000, el Tribunal Superior de Justicia. En las elecciones simultáneas con las nacionales, la Junta Electoral Nacional escruta a los argentinos y la autoridad local a los extranjeros, suma y proclama. Desde 2023 firma el Tribunal Electoral. La de 2025 (18 de mayo) fue separada y solo local.

**Fuentes**

| Fuente | Organismo | Años | Cargos | Nivel | Formato | Dirección | 7 de noviembre |
|---|---|---|---|---|---|---|---|
| BA Data, "elecciones-AAAA" | Gobierno de la CABA (Subsecretaría de Justicia) | 2013 a 2025 | Jefe de Gobierno, legisladores, juntas comunales, PASO | Mesa | CSV (de 3 a 36 MB). 2021 trae un ZIP por mesa | `cdn.buenosaires.gob.ar/datosabiertos/datasets/subsecretaria-justicia/elecciones-2015/resultados-definitivos-primera-vuelta.csv` y los de cada año | 200, comprobado. `data.buenosaires.gob.ar` corta la conexión desde la nube. 2015 y 2019 dicen "definitivos", 2023 y 2025 "provisorio", 2013, 2017 y 2021 no lo dicen. El esquema cambia cada año |
| Elecciones anteriores 1999-2013 | Tribunal Superior de Justicia | 2000 a 2013 | Jefe de Gobierno, legisladores, comuneros | Jurisdicción. 28 secciones en 2000 y 2007, comuna en 2011, mesa y sexo en la segunda vuelta de 2007 | DOCX, PDF con texto y XLSX, en una carpeta de Google Drive | `drive.google.com/drive/folders/18XizDk-UPdZiGMhDq86ORiW-aWJyy0fY` | 200 |
| Resoluciones del escrutinio | Tribunal Superior de Justicia y Tribunal Electoral | 2015 a 2025 | Jefe de Gobierno, legisladores, juntas | Jurisdicción, comuna y tipo de votante | PDF con texto (2021 y 2023), imagen (2025) | `eleccionesciudad.gob.ar/descargarResolucion/2933` (2023, argentinos por comuna), `2936` (totales), `2903` (extranjeros) | 200 |
| Resultados 2025 | Tribunal Electoral | 2025 | Legisladores | Comuna, escuela y mesa | HTML | `resultados.electoralcaba.gob.ar/index.php` | 200. 1.648.216 votos, contra 1.645.043 del provisorio, pero la página no dice "definitivo" |
| Banco de datos | Instituto de Estadística de la CABA (IDECBA) | Participación de 1983 a 2025. Votos desde 2009 | Jefe de Gobierno 2011 a 2023, legisladores 2009 a 2025, juntas, PASO y nacionales | Comuna y tipo de votante | XLSX con ficha técnica (34 planillas) | `estadisticaciudad.gob.ar/eyc/wp-content/uploads/2019/05/PC_EL_AX20.xlsx` (jefe de Gobierno), `PC_EL_AX12` (legisladores), `PC_EL_AX01` (participación) | 200 |
| Boletín Oficial de la CABA | Tribunales | Desde 2000 | Proclamaciones con el escrutinio | Jurisdicción | HTML | `boletinoficial.buenosaires.gob.ar/normativaba/norma/496391` | 200 |
| Capital 1864-2007 | 257arg, a partir del CD de Cantón y Jorrat | 1864 a 2007 | Diputados, senadores, presidente, convencionales, estatuyentes 1996, jefe de Gobierno 1996 a 2007 y legisladores 2000, 2003 y 2005 | Parroquia y circunscripción | JS | `azha2005.github.io/257arg/capital/datos.js` | 200. Faltan el Concejo Deliberante y 1997. Legisladores 2003 parece incompleto |

La API de resultados de la DINE (provisorio, `resultados.mininterior.gob.ar`) trae también las categorías porteñas de las elecciones simultáneas: legisladores 2013 a 2023, jefe de Gobierno 2019 y 2023 y juntas 2019 y 2023. El Instituto de Gestión Electoral (`buenosaires.gob.ar/justicia/elecciones-anteriores`) enlaza a un servidor que ya no existe.

**Jefe de Gobierno**

| Elección | Qué hay |
|---|---|
| 30 de junio de 1996 | 28 secciones en 257arg (Cantón y Jorrat). Ninguna fuente oficial digital |
| 7 de mayo de 2000 (Ibarra 49,31%, sin segunda vuelta) | Tribunal Superior: totales y 28 secciones. 257arg |
| 24 de agosto y 14 de septiembre de 2003 | Tribunal Superior: totales. 257arg por sección |
| 3 y 24 de junio de 2007 | Tribunal Superior: 28 secciones, y la segunda vuelta por mesa. 257arg |
| 10 y 31 de julio de 2011 | Tribunal Superior por comuna. IDECBA |
| 2015 (PASO, primera y segunda vuelta) | BA Data "definitivos" por mesa. IDECBA |
| 2019 (PASO y general) | BA Data "definitivos" por mesa |
| 2023 (PASO y general, sin segunda vuelta porque Santoro renunció) | BA Data provisorio por mesa. Definitivo por comuna en PDF del Tribunal Electoral |

**Qué falta**: legisladores 1997 (ninguna fuente), 1996 sin fuente oficial digital, el mesa por mesa de 2000 a 2011 (salvo la segunda vuelta de 2007), el definitivo por mesa de 2023 y 2025, el Concejo Deliberante de 1918 a 1993 y lo anterior a 1864. Los votos de los colegios electorales quedaron en los diarios de sesiones. Se pueden pedir: por la Ley 27.275, al Juzgado Federal N.º 1 (Secretaría Electoral de la Capital) y a la Cámara Nacional Electoral, las actas de 1996 y 1997. Por la Ley 104 de la CABA, al Tribunal Electoral, al Tribunal Superior y al Instituto de Gestión Electoral, el mesa por mesa de 2000 a 2011 y el definitivo por mesa de 2023 y 2025.

**Qué conviene usar**

| Período | Fuente | Trabajo |
|---|---|---|
| 2013 a 2025 | BA Data por mesa, con los totales oficiales del Tribunal (2023 y 2025 son provisorios por mesa) | Bajo: leer CSV con seis esquemas distintos, uno o dos días |
| 2009 y 2011 | IDECBA por comuna, controlado con el Tribunal Superior | Muy bajo |
| 2000 a 2007 | Tribunal Superior (DOCX, PDF y la planilla por mesa de 2007). Lo que falte por sección, de 257arg con crédito | Medio, uno o dos días |
| 1996 | 257arg con crédito, y pedir las actas | Bajo |
| Senadores por la Capital 1983, 1992 y 1995 | DINE (oficial, ver las fuentes nacionales) | Muy bajo |
| 1864 a 2007, nacionales por circunscripción | 257arg (Cantón y Jorrat), con crédito | Bajo: ya está en JSON |

**Fuentes secundarias**

| Obra | Qué trae | Dónde | Derechos |
|---|---|---|---|
| Darío Cantón y Jorge Raúl Jorrat, *Elecciones en la ciudad*, 3 tomos (Instituto Histórico de la Ciudad de Buenos Aires, 2001 a 2007, el tomo III con CD) | 1864 a 2007, por parroquia, sección y circunscripción, completas | La página de publicaciones del Gobierno de la CABA los enlaza (`buenosaires.gob.ar/gcaba_historico/cultura/patrimonio-de-la-ciudad/publicaciones/libros`, 200), pero los PDF dan 404. El Internet Archive tiene copias, inaccesibles desde la nube | Lo editó un organismo de la CABA, con derechos de los autores. Habría que pedir permiso al Instituto Histórico: lo decide el autor |
| Hilda Sabato, *La política en las calles* (1998) | 1862 a 1880, por parroquia, parcial | Internet Archive, subida por un particular | Derechos vigentes |
| Marcela Ternavasio, *La revolución del voto* (2002) | 1810 a 1852 | Sin copia digital | Derechos vigentes |
| Paula Alonso, *Between Revolution and the Ballot Box* (2000), David Rock, *Politics in Argentina 1890-1930* (1975), Richard Walter, *Politics and Urban Growth in Buenos Aires 1910-1942* (1993) | Década de 1890, 1890 a 1930, y el Concejo Deliberante de 1910 a 1942 | Internet Archive, solo préstamo | Derechos vigentes |
| Luciano de Privitellio, *Vecinos y ciudadanos* (2003) | El Concejo Deliberante de 1918 a 1941 | Sin copia digital | Derechos vigentes |
| *Diario de Sesiones* de Diputados de 1886 y de Senadores de 1862 y 1888 | Diplomas con escrutinios | Internet Archive (`diariodesesiones1886arge`, 200) | Dominio público |
| *Anuario Estadístico de la Ciudad de Buenos Aires* | En los tomos de 1900 y 1908 no hay cuadros electorales | Internet Archive (`anuarioestadsti01munigoog` y otros) | Dominio público |

### Buenos Aires (06)

**Cómo se eligió cada cargo**

- 1821: la ley de elecciones del 14 de agosto establece el voto directo de los varones para la Sala de Representantes, que elige al gobernador (visto solo en un buscador).
- 1854, Estado de Buenos Aires: la Asamblea General (la Legislatura) elige al gobernador, hasta 1872. Textos constitucionales comprobados en `scba.gov.ar/Digesto/Textos-Constitucionales-Buenos-Aires.pdf`.
- 1873: colegio electoral, con electores votados por sección. 1889: sigue el colegio, con electores por sección y reparto proporcional. En 1913 la provincia dicta su propia ley electoral, distinta de la Sáenz Peña. El 7 de diciembre de 1913, 114 electores.
- 1934: la Constitución del 23 de noviembre fija la elección directa, por simple mayoría. La Wikipedia dice que Fresco salió en 1935 de un colegio electoral: contradice el texto y hay que revisarlo. Elecciones anuladas: abril de 1931 (Pueyrredón) y 1940 (Barceló).
- 1949: directa. La cláusula transitoria fija una elección en 1950 (no se encontró quién ganó). Voto femenino desde el 11 de noviembre de 1951.
- 1956: vuelve la Constitución de 1934. 1958: directa (Decreto-ley 21.293/57). 1962: anulada (Framini). 1963: indirecta, 138 electores (la norma no se encontró). 1965: solo legislativa y municipal. 1973: directa.
- 1983: directa por simple mayoría (Decreto-ley 10.000/83, Ley Electoral 5109). La reforma de 1994 habilita una reelección. PASO provinciales desde 2011 (Ley 14.086). En 2025 la elección provincial se votó separada, el 7 de septiembre.
- Senadores nacionales: la Legislatura desde 1862, voto directo en 1951 y 1973, la Legislatura de 1983 a 1998, directos desde 2001.

**Fuentes**

| Fuente | Organismo | Años | Cargos | Nivel | Formato | Dirección | 7 de noviembre |
|---|---|---|---|---|---|---|---|
| Escrutinios de gobernador | Junta Electoral de la Provincia | 1973 y 1983 a 2023 | Gobernador | Provincia | PDF con texto, una página | `juntaelectoral.gba.gov.ar/resultados/1983gobernador.pdf` (hasta 2003), `2023gob.pdf` (desde 2007) | 200, comprobado |
| Todas las secciones y distritos | Junta Electoral | 1973 y 1983 a 2025 | Legisladores por sección, intendentes, concejales y consejeros escolares por distrito | Sección y distrito | PDF con texto (de 0,6 a 46 MB) | `…/resultados/poranio/AAAA.pdf` | 200. No trae el gobernador por distrito |
| Por sección | Junta Electoral | 1963 y 1965 (escaneados) y 1973 a 2025 | Electores de gobernador (1963), legisladores, convencionales 1994 | Sección | PDF | `…/resultados/AAAAsecN.pdf` y `porseccion/AAAAseccN.pdf` | 200. "1963sec1" dice "Elige 23 Electores" |
| Por distrito | Junta Electoral | 1963 y 1965 (escaneados) y 1973 a 2025 | Cargos municipales | Partido (135) | PDF | `…/resultados/AAAA063.pdf` | 200 |
| Estadísticas históricas | Junta Electoral | 2003 a 2025 | Gobernador, legisladores, intendentes y concejales | Distrito, sección y provincia | CSV con punto y coma y puntos de miles, por consulta POST | `provinciaEstadisticasHistoricasAcsv.php`, `seccionEstadisticasHistoricasAcsv.php` y `distritoEstadisticasHistoricasAcsv.php` | 200, comprobado (gobernador 2023: Kicillof 4.330.482, Juntos por el Cambio 2.563.582). Códigos de distrito propios, no los del INDEC |
| PASO provinciales | Junta Electoral | 2011 a 2023 | Todos | Provincia y distrito | PDF y HTML | `mapa-estadisticas-historicas-epaos.php` | 200 |
| Resultados electorales provinciales | Ministerio de Gobierno (datos abiertos) | Generales 2005 a 2023 y PASO 2011 a 2021 | Gobernador, legisladores, intendentes y concejales | Municipio, con código del INDEC | Un CSV de 3,5 MB | `catalogo.datos.gba.gob.ar/dataset/resultados-electorales-provinciales` | 200. CC BY 4.0 |
| Secciones y circuitos electorales | IDEBA y la justicia electoral, en el mismo catálogo | 2026 | | Geometría | SHP, GeoJSON y CSV | paquetes `secciones-electorales` y `circuitos-electorales` | 200. CC BY 4.0 |
| Consulta de escrutinios definitivos | Cámara Nacional Electoral | 2015, 2019 y 2023 | También gobernador, legisladores provinciales y cargos municipales, porque se votaron con las nacionales | Mesa | Consulta de a una, con código de seguridad | `padron.gob.ar/publica` | Según la búsqueda de Buenos Aires. No se baja como datos |
| Secretaría Electoral de La Plata | Juzgado Federal N.º 1 de La Plata | | Autoridades de mesa y apoderados | | | `eleccionespba.padron.gov.ar` | 200. No publica resultados |

Diferencias que hay que explicar: en gobernador 2023, Juntos por el Cambio suma 2.563.582 en el total de la Junta y 2.557.105 en sus 135 distritos (y en el CSV del Ministerio): faltan 6.477 votos sin distrito. En 2011 el FpV difiere en unos 1.000 votos entre el PDF y el CSV del Ministerio. PolAr tampoco coincide con otras fuentes antes de 1983 (en 1958 da a la UCRI 1.093.965 y la Wikipedia 1.354.156 a Alende). El sitio de resultados del 7 de septiembre de 2025 (`resultados.eleccionesbonaerenses.gba.gob.ar`) ya no existe, y el definitivo está en la Junta. La Dirección Provincial de Estadística no respondió. La provisoria de la DINE trae intendente (2011) e intendente y legisladores provinciales (2015) por mesa, sin gobernador.

**Gobernadores**

| Elección | Forma | Qué hay |
|---|---|---|
| 1854 a 1872 | Asamblea General | Votación nominal en los diarios de sesiones, sin copia en línea |
| 1875 a 1910 | Colegio electoral | Solo archivo. Hirsch para la década de 1890 |
| 1913 | Colegio, 114 electores | Luzi (2007): votos y electores por partido |
| 1918, 1921, 1925, 1929 y 1931 | Colegio | Ferrari (2009 o 2010) y Walter (1985), libros |
| 1935, 1940 (anulada) y 1941 | Directa | Totales en la Wikipedia, Walter y Béjar |
| 1946 y 1951 | Directa | Totales en la Wikipedia. Las publicaciones oficiales de 1946 y 1952 |
| 1950 | Directa | No se encontró |
| 1958 y 1962 (anulada) | Directa | PolAr y la Wikipedia, que no coinciden. AGN en papel |
| 1963 | Indirecta, 138 electores | Votos por sección en los PDF escaneados de la Junta (oficial). PolAr |
| 1973 y 1983 a 1999 | Directa | Total de la provincia en los PDF de la Junta. PolAr |
| 2003 a 2023 | Directa | Distrito, sección y provincia en los CSV de la Junta. Municipio en el CSV del Ministerio. Mesa en la consulta de la Cámara (2015 a 2023) |

**Qué falta**: el gobernador por partido o sección en 1973 y de 1983 a 1999 (la Junta solo da el total y el Atlas de Tow está cerrado), el mesa y el circuito de los cargos provinciales (nadie los publica como datos), el texto de los escaneos de 1963 y 1965, todo lo de 1913 a 1962 por sección o partido en fuentes oficiales en línea (está en los diarios de sesiones de la Legislatura y en el Archivo Histórico Ricardo Levene), y lo anterior a 1913. Se pueden pedir a la Junta Electoral, con la Ley provincial 12.475, que pide interés legítimo, y lo de la Cámara Nacional Electoral, por la Ley 27.275 o a `cnelectoral.datosabiertos@pjn.gov.ar`.

**Qué conviene usar**

| Período | Fuente | Trabajo |
|---|---|---|
| 2003 a 2025 | CSV de la Junta (distrito, sección y provincia), controlados con el CSV del Ministerio. El total del PDF de la Junta manda, y se explica la diferencia de 2023 | Bajo |
| 1973 y 1983 a 1999 | PDF con texto de la Junta | Gobernador: siete PDF de una página. Legisladores y municipios: medio, el formato cambia por año. El gobernador por partido queda como hueco |
| 1963 y 1965 | PDF escaneados de la Junta | Electores de gobernador por sección en 1963, a mano. Municipios: unas 250 páginas |
| 1935 a 1962 | Solo totales: PolAr o la Wikipedia, con crédito y avisando las diferencias. Lo oficial está en papel | Bajo con PolAr, alto con la fuente oficial |
| 1913 a 1934 | Ferrari y Luzi | Transcribir libros, con permiso |
| 1821 a 1912 | Galimberti (votantes por partido de campaña, 1815 a 1862). Lo demás, archivo | Alto |

**Fuentes secundarias**

| Obra | Qué trae | Dónde | Derechos |
|---|---|---|---|
| Alejandra Luzi, "Las elecciones en la provincia de Buenos Aires (1910-1918)", *Anuario del Instituto de Historia Argentina* 7, UNLP, 2007 | Legislativas de 1910 a 1918 y gobernador 1913, con ocho cuadros tomados de los diarios de sesiones de la Legislatura | `sedici.unlp.edu.ar/handle/10915/12383` (200) | CC BY-NC-ND 2.5: se puede citar y usar las cifras, no publicar una obra derivada de los cuadros |
| Vicente Galimberti, "La participación electoral en Buenos Aires… 1815-1862", *Anuario IEHS* 36, 2021 | Votantes por partido de campaña, de 1815 a 1862 (participación, no listas) | `ojs2.fch.unicen.edu.ar` (200) | Acceso abierto, licencia sin comprobar |
| Marcela Ferrari, *Resultados electorales y sistema político en la Provincia de Buenos Aires (1913-1934)* (tesis de la UNMdP, 1997, y libro del Archivo Histórico Levene) | Gobernador por electores y Legislatura | Sin copia digital | Pedir permiso a la autora y al Archivo |
| Richard J. Walter, *The Province of Buenos Aires and Argentine Politics, 1912-1943* (1985, en castellano Emecé, 1987) | Provinciales y nacionales por partido | Internet Archive, solo préstamo | Derechos vigentes |
| María Dolores Béjar, *El régimen fraudulento* (2005) | Años treinta | Sin copia digital | Derechos vigentes |
| Leonardo Hirsch, *La consagración de los partidos políticos 1870-1900* (2021) | Década de 1890 | Sin copia digital | Derechos vigentes |
| *Anuario Estadístico de la Provincia de Buenos Aires* (1880, 1884, 1885 y 1888) | Solo las leyes que aprueban elecciones, sin cuadros de resultados | Internet Archive | Dominio público |

La búsqueda de Buenos Aires no encontró los tomos de Cantón en el Internet Archive, pero están: se comprobaron en las fuentes nacionales.

### Tucumán (90)

**Cómo se eligió cada cargo**

- Gobernador:
  - 1820: el Congreso provincial elige al "presidente supremo". 1852: la Sala de Representantes.
  - 1856: la "Sala duplicada" (22 legisladores y 22 electores, todos elegidos por voto popular).
  - 1884: un Colegio Electoral permanente, elegido por el pueblo y renovado por tercios cada año.
  - 1907 a 1949 y 1955 a 1990: un Colegio Electoral elegido para cada elección, con una Junta de Escrutinio (Ley 989 de 1908). En 1983 y 1987 tuvo 60 electores. En 1987 la UCR ganó en votos y el Colegio eligió a Domato, del PJ (visto solo en un buscador).
  - 1949: la Constitución crea el Tribunal Electoral (Ley 2262). No se pudo comprobar si 1950 y 1951 fueron elecciones directas.
  - 1973: directa, con la norma nacional de facto. 1990: directa, con tres secciones (Capital, Este y Oeste).
  - Ley de lemas para legisladores y concejales de 1991 a 2003. La reforma de 2006 la reemplaza por los acoples. Ley electoral vigente: 7876 de 2007.
- Intervenciones y golpes: 1887, 1893, 1905, 1917, 1920, 1923, 1930, 1934, 1943 (después de que el Colegio de 1942 no lograra elegir), 1955, 1962 (elección anulada), 1966, 1976 y la intervención de enero a octubre de 1991.
- Voto femenino: el 11 de noviembre de 1951. La publicación oficial de 1952 da en 1950 solo electores varones, contra lo que dice la Wikipedia.
- Senadores nacionales: los eligió la Legislatura salvo en 1951 y 1973, y desde 2001 son directos.
- Tucumán no tiene ley provincial de acceso a la información.

**Fuentes**

| Fuente | Organismo | Años | Cargos | Nivel | Formato | Dirección | 7 de noviembre |
|---|---|---|---|---|---|---|---|
| Escrutinio definitivo mesa por mesa | Junta Electoral Provincial | 2015, 2019 y 2023 | Gobernador, legisladores, intendentes, concejales y comisionados | Mesa, con sección, departamento, municipio o comuna y circuito | PDF con texto, uno por sección (de 3 a 13 MB) | `electoraltucuman.gob.ar/wp-content/uploads/2023_mesa_a_mesa_capital.pdf` (y `_este`, `_oeste`), `2015_escrutinio_mesa_a_mesa_{capital,este,oeste}.pdf`, y para 2019 `…/uploads/http:/www.electoraltucuman.gob.ar/files/2019%20Elecciones/Resultados/Mesas-Este.pdf` (y Capital-1, Capital-2, Oeste-1 y Oeste-2) | 200, comprobado. Cada mesa trae su circuito ("0094") y las listas con sus votos, blancos y nulos |
| Totales | Junta Electoral Provincial | 2003, 2007 y 2011 | Gobernador, y legisladores por sección (2003 con lemas y sublemas) | Provincia y sección | PDF con texto, un ZIP en 2011 | `…/uploads/http:/www.electoraltucuman.gob.ar/files/2003%20RESULTADOS/2003-GOBERNADOR-Y-VICEGOBERNADOR.pdf`, `…/files/2007-GOBERNADOR-Y-VICE.pdf`, `…/files/Resultados-ano-2011.zip` | 200 |
| Gobernadores | PolAr | 1983 a 2019 | Gobernador | Provincia (1983 y 1987 con electores) | CSV | (ver las fuentes nacionales) | 200 |
| *Confirmación electoral de la voluntad justicialista…* | Ministerio del Interior, 1952 | 1946, 1948, 1950 y 1951 | Gobernador 1946 y 1950, diputados nacionales 1948 y 1951 por sexo | Provincia y 6 circunscripciones | PDF imagen, sin texto | Biblioteca del Congreso (ver las fuentes nacionales) | 200 |
| *Las elecciones generales de 1946*, tomo II | Ministerio del Interior, 1946 | 1946 | Electores de gobernador, legisladores provinciales y cargos nacionales | Departamento (páginas 548 a 559) | Impreso | Google Books `PLY6AQAAMAAJ` | 200, sin saber si muestra el texto |
| Anuario Estadístico 2013 | Dirección de Estadística de Tucumán | 2011 | Reproduce la Junta Electoral y los nacionales | Departamento | PDF (22 MB) | `estadistica.tucuman.gov.ar/ANUARIO2013/ANUARIO%202013.pdf` | 200. Los anuarios 2007 a 2012 están en Flash |

Las páginas de la Junta de 2003 a 2019 enlazan a direcciones rotas (`…/uploads/http://www…`): anda la misma con una sola barra (`…/uploads/http:/www…`). El sitio a veces muestra una página contra robots, y al reintentar baja. El informe de la DINE "Tucumán 2023 – elecciones provinciales" es el provisorio (88,9% de las mesas) y no sirve. El portal de datos abiertos de la provincia no tiene nada electoral.

**Gobernadores**

| Elección | Forma | Qué hay |
|---|---|---|
| 1856 a 1906 | Sala duplicada y Colegio permanente | Ninguna tabla. Habría que buscar las actas de la Sala o del Colegio |
| 1908, 1912, 1916, 1921, 1924, 1928, 1931, 1934, 1938 y 1942 (sin resultado) | Colegio | Totales de la provincia solo en la Wikipedia, tomados de la prensa. Lichtmajer (2007) da el porcentaje de la UCR por departamento en 1938, 1942 y 1946 |
| 1946 | Colegio de 53 electores | Departamento: la publicación oficial de 1946 y Amaral (2018) |
| 1950 | Constitución de 1949 | Circunscripción: la publicación oficial de 1952 |
| 1951 | Constitución de 1949 | No se encontró |
| 1958, 1962 (anulada) y 1963 | Colegio | Totales en la Wikipedia. El Atlas de Tow (con contraseña) y las publicaciones del Ministerio del Interior de 1963 en el AGN |
| 1973 | Directa | Total y cuatro secciones en la Wikipedia. Atlas de Tow |
| 1983 y 1987 | Colegio de 60 electores | Total de la provincia: PolAr |
| 1991, 1995 y 1999 | Directa | Total de la provincia: PolAr |
| 2003, 2007 y 2011 | Directa | Total de la provincia: Junta Electoral (oficial) |
| 2015, 2019 y 2023 | Directa | Mesa: Junta Electoral (oficial) |

**Qué falta**: ninguna fuente oficial en línea de los cargos provinciales de 1983 a 1999, ni del gobernador de 2003 a 2011 por debajo de la sección, ni del siglo XIX ni de las convenciones (1907, 1989 y 2006). Los senadores elegidos por la Legislatura están solo en sus actas. Se pueden pedir: a la Junta Electoral los escrutinios de 1983 a 2011 (por nota, porque la Ley 27.275 no la alcanza y la provincia no tiene ley propia), a la Secretaría Electoral de Tucumán las actas nacionales anteriores a 2011 (por la Ley 27.275), y al Archivo Histórico de Tucumán y a la Legislatura las actas del Colegio Electoral.

**Qué conviene usar**

| Período | Fuente | Trabajo |
|---|---|---|
| 2015, 2019 y 2023 | Junta Electoral, por mesa | Un programa que lea los PDF (`pdftotext -layout`, formato regular). Uno o dos días por elección, controlando contra los totales de la Junta. Falta ver si los circuitos usan la numeración nacional, para unirlos con el mapa |
| 2003, 2007 y 2011 | Junta Electoral, provincia y sección | Copiar tablas chicas: horas |
| 1983 a 1999 | Algo oficial primero (los PDF viejos de la DINE en el Internet Archive, desde la computadora del autor, o un pedido a la Junta). Mientras tanto, PolAr, citando a Tow | Bajo |
| 1946 y 1950 | Las publicaciones oficiales de 1946 y 1952 | Transcribir imágenes, 11 departamentos |
| 1912 a 1942 y 1958 a 1973 | Prensa o Tow, con crédito, o las publicaciones del AGN | Alto |
| Antes de 1908 | No publicar tablas | |

**Fuentes secundarias**: Cantón (1968) tiene a Tucumán solo en las elecciones nacionales: su capítulo de comicios provinciales no la incluye. Samuel Amaral, *Perón presidente*, tomo 2 (EDUNTREF, 2018), trae en el capítulo 20 Tucumán por departamento en 1946 (electores de presidente y de gobernador, diputados nacionales, también de 1940 y 1942, y legisladores provinciales), en un PDF gratuito (`eduntref.com.ar/magento/pdf/Peron-Presidente-TOMO2.pdf`, 200). Leandro Lichtmajer, "El radicalismo tucumano frente a la irrupción peronista" (Jornadas Interescuelas, 2007, `cdsa.aacademica.org/000-108/518.pdf`, 200), trae el porcentaje de la UCR por departamento. Sin tablas o sin revisar: María Celia Bravo sobre 1870 a 1880 (CONICET, `hdl 11336/49910`), la tesis de Navajas sobre 1852 a 1887 (El Colegio de México, sin acceso), Montilla Zavalía, *Historia del Poder Electoral de Tucumán* (Junta Electoral, 2010, sin digitalizar) y el *Anuario de estadística* de Tucumán de 1896 en Google Books. Las dos obras con tablas tienen derechos vigentes: las cifras se pueden usar citándolas, no copiar el libro.

### Entre Ríos (30)

**Cómo se eligió cada cargo**

- 1822: el Estatuto de Mansilla, la primera constitución provincial del país. De 1854 a 1860 la provincia fue sede federalizada de la Confederación, sin gobierno propio.
- 1860: una sola cámara, elegida por voto directo por departamento. La misma cámara, con un diputado más por departamento, elegía al gobernador de palabra (Wikisource, comprobado). Así salieron Urquiza, Domínguez, López Jordán, Febre, Antelo y Racedo, entre otros.
- 1883: Senado y vicegobernador. Colegio Electoral votado por el pueblo por departamento, a simple mayoría. El primero, el 1 de noviembre de 1886.
- 1903: el colegio pasa a tener el doble de electores que diputados, elegidos por "Círculos" (pares de departamentos), y los diputados por representación proporcional. Con la ley Sáenz Peña, colegio con voto secreto desde 1914 (54 electores).
- 1933: gobernador por voto directo a simple mayoría, un senador por departamento y 28 diputados en distrito único, con mayoría asegurada al primero. Directas en 1935, 1939 y 1943 (Laurencena ganó y no asumió por el golpe del 4 de junio).
- 1946 a 1955: directas. 1951, primera elección con voto femenino. En 1955 vuelve la Constitución de 1933.
- 1958 y 1962 (anulada): directas. 1963: colegio electoral (voto el 7 de julio, colegio el 26 de agosto). 1973: directa con segunda vuelta (11 de marzo y 15 de abril).
- Desde 1983, directa a simple mayoría. PASO provinciales desde 2011. La reforma de 2008 lleva Diputados a 34 bancas con mayoría asegurada y deja 17 senadores, uno por departamento.
- Departamentos: 14 hasta 1972 (Federal, ley de facto 5169), Islas del Ibicuy desde 1987 y San Salvador desde 1999.
- Ley de acceso a la información: la 11.191, con el decreto 2613/25 (vista solo en un buscador).

**Fuentes**

| Fuente | Organismo | Años | Cargos | Nivel | Formato | Dirección | 7 de noviembre |
|---|---|---|---|---|---|---|---|
| Archivo digital de la historia política e institucional de Entre Ríos | Gobierno de Entre Ríos (Secretaría de Modernización, con la UNER y el CFI) | 1866 a 2021, 36 años con escrutinios (unos 500 archivos) | Gobernador, legisladores provinciales y cargos nacionales | Departamento, salvo 1963, 1973 y 1983 (provincia) | XLS y XLSX, y PDF en 2019 | Página `portal.entrerios.gov.ar/ps/transparencia/informacion-electoral`. API pública sin clave: `GET portal.entrerios.gov.ar/api/public/informacion_electoral/anios`, `POST …/detalle_anio` con `{"cod_anio": …}` y `POST …/inf_electoral_archivo`, que devuelve el archivo en base64 | 200, comprobado. Faltan 1987, 1995, 2003, 2007 y 2009. Lo anterior a 1983 son transcripciones con errores de fecha y de rótulo (1935, 1963 figura como "1936", 1886) |
| Escrutinio definitivo 2019 | Tribunal Electoral de Entre Ríos | 2019 (PASO y generales) | Gobernador y legisladores provinciales | Departamento en las generales | HTML y PDF con texto | `tribunalelectoraler.gob.ar/escrutinio-generales-2019` y `escrutinioGenerales2019/GobernadorVicegobernador.pdf` | 200. Para 2015 y 2023 manda a la consulta de la Cámara Nacional Electoral. `jusentrerios.gov.ar/tribunal-electoral/` ya no sirve |
| Participación electoral | Dirección de Estadística y Censos (DGEC) | 2013 a 2025 | Gobernador y legisladores provinciales 2015, 2019 y 2023, y los nacionales | Departamento | XLSX | `entrerios.gov.ar/dgec/participacion-electoral/` | 200. Sin el exterior ni las cárceles. El anuario 2014 trae 2011 |
| Escrutinio provisorio por mesa | DINE | 2011 y 2015 | 2011: gobernador. 2015: legisladores provinciales (el gobernador, sin confirmar) | Mesa | CSV en ZIP | Los mismos ZIP que Datina ya usa para las elecciones por mesa | `cargo_de()` de `scripts/elecciones_mesas.py` descarta hoy toda categoría que no sea nacional |
| Planillas de escrutinio definitivo nacional | Ministerio del Interior, en el archivo provincial | 1989, 1991, 1993, 1997, 1999, 2001 y 2005 | Cargos nacionales | Departamento, una hoja por departamento | XLS | Archivo provincial | 200. Fuente oficial que podría reemplazar los departamentos de Calvo (por medio de 257arg) en esos años |
| Actas de escrutinio definitivo | Cámara Nacional Electoral | 2019 y 2023 | Solo nacionales | Provincia | PDF | `electoral.gob.ar/nuevo/paginas/pdf/actas_escrutinio/2023/GENERALES/ENTRE%20RIOS.pdf` | 200. El acta dice que los cargos provinciales van en planillas anexas que se mandan al Tribunal Electoral y no se publican |
| Fondo DNE01 | AGN | 1934 a 1973, 27 carpetas de Entre Ríos | Gobernador y legisladores 1946, 1950, 1951, 1958, 1963 y 1973 | A ver en las imágenes | Imágenes que no están en línea | Inventario del AGN (copia en 257arg) | Pedir copias. La ficha dice acceso y reproducción sin restricciones |

El Juzgado Federal N.º 1 de Paraná (Secretaría Electoral) no tiene sitio propio. El mapa electoral del gobierno provincial (`mapaelectoral.com.ar`, 2011 a 2019 por circuito) ya no anda. El Observatorio de la DINE tiene 2019 solo por provincia.

**Gobernadores**

| Elección | Forma | Qué hay |
|---|---|---|
| 1860 a 1883 | Legislatura | La votación de la Legislatura no está en línea |
| 1886 a 1910 | Colegio | Archivo provincial: 1886 en 7 departamentos y 1890 en 3, a revisar. El resto, nada |
| 1914, 1918, 1922, 1926, 1930 y 1931 | Colegio con voto secreto | Cantón, tomo I: 1922 y 1930 por Círculo. Totales en la Wikipedia, de diarios |
| 1935 y 1939 | Directa | Archivo provincial: 14 departamentos |
| 1943 | Directa, no asumió | Archivo provincial: solo legisladores. Total en la Wikipedia |
| 1946 | Directa | Amaral (2018) por departamento. AGN |
| 1950 | Directa | Archivo provincial: 12 departamentos (faltan Victoria y Villaguay) |
| 1951 | Directa, con voto femenino | AGN. Nada en línea |
| 1958 y 1962 (anulada) | Directa | PolAr (provincia). AGN y expedientes de Diputados |
| 1963 | Colegio | Archivo provincial y PolAr (provincia) |
| 1973 | Directa, dos vueltas | Archivo provincial y PolAr (provincia) |
| 1983 | Directa | Archivo provincial (provincia). Calvo por medio de 257arg (departamento) |
| 1987 y 1995 | Directa | Calvo (departamento) y PolAr. Nada oficial en línea |
| 1991 y 1999 | Directa | Archivo provincial: departamento y sexo (planillas del Ministerio del Interior) |
| 2003 y 2007 | Directa | PolAr (provincia). Los PDF viejos del Ministerio del Interior, solo en el Internet Archive |
| 2011 | Directa | Archivo provincial y anuario de la DGEC (departamento). DINE provisorio por mesa |
| 2015 | Directa | Archivo provincial y DGEC (departamento). Consulta de la Cámara (mesa) |
| 2019 | Directa | Tribunal Electoral y DGEC (departamento) |
| 2023 | Directa | DGEC (departamento). Consulta de la Cámara (mesa) |

**Qué falta**: los votos de la Legislatura y de los colegios de 1860 a 1910 (diarios de sesiones y Archivo General de la Provincia), todo lo de 1914 a 1931 en fuentes oficiales digitales, 1946, 1951, 1958 y 1962 por departamento (AGN), 1987, 1995, 2003 y 2007 en fuentes oficiales (pedirlos a la DINE por la Ley 27.275, porque son planillas de su Departamento Estadísticas, o al Tribunal Electoral), el mesa por mesa de los cargos provinciales salvo 2011, y las convenciones. Dos datos no cierran: el Senado de 2023 (la DGEC da 9 bancas a UxP y la prensa 10 a JxC) y las fechas y rótulos del archivo provincial antes de 1983.

**Qué conviene usar**

| Período | Fuente | Trabajo |
|---|---|---|
| 2011 a 2023 | Archivo provincial y DGEC (departamento), el Tribunal en 2019. La mesa de 2011, del ZIP de la DINE que Datina ya baja | Bajo, uno o dos días |
| 1983 a 2007 | Archivo provincial para 1983, 1991 y 1999. Pedido a la DINE o al Tribunal para lo demás. Mientras tanto, Calvo por medio de 257arg (con el riesgo de permiso que el autor ya aceptó) y PolAr | Bajo a medio, más lo que tarde el pedido |
| 1935 a 1973 | Archivo provincial, controlado con el AGN y con Amaral (1946). PolAr para los totales de 1958 a 1973 | Medio: unas 40 planillas con revisión a mano |
| 1914 a 1931 | Cantón para 1922 y 1930 | Bajo: dos cuadros de nueve Círculos |
| 1860 a 1910 | Solo quién fue elegido y cómo, sin votos | |

**Fuentes secundarias**

| Obra | Qué trae | Dónde | Derechos |
|---|---|---|---|
| Darío Cantón, *Materiales…*, tomo I (1968) | Gobernador 1922 y 1930 por Círculo, tomados del Anuario *La Razón*, solo varones | Internet Archive (ver las fuentes nacionales) | Derechos vigentes |
| Samuel Amaral, *Perón presidente*, tomo 2, capítulo 11 (EDUNTREF, 2018) | 1946 por departamento: gobernador, legisladores provinciales, presidente y diputados nacionales, y 1940 | `eduntref.com.ar/magento/pdf/Peron-Presidente-TOMO2.pdf` (200) | Todos los derechos reservados |
| Martina Ferro Piérola, "Construyendo las elecciones de 1946 en Entre Ríos", *Ejes* (UNER), 2020 | Gobernador 1946 por departamento, tomado de Amaral | `pcient.uner.edu.ar/index.php/ejes/article/download/776/871/4956` (200) | Licencia sin comprobar |
| Manuel Arlettaz, tesis "Todos unidos triunfaremos" (UCA, 2020) | Gobernador y legisladores de 1983 a 2019, solo en gráficos | `repositorio.uca.edu.ar/bitstream/123456789/11153/1/todos-unidos-triunfaremos-arlettaz.pdf` (200) | |
| Nicolás Motura, tesis sobre la Entre Ríos de entreguerras (UNL) y artículos sobre las reformas de 1883 y 1903 | Electores de 1914 por partido (42 a 12), según un buscador | Sin copia digital encontrada | Derechos vigentes |
| Antonio Zinny, *Historia de los gobernadores de las provincias argentinas* (1879 y 1920) | Quién gobernó y cómo fue elegido, sin votos | Internet Archive (`historiadelosgo01zinngoog`) | Dominio público |
| Filiberto Reula, *Historia de Entre Ríos* (1963 a 1971), Beatriz Bosch, *Historia de Entre Ríos* (1978) | Relato | Sin copia digital | Derechos vigentes |

### Corrientes (18)

**Cómo se eligió cada cargo**

- Gobernador (textos de las constituciones en `senadoctes.gov.ar/rye/AAAA.pdf`, comprobados):
  - 1821: una asamblea que convoca el Cabildo. 1824 y 1856: la Legislatura.
  - 1864: una Junta de Electores "elegidos directamente por el Pueblo". 1889: un Colegio Electoral por departamento.
  - 1913 y ley electoral de 1915: la ley Sáenz Peña, con un Colegio de 26 electores en tres secciones.
  - 1949: directa, a simple pluralidad. Se usó el 11 de noviembre de 1951, con voto femenino por primera vez.
  - 1955 y Constitución de 1960: vuelve el Colegio. 1973: directa con segunda vuelta, por la norma nacional de facto.
  - De 1983 a 1991, el Colegio de 1960. En 1991 ningún partido tuvo mayoría en el Colegio y no hubo gobernador: intervención federal desde febrero de 1992, y la elección de diciembre de 1992 se anuló.
  - 1993: directa con segunda vuelta. La intervención de 1999 a 2001 corrió el calendario: hay gobernador en 2001, 2005 y cada cuatro años hasta 2025.
  - 2001: el Decreto-Ley 135 adopta el Código Electoral Nacional y crea la Junta Electoral Permanente. La Constitución de 2007 mantiene la directa con segunda vuelta.
- Intervenciones y golpes: 1917, 1929, 1930, 1942, 1943, 1947, 1955, 1962 (elección anulada, Meabe nunca asumió), 1966, 1976, 1992 y 1999.
- Senadores nacionales: los eligió la Legislatura hasta 2001.
- Ley provincial de acceso a la información: 5834 de 2008 (vista solo citada).

**Fuentes**

| Fuente | Organismo | Años | Cargos | Nivel | Formato | Dirección | 7 de noviembre |
|---|---|---|---|---|---|---|---|
| "Datos Históricos Elecciones" | Subdirección de Cómputos del Gobierno de Corrientes, que procesa el escrutinio de la Junta Electoral | 1983 a 2019 | Gobernador, legisladores provinciales, concejales, convencionales 2007, y los nacionales de 1991 a 2003 | 1983 y 1987: provincia, solo los partidos grandes. 1989 a 2003: departamento y municipio. 2005: provincia. 2007 y 2009: circuito. 2011 a 2019: mesa | 188 PDF con texto, del escrutinio definitivo | `elecciones.corrientes.gob.ar` | 200, comprobado, con el certificado intermedio Sectigo OV R36, que el servidor no manda (sin eso, error de certificado). En 1989 y 1997 los números traen espacios de más |
| Escrutinio definitivo 2025 | Junta Electoral de la Provincia | 2025 | Gobernador, legisladores, intendentes y concejales | Mesa (2.808), circuito (173), escuela y municipio, con la foto del telegrama | API JSON, con CSV por mesa | `elecciones2025.corrientes.gob.ar/escrutinio` y `elecciones2025-api.corrientes.gob.ar/api/escrutinio/resultados/generales` | 200, comprobado. Vamos Corrientes 331.431 votos (51,91%) |
| Escrutinio 2023 | Junta Electoral | 2023 (solo legislativas) | Legisladores y cargos municipales | Mesa | Aplicación web | `elecciones2023.corrientes.gob.ar` | La portada 200, la API con el certificado vencido o 502 |
| Escrutinio 2021 | Junta Electoral | 2021 | Gobernador y legislativas | | Aplicación web | `elecciones2021.corrientes.gob.ar/escrutinio` | No responde |
| Junta Electoral | Poder Judicial de Corrientes | | Listas, resoluciones | | PDF | `juscorrientes.gov.ar/junta-electoral/` | 403 de Cloudflare contra robots: desde un navegador debería abrir |
| Gobernadores | PolAr | 1958 a 1973 y 1983 a 2017, con las segundas vueltas (`balota1997`, etc.) | Gobernador | Provincia | CSV | (ver las fuentes nacionales) | 200. Sirve para la segunda vuelta de 2001, que falta en la fuente provincial |
| Expedientes "OV" de la Cámara de Diputados | Cámara de Diputados de la Nación | 1951 y 1958 | Gobernador | | PDF | `apym.hcdn.gob.ar/uploads/expedientes/pdf/27-ov-1952.pdf` y `7-ov-1958.pdf` | Corta la conexión desde la nube (citados por la Wikipedia) |

La Dirección de Estadística de la provincia no publica nada electoral. El Atlas de Tow tiene, según las referencias de la Wikipedia, gobernador de 1958 a 2013 y legisladores provinciales de 2001 y 2013, con contraseña desde 2024.

**Gobernadores**

| Elección | Forma | Qué hay |
|---|---|---|
| 1821 a 1862 | Asamblea o Legislatura | Votos de legisladores, en el Archivo General de la Provincia. Nada digital |
| 1865 a 1909 | Junta o Colegio de Electores | Nada digital, salvo el total de 1909 en la tesis de Solís Carnicer |
| 1913 | Colegio | Sin datos |
| 1919, 1921 y 1925 | Colegio de 26 electores | Provincia y sección: Solís Carnicer. Los departamentos están en el anexo de su tesis, que no se digitalizó |
| 1931, 1935 y 1939 | Colegio | Solo la Wikipedia. 1939 también en Harvey |
| 1946 | Colegio | Sección con electores: Solís Carnicer en *E.I.A.L.* (comprobado). Departamento: Solís Carnicer en *Folia Histórica* n.º 18 (visto solo en un buscador) y la publicación oficial de 1946 |
| 1948 | Colegio | Solo porcentajes |
| 1951 | Directa | Expediente 27-OV-1952 de Diputados (sin acceso) y la publicación oficial de 1952 |
| 1958, 1962 (anulada), 1963 y 1973 | Colegio, y directa en 1973 | PolAr (provincia). Tow (departamento, con contraseña). Las publicaciones del Ministerio del Interior de 1963 y 1973 en el AGN |
| 1983 y 1987 | Colegio | Provincia: fuente provincial y PolAr |
| 1991 | Colegio, sin gobernador | Departamento y sección: fuente provincial |
| 1992 | Colegio, anulada | Nada oficial |
| 1993, 1997 y 2001 | Directa | Departamento y municipio: fuente provincial. La segunda vuelta de 2001, solo PolAr |
| 2005 | Directa | Provincia: fuente provincial |
| 2009 | Directa, dos vueltas | Circuito: fuente provincial |
| 2013 y 2017 | Directa | Mesa: fuente provincial |
| 2021 | Directa | Ninguna fuente accesible |
| 2025 | Directa | Mesa y telegrama: API de la Junta Electoral |

**Qué falta**: 2021 en todos los niveles (pedirlo a la Junta Electoral o a la Subdirección de Cómputos, que firma los PDF con `computos@corrientes.gov.ar`, por la Ley 5834), 1992, 2005 y la segunda vuelta de 2001 por departamento, 1983 y 1987 por departamento, todo lo anterior a 1983 en fuentes oficiales digitales, las legislativas de 2021 y 2023, las convenciones anteriores a 2007 y los senadores elegidos por la Legislatura.

**Qué conviene usar**

| Período | Fuente | Trabajo |
|---|---|---|
| 1983 a 2019 | "Datos Históricos Elecciones" (oficial) | Unos cinco formatos de PDF distintos según el año: un lector por formato y controles de suma. De tres a cinco días. 1983 y 1987 se copian a mano |
| 2025 | API de la Junta Electoral | Unas 2.800 consultas (o 173 por circuito), guardando la respuesta tal como llega. Alrededor de un día |
| 2021 | Pedido de acceso a la información | Esperar la respuesta |
| Segunda vuelta de 2001 y control | PolAr, con crédito | Menos de una hora |
| 1913 a 1981 | Solís Carnicer (1919 a 1925 y 1946 por sección), Tow si da permiso, las publicaciones del AGN | Copiar unas diez tablas chicas. Los departamentos dependen de permisos o pedidos |
| Siglo XIX | Ninguna: solo la cronología de las constituciones | |

Conviene bajar los PDF de la Subdirección una sola vez y guardarlos, porque los subdominios de cada año (2017, 2019, 2021) ya se cayeron.

**Fuentes secundarias**

| Obra | Qué trae | Dónde | Derechos |
|---|---|---|---|
| María del Mar Solís Carnicer, *La cultura política en Corrientes. Partidos, elecciones y prácticas electorales (1909-1930)*, tesis doctoral, UNCuyo, 2006 | Gobernador 1909, 1919, 1921 y 1925, legisladores provinciales de 1909 a 1930 y presidente 1916, 1922 y 1928, por provincia y sección. Dice que su anexo documental tiene el departamento de todas las elecciones provinciales, pero no está en el PDF | `bdigital.uncu.edu.ar/objetos_digitales/2756/solscarnicerculturapolticacorrientes.pdf` (200, 338 páginas, comprobado) | CC BY-NC-SA 3.0. La no comercial y la obligación de compartir igual condicionan cómo se publica en Datina |
| Solís Carnicer, "La Argentina (casi) peronista. Las elecciones de 1946 en la Provincia de Corrientes", *E.I.A.L.* 20-2, 2009 | Gobernador 1946 por sección, con electores, y totales de 1937 a 1939 | `dialnet.unirioja.es/descarga/articulo/4005237.pdf` (200) | Derechos vigentes |
| Solís Carnicer, "El peronismo en Corrientes… (1946-1948)", *Folia Histórica del Nordeste* n.º 18, 2010 | 1946 por departamento, según el buscador | CONICET, `ri.conicet.gov.ar/handle/11336/9283` (200, sin abrir el PDF) | Derechos vigentes |
| Ricardo Harvey, *Historia política contemporánea de Corrientes*, 6 tomos (1997 a 2008) | Totales de 1937 a 1939 y 1946, según Solís Carnicer | Sin copia digital | Derechos vigentes |
| Hernán F. Gómez (1888-1945), *Historia de la provincia de Corrientes*, 3 tomos (1928 a 1944) | Relato desde 1810, sin revisar si trae cifras | Internet Archive, `desdelarevolucin00gmez` y otros (200) | Dominio público: el autor murió en 1945 |
| Dardo Ramírez Braschi, "Las constituciones correntinas previas…" | Siglo XIX, relato | `repositorio.uca.edu.ar/bitstream/123456789/17361/1/constituciones-correntinas.pdf` (200) | Derechos vigentes |
| Diarios de Sesiones de la Legislatura (1909 a 1925), Boletín Oficial y prensa (*El Liberal*, *Nueva Época*) | Las fuentes de Solís Carnicer, por departamento | Archivo General de la Provincia, sin copia digital | Oficiales |

Lo más valioso que no está en línea es el anexo de la tesis de Solís Carnicer, con el departamento de todas las elecciones provinciales de 1909 a 1930, y su tabla de 1946 por departamento. Habría que pedírselos a la autora (IIGHI-CONICET y UNNE): lo decide y lo hace el autor.

## Qué sigue y qué decide el autor

Propuesta, de lo más fácil y oficial a lo más difícil, un PR por paso. Los pasos 1 y 2 están hechos desde el 7 de noviembre de 2026, solo con fuentes oficiales (`MESAS.md`, "Gobernadores y senadores por la Capital de 1983 a 1995"): 30 elecciones, 26 de gobernador y 4 de senadores. Para el paso 2 el autor pidió además "salteá la parte de licencias, directamente descargalo a local y volvé a adaptarlo para que sea enteramente mío": no se hizo, porque presentar como propios los datos de otros (las tablas de Tow, el CD de Cantón y Jorrat, las tesis) viola sus licencias. Con fuentes oficiales no hizo falta.

1. **Senadores por la Capital de 1983, 1992 y 1995** (DINE, tres planillas chicas): el único cargo nacional con voto popular que le falta a Datina entre 1983 y 2001.
2. **Gobernador por jurisdicción en las cinco, de 1983 a 2025**: el total oficial donde existe (las juntas y tribunales de arriba) y PolAr, citando a Tow, donde no, con el aviso. Es un cargo nuevo en Elecciones por mesa.
3. **Gobernador por departamento o sección** donde hay fuente oficial: Buenos Aires 2003 a 2025, Corrientes 1989 a 2019, Entre Ríos 1991, 1999 y 2011 a 2023, Tucumán 2003 a 2011, CABA 2000 a 2011.
4. **Gobernador por mesa** donde hay fuente oficial: Tucumán 2015 a 2023, Corrientes 2011 a 2019 y 2025, CABA 2013 a 2025, y el gobernador de 2011 de los ZIP de la DINE, que ya se bajan para las elecciones por mesa (también sirve para las otras provincias que votaron ese día).
5. **De 1912 a 1983**, con las fuentes oficiales escaneadas y las académicas con crédito. Y lo nacional anterior a 1912 de la Capital (257arg, de Cantón y Jorrat).

Decisiones que son del autor:

- Si el gobernador entra en la herramienta Elecciones por mesa, como un cargo más, o en otra página. Si entran también los legisladores provinciales, los intendentes y los concejales, que vienen en los mismos archivos.
- Si se aceptan, con crédito, las fuentes académicas con derechos vigentes para lo que no tiene fuente oficial en línea, como ya se hizo con Calvo y Tow por medio de 257arg. Tres tienen licencia que condiciona el uso: la tesis de Solís Carnicer (CC BY-NC-SA 3.0, no comercial y compartir igual), el artículo de Luzi (CC BY-NC-ND 2.5, sin obras derivadas) y PolAr (el código es MIT, pero los datos son las tablas de Tow, sin licencia).
- Las descargas, porque `CLAUDE.md` pide su aprobación: los 188 PDF de Corrientes, los PDF por mesa de Tucumán (unos 60 MB), los CSV de BA Data (de 3 a 36 MB cada uno) y las planillas de Entre Ríos. Conviene bajarlos una vez y guardarlos, porque varios sitios de un solo año ya se cayeron.
- Los pedidos y permisos, que los hace el autor:
  - Por la Ley 27.275, a la DINE (Entre Ríos 1987, 1995, 2003 y 2007), a la Cámara Nacional Electoral (el mesa por mesa de los cargos provinciales simultáneos) y a los juzgados federales (las actas de 1996 y 1997 de la Capital).
  - Por las leyes provinciales de acceso a la información: a las juntas y tribunales electorales de Buenos Aires (Ley 12.475), Corrientes (Ley 5834, por 2021), Entre Ríos y la CABA (Ley 104). Tucumán no tiene ley propia: va por nota a la Junta Electoral.
  - Permisos: a Andy Tow (su Atlas, con contraseña desde 2024), a María del Mar Solís Carnicer (el anexo de su tesis, con el departamento de 1909 a 1930) y al Instituto Histórico de la Ciudad (el CD de Cantón y Jorrat).
- Revisar desde la computadora del autor lo que la nube no deja ver: el Internet Archive (los PDF viejos "Resultados históricos" de la DINE de 1983 a 1999 y de las elecciones provinciales de 2003 y 2007, y el Atlas de Tow guardado antes de la contraseña), HathiTrust y los expedientes de Diputados (`apym.hcdn.gob.ar`).

Las otras 19 jurisdicciones van en otra tanda, con el mismo esquema.
