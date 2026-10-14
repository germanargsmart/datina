"""Controla los encabezados de las páginas armadas en sitio/ (11 de octubre de 2026).

Cada página de contenido tiene un solo h1, que es el primer encabezado de <main> y dice de qué es la página. Las excepciones aceptadas,
cada una con su motivo:
- Redirecciones (alias de una dirección vieja, como emprendedores.html): no son páginas de contenido. Llevan robots noindex, un
  canonical y ningún encabezado.
- Artículos (<article class="nota">) y piezas del Laboratorio (<section class="pieza">): datina.js arma la nota entera al cargar, así
  que en el HTML no hay h1. Se controla que datina.js escriba el título como h1 (class="nota-tit").
- El consultor de pobreza (sitio/pobreza/) lo arma Observable Framework: se controla que tenga un solo h1, sin exigir el resto.
- La portada (index.html): su h1 ("Datina") va en el bloque azul, antes de <main>. Se controla que sea el único.

En las secciones con la pregunta como título (class="tema con-pregunta") el h1 es la pregunta (h1.pregunta), que es lo que se ve como
título, y el nombre de la sección va chico arriba en un párrafo (14 de octubre de 2026). Se controla que sea así.

Los saltos de nivel después del h1 (por ejemplo, de h1 a las fichas en h3) se informan pero no frenan: las fichas son h3 en la
plantilla, en datina.css, en datina.js y en el Explorador de relaciones, y pasarlas a h2 es un cambio aparte.

Uso: python scripts/prueba_encabezados.py. Devuelve 1 si hay problemas. 03_construir_sitio.py la corre al final y no da el sitio por
armado si falla.
"""
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SITIO = RAIZ / "sitio"


class Encabezados(HTMLParser):
    """Junta los encabezados (nivel, texto) que están dentro de <main>, y los h1 de toda la página."""

    def __init__(self):
        super().__init__()
        self.en_main = 0
        self.abierto = None
        self.texto = []
        self.en_main_lista = []
        self.h1_total = 0

    def handle_starttag(self, tag, attrs):
        if tag == "main":
            self.en_main += 1
        m = re.fullmatch(r"h([1-6])", tag)
        if m:
            self.abierto = (int(m.group(1)), self.en_main > 0)
            self.texto = []
            if tag == "h1":
                self.h1_total += 1

    def handle_endtag(self, tag):
        if tag == "main":
            self.en_main -= 1
        if self.abierto and re.fullmatch(r"h[1-6]", tag):
            nivel, dentro = self.abierto
            if dentro:
                self.en_main_lista.append((nivel, " ".join("".join(self.texto).split())))
            self.abierto = None

    def handle_data(self, data):
        if self.abierto:
            self.texto.append(data)


def revisar():
    problemas, avisos, excepciones = [], [], []
    js = (SITIO / "datina.js").read_text(encoding="utf-8")
    js_titulo_h1 = len(re.findall(r'<h1 class="nota-tit"', js)) >= 2 and '<h2 class="nota-tit"' not in js
    paginas = sorted(SITIO.glob("*.html")) + sorted((SITIO / "pobreza").glob("*.html"))
    for p in paginas:
        nombre = p.relative_to(SITIO).as_posix()
        h = p.read_text(encoding="utf-8")
        if "location.replace(" in h and "<main" not in h:
            if 'name="robots" content="noindex"' not in h or 'rel="canonical"' not in h:
                problemas.append(f"{nombre}: redirección sin noindex o sin canonical")
            destino = re.search(r'rel="canonical" href="([^"]+)"', h)
            excepciones.append(f"{nombre}: redirección a {destino.group(1) if destino else '?'}")
            continue
        enc = Encabezados()
        enc.feed(h)
        if nombre == "index.html":
            if enc.h1_total != 1:
                problemas.append(f"{nombre}: {enc.h1_total} h1 (la portada debe tener uno, el de Datina)")
            else:
                excepciones.append(f"{nombre}: portada, el h1 va en el bloque azul antes de <main>")
            continue
        if nombre.startswith("pobreza/"):
            if enc.h1_total != 1:
                problemas.append(f"{nombre}: {enc.h1_total} h1 (el consultor de pobreza debe tener uno)")
            else:
                excepciones.append(f"{nombre}: consultor de pobreza (Observable Framework), un h1")
            continue
        if '<article class="nota"' in h or '<section class="pieza"' in h:
            if enc.h1_total:
                problemas.append(f"{nombre}: el título lo arma datina.js, pero el HTML ya tiene {enc.h1_total} h1")
            elif not js_titulo_h1:
                problemas.append(f"{nombre}: datina.js no escribe el título de la nota como h1")
            else:
                excepciones.append(f"{nombre}: el h1 lo escribe datina.js al cargar")
            continue
        h1s = [t for n, t in enc.en_main_lista if n == 1]
        if enc.h1_total != 1 or len(h1s) != 1:
            problemas.append(f"{nombre}: {enc.h1_total} h1 en la página ({len(h1s)} dentro de <main>), tiene que haber uno")
            continue
        if not enc.en_main_lista or enc.en_main_lista[0][0] != 1:
            problemas.append(f"{nombre}: el primer encabezado de <main> no es el h1")
        if not h1s[0]:
            problemas.append(f"{nombre}: el h1 está vacío")
        if 'class="tema con-pregunta' in h and not re.search(r'<h1 class="pregunta"[^>]*>[^<]+</h1>', h):
            problemas.append(f"{nombre}: la sección tiene la pregunta como título, pero el h1 no es la pregunta")
        niveles = [n for n, _ in enc.en_main_lista]
        saltos = sorted({f"h{a} a h{b}" for a, b in zip(niveles, niveles[1:]) if b > a + 1})
        if saltos:
            avisos.append(f"{nombre}: salta de {', '.join(saltos)}")
    return problemas, avisos, excepciones, len(paginas)


if __name__ == "__main__":
    problemas, avisos, excepciones, n = revisar()
    print(f"Encabezados: {n} páginas revisadas, {len(excepciones)} excepciones aceptadas, {len(avisos)} con saltos de nivel (aviso).")
    if "-v" in sys.argv:
        for x in excepciones:
            print("  excepción: " + x)
        for x in avisos:
            print("  aviso: " + x)
    if problemas:
        print("Problemas:\n  " + "\n  ".join(problemas))
        sys.exit(1)
    print("Encabezados en orden.")
