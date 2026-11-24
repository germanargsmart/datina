# Rutas comerciales de las exportaciones (pedido del autor, 14 de noviembre de 2026)

Pedido: "una sección de rutas comerciales que simulen de dónde salen los productos que exporta la Argentina y visualicen en un mapa hasta qué parte del mundo llegan en los barcos según producto y destino". Queda para después de las fuentes nuevas del 14 de noviembre de 2026.

## Decisiones del autor (15 de noviembre de 2026)

- Va como **herramienta**, con página propia en el menú Herramientas, como Elecciones por mesa.
- Se puede instalar `searoute` para calcular los caminos por mar (una sola vez, fuera del repositorio: en Python 3.13 de Debian no compila con el `setuptools` del sistema, y anda en un entorno aparte, `python -m venv`, con `setuptools` al día). Probada el 15 de noviembre de 2026: de Rosario a Rotterdam da 12.074 km.

## Qué producto va a qué país: la API del INDEC (15 de noviembre de 2026)

- El zip público (`exponm25.csv`) trae la posición NCM de 8 dígitos, pero el país viene con el código numérico de la Aduana (203 Brasil, 212 Estados Unidos, 310 China), que el INDEC no publica en una tabla, y el secreto estadístico esconde partes distintas que en la API. Emparejar los códigos por los totales de cada país no da exacto: se descartó.
- La API del INDEC tiene la misma tabla con el subrubro (50 grupos de productos, con nombre en `comercio_exterior_nomenclaturas`) y el país con su código ISO. Desde el 15 de noviembre de 2026 `indec_api.py` la pide sumada por año, subrubro y país, desde 2015 (`indec_api_comercio_exterior_exportacion_bienes_anio_subrubro_pais.json`). Los productos de la página son esos subrubros: "Semillas y frutos oleaginosos" (soja), "Residuos y desperdicios de la industria alimentaria" (harina de soja), "Grasas y aceites", "Cereales", "Carnes y sus preparados", "Petróleo crudo", "Material de transporte terrestre", "Piedras, metales preciosos" (oro), "Minerales metalíferos" y "Productos químicos" (con el litio). Lo confidencial va aparte, como en las fichas de socios comerciales.
- La provincia de origen sigue siendo la del OPEX (provincia y gran rubro, mes a mes, en el mismo zip público). Cruzar provincia con producto y destino es la parte simulada.

## Fuentes (probadas el 14 de noviembre de 2026 desde la sesión en la nube)

- **Exportaciones por producto y país de destino**: `https://comex.indec.gob.ar/files/zips/exports_AAAA_M.zip` (INDEC, unos 4 MB por año). `exponm25.csv` trae año, mes, posición NCM de 8 dígitos, país de destino (código `Pdes`), kilos y dólares FOB. Las celdas protegidas por el secreto estadístico vienen como "s": se cuentan aparte y el texto lo dice.
- **Exportaciones por provincia de origen y rubro, mes a mes**: `Serie_Opex_Mensual_2002_2025.xlsx`, en el mismo zip (Origen Provincial de las Exportaciones). Provincia, región, rubro (PP, MOA, MOI, CyE), dólares y kilos.
- **El recorrido por mar**: la biblioteca `searoute` (1.6.0, en PyPI) calcula el camino más corto entre dos puertos sobre la red marítima de Eurostat (MARNET). Se correría una sola vez y se guardaría el resultado, como los demás programas que guardan en `datos/manual/`.

## Lo que no hay y por eso se simula

- El INDEC no publica una tabla que cruce provincia de origen con país de destino ni el puerto por el que sale cada carga. La sección tiene que decir que el camino es una simulación: de la provincia al puerto más probable según el rubro (por ejemplo, los granos y aceites del núcleo agrícola por el Gran Rosario, el petróleo y el gas por Bahía Blanca o la Patagonia) y de ahí al puerto principal del país de destino por la ruta marítima más corta.
- La tabla de "qué rubro sale por qué puerto" se arma a mano con su fuente (anuarios de los puertos o del Ministerio de Transporte) y va en `datos/manual/`, con su fecha en `relaciones.json`.
- Lo que no viaja en barco (camión a Chile y Brasil, ductos, avión) se separa y se muestra como tal, sin dibujarlo sobre el mar.

## Idea de la página

- Mapa del mundo con las líneas de los barcos, más gruesas cuanto más dólares llevan. Se elige un producto (los capítulos NCM más grandes: soja y derivados, maíz, trigo, carne, petróleo, autos, oro, litio) y se ve a qué países llega y desde qué provincias sale.
- Al lado, la tabla con los mismos números ("Ver tabla") y los CSV descargables.
- "Qué no dice este dato": el puerto y el camino son simulados, el país de destino es el declarado en la aduana (no siempre el de consumo) y las celdas en secreto estadístico no se reparten.

## Antes de empezar

- Decidir con el autor el lugar en el menú (¿una herramienta, como Elecciones por mesa, o una ficha más en Economía?).
- Medir el peso: las líneas del mapa se dibujan una vez y se guardan simplificadas para que la página no pase de lo que ya bajan las herramientas grandes.

## La tabla de salidas por subrubro (23 de noviembre de 2026)

`datos/manual/rutas_salidas.csv`: para cada uno de los 48 subrubros (sin "Confidencial" ni "Desconocido"), la salida principal y, si la hay, una segunda (un puerto, "Camión a ...", "Ducto a ...", "Línea a ...", "Ezeiza (avión)"), con sus fuentes (códigos de `datos/manual/rutas_fuentes.csv`: título, organismo o medio, fecha y dirección) y qué tan firme es cada fila: 11 con dato oficial, 9 con nota de prensa, 11 inferidas (en general, "Buenos Aires" porque concentra más del 62% de los contenedores del país, según la Administración General de Puertos) y 17 suposiciones. Ninguna fuente da el reparto por puerto en valor para cada subrubro: es la salida principal declarada o la que surge del producto. En la herramienta, las filas inferidas o supuestas se tienen que ver distintas de las que tienen fuente.

Lo que no tiene fuente oficial: qué parte de lo que va a los países limítrofes viaja en camión (la Aduana lo tendría por vía y aduana de salida, pero no lo publica). Las fuentes del vino (2014) y de las frutas (2017) son viejas. En "Productos químicos" conviven el litio, el biodiésel y los fertilizantes, y en "Metales comunes" el aluminio y el acero: con una sola salida principal se pierde mucho.

`searoute` 1.6.0 en un entorno aparte (`python -m venv`, con `setuptools` al día): de Rosario a Rotterdam, 12.084 km.

Falta: el archivo de la API del INDEC por año, subrubro y país, que llega con la primera actualización con el pedido (la del 23 de noviembre de 2026), el puerto principal de cada país de destino y el diseño de la página, que se muestra al autor antes de armarla.

## Los destinos y los recorridos por mar (23 de noviembre de 2026)

- **Qué destinos importan**: con las exportaciones por año, rubro y país que ya bajaba el sitio, 40 países suman el 95% de lo exportado en 2026. El segundo "destino" es "Indeterminado (Continente)", 9.572 millones de dólares (12,4%): carga sin país declarado al salir (por ejemplo, granos vendidos a órdenes). Va aparte, sin línea. Suiza (puesto 9) es casi todo oro, que viaja en avión. Paraguay y Bolivia no tienen salida al mar.
- **`datos/manual/rutas_destinos.csv`**: el puerto de llegada de cada uno de esos 40 países, con su UN/LOCODE, el criterio, la cifra y la fuente (34 con fuente, Argelia y Venezuela como suposición, Suiza, Paraguay y Bolivia sin mar), y el paso de frontera de los limítrofes (Paso de los Libres–Uruguaiana, Cristo Redentor, Gualeguaychú–Fray Bentos, Clorinda–Puerto Falcón y Salvador Mazza–Yacuiba). Criterio: el puerto con más carga del país, sin las terminales de un solo producto (petróleo o mineral). Por eso Santos y no la terminal de hierro de Ponta da Madeira, Yeda y no Yanbu, Ambarlı y no Aliağa, Génova y no Trieste, Guayaquil y no Balao, Melbourne y no Port Hedland. En Vietnam, Indonesia, Malasia, Tailandia y Filipinas no hay toneladas por puerto y va el de más contenedores.
- **`scripts/rutas_mar.py`** (con searoute, en su propio entorno) calcula una vez el camino por mar de cada uno de los 12 puertos argentinos de salida a cada destino y lo guarda en **`datos/manual/rutas_mar.json`**: 444 recorridos, con los kilómetros (del Gran Rosario a Ningbo, 21.005 km) y la línea simplificada y con un punto cada 4 grados como mucho, para que el mapa no la dibuje como un arco hacia los polos (287 KB). Dos reglas de la simulación, porque el camino más corto por la red no es siempre el que hacen los barcos que salen de la Argentina: sin el Canal de Panamá (de Bahía Blanca a Houston la red daba Magallanes y Panamá, apenas más corto que subir por el Atlántico) y hacia Asia y Oceanía (al este de los 60 grados) por el sur de África, como los graneleros, y no cruzando el Pacífico. Con eso ninguna línea corta el borde del mapa.

Falta: los datos por subrubro y país del INDEC (con la actualización del 23 de noviembre de 2026) y el diseño de la página, que se muestra al autor antes de armarla.

## La página (23 de noviembre de 2026, diseño aprobado por el autor ese día)

`rutas.html`, en Herramientas, entre Elecciones por mesa y el Catálogo. El autor aprobó el boceto: el mapa con los caminos (más gruesos cuanto más dinero), los cinco rubros (Todo, Primarios, Agroindustria, Industria y Energía), los diez primeros destinos con su porcentaje y su camino, los limítrofes por tierra con línea de guiones y, aparte, lo que sale sin país. En el celular los rubros van en dos filas. Además del boceto: "Producto", para elegir un subrubro, y "Ver tabla" con todos los destinos.

- **02** (`02_procesar.py`, después del comercio por rubro): con `indec_api_comercio_exterior_exportacion_bienes_anio_subrubro_pais.json`, lo exportado en el último año completo (`CMR_ANIO`, el mismo de la ficha de socios por rubro) por subrubro y país. Controla que sume, país por país, lo mismo que la tabla por rubro, y que lo que no tiene salida en `rutas_salidas.csv` no pase de lo confidencial. Escribe `sitio/datos/rutas_exportaciones.csv` aparte de las tablas de las fichas (no va en `fichas.js`) y `resumen.externo.rutas`. Sin el archivo de la API no escribe nada, y 03 frena: la página necesita la tabla.
- **El modo de cada fila**: avión si la salida es un aeropuerto, tierra si es un ducto o una línea eléctrica, tierra a Chile, Uruguay, Paraguay y Bolivia y a Brasil las manufacturas de origen industrial (camiones), y mar lo demás. Sin modo, sin camino: los países fuera de los 40 de la tabla de destinos, lo que va por barco a un país sin puerto (Suiza), los vehículos que salen por sus propios medios, lo confidencial y lo que no tiene país.
- **03** llama a `scripts/rutas_sitio.py`, que une la tabla con `rutas_mar.json` y escribe `sitio/datos/rutas.json` (las filas y solo las líneas que se usan, unos 170 KB). Por tierra la línea va de la salida al paso de frontera y de ahí al destino, y en avión, de Ezeiza al destino. Las ubicaciones de los pasos, del aeropuerto y de los destinos sin puerto (Suiza, Paraguay y Bolivia) están en `rutas_sitio.py`.
- **`scripts/rutas.js`**, aparte de `datina.js` como `mesas.js`: la lista, la frase, la tabla y el mapa (D3 con el mapa del mundo de la portada, `datos/mundo-110m.json`). Sin D3 o sin el mapa del mundo quedan la lista y la tabla.
- Ícono: el barco (`buque`), el mismo de Sector externo.

## Mapa interactivo y años (pedido del autor del 24 de noviembre de 2026)

"Que el mapa pueda ser interactivo, que haya un zoom, que las rutas de cada uno sean de un color distinto para identificarlos, apoyarse en cada línea para ver el dato y un filtro por año desde que haya datos".

- **Años:** 02 arma la tabla de cada año completo desde 2015, el primero que baja la API por subrubro (`RUT_ANIOS`), con los mismos controles en cada año contra la tabla por rubro. `rutas_exportaciones.csv` suma la columna `anio`. `rutas_sitio.py` guarda cada camino una sola vez y, por año, cuánto pasó por cada uno (unos 470 KB sin comprimir para once años). La página tiene un control deslizante "Año". Las salidas y los puertos son los de hoy en todos los años, y la página lo dice, junto con el salto de lo confidencial en 2018.
- **Zoom:** botones (acercar, alejar y "Todo"), dos dedos o Ctrl y la rueda, como en Elecciones por mesa. Las líneas no engordan al acercar.
- **Colores:** uno para cada uno de los diez primeros destinos de lo elegido, el mismo en la lista y en sus caminos (`--rt-c1` a `--rt-c10` en `datina.css`, sin violeta, verde ni rojo). Los demás destinos, en gris celeste.
- **El dato de cada camino:** al pasar el mouse o tocarlo, el cuadro del sitio (`#tip`) dice el país, el camino, cuánto pasó por ahí en el año, qué parte es de lo elegido y sus productos principales. Con el teclado, la lista y "Ver tabla" tienen los mismos datos.

