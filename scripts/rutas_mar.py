"""Los recorridos por mar de la herramienta de rutas comerciales (23 de noviembre de 2026, docs/roadmap/RUTAS_COMERCIALES.md).

Calcula, una sola vez, el camino más corto por mar de cada puerto argentino de salida (las salidas por barco de
datos/manual/rutas_salidas.csv) a cada puerto de destino (datos/manual/rutas_destinos.csv), sobre la red marítima de
Eurostat (MARNET) con la biblioteca searoute, y lo guarda simplificado en datos/manual/rutas_mar.json: para cada par,
los kilómetros y la línea con un punto cada tanto, en grados con dos decimales. Es una simulación: el barco real puede
hacer escalas o ir por otro camino, y la página lo dice.

searoute no es parte del proyecto: se instala aparte, en un entorno propio (en Python 3.13 de Debian no compila con el
setuptools del sistema):
    python -m venv ../rutas-venv && ../rutas-venv/bin/pip install --upgrade pip setuptools wheel searoute
Uso, con ese Python:
    ../rutas-venv/bin/python scripts/rutas_mar.py
"""
import csv
import json
import math
import pathlib

import searoute as sr

RAIZ = pathlib.Path(__file__).resolve().parent.parent
MANUAL = RAIZ / "datos" / "manual"

# los puertos argentinos de salida por barco: su ubicación (longitud, latitud), tomada del centro de cada puerto. Las demás
# salidas de rutas_salidas.csv (camión, ducto, línea, avión) no van por mar
SALIDAS = {
    "Gran Rosario": (-60.64, -32.95),
    "Bahía Blanca": (-62.27, -38.79),
    "Buenos Aires": (-58.37, -34.60),
    "Zárate-Campana": (-59.03, -34.10),
    "Puerto Madryn": (-65.03, -42.77),
    "San Antonio Este": (-64.88, -40.80),
    "Caleta Córdova/Olivia": (-67.37, -45.75),
    "Quequén": (-58.70, -38.57),
    "Puerto Deseado": (-65.90, -47.75),
    "Mar del Plata": (-57.53, -38.04),
    "Ushuaia": (-68.30, -54.81),
    "Posadas": (-55.89, -27.36),
}
# Tanger Med no está en la lista de puertos de searoute
A_MANO = {"MAPTM": (-5.50, 35.89)}


def ubicaciones():
    puertos = json.loads((pathlib.Path(sr.__file__).parent / "data" / "ports.geojson").read_text(encoding="utf-8"))["features"]
    por_codigo = {f["properties"]["port"]: tuple(f["geometry"]["coordinates"]) for f in puertos}
    destinos = {}
    with open(MANUAL / "rutas_destinos.csv", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            if not r["locode"]:
                continue
            lugar = A_MANO.get(r["locode"]) or por_codigo.get(r["codigo_searoute"])
            assert lugar, f"{r['pais_cod']}: no hay ubicación para {r['codigo_searoute']}"
            destinos[r["pais_cod"]] = (r["puerto"], lugar)
    return destinos


def simplificar(puntos, tolerancia=0.25):
    """Douglas-Peucker en grados: deja los puntos que se apartan más de la tolerancia de la recta entre sus vecinos."""
    if len(puntos) < 3:
        return puntos
    (x1, y1), (x2, y2) = puntos[0], puntos[-1]
    largo = math.hypot(x2 - x1, y2 - y1) or 1e-9
    distancias = [abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) / largo for x, y in puntos[1:-1]]
    i = max(range(len(distancias)), key=distancias.__getitem__)
    if distancias[i] <= tolerancia:
        return [puntos[0], puntos[-1]]
    return simplificar(puntos[: i + 2], tolerancia)[:-1] + simplificar(puntos[i + 1:], tolerancia)


def densificar(puntos, paso=4.0):
    """Agrega puntos en línea recta (en grados) para que ningún tramo pase de `paso` grados: un mapa dibuja los tramos largos
    como arcos de círculo máximo, y entre dos puntos lejanos el arco se iba hacia los polos"""
    salida = [puntos[0]]
    for (x1, y1), (x2, y2) in zip(puntos, puntos[1:]):
        n = max(1, math.ceil(max(abs(x2 - x1), abs(y2 - y1)) / paso))
        salida += [(round(x1 + (x2 - x1) * k / n, 2), round(y1 + (y2 - y1) * k / n, 2)) for k in range(1, n + 1)]
    return salida


def main():
    destinos = ubicaciones()
    rutas = {}
    for salida, origen in SALIDAS.items():
        for pais, (puerto, lugar) in destinos.items():
            r = sr.searoute(list(origen), list(lugar), units="km", append_orig_dest=True)
            linea = [(round(x, 2), round(y, 2)) for x, y in r["geometry"]["coordinates"]]
            rutas[f"{salida}|{pais}"] = {"km": round(r["properties"]["length"]), "linea": densificar(simplificar(linea, 0.15))}
    salida = {"fuente": "searoute 1.6 (red MARNET de Eurostat), calculado una vez", "salidas": SALIDAS,
              "destinos": {p: {"puerto": n, "lugar": l} for p, (n, l) in destinos.items()}, "rutas": rutas}
    (MANUAL / "rutas_mar.json").write_text(json.dumps(salida, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8", newline="\n")
    puntos = sum(len(v["linea"]) for v in rutas.values())
    print(f"rutas_mar.json: {len(rutas)} recorridos, {puntos} puntos, {(MANUAL / 'rutas_mar.json').stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
