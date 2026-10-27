# Textos y cuestiones pendientes de la reescritura editorial

Lo que cada grupo de la reescritura no cambió porque necesita corregir un dato, cambiar una vista o la estructura, una decisión del autor o verificar un hecho. Sale de `docs/redaccion/propuestas/*.json` (generado por `scripts/inventario_textos.py`).

## Personas y bienestar (23)

1. **salud.html#f-suicidio-prov** (`scripts/datina.js`)
   - Fragmento: «"suicidio-prov": `${s.top} registró la tasa más alta, con ${n1(s.top_tasa)} suicidios por cada 100.000 habitantes de 5 años y más, y ${s.low} la más baja»
   - Motivo: Barras de mayor a menor con los extremos nombrados: tensión con la regla "sin rankings" (el perfil provincial ya excluye estas tasas por eso). Decisión del autor.
   - Propuesta: Orden alfabético o mapa, y un texto sin superlativos: "Las tasas provinciales iban de ${n1(s.low_tasa)} a ${n1(s.top_tasa)} suicidios por cada 100.000 habitantes de 5 años y más. La tasa nacional fue ${n1(s.tasa)}."

2. **salud.html#f-muertes** (`scripts/datina.js`)
   - Fragmento: «Por cada homicidio hubo ${n1(s.razon_hom)} suicidios. Desde ${s.anio_cruce} los suicidios superan cada año a las muertes viales.»
   - Motivo: Las dos comparaciones presentan el suicidio como dato llamativo. Las pautas de la OMS para comunicar sobre suicidio recomiendan evitarlo. Sacarlas cambia la lectura de la ficha: decide el autor.
   - Propuesta: Dejar solo las tres cantidades del SNIC y el dato de femicidios, o reemplazar las dos oraciones por "Las tres series son cantidades de víctimas del mismo registro del SNIC."

3. **salud.html#f-mortalidad** (`scripts/datina.js`)
   - Fragmento: «"f-mortalidad": ["mortalidad", "Por provincia", ["gasto_salud"]], y OCDE_BOTON gasto_salud: "Gasto en salud"»
   - Motivo: Para G6b: la pestaña "OCDE: Gasto en salud, 2023" muestra otro indicador (% del PBI) dentro de una ficha de mortalidad infantil, sin aviso.
   - Propuesta: Sacar la pestaña de esta ficha o, si queda, que el botón diga "OCDE: gasto en salud, % del PBI" y que OCDE_NOTA sume "No es la mortalidad infantil: compara cuánto gasta cada país en salud."

4. **poblacion.html#f-nacimientos, poblacion.html#f-adolescentes, educacion.html#f-escolarizacion, pobreza.html#f-pobreza, pobreza.html#f-internet** (`scripts/datina.js`)
   - Fragmento: «OCDE_BOTON = {fecundidad: "Hijos por mujer", fecundidad_adolescente: "Fecundidad adolescente", gasto_salud: "Gasto en salud", secundaria: "Terminan el ciclo básico", ... pobreza_relativa: "Pobreza relativa", gini: "Gini", internet: "Uso de internet"»
   - Motivo: Para G6b: las pestañas OCDE de G1 cambian de medida y de unidad (hijos por mujer, nacimientos cada 1.000 mujeres de 15 a 19, % que termina el ciclo básico, pobreza relativa, Gini, uso de internet por persona) y no avisan que no es la medida de la vista principal. Solo pobreza relativa y suicidio lo dicen en OCDE_NOTA.
   - Propuesta: Sumar a OCDE_NOTA de fecundidad, fecundidad_adolescente, secundaria, gini e internet una oración del tipo "Es otra medida que la de la vista principal de esta ficha: [qué mide]." Por ejemplo, internet: "Cuenta personas que usaron internet, no accesos fijos por hogar como ENACOM."

5. **index.html (dato destacado) y salud.html#f-esperanza** (`scripts/plantilla.html`)
   - Fragmento: «<h2>¿Cuántos años se vive en cada provincia?</h2>»
   - Motivo: Para G6b: DESTACADOS de 03_construir_sitio.py usa el h2 de f-esperanza como pregunta del destacado de la portada, que muestra la cifra del país. Cambiar el h2 cambia el destacado.
   - Propuesta: Si G6b cambia la pregunta del destacado ("¿Cuántos años se vive en la Argentina?"), que el destacado tenga una pregunta propia en DESTACADOS en lugar de leer el h2, y el h2 de la ficha quede como está.

6. **pobreza.html#f-censo** (`scripts/plantilla.html`)
   - Fragmento: «<option value="sin_cobertura">Sin obra social, prepaga ni plan estatal</option>»
   - Motivo: La cobertura de salud está en Pobreza y hogares y no en Salud, y es la única opción del selector que cuenta personas. Mover o partir la ficha es un cambio de estructura.
   - Propuesta: Una ficha de cobertura de salud en Salud ("¿Cuánta gente tiene solo el hospital público?") con esta variable, y sacar la opción de f-censo.

7. **poblacion.html#f-adolescentes-nse** (`scripts/02_procesar.py`)
   - Fragmento: «NSE_IND = {"pct_pob_solo_cobertura_publica": "Población sin obra social ni prepaga"»
   - Motivo: Es la misma variable que sin_cobertura (P19 = 3 del Censo, mismos valores en las dos tablas), con otro nombre que omite el plan estatal. El rótulo viene de los datos (punto R14 del plan).
   - Propuesta: Rótulo "Población sin obra social, prepaga ni plan estatal" en NSE_IND y en el catálogo de variables (línea 5994), como en f-censo y en los textos de G1.

8. **salud.html#f-causas-infantiles** (`scripts/02_procesar.py`)
   - Fragmento: «grupos de mi_causas: "Infecciosas y parasitarias"»
   - Motivo: El rótulo viene de los datos y en el texto queda "la mortalidad por infecciosas y parasitarias", sin sustantivo.
   - Propuesta: Rótulo "Enfermedades infecciosas y parasitarias" en el resumen (R14), como en CM_FRASE.

9. **salud.html#f-causas-infantiles** (`scripts/datina.js`)
   - Fragmento: «const fuertes = gr.filter(x => Math.abs(x.r_cobertura) >= .4)»
   - Motivo: El texto dice "tiende a ser más alta" para todas las correlaciones fuertes, pero el filtro también deja pasar las negativas. Hoy las dos son positivas. Corregirlo es lógica, no redacción.
   - Propuesta: Filtrar solo las positivas para esa oración, o elegir "más alta" o "más baja" según el signo de cada una.

10. **poblacion.html#f-envejecimiento** (`scripts/02_procesar.py`)
   - Fragmento: «"envejecimiento": {... "max": "CABA", "max_v": 29.9, "min": "Tierra del Fuego", "min_v": 11.4 ...}»
   - Motivo: El gráfico rotula y ordena por el último año (CABA 33,4, Misiones 16,8 abajo) y el resumen solo tiene los extremos del primero. El texto ya nombra los dos años, pero no puede citar los del último.
   - Propuesta: Sumar max_fin, max_fin_v, min_fin y min_fin_v al resumen y cerrar el texto con "En ${EV.anio_fin}, ${EV.max_fin} (${n1(EV.max_fin_v)}) y ${EV.min_fin} (${n1(EV.min_fin_v)})."

11. **migraciones.html#f-nacidos-otro-pais** (`scripts/02_procesar.py`)
   - Fragmento: «"primer_pais_n": 7»
   - Motivo: Por jurisdicción, Chile es el primer país de nacimiento en 8, Paraguay en 7 y Bolivia en 6 (CSV): el resumen solo cuenta las del primero del total.
   - Propuesta: Sumar al resumen la cuenta por país (por ejemplo primer_pais_cuenta: [["Chile", 8], ["Paraguay", 7], ["Bolivia", 6]]) y decir "Por jurisdicción, Chile es el primero en 8, Paraguay en 7 y Bolivia en 6".

12. **educacion.html#f-pisa** (`scripts/02_procesar.py`)
   - Fragmento: «"dif_mat": 95»
   - Motivo: La diferencia sale de valores sin redondear (472,4 menos 377,5) y no coincide con la resta de las cifras que se ven (94). El texto ya no la usa.
   - Propuesta: Si se quiere volver a mostrarla, calcularla en 02 con los puntajes redondeados que muestra el sitio.

13. **educacion.html#f-escolarizacion** (`scripts/datina.js`)
   - Fragmento: «Desde entonces, la tasa subió ${deLas24(es.suben)}»
   - Motivo: El texto no dice qué provincia bajó (no está en el resumen), y el verde y el rojo comparan años que cruzan el quiebre de serie de 2022.
   - Propuesta: Sumar al resumen la provincia que bajó y evaluar comparar desde el primer año con la misma población de referencia (como hace el Diagnóstico), o marcar a La Pampa en el gráfico.

14. **educacion.html#f-salario-docente** (`scripts/datina.js`)
   - Fragmento: «barrasH(el, {anim: a, data: T.salario_docente.filter(r => r.codigo_indec !== "00"), k: "bruto"»
   - Motivo: La barra de Santiago del Estero queda segunda por un pago único. El texto ya avisa que la barra lo incluye.
   - Propuesta: Dibujar la barra sin la suma extraordinaria y el extra en otro tono, rotulado.

15. **poblacion.html#f-haberes** (`scripts/plantilla.html`)
   - Fragmento: «<button type="button" data-m="real" aria-pressed="false">A precios de hoy</button>»
   - Motivo: La tabla de términos fijos pide "descontada la inflación", pero ese renglón es idéntico al del botón de f-bcra (otro grupo): no hay un fragmento de una línea que cambie solo el de f-haberes.
   - Propuesta: Cambiar los dos botones a "Descontada la inflación" en un mismo cambio, junto con el grupo de f-bcra, y la referencia entre comillas de la nota de haberes ("A precios de hoy" descuenta la inflación...).

16. **pobreza.html#f-internet** (`scripts/datina.js`)
   - Fragmento: «"f-internet": [n1(nv.in_top_v), `accesos a internet fijo cada 100 hogares en ${nv.in_top}, el valor más alto»
   - Motivo: Es la única ficha cuya cifra destacada y cuya tarjeta de En cifras son una provincia: el dato del país no está (no hay fila 00). La aclaración de los accesos de empresas aparece en la cifra, en el texto y en la nota.
   - Propuesta: Calcular el total del país en 02 (accesos del país sobre hogares del país) para la cifra y la línea "País". Con eso, la aclaración de ENACOM queda solo en la nota.

17. **pobreza.html#f-pobreza** (`scripts/plantilla.html`)
   - Fragmento: «<p class="nota" data-t="pobreza-nota"></p>
      <p class="lead" data-t="pobreza"></p>»
   - Motivo: Es la única ficha de G1 con la nota antes del texto. Cambiar el orden es estructura.
   - Propuesta: Poner el texto antes de la nota, como en las demás fichas.

18. **pobreza.html#f-pensiones-invalidez** (`scripts/datina.js`)
   - Fragmento: «pie de f-pensiones-invalidez»
   - Motivo: La auditoría señala que es la única ficha del grupo sin "Descargar imagen". Es comportamiento, no redacción.
   - Propuesta: Revisar por qué el mapa no ofrece la imagen y sumarla, o decir por qué falta.

19. **poblacion.html, migraciones.html, salud.html** (`scripts/plantilla.html`)
   - Fragmento: «orden de las fichas»
   - Motivo: La auditoría propone otro orden (Población: madres adolescentes junto a nacimientos. Migraciones: Censo y RENAPER juntos, migración interna al final) y un índice de anclas. Es estructura.
   - Propuesta: Ver la sección C de docs/roadmap/auditoria-2026-10/personas-y-bienestar.md.

20. **poblacion.html#f-adolescentes-nse** (`scripts/plantilla.html`)
   - Fragmento: «<h2>¿Hay más madres adolescentes en las provincias con más carencias?</h2>»
   - Motivo: La ficha y el artículo "¿Hay más madres adolescentes donde menos gente tiene obra social o prepaga?" responden casi lo mismo. Unir o sacar una es estructura.
   - Propuesta: Dejar el cruce solo como artículo y enlazarlo desde f-adolescentes.

21. **educacion.html#f-salario-docente y #f-inversion-educativa** (`scripts/plantilla.html`)
   - Fragmento: «Coordinación de Evaluación de Costos Educativos, Secretaría de Educación»
   - Motivo: Los pies dicen "Coordinación de Evaluación de Costos Educativos" y la fuente del explicador "Coordinación General de Estudio de Costos del Sistema Educativo" (CGECSE). No pude verificar cuál es el nombre vigente.
   - Propuesta: Verificar el nombre en la página del organismo y usar uno solo en pies, explicador y relaciones.json.

22. **educacion.html#f-pisa** (`scripts/plantilla.html`)
   - Fragmento: «OCDE, Programa para la Evaluación Internacional de Alumnos (PISA)»
   - Motivo: El pie dice "de Alumnos" y el explicador "de Estudiantes". Los dos nombres circulan en español: hace falta elegir uno.
   - Propuesta: Usar el nombre que usa la Secretaría de Educación ("Programa para la Evaluación Internacional de Estudiantes") en el pie y sumar ese alias en relaciones.json.

23. **pobreza.html#f-ingresos-aglomerados** (`scripts/datina.js`)
   - Fragmento: «conArt(E.max, true)»
   - Motivo: La auditoría pide usar CABA y Gran Buenos Aires, pero los nombres vienen de la tabla de aglomerados del INDEC ("Ciudad de Buenos Aires", "Partidos del GBA").
   - Propuesta: Si el autor prefiere CABA en el texto, usar IA_CORTO también en el texto (ya lo usa el gráfico angosto).

## Trabajo y economía (36)

1. **empresas.html#f-empresas** (`scripts/datina.js`)
   - Fragmento: «"f-empresas": [n0(EM.total_pais),»
   - Motivo: Dato (E2 del plan): 609.664 es la fila Total del cuadro 1 del OEDE, que suma las provincias y cuenta varias veces a las empresas con personal en más de una (verificado en datos/crudo/oede_empresas_provincias.xlsx: la suma de las 25 filas da 609.664). También el 13,1 cada 1.000 y la línea «País 13,1» del gráfico. El texto ya dice «sumadas las 24 jurisdicciones».
   - Propuesta: Usar el total nacional sin doble conteo que publique el OEDE (o la suma de empresas locales de los cuadros 6 y 7) y cambiar refLab «País» por ese promedio. Si no hay otro dato, rotular la línea «Suma de las provincias».

2. **empresas.html#f-empresas** (`scripts/datina.js`)
   - Fragmento: «const conVeces = (v, pais) =>»
   - Motivo: conVeces (G6a) escribe «menos de la mitad del promedio del país» para 4,5 sobre 13,1 (un tercio) y para 2,5 sobre 8,6 en f-empleo-construccion. Es un ayudante de todo el sitio.
   - Propuesta: Que vecesPais diga «un tercio del promedio» o «menos de un tercio» cuando corresponda.

3. **gobierno.html#f-fiscal** (`scripts/datina.js`)
   - Fragmento: «barrasH(G("fiscal"), {anim:a, data: d, k,»
   - Motivo: La Pampa figura con 2024 en un gráfico de 2025 y entra en la mediana y en el conteo de superávit y déficit. El texto y la nota ya lo dicen, la barra no.
   - Propuesta: Rotular la barra «La Pampa (2024)» o dejarla afuera de la mediana, como en f-impuestos-provinciales.

4. **economia.html#f-bcra** (`scripts/datina.js`)
   - Fragmento: «"f-bcra": [pct(BCR_PF.v),»
   - Motivo: La cifra destacada es la tasa del plazo fijo y el selector abre en el dólar minorista (gráfico y texto del dólar).
   - Propuesta: Que la cifra cambie con la variable elegida, o que el selector abra en el plazo fijo a 30 días.

5. **economia.html#f-supermercados** (`scripts/datina.js`)
   - Fragmento: «"f-supermercados": [pct(Math.abs(ESU.interanual)),»
   - Motivo: Tres cifras del país: −3,7% en la cifra (agosto contra agosto), −2,7% en el gráfico por provincia (doce meses con la inflación de cada región) y −1,9% en la vista mes a mes (índice del INDEC). El texto ahora dice el período de cada una.
   - Propuesta: Cifra destacada con el corte del gráfico inicial: «2,7% cayeron las ventas en los doce meses hasta agosto».

6. **turismo.html#f-eti** (`scripts/plantilla.html`)
   - Fragmento: «<button type="button" data-m="cada_1000" aria-pressed="true">Cada 1.000 habitantes</button>»
   - Motivo: La cifra destacada es la cantidad de CABA y el gráfico abre cada 1.000 habitantes, con Tierra del Fuego primero. La frase de la cifra ahora dice «en cantidad».
   - Propuesta: Abrir en «Cantidad de turistas» o usar como cifra la de Tierra del Fuego por habitante.

7. **gobierno.html#f-recaudacion** (`scripts/datina.js`)
   - Fragmento: «"f-recaudacion": [pct(GRT.pbi),»
   - Motivo: La cifra es la recaudación anual de 2025 en % del PBI y la vista inicial, la composición de los doce meses hasta septiembre de 2026.
   - Propuesta: Abrir en «Año por año» o usar como cifra la recaudación de los doce meses.

8. **economia.html#f-canastas** (`scripts/datina.js`)
   - Fragmento: «DIB2 canastas: barrasH(el, {anim: a, data, k: "cbt"»
   - Motivo: La cifra es la canasta del hogar de cuatro integrantes en septiembre y el gráfico, la de un adulto equivalente por región en junio. La descripción y el texto ahora lo dicen.
   - Propuesta: Graficar el hogar tipo (cbt por 3,09 adultos equivalentes) o usar como cifra la canasta por adulto equivalente.

9. **externo.html#f-destinos** (`scripts/datina.js`)
   - Fragmento: «DIB.destinos barrasH(... filas ...)»
   - Motivo: «Resto del mundo» encabeza el gráfico de destinos (12,9%, arriba de Brasil) y es tercero en f-origen. El texto ahora dice «sin contar las zonas que agrupan varios países».
   - Propuesta: Llevar las zonas «resto...» al final del orden en f-destinos y f-origen.

10. **externo.html#f-complejos** (`scripts/datina.js`)
   - Fragmento: «DIB.complejos tip: partes.map(p => `<br>${p.complejo}: ${n0(p.millones_usd)}`)»
   - Motivo: El texto dice que el que más creció es el complejo litio (+186,3%), que no tiene barra propia y cuyo cuadro no muestra su variación.
   - Propuesta: Sumar la variación de cada complejo en el cuadro de su sector.

11. **trabajo.html#f-exportaciones** (`scripts/plantilla.html`)
   - Fragmento: «<article class="ficha" id="f-exportaciones">»
   - Motivo: Misma fuente y año que f-exporta-provincias de Sector externo. La intro de Sector externo manda al lector a Trabajo para ver lo mismo por habitante.
   - Propuesta: Llevarla a Sector externo como vista «Por habitante» de f-exporta-provincias.

12. **trabajo.html** (`scripts/plantilla.html`)
   - Fragmento: «<section class="tema con-pregunta" id="trabajo">»
   - Motivo: La página no muestra desocupación ni informalidad (el explicador las define y ahora dice que no tienen ficha). La única desocupación visible es la estimación del Banco Mundial en un botón OCDE.
   - Propuesta: Ficha nueva de la EPH (desocupación por aglomerado, ya en capitales_eph.csv), primera de la página. Después, la pregunta podría ser «¿Cuánto trabajo hay en cada provincia y cuánto se gana?».

13. **trabajo.html#f-desempleo** (`scripts/datina.js`)
   - Fragmento: «CLAVE (no hay entrada para f-desempleo)»
   - Motivo: La ficha no tiene cifra destacada, a diferencia del resto (también f-expectativas, f-confianza-consumidor y f-reservas-netas). El resumen no tiene el mes del dato por provincia en palabras para la descripción.
   - Propuesta: Sumar CLAVE: «2,5 de cada 1.000 habitantes cobraban el seguro de desempleo en mayo de 2026», y un campo desempleo.prov_mes_txt en el resumen.

14. **trabajo.html#f-rotacion** (`scripts/plantilla.html`)
   - Fragmento: «{{rotacion.anios}}»
   - Motivo: La descripción dice «2025 y 2026», pero son los cuatro trimestres del segundo de 2025 al primero de 2026. El resumen no tiene ese período en palabras. Además, «Generación» repite casi lo mismo que «Edad» en el selector.
   - Propuesta: Sumar al resumen rotacion.periodo («segundo trimestre de 2025 a primer trimestre de 2026») y usarlo en la descripción. Evaluar sacar la opción «Generación».

15. **trabajo.html#f-salarios y economia.html#f-salario-real** (`scripts/datina.js`)
   - Fragmento: «LEAD.salarios / LEAD["salario-real"]»
   - Motivo: El salario privado registrado descontada la inflación baja 1,3% en Trabajo (OEDE, mayo) y 2,3% en Precios y actividad (índice del INDEC, agosto). Las notas de las dos fichas ahora lo avisan y los textos nombran su medida, pero los textos se escriben con textContent y no admiten enlaces.
   - Propuesta: Un enlace visible entre las dos fichas (debajo del texto o en «Artículos con este dato»).

16. **economia.html#f-expectativas y #f-bcra** (`scripts/datina.js`)
   - Fragmento: «bcra_variables_lista (02_procesar.py): «Inflación esperada para los próximos 12 meses (REM)»»
   - Motivo: Dos expectativas de inflación en la página: la de la UTDT (la gente) en su ficha y la del REM (analistas) escondida entre 49 variables. La nota de f-expectativas ahora dice dónde está la otra.
   - Propuesta: Sumar el REM como segunda línea de f-expectativas («Lo que esperan los analistas») y sacarlo del selector.

17. **economia.html#f-bcra** (`scripts/02_procesar.py`)
   - Fragmento: «bcra_variables_lista: nombres de las 49 variables»
   - Motivo: 49 variables con siglas y pares ambiguos («Préstamos personales» es una tasa y «Personales en pesos», un saldo, «Base monetaria» y «Base monetaria, serie histórica»). Los nombres salen de los datos (R14).
   - Propuesta: Nombres que digan si es tasa o saldo («Tasa de...», «Saldo de...») y una lista corta por defecto, con el resto en el Catálogo.

18. **economia.html#f-emae** (`scripts/datina.js`)
   - Fragmento: «{k: "desestacionalizada", lab: "Sin estacionalidad", corto: "Actividad", c: NAR}»
   - Motivo: La leyenda muestra «Sin estacionalidad 149,9», un índice sin base. La descripción ahora dice «índice 2004 = 100».
   - Propuesta: Cambiar el rótulo de la serie a «Índice sin estacionalidad» si entra en la leyenda en 320 píxeles (lo controla prueba_320.mjs).

19. **externo.html** (`scripts/03_construir_sitio.py`)
   - Fragmento: «<!--EXPLICADOR:externo--> (no existe)»
   - Motivo: Sector externo es la única página del grupo sin «Para entender los datos», y la de más jerga (balance de pagos, ingreso primario, FOB y CIF, reservas netas). Sin ese bloque tampoco tiene «Cómo se calcula».
   - Propuesta: Explicador nuevo en explicadores.json: la balanza del INDEC y el balance de pagos, FOB y CIF, la cuenta corriente y la financiera, reservas brutas y netas.

20. **externo.html#f-reservas-bcra y #f-reservas-netas** (`scripts/plantilla.html`)
   - Fragmento: «id="f-reservas-bcra" / id="f-reservas-netas"»
   - Motivo: Dos fichas seguidas con dos reservas brutas distintas (50,2 mil millones al 21 de octubre y 46.092 millones a fin de septiembre). El texto de las netas ahora dice que es el último mes de la planilla.
   - Propuesta: Una sola ficha con las vistas «Brutas», «Netas», «De dónde salen» y «Qué las movió».

21. **externo.html** (`scripts/datina.js`)
   - Fragmento: «SX.complejos / SX.destinos / SX.balanza (cortes distintos)»
   - Motivo: La página usa cuatro cortes para el comercio: enero a agosto (balanza y rubros), primer semestre (complejos y destinos), enero a septiembre (origen) y años completos.
   - Propuesta: Un corte común o una línea en cada descripción que diga por qué difieren.

22. **construccion.html#f-empleo-construccion y #f-trabajadores** (`scripts/plantilla.html`)
   - Fragmento: «id="f-empleo-construccion" / id="f-trabajadores"»
   - Motivo: Dos fichas casi iguales que ordenan al revés a las provincias (registro por empresa y censo por residencia). El texto del censo ahora lo explica.
   - Propuesta: Una sola ficha con las vistas «Registradas» y «Con o sin registro (Censo)».

23. **construccion.html#f-vivienda** (`scripts/plantilla.html`)
   - Fragmento: «<h2>¿Qué parte de los hogares alquila o vive hacinada en cada provincia?</h2>»
   - Motivo: El selector trae seis indicadores y la pregunta cubre dos (alquiler y hacinamiento): las tres medidas de viviendas sin personas y la calidad de los materiales quedan afuera.
   - Propuesta: Partir la ficha (hogares y viviendas) o evaluar llevar la parte de hogares a Pobreza y hogares, como propone la auditoría.

24. **construccion.html#f-insumos** (`scripts/datina.js`)
   - Fragmento: «const NOMBRE_INS = n =>»
   - Motivo: Los insumos van sin artículo en el texto («el que más cayó, yeso») y la barra «Resto (grifería...)» encabeza el ranking.
   - Propuesta: NOMBRE_INS con artículo según el género y el número de cada insumo, y el grupo «Resto» al final del orden.

25. **gobierno.html** (`scripts/plantilla.html`)
   - Fragmento: «<section class="tema con-pregunta" id="gobierno">»
   - Motivo: La coparticipación, la mayor transferencia a las provincias, no tiene ficha en ninguna página. La intro ahora dice que en Instituciones políticas están solo las no automáticas.
   - Propuesta: Ficha de coparticipación por provincia (DNAP, transferencias automáticas).

26. **gobierno.html#f-deuda** (`scripts/datina.js`)
   - Fragmento: «deuda: () =>»
   - Motivo: El texto ahora dice que la deuda bruta incluye la que tiene el propio Estado, pero no cuánto: la Secretaría de Finanzas publica la deuda por acreedor.
   - Propuesta: Vista por acreedor (sector público, organismos internacionales, privados).

27. **gobierno.html#f-cuentas-nacion** (`scripts/datina.js`)
   - Fragmento: «GBN.ytd_primario»
   - Motivo: El texto da el año en curso en billones de pesos corrientes (ahora lo dice) y el resto en % del PBI. El resumen no tiene el año en curso como parte del PBI.
   - Propuesta: Sumar al resumen el resultado del año en curso en % del PBI estimado, o dejarlo en pesos.

28. **todas las fichas del grupo** (`scripts/plantilla.html`)
   - Fragmento: «Turismo: Ministerio de Turismo y Deportes / Secretaría de Turismo / Subsecretaría de Turismo»
   - Motivo: Tres nombres para el organismo de turismo en pies, notas y explicadores. relaciones.json no documenta cuál es el vigente.
   - Propuesta: Que el autor confirme el nombre vigente y unificarlo en los tres pies de Turismo, en las dos notas y en relaciones.json (alias).

29. **empresas.html, construccion.html, petroleo.html#f-empleo-hidro** (`scripts/plantilla.html`)
   - Fragmento: «Fuente: Observatorio de Empleo y Dinámica Empresarial, Ministerio de Capital Humano, en base al SIPA»
   - Motivo: El OEDE aparece como «Secretaría de Trabajo» en f-salarios y como «Ministerio de Capital Humano» en otros cuatro pies, uno de ellos en Petróleo y gas.
   - Propuesta: Unificar los cinco pies en «Observatorio de Empleo y Dinámica Empresarial (OEDE), Secretaría de Trabajo, en base al SIPA» (veces: 4), en una sola pasada para todo el sitio.

30. **turismo.html** (`scripts/plantilla.html`)
   - Fragmento: «<section class="tema con-pregunta" id="turismo">»
   - Motivo: Falta el turismo interno, que es la mayor parte, y dos de las tres encuestas están en pausa.
   - Propuesta: Ficha de la Encuesta de Viajes y Turismo de los Hogares (INDEC y Secretaría de Turismo).

31. **las siete páginas** (`scripts/datina.js`)
   - Fragmento: «EN_CIFRAS: trabajo, economia, empresas, construccion, externo, gobierno, turismo»
   - Motivo: «En cifras» repite las cifras destacadas (en Precios y actividad, el 33,4% aparece cinco veces en la página).
   - Propuesta: Llevar a «En cifras» datos que no estén en las cifras destacadas, o sacar la repetición de los textos.

32. **para G6b: trabajo.html#f-empleo, construccion.html#f-hipotecas, turismo.html#f-receptivo** (`scripts/datina.js`)
   - Fragmento: «OCDE_BOTON / OCDE_NOTA»
   - Motivo: Vistas OCDE de este grupo: f-empleo tiene dos (tasa de empleo y desocupación del Banco Mundial), que miden otra cosa que los asalariados registrados cada 100 habitantes y suman cinco botones en dos filas. En f-receptivo, la vista de 2019 muestra en la leyenda «2020» y «OCDE 71», y el texto dice 190 para 2019 (promedio) y 116 (mediana): revisar si la leyenda toma otro año o la mediana.
   - Propuesta: Revisar en G6b: llevar la desocupación OCDE a una ficha de la EPH, y corregir la leyenda de f-receptivo.

33. **para G6b: buscador (PREG)** (`scripts/datina.js`)
   - Fragmento: «["¿Cuánto da la cuenta corriente del balance de pagos?",»
   - Motivo: Las respuestas del buscador para fichas de este grupo usan los textos viejos: la cuenta corriente como «salieron más dólares de los que entraron», «en pesos de igual valor» en supermercados e hipotecas, y «¿Cuánto vende y cuánto compra la Argentina?» para f-balanza.
   - Propuesta: Alinearlas con los cambios de G2: «el saldo de bienes, servicios, rentas y transferencias», «descontada la inflación» y la pregunta nueva de f-balanza.

34. **para G6a: perfil provincial (INDP)** (`scripts/datina.js`)
   - Fragmento: «{id:"f-supermercados", g:"economia", lab:"Ventas en supermercados", det:`variación en pesos de igual valor, doce meses hasta ${ESU.mes}`,»
   - Motivo: El perfil provincial dice «en pesos de igual valor» para una ficha de este grupo.
   - Propuesta: «variación descontada la inflación, doce meses hasta ...».

35. **las siete páginas** (`scripts/03_construir_sitio.py`)
   - Fragmento: «descripción: "<Sección>: <pregunta> Datos por provincia con su fuente, su año y la tabla para descargar."»
   - Motivo: La descripción de la pestaña dice «Datos por provincia» también en Sector externo y en Precios y actividad, que son sobre todo del país.
   - Propuesta: Una frase según la sección (G6b, metadatos).

36. **para quien aplique los cambios: economia.html#f-bcra y el botón de haberes** (`scripts/plantilla.html`)
   - Fragmento: «<button type="button" data-m="real" aria-pressed="false">A precios de hoy</button>»
   - Motivo: G2 cambia solo el botón de f-bcra con un fragmento que sigue hasta su gráfico (el término fijo prohíbe «a precios de hoy»). El mismo botón, idéntico, está en la ficha de haberes (línea 937 de la plantilla, otro grupo), con su texto en datina.js («A precios de hoy» pasa los montos...). Si otro grupo lo cambia con «veces»: 2, falla después del cambio de G2.
   - Propuesta: Que el otro grupo cambie solo su botón (una vez) y, si lo pasa a «Sin inflación», también su texto en datina.js.

## Estado y sociedad (29)

1. **politica.html#f-votaciones-espacios, politica.html#f-votaciones** (`datos (votaciones_leyes_clave, bloques de 2012 y 2013)`)
   - Fragmento: «el peronismo y el PRO votaron distinto en 24 de 25; Fuerzas provinciales: 12 a favor, 22 en contra (Irán, 2013)»
   - Motivo: Error de datos E1: en YPF (2012) e Irán (2013), 11 diputados del PRO vienen con el bloque Partido Bloquista de San Juan y caen en Fuerzas provinciales. Afecta las celdas del PRO y de las provinciales, el texto del par más distinto y los cuadros. No se corrige acá.
   - Propuesta: Corregir el bloque de esas filas por nombre del legislador, volver a correr 02 y sumar a pruebas_datos.py una regla: un bloque provincial no puede tener legisladores de otra provincia.

2. **politica.html (h1 y estructura)** (`scripts/plantilla.html`)
   - Fragmento: «¿Cómo vota cada provincia y cómo se reparten entre ellas las bancas, los fondos y los jueces?»
   - Motivo: La pregunta nueva cubre la página como está hoy (20 fichas). Si el autor decide llevar la justicia a una página propia (decisión 5 del plan), la pregunta cambia.
   - Propuesta: Si se parte: "¿Cómo vota cada provincia y cuánto pesa en el Congreso?" para politica.html y "¿Cuántos jueces, fiscales y defensores hay en cada provincia?" para la página nueva.

3. **politica.html#f-corte-casos** (`scripts/datina.js`)
   - Fragmento: «"f-corte-casos": [n0(R.justicia.corte.fallos), ...»
   - Motivo: La pregunta habla de casos y la cifra destacada da fallos. La frase ahora los reconcilia, pero la cifra sigue siendo otra medida. Cambiarla es elegir otra cifra.
   - Propuesta: Cifra destacada: casos resueltos (R.justicia.corte.resueltos) con "casos resolvió la Corte en 2025" y los fallos en la frase.

4. **politica.html#f-fiscalias-federales** (`scripts/datina.js`)
   - Fragmento: «"f-fiscalias-federales": [n0(R.justicia.mp.fiscalias), ...»
   - Motivo: La cifra fuerte (parte de los cargos de fiscal sin titular) no está en la cifra destacada, a diferencia de la ficha de jueces. Hace falta calcular el porcentaje en 02.
   - Propuesta: Sumar al resumen el porcentaje de cargos de fiscal sin titular y usarlo como cifra destacada, paralela a la de jueces.

5. **politica.html#f-elecciones y En cifras** (`datos (elecciones_presidenciales)`)
   - Fragmento: «Son datos del escrutinio provisorio.»
   - Motivo: Hay escrutinio definitivo de 2023 (y de las PASO de 2019). Con el redondeo del sitio, Massa daría 44,4 y no 44,3. Es un cambio de fuente.
   - Propuesta: Pasar 2023 y las PASO de 2019 al escrutinio definitivo de la Dirección Nacional Electoral y sacar la frase.

6. **politica.html y seguridad.html, En cifras** (`scripts/datina.js`)
   - Fragmento: «EN_CIFRAS politica: x-balotaje, x-representacion, x-congreso, x-atn, x-presidentes; seguridad: f-homicidios, f-robos, x-hurtos, f-carceles, f-delitos»
   - Motivo: Varias tarjetas repiten la primera cifra del texto de su ficha o su cifra destacada, y "4 de 12 presidentes en el AMBA" (33%) no es un hallazgo frente al 30,2% de la población. Cambiarlas es elegir otras cifras.
   - Propuesta: Política: ministros nacidos en el AMBA (51,4%) en lugar de presidentes, la participación o las 21 de 24 jurisdicciones en lugar del porcentaje del ganador. Seguridad: la caída de los robos frente al año anterior, la parte de presos sin condena y la provincia con la tasa más alta de presos.

7. **politica.html#f-congreso, #f-legisladores** (`datos (congreso_composicion, legisladores_por_periodo)`)
   - Fragmento: «Senado: Cambiemos y Juntos por el Cambio 14»
   - Motivo: Diputados clasifica por bloque y el Senado por alianza electoral. El texto ahora lo advierte, pero las dos cámaras no se pueden comparar.
   - Propuesta: Una sola regla para las dos cámaras (bloque actual), con la alianza electoral en el cuadro.

8. **politica.html#f-congreso** (`scripts/datina.js`)
   - Fragmento: «DIB.congreso (texto)»
   - Motivo: El texto repite la composición de hoy, que ya está en En cifras y en la leyenda de f-legisladores. Contar cómo cambió el reparto entre períodos necesita cifras nuevas en el resumen.
   - Propuesta: Sumar al resumen el espacio con más bancas en cada período y cuántas veces cambió, y que el texto cuente esa historia.

9. **politica.html#f-atn y #f-transferencias, #f-voto-provincia y #f-apoyo, #f-votaciones y #f-votaciones-espacios** (`scripts/plantilla.html`)
   - Fragmento: «tres pares de fichas casi iguales»
   - Motivo: Unir fichas es estructura.
   - Propuesta: Una ficha de transferencias con botones ATN y Otras no automáticas, una de apoyo con selector de medida, y la tabla por espacio arriba del voto de cada legislador (auditoría, sección C).

10. **politica.html#f-votaciones-espacios** (`scripts/datina.js`)
   - Fragmento: «<tfoot><tr><td class="ley">Plataforma electoral de 2023...»
   - Motivo: La fila de enlaces a las plataformas al pie de una tabla de votos sigue sin encajar. Sacarla es estructura.
   - Propuesta: Llevar los enlaces a la nota o solo al cuadro de cada espacio, que ya los tiene.

11. **politica.html#f-votaciones-espacios** (`scripts/plantilla.html`)
   - Fragmento: «De efecto directo»
   - Motivo: Es jerga propia. El texto ahora lo define al elegir el filtro, pero el botón sigue sin explicarse solo.
   - Propuesta: Que el autor decida un nombre más claro ("Vida diaria") para el concepto en todo el sitio: botón, selector, tabla y notas.

12. **politica.html#f-votaciones** (`datos/manual/leyes_clave.csv`)
   - Fragmento: «2018, Interrupción voluntaria del embarazo (2018) y 2024, Movilidad jubilatoria (2024)»
   - Motivo: El selector repite el año en cuatro opciones. Sacarlo del nombre rompe el mapeo de 02 (nombres iguales).
   - Propuesta: Que opcionLey saque el año entre paréntesis al armar la opción, o que 02 mapee por clave y no por nombre.

13. **politica.html#f-presupuesto** (`scripts/datina.js`)
   - Fragmento: «No figuran los presupuestos ${tramosAnios(faltan)}, que no tienen una votación en general en las actas de la fuente.»
   - Motivo: Mezcla años sin acta y años sin presupuesto aprobado (rigió el anterior). Separarlos necesita un dato por año que hoy no existe.
   - Propuesta: Sumar a presupuestos.csv los años sin presupuesto aprobado y que el texto los nombre aparte.

14. **politica.html#f-apoyo y #f-voto-provincia** (`scripts/datina.js`)
   - Fragmento: «const fuerza = r => ... >= .7 ... y const rvFuerza = r => ... < .6 ...»
   - Motivo: Las dos fichas usan escalas distintas para "moderada" y "fuerte" (0,4 a 0,7 y 0,4 a 0,6). Es cálculo.
   - Propuesta: Una sola escala para todo el sitio.

15. **politica.html#f-atn** (`scripts/datina.js`)
   - Fragmento: «const milM = v => v >= 1000 ? `${n1(v / 1000)} billones` : ...»
   - Motivo: El mismo texto mezcla "1,8 billones" y "209 mil millones". Cambiar el formato es cambiar la función.
   - Propuesta: Una sola escala en cada texto (miles de millones).

16. **politica.html#f-legisladores, laboratorio.html#l-anios** (`datos (legisladores_por_periodo, anios_congreso)`)
   - Fragmento: «Damian Arabia, Lucia Campora, COALICION CIVICA, José Miguel Ángel May…»
   - Motivo: Nombres sin tildes y en mayúsculas como llegan de la fuente, y nombres completos recortados en la pieza del Laboratorio. Corregirlos es reprocesar.
   - Propuesta: Una tabla de corrección de nombres en datos/manual (ya existe nombres_con_tilde.csv) y nombres de uso (Mayans) en las piezas.

17. **laboratorio.html (h1)** (`scripts/plantilla.html`)
   - Fragmento: «<h2 id="lab-tit">Laboratorio</h2>»
   - Motivo: El h1 del Laboratorio es su nombre, no una pregunta: la sección no es "tema con-pregunta" y el constructor no convierte la p.pregunta en h1. Volverlo pregunta es estructura, y eximirlo es una decisión del autor.
   - Propuesta: Escribir en CLAUDE.md que el Laboratorio, por ser una galería, lleva su nombre como título.

18. **laboratorio.html#l-cruces** (`datos (R.cruces, unidad de la mortalidad infantil)`)
   - Fragmento: «muertes de menores de 1 año cada 1.000 nacidos vivos, promedio 3 años»
   - Motivo: Falta la preposición ("promedio de tres años"). La unidad sale de los datos de Cruces (otro grupo).
   - Propuesta: Corregir la unidad en su origen.

19. **politica.html (Para entender los datos)** (`datos/manual/explicadores.json`)
   - Fragmento: «bloques de politica»
   - Motivo: Cinco fichas de justicia sin explicación de fuero federal, nacional y provincial, subrogantes ni ministerio público. Sumar bloques necesita fuentes con citas textuales que no se pueden inventar.
   - Propuesta: Sumar "Justicia federal, nacional y provincial" y "Cargos, titulares y subrogantes", con citas del Ministerio de Justicia y de la Corte.

20. **seguridad.html#f-robos** (`datos (SNIC)`)
   - Fragmento: «la tasa de robos del país bajó un 22,4% frente a 2024. Bajó en las 24 jurisdicciones»
   - Motivo: Una caída así en un año y en todas las jurisdicciones pide verificar si el SNIC cambió la forma de carga en 2025.
   - Propuesta: Revisar el informe SNIC 2025 y, si hubo cambios, decirlo en la nota.

21. **seguridad.html#f-carceles** (`scripts/datina.js`)
   - Fragmento: «LEAD.carceles("prov")»
   - Motivo: Neuquén tiene la tasa más baja y 100% de condenados, probablemente porque los procesados quedan en comisarías. El texto ahora advierte que no se cuentan las comisarías, pero vincularlo con una provincia necesita verificación.
   - Propuesta: Verificar con el informe del SNEEP y, si se confirma, nombrarlo en la nota de la ficha.

22. **seguridad.html#f-homicidios** (`scripts/datina.js`)
   - Fragmento: «refLab: `País ${n1(SG.hom3_pais)} (${SG.hom3_desde} a ${SG.anio})`»
   - Motivo: El rótulo de la línea del país es más largo: hay que mirarlo en 360 y 390 píxeles.
   - Propuesta: Si no entra, usar refLabCorto o dejar solo "País 4,0" (el texto y la descripción ya dicen el período).

23. **corte-suprema.html** (`scripts/datina.js`)
   - Fragmento: «La última designación que llegó a la jura fue la de ${CO.ultimo.nombre}...»
   - Motivo: No dice que García-Mansilla fue designado por decreto, sin acuerdo del Senado, y que renunció a los pocos días. El resumen no tiene esos datos en CO.ultimo y el año no se puede escribir a mano.
   - Propuesta: Sumar a R.corte.ultimo el acuerdo del Senado y la fecha de cese, y armar la frase con ellos.

24. **politica.html#f-presidentes** (`scripts/plantilla.html`)
   - Fragmento: «Fuentes: Casa Rosada, Wikipedia y Wikidata, que coinciden en los doce casos»
   - Motivo: "Doce" está escrito a mano y queda viejo con el próximo presidente.
   - Propuesta: Usar {{presidentes.n}} si el autor acepta la cifra en el pie.

25. **seguridad.html y salud.html#f-muertes** (`scripts/plantilla.html`)
   - Fragmento: «Ministerio de Seguridad Nacional / Ministerio de Seguridad»
   - Motivo: El mismo organismo con dos nombres en dos páginas (Salud es de otro grupo).
   - Propuesta: Un solo nombre, el del informe del SNIC.

26. **seguridad.html** (`scripts/plantilla.html`)
   - Fragmento: «La serie de muertes por homicidio, en siniestros viales y por femicidio está en Salud.»
   - Motivo: Los homicidios de Salud son los mismos del SNIC. Llevar femicidios y siniestros viales a Seguridad es estructura (y toca la ficha sensible de Salud).
   - Propuesta: Que el autor decida si esa serie vive en Seguridad.

27. **corte-suprema.html y politica.html** (`datos (grupos de gobierno de la Corte, espacios)`)
   - Fragmento: «PRO (Corte) y Cambiemos y Juntos por el Cambio (Senado)»
   - Motivo: El mismo gobierno con dos nombres según la página. Son categorías de los datos.
   - Propuesta: Una tabla de nombres única para todo el sitio.

28. **laboratorio.html** (`scripts/plantilla.html`)
   - Fragmento: «l-hemiciclo y l-anios»
   - Motivo: Dos de las cinco piezas repiten fichas de Instituciones políticas. Es estructura.
   - Propuesta: Que el autor decida si quedan.

29. **politica.html (todas las fichas de leyes)** (`datos/manual/leyes_clave.csv`)
   - Fragmento: «nombres de leyes cambiados»
   - Motivo: Los nombres de leyes_clave.csv llegan al sitio por 02_procesar.py (resumen, votaciones_leyes_clave.csv y .json): con solo 03 no se ven.
   - Propuesta: Correr 02_procesar.py antes de 03 al aplicar este grupo.

## Territorio y recursos (27)

1. **movilidad.html#f-patentes** (`scripts/02_procesar.py`)
   - Fragmento: «"motos": int(patent.motos.iloc[-1])»
   - Motivo: Error de dato (E3): el total nacional de motos de 2025 (658.735) y el promedio de 14,2 cada 1.000 suman las motos de Tierra del Fuego, que la misma página señala como probable error. Sin ellas la ventaja sobre los autos baja de unos 43 mil a unos 15 mil.
   - Propuesta: Sacar del total y del promedio del país las jurisdicciones excluidas en distorsiones.json (o avisarlo en la cifra destacada) y revisar el titular "más que autos". Mientras tanto, el texto de f-patentes y de f-patentes-prov ya lo dice.

2. **petroleo.html#f-pozos y #f-mapa-pozos** (`datos/crudo/se_pozos_resumen.csv, datos/crudo/se_pozos_nc.csv`)
   - Fragmento: «Los 2.922 de shale / 2.918 eran de shale y 1.226 de tight»
   - Motivo: Error de dato (E13): el mismo mes da conteos distintos de pozos de shale y tight porque los dos archivos se bajaron en fechas distintas, y 2.918 + 1.226 no da los 4.148 de la cifra destacada.
   - Propuesta: Que las dos fichas usen el mismo archivo o la misma fecha de descarga, explicar los pozos que no son shale ni tight y, más adelante, unir las dos fichas.

3. **naturaleza.html#f-visitas y #f-visitas-parque** (`scripts/02_procesar.py`)
   - Fragmento: «ytd_frase / par_var»
   - Motivo: Dos fichas vecinas dan dos variaciones de este año de signo contrario, con fuentes y meses distintos. El texto ahora nombra cada fuente, pero el lector sigue viendo dos cifras para lo mismo.
   - Propuesta: Un solo dato de lo que va del año, de la fuente que llega más lejos, o unir las dos fichas (cambio de estructura).

4. **petroleo.html (En cifras)** (`scripts/datina.js`)
   - Fragmento: «"x-pet-shale": ["f-petroleo", pct(PG.pct_shale),»
   - Motivo: La cifra destacada es shale y su serie (SERIE_CIFRA) es no convencional. El texto ya compara no convencional con no convencional, pero la cifra sigue siendo shale.
   - Propuesta: Cambiar la cifra a pct(PG.pct_nc) ("72,8% del petróleo de agosto fue no convencional, contra 63,0% en 2025").

5. **petroleo.html#f-fracturas** (`scripts/datina.js`)
   - Fragmento: «"f-fracturas": [`${n0(PG.dv_rama_ult)} m`,»
   - Motivo: La pregunta pide etapas de fractura y la cifra destacada da la rama horizontal. Cambiar la cifra es elegir otro dato.
   - Propuesta: Cifra: n0(PG.fr_etapas), "etapas de fractura en formaciones no convencionales en ${PG.fr_ult}, el ${pct(PG.fr_vm_pct)} en Vaca Muerta".

6. **naturaleza.html#f-parques** (`scripts/datina.js`)
   - Fragmento: «"f-parques": [n0(nt.pn_n),»
   - Motivo: La cifra destacada es una cantidad de áreas. La pregunta nueva nombra cantidad y superficie, pero la superficie no tiene cifra.
   - Propuesta: Si el autor prefiere una sola pregunta de superficie: cifra con nt.pn_terr_millones + nt.pn_mar_millones ("millones de hectáreas, siete de cada diez en el mar").

7. **petroleo.html#f-regalias** (`scripts/datina.js`)
   - Fragmento: «vf: usd ? n0 : v => n1(v) + "%"»
   - Motivo: Jujuy (0,96%) y Corrientes (1,006%) se ven las dos como 1,0%, pero una cuenta entre las de menos del 1% y la otra no.
   - Propuesta: Mostrar dos decimales en los valores cercanos al corte, o redondear el corte igual que la etiqueta (cambio de cálculo).

8. **movilidad.html#f-combustibles y petroleo.html (todas)** (`scripts/03_construir_sitio.py`)
   - Fragmento: «FRECUENCIA ("Se actualiza cada mes")»
   - Motivo: datos.energia.gob.ar no responde desde el 23 de octubre de 2026: la nafta quedó en julio de 2026 y la producción, los pozos y las áreas salen de archivos de principios de octubre. El pie sigue diciendo "Se actualiza cada mes".
   - Propuesta: Mostrar la fecha de descarga en "De dónde sale" y un aviso cuando el archivo tenga más de 30 días. Mientras siga caído el servidor, sacar la nafta de "En cifras" o aclarar el mes.

9. **petroleo.html#f-areas-hidro y #f-empresas-hidro** (`scripts/02_procesar.py y tituloArea() de datina.js`)
   - Fragmento: «El Porton_mendoza, Gobernador Ayala Iii, Cnq 7/a, Rio Mayo, Confluencia Sur (dos veces), Pampa Energia, Pluspetrol y Pluspetrol Cuenca Neuquina»
   - Motivo: Nombres crudos de la fuente: guiones bajos, romanos rotos, sin tildes, áreas repetidas sin provincia y un mismo grupo en dos barras. Corregirlos es tocar los datos.
   - Propuesta: Tabla de equivalencias de nombres (como nombres_con_tilde.csv), agrupar por grupo empresario y un buscador en lugar de la lista de 280 áreas.

10. **energia.html#f-hogares, #f-centrales, naturaleza.html#f-pesca** (`scripts/datina.js`)
   - Fragmento: «OCDE_BOTON (líneas 5147 a 5151)»
   - Motivo: Para G6b: el botón "OCDE: CO₂ por habitante" no responde a la pregunta de f-hogares (parte de los hogares en la electricidad). En f-centrales, la vista OCDE compara generación eólica y solar mientras la ficha muestra potencia (la nota OCDE ya lo aclara). "Hogares y resto" y "Centrales y potencia" son los rótulos de las vistas iniciales.
   - Propuesta: Llevar el CO₂ a una ficha de emisiones (Flora y fauna o Energía) y revisar los rótulos de las vistas iniciales.

11. **energia.html, petroleo.html, movilidad.html, naturaleza.html, curiosidades.html** (`scripts/plantilla.html`)
   - Fragmento: «orden y unión de fichas»
   - Motivo: Cambios de estructura propuestos por la auditoría, fuera de esta reescritura.
   - Propuesta: Unir f-hogares con f-actividad (misma tabla), f-sube con f-sube-modos, f-mapa-pozos con f-pozos y f-fracturas con f-pozos-terminados. Cuatro subtítulos en Petróleo y gas (Producción, Vaca Muerta y los pozos, Lo que deja, Lo que queda). Mover glaciares y clima a Flora y fauna, y renombrar Flora y fauna (por ejemplo, Naturaleza y ambiente, como el archivo). Separar los dos grupos de botones de f-combustibles. Mostrar 15 parques en f-visitas-parque con "Ver todos". f-balanza-energetica repite Sector externo: dejar una y enlazar desde la otra.

12. **curiosidades.html** (`scripts/plantilla.html`)
   - Fragmento: «<p class="pregunta" data-corta="¿Cuánta carne y yerba consumimos?">»
   - Motivo: La pregunta de la página sigue nombrando la temperatura porque el clima todavía está en Curiosidades.
   - Propuesta: Si glaciares y clima pasan a Flora y fauna: "¿Qué nombres se eligen para los bebés y cuánta carne, vino y yerba consumimos?".

13. **petroleo.html#f-hidro-provincias, energia.html#f-hogares y #f-actividad** (`scripts/datina.js`)
   - Fragmento: «barrasH(G("hidro-provincias"), ... vf: gas ? n1 : kbdF / lineas(G("hogares")...)»
   - Motivo: Las barras no tienen unidad y los índices no dicen "2005 = 100" en el gráfico. La bajada ya lo dice, pero el gráfico es cambio de diseño.
   - Propuesta: Rótulo de unidad en el eje o en el valor ("mil barriles por día") y "índice, 2005 = 100" junto a las líneas.

14. **todo el sitio** (`scripts/datina.js`)
   - Fragmento: «vecesPais(): "menos de la cuarta parte del promedio del país"»
   - Motivo: Frase molde que achica la diferencia: se usa para 0,18 y para 0,13 del promedio (Santiago del Estero en f-electricidad-sectores, La Pampa en f-protegida). Es una función de todo el sitio.
   - Propuesta: Decir la razón real ("unas ocho veces menos") con veces(pais, v) cuando el valor queda por debajo de la cuarta parte.

15. **naturaleza.html, movilidad.html** (`scripts/plantilla.html`)
   - Fragmento: «Ministerio de Turismo y Deportes / Ministerio de Ambiente / Ministerio de Transporte»
   - Motivo: Nombres de organismos anteriores a diciembre de 2023, y en Flora y fauna el mismo organismo aparece como Ministerio de Turismo y Deportes y como Secretaría de Turismo. El repositorio no documenta el nombre vigente.
   - Propuesta: Verificar el nombre vigente de cada organismo, sumarlo a relaciones.json y usar uno solo en todo el sitio.

16. **curiosidades.html#f-glaciares, naturaleza.html#f-especies** (`scripts/02_procesar.py`)
   - Fragmento: «gl_total, esp_top (sin año)»
   - Motivo: Las bajadas de glaciares y de especies no tienen período porque el resumen no guarda el año del inventario ni el de los registros. Glaciares cuenta glaciares y no superficie.
   - Propuesta: Sumar al resumen el año del inventario del IANIGLA y la superficie de hielo por provincia, y la fecha de corte del SIB, y usarlos con {{ruta}}.

17. **curiosidades.html#f-nombres** (`datos/manual/explicadores.json`)
   - Fragmento: «desde 2012 hasta 2024 ... La serie tiene un año de atraso respecto del calendario.»
   - Motivo: El explicador tiene los años escritos a mano y dice "un año de atraso" con datos de 2024 en octubre de 2026.
   - Propuesta: Verificar si el RENAPER ya publicó 2025 y escribir el atraso sin años fijos ("publica cada año con el año anterior").

18. **energia.html#f-centrales** (`scripts/datina.js`)
   - Fragmento: «y ${n0(e.cen_tec["Nuclear"])} nucleares»
   - Motivo: El listado tiene 2 centrales nucleares (Embalse y Atucha II) y el 4,0% de potencia nuclear parece incluir Atucha I. No está documentado en el repositorio.
   - Propuesta: Verificar en el listado de la Secretaría de Energía y, si corresponde, aclarar que Atucha I y II figuran como una sola central.

19. **movilidad.html#f-combustibles** (`scripts/datina.js`)
   - Fragmento: «la más baja, la de ${bajo[0]}»
   - Motivo: Tierra del Fuego tiene la nafta más barata y el texto no dice por qué. La exención del impuesto a los combustibles en la zona sur (Ley 23.966) no está documentada en el repositorio.
   - Propuesta: Verificar la norma y sumar una oración con su fuente.

20. **energia.html, petroleo.html, naturaleza.html (En cifras)** (`scripts/datina.js`)
   - Fragmento: «EN_CIFRAS»
   - Motivo: "En cifras" copia las cifras destacadas de las fichas casi palabra por palabra.
   - Propuesta: Elegir datos que no estén en las cifras destacadas, o enlazar cada cifra a su ficha.

21. **curiosidades.html#f-vino, #f-yerba, #f-carne** (`scripts/02_procesar.py`)
   - Fragmento: «vino_v, yerba_v»
   - Motivo: Faltan los litros de vino y los kilos de yerba por habitante, que darían una lectura comparable con la carne. Es un cálculo nuevo.
   - Propuesta: Sumarlos al resumen con la población del INDEC y usarlos en el texto.

22. **buscador (todas las páginas)** (`scripts/datina.js`)
   - Fragmento: «const PREG = [ (entradas que llevan a f-fracturas, f-petroleo, f-gas-hogares, f-sube, f-sube-modos, f-patentes, f-nombres y las demás fichas de G4)»
   - Motivo: Las preguntas del buscador repiten textos de estas fichas y no las revisé, porque no son de las páginas del grupo. Hay que ponerlas en línea con los cambios: "¿Cuántos hogares cocinan con gas de red?" pasa a "¿Qué parte de los hogares cocina con gas de red?", "¿Volvieron los pasajeros al tren y al subte?" no dice que la baja del subte no mide pasajeros, "¿Se patentan más autos o más motos?" suma Tierra del Fuego, y "¿Cuánto petróleo produce la Argentina?" usa shale en lugar de no convencional.
   - Propuesta: Que el grupo del buscador las alinee con las fichas nuevas.

23. **todas las páginas del grupo** (`scripts/03_construir_sitio.py`)
   - Fragmento: «descr = f"{titulo}: {preg} Datos por provincia con su fuente, su año y la tabla para descargar."»
   - Motivo: La descripción para buscadores y redes dice "Datos por provincia" también en Curiosidades y en Petróleo y gas, que muestran sobre todo datos del país.
   - Propuesta: Para el grupo de metadatos: una descripción propia por página o una frase que no prometa datos por provincia.

24. **datos/manual/distorsiones.json** (`datos/manual/distorsiones.json`)
   - Fragmento: «patentamientos_provincias.motos_1000 / 94 / motivo»
   - Motivo: El cambio propuesto al motivo se ve recién después de correr 02_procesar.py, que lo copia al resumen.
   - Propuesta: Correr 02_procesar.py en la próxima actualización (o en esta sesión, si el autor lo aprueba) y revisar el texto de f-patentes-prov.

25. **petroleo.html#f-pozos-terminados** (`datos/manual/explicadores.json`)
   - Fragmento: «explotación, exploración, avanzada, servicio»
   - Motivo: Los tipos de pozo no están definidos en el glosario y el repositorio no documenta la definición de la Secretaría de Energía.
   - Propuesta: Sumar al glosario las cuatro definiciones, con la fuente de la Secretaría.

26. **salud.html#f-mortalidad y la ficha de esperanza de vida (otro grupo)** (`scripts/datina.js`)
   - Fragmento: «La línea punteada azul marca el promedio simple de los países de la OCDE (mortalidad-nota y esperanza-nota)»
   - Motivo: Las dos notas dicen "azul", pero barrasH dibuja la línea de la OCDE con --ocde (violeta), como en f-protegida, que ya se corrige en este grupo.
   - Propuesta: Para el grupo de Salud: "La línea punteada violeta".

27. **energia.html#f-centrales** (`scripts/02_procesar.py`)
   - Fragmento: «potencia_instalada»
   - Motivo: La cifra destacada compara potencia instalada y la OCDE compara generación. Lo justo sería comparar generación con generación.
   - Propuesta: Sumar la generación por fuente de CAMMESA (informe mensual) y usarla en la cifra o en una vista.

## Artículos (26)

1. **a-*.html (los 14 cruces)** (`scripts/datina.js`)
   - Fragmento: «ab >= .4 ? "Sí, en general." : "Apenas."»
   - Motivo: Umbrales de la respuesta: "Sí" desde 0,4, que con 24 casos el azar alcanza una vez de cada 20. Nafta usa 0,6 y turismo pide las dos relaciones. Es cálculo.
   - Propuesta: Una sola escala para los 18: "Sí" desde 0,6, "En parte" de 0,4 a 0,6, "Apenas" de 0,2 a 0,4, y por debajo de 0,4 una línea "Puede ser casualidad".

2. **a-*.html (los 14 cruces)** (`scripts/datina.js`)
   - Fragmento: «function calcularArt(a)»
   - Motivo: La plantilla nueva de la auditoría necesita cálculos que hoy no se hacen: mitades por mediana, un gancho propio de cada artículo y casos que se apartan elegidos por su orden (hoy salen de una recta, Pearson, y la cifra es Spearman).
   - Propuesta: Sumar a calcularArt las medianas de y en las 12 con más x y las 12 con menos, un campo gancho por artículo con su plantilla de una oración y los residuos por rangos. Después, "En una frase" con las mitades arriba.

3. **a-*.html (los 14 cruces)** (`scripts/datina.js`)
   - Fragmento: «${t.extremos}»
   - Motivo: Las tres más y las tres menos siguen siendo doce cifras en prosa (ahora con la unidad una sola vez). Mostrar solo la más alta y la más baja cambia qué cifras se eligen.
   - Propuesta: Una sola comparación: la más alta contra la más baja en x, con su y. El resto queda en "Ver tabla" o en el CSV.

4. **a-*.html (los 14 cruces)** (`scripts/datina.js`)
   - Fragmento: «const lim = [»
   - Motivo: Los tres límites generales se repiten igual en los 14. Ahora van al final, pero siguen en cada artículo.
   - Propuesta: Un recuadro fijo "Cómo leer un cruce" con los generales y un enlace, y en cada artículo solo los propios. Es estructura.

5. **a-*.html (los 18)** (`scripts/datina.js`)
   - Fragmento: «const rTxt = r => n2(r).replace(/[-−]/, "menos ");»
   - Motivo: "menos 0,53" en letras se lee raro en pantalla (auditoría, P2).
   - Propuesta: Mostrar −0,53 con el signo y dejar "menos" solo para el lector de pantalla, sin que la bajada (que usa el buscador) lleve la cifra: hoy ya no la lleva. Revisar antes cómo lo leen NVDA y VoiceOver.

6. **a-*.html (los 18)** (`scripts/datina.js`)
   - Fragmento: «Spearman»
   - Motivo: Los artículos no tienen "Cómo se calcula": el coeficiente se mudó al párrafo de la correlación, después del gráfico, pero sigue en el texto.
   - Propuesta: Un "Cómo se calcula" por artículo, plegado, con el coeficiente, la escala y Pearson.

7. **a-*.html (los 18)** (`scripts/datina.js`)
   - Fragmento: «<p class="nota-meta">${nombreSec(a.sec)}. ${a.frec}</p>»
   - Motivo: Un metadato arriba de la pregunta (las fichas ya no llevan la sección arriba) y no se ve hasta qué fecha llegan los datos.
   - Propuesta: Pasar la frecuencia al pie, junto a la fuente, con una línea "Datos hasta …" desde el resumen.

8. **a-milei-empleo.html** (`scripts/plantilla.html`)
   - Fragmento: «data-titulo="¿Votaron más a Milei las provincias con más empleo privado?"»
   - Motivo: Decisión del autor (PLAN_MEJORA, sección 13, tanda 1): usa el empleo de junio de 2026 para un voto de noviembre de 2023 y responde "Sí, en general" a una diferencia de 2,4 puntos entre mitades. Solo se hicieron cambios chicos (segunda vuelta, votos a las dos fórmulas, el límite del SIPA).
   - Propuesta: Reemplazarlo por "¿Qué candidato ganó en cada provincia desde 1983?", o rehacerlo con el empleo de noviembre de 2023, sin la frecuencia mensual y con la respuesta "Apenas".

9. **a-viviendas-hacinamiento.html** (`scripts/datina.js`)
   - Fragmento: «{id: "a-viviendas-hacinamiento"»
   - Motivo: Es casi una identidad: las viviendas por habitante son la inversa del tamaño del hogar, y el hacinamiento sube con el tamaño del hogar. Decisión del autor pendiente.
   - Propuesta: Retirarlo, o pasarlo a "¿Dónde viven más personas por hogar?" con el tamaño del hogar como dato principal.

10. **a-viviendas-alquiler.html** (`scripts/datina.js`)
   - Fragmento: «{id: "a-viviendas-alquiler", tabla: "capitales", x: "viviendas_1000"»
   - Motivo: El mismo problema: el tamaño del hogar y la parte de las viviendas que son departamentos van con el alquiler más que el eje elegido. Cambiar el eje es cambiar el dato.
   - Propuesta: Usar como x las viviendas que son departamentos (en_departamento ya está en la tabla de las capitales) o juntarlo con el de hacinamiento.

11. **a-atn-presupuesto.html** (`scripts/datina.js`)
   - Fragmento: «{id: "a-atn-presupuesto"»
   - Motivo: Los ATN por habitante miden sobre todo el tamaño de la provincia: descontada la población, la relación baja de 0,51 a 0,33 (cálculo de la auditoría). Ahora el límite lo dice sin cifras.
   - Propuesta: Calcular la relación descontada la población y la relación año por año, y responder "En parte, y sobre todo por el tamaño de las provincias".

12. **a-empleo-pobreza.html** (`scripts/datina.js`)
   - Fragmento: «{id: "a-empleo-pobreza"»
   - Motivo: El "Sí" depende de CABA y la tasa de empleo se calcula sobre toda la población. La bajada de la tarjeta ya dice que cuenta a los chicos.
   - Propuesta: Usar el empleo de 15 a 64 años si la EPH lo permite, o responder "Apenas, y depende de CABA" con una escala nueva.

13. **a-exportaciones-dolar.html** (`scripts/datina.js`)
   - Fragmento: «las de productos primarios tuvieron su mayor caída en ${t.pp_caida_anio}»
   - Motivo: La auditoría pide nombrar la sequía de 2023. El año sale de los datos: escribir la sequía pegada a un año calculado quedaría mal si otro año tuviera una caída mayor.
   - Propuesta: Una nota fija de los hechos de cada año (sequía de 2023, cepo, barril criollo) que se muestre solo si coincide con el año que sale de los datos.

14. **a-nafta-dolares.html** (`scripts/datina.js`)
   - Fragmento: «const s3 = "Un litro de nafta cuesta más que un litro de petróleo»
   - Motivo: Falta el contexto del precio del crudo en el país (derechos de exportación móviles, barril criollo, congelamiento): fechas de memoria de la auditoría, sin verificar.
   - Propuesta: Un párrafo descriptivo con esas medidas y sus normas, después de confirmar cada fecha. Y el gráfico de las veces primero.

15. **a-turismo-dolar.html y a-dolar-inversion.html** (`02_procesar.py (resumen)`)
   - Fragmento: «su promedio desde ${t.desde} / su promedio desde ${d.desde_anio}»
   - Motivo: El mismo índice del dólar real contra dos promedios distintos (desde enero de 2010 y desde 2004): dos respuestas a qué tan barato está el dólar.
   - Propuesta: Un solo período de referencia en todo el sitio.

16. **a-alquiler-pobreza.html y a-viviendas-alquiler.html** (`scripts/datina.js`)
   - Fragmento: «34,4% en CABA (EPH) y 36,8% en CABA (censo)»
   - Motivo: Dos cifras de hogares que alquilan para CABA en dos artículos vecinos, y dos áreas distintas llamadas capital. Los límites lo explican, pero lejos.
   - Propuesta: Un solo dato de alquiler por capital, o una nota fija "Dos maneras de contar una capital" en los dos.

17. **a-dolar-inversion.html** (`scripts/plantilla.html`)
   - Fragmento: «id="a-dolar-inversion"»
   - Motivo: Mete cuatro historias en una página (dólar real, equipos importados, construcción y compras de dólares). El título nuevo nombra las dos que deciden la respuesta.
   - Propuesta: Partirlo en "¿Se invierte más en construcción cuando construir es barato en dólares?" y "¿Cuántos dólares compran por año las personas y las empresas?".

18. **a-exportaciones-dolar.html** (`scripts/datina.js`)
   - Fragmento: «Por rubro, con medio año de rezago, es de ${rTxt(rs.primarios)}»
   - Motivo: Nueve coeficientes en un párrafo. Pasarlos a una tabla es estructura.
   - Propuesta: Dejar uno en el texto y el resto en una tabla chica debajo del gráfico.

19. **articulos.html** (`scripts/03_construir_sitio.py`)
   - Fragmento: «_LISTA_ARTS»
   - Motivo: Las tarjetas dicen qué datos usa cada artículo, pero no qué encontró, y no hay filtros ni bloques. La respuesta la calcula datina.js.
   - Propuesta: Cada tarjeta con su respuesta en una línea, filtros por los cuatro grupos de temas y dos bloques: "El país en el tiempo" y "Las 24 comparadas".

20. **a-*.html** (`scripts/03_construir_sitio.py`)
   - Fragmento: «orden = [n[0] for n in NOTAS]»
   - Motivo: Anterior y Siguiente no siguen el orden de la lista agrupado por tema (de alquiler salta a ATN y vuelve a vivienda). Es navegación.
   - Propuesta: El mismo orden que la lista, agrupado por tema.

21. **a-*.html** (`scripts/03_construir_sitio.py`)
   - Fragmento: «descr = f"{html.unescape(titulo)} Compara {CRUZA(id_)}»
   - Motivo: La descripción para buscadores y redes no dice lo que encontró cada artículo: la respuesta la calcula datina.js en el navegador.
   - Propuesta: Que 02 o 03 calculen la respuesta (o que la descripción use la bajada de cada artículo, dek, que 03 ya lee en _ARTS_JS).

22. **articulos.html** (`scripts/03_construir_sitio.py`)
   - Fragmento: «descr = f"{titulo}: {preg} Datos por provincia con su fuente, su año y la tabla para descargar."»
   - Motivo: La descripción de la página Artículos sale de la plantilla común de las secciones y dice "Datos por provincia con ... la tabla para descargar", que no describe una lista de artículos. Cambiarla toca todas las secciones.
   - Propuesta: Una descripción propia para articulos.html: "Artículos que cruzan datos oficiales de las 24 jurisdicciones, de las capitales y del país, con sus fuentes y lo que no se puede concluir."

23. **a-milei-empleo.html y los demás cruces** (`scripts/02_procesar.py (metadatos de cruces, capitales y capitales_eph)`)
   - Fragmento: «"nombre": "Voto a Milei en el balotaje", "unidad": "% de los votos positivos, segunda vuelta presidencial"»
   - Motivo: Los nombres y las unidades de los datos (título del gráfico, botones "Ficha: …" y ahora el pie del gráfico) salen del resumen: "balotaje" y "votos positivos" contra el término fijo "segunda vuelta", "población económicamente activa" sin explicar y "Aprender, matemática". Corregirlos es reprocesar (R14).
   - Propuesta: En 02: "Voto a Milei en la segunda vuelta" con "% de los votos a las dos fórmulas", y "% de quienes trabajan o buscan trabajo" en la desocupación.

24. **a-*.html** (`scripts/datina.js`)
   - Fragmento: «Ficha: ${nom.toLowerCase()}»
   - Motivo: El botón pasa a minúscula todo el nombre ("Ficha: voto a milei en el balotaje"). Hoy no se ve porque el botón va en mayúsculas, pero el lector de pantalla lo recibe así.
   - Propuesta: Usar minusc() en lugar de toLowerCase(), como el título del gráfico.

25. **a-cobertura-esperanza.html y a-cobertura-adolescentes.html** (`scripts/plantilla.html`)
   - Fragmento: «data-titulo="¿Se vive más años donde más gente tiene obra social o prepaga?"»
   - Motivo: El título pregunta por la obra social y el contexto aclara que se usa como aproximación a las condiciones de vida, no al acceso a la salud. Resolverlo es juntar o rehacer artículos.
   - Propuesta: Juntar los dos artículos de cobertura en uno sobre la falta de obra social como marca del empleo no registrado (auditoría, sección B).

26. **a-recursos-empleo.html** (`scripts/datina.js`)
   - Fragmento: «{id: "a-recursos-empleo"»
   - Motivo: Ingresos Brutos, el principal impuesto provincial, se cobra sobre la actividad económica: la relación es en parte contable (auditoría, P1). No se sumó el límite porque afirma algo que el sitio no muestra.
   - Propuesta: Sumar un límite con el peso de Ingresos Brutos en la recaudación propia de cada provincia, si el sitio lo tiene (impuestos_provinciales).

## Perfil provincial y herramientas de provincias (20)

1. **provincia.html?prov=*** (`scripts/datina.js`)
   - Fragmento: «k:"autonomia", pais:R.fiscal.mediana»
   - Motivo: Error de rótulo: la tarjeta dice "País: 40,3%" (y "Total del país" sin provincia), pero el valor es la mediana de las provincias (R.fiscal.mediana), como dice En cifras ("la provincia del medio"). La raya de la tira también marca la mediana. Lo mismo pasa en En cifras con provincia elegida, en la tarjeta chica y en la respuesta rápida.
   - Propuesta: Sumar a la entrada un rótulo propio para la referencia (por ejemplo ref:"Mediana de las 24") y usarlo en lugar de "País" en la línea de posición, en "Total del país" y en pintarCifras, miniIndp y la respuesta rápida. O usar el valor del país si las cuentas provinciales lo permiten.

2. **provincia.html** (`scripts/03_construir_sitio.py`)
   - Fragmento: «pagina("provincia", "Tu provincia",»
   - Motivo: Al elegir una provincia, la pestaña, el marcador y la vista previa al compartir siguen diciendo "Tu provincia" (nada cambia document.title). Es comportamiento.
   - Propuesta: Que pintarPanel ponga "Neuquén en números | Datina" en document.title al elegir, y páginas estáticas por provincia para compartir (auditoría D8).

3. **En cifras de cada sección con provincia elegida y mapa de la portada** (`scripts/datina.js`)
   - Fragmento: «Posición ${orden} de ${c.d.length}, de mayor a menor.»
   - Motivo: La misma frase de posición que se reescribió en el perfil vive también en pintarCifras ("Posición 9 de 24, de mayor a menor.") y en tarjetaMapa ("9.º de 24, de mayor a menor. País:"), piezas comunes de G6b. Si no se cambian, el sitio usa dos formas.
   - Propuesta: Usar la misma fórmula del perfil: ${orden === 1 ? "La cifra más alta" : orden === c.d.length ? "La cifra más baja" : orden <= c.d.length / 2 ? `La ${orden}.ª cifra más alta` : `La ${c.d.length - orden + 1}.ª cifra más baja`} de las ${c.d.length} ${c.d.length < 24 ? "jurisdicciones con dato" : "jurisdicciones"}. (en tarjetaMapa, con pos y x.d.length).

4. **provincia.html?prov=*** (`scripts/datina.js`)
   - Fragmento: «<span class="dp-det">${c.det}</span>»
   - Motivo: En las tarjetas con porcentaje se lee "8,5%" y abajo "% de los nacimientos…": el "%" se repite. El detalle lo necesita en En cifras y en la tarjeta chica.
   - Propuesta: En el perfil, sacar el "%" inicial del detalle cuando la cifra ya lo tiene, como hace la respuesta rápida (c.det.replace(/^%\s*/, "")).

5. **provincia.html?prov=*** (`scripts/datina.js`)
   - Fragmento: «d:T.nacidos_otro_pais_provincias.filter(r => r.codigo_indec !== "00"), k:"pct_otro_pais", pais:MGC.pct, f:n1»
   - Motivo: Nacidos en otro país y en otra provincia son porcentajes, pero la cifra sale sin "%" (f:n1) y la del país también ("País: 4,2"). Es formato, no texto.
   - Propuesta: Usar f:pct en las dos entradas.

6. **provincia.html?prov=*** (`scripts/datina.js`)
   - Fragmento: «el.querySelector(".dp-aclara").textContent = fila ? notaDist(c, prov) : "";»
   - Motivo: Cuando faltan jurisdicciones (impuestos 23, gas 20, electricidad 21) la tarjeta ahora dice "de las 21 jurisdicciones con dato", pero no cuáles faltan ni por qué.
   - Propuesta: Nombrar en .dp-aclara las que no tienen dato y el motivo (CAMMESA informa CABA y Buenos Aires juntas y no informa Tierra del Fuego, la distribución de gas no llega a cuatro provincias, etc.).

7. **provincia.html** (`scripts/datina.js`)
   - Fragmento: «const PERFIL_GRUPOS = [»
   - Motivo: Estructura del perfil (decisión 6 de PLAN_MEJORA): la historia va antes que los números (la primera cifra a 1.223 px), no hay un resumen de dónde se destaca, Provincias parecidas queda al fondo sin valores, los grupos son h3 que cuelgan del h1, hay dos selectores de provincia y faltan temas que el sitio ya tiene (pobreza del aglomerado, cuentas fiscales, transferencias, participación electoral).
   - Propuesta: Lo que proponga el autor entre las opciones de la auditoría (herramientas-y-perfiles.md, sección B).

8. **cruces.html** (`scripts/02_procesar.py`)
   - Fragmento: «"pct_pob_solo_cobertura_publica": ("Población sin obra social ni prepaga"»
   - Motivo: Indicadores repetidos en Cruces y en la matriz: "Sin obra social ni prepaga" (sin_cobertura) y "Población sin obra social ni prepaga" dan exactamente los mismos valores (CABA 16,31 en las dos), y "Necesidades básicas insatisfechas" y "Hogares con necesidades básicas insatisfechas" también (4,75 y 4,8, solo cambia el redondeo). No hay nombre que los distinga: son el mismo dato.
   - Propuesta: Dejar uno de cada par en CRUCES_META (y en la matriz, que hoy cuenta pares de un indicador consigo mismo).

9. **cruces.html** (`scripts/02_procesar.py`)
   - Fragmento: «"pct_hog_cloaca": ("Hogares con cloacas", "% de los hogares con desagüe a red pública"»
   - Motivo: "Cloacas" (inodoro con descarga a red cloacal, de los microdatos del censo por radio) y "Hogares con cloacas" (desagüe a red pública, del cuadro publicado del INDEC) miden lo mismo con cifras distintas (CABA 97,2 y 98,8). Los nombres sugieren conceptos distintos y no dicen por qué difieren. Verificación factual pendiente: el denominador de cada tabla.
   - Propuesta: Verificar las dos definiciones y dejar una, o nombrarlas por su diferencia real (por ejemplo, "sobre todos los hogares" y "sobre los hogares con baño").

10. **cruces.html** (`scripts/datina.js`)
   - Fragmento: «${META[a].nombre} ${yE(META[b].nombre.toLowerCase())}»
   - Motivo: Los botones de "Para empezar" pasan el segundo nombre a minúscula y queda "Maternidad adolescente y aprender, matemática", que se lee como el verbo. Aprender es el nombre de la evaluación.
   - Propuesta: No pasar a minúscula los nombres propios (Aprender, AUH, ATN) o escribir el par a mano en SUG.

11. **cruces.html** (`scripts/datina.js`)
   - Fragmento: «const fuerza = r => { const a = Math.abs(r); return a < .1 ? "prácticamente nula" : a < .3 ? "débil" : a < .5 ? "moderada" : a < .7 ? "fuerte" : "muy fuerte"; };»
   - Motivo: Auditoría P0: el sitio tiene cinco escalas de fuerza; en los artículos (fuerzaArt) r = −0,52 sería "moderada" y acá es "fuerte". Es cálculo.
   - Propuesta: Una sola escala para todo el sitio (decisión del autor).

12. **cruces.html** (`scripts/plantilla.html`)
   - Fragmento: «<details class="cx-detalle"><summary>Ver los datos del cruce</summary>»
   - Motivo: "Ver los datos del cruce" y "Ver tabla" hacen casi lo mismo. La regresión múltiple, con su jerga, podría ir plegada. Los créditos (OCDE, Eurostat, Gapminder, Brasil) podrían ir a Nosotros. Es estructura.
   - Propuesta: Un solo botón de tabla, la regresión bajo "Avanzado" y los créditos en Nosotros (auditoría).

13. **cruces.html** (`scripts/datina.js`)
   - Fragmento: «const ids = R.cruces.map(m => m.id).filter(id => id !== "poblacion")»
   - Motivo: "Población" es un total y está en los selectores de los ejes y de la regresión, aunque ya existe "Tamaño según población". El explicador se corrigió para decirlo.
   - Propuesta: Sacarla de los selectores de ejes y de la regresión.

14. **indice.html** (`scripts/datina.js`)
   - Fragmento: «${datos[datos.length - 1].f.territorio} última, con ${n1(datos[datos.length - 1].t)}»
   - Motivo: Con pesos iguales, Chaco y Santiago del Estero tienen 2,3 y el texto nombra solo a la última. Detectar empates es cálculo.
   - Propuesta: Si el puntaje redondeado de la anteúltima es igual, decir "Chaco y Santiago del Estero comparten el último lugar, con 2,3".

15. **indice.html** (`scripts/datina.js`)
   - Fragmento: «{id: "trabajo", nombre: "Trabajo y producción", c: "#B27A00", ind: [["empleo_privado", 1], ["exportaciones", 1]]}»
   - Motivo: Las exportaciones por habitante miden lo que vende la provincia, no el bienestar de quien vive ahí (el explicador ahora lo dice). Cambiar el indicador es decisión del autor.
   - Propuesta: Consultar al autor si van el salario registrado o la tasa de empleo.

16. **indice.html** (`scripts/datina.js`)
   - Fragmento: «<small>${d.ind.map(([k]) => M[k].nombre).join(", ")}</small>»
   - Motivo: La lista de indicadores se une con comas y los nombres de Aprender ya tienen coma: "Escolarización secundaria, Aprender, matemática, Aprender, lengua".
   - Propuesta: Unir con lista() o renombrar en CRUCES_META "Aprender en matemática" y "Aprender en lengua" (el rótulo del perfil no cambia: lo usa el mapa de la portada).

17. **departamentos.html** (`scripts/datina.js`)
   - Fragmento: «`<h3>Valores más altos</h3><ol>${lista.slice(0, 5).map(item).join("")}</ol><h3>Valores más bajos</h3>»
   - Motivo: Con homicidios, la lista de valores más bajos son cinco ceros empatados elegidos sin criterio visible. Detectar el empate es cálculo.
   - Propuesta: Con empate: "N departamentos sin homicidios en 2023 a 2025, entre ellos…".

18. **departamentos.html** (`scripts/datina.js`)
   - Fragmento: «.on("click", (ev, f) => { if (!NOMBRES[pv]) { cerca = {c: f.properties.prov, de: prov}; ocultarTip(); cambiarVista("mapa-dep"); } });»
   - Motivo: Accesibilidad: acercar una provincia solo se puede tocando el mapa (los departamentos no se alcanzan con el teclado), contra la regla de que nada dependa solo del mouse. Tampoco hay un buscador de departamento.
   - Propuesta: Un selector de provincia propio del mapa o un buscador "Buscá tu departamento o partido" que acerque el mapa y muestre su valor.

19. **provincia.html?prov=*** (`scripts/datina.js`)
   - Fragmento: «cambiarTexto(el.querySelector(".dp-num"), fila ? c.f(fila[c.k]) : invita ? "Elegí una provincia" : c.f(c.pais), animar);»
   - Motivo: Si una provincia elegida no tuviera dato de turistas extranjeros (la única tarjeta sin total del país), la cifra diría "Elegí una provincia" con una provincia ya elegida. Hoy no pasa: las 24 tienen dato.
   - Propuesta: invita ? (NOMBRES[prov] ? "Sin dato" : "Elegí una provincia").

20. **cruces.html, indice.html** (`scripts/02_procesar.py`)
   - Fragmento: «"pensiones_invalidez": ("Pensiones por discapacidad",»
   - Motivo: Los dos cambios de nombre de CRUCES_META (pensión por invalidez y segunda vuelta) solo se ven después de correr 02_procesar.py.
   - Propuesta: Correr python scripts/02_procesar.py y pruebas_datos.py antes de armar, o dejar esos dos cambios para la próxima actualización.

## Portada, navegación y piezas comunes (9)

1. **contacto.html** (`scripts/plantilla.html`)
   - Fragmento: «Para avisar de un error en un dato, sugerir una fuente o una pregunta, o contar cómo usás Datina. / El formulario de contacto todavía no está disponible.»
   - Motivo: La bajada ofrece algo que la página no da: no hay canal para escribir. Es la decisión 2 de la sección 13 del plan.
   - Propuesta: Un correo del proyecto o los «issues» del repositorio, y que la bajada diga cómo usarlo. Si el autor deja la página como está, que la bajada diga «Todavía no hay un canal para escribirle a Datina» en lugar de prometerlo.

2. **todas las páginas** (`scripts/03_construir_sitio.py`)
   - Fragmento: «FLECHA_ANT, FLECHA_SIG («← Anterior», «Siguiente →», «Todos los temas →») y «al final de la página ↓» en gancho()»
   - Motivo: La regla de diseño dice «sin flechas decorativas» y la auditoría las marcó. Sacarlas cambia lo que se ve: necesita aprobación visual.
   - Propuesta: Sacar las flechas y dejar «Anterior», «Siguiente», «Todos los temas» y «al final de la página».

3. **páginas de sección con provincia elegida, portada (tarjeta del mapa)** (`scripts/datina.js`)
   - Fragmento: «Posición ${orden} de ${c.d.length}, de mayor a menor. / ${pos}.º de ${x.d.length}, de mayor a menor.»
   - Motivo: La auditoría pide «la 3.ª más baja de 24» en lugar de dar vuelta el puesto. Es la misma frase que el perfil provincial (grupo G6a): conviene cambiarlas juntas, y el puesto desde abajo es una cuenta nueva (n − puesto + 1).
   - Propuesta: Si el autor lo aprueba: «la N.ª más alta de 24» si el puesto está en la mitad de arriba y «la N.ª más baja de 24» si está en la de abajo, en el perfil, en «En cifras» y en la tarjeta del mapa a la vez.

4. **salud.html#f-mortalidad, energia.html#f-hogares, pobreza.html#f-pobreza** (`scripts/datina.js`)
   - Fragmento: «OCDE_VISTA: f-mortalidad → gasto_salud, f-hogares → co2, f-pobreza → pobreza_relativa y gini»
   - Motivo: R2 pide además sacar los botones OCDE que no responden la pregunta de su ficha (el gasto en salud no contesta por la mortalidad infantil). Sacar un botón está fuera de esta tarea. Los botones ya nombran la medida y la nota avisa que es otra.
   - Propuesta: Sacar gasto_salud de f-mortalidad y co2 de f-hogares, o llevarlos a una ficha propia de comparación internacional.

5. **buscador (todas las páginas)** (`scripts/datina.js`)
   - Fragmento: «IDX.push({t: "La Corte Suprema: quién designó a cada juez", g: "Historias", u: "corte-suprema.html",»
   - Motivo: El título de la pieza va escrito dos veces a mano: en el buscador y en data-titulo de la plantilla (otro grupo). Si se cambia uno, el otro queda distinto.
   - Propuesta: Que el buscador tome el título del índice (03 ya lee las piezas en PIEZAS) o, si el otro grupo cambia el título, cambiar también esta línea.

6. **nosotros.html** (`scripts/plantilla.html`)
   - Fragmento: «Sobre nosotros (falta «Quién lo hace», el enlace al código MIT, «Cómo citar» y la fecha de la última actualización)»
   - Motivo: La auditoría lo marcó (P1). Necesita datos que el repositorio no tiene (quién firma, si el repositorio es público) o una sección nueva.
   - Propuesta: Un párrafo «Quién lo hace» y el enlace al repositorio si es público. «Cómo citar» con un ejemplo para copiar (F2 del plan). La fecha de la última actualización puede salir de {{actualizado}} con el mismo formato en palabras.

7. **provincia.html** (`scripts/datina.js`)
   - Fragmento: «document.title queda en «Tu provincia | Datina» con una provincia elegida»
   - Motivo: Cambiar el título de la pestaña al elegir una provincia es comportamiento nuevo, no redacción (auditoría P0, grupo del perfil).
   - Propuesta: Que datina.js ponga «{Provincia} en números | Datina» al elegir, y las páginas fijas por provincia del plan (D3) para compartir.

8. **index.html#destacados** (`scripts/03_construir_sitio.py`)
   - Fragmento: «Datos destacados»
   - Motivo: La pregunta de cada destacado ya contesta la cifra del país. D7 propone además mostrar el rango provincial debajo de la cifra, que es diseño.
   - Propuesta: Una tira con las 24 provincias o la más alta y la más baja debajo de cada cifra (aprobación visual).

9. **index.html (Herramientas)** (`scripts/plantilla.html`)
   - Fragmento: «Para cruzar indicadores, ordenar las provincias según lo que te importa…»
   - Motivo: La bajada describe siete herramientas porque el menú tiene siete. La auditoría propone un menú de cinco (decisión 7 del autor).
   - Propuesta: Si el autor simplifica el menú, la bajada queda en dos oraciones: «Para preguntar, cruzar, ordenar y bajar los datos. Cada número muestra de dónde sale.»

## Catálogo, Explorador de relaciones, consultas con IA, consultor de pobreza y README (18)

1. **catalogo.html, consulta-ia.html (meta description y og:description)** (`scripts/03_construir_sitio.py`)
   - Fragmento: «descr = f"{titulo}: {preg} Datos por provincia con su fuente, su año y la tabla para descargar."»
   - Motivo: La fórmula es la misma para todas las secciones y no describe estas dos herramientas: Consultas con IA no son 'datos por provincia', y el Catálogo es justamente la lista de tablas. Cambiarla toca todas las páginas (otro grupo).
   - Propuesta: Una descripción propia para las herramientas. Catálogo: 'Catálogo de datos: ¿Qué datos puedo bajar? Las tablas de Datina con su fuente, su período, su cobertura y sus columnas, para descargar en CSV.' Consultas con IA: 'Consultas con IA: ¿Qué querés saber de los datos? Un modelo de inteligencia artificial contesta preguntas sobre la Argentina y sus provincias con las tablas de Datina y muestra las fichas de las que salen los datos.'

2. **relaciones.html, catalogo.html (organismo DEIS)** (`datos/manual/relaciones.json`)
   - Fragmento: «"nombre": "Dirección de Estadísticas e Información de Salud" (fuente org:deis)»
   - Motivo: El nombre oficial es 'Dirección de Estadísticas e Información en Salud', como la escribe el pie de f-mortalidad en la plantilla (línea 685) y uno de sus alias. No entra como cambio porque el mismo texto es también un alias de org:deis y un 'original' sin escapar no puede apuntar solo al nombre (los alias no se cambian).
   - Propuesta: Cambiar a mano solo el valor de 'nombre' de org:deis (línea 147) por 'Dirección de Estadísticas e Información en Salud' y dejar el alias 'de Salud' como está. El validador sigue pasando: la sigla DEIS y los alias no cambian.

3. **relaciones.html (grafo y tabla)** (`datos/manual/relaciones.json`)
   - Fragmento: «"sigla": "CSJN" en org:csjn (Registro Nacional de Femicidios de la Justicia Argentina)»
   - Motivo: El grafo y la tabla muestran a los organismos por su sigla: hay dos puntos 'CSJN' (Registro de Femicidios y Oficina de Estadísticas). El valor 'CSJN' se repite en el archivo y no se puede apuntar a uno solo con un fragmento sin escapar. Una sigla oficial que el repositorio no documenta sería inventarla.
   - Propuesta: Cambiar a mano la sigla de org:csjn por 'Registro de Femicidios' (nombre corto, como 'Hacienda' o 'Seguridad Social'), o por 'RNFJA' si el autor confirma que es la sigla que usa la Oficina de la Mujer de la Corte. El pie de f-muertes sigue validando por el nombre completo, que está en los alias.

4. **consulta-ia.html (respuesta fija sobre suicidio del motor gratis)** (`functions/_ia/consulta.mjs`)
   - Fragmento: «Datina trata ese tema en la sección Salud, sin cifras destacadas ni comparaciones entre provincias. … 135 desde la Ciudad de Buenos Aires y el Gran Buenos Aires …»
   - Motivo: La primera oración no es exacta: Salud tiene la ficha de suicidio por provincia (f-suicidio-prov), que compara las 24 jurisdicciones, y su forma está en discusión (decisión del autor, sección 13, punto 3). Además dice 'la Ciudad de Buenos Aires' donde el recuadro de ayuda del sitio dice 'CABA'. Es un tema sensible y un texto fijo de la función: lo decide el autor.
   - Propuesta: Datina trata ese tema al final de la sección Salud. Si estás atravesando un momento difícil, o alguien cercano lo está, podés pedir ayuda. El Centro de Asistencia al Suicida atiende gratis en el 135 desde CABA y el Gran Buenos Aires, y en el (011) 5275-1135 desde todo el país. En una emergencia, llamá al 107. (Conserva 135 y 107, que busca scripts/prueba_consulta_ia.mjs, y las tres líneas.)

5. **consulta-ia.html** (`scripts/plantilla.html, scripts/03_construir_sitio.py`)
   - Fragmento: «La pregunta la contesta un modelo abierto de inteligencia artificial que corre en Cloudflare»
   - Motivo: La auditoría propone nombrar el modelo (hoy Llama 3.3, de Meta). No se escribe a mano porque DATINA_IA_MODELO_CF lo cambia sin tocar el sitio y el texto quedaría mal.
   - Propuesta: Si el autor quiere nombrarlo, que 03 lo tome de MODELO_CF de functions/_ia/consulta.mjs al armar, no escrito en la plantilla.

6. **consulta-ia.html#ia-pregunta** (`scripts/plantilla.html`)
   - Fragmento: «placeholder="Una pregunta sobre la Argentina o una provincia"»
   - Motivo: Decisión del autor (PLAN_MEJORA.md, sección 13, punto 11).
   - Propuesta: Un ejemplo solo en este campo: 'Por ejemplo: ¿cuánto se gana en Neuquén?' (una pregunta que el motor gratis ya contestó bien en la prueba del 26 de octubre de 2026).

7. **catalogo.html (filtro 'Con datos de')** (`scripts/catalogo.py`)
   - Fragmento: «sel("cat-anio", "Con datos de", "Cualquier año", op_anio)»
   - Motivo: Tiene 178 opciones, de 2040 a 1863, y los años futuros son proyecciones. Cambiarlo es cambiar el filtro (auditoría).
   - Propuesta: Rangos: 'antes de 2000', '2000 a 2019', '2020 en adelante' y 'proyecciones'.

8. **catalogo.html (filtro Tema)** (`scripts/catalogo.py`)
   - Fragmento: «<optgroup label="Otras páginas del sitio">»
   - Motivo: El filtro mezcla temas con lugares del sitio (Tu provincia, Cruces, Laboratorio, Departamentos). Se corrigió solo el nombre del grupo, que no describía lo que trae.
   - Propuesta: Temas en el orden de GRUPOS y un filtro aparte 'Aparece en' (auditoría).

9. **catalogo.html (bajadas repetidas)** (`scripts/catalogo.py`)
   - Fragmento: «f'<p class="cat-sub">{e(d["sub"])}</p>'»
   - Motivo: Las tablas de una misma ficha llevan la bajada de la ficha: las tres de nacidos en otro país dicen lo mismo y solo el nombre del archivo las distingue. Distinguirlas pide un dato por tabla que hoy no existe.
   - Propuesta: Una descripción por tabla en datos/manual/catalogo.json para las tablas que comparten ficha (por provincia, por departamento, por país de nacimiento).

10. **catalogo.html (Actualización de las proyecciones)** (`scripts/plantilla.html`)
   - Fragmento: «Se actualiza cada año. (en las fichas de proyecciones de población)»
   - Motivo: Sale de FRECUENCIA y del pie de esas fichas (otro grupo). Las proyecciones 2022 a 2040 del INDEC no se publican cada año.
   - Propuesta: 'Se actualiza con cada nueva proyección del INDEC.' en las fichas de proyecciones, que el catálogo copia solo.

11. **relaciones.html** (`scripts/03_construir_sitio.py (MENUS)`)
   - Fragmento: «Explorador de relaciones en el menú Herramientas»
   - Motivo: Es una herramienta de auditoría (nombres de archivo, códigos, líneas de programa). Sacarla del menú es un cambio de navegación: decisión del autor (sección 13, punto 7).
   - Propuesta: Enlazarla desde Sobre nosotros ('Cómo se hace'), desde el pie y desde cada tabla del Catálogo ('Ver su origen').

12. **relaciones.html** (`scripts/relaciones.html, scripts/relaciones.js`)
   - Fragmento: «Grafo»
   - Motivo: Término técnico para el público general. Aparece en el botón de vista, en aria-roledescription, en el aria-label del dibujo y en relaciones.js.
   - Propuesta: 'Diagrama' en todos esos lugares a la vez, si el autor lo prefiere.

13. **relaciones.html, catalogo.html, nosotros.html** (`scripts/relaciones.js, scripts/catalogo.py`)
   - Fragmento: «46 organismos, 167 archivos y 141 fichas / 209 tablas»
   - Motivo: Tres conteos distintos sin explicar (auditoría, P2): el Explorador no tiene las fichas de suicidio ni las herramientas, y el Catálogo cuenta tablas, no fichas.
   - Propuesta: Una aclaración fija bajo la cuenta del Explorador: 'Sin las fichas sobre suicidio ni las herramientas.'

14. **pobreza/ (menú del consultor)** (`pobreza/observablehq.config.js`)
   - Fragmento: «<a href="./">Consultas</a>»
   - Motivo: Dos herramientas se llaman 'Consultas' (Consultas con IA y esta). Es un menú: queda para el autor.
   - Propuesta: 'Consultor de pobreza' en lugar de 'Consultas', el nombre que le da el resto del sitio.

15. **pobreza/** (`pobreza/src/index.md`)
   - Fragmento: «d.periodo === "1S 2026" (ultimoDe), value: ... "1S 2026" (selector Semestre), 36,9% y 11,1% (calibración), unos 30,1 millones de personas»
   - Motivo: El último semestre y las cifras de calibración están escritos a mano. pobreza/README.md (paso 2) dice actualizarlos cada semestre, pero si se olvida, la bajada sigue mostrando el semestre viejo. Leerlos de los datos es cambiar el código.
   - Propuesta: Que ultimoDe y el valor inicial del selector tomen el último período de la serie (periodos.at(-1)), y que las cifras de calibración salgan de la tabla gba_partidos_comunas o de ALL.json.

16. **pobreza/** (`pobreza/README.md`)
   - Fragmento: «En `src/index.md` buscá los textos que mencionan 1S 2026, 1T 2026 o los totales de calibración (36,9% y 11,1%) y actualizalos.»
   - Motivo: Con los cambios de este grupo esos textos dicen 'primer semestre de 2026' y 'primer trimestre de 2026': la búsqueda del paso 2 ya no los encuentra. Es documentación técnica, fuera del alcance de la reescritura.
   - Propuesta: Sumar al paso 2: 'primer semestre de 2026', 'primer trimestre de 2026' y 'segundo semestre de 2016' en src/index.md, y las mismas frases en las descripciones de TABLAS de scripts/exportar_parquet.py.

17. **pobreza/ (gráfico de la consulta guiada)** (`pobreza/src/index.md`)
   - Fragmento: «tip: {format: {x: true, y: (v) => num1(v) + "%", fill: true, z: true}}, channels: {"CV %": …, Nombre: …}»
   - Motivo: Los cuadros emergentes de Plot pueden mostrar nombres internos de los canales (periodo, valor_pct) cuando el eje no tiene etiqueta, y el eje del gráfico de líneas sigue con '1S 2017'. No se pudo verificar sin abrir la página.
   - Propuesta: Revisar en el navegador y, si aparecen, ponerles 'Semestre' y el mismo nombre del encabezado de la tabla con 'label' en cada canal, y tickFormat: semestreLargo si entra en el eje.

18. **pobreza/ (resultados del SQL libre)** (`pobreza/src/index.md`)
   - Fragmento: «display(Inputs.table(resultadoLibre.filas, …))»
   - Motivo: Muestra los nombres de columna que escribe la persona en su consulta: es lo esperable en un editor de SQL.
   - Propuesta: Nada.

## Historia de las provincias (10)

1. **provincia.html?prov=58** (`scripts/03_construir_sitio.py`)
   - Fragmento: «¿De dónde viene {e(NOMBRE_PROV[c])}?»
   - Motivo: La historia va antes que las cifras: la primera cifra queda a 1.223 píxeles en 1440x900 y a 1.919 en el celular (auditoría, herramientas-y-perfiles.md, P1 y sección B). Es orden de la página, no redacción.
   - Propuesta: Preguntar al autor si la historia va al final del perfil, plegada arriba o donde está (auditoría, sección B, punto 9).

2. **provincia.html (las 24 jurisdicciones)** (`scripts/03_construir_sitio.py`)
   - Fragmento: «Textos de Datina a partir de sitios oficiales de cada provincia»
   - Motivo: El _leeme y el campo de dudas de cada jurisdicción dicen que los textos se armaron con los extractos del buscador, sin abrir las páginas, y que conviene abrir cada enlace antes de publicar (en San Luis, Santa Cruz y Santa Fe se agotó además el cupo de búsquedas). La página no lo dice y ya está publicada.
   - Propuesta: Que el autor decida entre verificar las fuentes antes de difundir o sumar al texto fijo de Fuentes una oración como "Los textos se armaron con los resúmenes que muestran los buscadores de cada página citada. Si encontrás un error, avisanos." (esto último depende de que haya un canal de contacto).

3. **provincia.html?prov=50 y ?prov=70** (`datos/manual/provincias_historia.json`)
   - Fragmento: «José Félix Aldao»
   - Motivo: Fuentes que no son oficiales ni académicas: Mendoza cita dos notas del diario Los Andes (fundacion_capital y guerras_civiles) y San Juan cita la Wikipedia en inglés (guerras_civiles, Rodeo del Medio). Los campos de dudas dicen en otros casos que un diario no se cita. Es criterio de fuentes, no de redacción.
   - Propuesta: Reemplazarlas por una fuente oficial o académica, o aceptarlas y decirlo en el texto fijo de Fuentes.

4. **provincia.html (CABA, Chubut, Entre Ríos, Jujuy, Neuquén, Salta y Santa Fe)** (`scripts/03_construir_sitio.py`)
   - Fragmento: «if f.get("url", "").startswith("https://"))»
   - Motivo: Ocho entradas de fuentes (siete direcciones) usan http y la lista de Fuentes las omite sin avisar (por ejemplo "Plena autonomía de la Ciudad" en CABA y "Productos de mar" en Chubut). Es dato y código, no redacción.
   - Propuesta: Pasarlas a https si el sitio lo permite y, si no, mostrarlas igual o reemplazarlas.

5. **provincia.html?prov=30** (`datos/manual/provincias_historia.json`)
   - Fragmento: «primera provincia en producción avícola»
   - Motivo: Afirmación de hoy sin año ni fuente del dato en el texto (los criterios piden período). Agregarlo requiere confirmar el año en la fuente.
   - Propuesta: "Es la primera provincia en producción avícola según [organismo], [año]", con el año que dé la fuente citada.

6. **provincia.html?prov=86** (`datos/manual/provincias_historia.json`)
   - Fragmento: «mayor productora de algodón»
   - Motivo: Afirmación de hoy sin período. El campo de dudas dice que el INTA la da como primera productora desde la campaña 2015-16, pero no se confirmó en el texto citado.
   - Propuesta: Si la fuente lo confirma: "Desde la campaña 2015-2016 es la mayor productora de algodón del país".

7. **provincia.html?prov=90** (`datos/manual/provincias_historia.json`)
   - Fragmento: «la mayor productora de azúcar del país»
   - Motivo: El azúcar y el limón se dan como liderazgos de hoy sin período. El campo de dudas dice que la participación cambia con los años.
   - Propuesta: Sumar el año del informe citado ("según el informe de cadenas productivas de [año]").

8. **provincia.html?prov=86** (`datos/manual/provincias_historia.json`)
   - Fragmento: «en su mayoría bilingües con el castellano»
   - Motivo: Pendiente de verificación factual: por la sintaxis, "en su mayoría bilingües" describe a los migrantes de Bolivia y Perú, pero lo más probable es que se refiera a los hablantes de quichua santiagueño. El campo de dudas no lo aclara y no se puede resolver sin abrir la fuente.
   - Propuesta: Si se refiere a los hablantes: "En la provincia se habla el quichua santiagueño. Sin contar a los migrantes de Bolivia y Perú, es la variedad quechua con más hablantes del país. La mayoría de sus hablantes también habla castellano."

9. **provincia.html?prov=90** (`datos/manual/provincias_historia.json`)
   - Fragmento: «incluía a Santiago del Estero y Catamarca»
   - Motivo: Pendiente de verificación factual: el texto dice que la provincia creada en 1814 incluía a Santiago del Estero y Catamarca, pero el campo de dudas dice que ese dato sale del Museo Histórico Nacional y se refiere a la República del Tucumán de 1820. Puede que la fuente no respalde la frase tal como está.
   - Propuesta: Revisar la fuente y, si habla de la República, mover la inclusión a la última oración: "En 1820 Bernabé Aráoz proclamó la República del Tucumán, que incluía a Santiago del Estero y Catamarca, y fue su presidente."

10. **provincia.html (las 24 jurisdicciones)** (`scripts/03_construir_sitio.py`)
   - Fragmento: «f"{_miles(HAB[c])} en {HAB_ANIO}"»
   - Motivo: Los habitantes salen del año de población que usa todo el sitio (ANIO_POB = 2025, decisión documentada del autor). La auditoría pregunta si pasa a 2026. Es dato.
   - Propuesta: Pregunta al autor de la auditoría (sección B): ¿la población pasa a 2026?
