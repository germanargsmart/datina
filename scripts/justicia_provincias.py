"""
Jueces, fiscales y defensores de los poderes judiciales y los ministerios públicos de cada provincia y de la Ciudad de Buenos Aires, por
año desde 2011 (Mapa de Género de la Justicia Argentina, Oficina de la Mujer de la Corte Suprema). 24 de octubre de 2026.
Pedido del autor ("cuántas fiscalías provinciales, cuántas cortes supremas provinciales, cuántos jueces tiene cada una"): no hay una base
nacional de cargos judiciales provinciales, y buscarlos provincia por provincia dio cifras sueltas, de fechas y criterios distintos. El
Mapa de Género es la única fuente con un mismo criterio y una misma fecha para las 24 jurisdicciones: cada una carga sus datos de
personal al 31 de octubre de cada año. Se corre una vez por año, cuando sale el Mapa nuevo (suele ser a mitad del año siguiente).
Lee el mismo servicio que usa el mapa interactivo del sitio de la Oficina de la Mujer (om.csjn.gob.ar/mapagenero, "Comparativo por
institución", en totales): una consulta por jurisdicción y año, que devuelve las personas de cada rango por sexo. Se toman:
- ministras y ministros del máximo tribunal;
- magistratura del poder judicial, que incluye a los ministros, a los camaristas y a la justicia de paz (así lo define el Mapa);
- procuradores y fiscales del ministerio público fiscal o de la acusación, con el procurador general (en Jujuy, el Ministerio Público de
  la Acusación va en una consulta aparte);
- defensores del ministerio público de la defensa, con el defensor general. Catamarca tiene un solo ministerio público y carga a todos en
  el fiscal: sus defensores quedan sin dato y la nota de la ficha lo dice.
Son personas en el cargo, no cargos de planta. Una categoría en cero en las dos columnas es una jurisdicción que no cargó ese dato: queda
vacía. El programa controla que la suma de 2025 dé lo que publica el Mapa (138 ministros y 5.201 magistrados en las provincias) y guarda
las respuestas tal como llegaron en datos/manual/justicia_provincias_om.json.
Uso: python scripts/justicia_provincias.py (unas 375 consultas chicas, dos o tres minutos). Con --sin-bajar vuelve a armar la tabla con las
respuestas guardadas.
"""
import datetime
import json
import re
import sys
import time
import unicodedata
import urllib.request
from pathlib import Path

import pandas as pd

MANUAL = Path(__file__).resolve().parents[1] / "datos" / "manual"
BASE = "https://om.csjn.gob.ar/mapagenero"
UA = {"User-Agent": "Mozilla/5.0 (argentina-en-datos)"}
# las jurisdicciones del mapa interactivo: la Ciudad (1) tiene su propia consulta y Jujuy (49) su Ministerio Público de la Acusación (62)
IDS = [*range(1, 24), 49, 62]
CODIGO = {"CIUDAD AUTONOMA DE BUENOS AIRES": "02", "BUENOS AIRES": "06", "CATAMARCA": "10", "CORDOBA": "14", "CORRIENTES": "18", "CHACO": "22",
          "CHUBUT": "26", "ENTRE RIOS": "30", "FORMOSA": "34", "JUJUY": "38", "LA PAMPA": "42", "LA RIOJA": "46", "MENDOZA": "50", "MISIONES": "54",
          "NEUQUEN": "58", "RIO NEGRO": "62", "SALTA": "66", "SAN JUAN": "70", "SAN LUIS": "74", "SANTA CRUZ": "78", "SANTA FE": "82",
          "SANTIAGO DEL ESTERO": "86", "TUCUMAN": "90", "TIERRA DEL FUEGO": "94"}


def leer(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        return r.read().decode("utf-8")


def norm(t):
    return unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode().upper().strip()


def numeros(campo, n):
    """Los valores de un rango separados por comas. Se usan los primeros: el Mapa a veces manda uno menos al final (en una jurisdicción
    sin ese organismo, como el poder judicial del Ministerio Público de la Acusación de Jujuy)."""
    v = [int(float(x)) for x in campo.split(",")]
    assert len(v) >= n, f"el Mapa cambió de forma: se esperaban al menos {n} valores y llegaron {len(v)} ({campo})"
    return v


def consultar(anio, i):
    pagina = "consultaTodosCamaraRCABA" if i == 1 else "consultaTodosCamaraR"
    d = json.loads(leer(f"{BASE}/consultaMapa/{pagina}.html?anio={anio}&idJurisdiccion={i}"))
    assert isinstance(d, list) and len(d) >= 13, f"el Mapa cambió de forma en {anio}, jurisdicción {i}: {str(d)[:120]}"
    return d


def filas(anio, resp):
    """Una fila por jurisdicción: [personas de cada rango] mujeres y varones. Poder judicial: ministros, magistratura, funcionariado,
    administrativo, servicio y un sexto valor siempre en cero. Ministerio público fiscal: procuradores y fiscales, y tres rangos más. De la
    defensa: defensores y tres más (data3[1], [2], [5], [6], [9] y [10] del mapa interactivo)."""
    sale, mpa = {}, {"m": 0, "v": 0}
    for i, d in resp.items():
        pm, pv, fm, fv, dm, dv = numeros(d[1], 2), numeros(d[2], 2), numeros(d[5], 1), numeros(d[6], 1), numeros(d[9], 1), numeros(d[10], 1)
        if i == 62:  # el Ministerio Público de la Acusación de Jujuy: sus fiscales se suman a los del ministerio fiscal de Jujuy (49)
            mpa.update(m=fm[0], v=fv[0])
            continue
        nombre = norm(d[0])
        assert nombre in CODIGO, f"jurisdicción que no se reconoce en el Mapa: {d[0]}"
        assert CODIGO[nombre] not in sale, f"jurisdicción repetida en el Mapa: {d[0]}"
        sale[CODIGO[nombre]] = dict(ministros_mujeres=pm[0], ministros_varones=pv[0], magistratura_mujeres=pm[1], magistratura_varones=pv[1],
                                    fiscales_mujeres=fm[0], fiscales_varones=fv[0], defensores_mujeres=dm[0], defensores_varones=dv[0])
    assert set(sale) == set(CODIGO.values()), f"faltan jurisdicciones en {anio}: {set(CODIGO.values()) - set(sale)}"
    sale["38"]["fiscales_mujeres"] += mpa["m"]
    sale["38"]["fiscales_varones"] += mpa["v"]
    return [{"anio": anio, "codigo_indec": c, **f} for c, f in sorted(sale.items())]


def main():
    crudos = MANUAL / "justicia_provincias_om.json"
    # con --sin-bajar se vuelve a armar la tabla con las respuestas ya guardadas, sin consultar el Mapa
    if "--sin-bajar" in sys.argv:
        crudo = {int(a): r for a, r in json.loads(crudos.read_text(encoding="utf-8"))["respuestas"].items()}
    else:
        inicio = leer(f"{BASE}/")
        ultimo = int(re.search(r'name="anioUltimaCarga" id="anioUltimaCarga"\s+value="(\d{4})"', inicio).group(1))
        crudo = {}
        for anio in range(2011, ultimo + 1):
            crudo[anio] = {}
            for i in IDS:
                crudo[anio][str(i)] = consultar(anio, i)
                time.sleep(.3)
            print(anio, "bajado")
        crudos.write_text(json.dumps({"fuente": f"{BASE}/ (Comparativo por institución, totales)", "consultado": datetime.date.today().isoformat(),
                                      "respuestas": crudo}, ensure_ascii=False), encoding="utf-8", newline="\n")
    todas = []
    for anio, resp in sorted(crudo.items()):
        todas += filas(anio, {int(i): r for i, r in resp.items()})
    t = pd.DataFrame(todas)
    # una categoría en cero en las dos columnas es un dato que la jurisdicción no cargó
    for k in ["ministros", "magistratura", "fiscales", "defensores"]:
        vacio = t[f"{k}_mujeres"].eq(0) & t[f"{k}_varones"].eq(0)
        t.loc[vacio, [f"{k}_mujeres", f"{k}_varones"]] = None
    u = t[t.anio == 2025]
    if len(u):
        assert u.ministros_mujeres.sum() + u.ministros_varones.sum() == 138, "2025: los ministros no suman 138, como el Mapa publicado"
        assert u.magistratura_mujeres.sum() + u.magistratura_varones.sum() == 5201, "2025: la magistratura no suma 5.201, como el Mapa publicado"
    cols = [c for c in t.columns if c not in ("anio", "codigo_indec")]
    t[cols] = t[cols].astype("Int64")
    t.to_csv(MANUAL / "justicia_provincias.csv", index=False, lineterminator="\n")
    print(f"Listo: {len(t)} filas, {t.anio.min()} a {t.anio.max()}")


if __name__ == "__main__":
    main()
