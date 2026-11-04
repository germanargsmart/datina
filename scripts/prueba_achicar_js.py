"""
Prueba de scripts/achicar_js.py (plan de mejora, D2, 4 de noviembre de 2026), sin red: lo que tiene que sacar y, sobre todo, lo que no puede tocar.
Uso: python scripts/prueba_achicar_js.py. 03 la corre antes de armar y no arma el sitio si falla.
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from achicar_js import achicar

CASOS = [
    ("un comentario de línea entera se va", "a;\n  // nota\nb;\n", "a;\nb;\n"),
    ("la sangría se va", "if (a) {\n    b;\n}\n", "if (a) {\nb;\n}\n"),
    ("un comentario al final de la línea se va", "a; // nota\nb;\n", "a;\nb;\n"),
    ("un comentario de bloque se va", "/* nota\n otra */\na;\n", "a;\n"),
    ("un bloque con un salto de línea deja el salto", "a /* x\n y */ b\n", "a \nb\n"),
    ("una dirección entre comillas no es un comentario", 'u = "https://x.y"; // nota\n', 'u = "https://x.y";\n'),
    ("tampoco entre acentos graves", "u = `https://x.y`;\n", "u = `https://x.y`;\n"),
    ("un texto de varias líneas conserva sus espacios y sus //", "t = `uno\n   // dos\n  tres`;\n", "t = `uno\n   // dos\n  tres`;\n"),
    ("los ${} anidados con texto adentro", 't = `a ${b ? `c // d ${e}` : "f // g"} h // i`;\n', 't = `a ${b ? `c // d ${e}` : "f // g"} h // i`;\n'),
    ("un objeto dentro de un ${}", "t = `${f({a: 1}) /* x */} // y`;\n", "t = `${f({a: 1}) } // y`;\n"),
    ("una expresión regular con // y comillas", r'''r = /a\/\/"b/g; // nota''' + "\n", r'''r = /a\/\/"b/g;''' + "\n"),
    ("una expresión regular con una barra en su clase", "r = s.replace(/[/\"]/g, '');\n", "r = s.replace(/[/\"]/g, '');\n"),
    ("una división no es una expresión regular", "a = b / c; d = (e) / 2; // nota\n", "a = b / c; d = (e) / 2;\n"),
    ("después de return, una expresión regular", "return /x'y/.test(a);\n", "return /x'y/.test(a);\n"),
    ("los espacios dentro de una línea no cambian", 'a ? "fuerte" : b;\n', 'a ? "fuerte" : b;\n'),
    ("un texto con comillas y barra invertida", r'''a = "x\"// y"; b = 'z\'// w';''' + "\n", r'''a = "x\"// y"; b = 'z\'// w';''' + "\n"),
]
FRENAN = [("un texto sin cerrar frena", 'a = "b\nc;\n'), ("un acento grave sin cerrar frena", "a = `b;\n"), ("un comentario sin cerrar frena", "/* a\n")]


def revisar():
    """La lista de lo que falló, y los controles que dieron bien"""
    fallas, bien = [], []
    for nombre, entra, sale in CASOS:
        dio = achicar(entra)
        if dio == sale and achicar(dio) == dio:
            bien.append(nombre)
        else:
            fallas.append(f"{nombre}: {dio!r} y tenía que dar {sale!r}")
    for nombre, entra in FRENAN:
        try:
            achicar(entra)
            fallas.append(nombre)
        except (ValueError, IndexError):
            bien.append(nombre)
    return fallas, bien


if __name__ == "__main__":
    fallas, bien = revisar()
    for x in bien:
        print("bien  " + x)
    for x in fallas:
        print("FALLA " + x)
    print("Todo bien" if not fallas else f"{len(fallas)} fallas")
    sys.exit(1 if fallas else 0)
