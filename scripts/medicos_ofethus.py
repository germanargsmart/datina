"""
Médicos habilitados y médicos activos por provincia de residencia, a fines de 2025 (Observatorio Federal de Talento Humano en Salud, OFETHuS,
Ministerio de Salud, "Médicos activos en Argentina. Estado de actividad de los profesionales médicos · 2025", junio de 2026). 31 de octubre de 2026.
Plan de mejora, sección 10, aprobado por el autor el 28 de octubre de 2026: la única fuente nacional de médicos por provincia. Sale en PDF, sin
tabla abierta, así que este programa se corre una vez, cuando sale un informe nuevo, y guarda la tabla en datos/manual/medicos_ofethus.csv.
Lee la Tabla A4 del anexo ("Médicos habilitados y activos por provincia de residencia"). Los habilitados son los matriculados en la Red Federal de
Registros de Profesionales de la Salud (REFEPS). Los activos, los que alguna de seis fuentes administrativas (empleo, impuestos, jubilaciones y
migraciones) muestra trabajando en 2025: el informe descarta a los jubilados sin actividad, a los que emigraron y a los que no tienen actividad
registrada. El programa controla que las 24 jurisdicciones sumen el total nacional del informe (244.588 y 194.027).
Necesita pypdf (python -m pip install pypdf), que no hace falta para armar el sitio.
Uso: python scripts/medicos_ofethus.py
"""
import csv
import io
import re
import sys
import unicodedata
import urllib.request
from pathlib import Path

import pypdf

RAIZ = Path(__file__).resolve().parent.parent
URL = "https://www.argentina.gob.ar/sites/default/files/medicos_activos_argentina_2025_ofethus_dncydts_2026_v300926_a_3092026.pdf"
SALIDA = RAIZ / "datos" / "manual" / "medicos_ofethus.csv"
ANIO = 2025
TOTAL = (244588, 194027)  # "Total nacional" de la Tabla A4


def norm(t):
    return re.sub(r"\s+", " ", unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode().lower()).strip()


pedido = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(pedido, timeout=120) as r:
    pdf = pypdf.PdfReader(io.BytesIO(r.read()))
texto = "\n".join(p.extract_text() or "" for p in pdf.pages)
ini = texto.index("Tabla A4.")
fin = texto.index("Total nacional", ini)
filas = []
for linea in texto[ini:fin + 60].splitlines():
    m = re.match(r"\s*(\D+?)\s+([\d.]+)\s+([\d.]+)\s+[\d,]+%\s+[\d,]+%\s*$", linea)
    if m:
        filas.append((m.group(1).strip(), int(m.group(2).replace(".", "")), int(m.group(3).replace(".", ""))))
total = [f for f in filas if norm(f[0]) == "total nacional"]
provs = [f for f in filas if norm(f[0]) != "total nacional"]
if len(provs) != 24 or len(total) != 1 or (total[0][1], total[0][2]) != TOTAL:
    sys.exit(f"la Tabla A4 cambió: {len(provs)} jurisdicciones, total {total}")
if (sum(f[1] for f in provs), sum(f[2] for f in provs)) != TOTAL:
    sys.exit("las jurisdicciones de la Tabla A4 no suman el total nacional")
with open(SALIDA, "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f, lineterminator="\n")
    w.writerow(["jurisdiccion", "anio", "habilitados", "activos"])
    w.writerows([n, ANIO, h, a] for n, h, a in provs)
print(f"{SALIDA.relative_to(RAIZ)}: 24 jurisdicciones, {TOTAL[0]:,} habilitados y {TOTAL[1]:,} activos")
