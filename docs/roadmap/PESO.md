# Peso del sitio: en disco y lo que baja un visitante

Medido el 11 de octubre de 2026 sobre el sitio armado (commit 37961a8), antes de optimizar nada. No se borró ni se cambió ningún archivo.

## Cómo se midió

- En disco: `du` sobre `sitio/`.
- Transferencia: cada página abierta en Chrome sin ventana, recorrida hasta el final para que se dibujen todos los gráficos, anotando cada archivo que pide (protocolo de Chrome, `Network.responseReceived`). Para cada archivo del sitio se calculó su tamaño comprimido con gzip nivel 6, como estimación de lo que manda el servidor (Netlify y GitHub Pages comprimen; con brotli sería algo menos). D3 y topojson, de la CDN, también comprimidos. No incluye las letras de Google Fonts (no cargan en el entorno de prueba).
- El motor de consultas del consultor de pobreza lo pide un *worker* del navegador, que esa medición no ve: su peso se calculó sobre los archivos.

## En disco

| | Tamaño |
|---|---|
| `sitio/` completo | 111 MB |
| Consultor de pobreza (`sitio/pobreza/`) | 88 MB |
| De eso, las dos variantes de DuckDB (`duckdb-eh.wasm` y `duckdb-mvp.wasm`) | 76 MB |
| El resto de Datina | 23 MB |

Holgado para Netlify y para GitHub Pages (1 GB por sitio, 100 MB por archivo).

## Lo que baja un visitante (primera visita, sin nada guardado)

| Página | Pedidos | Sin comprimir | Comprimido |
|---|---|---|---|
| Portada | 11 | 2,18 MB | 0,59 MB |
| Trabajo | 9 | 1,94 MB | 0,51 MB |
| Petróleo y gas (con el mapa de pozos) | 15 | 2,88 MB | 0,69 MB |
| Un artículo | 9 | 1,93 MB | 0,51 MB |
| Consultor de pobreza, sin el motor | 57 | 1,76 MB | 0,50 MB |
| Consultor de pobreza, motor DuckDB y extensiones | | 39 MB | unos 7,9 MB |

Lo que más pesa en todas las páginas de Datina:
- `datina.js`: 762 KB, 224 KB comprimido.
- `datos/fichas.js`: 715 KB, 151 KB comprimido.
- D3 (CDN): 280 KB, 93 KB comprimido.

Los tres se guardan en el navegador: con la huella en la dirección (`?v=`) y en Netlify, un año (`netlify.toml`). En la segunda página que visita una persona solo baja el HTML de esa página y las tablas que pide su gráfico.

En el consultor de pobreza:
- El motor de consultas (`duckdb-eh.wasm`, 35,7 MB, unos 7,1 MB comprimido) y sus extensiones de Parquet y JSON (unos 0,85 MB comprimidos) se bajan apenas se abre la página.
- Los datos que consulta pesan menos de 100 KB en total (seis archivos Parquet).
- Cada navegador baja una sola variante del motor: `eh` si soporta las excepciones de WebAssembly, `mvp` si no (navegadores viejos). Por eso las dos tienen que seguir publicadas.

## Qué conviene hacer, en orden

1. **Nada en Datina por ahora.** 0,5 a 0,7 MB comprimidos en la primera visita es un peso razonable para un sitio con gráficos, y lo pesado se guarda para las páginas siguientes. Si en algún momento se quiere bajar, lo primero es partir `datina.js` y `fichas.js` por sección (cada página baja solo lo suyo), que es un cambio grande del constructor.
2. **El consultor de pobreza:** es el único lugar donde el peso importa (unos 8 MB para consultar menos de 100 KB de datos). La opción es cargar DuckDB solo cuando la persona abre el editor de SQL libre, y resolver las consultas guiadas con los Parquet y JavaScript (o con archivos CSV ya armados). Es un cambio del subproyecto `pobreza/` (Observable Framework) que hay que volver a armar con `npm run build` y probar entero: consulta guiada, SQL libre y descargas.
3. **No borrar ninguna variante de DuckDB:** las dos se usan según el navegador.
4. **Tráfico:** con el límite blando de 100 GB por mes de GitHub Pages (Netlify también limita el tráfico de su plan gratis, con otras reglas), el consultor alcanzaría para unas 12.000 primeras visitas por mes y el resto del sitio para más de 150.000. Hoy no es un problema.
