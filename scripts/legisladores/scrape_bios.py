# Download apym biography pages (resignation / replacement dates) for cohorts 1983..2005
import pathlib, requests, pandas as pd
from concurrent.futures import ThreadPoolExecutor
OUT = pathlib.Path(__file__).parent
d = pd.read_csv(OUT / "apym_diputados_raw.csv", dtype={"apym_id": str})
ids = d[(d.hasta >= 1985) & (d.desde <= 2005)].apym_id.dropna().unique()
def get(i):
    f = OUT / "apym_bios" / f"{i}.html"
    if f.exists() and f.stat().st_size > 1000: return
    r = requests.get(f"https://apym.hcdn.gob.ar/biografias/{i}", timeout=60,
                     headers={"User-Agent": "Mozilla/5.0 (research; argentina-en-datos)"})
    f.write_bytes(r.content)
with ThreadPoolExecutor(4) as ex: list(ex.map(get, ids))
print(len(ids), "bios ok")
