"""
Demanda de energía eléctrica por mes, provincia y tipo de usuario, 2014 a 2022 (CAMMESA, bases del Informe Síntesis Mensual), etapa 21.
Se corre una sola vez: baja tres bases mensuales viejas de CAMMESA (las de diciembre de 2017, 2019 y 2022), lee la tabla de detalle de
la hoja DEMANDA de cada una y guarda datos/manual/cammesa_demanda_2014_2022.csv con el mes, la provincia, la categoría de tarifa
(Residencial, Comercial e Industrial/Comercial Grande) y los MWh. La tabla de detalle empieza en la fila cuya primera celda dice AÑO, y el
orden de las columnas cambia entre bases: se leen por nombre. En los meses que están en dos bases manda la más nueva. Empieza en 2014,
porque la base de 2015 contaba el alumbrado público como residencial. Desde 2023, 01_descargar.py suma cada mes el archivo vigente.
Uso: python scripts/cammesa_historia.py (baja unos 55 MB).
"""
import io
import urllib.request
import zipfile
from pathlib import Path

import pandas as pd

SALIDA = Path(__file__).resolve().parents[1] / "datos" / "manual" / "cammesa_demanda_2014_2022.csv"
URL = "https://microfe.cammesa.com/static-content/CammesaWeb/download-manager-files/Sintesis%20Mensual/BASE_INFORME_MENSUAL_{}.zip"
UA = {"User-Agent": "Mozilla/5.0 (argentina-en-datos)"}
CATEGORIAS = ["Residencial", "Comercial", "Industrial/Comercial Grande"]


def demanda(xlsx):
    """La tabla de detalle de la hoja DEMANDA, sumada por mes, provincia y categoría de tarifa (la misma lectura que 01_descargar.py)."""
    hoja = pd.read_excel(xlsx, sheet_name="DEMANDA", header=None)
    fila = hoja.index[hoja.iloc[:, 0].astype(str).str.strip().eq("AÑO")][0]
    d = hoja.iloc[fila + 1:].set_axis([str(c).strip() for c in hoja.iloc[fila]], axis=1)
    d = d[d["CATEGORIA TARIFA"].isin(CATEGORIAS)]
    d = d.assign(mes=pd.to_datetime(d["MES"]).dt.strftime("%Y-%m"), mwh=pd.to_numeric(d["DEMANDA [MWh]"], errors="coerce"))
    return d.groupby(["mes", "PROVINCIA", "CATEGORIA TARIFA"], as_index=False).mwh.sum().set_axis(["mes", "provincia", "categoria", "mwh"], axis=1)


if __name__ == "__main__":
    partes, vistos = [], set()
    for base in ["2022-12", "2019-12", "2017-12"]:  # de la más nueva a la más vieja
        z = zipfile.ZipFile(io.BytesIO(urllib.request.urlopen(urllib.request.Request(URL.format(base), headers=UA), timeout=600).read()))
        # el libro con la hoja DEMANDA: en las bases viejas es el único, en la de 2022 es "Demanda Mensual.xlsx" (se mira solo el nombre
        # del archivo, no la carpeta, que también dice BASE_INFORME)
        libro = [n for n in z.namelist() if n.rsplit("/", 1)[-1].lower() in ("demanda mensual.xlsx", f"base_informe_mensual_{base}.xlsx")][0]
        d = demanda(io.BytesIO(z.read(libro)))
        print(base, libro, d.mes.min(), d.mes.max(), round(d[d.categoria == "Residencial"].mwh.sum() / 1e6, 1), "TWh residenciales")
        d = d[~d.mes.isin(vistos)]
        partes.append(d)
        vistos |= set(d.mes)
    t = pd.concat(partes)
    t = t[(t.mes >= "2014-01") & (t.mes <= "2022-12")].sort_values(["mes", "provincia", "categoria"])
    assert t.mes.nunique() == 108, f"faltan meses entre 2014 y 2022: {t.mes.nunique()}"
    t.round(3).to_csv(SALIDA, index=False)
    print(len(t), "filas,", t.provincia.nunique(), "provincias")
