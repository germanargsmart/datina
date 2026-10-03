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
import csv, datetime, hashlib, html, json, math, pathlib, re, shutil, sys

RAIZ = pathlib.Path(__file__).resolve().parents[1]
# Antes de armar nada, las pruebas de los datos (scripts/pruebas_datos.py): si alguna falla, el sitio no se arma ni se publica
sys.path.insert(0, str(RAIZ / "scripts"))
import pruebas_datos  # noqa: E402
if pruebas_datos.correr(mostrar=False):
    pruebas_datos.correr(mostrar=True)
    sys.exit("Las pruebas de los datos encontraron problemas sin explicar: el sitio no se armó. Ver arriba.")
SITIO = RAIZ / "sitio"
huella = lambda t: hashlib.sha1(t.encode("utf-8")).hexdigest()[:10]
e = lambda t: html.escape(str(t), quote=True)
texto = lambda h: re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", h))).strip()

plantilla = (RAIZ / "scripts" / "plantilla.html").read_text(encoding="utf-8")

# Años recientes escritos a mano (etapa 17): con la actualización siguiente quedarían viejos. En la plantilla van como {{ruta}}
# (ver abajo) y en datina.js salen del resumen (R). Solo pueden quedar escritos los hechos fijos de FIJOS, reconocidos por el texto
# que los rodea. Un año reciente escrito a mano en otro lugar hace que el sitio no se arme.
# (la SUBE desde diciembre de 2024 y mayo de 2025, la encuesta que el INDEC reformula desde 2026, el cambio de fuente de los nacimientos
# y el nombre de las proyecciones de población del INDEC)
FIJOS = ["diciembre de 2024 el subte", "diciembre de 2024 parte de los viajes", "mayo de 2025 pagos con qr", "desde 2026 el indec reformula",
         "hasta octubre de 2026 el sitio", "2022 a 2040, base censo"]


def anios_a_mano(nombre, fuente):
    desde = datetime.date.today().year - 2
    malos, comentario = [], False
    for i, linea in enumerate(fuente.split("\n"), 1):
        s = linea
        # fuera de los comentarios: los de JavaScript (// y /* */) y los de HTML (<!-- -->)
        if comentario:
            fin = re.search(r"\*/|-->", s)
            if not fin:
                continue
            s, comentario = s[fin.end():], False
        s = re.sub(r"/\*.*?\*/|<!--.*?-->", " ", s)
        ini = re.search(r"/\*|<!--", s)
        if ini:
            s, comentario = s[:ini.start()], True
        s = re.sub(r"(^|\s)//.*$", "", s)
        for m in re.finditer(r"(?<![\w./-])(20\d\d)(?!\w)", s):
            if int(m.group(1)) < desde:
                continue
            cerca = s[max(0, m.start() - 60): m.end() + 60].lower()
            if not any(f in cerca for f in FIJOS):
                malos.append(f"{nombre}, línea {i}: ...{s[max(0, m.start() - 50): m.end() + 30].strip()}...")
    return malos


malos = anios_a_mano("plantilla.html", plantilla) + anios_a_mano("datina.js", (RAIZ / "scripts" / "datina.js").read_text(encoding="utf-8"))
if malos:
    sys.exit("Hay años recientes escritos a mano en los textos: quedarían viejos con la próxima actualización. Usar {{ruta}} en la "
             "plantilla o un dato de R en datina.js, o sumarlo a FIJOS si es un hecho fijo:\n" + "\n".join(malos))

# Años y otros datos en los textos fijos de la plantilla (etapa 17): {{ruta}} con una ruta del resumen de los datos, por ejemplo
# {{nacimientos.anio_ult}}. Se completan acá en cada actualización, así un título o una nota no quedan con el año viejo. Si la
# ruta no existe en el resumen, el sitio no se arma.
RESUMEN = json.loads((SITIO / "datos" / "fichas.json").read_text(encoding="utf-8"))["resumen"]


def dato_resumen(m):
    v = RESUMEN
    for parte in m.group(1).split("."):
        if not isinstance(v, dict) or parte not in v:
            sys.exit(f"La plantilla pide {{{{{m.group(1)}}}}}, que no está en el resumen de los datos (02_procesar.py): el sitio no se armó.")
        v = v[parte]
    return e(v)


plantilla = re.sub(r"\{\{([\w.]+)\}\}", dato_resumen, plantilla)
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
    """"Para entender los datos": una lista de botones de despliegue dentro de una tarjeta, uno por bloque y uno para el
    glosario. Cada botón abre su texto justo debajo (lo maneja datina.js), de a uno. Sin JavaScript se ven todos los textos."""
    x = EXP.get(sec)
    if not x:
        return ""
    partes = [(b["titulo"], f'<p>{e(b["texto"])}</p>{fuentes(b.get("fuentes"))}') for b in x.get("bloques", [])]
    if x.get("glosario"):
        items = "".join(f'<div><dt>{e(g["termino"])}</dt><dd>{e(g["definicion"])}'
                        + (f' <a href="{e(g["fuente"]["url"])}" target="_blank" rel="noopener">{e(g["fuente"]["nombre"])}</a>' if g.get("fuente") else "")
                        + "</dd></div>" for g in x["glosario"])
        partes.append(("Glosario", f'<dl class="glosario">{items}</dl>'))
    filas = "".join(
        f'<div class="exp-fila"><h4><button type="button" class="despliegue" id="exp-{sec}-{i}-b" aria-expanded="false" aria-controls="exp-{sec}-{i}">'
        f'<span>{e(t)}</span><span class="desp-signo" aria-hidden="true"></span></button></h4>'
        f'<div class="exp-bloque" id="exp-{sec}-{i}" role="region" aria-labelledby="exp-{sec}-{i}-b"><div class="exp-cont">{c}</div></div></div>'
        for i, (t, c) in enumerate(partes))
    return ('<div class="explicador"><div class="exp-cab"><h3 class="bloque-grupo">Para entender los datos</h3>'
            '<p>Qué se mide, cómo se calcula y de dónde sale cada dato de esta página.</p></div>'
            f'<div class="exp-lista">{filas}</div></div>')


# Programas con evaluación oficial (etapa 9, octubre de 2026): solo programas con una evaluación publicada por un organismo
# público, con lo que hacen, qué midió su evaluación y qué no permite concluir. Sin cifras y sin recomendar.
ruta_prog = RAIZ / "datos" / "manual" / "programas_educacion.json"
PROG = json.loads(ruta_prog.read_text(encoding="utf-8"))["programas"] if ruta_prog.exists() else []


def programas(sec):
    if sec != "educacion" or not PROG:
        return ""
    tarjetas = "".join(
        f'<article class="programa"><h4>{e(x["nombre"])}</h4><p class="programa-donde">{e(x["donde"])}</p><p>{e(x["que_hace"])}</p><dl>'
        f'<div><dt>Evaluación</dt><dd>{e(x["evaluacion"]["tipo"])}<small>{e(x["evaluacion"]["organismo"])}, {x["evaluacion"]["anio"]}</small></dd></div>'
        f'<div><dt>Qué encontró</dt><dd>{e(x["hallazgo"])}</dd></div><div><dt>Qué no permite concluir</dt><dd>{e(x["limites"])}</dd></div></dl>'
        f'<a class="enlace" href="{e(x["evaluacion"]["url"])}" target="_blank" rel="noopener">{e(x.get("enlace", "Leer la evaluación"))}</a></article>' for x in PROG)
    return ('<section class="programas" aria-labelledby="prog-tit"><h3 class="bloque-grupo" id="prog-tit">Programas con evaluación oficial</h3>'
            '<p class="programas-sub">Programas educativos que tienen una evaluación publicada por un organismo público. Para cada uno, qué hace, '
            'qué midió su evaluación y qué no permite concluir. No es una lista de recomendaciones: muchos programas no fueron evaluados '
            'o no publicaron su evaluación, y por eso no están.</p>'
            f'<div class="programas-grid">{tarjetas}</div></section>')


base = re.sub(r"<!--EXPLICADOR:(\w+)-->", lambda m: explicador(m.group(1)), plantilla)
base = re.sub(r"<!--PROGRAMAS:(\w+)-->", lambda m: programas(m.group(1)), base)

# Banderas provinciales (las baja y achica scripts/banderas.py): van al sitio, y su autor y licencia a Sobre nosotros
DIR_BANDERAS = RAIZ / "datos" / "manual" / "banderas"
with open(DIR_BANDERAS / "fuentes.csv", encoding="utf-8") as f:
    BANDERAS = list(csv.DictReader(f))
NOMBRE_PROV = {f["codigo_indec"]: f["territorio"] for f in json.loads((SITIO / "datos" / "fichas.json").read_text(encoding="utf-8"))["datos"]["empleo_provincias"]}
NOMBRE_PROV["00"] = "Argentina (Todo el país)"
(SITIO / "datos" / "banderas").mkdir(exist_ok=True)
for b in BANDERAS:
    shutil.copy(DIR_BANDERAS / f"{b['codigo_indec']}.png", SITIO / "datos" / "banderas" / f"{b['codigo_indec']}.png")
creditos = "".join(
    f'<li>{e(NOMBRE_PROV[b["codigo_indec"]])}: <a href="{e(b["pagina"])}" target="_blank" rel="noopener">{e(b["autor"] or "autor sin datos")}</a>, '
    f'{e(b["licencia"])}</li>' for b in sorted(BANDERAS, key=lambda b: NOMBRE_PROV[b["codigo_indec"]]))
assert "<!--BANDERAS-->" in base
base = base.replace("<!--BANDERAS-->",
    '<h3>Las banderas</h3><p>Las banderas de las provincias y la nacional vienen de Wikimedia Commons, el archivo de imágenes libres de Wikipedia, '
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
# artículos: id, título, ícono y sección (data-ico y data-sec en la plantilla)
NOTAS = re.findall(r'<article class="nota" id="(a-[\w-]+)" data-ico="([\w-]+)" data-sec="([\w-]+)" data-titulo="([^"]+)"', base)
assert NOTAS, "no se encontraron los artículos en la plantilla"


def ubicar(pos):
    b = next((b for b in BLOQUES if b["ini"] <= pos < b["fin"]), None)
    return b and b["pagina"]


# En qué página está cada ancla (las de la barra y el pie están en todas). Los artículos son páginas propias.
UBIC = {}
for m in re.finditer(r'\sid="([^"]+)"', base):
    p = ubicar(m.start())
    if p:
        UBIC[m.group(1)] = p
for id_, *_ in NOTAS:
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
# las cifras de la portada van escritas desde el principio (etapa 13): si las pusiera solo datina.js, la portada saltaría al llegar
_estado = '<p class="estado" id="estado"></p>'
assert base.count(_estado) == 1
base = base.replace(_estado, f'<p class="estado" id="estado"><span>{sum(1 for f in FICHAS if not f[5])} fichas</span> <span>24 jurisdicciones</span> '
                             f'<span>{len(NOTAS)} artículos</span></p>')
INDICE = {"secciones": SECCIONES, "fichas": FICHAS, "articulos": [[i, html.unescape(t), ico, sec] for i, ico, sec, t in NOTAS], "ubic": UBIC}

# ---------- datos ----------
# Las tablas mas pesadas, que usan pocas fichas, van en archivos aparte que el navegador baja solo al abrir esas fichas.
# fichas.js lleva la huella de cada una para que el navegador no use una version vieja.
DIFERIDAS = ["elecciones_presidenciales", "transferencias_provincias", "piramide_poblacion", "apoyo_gobierno_provincias", "aprender_departamentos",
             "hidrocarburos_mensual", "vivienda_departamentos", "isac_mensual", "costo_construccion",
             "empleo_construccion_serie"]
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
# ícono de cada página: la grilla de secciones de la portada (datina.js) y el final de página ("Seguí explorando")
SEC_ICONO = {"articulos": "periodico", "provincia": "pin", "trabajo": "maletin", "empresas": "tienda", "pobreza": "casa", "salud": "botiquin",
             "educacion": "birrete", "poblacion": "personas", "politica": "congreso", "movilidad": "colectivo", "construccion": "grua", "energia": "rayo", "petroleo": "ciguena", "turismo": "valija",
             "naturaleza": "andes", "curiosidades": "mate", "cruces": "dispersion", "indice": "podio", "departamentos": "mosaico",
             "diagnostico": "portapapeles"}
SEC_ICONO.update({i: ico for i, ico, _, _ in NOTAS})
assert set(SEC_ICONO.values()) <= set(ICONOS), set(SEC_ICONO.values()) - set(ICONOS)
for marca, valor in {"/*ICONOS*/{}": ICONOS, "/*SEC_ICONO*/{}": SEC_ICONO}.items():
    assert marca in js, marca
    js = js.replace(marca, json.dumps(valor, ensure_ascii=False))
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
TIT_NOTA = {i: html.unescape(t) for i, _, _, t in NOTAS}


def sol_svg():
    """El Sol de Mayo chico de los botones de entrada (el mismo que arma datina.js): ícono de la portada y de Sobre nosotros."""
    p = lambda a, r: f"{math.sin(a) * r:.1f} {-math.cos(a) * r:.1f}"
    rayos = "".join(f"M{p(i * math.pi / 8 - .12, 19)}L{p(i * math.pi / 8, 36 if i % 2 else 47)}L{p(i * math.pi / 8 + .12, 19)}Z" for i in range(16))
    return f'<svg class="sol-ir" viewBox="-50 -50 100 100" aria-hidden="true" focusable="false"><path d="{rayos}"/><circle r="21"/></svg>'


def icono_svg(n):
    if n == "sol":
        return sol_svg()
    return f'<svg class="iso tono-{ICONOS[n]["t"]}" viewBox="0 0 120 120" aria-hidden="true" focusable="false">{ICONOS[n]["d"]}</svg>'


def carta(pid, meta=None):
    """Una tarjeta de "Seguí explorando": (dirección, título, línea de abajo, ícono, nombre de la transición del título)."""
    if pid == "inicio":
        return ("./", "Portada", meta or "Inicio de Datina", "sol", "")
    if pid.startswith("a-"):
        return (f"{pid}.html", TIT_NOTA[pid], meta or "Artículo", SEC_ICONO[pid], f"t-{pid}")
    sec = next((x for x in SECCIONES if x[0] == pid), None)
    desc = {"provincia": "Perfil provincial", "nosotros": "Qué es Datina", "articulos": f"{len(NOTAS)} artículos"}.get(pid) or (
        "Herramienta" if sec and sec[4] else f"{sec[5]} fichas" if sec else "")
    return (url_pagina(pid), TITULO_DE[pid], meta or desc, SEC_ICONO.get(pid, "sol"), f"t-{pid}" if sec else "")


def pasos(ant, sig, relacionadas, todas):
    """Final de página ("Seguí explorando", como el de usafacts.org, pedido del autor el 2 de octubre de 2026): cuatro tarjetas
    con ícono, la anterior y la siguiente (con su flecha) y dos relacionadas, y el enlace a todas las secciones o artículos."""
    cartas = [carta(ant, FLECHA_ANT + "Anterior"), carta(sig, "Siguiente" + FLECHA_SIG)]
    cartas += [carta(r) for r in relacionadas]
    t = "".join(f'<a class="tarjeta explora" href="{u}"><span class="explora-ico">{icono_svg(ic)}</span><span class="explora-txt">'
                f'<b{f" style={chr(34)}view-transition-name:{vt}{chr(34)}" if vt else ""}>{e(tit)}</b><small>{meta}</small></span></a>'
                for u, tit, meta, ic, vt in cartas)
    return (f'<nav class="pasos" aria-labelledby="pasos-tit"><div class="pasos-cab"><h2 class="bloque-grupo" id="pasos-tit">Seguí explorando</h2>'
            f'<a class="enlace" href="{todas[0]}">{e(todas[1])}{FLECHA_SIG}</a></div><div class="pasos-grid">{t}</div></nav>')


def relacionadas(pagina, ya):
    """Las dos tarjetas que acompañan a la anterior y la siguiente: los artículos de la sección y, si faltan, tu provincia, Cruces y
    las páginas que siguen en el recorrido. Nunca la página actual ni una que ya está."""
    candidatas = [i for i, _, sec, _ in NOTAS if sec == pagina] + ["provincia", "cruces"]
    if pagina in ORDEN:
        i = ORDEN.index(pagina)
        candidatas += ORDEN[i + 2:] + ORDEN[:i]
    sale = []
    for c in candidatas:
        if c not in sale and c != pagina and c not in ya and c != "nosotros":
            sale.append(c)
    return sale[:2]


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
        art = lambda j: orden[j % len(orden)]
        h = h.replace(nota, pildoras("articulos") + migas(("articulos.html", "Artículos"), ("", TIT_NOTA[pagina]), prov=False) + nota, 1)
        fin = h.index("</article>", h.index(nota)) + len("</article>")
        sec = next(sec for a, _, sec, _ in NOTAS if a == pagina)
        return h[:fin] + pasos(art(i - 1), art(i + 1), [sec, "cruces"], ("articulos.html", "Todos los artículos")) + h[fin:]
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
        vecino = lambda j: ORDEN[j] if 0 <= j < len(ORDEN) else "inicio"
        ant, sig = vecino(i - 1), vecino(i + 1)
        blo = blo[:-len("</section>")] + pasos(ant, sig, relacionadas(pagina, {ant, sig}), ("./#secciones", "Todas las secciones")) + "</section>"
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
# secciones con "En cifras": cinco tarjetas en todas (etapa 15)
CON_CIFRAS = set(re.findall(r"^\s+(\w+):\s*\[", bloque_js("const EN_CIFRAS = {", "\n};"), re.M))
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
        n = 5 if id_ in CON_CIFRAS else 0
        if n:
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


for id_, _, _, titulo in NOTAS:
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
