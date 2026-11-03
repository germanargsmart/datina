"""
Catálogo API-INDEC (https://api.indec.gob.ar, pedido del autor del 2 de noviembre de 2026): tablas del INDEC por una API, en JSON.
Pide una cuenta gratuita y un token, que el autor guarda como secreto INDEC_API_TOKEN, en GitHub y en su computadora (docs/deploy/INDEC_API.md).
El token vence a los 12 meses. Sin token no se baja nada y quedan los archivos anteriores: la actualización mensual sigue igual.

Cada tabla se pide de a 1000 filas (el máximo de la API), ordenada por su clave completa, que es lo que pide la documentación para que las
páginas no repitan ni salteen filas, y lo recibido se compara con el total que informa la API (Content-Range). Se guarda tal como la publica
el INDEC: la lista de filas en datos/crudo/indec_api_<tabla>.json. 02_procesar.py todavía no las lee: primero se comparan con lo que ya baja
01_descargar.py de los archivos del INDEC.
"""
import json, os, re, time, urllib.error, urllib.request

BASE = "https://api.indec.gob.ar/v1/"
POR_PAGINA = 1000
ESPERA = 5  # segundos antes del primer reintento, que se duplican en cada uno

# las tablas que se bajan y su clave completa, como la declara la documentación de cada una (https://api.indec.gob.ar/docs, parámetro
# order). Las cinco primeras traen datos que el sitio no tiene: la población por departamento, la canasta de crianza y la producción
# industrial y minera. La de población por jurisdicción es la misma fuente que el módulo de población (POB), para compararla
TABLAS = {
    "estimaciones_poblacion_departamento_2022_2035": "departamento_cod,sexo_cod,fecha",
    "canasta-crianza": "Periodo",
    "ipi_manufacturero": "periodo,indicador,cuadro_web,codigo_CLaNAE_2004,descripcion,serie,tipo_de_indicador",
    "ipi_minero": "periodo,anio,mes,indicador,cuadro_web,codigo_ClaNAE_2010,codigo_CPC_2_1,serie,descripcion,tipo_de_indicador,unidad_de_medida",
    "proyecciones_poblacion_jurisdiccion_2022_2040": "jurisdiccion_cod,sexo_cod,edad_cod,fecha",
}


class SinToken(Exception):
    """Falta el token o la API no lo aceptó: no tiene sentido probar las demás tablas"""


def archivo(tabla):
    return f"indec_api_{tabla.replace('-', '_')}.json"


def token():
    t = os.environ.get("INDEC_API_TOKEN", "").strip()
    if not t:
        raise SinToken("falta el token de la API del INDEC (INDEC_API_TOKEN): quedan los archivos anteriores. Cómo sacarlo: docs/deploy/INDEC_API.md")
    return t


def _pedir(url, tok, intentos=4):
    """Una página. Si la API dice que se le pidió demasiado (429) o falla el servidor (5xx), espera y reintenta, cada vez el doble"""
    for i in range(intentos):
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {tok}", "Prefer": "count=exact", "Accept": "application/json",
                                                   "User-Agent": "Mozilla/5.0 (argentina-en-datos)"})
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.loads(r.read().decode("utf-8")), r.headers.get("Content-Range", "")
        except urllib.error.HTTPError as e:
            if e.code == 401:
                raise SinToken("la API del INDEC no aceptó el token (INDEC_API_TOKEN): puede estar vencido, dura 12 meses. Se genera otro en "
                               "\"Gestionar la cuenta\" de api.indec.gob.ar") from None
            if (e.code == 429 or e.code >= 500) and i < intentos - 1:
                time.sleep(float(e.headers.get("Retry-After") or ESPERA * 2 ** i))
                continue
            raise ValueError(f"la API del INDEC contestó {e.code}: {e.read().decode('utf-8', 'replace')[:300]}") from None


def bajar_tabla(tabla, tok, base=BASE):
    """Todas las filas de una tabla, página por página, con el total controlado"""
    filas, total = [], None
    while True:
        lote, rango = _pedir(f"{base}{tabla}?order={TABLAS[tabla]}&limit={POR_PAGINA}&offset={len(filas)}", tok)
        if not isinstance(lote, list):
            raise ValueError("la API no devolvió una lista de filas")
        m = re.search(r"/(\d+)$", rango)
        if m:
            total = int(m.group(1))
        filas += lote
        if len(lote) < POR_PAGINA or (total is not None and len(filas) >= total):
            break
    if not filas:
        raise ValueError("la API no devolvió filas")
    if total is not None and len(filas) != total:
        raise ValueError(f"la API informó {total} filas y llegaron {len(filas)}")
    return filas


def bajar(destino, tablas=None, base=BASE):
    """Baja las tablas a destino (datos/crudo). Una que falla no frena a las demás: queda su archivo anterior y el error se informa al final"""
    tok = token()
    hechas, errores = [], []
    for tabla in tablas or TABLAS:
        try:
            filas = bajar_tabla(tabla, tok, base)
        except SinToken:
            raise
        except Exception as e:
            errores.append(f"{tabla}: {e}")
            continue
        with open(destino / archivo(tabla), "w", encoding="utf-8", newline="\n") as f:
            json.dump(filas, f, ensure_ascii=False)
        hechas.append(f"{tabla} ({len(filas)} filas)")
    if errores:
        raise ValueError(" | ".join(errores) + (f" (sí se bajaron: {', '.join(hechas)})" if hechas else ""))
    return "api.indec.gob.ar (" + ", ".join(hechas) + ")"
