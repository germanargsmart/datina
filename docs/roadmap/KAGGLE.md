# Datos de la Argentina en Kaggle (pedido del autor del 15 de noviembre de 2026, para después)

Pedido: "Buscá datasets de Argentina en Kaggle, para después". Búsqueda del 15 de noviembre de 2026 desde la sesión en la nube. La API de Kaggle pide la clave de una cuenta, así que se buscó en la web (`site:kaggle.com`). No se bajó ningún archivo: falta revisar en cada uno la licencia, la fecha y de dónde sale.

## Criterio

Kaggle es un lugar donde cualquiera sube tablas: casi todo lo que hay de la Argentina es una copia de una fuente oficial, a veces vieja, sin decir cuál ni con qué licencia. La regla de Datina es una fuente principal por indicador, la nacional (`CLAUDE.md`, "Reglas de datos"): Kaggle sirve para descubrir qué existe, y lo que se use se baja del organismo que lo publica. Se usa una tabla de Kaggle solo si no hay otra fuente y su licencia lo permite (Datina publica con CC BY 4.0: una licencia "NC", no comercial, no sirve).

## Lo que puede servir

| Tema | Dataset en Kaggle | Qué trae | Para Datina |
|---|---|---|---|
| Vivienda (pendiente: el autor tiene que decidir lo de Apify y Zonaprop) | [Properati Argentina Dataset](https://www.kaggle.com/datasets/alejandroczernikier/properati-argentina-dataset), [2 millones de avisos de venta](https://www.kaggle.com/datasets/msorondo/argentina-venta-de-propiedades), [Properati 2020 a 2021](https://www.kaggle.com/datasets/jluza92/argentina-properati-listings-dataset-20202021), [Properati 2013](https://www.kaggle.com/datasets/tomasaccini/propiedadesproperati) | Avisos de venta y alquiler de todo el país, con provincia, ciudad, barrio, coordenadas, precio, moneda, superficie y ambientes | Lo más útil de la búsqueda: precio del metro cuadrado por provincia, sin pagar a Apify. Son avisos (precio pedido, no de venta), sin limpiar y hasta 2021. Properati publicaba sus avisos como datos abiertos en BigQuery: revisar si sigue y con qué licencia antes de usar las copias |
| Precios en los supermercados | [Precios Claros](https://www.kaggle.com/datasets/tinnqn/precios-claros-precios-de-argentina) | Precios de productos en una sucursal de referencia de cada cadena por provincia, más o menos semana a semana | La fuente original es el SEPA (Sistema Electrónico de Publicidad de Precios Argentinos) de la Secretaría de Comercio: si sigue publicando, bajarlo de ahí. Serviría para comparar lo que cuesta la misma canasta en cada provincia |
| Salarios del sector tecnológico | [Encuesta de sueldos de Sysarmy](https://www.kaggle.com/datasets/aletbm/argentina-salary-survey-sysarmy) | Encuesta a la comunidad de tecnología desde 2014 | Licencia CC BY-NC-SA 4.0 (no comercial): no se puede republicar con la de Datina. La encuesta original la publica Sysarmy: preguntarles o dejarla |
| Siniestros viales de CABA | [Siniestros Viales CABA 2016 a 2021](https://www.kaggle.com/datasets/sebastianrosenblunn/siniestros-vialescaba-2016-2021) | Muertos y heridos en siniestros de tránsito en la Ciudad | Solo CABA y hasta 2021. Datina ya tiene las muertes en el tránsito de las 24 jurisdicciones (SNIC). El original está en `data.buenosaires.gob.ar` |
| Bicicletas públicas de CABA | [EcoBici 2025](https://www.kaggle.com/datasets/agusmolina7/buenos-aires-ecobici-recorridos-realizados-2025) | Unos 3,16 millones de viajes de 2025, con estación de origen y destino | Solo CABA. Podría ir en Curiosidades. El original está en `data.buenosaires.gob.ar` |
| Votaciones de Diputados | [Diputados, actas y votos](https://www.kaggle.com/datasets/arzanico/diputados-actas-y-votos-congreso-de-argentina) | Actas, diputados y cada voto, sacados del sitio de la Cámara | Datina ya las tiene (`congreso_votaciones_*`). Podría servir para completar años si la Cámara sigue cortando la conexión desde la nube |
| COVID-19 | [Covid19arData](https://www.kaggle.com/datasets/vladimirobellini/covid19ardata) | Los partes diarios del Ministerio de Salud, con datos de las provincias | Si algún día se suma la pandemia, el original es el Ministerio de Salud (datos abiertos) |
| Fútbol | [Análisis de la Liga Argentina](https://www.kaggle.com/code/ivanramosctes/analisis-liga-argentina) (un cuaderno, no una tabla) | Partidos y resultados del fútbol argentino | Para Curiosidades. Falta encontrar la tabla y su origen |

## Lo que no sirve

- [Argentina provincial data](https://www.kaggle.com/datasets/kingabzpro/argentina-provincial-data): diez indicadores por provincia sin año ni fuente claros. Datina tiene todos con su fuente.
- [KPI económicos](https://www.kaggle.com/datasets/carlosrearte/kpis-economicos-argentina) y [salarios promedio por provincia](https://www.kaggle.com/datasets/fit4kz/average-salaries-in-argentina): copias del BCRA, del Banco Nación y de datos.gob.ar, ya en Datina y más al día.
- Mapas ([GeoJSON de provincias](https://www.kaggle.com/datasets/pablomgomez21/geojson-file-provincias-argentinas), [argentina-shp](https://www.kaggle.com/datasets/fernandobordi/argentinashp)): Datina usa los del IGN y del INDEC.
- [Códigos de provincias](https://www.kaggle.com/datasets/carlosrearte/codigosprovinciasiso3166-2): Datina usa los códigos del INDEC.
- Los de varios países (inflación mundial, pobreza del Banco Mundial, FAO): son copias del Banco Mundial y de la FAO, que Datina baja directo cuando los necesita.
- Los comerciales de Techsalerator (movilidad, comercio exterior): se pagan y no dicen de dónde salen.
- No apareció nada útil del Censo 2022, la EPH, los delitos de todo el país, el subte ni las elecciones: Datina ya los baja del INDEC, del SNIC y de la DINE.

## Si se retoma

1. Vivienda: decidir con el autor entre las copias de Properati (gratis, hasta 2021) y Apify con Zonaprop (pago, al día). Antes, buscar si Properati sigue publicando en BigQuery y con qué licencia.
2. Precios Claros: buscar el SEPA de la Secretaría de Comercio en `datos.gob.ar` o `datos.produccion.gob.ar`.
3. Para una búsqueda más completa dentro de Kaggle hace falta una cuenta y su clave (`KAGGLE_KEY`): sería un secreto nuevo, que solo agrega el autor.
