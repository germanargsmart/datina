"""La imagen que muestra un enlace de Datina al compartirlo (og:image, D3, decisión del autor del 1 de noviembre de 2026): una por página, con la
marca, la pregunta de la página y un dato destacado. La arma 03_construir_sitio.py con Pillow, sin Chrome, en sitio/og/.

Una imagen se dibuja solo si cambió lo que lleva: sitio/og/huellas.json guarda la huella de cada una (el texto, el dominio, la bandera, la letra y VERSION). Así
armar en Windows o en Linux da los mismos archivos aunque el dibujo difiera en algún píxel, y un armado sin cambios no toca ninguna imagen. Si se
cambia el dibujo, hay que subir VERSION: se vuelven a dibujar todas.
"""
import hashlib
import json
import pathlib
import re

from PIL import Image, ImageDraw, ImageFont

VERSION = 1
ANCHO, ALTO, MARGEN = 1200, 630, 72
FUENTE = pathlib.Path(__file__).resolve().parent / "fuentes" / "RobotoFlex.ttf"  # la misma letra del sitio, con su licencia al lado. No se publica
_css = (pathlib.Path(__file__).resolve().parent / "datina.css").read_text(encoding="utf-8")
DOMINIO = json.loads((pathlib.Path(__file__).resolve().parent.parent / "datos" / "manual" / "sitio.json").read_text(encoding="utf-8"))["url"].replace("https://", "").strip("/")
_tono = lambda n: re.search(rf"--{n}:\s*(#[0-9A-Fa-f]{{6}})", _css).group(1)
BG, TINTA, GRIS, CELESTE, FUERTE, ROJO, ROJO_OSC = (_tono(n) for n in ("bg", "ink", "muted", "celeste", "celeste-fuerte", "rojo", "rojo-oscuro"))
# el gorro de la marca, el mismo dibujo del ícono del sitio (viewBox 40 x 36): solo usa M, C, L, Q y Z en coordenadas absolutas
GORRO = [(ROJO, "M7,29 C5.5,17 10,6.5 19.5,4.2 C26.5,2.6 33.5,5.2 36,10.6 C37.2,13.2 35,15.4 32.6,13.8 C31,12.6 29.2,11.6 27,12.2 C31.6,16 33.8,21.6 33.6,29 Z"),
         (ROJO_OSC, "M5.6,27.6 L35,27.6 Q35.8,31.6 35,33.4 Q20.3,35.6 5.6,33.4 Q4.8,31.6 5.6,27.6 Z")]
_huellas, _usadas, _dir = None, set(), None


def _letra(tam, peso, ancho=100):
    f = ImageFont.truetype(str(FUENTE), tam)
    pedido = {b"Optical Size": min(144, tam), b"Weight": peso, b"Width": ancho}
    f.set_variation_by_axes([pedido.get(a["name"], a["default"]) for a in f.get_variation_axes()])
    return f


def _puntos(d):
    """Los puntos de un camino SVG de un solo trazo, con las curvas en tramos cortos"""
    t = re.findall(r"[MCLQZ]|-?[0-9.]+", d)
    pts, i, cmd = [], 0, None
    while i < len(t):
        if t[i] in "MCLQZ":
            cmd, i = t[i], i + 1
            continue
        n = {"M": 1, "L": 1, "Q": 2, "C": 3}[cmd]
        c = [(float(t[i + 2 * k]), float(t[i + 2 * k + 1])) for k in range(n)]
        i += 2 * n
        if n == 1:
            pts.append(c[0])
        else:
            p0 = pts[-1]
            for s in range(1, 25):
                u = s / 24
                if n == 2:
                    pts.append(tuple((1 - u) ** 2 * p0[j] + 2 * (1 - u) * u * c[0][j] + u ** 2 * c[1][j] for j in (0, 1)))
                else:
                    pts.append(tuple((1 - u) ** 3 * p0[j] + 3 * (1 - u) ** 2 * u * c[0][j] + 3 * (1 - u) * u ** 2 * c[1][j] + u ** 3 * c[2][j] for j in (0, 1)))
    return pts


def _gorro(im, x, y, alto):
    """El gorro, dibujado al cuádruple y achicado para que los bordes queden suaves"""
    esc = alto / 36 * 4
    capa = Image.new("RGBA", (int(40 * esc), int(36 * esc)), (0, 0, 0, 0))
    dib = ImageDraw.Draw(capa)
    for color, d in GORRO:
        dib.polygon([(a * esc, b * esc) for a, b in _puntos(d)], fill=color)
    capa = capa.resize((int(40 * esc / 4), int(36 * esc / 4)), Image.LANCZOS)
    im.paste(capa, (x, y), capa)
    return capa.width


def _renglones(texto, letra, ancho):
    filas, fila = [], ""
    for p in texto.split():
        prueba = f"{fila} {p}".strip()
        if letra.getlength(prueba) <= ancho:
            fila = prueba
        else:
            filas.append(fila)
            fila = p
    return filas + [fila] if fila else filas


def _dibujar(ruta, titulo, valor, leyenda, bandera):
    im = Image.new("RGB", (ANCHO, ALTO), BG)
    d = ImageDraw.Draw(im)
    # dos franjas celestes, como la bandera
    d.rectangle((0, 0, ANCHO, 13), fill=CELESTE)
    d.rectangle((0, ALTO - 14, ANCHO, ALTO), fill=CELESTE)
    # la marca y el lema
    x = MARGEN + _gorro(im, MARGEN, 46, 52) + 12
    d.text((x, 40), "Datina", font=_letra(60, 800, 60), fill=FUERTE)
    lema = _letra(28, 400)
    d.text((ANCHO - MARGEN - lema.getlength("Las 24 Argentinas en números"), 58), "Las 24 Argentinas en números", font=lema, fill=GRIS)
    # la pregunta: la letra más grande con la que entra
    arriba, x_tit = 148, MARGEN
    if bandera:
        ban = Image.open(bandera).convert("RGB").resize((108, 72), Image.LANCZOS)
        im.paste(ban, (MARGEN, arriba + 6))
        x_tit = MARGEN + 132
    alto_max = 224 if valor else 340
    for tam in (84, 76, 68, 60, 54, 48, 44, 40):
        letra = _letra(tam, 700, 70)
        filas = _renglones(titulo, letra, ANCHO - MARGEN - x_tit)
        if len(filas) * tam * 1.14 <= alto_max:
            break
    for i, f in enumerate(filas):
        d.text((x_tit, arriba + i * tam * 1.14), f, font=letra, fill=FUERTE)
    # el dato destacado y su explicación al lado
    if valor:
        fv = _letra(112, 700, 50)
        d.text((MARGEN, 396), valor, font=fv, fill=TINTA)
        x_l = MARGEN + fv.getlength(valor) + 32
        fl = _letra(32, 400)
        filas = _renglones(leyenda or "", fl, ANCHO - MARGEN - x_l)[:4]
        y_l = 396 + 70 - len(filas) * 21
        for i, f in enumerate(filas):
            d.text((x_l, y_l + i * 42), f, font=fl, fill=GRIS)
    d.text((MARGEN, ALTO - 62), DOMINIO, font=_letra(28, 500), fill=GRIS)
    im.quantize(colors=128, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(ruta, optimize=True)


def asegurar(carpeta, nombre, titulo, valor=None, leyenda=None, bandera=None):
    """Deja sitio/og/<nombre>.png al día: la dibuja solo si cambió lo que lleva"""
    global _huellas, _dir
    if _huellas is None:
        _dir = pathlib.Path(carpeta)
        _dir.mkdir(exist_ok=True)
        a = _dir / "huellas.json"
        _huellas = json.loads(a.read_text(encoding="utf-8")) if a.exists() else {}
    h = hashlib.sha256()
    for parte in (str(VERSION), DOMINIO, titulo, valor or "", leyenda or ""):
        h.update(parte.encode("utf-8") + b"\0")
    for f in [FUENTE] + ([pathlib.Path(bandera)] if bandera else []):
        h.update(f.read_bytes())
    huella = h.hexdigest()
    ruta = _dir / f"{nombre}.png"
    _usadas.add(nombre)
    if _huellas.get(nombre) != huella or not ruta.exists():
        _dibujar(ruta, titulo, valor, leyenda, bandera)
        _huellas[nombre] = huella


def terminar():
    """Saca las imágenes de páginas que ya no existen y guarda las huellas"""
    if _huellas is None:
        return
    for n in set(_huellas) - _usadas:
        (_dir / f"{n}.png").unlink(missing_ok=True)
        del _huellas[n]
    (_dir / "huellas.json").write_text(json.dumps(_huellas, indent=0, sort_keys=True) + "\n", encoding="utf-8", newline="\n")
