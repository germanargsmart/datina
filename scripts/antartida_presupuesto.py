"""
Gasto de la Nación en la Antártida, 2000 a hoy (Presupuesto Abierto, Secretaría de Hacienda). Noviembre de 2026, pedido del autor.
Fuente: ejecución anual del gasto (crédito devengado) de la Administración Pública Nacional, un ZIP por año, el mismo que usan
scripts/transferencias_presupuesto.py y scripts/inversion_presupuesto.py: https://dgsiaf-repo.mecon.gob.ar/repository/pa/datasets/{anio}/credito-anual-{anio}.zip

Qué se suma: las filas cuyo programa, subprograma, proyecto, actividad u obra dice "antártic" (no "Antártida", que trae al edificio "Antártida
Argentina" de la Justicia, a un jardín de infantes y a las rutas de "Tierra del Fuego, Antártida e Islas"). No se separa por partida.

Cuatro grupos, por lo que dice la fila y no por el ministerio:
- sosten_logistico: Sostén Logístico Antártico, del Estado Mayor Conjunto (la campaña y las bases).
- plan_antartico: Desarrollo del Plan Antártico, de la Dirección Nacional del Antártico (Defensa hasta 2003, Cancillería después).
- fuerzas: lo que cada fuerza rotula como antártico en sus propios programas (Alistamiento Antártico desde 2020 y 2021, Patrulla Antártica Naval
  Combinada desde 2011). Antes de eso, ese gasto no se puede separar del resto de la fuerza: el salto de 2021 es en parte de rótulo.
- irizar: la reparación del rompehielos ARA Almirante Irízar, que no dice "antártic" y se identifica por su nombre.

Además, total_nacion: todo el gasto devengado de la Administración Nacional, para dar qué parte es el gasto antártico.

Montos en millones de pesos corrientes. Solo años completos: el año en curso no se guarda, como en los otros programas de presupuesto.
Guarda datos/manual/antartida_presupuesto.csv (por año y grupo) y datos/manual/antartida_presupuesto_detalle.csv (por año, organismo, programa y
actividad, para revisar qué entró). Volver a correrlo cada año.
Uso: python scripts/antartida_presupuesto.py (baja unos 90 MB; TRANSF_CACHE=carpeta para usar los ZIP ya bajados).
"""
import csv
import io
import os
import re
import tempfile
import urllib.request
import zipfile
from datetime import date
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
SALIDA = RAIZ / "datos" / "manual" / "antartida_presupuesto.csv"
DETALLE = RAIZ / "datos" / "manual" / "antartida_presupuesto_detalle.csv"
CACHE = Path(os.environ.get("TRANSF_CACHE") or tempfile.mkdtemp())
URL = "https://dgsiaf-repo.mecon.gob.ar/repository/pa/datasets/{a}/credito-anual-{a}.zip"
ANTARTICO = re.compile(r"ant[aá]rtic", re.I)
IRIZAR = re.compile(r"iriz[aá]r|rompehielos", re.I)
COLS_TEXTO = ["programa_desc", "subprograma_desc", "proyecto_desc", "actividad_desc", "obra_desc"]


def numero(s):
    return float((s or "0").replace(",", ".") or 0)


def zip_del_anio(a):
    ruta = CACHE / f"credito-anual-{a}.zip"
    if not ruta.exists():
        pedido = urllib.request.Request(URL.format(a=a), headers={"User-Agent": "Mozilla/5.0 (datina.com.ar)"})
        with urllib.request.urlopen(pedido, timeout=180) as r:
            ruta.write_bytes(r.read())
    return ruta


def grupo(prog, act):
    """Por lo que dice la fila y no por el ministerio: la Dirección Nacional del Antártico estuvo en Defensa hasta 2003, y el Sostén Logístico fue
    una actividad de Planeamiento Militar Conjunto entre 2004 y 2006."""
    texto = f"{prog} {act}"
    if re.search(r"plan ant[aá]rtico", texto, re.I):
        return "plan_antartico"
    if re.search(r"sost[eé]n log[ií]stico ant[aá]rtico", texto, re.I):
        return "sosten_logistico"
    return "fuerzas"


def main():
    filas, detalle = {}, {}
    for a in range(2000, date.today().year):
        with zipfile.ZipFile(zip_del_anio(a)) as z:
            texto = z.read(z.namelist()[0]).decode("utf-8-sig", errors="replace")
        n = 0
        for x in csv.DictReader(io.StringIO(texto)):
            filas[(a, "total_nacion")] = filas.get((a, "total_nacion"), 0) + numero(x.get("credito_devengado"))
            desc = " ".join(x.get(c) or "" for c in COLS_TEXTO)
            ant, iri = bool(ANTARTICO.search(desc)), bool(IRIZAR.search(desc))
            if not ant and not iri:
                continue
            dev = numero(x.get("credito_devengado"))
            g = "irizar" if iri and not ant else grupo(x.get("programa_desc") or "", x.get("actividad_desc") or "")
            filas[(a, g)] = filas.get((a, g), 0) + dev
            k = (a, g, x.get("jurisdiccion_desc") or "", x.get("subjurisdiccion_desc") or "", x.get("programa_desc") or "", x.get("actividad_desc") or "", x.get("proyecto_desc") or "")
            detalle[k] = detalle.get(k, 0) + dev
            n += 1
        print(a, "filas", n, flush=True)
    with open(SALIDA, "w", encoding="utf-8", newline="\n") as f:
        e = csv.writer(f, lineterminator="\n")
        e.writerow(["anio", "grupo", "devengado_millones"])
        for (a, g), v in sorted(filas.items()):
            e.writerow([a, g, round(v, 4)])
    with open(DETALLE, "w", encoding="utf-8", newline="\n") as f:
        e = csv.writer(f, lineterminator="\n")
        e.writerow(["anio", "grupo", "jurisdiccion", "organismo", "programa", "actividad", "proyecto", "devengado_millones"])
        for k, v in sorted(detalle.items()):
            if abs(v) >= 0.0001:
                e.writerow([*k, round(v, 4)])
    print("Listo:", SALIDA)


if __name__ == "__main__":
    main()
