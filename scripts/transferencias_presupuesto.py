"""
Transferencias presupuestarias de la Nacion a provincias y municipios, 1995 a hoy (Presupuesto Abierto, Secretaria de Hacienda).
Fuente: ejecucion anual del gasto (credito devengado) de la Administracion Publica Nacional, un ZIP por anio:
https://dgsiaf-repo.mecon.gob.ar/repository/pa/datasets/{anio}/credito-anual-{anio}.zip
Se toman las transferencias (inciso 5) corrientes y de capital (principal 7 y 8) a gobiernos provinciales y municipales
(parcial 1 y 6), con la provincia de destino (ubicacion geografica). No incluye la coparticipacion ni las demas
transferencias automaticas, que no pasan por el presupuesto nacional.

Cada fila queda en una de tres categorias:
- ATN: Aportes del Tesoro Nacional, que el gobierno nacional reparte sin formula.
  2017 en adelante: actividad "Aportes del Tesoro Nacional (ATN)" (en 2025 esta en la Jefatura de Gabinete).
  2002 a 2016: Ministerio del Interior, programa 19, fuente 1.3 (recursos con afectacion especifica, que es el fondo ATN).
  1996 a 2001: actividades "Transferencias ATN" del Ministerio del Interior. 1995: programa 99, fuente 1.3.
  Antes de 2000 casi todos los ATN figuran como "Nacional", sin provincia.
- Por ley o por fallo: coparticipacion a la Ciudad y Tierra del Fuego, Fondo Federal Solidario, Fondo Nacional de Incentivo
  Docente, devolucion del 15% (ley 27.260), policia de la Ciudad (ley 27.606) y cautelar de la Corte Suprema a favor de la Ciudad.
- Otras no automaticas: el resto (obras, vivienda, programas sociales y de salud, asistencia financiera del Tesoro, etc.).

Montos en millones de pesos corrientes. El anio en curso es parcial. Guarda datos/manual/transferencias_provincias.csv.
Uso: python scripts/transferencias_presupuesto.py (baja unos 95 MB; TRANSF_CACHE=carpeta para no volver a bajar).
"""
import os
import re
import tempfile
import unicodedata
import urllib.request
import zipfile
from pathlib import Path

import pandas as pd

SALIDA = Path(__file__).resolve().parents[1] / "datos" / "manual" / "transferencias_provincias.csv"
CACHE = Path(os.environ.get("TRANSF_CACHE") or tempfile.mkdtemp())
URL = "https://dgsiaf-repo.mecon.gob.ar/repository/pa/datasets/{a}/credito-anual-{a}.zip"
COLS = ["jurisdiccion_id", "jurisdiccion_desc", "programa_id", "programa_desc", "actividad_desc", "inciso_id", "principal_id",
        "parcial_id", "fuente_financiamiento_id", "ubicacion_geografica_id", "credito_devengado"]
POR_LEY = r"coparticipaci|copartic\.|fondo federal solidario|incentivo docente|27\.606|27\.260|medida cautelar"


def norm(t):
    return unicodedata.normalize("NFKD", str(t)).encode("ascii", "ignore").decode().lower()


def es_atn(t, anio):
    txt = (t.actividad_desc.fillna("") + " | " + t.programa_desc.fillna("")).map(norm)
    por_texto = txt.str.contains(r"transferencias atn|aportes del tesoro nacional") & ~txt.str.contains(r"bid|birf|oc-")
    interior = (t.jurisdiccion_id == 30) | ((anio == 2025) & (t.jurisdiccion_id == 25))
    f13 = t.fuente_financiamiento_id.astype(str) == "1.3"
    por_programa = interior & f13 & (((anio == 1995) & (t.programa_id == 99)) | ((anio >= 2002) & (anio <= 2016) & (t.programa_id == 19)))
    return por_texto | por_programa


def anio_zip(anio):
    z = CACHE / f"credito-anual-{anio}.zip"
    if not z.exists():
        req = urllib.request.Request(URL.format(a=anio), headers={"User-Agent": "Mozilla/5.0"})
        z.write_bytes(urllib.request.urlopen(req, timeout=300).read())
    return z


if __name__ == "__main__":
    out = []
    for anio in range(1995, pd.Timestamp.now().year + 1):
        z = zipfile.ZipFile(anio_zip(anio))
        with z.open(z.namelist()[0]) as f:
            d = pd.read_csv(f, encoding="utf-8-sig", usecols=COLS, decimal=",", low_memory=False)
        t = d[(d.inciso_id == 5) & d.principal_id.isin([7, 8]) & d.parcial_id.isin([1, 6])].copy()
        t["tipo"] = "Otras no automáticas"
        t.loc[t.programa_desc.map(norm).str.contains(POR_LEY), "tipo"] = "Por ley o por fallo"
        t.loc[es_atn(t, anio), "tipo"] = "ATN"
        t["anio"] = anio
        t["destino"] = t.parcial_id.map({1: "Provincia", 6: "Municipios"})
        t["clase"] = t.principal_id.map({7: "Corrientes", 8: "De capital"})
        t["codigo_indec"] = t.ubicacion_geografica_id.map(lambda c: f"{int(c):02d}" if 2 <= int(c) <= 94 else "sin provincia")
        g = (t.groupby(["anio", "codigo_indec", "tipo", "clase", "destino", "jurisdiccion_desc"]).credito_devengado.sum()
             .round(4).reset_index().rename(columns={"credito_devengado": "millones_corrientes", "jurisdiccion_desc": "jurisdiccion"}))
        out.append(g[g.millones_corrientes != 0])
        print(anio, g.groupby("tipo").millones_corrientes.sum().round(1).to_dict())
    pd.concat(out).to_csv(SALIDA, index=False, encoding="utf-8")
