"""
Precios de la nafta súper y del gasoil en el surtidor por mes y provincia, de diciembre de 2004 a 2023 (Secretaría de Energía,
Resolución 1104/2004), etapa 22. Se corre una sola vez: baja los archivos anuales del catálogo (uno por año, de 45 a 60 MB, unos
1.000 MB en total) y guarda datos/manual/combustibles_2004_2023.csv con el mismo resumen que arma 01_descargar.py con el archivo vigente:
por mes, provincia y producto, la cantidad de estaciones y la mediana del precio en el surtidor, y lo mismo para todo el país. Los
criterios son los mismos: venta al público en estaciones de servicio con movimiento en el mes, sin los precios a menos de la mitad o a más
del doble de la mediana del país de su mes y producto. Hasta 2016 los archivos llaman "Estación de servicio" a lo que después llaman
"Bocas de expendio". El archivo de 2004 trae solo diciembre, el primer mes de la resolución. Desde 2024, 01_descargar.py suma cada mes el
archivo vigente (2024 se sumó en la etapa 21 desde su archivo anual).
Uso: python scripts/combustibles_historia.py [carpeta] (con una carpeta, guarda ahí cada archivo bajado y lo vuelve a usar si se corta).
"""
import io
import json
import re
import sys
import urllib.request
from pathlib import Path

import pandas as pd

RAIZ = Path(__file__).resolve().parents[1]
SALIDA = RAIZ / "datos" / "manual" / "combustibles_2004_2023.csv"
CATALOGO = "http://datos.energia.gob.ar/api/3/action/package_show?id=708f9ab4-829b-4f02-b507-f303c5bc4800"
UA = {"User-Agent": "Mozilla/5.0 (argentina-en-datos)"}
PROD = {"Nafta (súper) entre 92 y 95 Ron": "nafta", "Gas Oil Grado 2": "gasoil"}
ANIOS = range(2004, 2024)
MIN_ESTACIONES = 1000  # estaciones del país por mes y producto: con menos, el archivo vino incompleto


def leer(u):
    return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=900).read()


def resumen(datos):
    """El resumen por mes, provincia y producto de un archivo anual (la misma cuenta que precios_combustibles() en 01_descargar.py)."""
    if not datos.lstrip(b"\xef\xbb\xbf").startswith((b"fecha,periodo,operador", b"anio,mes,operador")):
        raise ValueError("formato inesperado")
    d = pd.read_csv(io.BytesIO(datos), low_memory=False, encoding="utf-8-sig").rename(columns={"no_novimientos": "no_movimientos"})
    if "periodo" not in d:
        d["periodo"] = d.anio.astype(int).astype(str) + "/" + d.mes.astype(int).astype(str).str.zfill(2)
    estacion = d.tipo_negocio.str.startswith("Bocas de expendio", na=False) | d.tipo_negocio.eq("Estación de servicio")
    d = d[d.producto.isin(PROD) & d.canal_de_comercializacion.eq("Al público") & estacion & d.no_movimientos.ne("SI") & (d.precio_surtidor > 0)]
    d = d.assign(producto=d.producto.map(PROD), periodo=d.periodo.str.replace("/", "-")).drop_duplicates(["periodo", "nro_inscripcion", "producto"])
    med = d.groupby(["periodo", "producto"]).precio_surtidor.transform("median")
    d = d[d.precio_surtidor.between(med * .5, med * 2)]

    def cuenta(g):
        return g.agg(estaciones=("nro_inscripcion", "nunique"), mediana=("precio_surtidor", "median")).reset_index()
    return pd.concat([cuenta(d.groupby(["periodo", "provincia", "producto"])),
                      cuenta(d.groupby(["periodo", "producto"])).assign(provincia="TOTAL DEL PAIS")])


def archivos():
    """Dirección del archivo de cada año, del catálogo de la Secretaría de Energía."""
    recursos = json.loads(leer(CATALOGO))["result"]["resources"]
    return {int(m.group(1)): r["url"].replace("https://", "http://") for r in recursos if (m := re.search(r"precios-eess-(\d{4})-?\.csv$", r["url"]))}


if __name__ == "__main__":
    carpeta = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    urls, partes = archivos(), []
    for anio in ANIOS:
        f = carpeta / f"precios-eess-{anio}.csv" if carpeta else None
        if f and f.exists():
            datos = f.read_bytes()
        else:
            datos = leer(urls[anio])
            if f:
                f.write_bytes(datos)
        r = resumen(datos)
        r = r[r.periodo.str.startswith(str(anio))]
        pais = r[r.provincia.eq("TOTAL DEL PAIS")]
        if pais.empty or pais.estaciones.min() < MIN_ESTACIONES or pais.periodo.nunique() < (1 if anio == 2004 else 12):
            raise ValueError(f"{anio}: faltan meses o estaciones\n{pais.to_string()}")
        print(anio, "meses", pais.periodo.nunique(), "estaciones del país", pais.estaciones.min(), "a", pais.estaciones.max(),
              "nafta", pais[pais.producto.eq("nafta")].mediana.round(2).tolist()[:1], "...", flush=True)
        partes.append(r)
    pd.concat(partes)[["periodo", "producto", "provincia", "estaciones", "mediana"]].sort_values(["periodo", "producto", "provincia"]) \
        .round({"mediana": 4}).to_csv(SALIDA, index=False)
    print("guardado", SALIDA)
