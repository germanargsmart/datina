# Encargo para Claude Code: reescritura editorial integral de todo Datina

## Objetivo y alcance obligatorio

Quiero una **reescritura editorial integral de todo el sitio público de Datina**, no de una sola sección ni únicamente de `/empresas`.

El objetivo es que todo Datina esté redactado en español rioplatense profesional, natural, claro, preciso y consistente. Hay que revisar cada texto visible para una persona que visita o usa el sitio, detectar formulaciones forzadas o confusas y reescribirlas cuando haga falta. No alcanza con corregir tildes o gramática. La propuesta tiene que mejorar la forma de explicar cada dato, concepto, gráfico, herramienta, recorrido y acción disponible, sin cambiar lo que el sitio realmente informa o hace.

**No me entregues solamente recomendaciones o un plan. Inspeccioná el repositorio, inventariá los textos, reescribilos, implementá los cambios en los archivos fuente, reconstruí el sitio y verificá el resultado.**

## 1. Qué abarca “todo Datina”

Revisá todas las páginas, secciones, plantillas, componentes, textos fijos y textos generados por código que se publiquen o se muestren dentro de Datina. No des por terminada la tarea después de revisar la portada o algunas páginas representativas.

Como mínimo, descubrí e inspeccioná todas las rutas que genera el sitio y todos los tipos de página. Incluí, cuando existan en el estado actual del repositorio:

- Portada e introducción general de Datina.
- Navegación principal y sus menús, navegación móvil, migas de pan, pie de página, enlaces de continuidad y botones compartidos.
- Todas las categorías, grupos temáticos y páginas de temas.
- Todas las fichas estadísticas, incluidas todas las fichas que se reutilizan en páginas temáticas y provinciales.
- Las 23 provincias y la Ciudad Autónoma de Buenos Aires, sus perfiles y todos los textos que se generen para cada jurisdicción.
- Historias, artículos, explicadores, comparaciones y piezas narrativas.
- Herramientas, cruces, explorador de relaciones, catálogo de datos y cualquier otra página interactiva.
- El consultor o módulo de pobreza y cualquier aplicación secundaria publicada dentro del sitio.
- Interfaz de consulta con IA, si está activa o aparece en alguna configuración: título, instrucciones, placeholder, botones, estados de carga, errores, respuestas de interfaz y avisos. No actives funciones deshabilitadas.
- Gráficos y mapas: títulos, subtítulos, leyendas, nombres de series, etiquetas de ejes, unidades, tooltips, textos alternativos, mensajes de ausencia de datos y explicaciones que se muestran al interactuar.
- Tablas, datos descargables cuando tengan etiquetas redactadas por Datina, notas al pie, definiciones, metodologías, glosarios, aclaraciones, advertencias, límites de interpretación y textos de las fuentes.
- Buscadores, filtros, selectores, campos, placeholders, botones, estados vacíos, validaciones, mensajes de error, confirmaciones, controles para copiar o descargar y cualquier otro texto de interfaz.
- Mensajes de accesibilidad, `aria-label`, `title`, `alt`, textos para lectores de pantalla y enlaces de salto al contenido.
- Títulos de pestaña, títulos SEO, meta descriptions, Open Graph, descripciones para compartir y otros metadatos públicos redactados manualmente o generados por el sitio.
- Páginas de error, páginas auxiliares y rutas que no aparezcan enlazadas en la portada pero se publiquen en el directorio de salida.
- El README público y la descripción pública del proyecto, únicamente en las partes que presentan Datina a sus visitantes. No cambies documentación técnica interna por esta tarea.

La lista anterior es el alcance mínimo, no un límite. Primero descubrí las páginas reales a partir del código, del constructor y de la salida generada. **No supongas que una sección no existe porque no esté en la portada.**

### Revisá tanto el texto fuente como lo que ve el usuario

Datina genera páginas y textos desde varias fuentes. La inspección no puede limitarse a buscar frases dentro del HTML publicado. Revisá las fuentes de verdad que producen el contenido, entre ellas, según corresponda:

- `scripts/plantilla.html`
- `scripts/03_construir_sitio.py`
- `scripts/datina.js` y los textos que se calculan en tiempo de ejecución
- `scripts/relaciones.py` y `scripts/catalogo.py`
- `scripts/*_historia.py` y otros constructores de páginas
- `datos/manual/`, en particular los JSON que contienen explicadores, fichas, relaciones, catálogo, textos del sitio, distorsiones o descripciones visibles
- `pobreza/` y su aplicación web
- `functions/`, para los mensajes y textos de interfaz que se expongan al usuario
- Cualquier otro archivo que, al inspeccionarlo, resulte fuente de contenido publicado.

No edites manualmente el contenido generado dentro de `sitio/` si las instrucciones de Datina indican que lo genera un constructor. Corregí la fuente de verdad y volvé a construir. Si el texto proviene de un archivo o mecanismo distinto, seguí el flujo que corresponda.

## 2. Forma de trabajo: descubrimiento exhaustivo antes de editar

Antes de cambiar archivos:

1. Leé `CLAUDE.md` completo y respetá sus reglas de redacción, diseño, datos, seguridad y publicación.
2. Leé `docs/roadmap/ESTADO.md` para conocer el trabajo en curso y la siguiente tarea. Consultá solamente los documentos históricos y las reglas de `.claude/rules/` que sean relevantes para este trabajo, como indica `CLAUDE.md`.
3. Revisá `git status` y conservá todo cambio local preexistente. No sobrescribas trabajo que no sea tuyo.
4. Revisá si hay un PR abierto y seguí la instrucción específica de `CLAUDE.md`: no abras un segundo frente ni otra rama si ya hay uno abierto.
5. Identificá cómo se construyen todas las rutas, qué páginas se generan desde una misma plantilla, qué textos aparecen desde JavaScript y cuáles son específicos de una sola página.
6. Ejecutá una construcción de referencia sin descargar datos y registrá las rutas publicadas. No ejecutes descargas masivas ni `scripts/01_descargar.py`.
7. Elaborá el inventario completo de textos originales antes de dar por iniciada la reescritura.

No interrumpas el trabajo después de hacer el inventario. Usalo para ejecutar la reescritura completa.

## 3. Inventario obligatorio de cada texto

Creá un inventario exhaustivo dentro de `docs/redaccion/`. Como mínimo, incluí:

- `docs/redaccion/INVENTARIO_COPY_GLOBAL.md`: índice legible por personas, con cobertura por tipo de página, lista de rutas y estado de revisión.
- Un archivo de inventario por grupo de páginas o por plantilla en `docs/redaccion/inventario/`, o un formato equivalente que permita comprobar cada elemento individual sin truncar el contenido.

El inventario debe registrar cada pieza textual con:

1. Identificador estable.
2. Ruta o rutas donde aparece.
3. Archivo fuente y ubicación (función, clave JSON, selector o componente, cuando sea posible).
4. Tipo de texto: título, bajada, párrafo, pregunta, etiqueta, gráfico, botón, fuente, metodología, mensaje de interfaz, SEO, accesibilidad u otro.
5. Texto original completo, sin resumirlo ni reemplazarlo por “etcétera”.
6. Texto propuesto completo.
7. Estado: `reescrito`, `conservado deliberadamente`, `revisado sin cambios` o `pendiente de verificación factual`.
8. Motivo breve si se conserva o queda pendiente.
9. Verificación posterior: si se comprobó en la página generada y, cuando corresponda, en la interfaz interactiva.

Cada texto que se repita en varias rutas debe vincularse a todas las apariciones o a un patrón de rutas explícito y verificable. Cada plantilla dinámica debe documentar sus variantes y las rutas en las que se renderiza. No alcanza con anotar un ejemplo de cada categoría y asumir que las demás son iguales.

No marques una sección como completa si solo revisaste los textos estáticos y no sus textos dinámicos. No uses frases como “resto del sitio”, “otros textos similares”, “etc.” o “se revisaron los textos restantes” para reemplazar el detalle del inventario.

Al final, hacé un control de cobertura: todos los textos editoriales visibles detectados deben figurar en el inventario. Los nombres oficiales de organismos, las denominaciones legales, los nombres propios de fuentes y las categorías originales de los datos pueden mantenerse cuando corresponda; también tienen que figurar como conservados, no desaparecer del control.

## 4. Criterio editorial general

Escribí para personas de Argentina, en español rioplatense profesional. El resultado debe sonar natural, concreto y preciso, sin perder neutralidad ni rigor estadístico.

Priorizá:

- Frases simples y directas.
- Una idea principal por oración.
- Preguntas concretas cuando el título deba plantear una pregunta.
- Explicaciones que digan qué mide el dato, a quiénes incluye, qué período cubre y cómo debe interpretarse.
- Términos consistentes para el mismo concepto en todas las páginas.
- Verbos precisos y acciones claras en botones y enlaces.
- Textos breves cuando una frase larga se pueda simplificar sin perder información.
- Contexto suficiente para entender el dato sin conocimientos técnicos innecesarios.
- Límites explícitos cuando una cifra no permita responder una pregunta o demostrar una relación causal.

El patrón general es: **qué muestra el dato → qué población o unidad incluye → qué período y ámbito cubre → qué se puede concluir y qué no**. No hace falta repetir toda esta secuencia en cada control o cada título; aplicala donde ayude a comprender la información.

Evitá por completo:

- Traducciones literales del inglés y calcos sintácticos.
- Errores gramaticales, frases incompletas, oraciones mal conectadas y conceptos ambiguos.
- Grandilocuencia, marketing vacío, frases de brochure corporativo y promesas no demostradas.
- Fórmulas como “potenciá tu negocio”, “transformá tu empresa”, “revolucioná”, “llevá al siguiente nivel” o equivalentes.
- “Innovación”, “ecosistema”, “soluciones”, “experiencias”, “impacto” y “valor” cuando no aporten información concreta.
- Gerundios innecesarios, frases largas, repeticiones y sinónimos que generen falsas diferencias conceptuales.
- Títulos genéricos que no anticipan qué pregunta responde una página.
- Llamados a la acción vagos si se puede explicar exactamente qué hace el enlace o botón.
- Afirmaciones de causalidad a partir de correlaciones o comparaciones descriptivas.
- Años, cantidades o resultados escritos a mano si el sitio los calcula a partir de los datos.
- Punto y coma en cualquier texto visible.

## 4 bis. Ejemplos concretos para calibrar la reescritura

Los siguientes ejemplos sirven para mostrar el nivel de intervención esperado. **No son una lista exhaustiva ni una plantilla que debas copiar mecánicamente.** Primero contrastá cada texto con el estado actual del repositorio. Si el contenido real difiere, registrá el texto real y trabajá sobre él. Los ejemplos que no se identifican como observados en `/empresas` son ilustrativos, no citas del sitio actual.

La regla central es que no alcanza con que el texto quede correcto en términos gramaticales. Tiene que explicar con naturalidad qué muestra Datina, qué puede hacer la persona con esa información y cuáles son los límites del dato. La nueva redacción tiene que describir fielmente lo que existe, no lo que sería atractivo prometer.

### Ejemplo A. Presentación de la página de empresas — referencia de redacción observada

En la revisión previa de `/empresas` se observó esta formulación, que tenés que volver a comprobar en el repositorio antes de tratarla como texto fuente vigente:

**Texto observado:**

> Cuántas empresas con empleados hay en cada provincia, cuántas se crean y cuántas cierran cada año. Y una guía de los datos del sitio que muestran necesidades sin resolver y mercados que crecen.

**Problemas:** la primera parte no forma una introducción completa; el fragmento que empieza con «Y una guía...» queda mal conectado; «empresas con empleados» no identifica con suficiente precisión la población estadística; y afirmar que los datos muestran «necesidades sin resolver y mercados que crecen» promete una lectura de oportunidades de mercado que los indicadores de cantidad, aperturas y cierres, por sí solos, no demuestran.

**Dirección de reescritura propuesta:**

> Consultá cuántas empresas privadas con personal en relación de dependencia registrado hay en cada provincia y cómo evolucionan las aperturas y los cierres. Compará los datos provinciales, recorré la serie histórica y descargá las tablas disponibles para analizarlas por tu cuenta.

Esta propuesta solo debe usarse si las opciones de comparación, serie histórica y descarga existen realmente en la página que se construye. Verificá también que «personal en relación de dependencia registrado» coincida con la definición y la fuente metodológica oficial. Si la estadística utiliza otra definición, conservá la definición oficial y redactala en lenguaje claro.

**Título:** el título actual de la página debe revisarse por separado. Como referencia de claridad y siempre que la pregunta corresponda exactamente a los indicadores publicados, podría ser:

> ¿Cuántas empresas privadas hay en cada provincia y cómo cambian las aperturas y los cierres?

No cambies el título definitivo hasta comprobar que las series efectivamente permiten responder ambas partes de la pregunta.

### Ejemplo B. Títulos de fichas estadísticas

**Patrón débil ilustrativo, no cita literal:**

> En cifras

**Dirección de redacción, según el indicador real:**

> ¿Cuántas empresas privadas hay en cada provincia?

La mejora no consiste solo en poner un signo de pregunta. El título debe anticipar una pregunta concreta que la ficha pueda responder. No conviertas esta pregunta de empresas en una plantilla para indicadores de salud, vivienda, educación, seguridad o empleo. Inspeccioná el indicador y redactá una pregunta específica para cada ficha. Conservá las excepciones de títulos que establezca `CLAUDE.md`.

### Ejemplo C. Perfiles provinciales

**Patrón débil ilustrativo, no cita literal:**

> Conocé todo sobre [provincia].

**Dirección de redacción, según los datos que efectivamente contenga el perfil:**

> ¿Cómo se compara [provincia] con el promedio nacional en [indicador]?

No uses automáticamente esta formulación en todos los perfiles. Nombrá el indicador que la página muestra y comprobá que la comparación esté disponible y sea metodológicamente válida. Si el perfil reúne muchos temas y no responde una sola pregunta, seguí el patrón editorial específico que ya establece el proyecto en lugar de forzar un título que prometa una comparación inexistente.

### Ejemplo D. Historias y cruces de datos

**Patrón débil ilustrativo, no cita literal:**

> El impacto de [A] en [B].

**Dirección de redacción descriptiva, cuando solo se muestran series o asociaciones:**

> ¿Cómo evolucionaron [A] y [B] durante el mismo período?

Usá esta alternativa únicamente si la historia realmente compara ambas series en ese período. No describas como «impacto», «efecto» o «causa» una relación que el análisis no identifica causalmente. Si hay un diseño de evaluación causal debidamente documentado, expresá con precisión qué estima y bajo qué condiciones; no lo des por supuesto.

### Ejemplo E. Gráficos, ejes, leyendas y tooltips

**Etiqueta demasiado escueta, ilustrativa:**

> Aperturas

**Dirección más clara cuando el espacio y el dato lo permiten:**

> Empresas que abrieron durante el período

En un eje o una leyenda muy compactos puede ser apropiado conservar «Aperturas», siempre que el título, la bajada o la nota expliquen qué cuenta. No hagas que cada tooltip se vuelva un párrafo. La prioridad es desambiguar la unidad, el período, la categoría y la población cuando esos datos no resulten evidentes. No cambies nombres de series si eso pudiera alterar su correspondencia con los datos.

### Ejemplo F. Metodología y definiciones

**Texto observado en la revisión previa de `/empresas`, a verificar en la fuente:**

> Cuando pasa un año, cuatro trimestres seguidos...

**Dirección de reescritura:**

> Se considera que una empresa cerró cuando transcurren cuatro trimestres consecutivos —un año— sin que declare personal ocupado.

Este ejemplo solo es correcto si coincide exactamente con la regla metodológica de la fuente oficial. No simplifiques de forma que se pierda la unidad de análisis, la condición necesaria, el período de referencia o una excepción. Ante cualquier duda, contrastá la definición de origen y registrá la validación pendiente.

### Ejemplo G. Botones y llamadas a la acción

**Etiqueta vaga ilustrativa:**

> Ver más

**Dirección de redacción, según el destino real:**

> Ver los datos por provincia

El botón debe anticipar la acción que se ejecutará. Si abre una metodología, no lo llames «Ver los datos por provincia». Si descarga un CSV, decí «Descargar CSV». No cambies destinos, comportamiento ni disponibilidad para hacer coincidir la etiqueta con el ejemplo.

### Ejemplo H. Búsqueda, filtros y estados vacíos

**Placeholder vago ilustrativo:**

> Buscar...

**Dirección de redacción, si el buscador efectivamente incluye esos tipos de contenido:**

> Buscar un tema, indicador o provincia

**Mensaje vacío demasiado general, ilustrativo:**

> No hay datos.

**Dirección de redacción, solo si se puede identificar la causa real:**

> No hay datos disponibles para esta provincia y este período.

No inventes la causa de un resultado vacío. Si el sistema no distingue entre falta de datos, error de consulta y problema de conexión, no afirmes una razón que el código no conoce. Mantené los estados de error diferenciados cuando el sistema ya los distingue.

### Cómo usar los ejemplos

1. Tomalos como **referencias de calidad y criterio**, no como frases para copiar a todas las páginas.
2. Antes de proponer una versión nueva, leé el texto fuente, inspeccioná la página construida y entendé qué dato o acción describe.
3. Para cada texto real, preguntate: ¿se entiende a la primera?, ¿nombra con precisión el indicador o la acción?, ¿la afirmación está respaldada?, ¿falta unidad, período, población o una limitación importante?, ¿hay una forma más natural y directa de decir lo mismo?
4. Registrá en el inventario el original literal, la versión propuesta y el motivo de la modificación. Para textos ya claros, registrá que se revisaron y se conservaron.
5. Si el problema es conceptual y la fuente no permite resolverlo, marcá la duda. No escribas una frase comercial más atractiva a costa de inventar capacidades o conclusiones.
6. No copies el lenguaje de una ficha a otra cuando cambie el concepto estadístico. La consistencia consiste en usar los mismos términos para los mismos conceptos, no en que todas las páginas suenen iguales.

## 5. Reglas específicas de Datina que no podés romper

Estas reglas tienen prioridad sobre cualquier sugerencia editorial general. Leé `CLAUDE.md` y las reglas detalladas correspondientes antes de editar.

### Títulos, bajadas y jerarquía

- Respetá la regla vigente de Datina: el título de cada ficha y de cada página debe ser una pregunta concreta que pueda responderse con los datos, salvo las excepciones explícitas para las fichas de suicidio y muertes violentas, que conservan su título descriptivo.
- No uses títulos retóricos ni llamados promocionales como “Conocé”, “Descubrí” o “Mirá”.
- El título no debe incorporar cifras ni años que cambien cuando se actualiza la fuente.
- La bajada debe identificar con precisión qué mide el indicador e incluir el período mediante el mecanismo dinámico existente, por ejemplo `{{ruta}}` donde corresponda.
- Respetá el orden de contenido y la jerarquía visual que ya están definidos en Datina. La tarea es editorial, no un rediseño de la interfaz.

### Exactitud de los datos

- No inventes funcionalidades, indicadores, clientes, ventajas, conclusiones, explicaciones causales ni usos que la información no permita sostener.
- No alteres valores, unidades, fechas, cobertura geográfica, población de referencia, definiciones estadísticas, métodos de cálculo ni criterios de clasificación.
- No cambies el significado de las fuentes oficiales ni les atribuyas afirmaciones que no hagan.
- Toda cifra debe quedar explicada con la unidad, el período y la población de referencia que corresponden, cuando aplique.
- Conservá los límites de interpretación, las notas metodológicas y las aclaraciones de comparabilidad. Podés redactarlas mejor, pero nunca eliminarlas solo para acortar el texto.
- No agregues un año a mano ni hardcodees valores que deban salir del resumen de datos.
- No modifiques datos crudos ni realices descargas masivas. Esta es una tarea editorial.
- Si no podés verificar un concepto o una afirmación, no la conviertas en una afirmación categórica. Usá una redacción prudente y registrá la duda en el inventario.

### Neutralidad y temas sensibles

- Mantené un tono descriptivo y neutral en asuntos políticos e institucionales.
- No conviertas una correlación en una conclusión causal. Los cruces y artículos deben mantener sus límites y sus apartados sobre qué no dice el dato.
- Respetá íntegramente las salvaguardas de suicidio descritas en `CLAUDE.md`: no sumar ni mostrar modalidad, lugar u hora; usar solo las variables permitidas; no incluir tasas en perfiles provinciales, cruces, “En cifras” ni artículos; conservar las líneas de ayuda en el lugar establecido; no agregar rankings, cifras destacadas, juegos ni lenguaje dramático; y mantener la aclaración sobre las diferencias metodológicas entre SNIC y DEIS.
- No elimines advertencias de privacidad, seguridad, metodología o accesibilidad.

### Consistencia lingüística y funcional

- Usá la función existente `yE()` para cambiar “y” por “e” cuando preceda al sonido de la i, según la regla del proyecto. No reemplaces masivamente letras o palabras sin revisar el contexto.
- No uses punto y coma en el texto visible.
- Mantené consistentes los nombres de indicadores y conceptos en navegación, fichas, historias, gráficos, tablas y glosarios.
- En botones, la etiqueta debe describir la acción real. No cambies un enlace ni su destino solo por mejorar su redacción.
- No agregues, elimines ni cambies la disponibilidad de ninguna funcionalidad.

## 6. Qué puede cambiar y qué debe quedar fuera

### Permitido y requerido

- Reescribir por completo cualquier texto editorial que resulte antinatural, confuso, redundante, mal conectado o impreciso en su formulación.
- Renombrar títulos, subtítulos, preguntas, etiquetas y botones cuando mejore su claridad y siga describiendo exactamente lo que muestran o hacen.
- Unificar términos repetidos y corregir incoherencias entre páginas.
- Corregir textos alternativos, etiquetas accesibles y metadatos públicos redactados por Datina.
- Corregir un texto metodológico siempre que la nueva formulación preserve la definición, el alcance y las excepciones originales.

### No modificar como parte de esta tarea

- La estructura visual, estilos CSS, colores, tipografías, espaciado, diseño de tarjetas, animaciones o comportamiento responsive.
- La arquitectura del menú, las categorías, el orden de secciones, las URL, los enlaces de destino o el esquema de navegación.
- Valores, tablas fuente, datos descargados, fórmulas, cálculos, nombres de variables, identificadores, códigos INDEC ni claves de datos.
- El comportamiento de los gráficos, las reglas de interacción, funciones activas o inactivas y configuración de IA.
- Secretos, configuración de infraestructura, DNS, publicación o despliegue.
- Instrucciones internas de desarrollo, `CLAUDE.md`, reglas de `.claude/rules/`, historiales, registros de decisiones y documentación de mantenimiento, salvo la creación del inventario editorial solicitado.

Si para hacer más claro un texto pareciera necesario cambiar la estructura, la funcionalidad, un criterio estadístico o una decisión editorial ya aprobada, no lo hagas por tu cuenta. Dejalo registrado con la razón, la ubicación exacta y una propuesta para que el autor decida.

## 7. Implementación

1. Reescribí todos los textos de acuerdo con el inventario, agrupando por la fuente de verdad y las plantillas para evitar duplicación.
2. En cada archivo, buscá si un texto se usa en otras páginas o componentes antes de cambiarlo.
3. Conservá los mecanismos de generación dinámica, interpolación de períodos, pluralización, unidades y ajustes lingüísticos existentes. No reemplaces texto dinámico por una frase fija.
4. No edites directamente la salida generada si el proyecto la reconstruye desde `scripts/` u otros archivos fuente.
5. No hagas refactors generales, reorganizaciones de código ni limpiezas no vinculadas con la redacción. Mantené el cambio acotado al contenido editorial.
6. No dejes bloques sin revisar porque sean largos o estén en archivos secundarios.
7. Si una página contiene contenido editorial que no se puede entender con seguridad a partir del código, la página renderizada y la fuente enlazada, no inventes una solución. Conservá el significado verificable y dejá la duda documentada.

## 8. Verificación completa después de editar

Reconstruí el sitio con los comandos previstos por Datina, sin descargar datos. Como mínimo, seguí el procedimiento vigente en `CLAUDE.md`, que incluye:

- `python scripts/03_construir_sitio.py`
- `node scripts/prueba_paginas.mjs`

Además, ejecutá las pruebas pertinentes para navegación, relaciones, catálogo, JavaScript y demás áreas afectadas, siguiendo `.claude/rules/pruebas.md`. No ejecutes `scripts/01_descargar.py`.

Después de construir:

1. Volvé a generar la lista de todas las rutas publicadas y comparala con la lista inicial.
2. Abrí o automatizá la inspección de cada tipo de página generado en el navegador, incluyendo páginas de provincias, temas, historias, herramientas y aplicaciones secundarias.
3. Comprobá textos estáticos y dinámicos, leyendas, tooltips, tablas, estados vacíos, botones y metadatos relevantes.
4. Confirmá que ningún texto quedó cortado, que no se muestran placeholders sin resolver, que no hay errores de codificación y que siguen funcionando navegación, filtros, descargas, gráficos y enlaces.
5. Revisá diferencias inesperadas en los archivos generados y que no se haya alterado ningún dato o resultado estadístico.
6. Hacé una búsqueda final del texto original en las fuentes de contenido. Cada coincidencia editorial que siga existiendo debe estar explicada en el inventario como texto conservado deliberadamente, texto que debe permanecer literal o contenido que no se muestra al público. No borres a la fuerza coincidencias que sean datos, nombres oficiales o contenido histórico que deba conservarse.
7. Cerrá el control de cobertura: ninguna ruta ni clase de texto puede quedar sin revisar. Si queda algo pendiente por una razón factual real, enumeralo de manera explícita; no declares la tarea completa.

Si una prueba falla, investigá y corregí únicamente los problemas causados por los cambios editoriales. No ocultes el error ni debilites las pruebas para que pasen.

## 9. Entregables obligatorios

Al terminar, dejá estos resultados en el repositorio:

1. **El sitio completo actualizado**, a través de sus fuentes de verdad, con todos los textos editoriales revisados.
2. `docs/redaccion/INVENTARIO_COPY_GLOBAL.md`, que permita comprobar la cobertura del sitio completo.
3. El inventario de textos antes/después en archivos organizados por rutas, plantillas o áreas, con cada texto original y su propuesta íntegros.
4. Un resumen ejecutivo en `docs/redaccion/RESUMEN_REESCRITURA_GLOBAL.md` con:
   - clases de páginas y rutas revisadas;
   - archivos fuente modificados;
   - principales criterios de redacción aplicados;
   - textos que se conservaron deliberadamente y por qué;
   - cuestiones que no pudieron resolverse sin validar un hecho;
   - pruebas ejecutadas y resultados;
   - resultado final del control de cobertura.
5. Un listado claro de cualquier texto que permanezca pendiente, con ruta, archivo, fragmento y motivo. Si no queda ninguno, indicarlo expresamente.

El inventario no reemplaza la implementación: los cambios tienen que estar aplicados en el código fuente y visibles en la salida construida.

## 10. Condiciones para dar el trabajo por terminado

El trabajo solo está completo si se cumplen todas estas condiciones:

- Se inspeccionó el contenido de todas las rutas publicadas y todos los tipos de página.
- Se revisó cada texto visible, incluidas las variantes dinámicas y las interfaces interactivas.
- Cada texto está en el inventario y tiene un original, una propuesta y un estado verificable.
- Todo el contenido que necesitaba reescritura fue efectivamente modificado en sus archivos fuente.
- Los textos conservados se justifican y no son simplemente omisiones.
- No se inventaron capacidades ni se modificaron datos, definiciones, fuentes, límites de interpretación o salvaguardas.
- La salida generada se revisó después de construir y las pruebas correspondientes se ejecutaron.
- La lista final de rutas y el inventario no muestran páginas ni clases de textos sin cubrir.

No hagas commit, push ni deploy. No cambies la infraestructura ni publiques el sitio. Dejá los cambios preparados en el árbol de trabajo para que el autor pueda revisarlos.

## Instrucción final

**Ejecutá el trabajo completo ahora. No te limites a describir los pasos que harías.** Si la tarea no entra en una sola respuesta o sesión, continuá por bloques de páginas siguiendo el inventario, sin volver a preguntar el alcance y sin dar por concluido el trabajo hasta completar todas las rutas y todos los textos. Al informar el resultado, distinguí claramente lo que terminaste, lo que verificaste y lo que quedó pendiente.
