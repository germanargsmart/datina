# Plan de mejora de Datina

Auditoría completa del 26 de octubre de 2026, sobre `main` en el commit ec326a6 (después de unir el PR #11).

Datina tiene datos sólidos y textos que a veces los contradicen. La tabla completa no tiene un solo valor vacío ni una fila repetida. Pero en una misma ficha, la cifra destacada dice una cosa y el gráfico otra. Este plan dice dónde pasa, por qué pasa y en qué orden arreglarlo.

## Cómo se hizo

- Se abrieron las 53 páginas armadas en Chrome sin ventana, a 1440 y 390 píxeles, y se guardó todo el texto visible: 148 fichas, 18 artículos y las herramientas.
- Seis revisores leyeron todo el texto, cada uno un grupo de páginas. Cada error grave se verificó después contra las tablas de `sitio/datos/`.
- Se midieron impresión, peso, animaciones, controles por ficha y alto de cada página.
- Se perfiló `datos/ordenado/tabla_larga.csv` (228 variables).
- Dos investigaciones buscaron fuentes nuevas y funciones de los mejores sitios de datos del mundo.
- Los informes completos de cada revisor están en `docs/roadmap/auditoria-2026-10/`. Este plan los resume y los ordena.

Cada punto lleva:
- **Gravedad.** P0: un error que el lector ve. P1: ruido que confunde. P2: estilo.
- **Esfuerzo.** Bajo (horas), medio (un día), alto (varios días).
- **Cómo se verifica.** Qué prueba o medida lo confirma.
- **¿Aprobación visual?** Sí cuando cambia cómo se ve el sitio (regla del autor del 3 de octubre de 2026).

## Resumen en diez puntos

1. **Hay errores de dato visibles.** Once diputados del PRO figuran en el bloque "Partido Bloquista de San Juan" en las votaciones de YPF e Irán. Sector privado suma las provincias y lo llama total del país, contra su propia nota.
2. **Muchas fichas se contradicen solas.** La cifra destacada y el gráfico muestran años, unidades o medidas distintas, sin aviso. Pasa en al menos 11 fichas.
3. **Los artículos dicen "Sí" demasiado rápido.** Responden "Sí, en general" desde una correlación de 0,40, que con 24 casos el azar alcanza una vez de cada 20. Dos artículos miden casi lo mismo dos veces. Uno explica un voto de 2023 con el empleo de 2026.
4. **El sitio usa cinco escalas distintas** para decir si una relación es fuerte. Cruces llama "fuerte" a lo que los artículos llaman "moderada".
5. **Falta lo más buscado.** No hay ninguna ficha de desocupación ni de informalidad, aunque el sitio ya tiene los datos. Tampoco de coparticipación. Salud tiene 8 fichas y 4 son de suicidio y muertes violentas.
6. **Las páginas largas no tienen mapa.** Instituciones políticas mide 40 pantallas de celular, Petróleo y gas 26. Varias fichas son casi la misma pregunta dos veces.
7. **El perfil provincial arranca por la historia.** La primera cifra está a 2,4 pantallas en el celular.
8. **Nueve entradas de herramientas resuelven tres tareas.** Dos se llaman "Explorador" y dos "Consultas".
9. **No hay forma de escribirle a Datina.** Contacto no tiene formulario ni correo, y Nosotros describe formularios que no existen.
10. **Ningún cambio se prueba antes de unirse.** Las pruebas corren solo el día 5. Un PR puede romper el sitio y nadie se entera hasta la actualización.

¿Cuánto de esto es grave? En los informes, 109 de las 148 fichas tienen al menos un hallazgo P0 o P1 propio. Son 16 errores P0 (sección 1). Casi todo lo demás entra en los 14 patrones de la sección 2, y arreglar un patrón arregla decenas de fichas a la vez.

## Lo que ya está bien y no se toca

- La tabla completa: 42.853 filas, cero valores vacíos, cero filas repetidas. Todo valor raro ya tiene su motivo en `ACEPTADAS`.
- Cada ficha trae fuente, frecuencia, "Ver tabla", CSV y "Descargar imagen".
- Ningún texto visible tiene punto y coma ni "y" delante del sonido i. Lo controlaron los seis revisores.
- La accesibilidad de base: un h1 por página, títulos sin saltos, foco visible, teclado, 320 píxeles sin corrimiento.
- El armado frena ante ids repetidos, años escritos a mano y tablas sin uso.
- Las reglas de suicidio se cumplen en casi todo (ver la decisión pendiente en la sección 13).

---

## 1. Errores que el lector ve (P0)

Van primero porque dañan la confianza. Ninguno cambia el diseño.

| # | Dónde | Qué pasa | Arreglo | Cómo se verifica |
|---|---|---|---|---|
| E1 | Instituciones políticas, f-votaciones y f-votaciones-espacios | En YPF (2012) e Irán (2013), 11 diputados del PRO de CABA y Buenos Aires (Alonso, Bertol, González, Majdalani, Martínez, Michetti, Obiglio, Pinedo, Schmidt Liermann, Tonelli, Triaca) tienen el bloque "Partido Bloquista de San Juan". Son 22 filas de `votaciones_leyes_clave.csv`. El PRO sale "—" en esas leyes y Fuerzas provinciales queda inflado | Corregir el bloque en 02 (por nombre del legislador) y recalcular los textos ("votaron distinto en 24 de 25" va a cambiar) | Regla nueva en `pruebas_datos.py`: un bloque provincial no puede tener legisladores de otra provincia |
| E2 | Sector privado, f-empresas y En cifras | "609.664 empresas en todo el país, 13,1 cada 1.000" es la suma de las 24 provincias. La nota de la misma ficha dice que "las provincias suman más que el total del país" | Usar el total nacional sin doble conteo del OEDE, o decir "sumadas las provincias" | Prueba: ninguna cifra "del país" puede salir de sumar provincias si la fuente avisa doble conteo |
| E3 | Movilidad, f-patentes y En cifras | "658.735 motos, más que autos (615.138)" suma las 29.005 de Tierra del Fuego, que la misma página llama "probable error en el dato abierto". Sin ellas la ventaja baja de 43 mil a unos 14 mil | Sacar Tierra del Fuego del total y del promedio, o decirlo en la clave | Recalcular y revisar el titular "más motos que autos" |
| E4 | Artículos (14 cruces), `textoArt` en `datina.js` | "Sí, en general" desde una correlación de 0,40. El voto a Milei (0,44) recibe el mismo "Sí" que recursos propios (0,81). La nafta usa otra regla | Una sola escala para todo el sitio (ver E5) y "puede ser casualidad" por debajo de 0,4 | Prueba unitaria de la escala |
| E5 | Cruces, artículos, Educación y otras | Cinco escalas de fuerza en `datina.js` (líneas 4376, 4434, 4711, 5377 y 7368). Cruces llama "fuerte" a r −0,52. Con la escala de los artículos sería "moderada" | Una sola función `fuerza()` para todo el sitio | Prueba unitaria: el mismo valor da la misma palabra en todas las páginas |
| E6 | a-milei-empleo | Explica el voto de noviembre de 2023 con el empleo de junio de 2026, que además cambia cada mes. Entre las dos mitades de provincias, la mediana del voto difiere 2,4 puntos | Decisión del autor (sección 13): retirarlo, rehacerlo con noviembre de 2023 o reemplazarlo por "¿Qué candidato ganó en cada provincia desde 1983?" | Revisión del texto armado |
| E7 | a-viviendas-hacinamiento y a-viviendas-alquiler | Las viviendas cada 1.000 habitantes y las personas por hogar dan −0,97 en `capitales.csv`. El hacinamiento sube con el tamaño del hogar. El artículo mide dos veces lo mismo | Retirar el de hacinamiento. Rehacer el de alquiler con la parte de viviendas que son departamentos | Revisión del texto armado |
| E8 | a-atn-presupuesto | "33.123 pesos por habitante por año" no dice que son pesos de 2025 ni que es el promedio de 2000 a 2025. Los ATN por habitante siguen sobre todo al tamaño de la provincia | Unidad completa y el tamaño como primer límite | Revisión del texto armado |
| E9 | Contacto y Nosotros | Contacto dice solo "El formulario de contacto todavía no está disponible". Nosotros, en "Tus datos", describe formularios que el armado sacó y no dice que las consultas con IA pasan por Cloudflare | Un canal para reportar errores (decisión del autor). "Tus datos" escrito por 03 según el interruptor de formularios | `prueba_metadatos.py` o una prueba nueva: si `formularios` está vacío, ningún texto los menciona |
| E10 | Sector privado y Turismo, intros | Sector privado promete "una guía de los datos ... que muestran necesidades sin resolver". Turismo promete "ocupación de los hoteles y viajes por los pasos internacionales". Ninguna de las dos cosas está | Reescribir las intros (sección 4) | Revisión del texto armado |
| E11 | Varias fichas | La cifra destacada no corresponde al gráfico: f-supermercados (3,7% en agosto contra "País −2,7%" en doce meses), f-canastas (hogar tipo contra adulto equivalente de junio), f-homicidios (3,6 de 2025 contra "País 4,0", promedio 2023 a 2025), f-bcra (plazo fijo contra dólar), f-envejecimiento (2026 en el texto, 2040 en el gráfico), f-esperanza (total en el texto, mujeres y varones en el gráfico), f-corte-casos (15.652 fallos contra 26.524 casos), f-fiscalias-federales (224 fiscalías contra 228 cargos), f-recaudacion, f-balanza, f-eti | Regla: la clave, la descripción y la vista inicial usan la misma medida y el mismo período. Si el texto usa otra, la nombra | Prueba nueva de "cifras dobles" (sección 9) |
| E12 | f-fiscal, f-regalias, f-mundo-petroleo, f-impuestos-provinciales | Datos de otro año mezclados sin aviso: La Pampa es de 2024 en dos gráficos fechados en 2025 y entra en la mediana. El gas del mundo es de 2024 con descripción de 2025 | Rótulo "(2024)" en la barra, descripción con los dos años, mediana sin La Pampa | Prueba: si un valor tiene otro año que la descripción, la ficha lo dice |
| E13 | Conteos que no cierran | f-anios-congreso dice "17 sumaron 20 años o más" y muestra 15. f-ministros dice que De la Rúa es el que menos y el gráfico muestra a los interinos de 2001 más abajo. f-pozos y f-mapa-pozos dan 2.922 y 2.918 pozos de shale para el mismo mes. f-nacidos-otro-pais destaca a Paraguay "primero en 7" cuando Chile lo es en 8 | Corregir cada texto. Los pozos, desde el mismo archivo | Revisión del texto armado |
| E14 | Flora y fauna, f-visitas y f-visitas-parque | Fichas vecinas: "de enero a abril de 2026 las visitas bajaron 0,2%" y "de enero a junio fueron 7,3% más altas". Dos fuentes, dos períodos, signo contrario | Un solo dato de 2026, de una sola fuente, en una ficha unida | Revisión del texto armado |
| E15 | f-legisladores | Diputados se clasifica por bloque actual y el Senado por alianza electoral. Hoy el Senado muestra 14 de "Cambiemos y Juntos por el Cambio" al lado de PRO y UCR separados en Diputados | Una sola regla para las dos cámaras | Revisión del gráfico |
| E16 | Impresión | Al imprimir una página sin recorrerla, las fichas salen en blanco. Medido en Trabajo: 5 de 5. No hay `@media print` ni `beforeprint` | Una regla de impresión (sección 6) | Prueba nueva de impresión |

---

## 2. Ruido y confusión que se repiten (P1)

No son errores sueltos. Son patrones. Arreglar el patrón arregla decenas de casos.

| # | Patrón | Ejemplos | Arreglo |
|---|---|---|---|
| R1 | "En cifras" copia las cifras destacadas de abajo | Educación: las cuatro tarjetas son las cuatro claves. En Precios y actividad el 33,4% aparece cinco veces | "En cifras" con datos que no están en ninguna clave, o con enlace a su ficha |
| R2 | Los botones "OCDE" cambian de indicador sin avisar | Gasto en salud dentro de mortalidad infantil. CO₂ dentro de la demanda eléctrica de los hogares. Pobreza relativa junto a pobreza por ingresos | Que el botón nombre la medida y la unidad, más una línea "No es la misma medida". Sacar los que no responden la pregunta |
| R3 | Advertencias esenciales escondidas en "Sobre los datos" | Índice 2005 = 100, CABA junto con Buenos Aires en CAMMESA, falta Tierra del Fuego, alcance de la SUBE, regalías mineras, La Pampa de 2024, el SIPA cuenta donde declara la empresa | Una oración en el texto visible cuando cambia la lectura del gráfico |
| R4 | Un mismo organismo con varios nombres | Educación con tres nombres. OEDE con tres. Ministerios de Turismo, Ambiente y Transporte con nombres anteriores a diciembre de 2023 | Una tabla de nombres de organismos en `datos/manual/` que usen las fichas, el catálogo y el Explorador |
| R5 | Una misma cosa con varios nombres | CABA, Ciudad, Ciudad de Buenos Aires. "Descontada la inflación", "en pesos de igual valor", "a precios de hoy". "Seguro" y "prestación" por desempleo. "Discapacidad" e "invalidez". "Balotaje" y "segunda vuelta" | Un glosario de términos fijos en `.claude/rules/` y una prueba que busque las variantes |
| R6 | Siglas y jerga sin explicar | SIPA, OEDE, EMAE, ISAC, BADLAR, CAMMESA, ENARGAS, AMBA, PASO, VIF, valor p, "ingreso primario", "salida de molino", "Capítulo IV" | La primera mención con su función ("CAMMESA, la empresa que administra el mercado eléctrico") |
| R7 | Fichas casi iguales | f-atn y f-transferencias, f-votaciones y f-votaciones-espacios, f-voto-provincia y f-apoyo, f-reservas-bcra y f-reservas-netas, f-hogares y f-actividad (misma tabla), f-mapa-pozos y f-pozos, f-fracturas y f-pozos-terminados, f-visitas y f-visitas-parque, f-sube y f-sube-modos, f-empleo-construccion y f-trabajadores, f-envejecimiento y f-jubilaciones | Una ficha con vistas por par. Quedan unas 11 fichas menos sin perder ningún dato |
| R8 | Fichas en la página equivocada | Exportaciones por habitante en Trabajo (va a Sector externo). Cobertura de salud en Pobreza (va a Salud). Glaciares y clima en Curiosidades (van a Flora y fauna). Balanza energética repite Sector externo | Mover y dejar un enlace en el lugar viejo |
| R9 | Textos largos con muchas ideas | Siete textos pasan de 90 palabras (f-presupuesto 135, f-rotacion 117). Las intros de Migraciones, Educación, Precios y Cuentas públicas son índices en prosa | Reescribir con una idea por oración. Los informes traen la reescritura de cada uno |
| R10 | Nombres crudos de la fuente | "El Porton_mendoza", "Gobernador Ayala Iii", "Damian Arabia", "COALICION CIVICA", Pluspetrol en dos barras | Tablas de corrección en `datos/manual/` |
| R11 | Textos rotos en el Catálogo y el Explorador | "(Datina (selección propia))", "(Subsecretaría ... (API de Series de Tiempo))", "(Wikimedia (Wikipedia y Wikidata))", dos nodos "CSJN" | Arreglar `nom_org` en `scripts/catalogo.py:325` y los nombres de `relaciones.json` |
| R12 | Cifras que dependen del redondeo | "95 puntos" entre 378 y 472 (PISA). Jujuy se ve "1,0%" y cae en "menos del 1%" | Restar las cifras que se muestran. Dos decimales cerca de un corte |
| R13 | Datos atrasados sin aviso | La nafta en julio de 2026 al lado de la SUBE de septiembre. Petróleo y gas con archivos del 5 de octubre: `datos.energia.gob.ar` no responde desde el 23 | Aviso automático "Último dato: julio de 2026" cuando el dato tiene más del doble de su frecuencia (sección 9) |
| R14 | Unidades y fuentes desparejas en la tabla que se descarga | 104 unidades, la misma escrita de varias formas ("millones de dolares" y "millones de dólares", "anios" y "años"). Fuentes sin tilde: Secretaria, Direccion, Educacion | Normalizar en 02. Prueba de unidades conocidas |

---

## 3. Contenido que falta

Ordenado por lo que más busca la gente. "Ya está" quiere decir que el dato está en `sitio/datos/` o en una descarga actual: no hace falta bajar nada nuevo.

| Prioridad | Sección | Pregunta nueva | Dato |
|---|---|---|---|
| Alta | Trabajo | ¿Cuánta gente busca trabajo y no consigue en cada ciudad? | Ya está (`capitales_eph.csv`, EPH) |
| Alta | Trabajo | ¿Qué parte de los asalariados no tiene descuento jubilatorio? | EPH, ya se procesa |
| Alta | Cuentas públicas | ¿Cuánto recibe cada provincia por coparticipación? | Ya está (`transferencias_provincias.csv`, columnas `ley` y `ley_hab`, desde 2000) |
| Alta | Salud | ¿Cuánta gente tiene obra social, prepaga o solo el hospital público? | Ya está (Censo 2022, hoy en Pobreza) |
| Alta | Pobreza | ¿Cuánta pobreza hay en cada región y en cada ciudad? | Ya está en el consultor de pobreza |
| Alta | Pobreza | ¿Cuántos chicos viven en hogares pobres? | INDEC, pobreza por edad |
| Alta | Sector privado | ¿En qué sectores y de qué tamaño son las empresas de cada provincia? | Ya está (Excel del OEDE, cuadros 1 y 3) |
| Alta | Seguridad | ¿Qué parte de las personas presas no tiene condena? | Ya está (`carceles_provincias.csv`) |
| Alta | Curiosidades | ¿Cuántos bebés se llamaron Lionel? | Ya está calculado en `datina.js` |
| Alta | Educación | ¿Cuántos chicos terminan la secundaria y cuántos la dejan? | Secretaría de Educación, descarga nueva |
| Alta | Salud | ¿Dónde se vacuna menos a los chicos? | Ministerio de Salud (DICEI), descarga nueva |
| Alta | Salud | ¿Dónde hubo más casos de dengue? | Ministerio de Salud, descarga nueva semanal |
| Alta | Cuentas públicas | ¿Cuánto debe cada provincia? | DNAP, descarga nueva |
| Alta | Movilidad | ¿Cuántas personas mueren en el tránsito en cada provincia? | ANSV o DEIS (la ANSV solo publica PDF) |
| Media | Población | ¿Cuántos habitantes tiene cada provincia? ¿Cuántos hijos tiene cada mujer en cada provincia? | Ya está (proyecciones del INDEC y DEIS) |
| Media | Precios | ¿Cuántos salarios mínimos cuesta la canasta básica? | Canasta ya está, salario mínimo es descarga nueva |
| Media | Energía | ¿Cuánto paga un hogar por la luz y el gas en cada provincia? | Cuadros tarifarios, fuentes dispersas |
| Media | Turismo | ¿Cuántos argentinos viajan dentro del país? | INDEC, Encuesta de Viajes y Turismo de los Hogares |
| Media | Instituciones políticas | ¿Cuántos fueron a votar en cada provincia? ¿Cuántas bancas ocupan mujeres? | Dirección Nacional Electoral y Congreso |

Las demás propuestas, sección por sección, están en los informes de `auditoria-2026-10/`.

---

## 4. Preguntas: las reglas y las reescrituras

### Reglas que este plan suma a las del autor

- La pregunta, la cifra destacada y el gráfico responden lo mismo. Si la pregunta dice "en cada provincia", la respuesta habla de provincias.
- Las herramientas y las piezas del Laboratorio también llevan pregunta, o una excepción escrita en `CLAUDE.md`. Hoy no la llevan Cruces, Tu índice ("Armá tu propio índice", un imperativo), Diagnóstico, Departamentos, el consultor de pobreza, la Corte Suprema y el Laboratorio.
- Las tarjetas de la portada llevan la pregunta de su página. Hoy faltan en Migraciones, Sector privado, Construcción, Cuentas públicas, Petróleo y gas, el consultor y la Corte.

### Las preguntas de cada página (h1)

| Página | Hoy | Propuesta |
|---|---|---|
| Población | ¿Cuántos chicos nacen y qué tan rápido envejece la población? | ¿Qué tan rápido envejece la población? |
| Migraciones | ¿Cuántas personas nacieron en otro país y cuántos argentinos viven afuera? | ¿Cuántas personas nacidas en otro país viven en la Argentina? |
| Salud | ¿Cuánto vivimos y de qué nos morimos antes de tiempo? | ¿Cuánto se vive y de qué se muere en cada provincia? |
| Educación | ¿Cuántos chicos aprenden lo esperado y cuánto se invierte en su educación? | ¿Cuántos chicos aprenden lo esperado en cada provincia? |
| Pobreza y hogares | ¿Cuántas personas no llegan a cubrir lo básico y qué servicios tienen los hogares? | ¿Cuántas personas no llegan a cubrir lo básico? |
| Trabajo | ¿Dónde se crea empleo formal y cuánto se gana en cada provincia? | ¿Cuánto trabajo hay en cada provincia y cuánto se gana? |
| Precios y actividad | ¿Cuánto suben los precios y cuánto alcanza lo que se gana? | ¿Cuánto suben los precios y cómo viene la actividad? |
| Construcción y vivienda | ¿Cuánto se construye, cuánto cuesta y cuántos hogares alquilan? | ¿Cuánto se construye y cuánto cuesta construir? |
| Cuentas públicas | ¿Cuánto recauda y cuánto gasta el Estado, y cuánto debe? | ¿Cuánto recauda, gasta y debe el Estado? |
| Turismo | ¿Cuántos turistas llegan y a qué provincias van? | ¿Cuántos turistas del exterior llegan y a qué provincias van? |
| Instituciones políticas | ¿Cómo se reparten las bancas, los votos y los fondos...? | ¿Cómo vota cada provincia y cuánto pesa en el Congreso? (si la justicia pasa a su página) |
| Seguridad | (dos preguntas juntas) | ¿Cuántos delitos se registran en cada provincia? |
| Energía | ¿Cuánta electricidad y cuánto gas usamos, y de dónde sale la electricidad? | ¿Cuánta energía usa cada provincia y de dónde sale? |
| Petróleo y gas | ¿Cuánto petróleo y gas produce el país, dónde y quién lo produce? | ¿Cuánto petróleo y gas produce la Argentina y dónde? |
| Movilidad | ¿Cuánto se usa el transporte público y cuánto cuesta moverse en auto? | ¿Cuánto se usa el transporte público y cuántos autos y motos se compran? |
| Diagnóstico educativo | Diagnóstico educativo | ¿Dónde está cada provincia en educación? |
| La Corte Suprema | La Corte Suprema tuvo 108 jueces desde 1863. Quién los designó | ¿Qué gobierno designó a cada juez de la Corte Suprema? |

### Fichas que no contestan su pregunta (selección)

| Ficha | Hoy | Propuesta |
|---|---|---|
| f-inflacion | ¿Cuánto suben los precios en cada región? (no nombra ninguna) | Mantener y sumar "de 30,3% en la Patagonia a 36,9% en el Noreste" |
| f-especies | ¿Qué animales se registran más en las áreas protegidas? (muestra áreas) | ¿Qué áreas protegidas tienen más especies animales registradas? |
| f-visitas | ¿Cuántas personas visitan los parques nacionales? (cuenta visitas) | ¿Cuántas visitas reciben los parques nacionales? |
| f-pensiones-invalidez | ...pensión por discapacidad? (la fuente dice invalidez) | ¿Cuántas personas cobran una pensión por invalidez? |
| f-cuenta-corriente | ¿Entran más dólares de los que salen? (falta la cuenta financiera) | ¿Cuántos dólares le sobran o le faltan al país en su intercambio con el mundo? |
| f-salario-real | ¿Cuánto cambió el poder de compra de los salarios? (solo registrados) | ...de los salarios registrados? |
| f-voto-provincia | ¿Votan más con el gobierno...? (al gobierno no se lo vota) | ¿Votan más con el oficialismo los legisladores de las provincias donde más votos sacó el presidente? |
| f-fracturas | ¿Cuántas etapas de fractura...? (la clave da la rama horizontal) | Clave: "23.612 etapas de fractura en 2025" |
| f-parques | ¿Cuánta superficie protegen los parques nacionales y desde cuándo? (la clave da 55 áreas) | Clave: "18,3 millones de hectáreas, siete de cada diez en el mar" |

Hay unas 60 reescrituras más, con su texto nuevo, en los informes.

### Neutralidad política

- "Superpoderes del jefe de Gabinete" es el rótulo de la oposición. Propuesta: "Reasignación de partidas por el jefe de Gabinete".
- "Modernización laboral" es el nombre que eligió el gobierno. Propuesta: "Reforma laboral". Todos los nombres de leyes con el mismo criterio descriptivo.
- "Transferencias discrecionales" valora. Propuesta: "transferencias no automáticas" en todo el sitio.
- f-apoyo dice "las provincias que más acompañaron recibieron más" sin "Qué no dice este dato". Hay que sumarlo.
- f-votaciones-espacios elige dos pares de espacios sin criterio. Propuesta: el par más parecido y el más distinto, calculados.
- "Leyes clave" incluye proyectos que no fueron ley. Propuesta: "leyes y proyectos clave".

---

## 5. Arquitectura: páginas largas, fichas repetidas, perfil y herramientas

### Páginas largas: índice de capítulos, no pestañas

Medido en el celular (una pantalla son unos 800 píxeles):

| Página | Fichas | Pantallas | Propuesta |
|---|---|---|---|
| Instituciones políticas | 20 | 40 | Justicia a una página propia (unas 8 pantallas). El resto en cuatro capítulos: Elecciones y presidencia, El Congreso, Cómo vota el Congreso, Nación y provincias. Unas 27 pantallas |
| Petróleo y gas | 15 | 26 | Cuatro capítulos: Producción, Vaca Muerta y los pozos, Lo que deja, Lo que queda. Dos pares unidos: 13 fichas |
| Energía | 9 | 19 | Ya tiene subtítulos. Unir f-hogares con f-actividad y sumar "Generación" |
| Construcción y vivienda | 9 | 19 | Capítulos: Actividad, Empleo, Costo y crédito, Vivienda |
| Precios y actividad | 9 | 18 | Capítulos: Precios, Ingresos, Actividad. El selector del BCRA, al final o en una página de dinero y crédito |
| Sector externo | 10 | 18 | Capítulos: Comercio, Provincias, Cuentas y reservas. Sumar "Para entender los datos", que es la única página de su grupo sin él |

Recomendación: **un índice de capítulos debajo de "En cifras"**, con el mismo aspecto del índice numerado del perfil provincial ("1. Trabajo 2. Seguridad social..."). Cuatro de los seis revisores lo prefieren a las pestañas por tres motivos: cada ficha conserva su enlace, el buscador la encuentra y nada queda escondido. Uno propuso pestañas en Precios, Construcción y Sector externo. La decisión es del autor (sección 13).

_Decidido por el autor el 27 de octubre de 2026: el índice de capítulos (hecho en el PR #25). Cambiado por el autor el 28 de octubre de 2026, después de verlo: primero el índice con el aspecto de la fila de la categoría ("deberían parecerse a las demás de las otras páginas, como en población que está migraciones y población") y después los capítulos como pestañas ("como población, que toco migraciones y tiene su sección ahí dentro, pero no es una página nueva"). Se ve un capítulo por vez. Lo que llevó a recomendar el índice se conserva: cada ficha mantiene su enlace (la dirección de una ficha abre su capítulo) y el buscador la encuentra. Hecho en el PR #31._

Una página nueva (`justicia.html`) toca `GRUPOS`, `prueba_navegacion.py` y sus 52 direcciones, `relaciones.json`, `catalogo.json`, los botones de los artículos y la prueba de páginas. Las anclas viejas (`politica.html#f-corte-casos`) necesitan un script chico que las mande a la página nueva.

### Secciones flacas o mezcladas

- **Sector privado** tiene 2 fichas. El Excel del OEDE que ya se baja trae empresas por sector y por tamaño: con eso son 4.
- **Curiosidades** mezcla consumo, nombres, glaciares y clima. Glaciares y clima van a Flora y fauna, que ya tiene la explicación de la Ley de Glaciares. Flora y fauna podría llamarse "Naturaleza y ambiente", como su archivo (toca `GRUPOS`: aprobación).
- **Salud** tiene la mitad de sus fichas en suicidio y muertes violentas. Le falta cobertura, médicos, vacunas y mortalidad materna (sección 3).

### El perfil provincial

Hoy la primera cifra está a 1.223 píxeles en la computadora y a 1.919 en el celular. Antes va "¿De dónde viene Neuquén?". La página tiene cinco nombres distintos ("Tu provincia", "Provincias", "Perfil provincial"...). El título de la pestaña no cambia al elegir una provincia, así que un enlace compartido dice "Tu provincia".

Estructura propuesta, de arriba abajo (aprobación visual):
1. Nombre con bandera, un solo selector y una línea con habitantes, capital y año de provincialización.
2. "Dónde se destaca": seis tarjetas automáticas con los puestos 1 a 3 y 22 a 24, en frase neutra. No hacen falta datos nuevos.
3. Una tabla compacta frente al país, que también se imprime y se baja.
4. "Compará con...": las provincias parecidas con sus valores y una segunda provincia opcional (`?con=`). La provincia del sitio se sigue eligiendo solo en esta página.
5. Los 12 temas, como hoy, con los que faltan (pobreza y desocupación del aglomerado de la capital, coparticipación, inflación de su región).
6. La capital, los departamentos y "Si Neuquén fuera un país".
7. La historia, plegada o al final.
8. Pie: CSV del perfil, imprimir, imagen para compartir y cómo citar.

Arreglos chicos que no esperan: el título de la pestaña con el nombre de la provincia, "la 3.ª más baja de 24" en lugar de "Posición 22 de 24, de mayor a menor" (40 veces), nombrar las provincias que faltan cuando hay "2 de 23", y "Hogares que alquilan en la capital" para no chocar con el de la provincia.

### Herramientas

Hoy hay nueve entradas para tres tareas: ordenar o comparar provincias, encontrar un dato y ver un tema a fondo. Propuesta (cambia el menú: aprobación):
- **Provincias:** el perfil con su comparador, "Ordenar las 24" (hoy Tu índice) y Departamentos.
- **Herramientas:** Cruces (la regresión múltiple plegada en "Avanzado") y el Catálogo con una sola caja que busca tablas y ofrece "Preguntarles a los datos".
- **Al tema:** el Diagnóstico educativo pasa a Educación y el consultor de pobreza a Pobreza y hogares.
- **Fuera del menú:** el Explorador de relaciones, enlazado desde Nosotros, el pie y cada tabla del Catálogo. Es una herramienta de auditoría.
- **Nombres:** "Explorador" queda para una sola herramienta y "Consultas" solo para la IA.

Ninguna dirección se rompe.

---

## 6. Diseño, movimiento y rendimiento

Medido el 26 de octubre de 2026 en Chrome sin ventana.

| # | Gravedad | Qué pasa | Medida | Propuesta | ¿Aprobación visual? |
|---|---|---|---|---|---|
| D1 | P1 | Al imprimir, las fichas no vistas salen en blanco | Trabajo en modo impresión: 5 de 5 fichas con opacidad 0 | `@media print`: fichas visibles, sin barra ni botones, la dirección de la ficha al pie. Primero el perfil provincial (unas dos hojas A4) | No |
| D2 | P1 | Cada página carga el código y los datos de las 148 fichas, hasta Contacto | 2,6 MB sin comprimir, unos 500 KB con brotli. Con el procesador 4 veces más lento: 2,6 s de JavaScript en Contacto y 1,8 s en Instituciones políticas | Partir `fichas.js` (1,2 MB) por página y minificar `datina.js` (917 KB, hoy con comentarios) | No |
| D3 | P1 | Los enlaces compartidos no muestran imagen | Ninguna página tiene `og:image` | Una imagen por página y por provincia, armada por 03 con Chrome (ya existe "Descargar imagen"). Páginas fijas por provincia para que el enlace diga "Neuquén" | Sí |
| D4 | P2 | La portada tiene 21 animaciones que no terminan y ninguna pausa | `getAnimations()` con repeticiones infinitas: 21. Con movimiento reducido se detienen | WCAG 2.2.2 pide pausa para lo que se mueve más de 5 segundos. El sol lo aprobó el autor: opciones en la sección 13 | Sí |
| D5 | P2 | Las fichas aparecen con un fundido al entrar en pantalla | Pantalla en blanco justo después de bajar rápido. 368 ms hasta ver una ficha al llegar por un enlace | Mostrar la ficha sin fundido y animar solo el dibujo del gráfico | Sí |
| D6 | P2 | Fichas con muchos controles | 8,9 por ficha en promedio, 17 en f-congreso. En el celular, Empleo tiene 5 botones de vista en tres filas y 6 acciones al pie | Al pie, "Ver tabla" y un menú "Compartir y descargar". Los botones OCDE, solo donde comparan lo mismo | Sí |
| D7 | P2 | Los datos destacados de la portada preguntan por "cada provincia" y contestan con el país | "¿Cuántos años se vive en cada provincia?" muestra 76,2 del país en 2022 | Una tira con las 24 provincias debajo de la cifra, o la más alta y la más baja | Sí |
| D8 | P2 | Algunas fichas no tienen cifra destacada, sin una regla escrita | 32 de las 144 fichas de las 19 secciones. Sin las 4 de suicidio y muertes violentas, que no la llevan por regla, son 28. Catorce son de Instituciones políticas | Decidir cuándo sí y cuándo no, y escribirlo en las reglas | No |
| D9 | P2 | Rótulos largos en mayúsculas y letra mono | "SALARIO PROMEDIO DE LOS ASALARIADOS REGISTRADOS PRIVADOS" en el perfil, Cruces y Departamentos | Mayúsculas mono solo hasta tres palabras | Sí |

Ya decidido y pendiente: la **escala del diseño** (`docs/rediseno_fase2.md`), que lleva a la escala los valores sueltos de `datina.css` y cambia unos 2 píxeles en cada uno. El autor la eligió el 25 de octubre de 2026, en un PR propio con capturas de antes y después.

---

## 7. Artículos

Los 14 cruces los escribe una sola función (`textoArt`, `datina.js` 7378) y los otros 4 copian su voz. Por eso todos suenan igual.

**Qué falla en la plantilla:**
- Empieza por "Sí" y por "Spearman", no por un hecho.
- Los párrafos 3 a 5 son una tabla en prosa: 18 cifras seguidas.
- Los tres primeros límites son los mismos en los 14. Los que importan en cada uno (el tamaño de la provincia, el tamaño del hogar, la edad) quedan quintos o no están.
- Los casos "que se apartan" salen de una recta (Pearson) y la cifra que se informa es otra (Spearman).

**Plantilla nueva:**
1. Un gancho propio de cada artículo, una oración armada con los datos. Ejemplo: "Neuquén invierte por alumno casi cinco veces lo que invierte Tucumán. Sus chicos sacan casi lo mismo en matemática."
2. "En una frase", con las dos mitades: "Las 12 provincias con menos cloacas tienen una mortalidad infantil de 9,1 cada 1.000. Las 12 con más, de 7,0." El coeficiente va a "Cómo se calcula".
3. Cinco formas según el dato: contra la intuición, dos provincias, la excepción, antes y después, la serie con su contexto.
4. Límites en tres capas: un recuadro fijo "Cómo leer un cruce", dos o tres propios y "puede ser casualidad" por debajo de 0,4.

**Qué hacer con cada uno:**
- Retirar: a-viviendas-hacinamiento.
- Decisión del autor: a-milei-empleo (sección 13).
- Juntar: empleo y desocupación con pobreza en uno sobre las capitales. Cobertura con esperanza de vida y con madres adolescentes en uno sobre la falta de obra social. Recursos propios en el explicador de coparticipación.
- Partir: a-dolar-inversion en dos (construcción y compra de dólares).
- Contar mejor los cuatro más fuertes, que hoy quedan tapados: pobreza y desocupación, inversión y Aprender, exportaciones récord con el dólar barato, nafta en dólares.

**Diez artículos nuevos con datos que ya están:** cuánto necesita una familia para no ser pobre en cada región, qué es la coparticipación y cuánto recibe cada provincia, cuánto pesa en el Congreso el voto de cada provincia, cuánto bajó la maternidad adolescente en cada provincia, cuántos aportantes hay por cada jubilación, cuánto compra hoy un salario frente a otros años, qué candidato ganó en cada provincia desde 1983, a qué provincias se muda la gente, cuánto creció Vaca Muerta y cuánto le deja a Neuquén, qué nombres se ponen en cada provincia. Detalle en `auditoria-2026-10/articulos.md`.

**La página Artículos:** cada tarjeta con su respuesta en una línea, filtros por los cuatro grupos de temas y dos bloques, "El país en el tiempo" y "Las 24 comparadas". "Anterior" y "Siguiente" en el mismo orden que la lista.

---

## 8. Los datos por dentro

Perfil de `datos/ordenado/tabla_larga.csv` (procedimiento de `/data:explore-data`).

| Medida | Valor |
|---|---|
| Filas | 42.853 |
| Variables | 228 (75 de elecciones, 25 internacionales, 128 nacionales del resto) |
| Territorios | 25 (las 24 jurisdicciones y el país) |
| Valores vacíos | 0 |
| Filas repetidas (código, período, variable) | 0 |
| Nombres de fuente distintos | 89 |
| Unidades distintas | 104 |

**Frescura de las 128 variables nacionales que no son de elecciones**, por el año de su último dato: 34 llegan a 2026, 65 a 2025, 13 a 2024, 1 a 2023 y 13 a 2022. Las de 2022 son el Censo y la esperanza de vida (tablas de mortalidad del INDEC). Es lo último que publicó cada fuente, pero la esperanza de vida de 2022 es el primer dato destacado de la portada.

**El calendario de actualización.** El sitio se actualiza solo el día 5. El IPC sale a mediados de mes, así que puede quedar hasta tres semanas atrasado. Propuesta: una segunda corrida después de las publicaciones grandes del INDEC (IPC, EPH, EMAE), con el calendario anual del INDEC en `datos/manual/`.

**Lo que hay que normalizar:**
- Unidades: la misma escrita de varias formas ("millones de dolares" y "millones de dólares", "anios" y "años", "indice, 2004 = 100" e "indice 2004=100", "% del PBI" y "% del producto interno bruto", "m³" y "m3").
- Fuentes sin tilde en la tabla que se descarga y la OEDE con tres nombres.
- Totales del país: cuando no hay fila 00 (internet fijo) o cuando la suma tiene doble conteo (empresas).

---

## 9. Pruebas

Estrategia (procedimiento de `/engineering:testing-strategy`). Hoy el armado ya frena ante muchos errores. El problema es **cuándo** corren las pruebas y **qué** no miran.

### Dónde corre cada prueba hoy

| Prueba | En cada armado (03) | Actualización del día 5 | A mano |
|---|---|---|---|
| `pruebas_datos.py`, catálogo, relaciones y su validador, metadatos, encabezados, navegación, `prueba_pobreza.py` | Sí | Sí | |
| `prueba_paginas.mjs` | | Sí | Sí |
| `prueba_320.mjs`, `prueba_fallas.mjs`, `prueba_consulta_ia*.mjs`, `linea_base.mjs` | | | Sí |

Ningún PR corre nada. Cloudflare publica la vista previa sin probarla.

### Qué sumar

| # | Prueba | Tipo | Cuándo | Qué caso cubre |
|---|---|---|---|---|
| T1 | Flujo nuevo `pruebas.yml` en cada PR: armado sin descargar, sintaxis, `prueba_paginas`, `prueba_fallas`, `prueba_consulta_ia` | Integración | Cada PR | Que un PR no rompa el sitio antes de unirse |
| T2 | `prueba_320`, `linea_base` y el peso de cada página | Regresión visual y de rendimiento | Una vez por semana | Corrimientos a 320 píxeles, saltos de la página, páginas que engordan |
| T3 | Frescura: el último período de cada ficha contra su `FRECUENCIA` | Datos | Cada armado | La nafta en julio con el servidor caído. Aviso en la ficha si pasa el doble de su frecuencia |
| T4 | Bloque y provincia de cada legislador | Datos | Cada armado | E1 |
| T5 | Totales del país: no sumar provincias si la fuente avisa doble conteo | Datos | Cada armado | E2 |
| T6 | Una sola escala de correlación, con casos fijos (0,39, 0,40, 0,52, 0,60, 0,70) | Unidad | Cada PR | E4 y E5 |
| T7 | "Cifras dobles": en cada ficha, la cifra de la clave aparece en el gráfico o en la tabla de la vista inicial | Integración | Cada PR | E11 |
| T8 | Textos de referencia: el texto visible de cada ficha se guarda en un archivo y el PR muestra qué oraciones cambiaron | Regresión de contenido | Cada PR y cada día 5 | Ver qué dice el sitio después de cada cambio. Alimenta "Novedades" (sección 11). El programa ya existe: es el que se usó en esta auditoría |
| T9 | Impresión: ninguna ficha con opacidad 0 en modo impresión | Integración | Cada PR | E16 y D1 |
| T10 | Animaciones: ninguna animación infinita sin pausa | Accesibilidad | Cada PR | D4 |
| T11 | Banco de 40 preguntas con respuesta conocida para las consultas con IA, con el modelo de verdad | Evaluación | Una vez por semana | Que el motor gratis no empeore. Hoy las pruebas usan un modelo simulado |
| T12 | Términos fijos: CABA, "descontada la inflación", nombres de organismos | Contenido | Cada armado | R4 y R5 |
| T13 | Unidades conocidas en `tabla_larga.csv` | Datos | Cada armado | R14 |
| T14 | Huella de estilos de cada página (la que se usó para el cambio a h2 y no quedó en `scripts/`) | Regresión visual | A mano, antes de un cambio de diseño | Comprobar que un cambio "sin cambio visible" no cambia nada |

Metas: T1 en el primer PR de este plan. T3 a T7 junto con el arreglo que protegen. Cada error P0 que se arregla deja su prueba, para que no vuelva.

---

## 10. Fuentes nuevas

Buscadas y verificadas el 26 de octubre de 2026. "Verificado": se vio la página o el encabezado del archivo. "Parcial": se vio la página pero no el contenido. Toda descarga nueva necesita la aprobación del autor (`01_descargar.py --solo`).

| # | Fuente | Nivel | Pregunta | Estado |
|---|---|---|---|---|
| 1 | Estimaciones agrícolas del Ministerio de Agricultura ([CSV](https://datos.magyp.gob.ar/dataset/9e1e77ba-267e-4eaa-a59f-3296e86b5f36/resource/95d066e6-8a0f-4a80-b59d-6f28f88eacd5/download/estimaciones-agricolas-2026-03.csv)), campañas 1969/70 a 2025/26 | Departamento | ¿Dónde se siembra más soja? | Verificado |
| 2 | Dengue y zika del Ministerio de Salud, semanal, con códigos INDEC | Provincia y departamento | ¿Dónde hubo más casos de dengue? | Verificado |
| 3 | Cobertura de la vacuna triple viral (DICEI), 2009 a 2024 | Provincia | ¿Dónde se vacuna menos a los chicos? | Verificado |
| 4 | Deuda pública provincial (DNAP), total trimestral desde 1996 y por provincia. Los nombres de archivo son irregulares | Provincia | ¿Qué provincias deben más por habitante? | Verificado |
| 5 | Abandono, promoción, repitencia y sobreedad (Secretaría de Educación), desde 2003 | Provincia | ¿Dónde dejan más la secundaria? | Parcial |
| 6 | Establecimientos de salud (REFES) y farmacias (REFAR), con códigos INDEC | Departamento | ¿Cuántos centros de salud y farmacias hay por habitante? | Verificado |
| 7 | Registro Nacional de Sociedades, bimestral | Provincia | ¿Dónde se crean más empresas? | Verificado |
| 8 | ENACOM, telefonía fija y TV paga | Provincia | ¿Dónde quedan teléfonos fijos? | Parcial |
| 9 | MapBiomas Argentina por provincia, 1985 a 2025, CC BY 4.0 (red de organizaciones, no es oficial) | Provincia | ¿Cuánto monte natural perdió cada provincia? | Verificado |
| 10 | Médicos activos 2025 (OFETHuS, PDF) | Provincia | ¿Dónde hay más médicos por habitante? | Parcial |

Las 15 del ranking, con sus direcciones exactas, están en `auditoria-2026-10/fuentes-nuevas.md`.

**Descartadas, para no volver a buscarlas:** el IDH subnacional de Global Data Lab (solo 6 regiones, no provincias), CHIRPS (no cubre el sur de Santa Cruz ni Tierra del Fuego), Ookla (licencia no comercial), LAPOP y Latinobarómetro (no son representativas por provincia) y las estimaciones subnacionales del GBD (no hay para la Argentina). No hay fuente oficial nacional de alquileres, escrituras, cheques rechazados por provincia ni camas de hospital.

---

## 11. Funciones nuevas

Ordenadas por valor sobre esfuerzo, con ejemplos verificados en otros sitios. Las de esfuerzo bajo no cambian el diseño de las fichas.

| # | Función | Quién la usa | Cómo sería en Datina | Esfuerzo | ¿Aprobación? |
|---|---|---|---|---|---|
| F1 | Dirección permanente con la vista de cada ficha | Our World in Data | `trabajo.html?f=desempleo&vista=serie#f-desempleo`, como ya hacen `ix` y `dx` | Bajo | No |
| F2 | Cómo citar, al pie de cada ficha y en Nosotros | Our World in Data, Statistics Canada | "Datina (2026). ¿Dónde se gana más? Con datos de OEDE. Consultado el..." Hoy el Catálogo da dos reglas de cita distintas | Bajo | Sí, el lugar |
| F3 | Metadatos de cada tabla y página "Usar los datos" | Our World in Data | Un `.metadata.json` por CSV (fuente, período, unidad, licencia) | Bajo | No |
| F4 | Novedades: qué cambió este mes, y RSS | ONS (calendario y RSS). Nadie tiene "qué cambió" como página: sería propio | 03 compara los textos con los del mes anterior (T8) y arma `novedades.html` y `feed.xml` | Bajo a medio | Sí |
| F5 | Calendario de próximos datos con archivo .ics | ONS | La próxima fecha de IPC, EPH y EMAE | Bajo a medio | Sí |
| F6 | Datos breves | Our World in Data (Data Insights) | Un gráfico de una ficha y 120 palabras armadas desde el resumen | Bajo | Sí |
| F7 | Provincias parecidas, con valores | DataMéxico | Ya existe al fondo del perfil, sin valores: subirla y mostrar en qué se parecen | Bajo | Sí |
| F8 | Actualizar un monto por la inflación de cada región | INE, CBS. Chequeado ya tiene la nacional | "100.000 pesos de 2020 en el NOA" | Bajo | Sí |
| F9 | ¿Tu hogar está bajo la línea de pobreza? | ONS, IFS | Canasta básica total de la región y adultos equivalentes, ya en el sitio | Bajo a medio | Sí |
| F10 | Tu inflación personal por región | ONS, Destatis | Pesos propios a las divisiones del IPC de tu región. Antes, verificar las ponderaciones del INDEC | Medio | Sí |
| F11 | Comparar dos provincias lado a lado | DataMéxico | `provincia.html?prov=58&con=62` | Medio | Sí |
| F12 | Cómo cambió tu provincia o departamento entre censos | ONS | "Cómo cambió Jujuy entre 2010 y 2022", con los tres cambios más grandes | Medio | Sí |
| F13 | Línea de tiempo en los mapas | Our World in Data | Un deslizador de años que vuelve a pintar el mapa | Medio | Sí |
| F14 | Puesto a lo largo del tiempo | FT Visual Vocabulary | Gráfico de pendiente con el puesto de 2014 y el de 2024 | Medio | Sí |
| F15 | Insertables de una ficha | Our World in Data, ONS | `insertar.html?f=...` con "Copiar código" | Bajo a medio | Sí |
| F16 | Quiz "¿Cuánto creés que es?" | Gapminder | Nunca con suicidio ni muertes violentas | Bajo a medio | Sí |
| F17 | Buscar tu departamento o partido | | "Florencio Varela" acerca el mapa y muestra su valor | Medio | Sí |

No se proponen: alertas por correo (los formularios están apagados por decisión del autor, el RSS cubre lo mismo), sonificación (poco valor para este público) y Dollar Street (necesita trabajo de campo).

---

## 12. Plan por etapas

Un PR abierto a la vez (regla del 24 de octubre de 2026). Cada etapa es un PR con un commit por cambio. Las etapas 0 a 2 no cambian el diseño.

| Etapa | Qué | Puntos | Esfuerzo | ¿Aprobación visual? |
|---|---|---|---|---|
| 0 | Pruebas en cada PR | T1 | Bajo | No |
| 1 | Errores de dato y de texto | E1 a E3, E5, E7 a E14, con T3 a T7 y T9 | Medio | No |
| 2 | Ruido de textos | R1 a R14, preguntas y h1 (sección 4), neutralidad, organismos y siglas, T8, T12, T13 | Medio a alto | No, salvo que cambie el largo de algo visible |
| 3 | Escala del diseño | Ya elegida por el autor, con capturas de antes y después | Medio | Ya aprobada |
| 4 | Contenido con datos que ya están | Desocupación e informalidad, coparticipación, cobertura a Salud, pobreza por región, empresas por sector y tamaño, presos sin condena, Lionel | Medio | Sí, si cambia el orden de una página |
| 5 | Artículos | Plantilla nueva, retirar y juntar, E4 y E6, diez nuevos | Alto | Sí |
| 6 | Arquitectura | Índice de capítulos, fichas unidas, `justicia.html`, perfil provincial, herramientas | Alto | Sí |
| 7 | Diseño y rendimiento | D1 a D9, partir `fichas.js`, `og:image`, páginas por provincia | Medio a alto | Sí, salvo D1 y D2 |
| 8 | Fuentes nuevas | Las de la sección 10, de a una | Medio por fuente | Aprobación de cada descarga |
| 9 | Funciones nuevas | F1 a F3 primero (bajo esfuerzo, sin diseño nuevo), después F4 en adelante | Bajo a alto | Sí, salvo F1 y F3 |

Cada etapa termina como dice `.claude/rules/pruebas.md`: armado, sintaxis, prueba de páginas y capturas en 390 y 1440 píxeles, más la prueba nueva de cada arreglo.

---

## 13. Decisiones para el autor

Van en tandas, con opciones, como pidió el autor el 5 de octubre de 2026. La recomendada va primero.

**Tanda 1 (antes de la etapa 1)**
1. **a-milei-empleo.** Reemplazarlo por "¿Qué candidato ganó en cada provincia desde 1983?" · rehacerlo con el empleo de noviembre de 2023 y la respuesta "Apenas" · retirarlo sin reemplazo.
2. **Contacto.** Un correo del proyecto · los "issues" del repositorio en GitHub · dejarlo como está y sacar la página del pie.
3. **Suicidio por provincia** (hoy barras de mayor a menor que nombran la más alta y la más baja, en tensión con "sin rankings"). Orden alfabético sin superlativos · mapa · dejarlo como está.

**Tanda 2 (antes de la etapa 6)**

_Decidido por el autor el 27 de octubre de 2026: la opción recomendada en las cinco (índice de capítulos, justicia en su página y el resto en capítulos, la historia del perfil al final, el menú simplificado y "Naturaleza y ambiente"). En la tanda 1, a-milei-empleo se retira y su dirección lleva a "¿Qué candidato ganó en cada provincia en cada elección presidencial?"._

4. **Páginas largas.** Índice de capítulos sin pestañas · pestañas internas · dejarlas como están.
5. **Instituciones políticas.** Justicia en una página propia y el resto en cuatro capítulos · solo capítulos · como está.
6. **Perfil provincial.** La historia al final y "Dónde se destaca" arriba · la historia plegada arriba · como está.
7. **Herramientas.** El menú simplificado (cinco entradas, el Explorador de relaciones fuera) · solo cambiar los nombres repetidos · como está.
8. **Flora y fauna.** Pasa a "Naturaleza y ambiente" con glaciares y clima · solo mover las fichas · como está.

_Decidido por el autor el 28 de octubre de 2026 (fuera de las tandas): unir los once pares de fichas casi iguales de R7, en varios PR por página, cada uno con una ficha con vistas y la dirección vieja llevando a la ficha que queda, y sacar las dos vistas OCDE que no responden su ficha (el gasto en salud en la mortalidad infantil y el CO₂ en la electricidad de los hogares)._

**Tanda 3 (antes de las etapas 7 a 9)**
9. **El sol de la portada.** Que se detenga a los 5 segundos · un botón chico de pausa · como está.
10. **Primeras descargas nuevas.** Dengue, vacunas y deuda provincial · estimaciones agrícolas · otra elección.
11. **Ejemplo en el campo de Consultas con IA.** Un ejemplo solo en ese campo · sin ejemplo.
12. **Aviso de nuevos datos.** RSS y página Novedades · correo (necesita prender formularios) · nada.

---

## Anexos

En `docs/roadmap/auditoria-2026-10/`:
- `personas-y-bienestar.md`, `trabajo-y-economia.md`, `estado-y-sociedad.md`, `territorio-y-recursos.md`, `articulos.md`, `herramientas-y-perfiles.md`: los informes de los seis revisores, con todas las reescrituras.
- `fuentes-nuevas.md` y `funciones-de-referencia.md`: las dos investigaciones, con todas sus direcciones. Los investigadores no podían escribir archivos, así que estos dos los resumió la sesión principal. Los otros seis son los informes tal como los entregaron los revisores.
