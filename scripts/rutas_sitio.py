"""Los datos de la herramienta de rutas comerciales (rutas.html, 23 de noviembre de 2026, docs/roadmap/RUTAS_COMERCIALES.md).

03_construir_sitio.py lo llama en cada armado: une la tabla que publica 02 (sitio/datos/rutas_exportaciones.csv, lo exportado en el último año completo
por subrubro y país, con la salida, el modo y el destino de cada fila) con los recorridos por mar que calculó una vez scripts/rutas_mar.py
(datos/manual/rutas_mar.json), y escribe sitio/datos/rutas.json, lo único que baja scripts/rutas.js. Solo van las líneas que usa alguna fila.

Por tierra la línea va de la salida (si es un puerto) al paso de frontera y de ahí al destino, y en avión, del aeropuerto al destino, en línea recta:
el mapa la dibuja como el camino más corto sobre la Tierra. Las ubicaciones de los pasos, los aeropuertos y los destinos sin puerto están acá abajo.
"""
import csv
import json
import math
import pathlib

RAIZ = pathlib.Path(__file__).resolve().parent.parent
MANUAL = RAIZ / "datos" / "manual"

# (longitud, latitud), del centro de cada lugar
PASOS = {"Paso de los Libres–Uruguaiana": (-57.09, -29.71), "Cristo Redentor": (-70.07, -32.82), "Gualeguaychú–Fray Bentos": (-58.27, -33.10),
         "Clorinda–Puerto Falcón": (-57.72, -25.29), "Salvador Mazza–Yacuiba": (-63.67, -22.03)}
AEROPUERTOS = {"Ezeiza (avión)": (-58.54, -34.82)}
# los países de la tabla de destinos sin puerto: su ciudad principal (Suiza, el aeropuerto de Zúrich, adonde va el oro)
SIN_PUERTO = {"CH": (8.55, 47.46), "PY": (-57.58, -25.28), "BO": (-63.18, -17.78)}
NOMBRE_RUBRO = {"pp": "Productos primarios", "moa": "Manufacturas de origen agropecuario", "moi": "Manufacturas de origen industrial",
                "ce": "Combustibles y energía", "otro": "Sin rubro informado"}


def arco(a, b, n=48):
    """El camino más corto sobre la Tierra entre a y b (longitud, latitud), con n tramos: el mapa de MapLibre (25 de noviembre de 2026) une los
    puntos en línea recta sobre su proyección, así que el avión necesita el arco ya calculado"""
    rad = math.radians
    (l1, f1), (l2, f2) = [(rad(x), rad(y)) for x, y in (a, b)]
    v1 = (math.cos(f1) * math.cos(l1), math.cos(f1) * math.sin(l1), math.sin(f1))
    v2 = (math.cos(f2) * math.cos(l2), math.cos(f2) * math.sin(l2), math.sin(f2))
    w = math.acos(max(-1, min(1, sum(x * y for x, y in zip(v1, v2)))))
    puntos = []
    for i in range(n + 1):
        t = i / n
        k1, k2 = (math.sin((1 - t) * w) / math.sin(w), math.sin(t * w) / math.sin(w)) if w else (1 - t, t)
        x, y, z = (k1 * p + k2 * q for p, q in zip(v1, v2))
        lon = math.degrees(math.atan2(y, x))
        # sin saltos en el antimeridiano: la longitud sigue de largo (hacia Australia por el Pacífico pasa de -180), y el mapa la dibuja seguida
        if puntos:
            lon += 360 * round((puntos[-1][0] - lon) / 360)
        puntos.append([round(lon, 2), round(math.degrees(math.atan2(z, math.hypot(x, y))), 2)])
    return puntos


def armar(tabla, destino, anio):
    """Lee la tabla publicada (tabla), del año anio, y escribe el JSON de la herramienta (destino). Devuelve un resumen para el registro de 03"""
    mar = json.loads((MANUAL / "rutas_mar.json").read_text(encoding="utf-8"))
    with open(tabla, encoding="utf-8") as f:
        filas = list(csv.DictReader(f))
    assert filas, "rutas_exportaciones.csv está vacía"
    lugar = {p: tuple(d["lugar"]) for p, d in mar["destinos"].items()} | SIN_PUERTO
    puertos = {s: tuple(x) for s, x in mar["salidas"].items()}
    # cada camino (país, producto, salida, modo y destino) va una sola vez, y cada año solo lleva cuánto pasó por cada uno (desde el 24 de noviembre
    # de 2026, con el filtro por año): once años pesan poco más que uno
    caminos, indice, lineas, subrubros, paises, valores = [], {}, {}, {}, {}, {}
    for r in filas:
        v = round(float(r["millones_usd"]), 1)
        if v <= 0:
            continue
        if r["subrubro_cod"]:
            subrubros[r["subrubro_cod"]] = [r["subrubro"], r["rubro"]]
        paises[r["pais_cod"]] = r["pais"]
        clave, modo = "", r["modo"]
        if modo == "mar":
            clave = f"{r['salida']}|{r['pais_cod']}"
            assert clave in mar["rutas"], f"rutas_mar.json no tiene el recorrido {clave}: correr scripts/rutas_mar.py"
            lineas[clave] = mar["rutas"][clave]["linea"]
        elif modo == "tierra":
            assert r["destino"] in PASOS, f"rutas_sitio.py no tiene la ubicación del paso {r['destino']}"
            clave = f"{r['salida']}|{r['destino']}|{r['pais_cod']}"
            lineas[clave] = [list(p) for p in ([puertos[r["salida"]]] if r["salida"] in puertos else []) + [PASOS[r["destino"]], lugar[r["pais_cod"]]]]
        elif modo == "avión":
            assert r["salida"] in AEROPUERTOS, f"rutas_sitio.py no tiene la ubicación del aeropuerto {r['salida']}"
            clave = f"{r['salida']}|{r['pais_cod']}"
            lineas[clave] = arco(AEROPUERTOS[r["salida"]], lugar[r["pais_cod"]])
        c = (r["pais_cod"], r["subrubro_cod"], r["rubro"], r["salida"], modo, r["destino"], clave)
        if c not in indice:
            indice[c] = len(caminos)
            caminos.append(list(c))
        valores.setdefault(r["anio"], []).append([indice[c], v])
    assert str(anio) in valores, f"rutas_exportaciones.csv no tiene {anio}, el último año del resumen"
    usadas = {c[3] for c in caminos if c[4] in ("mar", "tierra") and c[3] in puertos}
    # ninguna línea cruza el borde del mapa (el antimeridiano): MapLibre la dibujaría de punta a punta
    for k, linea in lineas.items():
        assert all(abs(b[0] - a[0]) < 180 for a, b in zip(linea, linea[1:])), f"la línea {k} cruza el antimeridiano"
    con_camino = {c[0] for c in caminos if c[4]}
    salida = {"anio": anio, "anios": sorted(int(a) for a in valores), "rubros": NOMBRE_RUBRO, "subrubros": dict(sorted(subrubros.items())),
              "paises": dict(sorted(paises.items())),
              # dónde termina cada país en el mapa (su puerto o su ciudad principal) y cómo se llama ese lugar, para los nodos de llegada, los
              # nombres de los destinos y el acercamiento a un país
              "lugares": {p: list(lugar[p]) for p in sorted(con_camino)},
              "puertos": {p: d["puerto"] for p, d in sorted(mar["destinos"].items()) if p in con_camino},
              "pasos": {n: list(x) for n, x in PASOS.items() if any(c[4] == "tierra" and c[5] == n for c in caminos)},
              "salidas": {s: list(puertos[s]) for s in sorted(usadas)} | {s: list(x) for s, x in AEROPUERTOS.items() if any(c[3] == s for c in caminos)},
              "campos": ["pais_cod", "subrubro_cod", "rubro", "salida", "modo", "destino", "linea"], "caminos": caminos,
              "valores": {a: valores[a] for a in sorted(valores)}, "lineas": lineas}
    destino.write_text(json.dumps(salida, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8", newline="\n")
    return f"rutas.json: {len(salida['anios'])} años, {len(caminos)} caminos, {sum(map(len, valores.values()))} filas, {len(lineas)} líneas, {destino.stat().st_size // 1024} KB"


if __name__ == "__main__":
    _anio = json.loads((RAIZ / "datos" / "ordenado" / "fichas.json").read_text(encoding="utf-8"))["resumen"]["externo"]["rutas"]["anio"]
    print(armar(RAIZ / "sitio" / "datos" / "rutas_exportaciones.csv", RAIZ / "sitio" / "datos" / "rutas.json", _anio))
