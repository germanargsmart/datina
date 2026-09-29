"""
Censo 2022: indicadores de los hogares y las personas por provincia.
El INDEC publica un archivo por provincia con resultados por radio censal (unos 800 MB en total).
Como el censo no cambia, este script se corre una sola vez: baja cada archivo a una carpeta temporal,
suma por provincia y guarda solo el resultado en datos/manual/censo2022_provincias.csv.
Uso: python scripts/censo_2022.py
"""
import json, pathlib, tempfile, urllib.request, zipfile
import pandas as pd

RAIZ = pathlib.Path(__file__).resolve().parents[1]
SALIDA = RAIZ / "datos" / "manual" / "censo2022_provincias.csv"
UA = {"User-Agent": "Mozilla/5.0 (argentina-en-datos)"}
PAQUETE = "https://datos.gob.ar/api/3/action/package_show?id=censo-nacional-de-poblacion-hogares-y-viviendas-2022"

# variable: (categorias que cuentan como "si", nombre de la columna de salida)
VARIABLES = {
    "HOGAR_H14": ({"1"}, "agua_red"),            # agua de red publica
    "HOGAR_H15_17_18": ({"1"}, "cloaca"),        # inodoro con descarga a red cloacal
    "HOGAR_H24A": ({"1"}, "internet"),           # internet en la vivienda
    "HOGAR_H24C": ({"1"}, "computadora"),        # computadora, notebook o tableta
    "HOGAR_NBI_TOT": ({"1"}, "nbi"),             # al menos una necesidad basica insatisfecha
    "PERSONA_P19": ({"3"}, "sin_cobertura"),     # sin obra social, prepaga ni plan estatal
}


def leer(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=600) as r:
        return r.read()


recursos = json.loads(leer(PAQUETE))["result"]["resources"]
zips = sorted({x["url"] for x in recursos if x["url"].endswith("-2022.zip")})
assert len(zips) == 24, f"se esperaban 24 archivos provinciales y hay {len(zips)}"

filas = []
with tempfile.TemporaryDirectory() as tmp:
    for url in zips:
        destino = pathlib.Path(tmp) / url.rsplit("/", 1)[1]
        destino.write_bytes(leer(url))
        with zipfile.ZipFile(destino) as z:
            for nombre in z.namelist():
                if not nombre.endswith(".csv") or "vivienda" in nombre:
                    continue
                for parte in pd.read_csv(z.open(nombre), encoding="utf-8-sig", dtype=str, chunksize=500_000,
                                         usecols=["cod_prov", "cod_variable", "cod_categoria", "cantidad"]):
                    parte = parte[parte.cod_variable.isin(VARIABLES)]
                    parte["cantidad"] = pd.to_numeric(parte.cantidad, errors="coerce")
                    filas.append(parte.groupby(["cod_prov", "cod_variable", "cod_categoria"], as_index=False).cantidad.sum())
        destino.unlink()
        print("listo", url.rsplit("/", 1)[1])

d = pd.concat(filas).groupby(["cod_prov", "cod_variable", "cod_categoria"], as_index=False).cantidad.sum()
d["codigo_indec"] = d.cod_prov.str.zfill(2)
salida = pd.DataFrame({"codigo_indec": sorted(d.codigo_indec.unique())})
for var, (si, col) in VARIABLES.items():
    v = d[d.cod_variable == var]
    total = v.groupby("codigo_indec").cantidad.sum()
    positivo = v[v.cod_categoria.isin(si)].groupby("codigo_indec").cantidad.sum()
    salida[col] = salida.codigo_indec.map(positivo / total * 100).round(2)
    salida[f"{col}_base"] = salida.codigo_indec.map(total).astype("Int64")
assert len(salida) == 24
SALIDA.parent.mkdir(parents=True, exist_ok=True)
salida.to_csv(SALIDA, index=False)
print(salida.to_string())
