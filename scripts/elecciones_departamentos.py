"""
Los departamentos de Elecciones por mesa, de 1983 a 2009 (pedido del autor del 5 de noviembre de 2026: "usá por departamento"). Antes de 2011 no hay circuitos que se puedan publicar.
Lee los dataset_*.json de 257arg (azha2005, CC BY 4.0) y la geometría histórica de Rodríguez, CEUR-CONICET (CC BY 2.5 AR), y escribe, sin que 03 lo toque:
  sitio/datos/mesas/{eleccion}/{codigo_indec}.csv   una fila por departamento, con las columnas de las tablas por mesa
  sitio/datos/mesas/mapa/{eleccion}.json            igual que el mapa por circuito
  sitio/datos/mesas/geo/dep{anio}/...               los polígonos
y marca esas elecciones en indice.json con nivel "departamento". Se corre después de elecciones_mesas.py y elecciones_mapa.py, y una sola vez: estas elecciones ya no cambian.

Advertencias (docs/roadmap/MESAS.md):
- 257arg saca 1983 a 2001 de la base de Ernesto Calvo y 2003 a 2009 de PolAr, del Atlas de Andy Tow. Publica sus agregados con CC BY 4.0, pero dice que no redistribuye la base de Calvo. El autor decidió usarlos.
- Donde no tiene el dato por departamento, 257arg repite el total de la provincia en cada departamento (San Luis en 1997 suma 900%). Eso se detecta: esas filas se juntan en un lugar y no cuentan como departamentos.
- CABA tiene 28 circunscripciones hasta 2007 y su geometría no está publicada: el mapa la pinta entera, y la tabla sí las lista.

Uso: python scripts/elecciones_departamentos.py --fuentes CARPETA [--solo-resultados]
"""
import argparse
import collections
import csv
import difflib
import json
import os
import pathlib
import re
import struct
import subprocess
import sys
import tempfile
import time
import unicodedata
import urllib.parse
import urllib.request

RAIZ = pathlib.Path(__file__).resolve().parents[1]
MESAS = RAIZ / "sitio" / "datos" / "mesas"
CONTROL = RAIZ / "datos" / "manual" / "mesas_departamentos_control.json"
RAW = "https://raw.githubusercontent.com/azha2005/257arg/master/"
UA = {"User-Agent": "datina/1.0 (+https://datina.com.ar)"}
PROV = {"Capital Federal": "02", "Buenos Aires": "06", "Catamarca": "10", "Córdoba": "14", "Corrientes": "18", "Chaco": "22", "Chubut": "26", "Entre Ríos": "30", "Formosa": "34", "Jujuy": "38",
        "La Pampa": "42", "La Rioja": "46", "Mendoza": "50", "Misiones": "54", "Neuquén": "58", "Río Negro": "62", "Salta": "66", "San Juan": "70", "San Luis": "74", "Santa Cruz": "78", "Santa Fe": "82",
        "Santiago del Estero": "86", "Tucumán": "90", "Tierra del Fuego": "94"}
# atlas de 257arg -> elección de Datina y geometría de departamentos de su época. Los departamentos de la base de Rodríguez siguen los censos
ATLAS = {"1983": ("1983-general-presidente", "1991"), "1983dip": ("1983-general-diputados", "1991"), "1985": ("1985-general-diputados", "1991"), "1987": ("1987-general-diputados", "1991"),
         "1989": ("1989-general-presidente", "1991"), "1989dip": ("1989-general-diputados", "1991"), "1991": ("1991-general-diputados", "1991"), "1993": ("1993-general-diputados", "1991"),
         "1995": ("1995-general-presidente", "2001"), "1995dip": ("1995-general-diputados", "2001"), "1997": ("1997-general-diputados", "2001"), "1999": ("1999-general-presidente", "2001"),
         "1999dip": ("1999-general-diputados", "2001"), "2001": ("2001-general-diputados", "2001"), "2003": ("2003-general-diputados", "2001"), "2003pres": ("2003-general-presidente", "2001"),
         "2005": ("2005-general-diputados", "2001"), "2007": ("2007-general-diputados", "2001"), "2007pres": ("2007-general-presidente", "2001"), "2009": ("2009-general-diputados", "2010")}
ORIGEN = {"hasta2001": "la base de Ernesto Calvo", "desde2003": "PolAr, a partir del Atlas Electoral de Andy Tow"}
AVISOS = {"2003-general-diputados": "Los votos de esta elección salen de dat.ar y no cierran exactos: sirven para ver cómo se reparten, no para sumarlos."}
# la fuerza de cada bloque de 257arg, por su color o su nombre, para que una fuerza conserve el color del mapa por circuito. Lo demás conserva el suyo: el del logo
PERONISMO, UCR, CAMBIEMOS = "#1C8FE0", "#D31515", "#F5C400"
POR_COLOR = {"#318CE7": ("peronismo", "Peronismo", PERONISMO), "#50ADE6": ("peronismo", "Peronismo", PERONISMO), "#E10019": ("ucr", "Unión Cívica Radical", UCR),
             "#F4CE00": ("pro", "PRO", CAMBIEMOS), "#1AFF98": ("peronismo-federal", "Peronismo Federal", "#19C48A"), "#74B744": ("coalicion", "Coalición Cívica", "#6FB53E"), "#6FB53E": ("coalicion", "Coalición Cívica", "#6FB53E")}
INTERVALO_PROV = 300
INTERVALO_PAIS = 2500


def bajar(ruta, destino):
    if destino.exists() and destino.stat().st_size:
        return True
    destino.parent.mkdir(parents=True, exist_ok=True)
    try:
        destino.write_bytes(urllib.request.urlopen(urllib.request.Request(RAW + urllib.parse.quote(ruta), headers=UA), timeout=240).read())
        time.sleep(0.2)
        return True
    except Exception as e:
        print("no se pudo bajar", ruta, e)
        return False


def leer_dbf(ruta):
    b = ruta.read_bytes()
    n = struct.unpack("<I", b[4:8])[0]
    cab = struct.unpack("<H", b[8:10])[0]
    lar = struct.unpack("<H", b[10:12])[0]
    campos, i = [], 32
    while b[i] != 0x0D:
        campos.append((b[i:i + 11].split(b"\0")[0].decode("latin-1"), b[i + 16]))
        i += 32
    filas = []
    for k in range(n):
        r = b[cab + k * lar + 1: cab + (k + 1) * lar]
        p, d = 0, {}
        for c, l in campos:
            d[c] = r[p:p + l].decode("utf-8", "replace").strip()
            p += l
        filas.append(d)
    return filas


def sin_marcas(s):
    s = unicodedata.normalize("NFD", str(s or "").upper())
    return "".join(c for c in s if not unicodedata.combining(c))


# nombres que no coinciden entre los resultados y la base de departamentos: mismo lugar con otra escritura, medido al armar
ALIAS = {"ARRECIFESBARTOLOMEMITRE": "BARTOLOMEMITRE", "ARRECIFES": "BARTOLOMEMITRE", "CORONELDEMARINALEONARDOROSALES": "CORONELDEMARINALROSALES", "CORONELROSALES": "CORONELDEMARINALROSALES", "CNELROSALES": "CORONELDEMARINALROSALES",
         "ADOLFOGONZALESCHAVEZ": "ADOLFOGONZALESCHAVES", "BERAZETEGUI": "BERAZATEGUI", "GENERALMADARIAGA": "GENERALJUANMADARIAGA", "LEANDRONALEM": "LEANDRONALEM",
         "GENERALJOSEDESANMARTIN": "GENERALJOSEDESANMARTIN", "LIBERTADORGRALSANMARTIN": "LIBERTADORGENERALSANMARTIN"}


ABREVIADOS = [(r"\b(GRAL|GNRAL|GENERAL)\b\.?", "GENERAL "), (r"\b(CNEL|CRNEL|CORONEL)\b\.?", "CORONEL "), (r"\b(PDTE|PTE|PRESIDENTE)\b\.?", "PRESIDENTE "), (r"\b(SGTO|SARGENTO)\b\.?", "SARGENTO "),
              (r"\b(DR|DOCTOR)\b\.?", "DOCTOR "), (r"\b(TTE|TENIENTE)\b\.?", "TENIENTE "), (r"\b(STA|SANTA)\b\.?", "SANTA "), (r"\bSTO\b\.?", "SANTO "), (r"\bMA\b\.?", "MARIA "), (r"\bL\.\s*", "LEONARDO "),
              (r"\bNUEVE\b", "9 "), (r"\bVEINTICINCO\b", "25 "), (r"\bDOCE\b", "12 "), (r"\bDOS\b", "2 "), (r"\bPRIMERO\b", "1 "), (r"\b1RO\b\.?", "1 "), (r"\bCOMUNA\s*0*", "COMUNA ")]


# departamentos que cambiaron de nombre, en su provincia: La Rioja renombró tres en los años ochenta, y la capital de Jujuy y la de Tucumán figuran de dos maneras
ALIAS_PROV = {("38", "CAPITAL"): "DOCTORMANUELBELGRANO", ("46", "GENERALLAVALLE"): "CORONELFELIPEVARELA", ("46", "GENERALSARMIENTO"): "VINCHINA", ("46", "GOBERNADORGORDILLO"): "CHAMICAL",
              ("54", "GENERALSANMARTIN"): "LIBERTADORGENERALSANMARTIN", ("86", "BRIGADIERJFELIPEIBARRA"): "JUANFIBARRA", ("90", "SANMIGUELDETUCUMAN"): "CAPITAL", ("74", "JUANMARTINDEPUEYRREDONLACAPITAL"): "LACAPITAL"}


def clave(s, cod=None):
    t = sin_marcas(str(s).split("·")[0])
    for a, b in ABREVIADOS:
        t = re.sub(a, b, t)
    k = re.sub(r"[^A-Z0-9]", "", t)
    return ALIAS_PROV.get((cod, k)) or ALIAS.get(k, k)


def buscar_departamento(nombres, nombre, cod):
    """El código del departamento: por su nombre, o si no, por el más parecido que quede bastante cerca. Lo que se une así queda en el control para revisarlo."""
    k = clave(nombre, cod)
    if k in nombres:
        return nombres[k], None
    cerca = difflib.get_close_matches(k, list(nombres), n=1, cutoff=.78)
    if cerca:
        return nombres[cerca[0]], cerca[0]
    return None, None


def titulo(s):
    """Las listas de 2003 a 2009 llegan en mayúsculas."""
    s = re.sub(r"\s+", " ", str(s)).strip()
    if s != s.upper():
        return s
    t = s.title()
    t = re.sub(r"(?<=\s)(De|Del|La|Las|Los|Y|E|Por|Para|Con|El|En|Al)(?=\s)", lambda m: m.group(1).lower(), t)
    for a, b in (("Union", "Unión"), ("Civica", "Cívica"), ("Republica", "República"), ("Accion", "Acción"), ("Frepaso", "Frepaso"), ("Pro ", "PRO "), ("Ari", "ARI"), ("Ucr", "UCR"), ("Mpn", "MPN"), ("Coalicion", "Coalición"), ("Nacion", "Nación"), ("Democrata", "Demócrata")):
        t = re.sub(rf"\b{a}\b", b, t)
    return t


def fuerzas_del_atlas(d, id_):
    """Cada lista con su fuerza. Los bloques de 257arg son las claves sin P_: con su nombre y el color de su logo."""
    cand = d["candidates"]
    bloques = {}
    for k, c in cand.items():
        if k.startswith("P_") or not c.get("base"):
            continue
        color = c["base"].upper()
        nombre = c.get("n") or k
        presidente = "presidente" in id_
        if c.get("sub") and presidente:
            nombre = f"{nombre} ({c['sub']})"
        if color == "#1C5ECE" and not presidente:
            bloques[k] = POR_COLOR["#318CE7"]   # el Partido Justicialista de 2003. En la presidencial de ese año es Menem, que compitió con Kirchner y Rodríguez Saá: cada uno con su color
        elif color in POR_COLOR and not presidente:
            bloques[k] = POR_COLOR[color]
        elif color in POR_COLOR:
            bloques[k] = (f"{POR_COLOR[color][0]}-{k}", titulo(nombre), POR_COLOR[color][2])
        else:
            bloques[k] = ("b-" + re.sub(r"[^a-z0-9]+", "-", sin_marcas(nombre).lower()).strip("-"), titulo(nombre), c["base"])
    # la lista ganadora de cada lugar dice a qué bloque va
    de_lista = {}
    for u in d["modes"][0]["units"]:
        if u.get("w") in bloques and u.get("lines"):
            de_lista.setdefault(u["lines"][0][0], u["w"])
    por_color_bloque = {}
    for k in bloques:
        por_color_bloque.setdefault(cand[k]["base"].upper(), k)
    return bloques, de_lista, por_color_bloque


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fuentes", required=True)
    ap.add_argument("--solo-resultados", action="store_true")
    args = ap.parse_args()
    F = pathlib.Path(args.fuentes).resolve() / "deptos"
    for a in ATLAS:
        bajar(f"mapas/mapa{a}/dataset_{a}.json", F / "datasets" / f"{a}.json")
    for base in ("Departamentos_1991", "Departamentos_2001", "Departamentos_2010"):
        for ext in ("shp", "shx", "dbf", "prj"):
            bajar(f"geometria/Base deptos 1869-2022/{base}.{ext}", F / "geo" / f"{base}.{ext}")

    # la geometría: código y nombre de cada departamento de cada época
    geo = {}
    for epoca in ("1991", "2001", "2010"):
        g = collections.defaultdict(dict)
        for x in leer_dbf(F / "geo" / f"Departamentos_{epoca}.dbf"):
            g[x["PROV_COD"]][clave(x["DEPTO"], x["PROV_COD"])] = x["LINK_"]
        geo[epoca] = g

    idx = json.loads((MESAS / "indice.json").read_text(encoding="utf-8"))
    por_id = {e["id"]: e for e in idx["elecciones"]}
    informe = {}
    todos_parecidos = set()
    (MESAS / "mapa").mkdir(parents=True, exist_ok=True)
    for a, (id_, epoca) in ATLAS.items():
        el = por_id[id_]
        d = json.load(open(F / "datasets" / f"{a}.json", encoding="utf-8"))
        cand = d["candidates"]
        unidades = d["modes"][0]["units"]
        bloques, de_lista, por_color_bloque = fuerzas_del_atlas(d, id_)
        por_prov = collections.defaultdict(list)
        for t, u in zip(d["territories"], unidades):
            por_prov[PROV[t["p"]]].append((t["n"], u))
        oficial = collections.Counter()
        with open(MESAS / id_ / "pais.csv", encoding="utf-8", newline="") as h:
            for r in csv.DictReader(h):
                oficial[r["codigo_indec"]] += int(r["votos"] or 0)
        provincias, listas, fuerzas, fuerza_de = {}, {}, {}, []
        sin_par = []
        parecidos = set()
        con_tabla = []
        info = {}

        def ix_lista(code):
            n = titulo(cand.get(code, {}).get("n", code))
            if n not in listas:
                listas[n] = len(listas)
                b = de_lista.get(code) or por_color_bloque.get(str(cand.get(code, {}).get("base", "")).upper())
                fz = bloques[b] if b else ("otras", "Otras fuerzas", "#98A2AE")
                if fz[0] not in fuerzas:
                    fuerzas[fz[0]] = {"id": fz[0], "n": fz[1], "c": fz[2], "ix": len(fuerzas)}
                fuerza_de.append(fuerzas[fz[0]]["ix"])
            return listas[n]

        for cod in el["provincias"]:
            filas_u = por_prov.get(cod, [])
            # 257arg avisa cuándo una unidad no tiene dato propio y lleva el total de la provincia: Tucumán 1991 sumaba el doble por Yerba Buena. Esas no cuentan. Si son todas, la provincia se pinta entera
            propias = [(n, u) for n, u in filas_u if "Sin dato propio" not in str(u.get("note") or "")]
            sin_propio = len(filas_u) - len(propias)
            if propias:
                filas_u = propias
            # lo repetido es la provincia entera puesta en cada departamento: se junta en un lugar
            grupos_u = collections.defaultdict(list)
            for nom, u in filas_u:
                grupos_u[json.dumps(u.get("lines") or [])].append((nom, u))
            filas, tabla = [], []
            sec_nombres = {}
            pos_prov = 0
            for _, g in grupos_u.items():
                u = g[0][1]
                if not u.get("lines"):
                    continue
                pares = []
                votos = collections.Counter()
                bl = nu = 0
                for code, v, _p in u["lines"]:
                    if code == "P_BLA":
                        bl = v or 0
                    elif code == "P_NUL":
                        nu = v or 0
                    elif v:
                        votos[ix_lista(code)] += v
                for li, v in sorted(votos.items(), key=lambda x: (-x[1], x[0])):
                    pares += [li, v]
                pos = sum(votos.values())
                pos_prov += pos
                met = {x[0]: x[1] for x in (u.get("metrics") or [])}
                num = lambda n: int(re.sub(r"[^\d]", "", str(met.get(n, "0"))) or 0)
                vot = num("Votantes") or pos + bl + nu
                ele = num("Inscriptos") or num("Electores de mesas con votos")
                if ele and vot > ele * 1.05:
                    ele = 0   # el padrón de la fuente no da: mejor sin participación que con una imposible
                codigos = []
                for nom, _u in g:
                    if cod == "02" and epoca != "2010":
                        continue
                    k, parecido = buscar_departamento(geo[epoca].get(cod, {}), nom, cod)
                    if parecido:
                        parecidos.add(f"{cod}: {nom} -> {parecido}")
                    if k:
                        codigos.append(k)
                    elif "ANTARTIDA" not in clave(nom):
                        sin_par.append(f"{cod}:{nom}")
                repetido = len(g) > 1
                if cod == "02" and epoca != "2010":
                    continue
                if not codigos:
                    continue
                s = codigos[0]
                sec_nombres[s] = g[0][0] if not repetido else "Sin dato por departamento"
                filas.append([s, "d" if len(codigos) == 1 else None, ele, vot, pares, None, codigos, repetido, bl, nu, g[0][0]])
            # CABA hasta 2007: la jurisdicción entera en el mapa. Las circunscripciones van solo en la tabla
            if cod == "02" and epoca != "2010":
                votos = collections.Counter()
                ele = vot = 0
                for nom, u in filas_u:
                    met = {x[0]: x[1] for x in (u.get("metrics") or [])}
                    num = lambda n: int(re.sub(r"[^\d]", "", str(met.get(n, "0"))) or 0)
                    vot += num("Votantes")
                    ele += num("Inscriptos") or num("Electores de mesas con votos")
                    for code, v, _p in u.get("lines") or []:
                        if code not in ("P_BLA", "P_NUL") and v:
                            votos[ix_lista(code)] += v
                pares = []
                for li, v in sorted(votos.items(), key=lambda x: (-x[1], x[0])):
                    pares += [li, v]
                pos_prov = sum(votos.values())
                if ele and vot > ele * 1.05:
                    ele = 0
                filas.append(["0", "d", ele, vot, pares, None, ["CABA"], False, 0, 0, "CABA"])
                sec_nombres["0"] = "CABA"
            nivel = "departamento"
            if len(grupos_u) == 1 and len(filas_u) > 1:
                nivel = "provincia"
            elif cod == "02" and epoca != "2010":
                nivel = "provincia"
            salida = []
            for f in filas:
                cs = f[6]
                salida.append([cs[0] if cs != ["CABA"] else "CABA", "d" if len(cs) == 1 else ["d"] * 0 or [f"{c}|d" for c in cs], f[2], f[3], f[4]])
            provincias[cod] = {"ed": f"dep{epoca}", "nivel": nivel, "con": 100, "secciones": {(f[6][0] if f[6] != ["CABA"] else "CABA"): ("Sin dato por departamento" if f[7] else f[10]) for f in filas}, "filas": salida}
            of = oficial.get(cod, 0)
            provincias[cod]["suma"] = round(100 * pos_prov / of, 1) if of else None
            # la tabla: una fila por departamento (o circunscripción) con dato propio, igual que las tablas por mesa
            if nivel == "departamento" or (cod == "02" and epoca != "2010"):
                tabla_filas = []
                vistos = set()
                for nom, u in filas_u:
                    clave_lin = json.dumps(u.get("lines") or [])
                    if not u.get("lines") or len(grupos_u[clave_lin]) > 1:
                        continue
                    met = {x[0]: x[1] for x in (u.get("metrics") or [])}
                    num = lambda n: int(re.sub(r"[^\d]", "", str(met.get(n, "0"))) or 0)
                    bl = nu = 0
                    votos = collections.Counter()
                    for code, v, _p in u["lines"]:
                        if code == "P_BLA":
                            bl = v or 0
                        elif code == "P_NUL":
                            nu = v or 0
                        elif v:
                            votos[ix_lista(code)] += v
                    pos = sum(votos.values())
                    vot = num("Votantes") or pos + bl + nu
                    ele = num("Inscriptos") or num("Electores de mesas con votos")
                    if ele and vot > ele * 1.05:
                        ele = 0
                    s = buscar_departamento(geo[epoca].get(cod, {}), nom, cod)[0] or re.sub(r"[^A-Z0-9]+", "-", sin_marcas(nom))[:24].strip("-")
                    if s in vistos:
                        continue
                    vistos.add(s)
                    tabla_filas.append((s, nom, ele, bl, nu, max(0, vot - pos - bl - nu), votos))
                if tabla_filas:
                    usadas = sorted({li for t in tabla_filas for li in t[6]}, key=lambda li: -sum(t[6].get(li, 0) for t in tabla_filas))
                    nombres = sorted(listas, key=listas.get)
                    ruta = MESAS / id_ / f"{cod}.csv"
                    with open(ruta, "w", encoding="utf-8", newline="") as h:
                        w = csv.writer(h, lineterminator="\n")
                        w.writerow(["seccion_id", "seccion", "circuito", "mesa", "electores", "blancos", "nulos", "recurridos_impugnados"] + [nombres[li] for li in usadas])
                        for s, nom, ele, bl, nu, re_, votos in tabla_filas:
                            w.writerow([s, nom, "", "", ele, bl, nu, re_] + [votos.get(li, 0) for li in usadas])
                    con_tabla.append(cod)
            info[cod] = {"nivel": nivel, "unidades": len(filas_u), "distintas": len(grupos_u), "sin_dato_propio": sin_propio, "suma_del_definitivo": provincias[cod]["suma"]}
        nombres = sorted(listas, key=listas.get)
        lista_fuerzas = sorted(fuerzas.values(), key=lambda x: x["ix"])
        doc = {"id": id_, "periodo": f"dep{epoca}", "unidad": "departamento", "origen": "hasta2001" if el["anio"] <= 2001 else "desde2003", "aviso": AVISOS.get(id_, ""), "listas": nombres, "fuerza": fuerza_de,
               "fuerzas": [{"id": x["id"], "n": x["n"], "c": x["c"]} for x in lista_fuerzas], "provincias": provincias}
        (MESAS / "mapa" / f"{id_}.json").write_text(json.dumps(doc, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8", newline="\n")
        el["nivel"] = "departamento"
        el["departamentos"] = con_tabla
        informe[id_] = {"sin_par": sin_par, "parecidos": sorted(parecidos), "provincias": info}
        todos_parecidos.update(parecidos)
        malas = {c: v["suma_del_definitivo"] for c, v in info.items() if v["suma_del_definitivo"] and abs(v["suma_del_definitivo"] - 100) > 3}
        rep = [c for c, v in info.items() if v["distintas"] < v["unidades"] and c != "02"]
        print(f"{id_:28s} sin par {len(sin_par):3d} {sin_par[:6]} | por provincia {[c for c, v in info.items() if v['nivel'] == 'provincia' and c != '02']} | con repetidos {rep} | lejos del definitivo {malas}", flush=True)

    # los senadores de 2001 a 2009 llegan solo a la jurisdicción: el mapa pinta cada una con el resultado oficial
    FUERZA_SENADO = [(r"justicialista|frente para la victoria|^de la victoria$|lealtad|peronis|frente c[ií]vico por santiago", ("peronismo", "Peronismo", PERONISMO)),
                     (r"para el trabajo, la justicia|alianza por mendoza", ("alianza", "Alianza para el Trabajo, la Justicia y la Educación", "#DC0143")),
                     # Frente de Todos, antes de 2019, es el de Corrientes y el Chaco, con la UCR: la misma regla que el Congreso en 02_procesar.py
                     (r"uni[oó]n c[ií]vica radical|acuerdo c[ií]vico|frente c[ií]vico y social|frente c[ií]vico federal|alianza frente de todos", ("ucr", "Unión Cívica Radical", UCR)),
                     (r"uni[oó]n por c[oó]rdoba", ("cordoba", "Unión por Córdoba", "#283084")),
                     (r"santa fe federal", ("peronismo-federal", "Peronismo Federal", "#19C48A")),
                     (r"socialista|frente progresista", ("progresismo", "Socialismo y frentes progresistas", "#FF7A1A")),
                     (r"fuerza republicana", ("fuerza-republicana", "Fuerza Republicana", "#7B3F00")),
                     (r"renovador de salta", ("renovador-salta", "Partido Renovador de Salta", "#8E44AD")),
                     (r"\bpro\b|propuesta republicana|compromiso para el cambio", ("pro", "PRO", CAMBIEMOS)),
                     (r"afirmaci[oó]n para una rep|coalici[oó]n c[ií]vica|\bari\b", ("coalicion", "Coalición Cívica", "#6FB53E")),
                     (r"movimiento popular neuquino", ("mpn", "Movimiento Popular Neuquino", "#00708B")),
                     (r"renovador de la concordia", ("concordia", "Frente Renovador de la Concordia", "#5C6BC0"))]
    for el in idx["elecciones"]:
        if el["nivel"] != "provincia":
            continue
        por_prov = {}
        with open(MESAS / el["id"] / "pais.csv", encoding="utf-8", newline="") as h:
            for r in csv.DictReader(h):
                x = por_prov.setdefault(r["codigo_indec"], {"e": int(r["electores"] or 0), "t": int(r["votantes"] or 0), "v": []})
                if int(r["votos"] or 0):
                    x["v"].append((r["lista"], int(r["votos"])))
        listas, fuerza_de, fuerzas, provincias = {}, [], {}, {}
        for cod, x in por_prov.items():
            pares = []
            for n, v in sorted(x["v"], key=lambda y: (-y[1], y[0])):
                if n not in listas:
                    listas[n] = len(listas)
                    t = n.lower()
                    fz = next((f for rx, f in FUERZA_SENADO if re.search(rx, t)), ("otras", "Otras fuerzas", "#98A2AE"))
                    if fz[0] not in fuerzas:
                        fuerzas[fz[0]] = {"id": fz[0], "n": fz[1], "c": fz[2], "ix": len(fuerzas)}
                    fuerza_de.append(fuerzas[fz[0]]["ix"])
                pares += [listas[n], v]
            provincias[cod] = {"ed": "provincias", "nivel": "provincia", "con": 100, "secciones": {}, "filas": [["", "", x["e"], x["t"], pares]]}
        doc = {"id": el["id"], "periodo": "provincias", "unidad": "provincia", "listas": sorted(listas, key=listas.get), "fuerza": fuerza_de, "fuerzas": [{"id": f["id"], "n": f["n"], "c": f["c"]} for f in sorted(fuerzas.values(), key=lambda f: f["ix"])], "provincias": provincias}
        (MESAS / "mapa" / f"{el['id']}.json").write_text(json.dumps(doc, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8", newline="\n")
        print(el["id"], {doc["listas"][p["filas"][0][4][0]][:30]: doc["fuerzas"][doc["fuerza"][p["filas"][0][4][0]]]["id"] for p in provincias.values() if p["filas"][0][4]}, flush=True)
    print("Unidos por parecido:", json.dumps(sorted(todos_parecidos), ensure_ascii=False))
    (MESAS / "indice.json").write_text(json.dumps(idx, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8", newline="\n")
    CONTROL.write_text(json.dumps({"_": "Lo que armó scripts/elecciones_departamentos.py. No se edita a mano.", "elecciones": informe}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")

    if args.solo_resultados:
        return
    # la geometría, con los mismos pasos que el mapa por circuito
    with tempfile.TemporaryDirectory() as tmp:
        tmp = pathlib.Path(tmp)
        for epoca in ("1991", "2001", "2010"):
            shp = F / "geo" / f"Departamentos_{epoca}.shp"
            gj = tmp / f"d{epoca}.json"
            subprocess.run(["npx", "--yes", "mapshaper@0.6.102", str(shp), "encoding=utf8", "-proj", "wgs84", "-o", "format=geojson", str(gj)], check=True, capture_output=True, text=True, shell=os.name == "nt")
            g = json.loads(gj.read_text(encoding="utf-8"))
            feats = []
            for x in g["features"]:
                p = x["properties"]
                cod, s = p["PROV_COD"], p["LINK_"]
                if re.search("ANTARTIC|ANTARTIDA|ATLANTICOSUR", clave(p["DEPTO"])) or not x["geometry"]:
                    continue
                if cod == "02" and epoca != "2010":
                    s = "CABA"   # sus distritos escolares no son las circunscripciones: la jurisdicción entera
                feats.append({"type": "Feature", "properties": {"p": cod, "s": s, "c": "d"}, "geometry": x["geometry"]})
            base = tmp / f"n{epoca}.json"
            base.write_text(json.dumps({"type": "FeatureCollection", "features": feats}), encoding="utf-8")
            destino = MESAS / "geo" / f"dep{epoca}"
            destino.mkdir(parents=True, exist_ok=True)
            subprocess.run(["npx", "--yes", "mapshaper@0.6.102", str(base), "snap", "-clean", "-simplify", f"interval={INTERVALO_PAIS}", "keep-shapes", "-clean", "-dissolve", "p,s,c", "-rename-layers", "circuitos", "-o", "format=topojson", "quantization=1e5", str(MESAS / "geo" / f"pais-dep{epoca}.topo.json")], check=True, capture_output=True, text=True, shell=os.name == "nt")
            for cod in PROV.values():
                sub = [f for f in feats if f["properties"]["p"] == cod]
                if not sub:
                    continue
                e = tmp / f"p{epoca}_{cod}.json"
                e.write_text(json.dumps({"type": "FeatureCollection", "features": sub}), encoding="utf-8")
                subprocess.run(["npx", "--yes", "mapshaper@0.6.102", str(e), "snap", "-clean", "-simplify", f"interval={INTERVALO_PROV}", "keep-shapes", "-clean", "-dissolve", "p,s,c", "-rename-layers", "circuitos", "-o", "format=topojson", "quantization=1e5", str(destino / f"{cod}.topo.json")], check=True, capture_output=True, text=True, shell=os.name == "nt")
            print("dibujó", epoca, (MESAS / "geo" / f"pais-dep{epoca}.topo.json").stat().st_size, sum(f.stat().st_size for f in destino.glob("*")), flush=True)


if __name__ == "__main__":
    main()
