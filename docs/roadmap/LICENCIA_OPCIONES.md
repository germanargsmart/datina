# Licencia de Datina: inventario y opciones

Preparado el 11 de octubre de 2026 para que el autor decida. **No se agregó ninguna licencia al repositorio ni se anunció en el sitio que los datos se puedan reutilizar.** Hasta que el autor elija, rige el derecho de autor por defecto: nadie puede copiar el código ni los textos sin permiso, aunque el repositorio sea público.

Esto no es asesoramiento legal. Las licencias de cada fuente hay que confirmarlas en la página de cada organismo antes de anunciar nada.

## Qué hay en Datina, por separado

| Material | Dónde | De quién es |
|---|---|---|
| Código | `scripts/` (Python, JavaScript, CSS, plantilla), `pobreza/src`, flujos de `.github/` | Del autor |
| Textos editoriales | Preguntas, descripciones, notas, artículos, "Sobre nosotros" (en la plantilla y en `datina.js`) | Del autor |
| Diseño e íconos propios | `datina.css`, íconos isométricos (`scripts/iconos_isometricos.py`) | Del autor |
| Compilación de datos | `datos/ordenado/tabla_larga.csv`, los CSV de cada ficha, `datos/manual/` armado a mano (por ejemplo, la selección de leyes clave y la clasificación de espacios políticos) | La selección, el orden y los cálculos son del autor. Los números de base son de cada fuente |
| Datos de terceros | `datos/crudo/` (lo que publica cada organismo, tal como lo publica) | De cada organismo, con su propia licencia |
| Banderas provinciales | `datos/manual/banderas/` (de Wikimedia Commons) | 13 en dominio público, 10 CC BY 4.0, 1 CC BY 2.5 Argentina y 1 CC0. Autores y licencias en `fuentes.csv` y en Sobre nosotros |
| Mapas | Límites provinciales y departamentales, mundo de Natural Earth | Ver la fuente de cada archivo de geometría |
| Bibliotecas | D3, topojson-client, Observable Framework, DuckDB | Cada una con su licencia abierta (ISC, MIT o Apache 2.0), que se respeta al usarlas |

### Fuentes de datos (familias, por cantidad de archivos en `datos/crudo/`)

Banco Mundial (27), DEIS (18), INDEC (16), Secretaría de Energía (15), Corte Suprema (8), CIAM (7), SINTA (5), exportaciones (5), SNIC (4), ACNUR (4) y otras con menos archivos (SSPMI, RENAPER, OEDE, EPH, Congreso, Aprender, SNEEP, ENACOM, EIA, DNRPA y más). Lo que se sabe y lo que hay que confirmar:
- **Banco Mundial:** sus indicadores se publican en general con CC BY 4.0 (citar la fuente).
- **Naciones Unidas (migración internacional):** CC BY 3.0 IGO, ya citado en la ficha.
- **EIA (Estados Unidos):** información pública del gobierno estadounidense, reutilizable citando la fuente.
- **Organismos argentinos (INDEC, ministerios, datos.gob.ar):** muchos conjuntos de datos.gob.ar declaran CC BY 4.0, y el INDEC permite reproducir citando la fuente. Hay que confirmar conjunto por conjunto.
- **Wikipedia y Wikidata** (lugar de nacimiento de ministros, algunas fechas): Wikidata es CC0, y el texto de Wikipedia es CC BY-SA.

Lo que importa para decidir: Datina puede elegir la licencia de **lo suyo** (código, textos, compilación), pero no puede cambiar la de los datos de terceros. Lo que sí puede hacer es decir claramente "los datos de base son de cada fuente, con su licencia" y citarla en cada ficha, como ya hace.

## Opciones

### Código

| Opción | Qué permite | Qué exige | A tener en cuenta |
|---|---|---|---|
| MIT | Usar, copiar y modificar, incluso en proyectos cerrados o comerciales | Mantener el aviso de derechos | La más simple y común. Cualquiera puede copiar el sitio entero |
| Apache 2.0 | Lo mismo que MIT | Mantener avisos y declarar cambios | Agrega una cláusula de patentes. Algo más larga |
| GPL 3.0 (o AGPL) | Usar y modificar | Quien lo distribuya modificado tiene que publicar su código con la misma licencia (AGPL: también si lo usa como servicio web) | Evita que alguien lo cierre. Desalienta usos comerciales |
| Sin licencia | Nada sin permiso | | Es la situación actual |

### Textos editoriales y diseño

| Opción | Qué permite | Qué exige | A tener en cuenta |
|---|---|---|---|
| CC BY 4.0 | Copiar y adaptar, también con fines comerciales | Citar a Datina | La que usan Our World in Data y muchos medios de datos |
| CC BY-SA 4.0 | Lo mismo | Citar y compartir lo derivado con la misma licencia | Como Wikipedia |
| CC BY-NC 4.0 | Copiar y adaptar sin fines comerciales | Citar | Un medio comercial no puede reproducir sin pedir permiso |
| Todos los derechos reservados | Solo citar fragmentos | | La situación actual |

### Compilación de datos (lo que Datina arma: tablas, CSV, cálculos)

| Opción | Qué permite | Qué exige | A tener en cuenta |
|---|---|---|---|
| CC BY 4.0 | Reusar las tablas | Citar a Datina y a las fuentes | Compatible con la mayoría de las fuentes (que también piden cita) |
| CC0 | Reusar sin condiciones | Nada | Máxima difusión. No obliga a citar (aunque se puede pedir) |
| ODbL | Reusar la base | Citar y compartir las bases derivadas con la misma licencia | La de OpenStreetMap. Más compleja |

## Una combinación posible, para discutir

- Código: MIT.
- Textos, diseño y compilación de datos: CC BY 4.0.
- Datos de terceros: los de cada fuente, citada en cada ficha y en `relaciones.json`. Una aclaración visible en el sitio ("los datos de base pertenecen a cada organismo y se rigen por sus condiciones").

Es lo que hacen sitios parecidos (Our World in Data publica su código con MIT y sus textos y gráficos con CC BY 4.0). Pero es una decisión del autor: también es razonable reservar los textos y abrir solo el código, o al revés.

## Qué se haría después de la decisión

1. Un archivo `LICENSE` en el repositorio (y uno aparte para los textos y datos, si son distintos).
2. Una sección corta en Sobre nosotros y una línea en el pie con la licencia y el aviso sobre los datos de terceros.
3. La licencia en el Dataset de JSON-LD (campo `license`) y en el futuro catálogo de datos.
4. Revisar las fuentes con licencia que pide compartir igual (CC BY-SA) para no mezclarlas con una licencia incompatible.
