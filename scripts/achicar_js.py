"""
Achica sitio/datina.js (plan de mejora, D2, 4 de noviembre de 2026): saca los comentarios y la sangría, y nada más. No es un minificador: no cambia
nombres ni espacios dentro de una línea, así las pruebas que buscan textos en sitio/datina.js (prueba_escala.mjs, prueba_fallas.mjs) siguen leyendo lo
mismo y un error del navegador se puede ubicar en el archivo.

Lee el código de a un carácter para saber dónde está: dentro de un texto entre comillas o entre acentos graves (con sus ${...}, que pueden tener otros
textos adentro) y dentro de una expresión regular no se toca nada, y una línea que empieza adentro de un texto de varias líneas tampoco pierde su
sangría, porque esos espacios son parte del texto. Solo se saca lo que está seguro afuera de todo eso.
Prueba: python scripts/prueba_achicar_js.py
"""
import re

# después de estas palabras, una barra abre una expresión regular y no es una división
_ANTES_DE_REGEX = {"return", "typeof", "case", "in", "of", "delete", "void", "throw", "new", "else", "do", "yield", "await", "instanceof"}


def _fin_regex(s, i):
    """El índice después de la expresión regular que empieza en i (con sus letras finales)"""
    j, en_clase = i + 1, False
    while True:
        c = s[j]
        if c == "\\":
            j += 2
            continue
        if c == "\n":
            raise ValueError(f"expresión regular sin cerrar en la posición {i}: {s[i:i + 60]!r}")
        if c == "[":
            en_clase = True
        elif c == "]":
            en_clase = False
        elif c == "/" and not en_clase:
            j += 1
            while j < len(s) and s[j].isalpha():
                j += 1
            return j
        j += 1


def achicar(s):
    """El mismo código sin comentarios y sin la sangría de las líneas. Si no entiende algo, frena: es mejor un armado frenado que un código roto"""
    assert "\r" not in s, "datina.js tiene que llegar con finales de línea LF"
    out, i, n = [], 0, len(s)
    pila = []  # por cada ${ abierto dentro de un texto con acentos graves: cuántas llaves se abrieron adentro
    ultimo = ""  # lo último que se escribió que no es un espacio: decide si una barra es una división o una expresión regular
    palabra = ""

    def texto_grave(i):
        """Copia un texto con acentos graves desde i hasta su final o hasta un ${, y dice dónde siguió"""
        j = i
        while True:
            if j >= n:
                raise ValueError("texto con acentos graves sin cerrar")
            c = s[j]
            if c == "\\":
                j += 2
            elif c == "`":
                out.append(s[i:j + 1])
                return j + 1, False
            elif c == "$" and s[j + 1] == "{":
                out.append(s[i:j + 2])
                return j + 2, True
            else:
                j += 1

    while i < n:
        c = s[i]
        if c == "\n":
            # fin de línea de código: la que sigue pierde la sangría, y si quedó vacía no se escribe
            out.append("\n")
            i += 1
            while i < n and s[i] in " \t":
                i += 1
        elif c in " \t":
            out.append(c)
            i += 1
        elif c == "/" and s[i + 1] == "/":
            j = s.find("\n", i)
            j = n if j < 0 else j
            i = j
            # lo que quedó antes del comentario en la misma línea no lleva los espacios del final
            while out and out[-1] in (" ", "\t"):
                out.pop()
        elif c == "/" and s[i + 1] == "*":
            j = s.find("*/", i + 2)
            if j < 0:
                raise ValueError("comentario sin cerrar")
            # si el comentario tenía un salto de línea, queda el salto: JavaScript lo usa para saber dónde termina una instrucción
            if "\n" in s[i:j]:
                out.append("\n")
                while j + 2 < n and s[j + 2] in " \t":
                    j += 1
            i = j + 2
        elif c == "/":
            es_regex = ultimo in ("", "(", ",", "=", ":", "[", "!", "&", "|", "?", "{", "}", ";", "+", "-", "*", "%", "<", ">", "~", "^", "\n") or palabra in _ANTES_DE_REGEX
            if es_regex:
                j = _fin_regex(s, i)
                out.append(s[i:j])
                i = j
                ultimo, palabra = "/", ""
            else:
                out.append(c)
                i += 1
                ultimo, palabra = "/", ""
        elif c in "\"'":
            j = i + 1
            while s[j] != c:
                if s[j] == "\\":
                    j += 1
                elif s[j] == "\n":
                    raise ValueError(f"texto sin cerrar en la posición {i}: {s[i:i + 60]!r}")
                j += 1
            out.append(s[i:j + 1])
            i = j + 1
            ultimo, palabra = c, ""
        elif c == "`":
            out.append("`")
            i, abierto = texto_grave(i + 1)
            if abierto:
                pila.append(0)
                ultimo, palabra = "{", ""
            else:
                ultimo, palabra = "`", ""
        elif c == "{":
            if pila:
                pila[-1] += 1
            out.append(c)
            i += 1
            ultimo, palabra = c, ""
        elif c == "}":
            if pila and pila[-1] == 0:
                # termina un ${...}: sigue el texto con acentos graves
                pila.pop()
                out.append("}")
                i, abierto = texto_grave(i + 1)
                if abierto:
                    pila.append(0)
                    ultimo, palabra = "{", ""
                else:
                    ultimo, palabra = "`", ""
            else:
                if pila:
                    pila[-1] -= 1
                out.append(c)
                i += 1
                ultimo, palabra = c, ""
        elif c.isalnum() or c in "_$":
            m = re.compile(r"[\w$]+").match(s, i)
            out.append(m.group())
            i = m.end()
            ultimo, palabra = "a", m.group()
        else:
            out.append(c)
            i += 1
            ultimo, palabra = c, ""
    if pila:
        raise ValueError("un ${ sin cerrar")
    # las líneas que quedaron vacías (las que tenían solo un comentario) se van, salvo que estén dentro de un texto: esas nunca llegan acá vacías
    # porque el texto se copia entero con sus saltos de línea, así que se protege recorriendo las piezas
    return _sin_lineas_vacias(out)


def _sin_lineas_vacias(piezas):
    """Junta las piezas sin escribir dos saltos de línea seguidos que sean del código (un salto dentro de un texto viaja dentro de su pieza)"""
    r, previa = [], "\n"
    for p in piezas:
        if p == "\n" and previa == "\n":
            continue
        if p in (" ", "\t") and previa == "\n":
            continue
        r.append(p)
        previa = p
    return "".join(r)
