# Inventario de textos: Perfil provincial y herramientas de provincias

Generado por `scripts/inventario_textos.py`. 135 piezas: 82 revisado sin cambios, 43 reescrito, 10 conservado deliberadamente.

Cada pieza tiene su identificador (archivo#ubicación), las rutas donde se ve, el tipo, el texto original y el propuesto completos, el estado, el motivo y la verificación en las páginas armadas. Una plantilla dinámica se muestra tal como está escrita, con sus `${...}`: sus variantes se comprueban en el volcado de cada ficha.

## datos/manual/distorsiones.json#aprender_provincias.len_logra/58/corto

- Rutas: provincia.html?prov=58
- Fuente: `datos/manual/distorsiones.json`, aprender_provincias.len_logra/58/corto
- Tipo: texto de datos
- Estado: **reescrito**
- Motivo: "Umbral de representatividad" era jerga: se dice en palabras qué pasó. Es la misma aclaración corta para matemática y lengua.
- Verificación: Comprobado en la página armada: provincia.html?prov=58.

Original:

```text
Dato a título informativo: la participación en Aprender quedó por debajo del umbral de representatividad.
```

Propuesto:

```text
Dato a título informativo: participaron en Aprender menos estudiantes de los necesarios para que el resultado sea representativo.
```

## datos/manual/distorsiones.json#aprender_provincias.mat_logra/58/corto

- Rutas: provincia.html?prov=58
- Fuente: `datos/manual/distorsiones.json`, aprender_provincias.mat_logra/58/corto
- Tipo: texto de datos
- Estado: **reescrito**
- Motivo: "Umbral de representatividad" era jerga: se dice en palabras qué pasó. Es la misma aclaración corta para matemática y lengua.
- Verificación: Comprobado en la página armada: provincia.html?prov=58.

Original:

```text
Dato a título informativo: la participación en Aprender quedó por debajo del umbral de representatividad.
```

Propuesto:

```text
Dato a título informativo: participaron en Aprender menos estudiantes de los necesarios para que el resultado sea representativo.
```

## datos/manual/distorsiones.json#empleo_construccion_provincias.construccion_cada_1000/02/corto

- Rutas: provincia.html?prov=02
- Fuente: `datos/manual/distorsiones.json`, empleo_construccion_provincias.construccion_cada_1000/02/corto
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: provincia.html?prov=02.

Original:

```text
Cada empleo se cuenta donde declara la empresa, no donde está la obra.
```

Propuesto: igual al original.

## datos/manual/distorsiones.json#empleo_provincias.cada_100/02/corto

- Rutas: provincia.html?prov=02
- Fuente: `datos/manual/distorsiones.json`, empleo_provincias.cada_100/02/corto
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: provincia.html?prov=02.

Original:

```text
Cada empleo se cuenta donde declara la empresa: incluye a muchas personas que viven en el conurbano.
```

Propuesto: igual al original.

## datos/manual/distorsiones.json#robos_provincias.robos/02/corto

- Rutas: provincia.html?prov=02
- Fuente: `datos/manual/distorsiones.json`, robos_provincias.robos/02/corto
- Tipo: texto de datos
- Estado: **reescrito**
- Motivo: Término fijo: CABA. Es la aclaración corta que muestra la tarjeta del perfil (y En cifras y el mapa de la portada).
- Verificación: Comprobado en la página armada: provincia.html?prov=02.

Original:

```text
La tasa se calcula sobre quienes viven en la Ciudad, que recibe cada día a muchas personas de otras jurisdicciones.
```

Propuesto:

```text
La tasa se calcula sobre quienes viven en CABA, que recibe cada día a muchas personas de otras jurisdicciones.
```

## datos/manual/explicadores.json#cruces/bloques/0/texto

- Rutas: cruces.html
- Fuente: `datos/manual/explicadores.json`, cruces/bloques/0/texto
- Tipo: metodología
- Estado: **reescrito**
- Motivo: El ejemplo usaba la pobreza, que no está en la lista (no hay dato provincial), y la frase final era falsa: la población es un total y los salarios o la esperanza de vida son promedios.
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
Cada punto es una de las 24 jurisdicciones. Su posición depende de dos indicadores que elegís vos, por ejemplo empleo registrado y pobreza. La recta resume la relación promedio entre los dos y la franja alrededor marca el margen de error de esa recta. Todos los indicadores son tasas, porcentajes o valores por habitante, para que el tamaño de cada provincia no domine la comparación.
```

Propuesto:

```text
Cada punto es una de las 24 jurisdicciones. Su posición depende de dos indicadores que elegís vos, por ejemplo el empleo privado registrado y los homicidios dolosos. La recta resume la relación promedio entre los dos, y la franja que la rodea marca su margen de error. Salvo la población, ningún indicador depende del tamaño de la jurisdicción: son tasas, porcentajes, promedios o valores por habitante, para que las más grandes no dominen la comparación.
```

## datos/manual/explicadores.json#cruces/bloques/0/titulo

- Rutas: cruces.html
- Fuente: `datos/manual/explicadores.json`, cruces/bloques/0/titulo
- Tipo: metodología
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Qué muestra
```

Propuesto: igual al original.

## datos/manual/explicadores.json#cruces/bloques/1/texto

- Rutas: cruces.html
- Fuente: `datos/manual/explicadores.json`, cruces/bloques/1/texto
- Tipo: metodología
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
La r de Pearson va de menos uno a uno. Cerca de uno, los dos indicadores suben juntos. Cerca de menos uno, cuando uno sube el otro baja. Cerca de cero, no hay una relación lineal clara. El R² dice qué parte de las diferencias entre provincias en un indicador acompaña a las del otro. La correlación de Spearman compara posiciones en lugar de valores y es menos sensible a una provincia muy distinta del resto. El valor p indica qué tan raro sería ver esa relación si en realidad no existiera.
```

Propuesto: igual al original.

## datos/manual/explicadores.json#cruces/bloques/1/titulo

- Rutas: cruces.html
- Fuente: `datos/manual/explicadores.json`, cruces/bloques/1/titulo
- Tipo: metodología
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
Cómo leer la correlación
```

Propuesto: igual al original.

## datos/manual/explicadores.json#cruces/bloques/2/texto

- Rutas: cruces.html
- Fuente: `datos/manual/explicadores.json`, cruces/bloques/2/texto
- Tipo: metodología
- Estado: **reescrito**
- Motivo: "El explorador" es otra herramienta del sitio. Oraciones más cortas. Se conservan los tres límites.
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
Son solo 24 casos, así que una provincia puede mover mucho la recta: el explorador avisa cuál pesa más. Que dos indicadores se muevan juntos no prueba que uno cause el otro, porque puede haber un tercer factor detrás. Además son promedios provinciales: lo que vale para las provincias no tiene por qué valer para cada persona que vive en ellas, un error que se conoce como falacia ecológica. Cuando los indicadores son de años distintos, el explorador también lo aclara.
```

Propuesto:

```text
Son solo 24 casos, así que una jurisdicción puede mover mucho la recta: la herramienta avisa cuál pesa más. Que dos indicadores vayan juntos no prueba que uno cause el otro: puede haber un tercer factor detrás de los dos. Además, son datos de cada jurisdicción en su conjunto: lo que vale para las provincias no tiene por qué valer para cada persona que vive en ellas. Suponerlo es un error que se conoce como falacia ecológica. Cuando los indicadores son de años distintos, la herramienta también lo aclara.
```

## datos/manual/explicadores.json#cruces/bloques/2/titulo

- Rutas: cruces.html
- Fuente: `datos/manual/explicadores.json`, cruces/bloques/2/titulo
- Tipo: metodología
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
Para no sacar conclusiones de más
```

Propuesto: igual al original.

## datos/manual/explicadores.json#cruces/bloques/3/fuentes/0/nombre

- Rutas: cruces.html
- Fuente: `datos/manual/explicadores.json`, cruces/bloques/3/fuentes/0/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
Gapminder
```

Propuesto: igual al original.

## datos/manual/explicadores.json#cruces/bloques/3/texto

- Rutas: cruces.html
- Fuente: `datos/manual/explicadores.json`, cruces/bloques/3/texto
- Tipo: metodología
- Estado: **reescrito**
- Motivo: Faltaba la vista Correlaciones. "Estima el peso de hasta cuatro indicadores sobre otro" sonaba a causa.
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
Cuando los dos indicadores tienen serie por año, se puede ver cómo se movió cada provincia, al estilo de los gráficos animados de Gapminder. La vista de regresión múltiple estima el peso de hasta cuatro indicadores a la vez sobre otro, con las variables llevadas a la misma escala. Con 24 casos y varios indicadores parecidos entre sí, los resultados son frágiles: el factor de inflación de la varianza (VIF) avisa cuando dos explicativas se superponen demasiado.
```

Propuesto:

```text
Cuando los dos indicadores tienen serie por año, el botón «Ver la evolución» muestra cómo se movió cada jurisdicción, al estilo de los gráficos animados de Gapminder. La vista Correlaciones muestra en una matriz la relación entre todos los pares de indicadores. La vista Regresión múltiple relaciona un indicador con hasta cuatro a la vez, con todas las variables llevadas a la misma escala. Con 24 casos y varios indicadores parecidos entre sí, los resultados son frágiles: el factor de inflación de la varianza (VIF) avisa cuando dos variables explicativas se superponen demasiado.
```

## datos/manual/explicadores.json#cruces/bloques/3/titulo

- Rutas: cruces.html
- Fuente: `datos/manual/explicadores.json`, cruces/bloques/3/titulo
- Tipo: metodología
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
Evolución y regresión
```

Propuesto: igual al original.

## datos/manual/explicadores.json#cruces/glosario/0/definicion

- Rutas: cruces.html
- Fuente: `datos/manual/explicadores.json`, cruces/glosario/0/definicion
- Tipo: glosario
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
Medida de cuánto se acercan los puntos a una recta. Va de menos uno a uno.
```

Propuesto: igual al original.

## datos/manual/explicadores.json#cruces/glosario/0/termino

- Rutas: cruces.html
- Fuente: `datos/manual/explicadores.json`, cruces/glosario/0/termino
- Tipo: glosario
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
Correlación de Pearson (r)
```

Propuesto: igual al original.

## datos/manual/explicadores.json#cruces/glosario/1/definicion

- Rutas: cruces.html
- Fuente: `datos/manual/explicadores.json`, cruces/glosario/1/definicion
- Tipo: glosario
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
Parte de la variación de un indicador que acompaña a la variación del otro, en una recta de mínimos cuadrados.
```

Propuesto: igual al original.

## datos/manual/explicadores.json#cruces/glosario/2/definicion

- Rutas: cruces.html
- Fuente: `datos/manual/explicadores.json`, cruces/glosario/2/definicion
- Tipo: glosario
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
Correlación calculada sobre el orden de las provincias en lugar de sus valores.
```

Propuesto: igual al original.

## datos/manual/explicadores.json#cruces/glosario/2/termino

- Rutas: cruces.html
- Fuente: `datos/manual/explicadores.json`, cruces/glosario/2/termino
- Tipo: glosario
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html y otras.

Original:

```text
Correlación de Spearman
```

Propuesto: igual al original.

## datos/manual/explicadores.json#cruces/glosario/3/definicion

- Rutas: cruces.html
- Fuente: `datos/manual/explicadores.json`, cruces/glosario/3/definicion
- Tipo: glosario
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
Probabilidad de ver una relación al menos así de fuerte si en realidad no hubiera ninguna.
```

Propuesto: igual al original.

## datos/manual/explicadores.json#cruces/glosario/3/termino

- Rutas: cruces.html
- Fuente: `datos/manual/explicadores.json`, cruces/glosario/3/termino
- Tipo: glosario
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Valor p
```

Propuesto: igual al original.

## datos/manual/explicadores.json#cruces/glosario/4/definicion

- Rutas: cruces.html
- Fuente: `datos/manual/explicadores.json`, cruces/glosario/4/definicion
- Tipo: glosario
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
Error de suponer que una relación entre promedios de grupos vale también para las personas de esos grupos.
```

Propuesto: igual al original.

## datos/manual/explicadores.json#cruces/glosario/4/termino

- Rutas: cruces.html
- Fuente: `datos/manual/explicadores.json`, cruces/glosario/4/termino
- Tipo: glosario
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
Falacia ecológica
```

Propuesto: igual al original.

## datos/manual/explicadores.json#cruces/glosario/5/definicion

- Rutas: cruces.html
- Fuente: `datos/manual/explicadores.json`, cruces/glosario/5/definicion
- Tipo: glosario
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
Medida de cuánto cambia la recta al sacar un caso. Sirve para ver qué provincia la mueve más.
```

Propuesto: igual al original.

## datos/manual/explicadores.json#cruces/glosario/5/termino

- Rutas: cruces.html
- Fuente: `datos/manual/explicadores.json`, cruces/glosario/5/termino
- Tipo: glosario
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
Distancia de Cook
```

Propuesto: igual al original.

## datos/manual/explicadores.json#departamentos/bloques/0/fuentes/0/nombre

- Rutas: departamentos.html
- Fuente: `datos/manual/explicadores.json`, departamentos/bloques/0/fuentes/0/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: departamentos.html.

Original:

```text
Georef, Servicio de Normalización de Datos Geográficos
```

Propuesto: igual al original.

## datos/manual/explicadores.json#departamentos/bloques/0/texto

- Rutas: departamentos.html
- Fuente: `datos/manual/explicadores.json`, departamentos/bloques/0/texto
- Tipo: metodología
- Estado: **reescrito**
- Motivo: El dato provincial no siempre es un promedio, y la definición de departamento queda como en el glosario.
- Verificación: Comprobado en la página armada: departamentos.html.

Original:

```text
El mapa baja de la provincia al departamento, partido o comuna, la unidad en la que el INDEC divide cada provincia. Así se ve lo que el promedio provincial esconde: diferencias grandes entre la capital y el interior, o entre zonas vecinas. Los límites salen del Servicio de Normalización de Datos Geográficos (Georef), simplificados para que el mapa cargue rápido.
```

Propuesto:

```text
El mapa baja del dato de cada provincia al de cada departamento, partido o comuna, la división de las provincias que usa el INDEC para sus estadísticas. Así se ven las diferencias que el dato provincial no muestra, como las que hay entre la capital y el interior o entre zonas vecinas. Los límites salen del Servicio de Normalización de Datos Geográficos (Georef), simplificados para que el mapa cargue rápido.
```

## datos/manual/explicadores.json#departamentos/bloques/0/titulo

- Rutas: departamentos.html
- Fuente: `datos/manual/explicadores.json`, departamentos/bloques/0/titulo
- Tipo: metodología
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Qué muestra
```

Propuesto: igual al original.

## datos/manual/explicadores.json#departamentos/bloques/1/fuentes/0/nombre

- Rutas: departamentos.html
- Fuente: `datos/manual/explicadores.json`, departamentos/bloques/1/fuentes/0/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: departamentos.html.

Original:

```text
SNIC, estadísticas criminales por departamento
```

Propuesto: igual al original.

## datos/manual/explicadores.json#departamentos/bloques/1/fuentes/1/nombre

- Rutas: departamentos.html
- Fuente: `datos/manual/explicadores.json`, departamentos/bloques/1/fuentes/1/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: curiosidades.html, departamentos.html.

Original:

```text
RENAPER, datos abiertos
```

Propuesto: igual al original.

## datos/manual/explicadores.json#departamentos/bloques/1/fuentes/2/cita

- Rutas: departamentos.html
- Fuente: `datos/manual/explicadores.json`, departamentos/bloques/1/fuentes/2/cita
- Tipo: cita de fuente
- Estado: **conservado deliberadamente**
- Motivo: Cita textual de una fuente: se conserva literal.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
hogares que tienen más de tres personas por cuarto
```

Propuesto: igual al original.

## datos/manual/explicadores.json#departamentos/bloques/1/fuentes/2/nombre

- Rutas: departamentos.html
- Fuente: `datos/manual/explicadores.json`, departamentos/bloques/1/fuentes/2/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: construccion.html, departamentos.html.

Original:

```text
INDEC, definiciones de la base de datos del Censo 2022
```

Propuesto: igual al original.

## datos/manual/explicadores.json#departamentos/bloques/1/fuentes/3/cita

- Rutas: departamentos.html
- Fuente: `datos/manual/explicadores.json`, departamentos/bloques/1/fuentes/3/cita
- Tipo: cita de fuente
- Estado: **conservado deliberadamente**
- Motivo: Cita textual de una fuente: se conserva literal.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
por lugar de nacimiento
```

Propuesto: igual al original.

## datos/manual/explicadores.json#departamentos/bloques/1/fuentes/3/nombre

- Rutas: departamentos.html
- Fuente: `datos/manual/explicadores.json`, departamentos/bloques/1/fuentes/3/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: departamentos.html.

Original:

```text
INDEC, Censo 2022, resultados definitivos de cada provincia
```

Propuesto: igual al original.

## datos/manual/explicadores.json#departamentos/bloques/1/texto

- Rutas: departamentos.html
- Fuente: `datos/manual/explicadores.json`, departamentos/bloques/1/texto
- Tipo: metodología
- Estado: **reescrito**
- Motivo: Término fijo CABA y qué cuenta el RENAPER.
- Verificación: Comprobado en la página armada: departamentos.html.

Original:

```text
Los homicidios, las muertes en siniestros viales y los robos vienen del Sistema Nacional de Información Criminal (SNIC) del Ministerio de Seguridad, por departamento donde ocurrió el hecho. La edad de la población viene del Registro Nacional de las Personas (RENAPER), con las personas identificadas según su domicilio. El RENAPER publica la Ciudad de Buenos Aires sin dividirla en comunas. El lugar de nacimiento y los indicadores de las viviendas y los hogares vienen del Censo Nacional de Población, Hogares y Viviendas 2022 del INDEC, que sí separa las comunas de la Ciudad.
```

Propuesto:

```text
Los homicidios, las muertes en siniestros viales y los robos vienen del Sistema Nacional de Información Criminal (SNIC) del Ministerio de Seguridad, según el departamento donde ocurrió el hecho. La edad de la población viene del Registro Nacional de las Personas (RENAPER), que cuenta a las personas con DNI según el domicilio que declararon. El RENAPER publica CABA sin dividirla en comunas. El lugar de nacimiento y los indicadores de las viviendas y los hogares vienen del Censo Nacional de Población, Hogares y Viviendas 2022 del INDEC, que sí separa las comunas de CABA.
```

## datos/manual/explicadores.json#departamentos/bloques/1/titulo

- Rutas: departamentos.html
- Fuente: `datos/manual/explicadores.json`, departamentos/bloques/1/titulo
- Tipo: metodología
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
De dónde salen los datos
```

Propuesto: igual al original.

## datos/manual/explicadores.json#departamentos/bloques/2/texto

- Rutas: departamentos.html
- Fuente: `datos/manual/explicadores.json`, departamentos/bloques/2/texto
- Tipo: metodología
- Estado: **reescrito**
- Motivo: Decía "las muertes" (son los homicidios y las muertes viales, los robos son de un año) y daba un solo umbral para las listas, cuando las del censo se cortan por hogares. Suma el límite del RENAPER, que estaba solo en la nota.
- Verificación: Comprobado en la página armada: departamentos.html.

Original:

```text
En los departamentos con poca población unos pocos casos cambian mucho la tasa. Por eso las muertes se promedian en tres años y las listas de mayores y menores valores dejan afuera a los departamentos con menos de diez mil personas. El SNIC registra los hechos que llegan a la policía o a la justicia, así que los delitos no denunciados no aparecen.
```

Propuesto:

```text
En los departamentos con poca población, unos pocos casos cambian mucho la tasa. Por eso los homicidios y las muertes viales se promedian en tres años, y las listas de valores más altos y más bajos dejan afuera a los departamentos con menos de diez mil personas identificadas por el RENAPER, o con menos de tres mil hogares en los datos del censo. El SNIC registra los hechos que llegan a la policía o a la justicia, así que los delitos no denunciados no aparecen. El RENAPER registra domicilios declarados, que pueden no ser donde las personas viven hoy.
```

## datos/manual/explicadores.json#departamentos/bloques/2/titulo

- Rutas: departamentos.html
- Fuente: `datos/manual/explicadores.json`, departamentos/bloques/2/titulo
- Tipo: metodología
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: departamentos.html, pobreza.html.

Original:

```text
Para tener en cuenta
```

Propuesto: igual al original.

## datos/manual/explicadores.json#departamentos/glosario/0/definicion

- Rutas: departamentos.html
- Fuente: `datos/manual/explicadores.json`, departamentos/glosario/0/definicion
- Tipo: glosario
- Estado: **reescrito**
- Motivo: Término fijo: CABA.
- Verificación: Comprobado en la página armada: departamentos.html.

Original:

```text
División de cada provincia que usa el INDEC para sus estadísticas. En Buenos Aires se llaman partidos y en la Ciudad de Buenos Aires, comunas.
```

Propuesto:

```text
División de cada provincia que usa el INDEC para sus estadísticas. En Buenos Aires se llaman partidos y en CABA, comunas.
```

## datos/manual/explicadores.json#departamentos/glosario/0/termino

- Rutas: departamentos.html
- Fuente: `datos/manual/explicadores.json`, departamentos/glosario/0/termino
- Tipo: glosario
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Departamento
```

Propuesto: igual al original.

## datos/manual/explicadores.json#departamentos/glosario/1/definicion

- Rutas: departamentos.html
- Fuente: `datos/manual/explicadores.json`, departamentos/glosario/1/definicion
- Tipo: glosario
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: departamentos.html.

Original:

```text
Cantidad de hechos dividida por la población y multiplicada por cien mil. Permite comparar lugares de distinto tamaño.
```

Propuesto: igual al original.

## datos/manual/explicadores.json#departamentos/glosario/1/termino

- Rutas: departamentos.html
- Fuente: `datos/manual/explicadores.json`, departamentos/glosario/1/termino
- Tipo: glosario
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: departamentos.html, seguridad.html.

Original:

```text
Tasa cada 100.000 habitantes
```

Propuesto: igual al original.

## datos/manual/explicadores.json#departamentos/glosario/2/definicion

- Rutas: departamentos.html
- Fuente: `datos/manual/explicadores.json`, departamentos/glosario/2/definicion
- Tipo: glosario
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: construccion.html, departamentos.html.

Original:

```text
Más de tres personas por cuarto en un hogar, sin contar baños ni cocinas.
```

Propuesto: igual al original.

## datos/manual/explicadores.json#departamentos/glosario/2/fuente/nombre

- Rutas: departamentos.html
- Fuente: `datos/manual/explicadores.json`, departamentos/glosario/2/fuente/nombre
- Tipo: glosario
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: construccion.html, departamentos.html.

Original:

```text
INDEC, definiciones del Censo 2022
```

Propuesto: igual al original.

## datos/manual/explicadores.json#departamentos/glosario/2/termino

- Rutas: departamentos.html
- Fuente: `datos/manual/explicadores.json`, departamentos/glosario/2/termino
- Tipo: glosario
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: a-viviendas-hacinamiento.html, construccion.html, cruces.html, departamentos.html, pobreza.html, provincia.html y otras.

Original:

```text
Hacinamiento crítico
```

Propuesto: igual al original.

## datos/manual/explicadores.json#indice/bloques/0/fuentes/0/nombre

- Rutas: indice.html
- Fuente: `datos/manual/explicadores.json`, indice/bloques/0/fuentes/0/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: indice.html.

Original:

```text
OCDE, Índice para una Vida Mejor
```

Propuesto: igual al original.

## datos/manual/explicadores.json#indice/bloques/0/texto

- Rutas: indice.html
- Fuente: `datos/manual/explicadores.json`, indice/bloques/0/texto
- Tipo: metodología
- Estado: **reescrito**
- Motivo: "Y por eso los pesos quedan en el enlace" unía dos ideas que no se siguen una de otra: van en dos oraciones.
- Verificación: Comprobado en la página armada: indice.html.

Original:

```text
El índice reúne siete dimensiones, como salud, educación, trabajo y vivienda. Cada persona elige cuánto pesa cada una, de cero a cinco. Con esos pesos se calcula un promedio y las provincias se ordenan de mayor a menor. No hay un índice correcto: cambia según lo que a cada uno le importa, y por eso los pesos quedan guardados en el enlace para compartirlo.
```

Propuesto:

```text
El índice reúne siete dimensiones, como salud, educación, trabajo y vivienda. Cada persona elige cuánto pesa cada una, de cero a cinco. Con esos pesos se calcula un promedio, y las 24 jurisdicciones se ordenan de mayor a menor. No hay un índice correcto: el resultado cambia según lo que a cada uno le importa. Los pesos elegidos quedan guardados en el enlace, para compartirlo.
```

## datos/manual/explicadores.json#indice/bloques/0/titulo

- Rutas: indice.html
- Fuente: `datos/manual/explicadores.json`, indice/bloques/0/titulo
- Tipo: metodología
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Cómo se arma
```

Propuesto: igual al original.

## datos/manual/explicadores.json#indice/bloques/1/texto

- Rutas: indice.html
- Fuente: `datos/manual/explicadores.json`, indice/bloques/1/texto
- Tipo: metodología
- Estado: **reescrito**
- Motivo: Suma un límite que estaba solo en el código.
- Verificación: Comprobado en la página armada: indice.html.

Original:

```text
Cada indicador se pasa a una escala de cero a diez: la provincia con el peor valor recibe cero, la del mejor recibe diez y el resto queda en proporción. Así se pueden promediar indicadores con unidades distintas. Las exportaciones por habitante y la velocidad de internet se miden en escala logarítmica, para que unas pocas provincias con valores muy altos no aplasten al resto.
```

Propuesto:

```text
Cada indicador se pasa a una escala de cero a diez: la provincia con el peor valor recibe cero, la del mejor recibe diez y el resto queda en proporción. Así se pueden promediar indicadores con unidades distintas. Las exportaciones por habitante y la velocidad de internet se miden en escala logarítmica, para que unas pocas provincias con valores muy altos no aplasten al resto. Si a una jurisdicción le falta un indicador, su dimensión se calcula con los demás.
```

## datos/manual/explicadores.json#indice/bloques/1/titulo

- Rutas: indice.html
- Fuente: `datos/manual/explicadores.json`, indice/bloques/1/titulo
- Tipo: metodología
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: indice.html.

Original:

```text
La escala de cero a diez
```

Propuesto: igual al original.

## datos/manual/explicadores.json#indice/bloques/2/texto

- Rutas: indice.html
- Fuente: `datos/manual/explicadores.json`, indice/bloques/2/texto
- Tipo: metodología
- Estado: **reescrito**
- Motivo: Suma el límite que marcó la auditoría (la elección de los indicadores, con el ejemplo de las exportaciones) sin cambiar el índice.
- Verificación: Comprobado en la página armada: indice.html.

Original:

```text
La escala compara a las provincias entre sí. Un diez significa la mejor de las 24, no un nivel ideal. Si todas mejoran o empeoran juntas, el índice no lo muestra. Además, cada indicador es de su último año disponible y no todos coinciden. Por eso conviene mirar también las fichas de cada tema, que muestran los valores reales y su evolución.
```

Propuesto:

```text
La escala compara a las jurisdicciones entre sí. Un diez es el mejor valor entre las 24, no un nivel ideal. Si todas mejoran o empeoran juntas, el índice no lo muestra. Cada indicador es de su último año disponible, y no todos coinciden. Los indicadores de cada dimensión los eligió Datina y no son los únicos posibles: por ejemplo, las exportaciones por habitante miden lo que vende la provincia, no el ingreso de quienes viven en ella. Por eso conviene mirar también las fichas de cada tema, que muestran los valores y su evolución.
```

## datos/manual/explicadores.json#indice/bloques/2/titulo

- Rutas: indice.html
- Fuente: `datos/manual/explicadores.json`, indice/bloques/2/titulo
- Tipo: metodología
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: indice.html.

Original:

```text
Lo que el índice no dice
```

Propuesto: igual al original.

## datos/manual/explicadores.json#indice/glosario/0/definicion

- Rutas: indice.html
- Fuente: `datos/manual/explicadores.json`, indice/glosario/0/definicion
- Tipo: glosario
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: indice.html.

Original:

```text
Llevar un indicador a una escala común tomando el peor valor como cero y el mejor como diez.
```

Propuesto: igual al original.

## datos/manual/explicadores.json#indice/glosario/0/termino

- Rutas: indice.html
- Fuente: `datos/manual/explicadores.json`, indice/glosario/0/termino
- Tipo: glosario
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: indice.html.

Original:

```text
Normalización mínimo y máximo
```

Propuesto: igual al original.

## datos/manual/explicadores.json#indice/glosario/1/definicion

- Rutas: indice.html
- Fuente: `datos/manual/explicadores.json`, indice/glosario/1/definicion
- Tipo: glosario
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: indice.html.

Original:

```text
Escala en la que cada salto representa una multiplicación y no una suma. Achica la distancia entre valores muy altos.
```

Propuesto: igual al original.

## datos/manual/explicadores.json#indice/glosario/1/termino

- Rutas: indice.html
- Fuente: `datos/manual/explicadores.json`, indice/glosario/1/termino
- Tipo: glosario
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: economia.html, indice.html.

Original:

```text
Escala logarítmica
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.madres_adolescentes

- Rutas: a-cobertura-adolescentes.html, cruces.html
- Fuente: `scripts/02_procesar.py`, CRUCES_META › madres_adolescentes, línea 5960
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: a-cobertura-adolescentes.html, cruces.html.

Original:

```text
"% de los nacimientos con madres menores de 20 años"
"Población"
"DEIS, Ministerio de Salud"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.aprender_mat

- Rutas: a-internet-aprender.html, a-inversion-aprender.html, cruces.html
- Fuente: `scripts/02_procesar.py`, CRUCES_META › aprender_mat, línea 5962
- Tipo: texto de datos
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: a-internet-aprender.html, a-inversion-aprender.html, cruces.html. El texto anterior todavía aparece en: educacion.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14 (otra fuente lo repite).

Original:

```text
"Aprender, matemática"
"% de 6° grado con nivel satisfactorio o avanzado"
"Educación"
"Ministerio de Educación"
```

Propuesto:

```text
"Aprender, matemática"
"% de 6° grado con nivel satisfactorio o avanzado"
"Educación"
"Secretaría de Educación"
```

## scripts/02_procesar.py#CRUCES_META.aprender_len

- Rutas: a-internet-aprender.html, a-inversion-aprender.html, cruces.html
- Fuente: `scripts/02_procesar.py`, CRUCES_META › aprender_len, línea 5963
- Tipo: texto de datos
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: a-internet-aprender.html, a-inversion-aprender.html, cruces.html. El texto anterior todavía aparece en: educacion.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14 (otra fuente lo repite).

Original:

```text
"% de 6° grado con nivel satisfactorio o avanzado"
"Educación"
"Ministerio de Educación"
```

Propuesto:

```text
"% de 6° grado con nivel satisfactorio o avanzado"
"Educación"
"Secretaría de Educación"
```

## scripts/02_procesar.py#CRUCES_META.salario

- Rutas: cruces.html
- Fuente: `scripts/02_procesar.py`, CRUCES_META › salario, línea 5968
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
"Salario promedio de los asalariados registrados privados"
"pesos por mes, bruto, promedio por puesto"
"OEDE, Secretaría de Trabajo (SIPA)"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.viales

- Rutas: departamentos.html, seguridad.html
- Fuente: `scripts/02_procesar.py`, CRUCES_META › viales, línea 5974
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: departamentos.html, seguridad.html.

Original:

```text
"víctimas cada 100.000 habitantes"
"SNIC, Ministerio de Seguridad"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.turistas_eti

- Rutas: provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94
- Fuente: `scripts/02_procesar.py`, CRUCES_META › turistas_eti, línea 5976
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
"cada 1.000 habitantes, salidos por Ezeiza o Aeroparque"
"Encuesta de Turismo Internacional"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.cloaca

- Rutas: a-cloacas-mortalidad.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94
- Fuente: `scripts/02_procesar.py`, CRUCES_META › cloaca, línea 5982
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: a-cloacas-mortalidad.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14 y otras.

Original:

```text
"% de los hogares con desagüe a red cloacal"
"Condiciones de vida"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.vejez

- Rutas: cruces.html
- Fuente: `scripts/02_procesar.py`, CRUCES_META › vejez, línea 6001
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
"Personas mayores por cada 100 en edad de trabajar"
"personas de 65 años o más cada 100 de 15 a 64"
"Población"
"INDEC, proyecciones de población"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.otra_provincia

- Rutas: departamentos.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94
- Fuente: `scripts/02_procesar.py`, CRUCES_META › otra_provincia, línea 6011
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: departamentos.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14 y otras.

Original:

```text
"Nacidos en otra provincia"
"% de la población en viviendas particulares"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.empleo_publico

- Rutas: cruces.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94
- Fuente: `scripts/02_procesar.py`, CRUCES_META › empleo_publico, línea 6012
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: cruces.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14 y otras.

Original:

```text
"Cargos en la administración provincial"
"cada 1.000 habitantes"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.gas_red

- Rutas: cruces.html, departamentos.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94
- Fuente: `scripts/02_procesar.py`, CRUCES_META › gas_red, línea 6014
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: cruces.html, departamentos.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10 y otras.

Original:

```text
"Hogares que cocinan con gas de red"
"% de los hogares"
"Energía"
"f-gas-hogares"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.hacinamiento

- Rutas: a-viviendas-hacinamiento.html, departamentos.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94
- Fuente: `scripts/02_procesar.py`, CRUCES_META › hacinamiento, línea 6016
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: a-viviendas-hacinamiento.html, departamentos.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10 y otras.

Original:

```text
"Hacinamiento crítico"
"% de los hogares con más de tres personas por cuarto"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#perfil_vacio

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, perfil_vacio, línea 1002
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: La silueta del perfil que arma el constructor tiene que decir lo mismo que datina.js.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
f'<section class="perfil-grupo" id="pg-{g}" aria-labelledby="pg-{g}-t"><div class="perfil-cab"><h3 class="bloque-grupo" '
                     f'id="pg-{g}-t">{i + 1}. <span>{t}</span></h3><a class="enlace" href="#perfil-indice">Volver al índice</a></div>'
                     f'<div class="perfil-tarjetas">{tarjetas_vacias(PERFIL_G.count(g), "dp esqueleto")}</div></section>'
```

Propuesto:

```text
f'<section class="perfil-grupo" id="pg-{g}" aria-labelledby="pg-{g}-t"><div class="perfil-cab"><h3 class="bloque-grupo" '
                     f'id="pg-{g}-t">{i + 1}. <span>{t}</span></h3><a class="enlace" href="#perfil-indice">Volver a los temas</a></div>'
                     f'<div class="perfil-tarjetas">{tarjetas_vacias(PERFIL_G.count(g), "dp esqueleto")}</div></section>'
```

## scripts/datina.js#rangoDep.hi

- Rutas: departamentos.html
- Fuente: `scripts/datina.js`, rangoDep › hi, línea 244
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: departamentos.html.

Original:

```text
En ${NOMBRES[prov]}, la parte de la población ${que} va de ${pct(lo[k])} en ${lo.departamento} a ${pct(hi[k])} en ${hi.departamento}
, entre los departamentos de ${n0(MGP.min_pob)} habitantes o más.
```

Propuesto: igual al original.

## scripts/datina.js#TX.mapa-dep-titulo

- Rutas: departamentos.html
- Fuente: `scripts/datina.js`, TX › mapa-dep-titulo, línea 1500
- Tipo: texto de ficha
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: catalogo.html, departamentos.html. El texto anterior todavía aparece en: departamentos.html, migraciones.html (otra fuente lo repite).

Original:

```text
Indicadores de los ${R.departamentos.n} departamentos del país
```

Propuesto:

```text
¿Cómo varía cada indicador de un departamento a otro?
```

## scripts/datina.js#TX.mapa-dep

- Rutas: departamentos.html
- Fuente: `scripts/datina.js`, TX › mapa-dep, línea 1501
- Tipo: texto de ficha
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: departamentos.html.

Original:

```text
Cada provincia se divide en departamentos, partidos o comunas. Este mapa muestra datos de seguridad del SNIC, la estructura de edad de la población identificada por el RENAPER y, según el Censo 2022, dónde nació la población y cómo son las viviendas y los hogares en cada uno. Tocá una provincia para acercarte.
```

Propuesto:

```text
Cada provincia se divide en departamentos, que en Buenos Aires se llaman partidos y en CABA, comunas: son ${n0(R.departamentos.n)} en todo el país. El mapa reúne datos de tres fuentes: los homicidios, los robos y las muertes viales del Sistema Nacional de Información Criminal (SNIC), la edad de la población según el Registro Nacional de las Personas (RENAPER), y el lugar de nacimiento, las viviendas y los hogares según el Censo 2022 del INDEC. Tocá una provincia para acercarte.
```

## scripts/datina.js#COD_PROV

- Rutas: provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94
- Fuente: `scripts/datina.js`, COD_PROV, línea 1519
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18 y otras.

Original:

```text
Ciudad Autónoma de Buenos Aires
Ciudad de Buenos Aires
```

Propuesto: igual al original.

## scripts/datina.js#BCR_VISTAS.indice

- Rutas: indice.html
- Fuente: `scripts/datina.js`, BCR_VISTAS › indice, línea 4847
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Valor
En 12 meses
Valor
En 12 meses
Valor
En 12 meses
```

Propuesto: igual al original.

## scripts/datina.js#CX.sincronizar

- Rutas: cruces.html
- Fuente: `scripts/datina.js`, CX › sincronizar, línea 5441
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
Fuera del cálculo: ${lista(fuera.map(f => f.territorio))}.
```

Propuesto: igual al original.

## scripts/datina.js#CX.dispersion

- Rutas: cruces.html
- Fuente: `scripts/datina.js`, CX › dispersion, línea 5512
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
Diagrama de dispersión de ${X.nombre} ${yE(Y.nombre)} por provincia
<br>${m.res[i] > 0 ? "Por encima" : "Por debajo"} de la recta
<span class="nota-tam">Tamaño: población</span>
```

Propuesto: igual al original.

## scripts/datina.js#CX.matriz

- Rutas: cruces.html
- Fuente: `scripts/datina.js`, CX › matriz, línea 5647
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Matriz de correlaciones entre los indicadores provinciales. Moverse con las flechas y elegir con Enter
<b>${META[d.a].nombre}</b> y <b>${META[d.b].nombre}</b><br>r = ${fr(d.r)}, ${d.n} jurisdicciones<br>valor p ${fp(d.p)}<br>Tocá para ver la dispersión
Cada celda es la correlación de Pearson entre dos indicadores, de −1 (rojo) a 1 (azul), con las ${FILAS.length - st.fuera.size} jurisdicciones incluidas. 
En negrita, las que tienen valor p menor a 0,05: son ${sig} de ${celdas.length} pares. Con tantos pares, unos ${Math.round(celdas.length * .05)} pueden dar significativos solo por azar, así que conviene mirar cada uno en la dispersión antes de sacar conclusiones. Tocá una celda para abrirla.
```

Propuesto:

```text
Matriz de correlaciones entre los indicadores provinciales. Usá las flechas para pasar de una celda a otra y Enter para ver la dispersión de ese par
<b>${META[d.a].nombre}</b> ${yE(`<b>${META[d.b].nombre}</b>`)}<br>r = ${fr(d.r)}, ${d.n} jurisdicciones<br>valor p ${fp(d.p)}<br>Tocá para ver la dispersión
Cada celda es la correlación de Pearson entre dos indicadores en las ${FILAS.length - st.fuera.size} jurisdicciones incluidas. Va de −1, en rojo (cuando uno sube, el otro baja), a 1, en azul (cuando suben juntos). 
En negrita, los pares con valor p menor a 0,05: son ${n0(sig)} de ${n0(celdas.length)}. Con tantos pares, unos ${n0(Math.round(celdas.length * .05))} pueden dar significativos solo por azar: conviene mirar cada uno en la dispersión antes de sacar conclusiones. Tocá una celda para ver su dispersión.
```

## scripts/datina.js#IX.IX_ANIOS

- Rutas: indice.html
- Fuente: `scripts/datina.js`, IX › IX_ANIOS, línea 5845
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: indice.html.

Original:

```text
Cada indicador se lleva a una escala de 0 a 10, donde 0 es el peor valor entre las 24 jurisdicciones y 10 el mejor. Exportaciones y velocidad de internet se miden en logaritmo, para que un valor extremo no aplaste al resto. Cada dimensión es el promedio de sus indicadores y el índice es el promedio de las dimensiones según los pesos elegidos. Los indicadores son de años distintos, entre 
, y cada barra muestra cuánto aporta cada dimensión. No es un índice oficial: es una forma de ver qué pasa con el orden según lo que cada uno valora. Los pesos elegidos quedan en el enlace para compartirlo.
```

Propuesto:

```text
Cada indicador se lleva a una escala de 0 a 10: 0 es el peor valor entre las 24 jurisdicciones y 10, el mejor. Las exportaciones y la velocidad de internet se pasan antes a escala logarítmica, para que un valor extremo no aplaste al resto. Cada dimensión es el promedio de sus indicadores, y el índice, el promedio de las dimensiones con los pesos elegidos. Si a una jurisdicción le falta un indicador, su dimensión se calcula con los demás. Los indicadores son de años distintos, entre 
. No es un índice oficial: muestra cómo cambia el orden según lo que cada uno valora. Los pesos elegidos quedan en el enlace, para compartirlo.
```

## scripts/datina.js#IX.dibujar

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, IX › dibujar, línea 5880
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: "Puntos sobre 10" y la coma que marca el verbo omitido. Queda además una cuestión pendiente: Con pesos iguales, Chaco y Santiago del Estero tienen 2,3 y el texto nombra solo a la última. Detectar empates es cálculo.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Todos los pesos están en cero: subí al menos uno.
Con estos pesos, ${datos[0].f.territorio} queda primera, con ${n1(datos[0].t)} puntos de 10, y ${datos[datos.length - 1].f.territorio} última, con ${n1(datos[datos.length - 1].t)}.
 ${NOMBRES[prov]} queda en el puesto ${pos(prov)}.
 Frente a pesos iguales, la que más cambia es ${mov.d.f.territorio}: ${mov.m > 0 ? "sube" : "baja"} ${Math.abs(mov.m)} ${Math.abs(mov.m) === 1 ? "puesto" : "puestos"}.
```

Propuesto:

```text
Todos los pesos están en cero: subí al menos uno.
Con estos pesos, ${datos[0].f.territorio} queda primera, con ${n1(datos[0].t)} puntos sobre 10, y ${datos[datos.length - 1].f.territorio}, última, con ${n1(datos[datos.length - 1].t)}.
 ${NOMBRES[prov]} queda en el puesto ${pos(prov)} de ${datos.length}.
 Frente a pesos iguales, la que más cambia es ${mov.d.f.territorio}: ${mov.m > 0 ? "sube" : "baja"} ${Math.abs(mov.m)} ${Math.abs(mov.m) === 1 ? "puesto" : "puestos"}.
```

## scripts/datina.js#pintarExtra.caja

- Rutas: provincia.html
- Fuente: `scripts/datina.js`, pintarExtra › caja, línea 5909
- Tipo: gráfico
- Estado: **reescrito**
- Motivo: Dice con qué se compara.
- Verificación: Comprobado en la página armada: provincia.html.

Original:

```text
<div><h3>Provincias parecidas</h3><p class="suave">Elegí una provincia para ver cuáles se le parecen más en los ${R.cruces.length - 1} indicadores del explorador.</p></div>
<div><h3>Si tu provincia fuera un país</h3><p class="suave">Elegí una provincia para compararla con los países del mundo.</p></div>
```

Propuesto:

```text
<div><h3>Provincias parecidas</h3><p class="suave">Elegí una provincia para ver cuáles se le parecen más en los ${R.cruces.length - 1} indicadores de Cruces.</p></div>
<div><h3>Si tu provincia fuera un país</h3><p class="suave">Elegí una provincia para ver a qué países se parece en esperanza de vida y mortalidad infantil.</p></div>
```

## scripts/datina.js#pintarExtra.pe

- Rutas: provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94
- Fuente: `scripts/datina.js`, pintarExtra › pe, línea 5916
- Tipo: gráfico
- Estado: **reescrito**
- Motivo: "En 2022 a 2024" no se lee: es un promedio de tres años, como en la tarjeta del perfil. Se nombra qué se cuenta. Al país le faltaba el año, que la tabla del Banco Mundial ya trae (la mortalidad infantil sí lo tenía).
- Verificación: Comprobado en la página armada: provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22 y otras.

Original:

```text
<div><h3>Provincias más parecidas a ${NOMBRES[prov]}</h3><ol>
<p class="suave">La más distinta es ${lista[lista.length - 1].f.territorio}. Se compara la distancia en los ${R.cruces.length - 1} indicadores del explorador, cada uno medido en desvíos respecto del promedio de las 24.</p></div>
<div><h3>Si ${NOMBRES[prov]} fuera un país</h3><ul>
<li>Su esperanza de vida, ${n1(ev.total)} años en ${nv.ev_anio}, se parece a la de <b>${pe.pais}</b> (${n1(pe.esperanza_vida)}).</li>
<li>Su mortalidad infantil, ${n1(mi.tmi_actual)} cada 1.000 nacidos vivos en ${mo.tri_act}, se parece a la de <b>${pm.pais}</b> (${n1(pm.mortalidad_infantil)} en ${pm.mortalidad_infantil_anio}).</li>
</ul><p class="suave">Países según el Banco Mundial. La Argentina en su conjunto tiene ${n1(nv.ev_pais)} años de esperanza de vida y el promedio de la OCDE, ${n1(OC.esperanza_vida.ocde)}.</p></div>
```

Propuesto:

```text
<div><h3>Provincias más parecidas a ${NOMBRES[prov]}</h3><ol>
<p class="suave">La que menos se le parece es ${lista[lista.length - 1].f.territorio}. La comparación usa los ${R.cruces.length - 1} indicadores de Cruces. Cada uno se lleva a una misma escala, según cuánto se aleja del promedio de las 24 jurisdicciones, para que todos pesen lo mismo.</p></div>
<div><h3>Si ${NOMBRES[prov]} fuera un país</h3><ul>
<li>Su esperanza de vida al nacer, ${n1(ev.total)} años en ${nv.ev_anio}, se parece a la de <b>${pe.pais}</b> (${n1(pe.esperanza_vida)} años en ${pe.esperanza_vida_anio}).</li>
<li>Su mortalidad infantil, ${n1(mi.tmi_actual)} muertes de menores de un año cada 1.000 nacidos vivos (promedio ${mo.tri_act}), se parece a la de <b>${pm.pais}</b> (${n1(pm.mortalidad_infantil)} en ${pm.mortalidad_infantil_anio}).</li>
</ul><p class="suave">Los datos de los países son del Banco Mundial y pueden ser de otro año que los de la provincia. La esperanza de vida de la Argentina en su conjunto es de ${n1(nv.ev_pais)} años, y el promedio de los países de la OCDE, de ${n1(OC.esperanza_vida.ocde)}.</p></div>
```

## scripts/datina.js#PERFIL_GRUPOS

- Rutas: provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94
- Fuente: `scripts/datina.js`, PERFIL_GRUPOS, línea 7009
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18 y otras.

Original:

```text
Trabajo
Seguridad social
Economía
Salud
Educación
Seguridad
Población y migraciones
Gobierno
Vivienda y servicios
Energía
Turismo y naturaleza
La capital
```

Propuesto: igual al original.

## scripts/datina.js#grilla.innerHTML

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, grilla.innerHTML, línea 7025
- Tipo: gráfico
- Estado: **reescrito**
- Motivo: "Índice" en la página de una provincia se confunde con la herramienta Tu índice: el enlace vuelve a la lista de temas del perfil. Va igual en 03, que arma la silueta.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
<h3 class="bloque-grupo" id="pg-${g}-t">${i + 1}. <span>${tit}</span></h3><a class="enlace" href="#perfil-indice">Volver al índice</a></div>
```

Propuesto:

```text
<h3 class="bloque-grupo" id="pg-${g}-t">${i + 1}. <span>${tit}</span></h3><a class="enlace" href="#perfil-indice">Volver a los temas</a></div>
```

## scripts/datina.js#pintarPanel.nombre

- Rutas: provincia.html
- Fuente: `scripts/datina.js`, pintarPanel › nombre, línea 7055
- Tipo: gráfico
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: provincia.html.

Original:

```text
${nombre} en números
Elegí una de las 24
```

Propuesto:

```text
${nombre} en números
¿Cómo se compara tu provincia con el país?
```

## scripts/datina.js#pintarPanel.capF

- Rutas: provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=34, provincia.html?prov=42, provincia.html?prov=54, provincia.html?prov=94
- Fuente: `scripts/datina.js`, pintarPanel › capF, línea 7060
- Tipo: gráfico
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=34, provincia.html?prov=42 y otras.

Original:

```text
La capital
La Ciudad, entre las capitales
Su capital, ${capF.territorio}
Elegí una provincia
${c.cap ? `Puesto ${orden} entre las ${c.d.length} capitales` : `Posición ${orden} de ${c.d.length}`}, de mayor a menor.${c.pais == null ? "" : ` País: ${c.f(c.pais)}.`}${vz ? ` Es ${vz}.` : ""}${c.ocde == null ? "" : ` OCDE: ${c.f(c.ocde)}.`}
Sin total nacional comparable
Total del país
```

Propuesto:

```text
La capital
CABA, entre las capitales
Su capital, ${capF.territorio}
Elegí una provincia
Sin total nacional comparable
Sin dato para ${nombre}: la cifra es la del total del país.
Total del país
```

## scripts/datina.js#pintarChip.chip

- Rutas: provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94
- Fuente: `scripts/datina.js`, pintarChip › chip, línea 8369
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22 y otras.

Original:

```text
datos/banderas/${prov}.png
Provincia elegida: ${nom}. Ver su perfil
${nom}: ver su perfil
Ver todo el país en lugar de ${nom}
```

Propuesto: igual al original.

## scripts/plantilla.html#prov-titulo/h2

- Rutas: provincia.html
- Fuente: `scripts/plantilla.html`, prov-titulo > h2, línea 139
- Tipo: título
- Estado: **reescrito**
- Motivo: El título de la página sin provincia elegida era una instrucción: pasa a ser la pregunta que contesta el perfil (regla del autor). Con una provincia sigue el patrón del proyecto, "[Provincia] en números". Va igual en datina.js para que no salte al cargar.
- Verificación: Comprobado en la página armada: provincia.html.

Original:

```text
<span id="prov-band"></span><span id="prov-titulo-txt">Elegí una de las 24</span>
```

Propuesto:

```text
<span id="prov-band"></span><span id="prov-titulo-txt">¿Cómo se compara tu provincia con el país?</span>
```

## scripts/plantilla.html#elige-btn/button.elige-btn

- Rutas: provincia.html
- Fuente: `scripts/plantilla.html`, elige-btn > button.elige-btn, línea 142
- Tipo: botón
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
<span id="elige-valor">Todo el país</span><span class="elige-flecha" aria-hidden="true"></span>
```

Propuesto: igual al original.

## scripts/plantilla.html#elige-buscar/input.elige-buscar@aria-label

- Rutas: provincia.html
- Fuente: `scripts/plantilla.html`, elige-buscar > input.elige-buscar [aria-label], línea 146
- Tipo: accesibilidad
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18 y otras.

Original:

```text
Buscar provincia
```

Propuesto: igual al original.

## scripts/plantilla.html#elige-buscar/input.elige-buscar@placeholder

- Rutas: provincia.html
- Fuente: `scripts/plantilla.html`, elige-buscar > input.elige-buscar [placeholder], línea 146
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18 y otras.

Original:

```text
Buscar provincia
```

Propuesto: igual al original.

## scripts/plantilla.html#elige-vacio/p.elige-vacio

- Rutas: provincia.html
- Fuente: `scripts/plantilla.html`, elige-vacio > p.elige-vacio, línea 149
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18 y otras.

Original:

```text
Ninguna provincia coincide
```

Propuesto: igual al original.

## scripts/plantilla.html#cruces/h2

- Rutas: cruces.html
- Fuente: `scripts/plantilla.html`, cruces > h2, línea 2264
- Tipo: título
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Cruces
```

Propuesto: igual al original.

## scripts/plantilla.html#cruces/p.pregunta

- Rutas: cruces.html
- Fuente: `scripts/plantilla.html`, cruces > p.pregunta, línea 2266
- Tipo: pregunta de página
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
¿Qué indicadores se mueven juntos entre las provincias?
```

Propuesto:

```text
¿Qué indicadores van juntos entre las provincias?
```

## scripts/plantilla.html#cruces/p.pregunta@data-corta

- Rutas: cruces.html
- Fuente: `scripts/plantilla.html`, cruces > p.pregunta [data-corta], línea 2266
- Tipo: texto de tarjeta
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
¿Qué indicadores se mueven juntos?
```

Propuesto:

```text
¿Qué indicadores van juntos?
```

## scripts/plantilla.html#cruces/p

- Rutas: cruces.html
- Fuente: `scripts/plantilla.html`, cruces > p, línea 2267
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
Elegí dos indicadores y mirá cómo se ubican las 24 jurisdicciones, con la recta que mejor las resume y las advertencias para no sacar conclusiones de más.
```

Propuesto:

```text
Elegí dos indicadores y fijate cómo se ubican las 24 jurisdicciones. También podés ver las correlaciones entre todos los pares de indicadores y una regresión con varios a la vez.
```

## scripts/plantilla.html#f-cruces/h2

- Rutas: cruces.html
- Fuente: `scripts/plantilla.html`, f-cruces > h2, línea 2271
- Tipo: pregunta de ficha
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: catalogo.html, cruces.html.

Original:

```text
Explorador de indicadores provinciales
```

Propuesto:

```text
¿Cómo se relacionan dos indicadores entre las provincias?
```

## scripts/plantilla.html#f-cruces/p.lead

- Rutas: cruces.html
- Fuente: `scripts/plantilla.html`, f-cruces > p.lead, línea 2272
- Tipo: texto de ficha
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
Elegí dos indicadores y mirá si las 24 jurisdicciones se ordenan juntas. Sirve para explorar: una correlación no dice qué causa qué. El diseño sigue a los exploradores regionales de la OCDE y Eurostat, a Gapminder y al Atlas de Desarrollo Humano de Brasil.
```

Propuesto:

```text
Cada punto es una jurisdicción, y la recta resume la relación entre los dos indicadores. Debajo del gráfico, un texto dice qué tan fuerte es la relación y si puede deberse al azar. Sirve para explorar: que dos indicadores vayan juntos no dice que uno cause el otro. El diseño sigue a los exploradores regionales de la OCDE y de Eurostat, a Gapminder y al Atlas de Desarrollo Humano de Brasil.
```

## scripts/plantilla.html#f-cruces/div.conmutador.pestanas@aria-label

- Rutas: cruces.html
- Fuente: `scripts/plantilla.html`, f-cruces > div.conmutador.pestanas [aria-label], línea 2273
- Tipo: accesibilidad
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
Tipo de análisis
```

Propuesto: igual al original.

## scripts/plantilla.html#tab-cx-disp/button

- Rutas: cruces.html
- Fuente: `scripts/plantilla.html`, tab-cx-disp > button, línea 2274
- Tipo: botón
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Dispersión
```

Propuesto: igual al original.

## scripts/plantilla.html#tab-cx-matriz/button

- Rutas: cruces.html
- Fuente: `scripts/plantilla.html`, tab-cx-matriz > button, línea 2275
- Tipo: botón
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Correlaciones
```

Propuesto: igual al original.

## scripts/plantilla.html#tab-cx-multi/button

- Rutas: cruces.html
- Fuente: `scripts/plantilla.html`, tab-cx-multi > button, línea 2276
- Tipo: botón
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
Regresión múltiple
```

Propuesto: igual al original.

## scripts/plantilla.html#pan-cx-disp/label.cx-campo

- Rutas: cruces.html
- Fuente: `scripts/plantilla.html`, pan-cx-disp > label.cx-campo, línea 2281
- Tipo: etiqueta de control
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: cruces.html, politica.html.

Original:

```text
<span>Eje horizontal</span><select id="cx-x"></select>
```

Propuesto: igual al original.

## scripts/plantilla.html#cx-cambiar/button.boton.chico

- Rutas: cruces.html
- Fuente: `scripts/plantilla.html`, cx-cambiar > button.boton.chico, línea 2282
- Tipo: botón
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Invertir ejes
```

Propuesto: igual al original.

## scripts/plantilla.html#pan-cx-disp/label.cx-campo~2

- Rutas: cruces.html
- Fuente: `scripts/plantilla.html`, pan-cx-disp > label.cx-campo, línea 2283
- Tipo: etiqueta de control
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
<span>Eje vertical</span><select id="cx-y"></select>
```

Propuesto: igual al original.

## scripts/plantilla.html#pan-cx-disp/label

- Rutas: cruces.html
- Fuente: `scripts/plantilla.html`, pan-cx-disp > label, línea 2286
- Tipo: etiqueta de control
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
<input type="checkbox" id="cx-tam"> Tamaño según población
```

Propuesto: igual al original.

## scripts/plantilla.html#pan-cx-disp/label~2

- Rutas: cruces.html
- Fuente: `scripts/plantilla.html`, pan-cx-disp > label, línea 2287
- Tipo: etiqueta de control
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
<input type="checkbox" id="cx-logx"> Horizontal logarítmico
```

Propuesto:

```text
<input type="checkbox" id="cx-logx"> Eje horizontal logarítmico
```

## scripts/plantilla.html#pan-cx-disp/label~3

- Rutas: cruces.html
- Fuente: `scripts/plantilla.html`, pan-cx-disp > label, línea 2288
- Tipo: etiqueta de control
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
<input type="checkbox" id="cx-logy"> Vertical logarítmico
```

Propuesto:

```text
<input type="checkbox" id="cx-logy"> Eje vertical logarítmico
```

## scripts/plantilla.html#cx-caba/button.boton.chico

- Rutas: cruces.html
- Fuente: `scripts/plantilla.html`, cx-caba > button.boton.chico, línea 2289
- Tipo: botón
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Sin CABA
```

Propuesto: igual al original.

## scripts/plantilla.html#cx-reponer/button.enlace.cx-reponer

- Rutas: cruces.html
- Fuente: `scripts/plantilla.html`, cx-reponer > button.enlace.cx-reponer, línea 2295
- Tipo: botón
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
Volver a sumar todas
```

Propuesto: igual al original.

## scripts/plantilla.html#cx-play/button.boton.chico

- Rutas: cruces.html
- Fuente: `scripts/plantilla.html`, cx-play > button.boton.chico, línea 2304
- Tipo: botón
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: cruces.html, laboratorio.html.

Original:

```text
Ver la evolución
```

Propuesto: igual al original.

## scripts/plantilla.html#cx-anio/input@aria-label

- Rutas: cruces.html
- Fuente: `scripts/plantilla.html`, cx-anio > input [aria-label], línea 2305
- Tipo: accesibilidad
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Año
```

Propuesto: igual al original.

## scripts/plantilla.html#cx-ultimo/button.boton.chico

- Rutas: cruces.html
- Fuente: `scripts/plantilla.html`, cx-ultimo > button.boton.chico, línea 2307
- Tipo: botón
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Último dato
```

Propuesto: igual al original.

## scripts/plantilla.html#pan-cx-disp/p.nota

- Rutas: cruces.html
- Fuente: `scripts/plantilla.html`, pan-cx-disp > p.nota, línea 2314
- Tipo: nota metodológica
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: catalogo.html, cruces.html.

Original:

```text
Tocá un punto para sacar esa jurisdicción del cálculo y otra vez para volver a sumarla. La recta es una regresión lineal por mínimos cuadrados y la franja celeste, su intervalo de confianza del 95%. Con 24 casos, correlaciones moderadas pueden aparecer por azar. Son promedios de cada provincia: no dicen nada de cada persona. Y dos indicadores pueden moverse juntos porque dependen de un tercero, como el ingreso o la urbanización.
```

Propuesto:

```text
Tocá un punto, o llegá a él con Tab y apretá Enter, para sacar esa jurisdicción del cálculo. Hacé lo mismo para volver a sumarla. La recta es la que mejor resume los puntos (regresión lineal por mínimos cuadrados), y la franja celeste es su margen de error, con un 95% de confianza. Con 24 casos, una correlación moderada puede aparecer por azar. Los datos son de cada jurisdicción en su conjunto: no dicen nada de cada persona. Dos indicadores también pueden ir juntos porque los dos dependen de un tercero, como el ingreso o la urbanización.
```

## scripts/plantilla.html#pan-cx-disp/summary

- Rutas: cruces.html
- Fuente: `scripts/plantilla.html`, pan-cx-disp > summary, línea 2316
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
Ver los datos del cruce
```

Propuesto: igual al original.

## scripts/plantilla.html#pan-cx-multi/label.cx-campo

- Rutas: cruces.html
- Fuente: `scripts/plantilla.html`, pan-cx-multi > label.cx-campo, línea 2326
- Tipo: etiqueta de control
- Estado: **conservado deliberadamente**
- Motivo: "Indicador a explicar" y "Variables explicativas" son los nombres técnicos de la regresión. El texto que arma la lectura ya no dice que las variables "explican" el indicador.
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
<span>Indicador a explicar</span><select id="cm-y"></select>
```

Propuesto: igual al original.

## scripts/plantilla.html#pan-cx-multi/legend

- Rutas: cruces.html
- Fuente: `scripts/plantilla.html`, pan-cx-multi > legend, línea 2328
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
Variables explicativas, hasta cuatro
```

Propuesto: igual al original.

## scripts/plantilla.html#pan-cx-multi/p.nota

- Rutas: cruces.html
- Fuente: `scripts/plantilla.html`, pan-cx-multi > p.nota, línea 2333
- Tipo: nota metodológica
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
Regresión lineal por mínimos cuadrados con todas las variables estandarizadas, así los coeficientes se pueden comparar: cada uno indica cuántos desvíos cambia el indicador a explicar cuando esa variable sube un desvío y las demás quedan fijas. Las barras son intervalos de confianza del 95%. En azul, los coeficientes con valor p menor a 0,05. El VIF mide cuánto se superpone cada variable con las otras: arriba de 5, sus coeficientes separados no son confiables. Con 24 casos, conviene usar pocas variables.
```

Propuesto:

```text
Es una regresión lineal por mínimos cuadrados. Todas las variables se pasan a la misma escala, en desvíos estándar respecto de su promedio, así los coeficientes se pueden comparar entre sí. Cada coeficiente dice cuántos desvíos más arriba o más abajo tiende a estar el indicador a explicar cuando esa variable está un desvío más arriba y las demás quedan fijas. Cada barra es el margen de error de un coeficiente, con un 95% de confianza. En azul, los coeficientes con valor p menor a 0,05, que es poco probable que se deban al azar. El VIF mide cuánto se superpone cada variable con las otras: arriba de 5, sus coeficientes por separado no son confiables. Con 24 casos, conviene usar pocas variables.
```

## scripts/plantilla.html#f-cruces/a

- Rutas: cruces.html
- Fuente: `scripts/plantilla.html`, f-cruces > a, línea 2335
- Tipo: fuente o descarga
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Descargar tabla (CSV)
```

Propuesto: igual al original.

## scripts/plantilla.html#f-cruces/span

- Rutas: cruces.html
- Fuente: `scripts/plantilla.html`, f-cruces > span, línea 2335
- Tipo: fuente o descarga
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: cruces.html.

Original:

```text
Fuentes: las de cada indicador, indicadas debajo del gráfico
```

Propuesto:

```text
Fuentes: las de cada indicador, que figuran debajo del gráfico
```

## scripts/plantilla.html#indice/h2

- Rutas: indice.html
- Fuente: `scripts/plantilla.html`, indice > h2, línea 2340
- Tipo: título
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Tu índice
```

Propuesto: igual al original.

## scripts/plantilla.html#indice/p.pregunta

- Rutas: indice.html
- Fuente: `scripts/plantilla.html`, indice > p.pregunta, línea 2342
- Tipo: pregunta de página
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: indice.html.

Original:

```text
¿Qué provincia está mejor según lo que a vos te importa?
```

Propuesto: igual al original.

## scripts/plantilla.html#indice/p.pregunta@data-corta

- Rutas: indice.html
- Fuente: `scripts/plantilla.html`, indice > p.pregunta [data-corta], línea 2342
- Tipo: texto de tarjeta
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
¿Qué provincia está mejor para vos?
```

Propuesto: igual al original.

## scripts/plantilla.html#indice/p

- Rutas: indice.html
- Fuente: `scripts/plantilla.html`, indice > p, línea 2343
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: indice.html.

Original:

```text
Cada persona le da su propio peso a siete dimensiones y el índice ordena las provincias con esos pesos.
```

Propuesto:

```text
Elegí cuánto pesa cada una de siete dimensiones, como la salud, la educación o la seguridad, y el índice ordena las 24 jurisdicciones con esos pesos.
```

## scripts/plantilla.html#f-indice/h2

- Rutas: indice.html
- Fuente: `scripts/plantilla.html`, f-indice > h2, línea 2347
- Tipo: pregunta de ficha
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: catalogo.html, indice.html.

Original:

```text
Armá tu propio índice de bienestar provincial
```

Propuesto:

```text
¿Cómo cambia el orden de las provincias según el peso de cada dimensión?
```

## scripts/plantilla.html#f-indice/p.lead

- Rutas: indice.html
- Fuente: `scripts/plantilla.html`, f-indice > p.lead, línea 2348
- Tipo: texto de ficha
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: indice.html.

Original:

```text
Cada persona valora cosas distintas. Mové los controles para darle más o menos peso a cada dimensión y mirá cómo cambia el orden de las 24 jurisdicciones. La idea viene del Índice para una Vida Mejor de la OCDE.
```

Propuesto:

```text
Cada persona valora cosas distintas. Mové los controles para darle a cada dimensión un peso de 0 a 5 y fijate cómo cambia el orden de las 24 jurisdicciones. Cada barra es el puntaje de una jurisdicción, de 0 a 10, y sus colores muestran cuánto aporta cada dimensión. La idea viene del Índice para una Vida Mejor de la OCDE.
```

## scripts/plantilla.html#ix-pesos/div.ix-pesos@aria-label

- Rutas: indice.html
- Fuente: `scripts/plantilla.html`, ix-pesos > div.ix-pesos [aria-label], línea 2350
- Tipo: accesibilidad
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html, indice.html.

Original:

```text
Peso de cada dimensión
```

Propuesto: igual al original.

## scripts/plantilla.html#f-indice/a

- Rutas: indice.html
- Fuente: `scripts/plantilla.html`, f-indice > a, línea 2358
- Tipo: fuente o descarga
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Descargar tabla (CSV)
```

Propuesto: igual al original.

## scripts/plantilla.html#f-indice/span

- Rutas: indice.html
- Fuente: `scripts/plantilla.html`, f-indice > span, línea 2358
- Tipo: fuente o descarga
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: indice.html.

Original:

```text
Fuentes: las de cada indicador, en la tabla descargable
```

Propuesto:

```text
Fuentes: las de cada indicador, que figuran en Cruces
```

## scripts/plantilla.html#departamentos/h2

- Rutas: departamentos.html
- Fuente: `scripts/plantilla.html`, departamentos > h2, línea 2363
- Tipo: título
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Departamentos
```

Propuesto: igual al original.

## scripts/plantilla.html#departamentos/p.pregunta

- Rutas: departamentos.html
- Fuente: `scripts/plantilla.html`, departamentos > p.pregunta, línea 2365
- Tipo: pregunta de página
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: departamentos.html.

Original:

```text
¿Cómo cambian los números dentro de cada provincia?
```

Propuesto:

```text
¿Qué diferencias hay entre los departamentos de una misma provincia?
```

## scripts/plantilla.html#departamentos/p

- Rutas: departamentos.html
- Fuente: `scripts/plantilla.html`, departamentos > p, línea 2366
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: departamentos.html.

Original:

```text
Un mapa con los departamentos de todo el país para ver lo que el promedio provincial esconde.
```

Propuesto:

```text
Un mapa con todos los departamentos, partidos y comunas del país, para ver las diferencias que el dato de cada provincia no muestra.
```

## scripts/plantilla.html#f-mapa/label.selector-ficha

- Rutas: departamentos.html
- Fuente: `scripts/plantilla.html`, f-mapa > label.selector-ficha, línea 2372
- Tipo: etiqueta de control
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
<span>Indicador</span><select id="mp-ind"></select>
```

Propuesto: igual al original.

## scripts/plantilla.html#mp-pais/button.boton.chico

- Rutas: departamentos.html
- Fuente: `scripts/plantilla.html`, mp-pais > button.boton.chico, línea 2378
- Tipo: botón
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: departamentos.html.

Original:

```text
Ver todo el mapa
```

Propuesto: igual al original.

## scripts/plantilla.html#f-mapa/a

- Rutas: departamentos.html
- Fuente: `scripts/plantilla.html`, f-mapa > a, línea 2382
- Tipo: fuente o descarga
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Descargar tabla (CSV)
```

Propuesto: igual al original.

## scripts/plantilla.html#f-mapa/span

- Rutas: departamentos.html
- Fuente: `scripts/plantilla.html`, f-mapa > span, línea 2382
- Tipo: fuente o descarga
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: departamentos.html.

Original:

```text
Fuentes: SNIC (Ministerio de Seguridad), RENAPER, INDEC (Censo 2022) y Georef (IGN)
```

Propuesto: igual al original.
