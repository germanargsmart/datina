"""
Cómo entra el consultor de pobreza al sitio.
El consultor (Observable Framework, carpeta pobreza/) se arma aparte con "npm run build" y queda en pobreza/dist, que git no guarda.
Lo que se publica es su copia en sitio/pobreza/, que sí está en el repositorio.
Hasta el 22 de octubre de 2026, 03_construir_sitio.py copiaba pobreza/dist cada vez que la carpeta existía, y una dist vieja en la
computadora del autor (del 28 de septiembre) habría reemplazado el consultor publicado sin avisar (plan de estabilización, P1-3).
Desde entonces la copia se pide a propósito: python scripts/03_construir_sitio.py --con-pobreza. Lo prueba scripts/prueba_pobreza.py.
"""
import datetime, shutil


def hay_armado(dist):
    """Si pobreza/dist tiene un armado del consultor (al menos su index.html)."""
    return (dist / "index.html").is_file()


def fecha(carpeta):
    """Día y hora del archivo más nuevo de la carpeta, para que se vea de cuándo es el armado."""
    ultimo = max((p.stat().st_mtime for p in carpeta.rglob("*") if p.is_file()), default=carpeta.stat().st_mtime)
    return datetime.datetime.fromtimestamp(ultimo).strftime("%d/%m/%Y %H:%M")


def copiar(dist, destino, pedido):
    """Copia dist a destino solo si se pidió (--con-pobreza). Devuelve el aviso para mostrar al final del armado, o None.
    Con el pedido y sin un armado en dist, frena con ValueError sin tocar destino."""
    if not pedido:
        if dist.is_dir():
            return (f"Aviso: pobreza/dist (armado el {fecha(dist)}) no se copió y sitio/pobreza/ quedó como estaba. "
                    "Para publicar ese armado: python scripts/03_construir_sitio.py --con-pobreza")
        return None
    if not hay_armado(dist):
        raise ValueError("--con-pobreza: no hay un armado del consultor en pobreza/dist (falta index.html). "
                         "Armarlo antes con npm run build dentro de pobreza/ (ver pobreza/README.md)")
    shutil.rmtree(destino, ignore_errors=True)
    shutil.copytree(dist, destino)
    return f"Consultor de pobreza: se copió pobreza/dist (armado el {fecha(dist)}) a sitio/pobreza/"
