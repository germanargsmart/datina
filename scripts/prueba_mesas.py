"""
Prueba de los datos de Elecciones por mesa (sitio/datos/mesas/, 4 de noviembre de 2026). Sin red. La corre 03_construir_sitio.py al final y no da
el sitio por armado si falla. Controla que:
- estén todos los archivos del índice, cada uno por debajo del límite de Cloudflare Pages (25 MiB), y que el sitio no pase de 20.000 archivos;
- en cada elección por mesa, lo publicado sume exacto lo mismo que el archivo de origen (datos/manual/mesas_control.json, sumado antes de armar nada):
  votantes y votos positivos, jurisdicción por jurisdicción;
- ninguna mesa esté repetida, y que el total por jurisdicción (pais.csv) y la tabla de secciones y circuitos den lo mismo que sumar las mesas;
- los resultados nacionales conocidos del escrutinio provisorio sigan dando lo mismo;
- contra la ficha de elecciones de Política (datos/manual/presidenciales_provincia.csv): 2023 sale de los mismos archivos y da exacto, y lo que el provisorio
  reúne del definitivo queda dentro de lo medido al armar (COBERTURA_MIN y COBERTURA_MAX);
- el escrutinio definitivo de cada elección por mesa (5 de noviembre de 2026, scripts/elecciones_definitivo.py): que esté, con todas las jurisdicciones, que cada una
  cierre sus sumas y que el resultado nacional conocido dé lo mismo;
- las secciones de Santa Fe con su código y su nombre oficial en todas las elecciones (cambió la numeración en 2023), el padrón del exterior y el fondo del mapa.

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
# el resultado nacional del escrutinio definitivo, con un decimal: lo que publican la DINE y la Cámara Nacional Electoral. En la segunda vuelta de 2023 suma el exterior y las cárceles
CONOCIDOS_DEF = {"2023-segunda-presidente": {"Milei - Villarruel (La Libertad Avanza)": 55.7, "Massa - Rossi (Unión por la Patria)": 44.3},
                 "2023-general-presidente": {"Massa - Rossi (Unión por la Patria)": 36.8, "Milei - Villarruel (La Libertad Avanza)": 30.0, "Bullrich - Petri (Juntos por el Cambio)": 23.8},
                 "2019-general-presidente": {"Fernández - Fernández de Kirchner (Frente de Todos)": 48.2, "Macri - Pichetto (Juntos por el Cambio)": 40.3},
                 "2015-segunda-presidente": {"Macri - Michetti (Cambiemos)": 51.3, "Scioli - Zannini (Frente para la Victoria)": 48.7}}
# las secciones de Santa Fe desde 2023, el código de la tabla de ámbitos de la DINE. Hasta 2021 se numeraban de otra forma (scripts/elecciones_mesas.py)
SANTA_FE = {"1": "La Capital", "2": "Las Colonias", "3": "San Jerónimo", "4": "Garay", "5": "Castellanos", "6": "San Martín", "7": "San Cristóbal", "8": "San Justo",
            "9": "General Obligado", "10": "Vera", "11": "San Javier", "12": "9 de Julio", "13": "Rosario", "14": "Caseros", "15": "Constitución", "16": "General López",
            "17": "Belgrano", "18": "Iriondo", "19": "San Lorenzo"}
# qué parte de quienes votaron en una jurisdicción tiene su lugar en el mapa: lo menor medido al armar fue 99,6% (scripts/elecciones_mapa.py). Si baja, se rompió una unión
MAPA_MINIMO = 99
FUERZAS = RAIZ / "datos" / "manual" / "mesas_fuerzas.json"
# lo que los departamentos de 257arg reúnen del definitivo de una jurisdicción: lo medido al armar va de 87,7% (Formosa, diputados 2007) a 116,1% (San Juan, presidente 2003). Fuera de esto, se coló un total
DEPTOS_MIN, DEPTOS_MAX = 85, 118
# la presidencial de 1983 suma casi exacto el definitivo oficial (14.927.512): sirve de control de toda la cadena
DEPTOS_CONOCIDOS = {"1983-general-presidente": 14927513}
# de 1912 a 1973 no hay total oficial como datos: lo que reúne contra el resultado nacional del atlas va de 36,9% (1937, solo cuatro jurisdicciones) a 103,2% (1928). Más arriba se coló un total repetido
ANTIGUAS_MIN, ANTIGUAS_MAX = 30, 105
# el reparto, en elecciones casi completas, contra el resultado nacional de la Wikipedia que trae el atlas. Si una lista cae en otra fuerza se nota acá: en septiembre de 1973 Perón daba 86%
ANTIGUAS_CONOCIDAS = {"1946-general-presidente": ("Juan Domingo Perón", 53.7), "1951-general-diputados": ("Partido Peronista", 62.2), "1958-general-presidente": ("Arturo Frondizi", 49.5),
                      "1965-general-diputados": ("Unión Popular", 30.9), "1973-septiembre-presidente": ("Juan Domingo Perón", 61.9)}


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

    # el escrutinio definitivo de cada jurisdicción (scripts/elecciones_definitivo.py)
    def_nac = {}
    for el in idx["elecciones"]:
        if el["nivel"] != "mesa":
            continue
        id_ = el["id"]
        if not el.get("definitivo"):
            problemas.append(f"{id_}: sin escrutinio definitivo. Hay que correr scripts/elecciones_definitivo.py")
            continue
        ruta = SALIDA / id_ / "definitivo.csv"
        if not ruta.exists():
            problemas.append(f"{id_}: falta definitivo.csv")
            continue
        d = leer(ruta)
        c = {n: i for i, n in enumerate(d[0])}
        por = {}
        for r in d[1:]:
            x = por.setdefault(r[c["codigo_indec"]], {"pos": 0, "otros": [r[c["votantes"]], r[c["blancos"]], r[c["nulos"]], r[c["recurridos_impugnados"]]]})
            x["pos"] += int(r[c["votos"]])
            if el["cargo"] == "presidente":
                t = def_nac.setdefault(id_, {})
                t[r[c["lista"]]] = t.get(r[c["lista"]], 0) + int(r[c["votos"]])
        if set(el["provincias"]) - set(por):
            problemas.append(f"{id_}/definitivo.csv: faltan {sorted(set(el['provincias']) - set(por))}")
        if set(por) - set(el["provincias"]) - set(el["definitivo"].get("aparte", [])):
            problemas.append(f"{id_}/definitivo.csv: jurisdicciones que no van {sorted(set(por) - set(el['provincias']))}")
        for cod, x in por.items():
            vot, bl, nu, re_ = (int(v) if v else 0 for v in x["otros"])
            if vot != x["pos"] + bl + nu + re_:
                problemas.append(f"{id_}/definitivo.csv, {cod}: las listas, blancos, nulos y recurridos suman {x['pos'] + bl + nu + re_:,} y los votantes son {vot:,}")
        if set(el.get("cobertura", {})) != set(el["provincias"]):
            problemas.append(f"{id_}: el índice no dice cuánto del definitivo reúne cada jurisdicción")
    for id_, listas in CONOCIDOS_DEF.items():
        t = def_nac.get(id_, {})
        base = sum(t.values()) or 1
        for lista, esperado in listas.items():
            if lista not in t:
                problemas.append(f"{id_}, definitivo: no aparece la lista {lista}. Hay: {sorted(t)[:8]}")
            elif abs(t[lista] / base * 100 - esperado) > 0.06:
                problemas.append(f"{id_}, definitivo: {lista} da {t[lista] / base * 100:.2f}%, se esperaba {esperado}%")
    # Santa Fe: el mismo código es el mismo departamento en todas las elecciones
    for el in idx["elecciones"]:
        if el["nivel"] != "mesa" or "82" not in el["provincias"]:
            continue
        nombres = {(r[0], r[1]) for r in leer(SALIDA / el["id"] / "82.csv")[1:]}
        malos = sorted(x for x in nombres if SANTA_FE.get(x[0]) != x[1])
        if malos:
            problemas.append(f"{el['id']}/82.csv: secciones de Santa Fe con otro código o nombre que el oficial: {malos[:4]}")
    # el padrón del exterior
    ext = idx.get("exterior")
    if not ext:
        problemas.append("indice.json: falta el padrón del exterior")
    elif not (SALIDA / ext["archivo"]).exists():
        problemas.append(f"falta {ext['archivo']}")
    else:
        pad = leer(SALIDA / ext["archivo"])
        c = {n: i for i, n in enumerate(pad[0])}
        if sum(int(r[c["electores"]]) for r in pad[1:]) != ext["electores"] or len({r[c["pais"]] for r in pad[1:]}) != ext["paises"]:
            problemas.append(f"{ext['archivo']}: no suma los electores o los países que dice el índice")
        if {r[c["codigo_indec"]] for r in pad[1:]} - set(idx["provincias"]):
            problemas.append(f"{ext['archivo']}: jurisdicciones desconocidas")
    # el fondo del mapa: los departamentos del IGN con su sección
    if not (SALIDA / "geo" / "base.topo.json").exists():
        problemas.append("falta geo/base.topo.json. Hay que correr scripts/elecciones_mapa.py")
    else:
        b = json.loads((SALIDA / "geo" / "base.topo.json").read_text(encoding="utf-8"))
        g = next(iter(b["objects"].values()))["geometries"]
        if len(g) < 500 or any(not x.get("properties", {}).get("p") or not x["properties"].get("s") for x in g):
            problemas.append(f"geo/base.topo.json: {len(g)} departamentos, o alguno sin jurisdicción o sin sección")

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
    # de 1912 a 1973: lo que reúne contra el resultado nacional, y el reparto de las elecciones casi completas
    for el in idx["elecciones"]:
        if not el.get("fuente"):
            continue
        doc = json.loads((SALIDA / "mapa" / f"{el['id']}.json").read_text(encoding="utf-8"))
        if doc.get("reune") is not None and not ANTIGUAS_MIN <= doc["reune"] <= ANTIGUAS_MAX:
            problemas.append(f"mapa/{el['id']}.json: reúne {doc['reune']}% del resultado nacional")
        for cod, pv in doc["provincias"].items():
            primeros = [f[0] for f in pv["filas"]]
            if len(primeros) != len(set(primeros)):
                problemas.append(f"mapa/{el['id']}.json, {cod}: un lugar del mapa aparece dos veces")
    for id_, (fuerza, esperado) in ANTIGUAS_CONOCIDAS.items():
        doc = json.loads((SALIDA / "mapa" / f"{id_}.json").read_text(encoding="utf-8"))
        por_f = {}
        for pv in doc["provincias"].values():
            for f in pv["filas"]:
                for i in range(0, len(f[4]), 2):
                    n = doc["fuerzas"][doc["fuerza"][f[4][i]]]["n"]
                    por_f[n] = por_f.get(n, 0) + f[4][i + 1]
        base = sum(por_f.values()) or 1
        dato = next((v for n, v in por_f.items() if n.startswith(fuerza)), 0) / base * 100
        if abs(dato - esperado) > .5:
            problemas.append(f"{id_}: {fuerza} da {dato:.1f}% y el resultado nacional dice {esperado}%")
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
