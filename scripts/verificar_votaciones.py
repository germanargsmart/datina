"""
Coteja la copia de votaciones nominales (Como Voto, datos/crudo/congreso_votaciones_*.json.gz) con las fuentes oficiales.
- Diputados: datos abiertos de la HCDN, cabecera de actas de los periodos 129 a 137 (2011 a 2019), todas las actas.
- Senado: pagina oficial de cada acta (senado.gob.ar/votaciones/detalleActa/ID), las leyes clave y una muestra al azar.
Diputados fuera de 2011 a 2019 no se puede cotejar en bloque: votaciones.hcdn.gob.ar no tiene descarga y bloquea las
consultas seguidas. Esas leyes clave se cotejaron con los totales difundidos por la prensa.
Uso: python scripts/verificar_votaciones.py (no escribe nada, solo informa)
"""
import gzip, html, io, json, pathlib, random, re, urllib.request
import pandas as pd

RAIZ = pathlib.Path(__file__).resolve().parents[1]
CRUDO = RAIZ / "datos" / "crudo"
UA = {"User-Agent": "Mozilla/5.0 (argentina-en-datos)"}


def leer(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r:
        return r.read()


def cuentas(archivo):
    db = json.loads(gzip.decompress((CRUDO / archivo).read_bytes()))
    out = {}
    for e in db["votaciones"]:
        v = e["v"] if isinstance(e["v"], list) else json.loads(e["v"])
        c = [0] * 6
        for x in v:
            c[x[3]] += 1
        out[str(e["id"])] = (c[1], c[2], c[3], c[4])
    return out


leyes = pd.read_csv(RAIZ / "datos" / "manual" / "leyes_clave.csv", dtype={"dip": str, "sen": str})

# ---- Diputados 2011 a 2019
dip = cuentas("congreso_votaciones_diputados.json.gz")
cab = pd.read_csv(io.BytesIO(leer("https://datos.hcdn.gob.ar/dataset/2e08ab84-09f4-4aac-86b3-9573ca9810db/resource/"
                                  "28bdc184-d8e3-4d50-b5b5-e2151f902ac7/download/actas-datos-generales-2.4.csv")))
ok = dif = falta = 0
difs = []
for r in cab.itertuples():
    c = dip.get(str(r.acta_id))
    if c is None:
        falta += 1
        continue
    oficial = (r.votos_afirmativos, r.votos_negativos, r.abstenciones)
    if c[:3] == oficial:
        ok += 1
    else:
        dif += 1
        difs.append((r.acta_id, r.fecha, oficial, c[:3]))
print(f"Diputados 2011 a 2019: {ok} actas iguales, {dif} con diferencias, {falta} que no estan en la copia")
for d in difs[:10]:
    print("  acta", d[0], d[1], "oficial", d[2], "copia", d[3])
for r in leyes.dropna(subset=["dip"]).itertuples():
    f = cab[cab.acta_id.astype(str) == r.dip]
    if len(f):
        f = f.iloc[0]
        print(f"  {r.clave}: oficial {f.votos_afirmativos}-{f.votos_negativos}-{f.abstenciones}, copia {'-'.join(map(str, dip[r.dip][:3]))}")

# ---- Senado
sen = cuentas("congreso_votaciones_senadores.json.gz")
random.seed(1)
ids = list(leyes.sen.dropna()) + random.sample(sorted(sen), 20)
ok = 0
for i in ids:
    t = html.unescape(re.sub(r"<[^>]+>", " ", leer(f"https://www.senado.gob.ar/votaciones/detalleActa/{i}").decode("utf-8", "ignore")))
    m = re.search(r"(\d+)\s+AFIRMATIVOS\s+(\d+)\s+NEGATIVOS\s+(\d+)\s+ABSTENCIONES\s+(\d+)\s+AUSENTES", " ".join(t.split()))
    if not m:
        print(f"  Senado acta {i}: no se pudo leer la pagina oficial")
        continue
    oficial = tuple(int(x) for x in m.groups())
    if oficial == sen[i]:
        ok += 1
    else:
        print(f"  Senado acta {i}: oficial {oficial}, copia {sen[i]}")
print(f"Senado: {ok} de {len(ids)} actas iguales (leyes clave y 20 al azar)")
