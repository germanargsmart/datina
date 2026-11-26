"""
Censo 2022: ocupación de mujeres y varones por edad y departamento (25 de noviembre de 2026, artículo "¿Dónde tienen más empleo las mujeres?",
pedido del autor: la versión argentina de un mapa de Guadalajara).

El INDEC publica un cuadro por jurisdicción (el 2.1 a 2.24 de los resultados definitivos de características económicas) con una hoja del total
y una por departamento, partido o comuna: la población de 14 años o más en viviendas particulares por sexo registrado al nacer, edad en grupos
de cinco años y condición de actividad. Son 24 archivos, 2,7 MB en total. Como el censo no cambia, se corre una sola vez y guarda cantidades en
datos/manual/censo2022_actividad.csv (los porcentajes los calcula 02_procesar.py): una fila por lugar, sexo y grupo de edad, con codigo_dep
vacío en las filas de cada jurisdicción. Las hojas no traen el código del departamento: se unen por el nombre, como en
censo_2022_migraciones.py.

Controles: en las 551 hojas, mujeres más varones dan el total y los grupos de edad dan el total de cada sexo, ocupada más desocupada da la
población activa y con la no activa da la población, y los departamentos suman su jurisdicción. Los ocupados de cada uno de los 527
departamentos son los mismos que los de la base por radio censal (datos/manual/censo2022_departamentos.csv, otro archivo del INDEC).

Uso: python scripts/censo_2022_actividad.py [--cache CARPETA]   (con --cache lee los archivos de la carpeta y baja solo los que falten)
"""
import argparse, pathlib, re, time, unicodedata, urllib.request
import openpyxl
import pandas as pd

RAIZ = pathlib.Path(__file__).resolve().parents[1]
SALIDA = RAIZ / "datos" / "manual" / "censo2022_actividad.csv"
UA = {"User-Agent": "Mozilla/5.0 (argentina-en-datos)"}
BASE = "https://www.indec.gob.ar/ftp/cuadros/poblacion/"
# el nombre y el número del cuadro de cada jurisdicción -> su código del INDEC
CUADROS = {"caba": (1, "02"), "bsas": (2, "06"), "catamarca": (3, "10"), "chaco": (4, "22"), "chubut": (5, "26"), "cordoba": (6, "14"),
           "corrientes": (7, "18"), "entrerios": (8, "30"), "formosa": (9, "34"), "jujuy": (10, "38"), "lapampa": (11, "42"),
           "larioja": (12, "46"), "mendoza": (13, "50"), "misiones": (14, "54"), "neuquen": (15, "58"), "rionegro": (16, "62"),
           "salta": (17, "66"), "sanjuan": (18, "70"), "sanluis": (19, "74"), "santacruz": (20, "78"), "santafe": (21, "82"),
           "santiago": (22, "86"), "tdf": (23, "94"), "tucuman": (24, "90")}
SEXOS = {"Total": "total", "Mujer/Femenino": "mujeres", "Varón/Masculino": "varones"}
COLS = ["poblacion", "activa", "ocupada", "desocupada", "no_activa"]


def limpio(v):
    return re.sub(r"\s+", " ", str(v).replace("\xa0", " ")).strip() if v is not None else ""


def norm(s):
    s = limpio(s).replace("°", "o").replace("º", "o")
    return re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower())


def numero(v):
    """Los cuadros escriben "-" para el cero absoluto."""
    return 0 if limpio(v) == "-" else int(v)


def archivo(nombre, cache):
    ruta = cache / nombre
    if not ruta.exists():
        with urllib.request.urlopen(urllib.request.Request(BASE + nombre, headers=UA), timeout=300) as r:
            b = r.read()
        assert b[:2] == b"PK", f"{nombre} no es una planilla"
        ruta.write_bytes(b)
        time.sleep(2)  # de a uno y con pausa: el INDEC corta las conexiones seguidas
    return ruta


def hoja(ws):
    """Las filas de una hoja: (sexo, edad, población, activa, ocupada, desocupada, no activa). "total" en edad es el total del sexo."""
    sexo, sale = None, []
    for fila in ws.iter_rows(values_only=True):
        v = [c for c in fila if c is not None and c != ""]
        if len(v) < 6:
            continue
        etq = limpio(v[0])
        if etq in SEXOS:
            sexo, edad = SEXOS[etq], "total"
        elif re.fullmatch(r"14|\d\d-\d\d|80 y más", etq):
            edad = etq
        else:
            continue
        sale.append((sexo, edad, *[numero(x) for x in v[1:6]]))
    return sale


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache", type=pathlib.Path)
    a = ap.parse_args()
    import tempfile
    with tempfile.TemporaryDirectory() as tmp:
        cache = a.cache or pathlib.Path(tmp)
        cache.mkdir(parents=True, exist_ok=True)
        mig = pd.read_csv(RAIZ / "datos" / "manual" / "censo2022_migraciones_departamentos.csv", dtype={"codigo_dep": str, "codigo_indec": str})
        codigos = {(p, norm(d)): c for p, d, c in zip(mig.codigo_indec, mig.departamento, mig.codigo_dep)}
        filas = []
        for nombre, (n, prov) in CUADROS.items():
            wb = openpyxl.load_workbook(archivo(f"c2022_{nombre}_actividad_economica_c2_{n}.xlsx", cache), data_only=True)
            for ws in [w for w in wb.worksheets if limpio(w.title).startswith("Cuadro")]:
                titulo = limpio(ws["A2"].value)
                assert titulo.startswith(f"Cuadro 2.{n}.") and "según sexo registrado al nacer y grupos quinquenales de edad" in titulo, titulo
                lugar = titulo.split("Población de 14")[0].strip().rstrip(".")
                m = re.search(r"(departamento|partido|comuna) (.*)$", lugar, re.I)
                dep = codigos[(prov, norm(("Comuna " if m[1].lower() == "comuna" else "") + m[2]))] if m else ""
                f = hoja(ws)
                assert len(f) == 48, (titulo, len(f))
                filas += [(prov, dep, *x) for x in f]
            print("listo", nombre, flush=True)

    d = pd.DataFrame(filas, columns=["codigo_indec", "codigo_dep", "sexo", "edad", *COLS])
    # controles
    assert not d.duplicated(["codigo_indec", "codigo_dep", "sexo", "edad"]).any()
    assert (d.poblacion == d.activa + d.no_activa).all() and (d.activa == d.ocupada + d.desocupada).all()
    for c in COLS:
        t = d.pivot(index=["codigo_indec", "codigo_dep"], columns=["sexo", "edad"], values=c)
        assert (t["total"]["total"] == t["mujeres"]["total"] + t["varones"]["total"]).all(), c
        for s in SEXOS.values():
            assert (t[s].drop(columns="total").sum(axis=1) == t[s]["total"]).all(), (c, s)
        dep = d[d.codigo_dep != ""].groupby(["codigo_indec", "sexo", "edad"])[c].sum()
        prov = d[d.codigo_dep == ""].set_index(["codigo_indec", "sexo", "edad"])[c].sort_index()
        assert (dep.sort_index() == prov).all(), c
    total = d[(d.sexo == "total") & (d.edad == "total")]
    assert (total.codigo_dep == "").sum() == 24 and set(total.codigo_dep) - {""} == set(mig.codigo_dep)
    radio = pd.read_csv(RAIZ / "datos" / "manual" / "censo2022_departamentos.csv", dtype={"codigo_dep": str}).set_index("codigo_dep").ocupados
    propio = total[total.codigo_dep != ""].set_index("codigo_dep").ocupada
    assert (propio.sort_index() == radio.sort_index()).all(), "los ocupados no son los de la base por radio censal"

    salida = d[(d.sexo != "total") & (d.edad != "total")][["codigo_indec", "codigo_dep", "sexo", "edad", "poblacion", "ocupada", "desocupada"]]
    salida = salida.sort_values(["codigo_indec", "codigo_dep", "sexo", "edad"])
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    salida.to_csv(SALIDA, index=False, lineterminator="\n")
    print(f"{len(salida):,} filas, {int(salida[salida.codigo_dep == ''].poblacion.sum()):,} personas de 14 años o más en viviendas particulares")


if __name__ == "__main__":
    main()
