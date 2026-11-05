"""
Elecciones por mesa de 1912 a 1973 (pedido del autor del 5 de noviembre de 2026). Lee los dataset_*.json de 257arg (azha2005, CC BY 4.0), que los arma con Darío Cantón (1968), expedientes de la
Cámara de Diputados, prensa de la época y Lupu y Stokes (2009), y la geometría de cada época de Rodríguez, CEUR-CONICET (CC BY 2.5 AR). Escribe, sin que 03 lo toque:
  sitio/datos/mesas/{eleccion}/pais.csv y {codigo_indec}.csv   con las columnas de las tablas de 1983 a 2009
  sitio/datos/mesas/mapa/{eleccion}.json                       igual que el mapa por circuito
  sitio/datos/mesas/geo/dep{1914,1947,1960,1970}/ y circ1951/  los polígonos
y suma esas elecciones a indice.json. Se corre una sola vez, después de elecciones_departamentos.py: estas elecciones ya no cambian. Si elecciones_mesas.py reescribe el índice, hay que correr los dos de nuevo.

A diferencia de 1983 a 2009, acá no hay un total oficial publicado como datos: pais.csv suma lo que trae la fuente, y "reune" dice qué parte de los votos de la elección es eso.

Uso: python scripts/elecciones_antiguas.py --fuentes CARPETA [--solo-resultados]
"""
import argparse
import collections
import csv
import json
import os
import pathlib
import re
import subprocess
import sys
import tempfile

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from elecciones_departamentos import MESAS, PERONISMO, PROV, RAIZ, UCR, bajar, buscar_departamento, clave, leer_dbf, sin_marcas, titulo

CONTROL = RAIZ / "datos" / "manual" / "mesas_antiguas_control.json"
RESUMEN = RAIZ / "datos" / "manual" / "mesas_control.json"
CANTON = "Darío Cantón (1968)"
LUPU = "Lupu y Stokes (2009)"
# atlas -> (año, vuelta, cargo, etiqueta, geometría, fuente de los votos, archivo del atlas). La segunda elección de 1973 lleva "segunda" solo para ir después de marzo en las listas
ATLAS = {
    "1912": (1912, "general", "diputados", "1912", "1914", f"{CANTON} y expedientes de la Cámara de Diputados", "1912"),
    "1914": (1914, "general", "diputados", "1914", "1914", f"{CANTON} y expedientes de la Cámara de Diputados", "1914"),
    "1916": (1916, "general", "diputados", "1916", "1914", f"{CANTON} y expedientes de la Cámara de Diputados", "1916dip"),
    "1918": (1918, "general", "diputados", "1918", "1914", CANTON, "1918"),
    "1920": (1920, "general", "diputados", "1920", "1914", CANTON, "1920"),
    "1922": (1922, "general", "presidente", "1922", "1914", f"{CANTON} y La Prensa", "1922"),
    "1926": (1926, "general", "diputados", "1926", "1914", CANTON, "1926"),
    "1928": (1928, "general", "presidente", "1928", "1914", CANTON, "1928"),
    "1930": (1930, "general", "diputados", "1930", "1914", CANTON, "1930"),
    "1937": (1937, "general", "presidente", "1937", "1914", CANTON, "1937"),
    "1940": (1940, "general", "diputados", "1940", "1914", CANTON, "1940"),
    "1946": (1946, "general", "presidente", "1946", "1947", CANTON, "1946"),
    "1948": (1948, "general", "diputados", "1948", "1947", LUPU, "1948"),
    "1951": (1951, "general", "diputados", "1951", "circ1951", "la tabla de la Wikipedia, que cita la publicación oficial de ese año", "1951"),
    "1954": (1954, "general", "diputados", "1954", "1960", CANTON, "1954"),
    "1958": (1958, "general", "presidente", "1958", "1960", CANTON, "1958"),
    "1962": (1962, "general", "diputados", "1962", "1960", CANTON, "1962"),
    "1965": (1965, "general", "diputados", "1965", "1970", CANTON, "1965"),
    "1973": (1973, "general", "presidente", "1973, marzo", "1970", LUPU, "1973"),
    "1973s": (1973, "segunda", "presidente", "1973, septiembre", "1970", LUPU, "1973s"),
}
AVISOS = {"1951": "Es la primera elección nacional con voto de las mujeres, por circunscripción uninominal. Los límites de esas circunscripciones son aproximados.",
          "1948": "La fuente solo distingue algunas fuerzas por departamento.", "1973": "La fuente solo distingue algunas fuerzas por departamento.", "1973s": "La fuente solo distingue algunas fuerzas por departamento."}
SHP = {"1914": "Departamentos_1914", "1947": "Departamentos_1947_2026v2", "1960": "Departamentos_1960_2026v2", "1970": "Departamentos_1970"}
SECC_CF = "Departamentos_1960_secc CF_2026v2"
PROV_1951 = {"Comodoro Rivadavia": "26"}   # gobernación militar de 1944 a 1955, hoy parte de Chubut y Santa Cruz
INTERVALO_PROV, INTERVALO_PAIS = 300, 2500
SIN_DATO = "Sin dato propio"
ANTARTIDA = "ANTARTIC|ANTARTIDA|ATLANTICOSUR|ISLASDELATLANTICO"
# los departamentos cambiaron de nombre más de una vez, y la fuente y el mapa de cada época no siempre usan el mismo: Las Conchas es Tigre, Caseros es Daireaux, 4 de Junio es Lanús, Tercero Abajo es General
# San Martín (el parecido de letras lo mandaba a Tercero Arriba, que es otro), Angaco Norte es San Martín y Desamparados es Rawson. Se prueba en orden con el mapa de cada época. Lo que no está queda gris y figura en el control
ALIAS_ANTIGUOS = {
    ("06", "4DEJUNIO"): ["LANUS"], ("06", "CDEMLEONARDOROSALES"): ["CORONELDEMARINALROSALES"], ("06", "CASEROS"): ["CASEROS", "DAIREAUX"], ("06", "DAIREAUX"): ["DAIREAUX", "CASEROS"],
    ("06", "GONZALEZCHAVES"): ["ADOLFOGONZALESCHAVES"], ("06", "JUAREZ"): ["BENITOJUAREZ"], ("06", "MARCHIQUITA"): ["MARCHIQUITA", "CORONELVIDAL"], ("06", "TIGRE"): ["LASCONCHASTIGRE", "LASCONCHAS", "TIGRE"],
    ("06", "TORDILLO"): ["TORDILLO", "GENERALCONESA"], ("10", "FRAYMAMERTOESQUIU"): ["FRAYMAMERTOESQUIU", "FRAYMAMERTO", "PIEDRABLANCA"], ("14", "ISCHILIN"): ["ISCHILIN", "LSCHLLIN"],
    ("14", "ROQUESAENZPENA"): ["PRESIDENTEROQUESAENZPENA"], ("14", "TERCEROABAJO"): ["GENERALSANMARTIN"], ("18", "LIBRES"): ["PASODELOSLIBRES"], ("18", "SANLUIS"): ["SANLUISDELPALMAR"],
    ("22", "CAPGENERALOHIGGINS"): ["OHIGGINS"], ("22", "GUEMES"): ["GENERALGUEMES"], ("30", "CONCEPCIONDELURUGUAY"): ["URUGUAY"], ("30", "ROSARIOTALA"): ["TALA"], ("34", "CAPITAL"): ["FORMOSA"],
    ("46", "FACUNDOQUIROGA"): ["GENERALJUANFQUIROGA"], ("46", "FELIPEVARELA"): ["CORONELFELIPEVARELA"], ("46", "CHAMICAL"): ["CHAMICAL", "JUAREZCELMAN"], ("46", "SANBLASDELOSSAUCES"): ["SANBLASDELOSSAUCES", "PELAGIOLUNA"],
    ("50", "CIUDAD"): ["CAPITAL"], ("50", "CIUDADDEMENDOZA"): ["CAPITAL"], ("50", "LUJAN"): ["LUJANDECUYO"], ("54", "CONCEPCIONDELASIERRA"): ["CONCEPCION"], ("54", "LGRANSANMARTIN"): ["LIBERTADORGENERALSANMARTIN"],
    ("62", "GENERALCONESA"): ["CONESA"], ("66", "GENERALMARTINMIGUELDEGUEMES"): ["GENERALGUEMES", "CAMPOSANTO"], ("66", "SANMARTIN"): ["GENERALJOSEDESANMARTIN", "GENERALJOSESANMARTIN"],
    ("70", "RAWSON"): ["RAWSON", "DESAMPARADOS"], ("70", "SANMARTIN"): ["SANMARTIN", "ANGACONORTE"], ("74", "GDORDUPUY"): ["GOBERNADORDUPUY"], ("74", "PEDERNERA"): ["GENERALPEDERNERA"], ("74", "PRINGLES"): ["CORONELPRINGLES"],
    ("74", "SANMARTIN"): ["LIBERTADORGENERALSNMARTIN", "LIBERTADORGENERALSANMARTIN"], ("82", "NUEVODEJULIO"): ["9DEJULIO"], ("86", "MARIANOMORENO"): ["MORENO"], ("86", "MATARA"): ["MATARA", "JUANFIBARRA"], ("90", "TAFI"): ["TAFI", "TAFII", "TAFIVIEJO"],
}


def codigo_geo(x, repetidos):
    """La base de 1947 repite códigos (La Plata y Las Conchas, Montecarlo y San Pedro): al disolver por código se volverían un solo polígono."""
    return f"{x['LINK_']}-{clave(x['DEPTO'], x['PROV_COD'])}" if x["LINK_"] in repetidos else x["LINK_"]


def numero(texto, n):
    return int(re.sub(r"[^\d]", "", str(texto)) or 0) if texto not in (None, "") else n


def leer_unidad(u, ix_lista):
    votos, bl, nu = collections.Counter(), 0, 0
    for code, v, _p in u["lines"]:
        if code == "P_BLA":
            bl = v or 0
        elif code == "P_NUL":
            nu = v or 0
        elif v:
            votos[ix_lista(code)] += v
    met = {x[0]: x[1] for x in (u.get("metrics") or [])}
    pos = sum(votos.values())
    vot = numero(met.get("Votantes"), 0) or numero(met.get("Total de votos"), 0)
    ele = numero(met.get("Inscriptos"), 0)
    if ele and vot > ele * 1.05:
        ele = 0   # el padrón de la fuente no da: mejor sin participación que con una imposible
    return {"votos": votos, "bl": bl, "nu": nu, "pos": pos, "vot": vot, "ele": ele}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fuentes", required=True)
    ap.add_argument("--solo-resultados", action="store_true")
    args = ap.parse_args()
    F = pathlib.Path(args.fuentes).resolve() / "deptos"
    for a, x in ATLAS.items():
        nombre = "1916" if x[6] == "1916dip" else a
        bajar(f"mapas/mapa{x[6]}/dataset_{nombre}.json", F / "datasets" / f"{a}.json")
    for base in (*SHP.values(), SECC_CF):
        for ext in ("shp", "shx", "dbf", "prj"):
            bajar(f"geometria/Base deptos 1869-2022/{base}.{ext}", F / "geo" / f"{base}.{ext}")
    bajar("mapas/mapa1951/shp/circunscripciones_1951.geojson", F / "geo" / "circunscripciones_1951.geojson")

    # los departamentos de cada época. Capital: sus 20 secciones, que hasta 1965 son las de los resultados. Después de 1947 la base trae distritos escolares: las secciones van en un archivo aparte
    geo, caba, repetidos = {}, {}, {}
    secc = [x["LINK_"] for x in leer_dbf(F / "geo" / f"{SECC_CF}.dbf")]
    for epoca, base in SHP.items():
        g = collections.defaultdict(dict)
        filas_dbf = leer_dbf(F / "geo" / f"{base}.dbf")
        cuenta = collections.Counter(x["LINK_"] for x in filas_dbf)
        repetidos[epoca] = {k for k, v in cuenta.items() if v > 1}
        for x in filas_dbf:
            g[x["PROV_COD"]][clave(x["DEPTO"], x["PROV_COD"])] = codigo_geo(x, repetidos[epoca])
        geo[epoca] = g
        caba[epoca] = sorted(g["02"].values()) if epoca in ("1914", "1947") else sorted(secc)
    circ51 = json.loads((F / "geo" / "circunscripciones_1951.geojson").read_text(encoding="utf-8"))
    cod51 = {}
    for x in circ51["features"]:
        p = x["properties"]
        cod = PROV.get(p["provincia"]) or PROV_1951[p["provincia"]]
        cod51[(p["provincia"], p["unidad"])] = (cod, f"{cod}-{re.sub('[^A-Z]', '', sin_marcas(p['provincia']))}-{p['circ']}-{re.sub('[^A-Z0-9]', '', sin_marcas(p['unidad']))}"[:40])

    idx = json.loads((MESAS / "indice.json").read_text(encoding="utf-8"))
    idx["elecciones"] = [e for e in idx["elecciones"] if e["anio"] >= 1983]
    nuevas, informe, parecidos_todos = [], {}, set()
    for a, (anio, vuelta, cargo, etiq, epoca, fuente, _archivo) in ATLAS.items():
        id_ = f"{anio}-{'septiembre' if a == '1973s' else 'general'}-{cargo}"
        d = json.load(open(F / "datasets" / f"{a}.json", encoding="utf-8"))
        cand = d["candidates"]
        unidades = d["modes"][0]["units"]
        presidente = cargo == "presidente"
        bloques = {}
        for k, c in cand.items():
            if k.startswith("P_") or not c.get("base"):
                continue
            nombre = c.get("n") or k
            if presidente and c.get("sub"):
                nombre = f"{nombre} ({c['sub']})"
            color = {"#318CE7": PERONISMO, "#E10019": UCR}.get(c["base"].upper(), c["base"])
            assert re.fullmatch(r"#[0-9A-Fa-f]{6}", color), (a, k, color)
            bloques[k] = (f"b-{k.lower()}", titulo(nombre), color)
        de_lista, por_color = {}, {}
        for u in unidades:
            if u.get("w") in bloques and u.get("lines"):
                de_lista.setdefault(u["lines"][0][0], u["w"])
        for k in bloques:
            por_color.setdefault(cand[k]["base"].upper(), k)
        listas, fuerzas, fuerza_de = {}, {}, []

        def ix_lista(code):
            n = titulo(cand.get(code, {}).get("n", code))
            if n not in listas:
                listas[n] = len(listas)
                # primero el color: en septiembre de 1973 el bloque de Perón suma dos listas, y donde la UCR salía primera entre listas sueltas, "la lista que encabeza un lugar ganado" daba mal
                b = por_color.get(str(cand.get(code, {}).get("base", "")).upper()) or de_lista.get(code)
                fz = bloques[b] if b else ("otras", "Otras fuerzas", "#98A2AE")
                if fz[0] not in fuerzas:
                    fuerzas[fz[0]] = {"id": fz[0], "n": fz[1], "c": fz[2], "ix": len(fuerzas)}
                fuerza_de.append(fuerzas[fz[0]]["ix"])
            return listas[n]

        por_prov = collections.defaultdict(list)
        for t, u in zip(d["territories"], unidades):
            cod = PROV.get(t["p"]) or PROV_1951.get(t["p"])
            if u.get("lines") and SIN_DATO not in str(u.get("note") or ""):
                por_prov[cod].append((t["n"], u, t["p"]))
        sin_par, parecidos, provincias, pais, con_tabla, info = [], set(), {}, [], [], {}
        choques = set()
        caba_entera = False

        def codigo_de(cod, nom, prov):
            if epoca == "circ1951":
                par = cod51.get((prov, nom))
                return par[1] if par else None
            if cod == "02":
                m = re.search(r"(\d+)", nom)
                k = f"02{int(m.group(1)):03d}" if m else None
                return k if k in caba[epoca] else None
            nombres_geo = geo[epoca].get(cod, {})
            for cand_geo in ALIAS_ANTIGUOS.get((cod, clave(nom, cod)), []):
                if cand_geo in nombres_geo:
                    return nombres_geo[cand_geo]
            k, parecido = buscar_departamento(nombres_geo, nom, cod)
            if parecido:
                parecidos.add(f"{cod}: {nom} -> {parecido}")
            return k

        for cod, filas_u in sorted(por_prov.items()):
            grupos = collections.defaultdict(list)
            for nom, u, prov in filas_u:
                grupos[json.dumps(u["lines"])].append((nom, u, prov))
            mayor = max(len(g) for g in grupos.values())
            # la provincia entera puesta en cada departamento ("Sin cuadro departamental"): se pinta una vez y no es una tabla de departamentos
            entera = len(filas_u) > 1 and mayor >= max(3, .5 * len(filas_u))
            caba_sin_limites = cod == "02" and epoca != "circ1951" and len(filas_u) > len(caba[epoca])
            caba_entera = caba_entera or caba_sin_limites
            filas, nombres_sec, tabla = [], {}, []
            suma = {"pos": 0, "bl": 0, "nu": 0, "vot": 0, "ele": 0, "votos": collections.Counter()}
            todos_ele = todos_vot = True
            if caba_sin_limites:
                # 28 circunscripciones sin límites publicados: la jurisdicción entera en el mapa, y la lista en la tabla
                total = collections.Counter()
                e = t = 0
                for nom, u, _p in filas_u:
                    x = leer_unidad(u, ix_lista)
                    total.update(x["votos"])
                    e += x["ele"]
                    t += x["vot"]
                    for k in ("pos", "bl", "nu"):
                        suma[k] += x[k]
                    todos_ele &= bool(x["ele"])
                    todos_vot &= bool(x["vot"])
                    tabla.append((re.sub(r"[^A-Z0-9]+", "-", sin_marcas(nom)).strip("-")[:24], nom, x))
                pares = [y for li, v in sorted(total.items(), key=lambda z: (-z[1], z[0])) for y in (li, v)]
                cs = caba[epoca]
                filas.append([cs[0], [f"{c}|d" for c in cs], e if todos_ele else 0, t, pares])
                nombres_sec[cs[0]] = "CABA"
                suma["votos"] = total
                suma["ele"], suma["vot"] = e, t
            else:
                lugares = {}   # dos nombres de la fuente pueden caer en el mismo departamento de la época (Córdoba Capital 1912): sus votos se suman y se cuentan una vez
                for _clave, g in grupos.items():
                    x = leer_unidad(g[0][1], ix_lista)
                    if not x["pos"]:
                        continue
                    cods = []
                    for nom, _u, prov in g:
                        k = codigo_de(cod, nom, prov)
                        if k:
                            if k not in cods:
                                cods.append(k)
                        elif not re.search(ANTARTIDA, clave(nom)):
                            sin_par.append(f"{cod}:{nom}")
                    suma["votos"].update(x["votos"])
                    for k in ("pos", "bl", "nu", "vot", "ele"):
                        suma[k] += x[k]
                    todos_ele &= bool(x["ele"])
                    todos_vot &= bool(x["vot"])
                    if not cods:
                        continue
                    nombre = "Sin dato por departamento" if entera else g[0][0] if len(g) == 1 else f"{g[0][0]} y {len(g) - 1} más"
                    previo = lugares.get(cods[0])
                    if previo:
                        choques.add(f"{cod}: {previo['nombre']} + {nombre}")
                        previo["x"]["votos"].update(x["votos"])
                        for k in ("pos", "bl", "nu", "vot", "ele"):
                            previo["x"][k] += x[k]
                        previo["nombre"] = f"{previo['nombre']} y {nombre}"
                        for c in cods:
                            if c not in previo["cods"]:
                                previo["cods"].append(c)
                    else:
                        lugares[cods[0]] = {"cods": cods, "x": x, "nombre": nombre}
                for lugar in lugares.values():
                    cods, x, nombre = lugar["cods"], lugar["x"], lugar["nombre"]
                    pares = [y for li, v in sorted(x["votos"].items(), key=lambda z: (-z[1], z[0])) for y in (li, v)]
                    filas.append([cods[0], "d" if len(cods) == 1 else [f"{c}|d" for c in cods], x["ele"], x["vot"], pares])
                    nombres_sec[cods[0]] = nombre
                    if not entera:
                        tabla.append((cods[0], nombre, x))
            provincias[cod] = {"ed": "circ1951" if epoca == "circ1951" else f"dep{epoca}", "nivel": "provincia" if entera or caba_sin_limites else "departamento", "con": 100, "secciones": nombres_sec, "filas": filas}
            if tabla:
                nombres = sorted(listas, key=listas.get)
                usadas = sorted({li for t in tabla for li in t[2]["votos"]}, key=lambda li: -sum(t[2]["votos"].get(li, 0) for t in tabla))
                (MESAS / id_).mkdir(parents=True, exist_ok=True)
                with open(MESAS / id_ / f"{cod}.csv", "w", encoding="utf-8", newline="") as h:
                    w = csv.writer(h, lineterminator="\n")
                    w.writerow(["seccion_id", "seccion", "circuito", "mesa", "electores", "blancos", "nulos", "recurridos_impugnados"] + [nombres[li] for li in usadas])
                    for s, nom, x in tabla:
                        w.writerow([s, nom, "", "", x["ele"], x["bl"], x["nu"], max(0, x["vot"] - x["pos"] - x["bl"] - x["nu"])] + [x["votos"].get(li, 0) for li in usadas])
                con_tabla.append(cod)
            pais.append((cod, suma, todos_ele, todos_vot))
            info[cod] = {"nivel": provincias[cod]["nivel"], "unidades": len(filas_u), "distintas": len(grupos), "positivos": suma["pos"]}
        nombres = sorted(listas, key=listas.get)
        (MESAS / id_).mkdir(parents=True, exist_ok=True)
        with open(MESAS / id_ / "pais.csv", "w", encoding="utf-8", newline="") as h:
            w = csv.writer(h, lineterminator="\n")
            w.writerow(["codigo_indec", "provincia", "lista", "votos", "electores", "votantes", "blancos", "nulos"])
            for cod, suma, todos_ele, todos_vot in pais:
                for li, v in sorted(suma["votos"].items(), key=lambda z: -z[1]):
                    w.writerow([cod, idx["provincias"][cod], nombres[li], v, suma["ele"] if todos_ele else "", suma["vot"] if todos_vot else "", suma["bl"] or "", suma["nu"] or ""])
        # qué parte de los votos de la elección reúne esto, contra el resultado nacional que trae el atlas
        nac = d["modes"][0].get("national") or {}
        met = {x[0]: x[1] for x in (nac.get("metrics") or [])}
        total_nac = next((numero(met[k], 0) for k in ("Votos positivos", "Votos válidos", "Votos a candidatos") if met.get(k)), 0) or sum(c.get("votes") or 0 for c in nac.get("cands") or [])
        pos_tot = sum(s["pos"] for _c, s, _e, _v in pais)
        reune = round(100 * pos_tot / total_nac, 1) if total_nac else None
        lista_f = sorted(fuerzas.values(), key=lambda x: x["ix"])
        doc = {"id": id_, "periodo": "circ1951" if epoca == "circ1951" else f"dep{epoca}", "unidad": "departamento", "rotulo": "circunscripcion" if epoca == "circ1951" else "departamento", "fuente": fuente, "historica": True,
               "aviso": AVISOS.get(a, ""), "reune": reune, "caba_entera": caba_entera, "listas": nombres, "fuerza": fuerza_de, "fuerzas": [{"id": x["id"], "n": x["n"], "c": x["c"]} for x in lista_f], "provincias": provincias}
        (MESAS / "mapa" / f"{id_}.json").write_text(json.dumps(doc, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8", newline="\n")
        el = {"id": id_, "anio": anio, "vuelta": vuelta, "cargo": cargo, "etiqueta": etiq, "nivel": "departamento", "recuento": None, "fuente": fuente, "provincias": sorted(provincias), "departamentos": con_tabla}
        if epoca == "circ1951":
            el["rotulo"] = "circunscripcion"
        nuevas.append(el)
        # control: el reparto de lo que reúne, contra el reparto nacional que trae el atlas
        por_f = collections.Counter()
        for _c, s, _e, _v in pais:
            for li, v in s["votos"].items():
                por_f[fuerza_de[li]] += v
        arriba = [(lista_f[i]["n"][:26], round(100 * v / pos_tot, 1)) for i, v in por_f.most_common(2)] if pos_tot else []
        nac_top = [(cand.get(c["code"], {}).get("n", c["code"])[:20], c.get("pct")) for c in (nac.get("cands") or [])[:2]]
        informe[id_] = {"reune": reune, "sin_par": sin_par, "parecidos": sorted(parecidos), "choques": sorted(choques), "provincias": info}
        if choques:
            print("     en el mismo lugar:", sorted(choques)[:6], flush=True)
        parecidos_todos |= parecidos
        enteras = [c for c, p in provincias.items() if p["nivel"] == "provincia"]
        print(f"{id_:26s} {len(provincias):2d} jur, reúne {reune}%, {sum(len(p['filas']) for p in provincias.values())} lugares, enteras {enteras}, sin par {len(sin_par)} {sin_par[:5]}\n     acá {arriba} nacional {nac_top}", flush=True)

    idx["elecciones"] = nuevas + idx["elecciones"]
    idx["desde"] = min(e["anio"] for e in nuevas)
    (MESAS / "indice.json").write_text(json.dumps(idx, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8", newline="\n")
    t = RESUMEN.read_bytes().decode("utf-8")
    t2 = re.sub(r'("resumen"\s*:\s*\{[^}]*?"desde"\s*:\s*)\d{4}', rf'\g<1>{idx["desde"]}', t)
    RESUMEN.write_bytes(t2.encode("utf-8"))
    CONTROL.write_text(json.dumps({"_": "Lo que armó scripts/elecciones_antiguas.py. No se edita a mano.", "elecciones": informe}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")
    print("Unidos por parecido:", json.dumps(sorted(parecidos_todos), ensure_ascii=False))

    if args.solo_resultados:
        return
    def mapshaper(*pasos):
        subprocess.run(["npx", "--yes", "mapshaper@0.6.102", *map(str, pasos)], check=True, capture_output=True, text=True, shell=os.name == "nt")

    with tempfile.TemporaryDirectory() as tmp:
        tmp = pathlib.Path(tmp)

        def geojson(shp):
            salida = tmp / (re.sub(r"\W+", "_", shp.stem) + ".json")
            mapshaper(shp, "encoding=utf8", "-proj", "wgs84", "-o", "format=geojson", salida)
            return json.loads(salida.read_text(encoding="utf-8"))["features"]

        secc_f = geojson(F / "geo" / f"{SECC_CF}.shp")
        ediciones = {}
        for epoca, base in SHP.items():
            feats = []
            for x in geojson(F / "geo" / f"{base}.shp"):
                p = x["properties"]
                if re.search(ANTARTIDA, clave(p["DEPTO"])) or not x["geometry"] or (p["PROV_COD"] == "02" and epoca not in ("1914", "1947")):
                    continue
                feats.append({"type": "Feature", "properties": {"p": p["PROV_COD"], "s": codigo_geo(p, repetidos[epoca]), "c": "d"}, "geometry": x["geometry"]})
            if epoca not in ("1914", "1947"):
                feats += [{"type": "Feature", "properties": {"p": "02", "s": x["properties"]["LINK_"], "c": "d"}, "geometry": x["geometry"]} for x in secc_f if x["geometry"]]
            ediciones[f"dep{epoca}"] = feats
        feats = []
        for x in circ51["features"]:
            p = x["properties"]
            if x["geometry"]:
                cod, s = cod51[(p["provincia"], p["unidad"])]
                feats.append({"type": "Feature", "properties": {"p": cod, "s": s, "c": "d"}, "geometry": x["geometry"]})
        ediciones["circ1951"] = feats
        for ed, feats in ediciones.items():
            base = tmp / f"n{ed}.json"
            base.write_text(json.dumps({"type": "FeatureCollection", "features": feats}), encoding="utf-8")
            destino = MESAS / "geo" / ed
            destino.mkdir(parents=True, exist_ok=True)
            mapshaper(base, "snap", "-clean", "-simplify", f"interval={INTERVALO_PAIS}", "keep-shapes", "-clean", "-dissolve", "p,s,c", "-rename-layers", "circuitos", "-o", "format=topojson", "quantization=1e5", MESAS / "geo" / f"pais-{ed}.topo.json")
            for cod in sorted({f["properties"]["p"] for f in feats}):
                e = tmp / f"p{ed}_{cod}.json"
                e.write_text(json.dumps({"type": "FeatureCollection", "features": [f for f in feats if f["properties"]["p"] == cod]}), encoding="utf-8")
                mapshaper(e, "snap", "-clean", "-simplify", f"interval={INTERVALO_PROV}", "keep-shapes", "-clean", "-dissolve", "p,s,c", "-rename-layers", "circuitos", "-o", "format=topojson", "quantization=1e5", destino / f"{cod}.topo.json")
            print("dibujó", ed, (MESAS / "geo" / f"pais-{ed}.topo.json").stat().st_size, sum(f.stat().st_size for f in destino.glob("*")), flush=True)


if __name__ == "__main__":
    main()
