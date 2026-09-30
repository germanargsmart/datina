"""
Elecciones presidenciales por provincia, 1983 a 2023 (Direccion Nacional Electoral, licencia CC-BY 4.0).
1983 a 2019: escrutinio definitivo, un Excel por eleccion con una hoja por distrito.
2023: escrutinio provisorio por mesa (primera y segunda vuelta), sumado por provincia. El definitivo no esta publicado como datos.
PASO (vuelta 0): definitivos de 2011 y 2015 en Excel, provisorios por mesa de 2019 y 2023. En las PASO cada fila es una
lista interna (precandidatura) y "partido" es la agrupacion. El enlace oficial de las PASO 2023 da error desde 2025: se usa la
copia del Internet Archive del mismo archivo (sha256 25558e7b...).
Como los resultados historicos no cambian, se corre una sola vez y guarda datos/manual/presidenciales_provincia.csv.
Los archivos bajados quedan en una carpeta temporal. Uso: python scripts/elecciones_presidenciales.py (tarda unos minutos).
"""
import io
import re
import unicodedata
import urllib.request
import zipfile
from pathlib import Path

import pandas as pd

import tempfile
SALIDA = Path(__file__).resolve().parents[1] / "datos" / "manual" / "presidenciales_provincia.csv"
import os
OUT = Path(os.environ.get("ELECCIONES_CACHE") or tempfile.mkdtemp())  # carpeta con los archivos ya bajados, para no repetir
CACHE = OUT / "dine_xlsx"
CACHE.mkdir(exist_ok=True)
BASE = "https://www.argentina.gob.ar/sites/default/files/"

XLSX = {  # (anio, vuelta): file name under BASE
    (1983, 1): "resultados_1983_-_presidente_y_vicepresidente_0.xlsx",
    (1989, 1): "resultados_1989_presidente_y_vicepresidente.xlsx",
    (1995, 1): "resultados_1995_presidente_y_vicepresidente.xlsx",
    (1999, 1): "resultados_1999_presidente_y_vicepresidente.xlsx",
    (2003, 1): "resultados_2003_presidente_y_vicepresidente.xlsx",
    (2007, 1): "resultados_2007_presidente_y_vicepresidente.xlsx",
    (2011, 1): "resultados_2011_generales_presidente_y_vicepresidente.xlsx",
    (2015, 1): "resultados_2015_nacionales_presidente_y_vicepresidente.xlsx",
    (2015, 2): "resultados_2015_segunda_vuelta_presidente_y_vicepresidente.xlsx",
    (2019, 1): "p.v._definitivo_x_distrito_grales_2019.xlsx",
    (2011, 0): "resultados_2011_eleccion_paso_presidente_y_vicepresidente.xlsx",
    (2015, 0): "resultados_2015_elecciones_paso_presidente_y_vicepresidente.xlsx",
}
CSV2023 = {  # (anio, vuelta): (zip url, member prefix)
    (2023, 1): (BASE + "2023_generales_1.zip", "2023_Generales/ResultadoElectorales"),
    (2023, 2): (BASE + "2023_segundavuelta.zip", "2023_segundavuelta/ResultadosElectorales"),
    (2019, 0): (BASE + "2019-provisorios_paso.zip", "2019_PASO/ResultadosElectorales"),
    (2023, 0): ("https://web.archive.org/web/20240106010034if_/" + BASE + "dine-resultados/2023-PROVISORIOS_PASO.zip",
                "2023_PASO/ResultadosElectorales"),
}
# las listas de las PASO 2023 no traen el nombre de quien encabezaba la formula
LISTAS_2023 = {("LA LIBERTAD AVANZA", "A- LIBERTAD POR SIEMPRE"): "MILEI - VILLARRUEL",
               ("JUNTOS POR EL CAMBIO", "B- LA FUERZA DEL CAMBIO"): "BULLRICH - PETRI",
               ("JUNTOS POR EL CAMBIO", "A- EL CAMBIO DE NUESTRAS VIDAS"): "RODRÍGUEZ LARRETA - MORALES",
               ("UNION POR LA PATRIA", "A- CELESTE Y BLANCA"): "MASSA - ROSSI",
               ("UNION POR LA PATRIA", "B- JUSTA Y SOBERANA"): "GRABOIS - ABAL MEDINA",
               ("HACEMOS POR NUESTRO PAIS", "A- HACEMOS"): "SCHIARETTI - RANDAZZO",
               ("FRENTE DE IZQUIERDA Y DE TRABAJADORES - UNIDAD", "A- UNIR Y FORTALECER LA IZQUIERDA"): "BREGMAN - DEL CAÑO",
               ("FRENTE DE IZQUIERDA Y DE TRABAJADORES - UNIDAD", "B- UNIDAD DE LUCHADORES Y LA IZQUIERDA"): "SOLANO - RIPOLL"}

INDEC = {
    "caba": ("02", "Ciudad Autónoma de Buenos Aires"), "buenos aires": ("06", "Buenos Aires"),
    "catamarca": ("10", "Catamarca"), "cordoba": ("14", "Córdoba"), "corrientes": ("18", "Corrientes"),
    "chaco": ("22", "Chaco"), "chubut": ("26", "Chubut"), "entre rios": ("30", "Entre Ríos"),
    "formosa": ("34", "Formosa"), "jujuy": ("38", "Jujuy"), "la pampa": ("42", "La Pampa"),
    "la rioja": ("46", "La Rioja"), "mendoza": ("50", "Mendoza"), "misiones": ("54", "Misiones"),
    "neuquen": ("58", "Neuquén"), "rio negro": ("62", "Río Negro"), "salta": ("66", "Salta"),
    "san juan": ("70", "San Juan"), "san luis": ("74", "San Luis"), "santa cruz": ("78", "Santa Cruz"),
    "santa fe": ("82", "Santa Fe"), "santiago del estero": ("86", "Santiago del Estero"),
    "tucuman": ("90", "Tucumán"), "tierra del fuego": ("94", "Tierra del Fuego, AeIAS"),
}
ALIASES = {"capital federal": "caba", "ciudad autonoma de buenos aires": "caba", "bs as": "buenos aires",
           "s. del estero": "santiago del estero",
           "tierra del fuego, antartida e islas del atlantico sur": "tierra del fuego"}


def norm(s):
    try:  # repair UTF-8 text that was decoded as latin1 (2023 segunda vuelta file is UTF-8)
        s = str(s).encode("latin1").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        pass
    s = unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode().lower()
    return re.sub(r"\s+", " ", s).strip()


def fix(s):
    """Texto UTF-8 leido como latin1 (los CSV de 2019 y 2023 mezclan las dos codificaciones)."""
    try:
        return str(s).encode("latin1").decode("utf-8") if isinstance(s, str) else s
    except (UnicodeEncodeError, UnicodeDecodeError):
        return s


def prov_key(name):
    k = norm(name)
    k = ALIASES.get(k, k)
    return k if k in INDEC else None


def fetch(name):
    p = CACHE / name
    if not p.exists():
        req = urllib.request.Request(BASE + name, headers={"User-Agent": "Mozilla/5.0"})
        p.write_bytes(urllib.request.urlopen(req).read())
    return p


def num(v):
    if isinstance(v, str):  # some 1983 sheets store "104.573" as text with thousands dots
        v = v.strip()
        if re.fullmatch(r"\d{1,3}(\.\d{3})+", v):
            v = v.replace(".", "")
    try:
        f = float(v)
        return None if pd.isna(f) else f
    except (TypeError, ValueError):
        return None


def parse_sheet(df):
    """Parse one DINE district sheet -> (party rows, totals dict)."""
    cells = df.map(lambda v: norm(v) if isinstance(v, str) else v)
    tot, hdr = {}, None
    for i, row in cells.iterrows():
        txt = [c for c in row if isinstance(c, str)]
        if any(t.startswith("electores inscriptos") or t.startswith("electores habiles") for t in txt):
            tot["electores"] = next(n for n in map(num, df.iloc[i]) if n is not None)
        if hdr is None and "votos" in txt:
            hdr = i
    h = list(cells.iloc[hdr])
    c_votos = h.index("votos")
    c_part = next(j for j, v in enumerate(h) if isinstance(v, str) and "agrupacion" in v)
    c_form = next((j for j, v in enumerate(h) if v == "formulas"), None)
    rows, last, agrup = [], None, None
    paso15 = c_form is None and "precandidatos" in " ".join(str(c) for c in cells.iloc[:hdr, 0])
    for i in range(hdr + 1, len(df)):
        lab = cells.iat[i, c_part]
        v = num(df.iat[i, c_votos])
        if not isinstance(lab, str):
            continue
        if lab.startswith("votos positivos"):
            tot["positivos"] = v
        elif lab.startswith("votos en blanco"):
            tot["blancos"] = v
        elif re.match(r"votos ?(an)?nul", lab) or re.match(r"votos ?anul", lab):
            tot["nulos"] = v
        elif lab.startswith("votos validos"):
            continue
        elif re.search(r"diferencia|recurrid|impugnad|compensac", lab):
            continue  # "DIFERENCIA DE ACTAS" etc.: counted in votantes, not a party
        elif lab.startswith("total de votantes"):
            tot["votantes"] = v
            break
        elif v is None:  # 2019: candidate names on the line below the party
            if last is not None:
                last["formula"] = str(df.iat[i, c_part]).strip()
        elif paso15 and num(df.iat[i, 0]) is None:  # PASO 2015: precandidatos debajo de su agrupacion
            if agrup is not None:
                agrup["listas"].append({"partido": agrup["partido"], "votos": v, "formula": str(df.iat[i, c_part]).strip()})
        elif paso15:
            agrup = {"partido": str(df.iat[i, c_part]).strip(), "listas": []}
            rows.append(agrup)
        else:
            last = {"partido": str(df.iat[i, c_part]).strip(), "votos": v,
                    "formula": (str(df.iat[i, c_form]).strip()
                                if c_form is not None and isinstance(df.iat[i, c_form], str) else None)}
            rows.append(last)
    if paso15:
        rows = [l for a in rows for l in a["listas"]]
    return rows, tot


def from_xlsx():
    out = []
    for (anio, vuelta), name in XLSX.items():
        xl = pd.ExcelFile(fetch(name))
        for sh in xl.sheet_names:
            k = prov_key(sh)
            if k is None:
                continue
            rows, tot = parse_sheet(xl.parse(sh, header=None))
            cod, prov = INDEC[k]
            for r in rows:
                out.append({"anio": anio, "vuelta": vuelta, "codigo_indec": cod, "provincia": prov,
                            **r, **tot, "fuente": "DINE definitivo xlsx"})
    return pd.DataFrame(out)


def from_csv2023():
    out = []
    for (anio, vuelta), (url, prefix) in CSV2023.items():
        zpath = OUT / Path(url).name
        if not zpath.exists():
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            zpath.write_bytes(urllib.request.urlopen(req).read())
        z = zipfile.ZipFile(zpath)
        member = next(n for n in z.namelist() if n.startswith(prefix))
        votes, mesas = [], []
        cols = ["distrito_nombre", "seccion_id", "circuito_id", "mesa_id", "mesa_tipo", "mesa_electores",
                "cargo_id", "agrupacion_nombre", "lista_nombre", "votos_tipo", "votos_cantidad"]
        with z.open(member) as f:
            for ch in pd.read_csv(f, encoding="latin1", usecols=cols, dtype=str, chunksize=2_000_000):
                ch = ch[ch.cargo_id == "1"].copy()
                ch["votos_cantidad"] = pd.to_numeric(ch.votos_cantidad)
                votes.append(ch.groupby(["distrito_nombre", "votos_tipo", "agrupacion_nombre", "lista_nombre"], dropna=False)
                             .votos_cantidad.sum())
                mesas.append(ch.drop_duplicates(["distrito_nombre", "seccion_id", "circuito_id", "mesa_id",
                                                 "mesa_tipo"])[["distrito_nombre", "seccion_id", "circuito_id",
                                                                "mesa_id", "mesa_tipo", "mesa_electores"]])
        v = pd.concat(votes).groupby(level=[0, 1, 2, 3], dropna=False).sum().reset_index()
        m = pd.concat(mesas).drop_duplicates(["distrito_nombre", "seccion_id", "circuito_id", "mesa_id", "mesa_tipo"])
        electores = m.assign(e=pd.to_numeric(m.mesa_electores)).groupby("distrito_nombre").e.sum()
        for dist, g in v.groupby("distrito_nombre"):
            cod, prov = INDEC[prov_key(dist)]
            pos = g[g.votos_tipo == "POSITIVO"]
            bla = g.loc[g.votos_tipo == "EN BLANCO", "votos_cantidad"].sum()
            nul = g.loc[g.votos_tipo.isin(["NULO", "IMPUGNADO", "RECURRIDO", "COMANDO"]), "votos_cantidad"].sum()
            tot = {"electores": electores[dist], "positivos": pos.votos_cantidad.sum(), "blancos": bla,
                   "nulos": nul, "votantes": g.votos_cantidad.sum()}
            if vuelta:  # generales: una fila por agrupacion
                pos = pos.groupby("agrupacion_nombre", as_index=False).votos_cantidad.sum().assign(lista_nombre=None)
            for _, r in pos.iterrows():
                formula = None
                if vuelta == 0:  # PASO: la lista interna. En 2019 el nombre de la lista termina con el de quien la encabezaba
                    ag, li = fix(r.agrupacion_nombre), fix(r.lista_nombre)
                    formula = LISTAS_2023.get((ag, li)) if anio == 2023 else (li.rsplit(" - ", 1)[-1] if " - " in str(li) else None)
                out.append({"anio": anio, "vuelta": vuelta, "codigo_indec": cod, "provincia": prov,
                            "partido": fix(r.agrupacion_nombre), "votos": r.votos_cantidad, "formula": formula,
                            **tot, "fuente": "DINE provisorio mesa CSV"})
    return pd.DataFrame(out)


if __name__ == "__main__":
    df = pd.concat([from_xlsx(), from_csv2023()], ignore_index=True)
    df["formula"] = df.formula.str.replace("–", "-").str.replace(r"\s*-\s*", " - ", regex=True).str.strip()
    df = df[df.votos > 0]  # e.g. 2015 ballotage lists eliminated formulas with 0
    for c in ["votos", "electores", "votantes", "positivos", "blancos", "nulos"]:
        df[c] = df[c].round().astype("Int64")
    cols = ["anio", "vuelta", "codigo_indec", "provincia", "partido", "formula", "votos",
            "electores", "votantes", "positivos", "blancos", "nulos", "fuente"]
    df = df[cols].sort_values(["anio", "vuelta", "codigo_indec", "votos"], ascending=[True, True, True, False])
    df.to_csv(SALIDA, index=False, encoding="utf-8")
    print(df.groupby(["anio", "vuelta"]).agg(prov=("codigo_indec", "nunique"), filas=("votos", "size"),
                                             votos=("votos", "sum")))
