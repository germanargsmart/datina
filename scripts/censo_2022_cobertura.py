"""
Censo 2022: la cobertura de salud de las personas por tipo, por provincia y por departamento (14 de noviembre de 2026, fuentes nuevas
aprobadas por el autor: "cobertura de salud por tipo").

La pregunta 19 del censo (PERSONA_P19) tiene tres respuestas: obra social o prepaga (incluye PAMI), programas o planes estatales de salud,
y ninguna de las dos. censo_2022.py guardaba solo la última. El INDEC publica un archivo por provincia con los resultados por radio censal
(unos 800 MB en total, en datos.gob.ar): como el censo no cambia, este programa se corre una sola vez. Baja cada archivo a una carpeta
temporal, suma la pregunta por provincia y por departamento, borra el archivo y guarda solo el resultado en
datos/manual/censo2022_cobertura.csv (una fila por provincia, con codigo_dep vacío, y una por departamento).

Control: la parte sin cobertura de cada provincia tiene que dar lo mismo que sin_cobertura de censo2022_provincias.csv.
Uso: python scripts/censo_2022_cobertura.py
"""
import json, pathlib, tempfile, urllib.request, zipfile
import pandas as pd

RAIZ = pathlib.Path(__file__).resolve().parents[1]
SALIDA = RAIZ / "datos" / "manual" / "censo2022_cobertura.csv"
UA = {"User-Agent": "Mozilla/5.0 (argentina-en-datos)"}
PAQUETE = "https://datos.gob.ar/api/3/action/package_show?id=censo-nacional-de-poblacion-hogares-y-viviendas-2022"
CATEGORIAS = {"1": "obra_social_prepaga", "2": "plan_estatal", "3": "sin_cobertura"}


def leer(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=900) as r:
        return r.read()


recursos = json.loads(leer(PAQUETE))["result"]["resources"]
zips = sorted({x["url"] for x in recursos if x["url"].endswith("-2022.zip")})
assert len(zips) == 24, f"se esperaban 24 archivos provinciales y hay {len(zips)}"

partes = []
with tempfile.TemporaryDirectory() as tmp:
    for url in zips:
        destino = pathlib.Path(tmp) / url.rsplit("/", 1)[1]
        destino.write_bytes(leer(url))
        with zipfile.ZipFile(destino) as z:
            nombre = next(n for n in z.namelist() if n.endswith("-persona.csv"))
            for parte in pd.read_csv(z.open(nombre), encoding="utf-8-sig", dtype=str, chunksize=500_000,
                                     usecols=["cod_prov", "cod_dep", "cod_variable", "cod_categoria", "cantidad"]):
                parte = parte[parte.cod_variable == "PERSONA_P19"].copy()
                parte["cantidad"] = pd.to_numeric(parte.cantidad, errors="raise")
                partes.append(parte.groupby(["cod_prov", "cod_dep", "cod_categoria"], as_index=False).cantidad.sum())
        destino.unlink()
        print("listo", url.rsplit("/", 1)[1], flush=True)

d = pd.concat(partes).groupby(["cod_prov", "cod_dep", "cod_categoria"], as_index=False).cantidad.sum()
assert set(d.cod_categoria) == set(CATEGORIAS), f"categorías inesperadas: {sorted(set(d.cod_categoria))}"
d["codigo_indec"] = d.cod_prov.str.zfill(2)
d["codigo_dep"] = d.codigo_indec + d.cod_dep.str.zfill(3)


def tabla(claves):
    t = d.pivot_table(index=claves, columns="cod_categoria", values="cantidad", aggfunc="sum", fill_value=0).rename(columns=CATEGORIAS)
    t["personas"] = t[list(CATEGORIAS.values())].sum(axis=1)
    for c in CATEGORIAS.values():
        t[f"{c}_pct"] = (t[c] / t.personas * 100).round(2)
    return t.reset_index()


prov = tabla(["codigo_indec"]).assign(codigo_dep="")
dep = tabla(["codigo_indec", "codigo_dep"])
assert len(prov) == 24, "faltan provincias"
salida = pd.concat([prov, dep], ignore_index=True)[["codigo_indec", "codigo_dep", "personas", *CATEGORIAS.values(),
                                                     *[f"{c}_pct" for c in CATEGORIAS.values()]]]
# control contra lo que ya publica el sitio (censo_2022.py, la misma pregunta)
viejo = pd.read_csv(RAIZ / "datos" / "manual" / "censo2022_provincias.csv", dtype={"codigo_indec": str}).set_index("codigo_indec")
dif = (prov.set_index("codigo_indec").sin_cobertura_pct - viejo.sin_cobertura).abs()
assert dif.max() < 0.01, f"la parte sin cobertura no coincide con censo2022_provincias.csv:\n{dif[dif >= 0.01]}"
SALIDA.parent.mkdir(parents=True, exist_ok=True)
salida.to_csv(SALIDA, index=False, lineterminator="\n")
print(prov.to_string())
print(f"{len(dep)} departamentos")
