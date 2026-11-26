"""
Mudanzas entre provincias y cambio de población por departamento (pedido del autor del 25 de noviembre de 2026, docs/roadmap/MUDANZAS.md).
Tres cuadros del Censo 2022 del INDEC, en censo.gob.ar (descarga aprobada por el autor ese día):
- El cuadro 15 de migraciones del total del país: las personas de 5 años y más en viviendas particulares, por la jurisdicción donde viven y la
  jurisdicción donde vivían cinco años antes. Es una tabla de 24 por 24, con dos filas más: "En otro país" y "Provincia ignorada" (vivían en otra
  provincia y no dijeron cuál: el cuadro 4 de cada provincia lo confirma, su "otra provincia" es la suma de las otras 23 y de la ignorada).
- El cuadro 4 de migraciones de cada provincia: lo mismo por departamento, sin decir de qué provincia.
- El cuadro 1 de estructura de cada provincia: la población de 2010 y de 2022 por departamento. Dos departamentos se crearon entre los dos censos:
  Lezama (en 2010, parte de Chascomús) y Tolhuin (parte de Río Grande). Se guardan sueltos y quien los usa los suma, como hace el INDEC.
Como el censo no cambia, se corre una sola vez y guarda en datos/manual/censo2022_mudanzas_matriz.csv y censo2022_mudanzas_departamentos.csv, siempre
cantidades. El script frena si la tabla no suma por fila o por columna, si un cuadro provincial no coincide con ella o si un departamento queda sin datos.
Uso: python scripts/censo_2022_mudanzas.py [--cache CARPETA]
"""
import argparse
import io
import pathlib
import re
import unicodedata
import urllib.request

import openpyxl
import pandas as pd

RAIZ = pathlib.Path(__file__).resolve().parents[1]
MANUAL = RAIZ / "datos" / "manual"
UA = {"User-Agent": "Mozilla/5.0 (argentina-en-datos)"}
MATRIZ = "https://censo.gob.ar/wp-content/uploads/2024/04/c2022_tp_migraciones_c15.xlsx"
# la página de cada provincia en censo.gob.ar
PAGINAS = {"06": "bsas", "02": "caba", "10": "catamarca", "22": "chaco", "26": "chubut", "14": "cordoba", "18": "corrientes", "30": "entre_rios",
           "34": "formosa", "38": "jujuy", "42": "lapampa", "46": "larioja", "50": "mendoza", "54": "misiones", "58": "neuquen", "62": "rionegro",
           "66": "salta", "70": "sanjuan", "74": "sanluis", "78": "santa_cruz", "82": "santafe", "86": "santiago_del_estero", "94": "tdf", "90": "tucuman"}
POBLACION = {"2010": 40117096, "2022": 45892285}  # el total del país de cada censo, para el control
NUEVOS = {"06466": "06218", "94011": "94008"}  # departamento creado entre los censos -> el de 2010 que lo contenía
ANTARTIDA = "94028"  # Antártida Argentina e Islas del Atlántico Sur: se censaron solo las bases, no está en el mapa ni en los otros cuadros

arg = argparse.ArgumentParser()
arg.add_argument("--cache", type=pathlib.Path, help="carpeta con los cuadros ya bajados (provincia_cuadro.xlsx)")
CACHE = arg.parse_args().cache


def limpio(v):
    return re.sub(r"\s+", " ", str(v).replace("\xa0", " ")).strip() if v is not None else ""


def norm(s):
    s = limpio(s).replace("°", "o").replace("º", "o")
    return re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower())


def norm_prov(s):
    """El nombre de la jurisdicción sin las llamadas a nota, como la "(¹)" de Tierra del Fuego."""
    return norm(re.sub(r"\(.*?\)|[¹²³*]", "", limpio(s)))


def numero(v):
    """Los cuadros escriben "-" para el cero absoluto. Cualquier otra cosa que no sea un entero frena."""
    s = limpio(v)
    if s == "-":
        return 0
    assert re.fullmatch(r"\d+(\.0)?", s), f"no es una cantidad: {v!r}"
    return int(float(s))


def leer(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=300) as r:
        return r.read()


def libro(nombre, url):
    f = CACHE / nombre if CACHE else None
    b = f.read_bytes() if f and f.exists() else leer(url() if callable(url) else url)
    assert b[:2] == b"PK", f"{nombre} no es una planilla"
    return openpyxl.load_workbook(io.BytesIO(b), data_only=True)


# ---- la matriz
filas = [list(r) for r in libro("tp_migraciones_c15.xlsx", MATRIZ).worksheets[0].iter_rows(values_only=True)]
assert "lugar de residencia 5 años antes" in limpio(filas[1][0]), "cambió el cuadro 15"
por_fila = {limpio(r[0]): r for r in filas[5:] if limpio(r[0])}
nombres = {k[:2]: k[3:] for k in por_fila if re.match(r"\d\d ", k)}
assert set(nombres) == set(PAGINAS), sorted(set(nombres) ^ set(PAGINAS))
por_nombre = {norm_prov(n): c for c, n in nombres.items()}
columnas = {por_nombre[norm_prov(h)]: i for i, h in enumerate(filas[4]) if i >= 2 and limpio(h)}
assert len(columnas) == 24
origenes = {**{c: f"{c} {n}" for c, n in nombres.items()}, "ignorada": "Provincia ignorada", "exterior": "En otro país"}
m = {(o, d): numero(por_fila[f][i]) for o, f in origenes.items() for d, i in columnas.items()}
for o, f in origenes.items():
    assert sum(m[o, d] for d in columnas) == numero(por_fila[f][1]), f"la fila {f} no suma"
total = {d: numero(por_fila["Total"][i]) for d, i in columnas.items()}
for d in columnas:
    assert sum(m[o, d] for o in origenes) == total[d], f"la columna {d} no suma"
pd.DataFrame([{"origen": o, "destino": d, "personas": m[o, d]} for o in sorted(origenes) for d in sorted(columnas)]).to_csv(
    MANUAL / "censo2022_mudanzas_matriz.csv", index=False, lineterminator="\n")

# ---- por departamento
deps = []
for cod, pagina in PAGINAS.items():
    enlaces = []

    def enlace(cuadro, enlaces=enlaces, pagina=pagina):
        if not enlaces:
            html = leer(f"https://censo.gob.ar/index.php/datos_definitivos_{pagina}/").decode("utf-8", "ignore")
            enlaces.extend(sorted(set(re.findall(r'href="([^"]+\.xlsx)"', html))))
        u = [x for x in enlaces if re.search(rf"_{cuadro}_\d+[^/]*\.xlsx$", x)]
        assert len(u) == 1, (pagina, cuadro, u)
        return u[0]

    # la población de los dos censos: la primera hoja del cuadro (la de Buenos Aires tiene otra, "bis", con el Gran Buenos Aires)
    ws = [w for w in libro(f"{pagina}_est_c1.xlsx", lambda: enlace("est_c1")).worksheets if norm(w.title).startswith("cuadro")][0]
    prov = []
    for r in ws.iter_rows(values_only=True):
        c = limpio(r[0]).split(".")[0]
        if not re.fullmatch(r"\d{4,5}", c):
            continue
        c = c.zfill(5)
        assert c[:2] == cod, (pagina, c)
        prov.append({"codigo_dep": c, "codigo_indec": cod, "departamento": limpio(r[1]),
                     "poblacion_2010": None if limpio(r[2]) == "///" else numero(r[2]), "poblacion_2022": numero(r[3])})
    # dónde vivían en 2017: una hoja por departamento, después de la provincial, sin código (se unen por el nombre del título)
    hojas = [w for w in libro(f"{pagina}_migraciones_c4.xlsx", lambda: enlace("migraciones_c4")).worksheets if norm(w.title).startswith("cuadro")]

    def residencia(w, pagina=pagina):
        t = [r for r in w.iter_rows(values_only=True) if limpio(r[0]) == "Total"]
        assert t, (pagina, w.title)
        v = [numero(x) for x in t[0][2:7]]
        assert v[0] == sum(v[1:]), (pagina, w.title, v)
        return v

    tot_prov = residencia(hojas[0])
    assert tot_prov[0] == total[cod] and tot_prov[4] == m["exterior", cod], pagina
    assert tot_prov[3] == sum(m[o, cod] for o in nombres if o != cod) + m["ignorada", cod], f"{pagina}: la otra provincia no es la de la matriz"
    res = {}
    for w in hojas[1:]:
        t = limpio(w["A2"].value)
        g = re.search(r"(?:departamento|partido|comuna)\s+(.*?)\.\s*Poblaci", t, re.I)
        assert g, (pagina, t)
        n = norm(g.group(1))
        assert n not in res, (pagina, n)
        res[n] = residencia(w)
    assert [sum(x) for x in zip(*res.values())] == tot_prov, f"{pagina}: los departamentos no suman la provincia"
    for d in prov:
        n = norm(d["departamento"])
        clave = next((k for k in (n, n.removeprefix("comuna"), "comuna" + n, "de" + n, n.removeprefix("de")) if k in res), None)
        if clave is None:
            assert d["codigo_dep"] == ANTARTIDA, (pagina, d["departamento"], sorted(res))
            v = [None] * 5
        else:
            v = res.pop(clave)
        deps.append({**d, **dict(zip(("residencia_total", "misma_localidad", "otra_localidad", "otra_provincia", "otro_pais"), v))})
    assert not res, (pagina, sorted(res))
    print(pagina, len(prov))

t = pd.DataFrame(deps).sort_values("codigo_dep")
assert t.codigo_dep.is_unique and len(t) == 528
assert set(t[t.poblacion_2010.isna()].codigo_dep) == set(NUEVOS)
for a, p in POBLACION.items():
    assert int(t["poblacion_" + a].sum()) == p, (a, t["poblacion_" + a].sum())
for c in t.columns[3:]:
    t[c] = t[c].astype("Int64")
t.to_csv(MANUAL / "censo2022_mudanzas_departamentos.csv", index=False, lineterminator="\n")
print("listo:", len(m), "celdas de la matriz y", len(t), "departamentos")
