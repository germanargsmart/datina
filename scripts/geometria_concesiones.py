"""
Geometria de las areas de concesion de explotacion de hidrocarburos (Secretaria de Energia) simplificada para el mapa de pozos
no convencionales de Energia (etapa 19). Se corre una sola vez, o cuando cambien las areas: requiere Node.js (usa mapshaper con npx).
Guarda solo el codigo SESCO y el nombre de cada area: la empresa y la produccion salen de la produccion por area, que se actualiza
cada mes.
Uso: python scripts/geometria_concesiones.py
"""
import io, json, pathlib, subprocess, tempfile, urllib.request, zipfile

RAIZ = pathlib.Path(__file__).resolve().parents[1]
SALIDA = RAIZ / "sitio" / "datos" / "concesiones.topo.json"
UA = {"User-Agent": "Mozilla/5.0 (argentina-en-datos)"}
CATALOGO = "http://datos.energia.gob.ar/api/3/action/package_show?id=produccion-hidrocarburos-concesiones-de-explotacion"

recursos = json.loads(urllib.request.urlopen(urllib.request.Request(CATALOGO, headers=UA), timeout=120).read())["result"]["resources"]
url = next(x["url"] for x in recursos if (x.get("format") or "").upper() == "SHP").replace("https://", "http://")
zona = zipfile.ZipFile(io.BytesIO(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=300).read()))
with tempfile.TemporaryDirectory() as tmp:
    for n in zona.namelist():  # los nombres vienen con caracteres raros: se guardan con uno simple, igual extension
        (pathlib.Path(tmp) / ("concesiones." + n.rsplit(".", 1)[-1])).write_bytes(zona.read(n))
    origen = pathlib.Path(tmp) / "concesiones.shp"
    subprocess.run(["npx", "--yes", "mapshaper", str(origen), "-simplify", "10%", "keep-shapes",
                    "-filter-fields", "CODIGO_DE_,NOMBRE_DE_", "-rename-fields", "codigo=CODIGO_DE_,nombre=NOMBRE_DE_",
                    "-rename-layers", "concesiones", "-o", "format=topojson", "quantization=1e5", str(SALIDA)], check=True, shell=True)
print("listo", SALIDA, SALIDA.stat().st_size, "bytes")
