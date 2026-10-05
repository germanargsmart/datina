"""
Censo 2022: viviendas, hogares y personas de las 24 capitales de provincia, por municipio (etapa 26, octubre de 2026).
El INDEC publica las viviendas y la población de cada gobierno local (municipio o comuna) en un cuadro (c2022_tp_gobierno_local_c1.xlsx, que
baja 01_descargar.py), pero no la tenencia, el hacinamiento ni la ocupación de las viviendas. Este script los suma desde la base por radio
censal (los 24 archivos de datos.gob.ar que usa también scripts/censo_2022_vivienda.py): cada radio trae cuántas viviendas particulares tiene
en cada gobierno local (VIVIENDA_CODGL). Los radios que están enteros dentro del municipio de la capital suman todo, y los pocos que cruzan su
límite suman la parte que le corresponde según sus viviendas (las viviendas salen exactas, y los hogares y las personas de esos radios se
reparten en la misma proporción). La Ciudad de Buenos Aires es la suma de sus 15 comunas.
Como el censo no cambia, se corre una sola vez y guarda solo el resultado en datos/manual/censo2022_capitales.csv (una fila por capital,
con cantidades: los porcentajes los calcula 02_procesar.py, que controla las viviendas contra el cuadro del INDEC).
Uso: python scripts/censo_2022_capitales.py [carpeta con los 24 ZIP ya bajados]
"""
import io, json, pathlib, sys, urllib.request, zipfile
import pandas as pd

RAIZ = pathlib.Path(__file__).resolve().parents[1]
SALIDA = RAIZ / "datos" / "manual" / "censo2022_capitales.csv"
UA = {"User-Agent": "Mozilla/5.0 (argentina-en-datos)"}
PAQUETE = "https://datos.gob.ar/api/3/action/package_show?id=censo-nacional-de-poblacion-hogares-y-viviendas-2022"

# código de provincia -> (código de gobierno local de la capital, nombre de la capital). La Ciudad es la provincia entera (sus comunas)
CAPITALES = {
    "02": (None, "Ciudad de Buenos Aires"), "06": ("060441", "La Plata"), "10": ("100140", "San Fernando del Valle de Catamarca"),
    "14": ("140077", "Córdoba"), "18": ("180021", "Corrientes"), "22": ("220413", "Resistencia"), "26": ("260112", "Rawson"),
    "30": ("300336", "Paraná"), "34": ("340028", "Formosa"), "38": ("380035", "San Salvador de Jujuy"), "42": ("420336", "Santa Rosa"),
    "46": ("460014", "La Rioja"), "50": ("500007", "Mendoza"), "54": ("540119", "Posadas"), "58": ("580056", "Neuquén"),
    "62": ("620014", "Viedma"), "66": ("660063", "Salta"), "70": ("700028", "San Juan"), "74": ("740133", "San Luis"),
    "78": ("780049", "Río Gallegos"), "82": ("820147", "Santa Fe"), "86": ("860056", "Santiago del Estero"),
    "90": ("900014", "San Miguel de Tucumán"), "94": ("940014", "Ushuaia"),
}
# (variable, categoría) -> columna de salida, con las mismas categorías que scripts/censo_2022_vivienda.py
COLUMNAS = {
    ("VIVIENDA_V02", "1"): "con_personas", ("VIVIENDA_V02", "2"): "sin_personas",
    ("VIVIENDA_V04", "1"): "uso_temporal", ("VIVIENDA_V04", "3"): "alquiler_venta", ("VIVIENDA_V04", "4"): "en_construccion",
    ("VIVIENDA_V01", "1"): "casa", ("VIVIENDA_V01", "4"): "departamento",
    ("HOGAR_H22", "1"): "propia", ("HOGAR_H22", "2"): "alquilada", ("HOGAR_H22", "3"): "cedida_trabajo",
    ("HOGAR_H22", "4"): "prestada", ("HOGAR_H22", "5"): "otra_tenencia",
    ("HOGAR_H20CP", "5"): "hac_2_a_3", ("HOGAR_H20CP", "6"): "hac_mas_3",
}
# totales de cada variable (la suma de todas sus categorías): hogares, personas en viviendas particulares y viviendas según su ocupación
TOTALES = {"HOGAR_H19": "hogares", "PERSONA_P02": "personas", "VIVIENDA_V02": "viviendas_v02"}
VARIABLES = {v for v, _ in COLUMNAS} | set(TOTALES)


def leer(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=900) as r:
        return r.read()


def archivos():
    """Los 24 ZIP provinciales: de la carpeta que se pasa como argumento, o bajados de datos.gob.ar."""
    if len(sys.argv) > 1:
        zips = sorted(pathlib.Path(sys.argv[1]).glob("*-2022.zip"))
        assert len(zips) == 24, f"se esperaban 24 archivos provinciales y hay {len(zips)}"
        for z in zips:
            yield z.name, zipfile.ZipFile(z)
        return
    recursos = json.loads(leer(PAQUETE))["result"]["resources"]
    urls = sorted({x["url"] for x in recursos if x["url"].endswith("-2022.zip")})
    assert len(urls) == 24, f"se esperaban 24 archivos provinciales y hay {len(urls)}"
    for url in urls:
        yield url.rsplit("/", 1)[1], zipfile.ZipFile(io.BytesIO(leer(url)))


filas = []
for nombre, z in archivos():
    prov = nombre[:2]
    gl, capital = CAPITALES[prov]
    csvs = {n.rsplit("-", 1)[1]: n for n in z.namelist() if n.endswith(".csv")}
    # parte de cada radio que está en el municipio de la capital, según sus viviendas particulares
    v = pd.read_csv(z.open(csvs["vivienda.csv"]), encoding="utf-8-sig", dtype=str, usecols=["codigo", "cod_variable", "cod_categoria", "cantidad"])
    v["cantidad"] = pd.to_numeric(v.cantidad)
    porgl = v[v.cod_variable == "VIVIENDA_CODGL"].copy()
    porgl["cod_categoria"] = porgl.cod_categoria.str.zfill(6)  # el archivo de Buenos Aires los escribe sin el cero inicial (60441)
    total = porgl.groupby("codigo").cantidad.sum()
    en_cap = total if gl is None else porgl[porgl.cod_categoria == gl].groupby("codigo").cantidad.sum()
    parte = (en_cap / total).dropna()
    parte = parte[parte > 0]
    datos = [v[v.cod_variable.isin(VARIABLES)]]
    for clave in ("hogar.csv", "persona.csv"):
        for p in pd.read_csv(z.open(csvs[clave]), encoding="utf-8-sig", dtype=str, chunksize=1_000_000,
                             usecols=["codigo", "cod_variable", "cod_categoria", "cantidad"]):
            p = p[p.cod_variable.isin(VARIABLES) & p.codigo.isin(parte.index)].copy()
            p["cantidad"] = pd.to_numeric(p.cantidad)
            datos.append(p)
    d = pd.concat(datos)
    d = d[d.codigo.isin(parte.index)]
    d["cantidad"] = d.cantidad * d.codigo.map(parte)
    fila = {"codigo_indec": prov, "cod_gl": gl or "02", "capital": capital, "viviendas": int(en_cap.sum()),
            "radios": len(parte), "radios_compartidos": int((parte < 1).sum()), "viviendas_radios_compartidos": int(en_cap[parte[parte < 1].index].sum())}
    for var, col in TOTALES.items():
        fila[col] = d[d.cod_variable == var].cantidad.sum()
    for (var, cat), col in COLUMNAS.items():
        fila[col] = d[(d.cod_variable == var) & (d.cod_categoria == cat)].cantidad.sum()
    filas.append(fila)
    print("listo", nombre, capital, fila["viviendas"], "viviendas,", fila["radios_compartidos"], "radios compartidos")

salida = pd.DataFrame(filas).sort_values("codigo_indec")
cantidades = [c for c in salida.columns if c not in ("codigo_indec", "cod_gl", "capital")]
for c in cantidades:
    salida[c] = salida[c].round().astype(int)
# controles: 24 capitales, las viviendas según su ocupación suman las del municipio y las tenencias suman los hogares (salvo el redondeo
# de los radios compartidos)
assert len(salida) == 24 and salida.codigo_indec.is_unique
assert (salida.viviendas > 0).all() and (salida.hogares > 0).all() and (salida.personas > 0).all()
assert ((salida.viviendas_v02 - salida.viviendas).abs() <= salida.radios_compartidos).all()
assert ((salida.con_personas + salida.sin_personas - salida.viviendas).abs() <= salida.radios_compartidos + 1).all()
_ten = salida[["propia", "alquilada", "cedida_trabajo", "prestada", "otra_tenencia"]].sum(axis=1)
assert ((_ten - salida.hogares).abs() <= salida.radios_compartidos + 2).all()
salida = salida.drop(columns="viviendas_v02")
SALIDA.parent.mkdir(parents=True, exist_ok=True)
salida.to_csv(SALIDA, index=False)
print(f"{len(salida)} capitales, {salida.viviendas.sum():,} viviendas particulares, {salida.hogares.sum():,} hogares")
