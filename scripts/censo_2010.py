"""
Indicadores del Censo 2010 por provincia, para compararlos con los del Censo 2022 (F12 del plan de mejora, aprobado por el autor el 28 de octubre
de 2026: "cómo cambió tu provincia entre censos"). 31 de octubre de 2026. Se corre una sola vez: el Censo 2010 no cambia.
El dataset del Censo 2010 de datos.gob.ar (57) tiene los archivos rotos y www.indec.gob.ar ya no sirve los cuadros de 2010, pero el sitio anterior
del INDEC (sitioanterior.indec.gob.ar) sí, en XLS:
- computadora en el hogar: cuadro H4 del total del país (hogares con computadora sobre el total de hogares);
- sin cobertura de salud: cuadro P11 del total del país (población en viviendas particulares sin obra social, prepaga ni plan estatal);
- hogares con necesidades básicas insatisfechas: el cuadro de NBI por provincia de 2001 y 2010 (sesd_09a01);
- agua de red y cloaca: el cuadro H2-P de cada provincia (hogares por tipo de desagüe, según provisión y procedencia del agua), que hay que buscar
  en la lista de cuadros de cada una porque su número cambia: agua de red es la procedencia "Red pública" (por cañería dentro de la vivienda,
  fuera de la vivienda dentro del terreno y fuera del terreno) y cloaca, el desagüe "A red pública (cloaca)";
- población de 2010 y de 2022: el cuadro 1 de la estructura de la población del Censo 2022, que el INDEC ya compara.
Los cuadros nacionales traen además las filas de los 24 partidos del Gran Buenos Aires y del interior de la provincia: se toma la de Buenos Aires.
Advertencias para la comparación, en la nota de la ficha: 2010 fue un censo de hecho (las personas donde estaban esa noche) y 2022 de derecho
(donde viven), y en 2022 la pregunta por la computadora incluye notebook y tableta.
Uso: python scripts/censo_2010.py   (unos 30 archivos chicos, menos de un minuto). Escribe datos/manual/censo2010_provincias.csv
"""
import csv
import io
import re
import unicodedata
import urllib.request
from pathlib import Path

import pandas as pd

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "datos" / "manual" / "censo2010_provincias.csv"
VIEJO = "https://sitioanterior.indec.gob.ar"
POBLACION = "https://censo.gob.ar/wp-content/uploads/2023/11/c2022_tp_est_c1.xlsx"
NBI = VIEJO + "/bajarCuadroEstadistico.asp?idc=403C28F11FB04EAB91FEA79E77555FE10053C24E243DF5C2D1E1B5FDE2A12F04911523A408AE9993"


def leer(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=120) as r:
        return r.read()


def norm(t):
    t = unicodedata.normalize("NFKD", str(t)).encode("ascii", "ignore").decode().lower()
    return re.sub(r"\s+", " ", t).strip()


# población 2010 y 2022, y los códigos y nombres de las 24 jurisdicciones
p = pd.read_excel(io.BytesIO(leer(POBLACION)), sheet_name=2, header=None)
filas = [(str(p.iat[i, 0]).strip().zfill(2), str(p.iat[i, 1]).strip(), p.iat[i, 2], p.iat[i, 3]) for i in range(len(p))
         if re.fullmatch(r"\d{1,2}", str(p.iat[i, 0]).strip())]
assert len(filas) == 24, f"el cuadro de población no trae las 24 jurisdicciones ({len(filas)})"
datos = {c: {"codigo_indec": c, "poblacion_2010": int(a), "poblacion_2022": int(b)} for c, _, a, b in filas}
# los nombres de los cuadros de 2010 ("Ciudad Autónoma de Buenos Aires", "Tierra del Fuego, Antártida e Islas del Atlántico Sur")
codigo = {norm(n).split(",")[0]: c for c, n, _, _ in filas}


def por_provincia(hoja):
    """Las filas de una hoja nacional de 2010 con nombre de provincia en la primera columna, sin las de los partidos y el interior de Buenos Aires."""
    r = {}
    for i in range(len(hoja)):
        n = norm(str(hoja.iat[i, 0])).split(",")[0]
        if n in codigo:
            r[codigo[n]] = hoja.iloc[i]
    assert len(r) == 24, f"faltan provincias en la hoja ({len(r)})"
    return r


h4 = por_provincia(pd.read_excel(io.BytesIO(leer(VIEJO + "/definitivos_bajarArchivoNacionales.asp?idc=6&arch=x&c=2010")), header=None))
for c, f in h4.items():
    datos[c]["hogares_2010"] = int(f[1])
    datos[c]["computadora_2010"] = float(f[4]) / float(f[1]) * 100
p11 = por_provincia(pd.read_excel(io.BytesIO(leer(VIEJO + "/definitivos_bajarArchivoNacionales.asp?idc=18&arch=x&c=2010")), header=None))
for c, f in p11.items():
    datos[c]["poblacion_viviendas_particulares_2010"] = int(f[1])
    datos[c]["sin_cobertura_2010"] = (float(f[4]) + float(f[5])) / float(f[1]) * 100
nbi_h = pd.read_excel(io.BytesIO(leer(NBI)), header=None)
# la primera columna con el año 2010 en el encabezado es la de los hogares (la segunda, la de la población). La hoja tiene columnas vacías
j10 = next(j for j in range(nbi_h.shape[1]) if any(str(nbi_h.iat[i, j]).strip() in ("2010", "2010.0") for i in range(6)))
for c, f in por_provincia(nbi_h).items():
    datos[c]["nbi_2010"] = float(f[j10])

# agua de red y cloaca: el cuadro H2-P de cada provincia
for c in datos:
    lista = leer(f"{VIEJO}/censos_provinciales.asp?id_tema_1=2&id_tema_2=41&id_tema_3=135&p={c}&d=999&t=0&s=0&c=2010").decode("latin-1")
    m = re.search(r"Cuadro H2-P\..*?definitivos_bajarArchivo\.asp\?idc=(\d+)&arch=x", lista, re.S)
    assert m, f"no se encontró el cuadro H2-P de la provincia {c}"
    h = pd.read_excel(io.BytesIO(leer(f"{VIEJO}/definitivos_bajarArchivo.asp?idc={m.group(1)}&arch=x&c=2010")), header=None)
    col0 = h.iloc[:, 0].astype(str).str.strip()
    total = h.index[col0.eq("Total")]
    red = h.index[col0.eq("Red pública")]
    assert len(total) == 1 and len(red) == 3, f"cambió el cuadro H2-P de la provincia {c}"
    num = lambda v: 0.0 if str(v).strip() in ("-", "", "nan") else float(v)
    tot = num(h.iat[total[0], 1])
    assert abs(tot - datos[c]["hogares_2010"]) < 1, f"el total de hogares del H2-P de {c} no coincide con el del H4"
    datos[c]["agua_red_2010"] = sum(num(h.iat[i, 1]) for i in red) / tot * 100
    datos[c]["cloaca_2010"] = num(h.iat[total[0], 2]) / tot * 100

cols = ["codigo_indec", "poblacion_2010", "poblacion_2022", "hogares_2010", "poblacion_viviendas_particulares_2010", "agua_red_2010", "cloaca_2010", "computadora_2010", "sin_cobertura_2010", "nbi_2010"]
with open(SALIDA, "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f, lineterminator="\n")
    w.writerow(cols)
    for c in sorted(datos):
        w.writerow([datos[c][k] if isinstance(datos[c][k], (int, str)) else round(datos[c][k], 4) for k in cols])
print(f"{SALIDA.relative_to(RAIZ)}: 24 jurisdicciones")
