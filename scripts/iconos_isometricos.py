"""
Iconos isometricos de Datina.
Familia propia en el lenguaje visual que usa usafacts.org (que tiene ilustraciones propias, no reutilizables):
perspectiva isometrica real, un solo color por icono mas blanco, contorno del mismo color y sombra plana.
Cada icono se arma con figuras geometricas (cajas, cilindros, piramides, poligonos extruidos) proyectadas
en isometrico y dibujadas de atras hacia adelante. Nada se dibuja a mano alzada.

Clases de cada trazo (los colores los pone el CSS del sitio, asi el mismo icono sirve sobre blanco y sobre color):
  s  cara llena (color del icono)          l  cara clara (blanco con contorno)
  w  detalle claro sobre una cara llena    wl linea clara sobre una cara llena
  k  linea del color del icono
Peso visual parejo (etapa 8, octubre de 2026): despues de dibujar cada icono del tamano de su cuadro, el programa mide con Chrome
cuanta superficie ocupa y cuanta tinta lleva, y achica los que pesan mas que la meta (PESO_META, hasta PESO_MIN de su tamano).
Los que pesan poco no se pueden agrandar porque ya llenan el cuadro: se les dio mas superficie llena en su dibujo.
Uso: python scripts/iconos_isometricos.py [hoja.html]  (requiere Google Chrome; escribe datos/manual/iconos_iso/*.svg y, si se pide,
una hoja de muestra)
"""
import html, json, math, pathlib, re, subprocess, tempfile

RAIZ = pathlib.Path(__file__).resolve().parents[1]
SALIDA = RAIZ / "datos" / "manual" / "iconos_iso"
C30, S30 = math.cos(math.radians(30)), math.sin(math.radians(30))
ESC = 6.0            # pixeles por unidad del mundo (viewBox de 120)
CHROME = r"C:/Program Files/Google/Chrome/Application/chrome.exe"
PESO_META, PESO_MIN = 0.20, 0.80   # peso visual buscado y lo minimo que se achica un icono (ver medir_pesos)
VISTA = (1.0, 1.0, 1.0)


def suma(a, b): return tuple(p + q for p, q in zip(a, b))
def resta(a, b): return tuple(p - q for p, q in zip(a, b))
def por(a, k): return tuple(p * k for p in a)
def punto(a, b): return sum(p * q for p, q in zip(a, b))
def proy(p):
    x, y, z = p
    return ((x - y) * C30 * ESC, ((x + y) * S30 - z) * ESC)


def envolvente(pts):
    """Envolvente convexa (cadena monotona de Andrew)."""
    pts = sorted(set((round(x, 3), round(y, 3)) for x, y in pts))
    def cruz(o, a, b): return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    abajo, arriba = [], []
    for p in pts:
        while len(abajo) >= 2 and cruz(abajo[-2], abajo[-1], p) <= 0: abajo.pop()
        abajo.append(p)
    for p in reversed(pts):
        while len(arriba) >= 2 and cruz(arriba[-2], arriba[-1], p) <= 0: arriba.pop()
        arriba.append(p)
    return abajo[:-1] + arriba[:-1]


def recortar_derecha(poligono, x0):
    """Parte de un poligono a la derecha de la vertical x = x0 (Sutherland-Hodgman con un solo borde)."""
    sale = []
    for i in range(len(poligono)):
        a, b = poligono[i], poligono[(i + 1) % len(poligono)]
        da, db = a[0] >= x0, b[0] >= x0
        if da: sale.append(a)
        if da != db:
            t = (x0 - a[0]) / (b[0] - a[0])
            sale.append((x0, a[1] + t * (b[1] - a[1])))
    return sale


RX, RY = math.sqrt(2) * C30 * ESC, math.sqrt(2) * S30 * ESC   # semiejes en pantalla de un circulo horizontal de radio 1


def f1(v):
    """Numero con un decimal, sin ceros de mas (12.0 -> 12)."""
    t = f"{v:.1f}"
    return t[:-2] if t.endswith(".0") else ("-0" if t == "-0.0" else t)


class Icono:
    """Las capas guardan coordenadas de pantalla. Tipos: p (poligono), l (linea), e (elipse), c (circulo),
    d (camino con arcos, con sus puntos extremos para calcular el tamaño)."""
    def __init__(self, nombre, tono):
        self.nombre, self.tono, self.capas, self.factor = nombre, tono, [], 1.0

    # ---- primitivas de dibujo
    def poli(self, pts3, cls):
        self.capas.append(("p", [proy(p) for p in pts3], cls))

    def linea(self, pts3, cls="k"):
        self.capas.append(("l", [proy(p) for p in pts3], cls))

    def camino(self, d, cls, extremos):
        self.capas.append(("d", d, cls, extremos))

    # ---- figuras
    def caja(self, x, y, z, w, d, h, arriba="l", izq="l", der="s"):
        """Caja con aristas paralelas a los ejes. Caras visibles: arriba, +y (izquierda en pantalla), +x (derecha)."""
        self.poli([(x, y + d, z), (x + w, y + d, z), (x + w, y + d, z + h), (x, y + d, z + h)], izq)
        self.poli([(x + w, y, z), (x + w, y + d, z), (x + w, y + d, z + h), (x + w, y, z + h)], der)
        self.poli([(x, y, z + h), (x + w, y, z + h), (x + w, y + d, z + h), (x, y + d, z + h)], arriba)

    def elipse_piso(self, cx, cy, z, r, cls="s"):
        """Circulo horizontal: en isometrico es una elipse con los ejes alineados con la pantalla."""
        x, y = proy((cx, cy, z))
        self.capas.append(("e", (x, y, r * RX, r * RY), cls))

    def arco_frente(self, cx, cy, z, r, cls="wl", n=None, desde=-45, hasta=135):
        """Parte delantera de un circulo horizontal (de -45 a 135 grados es la mitad que mira al observador)."""
        p0 = proy((cx + r * math.cos(math.radians(desde)), cy + r * math.sin(math.radians(desde)), z))
        p1 = proy((cx + r * math.cos(math.radians(hasta)), cy + r * math.sin(math.radians(hasta)), z))
        grande = 1 if hasta - desde > 180 else 0
        self.camino(f"M{f1(p0[0])} {f1(p0[1])}A{f1(r * RX)} {f1(r * RY)} 0 {grande} 1 {f1(p1[0])} {f1(p1[1])}", cls, [p0, p1])

    def sombra(self, cx, cy, a, b):
        """Sombra plana en el piso: elipse alargada hacia la derecha de la pantalla, como una sombra proyectada."""
        x, y = proy((cx, cy, 0))
        self.capas.append(("e", (x, y, a * RX, b * RY), "s"))

    def circulo_vertical(self, cx, y, cz, r, cls, n=28):
        """Circulo en el plano de la cara +y (ruedas)."""
        self.poli([(cx + r * math.cos(2 * math.pi * i / n), y, cz + r * math.sin(2 * math.pi * i / n)) for i in range(n)], cls)

    def cilindro(self, cx, cy, z, r, h, arriba="l", lado="s"):
        x, y0 = proy((cx, cy, z))
        y1 = y0 - h * ESC
        rx, ry = r * RX, r * RY
        d = (f"M{f1(x - rx)} {f1(y0)}A{f1(rx)} {f1(ry)} 0 0 0 {f1(x + rx)} {f1(y0)}"
             f"L{f1(x + rx)} {f1(y1)}A{f1(rx)} {f1(ry)} 0 0 1 {f1(x - rx)} {f1(y1)}Z")
        self.camino(d, lado, [(x - rx, y1 - ry), (x + rx, y0 + ry)])
        if arriba:
            self.capas.append(("e", (x, y1, rx, ry), arriba))

    def extruir(self, pts2, origen, U, V, E, frente="l", lados="s"):
        """Poligono plano (coordenadas u, v sobre los ejes U y V desde origen) extruido segun E."""
        base = [suma(origen, suma(por(U, u), por(V, v))) for u, v in pts2]
        tope = [suma(p, E) for p in base]
        area = sum(pts2[i][0] * pts2[(i + 1) % len(pts2)][1] - pts2[(i + 1) % len(pts2)][0] * pts2[i][1] for i in range(len(pts2)))
        signo = 1 if area > 0 else -1
        caras = []
        for i in range(len(base)):
            (u0, v0), (u1, v1) = pts2[i], pts2[(i + 1) % len(pts2)]
            du, dv = u1 - u0, v1 - v0
            normal = por(suma(por(U, dv), por(V, -du)), signo)   # normal hacia afuera en el plano del poligono
            if punto(normal, VISTA) > 1e-9:
                q = [base[i], base[(i + 1) % len(base)], tope[(i + 1) % len(base)], tope[i]]
                caras.append((punto(por(suma(suma(q[0], q[1]), suma(q[2], q[3])), .25), VISTA), q))
        if punto(E, VISTA) < 0:
            self.poli(base, frente)
        for _, q in sorted(caras, key=lambda c: c[0]):
            self.poli(q, lados)
        if punto(E, VISTA) >= 0:
            self.poli(tope, frente)
        return base, tope

    def piramide(self, cx, cy, z, r, h, n=4, giro=45, nieve=0.0, modo=None, apice=None):
        """Piramide de n lados. Las caras que miran a +x van llenas y las que miran a +y, claras,
        salvo que modo fije una sola clase. apice permite correr la punta (cerros irregulares)."""
        b = [(cx + r * math.cos(math.radians(giro + 360 * i / n)), cy + r * math.sin(math.radians(giro + 360 * i / n)), z) for i in range(n)]
        apice = apice or (cx, cy, z + h)
        caras = []
        for i in range(n):
            p0, p1 = b[i], b[(i + 1) % n]
            e1, e2 = resta(p1, p0), resta(apice, p0)
            nor = (e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0])
            if punto(nor, VISTA) > 1e-9:
                caras.append((punto(suma(suma(p0, p1), apice), VISTA), p0, p1, nor))
        for _, p0, p1, nor in sorted(caras, key=lambda c: c[0]):
            llena = nor[0] > nor[1]
            self.poli([p0, p1, apice], modo or ("s" if llena else "l"))
            if nieve:
                a0 = suma(apice, por(resta(p0, apice), nieve))
                a1 = suma(apice, por(resta(p1, apice), nieve))
                m = suma(apice, por(resta(suma(por(p0, .5), por(p1, .5)), apice), nieve * .7))
                if llena:
                    self.poli([apice, a0, m, a1], "w")
                else:
                    self.linea([a0, m, a1], "k")

    def revolucion(self, cx, cy, perfil, lado="s", mitad=False):
        """Cuerpo convexo de revolucion alrededor de un eje vertical. perfil: [(z, radio), ...] de abajo hacia arriba.
        El contorno es la envolvente de todos los circulos horizontales (su envolvente convexa en pantalla).
        Con mitad=True, la mitad izquierda va clara y la derecha llena, como un globo."""
        pts = []
        for k in range(len(perfil) - 1):
            (za, ra), (zb, rb) = perfil[k], perfil[k + 1]
            for f in range(3):
                z, r = za + (zb - za) * f / 3, ra + (rb - ra) * f / 3
                pts += [proy((cx + r * math.cos(2 * math.pi * i / 48), cy + r * math.sin(2 * math.pi * i / 48), z)) for i in range(48)]
        z, r = perfil[-1]
        pts += [proy((cx + r * math.cos(2 * math.pi * i / 48), cy + r * math.sin(2 * math.pi * i / 48), z)) for i in range(48)]
        casco = simplificar(envolvente(pts))
        self.capas.append(("p", casco, "l" if mitad else lado))
        if mitad:
            eje = proy((cx, cy, 0))[0]
            self.capas.append(("p", recortar_derecha(casco, eje), lado))

    def esfera(self, c, r, mitad="der"):
        """Esfera en dos tonos, como un globo: la mitad izquierda clara y la derecha llena."""
        x, y = proy(c)
        R = r * math.sqrt(1.5) * ESC
        self.capas.append(("c", (x, y, R), "l"))
        if mitad:
            self.camino(f"M{f1(x)} {f1(y - R)}A{f1(R)} {f1(R)} 0 0 1 {f1(x)} {f1(y + R)}Z", "s", [(x, y - R), (x + R, y + R)])

    def plano_circulo(self, x, y, R, cls):
        self.capas.append(("c", (x, y, R), cls))

    def cupula(self, c, r, cls_izq="l", cls_der="s"):
        """Media esfera apoyada en un circulo horizontal: arriba un semicirculo y abajo la mitad delantera del circulo.
        La mitad izquierda va clara y la derecha llena."""
        x, y = proy(c)
        R, ry = r * RX, r * RY        # r * RX es igual al radio de la esfera en pantalla
        self.camino(f"M{f1(x - R)} {f1(y)}A{f1(R)} {f1(R)} 0 0 1 {f1(x + R)} {f1(y)}A{f1(R)} {f1(ry)} 0 0 1 {f1(x - R)} {f1(y)}Z",
                    cls_izq, [(x - R, y - R), (x + R, y + ry)])
        self.camino(f"M{f1(x)} {f1(y - R)}A{f1(R)} {f1(R)} 0 0 1 {f1(x + R)} {f1(y)}A{f1(R)} {f1(ry)} 0 0 1 {f1(x)} {f1(y + ry)}Z",
                    cls_der, [(x, y - R), (x + R, y + ry)])

    # ---- salida
    def extremos(self):
        pts = []
        for capa in self.capas:
            t = capa[0]
            if t in ("p", "l"):
                pts += capa[1]
            elif t == "e":
                x, y, rx, ry = capa[1]; pts += [(x - rx, y - ry), (x + rx, y + ry)]
            elif t == "c":
                x, y, r = capa[1]; pts += [(x - r, y - r), (x + r, y + r)]
            else:
                pts += capa[3]
        return pts

    def svg(self, lado=120, margen=6):
        pts = self.extremos()
        xs, ys = [p[0] for p in pts], [p[1] for p in pts]
        ancho, alto = max(xs) - min(xs), max(ys) - min(ys)
        assert ancho <= lado - 2 * margen and alto <= lado - 2 * margen, (self.nombre, round(ancho), round(alto))
        cx, cy = (max(xs) + min(xs)) / 2, (max(ys) + min(ys)) / 2
        # todos con el mismo tamano: se agranda hasta ocupar el cuadro (sin pasar de 1,35 veces), y despues se achica
        # segun su peso visual (factor, lo calcula escribir con medir_pesos)
        k = min((lado - 2 * margen) / ancho, (lado - 2 * margen) / alto, 1.35) * self.factor
        partes = []
        for capa in self.capas:
            t, cls = capa[0], capa[2]
            if t in ("p", "l"):
                d = "M" + "L".join(f"{f1(x)} {f1(y)}" for x, y in capa[1]) + ("Z" if t == "p" else "")
                partes.append(f'<path class="{cls}" d="{d}"/>')
            elif t == "e":
                x, y, rx, ry = capa[1]
                partes.append(f'<ellipse class="{cls}" cx="{f1(x)}" cy="{f1(y)}" rx="{f1(rx)}" ry="{f1(ry)}"/>')
            elif t == "c":
                x, y, r = capa[1]
                partes.append(f'<circle class="{cls}" cx="{f1(x)}" cy="{f1(y)}" r="{f1(r)}"/>')
            else:
                partes.append(f'<path class="{cls}" d="{capa[1]}"/>')
        return f'<g transform="translate({f1(lado / 2)} {f1(lado / 2)}) scale({k:.3f}) translate({f1(-cx)} {f1(-cy)})">' + "".join(partes) + "</g>"


def simplificar(pts, tol=.35):
    """Saca puntos casi alineados de un contorno (menos peso sin cambio visible)."""
    if len(pts) < 4:
        return pts
    sale = [pts[0]]
    for i in range(1, len(pts) - 1):
        a, b, c = sale[-1], pts[i], pts[i + 1]
        area2 = abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]))
        largo = math.hypot(c[0] - a[0], c[1] - a[1]) or 1
        if area2 / largo > tol:
            sale.append(b)
    sale.append(pts[-1])
    return sale


# ---------------------------------------------------------------- iconos
# Cada funcion compone un icono con figuras del motor, de atras hacia adelante.
# Tonos: azul (#2C74B5), hondo (#1F5E97) y oro (#B27A00), los de la paleta de Datina.
ICONOS = {}
def icono(nombre, tono):
    def deco(f):
        ic = Icono(nombre, tono); f(ic); ICONOS[nombre] = ic; return f
    return deco


def manija(ic, x0, x1, y, z, alto, grosor=.55, prof=.55):
    """Manija en U sobre una tapa (maletin, valija, botiquin)."""
    g = grosor
    u = [(x0, 0), (x0, alto), (x1, alto), (x1, 0), (x1 - g, 0), (x1 - g, alto - g), (x0 + g, alto - g), (x0 + g, 0)]
    ic.extruir(u, (0, y, z), (1, 0, 0), (0, 0, 1), (0, prof, 0), "s", "s")


@icono("periodico", "azul")
def _(ic):
    ic.caja(.7, .7, 0, 9, 7.4, .45, "l", "s", "s")
    ic.caja(0, 0, .45, 9, 7.4, .45)
    z = .9
    ic.poli([(.8, .8, z), (8.2, .8, z), (8.2, 2.0, z), (.8, 2.0, z)], "s")
    ic.poli([(.8, 2.7, z), (4.0, 2.7, z), (4.0, 6.5, z), (.8, 6.5, z)], "s")
    for y in (2.8, 3.7, 4.6, 5.5, 6.4):
        ic.linea([(4.8, y, z), (8.2, y, z)], "k")


@icono("maletin", "azul")
def _(ic):
    ic.sombra(6.8, 1.6, 6.4, 2.2)
    ic.caja(0, 0, 0, 9.2, 4.0, 6.0)
    manija(ic, 3.1, 6.1, 1.75, 6.0, 1.5)
    y = 4.0
    ic.linea([(0, y, 3.8), (9.2, y, 3.8)], "k")
    ic.poli([(4.0, y, 3.2), (5.2, y, 3.2), (5.2, y, 4.4), (4.0, y, 4.4)], "s")


@icono("tienda", "azul")
def _(ic):
    ic.sombra(8.4, 3.0, 5.2, 2.2)
    ic.caja(0, 0, 0, 9.0, 6.0, 5.6)
    y = 6.0
    ic.poli([(1.0, y, 0), (2.7, y, 0), (2.7, y, 3.4), (1.0, y, 3.4)], "s")
    ic.poli([(3.5, y, 1.3), (8.0, y, 1.3), (8.0, y, 3.4), (3.5, y, 3.4)], "l")
    ic.linea([(5.75, y, 1.3), (5.75, y, 3.4)], "k")
    for k in range(5):
        x0, x1 = k * 1.8, (k + 1) * 1.8
        c = "s" if k % 2 == 0 else "l"
        ic.poli([(x0, 6.0, 5.0), (x1, 6.0, 5.0), (x1, 7.7, 4.1), (x0, 7.7, 4.1)], c)
        ic.poli([(x0, 7.7, 4.1), (x1, 7.7, 4.1), (x1, 7.7, 3.6), (x0, 7.7, 3.6)], c)


@icono("casa", "azul")
def _(ic):
    ic.sombra(7.4, 3.2, 4.8, 2.0)
    # faldon trasero del techo y chimenea, despues paredes, frontis y faldon delantero
    ic.poli([(-.5, 3.5, 7.6), (7.5, 3.5, 7.6), (7.5, -.6, 4.2), (-.5, -.6, 4.2)], "l")
    ic.caja(4.6, 1.0, 5.4, .9, .9, 2.4)
    ic.poli([(0, 7, 0), (7, 7, 0), (7, 7, 4.4), (0, 7, 4.4)], "l")
    ic.poli([(7, 0, 0), (7, 7, 0), (7, 7, 4.4), (7, 0, 4.4)], "s")
    ic.poli([(7, -.6, 4.2), (7, 7.6, 4.2), (7, 3.5, 7.6)], "s")
    ic.poli([(7, 2.6, 4.9), (7, 4.4, 4.9), (7, 4.4, 6.2), (7, 2.6, 6.2)], "w")
    ic.poli([(1.0, 7, 0), (2.6, 7, 0), (2.6, 7, 3.0), (1.0, 7, 3.0)], "s")
    ic.poli([(3.8, 7, 1.4), (6.0, 7, 1.4), (6.0, 7, 3.2), (3.8, 7, 3.2)], "l")
    ic.linea([(4.9, 7, 1.4), (4.9, 7, 3.2)], "k")
    ic.poli([(-.5, 3.5, 7.6), (7.5, 3.5, 7.6), (7.5, 7.6, 4.2), (-.5, 7.6, 4.2)], "s")


@icono("botiquin", "azul")
def _(ic):
    ic.sombra(7.4, 1.8, 5.8, 2.2)
    ic.caja(0, 0, 0, 8.4, 4.6, 6.2)
    manija(ic, 2.8, 5.6, 2.0, 6.2, 1.3)
    y, cx, cz, a, l = 4.6, 4.2, 3.1, .75, 2.1
    ic.poli([(cx - a, y, cz - l), (cx + a, y, cz - l), (cx + a, y, cz - a), (cx + l, y, cz - a), (cx + l, y, cz + a), (cx + a, y, cz + a),
             (cx + a, y, cz + l), (cx - a, y, cz + l), (cx - a, y, cz + a), (cx - l, y, cz + a), (cx - l, y, cz - a), (cx - a, y, cz - a)], "s")


@icono("birrete", "azul")
def _(ic):
    ic.revolucion(5, 5, [(0, 2.9), (1.6, 3.0), (2.8, 3.1)], "s", mitad=True)
    h = 4.6
    # tapa llena (etapa 8: era clara y el birrete era el icono mas liviano), con el cordon claro encima
    ic.extruir([(5 - h, 5 - h), (5 + h, 5 - h), (5 + h, 5 + h), (5 - h, 5 + h)], (0, 0, 2.8), (1, 0, 0), (0, 1, 0), (0, 0, .5), "s", "s")
    ic.cilindro(5, 5, 3.3, .55, .3)
    ic.linea([(5, 5, 3.6), (9.6, .4, 3.3)], "wl")
    ic.linea([(9.6, .4, 3.3), (9.6, .4, .8)], "k")
    ic.caja(9.25, .05, -.3, .7, .7, 1.3, "s", "s", "s")


@icono("personas", "azul")
def _(ic):
    def persona(x, y, r, h):
        ic.cilindro(x, y, 0, r, h, arriba=None)
        ic.cupula((x, y, h), r)
        ic.esfera((x, y, h + r * 1.62), r * .66)
    persona(1.6, 6.6, 1.45, 2.4)
    persona(6.6, 1.6, 1.45, 2.4)
    persona(6.0, 6.0, 1.8, 3.0)


@icono("congreso", "azul")
def _(ic):
    ic.caja(0, 0, 0, 12, 8.4, .8)
    ic.caja(.8, .8, .8, 10.4, 6.6, 3.8)
    for k in range(6):
        x0 = 1.5 + k * 1.75
        ic.poli([(x0, 7.4, 1.1), (x0 + .7, 7.4, 1.1), (x0 + .7, 7.4, 4.1), (x0, 7.4, 4.1)], "s")
    ic.extruir([(0, 0), (4, 0), (2, 1.3)], (4, 7.4, 4.6), (1, 0, 0), (0, 0, 1), (0, -1.2, 0), "l", "s")
    ic.cilindro(6, 4.1, 4.6, 2.3, 1.5)
    ic.cupula((6, 4.1, 6.1), 2.3)
    ic.cilindro(6, 4.1, 8.85, .45, .9)


@icono("colectivo", "azul")
def _(ic):
    ic.caja(0, 0, 1, 11.5, 4.4, 4.8)
    for k in range(5):
        x0 = 3.0 + k * 1.65
        ic.poli([(x0, 4.4, 3.4), (x0 + 1.25, 4.4, 3.4), (x0 + 1.25, 4.4, 5.1), (x0, 4.4, 5.1)], "s")
    ic.poli([(.8, 4.4, 1.8), (2.2, 4.4, 1.8), (2.2, 4.4, 5.1), (.8, 4.4, 5.1)], "s")
    ic.poli([(11.5, .5, 3.3), (11.5, 3.9, 3.3), (11.5, 3.9, 5.3), (11.5, .5, 5.3)], "w")
    for x in (3.2, 9.0):
        ic.circulo_vertical(x, 4.4, 1.05, 1.25, "s")
        ic.circulo_vertical(x, 4.4, 1.05, .45, "w", 24)


@icono("rayo", "azul")
def _(ic):
    ic.sombra(4.6, 1.2, 3.6, 1.4)
    rayo = [(2.6, 10.6), (.2, 4.9), (2.9, 4.9), (1.4, 0), (6.8, 6.5), (3.9, 6.5), (5.8, 10.6)]
    ic.extruir(rayo, (0, 0, 0), (1, 0, 0), (0, 0, 1), (0, 1.7, 0), "s", "l")   # frente lleno y canto claro (etapa 8)


@icono("valija", "azul")
def _(ic):
    ic.sombra(5.6, 1.4, 4.4, 1.8)
    ic.cilindro(.9, 2.9, 0, .5, .55, arriba=None)
    ic.cilindro(5.1, 2.9, 0, .5, .55, arriba=None)
    ic.caja(0, 0, .55, 6.2, 3.4, 7.0)
    y = 3.4
    for x0 in (1.3, 4.3):
        ic.poli([(x0, y, .55), (x0 + .6, y, .55), (x0 + .6, y, 7.55), (x0, y, 7.55)], "s")
    manija(ic, 2.0, 4.2, 1.4, 7.55, 1.5, .6, .6)


@icono("andes", "azul")
def _(ic):
    ic.piramide(3.6, 4.6, 0, 5.0, 8.6, nieve=.36, apice=(4.0, 4.2, 8.6))
    ic.piramide(9.0, 7.2, 0, 3.6, 5.6, nieve=.32, apice=(8.8, 7.0, 5.6))
    ic.piramide(9.6, 1.6, 0, 2.6, 4.0, nieve=.3)


@icono("mate", "azul")
def _(ic):
    # calabaza redonda en dos tonos (como un globo), virola clara, yerba y bombilla con la boquilla doblada
    perfil = [(0, 1.1), (.2, 2.0), (.6, 2.75), (1.2, 3.25), (1.9, 3.45), (2.6, 3.35), (3.3, 2.95), (3.9, 2.45), (4.3, 2.15), (4.6, 2.05)]
    ic.sombra(6.6, 3.4, 3.6, 1.5)   # sombra como la de los demas (etapa 8)
    ic.revolucion(5, 5, perfil, "s", mitad=True)
    ic.cilindro(5, 5, 4.6, 2.15, .8, arriba="l", lado="l")
    ic.elipse_piso(5, 5, 5.4, 1.65, "s")
    ic.linea([(5.7, 4.5, 5.4), (8.3, 2.0, 10.0), (9.5, 1.5, 10.25)], "k")
    ic.linea([(5.45, 4.25, 5.4), (8.05, 1.75, 10.0)], "k")


@icono("dispersion", "azul")
def _(ic):
    ic.caja(0, 0, 0, 9.6, 9.6, .55, "l", "s", "s")
    puntos = [(.9, 7.6, .8), (2.5, 5.8, 1.5), (4.1, 7.0, 1.1), (4.7, 3.8, 2.4), (6.5, 5.0, 2.0), (7.0, 1.4, 3.4), (7.9, 3.2, 2.9)]
    for x, y, h in sorted(puntos, key=lambda p: p[0] + p[1]):
        ic.caja(x, y, .55, 1.15, 1.15, h, "l", "s", "s")   # columnas con las dos caras llenas (etapa 8)


@icono("podio", "azul")
def _(ic):
    ic.caja(0, 0, 0, 3.2, 4.2, 4.2)
    ic.caja(3.2, 0, 0, 3.2, 4.2, 6.2)
    ic.caja(6.4, 0, 0, 3.2, 4.2, 2.8)
    for x0, z in ((1.0, 2.6), (4.2, 4.6), (7.4, 1.4)):
        ic.poli([(x0, 4.2, z), (x0 + 1.2, 4.2, z), (x0 + 1.2, 4.2, z + .45), (x0, 4.2, z + .45)], "s")


@icono("mosaico", "azul")
def _(ic):
    alturas = [[1.0, 2.6, 1.6], [3.6, 1.2, 2.2], [1.8, 4.4, 1.4]]
    celdas = [(i, j) for i in range(3) for j in range(3)]
    for i, j in sorted(celdas, key=lambda c: (c[0] + c[1], c[0])):
        ic.caja(i * 3.1, j * 3.1, 0, 2.7, 2.7, alturas[i][j])


@icono("pin", "azul")
def _(ic):
    # mapa plegado en tres paños y un marcador parado sobre el ultimo
    # dos paños llenos y uno claro (etapa 8: era al reves y el mapa quedaba liviano)
    paños = [((0, 0), (3.5, .9), "s"), ((3.5, .9), (7.0, 0), "l"), ((7.0, 0), (10.5, .9), "s")]
    for (x0, z0), (x1, z1), c in paños:
        ic.poli([(x0, 0, z0), (x1, 0, z1), (x1, 8, z1), (x0, 8, z0)], c)
    ic.linea([(.8, 6.6, .9 * .8 / 3.5), (2.2, 4.0, .9 * 2.2 / 3.5), (3.5, 3.4, .9)], "wl")
    ic.linea([(3.5, 3.4, .9), (5.0, 2.6, .9 * (7 - 5.0) / 3.5), (7.0, 2.2, 0)], "k")
    zb = .9 * (8.6 - 7) / 3.5
    punta, centro, r = proy((8.6, 3.4, zb)), proy((8.6, 3.4, zb + 4.6)), 1.55 * math.sqrt(1.5) * ESC
    dx, dy = centro[0] - punta[0], centro[1] - punta[1]
    dist = math.hypot(dx, dy)
    ang = math.asin(r / dist)
    base = math.atan2(dy, dx)
    t1 = (punta[0] + math.cos(base - ang) * math.sqrt(dist ** 2 - r ** 2), punta[1] + math.sin(base - ang) * math.sqrt(dist ** 2 - r ** 2))
    t2 = (punta[0] + math.cos(base + ang) * math.sqrt(dist ** 2 - r ** 2), punta[1] + math.sin(base + ang) * math.sqrt(dist ** 2 - r ** 2))
    ic.capas.append(("p", [punta, t1, t2], "s"))
    ic.plano_circulo(centro[0], centro[1], r, "s")
    ic.plano_circulo(centro[0], centro[1], r * .42, "w")


@icono("buque", "azul")
def _(ic):
    ic.sombra(7.0, 1.8, 5.6, 1.8)
    casco = [(0, 2.3), (.8, 0), (10.0, 0), (11.6, 2.3)]
    ic.extruir(casco, (0, 0, 0), (1, 0, 0), (0, 0, 1), (0, 4.4, 0), "s", "s")
    ic.poli([(0, 0, 2.3), (11.6, 0, 2.3), (11.6, 4.4, 2.3), (0, 4.4, 2.3)], "l")
    ic.linea([(.55, 4.4, .75), (10.5, 4.4, .75)], "wl")
    ic.caja(.5, .6, 2.3, 1.9, 3.2, 3.4)
    ic.poli([(.7, 3.8, 4.6), (2.2, 3.8, 4.6), (2.2, 3.8, 5.3), (.7, 3.8, 5.3)], "s")
    pilas = [(2.8, 1), (5.0, 2), (7.2, 2), (9.4, 1)]
    for x0, n in pilas:
        for k in range(n):
            c = "s" if (k + int(x0)) % 2 else "l"
            ic.caja(x0, .5, 2.3 + k * 1.3, 2.2, 3.4, 1.3, "l", c, "s")


@icono("gota", "azul")
def _(ic):
    pts = [(4.4 + 3.2 * math.cos(math.radians(a)), .4 + 3.2 + 3.2 * math.sin(math.radians(a))) for a in range(-210, 31, 4)]
    pts += [(4.4, 10.6)]
    ic.sombra(5.6, 1.4, 4.0, 1.6)
    ic.extruir(pts, (0, 0, 0), (1, 0, 0), (0, 0, 1), (0, 1.8, 0), "l", "s")
    ic.linea([(2.3, 1.8, 3.6), (2.6, 1.8, 2.5), (3.4, 1.8, 1.7)], "k")


@icono("mamadera", "azul")
def _(ic):
    ic.sombra(6.2, 3.8, 3.0, 1.3)
    # con leche hasta dos tercios (etapa 8: mas superficie llena), las marcas claras sobre la leche
    ic.cilindro(5, 5, 0, 1.95, 3.7, arriba=None, lado="s")
    ic.cilindro(5, 5, 3.7, 1.95, 1.9, arriba=None, lado="l")
    for z in (1.2, 2.2, 3.2, 4.2):
        ic.arco_frente(5, 5, z, 1.95, "wl" if z < 3.7 else "k", 12, 25, 75)
    ic.cilindro(5, 5, 5.6, 2.2, 1.1)
    ic.revolucion(5, 5, [(6.7, 1.3), (7.2, 1.2), (7.6, .9), (7.9, .55), (8.6, .5)], "s", mitad=True)
    ic.cupula((5, 5, 8.6), .5)


@icono("monedas", "azul")
def _(ic):
    def pila(cx, cy, n, r=3.2, h=.72):
        for i in range(n):
            ic.cilindro(cx, cy, i * h, r, h, arriba="s" if i == n - 1 else None)
        for i in range(1, n):
            ic.arco_frente(cx, cy, i * h, r)
        ic.elipse_piso(cx, cy, n * h, r * .62, "wl")
    pila(3.2, 3.2, 7)
    pila(8.6, 6.2, 4)


@icono("reloj", "azul")
def _(ic):
    # reloj de arena: dos conos de vidrio claros, la arena llena abajo y un resto junto al cuello
    ic.cilindro(5, 5, 0, 3.1, .7)
    ic.revolucion(5, 5, [(.7, 2.45), (4.2, .05)], "l")
    ic.revolucion(5, 5, [(.7, 2.05), (2.3, .05)], "s")
    ic.revolucion(5, 5, [(4.2, .05), (7.7, 2.45)], "l")
    ic.revolucion(5, 5, [(4.2, .05), (5.2, .7)], "s")
    ic.linea([(5, 5, 4.2), (5, 5, 2.3)], "k")
    ic.cilindro(5, 5, 7.7, 3.1, .7)
    for t in (135, -45):
        x, y = 5 + 2.75 * math.cos(math.radians(t)), 5 + 2.75 * math.sin(math.radians(t))
        ic.cilindro(x, y, .7, .3, 7.0, arriba=None, lado="s")


@icono("laptop", "azul")
def _(ic):
    ic.caja(0, -.5, .6, 9.4, .5, 6.2)
    y = 0
    ic.poli([(.7, y, 1.3), (8.7, y, 1.3), (8.7, y, 6.2), (.7, y, 6.2)], "s")
    for x0, h in ((2.0, 1.4), (3.6, 2.4), (5.2, 1.9), (6.8, 3.2)):
        ic.poli([(x0, y, 1.9), (x0 + .9, y, 1.9), (x0 + .9, y, 1.9 + h), (x0, y, 1.9 + h)], "w")
    ic.caja(0, 0, 0, 9.4, 6.6, .6)
    z = .6
    ic.poli([(1.0, 1.0, z), (8.4, 1.0, z), (8.4, 3.8, z), (1.0, 3.8, z)], "s")
    for x in (2.85, 4.7, 6.55):
        ic.linea([(x, 1.0, z), (x, 3.8, z)], "wl")
    ic.linea([(1.0, 2.4, z), (8.4, 2.4, z)], "wl")
    ic.poli([(3.6, 4.5, z), (5.8, 4.5, z), (5.8, 5.9, z), (3.6, 5.9, z)], "l")


@icono("urna", "azul")
def _(ic):
    ic.sombra(7.0, 2.6, 4.6, 2.2)
    ic.caja(0, 0, 0, 8, 8, 6.2)
    ic.poli([(1.8, 3.55, 6.2), (6.2, 3.55, 6.2), (6.2, 4.45, 6.2), (1.8, 4.45, 6.2)], "s")
    ic.poli([(2.4, 4, 6.2), (5.6, 4, 6.2), (5.6, 4, 10.4), (2.4, 4, 10.4)], "l")
    ic.linea([(3.1, 4, 8.6), (3.8, 4, 7.8), (5.0, 4, 9.6)], "k")
    ic.poli([(1.6, 8, 2.4), (6.4, 8, 2.4), (6.4, 8, 3.6), (1.6, 8, 3.6)], "s")



@icono("portapapeles", "azul")
def _(ic):
    # diagnóstico educativo (etapa 10): un portapapeles parado con una hoja y un gráfico de barras
    ic.sombra(7.6, -0.4, 3.4, 1.4)
    ic.caja(0, 0, 0, 8.2, .8, 10.4, "s", "s", "s")
    y = .8
    ic.poli([(.7, y, .6), (7.5, y, .6), (7.5, y, 9.3), (.7, y, 9.3)], "l")
    for x0, h in ((1.5, 2.4), (3.4, 4.4), (5.3, 3.2)):
        ic.poli([(x0, y, 1.5), (x0 + 1.3, y, 1.5), (x0 + 1.3, y, 1.5 + h), (x0, y, 1.5 + h)], "s")
    ic.linea([(1.2, y, 1.5), (7.0, y, 1.5)], "k")
    for z in (7.3, 8.3):
        ic.linea([(1.5, y, z), (6.7, y, z)], "k")
    ic.caja(2.8, -.1, 9.9, 2.6, 1.1, 1.2, "s", "s", "s")

@icono("ciguena", "azul")
def _(ic):
    # petróleo y gas (etapa 18): un bombeador de pozo, la "cigüeña" de los yacimientos, sobre su base y con la boca de pozo
    ic.sombra(7.0, 2.2, 6.0, 1.8)
    ic.caja(0, 0, 0, 11.2, 3.2, .6)
    ic.caja(.5, .6, .6, 2.8, 2.0, 2.0)
    ic.circulo_vertical(1.9, 2.6, 2.6, 1.9, "s")
    ic.circulo_vertical(1.9, 2.6, 2.6, .55, "w", 20)
    y0, prof = 1.2, .7
    for pata in ([(4.0, .6), (4.8, .6), (6.1, 6.6), (5.5, 6.6)], [(7.6, .6), (8.4, .6), (6.5, 6.6), (5.9, 6.6)]):
        ic.extruir(pata, (0, y0, 0), (1, 0, 0), (0, 0, 1), (0, prof, 0), "s", "s")
    ic.linea([(1.9, 2.7, 3.9), (1.5, 2.7, 6.6)], "k")
    ic.extruir([(.8, 6.2), (10.0, 7.4), (10.0, 8.3), (.8, 7.1)], (0, y0, 0), (1, 0, 0), (0, 0, 1), (0, prof + .2, 0), "l", "s")
    ic.extruir([(9.6, 6.0), (11.0, 6.4), (11.6, 7.4), (11.6, 8.6), (10.6, 9.4), (9.8, 8.4)], (0, y0, 0), (1, 0, 0), (0, 0, 1), (0, prof + .2, 0), "s", "s")
    ic.linea([(11.1, 1.65, 6.3), (11.1, 1.65, 1.7)], "k")
    ic.cilindro(11.1, 1.65, .6, .55, 1.1)


@icono("grua", "azul")
def _(ic):
    # construcción y vivienda (etapa 18): una grúa torre junto a un edificio en obra, con una carga colgando
    ic.sombra(6.0, 4.0, 6.4, 2.4)
    ic.caja(0, 2.4, 0, 6.0, 5.6, 3.4)
    for x in (.2, 2.7, 5.2):
        ic.caja(x, 7.2, 3.4, .6, .6, 2.6, "s", "s", "s")
    ic.caja(0, 2.4, 6.0, 6.0, 5.6, .5)
    ic.caja(8.0, 3.6, 0, 1.1, 1.1, 11.2, "s", "l", "s")
    for z in (1.0, 3.2, 5.4, 7.6):
        ic.linea([(8.0, 4.7, z), (9.1, 4.7, z + 2.2)], "k")
    ic.caja(2.0, 3.8, 11.2, 11.0, .7, .7)
    ic.caja(2.2, 3.6, 10.0, 1.5, 1.1, 1.2, "s", "s", "s")
    ic.linea([(11.6, 4.15, 11.2), (11.6, 4.15, 6.8)], "k")
    ic.caja(11.0, 3.6, 5.6, 1.2, 1.2, 1.2, "s", "s", "s")


@icono("billetes", "azul")
def _(ic):
    # el artículo del dólar, la inversión y la construcción (etapa 22): cuatro fajos de billetes apilados, cada uno con su faja, y el
    # óvalo del billete de arriba
    ic.sombra(5.6, 3.0, 5.8, 2.2)
    w, d, h = 8.4, 4.4, 1.25
    pila = [(0, .7), (.8, 0), (.2, .9), (.7, .3)]
    for i, (x, y) in enumerate(pila):
        z = i * h
        ic.caja(x, y, z, w, d, h)
        ic.linea([(x, y + d, z + h / 2), (x + w, y + d, z + h / 2)], "k")
        ic.poli([(x + 3.5, y, z + h), (x + 4.9, y, z + h), (x + 4.9, y + d, z + h), (x + 3.5, y + d, z + h)], "s")
        ic.poli([(x + 3.5, y + d, z), (x + 4.9, y + d, z), (x + 4.9, y + d, z + h), (x + 3.5, y + d, z + h)], "s")
    x, y = pila[-1]
    ic.elipse_piso(x + 6.7, y + d / 2, len(pila) * h, .95, "s")
    ic.elipse_piso(x + 1.7, y + d / 2, len(pila) * h, .5, "s")


@icono("escudo", "azul")
def _(ic):
    # Seguridad (etapa 23): un escudo parado, con una estrella de cinco puntas en el frente
    ic.sombra(5.0, 1.4, 4.4, 1.6)
    borde = [(0, 9.0), (2.0, 9.45), (4, 9.65), (6.0, 9.45), (8, 9.0), (8, 5.4), (7.6, 3.5), (6.6, 1.9), (5.3, .7), (4, 0),
             (2.7, .7), (1.4, 1.9), (.4, 3.5), (0, 5.4)]
    ic.extruir(borde, (0, 0, 0), (1, 0, 0), (0, 0, 1), (0, 1.6, 0), "s", "l")
    # la estrella va sobre el frente (la cara de y = 1.6, la que se ve)
    cx, cz, r1, r2 = 4.0, 5.3, 2.35, .95
    estrella = [(cx + (r1 if i % 2 == 0 else r2) * math.sin(math.pi * i / 5), 1.6, cz + (r1 if i % 2 == 0 else r2) * math.cos(math.pi * i / 5))
                for i in range(10)]
    ic.poli(estrella, "w")


@icono("carrito", "azul")
def _(ic):
    # Economía y precios (etapa 25): un carrito de compras, con la canasta enrejada, la manija y dos ruedas
    ic.sombra(5.2, 2.4, 5.4, 1.8)
    canasta = [(0, 5.2), (8, 5.2), (7, 1.7), (1, 1.7)]
    ic.extruir(canasta, (0, 0, 0), (1, 0, 0), (0, 0, 1), (0, 2.8, 0), "l", "s")
    y = 2.8   # el frente que se ve es la cara de y = 2.8
    for u in (2.67, 5.33):
        ic.linea([(u, y, 5.2), (1 + u / 8 * 6, y, 1.7)], "k")
    ic.linea([(.5, y, 3.45), (7.5, y, 3.45)], "k")
    # la manija y la barra de abajo
    ic.linea([(8, .3, 5.2), (9.7, .3, 6.8), (9.7, 2.5, 6.8), (8, 2.5, 5.2)], "k")
    ic.linea([(1.1, y, 1.0), (7.4, y, 1.0)], "k")
    for cx in (1.9, 6.6):
        ic.circulo_vertical(cx, y + .05, .6, .62, "l")   # claras: sobre la sombra se ven


@icono("globo", "azul")
def _(ic):
    # Migraciones (etapa 25): un globo terráqueo en dos tonos sobre su pie, con el ecuador y dos paralelos
    ic.sombra(6.4, 4.6, 3.8, 1.5)
    ic.cilindro(5, 5, 0, 2.2, .5, arriba="l", lado="s")
    ic.cilindro(5, 5, .5, .3, 2.0, arriba="s", lado="s")
    zc, r = 6.3, 3.8
    ic.esfera((5, 5, zc), r, mitad="der")
    for dz in (-2.0, 0, 2.0):
        rr = (r * r - dz * dz) ** .5
        ic.arco_frente(5, 5, zc + dz, rr, "k", desde=45, hasta=135)
        ic.arco_frente(5, 5, zc + dz, rr, "wl", desde=-45, hasta=45)


@icono("mastil", "azul")
def _(ic):
    # Gobierno (etapa 25): un mástil con la bandera, tres franjas y el sol, sobre un pedestal
    ic.sombra(6.2, 5.4, 4.2, 1.6)
    ic.caja(3.6, 3.6, 0, 2.8, 2.8, .8)
    ic.cilindro(5, 5, .8, .28, 10.6, arriba="s", lado="s")
    xs = [5.3, 7.5, 9.7, 11.9]
    arriba = [11.2, 11.6, 11.1, 11.5]
    alto = 4.2
    f = lambda z0, z1: [(x, 5, z) for x, z in zip(xs, z0)] + [(x, 5, z) for x, z in zip(xs[::-1], z1[::-1])]
    ic.poli(f(arriba, [z - alto for z in arriba]), "s")
    ic.poli(f([z - alto / 3 for z in arriba], [z - 2 * alto / 3 for z in arriba]), "w")
    x, y = proy((8.6, 5, 11.35 - alto / 2))
    ic.plano_circulo(x, y, .42 * ESC, "s")


@icono("matraz", "azul")
def _(ic):
    # Laboratorio (etapa 33): un matraz de vidrio claro con el líquido lleno hasta un poco menos de la mitad, dos burbujas y dos marcas
    ic.sombra(6.4, 4.4, 3.9, 1.6)
    ic.revolucion(5, 5, [(0, 3.5), (.35, 3.55), (4.7, 1.05), (5.0, .98)], "l")
    ic.revolucion(5, 5, [(0, 3.5), (.35, 3.55), (2.4, 2.4)], "s")
    ic.arco_frente(5, 5, 2.4, 2.4, "wl", desde=-30, hasta=120)
    for x0, y0, z0, r in ((4.2, 6.2, 1.2, .34), (5.9, 4.9, .8, .24)):
        x, y = proy((x0, y0, z0))
        ic.plano_circulo(x, y, r * ESC, "w")
    for z in (3.2, 4.0):
        rr = 3.55 - (3.55 - 1.05) * (z - .35) / (4.7 - .35)
        ic.arco_frente(5, 5, z, rr, "k", desde=40, hasta=90)
    ic.cilindro(5, 5, 4.9, .98, 2.9, arriba=None, lado="l")
    ic.cilindro(5, 5, 7.8, 1.3, .5, arriba="l", lado="l")
    ic.elipse_piso(5, 5, 8.3, .82, "s")


@icono("balanza", "azul")
def _(ic):
    # la Corte Suprema (etapa 33): una balanza de dos platos hondos sobre su columna, con el brazo en diagonal como todo lo isométrico
    ic.sombra(6.4, 5.0, 3.6, 1.5)
    ic.cilindro(5, 5, 0, 2.1, .55)
    ic.cilindro(5, 5, .55, 1.2, .45)

    def plato(cx):
        for dx in (-1.25, 1.25):
            ic.linea([(cx, 5, 8.0), (cx + dx, 5, 4.4)], "k")
        ic.revolucion(cx, 5, [(3.0, .45), (4.4, 1.6)], "s")
        ic.elipse_piso(cx, 5, 4.4, 1.6, "l")
    plato(1.3)
    ic.cilindro(5, 5, 1.0, .36, 6.9, arriba="s", lado="s")
    ic.caja(.9, 4.72, 7.75, 8.2, .56, .5, "s", "l", "s")
    ic.cupula((5, 5, 8.25), .62)
    plato(8.7)


# ---------------------------------------------------------------- salida
# todos azules desde la etapa 3 (octubre de 2026): el amarillo queda para el sol y la tarjeta amarilla
TONOS = {"azul": "#2C74B5"}

def medir_pesos(cuerpos):
    """Peso visual de cada icono, medido con Chrome: lo dibuja a 240 pixeles con el trazo que tiene en una tarjeta del sitio y
    cuenta la superficie que ocupa (s, de 0 a 1) y cuanto la oscurece (t, la tinta). Peso = raiz de s por t: un icono grande pero
    casi blanco y uno chico pero lleno pesan parecido."""
    estilo = ("<style>path,ellipse,circle{vector-effect:non-scaling-stroke;stroke-linejoin:round;stroke-linecap:round;stroke-width:5px}"
              ".s{fill:#2C74B5;stroke:#2C74B5}.l{fill:#fff;stroke:#2C74B5}.w{fill:#fff;stroke:none}.wl{fill:none;stroke:#fff}.k{fill:none;stroke:#2C74B5}</style>")
    datos = {n: f'<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 120 120">{estilo}{c}</svg>' for n, c in cuerpos.items()}
    js = ("(async () => { const out = {};"
          " for (const [n, s] of Object.entries(D)) { const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s); await img.decode();"
          "  const c = document.createElement('canvas'); c.width = c.height = 240; const g = c.getContext('2d'); g.drawImage(img, 0, 0);"
          "  const d = g.getImageData(0, 0, 240, 240).data; let s2 = 0, t = 0;"
          "  for (let i = 0; i < d.length; i += 4) { const a = d[i + 3] / 255; s2 += a; t += a * (1 - (.2126 * d[i] + .7152 * d[i + 1] + .0722 * d[i + 2]) / 255); }"
          "  out[n] = Math.sqrt(s2 * t) / 57600; }"
          " document.getElementById('r').textContent = JSON.stringify(out); })();")
    with tempfile.TemporaryDirectory() as tmp:
        pag = pathlib.Path(tmp) / "medir.html"
        pag.write_text(f'<!doctype html><meta charset="utf-8"><pre id="r"></pre><script>const D = {json.dumps(datos)};{js}</script>', encoding="utf-8")
        r = subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--virtual-time-budget=30000", "--dump-dom", pag.as_uri()],
                           capture_output=True, timeout=300, check=True, text=True, encoding="utf-8")
    m = re.search(r'<pre id="r">(.+?)</pre>', r.stdout, re.S)
    assert m, "Chrome no devolvio las medidas de los iconos"
    return json.loads(html.unescape(m.group(1)))


def escribir():
    SALIDA.mkdir(parents=True, exist_ok=True)
    meta, grandes = {}, []
    # peso visual parejo: los que pesan mas que la meta se achican (el peso crece con el cuadrado del tamano)
    antes = medir_pesos({n: ic.svg() for n, ic in ICONOS.items()})
    for nombre, ic in ICONOS.items():
        ic.factor = max(PESO_MIN, min(1.0, math.sqrt(PESO_META / antes[nombre])))
    despues = medir_pesos({n: ic.svg() for n, ic in ICONOS.items()})
    for n in sorted(ICONOS, key=lambda n: -despues[n]):
        print(f"{n:12} peso {antes[n]:.3f} -> {despues[n]:.3f}" + (f"  (al {ICONOS[n].factor:.0%} de su tamano)" if ICONOS[n].factor < 1 else ""))
    for nombre, ic in ICONOS.items():
        try:
            cuerpo = ic.svg()
        except AssertionError as e:
            grandes.append(e.args[0]); continue
        (SALIDA / f"{nombre}.svg").write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">{cuerpo}</svg>\n', encoding="utf-8")
        meta[nombre] = ic.tono
    assert not grandes, f"iconos que no entran en el cuadro de 120: {grandes}"
    (SALIDA / "tonos.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding="utf-8")
    return meta


def hoja(ruta):
    """Hoja de muestra: cada icono a 34, 58 y 112 pixeles, sobre blanco y sobre las tarjetas de color."""
    css = """
    body{font-family:Roboto,Verdana,sans-serif;margin:20px;background:#F6F8FB;color:#18212B}
    .fila{display:flex;align-items:center;gap:22px;padding:10px 0;border-bottom:1px dotted #2C74B5}
    .fila b{width:110px;font:12px monospace}
    .t{display:grid;place-items:center;background:#fff;border-radius:12px}
    .c{display:grid;place-items:center;border-radius:14px;width:150px;height:130px}
    .iso{display:block}
    .iso path{vector-effect:non-scaling-stroke;stroke-linejoin:round;stroke-linecap:round;stroke-width:var(--trazo,2px)}
    .iso .s{fill:var(--ic);stroke:var(--ic)} .iso .l{fill:var(--ic-claro,#fff);stroke:var(--ic)}
    .iso .w{fill:var(--ic-detalle,#fff);stroke:none} .iso .wl{fill:none;stroke:var(--ic-detalle,#fff)} .iso .k{fill:none;stroke:var(--ic)}
    .tono-azul{--ic:#2C74B5}.tono-hondo{--ic:#1F5E97}.tono-oro{--ic:#B27A00}
    .azul .iso{--ic:#fff;--ic-claro:#5E97CE;--ic-detalle:#2C74B5}
    .sol .iso{--ic:#18212B;--ic-claro:#FBD36E;--ic-detalle:#F6B40E}
    .hondo .iso{--ic:#fff;--ic-claro:#4D84B8;--ic-detalle:#1F5E97}
    """
    filas = []
    for nombre, ic in ICONOS.items():
        s = lambda px, tr: f'<svg class="iso tono-{ic.tono}" style="width:{px}px;height:{px}px;--trazo:{tr}px" viewBox="0 0 120 120">{ic.svg()}</svg>'
        filas.append(f'<div class="fila"><b>{nombre}</b><div class="t" style="width:48px;height:48px">{s(34, 1.3)}</div>'
                     f'<div class="t" style="width:96px;height:96px">{s(58, 1.6)}</div><div class="t" style="width:140px;height:140px">{s(112, 2.4)}</div>'
                     f'<div class="c azul" style="background:#2C74B5">{s(104, 2.4)}</div><div class="c sol" style="background:#F6B40E">{s(104, 2.4)}</div>'
                     f'<div class="c hondo" style="background:#1F5E97">{s(104, 2.4)}</div></div>')
    pathlib.Path(ruta).write_text(f"<!doctype html><meta charset=utf-8><style>{css}</style>{''.join(filas)}", encoding="utf-8")


if __name__ == "__main__":
    import sys
    m = escribir()
    print(f"{len(m)} iconos en {SALIDA}")
    if len(sys.argv) > 1:
        hoja(sys.argv[1])
