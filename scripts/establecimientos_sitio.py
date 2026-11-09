"""
Las escuelas y los hospitales de cada provincia, como los lee la página de provincia (fase 2 de docs/roadmap/ESTABLECIMIENTOS.md).

Lee datos/manual/establecimientos/ (lo escribe scripts/establecimientos.py) y escribe sitio/datos/establecimientos/{codigo_indec}.csv:
una tabla por jurisdicción con sus escuelas y sus hospitales, que la página baja cuando la sección aparece en pantalla. La llama
03_construir_sitio.py en cada armado: con los mismos datos de entrada da los mismos archivos.

Columnas (cortas, porque Buenos Aires tiene más de 10.600 filas):
- t: "e" escuela, "h" hospital. id: CUE-anexo o código REFES. nombre, loc (localidad), dom (domicilio).
- dep: el código del departamento en que cuenta (el que declara la fuente, o el corregido a mano).
- cat: escuelas "est", "priv" o "soc" (gestión social o cooperativa). Hospitales "prov", "mun", "nac", "univ" o "mixta".
- niv: escuelas "p" primaria, "s" secundaria, "t" secundaria técnica, juntas ("ps", "pst"...). Hospitales, la tipología del REFES.
- det: hospitales, la complejidad ("Alto riesgo con terapia intensiva"). Escuelas, "r" si es rural.
- lat, lon: vacíos si no se dibuja (sin dato, o sin confirmar en la revisión a mano: decisión 6 del autor).
- u: ubicación. "p" precisa, "m" mejorada con su domicilio, "a" aproximada (el centro de su localidad), "c" sin confirmar, "n" sin dato.
- fk: si el punto cae fuera del departamento en que cuenta, a cuántos km (más de 1 km: menos es el borde de los límites simplificados).
- cor: "p" punto corregido a mano, "d" departamento corregido a mano.
"""
import json
from pathlib import Path

import pandas as pd

RAIZ = Path(__file__).resolve().parents[1]
ORIGEN = RAIZ / "datos" / "manual" / "establecimientos"
DESTINO = RAIZ / "sitio" / "datos" / "establecimientos"
BORDE_KM = 1

SECTOR = {"Estatal": "est", "Privado": "priv", "Social/cooperativa": "soc"}
DEPENDENCIA = {"Provincial": "prov", "Municipal": "mun", "Nacional": "nac", "Universitario público": "univ", "Mixta": "mixta"}
UBICACION = {"precisa": "p", "mejorada": "m", "aproximada": "a", "sin confirmar": "c", "sin dato": "n"}
CORRECCION = {"punto": "p", "departamento": "d", "sin confirmar": ""}
COLUMNAS = ["t", "id", "nombre", "dep", "loc", "dom", "cat", "niv", "det", "lat", "lon", "u", "fk", "cor"]


def _texto(s):
    return s.fillna("").astype(str).str.replace(r"\s+", " ", regex=True).str.strip()


def tablas():
    tipos = {"cueanexo": str, "refes_id": str, "codigo_indec": str, "codigo_dep": str}
    e = pd.read_csv(ORIGEN / "escuelas.csv", dtype=tipos, keep_default_na=False, na_values=[""])
    h = pd.read_csv(ORIGEN / "hospitales.csv", dtype=tipos, keep_default_na=False, na_values=[""])
    for t, mapa, col in ((e, SECTOR, "sector"), (h, DEPENDENCIA, "dependencia")):
        if not set(t[col]) <= set(mapa):
            raise SystemExit(f"establecimientos_sitio.py: valores nuevos en {col}: {sorted(set(t[col]) - set(mapa))}")
    for t in (e, h):
        if not set(t.ubicacion) <= set(UBICACION):
            raise SystemExit(f"establecimientos_sitio.py: ubicaciones nuevas: {sorted(set(t.ubicacion) - set(UBICACION))}")
    niv = (e.primaria.map({1: "p", 0: ""}) + e.secundaria.map({1: "s", 0: ""}) + e.tecnica.map({1: "t", 0: ""}))
    se = pd.DataFrame({"t": "e", "id": e.cueanexo, "nombre": _texto(e.nombre), "dep": e.codigo_dep, "loc": _texto(e.localidad),
                       "dom": _texto(e.domicilio), "cat": e.sector.map(SECTOR), "niv": niv, "det": (e.ambito == "Rural").map({True: "r", False: ""}),
                       "lat": e.lat, "lon": e.lon, "u": e.ubicacion.map(UBICACION), "fk": e.fuera_km, "cor": e.correccion,
                       "prov": e.codigo_indec})
    sh = pd.DataFrame({"t": "h", "id": h.refes_id, "nombre": _texto(h.nombre), "dep": h.codigo_dep, "loc": _texto(h.localidad),
                       "dom": _texto(h.domicilio), "cat": h.dependencia.map(DEPENDENCIA), "niv": h.tipologia, "det": _texto(h.complejidad),
                       "lat": h.lat, "lon": h.lon, "u": h.ubicacion.map(UBICACION), "fk": h.fuera_km, "cor": h.correccion,
                       "prov": h.codigo_indec})
    t = pd.concat([se, sh], ignore_index=True)
    t["cor"] = t.cor.fillna("").map(CORRECCION)
    sin_punto = t.u.isin(["c", "n"])
    t.loc[sin_punto, ["lat", "lon"]] = None
    t["fk"] = t.fk.where((t.fk > BORDE_KM) & ~sin_punto)
    for c in ("lat", "lon"):
        t[c] = t[c].round(5)
    t["fk"] = t.fk.round(0).astype("Int64")
    return t.sort_values(["prov", "t", "id"])


def fechas():
    """Las fechas de las fuentes para los textos de la página (van al resumen: ningún año se escribe a mano)."""
    c = json.loads((ORIGEN / "control.json").read_text(encoding="utf-8"))["fuentes"]
    return {"padron": c["padron"]["actualizado"], "refes": c["refes"]["actualizado"]}


def publicar():
    t = tablas()
    DESTINO.mkdir(parents=True, exist_ok=True)
    escritos = set()
    for prov, g in t.groupby("prov"):
        ruta = DESTINO / f"{prov}.csv"
        texto = g[COLUMNAS].to_csv(index=False, lineterminator="\n")
        if not ruta.exists() or ruta.read_bytes() != texto.encode("utf-8"):
            ruta.write_bytes(texto.encode("utf-8"))
        escritos.add(ruta.name)
    for vieja in DESTINO.glob("*.csv"):  # una jurisdicción que ya no está no deja su archivo viejo
        if vieja.name not in escritos:
            vieja.unlink()
    resumen = {"por_provincia": {p: {"escuelas": int((g.t == "e").sum()), "hospitales": int((g.t == "h").sum())} for p, g in t.groupby("prov")},
               **fechas()}
    return resumen


if __name__ == "__main__":
    print(json.dumps(publicar(), ensure_ascii=False)[:500])
