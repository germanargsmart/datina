"""
Pruebas del validador del catálogo del Explorador de relaciones (scripts/relaciones.py, tarea D3-02 del plan Datina Lab).
Rompe a propósito una copia del catálogo de quince formas distintas y controla que el validador marque cada una: relaciones huérfanas,
evidencia que no está en el código, tipos que no corresponden, fichas sin origen, metadatos que faltan, ciclos y organismos que el
pie de la ficha no nombra. También controla que el catálogo real no tenga errores.
La corre 03_construir_sitio.py antes de armar el explorador. Sola: python scripts/prueba_relaciones.py
"""
import copy, json, pathlib, sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import relaciones  # noqa: E402

PLANTILLA = (relaciones.RAIZ / "scripts" / "plantilla.html").read_text(encoding="utf-8")
CAT = json.loads(relaciones.CATALOGO.read_text(encoding="utf-8"))


def una(cat, tipo, a=None, de=None):
    return next(x for x in cat["aristas"] if x["tipo"] == tipo and (a is None or x["a"] == a) and (de is None or x["de"] == de))


def _id_repetido(c):
    c["conjuntos"].append(copy.deepcopy(c["conjuntos"][0]))


def _destino_inexistente(c):
    una(c, "alimenta")["a"] = "f-no-existe"


def _origen_inexistente(c):
    una(c, "alimenta")["de"] = "ds:no_existe.csv"


def _tipo_invalido(c):
    una(c, "alimenta")["tipo"] = "se parece a"


def _evidencia_falsa(c):
    una(c, "alimenta")["evidencia"][0]["contiene"] = "este texto no está en ningún programa del sitio 8f3a"


def _archivo_inexistente(c):
    una(c, "alimenta")["evidencia"][0]["archivo"] = "scripts/no_existe.py"


def _archivo_fuera(c):
    una(c, "alimenta")["evidencia"][0]["archivo"] = "../../etc/passwd"


def _sin_evidencia(c):
    una(c, "alimenta")["evidencia"] = []


def _fuente_inexistente(c):
    c["conjuntos"][0]["fuente"] = "org:no-existe"


def _ruta_inexistente(c):
    c["conjuntos"][0]["ruta"] = "datos/crudo/no_existe.csv"


def _ficha_sin_origen(c):
    c["aristas"] = [x for x in c["aristas"] if x["a"] != "f-homicidios"]


def _conjunto_sin_uso(c):
    usado = c["conjuntos"][0]["id"]
    c["aristas"] = [x for x in c["aristas"] if x["de"] != usado]


def _fuente_sin_conjuntos(c):
    c["fuentes"].append({"id": "org:sin-archivos", "nombre": "Organismo sin archivos", "alias": []})


def _ciclo(c):
    x = una(c, "calcula")
    c["aristas"].append({"tipo": "calcula", "de": x["a"], "a": x["de"], "evidencia": x["evidencia"]})


def _calcula_desde_archivo(c):
    x = una(c, "alimenta")
    c["aristas"].append({"tipo": "calcula", "de": x["de"], "a": x["a"], "evidencia": x["evidencia"]})


def _ficha_de_suicidio(c):
    x = una(c, "alimenta", a="f-homicidios")
    c["aristas"].append({"tipo": "alimenta", "de": x["de"], "a": "f-suicidio", "evidencia": x["evidencia"]})


def _pie_no_nombra(c):
    snic = next(f for f in c["fuentes"] if f["id"] == "org:snic")
    snic.update({"nombre": "Organismo inventado", "sigla": "OI", "alias": []})


def _relacion_repetida(c):
    c["aristas"].append(copy.deepcopy(una(c, "alimenta")))


# (nombre, cambio, texto que tiene que aparecer en algún error)
CASOS = [
    ("id repetido", _id_repetido, "id repetido"),
    ("relación hacia una ficha que no existe", _destino_inexistente, "va de un conjunto a un indicador"),
    ("relación desde un archivo que no existe", _origen_inexistente, "va de un conjunto a un indicador"),
    ("tipo de relación inválido", _tipo_invalido, "tipo"),
    ("evidencia que no está en el código", _evidencia_falsa, "no está en ninguna línea"),
    ("evidencia en un archivo que no existe", _archivo_inexistente, "no existe el archivo"),
    ("evidencia fuera del repositorio", _archivo_fuera, "no existe el archivo"),
    ("relación sin evidencia", _sin_evidencia, "falta la evidencia"),
    ("archivo con un organismo que no está", _fuente_inexistente, "no está en el catálogo"),
    ("archivo con una ruta que no existe", _ruta_inexistente, "no existe datos/crudo/no_existe.csv"),
    ("ficha sin origen", _ficha_sin_origen, "f-homicidios: ninguna relación"),
    ("archivo que no alimenta nada", _conjunto_sin_uso, "conjunto que no alimenta"),
    ("organismo sin archivos", _fuente_sin_conjuntos, "fuente que no publica"),
    ("ciclo en 'se calcula a partir de'", _ciclo, "ciclo"),
    ("'se calcula a partir de' desde un archivo", _calcula_desde_archivo, "va de un indicador a un indicador"),
    ("relación hacia una ficha de suicidios", _ficha_de_suicidio, "no entran"),
    ("pie que no nombra al organismo", _pie_no_nombra, "no nombra a ninguno"),
    ("relación repetida", _relacion_repetida, "relación repetida"),
]


def correr(mostrar=True):
    """Devuelve la lista de problemas (vacía si el validador hace su trabajo)."""
    problemas = []
    base = relaciones.validar(CAT, PLANTILLA)
    if base:
        problemas.append("el catálogo real tiene errores: " + "; ".join(base[:5]))
    for nombre, cambio, esperado in CASOS:
        c = copy.deepcopy(CAT)
        cambio(c)
        err = relaciones.validar(c, PLANTILLA)
        ok = any(esperado in e for e in err)
        if not ok:
            problemas.append(f"el validador no marcó: {nombre} (esperaba un error con «{esperado}», dio {err[:3]})")
        if mostrar:
            print(f"  {'bien' if ok else 'MAL '}  {nombre}")
    return problemas


if __name__ == "__main__":
    p = correr()
    if p:
        sys.exit("\n".join(p))
    print(f"Validador del catálogo de relaciones: {len(CASOS)} casos rotos detectados y el catálogo real sin errores")
