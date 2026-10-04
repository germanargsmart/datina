"""
Obra pública de la Nación por provincia, 2000 a hoy (Presupuesto Abierto, Secretaría de Hacienda), etapa 20.
Fuente: ejecución anual del gasto (crédito devengado) de la Administración Pública Nacional, un ZIP por año, el mismo que usa
scripts/transferencias_presupuesto.py: https://dgsiaf-repo.mecon.gob.ar/repository/pa/datasets/{anio}/credito-anual-{anio}.zip
Se toman dos partes, con la provincia donde se registra el gasto (ubicación geográfica):
- Obras de la Nación: construcciones que hace la propia Administración Nacional (inciso 4, bienes de uso, partida principal 2,
  construcciones), con el organismo que las ejecuta (por ejemplo, la Dirección Nacional de Vialidad).
- Transferencias de capital a provincias y municipios: lo que la Nación les transfiere para financiar gastos de capital (inciso 5,
  partida principal 8, parciales 1 y 6), con el ministerio que transfiere. Son las mismas transferencias de capital que suma
  transferencias_presupuesto.py en "Otras no automáticas" (y, si las hubiera, en las otras categorías).
Las obras nacionales, interprovinciales, binacionales o sin clasificar quedan como "sin provincia". Antes de 2000 casi todas las
transferencias figuran sin provincia: se empieza en 2000. Montos en millones de pesos corrientes. El año en curso es parcial.
Guarda datos/manual/inversion_provincias.csv. Volver a correrlo cada año, como el de transferencias.
Uso: python scripts/inversion_presupuesto.py (baja unos 90 MB; TRANSF_CACHE=carpeta para usar los ZIP ya bajados).
"""
import os
import tempfile
import urllib.request
import zipfile
from pathlib import Path

import pandas as pd

SALIDA = Path(__file__).resolve().parents[1] / "datos" / "manual" / "inversion_provincias.csv"
CACHE = Path(os.environ.get("TRANSF_CACHE") or tempfile.mkdtemp())
URL = "https://dgsiaf-repo.mecon.gob.ar/repository/pa/datasets/{a}/credito-anual-{a}.zip"
COLS = ["jurisdiccion_desc", "servicio_desc", "inciso_id", "principal_id", "parcial_id", "ubicacion_geografica_id", "credito_devengado"]


def anio_zip(anio):
    z = CACHE / f"credito-anual-{anio}.zip"
    if not z.exists():
        req = urllib.request.Request(URL.format(a=anio), headers={"User-Agent": "Mozilla/5.0"})
        z.write_bytes(urllib.request.urlopen(req, timeout=300).read())
    return z


if __name__ == "__main__":
    out = []
    for anio in range(2000, pd.Timestamp.now().year + 1):
        z = zipfile.ZipFile(anio_zip(anio))
        with z.open(z.namelist()[0]) as f:
            d = pd.read_csv(f, encoding="utf-8-sig", usecols=COLS, decimal=",", low_memory=False)
        obras = d[(d.inciso_id == 4) & (d.principal_id == 2)].assign(tipo="Obras de la Nación", organismo=lambda x: x.servicio_desc.str.strip())
        transf = d[(d.inciso_id == 5) & (d.principal_id == 8) & d.parcial_id.isin([1, 6])].assign(
            tipo="Transferencias de capital a provincias y municipios", organismo=lambda x: x.jurisdiccion_desc.str.strip())
        t = pd.concat([obras, transf])
        t["codigo_indec"] = t.ubicacion_geografica_id.map(lambda c: f"{int(c):02d}" if 2 <= int(c) <= 94 else "sin provincia")
        g = (t.groupby(["codigo_indec", "tipo", "organismo"]).credito_devengado.sum().round(4).reset_index()
             .rename(columns={"credito_devengado": "millones_corrientes"}))
        g.insert(0, "anio", anio)
        out.append(g[g.millones_corrientes != 0])
        print(anio, g.groupby("tipo").millones_corrientes.sum().round(1).to_dict())
    pd.concat(out).to_csv(SALIDA, index=False, encoding="utf-8")
