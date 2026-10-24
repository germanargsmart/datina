"""
Respaldo de sitio/ mientras arma 03_construir_sitio.py (plan de estabilización, P2-3).
Si el armado frena a mitad de camino (una comprobación de las del final o un error), sitio/ vuelve a quedar como estaba antes de empezar.
Antes quedaba armado a medias y se podía subir así. 03 llama a guardar() antes de escribir nada y a terminado() después de la última
comprobación: si el programa termina sin llegar a terminado(), la copia se repone sola al salir.
Sola corre su prueba en una carpeta temporal: python scripts/respaldo_sitio.py
"""
import atexit, contextlib, io, pathlib, shutil, sys, tempfile

_estado = {}


def guardar(sitio):
    sitio = pathlib.Path(sitio)
    copia = pathlib.Path(tempfile.mkdtemp(prefix="datina-sitio-"))
    shutil.copytree(sitio, copia / "sitio")
    _estado.update(sitio=sitio, copia=copia, listo=False)
    atexit.register(al_salir)


def terminado():
    _estado["listo"] = True


def al_salir():
    if not _estado:
        return
    sitio, copia = _estado["sitio"], _estado["copia"]
    if not _estado["listo"]:
        for p in sitio.iterdir():
            shutil.rmtree(p) if p.is_dir() else p.unlink()
        shutil.copytree(copia / "sitio", sitio, dirs_exist_ok=True)
        print("El armado no terminó: sitio/ volvió a quedar como estaba antes de empezar.", file=sys.stderr)
    shutil.rmtree(copia, ignore_errors=True)
    _estado.clear()


if __name__ == "__main__":
    # un archivo cambiado vuelve a su versión, uno nuevo se borra, uno borrado vuelve, y con terminado() no se repone nada
    with tempfile.TemporaryDirectory() as t:
        s = pathlib.Path(t) / "sitio"
        (s / "datos").mkdir(parents=True)
        (s / "index.html").write_text("antes")
        (s / "datos" / "a.csv").write_text("a")
        guardar(s)
        (s / "index.html").write_text("a medias")
        (s / "datos" / "a.csv").unlink()
        (s / "datos" / "nuevo.json").write_text("{}")
        with contextlib.redirect_stderr(io.StringIO()):  # el aviso de "no terminó" es parte de la prueba: no se muestra
            al_salir()
        bien1 = (s / "index.html").read_text() == "antes" and (s / "datos" / "a.csv").exists() and not (s / "datos" / "nuevo.json").exists()
        guardar(s)
        (s / "index.html").write_text("armado")
        terminado()
        al_salir()
        bien2 = (s / "index.html").read_text() == "armado"
    print("Respaldo de sitio/: " + ("bien" if bien1 and bien2 else f"MAL (repone {bien1}, respeta el armado terminado {bien2})"))
    sys.exit(0 if bien1 and bien2 else 1)
