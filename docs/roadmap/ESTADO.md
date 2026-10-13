# Estado del plan

Plan: `DATINA_LAB.md`. Solo la próxima tarea y lo necesario para retomarla.

## Línea de base (D0-01, 10 de octubre de 2026, commit b4b1fc1)

- `git status`: limpio. Rama de trabajo `claude/awesome-cannon-dkbl1m` (igual a `main`).
- `python scripts/pruebas_datos.py`: 0 hallazgos sin explicar, 115 explicados (3 s).
- `python scripts/03_construir_sitio.py`: "Listo: sitio/index.html, 23 paginas de seccion y 18 articulos" (3 s). Reescribe las 50 páginas de `sitio/` solo por los finales de línea (CRLF del repositorio contra LF de Linux): `git diff --ignore-cr-at-eol` no muestra cambios. Avisos de Python 3.13 por `re.sub` con `count` posicional (no frenan nada).
- Sintaxis de `sitio/datina.js`: bien.
- `node scripts/prueba_paginas.mjs`: en la nube las CDN de D3 y topojson están bloqueadas y la prueba falla por eso. Con el banco local de `.claude/rules/pruebas.md`: 46 páginas, 18 secciones con "En cifras", "Todo en orden" (3 min 41 s).
- No se corrió `01_descargar.py` ni `02_procesar.py`.

## Hecho

- D0-02: `CLAUDE.md` breve (89 líneas). El texto anterior completo, sin cambios, en `docs/historico/etapas-previas.md`. Reglas por tema en `.claude/rules/` y tres revisores de solo lectura en `.claude/agents/`.

- D1-01: `INVENTARIO.md`. Hallazgo principal: no hay metadatos de fuente por ficha que se puedan leer con un programa (los pies son texto libre y el organismo de cada archivo descargado va en comentarios), así que el explorador necesita un catálogo escrito a mano y validado. Recomendación: página aislada armada por el constructor, sin tocar `datina.js` ni la plantilla.

- D1-02 (borrador): `PROPUESTA_EXPLORADOR.md` con el modelo, las relaciones, las validaciones, lo que no se puede afirmar, la muestra y la pantalla. Cinco decisiones "pendiente" en `DECISIONES.md`.

- Aprobación del autor (10/10/2026): "aprobá todo", seguir el plan hasta el final.
- D2-01: `relaciones.html` aislada, armada por `scripts/relaciones.py` desde el catálogo (`datos/manual/relaciones.json`, por ahora la muestra de Seguridad y Salud: 6 organismos, 16 archivos, 8 fichas). Grafo en tres columnas y tabla con las mismas entidades, conmutador entre las dos y filtro por tipo. Sin tocar `datina.js` ni la plantilla. Pruebas: armado bien, catálogo bien, sintaxis bien, prueba de páginas en el banco: 47 páginas, "Todo en orden".

- D2-02: buscador (todas las palabras, sin tildes; Enter elige la mejor coincidencia), filtros por tema y por organismo, panel de detalle (al costado en pantallas anchas, como hoja desde abajo en las angostas) con la evidencia de cada relación, y el estado en el enlace (`?n=`, `?q=`, `?t=`, `?o=`, `?v=`). Prueba de páginas: 47, "Todo en orden".

- D3-01: catálogo completo en `datos/manual/relaciones.json`: 42 organismos, 143 archivos, 115 fichas (todas salvo las tres de suicidios y las cuatro herramientas), 236 relaciones "alimenta" y 5 "se calcula a partir de", cada una con su evidencia. Lo rastrearon seis agentes por grupo de secciones y lo validó el programa. Los títulos que calcula `datina.js` se leen de ahí al armar (no se copian a mano). El grafo encuadra la cadena del punto elegido, reparte los organismos en todo el alto y muestra los nombres de las fichas cuando hay lugar. `sitio/datos/relaciones.json` pesa 257 KB. Prueba de páginas: 47, "Todo en orden".

- D3-02: `scripts/prueba_relaciones.py` rompe una copia del catálogo de 18 formas (relaciones huérfanas, evidencia que no está en el código o fuera del repositorio, tipos que no corresponden, fichas sin origen, archivos y organismos sin uso, ciclos, fichas de suicidio, pies que no nombran al organismo, repetidos) y controla que el validador marque cada una. 03 la corre antes de armar el explorador (0,8 segundos). Las evidencias se buscan una sola vez por corrida.

- D4-01: revisión de accesibilidad (0 P0, 12 P1, 8 P2) y correcciones, detalle en `REVISION_A11Y.md`. Panel en el flujo hasta 1080 píxeles, tabla apilada en el celular, foco y contraste, anuncios, zona de toque y datos raros. Prueba de páginas: 47, "Todo en orden".

- D4-02: regresión del sitio completo. `pruebas_datos.py` 0 sin explicar y 115 explicados (igual que la línea de base); catálogo y validador bien; el armado deja las 46 páginas anteriores, `datina.css`, `datina.js` y `fichas.js` idénticas a las del repositorio salvo los finales de línea (`git diff --ignore-cr-at-eol` vacío fuera del explorador); las 115 fichas del explorador llevan a una página con esa ancla y a CSV que existen; prueba de páginas 47, "Todo en orden".

- D5-01: el explorador está enlazado desde el menú "Secciones" (Herramientas), el mapa del pie de todas las páginas y "Cómo se hace" de Sobre nosotros, sin tocar `datina.js`. Definiciones, límites, dudas del catálogo y mantenimiento en `EXPLORADOR.md`; "Cómo agregar una ficha" suma el paso del catálogo.

- D7-01 y D7-02: `docs/deploy/ARQUITECTURA.md` (qué se publica, comparación de opciones y decisión), `RUNBOOK.md` y `CHANGELOG_DEPLOY.md`. Decisión: publicación estática (Netlify, ya configurado). Nada necesita contenedor: Dokploy (el nombre correcto de "Docploy", verificado) tendría sentido recién con un servicio propio. Sin instalar nada ni tocar servidores.

## Unión con las etapas 29 a 38 (10 de octubre de 2026)

La rama del plan salió del commit b4b1fc1 (5 de octubre) y, mientras tanto, la computadora del autor sumó las etapas 29 a 38 (6 y 7 de octubre, 18 commits): rompecabezas de la portada, bandera de la provincia elegida en dos lugares, "Para entender los datos" al final, menú "Más", Laboratorio y la Corte Suprema, "24 jurisdicciones" y anotaciones, preguntas como título en las 18 secciones, grupos y categorías, el gráfico antes del texto y la bajada con el espaciado editorial. Detalle en `docs/historico/etapas-previas.md`, "Pendientes y próximos pasos". Se unieron en un commit de unión:
- `CLAUDE.md` breve de la rama, con la regla de redacción vigente (preguntas) y el resumen de diseño al día. El registro histórico pasó a ser el `CLAUDE.md` completo del 7 de octubre.
- El enlace al Explorador en el menú "Más" y en el pie, que desde la etapa 36 salen de `GRUPOS`.
- El Explorador toma el nombre de cada ficha de su `h3`, que ahora es la pregunta. El catálogo validó sin cambios (241 relaciones con evidencia).
- Verificado: armado, sintaxis, catálogo y validador, prueba de páginas, el Explorador y el pie con "De dónde sale" en 1440 y 390 píxeles.

## Etapa 39: menos espacio, barra y portada con el mismo orden (10 de octubre de 2026)

Pedido del autor: "demasiado espacio en blanco sin sentido y poco de diseñador", "es rarísimo que en la portada tengas Explorá la Argentina por tema y una categorización, mientras que en las pestañas del header tengas los temas sueltos" y "sacá ese recuadro de preguntas que van pasando". Respuestas: "4 grupos con menú" y la portada "Sin Destacados".
- Sin "Datos rápidos". Sus preguntas (`PREG`) siguen en el buscador.
- Espaciado: `--bloque` de 24 a 40 y `--capitulo` de 48 a 72 (eran 48 a 72 y 96 a 144), la línea de "Para entender los datos" a un bloque de la primera ficha, fichas con 28 de relleno y el pie con 48. La portada pasó de 4.461 a 2.844 píxeles de alto en la computadora y de 6.510 a 5.007 en el celular, Trabajo de 6.366 a 5.788 (de 9.217 a 8.841 en el celular) y Precios y actividad de 7.260 a 6.636. Medido con una herramienta que busca franjas sin texto, imagen ni control: en las secciones no queda ninguna de 48 píxeles o más en la computadora.
- La barra: los cuatro grupos de la portada, cada uno con su menú (el mismo código que "Más", de a uno abierto), el de la página actual marcado, y "Más" con Tu provincia, Curiosidades, los artículos, las herramientas y Datina. Entra de 1081 a 1440 píxeles con Tierra del Fuego elegida (24 de margen en el peor caso). En el Explorador de relaciones, que no carga `datina.js`, los grupos son enlaces a su columna de la portada.
- La portada: lo azul con el mapa, "Explorá la Argentina por tema" (columnas sin panel gris, escritas por el constructor), Artículos (el de la relación más marcada primero, que era el destacado) y Herramientas. Sin Destacados: "Tu provincia" ya está en lo azul y las votaciones, en Instituciones políticas.
- Verificado: armado, sintaxis, prueba de páginas (49), la barra en seis anchos con y sin provincia, los menús con el mouse y el teclado, el celular, el buscador y la página quieta al cargar (portada 0,001 en la computadora y 0 en el celular).

## La misma frase una sola vez: muestra en Trabajo (10 de octubre de 2026)

Medido en el sitio armado (Chrome sin ventana, 1440 píxeles): 116 fichas con pregunta, 97 con cifra destacada y unas 100 donde la leyenda de la cifra y la primera oración del texto (o la descripción y el texto) dicen casi lo mismo. Regla propuesta, cada pieza con un solo trabajo:
- Descripción (`p.ficha-sub`): qué mide, por dónde y cuándo. No cambia.
- Cifra destacada: el número con su unidad y una leyenda corta que dice solo lo que la descripción no dice (el alcance o la población de referencia: "promedio bruto del país", "cada 100 habitantes en el país"). Va como tercer elemento de `CLAVE` (`[cifra, texto completo, leyenda corta]`). El texto completo sigue en "En cifras" y en el buscador, que se leen sin la descripción. Sin leyenda corta, la ficha usa el texto completo como antes.
- Texto (`p.lead`): empieza por lo que ni la cifra ni el gráfico dicen (el cambio en el tiempo, la distancia entre extremos, el total, el contexto) y no repite la cifra destacada. Conserva las unidades y los períodos de cada cifra nueva.
- La imagen que baja "Descargar imagen" suma la cifra con su leyenda debajo de la descripción, porque el texto ya no la repite.

Aplicado en las cuatro fichas de Trabajo (empleo, salarios, rotación y exportaciones). Salarios ya no necesita "Ver más" en la computadora.

## Pedidos del autor del 11 de octubre de 2026

- Regla de la frase repetida aprobada y aplicada en Precios y actividad, Sector privado, Construcción y vivienda y Cuentas públicas (el texto empieza por lo que la cifra no dice y se entiende solo, también en el celular, donde el gráfico queda entre la cifra y el texto).
- Fichas: la descripción y el texto con la letra de la bajada (Roboto Flex 340, tamaño óptico 28, `--tinta-bajada`, `--t-4`). Eligió la variante B entre tres capturas.
- Textos de las fichas justificados con corte de palabras. Las dos columnas de las fichas anchas se reemplazaron después (ver la segunda tanda).
- Menús desplegables (grupos y "Más") con fondo de vidrio (`--vidrio-menu`, `--vidrio-blur`). Opacos en el celular, sin desenfoque o con transparencia reducida.
- Pie: sin "Estadísticas públicas de cada provincia..." ni "Datina no es un sitio oficial..." (sigue en Sobre nosotros). La actualización: "Todos los meses, los datos se actualizan con lo último que publica cada organismo público" (pie y Sobre nosotros).
- Suscripción por correo en el pie (formulario `suscripcion` de Netlify, vuelve a Contacto con `?suscripto=1`). Funciona cuando se activen los formularios en Netlify.
- Bajada de la portada y descripción para buscadores: "Datos públicos sobre la Argentina, los argentinos y las 24 provincias, explicados para que cualquiera los entienda, los compare y los pueda verificar" (modelo de Gapminder, entre opciones basadas en USAFacts, Our World in Data, Gapminder y Brookings).
- Menú "Más": Tu provincia, las herramientas y después los temas (solo en pantallas angostas), Artículos, Laboratorio y Datina (Curiosidades pasó a Estado y sociedad). Lo arma el constructor.
- Migas: solo el camino (Datina › grupo › categoría), sin el nombre de la página, que va debajo. Herramientas y Tu provincia bajo "Herramientas".
- Verificado en cada paso: armado, sintaxis, catálogo del Explorador, prueba de páginas (49, "Todo en orden") y capturas en 1440, 1000 y 390 píxeles.
- Link de vista previa: el entorno en la nube no permite abrir un túnel público (cloudflared). Opciones: Netlify conectado al repositorio (vista previa por rama) o armar en la computadora del autor.

## Pedidos del autor del 11 de octubre de 2026 (segunda tanda)

El autor avisó que no iba a poder aprobar y pidió avanzar con todo. Un commit por cambio, cada uno con armado, sintaxis, prueba de páginas (50, "Todo en orden") y capturas en 1440 y 390 píxeles.

- "En el catálogo" en el pie de cada ficha, después de "De dónde sale" (119 fichas, todas salvo las de suicidio). Abre la tabla con su vista previa.
- Fichas anchas y herramientas: el texto ya no va en dos columnas (parecía partido). Desde 1080 píxeles, la cabeza en una columna de lectura y los controles de la ficha a su derecha. Los títulos chicos en letra mono de los gráficos salen del justificado.
- Suscripción:
  - El campo dice `nombre@ejemplo.com` y sale la nota de abajo.
  - Botón nuevo con ideas del ejemplo "Brutalist" y de uiarc.dev: amarillo con sombra dura azul que se hunde al pasar el mouse, y tres textos en la misma celda ("Avisarme", "Enviando", "Anotado").
  - Se envía sin salir de la página.
  - Cómo activarla de verdad: `docs/deploy/SUSCRIPCION.md` (pasos en Netlify y opciones para mandar las novedades).
- La tarjeta del mapa de la portada con el vidrio de los menús.
- Curiosidades dentro de Estado y sociedad, sin el grupo "Y además" (portada, barra, "Más", pie y migas).
- Tu provincia:
  - Sin la bajada "Cada provincia comparada…".
  - Historia de cada jurisdicción ("¿De dónde viene…?"):
    - fundación de la capital, desde cuándo es provincia y cómo, antecedente colonial o territorial, guerras civiles y formación del Estado, y quiénes fueron y quiénes son;
    - habitantes de la proyección del INDEC (de los datos, no a mano);
    - un dato curioso y las fuentes.
  - Textos en `datos/manual/provincias_historia.json`, validados por 03 (sin punto y coma, una fuente por campo, "e" delante de la i).
  - Los armaron agentes con búsquedas en sitios oficiales. El entorno no dejaba abrir las páginas, así que salen de los extractos del buscador: conviene abrir las fuentes antes de difundirlo (las dudas de cada una están en el campo `dudas`).
  - Las 24 jurisdicciones completas desde la segunda pasada del mismo día (Tucumán, Tierra del Fuego y lo que faltaba de San Juan, Santiago del Estero y La Rioja).

## Pedidos del autor del 11 de octubre de 2026 (tercera tanda)

"Seguí con todo el plan y todos los pendientes", y después: "sumá datos de exportación, balanza comercial, balanza de pagos, qué exportamos, adónde exportamos, qué exporta cada provincia, cuánto exporta cada provincia. Lo mismo con las importaciones, meté una nueva categoría en trabajo y economía que se llame sector externo. Y sumá algo de las reservas internacionales, evolución, todo lo que haya en la API del BCRA". Un commit por cambio, cada uno con armado, sintaxis, prueba de páginas y capturas.

- Etapa 40, con los archivos que el sitio ya bajaba (sin descargas):
  - Población: "¿Cuánto va a crecer la población de cada provincia?", la variación proyectada por el INDEC entre el año en curso y 2040, en porcentaje o en personas. CABA es la única que pierde habitantes.
  - Salud: "¿De qué se muere la gente en cada provincia?", tasas ajustadas por edad (método directo) por grupo de causa, 2022 a 2024. Las causas externas van juntas, sin separar el suicidio, y no entran en el perfil ni en "En cifras".
- Licencia: código con MIT (`LICENSE`) y contenidos con CC BY 4.0 (`LICENCIA-CONTENIDOS.md`), la combinación recomendada en `LICENCIA_OPCIONES.md`. "Licencia y reutilización" y "Tus datos" (uso de los correos, Ley 25.326) en Sobre nosotros. Se puede cambiar antes de publicar.
- Accesibilidad: los cuatro P2 que quedaban (`REVISION_A11Y.md`).
- Artículos: la página ya no salta en la primera carga (de 0,56 a 0,04, `LINEA_BASE.md`). El 0,12 del Explorador es el cambio de letra en un entorno sin Roboto ni Verdana.
- Barras apiladas: los números de adentro de cada tramo se volvieron a leer (los había tapado el borde blanco del cambio de la línea del país).
- Actualización en GitHub: se corrió a pedido sobre la rama para bajar las fuentes nuevas, porque este entorno no llega a los servidores oficiales. Se cortó tres veces en `02_procesar.py`: el tipo de cambio A3500 de la API de Series de Tiempo llegó con meses vacíos en 2017 y 2018, y después el empleo registrado (SIPA) con un mes vacío. Ahora ningún archivo de esa API reemplaza al anterior si tiene huecos, el empleo usa el último mes completo y el artículo del dólar dice qué trimestre falta y en qué serie. La cuarta corrida terminó bien (commit 1cf8179). Sin esto, la actualización del 5 de noviembre también se habría cortado.
- Certificados (resuelto el 12 de octubre de 2026, sin apagar la verificación): en los servidores de GitHub fallaban con "unable to get local issuer certificate" censo.gob.ar, el ENACOM, la DEIS, la Secretaría de Energía y otros, porque no mandan el certificado intermedio. `01_descargar.py` hace lo que un navegador: lo baja de la dirección que indica el certificado del servidor ("CA Issuers", en DER, PEM o PKCS#7) y lo suma solo para esa conexión. Las raíces no se suman y la cadena tiene que terminar en una raíz del sistema. La actualización de GitHub (commit a5c56f7) bajó bien los ocho archivos que fallaban así: Censo 2022 de migraciones (dos), natalidad de la DEIS, internet del ENACOM (dos), proyecciones y tablas de mortalidad del INDEC y regalías. economia.gob.ar además tiene el certificado vencido y sigue con el reintento de `CERTIFICADO_VENCIDO`.
- Esa misma madrugada la API de Series de Tiempo de datos.gob.ar no respondía: las planillas que salen de ahí conservaron la versión anterior y la búsqueda de series del sector externo ahora se corta en la primera falla en lugar de esperar 40 minutos. Quedan por revisar en la actualización del 5 de noviembre: la mortalidad infantil de la DEIS (la conexión no respondió) y las tres planillas del SSPMI (`sspmi_*`, la dirección da 404 desde antes).
- Sector externo (categoría nueva en Trabajo y economía, `externo.html`), nueve fichas y una más en Precios y actividad:
  - Con lo que ya había: qué exporta el país por gran rubro, complejos exportadores, destinos del país o de la provincia elegida y qué exporta cada provincia.
  - Con la descarga nueva (`ica_cuadros`, `balanza_pagos`, `series_sector_externo` y `bcra_monetarias` en `01_descargar.py`, que bajó la actualización de GitHub): balanza comercial desde 1992, importaciones por uso económico y por origen, cuenta corriente del balance de pagos desde 2006, reservas del BCRA desde 1996 con los factores que las movieron en el año y un selector con 32 variables principales del BCRA (dólar, tasas, dinero, depósitos y préstamos, índices de actualización). Las que están en pesos se pueden ver también sin la inflación, con el IPC del INDEC.
  - Decisiones: la inflación que publica el BCRA no se repite (toda la del sitio sale del INDEC). Las tres tasas para juicios van como valores acumulados, porque no son tasas anuales (pasan de 27.000%). La ficha de reservas es `f-reservas-bcra` porque `f-reservas` ya era la de petróleo y gas. `indec_balanza_pagos.xls` se baja pero todavía no se usa: la cuenta corriente sale de la API.
  - El selector de las variables del BCRA ("¿Cuánto cambiaron el dólar, las tasas y el dinero?") pasó a Precios y actividad, al final de la página, a pedido del autor (11 de octubre de 2026: "pasá el selector del BCRA a Precios y actividad"). Las dos bajadas avisan dónde está cada cosa.
  - Nombres cortos de las variables del BCRA (`BCR_SEL` en `02_procesar.py`): revisados el 13 de octubre de 2026 contra los de la API, sin cambios. La nota de la ficha explica las siglas (BADLAR, TM20, TAMAR y BAIBAR). El autor puede cambiar cualquier nombre ahí.
  - Deflactar con criterio económico y series largas (pedido del autor del 11 de octubre de 2026). Cada serie del BCRA va completa, desde que empieza (la más vieja, de 1990), y según su tipo:
    - montos en pesos: en pesos de cada mes en escala logarítmica, sin la inflación (IPC del INDEC, desde diciembre de 2016) y en % del PBI a precios corrientes del INDEC (desde 2004, con el PBI anual interpolado mes a mes para que el cociente no salte cada trimestre).
    - dólar: a precios de hoy, descontada la inflación de la Argentina y la de los Estados Unidos con el tipo de cambio real bilateral del BCRA (desde 2002). Reproduce el pico de 2002, el mínimo de 2015 y los saltos de 2019 y diciembre de 2023.
    - tasas: la real a 30 días contra la inflación del mes siguiente (ex post). M2: descontada la inflación interanual. Índices de actualización y tasas para juicios: su variación en doce meses contra la inflación.
    - inflación esperada (REM): junto a la que hubo en los doce meses siguientes. La API trae además datos de 2004 a 2012 de un relevamiento anterior, no comparable, que se dejan afuera.
    - reservas: desde 1990 con la serie mensual del BCRA (idéntica a la diaria donde se superponen) y una vista en meses de importaciones, con la referencia de tres meses. `01_descargar.py` pide ahora desde 1940, así la próxima actualización trae las reservas mensuales desde ese año.
    - Series largas (pedido del autor del 11 de octubre de 2026, "sumá esas series largas y corré la actualización"): reservas mensuales desde 1940, plazo fijo a 30 días desde 1985, préstamos al sector privado por tipo (personales, tarjetas, hipotecarios, prendarios, adelantos y documentos), depósitos y préstamos en dólares con la tasa del plazo fijo en dólares, y la serie histórica del dinero (base monetaria, M1, M2 y M3) con la parte del M3 en moneda extranjera, que calcula Datina (61% en noviembre de 2001, 3% después de la pesificación, 26% en 2026). El BCRA publica los agregados desde 1940 en miles de pesos de hoy con cuatro decimales: antes de mediados de los sesenta dan cero, así que cada uno empieza cuando el redondeo pesa menos de 0,5% (1976).
    - La actualización en GitHub tardó tres intentos: pedir todo desde 1940 hacía que la API del BCRA rechazara las series que empiezan después y se bajaran año por año (más de una hora, cancelada), y después la búsqueda de series de la API de Series de Tiempo tardó demasiado y dejó incompleta la planilla del comercio exterior (02 la frenó, como corresponde). Ahora cada serie del BCRA se pide desde su primer dato, con un límite de 25 minutos, y la planilla del comercio exterior solo se reemplaza si llega completa. La tercera corrida terminó bien (commit 73c7ab2).
    - Lo que no se deflacta: los dólares de las exportaciones, las importaciones y las reservas van en dólares de cada año (no hay un índice de precios de los Estados Unidos en el sitio), y antes de diciembre de 2016 no hay un IPC nacional del INDEC: por eso los montos largos van en escala logarítmica o en % del PBI.
- Consultor de pobreza (`PESO.md`, cargar DuckDB solo para el SQL libre): no se puede armar en la nube porque Observable Framework baja sus bibliotecas de jsDelivr, que está bloqueado. Queda para la computadora del autor.

## Etapa 42: pedidos del autor del 12 de octubre de 2026

"Seguí con los pendientes que quedan, y de las reservas internacionales desagregá porque en general tenés DEGs, swaps, oro, etc. La liquidez no es del monto que hablás, y antes había negativas. [...] animate a pensar qué más podemos sumar. Por ejemplo, cantidad de pensiones por discapacidad, pensiones por discapacidad por provincia, hacer un mapa, AUH, planes sociales y los índices de confianza en el gobierno de Di Tella y alguno más que encuentres". Un commit por cambio, cada uno con armado, sintaxis, prueba de páginas y capturas a 1440 y 390 píxeles.

- Descargas nuevas en `01_descargar.py`, bajadas con la actualización de GitHub (corridas 16 y 17, porque este entorno no llega a los servidores oficiales):
  - Planilla de reservas internacionales y liquidez en moneda extranjera del BCRA (formato del FMI, un PDF por mes, `tempMMAA.pdf`), leída con pdfplumber (nuevo en `requirements.txt`) desde enero de 2007 en `bcra_planilla_reservas.csv`. Cada número va a la columna del BCRA por su posición en la página y las partes tienen que sumar el total. Cada actualización baja solo los meses que faltan y relee los tres últimos (límite de 15 minutos).
  - BESS: pensiones no contributivas, asignaciones familiares y prestación por desempleo, del país y por provincia (`bess_pnc`, `bess_provincias_pnc`, `bess_aaff`, `bess_provincias_aaff`, `bess_desempleo`, `bess_provincias_desempleo`).
  - Universidad Torcuato Di Tella: Confianza en el Gobierno, Confianza del Consumidor y Expectativas de Inflación (`utdt_icg.xls`, `utdt_icc.xls`, `utdt_expectativas.xls`), buscadas en la página de cada serie.
- Fichas nuevas:
  - Población: "¿Cuánto cobra un jubilado comparado con un salario?" (haberes de ANSES como % del salario registrado desde 1994 y a precios de hoy desde 2017). El haber mínimo con refuerzos es el 25,4% del salario en 2026 y a precios de hoy está 27,7% debajo de 2017.
  - Pobreza y hogares: "¿Cuántas personas cobran una pensión por discapacidad?" (país desde 2001 y cada 1.000 habitantes por provincia, con mapa: 1.144.014 en junio de 2026, Chaco 77,0 cada 1.000 y Tierra del Fuego 7,2). `mapaProv()` es el mapa de provincias genérico que puede usar cualquier ficha.
  - Pobreza y hogares: "¿Cuántos chicos cobran la Asignación Universal por Hijo?" (cada 100 menores de 18 por provincia, con mapa, y la cobertura de todas las asignaciones del país: 4.079.913 chicos, 34,7 cada 100, el 71,5% de los menores cobra alguna asignación).
  - Sector externo: "¿Cuántas reservas netas tiene el Banco Central?" (brutas y netas mes a mes desde 2007, de dónde salen las netas en el último mes y de qué están hechas las brutas). Netas, con el criterio de Datina: las brutas menos los depósitos en dólares de los bancos y del Tesoro y otras deudas a un año, el tramo a término del canje con China y los pases. 7.746 millones en agosto de 2026 (16% de las brutas), negativas por última vez en junio de 2026, mínimo de los meses publicados −12.805 millones en abril de 2025. La ficha dice que no hay una cifra oficial y que otros criterios dan otros números.
  - Trabajo: "¿Cuántas personas cobran el seguro de desempleo?" (idea propia: país desde 2001, por provincia cada 1.000 habitantes y cada 100 asalariados privados registrados del SIPA). CABA y Buenos Aires quedan fuera del máximo y el mínimo frente al empleo registrado, porque el SIPA cuenta el puesto donde declara el empleador y el seguro donde se cobra.
  - Instituciones políticas: "¿Cuánta confianza genera el gobierno nacional?" (índice de 0 a 5 desde noviembre de 2001, con una marca en cada cambio de gobierno, y el promedio de cada gobierno sin el mes en que asumió uno nuevo, porque según la fecha de la encuesta ese mes mide al que se va o al que llega). Tono neutro: solo describe.
  - Precios y actividad: "¿Cuánta inflación espera la gente para el año siguiente?" (mediana y promedio de la Di Tella desde 2006 junto a la inflación que hubo después según el INDEC: en 91 de 105 meses la mediana quedó por debajo) y "¿Cuánta confianza tienen los consumidores en la economía?" (índice de 0 a 100 desde 2001, con sus tres partes o por región).
  - Tu provincia: tema nuevo "Seguridad social" con las pensiones por discapacidad, la AUH y el seguro de desempleo.
  - Cruces: los mismos tres indicadores, con el tema "Seguridad social" (la AUH contra los hogares con NBI da r 0,48 y ρ 0,63).
- Planes sociales: no hay datos abiertos oficiales por provincia de Volver al Trabajo (ex Potenciar Trabajo), Acompañamiento Social ni la Prestación Alimentar. La nota de la AUH lo dice. Si se publican, entran como la AUH.
- Planilla de reservas: los once meses de julio de 2023 a mayo de 2024 están publicados con el año en cuatro cifras (`temp122023.pdf`) y la descarga los encontró al probar otros nombres. Los 17 meses que no se leían enteros se recuperaron el 13 de octubre de 2026 (corrida 22): la descarga guardó sus PDF en `datos/crudo/planilla_revisar/` y con ellos se ajustó `_planilla_reservas_leer()`. Junio de 2008 tiene la plantilla en inglés, en 2007 y abril de 2009 la sección II está al pie de la primera página, en septiembre y octubre de 2017 los DEG van sin separador de miles y en 2024 la llamada de nota, el número y el rótulo de un mismo renglón suben de a un punto. Probado con los PDF guardados: los meses que ya estaban dan los mismos valores. Quedan los 236 meses, de enero de 2007 a agosto de 2026, todos con netas. Un mes que se lee en cero en la sección II se vuelve a leer en cada actualización y su PDF va a `planilla_revisar/`, que se borra solo cuando el mes se lee entero. El registro de cada actualización (`datos/crudo/_registro.csv`) dice cuántos meses no pudo leer.
- API de Series de Tiempo de datos.gob.ar: desde el 12 de octubre de 2026 devuelve las planillas con valores vacíos sueltos en el medio en todas las series (también en las anuales, que no cambian) y a veces sin el último mes. La validación las rechazaba y el sitio quedaba con la versión anterior (al 13 de octubre no se perdió ningún dato: la API no traía meses nuevos). Ahora el registro dice por qué no se aceptó una planilla y los valores vacíos se completan con la versión anterior (`api_completar()`), así que los meses nuevos entran aunque la API siga así. En la corrida 23 (13 de octubre de 2026) entraron las once planillas y las tres del sector externo: ningún valor que ya estaba cambió, las once quedaron iguales y las del sector externo sumaron 7.865 valores que antes faltaban (ninguno de los que usa el sitio).
- `lineas()` suma `y1` (máximo fijo de la escala), `eventos` (líneas verticales con nombre) y `conNegativos`. `barrasH()` suma `sinOrden` y `nt`.
- Actualizaciones de GitHub de ese día: la 17 se frenó en 02 porque la API de Series de Tiempo devolvió la planilla del comercio exterior con datos que no dejaban ningún año completo (ahora no se reemplaza si alguna serie trae menos datos que antes o si los meses se repiten) y la 18 bajó y procesó todo, pero Chrome tardó más de 15 segundos en abrir y la prueba de páginas se cortó antes de empezar (ahora espera hasta 60). La 20 se frenó en 02 porque las planillas del SSPMI (carne vacuna, vino y yerba mate) se mudaron y la búsqueda tomó la de carne aviar: ahora se bajan de su dirección nueva y la validación exige los indicadores que usa el sitio. La 21, la 22 y la 23 terminaron bien.
- Consultor de pobreza, pendiente de T12 (13 de octubre de 2026): estaba trabado porque este entorno no llega a jsDelivr, de donde Observable Framework baja sus librerías. `pobreza/scripts/rearmar_cache.py` arma la caché con las librerías del consultor ya publicado, y el armado da los mismos archivos de librerías. DuckDB se baja solo al abrir el editor de SQL libre, y la consulta guiada se resuelve en JavaScript con las tablas en JSON que escribe `exportar_parquet.py` junto a los Parquet (mismos valores). `pobreza/scripts/prueba_guiada.mjs` corre las 6.864 combinaciones de filtros en DuckDB y en JavaScript y dan lo mismo. Al abrir la página se bajan 0,36 MB comprimidos (antes 8,47 MB). Probado en Chromium: la consulta guiada, abrir el editor (el foco va a la caja de texto), los ejemplos, llevar la consulta guiada al editor, un error de sintaxis y las descargas, a 1440 y 390 píxeles.

## Pedidos del autor del 13 de octubre de 2026

"Sumá al índice de confianza de Di Tella la parte de resultado de elecciones, tanto las PASO como las primeras vueltas, para ver la coincidencia entre el índice y los resultados electorales". Hecho: la ficha "¿Cuánta confianza genera el gobierno nacional?" (Instituciones políticas) suma la vista "Elecciones".
- Primero fue un gráfico de puntos, y el autor pidió rehacerlo ("queda horrible y no se entera, de última que sean dos líneas que corren en paralelo"). Ahora son dos paneles con el mismo eje de tiempo desde 2001.
  - Arriba, el índice mes a mes, con un punto en el mes anterior a cada elección: el último medido entero antes de votar.
  - Abajo, el voto a la candidatura del gobierno sobre los votos positivos en cada PASO y primera vuelta presidencial desde 2003.
  - Una línea punteada en cada elección cruza los dos paneles.
- La candidatura del gobierno es la de `OFICIALISMO` de las elecciones presidenciales. En las PASO es la agrupación del gobierno con todas sus listas internas (`ICG_OFI_PASO`).
- Los puntos de las PASO van huecos, así que la forma distingue y no solo el color.
- Resultado: correlación de 0,86 (Spearman 0,78) en 10 elecciones. La nota dice que la PASO y la primera vuelta de un mismo año no son independientes, que correlación no es causalidad y que las legislativas no están.
- Las fechas de las elecciones están en `ICG_FECHA_ELECCION` de `02_procesar.py`: una elección presidencial nueva sin su fecha frena el armado.
- Tabla `confianza_gobierno_elecciones.csv`, en el pie de la ficha y en el Explorador de relaciones.

Ingresos por aglomerado de la EPH (pregunta abierta al autor desde la etapa 27). Hecho: "¿Cuánto ingreso por persona tienen los hogares de cada ciudad?", en Pobreza y hogares, después de la pobreza.
- La descarga los calcula con las bases de los cuatro trimestres que ya bajaba (`eph_ingresos_aglomerados.csv`, corrida 24).
- Dos ingresos:
  - el ingreso per cápita familiar, con PONDIH;
  - el de la ocupación principal de los ocupados que cobran, con PONDIIO.
- Cómo se junta: la mediana de cada aglomerado se calcula como proporción de la del país de su trimestre, juntando los cuatro, y `02_procesar.py` la pasa a pesos del último trimestre.
- Al primer trimestre de 2026, la mediana por persona es de 500.000 pesos en los 31 aglomerados: de 926.000 en la Ciudad de Buenos Aires a 340.000 en Concordia.
- Muestra 32 áreas, porque la EPH separa la Ciudad de los partidos del conurbano.
- Con una provincia elegida se resaltan sus aglomerados (Buenos Aires tiene cinco).
- Los montos se muestran redondeados al millar, porque las respuestas se redondean.
- La nota dice que no descuenta las diferencias de precios entre regiones.

## Plan de calidad (T7 a T15), 11 de octubre de 2026

- Línea del país en las barras: va detrás de las filas y los valores llevan borde del color del fondo. Hecho.
- T7, un h1 por página: el título de cada página pasa a h1 al final del armado (aspecto igual, comparado píxel a píxel). `scripts/prueba_encabezados.py` lo controla en 03. Hecho. Aviso aceptado: las fichas son h3 y saltan de h1 a h3.
- T8, accesibilidad: contraste, zoom del consultor, teclado en Cruces, toque en los cuadros, "Ver tabla", avisos de carga, selector de provincias. Hecho, detalle y pendientes en `REVISION_A11Y.md`.
- T9, metadatos: Open Graph, Twitter y Article en JSON-LD. La dirección pública va en `datos/manual/sitio.json` (vacía: sin canonical absolutos, sitemap ni robots hasta que el autor la decida). `scripts/prueba_metadatos.py` controla metadatos y enlaces internos en 03. Hecho.
- T10, licencia: inventario y opciones en `LICENCIA_OPCIONES.md`. Aplicada el 11 de octubre de 2026 la combinación recomendada (MIT y CC BY 4.0), que el autor puede cambiar antes de publicar.
- T11, catálogo de datos: el autor aprobó la propuesta de `PROPUESTA_CATALOGO.md` el 11 de octubre de 2026 ("aprobado el catálogo como lo propusiste"). Hecho: `catalogo.html` con las 178 tablas (todas salvo la tabla completa, que va arriba, y las tres de suicidio, que quedan afuera como en el Explorador). Búsqueda, filtros por tema, organismo, cobertura y año, filtros en el enlace, vista previa de 10 filas y diccionario de variables. Lo arma `scripts/catalogo.py` desde la plantilla, `datina.js`, `relaciones.json` y `datos/manual/catalogo.json` (dónde se usan las 44 tablas que ninguna ficha ofrece, con su evidencia en el código), y 03 no arma el sitio si una tabla publicada no tiene uso. Enlazado en "Más" (Herramientas, después del Explorador), en el pie ("Los datos") y en la portada (Herramientas), con un ícono nuevo (`planilla`). "En el catálogo" en el pie de cada ficha: el autor lo pidió el 11 de octubre de 2026 ("sí, sumá En el catálogo al pie de cada ficha"). Hecho: va después de "De dónde sale" en las 119 fichas cuya tabla está en el catálogo (todas salvo las tres de suicidio) y abre la tabla con su vista previa. El constructor le pasa a `datina.js` la lista (`EN_CATALOGO`).
- T12, peso: informe en `PESO.md` (0,5 a 0,7 MB por página). El consultor de pobreza ya carga DuckDB solo para el editor de SQL (13 de octubre de 2026).
- T13, D3 y topojson: se probó `defer` y se deshizo porque hacía saltar la página. La prueba de páginas ya no depende de las CDN (`DATINA_LIBS`).
- T14 y T15, gráficos y línea de base: `scripts/linea_base.mjs` (88 casos) e informe en `LINEA_BASE.md`. Pendientes: CLS de los artículos (0,05 a 0,55 según la carga) y del Explorador (0,12), que ya existían.
- GitHub Pages: explorado en `docs/deploy/GITHUB_PAGES.md`. El autor decidió no usarlo por ahora.

## Próxima tarea

Orden elegido por el autor el 10 de octubre de 2026 (respuestas en la sesión local), después de la etapa 39:
1. Que la descripción, la cifra destacada y la primera oración del texto no repitan lo mismo en cada ficha. Regla aprobada por el autor el 11 de octubre de 2026. Hecho en todas las secciones (11 de octubre de 2026): la leyenda corta va como tercer elemento de `CLAVE` en todas las fichas con cifra destacada y ningún texto empieza repitiendo la cifra. Quedan oraciones que repiten la cifra más adelante en algunos textos (áreas de concesión, pozos), dejadas a propósito porque comparan con otro dato.
2. Hecho (11 de octubre de 2026): la línea del país ya no tapa los valores.
3. Hecho (11 de octubre de 2026): Etapa 40, la población de cada provincia hasta 2040 y las causas de muerte por provincia (ver la tercera tanda).
4. Hecho (12 de octubre de 2026): la silueta de "En cifras" usa la altura de tarjeta más común, medida en las 19 secciones con la carga del código demorada: 149 píxeles con las cinco tarjetas en fila (9 de 19 secciones, antes 140) y 141 en celular (9 de 19). Con una red muy lenta el salto promedio baja de 17 a 10 píxeles en computadora y queda en cero en esas secciones. Trabajo sigue saltando 36 (sus textos ocupan tres renglones más) y no se puede igualar en todas porque el largo de los textos cambia con los datos.

## Plan del Explorador (anterior a la unión)

Todo lo que se podía hacer sin el autor está hecho. Lo que sigue necesita al autor:
1. Revisar y unir el PR del plan.
2. D7-03 a D7-06: elegir dónde publicar (recomendado: Netlify), conectar el repositorio y el dominio, activar el formulario, verificar y probar volver atrás (`docs/deploy/RUNBOOK.md`).
3. Revisar las decisiones dudosas del catálogo (`EXPLORADOR.md`).

Fase 6, primer caso de uso (pedido del autor, 10/10/2026: "hacé lo del enlace en el pie de cada ficha"): botón "De dónde sale" entre las acciones del pie de las 115 fichas del explorador, que abre `relaciones.html?n=<ficha>` con el detalle de esa ficha a la vista. No va en las herramientas ni en las fichas de suicidios (la lista sale de `scripts/relaciones.py`, `EXCLUIDAS`, y el constructor se la pasa a `datina.js`). Verificado: 115 botones, todos hacia una ficha del explorador y con su título asociado para lectores de pantalla, pie en una fila en la computadora y en tres en el celular, prueba de páginas 47, "Todo en orden".

## Pendientes heredados del sitio

Detalle en `docs/historico/etapas-previas.md`, sección "Pendientes y próximos pasos" (hasta la etapa 38).

- Volver a correr `scripts/transferencias_presupuesto.py` a principios de 2027.
- Revisar que la actualización mensual del 5 de noviembre termine bien (primera con `ubuntu-24.04` fijo y las acciones en su versión 7).
- Conectar el repositorio a Netlify y activar los formularios (contacto).
- Preguntas abiertas al autor: precios de la vivienda por capital (solo fuentes privadas), ingresos por aglomerado de la EPH y votaciones anteriores a 2008.
