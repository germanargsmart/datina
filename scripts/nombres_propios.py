"""Nombres de legisladores y de bloques como se leen (plan de mejora, R10, 27 de octubre de 2026).

Las dos fuentes del Congreso (el registro de la Cámara en datos/manual y las actas de ¿Cómo Votó?) escriben el apellido en
mayúsculas y muchas veces sin tildes: "RODRIGUEZ, Marcela Virginia", "COALICION CIVICA", "Ucr - Union Civica Radical".
02_procesar.py los arregla al escribir las tablas. La unión de personas, de reemplazos y de bloques sigue con el nombre de la
fuente (sin tildes ni mayúsculas), así que ninguna cuenta cambia.

- Tildes: primero las palabras de datos/manual/tildes_nombres.json, que siempre llevan tilde (María, Rodríguez) o que la fuente
  escribe con una de más (Juán). Después, en los nombres de personas, la forma con tilde que la otra fuente da a la misma persona
  (Insfrán, Cabandié, Solá): variantes() junta las formas de cada persona.
- Mayúsculas: inicial mayúscula en cada palabra, salvo "de", "del", "la", "las", "los" e "y" dentro del nombre ("Abdala de
  Matarazzo", "María de los Ángeles"), y las siglas de los bloques (PRO, ARI, UCR) y las letras sueltas con punto (A.R.I, F.C.E.).
  Un bloque que la fuente escribe con mayúsculas y minúsculas conserva las suyas, salvo las palabras de enlace y las siglas.

La prueba es scripts/prueba_nombres.py (03_construir_sitio.py la corre antes de armar).
"""
import html
import json
import re
import unicodedata
from pathlib import Path

_TABLA = json.loads((Path(__file__).resolve().parent.parent / "datos" / "manual" / "tildes_nombres.json").read_text(encoding="utf-8"))
TILDES_PERSONAS = _TABLA["personas"]
TILDES_BLOQUES = {**_TABLA["personas"], **_TABLA["bloques"]}
SIGLAS = set(_TABLA["siglas"])
ENLACES = {"de", "del", "la", "las", "los", "y", "e"}
ENLACES_BLOQUE = ENLACES | {"el", "en", "para", "por", "con", "contra", "a", "al", "un", "una", "mi"}
# "la", "las", "los" y "el" van en minúscula solo después de una preposición, de "y" o de una coma ("Unión por la Patria", "De la Rúa",
# "por el Trabajo, la Justicia y la Educación"): si no, son parte de un nombre propio ("Alianza La Libertad Avanza", "Partido
# Justicialista La Pampa", "Ana La Rosa")
ARTICULOS = {"el", "la", "las", "los"}
PREPOSICIONES = {"de", "del", "en", "para", "por", "con", "contra", "a", "al", "y", "e", ","}
_PALABRA = re.compile(r"[^\W\d_]+")


def sin_tildes(s):
    """Minúsculas y sin tildes, con la ñ y la ü: la clave de cada palabra en la tabla."""
    return unicodedata.normalize("NFC", "".join(c for c in unicodedata.normalize("NFD", s.lower())
                                                if unicodedata.category(c) != "Mn" or c in "̃̈"))


def clave_persona(n):
    """La misma persona en las dos fuentes: el nombre sin tildes, mayúsculas ni signos."""
    return re.sub(r"[^a-zñü, ]", "", sin_tildes(n)).strip()


def variantes(nombres):
    """Las formas en que las fuentes escriben a cada persona, por clave_persona()."""
    v = {}
    for n in nombres:
        if isinstance(n, str):
            v.setdefault(clave_persona(n), set()).add(n)
    return v


def _con_tilde(p):
    return p.lower() != sin_tildes(p)


def _palabras_de(n):
    return [p.group(0) for p in _PALABRA.finditer(n)]


def _limpio(s):
    return re.sub(r"\s+", " ", html.unescape(s).replace("\xa0", " ")).strip()


def persona(n, todas=None):
    """"RODRIGUEZ, Marcela Virginia" -> "Rodríguez, Marcela Virginia". todas: lo que devuelve variantes(), para tomar las tildes
    que la otra fuente le pone a la misma persona."""
    if not isinstance(n, str):
        return n
    n = _limpio(n)
    # tildes de las otras formas de la misma persona, palabra por palabra, si tienen las mismas palabras
    propias = _palabras_de(n)
    otras = {}
    for v in (todas or {}).get(clave_persona(n), ()):
        pv = _palabras_de(_limpio(v))
        if len(pv) == len(propias) and all(sin_tildes(a) == sin_tildes(b) for a, b in zip(pv, propias)):
            for i, p in enumerate(pv):
                if _con_tilde(p):
                    otras.setdefault(i, p.lower())
    trozos = re.split(r"([^\W\d_]+)", n)
    salida, i, primera, previa = [], 0, True, ""
    for j, trozo in enumerate(trozos):
        if not _PALABRA.fullmatch(trozo):
            salida.append(trozo)
            primera = primera or "," in trozo  # después de la coma empieza el nombre de pila
            continue
        k = sin_tildes(trozo)
        p = TILDES_PERSONAS.get(k) or (trozo.lower() if _con_tilde(trozo) else otras.get(i, trozo.lower()))
        inicial = j + 1 < len(trozos) and trozos[j + 1].startswith(".")  # "Juan E. Pérez"
        enlace = p in ENLACES and (p not in ARTICULOS or previa in PREPOSICIONES)
        salida.append(p if enlace and not primera and not inicial else p[:1].upper() + p[1:])
        i += 1
        primera, previa = False, p
    return "".join(salida)


def bloque(b):
    """"COALICION CIVICA - ARI" -> "Coalición Cívica - ARI", "Ucr - Union Civica Radical" -> "UCR - Unión Cívica Radical"."""
    if not isinstance(b, str):
        return b
    trozos = re.split(r"([^\W\d_]+)", _limpio(b))
    salida, primera, previa = [], True, ""
    for j, trozo in enumerate(trozos):
        if not _PALABRA.fullmatch(trozo):
            salida.append(trozo)
            primera = primera or bool(re.search(r"[-–/(+]", trozo))  # un guion, una barra o un paréntesis empiezan otra parte
            previa = "," if "," in trozo else previa
            continue
        abreviatura = j + 1 < len(trozos) and trozos[j + 1].startswith(".")  # "Fte.", "Mov.", "A.R.I", "U. Ce. De."
        k = sin_tildes(trozo)
        p = TILDES_BLOQUES.get(k) or trozo.lower()
        if trozo.upper() in SIGLAS or (len(trozo) == 1 and (abreviatura or j and trozos[j - 1].endswith("."))):
            salida.append(trozo.upper())
        elif p in ENLACES_BLOQUE and (p not in ARTICULOS or previa in PREPOSICIONES) and not primera and not abreviatura:
            salida.append(p)
        elif trozo[1:] != trozo[1:].lower() and trozo[1:] != trozo[1:].upper() and len(p) == len(trozo):
            # mayúsculas en el medio de la palabra ("McKenzie"): se respetan, con la tilde que falte
            salida.append("".join(c.upper() if o.isupper() else c for c, o in zip(p, trozo)))
        else:
            salida.append(p[:1].upper() + p[1:])
        primera, previa = False, p
    return "".join(salida)
