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
# por departamento (o comuna, o circunscripción en CABA hasta 2007), con el código del INDEC del departamento en la cartografía de su época
DEPTOS = RAIZ / "datos" / "manual" / "mesas_jurisdiccion_departamentos.csv"
# por mesa, donde la fuente oficial lo publica: un archivo por elección y jurisdicción, {eleccion}-{codigo_indec}.csv, con el código del departamento
MESAS_DIR = RAIZ / "datos" / "manual" / "mesas_gobernador"
FIJAS_MESAS = ["codigo_departamento", "departamento", "circuito", "mesa", "electores", "blancos", "nulos", "recurridos_impugnados"]
# de dónde sale cada tabla por mesa, y las que son el escrutinio provisorio (el total de la jurisdicción siempre es el definitivo)
# el provisorio por mesa de la DINE (los ZIP de cada elección nacional, como 2011-provisorios_generales.zip), que trae el gobernador de las provincias
# que lo votaron con las nacionales. Solo donde hay un total oficial: San Juan, San Luis y Santa Cruz (2011 y 2015) y Catamarca 2015 están en el
# provisorio y no tienen total oficial en línea. En Entre Ríos 2011 la sección 2, sin nombre, es la parte rural de Paraná
DINE_MESAS = ({("2011-general-gobernador", c) for c in ("06", "30", "38")} | {("2015-general-gobernador", c) for c in ("06", "26", "30", "38", "54")}
              | {("2019-general-gobernador", c) for c in ("06", "10")} | {("2023-general-gobernador", c) for c in ("06", "10")})
FUENTES_MESAS = {"90": "la Junta Electoral Provincial de Tucumán", "18": "la Subdirección de Cómputos de Corrientes",
                 ("2025-general-gobernador", "18"): "la Junta Electoral de Corrientes",
                 ("2007-segunda-gobernador", "02"): "el Tribunal Superior de Justicia de CABA",
                 "02": "BA Data, el portal de datos abiertos de CABA",
                 "22": "el Tribunal Electoral del Chaco", "66": "el Tribunal Electoral de Salta",
                 **{x: "la Dirección Nacional Electoral" for x in DINE_MESAS}}
MESAS_PROVISORIO = {("2023-general-gobernador", "02"), *DINE_MESAS}
# por qué las mesas no suman el total de la jurisdicción, donde no lo dice el número solo
MOTIVO_MESAS = {("2007-segunda-gobernador", "02"): "la planilla por mesa es anterior a resolver 79 votos recurridos e impugnados",
                ("2015-segunda-gobernador", "02"): "los votos de las personas privadas de libertad van sin comuna",
                ("2019-general-gobernador", "02"): "el archivo por mesa no trae los votos de los extranjeros, y los de las personas privadas de libertad van sin comuna",
                ("2023-general-gobernador", "02"): "el provisorio no llegó a cargar todas las mesas",
                **{x: "el provisorio no llegó a cargar todas las mesas" for x in DINE_MESAS},
                **{(f"{a}-general-gobernador", "66"): "los votos observados e impugnados que resolvió el Tribunal van por municipio, sin mesa"
                   for a in (2011, 2019, 2023)}}
# lo que la tabla por mesa deja afuera aunque sume lo mismo que las listas del total
APARTE_MESAS = {("2025-general-gobernador", "18"): "sin las 45 mesas de las personas privadas de libertad"}
# por qué los departamentos no suman el total de la jurisdicción. En Corrientes 2025 la diferencia, lista por lista, es la de esas 45 mesas
MOTIVO_DEP = {("2025-general-gobernador", "18"): "la Junta suma esos votos en cada municipio",
              ("2007-general-gobernador", "38"): "la planilla del Tribunal cuenta 562 votantes en el total de la provincia y en ningún municipio",
              ("2019-general-gobernador", "54"): "el acta cuenta los votos de las fuerzas de seguridad y de los veedores solo en la planilla provincial",
              ("2023-general-gobernador", "54"): "el acta cuenta los votos del personal asignado a los centros de votación solo en la planilla provincial",
              ("2003-segunda-gobernador", "94"): "son los de la Antártida, que la planilla da aparte y no tiene departamento en el mapa",
              ("2015-general-gobernador", "94"): "son los de la Antártida, que la base del Juzgado da aparte y no tiene departamento en el mapa",
              ("2007-general-gobernador", "42"): "son los de las mesas especiales, que el documento da sin departamento",
              ("2011-general-gobernador", "42"): "son los de las mesas de las personas privadas de libertad, que el documento da sin departamento",
              ("2011-general-gobernador", "50"): "son los de las personas privadas de libertad, que el documento da sin departamento",
              ("2003-general-gobernador", "74"): ("el documento da a De la Lealtad Sanluiseña 130 votos más en los departamentos que en su total. Por "
                                                  "departamento no da blancos ni nulos: los votantes son la suma de las listas, y no hay participación"),
              ("2015-segunda-gobernador", "94"): "son los de la Antártida, que la base del Juzgado da aparte y no tiene departamento en el mapa"}
# los electores por departamento que no se publican porque el padrón municipal incluye a los extranjeros, que votan intendente y no gobernador
SIN_ELECTORES_DEP = {"38", "54"}
COLUMNAS_DEP = ["cargo", "anio", "vuelta", "codigo_indec", "departamento", "codigo_departamento", "lista", "votos", "electores", "votantes", "blancos", "nulos",
                "fuente", "url"]
ORIGEN = "jurisdiccion"   # marca en el índice de lo que arma este programa: lo demás no se toca

PROVINCIAS = {"02": "CABA", "06": "Buenos Aires", "10": "Catamarca", "14": "Córdoba", "18": "Corrientes", "22": "Chaco", "26": "Chubut", "30": "Entre Ríos",
              "34": "Formosa", "38": "Jujuy", "42": "La Pampa", "46": "La Rioja", "50": "Mendoza", "54": "Misiones", "58": "Neuquén", "62": "Río Negro",
              "66": "Salta", "70": "San Juan", "74": "San Luis", "78": "Santa Cruz", "82": "Santa Fe", "86": "Santiago del Estero", "90": "Tucumán",
              "94": "Tierra del Fuego"}
MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]

# Las elecciones de gobernador de cada jurisdicción desde 1983 (y alguna anterior con fuente oficial), "AAAA" la general y "AAAA segunda" el balotaje, según
# ELECCIONES_PROVINCIAS.md. De acá sale lo que la página dice de una jurisdicción que no está en una elección: si la votó y no hay escrutinio oficial
# publicado en línea, lo dice (SIN_FUENTE), y si no, que no eligió gobernador. Una elección de la tabla que no está en su calendario frena el programa.
# Las de un año en que ninguna jurisdicción tiene fuente (CABA 1996, Córdoba 1998, Corrientes 2021...) no tienen elección en la página: lo dice MESAS.md
CADA_4 = [str(a) for a in range(1983, 2024, 4)]
CALENDARIO = {
    "02": ["1996", "2000", "2003", "2003 segunda", "2007", "2007 segunda", "2011", "2011 segunda", "2015", "2015 segunda", "2019", "2023"],
    "06": CADA_4, "30": CADA_4, "90": CADA_4, "82": CADA_4, "50": CADA_4, "74": CADA_4, "26": CADA_4, "78": CADA_4, "58": CADA_4, "62": CADA_4, "42": CADA_4,
    "46": CADA_4, "70": CADA_4, "38": CADA_4, "66": CADA_4, "34": CADA_4,
    # Chaco: segunda vuelta desde la reforma de 1994, que solo hizo falta en 1995
    "22": [*CADA_4[:4], "1995 segunda", *CADA_4[4:]],
    # Catamarca: la de 1988, después de que terminara el mandato de Vicente Saadi, y la de 1991, después de la intervención federal
    "10": ["1983", "1987", "1988", *CADA_4[2:]],
    # Santiago del Estero: la intervención de 1993 a 1995, el gobernador elegido por la Legislatura en 2001 y la intervención de 2004 y 2005
    "86": ["1983", "1987", "1991", "1995", "1999", "2002", "2005", "2008", "2013", "2017", "2021", "2025"],
    # Corrientes: colegio electoral hasta 1991 (que no llegó a elegir), la elección anulada de 1992, directa desde 1993 con balotaje
    "18": ["1983", "1987", "1991", "1992", "1993", "1997", "1997 segunda", "2001", "2001 segunda", "2005", "2009", "2009 segunda", "2013", "2017", "2021",
           "2025"],
    # Córdoba adelantó su elección de 1999 al 20 de diciembre de 1998
    "14": ["1983", "1987", "1991", "1995", "1998", "2003", "2007", "2011", "2015", "2019", "2023"],
    # Misiones: la de 1975 tiene fuente oficial
    "54": ["1975", *CADA_4],
    # Tierra del Fuego, provincia desde 1990, con balotaje (en 1995, 2019 y 2023 no hizo falta)
    "94": ["1991", "1991 segunda", "1995", "1999", "1999 segunda", "2003", "2003 segunda", "2007", "2007 segunda", "2011", "2011 segunda", "2015",
           "2015 segunda", "2019", "2023"],
}


def sin_fuente(datos):
    """Lo que se votó y no tiene escrutinio oficial publicado en línea: {(cargo, año, vuelta): [códigos]}. Frena si un dato no está en su calendario."""
    hay = {(cod, f"{anio}" + (" segunda" if vuelta == "segunda" else "")) for (cargo, anio, vuelta), por_cod in datos.items() if cargo == "gobernador"
           for cod in por_cod}
    fuera = sorted(x for x in hay if x[1] not in CALENDARIO.get(x[0], []))
    if fuera:
        sys.exit(f"Elecciones de gobernador que no están en CALENDARIO: {fuera}")
    sin = defaultdict(list)
    for cod, eleccion in CALENDARIO.items():
        for e in eleccion:
            if (cod, e) not in hay:
                anio, _, vuelta = e.partition(" ")
                sin[("gobernador", int(anio), vuelta or "general")].append(cod)
    return {k: sorted(v) for k, v in sin.items()}


# las elecciones en que la fuente no cierra, con la diferencia exacta (listas + blancos + nulos - votantes) y su motivo en la nota del CSV. Cualquier otra
# diferencia frena el programa
DIFERENCIAS = {("gobernador", 2017, "general", "18"): 9,      # las alianzas suman 9 votos más que los válidos del mismo documento
               ("gobernador", 2025, "general", "18"): -230,   # los positivos de las personas privadas de libertad, sin repartir entre las fórmulas
               ("gobernador", 1987, "general", "26"): -72,    # la tabla de la Secretaría Electoral da 72 votantes más que sus listas, blancos y nulos
               ("gobernador", 1983, "general", "54"): -11124,  # Misiones: el total es el de quienes fueron a votar, y la columna de gobernador suma menos
               ("gobernador", 1987, "general", "54"): -900,    # Misiones: el documento suma 900 votos de "compensación de diferencias de actas"
               ("gobernador", 1999, "general", "22"): 16,      # Chaco: las listas, los blancos y los nulos del acta suman 16 más que sus votantes
               # los informes "Resultados históricos" de la DINE suman una "compensación de diferencias de actas" para llegar a los votantes
               ("gobernador", 1987, "general", "82"): -3362, ("gobernador", 1987, "general", "86"): -2565, ("gobernador", 1991, "general", "86"): -257,
               ("gobernador", 1987, "general", "90"): -222, ("gobernador", 1991, "segunda", "94"): -1000,
               ("gobernador", 1995, "general", "62"): -113, ("gobernador", 1987, "general", "66"): -563, ("gobernador", 1987, "general", "74"): -570,
               ("gobernador", 1987, "general", "78"): -110, ("gobernador", 1999, "general", "46"): -28,
               # Tierra del Fuego 2015: los votantes son el total de votos escrutados del Juzgado, que no es la suma de los de gobernador
               ("gobernador", 2015, "general", "94"): -1010, ("gobernador", 2015, "segunda", "94"): 79}

# lo mismo por departamento: en Corrientes 2017, en 13 departamentos las alianzas suman de 1 a 47 votos más que los válidos del mismo documento. Se publican
# como vienen, con un tope por departamento
DIFERENCIAS_DEP = {("gobernador", 2017, "general", "18"): 50}

# las jurisdicciones con sus gobernadores mapeados: mientras falte alguna, la página dice que por ahora están solo estas
CUBRE = sorted(CALENDARIO)
TODAS = len(CUBRE) == 24

# lo que dice la página de las jurisdicciones que no están en una elección (las que la votaron sin fuente van en sin_fuente)
FUERA = {"gobernador": "No eligió gobernador en esta elección" if TODAS else "Todavía sin datos de gobernador de esta jurisdicción",
         "senadores": "Sus senadores los elegía la Legislatura provincial, y solo la Capital los votaba"}
# en el gris de la leyenda caben las jurisdicciones que no eligieron, las que votaron sin escrutinio en línea y los departamentos sin mesas: el cuadro
# de cada lugar dice cuál
GRIS = {"gobernador": "Sin datos en esta elección" if TODAS else "Sin datos de esta jurisdicción, o sin escrutinio oficial en línea",
        "senadores": "Senadores elegidos por la Legislatura provincial"}

# el color de cada lista en el mapa: primero el de su nombre en mesas_fuerzas.json, después estas reglas. Una lista que no entra en ninguna va en "otras"
# y el programa la nombra al terminar. "Frente de Todos" antes de 2019 es el de Corrientes, con la UCR (la misma regla que el Congreso en 02_procesar.py)
# Primero van las reglas que dependen de la jurisdicción y del año, porque el mismo nombre fue otra fuerza: "Frente de Todos" antes de 2019 es el de
# Corrientes, con la UCR (la misma regla que el Congreso en 02_procesar.py), y Encuentro por Corrientes fue de la UCR antes de sumarse a Cambiemos
PRIMERO = [(r"^(alianza )?frente de todos$", lambda a, c: "ucr" if a < 2019 else None),
           (r"^(autonomista|liberal)$|^alianza \(liberal, autonomista|^alianza pacto", lambda a, c: "pacto" if c == "18" else None),
           (r"^encuentro por corrientes$", lambda a, c: "ucr" if a < 2015 else None),
           (r"^frente corrientes podemos m[aá]s$|^limpiar corrientes$", lambda a, c: "peronismo" if c == "18" else None),
           (r"^frente fundacional$", lambda a, c: "peronismo" if c == "90" else None),   # el frente del PJ de Tucumán en 2003
           # Santa Fe: el Frente Progresista lo encabezó el socialismo (Binner, Bonfatti, Lifschitz) y la Alianza Santafesina, la UCR. "Juntos" fue en
           # 2019 el frente del PJ (Perotti). Unidos para Cambiar Santa Fe lo encabezó la UCR (Pullaro), como Vamos Corrientes
           (r"^frente progresista,? c[ií]vico y social$", lambda a, c: "progresismo" if c == "82" else None),
           (r"^alianza santafesina$|^unidos para cambiar santa fe$", lambda a, c: "ucr" if c == "82" else None),
           (r"^juntos$", lambda a, c: "peronismo" if c == "82" and a == 2019 else None),
           # Misiones: el Frente Renovador de 2003 es el de Rovira, que después se llamó Frente Renovador de la Concordia (no el de Massa), y la Alianza
           # Frente para el Cambio de 1999, la del PJ con Rovira
           (r"^frente renovador$", lambda a, c: "concordia" if c == "54" else None),
           (r"^alianza frente para el cambio$", lambda a, c: "peronismo" if c == "54" else None),
           # el Frente Cívico y Social de Catamarca es de la UCR: el de Misiones (2015) no se sabe, y va en otras
           (r"^frente c[ií]vico y social$", lambda a, c: "otras" if c == "54" else None),
           # Chubut: los frentes de Das Neves (2015) y de Arcioni (2019), con el color de Chubut Somos Todos, y el Partido Acción Chubutense
           (r"^alianza (frente uni[oó]n chubut somos todos|chubut al frente)$", lambda a, c: "p-chubut-somos-todos" if c == "26" else None),
           (r"^acci[oó]n chubutense", lambda a, c: "p-partido-de-accion-chubutense" if c == "26" else None),
           # Chaco: los frentes del PJ de Capitanich (2011 a 2023), y Vamos Chaco en 2015, el de la UCR con el PRO (el nombre volvió en 2025 con
           # Provincias Unidas). El Frente de Todos de Chaco antes de 2019 es de la UCR, como el de Corrientes (la primera regla)
           (r"chaco merece m[aá]s$|^frente chaque[ñn]o$", lambda a, c: "peronismo" if c == "22" else None),
           (r"^vamos chaco$", lambda a, c: "cambiemos" if c == "22" and a < 2025 else None)]
# después, el nombre en mesas_fuerzas.json, y por último estas
REGLAS = [(r"justicialis|frente para la victoria|uni[oó]n por la patria|frente de todos|frejupo|concertaci[oó]n justicialista", lambda a, c: "peronismo"),
          # frentes provinciales del PJ: Santa Fe (2011 y 2023), Córdoba (2015, el Frente para la Victoria) y Mendoza (2019 y 2023)
          (r"^frente santa fe para todos$|^juntos avancemos$|^c[oó]rdoba podemos$|eleg[ií](?: mendoza)?$", lambda a, c: "peronismo"),
          (r"^hacemos unidos por c[oó]rdoba$", lambda a, c: "cordoba"),
          # frentes del PJ en Chubut (2019 y 2023), Río Negro (2023), Tierra del Fuego (2019, Bertone) y San Juan (2019, Uñac)
          (r"^alianza frente patri[oó]tico chubutense$|^alianza arriba chubut$|^vamos con todos$|^unidad fueguina$|unidad ciudadana|^frente todos$",
           lambda a, c: "peronismo"),
          # Cambiemos en Misiones (2015), Río Negro (2023), Santa Cruz (2019, el lema de la UCR y el PRO), La Rioja y San Juan (2019)
          (r"^frente vamos juntos$|^cambia r[ií]o negro$|^nueva santa cruz$|^juntos por la rioja$|^frente con vos$", lambda a, c: "cambiemos"),
          # Cambiemos en Córdoba (2015 y 2019) y en Mendoza (2019, como Cambia Mendoza en 2023)
          (r"^juntos por c[oó]rdoba$|^c[oó]rdoba cambia$|^frente cambia mendoza$", lambda a, c: "cambiemos"),
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


def natural(s):
    """'Circunscripción 2' antes que 'Circunscripción 10'."""
    return [int(x) if x.isdigit() else x for x in re.split(r"(\d+)", s)]


def miles(n):
    """1234567 pasa a '1.234.567'."""
    return f"{n:,}".replace(",", ".")


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
    listas, etiqueta = [], {}
    for n, v in sorted(votos.items(), key=lambda x: (-x[1], x[0])):
        otras = con.get(n)
        listas.append((f"{n}, con {enumerar(otras)}" if otras else n, v))
        for x in [n, *otras] if otras else [n]:
            etiqueta[x] = listas[-1][0]
    notas = [r["nota"].rstrip(".") + "." for r in filas if r["nota"]]
    return {"listas": listas, "etiqueta": etiqueta, "electores": t0["electores"], "votantes": t0["votantes"], "blancos": t0["blancos"], "nulos": t0["nulos"],
            "fecha": t0["fecha"], "fuente": t0["fuente"], "url": t0["url"], "notas": notas}


# departamentos que la cartografía de una época dibuja juntos: Lezama se separó de Chascomús en 2009 y la base de departamentos de 2010 todavía
# los tiene en un solo polígono, con otro código. En la tabla van separados y en el mapa se suman
JUNTOS_EN_EL_MAPA = {("2001", "06218"): "06217", ("2010", "06218"): "06217", ("2010", "06466"): "06217"}


def epoca(anio):
    """La cartografía de departamentos de cada elección: la misma regla que elecciones_departamentos.py."""
    return "1991" if anio <= 1993 else "2001" if anio <= 2007 else "2010"


def leer_departamentos():
    """Las filas por departamento, agrupadas por elección y jurisdicción: {código del departamento: {nombre, totales, votos por lista}}."""
    if not DEPTOS.exists():
        return {}
    filas = list(csv.DictReader(open(DEPTOS, encoding="utf-8", newline="")))
    if filas and list(filas[0]) != COLUMNAS_DEP:
        sys.exit(f"mesas_jurisdiccion_departamentos.csv: las columnas tienen que ser {COLUMNAS_DEP}")
    deps = defaultdict(lambda: defaultdict(dict))
    for n, r in enumerate(filas, start=2):
        if not r["fuente"] or not r["url"].startswith("https://"):
            sys.exit(f"mesas_jurisdiccion_departamentos.csv, fila {n}: falta la fuente o la dirección")
        for c in ("votos", "electores", "votantes", "blancos", "nulos"):
            r[c] = entero(r[c], n, c)
        d = deps[(r["cargo"], int(r["anio"]), r["vuelta"])][r["codigo_indec"]].setdefault(
            r["codigo_departamento"], {"nombre": r["departamento"], "electores": r["electores"], "votantes": r["votantes"], "blancos": r["blancos"],
                                       "nulos": r["nulos"], "fuente": r["fuente"], "votos": {}})
        if (d["electores"], d["votantes"], d["blancos"], d["nulos"]) != (r["electores"], r["votantes"], r["blancos"], r["nulos"]) or r["lista"] in d["votos"]:
            sys.exit(f"mesas_jurisdiccion_departamentos.csv, fila {n}: los totales del departamento no se repiten igual, o la lista está dos veces")
        d["votos"][r["lista"]] = r["votos"]
    for clave, por_cod in deps.items():
        for cod, ds in por_cod.items():
            for s, d in ds.items():
                dif = sum(d["votos"].values()) + d["blancos"] + d["nulos"] - d["votantes"]
                if dif and abs(dif) > DIFERENCIAS_DEP.get((*clave, cod), 0):
                    sys.exit(f"{clave} {cod} {d['nombre']}: las listas, los blancos y los nulos no suman los votantes")
    return deps


def departamentos_de_mesas(departamentos):
    """Las jurisdicciones con tabla por mesa y sin departamentos oficiales (Jujuy 2011, las del provisorio de la DINE): sus departamentos salen de sumar
    las mesas, para que el mapa muestre quién ganó en cada uno. Devuelve las que armó: {(cargo, año, vuelta, código): (recuento, fuente)}."""
    armadas = {}
    for ruta in sorted(MESAS_DIR.glob("*.csv")):
        m = re.fullmatch(r"(\d{4})-(general|segunda)-(\w+)-(\d\d)", ruta.stem)
        if not m:
            sys.exit(f"{ruta.name}: el nombre tiene que ser AAAA-vuelta-cargo-código.csv")
        anio, vuelta, cargo, cod = int(m[1]), m[2], m[3], m[4]
        if cod in departamentos.get((cargo, anio, vuelta), {}):
            continue
        id_ = f"{anio}-{vuelta}-{cargo}"
        rec = "provisorio" if (id_, cod) in MESAS_PROVISORIO else "definitivo"
        fuente = FUENTES_MESAS.get((id_, cod)) or FUENTES_MESAS[cod]
        filas = list(csv.reader(open(ruta, encoding="utf-8", newline="")))
        ls = filas[0][8:]
        ds = {}
        for r in filas[1:]:
            d = ds.setdefault(r[0], {"nombre": r[1], "electores": 0, "votantes": 0, "blancos": 0, "nulos": 0, "votos": defaultdict(int),
                                     "fuente": f"la suma de sus mesas, del escrutinio {rec} de {fuente}"})
            e, b, nu, rc = (int(x) for x in r[4:8])
            vs = [int(x) for x in r[8:]]
            d["electores"] += e; d["blancos"] += b; d["nulos"] += nu + rc; d["votantes"] += b + nu + rc + sum(vs)
            for n, x in zip(ls, vs):
                d["votos"][n] += x
        departamentos.setdefault((cargo, anio, vuelta), {})[cod] = {s: {**d, "votos": dict(d["votos"])} for s, d in ds.items()}
        armadas[(cargo, anio, vuelta, cod)] = (rec, fuente)
    return armadas


def codigos_geo(ep, cod):
    """Los departamentos de una jurisdicción en la cartografía de una época, como los dibuja la página."""
    g = json.loads((MESAS / "geo" / f"dep{ep}" / f"{cod}.topo.json").read_text(encoding="utf-8"))
    return sorted({x["properties"]["s"] for o in g["objects"].values() for x in o["geometries"]})


def nombres_geo(ep):
    """El nombre de cada departamento de una época, como lo muestran los otros mapas por departamento de la herramienta."""
    nombres = {}
    for f in sorted((MESAS / "mapa").glob("*.json")):
        d = json.loads(f.read_text(encoding="utf-8"))
        if d.get("periodo") == f"dep{ep}" and not d.get("oficial"):
            for pv in d["provincias"].values():
                nombres.update({s: n for s, n in pv.get("secciones", {}).items() if n != "Sin dato por departamento"})
    return nombres


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
    departamentos = leer_departamentos()
    faltan = set(departamentos) - set(elecciones)
    if faltan:
        sys.exit(f"mesas_jurisdiccion_departamentos.csv: elecciones sin su total en mesas_jurisdiccion.csv {sorted(faltan)}")
    nombres_ep = {ep: nombres_geo(ep) for ep in ("1991", "2001", "2010")}
    de_mesas = departamentos_de_mesas(departamentos)
    idx = json.loads((MESAS / "indice.json").read_text(encoding="utf-8"))
    tabla_f = json.loads(FUERZAS.read_text(encoding="utf-8"))
    colores = {**tabla_f["fuerzas"], **FUERZAS_PROPIAS}
    # lo que armó este programa antes se saca, con sus carpetas: volver a correrlo da lo mismo
    viejas = [e["id"] for e in idx["elecciones"] if e.get("origen") == ORIGEN]
    # (si una corrida anterior frenó a mitad de camino, las carpetas pueden no estar: el índice se escribe al final)
    for id_ in viejas:
        if (MESAS / id_).exists():
            for f in (MESAS / id_).glob("*"):
                f.unlink()
            (MESAS / id_).rmdir()
        (MESAS / "mapa" / f"{id_}.json").unlink(missing_ok=True)
    idx["elecciones"] = [e for e in idx["elecciones"] if e.get("origen") != ORIGEN]
    ya = {e["id"] for e in idx["elecciones"]}
    cubre = enumerar(sorted((PROVINCIAS[c] for c in CUBRE), key=str.casefold))
    sin_f = sin_fuente(elecciones)
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
        # el mapa: cada jurisdicción, una fila, con el formato de los mapas por jurisdicción de elecciones_departamentos.py, o, si alguna tiene
        # departamentos, una fila por departamento con la cartografía de la época (las que no, enteras)
        listas, fuerza, fuerzas, provincias = {}, [], {}, {}

        def pares_de(votos, cod):
            pares = []
            for n, v in sorted(votos.items(), key=lambda x: (-x[1], x[0])):
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
            return pares
        deps = departamentos.get((cargo, anio, vuelta), {})
        ep = epoca(anio)
        notas_dep = defaultdict(list)
        sin_mesas = {}   # los departamentos sin ninguna mesa, cuando el mapa sale de las mesas: van al final de la nota de las mesas
        caba_entera = False
        for cod, j in juris.items():
            pares = pares_de(dict(j["listas"]), cod)
            if not deps:
                provincias[cod] = {"ed": "provincias", "nivel": "provincia", "con": 100, "secciones": {}, "filas": [["", "", j["electores"], j["votantes"], pares]]}
                continue
            geo = codigos_geo(ep, cod)
            ds = deps.get(cod)
            if not ds or geo == ["CABA"]:
                # sin departamentos, o CABA antes de 2009: la jurisdicción entera, con todos sus polígonos
                provincias[cod] = {"ed": f"dep{ep}", "nivel": "provincia", "con": 100, "secciones": {geo[0]: "CABA" if geo == ["CABA"] else "Sin dato por departamento"},
                                   "filas": [[geo[0], "d" if len(geo) == 1 else [f"{c}|d" for c in geo], j["electores"], j["votantes"], pares]], "suma": 100.0}
                caba_entera |= geo == ["CABA"] and bool(ds)
                if not ds:
                    notas_dep[cod].append("En esta elección la fuente llega solo al total de la jurisdicción.")
            # la tabla: una fila por departamento, con las columnas de las tablas por mesa y las listas con el nombre del total de la jurisdicción
            if ds:
                cols = [n for n, _ in j["listas"]]
                por_dep = {}
                for s, d in ds.items():
                    v = defaultdict(int)
                    for n, x in d["votos"].items():
                        if n not in j["etiqueta"]:
                            sys.exit(f"{id_} {cod} {d['nombre']}: la lista {n} no está en el total de la jurisdicción")
                        v[j["etiqueta"][n]] += x
                    por_dep[s] = v
                nombre = {s: nombres_ep[ep].get(s, d["nombre"]) if geo != ["CABA"] else d["nombre"] for s, d in ds.items()}
                with open(carpeta / f"{cod}.csv", "w", encoding="utf-8", newline="\n") as h:
                    w = csv.writer(h, lineterminator="\n")
                    w.writerow(["seccion_id", "seccion", "circuito", "mesa", "electores", "blancos", "nulos", "recurridos_impugnados", *cols])
                    for s in sorted(ds, key=lambda s: natural(nombre[s])):
                        d = ds[s]
                        w.writerow([s, nombre[s], "", "", d["electores"], d["blancos"], d["nulos"], 0, *[por_dep[s].get(n, 0) for n in cols]])
                pos_dep = sum(sum(v.values()) for v in por_dep.values())
                pos = sum(v for _, v in j["listas"])
                if geo != ["CABA"]:
                    en_mapa = defaultdict(lambda: {"e": 0, "t": 0, "v": defaultdict(int), "n": []})
                    for s in sorted(ds, key=lambda s: nombre[s]):
                        m = en_mapa[JUNTOS_EN_EL_MAPA.get((ep, s), s)]
                        m["e"] += ds[s]["electores"]; m["t"] += ds[s]["votantes"]; m["n"].append(nombre[s])
                        for n, v in por_dep[s].items():
                            m["v"][n] += v
                    provincias[cod] = {"ed": f"dep{ep}", "nivel": "departamento", "con": 100, "secciones": {g: enumerar(m["n"]) for g, m in en_mapa.items()},
                                       "filas": [[g, "d", m["e"], m["t"], pares_de(m["v"], cod)] for g, m in sorted(en_mapa.items())],
                                       "suma": round(100 * pos_dep / pos, 1)}
                    sin = [c for c in geo if c not in en_mapa]
                    if sin and (cargo, anio, vuelta, cod) in de_mesas:
                        sin_mesas[cod] = (f"El escrutinio {de_mesas[(cargo, anio, vuelta, cod)][0]} no trae ninguna mesa de "
                                          f"{enumerar([nombres_ep[ep].get(c, c) for c in sin])}: queda sin pintar.")
                        sin = []
                    if sin or set(en_mapa) - set(geo):
                        sys.exit(f"{id_} {cod}: departamentos de la cartografía sin datos {sin}, o datos sin polígono {sorted(set(en_mapa) - set(geo))}")
                # en CABA, comunas desde 2009 y circunscripciones antes
                unidades = "Los departamentos" if cod != "02" else "Las comunas" if ep == "2010" else "Las circunscripciones"
                if (cargo, anio, vuelta, cod) in de_mesas:
                    pass   # lo dice la nota de las mesas, más abajo
                elif pos_dep != pos:
                    motivo_dep = MOTIVO_DEP.get((id_, cod))
                    notas_dep[cod].append(f"{unidades} suman {miles(abs(pos - pos_dep))} votos positivos {'menos' if pos_dep < pos else 'más'} que el total de la jurisdicción, "
                                          f"que es el oficial" + (f": {motivo_dep}." if motivo_dep else "."))
                if cod in SIN_ELECTORES_DEP and (cargo, anio, vuelta, cod) not in de_mesas:
                    notas_dep[cod].append(f"{unidades} van sin electores: el padrón por municipio de la fuente incluye a los extranjeros, que votan "
                                          "intendente y no gobernador.")
                fuentes_dep = sorted({d["fuente"] for d in ds.values()})
                if fuentes_dep != [j["fuente"]] and (cargo, anio, vuelta, cod) not in de_mesas:
                    notas_dep[cod].append(f"{unidades} salen de: {enumerar(fuentes_dep)}.")
        # por mesa: la tabla de la jurisdicción pasa a tener una fila por mesa, con el departamento como sección. El mapa sigue por departamento
        mesas_en = {}
        for cod, j in juris.items():
            ruta = MESAS_DIR / f"{id_}-{cod}.csv"
            if not ruta.exists():
                continue
            if not deps:
                sys.exit(f"{ruta.name}: ninguna jurisdicción de la elección tiene departamentos, y el mapa por departamento es el que lleva a la mesa")
            filas_m = list(csv.reader(open(ruta, encoding="utf-8", newline="")))
            if filas_m[0][:8] != FIJAS_MESAS:
                sys.exit(f"{ruta.name}: las columnas tienen que empezar por {FIJAS_MESAS}")
            ls = filas_m[0][8:]
            if set(ls) - set(j["etiqueta"]):
                sys.exit(f"{ruta.name}: listas que no están en el total de la jurisdicción {sorted(set(ls) - set(j['etiqueta']))}")
            cols = [n for n, _ in j["listas"]]
            vistas, pos_m = set(), 0
            with open(carpeta / f"{cod}.csv", "w", encoding="utf-8", newline="\n") as h:
                w = csv.writer(h, lineterminator="\n")
                w.writerow(["seccion_id", "seccion", "circuito", "mesa", "electores", "blancos", "nulos", "recurridos_impugnados", *cols])
                for r in filas_m[1:]:
                    if (r[0], r[2], r[3]) in vistas:
                        sys.exit(f"{ruta.name}: la mesa {r[3]} del circuito {r[2]} está dos veces")
                    vistas.add((r[0], r[2], r[3]))
                    v = defaultdict(int)
                    for n, x in zip(ls, r[8:]):
                        v[j["etiqueta"][n]] += int(x)
                    pos_m += sum(v.values())
                    nom = nombres_ep[ep].get(r[0], r[1]) if not r[0].startswith("CABA") else r[1]
                    w.writerow([r[0], nom, r[2], r[3], *r[4:8], *[v.get(n, 0) for n in cols]])
            pos = sum(v for _, v in j["listas"])
            rec = "provisorio" if (id_, cod) in MESAS_PROVISORIO else "definitivo"
            mesas_en[cod] = rec
            fuente_m = FUENTES_MESAS.get((id_, cod)) or FUENTES_MESAS[cod]
            motivo = MOTIVO_MESAS.get((id_, cod))
            aparte = APARTE_MESAS.get((id_, cod))
            nivel_m = "Por departamento y por mesa" if (cargo, anio, vuelta, cod) in de_mesas else "Por mesa"
            notas_dep[cod].append(f"{nivel_m}, el escrutinio {rec} que publica {fuente_m}" + (f", {aparte}" if aparte else "") + (
                f". Las mesas suman {miles(abs(pos - pos_m))} votos positivos {'menos' if pos_m < pos else 'más'} que el total de la jurisdicción" + (f": {motivo}." if motivo else ".")
                if pos_m != pos else "."))
            if cod in sin_mesas:
                notas_dep[cod].append(sin_mesas[cod])
        if deps:
            doc = {"id": id_, "periodo": f"dep{ep}", "unidad": "departamento", "oficial": True, "caba_entera": caba_entera, "listas": list(listas), "fuerza": fuerza,
                   "fuerzas": [{"id": f, "n": colores[f]["nombre"], "c": colores[f]["color"]} for f in fuerzas], "provincias": provincias}
        else:
            doc = {"id": id_, "periodo": "provincias", "unidad": "provincia", "listas": list(listas), "fuerza": fuerza,
                   "fuerzas": [{"id": f, "n": colores[f]["nombre"], "c": colores[f]["color"]} for f in fuerzas], "provincias": provincias}
        (MESAS / "mapa" / f"{id_}.json").write_text(json.dumps(doc, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8", newline="\n")
        sin = [c for c in sin_f.get((cargo, anio, vuelta), []) if c not in juris]
        el = {"id": id_, "anio": anio, "vuelta": vuelta, "cargo": cargo, "etiqueta": f"{anio}{', segunda vuelta' if vuelta == 'segunda' else ''}",
              "nivel": "provincia", "recuento": "definitivo", "provincias": sorted(juris), "origen": ORIGEN,
              "fechas": {c: fecha_texto(j["fecha"]) for c, j in juris.items()},
              "fuentes": {c: j["fuente"] for c, j in juris.items()},
              "notas": {c: " ".join(j["notas"] + notas_dep[c]) for c, j in juris.items() if j["notas"] or notas_dep[c]},
              "fuera": FUERA[cargo], "gris": GRIS[cargo]}
        if sin:
            el["sin_fuente"] = sin
        if deps:
            el["nivel"] = "departamento"
            el["departamentos"] = sorted(deps)
            if mesas_en:
                el["mesas_en"] = mesas_en
            if not TODAS:
                el["nota_nivel"] = f"Por ahora, solo los gobernadores de {cubre}."
        elif cargo == "gobernador":
            el["nota_nivel"] = ("Para esta elección hay solo el total de cada jurisdicción." if TODAS
                                else f"Por ahora, solo el total de cada jurisdicción, y solo los gobernadores de {cubre}.")
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
