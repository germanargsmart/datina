"""Los datos de la herramienta de rutas comerciales (rutas.html, 23 de noviembre de 2026, docs/roadmap/RUTAS_COMERCIALES.md).

03_construir_sitio.py lo llama en cada armado: une la tabla que publica 02 (sitio/datos/rutas_exportaciones.csv, lo exportado en el último año completo
por subrubro y país, con la salida, el modo y el destino de cada fila) con los recorridos por mar que calculó una vez scripts/rutas_mar.py
(datos/manual/rutas_mar.json), y escribe sitio/datos/rutas.json, lo único que baja scripts/rutas.js. Solo van las líneas que usa alguna fila.

Por tierra la línea va de la salida (si es un puerto) al paso de frontera y de ahí al destino, y en avión, del aeropuerto al destino, en línea recta:
el mapa la dibuja como el camino más corto sobre la Tierra. Las ubicaciones de los pasos, los aeropuertos y los destinos sin puerto están acá abajo.

Desde el 26 de noviembre de 2026 (pedido del autor) también las importaciones (sitio/datos/rutas_importaciones.csv a rutas_imp.json), con el camino al
revés: del puerto del país que vende (o de su ciudad principal, por tierra, pasando por el paso de frontera) al puerto argentino de entrada, y los servicios
(rutas_servicios.csv a rutas_ser.json), que no tienen camino: la página pinta los países. Los tres JSON tienen la misma forma, y rutas.js los lee igual.
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
# el número ISO de cada país de destino, con el que viene en el mapa del mundo (world-atlas): el mapa pinta los que compran (25 de noviembre de 2026)
ISO_NUM = {"AU": "036", "BD": "050", "BO": "068", "BR": "076", "CA": "124", "CH": "756", "CL": "152", "CN": "156", "CO": "170", "DE": "276", "DO": "214",
           "DZ": "012", "EC": "218", "EG": "818", "ES": "724", "FR": "250", "GB": "826", "ID": "360", "IE": "372", "IL": "376", "IN": "356", "IT": "380",
           "JO": "400", "KR": "410", "MA": "504", "MX": "484", "MY": "458", "NL": "528", "PE": "604", "PH": "608", "PL": "616", "PY": "600", "RU": "643",
           "SA": "682", "TH": "764", "TR": "792", "US": "840", "UY": "858", "VE": "862", "VN": "704"}
# y el de los demás países que compran o venden más (para pintarlos en el mapa: los servicios no tienen camino y llegan a casi 150 países)
ISO_NUM |= {"AE": "784", "AT": "040", "BE": "056", "BG": "100", "CR": "188", "CU": "192", "CZ": "203", "DK": "208", "FI": "246", "GR": "300", "GT": "320",
            "HK": "344", "HN": "340", "HU": "348", "IR": "364", "IS": "352", "JP": "392", "KE": "404", "KW": "414", "LU": "442", "NG": "566", "NI": "558",
            "NO": "578", "NZ": "554", "OM": "512", "PA": "591", "PK": "586", "PR": "630", "PT": "620", "QA": "634", "RO": "642", "SE": "752", "SG": "702",
            "SK": "703", "SV": "222", "TN": "788", "TT": "780", "TW": "158", "UA": "804", "ZA": "710", "AO": "024", "CM": "120", "CI": "384", "GH": "288",
            "SN": "686", "TZ": "834", "ET": "231", "LB": "422", "IQ": "368", "KZ": "398", "UZ": "860", "BY": "112", "HR": "191", "SI": "705", "RS": "688",
            "LT": "440", "LV": "428", "EE": "233", "CY": "196", "MT": "470", "JM": "388", "HT": "332", "BS": "044", "BB": "052", "GY": "328", "SR": "740",
            "BZ": "084", "MN": "496", "NP": "524", "LK": "144", "MM": "104", "KH": "116", "LA": "418", "BN": "096", "GE": "268", "AM": "051", "AZ": "031",
            "LY": "434", "SD": "729", "MZ": "508", "ZM": "894", "ZW": "716", "BW": "072", "NA": "516", "MG": "450", "UG": "800", "CD": "180", "CG": "178",
            "GA": "266", "GQ": "226", "BJ": "204", "TG": "768", "ML": "466", "BF": "854", "NE": "562", "TD": "148", "MR": "478", "SY": "760", "YE": "887",
            "AF": "004", "AL": "008", "BA": "070", "MK": "807", "ME": "499", "MD": "498", "KG": "417", "TJ": "762", "TM": "795", "PG": "598", "FJ": "242"}
BANDERAS = RAIZ / "scripts" / "banderas_paises"
NOMBRE_RUBRO = {"pp": "Productos primarios", "moa": "Manufacturas de origen agropecuario", "moi": "Manufacturas de origen industrial",
                "ce": "Combustibles y energía", "otro": "Sin rubro informado"}
# los grupos de lo importado (de las categorías económicas o de los usos) y de los servicios: los botones de arriba de la página, en este orden
NOMBRE_GRUPO_IMP = {"ali": "Alimentos", "ins": "Insumos", "ene": "Energía", "maq": "Maquinaria", "tra": "Vehículos", "con": "Consumo", "otro": "Sin categoría informada"}
NOMBRE_GRUPO_SER = {"via": "Viajes", "tra": "Transporte", "con": "Conocimiento", "otro": "Otros"}


def arco(a, b, n=48):
    """El camino más corto sobre la Tierra entre a y b (longitud, latitud), con n tramos: el mapa de MapLibre (24 de noviembre de 2026) une los
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


def sin_vueltas(linea):
    """Saca los picos de ida y vuelta: frente al cabo de Buena Esperanza la red marítima da 22, 20 y otra vez 22 grados, y en el mapa era una mancha"""
    puntos = [list(p) for p in linea]
    i = 1
    while i < len(puntos) - 1:
        if puntos[i - 1] == puntos[i + 1]:
            del puntos[i:i + 2]
        else:
            i += 1
    return puntos


# las columnas de cada tabla, con los nombres de la de exportaciones
COLUMNAS = {"exp": {}, "imp": {"subrubro_cod": "categoria_cod", "subrubro": "categoria", "rubro": "grupo", "millones_usd": "millones_usd_cif", "salida": "entrada",
                               "destino": "origen"},
            "ser": {"subrubro_cod": "tipo_cod", "subrubro": "tipo", "rubro": "grupo"}}


def armar(tabla, destino, anio, flujo="exp"):
    """Lee la tabla publicada (tabla), del año anio, y escribe el JSON de la herramienta (destino). flujo: "exp" (exportaciones de bienes), "imp"
    (importaciones, con el camino al revés) o "ser" (servicios, sin camino). Devuelve un resumen para el registro de 03"""
    mar = json.loads((MANUAL / "rutas_mar.json").read_text(encoding="utf-8"))
    with open(tabla, encoding="utf-8") as f:
        filas = [{k: r.get(COLUMNAS[flujo].get(k, k), "") for k in ("anio", "pais_cod", "pais", "subrubro_cod", "subrubro", "rubro", "millones_usd", "salida",
                                                                         "modo", "destino")} for r in csv.DictReader(f)]
    assert filas, f"{tabla.name} está vacía"
    lugar = {p: tuple(d["lugar"]) for p, d in mar["destinos"].items()} | SIN_PUERTO
    puertos = {s: tuple(x) for s, x in mar["salidas"].items()}
    # cada camino (país, producto, salida, modo y destino) va una sola vez, y cada año solo lleva cuánto pasó por cada uno (desde el 24 de noviembre
    # de 2026, con el filtro por año): once años pesan poco más que uno
    caminos, indice, lineas, kms, subrubros, paises, valores = [], {}, {}, {}, {}, {}, {}
    for r in filas:
        v = round(float(r["millones_usd"]), 1)
        if v <= 0:
            continue
        if r["subrubro_cod"]:
            subrubros[r["subrubro_cod"]] = [r["subrubro"], r["rubro"]]
        paises[r["pais_cod"]] = r["pais"]
        clave, modo = "", r["modo"]
        # lo importado hace el camino al revés: la línea empieza en el país que vende (y los barcos, camiones y aviones van hacia la Argentina)
        vuelta = (lambda l: l[::-1]) if flujo == "imp" else (lambda l: l)
        if modo == "mar":
            clave = f"{r['salida']}|{r['pais_cod']}"
            assert clave in mar["rutas"], f"rutas_mar.json no tiene el recorrido {clave}: correr scripts/rutas_mar.py"
            lineas[clave] = vuelta(sin_vueltas(mar["rutas"][clave]["linea"]))
            kms[clave] = round(mar["rutas"][clave]["km"])
        elif modo == "tierra":
            assert r["destino"] in PASOS, f"rutas_sitio.py no tiene la ubicación del paso {r['destino']}"
            clave = f"{r['salida']}|{r['destino']}|{r['pais_cod']}"
            lineas[clave] = vuelta([list(p) for p in ([puertos[r["salida"]]] if r["salida"] in puertos else []) + [PASOS[r["destino"]], lugar[r["pais_cod"]]]])
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
    assert con_camino <= set(ISO_NUM), f"rutas_sitio.py no tiene el número ISO de {sorted(con_camino - set(ISO_NUM))}"
    rubros = {"exp": NOMBRE_RUBRO, "imp": NOMBRE_GRUPO_IMP, "ser": NOMBRE_GRUPO_SER}[flujo]
    con_dato = {p for p in paises if p in ISO_NUM}
    salida = {"flujo": flujo, "anio": anio, "anios": sorted(int(a) for a in valores), "rubros": {k: n for k, n in rubros.items() if any(s[1] == k for s in subrubros.values())},
              "subrubros": dict(sorted(subrubros.items(), key=lambda x: (len(x[0]), x[0]))),
              "paises": dict(sorted(paises.items())),
              # dónde termina cada país en el mapa (su puerto o su ciudad principal) y cómo se llama ese lugar, para los nodos de llegada, los
              # nombres de los destinos y el acercamiento a un país
              # (los servicios no tienen camino: llevan el lugar de los países que lo tienen, para su bandera en el mapa)
              "lugares": {p: list(lugar[p]) for p in sorted(con_camino | ({p for p in paises if p in lugar} if flujo == "ser" else set()))},
              "puertos": {p: d["puerto"] for p, d in sorted(mar["destinos"].items()) if p in con_camino},
              "iso": {p: ISO_NUM[p] for p in sorted(con_camino | con_dato)},
              # las banderas que hay (scripts/banderas_paises, circle-flags 2.8.3, licencia MIT): 03 las copia a sitio/img/paises/
              "banderas": sorted(p for p in paises if (BANDERAS / f"{p.lower()}.svg").exists()),
              "pasos": {n: list(x) for n, x in PASOS.items() if any(c[4] == "tierra" and c[5] == n for c in caminos)},
              "salidas": {s: list(puertos[s]) for s in sorted(usadas)} | {s: list(x) for s, x in AEROPUERTOS.items() if any(c[3] == s for c in caminos)},
              "campos": ["pais_cod", "subrubro_cod", "rubro", "salida", "modo", "destino", "linea"], "caminos": caminos,
              "valores": {a: valores[a] for a in sorted(valores)}, "lineas": lineas, "km": kms}
    destino.write_text(json.dumps(salida, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8", newline="\n")
    return f"{destino.name}: {len(salida['anios'])} años, {len(caminos)} caminos, {sum(map(len, valores.values()))} filas, {len(lineas)} líneas, {destino.stat().st_size // 1024} KB"


def armar_cosecha(tabla, destino, departamentos):
    """Dónde se cosechan los granos (26 de noviembre de 2026): lee la tabla que publica 02 (sitio/datos/rutas_cosecha.csv) y escribe
    sitio/datos/rutas_cosecha.json, que rutas.js baja solo cuando se eligen los cereales o las semillas oleaginosas. Cada departamento con su nombre
    una vez, y por subrubro y año, las toneladas de cada uno. Controla que cada departamento esté en el mapa (departamentos)"""
    with open(tabla, encoding="utf-8") as f:
        filas = list(csv.DictReader(f))
    assert filas, "rutas_cosecha.csv está vacía"
    topo = json.loads(pathlib.Path(departamentos).read_text(encoding="utf-8"))
    en_mapa = {g["properties"]["id"] for g in topo["objects"]["departamentos"]["geometries"]}
    deps, campanias, cosecha = {}, {}, {}
    for r in filas:
        c = r["codigo_dep"]
        # los de la provincia sin departamento (código terminado en 000) no tienen lugar en el mapa
        assert c.endswith("000") or c in en_mapa, f"rutas_cosecha.csv: el departamento {c} ({r['departamento']}) no está en departamentos.topo.json"
        deps[c] = [r["departamento"], r["provincia"]]
        campanias[r["anio"]] = r["campania"]
        cosecha.setdefault(r["subrubro_cod"], {}).setdefault(r["anio"], []).append([c, round(float(r["produccion_t"]))])
    salida = {"campanias": dict(sorted(campanias.items())), "deps": dict(sorted(deps.items())), "cosecha": cosecha}
    destino.write_text(json.dumps(salida, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8", newline="\n")
    return f"rutas_cosecha.json: {len(campanias)} campañas, {len(deps)} departamentos, {destino.stat().st_size // 1024} KB"


if __name__ == "__main__":
    _anio = json.loads((RAIZ / "datos" / "ordenado" / "fichas.json").read_text(encoding="utf-8"))["resumen"]["externo"]["rutas"]["anio"]
    print(armar(RAIZ / "sitio" / "datos" / "rutas_exportaciones.csv", RAIZ / "sitio" / "datos" / "rutas.json", _anio))
    _ext = json.loads((RAIZ / "datos" / "ordenado" / "fichas.json").read_text(encoding="utf-8"))["resumen"]["externo"]
    print(armar(RAIZ / "sitio" / "datos" / "rutas_importaciones.csv", RAIZ / "sitio" / "datos" / "rutas_imp.json", _ext["rutas_imp"]["anio"], "imp"))
    print(armar(RAIZ / "sitio" / "datos" / "rutas_servicios.csv", RAIZ / "sitio" / "datos" / "rutas_ser.json", _ext["rutas_ser"]["anio"], "ser"))
