Revisión de solo lectura de Energía, Petróleo y gas, Movilidad, Flora y fauna y Curiosidades. No toqué ningún archivo del repositorio. Revisé las cifras dudosas contra `sitio/datos/*.csv`, el resumen de `sitio/datos/fichas.json`, `scripts/plantilla.html` y `scripts/datina.js`. Muchas advertencias clave existen, pero solo dentro del ícono "Sobre los datos", que el volcado no muestra: base del índice, CABA junto con Buenos Aires, falta de Tierra del Fuego, alcance de la SUBE, regalías mineras, La Pampa con dato de 2024. Las cuento como P1 (ocultas), no como faltantes.

## A) Hallazgos por gravedad

| Grav. | Página | Ficha | Cita | Qué está mal | Propuesta |
|---|---|---|---|---|---|
| P0 | movilidad | f-patentes, En cifras, f-patentes-prov | "658.735 motos nuevas se inscribieron en 2025, más que autos" | El total suma las 29.005 motos de Tierra del Fuego (159 cada 1.000), que la misma página llama "probable error". Sin ellas son unas 630 mil y la ventaja sobre los autos baja de 43 mil a unos 15 mil. El promedio de 14,2 cada 1.000 también las incluye (sin ellas, cerca de 13,7). | Sacar Tierra del Fuego del total y del promedio del país, o avisar que lo incluye. Revisar el titular "más motos que autos". |
| P0 | naturaleza | f-visitas y f-visitas-parque | "Entre enero y abril de 2026 las visitas bajaron 0,2%" / "...junio... 7,3% más altas" | Mismo indicador en la misma página, con dos fuentes (SINTA y tablero de la APN), dos períodos y signo contrario. | Un solo dato de 2026, de una sola fuente (la que llega a junio). Mejor todavía: unir las dos fichas. |
| P0 | petroleo | f-pozos y f-mapa-pozos | "Los 2.922 de shale" / "2.918 eran de shale y 1.226 de tight" | Mismo mes (agosto de 2026) con conteos distintos: shale 2.922 contra 2.918, tight 1.236 contra 1.226. Además 2.918 + 1.226 = 4.144, no los 4.148 de la clave. Causa: archivos de fechas distintas (`se_pozos_resumen` del 23 de octubre, `se_pozos_nc` del 5), por la caída del servidor. | Que las dos fichas usen el mismo archivo, o unirlas. Explicar los 4 pozos que no son ni shale ni tight. |
| P0 | petroleo | En cifras (3) | "72,4% ... de pozos de shale. En 2025, la producción no convencional fue el 63,0%" | Compara shale de un mes con no convencional (shale más tight) de un año. El no convencional de agosto es 72,8% (`pct_nc`). | "72,8% del petróleo de agosto de 2026 fue no convencional, contra 63,0% en 2025". |
| P0 | petroleo | f-regalias | "superaron el 10% ... en 3 provincias y el 1% en 9. En las otras 15" | Jujuy se ve "1,0%" (es 0,96) y entra en "menos del 1%". Corrientes también se ve "1,0%" (1,006) y entra entre las 9. Se puede leer 3+9+15 = 27. | "Más del 10% en 3 provincias. Entre 1% y 10% en otras 6. Menos del 1% en las 15 restantes." Usar dos decimales cerca del corte. |
| P1 | petroleo | f-regalias | "Regalías en los ingresos de cada provincia, 2025" | La Pampa es de 2024 (solo lo dice la nota oculta). Suma regalías mineras e hidroeléctricas (San Juan, Corrientes, Misiones) en la página de petróleo. | Sub: "2025 (La Pampa, 2024)". En el lead: "Incluye regalías de petróleo, gas, minería e hidroelectricidad". Pregunta en B. |
| P1 | petroleo | f-mundo-petroleo | "productores de petróleo y gas del mundo, 2025" | La vista Gas es de 2024 (`gas_bcm.anio`). La sub promete 2025 para las dos. | "petróleo, 2025, y gas, 2024". |
| P1 | petroleo | f-mundo-petroleo | "en 2025 la Argentina produjo 794 mil barriles" | En la misma página, 2025 da 803 mil según la Secretaría de Energía (detrás del 11,0% de Loma Campana y de los 13,4 años). La explicación está en la nota oculta. | Llevarla al lead: "La Secretaría de Energía registra 803 mil. La EIA estima a todos los países con el mismo criterio". |
| P1 | movilidad | f-combustibles y En cifras | "2.139 pesos ... en julio de 2026" | Dato de hace tres meses, al lado de la SUBE de septiembre. El archivo crudo es del 5 de octubre y datos.energia.gob.ar no contesta desde el 23. El pie dice "Se actualiza cada mes". El artículo de la nafta en dólares también queda en julio. | Pie: "Último dato: julio de 2026". Mientras siga caído el servidor, sacar la nafta de "En cifras" o aclararlo. |
| P1 | petroleo | toda la página | "928 mil ... agosto de 2026" | Producción, provincias, áreas, empresas, mapa y pozos terminados salen de archivos del 3 y 5 de octubre. Si la Secretaría ya publicó septiembre, no va a entrar. "Se actualiza cada mes" deja de ser cierto. | Fecha de descarga en "De dónde sale" y un aviso cuando el archivo tenga más de 30 días. |
| P1 | petroleo | f-fracturas | clave "3.089 m de rama horizontal" | La pregunta pide etapas de fractura y la clave contesta otra cosa. La respuesta (23.612) está en el lead. "Etapa" y "rama horizontal" sin explicar. | Clave: "23.612 etapas de fractura en 2025, el 99,8% en Vaca Muerta". En el lead, la rama con definición: el tramo del pozo que corre acostado dentro de la roca. |
| P1 | petroleo | f-pozos-terminados | "564 fueron de explotación y 67 de exploración o de avanzada" | 564 + 67 = 631 de 687. Faltan 56 de servicio, que figuran en la leyenda. "Hoy" es vago. Repite la rama horizontal de f-fracturas. | "De los 687, 564 fueron de explotación, 67 de exploración o avanzada y 56 de servicio". Sacar la rama. |
| P1 | petroleo | f-pozos | clave "18 veces" y lead "18 veces menos" | La clave y el lead repiten la misma cifra. | Lead sin el 18: pozos por provincia o la parte del gas. |
| P1 | petroleo | f-areas-hidro | clave "54,7% ... diez áreas" y lead "las diez ... 54,7%" | Repite la clave. Tres recortes distintos: 8 áreas en el lead, 10 en la clave, 15 en el gráfico. | Clave: "8 áreas dieron la mitad del petróleo en 2025". Sacar el 54,7% del lead. |
| P1 | petroleo | f-areas-hidro (selector) | "El Porton_mendoza", "Gobernador Ayala Iii", "Cnq 7/a", "Rio Mayo" | Nombres crudos de la fuente: guion bajo, números romanos rotos, sin tildes. "Confluencia Sur" aparece dos veces sin provincia. 280 opciones sin orden a la vista. | Limpiar los nombres, agrupar por provincia, buscador en lugar de una lista larga. |
| P1 | petroleo | f-empleo-hidro | clave "61.525 ... en todo el país" | Es la suma de las 9 provincias con dato (lo dice la nota oculta). El lead termina en "Neuquén tenía 25.154", que repite el gráfico. Que CABA esté tercera se explica solo en la nota. El CSV se llama `empleo_construccion_provincias.csv`. | Clave: "en las 9 provincias con dato". Lead: "CABA aparece porque el registro cuenta el empleo donde declara la empresa". Poner la baja de 10,6% al lado de la suba de producción de 16,1%, sin afirmar una causa. |
| P1 | petroleo | f-balanza-energetica | "exportó 11.100 millones ... importó 3.271" | Repite Sector externo (combustibles: 12,7% de lo exportado y 4,3% de lo importado). Mezcla dos clasificaciones. El título promete energía y la respuesta es en dólares. | Una sola ficha con enlace desde la otra página. Pregunta en B. |
| P1 | petroleo | f-empresas-hidro | "Pluspetrol" y "Pluspetrol Cuenca Neuquina", "Pampa Energia" | El mismo grupo en dos barras, nombres sin tilde, "las 11 del gráfico" es un corte arbitrario. El lead no interpreta. | Agrupar por grupo empresario o avisarlo a la vista. Lead: cómo cambió la parte de YPF en diez años. |
| P1 | energia | f-hogares y f-actividad | "Hogares 221 / Resto 120", "Electricidad 153" | Índices sin unidad a la vista. "Índice con base 2005 = 100" quedó dentro del ícono. Las dos fichas usan la misma tabla (`energia_hogares.csv`). | Rótulo "2005 = 100" en el gráfico. Unir las dos fichas en una con dos vistas. |
| P1 | energia | f-hogares (botones) | "OCDE: CO₂ POR HABITANTE, 2024" | Emisiones de CO₂ en una ficha sobre la parte de los hogares en la demanda eléctrica. No responde a la pregunta. | Sacarlo, o llevarlo a una ficha de emisiones en Flora y fauna. |
| P1 | energia | f-centrales | clave "15,8% de la potencia ... eólica o solar" + "OCDE: EÓLICA Y SOLAR EN LA GENERACIÓN" | Potencia instalada (capacidad) comparada con generación. Cuatro botones en dos filas. El listado tiene 2 nucleares (Embalse, Atucha II), pero el 4,0% de potencia nuclear incluye Atucha I. | Comparar generación con generación (CAMMESA la publica por fuente). Explicar Atucha I. Pregunta en B. |
| P1 | energia | f-electricidad-sectores | "INDUSTRIAS / COMERCIOS / PARTES" | "Industrias" incluye a los grandes comercios. "Comercios" incluye pequeñas industrias, clubes y alumbrado público. "Partes" no dice nada. Los 6.450 kWh de Chubut se explican solo en la nota (una gran planta). | "Grandes usuarios / Comercios y servicios / Reparto". Lead: "En Chubut, los grandes usuarios usan el 76,7% de la electricidad". |
| P1 | energia | f-electricidad-provincias y -sectores | "CABA y Buenos Aires 1.644" | 22 barras: CAMMESA junta CABA con Buenos Aires y no informa Tierra del Fuego. Solo lo dice la nota oculta. | Una oración en el lead que lo diga. |
| P1 | energia | f-gas-consumo | sub "1993 a agosto de 2026", clave y lead de 2025 | No usa el dato de 2026 que ya existe: +4,0% por usuario entre enero y agosto. Faltan cuatro provincias sin explicar. | Sumar el acumulado de 2026. "Formosa y Misiones no tienen red de gas natural. Corrientes y Chaco tienen menos de mil usuarios". |
| P1 | energia | f-actividad | "La actividad económica del gráfico sale del EMAE" | Metodología dentro del lead. No contesta la pregunta. Repite el +1,6% de "En cifras". | Unirla con f-hogares. Lead: "Desde 2005, la demanda total creció 53,0% y la economía 40,1%. La del resto de los usuarios creció 20,3%, menos que la economía". |
| P1 | energia | f-subsidios | "en pesos de igual valor" / "El más alto fue el de 2016, el primer año" | Jerga distinta del resto del sitio. Como la serie arranca en su máximo, parece una caída sin fin. | "descontada la inflación". Aclarar que la serie empieza en 2016 y no se compara con años anteriores. |
| P1 | movilidad | f-sube | clave "5,23 millones de tarjetas distintas" | No dice que la SUBE cubre el AMBA y algunas ciudades (está en la nota oculta). Falta la conclusión: hay 1,2% más tarjetas que antes de la pandemia. | Lead: "La SUBE funciona en el AMBA y en decenas de ciudades. No cuenta las que tienen sistema propio". Nombrar esas ciudades después de verificarlas. |
| P1 | movilidad | f-sube-modos | "el subte 53,0% menos, aunque desde diciembre de 2024 parte..." | Da como principal una cifra del subte que el mismo texto reconoce que no se puede comparar. Una oración de 45 palabras. | Sacar el 53% o cortar la serie del subte en noviembre de 2024. Ver A2. |
| P1 | movilidad | intro | "acompañan el nivel de actividad y el poder de compra" | Afirma una relación que ningún dato de la página muestra. No nombra la nafta. "autos y motos nuevas" tiene mal la concordancia. | Ver A2. |
| P1 | movilidad | f-patentes-prov | "es probable un error en el dato abierto" | Lead de 70 palabras con dos "dos puntos" seguidos, cortado en "Ver más". La advertencia va metida en el lead. | Llevar lo de Tierra del Fuego a una nota visible. Ver A2. |
| P1 | movilidad | f-combustibles | "NAFTA SÚPER / GASOIL / POR PROVINCIA / MES A MES / AÑO POR AÑO" | Cinco botones de dos dimensiones distintas en una fila. No explica por qué la Patagonia y Tierra del Fuego son más baratas. | Separar los dos grupos. Una oración sobre la exención del impuesto a los combustibles en la zona sur (verificar Ley 23.966). |
| P1 | movilidad | f-patentes | "autos" 615.138 | El DNRPA cuenta "automotores", que pueden incluir utilitarios y camiones. | Verificar y decir "autos y utilitarios" si corresponde. |
| P1 | naturaleza | f-especies | "¿Qué animales se registran más en las áreas protegidas?" | La pregunta pide animales y el gráfico muestra áreas. La clave "1.992 en Iguazú" no dice de qué. La sub no tiene período. El sesgo por estudio está solo en la nota. | Pregunta en B. Clave: "1.992 especies animales registradas en Iguazú". Lead: "El número también mide cuánto se estudió cada área". |
| P1 | naturaleza | f-parques | clave "55 áreas protegidas" | La pregunta pide superficie y la clave da una cantidad. Las notas se ven a la vista, a diferencia del resto (pie sin "Sobre los datos"). 55 áreas contra 41 parques con visitas, sin explicar. | Clave: "18,3 millones de hectáreas, siete de cada diez en el mar". |
| P1 | naturaleza | f-visitas | "¿Cuántas personas visitan los parques nacionales?" | Se miden visitas, no personas (lo dice la nota). | "¿Cuántas visitas reciben los parques nacionales?" |
| P1 | naturaleza | f-protegida | "36,7 millones de hectáreas" y "Jujuy ... 36,7%" | La misma cifra dos veces seguidas, con sentidos distintos. Falta "terrestres". "Menos de la cuarta parte" para algo ocho veces menor. | "367.000 kilómetros cuadrados terrestres". "La Pampa, 1,7%, unas ocho veces menos". |
| P1 | curiosidades | f-glaciares | sub "Glaciares por provincia" | Sin período. Cuenta glaciares, no superficie: San Juan queda primera por los glaciares chicos, cuando Santa Cruz tiene más hielo. La explicación de la ley está en Flora y fauna. | Sub con el año del inventario (verificar). Sumar la superficie, que publica el IANIGLA. Mover la ficha a Flora y fauna. |
| P1 | curiosidades | f-clima y En cifras | "con su valor de referencia" / "+0,83 °C en 2023" | La referencia (promedio 1991-2020 del SMN) está solo en el explicador. "En cifras" destaca 2023 y no el último dato. | Sub: "frente al promedio 1991-2020". En cifras: "+0,60 °C en 2025. El más cálido fue 2023 (+0,83)". |
| P1 | curiosidades | f-nombres | "En 2012, los nombres más inscriptos..." | Empieza por el año viejo. El dato de Lionel en 2023 (9.483, casi el doble que en 2022) está en `datina.js` (línea 7166) y no en la ficha. Datos de 2024 en octubre de 2026. | Empezar por 2024 y sumar Lionel. Verificar si el RENAPER ya publicó 2025. |
| P1 | curiosidades | f-yerba | "¿Cuánta yerba mate sale de los molinos?" | "Salida de molino" es jerga del INYM. Falta el dato por habitante (unos 5,7 kilos). | Pregunta en B, con kilos por habitante. |
| P1 | curiosidades | f-vino | clave "56,3% menos que en 1991" y lead "En 1991 se vendieron 1.708 millones" | El lead repite la clave. Faltan litros por habitante (unos 16 contra unos 52 en 1991). | Lead con litros por habitante. |
| P1 | todas | pies y leads | "CAMMESA", "ENARGAS", "Capítulo IV (Resolución SE 319/1993)", "Adjunto IV", "SIPA", "Resolución 1104/2004" | Siglas y normas sin traducir. CAMMESA aparece en un lead antes de explicarse. | Primera mención con su función: "CAMMESA, la empresa que administra el mercado eléctrico". "declaraciones de producción de las empresas (Capítulo IV)". |
| P2 | todas | pies | "Ministerio de Turismo y Deportes", "Ministerio de Ambiente", "Ministerio de Transporte" | Nombres de organismos anteriores a diciembre de 2023. En dos fichas seguidas, el mismo organismo con dos nombres. | Verificar el nombre vigente y usar uno solo en todo el sitio. |
| P2 | energia, naturaleza | leads | "(menos de la cuarta parte del promedio del país)" | Frase molde que achica la diferencia: se usa para 0,18 y para 0,13 del promedio. | La razón real: "unas ocho veces menos". |
| P2 | energia, petroleo, naturaleza | En cifras | "47,0%", "1.437 kWh", "928 mil", "153,0", "13,2%" | "En cifras" copia las claves casi palabra por palabra. En Energía, la cuarta cifra junta la clave y el lead de f-gas-hogares. | Datos que no estén en las claves, o un enlace a la ficha de cada cifra. |
| P2 | energia | f-gas-hogares | "menos de 3 de cada 100 hogares cocinaba" | Concordancia. Repite el 38,9% de "En cifras". | "cocinaban". Otro dato en el lead. |
| P2 | energia | f-gas-consumo | "1.131 m³" | Unidad sin referencia para el lector. | "En julio, un usuario usa 194,5 m³ y en febrero, 31,9" (`gas_mes_max_m3`). |
| P2 | energia | f-electricidad-sectores | "(los que demandan 300 kW o más)" | kW (potencia) al lado de kWh (energía), sin explicar. | "los que piden 300 kilovatios (kW) de potencia o más". |
| P2 | petroleo | f-gas y f-petroleo | "71,0% ... no convencionales" / "72,4% ... de shale" | El petróleo usa shale y el gas usa no convencional: no se pueden comparar. | Usar no convencional en las dos. |
| P2 | petroleo | f-reservas | "unos 3,9 mil millones de barriles" | Giro raro en castellano. La pregunta incluye el gas, pero clave y lead no lo nombran. | "unos 3.900 millones de barriles". Sumar el horizonte del gas: 11,3 años. |
| P2 | petroleo | f-hidro-provincias | "En total, 10 provincias producen" | 11 barras (con el Mar argentino). Barras sin unidad. | "10 provincias y el mar de jurisdicción nacional". Rótulo "mil barriles por día". |
| P2 | petroleo | f-productividad | sub "2013 a 2024" | No dice por qué falta 2025. | "Los pozos de 2025 todavía no cumplieron doce meses". |
| P2 | petroleo | f-mapa-pozos | "¿Dónde están los pozos no convencionales?" | Pregunta de lugar, sin cifra. | Ver B. |
| P2 | naturaleza | f-visitas-parque | "Tierra del Fuego (Tierra del Fuego)", "Pre Delta" / "Pre-Delta" | Rótulo redundante, el mismo nombre escrito de dos formas. 41 barras ocupan 1.257 px. | Las 15 primeras y "Ver todas". Unificar nombres. |
| P2 | curiosidades | f-carne | "a un ritmo de 45,0 kilos por año, el más bajo de la serie" | Compara ocho meses con años completos. | "el ritmo más bajo para esos meses", si se verifica, o aclararlo. |

## A2) Reescrituras de textos (una idea por oración, sujeto antes del verbo)

1. **Intro de Energía.** Antes: "La electricidad que consumen los hogares y la economía, por provincia y mes a mes, las centrales que la generan, el gas de red..." (una lista de 33 palabras sin verbo).
   Después: "Esta página muestra cuánta electricidad usan los hogares, los comercios y las industrias de cada provincia. También muestra qué centrales la generan, cuántos hogares tienen gas de red y cuánto gasta el Estado nacional en subsidios. La producción de petróleo y gas está en su propia página."
2. **Intro de Petróleo y gas.** Después: "Esta página muestra cuánto petróleo y gas producen cada provincia, cada área y cada empresa. También muestra los pozos de Vaca Muerta, el empleo, las regalías, las reservas y el comercio exterior de energía. El consumo de los hogares está en Energía."
3. **Intro de Movilidad.** Después: "Esta página muestra cuántas tarjetas SUBE se usan por día, cuántos autos y motos nuevos se inscriben y cuánto cuesta la nafta en cada provincia."
4. **f-sube-modos.** Después: "En septiembre de 2026 se usaron 600 mil tarjetas SUBE por día hábil en trenes y 299 mil en subtes. En marzo de 2020, antes del aislamiento, los trenes tenían 871 mil. Hoy tienen 31,1% menos. El colectivo tiene 4,4% más. En el subte la comparación no sirve: desde diciembre de 2024, parte de los viajes se paga sin SUBE."
5. **f-patentes-prov.** Después: "En 2025, CABA tuvo el valor más alto de autos nuevos inscriptos por habitante: 36,7 cada 1.000. Misiones tuvo el más bajo: 5,3. En motos, el más alto fue Chaco, con 29,6 cada 1.000."
   Nota visible: "Tierra del Fuego queda afuera en motos. Su dato de 2025 es decenas de veces mayor que el de los otros años. Las cámaras del sector no registran esa suba."
6. **f-electricidad-provincias.** Después: "En 2025, los hogares de La Rioja consumieron 2.078 kilovatios hora (kWh) por habitante, el valor más alto. Los de Jujuy consumieron 675, menos de la mitad del promedio. En Chaco, los hogares usan el 71,4% de la electricidad. En Chubut, el 12,8%: ahí los grandes usuarios usan el 76,7%. CAMMESA informa CABA y Buenos Aires juntas y no incluye Tierra del Fuego."
7. **f-gas-consumo.** Después: "En Tierra del Fuego, un usuario residencial consumió 7.743 metros cúbicos de gas en 2025, 6,8 veces el promedio. Le siguieron Santa Cruz (6.479) y Chubut (3.876). El más bajo fue Santiago del Estero (412). Las cinco provincias patagónicas tienen el 8,0% de los usuarios y usan el 27,9% del gas residencial. Entre enero y agosto de 2026, el consumo por usuario subió 4,0%."
8. **f-balanza-energetica.** Después: "En 2025, la Argentina exportó 11.100 millones de dólares en combustibles y energía. Importó 3.271 millones. Entre 2011 y 2023, el saldo fue negativo en 12 de 13 años. El peor fue 2013, con 6.902 millones de déficit. Entre enero y agosto de 2026, el saldo ya llegó a 7.834 millones."
9. **f-subsidios.** Después: "El valor de 2025 es el más bajo desde 2016, cuando empieza la serie y fue de 2,54%. Entre enero y agosto de 2026, los subsidios subieron 31,4% frente a los mismos meses de 2025, descontada la inflación."
10. **"El mercado eléctrico y CAMMESA".** Hoy son siete oraciones con cronología legal. Después: "CAMMESA administra el mercado eléctrico mayorista. Decide qué centrales generan en cada momento. Es una sociedad sin fines de lucro. Sus dueños son el Estado nacional y las asociaciones de generadores, transportistas, distribuidores y grandes usuarios. La creó el Decreto 1192 de 1992. De ella salen los datos de demanda de esta página."

## B) Preguntas y h1 (antes → después)

**h1 de las páginas**
- Energía: "¿Cuánta electricidad y cuánto gas usamos, y de dónde sale la electricidad?" → "¿Cuánta energía usa cada provincia y de dónde sale?"
- Petróleo y gas: "¿Cuánto petróleo y gas produce el país, dónde y quién lo produce?" → "¿Cuánto petróleo y gas produce la Argentina y dónde?"
- Movilidad: "¿Cuánto se usa el transporte público y cuánto cuesta moverse en auto?" → "¿Cuánto se usa el transporte público y cuántos autos y motos se compran?" El h1 de hoy no nombra los patentamientos. La nafta ya tiene su propia pregunta de costo.
- Flora y fauna: "¿Cuánto territorio está protegido y cuántas especies se registran en él?" → "¿Cuánto territorio protege cada provincia?" Hoy "en él" deja afuera la pesca.
- Curiosidades: "¿Cuánta carne, vino y yerba consumimos, y cuánto se calentó el país?" → "¿Cuánta carne, vino y yerba consumimos y qué nombres elegimos?" Es la versión sin clima ni glaciares, que proponemos mover a Flora y fauna.

**Fichas**
- f-actividad: "¿Cuánto acompaña la demanda eléctrica a la actividad económica?" → "¿Cuánto creció la demanda eléctrica frente a la economía?"
- f-centrales: "¿Con qué y dónde se genera la electricidad?" → "¿Qué parte de la potencia eléctrica es eólica o solar?" El mapa pasa a segunda vista.
- f-subsidios: "¿Cuánto gasta el Estado...?" → "¿Cuánto gasta el Estado nacional en subsidios a la energía?"
- f-mapa-pozos: "¿Dónde están los pozos no convencionales?" → "¿Cuántos pozos no convencionales producen en cada provincia?"
- f-pozos: "¿Cuántos pozos producen y cuánto saca cada uno?" → "¿Cuánto petróleo saca por día un pozo de shale frente a uno convencional?"
- f-fracturas: "¿Cuántas etapas de fractura se hacen por año?" → "¿Cuántas fracturas se hacen por año en Vaca Muerta?"
- f-pozos-terminados: "¿Cuántos pozos se terminan por año?" → "¿Cuántos pozos de petróleo y gas se terminan de perforar por año?"
- f-empleo-hidro: "¿Cuánto empleo registrado da el petróleo y el gas?" → "¿Cuántos empleos registrados hay en el petróleo y el gas?"
- f-regalias: "¿Cuánto pesan las regalías...?" → "¿Qué parte de los ingresos de cada provincia son regalías?"
- f-balanza-energetica: "¿Cuánta energía exporta e importa el país?" → "¿Cuántos dólares exporta e importa el país en energía?"
- f-parques: "¿Cuánta superficie protegen los parques nacionales y desde cuándo?" → "¿Cuánta superficie protegen los parques nacionales?"
- f-visitas: "¿Cuántas personas visitan...?" → "¿Cuántas visitas reciben los parques nacionales?"
- f-especies: "¿Qué animales se registran más en las áreas protegidas?" → "¿Qué áreas protegidas tienen más especies animales registradas?"
- f-yerba: "¿Cuánta yerba mate sale de los molinos?" → "¿Cuánta yerba mate se vende en el país?"
- f-glaciares: queda igual, con la superficie sumada. La versión con dos preguntas, "¿Cuántos glaciares tiene cada provincia y cuánta superficie cubren?", solo si la regla lo permite.
- f-clima: "¿Cuánto se calentó el país?" → "¿Cuánto cambió la temperatura media del país?" Es más neutra y la respuesta sigue siendo una cifra.

Las demás preguntas cumplen la regla.

## C) Orden y largo por página

Una pantalla de celular son unos 800 px. Todo lo de esta sección es cambio visual o de navegación: según CLAUDE.md, se consulta con el autor antes de hacerlo.

**Energía.** 9 fichas, 15.456 px en el celular (unas 19 pantallas). El orden cuenta una historia y ya tiene subtítulos de grupo (Electricidad, Gas en los hogares, Subsidios).
- Unir f-hogares con f-actividad: misma tabla y mismos números (120,7% y 20,3%).
- Abrir un subtítulo "Generación" para f-centrales.
- Sacar el CO₂ de la OCDE.

No necesita pestañas.

**Petróleo y gas.** 15 fichas, 21.104 px (unas 26 pantallas), sin ningún subtítulo de grupo. Es la página más pesada del grupo. Propuesta en cuatro capítulos:
1. Producción: f-petroleo, f-gas, f-mundo-petroleo (subirla, porque da el contexto), f-hidro-provincias, f-areas-hidro, f-empresas-hidro.
2. Vaca Muerta y los pozos: f-mapa-pozos unida con f-pozos (mismo mes, conteos que hoy chocan), f-fracturas unida con f-pozos-terminados (los dos hablan de actividad por año y repiten la rama horizontal), f-productividad.
3. Lo que deja: f-regalias, f-empleo-hidro, f-balanza-energetica (o solo un enlace a Sector externo).
4. Lo que queda: f-reservas.

Queda en 13 fichas y unas 21 pantallas. No recomiendo pestañas internas:
- el autor rechazó los carruseles,
- esconden contenido del buscador y de "Copiar enlace",
- rompen "lo que va junto, junto".

Alcanza con los cuatro subtítulos y una línea de cuatro enlaces debajo de la intro.

**Movilidad.** 5 fichas, 9.583 px (unas 12 pantallas). El orden es lógico: transporte público, después vehículos, después nafta. Se puede unir f-sube con f-sube-modos en una sola ficha con vistas (Total, Colectivo, Tren, Subte). El hueco grande son la seguridad vial y los vuelos (ver D). No necesita pestañas.

**Flora y fauna.** 7 fichas, 11.652 px (unas 15 pantallas).
- Orden propuesto: protegida, parques, especies (biodiversidad antes de turismo), visitas unidas con visitas por parque (resuelve el P0).
- Pesca con su propio subtítulo: no es ni flora ni fauna protegida.
- Traer glaciares y clima desde Curiosidades con un subtítulo "Clima y hielo". Ahí ya está el explicador de la Ley de Glaciares.

Conviene que el nombre visible pase a "Naturaleza y ambiente", como el archivo (`naturaleza.html`). Eso toca GRUPOS y MENUS: requiere aprobación.

**Curiosidades.** 6 fichas, 9.434 px (unas 12 pantallas). Es una bolsa sin hilo. Carne, vino y yerba forman un bloque de consumo que funciona. Nombres funciona. Glaciares y clima no son curiosidades y quedan lejos de su explicación.
- Sacar glaciares y clima.
- Sumar Lionel, el consumo por habitante de vino y yerba, y el de pollo y cerdo.

## D) Preguntas nuevas por sección

**Energía**
| Pregunta | Fuente probable | Prioridad |
|---|---|---|
| ¿Cuánta electricidad genera cada provincia y cuánta consume? | CAMMESA, generación por central | Alta |
| ¿Qué parte de la electricidad se genera con fuentes renovables? | CAMMESA, informe mensual (meta de la Ley 27.191) | Alta |
| ¿Cuánto paga un hogar por la luz en cada provincia? | Secretaría de Energía y entes provinciales, cuadros tarifarios | Alta |
| ¿Cuánto paga un hogar por el gas en cada provincia? | ENARGAS, cuadros tarifarios por distribuidora y subzona | Alta |
| ¿Cuántos hogares reciben energía subsidiada? | Secretaría de Energía, segmentación y subsidios focalizados | Media |
| ¿Cuántas horas sin luz tiene un usuario por año? | ENRE, calidad de servicio (solo AMBA) y entes provinciales | Media |

**Petróleo y gas**
| Pregunta | Fuente probable | Prioridad |
|---|---|---|
| ¿Cuánta nafta y gasoil se vende en cada provincia? | Secretaría de Energía, Resolución 1104/2004 (volúmenes, mismo archivo que los precios) | Alta |
| ¿Cuánto litio, oro y cobre se extrae y dónde? | Secretaría de Minería (SIACAM) e INDEC, complejos exportadores | Alta (podría ser una página aparte) |
| ¿Cuánto vale el barril argentino frente al Brent? | Secretaría de Energía, precios del crudo en el mercado interno | Media |
| ¿Cuánto gas se importa en invierno y desde dónde? | INDEC, Intercambio Comercial, y ENARSA | Media |
| ¿Cuánto gas se quema o se ventea en los yacimientos? | Secretaría de Energía, Capítulo IV | Media |
| ¿Cuánto invierten las empresas en cada cuenca? | Secretaría de Energía, inversiones declaradas | Media |

**Movilidad**
| Pregunta | Fuente probable | Prioridad |
|---|---|---|
| ¿Cuántas personas mueren en siniestros viales en cada provincia? | ANSV, Observatorio Vial (también DEIS) | Alta |
| ¿Cuántos pasajeros vuelan y desde qué aeropuertos? | ANAC, datos abiertos de vuelos | Alta |
| ¿Cuántos vehículos hay cada 1.000 habitantes en cada provincia? | DNRPA, parque automotor | Media |
| ¿Cuántos pasajeros y cuánta carga llevan los trenes? | CNRT, estadísticas ferroviarias | Media |
| ¿Cuántos kilómetros de rutas nacionales hay y cuánto tránsito llevan? | Vialidad Nacional, red vial y tránsito medio diario anual | Media |
| ¿Cuánto cuesta el boleto de colectivo en cada ciudad? | Secretaría de Transporte y municipios | Baja (fuentes dispersas) |

**Flora y fauna**
| Pregunta | Fuente probable | Prioridad |
|---|---|---|
| ¿Cuántas hectáreas se queman por año en cada provincia? | Servicio Nacional de Manejo del Fuego | Alta |
| ¿Cuánto bosque nativo se pierde por año? | Ley 26.331, monitoreo de la UMSEF | Alta |
| ¿Cuántos gases de efecto invernadero emite el país y qué sector emite más? | Inventario Nacional de GEI (acá iría el CO₂ que hoy está en Energía) | Alta |
| ¿Cuánto llovió frente a lo normal en cada región? | SMN, anomalías de precipitación, y Oficina de Riesgo Agropecuario | Media |
| ¿Cuántas especies están amenazadas? | SIB y categorizaciones oficiales de fauna | Media |
| ¿Cuánta superficie de humedales tiene protección internacional? | Sitios Ramsar, Ministerio de Ambiente | Baja |

**Curiosidades**
| Pregunta | Fuente probable | Prioridad |
|---|---|---|
| ¿Cuántos bebés se llamaron Lionel? | RENAPER (el dato ya está calculado) | Alta |
| ¿Cuánto pollo y cerdo come cada habitante? | Ministerio de Economía (SSPMI) y Secretaría de Agricultura | Alta |
| ¿Cuánta yerba toma cada habitante? | INYM y proyecciones del INDEC | Media |
| ¿Cuáles son los apellidos más comunes? | RENAPER, datos abiertos | Media |
| ¿Cuántas horas por día dedicamos al trabajo no pago? | INDEC, Encuesta Nacional de Uso del Tiempo 2021 | Media |
| ¿Cuántos días de calor extremo hay por año en cada ciudad? | SMN | Media (si clima pasa a Flora y fauna, va ahí) |

## E) Los 5 hallazgos más importantes

1. Movilidad: el total de motos de 2025 (658.735, en "En cifras" y en la clave) suma las 29.005 de Tierra del Fuego que la misma página llama "probable error". Sin ellas, la ventaja sobre los autos baja de 43 mil a unos 15 mil.
2. Flora y fauna muestra dos tendencias de 2026 opuestas para las visitas a parques nacionales en fichas vecinas: -0,2% hasta abril y +7,3% hasta junio, de dos fuentes distintas.
3. La caída de datos.energia.gob.ar ya mezcla cosas en mis páginas:
   - en Petróleo, conteos distintos de pozos para el mismo mes, porque salen de archivos del 5 y del 23 de octubre;
   - en Movilidad, la nafta quedó en julio de 2026 al lado de datos de septiembre;
   - además, "En cifras" de Petróleo compara shale de agosto con no convencional de 2025.
4. Hay preguntas que la clave o el gráfico no contestan (f-especies muestra áreas y no animales, f-fracturas destaca la rama horizontal, f-parques da una cantidad y no superficie). Hay advertencias esenciales que viven solo en el ícono "Sobre los datos" (índice 2005 = 100, CABA junto con Buenos Aires, falta Tierra del Fuego, alcance de la SUBE, regalías mineras, La Pampa con dato de 2024): cada una merece una oración en el lead.
5. Arquitectura:
   - Petróleo y gas son 26 pantallas de celular sin subtítulos y con dos pares de fichas para unir. Conviene ordenarla en cuatro capítulos, sin pestañas.
   - Glaciares y clima están en Curiosidades, pero su explicación está en Flora y fauna.
   - f-balanza-energetica repite Sector externo, y f-hogares con f-actividad usan la misma serie.
