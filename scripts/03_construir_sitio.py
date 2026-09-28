"""
Paso 3. Arma la pagina.
Inserta sitio/datos/fichas.json dentro de scripts/plantilla.html y escribe sitio/index.html.
Tambien copia la tabla larga al sitio para que se pueda descargar
y el sitio de consultas de pobreza ya construido.
Uso: python scripts/03_construir_sitio.py
"""
import pathlib, shutil

RAIZ = pathlib.Path(__file__).resolve().parents[1]
datos = (RAIZ / "sitio" / "datos" / "fichas.json").read_text(encoding="utf-8").replace("</", "<\\/")
html = (RAIZ / "scripts" / "plantilla.html").read_text(encoding="utf-8").replace("__DATOS__", datos)
(RAIZ / "sitio" / "index.html").write_text(html, encoding="utf-8")
shutil.copy(RAIZ / "datos" / "ordenado" / "tabla_larga.csv", RAIZ / "sitio" / "datos" / "tabla_larga.csv")
# Sitio de consultas de pobreza (Observable Framework). Se construye aparte con "npm run build" dentro de pobreza/
# y aca solo se copia el resultado a sitio/pobreza/ para publicarlo junto con Datina.
dist = RAIZ / "pobreza" / "dist"
if dist.exists():
    shutil.rmtree(RAIZ / "sitio" / "pobreza", ignore_errors=True)
    shutil.copytree(dist, RAIZ / "sitio" / "pobreza")
print("Listo: sitio/index.html" + (" y sitio/pobreza/" if dist.exists() else ""))
