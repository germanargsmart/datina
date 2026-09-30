# Build tidy diputados.csv / senadores.csv (1983-12-10 onward)
# Inputs (downloaded in this folder):
#   hcdn_diputados.csv   <- datos.hcdn.gob.ar "Legisladores / Diputados" (2007-12-10 ->, bloc spells)
#   apym_diputados_raw.csv + apym_bios/*.html <- apym.hcdn.gob.ar "Patrimonio Legislativo" (scraped, <=2005 cohorts)
#   senado_hist.json     <- senado.gob.ar/micrositios/DatosAbiertos/ExportarListadoSenadoresHistorico/json
#   wd_Q18229570.csv / wd_Q18711738.csv <- Wikidata SPARQL (birth date/place)
import re, html, json, glob, pathlib, unicodedata
import pandas as pd

D = pathlib.Path(__file__).parent
MANDATO0 = pd.Timestamp("1983-12-10")

def fix(s):  # apym pages were cached via requests' latin-1 guess -> undo mojibake
    if not isinstance(s, str): return s
    try: return s.encode("latin-1").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError): return s

def norm(s):
    s = unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode().upper()
    return re.sub(r"[^A-Z ]", " ", s).split()

PROV = {"CAPITAL FEDERAL": "CIUDAD AUTONOMA DE BUENOS AIRES", "CIUDAD DE BUENOS AIRES": "CIUDAD AUTONOMA DE BUENOS AIRES",
        "TIERRA DEL FUEGO, ANTARTIDA E ISLAS DEL ATLANTICO SUR": "TIERRA DEL FUEGO"}
def prov(s):
    s = " ".join(unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode().upper().split())
    return PROV.get(s, s)

# ---------------- party / bloc -> family (familias.py, compartido con 02_procesar.py) ----------------
from familias import familia

# ---------------- Wikidata birth info (name match) ----------------
def wd_people(f):
    w = pd.read_csv(D / f)
    w = w.drop_duplicates("p")[["p", "pLabel", "birth", "pobLabel"]]
    w["key"] = w.pLabel.map(lambda s: frozenset(norm(s)))
    return w
def attach_wd(df, w):
    # match if all tokens of the Wikidata label appear in the source full name, unique candidate only
    idx = {}
    for r in w.itertuples():
        for t in r.key: idx.setdefault(t, []).append(r)
    out_b, out_p, out_q = [], [], []
    for name in df.nombre:
        toks = set(norm(name)); cands = {}
        for t in toks:
            for r in idx.get(t, []):
                if len(r.key) >= 2 and r.key <= toks: cands[r.p] = r
        if len(cands) == 1:
            r = next(iter(cands.values())); out_b.append(str(r.birth)[:10] if pd.notna(r.birth) else None)
            out_p.append(r.pobLabel if pd.notna(r.pobLabel) else None); out_q.append(r.p.rsplit("/", 1)[-1])
        else:
            out_b.append(None); out_p.append(None); out_q.append(None)
    df["wikidata"] = out_q; df["nacimiento_fecha"] = out_b; df["nacimiento_lugar"] = out_p
    return df

# ================= DIPUTADOS =================
# (a) HCDN open data, one row per bloc spell (2007-12-10 ->)
h = pd.read_csv(D / "hcdn_diputados.csv")
# algunos tramos de bloque siguen despues del cese (por ejemplo, quien deja la banca para asumir otro cargo): se cortan en el CESE
for c in ["BLOQUE_INICIO", "BLOQUE_FIN", "CESE"]: h[c] = pd.to_datetime(h[c])
h = h[h.BLOQUE_INICIO <= h.CESE].copy()
h["BLOQUE_FIN"] = h[["BLOQUE_FIN", "CESE"]].min(axis=1)
hd = pd.DataFrame({
    "id": h.ID, "nombre": h.APELLIDO.str.title() + ", " + h.NOMBRE.str.title(),
    "provincia": h.DISTRITO.map(prov),
    "mandato_inicio": pd.to_datetime(h.INICIO).dt.date, "mandato_fin": pd.to_datetime(h.FIN).dt.date,
    "inicio": pd.to_datetime(h.BLOQUE_INICIO).dt.date, "fin": pd.to_datetime(h.BLOQUE_FIN).dt.date,
    "bloque": h.BLOQUE.str.strip(), "tipo_afiliacion": "bloque parlamentario",
    "fuente": "datos.hcdn.gob.ar diputados2.0.csv"})

# (b) Patrimonio Legislativo (apym) for cohorts elected 1983..2005
a = pd.read_csv(D / "apym_diputados_raw.csv", dtype={"apym_id": str})
for c in ["nombre", "distrito", "partido"]: a[c] = a[c].map(fix)
a = a[(a.hasta >= 1985) & (a.desde <= 2005)].copy()

def bio_segments(i):
    f = D / "apym_bios" / f"{i}.html"
    if not f.exists(): return {}
    t = f.read_bytes().decode("utf-8", "replace")
    t = re.sub(r"<script.*?</script>|<style.*?</style>", "", t, flags=re.S)
    s = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", t)))
    s = s.split("CARGOS:", 1)[-1].split("partial('layout/footer')")[0]
    segs = {}
    for m in re.finditer(r"Diputad[oa] \((\d{4}) - (\d{4})\)(.*?)(?=Diputad[oa] \(\d{4} - \d{4}\)|$)", s):
        segs[(int(m.group(1)), int(m.group(2)))] = m.group(3)
    return segs

DATE = r"(\d{1,2}/\d{1,2}/\d{2,4})"
def pdate(x):
    d, m, y = x.split("/"); y = int(y); y = y + 1900 if y < 100 and y > 30 else (y + 2000 if y < 100 else y)
    return pd.Timestamp(year=y, month=int(m), day=int(d))

rows = []
for r in a.itertuples():
    seg = bio_segments(r.apym_id).get((int(r.desde), int(r.hasta)), "")
    fin = pd.Timestamp(f"{int(r.hasta)}-12-09"); motivo_fin = ""
    m = re.search(r"Renunci[oó] el " + DATE, seg) or re.search(r"Exclusi[oó]n[^.]*?aprobada el " + DATE, seg)
    if m:
        try: fin = pdate(m.group(1)); motivo_fin = "renuncia/exclusion"
        except Exception: pass
    reemplaza = re.search(r"Reemplaza a ([^,\-]+?)(?:[,\-]| Renunc| Vicep| Varios|$)", seg)
    reemplazado_por = re.search(r"Reemplazad[oa] por ([^,]+?)(?: Renunc| Vicep| Varios|$)", seg)
    rows.append(dict(id="APYM" + r.apym_id, nombre=r.nombre, provincia=prov(r.distrito),
                     desde=int(r.desde), hasta=int(r.hasta),
                     mandato_inicio=pd.Timestamp(f"{int(r.desde)}-12-10"), mandato_fin=pd.Timestamp(f"{int(r.hasta)}-12-09"),
                     inicio=pd.Timestamp(f"{int(r.desde)}-12-10"), fin=fin,
                     reemplaza=reemplaza.group(1).strip() if reemplaza else None,
                     reemplazado_por=reemplazado_por.group(1).strip() if reemplazado_por else None,
                     bloque=r.partido, seg=seg))
ap = pd.DataFrame(rows)
# replacement start date = exit date of the person replaced (same district & mandate, surname match)
ap["inicio_aprox"] = False
for i, r in ap[ap.reemplaza.notna()].iterrows():
    sur = norm(r.reemplaza.split(",")[0])[:1]
    my_sur = norm(r.nombre.split(",")[0])[:1]
    pool = ap[(ap.provincia == r.provincia) & (ap.index != i) & (ap.desde <= r.desde) & (ap.hasta >= r.desde)]
    hit = pool[pool.nombre.map(lambda n: norm(n.split(",")[0])[:1] == sur)] if sur else pool.iloc[0:0]
    if len(hit) == 0 and my_sur:  # fall back on "reemplazado por <me>"
        hit = pool[pool.reemplazado_por.fillna("").map(lambda n: norm(n)[:1] == my_sur)]
    ex = hit[hit.fin < hit.mandato_fin]
    if len(ex):
        ap.at[i, "inicio"] = ex.fin.max() + pd.Timedelta(days=1)
        ap.at[i, "mandato_inicio"] = ex.mandato_inicio.min(); ap.at[i, "mandato_fin"] = ex.mandato_fin.max()
    else:
        # also covers "Reemplaza a X - Falleció dd/mm/yyyy"
        m = re.search(r"Falleci[oó] (?:el )?" + DATE, r.seg)
        if m: ap.at[i, "inicio"] = pdate(m.group(1)) + pd.Timedelta(days=1)
        else: ap.at[i, "inicio_aprox"] = True
# replacements not dated: their listed period is the replaced member's mandate -> keep, flag inicio_aprox
ad = pd.DataFrame({"id": ap.id, "nombre": ap.nombre, "provincia": ap.provincia,
                   "mandato_inicio": ap.mandato_inicio.dt.date, "mandato_fin": ap.mandato_fin.dt.date,
                   "inicio": ap.inicio.dt.date, "fin": ap.fin.dt.date, "bloque": ap.bloque,
                   "tipo_afiliacion": "partido/alianza electoral", "inicio_aprox": ap.inicio_aprox, "reemplaza": ap.reemplaza,
                   "fuente": "apym.hcdn.gob.ar Patrimonio Legislativo (scrape)"})
hd["inicio_aprox"] = False
dip = pd.concat([ad, hd], ignore_index=True)
dip["familia"] = dip.bloque.map(familia)
dip = attach_wd(dip, wd_people("wd_Q18229570.csv"))
dip = dip.sort_values(["inicio", "provincia", "nombre"])
dip.to_csv(D / "diputados.csv", index=False, encoding="utf-8")
# copia para el sitio, sin los datos de Wikidata (el cruce por nombre tiene errores)
MANUAL = pathlib.Path(__file__).resolve().parents[2] / "datos" / "manual"
WD = ["wikidata", "nacimiento_fecha", "nacimiento_lugar"]

# ================= SENADORES =================
j = json.loads((D / "senado_hist.json").read_text(encoding="utf-8"), strict=False)
s = pd.DataFrame(j["table"]["rows"]).apply(lambda c: c.str.strip())
s["ini"] = pd.to_datetime(s["INICIO PERIODO REAL"]); s["fin_"] = pd.to_datetime(s["CESE PERIODO REAL"], errors="coerce")
s["finL"] = pd.to_datetime(s["CESE PERIODO LEGAL"])
s = s[s.fin_.fillna(s.finL).fillna(pd.Timestamp("2100-01-01")) >= MANDATO0]
sen = pd.DataFrame({
    "id": "SEN" + s.ID, "nombre": s.SENADOR.str.title(), "provincia": s.PROVINCIA.map(prov),
    "mandato_inicio": pd.to_datetime(s["INICIO PERIODO LEGAL"]).dt.date, "mandato_fin": s.finL.dt.date,
    "inicio": s.ini.dt.date, "fin": s.fin_.dt.date,  # empty fin = in office
    "bloque": s["PARTIDO POLITICO O ALIANZA"].replace("", None),
    "tipo_afiliacion": "partido/alianza electoral", "reemplazo": s.REEMPLAZO.replace("", None),
    "observaciones": s.OBSERVACIONES.replace("", None),
    "fuente": "senado.gob.ar ExportarListadoSenadoresHistorico"})
sen["familia"] = sen.bloque.map(familia)
sen = attach_wd(sen, wd_people("wd_Q18711738.csv"))
sen = sen.sort_values(["inicio", "provincia", "nombre"])
sen.to_csv(D / "senadores.csv", index=False, encoding="utf-8")
if MANUAL.exists():
    dip.drop(columns=WD).to_csv(MANUAL / "diputados_nacionales.csv", index=False, encoding="utf-8")
    sen.drop(columns=WD).to_csv(MANUAL / "senadores_nacionales.csv", index=False, encoding="utf-8")

# ================= coverage check =================
def active(df, y, md="07-01"):
    t = pd.Timestamp(f"{y}-{md}").date()
    x = df[(df.inicio <= t) & (df.fin.fillna(pd.Timestamp("2100-01-01").date()) >= t)]
    return x.id.nunique()
print("year  diputados(1-jul)  senadores(1-jul)")
for y in [1984, 1990, 1995, 2000, 2005, 2008, 2010, 2015, 2020, 2025, 2026]:
    print(y, active(dip, y), active(sen, y))
print("dip rows", len(dip), "persons", dip.id.nunique(), "wd birthplace", dip.drop_duplicates("id").nacimiento_lugar.notna().mean().round(3))
print("sen rows", len(sen), "persons", sen.id.nunique(), "wd birthplace", sen.drop_duplicates("id").nacimiento_lugar.notna().mean().round(3))
print(dip.familia.value_counts()); print(sen.familia.value_counts())
