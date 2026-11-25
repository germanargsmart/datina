# Mudanzas y población (pedido del autor, 25 de noviembre de 2026)

Pedido: hacer para la Argentina el estudio "¿Dónde gana y dónde pierde gente Guadalajara?" (documento de Google del 21 de noviembre de 2026), sobre migración, con informes y tablas "como rutas comerciales de lindo".

## Decisiones del autor (25 de noviembre de 2026)

- Las dos cosas, por etapas y en la misma página: las mudanzas entre jurisdicciones, y después el cambio de población por departamento y las viviendas sin personas.
- Herramienta propia en el menú Herramientas, como Rutas comerciales. El artículo `a-migracion-interna` y la ficha `f-migracion-interna` quedan (miden el lugar de nacimiento, que es otra cosa) y se enlazan con esto.
- Descarga aprobada: los cuadros chicos del Censo 2022 de censo.gob.ar (73 archivos, 3,5 MB). La base por radio censal no: es pesada, y los archivos de 2010 por radio de datos.gob.ar dan 404.
- Falta: que apruebe el diseño (maqueta) y el nombre. "Mudanzas y población" y `mudanzas.html` son provisorios.

## Datos

`scripts/censo_2022_mudanzas.py` (una sola vez) guarda en `datos/manual/`:

- `censo2022_mudanzas_matriz.csv`: el cuadro 15 de migraciones del total del país. Personas de 5 años y más en viviendas particulares, por la jurisdicción donde vivían cinco años antes y donde viven. Suma por fila y por columna.
- `censo2022_mudanzas_departamentos.csv`: la población de 2010 y 2022 (cuadro 1 de cada provincia, da los totales oficiales 40.117.096 y 45.892.285) y dónde vivían en 2017 (cuadro 4). Lezama y Tolhuin se crearon entre los censos.

Las viviendas sin personas y su motivo salen de `censo2022_departamentos.csv`, que ya estaba.

## Lo que hay que saber de la fuente

- "Provincia ignorada" son 314.077 personas que vivían en otra provincia y no dijeron cuál: el 29,5% de las que cambiaron de jurisdicción (7,6% en La Pampa, 51,1% en Tucumán). Lo confirma el cuadro 4: su "otra provincia argentina" es la suma de las otras 23 y de la ignorada, en las 24.
- El saldo sale solo de quienes dijeron su provincia. El de Buenos Aires da +5.196. La nota de la CEPAL encontrada en la búsqueda del 25 de noviembre de 2026 habla de algo más de 5 mil (no se abrió la nota).
- Prueba de robustez: repartiendo a quienes no lo dijeron, en cada destino, como a los demás, el saldo cambia de signo en siete jurisdicciones: Chubut, Corrientes, Jujuy, La Pampa, Santa Fe, Tierra del Fuego y Tucumán. Van con trama y el texto dice que no se puede decir si ganan o pierden. Córdoba, Río Negro, Neuquén, San Luis, Buenos Aires, Entre Ríos, Mendoza, La Rioja y San Juan quedan a favor en las dos cuentas (La Rioja y San Juan, por muy poco).
- No hay tabla de origen y destino entre departamentos: solo cuántos llegaron de otra provincia.
- Valcheta (Río Negro) baja de 7.101 a 4.319 (39,2% menos). Es lo que publica el INDEC, y el RENAPER tiene 5.114 personas en 2026, también muy por debajo de 2010. Las listas van desde 10.000 habitantes, así que no encabeza ninguna.
- El Censo 2010 fue de hecho y el de 2022, de derecho: el cambio de población no es del todo comparable.
- Del documento mexicano no se puede repetir: las viviendas deshabitadas de 2010 por departamento (sin fuente confirmada), la encuesta de 2025 y las zonas chicas. A cambio, el censo argentino dice por qué no había personas en cada vivienda.

## Maqueta

`docs/roadmap/maqueta-mudanzas/`: `seccion.html` (el marcado), `mudanzas.css` y `maqueta.py`, que las pone en una copia de `sitio/rutas.html` (`python scripts/mudanzas_sitio.py` y después `python docs/roadmap/maqueta-mudanzas/maqueta.py docs/roadmap/maqueta-mudanzas`). El código de la página, `scripts/mudanzas.js`, y los datos, `scripts/mudanzas_sitio.py`, son los definitivos. Se borra al integrarla.

La rama `claude/migracion` parte de `claude/rutas-mapa`, porque usa sus tarjetas, su ficha y sus controles: sale después de ella.

## Falta para publicar

1. Que el autor apruebe la maqueta.
2. Pasar el marcado a `plantilla.html` (años y "tres de cada diez" con `{{ruta}}`) y el CSS a `datina.css`.
3. 02: las tres tablas y las variables por provincia en la tabla larga (`agregar()`), con su unidad en `pruebas_datos.py`. 03: llamar a `mudanzas_sitio.armar()`, copiar `mudanzas.js`, caché, `MENUS`, ícono, imagen al compartir.
   Los colores escritos en `mudanzas.js` pasan a `:root`. En `mudanzas_departamentos.csv`, Lezama y Chascomús, y Tolhuin y Río Grande, repiten `cambio_personas`, que es el de los dos juntos: sumar la columna los cuenta dos veces, así que hay que dejarlo en uno solo.
4. `relaciones.json`, `catalogo.json`, `peso_paginas.json` y las pruebas de páginas, de fallas y de 320 píxeles.
5. Enlazar con `f-migracion-interna` y `a-migracion-interna`.
