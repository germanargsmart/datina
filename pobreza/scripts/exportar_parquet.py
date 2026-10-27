"""Exporta los datos del tablero de pobreza a tablas Parquet ordenadas.

Uso (desde la carpeta del proyecto):

    python scripts/exportar_parquet.py

Lee datos/crudo/ALL.json y escribe:
  - src/data/*.parquet (seis tablas, compresión zstd)
  - src/data/*.json (las mismas tablas en JSON compacto: columnas y filas, para la consulta guiada de la página,
    que se resuelve sin bajar el motor DuckDB)
  - src/diccionario.md (diccionario de datos, generado a partir de las descripciones de abajo)

Requiere pandas y pyarrow.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq

RAIZ = Path(__file__).resolve().parent.parent
CRUDO = RAIZ / "datos" / "crudo" / "ALL.json"
SALIDA = RAIZ / "src" / "data"
DICCIONARIO = RAIZ / "src" / "diccionario.md"

# Período de las estimaciones de corte (aglomerados y partidos/comunas)
PERIODO_ULTIMO = "1S 2026"


def periodo_legible(codigo: str) -> tuple[str, int, int]:
    """'1S2026' -> ('1S 2026', 2026, 1)."""
    sem = int(codigo[0])
    anio = int(codigo[2:])
    return f"{sem}S {anio}", anio, sem


# ---------------------------------------------------------------------------
# Esquemas y descripciones (la misma fuente alimenta los Parquet y el diccionario)
# ---------------------------------------------------------------------------
S, I8, I16, I32, F = pa.string(), pa.int8(), pa.int16(), pa.int32(), pa.float64()

TABLAS: dict[str, dict] = {
    "serie_nacional": {
        "titulo": "Serie nacional de pobreza e indigencia",
        "descripcion": (
            "Incidencia de la pobreza y la indigencia en el total de 31 aglomerados urbanos, "
            "por semestre, desde el segundo semestre de 2016 hasta el primero de 2026. Fuente: INDEC, EPH."
        ),
        "columnas": [
            ("periodo", S, "Semestre, por ejemplo 1S 2026"),
            ("anio", I16, "Año del semestre"),
            ("semestre", I8, "Semestre del año (1 o 2)"),
            ("indicador", S, "pobreza o indigencia"),
            ("unidad", S, "personas u hogares (población de referencia)"),
            ("valor_pct", F, "Porcentaje de personas u hogares en esa condición sobre el total de la población de referencia de los 31 aglomerados"),
        ],
    },
    "pobreza_edad": {
        "titulo": "Pobreza e indigencia por grupo de edad",
        "descripcion": (
            "Porcentaje de personas pobres e indigentes dentro de cada grupo de edad, total de 31 "
            "aglomerados urbanos, por semestre. Incluye los grupos generales (0 a 14, 15 a 29, 30 a 64, "
            "65 y más) y el detalle de niñas, niños y adolescentes (0 a 17 y subgrupos). Fuente: INDEC, EPH."
        ),
        "columnas": [
            ("periodo", S, "Semestre, por ejemplo 1S 2026"),
            ("anio", I16, "Año del semestre"),
            ("semestre", I8, "Semestre del año (1 o 2)"),
            ("grupo_edad", S, "Grupo de edad en años cumplidos (Total es el total de personas)"),
            ("serie_grupos", S, "general (grupos de toda la población) o ninez (0 a 17 años y subgrupos)"),
            ("indicador", S, "pobreza o indigencia"),
            ("valor_pct", F, "Porcentaje de personas del grupo de edad que están en esa condición"),
        ],
    },
    "aglomerados": {
        "titulo": "Aglomerados, regiones y totales en el último semestre",
        "descripcion": (
            "Datos del primer semestre de 2026 para el total de 31 aglomerados, las 6 regiones estadísticas, los 31 "
            "aglomerados (con Gran Buenos Aires dividido en CABA y Partidos del GBA) y los grupos por "
            "tamaño. Incluye coeficiente de variación (CV) e intervalo de confianza al 90% de cada "
            "incidencia. Fuente: INDEC, EPH, informe técnico del primer semestre de 2026 y anexo de CV."
        ),
        "columnas": [
            ("periodo", S, "Semestre de referencia (1S 2026)"),
            ("nombre", S, "Nombre del aglomerado, región o total"),
            ("tipo", S, "total, interior, region, aglomerado o tamano (grupo por tamaño del aglomerado)"),
            ("region", S, "Región estadística del INDEC a la que pertenece (vacía en totales)"),
            *[
                col
                for ind, etiqueta in [
                    ("pobreza_personas", "personas pobres"),
                    ("pobreza_hogares", "hogares pobres"),
                    ("indigencia_personas", "personas indigentes"),
                    ("indigencia_hogares", "hogares indigentes"),
                ]
                for col in [
                    (f"{ind}_pct", F, f"Porcentaje de {etiqueta} sobre el total de {etiqueta.split()[0]} de la unidad"),
                    (f"{ind}_cv", F, f"Coeficiente de variación de {ind}_pct, en %. Entre 16 y 25 leer con cuidado, más de 25 no confiable"),
                    (f"{ind}_li", F, f"Límite inferior del intervalo de confianza al 90% de {ind}_pct, en %"),
                    (f"{ind}_ls", F, f"Límite superior del intervalo de confianza al 90% de {ind}_pct, en %"),
                    (f"{ind}_miles", F, f"Cantidad de {etiqueta}, en miles"),
                ]
            ],
            ("total_personas_miles", F, "Población total de la unidad, en miles de personas (proyección EPH)"),
            ("total_hogares_miles", F, "Total de hogares de la unidad, en miles"),
        ],
    },
    "aglomerados_serie": {
        "titulo": "Serie por aglomerado, región y total",
        "descripcion": (
            "Incidencia de la pobreza y la indigencia por semestre para cada una de las 42 unidades "
            "de la tabla aglomerados. Vacío donde el INDEC no publicó dato (Gran Resistencia en el "
            "segundo semestre de 2019 y Ushuaia - Río Grande en el segundo semestre de 2020). Fuente: INDEC, EPH."
        ),
        "columnas": [
            ("aglomerado", S, "Nombre del aglomerado, región o total"),
            ("tipo", S, "total, interior, region, aglomerado o tamano"),
            ("region", S, "Región estadística del INDEC (vacía en totales)"),
            ("periodo", S, "Semestre, por ejemplo 1S 2026"),
            ("anio", I16, "Año del semestre"),
            ("semestre", I8, "Semestre del año (1 o 2)"),
            ("indicador", S, "pobreza o indigencia"),
            ("unidad", S, "personas u hogares"),
            ("valor_pct", F, "Porcentaje de personas u hogares de la unidad en esa condición (vacío si no hay dato)"),
        ],
    },
    "gba_partidos_comunas": {
        "titulo": "Partidos del GBA y comunas de CABA (estimación en áreas pequeñas)",
        "descripcion": (
            "Estimación de la pobreza y la indigencia en los 24 partidos del Gran Buenos Aires y las "
            "15 comunas de CABA para el primer semestre de 2026. No es una medición oficial: sale de un modelo "
            "estimado con la EPH del primer trimestre de 2026 y aplicado a las características de cada radio censal "
            "(Censo 2022), calibrado para reproducir el total oficial de cada dominio (36,9% de "
            "personas pobres en los Partidos del GBA y 11,1% en CABA). Intervalos de confianza al 90%, calculados por remuestreo (bootstrap). "
            "Población de referencia: la del Censo 2022."
        ),
        "columnas": [
            ("periodo", S, "Semestre de referencia de la estimación (1S 2026)"),
            ("unidad", S, "Partido del GBA o comuna de CABA"),
            ("jurisdiccion", S, "CABA (comunas) o GBA (partidos del conurbano)"),
            ("zona", S, "Agrupamiento: Primera corona, Segunda corona, La Matanza, CABA norte, CABA centro o CABA sur"),
            ("poblacion_censo_2022", I32, "Personas según el Censo 2022"),
            ("hogares_censo_2022", I32, "Hogares según el Censo 2022"),
            ("pobreza_personas_pct", F, "Porcentaje estimado de personas pobres"),
            ("pobreza_personas_li", F, "Límite inferior del intervalo al 90% de pobreza_personas_pct, en %"),
            ("pobreza_personas_ls", F, "Límite superior del intervalo al 90% de pobreza_personas_pct, en %"),
            ("pobreza_personas_cv", F, "Coeficiente de variación bootstrap de pobreza_personas_pct, en %"),
            ("pobreza_hogares_pct", F, "Porcentaje estimado de hogares pobres"),
            ("pobreza_hogares_li", F, "Límite inferior del intervalo al 90% de pobreza_hogares_pct, en %"),
            ("pobreza_hogares_ls", F, "Límite superior del intervalo al 90% de pobreza_hogares_pct, en %"),
            ("indigencia_personas_pct", F, "Porcentaje estimado de personas indigentes"),
            ("indigencia_personas_li", F, "Límite inferior del intervalo al 90% de indigencia_personas_pct, en %"),
            ("indigencia_personas_ls", F, "Límite superior del intervalo al 90% de indigencia_personas_pct, en %"),
            ("personas_pobres", I32, "Cantidad estimada de personas pobres, sobre la población censal"),
            ("personas_indigentes", I32, "Cantidad estimada de personas indigentes, sobre la población censal"),
            ("nbi_hogares_pct", F, "Porcentaje de hogares con necesidades básicas insatisfechas (Censo 2022)"),
            ("privacion_convergente_pct", F, "Porcentaje de hogares con privación convergente según el IPMH (Censo 2022)"),
            ("sin_cobertura_salud_pct", F, "Porcentaje de personas sin cobertura de salud por obra social, prepaga o plan estatal (Censo 2022)"),
            ("hacinamiento_pct", F, "Porcentaje de hogares con 2 o más personas por cuarto (Censo 2022)"),
            ("cloaca_pct", F, "Porcentaje de hogares con desagüe a red cloacal (Censo 2022)"),
            ("inquilinos_pct", F, "Porcentaje de hogares inquilinos (Censo 2022)"),
        ],
    },
    "gba_fracciones": {
        "titulo": "Fracciones censales del GBA y CABA",
        "descripcion": (
            "El mismo modelo de la tabla gba_partidos_comunas aplicado a cada fracción censal "
            "(unidades de unos 3 mil a 20 mil habitantes). Capa exploratoria, sin intervalos de "
            "confianza. Período de referencia: primer semestre de 2026. Población de referencia: la del Censo 2022."
        ),
        "columnas": [
            ("periodo", S, "Semestre de referencia de la estimación (1S 2026)"),
            ("fraccion", S, "Código de la fracción censal (7 dígitos: provincia, departamento y fracción)"),
            ("unidad", S, "Partido del GBA o comuna de CABA que la contiene"),
            ("jurisdiccion", S, "CABA o GBA"),
            ("zona", S, "Zona de la unidad que la contiene"),
            ("poblacion_censo_2022", I32, "Personas según el Censo 2022"),
            ("pobreza_personas_pct", F, "Porcentaje estimado de personas pobres"),
            ("indigencia_personas_pct", F, "Porcentaje estimado de personas indigentes"),
            ("sin_cobertura_salud_pct", F, "Porcentaje de personas sin cobertura de salud (Censo 2022)"),
            ("nbi_hogares_pct", F, "Porcentaje de hogares con necesidades básicas insatisfechas (Censo 2022)"),
        ],
    },
}


# ---------------------------------------------------------------------------
# Construcción de las tablas
# ---------------------------------------------------------------------------
def construir(d: dict) -> dict[str, pd.DataFrame]:
    pais, gba = d["pais"], d["gba"]
    periodos = [periodo_legible(p) for p in pais["periodos"]]
    n = len(periodos)

    # serie_nacional
    filas = []
    for clave, valores in pais["serie_nacional"].items():
        indicador, unidad = clave.split("_")
        assert len(valores) == n, clave
        for (per, anio, sem), v in zip(periodos, valores):
            filas.append((per, anio, sem, indicador, unidad, v))
    serie_nacional = pd.DataFrame(filas, columns=["periodo", "anio", "semestre", "indicador", "unidad", "valor_pct"])

    # pobreza_edad
    filas = []
    for origen, serie_grupos in (("edad", "general"), ("edad_ninos", "ninez")):
        for grupo, dic in pais[origen].items():
            for clave, indicador in (("pobres", "pobreza"), ("indigentes", "indigencia")):
                for (per, anio, sem), v in zip(periodos, dic[clave]):
                    filas.append((per, anio, sem, grupo, serie_grupos, indicador, v))
    pobreza_edad = pd.DataFrame(
        filas, columns=["periodo", "anio", "semestre", "grupo_edad", "serie_grupos", "indicador", "valor_pct"]
    )

    # aglomerados (último semestre)
    mapa_ic = {"pobreza_personas": "pp", "pobreza_hogares": "ph", "indigencia_personas": "ip", "indigencia_hogares": "ih"}
    mapa_src = {"pobreza_personas": "pob_per", "pobreza_hogares": "pob_hog", "indigencia_personas": "ind_per", "indigencia_hogares": "ind_hog"}
    filas = []
    for t in pais["territorial"]:
        fila = {
            "periodo": PERIODO_ULTIMO,
            "nombre": t["nombre"],
            "tipo": t["tipo"],
            "region": t["region"],
        }
        for ind, src in mapa_src.items():
            ic = t.get("ic", {}).get(mapa_ic[ind]) or {}
            fila[f"{ind}_pct"] = t.get(src)
            fila[f"{ind}_cv"] = t.get(f"{src}_cv")
            fila[f"{ind}_li"] = ic.get("li")
            fila[f"{ind}_ls"] = ic.get("ls")
            fila[f"{ind}_miles"] = t.get(f"{src}_miles")
        fila["total_personas_miles"] = t.get("tot_per_miles")
        fila["total_hogares_miles"] = t.get("tot_hog_miles")
        filas.append(fila)
    aglomerados = pd.DataFrame(filas)
    info = {t["nombre"]: (t["tipo"], t["region"]) for t in pais["territorial"]}

    # aglomerados_serie
    filas = []
    for clave_serie, indicador in (("series_pobreza_terr", "pobreza"), ("series_indigencia_terr", "indigencia")):
        for nombre, dic in pais[clave_serie].items():
            tipo, region = info.get(nombre, (None, None))
            for unidad in ("personas", "hogares"):
                valores = dic.get(unidad) or [None] * n
                for (per, anio, sem), v in zip(periodos, valores):
                    filas.append((nombre, tipo, region, per, anio, sem, indicador, unidad, v))
    aglomerados_serie = pd.DataFrame(
        filas,
        columns=["aglomerado", "tipo", "region", "periodo", "anio", "semestre", "indicador", "unidad", "valor_pct"],
    )

    # gba_partidos_comunas
    ren = {
        "gl": "unidad", "per": "poblacion_censo_2022", "hog": "hogares_censo_2022",
        "pob_per": "pobreza_personas_pct", "pob_per_li": "pobreza_personas_li", "pob_per_ls": "pobreza_personas_ls",
        "pob_per_cv": "pobreza_personas_cv",
        "pob_hog": "pobreza_hogares_pct", "pob_hog_li": "pobreza_hogares_li", "pob_hog_ls": "pobreza_hogares_ls",
        "ind_per": "indigencia_personas_pct", "ind_per_li": "indigencia_personas_li", "ind_per_ls": "indigencia_personas_ls",
        "personas_pobres": "personas_pobres", "personas_indigentes": "personas_indigentes",
        "nbi": "nbi_hogares_pct", "ipmh_conv": "privacion_convergente_pct", "sh_nocob": "sin_cobertura_salud_pct",
        "hacin2": "hacinamiento_pct", "cloaca": "cloaca_pct", "inquilino": "inquilinos_pct", "zona": "zona",
    }
    filas = []
    for u in gba["units"]:
        fila = {nuevo: u.get(viejo) for viejo, nuevo in ren.items()}
        fila["jurisdiccion"] = "CABA" if u.get("caba") else "GBA"
        fila["periodo"] = PERIODO_ULTIMO
        filas.append(fila)
    gba_uc = pd.DataFrame(filas)
    zona_de = dict(zip(gba_uc["unidad"], gba_uc["zona"]))
    juris_de = dict(zip(gba_uc["unidad"], gba_uc["jurisdiccion"]))

    # gba_fracciones
    filas = []
    for f in gba["frac"]:
        filas.append({
            "periodo": PERIODO_ULTIMO,
            "fraccion": str(f["f"]),
            "unidad": f["gl"],
            "jurisdiccion": juris_de.get(f["gl"]),
            "zona": zona_de.get(f["gl"]),
            "poblacion_censo_2022": f["n"],
            "pobreza_personas_pct": f["p"],
            "indigencia_personas_pct": f["i"],
            "sin_cobertura_salud_pct": f["nc"],
            "nbi_hogares_pct": f["nbi"],
        })
    gba_fracciones = pd.DataFrame(filas)

    return {
        "serie_nacional": serie_nacional,
        "pobreza_edad": pobreza_edad,
        "aglomerados": aglomerados,
        "aglomerados_serie": aglomerados_serie,
        "gba_partidos_comunas": gba_uc,
        "gba_fracciones": gba_fracciones,
    }


def a_arrow(nombre: str, df: pd.DataFrame) -> pa.Table:
    cols = TABLAS[nombre]["columnas"]
    faltan = set(df.columns) - {c for c, _, _ in cols}
    if faltan:
        raise ValueError(f"{nombre}: columnas sin describir {faltan}")
    esquema = pa.schema([pa.field(c, t, nullable=True) for c, t, _ in cols])
    df = df[[c for c, _, _ in cols]]
    return pa.Table.from_pandas(df, schema=esquema, preserve_index=False)


def escribir_json(nombre: str, tabla: pa.Table) -> None:
    """La misma tabla en JSON compacto, {"columns": [...], "data": [[...], ...]}, con los valores que guarda el Parquet
    (los vacíos van como null). La consulta guiada de la página la lee así y no necesita DuckDB, que pesa unos 8 MB y
    se baja recién al abrir el editor de SQL libre (13 de octubre de 2026)."""
    columnas = tabla.column_names
    filas = list(zip(*(tabla.column(c).to_pylist() for c in columnas)))
    texto = json.dumps({"columns": columnas, "data": filas}, ensure_ascii=False, separators=(",", ":"), allow_nan=False)
    (SALIDA / f"{nombre}.json").write_text(texto, encoding="utf-8")


def escribir_diccionario(conteos: dict[str, int]) -> None:
    lineas = [
        "---",
        "title: Diccionario de datos",
        "toc: true",
        "---",
        "",
        "# Diccionario de datos",
        "",
        "Las seis tablas del consultor de pobreza, columna por columna. Todas están en formato Parquet, comprimidas "
        "con zstd, y se pueden leer con DuckDB, R, Python, QGIS o Excel con un complemento. Los porcentajes van de "
        "0 a 100. <!-- Lo genera scripts/exportar_parquet.py: si se edita a mano, el próximo export lo pisa. -->",
        "",
        "Cómo leer la precisión: el INDEC recomienda leer con cuidado los valores con un coeficiente de variación de "
        "entre 16% y 25% y considera no confiables los que superan 25%.",
        "",
        "[Volver al consultor de pobreza](./)",
        "",
    ]
    for nombre, meta in TABLAS.items():
        lineas += [
            f"## {nombre}",
            "",
            f"**{meta['titulo']}.** {meta['descripcion']}",
            "",
            f"Archivo: `data/{nombre}.parquet` ({conteos[nombre]} filas).",
            "",
            "| Columna | Tipo | Qué contiene |",
            "|---|---|---|",
        ]
        for c, t, desc in meta["columnas"]:
            tipo = {"string": "texto", "int8": "entero", "int16": "entero", "int32": "entero", "double": "decimal"}[str(t)]
            lineas.append(f"| `{c}` | {tipo} | {desc} |")
        lineas.append("")
    DICCIONARIO.write_text("\n".join(lineas), encoding="utf-8")


def main() -> int:
    # El JSON está en UTF-8. Se lee explícitamente así para que nombres como
    # "Ciudad Autónoma de Buenos Aires" o "Tucumán" no dependan de la consola de Windows.
    datos = json.loads(CRUDO.read_bytes().decode("utf-8-sig"))
    tablas = construir(datos)
    SALIDA.mkdir(parents=True, exist_ok=True)
    conteos = {}
    for nombre, df in tablas.items():
        tabla = a_arrow(nombre, df)
        pq.write_table(tabla, SALIDA / f"{nombre}.parquet", compression="zstd")
        escribir_json(nombre, tabla)
        conteos[nombre] = tabla.num_rows
        print(f"{nombre}.parquet: {tabla.num_rows} filas, {tabla.num_columns} columnas")
    escribir_diccionario(conteos)
    print(f"Diccionario escrito en {DICCIONARIO.relative_to(RAIZ)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
