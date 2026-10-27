# Inventario de textos: Portada, navegación y piezas comunes

Generado por `scripts/inventario_textos.py`. 557 piezas: 461 revisado sin cambios, 48 reescrito, 48 conservado deliberadamente.

Cada pieza tiene su identificador (archivo#ubicación), las rutas donde se ve, el tipo, el texto original y el propuesto completos, el estado, el motivo y la verificación en las páginas armadas. Una plantilla dinámica se muestra tal como está escrita, con sus `${...}`: sus variantes se comprueban en el volcado de cada ficha.

## datos/manual/catalogo.json#_leeme

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/catalogo.json`, _leeme
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
Catálogo de datos (scripts/catalogo.py). Las tablas publicadas que ninguna ficha ofrece en su pie ni nombra el Explorador de relaciones: en qué ficha, artículo o pieza se usan (en), con la evidencia en el código (un texto exacto de una línea del archivo citado). complementaria: la tabla no se dibuja, sus cifras van en el texto de la ficha o acompañan a la pieza. Las tablas que ya enlaza una ficha, un artículo o el Explorador no van acá: el validador las marca como sobrantes.
```

Propuesto: igual al original.

## datos/manual/catalogo.json#tablas/areas_serie/evidencia/contiene

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/catalogo.json`, tablas/areas_serie/evidencia/contiene
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
MED.arArea ? ["areas_produccion", "areas_serie"] : ["areas_produccion"], a =>
```

Propuesto: igual al original.

## datos/manual/catalogo.json#tablas/argentinos_exterior/evidencia/contiene

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/catalogo.json`, tablas/argentinos_exterior/evidencia/contiene
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
lineas(el, {anim: a, data: T.argentinos_exterior, x: "anio", y0: 0, vf: n0, yf:
```

Propuesto: igual al original.

## datos/manual/catalogo.json#tablas/carceles_provincias/evidencia/contiene

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/catalogo.json`, tablas/carceles_provincias/evidencia/contiene
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
const el = G("carceles"), fp = T.carceles_provincias.find(r => r.codigo_indec === prov);
```

Propuesto: igual al original.

## datos/manual/catalogo.json#tablas/corte_jueces_fuentes/evidencia/contiene

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/catalogo.json`, tablas/corte_jueces_fuentes/evidencia/contiene
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
class="boton chico accion" href="datos/corte_jueces_fuentes.csv" download>Jueces, con fuentes y
```

Propuesto: igual al original.

## datos/manual/catalogo.json#tablas/corte_no_asumieron/evidencia/contiene

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/catalogo.json`, tablas/corte_no_asumieron/evidencia/contiene
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
cna.to_csv(SITIO / "corte_no_asumieron.csv", index=False
```

Propuesto: igual al original.

## datos/manual/catalogo.json#tablas/costo_anual/evidencia/contiene

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/catalogo.json`, tablas/costo_anual/evidencia/contiene
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
de cada año y el último mes", T.costo_anual.map(r => [r.periodo.endsWith("-12")
```

Propuesto: igual al original.

## datos/manual/catalogo.json#tablas/cruces_series/evidencia/contiene

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/catalogo.json`, tablas/cruces_series/evidencia/contiene
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
Promise.resolve(SERIES_CRU) : d3.csv("datos/cruces_series.csv", d3.autoType).then(filas => {
```

Propuesto: igual al original.

## datos/manual/catalogo.json#tablas/curvas_vm/evidencia/contiene

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/catalogo.json`, tablas/curvas_vm/evidencia/contiene
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
lineas(G("productividad"), {anim: a, data: T.curvas_vm, x: "mes", y0: 0, vf: v => n0(v)
```

Propuesto: igual al original.

## datos/manual/catalogo.json#tablas/delitos_serie/evidencia/contiene

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/catalogo.json`, tablas/delitos_serie/evidencia/contiene
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
return lineas(el, {anim: a, data: T.delitos_serie, x: "anio", y0: 0, vf: n0, yf:
```

Propuesto: igual al original.

## datos/manual/catalogo.json#tablas/diseno_pozos_vm/evidencia/contiene

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/catalogo.json`, tablas/diseno_pozos_vm/evidencia/contiene
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
{anim: a, cadaTick: 2, l: 46, data: T.diseno_pozos_vm.filter(r => r.anio >= PG.dv_ini),
```

Propuesto: igual al original.

## datos/manual/catalogo.json#tablas/electricidad_mensual/evidencia/contiene

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/catalogo.json`, tablas/electricidad_mensual/evidencia/contiene
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
conTablas("electricidad-provincias", () => ({mes: ["electricidad_mensual"], serie: ["electricidad_serie"]})[MED["electricidad-provincias"]]
```

Propuesto: igual al original.

## datos/manual/catalogo.json#tablas/electricidad_serie/evidencia/contiene

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/catalogo.json`, tablas/electricidad_serie/evidencia/contiene
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
["electricidad_mensual"], serie: ["electricidad_serie"]})[MED["electricidad-provincias"]]
```

Propuesto: igual al original.

## datos/manual/catalogo.json#tablas/empleo_construccion_serie/evidencia/contiene

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/catalogo.json`, tablas/empleo_construccion_serie/evidencia/contiene
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
MED["empleo-hidro"] === "serie" ? ["empleo_construccion_serie"] : [], a => {
```

Propuesto: igual al original.

## datos/manual/catalogo.json#tablas/gas_usuario_mensual/evidencia/contiene

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/catalogo.json`, tablas/gas_usuario_mensual/evidencia/contiene
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
conTablas("gas-consumo", () => ({mes: ["gas_usuario_mensual"], serie: ["gas_usuario_serie"]})[MED["gas-consumo"]]
```

Propuesto: igual al original.

## datos/manual/catalogo.json#tablas/gasto_nacion_tipo/evidencia/contiene

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/catalogo.json`, tablas/gasto_nacion_tipo/evidencia/contiene
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
return barrasH(el, {anim: a, data: T.gasto_nacion_tipo.map((r, i) => ({codigo_indec:
```

Propuesto: igual al original.

## datos/manual/catalogo.json#tablas/hidrocarburos_anual/evidencia/contiene

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/catalogo.json`, tablas/hidrocarburos_anual/evidencia/contiene
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
por día, promedio de cada año", T.hidrocarburos_anual.map(r => [r.anio, r.pet_total]),
```

Propuesto: igual al original.

## datos/manual/catalogo.json#tablas/isac_anual/evidencia/contiene

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/catalogo.json`, tablas/isac_anual/evidencia/contiene
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
cada año, índice 2004 = 100", T.isac_anual.map(r => [r.anio, r.isac]), n1),
```

Propuesto: igual al original.

## datos/manual/catalogo.json#tablas/ministros_provincias/evidencia/contiene

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/catalogo.json`, tablas/ministros_provincias/evidencia/contiene
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
barrasH(G("ministros"), {anim: a, data: T.ministros_provincias, k: "ministros", vf: n0, af: n0});
```

Propuesto: igual al original.

## datos/manual/catalogo.json#tablas/mundo_paises/evidencia/contiene

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/catalogo.json`, tablas/mundo_paises/evidencia/contiene
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
const cerca = (k, v) => T.mundo_paises.filter(p => p[k] != null).sort((a,
```

Propuesto: igual al original.

## datos/manual/catalogo.json#tablas/obra_publica_serie/evidencia/contiene

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/catalogo.json`, tablas/obra_publica_serie/evidencia/contiene
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
pesos de ${CN.op_ult}`, data: T.obra_publica_serie});
```

Propuesto: igual al original.

## datos/manual/catalogo.json#tablas/pesca_continental/evidencia/contiene

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/catalogo.json`, tablas/pesca_continental/evidencia/contiene
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
barrasH(G("pesca-rio"), {anim:a, data: T.pesca_continental, k:"toneladas", vf: v => n0(v)
```

Propuesto: igual al original.

## datos/manual/catalogo.json#tablas/pozos_provincias/evidencia/contiene

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/catalogo.json`, tablas/pozos_provincias/evidencia/contiene
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
const p = T.pozos_provincias.find(r => r.territorio === PG.pozos_top)
```

Propuesto: igual al original.

## datos/manual/catalogo.json#tablas/pozos_terminados_provincias/evidencia/contiene

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/catalogo.json`, tablas/pozos_terminados_provincias/evidencia/contiene
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
(T.pozos_terminados_provincias.some(r => r.codigo_indec === "mar")
```

Propuesto: igual al original.

## datos/manual/catalogo.json#tablas/radicaciones_anual/evidencia/contiene

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/catalogo.json`, tablas/radicaciones_anual/evidencia/contiene
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
columnasApiladas(el, {anim: a, data: T.radicaciones_anual, vf: n0, af: v => n0(v / 1e3)
```

Propuesto: igual al original.

## datos/manual/catalogo.json#tablas/recaudacion_anual/evidencia/contiene

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/catalogo.json`, tablas/recaudacion_anual/evidencia/contiene
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
return lineas(el, {anim: a, data: T.recaudacion_anual, x: "anio", y0: 0, vf: pct, yf:
```

Propuesto: igual al original.

## datos/manual/catalogo.json#tablas/salarios_serie/evidencia/contiene

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/catalogo.json`, tablas/salarios_serie/evidencia/contiene
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
() => MED.salarios === "mes" ? ["salarios_serie"] : [], a => {
```

Propuesto: igual al original.

## datos/manual/catalogo.json#tablas/seguridad_serie_prov/evidencia/contiene

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/catalogo.json`, tablas/seguridad_serie_prov/evidencia/contiene
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
() => MED.robos === "serie" ? ["seguridad_serie_prov"] : [], a => {
```

Propuesto: igual al original.

## datos/manual/catalogo.json#tablas/supermercados_mensual/evidencia/contiene

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/catalogo.json`, tablas/supermercados_mensual/evidencia/contiene
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
MED.supermercados === "mes" ? ["supermercados_mensual"] : [], a => {
```

Propuesto: igual al original.

## datos/manual/catalogo.json#tablas/vivienda_departamentos/evidencia/contiene

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/catalogo.json`, tablas/vivienda_departamentos/evidencia/contiene
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
MED["gas-hogares-vista"] === "mapa" ? ["vivienda_departamentos"] : [], a => {
```

Propuesto: igual al original.

## datos/manual/corte_casos.csv#2014/notas

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/corte_casos.csv`, 2014 › notas, línea 2
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Anuario Estadístico 2025 de la Oficina de Estadísticas de la CSJN, página 3 (serie de casos ingresados 2014-2025) y página 14 (serie de casos resueltos 2014-2025). Valores leídos de las etiquetas de los gráficos. La resta coincide con el "stock anual de casos" del mismo gráfico (-7.020).
```

Propuesto: igual al original.

## datos/manual/corte_casos.csv#2015/notas

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/corte_casos.csv`, 2015 › notas, línea 3
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Anuario Estadístico 2025, páginas 3 y 14. Stock del gráfico: -1.685.
```

Propuesto: igual al original.

## datos/manual/corte_casos.csv#2016/notas

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/corte_casos.csv`, 2016 › notas, línea 4
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Anuario Estadístico 2025, páginas 3 y 14. Stock del gráfico: 2.447.
```

Propuesto: igual al original.

## datos/manual/corte_casos.csv#2017/notas

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/corte_casos.csv`, 2017 › notas, línea 5
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Anuario Estadístico 2025, páginas 3 y 14. Stock del gráfico: 5.217.
```

Propuesto: igual al original.

## datos/manual/corte_casos.csv#2018/notas

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/corte_casos.csv`, 2018 › notas, línea 6
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Anuario Estadístico 2025, páginas 3 y 14. El texto de la página 14 lo da como el mínimo de la serie (7.278 casos). Stock del gráfico: 20.759. Una nota de 2019 del Centro de Información Judicial informaba otras cifras para 2018 (7.843 causas resueltas), con otro método: no se usan.
```

Propuesto: igual al original.

## datos/manual/corte_casos.csv#2019/notas

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/corte_casos.csv`, 2019 › notas, línea 7
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Anuario Estadístico 2025, páginas 3 y 14. El texto de la página 14 lo da como el máximo de la serie (26.608 casos). Stock del gráfico: -2.943.
```

Propuesto: igual al original.

## datos/manual/corte_casos.csv#2020/notas

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/corte_casos.csv`, 2020 › notas, línea 8
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Anuario Estadístico 2025, páginas 3 y 14. Stock del gráfico: 4.218.
```

Propuesto: igual al original.

## datos/manual/corte_casos.csv#2021/notas

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/corte_casos.csv`, 2021 › notas, línea 9
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Anuario Estadístico 2025, páginas 3 y 14. Stock del gráfico: 5.411.
```

Propuesto: igual al original.

## datos/manual/corte_casos.csv#2022/notas

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/corte_casos.csv`, 2022 › notas, línea 10
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Anuario Estadístico 2025, páginas 3 y 14. Stock del gráfico y del texto: 10.917.
```

Propuesto: igual al original.

## datos/manual/corte_casos.csv#2023/notas

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/corte_casos.csv`, 2023 › notas, línea 11
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Anuario Estadístico 2025, páginas 3 y 14. Stock del gráfico y del texto: 15.344.
```

Propuesto: igual al original.

## datos/manual/corte_casos.csv#2024/notas

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/corte_casos.csv`, 2024 › notas, línea 12
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Ingresados y resueltos: Anuario Estadístico 2025, páginas 3 y 14 (stock 26.622), iguales a los del resumen ejecutivo del Anuario 2024 (páginas 2 y 6). Fallos y acuerdos: resumen ejecutivo del Anuario 2024, página 6 ("La cantidad total de fallos dictados por la CSJN en 2024 fue de 12.521 y tuvieron impacto sobre 20.237 casos", "Se celebraron 47 acuerdos"). Previsional: página 3 ("El 68,3% de los ingresos se radicó en la Secretaría nº 2 -Previsional-").
```

Propuesto: igual al original.

## datos/manual/corte_casos.csv#2025/notas

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/corte_casos.csv`, 2025 › notas, línea 13
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Anuario Estadístico 2025: ingresados, página 3 ("En 2025 ingresaron a la CSJN 58.424 casos"), resueltos, página 14 ("En 2025 se resolvieron 26.524 casos"), fallos y acuerdos, página 15 ("En 2025 se celebraron 46 acuerdos de ministros en los que se dictaron un total de 15.652 fallos"), previsional, página 5 (Secretaría Nº 2 Previsional, 71,56% de los ingresos, 41.806 casos).
```

Propuesto: igual al original.

## datos/manual/corte_tamano.csv#1853-05-01/notas

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/corte_tamano.csv`, 1853-05-01 › notas, línea 2
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Texto: "una Corte suprema de justicia, compuesta de nueve jueces y dos fiscales". La fecha es la de sanción de la Constitución. El texto citado es una transcripción no oficial (Wikisource). La CSJN (La Corte que no fue) confirma la cantidad fija de nueve ministros y que esa Corte, cuyos miembros Urquiza designó en 1854, nunca llegó a constituirse.
```

Propuesto: igual al original.

## datos/manual/corte_tamano.csv#1860-09-23/notas

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/corte_tamano.csv`, 1860-09-23 › notas, línea 3
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
La reforma sacó el número de jueces de la Constitución y lo dejó a la ley (CSJN). Texto vigente, artículo 108: "una Corte Suprema de Justicia, y por los demás tribunales inferiores que el Congreso estableciere". Sin cantidad fijada hasta la ley 27. El texto de la reforma de 1860 citado es una copia no oficial.
```

Propuesto: igual al original.

## datos/manual/corte_tamano.csv#1862-10-16/notas

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/corte_tamano.csv`, 1862-10-16 › notas, línea 4
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Sancionada el 13/10/1862 y promulgada el 16/10/1862 (InfoLEG), publicada en el Registro Nacional porque el Boletín Oficial no existía. Texto: "una Corte Suprema de Justicia, compuesta de cinco Ministros y un Procurador General". La Corte se instaló el 15/1/1863 y funcionó con cuatro jueces hasta junio de 1865 porque Valentín Alsina no aceptó. Dos páginas de la CSJN dan distintas fechas para la ley (13 y 16/10/1862): son la sanción y la promulgación. Entre 1950 y 1958 rigió además la ley 13.998 de organización de la Justicia Nacional, que el decreto-ley 1285/58 derogó (artículo 67): no se verificó si fijaba el número de jueces.
```

Propuesto: igual al original.

## datos/manual/corte_tamano.csv#1958-02-07/notas

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/corte_tamano.csv`, 1958-02-07 › notas, línea 5
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Gobierno de facto de Aramburu. Fechado el 4/2/1958 y publicado en el Boletín Oficial el 7/2/1958 (número 18.581). Texto: "La Corte Suprema de Justicia estará compuesta por cinco jueces y un procurador general". No cambió la cantidad. Es el artículo que modificaron todas las leyes posteriores.
```

Propuesto: igual al original.

## datos/manual/corte_tamano.csv#1960-02-09/notas

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/corte_tamano.csv`, 1960-02-09 › notas, línea 6
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Sancionada el 3/2/1960, promulgada el 4/2/1960 y publicada en el Boletín Oficial el 9/2/1960 (número 19.156). Texto del resumen de InfoLEG: "Auméntanse a siete jueces y un Procurador General los miembros de la Corte Suprema de Justicia". El anexo de Wikipedia la fecha por error en octubre de 1958. Los dos cargos nuevos se cubrieron con Ricardo Colombres y Pedro Aberastury (decreto 1466 del 8/2/1960).
```

Propuesto: igual al original.

## datos/manual/corte_tamano.csv#1966-07-07/notas

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/corte_tamano.csv`, 1966-07-07 › notas, línea 7
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Dictada por el gobierno de facto de Onganía el 5/7/1966 y publicada en el Boletín Oficial el 7/7/1966 (número 20.978). Texto: "La Corte Suprema de Justicia de la Nación estará compuesta por cinco jueces y un procurador general". La Corte de siete había sido cesada por el decreto 3 del 28/6/1966 y los cinco nuevos jueces fueron designados por el decreto 42 del 4/7/1966, antes de la publicación de esta ley.
```

Propuesto: igual al original.

## datos/manual/corte_tamano.csv#1990-04-16/notas

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/corte_tamano.csv`, 1990-04-16 › notas, línea 8
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Sancionada el 5/4/1990, promulgada el 11/4/1990 y publicada en el Boletín Oficial el 16/4/1990 (número 26.864). Texto: "La CORTE SUPREMA DE JUSTICIA DE LA NACION estará compuesta por nueve jueces". Desde 2005 dos cargos quedaron sin cubrir (renuncia de Belluscio y remoción de Boggiano).
```

Propuesto: igual al original.

## datos/manual/corte_tamano.csv#2006-12-18/notas

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/corte_tamano.csv`, 2006-12-18 › notas, línea 9
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Sancionada el 29/11/2006, promulgada el 15/12/2006 y publicada en el Boletín Oficial el 18/12/2006 (número 31.055). Artículo 2: "La Corte Suprema de Justicia de la Nación estará compuesta por CINCO (5) jueces". Reducción gradual (artículo 3): desde la vigencia de la ley, SIETE (7) jueces de manera transitoria (los que había en funciones, porque los cargos de Belluscio y Boggiano no se habían cubierto). Con la siguiente vacante definitiva, SEIS (6): la muerte de Carmen Argibay el 10/5/2014. Con la siguiente, CINCO (5): la muerte de Enrique Petracchi el 12/10/2014. La ley no fija su fecha de vigencia: aquí va la de publicación. Después la Corte tuvo en algunos períodos menos jueces que los cinco de la ley: cuatro desde el 31/12/2014 (renuncia de Zaffaroni) y tres desde el 11/12/2015 (renuncia de Fayt), hasta las juras de Rosatti (29/6/2016) y Rosenkrantz (22/8/2016). Cuatro desde el 1/11/2021 (renuncia de Highton) y tres desde el 29/12/2024 (cese de Maqueda), salvo entre el 27/2/2025 y el 7/4/2025, cuando integró la Corte García-Mansilla. En octubre de 2026 la integran tres jueces: Rosatti, Rosenkrantz y Lorenzetti (CSJN). Ninguna ley cambió el número después de 2006: el proyecto que la llevaba a 15 jueces tuvo media sanción del Senado en 2022 y Diputados no lo trató.
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#02/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/cortes_provinciales.csv`, 02 › nota, línea 2
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Texto consolidado de la Ley 7 en Juristeca (Consejo de la Magistratura de la Ciudad).
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#06/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/cortes_provinciales.csv`, 06 › nota, línea 3
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
La Constitución provincial no fija el número. El Procurador General actúa ante la Corte y no se cuenta.
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#10/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/cortes_provinciales.csv`, 10 › nota, línea 4
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Leída en la Memoria 2020 del Poder Judicial de Catamarca.
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#14/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/cortes_provinciales.csv`, 14 › nota, línea 5
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
El artículo está citado textualmente en el Acuerdo 1495 Serie A del 23 de diciembre de 2025.
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#18/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/cortes_provinciales.csv`, 18 › nota, línea 6
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Texto actualizado en el portal de normativa de la Nación (SAIJ). Rige desde el Boletín Oficial del 30 de mayo de 2000. La Constitución (artículo 178) deja el número a la ley.
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#22/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/cortes_provinciales.csv`, 22 › nota, línea 7
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Según un extracto de la Ley Orgánica del Poder Judicial (artículo 16) en una copia del INECIP, cinco miembros además del Procurador General. No se leyó el texto oficial.
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#26/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/cortes_provinciales.csv`, 26 › nota, línea 8
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Leída en el digesto del Chubut. La Ley V N.º 200 se promulgó el 9 de enero de 2025. Antes, la Ley V N.º 3 también fijaba seis. La Constitución (artículo 163) permite de tres a seis.
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#30/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/cortes_provinciales.csv`, 30 › nota, línea 9
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Texto actualizado en el portal de normativa de la Nación (SAIJ). El mismo texto habla de los ocho Vocales en el artículo 33. No se encontró la ley que fijó los nueve.
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#34/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/cortes_provinciales.csv`, 34 › nota, línea 10
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
La reforma es del 8 de septiembre de 2025 (antes, no menos de tres). El Procurador General no se cuenta. La Guía Judicial 2026 marca un cargo vacante.
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#38/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/cortes_provinciales.csv`, 38 › nota, línea 11
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Según un extracto de la Ley 4055 (artículo 43, texto según la Ley 5878 de 2015) en el sitio del Poder Judicial, nueve vocales. No se leyó el texto: tres compilaciones siguen diciendo cinco. Antes de la reforma constitucional de 2023 se llamaba Superior Tribunal de Justicia.
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#42/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/cortes_provinciales.csv`, 42 › nota, línea 12
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Texto leído en la copia de la Universidad de Palermo. La Constitución (artículo 89) pide un número impar no menor de tres.
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#46/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/cortes_provinciales.csv`, 46 › nota, línea 13
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Rige desde julio de 2024, antes eran cinco. Texto leído en Microjuris.
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#50/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/cortes_provinciales.csv`, 50 › nota, línea 14
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Leída en el Boletín Oficial de Mendoza.
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#54/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/cortes_provinciales.csv`, 54 › nota, línea 15
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Texto leído en la copia del INECIP. La Constitución (artículo 136) pide un número impar.
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#62/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/cortes_provinciales.csv`, 62 › nota, línea 17
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Boletín Oficial del 1 de mayo de 2017. El número viene de la Ley 4837 de 2013. La Constitución (artículo 202) pide un número impar entre tres y cinco.
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#66/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/cortes_provinciales.csv`, 66 › nota, línea 18
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Texto leído en la copia de la Universidad de Palermo. La ampliación de siete a nueve es de febrero de 2020.
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#70/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/cortes_provinciales.csv`, 70 › nota, línea 19
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Texto de la Ley 5854 consolidado hasta 2001 (INECIP).
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#74/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/cortes_provinciales.csv`, 74 › nota, línea 20
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Ley del 10 de septiembre de 2021. La ley anterior, de 2004, también fijaba cinco. La Constitución (artículo 191) pide cinco o más.
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#78/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/cortes_provinciales.csv`, 78 › nota, línea 21
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Boletín Oficial del 10 de septiembre de 2025 (antes, cinco). El Tribunal Superior la declaró inconstitucional en diciembre de 2025 y la Corte Suprema de la Nación revocó ese fallo el 14 de mayo de 2026: los nuevos vocales asumieron en mayo de 2026 (prensa).
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#82/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/cortes_provinciales.csv`, 82 › nota, línea 22
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Según el Decreto 0279/2025, que cita el artículo 11 de la Ley 10.160 reformado por la Ley 14.292, siete ministros. No se leyó el texto de la ley.
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#82/tribunal

- Rutas: catalogo.html, corte-suprema.html, politica.html, relaciones.html
- Fuente: `datos/manual/cortes_provinciales.csv`, 82 › tribunal, línea 22
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html, corte-suprema.html, politica.html, relaciones.html.

Original:

```text
Corte Suprema de Justicia
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#86/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/cortes_provinciales.csv`, 86 › nota, línea 23
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Leída en el sitio del Poder Judicial. La Ley 6011 es del Boletín Oficial del 24 de enero de 1994. La Constitución (artículo 187) pide un número impar no menor de cinco.
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#90/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/cortes_provinciales.csv`, 90 › nota, línea 24
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Texto leído en la copia de la Universidad de Palermo. La Constitución no fija el número.
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#90/tribunal

- Rutas: catalogo.html, corte-suprema.html, politica.html, relaciones.html
- Fuente: `datos/manual/cortes_provinciales.csv`, 90 › tribunal, línea 24
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html, corte-suprema.html, politica.html, relaciones.html.

Original:

```text
Corte Suprema de Justicia
```

Propuesto: igual al original.

## datos/manual/cortes_provinciales.csv#94/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/cortes_provinciales.csv`, 94 › nota, línea 25
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
La Constitución (artículo 155) fija tres y permite ampliarlo por ley con dos tercios.
```

Propuesto: igual al original.

## datos/manual/distorsiones.json#_nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/distorsiones.json`, _nota
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
Casos que el lugar de registro o un error de la fuente distorsionan (pedido del autor, octubre de 2026, punto A6). Clave: tabla.columna y código de jurisdicción. accion 'aclarar' suma el motivo en la misma oración que nombra el máximo, 'excluir' lo saca del texto de máximos y dice por qué. Los usan 02_procesar.py (textos) y pruebas_datos.py (acepta el hallazgo). El motivo se muestra tal cual: sin cifras. El campo corto es la versión para las tarjetas (perfil provincial, En cifras y el mapa de la portada), que tienen poco lugar.
```

Propuesto: igual al original.

## datos/manual/distorsiones.json#empleo_construccion_provincias.construccion_cada_1000/02/motivo

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/distorsiones.json`, empleo_construccion_provincias.construccion_cada_1000/02/motivo
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
el SIPA cuenta cada empleo en la provincia donde declara la empresa, no donde está la obra, así que la Ciudad suma también puestos de obras en otras provincias
```

Propuesto: igual al original.

## datos/manual/distorsiones.json#empleo_provincias.cada_100/02/motivo

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/distorsiones.json`, empleo_provincias.cada_100/02/motivo
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado al evaluar el texto en la página con los datos reales: es de otra vista, de una cifra de En cifras, del buscador o de una vista OCDE.

Original:

```text
el SIPA cuenta cada empleo en la provincia donde declara la empresa, así que la Ciudad suma también a muchas personas que viven en el conurbano
```

Propuesto: igual al original.

## datos/manual/distorsiones.json#robos_provincias.robos/02/motivo

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/distorsiones.json`, robos_provincias.robos/02/motivo
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
la tasa se calcula sobre quienes viven en la Ciudad, que recibe cada día a muchas personas que viven en otras jurisdicciones
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#magistratura-2006/desenlace

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, magistratura-2006 › desenlace, línea 2
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Ley 26.080. En 2021 la Corte Suprema declaró inconstitucional esa composición.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#magistratura-2006/que_cambia

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, magistratura-2006 › que_cambia, línea 2
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Bajó de 20 a 13 los integrantes del Consejo de la Magistratura, el órgano que selecciona a los jueces y puede acusarlos para removerlos, y cambió el peso de cada sector en él.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#superpoderes-2006/desenlace

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, superpoderes-2006 › desenlace, línea 3
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Ley 26.124. En 2016 otra ley les puso un tope a esas reasignaciones.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#superpoderes-2006/que_cambia

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, superpoderes-2006 › que_cambia, línea 3
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Permitió en forma permanente que el jefe de Gabinete reasigne partidas del presupuesto aprobado por el Congreso, sin cambiar el total.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#educacion-2006/desenlace

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, educacion-2006 › desenlace, línea 4
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Ley 26.206.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#educacion-2006/que_cambia

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, educacion-2006 › que_cambia, línea 4
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Reemplazó la Ley Federal de Educación de 1993, volvió a organizar la escuela en primaria y secundaria y extendió la escolaridad obligatoria desde la sala de 5 hasta el final de la secundaria.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#bosques-2007/desenlace

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, bosques-2007 › desenlace, línea 5
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Ley 26.331. Diputados la aprobó en marzo de 2007, el Senado la cambió y en noviembre Diputados aceptó los cambios, en la votación que se muestra.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#bosques-2007/que_cambia

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, bosques-2007 › que_cambia, línea 5
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Fijó presupuestos mínimos para proteger los bosques nativos: cada provincia tiene que ordenar sus bosques en zonas según cuánto se pueden aprovechar y, hasta hacerlo, no puede autorizar desmontes nuevos.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#retenciones-2008/desenlace

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, retenciones-2008 › desenlace, línea 6
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Diputados la aprobó y el Senado la rechazó con el voto de desempate del vicepresidente.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#retenciones-2008/que_cambia

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, retenciones-2008 › que_cambia, línea 6
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Ratificaba derechos de exportación para soja, trigo, maíz y girasol que subían y bajaban según el precio internacional.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#afjp-2008/desenlace

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, afjp-2008 › desenlace, línea 7
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Ley 26.425.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#afjp-2008/que_cambia

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, afjp-2008 › que_cambia, línea 7
- Tipo: texto de datos
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Eliminó el régimen de capitalización privada y pasó los aportes y los fondos de las AFJP al sistema público de reparto.
```

Propuesto:

```text
Eliminó el régimen de capitalización privada y pasó los aportes y los fondos de las AFJP, las administradoras privadas de fondos de jubilaciones y pensiones, al sistema público de reparto.
```

## datos/manual/leyes_clave.csv#medios-2009/desenlace

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, medios-2009 › desenlace, línea 8
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Ley 26.522.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#medios-2009/que_cambia

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, medios-2009 › que_cambia, línea 8
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Reemplazó la ley de radiodifusión de 1980, limitó la cantidad de licencias por empresa y reservó parte del espectro para organizaciones sin fines de lucro.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#matrimonio-2010/desenlace

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, matrimonio-2010 › desenlace, línea 9
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Ley 26.618.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#matrimonio-2010/que_cambia

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, matrimonio-2010 › que_cambia, línea 9
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Habilitó el matrimonio entre personas del mismo sexo con los mismos derechos que el resto.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#ypf-2012/desenlace

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, ypf-2012 › desenlace, línea 10
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Ley 26.741.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#ypf-2012/que_cambia

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, ypf-2012 › que_cambia, línea 10
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Declaró de utilidad pública y sujeto a expropiación el 51% de las acciones de YPF que tenía Repsol.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#iran-2013/desenlace

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, iran-2013 › desenlace, línea 11
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Ley 26.843.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#iran-2013/que_cambia

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, iran-2013 › que_cambia, línea 11
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Aprobó un acuerdo con Irán para que una comisión de juristas revisara la causa del atentado a la AMIA e interrogara en Teherán a los acusados.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#holdouts-2016/desenlace

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, holdouts-2016 › desenlace, línea 12
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Ley 27.249.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#holdouts-2016/que_cambia

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, holdouts-2016 › que_cambia, línea 12
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Autorizó a pagar a los acreedores que no habían entrado en los canjes de deuda de 2005 y 2010 y derogó las leyes que lo impedían.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#previsional-2017/desenlace

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, previsional-2017 › desenlace, línea 13
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Ley 27.426.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#solidaridad-2019/desenlace

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, solidaridad-2019 › desenlace, línea 15
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Ley 27.541.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#aporte-2020/desenlace

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, aporte-2020 › desenlace, línea 16
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Ley 27.605.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#aporte-2020/que_cambia

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, aporte-2020 › que_cambia, línea 16
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Creó un aporte por única vez sobre los patrimonios personales más altos para financiar gastos de la pandemia.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#movilidad-2020/desenlace

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, movilidad-2020 › desenlace, línea 17
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Ley 27.609.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#ive-2020/desenlace

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, ive-2020 › desenlace, línea 18
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Ley 27.610.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#fmi-2022/desenlace

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, fmi-2022 › desenlace, línea 19
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Ley 27.668.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#fmi-2022/que_cambia

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, fmi-2022 › que_cambia, línea 19
- Tipo: texto de datos
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Aprobó el programa de facilidades extendidas para refinanciar el préstamo que el FMI había otorgado en 2018.
```

Propuesto:

```text
Aprobó el programa de facilidades extendidas con el Fondo Monetario Internacional (FMI) para refinanciar el préstamo que había otorgado en 2018.
```

## datos/manual/leyes_clave.csv#ganancias-2023/desenlace

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, ganancias-2023 › desenlace, línea 20
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Ley 27.725.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#bases-2024/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, bases-2024 › nombre, línea 21
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Ley Bases
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#paquete-2024/desenlace

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, paquete-2024 › desenlace, línea 22
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Ley 27.743.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#fichalimpia-2025/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, fichalimpia-2025 › nombre, línea 25
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Ficha limpia
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#fichalimpia-2025/que_cambia

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, fichalimpia-2025 › que_cambia, línea 25
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Impedía ser candidato a quien tuviera una condena por corrupción confirmada en segunda instancia.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#presupuesto-2026/desenlace

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, presupuesto-2026 › desenlace, línea 27
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Sancionado en diciembre de 2025.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#presupuesto-2026/que_cambia

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, presupuesto-2026 › que_cambia, línea 27
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Aprobó los gastos y los recursos de la administración nacional para 2026.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#penal-juvenil-2026/desenlace

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, penal-juvenil-2026 › desenlace, línea 28
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Sancionado en febrero de 2026.
```

Propuesto: igual al original.

## datos/manual/leyes_clave.csv#penal-juvenil-2026/que_cambia

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/leyes_clave.csv`, penal-juvenil-2026 › que_cambia, línea 28
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Creó un régimen penal para adolescentes y bajó de 16 a 14 años la edad desde la que se puede imputar un delito.
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 2/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 2 › nota, línea 2
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
En general
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 3/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 3 › nota, línea 3
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
En general
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 4/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 4 › nota, línea 4
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
En general
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 5/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 5 › nota, línea 5
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
En general
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 6/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 6 › nota, línea 6
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
En general
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 7/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 7 › nota, línea 7
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
En general
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 8/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 8 › nota, línea 8
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
En general
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 9/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 9 › nota, línea 9
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Única votación del proyecto en el acta
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 10/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 10 › nota, línea 10
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
En general
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 11/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 11 › nota, línea 11
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
En general y en particular
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 12/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 12 › nota, línea 12
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Dictamen de mayoría (la siguiente es un artículo)
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 13/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 13 › nota, línea 13
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Dictamen de mayoría (la primera de dos con el mismo título)
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 14/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 14 › nota, línea 14
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Única votación del proyecto en el acta
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 15/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 15 › nota, línea 15
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
En general
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 16/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 16 › nota, línea 16
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
En general
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 17/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 17 › nota, línea 17
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
En general
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 18/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 18 › nota, línea 18
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Única votación del proyecto antes de los cambios del Senado
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 19/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 19 › nota, línea 19
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
En general (rechazado)
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 20/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 20 › nota, línea 20
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
En general
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 21/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 21 › nota, línea 21
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
En general
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 23/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 23 › nota, línea 23
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Única votación del proyecto en el acta
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 24/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 24 › nota, línea 24
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Única votación del proyecto en el acta
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 25/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 25 › nota, línea 25
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Única votación del proyecto en el acta
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 28/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 28 › nota, línea 28
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Única votación del proyecto en el acta
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 29/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 29 › nota, línea 29
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Única votación del proyecto en el acta
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 30/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 30 › nota, línea 30
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Única votación del proyecto en el acta
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 31/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 31 › nota, línea 31
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Única votación del proyecto en el acta
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 33/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 33 › nota, línea 33
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Única votación del proyecto en el acta
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 34/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 34 › nota, línea 34
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Única votación del proyecto en el acta
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 35/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 35 › nota, línea 35
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Única votación del proyecto en el acta
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 36/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 36 › nota, línea 36
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Única votación del proyecto en el acta
```

Propuesto: igual al original.

## datos/manual/presupuestos.csv#fila 37/nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/presupuestos.csv`, fila 37 › nota, línea 37
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
En general
```

Propuesto: igual al original.

## datos/manual/programas_educacion.json#_nota

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/programas_educacion.json`, _nota
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
Programas educativos con una evaluación publicada por un organismo oficial (etapa 9, octubre de 2026). Regla del autor: solo programas con evaluación oficial publicada, descriptos por lo que midió su evaluación, sin recomendar. Sin cifras: los números quedan en el documento enlazado. El campo cita es textual y sirve para verificar (no se muestra). Revisado el 2 de octubre de 2026: las tres citas se encontraron en su documento, en la página indicada.
```

Propuesto: igual al original.

## datos/manual/programas_educacion.json#programas/0/cita/0/texto

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/programas_educacion.json`, programas/0/cita/0/texto
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
indicando un impacto positivo de la política en los aprendizajes en Lengua y Literatura
```

Propuesto: igual al original.

## datos/manual/programas_educacion.json#programas/0/cita/1/texto

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/programas_educacion.json`, programas/0/cita/1/texto
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
se observa un impacto nulo de la PNES de los aprendizajes en Matemática
```

Propuesto: igual al original.

## datos/manual/programas_educacion.json#programas/0/evaluacion/titulo

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/programas_educacion.json`, programas/0/evaluacion/titulo
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Informe de evaluación de impacto. Secundaria del Futuro: una mirada sobre los aprendizajes
```

Propuesto: igual al original.

## datos/manual/programas_educacion.json#programas/1/cita/0/texto

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/programas_educacion.json`, programas/1/cita/0/texto
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
este modelo de intervención produce un efecto win-win (ganan todos) en la sociedad civil y Estado
```

Propuesto: igual al original.

## datos/manual/programas_educacion.json#programas/1/cita/1/texto

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/programas_educacion.json`, programas/1/cita/1/texto
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
la obtención del título no es un punto de llegada sino un punto intermedio en un proyecto de continuar en el nivel superior
```

Propuesto: igual al original.

## datos/manual/programas_educacion.json#programas/1/evaluacion/titulo

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/programas_educacion.json`, programas/1/evaluacion/titulo
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Investigación evaluativa del Plan FinEs 2
```

Propuesto: igual al original.

## datos/manual/programas_educacion.json#programas/1/nombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/programas_educacion.json`, programas/1/nombre
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Plan FinEs 2
```

Propuesto: igual al original.

## datos/manual/programas_educacion.json#programas/2/cita/0/texto

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/programas_educacion.json`, programas/2/cita/0/texto
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Todos los actores entrevistados mostraron una alta valoración positiva del Programa y sus efectos
```

Propuesto: igual al original.

## datos/manual/programas_educacion.json#programas/2/evaluacion/titulo

- Rutas: no se encontró en las páginas armadas
- Fuente: `datos/manual/programas_educacion.json`, programas/2/evaluacion/titulo
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Nuevas voces, nuevos escenarios: estudios evaluativos sobre el Programa Conectar Igualdad
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.densidad

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/02_procesar.py`, CRUCES_META › densidad, línea 5958
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
"Densidad de población"
"habitantes por km²"
"Población"
"INDEC y Ministerio de Ambiente"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.empleo_privado

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/02_procesar.py`, CRUCES_META › empleo_privado, línea 5964
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
"asalariados cada 100 habitantes"
f"{MES[fin.month - 1]} de {fin.year}"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.empleo_var

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/02_procesar.py`, CRUCES_META › empleo_var, línea 5965
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
"Variación del empleo privado"
"% en doce meses"
f"{MES[fin.month - 1]} de {fin.year}"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.salario_docente

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/02_procesar.py`, CRUCES_META › salario_docente, línea 5970
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
"Salario de un maestro de grado"
"pesos por mes, bruto, con 10 años de antigüedad y jornada simple"
"Educación"
"Coordinación de Evaluación de Costos Educativos"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.autos

- Rutas: a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, emprendedores.html, empresas.html, gobierno.html, laboratorio.html, movilidad.html, pobreza.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94, trabajo.html, turismo.html
- Fuente: `scripts/02_procesar.py`, CRUCES_META › autos, línea 5977
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, emprendedores.html y otras.

Original:

```text
"cada 1.000 habitantes"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.motos

- Rutas: a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, emprendedores.html, empresas.html, gobierno.html, laboratorio.html, movilidad.html, pobreza.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94, trabajo.html, turismo.html
- Fuente: `scripts/02_procesar.py`, CRUCES_META › motos, línea 5978
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, emprendedores.html y otras.

Original:

```text
"cada 1.000 habitantes"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.nbi

- Rutas: a-cobertura-adolescentes.html, catalogo.html, cruces.html, indice.html, poblacion.html, pobreza.html, pobreza/diccionario.html
- Fuente: `scripts/02_procesar.py`, CRUCES_META › nbi, línea 5983
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: a-cobertura-adolescentes.html, catalogo.html, cruces.html, indice.html, poblacion.html, pobreza.html y otras.

Original:

```text
"Necesidades básicas insatisfechas"
"% de los hogares"
"Condiciones de vida"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.computadora

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/02_procesar.py`, CRUCES_META › computadora, línea 5985
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
"Computadora en el hogar"
"% de los hogares con computadora, notebook o tableta"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.internet_fijo

- Rutas: catalogo.html, cruces.html, pobreza.html, relaciones.html
- Fuente: `scripts/02_procesar.py`, CRUCES_META › internet_fijo, línea 5986
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html, cruces.html, pobreza.html, relaciones.html.

Original:

```text
"Accesos a internet fijo"
"cada 100 hogares"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.velocidad

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/02_procesar.py`, CRUCES_META › velocidad, línea 5987
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
"Velocidad de internet fijo"
"megabits por segundo de bajada, promedio"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.resultado_fiscal

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/02_procesar.py`, CRUCES_META › resultado_fiscal, línea 5991
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
"superávit o déficit financiero, % de los ingresos totales"
"Ministerio de Economía, cuentas provinciales"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.peso_voto

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/02_procesar.py`, CRUCES_META › peso_voto, línea 5993
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
"Peso de cada habitante en el Congreso"
"bancas de diputados y senadores sobre la proporción de población, 1 = proporcional"
"Política"
"Ley 22.847 y proyecciones del INDEC"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.pct_pob_solo_cobertura_publica

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/02_procesar.py`, CRUCES_META › pct_pob_solo_cobertura_publica, línea 5994
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
"Población sin obra social ni prepaga"
"% de la población, solo cobertura pública"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.pct_25mas_secundario_completo_o_mas

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/02_procesar.py`, CRUCES_META › pct_25mas_secundario_completo_o_mas, línea 5996
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
"Adultos con secundario completo"
"% de la población de 25 años o más"
"Educación"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.pct_hog_cloaca

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/02_procesar.py`, CRUCES_META › pct_hog_cloaca, línea 5997
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
"Hogares con cloacas"
"% de los hogares con desagüe a red pública"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.empresas_neta

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/02_procesar.py`, CRUCES_META › empresas_neta, línea 5999
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
"Cambio neto de empresas locales"
"aperturas menos cierres, % de las empresas, promedio de cinco años"
f"{emp_res['ult'] - 4} a {emp_res['ult']}"
"Empresas y oportunidades"
"OEDE, Ministerio de Capital Humano (SIPA)"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.atn_hab

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/02_procesar.py`, CRUCES_META › atn_hab, línea 6002
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
"ATN por habitante"
f"pesos de {TR_ULT} por habitante por año, promedio 2000 a {TR_ULT}"
f"2000 a {TR_ULT}"
"Política"
"Presupuesto Abierto, Secretaría de Hacienda"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.apoyo_gobierno

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/02_procesar.py`, CRUCES_META › apoyo_gobierno, línea 6004
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
"Apoyo al gobierno de sus legisladores"
"% de los votos de diputados y senadores de fuera del bloque oficialista que coincidieron con él en votaciones divididas"
"Política"
"Actas de votación de Diputados y del Senado, vía Cómo Votó"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.voto_oficialismo_2023

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/02_procesar.py`, CRUCES_META › voto_oficialismo_2023, línea 6008
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
"Voto al oficialismo nacional"
"% de los votos positivos a la fórmula del gobierno, primera vuelta presidencial"
"Política"
"Dirección Nacional Electoral"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.participacion_2023

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/02_procesar.py`, CRUCES_META › participacion_2023, línea 6009
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
"Participación electoral"
"% de los electores habilitados que votó, primera vuelta presidencial"
"Política"
"Dirección Nacional Electoral"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.impuestos_provinciales

- Rutas: a-atn-presupuesto.html, construccion.html, gobierno.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94
- Fuente: `scripts/02_procesar.py`, CRUCES_META › impuestos_provinciales, línea 6013
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: a-atn-presupuesto.html, construccion.html, gobierno.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06 y otras.

Original:

```text
"pesos por habitante"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.alquila

- Rutas: a-alquiler-pobreza.html, a-viviendas-alquiler.html, construccion.html, cruces.html, departamentos.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94
- Fuente: `scripts/02_procesar.py`, CRUCES_META › alquila, línea 6015
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: a-alquiler-pobreza.html, a-viviendas-alquiler.html, construccion.html, cruces.html, departamentos.html, provincia.html y otras.

Original:

```text
"Hogares que alquilan"
"% de los hogares"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.ocupados_construccion

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/02_procesar.py`, CRUCES_META › ocupados_construccion, línea 6017
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
"Personas ocupadas en la construcción"
"% de las personas ocupadas, incluye el trabajo no registrado"
"Construcción"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.empleo_construccion

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/02_procesar.py`, CRUCES_META › empleo_construccion, línea 6018
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
"Empleo registrado en la construcción"
"asalariados privados cada 1.000 habitantes"
f"{TRIM_TXT[OE_T % 10 - 1]} trimestre de {OE_T // 10}"
"Construcción"
"OEDE, Ministerio de Capital Humano (SIPA)"
```

Propuesto: igual al original.

## scripts/02_procesar.py#CRUCES_META.pensiones_invalidez

- Rutas: pobreza.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94
- Fuente: `scripts/02_procesar.py`, CRUCES_META › pensiones_invalidez, línea 6020
- Tipo: texto de datos
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: pobreza.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14 y otras. El texto anterior todavía aparece en: pobreza.html (otra fuente lo repite).

Original:

```text
"Pensiones por discapacidad"
"pensiones no contributivas por invalidez cada 1.000 habitantes"
f"{MES[pinv_res['prov_mes'] - 1]} de {pinv_res['prov_anio']}"
"Secretaría de Seguridad Social, BESS"
```

Propuesto:

```text
"Pensiones por invalidez"
"pensiones no contributivas por invalidez cada 1.000 habitantes"
f"{MES[pinv_res['prov_mes'] - 1]} de {pinv_res['prov_anio']}"
"Secretaría de Seguridad Social, BESS"
```

## scripts/02_procesar.py#CRUCES_META.seguro_desempleo

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/02_procesar.py`, CRUCES_META › seguro_desempleo, línea 6024
- Tipo: texto de datos
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
"Seguro de desempleo"
"beneficiarios de la prestación por desempleo cada 1.000 habitantes"
f"{MES[dsm_res['prov_mes'] - 1]} de {dsm_res['prov_anio']}"
"Secretaría de Seguridad Social, BESS"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#OPCIONES

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, OPCIONES, línea 19
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
"--con-pobreza"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#CON_POBREZA

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, CON_POBREZA, línea 22
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
"--con-pobreza"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#CONSULTA_IA

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, CONSULTA_IA, línea 49
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
"datos"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#MOTOR_IA

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, MOTOR_IA, línea 53
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
"datos"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#_IA_PRIV

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, _IA_PRIV, línea 72
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: Texto nuevo del bloque: reemplaza a uno anterior del mismo archivo.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

(no existe)

Propuesto:

```text
"<p>Las preguntas de Consultas con IA las contesta un modelo que corre en Cloudflare, la empresa que aloja el sitio. "
                          "Según su política, Cloudflare no usa esas preguntas para entrenar modelos. Datina no las guarda. "
                          "No escribas datos personales en una pregunta.</p>"
"<p>Las preguntas de Consultas con IA viajan a Anthropic, la empresa del modelo que las contesta. Datina no las guarda. "
                         "No escribas datos personales en una pregunta.</p>"
```

## scripts/03_construir_sitio.py#anios_a_mano

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, anios_a_mano, línea 118
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
f"{nombre}, línea {i}: ...{s[max(0, m.start() - 50): m.end() + 30].strip()}..."
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#RESUMEN

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, RESUMEN, línea 132
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
"datos"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#dato_resumen

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, dato_resumen, línea 139
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
f"La plantilla pide {{{{{m.group(1)}}}}}, que no está en el resumen de los datos (02_procesar.py): el sitio no se armó."
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#FRECUENCIA

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, FRECUENCIA, línea 164
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado al evaluar el texto en la página con los datos reales: es de otra vista, de una cifra de En cifras, del buscador o de una vista OCDE.

Original:

```text
"mes"
"f-exporta-provincias"
"mes"
"mes"
"mes"
"mes"
"mes"
"mes"
"mes"
"mes"
"mes"
"mes"
"mes"
"mes"
"mes"
"mes"
"mes"
"f-voto-provincia"
"mes"
"mes"
"mes"
"mes"
"mes"
"mes"
"mes"
"mes"
"mes"
"mes"
"mes"
"mes"
"mes"
"f-electricidad-provincias"
"f-hogares"
"mes"
"mes"
"mes"
"mes"
"mes"
"f-gas-hogares"
"mes"
"mes"
"f-hidro-provincias"
"mes"
"mes"
"mes"
"mes"
"mes"
"mes"
"mes"
"mes"
"mes"
"mes"
"mes"
"mes"
"mes"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#con_frecuencia

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, con_frecuencia, línea 230
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
f"La ficha {ident} no tiene la fuente en el pie: no se puede sumar la frecuencia."
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#ruta_exp

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, ruta_exp, línea 237
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
"datos"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#explicador

- Rutas: construccion.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, emprendedores.html, empresas.html, energia.html, gobierno.html, indice.html, migraciones.html, movilidad.html, naturaleza.html, petroleo.html, poblacion.html, pobreza.html, politica.html, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/03_construir_sitio.py`, explicador, línea 274
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: construccion.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html y otras.

Original:

```text
"fuente"
'<div class="explicador" id="para-entender"><div class="exp-cab"><h2 class="bloque-grupo">Para entender los datos</h2>'
            '<p>Qué se mide, cómo se calcula y de dónde sale cada dato de esta página.</p></div>'
            f'<div class="exp-lista">{filas}</div></div>'
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#ruta_prog

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, ruta_prog, línea 281
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
"datos"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#gancho

- Rutas: construccion.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, emprendedores.html, empresas.html, energia.html, gobierno.html, indice.html, migraciones.html, movilidad.html, naturaleza.html, petroleo.html, poblacion.html, pobreza.html, politica.html, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/03_construir_sitio.py`, gancho, línea 302
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: construccion.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html y otras.

Original:

```text
'<p class="exp-gancho"><a href="#para-entender">Para entender los datos</a>: qué se mide, de dónde sale y qué tener en cuenta, '
            'al final de la página ↓</p>'
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#DIR_BANDERAS

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, DIR_BANDERAS, línea 311
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
"datos"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#NOMBRE_PROV['00']

- Rutas: nosotros.html
- Fuente: `scripts/03_construir_sitio.py`, NOMBRE_PROV['00'], línea 315
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: nosotros.html.

Original:

```text
"Argentina (Todo el país)"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#línea 316

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, línea 316, línea 316
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
"datos"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#base

- Rutas: nosotros.html
- Fuente: `scripts/03_construir_sitio.py`, base, línea 324
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: nosotros.html.

Original:

```text
'<h2>Las banderas</h2><p>Las banderas de las provincias y la nacional vienen de Wikimedia Commons, el archivo de imágenes libres de Wikipedia, '
    'y se muestran en miniatura, todas con el mismo tamaño y el mismo recorte.</p>'
    f'<details class="glosario creditos"><summary>Autores y licencias</summary><ul>{creditos}</ul></details>'
f'<p class="estado" id="estado"><span>{sum(1 for f in FICHAS if not f[5])} fichas</span> <span>24 jurisdicciones</span> '
                             f'<span>{len(NOTAS)} artículos</span></p>'
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#HISTORIA

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, HISTORIA, línea 334
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
"datos"
"provincias"
"provincias_historia.json"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#_fj

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, _fj, línea 335
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
"datos"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#_H_CAMPOS

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, _H_CAMPOS, línea 338
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
"Autonomía"
"Fundación"
"provincia_desde"
"Dato curioso"
"Quiénes"
```

Propuesto:

```text
"La capital"
"La provincia"
"provincia_desde"
"Dato curioso"
"Quiénes"
```

## scripts/03_construir_sitio.py#_HIST_YA

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, _HIST_YA, línea 394
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
'<script>(()=>{const l=s=>new URLSearchParams(s).get("prov");let c=l(location.search)||l(location.hash.split("?")[1]||"");'
            'try{c=c||localStorage.getItem("prov")}catch(_){}const a=c&&document.querySelector(\'#prov-historia .ph[data-c="\'+c+\'"]\');'
            'if(a)a.hidden=false})()</script>'
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#bloques

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, bloques, línea 414
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
"la plantilla tiene una <section> sin cerrar"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#PAGINA_DE_BLOQUE

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, PAGINA_DE_BLOQUE, línea 420
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
"provincias-home"
"no-encontrada"
"provincia"
"provincias"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#GRUPOS

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, emprendedores.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, politica.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94, relaciones.html, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/03_construir_sitio.py`, GRUPOS, línea 501
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
"Personas y bienestar"
"Población"
"personas"
"Economía"
"Trabajo y economía"
"Estado y sociedad"
"Energía"
"Territorio y recursos"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#MENUS

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, emprendedores.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, politica.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94, relaciones.html, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/03_construir_sitio.py`, MENUS, línea 513
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
"Provincias"
"Provincias"
"provincia"
"provincia.html"
"provincias"
"Historias con datos"
"Los datos"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#PAGINAS_MENU

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, PAGINAS_MENU, línea 530
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
"provincia"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#EJEMPLOS

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, EJEMPLOS, línea 534
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado al evaluar el texto en la página con los datos reales: es de otra vista, de una cifra de En cifras, del buscador o de una vista OCDE.

Original:

```text
"¿Cuánto cuesta un litro de nafta?"
"¿Qué parte de los hogares tiene cloacas?"
"¿Qué provincia tiene más glaciares?"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#D

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, D, línea 563
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
"datos"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#línea 576

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, línea 576, línea 576
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
"datos"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#DIR_ICONOS

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, DIR_ICONOS, línea 579
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
"datos"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#SEC_ICONO

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, SEC_ICONO, línea 598
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
"provincia"
"personas"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#(_IA_INDICE, _IA_JS)

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, (_IA_INDICE, _IA_JS), línea 619
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
"datos"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#TITULO

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, emprendedores.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, politica.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94, relaciones.html, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/03_construir_sitio.py`, TITULO, línea 658
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
"<title>Datina | Las 24 Argentinas en números</title>"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#línea 668

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, emprendedores.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, politica.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94, relaciones.html, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/03_construir_sitio.py`, línea 668, línea 668
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
"Sobre nosotros"
"Tu provincia"
"provincia"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#carta

- Rutas: articulos.html, catalogo.html, consulta-ia.html, cruces.html, curiosidades.html, diagnostico.html, economia.html, emprendedores.html, empresas.html, energia.html, gobierno.html, indice.html, migraciones.html, movilidad.html, nosotros.html, petroleo.html, poblacion.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/03_construir_sitio.py`, carta, línea 693
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: articulos.html, catalogo.html, consulta-ia.html, cruces.html, curiosidades.html, diagnostico.html y otras.

Original:

```text
"Inicio de Datina"
"Artículo"
"Qué es Datina"
"provincia"
f"{len(NOTAS)} artículos"
```

Propuesto:

```text
"Inicio de Datina"
"Artículo"
"Cada provincia frente al país"
"Qué es Datina"
"provincia"
f"{len(NOTAS)} artículos"
```

## scripts/03_construir_sitio.py#pasos

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, pasos, línea 711
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
f'<nav class="pasos" aria-labelledby="pasos-tit"><div class="pasos-cab"><h2 class="bloque-grupo" id="pasos-tit">Seguí explorando</h2>'
            f'<a class="enlace" href="{todas[0]}">{e(todas[1])}{FLECHA_SIG}</a></div><div class="pasos-grid">{t}</div></nav>'
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#relacionadas

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, relacionadas, línea 719
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
"provincia"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#NOMBRE_MENU

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, emprendedores.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, politica.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94, relaciones.html, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/03_construir_sitio.py`, NOMBRE_MENU, línea 823
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
"Consultor de pobreza"
"Explorador de relaciones"
"La Corte Suprema"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#MAPA

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, MAPA, línea 829
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente). El texto anterior todavía aparece en: educacion.html (otra fuente lo repite).

Original:

```text
"Cómo se hace"
"Sobre nosotros"
"nosotros.html#como-se-hace"
"Fuentes y método"
```

Propuesto:

```text
"Cómo se hace"
"Sobre nosotros"
"nosotros.html#como-se-hace"
"De dónde salen los datos"
```

## scripts/03_construir_sitio.py#_sin_tildes

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, _sin_tildes, línea 864
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
"ÁÉÍÓÚáéíóúÑñ"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#contenido_menu

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, emprendedores.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, politica.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/03_construir_sitio.py`, contenido_menu, línea 877
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
"provincias"
"Las 24 jurisdicciones"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#DESTACADOS

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, DESTACADOS, línea 917
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
"personas"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#_PREG_DEST

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, _PREG_DEST, línea 920
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: Texto nuevo del bloque: reemplaza a uno anterior del mismo archivo.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

(no existe)

Propuesto:

```text
"¿Cuánto se gana en un empleo privado registrado?"
"¿Cuántos años se vive en la Argentina?"
"¿Cuántas víctimas de homicidio hay en la Argentina?"
"¿Cuánto petróleo produce el país?"
```

## scripts/03_construir_sitio.py#_provincias_home

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, _provincias_home, línea 934
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
f'<p class="bloque-sub">El perfil de cada jurisdicción en {_n_temas_perfil} temas y su historia. Los números dentro de cada '
                    'provincia, en <a class="enlace" href="departamentos.html">Departamentos</a>.</p><ul class="prov-home">'
```

Propuesto:

```text
f'<p class="bloque-sub">El perfil de cada jurisdicción en {_n_temas_perfil} temas, con su historia. Los datos de cada departamento, partido '
                    'o comuna están en <a class="enlace" href="departamentos.html">Departamentos</a>.</p><ul class="prov-home">'
```

## scripts/03_construir_sitio.py#SITIO_CONF

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, SITIO_CONF, línea 967
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
"datos"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#CON_CIFRAS

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, CON_CIFRAS, línea 1008
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
"const EN_CIFRAS = {"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#siluetas

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, siluetas, línea 1024
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
f'<div class="en-cifras esqueleto" aria-hidden="true"><h2>En cifras</h2><div class="cifras-grid">{tarjetas_vacias(n, "cifra")}</div></div>'
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#encabezado_principal

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, encabezado_principal, línea 1044
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
f"{id_}: sin <main> o sin título h2"
'class="tema con-pregunta'
f"{id_}: la sección con pregunta no sigue con <div class=\"tema-intro\"><p class=\"pregunta\">"
f"{id_}: el título de la sección ya tiene una clase"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#metadatos

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, metadatos, línea 1079
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
"es-AR"
"Datina: tabla completa de indicadores por jurisdicción"
"Todos los indicadores de Datina en una sola tabla: una fila por jurisdicción, período e indicador, con su unidad y su fuente."
"es-AR"
f"{URL_SITIO}/datos/tabla_larga.csv"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#pagina

- Rutas: index.html
- Fuente: `scripts/03_construir_sitio.py`, pagina, línea 1112
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: index.html.

Original:

```text
"Datina: las 24 Argentinas en números"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#línea 1132

- Rutas: provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94
- Fuente: `scripts/03_construir_sitio.py`, línea 1132, línea 1132
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: La descripción no nombraba la historia, que el perfil tiene, y «las 24» quedaba sin sustantivo.
- Verificación: Comprobado en la página armada: provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18 y otras.

Original:

```text
"Tu provincia"
"provincia"
"Cada provincia comparada con el total del país en todos los indicadores con dato provincial, su posición entre las 24 y las provincias que más se le parecen."
"provincia"
```

Propuesto:

```text
"Tu provincia"
"provincia"
"El perfil de cada provincia: sus indicadores frente al total del país, su posición entre las 24 jurisdicciones, su historia y las provincias que más se le parecen."
"provincia"
```

## scripts/03_construir_sitio.py#línea 1136

- Rutas: nosotros.html
- Fuente: `scripts/03_construir_sitio.py`, línea 1136, línea 1136
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: nosotros.html.

Original:

```text
"Sobre nosotros"
"Qué es Datina, para qué existe, de dónde salen sus datos y cómo se hace. Estadísticas públicas de las 24 jurisdicciones de la Argentina."
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#línea 1140

- Rutas: laboratorio.html
- Fuente: `scripts/03_construir_sitio.py`, línea 1140, línea 1141
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: «Datos difíciles» no dice nada y faltaba la pieza de la Corte Suprema, que también es del Laboratorio.
- Verificación: Comprobado en la página armada: laboratorio.html.

Original:

```text
"Datos difíciles, en gráficos: cada banca del Congreso, cada pozo de Vaca Muerta y las 24 jurisdicciones año por año, con sus fuentes."
```

Propuesto:

```text
"Piezas visuales con datos públicos: cada juez de la Corte Suprema, cada banca del Congreso, cada pozo de Vaca Muerta y las 24 jurisdicciones año por año, con sus fuentes."
```

## scripts/03_construir_sitio.py#línea 1146

- Rutas: contacto.html
- Fuente: `scripts/03_construir_sitio.py`, línea 1146, línea 1146
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: contacto.html.

Original:

```text
"Para avisar de un error en un dato, sugerir una fuente o una pregunta, o contar cómo usás Datina."
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#línea 1148

- Rutas: 404.html
- Fuente: `scripts/03_construir_sitio.py`, línea 1148, línea 1148
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html.

Original:

```text
"Esta página no existe."
"Página no encontrada"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#_arts_js

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, _arts_js, línea 1160
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
f"un artículo de datina.js sin id, frec o dek: {t[:60]}"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#lista_articulos

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, lista_articulos, línea 1176
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
"falta la grilla de Artículos en la plantilla"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#línea 1222

- Rutas: nosotros.html
- Fuente: `scripts/03_construir_sitio.py`, línea 1222, línea 1222
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: nosotros.html.

Original:

```text
"datos"
"datos"
"tabla_larga.csv"
"tabla_larga.csv"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#CACHE_LARGO

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, CACHE_LARGO, línea 1265
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
"/datos/fichas.js"
"/datos/relaciones.json"
f"/datos/{n}.json"
```

Propuesto: igual al original.

## scripts/03_construir_sitio.py#línea 1291

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/03_construir_sitio.py`, línea 1291, línea 1291
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
f"Listo: sitio/index.html, {len(SECCIONES)} paginas de seccion y {len(NOTAS)} articulos"
```

Propuesto: igual al original.

## scripts/datina.js#cargarTabla

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, cargarTabla, línea 54
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
datos/${n}.json?v=${DIFERIDAS[n]}
```

Propuesto: igual al original.

## scripts/datina.js#refrescarTabla.caja

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, refrescarTabla › caja, línea 61
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
#${id} .tabla-datos
```

Propuesto: igual al original.

## scripts/datina.js#esperando

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, esperando, línea 66
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
<span class="solo-lector">Cargando los datos</span>
```

Propuesto: igual al original.

## scripts/datina.js#conTablas.el

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, conTablas › el, línea 80
- Tipo: gráfico
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
No se pudieron cargar los datos.
```

Propuesto:

```text
No se pudieron cargar los datos. Probá recargar la página.
```

## scripts/datina.js#vecesPais.r

- Rutas: construccion.html, provincia.html?prov=02, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=34, provincia.html?prov=42, provincia.html?prov=54, trabajo.html
- Fuente: `scripts/datina.js`, vecesPais › r, línea 94
- Tipo: gráfico
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: construccion.html, provincia.html?prov=02, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=34, provincia.html?prov=42 y otras.

Original:

```text
${veces(v, pais)} veces el promedio del país
menos de la décima parte del promedio del país
menos de la cuarta parte del promedio del país
menos de la mitad del promedio del país
```

Propuesto:

```text
${veces(v, pais)} veces el valor del país
menos de la décima parte del valor del país
menos de la cuarta parte del valor del país
menos de la mitad del valor del país
```

## scripts/datina.js#puestoTxt

- Rutas: gobierno.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94
- Fuente: `scripts/datina.js`, puestoTxt, línea 101
- Tipo: gráfico
- Estado: **reescrito**
- Motivo: Texto nuevo del bloque: reemplaza a uno anterior del mismo archivo.
- Verificación: Comprobado en la página armada: gobierno.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18 y otras.

Original:

(no existe)

Propuesto:

```text
jurisdicciones con dato
${orden === 1 ? "La cifra más alta" : orden === n ? "La cifra más baja"
  : orden <= n / 2 ? `La ${orden}.ª cifra más alta` : `La ${n - orden + 1}.ª cifra más baja`} de las ${n} ${que}
```

## scripts/datina.js#cambio

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, cambio, línea 182
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
no cambió
```

Propuesto: igual al original.

## scripts/datina.js#signo

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, signo, línea 184
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
cayó ${n1(Math.abs(v))}%
creció ${n1(v)}%
```

Propuesto: igual al original.

## scripts/datina.js#fLarga

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, fLarga, línea 189
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
${+f.slice(0, 2)} de ${MESES[+f.slice(3, 5) - 1]} de ${f.slice(6)}
```

Propuesto: igual al original.

## scripts/datina.js#trimTx

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, trimTx, línea 191
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
${["primer", "segundo", "tercer", "cuarto"][+t[0] - 1]} trimestre de ${t.slice(2)}
```

Propuesto: igual al original.

## scripts/datina.js#CM_FRASE.infecciosas

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, CM_FRASE › infecciosas, línea 196
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
las enfermedades infecciosas y parasitarias
el COVID-19
la diabetes y otras enfermedades endocrinas y metabólicas
```

Propuesto: igual al original.

## scripts/datina.js#CM_FRASE.digestivas

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, CM_FRASE › digestivas, línea 197
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
las enfermedades digestivas
las causas externas
```

Propuesto: igual al original.

## scripts/datina.js#REG_ART

- Rutas: catalogo.html, construccion.html, curiosidades.html, economia.html, educacion.html, emprendedores.html, empresas.html, pobreza.html, pobreza/diccionario.html, pobreza/index.html, politica.html, relaciones.html, salud.html, trabajo.html
- Fuente: `scripts/datina.js`, REG_ART, línea 218
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html, construccion.html, curiosidades.html, economia.html, educacion.html, emprendedores.html y otras.

Original:

```text
Gran Buenos Aires
el Gran Buenos Aires
Pampeana
la región Pampeana
Noreste
el Noreste
Noroeste
el Noroeste
Cuyo
Cuyo
```

Propuesto: igual al original.

## scripts/datina.js#REG_ART.Patagonia

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, REG_ART › Patagonia, línea 219
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Patagonia
la Patagonia
```

Propuesto: igual al original.

## scripts/datina.js#enSuRegion.v

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, enSuRegion › v, línea 224
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
 La provincia de Buenos Aires está en dos regiones: los 24 partidos, en el Gran Buenos Aires, con ${f(v("gba")[k])}, y el resto, 
en la región Pampeana, con ${f(v("pampeana")[k])}.
 ${NOMBRES[prov]} está en ${REG_ART[v(regs[0]).region]}: ${f(v(regs[0])[k])}.
```

Propuesto: igual al original.

## scripts/datina.js#cambioPl

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, cambioPl, línea 230
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
no cambiaron
```

Propuesto: igual al original.

## scripts/datina.js#sobra

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, sobra, línea 250
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
déficit
superávit
```

Propuesto: igual al original.

## scripts/datina.js#cambioPct

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, cambioPct, línea 258
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
no cambió
```

Propuesto: igual al original.

## scripts/datina.js#CORTO_DEL.Delitos contra la seguridad pública

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, CORTO_DEL › Delitos contra la seguridad pública, línea 267
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Delitos contra la seguridad pública
Seguridad pública
Otros delitos contra la libertad
Otros contra la libertad
```

Propuesto: igual al original.

## scripts/datina.js#CORTO_DEL.Homicidios dolosos

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, CORTO_DEL › Homicidios dolosos, línea 268
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Homicidios dolosos
Homicidios dolosos
Lesiones culposas por otros hechos
Otras lesiones culposas
```

Propuesto: igual al original.

## scripts/datina.js#CORTO_DEL.Tentativas de homicidio doloso

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, CORTO_DEL › Tentativas de homicidio doloso, línea 269
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Tentativas de homicidio doloso
Tentativas de homicidio
Muertes en siniestros viales
Muertes en tránsito
```

Propuesto: igual al original.

## scripts/datina.js#deLas24

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, deLas24, línea 270
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
en las 24 jurisdicciones
en ninguna de las 24 jurisdicciones
en ${n} de las 24 jurisdicciones
```

Propuesto: igual al original.

## scripts/datina.js#TEC_CEN

- Rutas: catalogo.html, energia.html, gobierno.html, petroleo.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94
- Fuente: `scripts/datina.js`, TEC_CEN, línea 272
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html, energia.html, gobierno.html, petroleo.html, provincia.html, provincia.html?prov=02 y otras.

Original:

```text
Térmica
Hidroeléctrica
Nuclear
```

Propuesto: igual al original.

## scripts/datina.js#creceCae

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, creceCae, línea 281
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
creció
cayó
```

Propuesto: igual al original.

## scripts/datina.js#VIV_IND.construccion_cada_1000

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, VIV_IND › construccion_cada_1000, línea 300
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado al evaluar el texto en la página con los datos reales: es de otra vista, de una cifra de En cifras, del buscador o de una vista OCDE.

Original:

```text
Viviendas en construcción cada 1.000
El día del Censo 2022 había ${n0(CN.viv_abs.en_construccion)} viviendas en construcción, ${n1(VV.construccion_cada_1000)} cada 1.000 viviendas particulares. 
La proporción más alta era la de ${CN.viv_top.construccion_cada_1000[0]} (${n1(CN.viv_top.construccion_cada_1000[1])}) y la más baja, la de ${CN.viv_low.construccion_cada_1000[0]} (${n1(CN.viv_low.construccion_cada_1000[1])}).
```

Propuesto: igual al original.

## scripts/datina.js#NOTA_VIV

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, NOTA_VIV, línea 310
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Datos del Censo 2022 sumados desde los radios censales. Un hogar son las personas que comparten la vivienda y los gastos de comida. 
La calidad de los materiales es una clasificación del INDEC según el material de los pisos y los techos y la presencia de cielorraso: la calidad IV es la de materiales de baja calidad tanto en el piso como en el techo. Se calcula sobre los hogares con dato. 
El día del censo, el ${pct(VV.pct_sin_personas)} de las viviendas particulares no tenía personas presentes, y el INDEC registró el motivo: uso temporal, oficina o comercio, alquiler o venta, construcción, residentes que no estaban ese día u otra situación. 
Por eso el selector muestra motivos por separado y no un total de viviendas vacías: una parte de las viviendas sin personas presentes tiene residentes habituales. 
En el mapa, el color divide a los departamentos en cinco grupos del mismo tamaño. Si elegís una provincia en Tu provincia, el mapa se acerca a ella.
```

Propuesto: igual al original.

## scripts/datina.js#RO

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, RO, línea 815
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
${["primer", "segundo", "tercer", "cuarto"][t[1] - 1]} trimestre de ${t[0]}
```

Propuesto: igual al original.

## scripts/datina.js#sinContar

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, sinContar, línea 822
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
, sin contar ${terrs.join(" y ")}: ${terrs.map(t => DIST[clave][t].motivo).join(". ")}
```

Propuesto: igual al original.

## scripts/datina.js#TX.actualizado

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, politica.html, provincia.html, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/datina.js`, TX › actualizado, línea 1502
- Tipo: texto de ficha
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
Datos descargados y procesados el ${R.actualizado}.
```

Propuesto:

```text
Datos descargados y procesados el ${fLarga(R.actualizado)}.
```

## scripts/datina.js#desplegable.sinTilde

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, desplegable › sinTilde, línea 1563
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Todo el país
```

Propuesto: igual al original.

## scripts/datina.js#desplegable.marcar

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, desplegable › marcar, línea 1605
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Todo el país
```

Propuesto: igual al original.

## scripts/datina.js#lineas.leer

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, lineas › leer, línea 1751
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
<span>sin dato en la fuente</span>
```

Propuesto: igual al original.

## scripts/datina.js#barrasH.anotar

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, barrasH › anotar, línea 1897
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
tu provincia, la más alta
la más alta
la más alta
tu provincia, puesto ${i} de ${n}
puesto ${i} de ${n}
```

Propuesto: igual al original.

## scripts/datina.js#pesas.cambioTxt

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, pesas › cambioTxt, línea 1982
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Sin cambio
<br><span class="tip-pais">País: ${vf(cfg.pais[0])} y ${vf(cfg.pais[1])}</span>
```

Propuesto: igual al original.

## scripts/datina.js#columnas.MES

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, columnas › MES, línea 1989
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Ene
Feb
Mar
Abr
May
Jun
Jul
Ago
Sep
Oct
Nov
Dic
```

Propuesto: igual al original.

## scripts/datina.js#columnas.vals

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, columnas › vals, línea 2007
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Miles de GWh
```

Propuesto: igual al original.

## scripts/datina.js#piramidePob.titulo

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, piramidePob › titulo, línea 2052
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Varones
Mujeres
```

Propuesto: igual al original.

## scripts/datina.js#piramidePob.om

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, piramidePob › om, línea 2062
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
<b>${d.lab} años</b><br>Varones: ${n1(d.vh)}% en ${cfg.anio} y ${n1(d.vf)}% en ${PI.anio_fin}<br>Mujeres: ${n1(d.mh)}% en ${cfg.anio} y ${n1(d.mf)}% en ${PI.anio_fin}
```

Propuesto: igual al original.

## scripts/datina.js#apiladasH.esquinas

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, apiladasH › esquinas, línea 2165
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
datos/banderas/${v}.png
```

Propuesto: igual al original.

## scripts/datina.js#mapaAreas.el

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, mapaAreas › el, línea 2229
- Tipo: gráfico
- Estado: **conservado deliberadamente**
- Motivo: Literal que busca scripts/prueba_fallas.mjs.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
No se pudo cargar el mapa.
```

Propuesto: igual al original.

## scripts/datina.js#mapaAreas.svg

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, mapaAreas › svg, línea 2233
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Mapa de la Argentina con el porcentaje de territorio protegido por provincia
```

Propuesto: igual al original.

## scripts/datina.js#mapaAreas.burb

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, mapaAreas › burb, línea 2255
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
<b>${d.nombre}</b><br>${d.caracter}, ${d.anio}<br>${n0(d.hectareas)} hectáreas
```

Propuesto: igual al original.

## scripts/datina.js#mapaProv

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, mapaProv, línea 2276
- Tipo: gráfico
- Estado: **conservado deliberadamente**
- Motivo: Literal que busca scripts/prueba_fallas.mjs.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
No se pudo cargar el mapa.
```

Propuesto: igual al original.

## scripts/datina.js#mapaDep

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, mapaDep, línea 2324
- Tipo: gráfico
- Estado: **conservado deliberadamente**
- Motivo: Literal que busca scripts/prueba_fallas.mjs.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
No se pudo cargar el mapa.
```

Propuesto: igual al original.

## scripts/datina.js#PROV_CUENCA

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, PROV_CUENCA, línea 2360
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Neuquén
Rio Negro
Mendoza
La Pampa
```

Propuesto: igual al original.

## scripts/datina.js#mapaPozos

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, mapaPozos, línea 2364
- Tipo: gráfico
- Estado: **conservado deliberadamente**
- Motivo: Literal que busca scripts/prueba_fallas.mjs.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
No se pudo cargar el mapa.
```

Propuesto: igual al original.

## scripts/datina.js#mapaPozos.tipArea

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, mapaPozos › tipArea, línea 2400
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
<br>${a.empresa}<br>En ${PG.areas_anio}: ${kbdF(a.pet_kbd)} mil barriles de petróleo 
y ${n1(a.gas_mmm3d)} millones de m³ de gas por día
<br>No convencional: ${pct(a.pct_pet_nc)} del petróleo
<br>Sin producción en ${PG.areas_anio}
```

Propuesto: igual al original.

## scripts/datina.js#mapaCentrales

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, mapaCentrales, línea 2424
- Tipo: gráfico
- Estado: **conservado deliberadamente**
- Motivo: Literal que busca scripts/prueba_fallas.mjs.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
No se pudo cargar el mapa.
```

Propuesto: igual al original.

## scripts/datina.js#CENSO_FRASE

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, CENSO_FRASE, línea 2459
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
tenía agua de red pública
tenía desagüe del inodoro a red cloacal
tenía internet en la vivienda
```

Propuesto: igual al original.

## scripts/datina.js#ejeMil

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, ejeMil, línea 2477
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
1 millón
```

Propuesto: igual al original.

## scripts/datina.js#protegerDib

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, protegerDib, línea 2484
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
Datina: no se pudo dibujar el gráfico ${k}.
No se pudo dibujar este gráfico.
```

Propuesto: igual al original.

## scripts/datina.js#DIB.pct_un_anio_o_menos

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, DIB › pct_un_anio_o_menos, línea 2527
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Total ${pct(RO.total)}
```

Propuesto: igual al original.

## scripts/datina.js#DIB.femicidios

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, DIB › femicidios, línea 2625
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Femicidios
```

Propuesto: igual al original.

## scripts/datina.js#SERIES_TIPO

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, SERIES_TIPO, línea 2721
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Convencional
Tight
Shale
```

Propuesto: igual al original.

## scripts/datina.js#textoArea.t

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, textoArea › t, línea 2737
- Tipo: gráfico
- Estado: **conservado deliberadamente**
- Motivo: Rótulo de las tablas y del gráfico: la nota lo explica.
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
${tituloArea(r.nombre)} está ${r.territorio === "Mar argentino" ? "en el mar argentino, a más de doce millas de la costa" : "en " + r.territorio}, en la cuenca ${CUENCA_DE[r.cuenca] || r.cuenca}. 
En ${PG.areas_anio} no produjo ${gas ? "gas" : "petróleo"}.
```

Propuesto: igual al original.

## scripts/datina.js#DIB.pct_garrafa

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, DIB › pct_garrafa, línea 2761
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Garrafa
Electricidad
```

Propuesto: igual al original.

## scripts/datina.js#DIB.pct_lena

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, DIB › pct_lena, línea 2762
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Leña o carbón
Todo el país
```

Propuesto: igual al original.

## scripts/datina.js#DIB.avanzada

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, DIB › avanzada, línea 2872
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Avanzada
Servicio
```

Propuesto: igual al original.

## scripts/datina.js#DIB.pct_ind

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, DIB › pct_ind, línea 2981
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Industrias y grandes comercios
 En ${fp.territorio}, los hogares son el ${pct(fp.pct_res)} de la demanda, los comercios y servicios el ${pct(fp.pct_com)} y las industrias y los grandes comercios el ${pct(fp.pct_ind)}.
Todo el país
 En ${fp.territorio}, ${n0(fp[col])} kWh por habitante${conVeces(fp[col], ref)}.
País ${n0(ref)}
<b>${d.territorio}</b><br>${n0(d[col])} kWh por habitante en ${e.el_ult}<br>De su demanda: hogares ${pct(d.pct_res)}, comercios y servicios ${pct(d.pct_com)}, 
industrias y grandes comercios ${pct(d.pct_ind)}
```

Propuesto: igual al original.

## scripts/datina.js#DIB.hurtos

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, DIB › hurtos, línea 3062
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Hurtos
Amenazas
Lesiones dolosas
<b>${d.territorio}</b><br>${n0(d.hechos)} hechos en ${SG.anio}<br>${n0(d.tasa)} cada 100.000 habitantes<br>${pct(d.pct)} de los delitos registrados
```

Propuesto: igual al original.

## scripts/datina.js#DIB.pct_otro_pais

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, DIB › pct_otro_pais, línea 3258
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
En otro país
 En ${fp.territorio}, el ${pct(fp.pct_otra_provincia)}
 había nacido en otra provincia y el ${pct(fp.pct_otro_pais)}, en otro país.
Todo el país
```

Propuesto: igual al original.

## scripts/datina.js#ESP_VARIANTE

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, ESP_VARIANTE, línea 3458
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Peronismo
Otras fuerzas
```

Propuesto: igual al original.

## scripts/datina.js#clavesEl.hayOtras

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, clavesEl › hayOtras, línea 3475
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Otras
Otras
Otras
```

Propuesto: igual al original.

## scripts/datina.js#MED.congreso

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, MED.congreso, línea 3498
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Diputados
```

Propuesto: igual al original.

## scripts/datina.js#DIB.congreso.cam

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, DIB.congreso › cam, línea 3501
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Diputados
Diputados
```

Propuesto: igual al original.

## scripts/datina.js#lgMes

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, lgMes, línea 3523
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
sin fecha
sin fecha
```

Propuesto: igual al original.

## scripts/datina.js#lgNom.c

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, lgNom › c, línea 3530
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Senado
Diputados
```

Propuesto: igual al original.

## scripts/datina.js#DIB.legisladores.c

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, DIB.legisladores › c, línea 3582
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
No se pudo cargar la lista.
```

Propuesto:

```text
No se pudo cargar la lista de legisladores.
```

## scripts/datina.js#DIB.legisladores.cuenta

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, DIB.legisladores › cuenta, línea 3604
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
 de el 
```

Propuesto: igual al original.

## scripts/datina.js#AC_CAM

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, AC_CAM, línea 3631
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
 en Diputados
 en el Senado
```

Propuesto: igual al original.

## scripts/datina.js#textoAnios.k

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, textoAnios › k, línea 3634
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
${NOMBRES[p]} no tuvo legisladores${AC_CAM[v]} desde 1983.
```

Propuesto: igual al original.

## scripts/datina.js#textoAnios.sig

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, textoAnios › sig, línea 3651
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
 En total, ${n0(AC.personas)} personas ocuparon una banca en ese tiempo, ${n0(AC.dos_camaras)} de ellas en las dos cámaras, 
y ${AC.veinte} sumaron 20 años o más (${AC.veinte_siguen === 1 ? "una sigue" : `${AC.veinte_siguen} siguen`} en el cargo).
```

Propuesto: igual al original.

## scripts/datina.js#DIB.anioscong.claves

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, DIB.anioscong › claves, línea 3663
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Diputados
Senado
```

Propuesto: igual al original.

## scripts/datina.js#DIB.anioscong.el

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, DIB.anioscong › el, línea 3685
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
No se pudo cargar el hemiciclo.
```

Propuesto: igual al original.

## scripts/datina.js#cargarSeriesCru.el

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, cargarSeriesCru › el, línea 3734
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
No se pudieron cargar las series.
```

Propuesto: igual al original.

## scripts/datina.js#cargarSeriesCru.mx

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, cargarSeriesCru › mx, línea 3739
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
<span><i class="lab-ini"></i>En ${LAB_A0}</span><span><i class="lab-fin"></i>En ${LAB_A1}</span>
```

Propuesto: igual al original.

## scripts/datina.js#trayectorias.C

- Rutas: a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-recursos-empleo.html, indice.html, laboratorio.html
- Fuente: `scripts/datina.js`, trayectorias › C, línea 3749
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-exportaciones-empleo.html, a-internet-aprender.html y otras.

Original:

```text
${cfg.yLab} y ${cfg.xLab.toLowerCase()} de ${data.length} jurisdicciones en ${cfg.a0} y en ${cfg.a1}
```

Propuesto: igual al original.

## scripts/datina.js#trayectorias.tip

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, politica.html, provincia.html, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/datina.js`, trayectorias › tip, línea 3778
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
<b>${d.nom}</b><br>${cfg.xLab}: ${cfg.fx(d.x0)} en ${cfg.a0} y ${cfg.fx(d.x1)} en ${cfg.a1}<br>${cfg.yLab}: ${cfg.fy(d.y0)} en ${cfg.a0} y ${cfg.fy(d.y1)} en ${cfg.a1}
```

Propuesto: igual al original.

## scripts/datina.js#coAnios

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, coAnios, línea 3799
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
de ${j.anio_desde} a ${j.anio_hasta}
```

Propuesto: igual al original.

## scripts/datina.js#coMotivo

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, coMotivo, línea 3801
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Renunció
Murió en el cargo
jubilación
Se jubiló
juicio político
Salió por juicio político
```

Propuesto: igual al original.

## scripts/datina.js#coMotivo.cesanteado por un gobierno de facto

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, coMotivo › cesanteado por un gobierno de facto, línea 3802
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
cesanteado por un gobierno de facto
Salió por la cesantía que dispuso un gobierno de facto
límite de edad
Llegó al límite de edad
```

Propuesto: igual al original.

## scripts/datina.js#CO_CORTO

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, CO_CORTO, línea 3819
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Liberales
De facto
```

Propuesto: igual al original.

## scripts/datina.js#cuadradosCorte.yFila

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, cuadradosCorte › yFila, línea 4034
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
<b>${p.presidente}</b>, desde ${p.inicio.slice(0, 4)}<br>
```

Propuesto: igual al original.

## scripts/datina.js#notaCorte.tiempo

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, notaCorte › tiempo, línea 4059
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
de ${j.desde} a ${j.hasta}
```

Propuesto: igual al original.

## scripts/datina.js#VOTO_COL

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, VOTO_COL, línea 4120
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
A favor
En contra
Abstención
Ausente
```

Propuesto: igual al original.

## scripts/datina.js#fechaLarga

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, fechaLarga, línea 4123
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
${+f.slice(8, 10)} de ${MESES[+f.slice(5, 7) - 1]} de ${f.slice(0, 4)}
```

Propuesto: igual al original.

## scripts/datina.js#resumenEspacios.txt

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, resumenEspacios › txt, línea 4135
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
votó
```

Propuesto: igual al original.

## scripts/datina.js#MED.vtLey

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, MED.vtLey, línea 4147
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Diputados
Diputados
```

Propuesto: igual al original.

## scripts/datina.js#vtCargar

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, vtCargar, línea 4155
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Sin provincia
```

Propuesto: igual al original.

## scripts/datina.js#puntosVoto.C

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, puntosVoto › C, línea 4179
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
a favor
en contra
abstención
```

Propuesto: igual al original.

## scripts/datina.js#DIB.votaciones.t

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, DIB.votaciones › t, línea 4196
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Diputados
En Diputados
En el Senado
```

Propuesto: igual al original.

## scripts/datina.js#DIB.votaciones.base

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, DIB.votaciones › base, línea 4198
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
${en}, el ${fechaLarga(C.fecha)}, votaron ${t.si} a favor y ${t.no} en contra
 y no faltó nadie.
El Senado no publica el acta con el voto de cada senador de esta ley. 
```

Propuesto:

```text
${en}, el ${fechaLarga(C.fecha)}, votaron ${t.si} a favor y ${t.no} en contra
 y no faltó nadie.
El Senado no publica el acta con el voto de cada senador de esta votación. 
```

## scripts/datina.js#DIB.votaciones.lead

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, DIB.votaciones › lead, línea 4205
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
<p class="nota">El Senado no publica el acta con el voto de cada senador de esta votación. Elegí Diputados para verla.</p>
No se pudieron cargar los votos.
```

Propuesto: igual al original.

## scripts/datina.js#DIB.votaciones.filas

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, DIB.votaciones › filas, línea 4211
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
votó a favor
votaron a favor
votó en contra
votaron en contra
se abstuvo
se abstuvieron
no estuvo
no estuvieron
 De ${mio.length === 1 ? "el legislador" : `los ${mio.length} ${cam === "Diputados" ? "diputados" : "senadores"}`} de ${NOMBRES[prov]}, ${listaY(fr)}.
De el 
Del 
Senado
```

Propuesto: igual al original.

## scripts/datina.js#PLATAFORMA_2023.Peronismo

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, PLATAFORMA_2023 › Peronismo, línea 4221
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Peronismo
Unión por la Patria
ON 134 UNION POR LA PATRIA PLATAFORMA.pdf
```

Propuesto: igual al original.

## scripts/datina.js#PLATAFORMA_2023.La Libertad Avanza

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, PLATAFORMA_2023 › La Libertad Avanza, línea 4222
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
La Libertad Avanza
La Libertad Avanza
ON 135 LA LIBERTAD AVANZA PLATAFORMA.pdf
```

Propuesto: igual al original.

## scripts/datina.js#PLATAFORMA_2023.PRO

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, PLATAFORMA_2023 › PRO, línea 4223
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Juntos por el Cambio
ON 132 JUNTOS POR EL CAMBIO.pdf
```

Propuesto: igual al original.

## scripts/datina.js#PLATAFORMA_2023.UCR y aliados

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, PLATAFORMA_2023 › UCR y aliados, línea 4224
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
UCR y aliados
Juntos por el Cambio
ON 132 JUNTOS POR EL CAMBIO.pdf
```

Propuesto: igual al original.

## scripts/datina.js#PLATAFORMA_2023.Izquierda

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, PLATAFORMA_2023 › Izquierda, línea 4226
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Izquierda
Frente de Izquierda y de Trabajadores Unidad
ON 136 FRENTE DE IZQUIERDA Y DE TRABAJADORES - UNIDAD PLATAFORMA.pdf
```

Propuesto: igual al original.

## scripts/datina.js#POSTURA_CORTA

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, POSTURA_CORTA, línea 4282
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
A favor
En contra
Dividido
Ausente
```

Propuesto: igual al original.

## scripts/datina.js#abrirEspacio

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, abrirEspacio, línea 4300
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Diputados
Senado
```

Propuesto: igual al original.

## scripts/datina.js#abrirEspacio.en

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, abrirEspacio › en, línea 4307
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Diputados
En Diputados
En el Senado
```

Propuesto: igual al original.

## scripts/datina.js#abrirEspacio.plat

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, abrirEspacio › plat, línea 4316
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
<a href="${CNE_2023 + encodeURIComponent(pl[1])}" target="_blank" rel="noopener">Plataforma electoral de ${pl[0]}</a> <small>(PDF presentado ante la Cámara Nacional Electoral)</small>
Este grupo reúne a partidos distintos y no tiene una plataforma nacional única.
```

Propuesto: igual al original.

## scripts/datina.js#abrirEspacio.voto

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, abrirEspacio › voto, línea 4319
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
<li><span>${cam}</span><em class="sin">Sin acta nominal publicada</em></li>
<li><span>${cam}</span><em class="sin">Sin legisladores del espacio</em></li>
a favor
en contra
abstención
```

Propuesto: igual al original.

## scripts/datina.js#abrirEspacio.leyes

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, abrirEspacio › leyes, línea 4326
- Tipo: gráfico
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Diputados
Senado
<div class="esp-cab"><i style="background:${ESP_COLOR[e]}" aria-hidden="true"></i><div><p class="esp-eb">Espacio político</p><h3 id="esp-tit">${e}</h3></div>
<button type="button" class="boton chico esp-cerrar">Cerrar</button></div><div class="esp-cuerpo"><p class="esp-res">${resumen}</p>
<div class="esp-plat"><p class="esp-eb">Qué propuso en 2023</p><p>${plat}</p></div>
<h4 class="esp-eb">Ley por ley</h4><ol class="esp-leyes">
<ul class="esp-votos">${voto(l, "Diputados")}${voto(l, "Senado")}</ul><button type="button" class="enlace esp-ver" data-k="${l.k}">Ver el voto de cada legislador</button></li>
</ol><p class="nota">Postura de la mayoría de los legisladores del espacio en la votación en general, según el acta de cada cámara. 
El espacio de cada legislador sale del bloque que registra el acta, con la clasificación propia de esta sección. La selección de leyes también es propia.</p></div>
```

Propuesto:

```text
Diputados
Senado
<div class="esp-cab"><i style="background:${ESP_COLOR[e]}" aria-hidden="true"></i><div><p class="esp-eb">Espacio político</p><h3 id="esp-tit">${e}</h3></div>
<button type="button" class="boton chico esp-cerrar">Cerrar</button></div><div class="esp-cuerpo"><p class="esp-res">${resumen}</p>
<div class="esp-plat"><p class="esp-eb">Qué propuso en 2023</p><p>${plat}</p></div>
<h4 class="esp-eb">Ley por ley</h4><ol class="esp-leyes">
<ul class="esp-votos">${voto(l, "Diputados")}${voto(l, "Senado")}</ul><button type="button" class="enlace esp-ver" data-k="${l.k}">Ver el voto de cada legislador</button></li>
</ol><p class="nota">Postura de la mayoría de los legisladores del espacio en la votación en general, según el acta de cada cámara. 
El espacio de cada legislador sale del bloque que registra el acta, con la clasificación propia de esta sección. La selección de leyes y proyectos también es propia.</p></div>
```

## scripts/datina.js#MED.presupuesto

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, MED.presupuesto, línea 4377
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Diputados
```

Propuesto: igual al original.

## scripts/datina.js#textoPresupuesto.r

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, textoPresupuesto › r, línea 4382
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Diputados
```

Propuesto: igual al original.

## scripts/datina.js#rvNombre

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, rvNombre, línea 4406
- Tipo: gráfico
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
${g.presidente}, ${g.anios[0] === g.anios[1] ? g.anios[0] : g.anios[0] + " a " + g.anios[1]} (elección ${g.eleccion})
```

Propuesto:

```text
${g.presidente}, ${g.anios[0] === g.anios[1] ? g.anios[0] : g.anios[0] + " a " + g.anios[1]} (elección de ${g.eleccion})
```

## scripts/datina.js#fuerza

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, fuerza, línea 4468
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
débil
```

Propuesto: igual al original.

## scripts/datina.js#MED.adonse.f

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, MED.adonse › f, línea 4480
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
País ${f(pais[k])}
<b>${d.territorio}</b><br>${f(d[k])} muertes por año cada 100.000 habitantes, ajustada por edad
<br>${n0(d.tasa_bruta)} sin ajustar
<br>${pct(d[mk] / d.muertes * 100)} de las muertes de la provincia
<br>${n0(d[mk])} muertes de ${CM.desde} a ${CM.hasta}
```

Propuesto: igual al original.

## scripts/datina.js#RUB_EX

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, RUB_EX, línea 4510
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Agroindustria
Industria
Primarios
Energía
```

Propuesto: igual al original.

## scripts/datina.js#RUB_EX.series

- Rutas: a-dolar-inversion.html, a-exportaciones-dolar.html, catalogo.html, externo.html, gobierno.html, petroleo.html, trabajo.html
- Fuente: `scripts/datina.js`, RUB_EX › series, línea 4513
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: a-dolar-inversion.html, a-exportaciones-dolar.html, catalogo.html, externo.html, gobierno.html, petroleo.html y otras.

Original:

```text
millones de dólares
```

Propuesto: igual al original.

## scripts/datina.js#DIB.exprov.P

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, DIB.exprov › P, línea 4544
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Agroindustria
Industria
Primarios
Energía
```

Propuesto: igual al original.

## scripts/datina.js#DIB.exprov.tip

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, politica.html, provincia.html, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/datina.js`, DIB.exprov › tip, línea 4547
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: a-dolar-inversion.html, a-exportaciones-dolar.html, catalogo.html, externo.html, gobierno.html, petroleo.html y otras.

Original:

```text
<b>${d.territorio}</b><br>${n0(d.millones_usd)} millones de dólares
```

Propuesto: igual al original.

## scripts/datina.js#DIB.exprov.pais

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, DIB.exprov › pais, línea 4554
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Todo el país
```

Propuesto: igual al original.

## scripts/datina.js#DIB.balanza.d

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, DIB.balanza › d, línea 4562
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Exportaciones
Importaciones
Saldo
```

Propuesto: igual al original.

## scripts/datina.js#RUB_IM

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, RUB_IM, línea 4565
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Intermedios
Piezas
Capital
Consumo
Autos
Combustibles
Resto
```

Propuesto: igual al original.

## scripts/datina.js#DIB.importaciones.series

- Rutas: a-dolar-inversion.html, a-exportaciones-dolar.html, catalogo.html, externo.html, gobierno.html, petroleo.html, trabajo.html
- Fuente: `scripts/datina.js`, DIB.importaciones › series, línea 4569
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: a-dolar-inversion.html, a-exportaciones-dolar.html, catalogo.html, externo.html, gobierno.html, petroleo.html y otras.

Original:

```text
millones de dólares
```

Propuesto: igual al original.

## scripts/datina.js#DIB.origen.tip

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, politica.html, provincia.html, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/datina.js`, DIB.origen › tip, línea 4572
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: construccion.html, economia.html, externo.html, gobierno.html, naturaleza.html.

Original:

```text
<b>${d.origen_nombre}</b><br>${n0(d.millones_usd)} millones de dólares, el ${pct(d.pct)} del total
<br>${conSigno(d.variacion)} frente a los mismos meses del año anterior
```

Propuesto: igual al original.

## scripts/datina.js#DIB.origen.d

- Rutas: catalogo.html, economia.html, externo.html, relaciones.html
- Fuente: `scripts/datina.js`, DIB.origen › d, línea 4578
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html, economia.html, externo.html, relaciones.html.

Original:

```text
Cuenta corriente
Saldo total
Bienes
```

Propuesto: igual al original.

## scripts/datina.js#DIB.origen.datos

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, DIB.origen › datos, línea 4590
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Reservas brutas
Dólares de los bancos en el BCRA
Depósitos del Tesoro
Otras deudas a un año
Depósitos y otras deudas a un año
```

Propuesto: igual al original.

## scripts/datina.js#conArt

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, conArt, línea 4630
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Ciudad
```

Propuesto: igual al original.

## scripts/datina.js#conArt.marcar

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, conArt › marcar, línea 4641
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
1 millón
<b>${d.nombre}</b><br>${mil(d[t + "_pesos"])} pesos por mes, ${pct(d[t + "_pct_pais"])} de la mediana de los 31 aglomerados
<br>${n0(d[t + "_casos"])} ${t === "ipcf" ? "personas" : "ocupados"} encuestados en los cuatro trimestres<br>Solo con el ${IA.trimestre}: ${mil(d[t + "_pesos_ultimo_trimestre"])}
```

Propuesto: igual al original.

## scripts/datina.js#icgElecciones.C

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, icgElecciones › C, línea 4657
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Arriba, el índice de confianza en el gobierno mes a mes. Abajo, el voto a la candidatura del gobierno en cada elección: 
${elecTx(d)}, ${pct(d.voto_gobierno_pct)}, con el índice en ${n2(d.indice)} el mes anterior
```

Propuesto: igual al original.

## scripts/datina.js#icgElecciones.leerEl

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, icgElecciones › leerEl, línea 4707
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
<span><i style="background:${AZ}"></i>Confianza en ${mesPer(d.mes_indice)} ${n2(d.indice)}</span>
```

Propuesto: igual al original.

## scripts/datina.js#icgElecciones.el

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, icgElecciones › el, línea 4744
- Tipo: gráfico
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
las PASO de ${x.anio}
la primera vuelta de ${x.anio}
Las dos líneas suben y bajan juntas: en las ${E.n} elecciones presidenciales entre ${E.desde} y ${E.hasta}, la candidatura del gobierno sacó 
más votos cuando la confianza en el gobierno del mes anterior era más alta. La relación es ${grado} (correlación de ${n2(E.r)})
Las dos líneas van en sentido contrario: en las ${E.n} elecciones presidenciales entre ${E.desde} y ${E.hasta}, la candidatura del gobierno sacó 
menos votos cuando la confianza en el gobierno del mes anterior era más alta. La relación es ${grado} (correlación de ${n2(E.r)})
En las ${E.n} elecciones presidenciales entre ${E.desde} y ${E.hasta} no hubo una relación clara entre la confianza en el gobierno del mes anterior 
y el voto a la candidatura del gobierno (correlación de ${n2(E.r)})
${rel}. Antes de ${elec(E.max)} el índice estaba en ${n2(E.max.indice)}, el más alto antes de una elección, y 
${E.max.cand} sacó el ${pct(E.max.voto)} de los votos positivos. Antes de ${elec(E.min)} estaba en ${n2(E.min.indice)}, el más bajo, y ${E.min.cand} sacó el 
${pct(E.min.voto)}. La candidatura del gobierno fue la más votada en ${E.primero} de las ${E.n} elecciones.
Promedio mensual del índice con cada gobierno, en la escala de 0 a 5: 
. El gobierno actual lleva ${u.meses} meses en la serie, así que su promedio 
todavía no abarca un mandato completo. El promedio de toda la serie es ${n2(C.promedio)}.
Promedio ${n2(C.promedio)}
<b>${d.territorio}</b><br>Promedio ${n2(d.v)}, ${d.f.meses} meses (${mesPer(d.f.desde)} a ${mesPer(d.f.hasta)})<br>Primeros doce meses ${n2(d.f.primeros_12)}
<br>Mínimo ${n2(d.f.minimo)} y máximo ${n2(d.f.maximo)}
```

Propuesto:

```text
las PASO de ${x.anio}
la primera vuelta de ${x.anio}
Las dos líneas suben y bajan juntas: en las ${E.n} elecciones presidenciales entre ${E.desde} y ${E.hasta}, la candidatura del gobierno tendió a sacar 
más votos cuando la confianza en el gobierno del mes anterior era más alta. La relación es ${grado} (correlación de ${n2(E.r)})
Las dos líneas van en sentido contrario: en las ${E.n} elecciones presidenciales entre ${E.desde} y ${E.hasta}, la candidatura del gobierno tendió a sacar 
menos votos cuando la confianza en el gobierno del mes anterior era más alta. La relación es ${grado} (correlación de ${n2(E.r)})
En las ${E.n} elecciones presidenciales entre ${E.desde} y ${E.hasta} no hubo una relación clara entre la confianza en el gobierno del mes anterior 
y el voto a la candidatura del gobierno (correlación de ${n2(E.r)})
${rel}. Antes de ${elec(E.max)} el índice estaba en ${n2(E.max.indice)}, el más alto antes de una elección, y 
${E.max.cand} sacó el ${pct(E.max.voto)} de los votos positivos. Antes de ${elec(E.min)} estaba en ${n2(E.min.indice)}, el más bajo, y ${E.min.cand} sacó el 
${pct(E.min.voto)}. La candidatura del gobierno fue la más votada en ${E.primero} de las ${E.n} elecciones. Que el índice y el voto vayan juntos no muestra que uno cause el otro.
Promedio mensual del índice con cada gobierno, en la escala de 0 a 5: 
. El gobierno actual lleva ${u.meses} meses en la serie, así que su promedio 
todavía no abarca un mandato completo. El promedio de toda la serie es ${n2(C.promedio)}.
Promedio ${n2(C.promedio)}
<b>${d.territorio}</b><br>Promedio ${n2(d.v)}, ${d.f.meses} meses (${mesPer(d.f.desde)} a ${mesPer(d.f.hasta)})<br>Primeros doce meses ${n2(d.f.primeros_12)}
<br>Mínimo ${n2(d.f.minimo)} y máximo ${n2(d.f.maximo)}
```

## scripts/datina.js#MED.desempleo.el

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, MED.desempleo › el, línea 4810
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Otras del sector público
Efectivo mínimo
FMI y otros organismos
```

Propuesto: igual al original.

## scripts/datina.js#BCR_VISTAS.tna

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, BCR_VISTAS › tna, línea 4846
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Tasa
Tasa real
Tasa
Tasa real
Con inflación
Sin inflación
```

Propuesto: igual al original.

## scripts/datina.js#BCR_VISTAS.usd

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, BCR_VISTAS › usd, línea 4848
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
En dólares
% del PBI
```

Propuesto: igual al original.

## scripts/datina.js#bcrCfg.inf12

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, bcrCfg › inf12, línea 4854
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Inflación de los mismos 12 meses
Inflación
 del PBI
 de pesos
 de pesos
Tasa real a 30 días
Tasa real
Tasa
Tasa
 del PBI
Sin la inflación
Sin inflación
${v.n}, variación en 12 meses
Tasa
Inflación esperada
Esperada
Inflación que hubo en esos 12 meses
La que hubo
```

Propuesto: igual al original.

## scripts/datina.js#bcrConm.conm

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, bcrConm › conm, línea 4879
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Valor
```

Propuesto: igual al original.

## scripts/datina.js#bcrTxt.doce

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, bcrTxt › doce, línea 4902
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
, ${conSigno((u[k] / ant[k] - 1) * 100)} en doce meses
```

Propuesto: igual al original.

## scripts/datina.js#bcrTxt.b

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, bcrTxt › b, línea 4906
- Tipo: gráfico
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
${v.n}: ${c.f(u[k])} en ${mes(u)}${doce}. En pesos de cada mes, la serie sube sobre todo por la inflación: para comparar en el tiempo están las vistas sin la inflación, 
desde ${mesPer(BV.ipc_desde)}, y en % del PBI, desde ${BV.pib_desde}.
${v.n}, en pesos de ${mesPer(BV.ipc_mes)}: ${bMonto(u[k])} en ${mes(u)}${doce}.
${v.n}, descontada la inflación de la Argentina y la de los Estados Unidos: ${c.f(u[k])} por dólar en ${mes(u)}.
 Todos los valores están en pesos de ${mesPer(BV.tcr_mes)}.
${v.n}: ${c.f(u[k])} por dólar en ${mes(u)}${doce}. La vista a precios de hoy descuenta la inflación de la Argentina y la de los Estados Unidos.
, contra ${pct(ant[k])} un año antes
. El valor más alto desde ${mes(con[0])} fue de ${pct(mx[k])}, en ${mes(mx)}.
${v.n}: tasa real a 30 días de ${conSigno(u[k])} en ${mes(u)}, con una inflación de ${pct(u.inflacion_mes_siguiente)} en el mes siguiente.
 En los últimos doce meses con dato fue positiva en ${pos} y negativa en ${12 - pos}.
 Desde ${mes(con[0])}, el promedio fue de ${conSigno(d3.mean(con, r => r[k]))} por mes.
${v.n}, descontada la inflación: ${conSigno(u[k])} en ${mes(u)}.
 En ${mes(b)}, el último mes con inflación publicada, fue de ${pct(b[k])}, con una inflación de ${pct(b[c.extra.k])} en los mismos doce meses.
${v.n}: ${conSigno(b[k])} en los doce meses hasta ${mes(b)}, contra una inflación de ${pct(b[c.extra.k])}.
${v.n}: ${conSigno(u[k])} en los doce meses hasta ${mes(u)}.
, lo que suman los intereses desde ${mes(con[0])}
. La vista en 12 meses compara su variación con la inflación.
${v.n}: ${c.f(u[k])} en ${mes(u)}, pasado a pesos con el dólar mayorista de fin de mes.
En ${mes(u)}, quienes responden el Relevamiento de Expectativas de Mercado del BCRA esperaban ${pct(u[k])} de inflación para los doce meses siguientes.
 La última expectativa que ya se puede comparar, la de ${mes(b)}, fue de ${pct(b[k])}, y la inflación de esos doce meses resultó de ${pct(b[c.extra.k])}.
 En ${mas} de los ${ambos.length} meses comparables, la inflación fue mayor que la esperada.
```

Propuesto:

```text
${v.n}: ${c.f(u[k])} en ${mes(u)}${doce}. En pesos de cada mes, la serie sube sobre todo por la inflación: para comparar en el tiempo están las vistas sin la inflación, 
desde ${mesPer(BV.ipc_desde)}, y en % del PBI, desde ${BV.pib_desde}.
${v.n}, en pesos de ${mesPer(BV.ipc_mes)}: ${bMonto(u[k])} en ${mes(u)}${doce}.
${v.n}, descontada la inflación de la Argentina y la de los Estados Unidos: ${c.f(u[k])} por dólar en ${mes(u)}.
 Todos los valores están en pesos de ${mesPer(BV.tcr_mes)}.
${v.n}: ${c.f(u[k])} por dólar en ${mes(u)}${doce}. La vista «Sin inflación» descuenta la inflación de la Argentina y la de los Estados Unidos.
, contra ${pct(ant[k])} un año antes
. El valor más alto desde ${mes(con[0])} fue de ${pct(mx[k])}, en ${mes(mx)}.
${v.n}: tasa real a 30 días de ${conSigno(u[k])} en ${mes(u)}, con una inflación de ${pct(u.inflacion_mes_siguiente)} en el mes siguiente.
 En los últimos doce meses con dato fue positiva en ${pos} y negativa en ${12 - pos}.
 Desde ${mes(con[0])}, el promedio fue de ${conSigno(d3.mean(con, r => r[k]))} por mes.
${v.n}, descontada la inflación: ${conSigno(u[k])} en ${mes(u)}.
 En ${mes(b)}, el último mes con inflación publicada, fue de ${pct(b[k])}, con una inflación de ${pct(b[c.extra.k])} en los mismos doce meses.
${v.n}: ${conSigno(b[k])} en los doce meses hasta ${mes(b)}, contra una inflación de ${pct(b[c.extra.k])}.
${v.n}: ${conSigno(u[k])} en los doce meses hasta ${mes(u)}.
, lo que suman los intereses desde ${mes(con[0])}
. La vista en 12 meses compara su variación con la inflación.
${v.n}: ${c.f(u[k])} en ${mes(u)}, pasado a pesos con el dólar mayorista de fin de mes.
En ${mes(u)}, quienes responden el Relevamiento de Expectativas de Mercado del BCRA esperaban ${pct(u[k])} de inflación para los doce meses siguientes.
 La última expectativa que ya se puede comparar, la de ${mes(b)}, fue de ${pct(b[k])}, y la inflación de esos doce meses resultó de ${pct(b[c.extra.k])}.
 En ${mas} de los ${ambos.length} meses comparables, la inflación fue mayor que la esperada.
```

## scripts/datina.js#DIB.bcra.filas

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, DIB.bcra › filas, línea 4941
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
No hay datos de esta variable.
```

Propuesto: igual al original.

## scripts/datina.js#DIB.bcra.log

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, DIB.bcra › log, línea 4946
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Último dato
```

Propuesto: igual al original.

## scripts/datina.js#DIB.bcra.caja

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, DIB.bcra › caja, línea 4948
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
#f-bcra .tabla-datos
```

Propuesto: igual al original.

## scripts/datina.js#ORIGEN_COLOR

- Rutas: catalogo.html, construccion.html, educacion.html, pobreza.html, politica.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94, turismo.html
- Fuente: `scripts/datina.js`, ORIGEN_COLOR, línea 5015
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html, construccion.html, educacion.html, pobreza.html, politica.html, provincia.html y otras.

Original:

```text
Ciudad de Buenos Aires
Conurbano
Resto de Buenos Aires
Otras provincias
Otro país
```

Propuesto: igual al original.

## scripts/datina.js#ORIGEN_TEXTO

- Rutas: catalogo.html, construccion.html, educacion.html, pobreza.html, politica.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94, turismo.html
- Fuente: `scripts/datina.js`, ORIGEN_TEXTO, línea 5016
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html, construccion.html, educacion.html, pobreza.html, politica.html, provincia.html y otras.

Original:

```text
Ciudad de Buenos Aires
Conurbano
Resto de Buenos Aires
Otras provincias
Otro país
```

Propuesto: igual al original.

## scripts/datina.js#DIB.representacion.series

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, DIB.representacion › series, línea 5081
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Llegaron
Resueltos
```

Propuesto: igual al original.

## scripts/datina.js#DIB.representacion.xl

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, DIB.representacion › xl, línea 5082
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
<br><span class="suave">${n0(d.fallos)} fallos en ${d.acuerdos} acuerdos</span>
```

Propuesto: igual al original.

## scripts/datina.js#JUS_CLAVES.mp

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, JUS_CLAVES › mp, línea 5086
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Fiscalías
Defensorías
```

Propuesto: igual al original.

## scripts/datina.js#CP_CLAVES.filas

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, CP_CLAVES › filas, línea 5115
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
<br>La ley fija ${d.miembros_ley}
<br>Sin el número de la ley verificado
```

Propuesto:

```text
<br>La ley fija ${d.miembros_ley}
<br>Sin verificar en la ley cuántos lugares tiene
```

## scripts/datina.js#JP_NOMBRE.m

- Rutas: catalogo.html, departamentos.html, politica.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94, salud.html, seguridad.html
- Fuente: `scripts/datina.js`, JP_NOMBRE › m, línea 5120
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: catalogo.html, departamentos.html, politica.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06 y otras.

Original:

```text
País ${n1(P.pais[m])}
<b>${d.territorio}</b><br>${n1(d[k])} ${JP_NOMBRE[m]} cada 100.000 habitantes<br>${n0(d[m])} en total
<br>Dato de ${d[m + "_anio"]}
```

Propuesto: igual al original.

## scripts/datina.js#deOrganismo

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, deOrganismo, línea 5209
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
de la 
```

Propuesto: igual al original.

## scripts/datina.js#textoOCDE.med

- Rutas: energia.html, naturaleza.html, poblacion.html, salud.html, turismo.html
- Fuente: `scripts/datina.js`, textoOCDE › med, línea 5214
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: energia.html, naturaleza.html, poblacion.html, salud.html, turismo.html.

Original:

```text
 La mediana fue ${f(o.mediana)}: unos pocos países con valores extremos mueven el promedio.
```

Propuesto: igual al original.

## scripts/datina.js#textoOCDE.alto

- Rutas: construccion.html, educacion.html, energia.html, naturaleza.html, poblacion.html, pobreza.html, salud.html, trabajo.html, turismo.html
- Fuente: `scripts/datina.js`, textoOCDE › alto, línea 5215
- Tipo: gráfico
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: construccion.html, educacion.html, energia.html, naturaleza.html, poblacion.html, pobreza.html y otras.

Original:

```text
Ninguno de esos ${o.n} países tenía un valor más alto que la Argentina.
Los ${o.n} países tenían un valor más alto que la Argentina.
${o.mas_alto} de esos ${o.n} países tenían un valor más alto que la Argentina.
Según la estimación ${deOrganismo(o.origen)} para ${o.anio}, ${o.frase} fue de ${conUnidad(k, o.arg)} en la Argentina y de ${f(o.ocde)} en el promedio simple de los ${o.n} países de la OCDE con dato.${med} ${alto} En ${o.ini} los valores eran ${f(o.arg_ini)} y ${f(o.ocde_ini)}.
 Es el último año que publica el Banco Mundial para esta comparación.
```

Propuesto:

```text
Ninguno de esos ${o.n} países tenía un valor más alto que la Argentina.
Los ${o.n} países tenían un valor más alto que la Argentina.
${o.mas_alto} de esos ${o.n} países tenían un valor más alto que la Argentina.
Según la estimación ${deOrganismo(o.origen)} para ${o.anio}, ${o.frase} fue de ${conUnidad(k, o.arg)} en la Argentina y de ${f(o.ocde)} en el promedio simple de los ${o.n} países de la OCDE con dato.${med} ${alto} En ${o.ini}, la Argentina tenía ${f(o.arg_ini)} y el promedio de la OCDE, ${f(o.ocde_ini)}.
 Es el último año con dato para esta comparación.
```

## scripts/datina.js#ICONO_INFO.d

- Rutas: construccion.html, curiosidades.html, economia.html, educacion.html, emprendedores.html, empresas.html, energia.html, externo.html, gobierno.html, migraciones.html, movilidad.html, naturaleza.html, petroleo.html, poblacion.html, pobreza.html, politica.html, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/datina.js`, ICONO_INFO › d, línea 5230
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: construccion.html, curiosidades.html, economia.html, educacion.html, emprendedores.html, empresas.html y otras.

Original:

```text
<summary>${ICONO_INFO}<span>Sobre los datos</span></summary><div class="sobre-panel"></div>
.sobre[open]
.sobre[open]
.sobre[open]
```

Propuesto: igual al original.

## scripts/datina.js#VISTA.propios

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, VISTA › propios, línea 5259
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
.sobre, .nota:not(.ocde-nota), .selector-ficha, .conmutador:not(.pestanas), .aviso-serie, .clave-color, .pol-ley
```

Propuesto: igual al original.

## scripts/datina.js#CX.CORTO_PROV

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, emprendedores.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, pobreza/index.html, politica.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/datina.js`, CX › CORTO_PROV, línea 5296
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
Santiago del Estero
Sgo. del Estero
Tierra del Fuego
T. del Fuego
Buenos Aires
Bs. As.
```

Propuesto: igual al original.

## scripts/datina.js#CX.fp

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, CX › fp, línea 5393
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
menor a 0,001
```

Propuesto: igual al original.

## scripts/datina.js#CX.cargar

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, CX › cargar, línea 5404
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
No se pudieron cargar los datos de cada año.
```

Propuesto: igual al original.

## scripts/datina.js#CX.fuerza

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, CX › fuerza, línea 5411
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
prácticamente nula
débil
```

Propuesto: igual al original.

## scripts/datina.js#CX.barraTiempo

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, CX › barraTiempo, línea 5451
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Último dato
Pausar
Ver la evolución desde ${as[0]}
Reproducir
```

Propuesto: igual al original.

## scripts/datina.js#CX.irAnio

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, CX › irAnio, línea 5495
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Con 24 casos se pueden sumar hasta cuatro variables explicativas.
```

Propuesto: igual al original.

## scripts/datina.js#CX.estadisticas

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, CX › estadisticas, línea 5608
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: Era una instrucción de interfaz dentro del texto. Pasa a la nota, con la misma fórmula que el resto del sitio. Es una señal, no una prueba: "sugiere". Queda además una cuestión pendiente: Los artículos no tienen "Cómo se calcula": el coeficiente se mudó al párrafo de la correlación, después del gráfico, pero sigue en el texto.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Hacen falta al menos cinco jurisdicciones con dato para calcular la relación.
Jurisdicciones
r de Pearson
ρ de Spearman
Valor p
<div class="aclara">Calculado sobre el logaritmo de ${st.logx && st.logy ? "ambos ejes" : st.logx ? "el eje horizontal" : "el eje vertical"}</div>
${m.r > 0 ? "positiva" : "negativa"}: las jurisdicciones con valores más altos en «${X.nombre}» tienden a tener valores ${m.r > 0 ? "más altos" : "más bajos"} en «${Y.nombre}»
Con ${m.n} jurisdicciones, la relación es ${fuerza(m.r)} y ${Math.abs(m.r) < .1 ? "no muestra una tendencia clara" : sentido} (r = ${fr(m.r)}). 
Es poco probable que una relación así aparezca solo por azar (valor p ${fp(m.p)}). 
Con tan pocos casos, una relación de este tamaño puede aparecer por azar (valor p ${fp(m.p)}), así que no alcanza para afirmar que existe. 
La correlación por rangos de Spearman es ${fr(rho)}: la diferencia indica que unos pocos casos extremos o una forma no lineal pesan en el resultado. 
${datos[imax].territorio} es la jurisdicción que más mueve la recta: sin ella, r sería ${fr(r2)}. 
Los datos no son del mismo período: ${X.nombre} es de ${X.periodo} ${yE(Y.nombre)}, de ${Y.periodo}. 
 Mostrando ${st.anio}: los valores son anuales y pueden diferir del último dato, que en algunos indicadores es un promedio de varios años.
<div><h3>Más arriba de lo que marca la recta</h3><ol>${conRes.slice(0, 3).map(item).join("")}</ol></div>
<div><h3>Más abajo de lo que marca la recta</h3><ol>${conRes.slice(-3).reverse().map(item).join("")}</ol></div>
<thead><tr><th>Jurisdicción</th><th>Región</th><th class="n">${X.nombre}</th><th class="n">${Y.nombre}</th></tr></thead><tbody>
${X.nombre}: ${X.unidad}, ${X.periodo}. Fuente: ${X.fuente}. ${Y.nombre}: ${Y.unidad}, ${Y.periodo}. Fuente: ${Y.fuente}.
```

Propuesto:

```text
Hacen falta al menos cinco jurisdicciones con dato para calcular la relación.
Jurisdicciones
r de Pearson
ρ de Spearman
Valor p
<div class="aclara">Calculado sobre el logaritmo de ${st.logx && st.logy ? "ambos ejes" : st.logx ? "el eje horizontal" : "el eje vertical"}</div>
${m.r > 0 ? "positiva" : "negativa"}: las jurisdicciones con valores más altos en «${X.nombre}» tienden a tener valores ${m.r > 0 ? "más altos" : "más bajos"} en «${Y.nombre}»
Con ${m.n} jurisdicciones, la relación es ${fuerza(m.r)} y ${Math.abs(m.r) < .1 ? "no muestra una tendencia clara" : sentido} (r = ${fr(m.r)}). 
Es poco probable que una relación así aparezca solo por azar (valor p ${fp(m.p)}). 
Con tan pocos casos, una relación de este tamaño puede aparecer por azar (valor p ${fp(m.p)}), así que no alcanza para afirmar que existe. 
La correlación por rangos de Spearman es ${fr(rho)}: la diferencia sugiere que unos pocos casos extremos o una forma no lineal pesan en el resultado. 
${datos[imax].territorio} es la jurisdicción que más mueve la recta: sin ella, r sería ${fr(r2)}${fuerza(r2) !== fuerza(m.r) ? ` y la relación pasaría a ser ${fuerza(r2)}` : ""}. 
Los datos no son del mismo período: ${X.nombre} es de ${X.periodo} ${yE(Y.nombre)}, de ${Y.periodo}. 
 El gráfico muestra el año ${st.anio}: los valores son de ese año y pueden diferir del último dato, que en algunos indicadores es un promedio de varios años.
<div><h3>Más arriba de lo que marca la recta</h3><ol>${conRes.slice(0, 3).map(item).join("")}</ol></div>
<div><h3>Más abajo de lo que marca la recta</h3><ol>${conRes.slice(-3).reverse().map(item).join("")}</ol></div>
<thead><tr><th>Jurisdicción</th><th>Región</th><th class="n">${X.nombre}</th><th class="n">${Y.nombre}</th></tr></thead><tbody>
${X.nombre}: ${X.unidad}, ${X.periodo}. Fuente: ${X.fuente}. ${Y.nombre}: ${Y.unidad}, ${Y.periodo}. Fuente: ${Y.fuente}.
```

## scripts/datina.js#CX.multi

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, CX › multi, línea 5695
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Elegí al menos una variable explicativa.
No se puede estimar el modelo con estas variables: hay muy pocos casos o dos variables miden casi lo mismo.
<thead><tr><th>Variable</th><th class="n">Coeficiente estandarizado</th><th class="n">Intervalo del 95%</th><th class="n">Valor p</th><th class="n">VIF</th></tr></thead><tbody>
Con ${res.n} jurisdicciones, ${xs.length === 1 ? "la variable elegida explica" : `las ${xs.length} variables elegidas explican`} en conjunto el ${loc.format(",.0f")(res.r2 * 100)}% de las diferencias entre provincias en «${Y.nombre}» (R² ajustado ${fr(res.r2a)}, valor p del modelo ${fp(res.pF)}). 
Con las demás variables fijas, ${lista(sig.map(r => `«${META[r.k].nombre}» (${r.b > 0 ? "relación positiva" : "relación negativa"})`))} ${sig.length > 1 ? "mantienen" : "mantiene"} una relación distinta de cero. 
Ninguna variable tiene, por sí sola, una relación distinta de cero una vez que se consideran las demás. 
Algunas variables explicativas están muy correlacionadas entre sí (VIF mayor a 5): sus coeficientes por separado no son confiables. 
Con tan pocos casos, más de tres variables explicativas vuelven inestable la estimación. 
```

Propuesto:

```text
Elegí al menos una variable explicativa.
No se puede estimar el modelo con estas variables: hay muy pocos casos o dos variables miden casi lo mismo.
<thead><tr><th>Variable</th><th class="n">Coeficiente estandarizado</th><th class="n">Intervalo del 95%</th><th class="n">Valor p</th><th class="n">VIF</th></tr></thead><tbody>
Con ${res.n} jurisdicciones, ${xs.length === 1 ? "el modelo con la variable elegida reproduce" : `el modelo con las ${xs.length} variables elegidas reproduce`} el ${loc.format(",.0f")(res.r2 * 100)}% de las diferencias entre provincias en «${Y.nombre}» (R² ajustado ${fr(res.r2a)}, valor p del modelo ${fp(res.pF)}). 
${xs.length > 1 ? "Si las demás variables quedan fijas, l" : "L"}${sig.length > 1 ? "as relaciones con" : "a relación con"} ${lista(sig.map(r => `«${META[r.k].nombre}» (${r.b > 0 ? "positiva" : "negativa"})`))} ${sig.length > 1 ? "siguen siendo claras: es poco probable que se deban" : xs.length > 1 ? "sigue siendo clara: es poco probable que se deba" : "es clara: es poco probable que se deba"} al azar. 
${xs.length > 1 ? "Una vez que se tienen en cuenta las demás, ninguna variable muestra por sí sola" : "La variable elegida no muestra"} una relación que se pueda distinguir del azar. 
Algunas variables explicativas se superponen mucho entre sí (VIF mayor a 5): sus coeficientes por separado no son confiables. 
Con tan pocos casos, más de tres variables explicativas vuelven inestable la estimación. 
```

## scripts/datina.js#IX.conectividad

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, IX › conectividad, línea 5806
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Conectividad
```

Propuesto: igual al original.

## scripts/datina.js#IX.ambiente

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, IX › ambiente, línea 5808
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Ambiente
```

Propuesto: igual al original.

## scripts/datina.js#IX.caja

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, IX › caja, línea 5833
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
<button type="button" class="boton chico ix-reset" id="ix-reset">Pesos iguales</button>
```

Propuesto: igual al original.

## scripts/datina.js#tablaAreas.t

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, tablaAreas › t, línea 6029
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
<thead><tr><th>Área</th><th>Categoría</th><th>Dónde</th><th class="n">Año</th><th class="n">Hectáreas</th></tr></thead><tbody>
```

Propuesto: igual al original.

## scripts/datina.js#BZ_P

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, BZ_P, línea 6042
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
entre enero y ${MESES[SX.balanza.ytd_mes - 1]} de ${SX.balanza.ytd_anio}
```

Propuesto: igual al original.

## scripts/datina.js#EXTRA.x-pet-ytd

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, EXTRA › x-pet-ytd, línea 6228
- Tipo: texto de ficha
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado al evaluar el texto en la página con los datos reales: es de otra vista, de una cifra de En cifras, del buscador o de una vista OCDE.

Original:

```text
${PG.ytd.pet.var < 0 ? "cayó" : "creció"} la producción de petróleo entre enero y ${MESES[PG.ytd.pet.mes - 1]} de ${PG.ytd.pet.anio}, frente a los mismos meses de ${PG.ytd.pet.anio - 1}
```

Propuesto: igual al original.

## scripts/datina.js#EXTRA.x-vaca-muerta

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, EXTRA › x-vaca-muerta, línea 6229
- Tipo: texto de ficha
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado al evaluar el texto en la página con los datos reales: es de otra vista, de una cifra de En cifras, del buscador o de una vista OCDE.

Original:

```text
del petróleo del país salió de la formación Vaca Muerta entre ${PG.v_desde} y ${PG.v_hasta}
```

Propuesto: igual al original.

## scripts/datina.js#EXTRA.x-construccion-ytd

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, EXTRA › x-construccion-ytd, línea 6230
- Tipo: texto de ficha
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado al evaluar el texto en la página con los datos reales: es de otra vista, de una cifra de En cifras, del buscador o de una vista OCDE.

Original:

```text
${CN.isac_ytd.var < 0 ? "cayó" : "creció"} la actividad de la construcción entre enero y ${MESES[CN.isac_ytd.mes - 1]} de ${CN.isac_ytd.anio}, frente a los mismos meses del año anterior
```

Propuesto: igual al original.

## scripts/datina.js#EXTRA.x-viviendas-construccion

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, EXTRA › x-viviendas-construccion, línea 6231
- Tipo: texto de ficha
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado al evaluar el texto en la página con los datos reales: es de otra vista, de una cifra de En cifras, del buscador o de una vista OCDE.

Original:

```text
viviendas estaban en construcción el día del Censo 2022, ${n1(VV.construccion_cada_1000)} cada 1.000
```

Propuesto: igual al original.

## scripts/datina.js#EXTRA.x-emp-top

- Rutas: emprendedores.html, empresas.html
- Fuente: `scripts/datina.js`, EXTRA › x-emp-top, línea 6232
- Tipo: texto de ficha
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: emprendedores.html, empresas.html.

Original:

```text
empresas privadas cada 1.000 habitantes en ${EM.top}, la jurisdicción con más, en ${EM.anio}. En ${EM.low}, ${n1(EM.low_v)}
```

Propuesto:

```text
empresas privadas con empleados cada 1.000 habitantes tenía ${EM.top} en ${EM.anio}, la jurisdicción con más. ${EM.low} tenía ${n1(EM.low_v)}
```

## scripts/datina.js#EXTRA.x-emp-saldo

- Rutas: emprendedores.html, empresas.html
- Fuente: `scripts/datina.js`, EXTRA › x-emp-saldo, línea 6233
- Tipo: texto de ficha
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: emprendedores.html, empresas.html.

Original:

```text
jurisdicciones abrieron más empresas de las que cerraron en ${EM.ult}. En el país abrieron ${n1(EM.te)} y cerraron ${n1(EM.ts)} de cada 100
```

Propuesto: igual al original.

## scripts/datina.js#EXTRA.x-emp-negativos

- Rutas: emprendedores.html, empresas.html
- Fuente: `scripts/datina.js`, EXTRA › x-emp-negativos, línea 6234
- Tipo: texto de ficha
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: emprendedores.html, empresas.html.

Original:

```text
años con más cierres que aperturas de empresas desde ${EM.ini}, entre ellos ${lista(EM.ultimos_negativos.map(String))}
```

Propuesto: igual al original.

## scripts/datina.js#EXTRA.x-mi-inicio

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, EXTRA › x-mi-inicio, línea 6242
- Tipo: texto de ficha
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado al evaluar el texto en la página con los datos reales: es de otra vista, de una cifra de En cifras, del buscador o de una vista OCDE.

Original:

```text
muertes de menores de un año cada 1.000 nacidos vivos en ${mo.anio_inicio}. En ${mo.anio}, ${n1(mo.tasa)}
```

Propuesto: igual al original.

## scripts/datina.js#EXTRA.x-aprender-len

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, EXTRA › x-aprender-len, línea 6243
- Tipo: texto de ficha
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado al evaluar el texto en la página con los datos reales: es de otra vista, de una cifra de En cifras, del buscador o de una vista OCDE.

Original:

```text
de los estudiantes de 6° grado alcanzó un nivel satisfactorio o avanzado en lengua en Aprender ${ap.anio}
```

Propuesto: igual al original.

## scripts/datina.js#EXTRA.x-aprender-debajo

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, EXTRA › x-aprender-debajo, línea 6244
- Tipo: texto de ficha
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado al evaluar el texto en la página con los datos reales: es de otra vista, de una cifra de En cifras, del buscador o de una vista OCDE.

Original:

```text
de los estudiantes de 6° grado quedó por debajo del nivel básico en matemática en Aprender ${ap.anio}
```

Propuesto: igual al original.

## scripts/datina.js#EXTRA.x-hogares-crec

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, EXTRA › x-hogares-crec, línea 6256
- Tipo: texto de ficha
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado al evaluar el texto en la página con los datos reales: es de otra vista, de una cifra de En cifras, del buscador o de una vista OCDE.

Original:

```text
creció la demanda eléctrica de los hogares entre ${e.anio_ini} y ${e.anio_ult}. La del resto de los usuarios, ${sg(e.crec_resto)}
```

Propuesto: igual al original.

## scripts/datina.js#EXTRA.x-demanda-total

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, EXTRA › x-demanda-total, línea 6258
- Tipo: texto de ficha
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado al evaluar el texto en la página con los datos reales: es de otra vista, de una cifra de En cifras, del buscador o de una vista OCDE.

Original:

```text
gigavatios hora de electricidad se demandaron en el país en ${e.anio_ult}
```

Propuesto: igual al original.

## scripts/datina.js#EXTRA.x-hoteles-nr

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, EXTRA › x-hoteles-nr, línea 6260
- Tipo: texto de ficha
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado al evaluar el texto en la página con los datos reales: es de otra vista, de una cifra de En cifras, del buscador o de una vista OCDE.

Original:

```text
de los viajeros hospedados en hoteles y parahoteles en ${tu.eoh_anio} no residía en el país
```

Propuesto: igual al original.

## scripts/datina.js#tablaPropia

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, tablaPropia, línea 6306
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
<p class="tabla-nota">No hay filas para lo elegido en el gráfico.</p>
```

Propuesto: igual al original.

## scripts/datina.js#leyendaImg.x

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, leyendaImg › x, línea 6393
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Top
Right
Bottom
Left
```

Propuesto: igual al original.

## scripts/datina.js#imagenFicha.E

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, imagenFicha › E, línea 6469
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Roboto, Verdana, sans-serif
```

Propuesto: igual al original.

## scripts/datina.js#PARA_ENTENDER.pie

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, PARA_ENTENDER › pie, línea 6536
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
:scope > a
```

Propuesto: igual al original.

## scripts/datina.js#PARA_ENTENDER.conTabla

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, PARA_ENTENDER › conTabla, línea 6541
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: El botón decía un lugar y no la acción: lleva a la tabla de la ficha en el Catálogo de datos.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
 <a class="enlace como-calcula" href="#para-entender" aria-describedby="${tituloFicha.id || (tituloFicha.id = f.id + "-tit")}">Cómo se calcula</a>
<button type="button" class="boton chico accion copiar"><span class="lbl">Copiar enlace</span></button>
<button type="button" class="boton chico accion ver-tabla" aria-expanded="false"><span class="lbl">Ver tabla</span></button>
<a class="boton chico accion origen" href="relaciones.html?n=${f.id}" aria-describedby="${tituloFicha.id || (tituloFicha.id = f.id + "-tit")}"><span class="lbl">De dónde sale</span></a>
<a class="boton chico accion" href="catalogo.html#cat-${nombre}" aria-describedby="${tituloFicha.id || (tituloFicha.id = f.id + "-tit")}"><span class="lbl">En el catálogo</span></a>
<button type="button" class="boton chico accion imagen" hidden><span class="lbl">Descargar imagen</span></button>
<span class="lbl">Descargar CSV</span>
<p class="nota tabla-error" role="status">No se pudo cargar la tabla. Probá de nuevo.</p>
Ver tabla
Ocultar tabla
No se pudo
Descargar imagen
```

Propuesto:

```text
 <a class="enlace como-calcula" href="#para-entender" aria-describedby="${tituloFicha.id || (tituloFicha.id = f.id + "-tit")}">Cómo se calcula</a>
<button type="button" class="boton chico accion copiar"><span class="lbl">Copiar enlace</span></button>
<button type="button" class="boton chico accion ver-tabla" aria-expanded="false"><span class="lbl">Ver tabla</span></button>
<a class="boton chico accion origen" href="relaciones.html?n=${f.id}" aria-describedby="${tituloFicha.id || (tituloFicha.id = f.id + "-tit")}"><span class="lbl">De dónde sale</span></a>
<a class="boton chico accion" href="catalogo.html#cat-${nombre}" aria-describedby="${tituloFicha.id || (tituloFicha.id = f.id + "-tit")}"><span class="lbl">Ver en el catálogo</span></a>
<button type="button" class="boton chico accion imagen" hidden><span class="lbl">Descargar imagen</span></button>
<span class="lbl">Descargar CSV</span>
<p class="nota tabla-error" role="status">No se pudo cargar la tabla. Probá de nuevo.</p>
Ver tabla
Ocultar tabla
No se pudo
Descargar imagen
```

## scripts/datina.js#PARA_ENTENDER.cambiar

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, PARA_ENTENDER › cambiar, línea 6586
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Enlace copiado
No se pudo copiar
Enlace copiado
No se pudo copiar
Copiar enlace
.pie, .tabla-datos
```

Propuesto: igual al original.

## scripts/datina.js#revisarLargo.b

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, revisarLargo › b, línea 6696
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
enlace ver-mas
Ver más
```

Propuesto: igual al original.

## scripts/datina.js#alternarLargo.abrir

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, alternarLargo › abrir, línea 6706
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Ver menos
Ver más
```

Propuesto: igual al original.

## scripts/datina.js#anchoLargo.P24

- Rutas: a-internet-aprender.html, a-inversion-aprender.html, catalogo.html, cruces.html, diagnostico.html, educacion.html, relaciones.html
- Fuente: `scripts/datina.js`, anchoLargo › P24, línea 6730
- Tipo: gráfico
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: a-internet-aprender.html, a-inversion-aprender.html, catalogo.html, cruces.html, diagnostico.html, educacion.html y otras. El texto anterior todavía aparece en: educacion.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14 (otra fuente lo repite).

Original:

```text
Aprender ${RD.anio}, Ministerio de Educación
```

Propuesto:

```text
Aprender ${RD.anio}, Secretaría de Educación
```

## scripts/datina.js#anchoLargo.vsPais

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, anchoLargo › vsPais, línea 6766
- Tipo: gráfico
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Igual al valor de todo el país, ${pct(IND[k].pais)}.
${n1(Math.abs(d))} puntos ${d > 0 ? "más" : "menos"} que todo el país, ${pct(IND[k].pais)}.
```

Propuesto:

```text
Igual al total del país (${pct(IND[k].pais)}).
${n1(Math.abs(d))} puntos ${d > 0 ? "más" : "menos"} que el total del país (${pct(IND[k].pais)}).
```

## scripts/datina.js#anchoLargo.cita

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, anchoLargo › cita, línea 6769
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
 <a class="enlace" href="${destinoDe(IND[k].ficha) || IND[k].ficha}">Ver la ficha</a>
```

Propuesto: igual al original.

## scripts/datina.js#anchoLargo.conjunto

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, anchoLargo › conjunto, línea 6848
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Las ${sel.length} provincias elegidas reúnen unos ${unos(n)} estudiantes de 6° grado, el ${pct(n / tot * 100)} del país
, y unos ${unos(d)} de los que quedaron por debajo del nivel básico en ${t.area === "mat" ? "matemática" : "lengua"}, el ${pct(d / dt * 100)} de los de todo el país
```

Propuesto: igual al original.

## scripts/datina.js#anchoLargo.guardar

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, anchoLargo › guardar, línea 6920
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
País ${pct(IND[k].pais)}
```

Propuesto: igual al original.

## scripts/datina.js#PREG

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, PREG, línea 7084
- Tipo: texto de interfaz
- Estado: **reescrito**
- Motivo: Era una instrucción de interfaz dentro del texto. Pasa a la nota, con la misma fórmula que el resto del sitio. Faltaba la preposición: el hogar quedaba suelto en la oración. «El 72,4% de pozos de shale» no tenía verbo, y «fue el productor» quedaba sin sujeto. «Va de…» no tenía sujeto claro.
- Verificación: Comprobado al evaluar el texto en la página con los datos reales: es de otra vista, de una cifra de En cifras, del buscador o de una vista OCDE.

Original:

```text
¿Cuánto cambiaron los pozos de Vaca Muerta?
En ${PG.dv_ini}, un pozo tenía en promedio ${n0(PG.dv_rama_ini)} metros de rama horizontal y ${n1(PG.dv_etapas_ini)} etapas de fractura. En ${PG.fr_ult}, ${n0(PG.dv_rama_ult)} metros y ${n1(PG.dv_etapas_ult)} etapas.
¿Cuánto petróleo produce la Argentina?
${n0(PG.kbd)} mil barriles por día en ${PG.mes}, el ${pct(PG.pct_shale)} de pozos de shale. Según la EIA, en ${PG.mundo.crudo_kbd.anio} fue el productor número ${PG.mundo.crudo_kbd.puesto} del mundo.
¿Cuánto petróleo sale de una sola área de concesión?
En ${PG.areas_anio}, ${tituloArea(PG.areas_pet_top.nombre)}, en ${PG.areas_pet_top.territorio}, produjo ${kbdF(PG.areas_pet_top.v)} mil barriles por día, el ${pct(PG.areas_pet_top.pct)} del petróleo del país.
¿Cuántos hogares cocinan con gas de red?
El ${pct(VV.pct_gas_red)} en el Censo 2022. 
En ${lista(CN.gas_nea)}, menos de ${Math.ceil(CN.gas_nea_max)} de cada 100.
¿Cuánto prestan los bancos para comprar una vivienda?
${n0(CN.hip_ult)} mil millones de pesos en créditos hipotecarios UVA en ${CN.hip_mes}. En todo ${CN.hip_anio}, ${n0(CN.hip_anual)} mil millones, contra ${n0(CN.hip_anual_min)} en ${CN.hip_anual_min_anio}, en pesos de igual valor.
¿Cuánta electricidad consumen los hogares?
En ${e.el_ult}, ${n0(e.el_pais)} kilovatios hora por habitante en el país. En ${e.el_top[0]}, ${n0(e.el_top[1])}, y en ${e.el_bajo[0]}, ${n0(e.el_bajo[1])}.
¿Cuánto gana en promedio un asalariado registrado?
En ${SA.mes}, ${n0(SA.pais)} pesos brutos por mes en el sector privado del país. En ${SA.top[0]}, ${n0(SA.top[1])}, y en ${SA.bajo[0]}, ${n0(SA.bajo[1])}.
¿Cuánto cobra un maestro de grado?
En ${DC.trim}, ${n0(DC.pais)} pesos brutos por mes en promedio, con 10 años de antigüedad y jornada simple. Va de ${n0(DC.bajo[1])} en ${DC.bajo[0]} a ${n0(DC.top[1])} en ${DC.top[0]}.
¿Qué exporta la Argentina?
${n0(SX.rubros.total)} millones de dólares en bienes en ${SX.rubros.anio}: el ${pct(SX.rubros.pct.moa)} manufacturas de origen agropecuario, el ${pct(SX.rubros.pct.moi)} de origen industrial, el ${pct(SX.rubros.pct.primarios)} productos primarios y el ${pct(SX.rubros.pct.combustibles)} combustibles y energía.
¿Adónde exporta la Argentina?
En el ${SX.destinos.periodo}, ${lista(SX.destinos.top.slice(0, 3).map(t => `${t.n} (${pct(t.pct)})`))} fueron los primeros destinos.
¿Cuánto vende y cuánto compra la Argentina?
En ${SX.balanza.anio}, ${n0(SX.balanza.expo)} millones de dólares de exportaciones de bienes y ${n0(SX.balanza.impo)} millones de importaciones: un saldo de ${saldoTx(SX.balanza.saldo)}.
¿Qué importa la Argentina?
${n0(SX.importaciones.total)} millones de dólares en bienes en ${SX.importaciones.anio}: el ${pct(SX.importaciones.pct.intermedios)} bienes intermedios, el ${pct(SX.importaciones.pct.capital + SX.importaciones.pct.piezas)} bienes de capital con sus piezas y el ${pct(SX.importaciones.pct.consumo + SX.importaciones.pct.vehiculos)} bienes de consumo y autos.
¿De dónde vienen las importaciones?
De ${SX.origen.periodo}, ${lista(SX.origen.top.slice(0, 3).map(t => `${t.n} (${pct(t.pct)})`))} fueron los primeros orígenes.
¿Cuánto da la cuenta corriente del balance de pagos?
los bienes dejaron ${saldoTx(SX.cuenta_corriente.bienes)}, los servicios ${saldoTx(SX.cuenta_corriente.servicios)} y el ingreso primario ${saldoTx(SX.cuenta_corriente.primario)}.
¿Cuántas reservas tiene el Banco Central?
${n0(SX.reservas.valor)} millones de dólares el ${fLarga(SX.reservas.fecha)}. Un año antes, ${n0(SX.reservas.hace_un_anio)} millones.
¿Cuánto paga un plazo fijo?
${pct(BCR_PF.v)} nominal anual en promedio a 30 días el ${fLarga(BCR_PF.f)}, según el Banco Central. La ficha muestra también el dólar, las demás tasas, el dinero y los préstamos.
¿De qué se muere la gente en la Argentina?
De ${CM.desde} a ${CM.hasta}, el ${pct(CMG[0].pct)} de las muertes fue por ${CM_FRASE[CMG[0].k]}. Ajustada por edad, la mortalidad más alta es la de ${CM.max} y la más baja, la de ${CM.min}.
¿Cuánto va a crecer la población?
${conSigno(PPY.var_pct)} entre ${PPY.anio} y ${PPY.anio_fin} en todo el país, de ${n1(PPY.hoy / 1e6)} a ${n1(PPY.fin / 1e6)} millones de personas, según las proyecciones del INDEC. La que más crece es ${PPY.max} (${conSigno(PPY.max_v)}) y la que menos, ${PPY.min} (${conSigno(PPY.min_v)}).
¿Cuántos homicidios hay por año?
En ${SG.anio}, ${n0(SG.hom_victimas)} víctimas de homicidios dolosos, ${n1(SG.hom_tasa)} cada 100.000 habitantes. En ${SG.hom_max_anio}, el año más alto desde ${SG.anio_ini}, ${n1(SG.hom_max)}.
¿Cuánto debe el Estado nacional?
${n0(GBD.usd_millones)} millones de dólares al ${GBD.fecha}, el ${pct(GBD.pct)} del PBI, según la Secretaría de Finanzas.
¿En qué gasta la Nación?
En ${GBN.anio}, el ${pct(GBN.gasto_tipos[0][1])} del gasto primario fue en ${inicialMin(GBN.gasto_tipos[0][0])} y el ${pct(GBN.gasto_tipos[1][1])} en ${inicialMin(GBN.gasto_tipos[1][0])}.
¿Cuántas personas nacidas en otro país viven en la Argentina?
${n0(MGC.personas)} en el Censo 2022, el ${pct(MGC.pct)} de la población. El país de nacimiento más frecuente, ${MGC.paises[0][0]}: ${pct(MGC.paises[0][2])}.
¿Cuántos argentinos viven en otro país?
${n0(MGO.personas)} personas nacidas en la Argentina a mediados de ${MGO.anio}, según las Naciones Unidas. El ${pct(MGO.top[0][2])}, en ${MGO.top[0][0]}.
¿Cuánto subieron los precios en el último año?
${pct(EIP.interanual)} en los doce meses hasta ${EIP.mes}, según el INDEC, y ${pct(EIP.mensual)} en el mes. La región con la suba más alta, ${REG_ART[EIP.reg_max[0]]}, con ${pct(EIP.reg_max[1])}.
¿Cuántas personas pidieron refugio en la Argentina el último año?
En ${MGR.anio}, ${n0(MGR.solicitudes)} solicitudes, según la Comisión Nacional para los Refugiados. Ese año reconoció como refugiadas a 
¿Venden más o menos los supermercados que hace un año?
${ESU.interanual < 0 ? "Menos" : "Más"}: en ${ESU.mes}, las ventas en pesos de igual valor fueron ${pct(Math.abs(ESU.interanual))} 
${ESU.interanual < 0 ? "menores" : "mayores"} que en ${ESU.mes_ant}, según el INDEC.
¿Cuánto necesita un hogar para no ser pobre?
${n0(ECB.cbt_hogar)} pesos por mes en ${ECB.mes}, un hogar de cuatro integrantes del Gran Buenos Aires, según la canasta básica total del INDEC.
¿Le ganan los salarios a la inflación?
En los doce meses hasta ${ESR.mes}, descontada la inflación, el salario registrado del sector privado ${cambioPct(ESR.real_priv)} y el del sector público ${cambioPct(ESR.real_pub)}.
¿Cuántas personas están presas?
Al 31 de diciembre de ${SG.sn_anio}, ${n0(SG.sn_personas)} personas en cárceles, ${n0(SG.sn_tasa)} cada 100.000 habitantes. En ${SG.sn_ini}, ${n0(SG.sn_personas_ini)}.
¿Qué parte de la electricidad usan las industrias?
En ${e.el_ult}, el ${pct(e.els_pct.ind)} de la demanda eléctrica del país fue de industrias y grandes comercios. En ${e.els_pct_ind_top[0]}, el ${pct(e.els_pct_ind_top[1])}, 
y en ${e.els_pct_ind_bajo[0]}, el ${pct(e.els_pct_ind_bajo[1])}.
¿Cuánto cuesta un litro de nafta?
En ${CB.mes}, la mitad de las estaciones del país vendía la nafta súper a más de ${n0(CB.nafta)} pesos por litro. La mediana fue de ${n0(CB.nafta_alto[1])} en ${CB.nafta_alto[0]} y de ${n0(CB.nafta_bajo[1])} en ${CB.nafta_bajo[0]}.
¿Cuánto se destina a subsidiar la energía?
Según la Secretaría de Hacienda, en ${e.sub_pbi_anio} los subsidios económicos a la energía fueron el ${n2(e.sub_pbi)}% del producto interno bruto. En ${e.sub_pbi_max_anio}, el ${n2(e.sub_pbi_max)}%.
¿Cuánto gas consume por año un usuario residencial?
${n0(e.gas_pais)} metros cúbicos en promedio en ${e.gas_anio}. En ${e.gas_top[0][0]}, ${n0(e.gas_top[0][1])}, ${veces(e.gas_top[0][1], e.gas_pais)} veces el promedio del país.
¿Cuántos hogares alquilan su vivienda?
El ${pct(VV.pct_alquila)} en el Censo 2022: del ${pct(CN.viv_top.pct_alquila[1])} en ${CN.viv_top.pct_alquila[0]} al ${pct(CN.viv_low.pct_alquila[1])} en ${CN.viv_low.pct_alquila[0]}.
¿Cuánto varía la mortalidad infantil entre provincias?
En el promedio de ${mo.tri_act} murieron ${n1(mo.top_v)} de cada 1.000 nacidos vivos en ${mo.top} y ${n1(mo.low_v)} en ${mo.low}: ${veces(mo.top_v, mo.low_v)} veces más.
¿Cuántos años de esperanza de vida separan a las provincias?
En ${nv.ev_anio}, ${n1(nv.ev_top_v - nv.ev_low_v)} años: ${n1(nv.ev_top_v)} en ${nv.ev_top} y ${n1(nv.ev_low_v)} en ${nv.ev_low}. El promedio de la OCDE fue ${n1(OC.esperanza_vida.ocde)} en ${OC.esperanza_vida.anio}.
¿Qué parte de los hogares tiene cloacas?
El ${pct(nv.censo.cloaca)} en el Censo 2022. Va del ${pct(nv.censo_top.cloaca[1])} en ${nv.censo_top.cloaca[0]} al ${pct(nv.censo_low.cloaca[1])} en ${nv.censo_low.cloaca[0]}.
¿Dónde está la Argentina frente a la OCDE en mortalidad infantil?
En ${mo.anio}, ${n1(mo.tasa)} muertes de menores de un año cada 1.000 nacidos vivos según la DEIS. En el promedio simple de los países de la OCDE fueron ${n1(OC.mortalidad_infantil.ocde)} en ${OC.mortalidad_infantil.anio}, según la estimación ${deOrganismo(OC.mortalidad_infantil.origen)}, que para la Argentina da ${n1(OC.mortalidad_infantil.arg)}.
¿Cuánto cambia lo que se aprende en matemática según la provincia?
En ${ap.top}, el ${pct(ap.top_v)} de los chicos de 6° grado alcanzó un nivel satisfactorio o avanzado en Aprender ${ap.anio}. En ${ap.low}, el ${pct(ap.low_v)}.
¿Cuántos bebés menos nacen que hace una década?
En ${nac.anio_ult} se registraron ${n0(nac.n_ult)} nacimientos, ${pct(Math.abs(nac.caida))} menos que en ${nac.anio_pico}.
¿Cuánto empleo privado registrado hay en cada provincia?
${n1(em.top_v)} asalariados cada 100 habitantes en ${em.top}${aclara("empleo_provincias.cada_100", em.top)} y ${n1(em.low_v)} en ${em.low}. El país tiene ${n1(em.cada_100_pais)}.
¿A qué distancia está la Argentina del promedio de la OCDE en PISA?
A ${pz.dif_mat} puntos en matemática en ${pz.anio}: ${pz.mat} contra ${pz.ocde_mat}.
¿Cuántos adolescentes están en la secundaria?
El ${pct(es.pais_fin)} en ${es.fin}, ${n1(es.pais_fin - es.pais_ini)} puntos más que en ${es.ini}. En ${es.low}, el ${pct(es.low_v)}.
¿Volvió el transporte público al nivel previo a la pandemia?
En ${su.mes} se usaron ${n2(su.total_millones)} millones de tarjetas SUBE por día hábil. En los primeros días de marzo de 2020 eran ${n2(su.pre_millones)} millones.
¿Qué parte de la electricidad consumen los hogares?
El ${pct(e.pct_res_ult)} de la demanda del país en ${e.anio_ult}. En ${e.anio_ini} era el ${pct(e.pct_res_ini)}.
¿En qué mes se usa más electricidad?
En ${e.mes_max}: ${pct(e.dif_max_min)} más que en ${e.mes_min}, el mes de menor demanda (promedio de ${e.meses_desde} a ${e.meses_hasta}).
¿Qué provincia tiene más territorio protegido?
${nt.top}: el ${pct(nt.top_v)} de su superficie está dentro de áreas protegidas. En ${nt.low}, el ${pct(nt.low_v)}.
¿Cuántos metros cuadrados protegidos hay por habitante?
${n0(nt.m2_pais)} en todo el país. Van de ${n0(nt.m2_top_v)} m² en ${nt.m2_top} a ${n1(nt.m2_low_v)} m² en ${nt.m2_low}.
¿Cuál es el parque nacional más grande en tierra?
${nt.pn_mayor}, creado en ${nt.pn_mayor_anio}, con ${n0(nt.pn_mayor_ha)} hectáreas.
¿En qué área protegida se registraron más especies animales?
En ${nt.esp_top}: ${n0(nt.esp_top_v)} especies. Le sigue ${nt.esp_2}, con ${n0(nt.esp_2_v)}.
¿Volvió el turismo extranjero al nivel de ${tu.max_anio}?
En los doce meses a ${tu.doce_hasta} llegaron ${n0(tu.doce)} turistas no residentes, ${pct(Math.abs((tu.doce / tu.max - 1) * 100))} ${tu.doce < tu.max ? "menos" : "más"} que en ${tu.max_anio}.
¿Cuánta pobreza hay en las ciudades del país?
En el ${R.pobreza.sem}, el ${pct(R.pobreza.pob)} de las personas de los 31 aglomerados urbanos estaba bajo la línea de pobreza. El pico fue ${pct(R.pobreza.max)}, en el ${R.pobreza.max_sem}.
¿Cuál es el parque nacional más visitado?
${vpq.top}, con ${n0(vpq.top_v)} visitas en ${vpq.ult}. Le sigue ${vpq.dos}, con ${n0(vpq.dos_v)}.
¿Qué es lo que más se pesca en el mar argentino?
${pe.top[0]}: ${n0(pe.top_t[0])} toneladas en ${pe.anio}, el ${pct(pe.top_pct)} de todo lo desembarcado.
¿Se patentan más autos o más motos?
En ${au.anio} se inscribieron ${n0(au.motos)} motos nuevas y ${n0(au.autos)} autos.
¿Volvieron los pasajeros al tren y al subte?
En ${su.mes} viajaban por día hábil ${pct(Math.abs(su.tren_vs_pre))} ${su.tren_vs_pre < 0 ? "menos" : "más"} tarjetas en tren y ${pct(Math.abs(su.subte_vs_pre))} ${su.subte_vs_pre < 0 ? "menos" : "más"} en subte que en marzo de 2020.
¿Cuántos bebés se llamaron Lionel en ${cu.lionel_anio}?
${n0(cu.lionel_max)}, ${veces(cu.lionel_max, cu.lionel_prev)} veces los del año anterior (${n0(cu.lionel_prev)}).
¿Cuánta carne vacuna come un argentino por año?
${n1(cu.carne_v)} kilos en ${cu.carne_anio}. En ${cu.carne_ini} eran ${n1(cu.carne_ini_v)}.
¿Cuántos kilos de pollo vale un kilo de asado?
${n1(cu.asado)} kilos en ${cu.asado_hasta}, en el Gran Buenos Aires. En ${cu.asado_ini_anio} eran ${n1(cu.asado_ini)}.
¿Cuánto vino menos se vende que en ${cu.vino_ini}?
${pct(Math.abs(cu.vino_caida))} menos: ${n0(cu.vino_v)} millones de litros en ${cu.vino_anio} contra ${n0(cu.vino_ini_v)} millones.
¿Qué provincia tiene más glaciares?
${cu.gl_top}, con ${n0(cu.gl_top_v)}. Le sigue ${cu.gl_2}, con ${n0(cu.gl_2_v)}.
¿Cuál fue el año más cálido desde ${cu.cl_ini}?
${cu.cl_max_anio}, con una temperatura media ${n2(cu.cl_max)} °C por encima del valor de referencia.
¿Cómo cambió la maternidad adolescente?
En ${nac.anio_ini}, ${n1(nac.pct_ini)} de cada 100 nacimientos eran de madres menores de 20 años. En ${nac.anio_ult}, ${n1(nac.pct_ult)}.
¿Quién estuvo más años en el Congreso desde 1983?
${AC.top[0].nombre}: ${n1(AC.top[0].total)} años
 entre Diputados y el Senado
 en el Senado
 en Diputados
${AC.top[0].sigue ? ", y sigue en el cargo" : ""}. Le siguen ${AC.top[1].nombre} (${n1(AC.top[1].total)}) y ${AC.top[2].nombre} (${n1(AC.top[2].total)}).
¿Cuántos fallos firma la Corte Suprema por año?
${n0(R.justicia.corte.fallos)} en ${R.justicia.corte.hasta}, que cerraron ${n0(R.justicia.corte.resueltos)} casos. Ese año llegaron ${n0(R.justicia.corte.ingresados)} casos nuevos.
¿Cuántos jueces federales no tienen titular?
El ${pct(R.justicia.federal.pct_sin_titular)} de los ${n0(R.justicia.federal.cargos)} cargos de juez federal, en ${R.justicia.federal.fecha}.
¿Cuántas fiscalías federales hay?
${n0(R.justicia.mp.fiscalias)} fiscalías y ${n0(R.justicia.mp.defensorias)} defensorías públicas oficiales de la Justicia Federal en ${R.justicia.mp.fecha}.
¿Cuántos jueces tienen las justicias provinciales?
${n0(R.justicia.prov.magistratura)} al 31 de octubre de ${R.justicia.prov.anio}, contando la justicia de paz: ${n1(R.justicia.prov.pais.magistratura)} cada 100.000 habitantes.
```

Propuesto:

```text
¿Cuánto cambiaron los pozos de Vaca Muerta?
En ${PG.dv_ini}, un pozo tenía en promedio ${n0(PG.dv_rama_ini)} metros de rama horizontal y ${n1(PG.dv_etapas_ini)} etapas de fractura. En ${PG.fr_ult}, ${n0(PG.dv_rama_ult)} metros y ${n1(PG.dv_etapas_ult)} etapas.
¿Cuánto petróleo produce la Argentina?
${n0(PG.kbd)} mil barriles por día en ${PG.mes}. El ${pct(PG.pct_shale)} salió de pozos de shale. Según la EIA, en ${PG.mundo.crudo_kbd.anio} la Argentina fue el productor número ${PG.mundo.crudo_kbd.puesto} del mundo.
¿Cuánto petróleo sale del área de concesión que más produce?
En ${PG.areas_anio}, ${tituloArea(PG.areas_pet_top.nombre)}, en ${PG.areas_pet_top.territorio}, produjo ${kbdF(PG.areas_pet_top.v)} mil barriles por día, el ${pct(PG.areas_pet_top.pct)} del petróleo del país.
¿Qué parte de los hogares cocina con gas de red?
El ${pct(VV.pct_gas_red)} en el Censo 2022. 
En ${lista(CN.gas_nea)}, menos de ${Math.ceil(CN.gas_nea_max)} de cada 100.
¿Cuánto prestan los bancos para comprar una vivienda?
${n0(CN.hip_ult)} mil millones de pesos en créditos hipotecarios UVA en ${CN.hip_mes}. En todo ${CN.hip_anio}, ${n0(CN.hip_anual)} mil millones, contra ${n0(CN.hip_anual_min)} en ${CN.hip_anual_min_anio}, en pesos de ${CN.hip_mes}.
¿Cuánta electricidad consumen los hogares?
En ${e.el_ult}, los hogares del país consumieron ${n0(e.el_pais)} kilovatios hora por habitante. En ${e.el_top[0]}, ${n0(e.el_top[1])}, y en ${e.el_bajo[0]}, ${n0(e.el_bajo[1])}.
¿Cuánto gana en promedio un asalariado registrado del sector privado?
En ${SA.mes}, ${n0(SA.pais)} pesos brutos por mes en el sector privado del país. En ${SA.top[0]}, ${n0(SA.top[1])}, y en ${SA.bajo[0]}, ${n0(SA.bajo[1])}.
¿Cuánto cobra un maestro de grado?
En ${DC.trim}, ${n0(DC.pais)} pesos brutos por mes en promedio, con 10 años de antigüedad y jornada simple. Según la provincia, va de ${n0(DC.bajo[1])} en ${DC.bajo[0]} a ${n0(DC.top[1])} en ${DC.top[0]}.
¿Qué exporta la Argentina?
${n0(SX.rubros.total)} millones de dólares en bienes en ${SX.rubros.anio}: el ${pct(SX.rubros.pct.moa)} manufacturas de origen agropecuario, el ${pct(SX.rubros.pct.moi)} de origen industrial, el ${pct(SX.rubros.pct.primarios)} productos primarios y el ${pct(SX.rubros.pct.combustibles)} combustibles y energía.
¿Adónde exporta la Argentina?
En el ${SX.destinos.periodo}, ${lista(SX.destinos.top.slice(0, 3).map(t => `${t.n} (${pct(t.pct)})`))} fueron los primeros destinos.
¿Cuánto vende y cuánto compra la Argentina?
En ${SX.balanza.anio}, ${n0(SX.balanza.expo)} millones de dólares de exportaciones de bienes y ${n0(SX.balanza.impo)} millones de importaciones: un saldo de ${saldoTx(SX.balanza.saldo)}.
¿Qué importa la Argentina?
${n0(SX.importaciones.total)} millones de dólares en bienes en ${SX.importaciones.anio}: el ${pct(SX.importaciones.pct.intermedios)} bienes intermedios, el ${pct(SX.importaciones.pct.capital + SX.importaciones.pct.piezas)} bienes de capital con sus piezas y el ${pct(SX.importaciones.pct.consumo + SX.importaciones.pct.vehiculos)} bienes de consumo y autos.
¿De dónde vienen las importaciones?
De ${SX.origen.periodo}, ${lista(SX.origen.top.slice(0, 3).map(t => `${t.n} (${pct(t.pct)})`))} fueron los primeros orígenes.
¿Cuál fue el saldo de la cuenta corriente del balance de pagos?
los bienes dejaron ${saldoTx(SX.cuenta_corriente.bienes)}, los servicios ${saldoTx(SX.cuenta_corriente.servicios)} y el ingreso primario (intereses, utilidades y dividendos) ${saldoTx(SX.cuenta_corriente.primario)}.
¿Cuántas reservas tiene el Banco Central?
${n0(SX.reservas.valor)} millones de dólares el ${fLarga(SX.reservas.fecha)}. Un año antes, ${n0(SX.reservas.hace_un_anio)} millones.
¿Cuánto paga un plazo fijo?
${pct(BCR_PF.v)} nominal anual en promedio a 30 días el ${fLarga(BCR_PF.f)}, según el Banco Central. La ficha muestra también el dólar, las demás tasas, el dinero y los préstamos.
¿De qué se muere la gente en la Argentina?
De ${CM.desde} a ${CM.hasta}, el ${pct(CMG[0].pct)} de las muertes fue por ${CM_FRASE[CMG[0].k]}. Ajustada por edad, la mortalidad más alta es la de ${CM.max} y la más baja, la de ${CM.min}.
¿Cuánto va a crecer la población?
${conSigno(PPY.var_pct)} entre ${PPY.anio} y ${PPY.anio_fin} en todo el país, de ${n1(PPY.hoy / 1e6)} a ${n1(PPY.fin / 1e6)} millones de personas, según las proyecciones del INDEC. La que más crece es ${PPY.max} (${conSigno(PPY.max_v)}) y la que menos, ${PPY.min} (${conSigno(PPY.min_v)}).
¿Cuántos homicidios hay por año?
En ${SG.anio}, ${n0(SG.hom_victimas)} víctimas de homicidios dolosos, ${n1(SG.hom_tasa)} cada 100.000 habitantes. En ${SG.hom_max_anio}, el año más alto desde ${SG.anio_ini}, ${n1(SG.hom_max)}.
¿Cuánto debe el Estado nacional?
${n0(GBD.usd_millones)} millones de dólares al ${GBD.fecha}, el ${pct(GBD.pct)} del PBI, según la Secretaría de Finanzas.
¿En qué gasta la Nación?
En ${GBN.anio}, el ${pct(GBN.gasto_tipos[0][1])} del gasto primario fue en ${inicialMin(GBN.gasto_tipos[0][0])} y el ${pct(GBN.gasto_tipos[1][1])} en ${inicialMin(GBN.gasto_tipos[1][0])}.
¿Cuántas personas nacidas en otro país viven en la Argentina?
${n0(MGC.personas)} en el Censo 2022, el ${pct(MGC.pct)} de la población. El país de nacimiento más frecuente, ${MGC.paises[0][0]}: ${pct(MGC.paises[0][2])}.
¿Cuántos argentinos viven en otro país?
${n0(MGO.personas)} personas nacidas en la Argentina a mediados de ${MGO.anio}, según las Naciones Unidas. El ${pct(MGO.top[0][2])}, en ${MGO.top[0][0]}.
¿Cuánto subieron los precios en el último año?
${pct(EIP.interanual)} en los doce meses hasta ${EIP.mes}, según el INDEC, y ${pct(EIP.mensual)} en el mes. La región con la suba más alta, ${REG_ART[EIP.reg_max[0]]}, con ${pct(EIP.reg_max[1])}.
¿Cuántas personas piden refugio en la Argentina por año?
En ${MGR.anio}, ${n0(MGR.solicitudes)} solicitudes, según la Comisión Nacional para los Refugiados. Ese año, la Comisión reconoció como refugiadas a 
¿Venden más o menos los supermercados que hace un año?
${ESU.interanual < 0 ? "Menos" : "Más"}: en ${ESU.mes}, descontada la inflación, las ventas fueron ${pct(Math.abs(ESU.interanual))} 
${ESU.interanual < 0 ? "menores" : "mayores"} que en ${ESU.mes_ant}, según el INDEC.
¿Cuánto necesita un hogar para no ser pobre?
${n0(ECB.cbt_hogar)} pesos por mes en ${ECB.mes} para un hogar de cuatro integrantes del Gran Buenos Aires, según la canasta básica total del INDEC.
¿Le ganan los salarios registrados a la inflación?
En los doce meses hasta ${ESR.mes}, descontada la inflación, el salario registrado del sector privado ${cambioPct(ESR.real_priv)} y el del sector público ${cambioPct(ESR.real_pub)}.
¿Cuántas personas están presas?
Al 31 de diciembre de ${SG.sn_anio}, ${n0(SG.sn_personas)} personas en cárceles, ${n0(SG.sn_tasa)} cada 100.000 habitantes. En ${SG.sn_ini}, ${n0(SG.sn_personas_ini)}.
¿Qué parte de la electricidad usan las industrias y los grandes comercios?
En ${e.el_ult}, el ${pct(e.els_pct.ind)} de la demanda eléctrica del país fue de industrias y grandes comercios. En ${e.els_pct_ind_top[0]}, el ${pct(e.els_pct_ind_top[1])}, 
y en ${e.els_pct_ind_bajo[0]}, el ${pct(e.els_pct_ind_bajo[1])}.
¿Cuánto cuesta un litro de nafta?
En ${CB.mes}, la mitad de las estaciones del país vendía la nafta súper a más de ${n0(CB.nafta)} pesos por litro. La mediana fue de ${n0(CB.nafta_alto[1])} en ${CB.nafta_alto[0]} y de ${n0(CB.nafta_bajo[1])} en ${CB.nafta_bajo[0]}.
¿Cuánto se destina a subsidiar la energía?
Según la Secretaría de Hacienda, en ${e.sub_pbi_anio} los subsidios económicos a la energía fueron el ${n2(e.sub_pbi)}% del producto interno bruto. En ${e.sub_pbi_max_anio}, el ${n2(e.sub_pbi_max)}%.
¿Cuánto gas consume por año un usuario residencial?
${n0(e.gas_pais)} metros cúbicos en promedio en ${e.gas_anio}. En ${e.gas_top[0][0]}, ${n0(e.gas_top[0][1])}, ${veces(e.gas_top[0][1], e.gas_pais)} veces el promedio del país.
¿Cuántos hogares alquilan su vivienda?
El ${pct(VV.pct_alquila)} en el Censo 2022: del ${pct(CN.viv_top.pct_alquila[1])} en ${CN.viv_top.pct_alquila[0]} al ${pct(CN.viv_low.pct_alquila[1])} en ${CN.viv_low.pct_alquila[0]}.
¿Cuánto varía la mortalidad infantil entre provincias?
En el promedio de ${mo.tri_act} murieron ${n1(mo.top_v)} de cada 1.000 nacidos vivos en ${mo.top} y ${n1(mo.low_v)} en ${mo.low}: ${veces(mo.top_v, mo.low_v)} veces más.
¿Cuántos años de esperanza de vida separan a las provincias?
En ${nv.ev_anio}, ${n1(nv.ev_top_v - nv.ev_low_v)} años: ${n1(nv.ev_top_v)} en ${nv.ev_top} y ${n1(nv.ev_low_v)} en ${nv.ev_low}. El promedio de la OCDE fue ${n1(OC.esperanza_vida.ocde)} en ${OC.esperanza_vida.anio}.
¿Qué parte de los hogares tiene cloacas?
El ${pct(nv.censo.cloaca)} en el Censo 2022. Va del ${pct(nv.censo_top.cloaca[1])} en ${nv.censo_top.cloaca[0]} al ${pct(nv.censo_low.cloaca[1])} en ${nv.censo_low.cloaca[0]}.
¿Dónde está la Argentina frente a la OCDE en mortalidad infantil?
En ${mo.anio}, ${n1(mo.tasa)} muertes de menores de un año cada 1.000 nacidos vivos según la DEIS. En el promedio simple de los países de la OCDE fueron ${n1(OC.mortalidad_infantil.ocde)} en ${OC.mortalidad_infantil.anio}, según la estimación ${deOrganismo(OC.mortalidad_infantil.origen)}, que para la Argentina da ${n1(OC.mortalidad_infantil.arg)}.
¿Cuánto cambia lo que se aprende en matemática según la provincia?
En ${ap.top}, el ${pct(ap.top_v)} de los chicos de 6° grado alcanzó un nivel satisfactorio o avanzado en Aprender ${ap.anio}. En ${ap.low}, el ${pct(ap.low_v)}.
¿Cuánto bajaron los nacimientos?
En ${nac.anio_ult} se registraron ${n0(nac.n_ult)} nacimientos, ${pct(Math.abs(nac.caida))} menos que en ${nac.anio_pico}.
¿Cuánto empleo privado registrado hay en cada provincia?
${n1(em.top_v)} asalariados registrados del sector privado cada 100 habitantes en ${em.top}${aclara("empleo_provincias.cada_100", em.top)} y ${n1(em.low_v)} en ${em.low}. El país tiene ${n1(em.cada_100_pais)}.
¿A qué distancia está la Argentina del promedio de la OCDE en PISA?
A unos ${pz.dif_mat} puntos en matemática en ${pz.anio}: ${pz.mat} contra ${pz.ocde_mat}.
¿Cuántos adolescentes están en la secundaria?
El ${pct(es.pais_fin)} en ${es.fin}, ${n1(es.pais_fin - es.pais_ini)} puntos más que en ${es.ini}. En ${es.low}, la más baja, el ${pct(es.low_v)}.
¿Volvió el transporte público al nivel previo a la pandemia?
En ${su.mes} se usaron ${n2(su.total_millones)} millones de tarjetas SUBE por día hábil. En los primeros días de marzo de 2020 eran ${n2(su.pre_millones)} millones.
¿Qué parte de la electricidad consumen los hogares?
El ${pct(e.pct_res_ult)} de la demanda del país en ${e.anio_ult}. En ${e.anio_ini} era el ${pct(e.pct_res_ini)}.
¿En qué mes se usa más electricidad?
En ${e.mes_max}: ${pct(e.dif_max_min)} más que en ${e.mes_min}, el mes de menor demanda (promedio de ${e.meses_desde} a ${e.meses_hasta}).
¿Qué provincia tiene más territorio protegido?
${nt.top}: el ${pct(nt.top_v)} de su superficie está dentro de áreas protegidas. En ${nt.low}, el ${pct(nt.low_v)}.
¿Cuántos metros cuadrados protegidos hay por habitante?
${n0(nt.m2_pais)} en todo el país. Van de ${n0(nt.m2_top_v)} m² en ${nt.m2_top} a ${n1(nt.m2_low_v)} m² en ${nt.m2_low}.
¿Cuál es el parque nacional más grande en tierra?
${nt.pn_mayor}, creado en ${nt.pn_mayor_anio}, con ${n0(nt.pn_mayor_ha)} hectáreas.
¿En qué área protegida se registraron más especies animales?
En ${nt.esp_top}: ${n0(nt.esp_top_v)} especies. Le sigue ${nt.esp_2}, con ${n0(nt.esp_2_v)}.
¿Volvió el turismo extranjero al nivel de ${tu.max_anio}?
En los doce meses a ${tu.doce_hasta} llegaron ${n0(tu.doce)} turistas no residentes, ${pct(Math.abs((tu.doce / tu.max - 1) * 100))} ${tu.doce < tu.max ? "menos" : "más"} que en ${tu.max_anio}.
¿Cuánta pobreza hay en las ciudades del país?
En el ${R.pobreza.sem}, el ${pct(R.pobreza.pob)} de las personas de los 31 aglomerados urbanos estaba bajo la línea de pobreza. El pico fue ${pct(R.pobreza.max)}, en el ${R.pobreza.max_sem}.
¿Cuál es el parque nacional más visitado?
${vpq.top}, con ${n0(vpq.top_v)} visitas en ${vpq.ult}. Le sigue ${vpq.dos}, con ${n0(vpq.dos_v)}.
¿Qué es lo que más se pesca en el mar argentino?
${pe.top[0]}: ${n0(pe.top_t[0])} toneladas en ${pe.anio}, el ${pct(pe.top_pct)} de todo lo desembarcado.
¿Se patentan más autos o más motos?
En ${au.anio} se inscribieron ${n0(au.motos)} motos nuevas y ${n0(au.autos)} autos.
¿Volvieron los pasajeros al tren y al subte?
En ${su.mes}, por día hábil, se usaron ${pct(Math.abs(su.tren_vs_pre))} ${su.tren_vs_pre < 0 ? "menos" : "más"} tarjetas SUBE en el tren y ${pct(Math.abs(su.subte_vs_pre))} ${su.subte_vs_pre < 0 ? "menos" : "más"} en el subte que en marzo de 2020.
¿Cuántos bebés se llamaron Lionel en ${cu.lionel_anio}?
${n0(cu.lionel_max)}, ${veces(cu.lionel_max, cu.lionel_prev)} veces los del año anterior (${n0(cu.lionel_prev)}).
¿Cuánta carne vacuna come un argentino por año?
${n1(cu.carne_v)} kilos en ${cu.carne_anio}. En ${cu.carne_ini} eran ${n1(cu.carne_ini_v)}.
¿Cuántos kilos de pollo vale un kilo de asado?
${n1(cu.asado)} kilos en ${cu.asado_hasta}, en el Gran Buenos Aires. En ${cu.asado_ini_anio} eran ${n1(cu.asado_ini)}.
¿Cuánto vino menos se vende que en ${cu.vino_ini}?
${pct(Math.abs(cu.vino_caida))} menos: ${n0(cu.vino_v)} millones de litros en ${cu.vino_anio} contra ${n0(cu.vino_ini_v)} millones.
¿Qué provincia tiene más glaciares?
${cu.gl_top}, con ${n0(cu.gl_top_v)}. Le sigue ${cu.gl_2}, con ${n0(cu.gl_2_v)}.
¿Cuál fue el año más cálido desde ${cu.cl_ini}?
${cu.cl_max_anio}, con una temperatura media ${n2(cu.cl_max)} °C por encima del valor de referencia.
¿Cómo cambió la maternidad adolescente?
En ${nac.anio_ini}, ${n1(nac.pct_ini)} de cada 100 nacimientos eran de madres menores de 20 años. En ${nac.anio_ult}, ${n1(nac.pct_ult)}.
¿Quién estuvo más años en el Congreso desde 1983?
${AC.top[0].nombre}: ${n1(AC.top[0].total)} años
 entre Diputados y el Senado
 en el Senado
 en Diputados
${AC.top[0].sigue ? ", y sigue en el cargo" : ""}. Le siguen ${AC.top[1].nombre} (${n1(AC.top[1].total)}) y ${AC.top[2].nombre} (${n1(AC.top[2].total)}).
¿Cuántos fallos firma la Corte Suprema por año?
${n0(R.justicia.corte.fallos)} en ${R.justicia.corte.hasta}, que cerraron ${n0(R.justicia.corte.resueltos)} casos. Ese año llegaron ${n0(R.justicia.corte.ingresados)} casos nuevos.
¿Cuántos jueces federales no tienen titular?
El ${pct(R.justicia.federal.pct_sin_titular)} de los ${n0(R.justicia.federal.cargos)} cargos de juez federal, en ${R.justicia.federal.fecha}.
¿Cuántas fiscalías federales hay?
${n0(R.justicia.mp.fiscalias)} fiscalías y ${n0(R.justicia.mp.defensorias)} defensorías públicas oficiales de la Justicia Federal en ${R.justicia.mp.fecha}.
¿Cuántos jueces tienen las justicias provinciales?
${n0(R.justicia.prov.magistratura)} al 31 de octubre de ${R.justicia.prov.anio}, contando la justicia de paz: ${n1(R.justicia.prov.pais.magistratura)} cada 100.000 habitantes.
```

## scripts/datina.js#menuBarra.primero

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, menuBarra › primero, línea 7238
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
a, summary
```

Propuesto: igual al original.

## scripts/datina.js#CV_EPH.c

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, CV_EPH › c, línea 7281
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
${C.length > 1 ? "las" : "la"} de ${lista(C)} ${C.length > 1 ? "están" : "está"} entre 16% y 25%
ninguna capital está entre 16% y 25%
```

Propuesto: igual al original.

## scripts/datina.js#fuerzaArt

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, fuerzaArt, línea 7402
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
débil
```

Propuesto: igual al original.

## scripts/datina.js#textoArt.respuesta

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, textoArt › respuesta, línea 7418
- Tipo: artículo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
No hay un patrón claro.
No: la relación va en sentido contrario.
Sí, en general.
```

Propuesto: igual al original.

## scripts/datina.js#DAT_ART

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, DAT_ART, línea 7453
- Tipo: interno
- Estado: **conservado deliberadamente**
- Motivo: Literal que busca prueba_fallas.mjs (línea 79).
- Verificación: No se muestra en la página o se conserva literal: no corresponde buscarlo.

Original:

```text
Datina: no se pudo armar el artículo ${a.id}.
<p class="nota">No se pudo armar este artículo. Probá recargar la página.</p>
```

Propuesto: igual al original.

## scripts/datina.js#PLURAL

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, PLURAL, línea 7488
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
débil
débiles
```

Propuesto: igual al original.

## scripts/datina.js#ART_SERIE.fichas

- Rutas: a-dolar-inversion.html, catalogo.html, construccion.html, relaciones.html
- Fuente: `scripts/datina.js`, ART_SERIE › fichas, línea 7494
- Tipo: artículo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: a-dolar-inversion.html, catalogo.html, construccion.html, relaciones.html.

Original:

```text
actividad de la construcción
costo de la construcción
créditos hipotecarios
precio de los combustibles
exportaciones por provincia
```

Propuesto: igual al original.

## scripts/datina.js#ART_SERIE.fuentes

- Rutas: nosotros.html
- Fuente: `scripts/datina.js`, ART_SERIE › fuentes, línea 7496
- Tipo: artículo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: a-exportaciones-dolar.html, catalogo.html.

Original:

```text
Banco Central de la República Argentina, índice de tipo de cambio real multilateral, e INDEC y Banco Central vía API de Series de Tiempo: 
inversión bruta interna fija (oferta y demanda globales), tipo de cambio de referencia (Comunicación \"A\" 3500) y balance cambiario
Ministerio de Turismo y Deportes, SINTA, estimación de turismo internacional (viajes de turistas no residentes y residentes), y Banco Central 
de la República Argentina, índices de tipo de cambio real multilateral y bilaterales
Secretaría de Energía, precios en estaciones de servicio (Resolución 1104/2004), Banco Central de la República Argentina, tipo de cambio de 
referencia (Comunicación \"A\" 3500), y Administración de Información Energética de los Estados Unidos (EIA), precio del petróleo Brent
INDEC, índices de valor, precio y cantidad de las exportaciones de bienes e intercambio comercial argentino, vía API de Series de Tiempo, y Banco 
Central de la República Argentina, índices de tipo de cambio real multilateral y bilateral con Brasil
```

Propuesto: igual al original.

## scripts/datina.js#ARTS_DE.arts

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, ARTS_DE › arts, línea 7818
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
<p class="pie-arts"><span>${arts.length > 1 ? "Artículos" : "Artículo"} con este dato:</span>
```

Propuesto: igual al original.

## scripts/datina.js#nosCifras.temas

- Rutas: nosotros.html
- Fuente: `scripts/datina.js`, nosCifras › temas, línea 7833
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: nosotros.html.

Original:

```text
fichas con su tabla
secciones temáticas
artículos de cruces
```

Propuesto: igual al original.

## scripts/datina.js#estado

- Rutas: index.html
- Fuente: `scripts/datina.js`, estado, línea 7839
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
${ARTS.length} artículos
a[href^="#"]
```

Propuesto: igual al original.

## scripts/datina.js#estado.a

- Rutas: index.html
- Fuente: `scripts/datina.js`, estado › a, línea 7844
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
a[href^="#"]
```

Propuesto: igual al original.

## scripts/datina.js#SERIE_CIFRA.x-pet-shale

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, SERIE_CIFRA › x-pet-shale, línea 7917
- Tipo: cifra destacada
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado al evaluar el texto en la página con los datos reales: es de otra vista, de una cifra de En cifras, del buscador o de una vista OCDE.

Original:

```text
Petróleo no convencional, % de la producción de cada año
```

Propuesto: igual al original.

## scripts/datina.js#SERIE_CIFRA.x-inflacion-mes

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, SERIE_CIFRA › x-inflacion-mes, línea 7945
- Tipo: cifra destacada
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado al evaluar el texto en la página con los datos reales: es de otra vista, de una cifra de En cifras, del buscador o de una vista OCDE.

Original:

```text
Inflación de cada mes
```

Propuesto: igual al original.

## scripts/datina.js#SERIE_CIFRA.x-viviendas-construccion

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, SERIE_CIFRA › x-viviendas-construccion, línea 7964
- Tipo: cifra destacada
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado al evaluar el texto en la página con los datos reales: es de otra vista, de una cifra de En cifras, del buscador o de una vista OCDE.

Original:

```text
Viviendas en construcción cada 1.000 viviendas, Censo 2022
```

Propuesto: igual al original.

## scripts/datina.js#SERIE_CIFRA.x-ev-brecha

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, SERIE_CIFRA › x-ev-brecha, línea 7979
- Tipo: cifra destacada
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado al evaluar el texto en la página con los datos reales: es de otra vista, de una cifra de En cifras, del buscador o de una vista OCDE.

Original:

```text
Años más de esperanza de vida de las mujeres que de los varones, ${nv.ev_anio}
```

Propuesto: igual al original.

## scripts/datina.js#SERIE_CIFRA.x-aprender-len

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, SERIE_CIFRA › x-aprender-len, línea 7983
- Tipo: cifra destacada
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado al evaluar el texto en la página con los datos reales: es de otra vista, de una cifra de En cifras, del buscador o de una vista OCDE.

Original:

```text
Lengua en 6° grado: % en nivel satisfactorio o avanzado, Aprender ${ap.anio}
```

Propuesto: igual al original.

## scripts/datina.js#SERIE_CIFRA.x-aprender-debajo

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, SERIE_CIFRA › x-aprender-debajo, línea 7984
- Tipo: cifra destacada
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado al evaluar el texto en la página con los datos reales: es de otra vista, de una cifra de En cifras, del buscador o de una vista OCDE.

Original:

```text
Matemática en 6° grado: % por debajo del nivel básico, Aprender ${ap.anio}
```

Propuesto: igual al original.

## scripts/datina.js#SERIE_CIFRA.x-vejez

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, SERIE_CIFRA › x-vejez, línea 7997
- Tipo: cifra destacada
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado al evaluar el texto en la página con los datos reales: es de otra vista, de una cifra de En cifras, del buscador o de una vista OCDE.

Original:

```text
Personas de 65 años o más cada 100 de 15 a 64, proyección del INDEC
```

Propuesto: igual al original.

## scripts/datina.js#SERIE_CIFRA.x-jubilaciones

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, SERIE_CIFRA › x-jubilaciones, línea 7999
- Tipo: cifra destacada
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado al evaluar el texto en la página con los datos reales: es de otra vista, de una cifra de En cifras, del buscador o de una vista OCDE.

Original:

```text
Aportantes por cada jubilación o pensión de ANSES, por año
```

Propuesto: igual al original.

## scripts/datina.js#SERIE_CIFRA.x-atn

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, SERIE_CIFRA › x-atn, línea 8002
- Tipo: cifra destacada
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado al evaluar el texto en la página con los datos reales: es de otra vista, de una cifra de En cifras, del buscador o de una vista OCDE.

Original:

```text
Aportes del Tesoro Nacional por año, en miles de millones de pesos de ${TRR.ult}
```

Propuesto: igual al original.

## scripts/datina.js#SERIE_CIFRA.x-hogares-crec

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, SERIE_CIFRA › x-hogares-crec, línea 8010
- Tipo: cifra destacada
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado al evaluar el texto en la página con los datos reales: es de otra vista, de una cifra de En cifras, del buscador o de una vista OCDE.

Original:

```text
Demanda eléctrica de los hogares, índice ${T.energia_hogares[0].anio} = 100
```

Propuesto: igual al original.

## scripts/datina.js#SERIE_CIFRA.x-demanda-total

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, SERIE_CIFRA › x-demanda-total, línea 8012
- Tipo: cifra destacada
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado al evaluar el texto en la página con los datos reales: es de otra vista, de una cifra de En cifras, del buscador o de una vista OCDE.

Original:

```text
Demanda eléctrica total por año, en gigavatios hora
```

Propuesto: igual al original.

## scripts/datina.js#SERIE_CIFRA.x-hoteles-nr

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, SERIE_CIFRA › x-hoteles-nr, línea 8018
- Tipo: cifra destacada
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado al evaluar el texto en la página con los datos reales: es de otra vista, de una cifra de En cifras, del buscador o de una vista OCDE.

Original:

```text
Viajeros en hoteles que no residen en el país, en % del total
```

Propuesto: igual al original.

## scripts/datina.js#htmlMini.tarjeta

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, htmlMini › tarjeta, línea 8071
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
.en-cifras .cifra
```

Propuesto: igual al original.

## scripts/datina.js#htmlMini.MENU_G

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, htmlMini › MENU_G, línea 8124
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Provincias
Historias
Herramientas
```

Propuesto: igual al original.

## scripts/datina.js#htmlMini.grupoPag

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, htmlMini › grupoPag, línea 8125
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Temas
```

Propuesto: igual al original.

## scripts/datina.js#htmlMini.armar

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, htmlMini › armar, línea 8132
- Tipo: gráfico
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Tu provincia
Provincias
perfil provincia provincias comparar país posición historia
${n} en números
Provincias
Laboratorio
Historias
piezas visuales gráficos
La Corte Suprema: quién designó a cada juez
Historias
corte suprema justicia jueces ministros designación presidentes gobiernos de facto poder judicial laboratorio
Historias
Laboratorio
Consultor de pobreza
Herramientas
Explorador de relaciones
Herramientas
de dónde sale cada número origen fuentes organismos archivos
Sobre nosotros
Datina
propósito quiénes fuentes principios cómo se hace método
Contacto
Datina
Fichas
Fichas
Historias
Artículo
```

Propuesto:

```text
Tu provincia
Provincias
perfil provincia provincias comparar país posición historia
${n} en números
Provincias
Laboratorio
Historias
piezas visuales gráficos
¿Qué gobierno designó a cada juez de la Corte Suprema?
Historias
corte suprema justicia jueces ministros designación presidentes gobiernos de facto poder judicial laboratorio
Historias
Laboratorio
Consultor de pobreza
Herramientas
Explorador de relaciones
Herramientas
de dónde sale cada número origen fuentes organismos archivos
Sobre nosotros
Datina
propósito quiénes fuentes principios cómo se hace método
Contacto
Datina
Fichas
Fichas
Historias
Artículo
```

## scripts/datina.js#htmlMini.ALIAS_PROV

- Rutas: construccion.html, economia.html, educacion.html, emprendedores.html, empresas.html, energia.html, poblacion.html, pobreza.html, politica.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94, seguridad.html, trabajo.html
- Fuente: `scripts/datina.js`, htmlMini › ALIAS_PROV, línea 8161
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: construccion.html, economia.html, educacion.html, emprendedores.html, empresas.html, energia.html y otras.

Original:

```text
ciudad de buenos aires
provincia de buenos aires
```

Propuesto: igual al original.

## scripts/datina.js#htmlMini.VACIAS

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, htmlMini › VACIAS, línea 8164
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
de del la las el los lo en y e o u a al un una unos unas por para con sin que cuanto cuanta cuantos cuantas como 
cual cuales donde quien quienes hay se es son esta estan fue mas menos muy tiene tienen cada su sus provincia provincias pais argentina
```

Propuesto: igual al original.

## scripts/datina.js#htmlMini.ejemplos

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, htmlMini › ejemplos, línea 8221
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Preguntas de ejemplo
```

Propuesto: igual al original.

## scripts/datina.js#htmlMini.combo

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, emprendedores.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, politica.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/datina.js`, htmlMini › combo, línea 8263
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
Resultados de la búsqueda
```

Propuesto: igual al original.

## scripts/datina.js#vistasL.f

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, vistasL › f, línea 8357
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
.menu-panel a, .pie-mapa a
```

Propuesto: igual al original.

## scripts/datina.js#CORTO_CHIP

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, emprendedores.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, pobreza/index.html, politica.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/datina.js`, CORTO_CHIP, línea 8363
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
Santiago del Estero
Sgo. del Estero
Tierra del Fuego
T. del Fuego
```

Propuesto: igual al original.

## scripts/datina.js#pintarChip.poner

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, pintarChip › poner, línea 8414
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Listo, tu correo quedó anotado.
No se pudo enviar. Probá de nuevo en un rato.
```

Propuesto: igual al original.

## scripts/datina.js#mapa.AYUDA

- Rutas: index.html
- Fuente: `scripts/datina.js`, mapa › AYUDA, línea 8496
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: index.html.

Original:

```text
Hacé clic en una provincia para ver sus datos
```

Propuesto: igual al original.

## scripts/datina.js#mapa.dibujar

- Rutas: index.html
- Fuente: `scripts/datina.js`, mapa › dibujar, línea 8525
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
a[data-c="02"]
${NOMBRES[c]}: ver sus datos
```

Propuesto: igual al original.

## scripts/datina.js#MAPA_IND

- Rutas: a-cloacas-mortalidad.html, a-exportaciones-empleo.html, a-milei-empleo.html, a-recursos-empleo.html, a-viviendas-alquiler.html, articulos.html, catalogo.html, construccion.html, cruces.html, externo.html, indice.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94, trabajo.html
- Fuente: `scripts/datina.js`, MAPA_IND, línea 8551
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: a-cloacas-mortalidad.html, a-exportaciones-empleo.html, a-milei-empleo.html, a-recursos-empleo.html, a-viviendas-alquiler.html, articulos.html y otras.

Original:

```text
Empleo privado registrado
Esperanza de vida
Mortalidad infantil
Aprender, matemática
```

Propuesto: igual al original.

## scripts/datina.js#tarjetaMapa.filas

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, tarjetaMapa › filas, línea 8564
- Tipo: gráfico
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
<li><span class="mt-lab">${x.lab}</span><b>${x.f(f[x.k])}</b><small>${pos}.º de ${x.d.length}, de mayor a menor. País: ${x.f(x.pais)}</small>
Datos de ${NOMBRES[c]}
<ul>${filas}</ul><a class="boton principal chico" href="provincia.html?prov=${c}">Ver perfil completo</a>
#mapa .provs a
```

Propuesto:

```text
<li><span class="mt-lab">${x.lab}</span><b>${x.f(f[x.k])}</b><small>${puestoTxt(pos, x.d.length)}. País: ${x.f(x.pais)}</small>
Datos de ${NOMBRES[c]}
<ul>${filas}</ul><a class="boton principal chico" href="provincia.html?prov=${c}">Ver perfil completo</a>
#mapa .provs a
```

## scripts/datina.js#cerrarTarjetaMapa

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, cerrarTarjetaMapa, línea 8580
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
#mapa .provs a.tocada
```

Propuesto: igual al original.

## scripts/datina.js#marcarMapa

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, marcarMapa, línea 8583
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
#mapa .provs a
```

Propuesto: igual al original.

## scripts/datina.js#mostrarHistoria.textos

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, mostrarHistoria › textos, línea 8603
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
.etiqueta, .cat-tit, .cat-sub, .cat-datos dd, .cat-dic code
```

Propuesto: igual al original.

## scripts/datina.js#mostrarHistoria.filtrar

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, mostrarHistoria › filtrar, línea 8623
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Mostrar la última tabla
Mostrar las ${resto} tablas que quedan
Mostrar ${PASO} tablas más (quedan ${resto})
<b>${n}</b> de ${items.length} tablas
```

Propuesto: igual al original.

## scripts/datina.js#mostrarHistoria.par

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/datina.js`, mostrarHistoria › par, línea 8645
- Tipo: gráfico
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
.cat-tit a
```

Propuesto: igual al original.

## scripts/plantilla.html#pagina/title

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, emprendedores.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, politica.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94, relaciones.html, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/plantilla.html`, pagina > title, línea 6
- Tipo: SEO
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
Datina | Las 24 Argentinas en números
```

Propuesto: igual al original.

## scripts/plantilla.html#pagina/meta@content

- Rutas: index.html
- Fuente: `scripts/plantilla.html`, pagina > meta [content], línea 7
- Tipo: SEO
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: index.html.

Original:

```text
Datina: las 24 Argentinas en números. Datos públicos sobre la Argentina, los argentinos y las 24 provincias, explicados para que cualquiera los entienda, los compare y los pueda verificar.
```

Propuesto:

```text
Datina: las 24 Argentinas en números. Datos públicos de la Argentina y de sus 24 jurisdicciones, explicados para que cualquiera pueda entenderlos, compararlos y verificarlos.
```

## scripts/plantilla.html#pagina/nav.temas@aria-label

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, emprendedores.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, politica.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94, relaciones.html, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/plantilla.html`, pagina > nav.temas [aria-label], línea 34
- Tipo: accesibilidad
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
Temas principales
```

Propuesto: igual al original.

## scripts/plantilla.html#menu-btn/button.menu-btn

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, politica.html, provincia.html, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/plantilla.html`, menu-btn > button.menu-btn, línea 36
- Tipo: botón
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Menú<svg class="mas-flecha" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M2.5 4.5 6 8l3.5-3.5"/></svg>
```

Propuesto: igual al original.

## scripts/plantilla.html#chip-borrar/button.chip-borrar

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, politica.html, provincia.html, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/plantilla.html`, chip-borrar > button.chip-borrar, línea 42
- Tipo: botón
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
<svg class="ico" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M5 5l10 10M15 5L5 15"/></svg><span class="chip-txt">Ver todo el país</span>
```

Propuesto: igual al original.

## scripts/plantilla.html#chip-borrar/button.chip-borrar@title

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, politica.html, provincia.html, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/plantilla.html`, chip-borrar > button.chip-borrar [title], línea 42
- Tipo: accesibilidad
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
Ver todo el país
```

Propuesto: igual al original.

## scripts/plantilla.html#lupa-btn/button.lupa-btn@aria-label

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, politica.html, provincia.html, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/plantilla.html`, lupa-btn > button.lupa-btn [aria-label], línea 44
- Tipo: accesibilidad
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
Buscar en Datina
```

Propuesto: igual al original.

## scripts/plantilla.html#lupa-btn/button.lupa-btn@title

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, politica.html, provincia.html, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/plantilla.html`, lupa-btn > button.lupa-btn [title], línea 44
- Tipo: accesibilidad
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
Buscar (tecla /)
```

Propuesto: igual al original.

## scripts/plantilla.html#buscador/label.buscador-lab

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, politica.html, provincia.html, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/plantilla.html`, buscador > label.buscador-lab, línea 49
- Tipo: etiqueta de control
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
Buscar en Datina
```

Propuesto: igual al original.

## scripts/plantilla.html#busca/input@placeholder

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, politica.html, provincia.html, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/plantilla.html`, busca > input [placeholder], línea 50
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
Tema, provincia o pregunta
```

Propuesto: igual al original.

## scripts/plantilla.html#menu-panel/nav.menu-panel@aria-label

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, politica.html, provincia.html, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/plantilla.html`, menu-panel > nav.menu-panel [aria-label], línea 61
- Tipo: accesibilidad
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Menú
```

Propuesto: igual al original.

## scripts/plantilla.html#mapa/svg.mapa-fondo@aria-label

- Rutas: index.html
- Fuente: `scripts/plantilla.html`, mapa > svg.mapa-fondo [aria-label], línea 72
- Tipo: accesibilidad
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: index.html.

Original:

```text
Mapa de las 24 jurisdicciones. Con el teclado, cada una está en la lista de Provincias, más abajo en esta página
```

Propuesto: igual al original.

## scripts/plantilla.html#inicio/h1

- Rutas: index.html
- Fuente: `scripts/plantilla.html`, inicio > h1, línea 75
- Tipo: título de página
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Dat<span class="i-gorro">i<svg class="gorro" viewBox="0 0 40 40" aria-hidden="true"><path class="gorro-cuerpo" d="M8.5,33 C7.6,23.5 9.6,14.6 16,8.6 C21.2,3.8 29.4,2.8 34.6,6.8 C38.2,9.6 38,14.8 34.6,16.6 C32.2,17.9 29.6,16.8 28.6,14.6 C27.9,13.1 26.4,12.3 24.8,12.8 C29.4,17.4 31.6,24.4 31.6,33 Z"/><path class="gorro-brillo" d="M13.2,27 C13,20.6 14.8,15.2 18.6,11.4"/><path class="gorro-banda" d="M6.4,31.2 Q20,29.4 33.6,31.2 L33.6,36.6 Q20,38.4 6.4,36.6 Z"/></svg></span>na
```

Propuesto: igual al original.

## scripts/plantilla.html#inicio/p.lema

- Rutas: index.html
- Fuente: `scripts/plantilla.html`, inicio > p.lema, línea 76
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
Las 24 Argentinas en números
```

Propuesto: igual al original.

## scripts/plantilla.html#inicio/p.bajada

- Rutas: index.html
- Fuente: `scripts/plantilla.html`, inicio > p.bajada, línea 77
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: index.html.

Original:

```text
Datos públicos sobre la Argentina, los argentinos y las 24 provincias, explicados para que cualquiera los entienda, los compare y los pueda verificar.
```

Propuesto:

```text
Datos públicos de la Argentina y de sus 24 jurisdicciones, explicados para que cualquiera pueda entenderlos, compararlos y verificarlos.
```

## scripts/plantilla.html#inicio/label.solo-lector

- Rutas: index.html
- Fuente: `scripts/plantilla.html`, inicio > label.solo-lector, línea 81
- Tipo: etiqueta de control
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
Buscar en Datina
```

Propuesto: igual al original.

## scripts/plantilla.html#busca-portada/input@placeholder

- Rutas: index.html
- Fuente: `scripts/plantilla.html`, busca-portada > input [placeholder], línea 82
- Tipo: texto de interfaz
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
Tema, provincia o pregunta
```

Propuesto: igual al original.

## scripts/plantilla.html#inicio/nav.atajos@aria-label

- Rutas: index.html
- Fuente: `scripts/plantilla.html`, inicio > nav.atajos [aria-label], línea 86
- Tipo: accesibilidad
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: index.html.

Original:

```text
Entradas principales
```

Propuesto: igual al original.

## scripts/plantilla.html#sol/svg.sol@aria-label

- Rutas: index.html
- Fuente: `scripts/plantilla.html`, sol > svg.sol [aria-label], línea 90
- Tipo: accesibilidad
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Sol de Mayo
```

Propuesto: igual al original.

## scripts/plantilla.html#mapa-ayuda/p.mapa-ayuda

- Rutas: index.html
- Fuente: `scripts/plantilla.html`, mapa-ayuda > p.mapa-ayuda, línea 102
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Tocá una provincia para ver sus datos
```

Propuesto: igual al original.

## scripts/plantilla.html#dest-tit/h2.bloque-tit

- Rutas: index.html
- Fuente: `scripts/plantilla.html`, dest-tit > h2.bloque-tit, línea 111
- Tipo: título
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Datos destacados
```

Propuesto: igual al original.

## scripts/plantilla.html#sec-titulo/h2.bloque-tit

- Rutas: index.html
- Fuente: `scripts/plantilla.html`, sec-titulo > h2.bloque-tit, línea 116
- Tipo: título
- Estado: **conservado deliberadamente**
- Motivo: Pedido del autor (etapa 36). «Explorá» no es uno de los verbos prohibidos y es el rótulo de un bloque, no el título de una página.
- Verificación: Comprobado en la página armada: index.html.

Original:

```text
Explorá la Argentina por tema
```

Propuesto: igual al original.

## scripts/plantilla.html#provh-tit/h2.bloque-tit

- Rutas: index.html
- Fuente: `scripts/plantilla.html`, provh-tit > h2.bloque-tit, línea 121
- Tipo: título
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Provincias
```

Propuesto: igual al original.

## scripts/plantilla.html#arth-tit/h2.bloque-tit

- Rutas: index.html
- Fuente: `scripts/plantilla.html`, arth-tit > h2.bloque-tit, línea 126
- Tipo: título
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
Historias con datos
```

Propuesto: igual al original.

## scripts/plantilla.html#pagina/p.bloque-sub

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/plantilla.html`, pagina > p.bloque-sub, línea 127
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Preguntas respondidas cruzando datos oficiales y piezas visuales del Laboratorio. Los números se recalculan con cada actualización.
```

Propuesto:

```text
Artículos que cruzan datos oficiales para contestar una pregunta, y piezas visuales del Laboratorio. Las cifras se recalculan con cada actualización de los datos.
```

## scripts/plantilla.html#herr-titulo/h2.bloque-tit

- Rutas: index.html
- Fuente: `scripts/plantilla.html`, herr-titulo > h2.bloque-tit, línea 133
- Tipo: título
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Herramientas
```

Propuesto: igual al original.

## scripts/plantilla.html#pagina/p.bloque-sub~2

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/plantilla.html`, pagina > p.bloque-sub, línea 134
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Para cruzar indicadores, armar tu propio ranking, describir la educación de cada provincia, consultar la pobreza por partido y comuna, bajar cualquier tabla y ver de dónde sale cada número.
```

Propuesto:

```text
Para cruzar indicadores, ordenar las provincias según lo que te importa y ver dónde está cada una en educación. También para consultar la pobreza por partido y comuna, bajar cualquier tabla y saber de dónde sale cada número.
```

## scripts/plantilla.html#nos-tit/h2

- Rutas: nosotros.html
- Fuente: `scripts/plantilla.html`, nos-tit > h2, línea 160
- Tipo: título
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
Sobre nosotros
```

Propuesto: igual al original.

## scripts/plantilla.html#nosotros/p.nos-bajada

- Rutas: nosotros.html
- Fuente: `scripts/plantilla.html`, nosotros > p.nos-bajada, línea 161
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: nosotros.html.

Original:

```text
Datina reúne las estadísticas públicas de la Argentina y las muestra provincia por provincia, para entender un problema, opinar con datos y encontrar oportunidades.
```

Propuesto:

```text
Datina reúne estadísticas públicas de la Argentina y las muestra provincia por provincia, para entender un tema, comparar jurisdicciones y discutir con datos.
```

## scripts/plantilla.html#nosotros/h2

- Rutas: nosotros.html
- Fuente: `scripts/plantilla.html`, nosotros > h2, línea 164
- Tipo: título
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: nosotros.html.

Original:

```text
Las 24, una por una
```

Propuesto: igual al original.

## scripts/plantilla.html#nosotros/p

- Rutas: nosotros.html
- Fuente: `scripts/plantilla.html`, nosotros > p, línea 164
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: nosotros.html.

Original:

```text
Muchas estadísticas se publican solo para el total del país, o en archivos difíciles de encontrar y de comparar. Datina pone a las 24 jurisdicciones una al lado de la otra, con la misma unidad y el mismo período.
```

Propuesto: igual al original.

## scripts/plantilla.html#nosotros/h2~2

- Rutas: nosotros.html
- Fuente: `scripts/plantilla.html`, nosotros > h2, línea 165
- Tipo: título
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: nosotros.html.

Original:

```text
Cada cifra con su origen
```

Propuesto: igual al original.

## scripts/plantilla.html#nosotros/p~2

- Rutas: nosotros.html
- Fuente: `scripts/plantilla.html`, nosotros > p, línea 165
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: nosotros.html.

Original:

```text
Cada dato dice qué mide, de qué año es y de dónde sale, y trae su tabla para descargar. Los textos se calculan a partir de los datos: no hay números escritos a mano.
```

Propuesto: igual al original.

## scripts/plantilla.html#fuentes/h2

- Rutas: nosotros.html
- Fuente: `scripts/plantilla.html`, fuentes > h2, línea 166
- Tipo: título
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
Fuentes oficiales
```

Propuesto:

```text
De dónde salen los datos
```

## scripts/plantilla.html#nosotros/p~3

- Rutas: nosotros.html
- Fuente: `scripts/plantilla.html`, nosotros > p, línea 166
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: nosotros.html.

Original:

```text
Los datos vienen de organismos públicos o de trabajos basados en ellos que publican su conjunto de datos: el INDEC, los ministerios nacionales, el Congreso, la Dirección Nacional Electoral, el RENAPER, el Banco Mundial y la OCDE, entre otros. Hay dos excepciones, señaladas donde aparecen: el lugar de nacimiento de los ministros, que sale de Wikipedia y Wikidata porque ningún organismo lo publica, y algunas fechas de los jueces de la Corte Suprema, que la tabla con las fuentes de esa pieza señala fila por fila.
```

Propuesto:

```text
Casi todos los datos vienen de organismos públicos: el INDEC, los ministerios nacionales, el Banco Central, el Congreso, la Dirección Nacional Electoral y el RENAPER, entre otros. Para comparar con otros países se usan el Banco Mundial, la OCDE y otras fuentes internacionales. Unas pocas fuentes no son oficiales y cada ficha las nombra. Las encuestas de confianza y de expectativas de inflación son de la Universidad Torcuato Di Tella. Las votaciones nominales del Congreso vienen de ¿Cómo Votó?, que reúne las actas oficiales de cada cámara. El lugar de nacimiento de presidentes y ministros sale de Wikipedia y Wikidata, porque ningún organismo lo publica. En la pieza de la Corte Suprema, la tabla de fuentes señala fila por fila las fechas de los jueces que no salen de un registro oficial.
```

## scripts/plantilla.html#nosotros/h2~3

- Rutas: nosotros.html
- Fuente: `scripts/plantilla.html`, nosotros > h2, línea 167
- Tipo: título
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: nosotros.html.

Original:

```text
Cruces con advertencias
```

Propuesto: igual al original.

## scripts/plantilla.html#nosotros/p~4

- Rutas: nosotros.html
- Fuente: `scripts/plantilla.html`, nosotros > p, línea 167
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: nosotros.html.

Original:

```text
Datina cruza fuentes distintas para buscar relaciones entre provincias. Cada cruce aclara sus límites: son pocos casos, son promedios y una correlación no prueba que una cosa cause la otra.
```

Propuesto:

```text
Datina cruza fuentes distintas para ver si dos datos van juntos, entre las provincias o a lo largo del tiempo. Cada cruce aclara sus límites: son pocos casos, son promedios y que dos datos vayan juntos no prueba que uno cause el otro.
```

## scripts/plantilla.html#nosotros/h2~4

- Rutas: nosotros.html
- Fuente: `scripts/plantilla.html`, nosotros > h2, línea 168
- Tipo: título
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Tono neutro
```

Propuesto: igual al original.

## scripts/plantilla.html#nosotros/p~5

- Rutas: nosotros.html
- Fuente: `scripts/plantilla.html`, nosotros > p, línea 168
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: nosotros.html.

Original:

```text
En política y en temas sensibles, Datina describe sin adjetivar. Las fichas sobre suicidio llevan líneas de ayuda y no entran en el perfil provincial ni en los cruces.
```

Propuesto:

```text
En política y en temas sensibles, Datina describe sin adjetivar. Las fichas sobre suicidio llevan las líneas de ayuda y no entran en el perfil provincial, en los cruces ni en los artículos.
```

## scripts/plantilla.html#nosotros/h2~5

- Rutas: nosotros.html
- Fuente: `scripts/plantilla.html`, nosotros > h2, línea 169
- Tipo: título
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: nosotros.html.

Original:

```text
Se actualiza sola
```

Propuesto: igual al original.

## scripts/plantilla.html#nosotros/p~6

- Rutas: nosotros.html
- Fuente: `scripts/plantilla.html`, nosotros > p, línea 169
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: nosotros.html.

Original:

```text
Todos los meses, los datos se actualizan con lo último que publica cada organismo público.
```

Propuesto:

```text
El día 5 de cada mes, el sitio vuelve a bajar los datos de cada fuente, los procesa y se arma de nuevo. Si una prueba de los datos falla, no se publica. Cada ficha dice cada cuánto se actualiza su dato.
```

## scripts/plantilla.html#nosotros/h2~6

- Rutas: nosotros.html
- Fuente: `scripts/plantilla.html`, nosotros > h2, línea 172
- Tipo: título
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Para quién es
```

Propuesto: igual al original.

## scripts/plantilla.html#nosotros/p~7

- Rutas: nosotros.html
- Fuente: `scripts/plantilla.html`, nosotros > p, línea 173
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: nosotros.html.

Original:

```text
Para quienes toman decisiones en el Estado, en empresas y en organizaciones sociales, para periodistas y docentes, y para cualquier persona curiosa que quiera mirar los números de su provincia con contexto.
```

Propuesto: igual al original.

## scripts/plantilla.html#nosotros/h2~7

- Rutas: nosotros.html
- Fuente: `scripts/plantilla.html`, nosotros > h2, línea 174
- Tipo: título
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Qué no es
```

Propuesto: igual al original.

## scripts/plantilla.html#nosotros/p~8

- Rutas: nosotros.html
- Fuente: `scripts/plantilla.html`, nosotros > p, línea 175
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: nosotros.html.

Original:

```text
Datina no es un sitio oficial ni habla en nombre de ningún organismo. Muestra datos públicos tal como los publica cada fuente y explica en cada ficha cómo se procesaron.
```

Propuesto:

```text
Datina no es un sitio oficial ni habla en nombre de ningún organismo. Parte de los datos tal como los publica cada fuente y explica en cada página cómo se procesaron.
```

## scripts/plantilla.html#como-se-hace/h2

- Rutas: nosotros.html
- Fuente: `scripts/plantilla.html`, como-se-hace > h2, línea 176
- Tipo: título
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Cómo se hace
```

Propuesto: igual al original.

## scripts/plantilla.html#nosotros/p~9

- Rutas: nosotros.html
- Fuente: `scripts/plantilla.html`, nosotros > p, línea 177
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: nosotros.html.

Original:

```text
Tres programas hacen todo el trabajo. El primero baja cada archivo tal como lo publica el organismo. El segundo los ordena en una tabla única, con una fila por jurisdicción, período e indicador, y calcula los indicadores. El tercero arma las páginas. La tabla completa está en <a href="datos/tabla_larga.csv" download>tabla_larga.csv</a>. El <a href="relaciones.html">Explorador de relaciones</a> muestra qué organismo publica cada archivo que baja el sitio y qué fichas arma con él, con la línea del programa que lo muestra.
```

Propuesto:

```text
Tres programas hacen el trabajo de cada mes. El primero baja cada archivo tal como lo publica el organismo. El segundo los ordena en una tabla única, con una fila por jurisdicción, período e indicador, y calcula los indicadores. El tercero arma las páginas. La tabla completa está en <a href="datos/tabla_larga.csv" download>tabla_larga.csv</a>. El <a href="relaciones.html">Explorador de relaciones</a> muestra qué organismo publica cada archivo que baja el sitio, qué fichas se arman con él y la línea del programa que lo prueba.
```

## scripts/plantilla.html#nosotros/h2~8

- Rutas: nosotros.html
- Fuente: `scripts/plantilla.html`, nosotros > h2, línea 178
- Tipo: título
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: nosotros.html.

Original:

```text
De dónde viene la idea
```

Propuesto: igual al original.

## scripts/plantilla.html#nosotros/p~10

- Rutas: nosotros.html
- Fuente: `scripts/plantilla.html`, nosotros > p, línea 179
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: nosotros.html.

Original:

```text
Datina toma ideas de The Pudding, que arranca cada historia con una pregunta, de Our World in Data, por mostrar siempre la fuente y la tabla, y de USAFacts, por presentar los datos públicos de forma clara y sin opinión. En la Argentina, Argendata, de Fundar, es un antecedente con datos sobre todo nacionales: Datina suma la mirada provincia por provincia y los cruces entre fuentes.
```

Propuesto:

```text
De The Pudding, Datina toma la idea de arrancar cada historia con una pregunta. De Our World in Data, la de mostrar siempre la fuente y la tabla. De USAFacts, la de presentar los datos públicos de forma clara y sin opinión. En la Argentina, Argendata, de Fundar, es un antecedente con datos sobre todo nacionales: Datina suma la mirada provincia por provincia y los cruces entre fuentes.
```

## scripts/plantilla.html#licencia/h2

- Rutas: nosotros.html
- Fuente: `scripts/plantilla.html`, licencia > h2, línea 180
- Tipo: título
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: nosotros.html.

Original:

```text
Licencia y reutilización
```

Propuesto: igual al original.

## scripts/plantilla.html#nosotros/p~11

- Rutas: nosotros.html
- Fuente: `scripts/plantilla.html`, nosotros > p, línea 181
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: nosotros.html.

Original:

```text
Los textos, los gráficos y las tablas que arma Datina se pueden copiar y adaptar, también con fines comerciales, citando a Datina y a la fuente de cada dato (licencia <a href="https://creativecommons.org/licenses/by/4.0/deed.es">Creative Commons Atribución 4.0</a>). El código del sitio es abierto, con licencia MIT. Los datos de base son de cada organismo y se rigen por sus condiciones: cada ficha dice de dónde salen. Las banderas provinciales tienen su propia licencia, detallada más abajo.
```

Propuesto: igual al original.

## scripts/plantilla.html#privacidad/h2

- Rutas: nosotros.html
- Fuente: `scripts/plantilla.html`, privacidad > h2, línea 182
- Tipo: título
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Tus datos
```

Propuesto: igual al original.

## scripts/plantilla.html#nosotros/p~12

- Rutas: nosotros.html
- Fuente: `scripts/plantilla.html`, nosotros > p, línea 183
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: Texto nuevo del bloque: reemplaza a uno anterior del mismo archivo.
- Verificación: Comprobado en la página armada: nosotros.html.

Original:

(no existe)

Propuesto:

```text
Datina no tiene cuentas de usuario. La provincia que elegís queda guardada en tu navegador, para mostrarla en las demás páginas.
```

## scripts/plantilla.html#nosotros/p~13

- Rutas: nosotros.html
- Fuente: `scripts/plantilla.html`, nosotros > p, línea 184
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Los formularios de Contacto y de novedades por correo guardan solo lo que escribís. Los correos se usan para avisar cuando hay datos o artículos nuevos y para responder mensajes: no se comparten ni se publican. Para darte de baja o pedir que se borre tu correo, escribí desde <a href="contacto.html">Contacto</a>.
```

Propuesto: igual al original.

## scripts/plantilla.html#nosotros/h2~9

- Rutas: nosotros.html
- Fuente: `scripts/plantilla.html`, nosotros > h2, línea 185
- Tipo: título
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: nosotros.html.

Original:

```text
El nombre y los símbolos
```

Propuesto: igual al original.

## scripts/plantilla.html#nosotros/p~14

- Rutas: nosotros.html
- Fuente: `scripts/plantilla.html`, nosotros > p, línea 186
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: nosotros.html.

Original:

```text
El gorro frigio sobre la i y el Sol de Mayo vienen del escudo y de la bandera nacionales. El mapa de la portada usa una proyección azimutal equidistante centrada en la Argentina: cada anillo marca la misma distancia desde el centro del país.
```

Propuesto: igual al original.

## scripts/plantilla.html#contacto-tit/h2

- Rutas: contacto.html
- Fuente: `scripts/plantilla.html`, contacto-tit > h2, línea 192
- Tipo: título
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Contacto
```

Propuesto: igual al original.

## scripts/plantilla.html#contacto/p.nos-bajada

- Rutas: contacto.html
- Fuente: `scripts/plantilla.html`, contacto > p.nos-bajada, línea 193
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: contacto.html.

Original:

```text
Para avisar de un error en un dato, sugerir una fuente o una pregunta, o contar cómo usás Datina.
```

Propuesto: igual al original.

## scripts/plantilla.html#contacto/p.oculto

- Rutas: contacto.html
- Fuente: `scripts/plantilla.html`, contacto > p.oculto, línea 197
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
<label>No completar este campo <input name="no-completar" tabindex="-1" autocomplete="off"></label>
```

Propuesto: igual al original.

## scripts/plantilla.html#contacto/label.campo

- Rutas: contacto.html
- Fuente: `scripts/plantilla.html`, contacto > label.campo, línea 198
- Tipo: etiqueta de control
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
<span>Mensaje</span><textarea name="mensaje" rows="6" required></textarea>
```

Propuesto: igual al original.

## scripts/plantilla.html#contacto/label.campo~2

- Rutas: contacto.html
- Fuente: `scripts/plantilla.html`, contacto > label.campo, línea 199
- Tipo: etiqueta de control
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
<span>Nombre <small>(opcional)</small></span><input type="text" name="nombre" autocomplete="name">
```

Propuesto: igual al original.

## scripts/plantilla.html#contacto/label.campo~3

- Rutas: contacto.html
- Fuente: `scripts/plantilla.html`, contacto > label.campo, línea 200
- Tipo: etiqueta de control
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
<span>Correo <small>(opcional, solo si querés respuesta)</small></span><input type="email" name="correo" autocomplete="email">
```

Propuesto: igual al original.

## scripts/plantilla.html#contacto/p.form-nota

- Rutas: contacto.html
- Fuente: `scripts/plantilla.html`, contacto > p.form-nota, línea 201
- Tipo: nota metodológica
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
El mensaje llega solo al equipo de Datina y no se publica.
```

Propuesto: igual al original.

## scripts/plantilla.html#contacto/button.boton.principal

- Rutas: contacto.html
- Fuente: `scripts/plantilla.html`, contacto > button.boton.principal, línea 202
- Tipo: botón
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Enviar mensaje
```

Propuesto: igual al original.

## scripts/plantilla.html#form-gracias/p.form-gracias

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/plantilla.html`, form-gracias > p.form-gracias, línea 204
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Gracias. El mensaje llegó al equipo de Datina.
```

Propuesto: igual al original.

## scripts/plantilla.html#susc-gracias/p.form-gracias

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/plantilla.html`, susc-gracias > p.form-gracias, línea 205
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
Gracias. Tu correo quedó anotado para recibir las novedades de Datina.
```

Propuesto: igual al original.

## scripts/plantilla.html#no-tit/h2

- Rutas: 404.html
- Fuente: `scripts/plantilla.html`, no-tit > h2, línea 209
- Tipo: título
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html.

Original:

```text
Esta página no existe
```

Propuesto: igual al original.

## scripts/plantilla.html#no-encontrada/p.nos-bajada

- Rutas: 404.html
- Fuente: `scripts/plantilla.html`, no-encontrada > p.nos-bajada, línea 210
- Tipo: párrafo
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: 404.html.

Original:

```text
Puede que la dirección tenga un error o que la página se haya mudado. Los datos siguen acá: elegí una sección o buscá con la lupa.
```

Propuesto:

```text
Puede que la dirección tenga un error o que la página se haya mudado. Elegí un tema o buscá con la lupa de la barra.
```

## scripts/plantilla.html#no-encontrada/p.no-acciones

- Rutas: 404.html
- Fuente: `scripts/plantilla.html`, no-encontrada > p.no-acciones, línea 211
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html.

Original:

```text
<a class="boton principal" href="./">Ir a la portada</a><a class="boton" href="./#secciones">Ver todos los temas</a>
```

Propuesto: igual al original.

## scripts/plantilla.html#pagina/p.pie-lema

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, emprendedores.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, politica.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94, relaciones.html, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/plantilla.html`, pagina > p.pie-lema, línea 2473
- Tipo: fuente o descarga
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
Las 24 Argentinas en números
```

Propuesto: igual al original.

## scripts/plantilla.html#pagina/p.oculto

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/plantilla.html`, pagina > p.oculto, línea 2480
- Tipo: párrafo
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
<label>No completar este campo <input name="no-completar" tabindex="-1" autocomplete="off"></label>
```

Propuesto: igual al original.

## scripts/plantilla.html#pagina/label.campo

- Rutas: nosotros.html
- Fuente: `scripts/plantilla.html`, pagina > label.campo, línea 2481
- Tipo: etiqueta de control
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente).

Original:

```text
<span>Novedades por correo</span>
```

Propuesto: igual al original.

## scripts/plantilla.html#pagina/button.susc-boton

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/plantilla.html`, pagina > button.susc-boton, línea 2482
- Tipo: botón
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
<span class="susc-lbl"><span class="susc-e activa" data-e="listo">Avisarme</span><span class="susc-e" data-e="envia">Enviando</span><span class="susc-e" data-e="ok">Anotado</span></span>
```

Propuesto: igual al original.

## scripts/plantilla.html#pagina/nav.pie-mapa@aria-label

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, emprendedores.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, politica.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94, relaciones.html, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/plantilla.html`, pagina > nav.pie-mapa [aria-label], línea 2486
- Tipo: accesibilidad
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
Mapa del sitio
```

Propuesto: igual al original.

## scripts/plantilla.html#pagina/h2

- Rutas: no se encontró en las páginas armadas
- Fuente: `scripts/plantilla.html`, pagina > h2, línea 2488
- Tipo: título
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas).

Original:

```text
Los datos
```

Propuesto: igual al original.

## scripts/plantilla.html#pagina/p

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, emprendedores.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, politica.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94, relaciones.html, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/plantilla.html`, pagina > p, línea 2490
- Tipo: fuente o descarga
- Estado: **reescrito**
- Motivo: Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque).
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
Todos los meses, los datos se actualizan con lo último que publica cada organismo público.
```

Propuesto:

```text
Se actualizan solos el día 5 de cada mes, con lo último que publicó cada fuente.
```

## scripts/plantilla.html#pagina/p~2

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, emprendedores.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, politica.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94, relaciones.html, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/plantilla.html`, pagina > p, línea 2491
- Tipo: fuente o descarga
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
<a class="enlace" href="catalogo.html">Catálogo de datos</a>
```

Propuesto: igual al original.

## scripts/plantilla.html#pagina/p~3

- Rutas: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html, a-dolar-inversion.html, a-empleo-pobreza.html, a-exportaciones-dolar.html, a-exportaciones-empleo.html, a-internet-aprender.html, a-inversion-aprender.html, a-milei-empleo.html, a-nafta-dolares.html, a-pobreza-desocupacion.html, a-recursos-empleo.html, a-turismo-dolar.html, a-viviendas-alquiler.html, a-viviendas-hacinamiento.html, articulos.html, catalogo.html, construccion.html, consulta-ia.html, contacto.html, corte-suprema.html, cruces.html, curiosidades.html, departamentos.html, diagnostico.html, economia.html, educacion.html, emprendedores.html, empresas.html, energia.html, externo.html, gobierno.html, index.html, indice.html, laboratorio.html, migraciones.html, movilidad.html, naturaleza.html, nosotros.html, petroleo.html, poblacion.html, pobreza.html, politica.html, provincia.html, provincia.html?prov=02, provincia.html?prov=06, provincia.html?prov=10, provincia.html?prov=14, provincia.html?prov=18, provincia.html?prov=22, provincia.html?prov=26, provincia.html?prov=30, provincia.html?prov=34, provincia.html?prov=38, provincia.html?prov=42, provincia.html?prov=46, provincia.html?prov=50, provincia.html?prov=54, provincia.html?prov=58, provincia.html?prov=62, provincia.html?prov=66, provincia.html?prov=70, provincia.html?prov=74, provincia.html?prov=78, provincia.html?prov=82, provincia.html?prov=86, provincia.html?prov=90, provincia.html?prov=94, relaciones.html, salud.html, seguridad.html, trabajo.html, turismo.html
- Fuente: `scripts/plantilla.html`, pagina > p, línea 2492
- Tipo: fuente o descarga
- Estado: **revisado sin cambios**
- Motivo: Se revisó y ya dice con claridad lo que muestra.
- Verificación: Comprobado en la página armada: 404.html, a-alquiler-pobreza.html, a-atn-presupuesto.html, a-cloacas-mortalidad.html, a-cobertura-adolescentes.html, a-cobertura-esperanza.html y otras.

Original:

```text
<a class="enlace" href="datos/tabla_larga.csv" download>Descargar la tabla completa (CSV)</a>
```

Propuesto: igual al original.
