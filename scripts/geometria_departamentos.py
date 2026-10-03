"""
Geometria de los 529 departamentos (Georef, IGN) simplificada para el mapa del sitio.
Se corre una sola vez: los limites no cambian. Requiere Node.js (usa mapshaper con npx).
Uso: python scripts/geometria_departamentos.py
"""
import pathlib, subprocess, tempfile, urllib.request

RAIZ = pathlib.Path(__file__).resolve().parents[1]
SALIDA = RAIZ / "sitio" / "datos" / "departamentos.topo.json"
URL = "https://infra.datos.gob.ar/georef/departamentos.geojson"

with tempfile.TemporaryDirectory() as tmp:
    origen = pathlib.Path(tmp) / "departamentos.geojson"
    req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0 (argentina-en-datos)"})
    origen.write_bytes(urllib.request.urlopen(req, timeout=300).read())
    # se quitan los sectores antartico y de islas del Atlantico Sur (sin datos) y se simplifica conservando la topologia. Antes,
    # snap une los vertices casi iguales y -clean rellena los huecos entre departamentos vecinos: sin eso, al simplificar quedaban
    # huecos blancos entre las comunas de la Ciudad (etapa 19)
    subprocess.run(["npx", "--yes", "mapshaper", str(origen), "snap", "-filter", "!['94021','94028'].includes(id)", "-clean",
                    "-simplify", "8%", "keep-shapes", "-each", "prov=provincia.id", "-filter-fields", "id,nombre,prov",
                    "-o", "format=topojson", "quantization=1e5", str(SALIDA)], check=True, shell=True)
print("listo", SALIDA, SALIDA.stat().st_size, "bytes")
