# Línea de base visual y revisión de gráficos

Fecha: 11 de octubre de 2026 (sitio armado del commit abe1ec7 en adelante). Reemplaza a las capturas del ZIP, que quedan como históricas.

## Cómo se repite

```
node scripts/linea_base.mjs            # en la computadora del autor
DATINA_LIBS=<carpeta con d3.min.js y topojson-client.min.js> CHROME=/opt/pw-browsers/chromium node scripts/linea_base.mjs   # en la nube
```

Guarda las capturas y `resultado.json` en `linea_base/AAAA-MM-DD/` (fuera del repositorio, se regeneran). Corre localmente: no hay ni se creó ningún flujo de GitHub para esto.

## Qué cubre

- Páginas: portada, una sección temática (Trabajo), el perfil provincial (Neuquén), una ficha con mapa (Petróleo y gas), un artículo, el buscador abierto, el Explorador de relaciones y el consultor de pobreza.
- Anchos: 320, 360, 390, 430, 768, 1024, 1280, 1440 y 1920 píxeles, y el zoom del navegador al 200% y al 400%.
- En cada caso, 88 en total: la página corrida de costado, elementos visibles que se salen de la pantalla, textos de los gráficos de menos de 10 píxeles en pantalla, errores de JavaScript, CLS y LCP.

En la nube las letras de Google Fonts no cargan: las capturas usan las letras de reemplazo y no sirven para comparar píxeles con la computadora del autor.

## Resultado

| Revisión | Resultado |
|---|---|
| Página corrida de costado o elementos afuera | Ninguno en Datina. En el consultor de pobreza, a 320 y 360 píxeles y con zoom al 400%, los ejemplos de código (R y Python) corrían la página: resuelto (el constructor les agrega el corte de línea) |
| Errores de JavaScript | Ninguno en Datina. En el consultor de pobreza, a 320 píxeles, un gráfico calculaba un ancho negativo: resuelto en `pobreza/src/index.md`, se publica en el próximo armado del consultor (`npm run build` en `pobreza/`) |
| Textos de gráficos de menos de 10 píxeles en el celular | Uno: en Salarios, a 320 píxeles, un texto del gráfico queda apenas por debajo de 10 píxeles porque el gráfico se dibuja a 300 de ancho y se achica. Leve: los valores siguen en la tabla y en el cuadro |
| Zoom al 200% y al 400% | Sin desbordes en Datina. El consultor de pobreza ya deja agrandar en el celular (sin `maximum-scale=1`) |

## Métricas (carga local de prueba, no de usuarios reales)

Son de una carga en Chrome sin ventana con los archivos en la misma computadora: sirven para comparar versiones, no son datos de campo. Los objetivos de referencia son LCP ≤ 2,5 s, INP ≤ 200 ms y CLS ≤ 0,1 en el percentil 75 de usuarios reales, que todavía no se miden.

- LCP: hasta 1,8 s en todos los casos.
- CLS: 0 en la portada, las secciones y la Corte Suprema. Dos casos ya existían antes de los cambios de este día:
  - Los artículos dan entre 0,05 y 0,55 según la carga: la nota entera la arma `datina.js` al cargar, y a veces la página se muestra un instante antes.
  - El Explorador de relaciones da 0,12.
  - Arreglo para los dos: que el constructor escriba en el HTML el título y el esqueleto de la nota (o reserve su alto), como ya hace con las fichas.
- INP: no se midió (necesita interacciones reales).

### Una prueba que se deshizo

Se probó cargar D3, topojson, los datos y `datina.js` con `defer`, para no frenar la lectura de la página. La página se mostraba antes, vacía, y saltaba al armarse: CLS de 0,70 en la Corte Suprema y 0,10 en Trabajo, contra 0 con la carga de siempre. Se volvió a la carga anterior. Para cargar sin frenar y sin saltos, primero hay que resolver lo de los artículos y las piezas (arriba).

## Revisión de los gráficos

Familias de gráficos del sitio (las funciones de dibujo de `datina.js`) y página representativa de cada una: barras por provincia (`barrasH`, Salarios), barras por grupo (`barrasGrupos`, Rotación), pesas antes y después (`pesas`, Mortalidad infantil), líneas (`lineas`, Salario real), áreas apiladas (Petróleo), barras apiladas al 100% (Elecciones), mapas de provincias y departamentos (Áreas protegidas, Departamentos), hemiciclos (Legisladores), dispersión y matriz (Cruces), pirámide (Población).

Revisado en esta tanda:
- Línea del país: ya no tapa los valores de las provincias cercanas al promedio (va detrás y los valores llevan borde del color del fondo).
- Datos esenciales sin depender del mouse: los cuadros funcionan con el toque y, en Cruces, con el teclado. "Ver tabla" está en todas las fichas con tabla y se desplaza con el teclado.
- Letra chica en el celular: un solo caso leve (arriba).
- Unidad, período y referencia: cada ficha dice qué mide, su unidad y su período en la descripción y en la cifra destacada (regla de la frase repetida, aplicada en todas las secciones).

Queda para revisar a mano, familia por familia, con las capturas de `linea_base/`: valores faltantes (provincias sin dato) y leyendas en los mapas a 320 píxeles.
