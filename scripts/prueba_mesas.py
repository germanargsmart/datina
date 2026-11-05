"""
Prueba de los datos de Elecciones por mesa (sitio/datos/mesas/, 4 de noviembre de 2026). Sin red. La corre 03_construir_sitio.py al final y no da
el sitio por armado si falla. Controla que:
- estén todos los archivos del índice, cada uno por debajo del límite de Cloudflare Pages (25 MiB), y que el sitio no pase de 20.000 archivos;
- en cada elección por mesa, lo publicado sume exacto lo mismo que el archivo de origen (datos/manual/mesas_control.json, sumado antes de armar nada):
  votantes y votos positivos, jurisdicción por jurisdicción;
- ninguna mesa esté repetida, y que el total por jurisdicción (pais.csv) y la tabla de secciones y circuitos den lo mismo que sumar las mesas;
- los resultados nacionales conocidos del escrutinio provisorio sigan dando lo mismo;
- contra la ficha de elecciones de Política (datos/manual/presidenciales_provincia.csv): 2023 sale de los mismos archivos y da exacto, y lo que el provisorio
  reúne del definitivo queda dentro de lo medido al armar (COBERTURA_MIN y COBERTURA_MAX).

Uso: python scripts/prueba_mesas.py [-v]. Devuelve 1 si hay problemas.
"""
import csv
import json
import pathlib
import re
import sys

RAIZ = pathlib.Path(__file__).resolve().parents[1]
SALIDA = RAIZ / "sitio" / "datos" / "mesas"
CONTROL = RAIZ / "datos" / "manual" / "mesas_control.json"
PRESIDENCIALES = RAIZ / "datos" / "manual" / "presidenciales_provincia.csv"
LIMITE_ARCHIVO = 25 * 1024 * 1024
LIMITE_SITIO = 20000
FIJAS = ["seccion_id", "seccion", "circuito", "mesa", "electores", "blancos", "nulos", "recurridos_impugnados"]
# porcentaje de los votos positivos en el escrutinio provisorio, con un decimal (las dos más votadas de cada presidencial)
CONOCIDOS = {"2023-general-presidente": {"Massa - Rossi (Unión por la Patria)": 36.7, "Milei - Villarruel (La Libertad Avanza)": 30.0},
             "2023-segunda-presidente": {"Milei - Villarruel (La Libertad Avanza)": 55.7, "Massa - Rossi (Unión por la Patria)": 44.3},
             "2019-general-presidente": {"Fernández - Fernández de Kirchner (Frente de Todos)": 48.1, "Macri - Pichetto (Juntos por el Cambio)": 40.4},
             "2015-segunda-presidente": {"Macri - Michetti (Cambiemos)": 51.4, "Scioli - Zannini (Frente para la Victoria)": 48.6},
             "2011-general-presidente": {"Fernández de Kirchner - Boudou (Alianza Frente para la Victoria)": 54.0},
             # definitivo: el mismo que la ficha de elecciones de Política
             "1983-general-presidente": {"Alfonsín - Martínez": 51.8, "Luder - Bittel": 40.2}}
# qué parte del definitivo reúne el provisorio de una jurisdicción: la menor medida al armar fue 77,2% (Formosa, diputados 2015: en esa general el archivo trae 1.050
# mesas y el de la segunda vuelta, 1.301). Fuera de estos bordes algo se leyó mal
COBERTURA_MIN, COBERTURA_MAX = 75, 101.5
# qué parte de quienes votaron en una jurisdicción tiene su lugar en el mapa: lo menor medido al armar fue 99,6% (scripts/elecciones_mapa.py). Si baja, se rompió una unión
MAPA_MINIMO = 99
FUERZAS = RAIZ / "datos" / "manual" / "mesas_fuerzas.json"
# lo que los departamentos de 257arg reúnen del definitivo de una jurisdicción: lo medido al armar va de 87,7% (Formosa, diputados 2007) a 116,1% (San Juan, presidente 2003). Fuera de esto, se coló un total
DEPTOS_MIN, DEPTOS_MAX = 85, 118
# la presidencial de 1983 suma casi exacto el definitivo oficial (14.927.512): sirve de control de toda la cadena
DEPTOS_CONOCIDOS = {"1983-general-presidente": 14927513}


def leer(ruta):
    with open(ruta, encoding="utf-8", newline="") as f:
        return list(csv.reader(f))


def revisar(detalle=False):
    problemas = []
    if not (SALIDA / "indice.json").exists():
        return ["falta sitio/datos/mesas/indice.json: hay que correr scripts/elecciones_mesas.py"]
    idx = json.loads((SALIDA / "indice.json").read_text(encoding="utf-8"))
    ctl = json.loads(CONTROL.read_text(encoding="utf-8"))
    pres = list(csv.DictReader(open(PRESIDENCIALES, encoding="utf-8", newline="")))
    totales_nac = {}
    for el in idx["elecciones"]:
        id_ = el["id"]
        pais_ruta = SALIDA / id_ / "pais.csv"
        if not pais_ruta.exists():
            problemas.append(f"{id_}: falta pais.csv")
            continue
        p = leer(pais_ruta)
        c = {n: i for i, n in enumerate(p[0])}
        por_prov = {}
        for r in p[1:]:
            d = por_prov.setdefault(r[c["codigo_indec"]], {"positivos": 0, "votantes": r[c["votantes"]]})
            d["positivos"] += int(r[c["votos"]])
            if el["cargo"] == "presidente":
                t = totales_nac.setdefault(id_, {})
                t[r[c["lista"]]] = t.get(r[c["lista"]], 0) + int(r[c["votos"]])
        if sorted(por_prov) != sorted(el["provincias"]):
            problemas.append(f"{id_}: el índice y pais.csv no tienen las mismas jurisdicciones")
        if el["nivel"] != "mesa":
            continue
        origen = ctl["origen"].get(id_)
        if not origen:
            problemas.append(f"{id_}: no está en el control de origen")
            continue
        for cod in el["provincias"]:
            ruta = SALIDA / id_ / f"{cod}.csv"
            if not ruta.exists():
                problemas.append(f"{id_}: falta {cod}.csv")
                continue
            filas = leer(ruta)
            if filas[0][:8] != FIJAS:
                problemas.append(f"{id_}/{cod}.csv: columnas inesperadas {filas[0][:8]}")
                continue
            vistas, votantes, positivos = set(), 0, 0
            for r in filas[1:]:
                k = (r[0], r[2], r[3])
                if k in vistas:
                    problemas.append(f"{id_}/{cod}.csv: mesa repetida {k}")
                    break
                vistas.add(k)
                pos = sum(int(x) for x in r[8:])
                positivos += pos
                votantes += pos + int(r[5]) + int(r[6]) + int(r[7])
            o = origen.get(cod)
            if not o:
                problemas.append(f"{id_}/{cod}: no está en el origen")
            elif (votantes, positivos) != (o["votantes"], o["positivos"]):
                problemas.append(f"{id_}/{cod}: publicado {votantes:,} votantes y {positivos:,} positivos, en el origen {o['votantes']:,} y {o['positivos']:,}")
            if por_prov[cod]["positivos"] != positivos or int(por_prov[cod]["votantes"]) != votantes:
                problemas.append(f"{id_}/{cod}: pais.csv no da lo mismo que las mesas")
        faltan = set(origen) - set(el["provincias"])
        if faltan:
            problemas.append(f"{id_}: jurisdicciones del origen que no quedaron: {sorted(faltan)}")

    # la tabla de secciones y circuitos: cada nivel suma lo mismo que el total de la jurisdicción
    pub = ctl["publicado"]
    for cod in idx["provincias"]:
        ruta = SALIDA / "circuitos" / f"{cod}.csv"
        if not ruta.exists():
            problemas.append(f"falta circuitos/{cod}.csv")
            continue
        h = leer(ruta)
        c = {n: i for i, n in enumerate(h[0])}
        secciones, circuitos = {}, {}
        for r in h[1:]:
            dest = circuitos if r[c["circuito"]] else secciones
            dest[r[c["eleccion"]]] = dest.get(r[c["eleccion"]], 0) + int(r[c["votantes"]])
        for id_, v in {**secciones}.items():
            esperado = pub[id_]["provincias"][cod]["votantes"]
            if v != esperado or circuitos.get(id_) != esperado:
                problemas.append(f"circuitos/{cod}.csv, {id_}: secciones {v:,}, circuitos {circuitos.get(id_):,}, jurisdicción {esperado:,}")

    # resultados conocidos
    for id_, listas in CONOCIDOS.items():
        t = totales_nac.get(id_, {})
        base = sum(t.values()) or 1
        for lista, esperado in listas.items():
            if lista not in t:
                problemas.append(f"{id_}: no aparece la lista {lista}. Hay: {sorted(t)[:8]}")
            elif abs(t[lista] / base * 100 - esperado) > 0.06:
                problemas.append(f"{id_}: {lista} da {t[lista] / base * 100:.2f}%, se esperaba {esperado}%")

    # contra la ficha de elecciones de Política
    difs = {}
    for el in idx["elecciones"]:
        if el["cargo"] != "presidente" or el["nivel"] != "mesa":
            continue
        vuelta = "2" if el["vuelta"] == "segunda" else "1"
        ref = {}
        for r in pres:
            if r["anio"] == str(el["anio"]) and r["vuelta"] == vuelta:
                ref[r["codigo_indec"]] = int(float(r["positivos"]))
        if not ref:
            continue
        for cod, o in ctl["origen"][el["id"]].items():
            if el["anio"] == 2023 and o["positivos"] != ref[cod]:
                problemas.append(f"{el['id']}/{cod}: {o['positivos']:,} positivos y la ficha de Política dice {ref[cod]:,}: salen del mismo archivo")
    for el in idx["elecciones"]:
        for cod, c in el.get("cobertura", {}).items():
            difs[(el["id"], cod)] = c
            if not COBERTURA_MIN <= c <= COBERTURA_MAX:
                problemas.append(f"{el['id']}/{cod}: el provisorio reúne {c}% del definitivo")
    if detalle and difs:
        peor = min(difs, key=difs.get)
        print(f"Menor cobertura del definitivo: {peor}, {difs[peor]}%. Mayor: {max(difs.values())}%")

    # el mapa (5 de noviembre de 2026): cada elección por mesa con su archivo, cada lugar del mapa suma lo que dicen las mesas, y casi todos los votantes tienen dónde pintarse
    fuerzas = json.loads(FUERZAS.read_text(encoding="utf-8"))
    for f_id, f in fuerzas["fuerzas"].items():
        if not re.fullmatch(r"#[0-9A-Fa-f]{6}", f["color"]):
            problemas.append(f"mesas_fuerzas.json: {f_id} con un color que no es hexadecimal: {f['color']}")
    for lista, f_id in fuerzas["listas"].items():
        if f_id not in fuerzas["fuerzas"]:
            problemas.append(f"mesas_fuerzas.json: {lista} apunta a una fuerza que no existe: {f_id}")
    pesos_geo = set()
    for el in idx["elecciones"]:
        if el["nivel"] != "mesa":
            continue
        id_ = el["id"]
        ruta = SALIDA / "mapa" / f"{id_}.json"
        if not ruta.exists():
            problemas.append(f"mapa/{id_}.json: falta. Hay que correr scripts/elecciones_mapa.py")
            continue
        doc = json.loads(ruta.read_text(encoding="utf-8"))
        pesos_geo.add(f"pais-{doc['periodo']}")
        if sorted(doc["provincias"]) != sorted(el["provincias"]):
            problemas.append(f"mapa/{id_}.json: no tiene las mismas jurisdicciones que el índice")
        for n, f_ix in zip(doc["listas"], doc["fuerza"]):
            if n not in fuerzas["listas"]:
                problemas.append(f"{id_}: la lista {n} no está en mesas_fuerzas.json")
            elif doc["fuerzas"][f_ix]["id"] != fuerzas["listas"][n]:
                problemas.append(f"{id_}: la lista {n} quedó con otra fuerza")
        origen = ctl["origen"][id_]
        for cod, pv in doc["provincias"].items():
            total = sum(int(f[3]) for f in pv["filas"])
            esperado = origen[cod]["votantes"]
            if total > esperado:
                problemas.append(f"mapa/{id_}.json, {cod}: el mapa suma {total:,} votantes y las mesas {esperado:,}: un voto se contó dos veces")
            parte = 100 * total / esperado if esperado else 100
            if abs(parte - pv["con"]) > .11:
                problemas.append(f"mapa/{id_}.json, {cod}: dice que muestra {pv['con']}% y suma {parte:.1f}%")
            if parte < MAPA_MINIMO:
                problemas.append(f"mapa/{id_}.json, {cod}: solo {parte:.1f}% de los votantes tiene lugar en el mapa")
            if not (SALIDA / "geo" / pv["ed"] / f"{cod}.topo.json").exists():
                problemas.append(f"mapa/{id_}.json, {cod}: falta geo/{pv['ed']}/{cod}.topo.json")
            for f in pv["filas"]:
                if len(f[4]) % 2 or any(f[4][i] >= len(doc["listas"]) for i in range(0, len(f[4]), 2)) or any(f[4][i] < f[4][i + 2] for i in range(1, len(f[4]) - 2, 2)):
                    problemas.append(f"mapa/{id_}.json, {cod}: una fila mal armada: sección {f[0]}, {f[1]}")
                    break
    for nombre in pesos_geo:
        if not (SALIDA / "geo" / f"{nombre}.topo.json").exists():
            problemas.append(f"falta geo/{nombre}.topo.json")

    # de 1983 a 2009: los departamentos de 257arg contra el definitivo oficial, y nunca el total de la provincia repetido en un departamento (Tucumán 1991 sumaba 193%)
    for el in idx["elecciones"]:
        if el["nivel"] == "mesa":
            continue
        id_ = el["id"]
        ruta = SALIDA / "mapa" / f"{id_}.json"
        if not ruta.exists():
            problemas.append(f"mapa/{id_}.json: falta. Hay que correr scripts/elecciones_departamentos.py")
            continue
        doc = json.loads(ruta.read_text(encoding="utf-8"))
        if sorted(doc["provincias"]) != sorted(el["provincias"]):
            problemas.append(f"mapa/{id_}.json: no tiene las mismas jurisdicciones que el índice")
        if el["nivel"] == "provincia":
            if not (SALIDA / "geo" / "provincias.topo.json").exists():
                problemas.append("falta geo/provincias.topo.json")
            continue
        if not (SALIDA / "geo" / f"pais-{doc['periodo']}.topo.json").exists():
            problemas.append(f"falta geo/pais-{doc['periodo']}.topo.json")
        for cod, pv in doc["provincias"].items():
            if not (SALIDA / "geo" / pv["ed"] / f"{cod}.topo.json").exists():
                problemas.append(f"mapa/{id_}.json, {cod}: falta geo/{pv['ed']}/{cod}.topo.json")
            s = pv.get("suma")
            if s is not None and not DEPTOS_MIN <= s <= DEPTOS_MAX:
                problemas.append(f"mapa/{id_}.json, {cod}: los departamentos suman {s}% del definitivo")
        for cod in el.get("departamentos", []):
            ruta_t = SALIDA / id_ / f"{cod}.csv"
            if not ruta_t.exists():
                problemas.append(f"{id_}/{cod}.csv: falta")
                continue
            filas = leer(ruta_t)
            if filas[0][:8] != FIJAS or len(filas) < 2:
                problemas.append(f"{id_}/{cod}.csv: columnas inesperadas o sin filas")
            elif len({r[0] for r in filas[1:]}) != len(filas) - 1:
                problemas.append(f"{id_}/{cod}.csv: un departamento repetido")
    for id_, esperado in DEPTOS_CONOCIDOS.items():
        doc = json.loads((SALIDA / "mapa" / f"{id_}.json").read_text(encoding="utf-8"))
        total = sum(f[4][i + 1] for pv in doc["provincias"].values() for f in pv["filas"] for i in range(0, len(f[4]), 2))
        if total != esperado:
            problemas.append(f"mapa/{id_}.json: suma {total:,} votos positivos y se esperaban {esperado:,}")

    # sin esta regla Cloudflare no comprime las tablas, porque no comprime el CSV: Buenos Aires baja unos 5 MB
    if "/datos/mesas/*\n  Content-Type: text/plain" not in (RAIZ / "sitio" / "_headers").read_text(encoding="utf-8"):
        problemas.append("sitio/_headers no tiene la regla que hace que Cloudflare comprima las tablas de sitio/datos/mesas/")
    # los límites de Cloudflare Pages
    for f in SALIDA.rglob("*"):
        if f.is_file() and f.stat().st_size > LIMITE_ARCHIVO:
            problemas.append(f"{f.relative_to(SALIDA)} pasa de 25 MiB")
    n = sum(1 for f in (RAIZ / "sitio").rglob("*") if f.is_file())
    if n > LIMITE_SITIO:
        problemas.append(f"sitio/ tiene {n:,} archivos: Cloudflare Pages admite {LIMITE_SITIO:,}")
    if detalle:
        print(f"{len(idx['elecciones'])} elecciones, {n:,} archivos en sitio/")
    return problemas


if __name__ == "__main__":
    mal = revisar("-v" in sys.argv)
    for m in mal:
        print(m)
    print("Elecciones por mesa: " + (f"{len(mal)} problemas" if mal else "en orden"))
    sys.exit(1 if mal else 0)
