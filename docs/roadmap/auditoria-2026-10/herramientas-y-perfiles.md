Revisión de solo lectura de las 13 páginas asignadas. No edité ningún archivo del repositorio. Leí los volcados y el código, y medí el perfil en Chrome con un servidor local de `sitio/` en 1440x900 y 375x812 (ya lo cerré y la vista volvió a su tamaño). Busqué punto y coma e "y" delante del sonido i en el texto visible: no hay ninguno.

## A) Hallazgos por gravedad

| Grav. | Página | Cita | Qué está mal | Propuesta |
|---|---|---|---|---|
| P0 | contacto | "El formulario de contacto todavía no está disponible." | Es toda la página. No hay correo ni otro canal. Un sitio de datos sin forma de reportar un error pierde confianza. | Un correo del proyecto (mailto) o un enlace a los "issues" del repositorio. No hace falta servidor. La dirección la elige el autor. |
| P0 | nosotros | "Los formularios de Contacto y de novedades por correo guardan solo lo que escribís." | El armado sacó los dos formularios (`"formularios": ""` en `datos/manual/sitio.json`). Para borrar el correo te manda a Contacto, que no recibe nada. Tampoco dice que las preguntas de Consultas con IA pasan por Cloudflare. | Que 03 reescriba "Tus datos" con el mismo interruptor que saca los formularios, y sumar una línea sobre las consultas con IA. |
| P0 | catalogo, relaciones | "Datina (Datina (selección propia))" | Hay paréntesis dobles: "SSPM (… (API de Series de Tiempo))", "Wikimedia (Wikimedia (…))" y "Cómo Votó (¿Cómo Votó?)". En el grafo hay dos nodos "CSJN". La DEIS aparece como "…Información de Salud", pero el nombre oficial es "en Salud". Causa: `nom_org` en `scripts/catalogo.py:325` y los nombres de `datos/manual/relaciones.json` (líneas 137, 147, 505 y 556). | Sacar los paréntesis del campo `nombre`. Que no se repita la sigla cuando ya está en el nombre. Una sigla propia para el Registro de Femicidios. "Datina" fuera de la lista de organismos. |
| P0 | cruces | "la relación es fuerte y negativa" | El r es −0,52, pero en la misma pantalla Spearman da −0,37 y, sin CABA, −0,32. `datina.js` tiene cinco escalas de fuerza (líneas 4376, 4434, 4711, 5377 y 7368): en los artículos (`fuerzaArt`, fuerte desde 0,6) el mismo valor sería "moderada". | Una sola escala para todo el sitio. Si Spearman o el valor sin la provincia que más pesa caen de categoría, decirlo: "moderada, y débil sin CABA". |
| P0 | provincia | title "Tu provincia \| Datina" con ?prov=58 | Con Neuquén elegida, la pestaña, el marcador y la vista previa al compartir siguen diciendo "Tu provincia". Nada en `datina.js` cambia `document.title`. | Que el título pase a "Neuquén en números \| Datina" al elegir. Para compartir en redes, ver D8. |
| P1 | provincia | "¿De dónde viene Neuquén?" | La historia va antes que los números. Medido: la primera cifra queda a 1.223 px en 1440x900 (1,4 pantallas) y a 1.919 px en el celular (2,4 pantallas). | Ver B. |
| P1 | provincia | "Tu provincia", "Provincias", "Perfil provincial", "Elegí una de las 24" | La misma página tiene cinco nombres: title, menú y migas, tarjeta de "Seguí explorando" (03 líneas 658 y 687), h1 vacío y h1 lleno. | Un solo nombre: "Provincias" en el menú y "[Provincia] en números" como título. Que "Perfil provincial" desaparezca. |
| P1 | provincia | "Posición 22 de 24, de mayor a menor." | La frase se repite 40 veces y obliga a dar vuelta el puesto mentalmente. Además, "veces el promedio del país" no es exacto: "País" es el total nacional, no el promedio de las 24. | "La 3.ª más baja de 24" o "la 2.ª más alta", según el lado, sin decir si es bueno o malo. "1,7 veces el valor del país". |
| P1 | provincia | "Posición 2 de 23" / "4 de 20" / "14 de 21" | La aclaración está vacía (lo controlé en la página). El lector no sabe qué provincias faltan y puede creer que hay un error. | Nombrar las que faltan y por qué, en `.dp-aclara`. |
| P1 | provincia | "HOGARES QUE ALQUILAN" (24,9% y 29,3%) | El mismo rótulo aparece en Vivienda y en La capital con cifras distintas. Al recorrer la página parece una contradicción. | En el bloque de la capital: "Hogares que alquilan en la capital". |
| P1 | provincia | "cada 1.000 habitantes, salidos por Ezeiza o Aeroparque, 2025" | No se entiende qué se cuenta ni dónde se midió. | Decir qué se cuenta y aparte dónde se midió: "Turistas extranjeros que visitaron la provincia cada 1.000 habitantes. Encuesta en Ezeiza y Aeroparque." |
| P1 | provincia | "en los 60 indicadores del explorador, cada uno medido en desvíos" | "Explorador" se refiere a Cruces, pero el menú tiene otro "Explorador". "Desvíos" es jerga. Solo da tres nombres, sin valores ni el porqué, y el bloque queda a 5.320 px. | "Las que más se parecen en los 60 indicadores de Cruces". Mostrar en qué se parecen y en qué no. Subir el bloque (ver B). |
| P1 | provincia | h3 "1. Trabajo" | Sin provincia, el h3 cuelga del h1 y saltea un nivel. Con provincia, los 12 temas quedan "dentro" de la historia. Va contra la regla del 25 de octubre. | Los grupos del perfil en h2 (`datina.js:6991`). |
| P1 | cruces, indice, diagnostico, departamentos, pobreza | "Explorador de indicadores provinciales" / "Armá tu propio índice…" | Los títulos de ficha de las herramientas no son preguntas, y el consultor tampoco ("Pobreza en la Argentina: consultas", sin "\| Datina" en el title). La regla del autor desde la etapa 37 pide pregunta. | "¿Qué indicadores se mueven juntos?", "¿Qué provincia está mejor según lo que te importa?", "¿Cuánta pobreza hay en cada ciudad?". |
| P1 | varias | "Explorador…" / "Consultas…" | Dos herramientas se llaman "Explorador" (el h2 de Cruces y el Explorador de relaciones). Otras dos usan "Consultas" (Consultas con IA y el consultor de pobreza, cuyo menú interno dice "Consultas"). | Reservar cada palabra para una sola herramienta (ver C). |
| P1 | departamentos | "Libertad (Chaco) 0,0 Concepción (Misiones) 0,0 …" | La lista de valores más bajos son cinco ceros empatados, elegidos sin criterio visible. | Con empate: "N departamentos sin homicidios en 2023 a 2025, entre ellos…". |
| P1 | departamentos | nota de 138 palabras | Siete ideas en un párrafo. "Tocá una provincia" aparece dos veces. SNIC y RENAPER van sin explicar en la entrada. | Bajo el mapa, una línea de lectura. El resto a "Para entender los datos". Siglas desplegadas una vez. |
| P1 | departamentos | sin campo de búsqueda | Solo se llega tocando el mapa. Quien vive en Florencio Varela o en Rawson busca su partido primero. | "Buscá tu departamento o partido", que acerque el mapa y muestre su valor. |
| P1 | cruces | "por ejemplo empleo registrado y pobreza" | Pobreza no está en el selector (no hay dato provincial). | Cambiar el ejemplo por uno que exista, como salario y empleo registrado. |
| P1 | cruces | "Todos los indicadores son tasas, porcentajes o valores por habitante" | "Población" está en la lista y es un total. | Sacarla del selector (ya está "Tamaño según población") o corregir la frase. |
| P1 | cruces | "Sin obra social ni prepaga" / "Población sin obra social ni prepaga" | Pares casi iguales: también "Cloacas" y "Hogares con cloacas", y las dos "Necesidades básicas insatisfechas". La lista ya está agrupada por tema: el problema son los repetidos. | Uno por concepto. Si miden cosas distintas, que el nombre lo diga (personas u hogares, año). |
| P1 | cruces | "El VIF mide cuánto se superpone cada variable" | La regresión múltiple trae jerga (VIF, valor p, desvíos) en 82 palabras para un público general. | Plegada bajo "Avanzado". Nota en dos oraciones. |
| P1 | cruces | "Elegí dos indicadores y mirá…" (dos veces) | La bajada y el lead repiten la instrucción. El lead suma créditos (OCDE, Eurostat, Gapminder, Brasil) que no ayudan a usar la herramienta. Además "Ver los datos del cruce" y "Ver tabla" hacen casi lo mismo. | Lead: "Cada punto es una provincia. La recta resume la relación." Créditos a Nosotros. Un solo botón de tabla. |
| P1 | diagnostico | "QUÉ NO DICE ESTE DIAGNÓSTICO" | El mismo descargo aparece tres veces (lead, recuadro y "Lo que el diagnóstico no dice"). | Una sola vez, junto al gráfico. |
| P1 | diagnostico | "Ministerio de Capital Humano" / "Ministerio de Educación" | El mismo organismo tiene tres nombres en el sitio (el catálogo dice "Secretaría de Educación"). DiNIEE va sin explicar. | "Secretaría de Educación (Ministerio de Capital Humano)" en todo el sitio. Sigla desplegada. |
| P1 | diagnostico | "Descargar tabla por departamento (CSV)" | Está junto a "DESCARGAR CSV", con otra letra y otra caja. Parece un séptimo tipo de botón. | Un solo "Descargar" desplegable con las dos tablas. |
| P1 | catalogo | "CON DATOS DE" | Tiene 178 opciones, de 2040 a 1863. No se puede usar en el celular, y los años futuros son proyecciones. | Rangos: "antes de 2000", "2000 a 2019", "2020 en adelante", "proyecciones". |
| P1 | catalogo | tres "¿Dónde viven las personas nacidas en otro país?" | Las tres tablas tienen la misma bajada. Solo el nombre del archivo las distingue. Pasa con decenas de títulos repetidos. | Que la bajada diga el corte: por provincia, por departamento, por país de nacimiento. |
| P1 | catalogo | "citando a Datina y a la fuente" / "citá la fuente que figura en cada tabla" | La misma página da dos reglas de cita distintas. | Una sola, con una cita de ejemplo para copiar. |
| P1 | catalogo | TEMA: "Tu provincia", "Cruces", "Laboratorio" | El filtro mezcla temas con lugares del sitio, y el orden no es el del Explorador ni el de `GRUPOS`. | Temas en el orden de `GRUPOS`, y "Aparece en" como filtro aparte. |
| P1 | relaciones | "la línea del programa del sitio que la muestra" | Es una herramienta de auditoría para quien mantiene el sitio: nombres de archivo cortados, códigos del Banco Mundial ("SP.POP…"). Está en el menú del público. | Sacarla del menú. Enlazarla desde Nosotros ("Cómo se hace") y el pie (ver C). |
| P1 | consulta-ia | "La contesta un modelo que corre en Cloudflare, la empresa que publica el sitio…" | 47 palabras con cinco ideas. "Publica" es ambiguo (Cloudflare aloja). No nombra el modelo, y el aviso se repite abajo. | Reescritura más abajo. Nombrar el modelo una vez. |
| P1 | consulta-ia | campo vacío | Sin ejemplo no se sabe qué tipo de pregunta contesta bien. Quedó así a propósito: el autor sacó los ejemplos de la portada el 25 de octubre. | Preguntarle si acepta un ejemplo solo en este campo: "Por ejemplo: ¿cuánto cobra un maestro en Neuquén?". |
| P1 | pobreza | "1S 2026", "2S 2016", "1T 2026", "bootstrap", "radio del Censo" | Abreviaturas y jerga sin explicar. Hay 279 palabras antes del primer control. | Fechas escritas completas ("primer semestre de 2026"). Una línea de entrada y lo técnico plegado. |
| P1 | pobreza | "valor_pct li_90 ls_90 cv cantidad_miles" | La tabla muestra los nombres internos de las columnas. | "Pobreza (%)", "Mínimo", "Máximo", "Error relativo (CV)", "Personas (miles)". |
| P1 | nosotros | "Sobre nosotros" | No dice quién hace el sitio. Dice que el código es MIT, pero no lo enlaza. | Un párrafo "Quién lo hace" y el enlace al repositorio, si es público. |
| P1 | nosotros | "Todos los meses, los datos se actualizan…" | Sin fecha de la última actualización, sin el día (el 5) y sin avisar las fuentes caídas (datos.energia.gob.ar no responde desde el 23 de octubre). | "Última actualización: [fecha]. Próxima: 5 de noviembre", sacado del resumen, más la lista de fuentes que fallaron. |
| P1 | nosotros | (falta) | No hay "Cómo citar" con un ejemplo, aunque la licencia es CC BY 4.0. | Bloque con una cita de ejemplo y botón de copiar (ver D). |
| P2 | provincia, cruces, departamentos, diagnostico | "SALARIO PROMEDIO DE LOS ASALARIADOS REGISTRADOS PRIVADOS" | Rótulos largos en mayúsculas y letra mono. Se leen peor que en caja normal. | Mayúsculas mono solo en rótulos de hasta tres palabras. Los nombres de indicador en caja normal. |
| P2 | provincia | "NACIDOS EN OTRO PAÍS 5,6" / "84,7% · % de los ingresos" | Algunos porcentajes van sin %. Los demás repiten "%" en el detalle. Otros detalles: "en 2022 a 2024", Estonia sin año, "m³ por usuario" sin "por año". | % siempre en la cifra y el detalle sin "%". "Promedio 2022 a 2024". Año de cada país. "Por año". |
| P2 | provincia, herramientas | "Todos los temas →", "al final de la página ↓" | Flechas decorativas, contra la regla. "Seguí explorando" sigue el recorrido lineal: desde el perfil manda a "Flora y fauna". | Sin flechas. En el perfil y las herramientas, sugerir páginas relacionadas (en Neuquén, Petróleo y gas y sus departamentos). |
| P2 | provincia | barra "Neuquén ×" y select "Neuquén" | Dos selectores de provincia en la misma pantalla. | En esta página, dejar uno solo. |
| P2 | provincia | "por debajo del umbral de representatividad" | Jerga. | "Participaron pocos estudiantes. Tomalo como referencia, no para comparar." |
| P2 | indice | "…y Santiago del Estero última, con 2,3." | Chaco también tiene 2,3 y el texto no dice el empate. "24 jurisdicciones", "provincias" y "las 24" se alternan en las herramientas. | "Chaco y Santiago del Estero, últimas con 2,3". Un solo término por página. |
| P2 | indice | "Trabajo y producción: … Exportaciones" | Las exportaciones por habitante miden lo que vende la provincia, no el bienestar de quien vive ahí. | Consultar al autor si van el salario registrado o la tasa de empleo. |
| P2 | relaciones, nosotros, catalogo | "141 fichas" / "144 fichas" / "209 tablas" | Hay tres conteos distintos sin explicar (las fichas de suicidio no entran en el Explorador). | Decir qué se cuenta en cada lugar. |
| P2 | catalogo | "Se actualiza cada año." (proyecciones) | Las proyecciones 2022 a 2040 del INDEC no salen cada año. | "Con cada nueva proyección del INDEC". |
| P2 | diagnostico | "En las estatales, el 25,7% de los estudiantes pertenece al 20% del país…" | Oración de tres capas. | "En las escuelas estatales, uno de cada cuatro estudiantes está en el 20% de menor nivel socioeconómico. En las privadas, el 4,6%." |
| P2 | pobreza | (código) | El consultor baja la letra Source Serif 4, que no usa (la pisa con Roboto Flex). | Sacarla del tema de Observable. |
| P2 | 404 | "buscá con la lupa" | Funciona: la barra y la lupa están (lo controlé). Pero obliga a dar un paso más. | El campo de búsqueda en la misma página, más enlaces a Provincias y al Catálogo. |

**Reescrituras con el criterio de Scott Adams (una idea por oración):**

- **Ayuda de Consultas con IA:** "Hasta 400 caracteres. No escribas datos personales. Datina no guarda tu pregunta. La contesta [modelo] en Cloudflare, que aloja el sitio. Cloudflare no la usa para entrenar modelos. Hay un tope de consultas por día."
- **Nota de Departamentos, bajo el mapa:** "Homicidios dolosos cada 100.000 habitantes, promedio 2023 a 2025. Cada color agrupa a un quinto de los departamentos." Lo demás va a "Para entender los datos".
- **Provincias parecidas:** "Las que más se parecen a Neuquén en los 60 indicadores de Cruces son Chubut, Santa Cruz y Río Negro. La más distinta es Formosa."
- **Instrucciones del Explorador (46 palabras, tres formas de uso):** una oración por forma (mouse, teclado, tabla), en lista visual sin viñetas.

## B) El perfil provincial

**Diagnóstico.** No pasa la prueba de los 10 segundos.

- **Arriba solo hay historia.** En 1440x900 la primera pantalla tiene el nombre, el selector y la historia, y la primera cifra está a 1.223 px. En el celular está a 1.919 px. "Provincias parecidas" queda a 5.320 px.
- **No hay síntesis.** Son 40 tarjetas en 12 grupos y no hay un "dónde se destaca": para hacerse una idea hay que leer las 40.
- **La comparación con el país está bien resuelta.** Cada tarjeta trae "País", la tira de las 24 con la raya del país y "veces el valor".
- **La comparación con provincias parecidas, no.** Son tres nombres sin valores, al fondo. No hay comparación lado a lado.
- **En el celular hay 12 filas que se deslizan de costado.** Las tarjetas ocupan el 80% del ancho y la barra está oculta (`datina.css` 747 a 749), así que de cada cuatro tarjetas se ven una y media, sin contador. Es el mismo patrón aprobado para "En cifras". El "sin carruseles" del autor era sobre cosas que avanzan solas. Lo dejo como pregunta.
- **Habitantes.** Dicen "702.816 en 2025" porque `ANIO_POB = 2025` es una decisión documentada del autor. Pregunta: ¿pasar a 2026?

**Temas que faltan y ya están en Datina** (Cruces, Tu índice o los artículos, sin descargas nuevas):

- Pobreza y desocupación del aglomerado de la capital, de la EPH. Ejemplo: Neuquén–Plottier, 19,6% de personas pobres en el primer semestre de 2026.
- Cuentas fiscales: resultado fiscal, gasto en personal y peso de las regalías (clave en Neuquén).
- Transferencias: ATN y no automáticas por habitante.
- Política descrita sin adjetivos: participación electoral y peso en el Congreso.
- Población: densidad, personas mayores cada 100 en edad de trabajar y natalidad.
- Servicios: agua de red, NBI, computadora y velocidad de internet.
- Otros: muertes viales, empresas privadas empleadoras y autos nuevos.
- Inflación de su región, del IPC del INDEC.

**Estructura propuesta, de arriba abajo** (consultar al autor antes de tocar nada):

1. Título con bandera, un solo selector y una línea con habitantes, capital y año de provincialización (hoy en el costado de la historia).
2. "Dónde se destaca": seis tarjetas automáticas con los puestos 1 a 3 y 22 a 24 del perfil, en frase neutra. Ejemplo: "1.ª de 24 en salario privado registrado: 4.094.579 pesos brutos por mes, mayo de 2026. País: 2.151.327". No hacen falta datos nuevos.
3. "Neuquén frente al país": una tabla compacta con indicador, valor, país, puesto y tira, agrupada por tema. Es la versión que se imprime y se baja en CSV.
4. "Compará con…": las parecidas con sus valores y una segunda provincia (`?con=`) que suma una columna. No rompe la regla: la provincia del sitio se sigue eligiendo solo en esta página.
5. Los 12 temas en detalle, como hoy, con los temas que faltan.
6. La capital: vivienda, más pobreza y desocupación de su aglomerado.
7. Dentro de la provincia: el mapa de departamentos acercado a la provincia.
8. "Si Neuquén fuera un país".
9. "¿De dónde viene Neuquén?", plegada o al final, con el dato curioso.
10. Pie: bajar el perfil en CSV, imprimir o guardar en PDF (con `@media print`, unas dos hojas A4), imagen para compartir y cómo citar.

**Preguntas para el autor, en una tanda:**

- La historia: ¿al final, plegada arriba, o se queda donde está?
- El resumen: ¿seis tarjetas o una frase?
- El comparador: ¿columna en la tabla o página aparte?
- En el celular: ¿filas que se deslizan o grilla de a dos?

## C) Herramientas: mapa actual y propuesta

**Hoy.** El menú Herramientas tiene siete: Consultas con IA, Cruces, Tu índice, Diagnóstico educativo, Consultor de pobreza, Catálogo de datos y Explorador de relaciones. Provincias tiene dos: Tu provincia y Departamentos. Se pisan en tres tareas:

- **Ordenar o comparar las 24:** perfil (puesto), Tu índice (orden con pesos), Cruces (dos indicadores) y Diagnóstico (solo educación).
- **Encontrar un dato:** la lupa, el Catálogo, Consultas con IA y el Explorador de relaciones (el origen del dato).
- **Ver un tema a fondo:** el consultor de pobreza y el diagnóstico educativo son herramientas de un solo tema que viven fuera de su tema. El consultor además tiene otra estética, otro menú y otro nombre.

**Propuesta** (es un cambio de menú, así que va al autor como pregunta):

- **Provincias:** "Provincias" (perfil más comparador), "Ordenar las 24" (hoy Tu índice) y "Departamentos".
- **Herramientas, con dos ítems:**
  - "Cruces", con la regresión múltiple bajo "Avanzado".
  - "Catálogo de datos", con una sola caja: "Buscá un dato o hacé una pregunta". Primero muestra las tablas que coinciden y después ofrece "Preguntarles a los datos" (la IA, que la lupa ya ofrece).
- **Al tema:** el Diagnóstico educativo pasa a Educación, como bloque destacado y en su categoría. El consultor pasa a Pobreza y hogares como "Consultar los datos de pobreza", con el estilo de Datina.
- **Fuera del menú:** el Explorador de relaciones, enlazado desde Nosotros ("Cómo se hace"), el pie ("De dónde sale cada número") y cada tabla del Catálogo ("Ver su origen").
- **Nombres:** "Explorador" queda solo para el de relaciones, o desaparece. "Consultas" queda solo para la IA.

Resultado: de nueve entradas a cinco, sin borrar ninguna página ni romper direcciones.

## D) Funciones nuevas

| # | Idea | Ejemplo argentino | Esfuerzo |
|---|---|---|---|
| 1 | Comparador de dos provincias lado a lado (`?prov=58&con=62`) | Neuquén y Río Negro en las 40 cifras | Bajo a medio (los datos ya están en `PERFIL`) |
| 2 | "Dónde se destaca", automático | Neuquén: 1.ª en salario privado, exportaciones y docentes | Bajo |
| 3 | Puesto a lo largo del tiempo (gráfico de posiciones) | Con las series que ya usa Cruces: empleo registrado desde 2009, mortalidad infantil y homicidios desde 2000 | Medio |
| 4 | Calculadora de tu inflación, con pesos propios a los rubros del IPC por región (ya en el Catálogo) | Un jubilado del NEA que gasta la mitad en alimentos | Medio |
| 5 | "¿Tu hogar está bajo la línea de pobreza?", con la canasta básica total por región y los adultos equivalentes (ya en el sitio) | Dos adultos y dos chicos en el GBA | Bajo a medio |
| 6 | "¿En qué decil estás?" | Ingreso por persona del hogar en los 31 aglomerados | Alto: necesita las escalas de ingreso por decil del INDEC o los microdatos de la EPH (descarga nueva con aprobación del autor) y advertir que el ingreso declarado se subestima |
| 7 | Tu provincia en una imagen para compartir: PNG 1080x1350 con las seis cifras, bandera, fuente y fecha (reusar "Descargar imagen") | "Neuquén en 6 cifras" para WhatsApp | Medio |
| 8 | Páginas estáticas por provincia (`provincia/neuquen.html`) con title, descripción e imagen propias, sin romper `?prov=` | Que un enlace compartido diga Neuquén | Medio |
| 9 | Versión imprimible del perfil | PDF para un concejo deliberante | Bajo |
| 10 | Página "Novedades": qué fichas cambiaron de período en la actualización del día 5, armada por 03 comparando el resumen | "Noviembre: empleo registrado a julio, IPC de octubre" | Bajo a medio |
| 11 | Alertas por RSS generado por 03 | Seguir "Neuquén" o "Trabajo" | Bajo. Por correo es alto: `formularios` está vacío y haría falta un servicio y una decisión del autor |
| 12 | "Cómo citar" en cada ficha, con texto para copiar (botón de tipo enlace) | "Datina (2026). ¿Dónde se gana más? Con datos de [fuente]. Consultado el…" | Bajo |
| 13 | Buscador de tu departamento o localidad con Georef | "Plottier" lleva al departamento Confluencia | Medio |

¿Faltan páginas de "Cómo citar" y de "Novedades"? Sí, las dos. "Cómo citar" puede ser una sección de Nosotros más el bloque de cada ficha. "Novedades" responde la pregunta de confianza que hoy nadie contesta: qué cambió y cuándo.

## E) Los 5 hallazgos más importantes

1. No hay forma de reportar un error: Contacto no tiene formulario ni correo, y "Tus datos" en Nosotros describe formularios que el armado sacó.
2. El perfil provincial arranca con historia: la primera cifra está a 1.223 px en la computadora y a 1.919 px en el celular, sin un resumen de dónde se destaca la provincia.
3. Cruces llama "fuerte" a r = −0,52, que los artículos llamarían "moderada", porque `datina.js` usa cinco escalas distintas.
4. Siete herramientas cubren tres tareas: el Explorador de relaciones es de auditoría, y el consultor de pobreza y el diagnóstico educativo pertenecen a su tema.
5. Lo mismo tiene nombres distintos y hay textos rotos: el perfil tiene cinco nombres, hay dos "Explorador", dos "Consultas" y tres nombres del ministerio de Educación, hay organismos con paréntesis dobles y el title queda fijo en "Tu provincia" al compartir.

Archivos citados (todos en `C:\Users\GCBA\Aplicación desarrollo\argentina-en-datos\`):
- `scripts\datina.js` (líneas 94, 4376, 4434, 4711, 5377, 5875, 6991, 7036 y 7368)
- `scripts\catalogo.py:325`
- `scripts\03_construir_sitio.py` (líneas 658 y 687)
- `scripts\datina.css` (líneas 747 a 749)
- `datos\manual\relaciones.json` (líneas 137, 147, 505 y 556)
- `datos\manual\sitio.json`
- `scripts\plantilla.html:183`
