"""
Datos de la Antártida (noviembre de 2026, pedido del autor: "datos de la Antártida, bases, un mapa con las bases de la Argentina y de los demás países, el
tratado, todo"). El autor pidió dejarlos fijos: este programa no entra en la actualización mensual. Baja una vez cada fuente y guarda en datos/manual/:

- antartida_instalaciones.csv: lista de instalaciones de COMNAP (Council of Managers of National Antarctic Programs), con cada país como la informa su
  programa antártico. Uso libre para fines educativos y sin fines comerciales, citando a COMNAP. Se traducen el tipo y el país, nada más, y se corrige una
  coordenada: Zhongshan Skiway figura con latitud norte (69,6), al lado de la base china Zhongshan (69,4 Sur).
- antartida_tratado.csv: las partes del Tratado Antártico, de la Secretaría del Tratado (ats.aq).
- antartida_zonas.csv: zonas protegidas (ZAEP y ZAEA) y sitios y monumentos históricos, de la misma Secretaría, con quién los propuso.
- antartida_temperaturas.csv: temperatura media de cada mes en las bases argentinas, proyecto READER del British Antarctic Survey (SCAR), con los
  registros del Servicio Meteorológico Nacional y de la Dirección Nacional del Antártico.
- antartida_hielo.csv: extensión del hielo marino antártico en febrero y en septiembre, Sea Ice Index del NSIDC (G02135, versión 4).

Los armados a mano, con la fuente de cada fila, son antartida_bases.csv, antartida_reclamos.csv, antartida_turismo.csv y antartida_superficies.csv.
El gasto sale de scripts/antartida_presupuesto.py y la geometría de scripts/geometria_antartida.py.

Uso: python scripts/antartida_datos.py (baja menos de 1 MB). Para leer el PDF de la Secretaría necesita pypdf, que hay que tener instalado (PYTHONPATH sirve).
"""
import csv
import html
import io
import re
import urllib.request
import warnings
from datetime import datetime
from pathlib import Path

import openpyxl
import pypdf

MANUAL = Path(__file__).resolve().parents[1] / "datos" / "manual"
COMNAP = "https://www.comnap.aq/s/Facilities_Nov2024.csv"
PARTES = "https://www.ats.aq/devAS/Parties?lang=e"
ZONAS_PDF = "https://www.ats.aq/devphBackEnd/StatusReport/pdf?lang=e"
SITIOS_XLSX = "https://ats.aq/devphBackEnd/api/export/hsm?lang=e"
READER = "https://legacy.bas.ac.uk/met/READER/surface/{}.All.temperature.txt"
NSIDC = "https://noaadata.apps.nsidc.org/NOAA/G02135/south/monthly/data/S_{:02d}_extent_v4.0.csv"
# archivo de READER -> nombre en el sitio (las bases permanentes con estación en READER: Petrel no tiene). Jubany es el nombre anterior de Carlini
ESTACIONES = {"Orcadas": "Orcadas", "Esperanza": "Esperanza", "Marambio": "Marambio", "San_Martin": "San Martín", "Belgrano_II": "Belgrano II", "Jubany": "Carlini"}
PAIS = {"Argentina": "Argentina", "Australia": "Australia", "Belgium": "Bélgica", "Brazil": "Brasil", "Bulgaria": "Bulgaria", "Chile": "Chile", "China": "China",
        "Czech Republic": "República Checa", "Czechia": "República Checa", "Ecuador": "Ecuador", "Finland": "Finlandia", "France": "Francia", "Germany": "Alemania", "India": "India",
        "Italy": "Italia", "Japan": "Japón", "Netherlands": "Países Bajos", "New Zealand": "Nueva Zelanda", "Norway": "Noruega", "Peru": "Perú", "Poland": "Polonia",
        "Republic of Belarus": "Bielorrusia", "Belarus": "Bielorrusia", "Republic of Korea": "Corea del Sur", "Korea (ROK)": "Corea del Sur", "Korea (DPRK)": "Corea del Norte",
        "Russia": "Rusia", "Russian Federation": "Rusia", "South Africa": "Sudáfrica", "Spain": "España", "Sweden": "Suecia", "Türkiye": "Turquía", "Ukraine": "Ucrania",
        "United Kingdom": "Reino Unido", "United States": "Estados Unidos", "Uruguay": "Uruguay", "Austria": "Austria", "Canada": "Canadá", "Colombia": "Colombia",
        "Costa Rica": "Costa Rica", "Cuba": "Cuba", "Denmark": "Dinamarca", "Estonia": "Estonia", "Greece": "Grecia", "Guatemala": "Guatemala", "Hungary": "Hungría",
        "Iceland": "Islandia", "Kazakhstan": "Kazajistán", "Malaysia": "Malasia", "Monaco": "Mónaco", "Mongolia": "Mongolia", "Pakistan": "Pakistán",
        "Papua New Guinea": "Papúa Nueva Guinea", "Portugal": "Portugal", "Romania": "Rumania", "San Marino": "San Marino", "Saudi Arabia": "Arabia Saudita",
        "Slovakia": "Eslovaquia", "Slovenia": "Eslovenia", "Switzerland": "Suiza", "United Arab Emirates": "Emiratos Árabes Unidos", "Venezuela": "Venezuela"}
TIPO = {"Station": "Estación", "Camp": "Campamento", "Refuge": "Refugio", "Airfield Camp": "Pista con campamento", "Laboratory": "Laboratorio", "Depot": "Depósito"}
TEMPORADA = {"Year-Round": "Todo el año", "Seasonal": "Solo en verano"}
ESTADO = {"Open": "Abierta", "Temporarily Closed": "Cerrada por ahora"}
MESES = {m: i + 1 for i, m in enumerate("Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split())}


def bajar(url):
    pedido = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept": "*/*"})
    with urllib.request.urlopen(pedido, timeout=120) as r:
        return r.read()


def escribir(nombre, cols, filas):
    with open(MANUAL / nombre, "w", encoding="utf-8", newline="\n") as f:
        e = csv.writer(f, lineterminator="\n")
        e.writerow(cols)
        e.writerows(filas)
    print(f"{nombre}: {len(filas)} filas")


def instalaciones():
    filas = []
    for r in csv.DictReader(bajar(COMNAP).decode("cp1252").splitlines()):
        lat, lon = float(r["Latitude (DD)"]), float(r["Longitude (DD)"])
        if lat > 0:  # solo Zhongshan Skiway: se controla abajo
            assert r["Official Name"].strip() == "Zhongshan Skiway", f"latitud norte inesperada: {r['Official Name']}"
            lat = -lat
        otro = r["Operator (additional)"].strip()
        pais = PAIS[r["Operator (primary)"].strip()]
        filas.append([r["Official Name"].strip(), pais, PAIS[otro] if otro and PAIS[otro] != pais else "", TIPO[r["Type"]], TEMPORADA[r["Seasonality"]],
                      ESTADO[r["Status"]], r["Year Established"].strip(), round(lat, 4), round(lon, 4), r["Peak Population"].replace(",", "").strip()])
    assert len(filas) == 114, len(filas)
    filas.sort(key=lambda f: (f[1], f[0]))
    escribir("antartida_instalaciones.csv", ["nombre", "pais", "otro_pais", "tipo", "temporada", "estado", "anio", "lat", "lon", "capacidad"], filas)


def fecha(texto):
    m = re.search(r"(\d{1,2}) (\w{3}) (\d{4})", texto)
    return f"{m[3]}-{MESES[m[2]]:02d}-{int(m[1]):02d}" if m else ""


def partes():
    tablas = re.findall(r"<table.*?</table>", bajar(PARTES).decode("utf-8", errors="ignore"), re.S)
    assert len(tablas) == 2, len(tablas)
    filas = []
    for consultiva, tabla in zip((True, False), tablas):
        for tr in re.findall(r"<tr.*?</tr>", tabla, re.S)[1:]:
            c = [html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", x))).strip() for x in re.findall(r"<t[dh].*?</t[dh]>", tr, re.S)]
            original = c[0].endswith("*")
            nombre = PAIS[c[0].rstrip(" *")]
            filas.append([nombre, "sí" if original else "no", fecha(c[1]), fecha(c[2]) if consultiva else "", fecha(c[3] if consultiva else c[2])])
    filas.sort(key=lambda f: (f[2], f[0]))
    assert len(filas) == 58 and sum(f[3] != "" for f in filas) == 29 and sum(f[1] == "sí" for f in filas) == 12, len(filas)
    escribir("antartida_tratado.csv", ["pais", "firmante_original", "adhesion", "consultiva_desde", "protocolo_ambiental"], filas)


# en el PDF los nombres largos se cortan en dos renglones: un renglón que termina en coma o en uno de estos sigue en el próximo
CORTADOS = {"United", "Russian", "New", "South", "Korea", "Republic", "Republic of"}
ALIAS_PDF = {"Turkey": "Türkiye", "Korea": "Korea (ROK)", "Korea (ROK)": "Korea (ROK)"}


def nombre_pais(p):
    p = p.strip()
    return PAIS[ALIAS_PDF.get(p, p)]


def renglon_de_paises(linea):
    pedazos = [p.strip() for p in linea.split(",") if p.strip()]
    return bool(pedazos) and all(ALIAS_PDF.get(p, p) in PAIS or p in CORTADOS for p in pedazos)


def proponentes(lineas, i):
    """Quiénes propusieron la zona: la primera lista de países. Después viene otra, la de quienes la administran, que no siempre es igual."""
    texto = ""
    for x in lineas[i:]:
        texto = f"{texto} {x}".strip()
        final = texto.rstrip().rsplit(",", 1)[-1].strip()
        if not texto.endswith(",") and final not in CORTADOS:
            break
    return [nombre_pais(p) for p in texto.split(",") if p.strip()]


def zonas():
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        texto = "\n".join(p.extract_text() or "" for p in pypdf.PdfReader(io.BytesIO(bajar(ZONAS_PDF))).pages)
        libro = openpyxl.load_workbook(io.BytesIO(bajar(SITIOS_XLSX)), data_only=True)
    filas = []
    for tipo, sigla in (("ASPA", "ZAEP"), ("ASMA", "ZAEA")):
        parte = texto.split("SPECIALLY MANAGED AREAS")[0 if tipo == "ASPA" else 1]  # la última ZAEP se llevaría las ZAEA
        bloques = re.split(rf"\n{tipo} ?\n(\d+)\n", "\n" + parte)
        for num, cuerpo in zip(bloques[1::2], bloques[2::2]):
            lineas = [x.strip() for x in cuerpo.split("\n")]
            i = next((j for j, x in enumerate(lineas) if renglon_de_paises(x)), None)
            assert i is not None, f"{tipo} {num}: sin países"
            nombre = " ".join(x for x in lineas[:i] if not re.fullmatch(r"((SSSI|SPA) ?\d+( -)?|-)", x)).strip()
            filas.append([sigla, int(num), nombre, "; ".join(proponentes(lineas, i)), "no" if "Revoked" in cuerpo else "sí"])
    assert sum(f[0] == "ZAEP" for f in filas) == 84 and sum(f[0] == "ZAEA" for f in filas) == 7, "cambió la cantidad de zonas de la Secretaría"
    hoja = libro.worksheets[0]
    cab = [c.value for c in hoja[1]]
    n, pr, nom = cab.index("Number"), cab.index("Original Proposing Party"), cab.index("Name")
    for f in hoja.iter_rows(min_row=2, values_only=True):
        if f[n] is None:
            continue
        ps = [nombre_pais(x) for x in re.split(r",|\band\b|/", str(f[pr] or "")) if x.strip()]
        filas.append(["SMH", int(f[n]), str(f[nom]).strip(), "; ".join(ps), "sí"])
    filas.sort(key=lambda f: (f[0], f[1]))
    escribir("antartida_zonas.csv", ["tipo", "numero", "nombre", "propuesto_por", "vigente"], filas)


def temperaturas():
    filas = []
    for archivo, nombre in ESTACIONES.items():
        for linea in bajar(READER.format(archivo)).decode("ascii").splitlines()[1:]:
            c = linea.split()
            if len(c) != 13:
                continue
            for mes, v in enumerate(c[1:], 1):
                if v != "-":
                    filas.append([nombre, int(c[0]), mes, float(v)])
    escribir("antartida_temperaturas.csv", ["estacion", "anio", "mes", "temperatura"], filas)


def hielo():
    filas = {}
    for mes, col in ((2, "febrero"), (9, "septiembre")):
        for r in csv.DictReader(io.StringIO(re.sub(r" *, *", ",", bajar(NSIDC.format(mes)).decode("ascii")))):
            v = float(r["extent"])
            if v > 0:  # el NSIDC marca los meses sin dato con -9999
                filas.setdefault(int(r["year"]), {})[col] = v
    escribir("antartida_hielo.csv", ["anio", "febrero", "septiembre"], [[a, f.get("febrero", ""), f.get("septiembre", "")] for a, f in sorted(filas.items())])


if __name__ == "__main__":
    instalaciones()
    partes()
    zonas()
    temperaturas()
    hielo()
    print("Bajado el", datetime.now().date())
