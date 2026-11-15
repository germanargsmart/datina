"""
Los resultados oficiales de Elecciones por mesa, por jurisdicción, como tablas del Catálogo (plan técnico, punto 6, 15 de noviembre de 2026):
de ahí los leen el MCP y la API de datos (docs/ia/MCP.md), el Catálogo, los Dataset y llms.txt. 03 los escribe en cada armado desde
sitio/datos/mesas/, que arman los programas elecciones_*.py y 03 no toca:

  sitio/datos/elecciones_oficiales_totales.csv       una fila por elección y jurisdicción: electores, votantes, positivos, blancos, nulos,
                                                    el recuento, la fuente y su dirección
  sitio/datos/elecciones_oficiales_presidente.csv   una fila por elección, jurisdicción y lista: votos y porcentaje de los positivos
  sitio/datos/elecciones_oficiales_diputados.csv
  sitio/datos/elecciones_oficiales_senadores.csv
  sitio/datos/elecciones_oficiales_gobernador.csv
Separadas así porque con los totales y la fuente repetidos en cada lista la tabla de diputados pesaba 1,2 MB, y leerla pasaba de los 10 ms de
procesador que Cloudflare da a cada pedido (docs/ia/MCP.md).

Solo lo oficial (decisión del plan técnico): el escrutinio de la Dirección Nacional Electoral, de la Cámara Nacional Electoral o de la
justicia electoral de cada jurisdicción.
- Presidente, diputados y senadores nacionales: de 1983 a 2009, el escrutinio definitivo de la DINE por distrito (pais.csv). Desde 2011, el
  definitivo de cada jurisdicción (definitivo.csv, de elecciones_definitivo.py). No van las elecciones de 1912 a 1973, que salen de fuentes
  académicas, ni los departamentos de 1983 a 2009, que salen de 257arg, ni las mesas, que son el provisorio.
- Gobernador y senadores por la Capital (elecciones_jurisdiccion.py): cada jurisdicción con su fuente, salvo las que la página marca como
  no oficiales ("no_oficial") y las que son una transcripción de la Wikipedia, aunque la Wikipedia copie un documento oficial.
- El voto en el exterior y en las cárceles que la Cámara publicó aparte en la segunda vuelta de 2023 no va: no es una jurisdicción.
Las sumas por jurisdicción las controla scripts/prueba_mesas.py, que corre 03.
"""
import csv
import json
import pathlib

RAIZ = pathlib.Path(__file__).resolve().parents[1]
MESAS = RAIZ / "sitio" / "datos" / "mesas"
TRANSCRIPTO = RAIZ / "datos" / "manual" / "mesas_jurisdiccion.csv"
CARGOS = ("presidente", "diputados", "senadores", "gobernador")
TOTALES = ["anio", "vuelta", "cargo", "codigo_indec", "jurisdiccion", "recuento", "electores", "votantes", "positivos", "blancos", "nulos",
           "fuente", "url"]
LISTAS = ["anio", "vuelta", "codigo_indec", "jurisdiccion", "lista", "votos", "porcentaje"]
DINE = "Dirección Nacional Electoral (Ministerio del Interior), escrutinio definitivo por distrito"
DINE_URL = "https://www.argentina.gob.ar/dine/resultados-electorales/elecciones-{anio}"


def leer(ruta):
    with open(ruta, encoding="utf-8", newline="") as h:
        return list(csv.DictReader(h))


def oficiales(mesas=MESAS, transcripto=TRANSCRIPTO):
    """{cargo: [filas]} con lo oficial de cada elección, una fila por jurisdicción y lista, en el orden del índice y de cada archivo."""
    indice = json.loads((mesas / "indice.json").read_text(encoding="utf-8"))
    nombres = indice["provincias"]
    urls = {}
    for r in leer(transcripto):
        urls.setdefault((r["cargo"], int(r["anio"]), r["vuelta"], r["codigo_indec"]), r["url"])
    salida = {c: [] for c in CARGOS}
    for el in indice["elecciones"]:
        anio, vuelta, cargo = el["anio"], el["vuelta"], el["cargo"]
        base = {"anio": anio, "vuelta": vuelta, "cargo": cargo}
        if el.get("origen") == "jurisdiccion":
            no = set(el.get("no_oficial") or [])
            fuentes = {c: f for c, f in (el.get("fuentes") or {}).items() if c not in no and "Wikipedia" not in f}
            for r in leer(mesas / el["id"] / "pais.csv"):
                c = r["codigo_indec"]
                if c in fuentes:
                    rec = (el.get("recuentos") or {}).get(c) or el.get("recuento") or ""
                    salida[cargo].append(fila(base, rec, r, nombres, fuentes[c], urls.get((cargo, anio, vuelta, c), "")))
            continue
        if anio < 1983:
            continue   # 1912 a 1973: fuentes académicas
        if el.get("definitivo"):
            d = el["definitivo"]
            for r in leer(mesas / el["id"] / "definitivo.csv"):
                if r["codigo_indec"] in nombres:   # "EX" y "PL", el exterior y las cárceles publicados aparte, no son jurisdicciones
                    salida[cargo].append(fila(base, "definitivo", r, nombres, d["fuente"], d.get("url", "")))
        elif el.get("recuento") == "definitivo":
            for r in leer(mesas / el["id"] / "pais.csv"):
                salida[cargo].append(fila(base, "definitivo", r, nombres, DINE, DINE_URL.format(anio=anio)))
        else:
            raise SystemExit(f"elecciones_oficiales.py: {el['id']} no tiene escrutinio definitivo ni es de una jurisdicción: revisar de dónde sale")
    for c, filas in salida.items():
        if not filas:
            raise SystemExit(f"elecciones_oficiales.py: no hay ninguna elección oficial de {c}")
    return salida


def fila(base, recuento, r, nombres, fuente, url):
    return {**base, "recuento": recuento, "codigo_indec": r["codigo_indec"], "jurisdiccion": nombres[r["codigo_indec"]], "lista": r["lista"],
            "votos": r["votos"], "electores": r.get("electores", ""), "votantes": r.get("votantes", ""), "blancos": r.get("blancos", ""),
            "nulos": r.get("nulos", ""), "fuente": fuente, "url": url}


def escribir(destino=RAIZ / "sitio" / "datos", mesas=MESAS):
    """Escribe las cinco tablas y devuelve {tabla: filas}."""
    hechas, totales = {}, []
    for cargo, filas in oficiales(mesas).items():
        listas, por_j = [], {}
        for f in filas:
            por_j.setdefault((f["anio"], f["vuelta"], f["codigo_indec"]), []).append(f)
        for (anio, vuelta, cod), fs in por_j.items():
            pos = sum(int(f["votos"]) for f in fs)
            f0 = fs[0]
            for f in fs[1:]:
                if any(f[k] != f0[k] for k in ("electores", "votantes", "blancos", "nulos", "fuente", "url", "recuento")):
                    raise SystemExit(f"elecciones_oficiales.py: {anio} {vuelta} {cargo} {cod}: los totales cambian de una lista a otra")
            totales.append({**{k: f0[k] for k in TOTALES if k in f0}, "positivos": pos})
            listas += [{**{k: f[k] for k in LISTAS if k in f}, "porcentaje": f"{100 * int(f['votos']) / pos:.4f}" if pos else ""} for f in fs]
        hechas[f"elecciones_oficiales_{cargo}"] = escribir_csv(destino / f"elecciones_oficiales_{cargo}.csv", LISTAS, listas)
    totales.sort(key=lambda f: (f["anio"], CARGOS.index(f["cargo"]), f["vuelta"] != "general", f["vuelta"], f["codigo_indec"]))
    hechas["elecciones_oficiales_totales"] = escribir_csv(destino / "elecciones_oficiales_totales.csv", TOTALES, totales)
    return hechas


def escribir_csv(ruta, columnas, filas):
    with open(ruta, "w", encoding="utf-8", newline="") as h:
        w = csv.DictWriter(h, fieldnames=columnas, lineterminator="\n")
        w.writeheader()
        w.writerows(filas)
    return len(filas)


if __name__ == "__main__":
    import sys
    destino = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else RAIZ / "sitio" / "datos"
    for t, n in escribir(destino).items():
        print(f"{t}: {n} filas")
