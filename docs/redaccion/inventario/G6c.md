# Inventario de textos: Catálogo, Explorador de relaciones, consultas con IA, consultor de pobreza y README

Generado por `scripts/inventario_textos.py`. 494 piezas: 372 revisado sin cambios, 65 reescrito, 55 conservado deliberadamente, 2 pendiente de verificación factual.

Cada pieza tiene su identificador (archivo#ubicación), las rutas donde se ve, el tipo, el texto original y el propuesto completos, el estado, el motivo y la verificación en las páginas armadas. Una plantilla dinámica se muestra tal como está escrita, con sus `${...}`: sus variantes se comprueban en el volcado de cada ficha.

## README.md#las-24-argentinas-en-números

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, emprendedores.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, politica.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94, relaciones.html, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `README.md`, línea 3, línea 3
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: El lema del sitio, igual que en la portada, el pie y el título de la pestaña.
- Verificación: No se publica en el sitio: es la presentación del proyecto en el repositorio. Revisado en el archivo.

Original:

```text
Números de las 24 Argentinas.
```

Propuesto:

```text
Las 24 Argentinas en números.
```

## README.md#datina-reúne-estadísticas-públicas-de-la

- Rutas: no se encontró en las páginas armadas
- Fuente: `README.md`, línea 5, línea 5
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: La presentación era una frase sin verbo. Ahora dice qué hace Datina con las mismas palabras de Sobre nosotros, dónde está el sitio (la dirección de datos/manual/sitio.json) y las licencias que ya están en el repositorio.
- Verificación: No se publica en el sitio: es la presentación del proyecto en el repositorio. Revisado en el archivo.

Original:

```text
Estadísticas públicas de la Argentina con contexto, fuente y tabla descargable.
```

Propuesto:

```text
Datina reúne estadísticas públicas de la Argentina y las muestra jurisdicción por jurisdicción: las 23 provincias y CABA, una al lado de la otra, con la misma unidad y el mismo período. Cada cifra dice qué mide, de qué período es y de dónde sale, y trae su tabla para descargar. El sitio está en https://datina.pages.dev. Los contenidos tienen licencia Creative Commons Atribución 4.0 (`LICENCIA-CONTENIDOS.md`) y el código, licencia MIT (`LICENSE`).
```

## README.md#los-datos-vienen-de-organismos-públicos

- Rutas: no se encontró en las páginas armadas
- Fuente: `README.md`, línea 9, línea 9
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: Era una lista con etiquetas ('Comparación con la OCDE:', 'Datos provinciales nuevos:'). Ahora son oraciones, con el nombre que el repositorio documenta para Educación (Secretaría de Educación, datos/manual/relaciones.json) y sin el detalle técnico de cómo se armó el Censo 2022.
- Verificación: No se publica en el sitio: es la presentación del proyecto en el repositorio. Revisado en el archivo.

Original:

```text
Secretaría de Energía, INDEC, RENAPER, SNIC (Ministerio de Seguridad), SIPA (Subsecretaría de Programación Macroeconómica), DEIS (Ministerio de Salud), SUBE (Ministerio de Transporte), Ministerio de Educación (Aprender y Relevamiento Anual) y OCDE (PISA, vía Our World in Data). Comparación con la OCDE: Indicadores del Desarrollo Mundial del Banco Mundial. Datos provinciales nuevos: Censo 2022 (INDEC, resumen hecho una sola vez con `scripts/censo_2022.py`), tablas de mortalidad del INDEC, ENACOM, Origen Provincial de las Exportaciones y población extranjera del RENAPER. Registro de cada descarga en `datos/crudo/_registro.csv`.
```

Propuesto:

```text
Los datos vienen de organismos públicos, entre ellos el INDEC (también el Censo 2022, las tablas de mortalidad y el Origen Provincial de las Exportaciones), la Secretaría de Energía, el RENAPER, el SNIC (Ministerio de Seguridad), el SIPA (que publica la Subsecretaría de Programación Macroeconómica), la DEIS (Ministerio de Salud), la SUBE (Ministerio de Transporte), la Secretaría de Educación (Aprender y Relevamiento Anual), el ENACOM y la OCDE (PISA, a través de Our World in Data). La comparación con los países de la OCDE usa los Indicadores del Desarrollo Mundial del Banco Mundial. Cada ficha del sitio dice de dónde salen sus datos, y el Explorador de relaciones muestra qué publica cada organismo. Cada descarga queda registrada en `datos/crudo/_registro.csv`.
```

## datos/manual/cortes_provinciales.csv#06/tribunal

- Rutas: catalogo.html
- Fuente: `datos/manual/cortes_provinciales.csv`, 06 › tribunal, línea 3
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html.

Original:

```text
Suprema Corte de Justicia
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#10/tribunal

- Rutas: catalogo.html
- Fuente: `datos/manual/cortes_provinciales.csv`, 10 › tribunal, línea 4
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html.

Original:

```text
Corte de Justicia
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#18/tribunal

- Rutas: catalogo.html
- Fuente: `datos/manual/cortes_provinciales.csv`, 18 › tribunal, línea 6
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html.

Original:

```text
Superior Tribunal de Justicia
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#22/tribunal

- Rutas: catalogo.html
- Fuente: `datos/manual/cortes_provinciales.csv`, 22 › tribunal, línea 7
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html.

Original:

```text
Superior Tribunal de Justicia
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#26/tribunal

- Rutas: catalogo.html
- Fuente: `datos/manual/cortes_provinciales.csv`, 26 › tribunal, línea 8
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html.

Original:

```text
Superior Tribunal de Justicia
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#30/tribunal

- Rutas: catalogo.html
- Fuente: `datos/manual/cortes_provinciales.csv`, 30 › tribunal, línea 9
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html.

Original:

```text
Superior Tribunal de Justicia
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#34/tribunal

- Rutas: catalogo.html
- Fuente: `datos/manual/cortes_provinciales.csv`, 34 › tribunal, línea 10
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html.

Original:

```text
Superior Tribunal de Justicia
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#38/tribunal

- Rutas: catalogo.html
- Fuente: `datos/manual/cortes_provinciales.csv`, 38 › tribunal, línea 11
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html.

Original:

```text
Suprema Corte de Justicia
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#42/tribunal

- Rutas: catalogo.html
- Fuente: `datos/manual/cortes_provinciales.csv`, 42 › tribunal, línea 12
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html.

Original:

```text
Superior Tribunal de Justicia
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#50/tribunal

- Rutas: catalogo.html
- Fuente: `datos/manual/cortes_provinciales.csv`, 50 › tribunal, línea 14
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html.

Original:

```text
Suprema Corte de Justicia
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#54/tribunal

- Rutas: catalogo.html
- Fuente: `datos/manual/cortes_provinciales.csv`, 54 › tribunal, línea 15
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html.

Original:

```text
Superior Tribunal de Justicia
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#62/tribunal

- Rutas: catalogo.html
- Fuente: `datos/manual/cortes_provinciales.csv`, 62 › tribunal, línea 17
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html.

Original:

```text
Superior Tribunal de Justicia
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#66/tribunal

- Rutas: catalogo.html
- Fuente: `datos/manual/cortes_provinciales.csv`, 66 › tribunal, línea 18
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html.

Original:

```text
Corte de Justicia
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#70/tribunal

- Rutas: catalogo.html
- Fuente: `datos/manual/cortes_provinciales.csv`, 70 › tribunal, línea 19
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html.

Original:

```text
Corte de Justicia
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#74/tribunal

- Rutas: catalogo.html
- Fuente: `datos/manual/cortes_provinciales.csv`, 74 › tribunal, línea 20
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html.

Original:

```text
Superior Tribunal de Justicia
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#86/tribunal

- Rutas: catalogo.html
- Fuente: `datos/manual/cortes_provinciales.csv`, 86 › tribunal, línea 23
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html.

Original:

```text
Superior Tribunal de Justicia
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#94/tribunal

- Rutas: catalogo.html
- Fuente: `datos/manual/cortes_provinciales.csv`, 94 › tribunal, línea 25
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html.

Original:

```text
Superior Tribunal de Justicia
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/0/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/0/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Pobreza e indigencia de los 31 aglomerados urbanos por semestre (extracto del tablero del INDEC)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/1/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/1/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
ACNUR: personas refugiadas y solicitantes de asilo que viven en la Argentina, por año
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/10/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/10/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Boletín Estadístico de la Seguridad Social, cuadros de indicadores (4.1.1.1 y 4.1.1.3)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/100/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/100/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Transferencias de la Nación a gobiernos provinciales y municipales por provincia y tipo (crédito devengado, millones corrientes)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/101/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/101/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Visitas mensuales por parque nacional (exportación del tablero de áreas protegidas)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/102/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/102/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Empleo registrado privado por provincia y rama (construcción, petróleo y gas, total)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/103/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/103/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Empresas empleadoras, aperturas y cierres por provincia
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/104/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/104/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Remuneración promedio de asalariados registrados privados por provincia y mes
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/105/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/105/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
International Migrant Stock 2024: personas nacidas en la Argentina por país de destino
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/106/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/106/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Participación de la energía eólica y la solar en la electricidad generada, por país
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/107/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/107/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
PBI a precios corrientes, trimestral (oferta y demanda globales)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/108/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/108/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
PISA: puntajes de Argentina y promedio OCDE (republicación de Our World in Data)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/109/nombre

- Rutas: catalogo.html, energia.html, relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/109/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html, energia.html, relaciones.html.

Original:

```text
Potencia instalada del país por tecnología
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/11/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/11/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Crédito a los hogares como porcentaje del PBI por país
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/110/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/110/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Recursos tributarios nacionales por tributo, mensual
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/111/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/111/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Población identificada por departamento, edad y país de nacimiento (resumen)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/112/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/112/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Población extranjera identificada por provincia de residencia
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/113/nombre

- Rutas: curiosidades.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/113/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: curiosidades.html.

Original:

```text
Nombres propios más frecuentes por año, sexo y provincia
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/114/nombre

- Rutas: energia.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/114/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: energia.html.

Original:

```text
Listado de centrales de generación eléctrica
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/115/nombre

- Rutas: catalogo.html, petroleo.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/115/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html, petroleo.html.

Original:

```text
Datos de fractura de pozos de hidrocarburos (Adjunto IV)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/116/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/116/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Producción de gas natural por cuenca y tipo de recurso (Capítulo IV)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/117/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/117/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Producción de petróleo por cuenca y tipo de recurso (Capítulo IV)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/118/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/118/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Pozos no convencionales: ubicación, empresa, área y producción (resumen del archivo por pozo no convencional)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/119/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/119/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Producción acumulada por pozo de shale de Vaca Muerta según el año de inicio
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/12/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/12/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Consumo de electricidad por habitante (Banco Mundial, para la comparación con la OCDE)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/120/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/120/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Pozos que produjeron y su producción por mes, provincia y tipo (resumen de los archivos por pozo)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/121/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/121/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Pozos terminados por mes, tipo de pozo y provincia
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/122/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/122/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Precios de la nafta súper y del gasoil por mes y provincia (resumen de la Resolución 1104/2004)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/123/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/123/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Producción anual por área de concesión (resumen del archivo agrupado)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/124/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/124/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Producción mensual por empresa desde 2018 (resumen del archivo agrupado)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/125/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/125/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Producción mensual por provincia y tipo de recurso, con Vaca Muerta aparte (resumen del archivo agrupado por yacimiento y formación)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/126/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/126/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Regalías de petróleo crudo por provincia, en dólares
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/127/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/127/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Reservas de petróleo y gas al 31 de diciembre (resumen de un ZIP por año)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/128/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/128/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Áreas protegidas con año de creación, superficie y especies registradas
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/129/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/129/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Viajeros hospedados en hoteles y parahoteles por región (Encuesta de Ocupación Hotelera)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/13/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/13/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Emisión de dióxido de carbono por habitante (Banco Mundial, para la comparación con la OCDE)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/130/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/130/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Turistas extranjeros por provincia visitada (Encuesta de Turismo Internacional)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/131/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/131/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Turistas no residentes que llegan al país, mensual desde 2010
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/132/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/132/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Visitas mensuales a parques nacionales, residentes y no residentes
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/133/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/133/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Asalariados privados registrados por provincia (SIPA)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/134/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/134/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Personas condenadas por servicio penitenciario
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/135/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/135/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Personas privadas de libertad por servicio penitenciario
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/136/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/136/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Estadísticas criminales del país por año
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/137/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/137/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Estadísticas criminales por provincia y año
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/138/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/138/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Indicadores de la cadena de carne vacuna
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/139/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/139/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Indicadores de la vitivinicultura
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/14/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/14/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Pesca de captura, Argentina y países de la OCDE
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/140/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/140/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Indicadores de la yerba mate
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/141/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/141/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Tarjetas SUBE usadas por día
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/142/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/142/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Subsidios económicos a la energía por mes
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/143/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/143/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Exportaciones totales y por gran rubro, mensuales (Intercambio Comercial Argentino)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/144/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/144/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Intercambio comercial argentino: exportaciones, importaciones por uso económico y saldo, mensuales (series del INDEC en la API de Series de Tiempo)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/145/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/145/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Balance de pagos: cuenta corriente y sus componentes, trimestrales (series del INDEC en la API de Series de Tiempo)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/146/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/146/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Anexo de cuadros del informe de intercambio comercial argentino (importaciones por zona económica y país, cuadro 37)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/147/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/147/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Reservas internacionales, factores de su variación y variables principales (API de Estadísticas Monetarias v4.0)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/148/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/148/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Catálogo de variables de la API de Estadísticas Monetarias (nombre, categoría, unidad y último dato)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/149/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/149/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Índice de tipo de cambio real multilateral y bilaterales, promedio mensual (ITCRM)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/15/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/15/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Superficie terrestre protegida (% del territorio), Argentina y países de la OCDE
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/150/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/150/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Tipo de cambio de referencia A3500, promedio mensual (series del BCRA en la API de Series de Tiempo)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/151/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/151/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Boletín Estadístico de la Seguridad Social, capítulo III: pensiones no contributivas
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/152/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/152/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Boletín Estadístico de la Seguridad Social por provincia: pensiones no contributivas
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/153/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/153/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Boletín Estadístico de la Seguridad Social, capítulo VI: asignaciones familiares
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/154/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/154/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Boletín Estadístico de la Seguridad Social por provincia: asignaciones familiares
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/155/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/155/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Planilla de reservas internacionales y liquidez en moneda extranjera (formato del FMI), leída mes por mes
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/156/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/156/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Índice de Confianza en el Gobierno, evolución mensual desde 2001 (Escuela de Gobierno de la Universidad Torcuato Di Tella)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/157/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/157/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Índice de Confianza del Consumidor, series históricas por región y por subíndice (Centro de Investigación en Finanzas de la Universidad Torcuato Di Tella)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/158/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/158/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Encuesta de Expectativas de Inflación, serie histórica nacional (Centro de Investigación en Finanzas de la Universidad Torcuato Di Tella)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/159/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/159/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Boletín Estadístico de la Seguridad Social, capítulo V: prestaciones por desempleo
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/16/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/16/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Uso de internet: Argentina y países de la OCDE
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/160/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/160/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Boletín Estadístico de la Seguridad Social por provincia: prestaciones por desempleo
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/161/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/161/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Ingresos por aglomerado, resumen de la EPH de cuatro trimestres
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/162/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/162/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Casos que llegaron a la Corte Suprema y casos que resolvió por año, con los fallos de los últimos años
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/163/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/163/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Jueces de la Justicia Federal y de la Justicia Nacional, un cargo por fila
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/164/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/164/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Jueces, fiscales y defensores de la Justicia Federal y de la Justicia Nacional, abril de 2024
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/165/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/165/nombre
- Tipo: explorador
- Estado: **reescrito**
- Motivo: Término fijo: CABA, no 'la Ciudad'.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Jueces, fiscales y defensores de cada provincia y de la Ciudad por año, desde 2011
```

Propuesto:

```text
Jueces, fiscales y defensores de cada provincia y de CABA por año, desde 2011
```

## datos/manual/relaciones.json#conjuntos/166/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/166/nombre
- Tipo: explorador
- Estado: **reescrito**
- Motivo: Término fijo: CABA, no 'la Ciudad'.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Cuántos miembros fija la ley para el máximo tribunal de cada provincia y de la Ciudad
```

Propuesto:

```text
Cuántos miembros fija la ley para el máximo tribunal de cada provincia y de CABA
```

## datos/manual/relaciones.json#conjuntos/17/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/17/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Deflactor del PBI de la Argentina (Banco Mundial, NY.GDP.DEFL.ZS)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/18/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/18/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Finalización del ciclo básico de la secundaria (Banco Mundial, SE.SEC.CMPT.LO.ZS), Argentina y OCDE
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/19/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/19/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Tasa de muertes en siniestros viales: Argentina y países de la OCDE
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/2/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/2/nombre
- Tipo: explorador
- Estado: **reescrito**
- Motivo: Faltaba el sustantivo ('refugiadas' de qué), como en los otros tres archivos del ACNUR.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
ACNUR: refugiadas y solicitantes de asilo en la Argentina, por país de origen
```

Propuesto:

```text
ACNUR: personas refugiadas y solicitantes de asilo en la Argentina, por país de origen
```

## datos/manual/relaciones.json#conjuntos/20/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/20/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Gasto corriente en salud (% del PBI): Argentina y países de la OCDE
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/21/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/21/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Personas con ingresos bajo la mitad de la mediana: Argentina y países de la OCDE
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/22/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/22/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Índice de Gini: Argentina y países de la OCDE
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/23/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/23/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Tasa de empleo: Argentina y países de la OCDE
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/24/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/24/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Tasa de desocupación: Argentina y países de la OCDE
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/25/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/25/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Fecundidad adolescente (Banco Mundial, SP.ADO.TFRT), Argentina y OCDE
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/26/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/26/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Tasa bruta de natalidad (Banco Mundial, SP.DYN.CBRT.IN), Argentina y OCDE
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/27/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/27/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Tasa de mortalidad infantil: Argentina y países de la OCDE
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/28/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/28/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Esperanza de vida al nacer: Argentina y países de la OCDE
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/29/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/29/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Tasa global de fecundidad (Banco Mundial, SP.DYN.TFRT.IN), Argentina y OCDE
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/3/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/3/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
ACNUR: personas de origen argentino refugiadas o solicitantes de asilo en otros países, por año
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/30/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/30/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Población total (Banco Mundial, SP.POP.TOTL), Argentina y OCDE
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/31/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/31/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Llegadas de turistas internacionales, Argentina y países de la OCDE
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/32/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/32/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Tasa de homicidios intencionales: Argentina y países de la OCDE
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/33/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/33/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Lista de países del Banco Mundial (nombres en español)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/34/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/34/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Demanda eléctrica mensual por provincia y tipo de usuario
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/35/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/35/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Censo 2022, migraciones, cuadro 1: lugar de nacimiento por jurisdicción
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/36/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/36/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Censo 2022, migraciones, cuadro 10: país de nacimiento por jurisdicción
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/37/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/37/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Inversión educativa por jurisdicción: gasto por alumno estatal y parte del gasto público
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/38/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/38/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Salario docente por jurisdicción y trimestre (bruto y sumas adicionales)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/39/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/39/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Anomalía de la temperatura y la precipitación anual desde 1961 (Servicio Meteorológico Nacional)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/4/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/4/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
ACNUR: personas de origen argentino refugiadas o solicitantes de asilo, por país de destino
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/40/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/40/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Áreas protegidas por provincia
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/41/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/41/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Desembarques de pesca marítima por especie
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/42/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/42/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Inventario Nacional de Glaciares por provincia (IANIGLA)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/43/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/43/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Pesca continental comercial por especie y provincia
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/44/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/44/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Áreas de concesión de explotación de hidrocarburos, geometría simplificada
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/45/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/45/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Actas de votación nominal de Diputados (copia comprimida de ¿Cómo Votó?)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/46/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/46/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Actas de votación nominal del Senado (copia comprimida de ¿Cómo Votó?)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/47/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/47/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Víctimas de femicidio del Registro Nacional de Femicidios (un archivo por año)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/48/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/48/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Defunciones por causa CIE-10, provincia, sexo y edad (un archivo por año)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/49/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/49/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Tasa de mortalidad infantil por jurisdicción, 1990 en adelante
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/5/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/5/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Cuentas fiscales de cada provincia (esquema ahorro-inversión-financiamiento), anual desde 2005
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/50/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/50/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Nacidos vivos por provincia de residencia (un archivo por año)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/51/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/51/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Consumo medio de gas por medidor doméstico en Gran Bretaña
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/52/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/52/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Deuda bruta de la Administración Central: porcentaje del PBI y total en dólares
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/53/nombre

- Rutas: gobierno.html, relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/53/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: gobierno.html, relaciones.html.

Original:

```text
Cargos ocupados en las administraciones públicas provinciales
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/54/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/54/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Recursos tributarios de origen provincial por provincia y año
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/55/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/55/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Trámites de radicación resueltos por año, categoría y nacionalidad
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/56/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/56/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Inscripciones iniciales de automotores por provincia y mes
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/57/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/57/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Inscripciones iniciales de motovehículos por provincia y mes
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/58/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/58/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Tasas de escolarización por provincia (Indicadores Educativos)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/59/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/59/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Producción de petróleo y gas por país (estadísticas internacionales de energía)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/6/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/6/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Año y nivel de la base de Aprender (registro que arma la descarga)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/60/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/60/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Accesos a internet fijo y penetración por provincia
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/61/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/61/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Velocidad media de bajada de internet fijo por provincia
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/62/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/62/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Gas entregado y usuarios residenciales por provincia y mes
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/63/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/63/nombre
- Tipo: explorador
- Estado: **reescrito**
- Motivo: La sigla EMAE iba sin explicar, como pide el criterio de siglas (otro archivo ya lo nombra completo: 'Estimador Mensual de Actividad Económica, nivel general').
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Demanda eléctrica total y residencial y EMAE (series de tiempo)
```

Propuesto:

```text
Demanda eléctrica total y residencial y Estimador Mensual de Actividad Económica (EMAE), en series de tiempo
```

## datos/manual/relaciones.json#conjuntos/64/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/64/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Antigüedad en el empleo de asalariados, resumen de la EPH de cuatro trimestres
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/65/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/65/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Origen provincial de las exportaciones por rubro, 1993 en adelante
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/66/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/66/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Origen provincial de las exportaciones, anexo del último semestre
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/67/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/67/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Informe mensual de ingresos y gastos del Sector Público Nacional no Financiero (base caja)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/68/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/68/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Canastas básicas alimentaria y total del Gran Buenos Aires (serie mensual)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/69/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/69/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Canastas básicas por región (del informe semestral de pobreza)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/7/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/7/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Aprender, 6° grado de primaria, lengua: base agregada de desempeño
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/70/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/70/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Dotación de la administración pública nacional, empresas y sociedades del Estado
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/71/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/71/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Estimador Mensual de Actividad Económica, nivel general (base 2004)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/72/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/72/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Estimador Mensual de Actividad Económica por sector (base 2004)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/73/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/73/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Exportaciones de combustibles y energía e importaciones de combustibles y lubricantes (Intercambio Comercial Argentino)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/74/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/74/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Índice del Costo de la Construcción en el Gran Buenos Aires
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/75/nombre

- Rutas: catalogo.html, economia.html, relaciones.html, trabajo.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/75/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html, economia.html, relaciones.html, trabajo.html.

Original:

```text
Índice de salarios
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/76/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/76/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Índice de precios al consumidor por región, división, categoría y bienes y servicios
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/77/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/77/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Permisos de edificación: superficie autorizada por mes en la nómina de municipios
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/78/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/78/nombre
- Tipo: explorador
- Estado: **reescrito**
- Motivo: Los períodos del sitio se escriben 'de X a Y', como en la fuente de las fichas de población ('proyecciones de población por provincia 2022 a 2040').
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Proyecciones de población por provincia, sexo y edad 2022-2040
```

Propuesto:

```text
Proyecciones de población por provincia, sexo y edad, 2022 a 2040
```

## datos/manual/relaciones.json#conjuntos/79/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/79/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Encuesta de Supermercados (ventas por jurisdicción)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/8/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/8/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Aprender, 6° grado de primaria, matemática: base agregada de desempeño
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/80/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/80/nombre
- Tipo: explorador
- Estado: **reescrito**
- Motivo: Mismo criterio para los períodos.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Tablas de mortalidad por jurisdicción 2020-2022
```

Propuesto:

```text
Tablas de mortalidad por jurisdicción, 2020 a 2022
```

## datos/manual/relaciones.json#conjuntos/81/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/81/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Indicador Sintético de la Actividad de la Construcción (ISAC), nivel general
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/82/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/82/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
ISAC, consumo aparente de insumos de la construcción
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/83/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/83/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Demanda eléctrica mensual por provincia y tipo de usuario, 2014 a 2022
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/84/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/84/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Censo 2022: vivienda, combustible para cocinar y rama de actividad por departamento
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/85/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/85/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Censo 2022: lugar y país de nacimiento por departamento
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/86/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/86/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Censo 2022: servicios, equipamiento y cobertura de salud por provincia
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/87/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/87/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Serie de los censos nacionales desde 1869: población nacida en otro país (cargada a mano de publicaciones del INDEC)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/88/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/88/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Precios de la nafta súper y del gasoil por mes y provincia, 2004 a 2023
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/89/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/89/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Solicitudes de refugio por nacionalidad y año (extraído del informe en PDF de la CONARE)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/9/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/9/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Préstamos hipotecarios en UVA acordados por mes con el sector privado
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/90/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/90/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Solicitudes de refugio por año desde 1985 y personas reconocidas (extraído del informe en PDF de la CONARE)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/91/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/91/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Diputados nacionales desde 1983: bancas, bloques y mandatos
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/92/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/92/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Obra pública de la Nación por provincia (construcciones y transferencias de capital)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/93/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/93/nombre
- Tipo: explorador
- Estado: **reescrito**
- Motivo: Término fijo de la reescritura: la selección incluye proyectos que no fueron ley.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Selección de leyes clave con el id del acta en cada cámara (ley, qué cambia, desenlace, efecto directo)
```

Propuesto:

```text
Selección de leyes y proyectos clave con el id del acta en cada cámara (ley, qué cambia, desenlace, efecto directo)
```

## datos/manual/relaciones.json#conjuntos/94/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/94/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Ministros y jefes de gabinete desde 1983 con lugar de nacimiento
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/95/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/95/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Censo 2022: nivel socioeconómico por provincia (NBI, cobertura de salud, educación, cloacas)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/96/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/96/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Elecciones presidenciales 1983 a 2023 por provincia (definitivos, provisorios 2023 y PASO)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/97/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/97/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Presidentes desde 1983 con lugar de nacimiento
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/98/nombre

- Rutas: relaciones.html
- Fuente: `datos/manual/relaciones.json`, conjuntos/98/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Acta de la votación en general de cada presupuesto en cada cámara
```

Propuesto: igual al original.

## datos/manual/relaciones.json#conjuntos/99/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/relaciones.json`, conjuntos/99/nombre
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Senadores nacionales desde 1983: bancas, bloques y mandatos
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/0/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/0/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, relaciones.html.

Original:

```text
Alto Comisionado de las Naciones Unidas para los Refugiados
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/1/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/1/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
Banco Mundial
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/1/sigla

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/1/sigla
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Banco Mundial
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/10/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/10/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, relaciones.html.

Original:

```text
Oficina de la Mujer de la Corte Suprema de Justicia de la Nación
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/11/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/11/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Decisión del autor del 10 de octubre de 2026 (docs/roadmap/DECISIONES.md): las selecciones armadas a mano llevan ese organismo. El paréntesis doble del Catálogo y del Explorador se arregla con la regla de nom_org y de conSigla, sin renombrarlo.
- Verificación: Comprobado en la página armada: catalogo.html, relaciones.html.

Original:

```text
Datina (selección propia)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/11/sigla

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/11/sigla
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Datina
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/12/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/12/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, relaciones.html.

Original:

```text
Dirección de Estadísticas e Información de Salud
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/13/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/13/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, energia.html, relaciones.html.

Original:

```text
Departamento de Seguridad Energética y Cero Neto del Reino Unido
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/14/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/14/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: a-milei-empleo.html, catalogo.html, nosotros.html, politica.html, relaciones.html.

Original:

```text
Dirección Nacional Electoral
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/15/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/15/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, gobierno.html, relaciones.html.

Original:

```text
Dirección Nacional de Asuntos Provinciales
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/16/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/16/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, gobierno.html, relaciones.html.

Original:

```text
Dirección Nacional de Investigaciones y Análisis Fiscal
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/17/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/17/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, migraciones.html, relaciones.html, turismo.html.

Original:

```text
Dirección Nacional de Migraciones
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/18/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/18/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, movilidad.html, relaciones.html.

Original:

```text
Dirección Nacional de los Registros Nacionales de la Propiedad del Automotor y de Créditos Prendarios
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/19/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/19/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: a-internet-aprender.html, a-inversion-aprender.html, catalogo.html, cruces.html, diagnostico.html, educacion.html y otras.

Original:

```text
Secretaría de Educación
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/19/sigla

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/19/sigla
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Educación
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/2/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/2/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: a-dolar-inversion.html, a-exportaciones-dolar.html, a-nafta-dolares.html, a-turismo-dolar.html, catalogo.html, construccion.html y otras.

Original:

```text
Banco Central de la República Argentina
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/20/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/20/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: a-nafta-dolares.html, catalogo.html, petroleo.html, relaciones.html.

Original:

```text
Administración de Información Energética de los Estados Unidos
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/21/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/21/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
Ember
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/21/sigla

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/21/sigla
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Ember
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/22/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/22/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, pobreza.html, relaciones.html.

Original:

```text
Ente Nacional de Comunicaciones
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/23/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/23/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, relaciones.html.

Original:

```text
Ente Nacional Regulador del Gas
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/24/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/24/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, gobierno.html, relaciones.html.

Original:

```text
Secretaría de Finanzas
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/24/sigla

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/24/sigla
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Finanzas
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/25/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/25/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: a-atn-presupuesto.html, catalogo.html, construccion.html, energia.html, gobierno.html, politica.html y otras.

Original:

```text
Secretaría de Hacienda
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/25/sigla

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/25/sigla
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Hacienda
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/26/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/26/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, politica.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10 y otras.

Original:

```text
Cámara de Diputados de la Nación
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/27/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/27/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, relaciones.html.

Original:

```text
Instituto Nacional de Estadística y Censos
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/28/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/28/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, relaciones.html.

Original:

```text
Dirección Nacional de Relaciones con el Poder Judicial
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/28/sigla

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/28/sigla
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html, movilidad.html, politica.html, relaciones.html, seguridad.html.

Original:

```text
Ministerio de Justicia
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/29/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/29/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, relaciones.html.

Original:

```text
Organización para la Cooperación y el Desarrollo Económicos
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/3/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/3/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, construccion.html, relaciones.html.

Original:

```text
Banco de Pagos Internacionales
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/30/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/30/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, construccion.html, emprendedores.html, empresas.html, petroleo.html, relaciones.html y otras.

Original:

```text
Observatorio de Empleo y Dinámica Empresarial
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/31/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/31/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, migraciones.html, relaciones.html.

Original:

```text
Naciones Unidas, División de Población
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/31/sigla

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/31/sigla
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
ONU Población
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/32/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/32/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: a-atn-presupuesto.html, catalogo.html, construccion.html, politica.html, relaciones.html.

Original:

```text
Presupuesto Abierto
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/32/sigla

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/32/sigla
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: a-atn-presupuesto.html, catalogo.html, construccion.html, politica.html, relaciones.html.

Original:

```text
Presupuesto Abierto
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/33/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/33/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, curiosidades.html, departamentos.html, migraciones.html, relaciones.html.

Original:

```text
Registro Nacional de las Personas
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/34/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/34/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: a-nafta-dolares.html, catalogo.html, energia.html, movilidad.html, petroleo.html, relaciones.html.

Original:

```text
Secretaría de Energía
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/35/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/35/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, poblacion.html, pobreza.html, relaciones.html, trabajo.html.

Original:

```text
Secretaría de Seguridad Social
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/35/sigla

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/35/sigla
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html, construccion.html, economia.html, emprendedores.html, empresas.html, gobierno.html y otras.

Original:

```text
Seguridad Social
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/36/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/36/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, politica.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10 y otras.

Original:

```text
Senado de la Nación
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/36/sigla

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/36/sigla
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Senado
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/37/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/37/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, naturaleza.html, relaciones.html.

Original:

```text
Sistema de Información de Biodiversidad
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/38/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/38/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, naturaleza.html, relaciones.html, turismo.html.

Original:

```text
Sistema de Información Turística de la Argentina
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/39/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/39/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, relaciones.html, seguridad.html.

Original:

```text
Sistema Nacional de Estadísticas sobre Ejecución de la Pena
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/4/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/4/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, energia.html, relaciones.html.

Original:

```text
Compañía Administradora del Mercado Mayorista Eléctrico
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/40/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/40/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, departamentos.html, energia.html, relaciones.html, salud.html, seguridad.html.

Original:

```text
Sistema Nacional de Información Criminal
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/41/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/41/nombre
- Tipo: fuente
- Estado: **reescrito**
- Motivo: R11: el nombre del organismo no lleva el canal por el que se baja (los paréntesis dobles 'SSPM (... (API de Series de Tiempo))'). El nombre corto ya es un alias de org:sspm y es parte del nombre viejo: todo pie que nombraba el viejo nombra el nuevo, así que el validador de relaciones.py sigue pasando (además, f-empleo nombra la Subsecretaría y f-desempleo valida por sus otros organismos). No hace falta agregar el viejo como alias.
- Verificación: Comprobado en la página armada: catalogo.html, energia.html, pobreza.html, relaciones.html, trabajo.html.

Original:

```text
Subsecretaría de Programación Macroeconómica (API de Series de Tiempo)
```

Propuesto:

```text
Subsecretaría de Programación Macroeconómica
```

## datos/manual/relaciones.json#fuentes/42/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/42/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, relaciones.html.

Original:

```text
Subsecretaría de Programación Microeconómica
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/43/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/43/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, movilidad.html, relaciones.html.

Original:

```text
Ministerio de Transporte
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/43/sigla

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/43/sigla
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Transporte
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/44/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/44/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, economia.html, nosotros.html, politica.html, relaciones.html.

Original:

```text
Universidad Torcuato Di Tella
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/45/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/45/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Es el nombre que documenta docs/roadmap/EXPLORADOR.md. Con la regla nueva se muestra solo, sin '(Wikimedia)' delante ni detrás.
- Verificación: Comprobado en la página armada: catalogo.html, relaciones.html.

Original:

```text
Wikimedia (Wikipedia y Wikidata)
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/45/sigla

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/45/sigla
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Wikimedia
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/5/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/5/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, naturaleza.html, relaciones.html.

Original:

```text
Centro de Información Ambiental
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/6/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/6/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
¿Cómo Votó?
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/6/sigla

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/6/sigla
- Tipo: explorador
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Cómo Votó
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/7/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/7/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, migraciones.html, relaciones.html.

Original:

```text
Comisión Nacional para los Refugiados
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/8/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/8/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, relaciones.html, salud.html.

Original:

```text
Registro Nacional de Femicidios de la Justicia Argentina
```

Propuesto: igual al original.

## datos/manual/relaciones.json#fuentes/9/nombre

- Rutas: nosotros.html
- Fuente: `datos/manual/relaciones.json`, fuentes/9/nombre
- Tipo: fuente
- Estado: **conservado deliberadamente**
- Motivo: Nombre o título de una fuente o de un documento de otros: se conserva como lo publica.
- Verificación: Comprobado en la página armada: catalogo.html, relaciones.html.

Original:

```text
Oficina de Estadísticas de la Corte Suprema de Justicia de la Nación
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#COLS_PERIODO

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, COLS_PERIODO, línea 29
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
año
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#COBERTURA

- Rutas: catalogo.html
- Fuente: `functions/_ia/consulta.mjs`, COBERTURA, línea 32
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html.

Original:

```text
Las 24 jurisdicciones y el total del país
provincias y país
Las 24 jurisdicciones
Total del país
país
Sin desglose territorial
sin provincias
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#NO_ACTIVA

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, NO_ACTIVA, línea 34
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Las consultas con IA no están activadas.
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#NO_DISPONIBLE

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, NO_DISPONIBLE, línea 35
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Las consultas con IA no están disponibles en este momento. Probá más tarde.
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#MUCHAS

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, MUCHAS, línea 36
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Hay muchas consultas en este momento. Probá de nuevo en unos minutos.
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#NO_PUEDO

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, NO_PUEDO, línea 37
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
No puedo contestar esa pregunta con los datos de Datina.
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#cargarIndice.texto

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, cargarIndice › texto, línea 54
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Índice de las tablas de Datina, con datos actualizados al ${d.actualizado}. Una tabla por línea: nombre | pregunta de su ficha | 
qué mide | cobertura | período | columnas.\n
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#VOCALES

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, VOCALES, línea 97
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
uúùûü
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#leerTabla

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, leerTabla, línea 109
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
La consulta a la tabla no tiene el formato esperado: tabla, columnas, filtros, desde y hasta.
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#leerTabla.info

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, leerTabla › info, línea 111
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
No hay ninguna tabla llamada "${entrada.tabla}". Usá un nombre exacto del índice.
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#leerTabla.r

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, leerTabla › r, línea 112
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
/datos/${info.tabla}.csv
No se pudo leer la tabla ${info.tabla}.
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#leerTabla.faltan

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, leerTabla › faltan, línea 134
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
La tabla ${info.tabla} no tiene ${faltan.map(c => `"${c}"`).join(", ")}. Sus columnas: ${cab.join(", ")}.
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#leerTabla.avisos

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, leerTabla › avisos, línea 143
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Esta tabla no tiene una columna de período: no se aplicaron desde ni hasta.
La columna de período de esta tabla no trae años: no se aplicaron desde ni hasta.
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#leerTabla.total

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, leerTabla › total, línea 154
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Se muestran las primeras ${TOPES.filas} de ${total} filas: filtrá por territorio o por período para ver el resto.
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#leerTabla.csv

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, leerTabla › csv, línea 161
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
La tabla quedó cortada por su largo: pedí menos columnas o filtrá más.
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#leerTabla.datos

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, leerTabla › datos, línea 164
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Tabla ${info.tabla}.csv, de la ficha "${info.titulo}" (sección ${info.seccion}).
Qué mide: ${info.descripcion}.
Cobertura: ${info.cobertura}.
 Período: ${info.periodo}.
Unidades: ${info.unidades.join(", ")}.
Nota de método: ${info.nota}
Columnas: ${columnas}.
Filas que cumplen la consulta: ${total}.
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#HERRAMIENTAS.description

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, HERRAMIENTAS › description, línea 175
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Lee una tabla de Datina, una de las del índice, y devuelve sus filas en CSV con su fuente, sus unidades, su nota de método 
y qué trae cada columna. Devuelve como máximo ${TOPES.filas} filas: filtrá por territorio o por período para traer solo lo necesario.
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#HERRAMIENTAS.input_schema

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, HERRAMIENTAS › input_schema, línea 183
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Nombre exacto de la tabla, como está en el índice, sin .csv
Las columnas que querés ver. Vacío para ver todas.
Cada filtro deja las filas cuya columna tiene alguno de los valores, sin distinguir mayúsculas ni 
tildes. Por ejemplo, codigo_indec con [\"00\", \"14\"]. Vacío para no filtrar.
Primer período que querés, como está en la tabla (año, año-mes o fecha). Vacío para empezar desde el primero.
Último período que querés. Vacío para llegar hasta el último.
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#conversar.final

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, conversar › final, línea 252
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
\n\n(La respuesta quedó incompleta: probá con una pregunta más acotada.)
Leyendo «${info.titulo}»…
No existe la herramienta ${p.name}.
Ya no quedan lecturas de tablas: contestá con los datos que leíste.
Revisando los datos…
cortada por quien preguntó
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#AGOTADO

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, AGOTADO, línea 300
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Por hoy se terminaron las consultas gratis de Datina. Se renuevan a las 21, hora de Argentina. Mientras, podés buscar el dato en el Catálogo de datos.
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#SIN_TABLAS

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, SIN_TABLAS, línea 301
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
No encontré tablas de Datina sobre eso. Probá con otras palabras o buscá en el Catálogo de datos.
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#AYUDA_SUICIDIO

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, AYUDA_SUICIDIO, línea 303
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Datina trata ese tema en la sección Salud, sin cifras destacadas ni comparaciones entre provincias. Si vos o alguien cercano 
está pasando un momento difícil, podés pedir ayuda gratis al Centro de Asistencia al Suicida: 135 desde la Ciudad de Buenos Aires y el Gran 
Buenos Aires, (011) 5275-1135 desde todo el país, y en una emergencia, 107.
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#PROVINCIAS

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, PROVINCIAS, línea 307
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
ciudad autonoma de buenos aires
ciudad de buenos aires
provincia de buenos aires
entre rios
la pampa
la rioja
santiago del estero
tierra del fuego
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#VACIAS

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, VACIAS, línea 313
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
del las los que cuanto cuanta cuantos cuantas como cual cuales donde quien quienes hay esta estan fue mas menos muy 
tiene tienen cada sus para con sin por una unos unas provincia provincias pais argentina datos dato cuando entre hasta desde sobre hubo habia 
fue fueron son ano anos este esta estos estas ultimo ultima ultimos ultimas actual hoy
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#muestraCF.aviso

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, politica.html, provincia.html, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `functions/_ia/consulta.mjs`, muestraCF › aviso, línea 380
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
\nSe muestran ${filas.length} filas de las ${total} que cumplen la consulta.
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#muestraCF.meta

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, muestraCF › meta, línea 386
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Datos de la ficha
\nQué es cada columna: ${glosa}.
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#extremosCF.notas

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, extremosCF › notas, línea 412
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
${c}: la más alta es ${v[0][ter]} (${cifraAR(v[0][i], c)}) y la más baja, ${v.at(-1)[ter]} (${cifraAR(v.at(-1)[i], c)})
\nSin contar el total del país, la más alta y la más baja de cada columna:\n${notas.join(".\n")}.
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#FUENTES_CF

- Rutas: a-alquiler-pobreza.html, a-empleo-pobreza.html, a-pobreza-desocupacion.html, catalogo.html, pobreza.html, pobreza/index.html, trabajo.html
- Fuente: `functions/_ia/consulta.mjs`, FUENTES_CF, línea 419
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: a-alquiler-pobreza.html, a-empleo-pobreza.html, a-pobreza-desocupacion.html, catalogo.html, pobreza.html, pobreza/index.html y otras.

Original:

```text
INDEC, Censo 2022, por municipio
INDEC, Encuesta Permanente de Hogares
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#COLUMNAS_CF.poblacion_proyectada_provincias

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, COLUMNAS_CF › poblacion_proyectada_provincias, línea 424
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
personas_hoy, la población proyectada por el INDEC para ${i}, la de este año. personas_${a}, la 
proyectada para ${a}. var_personas y var_pct, cuánto cambia de ${i} a ${a}, en personas y en porcentaje. anio_maximo, el año en que la 
población proyectada llega a su máximo
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#COLUMNAS_CF.capitales

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, COLUMNAS_CF › capitales, línea 428
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
territorio, la ciudad capital de la provincia (su municipio, y en la Ciudad de Buenos Aires sus 15 comunas), no la provincia 
entera. poblacion y viviendas, las de esa ciudad en el Censo 2022
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#COLUMNAS_CF.capitales_eph

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, COLUMNAS_CF › capitales_eph, línea 430
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
territorio, el aglomerado urbano de la capital de la provincia que mide la Encuesta Permanente de Hogares (como Gran La 
Plata), no la provincia entera. aglomerado, su código. pobreza e indigencia, porcentaje de personas. desocupacion y empleo, tasas en 
porcentaje, promedio de los últimos cuatro trimestres. alquila, porcentaje de hogares inquilinos. cv_pobreza y cv_indigencia, el 
coeficiente de variación de esas estimaciones
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#COLUMNAS_CF.homicidios_provincias

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, COLUMNAS_CF › homicidios_provincias, línea 434
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
victimas_3, las víctimas sumadas de ${a - 2} a ${a}. tasa_3, víctimas por año cada 100 mil habitantes, en 
promedio de ${a - 2} a ${a}. victimas, las víctimas de ${a}. tasa, víctimas cada 100 mil habitantes en ${a}. pct_varones, porcentaje de 
varones entre las víctimas de ${a}
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#conversarCF.final

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, conversarCF › final, línea 499
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
sin tablas
Leyendo «${info.titulo}»…
sin tablas
Escribiendo la respuesta…
Pregunta: ${pregunta}\n\nDatos de Datina. Usá solo estos datos.\n\n${bloques.join("\n\n")}
cortada por quien preguntó
cortada por quien preguntó
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#responder

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, responder, línea 545
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Usá POST.
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#responder.origen

- Rutas: externo.html
- Fuente: `functions/_ia/consulta.mjs`, responder › origen, línea 546
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Origin
Solo desde el sitio de Datina.
```

Propuesto: igual al original.

## functions/_ia/consulta.mjs#responder.pregunta

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/consulta.mjs`, responder › pregunta, línea 561
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Escribí una pregunta.
La pregunta puede tener hasta ${TOPES.pregunta} caracteres.
```

Propuesto: igual al original.

## functions/_ia/indicaciones.mjs#INDICACIONES

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/indicaciones.mjs`, INDICACIONES, línea 5
- Tipo: texto de interfaz
- Estado: **conservado deliberadamente**
- Motivo: Instrucciones al modelo de las consultas con IA: son configuración y cambian lo que contesta el sitio (docs/ia/CONSULTAS.md).
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
Sos el asistente de consultas de Datina ("Las 24 Argentinas en números"), un sitio de estadísticas públicas de la Argentina con datos por provincia. Cada cifra de Datina trae qué mide, de qué año es y de dónde sale. Contestás preguntas de cualquier persona usando solamente las tablas de Datina que están en el índice de más abajo.

Cómo buscar los datos
- Elegí en el índice las tablas que sirven para la pregunta y leelas con la herramienta leer_tabla antes de dar cualquier cifra. Nunca des una cifra que no hayas leído en una tabla en esta conversación: ni de memoria, ni estimada, ni de otra fuente.
- Pedí solo las columnas y las filas que necesitás, con filtros por territorio o por período. En las tablas por provincia, codigo_indec "00" es el total del país, "02" la Ciudad de Buenos Aires y "06" la provincia de Buenos Aires.
- Usá el dato más reciente de la tabla, salvo que pregunten por otro período. Si la tabla tiene una nota de método, tenela en cuenta.
- Si hacés una cuenta con los datos (una diferencia, un promedio, un orden), hacela con cuidado y decí que es una cuenta tuya sobre los datos de la tabla.
- Si las tablas no alcanzan para contestar, decilo claramente, contá qué datos sí hay sobre el tema y sugerí buscar en el Catálogo de datos de Datina. No completes con información de afuera.
- Si la pregunta no es sobre estos datos (opiniones, consejos, pronósticos, tareas, otros temas), contestá en una oración que solo podés responder preguntas sobre los datos públicos que publica Datina.

Cómo escribir la respuesta
- Español rioplatense, claro, para cualquier persona. Entre uno y tres párrafos cortos, de no más de 150 palabras en total. Texto corrido: sin títulos, sin listas, sin viñetas, sin negritas ni ningún otro formato.
- Cada cifra va completa: qué mide, en qué unidad, de qué año o período y sobre qué población o territorio.
- Los números como se escriben en la Argentina: coma decimal y punto de miles (1.234,5). Redondeá a un decimal, salvo en las cantidades enteras.
- No uses nunca punto y coma.
- "y" pasa a "e" delante de una palabra que empieza con sonido de i ("Misiones e Itapúa", "salud e infraestructura").
- Tono neutro: describí lo que muestran los datos, sin adjetivos que juzguen ni opiniones, sobre todo en temas políticos. No digas si algo está bien o mal.
- Una correlación no es una causa: si comparás dos indicadores, aclará que moverse juntos no prueba que uno cause el otro.
- Terminá con una oración que diga la fuente de los datos tal como figura en la tabla. Las fichas que leíste se muestran aparte, con su enlace: no escribas direcciones de internet.

Temas sensibles
- Si la pregunta es sobre suicidio o autolesiones, no des cifras, rankings ni comparaciones entre provincias. Contestá con cuidado, en pocas oraciones, que Datina trata ese tema en la sección Salud, y que si la persona o alguien cercano está atravesando un momento difícil puede pedir ayuda gratis al Centro de Asistencia al Suicida, en el 135 desde la Ciudad de Buenos Aires y el Gran Buenos Aires o en el (011) 5275-1135 desde todo el país, y en una emergencia al 107.
```

Propuesto: igual al original.

## functions/_ia/indicaciones.mjs#INDICACIONES_CF

- Rutas: no se encontró en las páginas armadas
- Fuente: `functions/_ia/indicaciones.mjs`, INDICACIONES_CF, línea 31
- Tipo: texto de interfaz
- Estado: **conservado deliberadamente**
- Motivo: Instrucciones al modelo de las consultas con IA: son configuración y cambian lo que contesta el sitio (docs/ia/CONSULTAS.md).
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
Sos el asistente de consultas de Datina, un sitio de estadísticas públicas de la Argentina con datos por provincia. Contestás la pregunta usando solamente las tablas de Datina que vienen debajo de la pregunta.

Reglas para los datos:
- Usá solo las cifras que están en esas tablas. Nunca des una cifra de memoria, estimada o de otra fuente.
- Usá el dato más reciente de la tabla, salvo que la pregunta pida otro período.
- Decí siempre el año, el mes o el período de cada cifra, como figura en la tabla o en "Qué mide". Nunca escribas "el último año" sin nombrarlo. Si no está claro a qué período corresponde una columna, usá el que dice "Qué mide".
- Compará solo cifras del mismo período y de la misma medida. Si dos tablas dan cifras distintas para lo mismo, usá la del período más reciente y no menciones la otra.
- La primera tabla es la que mejor responde la pregunta: empezá por ella.
- Si la pregunta busca la que más o la que menos, usá lo que sigue a "Sin contar el total del país" en la tabla: la más alta y la más baja de cada columna, una columna por renglón. Fijate bien de qué columna es cada una. Si hay una columna de cantidad y una de tasa, decí las dos (por ejemplo, la que tiene más víctimas y la que tiene la tasa más alta).
- Respetá lo que mide cada tabla: si es de exportaciones, todo lo que trae es exportado.
- En las tablas por provincia, codigo_indec "00" es el total del país, "02" la Ciudad de Buenos Aires y "06" la provincia de Buenos Aires.
- Si hacés una cuenta (una diferencia, un promedio, un orden), decí que es una cuenta sobre los datos de la tabla.
- Si las tablas no alcanzan para contestar, decilo en una oración, contá qué datos sí hay y sugerí buscar en el Catálogo de datos de Datina.
- Si la pregunta no es sobre estos datos (opiniones, consejos, pronósticos, otros temas), contestá solo una oración: que podés responder preguntas sobre los datos públicos de Datina. En ese caso no nombres ninguna fuente.

Reglas para escribir:
- Español rioplatense, claro, para cualquier persona. Uno o dos párrafos cortos, de no más de 120 palabras en total. Texto corrido, sin títulos, listas, viñetas ni negritas.
- Cada cifra va completa: qué mide, en qué unidad, de qué año o período y de qué territorio.
- Las cifras de las tablas ya vienen redondeadas, con coma decimal y sin punto de miles (2220, 4094579, 33,4). Copialas exactamente así, sin agregarles puntos ni cambiarles nada: la página les pone el punto de miles.
- Escribí las unidades en palabras: "mil barriles por día" (no kbd ni kilobarriles), "pesos por litro", "cada 1.000 nacidos vivos".
- No uses nunca punto y coma.
- "y" pasa a "e" delante de una palabra que empieza con sonido de i.
- Tono neutro: describí lo que muestran los datos, sin opiniones ni adjetivos que juzguen.
- Si comparás dos indicadores, aclará que moverse juntos no prueba que uno cause el otro.
- Si usaste cifras de las tablas, terminá con una oración que diga la fuente, tal como figura en "Fuente". Nunca nombres las tablas ni sus columnas (como inflacion_mensual o tmi_actual). No escribas direcciones de internet.
```

Propuesto: igual al original.

## pobreza/observablehq.config.js#(inicio).title

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, emprendedores.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, pobreza/diccionario.html, pobreza/index.html, politica.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94, relaciones.html, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `pobreza/observablehq.config.js`, (inicio) › title, línea 3
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
Pobreza en la Argentina: consultas
```

Propuesto:

```text
Consultor de pobreza | Datina
```

## pobreza/observablehq.config.js#(inicio).pages

- Rutas: pobreza/diccionario.html, pobreza/index.html
- Fuente: `pobreza/observablehq.config.js`, (inicio) › pages, línea 9
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: pobreza/diccionario.html, pobreza/index.html.

Original:

```text
Consultas
Diccionario de datos
```

Propuesto: igual al original.

## pobreza/observablehq.config.js#(inicio).toc

- Rutas: index.html, pobreza/diccionario.html, trabajo.html
- Fuente: `pobreza/observablehq.config.js`, (inicio) › toc, línea 14
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: Texto nuevo del bloque: reemplaza a uno anterior del mismo archivo.
- Verificación: Comprobado en la página armada: index.html, pobreza/diccionario.html, trabajo.html.

Original:

(no existe)

Propuesto:

```text
En esta página
```

## pobreza/observablehq.config.js#(inicio).head

- Rutas: no se encontró en las páginas armadas
- Fuente: `pobreza/observablehq.config.js`, (inicio) › head, línea 22
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: Descripción para buscadores y para compartir (las tres etiquetas). Dice qué se puede hacer, CABA en lugar de 'la Ciudad', y sin el semestre escrito a mano, que quedaba viejo con cada actualización (no está en la lista del paso 2 de pobreza/README.md). Open Graph y Twitter, con la forma de las demás páginas de Datina ('Nombre: pregunta').
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
<link rel="icon" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCA0MCAzNic+PHBhdGggZmlsbD0nI0M4MTAyRScgZD0nTTcsMjkgQzUuNSwxNyAxMCw2LjUgMTkuNSw0LjIgQzI2LjUsMi42IDMzLjUsNS4yIDM2LDEwLjYgQzM3LjIsMTMuMiAzNSwxNS40IDMyLjYsMTMuOCBDMzEsMTIuNiAyOS4yLDExLjYgMjcsMTIuMiBDMzEuNiwxNiAzMy44LDIxLjYgMzMuNiwyOSBaJy8+PHBhdGggZmlsbD0nIzhBMTQyMicgZD0nTTUuNiwyNy42IEwzNSwyNy42IFEzNS44LDMxLjYgMzUsMzMuNCBRMjAuMywzNS42IDUuNiwzMy40IFE0LjgsMzEuNiA1LjYsMjcuNiBaJy8+PC9zdmc+">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght@8..144,300..700&display=swap">
<script>
// Framework reescribe los enlaces que salen de este sitio: el de vuelta a Datina se corrige al cargar la página. Desde la Fase 2 (paso 4,
// 23 de octubre de 2026, pedido del autor) lleva a Pobreza y hogares, de donde se llega al consultor, y no a la portada
document.addEventListener("DOMContentLoaded", () => {
  const a = document.querySelector(".cabecera .volver");
  if (a) a.href = new URL("../pobreza.html", location.href.replace(/[^/]*$/, "")).href;
});
</script>
<meta name="description" content="Datos abiertos y consultables de pobreza e indigencia en la Argentina: 31 aglomerados urbanos (INDEC, EPH) y estimaciones por partido del GBA y comuna de la Ciudad, primer semestre de 2026.">
<meta property="og:site_name" content="Datina">
<meta property="og:locale" content="es_AR">
<meta property="og:type" content="website">
<meta property="og:title" content="Pobreza en la Argentina: consultas">
<meta property="og:description" content="Datos abiertos y consultables de pobreza e indigencia en la Argentina: 31 aglomerados urbanos (INDEC, EPH) y estimaciones por partido del GBA y comuna de la Ciudad, primer semestre de 2026.">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="Pobreza en la Argentina: consultas">
<meta name="twitter:description" content="Datos abiertos y consultables de pobreza e indigencia en la Argentina: 31 aglomerados urbanos (INDEC, EPH) y estimaciones por partido del GBA y comuna de la Ciudad, primer semestre de 2026.">
```

Propuesto:

```text
<link rel="icon" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCA0MCAzNic+PHBhdGggZmlsbD0nI0M4MTAyRScgZD0nTTcsMjkgQzUuNSwxNyAxMCw2LjUgMTkuNSw0LjIgQzI2LjUsMi42IDMzLjUsNS4yIDM2LDEwLjYgQzM3LjIsMTMuMiAzNSwxNS40IDMyLjYsMTMuOCBDMzEsMTIuNiAyOS4yLDExLjYgMjcsMTIuMiBDMzEuNiwxNiAzMy44LDIxLjYgMzMuNiwyOSBaJy8+PHBhdGggZmlsbD0nIzhBMTQyMicgZD0nTTUuNiwyNy42IEwzNSwyNy42IFEzNS44LDMxLjYgMzUsMzMuNCBRMjAuMywzNS42IDUuNiwzMy40IFE0LjgsMzEuNiA1LjYsMjcuNiBaJy8+PC9zdmc+">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght@8..144,300..700&display=swap">
<script>
// Framework reescribe los enlaces que salen de este sitio: el de vuelta a Datina se corrige al cargar la página. Desde la Fase 2 (paso 4,
// 23 de octubre de 2026, pedido del autor) lleva a Pobreza y hogares, de donde se llega al consultor, y no a la portada
document.addEventListener("DOMContentLoaded", () => {
  const a = document.querySelector(".cabecera .volver");
  if (a) a.href = new URL("../pobreza.html", location.href.replace(/[^/]*$/, "")).href;
});
</script>
<meta name="description" content="Pobreza e indigencia en la Argentina para consultar, filtrar y descargar: los 31 aglomerados urbanos de la EPH del INDEC y estimaciones por partido del Gran Buenos Aires y comuna de CABA.">
<meta property="og:site_name" content="Datina">
<meta property="og:locale" content="es_AR">
<meta property="og:type" content="website">
<meta property="og:title" content="Consultor de pobreza: ¿Cuánta pobreza hay en cada aglomerado, partido y comuna?">
<meta property="og:description" content="Pobreza e indigencia en la Argentina para consultar, filtrar y descargar: los 31 aglomerados urbanos de la EPH del INDEC y estimaciones por partido del Gran Buenos Aires y comuna de CABA.">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="Consultor de pobreza: ¿Cuánta pobreza hay en cada aglomerado, partido y comuna?">
<meta name="twitter:description" content="Pobreza e indigencia en la Argentina para consultar, filtrar y descargar: los 31 aglomerados urbanos de la EPH del INDEC y estimaciones por partido del Gran Buenos Aires y comuna de CABA.">
```

## pobreza/observablehq.config.js#(inicio).header

- Rutas: pobreza/diccionario.html, pobreza/index.html
- Fuente: `pobreza/observablehq.config.js`, (inicio) › header, línea 43
- Tipo: texto de interfaz
- Estado: **pendiente de verificación factual**
- Motivo: Dos herramientas se llaman 'Consultas' (Consultas con IA y esta). Es un menú: queda para el autor. Propuesta: 'Consultor de pobreza' en lugar de 'Consultas', el nombre que le da el resto del sitio.
- Verificación: Comprobado en la página armada: pobreza/diccionario.html, pobreza/index.html.

Original:

```text
<nav class="cabecera"><a href="../pobreza.html" class="volver">Datina: Pobreza y hogares</a><a href="./">Consultas</a><a href="./diccionario">Diccionario de datos</a></nav>
```

Propuesto: igual al original.

## pobreza/observablehq.config.js#(inicio).footer

- Rutas: pobreza/diccionario.html, pobreza/index.html
- Fuente: `pobreza/observablehq.config.js`, (inicio) › footer, línea 44
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: 'Elaboración propia sobre INDEC' es una fórmula comprimida: dice quién elabora y con qué datos.
- Verificación: Comprobado en la página armada: pobreza/diccionario.html, pobreza/index.html.

Original:

```text
Elaboración propia sobre INDEC: Encuesta Permanente de Hogares y Censo 2022. Las cifras por partido, comuna y fracción son estimaciones estadísticas, no mediciones oficiales.
```

Propuesto:

```text
Elaboración de Datina con datos del INDEC: Encuesta Permanente de Hogares y Censo 2022. Las cifras por partido, comuna y fracción son estimaciones estadísticas, no mediciones oficiales.
```

## pobreza/scripts/exportar_parquet.py#CRUDO

- Rutas: no se encontró en las páginas armadas
- Fuente: `pobreza/scripts/exportar_parquet.py`, CRUDO, línea 27
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
"datos"
```

Propuesto: igual al original.

## pobreza/scripts/exportar_parquet.py#línea 47

- Rutas: pobreza/diccionario.html
- Fuente: `pobreza/scripts/exportar_parquet.py`, línea 47, línea 49
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: El mismo cambio que en diccionario.md. diccionario.md lo genera pobreza/scripts/exportar_parquet.py: el mismo cambio va en los dos archivos para que el próximo export no lo pise (si no se quiere tocar el programa, aplicar solo el de diccionario.md y anotarlo como pendiente).
- Verificación: Comprobado en la página armada: pobreza/diccionario.html.

Original:

```text
"Serie nacional de pobreza e indigencia"
"Incidencia de la pobreza y la indigencia en el total de 31 aglomerados urbanos, "
            "por semestre, desde el 2S 2016 hasta el 1S 2026. Fuente: INDEC, EPH."
"Semestre, por ejemplo 1S 2026"
"Año del semestre"
"Semestre del año (1 o 2)"
"pobreza o indigencia"
"personas u hogares (población de referencia)"
"Porcentaje de personas u hogares en esa condición sobre el total de la población de referencia de los 31 aglomerados"
"Pobreza e indigencia por grupo de edad"
"Porcentaje de personas pobres e indigentes dentro de cada grupo de edad, total de 31 "
            "aglomerados urbanos, por semestre. Incluye los grupos generales (0 a 14, 15 a 29, 30 a 64, "
            "65 y más) y el detalle de niñas, niños y adolescentes (0 a 17 y subgrupos). Fuente: INDEC, EPH."
"Semestre, por ejemplo 1S 2026"
"Año del semestre"
"Semestre del año (1 o 2)"
"Grupo de edad en años cumplidos (Total es el total de personas)"
"general (grupos de toda la población) o ninez (0 a 17 años y subgrupos)"
"pobreza o indigencia"
"Porcentaje de personas del grupo de edad que están en esa condición"
"Aglomerados, regiones y totales en el último semestre"
"Foto del 1S 2026 para el total de 31 aglomerados, las 6 regiones estadísticas, los 31 "
            "aglomerados (con Gran Buenos Aires abierto en Ciudad y Partidos del GBA) y los grupos por "
            "tamaño. Incluye coeficiente de variación (CV) e intervalo de confianza al 90% de cada "
            "incidencia. Fuente: INDEC, EPH, informe técnico del 1S 2026 y anexo de CV."
"Semestre de referencia (1S 2026)"
"Nombre del aglomerado, región o total"
"total, interior, region, aglomerado o tamano (grupo por tamaño del aglomerado)"
"Región estadística del INDEC a la que pertenece (vacía en totales)"
"personas pobres"
"pobreza_personas"
"hogares pobres"
"pobreza_hogares"
"indigencia_personas"
"personas indigentes"
"hogares indigentes"
"indigencia_hogares"
f"Porcentaje de {etiqueta} sobre el total de {etiqueta.split()[0]} de la unidad"
f"Coeficiente de variación de {ind}_pct, en %. Entre 16 y 25 leer con cuidado, más de 25 no confiable"
f"Límite inferior del intervalo de confianza al 90% de {ind}_pct, en %"
f"Límite superior del intervalo de confianza al 90% de {ind}_pct, en %"
f"Cantidad de {etiqueta}, en miles"
"Población total de la unidad, en miles de personas (proyección EPH)"
"total_personas_miles"
"Total de hogares de la unidad, en miles"
"total_hogares_miles"
"Serie por aglomerado, región y total"
"Incidencia de la pobreza y la indigencia por semestre para cada una de las 42 unidades "
            "de la tabla aglomerados. Vacío donde el INDEC no publicó dato (Gran Resistencia en el "
            "2S 2019 y Ushuaia - Río Grande en el 2S 2020). Fuente: INDEC, EPH."
"Nombre del aglomerado, región o total"
"total, interior, region, aglomerado o tamano"
"Región estadística del INDEC (vacía en totales)"
"Semestre, por ejemplo 1S 2026"
"Año del semestre"
"Semestre del año (1 o 2)"
"pobreza o indigencia"
"personas u hogares"
"Porcentaje de personas u hogares de la unidad en esa condición (vacío si no hay dato)"
"Partidos del GBA y comunas de la Ciudad (estimación en áreas pequeñas)"
"Estimación de la pobreza y la indigencia en los 24 partidos del Gran Buenos Aires y las "
            "15 comunas de la Ciudad para el 1S 2026. No es una medición oficial: sale de un modelo "
            "estimado con la EPH del 1T 2026 y aplicado a las características de cada radio censal "
            "(Censo 2022), calibrado para reproducir el total oficial de cada dominio (36,9% de "
            "personas pobres en los Partidos del GBA y 11,1% en la Ciudad). Intervalos bootstrap al 90%. "
            "Población de referencia: la censal de 2022."
"Semestre de referencia de la estimación (1S 2026)"
"Partido del GBA o comuna de la Ciudad"
"CABA (comunas de la Ciudad) o GBA (partidos del conurbano)"
"Agrupamiento: Primera corona, Segunda corona, La Matanza, CABA norte, CABA centro o CABA sur"
"Personas según el Censo 2022"
"Hogares según el Censo 2022"
"hogares_censo_2022"
"Porcentaje estimado de personas pobres"
"pobreza_personas_pct"
"Límite inferior del intervalo al 90% de pobreza_personas_pct, en %"
"pobreza_personas_li"
"Límite superior del intervalo al 90% de pobreza_personas_pct, en %"
"pobreza_personas_ls"
"Coeficiente de variación bootstrap de pobreza_personas_pct, en %"
"pobreza_personas_cv"
"Porcentaje estimado de hogares pobres"
"pobreza_hogares_pct"
"Límite inferior del intervalo al 90% de pobreza_hogares_pct, en %"
"pobreza_hogares_li"
"Límite superior del intervalo al 90% de pobreza_hogares_pct, en %"
"pobreza_hogares_ls"
"Porcentaje estimado de personas indigentes"
"indigencia_personas_pct"
"Límite inferior del intervalo al 90% de indigencia_personas_pct, en %"
"indigencia_personas_li"
"Límite superior del intervalo al 90% de indigencia_personas_pct, en %"
"indigencia_personas_ls"
"Cantidad estimada de personas pobres, sobre la población censal"
"personas_pobres"
"Cantidad estimada de personas indigentes, sobre la población censal"
"personas_indigentes"
"Porcentaje de hogares con necesidades básicas insatisfechas (Censo 2022)"
"nbi_hogares_pct"
"Porcentaje de hogares con privación convergente según el IPMH (Censo 2022)"
"Porcentaje de personas sin cobertura de salud por obra social, prepaga o plan estatal (Censo 2022)"
"sin_cobertura_salud_pct"
"Porcentaje de hogares con 2 o más personas por cuarto (Censo 2022)"
"Porcentaje de hogares con desagüe a red cloacal (Censo 2022)"
"Porcentaje de hogares inquilinos (Censo 2022)"
"Fracciones censales del GBA y la Ciudad"
"El mismo modelo de la tabla gba_partidos_comunas aplicado a cada fracción censal "
            "(unidades de unos 3 mil a 20 mil habitantes). Capa exploratoria, sin intervalos de "
            "confianza. Período de referencia 1S 2026, población censal 2022."
"Semestre de referencia de la estimación (1S 2026)"
"Código de la fracción censal (7 dígitos: provincia, departamento y fracción)"
"Partido del GBA o comuna de la Ciudad que la contiene"
"CABA o GBA"
"Zona de la unidad que la contiene"
"Personas según el Censo 2022"
"Porcentaje estimado de personas pobres"
"pobreza_personas_pct"
"Porcentaje estimado de personas indigentes"
"indigencia_personas_pct"
"Porcentaje de personas sin cobertura de salud (Censo 2022)"
"sin_cobertura_salud_pct"
"Porcentaje de hogares con necesidades básicas insatisfechas (Censo 2022)"
"nbi_hogares_pct"
```

Propuesto:

```text
"Serie nacional de pobreza e indigencia"
"Incidencia de la pobreza y la indigencia en el total de 31 aglomerados urbanos, "
            "por semestre, desde el segundo semestre de 2016 hasta el primero de 2026. Fuente: INDEC, EPH."
"Semestre, por ejemplo 1S 2026"
"Año del semestre"
"Semestre del año (1 o 2)"
"pobreza o indigencia"
"personas u hogares (población de referencia)"
"Porcentaje de personas u hogares en esa condición sobre el total de la población de referencia de los 31 aglomerados"
"Pobreza e indigencia por grupo de edad"
"Porcentaje de personas pobres e indigentes dentro de cada grupo de edad, total de 31 "
            "aglomerados urbanos, por semestre. Incluye los grupos generales (0 a 14, 15 a 29, 30 a 64, "
            "65 y más) y el detalle de niñas, niños y adolescentes (0 a 17 y subgrupos). Fuente: INDEC, EPH."
"Semestre, por ejemplo 1S 2026"
"Año del semestre"
"Semestre del año (1 o 2)"
"Grupo de edad en años cumplidos (Total es el total de personas)"
"general (grupos de toda la población) o ninez (0 a 17 años y subgrupos)"
"pobreza o indigencia"
"Porcentaje de personas del grupo de edad que están en esa condición"
"Aglomerados, regiones y totales en el último semestre"
"Datos del primer semestre de 2026 para el total de 31 aglomerados, las 6 regiones estadísticas, los 31 "
            "aglomerados (con Gran Buenos Aires dividido en CABA y Partidos del GBA) y los grupos por "
            "tamaño. Incluye coeficiente de variación (CV) e intervalo de confianza al 90% de cada "
            "incidencia. Fuente: INDEC, EPH, informe técnico del primer semestre de 2026 y anexo de CV."
"Semestre de referencia (1S 2026)"
"Nombre del aglomerado, región o total"
"total, interior, region, aglomerado o tamano (grupo por tamaño del aglomerado)"
"Región estadística del INDEC a la que pertenece (vacía en totales)"
"personas pobres"
"pobreza_personas"
"hogares pobres"
"pobreza_hogares"
"indigencia_personas"
"personas indigentes"
"hogares indigentes"
"indigencia_hogares"
f"Porcentaje de {etiqueta} sobre el total de {etiqueta.split()[0]} de la unidad"
f"Coeficiente de variación de {ind}_pct, en %. Entre 16 y 25 leer con cuidado, más de 25 no confiable"
f"Límite inferior del intervalo de confianza al 90% de {ind}_pct, en %"
f"Límite superior del intervalo de confianza al 90% de {ind}_pct, en %"
f"Cantidad de {etiqueta}, en miles"
"Población total de la unidad, en miles de personas (proyección EPH)"
"total_personas_miles"
"Total de hogares de la unidad, en miles"
"total_hogares_miles"
"Serie por aglomerado, región y total"
"Incidencia de la pobreza y la indigencia por semestre para cada una de las 42 unidades "
            "de la tabla aglomerados. Vacío donde el INDEC no publicó dato (Gran Resistencia en el "
            "segundo semestre de 2019 y Ushuaia - Río Grande en el segundo semestre de 2020). Fuente: INDEC, EPH."
"Nombre del aglomerado, región o total"
"total, interior, region, aglomerado o tamano"
"Región estadística del INDEC (vacía en totales)"
"Semestre, por ejemplo 1S 2026"
"Año del semestre"
"Semestre del año (1 o 2)"
"pobreza o indigencia"
"personas u hogares"
"Porcentaje de personas u hogares de la unidad en esa condición (vacío si no hay dato)"
"Partidos del GBA y comunas de CABA (estimación en áreas pequeñas)"
"Estimación de la pobreza y la indigencia en los 24 partidos del Gran Buenos Aires y las "
            "15 comunas de CABA para el primer semestre de 2026. No es una medición oficial: sale de un modelo "
            "estimado con la EPH del primer trimestre de 2026 y aplicado a las características de cada radio censal "
            "(Censo 2022), calibrado para reproducir el total oficial de cada dominio (36,9% de "
            "personas pobres en los Partidos del GBA y 11,1% en CABA). Intervalos de confianza al 90%, calculados por remuestreo (bootstrap). "
            "Población de referencia: la del Censo 2022."
"Semestre de referencia de la estimación (1S 2026)"
"Partido del GBA o comuna de CABA"
"CABA (comunas) o GBA (partidos del conurbano)"
"Agrupamiento: Primera corona, Segunda corona, La Matanza, CABA norte, CABA centro o CABA sur"
"Personas según el Censo 2022"
"Hogares según el Censo 2022"
"hogares_censo_2022"
"Porcentaje estimado de personas pobres"
"pobreza_personas_pct"
"Límite inferior del intervalo al 90% de pobreza_personas_pct, en %"
"pobreza_personas_li"
"Límite superior del intervalo al 90% de pobreza_personas_pct, en %"
"pobreza_personas_ls"
"Coeficiente de variación bootstrap de pobreza_personas_pct, en %"
"pobreza_personas_cv"
"Porcentaje estimado de hogares pobres"
"pobreza_hogares_pct"
"Límite inferior del intervalo al 90% de pobreza_hogares_pct, en %"
"pobreza_hogares_li"
"Límite superior del intervalo al 90% de pobreza_hogares_pct, en %"
"pobreza_hogares_ls"
"Porcentaje estimado de personas indigentes"
"indigencia_personas_pct"
"Límite inferior del intervalo al 90% de indigencia_personas_pct, en %"
"indigencia_personas_li"
"Límite superior del intervalo al 90% de indigencia_personas_pct, en %"
"indigencia_personas_ls"
"Cantidad estimada de personas pobres, sobre la población censal"
"personas_pobres"
"Cantidad estimada de personas indigentes, sobre la población censal"
"personas_indigentes"
"Porcentaje de hogares con necesidades básicas insatisfechas (Censo 2022)"
"nbi_hogares_pct"
"Porcentaje de hogares con privación convergente según el IPMH (Censo 2022)"
"Porcentaje de personas sin cobertura de salud por obra social, prepaga o plan estatal (Censo 2022)"
"sin_cobertura_salud_pct"
"Porcentaje de hogares con 2 o más personas por cuarto (Censo 2022)"
"Porcentaje de hogares con desagüe a red cloacal (Censo 2022)"
"Porcentaje de hogares inquilinos (Censo 2022)"
"Fracciones censales del GBA y CABA"
"El mismo modelo de la tabla gba_partidos_comunas aplicado a cada fracción censal "
            "(unidades de unos 3 mil a 20 mil habitantes). Capa exploratoria, sin intervalos de "
            "confianza. Período de referencia: primer semestre de 2026. Población de referencia: la del Censo 2022."
"Semestre de referencia de la estimación (1S 2026)"
"Código de la fracción censal (7 dígitos: provincia, departamento y fracción)"
"Partido del GBA o comuna de CABA que la contiene"
"CABA o GBA"
"Zona de la unidad que la contiene"
"Personas según el Censo 2022"
"Porcentaje estimado de personas pobres"
"pobreza_personas_pct"
"Porcentaje estimado de personas indigentes"
"indigencia_personas_pct"
"Porcentaje de personas sin cobertura de salud (Censo 2022)"
"sin_cobertura_salud_pct"
"Porcentaje de hogares con necesidades básicas insatisfechas (Censo 2022)"
"nbi_hogares_pct"
```

## pobreza/scripts/exportar_parquet.py#construir

- Rutas: pobreza/diccionario.html
- Fuente: `pobreza/scripts/exportar_parquet.py`, construir, línea 221
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: pobreza/diccionario.html.

Original:

```text
"indigencia_hogares"
"indigencia_personas"
"pobreza_hogares"
"pobreza_personas"
"indigencia_hogares"
"indigencia_personas"
"pobreza_hogares"
"pobreza_personas"
"total_personas_miles"
"total_hogares_miles"
"hogares"
"personas"
"hogares_censo_2022"
"pobreza_personas_li"
"pobreza_personas_ls"
"pobreza_personas_pct"
"pobreza_personas_cv"
"pobreza_hogares_li"
"pobreza_hogares_ls"
"pobreza_hogares_pct"
"indigencia_personas_li"
"indigencia_personas_ls"
"indigencia_personas_pct"
"personas_indigentes"
"personas_indigentes"
"personas_pobres"
"personas_pobres"
"nbi_hogares_pct"
"sin_cobertura_salud_pct"
"pobreza_personas_pct"
"indigencia_personas_pct"
"sin_cobertura_salud_pct"
"nbi_hogares_pct"
```

Propuesto: igual al original.

## pobreza/scripts/exportar_parquet.py#a_arrow

- Rutas: no se encontró en las páginas armadas
- Fuente: `pobreza/scripts/exportar_parquet.py`, a_arrow, línea 310
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
f"{nombre}: columnas sin describir {faltan}"
```

Propuesto: igual al original.

## pobreza/scripts/exportar_parquet.py#escribir_diccionario

- Rutas: pobreza/diccionario.html
- Fuente: `pobreza/scripts/exportar_parquet.py`, escribir_diccionario, línea 329
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: El mismo cambio que en diccionario.md. diccionario.md lo genera pobreza/scripts/exportar_parquet.py: el mismo cambio va en los dos archivos para que el próximo export no lo pise (si no se quiere tocar el programa, aplicar solo el de diccionario.md y anotarlo como pendiente).
- Verificación: Comprobado en la página armada: pobreza/diccionario.html.

Original:

```text
"title: Diccionario de datos"
"# Diccionario de datos"
"Este archivo se genera solo con `python scripts/exportar_parquet.py`. Si lo editás a mano, el próximo "
        "export lo pisa. Todas las tablas son Parquet con compresión zstd y se pueden leer con DuckDB, R, Python, "
        "QGIS o Excel con un complemento. Los porcentajes están en escala de 0 a 100."
"Para medir la precisión, el INDEC recomienda leer con cuidado los valores con coeficiente de variación "
        "entre 16% y 25% y considera no confiables los que superan 25%."
"[Volver a la página de consultas](./)"
"| Columna | Tipo | Qué contiene |"
```

Propuesto:

```text
"title: Diccionario de datos"
"# Diccionario de datos"
"Las seis tablas del consultor de pobreza, columna por columna. Todas están en formato Parquet, comprimidas "
        "con zstd, y se pueden leer con DuckDB, R, Python, QGIS o Excel con un complemento. Los porcentajes van de "
        "0 a 100. <!-- Lo genera scripts/exportar_parquet.py: si se edita a mano, el próximo export lo pisa. -->"
"Cómo leer la precisión: el INDEC recomienda leer con cuidado los valores con un coeficiente de variación de "
        "entre 16% y 25% y considera no confiables los que superan 25%."
"[Volver al consultor de pobreza](./)"
"| Columna | Tipo | Qué contiene |"
```

## pobreza/scripts/exportar_parquet.py#main

- Rutas: no se encontró en las páginas armadas
- Fuente: `pobreza/scripts/exportar_parquet.py`, main, línea 377
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
f"Diccionario escrito en {DICCIONARIO.relative_to(RAIZ)}"
```

Propuesto: igual al original.

## pobreza/src/diccionario.md#title-diccionario-de-datos-toc-tru

- Rutas: no se encontró en las páginas armadas
- Fuente: `pobreza/src/diccionario.md`, línea 1, línea 1
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
---
title: Diccionario de datos
toc: true
---
```

Propuesto: igual al original.

## pobreza/src/diccionario.md#diccionario-de-datos

- Rutas: pobreza/diccionario.html
- Fuente: `pobreza/src/diccionario.md`, línea 6, línea 6
- Tipo: título
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: pobreza/diccionario.html, pobreza/index.html.

Original:

```text
# Diccionario de datos
```

Propuesto: igual al original.

## pobreza/src/diccionario.md#las-seis-tablas-del-consultor-de-pobreza

- Rutas: pobreza/diccionario.html
- Fuente: `pobreza/src/diccionario.md`, línea 8, línea 8
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: La primera oración que lee el público era una instrucción para quien mantiene el sitio. Pasa a un comentario HTML, que no se ve. diccionario.md lo genera pobreza/scripts/exportar_parquet.py: el mismo cambio va en los dos archivos para que el próximo export no lo pise (si no se quiere tocar el programa, aplicar solo el de diccionario.md y anotarlo como pendiente).
- Verificación: Comprobado en la página armada: pobreza/diccionario.html.

Original:

```text
Este archivo se genera solo con `python scripts/exportar_parquet.py`. Si lo editás a mano, el próximo export lo pisa. Todas las tablas son Parquet con compresión zstd y se pueden leer con DuckDB, R, Python, QGIS o Excel con un complemento. Los porcentajes están en escala de 0 a 100.
```

Propuesto:

```text
Las seis tablas del consultor de pobreza, columna por columna. Todas están en formato Parquet, comprimidas con zstd, y se pueden leer con DuckDB, R, Python, QGIS o Excel con un complemento. Los porcentajes van de 0 a 100. <!-- Lo genera scripts/exportar_parquet.py: si se edita a mano, el próximo export lo pisa. -->
```

## pobreza/src/diccionario.md#cómo-leer-la-precisión-el-indec-recomie

- Rutas: pobreza/diccionario.html
- Fuente: `pobreza/src/diccionario.md`, línea 10, línea 10
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: 'Para medir la precisión, el INDEC recomienda leer...' no se seguía. Usa el mismo rótulo que el recuadro de la página de consultas. diccionario.md lo genera pobreza/scripts/exportar_parquet.py: el mismo cambio va en los dos archivos para que el próximo export no lo pise (si no se quiere tocar el programa, aplicar solo el de diccionario.md y anotarlo como pendiente).
- Verificación: Comprobado en la página armada: pobreza/diccionario.html.

Original:

```text
Para medir la precisión, el INDEC recomienda leer con cuidado los valores con coeficiente de variación entre 16% y 25% y considera no confiables los que superan 25%.
```

Propuesto:

```text
Cómo leer la precisión: el INDEC recomienda leer con cuidado los valores con un coeficiente de variación de entre 16% y 25% y considera no confiables los que superan 25%.
```

## pobreza/src/diccionario.md#volver-al-consultor-de-pobreza

- Rutas: pobreza/diccionario.html
- Fuente: `pobreza/src/diccionario.md`, línea 12, línea 12
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: El enlace nombra la página con el nombre que le da el sitio. diccionario.md lo genera pobreza/scripts/exportar_parquet.py: el mismo cambio va en los dos archivos para que el próximo export no lo pise (si no se quiere tocar el programa, aplicar solo el de diccionario.md y anotarlo como pendiente).
- Verificación: Comprobado en la página armada: pobreza/diccionario.html.

Original:

```text
[Volver a la página de consultas](./)
```

Propuesto:

```text
[Volver al consultor de pobreza](./)
```

## pobreza/src/diccionario.md#serie-nacional-de-pobreza-e-indigencia

- Rutas: pobreza/diccionario.html
- Fuente: `pobreza/src/diccionario.md`, línea 16, línea 16
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: Fechas en palabras. diccionario.md lo genera pobreza/scripts/exportar_parquet.py: el mismo cambio va en los dos archivos para que el próximo export no lo pise (si no se quiere tocar el programa, aplicar solo el de diccionario.md y anotarlo como pendiente).
- Verificación: Comprobado en la página armada: pobreza/diccionario.html.

Original:

```text
**Serie nacional de pobreza e indigencia.** Incidencia de la pobreza y la indigencia en el total de 31 aglomerados urbanos, por semestre, desde el 2S 2016 hasta el 1S 2026. Fuente: INDEC, EPH.
```

Propuesto:

```text
**Serie nacional de pobreza e indigencia.** Incidencia de la pobreza y la indigencia en el total de 31 aglomerados urbanos, por semestre, desde el segundo semestre de 2016 hasta el primero de 2026. Fuente: INDEC, EPH.
```

## pobreza/src/diccionario.md#archivo-data-serie_nacional-parquet

- Rutas: pobreza/diccionario.html
- Fuente: `pobreza/src/diccionario.md`, línea 18, línea 18
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: pobreza/diccionario.html.

Original:

```text
Archivo: `data/serie_nacional.parquet` (80 filas).
```

Propuesto: igual al original.

## pobreza/src/diccionario.md#columna-tipo-qué-contiene

- Rutas: pobreza/diccionario.html
- Fuente: `pobreza/src/diccionario.md`, línea 20, línea 20
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: pobreza/diccionario.html.

Original:

```text
| Columna | Tipo | Qué contiene |
|---|---|---|
| `periodo` | texto | Semestre, por ejemplo 1S 2026 |
| `anio` | entero | Año del semestre |
| `semestre` | entero | Semestre del año (1 o 2) |
| `indicador` | texto | pobreza o indigencia |
| `unidad` | texto | personas u hogares (población de referencia) |
| `valor_pct` | decimal | Porcentaje de personas u hogares en esa condición sobre el total de la población de referencia de los 31 aglomerados |
```

Propuesto: igual al original.

## pobreza/src/diccionario.md#pobreza-e-indigencia-por-grupo-de-edad

- Rutas: pobreza/diccionario.html
- Fuente: `pobreza/src/diccionario.md`, línea 31, línea 31
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: pobreza/diccionario.html.

Original:

```text
**Pobreza e indigencia por grupo de edad.** Porcentaje de personas pobres e indigentes dentro de cada grupo de edad, total de 31 aglomerados urbanos, por semestre. Incluye los grupos generales (0 a 14, 15 a 29, 30 a 64, 65 y más) y el detalle de niñas, niños y adolescentes (0 a 17 y subgrupos). Fuente: INDEC, EPH.
```

Propuesto: igual al original.

## pobreza/src/diccionario.md#archivo-data-pobreza_edad-parquet-36

- Rutas: pobreza/diccionario.html
- Fuente: `pobreza/src/diccionario.md`, línea 33, línea 33
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: pobreza/diccionario.html.

Original:

```text
Archivo: `data/pobreza_edad.parquet` (360 filas).
```

Propuesto: igual al original.

## pobreza/src/diccionario.md#columna-tipo-qué-contiene~2

- Rutas: pobreza/diccionario.html
- Fuente: `pobreza/src/diccionario.md`, línea 35, línea 35
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: pobreza/diccionario.html.

Original:

```text
| Columna | Tipo | Qué contiene |
|---|---|---|
| `periodo` | texto | Semestre, por ejemplo 1S 2026 |
| `anio` | entero | Año del semestre |
| `semestre` | entero | Semestre del año (1 o 2) |
| `grupo_edad` | texto | Grupo de edad en años cumplidos (Total es el total de personas) |
| `serie_grupos` | texto | general (grupos de toda la población) o ninez (0 a 17 años y subgrupos) |
| `indicador` | texto | pobreza o indigencia |
| `valor_pct` | decimal | Porcentaje de personas del grupo de edad que están en esa condición |
```

Propuesto: igual al original.

## pobreza/src/diccionario.md#aglomerados-regiones-y-totales-en-el

- Rutas: pobreza/diccionario.html
- Fuente: `pobreza/src/diccionario.md`, línea 47, línea 47
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: Fechas en palabras, y 'datos' en lugar de 'foto'. diccionario.md lo genera pobreza/scripts/exportar_parquet.py: el mismo cambio va en los dos archivos para que el próximo export no lo pise (si no se quiere tocar el programa, aplicar solo el de diccionario.md y anotarlo como pendiente). Fechas en palabras. diccionario.md lo genera pobreza/scripts/exportar_parquet.py: el mismo cambio va en los dos archivos para que el próximo export no lo pise (si no se quiere tocar el programa, aplicar solo el de diccionario.md y anotarlo como pendiente). Término fijo: CABA. 'Abierto en' era jerga de tablas. diccionario.md lo genera pobreza/scripts/exportar_parquet.py: el mismo cambio va en los dos archivos para que el próximo export no lo pise (si no se quiere tocar el programa, aplicar solo el de diccionario.md y anotarlo como pendiente).
- Verificación: Comprobado en la página armada: pobreza/diccionario.html.

Original:

```text
**Aglomerados, regiones y totales en el último semestre.** Foto del 1S 2026 para el total de 31 aglomerados, las 6 regiones estadísticas, los 31 aglomerados (con Gran Buenos Aires abierto en Ciudad y Partidos del GBA) y los grupos por tamaño. Incluye coeficiente de variación (CV) e intervalo de confianza al 90% de cada incidencia. Fuente: INDEC, EPH, informe técnico del 1S 2026 y anexo de CV.
```

Propuesto:

```text
**Aglomerados, regiones y totales en el último semestre.** Datos del primer semestre de 2026 para el total de 31 aglomerados, las 6 regiones estadísticas, los 31 aglomerados (con Gran Buenos Aires dividido en CABA y Partidos del GBA) y los grupos por tamaño. Incluye coeficiente de variación (CV) e intervalo de confianza al 90% de cada incidencia. Fuente: INDEC, EPH, informe técnico del primer semestre de 2026 y anexo de CV.
```

## pobreza/src/diccionario.md#archivo-data-aglomerados-parquet-42

- Rutas: pobreza/diccionario.html
- Fuente: `pobreza/src/diccionario.md`, línea 49, línea 49
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: pobreza/diccionario.html.

Original:

```text
Archivo: `data/aglomerados.parquet` (42 filas).
```

Propuesto: igual al original.

## pobreza/src/diccionario.md#columna-tipo-qué-contiene~3

- Rutas: pobreza/diccionario.html
- Fuente: `pobreza/src/diccionario.md`, línea 51, línea 51
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: pobreza/diccionario.html.

Original:

```text
| Columna | Tipo | Qué contiene |
|---|---|---|
| `periodo` | texto | Semestre de referencia (1S 2026) |
| `nombre` | texto | Nombre del aglomerado, región o total |
| `tipo` | texto | total, interior, region, aglomerado o tamano (grupo por tamaño del aglomerado) |
| `region` | texto | Región estadística del INDEC a la que pertenece (vacía en totales) |
| `pobreza_personas_pct` | decimal | Porcentaje de personas pobres sobre el total de personas de la unidad |
| `pobreza_personas_cv` | decimal | Coeficiente de variación de pobreza_personas_pct, en %. Entre 16 y 25 leer con cuidado, más de 25 no confiable |
| `pobreza_personas_li` | decimal | Límite inferior del intervalo de confianza al 90% de pobreza_personas_pct, en % |
| `pobreza_personas_ls` | decimal | Límite superior del intervalo de confianza al 90% de pobreza_personas_pct, en % |
| `pobreza_personas_miles` | decimal | Cantidad de personas pobres, en miles |
| `pobreza_hogares_pct` | decimal | Porcentaje de hogares pobres sobre el total de hogares de la unidad |
| `pobreza_hogares_cv` | decimal | Coeficiente de variación de pobreza_hogares_pct, en %. Entre 16 y 25 leer con cuidado, más de 25 no confiable |
| `pobreza_hogares_li` | decimal | Límite inferior del intervalo de confianza al 90% de pobreza_hogares_pct, en % |
| `pobreza_hogares_ls` | decimal | Límite superior del intervalo de confianza al 90% de pobreza_hogares_pct, en % |
| `pobreza_hogares_miles` | decimal | Cantidad de hogares pobres, en miles |
| `indigencia_personas_pct` | decimal | Porcentaje de personas indigentes sobre el total de personas de la unidad |
| `indigencia_personas_cv` | decimal | Coeficiente de variación de indigencia_personas_pct, en %. Entre 16 y 25 leer con cuidado, más de 25 no confiable |
| `indigencia_personas_li` | decimal | Límite inferior del intervalo de confianza al 90% de indigencia_personas_pct, en % |
| `indigencia_personas_ls` | decimal | Límite superior del intervalo de confianza al 90% de indigencia_personas_pct, en % |
| `indigencia_personas_miles` | decimal | Cantidad de personas indigentes, en miles |
| `indigencia_hogares_pct` | decimal | Porcentaje de hogares indigentes sobre el total de hogares de la unidad |
| `indigencia_hogares_cv` | decimal | Coeficiente de variación de indigencia_hogares_pct, en %. Entre 16 y 25 leer con cuidado, más de 25 no confiable |
| `indigencia_hogares_li` | decimal | Límite inferior del intervalo de confianza al 90% de indigencia_hogares_pct, en % |
| `indigencia_hogares_ls` | decimal | Límite superior del intervalo de confianza al 90% de indigencia_hogares_pct, en % |
| `indigencia_hogares_miles` | decimal | Cantidad de hogares indigentes, en miles |
| `total_personas_miles` | decimal | Población total de la unidad, en miles de personas (proyección EPH) |
| `total_hogares_miles` | decimal | Total de hogares de la unidad, en miles |
```

Propuesto: igual al original.

## pobreza/src/diccionario.md#serie-por-aglomerado-región-y-total

- Rutas: pobreza/diccionario.html
- Fuente: `pobreza/src/diccionario.md`, línea 82, línea 82
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: Fechas en palabras. diccionario.md lo genera pobreza/scripts/exportar_parquet.py: el mismo cambio va en los dos archivos para que el próximo export no lo pise (si no se quiere tocar el programa, aplicar solo el de diccionario.md y anotarlo como pendiente).
- Verificación: Comprobado en la página armada: pobreza/diccionario.html.

Original:

```text
**Serie por aglomerado, región y total.** Incidencia de la pobreza y la indigencia por semestre para cada una de las 42 unidades de la tabla aglomerados. Vacío donde el INDEC no publicó dato (Gran Resistencia en el 2S 2019 y Ushuaia - Río Grande en el 2S 2020). Fuente: INDEC, EPH.
```

Propuesto:

```text
**Serie por aglomerado, región y total.** Incidencia de la pobreza y la indigencia por semestre para cada una de las 42 unidades de la tabla aglomerados. Vacío donde el INDEC no publicó dato (Gran Resistencia en el segundo semestre de 2019 y Ushuaia - Río Grande en el segundo semestre de 2020). Fuente: INDEC, EPH.
```

## pobreza/src/diccionario.md#archivo-data-aglomerados_serie-parquet

- Rutas: pobreza/diccionario.html
- Fuente: `pobreza/src/diccionario.md`, línea 84, línea 84
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: pobreza/diccionario.html.

Original:

```text
Archivo: `data/aglomerados_serie.parquet` (3360 filas).
```

Propuesto: igual al original.

## pobreza/src/diccionario.md#columna-tipo-qué-contiene~4

- Rutas: pobreza/diccionario.html
- Fuente: `pobreza/src/diccionario.md`, línea 86, línea 86
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: pobreza/diccionario.html.

Original:

```text
| Columna | Tipo | Qué contiene |
|---|---|---|
| `aglomerado` | texto | Nombre del aglomerado, región o total |
| `tipo` | texto | total, interior, region, aglomerado o tamano |
| `region` | texto | Región estadística del INDEC (vacía en totales) |
| `periodo` | texto | Semestre, por ejemplo 1S 2026 |
| `anio` | entero | Año del semestre |
| `semestre` | entero | Semestre del año (1 o 2) |
| `indicador` | texto | pobreza o indigencia |
| `unidad` | texto | personas u hogares |
| `valor_pct` | decimal | Porcentaje de personas u hogares de la unidad en esa condición (vacío si no hay dato) |
```

Propuesto: igual al original.

## pobreza/src/diccionario.md#partidos-del-gba-y-comunas-de-caba-es

- Rutas: pobreza/diccionario.html
- Fuente: `pobreza/src/diccionario.md`, línea 100, línea 100
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: CABA y fechas en palabras. diccionario.md lo genera pobreza/scripts/exportar_parquet.py: el mismo cambio va en los dos archivos para que el próximo export no lo pise (si no se quiere tocar el programa, aplicar solo el de diccionario.md y anotarlo como pendiente). CABA, y 'bootstrap' explicado como en la página de consultas. diccionario.md lo genera pobreza/scripts/exportar_parquet.py: el mismo cambio va en los dos archivos para que el próximo export no lo pise (si no se quiere tocar el programa, aplicar solo el de diccionario.md y anotarlo como pendiente). Como en la página de consultas y en la tabla de las fracciones. diccionario.md lo genera pobreza/scripts/exportar_parquet.py: el mismo cambio va en los dos archivos para que el próximo export no lo pise (si no se quiere tocar el programa, aplicar solo el de diccionario.md y anotarlo como pendiente). Fechas en palabras. diccionario.md lo genera pobreza/scripts/exportar_parquet.py: el mismo cambio va en los dos archivos para que el próximo export no lo pise (si no se quiere tocar el programa, aplicar solo el de diccionario.md y anotarlo como pendiente). Término fijo: CABA. diccionario.md lo genera pobreza/scripts/exportar_parquet.py: el mismo cambio va en los dos archivos para que el próximo export no lo pise (si no se quiere tocar el programa, aplicar solo el de diccionario.md y anotarlo como pendiente).
- Verificación: Comprobado en la página armada: pobreza/diccionario.html.

Original:

```text
**Partidos del GBA y comunas de la Ciudad (estimación en áreas pequeñas).** Estimación de la pobreza y la indigencia en los 24 partidos del Gran Buenos Aires y las 15 comunas de la Ciudad para el 1S 2026. No es una medición oficial: sale de un modelo estimado con la EPH del 1T 2026 y aplicado a las características de cada radio censal (Censo 2022), calibrado para reproducir el total oficial de cada dominio (36,9% de personas pobres en los Partidos del GBA y 11,1% en la Ciudad). Intervalos bootstrap al 90%. Población de referencia: la censal de 2022.
```

Propuesto:

```text
**Partidos del GBA y comunas de CABA (estimación en áreas pequeñas).** Estimación de la pobreza y la indigencia en los 24 partidos del Gran Buenos Aires y las 15 comunas de CABA para el primer semestre de 2026. No es una medición oficial: sale de un modelo estimado con la EPH del primer trimestre de 2026 y aplicado a las características de cada radio censal (Censo 2022), calibrado para reproducir el total oficial de cada dominio (36,9% de personas pobres en los Partidos del GBA y 11,1% en CABA). Intervalos de confianza al 90%, calculados por remuestreo (bootstrap). Población de referencia: la del Censo 2022.
```

## pobreza/src/diccionario.md#archivo-data-gba_partidos_comunas-parq

- Rutas: pobreza/diccionario.html
- Fuente: `pobreza/src/diccionario.md`, línea 102, línea 102
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: pobreza/diccionario.html.

Original:

```text
Archivo: `data/gba_partidos_comunas.parquet` (39 filas).
```

Propuesto: igual al original.

## pobreza/src/diccionario.md#columna-tipo-qué-contiene~5

- Rutas: pobreza/diccionario.html
- Fuente: `pobreza/src/diccionario.md`, línea 104, línea 104
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: 'CABA (comunas de la Ciudad)' repetía lo mismo con dos nombres. diccionario.md lo genera pobreza/scripts/exportar_parquet.py: el mismo cambio va en los dos archivos para que el próximo export no lo pise (si no se quiere tocar el programa, aplicar solo el de diccionario.md y anotarlo como pendiente). Término fijo: CABA (columna unidad de las dos tablas del GBA). diccionario.md lo genera pobreza/scripts/exportar_parquet.py: el mismo cambio va en los dos archivos para que el próximo export no lo pise (si no se quiere tocar el programa, aplicar solo el de diccionario.md y anotarlo como pendiente).
- Verificación: Comprobado en la página armada: pobreza/diccionario.html.

Original:

```text
| Columna | Tipo | Qué contiene |
|---|---|---|
| `periodo` | texto | Semestre de referencia de la estimación (1S 2026) |
| `unidad` | texto | Partido del GBA o comuna de la Ciudad |
| `jurisdiccion` | texto | CABA (comunas de la Ciudad) o GBA (partidos del conurbano) |
| `zona` | texto | Agrupamiento: Primera corona, Segunda corona, La Matanza, CABA norte, CABA centro o CABA sur |
| `poblacion_censo_2022` | entero | Personas según el Censo 2022 |
| `hogares_censo_2022` | entero | Hogares según el Censo 2022 |
| `pobreza_personas_pct` | decimal | Porcentaje estimado de personas pobres |
| `pobreza_personas_li` | decimal | Límite inferior del intervalo al 90% de pobreza_personas_pct, en % |
| `pobreza_personas_ls` | decimal | Límite superior del intervalo al 90% de pobreza_personas_pct, en % |
| `pobreza_personas_cv` | decimal | Coeficiente de variación bootstrap de pobreza_personas_pct, en % |
| `pobreza_hogares_pct` | decimal | Porcentaje estimado de hogares pobres |
| `pobreza_hogares_li` | decimal | Límite inferior del intervalo al 90% de pobreza_hogares_pct, en % |
| `pobreza_hogares_ls` | decimal | Límite superior del intervalo al 90% de pobreza_hogares_pct, en % |
| `indigencia_personas_pct` | decimal | Porcentaje estimado de personas indigentes |
| `indigencia_personas_li` | decimal | Límite inferior del intervalo al 90% de indigencia_personas_pct, en % |
| `indigencia_personas_ls` | decimal | Límite superior del intervalo al 90% de indigencia_personas_pct, en % |
| `personas_pobres` | entero | Cantidad estimada de personas pobres, sobre la población censal |
| `personas_indigentes` | entero | Cantidad estimada de personas indigentes, sobre la población censal |
| `nbi_hogares_pct` | decimal | Porcentaje de hogares con necesidades básicas insatisfechas (Censo 2022) |
| `privacion_convergente_pct` | decimal | Porcentaje de hogares con privación convergente según el IPMH (Censo 2022) |
| `sin_cobertura_salud_pct` | decimal | Porcentaje de personas sin cobertura de salud por obra social, prepaga o plan estatal (Censo 2022) |
| `hacinamiento_pct` | decimal | Porcentaje de hogares con 2 o más personas por cuarto (Censo 2022) |
| `cloaca_pct` | decimal | Porcentaje de hogares con desagüe a red cloacal (Censo 2022) |
| `inquilinos_pct` | decimal | Porcentaje de hogares inquilinos (Censo 2022) |
```

Propuesto:

```text
| Columna | Tipo | Qué contiene |
|---|---|---|
| `periodo` | texto | Semestre de referencia de la estimación (1S 2026) |
| `unidad` | texto | Partido del GBA o comuna de CABA |
| `jurisdiccion` | texto | CABA (comunas) o GBA (partidos del conurbano) |
| `zona` | texto | Agrupamiento: Primera corona, Segunda corona, La Matanza, CABA norte, CABA centro o CABA sur |
| `poblacion_censo_2022` | entero | Personas según el Censo 2022 |
| `hogares_censo_2022` | entero | Hogares según el Censo 2022 |
| `pobreza_personas_pct` | decimal | Porcentaje estimado de personas pobres |
| `pobreza_personas_li` | decimal | Límite inferior del intervalo al 90% de pobreza_personas_pct, en % |
| `pobreza_personas_ls` | decimal | Límite superior del intervalo al 90% de pobreza_personas_pct, en % |
| `pobreza_personas_cv` | decimal | Coeficiente de variación bootstrap de pobreza_personas_pct, en % |
| `pobreza_hogares_pct` | decimal | Porcentaje estimado de hogares pobres |
| `pobreza_hogares_li` | decimal | Límite inferior del intervalo al 90% de pobreza_hogares_pct, en % |
| `pobreza_hogares_ls` | decimal | Límite superior del intervalo al 90% de pobreza_hogares_pct, en % |
| `indigencia_personas_pct` | decimal | Porcentaje estimado de personas indigentes |
| `indigencia_personas_li` | decimal | Límite inferior del intervalo al 90% de indigencia_personas_pct, en % |
| `indigencia_personas_ls` | decimal | Límite superior del intervalo al 90% de indigencia_personas_pct, en % |
| `personas_pobres` | entero | Cantidad estimada de personas pobres, sobre la población censal |
| `personas_indigentes` | entero | Cantidad estimada de personas indigentes, sobre la población censal |
| `nbi_hogares_pct` | decimal | Porcentaje de hogares con necesidades básicas insatisfechas (Censo 2022) |
| `privacion_convergente_pct` | decimal | Porcentaje de hogares con privación convergente según el IPMH (Censo 2022) |
| `sin_cobertura_salud_pct` | decimal | Porcentaje de personas sin cobertura de salud por obra social, prepaga o plan estatal (Censo 2022) |
| `hacinamiento_pct` | decimal | Porcentaje de hogares con 2 o más personas por cuarto (Censo 2022) |
| `cloaca_pct` | decimal | Porcentaje de hogares con desagüe a red cloacal (Censo 2022) |
| `inquilinos_pct` | decimal | Porcentaje de hogares inquilinos (Censo 2022) |
```

## pobreza/src/diccionario.md#fracciones-censales-del-gba-y-caba

- Rutas: pobreza/diccionario.html
- Fuente: `pobreza/src/diccionario.md`, línea 133, línea 133
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: Como en la página de consultas y en la tabla de las fracciones. diccionario.md lo genera pobreza/scripts/exportar_parquet.py: el mismo cambio va en los dos archivos para que el próximo export no lo pise (si no se quiere tocar el programa, aplicar solo el de diccionario.md y anotarlo como pendiente). Fechas en palabras y dos datos en dos oraciones. diccionario.md lo genera pobreza/scripts/exportar_parquet.py: el mismo cambio va en los dos archivos para que el próximo export no lo pise (si no se quiere tocar el programa, aplicar solo el de diccionario.md y anotarlo como pendiente). Término fijo: CABA. diccionario.md lo genera pobreza/scripts/exportar_parquet.py: el mismo cambio va en los dos archivos para que el próximo export no lo pise (si no se quiere tocar el programa, aplicar solo el de diccionario.md y anotarlo como pendiente).
- Verificación: Comprobado en la página armada: pobreza/diccionario.html.

Original:

```text
**Fracciones censales del GBA y la Ciudad.** El mismo modelo de la tabla gba_partidos_comunas aplicado a cada fracción censal (unidades de unos 3 mil a 20 mil habitantes). Capa exploratoria, sin intervalos de confianza. Período de referencia 1S 2026, población censal 2022.
```

Propuesto:

```text
**Fracciones censales del GBA y CABA.** El mismo modelo de la tabla gba_partidos_comunas aplicado a cada fracción censal (unidades de unos 3 mil a 20 mil habitantes). Capa exploratoria, sin intervalos de confianza. Período de referencia: primer semestre de 2026. Población de referencia: la del Censo 2022.
```

## pobreza/src/diccionario.md#archivo-data-gba_fracciones-parquet

- Rutas: pobreza/diccionario.html
- Fuente: `pobreza/src/diccionario.md`, línea 135, línea 135
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: pobreza/diccionario.html.

Original:

```text
Archivo: `data/gba_fracciones.parquet` (1373 filas).
```

Propuesto: igual al original.

## pobreza/src/diccionario.md#columna-tipo-qué-contiene~6

- Rutas: pobreza/diccionario.html
- Fuente: `pobreza/src/diccionario.md`, línea 137, línea 137
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: Término fijo: CABA (columna unidad de las dos tablas del GBA). diccionario.md lo genera pobreza/scripts/exportar_parquet.py: el mismo cambio va en los dos archivos para que el próximo export no lo pise (si no se quiere tocar el programa, aplicar solo el de diccionario.md y anotarlo como pendiente).
- Verificación: Comprobado en la página armada: pobreza/diccionario.html.

Original:

```text
| Columna | Tipo | Qué contiene |
|---|---|---|
| `periodo` | texto | Semestre de referencia de la estimación (1S 2026) |
| `fraccion` | texto | Código de la fracción censal (7 dígitos: provincia, departamento y fracción) |
| `unidad` | texto | Partido del GBA o comuna de la Ciudad que la contiene |
| `jurisdiccion` | texto | CABA o GBA |
| `zona` | texto | Zona de la unidad que la contiene |
| `poblacion_censo_2022` | entero | Personas según el Censo 2022 |
| `pobreza_personas_pct` | decimal | Porcentaje estimado de personas pobres |
| `indigencia_personas_pct` | decimal | Porcentaje estimado de personas indigentes |
| `sin_cobertura_salud_pct` | decimal | Porcentaje de personas sin cobertura de salud (Censo 2022) |
| `nbi_hogares_pct` | decimal | Porcentaje de hogares con necesidades básicas insatisfechas (Censo 2022) |
```

Propuesto:

```text
| Columna | Tipo | Qué contiene |
|---|---|---|
| `periodo` | texto | Semestre de referencia de la estimación (1S 2026) |
| `fraccion` | texto | Código de la fracción censal (7 dígitos: provincia, departamento y fracción) |
| `unidad` | texto | Partido del GBA o comuna de CABA que la contiene |
| `jurisdiccion` | texto | CABA o GBA |
| `zona` | texto | Zona de la unidad que la contiene |
| `poblacion_censo_2022` | entero | Personas según el Censo 2022 |
| `pobreza_personas_pct` | decimal | Porcentaje estimado de personas pobres |
| `indigencia_personas_pct` | decimal | Porcentaje estimado de personas indigentes |
| `sin_cobertura_salud_pct` | decimal | Porcentaje de personas sin cobertura de salud (Censo 2022) |
| `nbi_hogares_pct` | decimal | Porcentaje de hogares con necesidades básicas insatisfechas (Censo 2022) |
```

## pobreza/src/index.md#title-consultor-de-pobreza-datin

- Rutas: no se encontró en las páginas armadas
- Fuente: `pobreza/src/index.md`, línea 1, línea 1
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: Igual al título del sitio en observablehq.config.js: Framework no lo repite y la pestaña dice 'Consultor de pobreza | Datina'.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
---
title: "Pobreza en la Argentina: consultas"
toc: false
---
```

Propuesto:

```text
---
title: "Consultor de pobreza | Datina"
toc: false
---
```

## pobreza/src/index.md#código1.num1

- Rutas: no se encontró en las páginas armadas
- Fuente: `pobreza/src/index.md`, num1, línea 29
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
sin dato
```

Propuesto: igual al original.

## pobreza/src/index.md#código1.num0

- Rutas: no se encontró en las páginas armadas
- Fuente: `pobreza/src/index.md`, num0, línea 30
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
sin dato
```

Propuesto: igual al original.

## pobreza/src/index.md#código1.semestreLargo

- Rutas: no se encontró en las páginas armadas
- Fuente: `pobreza/src/index.md`, semestreLargo, línea 33
- Tipo: gráfico
- Estado: **reescrito**
- Motivo: Texto nuevo del bloque: reemplaza a uno anterior del mismo archivo.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

(no existe)

Propuesto:

```text
${s === "1" ? "Primer" : "Segundo"} semestre de ${a}
```

## pobreza/src/index.md#código1.botonesCsv.b1

- Rutas: no se encontró en las páginas armadas
- Fuente: `pobreza/src/index.md`, botonesCsv › b1, línea 88
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
<button type="button">Descargar CSV</button>
```

Propuesto: igual al original.

## pobreza/src/index.md#código1.botonesCsv.b2

- Rutas: pobreza/index.html
- Fuente: `pobreza/src/index.md`, botonesCsv › b2, línea 89
- Tipo: gráfico
- Estado: **reescrito**
- Motivo: Dice la otra diferencia de esa versión (csv(): el separador es punto y coma), que explica por qué Excel la abre bien. Se nombra con palabras, sin el signo.
- Verificación: Comprobado en la página armada: pobreza/index.html.

Original:

```text
<button type="button">Descargar CSV para Excel</button>
<div class="descargas">${b1}${b2}<span class="nota">${filas.length.toLocaleString("es-AR")} filas. La versión para Excel usa coma decimal.</span></div>
```

Propuesto:

```text
<button type="button">Descargar CSV para Excel</button>
<div class="descargas">${b1}${b2}<span class="nota">${filas.length.toLocaleString("es-AR")} filas. La versión para Excel separa las columnas con punto y coma y usa coma decimal.</span></div>
```

## pobreza/src/index.md#cuánta-pobreza-hay-en-cada-aglomerado

- Rutas: pobreza/diccionario.html, pobreza/index.html
- Fuente: `pobreza/src/index.md`, línea 105, línea 105
- Tipo: título
- Estado: **reescrito**
- Motivo: Regla del autor: el título de cada página es una pregunta concreta que los datos contestan. Es lo que dice el botón que lleva acá desde Pobreza y hogares ('Consultar pobreza por aglomerado, partido y comuna').
- Verificación: Comprobado en la página armada: pobreza/diccionario.html, pobreza/index.html.

Original:

```text
# Pobreza en la Argentina: consultas
```

Propuesto:

```text
# ¿Cuánta pobreza hay en cada aglomerado, partido y comuna?
```

## pobreza/src/index.md#acá-podés-consultar-filtrar-y-descargar

- Rutas: pobreza/index.html
- Fuente: `pobreza/src/index.md`, línea 107, línea 107
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: La primera oración no tenía verbo y hablaba de un 'tablero' que la página no explica. Ahora dice qué datos hay y qué se puede hacer, y presenta la sigla EPH. Las cifras siguen saliendo de los datos.
- Verificación: Comprobado en la página armada: pobreza/index.html.

Original:

```text
<p class="bajada">Los datos del tablero de pobreza e indigencia, abiertos para consultar, filtrar y descargar. En el primer semestre de 2026, el ${num1(ultimo.pob_per)}% de las personas que viven en los 31 aglomerados urbanos relevados por la EPH estaba bajo la línea de pobreza y el ${num1(ultimo.ind_per)}% bajo la línea de indigencia.</p>
```

Propuesto:

```text
<p class="bajada">Acá podés consultar, filtrar y descargar los datos de pobreza e indigencia de la Encuesta Permanente de Hogares (EPH) del INDEC y las estimaciones por partido del Gran Buenos Aires y comuna de CABA. En el primer semestre de 2026, el ${num1(ultimo.pob_per)}% de las personas que viven en los 31 aglomerados urbanos que releva la EPH estaba bajo la línea de pobreza y el ${num1(ultimo.ind_per)}%, bajo la de indigencia.</p>
```

## pobreza/src/index.md#de-dónde-salen-los-datos-la-serie-n

- Rutas: pobreza/index.html
- Fuente: `pobreza/src/index.md`, línea 109, línea 109
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: Fechas en palabras ('1S 2026' y '2S 2016' eran abreviaturas sin explicar). La sigla EPH ya se presentó en la bajada. 'No mide provincias' pasa a 'no da datos por provincia'.
- Verificación: Comprobado en la página armada: pobreza/index.html.

Original:

```text
**De dónde salen los datos.** La serie nacional, los grupos de edad y los 31 aglomerados vienen de la Encuesta Permanente de Hogares (EPH) del INDEC, informe técnico de pobreza e indigencia del 1S 2026 (datos provisorios) y su anexo de coeficientes de variación. La serie arranca en el 2S 2016. La EPH cubre solo población urbana de 31 aglomerados (unos 30,1 millones de personas) y no mide provincias.
```

Propuesto:

```text
**De dónde salen los datos.** La serie nacional, los grupos de edad y los 31 aglomerados vienen de la EPH del INDEC: del informe técnico de pobreza e indigencia del primer semestre de 2026, con datos provisorios, y de su anexo de coeficientes de variación. La serie empieza en el segundo semestre de 2016. La EPH cubre solo la población urbana de 31 aglomerados, unos 30,1 millones de personas, y no da datos por provincia.
```

## pobreza/src/index.md#las-cifras-por-partido-del-gran-buenos-a

- Rutas: pobreza/index.html
- Fuente: `pobreza/src/index.md`, línea 111, línea 111
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: Fechas en palabras ('1T 2026', '1S 2026'), CABA en lugar de 'la Ciudad' y la explicación del modelo en su propia oración. 'Partidos del GBA' queda: es el nombre del aglomerado del INDEC. Las cifras de calibración siguen escritas a mano, como antes (ver pendientes).
- Verificación: Comprobado en la página armada: pobreza/index.html.

Original:

```text
Las cifras por partido del Gran Buenos Aires, comuna de la Ciudad y fracción censal no son mediciones oficiales. Salen de un modelo de estimación en áreas pequeñas: se estima en los microdatos de la EPH del 1T 2026, se aplica a las características de cada radio del Censo 2022 y se calibra para reproducir el total oficial del 1S 2026 (36,9% de personas pobres en los Partidos del GBA y 11,1% en la Ciudad). Su población de referencia es la censal de 2022.
```

Propuesto:

```text
Las cifras por partido del Gran Buenos Aires, comuna de CABA y fracción censal no son mediciones oficiales. Salen de un modelo de estimación en áreas pequeñas. El modelo se estima con los microdatos de la EPH del primer trimestre de 2026, se aplica a las características de cada radio del Censo 2022 y se calibra para que coincida con el total oficial del primer semestre de 2026: 36,9% de personas pobres en los Partidos del GBA y 11,1% en CABA. La población de referencia es la del Censo 2022.
```

## pobreza/src/index.md#cómo-leer-la-precisión-cada-cifra-de-la

- Rutas: pobreza/index.html
- Fuente: `pobreza/src/index.md`, línea 113, línea 113
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: 'Bootstrap' iba sin explicar y los paréntesis cortaban la oración. El contenido es el mismo.
- Verificación: Comprobado en la página armada: pobreza/index.html.

Original:

```text
<p class="aviso"><strong>Cómo leer la precisión.</strong> Cada cifra de la EPH es una estimación por muestra. El coeficiente de variación (CV) mide su error relativo: el INDEC recomienda leer con cuidado los valores con CV entre 16% y 25% y considera no confiables los que superan 25%. Los intervalos de confianza son al 90% y solo existen para el último semestre (aglomerados) y para partidos y comunas (intervalos bootstrap). Las fracciones censales son una capa exploratoria sin intervalos.</p>
```

Propuesto:

```text
<p class="aviso"><strong>Cómo leer la precisión.</strong> Cada cifra de la EPH es una estimación hecha con una muestra. El coeficiente de variación (CV) mide su error relativo: el INDEC recomienda leer con cuidado los valores con un CV de entre 16% y 25% y considera no confiables los que superan el 25%. Los intervalos de confianza, al 90%, solo están para el último semestre de los aglomerados y para los partidos y las comunas, donde se calcularon por remuestreo (bootstrap). Las fracciones censales son una capa exploratoria, sin intervalos.</p>
```

## pobreza/src/index.md#elegí-una-tabla-y-los-filtros-debajo-de

- Rutas: pobreza/index.html
- Fuente: `pobreza/src/index.md`, línea 117, línea 117
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: Un solo nombre para el editor ('caja de SQL libre', 'editor de SQL' y 'SQL libre' convivían). Explica las abreviaturas 1S y 2S, que siguen en los valores de los datos, en las tablas y en el eje de los gráficos.
- Verificación: Comprobado en la página armada: pobreza/index.html.

Original:

```text
Elegí una tabla y los filtros. Abajo está la consulta SQL que da el mismo resultado: podés copiarla o llevarla a la caja de SQL libre para modificarla.
```

Propuesto:

```text
Elegí una tabla y los filtros. Debajo del resultado está la consulta SQL que lo produce: podés copiarla o llevarla al editor de SQL libre para cambiarla. En las tablas y en los gráficos, 1S y 2S quieren decir primer y segundo semestre.
```

## pobreza/src/index.md#código3.TABLAS_GUIADAS

- Rutas: pobreza/index.html
- Fuente: `pobreza/src/index.md`, TABLAS_GUIADAS, línea 121
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: pobreza/index.html.

Original:

```text
Serie nacional, 31 aglomerados (2S 2016 a 1S 2026)
Aglomerados y regiones, serie por semestre
Aglomerados y regiones, 1S 2026 con CV e intervalos
Grupos de edad, 31 aglomerados
Partidos del GBA y comunas de la Ciudad, 1S 2026 (estimación)
Fracciones censales del GBA y la Ciudad, 1S 2026 (exploratorio)
```

Propuesto:

```text
Serie nacional de los 31 aglomerados, por semestre desde 2016
Aglomerados y regiones, serie por semestre
Aglomerados y regiones, último semestre, con CV e intervalos
Grupos de edad, 31 aglomerados
Partidos del GBA y comunas de CABA, último semestre (estimación)
Fracciones censales del GBA y CABA, último semestre (exploratoria)
```

## pobreza/src/index.md#código3.tabla

- Rutas: no se encontró en las páginas armadas
- Fuente: `pobreza/src/index.md`, tabla, línea 128
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Tabla
```

Propuesto: igual al original.

## pobreza/src/index.md#código4.REGIONES

- Rutas: catalogo.html, construccion.html, curiosidades.html, economia.html, educacion.html, emprendedores.html, empresas.html, pobreza.html, pobreza/diccionario.html, pobreza/index.html, politica.html, relaciones.html, salud.html, trabajo.html
- Fuente: `pobreza/src/index.md`, REGIONES, línea 142
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html, construccion.html, curiosidades.html, economia.html, educacion.html, emprendedores.html y otras.

Original:

```text
Gran Buenos Aires
Cuyo
Noreste
Noroeste
Pampeana
Patagonia
```

Propuesto: igual al original.

## pobreza/src/index.md#código4.ZONAS

- Rutas: pobreza/diccionario.html
- Fuente: `pobreza/src/index.md`, ZONAS, línea 143
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: pobreza/diccionario.html.

Original:

```text
Primera corona
Segunda corona
La Matanza
```

Propuesto: igual al original.

## pobreza/src/index.md#código4.opcionesGrupo

- Rutas: pobreza/diccionario.html
- Fuente: `pobreza/src/index.md`, opcionesGrupo, línea 148
- Tipo: gráfico
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: pobreza/diccionario.html.

Original:

```text
Todos los aglomerados
Las 6 regiones estadísticas
Totales y grupos por tamaño
Aglomerados de la región ${r}
Grupos generales (0 a 14, 15 a 29, 30 a 64, 65 y más)
Niñez y adolescencia (0 a 17 y subgrupos)
Ciudad y conurbano
Solo partidos del GBA
Solo comunas de la Ciudad
Zona ${z}
```

Propuesto:

```text
Todos los aglomerados
Las 6 regiones estadísticas
Totales y grupos por tamaño
Aglomerados de la región ${r}
Grupos generales (0 a 14, 15 a 29, 30 a 64, 65 y más)
Niñez y adolescencia (0 a 17 y subgrupos)
CABA y partidos del GBA
Solo partidos del GBA
Solo comunas de CABA
Zona ${z}
```

## pobreza/src/index.md#código4.etiquetaGrupo

- Rutas: pobreza/index.html
- Fuente: `pobreza/src/index.md`, etiquetaGrupo, línea 162
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: pobreza/index.html.

Original:

```text
Grupos de edad
Zona
Nivel o región
```

Propuesto: igual al original.

## pobreza/src/index.md#código5.indicador

- Rutas: no se encontró en las páginas armadas
- Fuente: `pobreza/src/index.md`, indicador, línea 166
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Pobreza
Indigencia
Indicador
```

Propuesto: igual al original.

## pobreza/src/index.md#código6.unidadInput

- Rutas: no se encontró en las páginas armadas
- Fuente: `pobreza/src/index.md`, unidadInput, línea 171
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Personas
Hogares
Contar
Personas
Hogares
Contar
Personas
Contar
```

Propuesto: igual al original.

## pobreza/src/index.md#código8.periodo

- Rutas: no se encontró en las páginas armadas
- Fuente: `pobreza/src/index.md`, periodo, línea 184
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Todos los semestres
Semestre
Todos los semestres
```

Propuesto: igual al original.

## pobreza/src/index.md#código9.buscar

- Rutas: pobreza/index.html
- Fuente: `pobreza/src/index.md`, buscar, línea 190
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: pobreza/index.html.

Original:

```text
Buscar
Partido, comuna o código de fracción
Nombre, por ejemplo Córdoba o Matanza
```

Propuesto: igual al original.

## pobreza/src/index.md#código10.guiada.unaFecha

- Rutas: no se encontró en las páginas armadas
- Fuente: `pobreza/src/index.md`, guiada › unaFecha, línea 206
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Todos los semestres
```

Propuesto: igual al original.

## pobreza/src/index.md#código10.guiada.mismas

- Rutas: no se encontró en las páginas armadas
- Fuente: `pobreza/src/index.md`, guiada › mismas, línea 222
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
tipo IN ('total', 'interior', 'tamano')
fraccion, unidad, zona, periodo, poblacion_censo_2022,\n  ${indicador}_personas_pct AS valor_pct
```

Propuesto: igual al original.

## pobreza/src/index.md#código12.descripcion.per

- Rutas: pobreza/index.html
- Fuente: `pobreza/src/index.md`, descripcion › per, línea 284
- Tipo: gráfico
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en el navegador el 26 de octubre de 2026: la consulta guiada del consultor de pobreza, con su tabla y su descripción, carga con este texto.

Original:

```text
2S 2016 a 1S 2026
```

Propuesto:

```text
Segundo semestre de 2016 a primer semestre de 2026
Primer semestre de 2026
```

## pobreza/src/index.md#código12.descripcion.pob

- Rutas: no se encontró en las páginas armadas
- Fuente: `pobreza/src/index.md`, descripcion › pob, línea 286
- Tipo: gráfico
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en el navegador el 26 de octubre de 2026: la consulta guiada del consultor de pobreza, con su tabla y su descripción, carga con este texto.

Original:

```text
sobre el total de ${u} de los 31 aglomerados urbanos
sobre el total de ${u} de cada aglomerado, región o total
sobre el total de ${u} de cada aglomerado, región o total
sobre el total de personas de cada grupo de edad, 31 aglomerados urbanos
sobre la población censal 2022 de cada partido o comuna (estimación)
sobre la población censal 2022 de cada fracción (estimación exploratoria)
```

Propuesto:

```text
sobre el total de ${u} de los 31 aglomerados urbanos
sobre el total de ${u} de cada aglomerado, región o total
sobre el total de ${u} de cada aglomerado, región o total
sobre el total de personas de cada grupo de edad, 31 aglomerados urbanos
sobre la población del Censo 2022 de cada partido o comuna (estimación)
sobre la población del Censo 2022 de cada fracción (estimación exploratoria)
```

## pobreza/src/index.md#código12.descripcion.fuente

- Rutas: no se encontró en las páginas armadas
- Fuente: `pobreza/src/index.md`, descripcion › fuente, línea 294
- Tipo: gráfico
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Fuente: estimación en áreas pequeñas sobre INDEC, EPH 1T 2026 y Censo 2022, calibrada al 1S 2026.
Fuente: INDEC, EPH.
```

Propuesto:

```text
Fuente: estimación en áreas pequeñas con datos del INDEC (EPH del primer trimestre de 2026 y Censo 2022), calibrada al primer semestre de 2026.
Fuente: INDEC, Encuesta Permanente de Hogares.
```

## pobreza/src/index.md#código13.graficoGuiado

- Rutas: no se encontró en las páginas armadas
- Fuente: `pobreza/src/index.md`, graficoGuiado, línea 302
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
<p class="nota">No hay filas para graficar con estos filtros.</p>
```

Propuesto: igual al original.

## pobreza/src/index.md#código13.graficoGuiado.etiqueta

- Rutas: provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94
- Fuente: `pobreza/src/index.md`, graficoGuiado › etiqueta, línea 346
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18 y otras.

Original:

```text
Ciudad Autónoma de Buenos Aires
```

Propuesto: igual al original.

## pobreza/src/index.md#código13.graficoGuiado.notas

- Rutas: pobreza/index.html
- Fuente: `pobreza/src/index.md`, graficoGuiado › notas, línea 375
- Tipo: gráfico
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: pobreza/index.html.

Original:

```text
La línea horizontal es el intervalo de confianza al 90%.
En amarillo, estimaciones con CV mayor a 16%: leer con cuidado.
Se muestran las ${tope} filas con mayor valor de un total de ${filas.length.toLocaleString("es-AR")}. La tabla tiene todas.
```

Propuesto:

```text
La línea horizontal es el intervalo de confianza al 90%.
En amarillo, las estimaciones con un CV mayor a 16%, que hay que leer con cuidado.
El gráfico muestra las ${tope} filas con el valor más alto, de un total de ${filas.length.toLocaleString("es-AR")}. La tabla tiene todas.
```

## pobreza/src/index.md#código14.(inicio)

- Rutas: no se encontró en las páginas armadas
- Fuente: `pobreza/src/index.md`, (inicio), línea 384
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
<p class="nota">Para indigencia en partidos y comunas solo hay estimación en personas.</p>
<p class="nota">Las fracciones solo tienen estimación en personas y no tienen intervalos de confianza. Usalas para explorar, no para comparar decimales.</p>
```

Propuesto: igual al original.

## pobreza/src/index.md#código16.encabezadosGuiada.periodo

- Rutas: no se encontró en las páginas armadas
- Fuente: `pobreza/src/index.md`, encabezadosGuiada › periodo, línea 401
- Tipo: gráfico
- Estado: **reescrito**
- Motivo: Texto nuevo del bloque: reemplaza a uno anterior del mismo archivo.
- Verificación: Comprobado en el navegador el 26 de octubre de 2026: la consulta guiada del consultor de pobreza, con su tabla y su descripción, carga con este texto.

Original:

(no existe)

Propuesto:

```text
Período
Año
Semestre (1 o 2)
Indicador
Partido o comuna
Unidad
```

## pobreza/src/index.md#código16.encabezadosGuiada.li_90

- Rutas: pobreza/index.html
- Fuente: `pobreza/src/index.md`, encabezadosGuiada › li_90, línea 403
- Tipo: gráfico
- Estado: **reescrito**
- Motivo: Texto nuevo del bloque: reemplaza a uno anterior del mismo archivo.
- Verificación: Comprobado en la página armada: pobreza/index.html.

Original:

(no existe)

Propuesto:

```text
Mínimo (intervalo al 90%)
Máximo (intervalo al 90%)
Error relativo (CV, %)
```

## pobreza/src/index.md#código16.encabezadosGuiada.nombre

- Rutas: pobreza/diccionario.html, pobreza/index.html
- Fuente: `pobreza/src/index.md`, encabezadosGuiada › nombre, línea 405
- Tipo: gráfico
- Estado: **reescrito**
- Motivo: Texto nuevo del bloque: reemplaza a uno anterior del mismo archivo.
- Verificación: Comprobado en la página armada: pobreza/diccionario.html, pobreza/index.html.

Original:

(no existe)

Propuesto:

```text
Aglomerado, región o total
Aglomerado, región o total
Tipo
Región
Grupo de edad
```

## pobreza/src/index.md#código16.encabezadosGuiada.jurisdiccion

- Rutas: no se encontró en las páginas armadas
- Fuente: `pobreza/src/index.md`, encabezadosGuiada › jurisdiccion, línea 406
- Tipo: gráfico
- Estado: **reescrito**
- Motivo: Texto nuevo del bloque: reemplaza a uno anterior del mismo archivo.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

(no existe)

Propuesto:

```text
Jurisdicción
Zona
Fracción censal
Población (Censo 2022)
```

## pobreza/src/index.md#código16.encabezadosGuiada.personas_pobres

- Rutas: no se encontró en las páginas armadas
- Fuente: `pobreza/src/index.md`, encabezadosGuiada › personas_pobres, línea 407
- Tipo: gráfico
- Estado: **reescrito**
- Motivo: Texto nuevo del bloque: reemplaza a uno anterior del mismo archivo.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

(no existe)

Propuesto:

```text
Personas pobres (estimación)
Personas indigentes (estimación)
```

## pobreza/src/index.md#ver-la-consulta-sql-de-este-resultado

- Rutas: pobreza/index.html
- Fuente: `pobreza/src/index.md`, línea 413, línea 413
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: pobreza/index.html.

Original:

```text
<details>
<summary>Ver la consulta SQL de este resultado</summary>
```

Propuesto: igual al original.

## pobreza/src/index.md#código17.llevar

- Rutas: pobreza/index.html
- Fuente: `pobreza/src/index.md`, llevar, línea 417
- Tipo: gráfico
- Estado: **reescrito**
- Motivo: Un solo nombre para el editor (ver la introducción de la consulta guiada).
- Verificación: Comprobado en la página armada: pobreza/index.html.

Original:

```text
<button type="button">Llevar esta consulta a la caja de SQL libre</button>
```

Propuesto:

```text
<button type="button">Llevar esta consulta al editor de SQL libre</button>
```

## pobreza/src/index.md#escribí-cualquier-consulta-de-duckdb-sob

- Rutas: pobreza/index.html
- Fuente: `pobreza/src/index.md`, línea 427, línea 427
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: pobreza/index.html.

Original:

```text
Escribí cualquier consulta de DuckDB sobre las seis tablas. Todo corre en tu navegador: nada se envía a un servidor. El motor de consultas se baja al abrir el editor, que trae ejemplos para empezar. Los nombres de tablas y columnas están en el [diccionario de datos](./diccionario).
```

Propuesto: igual al original.

## pobreza/src/index.md#código19.EJEMPLOS

- Rutas: no se encontró en las páginas armadas
- Fuente: `pobreza/src/index.md`, EJEMPLOS, línea 440
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Serie nacional de pobreza en personas
-- Pobreza en personas, % del total de personas de los 31 aglomerados, por semestre
SELECT periodo, valor_pct
FROM serie_nacional
WHERE indicador = 'pobreza' AND unidad = 'personas'
ORDER BY anio, semestre
Aglomerados con CV alto
-- Aglomerados cuya pobreza en personas del 1S 2026 tiene CV mayor a 16%
SELECT nombre, region, pobreza_personas_pct, pobreza_personas_cv,
       pobreza_personas_li, pobreza_personas_ls
FROM aglomerados
WHERE tipo = 'aglomerado' AND pobreza_personas_cv > 16
ORDER BY pobreza_personas_cv DESC
Cambio interanual por aglomerado
-- Diferencia en puntos porcentuales de la pobreza en personas entre 1S 2025 y 1S 2026
SELECT a.aglomerado, a.region,
       a.valor_pct AS pobreza_1s2025, b.valor_pct AS pobreza_1s2026,
       round(b.valor_pct - a.valor_pct, 1) AS cambio_pp
FROM aglomerados_serie a
JOIN aglomerados_serie b USING (aglomerado, indicador, unidad)
WHERE a.periodo = '1S 2025' AND b.periodo = '1S 2026'
  AND a.indicador = 'pobreza' AND a.unidad = 'personas' AND a.tipo = 'aglomerado'
ORDER BY cambio_pp DESC
Personas pobres por zona del GBA
-- Personas pobres estimadas por zona, 1S 2026, sobre población del Censo 2022
SELECT zona,
       sum(poblacion_censo_2022) AS poblacion,
       sum(personas_pobres) AS personas_pobres,
       round(100.0 * sum(personas_pobres) / sum(poblacion_censo_2022), 1) AS pobreza_pct
FROM gba_partidos_comunas
GROUP BY zona
ORDER BY pobreza_pct DESC
```

Propuesto: igual al original.

## pobreza/src/index.md#código20.editor.form

- Rutas: no se encontró en las páginas armadas
- Fuente: `pobreza/src/index.md`, editor › form, línea 485
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
<form class="sql-libre">
    <label for="sql-libre-texto" class="nota">Consulta SQL</label>
    <textarea id="sql-libre-texto" name="q" rows="10" spellcheck="false" autocomplete="off" autocapitalize="off"></textarea>
    <div class="acciones"><button type="submit" class="principal">Ejecutar consulta</button><span class="nota">También con Ctrl + Enter</span></div>
  </form>
```

Propuesto: igual al original.

## pobreza/src/index.md#código21.(inicio).b

- Rutas: pobreza/index.html
- Fuente: `pobreza/src/index.md`, (inicio) › b, línea 515
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: pobreza/index.html.

Original:

```text
<button type="button" class="principal">Abrir el editor de SQL</button>
<div class="descargas">${b}<span class="nota">Baja el motor de consultas DuckDB, unos 8 MB. La primera vez puede tardar unos segundos.</span></div>
```

Propuesto: igual al original.

## pobreza/src/index.md#código26.(inicio)

- Rutas: no se encontró en las páginas armadas
- Fuente: `pobreza/src/index.md`, (inicio), línea 583
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: Coma antes de 'pero' y un verbo más común que 'corrió bien'.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
<p class="nota">Escribí una consulta y apretá Ejecutar consulta.</p>
<div class="error-sql"><p><strong>No se pudo ejecutar la consulta.</strong> Revisá la sintaxis y los nombres de tablas y columnas (están en el diccionario de datos). Detalle técnico que devolvió DuckDB, en inglés:</p><code>${resultadoLibre.error}</code></div>
<p class="nota">La consulta corrió bien pero no devolvió filas.</p>
<p class="nota">Resultado en ${num0(resultadoLibre.ms)} milisegundos.</p>
```

Propuesto:

```text
<p class="nota">Escribí una consulta y apretá Ejecutar consulta.</p>
<div class="error-sql"><p><strong>No se pudo ejecutar la consulta.</strong> Revisá la sintaxis y los nombres de tablas y columnas (están en el diccionario de datos). Detalle técnico que devolvió DuckDB, en inglés:</p><code>${resultadoLibre.error}</code></div>
<p class="nota">La consulta funcionó, pero no devolvió ninguna fila.</p>
<p class="nota">Resultado en ${num0(resultadoLibre.ms)} milisegundos.</p>
```

## pobreza/src/index.md#descargar-los-datos

- Rutas: pobreza/index.html
- Fuente: `pobreza/src/index.md`, línea 595, línea 595
- Tipo: título
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: pobreza/index.html.

Original:

```text
## Descargar los datos
```

Propuesto: igual al original.

## pobreza/src/index.md#cada-tabla-está-en-formato-parquet-un-f

- Rutas: pobreza/index.html
- Fuente: `pobreza/src/index.md`, línea 597, línea 597
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: pobreza/index.html.

Original:

```text
Cada tabla está en formato Parquet, un formato abierto y liviano que se lee con DuckDB, R, Python, QGIS o Power BI. El detalle de cada columna está en el [diccionario de datos](./diccionario).
```

Propuesto: igual al original.

## pobreza/src/index.md#código27.ARCHIVOS

- Rutas: pobreza/index.html
- Fuente: `pobreza/src/index.md`, ARCHIVOS, línea 601
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: pobreza/index.html.

Original:

```text
Pobreza e indigencia en personas y hogares, total 31 aglomerados, por semestre desde 2S 2016
Pobreza e indigencia por grupo de edad, total 31 aglomerados, por semestre
Aglomerados, regiones y totales en el 1S 2026, con CV, intervalos al 90% y cantidades
Serie semestral por aglomerado, región y total
Estimación 1S 2026 por partido del GBA y comuna de la Ciudad, con intervalos y datos censales de contexto
Estimación exploratoria 1S 2026 por fracción censal, sin intervalos
```

Propuesto:

```text
Pobreza e indigencia en personas y hogares, total de los 31 aglomerados, por semestre desde el segundo semestre de 2016
Pobreza e indigencia por grupo de edad, total de los 31 aglomerados, por semestre
Aglomerados, regiones y totales en el primer semestre de 2026, con CV, intervalos de confianza al 90% y cantidades
Serie semestral por aglomerado, región y total
Estimación del primer semestre de 2026 por partido del GBA y comuna de CABA, con intervalos y datos del Censo 2022 como contexto
Estimación exploratoria del primer semestre de 2026 por fracción censal, sin intervalos
```

## pobreza/src/index.md#código27.conteos

- Rutas: no se encontró en las páginas armadas
- Fuente: `pobreza/src/index.md`, conteos, línea 609
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
<table class="lista-tablas">
  <thead><tr><th>Tabla</th><th>Qué contiene</th><th style="text-align:right">Filas</th><th>Archivo</th></tr></thead>
  <tbody>${ARCHIVOS.map((a) => html`<tr>
    <td><code>${a.tabla}</code></td>
    <td>${a.que}</td>
    <td style="text-align:right">${num0(conteos[a.tabla])}</td>
    <td><a href=${a.archivo.href} download=${a.tabla + ".parquet"}>${a.tabla}.parquet</a></td>
  </tr>`)}</tbody>
</table>
```

Propuesto: igual al original.

## pobreza/src/index.md#para-leer-un-archivo-con-duckdb-en-tu-co

- Rutas: pobreza/index.html
- Fuente: `pobreza/src/index.md`, línea 620, línea 620
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: pobreza/index.html.

Original:

```text
<p class="nota">Para leer un archivo con DuckDB en tu computadora: <code>SELECT * FROM 'aglomerados.parquet'</code>. En R: <code>arrow::read_parquet("aglomerados.parquet")</code>. En Python: <code>pandas.read_parquet("aglomerados.parquet")</code>.</p>
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.gasto_alumno

- Rutas: a-inversion-aprender.html, catalogo.html, educacion.html
- Fuente: `scripts/02_procesar.py`, CRUCES_META › gasto_alumno, línea 5972
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: a-inversion-aprender.html, catalogo.html, educacion.html.

Original:

```text
"Inversión educativa por alumno"
"pesos por alumno de gestión estatal por año"
"Educación"
"Coordinación de Evaluación de Costos Educativos"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.autonomia_fiscal

- Rutas: a-recursos-empleo.html, catalogo.html, petroleo.html
- Fuente: `scripts/02_procesar.py`, CRUCES_META › autonomia_fiscal, línea 5990
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: a-recursos-empleo.html, catalogo.html, petroleo.html.

Original:

```text
"% de los ingresos totales de la provincia"
"Ministerio de Economía, cuentas provinciales"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.gasto_personal

- Rutas: a-recursos-empleo.html, catalogo.html, petroleo.html
- Fuente: `scripts/02_procesar.py`, CRUCES_META › gasto_personal, línea 5992
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: a-recursos-empleo.html, catalogo.html, petroleo.html.

Original:

```text
"Gasto en personal"
"% del gasto total de la provincia"
"Ministerio de Economía, cuentas provinciales"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.pct_hog_nbi_2022

- Rutas: cruces.html, poblacion.html, pobreza/diccionario.html
- Fuente: `scripts/02_procesar.py`, CRUCES_META › pct_hog_nbi_2022, línea 5995
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: cruces.html, poblacion.html, pobreza/diccionario.html.

Original:

```text
"Hogares con necesidades básicas insatisfechas"
"% de los hogares"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#(módulo)

- Rutas: consulta-ia.html
- Fuente: `scripts/03_construir_sitio.py`, (módulo), línea 50
- Tipo: interno
- Estado: **reescrito**
- Motivo: Ayuda del motor gratis, primera mitad (sigue en la línea siguiente). Eran 47 palabras con cinco ideas en una oración. 'Publica' era ambiguo: Cloudflare aloja el sitio. La advertencia va primero, como en la del motor de Claude. No se nombra el modelo porque DATINA_IA_MODELO_CF lo puede cambiar sin tocar el sitio.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
f"Opción desconocida: {' '.join(_otras)}. Uso: python scripts/03_construir_sitio.py [--con-pobreza]"
"--con-pobreza: no hay un armado del consultor en pobreza/dist (falta index.html). "
             "Armarlo antes con npm run build dentro de pobreza/ (ver pobreza/README.md). El sitio no se armó."
"Las pruebas de los datos encontraron problemas sin explicar: el sitio no se armó. Ver arriba."
"La copia del consultor de pobreza no se comporta como debe: el sitio no se armó.\n"
'datos/manual/sitio.json: "consulta_ia" tiene que ser true o false'
'datos/manual/sitio.json: "consulta_ia_motor" tiene que ser "anthropic" o "cloudflare"'
"falta la sección de las consultas con IA (entre <!--IA--> y <!--/IA-->) en scripts/plantilla.html"
'<p class="bloque-sub">Para cruzar indicadores,'
"cambió la bajada de Herramientas en la portada: revisar la de las consultas con IA"
'<p class="bloque-sub">Para hacerles preguntas a los datos, cruzar indicadores,'
"La pregunta se envía a Anthropic, la empresa del modelo, para contestarla: no escribas datos personales. Datina no la guarda."
"La contesta un modelo que corre en Cloudflare, la empresa que publica el sitio, que no usa las preguntas para entrenar modelos: "
                        "no escribas datos personales. Datina no la guarda. Las consultas son gratis y tienen un tope por día para todo el sitio."
"Las respuestas las escribe un modelo de inteligencia artificial (Claude, de Anthropic) con los datos de Datina."
"Las respuestas las escribe un modelo abierto de inteligencia artificial, en Cloudflare, con los datos de Datina."
f"cambió un aviso de la página de las consultas con IA: {_v[:60]}"
f"ids repetidos en la plantilla: {_rep}"
"Hay años recientes escritos a mano en los textos: quedarían viejos con la próxima actualización. Usar {{ruta}} en la "
             "plantilla o un dato de R en datina.js, o sumarlo a FIJOS si es un hecho fijo:\n"
f"Frecuencia de actualización: faltan {_faltan} y sobran o no tienen frase {_sobran} (FRECUENCIA en 03_construir_sitio.py)."
"datos"
f"{_c}: no es un código de jurisdicción"
"dato"
f"{_c} {_k}: tiene punto y coma o signo de exclamación"
f"{_c} {_k}: tiene {len(_t.split())} palabras (el máximo es 69)"
f"{_c} {_k}: 'y' delante del sonido de la i (va 'e')"
f"{_c} {_k}: no tiene fuente (https) en 'fuentes'"
"La historia de las provincias (datos/manual/provincias_historia.json) tiene problemas: el sitio no se armó.\n"
f"bloque sin página: {b['clases']} {b['id']}"
"no se encontraron los artículos en la plantilla"
f"{m.group(2)}: el texto (p.lead) va después del gráfico"
f"las secciones y los menús no coinciden: {set(ORDEN_TEMAS + list(MENU_DE)) ^ set(_temas)}"
f"herramientas sin menú: {set(HERRAMIENTAS) - set(MENU_DE)}"
"no se encontraron las piezas del Laboratorio para el buscador"
"datos"
"datos"
"EN_CIFRAS"
f"no se encontró {_obj} en datina.js"
f"claves repetidas en {_obj} de datina.js: {_rep}"
"El catálogo de datos tiene problemas: el sitio no se armó.\n"
f"consultas con IA: no se sabe en qué página está {_r} ({_t['tabla']})"
"/*SIN_RELACIONES*/[]"
"/*EN_CATALOGO*/[]"
"no se encontraron las piezas del Laboratorio en la plantilla"
f"la pregunta de ejemplo {_q} ya no está en PREG"
f"{_id}: el dato destacado necesita una cifra destacada (CLAVE)"
f"{_id}: no puede ser un dato destacado o le falta la pregunta fija"
f"{_id}: no es del grupo {_g}"
'datos/manual/sitio.json: "formularios" tiene que ser "netlify" o quedar vacío'
"no se encontró la suscripción del pie en la plantilla"
'<p class="form-nota">El formulario de contacto todavía no está disponible.</p>'
"no se encontró el formulario de Contacto en la plantilla"
"Aviso: gráficos sin data-forma en la plantilla (se ven sin silueta mientras cargan):"
"el perfil tiene indicadores sin tema"
"datos/manual/sitio.json: la dirección tiene que empezar con https://"
"los artículos de datina.js no son los de la plantilla"
f"{titulo} en Datina."
f"{titulo}: {preg} Datos por provincia con su fuente, su año y la tabla para descargar."
"no se encontraron los artículos de series o de las capitales en datina.js"
f"{html.unescape(titulo)} Un cruce de {CRUZA(id_)}, con sus fuentes y sus límites."
f'<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Datina</title>'
        f'<meta name="robots" content="noindex"><link rel="canonical" href="{nuevo}.html">'
        f'<script>location.replace("{nuevo}.html" + location.search + location.hash)</script>'
        f'<noscript><meta http-equiv="refresh" content="0; url={nuevo}.html"></noscript></head>'
        f'<body><p><a href="{nuevo}.html">Esta página se mudó</a></p></body></html>\n'
"El validador del Explorador de relaciones no marcó un error que debía marcar: el sitio no se armó.\n"
"El catálogo del Explorador de relaciones tiene problemas: el sitio no se armó.\n"
"Explorador de relaciones: ¿de dónde sale cada número?"
"Metadatos o enlaces con problemas: el sitio no se dio por armado.\n"
"Encabezados con problemas: el sitio no se dio por armado.\n"
"Navegación con problemas: el sitio no se dio por armado.\n"
"Archivos de más de 25 MB, que Cloudflare Pages no publica: el sitio no se dio por armado.\n"
```

Propuesto:

```text
f"Opción desconocida: {' '.join(_otras)}. Uso: python scripts/03_construir_sitio.py [--con-pobreza]"
"--con-pobreza: no hay un armado del consultor en pobreza/dist (falta index.html). "
             "Armarlo antes con npm run build dentro de pobreza/ (ver pobreza/README.md). El sitio no se armó."
"Las pruebas de los datos encontraron problemas sin explicar: el sitio no se armó. Ver arriba."
"La copia del consultor de pobreza no se comporta como debe: el sitio no se armó.\n"
'datos/manual/sitio.json: "consulta_ia" tiene que ser true o false'
'datos/manual/sitio.json: "consulta_ia_motor" tiene que ser "anthropic" o "cloudflare"'
"falta la sección de las consultas con IA (entre <!--IA--> y <!--/IA-->) en scripts/plantilla.html"
'<p class="bloque-sub">Para cruzar indicadores,'
"cambió la bajada de Herramientas en la portada: revisar la de las consultas con IA"
'<p class="bloque-sub">Para hacerles preguntas a los datos, cruzar indicadores,'
"No escribas datos personales: para contestarla, la pregunta se envía a Anthropic, la empresa que hace el modelo. Datina no la guarda."
"No escribas datos personales. La pregunta la contesta un modelo abierto de inteligencia artificial que corre en Cloudflare, "
                        "la empresa que aloja el sitio. Según su política, Cloudflare no usa las preguntas para entrenar modelos. Datina no las guarda. Las consultas son gratis y tienen un tope diario para todo el sitio."
"Las respuestas las escribe un modelo de inteligencia artificial (Claude, de Anthropic) con los datos de Datina."
"Las respuestas las escribe un modelo de inteligencia artificial con los datos de Datina."
f"cambió un aviso de la página de las consultas con IA: {_v[:60]}"
"falta la marca <!--IA-PRIVACIDAD--> en Tus datos (Sobre nosotros)"
f"ids repetidos en la plantilla: {_rep}"
"Hay años recientes escritos a mano en los textos: quedarían viejos con la próxima actualización. Usar {{ruta}} en la "
             "plantilla o un dato de R en datina.js, o sumarlo a FIJOS si es un hecho fijo:\n"
f"Frecuencia de actualización: faltan {_faltan} y sobran o no tienen frase {_sobran} (FRECUENCIA en 03_construir_sitio.py)."
"datos"
f"{_c}: no es un código de jurisdicción"
"dato"
f"{_c} {_k}: tiene punto y coma o signo de exclamación"
f"{_c} {_k}: tiene {len(_t.split())} palabras (el máximo es 69)"
f"{_c} {_k}: 'y' delante del sonido de la i (va 'e')"
f"{_c} {_k}: no tiene fuente (https) en 'fuentes'"
"La historia de las provincias (datos/manual/provincias_historia.json) tiene problemas: el sitio no se armó.\n"
f"bloque sin página: {b['clases']} {b['id']}"
"no se encontraron los artículos en la plantilla"
f"{m.group(2)}: el texto (p.lead) va después del gráfico"
f"las secciones y los menús no coinciden: {set(ORDEN_TEMAS + list(MENU_DE)) ^ set(_temas)}"
f"herramientas sin menú: {set(HERRAMIENTAS) - set(MENU_DE)}"
"no se encontraron las piezas del Laboratorio para el buscador"
"datos"
"datos"
"EN_CIFRAS"
f"no se encontró {_obj} en datina.js"
f"claves repetidas en {_obj} de datina.js: {_rep}"
"El catálogo de datos tiene problemas: el sitio no se armó.\n"
f"consultas con IA: no se sabe en qué página está {_r} ({_t['tabla']})"
"/*SIN_RELACIONES*/[]"
"/*EN_CATALOGO*/[]"
"no se encontraron las piezas del Laboratorio en la plantilla"
f"la pregunta de ejemplo {_q} ya no está en PREG"
f"{_id}: el dato destacado necesita una cifra destacada (CLAVE)"
f"{_id}: no puede ser un dato destacado o le falta la pregunta fija"
f"{_id}: no es del grupo {_g}"
'datos/manual/sitio.json: "formularios" tiene que ser "netlify" o quedar vacío'
"no se encontró la suscripción del pie en la plantilla"
'<p class="form-nota">El formulario de contacto todavía no está disponible.</p>'
"no se encontró el formulario de Contacto en la plantilla"
r'<p>Los formularios de Contacto y de novedades por correo.*?</p>'
"no se encontró el párrafo de los formularios en Tus datos (Sobre nosotros)"
"Aviso: gráficos sin data-forma en la plantilla (se ven sin silueta mientras cargan):"
"el perfil tiene indicadores sin tema"
"datos/manual/sitio.json: la dirección tiene que empezar con https://"
"los artículos de datina.js no son los de la plantilla"
"Herramienta de Datina con datos públicos de la Argentina y sus 24 jurisdicciones."
"Cada artículo cruza datos oficiales y dice sus fuentes y sus límites."
"Cada dato con su fuente, su período y su tabla para descargar."
f"{titulo} en Datina."
"no se encontraron los artículos de series o de las capitales en datina.js"
f"{html.unescape(titulo)} Compara {CRUZA(id_)} y dice de dónde salen y qué no permiten concluir."
f'<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Datina</title>'
        f'<meta name="robots" content="noindex"><link rel="canonical" href="{nuevo}.html">'
        f'<script>location.replace("{nuevo}.html" + location.search + location.hash)</script>'
        f'<noscript><meta http-equiv="refresh" content="0; url={nuevo}.html"></noscript></head>'
        f'<body><p><a href="{nuevo}.html">Esta página se mudó</a></p></body></html>\n'
"El validador del Explorador de relaciones no marcó un error que debía marcar: el sitio no se armó.\n"
"El catálogo del Explorador de relaciones tiene problemas: el sitio no se armó.\n"
"Explorador de relaciones: ¿de dónde sale cada número?"
"Metadatos o enlaces con problemas: el sitio no se dio por armado.\n"
"Encabezados con problemas: el sitio no se dio por armado.\n"
"Navegación con problemas: el sitio no se dio por armado.\n"
"Archivos de más de 25 MB, que Cloudflare Pages no publica: el sitio no se dio por armado.\n"
```

## scripts/03_construir_sitio.py#NOMBRE_PROV

- Rutas: catalogo.html
- Fuente: `scripts/03_construir_sitio.py`, NOMBRE_PROV, línea 314
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html.

Original:

```text
"datos"
"datos"
"empleo_provincias"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#HAB

- Rutas: catalogo.html
- Fuente: `scripts/03_construir_sitio.py`, HAB, línea 336
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html.

Original:

```text
"datos"
"empleo_provincias"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#DIFERIDAS

- Rutas: catalogo.html
- Fuente: `scripts/03_construir_sitio.py`, DIFERIDAS, línea 553
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html.

Original:

```text
"apoyo_gobierno_provincias"
"transferencias_provincias"
"pozos_no_convencionales"
```

Propuesto: igual al original.

## scripts/catalogo.py#USOS

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/catalogo.py`, USOS, línea 21
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
"datos"
```

Propuesto: igual al original.

## scripts/catalogo.py#COLS_PERIODO

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/catalogo.py`, COLS_PERIODO, línea 25
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
"año"
"mes"
```

Propuesto: igual al original.

## scripts/catalogo.py#COBERTURAS

- Rutas: catalogo.html
- Fuente: `scripts/catalogo.py`, COBERTURAS, línea 28
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html.

Original:

```text
"Países del mundo"
"Total del país"
"Sin desglose territorial"
"sin"
```

Propuesto: igual al original.

## scripts/catalogo.py#VER

- Rutas: catalogo.html
- Fuente: `scripts/catalogo.py`, VER, línea 30
- Tipo: texto de interfaz
- Estado: **conservado deliberadamente**
- Motivo: 'Pieza' es el nombre que el Laboratorio les da a sus gráficos ('Piezas para mirar con tiempo', 'piezas visuales'). El destino es la pieza de la Corte Suprema.
- Verificación: Comprobado en la página armada: catalogo.html.

Original:

```text
"Ver el artículo"
"Ver la ficha"
"Ver la pieza"
"Ver la página"
```

Propuesto: igual al original.

## scripts/catalogo.py#fecha_legible

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/catalogo.py`, fecha_legible, línea 58
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
f"{MESES[int(m.group(2)) - 1]} de {m.group(1)}"
f"{int(m.group(3))} de {mes}"
```

Propuesto: igual al original.

## scripts/catalogo.py#cobertura

- Rutas: catalogo.html
- Fuente: `scripts/catalogo.py`, cobertura, línea 98
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html.

Original:

```text
"Sin desglose territorial"
"Total del país"
"sin"
" y el total del país"
"Las 24 jurisdicciones"
"Países del mundo"
"Sin desglose territorial"
"sin"
```

Propuesto: igual al original.

## scripts/catalogo.py#columnas

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/catalogo.py`, columnas, línea 110
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
"1 código"
"Código"
f"{len(distintos)} códigos"
"año"
"Año"
"Número"
"Vacía"
```

Propuesto: igual al original.

## scripts/catalogo.py#usos_automaticos

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/catalogo.py`, usos_automaticos, línea 145
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
"tabla"
"tabla"
```

Propuesto: igual al original.

## scripts/catalogo.py#ref

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/catalogo.py`, ref, línea 151
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
"provincia"
"provincia.html"
```

Propuesto: igual al original.

## scripts/catalogo.py#tipo_de

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/catalogo.py`, tipo_de, línea 155
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
"provincia"
```

Propuesto: igual al original.

## scripts/catalogo.py#datos_de_usos

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/catalogo.py`, datos_de_usos, línea 181
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
"fuente"
"fuente"
"fuente"
"fuente"
"Tu provincia"
"fuente"
"provincia"
```

Propuesto: igual al original.

## scripts/catalogo.py#validar

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/catalogo.py`, validar, línea 191
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
f"catalogo.json: {t} no es una tabla publicada en sitio/datos/"
f"catalogo.json: {t} no dice dónde se usa (en)"
f"catalogo.json: {t} se usa en {i}, que no existe en la plantilla"
f"catalogo.json: {t} sobra, sus usos ya salen de la plantilla, de datina.js o del Explorador de relaciones"
f"{t}.csv: ninguna ficha, artículo o pieza la usa. Sumar en datos/manual/catalogo.json dónde se usa, con su evidencia, "
                       f"o, si 02_procesar.py ya no la arma, borrar sitio/datos/{t}.csv (02 no borra las tablas que deja de armar)"
```

Propuesto: igual al original.

## scripts/catalogo.py#organismos

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/catalogo.py`, organismos, línea 240
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
"tabla"
"fuente"
"fuente"
```

Propuesto: igual al original.

## scripts/catalogo.py#armar

- Rutas: catalogo.html
- Fuente: `scripts/catalogo.py`, armar, línea 332
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: 'Descargar' como en los demás botones, y el enlace dice qué trae la tabla completa. 'No se dibuja' es lenguaje del programa y 'la acompañan' no dejaba claro qué acompaña a qué. La misma página daba dos reglas de cita distintas (auditoría, catálogo). Ahora el pie dice lo mismo que la introducción y que 'Licencia y reutilización' de Sobre nosotros.
- Verificación: Comprobado en la página armada: catalogo.html.

Original:

```text
"datos"
"tabla_larga"
"fuente"
"Tu provincia"
"provincia"
"provincia"
"Fuente"
"Período"
"fuente"
"Actualización"
"Tamaño"
'<p class="cat-otros">También se usa en '
'<p class="cat-otros">No se dibuja: sus cifras van en el texto de la ficha o la acompañan.</p>'
f'<h3>Cómo se calcula</h3><p class="cat-nota">{e(d["nota"])}</p>'
"tabla"
"fuente"
"fuente"
'<div class="acciones">'
            f'<a class="boton chico accion" href="{ref(prin)}"><span class="lbl">{VER[us[0][1]]}</span></a>'
            f'<button type="button" class="boton chico accion cat-ver" aria-expanded="false" aria-controls="cat-{t}-previa"><span class="lbl">Vista previa</span></button>'
            f'<a class="boton chico accion" href="datos/{t}.csv" download><span class="lbl">Descargar CSV</span></a></div>'
            f'<div class="cat-previa" id="cat-{t}-previa" hidden>'
            f'<div class="cat-filas" data-csv="datos/{t}.csv"></div>'
            f'<h3>Diccionario de variables</h3>'
            f'<div class="tabla-desliza" tabindex="0" role="region" aria-label="Columnas de {t}.csv"><table class="tabla-areas cat-dic">'
            f'<caption class="solo-lector">Columnas de {t}.csv: nombre, tipo y valores</caption>'
            f'<thead><tr><th scope="col">Columna</th><th scope="col">Tipo</th><th scope="col">Valores</th></tr></thead><tbody>{filas_dic}</tbody></table></div>'
            f"{unid}{uso_txt}{compl_txt}{nota}</div></li>"
"datos"
"tabla_larga.csv"
"</div>"
         f'<div class="cat-resumen"><p class="cat-cuenta" id="cat-cuenta" aria-live="polite"><b>{len(items)}</b> tablas</p>'
         '<button type="button" class="boton chico accion" id="cat-limpiar" hidden><span class="lbl">Sacar los filtros</span></button>'
         f'<a class="enlace" href="datos/tabla_larga.csv" download>Bajar la tabla completa (CSV, {tamanio(completa.stat().st_size) if completa.exists() else ""})</a></div>'
         '<p class="cat-vacio" id="cat-vacio" role="status" hidden>Ninguna tabla coincide. Probá con otras palabras o sacá un filtro.</p>'
         f'<ol class="cat-lista" id="cat-lista">{"".join(items)}</ol>'
         '<p class="cat-licencia">Los datos de base son de cada organismo. Al usarlos, citá la fuente que figura en cada tabla.</p></div>'
"Con datos de"
"Cualquier año"
```

Propuesto:

```text
"datos"
"tabla_larga"
"fuente"
"Tu provincia"
"provincia"
"provincia"
"Fuente"
"Período"
"fuente"
"Actualización"
"Tamaño"
'<p class="cat-otros">También se usa en: '
'<p class="cat-otros">No tiene gráfico propio: sus cifras van en el texto de la ficha o la complementan.</p>'
f'<h3>Cómo se calcula</h3><p class="cat-nota">{e(d["nota"])}</p>'
"tabla"
"fuente"
"fuente"
'<div class="acciones">'
            f'<a class="boton chico accion" href="{ref(prin)}"><span class="lbl">{VER[us[0][1]]}</span></a>'
            f'<button type="button" class="boton chico accion cat-ver" aria-expanded="false" aria-controls="cat-{t}-previa"><span class="lbl">Vista previa</span></button>'
            f'<a class="boton chico accion" href="datos/{t}.csv" download><span class="lbl">Descargar CSV</span></a></div>'
            f'<div class="cat-previa" id="cat-{t}-previa" hidden>'
            f'<div class="cat-filas" data-csv="datos/{t}.csv"></div>'
            f'<h3>Diccionario de variables</h3>'
            f'<div class="tabla-desliza" tabindex="0" role="region" aria-label="Columnas de {t}.csv"><table class="tabla-areas cat-dic">'
            f'<caption class="solo-lector">Columnas de {t}.csv: nombre, tipo y valores</caption>'
            f'<thead><tr><th scope="col">Columna</th><th scope="col">Tipo</th><th scope="col">Valores</th></tr></thead><tbody>{filas_dic}</tbody></table></div>'
            f"{unid}{uso_txt}{compl_txt}{nota}</div></li>"
"datos"
"tabla_larga.csv"
"</div>"
         f'<div class="cat-resumen"><p class="cat-cuenta" id="cat-cuenta" aria-live="polite"><b>{len(items)}</b> tablas</p>'
         '<button type="button" class="boton chico accion" id="cat-limpiar" hidden><span class="lbl">Sacar los filtros</span></button>'
         f'<a class="enlace" href="datos/tabla_larga.csv" download>Descargar la tabla completa con todos los indicadores (CSV, {tamanio(completa.stat().st_size) if completa.exists() else ""})</a></div>'
         '<p class="cat-vacio" id="cat-vacio" role="status" hidden>Ninguna tabla coincide. Probá con otras palabras o sacá un filtro.</p>'
         f'<ol class="cat-lista" id="cat-lista">{"".join(items)}</ol>'
         '<p class="cat-licencia">Para reutilizar una tabla, citá a Datina y a la fuente que figura en ella. Los datos de base son de cada organismo y se rigen por sus condiciones.</p></div>'
"Con datos de"
"Cualquier año"
```

## scripts/catalogo.py#(módulo)

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/catalogo.py`, (módulo), línea 361
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
"datos"
"tabla_larga"
"Catálogo de datos con problemas:\n"
f"Catálogo de datos bien: {len(_tablas)} tablas, todas con su uso ({len(_fuera)} de suicidio quedan afuera)"
```

Propuesto: igual al original.

## scripts/consulta_ia.js#(inicio).NO_DISPONIBLE

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/consulta_ia.js`, (inicio) › NO_DISPONIBLE, línea 23
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Las consultas con IA no están disponibles en este momento. Probá más tarde.
```

Propuesto: igual al original.

## scripts/consulta_ia.js#(inicio).CORTADA

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/consulta_ia.js`, (inicio) › CORTADA, línea 24
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
La respuesta se cortó antes de terminar. No uses lo que llegó a escribirse: probá de nuevo.
```

Propuesto: igual al original.

## scripts/consulta_ia.js#(inicio).q

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/consulta_ia.js`, (inicio) › q, línea 35
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Tu pregunta quedó escrita. Tocá Preguntar para enviarla.
```

Propuesto: igual al original.

## scripts/consulta_ia.js#(inicio).agregar

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/consulta_ia.js`, (inicio) › agregar, línea 59
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Escribiendo la respuesta…
```

Propuesto: igual al original.

## scripts/consulta_ia.js#(inicio).mostrarFuentes

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/consulta_ia.js`, (inicio) › mostrarFuentes, línea 77
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
datos/${f.tabla}.csv
```

Propuesto: igual al original.

## scripts/consulta_ia.js#(inicio).TARDA

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/consulta_ia.js`, (inicio) › TARDA, línea 91
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
La consulta tardó demasiado. Probá de nuevo o con una pregunta más acotada.
```

Propuesto: igual al original.

## scripts/consulta_ia.js#(inicio).terminar

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/consulta_ia.js`, (inicio) › terminar, línea 92
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
No se pudo contestar
Respuesta lista.
Escribí una pregunta de al menos tres letras.
Respuesta
Buscando en los datos de Datina…
Buscando más datos…
La detuviste antes de que terminara.
Consulta detenida
```

Propuesto: igual al original.

## scripts/datina.js#TEC_CEN.eolica

- Rutas: catalogo.html, energia.html
- Fuente: `scripts/datina.js`, TEC_CEN › eolica, línea 273
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html, energia.html.

Original:

```text
Eólica
Solar
Biomasa y biogás
```

Propuesto: igual al original.

## scripts/datina.js#SERIES_CUENCA

- Rutas: catalogo.html, petroleo.html
- Fuente: `scripts/datina.js`, SERIES_CUENCA, línea 2722
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html, petroleo.html.

Original:

```text
Cuyana
Noroeste
Austral
Golfo San Jorge
Neuquina
```

Propuesto: igual al original.

## scripts/datina.js#tipJuez

- Rutas: catalogo.html
- Fuente: `scripts/datina.js`, tipJuez, línea 3804
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html.

Original:

```text
<b>${j.nombre}</b><br>${mayus(coAnios(j))}, ${n1(j.anios)} años<br>Designación de ${j.designado_por}
<br>Segunda designación
```

Propuesto: igual al original.

## scripts/datina.js#ART_SERIE.id

- Rutas: a-alquiler-pobreza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-pobreza-desocupacion.html, articulos.html, catalogo.html
- Fuente: `scripts/datina.js`, ART_SERIE › id, línea 7492
- Tipo: artículo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: a-alquiler-pobreza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-pobreza-desocupacion.html, articulos.html y otras.

Original:

```text
Se actualiza cada trimestre
Se actualiza cada mes
Se actualiza cada mes
Se actualiza cada trimestre
```

Propuesto: igual al original.

## scripts/datina.js#ART_SERIE.dek

- Rutas: articulos.html, catalogo.html
- Fuente: `scripts/datina.js`, ART_SERIE › dek, línea 7493
- Tipo: artículo
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: articulos.html, catalogo.html.

Original:

```text
El dólar en términos reales, la inversión en máquinas importadas y en construcción, lo que cuesta construir medido en dólares y las compras de dólares de personas y empresas.
Cuántos turistas extranjeros llegan y cuántos residentes viajan al exterior, mes por mes, frente al dólar en términos reales.
El precio de la nafta súper en el surtidor medido en dólares al tipo de cambio oficial, frente al precio internacional del petróleo.
Las cantidades que exporta el país, sin el efecto de los precios, por gran rubro y trimestre por trimestre, frente al dólar en términos reales.
```

Propuesto:

```text
El dólar en términos reales, trimestre por trimestre, frente a lo que se invierte en máquinas importadas y en construcción. También muestra lo que cuesta construir medido en dólares y las compras de dólares de personas y empresas.
Cuántos turistas extranjeros llegan y cuántos residentes viajan al exterior, mes por mes, frente al dólar en términos reales.
El precio de la nafta súper en el surtidor medido en dólares al tipo de cambio oficial, frente al precio internacional del petróleo.
Las cantidades que exporta el país, sin el efecto de los precios, por gran rubro y trimestre por trimestre, frente al dólar en términos reales.
```

## scripts/datina.js#SERIE_CIFRA.x-hurtos

- Rutas: catalogo.html, seguridad.html
- Fuente: `scripts/datina.js`, SERIE_CIFRA › x-hurtos, línea 7927
- Tipo: cifra destacada
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html, seguridad.html.

Original:

```text
Hurtos registrados cada 100.000 habitantes
```

Propuesto: igual al original.

## scripts/datina.js#SERIE_CIFRA.x-indigencia

- Rutas: catalogo.html, pobreza.html
- Fuente: `scripts/datina.js`, SERIE_CIFRA › x-indigencia, línea 7974
- Tipo: cifra destacada
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html, pobreza.html.

Original:

```text
Indigencia en los 31 aglomerados urbanos, por semestre
```

Propuesto: igual al original.

## scripts/datina.js#SERIE_CIFRA.x-nacimientos

- Rutas: catalogo.html, poblacion.html
- Fuente: `scripts/datina.js`, SERIE_CIFRA › x-nacimientos, línea 7987
- Tipo: cifra destacada
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html, poblacion.html.

Original:

```text
Nacimientos por año
```

Propuesto: igual al original.

## scripts/datina.js#mostrarHistoria.vistaPrevia

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, mostrarHistoria › vistaPrevia, línea 8654
- Tipo: gráfico
- Estado: **reescrito**
- Motivo: Dice cómo probar de nuevo: el código vuelve a pedir la tabla al abrir otra vez la vista previa.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
<p class="nota" role="status">Cargando las primeras filas…</p>
Primeras ${muestra.length} de ${n0(total)} filas de ${nombre}
Vista previa de ${nombre}
<p class="nota" role="status">No se pudo cargar la vista previa. Probá de nuevo.</p>
```

Propuesto:

```text
<p class="nota" role="status">Cargando las primeras filas…</p>
Primeras ${muestra.length} de ${n0(total)} filas de ${nombre}
Vista previa de ${nombre}
<p class="nota" role="status">No se pudo cargar la vista previa. Cerrala y volvé a abrirla para probar de nuevo.</p>
```

## scripts/plantilla.html#catalogo/h2

- Rutas: catalogo.html
- Fuente: `scripts/plantilla.html`, catalogo > h2, línea 2421
- Tipo: título
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
Catálogo de datos
```

Propuesto: igual al original.

## scripts/plantilla.html#catalogo/p.pregunta

- Rutas: catalogo.html
- Fuente: `scripts/plantilla.html`, catalogo > p.pregunta, línea 2423
- Tipo: pregunta de página
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html.

Original:

```text
¿Qué datos puedo bajar?
```

Propuesto: igual al original.

## scripts/plantilla.html#catalogo/p

- Rutas: catalogo.html
- Fuente: `scripts/plantilla.html`, catalogo > p, línea 2424
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: La introducción tenía dos frases sin verbo ('Cada tabla de Datina con...', 'Y la tabla completa...'). Ahora son oraciones completas, suman las columnas (que el catálogo muestra en el diccionario de cada tabla) y usan 'descargar', el verbo de todos los botones.
- Verificación: Comprobado en la página armada: catalogo.html.

Original:

```text
Cada tabla de Datina con su fuente, su período y su cobertura, para saber qué trae antes de bajarla. Y la tabla completa, con todos los indicadores en un solo archivo. Se pueden reutilizar citando a Datina y a la fuente de cada una (<a href="nosotros.html#licencia">licencia</a>).
```

Propuesto:

```text
Acá están las tablas de Datina, cada una con su fuente, su período, su cobertura y sus columnas, para saber qué trae antes de descargarla. También podés descargar la tabla completa, con todos los indicadores en un solo archivo. Las tablas se pueden reutilizar citando a Datina y a la fuente de cada una (<a href="nosotros.html#licencia">licencia</a>).
```

## scripts/plantilla.html#consulta-ia/h2

- Rutas: consulta-ia.html
- Fuente: `scripts/plantilla.html`, consulta-ia > h2, línea 2436
- Tipo: título
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
Consultas con IA
```

Propuesto: igual al original.

## scripts/plantilla.html#consulta-ia/p.pregunta

- Rutas: consulta-ia.html
- Fuente: `scripts/plantilla.html`, consulta-ia > p.pregunta, línea 2438
- Tipo: pregunta de página
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: consulta-ia.html.

Original:

```text
¿Qué querés saber de los datos?
```

Propuesto: igual al original.

## scripts/plantilla.html#consulta-ia/p

- Rutas: consulta-ia.html
- Fuente: `scripts/plantilla.html`, consulta-ia > p, línea 2439
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: La página no dice 'de qué ficha sale cada cifra': muestra al pie la lista de fichas cuyas tablas leyó (Fichas consultadas), y con el motor gratis el modelo puede no usar todas. El texto nuevo describe lo que hace y parte la oración larga.
- Verificación: Comprobado en la página armada: consulta-ia.html.

Original:

```text
Escribí una pregunta sobre la Argentina o sobre una provincia. Un modelo de inteligencia artificial la contesta solo con las tablas de Datina y dice de qué ficha sale cada cifra, para que la puedas verificar.
```

Propuesto:

```text
Escribí una pregunta sobre la Argentina o sobre una provincia. Un modelo de inteligencia artificial la contesta solo con las tablas de Datina. Debajo de la respuesta aparecen las fichas que se consultaron para contestar, para que puedas verificar cada cifra.
```

## scripts/plantilla.html#ia-form/label.campo

- Rutas: consulta-ia.html
- Fuente: `scripts/plantilla.html`, ia-form > label.campo, línea 2443
- Tipo: etiqueta de control
- Estado: **pendiente de verificación factual**
- Motivo: Decisión del autor (PLAN_MEJORA.md, sección 13, punto 11). Propuesta: Un ejemplo solo en este campo: 'Por ejemplo: ¿cuánto se gana en Neuquén?' (una pregunta que el motor gratis ya contestó bien en la prueba del 26 de octubre de 2026).
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
<span>Tu pregunta</span><textarea id="ia-pregunta" name="q" rows="3" minlength="3" maxlength="400" required
          aria-describedby="ia-ayuda" placeholder="Una pregunta sobre la Argentina o una provincia"></textarea>
```

Propuesto: igual al original.

## scripts/plantilla.html#ia-pregunta/textarea@placeholder

- Rutas: consulta-ia.html
- Fuente: `scripts/plantilla.html`, ia-pregunta > textarea [placeholder], línea 2443
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: consulta-ia.html.

Original:

```text
Una pregunta sobre la Argentina o una provincia
```

Propuesto: igual al original.

## scripts/plantilla.html#ia-ayuda/p.form-nota

- Rutas: consulta-ia.html
- Fuente: `scripts/plantilla.html`, ia-ayuda > p.form-nota, línea 2445
- Tipo: nota metodológica
- Estado: **reescrito**
- Motivo: La advertencia va primero y cada idea en su oración. Es el aviso del motor de Claude: 03 lo busca literal para cambiarlo por el del motor de Cloudflare, así que va junto con el cambio de 03_construir_sitio.py que sigue.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Hasta 400 caracteres. La pregunta se envía a Anthropic, la empresa del modelo, para contestarla: no escribas datos personales. Datina no la guarda.
```

Propuesto:

```text
Hasta 400 caracteres. No escribas datos personales: para contestarla, la pregunta se envía a Anthropic, la empresa que hace el modelo. Datina no la guarda.
```

## scripts/plantilla.html#ia-enviar/button.boton.principal

- Rutas: consulta-ia.html
- Fuente: `scripts/plantilla.html`, ia-enviar > button.boton.principal, línea 2447
- Tipo: botón
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
<span class="ia-lbl"><span class="ia-e activa" data-e="listo">Preguntar</span><span
          class="ia-e" data-e="trabaja">Detener</span></span>
```

Propuesto: igual al original.

## scripts/plantilla.html#ia-respuesta-tit/h2.ia-tit

- Rutas: consulta-ia.html
- Fuente: `scripts/plantilla.html`, ia-respuesta-tit > h2.ia-tit, línea 2452
- Tipo: título
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Respuesta
```

Propuesto: igual al original.

## scripts/plantilla.html#ia-respuesta/p.ia-salida-p

- Rutas: consulta-ia.html
- Fuente: `scripts/plantilla.html`, ia-respuesta > p.ia-salida-p, línea 2455
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: consulta-ia.html.

Original:

```text
<a class="enlace" id="ia-salida" href="catalogo.html" hidden>Buscar en el Catálogo de datos</a>
```

Propuesto: igual al original.

## scripts/plantilla.html#ia-fuentes/h3.ia-tit

- Rutas: consulta-ia.html
- Fuente: `scripts/plantilla.html`, ia-fuentes > h3.ia-tit, línea 2457
- Tipo: título
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: consulta-ia.html.

Original:

```text
Fichas consultadas
```

Propuesto: igual al original.

## scripts/plantilla.html#ia/p.form-nota.ia-aviso

- Rutas: consulta-ia.html
- Fuente: `scripts/plantilla.html`, ia > p.form-nota.ia-aviso, línea 2461
- Tipo: nota metodológica
- Estado: **conservado deliberadamente**
- Motivo: Aviso del motor de Claude: claro, y 03 busca literal su primera oración. Para el motor de Cloudflare se cambia solo el reemplazo en 03.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
Las respuestas las escribe un modelo de inteligencia artificial (Claude, de Anthropic) con los datos de Datina. Puede equivocarse: revisá cada cifra en su ficha antes de usarla.
```

Propuesto: igual al original.

## scripts/relaciones.html#pagina/title

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, emprendedores.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, politica.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94, relaciones.html, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/relaciones.html`, pagina > title, línea 6
- Tipo: SEO
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
Explorador de relaciones | Datina
```

Propuesto: igual al original.

## scripts/relaciones.html#pagina/meta@content

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, pagina > meta [content], línea 7
- Tipo: SEO
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
De dónde sale cada número de Datina: qué organismo publica cada dato, qué archivo baja el sitio y qué fichas arma con él, con la evidencia en el código.
```

Propuesto: igual al original.

## scripts/relaciones.html#relaciones/li

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, relaciones > li, línea 30
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
<a href="./">Datina</a>
```

Propuesto: igual al original.

## scripts/relaciones.html#relaciones/li~2

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, relaciones > li, línea 30
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
<span>Herramientas</span>
```

Propuesto: igual al original.

## scripts/relaciones.html#relaciones/nav.migas@aria-label

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, relaciones > nav.migas [aria-label], línea 30
- Tipo: accesibilidad
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Ubicación
```

Propuesto: igual al original.

## scripts/relaciones.html#relaciones/h1

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, relaciones > h1, línea 31
- Tipo: título de página
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
Explorador de relaciones
```

Propuesto: igual al original.

## scripts/relaciones.html#relaciones/p.pregunta

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, relaciones > p.pregunta, línea 33
- Tipo: pregunta de página
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
¿De dónde sale cada número?
```

Propuesto: igual al original.

## scripts/relaciones.html#relaciones/p

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, relaciones > p, línea 34
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Qué organismo publica cada dato, qué archivo baja Datina y qué fichas arma con él. Cada relación tiene su evidencia: la línea del programa del sitio que la muestra.
```

Propuesto:

```text
Acá se ve qué organismo publica cada dato, qué archivo baja Datina y qué fichas arma con él. Cada relación trae su evidencia: la línea del código del sitio que la confirma.
```

## scripts/relaciones.html#rx-muestra/p.rx-aviso

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-muestra > p.rx-aviso, línea 37
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Es una muestra: todavía no están todas las fichas del sitio.
```

Propuesto: igual al original.

## scripts/relaciones.html#relaciones/div.rx-controles@aria-label

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, relaciones > div.rx-controles [aria-label], línea 39
- Tipo: accesibilidad
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Buscar y filtrar
```

Propuesto: igual al original.

## scripts/relaciones.html#relaciones/label.cx-campo.rx-buscar

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, relaciones > label.cx-campo.rx-buscar, línea 40
- Tipo: etiqueta de control
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
<span>Buscar</span>
      <input type="search" id="rx-buscar" placeholder="Un organismo, un archivo o una ficha: INDEC, snic, homicidios" autocomplete="off" spellcheck="false">
```

Propuesto: igual al original.

## scripts/relaciones.html#rx-buscar/input@placeholder

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-buscar > input [placeholder], línea 41
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Un organismo, un archivo o una ficha: INDEC, snic, homicidios
```

Propuesto: igual al original.

## scripts/relaciones.html#relaciones/label.cx-campo

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, relaciones > label.cx-campo, línea 43
- Tipo: etiqueta de control
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, cruces.html y otras.

Original:

```text
<span>Tema</span><select id="rx-tema"><option value="">Todos los temas</option></select>
```

Propuesto: igual al original.

## scripts/relaciones.html#relaciones/label.cx-campo~2

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, relaciones > label.cx-campo, línea 44
- Tipo: etiqueta de control
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
<span>Organismo</span><select id="rx-fuente"><option value="">Todos los organismos</option></select>
```

Propuesto: igual al original.

## scripts/relaciones.html#relaciones/legend

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, relaciones > legend, línea 46
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Mostrar
```

Propuesto: igual al original.

## scripts/relaciones.html#relaciones/button.rx-tipo

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, relaciones > button.rx-tipo, línea 47
- Tipo: botón
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
<svg viewBox="-8 -8 16 16" aria-hidden="true"><circle r="6"/></svg>Organismos
```

Propuesto: igual al original.

## scripts/relaciones.html#relaciones/button.rx-tipo~2

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, relaciones > button.rx-tipo, línea 48
- Tipo: botón
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
<svg viewBox="-8 -8 16 16" aria-hidden="true"><rect x="-5.5" y="-5.5" width="11" height="11"/></svg>Archivos
```

Propuesto: igual al original.

## scripts/relaciones.html#relaciones/button.rx-tipo~3

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, relaciones > button.rx-tipo, línea 49
- Tipo: botón
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
<svg viewBox="-8 -8 16 16" aria-hidden="true"><path d="M0-7L7 0 0 7-7 0Z"/></svg>Fichas
```

Propuesto: igual al original.

## scripts/relaciones.html#rx-vista/div.conmutador@aria-label

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-vista > div.conmutador [aria-label], línea 54
- Tipo: accesibilidad
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Vista
```

Propuesto: igual al original.

## scripts/relaciones.html#rx-vista/button

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-vista > button, línea 55
- Tipo: botón
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Grafo
```

Propuesto: igual al original.

## scripts/relaciones.html#rx-vista/button~2

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-vista > button, línea 56
- Tipo: botón
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Tabla
```

Propuesto: igual al original.

## scripts/relaciones.html#rx-grafo/div.rx-zoom@aria-label

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-grafo > div.rx-zoom [aria-label], línea 64
- Tipo: accesibilidad
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Acercar y alejar
```

Propuesto: igual al original.

## scripts/relaciones.html#rx-mas/button.boton.chico@aria-label

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-mas > button.boton.chico [aria-label], línea 65
- Tipo: accesibilidad
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Acercar
```

Propuesto: igual al original.

## scripts/relaciones.html#rx-menos/button.boton.chico@aria-label

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-menos > button.boton.chico [aria-label], línea 66
- Tipo: accesibilidad
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Alejar
```

Propuesto: igual al original.

## scripts/relaciones.html#rx-centrar/button.boton.chico

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-centrar > button.boton.chico, línea 67
- Tipo: botón
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Centrar
```

Propuesto: igual al original.

## scripts/relaciones.html#rx-centrar/button.boton.chico@aria-label

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-centrar > button.boton.chico [aria-label], línea 67
- Tipo: accesibilidad
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Centrar en lo elegido
```

Propuesto: igual al original.

## scripts/relaciones.html#rx-reset/button.boton.chico

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-reset > button.boton.chico, línea 68
- Tipo: botón
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Inicio
```

Propuesto: igual al original.

## scripts/relaciones.html#rx-reset/button.boton.chico@aria-label

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-reset > button.boton.chico [aria-label], línea 68
- Tipo: accesibilidad
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Inicio: volver a la vista inicial
```

Propuesto: igual al original.

## scripts/relaciones.html#rx-svg/svg@aria-label

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-svg > svg [aria-label], línea 70
- Tipo: accesibilidad
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Grafo de organismos, archivos y fichas
```

Propuesto: igual al original.

## scripts/relaciones.html#rx-ayuda-grafo/p.rx-ayuda

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-ayuda-grafo > p.rx-ayuda, línea 73
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: Una oración por forma de uso (auditoría: 46 palabras con tres formas de uso mezcladas). 'De dónde sale y a qué lleva' es lo que muestra el panel.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Tocá un punto para ver de dónde sale. Arrastrá para moverte, y acercá con los botones o con Ctrl y la rueda. Con el teclado: las flechas recorren los puntos, Enter elige, + y − acercan y alejan. La vista Tabla muestra lo mismo en filas.
```

Propuesto:

```text
Tocá un punto para ver de dónde sale y a qué lleva. Para moverte, arrastrá el dibujo. Para acercar o alejar, usá los botones o Ctrl y la rueda del mouse. Con el teclado, las flechas recorren los puntos, Enter elige uno, + acerca y − aleja. La vista Tabla muestra lo mismo en filas.
```

## scripts/relaciones.html#rx-tabla/caption.rx-oculto

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-tabla > caption.rx-oculto, línea 79
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Organismos, archivos y fichas con sus relaciones
```

Propuesto: igual al original.

## scripts/relaciones.html#rx-tabla/th

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-tabla > th, línea 80
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Tipo
```

Propuesto: igual al original.

## scripts/relaciones.html#rx-tabla/th~2

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-tabla > th, línea 80
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Nombre
```

Propuesto: igual al original.

## scripts/relaciones.html#rx-tabla/th~3

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-tabla > th, línea 80
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Tema
```

Propuesto: igual al original.

## scripts/relaciones.html#rx-tabla/th~4

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-tabla > th, línea 80
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Viene de
```

Propuesto: igual al original.

## scripts/relaciones.html#rx-tabla/th~5

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-tabla > th, línea 80
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Lleva a
```

Propuesto: igual al original.

## scripts/relaciones.html#rx-cuerpo/ul.rx-leyenda@aria-label

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-cuerpo > ul.rx-leyenda [aria-label], línea 85
- Tipo: accesibilidad
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Qué es cada forma
```

Propuesto: igual al original.

## scripts/relaciones.html#rx-cuerpo/li

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-cuerpo > li, línea 86
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
<svg viewBox="-8 -8 16 16" aria-hidden="true"><circle r="6" class="rx-n-fuente"/></svg>Organismo que publica
```

Propuesto: igual al original.

## scripts/relaciones.html#rx-cuerpo/li~2

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-cuerpo > li, línea 87
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
<svg viewBox="-8 -8 16 16" aria-hidden="true"><rect x="-5.5" y="-5.5" width="11" height="11" class="rx-n-conjunto"/></svg>Archivo que baja o arma Datina
```

Propuesto: igual al original.

## scripts/relaciones.html#rx-cuerpo/li~3

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-cuerpo > li, línea 88
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
<svg viewBox="-8 -8 16 16" aria-hidden="true"><path d="M0-7L7 0 0 7-7 0Z" class="rx-n-indicador"/></svg>Ficha del sitio
```

Propuesto: igual al original.

## scripts/relaciones.html#rx-cuerpo/li~4

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-cuerpo > li, línea 89
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
<svg viewBox="0 0 28 10" aria-hidden="true"><path d="M1 5H27" class="rx-l-calcula"/></svg>Se calcula a partir de otra ficha
```

Propuesto: igual al original.

## scripts/relaciones.html#rx-cerrar/button.rx-cerrar@aria-label

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-cerrar > button.rx-cerrar [aria-label], línea 95
- Tipo: accesibilidad
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Cerrar el detalle
```

Propuesto: igual al original.

## scripts/relaciones.html#rx-def-tit/h2

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-def-tit > h2, línea 104
- Tipo: título
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Qué es una relación acá
```

Propuesto:

```text
Qué significa cada relación
```

## scripts/relaciones.html#rx-definiciones/dd

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-definiciones > dd, línea 106
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: 'Sale de' no tenía sujeto claro. Ahora es paralela a la definición de 'Alimenta' ('La evidencia es la línea que lo lee').
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
El organismo publica el archivo que baja Datina. Sale de la dirección de descarga o del programa que arma el archivo.
```

Propuesto:

```text
El organismo publica el archivo que baja Datina. La evidencia es la dirección de descarga o el programa que arma el archivo.
```

## scripts/relaciones.html#rx-definiciones/dt

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-definiciones > dt, línea 106
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Publica
```

Propuesto: igual al original.

## scripts/relaciones.html#rx-definiciones/dd~2

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-definiciones > dd, línea 107
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Un programa del sitio lee el archivo para armar la tabla de la ficha. La evidencia es la línea que lo lee.
```

Propuesto: igual al original.

## scripts/relaciones.html#rx-definiciones/dt~2

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-definiciones > dt, línea 107
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Alimenta
```

Propuesto: igual al original.

## scripts/relaciones.html#rx-definiciones/dd~3

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-definiciones > dd, línea 108
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
La cifra de una ficha usa la de otra ficha del sitio.
```

Propuesto: igual al original.

## scripts/relaciones.html#rx-definiciones/dt~3

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-definiciones > dt, línea 108
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Se calcula a partir de
```

Propuesto: igual al original.

## scripts/relaciones.html#rx-definiciones/p

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.html`, rx-definiciones > p, línea 110
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: 'Para eso están Cruces y los artículos' sugería que esas páginas muestran si un indicador influye en otro: muestran si van juntos, y aclaran que eso no prueba una causa. La tercera oración se entendía al revés.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Qué no muestra: si un indicador influye en otro o si dos indicadores van juntos. Para eso están <a class="enlace" href="cruces.html">Cruces</a> y los <a class="enlace" href="articulos.html">artículos</a>. Dos fichas del mismo tema no quedan unidas por eso. Las fichas sobre suicidios no están en el explorador.
```

Propuesto:

```text
Qué no muestra: si un indicador influye en otro ni si dos indicadores van juntos. Para ver si van juntos están <a class="enlace" href="cruces.html">Cruces</a> y los <a class="enlace" href="articulos.html">artículos</a>. Que dos fichas sean del mismo tema no las une en el explorador. Las fichas sobre suicidio no están en el explorador.
```

## scripts/relaciones.js#(inicio).raiz

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/relaciones.js`, (inicio) › raiz, línea 12
- Tipo: texto de interfaz
- Estado: **conservado deliberadamente**
- Motivo: Claro, y scripts/prueba_fallas.mjs busca 'No se pudo cargar el programa'.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
No se pudo cargar el programa que dibuja el explorador. Probá recargar la página.
```

Propuesto: igual al original.

## scripts/relaciones.js#(inicio).TIPO_NOMBRE

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/relaciones.js`, (inicio) › TIPO_NOMBRE, línea 21
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Organismo
Archivo
Ficha
```

Propuesto: igual al original.

## scripts/relaciones.js#(inicio).conSigla

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/relaciones.js`, (inicio) › conSigla, línea 34
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: Texto nuevo del bloque: reemplaza a uno anterior del mismo archivo.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

(no existe)

Propuesto:

```text
(^|[^a-z0-9])${sinTildes(n.sigla).replace(/[^a-z0-9 ]/g, "\\$&")}($|[^a-z0-9])
```

## scripts/relaciones.js#(inicio).fecha

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/relaciones.js`, (inicio) › fecha, línea 41
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
${+m[3]} de ${MESES[m[2] - 1]} de ${m[1]}
```

Propuesto: igual al original.

## scripts/relaciones.js#(inicio).D

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/relaciones.js`, (inicio) › D, línea 54
- Tipo: interno
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
Explorador de relaciones:
Algunos datos del explorador vinieron incompletos y no se pudo dibujar todo. La tabla puede seguir sirviendo.
No se pudieron cargar los datos del explorador. Probá recargar la página.
```

Propuesto:

```text
Explorador de relaciones:
Algunos datos del explorador llegaron incompletos y no se pudo dibujar todo. La vista Tabla puede funcionar igual.
No se pudieron cargar los datos del explorador. Probá recargar la página.
```

## scripts/relaciones.js#(inicio).contar

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/relaciones.js`, (inicio) › contar, línea 125
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
${plural(k, "resultado", "resultados")} para «${E.q}», entre ${t}
Ningún resultado para «${E.q}»
```

Propuesto: igual al original.

## scripts/relaciones.js#(inicio).vacio

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/relaciones.js`, (inicio) › vacio, línea 141
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
No hay nada para mostrar con estos filtros. Probá con otro tema u organismo.
Ningún organismo, archivo ni ficha coincide con «${E.q}». Probá con otra palabra o sacá los filtros.
```

Propuesto: igual al original.

## scripts/relaciones.js#(inicio).elegir

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/relaciones.js`, (inicio) › elegir, línea 300
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
${TIPO_NOMBRE[n.tipo]} ${ELEGIDO[n.tipo]}: ${n.nombre}. ${plural(rel, "relación", "relaciones")}. El detalle está a continuación: apretá Tab.
```

Propuesto: igual al original.

## scripts/relaciones.js#(inicio).ev

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/relaciones.js`, (inicio) › ev, línea 305
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
<div class="rx-ev"><p>${esc(e.archivo)}, línea ${esc(e.linea)}</p><code>${esc(e.texto)}</code></div>
```

Propuesto: igual al original.

## scripts/relaciones.js#(inicio).panel

- Rutas: relaciones.html
- Fuente: `scripts/relaciones.js`, (inicio) › panel, línea 316
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: relaciones.html.

Original:

```text
Ir al detalle de ${n.nombre}
Saltar la tabla
Detalle
Elegí un punto o una fila
<p class="rx-p-vacio">Acá aparece de dónde sale y a qué lleva cada organismo, archivo o ficha, con la evidencia de cada relación.</p>
<h3>Publica ${a.length === 1 ? "un archivo que usa" : a.length + " archivos que usa"} Datina</h3><ul>${a.map(x => `<li>${ir(x.a)}</li>`).join("")}</ul>
<h3>Fichas que usan sus datos (${fichas.length})</h3><ul>${ordenados(fichas).map(x => `<li>${ir(x.id)}</li>`).join("")}</ul>
<h3>Alimenta ${a.length === 1 ? "una ficha" : a.length + " fichas"}</h3><ul>${a.map(x => `<li>${ir(x.a)}${x.evidencia.map(ev).join("")}</li>`).join("")}</ul>
<h3>De dónde salen sus datos</h3><ul>${arch.map(x => { const c = porId.get(x.de); return `<li>${ir(x.de)}${c.fuente && porId.has(c.fuente) ? `<p class="rx-nota">Lo publica ${ir(c.fuente)}</p>` : ""}${x.evidencia.map(ev).join("")}</li>`; }).join("")}</ul>
<h3>Se calcula a partir de</h3><ul>${calc.map(x => `<li>${ir(x.de)}${x.evidencia.map(ev).join("")}</li>`).join("")}</ul>
<h3>Se usa para calcular</h3><ul>${usa.map(x => `<li>${ir(x.a)}</li>`).join("")}</ul>
<a class="boton chico" href="${esc(c)}" download>Descargar ${esc(String(c).replace(/^datos\//, ""))}</a>
```

Propuesto: igual al original.

## scripts/relaciones.js#(inicio).encuadrarResultados

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/relaciones.js`, (inicio) › encuadrarResultados, línea 475
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Sin elegir.
```

Propuesto: igual al original.

## scripts/relaciones.js#(inicio).dibujarTabla

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/relaciones.js`, (inicio) › dibujarTabla, línea 506
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Mostrar la última fila
Mostrar las ${resto} filas que quedan
Mostrar ${PASO_FILAS} filas más (quedan ${resto})
```

Propuesto: igual al original.

## scripts/relaciones.js#(inicio).mostrarVista

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/relaciones.js`, (inicio) › mostrarVista, línea 549
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Tiene que quedar al menos un tipo a la vista.
```

Propuesto: igual al original.

## scripts/relaciones.py#CATALOGO

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/relaciones.py`, CATALOGO, línea 18
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
"datos"
```

Propuesto: igual al original.

## scripts/relaciones.py#TIPOS_ARISTA

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/relaciones.py`, TIPOS_ARISTA, línea 19
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
"fuente"
```

Propuesto: igual al original.

## scripts/relaciones.py#_ubicar

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/relaciones.py`, _ubicar, línea 62
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
f"no existe el archivo {ev['archivo']}"
f"el texto {ev['contiene']!r} no está en ninguna línea de {ev['archivo']}"
```

Propuesto: igual al original.

## scripts/relaciones.py#norm

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/relaciones.py`, norm, línea 95
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
"áéíóúüñ"
```

Propuesto: igual al original.

## scripts/relaciones.py#validar

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/relaciones.py`, validar, línea 151
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
f"el catálogo no tiene la lista '{k}'"
"fuente"
r"org:[a-z0-9-]+"
f"id de {tipo} inválido: {i!r}"
f"{i}: falta el nombre"
f"{f.get('id')}: 'alias' tiene que ser una lista"
"fuente"
"fuente"
f"{i}: su fuente {c.get('fuente')!r} no está en el catálogo (todo conjunto tiene una fuente)"
f"{i}: falta la ruta"
f"{i}: ningún archivo coincide con {ruta}"
f"{i}: no existe {ruta}"
f"fichas: {f} no es una ficha de la plantilla que entra en el explorador"
f"relación {a.get('de')} -> {a.get('a')}"
f"{d}: tipo {tipo!r} (en el catálogo solo van 'alimenta' y 'calcula': 'publica' sale de la fuente de cada conjunto)"
f"{d}: '{tipo}' va de un {esperado[0]} a un {esperado[1]} que estén en el catálogo"
" (las fichas de suicidio y las herramientas no entran)"
f"{d}: une un nodo consigo mismo"
f"{d}: falta la evidencia"
f"relación repetida: {r}"
f"{c.get('id')}: conjunto que no alimenta ninguna ficha"
"fuente"
f"{f.get('id')}: fuente que no publica ningún conjunto"
"hay un ciclo en las relaciones 'se calcula a partir de'"
f"alcance: {f} no es una ficha que entre en el explorador"
f"{f}: ninguna relación dice de dónde salen sus datos"
f"{f}: no se encontró su título (ni en la plantilla ni en TX de datina.js): sumarlo en fichas.{f}.nombre"
"fuente"
f"{f}: su pie ({pie.group(1)[:80]}) no nombra a ninguno de sus organismos {sorted(orgs)}: sumar el nombre como alias"
```

Propuesto: igual al original.

## scripts/relaciones.py#COLS_PERIODO

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/relaciones.py`, COLS_PERIODO, línea 220
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
"año"
"mes"
```

Propuesto: igual al original.

## scripts/relaciones.py#describir_tabla

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, emprendedores.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, politica.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/relaciones.py`, describir_tabla, línea 234
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
"Las 24 jurisdicciones"
"Total del país"
" y el total del país"
```

Propuesto: igual al original.

## scripts/relaciones.py#publicar

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/relaciones.py`, publicar, línea 253
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: Lo ve la persona en 'Cómo llega'. 'Repositorio' es jerga de quien programa, y la otra opción ('Se descarga en la actualización mensual') es una oración con verbo: ahora las dos responden igual a 'Cómo llega'.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
"datos"
"tabla_larga.csv"
"datos"
"fuente"
"fuente"
"fuente"
"Se descarga en la actualización mensual"
"datos/crudo/"
"Archivo armado a mano o una sola vez por un programa del repositorio"
"fuente"
"fuente_texto"
"fuente"
```

Propuesto:

```text
"datos"
"tabla_larga.csv"
"datos"
"fuente"
"fuente"
"fuente"
"Se descarga en la actualización mensual"
"datos/crudo/"
"Se armó a mano o una sola vez con un programa del sitio"
"fuente"
"fuente_texto"
"fuente"
```

## scripts/relaciones.py#construir

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/relaciones.py`, construir, línea 345
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
"datos"
"__V_RX_DATOS__"
f"falta {marca_} en scripts/relaciones.html"
```

Propuesto: igual al original.

## scripts/relaciones.py#(módulo)

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/relaciones.py`, (módulo), línea 357
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
"Catálogo de relaciones con problemas:\n"
f"Catálogo de relaciones bien: {len(_cat['fuentes'])} fuentes, {len(_cat['conjuntos'])} conjuntos, {len(_ar)} relaciones con evidencia"
f", muestra de {len(_cat['alcance'])} fichas"
```

Propuesto: igual al original.
