"""
Paso 3. Arma las paginas.
Escribe sitio/datos/fichas.js (los datos de sitio/datos/fichas.json, compartidos por todas las paginas)
y una pagina por seccion a partir de scripts/plantilla.html: sitio/index.html (portada) y sitio/{seccion}.html.
Todas las paginas llevan el mismo marcado y cada una oculta las secciones ajenas.
La explicacion de cada seccion (que se mide, desde cuando, como se calcula) sale de datos/manual/explicadores.json.
Tambien copia la tabla larga al sitio para que se pueda descargar
y el sitio de consultas de pobreza ya construido.
Uso: python scripts/03_construir_sitio.py
"""
import hashlib, html, json, pathlib, re, shutil

RAIZ = pathlib.Path(__file__).resolve().parents[1]
SITIO = RAIZ / "sitio"

datos = (SITIO / "datos" / "fichas.json").read_text(encoding="utf-8")
(SITIO / "datos" / "fichas.js").write_text("window.DATINA=" + datos + ";\n", encoding="utf-8")
version = hashlib.sha1(datos.encode("utf-8")).hexdigest()[:10]

plantilla = (RAIZ / "scripts" / "plantilla.html").read_text(encoding="utf-8").replace("__VERSION__", version)

ruta_exp = RAIZ / "datos" / "manual" / "explicadores.json"
EXP = json.loads(ruta_exp.read_text(encoding="utf-8")) if ruta_exp.exists() else {}
e = lambda t: html.escape(str(t), quote=True)


def fuentes(lista):
    # una misma fuente puede respaldar varias frases de un bloque: se muestra una sola vez
    vistos, unicas = set(), []
    for f in lista or []:
        url = f["url"].split("#")[0]
        if url in vistos:
            continue
        vistos.add(url)
        unicas.append(f)
    enlaces = [f'<a href="{e(f["url"])}" target="_blank" rel="noopener">{e(f["nombre"])}</a>' for f in unicas]
    if not enlaces:
        return ""
    return f'<p class="exp-fuente">{"Fuente" if len(enlaces) == 1 else "Fuentes"}: {", ".join(enlaces)}</p>'


def explicador(sec):
    x = EXP.get(sec)
    if not x:
        return ""
    bloques = "".join(f'<section class="exp-bloque"><h4>{e(b["titulo"])}</h4><p>{e(b["texto"])}</p>{fuentes(b.get("fuentes"))}</section>'
                      for b in x.get("bloques", []))
    glos = ""
    if x.get("glosario"):
        items = "".join(f'<div><dt>{e(g["termino"])}</dt><dd>{e(g["definicion"])}'
                        + (f' <a href="{e(g["fuente"]["url"])}" target="_blank" rel="noopener">{e(g["fuente"]["nombre"])}</a>' if g.get("fuente") else "")
                        + "</dd></div>" for g in x["glosario"])
        glos = f'<details class="glosario"><summary>Glosario</summary><dl>{items}</dl></details>'
    return f'<div class="explicador"><h3>Para entender los datos</h3><div class="exp-grid">{bloques}</div>{glos}</div>'


base = re.sub(r"<!--EXPLICADOR:(\w+)-->", lambda m: explicador(m.group(1)), plantilla)

# Secciones en el orden en que aparecen, con su titulo y su pregunta de entrada
SECCIONES = []
for m in re.finditer(r'<section class="tema[^"]*" id="(\w+)">\s*<h2>([^<]+)</h2>(.*?)</section>', base, re.S):
    preg = re.search(r'<p class="pregunta">([^<]+)</p>', m.group(3))
    SECCIONES.append((m.group(1), html.unescape(m.group(2)), html.unescape(preg.group(1)) if preg else ""))

TITULO = "<title>Datina | Las 24 Argentinas en números</title>"
DESCR = re.search(r'<meta name="description" content="[^"]*">', base).group(0)
assert TITULO in base


def pagina(id_, titulo, descripcion, estilo):
    h = base.replace("<body>", f'<body data-pagina="{id_}">', 1)
    if titulo:
        h = h.replace(TITULO, f"<title>{e(titulo)} | Datina</title>", 1)
        h = h.replace(DESCR, f'<meta name="description" content="{e(descripcion)}">', 1)
    return h.replace("</head>", f'<style id="pagina">{estilo}</style>\n</head>', 1)


# Portada: sin secciones, con la grilla que lleva a cada una
(SITIO / "index.html").write_text(pagina("inicio", None, None, ".tema{display:none}"), encoding="utf-8")
for id_, titulo, preg in SECCIONES:
    estilo = f".portada,.preguntas,.provincias,.secciones,.tema:not(#{id_}){{display:none}}"
    descr = f"{titulo}: {preg} Datos por provincia con su fuente, su año y la tabla para descargar." if preg else f"{titulo} en Datina."
    (SITIO / f"{id_}.html").write_text(pagina(id_, titulo, descr, estilo), encoding="utf-8")

shutil.copy(RAIZ / "datos" / "ordenado" / "tabla_larga.csv", SITIO / "datos" / "tabla_larga.csv")
# Sitio de consultas de pobreza (Observable Framework). Se construye aparte con "npm run build" dentro de pobreza/
# y aca solo se copia el resultado a sitio/pobreza/ para publicarlo junto con Datina.
dist = RAIZ / "pobreza" / "dist"
if dist.exists():
    shutil.rmtree(SITIO / "pobreza", ignore_errors=True)
    shutil.copytree(dist, SITIO / "pobreza")
print(f"Listo: sitio/index.html y {len(SECCIONES)} paginas de seccion" + (" y sitio/pobreza/" if dist.exists() else ""))
