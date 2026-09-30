# -*- coding: utf-8 -*-
"""Parsea los anexos 'Anexo:Gabinete de Ministros de <Presidente>' de Wikipedia ES (HTML renderizado
vía MediaWiki API action=parse) y devuelve una tabla larga ministro-ministerio-período.

Uso: python parse_wikipedia_gabinetes.py  -> escribe wp_gabinetes_raw.csv
"""
import os
import re
import sys
import unicodedata
from urllib.parse import unquote

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "_lib"))
from bs4 import BeautifulSoup  # noqa: E402
import pandas as pd  # noqa: E402

from wp_common import wp_html  # noqa: E402

ANEXOS = [
    ("Raúl Alfonsín", "Anexo:Gabinete de Ministros de Raúl Alfonsín"),
    ("Carlos Menem", "Anexo:Gabinete de Ministros de Carlos Menem"),
    ("Fernando de la Rúa", "Anexo:Gabinete de Ministros de Fernando de la Rúa"),
    ("Adolfo Rodríguez Saá", "Anexo:Gabinete de Ministros de Adolfo Rodríguez-Saá"),
    ("Eduardo Duhalde", "Anexo:Gabinete de Ministros de Eduardo Duhalde"),
    ("Néstor Kirchner", "Anexo:Gabinete de Ministros de Néstor Kirchner"),
    ("Cristina Fernández de Kirchner", "Anexo:Gabinete de Ministros de Cristina Fernández de Kirchner"),
    ("Mauricio Macri", "Anexo:Gabinete de Ministros de Mauricio Macri"),
    ("Alberto Fernández", "Anexo:Gabinete de Ministros de Alberto Fernández"),
    ("Javier Milei", "Anexo:Gabinete de Ministros de Javier Milei"),
]

MESES = {m: i + 1 for i, m in enumerate(
    ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto",
     "septiembre", "octubre", "noviembre", "diciembre"])}
MESES["setiembre"] = 9
DATE_RE = re.compile(r"(\d{1,2})\s*(?:º|°)?\s*de\s+([a-záéíóú]+)\s+de(?:l)?\s+(\d{4})", re.I)
ISO_RE = re.compile(r"(\d{4})-(\d{2})-(\d{2})")
DMY_RE = re.compile(r"\b(\d{1,2})/(\d{1,2})/(\d{4})\b")


def norm(s):
    s = unicodedata.normalize("NFKD", s or "").encode("ascii", "ignore").decode().lower()
    return re.sub(r"\s+", " ", s).strip()


def parse_date(txt):
    txt = (txt or "").replace("\xa0", " ")
    m = DATE_RE.search(txt)
    if m and m.group(2).lower() in MESES:
        return f"{int(m.group(3)):04d}-{MESES[m.group(2).lower()]:02d}-{int(m.group(1)):02d}"
    m = ISO_RE.search(txt)
    if m:
        return m.group(0)
    m = DMY_RE.search(txt)
    if m:
        return f"{int(m.group(3)):04d}-{int(m.group(2)):02d}-{int(m.group(1)):02d}"
    return None


def clean_text(el):
    for s in el.find_all(["sup", "style"]):
        s.decompose()
    return re.sub(r"\s+", " ", el.get_text(" ", strip=True)).strip()


def grid(table):
    """Expande rowspan/colspan. Devuelve lista de filas; cada fila es lista de (tag, cell)."""
    rows = table.find_all("tr")
    out, pending = [], {}  # pending[col] = [remaining, cell]
    for tr in rows:
        cells = tr.find_all(["td", "th"], recursive=False)
        row, col, ci = [], 0, 0
        while ci < len(cells) or col in pending:
            if col in pending:
                rem, cell = pending[col]
                row.append(cell)
                if rem - 1 <= 0:
                    del pending[col]
                else:
                    pending[col] = [rem - 1, cell]
                col += 1
                continue
            cell = cells[ci]
            ci += 1
            cs = int(re.sub(r"\D", "", cell.get("colspan", "1")) or 1)
            rs = int(re.sub(r"\D", "", cell.get("rowspan", "1")) or 1)
            for _ in range(cs):
                row.append(cell)
                if rs > 1:
                    pending[col] = [rs - 1, cell]
                col += 1
        out.append(row)
    return out


def person_link(cell):
    """Primer enlace a artículo (no archivo) dentro de la celda."""
    for a in cell.find_all("a", href=True):
        h = a["href"]
        if h.startswith("/wiki/") and ":" not in unquote(h[6:]).split("#")[0]:
            return unquote(h[6:]).split("#")[0].replace("_", " "), a.get_text(" ", strip=True)
        if "redlink=1" in h:  # enlace rojo: artículo inexistente
            return None, a.get_text(" ", strip=True)
    return None, None


def is_ministry_label(t):
    n = norm(t)
    return n.startswith("ministerio") or n.startswith("jefatura") or n.startswith("jefe de gabinete") \
        or n.startswith("jefa de gabinete")


def parse_page(presidente, title):
    html, real_title = wp_html(title)
    soup = BeautifulSoup(html, "lxml")
    recs = []
    for ti, table in enumerate(soup.select("table.wikitable")):
        g = grid(table)
        # cabecera: primeras filas con 'inicio'
        header = None
        for r in g[:3]:
            labels = [norm(clean_text(BeautifulSoup(str(c), "lxml"))) for c in r]
            if any("inicio" in l or l.startswith("desde") for l in labels):
                header = labels if header is None else [
                    (a if "titular" not in a and "periodo" not in a else b) if b else a
                    for a, b in zip(header, labels + [""] * (len(header) - len(labels)))]
        if header is None:
            continue
        # solo la tabla de ministerios (rango ministerial): 1a celda "Ministerio", sin columna "Secretaría"
        if not header[0].startswith("ministerio") or any("secretar" in h for h in header):
            continue

        def cols(*keys):
            return [i for i, l in enumerate(header) if any(k in l for k in keys)]
        c_min = 0
        c_name = cols("nombre", "titular")
        c_start = cols("inicio", "desde")
        c_end = cols("final", "fin", "hasta", "cese")
        c_end = [c for c in c_end if c not in c_start]
        c_party = cols("partido", "afiliacion")
        for r in g:
            if len(r) < 3:
                continue
            if all(c.name == "th" for c in r):
                continue
            mcell = r[c_min]
            mtxt = clean_text(BeautifulSoup(str(mcell), "lxml"))
            if not is_ministry_label(mtxt):
                continue
            ptitle, pname = None, None
            for c in c_name:
                if c < len(r) and r[c] is not mcell:
                    ptitle, pname = person_link(r[c])
                    if pname:
                        break
            if not pname:
                for c in c_name:
                    if c < len(r):
                        t = clean_text(BeautifulSoup(str(r[c]), "lxml"))
                        if t:
                            pname = t
                            break
            start = end = None
            for c in c_start:
                if c < len(r):
                    start = start or parse_date(r[c].get_text(" "))
            end_txt = ""
            for c in c_end:
                if c < len(r):
                    end_txt = r[c].get_text(" ", strip=True)
                    end = end or parse_date(end_txt)
            party = ""
            for c in c_party:
                if c < len(r):
                    t = clean_text(BeautifulSoup(str(r[c]), "lxml"))
                    if t:
                        party = t
                        break
            recs.append(dict(presidente=presidente, fuente_wp=real_title, tabla=ti,
                             ministerio=re.sub(r"\s*\[.*?\]", "", mtxt).strip(),
                             nombre=pname, articulo_wp=ptitle, inicio=start, fin=end,
                             fin_texto=end_txt, partido_wp=party))
    return recs


def main():
    allrecs = []
    for pres, t in ANEXOS:
        recs = parse_page(pres, t)
        print(pres, len(recs))
        allrecs += recs
    df = pd.DataFrame(allrecs).drop_duplicates(
        subset=["presidente", "ministerio", "nombre", "inicio", "fin"])
    df.to_csv(os.path.join(HERE, "wp_gabinetes_raw.csv"), index=False, encoding="utf-8")
    print(len(df))


if __name__ == "__main__":
    main()
