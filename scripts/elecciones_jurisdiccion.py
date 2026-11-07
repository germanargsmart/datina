"""Elecciones que llegan solo al total de cada jurisdicción, con fuentes oficiales (pedido del autor del 7 de noviembre de 2026: "sumá los senadores por la
Capital y los gobernadores"). Mapa de las fuentes: docs/roadmap/ELECCIONES_PROVINCIAS.md.

Lee datos/manual/mesas_jurisdiccion.csv, transcripto a mano de los documentos oficiales (la DINE, las juntas y tribunales electorales y los gobiernos
provinciales), con la fuente y la dirección de cada fila, y escribe en sitio/datos/mesas/:
  {eleccion}/pais.csv     una fila por jurisdicción y lista, con las mismas columnas que las otras elecciones por jurisdicción
  mapa/{eleccion}.json    cada jurisdicción pintada con su resultado (geo/provincias.topo.json, que ya existe)
  indice.json             suma estas elecciones, con la fecha, la fuente y las notas de cada jurisdicción, y las que votaron sin fuente oficial en línea

Se corre después de los otros cinco programas de Elecciones por mesa (MESAS.md): elecciones_mesas.py reescribe el índice. Sacar del índice lo que armó
antes y volver a armarlo da los mismos archivos. No baja nada y tarda menos de un segundo.

    python scripts/elecciones_jurisdiccion.py
"""
import csv
import json
import pathlib
import re
import sys
from collections import defaultdict

RAIZ = pathlib.Path(__file__).resolve().parent.parent
MESAS = RAIZ / "sitio" / "datos" / "mesas"
DATOS = RAIZ / "datos" / "manual" / "mesas_jurisdiccion.csv"
FUERZAS = RAIZ / "datos" / "manual" / "mesas_fuerzas.json"
COLUMNAS = ["cargo", "anio", "vuelta", "fecha", "codigo_indec", "lista", "suma_a", "votos", "electores", "votantes", "blancos", "nulos", "fuente", "url", "nota"]
ORIGEN = "jurisdiccion"   # marca en el índice de lo que arma este programa: lo demás no se toca

PROVINCIAS = {"02": "CABA", "06": "Buenos Aires", "10": "Catamarca", "14": "Córdoba", "18": "Corrientes", "22": "Chaco", "26": "Chubut", "30": "Entre Ríos",
              "34": "Formosa", "38": "Jujuy", "42": "La Pampa", "46": "La Rioja", "50": "Mendoza", "54": "Misiones", "58": "Neuquén", "62": "Río Negro",
              "66": "Salta", "70": "San Juan", "74": "San Luis", "78": "Santa Cruz", "82": "Santa Fe", "86": "Santiago del Estero", "90": "Tucumán",
              "94": "Tierra del Fuego"}
MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]

# Elecciones de gobernador que se votaron y no tienen un escrutinio oficial publicado en línea (revisado el 7 de noviembre de 2026, ELECCIONES_PROVINCIAS.md).
# La página dice que se votó y que falta la fuente, en vez de "no eligió". Las de un año en que ninguna de las cinco jurisdicciones tiene fuente (CABA 1996,
# Corrientes 2021 y la segunda vuelta de Corrientes 2001) no tienen elección en la página: lo dice MESAS.md
SIN_FUENTE = {("gobernador", 1983, "general"): ["90"], ("gobernador", 1987, "general"): ["30", "90"], ("gobernador", 1991, "general"): ["90"],
              ("gobernador", 1995, "general"): ["30", "90"], ("gobernador", 1999, "general"): ["90"], ("gobernador", 2003, "general"): ["30"],
              ("gobernador", 2007, "general"): ["30"]}

# las dos elecciones en que la fuente no cierra, con la diferencia exacta (listas + blancos + nulos - votantes) y su motivo en la nota del CSV. Cualquier otra
# diferencia frena el programa
DIFERENCIAS = {("gobernador", 2017, "general", "18"): 9,      # las alianzas suman 9 votos más que los válidos del mismo documento
               ("gobernador", 2025, "general", "18"): -230}   # los positivos de las personas privadas de libertad, sin repartir entre las fórmulas

# las jurisdicciones con sus gobernadores mapeados (la primera tanda de ELECCIONES_PROVINCIAS.md): la página dice que por ahora están solo estas
CUBRE = ["02", "06", "18", "30", "90"]

# lo que dice la página de las jurisdicciones que no están en una elección
FUERA = {"gobernador": "Todavía sin datos de gobernador de esta jurisdicción",
         "senadores": "Sus senadores los elegía la Legislatura provincial, y solo la Capital los votaba"}
GRIS = {"gobernador": "Sin datos de esta jurisdicción, o sin escrutinio oficial en línea",
        "senadores": "Senadores elegidos por la Legislatura provincial"}

# el color de cada lista en el mapa: primero el de su nombre en mesas_fuerzas.json, después estas reglas. Una lista que no entra en ninguna va en "otras"
# y el programa la nombra al terminar. "Frente de Todos" antes de 2019 es el de Corrientes, con la UCR (la misma regla que el Congreso en 02_procesar.py)
# Primero van las reglas que dependen de la jurisdicción y del año, porque el mismo nombre fue otra fuerza: "Frente de Todos" antes de 2019 es el de
# Corrientes, con la UCR (la misma regla que el Congreso en 02_procesar.py), y Encuentro por Corrientes fue de la UCR antes de sumarse a Cambiemos
PRIMERO = [(r"^(alianza )?frente de todos$", lambda a, c: "ucr" if a < 2019 else None),
           (r"^(autonomista|liberal)$|^alianza \(liberal, autonomista|^alianza pacto", lambda a, c: "pacto" if c == "18" else None),
           (r"^encuentro por corrientes$", lambda a, c: "ucr" if a < 2015 else None),
           (r"^frente corrientes podemos m[aá]s$|^limpiar corrientes$", lambda a, c: "peronismo" if c == "18" else None),
           (r"^frente fundacional$", lambda a, c: "peronismo" if c == "90" else None)]   # el frente del PJ de Tucumán en 2003
# después, el nombre en mesas_fuerzas.json, y por último estas
REGLAS = [(r"justicialis|frente para la victoria|uni[oó]n por la patria|frente de todos|frejupo|concertaci[oó]n justicialista", lambda a, c: "peronismo"),
          (r"alianza (para|por) el trabajo, la justicia", lambda a, c: "alianza"),
          (r"pa[ií]s solidario", lambda a, c: "frepaso"),
          (r"uni[oó]n c[ií]vica radical|acuerdo c[ií]vico y social|frente progresista c[ií]vico y social|encuentro por corrientes|vamos corrientes",
           lambda a, c: "ucr"),
          (r"cambiemos|juntos por el cambio|\bpro\b|propuesta republicana|compromiso para el cambio", lambda a, c: "cambiemos"),
          (r"libertad avanza", lambda a, c: "lla"),
          (r"coalici[oó]n c[ií]vica|afirmaci[oó]n para una rep", lambda a, c: "coalicion"),
          (r"frente de izquierda", lambda a, c: "izquierda"),
          (r"pacto autonomista|autonomista.liberal", lambda a, c: "pacto")]
# fuerzas que no están en mesas_fuerzas.json, con el color que ya usan los mapas por departamento de esta herramienta (FUERZA_SENADO en
# elecciones_departamentos.py) o, para el conservadurismo correntino, el de los conservadores en 257arg
FUERZAS_PROPIAS = {"alianza": {"nombre": "Alianza para el Trabajo, la Justicia y la Educación", "color": "#DC0143"},
                   "frepaso": {"nombre": "Frente País Solidario", "color": "#A349A4"},
                   "pacto": {"nombre": "Pacto Autonomista Liberal", "color": "#1F2F6B"}}


def entero(v, fila, campo):
    try:
        return int(v)
    except ValueError:
        sys.exit(f"mesas_jurisdiccion.csv, {fila}: {campo} no es un número entero ({v!r})")


def enumerar(cosas):
    """'CABA, Buenos Aires y Tucumán'."""
    return cosas[0] if len(cosas) == 1 else f"{', '.join(cosas[:-1])} y {cosas[-1]}"


def fecha_texto(f):
    """'2019-06-09' pasa a '9 de junio': el año ya va en el nombre de la elección."""
    _, m, d = f.split("-")
    return f"{int(d)} de {MESES[int(m) - 1]}"


def leer():
    filas = list(csv.DictReader(open(DATOS, encoding="utf-8", newline="")))
    if not filas or list(filas[0]) != COLUMNAS:
        sys.exit(f"mesas_jurisdiccion.csv: las columnas tienen que ser {COLUMNAS}")
    elecciones = defaultdict(lambda: defaultdict(list))
    for n, r in enumerate(filas, start=2):
        if r["cargo"] not in FUERA or r["vuelta"] not in ("general", "segunda") or r["codigo_indec"] not in PROVINCIAS:
            sys.exit(f"mesas_jurisdiccion.csv, fila {n}: cargo, vuelta o código desconocido")
        if not re.fullmatch(r"\d{4}-\d\d-\d\d", r["fecha"]) or r["fecha"][:4] != r["anio"]:
            sys.exit(f"mesas_jurisdiccion.csv, fila {n}: la fecha {r['fecha']} no es del año {r['anio']}")
        if not r["fuente"] or not r["url"].startswith("https://"):
            sys.exit(f"mesas_jurisdiccion.csv, fila {n}: falta la fuente o la dirección")
        if ";" in r["nota"] + r["lista"]:
            sys.exit(f"mesas_jurisdiccion.csv, fila {n}: punto y coma en un texto visible")
        for c in ("votos", "electores", "votantes", "blancos", "nulos"):
            r[c] = entero(r[c], n, c)
        elecciones[(r["cargo"], int(r["anio"]), r["vuelta"])][r["codigo_indec"]].append(r)
    return elecciones


def armar_jurisdiccion(clave, cod, filas):
    """Las listas de una jurisdicción, con los votos acumulados a su fórmula, y sus totales. Frena si algo no cierra."""
    t0 = filas[0]
    for r in filas:
        if any(r[c] != t0[c] for c in ("fecha", "electores", "votantes", "blancos", "nulos", "fuente")):
            sys.exit(f"{clave} {cod}: las filas no repiten los mismos totales")
    nombres = [r["lista"] for r in filas]
    if len(set(nombres)) != len(nombres):
        sys.exit(f"{clave} {cod}: una lista repetida")
    positivos = sum(r["votos"] for r in filas)
    if positivos + t0["blancos"] + t0["nulos"] - t0["votantes"] != DIFERENCIAS.get((*clave, cod), 0):
        sys.exit(f"{clave} {cod}: las listas ({positivos:,}), los blancos y los nulos no suman los votantes ({t0['votantes']:,})")
    # las listas que llevaron la misma fórmula, cuando la fuente acumula sus votos (Buenos Aires 1999): una sola fila con todos los nombres
    votos, con = {}, defaultdict(list)
    for r in filas:
        destino = r["suma_a"] or r["lista"]
        if destino not in nombres:
            sys.exit(f"{clave} {cod}: {r['lista']} suma a {destino}, que no está")
        if r["suma_a"] and next(x for x in filas if x["lista"] == destino)["suma_a"]:
            sys.exit(f"{clave} {cod}: {destino} suma a su vez a otra lista")
        votos[destino] = votos.get(destino, 0) + r["votos"]
        if r["suma_a"]:
            con[destino].append(r["lista"])
    listas = []
    for n, v in sorted(votos.items(), key=lambda x: (-x[1], x[0])):
        otras = con.get(n)
        listas.append((f"{n}, con {enumerar(otras)}" if otras else n, v))
    notas = [r["nota"].rstrip(".") + "." for r in filas if r["nota"]]
    return {"listas": listas, "electores": t0["electores"], "votantes": t0["votantes"], "blancos": t0["blancos"], "nulos": t0["nulos"],
            "fecha": t0["fecha"], "fuente": t0["fuente"], "url": t0["url"], "notas": notas}


def fuerza_de(lista, anio, cod, por_nombre):
    t = lista.lower()
    for rx, f in PRIMERO:
        if re.search(rx, t) and f(anio, cod):
            return f(anio, cod)
    if lista in por_nombre:
        return por_nombre[lista]
    for rx, f in REGLAS:
        if re.search(rx, t):
            return f(anio, cod)
    return "otras"


def main():
    elecciones = leer()
    idx = json.loads((MESAS / "indice.json").read_text(encoding="utf-8"))
    tabla_f = json.loads(FUERZAS.read_text(encoding="utf-8"))
    colores = {**tabla_f["fuerzas"], **FUERZAS_PROPIAS}
    # lo que armó este programa antes se saca, con sus carpetas: volver a correrlo da lo mismo
    viejas = [e["id"] for e in idx["elecciones"] if e.get("origen") == ORIGEN]
    for id_ in viejas:
        for f in (MESAS / id_).glob("*"):
            f.unlink()
        (MESAS / id_).rmdir()
        (MESAS / "mapa" / f"{id_}.json").unlink(missing_ok=True)
    idx["elecciones"] = [e for e in idx["elecciones"] if e.get("origen") != ORIGEN]
    ya = {e["id"] for e in idx["elecciones"]}
    cubre = enumerar(sorted((PROVINCIAS[c] for c in CUBRE), key=str.casefold))
    sin_color = set()
    for (cargo, anio, vuelta), por_cod in sorted(elecciones.items()):
        id_ = f"{anio}-{vuelta}-{cargo}"
        if id_ in ya:
            sys.exit(f"{id_}: ya existe en el índice y no lo armó este programa")
        juris = {cod: armar_jurisdiccion((cargo, anio, vuelta), cod, filas) for cod, filas in sorted(por_cod.items())}
        carpeta = MESAS / id_
        carpeta.mkdir(parents=True, exist_ok=True)
        with open(carpeta / "pais.csv", "w", encoding="utf-8", newline="\n") as h:
            w = csv.writer(h, lineterminator="\n")
            w.writerow(["codigo_indec", "provincia", "lista", "votos", "electores", "votantes", "blancos", "nulos"])
            for cod, j in juris.items():
                for n, v in j["listas"]:
                    w.writerow([cod, PROVINCIAS[cod], n, v, j["electores"] or "", j["votantes"], j["blancos"], j["nulos"]])
        # el mapa: cada jurisdicción, una fila, con el formato de los mapas por jurisdicción de elecciones_departamentos.py
        listas, fuerza, fuerzas, provincias = {}, [], {}, {}
        for cod, j in juris.items():
            pares = []
            for n, v in j["listas"]:
                if n not in listas:
                    listas[n] = len(listas)
                    f = fuerza_de(n.split(", con ")[0], anio, cod, tabla_f["listas"])
                    if f == "otras":
                        sin_color.add(n)
                    if f not in fuerzas:
                        fuerzas[f] = len(fuerzas)
                    fuerza.append(fuerzas[f])
                if v:
                    pares += [listas[n], v]
            provincias[cod] = {"ed": "provincias", "nivel": "provincia", "con": 100, "secciones": {}, "filas": [["", "", j["electores"], j["votantes"], pares]]}
        doc = {"id": id_, "periodo": "provincias", "unidad": "provincia", "listas": list(listas), "fuerza": fuerza,
               "fuerzas": [{"id": f, "n": colores[f]["nombre"], "c": colores[f]["color"]} for f in fuerzas], "provincias": provincias}
        (MESAS / "mapa" / f"{id_}.json").write_text(json.dumps(doc, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8", newline="\n")
        sin = [c for c in SIN_FUENTE.get((cargo, anio, vuelta), []) if c not in juris]
        el = {"id": id_, "anio": anio, "vuelta": vuelta, "cargo": cargo, "etiqueta": f"{anio}{', segunda vuelta' if vuelta == 'segunda' else ''}",
              "nivel": "provincia", "recuento": "definitivo", "provincias": sorted(juris), "origen": ORIGEN,
              "fechas": {c: fecha_texto(j["fecha"]) for c, j in juris.items()},
              "fuentes": {c: j["fuente"] for c, j in juris.items()},
              "notas": {c: " ".join(j["notas"]) for c, j in juris.items() if j["notas"]},
              "fuera": FUERA[cargo], "gris": GRIS[cargo]}
        if sin:
            el["sin_fuente"] = sin
        if cargo == "gobernador":
            el["nota_nivel"] = f"Por ahora, solo el total de cada jurisdicción, y solo los gobernadores de {cubre}."
        else:
            el["nota_nivel"] = "Para esta elección no hay datos que se puedan publicar por debajo de la jurisdicción."
        idx["elecciones"].append(el)
        ganador = {c: j["listas"][0][0] for c, j in juris.items()}
        print(f"{id_:26s} {', '.join(f'{c} {g[:40]}' for c, g in ganador.items())}" + (f" | sin fuente: {sin}" if sin else ""))
    (MESAS / "indice.json").write_text(json.dumps(idx, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8", newline="\n")
    if sin_color:
        print("Sin fuerza propia en el mapa (van en Otras fuerzas):", " | ".join(sorted(sin_color)))
    print(f"{len(elecciones)} elecciones por jurisdicción con fuente oficial")


if __name__ == "__main__":
    main()
