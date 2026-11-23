"""Los datos de la herramienta de rutas comerciales (rutas.html, 23 de noviembre de 2026, docs/roadmap/RUTAS_COMERCIALES.md).

03_construir_sitio.py lo llama en cada armado: une la tabla que publica 02 (sitio/datos/rutas_exportaciones.csv, lo exportado en el último año completo
por subrubro y país, con la salida, el modo y el destino de cada fila) con los recorridos por mar que calculó una vez scripts/rutas_mar.py
(datos/manual/rutas_mar.json), y escribe sitio/datos/rutas.json, lo único que baja scripts/rutas.js. Solo van las líneas que usa alguna fila.

Por tierra la línea va de la salida (si es un puerto) al paso de frontera y de ahí al destino, y en avión, del aeropuerto al destino, en línea recta:
el mapa la dibuja como el camino más corto sobre la Tierra. Las ubicaciones de los pasos, los aeropuertos y los destinos sin puerto están acá abajo.
"""
import csv
import json
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


def armar(tabla, destino, anio):
    """Lee la tabla publicada (tabla), del año anio, y escribe el JSON de la herramienta (destino). Devuelve un resumen para el registro de 03"""
    mar = json.loads((MANUAL / "rutas_mar.json").read_text(encoding="utf-8"))
    with open(tabla, encoding="utf-8") as f:
        filas = list(csv.DictReader(f))
    assert filas, "rutas_exportaciones.csv está vacía"
    lugar = {p: tuple(d["lugar"]) for p, d in mar["destinos"].items()} | SIN_PUERTO
    puertos = {s: tuple(x) for s, x in mar["salidas"].items()}
    flujos, lineas, subrubros = [], {}, {}
    for r in filas:
        v = round(float(r["millones_usd"]), 1)
        if v <= 0:
            continue
        if r["subrubro_cod"]:
            subrubros[r["subrubro_cod"]] = [r["subrubro"], r["rubro"]]
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
            lineas[clave] = [list(AEROPUERTOS[r["salida"]]), list(lugar[r["pais_cod"]])]
        flujos.append([r["pais_cod"], r["pais"], r["subrubro_cod"], r["rubro"], r["salida"], modo, r["destino"], v, clave])
    usadas = {f[4] for f in flujos if f[5] in ("mar", "tierra") and f[4] in puertos}
    salida = {"anio": anio, "rubros": NOMBRE_RUBRO, "subrubros": dict(sorted(subrubros.items())),
              "salidas": {s: list(puertos[s]) for s in sorted(usadas)} | {s: list(x) for s, x in AEROPUERTOS.items() if any(f[4] == s for f in flujos)},
              "campos": ["pais_cod", "pais", "subrubro_cod", "rubro", "salida", "modo", "destino", "millones_usd", "linea"], "flujos": flujos, "lineas": lineas}
    destino.write_text(json.dumps(salida, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8", newline="\n")
    return f"rutas.json: {len(flujos)} filas, {len(lineas)} líneas, {destino.stat().st_size // 1024} KB"


if __name__ == "__main__":
    _anio = json.loads((RAIZ / "datos" / "ordenado" / "fichas.json").read_text(encoding="utf-8"))["resumen"]["externo"]["rutas"]["anio"]
    print(armar(RAIZ / "sitio" / "datos" / "rutas_exportaciones.csv", RAIZ / "sitio" / "datos" / "rutas.json", _anio))
