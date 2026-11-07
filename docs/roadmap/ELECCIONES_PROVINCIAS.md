# Elecciones de cada jurisdicción desde la primera

Pedido del autor del 7 de noviembre de 2026, con el enlace a `azha2005.github.io/257arg/capital/` (104 elecciones porteñas de 1864 a 2007 por parroquia y circunscripción): "profundicemos el trabajo electoral. Para eso vas a buscar todas las provincias que tengan votación desde su primera votación en las páginas electorales, ya sea el Poder Judicial Nacional, el Poder Judicial de la Provincia. Arrancá mapeando la Ciudad de Buenos Aires, Provincia de Buenos Aires, Tucumán, Entre Ríos, Corrientes, las fundacionales, y que tengan registro de las elecciones, todas las elecciones, ya sea a gobernador, a presidente y a diputados nacionales, senadores nacionales".

Este documento es el mapa: qué elecciones hubo en cada jurisdicción, quién publica sus resultados, hasta qué nivel (jurisdicción, sección o departamento, circuito, mesa), en qué formato y con qué permiso. No suma nada al sitio todavía: lo que se sume sale de acá, con la decisión del autor. Las otras 19 jurisdicciones siguen el mismo esquema, en otra tanda.

Revisado el 7 de noviembre de 2026 desde la nube. Cada dirección dice qué contestó ese día. Un 403 o un corte de conexión desde la nube no quiere decir que la página no exista: varios organismos rechazan las conexiones que no vienen de la Argentina.

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
| Escrutinio por mesa | Cámara Nacional Electoral | Judicial nacional | 2011 a 2025 | Cargos nacionales | Mesa | Consulta de a una, con código de seguridad | `padron.gob.ar/publica` | (ver `MESAS.md`) | No se baja como datos |
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
| Corrientes | 1958, 1962, 1963, 1973, 1983, 1987, 1991, 1993, 1997, 2001, 2005, 2009 y 2017 (faltan 2013 y 2021) |

La Dirección Nacional Electoral no publica ningún resultado de gobernador: las elecciones provinciales las organiza y escruta cada provincia, con su junta o tribunal electoral, aunque se voten el mismo día que las nacionales.
