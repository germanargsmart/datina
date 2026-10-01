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

# Iconos de Phosphor (duotono, licencia MIT) guardados en datos/manual/iconos: se insertan solo los trazos
ICONOS = {}
for f in sorted((RAIZ / "datos" / "manual" / "iconos").glob("*.svg")):
    svg = f.read_text(encoding="utf-8")
    ICONOS[f.stem] = re.sub(r"^<svg[^>]*>|</svg>\s*$", "", svg.strip())
assert "/*ICONOS*/{}" in plantilla
plantilla = plantilla.replace("/*ICONOS*/{}", json.dumps(ICONOS, ensure_ascii=False))

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
(SITIO / "index.html").write_text(pagina("inicio", None, None, ".tema,.provincias{display:none}"), encoding="utf-8")
# Tu provincia: el perfil de la provincia elegida, en su propia pagina (se entra desde el primer destacado)
(SITIO / "provincia.html").write_text(pagina("provincia", "Tu provincia",
    "Cada provincia comparada con el total del país en todos los indicadores con dato provincial, su posición entre las 24 y las provincias que más se le parecen.",
    ".portada,.preguntas,.secciones,.destacados,.articulos-home,.tema{display:none}"), encoding="utf-8")
for id_, titulo, preg in SECCIONES:
    estilo = f".portada,.preguntas,.provincias,.secciones,.destacados,.articulos-home,.tema:not(#{id_}){{display:none}}"
    if id_ == "articulos":
        estilo += "#articulos .notas{display:none}"
    descr = f"{titulo}: {preg} Datos por provincia con su fuente, su año y la tabla para descargar." if preg else f"{titulo} en Datina."
    (SITIO / f"{id_}.html").write_text(pagina(id_, titulo, descr, estilo), encoding="utf-8")

# Paginas que cambiaron de nombre: la direccion vieja lleva a la nueva, con la ficha y la provincia del enlace
REDIRECCIONES = {"emprendedores": "empresas"}
for viejo, nuevo in REDIRECCIONES.items():
    (SITIO / f"{viejo}.html").write_text(
        f'<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Datina</title>'
        f'<meta name="robots" content="noindex"><link rel="canonical" href="{nuevo}.html">'
        f'<script>location.replace("{nuevo}.html" + location.search + location.hash)</script>'
        f'<noscript><meta http-equiv="refresh" content="0; url={nuevo}.html"></noscript></head>'
        f'<body><p><a href="{nuevo}.html">Esta página se mudó</a></p></body></html>\n', encoding="utf-8")

# Una pagina por articulo (a-....html): solo esa nota, sin el indice de articulos
ARTICULOS = re.findall(r'<article class="nota" id="(a-[\w-]+)" data-titulo="([^"]+)"', base)
for id_, titulo in ARTICULOS:
    estilo = (".portada,.preguntas,.provincias,.secciones,.destacados,.articulos-home,.tema:not(#articulos),"
              f"#articulos>h2,#articulos>.tema-intro,#articulos>.art-grid,#articulos .nota:not(#{id_}){{display:none}}")
    descr = f"{html.unescape(titulo)} Un cruce de datos oficiales de las 24 jurisdicciones, con sus fuentes y sus límites."
    (SITIO / f"{id_}.html").write_text(pagina(id_, html.unescape(titulo), descr, estilo), encoding="utf-8")

shutil.copy(RAIZ / "datos" / "ordenado" / "tabla_larga.csv", SITIO / "datos" / "tabla_larga.csv")
# Sitio de consultas de pobreza (Observable Framework). Se construye aparte con "npm run build" dentro de pobreza/
# y aca solo se copia el resultado a sitio/pobreza/ para publicarlo junto con Datina.
dist = RAIZ / "pobreza" / "dist"
if dist.exists():
    shutil.rmtree(SITIO / "pobreza", ignore_errors=True)
    shutil.copytree(dist, SITIO / "pobreza")
print(f"Listo: sitio/index.html, {len(SECCIONES)} paginas de seccion y {len(ARTICULOS)} articulos" + (" y sitio/pobreza/" if dist.exists() else ""))
