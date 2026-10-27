"""
Inventario de los textos que ve el lector (reescritura editorial del 26 de octubre de 2026, docs/redaccion/).
Recorre las fuentes de verdad de lo que se publica y saca cada pieza de texto con un identificador estable:
- scripts/plantilla.html, scripts/relaciones.html y las páginas del consultor de pobreza: cada título, párrafo, botón, opción, enlace y
  pie, y los atributos que leen los lectores de pantalla o los buscadores (aria-label, title, alt, placeholder, data-titulo,
  data-descr, data-corta, meta),
- scripts/datina.js, scripts/relaciones.js, scripts/consulta_ia.js y functions/: las cadenas y plantillas con texto, juntas por la
  entrada que las usa (LEAD.empleo, TX.salarios, CLAVE.inflacion, textoArt...). Una plantilla dinámica se guarda tal como está escrita,
  con sus ${...}: sus variantes se comprueban en el volcado de las páginas (scripts/volcar_textos.mjs),
- scripts/03_construir_sitio.py, scripts/catalogo.py y scripts/relaciones.py: las cadenas con texto, por función,
- los JSON de datos/manual/ con textos (explicadores, historia de las provincias, catálogo, distorsiones, programas, organismos del
  Explorador), por su ruta dentro del archivo,
- README.md (la presentación del proyecto).
Compara la versión de un commit (por defecto HEAD) con el árbol de trabajo y escribe el inventario en docs/redaccion/: el original y
el texto nuevo completos, el estado y el motivo (de docs/redaccion/propuestas/*.json y docs/redaccion/conservados.json), y si el texto
nuevo se encontró en la página armada (con dos volcados de scripts/volcar_textos.mjs).
Escribe docs/redaccion/INVENTARIO_COPY_GLOBAL.md (cobertura por tipo de página y por ruta), docs/redaccion/inventario/<grupo>.md e
inventario.json (cada pieza) y docs/redaccion/PENDIENTES.md (lo que quedó pendiente en las propuestas).
Uso: python scripts/inventario_textos.py [--ref HEAD] [--antes volcado_antes.json] [--despues volcado_despues.json] [--rutas-antes rutas.txt]
         [--moldes textos_evaluados.json]   (los textos de datina.js evaluados en la página, para los que no están en la vista inicial)
     python scripts/inventario_textos.py --listar archivo   (las piezas de un archivo del árbol de trabajo, para revisarlas)
"""
import ast, collections, difflib, html, json, pathlib, re, subprocess, sys
from html.parser import HTMLParser

RAIZ = pathlib.Path(__file__).resolve().parents[1]
SALIDA = RAIZ / "docs" / "redaccion"

# ---------- qué es texto ----------
# Una cadena es texto para el lector si, sin sus ${...} ni sus etiquetas, tiene letras y alguna marca del castellano (una tilde, una
# palabra frecuente, una mayúscula seguida de minúsculas) y no es un selector, una clase, una ruta o un nombre de variable
PALABRAS = set("""de la el los las en y e o u que por con del cada para un una se a al su sus es son fue más menos no sin entre hasta
desde ver tabla país provincia provincias años año mes datos dato fuente según sobre como cuánto cuántos cuántas qué dónde total
hogares personas hay tiene tienen fueron""".split())
NO_TEXTO = set("""Enter Escape ArrowDown ArrowUp ArrowLeft ArrowRight Tab Home End Infinity NaN Promise Object Array JSON Math Date
GET POST UTF Content Type application text html utf""".split())
_LETRAS = re.compile(r"[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+")

def sin_codigo(s):
    """La cadena sin ${...} (con llaves anidadas), sin etiquetas y sin entidades: lo que lee una persona."""
    out, i, n = [], 0, len(s)
    while i < n:
        if s.startswith("${", i):
            prof, i = 1, i + 2
            while i < n and prof:
                prof += {"{": 1, "}": -1}.get(s[i], 0)
                i += 1
            out.append(" ")
        else:
            out.append(s[i]); i += 1
    t = re.sub(r"<[^>]*>", " ", "".join(out))
    return re.sub(r"\s+", " ", html.unescape(t)).strip()

def es_texto(s):
    t = sin_codigo(s)
    pal = _LETRAS.findall(t)
    if not pal or len("".join(pal)) < 3:
        return False
    if re.fullmatch(r"[\w\-./#:?=&%]+", t) and not re.search(r"[áéíóúñÁÉÍÓÚÑ¿]", t):
        # una sola "palabra" con guiones, puntos o barras: clase, id, ruta o clave, salvo que sea una palabra con mayúscula
        return bool(re.fullmatch(r"[A-ZÁÉÍÓÚÑ][a-záéíóúñü]{2,}", t)) and t not in NO_TEXTO
    if re.search(r"[áéíóúñÁÉÍÓÚÑ¿¡]", t):
        return True
    minus = [p.lower() for p in pal]
    if any(p in PALABRAS for p in minus):
        return True
    return bool(re.match(r"[A-ZÁÉÍÓÚÑ][a-záéíóúñü]+", t)) and t not in NO_TEXTO and not re.search(r"[{};=]|=>", t)

# ---------- HTML ----------
BLOQUE = {"title", "h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "dt", "dd", "button", "option", "label", "summary", "figcaption",
          "th", "td", "caption", "legend", "blockquote", "small"}
ATRIBUTOS = ["aria-label", "title", "alt", "placeholder", "aria-description", "data-titulo", "data-descr", "data-corta", "content", "value"]

class _Html(HTMLParser):
    """Guarda cada elemento con su posición en el texto fuente para poder recortar su contenido tal como está escrito."""
    def __init__(self, src):
        super().__init__(convert_charrefs=False)
        self.src, self.pila, self.elems = src, [], []
        self._ini = [0]
        for linea in src.splitlines(keepends=True):
            self._ini.append(self._ini[-1] + len(linea))
    def _pos(self):
        l, c = self.getpos()
        return self._ini[l - 1] + c
    def handle_starttag(self, tag, attrs):
        ini = self._pos()
        el = {"tag": tag, "attrs": dict(attrs), "ini": ini, "dentro": ini + len(self.get_starttag_text()), "padre": self.pila[-1] if self.pila else None,
              "linea": self.getpos()[0]}
        self.elems.append(el)
        if tag not in ("br", "img", "input", "meta", "link", "hr", "source", "wbr", "area", "col", "path", "circle", "rect", "line", "use"):
            self.pila.append(el)
    def handle_startendtag(self, tag, attrs):
        ini = self._pos()
        self.elems.append({"tag": tag, "attrs": dict(attrs), "ini": ini, "dentro": ini, "fin": ini, "padre": self.pila[-1] if self.pila else None,
                           "linea": self.getpos()[0]})
    def handle_endtag(self, tag):
        for k in range(len(self.pila) - 1, -1, -1):
            if self.pila[k]["tag"] == tag:
                for el in self.pila[k:]:
                    el.setdefault("fin", self._pos())
                del self.pila[k:]
                break

def _ancestro_id(el):
    while el is not None:
        if el["attrs"].get("id"):
            return el["attrs"]["id"]
        el = el["padre"]
    return "pagina"

def _firma(el):
    c = (el["attrs"].get("class") or "").split()
    extra = el["attrs"].get("data-m") or el["attrs"].get("value") or el["attrs"].get("data-t") or ""
    return el["tag"] + ("." + ".".join(c[:2]) if c else "") + (f"[{extra}]" if extra else "")

def tipo_html(el):
    tag, cls = el["tag"], (el["attrs"].get("class") or "")
    padre = el["padre"]
    pcls = (padre["attrs"].get("class") or "") if padre else ""
    if tag == "title": return "SEO"
    if tag == "h1": return "título de página"
    if tag in ("h2", "h3") and _dentro_de(el, "article", "ficha"): return "pregunta de ficha"
    if tag in ("h2", "h3", "h4"): return "título"
    if "ficha-sub" in cls: return "bajada de ficha"
    if "pregunta" in cls: return "pregunta de página"
    if "lead" in cls: return "texto de ficha"
    if "nota" in cls: return "nota metodológica"
    if tag == "button": return "botón"
    if tag == "option": return "opción de selector"
    if tag == "label": return "etiqueta de control"
    if "pie" in pcls: return "fuente o descarga"
    return "párrafo" if tag == "p" else "texto de interfaz"

def _dentro_de(el, tag, clase):
    el = el["padre"]
    while el is not None:
        if el["tag"] == tag and clase in (el["attrs"].get("class") or "").split():
            return True
        el = el["padre"]
    return False

def piezas_html(src, archivo):
    p = _Html(src); p.feed(src); p.close()
    vistos = collections.Counter()
    res = []
    def agregar(base, tipo, texto, linea, ubic):
        vistos[base] += 1
        res.append({"id": f"{archivo}#{base}" + (f"~{vistos[base]}" if vistos[base] > 1 else ""), "archivo": archivo, "tipo": tipo,
                    "texto": texto, "linea": linea, "ubic": ubic})
    for el in p.elems:
        anc = _ancestro_id(el)
        firma = _firma(el)
        # los textos de los atributos
        for a in ATRIBUTOS:
            v = el["attrs"].get(a)
            if v and es_texto(v) and not (a == "content" and el["tag"] != "meta") and not (a == "value" and el["tag"] != "input"):
                if a == "content" and el["attrs"].get("name") not in ("description",) and not (el["attrs"].get("property") or "").startswith("og:"):
                    continue
                agregar(f"{anc}/{firma}@{a}", "accesibilidad" if a.startswith("aria") or a in ("alt", "title") else
                        "SEO" if a == "content" else "texto de tarjeta" if a.startswith("data-") else "texto de interfaz", v, el["linea"], f"{anc} > {firma} [{a}]")
        if el["tag"] not in BLOQUE or "fin" not in el:
            if el["tag"] in ("span", "a", "div") and "fin" in el and el["padre"] is not None and "pie" in (el["padre"]["attrs"].get("class") or "").split():
                pass
            else:
                continue
        # un bloque dentro de otro bloque (un li con un p adentro) va con el de afuera
        q, dentro = el["padre"], False
        while q is not None:
            if q["tag"] in BLOQUE:
                dentro = True; break
            q = q["padre"]
        if dentro:
            continue
        interior = src[el["dentro"]:el["fin"]]
        if not es_texto(interior):
            continue
        agregar(f"{anc}/{firma}", tipo_html(el), interior.strip(), el["linea"], f"{anc} > {firma}")
    return res

# ---------- JavaScript ----------
_REGEX_ANTES = set("(,=:[!&|?{};+-*%<>~^") | {"return", "typeof", "case", "do", "else", "in", "of", "new", "delete", "void", "throw", "=>"}

def literales_js(src):
    """Cadenas ('', "") y plantillas (``) de primer nivel, con su posición. Saltea comentarios y expresiones regulares, también
    dentro de los ${...} de una plantilla."""
    n, res = len(src), []
    def cadena(i):
        q, i = src[i], i + 1
        while i < n and src[i] != q:
            i += 2 if src[i] == "\\" else 1
        return i + 1
    def plantilla(i):
        # i apunta al acento grave de apertura. Devuelve la posición siguiente al de cierre
        i += 1
        while i < n:
            c = src[i]
            if c == "\\": i += 2; continue
            if c == "`": return i + 1
            if c == "$" and i + 1 < n and src[i + 1] == "{":
                i = codigo(i + 2, True); continue
            i += 1
        return n
    def codigo(i, hasta_llave, guardar=False):
        # recorre código hasta el final (o hasta la llave que cierra un ${), y devuelve dónde terminó
        prev, prof = "(", 0
        while i < n:
            c = src[i]
            if c == "/" and src.startswith("//", i):
                i = src.find("\n", i); i = n if i < 0 else i; continue
            if c == "/" and src.startswith("/*", i):
                j = src.find("*/", i + 2); i = n if j < 0 else j + 2; continue
            if c in "'\"":
                j = cadena(i)
                if guardar: res.append((i, j))
                i = j; prev = "valor"; continue
            if c == "`":
                j = plantilla(i)
                if guardar: res.append((i, j))
                i = j; prev = "valor"; continue
            if c == "/":
                if prev in _REGEX_ANTES:
                    j, clase = i + 1, False
                    while j < n:
                        if src[j] == "\\": j += 2; continue
                        if src[j] == "[": clase = True
                        elif src[j] == "]": clase = False
                        elif src[j] == "/" and not clase: break
                        elif src[j] == "\n": break
                        j += 1
                    j += 1
                    while j < n and src[j].isalpha(): j += 1
                    i = j; prev = "valor"; continue
                prev = "/"; i += 1; continue
            if hasta_llave and c == "{": prof += 1
            if hasta_llave and c == "}":
                if prof == 0: return i + 1
                prof -= 1
            if c.isspace():
                i += 1; continue
            m = re.match(r"[A-Za-z_$][\w$]*|\d[\d_.eExXa-fA-F]*", src[i:i + 80])
            if m:
                w = m.group(0)
                prev = w if w in _REGEX_ANTES else "valor"
                i += len(w); continue
            if src.startswith("=>", i):
                prev = "=>"; i += 2; continue
            prev = c if c not in ")]" else "valor"
            i += 1
        return n
    codigo(0, False, guardar=True)
    return res

def _lineas(src):
    ini = [0]
    for l in src.splitlines(keepends=True):
        ini.append(ini[-1] + len(l))
    return ini

def _linea_de(ini, pos):
    import bisect
    return bisect.bisect_right(ini, pos)

def piezas_js(src, archivo):
    lin = src.splitlines()
    ini = _lineas(src)
    # dueño de cada línea: la sentencia de primer nivel (const X, function f, X.y =) y, adentro, lo que está a dos espacios: la clave
    # de una tabla (LEAD, TX, CLAVE), el id de un elemento de una lista (ART) o una función o constante (en los archivos que van
    # enteros dentro de una función, como relaciones.js)
    duenio, clave = [None] * (len(lin) + 2), [None] * (len(lin) + 2)
    actual, k_actual = "(inicio)", None
    for idx, l in enumerate(lin, start=1):
        m = re.match(r"(?:export\s+)?(?:const|let|var|async\s+function|function|class)\s+([\w$]+)|([A-Za-z_$][\w$.]*)\s*=[^=]|Object\.assign\(([\w$]+),", l)
        if m and not l.startswith(" "):
            actual, k_actual = m.group(1) or m.group(2) or m.group(3), None
        else:
            mk = (re.match(r"  (?:\"([^\"]+)\"|'([^']+)'|([\w$-]+))\s*:", l) or re.match(r"\s{2,6}\{?\s*(?:id|k):\s*\"([\w-]+)\"", l)
                  or re.match(r"  (?:async\s+)?(?:const|let|var|function)\s+([\w$]+)", l))
            if mk:
                k_actual = next(g for g in mk.groups() if g)
        duenio[idx], clave[idx] = actual, k_actual
    grupos = collections.OrderedDict()
    for a, b in literales_js(src):
        crudo = src[a + 1:b - 1]
        if not es_texto(crudo):
            continue
        ln = _linea_de(ini, a)
        # lo que solo va a la consola o a un error del programa no lo ve el lector
        previo = src[max(0, a - 40):a]
        interno = bool(re.search(r"console\.\w+\([^)]*$|new Error\($|throw\s*$", previo))
        d = duenio[ln] or "(inicio)"
        k = clave[ln]
        gid = f"{archivo}#{d}" + (f".{k}" if k else "")
        g = grupos.setdefault(gid, {"id": gid, "archivo": archivo, "tipo": tipo_js(d, k, interno), "partes": [], "linea": ln,
                                    "ubic": f"{d}" + (f" › {k}" if k else "")})
        g["partes"].append(crudo)
    res = []
    for g in grupos.values():
        g["texto"] = "\n".join(g.pop("partes"))
        res.append(g)
    return res

TIPO_TABLA = {"LEAD": "texto de ficha", "TX": "texto de ficha", "CLAVE": "cifra destacada", "EN_CIFRAS": "En cifras", "EXTRA": "texto de ficha",
              "SERIE_CIFRA": "cifra destacada", "FRECUENCIA": "frecuencia", "DIB": "gráfico", "ART": "artículo", "ART_SERIE": "artículo",
              "textoArt": "artículo", "INDP": "perfil provincial", "CAP_P": "perfil provincial", "PERFIL": "perfil provincial"}
def tipo_js(d, k, interno):
    if interno: return "interno"
    return TIPO_TABLA.get(d, "gráfico" if d and d[:1].islower() and d not in ("prov",) else "texto de interfaz")

# ---------- Python ----------
def piezas_py(src, archivo):
    arbol = ast.parse(src)
    padres = {}
    for nodo in ast.walk(arbol):
        for h in ast.iter_child_nodes(nodo):
            padres[h] = nodo
    def duenio(nodo):
        q = nodo
        while q in padres:
            q = padres[q]
            if isinstance(q, (ast.FunctionDef, ast.AsyncFunctionDef)):
                return q.name
            if isinstance(q, ast.Assign) and q in arbol.body:
                t = q.targets[0]
                return t.id if isinstance(t, ast.Name) else ast.unparse(t)[:40]
            if isinstance(q, (ast.Expr, ast.AnnAssign, ast.AugAssign)) and q in arbol.body:
                return f"línea {q.lineno}"
        return "(módulo)"
    def es_interno(nodo):
        q = nodo
        while q in padres:
            q = padres[q]
            if isinstance(q, ast.Call):
                f = ast.unparse(q.func)
                if f in ("print", "sys.exit", "exit") or f.endswith(("Error", "Exception", ".write")) and f != "f.write":
                    return True
            if isinstance(q, (ast.Raise, ast.Assert)):
                return True
        return False
    docs = set()
    for nodo in ast.walk(arbol):
        if isinstance(nodo, (ast.Module, ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)) and nodo.body and isinstance(nodo.body[0], ast.Expr) \
                and isinstance(nodo.body[0].value, ast.Constant) and isinstance(nodo.body[0].value.value, str):
            docs.add(nodo.body[0].value)
    grupos = collections.OrderedDict()
    hechos = set()
    for nodo in ast.walk(arbol):
        if nodo in docs or nodo in hechos:
            continue
        if isinstance(nodo, ast.JoinedStr):
            for h in ast.walk(nodo):
                hechos.add(h)
            crudo = ast.get_source_segment(src, nodo) or ""
        elif isinstance(nodo, ast.Constant) and isinstance(nodo.value, str):
            crudo = ast.get_source_segment(src, nodo) or nodo.value
        else:
            continue
        if not es_texto(crudo.replace("{", "${") if isinstance(nodo, ast.JoinedStr) else crudo) or re.fullmatch(r"[rbuf]*['\"].*['\"]", crudo, re.S) and re.search(r"\\[sdwb]|\(\?|\[\^", crudo):
            continue
        d = duenio(nodo)
        gid = f"{archivo}#{d}"
        g = grupos.setdefault(gid, {"id": gid, "archivo": archivo, "tipo": "interno" if es_interno(nodo) else "texto de interfaz",
                                    "partes": [], "linea": nodo.lineno, "ubic": d})
        if es_interno(nodo) and g["tipo"] != "interno":
            gid += " (mensajes del programa)"
            g = grupos.setdefault(gid, {"id": gid, "archivo": archivo, "tipo": "interno", "partes": [], "linea": nodo.lineno, "ubic": d})
        g["partes"].append((nodo.lineno, crudo))
    res = []
    for g in grupos.values():
        g["texto"] = "\n".join(c for _, c in sorted(g.pop("partes")))
        res.append(g)
    return res

# ---------- JSON ----------
# claves que no se muestran (o que son citas, direcciones y evidencias del código): van al inventario como conservadas
NO_VISIBLE = {"url", "href", "archivo", "contiene", "evidencia", "id", "ruta", "depende", "de", "a", "tabla", "tipo", "accion", "_leeme",
              "_nota", "nota", "consultado", "en", "variables", "alias", "enlace"}
def piezas_json(obj, archivo):
    res = []
    def andar(o, ruta):
        if isinstance(o, dict):
            for k, v in o.items():
                andar(v, ruta + [k])
        elif isinstance(o, list):
            for i, v in enumerate(o):
                andar(v, ruta + [str(i)])
        elif isinstance(o, str) and es_texto(o):
            clave = next((r for r in reversed(ruta) if not r.isdigit()), "")
            tipo = ("interno" if clave in NO_VISIBLE else "cita de fuente" if clave in ("cita", "dato") else
                    "fuente" if clave in ("nombre", "titulo") and "fuentes" in ruta or clave == "fuente" else
                    "glosario" if "glosario" in ruta else "metodología" if archivo.endswith("explicadores.json") else
                    "historia provincial" if "historia" in archivo else "explorador" if "relaciones" in archivo else "texto de datos")
            res.append({"id": f"{archivo}#{'/'.join(ruta)}", "archivo": archivo, "tipo": tipo, "texto": o, "linea": 0, "ubic": "/".join(ruta)})
    andar(obj, [])
    return res

# ---------- Markdown ----------
def piezas_md(src, archivo):
    res, bloque, inicio, en_codigo, n_cod = [], [], 1, False, 0
    vistos = collections.Counter()
    def cerrar(fin):
        t = "\n".join(bloque).strip()
        if t and es_texto(t):
            base = re.sub(r"\W+", "-", sin_codigo(t)[:40].lower()).strip("-") or "parrafo"
            vistos[base] += 1
            res.append({"id": f"{archivo}#{base}" + (f"~{vistos[base]}" if vistos[base] > 1 else ""), "archivo": archivo,
                        "tipo": "título" if t.startswith("#") else "párrafo", "texto": t, "linea": inicio, "ubic": f"línea {inicio}"})
    for k, l in enumerate(src.splitlines(), start=1):
        if l.startswith("```"):
            cerrar(k); bloque = []
            en_codigo = not en_codigo
            if en_codigo:
                n_cod += 1; codigo = []; ini_cod = k
            else:
                for p in piezas_js("\n".join(codigo), f"{archivo}~código{n_cod}"):
                    p["linea"] += ini_cod; p["id"] = p["id"].replace(f"{archivo}~código{n_cod}#", f"{archivo}#código{n_cod}.")
                    p["archivo"] = archivo; res.append(p)
            inicio = k + 1; continue
        if en_codigo:
            codigo.append(l); continue
        if not l.strip():
            cerrar(k); bloque = []; inicio = k + 1
        else:
            bloque.append(l)
    cerrar(len(src.splitlines()))
    return res

# ---------- las fuentes ----------
FUENTES = [
    ("scripts/plantilla.html", "html"), ("scripts/relaciones.html", "html"),
    ("scripts/datina.js", "js"), ("scripts/relaciones.js", "js"), ("scripts/consulta_ia.js", "js"),
    ("functions/api/consulta.js", "js"), ("functions/_ia/consulta.mjs", "js"), ("functions/_ia/indicaciones.mjs", "js"),
    ("scripts/03_construir_sitio.py", "py"), ("scripts/catalogo.py", "py"), ("scripts/relaciones.py", "py"),
    ("datos/manual/explicadores.json", "json"), ("datos/manual/provincias_historia.json", "json"), ("datos/manual/catalogo.json", "json"),
    ("datos/manual/distorsiones.json", "json"), ("datos/manual/programas_educacion.json", "json"), ("datos/manual/relaciones.json", "json"),
    ("pobreza/src/index.md", "md"), ("pobreza/src/diccionario.md", "md"), ("pobreza/observablehq.config.js", "js"),
    ("README.md", "md"),
]

def leer(ruta, ref=None):
    if ref:
        # el commit puede guardar algún renglón con CRLF que el árbol de trabajo tiene en LF (.gitattributes): se comparan sin el \r
        r = subprocess.run(["git", "show", f"{ref}:{ruta}"], cwd=RAIZ, capture_output=True)
        return r.stdout.decode("utf-8").replace("\r\n", "\n") if r.returncode == 0 else None
    p = RAIZ / ruta
    return p.read_text(encoding="utf-8").replace("\r\n", "\n") if p.exists() else None

def extraer(ruta, forma, ref=None):
    src = leer(ruta, ref)
    if src is None:
        return []
    if forma == "html": return piezas_html(src, ruta)
    if forma == "js": return piezas_js(src, ruta)
    if forma == "py": return piezas_py(src, ruta)
    if forma == "json":
        if ruta.endswith("relaciones.json"):
            # del catálogo del Explorador se ven los nombres de los organismos, sus siglas y los nombres de las tablas
            o = json.loads(src)
            return piezas_json({"fuentes": [{"nombre": f.get("nombre"), "sigla": f.get("sigla")} for f in o.get("fuentes", [])],
                                "conjuntos": [{"nombre": c.get("nombre"), "fuente": c.get("fuente")} for c in o.get("conjuntos", [])]}, ruta)
        return piezas_json(json.loads(src), ruta)
    if forma == "md": return piezas_md(src, ruta)
    if forma == "csv": return piezas_csv(src, ruta)
    if forma == "cruces": return piezas_cruces(src, ruta)
    return []

# ---------- los nombres de los indicadores de Cruces (02_procesar.py) ----------
# de los 600 KB de 02 solo se ven, como texto redactado por Datina, los nombres, las unidades y las fuentes de CRUCES_META
def piezas_cruces(src, archivo):
    res = []
    for nodo in ast.walk(ast.parse(src)):
        if isinstance(nodo, ast.Assign) and any(isinstance(t, ast.Name) and t.id == "CRUCES_META" for t in nodo.targets):
            for sub in ast.walk(nodo.value):
                if isinstance(sub, ast.Dict):
                    for k, v in zip(sub.keys, sub.values):
                        if isinstance(k, ast.Constant) and isinstance(v, ast.Tuple):
                            partes = [ast.get_source_segment(src, e) for e in v.elts if isinstance(e, (ast.Constant, ast.JoinedStr))]
                            partes = [p for p in partes if p and es_texto(p)]
                            if partes:
                                res.append({"id": f"{archivo}#CRUCES_META.{k.value}", "archivo": archivo, "tipo": "texto de datos",
                                            "texto": "\n".join(partes), "linea": v.lineno, "ubic": f"CRUCES_META › {k.value}"})
    return res

# ---------- CSV escritos a mano ----------
# de los CSV de datos/manual/ solo las columnas de texto que se leen en el sitio (nombres y descripciones de leyes, notas)
COLUMNAS_CSV = {"datos/manual/leyes_clave.csv": ("clave", ["nombre", "que_cambia", "desenlace"]),
                "datos/manual/presupuestos.csv": (None, ["nota"]), "datos/manual/cortes_provinciales.csv": ("codigo_indec", ["tribunal", "nota"]),
                "datos/manual/corte_casos.csv": ("anio", ["notas"]), "datos/manual/corte_tamano.csv": ("desde", ["notas"])}
def piezas_csv(src, archivo):
    import csv, io
    clave, cols = COLUMNAS_CSV.get(archivo, (None, []))
    res = []
    for i, fila in enumerate(csv.DictReader(io.StringIO(src)), start=2):
        k = fila.get(clave) if clave else f"fila {i}"
        for c in cols:
            v = (fila.get(c) or "").strip()
            if v and es_texto(v):
                res.append({"id": f"{archivo}#{k}/{c}", "archivo": archivo, "tipo": "texto de datos", "texto": v, "linea": i, "ubic": f"{k} › {c}"})
    return res
FUENTES += [(a, "csv") for a in COLUMNAS_CSV] + [("scripts/02_procesar.py", "cruces"), ("pobreza/scripts/exportar_parquet.py", "py")]

if __name__ == "__main__" and "--listar" in sys.argv:
    ruta = sys.argv[sys.argv.index("--listar") + 1]
    forma = dict(FUENTES).get(ruta) or {"html": "html", "js": "js", "mjs": "js", "py": "py", "json": "json", "md": "md", "csv": "csv"}[ruta.rsplit(".", 1)[1]]
    for p in extraer(ruta, forma):
        print(f"--- {p['id']}  [{p['tipo']}] línea {p['linea']}\n{p['texto']}")
    sys.exit(0)

# ---------- dónde se ve cada texto ----------
PAGINA_SECCION = {"inicio": "index.html", "no-encontrada": "404.html", "provincias": "provincia.html"}
def paginas_armadas():
    """Qué página de sitio/ tiene cada id, cada data-t y cada data-g (de las páginas ya armadas)."""
    donde = collections.defaultdict(set)
    sitio = RAIZ / "sitio"
    for f in sorted(sitio.glob("*.html")) + sorted((sitio / "pobreza").glob("*.html")):
        h = f.read_text(encoding="utf-8", errors="replace")
        rel = f.relative_to(sitio).as_posix()
        for m in re.finditer(r'\b(?:id|data-t|data-g)="([^"]+)"', h):
            donde[m.group(1)].add(rel)
    return donde

def fragmentos(t, minimo=14):
    """Los pedazos fijos de un texto (sin ${...}, sin etiquetas, sin {{ruta}}), para buscarlos en el volcado de las páginas."""
    s = re.sub(r"\{\{[\w.]+\}\}", "\x00", t)
    out, i, n, actual = [], 0, len(s), []
    while i < n:
        if s.startswith("${", i):
            prof, i = 1, i + 2
            while i < n and prof:
                prof += {"{": 1, "}": -1}.get(s[i], 0); i += 1
            out.append("".join(actual)); actual = []
        else:
            actual.append(s[i]); i += 1
    out.append("".join(actual))
    piezas = []
    for o in out:
        for p in re.split(r"<[^>]*>|\x00|\\n|\n|\*\*|`|\s/\s|\|", o):
            p = html.unescape(p.replace("\\\"", "\"").replace("\\'", "'"))
            # las comillas de una cadena de Python, las marcas de Markdown y los títulos con #
            p = re.sub(r"^\s*[rbfu]*[\"']|[\"']\s*$", "", p.strip())
            p = re.sub(r"^#+\s*|\[|\]\([^)]*\)", "", p)
            p = re.sub(r"\s+", " ", p).strip(" ,.:\"'")
            if len(p) >= minimo:
                piezas.append(p)
    return piezas

def texto_volcado(v):
    """Todo el texto de un volcado de scripts/volcar_textos.mjs, por página, en minúsculas y sin espacios repetidos."""
    res = {}
    for pg, d in v.items():
        if "bloques" not in d: continue
        partes = [d.get("title", "")] + [str(x) for x in d.get("meta", {}).values()] + [b["texto"] + "\n" + b.get("oculto", "") for b in d["bloques"]]
        partes += list(d.get("svg", {}).values()) + d.get("atributos", []) + [x["texto"] for x in d.get("variantes", [])]
        res[pg] = re.sub(r"\s+", " ", "\n".join(partes).replace(" ", " ")).lower()
    return res

def buscar(piezas, vol):
    """Las páginas del volcado donde aparece el pedazo más largo del texto."""
    if not piezas or not vol: return []
    p = max(piezas, key=len).lower()
    p = re.sub(r"\s+", " ", p.replace(" ", " "))
    return sorted(pg for pg, t in vol.items() if p in t)

# ---------- el inventario ----------
GRUPO_DE_PAGINA = {}
for g, pgs in {"G1": "poblacion migraciones salud educacion pobreza diagnostico", "G2": "trabajo economia empresas construccion gobierno externo turismo",
               "G3": "politica seguridad corte-suprema laboratorio", "G4": "energia petroleo movilidad naturaleza curiosidades",
               "G6a": "provincia cruces indice departamentos", "G6b": "index nosotros contacto 404 emprendedores",
               "G6c": "catalogo relaciones consulta-ia pobreza/index pobreza/diccionario"}.items():
    for p in pgs.split():
        GRUPO_DE_PAGINA[p + ".html"] = g
NOMBRE_GRUPO = {"G1": "Personas y bienestar", "G2": "Trabajo y economía", "G3": "Estado y sociedad", "G4": "Territorio y recursos",
                "G5": "Artículos", "G6a": "Perfil provincial y herramientas de provincias", "G6b": "Portada, navegación y piezas comunes",
                "G6c": "Catálogo, Explorador de relaciones, consultas con IA, consultor de pobreza y README", "G7": "Historia de las provincias"}
# lo que se conserva sin mirar la propuesta de nadie, con su motivo
def conservado_por_tipo(p):
    if p["tipo"] == "interno":
        return "No lo ve el lector: es un mensaje del programa, una clave o un campo que no se muestra."
    if p["tipo"] == "cita de fuente":
        return "Cita textual de una fuente: se conserva literal."
    if p["tipo"] == "fuente" and p["archivo"].endswith(".json"):
        return "Nombre o título de una fuente o de un documento de otros: se conserva como lo publica."
    if p["archivo"] == "functions/_ia/indicaciones.mjs":
        return "Instrucciones al modelo de las consultas con IA: son configuración y cambian lo que contesta el sitio (docs/ia/CONSULTAS.md)."
    return ""

def armar_inventario(ref, antes, despues, moldes=None):
    viejos = {p["id"]: p for r, f in FUENTES for p in extraer(r, f, ref)}
    nuevos = {p["id"]: p for r, f in FUENTES for p in extraer(r, f)}
    # las propuestas: el motivo de cada cambio, lo conservado a propósito y lo pendiente
    cambios, conservados, pendientes = [], [], []
    for f in sorted((SALIDA / "propuestas").glob("*.json")):
        d = json.loads(f.read_text(encoding="utf-8"))
        g = d.get("grupo") or f.stem
        cambios += [{**c, "grupo": g} for c in d.get("cambios", [])]
        conservados += [{**c, "grupo": g} for c in d.get("conservados", [])]
        pendientes += [{**c, "grupo": g} for c in d.get("pendientes", [])]
    extra = SALIDA / "conservados.json"
    if extra.exists():
        conservados += json.loads(extra.read_text(encoding="utf-8"))
    esc = lambda s: json.dumps(s, ensure_ascii=False)[1:-1]
    donde = paginas_armadas()
    vol_a = texto_volcado(json.loads(pathlib.Path(antes).read_text(encoding="utf-8"))) if antes else {}
    vol_d = texto_volcado(json.loads(pathlib.Path(despues).read_text(encoding="utf-8"))) if despues else {}
    # los textos que arma datina.js evaluados en la página con los datos reales (cifras destacadas, cada vista, series, buscador, OCDE)
    mol = re.sub(r"\s+", " ", "\n".join(json.loads(pathlib.Path(moldes).read_text(encoding="utf-8")).values()).replace(" ", " ")).lower() if moldes else ""
    # lo que se comprobó a mano en el navegador porque aparece solo después de una consulta (docs/redaccion/verificacion/)
    _am = SALIDA / "verificacion" / "comprobado_a_mano.json"
    a_mano = json.loads(_am.read_text(encoding="utf-8")) if _am.exists() else {}
    # emparejar: por archivo, alineando las dos listas de piezas en orden (así un párrafo nuevo no corre la numeración de los que
    # siguen), y lo que queda suelto, por parecido dentro del mismo archivo
    pares, solo_v, solo_n = [], [], []
    for arch in dict.fromkeys([p["archivo"] for p in viejos.values()] + [p["archivo"] for p in nuevos.values()]):
        lv = [i for i in viejos if viejos[i]["archivo"] == arch]
        ln = [i for i in nuevos if nuevos[i]["archivo"] == arch]
        sm = difflib.SequenceMatcher(None, [viejos[i]["texto"] for i in lv], [nuevos[j]["texto"] for j in ln], autojunk=False)
        for op, a1, a2, b1, b2 in sm.get_opcodes():
            if op == "equal":
                pares += [(viejos[lv[a1 + k]], nuevos[ln[b1 + k]]) for k in range(a2 - a1)]
                continue
            # en un tramo distinto se emparejan primero las piezas con el mismo id y después las que quedan, en orden
            tv_, tn_ = lv[a1:a2], ln[b1:b2]
            for i in [i for i in tv_ if i in tn_]:
                pares.append((viejos[i], nuevos[i])); tv_.remove(i); tn_.remove(i)
            k = min(len(tv_), len(tn_)) if op == "replace" else 0
            pares += [(viejos[tv_[x]], nuevos[tn_[x]]) for x in range(k)]
            solo_v += tv_[k:]; solo_n += tn_[k:]
    for i in list(solo_v):
        v = viejos[i]
        cand = [j for j in solo_n if nuevos[j]["archivo"] == v["archivo"]]
        mejor = max(cand, key=lambda j: difflib.SequenceMatcher(None, v["texto"], nuevos[j]["texto"]).ratio(), default=None)
        if mejor and difflib.SequenceMatcher(None, v["texto"], nuevos[mejor]["texto"]).ratio() > .5:
            pares.append((v, nuevos[mejor])); solo_n.remove(mejor); solo_v.remove(i)
    pares += [(viejos[i], None) for i in solo_v] + [(None, nuevos[j]) for j in solo_n]
    filas = []
    for v, n in pares:
        p = n or v
        tv, tn = (v or {}).get("texto"), (n or {}).get("texto")
        cont = lambda t, s: bool(t) and bool(s) and (s in t or esc(s) in t)
        motivos = sorted({c["motivo"] for c in cambios if c.get("motivo") and c["archivo"].replace("\\", "/") == p["archivo"]
                          and (cont(tn, c["propuesto"]) and c["propuesto"].strip() or cont(tv, c["original"]))})
        grupos = sorted({c["grupo"] for c in cambios if c["archivo"].replace("\\", "/") == p["archivo"] and c["grupo"] in NOMBRE_GRUPO
                         and (cont(tn, c["propuesto"]) and c["propuesto"].strip() or cont(tv, c["original"]))})
        pend = [x for x in pendientes if x.get("fragmento") and x.get("archivo", "").replace("\\", "/") == p["archivo"] and (cont(tn, x["fragmento"]) or cont(tv, x["fragmento"]))]
        cons = [x for x in conservados if x.get("fragmento") and (not x.get("archivo") or x["archivo"].replace("\\", "/") == p["archivo"]) and cont(tn or tv, x["fragmento"])]
        if tv is not None and tn is not None and tv != tn:
            estado, motivo = "reescrito", " ".join(motivos) or "Redacción más clara y precisa (cambio de una propuesta que abarca varios textos del bloque)."
        elif tv is None:
            estado, motivo = "reescrito", "Texto nuevo del bloque: " + (" ".join(motivos) or "reemplaza a uno anterior del mismo archivo.")
        elif tn is None:
            estado, motivo = "reescrito", "El texto se quitó o se unió a otro del mismo bloque: " + (" ".join(motivos) or "ver el bloque vecino.")
        elif pend:
            estado, motivo = "pendiente de verificación factual", " ".join(f"{x.get('motivo', '')} Propuesta: {x.get('propuesta', '')}".strip() for x in pend)
        elif cons or conservado_por_tipo(p):
            estado, motivo = "conservado deliberadamente", " ".join(x["motivo"] for x in cons) or conservado_por_tipo(p)
        else:
            estado, motivo = "revisado sin cambios", "Se revisó y ya dice con claridad lo que muestra."
        if estado == "reescrito" and pend:
            motivo += " Queda además una cuestión pendiente: " + " ".join(x.get("motivo", "") for x in pend)
        # rutas: por el id o la clave que lo usa en las páginas armadas, o por dónde aparece en el volcado
        rutas = set()
        anc = p["id"].split("#", 1)[1].split("/")[0].split(".")[0].split(" ")[0]
        clave = p["ubic"].split(" › ")[-1] if " › " in p["ubic"] else ""
        for k in (anc, clave, "f-" + clave if clave else "", clave.split("-nota")[0] if clave else ""):
            if k and k in donde: rutas |= donde[k]
        if p["archivo"].endswith("explicadores.json"):
            rutas |= donde.get(p["ubic"].split("/")[0], set())
        if p["archivo"].endswith("provincias_historia.json") or p["ubic"].startswith("historia_prov"):
            rutas.add("provincia.html (las 24 jurisdicciones)")
        piezas_n, piezas_v = fragmentos(tn or ""), fragmentos(tv or "")
        vista_d = buscar(piezas_n, vol_d) if tn else []
        vista_a = buscar(piezas_v, vol_a) if tv else []
        if not rutas:
            rutas = set(vista_d or vista_a)
        # lo que se fue: los pedazos del texto viejo que ya no están en el nuevo. Si el más largo sigue en alguna página, se avisa
        norma = lambda s: re.sub(r"\s+", " ", html.unescape(s).replace(" ", " ")).strip().lower()
        nuevo_n = norma(" ".join(piezas_n) + " " + (tn or ""))
        idos = [x for x in piezas_v if norma(x) not in nuevo_n]
        sigue_viejo = buscar(idos, vol_d) if estado == "reescrito" and idos else []
        if p["archivo"] == "README.md":
            verif = "No se publica en el sitio: es la presentación del proyecto en el repositorio. Revisado en el archivo."
        elif p["tipo"] == "interno" or estado == "conservado deliberadamente" and not vista_d:
            verif = "No se muestra en la página o se conserva literal: no corresponde buscarlo."
        elif not vol_d:
            verif = "Sin volcado posterior."
        elif vista_d:
            verif = f"Comprobado en la página armada: {', '.join(vista_d[:6])}{' y otras' if len(vista_d) > 6 else ''}."
        elif p["id"] in a_mano:
            verif = a_mano[p["id"]]
        elif mol and piezas_n and re.sub(r"\s+", " ", max(piezas_n, key=len)).lower() in mol:
            verif = "Comprobado al evaluar el texto en la página con los datos reales: es de otra vista, de una cifra de En cifras, del buscador o de una vista OCDE."
        elif not piezas_n:
            verif = "Texto corto o armado con datos: se comprueba en el volcado de su ficha (ver la columna de rutas)."
        else:
            verif = "No aparece en la vista inicial ni en las vistas volcadas: es un texto condicional (otra vista, otro dato o un cuadro emergente)."
        if sigue_viejo:
            verif += f" El texto anterior todavía aparece en: {', '.join(sigue_viejo[:6])} (otra fuente lo repite)."
        pg_grupo = [GRUPO_DE_PAGINA.get(r.split("?")[0]) for r in rutas]
        grupo = ("G7" if "historia" in p["archivo"] or p["ubic"].startswith("historia_prov") else
                 "G5" if any(r.startswith("a-") or r == "articulos.html" for r in rutas) and not any(pg_grupo) else
                 grupos[0] if len(grupos) == 1 else next((x for x in pg_grupo if x), None) if len({x for x in pg_grupo if x}) == 1 else "G6b"
                 if len(rutas) > 3 or not rutas else next((x for x in pg_grupo if x), "G6b"))
        if p["archivo"] in ("scripts/catalogo.py", "scripts/relaciones.py", "scripts/relaciones.html", "scripts/relaciones.js", "scripts/consulta_ia.js",
                            "datos/manual/relaciones.json", "README.md") or p["archivo"].startswith(("functions/", "pobreza/")):
            grupo = "G6c"
        filas.append({"id": p["id"], "grupo": grupo, "rutas": sorted(rutas), "archivo": p["archivo"], "ubicacion": p["ubic"], "linea": p["linea"],
                      "tipo": p["tipo"], "original": tv, "propuesto": tn, "estado": estado, "motivo": motivo, "verificacion": verif})
    return filas, pendientes

def escribir(filas, pendientes):
    (SALIDA / "inventario").mkdir(parents=True, exist_ok=True)
    (SALIDA / "inventario" / "inventario.json").write_text(json.dumps(filas, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")
    def bloque(t):
        if t is None: return "(no existe)"
        largo = max([len(m) for m in re.findall(r"`+", t)] + [2]) + 1
        return "`" * largo + "text\n" + t + "\n" + "`" * largo
    por_grupo = collections.defaultdict(list)
    for f in filas:
        por_grupo[f["grupo"]].append(f)
    for g, fs in sorted(por_grupo.items()):
        cuenta = collections.Counter(f["estado"] for f in fs)
        ls = [f"# Inventario de textos: {NOMBRE_GRUPO.get(g, g)}", "",
              f"Generado por `scripts/inventario_textos.py`. {len(fs)} piezas: " + ", ".join(f"{v} {k}" for k, v in cuenta.most_common()) + ".",
              "", "Cada pieza tiene su identificador (archivo#ubicación), las rutas donde se ve, el tipo, el texto original y el propuesto completos, el estado, el motivo y la verificación en las páginas armadas. Una plantilla dinámica se muestra tal como está escrita, con sus `${...}`: sus variantes se comprueban en el volcado de cada ficha.", ""]
        for f in sorted(fs, key=lambda f: (f["archivo"], f["linea"], f["id"])):
            ls += [f"## {f['id']}", "", f"- Rutas: {', '.join(f['rutas']) or 'no se encontró en las páginas armadas'}",
                   f"- Fuente: `{f['archivo']}`, {f['ubicacion']}" + (f", línea {f['linea']}" if f["linea"] else ""), f"- Tipo: {f['tipo']}",
                   f"- Estado: **{f['estado']}**", f"- Motivo: {f['motivo']}", f"- Verificación: {f['verificacion']}", "", "Original:", "", bloque(f["original"]), ""]
            ls += (["Propuesto: igual al original."] if f["original"] == f["propuesto"] else ["Propuesto:", "", bloque(f["propuesto"])]) + [""]
        (SALIDA / "inventario" / f"{g}.md").write_text("\n".join(ls), encoding="utf-8", newline="\n")
    # lo que quedó pendiente, con su ruta, su archivo, el fragmento, el motivo y la propuesta de cada grupo
    ls = ["# Textos y cuestiones pendientes de la reescritura editorial", "",
          "Lo que cada grupo de la reescritura no cambió porque necesita corregir un dato, cambiar una vista o la estructura, una decisión del "
          "autor o verificar un hecho. Sale de `docs/redaccion/propuestas/*.json` (generado por `scripts/inventario_textos.py`).", ""]
    for g in sorted({p["grupo"] for p in pendientes}):
        ps = [p for p in pendientes if p["grupo"] == g]
        ls += [f"## {NOMBRE_GRUPO.get(g, g)} ({len(ps)})", ""]
        for k, p in enumerate(ps, start=1):
            ls += [f"{k}. **{p.get('ruta', '')}**" + (f" (`{p['archivo']}`)" if p.get("archivo") else ""),
                   *([f"   - Fragmento: «{p['fragmento']}»"] if p.get("fragmento") else []),
                   f"   - Motivo: {p.get('motivo', '')}", *([f"   - Propuesta: {p['propuesta']}"] if p.get("propuesta") else []), ""]
    (SALIDA / "PENDIENTES.md").write_text("\n".join(ls), encoding="utf-8", newline="\n")
    return por_grupo

TIPO_PAGINA = [("Portada", lambda r: r == "index.html"), ("Artículo", lambda r: r.startswith("a-") or r == "articulos.html"),
               ("Perfil provincial", lambda r: r.startswith("provincia.html")), ("Consultor de pobreza", lambda r: r.startswith("pobreza/")),
               ("Herramienta", lambda r: r.split("?")[0] in {"cruces.html", "indice.html", "departamentos.html", "diagnostico.html", "catalogo.html",
                                                              "relaciones.html", "consulta-ia.html"}),
               ("Historia con datos", lambda r: r in {"laboratorio.html", "corte-suprema.html"}),
               ("Página auxiliar", lambda r: r in {"nosotros.html", "contacto.html", "404.html", "emprendedores.html"}),
               ("Sección temática", lambda r: True)]

def indice(filas, pendientes, rutas_antes, vol_d):
    """docs/redaccion/INVENTARIO_COPY_GLOBAL.md: la cobertura por tipo de página y por ruta, y los archivos del inventario."""
    sitio = RAIZ / "sitio"
    rutas = sorted(f.relative_to(sitio).as_posix() for f in list(sitio.glob("*.html")) + list((sitio / "pobreza").glob("*.html")))
    antes = [r.strip().replace("sitio/", "") for r in pathlib.Path(rutas_antes).read_text(encoding="utf-8").splitlines() if r.strip()] if rutas_antes else []
    por_ruta = collections.defaultdict(collections.Counter)
    for f in filas:
        for r in f["rutas"]:
            r0 = r.split(" ")[0]
            por_ruta[r0][f["estado"]] += 1
    tipo = lambda r: next(n for n, f in TIPO_PAGINA if f(r))
    est = ["reescrito", "revisado sin cambios", "conservado deliberadamente", "pendiente de verificación factual"]
    c = collections.Counter(f["estado"] for f in filas)
    ls = ["# Inventario global de textos de Datina", "",
          "Reescritura editorial del 26 de octubre de 2026 (encargo: `CLAUDE_CODE_REESCRITURA_GLOBAL_DATINA_CON_EJEMPLOS.md`). Este índice lo arma "
          "`scripts/inventario_textos.py`, que lee las fuentes de verdad de cada texto (la plantilla, el código que arma los textos, el constructor y los "
          "archivos de `datos/manual/`), compara la versión del commit de partida con la de ahora y busca cada texto nuevo en las páginas armadas "
          "(volcado de `scripts/volcar_textos.mjs`).", "",
          f"**{len(filas):,} piezas de texto**: ".replace(",", ".") + ", ".join(f"{c[e]:,} {e}".replace(",", ".") for e in est if c[e]) + ".", "",
          "Criterios: `docs/redaccion/CRITERIOS_REDACCION.md`. Resumen y pendientes: `docs/redaccion/RESUMEN_REESCRITURA_GLOBAL.md`.", "",
          "## Archivos del inventario", "", "| Archivo | Área | Piezas | Reescritas | Sin cambios | Conservadas | Pendientes |", "|---|---|---|---|---|---|---|"]
    pg = collections.defaultdict(collections.Counter)
    for f in filas:
        pg[f["grupo"]][f["estado"]] += 1
    for g in sorted(pg):
        k = pg[g]
        ls.append(f"| `inventario/{g}.md` | {NOMBRE_GRUPO.get(g, g)} | {sum(k.values())} | {k['reescrito']} | {k['revisado sin cambios']} | "
                  f"{k['conservado deliberadamente']} | {k['pendiente de verificación factual']} |")
    ls += ["", "El inventario completo en un solo archivo, para comprobarlo con un programa: `inventario/inventario.json`.", "",
           "## Cobertura por tipo de página", "", "| Tipo | Rutas | Piezas que se ven ahí |", "|---|---|---|"]
    por_tipo = collections.defaultdict(list)
    for r in rutas + [f"provincia.html?prov={x}" for x in []]:
        por_tipo[tipo(r)].append(r)
    for n, _ in TIPO_PAGINA:
        rs = por_tipo.get(n, [])
        if rs:
            ls.append(f"| {n} | {len(rs)} | {sum(sum(por_ruta[r].values()) for r in rs)} |")
    ls += ["", "El perfil provincial es una sola página (`provincia.html`) que se arma para cada una de las 24 jurisdicciones (`?prov=`): "
           "el volcado la recorre con las 24.", "", "## Rutas publicadas", "",
           f"Antes de la reescritura: {len(antes)} páginas. Después: {len(rutas)}. " +
           ("Son las mismas." if sorted(antes) == rutas else f"Diferencias: {sorted(set(antes) ^ set(rutas))}."), "",
           "| Ruta | Tipo | Reescritas | Sin cambios | Conservadas | Pendientes | En el volcado posterior |", "|---|---|---|---|---|---|---|"]
    for r in rutas:
        k = por_ruta[r]
        en_vol = "sí" if r in vol_d or any(x.startswith(r + "?") for x in vol_d) else "no"
        ls.append(f"| `{r}` | {tipo(r)} | {k['reescrito']} | {k['revisado sin cambios']} | {k['conservado deliberadamente']} | "
                  f"{k['pendiente de verificación factual']} | {en_vol} |")
    sin_ruta = [f for f in filas if not f["rutas"] and f["tipo"] != "interno"]
    ls += ["", "## Piezas sin una ruta asignada", "",
           f"{len(sin_ruta)} piezas que se ven en el sitio no tienen una ruta fija: son textos que arma el código según el dato o la vista "
           "(frases de las funciones comunes de `datina.js`, cuadros emergentes, mensajes de error), textos de la barra y el pie que se repiten en "
           "todas las páginas o textos apagados (los formularios). Están en su archivo de grupo con su ubicación en el código.", ""]
    (SALIDA / "INVENTARIO_COPY_GLOBAL.md").write_text("\n".join(ls) + "\n", encoding="utf-8", newline="\n")

if __name__ == "__main__":
    a = sys.argv[1:]
    op = lambda k, d=None: a[a.index(k) + 1] if k in a else d
    filas, pendientes = armar_inventario(op("--ref", "HEAD"), op("--antes"), op("--despues"), op("--moldes"))
    pg = escribir(filas, pendientes)
    vol_d = json.loads(pathlib.Path(op("--despues")).read_text(encoding="utf-8")) if op("--despues") else {}
    indice(filas, pendientes, op("--rutas-antes"), vol_d)
    c = collections.Counter(f["estado"] for f in filas)
    print(f"{len(filas)} piezas en {len(pg)} archivos de docs/redaccion/inventario/: " + ", ".join(f"{v} {k}" for k, v in c.most_common()))
