"""Las cumbres más altas del país y el relieve alrededor de cada una (ficha f-cumbres de Naturaleza y ambiente).

Se corre una sola vez, o cuando el IGN cambie su tabla, y guarda en datos/manual/:
- cumbres_ign.csv: la tabla "Máximas alturas" del Instituto Geográfico Nacional, tal como la publica (nombre, provincia, altura en
  metros y coordenadas), con un nombre corto para el gráfico y el código INDEC de la provincia.
- relieve/<id>.json: la grilla de alturas de un recuadro de LADO_KM de lado centrado en las coordenadas del IGN de cada cumbre, de
  N x N puntos, en metros. Sale de las teselas Terrarium de AWS Terrain Tiles (zoom 12, unos 30 metros por píxel en estas latitudes),
  que en tierra usan el SRTM del Servicio Geológico de los Estados Unidos (USGS), de dominio público. Cubre los dos lados del límite
  con Chile, a diferencia del MDE-Ar del IGN, que llega hasta el límite.
  Las alturas van como enteros sin signo de 16 bits (la altura menos la mínima del recuadro), en base64: 51 KB por cumbre en lugar de
  128 KB en texto. Con ellas, los contornos de los glaciares del Inventario Nacional de Glaciares (IANIGLA) que caen en el recuadro,
  del servicio WFS del inventario, en coordenadas de la grilla: el segundo inventario (Andes Desérticos, imágenes de 2020 y 2021) donde
  existe y el primero (imágenes de 2009 y 2010) en el resto. El inventario cubre solo el lado argentino del límite.

Uso: python scripts/cumbres_relieve.py
"""
import base64
import csv
import html
import io
import json
import math
import re
import struct
import tempfile
import time
import unicodedata
import urllib.request
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
MANUAL = RAIZ / "datos" / "manual"
URL_IGN = "https://www.ign.gob.ar/NuestrasActividades/Geografia/DatosArgentina/MaximasAlturas"
URL_TESELA = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
URL_WFS = "https://maping.glaciaresargentinos.gob.ar:8443/geoserver/ows"
CAPA_ING1, CAPA_ING2 = "glaciares-ING1:glaciares_pais_v12", "glaciares-ING2:glaciares_andes_deserticos_v1"
CAPA_REGION_ING2 = "glaciares-ING2:limite_subcuencas_andes_deserticos_v1"
Z, LADO_KM, N = 12, 12, 160
CACHE = Path(tempfile.gettempdir()) / "datina_terrarium"
AGENTE = {"User-Agent": "Mozilla/5.0 (Datina; datos públicos)"}
CODIGO = {"Buenos Aires": "06", "Catamarca": "10", "Córdoba": "14", "Corrientes": "18", "Chaco": "22", "Chubut": "26", "Entre Ríos": "30",
          "Formosa": "34", "Jujuy": "38", "La Pampa": "42", "La Rioja": "46", "Mendoza": "50", "Misiones": "54", "Neuquén": "58",
          "Río Negro": "62", "Salta": "66", "San Juan": "70", "San Luis": "74", "Santa Cruz": "78", "Santa Fe": "82",
          "Santiago del Estero": "86", "Tucumán": "90", "Tierra del Fuego": "94"}
# el nombre corto del gráfico: sin "Cerro", "Cerro de", "Complejo Volcánico" ni "Volcán", salvo donde el nombre solo no alcanza
PREFIJOS = ("Complejo Volcánico ", "Cerro de ", "Cerro ", "Volcán ")
SIN_CORTAR = {"Cerro Bayo", "Monte Pissis", "Cumbre del Libertador General San Martín"}


def bajar(url):
    for intento in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=AGENTE), timeout=60) as r:
                return r.read()
        except Exception:
            if intento == 3:
                raise
            time.sleep(2 + 3 * intento)


def tabla_ign():
    crudo = bajar(URL_IGN)
    enc = re.search(rb'charset=["\']?([\w-]+)', crudo[:3000])
    s = crudo.decode(enc.group(1).decode() if enc else "utf-8", errors="strict")
    tablas = re.findall(r"<table.*?</table>", s, re.S)
    filas = []
    for t in tablas:
        celdas = [[html.unescape(re.sub(r"<.*?>", "", c)).strip() for c in re.findall(r"<t[dh].*?</t[dh]>", f, re.S)]
                  for f in re.findall(r"<tr.*?</tr>", t, re.S)]
        if celdas and celdas[0][:3] == ["Nombre", "Ubicación", "Altura (m)"] and any("Aconcagua" in c[0] for c in celdas[1:]):
            filas = celdas[1:]
    assert len(filas) >= 10, f"no se encontró la tabla de máximas alturas en {URL_IGN}"
    cumbres = []
    for nombre, prov, alt, coord in filas:
        m = re.fullmatch(r"(\d+)°(\d+)'(\d+)\"S\s+(\d+)°(\d+)'(\d+)\"O", coord.strip())
        assert m, f"coordenadas que no se entienden: {coord!r}"
        g = [int(x) for x in m.groups()]
        lat, lon = -(g[0] + g[1] / 60 + g[2] / 3600), -(g[3] + g[4] / 60 + g[5] / 3600)
        corto = nombre
        if nombre not in SIN_CORTAR:
            for p in PREFIJOS:
                if corto.startswith(p):
                    corto = corto[len(p):]
                    break
        ident = re.sub(r"[^a-z]+", "-", unicodedata.normalize("NFKD", corto.lower()).encode("ascii", "ignore").decode()).strip("-")
        assert prov in CODIGO, f"provincia desconocida: {prov}"
        cumbres.append({"id": ident, "nombre": corto, "nombre_ign": nombre, "provincia": prov, "codigo_indec": CODIGO[prov],
                        "altura_m": int(alt), "lat": round(lat, 5), "lon": round(lon, 5), "coordenadas_ign": coord})
    assert len({c["id"] for c in cumbres}) == len(cumbres), "dos cumbres con el mismo id"
    return sorted(cumbres, key=lambda c: -c["altura_m"])


def merc(lat, lon):
    s = 256 * 2 ** Z
    x = (lon + 180) / 360 * s
    y = (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * s
    return x, y


_teselas = {}


def tesela(tx, ty):
    if (tx, ty) not in _teselas:
        f = CACHE / f"{Z}_{tx}_{ty}.png"
        if not f.exists():
            CACHE.mkdir(parents=True, exist_ok=True)
            f.write_bytes(bajar(URL_TESELA.format(z=Z, x=tx, y=ty)))
        _teselas[(tx, ty)] = Image.open(io.BytesIO(f.read_bytes())).convert("RGB").load()
    return _teselas[(tx, ty)]


def altura(lat, lon):
    """Altura en metros en un punto, con interpolación bilineal entre los cuatro píxeles más cercanos."""
    x, y = merc(lat, lon)
    x0, y0 = math.floor(x - 0.5), math.floor(y - 0.5)
    fx, fy = x - 0.5 - x0, y - 0.5 - y0
    v = 0.0
    for dx, dy, w in ((0, 0, (1 - fx) * (1 - fy)), (1, 0, fx * (1 - fy)), (0, 1, (1 - fx) * fy), (1, 1, fx * fy)):
        px, py = x0 + dx, y0 + dy
        r, g, b = tesela(px // 256, py // 256)[px % 256, py % 256]
        v += w * (r * 256 + g + b / 256 - 32768)
    return v


def grilla(c):
    m_lat, m_lon = 111320.0, 111320.0 * math.cos(math.radians(c["lat"]))
    z = []
    for j in range(N):          # de norte a sur
        for i in range(N):      # de oeste a este
            dy = (0.5 - (j + 0.5) / N) * LADO_KM * 1000
            dx = ((i + 0.5) / N - 0.5) * LADO_KM * 1000
            z.append(round(altura(c["lat"] + dy / m_lat, c["lon"] + dx / m_lon)))
    lo, hi = min(z), max(z)
    assert 0 < lo and hi < 7000, f"{c['id']}: alturas fuera de lo esperable ({lo} a {hi})"
    datos = base64.b64encode(struct.pack(f"<{N * N}H", *(v - lo for v in z))).decode()
    return {"id": c["id"], "lat": c["lat"], "lon": c["lon"], "lado_km": LADO_KM, "n": N, "min": lo, "max": hi, "z": datos}


def wfs(capa, bbox=None):
    """Las entidades de una capa del WFS del Inventario Nacional de Glaciares, en longitud y latitud, controlando que lleguen todas."""
    u = (f"{URL_WFS}?service=WFS&version=1.1.0&request=GetFeature&typeName={capa}&outputFormat=application/json&srsName=EPSG:4326"
         + (f"&bbox={bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]},EPSG:4326" if bbox else ""))
    d = json.loads(bajar(u))
    assert d.get("numberMatched") in (None, len(d["features"])), f"{capa}: llegaron {len(d['features'])} de {d.get('numberMatched')}"
    return d["features"]


def adentro(lon, lat, geom):
    """Si un punto cae dentro de un (Multi)Polygon en longitud y latitud (par e impar: los huecos cuentan)."""
    pols = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
    dentro = False
    for pol in pols:
        for anillo in pol:
            for (x1, y1), (x2, y2) in zip(anillo, anillo[1:] + anillo[:1]):
                if (y1 > lat) != (y2 > lat) and lon < x1 + (lat - y1) * (x2 - x1) / (y2 - y1):
                    dentro = not dentro
    return dentro


def glaciares(c, region_ing2):
    """Los glaciares del recuadro de una cumbre, en coordenadas de la grilla (0 a N, de oeste a este y de norte a sur).
    Donde hay segundo inventario (ING2, Andes Desérticos, imágenes de 2020 y 2021) va ese, y el primero (ING1, imágenes de 2009 y 2010)
    solo afuera de su región: las dos capas cubren los mismos glaciares con fechas distintas y juntas los duplicarían."""
    m_lat, m_lon = 111320.0, 111320.0 * math.cos(math.radians(c["lat"]))
    mlat, mlon = LADO_KM * 1000 / 2 / m_lat * 1.02, LADO_KM * 1000 / 2 / m_lon * 1.02
    bbox = (c["lon"] - mlon, c["lat"] - mlat, c["lon"] + mlon, c["lat"] + mlat)
    nuevos = wfs(CAPA_ING2, bbox)
    viejos = [f for f in wfs(CAPA_ING1, bbox)
              if not adentro(float(f["properties"]["Longitud"] or 0) or f["geometry"]["coordinates"][0][0][0][0],
                             float(f["properties"]["Latitud"] or 0) or f["geometry"]["coordinates"][0][0][0][1], region_ing2)]
    a_grilla = lambda lon, lat: (((lon - c["lon"]) * m_lon / 1000 / LADO_KM + .5) * N, (.5 - (lat - c["lat"]) * m_lat / 1000 / LADO_KM) * N)
    poligonos, anios, inventarios = [], set(), set()
    for capa, fs in (("ING2", nuevos), ("ING1", viejos)):
        for f in fs:
            # "ND" (solo en ING2) no está en la leyenda del inventario y trae la superficie, las alturas y el centro en cero: no describe
            # hielo de hoy y no se dibuja. "GE" (glaciar de escombros, sin decir si activo o inactivo) sí
            if f["properties"].get("Tipo_Glaci") == "ND":
                continue
            g = f["geometry"]
            for pol in (g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]):
                anillos = []
                for anillo in pol:
                    pts = []
                    for lon, lat in anillo:
                        x, y = a_grilla(lon, lat)
                        if not pts or abs(x - pts[-1][0]) + abs(y - pts[-1][1]) >= .3:   # un punto cada 20 metros alcanza
                            pts.append([round(x, 1), round(y, 1)])
                    if len(pts) >= 3:
                        anillos.append(pts)
                if anillos and any(-1 <= x <= N + 1 and -1 <= y <= N + 1 for x, y in anillos[0]):
                    poligonos.append(anillos)
                    inventarios.add(capa)
                    if f["properties"].get("Fecha_Imag"):
                        anios.add(int(str(f["properties"]["Fecha_Imag"])[:4]))
    return poligonos, sorted(inventarios), sorted(anios)


def main():
    cumbres = tabla_ign()
    region_ing2 = wfs(CAPA_REGION_ING2)[0]["geometry"]
    cols = ["id", "nombre", "nombre_ign", "provincia", "codigo_indec", "altura_m", "lat", "lon", "coordenadas_ign"]
    with open(MANUAL / "cumbres_ign.csv", "w", encoding="utf-8", newline="\n") as f:
        w = csv.DictWriter(f, fieldnames=cols, lineterminator="\n")
        w.writeheader()
        w.writerows(cumbres)
    (MANUAL / "relieve").mkdir(exist_ok=True)
    for c in cumbres:
        g = grilla(c)
        g["glaciares"], g["inventarios"], g["anios_imagenes"] = glaciares(c, region_ing2)
        (MANUAL / "relieve" / f"{c['id']}.json").write_text(json.dumps(g, separators=(",", ":")), encoding="utf-8", newline="\n")
        print(f"{c['nombre']:<45} {c['altura_m']:>5} m (IGN)  modelo: {g['min']} a {g['max']} m  glaciares: {len(g['glaciares'])} "
              f"({'+'.join(g['inventarios']) or '-'}, {'-'.join(map(str, g['anios_imagenes'])) or '-'})")
    print(f"{len(cumbres)} cumbres, {len(_teselas)} teselas")


if __name__ == "__main__":
    main()
