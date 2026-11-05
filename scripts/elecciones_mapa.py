"""
El mapa de Elecciones por mesa (pedido del autor del 5 de noviembre de 2026: "mapas coropléticos con colores por cada elección para ver los circuitos").
Une la cartografía de los circuitos con los resultados que armó scripts/elecciones_mesas.py y escribe, sin que 03 lo toque:
  sitio/datos/mesas/geo/{edicion}/{codigo_indec}.topo.json   los circuitos de una jurisdicción, con detalle
  sitio/datos/mesas/geo/pais-{periodo}.topo.json             los circuitos de todo el país, más simples
  sitio/datos/mesas/geo/provincias.topo.json                 las 24 jurisdicciones, para las elecciones que no llegan al circuito
  sitio/datos/mesas/mapa/{eleccion}.json                     una fila por lugar del mapa, con los votos de cada lista
y datos/manual/mesas_geo_fuentes.json, con lo que se bajó y lo que se midió. Se corre una vez por elección nueva. Fuentes, reglas y límites: docs/roadmap/MESAS.md.

Uso: python scripts/elecciones_mapa.py --fuentes CARPETA [--solo-resultados]
     --fuentes guarda lo que baja (unos 150 MB) y lo reutiliza. --solo-resultados no vuelve a dibujar la geometría.
Necesita Node (mapshaper con npx).
"""
import argparse
import collections
import csv
import glob
import hashlib
import html
import json
import math
import os
import pathlib
import re
import shutil
import statistics
import subprocess
import sys
import tempfile
import time
import unicodedata
import urllib.request
import zipfile

RAIZ = pathlib.Path(__file__).resolve().parents[1]
MESAS = RAIZ / "sitio" / "datos" / "mesas"
FUERZAS = RAIZ / "datos" / "manual" / "mesas_fuerzas.json"
CONTROL = RAIZ / "datos" / "manual" / "mesas_geo_fuentes.json"
UA = {"User-Agent": "datina/1.0 (+https://datina.com.ar)"}

INDEC = ["02", "06", "10", "14", "18", "22", "26", "30", "34", "38", "42", "46", "50", "54", "58", "62", "66", "70", "74", "78", "82", "86", "90", "94"]
DE_DISTRITO = {f"{i + 1:02d}": c for i, c in enumerate(INDEC)}   # la Cámara y Galeano numeran 01 CABA, 02 Buenos Aires; Datina usa el código del INDEC
A_DISTRITO = {v: k for k, v in DE_DISTRITO.items()}
ARCHIVO_GALEANO = {"02": "CABA", "06": "PBA", "10": "Catamarca", "14": "Cordoba", "18": "Corrientes", "22": "Chaco", "26": "Chubut", "30": "EntreRios", "34": "Formosa", "38": "Jujuy",
                   "42": "LaPampa", "46": "LaRioja", "50": "Mendoza", "54": "Misiones", "58": "Neuquen", "62": "RioNegro", "66": "Salta", "70": "SanJuan", "74": "SanLuis", "78": "SantaCruz",
                   "82": "SantaFe", "86": "Santiago", "90": "Tucuman", "94": "TdF"}
GALEANO_COMMIT = "50692fd821f825566b0589da2cc1fefdef5fa02f"
GALEANO_ZIP = f"https://codeload.github.com/tartagalensis/circuitos_electorales_AR/zip/{GALEANO_COMMIT}"
SIGE = "https://www.padron.gov.ar/cne_sige/api/download_layer.php?layer=distrito_{d}.circuitos_electorales&format=geojson"
CNE_PAGINA = "https://mapa2.electoral.gov.ar/descargas/"

# Qué cartografía usa cada jurisdicción en cada período. Por defecto la del sigE de la Cámara Nacional Electoral, la más completa: cubre toda la provincia y cuida la georreferencia
# (Galeano corre CABA unos 500 metros en 2025 y Neuquén unos 230 en 2021, medido por 257arg). Las excepciones, cada una medida:
PERIODOS = {"hasta2021": lambda a: a <= 2021, "desde2023": lambda a: a >= 2023}
EDICION = {
    # el sigE rechaza estas tres descargas (403): la misma cartografía, del portal anterior de la Cámara
    "46": {"hasta2021": "cne", "desde2023": "cne"}, "50": {"hasta2021": "cne", "desde2023": "cne"}, "74": {"hasta2021": "cne", "desde2023": "cne"},
    # Santa Fe multiplicó sus códigos por diez en 2023 y la Cámara no trae códigos que se puedan unir: Galeano, un corte para cada numeración
    "82": {"hasta2021": "g21", "desde2023": "g25"},
    # Santa Cruz renumeró en 2023: antes solo Galeano 2021 trae los códigos que usan las mesas
    "78": {"hasta2021": "g21", "desde2023": "cne"},
}
# por debajo de esto, los códigos de la jurisdicción no son los del mapa: en esa elección se pinta sección por sección, que son estables, en vez de arriesgar uniones falsas.
# Pasa en Neuquén hasta 2017, en Río Negro hasta 2013 y en Tierra del Fuego hasta 2021
UNION_MINIMA = 95
INTERVALO_PROVINCIA = 30      # metros de simplificación: a esta escala se distingue cada manzana de un circuito de CABA
INTERVALO_PAIS = 1000

FIJAS = 8   # seccion_id, seccion, circuito, mesa, electores, blancos, nulos, recurridos_impugnados


def norm_circuito(c):
    """Igual que elecciones_mesas.circuito_norm: '0557 ', '000557' y '557' son el mismo circuito, y se conserva la letra. Lo que no es un código ('sindatos', 'S/D') no entra."""
    c = str(c if c is not None else "").strip().upper()
    m = re.match(r"^0*(\d*)\s*([A-Z]*)$", c)
    if not m or not (m.group(1) or m.group(2) or c):
        return None
    if not c:
        return None
    return (m.group(1) or "0") + m.group(2)


def sin_marcas(s):
    s = unicodedata.normalize("NFD", str(s or "").upper())
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^A-Z0-9]", "", s)


def base(c):
    return re.sub(r"[A-Z]+$", "", c)


def arreglar_cne(t):
    """El portal anterior guarda 'Cañuelas' como 'Ca๑uelas': latin-1 leído como cp874."""
    try:
        return t.encode("cp874").decode("latin-1")
    except Exception:
        return t


def bajar(url, destino, espera=0.4):
    if destino.exists() and destino.stat().st_size > 0:
        return True
    destino.parent.mkdir(parents=True, exist_ok=True)
    try:
        r = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=240)
        destino.write_bytes(r.read())
        time.sleep(espera)
        return True
    except Exception as e:
        print("  no se pudo bajar", url.split("?")[0], e)
        return False


def bajar_fuentes(carpeta):
    z = carpeta / "galeano.zip"
    if not bajar(GALEANO_ZIP, z):
        sys.exit("Falta la cartografía de Galeano")
    g = carpeta / "galeano"
    if not g.exists():
        with zipfile.ZipFile(z) as f:
            f.extractall(g, [n for n in f.namelist() if n.endswith(".geojson") and "/data/" not in n])
    for d in DE_DISTRITO:
        bajar(SIGE.format(d=d), carpeta / "sige" / f"{d}.json")
    pagina = carpeta / "cne_descargas.html"
    bajar(CNE_PAGINA, pagina)
    # el enlace de cada descarga lleva una clave pública que cambia: se lee de la página
    t = pagina.read_text(encoding="utf-8", errors="replace")
    for ruta in sorted(set(re.findall(r'href="(/geoserver/wfs[^"]+outputFormat=application%2Fjson)"', t))):
        ruta = html.unescape(ruta)
        n = re.search(r"typeName=descargas:circuito_(\d\d)", ruta)
        if n:
            bajar("https://mapa2.electoral.gov.ar" + ruta, carpeta / "cne" / f"{n.group(1)}.json")


def huella(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def nombres_de_seccion():
    """Para la cartografía que no trae el código de la sección, sino su nombre."""
    out = collections.defaultdict(dict)
    for p in glob.glob(str(MESAS / "*" / "[0-9][0-9].csv")):
        if "circuitos" in p:
            continue
        cod = os.path.basename(p)[:2]
        with open(p, encoding="utf-8", newline="") as f:
            ult = None
            for r in csv.reader(f):
                if r[0] != "seccion_id" and r[1] != ult:
                    out[cod][sin_marcas(r[1])] = r[0]
                    ult = r[1]
    return out


def leer_edicion(fuentes, ed, cod, secciones):
    d = A_DISTRITO[cod]
    if ed in ("g21", "g25"):
        rutas = glob.glob(str(fuentes / "galeano" / "*" / ("20" + ed[1:]) / f"{ARCHIVO_GALEANO[cod]}.geojson"))
    else:
        rutas = [str(fuentes / ed / f"{d}.json")]
    if not rutas or not os.path.exists(rutas[0]):
        return None
    g = json.load(open(rutas[0], encoding="utf-8"))
    out = []
    for x in g["features"]:
        p = x["properties"]
        c = norm_circuito(p.get("circuito"))
        geo = x["geometry"]
        if c is None or not geo:
            continue
        if ed in ("g21", "g25"):
            s = str(p.get("coddepto") or "").lstrip("0")
        elif ed == "sige":
            s = str(p.get("indra_d") or "").lstrip("0")
        else:
            s = secciones[cod].get(sin_marcas(arreglar_cne(p.get("departamen"))), "")
        if cod == "94" and geo["type"] in ("Polygon", "MultiPolygon"):
            # solo la Isla Grande e Isla de los Estados: el sector antártico y las islas del Atlántico Sur no tienen mesas, como en el mapa de departamentos del sitio
            polys = geo["coordinates"] if geo["type"] == "MultiPolygon" else [geo["coordinates"]]
            polys = [q for q in polys if q and q[0] and -69.5 < q[0][0][0] < -63 and -55.7 < q[0][0][1] < -52]
            if not polys:
                continue
            geo = {"type": "MultiPolygon", "coordinates": polys}
        out.append({"type": "Feature", "properties": {"p": cod, "s": s, "c": c}, "geometry": geo})
    return out


def centro(g):
    xs, ys = [], []

    def anillos(geo):
        t = geo["type"]
        if t == "Polygon":
            yield from geo["coordinates"]
        elif t == "MultiPolygon":
            for q in geo["coordinates"]:
                yield from q
        elif t == "GeometryCollection":
            for x in geo["geometries"]:
                yield from anillos(x)
    for a in anillos(g):
        for q in a:
            xs.append(q[0])
            ys.append(q[1])
    return ((min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2) if xs else None


def km(a, b):
    return math.hypot((a[0] - b[0]) * 111.3 * math.cos(math.radians((a[1] + b[1]) / 2)), (a[1] - b[1]) * 111.3)


def resultados_por_circuito(eleccion, cod):
    p = MESAS / eleccion / f"{cod}.csv"
    if not p.exists():
        return None, None
    with open(p, encoding="utf-8", newline="") as f:
        r = csv.reader(f)
        cab = next(r)
        listas = cab[FIJAS:]
        out = {}
        for x in r:
            k = (x[0], x[2])
            v = [int(a) for a in x[FIJAS:]]
            vot = sum(v) + int(x[5]) + int(x[6]) + int(x[7])
            d = out.setdefault(k, {"sn": x[1], "e": 0, "t": 0, "v": [0] * len(listas)})
            if vot > 0:   # igual que la herramienta: la participación cuenta solo las mesas con resultado
                d["e"] += int(x[4])
            d["t"] += vot
            for i, a in enumerate(v):
                d["v"][i] += a
    return listas, out


def unir(res, pols, numeracion_x10=False):
    """Une cada circuito de los resultados con sus polígonos. Devuelve {(s, c) del resultado: [polígonos]} y lo que no encontró.
    El código de la mesa y el del mapa no siempre coinciden, y cada regla es un caso medido: el circuito se dividió con letras (364 y 364A), Río Negro numera sus partes con dos cifras más
    (43 y 4301), Santa Fe multiplicó por diez en 2023 (120, y 121 y 122 si se dividió), y Río Negro y Catamarca juntan lo rural de cada sección en un polígono con código 0."""
    por_s = collections.defaultdict(set)
    por_c = collections.defaultdict(set)
    for s, c in pols:
        por_s[s].add(c)
        por_c[c].add(s)
    veces = collections.Counter(c for _, c in res)
    union, sin = {}, {}
    for (s, c) in res:
        if (s, c) in pols:
            union[(s, c)] = [(s, c)]
            continue
        b = base(c)
        if (s, b) in pols:
            union[(s, c)] = [(s, b)]
            continue
        hijos = [x for x in por_s.get(s, ()) if base(x) == c]
        if hijos:
            union[(s, c)] = [(s, x) for x in hijos]
            continue
        if len(b) >= 2 and b.isdigit():
            partes = [x for x in por_s.get(s, ()) if x.isdigit() and len(x) == len(b) + 2 and x.startswith(b)]
            if partes:
                union[(s, c)] = [(s, x) for x in partes]
                continue
        if numeracion_x10 and b.isdigit():
            fam = int(b) // 10
            parientes = [x for x in por_s.get(s, ()) if base(x).isdigit() and int(base(x)) // 10 == fam]
            if parientes:
                union[(s, c)] = [(s, x) for x in parientes]
                continue
            if (s, str(fam)) in pols:
                union[(s, c)] = [(s, str(fam))]
                continue
        # el circuito figura en otra sección del mapa, y su código no se repite en toda la jurisdicción
        if len(por_c.get(c, ())) == 1 and veces[c] == 1:
            union[(s, c)] = [(next(iter(por_c[c])), c)]
            continue
        if (s, "0") in pols:
            union[(s, c)] = [(s, "0")]
            continue
        sin[(s, c)] = res[(s, c)]
    # el polígono de la división (364A) en una elección que todavía contaba el circuito entero (364): el mismo resultado
    usados = {p for v in union.values() for p in v}
    for (s, c) in pols - usados:
        b = base(c)
        if b != c and (s, b) in union:
            union[(s, b)] = union[(s, b)] + [(s, c)]
    return union, sin


def grupos(union):
    """Un resultado puede repartirse entre varios polígonos y un polígono recibir varios resultados: cada grupo conexo es un lugar del mapa, y sus votos se cuentan una sola vez."""
    padre = {}

    def raiz(x):
        padre.setdefault(x, x)
        while padre[x] != x:
            padre[x] = padre[padre[x]]
            x = padre[x]
        return x
    for r, ps in union.items():
        for p in ps:
            padre[raiz(("r", r))] = raiz(("p", p))
    salida = collections.defaultdict(lambda: ([], []))
    for r, ps in union.items():
        salida[raiz(("r", r))][0].append(r)
        for p in ps:
            if p not in salida[raiz(("r", r))][1]:
                salida[raiz(("r", r))][1].append(p)
    return list(salida.values())


def fila_de(ps, rs, res, listas, indice):
    """[seccion, circuito o circuitos del mapa, electores, votantes, [lista, votos, ...] de mayor a menor, circuitos de los resultados si no son los mismos]"""
    e = sum(res[r]["e"] for r in rs)
    t = sum(res[r]["t"] for r in rs)
    votos = collections.Counter()
    for r in rs:
        for n, v in zip(listas, res[r]["v"]):
            if v:
                votos[n] += v
    pares = []
    for n, v in sorted(votos.items(), key=lambda x: (-x[1], x[0])):
        pares += [indice[n], v]
    secc = ps[0][0]
    if len(ps) == 1:
        circ = ps[0][1]
    elif all(p[0] == secc for p in ps):
        circ = sorted(p[1] for p in ps)
    else:
        circ = sorted(f"{p[0]}|{p[1]}" for p in ps)
    fila = [secc, circ, e, t, pares]
    if sorted(rs) != sorted(ps):
        fila.append([f"{s}|{c}" for s, c in sorted(rs)])
    return fila


def dibujar(entrada, salida, intervalo, disolver):
    """Con snap y -clean no quedan huecos blancos entre vecinos (el aprendizaje de la etapa 19 con las comunas de CABA)."""
    pasos = ["npx", "--yes", "mapshaper@0.6.102", str(entrada), "snap", "-clean", "-simplify", f"interval={intervalo}", "keep-shapes", "-clean", "-dissolve", disolver, "-rename-layers", "circuitos",
             "-o", "format=topojson", "quantization=1e5", str(salida)]
    subprocess.run(pasos, check=True, capture_output=True, text=True, shell=os.name == "nt")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fuentes", required=True)
    ap.add_argument("--solo-resultados", action="store_true")
    args = ap.parse_args()
    fuentes = pathlib.Path(args.fuentes).resolve()
    fuentes.mkdir(parents=True, exist_ok=True)
    bajar_fuentes(fuentes)
    secciones = nombres_de_seccion()
    idx = json.loads((MESAS / "indice.json").read_text(encoding="utf-8"))
    FZ = json.loads(FUERZAS.read_text(encoding="utf-8"))

    ediciones = {}
    usadas = {}
    for cod in INDEC:
        for periodo in PERIODOS:
            ed = EDICION.get(cod, {}).get(periodo, "sige")
            if (ed, cod) not in ediciones:
                f = leer_edicion(fuentes, ed, cod, secciones)
                if not f:
                    sys.exit(f"Falta la cartografía {ed} de {cod}")
                ediciones[(ed, cod)] = f
            usadas[(periodo, cod)] = ed
    pols = {k: {(x["properties"]["s"], x["properties"]["c"]) for x in v} for k, v in ediciones.items()}

    # Control: el mismo código tiene que caer en el mismo lugar que en Galeano, que armó su cartografía con los códigos de las mesas. Si no, el código significa otra cosa
    cruce = {}
    for (ed, cod), f in ediciones.items():
        if ed in ("g21", "g25"):
            continue
        ref = leer_edicion(fuentes, "g25", cod, secciones) or []
        rc = {(x["properties"]["s"], x["properties"]["c"]): centro(x["geometry"]) for x in ref}
        ds = []
        for x in f:
            k = (x["properties"]["s"], x["properties"]["c"])
            a, b = rc.get(k), centro(x["geometry"])
            if a and b:
                ds.append(km(a, b))
        if ds:
            cruce[cod] = {"comunes": len(ds), "mediana_km": round(statistics.median(ds), 2), "a_mas_de_10_km": sum(1 for d in ds if d > 10)}

    # los resultados de cada elección
    (MESAS / "mapa").mkdir(parents=True, exist_ok=True)
    medido = {}
    faltan_fuerza = collections.Counter()
    for el in idx["elecciones"]:
        if el["nivel"] != "mesa":
            continue
        id_ = el["id"]
        periodo = next(k for k, f in PERIODOS.items() if f(el["anio"]))
        provincias, listas_usadas = {}, {}
        for cod in el["provincias"]:
            listas, res = resultados_por_circuito(id_, cod)
            for n in listas:
                listas_usadas.setdefault(n, len(listas_usadas))
            ed = usadas[(periodo, cod)]
            ps = pols[(ed, cod)]
            t_res = {k: v["t"] for k, v in res.items()}
            u, sin = unir(t_res, ps, numeracion_x10=cod == "82" and el["anio"] >= 2023)
            total = sum(t_res.values()) or 1
            union_pct = 100 * (1 - sum(sin.values()) / total)
            filas = []
            if union_pct < UNION_MINIMA:
                # sección por sección: el código de la sección es estable de 2011 a 2025
                nivel = "seccion"
                por_sec_r = collections.defaultdict(list)
                por_sec_p = collections.defaultdict(list)
                for r in res:
                    por_sec_r[r[0]].append(r)
                for p in sorted(ps):
                    por_sec_p[p[0]].append(p)
                en_mapa = 0
                for s, rs in por_sec_r.items():
                    if por_sec_p.get(s):
                        filas.append(fila_de(por_sec_p[s], rs, res, listas, listas_usadas))
                        en_mapa += sum(t_res[r] for r in rs)
                con = 100 * en_mapa / total
            else:
                nivel = "circuito"
                for rs, grupo_ps in grupos(u):
                    filas.append(fila_de(grupo_ps, rs, res, listas, listas_usadas))
                con = union_pct
            filas.sort(key=lambda f: (len(f[0]), f[0], str(f[1])))
            nombres_sec = {}
            for k, v in res.items():
                nombres_sec.setdefault(k[0], v["sn"])
            provincias[cod] = {"ed": ed, "nivel": nivel, "con": round(con, 1), "secciones": nombres_sec, "filas": filas}
            medido.setdefault(id_, {})[cod] = {"edicion": ed, "nivel": nivel, "con_poligono": round(con, 1), "union": round(union_pct, 1)}
        nombres = sorted(listas_usadas, key=listas_usadas.get)
        fuerza_de = []
        presentes = {}
        for n in nombres:
            f = FZ["listas"].get(n)
            if f is None:
                faltan_fuerza[n] += 1
                f = "otras"
            presentes.setdefault(f, len(presentes))
            fuerza_de.append(presentes[f])
        fuerzas = [{"id": k, "n": FZ["fuerzas"][k]["nombre"], "c": FZ["fuerzas"][k]["color"]} for k in presentes]
        doc = {"id": id_, "periodo": periodo, "listas": nombres, "fuerza": fuerza_de, "fuerzas": fuerzas, "provincias": provincias}
        (MESAS / "mapa" / f"{id_}.json").write_text(json.dumps(doc, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8", newline="\n")

    # la geometría
    if not args.solo_resultados:
        with tempfile.TemporaryDirectory() as tmp:
            tmp = pathlib.Path(tmp)
            for (ed, cod), f in ediciones.items():
                destino = MESAS / "geo" / ed
                destino.mkdir(parents=True, exist_ok=True)
                e = tmp / f"{ed}_{cod}.json"
                e.write_text(json.dumps({"type": "FeatureCollection", "features": f}), encoding="utf-8")
                dibujar(e, destino / f"{cod}.topo.json", INTERVALO_PROVINCIA, "p,s,c")
                print("dibujó", ed, cod, (destino / f"{cod}.topo.json").stat().st_size, flush=True)
            for periodo in PERIODOS:
                todos = []
                for cod in INDEC:
                    todos.extend(ediciones[(usadas[(periodo, cod)], cod)])
                e = tmp / f"pais_{periodo}.json"
                e.write_text(json.dumps({"type": "FeatureCollection", "features": todos}), encoding="utf-8")
                dibujar(e, MESAS / "geo" / f"pais-{periodo}.topo.json", INTERVALO_PAIS, "p,s,c")
                print("dibujó país", periodo, (MESAS / "geo" / f"pais-{periodo}.topo.json").stat().st_size, flush=True)
                if periodo == "desde2023":
                    subprocess.run(["npx", "--yes", "mapshaper@0.6.102", str(MESAS / "geo" / f"pais-{periodo}.topo.json"), "-dissolve", "p", "-simplify", "interval=3000", "keep-shapes", "-rename-layers", "provincias",
                                    "-o", "format=topojson", "quantization=1e5", str(MESAS / "geo" / "provincias.topo.json")], check=True, capture_output=True, text=True, shell=os.name == "nt")

    control = {"_": "Lo que armó scripts/elecciones_mapa.py. No se edita a mano.",
               "consulta": time.strftime("%Y-%m-%d"),
               "fuentes": {"sige": {"url": "https://www.padron.gov.ar/cne_sige/", "organismo": "Cámara Nacional Electoral", "sin_descarga": [c for c in INDEC if not (fuentes / "sige" / f"{A_DISTRITO[c]}.json").exists()]},
                           "cne": {"url": CNE_PAGINA, "organismo": "Cámara Nacional Electoral, portal anterior"},
                           "galeano": {"url": "https://github.com/tartagalensis/circuitos_electorales_AR", "autor": "Franco Galeano", "licencia": "CC BY 4.0", "commit": GALEANO_COMMIT}},
               "cruce_con_galeano": cruce, "elecciones": medido}
    CONTROL.write_text(json.dumps(control, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")

    # el informe
    print("\nVotantes con lugar en el mapa, por elección (% del total), y dónde el mapa llega solo a la sección:")
    for id_, d in medido.items():
        t = sum(1 for _ in d)
        secc = [c for c, v in d.items() if v["nivel"] == "seccion"]
        peor = min(d.items(), key=lambda x: x[1]["con_poligono"])
        print(f"  {id_:28s} {t:2d} jurisdicciones, la menor {peor[0]} {peor[1]['con_poligono']:5.1f}%, por sección: {secc}")
    print("\nMismo código que Galeano (mediana en km y a más de 10 km):")
    for c, v in sorted(cruce.items()):
        print(f"  {c}: {v['comunes']} en común, mediana {v['mediana_km']} km, {v['a_mas_de_10_km']} a más de 10 km")
    if faltan_fuerza:
        print("\nListas sin fuerza en mesas_fuerzas.json (van a Otras):", list(faltan_fuerza)[:20])
    tam = sum(f.stat().st_size for f in (MESAS / "geo").rglob("*") if f.is_file()) if (MESAS / "geo").exists() else 0
    tam2 = sum(f.stat().st_size for f in (MESAS / "mapa").rglob("*") if f.is_file())
    print(f"\ngeo/: {tam / 1048576:.1f} MB, mapa/: {tam2 / 1048576:.1f} MB")


if __name__ == "__main__":
    main()
