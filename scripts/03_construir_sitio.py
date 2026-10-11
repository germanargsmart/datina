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
# Cada id una sola vez en la plantilla (etapa 25): una ficha nueva repitió el id de otra (f-actividad) y, como sus claves en datina.js salen
# del id, sus textos, su gráfico y su cifra pisaron los de la otra sin dar ningún error
_ids = re.findall(r'\sid="([^"]+)"', plantilla)
_rep = sorted({i for i in _ids if _ids.count(i) > 1})
assert not _rep, f"ids repetidos en la plantilla: {_rep}"

# Años recientes escritos a mano (etapa 17): con la actualización siguiente quedarían viejos. En la plantilla van como {{ruta}}
# (ver abajo) y en datina.js salen del resumen (R). Solo pueden quedar escritos los hechos fijos de FIJOS, reconocidos por el texto
# que los rodea. Un año reciente escrito a mano en otro lugar hace que el sitio no se arme.
# (la SUBE desde diciembre de 2024 y mayo de 2025, la encuesta que el INDEC reformula desde 2026, el cambio de fuente de los nacimientos,
# el nombre de las proyecciones de población del INDEC y los límites para comprar dólares que rigieron hasta abril de 2025)
FIJOS = ["diciembre de 2024 el subte", "diciembre de 2024 parte de los viajes", "mayo de 2025 pagos con qr", "desde 2026 el indec reformula",
         "hasta octubre de 2026 el sitio", "2022 a 2040, base censo", "septiembre de 2019 y abril de 2025",
         "enero de 2026 incluyen la venta", "internet archive de septiembre de 2024"]


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
# también la página del Explorador de relaciones, que no sale de la plantilla
malos += [m for n in ("relaciones.html", "relaciones.js") for m in anios_a_mano(n, (RAIZ / "scripts" / n).read_text(encoding="utf-8"))]
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

# Cada cuánto se actualiza el dato de cada ficha (etapa 27, pedido del autor, como USAFacts): una frase después de la fuente, en el pie, que
# está siempre a la vista. Es la frecuencia con la que el sitio recibe datos nuevos de la fuente. Toda ficha nueva necesita la suya, o el sitio
# no se arma. Las herramientas (fichas "explorador": Cruces, Tu índice, Departamentos y Diagnóstico) no llevan.
FRASE_FRECUENCIA = {
    "mes": "Se actualiza cada mes.", "trimestre": "Se actualiza cada tres meses.", "semestre": "Se actualiza cada seis meses.",
    "anio": "Se actualiza cada año.", "censo": "Se actualiza con cada censo.", "eleccion": "Se actualiza con cada elección.",
    "congreso": "Se actualiza con cada renovación del Congreso.", "aprender": "Se actualiza con cada evaluación Aprender.",
    "pisa": "Se actualiza con cada evaluación PISA.", "leyes": "Se actualiza cuando se suma una ley a la selección.",
    "presidente": "Se actualiza con cada cambio de presidente.", "gabinete": "Se actualiza con cada cambio de gabinete.",
    "onu": "Se actualiza cada cuatro o cinco años.", "inventario": "Se actualiza con cada inventario.",
    "pausa": "La encuesta está en pausa: el INDEC la está reformulando.",
}
FRECUENCIA = {
    # Trabajo
    "f-empleo": "mes", "f-salarios": "trimestre", "f-rotacion": "trimestre", "f-exportaciones": "semestre",
    # Economía y precios
    "f-inflacion": "mes", "f-inflacion-rubros": "mes", "f-canastas": "mes", "f-salario-real": "mes", "f-emae": "mes", "f-supermercados": "mes",
    # Empresas y oportunidades
    "f-empresas": "anio", "f-dinamica-empresas": "anio",
    # Pobreza y hogares
    "f-pobreza": "semestre", "f-censo": "censo", "f-internet": "trimestre",
    # Salud
    "f-esperanza": "censo", "f-mortalidad": "anio", "f-causas-infantiles": "anio", "f-muertes": "anio", "f-suicidio": "anio",
    "f-suicidio-prov": "anio", "f-edad": "anio",
    # Seguridad
    "f-delitos": "anio", "f-robos": "anio", "f-homicidios": "anio", "f-carceles": "anio",
    # Educación
    "f-escolarizacion": "anio", "f-aprender": "aprender", "f-pisa": "pisa", "f-salario-docente": "trimestre", "f-inversion-educativa": "anio",
    # Población
    "f-nacimientos": "anio", "f-piramide": "anio", "f-envejecimiento": "anio", "f-jubilaciones": "trimestre", "f-adolescentes": "anio",
    "f-adolescentes-nse": "anio",
    # Migraciones
    "f-nacidos-otro-pais": "censo", "f-migracion-interna": "censo", "f-migracion-historia": "censo", "f-extranjeros": "anio",
    "f-radicaciones": "anio", "f-refugio": "anio", "f-argentinos-exterior": "onu",
    # Política
    "f-elecciones": "eleccion", "f-legisladores": "congreso", "f-anios-congreso": "congreso", "f-representacion": "anio", "f-congreso": "congreso", "f-votaciones": "leyes",
    "f-votaciones-espacios": "leyes", "f-voto-provincia": "eleccion", "f-atn": "anio", "f-transferencias": "anio", "f-apoyo": "anio", "f-presupuesto": "anio",
    "f-presidentes": "presidente", "f-ministros": "gabinete",
    # Gobierno
    "f-cuentas-nacion": "mes", "f-recaudacion": "mes", "f-deuda": "trimestre", "f-empleo-publico": "anio", "f-impuestos-provinciales": "anio",
    "f-fiscal": "anio",
    # Movilidad
    "f-sube": "mes", "f-sube-modos": "mes", "f-patentes": "mes", "f-patentes-prov": "mes", "f-combustibles": "mes",
    # Construcción y vivienda
    "f-isac": "mes", "f-permisos": "mes", "f-insumos": "mes", "f-obra-publica": "anio", "f-empleo-construccion": "trimestre",
    "f-trabajadores": "censo", "f-costo": "mes", "f-hipotecas": "mes", "f-vivienda": "censo",
    # Energía
    "f-hogares": "mes", "f-electricidad-provincias": "mes", "f-electricidad-sectores": "mes", "f-actividad": "mes", "f-meses": "mes",
    "f-centrales": "anio", "f-gas-hogares": "censo", "f-gas-consumo": "mes", "f-subsidios": "mes",
    # Petróleo y gas
    "f-petroleo": "mes", "f-gas": "mes", "f-hidro-provincias": "mes", "f-areas-hidro": "anio", "f-mapa-pozos": "mes", "f-pozos": "mes",
    "f-fracturas": "anio", "f-productividad": "anio", "f-pozos-terminados": "mes", "f-empresas-hidro": "mes", "f-empleo-hidro": "trimestre",
    "f-regalias": "anio", "f-reservas": "anio", "f-balanza-energetica": "mes", "f-mundo-petroleo": "anio",
    # Turismo
    "f-receptivo": "mes", "f-hoteles": "pausa", "f-eti": "pausa",
    # Naturaleza
    "f-protegida": "anio", "f-parques": "anio", "f-visitas": "mes", "f-visitas-parque": "anio", "f-especies": "anio", "f-pesca": "anio",
    "f-pesca-rio": "anio",
    # Curiosidades
    "f-nombres": "anio", "f-carne": "mes", "f-vino": "mes", "f-yerba": "mes", "f-glaciares": "inventario", "f-clima": "anio",
}
_fichas = re.findall(r'<article class="(ficha[^"]*)" id="(f-[^"]+)"', plantilla)
_herramientas = {i for c, i in _fichas if "explorador" in c.split()}
_faltan = [i for c, i in _fichas if i not in _herramientas and i not in FRECUENCIA]
_sobran = [i for i in FRECUENCIA if i not in {j for _, j in _fichas} or i in _herramientas or FRECUENCIA[i] not in FRASE_FRECUENCIA]
if _faltan or _sobran:
    sys.exit(f"Frecuencia de actualización: faltan {_faltan} y sobran o no tienen frase {_sobran} (FRECUENCIA en 03_construir_sitio.py).")


def con_frecuencia(m):
    """La frase de la frecuencia después de la fuente del pie de cada ficha."""
    clase, ident, cuerpo = m.group(1), m.group(2), m.group(3)
    if ident in _herramientas:
        return m.group(0)
    pie = re.search(r'(<div class="pie"><span>)([^<]*)(</span>)', cuerpo)
    if not pie:
        sys.exit(f"La ficha {ident} no tiene la fuente en el pie: no se puede sumar la frecuencia.")
    fuente = pie.group(2).rstrip()
    nuevo = f"{pie.group(1)}{fuente}{'' if fuente.endswith('.') else '.'} {FRASE_FRECUENCIA[FRECUENCIA[ident]]}{pie.group(3)}"
    return f'<article class="{clase}" id="{ident}">{cuerpo[:pie.start()]}{nuevo}{cuerpo[pie.end():]}</article>'


plantilla = re.sub(r'<article class="(ficha[^"]*)" id="(f-[^"]+)">(.*?)</article>', con_frecuencia, plantilla, flags=re.S)
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
    """"Para entender los datos": un botón de despliegue por bloque y uno para el glosario. Desde la etapa 31 va al final de la
    página, después de las fichas (lo ubica navegacion()): en pantallas anchas es un índice y una lectura, y en el celular cada botón abre
    su texto justo debajo, de a uno (lo maneja datina.js). Sin JavaScript se ven todos los textos."""
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
    return ('<div class="explicador" id="para-entender"><div class="exp-cab"><h3 class="bloque-grupo">Para entender los datos</h3>'
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


def gancho(sec):
    """Etapa 31: donde estaba "Para entender los datos" queda una línea que lleva hasta el bloque, al final de la página."""
    return ('<p class="exp-gancho"><a href="#para-entender">Para entender los datos</a>: qué se mide, de dónde sale y qué tener en cuenta, '
            'al final de la página ↓</p>') if EXP.get(sec) else ""


# el bloque entero se guarda en una marca y navegacion() lo pone al final de la página, antes de "Seguí explorando"
base = re.sub(r"<!--EXPLICADOR:(\w+)-->", lambda m: gancho(m.group(1)) + (f"<!--EXPLICADOR-FINAL:{m.group(1)}-->" if EXP.get(m.group(1)) else ""), plantilla)
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
# (los bloques de "Para entender los datos" van dentro de otras secciones).
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
PAGINA_DE_BLOQUE = {"portada": "inicio", "secciones": "inicio", "articulos-home": "inicio", "herramientas-home": "inicio",
                    "provincias": "provincia", "nosotros": "nosotros", "contacto": "contacto", "no-encontrada": "404",
                    "laboratorio": "laboratorio"}
def pagina_de(b):
    """Página de un bloque: cada sección (tema) y cada pieza del Laboratorio (etapa 33) tiene la suya, con su id. El resto, según su clase."""
    if "tema" in b["clases"] or "pieza" in b["clases"]:
        return b["id"]
    return next((PAGINA_DE_BLOQUE[c] for c in b["clases"] if c in PAGINA_DE_BLOQUE), None)


BLOQUES = bloques(base)
for b in BLOQUES:
    b["pagina"] = pagina_de(b)
    assert b["pagina"], f"bloque sin página: {b['clases']} {b['id']}"
TEMAS = [b for b in BLOQUES if "tema" in b["clases"]]
# artículos: id, título, ícono y sección (data-ico y data-sec en la plantilla)
NOTAS = re.findall(r'<article class="nota" id="(a-[\w-]+)" data-ico="([\w-]+)" data-sec="([\w-]+)" data-titulo="([^"]+)"', base)
assert NOTAS, "no se encontraron los artículos en la plantilla"
# piezas del Laboratorio con página propia (etapa 33): id, ícono, título y descripción (data-ico, data-titulo y data-descr en la plantilla)
PIEZAS = re.findall(r'<section class="pieza" id="([\w-]+)" data-ico="([\w-]+)" data-titulo="([^"]+)" data-descr="([^"]+)"', base)


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
TEXTO_ANTES = {"f-muertes", "f-suicidio", "f-suicidio-prov", "f-edad"}   # como NOTA_A_LA_VISTA en datina.js
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
        # etapa 35 (prueba en Trabajo): el título es una pregunta y la descripción con el período va debajo (p.ficha-sub), fija o calculada
        sub = re.search(r'<p class="ficha-sub"(?: data-t="([^"]+)")?>(.*?)</p>', m.group(3), re.S)
        explorador = "explorador" in m.group(1)
        n += not explorador
        # etapa 37 (orden de prioridad del autor: la pregunta, el dato y después la interpretación): el texto va después del gráfico, salvo
        # en las fichas de suicidio, que lo ponen en contexto antes, y en las anchas, cuyo gráfico es una lista larga
        if "herramienta" not in b["clases"] and "ancha" not in m.group(1) and m.group(2) not in TEXTO_ANTES and kl:
            assert 0 <= m.group(3).find('class="grafico') < kl.start(), f"{m.group(2)}: el texto (p.lead) va después del gráfico"
        # [id, sección, título fijo, clave del título calculado, clave del texto, explorador, después de las líneas de ayuda,
        #  descripción fija, clave de la descripción calculada]
        FICHAS.append([m.group(2), b["id"], texto(h3.group(2)) if h3 else "", kt.group(1) if kt else "", kl.group(1) if kl else "",
                       int(explorador), int(0 <= ayuda < m.start()), texto(sub.group(2)) if sub else "", (sub.group(1) or "") if sub else ""])
    # [id, título, pregunta, texto de entrada, herramienta, fichas, artículos, pregunta corta para la tarjeta de la portada]
    SECCIONES.append([b["id"], titulo, texto(preg.group(2)) if preg else "", texto(intro.group(1)) if intro else "",
                      int("herramienta" in b["clases"]), n, len(re.findall(r'<article class="nota"', h)),
                      html.unescape(preg.group(1)) if preg and preg.group(1) else ""])
# las cifras de la portada van escritas desde el principio (etapa 13): si las pusiera solo datina.js, la portada saltaría al llegar
_estado = '<p class="estado" id="estado"></p>'
assert base.count(_estado) == 1
base = base.replace(_estado, f'<p class="estado" id="estado"><span>{sum(1 for f in FICHAS if not f[5])} fichas</span> <span>24 jurisdicciones</span> '
                             f'<span>{len(NOTAS)} artículos</span></p>')
# Grupos y categorías (etapa 36, pedido del autor del 7 de octubre de 2026: "empezá a unificar, tipo energía es la categoría general de
# petróleo y gas", y sus respuestas: categorías con subsecciones, los grupos de su mensaje). Cuatro grupos, como en la portada ("Explorá la
# Argentina por tema"), y Curiosidades aparte. Un elemento de un grupo es una sección o una categoría: un nombre y sus secciones, la primera
# es su página de entrada. Cada sección conserva su página y su dirección. De acá salen la barra, el menú "Más", la fila del celular, las
# migas, la fila de cada categoría, el mapa del pie, el recorrido de "Seguí explorando" y los grupos de la portada (datina.js)
GRUPOS = [
    ("personas", "Personas", [("Población", ["poblacion", "migraciones", "turismo"]), "salud", "educacion", "pobreza"]),
    ("economia", "Trabajo y economía", ["trabajo", ("Economía", ["economia", "empresas", "construccion", "gobierno"])]),
    ("estado", "Estado y sociedad", ["politica", "seguridad"]),
    ("territorio", "Territorio y recursos", [("Energía", ["energia", "petroleo"]), "movilidad", "naturaleza"]),
    ("otros", "Y además", ["curiosidades"]),
]
# la barra (etapa 39, respuesta del autor del 10/10/2026: "4 grupos con menú"): los mismos grupos de la portada, cada uno con un menú con
# sus secciones. "Y además" (Curiosidades) va en "Más". Hasta entonces eran ocho temas sueltos escritos a mano, lo único que no salía de GRUPOS
GRUPOS_BARRA = [x for x in GRUPOS if x[0] != "otros"]
_secs_de = lambda items: [s for it in items for s in (it[1] if isinstance(it, tuple) else [it])]
EN_BARRA = {s for _, _, items in GRUPOS_BARRA for s in _secs_de(items)}
CATEGORIA = {s: (it[0], it[1]) for _, _, items in GRUPOS for it in items if isinstance(it, tuple) for s in it[1]}
ORDEN_TEMAS = [s for _, _, items in GRUPOS for it in items for s in (it[1] if isinstance(it, tuple) else [it])]
GRUPO_DE = {s: (g, n) for g, n, items in GRUPOS for s in _secs_de(items)}
_temas = [x[0] for x in SECCIONES if not x[4] and x[0] != "articulos"]
assert sorted(ORDEN_TEMAS) == sorted(_temas), f"las secciones y los grupos no coinciden: {set(ORDEN_TEMAS) ^ set(_temas)}"
HERRAMIENTAS = [x[0] for x in SECCIONES if x[4]]
INDICE = {"secciones": SECCIONES, "fichas": FICHAS, "articulos": [[i, html.unescape(t), ico, sec] for i, ico, sec, t in NOTAS], "ubic": UBIC,
          "grupos": [[g, n, [list(it) if isinstance(it, tuple) else it for it in items]] for g, n, items in GRUPOS],
          "cat": {s: subs[0] for s, (_, subs) in CATEGORIA.items()}}

# ---------- datos ----------
# Las tablas mas pesadas, que usan pocas fichas, van en archivos aparte que el navegador baja solo al abrir esas fichas.
# fichas.js lleva la huella de cada una para que el navegador no use una version vieja.
DIFERIDAS = ["elecciones_presidenciales", "anios_congreso", "transferencias_provincias", "piramide_poblacion", "apoyo_gobierno_provincias", "aprender_departamentos",
             "hidrocarburos_mensual", "vivienda_departamentos", "isac_mensual", "costo_construccion",
             "empleo_construccion_serie", "pozos_no_convencionales", "areas_produccion", "centrales",
             "gas_usuario_serie", "gas_usuario_mensual", "areas_serie", "combustibles_mensual", "electricidad_serie", "electricidad_mensual",
             "dolar_inversion_trimestral", "compras_dolares_anual", "salarios_serie", "salario_docente_serie", "inversion_educativa_serie",
             "seguridad_serie_prov", "turismo_dolar_mensual", "nafta_dolares_mensual", "nafta_dolares_anual",
             "exportaciones_dolar_trimestral", "exportaciones_cantidades_anual",
             "inflacion_mensual", "canasta_mensual", "salario_real_mensual", "actividad_mensual",
             "nacidos_otro_pais_paises", "radicaciones_nacionalidad", "argentinos_exterior_destinos",
             "migraciones_departamentos", "supermercados_mensual", "corte_jueces", "corte_composicion", "corte_presidentes"]
D = json.loads((SITIO / "datos" / "fichas.json").read_text(encoding="utf-8"))
D["diferidas"] = {}
for nombre in DIFERIDAS:
    filas = D["datos"].pop(nombre)
    assert isinstance(filas, list), nombre
    # en columnas, con cada nombre una sola vez (etapa 19): pesa bastante menos que una lista de objetos, y datina.js vuelve a armar
    # los objetos al cargarla (deColumnas)
    cols = list(dict.fromkeys(k for f in filas for k in f))
    t = json.dumps({"c": cols, "f": [[f.get(k) for k in cols] for f in filas]}, ensure_ascii=False, separators=(",", ":"))
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
# Ninguna clave repetida en los objetos principales de datina.js (etapa 25): en un objeto de JavaScript la segunda pisa a la primera sin aviso.
# Se miran las claves que abren cada línea con dos espacios de sangría en el objeto y en los Object.assign que lo completan, que es como se
# escriben, y las que se asignan sueltas más abajo (DIB.congreso = ..., TX["vprov"] = ...)
for _obj in ("LEAD", "TX", "DIB", "CLAVE", "EXTRA", "EN_CIFRAS", "SERIE_CIFRA"):
    _bl = [m.group(1) for m in re.finditer(r"\n(?:const " + _obj + r" = |Object\.assign\(" + _obj + r", )\{\n(.*?)\n\}\)?;?\n", js, re.S)]
    assert _bl, f"no se encontró {_obj} en datina.js"
    _cl = [a or b for b_ in _bl for a, b in re.findall(r'^  (?:"([^"]+)"|([\w$]+)):', b_, re.M)]
    _cl += [a or b for a, b in re.findall(r"^" + _obj + r'(?:\["([^"]+)"\]|\.([\w$]+)) = ', js, re.M)]
    _rep = sorted({c for c in _cl if _cl.count(c) > 1})
    assert not _rep, f"claves repetidas en {_obj} de datina.js: {_rep}"
# ícono de cada página: la grilla de secciones de la portada (datina.js) y el final de página ("Seguí explorando")
SEC_ICONO = {"articulos": "periodico", "provincia": "pin", "trabajo": "maletin", "empresas": "tienda", "pobreza": "casa", "salud": "botiquin",
             "educacion": "birrete", "poblacion": "personas", "politica": "congreso", "movilidad": "colectivo", "construccion": "grua", "energia": "rayo", "petroleo": "ciguena", "seguridad": "escudo", "economia": "carrito", "migraciones": "globo", "gobierno": "mastil", "turismo": "valija",
             "naturaleza": "andes", "curiosidades": "mate", "cruces": "dispersion", "indice": "podio", "departamentos": "mosaico",
             "diagnostico": "portapapeles", "laboratorio": "matraz"}
SEC_ICONO.update({i: ico for i, ico, _, _ in NOTAS})
SEC_ICONO.update({i: ico for i, ico, _, _ in PIEZAS})
assert set(SEC_ICONO.values()) <= set(ICONOS), set(SEC_ICONO.values()) - set(ICONOS)
import relaciones  # noqa: E402
for marca, valor in {"/*ICONOS*/{}": ICONOS, "/*SEC_ICONO*/{}": SEC_ICONO, "/*SIN_RELACIONES*/[]": sorted(relaciones.EXCLUIDAS)}.items():
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
    b["pagina"] = pagina_de(b)

TITULO = "<title>Datina | Las 24 Argentinas en números</title>"
DESCR = re.search(r'<meta name="description" content="[^"]*">', base).group(0)
assert TITULO in base
url_pagina = lambda p: "./" if p == "inicio" else f"{p}.html"
TITULO_DE = {s[0]: s[1] for s in SECCIONES}


# Recorrido de "Anterior / Siguiente": artículos, el Laboratorio (etapa 33), tu provincia, las secciones y las herramientas, y Sobre nosotros
ORDEN = ["articulos", "laboratorio", "provincia"] + ORDEN_TEMAS + HERRAMIENTAS + ["nosotros"]
TITULO_DE.update({"provincia": "Tu provincia", "nosotros": "Sobre nosotros", "contacto": "Contacto", "laboratorio": "Laboratorio"})
# piezas del Laboratorio: las cuenta la tarjeta que lleva a él en "Seguí explorando"
LAB_PIEZAS = len(re.findall(r'<article class="lab-pieza', base))
assert LAB_PIEZAS, "no se encontraron las piezas del Laboratorio en la plantilla"
FLECHA_ANT, FLECHA_SIG = '<span aria-hidden="true">\u2190</span> ', ' <span aria-hidden="true">\u2192</span>'
TIT_NOTA = {i: html.unescape(t) for i, _, _, t in NOTAS}
TITULO_DE.update({i: html.unescape(t) for i, _, t, _ in PIEZAS})


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
    desc = {"provincia": "Perfil provincial", "nosotros": "Qué es Datina", "articulos": f"{len(NOTAS)} artículos",
            "laboratorio": f"{LAB_PIEZAS} piezas visuales"}.get(pid) or (
        "Herramienta" if sec and sec[4] else f"{sec[5]} fichas" if sec else "")
    return (url_pagina(pid), TITULO_DE[pid], meta or desc, SEC_ICONO.get(pid, "sol"), f"t-{pid}" if sec else "")


def pasos(ant, sig, relacionadas, todas):
    """Final de página ("Seguí explorando", como el de usafacts.org, pedido del autor el 2 de octubre de 2026): cuatro tarjetas
    con ícono, la anterior y la siguiente (con su flecha) y dos relacionadas, y el enlace a todas las secciones o artículos."""
    cartas = [carta(ant, FLECHA_ANT + "Anterior"), carta(sig, "Siguiente" + FLECHA_SIG)] if ant else []
    cartas += [carta(r) for r in relacionadas]
    t = "".join(f'<a class="tarjeta explora" href="{u}"><span class="explora-ico">{icono_svg(ic)}</span><span class="explora-txt">'
                f'<b{f" style={chr(34)}view-transition-name:{vt}{chr(34)}" if vt else ""}>{e(tit)}</b><small>{meta}</small></span></a>'
                for u, tit, meta, ic, vt in cartas)
    return (f'<nav class="pasos" aria-labelledby="pasos-tit"><div class="pasos-cab"><h2 class="bloque-grupo" id="pasos-tit">Seguí explorando</h2>'
            f'<a class="enlace" href="{todas[0]}">{e(todas[1])}{FLECHA_SIG}</a></div><div class="pasos-grid">{t}</div></nav>')


def relacionadas(pagina, ya):
    """Las dos tarjetas que acompañan a la anterior y la siguiente: los artículos de la sección y, si faltan, tu provincia, Cruces y
    las páginas que siguen en el recorrido. Nunca la página actual ni una que ya está."""
    # el Laboratorio lleva a las secciones de sus piezas
    candidatas = [i for i, _, sec, _ in NOTAS if sec == pagina] + (["politica", "petroleo"] if pagina == "laboratorio" else []) + ["provincia", "cruces"]
    if pagina in ORDEN:
        i = ORDEN.index(pagina)
        candidatas += ORDEN[i + 2:] + ORDEN[:i]
    sale = []
    for c in candidatas:
        if c not in sale and c != pagina and c not in ya and c != "nosotros":
            sale.append(c)
    return sale[:2]


def migas(*partes, prov=True):
    """Migas: Datina, el camino hasta la página y la provincia elegida (la completa datina.js). Desde el 11 de octubre de 2026 (pedido del
    autor: "que no se repita Instituciones políticas o lo que fuese que toque en cada sección") no nombran la página actual, que va justo
    debajo como antetítulo o título: cada parte es (dirección, nombre) de un nivel de arriba, y sin dirección es un nombre sin enlace."""
    li = ['<li><a href="./">Datina</a></li>'] + [f'<li><a href="{u}">{e(t)}</a></li>' if u else f'<li><span>{e(t)}</span></li>' for u, t in partes]
    if prov:
        li.append('<li class="migas-prov" hidden></li>')
    return f'<nav class="migas" aria-label="Ubicación"><ol>{"".join(li)}</ol></nav>'


def pildoras(seccion):
    return '<nav class="pildoras" aria-label="Secciones">' + "".join(
        f'<a href="{url_pagina(s)}"{" aria-current=" + chr(34) + "page" + chr(34) if s == seccion else ""}>{e(TITULO_DE[s])}</a>'
        for s in ["articulos"] + ORDEN_TEMAS + HERRAMIENTAS) + "</nav>"


def subsecciones(seccion):
    """La fila de una categoría (etapa 36): su nombre y sus secciones, con la actual marcada. Va al final de la entrada de la página, antes
    de "En cifras"."""
    nombre, subs = CATEGORIA[seccion]
    # el nombre de la categoría va adelante salvo que la primera sección se llame igual (Población, Energía)
    cat = "" if TITULO_DE[subs[0]] == nombre else f'<span class="sub-cat">{e(nombre)}</span>'
    return (f'<nav class="subsecciones" aria-label="{e(nombre)}">{cat}' + "".join(
        f'<a href="{url_pagina(s)}"{" aria-current=" + chr(34) + "page" + chr(34) if s == seccion else ""}>{e(TITULO_DE[s])}</a>' for s in subs) + "</nav>")


def navegacion(h, pagina):
    """Piezas que dependen de la página: la fila de secciones del celular, las migas y "Anterior / Siguiente"."""
    if pagina.startswith("a-"):
        nota = f'<article class="nota" id="{pagina}"'
        orden = [n[0] for n in NOTAS]
        i = orden.index(pagina)
        art = lambda j: orden[j % len(orden)]
        h = h.replace(nota, pildoras("articulos") + migas(("articulos.html", "Artículos"), prov=False) + nota, 1)
        fin = h.index("</article>", h.index(nota)) + len("</article>")
        sec = next(sec for a, _, sec, _ in NOTAS if a == pagina)
        return h[:fin] + pasos(art(i - 1), art(i + 1), [sec, "cruces"], ("articulos.html", "Todos los artículos")) + h[fin:]
    ident = {"provincia": "provincias"}.get(pagina, pagina)
    b = next((b for b in bloques(h) if b["id"] == ident), None)
    if not b or pagina in ("inicio", "404"):
        return h
    # una pieza del Laboratorio (etapa 33): las migas pasan por el Laboratorio, y al final cuatro tarjetas sin anterior ni siguiente
    if "pieza" in b["clases"]:
        blo = h[b["ini"]:b["fin"]]
        blo = re.sub(r"^(<section[^>]*>)", lambda m: m.group(1) + migas(("laboratorio.html", "Laboratorio"), prov=False), blo)
        blo = blo[:-len("</section>")] + pasos(None, None, ["laboratorio", "politica", "gobierno", "articulos"],
                                                ("laboratorio.html", "Todo el Laboratorio")) + "</section>"
        return h[:b["ini"]] + blo + h[b["fin"]:]
    blo = h[b["ini"]:b["fin"]]
    # "Para entender los datos" (etapa 31): al final de la página, después de las fichas y antes de "Seguí explorando"
    final = ""
    m = re.search(r"<!--EXPLICADOR-FINAL:(\w+)-->", blo)
    if m:
        blo = blo.replace(m.group(0), "", 1)
        final = explicador(m.group(1))
    # migas arriba del título y fila de secciones (solo en el celular) arriba de todo
    # el camino: el grupo de la portada y, en una sección que no es la entrada de su categoría, la categoría. Las herramientas y Tu
    # provincia van bajo "Herramientas", como en el pie, y Curiosidades ("Y además"), Sobre nosotros, Contacto, Artículos y Laboratorio, solo con Datina
    partes = []
    if pagina in GRUPO_DE and GRUPO_DE[pagina][0] != "otros":
        partes.append(("./#tg-" + GRUPO_DE[pagina][0], GRUPO_DE[pagina][1]))
        if pagina in CATEGORIA and CATEGORIA[pagina][1][0] != pagina:
            partes.append((url_pagina(CATEGORIA[pagina][1][0]), CATEGORIA[pagina][0]))
    elif pagina in HERRAMIENTAS or pagina == "provincia":
        partes.append(("", "Herramientas"))
    blo = blo.replace("<h2", migas(*partes, prov=pagina not in ("nosotros", "contacto")) + "<h2", 1)
    # la fila de la categoría, después de la entrada (datina.js pone "En cifras" después de ella)
    if pagina in CATEGORIA:
        blo = re.sub(r'(<div class="tema-intro">.*?</div>)', lambda m: m.group(1) + subsecciones(pagina), blo, 1, re.S)
    # transición entre páginas: el título viaja desde su tarjeta de la portada (mismo nombre en las dos páginas)
    if pagina in [x[0] for x in SECCIONES]:
        blo = re.sub(r"<h2>", f'<h2 style="view-transition-name:t-{pagina}">', blo, 1)
    if pagina in [x[0] for x in SECCIONES]:
        blo = re.sub(r"^(<section[^>]*>)", lambda m: m.group(1) + pildoras(pagina), blo)
    if pagina in ORDEN:
        i = ORDEN.index(pagina)
        vecino = lambda j: ORDEN[j] if 0 <= j < len(ORDEN) else "inicio"
        ant, sig = vecino(i - 1), vecino(i + 1)
        blo = blo[:-len("</section>")] + final + pasos(ant, sig, relacionadas(pagina, {ant, sig}), ("./#secciones", "Todos los temas")) + "</section>"
    elif final:
        blo = blo[:-len("</section>")] + final + "</section>"
    return h[:b["ini"]] + blo + h[b["fin"]:]


# Mapa del sitio en el pie de todas las páginas
def lista(items):
    return "<ul>" + "".join(f'<li><a href="{u}">{e(t)}</a></li>' for u, t in items) + "</ul>"


_secs_grupo = lambda items: [(url_pagina(s), TITULO_DE[s]) for it in items for s in (it[1] if isinstance(it, tuple) else [it])]
_col = lambda g: f'<h2>{e(g[1])}</h2>' + lista(_secs_grupo(g[2]))
MAPA = (f'<div class="pie-col">{_col(GRUPOS[0])}</div><div class="pie-col">{_col(GRUPOS[1])}</div>'
        f'<div class="pie-col">{_col(GRUPOS[2])}{_col(GRUPOS[4])}</div><div class="pie-col">{_col(GRUPOS[3])}</div>'
        '<div class="pie-col"><h2>Herramientas</h2>' + lista([("provincia.html", "Tu provincia")] + [(url_pagina(x[0]), x[1]) for x in SECCIONES if x[4]] +
                                                                [("relaciones.html", "Explorador de relaciones"), ("articulos.html", "Artículos"),
                                                                 ("laboratorio.html", "Laboratorio")]) +
        '<h2>Datina</h2>' + lista([("nosotros.html", "Sobre nosotros"), ("nosotros.html#como-se-hace", "Cómo se hace"),
                                   ("nosotros.html#fuentes", "Fuentes y método"), ("contacto.html", "Contacto")]) + "</div>")
assert "<!--MAPA-->" in base
base = base.replace("<!--MAPA-->", MAPA)
# la barra, sus menús y la lista de temas de "Más" (etapas 36 y 39): salen de GRUPOS. En "Más", los temas de los grupos de la barra llevan
# en-barra: se ven solo cuando la barra no muestra los grupos (hasta 1080 píxeles)
_li = lambda s: (f'<li{" class=" + chr(34) + "en-barra" + chr(34) if s in EN_BARRA else ""}>'
                 f'<a href="{url_pagina(s)}">{e(TITULO_DE[s])}</a></li>')
_FLECHA = '<svg class="mas-flecha" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M2.5 4.5 6 8l3.5-3.5"/></svg>'
# cada grupo: un botón en la barra (data-secs: sus secciones, para marcar la actual; data-ir: adónde lleva donde no hay menú, como el
# Explorador de relaciones) y su menú, con las secciones en el orden de la portada y las de una categoría debajo de su entrada
_barra = "".join(f'<button type="button" class="menu-btn grupo-btn" id="gb-{g}" aria-expanded="false" aria-controls="gm-{g}" '
                 f'data-secs="{" ".join(_secs_de(items))}" data-ir="./#tg-{g}">{e(n)}{_FLECHA}</button>' for g, n, items in GRUPOS_BARRA)
_gm_li = lambda it: (f'<li><a href="{url_pagina(it[1][0])}">{e(it[0])}</a></li>' + "".join(f'<li class="sub"><a href="{url_pagina(s)}">{e(TITULO_DE[s])}</a></li>' for s in it[1][1:])
                     if isinstance(it, tuple) else f'<li><a href="{url_pagina(it)}">{e(TITULO_DE[it])}</a></li>')
_grupos_menu = "".join(f'<nav class="menu-panel grupo-panel" id="gm-{g}" aria-labelledby="gb-{g}" hidden><ul>' + "".join(_gm_li(it) for it in items) + "</ul></nav>"
                       for g, n, items in GRUPOS_BARRA)
# "Más" (11 de octubre de 2026, pedido del autor: "debería quedar al principio Tu provincia, y luego del separador Cruces, Tu índice,
# Departamentos, Diagnóstico educativo, Explorador de relaciones, y después reordená con tu criterio lo otro"). Dos columnas que en el
# celular se apilan: a la izquierda Tu provincia y las herramientas. A la derecha los temas de la barra (solo hasta 1080 píxeles, cuando la
# barra no los muestra), las lecturas (Artículos, Laboratorio y lo que GRUPOS deja en "Y además") y Datina. Cada grupo lleva su separador
_grupo_menu = lambda g, n, lis: (f'<div class="menu-grupo"><p class="menu-tit" id="mt-{g}">{e(n)}</p><ul aria-labelledby="mt-{g}">'
                                 + "".join(lis) + "</ul></div>")
_li_url = lambda u, t: f'<li><a href="{u}">{e(t)}</a></li>'
_otros_secs = [s for g, _, items in GRUPOS if g == "otros" for s in _secs_de(items)]
_menu = ('<div class="menu-col">'
         + _grupo_menu("prov", "Tu provincia", [_li_url("provincia.html", "Tu provincia")])
         + _grupo_menu("herr", "Herramientas", [_li(s) for s in HERRAMIENTAS] + [_li_url("relaciones.html", "Explorador de relaciones")])
         + '</div><div class="menu-col">'
         + "".join(_grupo_menu(g, n, [_li(s) for s in _secs_de(items)]) for g, n, items in GRUPOS_BARRA)
         + _grupo_menu("lect", "Artículos y Laboratorio", [_li_url("articulos.html", "Artículos"), _li_url("laboratorio.html", "Laboratorio")]
                       + [_li(s) for s in _otros_secs])
         + _grupo_menu("datina", "Datina", [_li_url("nosotros.html", "Sobre nosotros"), _li_url("contacto.html", "Contacto")])
         + "</div>")
# Los temas de la portada (etapa 36): cada grupo con sus secciones (ícono, nombre y pregunta corta), y debajo de una categoría sus otras
# secciones. Desde la etapa 39 los escribe el constructor: van justo debajo de lo azul y, si los pusiera datina.js al llegar, Artículos saltaba
# hacia abajo. Cada grupo es una columna, y "Y además" (Curiosidades) va debajo del grupo con menos secciones
_SEC = {s[0]: s for s in SECCIONES}


def _tema_portada(it):
    nom, subs = it if isinstance(it, tuple) else (None, [it])
    s = _SEC[subs[0]]
    ico = icono_svg(SEC_ICONO[s[0]]).replace('class="iso ', 'class="iso tg-ico ', 1)
    otras = ('<p class="tg-subs">' + "".join(f'<a href="{url_pagina(x)}">{e(TITULO_DE[x])}</a>' for x in subs[1:]) + "</p>") if len(subs) > 1 else ""
    return (f'<li class="tg-item"><a class="tg-link" href="{url_pagina(s[0])}">{ico}<span class="tg-txt">'
            f'<b style="view-transition-name:t-{s[0]}">{e(nom or s[1])}</b><span class="tg-preg">{e(s[7] or s[2])}</span></span></a>{otras}</li>')


_grupo_portada = lambda g, n, items: (f'<section class="tg tg-{g}" aria-labelledby="tg-{g}"><h3 class="tg-tit" id="tg-{g}">{e(n)}</h3>'
                                      '<ul class="tg-lista">' + "".join(_tema_portada(it) for it in items) + "</ul></section>")
_otros = next((x for x in GRUPOS if x[0] == "otros"), None)
_corta = min(GRUPOS_BARRA, key=lambda x: len(_secs_de(x[2])))
_temas_portada = "".join(f'<div class="tg-col">{_grupo_portada(*x)}{_grupo_portada(*_otros) if x is _corta and _otros else ""}</div>' for x in GRUPOS_BARRA)
for marca, valor in {"<!--TEMAS-BARRA-->": _barra, "<!--TEMAS-MENU-->": _menu, "<!--GRUPOS-MENU-->": _grupos_menu,
                     '<div class="secciones-grid" id="secciones-grid"></div>': f'<div class="secciones-grid" id="secciones-grid">{_temas_portada}</div>'}.items():
    assert base.count(marca) == 1, marca
    base = base.replace(marca, valor)
BLOQUES = bloques(base)
for b in BLOQUES:
    b["pagina"] = pagina_de(b)

# Formas de carga (etapa 6): mientras llegan los datos y el código, cada ficha muestra su silueta y cada gráfico reserva su alto.
# La forma de cada gráfico va en la plantilla (data-forma). Las tarjetas de "En cifras" y del perfil provincial las arma
# datina.js: aca se cuentan para dejar en su lugar la misma cantidad de tarjetas vacías
sin_forma = re.findall(r'<div class="grafico[^"]*" data-g="([\w-]+)"(?![^>]*data-forma)', base)
if sin_forma:
    print("Aviso: gráficos sin data-forma en la plantilla (se ven sin silueta mientras cargan):", ", ".join(sin_forma))
bloque_js = lambda ini, fin: js[js.index(ini):js.index(fin, js.index(ini))]
CON_CLAVE = set(re.findall(r'^\s+"(f-[\w-]+)":\s*\[', bloque_js("const CLAVE = {", "\n};"), re.M))
CON_PERFIL = re.findall(r'\{id:"(f-[\w-]+)"', bloque_js("const INDP = [", "\n];"))
# el perfil por tema (etapa 27): los grupos y el tema de cada indicador salen de datina.js, así la silueta tiene la misma forma
PERFIL_GRUPOS = re.findall(r'\["(\w+)", "([^"]+)"\]', bloque_js("const PERFIL_GRUPOS = [", "];"))
PERFIL_G = (re.findall(r'\{id:"[\w-]+", g:"(\w+)"', bloque_js("const INDP = [", "\n];")) +
            re.findall(r'\{id:"[\w-]+", g:"(\w+)"', bloque_js("const CAP_P = [", "\n];")))
assert len(PERFIL_G) >= len(CON_PERFIL) and set(PERFIL_G) <= {g for g, _ in PERFIL_GRUPOS}, "el perfil tiene indicadores sin tema"


def perfil_vacio():
    """El índice y los grupos del perfil con tarjetas vacías, igual a lo que arma datina.js."""
    indice = "".join(f'<li><a class="enlace" href="#pg-{g}">{i + 1}. {t}</a></li>' for i, (g, t) in enumerate(PERFIL_GRUPOS))
    grupos = "".join(f'<section class="perfil-grupo" id="pg-{g}" aria-labelledby="pg-{g}-t"><div class="perfil-cab"><h3 class="bloque-grupo" '
                     f'id="pg-{g}-t">{i + 1}. <span>{t}</span></h3><a class="enlace" href="#perfil-indice">Volver al índice</a></div>'
                     f'<div class="perfil-tarjetas">{tarjetas_vacias(PERFIL_G.count(g), "dp esqueleto")}</div></section>'
                     for i, (g, t) in enumerate(PERFIL_GRUPOS))
    return f'<nav class="perfil-indice" id="perfil-indice" aria-label="Temas del perfil"><ol>{indice}</ol></nav>{grupos}'
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
            blo = re.sub(r'(<div class="tema-intro">.*?</div>(?:<nav class="subsecciones".*?</nav>)?)', lambda m: m.group(1) + vacias, blo, 1, re.S)
            h = h[:b["ini"]] + blo + h[b["fin"]:]
    return h.replace('<div class="prov-grid" id="prov-grid"></div>',
                     f'<div class="prov-grid" id="prov-grid">{perfil_vacio()}</div>', 1)


# Un h1 por página (11 de octubre de 2026, auditoría: 49 de 52 páginas no tenían): el título de la página, que hasta acá es el primer h2
# de <main>, pasa a h1 al final del armado, cuando el constructor ya lo leyó para el índice, los menús y las migas. El aspecto no cambia
# (datina.css estiliza h1 y h2 igual). La portada ya tiene su h1. Los artículos y las piezas del Laboratorio arman su título con
# datina.js, que lo escribe como h1. scripts/prueba_encabezados.py controla el resultado en las páginas armadas
def encabezado_principal(h, id_):
    if id_ == "inicio" or '<article class="nota"' in h or '<section class="pieza"' in h:
        return h
    ini = h.find("<main")
    a = h.find("<h2", ini)
    assert ini >= 0 and a >= 0, f"{id_}: sin <main> o sin título h2"
    b = h.find("</h2>", a)
    return h[:a] + "<h1" + h[a + 3:b] + "</h1>" + h[b + 5:]


# Metadatos para buscadores y redes (11 de octubre de 2026). La dirección pública sale de datos/manual/sitio.json: mientras esté vacía
# no hay canonical absolutos, og:url, sitemap.xml, robots.txt ni Dataset, para no apuntar a un dominio inventado. Las etiquetas
# Open Graph y Twitter van siempre en las páginas que se indexan, con un título que dice algo (en las secciones, el nombre y su
# pregunta). Los artículos y las piezas del Laboratorio llevan además un Article en JSON-LD. scripts/prueba_metadatos.py lo controla
URL_SITIO = json.loads((RAIZ / "datos" / "manual" / "sitio.json").read_text(encoding="utf-8"))["url"].strip().rstrip("/")
assert not URL_SITIO or URL_SITIO.startswith("https://"), "datos/manual/sitio.json: la dirección tiene que empezar con https://"
INDEXADAS = []


def metadatos(id_, titulo_social, descripcion, tipo):
    archivo = "" if id_ == "inicio" else f"{id_}.html"
    m = [f'<meta property="og:site_name" content="Datina">', '<meta property="og:locale" content="es_AR">',
         f'<meta property="og:type" content="{tipo}">', f'<meta property="og:title" content="{e(titulo_social)}">',
         f'<meta property="og:description" content="{e(descripcion)}">', '<meta name="twitter:card" content="summary">',
         f'<meta name="twitter:title" content="{e(titulo_social)}">', f'<meta name="twitter:description" content="{e(descripcion)}">']
    if URL_SITIO:
        m += [f'<link rel="canonical" href="{URL_SITIO}/{archivo}">', f'<meta property="og:url" content="{URL_SITIO}/{archivo}">']
    if tipo == "article":
        ld = {"@context": "https://schema.org", "@type": "Article", "headline": titulo_social, "description": descripcion, "inLanguage": "es-AR",
              "author": {"@type": "Organization", "name": "Datina"}, "publisher": {"@type": "Organization", "name": "Datina"}}
        if URL_SITIO:
            ld["url"] = ld["mainEntityOfPage"] = f"{URL_SITIO}/{archivo}"
        m.append('<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False).replace("</", "<\\/") + "</script>")
    if id_ == "inicio" and URL_SITIO:
        ld = {"@context": "https://schema.org", "@type": "Dataset", "name": "Datina: tabla completa de indicadores por jurisdicción",
              "description": "Todos los indicadores de Datina en una sola tabla: una fila por jurisdicción, período e indicador, con su unidad y su fuente.",
              "inLanguage": "es-AR", "creator": {"@type": "Organization", "name": "Datina"}, "spatialCoverage": "Argentina",
              "distribution": [{"@type": "DataDownload", "encodingFormat": "text/csv", "contentUrl": f"{URL_SITIO}/datos/tabla_larga.csv"}]}
        m.append('<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False).replace("</", "<\\/") + "</script>")
    INDEXADAS.append(archivo)
    return "\n".join(m)


def pagina(id_, titulo, descripcion, quedan, recorte=None, titulo_social=None, tipo="website"):
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
    if id_ != "404":
        des = descripcion or html.unescape(re.search(r'content="([^"]*)"', DESCR).group(1))
        soc = titulo_social or titulo or "Datina: las 24 Argentinas en números"
        h = h.replace('<meta name="description"', metadatos(id_, soc, des, tipo) + '\n<meta name="description"', 1)
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
    h = encabezado_principal(h, id_)
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
# Laboratorio (etapa 33): piezas visuales grandes, como The Viz Lab de USAFacts
pagina("laboratorio", "Laboratorio",
       "Datos difíciles, en gráficos: cada banca del Congreso, cada pozo de Vaca Muerta y las 24 jurisdicciones año por año, con sus fuentes.",
       {"laboratorio"})
for id_, _, titulo, descr in PIEZAS:
    pagina(id_, html.unescape(titulo), html.unescape(descr), {id_}, tipo="article")
# Contacto: formulario del proyecto (se activa al publicar en Netlify)
pagina("contacto", "Contacto", "Para avisar de un error en un dato, sugerir una fuente o una pregunta, o contar cómo usás Datina.", {"contacto"})
# Página para las direcciones que no existen
pagina("404", "Página no encontrada", "Esta página no existe.", {"404"})
sin_notas = lambda h: re.sub(r'\s*<div class="notas">.*?</div>', "", h, 1, re.S)
for id_, titulo, preg, *_ in SECCIONES:
    descr = f"{titulo}: {preg} Datos por provincia con su fuente, su año y la tabla para descargar." if preg else f"{titulo} en Datina."
    pagina(id_, titulo, descr, {id_}, sin_notas if id_ == "articulos" else None, titulo_social=f"{titulo}: {preg}" if preg else None)


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


# La descripción de cada artículo dice qué cruza: series del país (ART_SERIE), las 24 capitales (tabla de las capitales en ART)
# o las 24 jurisdicciones (los demás artículos de cruces)
ART_SERIES = set(re.findall(r'^\s+id: "(a-[\w-]+)"', bloque_js("const ART_SERIE = [", "\n}];"), re.M))
ART_CAPITALES = set(re.findall(r'\{id: "(a-[\w-]+)", tabla: "capitales', bloque_js("const ART = [", "\n];")))
assert ART_SERIES and ART_CAPITALES, "no se encontraron los artículos de series o de las capitales en datina.js"
CRUZA = lambda id_: ("series oficiales del país" if id_ in ART_SERIES else
                     "datos oficiales de las 24 capitales de provincia" if id_ in ART_CAPITALES else "datos oficiales de las 24 jurisdicciones")
for id_, _, _, titulo in NOTAS:
    descr = f"{html.unescape(titulo)} Un cruce de {CRUZA(id_)}, con sus fuentes y sus límites."
    pagina(id_, html.unescape(titulo), descr, {"articulos"}, solo_nota(id_), tipo="article")

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
# el armado de Observable Framework pone maximum-scale=1 en el viewport, y eso impide agrandar la página con los dedos en el celular
# (11 de octubre de 2026, WCAG 1.4.4). Se saca acá, sobre lo publicado, así sigue resuelto en cada armado nuevo del consultor
for _pb in (SITIO / "pobreza").glob("*.html"):
    _t = _pb.read_bytes()
    _n = re.sub(rb",\s*maximum-scale=1(\.0)?", b"", _t)
    if _n != _t:
        _pb.write_bytes(_n)
# Explorador de relaciones (plan Datina Lab): de dónde sale cada número. Página aparte que arma scripts/relaciones.py desde el catálogo
# datos/manual/relaciones.json. Si el catálogo tiene un error (una relación sin evidencia, una ficha sin origen), el sitio no se arma.
import relaciones  # noqa: E402
import prueba_relaciones  # noqa: E402
# antes, las pruebas del propio validador: el catálogo roto a propósito de varias formas tiene que dar error
_rx = prueba_relaciones.correr(mostrar=False)
if _rx:
    sys.exit("El validador del Explorador de relaciones no marcó un error que debía marcar: el sitio no se armó.\n" + "\n".join(_rx))
_rx = relaciones.construir(plantilla, base, SECCIONES, UBIC, huella(css))
if _rx:
    sys.exit("El catálogo del Explorador de relaciones tiene problemas: el sitio no se armó.\n" + "\n".join(_rx))
# el Explorador de relaciones lo arma relaciones.py: acá recibe los mismos metadatos que las demás páginas
_rxp = SITIO / "relaciones.html"
_rxh = _rxp.read_text(encoding="utf-8")
if 'property="og:title"' not in _rxh:
    _rxd = html.unescape(re.search(r'<meta name="description" content="([^"]*)"', _rxh).group(1))
    _rxh = _rxh.replace('<meta name="description"', metadatos("relaciones", "Explorador de relaciones: ¿de dónde sale cada número?", _rxd, "website") + '\n<meta name="description"', 1)
    _rxp.write_text(_rxh, encoding="utf-8")
# sitemap.xml y robots.txt solo con la dirección definitiva (datos/manual/sitio.json). Sin ella se borran, si quedaron de antes
for _f in ("sitemap.xml", "robots.txt"):
    (SITIO / _f).unlink(missing_ok=True)
if URL_SITIO:
    (SITIO / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
                                     "".join(f"  <url><loc>{URL_SITIO}/{a}</loc></url>\n" for a in INDEXADAS) + "</urlset>\n", encoding="utf-8")
    (SITIO / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {URL_SITIO}/sitemap.xml\n", encoding="utf-8")
# metadatos y enlaces internos (scripts/prueba_metadatos.py): si algo falla, el sitio no se da por armado
import prueba_metadatos
_met = prueba_metadatos.revisar(URL_SITIO)
if _met:
    sys.exit("Metadatos o enlaces con problemas: el sitio no se dio por armado.\n" + "\n".join(_met))
# un h1 por página (scripts/prueba_encabezados.py): si una página lo pierde, el sitio no se da por armado
import prueba_encabezados
_enc, _, _, _ = prueba_encabezados.revisar()
if _enc:
    sys.exit("Encabezados con problemas: el sitio no se dio por armado.\n" + "\n".join(_enc))
print(f"Listo: sitio/index.html, {len(SECCIONES)} paginas de seccion y {len(NOTAS)} articulos" + (" y sitio/pobreza/" if dist.exists() else ""))
