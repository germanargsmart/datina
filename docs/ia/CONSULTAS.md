# Consultas con IA

Pedido del autor del 25 de octubre de 2026: "Empezá a integrar IA para consultas generativas con la información". Es una página nueva, "Consultas con IA" (`consulta-ia.html`, en Herramientas). Ahí cualquiera escribe una pregunta y un modelo de inteligencia artificial la contesta con las tablas de Datina. Cada respuesta trae las fichas de las que salen las cifras.

Hay dos motores, y se elige con `"consulta_ia_motor"` en `datos/manual/sitio.json`:
- **`"cloudflare"`, el gratis.** Desde el 26 de octubre de 2026 es el elegido, por pedido del autor: "avanzá con la opción de IA", la gratis. Usa un modelo abierto de Cloudflare Workers AI, sin clave y sin cuenta nueva. Ver "El motor gratis", más abajo.
- **`"anthropic"`, Claude.** Contesta mejor y cuesta por pregunta. Necesita la clave de Anthropic. Es lo que describen "Cómo funciona" y los apartados que le siguen.

Además, sin IA, el buscador da una respuesta rápida: la cifra que ya calcula el sitio para la ficha que se busca, con su fuente (opción A, `ESTADO.md`, "Pedido del autor del 26 de octubre de 2026").

Está prendida desde el 26 de octubre de 2026, con el motor gratis: ese día el autor puso la conexión `AI` de Workers AI en Cloudflare Pages, para "Production" y para "Preview", y `"consulta_ia"` pasó a `true`. Las conexiones nuevas valen desde la publicación siguiente: una que se agrega con el sitio ya publicado necesita otra publicación. Con el interruptor apagado, el armado da los mismos archivos que antes, salvo `datina.css` y `datina.js`, que suman las reglas de la página, la opción del buscador y el ícono nuevo, sin usarlos.

## Cómo funciona

1. La página (`scripts/consulta_ia.js`, que el armado copia a `sitio/consulta-ia.js`) manda la pregunta a `/api/consulta`.
2. Esa dirección es una función de Cloudflare Pages, un programa chico que corre en Cloudflare cada vez que alguien pregunta. Es `functions/api/consulta.js`, y lo que hace está en `functions/_ia/consulta.mjs`. La función:
   - arma el pedido a la API de Claude con las instrucciones fijas (`functions/_ia/indicaciones.mjs`) y el índice de las tablas (`sitio/datos/consulta_ia.json`);
   - el índice tiene una línea por tabla: nombre, pregunta de su ficha, qué mide, cobertura, período y columnas. Son 208 tablas, unos 58.000 caracteres.
3. El modelo elige qué tablas necesita y las pide con la herramienta `leer_tabla`. La función:
   - las lee del mismo sitio publicado;
   - deja solo las filas y columnas pedidas, por territorio o por período, con un máximo de 300 filas y 30.000 caracteres por tabla;
   - se las da al modelo con su fuente, sus unidades y su nota de método.
4. El modelo escribe la respuesta. La página la muestra a medida que llega, con lo que va leyendo ("Leyendo «¿Dónde se gana más?»…") y, al final, las fichas consultadas con su enlace.
5. Mientras trabaja, el botón dice "Detener" y corta la consulta. Si el servidor pasa 90 segundos sin mandar nada, la página la da por caída.
   - Un error se ve como "No se pudo contestar", con un enlace al Catálogo de datos con lo escrito.
   - Una respuesta que no llegó a terminar se borra y se avisa: nunca queda a medias como si estuviera completa.
   - Al terminar, el foco va al título de la tarjeta, para los lectores de pantalla y el teclado.

El índice lo arma `03_construir_sitio.py` desde el Catálogo de datos (`scripts/catalogo.py`): son las mismas tablas, con lo mismo que muestra el catálogo de cada una, y nada se escribe a mano. Cuando cambian los datos, el índice cambia con el armado.

## Qué controla

- **Solo datos de Datina.** Las instrucciones le piden que no dé ninguna cifra que no haya leído en una tabla en esa misma consulta, y que diga claramente cuando las tablas no alcanzan. El modelo solo puede leer tablas del índice: no puede pedir otro archivo ni salir a internet.
- **Las reglas de redacción del sitio.** Español rioplatense, cada cifra completa (qué mide, unidad, año y población), coma decimal y punto de miles, sin punto y coma, tono neutro, "e" en lugar de "y" delante de la i, correlación no es causalidad y la fuente al final. Texto corrido: sin listas ni negritas. La página lo muestra como texto, nunca como HTML.
- **Suicidio** (`CLAUDE.md`, "Temas sensibles"):
  - las tablas de suicidio no están en el índice, y tampoco la de muertes violentas, que los cuenta junto con los homicidios;
  - de cualquier tabla, la función saca las columnas y las filas que nombran el suicidio. Pasa, por ejemplo, en la comparación con la OCDE;
  - si alguien pregunta por el tema, el modelo no da cifras ni rankings: indica la sección Salud y las líneas de ayuda (135, (011) 5275-1135 y 107).
- **Topes de cada consulta.**
  - Una pregunta de hasta 400 caracteres.
  - Hasta 6 vueltas del modelo. Cada lectura de tablas es una vuelta, y en la última ya no puede pedir más tablas.
  - Hasta 8.000 tokens escritos por vuelta, contando lo que piensa.
- **Solo desde el sitio.** Solo acepta pedidos POST, y si el navegador dice de dónde viene el pedido, tiene que ser del propio sitio.
- **Respaldo.** Con Opus 5.5 o Sonnet 5.5, si el modelo declina por sus filtros de seguridad, la misma llamada sigue con el modelo que recomienda Anthropic para ese caso (`fallbacks: "default"`). Si igual no contesta, la página dice "No puedo contestar esa pregunta con los datos de Datina".
- **Privacidad.** Datina no guarda las preguntas. En el registro de Cloudflare queda solo, por consulta, el modelo, cuántas vueltas dio, cuántos tokens usó y cuántas tablas leyó. La pregunta sí viaja a Anthropic para contestarla: la página lo avisa y pide no escribir datos personales.
- **Si quien pregunta cierra la página**, la función corta la llamada al modelo para no seguir gastando.

## Cuánto cuesta

Cada pregunta se paga a Anthropic por tokens, que son pedazos de texto de unas tres o cuatro letras. Precios de la API de octubre de 2026, en dólares por millón de tokens:

| Modelo | Lo que lee | Lo que escribe | Lo que lee de la caché |
|---|---|---|---|
| Claude Opus 5.5 (el que usa, salvo otra elección) | 4 | 20 | 0,20 |
| Claude Sonnet 5.5 | 2 | 10 | 0,20 |
| Claude Haiku 5.5 | 0,10 | 0,50 | 0,01 |

Las instrucciones y el índice suman unos 17.000 tokens por vuelta. Son siempre iguales, así que la API los guarda cinco minutos en una caché. Mientras están guardados, leerlos cuesta la vigésima parte. Guardarlos cuesta un 25% más que leerlos una vez, y se paga en la primera pregunta después de cinco minutos sin preguntas.

Una pregunta común da dos o tres vueltas y lee una o dos tablas. Cuentas aproximadas, que hay que confirmar con el uso real:

| Modelo | Pregunta común | Peor caso (6 vueltas largas) |
|---|---|---|
| Opus 5.5 | 10 a 20 centavos de dólar | alrededor de 1,5 dólares |
| Sonnet 5.5 | 5 a 10 centavos | alrededor de 70 centavos |
| Haiku 5.5 | menos de 1 centavo | alrededor de 5 centavos |

Mil preguntas por mes con Opus 5.5 serían entre 100 y 200 dólares. Por eso, antes de activarla, conviene poner un límite de gasto en Anthropic (paso 2 de abajo).

La API de Anthropic devuelve en cada respuesta cuántos tokens usó, y la función lo anota en el registro de Cloudflare: "Workers & Pages", el proyecto, "Functions", "Real-time logs". Cada consulta deja una línea con `consulta_ia`.

## El motor gratis: Cloudflare Workers AI

Es la opción B que eligió el autor el 26 de octubre de 2026. Cloudflare, que ya publica el sitio, corre modelos abiertos y da gratis 10.000 "neurons" por día, su unidad de uso, para toda la cuenta.

**Cómo funciona.** Lo hace `conversarCF()` en `functions/_ia/consulta.mjs`.
1. La función busca en el índice las tablas que más se parecen a la pregunta (`elegirTablas()`), como el buscador del sitio: por las palabras de la pregunta de cada ficha, de lo que mide, de sus columnas y de sus unidades. Reconoce las 24 jurisdicciones por su nombre y unos pocos sinónimos ("gana" es salario, "luz" es electricidad). Se queda con hasta 3 tablas.
2. Lee cada tabla con `leerTabla()`, la misma lectura del motor de Claude, filtrada por la provincia nombrada y el país, y por los dos últimos años de la tabla (si la pregunta nombra un año, también ese). Le pasa al modelo las últimas 60 filas, como mucho, y hasta 6.000 caracteres por tabla.
   - Las cifras van ya redondeadas, con coma decimal y sin punto de miles (`cifraAR()`), también los rangos de la línea de las columnas. Los códigos y las columnas de tiempo (año, período, fecha, mes, semestre) quedan como están. Si el modelo las copia así, la página (`scripts/consulta_ia.js`) les pone el punto de miles a las de cinco cifras o más. Las de cuatro quedan sin punto, como acepta la RAE, porque pueden ser años. Si el modelo pone el punto él mismo, queda como lo escribió. La página también cambia por "y" la "e" que el modelo pone delante de algo que no suena como i ("en Neuquén e 0,17 en Jujuy").
   - Workers AI manda como número de JSON los pedazos de la respuesta que parecen un número, y leídos así pierden los ceros de la derecha: el "5.680" de "5.680.763" turistas quedaba 5,68 y la página mostraba "5.68.763" (el "2,22" pesos por 2.220 de una prueba anterior fue seguramente lo mismo). `textoCF()` toma cada pedazo tal como llega.
   - Sin el nombre del archivo ni la fecha de actualización del sitio, que el modelo copiaba en la respuesta o tomaba por el período del dato.
   - Si la pregunta no nombra un año, la tabla principal del tema va primero (`TABLA_PRINCIPAL`: la inflación mensual antes que la de rubros, o la población de cada provincia antes que la de las capitales).
   - Si la pregunta busca "más" o "menos", suma la más alta y la más baja de cada columna en el último período, sin el total del país, una columna por renglón: el modelo no ordena bien una tabla larga, y con todo en un párrafo dio la más alta de una columna como la de otra.
   - Las tablas de los artículos que no traen fuente en el índice llevan la suya (`FUENTES_CF`) o "la que figura en la ficha de Datina": el modelo inventaba una.
   - Las columnas cuyo nombre no alcanza llevan qué mide cada una, con sus años (`COLUMNAS_CF`: homicidios, la población proyectada y las dos de las capitales, que no traen "Qué mide" y cuyas cifras son de la ciudad, no de la provincia).
3. Le manda al modelo, en una sola llamada, sus instrucciones (`INDICACIONES_CF` en `functions/_ia/indicaciones.mjs`, las mismas reglas de redacción del sitio, dichas más corto), la pregunta y esas tablas. El modelo no elige tablas: escribe la respuesta, que la página muestra a medida que llega, con las fichas consultadas.

**El modelo.** `@cf/meta/llama-3.3-70b-instruct-fp8-fast` (Llama 3.3, de Meta, en Cloudflare). Con una variable de texto `DATINA_IA_MODELO_CF` en Cloudflare se puede elegir otro modelo de Workers AI (tiene que empezar con `@cf/`).

**Qué controla, además de lo del motor de Claude.**
- **Suicidio.** Si la pregunta nombra el suicidio, la función no llama al modelo: contesta siempre con un texto fijo, que indica la sección Salud y las líneas de ayuda (`AYUDA_SUICIDIO`). Las tablas y columnas sobre suicidio quedan afuera igual que con Claude.
- **Sin tablas que se parezcan**, no llama al modelo y dice que no encontró tablas sobre eso, con el enlace al Catálogo de datos.
- **Privacidad.** La pregunta la procesa Cloudflare, que según su política no usa lo que se le manda a Workers AI para entrenar modelos. La página lo avisa y pide no escribir datos personales. Datina no la guarda: en el registro queda el motor, el modelo, los tokens y cuántas tablas leyó.

**Cuánto cuesta.** Nada, dentro de lo gratis. Medido el 26 de octubre de 2026 con nueve preguntas comunes, cada una le manda al modelo entre 4.000 y 11.300 caracteres (unos 2.500 tokens en promedio) y la respuesta tiene unos 300 tokens. Con los precios que publica Cloudflare para Llama 3.3 70B, eso es alrededor de 130 neurons por pregunta: **unas 50 a 80 preguntas por día para todo el sitio**. Hay que confirmarlo con el uso real, que queda en el registro.
- Cuando se termina lo gratis del día, la página dice que se renueva a las 21, hora de Argentina (las 0 de la hora universal), y ofrece el Catálogo.
- Si hacen falta más, el plan Workers Paid (5 dólares por mes) cobra lo que pase de lo gratis: unos 0,15 centavos de dólar por pregunta.

**Cómo se activa (lo hace el autor).**
1. En <https://dash.cloudflare.com>: "Workers & Pages", el proyecto `datina`, "Settings", "Bindings", "Add", "Workers AI". Nombre de la variable: `AI`. Hacerlo para "Production" y para "Preview".
2. Pedirle a Claude Code que ponga `"consulta_ia": true` en `datos/manual/sitio.json`. Antes de unirlo, Claude prueba la vista previa del PR con preguntas de verdad (no gasta nada fuera de lo gratis).
3. Recomendado, igual que con Claude: un límite de pedidos por persona (paso 5 de "Cómo se activa con Claude").

**Límites.**
- **Contesta peor que Claude.** Respeta menos las reglas de redacción y puede leer mal una tabla. Por eso las fichas van siempre al pie y la página avisa que puede equivocarse.
- **Probado con el modelo real** el 26 de octubre de 2026, en la vista previa del PR que la prendió, con unas 40 preguntas en nueve tandas. Al final contestaron bien la nafta (2.220 pesos por litro en Misiones), la inflación (33,4 por ciento interanual a septiembre de 2026), el salario de Neuquén (4.094.579 pesos en mayo de 2026), la pobreza (32,3 por ciento en el primer semestre de 2026), el petróleo, las exportaciones de Chubut, las cloacas de Formosa y la provincia con más homicidios. Sobre suicidio contesta el texto fijo y fuera de tema dice que solo responde sobre los datos. Lo que se corrigió en el camino: cifras cortadas o sin espacio, decimales de más, el nombre de las tablas en la respuesta, el semestre de la pobreza y los meses que no se leían, la tabla equivocada de la inflación, la provincia con más homicidios, la unidad y los años de su tasa, las cifras que perdían ceros al llegar de Workers AI, la población de la ciudad de Córdoba dada como la de la provincia, las exportaciones sin redondear, la provincia con más exportaciones por habitante, la fuente inventada de una tabla de artículo, la "e" delante de un número y los espacios dobles. Todavía puede escribir una unidad o un período a medias: por eso conviene mirar la ficha del pie.
- **Ve solo lo que eligió la función.** Si la búsqueda elige mal las tablas, el modelo no tiene los datos y debería decirlo. Las preguntas que cruzan más de tres tablas, o que necesitan una serie larga, salen mejor con Claude.
- **Procesador.** Elegir y leer las tablas gasta entre 3 y 5 milisegundos en una pregunta común. La tabla más grande, la de votaciones de leyes, unos 11. El plan gratis da 10 por pedido (ver "Límites que hay que conocer").

## Cómo se activa con Claude (lo hace el autor)

Son pasos de cuentas y secretos: los hace el autor, no un agente (`CLAUDE.md`, "Publicación").

1. Que el sitio esté publicado en Cloudflare Pages (`docs/deploy/CLOUDFLARE.md`). La función se publica sola con el sitio: Cloudflare encuentra la carpeta `functions/` en la raíz del repositorio, y no hace falta instalar nada.
2. En la consola de Anthropic, <https://platform.claude.com> (la que antes estaba en console.anthropic.com):
   - crear una cuenta y cargar crédito;
   - en la configuración de la cuenta, en los límites, poner un límite de gasto mensual. Para empezar, 20 dólares alcanzan para unas cien a doscientas preguntas con Opus 5.5;
   - en las claves de la API ("API keys"), crear una clave para Datina y copiarla.
3. En <https://dash.cloudflare.com>: "Workers & Pages", el proyecto `datina`, "Settings", "Variables and Secrets", "Add". Tipo "Secret", nombre `ANTHROPIC_API_KEY` y, como valor, la clave copiada. Guardarla para "Production".
4. Si se quiere otro modelo, más barato, agregar en el mismo lugar una variable de texto `DATINA_IA_MODELO`:
   - `claude-sonnet-5-5`, la mitad del costo;
   - `claude-haiku-5-5`, mucho más barato y algo menos preciso.
5. Recomendado: un límite de pedidos por persona en Cloudflare, en el dominio, "Security", "WAF", "Rate limiting rules", con la ruta `/api/consulta` y 5 pedidos por minuto por IP. El plan gratis incluye una regla.
6. Pedirle a Claude Code que ponga `"consulta_ia": true` y `"consulta_ia_motor": "anthropic"` en `datos/manual/sitio.json`, arme el sitio y lo suba a `main`. Al publicarse aparece "Consultas con IA" en Herramientas y en la portada.
7. Probar en `https://datina.pages.dev/consulta-ia` con dos o tres preguntas, por ejemplo una por provincia, una del país y una que Datina no tenga, y revisar las cifras contra sus fichas.

Los cambios de variables y secretos de Cloudflare valen para las publicaciones siguientes. Si la página ya está publicada cuando se carga la clave, hay que volver a publicar, con "Retry deployment" en la última publicación.

## Cómo se apaga

- **Al instante:** con Claude, desactivar la clave en la consola de Anthropic, en "API keys". Con el motor gratis, borrar la conexión `AI` en "Settings", "Bindings" (y volver a publicar). La página queda y contesta que las consultas no están disponibles.
- **Del todo:** `"consulta_ia": false` en `datos/manual/sitio.json` y armar. La página, su código y el índice se borran de `sitio/`, y la función contesta que no están activadas aunque siga la clave.

## Límites que hay que conocer

- **El modelo puede equivocarse.** Puede leer mal una fila o hacer mal una cuenta. Por eso cada respuesta trae sus fichas y la página lo avisa. Las instrucciones le piden que diga cuándo una cifra es una cuenta suya.
- **Cada pregunta es independiente.** No recuerda la anterior. Una conversación con seguimiento cuesta más tokens por pregunta, y queda para más adelante si el autor la quiere.
- **Procesador de Cloudflare.** En el plan gratis, cada pedido tiene 10 milisegundos de procesador. Medido el 25 de octubre de 2026, leer una tabla tarda:
  - entre 0,2 y 4 milisegundos casi todas;
  - unos 10 milisegundos la más grande, la de votaciones de leyes, de 1,1 MB, con un filtro amplio.

  Si en el registro aparece "Exceeded CPU", alcanza con el plan Workers Paid, de 5 dólares por mes y 30 segundos por pedido.

## Cómo se prueba

- `node scripts/prueba_consulta_ia.mjs`: 88 controles (y 13 más sobre el índice, si está armado) con la API de Anthropic y Workers AI simulados, sin clave y sin gastar. Controla:
  - lo que se le pide a la API: modelo, caché, respaldo y herramienta;
  - lo que recibe el modelo de cada tabla: filtros, topes, comillas y nada sobre suicidio;
  - lo que llega a la página;
  - los casos en que no contesta o contesta a medias: sin clave, sin índice, GET, otro sitio, pregunta vacía o larga, cuerpo de más de 8 KB, rechazo, API saturada, respuesta cortada por el tope de tokens y tope de vueltas;
  - el motor gratis: qué recibe el modelo (la tabla que más se parece, solo el país y la provincia nombrada, los dos últimos años o el año pedido, nada sobre suicidio), los eventos partidos entre pedazos, la pregunta sobre suicidio que no llega al modelo, sin tablas, lo gratis del día terminado, Workers AI saturado, una respuesta vacía, otro modelo y sin la conexión `AI`. Lo que corrigió la prueba con el modelo real: las cifras como en la Argentina, un número que llega pegado a una palabra o que pierde los ceros de la derecha, los períodos por semestre y los que son solo un mes, y la más alta y la más baja para "¿cuál tiene más?". Con el índice armado, que elija tablas que sirven para tres preguntas comunes, que con "habitantes" empiece por la población de cada provincia, que diga los años de cada columna de homicidios, la fuente de una tabla de artículo y los rangos de las columnas redondeados.

  Si existe `sitio/datos/consulta_ia.json`, revisa también ese índice.
- Con el interruptor prendido, el armado y la prueba de páginas (`node scripts/prueba_paginas.mjs`) incluyen la página nueva.
- `node scripts/prueba_consulta_ia_pagina.mjs`, con el interruptor prendido: la página en Chrome, en el celular y con movimiento reducido, contra la función de verdad y el motor del índice armado, simulado. Son 19 controles:
  - la pregunta que llega en el enlace;
  - que el foco nunca se pierda y al terminar vaya a la tarjeta;
  - el aviso para lectores de pantalla;
  - una respuesta con su ficha y su tabla, el punto de miles en las cifras de cinco cifras o más y la "e" que pasa a "y";
  - un error, con el enlace al catálogo;
  - "Detener";
  - una respuesta que se corta sin terminar.
- En el motor de Cloudflare, sin publicar:
  1. `npm install wrangler` en una carpeta aparte.
  2. Desde la raíz del repositorio, `npx wrangler pages dev sitio --binding ANTHROPIC_API_KEY=... --binding ANTHROPIC_BASE_URL=http://127.0.0.1:8790`, con una API simulada en ese puerto.

  Se probó así el 25 de octubre de 2026: la función leyó el índice y la tabla del sitio, llamó dos veces a la API simulada y la página mostró la respuesta y la ficha.
- `wrangler pages functions build` compila la función como lo hace Cloudflare: 485 KB, 99 KB comprimida, y una sola dirección, `/api/consulta`. El resto del sitio se sirve sin pasar por la función.

## La biblioteca de Anthropic

La función usa la biblioteca oficial de Anthropic para JavaScript, `@anthropic-ai/sdk` 1.3.0, con licencia Apache 2.0. Va empaquetada en un solo archivo, `functions/_ia/anthropic-sdk.mjs`, con sus dependencias, como D3 en `scripts/lib/`: así Cloudflare no instala nada en cada publicación. Las licencias van en `functions/_ia/LICENCIAS-sdk.txt`. Para cambiar de versión:

```
mkdir /tmp/sdk && cd /tmp/sdk && npm init -y && npm install @anthropic-ai/sdk@VERSION esbuild@0.28.2
printf 'export { default } from "@anthropic-ai/sdk";\n' > entrada.mjs
npx esbuild entrada.mjs --bundle --format=esm --platform=browser --conditions=worker --target=es2022 --minify --legal-comments=eof --outfile=anthropic-sdk.mjs
```

Después:

1. Copiar el resultado a `functions/_ia/anthropic-sdk.mjs` y conservar las dos líneas de comentario del principio, con la versión nueva.
2. Actualizar las licencias.
3. Correr la prueba.

`--platform=browser` hace que la biblioteca use su versión sin Node, que es la que corre en Cloudflare.
