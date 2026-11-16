"""
Sirve sitio/ en la computadora como lo sirve Cloudflare Pages: /trabajo abre trabajo.html.

Desde el 16 de noviembre de 2026 (decisión del autor) los enlaces del sitio van sin el .html, y `python -m http.server` no los
entiende. Uso, desde la raíz del repositorio:

    python scripts/servir.py          (en http://localhost:8765)
    python scripts/servir.py 8000     (en otro puerto)
"""
import functools
import http.server
import pathlib
import sys

SITIO = pathlib.Path(__file__).resolve().parent.parent / "sitio"


class Manejador(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        ruta = super().translate_path(path)
        p = pathlib.Path(ruta)
        # una dirección sin extensión que no es una carpeta: la página con su .html, si existe
        if not p.suffix and not p.is_dir() and p.with_name(p.name + ".html").is_file():
            return str(p.with_name(p.name + ".html"))
        return ruta


if __name__ == "__main__":
    puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    servidor = http.server.ThreadingHTTPServer(("", puerto), functools.partial(Manejador, directory=str(SITIO)))
    print(f"Datina en http://localhost:{puerto}/ (Ctrl+C para cortar)")
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        pass
