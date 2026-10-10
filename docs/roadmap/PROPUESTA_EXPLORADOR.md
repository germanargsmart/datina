# Propuesta del Explorador de relaciones (D1-02)

Borrador del 10 de octubre de 2026 para aprobar antes de programar. Sale del inventario (`INVENTARIO.md`) y de una revisión de solo lectura de los metadatos. Las decisiones que esperan un sí están en `DECISIONES.md`, marcadas "pendiente".

## Qué responde

"¿De dónde sale este número?": quién publica cada dato, qué archivo baja Datina y qué fichas arma con él. No muestra si un indicador influye en otro: para eso están Cruces y los artículos.

## Modelo

### Nodos

| Tipo | Id | De dónde sale | Obligatorios | Opcionales |
|---|---|---|---|---|
| Fuente (organismo que publica) | `org:indec`, `org:snic`... | Catálogo escrito a mano: hoy ningún archivo tiene la lista de organismos (en `FUENTES` el organismo va en comentarios y en los pies es texto libre) | id, nombre, sigla | organismo del que depende, página oficial, nombres alternativos tal como aparecen en el sitio |
| Conjunto de datos (archivo que baja o arma Datina) | `ds:snic_provincias.csv`, `ds:manual/presupuestos.csv` | Claves de `FUENTES` (`scripts/01_descargar.py:127`), funciones de descarga (`:1664-1687`) y `datos/manual/` | id, nombre, fuente, dirección o ruta | frecuencia, último período, estado de la última descarga (`datos/crudo/_registro.csv`) |
| Indicador (lo que muestra el sitio) | la ficha: `f-homicidios` | Fichas de la plantilla (`D.indice.fichas`, 122) | id, título, sección, página, fuente tal como se muestra | unidad, período, cobertura territorial, método (nota), CSV, indicadores de Cruces que la usan |

Período, unidad, cobertura territorial y método van en el panel, no como nodos.

Propuesta: el indicador es la ficha (lo que el lector ve y puede abrir), no cada una de las 202 variables de la tabla larga. Las variables y los indicadores de Cruces van como datos del panel de su ficha.

### Relaciones

| Relación | De a | Definición | Evidencia obligatoria |
|---|---|---|---|
| publica | fuente a conjunto | El organismo publica el archivo que baja Datina | La dirección de descarga en `FUENTES` o el pie de la ficha |
| alimenta | conjunto a indicador | `02_procesar.py` lee el archivo para armar la tabla de la ficha | Archivo y línea donde se lee (`CRUDO / "archivo"`) y donde se arma la tabla del CSV de la ficha |
| se calcula a partir de | indicador a indicador | La cifra de una ficha usa la de otra (por ejemplo, una tasa que divide por la población) | Archivo y línea del cálculo |

Nunca: correlaciones, causas, ni "relacionado" por compartir tema.

### Validaciones (D3-02)

Ids únicos, tipos permitidos, relación coherente con sus extremos, ninguna arista huérfana, cada conjunto con una sola fuente, cada indicador con al menos un conjunto o un indicador de origen, cada arista con su evidencia (y el programa controla que el archivo citado contenga lo que dice), y cada texto de fuente del sitio se resuelve a una fuente del catálogo por sus nombres alternativos.

### Lo que no se puede afirmar hoy (queda fuera o marcado)

- Archivos que mezclan organismos (series de la API de Series de Tiempo, como `energia_emae.csv`): un conjunto por serie o fuera del prototipo.
- Datos republicados (PISA vía Our World in Data, Banco Mundial con datos de la ONU): se muestra quien publica el archivo que baja Datina, y el panel nombra al productor original como texto.
- Once archivos de `datos/manual/` sin columna de fuente: su fuente se toma del programa que los armó, citando la línea.
- Los documentos de "Para entender los datos" son por sección, no por ficha: van como enlaces del panel de la sección, no como aristas.

## Muestra del prototipo (D2-01)

Dos secciones, Seguridad y Salud (sin las fichas de suicidio), unos 20 nodos y 25 relaciones, todas con evidencia:

- Fuentes: SNIC (Ministerio de Seguridad Nacional), Ministerio de Justicia (SNEEP), DEIS (Ministerio de Salud), INDEC.
- Conjuntos: `snic_provincias.csv`, `snic_pais.csv`, `sneep_poblacion.csv`, `sneep_condenados.csv`, `deis_mortalidad_infantil.csv`, `deis_defunciones_AAAA.csv`, `deis_nacidos_AAAA.csv`, `indec_tablas_mortalidad.csv`, `indec_proyecciones_provincias.csv`.
- Indicadores: `f-delitos`, `f-robos`, `f-homicidios`, `f-carceles`, `f-esperanza`, `f-mortalidad`, `f-causas-infantiles`.

La página dice que es una muestra mientras lo sea.

## Pantalla

Computadora (1440 píxeles):

```
┌ barra simple: DATINA · Explorador de relaciones · volver al sitio ─────────────┐
│ ¿De dónde sale cada número?                                                     │
│ Quién publica cada dato, qué archivo baja Datina y qué fichas arma con él.      │
│                                                                                  │
│ [ Buscar fuente, archivo o ficha…      ]  Tipo ▾  Tema ▾  Fuente ▾   (Grafo|Tabla) │
├──────────────────────────────────────────────────────┬───────────────────────────┤
│  ● fuente   ■ conjunto   ◆ indicador     [+][−][⌖][↺] │ Panel (al elegir un nodo)  │
│                                                      │ Homicidios dolosos por     │
│      ●SNIC ──publica──■snic_provincias.csv           │ provincia                  │
│                         └─alimenta─◆ f-homicidios    │ Qué mide · Unidad          │
│      ●INDEC ─publica─■proyecciones ─alimenta─┘       │ Período · Cobertura        │
│                                                      │ Fuente · Método            │
│                                                      │ Relaciones (lista)         │
│                                                      │ Abrir ficha · CSV · Fuente │
└──────────────────────────────────────────────────────┴───────────────────────────┘
│ Qué es una relación acá (definiciones) y qué no muestra                         │
```

Celular (390 píxeles): buscador arriba, la vista de tabla por defecto (lista de nodos agrupada por tipo, cada uno con sus relaciones), el panel como hoja que sube desde abajo y el grafo como segunda vista.

Detalles:

- Forma y color por tipo (círculo, cuadrado, rombo) con colores de `datina.css` (celeste, azul hondo y sol), nunca verde, rojo ni violeta.
- Elegir un nodo resalta sus vecinos y aclara el resto. El panel se cierra con Escape y el foco vuelve al nodo.
- Con movimiento reducido el grafo se dibuja ya quieto. La simulación se detiene cuando se estabiliza.
- La tabla es la misma información que el grafo y se puede usar sola con el teclado.
