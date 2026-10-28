"""
Paso 3. Arma las paginas.
Escribe sitio/datos/fichas.js (los datos de sitio/datos/fichas.json y el indice del sitio, compartidos por todas las paginas),
sitio/datina.css y sitio/datina.js (el diseño y el comportamiento, tambien compartidos)
y una pagina por seccion a partir de scripts/plantilla.html: sitio/index.html (portada) y sitio/{seccion}.html.
Cada pagina lleva solo el marcado de su seccion. Lo que necesita saber de las demas (titulos, fichas, en que pagina
esta cada ancla) lo lee del indice del sitio, que se arma aca desde la plantilla.
La explicacion de cada seccion (que se mide, desde cuando, como se calcula) sale de datos/manual/explicadores.json.
Tambien copia la tabla larga al sitio para que se pueda descargar.
El sitio de consultas de pobreza ya construido (pobreza/dist) se copia a sitio/pobreza/ solo con --con-pobreza (pobreza/README.md).
Uso: python scripts/03_construir_sitio.py [--con-pobreza]
"""
import csv, datetime, hashlib, html, json, math, pathlib, re, shutil, sys

RAIZ = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RAIZ / "scripts"))
import consultor_pobreza  # noqa: E402
import frescura  # noqa: E402
import prueba_frescura  # noqa: E402
# la regla del aviso de dato atrasado (T3) se prueba antes de armar: si falla, el sitio no se arma
_fr, _ = prueba_frescura.revisar()
if _fr:
    sys.exit("La prueba de la frescura de las fichas falla (scripts/prueba_frescura.py): el sitio no se armó.\n  " + "\n  ".join(_fr))
import prueba_nombres  # noqa: E402
# y la de los nombres de legisladores y bloques (R10), que escribe 02_procesar.py: si falla, tampoco
_nm, _ = prueba_nombres.revisar()
if _nm:
    sys.exit("La prueba de los nombres del Congreso falla (scripts/prueba_nombres.py): el sitio no se armó.\n  " + "\n  ".join(_nm))
# --con-pobreza copia el armado del consultor de pobreza (pobreza/dist) a sitio/pobreza/. Sin ella, sitio/pobreza/ no se toca
OPCIONES = {"--con-pobreza"}
if _otras := [a for a in sys.argv[1:] if a not in OPCIONES]:
    sys.exit(f"Opción desconocida: {' '.join(_otras)}. Uso: python scripts/03_construir_sitio.py [--con-pobreza]")
CON_POBREZA = "--con-pobreza" in sys.argv[1:]
DIST_POBREZA = RAIZ / "pobreza" / "dist"
if CON_POBREZA and not consultor_pobreza.hay_armado(DIST_POBREZA):
    sys.exit("--con-pobreza: no hay un armado del consultor en pobreza/dist (falta index.html). "
             "Armarlo antes con npm run build dentro de pobreza/ (ver pobreza/README.md). El sitio no se armó.")
# Antes de armar nada, las pruebas de los datos (scripts/pruebas_datos.py): si alguna falla, el sitio no se arma ni se publica
import pruebas_datos  # noqa: E402
if pruebas_datos.correr(mostrar=False):
    pruebas_datos.correr(mostrar=True)
    sys.exit("Las pruebas de los datos encontraron problemas sin explicar: el sitio no se armó. Ver arriba.")
# y la de la copia del consultor de pobreza (scripts/prueba_pobreza.py): un armado normal no puede reemplazar sitio/pobreza/
import prueba_pobreza  # noqa: E402
if _pp := prueba_pobreza.correr(mostrar=False):
    sys.exit("La copia del consultor de pobreza no se comporta como debe: el sitio no se armó.\n" + "\n".join(_pp))
SITIO = RAIZ / "sitio"
# si el armado frena a mitad de camino (una comprobación de las de más abajo, o un error), sitio/ vuelve a quedar como estaba antes de
# empezar, en lugar de quedar armado a medias (scripts/respaldo_sitio.py, estabilización P2-3)
import respaldo_sitio  # noqa: E402
respaldo_sitio.guardar(SITIO)
huella = lambda t: hashlib.sha1(t.encode("utf-8")).hexdigest()[:10]
e = lambda t: html.escape(str(t), quote=True)
texto = lambda h: re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", h))).strip()

plantilla = (RAIZ / "scripts" / "plantilla.html").read_text(encoding="utf-8")
# Consultas con IA (25 de octubre de 2026, pedido del autor, docs/ia/CONSULTAS.md): la página, su índice y su código van solo con
# "consulta_ia": true en datos/manual/sitio.json. Apagadas, la sección de la plantilla (entre <!--IA--> y <!--/IA-->) no llega a ninguna
# página, no va en los menús y se borra lo que haya quedado en sitio/ de un armado anterior
CONSULTA_IA = json.loads((RAIZ / "datos" / "manual" / "sitio.json").read_text(encoding="utf-8")).get("consulta_ia", False)
assert CONSULTA_IA in (True, False), 'datos/manual/sitio.json: "consulta_ia" tiene que ser true o false'
# el motor (26 de octubre de 2026, docs/ia/CONSULTAS.md): "cloudflare", los modelos abiertos y gratis de Cloudflare Workers AI, sin clave,
# o "anthropic", Claude con la clave del autor. La función lo lee en el índice y la página cambia sus avisos
MOTOR_IA = json.loads((RAIZ / "datos" / "manual" / "sitio.json").read_text(encoding="utf-8")).get("consulta_ia_motor", "anthropic")
assert MOTOR_IA in ("anthropic", "cloudflare"), 'datos/manual/sitio.json: "consulta_ia_motor" tiene que ser "anthropic" o "cloudflare"'
_ia = re.search(r"\n\n *<!--IA-->.*?<!--/IA-->", plantilla, re.S)
assert _ia, "falta la sección de las consultas con IA (entre <!--IA--> y <!--/IA-->) en scripts/plantilla.html"
plantilla = plantilla.replace(_ia.group(0), re.sub(r"<!--/?IA-->", "", _ia.group(0)) if CONSULTA_IA else "")
if CONSULTA_IA:
    _herr_sub = '<p class="bloque-sub">Para cruzar indicadores,'
    assert plantilla.count(_herr_sub) == 1, "cambió la bajada de Herramientas en la portada: revisar la de las consultas con IA"
    plantilla = plantilla.replace(_herr_sub, '<p class="bloque-sub">Para hacerles preguntas a los datos, cruzar indicadores,')
    if MOTOR_IA == "cloudflare":
        for _v, _n in [("No escribas datos personales: para contestarla, la pregunta se envía a Anthropic, la empresa que hace el modelo. Datina no la guarda.",
                        "No escribas datos personales. La pregunta la contesta un modelo abierto de inteligencia artificial que corre en Cloudflare, "
                        "la empresa que aloja el sitio. Según su política, Cloudflare no usa las preguntas para entrenar modelos. Datina no las guarda. Las consultas son gratis y tienen un tope diario para todo el sitio."),
                       ("Las respuestas las escribe un modelo de inteligencia artificial (Claude, de Anthropic) con los datos de Datina.",
                        "Las respuestas las escribe un modelo de inteligencia artificial con los datos de Datina.")]:
            assert plantilla.count(_v) == 1, f"cambió un aviso de la página de las consultas con IA: {_v[:60]}"
            plantilla = plantilla.replace(_v, _n)
# "Tus datos", en Sobre nosotros (auditoría del 26 de octubre de 2026, E9): adónde va la pregunta de las consultas con IA, según el motor
# (docs/ia/CONSULTAS.md, "Privacidad"). Con las consultas apagadas, el párrafo no va
_IA_PRIV = {"cloudflare": "<p>Las preguntas de Consultas con IA las contesta un modelo que corre en Cloudflare, la empresa que aloja el sitio. "
                          "Según su política, Cloudflare no usa esas preguntas para entrenar modelos. Datina no las guarda. "
                          "No escribas datos personales en una pregunta.</p>",
            "anthropic": "<p>Las preguntas de Consultas con IA viajan a Anthropic, la empresa del modelo que las contesta. Datina no las guarda. "
                         "No escribas datos personales en una pregunta.</p>"}
assert plantilla.count("<!--IA-PRIVACIDAD-->") == 1, "falta la marca <!--IA-PRIVACIDAD--> en Tus datos (Sobre nosotros)"
plantilla = plantilla.replace("<!--IA-PRIVACIDAD-->", _IA_PRIV[MOTOR_IA] if CONSULTA_IA else "")
JS_IA = (RAIZ / "scripts" / "consulta_ia.js").read_text(encoding="utf-8")
plantilla = plantilla.replace("__V_IA_JS__", hashlib.sha1(JS_IA.encode("utf-8")).hexdigest()[:10])
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


# el último período de cada ficha, de su descripción con {{ruta}} (T3, frescura): se lee antes de completar las rutas
PERIODO_FICHA = {i: frescura.periodos_de(sub, RESUMEN) for i, sub in re.findall(
    r'<article class="ficha[^"]*" id="(f-[^"]+)">(?:(?!</article>).)*?<p class="ficha-sub">(.*?)</p>', plantilla, re.S)}
plantilla = re.sub(r"\{\{([\w.]+)\}\}", dato_resumen, plantilla)

# Cada cuánto se actualiza el dato de cada ficha (etapa 27, pedido del autor, como USAFacts): una frase después de la fuente, en el pie, que
# está siempre a la vista. Es la frecuencia con la que el sitio recibe datos nuevos de la fuente. Toda ficha nueva necesita la suya, o el sitio
# no se arma. Las herramientas (fichas "explorador": Cruces, Tu índice, Departamentos y Diagnóstico) no llevan.
FRASE_FRECUENCIA = {
    "mes": "Se actualiza cada mes.", "trimestre": "Se actualiza cada tres meses.", "semestre": "Se actualiza cada seis meses.",
    "anio": "Se actualiza cada año.", "censo": "Se actualiza con cada censo.", "eleccion": "Se actualiza con cada elección.",
    "congreso": "Se actualiza con cada renovación del Congreso.", "aprender": "Se actualiza con cada evaluación Aprender.",
    "pisa": "Se actualiza con cada evaluación PISA.", "leyes": "Se actualiza cuando se suma una ley o un proyecto a la selección.",
    "presidente": "Se actualiza con cada cambio de presidente.", "gabinete": "Se actualiza con cada cambio de gabinete.",
    "onu": "Se actualiza cada cuatro o cinco años.", "inventario": "Se actualiza con cada inventario.",
    "pausa": "La encuesta está en pausa: el INDEC la está reformulando.",
    "padron": "Se actualiza cuando el Ministerio de Justicia publica un padrón nuevo.",
    "ultimo": "Es el último dato que publicó la fuente.",
}
FRECUENCIA = {
    # Trabajo
    "f-empleo": "mes", "f-salarios": "trimestre", "f-rotacion": "trimestre", "f-exportaciones": "semestre",
    # Sector externo
    "f-balanza": "mes", "f-exporta-rubros": "mes", "f-complejos": "semestre", "f-destinos": "semestre", "f-exporta-provincias": "anio",
    "f-importaciones": "mes", "f-origen": "mes", "f-cuenta-corriente": "trimestre", "f-reservas-bcra": "mes", "f-reservas-netas": "mes",
    # Economía y precios
    "f-inflacion": "mes", "f-inflacion-rubros": "mes", "f-canastas": "mes", "f-salario-real": "mes", "f-emae": "mes", "f-supermercados": "mes", "f-bcra": "mes", "f-expectativas": "mes", "f-confianza-consumidor": "mes",
    # Empresas y oportunidades
    "f-empresas": "anio", "f-empresas-tamano": "anio", "f-dinamica-empresas": "anio",
    # Pobreza y hogares
    "f-pobreza": "semestre", "f-ingresos-aglomerados": "trimestre", "f-censo": "censo", "f-internet": "trimestre",
    # Salud
    "f-esperanza": "censo", "f-cobertura": "censo", "f-causas-muerte": "anio", "f-mortalidad": "anio", "f-causas-infantiles": "anio", "f-muertes": "anio", "f-suicidio": "anio",
    "f-suicidio-prov": "anio", "f-edad": "anio",
    # Seguridad
    "f-delitos": "anio", "f-robos": "anio", "f-homicidios": "anio", "f-carceles": "anio", "f-sin-condena": "anio",
    # Educación
    "f-escolarizacion": "anio", "f-aprender": "aprender", "f-pisa": "pisa", "f-salario-docente": "trimestre", "f-inversion-educativa": "anio",
    # Población
    "f-nacimientos": "anio", "f-poblacion-proy": "anio", "f-piramide": "anio", "f-envejecimiento": "anio", "f-jubilaciones": "trimestre", "f-haberes": "trimestre", "f-pensiones-invalidez": "trimestre", "f-auh": "trimestre", "f-desocupacion": "trimestre", "f-pobreza-aglomerados": "semestre", "f-desempleo": "trimestre", "f-adolescentes": "anio",
    "f-adolescentes-nse": "anio",
    # Migraciones
    "f-nacidos-otro-pais": "censo", "f-migracion-interna": "censo", "f-migracion-historia": "censo", "f-extranjeros": "anio",
    "f-radicaciones": "anio", "f-refugio": "anio", "f-argentinos-exterior": "onu",
    # Política
    "f-elecciones": "eleccion", "f-legisladores": "congreso", "f-anios-congreso": "congreso", "f-representacion": "anio", "f-congreso": "congreso", "f-votaciones": "leyes",
    "f-votaciones-espacios": "leyes", "f-voto-provincia": "eleccion", "f-atn": "anio", "f-transferencias": "anio", "f-apoyo": "anio", "f-presupuesto": "anio",
    "f-presidentes": "presidente", "f-ministros": "gabinete", "f-confianza-gobierno": "mes",
    "f-corte-casos": "anio", "f-jueces-federales": "padron", "f-fiscalias-federales": "ultimo",
    "f-cortes-provinciales": "anio", "f-justicia-provincial": "anio",
    # Gobierno
    "f-cuentas-nacion": "mes", "f-recaudacion": "mes", "f-deuda": "trimestre", "f-empleo-publico": "anio", "f-impuestos-provinciales": "anio", "f-coparticipacion": "anio",
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
# Frescura (plan de mejora, T3, 27 de octubre de 2026, aprobado por el autor): si el último período de una ficha está más atrasado
# que el doble de su frecuencia frente a la última actualización de los datos, el pie lo dice después de la frecuencia
# (scripts/frescura.py). No frena el armado. DEMORA_HABITUAL suma meses a las fichas cuya fuente ya tenía ese atraso el 24 de
# octubre de 2026, el día de la última actualización: el aviso sale si se atrasan más. SIN_FRESCURA son las fichas cuyo período no
# dice hasta cuándo llega el dato
DEMORA_HABITUAL = {
    "f-empleo": 2,                 # el SIPA por provincia llegaba a junio de 2026 (4 meses)
    "f-ingresos-aglomerados": 1,   # la EPH llegaba al primer trimestre de 2026 (7 meses)
    "f-permisos": 1,               # los permisos de edificación llegaban a julio de 2026 (3 meses)
    "f-empleo-construccion": 1,    # el empleo registrado por rama llegaba al primer trimestre de 2026 (7 meses)
    "f-empleo-hidro": 1,           # el mismo dato que la anterior, para petróleo y gas
}
SIN_FRESCURA = {
    "f-parques": "el año de la descripción es el de creación del último parque, no el del dato",
}
_fichas = re.findall(r'<article class="(ficha[^"]*)" id="(f-[^"]+)"', plantilla)
_herramientas = {i for c, i in _fichas if "explorador" in c.split()}
_faltan = [i for c, i in _fichas if i not in _herramientas and i not in FRECUENCIA]
_sobran = [i for i in FRECUENCIA if i not in {j for _, j in _fichas} or i in _herramientas or FRECUENCIA[i] not in FRASE_FRECUENCIA]
if _faltan or _sobran:
    sys.exit(f"Frecuencia de actualización: faltan {_faltan} y sobran o no tienen frase {_sobran} (FRECUENCIA en 03_construir_sitio.py).")
_sobran = [i for i in {**DEMORA_HABITUAL, **SIN_FRESCURA} if i not in FRECUENCIA]
if _sobran:
    sys.exit(f"Frescura: {_sobran} no son fichas con frecuencia (DEMORA_HABITUAL y SIN_FRESCURA en 03_construir_sitio.py).")
ATRASADAS = []


def aviso_atraso(ident):
    """La frase del pie si el dato de la ficha está atrasado (T3), o nada."""
    p = None if ident in SIN_FRESCURA else PERIODO_FICHA.get(ident)
    meses = frescura.atraso(p, FRECUENCIA[ident], RESUMEN["actualizado"], DEMORA_HABITUAL.get(ident, 0))
    if not meses:
        return ""
    ATRASADAS.append(f"{ident} ({p[3]}, {meses} meses)")
    de = "del" if p[3].split()[0] in ("primer", "segundo", "tercer", "cuarto") or "º" in p[3].split()[0] else "de"
    return f" El último dato es {de} {p[3]}, más atrasado que lo habitual."


def con_frecuencia(m):
    """La frase de la frecuencia después de la fuente del pie de cada ficha."""
    clase, ident, cuerpo = m.group(1), m.group(2), m.group(3)
    if ident in _herramientas:
        return m.group(0)
    pie = re.search(r'(<div class="pie"><span>)([^<]*)(</span>)', cuerpo)
    if not pie:
        sys.exit(f"La ficha {ident} no tiene la fuente en el pie: no se puede sumar la frecuencia.")
    fuente = pie.group(2).rstrip()
    nuevo = f"{pie.group(1)}{fuente}{'' if fuente.endswith('.') else '.'} {FRASE_FRECUENCIA[FRECUENCIA[ident]]}{aviso_atraso(ident)}{pie.group(3)}"
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
        f'<div class="exp-fila"><h3><button type="button" class="despliegue" id="exp-{sec}-{i}-b" aria-expanded="false" aria-controls="exp-{sec}-{i}">'
        f'<span>{e(t)}</span><span class="desp-signo" aria-hidden="true"></span></button></h3>'
        f'<div class="exp-bloque" id="exp-{sec}-{i}" role="region" aria-labelledby="exp-{sec}-{i}-b"><div class="exp-cont">{c}</div></div></div>'
        for i, (t, c) in enumerate(partes))
    return ('<div class="explicador" id="para-entender"><div class="exp-cab"><h2 class="bloque-grupo">Para entender los datos</h2>'
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
        f'<article class="programa"><h3>{e(x["nombre"])}</h3><p class="programa-donde">{e(x["donde"])}</p><p>{e(x["que_hace"])}</p><dl>'
        f'<div><dt>Evaluación</dt><dd>{e(x["evaluacion"]["tipo"])}<small>{e(x["evaluacion"]["organismo"])}, {x["evaluacion"]["anio"]}</small></dd></div>'
        f'<div><dt>Qué encontró</dt><dd>{e(x["hallazgo"])}</dd></div><div><dt>Qué no permite concluir</dt><dd>{e(x["limites"])}</dd></div></dl>'
        f'<a class="enlace" href="{e(x["evaluacion"]["url"])}" target="_blank" rel="noopener">{e(x.get("enlace", "Leer la evaluación"))}</a></article>' for x in PROG)
    return ('<section class="programas" aria-labelledby="prog-tit"><h2 class="bloque-grupo" id="prog-tit">Programas con evaluación oficial</h2>'
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
    '<h2>Las banderas</h2><p>Las banderas de las provincias y la nacional vienen de Wikimedia Commons, el archivo de imágenes libres de Wikipedia, '
    'y se muestran en miniatura, todas con el mismo tamaño y el mismo recorte.</p>'
    f'<details class="glosario creditos"><summary>Autores y licencias</summary><ul>{creditos}</ul></details>')

# Historia de cada jurisdicción en Tu provincia (11 de octubre de 2026, pedido del autor: "cuando entro a una provincia pongas año de
# fundación, antecedente, a las que corresponda si formó parte de las guerras civiles y la formación del estado nacional argentino, un
# breve resumen de quiénes fueron y son, cantidad de habitantes y algún fun fact"). Los textos y sus fuentes están en
# datos/manual/provincias_historia.json. Los habitantes salen de los datos: la proyección del INDEC (base Censo 2022) del año de la
# población que usa todo el sitio. Se escribe un bloque por jurisdicción, oculto, y datina.js muestra el de la provincia elegida. Si un
# texto rompe las reglas de redacción o le falta su fuente, el sitio no se arma
HISTORIA = json.loads((RAIZ / "datos" / "manual" / "provincias_historia.json").read_text(encoding="utf-8"))["provincias"]
_fj = json.loads((SITIO / "datos" / "fichas.json").read_text(encoding="utf-8"))
HAB = {f["codigo_indec"]: f["poblacion"] for f in _fj["datos"]["empleo_provincias"] if f.get("poblacion")}
HAB_ANIO = _fj["resumen"]["anio_pob"]
_H_CAMPOS = [("fundacion_capital", "La capital"), ("provincia_desde", "La provincia"), ("antecedente", "Antecedentes"),
             ("guerras_civiles", "Guerras civiles"), ("quienes", "Quiénes"), ("curiosidad", "Dato curioso")]
_h_txt = lambda h, k: ((h.get(k) or {}).get("texto") if isinstance(h.get(k), dict) else h.get(k)) or ""
_h_err = []
for _c, _h in sorted(HISTORIA.items()):
    if _c not in NOMBRE_PROV or _c == "00":
        _h_err.append(f"{_c}: no es un código de jurisdicción")
        continue
    _datos = {f.get("dato") for f in _h.get("fuentes", []) if f.get("url", "").startswith("https://")}
    for _k, _ in _H_CAMPOS:
        _t = _h_txt(_h, _k)
        if not _t:
            continue
        if ";" in _t or "!" in _t:
            _h_err.append(f"{_c} {_k}: tiene punto y coma o signo de exclamación")
        if len(_t.split()) >= 70:
            _h_err.append(f"{_c} {_k}: tiene {len(_t.split())} palabras (el máximo es 69)")
        if re.search(r"\sy\s+(?:[iíIÍ]|[hH][iíIÍ](?![aeouáéóú]))", _t):
            _h_err.append(f"{_c} {_k}: 'y' delante del sonido de la i (va 'e')")
        if _k not in _datos:
            _h_err.append(f"{_c} {_k}: no tiene fuente (https) en 'fuentes'")
if _h_err:
    sys.exit("La historia de las provincias (datos/manual/provincias_historia.json) tiene problemas: el sitio no se armó.\n" + "\n".join(_h_err))
_miles = lambda x: f"{int(round(x)):,}".replace(",", ".")


def historia_prov(c, h):
    """El bloque de una jurisdicción: el texto a la izquierda y los datos básicos y el dato curioso al costado."""
    fc, pd = h.get("fundacion_capital") or {}, h.get("provincia_desde") or {}
    datos = []
    if fc.get("ciudad") and fc.get("anio"):
        datos.append(("Ciudad" if c == "02" else "Capital", f'{fc["ciudad"]}, fundada en {fc["anio"]}', ""))
    if pd.get("anio"):
        datos.append(("Autonomía desde" if c == "02" else "Provincia desde", str(pd["anio"]), ""))
    if c in HAB:
        datos.append(("Habitantes", f"{_miles(HAB[c])} en {HAB_ANIO}", "Proyección del INDEC, base Censo 2022"))
    partes = [("La ciudad y su autonomía" if c == "02" else "La capital y la provincia", " ".join(t for t in (fc.get("texto"), pd.get("texto")) if t)), ("Antecedentes", h.get("antecedente")),
              ("Guerras civiles y formación del Estado", h.get("guerras_civiles")), ("Quiénes fueron y quiénes son", h.get("quienes"))]
    texto_h = "".join(f'<h3 class="ph-sub">{e(t)}</h3><p>{e(p)}</p>' for t, p in partes if p)
    if not texto_h:
        return ""
    dl = "".join(f'<div><dt>{e(k)}</dt><dd>{e(v)}{f"<small>{e(s)}</small>" if s else ""}</dd></div>' for k, v, s in datos)
    cur = (f'<div class="ph-curiosidad"><p class="ph-sub">Dato curioso</p><p>{e(h["curiosidad"])}</p></div>' if h.get("curiosidad") else "")
    nombres = dict(_H_CAMPOS, **({"fundacion_capital": "La ciudad", "provincia_desde": "La autonomía"} if c == "02" else {}))
    fuentes = "".join(f'<li><span class="ph-dato">{e(nombres.get(f.get("dato"), ""))}</span> <a href="{e(f["url"])}" target="_blank" rel="noopener">'
                      f'{e(f.get("titulo") or f["url"])}</a></li>' for f in h.get("fuentes", []) if f.get("url", "").startswith("https://"))
    return (f'<article class="ph" data-c="{c}" aria-labelledby="ph-{c}" hidden><h2 class="ph-tit" id="ph-{c}">¿De dónde viene {e(NOMBRE_PROV[c])}?</h2>'
            f'<div class="ph-cuerpo"><div class="ph-texto">{texto_h}</div><aside class="ph-lado" aria-label="Datos básicos">'
            f'<dl class="ph-datos">{dl}</dl>{cur}</aside></div>'
            f'<details class="ph-fuentes"><summary>Fuentes</summary><p>Textos de Datina a partir de sitios oficiales de cada provincia y del '
            f'Estado nacional, sitios municipales, leyes y trabajos de universidades públicas y del CONICET, entre otras fuentes. Delante de cada fuente figura el apartado del texto que respalda. Los habitantes salen de la proyección de población del INDEC, base Censo 2022.</p><ul>{fuentes}</ul></details></article>')


assert base.count("<!--HISTORIA-->") == 1
# el bloque de la provincia del enlace (o la recordada) se muestra apenas se lee, antes de que se vea la página: si lo mostrara datina.js
# al final, el perfil de abajo saltaba al aparecer (CLS de 0,30 con CABA). La misma regla de datina.js (leerProv), que después lo mantiene
_HIST_YA = ('<script>(()=>{const l=s=>new URLSearchParams(s).get("prov");let c=l(location.search)||l(location.hash.split("?")[1]||"");'
            'try{c=c||localStorage.getItem("prov")}catch(_){}const a=c&&document.querySelector(\'#prov-historia .ph[data-c="\'+c+\'"]\');'
            'if(a)a.hidden=false})()</script>')
base = base.replace("<!--HISTORIA-->", '<div class="prov-historia" id="prov-historia">'
                    + "".join(historia_prov(c, HISTORIA[c]) for c in sorted(HISTORIA)) + "</div>" + _HIST_YA)

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
                    "destacados": "inicio", "provincias-home": "inicio",
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
        h3 = re.search(r"<h2([^>]*)>(.*?)</h2>", m.group(3), re.S)
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
        # la fuente del pie ("Fuente: ..." o "Fuentes: ..."), para la respuesta rápida del buscador (26 de octubre de 2026)
        fu = re.search(r'<div class="pie"><span>(Fuentes?: .*?)</span>', m.group(3), re.S)
        # [id, sección, título fijo, clave del título calculado, clave del texto, explorador, después de las líneas de ayuda,
        #  descripción fija, clave de la descripción calculada, fuente]
        FICHAS.append([m.group(2), b["id"], texto(h3.group(2)) if h3 else "", kt.group(1) if kt else "", kl.group(1) if kl else "",
                       int(explorador), int(0 <= ayuda < m.start()), texto(sub.group(2)) if sub else "", (sub.group(1) or "") if sub else "",
                       texto(fu.group(1)) if fu else ""])
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
# Argentina por tema"). Un elemento de un grupo es una sección o una categoría: un nombre y sus secciones, la primera
# es su página de entrada. Cada sección conserva su página y su dirección. De acá salen el menú "Temas", la fila del celular, las
# migas, la fila de cada categoría, el mapa del pie, el recorrido de "Seguí explorando" y los grupos de la portada
# Fase 2 (respuestas del autor del 23 de octubre de 2026): Personas pasa a llamarse Personas y bienestar, Turismo pasa a Trabajo y economía
# (mide una actividad económica) y Curiosidades a Historias con datos (MENUS, abajo). Cuentas públicas se queda donde está
GRUPOS = [
    ("personas", "Personas y bienestar", [("Población", ["poblacion", "migraciones"]), "salud", "educacion", "pobreza"]),
    # Sector externo, desde el 11 de octubre de 2026 (pedido del autor: "meté una nueva categoría en trabajo y economía que se llame sector externo")
    ("economia", "Trabajo y economía", ["trabajo", ("Economía", ["economia", "empresas", "construccion", "gobierno"]), "externo", "turismo"]),
    ("estado", "Estado y sociedad", ["politica", "justicia", "seguridad"]),
    ("territorio", "Territorio y recursos", [("Energía", ["energia", "petroleo"]), "movilidad", "naturaleza"]),
]
# La barra (Fase 2, respuesta del autor del 23 de octubre de 2026: "Temas, Provincias, Historias, Herramientas"): "Temas" abre los cuatro
# grupos de arriba en columnas, como la portada, y los otros tres menús salen de MENUS. Reemplaza los "4 grupos con menú" y "Más" de la
# etapa 39. Cada menú: id, nombre en la barra, nombre completo (pie, migas y filtros del catálogo), adónde lleva donde no hay menú (el
# Explorador de relaciones) y sus páginas. Una tupla es un subgrupo con su nombre. Las 24 jurisdicciones del menú Provincias (respuesta
# del autor del mismo día) las agrega la barra
MENUS = [
    ("provincias", "Provincias", "Provincias", "provincia.html", ["provincia", "departamentos"]),
    ("historias", "Historias", "Historias con datos", "articulos.html", ["articulos", "laboratorio", "corte-suprema", "curiosidades"]),
    ("herramientas", "Herramientas", "Herramientas", "./#herr-titulo", ["consulta-ia"] * CONSULTA_IA + ["cruces", "indice", "diagnostico", "consultor",
                                                                         ("Los datos", ["catalogo", "relaciones"])]),
]
_secs_de = lambda items: [s for it in items for s in (it[1] if isinstance(it, tuple) else [it])]
CATEGORIA = {s: (it[0], it[1]) for _, _, items in GRUPOS for it in items if isinstance(it, tuple) for s in it[1]}
ORDEN_TEMAS = [s for _, _, items in GRUPOS for it in items for s in (it[1] if isinstance(it, tuple) else [it])]
GRUPO_DE = {s: (g, n) for g, n, items in GRUPOS for s in _secs_de(items)}
MENU_DE = {p: (m, completo) for m, _, completo, _, items in MENUS for p in _secs_de(items)}
_temas = [x[0] for x in SECCIONES if not x[4] and x[0] != "articulos"]
assert sorted(ORDEN_TEMAS + [p for p in MENU_DE if p in _temas]) == sorted(_temas), \
    f"las secciones y los menús no coinciden: {set(ORDEN_TEMAS + list(MENU_DE)) ^ set(_temas)}"
HERRAMIENTAS = [x[0] for x in SECCIONES if x[4]]
assert set(HERRAMIENTAS) <= set(MENU_DE), f"herramientas sin menú: {set(HERRAMIENTAS) - set(MENU_DE)}"
# las páginas de los menús que arma la plantilla como sección, más Tu provincia y el Laboratorio (las demás son el Explorador, el consultor
# de pobreza y la pieza de la Corte Suprema): en ese orden van el recorrido y los filtros del catálogo
PAGINAS_MENU = [p for p in _secs_de([it for m in MENUS for it in m[4]]) if p in {x[0] for x in SECCIONES} | {"provincia", "laboratorio"}]
# Preguntas de ejemplo (Fase 2, paso 2): tres de la lista de preguntas del buscador (PREG en datina.js), de temas distintos y que no
# repiten los datos destacados. Las ofrece el buscador con el campo vacío y cuando no encuentra nada. Desde el 25 de octubre de 2026
# (pedido del autor) ya no van escritas debajo del buscador de la portada
EJEMPLOS = [("f-combustibles", "¿Cuánto cuesta un litro de nafta?"), ("f-censo", "¿Qué parte de los hogares tiene cloacas?"),
            ("f-glaciares", "¿Qué provincia tiene más glaciares?")]
# las piezas del Laboratorio que viven en laboratorio.html (la de la Corte Suprema tiene página propia): su ancla y su título, para el buscador
LAB_PIEZAS_IDX = [(i, texto(t)) for i, t in re.findall(r'<article class="lab-pieza[^"]*" id="(l-[\w-]+)".*?<h2[^>]*>(.*?)</h2>', base, re.S)
                  if i != "l-corte-lab"]
assert LAB_PIEZAS_IDX, "no se encontraron las piezas del Laboratorio para el buscador"
# el índice del sitio que lee datina.js. Desde la Fase 2 (paso 3) también lleva el menú de cada página (el buscador agrupa los resultados
# como la barra), las preguntas de ejemplo y las piezas del Laboratorio
INDICE = {"secciones": SECCIONES, "fichas": FICHAS, "articulos": [[i, html.unescape(t), ico, sec] for i, ico, sec, t in NOTAS], "ubic": UBIC,
          "grupos": [[g, n, [list(it) if isinstance(it, tuple) else it for it in items]] for g, n, items in GRUPOS],
          "cat": {s: subs[0] for s, (_, subs) in CATEGORIA.items()},
          "menu": {p: m for p, (m, _) in MENU_DE.items()}, "ejemplos": [list(x) for x in EJEMPLOS], "lab": [list(x) for x in LAB_PIEZAS_IDX]}
# con las consultas con IA prendidas, el buscador ofrece llevar lo escrito a la página de las consultas (datina.js, buscar)
if CONSULTA_IA:
    INDICE["ia"] = 1

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
             "migraciones_departamentos", "supermercados_mensual", "corte_jueces", "corte_composicion", "corte_presidentes", "bcra_variables"]
D = json.loads((SITIO / "datos" / "fichas.json").read_text(encoding="utf-8"))
D["diferidas"] = {}
for nombre in DIFERIDAS:
    filas = D["datos"].pop(nombre)
    assert isinstance(filas, list), nombre
    # en columnas, con cada nombre una sola vez (etapa 19): pesa bastante menos que una lista de objetos, y datina.js vuelve a armar
    # los objetos al cargarla (deColumnas)
    cols = list(dict.fromkeys(k for f in filas for k in f))
    t = json.dumps({"c": cols, "f": [[f.get(k) for k in cols] for f in filas]}, ensure_ascii=False, separators=(",", ":"))
    (SITIO / "datos" / f"{nombre}.json").write_text(t, encoding="utf-8", newline="\n")
    D["diferidas"][nombre] = huella(t)
D["indice"] = INDICE
datos = "window.DATINA=" + json.dumps(D, ensure_ascii=False, separators=(",", ":")) + ";\n"
(SITIO / "datos" / "fichas.js").write_text(datos, encoding="utf-8", newline="\n")

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
             "educacion": "birrete", "poblacion": "personas", "politica": "congreso", "justicia": "balanza", "movilidad": "colectivo", "construccion": "grua", "energia": "rayo", "petroleo": "ciguena", "seguridad": "escudo", "economia": "carrito", "migraciones": "globo", "gobierno": "mastil", "externo": "buque", "turismo": "valija",
             "naturaleza": "andes", "curiosidades": "mate", "cruces": "dispersion", "indice": "podio", "departamentos": "mosaico",
             "diagnostico": "portapapeles", "catalogo": "planilla", "laboratorio": "matraz"} | ({"consulta-ia": "dialogo"} if CONSULTA_IA else {})
SEC_ICONO.update({i: ico for i, ico, _, _ in NOTAS})
SEC_ICONO.update({i: ico for i, ico, _, _ in PIEZAS})
assert set(SEC_ICONO.values()) <= set(ICONOS), set(SEC_ICONO.values()) - set(ICONOS)
import relaciones  # noqa: E402
# Catálogo de datos (11 de octubre de 2026, propuesta aprobada por el autor): la lista de tablas con sus filtros la arma scripts/catalogo.py.
# Si una tabla publicada no tiene dónde se usa o una evidencia de datos/manual/catalogo.json no está en el código, el sitio no se arma.
# Va acá, antes de escribir datina.js, porque el botón "En el catálogo" del pie de cada ficha (pedido del autor del 11 de octubre) solo
# aparece si la tabla de la ficha está en el catálogo (las de suicidio no están)
import catalogo  # noqa: E402
# los filtros por tema del catálogo siguen la barra: los cuatro grupos de Temas y después Provincias, Historias con datos y Herramientas
_menus_catalogo = [(m, completo, [p for p in _secs_de(items) if p in PAGINAS_MENU]) for m, _, completo, _, items in MENUS]
_indice_ia = [] if CONSULTA_IA else None
_catalogo, _cat_err = catalogo.armar(plantilla, SECCIONES, UBIC, GRUPOS + _menus_catalogo, indice=_indice_ia)
if _cat_err:
    sys.exit("El catálogo de datos tiene problemas: el sitio no se armó.\n" + "\n".join(_cat_err))
# Consultas con IA: el índice que lee la función functions/api/consulta.js (las mismas tablas que el Catálogo, sin las de suicidio) y el
# código de la página. Sin "consulta_ia", la función contesta que no están activadas porque no encuentra el índice
_IA_INDICE, _IA_JS = SITIO / "datos" / "consulta_ia.json", SITIO / "consulta-ia.js"
if CONSULTA_IA:
    # sin las tablas que hablan de suicidio, tampoco la de muertes violentas, que los cuenta junto con los homicidios (CLAUDE.md, "Temas
    # sensibles"). La función saca además, de cualquier tabla, las columnas y las filas sobre suicidio
    _indice_ia = [t for t in _indice_ia if not re.search(r"suicid|autoinflig|autolesi", f'{t["tabla"]} {t["titulo"]} {t["descripcion"]}', re.I)]
    for _t in _indice_ia:
        _r = _t.pop("ref")
        _p = UBIC.get(_r[1:], "") if _r.startswith("#") else _r[:-5]
        assert _p, f"consultas con IA: no se sabe en qué página está {_r} ({_t['tabla']})"
        _t["url"] = (f"{_p}.html" if _p != "inicio" else "./") + (f"#{_r[1:]}" if _r.startswith("#") and _r[1:] != _p else "")
    _IA_INDICE.write_text(json.dumps({"actualizado": RESUMEN["actualizado"], "motor": MOTOR_IA, "tablas": _indice_ia}, ensure_ascii=False, separators=(",", ":")),
                          encoding="utf-8", newline="\n")
    _IA_JS.write_text(JS_IA, encoding="utf-8", newline="\n")
else:
    for _f in (_IA_INDICE, _IA_JS, SITIO / "consulta-ia.html"):
        _f.unlink(missing_ok=True)
EN_CATALOGO = sorted(re.findall(r'<li class="cat-item" id="cat-(\w+)"', _catalogo))
for marca, valor in {"/*ICONOS*/{}": ICONOS, "/*SEC_ICONO*/{}": SEC_ICONO, "/*SIN_RELACIONES*/[]": sorted(relaciones.EXCLUIDAS),
                     "/*EN_CATALOGO*/[]": EN_CATALOGO}.items():
    assert marca in js, marca
    js = js.replace(marca, json.dumps(valor, ensure_ascii=False))
(SITIO / "datina.css").write_text(css, encoding="utf-8", newline="\n")
(SITIO / "datina.js").write_text(js, encoding="utf-8", newline="\n")
# D3 y topojson desde el propio sitio (plan de estabilización, P0-1, 22 de octubre de 2026): las mismas versiones que se pedían a cdnjs y
# jsDelivr, copiadas byte por byte de scripts/lib/ a sitio/lib/ con sus licencias, y pedidas con su huella como datina.js
LIBS = {"__V_D3__": "d3-7.8.5.min.js", "__V_TOPOJSON__": "topojson-client-3.1.0.min.js"}
(SITIO / "lib").mkdir(exist_ok=True)
for _lib in (RAIZ / "scripts" / "lib").iterdir():
    shutil.copyfile(_lib, SITIO / "lib" / _lib.name)
V_LIBS = {marca: hashlib.sha1((SITIO / "lib" / nombre).read_bytes()).hexdigest()[:10] for marca, nombre in LIBS.items()}

for marca, valor in {"__VERSION__": huella(datos), "__V_CSS__": huella(css), "__V_JS__": huella(js), **V_LIBS}.items():
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


# Recorrido de "Anterior / Siguiente", en el orden de la barra (Fase 2, 23 de octubre de 2026): los temas, Provincias, Historias con datos
# y Herramientas, y Sobre nosotros. Hasta entonces empezaba por los artículos, el Laboratorio y Tu provincia
ORDEN = ORDEN_TEMAS + PAGINAS_MENU + ["nosotros"]
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
    desc = {"provincia": "Cada provincia frente al país", "nosotros": "Qué es Datina", "articulos": f"{len(NOTAS)} artículos",
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
        for s in ORDEN if s != "nosotros") + "</nav>"


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
        orden = ORDEN_ARTS  # el de la lista de Artículos (etapa 5 del plan de mejora)
        i = orden.index(pagina)
        art = lambda j: orden[j % len(orden)]
        h = h.replace(nota, pildoras("articulos") + migas(("", MENU_DE["articulos"][1]), ("articulos.html", "Artículos"), prov=False) + nota, 1)
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
        blo = re.sub(r"^(<section[^>]*>)", lambda m: m.group(1) + migas(("", MENU_DE["laboratorio"][1]), ("laboratorio.html", "Laboratorio"),
                                                                     prov=False), blo)
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
    # el camino: el grupo de la portada y, en una sección que no es la entrada de su categoría, la categoría. Las páginas de los otros
    # menús van bajo su nombre (Provincias, Historias con datos, Herramientas), como en el pie, y Sobre nosotros y Contacto, solo con Datina
    partes = []
    if pagina in GRUPO_DE:
        partes.append(("./#tg-" + GRUPO_DE[pagina][0], GRUPO_DE[pagina][1]))
        if pagina in CATEGORIA and CATEGORIA[pagina][1][0] != pagina:
            partes.append((url_pagina(CATEGORIA[pagina][1][0]), CATEGORIA[pagina][0]))
    elif pagina in MENU_DE:
        partes.append(("", MENU_DE[pagina][1]))
    blo = blo.replace("<h2", migas(*partes, prov=pagina not in ("nosotros", "contacto")) + "<h2", 1)
    # la fila de la categoría, después de la entrada (datina.js pone "En cifras" después de ella)
    if pagina in CATEGORIA:
        blo = re.sub(r'(<div class="tema-intro">.*?</div>)', lambda m: m.group(1) + subsecciones(pagina), blo, count=1, flags=re.S)
    # el índice de capítulos (etapa 6 del plan de mejora, decisión del autor del 27 de octubre de 2026): en las páginas con dos capítulos o
    # más (h2.bloque-grupo con un id g-…), debajo de "En cifras", con el aspecto del índice del perfil provincial. Nada queda escondido:
    # cada ficha conserva su enlace y el buscador la encuentra
    caps = re.findall(r'<h2 class="bloque-grupo" id="(g-[\w-]+)">([^<]+)</h2>', blo)
    if len(caps) >= 2:
        indice = ('<nav class="perfil-indice capitulos" aria-label="Capítulos de esta página"><ol>' +
                  "".join(f'<li><a class="enlace" href="#{i}">{n}. {t}</a></li>' for n, (i, t) in enumerate(caps, 1)) + "</ol></nav>")
        blo = re.sub(r'(<div class="tema-intro">.*?</div>(?:<nav class="subsecciones".*?</nav>)?)', lambda m: m.group(1) + indice, blo, count=1, flags=re.S)
    # transición entre páginas: el título viaja desde su tarjeta de la portada (mismo nombre en las dos páginas)
    if pagina in [x[0] for x in SECCIONES]:
        blo = re.sub(r"<h2>", f'<h2 style="view-transition-name:t-{pagina}">', blo, count=1)
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


# Mapa del sitio en el pie de todas las páginas, con las mismas partes que la barra (Fase 2, 23 de octubre de 2026): los cuatro grupos
# de Temas, Provincias, Historias con datos, Herramientas y Datina
def lista(items):
    return "<ul>" + "".join(f'<li><a href="{u}">{e(t)}</a></li>' for u, t in items) + "</ul>"


# las páginas de los menús que la plantilla no arma como sección: su dirección y su nombre en los menús
URL_MENU = {"consultor": "pobreza/", "relaciones": "relaciones.html"}
NOMBRE_MENU = {"corte-suprema": "La Corte Suprema", "consultor": "Consultor de pobreza", "relaciones": "Explorador de relaciones"}
url_menu = lambda p: URL_MENU.get(p) or url_pagina(p)
nombre_menu = lambda p: NOMBRE_MENU.get(p) or TITULO_DE[p]
_col = lambda nombre, pares: f'<div class="pie-col"><h2>{e(nombre)}</h2>{lista(pares)}</div>'
MAPA = ("".join(_col(n, [(url_pagina(s), TITULO_DE[s]) for s in _secs_de(items)]) for _, n, items in GRUPOS)
        + "".join(_col(completo, [(url_menu(p), nombre_menu(p)) for p in _secs_de(items)]) for _, _, completo, _, items in MENUS)
        + _col("Datina", [("nosotros.html", "Sobre nosotros"), ("nosotros.html#como-se-hace", "Cómo se hace"),
                          ("nosotros.html#fuentes", "De dónde salen los datos"), ("contacto.html", "Contacto")]))
assert "<!--MAPA-->" in base
base = base.replace("<!--MAPA-->", MAPA)
# La barra (Fase 2, 23 de octubre de 2026): Temas, Provincias, Historias y Herramientas, cada uno con su menú (el mismo código que los
# grupos de la etapa 39). data-secs: las páginas del menú, para marcar el de la página actual. data-ir: adónde lleva donde no hay menú
# (el Explorador de relaciones). Los menús siguen la regla del autor del 4 de octubre de 2026: la letra del texto, un solo tamaño y sin
# negrita. Los nombres de los grupos se ven en gris, con esa misma letra, porque en Temas cuatro columnas sin nombre no se entienden
_FLECHA = '<svg class="mas-flecha" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M2.5 4.5 6 8l3.5-3.5"/></svg>'
_boton = lambda m, nombre, secs, ir: (f'<button type="button" class="menu-btn grupo-btn" id="gb-{m}" aria-expanded="false" aria-controls="gm-{m}" '
                                     f'data-secs="{" ".join(secs)}" data-ir="{ir}">{e(nombre)}{_FLECHA}</button>')
_barra = _boton("temas", "Temas", ORDEN_TEMAS, "./#secciones") + "".join(_boton(m, corto, _secs_de(items), ir) for m, corto, _, ir, items in MENUS)
_li = lambda p, cls="": f'<li{f" class={chr(34)}{cls}{chr(34)}" if cls else ""}><a href="{url_menu(p)}">{e(nombre_menu(p))}</a></li>'


def _items_tema(items):
    """Las secciones de un grupo de Temas. Una categoría lleva a su página de entrada y debajo, un poco adentro, van sus otras secciones.
    Si la entrada no se llama como la categoría (Economía: Precios y actividad), la categoría es un rótulo sin enlace y van todas debajo"""
    sale = ""
    for it in items:
        if not isinstance(it, tuple):
            sale += _li(it)
        elif TITULO_DE[it[1][0]] == it[0]:
            sale += _li(it[1][0]) + "".join(_li(s, "sub") for s in it[1][1:])
        else:
            sale += f'<li class="cat"><span>{e(it[0])}</span></li>' + "".join(_li(s, "sub") for s in it[1])
    return sale


def _grupo(pre, clave, nombre, lis, cls=""):
    """Un grupo de un menú, con su nombre a la vista y su lista (pre distingue los id del menú de la barra y los del celular)"""
    return (f'<div class="menu-grupo"><p class="menu-cab" id="{pre}-{clave}">{e(nombre)}</p>'
            f'<ul{f" class={chr(34)}{cls}{chr(34)}" if cls else ""} aria-labelledby="{pre}-{clave}">{lis}</ul></div>')


_sin_tildes = str.maketrans("ÁÉÍÓÚáéíóúÑñ", "AEIOUaeiouNn")
_PROVS = sorted((c for c in NOMBRE_PROV if c != "00"), key=lambda c: NOMBRE_PROV[c].translate(_sin_tildes))
_li_prov = lambda c: (f'<li><a class="con-bandera" href="provincia.html?prov={c}"><img class="bandera" src="datos/banderas/{c}.png" alt="" '
                      f'width="24" height="16" loading="lazy" decoding="async">{e(NOMBRE_PROV[c])}</a></li>')


def contenido_menu(m, pre):
    """Lo que lleva cada menú: el de la barra y la parte del menú del celular son iguales"""
    if m == "temas":
        return "".join(_grupo(pre, g, n, _items_tema(items)) for g, n, items in GRUPOS)
    items = next(x[4] for x in MENUS if x[0] == m)
    sale = "<ul>" + "".join(_li(p) for p in items if not isinstance(p, tuple)) + "</ul>"
    sale += "".join(_grupo(pre, f"{m}-{i}", t, "".join(_li(p) for p in subs)) for i, (t, subs) in enumerate(p for p in items if isinstance(p, tuple)))
    if m == "provincias":
        sale += _grupo(pre, "24", "Las 24 jurisdicciones", "".join(_li_prov(c) for c in _PROVS), "prov-lista")
    return sale


_PARTES = [("temas", "Temas")] + [(m, corto) for m, corto, *_ in MENUS]
_grupos_menu = "".join(f'<nav class="menu-panel grupo-panel panel-{m}" id="gm-{m}" aria-labelledby="gb-{m}" hidden>{contenido_menu(m, "mc")}</nav>'
                       for m, _ in _PARTES)
# hasta 1080 píxeles la barra no tiene lugar: un botón "Menú" con las mismas cuatro partes, plegables
_menu = "".join(f'<details class="menu-parte"><summary>{e(n)}{_FLECHA}</summary>{contenido_menu(m, "mp")}</details>' for m, n in _PARTES)
# Los temas de la portada (etapa 36): cada grupo con sus secciones (ícono, nombre y pregunta corta), y debajo de una categoría sus otras
# secciones. Desde la etapa 39 los escribe el constructor: van justo debajo de lo azul y, si los pusiera datina.js al llegar, Artículos saltaba
# hacia abajo. Cada grupo es una columna (hasta el 11 de octubre de 2026, "Y además" iba debajo del grupo con menos secciones)
_SEC = {s[0]: s for s in SECCIONES}


def _tema_portada(it):
    nom, subs = it if isinstance(it, tuple) else (None, [it])
    s = _SEC[subs[0]]
    ico = icono_svg(SEC_ICONO[s[0]]).replace('class="iso ', 'class="iso tg-ico ', 1)
    # Fase 2, paso 2: si la entrada de la categoría no se llama como ella (Economía: Precios y actividad), la tarjeta lleva el nombre de su
    # página y la categoría queda como rótulo de las demás, como en los menús
    cat = f'<span class="tg-cat">{e(nom)}:</span> ' if nom and nom != s[1] else ""
    otras = ('<p class="tg-subs">' + cat + "".join(f'<a href="{url_pagina(x)}">{e(TITULO_DE[x])}</a>' for x in subs[1:]) + "</p>") if len(subs) > 1 else ""
    return (f'<li class="tg-item"><a class="tg-link" href="{url_pagina(s[0])}">{ico}<span class="tg-txt">'
            f'<b style="view-transition-name:t-{s[0]}">{e(s[1] if cat else nom or s[1])}</b><span class="tg-preg">{e(s[7] or s[2])}</span></span></a>{otras}</li>')


_grupo_portada = lambda g, n, items: (f'<section class="tg tg-{g}" aria-labelledby="tg-{g}"><h3 class="tg-tit" id="tg-{g}">{e(n)}</h3>'
                                      '<ul class="tg-lista">' + "".join(_tema_portada(it) for it in items) + "</ul></section>")
_temas_portada = "".join(f'<div class="tg-col">{_grupo_portada(*x)}</div>' for x in GRUPOS)

# ---------- la portada de la Fase 2 (paso 2, diseño aprobado por el autor el 23 de octubre de 2026, docs/rediseno_fase2.md) ----------
# Preguntas de ejemplo del buscador (EJEMPLOS, arriba): cada una lleva a su ficha, y tiene que seguir en la lista del buscador
_preg_js = js[js.index("const PREG = ["):js.index("\n];", js.index("const PREG = ["))]
for _id, _q in EJEMPLOS:
    assert f'["{_q}"' in _preg_js and f'"#{_id}"' in _preg_js, f"la pregunta de ejemplo {_q} ya no está en PREG"
# Datos destacados: cuatro fijos, uno por grupo de temas, elegidos por el autor el 23 de octubre de 2026. La cifra es la cifra destacada
# de la ficha (CLAVE en datina.js), que se calcula en el navegador: el constructor escribe el grupo, la pregunta y el enlace, y deja
# reservado el lugar de la cifra para que la portada no salte. Nunca una ficha de suicidio ni de muertes violentas
DESTACADOS = [("personas", "f-esperanza"), ("economia", "f-salarios"), ("estado", "f-homicidios"), ("territorio", "f-petroleo")]
# la pregunta de cada dato destacado (D7 del plan del 26 de octubre de 2026): la cifra es la del país, así que la pregunta también. La de
# la ficha pregunta por las provincias, que muestra su gráfico
_PREG_DEST = {"f-esperanza": "¿Cuántos años se vive en la Argentina?", "f-salarios": "¿Cuánto se gana en un empleo privado registrado?",
              "f-homicidios": "¿Cuántas víctimas de homicidio hay en la Argentina?", "f-petroleo": "¿Cuánto petróleo produce el país?"}
_clave_js = js[js.index("const CLAVE = {"):js.index("\n};", js.index("const CLAVE = {"))]
_ficha = {f[0]: f for f in FICHAS}
_nombre_grupo = {g: n for g, n, _ in GRUPOS}
for _g, _id in DESTACADOS:
    assert f'"{_id}":' in _clave_js, f"{_id}: el dato destacado necesita una cifra destacada (CLAVE)"
    assert _id not in TEXTO_ANTES and _ficha[_id][2], f"{_id}: no puede ser un dato destacado o le falta la pregunta fija"
    assert GRUPO_DE[_ficha[_id][1]][0] == _g, f"{_id}: no es del grupo {_g}"
_destacados = "".join(f'<a class="tarjeta cifra destacado" href="{url_pagina(UBIC[i])}#{i}" data-clave="{i}"><span class="c-lab">{e(_nombre_grupo[g])}</span>'
                      f'<span class="c-preg">{e(_PREG_DEST[i])}</span><span class="c-num"></span><span class="c-txt"></span></a>' for g, i in DESTACADOS)
# Provincias: las 24 jurisdicciones con su bandera, cada una a su perfil. Es también la forma de llegar con el teclado a lo que muestra
# el mapa de la portada, que el teclado saltea
_n_temas_perfil = len(re.findall(r'\["(\w+)", "([^"]+)"\]', js[js.index("const PERFIL_GRUPOS = ["):js.index("];", js.index("const PERFIL_GRUPOS = ["))]))
_provincias_home = (f'<p class="bloque-sub">El perfil de cada jurisdicción en {_n_temas_perfil} temas, con su historia. Los datos de cada departamento, partido '
                    'o comuna están en <a class="enlace" href="departamentos.html">Departamentos</a>.</p><ul class="prov-home">'
                    + "".join(f'<li><a href="provincia.html?prov={c}"><img class="bandera" src="datos/banderas/{c}.png" alt="" width="24" height="16" '
                              f'loading="lazy" decoding="async">{e(NOMBRE_PROV[c])}</a></li>' for c in _PROVS) + "</ul>")
# Historias con datos: los tres artículos los agrega datina.js (el de la relación más marcada primero, regla aprobada el 5 de octubre de
# 2026) antes de las piezas del Laboratorio con página propia, que escribe el constructor
_historias_home = "".join(f'<a class="tarjeta art-card" href="{i}.html"><span class="art-ico">{icono_svg(ico)}</span><span class="art-txt">'
                          f'<b>{e(html.unescape(t))}</b><small>Laboratorio</small></span></a>' for i, ico, t, _ in PIEZAS)
# Herramientas: las del menú, en su orden, con el mismo dibujo que las tarjetas de antes (las armaba datina.js). Departamentos pasó a
# Provincias
_HERR_EXTRA = {"consultor": ("Consultor de pobreza", "¿Cuánta pobreza hay en cada ciudad, partido y comuna?", "casa"),
               "relaciones": ("Explorador de relaciones", "¿De dónde sale cada número?", "laptop")}


def _tarjeta_herr(p, tipo):
    titulo, preg, ico = (_SEC[p][1], _SEC[p][7] or _SEC[p][2], SEC_ICONO[p]) if p in _SEC else _HERR_EXTRA[p]
    vt = f' style="view-transition-name:t-{p}"' if p in _SEC else ""
    return (f'<a class="tarjeta sec-tarjeta herr" href="{url_menu(p)}">{icono_svg(ico).replace(chr(34) + "iso ", chr(34) + "iso sec-ico ", 1)}'
            f'<span class="sec-tipo">{e(tipo)}</span><b{vt}>{e(titulo)}</b><span class="sec-preg">{e(preg)}</span></a>')


_herr_items = next(x[4] for x in MENUS if x[0] == "herramientas")
_herramientas_home = "".join(_tarjeta_herr(p, "Herramienta") if not isinstance(p, tuple) else "".join(_tarjeta_herr(s, p[0]) for s in p[1])
                             for p in _herr_items)
for marca, valor in {"<!--TEMAS-BARRA-->": _barra, "<!--TEMAS-MENU-->": _menu, "<!--GRUPOS-MENU-->": _grupos_menu, "<!--CATALOGO-->": _catalogo,
                     "<!--DESTACADOS-->": _destacados, "<!--PROVINCIAS-HOME-->": _provincias_home,
                     "<!--HISTORIAS-HOME-->": _historias_home, "<!--HERRAMIENTAS-HOME-->": _herramientas_home,
                     '<div class="secciones-grid" id="secciones-grid"></div>': f'<div class="secciones-grid" id="secciones-grid">{_temas_portada}</div>'}.items():
    assert base.count(marca) == 1, marca
    base = base.replace(marca, valor)
# Formularios de contacto y suscripción: los recibía Netlify. Desde el 23 de octubre de 2026 el sitio va a Cloudflare Pages, que no los
# recibe, y el autor decidió ocultarlos hasta elegir otro servicio. Con "formularios" vacío en datos/manual/sitio.json, el armado saca la
# suscripción del pie y el formulario de Contacto, que dice que todavía no está disponible. Con "netlify", quedan como estaban
SITIO_CONF = json.loads((RAIZ / "datos" / "manual" / "sitio.json").read_text(encoding="utf-8"))
FORMULARIOS = SITIO_CONF.get("formularios", "").strip()
assert FORMULARIOS in ("", "netlify"), 'datos/manual/sitio.json: "formularios" tiene que ser "netlify" o quedar vacío'
if not FORMULARIOS:
    base, _n = re.subn(r'\s*<!-- suscripción \(11 de octubre.*?</form>', "", base, count=1, flags=re.S)
    assert _n == 1, "no se encontró la suscripción del pie en la plantilla"
    base, _n = re.subn(r'<!-- formulario de Netlify.*?<p class="form-gracias" id="susc-gracias" hidden>[^<]*</p>',
                       '<p class="form-nota">El formulario de contacto todavía no está disponible.</p>', base, count=1, flags=re.S)
    assert _n == 1, "no se encontró el formulario de Contacto en la plantilla"
    # y "Tus datos", en Sobre nosotros, deja de hablar de los formularios (auditoría del 26 de octubre de 2026, E9)
    base, _n = re.subn(r'<p>Los formularios de Contacto y de novedades por correo.*?</p>', "", base, count=1, flags=re.S)
    assert _n == 1, "no se encontró el párrafo de los formularios en Tus datos (Sobre nosotros)"
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
                     f'id="pg-{g}-t">{i + 1}. <span>{t}</span></h3><a class="enlace" href="#perfil-indice">Volver a los temas</a></div>'
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
            vacias = f'<div class="en-cifras esqueleto" aria-hidden="true"><h2>En cifras</h2><div class="cifras-grid">{tarjetas_vacias(n, "cifra")}</div></div>'
            blo = re.sub(r'(<div class="tema-intro">.*?</div>(?:<nav class="subsecciones".*?</nav>)?)', lambda m: m.group(1) + vacias, blo, count=1, flags=re.S)
            h = h[:b["ini"]] + blo + h[b["fin"]:]
    return h.replace('<div class="prov-grid" id="prov-grid"></div>',
                     f'<div class="prov-grid" id="prov-grid">{perfil_vacio()}</div>', 1)


# Un h1 por página (11 de octubre de 2026, auditoría: 49 de 52 páginas no tenían): el título de la página, que hasta acá es el primer h2
# de <main>, pasa a h1 al final del armado, cuando el constructor ya lo leyó para el índice, los menús y las migas. El aspecto no cambia
# (datina.css estiliza h1 y h2 igual). La portada ya tiene su h1. Los artículos y las piezas del Laboratorio arman su título con
# datina.js, que lo escribe como h1. scripts/prueba_encabezados.py controla el resultado en las páginas armadas.
# En las secciones con la pregunta como título (class="tema con-pregunta", etapa 35) el título grande que se ve es la pregunta: desde el
# 14 de octubre de 2026 es también el h1 (h1.pregunta), y el nombre de la sección, chico arriba, pasa a p.tema-nombre. Así el lector de
# pantalla encuentra como título lo mismo que se ve como título (pendiente de la etapa 37). El aspecto no cambia: datina.css estiliza
# p.tema-nombre como el h2 y h1.pregunta como la p.pregunta
def encabezado_principal(h, id_):
    if id_ == "inicio" or '<article class="nota"' in h or '<section class="pieza"' in h:
        return h
    ini = h.find("<main")
    a = h.find("<h2", ini)
    assert ini >= 0 and a >= 0, f"{id_}: sin <main> o sin título h2"
    b = h.find("</h2>", a)
    seccion = h[h.rfind("<section", ini, a):a]
    if 'class="tema con-pregunta' not in seccion:
        return h[:a] + "<h1" + h[a + 3:b] + "</h1>" + h[b + 5:]
    atrib = h[a + 3:h.find(">", a)]
    nombre = h[h.find(">", a) + 1:b]
    p = h.find('<p class="pregunta"', b)
    q = h.find("</p>", p)
    assert p >= 0 and h[b:p].strip().replace("</h2>", "").strip() == '<div class="tema-intro">' and "<" not in h[h.find(">", p) + 1:q], \
        f"{id_}: la sección con pregunta no sigue con <div class=\"tema-intro\"><p class=\"pregunta\">"
    assert "class=" not in atrib, f"{id_}: el título de la sección ya tiene una clase"
    return (h[:a] + f'<p class="tema-nombre"{atrib}>{nombre}</p>' + h[b + 5:p] + "<h1" + h[p + 2:q] + "</h1>" + h[q + 4:])


# Metadatos para buscadores y redes (11 de octubre de 2026). La dirección pública sale de datos/manual/sitio.json: mientras esté vacía
# no hay canonical absolutos, og:url, sitemap.xml, robots.txt ni Dataset, para no apuntar a un dominio inventado. Las etiquetas
# Open Graph y Twitter van siempre en las páginas que se indexan, con un título que dice algo (en las secciones, el nombre y su
# pregunta). Los artículos y las piezas del Laboratorio llevan además un Article en JSON-LD. scripts/prueba_metadatos.py lo controla
URL_SITIO = SITIO_CONF["url"].strip().rstrip("/")
assert not URL_SITIO or URL_SITIO.startswith("https://"), "datos/manual/sitio.json: la dirección tiene que empezar con https://"
INDEXADAS = []


def metadatos(id_, titulo_social, descripcion, tipo):
    # Cloudflare Pages sirve cada página sin el .html (trabajo.html redirige a /trabajo, docs/deploy/CLOUDFLARE.md): las direcciones
    # absolutas (canonical, og:url, JSON-LD y sitemap.xml) van sin él, así los buscadores no pasan por la redirección
    archivo = "" if id_ == "inicio" else id_
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
              "license": "https://creativecommons.org/licenses/by/4.0/",
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
    (SITIO / ("index.html" if id_ == "inicio" else f"{id_}.html")).write_text(h, encoding="utf-8", newline="\n")
    return h


# Portada: la grilla que lleva a cada seccion
pagina("inicio", None, None, {"inicio"})
# Tu provincia: el perfil de la provincia elegida, en su propia pagina (se entra desde el primer destacado)
pagina("provincia", "Tu provincia",
       "El perfil de cada provincia: sus indicadores frente al total del país, su posición entre las 24 jurisdicciones, su historia y las provincias que más se le parecen.",
       {"provincia"})
# Sobre nosotros: proposito, principios y forma de trabajo de Datina
pagina("nosotros", "Sobre nosotros",
       "Qué es Datina, para qué existe, de dónde salen sus datos y cómo se hace. Estadísticas públicas de las 24 jurisdicciones de la Argentina.",
       {"nosotros"})
# Laboratorio (etapa 33): piezas visuales grandes, como The Viz Lab de USAFacts
pagina("laboratorio", "Laboratorio",
       "Piezas visuales con datos públicos: cada juez de la Corte Suprema, cada banca del Congreso, cada pozo de Vaca Muerta y las 24 jurisdicciones año por año, con sus fuentes.",
       {"laboratorio"})
for id_, _, titulo, descr in PIEZAS:
    pagina(id_, html.unescape(titulo), html.unescape(descr), {id_}, tipo="article")
# Contacto: formulario del proyecto (se activa al publicar en Netlify)
pagina("contacto", "Contacto", "Para avisar de un error en un dato, sugerir una fuente o una pregunta, o contar cómo usás Datina.", {"contacto"})
# Página para las direcciones que no existen
pagina("404", "Página no encontrada", "Esta página no existe.", {"404"})
sin_notas = lambda h: re.sub(r'\s*<div class="notas">.*?</div>', "", h, count=1, flags=re.S)


# La lista de Artículos la escribe el constructor desde la Fase 2 (paso 4, 23 de octubre de 2026): la armaba datina.js al cargar, y en la
# computadora "Seguí explorando" y el pie, que se ven antes de que llegue, saltaban hacia abajo (CLS 0,26, y 0,35 con las bajadas). El
# orden es el de ARTS en datina.js (primero los de series, después los de cruces), y cada cuánto se actualiza y la bajada salen de ahí
def _arts_js(ini, fin):
    trozos = re.split(r'(?=\bid: "a-[\w-]+")', bloque_js(ini, fin))[1:]
    datos = []
    for t in trozos:
        m = [re.search(rf'\b{k}: "((?:[^"\\]|\\.)*)"', t) for k in ("id", "frec", "dek")]
        assert all(m), f"un artículo de datina.js sin id, frec o dek: {t[:60]}"
        datos.append([json.loads(f'"{x.group(1)}"') for x in m])
    return datos


_ARTS_JS = _arts_js("const ART_SERIE = [", "\n}];") + _arts_js("const ART = [", "\n];")
_NOTA_DE = {i: (ico, sec, html.unescape(t)) for i, ico, sec, t in NOTAS}
assert sorted(i for i, *_ in _ARTS_JS) == sorted(_NOTA_DE), "los artículos de datina.js no son los de la plantilla"
# Etapa 5 del plan de mejora (28 de octubre de 2026): la lista en dos bloques, "El país en el tiempo" (series de todo el país) y "Las 24
# comparadas" (provincias, capitales y regiones lado a lado), que dice data-bloque en cada artículo de la plantilla, con filtros por los
# cuatro grupos de temas. "Anterior" y "Siguiente" de cada artículo siguen este mismo orden (navegacion())
BLOQUES_ART = [("pais", "El país en el tiempo", "Series de todo el país, mes a mes o año a año, con lo que pasaba en cada momento."),
               ("provincias", "Las 24 comparadas", "Las provincias, las capitales o las regiones, lado a lado, con un mismo dato.")]
BLOQUE_NOTA = dict(re.findall(r'<article class="nota" id="(a-[\w-]+)"[^>]*? data-bloque="(\w+)"', base))
assert set(BLOQUE_NOTA) == set(_NOTA_DE) and set(BLOQUE_NOTA.values()) <= {b for b, *_ in BLOQUES_ART}, \
    "cada artículo de la plantilla necesita data-bloque, pais o provincias"
# el grupo de cada artículo sale de GRUPO_DE (sección -> (grupo, nombre)), el mismo de las migas
assert all(sec in GRUPO_DE for _, sec, _ in _NOTA_DE.values()), "un artículo es de una sección que no está en los cuatro grupos de temas"
ORDEN_ARTS = [i for b, *_ in BLOQUES_ART for i, *_ in _ARTS_JS if BLOQUE_NOTA[i] == b]


def _tarjeta_art(i, frec, dek):
    ico, sec, tit = _NOTA_DE[i]
    # la respuesta del artículo la escribe datina.js en .art-resp, que reserva su lugar: la tarjeta no salta al llegar
    return (f'<a class="tarjeta art-card" href="{i}.html" data-grupo="{GRUPO_DE[sec][0]}"><span class="art-ico">{icono_svg(ico)}</span><span class="art-txt">'
            f'<b style="view-transition-name:t-{i}">{e(tit)}</b><span class="art-resp" data-art="{i}"></span><span class="art-dek">{e(dek)}</span>'
            f'<small>{e(_SEC[sec][1])}. {e(frec)}</small></span></a>')


_ART_JS_DE = {i: (frec, dek) for i, frec, dek in _ARTS_JS}
# los filtros se ven solo con JavaScript, que los hace andar
_LISTA_ARTS = ('<div class="art-filtros" role="group" aria-label="Filtrar los artículos por tema" hidden>'
               '<button type="button" class="boton chico" data-grupo="" aria-pressed="true">Todos</button>'
               + "".join(f'<button type="button" class="boton chico" data-grupo="{g}" aria-pressed="false">{e(n)}</button>'
                         for g, n, _ in GRUPOS if any(GRUPO_DE[s][0] == g for _, s, _ in _NOTA_DE.values())) +
               '</div><p class="art-cuenta solo-lector" aria-live="polite"></p>'
               + "".join(f'<section class="art-bloque" aria-labelledby="ab-{b}"><h2 id="ab-{b}">{e(t)}</h2><p class="art-bloque-sub">{e(sub)}</p>'
                         f'<div class="art-grid">{"".join(_tarjeta_art(i, *_ART_JS_DE[i]) for i in ORDEN_ARTS if BLOQUE_NOTA[i] == b)}</div></section>'
                         for b, t, sub in BLOQUES_ART))


def lista_articulos(h):
    vacia = '<div class="art-lista" id="art-grid"></div>'
    assert h.count(vacia) == 1, "falta la lista de Artículos en la plantilla"
    return sin_notas(h).replace(vacia, f'<div class="art-lista" id="art-grid">{_LISTA_ARTS}</div>', 1)


for id_, titulo, preg, _, es_herr, *_ in SECCIONES:
    cola = ("Herramienta de Datina con datos públicos de la Argentina y sus 24 jurisdicciones." if es_herr else
            "Cada artículo cruza datos oficiales y dice sus fuentes y sus límites." if id_ == "articulos" else
            "Cada dato con su fuente, su período y su tabla para descargar.")
    descr = f"{titulo}: {preg} {cola}" if preg else f"{titulo} en Datina."
    pagina(id_, titulo, descr, {id_}, lista_articulos if id_ == "articulos" else None, titulo_social=f"{titulo}: {preg}" if preg else None)


# Una pagina por articulo (a-....html): solo esa nota, sin el indice de articulos
def solo_nota(id_):
    def recorte(h):
        b = next(b for b in bloques(h) if b["id"] == "articulos")
        s = h[b["ini"]:b["fin"]]
        s = re.sub(r"\s*<h2>.*?</h2>", "", s, count=1)
        s = re.sub(r'\s*<div class="tema-intro">.*?</div>', "", s, count=1, flags=re.S)
        s = re.sub(r'\s*<div class="art-grid" id="art-grid"></div>', "", s, count=1)
        s = re.sub(r'\s*<article class="nota" id="(a-[\w-]+)"[^>]*></article>', lambda m: m.group(0) if m.group(1) == id_ else "", s)
        return h[:b["ini"]] + s + h[b["fin"]:]
    return recorte


# La descripción de cada artículo dice qué cruza: series del país (ART_SERIE), las 24 capitales (tabla de las capitales en ART)
# o las 24 jurisdicciones (los demás artículos de cruces)
ART_SERIES = set(re.findall(r'^\s+id: "(a-[\w-]+)"', bloque_js("const ART_SERIE = [", "\n}];"), re.M))
ART_CAPITALES = set(re.findall(r'\{id: "(a-[\w-]+)", tabla: "capitales', bloque_js("const ART = [", "\n];")))
assert ART_SERIES and ART_CAPITALES, "no se encontraron los artículos de series o de las capitales en datina.js"
CRUZA = lambda id_: ("series oficiales del país" if id_ in ART_SERIES else
                     "datos oficiales de las 23 capitales de provincia y de CABA" if id_ in ART_CAPITALES else "datos oficiales de las 24 jurisdicciones")
for id_, _, _, titulo in NOTAS:
    descr = f"{html.unescape(titulo)} Compara {CRUZA(id_)} y dice de dónde salen y qué no permiten concluir."
    pagina(id_, html.unescape(titulo), descr, {"articulos"}, solo_nota(id_), tipo="article")

# Paginas que cambiaron de nombre: la direccion vieja lleva a la nueva, con la ficha y la provincia del enlace
# Etapa 5 del plan de mejora (28 de octubre de 2026): los artículos que se juntaron con otro o se retiraron llevan al que queda
REDIRECCIONES = {"emprendedores": "empresas", "a-empleo-pobreza": "a-pobreza-desocupacion", "a-cobertura-adolescentes": "a-cobertura-esperanza",
                 "a-viviendas-hacinamiento": "a-viviendas-alquiler", "a-recursos-empleo": "a-coparticipacion",
                 # decisión del autor del 27 de octubre de 2026 (E6 del plan de mejora): el del voto a Milei se retira
                 "a-milei-empleo": "a-ganador-provincias"}
for viejo, nuevo in REDIRECCIONES.items():
    (SITIO / f"{viejo}.html").write_text(
        f'<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Datina</title>'
        f'<meta name="robots" content="noindex"><link rel="canonical" href="{nuevo}.html">'
        f'<script>location.replace("{nuevo}.html" + location.search + location.hash)</script>'
        f'<noscript><meta http-equiv="refresh" content="0; url={nuevo}.html"></noscript></head>'
        f'<body><p><a href="{nuevo}.html">Esta página se mudó</a></p></body></html>\n', encoding="utf-8", newline="\n")

shutil.copy(RAIZ / "datos" / "ordenado" / "tabla_larga.csv", SITIO / "datos" / "tabla_larga.csv")
# Sitio de consultas de pobreza (Observable Framework). Se construye aparte con "npm run build" dentro de pobreza/ (pobreza/README.md)
# y su resultado se copia a sitio/pobreza/ solo con --con-pobreza (scripts/consultor_pobreza.py): desde el 22 de octubre de 2026 una
# pobreza/dist vieja ya no reemplaza el consultor publicado
AVISO_POBREZA = consultor_pobreza.copiar(DIST_POBREZA, SITIO / "pobreza", CON_POBREZA)
# el armado de Observable Framework pone maximum-scale=1 en el viewport, y eso impide agrandar la página con los dedos en el celular
# (11 de octubre de 2026, WCAG 1.4.4). Se saca acá, sobre lo publicado, así sigue resuelto en cada armado nuevo del consultor
for _pb in (SITIO / "pobreza").glob("*.html"):
    _t = _pb.read_bytes()
    _n = re.sub(rb",\s*maximum-scale=1(\.0)?", b"", _t)
    # y los ejemplos de código (R y Python) cortan la línea en el celular: a 320 píxeles corrían la página de costado
    if b"datina-codigo" not in _n:
        _n = _n.replace(b"</head>", b'<style id="datina-codigo">code{overflow-wrap:anywhere}</style>\n</head>', 1)
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
    _rxp.write_text(_rxh, encoding="utf-8", newline="\n")
# sitemap.xml y robots.txt solo con la dirección definitiva (datos/manual/sitio.json). Sin ella se borran, si quedaron de antes
for _f in ("sitemap.xml", "robots.txt"):
    (SITIO / _f).unlink(missing_ok=True)
if URL_SITIO:
    (SITIO / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
                                     "".join(f"  <url><loc>{URL_SITIO}/{a}</loc></url>\n" for a in INDEXADAS) + "</urlset>\n", encoding="utf-8", newline="\n")
    (SITIO / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {URL_SITIO}/sitemap.xml\n", encoding="utf-8", newline="\n")
# Caché en Cloudflare Pages (23 de octubre de 2026, decisión del autor): sitio/_headers es el equivalente de los [[headers]] de
# netlify.toml. Los archivos que las páginas piden con su huella en la dirección (?v=...) se guardan un año: cuando cambia el contenido
# cambia la dirección. Los demás (por ejemplo, las tablas que se piden sin huella) quedan con la caché común
CACHE_LARGO = (["/datina.css", "/datina.js", "/datos/fichas.js", "/lib/*", "/relaciones.css", "/relaciones.js", "/datos/relaciones.json"]
               + [f"/datos/{n}.json" for n in DIFERIDAS] + ["/consulta-ia.js"] * CONSULTA_IA)
(SITIO / "_headers").write_text("".join(f"{r}\n  Cache-Control: public, max-age=31536000, immutable\n" for r in CACHE_LARGO), encoding="utf-8", newline="\n")
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
# la navegación (scripts/prueba_navegacion.py, Fase 2): la misma barra, los mismos menús y el mismo pie en todas las páginas, todas las
# direcciones de antes y ninguna página sin enlaces que lleguen a ella
import prueba_navegacion  # noqa: E402
_nav = prueba_navegacion.revisar()
if _nav:
    sys.exit("Navegación con problemas: el sitio no se dio por armado.\n" + "\n".join(_nav))
# Cloudflare Pages rechaza la publicación entera si un archivo pasa de 25 MiB (docs/deploy/CLOUDFLARE.md): la actualización mensual lo
# subiría igual y el sitio publicado quedaría viejo sin aviso
_grandes = [f"{p.relative_to(SITIO).as_posix()} ({p.stat().st_size / 2**20:.1f} MB)" for p in sorted(SITIO.rglob("*"))
            if p.is_file() and p.stat().st_size > 25 * 2**20]
if _grandes:
    sys.exit("Archivos de más de 25 MB, que Cloudflare Pages no publica: el sitio no se dio por armado.\n" + "\n".join(_grandes))
respaldo_sitio.terminado()
print(f"Listo: sitio/index.html, {len(SECCIONES)} paginas de seccion y {len(NOTAS)} articulos")
if ATRASADAS:
    print("Fichas con el dato más atrasado que lo habitual (el pie lo dice): " + ", ".join(ATRASADAS))
if AVISO_POBREZA:
    print(AVISO_POBREZA)
