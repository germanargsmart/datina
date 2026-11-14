# Rutas comerciales de las exportaciones (pedido del autor, 14 de noviembre de 2026)

Pedido: "una sección de rutas comerciales que simulen de dónde salen los productos que exporta la Argentina y visualicen en un mapa hasta qué parte del mundo llegan en los barcos según producto y destino". Queda para después de las fuentes nuevas del 14 de noviembre de 2026.

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
