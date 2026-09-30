# Scrape HCDN "Patrimonio Legislativo" historical deputies list (apym.hcdn.gob.ar/diputados)
import re, html, time, pathlib, requests, pandas as pd
OUT = pathlib.Path(__file__).parent
URL = "https://apym.hcdn.gob.ar/diputados"
S = requests.Session(); S.headers["User-Agent"] = "Mozilla/5.0 (research; argentina-en-datos)"
def page(n):
    f = OUT / "apym_pages" / f"p{n:03d}.html"
    if f.exists(): return f.read_text(encoding="utf-8")
    r = S.post(URL, data={"apellido": "", "periodoDesde": "1983", "periodoHasta": "2014",
                          "equalYear-hidden": "1", "order": "1", "submitBtn": str(n)}, timeout=60)
    r.raise_for_status(); f.write_text(r.text, encoding="utf-8"); time.sleep(0.5); return r.text
first = page(1)
npages = max(int(x) for x in re.findall(r'name="submitBtn" id="submitBtn" value="(\d+)"', first))
rows = []
for n in range(1, npages + 1):
    t = page(n)
    for card in re.findall(r'<div class="col-2-1">(.*?)VER BIOGRAF', t, flags=re.S):
        name = html.unescape(re.search(r'<span>(.*?)</span>', card).group(1)).strip()
        bio = re.search(r'/biografias/(\d+)', t[t.find(card):t.find(card)+len(card)+300])
        # a person can have several PERIODO/DISTRITO/PARTIDO triplets
        blocks = re.findall(r'tit-2">(PERIODO|DISTRITO|PARTIDO):&nbsp;&nbsp;</div>(.*?)</div>', card)
        cur = None
        for k, v in blocks:
            v = html.unescape(v).strip()
            if k == "PERIODO":
                cur = {"apym_id": bio.group(1) if bio else None, "nombre": name, "periodo": v,
                       "distrito": None, "partido": None}
                rows.append(cur)
            elif cur is not None:
                cur[k.lower()] = v
df = pd.DataFrame(rows)
df[["desde", "hasta"]] = df.periodo.str.extract(r"(\d{4})\s*-\s*(\d{4})").astype("Int64")
df.to_csv(OUT / "apym_diputados_raw.csv", index=False, encoding="utf-8")
print(npages, df.shape, df.apym_id.nunique())
