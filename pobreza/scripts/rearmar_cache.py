"""Rearma la caché de Observable Framework a partir del consultor ya publicado, para poder armarlo sin bajar nada de jsDelivr.

Observable Framework baja de cdn.jsdelivr.net las librerías que usa la página (d3, Plot, Inputs, DuckDB y sus extensiones) y las
guarda en src/.observablehq/cache/, que no se sube al repositorio. En una computadora nueva o en un entorno que no llega a jsDelivr
(las sesiones de Claude Code en la nube), `npm run build` falla. El armado publicado (../sitio/pobreza/) tiene esas mismas
librerías con otro nombre (una huella en lugar de "_esm") y sus imports apuntando a esos nombres: este programa las devuelve a la
forma de la caché. Probado el 13 de octubre de 2026: con la caché rearmada, el armado da los mismos archivos de librerías que el
publicado (mismas huellas).

Uso, desde la carpeta pobreza/:

    python scripts/rearmar_cache.py

y después `npm run build` como siempre. Si la página empieza a usar una librería que el armado publicado no tiene, Framework
la va a querer bajar: eso necesita acceso a jsDelivr.
"""

from __future__ import annotations

import posixpath
import re
import shutil
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
PUBLICADO = RAIZ.parent / "sitio" / "pobreza"
CACHE = RAIZ / "src" / ".observablehq" / "cache"

# nombre de un módulo armado: "<huella>.js" (era "_esm.js"), "<archivo>.js.<huella>.js" (era "<archivo>.js._esm.js") o
# "<archivo>.<huella>.js" (era "<archivo>.js")
CON_HUELLA = re.compile(r"^(?P<nombre>.*?)\.?(?P<huella>[0-9a-f]{8})\.js$")
IMPORT_RELATIVO = re.compile(r"""(["'])(\.\.?/[^"']+?)\1""")


def nombre_en_cache(ruta: str) -> str:
    m = CON_HUELLA.match(posixpath.basename(ruta)) if ruta.endswith(".js") else None
    if not m:
        return ruta
    nombre = m.group("nombre")
    base = "_esm.js" if nombre == "" else nombre + "._esm.js" if nombre.endswith((".js", ".mjs")) else nombre + ".js"
    return posixpath.join(posixpath.dirname(ruta), base)


def main() -> int:
    if not (PUBLICADO / "_npm").is_dir():
        print(f"No está el consultor publicado en {PUBLICADO}")
        return 1
    # ruta en el armado -> ruta en la caché, de todos los archivos de librerías
    mapa = {f.relative_to(PUBLICADO).as_posix(): None for f in (PUBLICADO / "_npm").rglob("*") if f.is_file()}
    mapa = {r: nombre_en_cache(r) for r in mapa}
    for armado, cache in mapa.items():
        destino = CACHE / cache
        destino.parent.mkdir(parents=True, exist_ok=True)
        if not armado.endswith(".js"):
            shutil.copyfile(PUBLICADO / armado, destino)
            continue

        def a_cache(m: re.Match) -> str:
            objetivo = posixpath.normpath(posixpath.join(posixpath.dirname(armado), m.group(2)))
            if objetivo not in mapa:
                return m.group(0)
            rel = posixpath.relpath(mapa[objetivo], posixpath.dirname(cache))
            return m.group(1) + (rel if rel.startswith("..") else "./" + rel) + m.group(1)

        destino.write_text(IMPORT_RELATIVO.sub(a_cache, (PUBLICADO / armado).read_text(encoding="utf-8")), encoding="utf-8")
    # extensiones de DuckDB: _duckdb/<nombre>-<huella>/v1.1.1/wasm_x/<nombre>.duckdb_extension.wasm, que en la caché van con la
    # dirección de donde se bajan (extensions.duckdb.org/v1.1.1/wasm_x/...)
    extensiones = list((PUBLICADO / "_duckdb").rglob("*.wasm"))
    for f in extensiones:
        partes = f.relative_to(PUBLICADO / "_duckdb").parts
        destino = CACHE / "_duckdb" / "extensions.duckdb.org" / Path(*partes[1:])
        destino.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(f, destino)
    print(f"Caché rearmada en {CACHE.relative_to(RAIZ)}: {len(mapa)} archivos de librerías y {len(extensiones)} extensiones de DuckDB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
