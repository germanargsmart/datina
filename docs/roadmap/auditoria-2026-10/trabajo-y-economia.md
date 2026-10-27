# Revisión editorial: Trabajo, Precios y actividad, Sector privado, Construcción y vivienda, Cuentas públicas, Sector externo y Turismo

Solo lectura. No toqué ningún archivo del repositorio. Las cifras dudosas las verifiqué en `sitio/datos/*.csv`, `datos/crudo/oede_empresas_provincias.xlsx`, `scripts/datina.js`, `scripts/02_procesar.py` y `datos/manual/explicadores.json`.

## A) Hallazgos por gravedad

| Grav. | Página | Ficha | Cita | Qué está mal | Propuesta |
|---|---|---|---|---|---|
| P0 | Sector privado | f-empresas y En cifras | "609.664 / en todo el país, 13,1 cada 1.000 habitantes" | Es la suma de las 24 provincias (fila Total del cuadro 1 del OEDE). La nota del propio OEDE y la "empresas-nota" de datina.js dicen que esa suma cuenta varias veces a las empresas con personal en más de una provincia (el cuadro 2 registra 90.484 presencias de empresas no locales). El total real del país es menor. El 13,1 del país sale inflado y las comparaciones con él ("3,4 veces") pierden sentido | Clave con el dato por provincia, o el total nacional sin doble conteo que publica el OEDE. Si queda la suma: "Sumadas las provincias, 609.664 empresas. Las que operan en varias cuentan en cada una" |
| P0 | Cuentas públicas | f-fiscal | "Recursos propios, resultado fiscal y gasto en personal por provincia, 2025" | La Pampa es de 2024 (fiscal_provincias.csv, anio 2024) y ni la barra ni la fiscal-nota lo dicen. Entra en la mediana de 40,3% y en el conteo de superávit y déficit | Rótulo "La Pampa (2024)" en la barra y una línea en la nota, o sacarla como en f-impuestos-provinciales |
| P0 | Precios y actividad | f-inflacion | "¿Cuánto suben los precios en cada región?" | La pregunta promete regiones y la clave y el lead hablan solo del país. El dato está: Noreste 36,9% y Patagonia 30,3% en doce meses | Sumar al lead "Por región, de 30,3% en la Patagonia a 36,9% en el Noreste", o preguntar "¿Cuánto suben los precios?" |
| P0 | Precios y actividad | f-bcra | "22,0% / nominal anual en plazos fijos a 30 días" | La clave habla del plazo fijo y el gráfico y el lead abren con el dólar minorista (1.550 pesos) | Clave que cambie con la variable elegida, o abrir el selector en plazo fijo |
| P0 | Precios y actividad | f-canastas | "1.632.505 pesos / por mes, la canasta básica total de un hogar de cuatro integrantes" | El gráfico de abajo muestra otra unidad y otro mes: pesos por adulto equivalente, junio (GBA 495.622). Ni el eje ni el sub lo dicen | Sub "Canasta básica total por adulto equivalente y región, junio de 2026", o graficar el hogar tipo |
| P0 | Precios y actividad | f-supermercados | "3,7% / cayeron en el país en agosto de 2026" | El gráfico dice "País −2,7%" (doce meses contra doce). Dos cifras del país en la misma ficha | Clave con el corte del gráfico: "2,7% cayeron las ventas en los doce meses hasta agosto" |
| P0 | Trabajo y Precios | f-salarios y f-salario-real | "el salario del país bajó 1,3%" / "2,3% bajó el salario privado" | Dos caídas del mismo salario privado registrado descontada la inflación, con fuente (OEDE e INDEC) y mes (mayo y agosto) distintos, sin aviso entre páginas | Una oración en cada lead que nombre la otra cifra, su fuente y su mes, con enlace |
| P0 | Sector privado | intro | "Y una guía de los datos del sitio que muestran necesidades sin resolver y mercados que crecen." | Esa guía no existe en la página (plantilla.html línea 529). Promete contenido que no está | Borrar la oración |
| P0 | Turismo | intro | "ocupación de los hoteles y viajes por los pasos internacionales" | No hay ficha de ocupación (f-hoteles cuenta viajeros) ni de pasos de frontera | Reescribir (ver B2) |
| P0 | Sector externo | f-destinos y f-origen | "12,6% / a Brasil, el primer destino del país" | La primera barra es "Resto del mundo 12,9%", arriba de Brasil. En f-origen "Resto del mundo" queda tercero | Llevar los agregados "Resto..." al final del orden |
| P1 | Trabajo | página entera | H3 "Actividad, desocupación e informalidad" | Confirmado en todo el volcado: ninguna ficha muestra desocupación ni informalidad. La página explica los dos conceptos y no los muestra. La única desocupación visible es el botón "OCDE: DESOCUPACIÓN, 2025" (estimación del Banco Mundial). El sitio ya tiene desocupación y empleo por aglomerado en capitales_eph.csv, usados solo en artículos | Ficha nueva de la EPH, primera de la página (ver D) |
| P1 | Trabajo | h1 | "¿Dónde se crea empleo formal y cuánto se gana en cada provincia?" | "Se crea" presupone creación. El empleo cayó 2,0% y creció en 3 de 24 | Ver B |
| P1 | Trabajo | Para entender, Qué se mide | "Esta sección reúne dos miradas sobre la economía de cada provincia." | Texto viejo: habla de empleo y exportaciones y la página tiene cinco fichas | "La sección reúne el empleo registrado, los salarios, la antigüedad en el empleo y el seguro de desempleo." |
| P1 | Trabajo | f-empleo | "CABA 48,0" | Cuenta por dónde declara la empresa, no por dónde vive la persona. Solo lo aclara el explicador del final | Una oración en el lead: "En CABA cuentan muchas personas que viven en el Gran Buenos Aires." |
| P1 | Trabajo | f-empleo | "POR PROVINCIA / OCDE: TASA DE EMPLEO, 2025 / OCDE: DESOCUPACIÓN, 2025" | Cinco botones en dos filas. La tasa de empleo y la desocupación de la OCDE miden otra cosa que los asalariados registrados cada 100 habitantes | Dejar dos botones y llevar la comparación OCDE a la ficha nueva de desocupación |
| P1 | Trabajo | f-desempleo | "por provincia, cada 1.000 habitantes, frente al empleo y en cantidad, y del país, 2001 a 2026" | El sub enumera las vistas en vez de describir el dato. No tiene clave. El título dice "seguro" y el texto, "prestación" | Sub "Personas que cobran el seguro de desempleo por provincia, mayo de 2026". Clave "2,5 cada 1.000 habitantes" |
| P1 | Trabajo | f-rotacion | "En el otro extremo, el 50,5% de las personas asalariadas..." | Lead de unas 100 palabras y 13 cifras que arranca refiriéndose a la clave. El sub dice "2025 y 2026" | Ver B2. Sub "segundo trimestre de 2025 a primer trimestre de 2026". Ocho opciones en el selector: sacar "Generación", que repite "Edad" |
| P1 | Trabajo | f-exportaciones | "¿Cuánto le vende al mundo cada provincia?" | Misma fuente y año que f-exporta-provincias de Sector externo, cuya intro manda al lector a Trabajo. El lead mezcla 2025 (el gráfico) con el primer semestre de 2026 ("subieron en 23 de las 24") | Llevarla a Sector externo como vista "Por habitante" de f-exporta-provincias |
| P1 | Precios y actividad | h1 | "¿Cuánto suben los precios y cuánto alcanza lo que se gana?" | Ninguna ficha compara salario con canasta. La página también trae actividad, consumo y el BCRA | Ver B |
| P1 | Precios y actividad | f-expectativas y f-bcra | "Inflación esperada para los próximos 12 meses (REM)" | Dos expectativas de inflación en una página. La ficha usa la encuesta de la UTDT (privada) y la fuente oficial, el REM del BCRA, queda escondida entre 49 variables. El REM mide lo que esperan los analistas, no "la gente" | Sumar el REM como segunda línea de f-expectativas, rotulada "Lo que esperan los analistas (REM del BCRA)", y sacarlo del selector |
| P1 | Precios y actividad | f-bcra | "TM20 de bancos privados" "Comunicación P 14.290" "Ley 27.802 (art. 55 a)" | 49 variables, siglas sin explicar (TAMAR, BADLAR, BAIBAR, CER, UVI, ICL) y pares ambiguos: "Préstamos personales" (tasa) y "Personales en pesos" (saldo), "Plazo fijo en dólares" y "Plazos fijos en dólares del sector privado", "Base monetaria" y "Base monetaria, serie histórica" | Diez variables por defecto, con nombres que digan si es tasa o saldo ("Tasa de...", "Saldo de..."). El resto, en el Catálogo |
| P1 | Precios y actividad | f-salario-real | "¿Cuánto cambió el poder de compra de los salarios?" | Muestra solo salarios registrados. El índice del INDEC también publica el no registrado | Pregunta con "registrados", o sumar la serie no registrada |
| P1 | Sistémico | Precios, Construcción | "descontada la inflación" / "en pesos de igual valor" / "a precios de hoy" / "en pesos del mismo valor" | Cuatro nombres para lo mismo | Uno solo: "descontada la inflación" y, si hace falta, "en pesos de septiembre de 2026" |
| P1 | Sistémico | f-recaudacion, f-balanza, f-eti (y los P0 de f-canastas y f-supermercados) | "21,5% / del PBI fue la recaudación de impuestos nacionales en 2025" | La clave tiene un período o una medida y el gráfico otra: recaudación anual 2025 contra composición a septiembre de 2026, saldo enero a agosto de 2026 contra serie 1992 a 2025, CABA en cantidad contra gráfico cada 1.000 | Misma medida y período en clave, sub y vista inicial |
| P1 | Construcción | f-empleo-construccion y f-trabajadores | "CABA 27,2" / "CABA 3,9%" | Dos fichas casi iguales que ordenan al revés (SIPA por empresa, Censo por residencia) sin explicarlo | Una ficha con dos vistas y una oración que diga por qué difieren |
| P1 | Construcción | f-costo y En cifras | "12,9% / menos que los precios al consumidor subió el costo de construir" | Ambigua (no se sabe si son puntos o porcentaje) y omite que el índice es solo del Gran Buenos Aires | "Descontada la inflación, construir en el Gran Buenos Aires cuesta 12,9% menos que en diciembre de 2016." |
| P1 | Construcción | f-obra-publica | "737 mil millones / de pesos invirtió la Nación... El máximo desde 2000 fue de 13.225 mil millones" | Clave de dos oraciones, no dice de qué año son los pesos y esconde el dato fuerte: 94% menos que en 2010 | Clave "737 mil millones de pesos en 2025". Lead: "Descontada la inflación, es 94% menos que en 2010, el máximo desde 2000." |
| P1 | Construcción | f-vivienda | "¿Cuántos hogares alquilan o viven hacinados?" | El selector trae seis indicadores (viviendas en construcción, vacías, de uso temporal, pisos y techos) que la pregunta no cubre | Ver B. Evaluar llevarla a Pobreza y hogares |
| P1 | Cuentas públicas | intro | "Después, cuánto se recauda de cada impuesto nacional, cuánto debe el Estado nacional, cuántos cargos..." | Una oración de unas 60 palabras | Ver B2 |
| P1 | Cuentas públicas | f-fiscal | "de los ingresos de la provincia del medio fueron recursos propios" | 40,3% es el promedio entre Río Negro (40,5) y Entre Ríos (40,0): ninguna provincia lo tiene. "El resto llega de la Nación" se repite en clave y lead | "La mitad de las provincias financia menos del 40,3% de sus ingresos con recursos propios." Sacar la repetición |
| P1 | Cuentas públicas | f-impuestos-provinciales | "las provincias y la Ciudad recaudaron 41,7 billones de pesos" | El total excluye a La Pampa | "Las 23 jurisdicciones con datos recaudaron..." |
| P1 | Cuentas públicas | f-cuentas-nacion | "el resultado primario del año fue un superávit de 13,7 billones de pesos" | El lead pasa de % del PBI a billones de pesos corrientes sin aviso | Dar 2026 también en % del PBI, o decir "pesos corrientes" |
| P1 | Cuentas públicas | f-deuda | "la deuda bruta de la Administración Central sumaba 474.198 millones" | No dice que una parte es deuda con otros organismos del Estado (BCRA, FGS) | Una oración, o una vista por acreedor (la Secretaría de Finanzas lo publica) |
| P1 | Cuentas públicas | intro | "Las transferencias de la Nación a las provincias están en Instituciones políticas" | Allá solo están las no automáticas y los ATN. La coparticipación, la mayor transferencia, no tiene ficha en ninguna página del volcado: solo aparece en explicadores y en el lead de f-fiscal | Ficha de coparticipación por provincia (ver D) |
| P1 | Sector externo | página entera | (no hay "Para entender los datos") | Única página del grupo sin explicadores ni "Cómo se calcula", y la de más jerga: ingreso primario, complejo, reservas netas, formato del FMI | Explicadores sobre balanza del INDEC y balance de pagos, FOB y CIF, reservas netas |
| P1 | Sector externo | f-cuenta-corriente | "el ingreso primario de 14.079 millones en contra" | Jerga, y el gráfico lo llama "Rentas". Los bienes dan 15.359 acá y 11.320 en f-balanza para el mismo 2025, sin explicación | "Intereses y utilidades pagados al exterior". Una oración sobre por qué difieren las dos balanzas |
| P1 | Sector externo | f-cuenta-corriente | "¿Entran más dólares de los que salen?" | La cuenta corriente no es todo lo que entra y sale: falta la cuenta financiera. En 2025 dio déficit y las reservas subieron igual | Ver B |
| P1 | Sistémico | Sector externo | "entre enero y agosto" / "primer semestre de 2026" / "enero a septiembre de 2026" | Cuatro cortes para el comercio en la misma página, más el +24,6% de Trabajo | Un corte común, o decir en el sub por qué difieren |
| P1 | Sector externo | f-reservas-netas | "las netas, 7.465 millones, el 16,2%" | No dice de qué es el 16,2%. No tiene clave | "el 16,2% de las brutas". Clave "7.465 millones de dólares" |
| P1 | Sector externo | f-reservas-bcra y f-reservas-netas | "50,2 mil millones... el 21 de octubre" / "46.092 millones" a fin de septiembre | Dos preguntas casi iguales y dos reservas brutas distintas una al lado de la otra | Una sola ficha con vistas "Brutas", "Netas" y "Qué las movió" |
| P1 | Sector externo | f-complejos | "el que más creció... fue el complejo litio: +186,3%" | El gráfico no tiene barra de litio: va dentro de "Minero metalífero y litio" | Mostrar litio aparte o decir "el litio, dentro del complejo minero" |
| P1 | Sector externo | f-destinos | "Con una provincia elegida, el gráfico muestra sus destinos." | Instrucción de interfaz en el lead, y la página no tiene "Tu provincia" para elegirla | Sacar la frase y sumar el enlace a provincia.html |
| P1 | Turismo | f-eti | "1.780.066 / visitaron CABA, la jurisdicción con más turistas" | El gráfico abre cada 1.000 habitantes, con Tierra del Fuego primero | Abrir en "Cantidad de turistas", o clave por habitante |
| P1 | Turismo | pies de f-receptivo, f-hoteles y f-eti | "Ministerio de Turismo y Deportes" | La eti-nota del propio sitio dice "Secretaría de Turismo" | Usar en los tres pies el nombre vigente del organismo |
| P1 | Sector privado | f-dinamica-empresas | "la de salida, de 10,7% sobre el total de empresas" | Las tasas se calculan sobre las empresas locales (unas 502.000), no sobre las 609.664 de la ficha anterior. 53.706 sobre 609.664 daría 8,8% | "sobre las empresas locales". "El cambio neto fue de −2,5 puntos" |
| P2 | Sistémico | las siete | En cifras | "En cifras" repite las claves. En Precios el 33,4% aparece cinco veces (En cifras, clave, rubros, expectativas y la barra de nivel general) | En cifras con datos que no estén en las claves, o sacar la repetición de los leads |
| P2 | Sistémico | f-empresas, f-empleo-construccion | "(menos de la mitad del promedio del país)" | Formosa 4,5 sobre 13,1 es un tercio. La Rioja 2,5 sobre 8,6, menos de un tercio | "un tercio del promedio" |
| P2 | Sistémico | f-desempleo, f-expectativas, f-confianza-consumidor, f-reservas-netas | (sin clave) | Rompen el patrón de la cifra destacada | Sumar clave |
| P2 | Sistémico | Sector externo | "18.249 M" / "87,1 mil millones" / "7.788 M" | Tres formatos para millones de dólares | Uno solo: "18.249 millones de dólares" |
| P2 | Precios y actividad | f-inflacion-rubros | "RUBROS / CATEGORÍAS" | "Categorías" no dice qué muestra (núcleo, regulados, estacionales) | Botón "Regulados y estacionales" |
| P2 | Precios y actividad | f-supermercados | "con los precios de los bienes de cada región" | Opaco | "descontada la inflación de cada región" |
| P2 | Precios y actividad | f-emae | "Sin estacionalidad 149,9" | Índice sin base | "Índice, 2004 = 100" |
| P2 | Precios y actividad | f-bcra | "A PRECIOS DE HOY" | En el dólar es un tipo de cambio real y en una tasa no tiene sentido | "Descontada la inflación", solo en variables en pesos |
| P2 | Sector externo | f-exporta-rubros | "Agroindustria / Industria" | El gráfico y el lead usan nombres distintos para lo mismo (MOA y MOI) | Unificar |
| P2 | Construcción | f-insumos | "El consumo aparente de cemento portland varió −2,3%." | "Varió −" y "consumo aparente". La barra "Resto (grifería...)" encabeza el ranking | "El cemento cayó 2,3%." "Resto" al final |
| P2 | Construcción | f-hipotecas | "contra 7.499 en 2018, el año con más créditos, y 141 en 2022" | Cifras sin unidad | "7.499 mil millones de pesos de septiembre de 2026" |
| P2 | Turismo | f-receptivo | "¿Cuántos turistas extranjeros llegan al país?" | El dato es "no residentes", que incluye argentinos que viven afuera. El botón OCDE es de 2019 | "del exterior". Comparación más reciente |
| P2 | Trabajo | intro | "es el primer termómetro de una economía provincial" | Valoración sin dato | Sacarla |
| P2 | Cuentas públicas | f-empleo-publico | "y dotación de la administración nacional" | Jerga | "y empleados de la administración nacional" |
| P2 | Sector privado y Trabajo | pies | "OEDE, Ministerio de Capital Humano" / "OEDE, Secretaría de Trabajo" | Mismo organismo con dos nombres | Unificar |

Sin hallazgos de punto y coma ni de "y" delante del sonido i en las siete páginas.

## B) Reescrituras de preguntas y h1 (antes → después)

h1:
- Trabajo: "¿Dónde se crea empleo formal y cuánto se gana en cada provincia?" → "¿Cuánto trabajo hay en cada provincia y cuánto se gana?" (con la ficha de desocupación) o "¿Cuánto empleo formal hay en cada provincia y cuánto se gana?" (sin ella)
- Precios y actividad: "¿Cuánto suben los precios y cuánto alcanza lo que se gana?" → "¿Cuánto suben los precios y cómo viene la actividad?"
- Sector privado: queda igual.
- Construcción y vivienda: "¿Cuánto se construye, cuánto cuesta y cuántos hogares alquilan?" → "¿Cuánto se construye y cuánto cuesta construir?" (si f-vivienda pasa a Pobreza y hogares). Si se queda: "¿Cuánto se construye y cuántos hogares alquilan?"
- Cuentas públicas: "¿Cuánto recauda y cuánto gasta el Estado, y cuánto debe?" → "¿Cuánto recauda, gasta y debe el Estado?"
- Sector externo: "¿Qué le vende y qué le compra la Argentina al mundo?" → "¿Cuánto le vende y le compra la Argentina al mundo?"
- Turismo: "¿Cuántos turistas llegan y a qué provincias van?" → "¿Cuántos turistas del exterior llegan y a qué provincias van?"

Fichas:
- f-rotacion: "¿Cuántos asalariados llevan un año o menos en su empleo?" → "¿Qué parte de los asalariados lleva un año o menos en su empleo?"
- f-desempleo: "¿Cuántas personas cobran el seguro de desempleo?" → "¿Cuántas personas cobran el seguro de desempleo en cada provincia?"
- f-exportaciones (a Sector externo): → "¿Cuánto exporta cada provincia por habitante?"
- f-inflacion: "¿Cuánto suben los precios en cada región?" → "¿Cuánto suben los precios?" (o dejarla y arreglar el lead)
- f-expectativas: "¿Cuánta inflación espera la gente para el año siguiente?" → "¿Cuánta inflación espera la gente para los próximos doce meses?"
- f-canastas: "¿Cuánto necesita un hogar para cubrir lo básico?" → "¿Cuánto necesita un hogar por mes para no ser pobre?"
- f-salario-real: "¿Cuánto cambió el poder de compra de los salarios?" → "¿Cuánto cambió el poder de compra de los salarios registrados?"
- f-bcra (recortada): "¿Cuánto cambiaron el dólar, las tasas y el dinero?" → "¿Cuánto cuesta el dólar y cuánto paga un plazo fijo?"
- f-empleo-construccion y f-trabajadores (fusionadas): → "¿Cuántas personas trabajan en la construcción en cada provincia?", con vistas "Registradas" y "Con o sin registro (Censo)"
- f-vivienda: "¿Cuántos hogares alquilan o viven hacinados?" → "¿Qué parte de los hogares alquila o vive hacinada?", y las tres medidas de viviendas en una vista aparte
- f-empleo-publico: "¿Cuántos cargos públicos tiene cada provincia?" → "¿Cuántos empleados públicos tiene cada provincia por habitante?"
- f-fiscal: "¿Cuánto financia cada provincia con recursos propios?" → "¿Qué parte de sus ingresos recauda cada provincia por su cuenta?"
- f-balanza: "¿Cuánto vende y cuánto compra la Argentina?" (repite el h1) → "¿Cuánto deja a favor o en contra el comercio de bienes?"
- f-destinos: "¿Adónde exporta cada provincia?" → "¿Adónde exporta la Argentina?" (la provincia, como vista)
- f-cuenta-corriente: "¿Entran más dólares de los que salen?" → "¿Cuántos dólares le sobran o le faltan al país en su intercambio con el mundo?"
- f-reservas-netas (si no se fusiona): "¿Cuántas reservas netas tiene el Banco Central?" → "¿Cuántas reservas le quedan al Banco Central después de lo que debe pagar en un año?"
- f-receptivo: "¿Cuántos turistas extranjeros llegan al país?" → "¿Cuántos turistas del exterior llegan al país?"

## B2) Reescrituras de leads e intros (criterio Adams, solo con cifras que ya están en el sitio)

- Intro Trabajo: "Cuánto empleo registrado hay en cada provincia, cuánto se gana y cuánto dura un empleo. También, cuántas personas cobran el seguro de desempleo. Las finanzas de cada provincia están en Cuentas públicas."
- Intro Precios y actividad (90 palabras → 45): "Primero, la inflación en el país, en cada región y en cada rubro. Después, la canasta que marca la pobreza y los salarios descontada la inflación. Luego, la actividad económica. Al final, el dólar, las tasas y el dinero. Los salarios por provincia están en Trabajo."
- Intro Sector privado: "Cuántas empresas con empleados hay en cada provincia y cuántas abren y cierran cada año."
- Intro Cuentas públicas: "Primero, las cuentas de la Nación: cuánto ingresa, cuánto gasta y cuánto debe. Después, las provincias: cuántos empleados tienen, cuánto recaudan y qué parte de sus ingresos es propia. Las transferencias no automáticas están en Instituciones políticas. Los subsidios a la energía, en Energía."
- Intro Sector externo: "Qué vende y qué compra la Argentina, a qué países y desde qué provincias. Después, el saldo de las cuentas con el mundo y las reservas del Banco Central. El dólar y las tasas están en Precios y actividad."
- Intro Turismo: "Cuántos turistas del exterior llegan, cuántos viajeros se alojan en hoteles y qué provincias visitan los extranjeros."
- f-rotacion: "El 50,5% de los asalariados lleva más de cinco años en su empleo. Llevar un año o menos es más común entre los menores de 25 años (42,5%). También en el empleo sin descuento jubilatorio: 33,6%, contra 8,3% en el registrado. En el sector privado es 20,3% y en el Estado, 5,7%." (Quintiles, tamaño y calificación ya están en el selector.)
- f-exportaciones: "Neuquén exportó 8.965 dólares por habitante, 4,8 veces el promedio. Formosa exportó 47. En total, el país vendió 87.111 millones de dólares en bienes en 2025. En el primer semestre de 2026 las ventas subieron 24,6%, con datos provisorios."
- f-canastas: "La canasta básica total marca la línea de pobreza. La alimentaria marca la de indigencia: 738.690 pesos por mes para el mismo hogar. El hogar tipo del INDEC lo forman un varón de 35 años, una mujer de 31, un hijo de 6 y una hija de 8. En junio de 2026, por adulto equivalente, la canasta total iba de 397.842 pesos en el Noroeste a 577.633 en la Patagonia."
- f-salario-real: "El salario público registrado bajó 2,4% en el mismo período. Sin descontar la inflación, el privado subió 30,4% y el público, 30,3%. Los precios subieron 33,5%. Frente a diciembre de 2016, el privado vale 19,6% menos y el público, 33,9% menos."
- f-emae: "Frente a julio, y sin el efecto de la época del año, la actividad subió 0,1%. En lo que va de 2026 creció 1,2%. En 2025 creció 4,5%."
- f-isac: "Entre enero y agosto de 2026, la construcción creció 0,8% contra el mismo período de 2025. Frente a julio, sin el efecto de la época del año, subió 0,4%. El índice está 32,8% por debajo de su máximo, de noviembre de 2017."
- f-hipotecas: "Descontada la inflación, en septiembre de 2026 se prestó 35,7% menos que un año antes. La tasa promedio fue de 6,8% anual más la UVA. En 2025 se prestaron 5.831 mil millones de pesos de septiembre de 2026. El récord fue 2018, con 7.499 mil millones, y el piso, 2022, con 141 mil millones."
- f-cuentas-nacion: "En 2025, el Estado nacional tuvo ingresos por el 15,9% del PBI y gastó el 14,5% sin contar intereses. Los intereses costaron 1,2% del PBI. Después de pagarlos quedó un superávit de 0,2%. El peor año desde 2016 fue 2020, con un déficit de 8,4%. Hasta septiembre de 2026, el superávit primario sumó 13,7 billones de pesos corrientes."
- f-importaciones: "En 2025, los bienes intermedios fueron el 32,1% de lo importado. Las piezas y los bienes de capital, el 19,9% cada uno. Los bienes de consumo, el 15,0%. Frente a 2024, las compras de consumo subieron 54,0% y las de autos, 97,6%."
- f-reservas-netas: "A fin de septiembre de 2026, las reservas netas eran 7.465 millones de dólares, el 16,2% de las brutas. Un año antes eran 1.624 millones. Fueron negativas por última vez en junio de 2026."

## C) Orden y largo por página (alto a 390 px, una pantalla son unos 800 px)

- Trabajo (5 fichas, 10.381 px, unas 13 pantallas): el orden empleo, salario, rotación, seguro y exportaciones no cuenta la historia completa porque falta la desocupación, que debería abrir la página. Exportaciones sobra. Sin pestañas: con la ficha nueva y sin exportaciones alcanza un índice corto arriba.
- Precios y actividad (9 fichas, 14.317 px, unas 18 pantallas): mezcla precios, ingresos, actividad y finanzas. Pide pestañas: Precios (inflación, rubros, expectativas, canastas), Ingresos (salario real), Actividad (EMAE, supermercados, confianza). El selector del BCRA no es una ficha sino una herramienta: llevarlo a una página propia de dinero y crédito, que también resolvería el hueco del crédito por provincia (ver D).
- Sector privado (2 fichas, 5.953 px): demasiado flaca para ser página. El Excel del OEDE ya descargado trae empresas por sector (cuadro 1) y por tamaño (cuadro 3). Sumarlas, o unir la página a Trabajo.
- Construcción y vivienda (9 fichas, 15.393 px, unas 19 pantallas): la más larga del grupo. Pide pestañas: Actividad (ISAC, permisos, insumos, obra pública), Empleo (las dos fichas fusionadas), Costo y crédito (costo, hipotecas), Vivienda (censo). La obra pública de la Nación encaja mejor en Cuentas públicas.
- Cuentas públicas (6 fichas, 11.468 px, unas 14 pantallas): orden lógico, de la Nación a las provincias. Dos bloques claros: un índice con "Nación" y "Provincias" alcanza, sin pestañas. Falta la coparticipación.
- Sector externo (10 fichas, 14.406 px, unas 18 pantallas): pide pestañas: Comercio (balanza, rubros, complejos, importaciones, origen), Provincias (destinos, exporta por provincia, más la ficha que viene de Trabajo), Cuentas y reservas (cuenta corriente, reservas fusionadas). Le falta "Para entender los datos".
- Turismo (3 fichas, 7.187 px): corta y bien ordenada. Sin pestañas. Dos de sus tres encuestas están en pausa: le falta el turismo interno, que es la mayor parte.

## D) Preguntas nuevas por sección

Trabajo
- ¿Cuánta desocupación hay en cada aglomerado? INDEC, EPH (ya está en capitales_eph.csv). Alta
- ¿Qué parte de los asalariados no tiene descuento jubilatorio? INDEC, EPH, mercado de trabajo. Alta
- ¿Cuánto es el salario mínimo y cuánto compra? Secretaría de Trabajo (Consejo del Salario) frente a la canasta del INDEC. Alta
- ¿Cuánto ganan los asalariados sin registro? INDEC, índice de salarios (sector no registrado). Media
- ¿Cuántos monotributistas, empleadas de casas particulares y empleados públicos hay en cada provincia? Secretaría de Trabajo, situación y evolución del trabajo registrado (SIPA por modalidad). Media
- ¿Cuántos dólares vale el salario promedio? OEDE frente al dólar mayorista del BCRA. Media

Precios y actividad
- ¿Cuántos salarios mínimos cuesta la canasta básica total? INDEC y Secretaría de Trabajo. Alta
- ¿Cuánto produce cada provincia por habitante? INDEC y CEPAL, desagregación provincial del valor agregado bruto. Alta
- ¿Cuánto crédito reciben las familias y las empresas de cada provincia? BCRA, préstamos y depósitos por provincia. Alta
- ¿Subieron más los precios regulados o los servicios que los bienes? INDEC, IPC por categoría y por bienes y servicios. Media
- ¿Cuánto vale el peso frente a las monedas de los socios comerciales? BCRA, tipo de cambio real multilateral. Media
- ¿Cuánto produce la industria? INDEC, índice de producción industrial manufacturero. Media

Sector privado
- ¿En qué sectores están las empresas de cada provincia? OEDE, cuadro 1 (ya descargado). Alta
- ¿Cuántas empresas de cada tamaño hay en cada provincia? OEDE, cuadro 3 (ya descargado). Alta
- ¿En qué sectores cierran más empresas? OEDE, cuadros 6 y 7. Media
- ¿Cuántos empleados tiene la empresa promedio de cada provincia? OEDE y SIPA. Media
- ¿Cuántos cheques se rechazan por falta de fondos? BCRA, central de cheques rechazados. Baja

Construcción y vivienda
- ¿Cuántos hogares viven en viviendas deficitarias o comparten vivienda en cada provincia? INDEC, Censo 2022. Alta
- ¿Cuántos créditos hipotecarios se dan en cada provincia? BCRA, préstamos por jurisdicción. Media
- ¿Cuántos trabajadores de la construcción no están registrados? INDEC, EPH. Media
- ¿Cuánto subieron los alquileres frente a los salarios? BCRA, ICL, frente al índice de salarios del INDEC. Media
- ¿Cuántos barrios populares hay en cada provincia? RENABAP. Media

Cuentas públicas
- ¿Cuánto recibe cada provincia por coparticipación? Ministerio de Economía, DNAP, transferencias automáticas. Alta
- ¿Cuánto debe cada provincia? Ministerio de Economía, DNAP, stock de deuda provincial. Alta
- ¿Cuánto de lo que se produce se paga en impuestos? Ministerio de Economía, DNIAF, presión tributaria consolidada de Nación, provincias y municipios. Alta
- ¿A quién le debe el Estado nacional? Secretaría de Finanzas, deuda por acreedor. Alta
- ¿Cuánto recauda ARCA en cada provincia? ARCA, anuario estadístico. Media
- ¿Cuánto gasta cada provincia por habitante? DNAP, esquema ahorro inversión. Media

Sector externo
- ¿Cuántos dólares compran las personas para ahorrar? BCRA, balance cambiario. Alta
- ¿Cuánta inversión extranjera directa entra? INDEC, balance de pagos. Media
- ¿Cuánto gastan los argentinos en viajes al exterior? INDEC, balance de pagos (viajes). Media
- ¿Suben o bajan los precios de lo que exporta la Argentina? INDEC, índices de precios y cantidades del comercio exterior. Media
- ¿Cuánto deben las empresas privadas al exterior? INDEC, deuda externa. Baja

Turismo
- ¿Cuántos argentinos viajan dentro del país y adónde? INDEC y Secretaría de Turismo, Encuesta de Viajes y Turismo de los Hogares. Alta
- ¿Cuántos argentinos viajan al exterior? Secretaría de Turismo, SINTA. Alta
- ¿Cuántos turistas cruzan por cada paso de frontera? Dirección Nacional de Migraciones y SINTA. Media (es lo que la intro ya promete)
- ¿Cuánto gastan los turistas extranjeros? INDEC, ETI y balance de pagos. Media
- ¿Qué parte de las plazas hoteleras se ocupa en cada región? INDEC, EOH (hasta 2024). Baja

## E) Los cinco hallazgos más importantes

1. Sector privado presenta 609.664 empresas "en todo el país", pero es la suma provincial que el propio OEDE advierte que cuenta dos veces a las empresas con personal en varias provincias.
2. Trabajo no muestra ni desocupación ni informalidad, aunque las explica al final y el sitio ya tiene la desocupación por aglomerado: la única tasa visible es una estimación del Banco Mundial en un botón OCDE.
3. Cuentas públicas mezcla La Pampa de 2024 en un gráfico fechado 2025, sin aviso, y esa barra entra en la mediana.
4. En seis fichas la clave no corresponde a lo que muestra el gráfico (f-bcra, f-canastas, f-supermercados, f-recaudacion, f-balanza, f-eti), y f-inflacion pregunta por regiones sin nombrar ninguna.
5. El mismo salario privado registrado, descontada la inflación, cae 1,3% en Trabajo y 2,3% en Precios y actividad, sin que ninguna ficha avise.

Aparte de los cinco: Sector externo, la página con más jerga, es la única del grupo sin "Para entender los datos".
