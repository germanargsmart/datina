"""
Corre 02_procesar.py con la fecha de la última actualización de los datos (resumen["actualizado"] de sitio/datos/fichas.json) y no con la de
hoy. 31 de octubre de 2026. Sirve cuando se suma una fuente o se cambia un cálculo fuera de la actualización mensual: si 02 pone la fecha de
hoy, cambian la fecha de todas las páginas y los avisos de dato atrasado (scripts/frescura.py), y el resumen ya no se puede comparar con el
anterior. Así el resumen cambia solo en lo que se tocó.
Uso: python scripts/correr_02_con_fecha.py
"""
import json
import runpy
import sys
from pathlib import Path

import pandas as pd

RAIZ = Path(__file__).resolve().parent.parent
act = json.loads((RAIZ / "sitio" / "datos" / "fichas.json").read_text(encoding="utf-8"))["resumen"]["actualizado"]
d, m, a = act.split("/")
pd.Timestamp.now = classmethod(lambda cls, tz=None: pd.Timestamp(f"{a}-{m}-{d} 12:00"))
print("fecha del resumen:", act)
sys.argv = [str(RAIZ / "scripts" / "02_procesar.py")]
sys.path.insert(0, str(RAIZ / "scripts"))
runpy.run_path(str(RAIZ / "scripts" / "02_procesar.py"), run_name="__main__")
