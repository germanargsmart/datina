"""
Catálogo de datos (11 de octubre de 2026, propuesta aprobada por el autor: docs/roadmap/PROPUESTA_CATALOGO.md).
Arma la lista de catalogo.html: cada tabla CSV que publica Datina en sitio/datos/, con la ficha, el artículo o la pieza que la usa, su
descripción, su fuente y sus organismos, su período, su cobertura, cada cuánto se actualiza, sus columnas y la nota de método.

Nada se completa a mano ni se infiere: todo sale de lo que ya está escrito. La plantilla (el pie de cada ficha, con su CSV, su fuente y su
frecuencia, la descripción y la nota), datina.js (las tablas de los artículos), el catálogo del Explorador de relaciones (qué organismo
publica lo que alimenta cada ficha) y datos/manual/catalogo.json (dónde se usan las tablas que ninguna ficha ofrece en su pie, cada una con
su evidencia en el código). El período y la cobertura salen de la propia tabla. Si falta un dato, el catálogo lo deja vacío.

Las tablas de suicidio quedan afuera, como en el Explorador de relaciones: en Salud van después de las líneas de ayuda (CLAUDE.md).

Lo llama 03_construir_sitio.py, que no arma el sitio si una tabla publicada no tiene dónde se usa, si una evidencia no está en el código o si
un uso nombra algo que no existe. Solo validar: python scripts/catalogo.py
"""
import csv, html, json, math, pathlib, re, sys

import relaciones

RAIZ = pathlib.Path(__file__).resolve().parents[1]
USOS = RAIZ / "datos" / "manual" / "catalogo.json"
e, texto, norm = relaciones.e, relaciones.texto, relaciones.norm
MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
# columnas de período, en orden de preferencia, y los valores que se leen como fecha (año, año y mes, o fecha completa)
COLS_PERIODO = ("periodo", "fecha", "mes", "anio", "año", "eleccion")
FECHA = re.compile(r"\d{4}(-\d{2}(-\d{2})?)?")
COLS_CODIGO = {"codigo_indec", "codigo", "codigo_dep", "id_dep", "iso3", "letra", "id"}
COBERTURAS = [("jur", "Jurisdicciones"), ("dep", "Departamentos"), ("pais", "Total del país"), ("mundo", "Países del mundo"),
              ("sin", "Sin desglose territorial")]
VER = {"ficha": "Ver la ficha", "articulo": "Ver el artículo", "pieza": "Ver la pieza", "pagina": "Ver la página"}


def leer(ruta):
    with open(ruta, encoding="utf-8", newline="") as f:
        r = csv.reader(f)
        cols = next(r, [])
        return cols, list(r)


def numero(v):
    try:
        x = float(v)
    except ValueError:
        return None
    return x if math.isfinite(x) else None


def fmt_num(x):
    """Número con coma decimal y punto de miles, con hasta dos decimales (como lo muestra el sitio)."""
    t = f"{x:,.2f}".rstrip("0").rstrip(".") if x != int(x) else f"{int(x):,}"
    return t.replace(",", "_").replace(".", ",").replace("_", ".")


def fecha_legible(v):
    m = re.fullmatch(r"(\d{4})-(\d{2})(?:-(\d{2}))?", v)
    if not m or not 1 <= int(m.group(2)) <= 12:
        return v
    mes = f"{MESES[int(m.group(2)) - 1]} de {m.group(1)}"
    return f"{int(m.group(3))} de {mes}" if m.group(3) else mes


def rango(a, b):
    return a if a == b else f"{a} a {b}"


def periodo(cols, filas):
    """(texto, primer año, último año) de la primera columna de período cuyos valores son fechas, o vacío."""
    for c in COLS_PERIODO:
        if c not in cols:
            continue
        i = cols.index(c)
        vals = sorted({f[i] for f in filas if i < len(f) and f[i]})
        if vals and all(FECHA.fullmatch(v) for v in vals):
            return rango(fecha_legible(vals[0]), fecha_legible(vals[-1])), int(vals[0][:4]), int(vals[-1][:4])
    return "", None, None


def cobertura(cols, filas):
    """(clave para el filtro, texto) leídos de las columnas de la tabla. Departamentos solo con un código de departamento: la regla del
    Explorador de relaciones (cualquier columna con "depart") leía como departamentos a las capitales, que traen el % de viviendas en
    departamento, y a las centrales eléctricas, que dicen en qué departamento está cada una"""
    col = lambda c: [f[cols.index(c)] for f in filas if cols.index(c) < len(f)] if c in cols else []
    # una fila por departamento: con su código (codigo_dep, o id de cinco cifras) o con su nombre sin repetir dentro de cada provincia
    pares = list(zip(col("codigo_indec"), col("departamento")))
    if ("codigo_dep" in cols or "id_dep" in cols or (col("id") and all(re.fullmatch(r"\d{5}", v) for v in col("id")))
            or (len(pares) >= 100 and len(set(pares)) >= .95 * len(pares))):
        return "dep", "Departamentos"
    if "codigo_indec" in cols:
        i = cols.index("codigo_indec")
        cods = {f[i].zfill(2) for f in filas if i < len(f) and f[i]}
        prov = {c for c in cods if re.fullmatch(r"\d\d", c) and c != "00"}
        if not prov:
            # algunas tablas usan esa columna para otra cosa (especies, ríos, insumos): solo "00" es el total del país
            return ("pais", "Total del país") if cods == {"00"} else ("sin", "Sin desglose territorial")
        return "jur", ("Las 24 jurisdicciones" if len(prov) >= 24 else f"{len(prov)} jurisdicciones") + (" y el total del país" if "00" in cods else "")
    if "iso3" in cols:
        return "mundo", "Países del mundo"
    return "sin", "Sin desglose territorial"


def columnas(cols, filas):
    """Diccionario de variables: [nombre, tipo, valores] de cada columna, leído de la tabla."""
    out = []
    for i, c in enumerate(cols):
        vals = [f[i] for f in filas if i < len(f) and f[i] != ""]
        vacias = len(filas) - len(vals)
        nums = [numero(v) for v in vals]
        distintos = sorted(set(vals))
        if c in COLS_CODIGO:
            tipo, desc = "Código", f"{len(distintos)} códigos" if len(distintos) != 1 else "1 código"
        elif vals and all(FECHA.fullmatch(v) for v in vals) and (c in COLS_PERIODO or c.startswith(("anio", "año", "fecha")) or "-" in vals[0]):
            tipo, desc = ("Año" if all(len(v) == 4 for v in vals) else "Fecha"), rango(fecha_legible(distintos[0]), fecha_legible(distintos[-1]))
        elif vals and all(n is not None for n in nums):
            tipo, desc = "Número", rango(fmt_num(min(nums)), fmt_num(max(nums)))
        else:
            tipo = "Texto"
            desc = ", ".join(v if len(v) <= 40 else v[:39] + "…" for v in distintos) if 0 < len(distintos) <= 6 else f"{len(distintos)} valores distintos"
        if vacias and vals:
            desc += f" ({vacias} {'celda vacía' if vacias == 1 else 'celdas vacías'})"
        out.append([c, tipo, desc if vals else "Vacía"])
    return out


def tamanio(b):
    return f"{fmt_num(round(b / 1048576, 1))} MB" if b >= 1048576 else f"{max(1, round(b / 1024))} KB"


def usos_automaticos(plantilla, js, cat_rel):
    """{tabla: [(id, tipo)]}: los enlaces de cada ficha, las tablas de los artículos (datina.js) y las del Explorador de relaciones."""
    u = {}
    agregar = lambda t, i, tipo: (i, tipo) not in u.setdefault(t, []) and u[t].append((i, tipo))
    for m in re.finditer(r'<article class="ficha[^"]*" id="(f-[\w-]+)"[^>]*>(.*?)</article>', plantilla, re.S):
        # la del pie primero, y después las que la ficha ofrece en su nota (como Legisladores)
        pie = re.search(r'<div class="pie">(.*?)</div>', m.group(2), re.S)
        for t in re.findall(r'href="datos/(\w+)\.csv"', (pie.group(1) if pie else "") + m.group(2)):
            agregar(t, m.group(1), "ficha")
    serie = js[js.find("const ART_SERIE = ["):]
    for m in re.finditer(r'id: "(a-[\w-]+)", frec: "[^"]*", tablas: \[([^\]]*)\]', serie[:serie.find("\n}];")]):
        for t in re.findall(r'"(\w+)"', m.group(2)):
            agregar(t, m.group(1), "articulo")
    art = js[js.find("const ART = ["):]
    for i, t in re.findall(r'\{id: "(a-[\w-]+)", tabla: "(\w+)"', art[:art.find("\n];")]):
        agregar(t, i, "articulo")
    for a in cat_rel["aristas"]:
        if a["tipo"] == "alimenta" and a.get("tabla"):
            agregar(a["tabla"], a["a"], "ficha")
    return u


# "#id" lo convierte 03 en la dirección de la página donde está (pagina() en 03_construir_sitio.py). Tu provincia es una página propia
ref = lambda i: "provincia.html" if i == "provincia" else f"#{i}"


def tipo_de(i):
    return "ficha" if i.startswith("f-") else "articulo" if i.startswith("a-") else "pagina" if i == "provincia" else "pieza"


def datos_de_usos(plantilla, js):
    """Lo que dice la plantilla (y datina.js, para los artículos de series) de cada ficha, artículo o pieza que puede usar una tabla."""
    d = {}
    for m in re.finditer(r'<article class="(ficha[^"]*)" id="(f-[\w-]+)"[^>]*>(.*?)</article>', plantilla, re.S):
        c = m.group(3)
        pie = re.search(r'<div class="pie"><span>([^<]*)</span>', c)
        fuente = re.sub(r"^Fuentes?: ", "", texto(pie.group(1))) if pie else ""
        frase = re.search(r"(Se actualiza [^.]*\.|La encuesta está en pausa[^.]*\.[^.]*\.)$", fuente)
        sub = re.search(r'<p class="ficha-sub">(.*?)</p>', c, re.S)
        nota = re.search(r'<p class="nota"(?![^>]*data-t)[^>]*>(.*?)</p>', c, re.S)
        d[m.group(2)] = {"titulo": relaciones.nombre_ficha(c, js), "sub": texto(sub.group(1)) if sub else "",
                         "fuente": fuente[:frase.start()].strip() if frase else fuente, "frecuencia": frase.group(1) if frase else "",
                         "nota": texto(nota.group(1)) if nota else "", "herramienta": "explorador" in m.group(1).split()}
    for i, t in re.findall(r'<article class="nota" id="(a-[\w-]+)"[^>]*data-titulo="([^"]+)"', plantilla):
        d[i] = {"titulo": html.unescape(t), "sub": "", "fuente": "", "frecuencia": "", "nota": ""}
    serie = js[js.find("const ART_SERIE = ["):]
    for m in re.finditer(r'id: "(a-[\w-]+)", frec: "([^"]*)",.*?\n  dek: "([^"]*)",.*?\n  fuentes: ((?:"[^"]*"(?: \+\s*)?)+)', serie[:serie.find("\n}];")], re.S):
        d[m.group(1)].update(sub=m.group(3), frecuencia=m.group(2) + ".", fuente=texto("".join(re.findall(r'"([^"]*)"', m.group(4)))))
    for i, t, ds in re.findall(r'<section class="pieza" id="([\w-]+)"[^>]*data-titulo="([^"]+)" data-descr="([^"]+)"', plantilla):
        d[i] = {"titulo": html.unescape(t), "sub": html.unescape(ds), "fuente": "", "frecuencia": "", "nota": ""}
    for i, cuerpo in re.findall(r'<article class="lab-pieza[^"]*" id="([\w-]+)"[^>]*>(.*?)</article>', plantilla, re.S):
        h = re.search(r"<h2[^>]*>(.*?)</h2>", cuerpo, re.S)
        d[i] = {"titulo": texto(h.group(1)) if h else i, "sub": "", "fuente": "", "frecuencia": "", "nota": ""}
    d["provincia"] = {"titulo": "Tu provincia", "sub": "", "fuente": "", "frecuencia": "", "nota": ""}
    return d


def validar(cat_uso, auto, ids, tablas):
    """Errores de datos/manual/catalogo.json y de las tablas publicadas sin uso."""
    err = []
    lineas = relaciones.LINEAS
    for t, x in sorted(cat_uso.get("tablas", {}).items()):
        if t not in tablas:
            err.append(f"catalogo.json: {t} no es una tabla publicada en sitio/datos/")
        if not x.get("en") or not isinstance(x["en"], list):
            err.append(f"catalogo.json: {t} no dice dónde se usa (en)")
            continue
        for i in x["en"]:
            if i not in ids:
                err.append(f"catalogo.json: {t} se usa en {i}, que no existe en la plantilla")
        _, problema = relaciones.ubicar_evidencia(x.get("evidencia"), lineas)
        if problema:
            err.append(f"catalogo.json: {t}: {problema}")
        if all((i, tipo_de(i)) in auto.get(t, []) for i in x["en"]):
            err.append(f"catalogo.json: {t} sobra, sus usos ya salen de la plantilla, de datina.js o del Explorador de relaciones")
    for t in sorted(tablas):
        if not auto.get(t) and t not in cat_uso.get("tablas", {}):
            # 02_procesar.py no borra las tablas que deja de armar (estabilización, P2-6): el mensaje dice qué hacer en los dos casos
            err.append(f"{t}.csv: ninguna ficha, artículo o pieza la usa. Sumar en datos/manual/catalogo.json dónde se usa, con su evidencia, "
                       f"o, si 02_procesar.py ya no la arma, borrar sitio/datos/{t}.csv (02 no borra las tablas que deja de armar)")
    return err


def armar(plantilla, secciones, ubic, grupos, sitio=RAIZ / "sitio"):
    """(HTML del catálogo, errores). El HTML va en lugar de <!--CATALOGO--> en la sección del catálogo."""
    js = relaciones.JS()
    cat_rel = json.loads(relaciones.CATALOGO.read_text(encoding="utf-8"))
    cat_uso = json.loads(USOS.read_text(encoding="utf-8"))
    auto = usos_automaticos(plantilla, js, cat_rel)
    info = datos_de_usos(plantilla, js)
    # las tablas de suicidio (las de las fichas que el Explorador de relaciones deja afuera) no van
    fuera = {t for t, us in auto.items() if all(i in relaciones.EXCLUIDAS for i, _ in us)}
    tablas = {p.stem: p for p in sorted((sitio / "datos").glob("*.csv")) if p.stem != "tabla_larga" and p.stem not in fuera}
    err = validar(cat_uso, auto, set(info) | set(ubic), tablas)
    if err:
        return "", err
    usos = {t: list(auto.get(t, [])) for t in tablas}
    compl = set()
    for t, x in cat_uso["tablas"].items():
        usos[t] += [(i, tipo_de(i)) for i in x["en"] if (i, tipo_de(i)) not in usos[t]]
        if x.get("complementaria"):
            compl.add(t)
    # organismos: los que publican lo que alimenta la ficha en el Explorador de relaciones (primero las relaciones que nombran esta tabla).
    # Para los artículos y las piezas, los que nombra su fuente
    fuente_de = {c["id"]: c["fuente"] for c in cat_rel["conjuntos"]}
    org = {f["id"]: f for f in cat_rel["fuentes"]}
    alias = {f["id"]: [norm(x) for x in [f.get("sigla", ""), f["nombre"], *f.get("alias", [])] if x] for f in cat_rel["fuentes"]}

    def organismos(t, us):
        al = [a for a in cat_rel["aristas"] if a["tipo"] == "alimenta"]
        con_tabla = {fuente_de.get(a["de"]) for a in al if a.get("tabla") == t}
        por_ficha = {fuente_de.get(a["de"]) for i, _ in us for a in al if a["a"] == i}
        por_texto = {o for i, _ in us for o, als in alias.items() if info.get(i, {}).get("fuente") and any(x in norm(info[i]["fuente"]) for x in als)}
        return sorted((con_tabla or por_ficha or por_texto) - {None}, key=lambda o: norm(org[o].get("sigla") or org[o]["nombre"]))

    tit_sec = {s[0]: s[1] for s in secciones} | {"provincia": "Tu provincia", "laboratorio": "Laboratorio"}
    # la tabla del pie de cada ficha (la primera que ofrece)
    pie_de = {}
    for m in re.finditer(r'<article class="ficha[^"]*" id="(f-[\w-]+)"[^>]*>.*?<div class="pie">(.*?)</div>', plantilla, re.S):
        t0 = re.search(r'href="datos/(\w+)\.csv"', m.group(2))
        if t0:
            pie_de[m.group(1)] = t0.group(1)
    sec_de_art = dict(re.findall(r'<article class="nota" id="(a-[\w-]+)"[^>]*data-sec="([\w-]+)"', plantilla))
    pagina_de = lambda i: sec_de_art.get(i) or {"pieza": "laboratorio", "pagina": i}.get(tipo_de(i)) or ubic.get(i, "")
    items, cuenta_org, anios = [], {}, set()
    orden_sec = ([s for _, _, its in grupos for it in its for s in (it[1] if isinstance(it, tuple) else [it])]
                 + [x[0] for x in secciones if x[4]] + ["provincia", "laboratorio"])
    for t, ruta in tablas.items():
        cols, filas = leer(ruta)
        us = usos[t]
        prin = us[0][0]
        d = info.get(prin, {})
        sec = pagina_de(prin)
        per, a0, a1 = periodo(cols, filas)
        if a0 is None:
            ys = [int(y) for y in re.findall(r"\b(?:19|20)\d{2}\b", d.get("sub", ""))]
            a0, a1 = (min(ys), max(ys)) if ys else (None, None)
        if a0 is not None:
            anios.update(range(a0, a1 + 1))
        cob_k, cob = cobertura(cols, filas)
        orgs = organismos(t, us)
        for o in orgs:
            cuenta_org[o] = cuenta_org.get(o, 0) + 1
        dic = columnas(cols, filas)
        unidades = sorted({f[cols.index("unidad")] for f in filas if "unidad" in cols and f[cols.index("unidad")]})
        dl = [("Fuente", d.get("fuente") or ""), ("Cobertura", cob), ("Período", per),
              ("Actualización", d.get("frecuencia", "")), ("Tamaño", f"{fmt_num(len(filas))} {'fila' if len(filas) == 1 else 'filas'}, {tamanio(ruta.stat().st_size)}")]
        otros = [(i, tipo) for i, tipo in us[1:]]
        uso_txt = ("" if not otros else '<p class="cat-otros">También se usa en ' +
                   ", ".join(f'<a href="{ref(i)}">{e(info.get(i, {}).get("titulo", i))}</a>' for i, _ in otros) + ".</p>")
        compl_txt = ('<p class="cat-otros">No se dibuja: sus cifras van en el texto de la ficha o la acompañan.</p>' if t in compl else "")
        filas_dic = "".join(f'<tr><th scope="row"><code>{e(c)}</code></th><td>{e(ti)}</td><td>{e(v)}</td></tr>' for c, ti, v in dic)
        unid = f'<p class="cat-otros">Unidades: {e(", ".join(unidades))}.</p>' if 0 < len(unidades) <= 8 else ""
        nota = f'<h3>Cómo se calcula</h3><p class="cat-nota">{e(d["nota"])}</p>' if d.get("nota") else ""
        orden = (orden_sec.index(sec) if sec in orden_sec else len(orden_sec), plantilla.find(f'id="{prin}"'), pie_de.get(prin) != t, t)
        items.append((orden,
            f'<li class="cat-item" id="cat-{t}" data-tema="{e(sec)}" data-org="{" ".join(orgs)}" data-cob="{cob_k}" '
            f'data-a0="{"" if a0 is None else a0}" data-a1="{"" if a1 is None else a1}">'
            f'<p class="cat-cab"><span class="etiqueta">{e(tit_sec.get(sec, ""))}</span>'
            f'<code class="cat-archivo">{t}.csv</code></p>'
            f'<h2 class="cat-tit"><a href="{ref(prin)}">{e(d.get("titulo") or t)}</a></h2>'
            + (f'<p class="cat-sub">{e(d["sub"])}</p>' if d.get("sub") else "")
            + '<dl class="cat-datos">' + "".join(f"<div><dt>{k}</dt><dd>{e(v)}</dd></div>" for k, v in dl if v) + "</dl>"
            + '<div class="acciones">'
            f'<a class="boton chico accion" href="{ref(prin)}"><span class="lbl">{VER[us[0][1]]}</span></a>'
            f'<button type="button" class="boton chico accion cat-ver" aria-expanded="false" aria-controls="cat-{t}-previa"><span class="lbl">Vista previa</span></button>'
            f'<a class="boton chico accion" href="datos/{t}.csv" download><span class="lbl">Descargar CSV</span></a></div>'
            f'<div class="cat-previa" id="cat-{t}-previa" hidden>'
            f'<div class="cat-filas" data-csv="datos/{t}.csv"></div>'
            f'<h3>Diccionario de variables</h3>'
            f'<div class="tabla-desliza" tabindex="0" role="region" aria-label="Columnas de {t}.csv"><table class="tabla-areas cat-dic">'
            f'<caption class="solo-lector">Columnas de {t}.csv: nombre, tipo y valores</caption>'
            f'<thead><tr><th scope="col">Columna</th><th scope="col">Tipo</th><th scope="col">Valores</th></tr></thead><tbody>{filas_dic}</tbody></table></div>'
            f"{unid}{uso_txt}{compl_txt}{nota}</div></li>"))
    # en el orden del sitio: los temas como en la barra, después las herramientas, Tu provincia y el Laboratorio, y dentro de cada tema
    # en el orden de las fichas, con la tabla del pie de cada una primero
    items = [x for _, x in sorted(items)]
    # filtros: tema (los grupos y secciones de GRUPOS, más lo que no es un tema), organismo, cobertura y año
    temas_usados = {re.search(r'data-tema="([^"]*)"', x).group(1) for x in items}
    op_tema = ""
    for g, n, its in grupos:
        secs = [s for it in its for s in (it[1] if isinstance(it, tuple) else [it]) if s in temas_usados]
        if secs:
            op_tema += f'<optgroup label="{e(n)}">' + "".join(f'<option value="{s}">{e(tit_sec[s])}</option>' for s in secs) + "</optgroup>"
    resto = sorted(temas_usados - {s for _, _, its in grupos for it in its for s in (it[1] if isinstance(it, tuple) else [it])} - {""},
                   key=lambda s: orden_sec.index(s) if s in orden_sec else len(orden_sec))
    if resto:
        op_tema += '<optgroup label="Herramientas, Tu provincia y Laboratorio">' + "".join(
            f'<option value="{s}">{e(tit_sec.get(s, s))}</option>' for s in resto) + "</optgroup>"
    nom_org = lambda o: org[o]["nombre"] if not org[o].get("sigla") or org[o]["sigla"] == org[o]["nombre"] else f'{org[o]["sigla"]} ({org[o]["nombre"]})'
    op_org = "".join(f'<option value="{o}">{e(nom_org(o))}</option>' for o in sorted(cuenta_org, key=lambda o: norm(nom_org(o))))
    cobs = {re.search(r'data-cob="(\w+)"', x).group(1) for x in items}
    op_cob = "".join(f'<option value="{k}">{n}</option>' for k, n in COBERTURAS if k in cobs)
    op_anio = "".join(f'<option value="{a}">{a}</option>' for a in sorted(anios, reverse=True))
    completa = RAIZ / "datos" / "ordenado" / "tabla_larga.csv"   # 03 la copia a sitio/datos/ al final
    sel = lambda i, lab, todas, ops: (f'<label class="cx-campo" for="{i}"><span>{lab}</span><select id="{i}"><option value="">{todas}</option>{ops}</select></label>')
    h = ('<div class="catalogo">'
         '<div class="cat-filtros" role="search" aria-label="Buscar en el catálogo">'
         '<label class="cat-busca" for="cat-q"><span>Buscar</span><input type="search" id="cat-q" autocomplete="off" '
         'placeholder="empleo, salarios, INDEC…" aria-describedby="cat-cuenta"></label>'
         + sel("cat-tema", "Tema", "Todos", op_tema) + sel("cat-org", "Organismo", "Todos", op_org)
         + sel("cat-cob", "Cobertura", "Todas", op_cob) + sel("cat-anio", "Con datos de", "Cualquier año", op_anio) + "</div>"
         f'<div class="cat-resumen"><p class="cat-cuenta" id="cat-cuenta" aria-live="polite"><b>{len(items)}</b> tablas</p>'
         '<button type="button" class="boton chico accion" id="cat-limpiar" hidden><span class="lbl">Sacar los filtros</span></button>'
         f'<a class="enlace" href="datos/tabla_larga.csv" download>Bajar la tabla completa (CSV, {tamanio(completa.stat().st_size) if completa.exists() else ""})</a></div>'
         '<p class="cat-vacio" id="cat-vacio" role="status" hidden>Ninguna tabla coincide. Probá con otras palabras o sacá un filtro.</p>'
         f'<ol class="cat-lista" id="cat-lista">{"".join(items)}</ol>'
         '<p class="cat-licencia">Los datos de base son de cada organismo. Al usarlos, citá la fuente que figura en cada tabla.</p></div>')
    return h, []


if __name__ == "__main__":
    _js = relaciones.JS()
    _pl = (RAIZ / "scripts" / "plantilla.html").read_text(encoding="utf-8")
    _cat = json.loads(relaciones.CATALOGO.read_text(encoding="utf-8"))
    _auto = usos_automaticos(_pl, _js, _cat)
    _info = datos_de_usos(_pl, _js)
    _fuera = {t for t, us in _auto.items() if all(i in relaciones.EXCLUIDAS for i, _ in us)}
    _tablas = {p.stem for p in (RAIZ / "sitio" / "datos").glob("*.csv") if p.stem != "tabla_larga" and p.stem not in _fuera}
    _ids = set(_info) | set(re.findall(r'\sid="([\w-]+)"', _pl))
    _err = validar(json.loads(USOS.read_text(encoding="utf-8")), _auto, _ids, _tablas)
    if _err:
        sys.exit("Catálogo de datos con problemas:\n" + "\n".join(_err))
    print(f"Catálogo de datos bien: {len(_tablas)} tablas, todas con su uso ({len(_fuera)} de suicidio quedan afuera)")
