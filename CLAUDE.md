# Datina

Números de las 24 Argentinas. Nombre y lema públicos del sitio desde septiembre de 2026, elegidos por el autor (antes "Argentina en datos", que ya usaba otra cuenta, y "Argentina Posta", descartado). La carpeta conserva el nombre viejo. Sitio estático de estadísticas públicas de la Argentina con valor agregado: cada cifra trae qué mide, de qué año es, de dónde sale y su tabla descargable. Inspiración: The Pudding (preguntas antes que datos), Our World in Data (transparencia total), Argendata de Fundar (antecedente local, no duplicarlo). El diferencial es la desagregación subnacional y los cruces laterales entre fuentes.

El autor no programa. Claude Code es el asistente principal: explicar cada cambio en lenguaje simple, ejecutar los scripts y verificar el resultado antes de dar algo por terminado.

Al empezar una sesión, leer la sección final "Pendientes y próximos pasos".

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

## Comparación con la OCDE (septiembre 2026, pedido del autor)

- La OCDE va dentro de cada gráfico, nunca en un bloque aparte (pedido del autor): color propio violeta (`--ocde #7A4FA0`, franja `--ocde-suave`). Si la unidad coincide, es una línea en el mismo gráfico: nacimientos (índice 2012 = 100, los nacimientos de la OCDE se estiman con la tasa bruta de natalidad `SP.DYN.CBRT.IN` por la población), mortalidad infantil, esperanza de vida, áreas protegidas y PISA. Si no coincide, el gráfico suma botones "OCDE: ..." (objeto `OCDE_VISTA`) que lo redibujan con la Argentina, el promedio OCDE y la franja del percentil 25 al 75, y cambian el texto y la nota de la ficha.
- Fuente: Indicadores del Desarrollo Mundial del Banco Mundial (`bm_*.json` en `datos/crudo/`, lista en `BM_INDICADORES` de `01_descargar.py`). El promedio OCDE se calcula en `02_procesar.py` como promedio simple de los 38 miembros, igual que en los informes de la OCDE, y solo en los años con dato para al menos 29 países. Se guarda también la mediana: si difiere más de 25% del promedio, el texto la menciona.
- Son estimaciones armonizadas (OMS, ONU, OIT) y pueden diferir de las cifras nacionales de cada ficha. El texto lo aclara siempre.

## Datos provinciales que no están en Argendata

Relevamiento de septiembre de 2026: Argendata (Fundar) es casi toda nacional. Tiene por provincia PBG per cápita, NBI censal, fecundidad, informalidad y tasa de empleo (EPH), I+D y pernoctes. No duplicarlos. Se sumaron:
- Esperanza de vida al nacer por provincia y sexo (INDEC, tablas de mortalidad 2020 a 2022). 2020 y 2021 reflejan la pandemia.
- Censo 2022: agua de red, cloacas, internet, computadora, NBI y personas sin obra social, prepaga ni plan estatal. El INDEC publica un ZIP por provincia con resultados por radio censal (unos 800 MB). `scripts/censo_2022.py` se corre una sola vez y guarda el resumen en `datos/manual/censo2022_provincias.csv`. Cloacas usa la variable `HOGAR_H15_17_18` sobre todos los hogares.
- Internet fijo (ENACOM): accesos cada 100 hogares y velocidad media, trimestral. Los nombres de provincia vienen sin código ("Tierra Del Fuego").
- Exportaciones por provincia de origen (INDEC OPEX vía SSPM, dataset 350), en dólares por habitante.
- Personas nacidas en otro país identificadas por el RENAPER (el archivo se llama `..._junio_206.csv`: es junio de 2026).
- Pendientes verificados: salario medio SIPA por provincia (OEDE, un Excel por jurisdicción, con GBA separado), transferencias RON por provincia (Excel anual de la DNAP) y empleo público. El IDH provincial del PNUD es de 2016 y el de Global Data Lab solo tiene seis regiones.

## Explorador de cruces

- Sección `#cruces`, tarjeta `f-cruces` (clase `explorador`, no cuenta como ficha en el recuadro de estado). Tabla `cruces_provincias.csv` con una fila por jurisdicción y metadatos en `resumen.cruces` (objeto `CRUCES_META` de `02_procesar.py`: nombre, unidad, período, tema, fuente, ficha, decimales). Para sumar un indicador, agregar la columna a `cru` y su entrada en `CRUCES_META`.
- Solo tasas, porcentajes o valores por habitante. Las tasas de suicidio quedan fuera, igual que en el perfil provincial.
- Tres vistas: dispersión con recta de mínimos cuadrados, intervalo del 95%, r de Pearson, R², Spearman y valor p (todo calculado en el navegador); matriz de correlaciones que abre cada par al tocarlo; regresión múltiple con variables estandarizadas, hasta cuatro explicativas, intervalos y VIF.
- Honestidad estadística obligatoria: advertir que son 24 casos, que correlación no es causalidad, que son promedios provinciales (falacia ecológica), cuándo los períodos no coinciden, cuándo Spearman difiere mucho de Pearson y qué jurisdicción mueve más la recta (distancia de Cook).
- El cruce se comparte en el enlace: `?cx=...&cy=...&cf=02,94` (jurisdicciones fuera del cálculo).
- Benchmark que guió el diseño: OECD Regional eXplorer y Regional Well-Being, Eurostat Regions and Cities Illustrated, Gapminder, Our World in Data, Global Data Lab, Opportunity Atlas y el Atlas de Desarrollo Humano de Brasil (el más parecido: unidades federales con módulo de correlación).

## Herramientas propias (septiembre 2026): lo que ningún otro sitio argentino ofrece

Relevamiento: Argendata, datos.gob.ar, INDEC, CEP XXI (congelado en 2023), UCA, CIPPEC y CFI no tienen un panel provincia por año de varias fuentes, ni mapa por departamento, ni índice con pesos propios, ni comparación con el mundo. Referencias de afuera: Data México, Data USA, ONS Explore local statistics, TerriData, IBGE Cidades, Atlas Brasil, Better Life Index de la OCDE, County Health Rankings.
- Público (septiembre 2026, tras el feedback de la mentora del autor): decisores, periodistas y gente curiosa con algo de manejo de datos. Más adelante, una sección para emprendedores (oportunidades, problemas para resolver, tendencias). Cada sección tiene que ayudar a entender un problema, opinar mejor y detectar oportunidades.
- Jerarquía y orden: de lo más cercano a la vida cotidiana a lo más lejano. Orden: provincia, trabajo, pobreza, salud, educación, población, política, movilidad, energía, turismo, naturaleza, curiosidades y al final las herramientas (Cruces, Tu índice, Departamentos). La barra muestra Trabajo, Pobreza, Salud, Educación, Población y Política, y el botón "Secciones" abre todas (también en el celular). Cada sección abre con una pregunta (`.tema-intro`) y las seis principales cierran con "Para pensar" y "Oportunidades" (`.tema-cierre`), sin cifras escritas a mano. Dentro de cada sección, las fichas van de lo cercano a lo lejano (por ejemplo, Salud arranca con esperanza de vida y mortalidad infantil, y Educación con Aprender). La sección del mapa se llama `#departamentos` porque `#mapa` es el dibujo de fondo de la portada.
- Tu provincia: además del perfil, "provincias parecidas" (distancia en desvíos estándar sobre todos los indicadores del explorador) y "si tu provincia fuera un país" (país más cercano en esperanza de vida y mortalidad infantil, Banco Mundial en español: `bm_paises.json`, `bm_mundo_*.json`, tabla `mundo_paises`).
- Cruces: evolución año por año al estilo Gapminder cuando los dos indicadores tienen serie (`sitio/datos/cruces_series.csv`, se baja solo al pedirla; `resumen.cruces_series` indica los años). Botón Reproducir, control de año y estela de la provincia elegida. La población por año sale de las tasas del SNIC.
- Tu índice: siete dimensiones con pesos de 0 a 5 elegidos por cada persona (idea del Índice para una Vida Mejor de la OCDE). Cada indicador en escala 0 a 10 entre el peor y el mejor valor de las 24 (exportaciones y velocidad en logaritmo). Los pesos quedan en el enlace (`?ix=`).
- Mapa: 527 departamentos (Georef, simplificado una sola vez con `scripts/geometria_departamentos.py`, requiere Node). Homicidios y muertes viales (promedio de tres años), robos (SNIC por departamento, 70 MB que `01_descargar.py` resume al bajar en `snic_departamentos_resumen.csv`) y edad y origen de la población (RENAPER por departamento, `renaper_departamentos_resumen.csv`). Códigos que difieren entre SNIC y Georef: comunas de CABA, Chascomús, Quilmes, Río Grande y Ushuaia (`TRADUCE` en `02_procesar.py`). El RENAPER publica CABA sin comunas. Las listas excluyen departamentos con menos de 10.000 personas.
- Finanzas provinciales: ficha `f-fiscal` con recursos propios sobre ingresos totales, resultado financiero y gasto en personal (esquema AIF del Ministerio de Economía, `aif_provincias.xlsx`, desde 2005). Se usa el último año con las 24 provincias. Natalidad por provincia (DEIS) en el explorador.
- Liviandad: los gráficos se dibujan recién cuando la tarjeta entra en pantalla, la tabla de la OCDE se baja recién al tocar un botón OCDE, y las series, el mapa y la geometría se cargan solo cuando se usan.

## Política (septiembre 2026, pedido del autor)

Sección `#politica`. Tono neutro obligatorio: describir, no adjetivar. Once fichas:
- Elecciones presidenciales por provincia 1983 a 2023 (`f-elecciones`): Dirección Nacional Electoral, CC-BY. Definitivos 1983 a 2019 (un Excel por elección, una hoja por distrito) y provisorios por mesa en 2023 (el definitivo no está publicado como datos, revisado de nuevo en septiembre de 2026). `scripts/elecciones_presidenciales.py` se corre una sola vez y guarda `datos/manual/presidenciales_provincia.csv`. Cada fórmula se nombra por quien la encabezaba (2015 y 2023 no traen fórmula: `CAND_LISTA`). Cuatro fórmulas más votadas del país y "Otras". Oficialismo nacional por elección en `OFICIALISMO` (en 2003, Kirchner, candidato del gobierno de Duhalde), usado en los cruces para el futuro trabajo con transferencias.
- PASO presidenciales 2011 a 2023 en la misma ficha (vuelta 0, id `AAAA-paso`): definitivos 2011 y 2015 (Excel de la DINE, en 2015 con los precandidatos debajo de cada agrupación), provisorios por mesa 2019 y 2023. El enlace oficial de las PASO 2023 (`dine-resultados/2023-PROVISORIOS_PASO.zip`) da 404: se usa la copia del Internet Archive (snapshot 20240106010034, sha256 25558e7b...). Las listas de 2023 no traen candidatos: `LISTAS_2023` en `scripts/elecciones_presidenciales.py`. En el gráfico cada agrupación suma sus listas internas y se nombra por la precandidatura más votada; las internas van en el texto. Porcentajes sobre votos positivos en todas las elecciones (en 2019 y 2023 el recuento oficial de las PASO se informó sobre votos válidos, con blancos).
- Cotejo con electorAr (github.com/electorArg/PolAr_Data, escrutinio provisorio 2003 a 2019): `scripts/verificar_electorar.py`. Coincide salvo diferencias de 1 a 4 puntos en algunas provincias en 2003, 2007 y las PASO 2011 y 2015, que vienen de comparar provisorio con definitivo. Los totales nacionales de la DINE coinciden con los oficiales (Alfonsín 51,75, Fernández de Kirchner 2007 45,28, 2011 54,11, Fernández 2019 48,24). Se mantiene la DINE.
- Transferencias de la Nación a las provincias (`f-atn` y `f-transferencias`, 2000 al último año completo): Presupuesto Abierto, crédito devengado anual (`dgsiaf-repo.mecon.gob.ar/repository/pa/datasets/{año}/credito-anual-{año}.zip`), inciso 5, principal 7 y 8, parcial 1 y 6 (gobiernos provinciales y municipales), por ubicación geográfica. `scripts/transferencias_presupuesto.py` guarda `datos/manual/transferencias_provincias.csv` (millones corrientes, 1995 en adelante; volver a correrlo cada año). Tres tipos: ATN (reglas por período en `es_atn`: actividad propia desde 2017, Interior programa 19 fuente 1.3 de 2002 a 2016, en 2025 en Jefatura de Gabinete), por ley o por fallo (`POR_LEY`: coparticipación CABA y TDF, Fondo Federal Solidario, FONID, ley 27.260, ley 27.606, cautelar CSJN) y otras no automáticas. Antes de 2000 los ATN no tienen provincia. Pesos del último año con el deflactor del PBI del Banco Mundial (`NY.GDP.DEFL.ZS`), por habitante con la población implícita en el SNIC de cada año. En cruces: ATN por habitante promedio anual y otras no automáticas por habitante del último año.
- Composición del Congreso por período legislativo, 1983 a hoy (`f-congreso`): bancas al 1° de marzo siguiente al 10 de diciembre de cada año impar. Diputados y senadores de cada período por provincia (`f-legisladores`, se elige período y provincia): quien dejó la banca durante el período, o poco antes de empezar, lleva entre paréntesis quién la ocupó después. La lista se carga aparte al abrir la ficha (`sitio/datos/legisladores_por_periodo.json`, con nombres y bloques en listas para que pese menos). Enlace de reemplazos en `02_procesar.py`: primero los que nombra la fuente (columna `reemplaza`: texto del Patrimonio Legislativo y observaciones del Senado), después por provincia y fecha (quien asume a mitad de un mandato o de un período, prefiriendo el mismo fin de mandato y el mismo espacio). Desde 2007 casi todos los períodos suman 257 y 72 bancas. Antes hay diferencias chicas por reemplazos sin fecha en la fuente. Habitantes por banca en `f-representacion` (ley 22.847 en `DIP_LEY`). Senado: `senado.gob.ar/micrositios/DatosAbiertos/ExportarListadoSenadoresHistorico/json`. Diputados desde 2007: datos.hcdn.gob.ar (`diputados2.0.csv`, con bloque real, los tramos de bloque se cortan en la fecha de CESE). Diputados 1983 a 2007: Patrimonio Legislativo de la HCDN (apym.hcdn.gob.ar), raspado con `scripts/legisladores/`. `build.py` escribe `datos/manual/diputados_nacionales.csv` y `senadores_nacionales.csv`: para actualizar, volver a bajar los archivos de entrada y correrlo.
- Espacios políticos (clasificación propia, revisable, pedido del autor): Peronismo, UCR y aliados, PRO, Cambiemos y Juntos por el Cambio, La Libertad Avanza, Izquierda, Fuerzas provinciales y Otras fuerzas. La UCR y el PRO van separados porque el PRO no existía como fuerza nacional antes de 2005. Cambiemos y Juntos por el Cambio es un espacio aparte solo cuando la fuente registra la alianza y no el partido (Senado 2015 a 2023, fórmulas de Macri y Bullrich). La Alianza 1997 a 2001 va con la UCR. Coalición Cívica, ARI, Frepaso, GEN, Frente Progresista y Encuentro Federal van en Otras fuerzas. Frentes de gobernadores (Renovador de la Concordia, Innovación Federal, Provincias Unidas, Frente Cívico por Santiago) en Fuerzas provinciales. Reglas en `REGLAS_ESPACIO` de `02_procesar.py`. Mismos colores en elecciones y Congreso (`ESP_COLOR`).
- Presidentes (`f-presidentes`) y ministros (`f-ministros`) según lugar de nacimiento. AMBA = CABA y los 24 partidos del INDEC (La Plata no). Presidentes verificados en Casa Rosada, Wikipedia y Wikidata. Ministros con rango de ministro y jefes de gabinete: anexos de gabinete de Wikipedia, cruzados con anexos por ministerio y Wikidata, correcciones anotadas en la tabla (`scripts/ejecutivo/`, `datos/manual/ministros.csv`). No hay fuente oficial de ministros con lugar de nacimiento. El lugar de nacimiento de los legisladores no se usa: sale de cruzar nombres con Wikidata y tiene errores.
- Cruces: voto a Milei en el balotaje 2023, voto al oficialismo nacional y participación 2023 (con series por elección) y peso de cada habitante en el Congreso.
- Votaciones nominales (septiembre de 2026, pedido del autor). Fuente: copia de las actas oficiales (votaciones.hcdn.gob.ar desde 1993, senado.gob.ar/votaciones/actas desde 2005) del proyecto abierto ¿Cómo Votó? de Rodrigo Quiroga (github.com/rquiroga7/como_voto, se actualiza a diario). Las páginas oficiales no tienen descarga masiva y votaciones.hcdn.gob.ar bloquea las consultas seguidas (403). `01_descargar.py` guarda `congreso_votaciones_{diputados,senadores}.json.gz` y el commit usado en `congreso_votaciones_meta.json`. `scripts/verificar_votaciones.py` coteja con los datos abiertos de la HCDN (todas las actas 2011 a 2019, 899 de 899 iguales en septiembre de 2026) y con el sitio del Senado (leyes clave y muestra, 42 de 42). Cuatro actas de Diputados de 2011 y 2012 vienen dañadas en la copia y se descartan. El Senado no publica el acta nominal de la resolución 125, el matrimonio igualitario ni el memorándum con Irán.
- Leyes clave: `datos/manual/leyes_clave.csv` (selección propia, 25 leyes de 2008 a 2026, con qué cambia y desenlace escritos a mano sin cifras, y el id del acta en cada cámara). Fichas `f-votaciones` (un punto por legislador, se carga aparte `sitio/datos/votaciones_leyes_clave.json`) y `f-votaciones-espacios` (tabla de porcentaje a favor por espacio, tocar una fila abre la ley). Espacio de cada voto: el bloque del acta con `REGLAS_ESPACIO` y `scripts/legisladores/familias.py` (compartido con `build.py`). En las votaciones el PRO y la UCR van siempre separados ("FRENTE PRO" del Senado es PRO).
- Apoyo al gobierno y transferencias (`f-apoyo`, y en Cruces con serie): por provincia y año, porcentaje de votos de legisladores de fuera del bloque oficialista que coincidieron con él en votaciones divididas (al menos 25% de los presentes votó distinto que ese bloque), sumando las dos cámaras, desde 2005. Bloque oficialista: el más numeroso del espacio del presidente en la cámara (`GOBIERNOS` en `02_procesar.py`; Macri: PRO y Cambiemos). Correlación de Spearman con ATN y otras no automáticas por habitante del mismo año (ATN solo si al menos 8 provincias recibieron). Tabla `apoyo_gobierno_provincias`.
- Pendiente: cruzar el voto de los legisladores con el voto electoral de su provincia y sumar votaciones anteriores a 2008 (Diputados tiene pocas actas antes de 2004).

## Reglas para temas sensibles (suicidio)

- Nunca usar ni mostrar las columnas de modalidad, lugar u hora de la base SAT del SNIC. Solo año, edad y sexo.
- Las líneas de ayuda (135 desde CABA y GBA, (011) 5275-1135 desde todo el país, 107 en emergencias) van siempre justo antes de la primera ficha que muestra suicidios. Desde septiembre de 2026 esas fichas están al final de Salud, para no abrir la sección con ese tema.
- Nada de rankings sensacionalistas, juegos de adivinanza ni lenguaje dramático en esa sección.
- Aclarar siempre que el SNIC es un registro policial y que la DEIS (Salud) usa otra metodología.

## Advertencias de fuentes conocidas

- CAMMESA en datos.gob.ar dice estar actualizada pero sus datos terminan en febrero de 2020. Se usa la serie 367.3 de la Secretaría de Energía vía API de Series de Tiempo.
- RENAPER deja sin código a Córdoba, Entre Ríos, Neuquén, Río Negro y Tucumán. Se completan por nombre en `02_procesar.py`.
- DEIS (datos.salud.gob.ar) cambia el nombre del archivo de mortalidad infantil con cada año nuevo ("1990-2024"). `01_descargar.py` busca el CSV vigente en el catálogo del portal con `ckan_csv()`. En provincias con pocos nacimientos la tasa anual salta mucho: la ficha compara promedios de tres años.
- SUBE: la copia en la API de Series de Tiempo quedó detenida en enero de 2026. Se baja directo de archivos-datos.transporte.gob.ar (`total-usuarios-por-dia.csv`, se actualiza a diario). Los archivos de viajes por línea y provincia (`dat-ab-usos-AAAA.csv`) pesan 50 a 65 MB por año y no se guardan en el repositorio. La ficha usa la mediana de los días hábiles de cada mes y solo meses completos.
- Población provincial: el INDEC publicó en octubre de 2025 las proyecciones 2022 a 2040 por jurisdicción (`censo.gob.ar/wp-content/uploads/2025/10/proyecciones_jurisdicciones_2022_2040_base.csv`). Todavía se usa la derivada del SNIC, que sale de esas mismas proyecciones. Reemplazarla es un pendiente.
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

- Peces por parque nacional (SIB, especies de la clase ACTINOPTERYGII por área) y desembarques por puerto (magyp, tablas HTML).
- Abandono interanual y repitencia por provincia (DiNIEE, archivos RAR).
- SUBE por provincia, con los archivos de viajes por línea (resolver antes dónde guardarlos por su tamaño).
- Tarifas eléctricas medidas en horas de salario.
- Integrar el panel de pobreza por partido y comuna (estimación en áreas pequeñas) ya hecho aparte.

## Pobreza (pestaña de consultas)

El proyecto está en `pobreza/`. Los datos salen de `pobreza/datos/crudo/ALL.json` (extraídos del tablero de pobreza del semestre). Para actualizarlo: reemplazar ese archivo, correr `python pobreza/scripts/exportar_parquet.py` y `npm run build` dentro de `pobreza/` (requiere Node.js), y después `python scripts/03_construir_sitio.py`, que copia `pobreza/dist` a `sitio/pobreza/`. La ficha "Pobreza" de Datina lee la serie nacional del mismo `ALL.json`. Algunos textos de la introducción de la página de consultas están escritos a mano (totales de calibración y semestre): ver `pobreza/README.md`.

## Publicación

Netlify toma la carpeta `sitio/` (ver `netlify.toml`). Con el repositorio en GitHub conectado a Netlify, cada actualización automática del día 5 republica el sitio sola.


## Actualización y cruces "por qué" (30 de septiembre de 2026, feedback de la mentora del autor)

- Datos al último período disponible. Las series mensuales cierran en el último año completo y el texto suma "entre enero y el último mes del año en curso" contra los mismos meses del año anterior (`en_lo_que_va` y `YTD` en `02_procesar.py`, `enLoQueVa` en la plantilla). Fuentes revisadas en septiembre de 2026:
  - Exportaciones por provincia: INDEC, `sh_opex_regiones_economicas_grubros_1993_2025.xls` (una hoja por bloque de años, provincias por nombre). El dataset 350 de la SSPM quedó en 2024. El primer semestre de 2026 está en un anexo cuyo nombre cambia en cada publicación: no se usa todavía.
  - Cuentas fiscales: la planilla anual trae 2025 para 23 provincias. La ficha usa el último año con al menos 20 y las que faltan van con su último año (`FISC_ATRASADAS`, aclarado en la nota). El primer trimestre de 2026 existe pero no es comparable con años completos.
  - Visitas por parque nacional: tablero de áreas protegidas de la Secretaría de Turismo (tableros.yvera.tur.ar/tablero_areas_protegidas), sin enlace fijo. Exportación completa mensual desde 2008 en `datos/manual/visitas_parques_nacionales_mensual.csv`: renovarla a mano.
  - Proyecciones de población del INDEC por provincia, sexo y edad 2022 a 2040 (`indec_proyecciones_provincias.csv`): ficha `f-envejecimiento` (personas de 65 y más cada 100 de 15 a 64, año en curso y 2040).
  - Sin novedades: RENAPER sigue en 2024, la Encuesta de Ocupación Hotelera llega a noviembre de 2025 y el INDEC no publica desde enero de 2026.
- Cruces que buscan el porqué:
  - `f-adolescentes-nse`: madres menores de 20 (RENAPER 2024) contra indicadores del Censo 2022 (`datos/manual/nse_censo2022_provincias.csv`: sin obra social ni prepaga, NBI, secundario completo en adultos, cloacas). Armada una sola vez con los cuadros del INDEC (el de cobertura de salud tiene invertidos los códigos de Tucumán y Tierra del Fuego). Correlación de Spearman y aclaración de que no prueba causalidad.
  - `f-causas-infantiles`: muertes de menores de un año por grupo de causa CIE-10 y provincia, suma de los tres últimos años (DEIS, `deis_defunciones_AAAA.csv` y `deis_nacidos_AAAA.csv`). Las tasas reproducen la tasa oficial de cada provincia. La reducibilidad solo existe para el país en el anuario (PDF): `REDUCIBLES_PAIS`. No se puede calcular por provincia con códigos de tres caracteres.
- Diseño: se sacó el juego de adivinar de nacimientos (no se entendía) y el "actualizado" de la portada. Tipografía más chica y menos condensada (títulos de sección de 40 a 64 px, de ficha de 21 a 28 px) y reglas para celular (controles a lo ancho, notas más chicas, sin marco).


## Pendientes y próximos pasos (al 30 de septiembre de 2026)

Estado: todo lo hecho está en GitHub (último cambio: votaciones del Congreso y cruce con los ATN).
- Confirmar con el autor la ubicación de las líneas de ayuda sobre suicidio: hoy van justo antes de las fichas de suicidio, al final de Salud (la regla de arriba ya lo refleja, falta su visto bueno).
- Publicación estable: el autor tiene que conectar el repositorio de GitHub a Netlify (carpeta `sitio`, sin comando de construcción, ver `netlify.toml`), con vistas previas por rama para probar. Mientras tanto el sitio se muestra con un túnel temporal de cloudflared sobre `python -m http.server 8765 --directory sitio`, que se corta al cerrar la sesión o apagar la computadora: hay que abrir uno nuevo y pasarle el enlace.
- Votaciones: cruzar el voto de los legisladores con el voto electoral de su provincia y sumar leyes anteriores a 2008.
- Ideas de la mentora todavía sin hacer:
  - Trabajo: rotación laboral por edad, generación, nivel educativo y nivel socioeconómico (EPH).
  - Población: pirámide de población y su efecto en las jubilaciones.
  - Política: al tocar el color de un espacio, qué propone y qué votó (base: `votaciones_leyes_clave`), y las leyes que más cambiaron la vida cotidiana.
  - Educación: soluciones y proyectos (por ejemplo, DGEMPRE), no solo diagnósticos.
  - Sección nueva para emprendedores: oportunidades, problemas para resolver y tendencias.
- Datos que esperan publicación: RENAPER 2025, Encuesta de Ocupación Hotelera posterior a noviembre de 2025, exportaciones por provincia del primer semestre de 2026 (anexo con nombre variable), cuentas fiscales 2026 completas.
- Entorno: en septiembre de 2026 una búsqueda instaló `pypdf` en el Python general sin que el proyecto lo use. El autor puede quitarlo con `pip uninstall pypdf`.
