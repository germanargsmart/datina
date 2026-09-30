# -*- coding: utf-8 -*-
"""Control de cobertura: parsea los anexos por ministerio de Wikipedia ES
('Anexo:Ministros de X de Argentina') y extrae (ministro, fechas) posteriores al 10/12/1983.
Escribe wp_por_ministerio_raw.csv."""
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "_lib"))
from bs4 import BeautifulSoup  # noqa: E402
import pandas as pd  # noqa: E402

from wp_common import wp_html  # noqa: E402
from parse_wikipedia_gabinetes import grid, person_link, DATE_RE, MESES, norm  # noqa: E402

ANEXOS = ["el Interior", "Defensa", "Justicia", "Economía", "Salud", "Trabajo", "Relaciones Exteriores",
          "Obras Públicas", "Educación", "Agricultura", "Desarrollo Social"]


def all_dates(txt):
    out = []
    for m in DATE_RE.finditer(txt.replace("\xa0", " ")):
        if m.group(2).lower() in MESES:
            out.append(f"{int(m.group(3)):04d}-{MESES[m.group(2).lower()]:02d}-{int(m.group(1)):02d}")
    return out


def main():
    recs = []
    for a in ANEXOS:
        title = f"Anexo:Ministros del Interior de Argentina" if a == "el Interior" else f"Anexo:Ministros de {a} de Argentina"
        html, real = wp_html(title)
        soup = BeautifulSoup(html, "lxml")
        for tb in soup.select("table.wikitable"):
            g = grid(tb)
            if not g:
                continue
            header = [norm(c.get_text(" ", strip=True)) for c in g[0]]
            c_name = [i for i, h in enumerate(header) if "ministro" in h or "cancille" in h or "titular" in h]
            c_pres = [i for i, h in enumerate(header) if "presidente" in h]
            for r in g[1:]:
                seen = set()
                txt = " ".join(c.get_text(" ", strip=True) for c in r if not (id(c) in seen or seen.add(id(c))))
                ds = all_dates(txt)
                yrs = [int(y) for y in re.findall(r"\b(1[89]\d\d|20[0-2]\d)\b", txt)]
                if not yrs or max(yrs) < 1983:
                    continue
                art = name = None
                for c in c_name:
                    if c < len(r):
                        art, name = person_link(r[c])
                        if name:
                            break
                pres = None
                for c in c_pres:
                    if c < len(r):
                        pres = person_link(r[c])[0] or r[c].get_text(" ", strip=True)
                recs.append(dict(anexo=a, ministerio_fila=r[0].get_text(" ", strip=True)[:80], nombre=name,
                                 articulo_wp=art, inicio=ds[0] if ds else None,
                                 fin=ds[1] if len(ds) > 1 else None, presidente=pres,
                                 texto=txt[:200]))
    df = pd.DataFrame(recs)
    df = df[(df.fin.isna()) | (df.fin >= "1983-12-10")]
    df.to_csv(os.path.join(HERE, "wp_por_ministerio_raw.csv"), index=False, encoding="utf-8")
    print(len(df))


if __name__ == "__main__":
    main()
