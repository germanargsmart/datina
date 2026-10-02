"""
Paso 3. Arma las paginas.
Escribe sitio/datos/fichas.js (los datos de sitio/datos/fichas.json y el indice del sitio, compartidos por todas las paginas),
sitio/datina.css y sitio/datina.js (el diseño y el comportamiento, tambien compartidos)
y una pagina por seccion a partir de scripts/plantilla.html: sitio/index.html (portada) y sitio/{seccion}.html.
Cada pagina lleva solo el marcado de su seccion. Lo que necesita saber de las demas (titulos, fichas, en que pagina
esta cada ancla) lo lee del indice del sitio, que se arma aca desde la plantilla.
La explicacion de cada seccion (que se mide, desde cuando, como se calcula) sale de datos/manual/explicadores.json.
Tambien copia la tabla larga al sitio para que se pueda descargar
y el sitio de consultas de pobreza ya construido.
Uso: python scripts/03_construir_sitio.py
"""
import csv, hashlib, html, json, pathlib, re, shutil

RAIZ = pathlib.Path(__file__).resolve().parents[1]
SITIO = RAIZ / "sitio"
huella = lambda t: hashlib.sha1(t.encode("utf-8")).hexdigest()[:10]
e = lambda t: html.escape(str(t), quote=True)
texto = lambda h: re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", h))).strip()

plantilla = (RAIZ / "scripts" / "plantilla.html").read_text(encoding="utf-8")
ruta_exp = RAIZ / "datos" / "manual" / "explicadores.json"
EXP = json.loads(ruta_exp.read_text(encoding="utf-8")) if ruta_exp.exists() else {}


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
    """"Para entender los datos": una fila de botones de despliegue, uno por bloque y uno para el glosario. Cada botón abre su
    texto en el cuadro de abajo (lo maneja datina.js). Sin JavaScript se ven todos los textos, uno debajo del otro."""
    x = EXP.get(sec)
    if not x:
        return ""
    partes = [(b["titulo"], f'<h4>{e(b["titulo"])}</h4><p>{e(b["texto"])}</p>{fuentes(b.get("fuentes"))}') for b in x.get("bloques", [])]
    if x.get("glosario"):
        items = "".join(f'<div><dt>{e(g["termino"])}</dt><dd>{e(g["definicion"])}'
                        + (f' <a href="{e(g["fuente"]["url"])}" target="_blank" rel="noopener">{e(g["fuente"]["nombre"])}</a>' if g.get("fuente") else "")
                        + "</dd></div>" for g in x["glosario"])
        partes.append(("Glosario", f'<h4>Glosario</h4><dl class="glosario">{items}</dl>'))
    botones = "".join(f'<button type="button" class="despliegue" id="exp-{sec}-{i}-b" aria-expanded="false" aria-controls="exp-{sec}-{i}">'
                      f'<span>{e(t)}</span><span class="desp-signo" aria-hidden="true"></span></button>' for i, (t, _) in enumerate(partes))
    bloques = "".join(f'<section class="exp-bloque" id="exp-{sec}-{i}" role="region" aria-labelledby="exp-{sec}-{i}-b">{c}</section>'
                      for i, (_, c) in enumerate(partes))
    return (f'<div class="explicador"><h3>Para entender los datos</h3><div class="exp-botones">{botones}</div>'
            f'<div class="exp-panel">{bloques}</div></div>')


base = re.sub(r"<!--EXPLICADOR:(\w+)-->", lambda m: explicador(m.group(1)), plantilla)

# Banderas provinciales (las baja y achica scripts/banderas.py): van al sitio, y su autor y licencia a Sobre nosotros
DIR_BANDERAS = RAIZ / "datos" / "manual" / "banderas"
with open(DIR_BANDERAS / "fuentes.csv", encoding="utf-8") as f:
    BANDERAS = list(csv.DictReader(f))
NOMBRE_PROV = {f["codigo_indec"]: f["territorio"] for f in json.loads((SITIO / "datos" / "fichas.json").read_text(encoding="utf-8"))["datos"]["empleo_provincias"]}
(SITIO / "datos" / "banderas").mkdir(exist_ok=True)
for b in BANDERAS:
    shutil.copy(DIR_BANDERAS / f"{b['codigo_indec']}.png", SITIO / "datos" / "banderas" / f"{b['codigo_indec']}.png")
creditos = "".join(
    f'<li>{e(NOMBRE_PROV[b["codigo_indec"]])}: <a href="{e(b["pagina"])}" target="_blank" rel="noopener">{e(b["autor"] or "autor sin datos")}</a>, '
    f'{e(b["licencia"])}</li>' for b in sorted(BANDERAS, key=lambda b: NOMBRE_PROV[b["codigo_indec"]]))
assert "<!--BANDERAS-->" in base
base = base.replace("<!--BANDERAS-->",
    '<h3>Las banderas</h3><p>Las banderas de las provincias vienen de Wikimedia Commons, el archivo de imágenes libres de Wikipedia, '
    'y se muestran en miniatura, todas con el mismo tamaño y el mismo recorte.</p>'
    f'<details class="glosario creditos"><summary>Autores y licencias</summary><ul>{creditos}</ul></details>')

# ---------- índice del sitio ----------
# Bloques de primer nivel: la portada y cada sección hija de <main>. Se cuentan las <section> anidadas
# (los bloques de "Para entender los datos" y "Datos rápidos" van dentro de otras secciones).
def bloques(h):
    res, pila = [], []
    for m in re.finditer(r"<section\b([^>]*)>|</section>", h):
        if m.group(0) == "</section>":
            ini, atr = pila.pop()
            if not pila:
                clase = re.search(r'class="([^"]*)"', atr)
                ident = re.search(r'id="([^"]*)"', atr)
                res.append({"ini": ini, "fin": m.end(), "clases": clase.group(1).split() if clase else [], "id": ident.group(1) if ident else ""})
        else:
            pila.append((m.start(), m.group(1)))
    assert not pila, "la plantilla tiene una <section> sin cerrar"
    return res


# página a la que pertenece cada bloque
PAGINA_DE_BLOQUE = {"portada": "inicio", "preguntas": "inicio", "destacados": "inicio", "articulos-home": "inicio", "secciones": "inicio",
                    "provincias": "provincia", "nosotros": "nosotros", "contacto": "contacto", "no-encontrada": "404"}
BLOQUES = bloques(base)
for b in BLOQUES:
    b["pagina"] = b["id"] if "tema" in b["clases"] else next((PAGINA_DE_BLOQUE[c] for c in b["clases"] if c in PAGINA_DE_BLOQUE), None)
    assert b["pagina"], f"bloque sin página: {b['clases']} {b['id']}"
TEMAS = [b for b in BLOQUES if "tema" in b["clases"]]
NOTAS = re.findall(r'<article class="nota" id="(a-[\w-]+)" data-titulo="([^"]+)"', base)


def ubicar(pos):
    b = next((b for b in BLOQUES if b["ini"] <= pos < b["fin"]), None)
    return b and b["pagina"]


# En qué página está cada ancla (las de la barra y el pie están en todas). Los artículos son páginas propias.
UBIC = {}
for m in re.finditer(r'\sid="([^"]+)"', base):
    p = ubicar(m.start())
    if p:
        UBIC[m.group(1)] = p
for id_, _ in NOTAS:
    UBIC[id_] = id_

SECCIONES, FICHAS = [], []
for b in TEMAS:
    h = base[b["ini"]:b["fin"]]
    titulo = texto(re.search(r"<h2>(.*?)</h2>", h).group(1))
    intro = re.search(r'<div class="tema-intro">(.*?)</div>', h, re.S)
    preg = re.search(r'<p class="pregunta"(?: data-corta="([^"]*)")?>(.*?)</p>', h)
    ayuda = h.find('id="ayuda-suicidio"')
    n = 0
    for m in re.finditer(r'<article class="ficha([^"]*)" id="([^"]+)"[^>]*>(.*?)</article>', h, re.S):
        h3 = re.search(r"<h3([^>]*)>(.*?)</h3>", m.group(3), re.S)
        kt = re.search(r'data-t="([^"]+)"', h3.group(1)) if h3 else None
        kl = re.search(r'<p class="lead" data-t="([^"]+)"', m.group(3))
        explorador = "explorador" in m.group(1)
        n += not explorador
        # [id, sección, título fijo, clave del título calculado, clave del texto, explorador, después de las líneas de ayuda]
        FICHAS.append([m.group(2), b["id"], texto(h3.group(2)) if h3 else "", kt.group(1) if kt else "", kl.group(1) if kl else "",
                       int(explorador), int(0 <= ayuda < m.start())])
    # [id, título, pregunta, texto de entrada, herramienta, fichas, artículos, pregunta corta para la tarjeta de la portada]
    SECCIONES.append([b["id"], titulo, texto(preg.group(2)) if preg else "", texto(intro.group(1)) if intro else "",
                      int("herramienta" in b["clases"]), n, len(re.findall(r'<article class="nota"', h)),
                      html.unescape(preg.group(1)) if preg and preg.group(1) else ""])
INDICE = {"secciones": SECCIONES, "fichas": FICHAS, "articulos": [[i, html.unescape(t)] for i, t in NOTAS], "ubic": UBIC}

# ---------- datos ----------
# Las tablas mas pesadas, que usan pocas fichas, van en archivos aparte que el navegador baja solo al abrir esas fichas.
# fichas.js lleva la huella de cada una para que el navegador no use una version vieja.
DIFERIDAS = ["elecciones_presidenciales", "transferencias_provincias", "piramide_poblacion", "apoyo_gobierno_provincias"]
D = json.loads((SITIO / "datos" / "fichas.json").read_text(encoding="utf-8"))
D["diferidas"] = {}
for nombre in DIFERIDAS:
    t = json.dumps(D["datos"].pop(nombre), ensure_ascii=False, separators=(",", ":"))
    (SITIO / "datos" / f"{nombre}.json").write_text(t, encoding="utf-8")
    D["diferidas"][nombre] = huella(t)
D["indice"] = INDICE
datos = "window.DATINA=" + json.dumps(D, ensure_ascii=False, separators=(",", ":")) + ";\n"
(SITIO / "datos" / "fichas.js").write_text(datos, encoding="utf-8")

# Iconos isometricos propios (los genera scripts/iconos_isometricos.py en datos/manual/iconos_iso): trazo y tono de cada uno
DIR_ICONOS = RAIZ / "datos" / "manual" / "iconos_iso"
TONOS = json.loads((DIR_ICONOS / "tonos.json").read_text(encoding="utf-8"))
ICONOS = {n: {"t": tono, "d": re.sub(r"^<svg[^>]*>|</svg>\s*$", "", (DIR_ICONOS / f"{n}.svg").read_text(encoding="utf-8").strip())}
          for n, tono in TONOS.items()}

# Diseño y comportamiento: un solo archivo de cada uno para todas las paginas, que el navegador guarda despues de la primera visita
css = (RAIZ / "scripts" / "datina.css").read_text(encoding="utf-8")
js = (RAIZ / "scripts" / "datina.js").read_text(encoding="utf-8")
assert "/*ICONOS*/{}" in js
js = js.replace("/*ICONOS*/{}", json.dumps(ICONOS, ensure_ascii=False))
(SITIO / "datina.css").write_text(css, encoding="utf-8")
(SITIO / "datina.js").write_text(js, encoding="utf-8")

for marca, valor in {"__VERSION__": huella(datos), "__V_CSS__": huella(css), "__V_JS__": huella(js)}.items():
    assert marca in base, marca
    base = base.replace(marca, valor)
# las posiciones de los bloques cambian con el reemplazo de arriba: se vuelven a ubicar
BLOQUES = bloques(base)
for b in BLOQUES:
    b["pagina"] = b["id"] if "tema" in b["clases"] else next(PAGINA_DE_BLOQUE[c] for c in b["clases"] if c in PAGINA_DE_BLOQUE)

TITULO = "<title>Datina | Las 24 Argentinas en números</title>"
DESCR = re.search(r'<meta name="description" content="[^"]*">', base).group(0)
assert TITULO in base
url_pagina = lambda p: "./" if p == "inicio" else f"{p}.html"
TITULO_DE = {s[0]: s[1] for s in SECCIONES}


# Recorrido de "Anterior / Siguiente": artículos, tu provincia, las secciones y las herramientas, y Sobre nosotros
ORDEN = ["articulos", "provincia"] + [x[0] for x in SECCIONES if x[0] != "articulos"] + ["nosotros"]
TITULO_DE.update({"provincia": "Tu provincia", "nosotros": "Sobre nosotros", "contacto": "Contacto"})
FLECHA_ANT, FLECHA_SIG = '<span aria-hidden="true">\u2190</span> ', ' <span aria-hidden="true">\u2192</span>'
TIT_NOTA = {i: html.unescape(t) for i, t in NOTAS}


def pasos(ant, centro, sig):
    """Final de página: anterior, todas y siguiente en una sola pieza. Cada parte es (dirección, título)."""
    a = f'<a class="paso ant" href="{ant[0]}"><span class="paso-eb">{FLECHA_ANT}Anterior</span><b>{e(ant[1])}</b></a>'
    c = f'<a class="boton pasos-todas" href="{centro[0]}">{e(centro[1])}</a>'
    z = f'<a class="paso sig" href="{sig[0]}"><span class="paso-eb">Siguiente{FLECHA_SIG}</span><b>{e(sig[1])}</b></a>'
    return f'<nav class="pasos" aria-label="Otras páginas">{a}{c}{z}</nav>'


def migas(*partes, prov=True):
    """Migas: Datina, la sección y la provincia elegida (la completa datina.js). La última parte es la página actual."""
    li = ['<li><a href="./">Datina</a></li>'] + [f'<li><a href="{u}">{e(t)}</a></li>' for u, t in partes[:-1]]
    li.append(f'<li><span aria-current="page">{e(partes[-1][1])}</span></li>')
    if prov:
        li.append('<li class="migas-prov" hidden></li>')
    return f'<nav class="migas" aria-label="Ubicación"><ol>{"".join(li)}</ol></nav>'


def pildoras(seccion):
    return '<nav class="pildoras" aria-label="Secciones">' + "".join(
        f'<a href="{url_pagina(x[0])}"{" aria-current=" + chr(34) + "page" + chr(34) if x[0] == seccion else ""}>{e(x[1])}</a>' for x in SECCIONES) + "</nav>"


def navegacion(h, pagina):
    """Piezas que dependen de la página: la fila de secciones del celular, las migas y "Anterior / Siguiente"."""
    if pagina.startswith("a-"):
        nota = f'<article class="nota" id="{pagina}"'
        orden = [n[0] for n in NOTAS]
        i = orden.index(pagina)
        art = lambda j: (f"{orden[j % len(orden)]}.html", TIT_NOTA[orden[j % len(orden)]])
        h = h.replace(nota, pildoras("articulos") + migas(("articulos.html", "Artículos"), ("", TIT_NOTA[pagina]), prov=False) + nota, 1)
        fin = h.index("</article>", h.index(nota)) + len("</article>")
        return h[:fin] + pasos(art(i - 1), ("articulos.html", "Todos los artículos"), art(i + 1)) + h[fin:]
    ident = {"provincia": "provincias"}.get(pagina, pagina)
    b = next((b for b in bloques(h) if b["id"] == ident), None)
    if not b or pagina in ("inicio", "404"):
        return h
    blo = h[b["ini"]:b["fin"]]
    # migas arriba del título y fila de secciones (solo en el celular) arriba de todo
    blo = blo.replace("<h2", migas(("", TITULO_DE[pagina]), prov=pagina not in ("nosotros", "contacto")) + "<h2", 1)
    # transición entre páginas: el título viaja desde su tarjeta de la portada (mismo nombre en las dos páginas)
    if pagina in [x[0] for x in SECCIONES]:
        blo = re.sub(r"<h2>", f'<h2 style="view-transition-name:t-{pagina}">', blo, 1)
    if pagina in [x[0] for x in SECCIONES]:
        blo = re.sub(r"^(<section[^>]*>)", lambda m: m.group(1) + pildoras(pagina), blo)
    if pagina in ORDEN:
        i = ORDEN.index(pagina)
        vecino = lambda j: (url_pagina(ORDEN[j]), TITULO_DE[ORDEN[j]]) if 0 <= j < len(ORDEN) else ("./", "Portada")
        blo = blo[:-len("</section>")] + pasos(vecino(i - 1), ("./#secciones", "Todas las secciones"), vecino(i + 1)) + "</section>"
    return h[:b["ini"]] + blo + h[b["fin"]:]


# Mapa del sitio en el pie de todas las páginas
def lista(items):
    return "<ul>" + "".join(f'<li><a href="{u}">{e(t)}</a></li>' for u, t in items) + "</ul>"


MAPA = ('<div class="pie-col"><h2>Temas</h2>' + lista([("provincia.html", "Tu provincia")] + [(url_pagina(x[0]), x[1]) for x in SECCIONES if not x[4] and x[0] != "articulos"]) + "</div>"
        '<div class="pie-col"><h2>Herramientas</h2>' + lista([(url_pagina(x[0]), x[1]) for x in SECCIONES if x[4]] + [("articulos.html", "Artículos")]) +
        '<h2>Datina</h2>' + lista([("nosotros.html", "Sobre nosotros"), ("nosotros.html#como-se-hace", "Cómo se hace"),
                                   ("nosotros.html#fuentes", "Fuentes y método"), ("contacto.html", "Contacto")]) + "</div>")
assert "<!--MAPA-->" in base
base = base.replace("<!--MAPA-->", MAPA)
BLOQUES = bloques(base)
for b in BLOQUES:
    b["pagina"] = b["id"] if "tema" in b["clases"] else next(PAGINA_DE_BLOQUE[c] for c in b["clases"] if c in PAGINA_DE_BLOQUE)

# Formas de carga (etapa 6): mientras llegan los datos y el código, cada ficha muestra su silueta y cada gráfico reserva su alto.
# La forma de cada gráfico va en la plantilla (data-forma). Las tarjetas de "En cifras" y del perfil provincial las arma
# datina.js: aca se cuentan para dejar en su lugar la misma cantidad de tarjetas vacías
sin_forma = re.findall(r'<div class="grafico[^"]*" data-g="([\w-]+)"(?![^>]*data-forma)', base)
if sin_forma:
    print("Aviso: gráficos sin data-forma en la plantilla (se ven sin silueta mientras cargan):", ", ".join(sin_forma))
bloque_js = lambda ini, fin: js[js.index(ini):js.index(fin, js.index(ini))]
CON_CLAVE = set(re.findall(r'^\s+"(f-[\w-]+)":\s*\[', bloque_js("const CLAVE = {", "\n};"), re.M))
CON_PERFIL = re.findall(r'\{id:"(f-[\w-]+)"', bloque_js("const INDP = [", "\n];"))
tarjetas_vacias = lambda n, cls: "".join(f'<span class="tarjeta {cls}"></span>' for _ in range(n))


def siluetas(h, id_):
    """Barra clara desde el principio fuera de la portada, y tarjetas vacías donde datina.js pone "En cifras" y el perfil."""
    if id_ != "inicio":
        assert '<header class="barra">' in h
        h = h.replace('<header class="barra">', '<header class="barra clara">', 1)
    b = next((b for b in bloques(h) if b["id"] == id_ and "tema" in b["clases"] and "herramienta" not in b["clases"]), None)
    if b:
        blo = h[b["ini"]:b["fin"]]
        ids = set(re.findall(r'<article class="ficha[^"]*" id="(f-[\w-]+)"', blo))
        # la misma cuenta que pintarCifras() sin provincia elegida: una tarjeta por cifra destacada y una que invita a elegirla
        n = len(ids & CON_CLAVE) + (1 if ids & set(CON_PERFIL) else 0)
        if n >= 2:
            vacias = f'<div class="en-cifras esqueleto" aria-hidden="true"><h3>En cifras</h3><div class="cifras-grid">{tarjetas_vacias(n, "cifra")}</div></div>'
            blo = re.sub(r'(<div class="tema-intro">.*?</div>)', lambda m: m.group(1) + vacias, blo, 1, re.S)
            h = h[:b["ini"]] + blo + h[b["fin"]:]
    return h.replace('<div class="prov-grid" id="prov-grid"></div>',
                     f'<div class="prov-grid" id="prov-grid">{tarjetas_vacias(len(CON_PERFIL), "dp esqueleto")}</div>', 1)


def pagina(id_, titulo, descripcion, quedan, recorte=None):
    """Arma una pagina con los bloques de `quedan` (paginas del indice) y saca el resto del marcado.
    `recorte` saca partes de los bloques que quedan (por ejemplo, el indice de articulos en la pagina de un articulo)."""
    h = base
    for b in sorted(BLOQUES, key=lambda b: -b["ini"]):
        if b["pagina"] not in quedan:
            h = h[:b["ini"]] + h[b["fin"]:]
    if recorte:
        h = recorte(h)
    h = h.replace("<body>", f'<body data-pagina="{id_}">', 1)
    if id_ == "404":
        h = h.replace("<head>", '<head>\n<base href="/">\n<meta name="robots" content="noindex">', 1)
    if titulo:
        h = h.replace(TITULO, f"<title>{e(titulo)} | Datina</title>", 1)
        h = h.replace(DESCR, f'<meta name="description" content="{e(descripcion)}">', 1)
    # los enlaces a una ficha de otra pagina (cierres de seccion, perfil provincial) llevan a esa pagina
    def destino(m):
        id2 = m.group(1)
        p = UBIC.get(id2)
        if not p or p == id_:
            return m.group(0)
        return f'href="{url_pagina(p)}{"" if p == id2 else "#" + id2}"'
    h = re.sub(r'href="#([\w-]+)"', destino, h)
    h = navegacion(h, id_)
    h = siluetas(h, id_)
    (SITIO / ("index.html" if id_ == "inicio" else f"{id_}.html")).write_text(h, encoding="utf-8")
    return h


# Portada: la grilla que lleva a cada seccion
pagina("inicio", None, None, {"inicio"})
# Tu provincia: el perfil de la provincia elegida, en su propia pagina (se entra desde el primer destacado)
pagina("provincia", "Tu provincia",
       "Cada provincia comparada con el total del país en todos los indicadores con dato provincial, su posición entre las 24 y las provincias que más se le parecen.",
       {"provincia"})
# Sobre nosotros: proposito, principios y forma de trabajo de Datina
pagina("nosotros", "Sobre nosotros",
       "Qué es Datina, para qué existe, de dónde salen sus datos y cómo se hace. Estadísticas públicas de las 24 jurisdicciones de la Argentina.",
       {"nosotros"})
# Contacto: formulario del proyecto (se activa al publicar en Netlify)
pagina("contacto", "Contacto", "Para avisar de un error en un dato, sugerir una fuente o una pregunta, o contar cómo usás Datina.", {"contacto"})
# Página para las direcciones que no existen
pagina("404", "Página no encontrada", "Esta página no existe.", {"404"})
sin_notas = lambda h: re.sub(r'\s*<div class="notas">.*?</div>', "", h, 1, re.S)
for id_, titulo, preg, *_ in SECCIONES:
    descr = f"{titulo}: {preg} Datos por provincia con su fuente, su año y la tabla para descargar." if preg else f"{titulo} en Datina."
    pagina(id_, titulo, descr, {id_}, sin_notas if id_ == "articulos" else None)


# Una pagina por articulo (a-....html): solo esa nota, sin el indice de articulos
def solo_nota(id_):
    def recorte(h):
        b = next(b for b in bloques(h) if b["id"] == "articulos")
        s = h[b["ini"]:b["fin"]]
        s = re.sub(r"\s*<h2>.*?</h2>", "", s, 1)
        s = re.sub(r'\s*<div class="tema-intro">.*?</div>', "", s, 1, re.S)
        s = re.sub(r'\s*<div class="art-grid" id="art-grid"></div>', "", s, 1)
        s = re.sub(r'\s*<article class="nota" id="(a-[\w-]+)"[^>]*></article>', lambda m: m.group(0) if m.group(1) == id_ else "", s)
        return h[:b["ini"]] + s + h[b["fin"]:]
    return recorte


for id_, titulo in NOTAS:
    descr = f"{html.unescape(titulo)} Un cruce de datos oficiales de las 24 jurisdicciones, con sus fuentes y sus límites."
    pagina(id_, html.unescape(titulo), descr, {"articulos"}, solo_nota(id_))

# Paginas que cambiaron de nombre: la direccion vieja lleva a la nueva, con la ficha y la provincia del enlace
REDIRECCIONES = {"emprendedores": "empresas"}
for viejo, nuevo in REDIRECCIONES.items():
    (SITIO / f"{viejo}.html").write_text(
        f'<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Datina</title>'
        f'<meta name="robots" content="noindex"><link rel="canonical" href="{nuevo}.html">'
        f'<script>location.replace("{nuevo}.html" + location.search + location.hash)</script>'
        f'<noscript><meta http-equiv="refresh" content="0; url={nuevo}.html"></noscript></head>'
        f'<body><p><a href="{nuevo}.html">Esta página se mudó</a></p></body></html>\n', encoding="utf-8")

shutil.copy(RAIZ / "datos" / "ordenado" / "tabla_larga.csv", SITIO / "datos" / "tabla_larga.csv")
# Sitio de consultas de pobreza (Observable Framework). Se construye aparte con "npm run build" dentro de pobreza/
# y aca solo se copia el resultado a sitio/pobreza/ para publicarlo junto con Datina.
dist = RAIZ / "pobreza" / "dist"
if dist.exists():
    shutil.rmtree(SITIO / "pobreza", ignore_errors=True)
    shutil.copytree(dist, SITIO / "pobreza")
print(f"Listo: sitio/index.html, {len(SECCIONES)} paginas de seccion y {len(NOTAS)} articulos" + (" y sitio/pobreza/" if dist.exists() else ""))
