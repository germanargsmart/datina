"""
Explorador de relaciones (plan Datina Lab, docs/roadmap/DATINA_LAB.md).
Muestra de dónde sale cada número: qué organismo publica cada archivo que baja o arma Datina (fuente, relación "publica"), qué
archivo alimenta cada ficha ("alimenta") y qué ficha se calcula a partir de otra ("se calcula a partir de"). No muestra
correlaciones ni causas.

Lee el catálogo escrito a mano (datos/manual/relaciones.json), lo valida contra el repositorio (cada relación tiene su evidencia: un
texto exacto que tiene que estar en una línea del archivo citado) y lo completa con lo que ya está escrito en la plantilla (título,
sección, fuente a la vista, frecuencia, CSV) y en las tablas del sitio (unidad, período y cobertura). Escribe sitio/datos/relaciones.json,
sitio/relaciones.css, sitio/relaciones.js y sitio/relaciones.html.

Lo llama 03_construir_sitio.py, que no arma el sitio si el catálogo tiene un error.
Solo validar el catálogo: python scripts/relaciones.py
"""
import csv, hashlib, html, json, pathlib, re, sys

RAIZ = pathlib.Path(__file__).resolve().parents[1]
CATALOGO = RAIZ / "datos" / "manual" / "relaciones.json"
TIPOS_ARISTA = {"publica": ("fuente", "conjunto"), "alimenta": ("conjunto", "indicador"), "calcula": ("indicador", "indicador")}
# Las fichas de suicidio no entran (reglas para temas sensibles de CLAUDE.md), ni las herramientas (no son un indicador)
EXCLUIDAS = {"f-suicidio", "f-suicidio-prov", "f-edad"}
huella = lambda t: hashlib.sha1(t.encode("utf-8")).hexdigest()[:10]
e = lambda t: html.escape(str(t), quote=True)
texto = lambda h: re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", h))).strip()


def fichas_de(plantilla):
    """Fichas de la plantilla que son indicadores: {id: cuerpo del <article>}."""
    return {m.group(2): m.group(3) for m in re.finditer(r'<article class="(ficha[^"]*)" id="(f-[^"]+)"[^>]*>(.*?)</article>', plantilla, re.S)
            if "explorador" not in m.group(1).split() and m.group(2) not in EXCLUIDAS}


class Lineas:
    """Las líneas de cada archivo del repositorio, leídas una sola vez por corrida."""
    def __init__(self):
        self.c = {}

    def __call__(self, archivo):
        if archivo not in self.c:
            p = RAIZ / archivo
            ok = p.is_file() and p.resolve().is_relative_to(RAIZ)
            self.c[archivo] = p.read_text(encoding="utf-8").splitlines() if ok else None
        return self.c[archivo]


_UBICADAS = {}


def ubicar_evidencia(ev, lineas):
    """(línea, texto de la línea) de la primera línea del archivo que contiene el texto citado, o un error."""
    if not isinstance(ev, dict) or not ev.get("archivo") or not ev.get("contiene"):
        return None, f"evidencia mal formada: {ev}"
    clave = (ev["archivo"], ev["contiene"])
    if clave not in _UBICADAS:
        _UBICADAS[clave] = _ubicar(ev, lineas)
    return _UBICADAS[clave]


def _ubicar(ev, lineas):
    ls = lineas(ev["archivo"])
    if ls is None:
        return None, f"no existe el archivo {ev['archivo']}"
    n = next((i for i, l in enumerate(ls, 1) if ev["contiene"] in l), None)
    if n is None:
        return None, f"el texto {ev['contiene']!r} no está en ninguna línea de {ev['archivo']}"
    return (n, ls[n - 1].strip()), None


def titulo_calculado(cuerpo, js):
    """El título de una ficha cuyo <h2> lo completa datina.js (TX["...-titulo"]): la parte fija del texto, hasta el primer dato que
    se calcula (el período). Así el nombre no se copia a mano en el catálogo."""
    h3 = re.search(r'<h2[^>]*data-t="([^"]+)"', cuerpo)
    if not h3:
        return ""
    m = re.search(r'"' + re.escape(h3.group(1)) + r'"[^`\n]*`([^`]*)`', js)
    if not m:
        return ""
    t = re.split(r",? \$\{|, (?:19|20)\d\d a \$\{", m.group(1))[0]
    t = re.sub(r",\s*(?:19|20)\d\d a$", "", t).rstrip(", ")
    return "" if "${" in t else t


def nombre_ficha(cuerpo, js, cat_nombre=""):
    h3 = re.search(r"<h2[^>]*>(.*?)</h2>", cuerpo, re.S)
    return (texto(h3.group(1)) if h3 else "") or titulo_calculado(cuerpo, js) or cat_nombre


_JS = []
JS = lambda: _JS[0] if _JS else _JS.append((RAIZ / "scripts" / "datina.js").read_text(encoding="utf-8")) or _JS[0]


def norm(t):
    """Texto sin tildes ni mayúsculas, para reconocer una fuente escrita de distintas formas."""
    t = t.lower()
    for a, b in zip("áéíóúüñ", "aeiouun"):
        t = t.replace(a, b)
    return re.sub(r"\s+", " ", t)


LINEAS = Lineas()


def validar(cat, plantilla):
    """Lista de errores del catálogo. Vacía si está bien."""
    err = []
    lineas = LINEAS
    js = JS()
    fichas = fichas_de(plantilla)
    todas = set(re.findall(r'<article class="ficha[^"]*" id="(f-[^"]+)"', plantilla))
    for k in ("fuentes", "conjuntos", "aristas"):
        if not isinstance(cat.get(k), list):
            return [f"el catálogo no tiene la lista '{k}'"]
    ids = {}
    for tipo, lista, patron in (("fuente", cat["fuentes"], r"org:[a-z0-9-]+"), ("conjunto", cat["conjuntos"], r"ds:(manual/)?[\w.-]+")):
        for x in lista:
            i = x.get("id", "")
            if not re.fullmatch(patron, i):
                err.append(f"id de {tipo} inválido: {i!r}")
            if i in ids:
                err.append(f"id repetido: {i}")
            ids[i] = tipo
            if not x.get("nombre"):
                err.append(f"{i}: falta el nombre")
    for f in cat["fuentes"]:
        if not isinstance(f.get("alias", []), list):
            err.append(f"{f.get('id')}: 'alias' tiene que ser una lista")
    for i in fichas:
        if i in ids:
            err.append(f"id repetido: {i}")
        ids[i] = "indicador"
    for c in cat["conjuntos"]:
        i = c.get("id")
        if ids.get(c.get("fuente")) != "fuente":
            err.append(f"{i}: su fuente {c.get('fuente')!r} no está en el catálogo (todo conjunto tiene una fuente)")
        ruta = c.get("ruta", "")
        if not ruta:
            err.append(f"{i}: falta la ruta")
        elif "AAAA" in ruta:
            if not list((RAIZ / ruta).parent.glob(pathlib.Path(ruta).name.replace("AAAA", "[0-9][0-9][0-9][0-9]"))):
                err.append(f"{i}: ningún archivo coincide con {ruta}")
        elif not (RAIZ / ruta).exists():
            err.append(f"{i}: no existe {ruta}")
        _, problema = ubicar_evidencia(c.get("evidencia"), lineas)
        if problema:
            err.append(f"{i}: {problema}")
    for f, m in cat.get("fichas", {}).items():
        if f not in fichas:
            err.append(f"fichas: {f} no es una ficha de la plantilla que entra en el explorador")
    llegan = {}
    for a in cat["aristas"]:
        d = f"relación {a.get('de')} -> {a.get('a')}"
        tipo = a.get("tipo")
        if tipo not in ("alimenta", "calcula"):
            err.append(f"{d}: tipo {tipo!r} (en el catálogo solo van 'alimenta' y 'calcula': 'publica' sale de la fuente de cada conjunto)")
            continue
        esperado = TIPOS_ARISTA[tipo]
        if ids.get(a.get("de")) != esperado[0] or ids.get(a.get("a")) != esperado[1]:
            err.append(f"{d}: '{tipo}' va de un {esperado[0]} a un {esperado[1]} que estén en el catálogo"
                       + (" (las fichas de suicidio y las herramientas no entran)" if a.get("a") in todas or a.get("de") in todas else ""))
        if a.get("de") == a.get("a"):
            err.append(f"{d}: une un nodo consigo mismo")
        evs = a.get("evidencia")
        if not isinstance(evs, list) or not evs:
            err.append(f"{d}: falta la evidencia")
        for ev in evs or []:
            _, problema = ubicar_evidencia(ev, lineas)
            if problema:
                err.append(f"{d}: {problema}")
        llegan.setdefault(a.get("a"), []).append(a.get("de"))
    clave = [(a.get("tipo"), a.get("de"), a.get("a")) for a in cat["aristas"]]
    for r in sorted({x for x in clave if clave.count(x) > 1}, key=str):
        err.append(f"relación repetida: {r}")
    sale = {a.get("de") for a in cat["aristas"]}
    for c in cat["conjuntos"]:
        if c.get("id") not in sale:
            err.append(f"{c.get('id')}: conjunto que no alimenta ninguna ficha")
    for f in cat["fuentes"]:
        if not any(c.get("fuente") == f.get("id") for c in cat["conjuntos"]):
            err.append(f"{f.get('id')}: fuente que no publica ningún conjunto")
    # ningún ciclo en "se calcula a partir de"
    calc = {}
    for a in cat["aristas"]:
        if a.get("tipo") == "calcula":
            calc.setdefault(a.get("de"), []).append(a.get("a"))
    def ciclo(n, camino):
        for s in calc.get(n, []):
            if s in camino or ciclo(s, camino | {s}):
                return True
        return False
    if any(ciclo(n, {n}) for n in calc):
        err.append("hay un ciclo en las relaciones 'se calcula a partir de'")
    # cada ficha de la muestra o del sitio tiene de dónde sale
    alcance = set(cat.get("alcance") or fichas)
    for f in sorted(alcance - set(fichas)):
        err.append(f"alcance: {f} no es una ficha que entre en el explorador")
    for f in sorted(alcance & set(fichas)):
        if f not in llegan:
            err.append(f"{f}: ninguna relación dice de dónde salen sus datos")
        if not nombre_ficha(fichas[f], js, cat.get("fichas", {}).get(f, {}).get("nombre", "")):
            err.append(f"{f}: no se encontró su título (ni en la plantilla ni en TX de datina.js): sumarlo en fichas.{f}.nombre")
    # cada ficha nombra en su pie al menos uno de los organismos de los que salen sus datos
    alias = {f["id"]: [norm(x) for x in [f.get("sigla", ""), f["nombre"], *f.get("alias", [])] if x] for f in cat["fuentes"]}
    fuente_de = {c["id"]: c.get("fuente") for c in cat["conjuntos"]}
    for f in sorted(alcance & set(fichas)):
        pie = re.search(r'<div class="pie"><span>([^<]*)</span>', fichas[f])
        orgs = {fuente_de.get(c) for c in llegan.get(f, []) if c in fuente_de}
        if pie and orgs and not any(any(a in norm(pie.group(1)) for a in alias.get(o, [])) for o in orgs):
            err.append(f"{f}: su pie ({pie.group(1)[:80]}) no nombra a ninguno de sus organismos {sorted(orgs)}: sumar el nombre como alias")
    return err


def tabla_csv(ruta):
    try:
        with open(ruta, encoding="utf-8") as f:
            return list(csv.DictReader(f))
    except (OSError, UnicodeDecodeError, csv.Error):
        return []


COLS_PERIODO = ("periodo", "anio", "año", "fecha", "mes", "trimestre", "semestre", "eleccion")


def describir_tabla(filas):
    """Período y cobertura que se pueden leer de la tabla de una ficha, sin interpretar nada."""
    if not filas:
        return None, None
    cols = list(filas[0])
    cob = None
    if any("depart" in c or c in ("codigo_dep", "id_dep") for c in cols):
        cob = "Departamentos"
    elif "codigo_indec" in cols:
        cods = {str(f["codigo_indec"]).zfill(2) for f in filas if f.get("codigo_indec")}
        prov = {c for c in cods if re.fullmatch(r"\d\d", c) and c != "00"}
        cob = ("Las 24 jurisdicciones" if len(prov) >= 24 else f"{len(prov)} jurisdicciones" if prov else "Total del país") + (
            " y el total del país" if prov and "00" in cods else "")
    per = None
    col = next((c for c in cols if c.lower() in COLS_PERIODO), None)
    if col:
        vals = sorted({f[col] for f in filas if f.get(col)})
        if vals:
            per = vals[0] if len(vals) == 1 else f"{vals[0]} a {vals[-1]}"
    return per, cob


def publicar(cat, plantilla, secciones, ubic):
    """El JSON que lee la página: nodos con sus datos y relaciones con su evidencia ubicada en el archivo."""
    lineas = LINEAS
    js = JS()
    fichas = fichas_de(plantilla)
    alcance = list(cat.get("alcance") or fichas)
    tit_sec = {s[0]: s[1] for s in secciones}
    largo = {}
    with open(RAIZ / "datos" / "ordenado" / "tabla_larga.csv", encoding="utf-8") as f:
        for fila in csv.DictReader(f):
            v = largo.setdefault(fila["variable"], {"unidad": fila["unidad"], "per": set()})
            v["per"].add(fila["periodo"])
    registro = {}
    reg = RAIZ / "datos" / "crudo" / "_registro.csv"
    if reg.exists():
        for fila in tabla_csv(reg):
            registro[fila["archivo"]] = fila
    nodos, aristas = [], []
    for f in cat["fuentes"]:
        nodos.append({"id": f["id"], "tipo": "fuente", "nombre": f["nombre"], "sigla": f.get("sigla", ""), "depende": f.get("depende", ""),
                      "url": f.get("url", "")})
    usados = set()
    for a in cat["aristas"]:
        if a["a"] in alcance or (a["tipo"] == "calcula" and a["de"] in alcance):
            usados.add(a["de"])
    for c in cat["conjuntos"]:
        if c["id"] not in usados:
            continue
        r = registro.get(pathlib.Path(c["ruta"]).name)
        ubic_ev, _ = ubicar_evidencia(c["evidencia"], lineas)
        nodos.append({"id": c["id"], "tipo": "conjunto", "nombre": c["nombre"], "fuente": c["fuente"], "ruta": c["ruta"], "url": c.get("url", ""),
                      "origen": "Se descarga en la actualización mensual" if c["ruta"].startswith("datos/crudo/") else
                      "Se armó a mano o una sola vez con un programa del sitio",
                      "descarga": {"fecha": r["descargado"][:10], "estado": r["estado"]} if r else None,
                      "evidencia": {"archivo": c["evidencia"]["archivo"], "linea": ubic_ev[0], "texto": ubic_ev[1]} if ubic_ev else None})
        aristas.append({"de": c["fuente"], "a": c["id"], "tipo": "publica", "evidencia": []})
    for i in alcance:
        cuerpo = fichas[i]
        meta = cat.get("fichas", {}).get(i, {})
        pie = re.search(r'<div class="pie"><span>([^<]*)</span>(.*?)</div>', cuerpo, re.S)
        csvs = re.findall(r'href="(datos/[\w.-]+\.csv)"', pie.group(2)) if pie else []
        nota = re.search(r'<p class="nota"(?![^>]*data-t)[^>]*>(.*?)</p>', cuerpo, re.S)
        per, cob = None, None
        for c in csvs:
            per2, cob2 = describir_tabla(tabla_csv(RAIZ / "sitio" / c))
            per, cob = per or per2, cob or cob2
        unidades = sorted({largo[v]["unidad"] for v in meta.get("variables", []) if v in largo})
        pagina = ubic.get(i, "")
        sec = pagina
        fuente_texto = re.sub(r"^Fuentes?: ", "", texto(pie.group(1))) if pie else ""
        frase = re.search(r"(Se actualiza [^.]*\.|La encuesta está en pausa[^.]*\.[^.]*\.)$", fuente_texto)
        nodos.append({"id": i, "tipo": "indicador", "nombre": nombre_ficha(cuerpo, js, meta.get("nombre", "")),
                      "seccion": sec, "seccion_nombre": tit_sec.get(sec, ""), "url": f"{pagina}.html#{i}" if pagina else "",
                      "fuente_texto": fuente_texto[:frase.start()].strip() if frase else fuente_texto,
                      "frecuencia": frase.group(1) if frase else "", "csv": csvs, "unidad": unidades, "periodo": per, "cobertura": cob,
                      "nota": texto(nota.group(1)) if nota and texto(nota.group(1)) else "",
                      "variables": [v for v in meta.get("variables", []) if v in largo]})
    presentes = {n["id"] for n in nodos}
    for a in cat["aristas"]:
        if a["de"] not in presentes or a["a"] not in presentes:
            continue
        evs = []
        for ev in a["evidencia"]:
            u, _ = ubicar_evidencia(ev, lineas)
            if u:
                evs.append({"archivo": ev["archivo"], "linea": u[0], "texto": u[1][:240]})
        aristas.append({"de": a["de"], "a": a["a"], "tipo": a["tipo"], "evidencia": evs})
    # solo las fuentes que publican algo de lo que se muestra
    con = {a["de"] for a in aristas if a["tipo"] == "publica"}
    nodos = [n for n in nodos if n["tipo"] != "fuente" or n["id"] in con]
    secs = [[s[0], s[1]] for s in secciones if any(n.get("seccion") == s[0] for n in nodos)]
    return {"muestra": bool(cat.get("muestra")), "secciones": secs, "nodos": nodos, "aristas": aristas}


def construir(plantilla, base, secciones, ubic, v_css, sitio=RAIZ / "sitio"):
    """Valida el catálogo y escribe los cuatro archivos del explorador. Devuelve la lista de errores (vacía si se armó)."""
    cat = json.loads(CATALOGO.read_text(encoding="utf-8"))
    err = validar(cat, plantilla)
    if err:
        return err
    datos = json.dumps(publicar(cat, plantilla, secciones, ubic), ensure_ascii=False, separators=(",", ":"))
    css = (RAIZ / "scripts" / "relaciones.css").read_text(encoding="utf-8")
    js = (RAIZ / "scripts" / "relaciones.js").read_text(encoding="utf-8")
    (sitio / "datos" / "relaciones.json").write_text(datos, encoding="utf-8", newline="\n")
    (sitio / "relaciones.css").write_text(css, encoding="utf-8", newline="\n")
    (sitio / "relaciones.js").write_text(js, encoding="utf-8", newline="\n")
    h = (RAIZ / "scripts" / "relaciones.html").read_text(encoding="utf-8")
    # la barra y el pie del sitio, sin lo que necesita datina.js (menú, buscador, provincia y la fecha de los datos)
    marca = re.search(r'<a class="marca" href="\./">.*?</a>', base, re.S).group(0)
    temas = re.search(r'<nav class="temas".*?</nav>', base, re.S).group(0)
    # sin datina.js los menús no abren: cada grupo pasa a ser un enlace a su lugar en la portada y "Más" no va (etapa 39)
    temas = re.sub(r'<button type="button" class="menu-btn grupo-btn"[^>]*data-ir="([^"]+)">(.*?)<svg.*?</svg></button>', r'<a href="\1">\2</a>', temas, flags=re.S)
    temas = re.sub(r'\s*<button type="button" class="menu-btn" id="menu-btn".*?</button>', "", temas, flags=re.S)
    pie = re.search(r'<footer class="pie-sitio">.*?</footer>', base, re.S).group(0)
    pie = re.sub(r'\s*<p data-t="actualizado"></p>', "", pie)
    icono = re.search(r'<link rel="icon"[^>]*>', base).group(0)
    # D3 desde el propio sitio, la misma etiqueta (y la misma huella) que las demás páginas
    d3 = re.search(r'<script src="lib/d3-[^"]+"></script>', base).group(0)
    for marca_, valor in {"<!--ICONO-->": icono, "<!--D3-->": d3, "<!--MARCA-->": marca, "<!--TEMAS-->": temas, "<!--PIE-->": pie, "__V_CSS__": v_css,
                          "__V_RX_CSS__": huella(css), "__V_RX_JS__": huella(js), "__V_RX_DATOS__": huella(datos)}.items():
        assert marca_ in h, f"falta {marca_} en scripts/relaciones.html"
        h = h.replace(marca_, valor)
    (sitio / "relaciones.html").write_text(h, encoding="utf-8", newline="\n")
    return []


if __name__ == "__main__":
    _cat = json.loads(CATALOGO.read_text(encoding="utf-8"))
    _err = validar(_cat, (RAIZ / "scripts" / "plantilla.html").read_text(encoding="utf-8"))
    if _err:
        sys.exit("Catálogo de relaciones con problemas:\n" + "\n".join(_err))
    _ar = [a for a in _cat["aristas"]]
    print(f"Catálogo de relaciones bien: {len(_cat['fuentes'])} fuentes, {len(_cat['conjuntos'])} conjuntos, {len(_ar)} relaciones con evidencia"
          + (f", muestra de {len(_cat['alcance'])} fichas" if _cat.get("alcance") else ""))
