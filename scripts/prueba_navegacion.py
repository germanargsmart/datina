"""
Prueba de la navegación (Fase 2 del rediseño, paso 1, 23 de octubre de 2026). Revisa las páginas armadas de sitio/ y controla que:
- todas tengan la misma barra: Temas, Provincias, Historias y Herramientas, en ese orden, cada uno con su menú, y "Menú" (el del celular)
  con las mismas cuatro partes. El Explorador de relaciones, que no carga datina.js, las tiene como enlaces;
- cada sección de tema esté una sola vez en los menús, y estén todas las herramientas, Tu provincia, el Laboratorio, la Corte Suprema,
  el consultor de pobreza y el Explorador;
- el pie tenga las mismas partes que la barra, más Datina;
- sigan existiendo las 52 direcciones del 22 de octubre de 2026 y el consultor, y ninguna página quede sin enlaces que lleguen a ella.
La corre 03_construir_sitio.py al final. Sola: python scripts/prueba_navegacion.py
"""
import json, pathlib, re, sys

RAIZ = pathlib.Path(__file__).resolve().parents[1]
SITIO = RAIZ / "sitio"
BARRA = ["temas", "provincias", "historias", "herramientas"]
NOMBRES = ["Temas", "Provincias", "Historias", "Herramientas"]
PIE = ["Personas y bienestar", "Trabajo y economía", "Estado y sociedad", "Territorio y recursos", "Provincias", "Historias con datos",
       "Herramientas", "Datina"]
# las direcciones que el sitio tenía el 22 de octubre de 2026, antes del rediseño: ninguna puede desaparecer
DIRECCIONES = """404 a-alquiler-pobreza a-atn-presupuesto a-cloacas-mortalidad a-cobertura-adolescentes a-cobertura-esperanza a-dolar-inversion
a-empleo-pobreza a-exportaciones-dolar a-exportaciones-empleo a-internet-aprender a-inversion-aprender a-milei-empleo a-nafta-dolares
a-pobreza-desocupacion a-recursos-empleo a-turismo-dolar a-viviendas-alquiler a-viviendas-hacinamiento articulos catalogo construccion
contacto corte-suprema cruces curiosidades departamentos diagnostico economia educacion emprendedores empresas energia externo gobierno
index indice laboratorio migraciones movilidad naturaleza nosotros petroleo poblacion pobreza politica provincia relaciones salud seguridad
trabajo turismo""".split()
# las que no llevan la barra común: el Explorador (que la tiene como enlaces) y las redirecciones (REDIRECCIONES de 03_construir_sitio.py:
# las páginas que cambiaron de nombre y, desde la etapa 5 del plan de mejora, los artículos que se juntaron con otro o se retiraron)
SIN_BARRA = {"relaciones.html"}
es_redireccion = lambda h: '<meta name="robots" content="noindex">' in h and "Esta página se mudó" in h


def tramo(h, inicio, fin):
    i = h.find(inicio)
    return h[i:h.index(fin, i) + len(fin)] if i >= 0 else ""


def revisar():
    """Devuelve la lista de problemas (vacía si la navegación está en orden)."""
    problemas = []
    paginas = sorted(SITIO.glob("*.html"))
    html = {p.name: p.read_text(encoding="utf-8") for p in paginas}
    t = (SITIO / "datos" / "fichas.js").read_text(encoding="utf-8")
    indice = json.loads(t[t.index("{"):t.rindex("}") + 1])["indice"]

    # 1. las direcciones de antes y el consultor
    faltan = [d for d in DIRECCIONES if f"{d}.html" not in html]
    if faltan:
        problemas.append("faltan direcciones que existían el 22 de octubre de 2026: " + ", ".join(faltan))
    if not (SITIO / "pobreza" / "index.html").exists():
        problemas.append("falta el consultor de pobreza (sitio/pobreza/index.html)")

    # 2. la misma barra, los mismos menús y el mismo pie en todas las páginas
    ref = html["index.html"]
    barra_ref = tramo(ref, '<nav class="temas"', "</nav>")
    menus_ref = tramo(ref, '<nav class="menu-panel" id="menu-panel"', "<section")
    pie_ref = tramo(ref, '<nav class="pie-mapa"', "</nav>")
    botones = re.findall(r'<button type="button" class="menu-btn grupo-btn" id="gb-(\w+)"[^>]*>([^<]+)<', barra_ref)
    if [b[0] for b in botones] != BARRA or [b[1] for b in botones] != NOMBRES:
        problemas.append(f"la barra no es Temas, Provincias, Historias y Herramientas: {botones}")
    for m in BARRA:
        if f'id="gm-{m}"' not in menus_ref:
            problemas.append(f"falta el menú de {m}")
    partes = re.findall(r'<details class="menu-parte"><summary>([^<]+)<', menus_ref)
    if partes != NOMBRES:
        problemas.append(f'"Menú" no tiene las cuatro partes de la barra: {partes}')
    if not re.search(r'id="menu-btn"[^>]*>Menú<', barra_ref):
        problemas.append('falta el botón "Menú"')
    cols = re.findall(r"<h2>([^<]+)</h2>", pie_ref)
    if cols != PIE:
        problemas.append(f"el pie no tiene las partes de la barra: {cols}")
    redirecciones = {n for n, h in html.items() if es_redireccion(h)}
    if "emprendedores.html" not in redirecciones:
        problemas.append("emprendedores.html ya no es la redirección a empresas.html")
    for nombre, h in html.items():
        if nombre in SIN_BARRA | redirecciones:
            continue
        if tramo(h, '<nav class="temas"', "</nav>") != barra_ref:
            problemas.append(f"{nombre}: la barra no es la misma que en la portada")
        if tramo(h, '<nav class="menu-panel" id="menu-panel"', "</nav>") != tramo(ref, '<nav class="menu-panel" id="menu-panel"', "</nav>"):
            problemas.append(f'{nombre}: "Menú" no es el mismo que en la portada')
        for m in BARRA:
            if tramo(h, f'<nav class="menu-panel grupo-panel panel-{m}"', "</nav>") != tramo(ref, f'<nav class="menu-panel grupo-panel panel-{m}"', "</nav>"):
                problemas.append(f"{nombre}: el menú de {m} no es el mismo que en la portada")
        if tramo(h, '<nav class="pie-mapa"', "</nav>") != pie_ref:
            problemas.append(f"{nombre}: el pie no es el mismo que en la portada")
    rx = tramo(html.get("relaciones.html", ""), '<nav class="temas"', "</nav>")
    enlaces_rx = re.findall(r"<a href=\"[^\"]+\">([^<]+)</a>", rx)
    if enlaces_rx != NOMBRES:
        problemas.append(f"relaciones.html: la barra no tiene Temas, Provincias, Historias y Herramientas como enlaces: {enlaces_rx}")

    # 3. qué hay en los menús
    menus = "".join(tramo(ref, f'<nav class="menu-panel grupo-panel panel-{m}"', "</nav>") for m in BARRA)
    destinos = re.findall(r'<a(?: class="[^"]*")? href="([^"]+)"', menus)
    temas = [s[0] for s in indice["secciones"] if not s[4] and s[0] != "articulos"]
    for s in temas:
        n = destinos.count(f"{s}.html")
        if n != 1:
            problemas.append(f"la sección {s} aparece {n} veces en los menús (va una)")
    for d in [f"{s[0]}.html" for s in indice["secciones"] if s[4]] + ["provincia.html", "articulos.html", "laboratorio.html",
                                                                     "corte-suprema.html", "pobreza/", "relaciones.html"]:
        if d not in destinos:
            problemas.append(f"{d} no está en ningún menú")
    provincias = re.findall(r'href="provincia\.html\?prov=(\d\d)"', tramo(ref, '<nav class="menu-panel grupo-panel panel-provincias"', "</nav>"))
    if len(set(provincias)) != 24:
        problemas.append(f"el menú Provincias tiene {len(set(provincias))} jurisdicciones y no 24")

    # 4. ninguna página sin enlaces que lleguen a ella (salvo la 404 y las redirecciones)
    llegan = {n: set() for n in html}
    for nombre, h in html.items():
        # la portada se enlaza como "./" (la marca de la barra) o "./#…"
        destinos_h = set(re.findall(r'href="(?:\./)?([\w-]+\.html)', h)) | ({"index.html"} if re.search(r'href="\./(?:#[^"]*)?"', h) else set())
        for d in destinos_h:
            if d in llegan and d != nombre:
                llegan[d].add(nombre)
    for nombre, desde in llegan.items():
        if not desde and nombre != "404.html" and nombre not in redirecciones:
            problemas.append(f"{nombre}: ninguna página la enlaza")
    if not any('href="pobreza/"' in h for h in html.values()):
        problemas.append("ninguna página enlaza al consultor de pobreza")
    return problemas


if __name__ == "__main__":
    p = revisar()
    if p:
        sys.exit("Navegación con problemas:\n" + "\n".join(p))
    print(f"Navegación en orden: {len(list(SITIO.glob('*.html')))} páginas con la misma barra, los mismos menús y el mismo pie")
