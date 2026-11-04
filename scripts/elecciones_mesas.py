"""
Resultados por mesa y por circuito de las elecciones nacionales (pedido del autor del 4 de noviembre de 2026).

Arma sitio/datos/mesas/, lo que lee la herramienta mesas.html. Se corre una vez por elección nueva: los resultados no cambian y 03 no toca esa
carpeta. El detalle de fuentes, decisiones y límites está en docs/roadmap/MESAS.md.

Qué hay en cada período (lo que se puede publicar, revisado el 4 de noviembre de 2026):
- 2011 a 2025: por mesa, generales y segundas vueltas, presidente, diputados y senadores nacionales. Archivos del "estándar de preservación"
  de la Dirección Nacional Electoral (CC-BY 4.0). Es el escrutinio provisorio: no trae el voto en el exterior ni el de personas privadas de la libertad.
- 1983 a 2009: por provincia, escrutinio definitivo de la DINE. Por debajo de provincia no hay nada publicable sin permiso: las mesas de 2003 a 2009
  del Atlas de Andy Tow (su licencia, según lo relevado en el proyecto electoral del autor, es CC BY-ND, y el sitio pide iniciar sesión) y la base de
  Ernesto Calvo (circuitos 1983 a 2001, que el repositorio 257arg dice que no se redistribuye).

Qué escribe:
- sitio/datos/mesas/indice.json: las elecciones, con su nivel y sus totales.
- sitio/datos/mesas/{eleccion}/pais.csv: una fila por provincia y lista.
- sitio/datos/mesas/{eleccion}/{codigo_indec}.csv: una fila por mesa, con una columna por lista (solo 2011 en adelante).
- sitio/datos/mesas/circuitos/{codigo_indec}.csv: cada sección y cada circuito en cada elección, con las dos listas más votadas.
- datos/manual/mesas_control.json: los totales sumados directo de los archivos de origen, antes de armar nada. scripts/prueba_mesas.py compara
  contra ellos lo publicado.

Trampas de los archivos de origen (las mismas que encontró el proyecto electoral predictivo del autor, etl/dine_zip.py y etl/mesas.py):
- 2021 escribe los tipos de voto en plural ("BLANCOS", "NULOS") y los demás años en singular. Un tipo desconocido frena todo.
- El mismo circuito llega como "0557 ", "000557" o "557", y la mesa como "0001" o "1". Se normalizan los dos.
- "Diputados/as de la Ciudad" es la Legislatura de CABA, no la Cámara nacional.
- Hay mesas sin electores ni votos para un cargo nacional (en 2013, las 9000 de extranjeros): se sacan y se cuentan.
- En 2023 (segunda vuelta) y 2025 hay mesas "NO ESCRUTADO": quedan, con sus electores y sin votos. La participación no las cuenta.

Uso:
    python scripts/elecciones_mesas.py --cache CARPETA [CARPETA ...] --trabajo CARPETA [--solo 2023-general] [--sin-leer]
--cache: dónde buscar los ZIP y los Excel ya bajados. Lo que falte se baja a la primera (son unos 300 MB).
--trabajo: carpeta para los pasos intermedios (fuera del repositorio).
--sin-leer: no vuelve a leer los ZIP, arma con lo que ya está en --trabajo.
"""
import argparse
import json
import re
import shutil
import sys
import unicodedata
import urllib.request
import warnings
import zipfile
from pathlib import Path

import openpyxl
import pandas as pd

RAIZ = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RAIZ / "scripts"))
import nombres_propios  # noqa: E402

SALIDA = RAIZ / "sitio" / "datos" / "mesas"
CONTROL = RAIZ / "datos" / "manual" / "mesas_control.json"
PRESIDENCIALES = RAIZ / "datos" / "manual" / "presidenciales_provincia.csv"

BASE = "https://www.argentina.gob.ar/sites/default/files/"
ZIPS = {
    (2011, "general"): BASE + "2011-provisorios_generales.zip",
    (2013, "general"): BASE + "2013-provisorios_generales.zip",
    (2015, "general"): BASE + "2015-provisorios_generales.zip",
    (2015, "segunda"): BASE + "2015-provisorios_ballotage.zip",
    (2017, "general"): BASE + "2017-provisorios_generales.zip",
    (2019, "general"): BASE + "2019-provisorios_generales.zip",
    (2021, "general"): BASE + "2021-provisorios_generales.zip",
    (2023, "general"): BASE + "2023_generales_1.zip",
    (2023, "segunda"): BASE + "2023_segundavuelta.zip",
    # 2025 no está en la página de la DINE: sale del catálogo de datos.gob.ar (dataset elecciones_legislativas_2025, CC-BY 4.0)
    (2025, "general"): "http://datos.mininterior.gob.ar/dataset/947e871a-650e-4b63-8939-ecb29acb717c/resource/"
                       "a24110fb-bfcf-47a6-8aa7-2e53dab9caf5/download/elecciones_legislativas_2025.zip",
}
# los años por provincia. Los senadores se eligen por voto directo desde 2001
ANIOS_DIPUTADOS = [1983, 1985, 1987, 1989, 1991, 1993, 1995, 1997, 1999, 2001, 2003, 2005, 2007, 2009]
ANIOS_SENADORES = [2001, 2003, 2005, 2007, 2009]
ANIOS_PRESIDENTE = [1983, 1989, 1995, 1999, 2003, 2007]

CARGOS = {1: "presidente", 2: "senadores", 3: "diputados"}
# código de distrito de la DINE -> código INDEC
DISTRITO_A_INDEC = {1: "02", 2: "06", 3: "10", 4: "14", 5: "18", 6: "22", 7: "26", 8: "30", 9: "34", 10: "38", 11: "42", 12: "46",
                    13: "50", 14: "54", 15: "58", 16: "62", 17: "66", 18: "70", 19: "74", 20: "78", 21: "82", 22: "86", 23: "90", 24: "94"}
PROVINCIAS = {"02": "CABA", "06": "Buenos Aires", "10": "Catamarca", "14": "Córdoba", "18": "Corrientes", "22": "Chaco", "26": "Chubut",
              "30": "Entre Ríos", "34": "Formosa", "38": "Jujuy", "42": "La Pampa", "46": "La Rioja", "50": "Mendoza", "54": "Misiones",
              "58": "Neuquén", "62": "Río Negro", "66": "Salta", "70": "San Juan", "74": "San Luis", "78": "Santa Cruz", "82": "Santa Fe",
              "86": "Santiago del Estero", "90": "Tucumán", "94": "Tierra del Fuego"}
OTROS = {"EN BLANCO": "blancos", "BLANCOS": "blancos", "NULO": "nulos", "NULOS": "nulos",
         "RECURRIDO": "recurridos_impugnados", "RECURRIDOS": "recurridos_impugnados",
         "IMPUGNADO": "recurridos_impugnados", "IMPUGNADOS": "recurridos_impugnados", "COMANDO": "recurridos_impugnados"}
COLS_OTROS = ["blancos", "nulos", "recurridos_impugnados"]
COLUMNAS = ["distrito_id", "seccion_id", "seccion_nombre", "circuito_id", "mesa_id", "mesa_tipo", "mesa_electores", "cargo_id",
            "cargo_nombre", "agrupacion_nombre", "votos_tipo", "votos_cantidad"]
CLAVE = ["distrito", "seccion_id", "circuito", "mesa"]


def cargo_de(nombre):
    """Código del cargo nacional (1 presidente, 2 senadores, 3 diputados) a partir del nombre en el archivo. None si no es nacional."""
    n = nombre.upper()
    if "MERCOSUR" in n or "PROVINCIAL" in n or "CONCEJ" in n or "INTENDENTE" in n:
        return None
    if "PRESIDENTE" in n:
        return 1
    if "SENADOR" in n:
        return 2
    if "DIPUTADO" in n and "CIUDAD" not in n:
        return 3
    return None


def circuito_norm(s):
    """'0557 ', '000557' y '557' son el mismo circuito. Se conserva la letra ('0062A' pasa a '62A')."""
    return s.fillna("").str.strip().str.upper().str.lstrip("0").replace("", "0")


def mesa_norm(s):
    """'0001' y '1' son la misma mesa."""
    return s.fillna("").str.strip().str.upper().str.lstrip("0").replace("", "0")


# palabras que los archivos de la DINE escriben sin tilde. Solo las que siempre la llevan. Va aparte de datos/manual/tildes_nombres.json para no
# cambiar los nombres de las tablas del Congreso
TILDES_LISTAS = {"union": "Unión", "civica": "Cívica", "civico": "Cívico", "accion": "Acción", "republica": "República", "republicano": "Republicano",
                 "nacion": "Nación", "participacion": "Participación", "democratica": "Democrática", "democratico": "Democrático",
                 "democrata": "Demócrata", "politica": "Política", "politico": "Político", "patriotico": "Patriótico", "patriotica": "Patriótica",
                 "autentico": "Auténtico", "autentica": "Auténtica", "cordoba": "Córdoba", "tucuman": "Tucumán", "neuquen": "Neuquén",
                 "neuquino": "Neuquino", "rio": "Río", "entre": "Entre", "ecologica": "Ecológica", "ecologico": "Ecológico", "social": "Social",
                 "integracion": "Integración", "liberacion": "Liberación", "revolucion": "Revolución", "renovacion": "Renovación",
                 "transformacion": "Transformación", "reconstruccion": "Reconstrucción", "evolucion": "Evolución", "razon": "Razón",
                 "solidaridad": "Solidaridad", "pais": "País", "mas": "Más", "tambien": "También", "jujeno": "Jujeño", "santiagueno": "Santiagueño",
                 "pampeano": "Pampeano", "riojano": "Riojano", "cristiana": "Cristiana", "historico": "Histórico", "historica": "Histórica",
                 "economica": "Económica", "economico": "Económico", "publica": "Pública", "publico": "Público", "basica": "Básica",
                 "unica": "Única", "unico": "Único", "dignidad": "Dignidad", "credito": "Crédito", "desarrollo": "Desarrollo",
                 "educacion": "Educación", "opcion": "Opción", "coalicion": "Coalición", "concertacion": "Concertación",
                 "conviccion": "Convicción", "construccion": "Construcción", "seleccion": "Selección", "tradicion": "Tradición",
                 "autonomia": "Autonomía", "democracia": "Democracia", "patagonico": "Patagónico", "patagonica": "Patagónica"}
SIGLAS_LISTAS = {"PRO", "UCR", "ARI", "FIT", "MST", "MAS", "UDESO", "UNA", "CC", "GEN", "MPN", "UCEDE", "UCeDe", "PJ", "PS", "PTS", "PO", "FPV", "FCS", "MID",
                 "UDC", "PDC", "PI", "PDP", "MODIN", "FREPASO", "FREJULI", "AUNAR", "ADN", "ECO", "PAIS", "MPJ", "UP", "FE", "CREO", "FORJA", "LLA"}


# las fórmulas presidenciales de 2011 a 2023: los archivos por mesa traen solo la alianza. Como en la ficha de elecciones de Política, cada fórmula se nombra
# por quien la encabezaba. Las listas de menos de 1,5% quedan con el nombre de la alianza
FORMULAS = {
    2011: {"alianza frente para la victoria": "Fernández de Kirchner - Boudou", "alianza frente amplio progresista": "Binner - Morandini",
           "alianza union para el desarrollo social": "Alfonsín - González Fraga", "alianza compromiso federal": "Rodríguez Saá - Vernet",
           "alianza frente popular": "Duhalde - Das Neves", "alianza frente de izquierda y de los trabajadores": "Altamira - Castillo",
           "coalicion civica - afirmacion para una republica igualitaria ari": "Carrió - Pérez"},
    2015: {"alianza frente para la victoria": "Scioli - Zannini", "frente para la victoria": "Scioli - Zannini", "alianza cambiemos": "Macri - Michetti", "cambiemos": "Macri - Michetti",
           "alianza unidos por una nueva alternativa (una)": "Massa - Sáenz", "alianza frente de izquierda y de los trabajadores": "Del Caño - Bregman",
           "alianza progresistas": "Stolbizer - Olaviaga", "alianza compromiso federal": "Rodríguez Saá - Negre de Alonso"},
    2019: {"frente de todos": "Fernández - Fernández de Kirchner", "juntos por el cambio": "Macri - Pichetto", "consenso federal": "Lavagna - Urtubey",
           "frente de izquierda y de trabajadores - unidad": "Del Caño - Del Plá", "frente nos": "Gómez Centurión - Hotton",
           "unite por la libertad y la dignidad": "Espert - Rosales"},
    2023: {"union por la patria": "Massa - Rossi", "la libertad avanza": "Milei - Villarruel", "juntos por el cambio": "Bullrich - Petri",
           "hacemos por nuestro pais": "Schiaretti - Randazzo", "frente de izquierda y de trabajadores - unidad": "Bregman - Del Caño"},
}


def sin_tildes(s):
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")


def nombre_lista(s):
    """El nombre de una lista como se lee: los archivos lo traen en mayúsculas, sin tildes y con espacios de relleno."""
    s = re.sub(r"\s+", " ", str(s).replace("\xa0", " ")).strip().rstrip(".")
    if not s:
        return s
    if s != s.upper():  # ya viene con mayúsculas y minúsculas: se respetan, salvo las palabras de enlace en el medio
        s = re.sub(r"(?<=\s)(Del|De|Y|Para|Por|Con|Hacia|El)(?=\s)", lambda m: m.group(1).lower(), s)
    b = nombres_propios.bloque(s)
    b = re.sub(r"\((\w+)\)", lambda m: f"({m.group(1).upper()})", b)  # las siglas entre paréntesis: "(UNA)"
    partes = []
    for p in re.split(r"(\W+)", b):
        k = sin_tildes(p).lower()
        if sin_tildes(p).upper() in SIGLAS_LISTAS and k not in ("una", "mas", "fe", "pais", "up", "eco", "gen", "po", "ps", "pi"):
            partes.append(sin_tildes(p).upper())
        elif k in TILDES_LISTAS and p:
            partes.append(TILDES_LISTAS[k] if p[0].isupper() else TILDES_LISTAS[k].lower())
        else:
            partes.append(p)
    return "".join(partes)


def con_formula(lista, anio):
    """En las presidenciales, 'Massa - Rossi (Unión por la Patria)'."""
    f = FORMULAS[anio].get(sin_tildes(lista).lower())
    return f"{f} ({lista})" if f else lista


def nombre_formula(f):
    """'DE LA RÚA - ÁLVAREZ' pasa a 'De la Rúa - Álvarez'. Corrige un error de tipeo de la fuente en 1999 (FIGUEROAO)."""
    f = re.sub(r"\s+", " ", str(f).replace("FIGUEROAO", "FIGUEROA")).strip().title()
    return re.sub(r"(?<=\s)(De|Del|La|Las|Los)(?=\s)", lambda m: m.group(1).lower(), f)


def buscar(nombre, carpetas, url=None):
    """Busca un archivo en las carpetas de --cache. Si no está, lo baja a la primera."""
    for c in carpetas:
        if (c / nombre).exists():
            return c / nombre
    if not url:
        raise FileNotFoundError(nombre)
    print(f"  bajando {url}", flush=True)
    d = carpetas[0] / nombre
    d.parent.mkdir(parents=True, exist_ok=True)
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=900) as r:
        d.write_bytes(r.read())
    return d


def leer_zip(ruta, anio, vuelta, trabajo):
    """Lee el CSV por mesa de un ZIP y deja, por cargo nacional, las mesas y los votos por lista en --trabajo. Devuelve los totales de control."""
    z = zipfile.ZipFile(ruta)
    csvs = [i for i in z.infolist() if i.filename.lower().endswith(".csv") and "/._" not in i.filename and not i.filename.startswith("._")]
    nombre = max(csvs, key=lambda i: i.file_size).filename
    bloques, vistos, tipos_mesa = {1: [], 2: [], 3: []}, {}, {}
    filas_nulas = 0
    with z.open(nombre) as f:
        for b in pd.read_csv(f, dtype=str, usecols=COLUMNAS, chunksize=2_000_000, encoding="utf-8"):
            nom = b["cargo_nombre"].fillna("").str.strip()
            for (i, n), cuantas in b.assign(n=nom).groupby(["cargo_id", "n"]).size().items():
                vistos[(i, n)] = vistos.get((i, n), 0) + int(cuantas)
            codigos = {n: cargo_de(n) for n in nom.unique()}
            cargo = nom.map(codigos)
            for c in bloques:
                g = b[cargo == c].copy()
                if g.empty:
                    continue
                g["votos_tipo"] = g["votos_tipo"].str.strip().str.upper()
                desconocidos = set(g["votos_tipo"].dropna()) - {"POSITIVO"} - set(OTROS)
                if desconocidos:
                    sys.exit(f"{ruta.name}: tipos de voto desconocidos {sorted(desconocidos)}")
                filas_nulas += int(g["votos_tipo"].isna().sum())
                for t, cuantas in g["mesa_tipo"].fillna("").str.strip().str.upper().value_counts().items():
                    tipos_mesa[(c, t)] = tipos_mesa.get((c, t), 0) + int(cuantas)
                bloques[c].append(pd.DataFrame({
                    "distrito": pd.to_numeric(g["distrito_id"], errors="coerce").astype("Int64"),
                    "seccion_id": pd.to_numeric(g["seccion_id"], errors="coerce").astype("Int64"),
                    "seccion": g["seccion_nombre"].fillna("").str.strip(),
                    "circuito": circuito_norm(g["circuito_id"]),
                    "mesa": mesa_norm(g["mesa_id"]),
                    "tipo": g["mesa_tipo"].fillna("").str.strip().str.upper(),
                    "electores": pd.to_numeric(g["mesa_electores"], errors="coerce"),
                    "lista": g["agrupacion_nombre"].where(g["votos_tipo"] == "POSITIVO"),
                    "voto": g["votos_tipo"],
                    "votos": pd.to_numeric(g["votos_cantidad"], errors="coerce").fillna(0).astype("int64"),
                }))
    print(f"  cargos nacionales: { {k: v for k, v in vistos.items() if cargo_de(k[1])} }", flush=True)
    print(f"  tipos de mesa por cargo: {tipos_mesa}; filas sin tipo de voto: {filas_nulas}", flush=True)
    control = {}
    for c, partes in bloques.items():
        if not partes:
            continue
        d = pd.concat(partes, ignore_index=True)
        fuera = d["distrito"].isna() | ~d["distrito"].isin(list(DISTRITO_A_INDEC))
        if fuera.any():
            print(f"  {CARGOS[c]}: {int(fuera.sum())} filas fuera de los 24 distritos ({d.loc[fuera, 'distrito'].unique().tolist()}), con "
                  f"{int(d.loc[fuera, 'votos'].sum())} votos: se sacan", flush=True)
            d = d[~fuera]
        d["distrito"] = d["distrito"].astype(int)
        d["seccion_id"] = d["seccion_id"].fillna(0).astype(int)
        # los totales de control salen de acá, antes de cualquier armado
        pos = d[d["voto"] == "POSITIVO"]
        por_prov = {}
        for dist, g in d.groupby("distrito"):
            gp = pos[pos["distrito"] == dist]
            por_prov[DISTRITO_A_INDEC[int(dist)]] = {"votantes": int(g["votos"].sum()), "positivos": int(gp["votos"].sum())}
        id_ = f"{anio}-{vuelta}-{CARGOS[c]}"
        control[id_] = por_prov
        d["lista"] = d["lista"].fillna("").astype(str)
        d.to_parquet(trabajo / f"{id_}.parquet", index=False, compression="zstd")
        print(f"  {id_}: {len(d):,} filas, {len(por_prov)} distritos, {sum(p['votantes'] for p in por_prov.values()):,} votos", flush=True)
    return control


def natural(s):
    """Orden natural de códigos: 2, 10, 10A, 11."""
    m = re.match(r"(\d*)(.*)", str(s))
    return (int(m.group(1)) if m.group(1) else 10**9, m.group(2))


def num(v):
    """Un número de los Excel históricos: a veces llega como texto, con puntos de miles y espacios duros."""
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return float(v)
    t = str(v).replace("\xa0", "").replace(" ", "").replace(".", "").replace(",", ".")
    try:
        return float(t)
    except ValueError:
        return None


def clave_prov(s):
    s = sin_tildes(str(s)).upper().replace("\xa0", " ").strip()
    if s in ("CABA", "CAPITAL FEDERAL", "CIUDAD AUTONOMA DE BUENOS AIRES", "CIUDAD DE BUENOS AIRES", "C.A.B.A.", "CAPITAL"):
        return "02"
    if s == "BS AS":
        return "06"
    if s == "S. DEL ESTERO":
        return "86"
    if s.startswith("TIERRA DEL FUEGO"):
        return "94"
    for cod, nom in PROVINCIAS.items():
        if sin_tildes(nom).upper() == s:
            return cod
    return None


def leer_excel(ruta):
    """Un Excel histórico de la DINE, una hoja por distrito: filas de [codigo_indec, lista, votos, electores, votantes, blancos, nulos]."""
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        w = openpyxl.load_workbook(ruta, read_only=True, data_only=True)
    filas = []
    for hoja in w.sheetnames:
        cod = clave_prov(hoja)
        if not cod:
            continue
        electores, votantes, pct_vot, blancos, nulos, positivos = None, None, None, None, None, None
        listas, en_listas = [], False
        for r in w[hoja].iter_rows(values_only=True):
            v = [c for c in r if c is not None and str(c).strip() != ""]
            if not v:
                continue
            t = sin_tildes(str(v[0])).upper().replace("\xa0", " ").strip()
            t = re.sub(r"\s+", " ", t)
            if t.startswith("ELECTORES"):
                electores = num(v[1]) if len(v) > 1 else electores
            elif t.startswith("PORCENTAJE DE VOTANTES"):
                pct_vot = num(v[1]) if len(v) > 1 else pct_vot
            elif t.startswith("AGRUPACIONES"):
                en_listas = True
            elif t.startswith("VOTOS POSITIVOS"):
                positivos, en_listas = (num(v[1]) if len(v) > 1 else None), False
            elif t.startswith("VOTOS EN BLANCO"):
                blancos = num(v[1]) if len(v) > 1 else None
            elif t.startswith(("VOTOS NULOS", "VOTOS ANULADOS")):
                nulos = num(v[1]) if len(v) > 1 else None
            elif t.startswith("TOTAL DE VOTANTES"):
                votantes = num(v[1]) if len(v) > 1 else None
                break
            elif en_listas and len(v) >= 3 and isinstance(v[0], (int, float)):  # 2019: número de lista, nombre y votos
                listas.append((nombre_lista(v[1]), int(num(v[2]))))
            elif en_listas and len(v) >= 2 and num(v[1]) is not None and not re.search(r"DIREFENCIA|DIFERENCIA EN ACTAS", t):
                listas.append((nombre_lista(v[0]), int(num(v[1]))))
        if not listas:
            continue
        suma = sum(x for _, x in listas)
        if positivos and abs(suma - positivos) > 0.01 * positivos:
            print(f"    {ruta.name} {hoja}: las listas suman {suma:,} y los positivos dicen {positivos:,.0f}", flush=True)
        # el porcentaje de votantes llega como 0,82 o como 82 según la hoja
        if pct_vot and pct_vot > 1:
            pct_vot /= 100
        # solo se corrigen los errores de tipeo imposibles, los que cambian la cantidad de dígitos: en 2001 los votantes de La Rioja (senadores) dicen 14.642 y
        # suman 146.421, y en 2005 los electores de Tierra del Fuego (diputados) dicen 7.065 con 55.700 votantes. Una diferencia menor queda como la publica la fuente
        sumados = (positivos or suma) + (blancos or 0) + (nulos or 0)
        if votantes is None and electores and pct_vot:
            votantes = round(electores * pct_vot)
        elif votantes and blancos is not None and not 0.5 < votantes / sumados < 2:
            print(f"    {ruta.name} {hoja}: los votantes dicen {votantes:,.0f} y suman {sumados:,.0f}: se usa la suma", flush=True)
            votantes = sumados
        if electores and pct_vot and votantes and not 0.3 < votantes / electores <= 1:
            print(f"    {ruta.name} {hoja}: los electores dicen {electores:,.0f} con {votantes:,.0f} votantes y un {pct_vot * 100:.1f}% de participación: se usa la cuenta, {votantes / pct_vot:,.0f}", flush=True)
            electores = round(votantes / pct_vot)
        for lista, votos in listas:
            filas.append({"codigo_indec": cod, "lista": lista, "votos": votos, "electores": electores, "votantes": votantes,
                          "blancos": blancos, "nulos": nulos})
    return pd.DataFrame(filas)


def excel_historico(anio, cargo, carpetas):
    """Busca en la página de la DINE el Excel de ese año y cargo."""
    palabra = "diputados" if cargo == "diputados" else "senadores"
    for c in carpetas:
        hallados = sorted(p for p in c.glob(f"resultados_{anio}*{palabra}*.xlsx") if "paso" not in p.name)
        if hallados:
            return hallados[0]
    pag = urllib.request.urlopen(urllib.request.Request(f"https://www.argentina.gob.ar/dine/resultados-electorales/elecciones-{anio}",
                                                        headers={"User-Agent": "Mozilla/5.0"}), timeout=60).read().decode("utf-8", "ignore")
    enl = [u for u in set(re.findall(r'href="([^"]+\.xlsx)"', pag)) if palabra in u.lower() and "paso" not in u.lower()]
    if len(enl) != 1:
        sys.exit(f"{anio} {cargo}: se esperaba un Excel y hay {enl}")
    u = enl[0] if enl[0].startswith("http") else "https://www.argentina.gob.ar" + enl[0]
    return buscar(Path(u).name, carpetas, u)


# el escrutinio definitivo de cada cargo legislativo, para medir cuánto le falta al provisorio. De 2021 en adelante la DINE no lo publica como datos
DEFINITIVOS = {(2011, "diputados"): "resultados_2011_generales_diputados_nacionales.xlsx", (2011, "senadores"): "resultados_2011_generales_senadores_nacionales.xlsx",
               (2013, "diputados"): "resultados_generales_diputados_nacionales_2013_0.xlsx", (2013, "senadores"): "resultados_generales_senadores_nacionales_2013.xlsx",
               (2015, "diputados"): "resultados_2015_nacionales_diputados_nacionales.xlsx", (2015, "senadores"): "resultados_2015_nacionales_senadores_nacionales.xlsx",
               (2017, "diputados"): "generales-2017definitivodndistritodn.zip", (2017, "senadores"): "generales-2017definitivosndistrito_1.zip",
               (2019, "diputados"): "d.n._definitivo_x_distrito_grales_2019.xlsx", (2019, "senadores"): "s.n_definitivo_x_distrito_grales_2019.xlsx"}


def positivos_definitivos(anio, vuelta, cargo, carpetas, pres):
    """Los votos positivos del escrutinio definitivo por jurisdicción, o None si no está publicado como datos."""
    if cargo == "presidente":
        g = pres[(pres["anio"] == anio) & (pres["vuelta"] == (2 if vuelta == "segunda" else 1)) & pres["fuente"].str.contains("definitivo")]
        return {c: float(x) for c, x in g.groupby("codigo_indec")["positivos"].first().items()} or None
    nombre = DEFINITIVOS.get((anio, cargo))
    if not nombre:
        return None
    ruta = buscar(nombre, carpetas, BASE + nombre)
    if ruta.suffix == ".zip":  # 2017: distrito;agrupación o tipo de voto;votos
        z = zipfile.ZipFile(ruta)
        salida = {}
        for linea in z.read(z.namelist()[0]).decode("latin1").splitlines()[1:]:
            d, a, v = (linea.split(";") + ["", ""])[:3]
            if re.sub(r"\s+", " ", a).strip().upper() == "VOTOS POSITIVOS":
                salida[clave_prov(d)] = float(v.strip().replace(".", ""))
        return salida
    return {c: float(x) for c, x in leer_excel(ruta).groupby("codigo_indec")["votos"].sum().items()}


def escribir_csv(df, ruta):
    ruta.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(ruta, index=False, lineterminator="\n", encoding="utf-8")


def nombres_de_secciones(trabajo):
    """El nombre de cada sección, el mismo en todas las elecciones: el más largo que no venga todo en mayúsculas ('Comuna 01' pasa a 'Comuna 1').
    El código de sección es estable de 2011 a 2025: las diferencias entre elecciones son de escritura (trabajo/secciones_raras.json)."""
    filas = []
    for p in sorted(trabajo.glob("*.parquet")):
        d = pd.read_parquet(p, columns=["distrito", "seccion_id", "seccion"]).drop_duplicates()
        filas.append(d.assign(anio=int(p.name[:4])))
    t = pd.concat(filas).drop_duplicates()
    t = t[t["seccion"] != ""]
    salida, raros = {}, []
    for (dist, sec), g in t.sort_values("anio").groupby(["distrito", "seccion_id"]):
        nombres = g["seccion"].tolist()
        lindos = [n for n in nombres if n != n.upper()]
        # el más largo: "La Matanza" y no "Matanza", "José C. Paz" y no "J. C. Paz". Si empatan, el más reciente
        n = max(reversed(lindos), key=len) if lindos else nombres[-1].title()
        n = re.sub(r"\bComuna 0(\d)\b", r"Comuna \1", n)
        n = re.sub(r"\s+", " ", n).strip()
        n = re.sub(r"\b(De|Del|La|Las|Los|Y|El)\b(?=\s)", lambda m: m.group(1).lower(), n) if not lindos else n
        salida[(int(dist), int(sec))] = n
        distintos = {sin_tildes(x).upper().replace(" ", "") for x in nombres}
        if len(distintos) > 1:
            raros.append((int(dist), int(sec), sorted(set(nombres))))
    return salida, raros


def armar_mesas(id_, trabajo, secciones):
    """Escribe los CSV por mesa y el de provincias de una elección. Devuelve el resumen y las filas para la historia de cada circuito."""
    d = pd.read_parquet(trabajo / f"{id_}.parquet")
    # una fila por mesa: electores, blancos, nulos y recurridos
    otros = d[d["voto"] != "POSITIVO"].copy()
    otros["col"] = otros["voto"].map(OTROS)
    ot = otros.groupby(CLAVE + ["col"], as_index=False)["votos"].sum().pivot_table(index=CLAVE, columns="col", values="votos", fill_value=0)
    for c in COLS_OTROS:
        if c not in ot:
            ot[c] = 0
    e = d.groupby(CLAVE)["electores"].agg(["max", "min"])
    electores_raros = int((e["max"] != e["min"]).sum())
    mesas = e[["max"]].rename(columns={"max": "electores"}).join(ot[COLS_OTROS], how="left").fillna(0)
    pos = d[d["voto"] == "POSITIVO"].copy()
    pos["lista"] = pos["lista"].map({n: nombre_lista(n) for n in pos["lista"].unique()})
    if id_.endswith("presidente"):
        pos["lista"] = pos["lista"].map({n: con_formula(n, int(id_[:4])) for n in pos["lista"].unique()})
    largo = pos.groupby(CLAVE + ["lista"], as_index=False)["votos"].sum()
    largo = largo[largo["votos"] > 0]
    pos_mesa = largo.groupby(CLAVE)["votos"].sum().rename("positivos")
    mesas = mesas.join(pos_mesa, how="left").fillna(0).astype({"electores": "int64", "blancos": "int64", "nulos": "int64",
                                                               "recurridos_impugnados": "int64", "positivos": "int64"})
    mesas["votantes"] = mesas["positivos"] + mesas[COLS_OTROS].sum(axis=1)
    vacias = (mesas["electores"] == 0) & (mesas["votantes"] == 0)
    n_vacias = int(vacias.sum())
    mesas = mesas[~vacias].reset_index()
    resumen = {"id": id_, "provincias": {}, "mesas_vacias_sacadas": n_vacias, "mesas_con_electores_distintos": electores_raros}
    filas_pais, filas_hist = [], []
    carpeta = SALIDA / id_
    for dist, m in mesas.groupby("distrito"):
        cod = DISTRITO_A_INDEC[int(dist)]
        v = largo[largo["distrito"] == dist]
        totales_lista = v.groupby("lista")["votos"].sum().sort_values(ascending=False)
        ancho = v.pivot_table(index=["seccion_id", "circuito", "mesa"], columns="lista", values="votos", aggfunc="sum", fill_value=0)
        ancho = ancho[totales_lista.index]
        t = m.drop(columns=["distrito"]).set_index(["seccion_id", "circuito", "mesa"]).join(ancho, how="left").fillna(0).reset_index()
        t.insert(1, "seccion", [secciones.get((int(dist), int(s)), f"Sección {s}") for s in t["seccion_id"]])
        t["_o"] = [(s, natural(c), natural(x)) for s, c, x in zip(t["seccion_id"], t["circuito"], t["mesa"])]
        t = t.sort_values("_o").drop(columns="_o")
        cols = ["seccion_id", "seccion", "circuito", "mesa", "electores"] + COLS_OTROS + list(totales_lista.index)
        for c in cols[4:]:
            t[c] = t[c].astype("int64")
        repetidas = t.duplicated(["seccion_id", "circuito", "mesa"]).sum()
        if repetidas:
            sys.exit(f"{id_} {cod}: {repetidas} mesas repetidas")
        escribir_csv(t[cols], carpeta / f"{cod}.csv")
        con_votos = m[m["votantes"] > 0]
        tot = {"mesas": len(m), "mesas_sin_votos": int((m["votantes"] == 0).sum()), "circuitos": int(m[["seccion_id", "circuito"]].drop_duplicates().shape[0]),
               "secciones": int(m["seccion_id"].nunique()), "electores": int(con_votos["electores"].sum()), "votantes": int(m["votantes"].sum()),
               "positivos": int(m["positivos"].sum()), "blancos": int(m["blancos"].sum()), "nulos": int(m["nulos"].sum()),
               "recurridos_impugnados": int(m["recurridos_impugnados"].sum()),
               "mas_votos_que_electores": int((con_votos["votantes"] > con_votos["electores"]).sum()),
               "sin_electores_con_votos": int((con_votos["electores"] == 0).sum())}
        resumen["provincias"][cod] = tot
        for lista, votos in totales_lista.items():
            filas_pais.append({"codigo_indec": cod, "provincia": PROVINCIAS[cod], "lista": lista, "votos": int(votos), "mesas": tot["mesas"],
                               "electores": tot["electores"], "votantes": tot["votantes"], "blancos": tot["blancos"], "nulos": tot["nulos"],
                               "recurridos_impugnados": tot["recurridos_impugnados"]})
        # la historia: las dos listas más votadas de cada sección y de cada circuito
        for nivel in (["seccion_id"], ["seccion_id", "circuito"]):
            g_m = m.groupby(nivel)
            base = pd.DataFrame({"mesas": g_m.size(), "votantes": g_m["votantes"].sum(), "positivos": g_m["positivos"].sum(),
                                 "electores": con_votos.groupby(nivel)["electores"].sum()}).fillna(0)
            g_l = v.groupby(nivel + ["lista"], as_index=False)["votos"].sum().sort_values(nivel + ["votos"], ascending=[True] * len(nivel) + [False])
            tope = g_l.groupby(nivel).head(2).copy()
            tope["_n"] = tope.groupby(nivel).cumcount()
            for clave_nivel, fila in base.iterrows():
                llave = clave_nivel if isinstance(clave_nivel, tuple) else (clave_nivel,)
                filas_hist.append((cod, id_, *llave, *([""] if len(nivel) == 1 else []), int(fila["mesas"]), int(fila["electores"]), int(fila["votantes"]), int(fila["positivos"])))
            filas_hist_top = tope.set_index(nivel + ["_n"])[["lista", "votos"]]
            resumen.setdefault("_tope", []).append((cod, nivel, filas_hist_top))
    escribir_csv(pd.DataFrame(filas_pais), carpeta / "pais.csv")
    return resumen, filas_hist


def armar_historicas(carpetas):
    """Las elecciones de 1983 a 2009, por provincia. Devuelve sus resúmenes."""
    res = []
    p = pd.read_csv(PRESIDENCIALES, dtype={"codigo_indec": str})
    for anio in ANIOS_PRESIDENTE:
        g = p[(p["anio"] == anio) & (p["vuelta"] == 1)]
        if g.empty:
            sys.exit(f"presidente {anio}: no está en {PRESIDENCIALES.name}")
        # el partido cambia de una provincia a otra (las alianzas son provinciales): se agrupa por fórmula. Las chicas que no la traen quedan con su partido
        t = pd.DataFrame({"codigo_indec": g["codigo_indec"], "lista": [nombre_formula(f) if isinstance(f, str) and f.strip() else nombre_lista(x) for f, x in zip(g["formula"], g["partido"])],
                          "votos": g["votos"], "electores": g["electores"],
                          "votantes": g["votantes"], "blancos": g["blancos"], "nulos": g["nulos"]})
        res.append(escribir_historica(f"{anio}-general-presidente", t))
    for anio in ANIOS_DIPUTADOS:
        res.append(escribir_historica(f"{anio}-general-diputados", leer_excel(excel_historico(anio, "diputados", carpetas))))
    for anio in ANIOS_SENADORES:
        res.append(escribir_historica(f"{anio}-general-senadores", leer_excel(excel_historico(anio, "senadores", carpetas))))
    return res


def escribir_historica(id_, t):
    t = t[~t["lista"].str.contains(r"direfencia|diferencia en actas", case=False)]   # una fila de la fuente en 2007 (Río Negro) que no es una lista
    t = t.groupby(["codigo_indec", "lista"], as_index=False, sort=False).agg(votos=("votos", "sum"), electores=("electores", "first"), votantes=("votantes", "first"),
                                                                             blancos=("blancos", "first"), nulos=("nulos", "first"))
    t = t.sort_values(["codigo_indec", "votos"], ascending=[True, False])
    t.insert(1, "provincia", t["codigo_indec"].map(PROVINCIAS))
    for c in ("electores", "votantes", "blancos", "nulos"):
        t[c] = t[c].round().astype("Int64")
    escribir_csv(t, SALIDA / id_ / "pais.csv")
    prov = {}
    for cod, g in t.groupby("codigo_indec"):
        f = g.iloc[0]
        prov[cod] = {"electores": int(f["electores"]) if pd.notna(f["electores"]) else None, "votantes": int(f["votantes"]) if pd.notna(f["votantes"]) else None,
                     "positivos": int(g["votos"].sum())}
    print(f"  {id_}: {len(prov)} distritos, {sum(v['positivos'] for v in prov.values()):,} votos positivos", flush=True)
    return {"id": id_, "provincias": prov}


def etiqueta(anio, vuelta, cargo):
    if cargo == "presidente" and anio in (2015, 2023):
        return f"{anio}, {'primera vuelta' if vuelta == 'general' else 'segunda vuelta'}"
    return str(anio)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache", nargs="+", required=True)
    ap.add_argument("--trabajo", required=True)
    ap.add_argument("--solo", help="una elección: 2023-general")
    ap.add_argument("--sin-leer", action="store_true")
    a = ap.parse_args()
    carpetas = [Path(c) for c in a.cache]
    trabajo = Path(a.trabajo)
    trabajo.mkdir(parents=True, exist_ok=True)
    ctl_arch = trabajo / "control.json"
    control = json.loads(ctl_arch.read_text(encoding="utf-8")) if ctl_arch.exists() else {}
    if not a.sin_leer:
        for (anio, vuelta), url in ZIPS.items():
            if a.solo and a.solo != f"{anio}-{vuelta}":
                continue
            print(f"{anio} {vuelta}", flush=True)
            control.update(leer_zip(buscar(Path(url).name, carpetas, url), anio, vuelta, trabajo))
            ctl_arch.write_text(json.dumps(control, ensure_ascii=False, indent=1), encoding="utf-8")
    if a.solo:
        return

    # armar: se borra lo anterior para que no quede nada de una corrida vieja
    if SALIDA.exists():
        shutil.rmtree(SALIDA)
    secciones, raros = nombres_de_secciones(trabajo)
    print(f"{len(secciones)} secciones; {len(raros)} con nombres distintos según la elección", flush=True)
    (trabajo / "secciones_raras.json").write_text(json.dumps(raros, ensure_ascii=False, indent=0), encoding="utf-8")
    elecciones, resumenes, hist, topes = [], {}, [], []
    for (anio, vuelta) in ZIPS:
        for c in CARGOS.values():
            id_ = f"{anio}-{vuelta}-{c}"
            if not (trabajo / f"{id_}.parquet").exists():
                continue
            print(f"armando {id_}", flush=True)
            r, h = armar_mesas(id_, trabajo, secciones)
            topes += [(id_, *x) for x in r.pop("_tope")]
            resumenes[id_] = r
            hist += h
    # la historia de cada circuito, una tabla por provincia
    h = pd.DataFrame(hist, columns=["codigo_indec", "eleccion", "seccion_id", "circuito", "mesas", "electores", "votantes", "positivos"])
    tope = []
    for id_, cod, nivel, t in topes:
        t = t.reset_index()
        if "circuito" not in t:
            t["circuito"] = ""
        tope.append(t.assign(eleccion=id_, codigo_indec=cod))
    tope = pd.concat(tope, ignore_index=True)
    pri = tope[tope["_n"] == 0].rename(columns={"lista": "primera", "votos": "votos_primera"}).drop(columns="_n")
    seg = tope[tope["_n"] == 1].rename(columns={"lista": "segunda", "votos": "votos_segunda"}).drop(columns="_n")
    llave = ["codigo_indec", "eleccion", "seccion_id", "circuito"]
    h = h.merge(pri, on=llave, how="left").merge(seg, on=llave, how="left")
    h["votos_primera"] = h["votos_primera"].fillna(0).astype("int64")
    h["votos_segunda"] = h["votos_segunda"].fillna(0).astype("int64")
    h["_a"] = [(int(e[:4]), e) for e in h["eleccion"]]
    h["_c"] = [natural(c) if c else (-1, "") for c in h["circuito"]]
    for cod, g in h.groupby("codigo_indec"):
        g = g.sort_values(["seccion_id", "_c", "_a"]).drop(columns=["codigo_indec", "_a", "_c"])
        escribir_csv(g, SALIDA / "circuitos" / f"{cod}.csv")
    # lo histórico y el índice
    for r in armar_historicas(carpetas):
        resumenes[r["id"]] = r
    for id_ in sorted(resumenes, key=lambda x: (int(x[:4]), x)):
        r = resumenes[id_]
        anio, vuelta, cargo = id_.split("-")
        anio = int(anio)
        pv = r["provincias"]
        nivel = "mesa" if anio >= 2011 else "provincia"
        el = {"id": id_, "anio": anio, "vuelta": vuelta, "cargo": cargo, "etiqueta": etiqueta(anio, vuelta, cargo), "nivel": nivel,
              "recuento": "provisorio" if nivel == "mesa" else "definitivo", "provincias": sorted(pv)}
        if nivel == "mesa":
            el.update(mesas=sum(x["mesas"] for x in pv.values()), circuitos=sum(x["circuitos"] for x in pv.values()),
                      secciones=sum(x["secciones"] for x in pv.values()), mesas_sin_votos=sum(x["mesas_sin_votos"] for x in pv.values()))
        elecciones.append(el)
    mesa = [e for e in elecciones if e["nivel"] == "mesa"]
    # cuánto del escrutinio definitivo reúne el provisorio de cada jurisdicción: la herramienta avisa cuando es poco
    pres = pd.read_csv(PRESIDENCIALES, dtype={"codigo_indec": str})
    for e in mesa:
        ref = positivos_definitivos(e["anio"], e["vuelta"], e["cargo"], carpetas, pres)
        if ref:
            pv = resumenes[e["id"]]["provincias"]
            e["cobertura"] = {c: round(pv[c]["positivos"] / ref[c] * 100, 2) for c in pv if ref.get(c)}
            e["cobertura_pais"] = round(sum(pv[c]["positivos"] for c in pv if ref.get(c)) / sum(ref[c] for c in pv if ref.get(c)) * 100, 2)
            faltan = sorted(set(pv) - set(e["cobertura"]))
            print(f"  {e['id']}: reúne {e['cobertura_pais']}% del definitivo, la menor {min(e['cobertura'].values())}%" + (f", sin referencia {faltan}" if faltan else ""), flush=True)
    indice = {"desde": min(e["anio"] for e in elecciones), "desde_mesa": min(e["anio"] for e in mesa), "hasta": max(e["anio"] for e in elecciones),
              "provincias": PROVINCIAS, "elecciones": elecciones}
    SALIDA.mkdir(parents=True, exist_ok=True)
    (SALIDA / "indice.json").write_text(json.dumps(indice, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8", newline="\n")
    # el control: los totales de los archivos de origen y lo que quedó, para que scripts/prueba_mesas.py compare
    ctl = {"_leeme": "Totales de los archivos de origen de cada elección, sumados por scripts/elecciones_mesas.py antes de armar nada, y lo que quedó publicado. "
                     "Los compara scripts/prueba_mesas.py.",
           "origen": control, "publicado": resumenes,
           "resumen": {"desde": indice["desde"], "desde_mesa": indice["desde_mesa"], "hasta": indice["hasta"],
                       "hist_hasta": max(e["anio"] for e in elecciones if e["nivel"] == "provincia"), "n_elecciones": len(elecciones),
                       "n_elecciones_mesa": len(mesa), "mesas_ult": max(e["mesas"] for e in mesa if e["anio"] == indice["hasta"]),
                       "circuitos_ult": max(e["circuitos"] for e in mesa if e["anio"] == indice["hasta"])}}
    CONTROL.write_text(json.dumps(ctl, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")
    tam = sum(f.stat().st_size for f in SALIDA.rglob("*") if f.is_file())
    n = sum(1 for f in SALIDA.rglob("*") if f.is_file())
    mayor = max((f for f in SALIDA.rglob("*") if f.is_file()), key=lambda f: f.stat().st_size)
    print(f"Listo: {len(elecciones)} elecciones, {n} archivos, {tam / 1048576:.1f} MB. El mayor: {mayor.relative_to(SALIDA)}, {mayor.stat().st_size / 1048576:.2f} MB", flush=True)


if __name__ == "__main__":
    main()
