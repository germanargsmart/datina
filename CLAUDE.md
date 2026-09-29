# Datina

Números de las 24 Argentinas. Nombre y lema públicos del sitio desde septiembre de 2026, elegidos por el autor (antes "Argentina en datos", que ya usaba otra cuenta, y "Argentina Posta", descartado). La carpeta conserva el nombre viejo. Sitio estático de estadísticas públicas de la Argentina con valor agregado: cada cifra trae qué mide, de qué año es, de dónde sale y su tabla descargable. Inspiración: The Pudding (preguntas antes que datos), Our World in Data (transparencia total), Argendata de Fundar (antecedente local, no duplicarlo). El diferencial es la desagregación subnacional y los cruces laterales entre fuentes.

El autor no programa. Claude Code es el asistente principal: explicar cada cambio en lenguaje simple, ejecutar los scripts y verificar el resultado antes de dar algo por terminado.

## Estructura

```
scripts/01_descargar.py        baja cada fuente tal como la publica el organismo a datos/crudo/
scripts/02_procesar.py         arma datos/ordenado/tabla_larga.csv, sitio/datos/fichas.json y un CSV por ficha
scripts/03_construir_sitio.py  inserta fichas.json en scripts/plantilla.html y escribe sitio/index.html
scripts/plantilla.html         diseño, textos y gráficos (D3 7.8.5 desde cdnjs)
pobreza/                       sitio de consultas de pobreza (Observable Framework, DuckDB en el navegador, datos en Parquet)
sitio/                         lo único que se publica en Netlify
.github/workflows/             actualización automática mensual
```

Correr todo: `python scripts/01_descargar.py && python scripts/02_procesar.py && python scripts/03_construir_sitio.py`
Ver el sitio: `cd sitio && python -m http.server 8000` y abrir http://localhost:8000 (en la computadora del autor el puerto 8000 está ocupado por otro programa, usar 8765)

## Formato de datos

`tabla_larga.csv` tiene siempre las columnas `codigo_indec, territorio, periodo, variable, valor, unidad, fuente`. Toda variable nueva entra por la función `agregar()` de `02_procesar.py`. Códigos de provincia INDEC de dos dígitos ("02" CABA, "06" Buenos Aires, etc.). Código "00" = total país.

Población provincial 2025: se deriva de las tasas del SNIC (cantidad / tasa x 100.000), que usan las proyecciones del INDEC. Si se incorpora una fuente directa del INDEC, reemplazarla.

## Cómo agregar una ficha

1. Sumar la fuente en `FUENTES` de `01_descargar.py`.
2. Procesarla en `02_procesar.py`: agregarla a la tabla larga, crear su tabla en `tablas` y sus cifras clave en `resumen`.
3. En `plantilla.html`: un `<article class="ficha">` con título, `<p class="lead" data-t="...">`, `<div class="grafico" data-g="...">`, nota, fuente y link al CSV. Texto en el objeto `TX`, gráfico en `dibujarTodo()`, pregunta en `IND`.
4. Correr los tres scripts y revisar en escritorio y en celular.

Los textos se generan desde `resumen`, nunca con cifras escritas a mano, así se actualizan solos.

## Reglas de redacción (obligatorias)

- Español rioplatense. Títulos de ficha descriptivos y neutros, con período ("Tasa de suicidios por provincia, 2025"), nunca retóricos ni ingeniosos. Las preguntas van solo en el índice.
- Toda cifra se explica completa: qué mide, unidad, año y población de referencia.
- Usar siempre el dato más reciente disponible.
- No usar punto y coma en ningún texto visible.
- Tono neutro en temas políticos: describir, no adjetivar.

## Reglas de diseño

- Tipografía Roboto Flex con fallback Roboto y Verdana. Nada de serif. Se usa su eje de ancho (`wdth` 25 a 45) para los títulos ultra condensados, y Roboto Mono para etiquetas y datos de estado.
- Lenguaje visual inspirado en hermes-agent.nousresearch.com (septiembre 2026, pedido del autor): portada con bloque azul a sangre (`--azul #2C74B5`), "DATINA" gigante en mayúsculas condensadas, Sol de Mayo dorado con un haz de líneas finas blancas y mapa en líneas blancas; marco fino azul alrededor de la ventana; barra con el menú repartido a los dos lados del logo, azul sobre la portada y clara al bajar; títulos de sección condensados enormes con un mini sol; tarjetas y botones rectos (sin redondeo ni sombra); divisores punteados; etiquetas monoespaciadas en mayúsculas; recuadro de estado tipo terminal en la portada (cantidad de fichas, jurisdicciones y fecha de actualización). Estas reglas reemplazan a las de sombra suave y bordes redondeados.
- Colores de la bandera sobre fondo blanco (decisión del autor, septiembre 2026). Celeste como color principal (`--celeste #74ACDF`, `--celeste-fuerte #2C74B5` para líneas y texto) y el amarillo del Sol de Mayo como segundo color (`--sol #F6B40E` para rellenos, `--sol-fuerte #B27A00` para líneas, `--sol-borde #85340A` para contornos). Nada de azul marino.
- Marca: "DATINA" en mayúsculas con el gorro frigio rojo del escudo (`--rojo #C8102E`) apoyado sobre la I, como sobre la pica del escudo, en la portada y en la barra superior. Lema: "Las 24 Argentinas en números". El favicon es el gorro.
- Sistema provincial: la provincia elegida es el eje del sitio. Un desplegable propio y compacto (sección `#provincias`: botón chico, fuente liviana, panel con buscador y lista en columnas, teclado con flechas, Enter y Escape; es el único lugar para elegir provincia) muestra el perfil de la provincia en todos los indicadores con dato provincial (objeto `INDP`): valor, posición entre las 24, valor del país y una tira con las 24. Se comparte con `?prov=CODIGO` en el enlace. Las tasas de suicidio no entran en el perfil para no presentarlas como ranking.
- Preguntas que rotan de a una, en una franja propia debajo de la portada (objeto `PREG`, respuestas siempre calculadas desde `resumen`), con barra de tiempo, Pausar y Siguiente, y pausa al pasar el mouse o con foco.
- La portada lleva un Sol de Mayo grande y animado (16 rayos rectos y 16 flamígeros generados por código en `plantilla.html`). Los ojos pestañean juntos a intervalos irregulares y la boca se mueve muy despacio. Gira lento, los rayos flamígeros laten, se detiene fuera de pantalla y queda quieto con movimiento reducido.
- Fondo de la portada: mapa del mundo en proyección azimutal equidistante centrada en la Argentina (`sitio/datos/mundo-110m.json`, world-atlas), con anillos de igual distancia. La Argentina y las Islas Malvinas van en celeste. El mapa se ubica en el espacio libre: debajo del texto en pantallas anchas y a la izquierda del sol en el celular.
- Cada ficha es una tarjeta blanca con borde fino y sombra suave (pedido del autor, septiembre 2026): etiqueta de sección, título, cifra destacada (objeto `CLAVE`, siempre generada desde `resumen`), texto, gráfico, nota y pie con fuente, "Copiar enlace" y "Descargar CSV". Las fichas de suicidio no llevan cifra destacada, para no dramatizar.
- Movimiento (criterios de Emil Kowalski y Apple): la tarjeta y su gráfico aparecen una sola vez al entrar en pantalla, con ease-out fuerte `cubic-bezier(.23,1,.32,1)`. Las líneas se trazan, las barras crecen y en los gráficos de antes y después el punto viaja del valor viejo al nuevo. Botones con `scale(.97)` al presionar, hover solo con mouse. Con movimiento reducido no hay desplazamientos, solo fundidos.
- Sin flechas decorativas ni estética de plantilla genérica. Etiquetas directas en las líneas en lugar de leyendas.
- Solo modo claro (todo blanco, pedido del autor). Responsive, foco visible, respeta movimiento reducido.

## Reglas para temas sensibles (suicidio)

- Nunca usar ni mostrar las columnas de modalidad, lugar u hora de la base SAT del SNIC. Solo año, edad y sexo.
- La sección de salud abre siempre con las líneas de ayuda (135 desde CABA y GBA, (011) 5275-1135 desde todo el país, 107 en emergencias).
- Nada de rankings sensacionalistas, juegos de adivinanza ni lenguaje dramático en esa sección.
- Aclarar siempre que el SNIC es un registro policial y que la DEIS (Salud) usa otra metodología.

## Advertencias de fuentes conocidas

- CAMMESA en datos.gob.ar dice estar actualizada pero sus datos terminan en febrero de 2020. Se usa la serie 367.3 de la Secretaría de Energía vía API de Series de Tiempo.
- RENAPER deja sin código a Córdoba, Entre Ríos, Neuquén, Río Negro y Tucumán. Se completan por nombre en `02_procesar.py`.
- DEIS (datos.salud.gob.ar) cambia el nombre del archivo de mortalidad infantil con cada año nuevo ("1990-2024"). `01_descargar.py` busca el CSV vigente en el catálogo del portal con `ckan_csv()`. En provincias con pocos nacimientos la tasa anual salta mucho: la ficha compara promedios de tres años.
- SUBE: la copia en la API de Series de Tiempo quedó detenida en enero de 2026. Se baja directo de archivos-datos.transporte.gob.ar (`total-usuarios-por-dia.csv`, se actualiza a diario). Los archivos de viajes por línea y provincia (`dat-ab-usos-AAAA.csv`) pesan 50 a 65 MB por año y no se guardan en el repositorio. La ficha usa la mediana de los días hábiles de cada mes y solo meses completos.
- No hay una serie descargable del INDEC con población provincial 2025. Se sigue usando la derivada del SNIC.
- Naturaleza. Superficie protegida por provincia: CIAM del Ministerio de Ambiente (`dt_csv.php?dt_id=394`, el año sale del nombre del archivo que informa el servidor, guardado en `ciam_meta.json`). La fuente suma la superficie de cada designación, así que puede haber superposiciones. Historia de las áreas nacionales, superficie y especies: API del SIB (`sib.gob.ar/api/2.0.0/ficha-area-protegida/areas-protegidas`), solo áreas APN. El año es el de creación con la superficie actual, sin ampliaciones. Las especies registradas dependen del esfuerzo de investigación. Las áreas provinciales no tienen superficie completa en el SIB. Visitas a parques nacionales: SINTA, mensual desde 2008, solo por región (no hay datos abiertos por parque).
- Turismo. No existe una serie abierta y larga por provincia: el Padrón Único de Alojamiento (PUNA) fue retirado de los portales, y la Encuesta de Ocupación Hotelera solo tiene siete regiones y termina en noviembre de 2025. Se usan: turistas no residentes (SINTA, mensual desde 2010), viajeros en hoteles por región (EOH, desde 2007) y la Encuesta de Turismo Internacional por provincia visitada (desde 2022, solo quienes salen por Ezeiza y Aeroparque, sesgada hacia CABA y las provincias con vuelos internacionales).
- Visitas por parque nacional: no hay datos abiertos por parque. `datos/manual/visitas_por_parque_2022.csv` se extrajo a mano del Anuario Estadístico de Turismo 2022 (Tabla 5.2, página 178 del PDF de tableros.yvera.tur.ar) y 2019 se calcula con la variación publicada. No se actualiza sola: cuando salga un anuario nuevo, repetir la extracción (el total debe coincidir con "Total país").
- Femicidios: Registro Nacional de Femicidios de la Justicia Argentina (Corte Suprema), CKAN `datos.csjn.gob.ar`, un archivo `.sav` por año desde 2017 (se lee con `pyreadstat`). Se cuentan las víctimas directas (`Tipo_victima = 1`), que incluyen travesticidios y transfemicidios. 2014 a 2016 solo están en informes PDF.
- Pesca: desembarques marítimos por especie desde 2012 (CIAM `dt_id=572`) y pesca continental comercial por especie y provincia (CIAM `dt_id=574`, un solo año, tomado del nombre del archivo).
- Carne vacuna, vino y yerba: indicadores sectoriales del Ministerio de Economía (SSPMI). En septiembre de 2026 el servidor tenía el certificado vencido y redirigía a una dirección con error 404: `01_descargar.py` reintenta sin verificar el certificado solo para ese servidor y, si falla, conserva el archivo anterior. Los archivos iniciales se bajaron el 28/09/2026 (datos hasta julio de 2026).
- Nombres (RENAPER): el código 99 es el total del país. Glaciares (IANIGLA vía CIAM `dt_id=383`, un solo corte). Temperatura (SMN vía CIAM `dt_id=467`, desde 1961).
- Mapa de provincias: `sitio/datos/provincias.geojson` (IGN simplificado, 132 KB, sin el sector antártico, con Malvinas).
- Educación. Las fuentes identifican provincias solo por nombre, con grafías variables ("Cordoba", "Santiago Del Estero", "Ciudad de Buenos Aires", "Tierra del Fuego, Antártida e Islas del Atlántico Sur"): se pasan a código INDEC con `norm()` y `COD_NOMBRE` en `02_procesar.py`.
- PISA: se usa la republicación de Our World in Data (OCDE). El resultado nacional de 2015 no es comparable (la OCDE lo excluyó por cobertura de la muestra): queda en la tabla con `arg_comparable = False` y fuera del gráfico. En 2000 solo hay lectura. El Banco Mundial no tiene 2022.
- Escolarización: archivo ZIP de "Indicadores Educativos" (datos.gob.ar, paquete `indicadores-educativos`), hoja "Tasa neta escol Secun". Desde 2022 cambia el denominador (proyecciones del Censo 2022) y hay tasas mayores a 100. Abandono, repitencia y sobreedad existen en el mismo paquete pero vienen en RAR, que no se puede abrir de forma confiable en la actualización automática: quedaron pendientes.
- Aprender: bases agregadas en un OneDrive del Ministerio enlazado desde datos.gob.ar (paquetes `aprender-AAAA`). Se descargan con cookies nuevas por archivo y `download=1`, y se valida que empiecen con `jurisdiccion` para no guardar una página de inicio de sesión. El cálculo propio sobre la base agregada difiere levemente del informe oficial (2025: 55,0% contra 56,3% en matemática, 76,9% contra 77,4% en lengua). Primaria y secundaria se alternan por año: el sitio toma siempre 6° grado de primaria del año más reciente.
- SNIC: tasas por sexo confiables solo desde 2017. El salto de suicidios 2024 a 2025 (9,7 a 11,8) puede reflejar cambios de cobertura.
- SIPA asigna el empleo a la provincia del empleador, por eso CABA aparece muy alta.
- La API de Series de Tiempo tiene buscador: `https://apis.datos.gob.ar/series/api/search/?q=...`

## Próximas fichas sugeridas

- Transferencias no automáticas Nación-provincias per cápita.
- Peces por parque nacional (SIB, especies de la clase ACTINOPTERYGII por área) y desembarques por puerto (magyp, tablas HTML).
- Abandono interanual y repitencia por provincia (DiNIEE, archivos RAR).
- Adultos de 25 años o más con secundaria completa por provincia (Censo 2022, cuadro c3 de educación).
- SUBE por provincia, con los archivos de viajes por línea (resolver antes dónde guardarlos por su tamaño).
- Patentamientos de autos y motos por provincia (DNRPA).
- Tarifas eléctricas medidas en horas de salario.
- "Si tu provincia fuera un país": comparación con indicadores del Banco Mundial.
- Integrar el panel de pobreza por partido y comuna (estimación en áreas pequeñas) ya hecho aparte.

## Pobreza (pestaña de consultas)

El proyecto está en `pobreza/`. Los datos salen de `pobreza/datos/crudo/ALL.json` (extraídos del tablero de pobreza del semestre). Para actualizarlo: reemplazar ese archivo, correr `python pobreza/scripts/exportar_parquet.py` y `npm run build` dentro de `pobreza/` (requiere Node.js), y después `python scripts/03_construir_sitio.py`, que copia `pobreza/dist` a `sitio/pobreza/`. La ficha "Pobreza" de Datina lee la serie nacional del mismo `ALL.json`. Algunos textos de la introducción de la página de consultas están escritos a mano (totales de calibración y semestre): ver `pobreza/README.md`.

## Publicación

Netlify toma la carpeta `sitio/` (ver `netlify.toml`). Con el repositorio en GitHub conectado a Netlify, cada actualización automática del día 5 republica el sitio sola.
