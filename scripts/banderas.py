"""
Banderas de las 24 jurisdicciones, en miniatura.
Baja cada bandera de Wikimedia Commons (el archivo que Wikidata asocia a cada provincia, propiedad P41), la dibuja
con Chrome en un recuadro de 72 x 48 píxeles (proporción 3:2, recortada al centro, igual para las 24) y la guarda en
datos/manual/banderas/{codigo}.png, junto con fuentes.csv: autor, licencia y página de cada archivo.
Los originales pesan hasta 760 KB por los escudos dibujados en detalle: en miniatura cada una pesa unos pocos KB.
Las banderas no cambian, así que se corre una sola vez (o cuando una provincia cambie la suya).
Requiere Google Chrome. Uso: python scripts/banderas.py
"""
import csv, html, json, pathlib, re, subprocess, tempfile, time, urllib.error, urllib.parse, urllib.request

RAIZ = pathlib.Path(__file__).resolve().parents[1]
SALIDA = RAIZ / "datos" / "manual" / "banderas"
CHROME = r"C:/Program Files/Google/Chrome/Application/chrome.exe"
UA = {"User-Agent": "Datina/1.0 (estadisticas publicas de la Argentina)"}
ANCHO, ALTO = 72, 48

# Código INDEC y archivo de Commons. Son los que indica Wikidata, salvo Jujuy: Wikidata enlaza una versión
# "no oficial mejorada" de la Bandera de la Libertad Civil y se usa el archivo de la provincia.
ARCHIVOS = {
    "02": "Bandera de la Ciudad de Buenos Aires.svg",
    "06": "Bandera de la Provincia de Buenos Aires.svg",
    "10": "Bandera de la Provincia de Catamarca.svg",
    "14": "Bandera de la Provincia de Córdoba 2014.svg",
    "18": "Bandera de la Provincia de Corrientes.svg",
    "22": "Bandera de la Provincia del Chaco.svg",
    "26": "Bandera de la Provincia del Chubut.svg",
    "30": "Bandera de la Provincia de Entre Ríos.svg",
    "34": "Bandera de la Provincia de Formosa.svg",
    "38": "Bandera de la Provincia de Jujuy.svg",
    "42": "Bandera de la Provincia de La Pampa.svg",
    "46": "Bandera de la Provincia de La Rioja.svg",
    "50": "Bandera de la Provincia de Mendoza.svg",
    "54": "Bandera de la Provincia de Misiones.svg",
    "58": "Bandera de la Provincia del Neuquen.svg",
    "62": "Bandera de la Provincia del Río Negro.svg",
    "66": "Bandera de la Provincia de Salta.svg",
    "70": "Flag of the San Juan Province.svg",
    "74": "Bandera de la Provincia de San Luis.svg",
    "78": "Bandera de la Provincia de Santa Cruz.svg",
    "82": "Bandera de la Provincia de Santa Fe.svg",
    "86": "Bandera de la Provincia de Santiago del Estero.svg",
    "90": "Bandera de la Provincia de Tucumán.svg",
    "94": "Bandera de la Provincia de Tierra del Fuego.svg",
}
def bajar(url):
    """Commons limita las descargas seguidas: se espera entre una y otra y se reintenta si pide más tiempo."""
    for intento in range(6):
        time.sleep(2 + 10 * intento)
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120).read()
        except urllib.error.HTTPError as err:
            if err.code != 429:
                raise
    raise RuntimeError(f"Commons no dejó bajar {url}")


limpio = lambda t: re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", t or ""))).strip()


def autor(t):
    """El campo de autor de Commons trae notas de la página: llamadas a referencias, avisos del programa de dibujo, enlaces de usuario."""
    t = re.sub(r"<[^>]+>", " ", limpio(t))
    t = re.sub(r"\[\s*\d+\s*\]", " ", t)
    t = re.sub(r"This W3C-unspecified vector image was created with Inkscape\s*\.?", " ", t)
    t = re.sub(r"\(\s*talk\s*·\s*contribs\s*\)", " ", t)
    t = re.sub(r"\s+([),.])", r"\1", re.sub(r"\(\s+", "(", t))
    return re.sub(r"\s+", " ", t).strip(" .")


def datos_commons(archivos):
    """Dirección de descarga, autor y licencia de cada archivo, según la API de Commons."""
    res = {}
    lista = list(archivos)
    for i in range(0, len(lista), 20):
        t = "|".join("File:" + a for a in lista[i:i + 20])
        u = ("https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo"
             "&iiprop=url|extmetadata&titles=" + urllib.parse.quote(t))
        r = json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60))
        normal = {n["to"]: n["from"] for n in r["query"].get("normalized", [])}
        for pg in r["query"]["pages"].values():
            assert "missing" not in pg, f"no está en Commons: {pg['title']}"
            ii = pg["imageinfo"][0]
            m = ii["extmetadata"]
            v = lambda k: limpio(m.get(k, {}).get("value", ""))
            res[normal.get(pg["title"], pg["title"])[5:]] = {
                "url": ii["url"], "pagina": ii["descriptionurl"], "autor": autor(m.get("Artist", {}).get("value", "")),
                "licencia": v("LicenseShortName"), "url_licencia": m.get("LicenseUrl", {}).get("value", "")}
    return res


def main():
    SALIDA.mkdir(parents=True, exist_ok=True)
    info = datos_commons(ARCHIVOS.values())
    filas = []
    with tempfile.TemporaryDirectory() as tmp:
        tmp = pathlib.Path(tmp)
        for cod, arch in ARCHIVOS.items():
            d = info[arch]
            svg = tmp / f"{cod}.svg"
            # algunos archivos no traen viewBox: sin él, el navegador no escala el dibujo y muestra solo una esquina
            fuente = bajar(d["url"]).decode("utf-8")
            raiz = re.search(r"<svg\b[^>]*>", fuente).group(0)
            if "viewBox" not in raiz:
                num = lambda k: float(re.match(r"[\d.]+", re.search(rf'\s{k}="([^"]+)"', raiz).group(1)).group(0))
                fuente = fuente.replace(raiz, raiz[:-1].rstrip("/") + f' viewBox="0 0 {num("width"):g} {num("height"):g}"' + ("/>" if raiz.endswith("/>") else ">"), 1)
            svg.write_text(fuente, encoding="utf-8")
            # recuadro 3:2 recortado al centro: todas quedan del mismo tamaño
            pag = tmp / f"{cod}.html"
            pag.write_text(f'<!doctype html><style>html,body{{margin:0;background:#fff}}img{{display:block;width:{ANCHO}px;height:{ALTO}px;object-fit:cover}}</style>'
                           f'<img src="{svg.as_uri()}">', encoding="utf-8")
            png = SALIDA / f"{cod}.png"
            subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
                            f"--window-size={ANCHO},{ALTO}", "--allow-file-access-from-files", "--default-background-color=ffffffff",
                            f"--screenshot={png}", pag.as_uri()], capture_output=True, timeout=120, check=True)
            assert png.exists(), f"no se dibujó la bandera {cod}"
            filas.append({"codigo_indec": cod, "archivo": arch, **{k: d[k] for k in ("autor", "licencia", "url_licencia", "pagina")}})
            print(cod, arch, f"{png.stat().st_size // 1024} KB")
    with open(SALIDA / "fuentes.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(filas[0]))
        w.writeheader()
        w.writerows(filas)
    print(f"Listo: {len(filas)} banderas en {SALIDA}")


if __name__ == "__main__":
    main()
