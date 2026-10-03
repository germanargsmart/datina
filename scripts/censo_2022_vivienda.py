"""
Censo 2022: vivienda, combustible para cocinar y rama de actividad, por departamento (etapa 18, octubre de 2026).
El INDEC publica un archivo por provincia con resultados por radio censal (cada radio tiene, para cada variable, cuántos
hogares, personas o viviendas hay en cada categoría). Como el censo no cambia, este script se corre una sola vez: baja los
24 archivos a memoria, suma por departamento las categorías que usa el sitio y guarda solo el resultado en
datos/manual/censo2022_departamentos.csv (una fila por departamento, con cantidades: los porcentajes los calcula 02_procesar.py).
Variables y categorías según el diccionario de la base (diccionario-variables.csv y diccionario-categorias.csv del paquete
censo-nacional-de-poblacion-hogares-y-viviendas-2022 de datos.gob.ar) y las definiciones de la base REDATAM del INDEC.
Uso: python scripts/censo_2022_vivienda.py
"""
import io, json, pathlib, urllib.request, zipfile
import pandas as pd

RAIZ = pathlib.Path(__file__).resolve().parents[1]
SALIDA = RAIZ / "datos" / "manual" / "censo2022_departamentos.csv"
UA = {"User-Agent": "Mozilla/5.0 (argentina-en-datos)"}
PAQUETE = "https://datos.gob.ar/api/3/action/package_show?id=censo-nacional-de-poblacion-hogares-y-viviendas-2022"

# (variable, categoría) -> columna de salida. Las categorías que no figuran no se guardan.
COLUMNAS = {
    # combustible usado principalmente para cocinar (hogares)
    ("HOGAR_H19", "1"): "cocina_electricidad", ("HOGAR_H19", "2"): "cocina_gas_red", ("HOGAR_H19", "3"): "cocina_zeppelin",
    ("HOGAR_H19", "4"): "cocina_garrafa", ("HOGAR_H19", "5"): "cocina_lena", ("HOGAR_H19", "6"): "cocina_otro",
    # propiedad de la vivienda (hogares)
    ("HOGAR_H22", "1"): "propia", ("HOGAR_H22", "2"): "alquilada", ("HOGAR_H22", "3"): "cedida_trabajo",
    ("HOGAR_H22", "4"): "prestada", ("HOGAR_H22", "5"): "otra_tenencia",
    # hacinamiento: personas por cuarto (hogares). Más de 3 es el hacinamiento crítico de las NBI
    ("HOGAR_H20CP", "5"): "hac_2_a_3", ("HOGAR_H20CP", "6"): "hac_mas_3",
    # calidad de los materiales de pisos y techos (hogares)
    ("HOGAR_INMAT", "1"): "materiales_1", ("HOGAR_INMAT", "2"): "materiales_2", ("HOGAR_INMAT", "3"): "materiales_3",
    ("HOGAR_INMAT", "4"): "materiales_4", ("HOGAR_INMAT", "9"): "materiales_ignorado",
    # condición de ocupación de las viviendas particulares y motivo cuando no había personas presentes
    ("VIVIENDA_V02", "1"): "con_personas", ("VIVIENDA_V02", "2"): "sin_personas",
    ("VIVIENDA_V04", "1"): "uso_temporal", ("VIVIENDA_V04", "2"): "oficina_comercio", ("VIVIENDA_V04", "3"): "alquiler_venta",
    ("VIVIENDA_V04", "4"): "en_construccion", ("VIVIENDA_V04", "5"): "residentes_ausentes", ("VIVIENDA_V04", "6"): "otra_situacion",
    # tipo de vivienda
    ("VIVIENDA_V01", "1"): "casa", ("VIVIENDA_V01", "2"): "rancho", ("VIVIENDA_V01", "3"): "casilla", ("VIVIENDA_V01", "4"): "departamento",
    # rama de actividad de las personas ocupadas: construcción (F), minas y canteras, que incluye petróleo y gas (B),
    # y electricidad y gas (D). V (sin respuesta) y Z (información insuficiente) se guardan para sacarlas del total
    ("PERSONA_LETRA", "6"): "ocupados_construccion", ("PERSONA_LETRA", "2"): "ocupados_minas",
    ("PERSONA_LETRA", "4"): "ocupados_electricidad_gas", ("PERSONA_LETRA", "22"): "ocupados_sin_respuesta",
    ("PERSONA_LETRA", "23"): "ocupados_sin_codificar",
}
# totales de cada variable (la suma de todas sus categorías)
TOTALES = {"HOGAR_H19": "hogares", "VIVIENDA_V02": "viviendas", "PERSONA_LETRA": "ocupados"}


def leer(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=900) as r:
        return r.read()


recursos = json.loads(leer(PAQUETE))["result"]["resources"]
zips = sorted({x["url"] for x in recursos if x["url"].endswith("-2022.zip")})
assert len(zips) == 24, f"se esperaban 24 archivos provinciales y hay {len(zips)}"
variables = {v for v, _ in COLUMNAS} | set(TOTALES)
partes = []
for url in zips:
    z = zipfile.ZipFile(io.BytesIO(leer(url)))
    for nombre in z.namelist():
        if not nombre.endswith(".csv"):
            continue
        for p in pd.read_csv(z.open(nombre), encoding="utf-8-sig", dtype=str, chunksize=500_000,
                             usecols=["cod_prov", "cod_dep", "cod_variable", "cod_categoria", "cantidad"]):
            p = p[p.cod_variable.isin(variables)].copy()
            p["cantidad"] = pd.to_numeric(p.cantidad, errors="coerce")
            partes.append(p.groupby(["cod_prov", "cod_dep", "cod_variable", "cod_categoria"], as_index=False).cantidad.sum())
    print("listo", url.rsplit("/", 1)[1])

d = pd.concat(partes).groupby(["cod_prov", "cod_dep", "cod_variable", "cod_categoria"], as_index=False).cantidad.sum()
d["codigo_dep"] = d.cod_prov.str.zfill(2) + d.cod_dep.str.zfill(3)
salida = pd.DataFrame({"codigo_dep": sorted(d.codigo_dep.unique())})
salida["codigo_indec"] = salida.codigo_dep.str[:2]
for var, col in TOTALES.items():
    salida[col] = salida.codigo_dep.map(d[d.cod_variable == var].groupby("codigo_dep").cantidad.sum())
for (var, cat), col in COLUMNAS.items():
    salida[col] = salida.codigo_dep.map(d[(d.cod_variable == var) & (d.cod_categoria == cat)].groupby("codigo_dep").cantidad.sum())
for c in salida.columns[2:]:
    salida[c] = salida[c].fillna(0).astype(int)
# controles: las categorías suman el total de su variable y cada departamento tiene hogares y viviendas
assert len(salida) == 527, len(salida)
assert (salida[[c for (v, _), c in COLUMNAS.items() if v == "HOGAR_H19"]].sum(axis=1) == salida.hogares).all()
assert (salida.con_personas + salida.sin_personas == salida.viviendas).all()
assert (salida.hogares > 0).all() and (salida.viviendas > 0).all()
SALIDA.parent.mkdir(parents=True, exist_ok=True)
salida.to_csv(SALIDA, index=False)
print(f"{len(salida)} departamentos, {salida.hogares.sum():,} hogares, {salida.viviendas.sum():,} viviendas particulares")
