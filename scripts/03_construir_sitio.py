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
import collections, csv, datetime, hashlib, html, json, math, pathlib, re, shutil, sys, unicodedata
from decimal import Decimal, ROUND_HALF_UP

RAIZ = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RAIZ / "scripts"))
import consultor_pobreza  # noqa: E402
import achicar_js  # noqa: E402
import frescura  # noqa: E402
import prueba_achicar_js  # noqa: E402
import imagen_social  # noqa: E402
import prueba_frescura  # noqa: E402
# la regla del aviso de dato atrasado (T3) se prueba antes de armar: si falla, el sitio no se arma
_ac, _ = prueba_achicar_js.revisar()
if _ac:
    sys.exit("La prueba del achicador de datina.js falla (scripts/prueba_achicar_js.py): el sitio no se armó.\n  " + "\n  ".join(_ac))
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
# la dirección del sitio en "Usar los datos" (la API y el MCP, plan técnico, fase 3): la de datos/manual/sitio.json, sin escribirla a mano
plantilla = plantilla.replace("__URL_SITIO__", json.loads((RAIZ / "datos" / "manual" / "sitio.json").read_text(encoding="utf-8"))["url"].strip().rstrip("/"))
JS_IA = (RAIZ / "scripts" / "consulta_ia.js").read_text(encoding="utf-8")
plantilla = plantilla.replace("__V_IA_JS__", hashlib.sha1(JS_IA.encode("utf-8")).hexdigest()[:10])
# Elecciones por mesa (4 de noviembre de 2026): su código va aparte, lo pide solo mesas.html
JS_MESAS = (RAIZ / "scripts" / "mesas.js").read_text(encoding="utf-8")
plantilla = plantilla.replace("__V_MESAS_JS__", hashlib.sha1(JS_MESAS.encode("utf-8")).hexdigest()[:10])
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
FIJOS = ["en 2024 se anunció el pase", "diciembre de 2024 el subte", "diciembre de 2024 parte de los viajes", "mayo de 2025 pagos con qr", "desde 2026 el indec reformula",
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
malos += [m for n in ("relaciones.html", "relaciones.js", "mesas.js") for m in anios_a_mano(n, (RAIZ / "scripts" / n).read_text(encoding="utf-8"))]
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
# no se arma. Las herramientas (fichas "explorador": Cruces, Ordenar las 24, Departamentos y Diagnóstico) no llevan.
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
    "a_mano": "Se actualiza a mano, cuando la fuente publica datos nuevos.",
}
FRECUENCIA = {
    # Trabajo
    "f-empleo": "mes", "f-salarios": "trimestre", "f-rotacion": "trimestre", "f-exportaciones": "semestre",
    # Sector externo
    "f-balanza": "mes", "f-exporta-rubros": "mes", "f-complejos": "semestre", "f-destinos": "semestre", "f-exporta-provincias": "anio",
    "f-importaciones": "mes", "f-origen": "mes", "f-cuenta-corriente": "trimestre", "f-reservas-bcra": "mes", 
    # Economía y precios
    "f-inflacion": "mes", "f-inflacion-rubros": "mes", "f-mayoristas": "mes", "f-socios-que": "anio", "f-valor-kilo": "anio", "f-canastas": "mes", "f-crianza": "mes", "f-salario-real": "mes", "f-emae": "mes", "f-sectores-empleo": "trimestre", "f-industria": "mes", "f-socios": "mes", "f-socios-hist": "anio", "f-supermercados": "mes", "f-bcra": "mes", "f-expectativas": "mes", "f-confianza-consumidor": "mes",
    # Empresas y oportunidades
    "f-empresas": "anio", "f-empresas-tamano": "anio", "f-dinamica-empresas": "anio", "f-sociedades": "anio",
    # Pobreza y hogares
    "f-pobreza": "semestre", "f-ingresos-aglomerados": "trimestre", "f-censo": "censo", "f-internet": "trimestre", "f-telefonia": "trimestre",
    # Salud
    "f-esperanza": "censo", "f-cobertura": "censo", "f-dengue": "anio", "f-vacunas": "anio", "f-medicos": "anio", "f-hospitales": "anio", "f-distancia-hospital": "anio", "f-causas-muerte": "anio", "f-mortalidad": "anio", "f-causas-infantiles": "anio", "f-muertes": "anio", "f-suicidio": "anio",
    "f-suicidio-prov": "anio", "f-edad": "anio",
    # Seguridad
    "f-delitos": "anio", "f-robos": "anio", "f-homicidios": "anio", "f-carceles": "anio", "f-sin-condena": "anio",
    # Educación
    "f-escolarizacion": "anio", "f-abandono": "anio", "f-aprender": "aprender", "f-pisa": "pisa", "f-salario-docente": "trimestre", "f-inversion-educativa": "anio", "f-escuelas-primarias": "anio",
    # Población
    "f-nacimientos": "anio", "f-poblacion-proy": "anio", "f-chicos-escuela": "anio", "f-piramide": "anio", "f-envejecimiento": "anio", "f-haberes": "trimestre", "f-pensiones-invalidez": "trimestre", "f-auh": "trimestre", "f-desocupacion": "trimestre", "f-pobreza-aglomerados": "semestre", "f-desempleo": "trimestre", "f-adolescentes": "anio",
    "f-adolescentes-nse": "anio",
    # Migraciones
    "f-nacidos-otro-pais": "censo", "f-migracion-interna": "censo", "f-migracion-historia": "censo", "f-extranjeros": "anio",
    "f-radicaciones": "anio", "f-refugio": "anio", "f-argentinos-exterior": "onu",
    # Política
    "f-elecciones": "eleccion", "f-legisladores": "congreso", "f-anios-congreso": "congreso", "f-representacion": "anio", "f-congreso": "congreso", "f-votaciones": "leyes",
    "f-voto-provincia": "eleccion", "f-atn": "anio", "f-presupuesto": "anio",
    "f-presidentes": "presidente", "f-ministros": "gabinete", "f-confianza-gobierno": "mes",
    "f-corte-casos": "anio", "f-jueces-federales": "padron", "f-fiscalias-federales": "ultimo",
    "f-cortes-provinciales": "anio", "f-justicia-provincial": "anio",
    # Gobierno
    "f-cuentas-nacion": "mes", "f-recaudacion": "mes", "f-deuda": "trimestre", "f-empleo-publico": "anio", "f-impuestos-provinciales": "anio", "f-coparticipacion": "anio", "f-deuda-provincias": "trimestre",
    "f-fiscal": "anio",
    # Movilidad
    "f-sube": "mes", "f-patentes": "mes", "f-patentes-prov": "mes", "f-combustibles": "mes",
    # Construcción y vivienda
    "f-isac": "mes", "f-permisos": "mes", "f-insumos": "mes", "f-obra-publica": "anio", "f-empleo-construccion": "trimestre",
    "f-costo": "mes", "f-hipotecas": "mes", "f-vivienda": "censo",
    # Energía
    "f-hogares": "mes", "f-electricidad-provincias": "mes", "f-electricidad-sectores": "mes", "f-meses": "mes",
    "f-centrales": "anio", "f-gas-hogares": "censo", "f-gas-consumo": "mes", "f-subsidios": "mes",
    # Petróleo y gas
    "f-petroleo": "mes", "f-gas": "mes", "f-hidro-provincias": "mes", "f-areas-hidro": "anio", "f-pozos": "mes",
    "f-fracturas": "anio", "f-productividad": "anio", "f-empresas-hidro": "mes", "f-empleo-hidro": "trimestre",
    "f-regalias": "anio", "f-reservas": "anio", "f-balanza-energetica": "mes", "f-mundo-petroleo": "anio",
    # Turismo
    "f-receptivo": "mes", "f-hoteles": "pausa", "f-eti": "pausa",
    # Naturaleza
    "f-protegida": "anio", "f-parques": "anio", "f-visitas": "mes", "f-especies": "anio", "f-pesca": "anio",
    "f-pesca-rio": "anio",
    "f-soja": "anio", "f-cobertura-suelo": "anio",
    # las cumbres más altas: la tabla del IGN y el relieve los arma scripts/cumbres_relieve.py, fuera de la descarga del día 5
    "f-cumbres": "a_mano",
    # Curiosidades
    # la Antártida: datos fijos, a pedido del autor (fuera de la descarga del día 5). Sin aviso de atraso, porque nada los actualiza solo
    "f-ant-mapa": "a_mano", "f-ant-bases": "a_mano", "f-ant-paises": "a_mano", "f-ant-reclamos": "a_mano", "f-ant-tratado": "a_mano", "f-ant-zonas": "a_mano",
    "f-ant-temperatura": "a_mano", "f-ant-hielo": "a_mano", "f-ant-turismo": "a_mano", "f-ant-presupuesto": "a_mano",
    "f-nombres": "anio", "f-precio-consumo": "anio", "f-carne": "mes", "f-vino": "mes", "f-yerba": "mes", "f-glaciares": "inventario", "f-clima": "anio",
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
    "f-sectores-empleo": 1,        # el mismo dato, todas las secciones (3 de noviembre de 2026)
    "f-vacunas": 6,                # la cobertura de 2024 se publicó en abril de 2026 (16 meses)
    "f-deuda-provincias": 2,       # el stock al 30 de junio de 2026 estaba publicado en octubre de 2026 (4 meses)
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
# Una página fija por jurisdicción (D3, decisión del autor del 1 de noviembre de 2026): el enlace dice de qué provincia es. provincia.html sigue
# siendo donde se elige, y provincia.html?prov=58 sigue andando
_sin_acento = str.maketrans("áéíóúüñ", "aeiouun")
PAG_PROV = {c: "provincia-" + re.sub(r"[^a-z]+", "-", n.lower().translate(_sin_acento)).strip("-") for c, n in NOMBRE_PROV.items() if c != "00"}
assert len(set(PAG_PROV.values())) == 24, f"las páginas de las provincias se repiten: {PAG_PROV}"
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
# datos/manual/provincias_historia.json. Los habitantes salen de los datos: la proyección del INDEC (base Censo 2022) del año en curso,
# la misma de Cruces (decisión 4 del autor del 12 de noviembre de 2026). Se escribe un bloque por jurisdicción, oculto, y datina.js muestra el de la provincia elegida. Si un
# texto rompe las reglas de redacción o le falta su fuente, el sitio no se arma
HISTORIA = json.loads((RAIZ / "datos" / "manual" / "provincias_historia.json").read_text(encoding="utf-8"))["provincias"]
_fj = json.loads((SITIO / "datos" / "fichas.json").read_text(encoding="utf-8"))
HAB = {f["codigo_indec"]: f["poblacion"] for f in _fj["datos"]["cruces_provincias"] if f.get("poblacion")}
HAB_ANIO = _fj["resumen"]["anio_pob_ficha"]["cruces_provincias"]
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


assert base.count("<!--HISTORIA-->") == 1 and base.count("<!--PROV-LINEA-->") == 1
# el bloque de la provincia del enlace (o la recordada) se muestra apenas se lee, antes de que se vea la página: si lo mostrara datina.js
# al final, el perfil de abajo saltaba al aparecer (CLS de 0,30 con CABA). La misma regla de datina.js (leerProv), que después lo mantiene.
# Desde la etapa 6 del plan de mejora (la historia al final) hace lo mismo con la línea de arriba y deja reservado el lugar de "Dónde se
# destaca", que llena datina.js
_YA = lambda sel: ('<script>(()=>{const l=s=>new URLSearchParams(s).get("prov");let c=l(location.search)||l(location.hash.split("?")[1]||"");'
                   'try{c=c||localStorage.getItem("prov")}catch(_){}if(!c||c==="00")return;'
                   + sel + '})()</script>')
_HIST_YA = _YA('const a=document.querySelector(\'#prov-historia .ph[data-c="\'+c+\'"]\');if(a)a.hidden=false')
_LINEA_YA = _YA('const a=document.querySelector(\'.prov-linea[data-c="\'+c+\'"]\');if(a)a.hidden=false;'
                'const d=document.getElementById("prov-destaca");if(d)d.hidden=false')
base = base.replace("<!--HISTORIA-->", '<div class="prov-historia" id="prov-historia">'
                    + "".join(historia_prov(c, HISTORIA[c]) for c in sorted(HISTORIA)) + "</div>" + _HIST_YA)
# Escuelas y hospitales de cada provincia (9 de noviembre de 2026, docs/roadmap/ESTABLECIMIENTOS.md): establecimientos_sitio.py escribe
# sitio/datos/establecimientos/{código}.csv desde datos/manual/establecimientos/ (con los mismos datos, los mismos archivos). La sección de la
# página de provincia recibe la huella de esas tablas (las pide con ?v=, así una tabla nueva no queda guardada en el navegador) y la fecha de
# cada fuente: ningún año se escribe a mano en la plantilla
import establecimientos_sitio  # noqa: E402
_est = establecimientos_sitio.publicar()
_est_v = hashlib.sha1(b"".join(p.read_bytes() for p in sorted(establecimientos_sitio.DESTINO.glob("*.csv")))).hexdigest()[:10]
assert base.count('id="prov-establecimientos"') == 1, "falta la sección de escuelas y hospitales en la plantilla"
# y cuántas filas tiene la tabla de cada provincia: una tabla que llega cortada es una falla, no una provincia con menos escuelas
_est_n = ",".join(f'{c}:{v["escuelas"] + v["hospitales"]}' for c, v in sorted(_est["por_provincia"].items()))
base = base.replace('id="prov-establecimientos"', f'id="prov-establecimientos" data-v="{_est_v}" data-padron="{_est["padron"]}" '
                    f'data-refes="{_est["refes"]}" data-n="{_est_n}"', 1)


def linea_prov(c, h):
    """La línea de arriba del perfil (etapa 6 del plan de mejora): habitantes, capital y año de provincialización, de la historia."""
    fc, pd = h.get("fundacion_capital") or {}, h.get("provincia_desde") or {}
    partes = [f"{_miles(HAB[c])} habitantes en {HAB_ANIO}"] if c in HAB else []
    if fc.get("ciudad") and c != "02":
        partes.append(f'Capital: {fc["ciudad"]}')
    if pd.get("anio"):
        partes.append(f'{"Autonomía" if c == "02" else "Provincia"} desde {pd["anio"]}')
    return f'<p class="prov-linea" data-c="{c}" hidden>{e(". ".join(partes))}.</p>' if partes else ""


base = base.replace("<!--PROV-LINEA-->", "".join(linea_prov(c, HISTORIA.get(c, {})) for c in sorted(NOMBRE_PROV) if c != "00") + _LINEA_YA)

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
                    "provincias": "provincia", "nosotros": "nosotros", "usar-datos": "usar-datos", "contacto": "contacto", "no-encontrada": "404",
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
# (mide una actividad económica) y Curiosidades a Historias con datos (MENUS, abajo). Cuentas públicas se queda donde está.
# Desde la etapa 6 del plan de mejora (decisión del autor del 27 de octubre de 2026) el Diagnóstico educativo va en la categoría Educación
GRUPOS = [
    ("personas", "Personas y bienestar", [("Población", ["poblacion", "migraciones"]), "salud", ("Educación", ["educacion", "diagnostico"]), "pobreza"]),
    # Sector externo, desde el 11 de octubre de 2026 (pedido del autor: "meté una nueva categoría en trabajo y economía que se llame sector externo")
    ("economia", "Trabajo y economía", ["trabajo", ("Economía", ["economia", "empresas", "construccion", "gobierno"]), "externo", "turismo"]),
    ("estado", "Estado y sociedad", ["politica", "justicia", "seguridad"]),
    ("territorio", "Territorio y recursos", [("Energía", ["energia", "petroleo"]), "movilidad", "naturaleza"]),
]
# La barra (Fase 2, respuesta del autor del 23 de octubre de 2026: "Temas, Provincias, Historias, Herramientas"): "Temas" abre los cuatro
# grupos de arriba en columnas, como la portada, y los otros tres menús salen de MENUS. Reemplaza los "4 grupos con menú" y "Más" de la
# etapa 39. Cada menú: id, nombre en la barra, nombre completo (pie, migas y filtros del catálogo), adónde lleva donde no hay menú (el
# Explorador de relaciones) y sus páginas. Una tupla es un subgrupo con su nombre. Las 24 jurisdicciones del menú Provincias (respuesta
# del autor del mismo día) las agrega la barra.
# Menú simplificado (etapa 6 del plan de mejora, decisión del autor del 27 de octubre de 2026): de nueve entradas a cinco, para tres tareas.
# Provincias suma "Ordenar las 24" (antes Tu índice) y Herramientas queda con Cruces y el Catálogo. El Diagnóstico educativo pasa a Educación
# (GRUPOS), el consultor de pobreza se abre desde Pobreza y hogares y el Explorador de relaciones sale del menú: lo enlazan Sobre nosotros,
# el pie y cada tabla del Catálogo. Consultas con IA la ofrecen el Catálogo y la lupa, y sigue en el pie y en la portada (FUERA_DE_MENU)
MENUS = [
    ("provincias", "Provincias", "Provincias", "provincia.html", ["provincia", "indice", "departamentos"]),
    # Datos destacados, desde el 6 de noviembre de 2026 (segunda fase del brief de pulido de la portada: la página de "Ver todos los datos destacados")
    ("historias", "Historias", "Historias con datos", "articulos.html", ["articulos", "datos-destacados", "laboratorio", "corte-suprema", "curiosidades"]),
    # Elecciones por mesa, desde el 4 de noviembre de 2026 (decisión del autor: en Herramientas, con un enlace desde la ficha de elecciones de Política)
    ("herramientas", "Herramientas", "Herramientas", "./#herr-titulo", ["cruces", "mesas", "catalogo"]),
]
_secs_de = lambda items: [s for it in items for s in (it[1] if isinstance(it, tuple) else [it])]
CATEGORIA = {s: (it[0], it[1]) for _, _, items in GRUPOS for it in items if isinstance(it, tuple) for s in it[1]}
ORDEN_TEMAS = [s for _, _, items in GRUPOS for it in items for s in (it[1] if isinstance(it, tuple) else [it])]
GRUPO_DE = {s: (g, n) for g, n, items in GRUPOS for s in _secs_de(items)}
MENU_DE = {p: (m, completo) for m, _, completo, _, items in MENUS for p in _secs_de(items)}
# las páginas que no están en ningún menú pero son de uno: van en su columna del pie y en la portada, y de ahí salen sus migas y su grupo
# en la lupa
FUERA_DE_MENU = {"consulta-ia": "herramientas"} if CONSULTA_IA else {}
MENU_DE.update({p: (m, next(completo for x, _, completo, _, _ in MENUS if x == m)) for p, m in FUERA_DE_MENU.items()})
# un tema es una sección que no es herramienta, o una herramienta que va en un tema (el Diagnóstico educativo, en Educación)
_temas = [x[0] for x in SECCIONES if x[0] != "articulos" and (not x[4] or x[0] in ORDEN_TEMAS)]
assert sorted(ORDEN_TEMAS + [p for p in MENU_DE if p in _temas]) == sorted(_temas), \
    f"las secciones y los menús no coinciden: {set(ORDEN_TEMAS + list(MENU_DE)) ^ set(_temas)}"
HERRAMIENTAS = [x[0] for x in SECCIONES if x[4]]
assert set(HERRAMIENTAS) <= set(MENU_DE) | set(ORDEN_TEMAS), f"herramientas sin menú: {set(HERRAMIENTAS) - set(MENU_DE) - set(ORDEN_TEMAS)}"
# las páginas de los menús que arma la plantilla como sección, más Tu provincia y el Laboratorio (la otra es la pieza de la Corte Suprema):
# en ese orden van el recorrido y los filtros del catálogo
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
INDICE = {"prov_pag": PAG_PROV, "secciones": SECCIONES, "fichas": FICHAS, "articulos": [[i, html.unescape(t), ico, sec] for i, ico, sec, t in NOTAS], "ubic": UBIC,
          "grupos": [[g, n, [list(it) if isinstance(it, tuple) else it for it in items]] for g, n, items in GRUPOS],
          "cat": {s: subs[0] for s, (_, subs) in CATEGORIA.items()},
          "menu": {p: m for p, (m, _) in MENU_DE.items()}, "ejemplos": [list(x) for x in EJEMPLOS], "lab": [list(x) for x in LAB_PIEZAS_IDX]}
# Fichas unidas (plan de mejora, R7, decisión del autor del 28 de octubre de 2026: once pares de fichas casi iguales pasan a ser una ficha
# con vistas): la ficha que se fue y la que quedó. datina.js manda la dirección vieja (energia.html#f-actividad) a la nueva, en esa página
# o en otra. La que se fue no puede seguir en la plantilla, y la que quedó tiene que estar
FICHAS_UNIDAS = {"f-actividad": "f-hogares", "f-mapa-pozos": "f-pozos", "f-pozos-terminados": "f-fracturas",
                 "f-reservas-netas": "f-reservas-bcra", "f-sube-modos": "f-sube", "f-visitas-parque": "f-visitas",
                 "f-jubilaciones": "f-envejecimiento", "f-trabajadores": "f-empleo-construccion",
                 "f-votaciones-espacios": "f-votaciones", "f-apoyo": "f-voto-provincia", "f-transferencias": "f-atn"}
for _vieja, _nueva in FICHAS_UNIDAS.items():
    assert _vieja not in UBIC, f"{_vieja}: la ficha unida a {_nueva} sigue en la plantilla"
    assert UBIC.get(_nueva), f"{_vieja}: la ficha que la reemplaza ({_nueva}) no está en la plantilla"
INDICE["alias"] = FICHAS_UNIDAS
# con las consultas con IA prendidas, el buscador ofrece llevar lo escrito a la página de las consultas (datina.js, buscar)
if CONSULTA_IA:
    INDICE["ia"] = 1

# ---------- datos ----------
# Las tablas mas pesadas, que usan pocas fichas, van en archivos aparte que el navegador baja solo al abrir esas fichas.
# fichas.js lleva la huella de cada una para que el navegador no use una version vieja.
DIFERIDAS = ["antartida_instalaciones", "antartida_bases", "antartida_paises", "antartida_reclamos", "antartida_tratado", "antartida_tratado_serie", "antartida_zonas_paises",
             "antartida_temperatura", "antartida_hielo", "antartida_turismo", "antartida_presupuesto", "elecciones_presidenciales", "anios_congreso", "transferencias_provincias", "piramide_poblacion", "apoyo_gobierno_provincias", "aprender_departamentos",
             "hidrocarburos_mensual", "vivienda_departamentos", "isac_mensual", "costo_construccion",
             "empleo_construccion_serie", "pozos_no_convencionales", "areas_produccion", "centrales",
             "gas_usuario_serie", "gas_usuario_mensual", "areas_serie", "combustibles_mensual", "electricidad_serie", "electricidad_mensual",
             "dolar_inversion_trimestral", "compras_dolares_anual", "salarios_serie", "salario_docente_serie", "canasta_crianza", "mayoristas_mensual", "comercio_rubro_pais", "comercio_valor_kilo", "produccion_mensual", "comercio_socios_historia", "inversion_educativa_serie",
             "seguridad_serie_prov", "turismo_dolar_mensual", "nafta_dolares_mensual", "nafta_dolares_anual", "nombres_serie",
             "exportaciones_dolar_trimestral", "exportaciones_cantidades_anual",
             "inflacion_mensual", "canasta_mensual", "salario_real_mensual", "actividad_mensual",
             "nacidos_otro_pais_paises", "radicaciones_nacionalidad", "argentinos_exterior_destinos",
             "migraciones_departamentos", "soja_departamentos", "supermercados_mensual", "corte_jueces", "corte_composicion", "corte_presidentes", "bcra_variables",
             # D2 del plan de mejora (28 de octubre de 2026): las tablas más pesadas que solo usa el dibujo de su ficha
             "exportaciones_destinos", "reservas_netas", "combustibles_anual", "confianza_consumidor", "expectativas_inflacion", "confianza_gobierno",
             # D2, segunda parte (4 de noviembre de 2026): más tablas que solo usa su ficha o el perfil de una provincia. nombres_top y censos_provincias no
             # pueden pasar: el texto de un artículo o una parte del perfil las leen apenas carga la página
             "puestos_provincias", "reservas_bcra", "voto_legisladores_y_provincia", "dengue_provincias", "inflacion_personal",
             "empresas_tamano_sector", "bcra_variables_lista", "congreso_composicion", "justicia_provincias", "ingresos_aglomerados",
             "mortalidad_infantil_causas", "deuda_provincias"]
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

# Calendario de próximos datos (F5 del plan de mejora): los informes del INDEC que alimentan fichas (calendario_indec, de 02) también como
# archivo .ics para sumar a un calendario. Cada informe es un evento de media hora a las 16:00 de la Argentina, escrito en UTC (19:00: el país no
# cambia la hora), así no hace falta describir la zona horaria. El archivo sale igual en cada armado: la marca de tiempo de cada evento es el día
# de la última actualización de los datos y su identificador, una huella de la fecha y el título. Va en CRLF, como pide el formato (RFC 5545):
# .gitattributes lo saca de la regla de LF de sitio/
def _ics_texto(t):
    return t.replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace("\n", "\\n")
def _ics_linea(l):
    # las líneas de más de 75 bytes se parten y la continuación empieza con un espacio, sin cortar una letra por la mitad
    b, partes = l.encode("utf-8"), []
    while len(b) > 75:
        k = 75 if not partes else 74
        while b[k] & 0xC0 == 0x80:
            k -= 1
        partes.append(b[:k].decode("utf-8"))
        b = b[k:]
    return "\r\n ".join(partes + [b.decode("utf-8")])
if "calendario_indec" in D["datos"]:
    _ics_url = json.loads((RAIZ / "datos" / "manual" / "sitio.json").read_text(encoding="utf-8"))["url"].rstrip("/")
    _ics_tit = {f[0]: f[2] for f in FICHAS}
    _ics_d, _ics_m, _ics_a = RESUMEN["actualizado"].split("/")
    _ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Datina//Calendario de datos del INDEC//ES", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
            "X-WR-CALNAME:Datina: próximos datos del INDEC"]
    for _c in D["datos"]["calendario_indec"]:
        assert _c["ficha"] in UBIC and _c["ficha"] in _ics_tit, f"calendario del INDEC: la ficha {_c['ficha']} no está en la plantilla"
        _pg = UBIC[_c["ficha"]]
        _dir = f"{_ics_url}/{'' if _pg == 'inicio' else _pg + '.html'}#{_c['ficha']}"
        _h, _mi = (int(x) for x in _c["hora"].split(":"))
        _ini = datetime.datetime.strptime(_c["fecha"], "%Y-%m-%d").replace(hour=_h, minute=_mi) + datetime.timedelta(hours=3)
        _ics += ["BEGIN:VEVENT", f"UID:{huella(_c['fecha'] + _c['informe'])}@datina", f"DTSTAMP:{_ics_a}{_ics_m}{_ics_d}T000000Z",
                 f"DTSTART:{_ini:%Y%m%dT%H%M%SZ}", f"DTEND:{_ini + datetime.timedelta(minutes=30):%Y%m%dT%H%M%SZ}",
                 "SUMMARY:" + _ics_texto(f"INDEC: {_c['informe']}"),
                 "DESCRIPTION:" + _ics_texto(f"El INDEC publica este informe a las {_c['hora']}. Datina lo suma en su actualización del día 5 que sigue. "
                                             f"En Datina: {_ics_tit[_c['ficha']]} {_dir}"),
                 f"URL:{_dir}", "END:VEVENT"]
    _ics.append("END:VCALENDAR")
    (SITIO / "datos" / "calendario_indec.ics").write_bytes(("\r\n".join(_ics_linea(l) for l in _ics) + "\r\n").encode("utf-8"))

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
             "diagnostico": "portapapeles", "catalogo": "planilla", "laboratorio": "matraz", "mesas": "urna", "datos-destacados": "mosaico"} | ({"consulta-ia": "dialogo"} if CONSULTA_IA else {})
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
_meta_tablas = []
_catalogo, _cat_err = catalogo.armar(plantilla, SECCIONES, UBIC, GRUPOS + _menus_catalogo, indice=_meta_tablas, ia=CONSULTA_IA)
if _cat_err:
    sys.exit("El catálogo de datos tiene problemas: el sitio no se armó.\n" + "\n".join(_cat_err))
# el índice de Consultas con IA lleva lo mismo que antes: sin los organismos ni el origen de cada tabla, que suma catalogo.json
_indice_ia = [{k: v for k, v in t.items() if k not in ("organismos", "origen", "anio_desde", "anio_hasta")} for t in _meta_tablas] if CONSULTA_IA else None


def direccion_ficha(r, tabla):
    """La dirección de la ficha, el artículo o la pieza de una tabla del Catálogo ("#f-empleo" -> "trabajo.html#f-empleo")."""
    p = UBIC.get(r[1:], "") if r.startswith("#") else r[:-5]
    assert p, f"no se sabe en qué página está {r} ({tabla})"
    return (f"{p}.html" if p != "inicio" else "./") + (f"#{r[1:]}" if r.startswith("#") and r[1:] != p else "")


# Las tablas sensibles (decisión 5 del autor del 11 de noviembre de 2026, docs/roadmap/PLAN_TECNICO.md): las que hablan de suicidio, también
# la de muertes violentas, que los cuenta junto con los homicidios (CLAUDE.md, "Temas sensibles"). Quedan fuera del índice de Consultas con
# IA, de los Dataset de schema.org y de llms.txt: una sola regla para todo lo público
def tabla_sensible(t):
    return re.search(r"suicid|autoinflig|autolesi", f'{t["tabla"]} {t["titulo"]} {t["descripcion"]}', re.I) is not None


# las listas de COMNAP no tienen la licencia de Datina (ver los metadatos de abajo)
TABLAS_COMNAP = {"antartida_instalaciones", "antartida_paises", "antartida_bases"}
# Catálogo único (plan técnico, fase 2, 13 de noviembre de 2026): sitio/datos/catalogo.json, con una entrada por tabla del Catálogo: qué mide,
# de dónde sale (los organismos y cada archivo, con el día en que se bajó o se armó), cada cuánto se actualiza, la cobertura, el período,
# las columnas, la licencia, la ficha y si es sensible. De ahí salen el .metadata.json de cada tabla, los Dataset de schema.org y llms.txt,
# y saldrán el MCP y la API (fase 3), que dejan afuera lo sensible y lo que no tiene la licencia de Datina
_URL_SITIO = json.loads((RAIZ / "datos" / "manual" / "sitio.json").read_text(encoding="utf-8"))["url"].rstrip("/")
LICENCIA = ("Creative Commons Atribución 4.0 (CC BY 4.0): se puede copiar y adaptar, también con fines comerciales, citando a Datina y a "
            "la fuente de cada dato. Los datos de base son de cada organismo y se rigen por sus condiciones")
LICENCIA_URL = "https://creativecommons.org/licenses/by/4.0/deed.es"
CATALOGO = []
for _t in _meta_tablas:
    _d = direccion_ficha(_t["ref"], _t["tabla"])
    _ficha = _URL_SITIO + "/" + ("" if _d == "./" else _d)
    _c = {"tabla": _t["tabla"], "csv": f"{_URL_SITIO}/datos/{_t['tabla']}.csv", "metadatos": f"{_URL_SITIO}/datos/{_t['tabla']}.metadata.json",
          "titulo": _t["titulo"], "descripcion": _t["descripcion"], "seccion": _t["seccion"], "ficha": _ficha, "fuente": _t["fuente"],
          "organismos": _t["organismos"], "actualizacion": _t["actualizacion"], "cobertura": _t["cobertura"], "periodo": _t["periodo"],
          "anio_desde": _t["anio_desde"], "anio_hasta": _t["anio_hasta"], "filas": _t["filas"], "columnas": [{"nombre": c, "tipo": ti, "valores": v} for c, ti, v in _t["columnas"]], "unidades": _t["unidades"],
          "como_se_calcula": _t["nota"], "origen": _t["origen"], "sensible": tabla_sensible(_t), "licencia": LICENCIA, "licencia_url": LICENCIA_URL,
          "uso_libre": True,
          # F2 (plan de mejora, 31 de octubre de 2026): la cita que propone "Usar los datos", con el año y el día de la consulta para completar
          "como_citar": f"Datina (año de la consulta). {_t['titulo']}{'' if _t['titulo'].endswith(('?', '.')) else '.'} Con datos de "
                        f"{_t['fuente'].rstrip('.')}. {_ficha}. Consultado el día de la consulta."}
    # las listas de COMNAP se pueden usar solo con fines educativos y sin fines comerciales: esa condición gana sobre la licencia general
    if _t["tabla"] in TABLAS_COMNAP:
        _c.update({"licencia": "Los datos de las instalaciones son de COMNAP y se pueden usar con fines educativos y sin fines comerciales, citando a "
                               "COMNAP. Lo que suma Datina tiene licencia Creative Commons Atribución 4.0",
                   "licencia_datos_de_base": "https://www.comnap.aq/antarctic-facilities-information", "uso_libre": False})
    CATALOGO.append(_c)
(SITIO / "datos" / "catalogo.json").write_text(json.dumps(
    {"sitio": _URL_SITIO, "datos_actualizados": RESUMEN["actualizado"], "licencia": LICENCIA, "licencia_url": LICENCIA_URL,
     "tabla_completa": f"{_URL_SITIO}/datos/tabla_larga.csv",
     "campos": {"anio_desde": "primer y último año con datos (\"anio_hasta\"), de la tabla o, si no tiene una columna de período, de su descripción",
                "origen": "los archivos de los que sale la tabla: \"descargado\" es el día de la última descarga que anduvo (null si no se sabe), "
                          "\"ultimo_intento\" y \"estado\" los de la última actualización (si falló, la tabla usa el archivo anterior), y \"armado\" "
                          "el día en que se armó por última vez un archivo hecho a mano o una sola vez",
                "sensible": "habla de suicidio (CLAUDE.md, \"Temas sensibles\"): no va en los Dataset, en llms.txt ni en Consultas con IA",
                "uso_libre": "false si los datos de base no tienen la licencia de Datina (ver \"licencia\")"},
     "tablas": CATALOGO}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")
# el índice chico de la API y el MCP (plan técnico, fase 3, 14 de noviembre de 2026, functions/_datos/datos.mjs): solo las tablas que se
# ofrecen (ni sensibles ni sin la licencia de Datina) y lo que hace falta para buscarlas. Leer el catálogo entero en cada pedido gastaba la mitad
# de los 10 ms de procesador que Cloudflare da a cada uno. Para describir una tabla, la función lee su .metadata.json
# el texto donde se busca, sin tildes ni mayúsculas, como lo compara normal() de la función: así no se normaliza en cada pedido
_api_sin_tildes = lambda t: "".join(ch for ch in unicodedata.normalize("NFD", t) if not unicodedata.combining(ch)).lower().strip()
(SITIO / "datos" / "catalogo_api.json").write_text(json.dumps(
    {"datos_actualizados": RESUMEN["actualizado"], "tablas": [
        {k: _c[k] for k in ("tabla", "titulo", "descripcion", "seccion", "cobertura", "periodo", "anio_desde", "anio_hasta", "ficha", "organismos")}
        | {"columnas": [x["nombre"] for x in _c["columnas"]], "buscar": _api_sin_tildes(" ".join(
            [_c["tabla"].replace("_", " "), _c["titulo"], _c["descripcion"], _c["seccion"], *_c["organismos"], *(x["nombre"].replace("_", " ") for x in _c["columnas"])]))}
        for _c in CATALOGO if not _c["sensible"] and _c["uso_libre"]]},
    ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8", newline="\n")
# Metadatos de cada tabla (plan de mejora, F3, 28 de octubre de 2026): junto a cada CSV del Catálogo, un .metadata.json con su entrada de
# catalogo.json, para quien baja los datos sin pasar por el sitio. El de una tabla que ya no está se borra
_META_HECHOS = set()
_META_FUERA = {"csv", "metadatos", "sensible", "uso_libre"}
for _c in CATALOGO:
    _m = {k: v for k, v in _c.items() if k not in _META_FUERA}
    _m["tabla"] = f"{_c['tabla']}.csv"
    _m["datos_actualizados"] = RESUMEN["actualizado"]
    (SITIO / "datos" / f"{_c['tabla']}.metadata.json").write_text(json.dumps(_m, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")
    _META_HECHOS.add(f"{_c['tabla']}.metadata.json")
for _f in (SITIO / "datos").glob("*.metadata.json"):
    if _f.name not in _META_HECHOS:
        _f.unlink()
# Dataset de schema.org (plan técnico, fase 1, 11 de noviembre de 2026): cada tabla del Catálogo, en la página de su ficha, para Google Dataset
# Search. Sin las sensibles ni las de COMNAP, cuya licencia no es la de Datina. Los escribe metadatos(), que sabe la dirección definitiva
DATASETS_DE = {}
_DS_REF = {t["tabla"]: t["ref"] for t in _meta_tablas}
for _t in CATALOGO:
    if _t["sensible"] or not _t["uso_libre"]:
        continue
    _t = {**_t, "ref": _DS_REF[_t["tabla"]]}
    _pag, _, _ancla = direccion_ficha(_t["ref"], _t["tabla"]).partition("#")
    DATASETS_DE.setdefault("inicio" if _pag in ("./", "") else _pag.removesuffix(".html"), []).append((_t, _ancla))
# varias tablas comparten la pregunta de su ficha: el nombre del Dataset suma entonces el del archivo, para que ninguno se repita
_NOMBRES_DS = collections.Counter(t["titulo"] for _l in DATASETS_DE.values() for t, _ in _l)
# Consultas con IA: el índice que lee la función functions/api/consulta.js (las mismas tablas que el Catálogo, sin las de suicidio) y el
# código de la página. Sin "consulta_ia", la función contesta que no están activadas porque no encuentra el índice
_IA_INDICE, _IA_JS = SITIO / "datos" / "consulta_ia.json", SITIO / "consulta-ia.js"
if CONSULTA_IA:
    # sin las tablas que hablan de suicidio, tampoco la de muertes violentas, que los cuenta junto con los homicidios (CLAUDE.md, "Temas
    # sensibles"). La función saca además, de cualquier tabla, las columnas y las filas sobre suicidio
    _indice_ia = [t for t in _indice_ia if not tabla_sensible(t)]
    for _t in _indice_ia:
        _t["url"] = direccion_ficha(_t.pop("ref"), _t["tabla"])
    _IA_INDICE.write_text(json.dumps({"actualizado": RESUMEN["actualizado"], "motor": MOTOR_IA, "tablas": _indice_ia}, ensure_ascii=False, separators=(",", ":")),
                          encoding="utf-8", newline="\n")
    _IA_JS.write_text(JS_IA, encoding="utf-8", newline="\n")
else:
    for _f in (_IA_INDICE, _IA_JS, SITIO / "consulta-ia.html"):
        _f.unlink(missing_ok=True)
# El relieve y los glaciares de cada cumbre de f-cumbres (9 de noviembre de 2026): los arma una sola vez scripts/cumbres_relieve.py en
# datos/manual/relieve/ y se copian tal cual a sitio/datos/relieve/. datina.js pide cada uno al elegir su cumbre, con su huella. Lo
# que ya no está en datos/manual se borra, y una cumbre de la tabla sin su relieve frena el armado
_RELIEVE_DIR = SITIO / "datos" / "relieve"
_RELIEVE_DIR.mkdir(parents=True, exist_ok=True)
RELIEVE_V = {}
for _f in sorted((RAIZ / "datos" / "manual" / "relieve").glob("*.json")):
    shutil.copyfile(_f, _RELIEVE_DIR / _f.name)
    RELIEVE_V[_f.stem] = hashlib.sha1(_f.read_bytes()).hexdigest()[:10]
for _f in _RELIEVE_DIR.glob("*.json"):
    if _f.stem not in RELIEVE_V:
        _f.unlink()
with open(RAIZ / "datos" / "manual" / "cumbres_ign.csv", encoding="utf-8") as _f:
    _sin_relieve = [r["id"] for r in csv.DictReader(_f) if r["id"] not in RELIEVE_V]
if _sin_relieve:
    sys.exit(f"Cumbres sin relieve en datos/manual/relieve/ (correr scripts/cumbres_relieve.py): {_sin_relieve}")
(SITIO / "mesas.js").write_text(achicar_js.achicar(JS_MESAS), encoding="utf-8", newline="\n")   # como datina.js, sin comentarios ni sangría
EN_CATALOGO = sorted(re.findall(r'<li class="cat-item" id="cat-(\w+)"', _catalogo))
for marca, valor in {"/*ICONOS*/{}": ICONOS, "/*SEC_ICONO*/{}": SEC_ICONO, "/*SIN_RELACIONES*/[]": sorted(relaciones.EXCLUIDAS),
                     "/*EN_CATALOGO*/[]": EN_CATALOGO, "/*RELIEVE*/{}": RELIEVE_V}.items():
    assert marca in js, marca
    js = js.replace(marca, json.dumps(valor, ensure_ascii=False))
(SITIO / "datina.css").write_text(css, encoding="utf-8", newline="\n")
# D2 (4 de noviembre de 2026): lo que se publica va sin comentarios ni sangría. Las comprobaciones de abajo siguen leyendo `js`, el código entero
JS_SITIO = achicar_js.achicar(js)
(SITIO / "datina.js").write_text(JS_SITIO, encoding="utf-8", newline="\n")
# D3 y topojson desde el propio sitio (plan de estabilización, P0-1, 22 de octubre de 2026): las mismas versiones que se pedían a cdnjs y
# jsDelivr, copiadas byte por byte de scripts/lib/ a sitio/lib/ con sus licencias, y pedidas con su huella como datina.js
# Leaflet 1.9.4 (9 de noviembre de 2026, el mapa de escuelas y hospitales de cada provincia): bajada de npm e igual byte por byte a la de
# jsDelivr. La pide datina.js recién cuando la sección se acerca a la pantalla (la dirección va en la sección, con su huella)
LIBS = {"__V_D3__": "d3-7.8.5.min.js", "__V_TOPOJSON__": "topojson-client-3.1.0.min.js",
        "__V_LEAFLET__": "leaflet-1.9.4.min.js", "__V_LEAFLET_CSS__": "leaflet-1.9.4.css"}
(SITIO / "lib").mkdir(exist_ok=True)
for _lib in (RAIZ / "scripts" / "lib").iterdir():
    shutil.copyfile(_lib, SITIO / "lib" / _lib.name)
V_LIBS = {marca: hashlib.sha1((SITIO / "lib" / nombre).read_bytes()).hexdigest()[:10] for marca, nombre in LIBS.items()}

for marca, valor in {"__VERSION__": huella(datos), "__V_CSS__": huella(css), "__V_JS__": huella(JS_SITIO), **V_LIBS}.items():
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
ORDEN = ORDEN_TEMAS + PAGINAS_MENU + list(FUERA_DE_MENU) + ["nosotros"]
TITULO_DE.update({"provincia": "Tu provincia", "nosotros": "Sobre nosotros", "usar-datos": "Usar los datos", "contacto": "Contacto", "laboratorio": "Laboratorio"})
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
    desc = {"provincia": "Cada provincia frente al país", "nosotros": "Qué es Datina", "usar-datos": "Licencia, cita y descargas", "articulos": f"{len(NOTAS)} artículos",
            "datos-destacados": f"{_N_DATOS_DEST} cifras",
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
    blo = blo.replace("<h2", migas(*partes, prov=pagina not in ("nosotros", "usar-datos", "contacto")) + "<h2", 1)
    # la fila de la categoría, después de la entrada (datina.js pone "En cifras" después de ella)
    if pagina in CATEGORIA:
        blo = re.sub(r'(<div class="tema-intro">.*?</div>)', lambda m: m.group(1) + subsecciones(pagina), blo, count=1, flags=re.S)
    # el índice de capítulos (etapa 6 del plan de mejora, decisión del autor del 27 de octubre de 2026): en las páginas con dos capítulos o
    # más (h2.bloque-grupo con un id g-…), debajo de "En cifras". Desde el 28 de octubre de 2026 (pedido del autor: que se parezca a la fila
    # de Población y Migraciones) tiene el aspecto de la fila de la categoría, con "Capítulos" adelante en lugar del nombre de la categoría.
    # Nada queda escondido: cada ficha conserva su enlace y el buscador la encuentra
    caps = re.findall(r'<h2 class="bloque-grupo" id="(g-[\w-]+)">([^<]+)</h2>', blo)
    if len(caps) >= 2:
        indice = ('<nav class="capitulos" aria-label="Capítulos de esta página"><span class="sub-cat">Capítulos</span>' +
                  "".join(f'<a href="#{i}">{t}</a>' for i, t in caps) + "</nav>")
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


# las páginas de los menús que la plantilla no arma como sección: su nombre en los menús (la pieza de la Corte Suprema). Desde la etapa 6
# del plan de mejora el consultor de pobreza y el Explorador de relaciones ya no están en los menús
NOMBRE_MENU = {"corte-suprema": "La Corte Suprema"}
url_menu = url_pagina
nombre_menu = lambda p: NOMBRE_MENU.get(p) or TITULO_DE[p]
_col = lambda nombre, pares: f'<div class="pie-col"><h2>{e(nombre)}</h2>{lista(pares)}</div>'
# en el pie, cada menú con las páginas que son suyas aunque no estén en él (Consultas con IA), y el Explorador de relaciones en Datina
MAPA = ("".join(_col(n, [(url_pagina(s), TITULO_DE[s]) for s in _secs_de(items)]) for _, n, items in GRUPOS)
        + "".join(_col(completo, [(url_menu(p), nombre_menu(p)) for p in _secs_de(items) + [q for q, d in FUERA_DE_MENU.items() if d == m]])
                  for m, _, completo, _, items in MENUS)
        + _col("Datina", [("nosotros.html", "Sobre nosotros"), ("nosotros.html#como-se-hace", "Cómo se hace"),
                          ("nosotros.html#fuentes", "De dónde salen los datos"), ("usar-datos.html", "Usar los datos"), ("relaciones.html", "Explorador de relaciones"),
                          ("contacto.html", "Contacto")]))
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
_li_prov = lambda c: (f'<li><a class="con-bandera" href="{PAG_PROV[c]}.html"><img class="bandera" src="datos/banderas/{c}.png" alt="" '
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
# Datos destacados: fijos, que se pasan a mano (pedido del autor del 6 de noviembre de 2026, que además pidió uno de la Antártida). Son los cuatro que
# eligió el 23 de octubre de 2026 (esperanza de vida, salarios, homicidios y petróleo) y cinco más, y desde el 10 de noviembre de 2026 (pedido del autor:
# cuatro por vista y doce en total) la desocupación, los cargos de juez federal sin titular y la nafta. En la computadora se ven de a cuatro y cada tanda
# lleva los cuatro grupos. La cifra es la cifra destacada de la ficha (CLAVE en datina.js), que se calcula en el navegador: el constructor escribe el
# grupo, la pregunta y el enlace, y deja reservado el lugar de la cifra para que la portada no salte. Nunca una ficha de suicidio ni de muertes violentas
DESTACADOS = [("personas", "f-nacimientos"), ("economia", "f-salarios"), ("estado", "f-homicidios"), ("territorio", "f-petroleo"),
              ("personas", "f-esperanza"), ("economia", "f-inflacion"), ("estado", "f-sin-condena"), ("territorio", "f-ant-bases"),
              ("personas", "f-pobreza"), ("economia", "f-desocupacion"), ("estado", "f-jueces-federales"), ("territorio", "f-combustibles")]
assert len(DESTACADOS) % 4 == 0 and all(len({g for g, _ in DESTACADOS[i:i + 4]}) == 4 for i in range(0, len(DESTACADOS), 4)), \
    "datos destacados: cada tanda de cuatro tiene que llevar los cuatro grupos"
# la pregunta de cada dato destacado (D7 del plan del 26 de octubre de 2026): la cifra es la del país, así que la pregunta también. La de
# la ficha pregunta por las provincias, que muestra su gráfico
_PREG_DEST = {"f-esperanza": "¿Cuántos años se vive en la Argentina?", "f-salarios": "¿Cuánto se gana en un empleo privado registrado?",
              "f-homicidios": "¿Cuántas víctimas de homicidio hay en la Argentina?", "f-petroleo": "¿Cuánto petróleo produce el país?",
              "f-nacimientos": "¿Cuántos chicos nacen por año?", "f-inflacion": "¿Cuánto suben los precios?",
              "f-pobreza": "¿Cuántas personas viven bajo la línea de pobreza?", "f-sin-condena": "¿Qué parte de las personas presas no tiene condena?",
              "f-ant-bases": "¿Cuántas bases tiene la Argentina en la Antártida?", "f-desocupacion": "¿Cuánta gente busca trabajo y no consigue?",
              "f-jueces-federales": "¿Qué parte de los cargos de juez federal no tiene titular?", "f-combustibles": "¿Cuánto cuesta la nafta?"}
_clave_js = js[js.index("const CLAVE = {"):js.index("\n};", js.index("const CLAVE = {"))]
_ficha = {f[0]: f for f in FICHAS}
_nombre_grupo = {g: n for g, n, _ in GRUPOS}
for _g, _id in DESTACADOS:
    assert f'"{_id}":' in _clave_js, f"{_id}: el dato destacado necesita una cifra destacada (CLAVE)"
    assert _id not in TEXTO_ANTES and _ficha[_id][2], f"{_id}: no puede ser un dato destacado o le falta la pregunta fija"
    assert GRUPO_DE[_ficha[_id][1]][0] == _g, f"{_id}: no es del grupo {_g}"
_destacados = "".join(f'<a class="tarjeta destacado" href="{url_pagina(UBIC[i])}#{i}" data-clave="{i}"><span class="c-lab">{e(_nombre_grupo[g])}</span>'
                      f'<span class="c-preg">{e(_PREG_DEST[i])}</span><span class="c-num"></span><span class="c-pie"><span class="c-txt"></span><span class="c-rango"></span></span></a>'
                      for g, i in DESTACADOS)
# La página de datos destacados (segunda fase del brief de pulido, 6 de noviembre de 2026): la cifra destacada de cada ficha de los cuatro grupos de temas, en
# el orden de GRUPOS y de la página de cada tema. Respuestas del autor de ese día: una sola columna, sin tarjetas, el grupo una vez como título y en cada dato
# su tema, con la pregunta de su ficha. Los doce de la portada llevan la misma pregunta que allá, para que un dato no tenga dos. Las fichas sin cifra
# destacada (SIN_CIFRA en prueba_cifras.mjs: temas sensibles, Instituciones políticas, encuestas) no están en CLAVE, y Curiosidades no es de ningún grupo. Como
# en la portada, la cifra y su texto los escribe datina.js, y el enlace es la pregunta, para que el lector de pantalla no lea el dato entero
_dd_clave = set(re.findall(r'"(f-[\w-]+)":', _clave_js))
_dd_grupos = [(g, n, [f for s in _secs_de(items) for f in FICHAS if f[1] == s and f[0] in _dd_clave]) for g, n, items in GRUPOS]
_N_DATOS_DEST = sum(len(fs) for _, _, fs in _dd_grupos)
for _, _, _fs in _dd_grupos:
    for _f in _fs:
        assert _f[0] not in TEXTO_ANTES and not _f[6], f"{_f[0]}: una ficha de un tema sensible no puede estar en Datos destacados"
        assert _f[2], f"{_f[0]}: a la ficha le falta la pregunta fija, y la necesita en Datos destacados"
_datos_destacados = ('<nav class="dd-indice" aria-label="Grupos de esta página">' + "".join(f'<a class="enlace" href="#dd-{g}">{e(n)}</a>' for g, n, _ in _dd_grupos) + "</nav>"
                     + "".join(f'<div class="dd-grupo"><h2 class="dd-grupo-tit" id="dd-{g}">{e(n)}</h2><ul class="dd-lista">'
                               + "".join(f'<li class="dd-dato" data-clave="{f[0]}"><span class="dd-tema">{e(TITULO_DE[f[1]])}</span>'
                                         f'<h3 class="dd-preg"><a href="{url_pagina(UBIC[f[0]])}#{f[0]}">{e(_PREG_DEST.get(f[0], f[2]))}</a></h3>'
                                         '<span class="c-num"></span><span class="c-txt"></span></li>' for f in fs) + "</ul></div>" for g, n, fs in _dd_grupos))
# Provincias: las 24 jurisdicciones con su bandera, cada una a su perfil. Es también la forma de llegar con el teclado a lo que muestra
# el mapa de la portada, que el teclado saltea. Sin bajada desde el 10 de noviembre de 2026 (pedido del autor, como Historias y Herramientas):
# Departamentos y Ordenar las 24 están en el menú Provincias y en el pie
_provincias_home = ('<ul class="prov-home">'
                    + "".join(f'<li><a href="{PAG_PROV[c]}.html"><img class="bandera" src="datos/banderas/{c}.png" alt="" width="24" height="16" '
                              f'loading="lazy" decoding="async">{e(NOMBRE_PROV[c])}</a></li>' for c in _PROVS) + "</ul>")
# Historias con datos: los tres artículos los agrega datina.js (el de la relación más marcada primero, regla aprobada el 5 de octubre de
# 2026) antes de las piezas del Laboratorio con página propia, que escribe el constructor
_historias_home = "".join(f'<a class="tarjeta art-card" href="{i}.html"><span class="art-ico">{icono_svg(ico)}</span><span class="art-txt">'
                          f'<b>{e(html.unescape(t))}</b><small>Laboratorio</small></span></a>' for i, ico, t, _ in PIEZAS)
# Herramientas: Consultas con IA y las del menú, en su orden, con el mismo dibujo que las tarjetas de antes (las armaba datina.js). Desde
# la etapa 6 del plan de mejora Ordenar las 24 y Departamentos están en Provincias (arriba), el Diagnóstico educativo en Educación y el
# consultor de pobreza en Pobreza y hogares
def _tarjeta_herr(p):
    titulo, preg, ico = _SEC[p][1], _SEC[p][7] or _SEC[p][2], SEC_ICONO[p]
    return (f'<a class="tarjeta sec-tarjeta herr" href="{url_menu(p)}">{icono_svg(ico).replace(chr(34) + "iso ", chr(34) + "iso sec-ico ", 1)}'
            f'<span class="sec-tipo">Herramienta</span><b style="view-transition-name:t-{p}">{e(titulo)}</b><span class="sec-preg">{e(preg)}</span></a>')


_herramientas_home = "".join(_tarjeta_herr(p) for p in [q for q, m in FUERA_DE_MENU.items() if m == "herramientas"]
                             + _secs_de(next(x[4] for x in MENUS if x[0] == "herramientas")))
for marca, valor in {"<!--TEMAS-BARRA-->": _barra, "<!--TEMAS-MENU-->": _menu, "<!--GRUPOS-MENU-->": _grupos_menu, "<!--CATALOGO-->": _catalogo,
                     "<!--DESTACADOS-->": _destacados, "<!--DATOS-DESTACADOS-->": _datos_destacados, "<!--PROVINCIAS-HOME-->": _provincias_home,
                     "<!--HISTORIAS-HOME-->": _historias_home, "<!--HERRAMIENTAS-HOME-->": _herramientas_home,
                     '<div class="secciones-grid" id="secciones-grid"></div>': f'<div class="secciones-grid" id="secciones-grid">{_temas_portada}</div>'}.items():
    assert base.count(marca) == 1, marca
    base = base.replace(marca, valor)
# Formularios de contacto y suscripción: los recibía Netlify. Desde el 23 de octubre de 2026 el sitio va a Cloudflare Pages, que no los
# recibe, y el autor decidió ocultarlos hasta elegir otro servicio. Con "formularios" vacío en datos/manual/sitio.json, el armado saca la
# suscripción del pie y el formulario de Contacto, que da el correo de "correo_contacto" o dice que todavía no está disponible. Con "netlify", quedan como estaban
SITIO_CONF = json.loads((RAIZ / "datos" / "manual" / "sitio.json").read_text(encoding="utf-8"))
FORMULARIOS = SITIO_CONF.get("formularios", "").strip()
assert FORMULARIOS in ("", "netlify"), 'datos/manual/sitio.json: "formularios" tiene que ser "netlify" o quedar vacío'
if not FORMULARIOS:
    base, _n = re.subn(r'\s*<!-- suscripción \(11 de octubre.*?</form>', "", base, count=1, flags=re.S)
    assert _n == 1, "no se encontró la suscripción del pie en la plantilla"
    # con "correo_contacto" (14 de noviembre de 2026, decisión del autor), el correo en lugar del aviso: va al revés en data-correo y datina.js
    # lo arma al cargar, así los robots que juntan correos no lo leen. Sin JavaScript, escrito con "arroba"
    _correo = SITIO_CONF.get("correo_contacto", "").strip()
    assert not _correo or re.fullmatch(r"[\w.+-]+@[\w-]+(\.[\w-]+)+", _correo), 'datos/manual/sitio.json: "correo_contacto" no es un correo'
    _contacto = (f'<p class="form-nota contacto-correo">Escribinos a <a data-correo="{_correo[::-1]}" href="contacto.html">nuestro correo</a>.'
                 f'<noscript> {_correo.replace("@", " arroba ")}</noscript></p>' if _correo else
                 '<p class="form-nota">El formulario de contacto todavía no está disponible.</p>')
    base, _n = re.subn(r'<!-- formulario de Netlify.*?<p class="form-gracias" id="susc-gracias" hidden>[^<]*</p>',
                       lambda m: _contacto, base, count=1, flags=re.S)
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
    """Los grupos del perfil con tarjetas vacías, igual a lo que arma datina.js."""
    return "".join(f'<section class="perfil-grupo" id="pg-{g}" aria-labelledby="pg-{g}-t"><div class="perfil-cab"><h2 class="bloque-grupo" '
                   f'id="pg-{g}-t"><span>{t}</span></h2></div>'
                   f'<div class="perfil-tarjetas">{tarjetas_vacias(PERFIL_G.count(g), "dp esqueleto")}</div></section>'
                   for g, t in PERFIL_GRUPOS)


def perfil_menu():
    """El menú de la página de provincia (5 de noviembre de 2026, pedido del autor: la lista numerada "queda horrible", "podría ser un menú
    longitudinal, o tipo hamburguesa"). Tres grupos, separados por una línea fina: lo de arriba de la página, los temas y la historia, en el
    orden en que aparecen. datina.js esconde lo que no se ve con la provincia elegida y copia los títulos de las secciones. Mismo aspecto que
    la fila de capítulos: una letra, un tamaño y sin negrita, con la marca amarilla en lo que se está viendo."""
    grupos = [[("prov-destaca", "Dónde se destaca"), ("prov-compara", "Comparar con otra provincia"), ("prov-puestos", "Cómo cambió su puesto"),
               ("prov-censos", "Cómo cambió entre los censos 2010 y 2022"), ("prov-establecimientos", "Escuelas y hospitales")],
              [(f"pg-{g}", t) for g, t in PERFIL_GRUPOS],
              [("prov-historia", "Historia")]]
    listas = "".join("<ul>" + "".join(f'<li><a href="#{i}">{t}</a></li>' for i, t in g) + "</ul>" for g in grupos)
    return (f'<nav class="prov-indice" id="perfil-indice" aria-label="En esta página">'
            f'<button type="button" class="pi-btn" aria-expanded="false" aria-controls="pi-listas"><span class="pi-txt">En esta página'
            f'<span class="pi-actual"></span></span><span class="desp-signo" aria-hidden="true"></span></button>'
            f'<p class="pi-tit">En esta página</p><div class="pi-listas" id="pi-listas">{listas}</div></nav>')
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
                     f'<div class="prov-grid" id="prov-grid">{perfil_vacio()}</div>', 1).replace("<!--PROV-INDICE-->", perfil_menu(), 1)


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
# el título y la descripción de cada página que se indexa, para llms.txt (plan técnico, fase 1)
PAGINA_INFO = {}
# El dato destacado de la imagen al compartir de cada página (D3): el de su primera ficha o el más representativo. Sale del resumen, y si un dato
# no está (una fuente caída), la imagen sale sin él. Las páginas de política y las que no tienen un dato propio llevan solo la pregunta
_og_n = lambda v, d=0: f"{Decimal(str(v)).quantize(Decimal(1).scaleb(-d), rounding=ROUND_HALF_UP):,}".replace(",", "#").replace(".", ",").replace("#", ".")
_og_pct = lambda v: _og_n(v, 1) + "%"
_R = RESUMEN
OG_DATO = {
    "trabajo": lambda: (_og_n(_R["empleo"]["cada_100_pais"], 1), f"personas asalariadas registradas en el sector privado cada 100 habitantes, {_R['empleo']['mes']}"),
    "economia": lambda: (_og_pct(_R["economia"]["ipc"]["interanual"]), f"subieron los precios al consumidor en los doce meses hasta {_R['economia']['ipc']['mes']}"),
    "empresas": lambda: (_og_n(_R["empresas"]["total_pais"]), f"empresas privadas con personal en relación de dependencia en {_R['empresas']['anio']}"),
    "pobreza": lambda: (_og_pct(_R["pobreza"]["pob"]), f"de las personas de los 31 aglomerados urbanos bajo la línea de pobreza, {_R['pobreza']['sem']}"),
    "salud": lambda: (_og_n(_R["mortalidad"]["tasa"], 1), f"muertes de menores de un año cada 1.000 nacidos vivos en {_R['mortalidad']['anio']}"),
    "seguridad": lambda: (_og_n(_R["seguridad"]["hom_tasa"], 1), f"víctimas de homicidios dolosos cada 100.000 habitantes en {_R['seguridad']['anio']}"),
    "educacion": lambda: (_og_pct(_R["aprender"]["mat"]), f"de los estudiantes de {_R['aprender']['nivel'].replace(' grado', '° grado')} con nivel satisfactorio o avanzado en matemática, Aprender {_R['aprender']['anio']}"),
    "externo": lambda: (f"{_og_n(abs(_R['externo']['balanza']['saldo']))} millones", f"de dólares de {'superávit' if _R['externo']['balanza']['saldo'] >= 0 else 'déficit'} comercial en {_R['externo']['balanza']['anio']}"),
    "poblacion": lambda: (_og_n(_R["nacimientos"]["n_ult"]), f"nacimientos en {_R['nacimientos']['anio_ult']}, {_og_pct(abs(_R['nacimientos']['caida']))} menos que en {_R['nacimientos']['anio_pico']}"),
    "movilidad": lambda: (f"{_og_n(_R['sube']['total_millones'], 2)} millones", f"de tarjetas SUBE usadas en un día hábil típico de {_R['sube']['mes']}"),
    "construccion": lambda: (_og_pct(abs(_R["construccion"]["isac_var"])), f"{'cayó' if _R['construccion']['isac_var'] < 0 else 'creció'} la actividad de la construcción en {_R['construccion']['isac_mes']} frente a un año antes"),
    "energia": lambda: (_og_pct(_R["energia"]["crec_total"]), f"creció la demanda eléctrica entre {_R['energia']['anio_ini']} y {_R['energia']['anio_ult']}"),
    "petroleo": lambda: (f"{_og_n(_R['petroleo']['kbd'])} mil", f"barriles de petróleo por día en {_R['petroleo']['mes']}"),
    "turismo": lambda: (f"{_og_n(_R['turismo']['turistas'] / 1e6, 1)} millones", f"de turistas no residentes llegaron al país en {_R['turismo']['anio']}"),
    "naturaleza": lambda: (_og_pct(_R["naturaleza"]["pct"]), f"del territorio continental en áreas protegidas, {_R['naturaleza']['anio']}"),
    "curiosidades": lambda: (f"{_og_n(_R['curiosidades']['carne_v'], 1)} kg", f"de carne vacuna por habitante en {_R['curiosidades']['carne_anio']}"),
}


def _og_dato(id_):
    try:
        return OG_DATO[id_]() if id_ in OG_DATO else (None, None)
    except (KeyError, TypeError):
        return None, None


_MESES_ISO = {m: i for i, m in enumerate(["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre",
                                          "noviembre", "diciembre"], 1)}


def periodo_iso(p):
    """El período del Catálogo en ISO 8601, para temporalCoverage: "2012 a 2024" -> "2012/2024", "enero de 2020 a agosto de 2026" ->
    "2020-01/2026-08". Lo que no se entiende queda afuera (None)."""
    def uno(x):
        x = x.strip()
        if re.fullmatch(r"\d{4}", x):
            return x
        m = re.fullmatch(r"(?:\d{1,2} de )?([a-z]+) de (\d{4})", x)
        return f"{m.group(2)}-{_MESES_ISO[m.group(1)]:02d}" if m and m.group(1) in _MESES_ISO else None
    partes = [uno(x) for x in p.split(" a ")] if p else []
    return "/".join(partes) if 1 <= len(partes) <= 2 and all(partes) else None


def fuente_corta(f):
    """La fuente del Catálogo solo con el organismo: a veces suma cada cuánto se actualiza y si el dato está atrasado."""
    return re.split(r"\. (?=Se actualiza|El último dato|Último dato)", f.strip())[0].rstrip(".")


def dataset_ld(t, ancla, archivo):
    """El Dataset de una tabla del Catálogo: qué mide, de dónde sale, el período, la licencia y el CSV para descargar."""
    partes = [t["titulo"], t["descripcion"], f'Fuente: {t["fuente"]}', f'Cobertura: {t["cobertura"]}', f'Período: {t["periodo"]}' if t["periodo"] else "",
              t["actualizacion"]]
    partes = [x.strip().rstrip(",:") for x in partes if x and x.strip()]
    ds = {"@type": "Dataset", "name": t["titulo"] if _NOMBRES_DS[t["titulo"]] == 1 else f'{t["titulo"]} ({t["tabla"]}.csv)',
          "description": " ".join(x if x.endswith((".", "?")) else x + "." for x in partes),
          "url": f"{URL_SITIO}/{archivo}" + (f"#{ancla}" if ancla else ""), "inLanguage": "es-AR", "isAccessibleForFree": True,
          "license": "https://creativecommons.org/licenses/by/4.0/", "creator": {"@type": "Organization", "name": "Datina", "url": f"{URL_SITIO}/"},
          "creditText": "Datina, con datos de " + fuente_corta(t["fuente"]),
          "spatialCoverage": "Argentina", "keywords": [t["seccion"]],
          "distribution": [{"@type": "DataDownload", "encodingFormat": "text/csv", "contentUrl": f'{URL_SITIO}/datos/{t["tabla"]}.csv'}]}
    if periodo_iso(t["periodo"]):
        ds["temporalCoverage"] = periodo_iso(t["periodo"])
    return ds


def metadatos(id_, titulo_social, descripcion, tipo):
    # Cloudflare Pages sirve cada página sin el .html (trabajo.html redirige a /trabajo, docs/deploy/CLOUDFLARE.md): las direcciones
    # absolutas (canonical, og:url, JSON-LD y sitemap.xml) van sin él, así los buscadores no pasan por la redirección
    archivo = "" if id_ == "inicio" else id_
    m = [f'<meta property="og:site_name" content="Datina">', '<meta property="og:locale" content="es_AR">',
         f'<meta property="og:type" content="{tipo}">', f'<meta property="og:title" content="{e(titulo_social)}">',
         f'<meta property="og:description" content="{e(descripcion)}">',
         f'<meta name="twitter:card" content="{"summary_large_image" if URL_SITIO else "summary"}">',
         f'<meta name="twitter:title" content="{e(titulo_social)}">', f'<meta name="twitter:description" content="{e(descripcion)}">']
    if URL_SITIO:
        m += [f'<link rel="canonical" href="{URL_SITIO}/{archivo}">', f'<meta property="og:url" content="{URL_SITIO}/{archivo}">']
        # la imagen al compartir: la pregunta sin el nombre de la sección (el título social de una sección es "Trabajo: ¿...?")
        imagen_social.asegurar(SITIO / "og", id_, re.sub(r"^[^¿]*:\s*(?=¿)", "", titulo_social), *_og_dato(id_))
        m += [f'<meta property="og:image" content="{URL_SITIO}/og/{id_}.png">', f'<meta property="og:image:width" content="{imagen_social.ANCHO}">',
              f'<meta property="og:image:height" content="{imagen_social.ALTO}">', f'<meta property="og:image:alt" content="{e(titulo_social)}">',
              f'<meta name="twitter:image" content="{URL_SITIO}/og/{id_}.png">']
    if tipo == "article":
        ld = {"@context": "https://schema.org", "@type": "Article", "headline": titulo_social, "description": descripcion, "inLanguage": "es-AR",
              "author": {"@type": "Organization", "name": "Datina"}, "publisher": {"@type": "Organization", "name": "Datina"}}
        if URL_SITIO:
            ld["url"] = ld["mainEntityOfPage"] = f"{URL_SITIO}/{archivo}"
        m.append('<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False).replace("</", "<\\/") + "</script>")
    # las tablas de las fichas de esta página (fase 1 del plan técnico). Las 24 páginas fijas de las provincias lo sacan: van solo en provincia.html
    if URL_SITIO and id_ in DATASETS_DE:
        ld = {"@context": "https://schema.org", "@graph": [dataset_ld(t, a, archivo) for t, a in DATASETS_DE[id_]]}
        m.append('<script type="application/ld+json" id="ld-tablas">' + json.dumps(ld, ensure_ascii=False).replace("</", "<\\/") + "</script>")
    if id_ == "inicio" and URL_SITIO:
        ld = {"@context": "https://schema.org", "@type": "Dataset", "name": "Datina: tabla completa de indicadores por jurisdicción",
              "description": "Todos los indicadores de Datina en una sola tabla: una fila por jurisdicción, período e indicador, con su unidad y su fuente.",
              "inLanguage": "es-AR", "creator": {"@type": "Organization", "name": "Datina"}, "spatialCoverage": "Argentina",
              "license": "https://creativecommons.org/licenses/by/4.0/",
              "distribution": [{"@type": "DataDownload", "encodingFormat": "text/csv", "contentUrl": f"{URL_SITIO}/datos/tabla_larga.csv"}]}
        m.append('<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False).replace("</", "<\\/") + "</script>")
    INDEXADAS.append(archivo)
    PAGINA_INFO[archivo] = (titulo_social, descripcion)
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
        # una ficha unida a otra (R7): su dirección vieja sigue andando, y abre la pestaña que era suya
        p = UBIC.get(id2) or UBIC.get(FICHAS_UNIDAS.get(id2, ""))
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
_h_prov = pagina("provincia", "Tu provincia",
                 "El perfil de cada provincia: sus indicadores frente al total del país, su posición entre las 24 jurisdicciones, su historia y las provincias que más se le parecen.",
                 {"provincia"})
# Las 24 páginas fijas: la misma página, con su título, su descripción, su dirección y su imagen, y la provincia ya elegida (data-prov, que lee datina.js)
_POB_PROV = {f["codigo_indec"]: f["personas_hoy"] for f in json.loads((SITIO / "datos" / "fichas.json").read_text(encoding="utf-8"))["datos"]["poblacion_proyectada_provincias"]}
for _c, _a in PAG_PROV.items():
    _n = NOMBRE_PROV[_c]
    _t, _d = f"{_n} en números", (f"El perfil de {_n}: sus indicadores frente al total del país, su posición entre las 24 jurisdicciones, su historia y las jurisdicciones "
                                  "que más se le parecen.")
    _h = _h_prov.replace('<body data-pagina="provincia"', f'<body data-pagina="provincia" data-prov="{_c}"', 1)
    _h = re.sub(r"<title>[^<]*</title>", f"<title>{e(_t)} | Datina</title>", _h, count=1)
    _h = re.sub(r'\n<script type="application/ld\+json" id="ld-tablas">.*?</script>', "", _h, count=1, flags=re.S)
    for _q, _v in [('name="description"', _d), ('property="og:description"', _d), ('name="twitter:description"', _d), ('property="og:title"', _t), ('name="twitter:title"', _t),
                   ('property="og:image:alt"', _t)]:
        _h, _cu = re.subn(rf'(<meta {_q} content=")[^"]*"', lambda m: m.group(1) + e(_v) + '"', _h, count=1)
        assert _cu == 1, f"{_a}: falta {_q}"
    if URL_SITIO:
        _h = _h.replace(f'<link rel="canonical" href="{URL_SITIO}/provincia">', f'<link rel="canonical" href="{URL_SITIO}/{_a}">', 1)
        _h = _h.replace(f'<meta property="og:url" content="{URL_SITIO}/provincia">', f'<meta property="og:url" content="{URL_SITIO}/{_a}">', 1)
        _h = _h.replace(f'{URL_SITIO}/og/provincia.png', f'{URL_SITIO}/og/{_a}.png')
        imagen_social.asegurar(SITIO / "og", _a, _t, _og_n(_POB_PROV[_c]), f"habitantes en {RESUMEN['poblacion_proy']['anio']}, según las proyecciones del INDEC",
                               SITIO / "datos" / "banderas" / f"{_c}.png")
    (SITIO / f"{_a}.html").write_text(_h, encoding="utf-8", newline="\n")
    INDEXADAS.append(_a)
    PAGINA_INFO[_a] = (_t, _d)
# Sobre nosotros: proposito, principios y forma de trabajo de Datina
pagina("nosotros", "Sobre nosotros",
       "Qué es Datina, para qué existe, de dónde salen sus datos y cómo se hace. Estadísticas públicas de las 24 jurisdicciones de la Argentina.",
       {"nosotros"})
# Usar los datos (F2 y F3): la licencia, cómo citar y qué se puede descargar
pagina("usar-datos", "Usar los datos",
       "Cómo reutilizar los datos de Datina: la licencia, cómo citar una ficha, qué tablas y metadatos se pueden descargar y de dónde sale cada dato.",
       {"usar-datos"})
# Laboratorio (etapa 33): piezas visuales grandes, como The Viz Lab de USAFacts
pagina("laboratorio", "Laboratorio",
       "Piezas visuales con datos públicos: cada juez de la Corte Suprema, cada pozo de Vaca Muerta y las 24 jurisdicciones año por año, con sus fuentes.",
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
        # la lista de Artículos (art-lista desde la Fase 2: el nombre viejo, art-grid, ya no aparecía) y los datos breves (F6, 1 de noviembre
        # de 2026), que van solo en articulos.html: hasta el 2 de noviembre se colaban arriba de cada artículo
        s = re.sub(r'\s*<div class="art-(?:grid|lista)" id="art-grid"></div>', "", s, count=1)
        s = re.sub(r'\s*<!-- F6 .*?-->', "", s, count=1, flags=re.S)
        s = re.sub(r'\s*<div class="breves" id="breves">.*?<div class="breves-lista" id="breves-lista"></div>\s*</div>', "", s, count=1, flags=re.S)
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
# Un archivo por indicador de la tabla larga (plan técnico, fase 3, 14 de noviembre de 2026): sitio/datos/indicadores/<variable>.csv, con
# jurisdicción, período y valor, y sitio/datos/indicadores.json, con la unidad, la fuente, los períodos y la ficha de cada uno. Los lee la API
# y el MCP de functions/_datos/: la tabla larga entera (7 MB) no entra en los 10 ms de procesador que Cloudflare da a cada pedido. Las
# variables de suicidio no salen (CLAUDE.md, "Temas sensibles"): ni archivo ni entrada en el índice
SIN_SUICIDIO_RE = re.compile(r"suicid|autoinflig|autolesi", re.I)
_IND_DIR = SITIO / "datos" / "indicadores"
_IND_DIR.mkdir(parents=True, exist_ok=True)
_ind_ficha = {}
for _f, _m in json.loads(relaciones.CATALOGO.read_text(encoding="utf-8")).get("fichas", {}).items():
    for _v in _m.get("variables", []):
        _ind_ficha.setdefault(_v, _f)
_ind_filas = collections.defaultdict(list)
with open(RAIZ / "datos" / "ordenado" / "tabla_larga.csv", encoding="utf-8", newline="") as _fh:
    for _r in csv.DictReader(_fh):
        if not SIN_SUICIDIO_RE.search(f'{_r["variable"]} {_r["unidad"]} {_r["fuente"]}'):
            _ind_filas[_r["variable"]].append(_r)
_ind_indice, _ind_hechos = [], set()
for _v, _filas in sorted(_ind_filas.items()):
    assert re.fullmatch(r"[\w-]+", _v), f"variable con un nombre que no sirve de archivo: {_v!r}"
    with open(_IND_DIR / f"{_v}.csv", "w", encoding="utf-8", newline="") as _fh:
        _w = csv.writer(_fh, lineterminator="\n")
        _w.writerow(["codigo_indec", "territorio", "periodo", "valor"])
        _w.writerows([_r["codigo_indec"], _r["territorio"], _r["periodo"], _r["valor"]] for _r in _filas)
    _ind_hechos.add(f"{_v}.csv")
    _pers = sorted({_r["periodo"] for _r in _filas})
    _fi = _ind_ficha.get(_v)
    _ind_indice.append({"variable": _v, "unidad": _filas[0]["unidad"], "fuente": _filas[0]["fuente"], "desde": _pers[0], "hasta": _pers[-1],
                        "filas": len(_filas), "jurisdicciones": sorted({_r["codigo_indec"] for _r in _filas}),
                        "ficha": (_URL_SITIO + "/" + direccion_ficha(f"#{_fi}", _v).replace("./", "")) if _fi and _fi[0:2] == "f-" and _fi in UBIC else None})
for _f in _IND_DIR.glob("*.csv"):
    if _f.name not in _ind_hechos:
        _f.unlink()
(SITIO / "datos" / "indicadores.json").write_text(json.dumps(
    {"datos_actualizados": RESUMEN["actualizado"], "licencia": LICENCIA, "licencia_url": LICENCIA_URL, "indicadores": _ind_indice},
    ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")
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
imagen_social.terminar()
# sitemap.xml y robots.txt solo con la dirección definitiva (datos/manual/sitio.json). Sin ella se borran, si quedaron de antes
for _f in ("sitemap.xml", "robots.txt"):
    (SITIO / _f).unlink(missing_ok=True)
# lastmod (plan técnico, fase 1, 11 de noviembre de 2026): la fecha de la última actualización de los datos, la misma para todas las páginas.
# No la del día del armado: armar otro día tiene que dar los mismos archivos
LASTMOD = "-".join(reversed(RESUMEN["actualizado"].split("/")))
assert re.fullmatch(r"\d{4}-\d{2}-\d{2}", LASTMOD), f"la fecha de actualización no se entiende: {RESUMEN['actualizado']}"
if URL_SITIO:
    (SITIO / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
                                     "".join(f"  <url><loc>{URL_SITIO}/{a}</loc><lastmod>{LASTMOD}</lastmod></url>\n" for a in INDEXADAS) + "</urlset>\n",
                                     encoding="utf-8", newline="\n")
    (SITIO / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {URL_SITIO}/sitemap.xml\n", encoding="utf-8", newline="\n")
# llms.txt (plan técnico, fase 1, 11 de noviembre de 2026): la guía del sitio para los asistentes de IA (formato de llmstxt.org). Sale de GRUPOS,
# MENUS, los artículos y el Catálogo, con el título y la descripción de cada página, y lista las mismas páginas que el sitemap. Va primero lo
# que se lee sin JavaScript: el Catálogo, las tablas y sus metadatos. Sin las tablas sensibles (decisión 5 del autor) ni las de COMNAP, como
# los Dataset. Solo con la dirección definitiva, como el sitemap
(SITIO / "llms.txt").unlink(missing_ok=True)
if URL_SITIO:
    _llu = lambda a: f"{URL_SITIO}/{a}"
    _llista = []
    def _llpag(a):
        _llista.append(a)
        _t, _d = PAGINA_INFO[a]
        # la descripción de las secciones empieza con el mismo título: no se repite
        _d = _d.removeprefix(_t).strip()
        return f"- [{_t}]({_llu(a)})" + (f": {_d}" if _d else "")
    _lltab = [t for t in CATALOGO if not t["sensible"] and t["uso_libre"]]
    _llej = next((t for t in _lltab if t["tabla"] == "empleo_provincias"), _lltab[0])["tabla"]
    _ll = ["# Datina", "",
           f"> Estadísticas públicas de la Argentina y de sus 24 jurisdicciones: cada cifra con qué mide, de qué período es, de dónde sale y su "
           f"tabla para descargar. {len(_lltab)} tablas con licencia Creative Commons Atribución 4.0. Datos actualizados el {RESUMEN['actualizado']}.", "",
           "Datina reúne datos de organismos públicos (el INDEC, los ministerios nacionales, el Banco Central y otros) y los compara entre las "
           "jurisdicciones. En cada página, las cifras y los textos que las explican los escribe el navegador al cargarla: para leer los datos sin "
           "ejecutar JavaScript, conviene ir a las tablas. Cada tabla en CSV tiene al lado un archivo .metadata.json con su fuente, su período, sus "
           f"columnas, su licencia y cómo citarla (por ejemplo, {_llu('datos/' + _llej + '.metadata.json')}).", "",
           "Los textos, los gráficos y las tablas de Datina se pueden copiar y adaptar, también con fines comerciales, citando a Datina y a la fuente "
           "de cada dato. Los datos de base son de cada organismo y se rigen por sus condiciones.", "",
           "## Datos para descargar", "", _llpag("catalogo"),
           f"- [Tabla completa de indicadores]({_llu('datos/tabla_larga.csv')}): todos los indicadores en una sola tabla, una fila por jurisdicción, "
           "período e indicador, con su unidad y su fuente.",
           f"- [Catálogo en JSON]({_llu('datos/catalogo.json')}): cada tabla con su fuente, sus organismos, el día en que se bajó o se armó cada "
           "archivo del que sale, su período, sus columnas y su licencia.",
           f"- API de datos, en JSON y de solo lectura: {URL_SITIO}/api/datos (busca tablas e indicadores, los describe y da sus filas "
           "filtradas por jurisdicción y período). Servidor MCP con las mismas consultas, para asistentes de IA: "
           f"{URL_SITIO}/api/mcp (sin clave). Las direcciones de la API no son páginas: por eso van sin enlace.",
           _llpag("usar-datos"), _llpag("relaciones")]
    for _g, _gn, _items in GRUPOS:
        _ll += ["", f"## {_gn}", ""] + [_llpag(a) for a in _secs_de(_items) if a in PAGINA_INFO]
    for _m, _, _mn, _, _items in MENUS:
        _ll += ["", f"## {_mn}", ""] + [_llpag(a) for a in _secs_de(_items) if a in PAGINA_INFO]
        if _m == "provincias":
            _ll += [_llpag(a) for a in PAG_PROV.values()]
        if _m == "historias":
            _ll += [_llpag(a) for a in ORDEN_ARTS if a in PAGINA_INFO]
    # las demás páginas del sitemap (Sobre nosotros, Contacto...), para que llms.txt y el sitemap lleven las mismas
    _llresto = [a for a in INDEXADAS if a and a not in _llista]
    if _llresto:
        _ll += ["", "## Sobre Datina", ""] + [_llpag(a) for a in _llresto]
    _ll += ["", "## Optional", ""] + [
        f"- [{t['tabla']}.csv]({_llu('datos/' + t['tabla'] + '.csv')}): " + " ".join(
            x if x.endswith((".", "?")) else x + "." for x in (s.strip().rstrip(",:") for s in
            (t["titulo"], t["descripcion"], f"Período: {t['periodo']}" if t["periodo"] else "", f"Fuente: {fuente_corta(t['fuente'])}")) if x)
        for t in _lltab]
    (SITIO / "llms.txt").write_text("\n".join(_ll) + "\n", encoding="utf-8", newline="\n")
# Caché en Cloudflare Pages (23 de octubre de 2026, decisión del autor): sitio/_headers es el equivalente de los [[headers]] de
# netlify.toml. Los archivos que las páginas piden con su huella en la dirección (?v=...) se guardan un año: cuando cambia el contenido
# cambia la dirección. Los demás (por ejemplo, las tablas que se piden sin huella) quedan con la caché común
CACHE_LARGO = (["/datina.css", "/datina.js", "/mesas.js", "/datos/fichas.js", "/datos/relieve/*", "/lib/*", "/relaciones.css", "/relaciones.js", "/datos/relaciones.json"]
               + [f"/datos/{n}.json" for n in DIFERIDAS] + ["/consulta-ia.js"] * CONSULTA_IA)
# Las tablas de Elecciones por mesa (4 de noviembre de 2026): Cloudflare comprime el JSON y el texto, pero no el CSV, y Buenos Aires bajaba unos 5 MB. Se sirven como
# texto: el archivo es el mismo y sigue llamándose .csv, y los enlaces de descarga llevan el atributo download
MESAS_TEXTO = "/datos/mesas/*\n  Content-Type: text/plain; charset=utf-8\n"
# lo mismo con las escuelas y los hospitales de cada provincia (9 de noviembre de 2026): Buenos Aires son 1,4 MB de CSV y unos 400 KB comprimidos
EST_TEXTO = "/datos/establecimientos/*\n  Content-Type: text/plain; charset=utf-8\n"
(SITIO / "_headers").write_text("".join(f"{r}\n  Cache-Control: public, max-age=31536000, immutable\n" for r in CACHE_LARGO) + MESAS_TEXTO + EST_TEXTO
                                + "/llms.txt\n  Content-Type: text/plain; charset=utf-8\n",
                                encoding="utf-8", newline="\n")
# los datos de Elecciones por mesa (scripts/prueba_mesas.py): 03 no los arma, los arma scripts/elecciones_mesas.py, pero si no suman lo que tienen que sumar
# el sitio no se da por armado
import prueba_mesas
_mes = prueba_mesas.revisar()
if _mes:
    sys.exit("Elecciones por mesa con problemas: el sitio no se dio por armado.\n" + "\n".join(_mes[:20]))
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
