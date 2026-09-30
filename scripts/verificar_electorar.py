"""
Coteja los resultados presidenciales por provincia (datos/manual/presidenciales_provincia.csv, DINE) con los de electorAr
(github.com/electorArg/PolAr_Data), que suma por mesa el escrutinio provisorio del Atlas Electoral de Andy Tow y de la DINE.
electorAr tiene 2003 a 2019 (generales, balotaje 2015 y PASO 2011 a 2019). Se listan las agrupaciones con mas del 2% en
una provincia cuya diferencia supera un punto. Diferencias chicas son esperables: provisorio contra definitivo.
Uso: python scripts/verificar_electorar.py
"""
import io
import re
import unicodedata
import urllib.request
from pathlib import Path

import pandas as pd

RAIZ = Path(__file__).resolve().parents[1]
BASE = "https://raw.githubusercontent.com/electorArg/PolAr_Data/master/"
ELEC = {"gral2003": (2003, 1), "gral2007": (2007, 1), "gral2011": (2011, 1), "gral2015": (2015, 1), "balota2015": (2015, 2),
        "gral2019": (2019, 1), "paso2011": (2011, 0), "paso2015": (2015, 0), "paso2019": (2019, 0)}
# codigo de distrito electoral (orden alfabetico con CABA primero) a codigo INDEC
E2I = {f"{i:02d}": c for i, c in enumerate("02 06 10 14 18 22 26 30 34 38 42 46 50 54 58 62 66 70 74 78 82 86 90 94".split(), 1)}
VACIAS = {"al", "alianza", "frente", "partido", "de", "la", "el", "para", "por", "una", "y", "del", "los", "las", "p", "union"}


def tokens(t):
    t = unicodedata.normalize("NFKD", str(t)).encode("ascii", "ignore").decode().lower()
    return set(re.sub(r"[^a-z ]", " ", t).split()) - VACIAS


def bajar(ruta):
    req = urllib.request.Request(BASE + ruta, headers={"User-Agent": "Mozilla/5.0"})
    return pd.read_csv(io.BytesIO(urllib.request.urlopen(req, timeout=300).read()), dtype=str)


nuestro = pd.read_csv(RAIZ / "datos" / "manual" / "presidenciales_provincia.csv", dtype={"codigo_indec": str})
difs = []
for clave, (anio, vuelta) in ELEC.items():
    mesas, listas = bajar(f"data/arg_presi_{clave}.csv"), bajar(f"listas/listas_presi_{clave}.csv")
    listas.columns = [c.strip() for c in listas.columns]
    nombre = listas.assign(c=listas.vot_parCodigo.str.strip()).drop_duplicates("c").set_index("c").parDenominacion.str.strip()
    cols = [c for c in mesas.columns if c.strip() in nombre.index]
    mesas[cols] = mesas[cols].apply(pd.to_numeric, errors="coerce").fillna(0)
    ours_e = nuestro[(nuestro.anio == anio) & (nuestro.vuelta == vuelta)]
    for distrito, fila in mesas.groupby("codprov")[cols].sum().iterrows():
        o = ours_e[ours_e.codigo_indec == E2I[distrito]].groupby("partido").agg(votos=("votos", "sum"), positivos=("positivos", "first"))
        for cod, votos in fila.items():
            pe = votos / fila.sum() * 100
            if pe < 2:
                continue
            t = tokens(nombre[cod.strip()])
            par = max(o.index, key=lambda p: len(t & tokens(p)) / max(1, len(t | tokens(p))))
            po = o.loc[par].votos / o.loc[par].positivos * 100
            if abs(po - pe) > 1:
                difs.append({"eleccion": clave, "codigo_indec": E2I[distrito], "agrupacion_electorar": nombre[cod.strip()], "agrupacion_dine": par,
                             "pct_electorar": round(pe, 2), "pct_dine": round(po, 2)})
r = pd.DataFrame(difs)
print(f"{len(r)} diferencias de mas de un punto" + ("" if r.empty else ":\n" + r.to_string()))
