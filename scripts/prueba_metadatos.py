"""Controla los metadatos y los enlaces internos de las páginas armadas en sitio/ (11 de octubre de 2026).

Revisa:
- Cada página tiene <title> y descripción propios (sin repetir los de otra página). Las redirecciones (alias de direcciones viejas) no
  necesitan descripción: llevan noindex y un canonical a su página nueva.
- Las páginas que se indexan (sin noindex) tienen og:title, og:description, og:type, og:site_name, og:locale y twitter:card.
- Ningún canonical, og:url, sitemap ni JSON-LD apunta a una dirección distinta de la de datos/manual/sitio.json. Sin dirección
  definitiva, no hay canonical absolutos, og:url, sitemap.xml ni robots.txt.
- El JSON-LD se puede leer y los artículos llevan un Article.
- Los enlaces internos (href y src que no van a otro sitio) llevan a archivos que existen, y los #anclas de la misma página existen
  en el HTML (las que arma datina.js al cargar, como las de las notas, no se pueden revisar acá).

Uso: python scripts/prueba_metadatos.py. Devuelve 1 si hay problemas. 03_construir_sitio.py la corre al final.
"""
import json
import re
import sys
from collections import Counter
from pathlib import Path
from urllib.parse import unquote, urlsplit

RAIZ = Path(__file__).resolve().parent.parent
SITIO = RAIZ / "sitio"
OG = ("og:title", "og:description", "og:type", "og:site_name", "og:locale")


def revisar(url_sitio=None):
    if url_sitio is None:
        url_sitio = json.loads((RAIZ / "datos" / "manual" / "sitio.json").read_text(encoding="utf-8"))["url"].strip().rstrip("/")
    problemas = []
    paginas = sorted(SITIO.glob("*.html"))
    textos = {p.name: p.read_text(encoding="utf-8") for p in paginas}
    titulos = Counter(re.search(r"<title>(.*?)</title>", h, re.S).group(1) if "<title>" in h else None for h in textos.values())
    descrs = Counter(m.group(1) for h in textos.values() if (m := re.search(r'<meta name="description" content="([^"]*)"', h)))
    for nombre, h in textos.items():
        alias = "location.replace(" in h and "<main" not in h
        noindex = re.search(r'<meta name="robots" content="[^"]*noindex', h) is not None
        t = re.search(r"<title>(.*?)</title>", h, re.S)
        if not t or not t.group(1).strip():
            problemas.append(f"{nombre}: sin <title>")
        elif titulos[t.group(1)] > 1 and not alias:
            problemas.append(f"{nombre}: el <title> se repite en otra página: {t.group(1)}")
        d = re.search(r'<meta name="description" content="([^"]*)"', h)
        if not alias:
            if not d or len(d.group(1)) < 20:
                problemas.append(f"{nombre}: sin descripción o demasiado corta")
            elif descrs[d.group(1)] > 1:
                problemas.append(f"{nombre}: la descripción se repite en otra página")
        if alias:
            if not noindex or 'rel="canonical"' not in h:
                problemas.append(f"{nombre}: redirección sin noindex o sin canonical")
            continue
        if not noindex:
            for k in OG:
                if f'property="{k}"' not in h:
                    problemas.append(f"{nombre}: falta {k}")
            if 'name="twitter:card"' not in h:
                problemas.append(f"{nombre}: falta twitter:card")
        # direcciones absolutas propias: solo la definitiva, y solo si existe
        for donde, u in re.findall(r'(rel="canonical" href|property="og:url" content)="([^"]+)"', h):
            if u.startswith("http") and (not url_sitio or not u.startswith(url_sitio + "/")):
                problemas.append(f"{nombre}: {donde.split('=')[0]} apunta a {u}, que no es la dirección definitiva")
        for bloque in re.findall(r'<script type="application/ld\+json">(.*?)</script>', h, re.S):
            try:
                ld = json.loads(bloque)
            except ValueError:
                problemas.append(f"{nombre}: JSON-LD que no se puede leer")
                continue
            # la licencia del Dataset de la portada es la página de Creative Commons: va afuera a propósito
            for u in re.findall(r'"(https?://[^"]+)"', json.dumps({k: v for k, v in ld.items() if k != "license"})):
                if not u.startswith("https://schema.org") and (not url_sitio or not u.startswith(url_sitio + "/")):
                    problemas.append(f"{nombre}: el JSON-LD apunta a {u}")
        if nombre.startswith("a-") and '"@type": "Article"' not in h:
            problemas.append(f"{nombre}: el artículo no lleva su Article en JSON-LD")
        # enlaces internos
        ids = set(re.findall(r'\bid="([^"]+)"', h))
        for attr, u in re.findall(r'\b(href|src)="([^"]+)"', h):
            if u.startswith(("http:", "https:", "mailto:", "tel:", "data:", "javascript:", "//")) or "${" in u:
                continue
            partes = urlsplit(u)
            if not partes.path:
                if partes.fragment and partes.fragment not in ids and not nombre.startswith("a-"):
                    problemas.append(f"{nombre}: el ancla #{partes.fragment} no existe en la página")
                continue
            ruta = unquote(partes.path)
            destino = (SITIO / ruta.lstrip("/")) if ruta.startswith("/") else (SITIO / ruta)
            if ruta.endswith("/"):
                destino = destino / "index.html"
            if not destino.exists():
                problemas.append(f"{nombre}: {attr} a {u}, que no existe")
    for f in ("sitemap.xml", "robots.txt"):
        existe = (SITIO / f).exists()
        if url_sitio and not existe:
            problemas.append(f"falta {f} con la dirección definitiva")
        if not url_sitio and existe:
            problemas.append(f"{f} existe sin dirección definitiva en datos/manual/sitio.json")
    return sorted(set(problemas))


if __name__ == "__main__":
    pr = revisar()
    n = len(list(SITIO.glob("*.html")))
    if pr:
        print(f"Metadatos: {n} páginas revisadas, {len(pr)} problemas:\n  " + "\n  ".join(pr))
        sys.exit(1)
    print(f"Metadatos y enlaces internos: {n} páginas revisadas, en orden.")
