Revisión editorial de solo lectura de portada, Población, Migraciones, Salud, Educación, Pobreza y hogares y Diagnóstico educativo. No edité ningún archivo. Contrasté contra los CSV de `sitio/datos/` y contra los generadores de `LEAD` en `scripts/datina.js` (líneas 1127 a 1250 y 1448 a 1460). Resultado: hay tres contradicciones visibles (P0). Las cifras que revisé están bien en los datos (participaciones de causas de muerte, AUH, pensiones, puntajes PISA, salario docente). Los problemas aparecen al armar el texto.

## A) Hallazgos por gravedad

| Grav. | Página | Ficha | Cita | Qué está mal | Propuesta |
|---|---|---|---|---|---|
| P0 | poblacion | f-envejecimiento | "La relación más alta es la de CABA (29,9) y la más baja, la de Tierra del Fuego (11,4)" | El gráfico rotula los valores de 2040 (CABA 33,4 y Misiones 16,8 abajo). El texto cita 2026 y no dice el año | "En 2026 la más alta es CABA (29,9) y la más baja, Tierra del Fuego (11,4). En 2040, CABA (33,4) y Misiones (16,8)." Sumar que Tierra del Fuego y Santa Cruz casi duplican su relación |
| P0 | salud | f-esperanza | "Por provincia iba de 79,4 años en CABA a 72,1 en Chaco" | El gráfico muestra varones y mujeres y rotula a las mujeres (CABA 82,4, Chaco 75,5). El total del texto no aparece. La línea OCDE (81,2, ambos sexos, 2024) queda junto a valores de un solo sexo de 2022 | Rotular las dos puntas o el total. Texto: "Mujeres y varones juntos, iba de 79,4 años en CABA a 72,1 en Chaco." Aclarar el año de la OCDE |
| P0 | educacion | f-pisa | "En matemática la diferencia con la OCDE fue de 95 puntos" | La clave dice 378 contra 472 y el lector resta 94. El 95 sale de 472,4 menos 377,5 | Restar los valores que se muestran o escribir "unos 95 puntos". Regla general: toda resta del texto, con las cifras visibles |
| P1 | salud | f-mortalidad | "En 2023, la tasa de mortalidad infantil del país fue de 8,0" | La clave dice 8,5 en 2024. El texto abre con un año viejo y esconde que la tasa subió. El sub habla de trienios y la clave de un año | Clave: "8,5 cada 1.000 nacidos vivos en 2024, más que el 8,0 de 2023". El texto sigue desde 1990 y los trienios |
| P1 | salud | f-mortalidad | pestaña "OCDE: GASTO EN SALUD, 2023" | Otro indicador sin aviso, dentro de una ficha de mortalidad infantil | Sacarla o darle ficha propia |
| P1 | poblacion, salud, educacion, pobreza | f-nacimientos, f-adolescentes, f-escolarizacion, f-pobreza, f-internet | "OCDE: POBREZA RELATIVA, 2022" | Las pestañas OCDE cambian de medida y de unidad (hijos por mujer, fecundidad cada 1.000, pobreza relativa, uso de internet, ciclo básico) y no lo avisan | Que la pestaña nombre la medida y la unidad, más una línea: "no es la misma medida de la vista principal" |
| P1 | index | Datos destacados | "¿Cuántos años se vive en cada provincia?" con 76,2 del país | Dos preguntas dicen "en cada provincia" y muestran la cifra del país (también homicidios, 3,6). "¿Dónde se gana más…?" responde con el promedio nacional | Preguntas del país (ver B) o mostrar el rango provincial |
| P1 | index | bajada y meta desc | "los argentinos y las 24 provincias" | Son 23 provincias más la Ciudad. Otras páginas dicen "24 jurisdicciones" | "las 23 provincias y la Ciudad" o "las 24 jurisdicciones" |
| P1 | migraciones | f-nacidos-otro-pais | "El país de nacimiento más frecuente era Paraguay en 7 de las 24 jurisdicciones" | Chile es el primero en 8, Paraguay en 7 y Bolivia en 6 (CSV). La frase sugiere que Paraguay domina | "Paraguay es el primero en el total. Por jurisdicción, Chile lo es en 8, Paraguay en 7 y Bolivia en 6. En CABA, Venezuela" |
| P1 | poblacion, pobreza | f-adolescentes-nse, f-censo | "Población sin obra social ni prepaga" y "Sin obra social, prepaga ni plan estatal" | Son dos columnas distintas del Censo (`pct_pob_solo_cobertura_publica` y `sin_cobertura`) con nombres casi iguales. Los artículos usan una tercera fórmula | Un nombre fijo por variable ("Solo cobertura pública" y "Sin ninguna cobertura"), con la diferencia en el glosario |
| P1 | pobreza | f-internet | "119,9 accesos cada 100 hogares en CABA, el valor más alto" | Es la única ficha cuya clave y cuya tarjeta de En cifras son una provincia. El dato del país no está en ningún lugar (no hay fila 00). La aclaración sobre empresas se repite tres veces | Calcular el total del país para la clave y la línea "País". La aclaración, solo en la nota |
| P1 | pobreza | f-ingresos-aglomerados | "En el primer trimestre de 2026, la mitad de las personas" | Se juntan cuatro trimestres, hasta el primero de 2026, en pesos de ese trimestre. El texto lo atribuye todo a un solo trimestre | "En los cuatro trimestres hasta el primero de 2026, en pesos de ese trimestre…" |
| P1 | pobreza | Para entender | "La sección combina tres fuentes" | La página usa cinco: EPH, Censo, ENACOM, Boletín de la Seguridad Social y proyecciones del INDEC | Sacar el número o nombrar las cinco |
| P1 | pobreza | f-pensiones-invalidez | "¿Cuántas personas cobran una pensión por discapacidad?" | La pregunta dice discapacidad y el sub y la fuente dicen invalidez. El texto no dice que bajaron (1,18 millones de promedio en 2025, 1,15 millones en mayo de 2026, −3,0%) | "Invalidez" en todo y la variación en el texto |
| P1 | salud | f-suicidio-prov | "Entre Ríos registró la tasa más alta … y Río Negro la más baja" | Barras de mayor a menor con los extremos nombrados. Choca con "sin rankings" (el perfil ya las excluye por eso) | Que decida el autor. Orden alfabético o mapa, y texto sin superlativos ("las tasas provinciales van de 6,5 a 20,8") |
| P1 | salud | f-causas-infantiles | "malformaciones congénitas (correlación de 0,57) … tiende a ser más alta" | Una correlación que el gráfico no muestra, sin aviso de que no prueba causa. Cuarta oración, de 40 palabras | A la nota, con "que se muevan juntas no prueba que una cause la otra", o a un artículo |
| P1 | poblacion | f-adolescentes-nse | "la relación es fuerte (correlación de 0,79)" | Cruce sin aviso de correlación. Cuatro coeficientes en una oración. Repite la pregunta del artículo enlazado | Reescritura en B2. Ficha o artículo, no los dos con la misma pregunta |
| P1 | poblacion | f-adolescentes | "En 2012, 15,5 de cada 100 … de 117.386 en 2013" | Mezcla 2012 y 2013 sin decir que 2013 es el máximo. El sub dice "2012 y 2024" | "Bajaron 69,9% desde el máximo de 117.386 en 2013 hasta 35.292 en 2024" |
| P1 | salud | f-causas-muerte | "Después vienen las enfermedades respiratorias" | "Después" remite a la clave, no a lo que dice el texto. La pregunta es por causa y la vista inicial es la tasa total | Reescritura en B2 |
| P1 | salud | intro | "resumen cómo funciona el sistema de salud" | Afirma una causa. Las dos medidas también dependen de las condiciones de vida (lo dice el artículo de cloacas) | B2 |
| P1 | salud | h1 | "¿Cuánto vivimos y de qué nos morimos antes de tiempo?" | "Antes de tiempo" es vago y no describe la página. La portada usa otra pregunta | B |
| P1 | educacion | f-escolarizacion | "sin contar La Pampa, donde la tasa llega casi al 100%" | El gráfico pone primera a La Pampa y el texto dice Neuquén. "Subió en 23 de 24", pero el verde y el rojo cruzan el quiebre de serie de 2022. No dice qué provincia bajó | Marcar La Pampa en el gráfico. Nombrar la provincia que bajó. Evaluar comparar 2022 con 2025 |
| P1 | educacion | f-salario-docente | "incluye una suma extraordinaria de 600.000 pesos" | La barra deja segunda a Santiago del Estero (1,89 M) por un pago único. El gráfico dice lo que el texto desmiente | La barra sin el pago extra y el extra en otro tono, o rotulado |
| P1 | educacion, diagnostico | pies y Para entender | "Ministerio de Educación" / "Ministerio de Capital Humano" / "Secretaría de Educación" | Tres nombres para el mismo organismo. Desde diciembre de 2023 es una secretaría de Capital Humano | El nombre vigente cuando se publicó el dato, igual en todos lados |
| P1 | diagnostico | h1 y f-diagnostico | "Diagnóstico educativo" / "Diagnóstico de educación por provincia" | Ni la página ni la ficha tienen pregunta. La pregunta quedó como bajada | B |
| P1 | diagnostico | f-diagnostico | "No dice qué hacer ni explica por qué cada provincia está donde está" | Está tres veces: texto, recuadro "Qué no dice" y "Para entender" | Dejarla solo en el recuadro. En el texto, qué hace la herramienta |
| P1 | migraciones | f-extranjeros | "con documento argentino" | Se lee como ciudadanía, pero el RENAPER cuenta DNI de residentes extranjeros. Una oración de 45 palabras con dos aclaraciones | Pregunta en B y texto en B2 |
| P1 | pobreza | f-censo | "¿Cuántos hogares tienen cloacas, agua de red y computadora?" | El selector suma NBI y cobertura de salud (de personas), que la pregunta no cubre. La cobertura de salud está acá y no en Salud | Pregunta en B. Mover la cobertura a Salud |
| P2 | poblacion | f-jubilaciones | "pasan de 5,3 en 2026 a 4,2 en 2040" | Repite la ficha anterior | Cortarla o enlazar a f-envejecimiento |
| P2 | poblacion | f-haberes | "con los refuerzos" … "con adicionales" | Dos nombres para lo mismo en el mismo texto | "con el bono (refuerzo)" la primera vez y "con bono" después |
| P2 | poblacion | f-nacimientos | "46,8% menos que los 777.012 de 2014" | El gráfico usa base 2012 = 100 (Argentina 56). Hay dos bases | "desde el máximo de 2014", o la base del gráfico en 2014 |
| P2 | poblacion | f-piramide | "tiene menos de 34 años, aproximadamente" | Adverbio al final. Repite En cifras | "La edad mediana es de unos 34 años." Empezar por los menores de 15 |
| P2 | poblacion | intro | "menos personas en edad de trabajar por cada jubilado" | Tener 65 o más no es lo mismo que estar jubilado (lo dice la nota) | "por cada persona mayor" |
| P2 | poblacion | Para entender | "Censo 2022. Historia de los censos, Censo 2022. Historia, INDEC" | La fuente está repetida | "INDEC, Censo 2022: historia de los censos" |
| P2 | poblacion | f-poblacion-proy | texto de 60 palabras | La última oración tiene tres ideas | B2 |
| P2 | migraciones | f-migracion-interna, f-migracion-historia | "En todo el país, el 4,2% había nacido en otro país" | El 4,2% aparece cuatro veces en la página | Sacarlo de los dos textos |
| P2 | migraciones | f-migracion-historia | "el 65,9% de las que declararon su país" | En cifras (Paraguay 27,0%) incluye a quienes no declararon país. Dos denominadores | Uno solo, o aclararlo en los dos lugares |
| P2 | migraciones | f-radicaciones | "resolvió a favor un 18,6% menos de trámites" | El sujeto queda lejos. Pregunta con "residencia" y pie con "radicación". Llega a 2024: verificar si la DNM ya publicó 2025 | B2 y un solo término |
| P2 | migraciones | intro | 70 palabras en dos oraciones | Índice en prosa. Falta el refugio | B2 |
| P2 | salud | f-muertes | "En 2024 la Justicia registró 228 víctimas directas de femicidio" | El resto del texto es 2025. "Por cada homicidio hubo 3,1 suicidios" enmarca el suicidio como dato llamativo | "último dato del registro". Evaluar sacar la razón (pautas de la OMS para medios) |
| P2 | salud | f-suicidio | nota de unas 85 palabras | Cinco ideas y una subordinada que demora la principal | B2 |
| P2 | salud | f-edad | "2017 a 2024" | Las demás fichas de suicidio llegan a 2025 | Decir en la nota que la base SAT llega a 2024 |
| P2 | salud | En cifras | "79,1 contra 73,4, 2022" | El año queda suelto al final | "5,7 años más viven las mujeres que los varones: 79,1 contra 73,4 en 2022" |
| P2 | salud | f-causas-muerte | sub con cuatro comas | Demasiado cargado | "Muertes por año cada 100.000 habitantes, ajustadas por edad, por provincia, 2022 a 2024" |
| P2 | educacion | f-aprender | "En lengua, el 76,9% …" | El gráfico abre en matemática y el texto empieza por lengua | Empezar por matemática por provincia y cerrar con lengua |
| P2 | educacion | f-inversion-educativa | "Suma lo que gastan las provincias" | Oración sin sujeto. El pie dice "Banco Mundial, deflactor del PBI", pero el dato es del INDEC y la regla reserva el BM a la OCDE | "La cifra suma…" y "deflactor del PBI del INDEC, vía Banco Mundial" |
| P2 | educacion | Programas, FinEs 2 | "beneficia a las dos partes" | Juicio de valor sin atribuir, en un tema político | "Según la evaluación, …" |
| P2 | educacion | intro | "Primero… Después… Al final…" | Índice en prosa | B2 |
| P2 | pobreza | f-ingresos-aglomerados | "(185,2% …) … (68,0%). La más alta es 2,7 veces la más baja" | Tres formas de decir la misma distancia. "Ciudad de Buenos Aires" y "Partidos del GBA" en lugar de CABA y Gran Buenos Aires | Dejar solo "2,7 veces" y los nombres del resto del sitio |
| P2 | pobreza | f-pobreza | "Un año antes … la pobreza era del 31,6%" | El lector tiene que restar para ver que subió | "Subió 0,7 puntos frente al primer semestre de 2025 (31,6%)" |
| P2 | pobreza | f-auh | sub de 22 palabras | "y asignaciones familiares de los menores del país" confunde. Cobran los titulares, no los chicos | Sub: "Chicos con AUH por provincia, cada 100 menores de 18 años". Texto: "recibían la AUH" |
| P2 | pobreza | f-pensiones-invalidez | pie sin "DESCARGAR IMAGEN" | Es la única ficha del grupo sin imagen | Agregarla o decir por qué falta |
| P2 | diagnostico | f-diagnostico | "Aprender 2025, Ministerio de Educación Ver la ficha" | Fuente y enlace pegados. "DiNIEE" sin explicar | "Fuente: Aprender 2025. Ver la ficha." Desarrollar la sigla |
| P2 | index | Herramientas | "Para hacerles preguntas a los datos, cruzar indicadores, armar tu propio ranking…" | Siete acciones en una oración de 35 palabras | B2 |
| P2 | index | Temas, Historias, Herramientas | "Consultar pobreza por aglomerado, partido y comuna" | Migraciones, Sector privado, Construcción, Cuentas públicas, Petróleo y gas, el consultor y la Corte no tienen pregunta | B |
| P2 | todas | En cifras | Educación: las cuatro tarjetas son las cuatro claves | El diseño repite las claves de abajo, así que el lector ve la misma cifra dos o tres veces | Usar cifras `x-` que no estén en ninguna clave, o sacar la clave que ya está arriba |
| P2 | pobreza, educacion | nombres | "Ciudad de Buenos Aires", "la Ciudad", "CABA" | Tres nombres para la misma jurisdicción | "CABA" en gráficos y textos, el nombre completo una vez en el glosario |

## B) Reescrituras de preguntas y h1

**h1**
- Población: "¿Cuántos chicos nacen y qué tan rápido envejece la población?" → "¿Qué tan rápido envejece la población?" (igual a la portada)
- Migraciones: "¿Cuántas personas nacieron en otro país y cuántos argentinos viven afuera?" → "¿Cuántas personas nacidas en otro país viven en la Argentina?" (usarla también en la portada, donde hoy no tiene pregunta)
- Salud: "¿Cuánto vivimos y de qué nos morimos antes de tiempo?" → "¿Cuánto se vive y de qué se muere en cada provincia?"
- Educación: "¿Cuántos chicos aprenden lo esperado y cuánto se invierte en su educación?" → "¿Cuántos chicos aprenden lo esperado en cada provincia?"
- Pobreza: "¿Cuántas personas no llegan a cubrir lo básico y qué servicios tienen los hogares?" → "¿Cuántas personas no llegan a cubrir lo básico?"
- Diagnóstico: "Diagnóstico educativo" → "¿Dónde está cada provincia en educación?" (lo que hoy es el h1 pasa a ser la etiqueta del tema)

**Fichas y tarjetas**
- Destacados de la portada: "¿Cuántos años se vive en cada provincia?" → "¿Cuántos años se vive en la Argentina?" · "¿Cuántas víctimas de homicidio hay en cada provincia?" → "¿Cuántas víctimas de homicidio hay en el país?" · "¿Dónde se gana más en un empleo privado registrado?" → "¿Cuánto se gana en un empleo privado registrado?"
- Consultor (portada): "Consultar pobreza por aglomerado, partido y comuna" → "¿Cuánta pobreza hay en cada partido y comuna?"
- Corte (portada): "La Corte Suprema: quién designó a cada juez" → "¿Cuántos jueces de la Corte designó cada presidente?"
- f-nacidos-otro-pais → "¿Qué parte de cada provincia nació en otro país?"
- f-extranjeros → "¿Cuántas personas nacidas en otro país tienen DNI argentino?"
- f-jubilaciones → "¿Cuántas personas aportan por cada jubilación o pensión?"
- f-haberes → "¿Qué parte de un salario cobra un jubilado?"
- f-adolescentes → "¿Cuántos de cada 100 bebés tienen madres menores de 20 años?"
- f-adolescentes-nse → "¿Cuánto se relaciona la maternidad adolescente con las carencias de cada provincia?"
- f-causas-muerte → "¿Cuánta gente muere en cada provincia y por qué causa?"
- f-aprender → "¿Cuántos chicos de 6° grado aprenden lo esperado en matemática y lengua?"
- f-pisa → "¿A cuántos puntos está la Argentina del promedio de la OCDE en PISA?"
- f-inversion-educativa → "¿Cuánto se invierte por alumno de escuela estatal en cada provincia?"
- f-ingresos-aglomerados → "¿Cuánto ingresa por mes cada integrante de un hogar en cada ciudad?"
- f-censo → "¿Cuántos hogares tienen cloacas, agua de red, internet y computadora?" (y la cobertura de salud a Salud)
- f-pensiones-invalidez → "¿Cuántas personas cobran una pensión por invalidez?"
- f-auh → "¿Cuántos chicos reciben la Asignación Universal por Hijo?"
- f-diagnostico → "¿Qué lugar ocupa cada provincia en cada tema educativo?"

**B2) Reescrituras con el criterio de Scott Adams.** Las cifras siguen saliendo del resumen. Acá las pongo para que se entienda el ejemplo.
- Intro de Migraciones: "Esta página cuenta quién llega, quién se va y quién se muda. Empieza por el Censo 2022: cuántos nacieron en otro país y dónde viven. Sigue con los documentos, las residencias y el refugio. Termina con los argentinos que viven afuera."
- Intro de Educación: "Esta página sigue a los chicos por la escuela. Primero, cuántos van a la secundaria. Después, cuánto aprenden en Aprender y en PISA. Al final, cuánto cobra un maestro y cuánto se invierte por alumno."
- Intro de Población: "Cuando nacen menos chicos, en unos años hay menos alumnos. Más adelante hay menos personas en edad de trabajar por cada persona mayor. Quién llega de otros países está en Migraciones."
- Intro de Salud: "La esperanza de vida y la mortalidad infantil son las medidas más usadas para comparar la salud de una población. Dependen del sistema de salud y de las condiciones de vida. Las muertes viales, los homicidios y los suicidios se pueden prevenir."
- Herramientas (portada): "Herramientas para preguntar, cruzar, comparar y bajar los datos. Cada número muestra de dónde sale."
- f-poblacion-proy: "CABA es la única jurisdicción que pierde habitantes hasta 2040: unas 144.000 personas (−4,7%). Misiones es la que más crece (+9,5%). Buenos Aires, Santa Fe y Santa Cruz crecen menos que el país. Por eso Buenos Aires baja del 37,6% al 37,1% de la población."
- f-adolescentes-nse: "Las provincias con más madres adolescentes suelen tener peores indicadores sociales. La relación más fuerte es con la población sin obra social ni prepaga (0,79). Con los adultos con secundario completo es inversa (−0,72). Que dos datos se muevan juntos no prueba que uno cause el otro."
- f-causas-infantiles: "Entre 2022 y 2024 murieron 11.364 bebés antes de cumplir un año. Más de la mitad (53,3%) murió por afecciones perinatales, como la prematurez. Uno de cada cuatro (27,2%), por malformaciones congénitas. Las causas más ligadas a las condiciones de vida sumaron el 9,9%."
- f-causas-muerte: "Ajustada por edad, la mortalidad va de 614 muertes cada 100.000 habitantes en CABA a 1.141 en Chaco. Sin ajustar, CABA queda primera (997) porque tiene la población más envejecida. Después del corazón vienen las enfermedades respiratorias (19,5%) y los tumores (16,6%)."
- f-extranjeros: "El RENAPER registra 2.367.573 personas nacidas en otro país con DNI argentino. Son 22,5% más que las que contó el Censo 2022. El RENAPER usa el domicilio del DNI, que puede estar desactualizado. El Censo cuenta a quien vive en cada vivienda. CABA tiene la proporción más alta: 19,4 cada 100 habitantes."
- f-escolarizacion: "En 2011 estaba en la secundaria el 81,2% de los adolescentes en edad de cursarla. Desde entonces la tasa subió en 23 de las 24 jurisdicciones. Parte de la suba viene del cambio de población de referencia en 2022. En 2025 la más baja fue Misiones (78,6%). La Pampa supera lo posible por diferencias entre matrícula y población."
- f-radicaciones: "En 2024 Migraciones otorgó 66.510 residencias permanentes y 68.244 temporarias. Fueron 18,6% menos que en 2023. Desde 2019, el máximo fue 2021 (198.969) y el mínimo, 2020 (88.018), el año de la pandemia."
- f-ingresos-aglomerados: "En los cuatro trimestres hasta el primero de 2026, la mitad de las personas de los 31 aglomerados vivía con hasta 500.000 pesos por mes por integrante. La mediana más alta fue la de CABA (926.000). La más baja, la de Concordia (340.000). La primera es 2,7 veces la segunda."
- Nota de f-suicidio: "El SNIC registra hechos con intervención policial o judicial. Parte de la variación entre años puede venir de cambios en el registro. La DEIS cuenta las defunciones con otro método y da otras cifras. Esta tasa se calcula sobre las personas de 5 años y más, como pide la OMS. La de homicidios usa toda la población. Por eso se comparan cantidades, no tasas. Hay tasas por sexo desde 2017."

## C) Orden y largo por página

A 390 píxeles una pantalla son unos 800 de alto.

- **Portada** (6.994 px, unas 9 pantallas). El orden está bien: destacados, temas, provincias, historias, herramientas. No hacen falta pestañas. Faltan preguntas en seis tarjetas, y los destacados tienen que responder lo que preguntan.
- **Población** (13.097 px, unas 16 pantallas, 8 fichas). La historia se corta: madres adolescentes queda al final, lejos de los nacimientos. Orden propuesto: nacimientos, madres adolescentes, pirámide, proyección por provincia, envejecimiento, aportantes, haberes. Haberes encaja mejor en Pobreza y hogares, con las otras transferencias. El cruce de madres adolescentes puede quedar solo como artículo. Índice de anclas, sin pestañas.
- **Migraciones** (12.297 px, unas 15 pantallas, 7 fichas). Las dos medidas del stock (Censo y RENAPER) están separadas. Orden propuesto: dónde viven, DNI, historia, residencias, refugio, argentinos afuera y, al final, migración interna, que es otro tema. Índice de anclas.
- **Salud** (13.854 px, unas 17 pantallas, 8 fichas). El orden es lógico. Falta un subtítulo de causas externas antes de las líneas de ayuda. Evaluar unir la tasa nacional de suicidio y la provincial en una ficha con dos vistas, sin tocar la regla de las líneas de ayuda. Índice de anclas, sin pestañas de página.
- **Educación** (13.149 px, unas 16 pantallas, 5 fichas más Programas). El orden va bien: acceso, aprendizaje, comparación internacional, recursos. Falta un enlace al Diagnóstico educativo junto a Aprender. Índice de anclas.
- **Pobreza y hogares** (12.417 px, unas 15 pantallas, 6 fichas). La secuencia sirve. Internet aparece dos veces, por ENACOM y por el Censo: juntarlas o ponerlas una al lado de la otra. Índice de anclas.
- **Diagnóstico** (5.849 px, unas 7 pantallas). Está bien de largo y no necesita pestañas. Solo hay que sacar la advertencia repetida.

En general no recomiendo pestañas: cada ficha tiene su enlace y el buscador necesita encontrarla. Un índice de anclas debajo de En cifras alcanza.

## D) Preguntas nuevas por sección

**Población**
- ¿Cuántos habitantes tiene cada provincia? INDEC, proyecciones 2022-2040. Alta
- ¿Cuántos hijos tiene en promedio cada mujer en cada provincia? DEIS y proyecciones del INDEC. Hoy solo aparece en la pestaña OCDE. Alta
- ¿En qué provincias nacen menos personas de las que mueren? DEIS, estadísticas vitales. Media
- ¿Cuántas personas mayores viven solas? Censo 2022. Media
- ¿Cuántas personas se reconocen indígenas o afrodescendientes en cada provincia? Censo 2022. Media

**Migraciones**
- ¿Cuántas personas se mudaron de provincia en los últimos cinco años? Censo 2022, si publicó la residencia anterior. Alta
- ¿Cuándo llegaron al país las personas nacidas en otro país? Censo 2022, año de llegada. Media
- ¿Cuántas personas nacidas en otro país trabajan, y con qué empleo? EPH, lugar de nacimiento. Media
- ¿Cuántos estudiantes de otros países hay en las universidades? Departamento de Información Universitaria. Media
- ¿Cuántas residencias se cancelaron o terminaron en expulsión? DNM, si lo publica. Baja

**Salud**
- ¿Cuánta gente tiene obra social, prepaga o solo el hospital público? Censo 2022. Hoy está en Pobreza. Alta
- ¿Cuántos médicos hay por habitante en cada provincia? Observatorio Federal de Recursos Humanos en Salud (REFEPS). Alta
- ¿Qué parte de los chicos tiene las vacunas del calendario? Ministerio de Salud, Dirección de Control de Enfermedades Inmunoprevenibles. Alta
- ¿Cuántas mujeres mueren por causas del embarazo y el parto? DEIS, mortalidad materna. Alta
- ¿Cuántos adultos tienen obesidad o fuman? Encuesta Nacional de Factores de Riesgo (INDEC y Ministerio de Salud). Media
- ¿Cuántos casos de dengue hubo en cada provincia? Boletín Epidemiológico Nacional. Media
- El embarazo adolescente ya está en Población. Falta el enlace desde Salud, no la ficha.

**Educación**
- ¿Cuántos chicos terminan la secundaria en el tiempo esperado? DiNIEE, Relevamiento Anual. Alta
- ¿Cuántos chicos de 3° grado leen lo esperado? Estudio Nacional de Fluidez Lectora, Secretaría de Educación. Alta
- ¿Cuántos chicos de 4 y 5 años van al jardín? DiNIEE y proyecciones del INDEC. Media
- ¿Cuántos alumnos van a escuelas privadas en cada provincia? DiNIEE. Media
- ¿Cuántas escuelas tienen jornada extendida o completa? DiNIEE. Media
- ¿Cuántos estudiantes universitarios hay en cada provincia? Departamento de Información Universitaria. Media

**Pobreza y hogares**
- ¿Cuánta pobreza hay en cada región y en cada aglomerado? INDEC, informe semestral de la EPH. Hoy solo está en el consultor. Alta
- ¿Cuántos chicos viven en hogares pobres? INDEC, pobreza por grupo de edad. Alta
- ¿Qué tan desigual es el ingreso en cada ciudad? INDEC, distribución del ingreso de la EPH (Gini). Hoy solo hay una pestaña OCDE. Alta
- ¿Cuánto necesita una familia por mes para no ser pobre? INDEC, canasta básica total. Ya está en Precios y actividad: falta el enlace. Alta
- ¿Cuánto les falta a los hogares pobres para dejar de serlo? INDEC, brecha de pobreza. Media
- ¿Cuántas familias viven en barrios populares? RENABAP. Media

## E) Los cinco hallazgos más importantes

1. Dos fichas muestran un número en el gráfico y otro en el texto sin explicar por qué: envejecimiento (2026 contra 2040) y esperanza de vida (total contra mujeres).
2. El texto de mortalidad infantil abre con 2023 (8,0) y esconde que la tasa subió a 8,5 en 2024.
3. Las pestañas OCDE cambian de indicador sin avisar, como el gasto en salud dentro de mortalidad infantil o la pobreza relativa junto a la pobreza por ingresos.
4. Dos variables distintas de cobertura de salud tienen nombres casi iguales, una en Población y otra en Pobreza, y Salud no tiene ninguna ficha de cobertura.
5. Suicidio por provincia está ordenado de mayor a menor y nombra la tasa más alta y la más baja, en tensión con la regla "sin rankings". Esa decisión es del autor.

Lo que revisé está en `C:\Users\GCBA\Aplicación desarrollo\argentina-en-datos\sitio\datos\` (`envejecimiento_provincias.csv`, `esperanza_vida_provincias.csv`, `pisa_argentina_ocde.csv`, `nacidos_otro_pais_provincias.csv`, `internet_fijo_provincias.csv`, `pensiones_invalidez_provincias.csv`, `censo2022_provincias.csv`, `madres_adolescentes_nse.csv`, `tabla_larga.csv`) y en `C:\Users\GCBA\Aplicación desarrollo\argentina-en-datos\scripts\datina.js`.
