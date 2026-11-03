"""
Prueba de la descarga de la API del INDEC (scripts/indec_api.py, 2 de noviembre de 2026), sin red ni token: una API simulada en la
computadora contesta como la de verdad (páginas de 1000 filas, Content-Range, 401 con un token malo, 429 y 500). Uso: python scripts/prueba_indec_api.py
"""
import json, os, pathlib, sys, tempfile, threading, urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import indec_api as api

api.ESPERA = 0.01
TOKEN = "token-de-prueba"
FILAS = {"canasta-crianza": [{"Periodo": f"2026{m:02d}", "n": i} for i, m in enumerate(range(1, 13))],
         "ipi_minero": [{"periodo": str(i), "valor": i} for i in range(2500)]}
estado = {"pedidos": [], "falla": {}, "total_mal": False}


class Simulada(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def do_GET(self):
        u = urllib.parse.urlparse(self.path)
        tabla, q = u.path.rsplit("/", 1)[-1], dict(urllib.parse.parse_qsl(u.query))
        estado["pedidos"].append((tabla, q, self.headers.get("Prefer")))
        if self.headers.get("Authorization") != f"Bearer {TOKEN}":
            return self.responder(401, {"code": "42501", "message": "permission denied for schema api"})
        if estado["falla"].get(tabla):
            codigo = estado["falla"][tabla].pop(0)
            return self.responder(codigo, {"message": "simulado"})
        if tabla not in FILAS:
            return self.responder(404, {"message": "no existe"})
        if q.get("order") != api.TABLAS[tabla]:
            return self.responder(400, {"message": "sin la clave completa"})
        todas, desde, cuantas = FILAS[tabla], int(q["offset"]), min(int(q["limit"]), 1000)
        lote, total = todas[desde:desde + cuantas], len(todas) + (5 if estado["total_mal"] else 0)
        self.responder(206 if desde + len(lote) < total else 200, lote, f"{desde}-{desde + len(lote) - 1}/{total}")

    def responder(self, codigo, cuerpo, rango=None):
        b = json.dumps(cuerpo).encode()
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json")
        if rango:
            self.send_header("Content-Range", rango)
        self.end_headers()
        self.wfile.write(b)


srv = ThreadingHTTPServer(("127.0.0.1", 0), Simulada)
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f"http://127.0.0.1:{srv.server_address[1]}/v1/"
fallas = 0


def ver(ok, texto):
    global fallas
    print(("bien  " if ok else "FALLA ") + texto)
    fallas += not ok


def error_de(f):
    try:
        f()
    except Exception as e:
        return e
    return None


# sin token no se pide nada
os.environ.pop("INDEC_API_TOKEN", None)
e = error_de(lambda: api.bajar(pathlib.Path("."), base=BASE))
ver(isinstance(e, api.SinToken) and "INDEC_API_TOKEN" in str(e) and not estado["pedidos"], "sin token avisa y no pide nada")

# con un token que la API no acepta
e = error_de(lambda: api.bajar_tabla("canasta-crianza", "otro", BASE))
ver(isinstance(e, api.SinToken) and "vencido" in str(e), "con un token rechazado (401) dice que puede estar vencido")

# una tabla de tres páginas
estado["pedidos"].clear()
filas = api.bajar_tabla("ipi_minero", TOKEN, BASE)
ver(len(filas) == 2500 and filas[-1]["valor"] == 2499, f"junta las tres páginas: {len(filas)} filas")
ver([q["offset"] for _, q, _ in estado["pedidos"]] == ["0", "1000", "2000"], "pide de a 1000 filas, con offset")
ver(all(q["order"] == api.TABLAS["ipi_minero"] and p == "count=exact" for _, q, p in estado["pedidos"]), "ordena por la clave completa y pide el total")

# el total no coincide
estado["total_mal"] = True
e = error_de(lambda: api.bajar_tabla("canasta-crianza", TOKEN, BASE))
ver(isinstance(e, ValueError) and "informó 17 filas y llegaron 12" in str(e), f"si faltan filas, falla: {e}")
estado["total_mal"] = False

# demasiados pedidos (429) y una falla del servidor: reintenta
estado["falla"]["canasta-crianza"] = [429, 503]
filas = api.bajar_tabla("canasta-crianza", TOKEN, BASE)
ver(len(filas) == 12 and not estado["falla"]["canasta-crianza"], "con 429 y 503 espera y reintenta")
estado["falla"]["canasta-crianza"] = [400]
e = error_de(lambda: api.bajar_tabla("canasta-crianza", TOKEN, BASE))
ver(isinstance(e, ValueError) and "400" in str(e), "un 400 no se reintenta: falla con el código")

# todo junto: guarda las que salen y conserva el archivo anterior de la que falla
os.environ["INDEC_API_TOKEN"] = TOKEN
with tempfile.TemporaryDirectory() as d:
    d = pathlib.Path(d)
    (d / api.archivo("ipi_manufacturero")).write_text("anterior", encoding="utf-8")
    e = error_de(lambda: api.bajar(d, ["canasta-crianza", "ipi_manufacturero"], BASE))
    guardada = json.loads((d / "indec_api_canasta_crianza.json").read_text(encoding="utf-8"))
    ver(len(guardada) == 12 and guardada[0]["Periodo"] == "202601", "guarda la tabla tal como llega, con el guion pasado a guion bajo")
    ver((d / api.archivo("ipi_manufacturero")).read_text(encoding="utf-8") == "anterior", "la que falla conserva su archivo anterior")
    ver(isinstance(e, ValueError) and "ipi_manufacturero" in str(e) and "sí se bajaron: canasta-crianza (12 filas)" in str(e),
        "y el error dice cuál falló y cuáles sí se bajaron")
    origen = api.bajar(d, ["canasta-crianza"], BASE)
    ver(origen == "api.indec.gob.ar (canasta-crianza (12 filas))", f"si todo sale, dice qué bajó: {origen}")
    ver(b"\r\n" not in (d / "indec_api_canasta_crianza.json").read_bytes(), "escribe con finales de línea LF")

srv.shutdown()
print("Todo bien" if not fallas else f"{fallas} fallas")
sys.exit(1 if fallas else 0)
