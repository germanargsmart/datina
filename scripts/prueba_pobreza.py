"""
Prueba de la copia del consultor de pobreza (scripts/consultor_pobreza.py, plan de estabilización P1-3).
En una carpeta temporal arma un consultor publicado (sitio/pobreza) y un armado viejo (pobreza/dist), y controla que:
- un armado normal no toque sitio/pobreza aunque exista pobreza/dist, y lo avise,
- con --con-pobreza, sitio/pobreza quede igual a pobreza/dist,
- con --con-pobreza y sin un armado en pobreza/dist, frene sin tocar sitio/pobreza,
- 03_construir_sitio.py no copie pobreza/dist por otro camino.
La corre 03_construir_sitio.py antes de armar. Sola: python scripts/prueba_pobreza.py
"""
import hashlib, pathlib, re, sys, tempfile

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import consultor_pobreza  # noqa: E402

RAIZ = pathlib.Path(__file__).resolve().parents[1]
PUBLICADO = {"index.html": "<html>consultor publicado</html>", "_file/data/serie_nacional.json": "[1, 2]"}
VIEJO = {"index.html": "<html>armado viejo</html>", "_observablehq/client.js": "// armado viejo"}


def huella(carpeta):
    """Una sola huella para todos los archivos de la carpeta (nombre y contenido)."""
    h = hashlib.sha1()
    for p in sorted(carpeta.rglob("*")):
        if p.is_file():
            h.update(p.relative_to(carpeta).as_posix().encode("utf-8") + b"\0" + p.read_bytes() + b"\0")
    return h.hexdigest()


def armar(base, archivos):
    for ruta, texto in archivos.items():
        (base / ruta).parent.mkdir(parents=True, exist_ok=True)
        (base / ruta).write_text(texto, encoding="utf-8")


def correr(mostrar=True):
    """Devuelve la lista de problemas (vacía si la copia se comporta como debe)."""
    problemas = []

    def caso(nombre, ok):
        if not ok:
            problemas.append(nombre)
        if mostrar:
            print(f"  {'bien' if ok else 'MAL '}  {nombre}")

    with tempfile.TemporaryDirectory() as tmp:
        t = pathlib.Path(tmp)
        dist, destino, vacia = t / "pobreza" / "dist", t / "sitio" / "pobreza", t / "pobreza" / "dist_vacia"
        armar(dist, VIEJO)
        armar(destino, PUBLICADO)
        vacia.mkdir()
        antes = huella(destino)

        aviso = consultor_pobreza.copiar(dist, destino, False)
        caso("un armado normal no reemplaza sitio/pobreza aunque exista pobreza/dist", huella(destino) == antes)
        caso("un armado normal avisa que pobreza/dist no se copió", bool(aviso) and "--con-pobreza" in aviso)
        caso("sin pobreza/dist, un armado normal no avisa ni toca nada",
             consultor_pobreza.copiar(t / "no_existe", destino, False) is None and huella(destino) == antes)

        try:
            consultor_pobreza.copiar(vacia, destino, True)
            freno = False
        except ValueError:
            freno = True
        caso("con --con-pobreza y sin armado en pobreza/dist, frena sin tocar sitio/pobreza", freno and huella(destino) == antes)

        consultor_pobreza.copiar(dist, destino, True)
        caso("con --con-pobreza, sitio/pobreza queda igual a pobreza/dist", huella(destino) == huella(dist))

    fuente = (RAIZ / "scripts" / "03_construir_sitio.py").read_text(encoding="utf-8")
    caso("03_construir_sitio.py copia el consultor solo con consultor_pobreza.copiar y la opción --con-pobreza",
         "copytree" not in fuente and re.search(r"consultor_pobreza\.copiar\([^)]*CON_POBREZA\)", fuente) is not None)
    return problemas


if __name__ == "__main__":
    p = correr()
    if p:
        sys.exit("La copia del consultor de pobreza no se comporta como debe:\n" + "\n".join(p))
    print("Copia del consultor de pobreza: un armado normal no toca sitio/pobreza/ y --con-pobreza copia pobreza/dist")
