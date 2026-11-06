"""
El escrutinio definitivo de cada jurisdicción en las elecciones por mesa (pedido del autor del 5 de noviembre de 2026: "para todas las elecciones pongas el
escrutinio definitivo y no el provisorio").

Ningún organismo publica el definitivo mesa por mesa como datos: la Cámara Nacional Electoral lo muestra en padron.gob.ar/publica de a una consulta y con un
código de seguridad, que está para que no lo lea un programa. Lo que sí está publicado, todo oficial, es el total de cada jurisdicción y lista:
- 2011 a 2019: los Excel del escrutinio definitivo de la Dirección Nacional Electoral (DINE). Presidente, de datos/manual/presidenciales_provincia.csv,
  que sale de los mismos Excel (scripts/elecciones_presidenciales.py).
- 2017: un CSV por cargo dentro de un ZIP de la DINE.
- 2021: los Excel "Consulta de Escrutinio por Zona" del sistema de la Cámara, que la DINE publica en un RAR por cargo.
- 2023 y 2025: las actas de escrutinio definitivo de cada junta electoral, que la Cámara publica escaneadas (electoral.gob.ar). Están transcriptas en
  datos/manual/mesas_definitivo_actas.csv, con la página de cada número, y cada distrito cierra sus sumas (las listas dan los afirmativos y todo, los emitidos).
- Segunda vuelta de 2023: la Cámara publica aparte el voto de los residentes en el exterior (RERE) y el de las personas privadas de libertad (REPL), como dos
  distritos más. En las demás elecciones esos votos van sumados dentro del total de cada distrito y no se publican separados.

Así queda la herramienta: el total del país y el de cada jurisdicción son el definitivo. Las secciones, circuitos y mesas siguen siendo el provisorio, que es
lo único publicado por mesa, y la página dice cuánto del definitivo reúne cada jurisdicción.

Escribe sitio/datos/mesas/{eleccion}/definitivo.csv (una fila por jurisdicción y lista, con el mismo nombre de lista que las mesas) y suma a cada elección de
sitio/datos/mesas/indice.json "definitivo" (la fuente) y "cobertura" (qué parte de los votos positivos del definitivo reúnen las mesas). Se corre después de
elecciones_mesas.py, elecciones_mapa.py, elecciones_departamentos.py y elecciones_antiguas.py, porque elecciones_mesas.py reescribe el índice.

Uso: python scripts/elecciones_definitivo.py --cache CARPETA [CARPETA ...]
--cache: dónde buscar los archivos de la DINE ya bajados. Lo que falte se baja (menos de 2 MB en total). Los RAR de 2021 necesitan bsdtar (libarchive).
"""
import argparse
import io
import json
import re
import subprocess
import sys
import tempfile
import warnings
import zipfile
from pathlib import Path

import openpyxl
import pandas as pd

RAIZ = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RAIZ / "scripts"))
import elecciones_mesas as em  # noqa: E402

MESAS = RAIZ / "sitio" / "datos" / "mesas"
ACTAS = RAIZ / "datos" / "manual" / "mesas_definitivo_actas.csv"
CONTROL = RAIZ / "datos" / "manual" / "mesas_definitivo_control.json"
BASE = em.BASE

LEGISLATIVAS = {(2011, "diputados"): "resultados_2011_generales_diputados_nacionales.xlsx",
                (2011, "senadores"): "resultados_2011_generales_senadores_nacionales.xlsx",
                (2013, "diputados"): "resultados_generales_diputados_nacionales_2013_0.xlsx",
                (2013, "senadores"): "resultados_generales_senadores_nacionales_2013.xlsx",
                (2015, "diputados"): "resultados_2015_nacionales_diputados_nacionales.xlsx",
                (2015, "senadores"): "resultados_2015_nacionales_senadores_nacionales.xlsx",
                (2017, "diputados"): "generales-2017definitivodndistritodn.zip",
                (2017, "senadores"): "generales-2017definitivosndistrito_1.zip",
                (2019, "diputados"): "d.n._definitivo_x_distrito_grales_2019.xlsx",
                (2019, "senadores"): "s.n_definitivo_x_distrito_grales_2019.xlsx",
                (2021, "diputados"): "2022/07/diputados_generales_2021.rar",
                (2021, "senadores"): "2022/07/senadores_generales_2021.rar"}
FUENTE_DINE = "Dirección Nacional Electoral, escrutinio definitivo por distrito"
FUENTE_CNE = "Cámara Nacional Electoral, actas de escrutinio definitivo de cada junta electoral"
URL_ACTAS = {"2023-general": "https://www.electoral.gob.ar/nuevo/paginas/btn/actas_esc_generales2023.php",
             "2023-segunda": "https://www.electoral.gob.ar/nuevo/paginas/btn/actas_esc_segvta2023.php",
             "2025-general": "https://www.electoral.gob.ar/nuevo/paginas/btn/actas2025.php"}
# los dos "distritos" que la Cámara publica aparte en la segunda vuelta de 2023. Van con un código propio, fuera de los 24
APARTE = {"RERE": ("EX", "Residentes en el exterior"), "REPL": ("PL", "Personas privadas de libertad")}
# lo que las mesas reúnen del definitivo tiene que quedar en este rango: fuera, es una lista mal emparejada o un número mal transcripto
COBERTURA_MIN, COBERTURA_MAX = 75, 101.5


# las abreviaturas de los Excel de 2021 ("Unite P/La Lib. y la Dign", "Frente de Izq. y de Trab.- Unidad")
ABREVIATURAS = {"izq": "izquierda", "trab": "trabajadores", "lib": "libertad", "dign": "dignidad", "p": "por", "fte": "frente", "mov": "movimiento",
                "part": "partido", "dem": "democrata", "soc": "socialista", "nac": "nacional", "pcia": "provincia", "prov": "provincial"}


def clave(s):
    """Un nombre de lista para comparar: sin tildes, sin 'alianza', sin signos, con las abreviaturas escritas enteras."""
    s = em.sin_tildes(str(s)).lower().replace("1pais", "un pais").replace(".", "")
    t = [ABREVIATURAS.get(x, x) for x in re.findall(r"[a-z0-9]+", s)]
    return " ".join(x for x in t if x not in ("alianza", "partido", "frente"))


VACIAS = {"de", "la", "el", "los", "las", "y", "por", "para", "del", "en"}


def parecido(a, b):
    """Qué parte de las palabras comparten dos nombres. Una palabra cortada ("Federa") cuenta como la entera ("Federal")."""
    pa, pb = set(clave(a).split()) - VACIAS, set(clave(b).split()) - VACIAS
    if not pa or not pb:
        return 0
    igual = lambda x, y: x == y or (min(len(x), len(y)) >= 4 and (x.startswith(y) or y.startswith(x)))  # noqa: E731
    comunes = sum(1 for x in pa if any(igual(x, y) for y in pb))
    return comunes / (len(pa) + len(pb) - comunes)


def emparejar(definitivo, provisorio):
    """Cada lista del definitivo ({nombre: votos}) con su nombre en las mesas ({nombre: votos}). En este orden: el nombre igual, la única lista de las mesas que
    comparte la mayoría de las palabras, y por último la única con una cantidad de votos compatible (las mesas reúnen de 80% a 102% de cada lista).
    Lo que no se empareja queda con su nombre del definitivo."""
    salida, libres = {}, dict(provisorio)
    por_clave = {}
    for p in provisorio:
        por_clave.setdefault(clave(p), []).append(p)
    for d in definitivo:
        m = [p for p in por_clave.get(clave(d), []) if p in libres]
        if len(m) == 1:
            salida[d] = m[0]
            libres.pop(m[0])
    for d in sorted(definitivo, key=lambda x: -definitivo[x]):
        if d in salida:
            continue
        cand = sorted(((parecido(d, p), p) for p in libres), reverse=True)
        if cand and cand[0][0] >= 0.5 and (len(cand) == 1 or cand[1][0] < cand[0][0]):
            salida[d] = cand[0][1]
            libres.pop(cand[0][1])
    for d in sorted(definitivo, key=lambda x: -definitivo[x]):
        if d in salida or not definitivo[d]:
            continue
        cand = [p for p, v in libres.items() if 0.8 <= v / definitivo[d] <= 1.02]
        if len(cand) == 1:
            salida[d] = cand[0]
            libres.pop(cand[0])
    return salida


def leer_2017(ruta):
    z = zipfile.ZipFile(ruta)
    filas, prov = [], {}
    for linea in z.read(z.namelist()[0]).decode("latin1").splitlines()[1:]:
        d, a, v = (linea.split(";") + ["", ""])[:3]
        cod = em.clave_prov(d)
        a = re.sub(r"\s+", " ", a).strip()
        n = em.num(v.strip())
        if not cod or n is None:
            continue
        p = prov.setdefault(cod, {"listas": []})
        A = em.sin_tildes(a).upper()
        if A == "ELECTORES HABILES":
            p["electores"] = n
        elif A == "VOTOS POSITIVOS":
            p["positivos"] = n
        elif A == "VOTOS EN BLANCO":
            p["blancos"] = n
        elif A == "VOTOS ANULADOS":
            p["nulos"] = n
        elif A.startswith("VOTOS RECURRIDOS"):
            p["recurridos"] = n
        elif A.startswith("TOTAL DE"):
            p["votantes"] = n
        else:
            p["listas"].append((em.nombre_lista(a), int(n)))
    for cod, p in prov.items():
        for lista, votos in p["listas"]:
            filas.append({"codigo_indec": cod, "lista": lista, "votos": votos, "electores": p.get("electores"), "votantes": p.get("votantes"),
                          "blancos": p.get("blancos"), "nulos": p.get("nulos"), "recurridos_impugnados": p.get("recurridos", 0)})
    return pd.DataFrame(filas)


def leer_2021(ruta):
    """Un RAR con un Excel por distrito, exportado del sistema de la Cámara ("Consulta de Escrutinio por Zona")."""
    filas = []
    with tempfile.TemporaryDirectory() as t:
        subprocess.run(["bsdtar", "-xf", str(ruta), "-C", t], check=True)
        for x in sorted(Path(t).glob("*.xlsx")):
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                w = openpyxl.load_workbook(x, read_only=True, data_only=True)
            ws = w[w.sheetnames[0]]
            cod, electores, exterior, listas, otros, total = None, None, None, [], {}, None
            for r in ws.iter_rows(values_only=True):
                v = [c for c in r if c is not None and str(c).strip() != ""]
                if not v:
                    continue
                t0 = em.sin_tildes(str(v[0])).upper().strip()
                if t0.startswith("DISTRITO:"):
                    cod = em.clave_prov(t0.split(":", 1)[1])
                elif t0.startswith("TOTAL INSCRIPTOS"):
                    electores = em.num(v[1])
                elif t0.startswith("RESIDENTES EXTERIOR") and exterior is None:
                    exterior = em.num(v[1])
                elif t0.startswith("VOTOS "):
                    otros[t0.replace("VOTOS ", "").strip()] = int(em.num(v[1]) or 0)
                elif t0 == "TOTALES":
                    total = int(em.num(v[1]))
                elif len(v) >= 3 and em.num(v[2]) is not None and not t0.startswith(("NUMERO", "NÚMERO", "INSCRIPTOS", "NORMAL", "VOTANTES")):
                    listas.append((em.nombre_lista(v[1]), int(em.num(v[2]))))
            if not cod:
                sys.exit(f"{x.name}: no dice el distrito")
            suma = sum(n for _, n in listas) + sum(otros.values())
            if suma != total:
                sys.exit(f"{x.name}: las listas y los otros votos suman {suma:,} y el total dice {total:,}")
            for lista, votos in listas:
                filas.append({"codigo_indec": cod, "lista": lista, "votos": votos, "electores": electores, "votantes": total,
                              "blancos": otros.get("EN BLANCO", 0), "nulos": otros.get("NULOS", 0),
                              "recurridos_impugnados": otros.get("RECURRIDOS", 0) + otros.get("IMPUGNADOS", 0), "electores_exterior": exterior})
    return pd.DataFrame(filas)


def leer_presidente(pres, anio, vuelta):
    v = 2 if vuelta == "segunda" else 1
    g = pres[(pres["anio"] == anio) & (pres["vuelta"] == v) & pres["fuente"].str.contains("definitivo")]
    if g.empty:
        return None
    filas = []
    for _, r in g.iterrows():
        lista = em.nombre_lista(r["partido"])
        filas.append({"codigo_indec": r["codigo_indec"], "lista": em.con_formula(lista, anio) if anio in em.FORMULAS else lista, "votos": int(r["votos"]),
                      "electores": r["electores"], "votantes": r["votantes"], "blancos": r["blancos"], "nulos": r["nulos"],
                      "recurridos_impugnados": max(0, int(r["votantes"] - r["positivos"] - r["blancos"] - r["nulos"]))})
    return pd.DataFrame(filas)


DISTRITOS_ACTAS = {"CAPITAL FEDERAL": "02", "BUENOS AIRES": "06", "CATAMARCA": "10", "CORDOBA": "14", "CORRIENTES": "18", "CHACO": "22", "CHUBUT": "26",
                   "ENTRE RIOS": "30", "FORMOSA": "34", "JUJUY": "38", "LA PAMPA": "42", "LA RIOJA": "46", "MENDOZA": "50", "MISIONES": "54",
                   "NEUQUEN": "58", "RIO NEGRO": "62", "SALTA": "66", "SAN JUAN": "70", "SAN LUIS": "74", "SANTA CRUZ": "78", "SANTA FE": "82",
                   "SANTIAGO DEL ESTERO": "86", "TUCUMAN": "90", "TIERRA DEL FUEGO": "94"}


NOTAS_ACTAS = []
# el padrón de cada distrito que publica la Cámara, para las actas que no dicen cuántos electores hay (San Luis). No cuenta a los electores del exterior
PADRON_DISTRITOS = {"2023": "https://www.electoral.gob.ar/nuevo/paginas/datos/total_electores_2023.zip",
                    "2025": "https://www.electoral.gob.ar/nuevo/paginas/datos/total_electores2025.zip"}
_PADRONES = {}


def padron_distrito(anio, dist, carpetas):
    if anio not in _PADRONES:
        url = PADRON_DISTRITOS[anio]
        ruta = em.buscar(Path(url).name, carpetas, url)
        tot = {}
        with zipfile.ZipFile(ruta) as z:
            for n in z.namelist():
                if not n.lower().endswith(".xlsx"):
                    continue
                with warnings.catch_warnings():
                    warnings.simplefilter("ignore")
                    w = openpyxl.load_workbook(io.BytesIO(z.read(n)), read_only=True, data_only=True)
                cab = None
                for r in w[w.sheetnames[0]].iter_rows(values_only=True):
                    if r and str(r[0]).strip() == "Num_dist":
                        cab = [str(c).strip() for c in r]
                    elif cab and r and r[0] is not None:
                        x = dict(zip(cab, r))
                        tot[em.sin_tildes(str(x["Distrito"])).upper().strip().replace("STGO DEL ESTERO", "SANTIAGO DEL ESTERO")] = int(x["Electores"])
                if tot:
                    break
        _PADRONES[anio] = tot
    return _PADRONES[anio].get(dist)
# errores de tipeo de las actas, corregidos solo cuando la misma acta muestra el número bueno
CORRECCIONES = {("2025-general", "CORRIENTES", "electores"): (651679, 951679, "el acta dice 651.679 electores y su propio 59,99% de participación da 951.679")}


def leer_actas(eleccion, cargo, anio, carpetas=()):
    """Lo transcripto de las actas de la Cámara: una fila por jurisdicción y lista. Frena si una suma no cierra.
    En el definitivo los votos recurridos e impugnados ya están resueltos: el acta dice cuántos se declararon válidos, nulos o en blanco, y van dentro de esos totales.
    Por eso se anotan en el archivo de las actas pero no se suman: los emitidos son las listas, los blancos y los nulos. Algunas actas escriben mal el total de
    afirmativos (San Juan 2023 resta solo los blancos o los suma, Corrientes y Santa Fe 2025 suman los blancos): ahí manda la suma de las listas, que cierra con
    los emitidos, y queda anotado en el control."""
    if not ACTAS.exists():
        return None
    a = pd.read_csv(ACTAS, dtype=str, keep_default_na=False)
    a = a[(a["eleccion"] == eleccion) & ((a["cargo"] == cargo) | (a["cargo"] == ""))]
    if a.empty:
        return None
    a["votos"] = a["votos"].astype(int)
    filas = []
    for dist, g in a.groupby("distrito"):
        gc = g[g["cargo"] == cargo]
        if gc.empty:
            continue
        cod = DISTRITOS_ACTAS.get(dist) or APARTE.get(dist, (None,))[0]
        if not cod:
            sys.exit(f"{ACTAS.name}: distrito desconocido {dist}")
        de = lambda t: int(gc.loc[gc["tipo"] == t, "votos"].sum())  # noqa: E731
        listas = gc[gc["tipo"] == "lista"]
        suma, afirm, emit = int(listas["votos"].sum()), de("afirmativos"), de("emitidos")
        otros = de("blancos") + de("nulos") + de("comando")
        if suma + otros != emit:
            sys.exit(f"{eleccion} {cargo} {dist}: las listas, los blancos y los nulos suman {suma + otros:,} y el acta dice {emit:,} emitidos")
        if afirm and suma != afirm:
            NOTAS_ACTAS.append(f"{eleccion} {cargo} {dist}: el acta dice {afirm:,} afirmativos y las listas suman {suma:,}, que cierra con los emitidos: se usa la suma")
        el = g[(g["tipo"] == "electores") & ((g["cargo"] == cargo) | (g["cargo"] == ""))]["votos"]
        electores = int(el.iloc[0]) if len(el) else None
        if electores is None and dist not in APARTE:
            electores = padron_distrito(eleccion[:4], dist, carpetas)
            nota = f"{eleccion} {dist}: el acta no dice cuántos electores hay: se usa el padrón de la Cámara ({electores:,}), sin el exterior"
            if electores and nota not in NOTAS_ACTAS:
                NOTAS_ACTAS.append(nota)
        malo, bueno, motivo = CORRECCIONES.get((eleccion, dist, "electores"), (None, None, None))
        if electores is not None and electores == malo:
            electores = bueno
            if motivo not in " ".join(NOTAS_ACTAS):
                NOTAS_ACTAS.append(f"{eleccion} {dist}: {motivo}: se usa {bueno:,}")
        for _, r in listas.iterrows():
            lista = em.nombre_lista(r["nombre"])
            if cargo == "presidente" and anio in em.FORMULAS:
                lista = em.con_formula(lista, anio)
            filas.append({"codigo_indec": cod, "lista": lista, "votos": int(r["votos"]), "electores": electores, "votantes": emit,
                          "blancos": de("blancos"), "nulos": de("nulos"), "recurridos_impugnados": de("comando")})
    return pd.DataFrame(filas) if filas else None


PADRON_EXTERIOR = {"anio": 2023, "url": "https://www.electoral.gob.ar/nuevo/paginas/datos/ResidentesExteriorGenerales2023.rar",
                   "pagina": "https://www.electoral.gob.ar/nuevo/paginas/datos/reredatos.php", "archivo": "exterior/padron-2023.csv"}
# los nombres del padrón del exterior van en mayúsculas y con algunos errores de tipeo de la fuente
PAISES = {"Azerbaiyan": "Azerbaiyán", "Béligica": "Bélgica", "Canada": "Canadá", "Etiopia": "Etiopía", "Haiti": "Haití", "Iran": "Irán", "Japon": "Japón",
          "Kenya": "Kenia", "Paises Bajos": "Países Bajos", "Pakistan": "Pakistán", "Qatar": "Catar", "Reino Unido de Gran Bretaña": "Reino Unido",
          "Republica Checa": "República Checa", "Republica Dominicana": "República Dominicana", "Sudafrica": "Sudáfrica", "Tunez": "Túnez"}
CIUDADES = {"Abu Dhabi - Emiratos Árabes": "Abu Dabi", "Asunsión": "Asunción", "Baku": "Bakú", "Beijing": "Pekín", "Berlin": "Berlín", "Bogota": "Bogotá",
            "Cadiz": "Cádiz", "Erevan - Armenia": "Ereván", "Etiopia": "Etiopía", "Florianopolís": "Florianópolis", "Francfort": "Fráncfort",
            "Gral Mumbai": "Bombay", "Helsinski": "Helsinki", "La Havana": "La Habana", "Los Ángles": "Los Ángeles", "New Delhi": "Nueva Delhi",
            "Puerto Prinicpe": "Puerto Príncipe", "Riyadh": "Riad", "Salvador Bahía": "Salvador de Bahía", "Seul": "Seúl", "Shanghai": "Shanghái",
            "Sidney - Australia": "Sídney", "Therán": "Teherán", "Tunez": "Túnez", "Yacarta": "Yakarta", "Ancara": "Ankara", "Hanoi": "Hanói"}
CHICAS = {"de", "del", "la", "las", "los", "y", "e", "en", "el", "da", "do", "dos", "das"}


def titulo(s):
    partes = re.split(r"(\s+|-)", re.sub(r"\s+", " ", str(s)).strip().lower())
    return "".join(x if (x in CHICAS and i > 0) else x[:1].upper() + x[1:] for i, x in enumerate(partes))


def ciudad_consulado(s):
    """'CONS. GRAL. EN MADRID' pasa a 'Madrid'. Embajada, consulado o consulado general: en el padrón todos tienen mesas."""
    m = re.match(r"^(EMB\.?|CONS\.?\s?GRAL\.?(?:\s?Y)?(?:\s?CPC)?|CONS\.?)\s*(?:EN\s+)?(.*)$", re.sub(r"\s+", " ", str(s)).strip().upper())
    c = titulo(m.group(2))
    return CIUDADES.get(c, c)


def armar_padron_exterior(carpetas):
    """El padrón del exterior de la Cámara Nacional Electoral: país, consulado, mesa, jurisdicción por la que vota y cuántos electores. Es lo único oficial que une cada
    mesa del exterior con su país: los votos de cada mesa no se publican."""
    ruta = em.buscar(Path(PADRON_EXTERIOR["url"]).name, carpetas, PADRON_EXTERIOR["url"])
    with tempfile.TemporaryDirectory() as t:
        subprocess.run(["bsdtar", "-xf", str(ruta), "-C", t], check=True)
        x = sorted(Path(t).glob("*.xlsx"))[0]
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            w = openpyxl.load_workbook(x, read_only=True, data_only=True)
        filas = [r for r in w[w.sheetnames[0]].iter_rows(values_only=True) if any(c is not None for c in r)]
    cab = [str(c).strip() for c in filas[0]]
    if cab[:7] != ["País", "Código Sección", "Representación Consular", "Código Representación Consular", "Mesa", "Distrito de voto", "Cantidad de Electores"]:
        sys.exit(f"El padrón del exterior cambió de forma: {cab}")
    salida = []
    for r in filas[1:]:
        cod = DISTRITOS_ACTAS.get(em.sin_tildes(str(r[5])).upper().strip())
        if not cod:
            sys.exit(f"Padrón del exterior: jurisdicción desconocida {r[5]}")
        pais = titulo(r[0])
        salida.append({"pais": PAISES.get(pais, pais), "consulado": ciudad_consulado(r[2]), "mesa": str(r[4]).strip(), "codigo_indec": cod, "electores": int(r[6])})
    d = pd.DataFrame(salida).sort_values(["pais", "consulado", "mesa", "codigo_indec"])
    em.escribir_csv(d, MESAS / PADRON_EXTERIOR["archivo"])
    return {"anio": PADRON_EXTERIOR["anio"], "archivo": PADRON_EXTERIOR["archivo"], "fuente": "Cámara Nacional Electoral, Registro de Electores Residentes en el Exterior",
            "url": PADRON_EXTERIOR["pagina"], "electores": int(d["electores"].sum()), "paises": int(d["pais"].nunique()),
            "mesas": int(d[["consulado", "mesa"]].drop_duplicates().shape[0])}


def provisorio(id_):
    p = pd.read_csv(MESAS / id_ / "pais.csv", dtype={"codigo_indec": str})
    return p


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache", nargs="+", required=True)
    a = ap.parse_args()
    carpetas = [Path(c) for c in a.cache]
    indice = json.loads((MESAS / "indice.json").read_text(encoding="utf-8"))
    pres = pd.read_csv(em.PRESIDENCIALES, dtype={"codigo_indec": str})
    control, problemas = {}, []
    for e in indice["elecciones"]:
        if e["nivel"] != "mesa":
            continue
        id_, anio, vuelta, cargo = e["id"], e["anio"], e["vuelta"], e["cargo"]
        eleccion = f"{anio}-{vuelta}"
        if cargo == "presidente":
            d, fuente, url = leer_presidente(pres, anio, vuelta), FUENTE_DINE, f"https://www.argentina.gob.ar/dine/resultados-electorales/elecciones-{anio}"
        elif (anio, cargo) in LEGISLATIVAS:
            nombre = LEGISLATIVAS[(anio, cargo)]
            ruta = em.buscar(Path(nombre).name, carpetas, BASE + nombre)
            d = leer_2017(ruta) if ruta.suffix == ".zip" else leer_2021(ruta) if ruta.suffix == ".rar" else em.leer_excel(ruta)
            if "recurridos_impugnados" not in d:
                d["recurridos_impugnados"] = (d["votantes"] - d.groupby("codigo_indec")["votos"].transform("sum") - d["blancos"] - d["nulos"]).clip(lower=0)
            fuente, url = FUENTE_DINE, f"https://www.argentina.gob.ar/dine/resultados-electorales/elecciones-{anio}"
        else:
            d = None
        if d is None or d.empty:
            d, fuente, url = leer_actas(eleccion, cargo, anio, carpetas), FUENTE_CNE, URL_ACTAS.get(eleccion)
        if d is None or d.empty:
            print(f"{id_}: sin definitivo publicado como datos ni actas transcriptas", flush=True)
            problemas.append(f"{id_}: sin definitivo")
            continue
        prov = provisorio(id_)
        provincias = set(e["provincias"])
        faltan = provincias - set(d["codigo_indec"])
        if faltan:
            sys.exit(f"{id_}: el definitivo no trae {sorted(faltan)}")
        d = d[d["codigo_indec"].isin(provincias | {"EX", "PL"})].copy()
        # el nombre de cada lista, el mismo que en las mesas
        sueltas = []
        for cod, g in d.groupby("codigo_indec"):
            if cod in ("EX", "PL"):
                continue
            gp = prov[prov["codigo_indec"] == cod]
            par = emparejar(dict(zip(g["lista"], g["votos"])), dict(zip(gp["lista"], gp["votos"])))
            d.loc[g.index, "lista"] = g["lista"].map(lambda x: par.get(x, x))
            for x in g["lista"]:
                if x not in par:
                    sueltas.append(f"{cod} {x} ({int(g.loc[g['lista'] == x, 'votos'].sum()):,})")
        if cargo == "presidente":
            # el exterior y las cárceles usan los nombres que ya quedaron en los distritos
            nombres = d[~d["codigo_indec"].isin(["EX", "PL"])].groupby("lista")["votos"].sum().to_dict()
            for cod in ("EX", "PL"):
                g = d[d["codigo_indec"] == cod]
                if len(g):
                    par = emparejar(dict(zip(g["lista"], g["votos"])), {k: 0 for k in nombres})
                    d.loc[g.index, "lista"] = g["lista"].map(lambda x: par.get(x, x))
        d = d.groupby(["codigo_indec", "lista"], as_index=False).agg(
            votos=("votos", "sum"), electores=("electores", "first"), votantes=("votantes", "first"), blancos=("blancos", "first"),
            nulos=("nulos", "first"), recurridos_impugnados=("recurridos_impugnados", "first"))
        d["provincia"] = d["codigo_indec"].map(lambda c: em.PROVINCIAS.get(c) or {v[0]: v[1] for v in APARTE.values()}[c])
        for c in ["votos", "electores", "votantes", "blancos", "nulos", "recurridos_impugnados"]:
            d[c] = pd.to_numeric(d[c], errors="coerce").round().astype("Int64")
        orden = {c: i for i, c in enumerate(list(em.PROVINCIAS) + ["EX", "PL"])}
        d["_o"] = d["codigo_indec"].map(orden)
        d = d.sort_values(["_o", "votos"], ascending=[True, False]).drop(columns="_o")
        d = d[["codigo_indec", "provincia", "lista", "votos", "electores", "votantes", "blancos", "nulos", "recurridos_impugnados"]]
        em.escribir_csv(d, MESAS / id_ / "definitivo.csv")
        # una participación imposible es un número mal leído
        for cod, g in d[~d["codigo_indec"].isin(["EX", "PL"])].groupby("codigo_indec"):
            e_, v_ = g["electores"].iloc[0], g["votantes"].iloc[0]
            if pd.notna(e_) and e_ and not 0.4 <= v_ / e_ <= 0.95:
                problemas.append(f"{id_} {cod}: {int(v_):,} votantes de {int(e_):,} electores")
        # lo que reúnen las mesas de cada jurisdicción
        pos_def = d[~d["codigo_indec"].isin(["EX", "PL"])].groupby("codigo_indec")["votos"].sum()
        pos_prov = prov.groupby("codigo_indec")["votos"].sum()
        cob = {c: round(float(pos_prov.get(c, 0)) / float(pos_def[c]) * 100, 2) for c in sorted(provincias) if pos_def.get(c)}
        for c, v in cob.items():
            if not COBERTURA_MIN <= v <= COBERTURA_MAX:
                problemas.append(f"{id_} {c}: las mesas reúnen {v}% del definitivo")
        ex = d[d["codigo_indec"].isin(["EX", "PL"])]
        # dónde está el voto en el exterior y en las cárceles: dentro de cada jurisdicción, salvo en la segunda vuelta de 2023, que la Cámara lo publicó aparte
        e["definitivo"] = {"fuente": fuente, "url": url, "aparte": sorted(ex["codigo_indec"].unique().tolist())}
        e["cobertura"] = cob
        e["cobertura_pais"] = round(float(pos_prov[pos_prov.index.isin(list(cob))].sum()) / float(pos_def[pos_def.index.isin(list(cob))].sum()) * 100, 2)
        control[id_] = {"fuente": fuente, "positivos_definitivo": int(pos_def.sum()), "positivos_mesas": int(pos_prov.sum()),
                        "cobertura_pais": e["cobertura_pais"], "menor": min(cob.items(), key=lambda x: x[1]), "listas_sin_par": sueltas}
        print(f"{id_}: {fuente.split(',')[0]}, las mesas reúnen {e['cobertura_pais']}%, la menor {control[id_]['menor']}"
              + (f", {len(sueltas)} listas con su nombre del definitivo" if sueltas else ""), flush=True)
    indice["exterior"] = armar_padron_exterior(carpetas)
    print(f"padrón del exterior {indice['exterior']['anio']}: {indice['exterior']['electores']:,} electores, {indice['exterior']['paises']} países, {indice['exterior']['mesas']} mesas", flush=True)
    (MESAS / "indice.json").write_text(json.dumps(indice, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8", newline="\n")
    CONTROL.write_text(json.dumps({"_leeme": "Lo que armó scripts/elecciones_definitivo.py: la fuente del definitivo de cada elección, cuánto reúnen las mesas y las "
                                             "listas del definitivo que no tienen el mismo nombre en las mesas. Lo lee scripts/prueba_mesas.py.",
                                   "elecciones": control, "notas_actas": NOTAS_ACTAS, "problemas": problemas}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")
    if problemas:
        sys.exit("Problemas:\n  " + "\n  ".join(problemas))


if __name__ == "__main__":
    main()
