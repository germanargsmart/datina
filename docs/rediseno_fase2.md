# Datina, Fase 2: rediseño de UX/UI y arquitectura de información

Propuesta del 22 de octubre de 2026, sobre la rama `claude/focused-cerf-tn93c3` (commit 7cd2124). No cambia ningún archivo del repositorio. Las decisiones marcadas como **[pregunta]** las respondió el autor el 23 de octubre de 2026:

| Pregunta | Respuesta del autor |
|---|---|
| Barra de arriba | Temas, Provincias, Historias, Herramientas (y la lupa). "Más" desaparece |
| Curiosidades | Pasa a Historias con datos |
| Turismo | Pasa a Trabajo y economía |
| Cuentas públicas | Se queda en Trabajo y economía (no se mueve a Estado y sociedad) |
| Menú Provincias | Tu provincia, Departamentos y las 24 jurisdicciones con su bandera |
| Datos destacados de la portada | Sí, cuatro fijos elegidos por el autor: esperanza de vida (`f-esperanza`), salarios (`f-salarios`), homicidios (`f-homicidios`) y producción de petróleo (`f-petroleo`) |

## 0. De dónde parte

- 52 páginas en `sitio/`: portada, 19 secciones de temas, 5 herramientas que arma la plantilla (Cruces, Tu índice, Departamentos, Diagnóstico educativo, Catálogo de datos), Tu provincia, Artículos y sus 18 artículos, Laboratorio y la Corte Suprema, el Explorador de relaciones, Sobre nosotros, Contacto, la 404 y una redirección vieja (`emprendedores.html`). Aparte, el consultor de pobreza en `sitio/pobreza/`.
- El menú, la portada, el pie, las migas y el recorrido "Seguí explorando" salen de una sola lista, `GRUPOS` (`scripts/03_construir_sitio.py:450`): cuatro grupos (Personas, Trabajo y economía, Estado y sociedad, Territorio y recursos) y tres categorías internas (Población, Economía, Energía). Todo lo demás va en el menú "Más".
- Decisiones del autor que esta propuesta respeta: menú con una sola letra, un tamaño y sin negrita (4/10), tarjetas enlace grises y planas (5/10), la pregunta como título y el gráfico antes del texto (etapas 35 a 37), páginas compactas, nada que rote solo, barra y portada con el mismo orden y los mismos nombres (10/10), y no cambiar el diseño sin preguntar.
- Una decisión anterior que cambia el menú elegido: el 10/10 el autor eligió "4 grupos con menú" en la barra. El menú aprobado el 23/10 los reúne bajo "Temas" (ver la sección 3).
- Las capturas de "antes" que se sacaron para esta propuesta tienen un recuadro que agrega el método de captura (no está en el sitio). Para la comparación de la etapa C se vuelven a sacar desde el commit 7cd2124, con otro método.

## 1. Validación de las siete categorías

Categorías de partida: Personas y bienestar, Trabajo y economía, Estado y sociedad, Territorio y recursos, Historias con datos, Herramientas, Provincias. Contra las páginas reales:

| Categoría | Qué entra hoy | Problema encontrado | Corrección propuesta |
|---|---|---|---|
| Personas y bienestar | Población (con Migraciones y Turismo), Salud, Educación, Pobreza y hogares | Turismo ("¿Cuántos turistas llegan y a qué provincias van?") es actividad económica, no población | Turismo pasa a Trabajo y economía (aprobado el 23/10) |
| Trabajo y economía | Trabajo, Economía (Precios y actividad, Sector privado, Construcción y vivienda, Cuentas públicas), Sector externo | La categoría "Economía" lleva a una página que se llama "Precios y actividad". Cuentas públicas también podría ir en Estado y sociedad (recauda, gasta, debe) | La categoría queda como rótulo sin enlace y su primera página se llama por su nombre. Cuentas públicas se queda (respuesta del 23/10) |
| Estado y sociedad | Instituciones políticas, Seguridad, Curiosidades | Curiosidades (carne, vino, yerba, temperatura) no es Estado ni sociedad. Estaba ahí por pedido del autor del 11/10 | Curiosidades pasa a Historias con datos (aprobado el 23/10) |
| Territorio y recursos | Energía (con Petróleo y gas), Movilidad, Flora y fauna | Ninguno | Sin cambios |
| Historias con datos | Artículos (18) y Laboratorio (5 piezas, una con página propia: la Corte Suprema) | La Corte Suprema recibe enlaces desde solo dos páginas (10 desde el catálogo y 1 desde el Laboratorio): casi huérfana. Dos artículos de exportaciones figuran en Trabajo aunque desde el 11/10 existe Sector externo | Artículos, Laboratorio, la Corte Suprema y Curiosidades con entrada propia. Los dos artículos de exportaciones, en Sector externo (solo su `data-sec`, no el texto) |
| Herramientas | Cruces, Tu índice, Departamentos, Diagnóstico educativo, Catálogo, Explorador de relaciones | El consultor de pobreza recibe un solo enlace (desde Pobreza y hogares): casi huérfano. Departamentos responde "¿cómo cambian los números dentro de cada provincia?" | Sumar el consultor. Departamentos, a Provincias. El Catálogo y el Explorador juntos, como "Los datos" |
| Provincias | Tu provincia (perfil en 12 temas e historia de cada jurisdicción) y el mapa de la portada | El menú no tiene una entrada para la diferencia principal del sitio, la mirada por provincia | Tu provincia, las 24 jurisdicciones (cada una a `provincia.html?prov=…`) y Departamentos |

Páginas fuera del menú, a propósito: Sobre nosotros y Contacto (van en el pie), la 404 y `emprendedores.html` (redirección).

## 2. Mapa del sitio propuesto

Ninguna dirección cambia: son las mismas 52 páginas y el consultor. Solo cambia dónde aparece cada una en la navegación.

```
Inicio (index.html)
├─ Temas
│  ├─ Personas y bienestar: Población (con Migraciones), Salud, Educación, Pobreza y hogares
│  ├─ Trabajo y economía: Trabajo, Economía (Precios y actividad, Sector privado, Construcción y vivienda,
│  │                      Cuentas públicas), Sector externo, Turismo
│  ├─ Estado y sociedad: Instituciones políticas, Seguridad
│  └─ Territorio y recursos: Energía (con Petróleo y gas), Movilidad, Flora y fauna
├─ Provincias: Tu provincia (provincia.html), las 24 jurisdicciones (provincia.html?prov=…), Departamentos
├─ Historias con datos: Artículos (y los 18 a-*.html), Laboratorio, La Corte Suprema, Curiosidades
├─ Herramientas: Cruces, Tu índice, Diagnóstico educativo, Consultor de pobreza (pobreza/)
│  └─ Los datos: Catálogo de datos, De dónde sale cada número (relaciones.html)
└─ Pie: Sobre nosotros (cómo se hace, fuentes y método), Contacto, novedades por correo
```

Estado y sociedad queda con dos secciones (Instituciones políticas, con 15 fichas, y Seguridad, con 4). Es el grupo más chico, pero con mucho contenido.

## 3. Menú principal

**Medición de hoy** (Chrome, con Tierra del Fuego elegida, el peor caso): la barra muestra "Personas", "Trabajo y economía", "Estado y sociedad", "Territorio y recursos" y "Más", y deja libres 127 píxeles en 1081 de ancho y 92 en 1440. Sumar Provincias, Historias y Herramientas como entradas sueltas pide unos 360 píxeles más: no entran sin achicar la letra o acortar los nombres.

**Propuesta (aprobada por el autor el 23/10):** cuatro entradas y la lupa, todas con el mismo menú desplegable que ya existe (una letra, un tamaño, sin negrita, líneas finas entre grupos):

```
DATINA   Temas ▾   Provincias ▾   Historias ▾   Herramientas ▾                    [bandera chip]  (lupa)
```

- **Temas** abre un panel de cuatro columnas (Personas y bienestar, Trabajo y economía, Estado y sociedad, Territorio y recursos) con sus secciones: el mismo contenido y el mismo orden que el bloque de temas de la portada.
- **Provincias**: Tu provincia, Departamentos y la lista de las 24 jurisdicciones con su bandera.
- **Historias**: Artículos (los tres primeros de la portada y "todos"), Laboratorio, la Corte Suprema.
- **Herramientas**: Cruces, Tu índice, Diagnóstico educativo, Consultor de pobreza, y bajo una línea "Los datos": Catálogo y De dónde sale cada número.
- "Más" desaparece: Sobre nosotros y Contacto quedan en el pie.
- Lo que cambia respecto del 10/10: la opción A deshace "4 grupos con menú" (los cuatro grupos pasan a estar dentro de "Temas", a un clic) y conserva "barra = portada" (la portada tiene los mismos cuatro bloques en el mismo orden).
- El menú Provincias lleva también las 24 jurisdicciones (respuesta del 23/10). La provincia se sigue eligiendo en `provincia.html`: los enlaces solo llevan ahí con `?prov=`.
- En el celular y hasta 1080 píxeles: un botón "Menú" con las mismas cuatro partes plegables, y la lupa.
- Todo sigue saliendo de `GRUPOS` (barra, menús, portada, pie, migas y recorrido), con tres grupos nuevos para Provincias, Historias y Herramientas.

Alternativas descartadas por el autor: (B) los cuatro grupos como hoy, más "Provincias", y "Más" con Historias y Herramientas (en 1440 con una provincia elegida falta lugar: habría que achicar el espacio entre botones de 24 a 16 píxeles), o (C) siete entradas con nombres cortos ("Personas", "Economía", "Estado", "Territorio", "Provincias", "Historias", "Herramientas"), que cambia nombres que el autor eligió.

## 4. La portada, bloque por bloque

Hoy (1440 píxeles, 2.884 de alto), de arriba abajo:
- el bloque azul con la marca, la bajada, "Elegí tu provincia" y "Artículos", las cifras del sitio y el mapa,
- "Explorá la Argentina por tema" en cuatro columnas,
- tres artículos,
- cinco herramientas,
- el pie.

El buscador es solo la lupa de la barra, y el Laboratorio no aparece en el cuerpo de la portada.

Propuesta, de arriba abajo. Nada rota ni avanza solo. 03 escribe en el HTML la estructura y los textos fijos de cada bloque. Lo que se calcula en el navegador (las cifras destacadas, que hoy calcula `datina.js` en `CLAVE`) llega con su alto reservado, como "En cifras", para que la página no salte:

1. **Bloque azul (se conserva y se ordena).** Marca, lema y la bajada que el autor eligió el 11/10. Debajo, un **buscador a la vista** ("Buscá un tema, una pregunta o una provincia") que usa el mismo índice que la lupa, con tres preguntas de ejemplo fijas debajo, tomadas de la lista de preguntas que ya existe (`PREG`). A la derecha, el mapa como hoy: un clic en una provincia abre su tarjeta, que lleva a su perfil. Hoy las provincias del mapa son enlaces que el teclado saltea a propósito (`tabindex="-1"`, `scripts/datina.js:8077`): la grilla del bloque 4 es su alternativa. "Elegí tu provincia" se queda: es el único camino con teclado a una provincia en la primera pantalla. "Artículos" pasa al bloque 5. El buscador también encuentra provincias (el índice ya las tiene, con su bandera). Se conservan las cifras del sitio (fichas, jurisdicciones, artículos), que ya calcula 03.
2. **Datos destacados (aprobado: esperanza de vida, salarios, homicidios y producción de petróleo).** Cuatro tarjetas fijas, una por grupo de temas, con la cifra destacada de una ficha (la misma `CLAVE` que ya muestra la ficha: número, unidad, población y período), su pregunta y el enlace a la ficha. No es el recuadro "Datos rápidos" que el autor sacó el 10/10: aquel rotaba solo. Cuáles cuatro fichas: las elige el autor, o una regla fija (la primera ficha con cifra de cada grupo). En los dos casos quedan afuera las fichas de suicidio y las de muertes violentas (no llevan cifra destacada ni entran en "En cifras", por las reglas de temas sensibles), y ninguna tarjeta arma un ranking.
3. **Temas (se conserva).** Las cuatro columnas de hoy con el título que corresponde a la categoría y la pregunta de cada sección. Es el mismo contenido del menú "Temas".
4. **Provincias (nuevo).** "Tu provincia en 12 temas": las 24 jurisdicciones con su bandera, en una grilla de enlaces a `provincia.html?prov=…`, más Departamentos. Es además la alternativa con teclado y para buscadores del mapa del bloque 1.
5. **Historias con datos (se amplía).** Los tres artículos de hoy (el primero sigue la regla aprobada: la relación más marcada) y una pieza del Laboratorio (la Corte Suprema). Cada tarjeta dice qué pregunta responde y adónde lleva. "Todos los artículos", "Laboratorio" y "Curiosidades" al pie del bloque.
6. **Herramientas (se completa).** Cruces, Tu índice, Diagnóstico educativo y el consultor de pobreza, y aparte "Los datos": Catálogo y De dónde sale cada número. Misma grilla pareja de hoy (`EQUILIBRAR`).
7. **Pie (se ordena).** Las mismas columnas que el menú: Temas (las cuatro), Provincias, Historias, Herramientas y Datina. Novedades por correo y "Los datos" como hoy.

Medida a controlar: que la portada no crezca más de un 20% en alto (hoy 2.884 píxeles en la computadora y 5.243 en el celular), para no volver al "demasiado espacio en blanco".

## 5. De una pregunta a la ficha, la fuente y la descarga

1. **Entrada:** el buscador de la portada o la lupa (también con la tecla "/"), una tarjeta de Temas o de Datos destacados, el mapa o una provincia de la grilla.
2. **Buscador:** mientras se escribe, los resultados se agrupan (Fichas, Secciones, Artículos, Provincias, Herramientas). Cada ficha muestra su pregunta y su sección. Se recorren con las flechas, Enter abre y Escape cierra. Hoy no se agrupan, las flechas no hacen nada, Enter abre siempre el primero y con el campo vacío sugiere cuatro artículos.
3. **Sin resultados:** en lugar de solo "Nada coincide", tres salidas reales: los temas, las preguntas de ejemplo y "Buscar en el catálogo de datos" con lo escrito (el catálogo ya filtra por `?q=`).
4. **Ficha:** se abre en su ancla (`trabajo.html#f-…`) con la pregunta, la descripción con el período, la cifra destacada (unidad y población), el gráfico, el texto y el pie.
5. **Fuente y método:** en el pie, el organismo y "Se actualiza cada…". "De dónde sale" abre el Explorador en esa ficha (organismo, archivo y cálculo). "Para entender los datos", al final de la página, explica qué mide la sección y cómo se calcula.
6. **Descarga:** "Ver tabla", "Descargar CSV", "En el catálogo" (vista previa y diccionario de variables), "Copiar enlace" y "Descargar imagen".

Lo que se mejora en este recorrido, sin agregar ningún indicador ni texto editorial nuevo:
- El buscador encuentra también lo que hoy no indexa: los 4 artículos de series (`a-dolar-inversion`, `a-turismo-dolar`, `a-nafta-dolares`, `a-exportaciones-dolar`: el índice usa `ART` y no `ART_SERIE`, `scripts/datina.js:7840`), el Explorador de relaciones, el consultor de pobreza, las otras piezas del Laboratorio y Contacto.
- Resultados agrupados, flechas y salida sin resultados (ver el punto 2).
- Un enlace "Cómo se calcula" en el pie de cada ficha, que lleve a "Para entender los datos" de su sección (hoy está solo al final de la página).
- De la ficha al artículo: hoy un artículo enlaza a sus fichas ("Ficha: …"), pero ninguna ficha enlaza a los artículos que la usan. Se suma "Artículos con este dato" con esa misma relación al revés.
- La vuelta del consultor de pobreza: su enlace "Datina" lleva a la portada y no a Pobreza y hogares, de donde se llega.

## 6. Componentes

| Se reutilizan tal cual | Se modifican | Se crean |
|---|---|---|
| `GRUPOS` como fuente única | `GRUPOS`: tres grupos nuevos (Provincias, Historias, Herramientas) y los cambios de categoría que se aprueben | Buscador en línea para la portada (el mismo motor y el mismo índice que la lupa) |
| Menús desplegables de la barra (uno abierto por vez, Escape, vidrio) | Barra: cuatro entradas en lugar de cuatro grupos y "Más". Panel de Temas en cuatro columnas | Bloque Datos destacados (tarjeta con cifra, de la misma familia que "En cifras") |
| Tarjetas enlace grises y planas, grilla pareja `EQUILIBRAR` | Tarjetas de artículos y herramientas: pregunta, una línea de qué muestra y adónde lleva, con textos que ya existen (la bajada del artículo, la descripción de la herramienta o de la pieza). No se escriben textos nuevos | Grilla de las 24 jurisdicciones con bandera (usa `bandera()`) |
| Ficha: pregunta, descripción, `CLAVE`, gráfico, texto, pie y acciones | Pie de la ficha: enlace "Cómo se calcula" | Prueba de navegación (`scripts/prueba_navegacion.py`) |
| "En cifras", perfil provincial, "Seguí explorando", migas | Migas y "Seguí explorando" con los grupos nuevos | |
| Mapa de la portada (dibujo, clic, animación) | Mapa: un nombre accesible que diga que la grilla de provincias es su alternativa (el teclado lo sigue salteando para no sumar 24 paradas al principio de la página) | |
| Banderas, íconos isométricos, los seis tipos de botón | Pie: columnas iguales al menú | |
| Buscador de la lupa (índice, normalización sin tildes) | Resultados agrupados, flechas, salida sin resultados | |

### Problemas de accesibilidad y consistencia verificados en el código

Van a la etapa B, paso 6 y 7. Cada uno está comprobado en el archivo citado:
- No hay enlace para saltar al contenido: no aparece en `plantilla.html` ni en `datina.css`.
- Los gráficos que dibuja `lienzo()` llevan `role="img"` sin nombre accesible (`scripts/datina.js:1503-1507`). Solo unos 16 dibujos ponen `aria-label`. "Ver tabla" lo compensa en parte.
- Zonas de toque chicas: las acciones de la ficha (`.boton.chico`, 34 píxeles, `scripts/datina.css:172`), los conmutadores (34), la lupa (40), el cierre de la tarjeta del mapa (32). No hay ninguna regla para pantallas táctiles (`pointer: coarse`).
- Las migas se distinguen solo por el color (el subrayado aparece al pasar el mouse).
- El buscador anuncia la lista entera de resultados con cada tecla (`aria-live` sobre toda la lista) y no usa el patrón de lista con flechas que sí usa el selector de provincias (`scripts/datina.js:1446-1500`).
- El mapa de la portada no se usa con teclado (a propósito, `scripts/datina.js:8015` y `:8077`), y no hay una alternativa en la misma portada.
- Botones: el comentario de `datina.css` dice "cinco tipos" y las reglas dicen seis, y hay al menos diez botones con estilo propio (lupa, menús, conmutadores, suscripción, cierres). La etapa B los lleva a los seis tipos sin cambiar cómo se ven los que el autor aprobó (por ejemplo, el de la suscripción).
- En las páginas de una sola sección, cada ficha repite el nombre de la sección arriba de su pregunta.

## 7. Riesgos

| Qué | Riesgo | Cómo se evita |
|---|---|---|
| Direcciones | Romper enlaces de buscadores o compartidos | Ningún archivo cambia de nombre ni de ancla (`#f-…`, `#cat-…`, `?prov=`, `?n=`). `economia.html` sigue siendo `economia.html` aunque cambie dónde aparece. La prueba de metadatos ya controla los enlaces internos. Se suma una prueba con la lista de las 52 direcciones de hoy, que no puede achicarse |
| Buscador | Que cambie lo que encuentra | Usa el índice que arma 03 (`D.indice`). Si cambian grupos y categorías, cambian las migas de los resultados, no las fichas. Se prueba con una lista fija de búsquedas y sus primeros resultados, antes y después |
| Mapa | Romper el clic, la animación o el celular | Se suman la grilla alternativa y un nombre accesible sin tocar cómo se dibuja ni el clic. Se prueba con el mouse, el teclado, en 390 píxeles y con movimiento reducido |
| Explorador de relaciones | Arma su propia barra recortando la de las demás páginas con expresiones regulares (`scripts/relaciones.py:334-339`) | Cambiar el menú obliga a cambiar ese recorte en el mismo paso. Se prueba en `relaciones.html` |
| Catálogo de datos | Usa `GRUPOS` para sus filtros por tema (`catalogo.armar`) | Si cambian los grupos, se revisan sus filtros y su prueba |
| Páginas generadas | 03 frena si `GRUPOS` no nombra todas las secciones, si se repite un id o si una página pierde su h1 | Esos controles siguen igual y se suma uno para los grupos nuevos |
| Saltos al cargar | Lo que arma `datina.js` después de cargar hace saltar la portada (pasó en la etapa 13) | Todo bloque nuevo de la portada lo escribe 03 en el HTML, y lo que calcula `datina.js` (las cifras destacadas) reserva su alto como "En cifras". Se mide el CLS antes y después con `scripts/linea_base.mjs` |
| Datos | Alterar una cifra | Nada de esto toca `01`, `02`, `datos/` ni los cálculos. Se controla que `sitio/datos/` quede igual y que en `fichas.js` solo cambie el índice, no los datos ni el resumen |
| Netlify | Depender más de Netlify | Nada nuevo depende de Netlify: el buscador y los menús son estáticos |
| Decisiones anteriores | Volver sobre algo que el autor ya rechazó (carrusel, letra de los menús, espacio de más) | La propuesta no tiene nada que rote, usa la letra del menú de hoy y el espaciado de la etapa 39 |

## 8. Archivos que cambiarían y pruebas

**Archivos:**
- `scripts/03_construir_sitio.py`: `GRUPOS` y lo que sale de ahí (barra, menús, portada, pie, migas, recorrido), los bloques nuevos de la portada escritos en el HTML.
- `scripts/plantilla.html`: el marcado de la portada (buscador, destacados, provincias) y los menús.
- `scripts/datina.js`: el buscador, el mapa con teclado, las tarjetas.
- `scripts/datina.css`: los componentes nuevos, con los valores de `:root` que ya existen.
- `scripts/relaciones.py`: su barra recortada.
- `scripts/catalogo.py`: solo si cambian los filtros por grupo.
- Pruebas: `scripts/prueba_paginas.mjs` (teclado, buscador sin resultados, menú en todas las páginas) y una prueba nueva de navegación en Python (`scripts/prueba_navegacion.py`): cada página con el menú que sale de `GRUPOS`, las 52 direcciones de hoy presentes y ninguna página sin enlaces que lleguen a ella.
- Documentos: `CLAUDE.md`, `.claude/rules/visualizaciones.md`, `docs/roadmap/ESTADO.md` y un registro del rediseño en `docs/`.
- No se tocan: `01_descargar.py`, `02_procesar.py`, `datos/`, `pruebas_datos.py`, el consultor de pobreza.

**Pruebas por paso** (todas existen o se suman en el mismo paso):
1. `python scripts/03_construir_sitio.py` (con sus pruebas de relaciones, catálogo, metadatos, encabezados y del consultor) y la sintaxis de `datina.js`.
2. `node scripts/prueba_paginas.mjs`: las 51 páginas, "En cifras", sin CDN y lo nuevo.
3. La prueba nueva de navegación.
4. Teclado con Chrome sin ventana: recorrer el menú con Tab, abrir y cerrar con Enter y Escape, llegar a una provincia del mapa, usar el buscador sin mouse.
5. Movimiento reducido emulado en Chrome.
6. Capturas de página completa antes y después, en 390, 768, 1024 y 1440 píxeles, de la portada, una sección, un artículo, Tu provincia y una herramienta.
7. `scripts/linea_base.mjs` para desbordes, letra chica y saltos (CLS).
8. Datos sin cambios: `git diff` vacío en `sitio/datos/` (salvo el índice de `fichas.js`).

No se puede probar acá: lectores de pantalla reales (se revisan nombres y roles accesibles en el árbol de accesibilidad de Chrome, que no es lo mismo) ni teléfonos reales.

## 9. Orden de la etapa B

Cada paso es un commit con sus pruebas y capturas, y se muestra antes de seguir:
1. Navegación: `GRUPOS`, barra, menús, pie, migas y la barra del Explorador.
2. Portada.
3. Buscador.
4. Tarjetas y navegación entre artículos, fichas, herramientas y provincias.
5. Fichas y herramientas.
6. Accesibilidad del mapa y del teclado.
7. Pulido de componentes (letra, espacios, botones, estados).

## 10. Registro de la etapa B

Cada paso es un commit, con sus pruebas. Las capturas de antes y después se sacan con Chrome sin ventana, con la ventana del alto de la página.

### Paso 1: navegación (23 de octubre de 2026)

- La barra tiene Temas, Provincias, Historias y Herramientas, cada uno con su menú. "Temas" abre los cuatro grupos en columnas. "Provincias" lleva Tu provincia, Departamentos y las 24 jurisdicciones con su bandera. "Historias" lleva Artículos, Laboratorio, la Corte Suprema y Curiosidades. "Herramientas" lleva Cruces, Tu índice, Diagnóstico educativo, el consultor de pobreza y, bajo "Los datos", el Catálogo y el Explorador de relaciones.
- Hasta 1080 píxeles, un botón "Menú" con las mismas cuatro partes, plegables. "Más" ya no existe.
- Personas pasa a llamarse Personas y bienestar, Turismo pasa a Trabajo y economía y Curiosidades a Historias con datos. Los dos artículos de exportaciones pasan a Sector externo.
- En los menús, la categoría "Economía" es un rótulo sin enlace y sus cuatro secciones van debajo con su nombre (antes "Economía" llevaba a "Precios y actividad").
- El pie tiene las mismas partes que la barra, más Datina. Las migas de las páginas de Provincias, Historias y Herramientas nombran su menú. El recorrido "Seguí explorando" sigue el orden de la barra.
- Los filtros por tema del catálogo siguen los grupos de la barra.
- Ninguna dirección cambió. Nada de esto toca los datos: en `fichas.js` solo cambia el índice (la sección de dos artículos, los grupos y las categorías).
- Prueba nueva: `scripts/prueba_navegacion.py`. La prueba de páginas abre y cierra los menús con el teclado.
- Pendiente para el paso 2 (portada): Curiosidades y las piezas del Laboratorio todavía no aparecen en el cuerpo de la portada, solo en el menú Historias y en el pie. Y en el bloque de temas de la portada "Economía" sigue siendo el enlace a "Precios y actividad" (en los menús ya no).

### Paso 2: portada (23 de octubre de 2026)

De arriba abajo, en el orden de la barra:
- El bloque azul suma el buscador a la vista (el mismo motor y el mismo índice que la lupa: Enter abre el primer resultado y Escape borra lo escrito) y tres preguntas de ejemplo de la lista del buscador, cada una con enlace a su ficha: "¿Cuánto cuesta un litro de nafta?", "¿Qué parte de los hogares tiene cloacas?" y "¿Qué provincia tiene más glaciares?". "Elegí tu provincia" se queda. "Artículos" pasó al bloque de Historias.
- Datos destacados: esperanza de vida, salarios, homicidios y producción de petróleo (elegidos por el autor), con el grupo, la pregunta de la ficha, la cifra destacada y su texto completo. El constructor escribe la pregunta y el enlace, y `datina.js` la cifra, con su lugar reservado.
- Temas: igual que antes. En "Trabajo y economía" la tarjeta de la categoría ahora se llama "Precios y actividad", como su página, y "Economía:" queda como rótulo de las otras tres secciones.
- Provincias: las 24 jurisdicciones con su bandera, cada una a su perfil, y Departamentos como enlace en la bajada. Es también el camino con teclado a lo que muestra el mapa.
- Historias con datos: los tres artículos de antes (el de la relación más marcada primero) y la Corte Suprema, en dos columnas, y debajo Todos los artículos, Laboratorio y Curiosidades.
- Herramientas: las seis del menú en una fila en la computadora (Cruces, Tu índice, Diagnóstico educativo, Consultor de pobreza, Catálogo de datos y Explorador de relaciones). Las escribe el constructor, antes las armaba `datina.js`.

Medidas (Chrome sin ventana):
- Saltos al cargar (CLS) de la portada: 0,001 en 1440 píxeles y 0 en 390, igual que antes.
- Alto de la portada: en 1440 píxeles, de 2.938 (paso 1) a 3.891 (+32%), y en 390, de 5.259 a 7.368 (+40%). Supera el +20% que fijaba la sección 4. Lo agregan los dos bloques nuevos (unos 770 píxeles en la computadora). Para compactar, opciones a decidir con el autor: herramientas de a dos en el celular, datos destacados de a dos en tabletas y celulares grandes, o la grilla de provincias más apretada.
- En `fichas.js` solo cambia el mapa de anclas del índice (cinco `id` nuevos de la portada).

- La lista de resultados del buscador de la portada va fija debajo del campo: la portada recorta lo que sobresale (`overflow:hidden`, por el mapa y el sol), y en la primera versión una lista larga quedaba cortada y tapada por las preguntas de ejemplo. Lo encontró una revisión con capturas, no las pruebas, y ahora la prueba de páginas lo controla.
- Queda para el paso 3: el buscador de la portada todavía no anuncia los resultados a los lectores de pantalla ni se recorre con las flechas (lo mismo que la lupa). El paso 3 lleva los dos al patrón de lista con flechas.

Pruebas: el armado con todas sus comprobaciones, la prueba de páginas (que ahora también controla los datos destacados y el buscador de la portada, incluido que los resultados se puedan tocar), una prueba de la portada con el teclado (13 controles) y una en 1440, 1081, 1024, 768 y 390 píxeles (nada se sale de costado, ningún texto de las tarjetas queda cortado y todo resultado visible se puede tocar).

### Compactación de la portada (23 de octubre de 2026)

El autor pidió compactar la portada antes del paso 3 y eligió entre opciones medidas en Chrome sin ventana (cada una con un estilo agregado al vuelo, controlando que nada se cortara ni se saliera de costado):

| Opción | Ahorro medido | Elegida |
|---|---|---|
| Menos espacio entre los bloques de la portada (el de bloque, 24 a 40 píxeles, en lugar del de capítulo, 48 a 72) | 160 píxeles en la computadora, 120 en tableta y celular | Sí |
| Datos destacados de a dos en el celular | 222 píxeles | Sí |
| Herramientas de a dos en el celular | 381 píxeles | No |
| Mapa del pie en una fila en la computadora (cambia todas las páginas) | 190 píxeles | No |
| Historias de a cuatro en la computadora | 45 píxeles | No |
| Provincias de a ocho en la computadora | 40 píxeles (cuatro nombres en dos renglones) | No |
| Provincias de a tres en el celular | 124 píxeles, pero cortaba "Catamarca" y "Corrientes" | No se ofreció |

Resultado: en la computadora, 3.731 píxeles de alto (+27% respecto del paso 1, antes +32%). En el celular, 7.026 (+34%, antes +40%). Sigue por encima del +20% de la sección 4, por decisión del autor. Saltos al cargar sin cambios (0,001 en la computadora, con alguna carga de 0,011 que también pasa en la versión anterior, y 0 en el celular).

### Paso 3: buscador (23 de octubre de 2026)

La lupa de la barra y el buscador de la portada comparten el motor y el índice, y cambiaron igual:
- Encuentra lo que antes no estaba: los cuatro artículos de series (dólar e inversión, turismo y dólar, nafta en dólares, exportaciones y dólar), las otras cuatro piezas del Laboratorio (cada una a su lugar en `laboratorio.html`, la Corte Suprema ya estaba), el consultor de pobreza, el Explorador de relaciones y Contacto. Los nombres que muestra ya existían en el sitio. Lo único nuevo son las palabras con que se encuentran, que no se ven.
- Los resultados se agrupan como la barra: Fichas, Temas, Provincias, Historias, Herramientas y Datina, cada grupo en el orden de su mejor resultado. Cada ficha sigue mostrando su sección arriba de la pregunta.
- Con el campo vacío: las tres preguntas de ejemplo de la portada (la lista está una sola vez, en el constructor) y cuatro artículos, "Para empezar".
- Teclado: las flechas recorren la lista sin sacar el foco del campo (patrón combobox de WAI-ARIA, como el selector de provincias), Enter abre la opción marcada o, si no hay ninguna, la primera, y Escape cierra la lupa o, en la portada, borra lo escrito. Antes las flechas no hacían nada y Enter abría siempre la primera.
- Lectores de pantalla: antes la lista entera se leía con cada tecla (`aria-live` sobre los resultados). Ahora un aviso aparte dice cuántos resultados hay y cómo recorrerlos.
- Sin coincidencias: en lugar de solo "Nada coincide", tres salidas: buscar lo escrito en el catálogo de datos (`catalogo.html?q=…`), ver todos los temas y las preguntas de ejemplo.
- Ninguna dirección cambió y nada toca los datos: en `fichas.js` solo cambia el índice (el menú de cada página, las preguntas de ejemplo, las piezas del Laboratorio y el `id` del aviso de la portada).

Pruebas: el armado con todas sus comprobaciones y la prueba de páginas ("Todo en orden" en 51 páginas), que ahora también recorre la lupa con las flechas, abre un resultado con Enter y controla la salida sin coincidencias. Corrida contra la versión del paso 2, marca esos dos controles y nada más. Una prueba aparte con Chrome sin ventana (32 controles, corrida una vez y fuera del repositorio) buscó nueve cosas que antes no se encontraban o que cambiaron de grupo, el aviso, las flechas en los dos sentidos, Enter, Escape, el paso al catálogo con lo escrito y el buscador de la portada. Contra la versión del paso 2 esa prueba no pasa (no hay patrón combobox ni aviso). La lista se revisó en el navegador en 1440 y 390 píxeles, con resultados, vacía y sin coincidencias. No se probó con un lector de pantalla real.

Quedan para pasos siguientes: en 390 píxeles el texto de ayuda del campo de la lupa se corta ("Un tema, una provincia o una pregunt…", ya pasaba antes, paso 7), y salir de la lupa abierta con Tab la deja abierta (solo la cierran Escape y tocar afuera, paso 6).
