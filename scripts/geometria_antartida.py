"""
Geometría de los mapas de la Antártida (noviembre de 2026, pedido del autor): la tierra al sur del paralelo 50 Sur y las barreras de hielo, de Natural
Earth a escala 1:50 millones (dominio público, la misma familia que el mundo del mapa de la portada). Se dibuja en datina.js con una proyección
estereográfica centrada en el polo: la de los otros mapas del sitio (Mercator) no llega al polo.
Se corre una sola vez. Guarda sitio/datos/antartida.topo.json, que 03 no toca.
Uso: python scripts/geometria_antartida.py (necesita Node, para mapshaper).
"""
import json
import pathlib
import subprocess
import tempfile
import urllib.request

RAIZ = pathlib.Path(__file__).resolve().parents[1]
SALIDA = RAIZ / "sitio" / "datos" / "antartida.topo.json"
BASE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/"
CAPAS = {"tierra": "ne_50m_land.geojson", "barreras": "ne_50m_antarctic_ice_shelves_polys.geojson"}
# la vista de la Península se acerca unas cinco veces: va con el detalle de la escala 1:10 millones, solo en ese recuadro
DETALLE = {"peninsula": "ne_10m_land.geojson", "peninsula_barreras": "ne_10m_antarctic_ice_shelves_polys.geojson"}
RECUADRO = "-78,-71,-40,-58"
SUR_DE = -50  # alcanza para que se vean Ushuaia y el Atlántico Sur, de referencia


def bajar(nombre):
    pedido = urllib.request.Request(BASE + nombre, headers={"User-Agent": "Mozilla/5.0 (datina.com.ar)"})
    with urllib.request.urlopen(pedido, timeout=120) as r:
        return json.loads(r.read())


def puntos(geom):
    anillos = geom["coordinates"] if geom["type"] == "Polygon" else [a for pol in geom["coordinates"] for a in pol]
    return [p for a in anillos for p in a]


with tempfile.TemporaryDirectory() as tmp:
    rutas = []
    for capa, nombre in CAPAS.items():
        g = bajar(nombre)
        g["features"] = [{"type": "Feature", "properties": {}, "geometry": f["geometry"]} for f in g["features"]
                         if any(p[1] < SUR_DE for p in puntos(f["geometry"]))]
        assert g["features"], f"{capa}: no quedó nada"
        ruta = pathlib.Path(tmp) / f"{capa}.geojson"
        ruta.write_text(json.dumps(g), encoding="utf-8")
        rutas.append(str(ruta))
    subprocess.run(["npx", "--yes", "mapshaper", "-i", *rutas, "combine-files", "snap", "-clip", f"bbox=-180,-90,180,{SUR_DE}", "target=*",
                    "-o", "format=geojson", "target=*", str(pathlib.Path(tmp)) + "/"], check=True, shell=True)
    rutas_d = []
    for capa, nombre in DETALLE.items():
        g = bajar(nombre)
        g["features"] = [{"type": "Feature", "properties": {}, "geometry": f["geometry"]} for f in g["features"] if any(-78 < p[0] < -40 and -71 < p[1] < -58 for p in puntos(f["geometry"]))]
        assert g["features"], f"{capa}: no quedó nada"
        ruta = pathlib.Path(tmp) / f"{capa}.geojson"
        ruta.write_text(json.dumps(g), encoding="utf-8")
        subprocess.run(["npx", "--yes", "mapshaper", str(ruta), "snap", "-clip", f"bbox={RECUADRO}", "-simplify", "40%", "keep-shapes", "-filter-slivers", "min-area=2km2", "-o", "format=geojson", "force", str(ruta)], check=True, shell=True)
        rutas_d.append(str(ruta))
    subprocess.run(["npx", "--yes", "mapshaper", "-i", *rutas, *rutas_d, "combine-files", "-o", "format=topojson", "quantization=1e5", "target=*", str(SALIDA)], check=True, shell=True)
t = json.loads(SALIDA.read_text(encoding="utf-8"))
assert set(t["objects"]) == set(CAPAS) | set(DETALLE), f"capas inesperadas: {list(t['objects'])}"
print(f"Listo: {SALIDA.stat().st_size / 1024:.0f} KB, {len(t['arcs'])} arcos")
