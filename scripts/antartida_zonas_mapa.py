"""Los polígonos de las zonas protegidas de la Antártida (24 de noviembre de 2026, descarga aprobada por el autor ese día), para dibujarlas en el
mapa de las bases de Naturaleza y ambiente (docs/roadmap/ANTARTIDA.md, "Lo que quedó afuera").

La Secretaría del Tratado Antártico publica los polígonos de las zonas antárticas especialmente protegidas (ZAEP, en inglés ASPA) y de las
especialmente administradas (ZAEA, ASMA) en un shapefile (https://documents.ats.aq/gis/apa_shape_2024.zip, enlazado desde
https://www.ats.aq/e/protected.html), en la proyección estereográfica polar antártica (EPSG:3031: elipsoide WGS 84, latitud verdadera a 71° Sur,
meridiano central 0). Este programa se corre una vez, como antartida_datos.py: baja el archivo a memoria, lee el shapefile sin bibliotecas
externas (polígonos, tipo 5, y su tabla DBF), pasa cada punto a longitud y latitud, simplifica cada contorno (Douglas-Peucker, 1 km) y
guarda solo el resultado en sitio/datos/antartida_zonas.geo.json (que 03 no toca, como antartida.topo.json), un GeoJSON con una figura por zona: tipo (ZAEP o ZAEA), número,
el nombre y los países que la propusieron (en castellano, de datos/manual/antartida_zonas.csv, la lista de la ficha de zonas protegidas), superficie en km² y si es marina.
Avisa qué zonas vigentes de esa lista no tienen polígono (las creadas después de 2024). Si la Secretaría publica otra versión, se cambia ZIP y se vuelve a correr.
Uso: python scripts/antartida_zonas_mapa.py
"""
import csv
import io
import json
import math
import pathlib
import struct
import sys
import urllib.request
import zipfile

RAIZ = pathlib.Path(__file__).resolve().parents[1]
SALIDA = RAIZ / "sitio" / "datos" / "antartida_zonas.geo.json"
LISTA = RAIZ / "datos" / "manual" / "antartida_zonas.csv"
ZIP = "https://documents.ats.aq/gis/apa_shape_2024.zip"
BASE = "APA_shape_2024"
TOLERANCIA = 1000  # metros, en la proyección: en el mapa más cercano (la península, unos 1.500 km en 700 píxeles) un píxel son unos 2 km


def a_lonlat(x, y):
    """EPSG:3031 a longitud y latitud (Snyder, Map Projections: A Working Manual, 1987, fórmulas 21-38 a 21-40 y 7-9, para el polo sur)."""
    a, f = 6378137.0, 1 / 298.257223563
    e = math.sqrt(f * (2 - f))
    fc = math.radians(71)  # latitud verdadera, en valor absoluto
    mc = math.cos(fc) / math.sqrt(1 - (e * math.sin(fc)) ** 2)
    tc = math.tan(math.pi / 4 - fc / 2) / ((1 - e * math.sin(fc)) / (1 + e * math.sin(fc))) ** (e / 2)
    # en el polo sur se usan -x y -y con las fórmulas del norte
    x, y = -x, -y
    rho = math.hypot(x, y)
    t = rho * tc / (a * mc)
    lat = math.pi / 2 - 2 * math.atan(t)
    for _ in range(12):
        lat = math.pi / 2 - 2 * math.atan(t * ((1 - e * math.sin(lat)) / (1 + e * math.sin(lat))) ** (e / 2))
    lon = math.atan2(x, -y)
    return -math.degrees(lon), -math.degrees(lat)


def simplificar(p, tol):
    """Douglas-Peucker sobre una lista de (x, y), sin recursión."""
    if len(p) < 4:
        return p
    marca = [False] * len(p)
    marca[0] = marca[-1] = True
    pila = [(0, len(p) - 1)]
    while pila:
        i, j = pila.pop()
        (x1, y1), (x2, y2) = p[i], p[j]
        dx, dy = x2 - x1, y2 - y1
        largo = math.hypot(dx, dy)
        k, dmax = None, tol
        for m in range(i + 1, j):
            # un contorno cerrado empieza y termina en el mismo punto: ahí la distancia es al punto, no a la recta
            d = abs(dy * (p[m][0] - x1) - dx * (p[m][1] - y1)) / largo if largo else math.hypot(p[m][0] - x1, p[m][1] - y1)
            if d > dmax:
                k, dmax = m, d
        if k is not None:
            marca[k] = True
            pila += [(i, k), (k, j)]
    q = [pt for pt, ok in zip(p, marca) if ok]
    # un contorno más chico que el margen (una isla de pocos metros) quedaría en dos puntos: se prueba con un margen menor, hasta que
    # quede una figura (cuatro puntos con el de cierre)
    return q if len(q) >= 4 or tol < 1 else simplificar(p, tol / 4)


def leer_dbf(b):
    n, largo_cab, largo_reg = struct.unpack("<IHH", b[4:12])
    campos = []
    for i in range(32, largo_cab - 1, 32):
        campos.append((b[i:i + 11].split(b"\0")[0].decode("latin-1"), b[i + 16]))
    filas = []
    for r in range(n):
        reg, p, fila = b[largo_cab + r * largo_reg + 1: largo_cab + (r + 1) * largo_reg], 0, {}
        for nombre, largo in campos:
            fila[nombre] = reg[p:p + largo].decode("utf-8", "replace").strip()
            p += largo
        filas.append(fila)
    return filas


def leer_shp(b):
    assert struct.unpack("<i", b[32:36])[0] == 5, "el shapefile no es de polígonos"
    p, figuras = 100, []
    while p < len(b):
        largo = struct.unpack(">i", b[p + 4:p + 8])[0] * 2
        cont = b[p + 8:p + 8 + largo]
        tipo = struct.unpack("<i", cont[:4])[0]
        if tipo == 0:
            figuras.append([])
        else:
            assert tipo == 5, f"figura de tipo {tipo}"
            n_partes, n_puntos = struct.unpack("<ii", cont[36:44])
            partes = list(struct.unpack(f"<{n_partes}i", cont[44:44 + 4 * n_partes])) + [n_puntos]
            pts = struct.unpack(f"<{2 * n_puntos}d", cont[44 + 4 * n_partes:44 + 4 * n_partes + 16 * n_puntos])
            pts = list(zip(pts[0::2], pts[1::2]))
            figuras.append([pts[partes[i]:partes[i + 1]] for i in range(n_partes)])
        p += 8 + largo
    return figuras


def main():
    req = urllib.request.Request(ZIP, headers={"User-Agent": "Mozilla/5.0 (argentina-en-datos)"})
    with urllib.request.urlopen(req, timeout=300) as r:
        z = zipfile.ZipFile(io.BytesIO(r.read()))
    with LISTA.open(encoding="utf-8") as fh:
        lista = {(r["tipo"], int(r["numero"])): r for r in csv.DictReader(fh) if r["tipo"] in ("ZAEP", "ZAEA")}
    filas = leer_dbf(z.read(BASE + ".dbf"))
    figuras = leer_shp(z.read(BASE + ".shp"))
    assert len(filas) == len(figuras), "el shapefile y su tabla no tienen la misma cantidad de figuras"
    salida, puntos_antes, puntos_despues = [], 0, 0
    for f, partes in zip(filas, figuras):
        anillos = []
        for anillo in partes:
            puntos_antes += len(anillo)
            s = simplificar(anillo, TOLERANCIA)
            puntos_despues += len(s)
            anillos.append([[round(c, 3) for c in a_lonlat(x, y)] for x, y in s])
        tipo = {"ASPA": "ZAEP", "ASMA": "ZAEA"}.get(f["Tipo_apa"])
        assert tipo, f"tipo de zona desconocido: {f['Tipo_apa']}"
        salida.append({"type": "Feature", "properties": {
            "tipo": tipo, "numero": int(float(f["Numero_apa"])), "nombre": f["Name"],
            "km2": round(float(f["Area_km"]), 2), "marina": f["Marine"] not in ("", "0")},
            # cada parte, un polígono: el shapefile no separa los agujeros, y en estas zonas no los hay
            "geometry": {"type": "MultiPolygon", "coordinates": [[a] for a in anillos]}})
    # una zona puede venir en varias filas (una por isla o sector): se juntan en una figura
    juntas = {}
    for f in salida:
        k = (f["properties"]["tipo"], f["properties"]["numero"])
        if k in juntas:
            juntas[k]["geometry"]["coordinates"] += f["geometry"]["coordinates"]
            juntas[k]["properties"]["km2"] = round(juntas[k]["properties"]["km2"] + f["properties"]["km2"], 2)
        else:
            juntas[k] = f
    zonas = sorted(juntas.values(), key=lambda f: (f["properties"]["tipo"], f["properties"]["numero"]))
    # los países que la propusieron, de la lista en castellano: el shapefile los trae en inglés y con errores ("New Zeland")
    for f in zonas:
        k = (f["properties"]["tipo"], f["properties"]["numero"])
        assert k in lista, f"la zona {k} del shapefile no está en {LISTA.name}"
        f["properties"]["paises"] = lista[k]["propuesto_por"].split("; ")
        # el nombre de la zona entera: el shapefile pone en cada parte el de esa parte ("Western Bransfield Strait - Site A")
        f["properties"]["nombre"] = lista[k]["nombre"]
    # las que la lista da como dadas de baja no van: el mapa muestra lo vigente, como la ficha
    baja = [f"{t} {n}" for t, n in (( f["properties"]["tipo"], f["properties"]["numero"]) for f in zonas) if lista[(t, n)]["vigente"] != "sí"]
    zonas = [f for f in zonas if lista[(f["properties"]["tipo"], f["properties"]["numero"])]["vigente"] == "sí"]
    sin_figura = sorted(k for k, r in lista.items() if r["vigente"] == "sí" and k not in juntas)
    # control: la latitud de toda la Antártida (y de las islas al norte, como las Orcadas y las Shetland del Sur) queda al sur de 55°
    lats = [pt[1] for f in zonas for pol in f["geometry"]["coordinates"] for pt in pol[0]]
    assert -90 <= min(lats) and max(lats) < -55, f"latitudes fuera de la Antártida: {min(lats)} a {max(lats)}"
    SALIDA.write_text(json.dumps({"type": "FeatureCollection", "fuente": ZIP, "features": zonas}, ensure_ascii=False, separators=(",", ":")) + "\n",
                      encoding="utf-8", newline="\n")
    cuenta = {t: sum(1 for f in zonas if f["properties"]["tipo"] == t) for t in ("ZAEP", "ZAEA")}
    print(f"{SALIDA.relative_to(RAIZ)}: {cuenta['ZAEP']} ZAEP y {cuenta['ZAEA']} ZAEA ({len(filas)} figuras), {puntos_antes} puntos y {puntos_despues} "
          f"después de simplificar, {SALIDA.stat().st_size // 1024} KB. Vigentes sin polígono: {', '.join(f'{t} {n}' for t, n in sin_figura) or 'ninguna'}. "
          f"Dadas de baja, que no van: {', '.join(baja) or 'ninguna'}")


if __name__ == "__main__":
    sys.exit(main())
