"""
Escuelas y hospitales de cada provincia (pedido del autor del 9 de noviembre de 2026). Fase 1 de docs/roadmap/ESTABLECIMIENTOS.md:
los datos y su control de calidad. No toca el sitio.

Baja tres fuentes oficiales y se queda con lo que va al mapa:
- Padrón Oficial de Establecimientos Educativos (DIEE, CC BY 4.0): una fila por localización (CUE-anexo), sin coordenadas.
- Mapa Educativo Nacional (servicio WFS de la DIEE): el punto de cada CUE-anexo, con su precisión (PRECISA o APROXIMADA).
- REFES georreferenciado (Ministerio de Salud, CC BY 4.0, se regenera todos los días): los establecimientos de salud con su dependencia.
Y los límites de los departamentos de Georef (IGN) para controlar que cada punto caiga en el departamento que declara.

Qué entra (decisiones del autor del 9 de noviembre de 2026):
- Escuelas: educación común con primaria o con secundaria (la técnica del INET va con la secundaria). Estatales, privadas y de gestión social
  o cooperativa, cada una con su sector. Especial y adultos, no.
- Hospitales: públicos (nacionales, provinciales, municipales, universitarios y mixtos) con internación (tipologías ESCI), sin las residencias
  (ESCIRES). El REFES llama "Municipal" a los hospitales de la Ciudad de Buenos Aires.
- Las escuelas con ubicación APROXIMADA se mandan a la API Georef con el domicilio limpio. El punto nuevo se acepta solo si trae número de
  calle (o esquina), cae en el departamento que declara la escuela y queda a menos de MAX_KM del punto aproximado.
- Teléfono, correo y CUIT no se guardan.

Qué escribe (en LF, ordenado, así correrlo dos veces con las mismas fuentes da los mismos archivos):
- datos/manual/establecimientos/escuelas.csv
- datos/manual/establecimientos/hospitales.csv
- datos/manual/establecimientos/control.json: la fecha de cada fuente, los totales por provincia y los controles. scripts/prueba_establecimientos.py
  compara contra él lo escrito.
Y lee datos/manual/establecimientos/correcciones.csv: la revisión a mano de los peores puntos fuera de su departamento (ver "correcciones a mano").

Uso: python scripts/establecimientos.py [--cache CARPETA] [--sin-georef]
--cache: dónde guardar y buscar los archivos bajados, fuera del repositorio (unos 40 MB). Lo que ya está no se vuelve a bajar.
--sin-georef: no consulta Georef (las aproximadas quedan como están).
Se corre a mano cuando sale un padrón nuevo (una o dos veces por año). No entra en la actualización mensual.
"""
import argparse
import datetime as dt
import json
import math
import re
import sys
import tempfile
import time
import unicodedata
import urllib.request
import zipfile
from pathlib import Path

import numpy as np
import pandas as pd

RAIZ = Path(__file__).resolve().parents[1]
SALIDA = RAIZ / "datos" / "manual" / "establecimientos"
UA = {"User-Agent": "Mozilla/5.0 (datina)"}

CKAN_PADRON = "https://datos.gob.ar/api/3/action/package_show?id=padron-oficial-de-establecimientos-educativos"
PADRON_URL = "https://www.argentina.gob.ar/sites/default/files/2026.06.16_padron_oficial_establecimientos_educativos_die_icse.xlsx"
MAPA_URL = ("https://mapa.educacion.gob.ar/geoserver/ows?service=WFS&version=2.0.0&request=GetFeature"
            "&typeNames=publico:establecimiento_educativo&outputFormat=csv")
REFES_URL = "https://sisa.msal.gov.ar/datos/descargas/georef/files/refes_georef.zip"
DEPTOS_URL = "https://infra.datos.gob.ar/georef/departamentos.geojson"
GEOREF_URL = "https://apis.datos.gob.ar/georef/api/direcciones"

MAX_KM = 10          # un punto de Georef más lejos que esto del punto aproximado (el centro de la localidad) se descarta
BORDE_KM = 1         # los límites de Georef están simplificados: a menos de esto del departamento cuenta como borde, no como error
LOTE_GEOREF = 1000   # el máximo de Georef por pedido (probado el 9 de noviembre de 2026: con 1001 contesta error 1008)

SECTORES = {"Estatal", "Privado", "Social/cooperativa"}
DEP_PUBLICAS = {"Nacional", "Provincial", "Municipal", "Universitario público", "Mixta"}
DEP_OTRAS = {"Privado", "Seguridad Social", "Otros", "FFAA/Seguridad", "Servicio Penitenciario Provincial", "Mutual",
             "Servicio Penitenciario Federal", "Universitario privado"}
HOSPITAL = {"ESCIG", "ESCIE", "ESCIEM", "ESCIEP", "ESCIESM", "ESCIETE"}   # con internación: general y especializados
RESIDENCIA = {"ESCIRES"}                                                 # residencias de personas mayores y con apoyos: no son hospitales
# una caja que contiene a la Argentina continental, Tierra del Fuego y la Base Esperanza (la Escuela Provincial Nº 38, a -63,4)
CAJA = {"lat": (-64.0, -21.5), "lon": (-74.0, -53.5)}


def frenar(msg):
    raise SystemExit("establecimientos.py: " + msg)


# ---------------------------------------------------------------- descargas

def bajar(url, destino, intentos=3):
    if destino.exists() and destino.stat().st_size > 0:
        print("  ya estaba:", destino.name)
        return destino
    for i in range(intentos):
        try:
            print("  bajando", url[:110])
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=600) as r:
                destino.write_bytes(r.read())
            return destino
        except Exception as e:  # noqa: BLE001
            if i == intentos - 1:
                frenar(f"no se pudo bajar {url}: {e}")
            time.sleep(5 * (i + 1))


def url_padron():
    """El padrón más nuevo del catálogo (el nombre del archivo cambia con la fecha). Si datos.gob.ar no contesta, el último conocido."""
    try:
        with urllib.request.urlopen(urllib.request.Request(CKAN_PADRON, headers=UA), timeout=60) as r:
            recursos = json.load(r)["result"]["resources"]
        fechadas = [(m.group(1), x["url"]) for x in recursos if (m := re.search(r"(\d{4}\.\d{2}\.\d{2})_padron", x["url"]))]
        if fechadas:
            return max(fechadas)[1]
    except Exception as e:  # noqa: BLE001
        print("  datos.gob.ar no contestó, se usa el último padrón conocido:", e)
    return PADRON_URL


# ---------------------------------------------------------------- padrón de escuelas

def leer_padron(ruta):
    """Las escuelas comunes con primaria o secundaria. El encabezado ocupa dos filas: arriba el bloque ("Común", "Especial", "Adultos"...),
    abajo el nombre, que se repite en cada bloque ("Primario"). Se buscan por contenido, no por posición."""
    crudo = pd.read_excel(ruta, sheet_name=0, header=None, dtype=str)
    fecha = None
    for v in crudo.iloc[:15, 0].dropna():
        if m := re.search(r"actualizaci[oó]n:\s*(\d{2})/(\d{2})/(\d{4})", str(v)):
            fecha = f"{m.group(3)}-{m.group(2)}-{m.group(1)}"
    fila = next((i for i in range(40) if (crudo.iloc[i].astype(str).str.strip() == "Cueanexo").any()), None)
    if fila is None or fecha is None:
        frenar("el padrón no tiene la fila 'Cueanexo' o la fecha de actualización: cambió su forma")
    bloque = crudo.iloc[fila - 1].ffill().fillna("Establecimiento - Localización").astype(str).str.strip()
    nombre = crudo.iloc[fila].astype(str).str.strip()
    cols = [f"{b}|{n}" for b, n in zip(bloque, nombre)]
    d = crudo.iloc[fila + 1:].copy()
    d.columns = cols
    d = d.dropna(how="all")
    base = {c.split("|")[1]: c for c in cols if c.startswith("Establecimiento - Localización|")}
    pedidas = ["Jurisdicción", "Sector", "Ámbito", "Departamento", "Código de departamento", "Localidad", "Cueanexo", "Nombre", "Domicilio"]
    nivel = {"primaria": "Común|Primario", "secundaria": "Común|Secundario", "tecnica": "Común|Secundario - INET"}
    faltan = [c for c in pedidas if c not in base] + [c for c in nivel.values() if c not in cols]
    if faltan:
        frenar(f"al padrón le faltan columnas: {faltan}")
    if len(set(cols) & set(nivel.values())) != 3 or cols.count("Común|Primario") != 1:
        frenar("el padrón tiene columnas de nivel repetidas")
    def tiene(c):  # el padrón marca cada oferta con un 1 y deja vacío lo demás
        return d[c].fillna("").astype(str).str.strip() == "1"

    e = pd.DataFrame({
        "cueanexo": d[base["Cueanexo"]].astype(str).str.strip(),
        "nombre": d[base["Nombre"]].fillna("").astype(str).str.strip(),
        "codigo_dep": d[base["Código de departamento"]].astype(str).str.strip().str.zfill(5),
        "departamento": d[base["Departamento"]].fillna("").astype(str).str.strip(),
        "localidad": d[base["Localidad"]].fillna("").astype(str).str.strip(),
        "sector": d[base["Sector"]].astype(str).str.strip(),
        "ambito": d[base["Ámbito"]].fillna("").astype(str).str.strip(),
        "primaria": tiene(nivel["primaria"]).astype(int),
        "secundaria": (tiene(nivel["secundaria"]) | tiene(nivel["tecnica"])).astype(int),
        "tecnica": tiene(nivel["tecnica"]).astype(int),
        "domicilio": d[base["Domicilio"]].fillna("").astype(str).map(lambda s: re.sub(r"\s+", " ", s).strip()),
    })
    otros = {v for c in nivel.values() for v in d[c].dropna().astype(str).str.strip().unique()} - {"1"}
    if otros:
        frenar(f"valores inesperados en las columnas de nivel: {sorted(otros)[:5]}")
    if not set(e.sector) <= SECTORES:
        frenar(f"sectores nuevos en el padrón: {sorted(set(e.sector) - SECTORES)}")
    if e.cueanexo.duplicated().any():
        frenar(f"CUE-anexo repetidos en el padrón: {e.cueanexo[e.cueanexo.duplicated()].head().tolist()}")
    total = len(e)
    e = e[(e.primaria == 1) | (e.secundaria == 1)].copy()
    e["codigo_indec"] = e.codigo_dep.str[:2]
    return e, {"fecha": fecha, "filas": total}


# ---------------------------------------------------------------- Mapa Educativo Nacional

def leer_mapa(ruta):
    """Un punto por CUE-anexo. El CSV del WFS 2.0 escribe POINT (latitud longitud), al revés que el GeoJSON: si el orden cambia, frena."""
    m = pd.read_csv(ruta, dtype=str)
    xy = m["the_geom"].str.extract(r"POINT \(([-\d.]+) ([-\d.]+)\)").astype(float)
    m["lat"], m["lon"] = xy[0], xy[1]
    ok = m.lat.between(*CAJA["lat"]) & m.lon.between(*CAJA["lon"])
    if ok.mean() < 0.99:
        frenar("los puntos del Mapa Educativo no caen en la Argentina leídos como (latitud longitud): ¿cambió el orden de los ejes?")
    m["pre"] = m["pre"].fillna("").str.strip()
    if not set(m.pre) <= {"PRECISA", "APROXIMADA", ""}:
        frenar(f"precisiones nuevas en el Mapa Educativo: {sorted(set(m.pre))}")
    rep = m[m.cue.duplicated(keep=False)]
    distintos = int((rep.groupby("cue")[["lat", "lon"]].nunique().max(axis=1) > 1).sum())
    m = m.sort_values(["cue", "lat", "lon"]).drop_duplicates("cue")
    return m[["cue", "lat", "lon", "pre"]], {"puntos": int(len(m)), "cue_repetidos": int(rep.cue.nunique()),
                                             "repetidos_con_otro_punto": distintos, "fuera_de_la_argentina": int((~ok).sum())}


# ---------------------------------------------------------------- Georef

def limpiar_domicilio(texto):
    """El domicilio del padrón en una forma que Georef entiende, o None si no tiene número de calle (sin número no mejora nada)."""
    if not isinstance(texto, str):
        return None
    s = unicodedata.normalize("NFC", texto).upper().strip()
    s = re.sub(r"\s+", " ", s)
    if re.search(r"\bS\s*/\s*N\b|\bSIN N", s):
        return None
    s = re.sub(r"\s*\bE\s*/\s*", " ENTRE ", s)
    s = re.sub(r"[\s,]+(BARRIO|B[°º]|BO\.).*$", "", s)        # el barrio pegado al final
    s = re.sub(r"[\s,]+(PISO|DPTO|DEPTO|DTO|LOCAL|OFICINA)\b.*$", "", s)
    if re.search(r"\b(KM|RUTA|RN|RP|PARAJE|CUARTEL|LOTE|MANZANA|MZA?|CASA|CHACRA|QUINTA|SECCI[OÓ]N|COLONIA)\b", s):
        return None                                          # rurales y barrios por manzana: Georef no los ubica por calle
    s = re.sub(r"\bN[°º]\s*|\bNRO\.?\s*|\bN[UÚ]MERO\s*", "", s)
    s = re.sub(r"(\d)\s*[°º]", r"\1", s)
    s = re.sub(r"\bAV(DA)?(\.\s*|\s+)", "AVENIDA ", s)
    s = re.sub(r"\s+", " ", s).strip(" ,.-")
    if " ENTRE " in s:                                       # "PASCO ENTRE SEGUÍ Y YATASTO", "1420 ENTRE 1413 Y 1423": Georef los entiende así
        return s if re.match(r"^.+? ENTRE .+? Y .+$", s) else None
    # el número de la casa es el último número con calle antes, sin contar los de calles como "1 DE MAYO" o "9 DE JULIO"
    numeros = [m for m in re.finditer(r"\b(\d{1,5})\b(?!\s+DE\b)", s) if re.search(r"[A-ZÁÉÍÓÚÑ]", s[:m.start()])]
    if not numeros:
        return None
    m = numeros[-1]
    return f"{s[:m.start()].strip(' ,')} {m.group(1)}"


def km(lat1, lon1, lat2, lon2):
    r = math.pi / 180
    a = math.sin((lat2 - lat1) * r / 2) ** 2 + math.cos(lat1 * r) * math.cos(lat2 * r) * math.sin((lon2 - lon1) * r / 2) ** 2
    return 2 * 6371 * math.asin(min(1, math.sqrt(a)))


def aceptar(resultado, dep, lat0, lon0):
    """El punto de Georef, si sirve: con número de calle o esquina, en el departamento de la escuela y cerca del punto aproximado."""
    if not resultado or not resultado.get("direcciones"):
        return None, "sin resultado"
    d = resultado["direcciones"][0]
    lat, lon = d.get("ubicacion_lat"), d.get("ubicacion_lon")
    if lat is None or lon is None:
        return None, "sin punto"
    if not (d.get("altura_valor") or d.get("calle_cruce_1_id")):
        return None, "sin número de calle"
    if d.get("departamento_id") != dep:
        return None, "otro departamento"
    if km(lat0, lon0, lat, lon) > MAX_KM:
        return None, "lejos"
    return (float(lat), float(lon)), "aceptada"


def pedir_georef(pedidos):
    salida = []
    for i in range(0, len(pedidos), LOTE_GEOREF):
        cuerpo = json.dumps({"direcciones": pedidos[i:i + LOTE_GEOREF]}).encode()
        for intento in range(5):  # Georef contesta 429 si se le pide mucho seguido: se espera cada vez más
            try:
                req = urllib.request.Request(GEOREF_URL, data=cuerpo, headers={**UA, "Content-Type": "application/json"})
                with urllib.request.urlopen(req, timeout=300) as r:
                    salida += json.load(r)["resultados"]
                break
            except Exception as e:  # noqa: BLE001
                if intento == 4:
                    frenar(f"Georef no contestó: {e}")
                time.sleep(30 * (intento + 1))
        time.sleep(1)
    return salida


def mejorar(e):
    """Las escuelas APROXIMADAS con un domicilio que Georef puede ubicar. Devuelve el resumen de lo que pasó con cada una."""
    aprox = e[e.ubicacion == "aproximada"].copy()
    aprox["limpio"] = aprox.domicilio.map(limpiar_domicilio)
    usables = aprox[aprox.limpio.notna()]
    pedidos = [{"direccion": r.limpio, "departamento": r.codigo_dep, "max": 1, "aplanar": True,
                "campos": "ubicacion.lat,ubicacion.lon,altura.valor,calle_cruce_1.id,departamento.id"} for r in usables.itertuples()]
    resultados = pedir_georef(pedidos) if pedidos else []
    cuenta = {"aproximadas": int(len(aprox)), "sin_domicilio_con_numero": int(aprox.limpio.isna().sum()), "consultadas": len(pedidos)}
    for (i, r), res in zip(usables.iterrows(), resultados):
        punto, motivo = aceptar(res, r.codigo_dep, r.lat, r.lon)
        cuenta[motivo] = cuenta.get(motivo, 0) + 1
        if punto:
            e.loc[i, ["lat", "lon"]] = punto
            e.loc[i, "ubicacion"] = "mejorada"
    return cuenta


# ---------------------------------------------------------------- REFES

# El REFES no usa siempre los códigos de departamento del INDEC que usan Georef y el padrón (revisado el 9 de noviembre de 2026):
# en la Ciudad numera las comunas del 1 al 15 (el INDEC, de 7 en 7: la Comuna 1 es 02007 y la 15, 02105), y en Tierra del Fuego y
# Chascomús conserva códigos viejos. Un código que no está en Georef queda en el control ("codigos_de_departamento_desconocidos").
REFES_CODIGOS = {"94007": "94008", "94014": "94015", "06217": "06218"}


def codigo_dep_refes(prov, dep):
    prov, dep = str(prov).strip().zfill(2), str(dep).strip().zfill(3)
    if prov == "02" and dep.isdigit() and 1 <= int(dep) <= 15:
        return f"02{7 * int(dep):03d}"
    return REFES_CODIGOS.get(prov + dep, prov + dep)


def leer_refes(ruta):
    with zipfile.ZipFile(ruta) as z:
        nombre = next(n for n in z.namelist() if n.lower().endswith(".csv"))
        fecha = dt.datetime(*z.getinfo(nombre).date_time).date().isoformat()
        with z.open(nombre) as f:
            r = pd.read_csv(f, dtype=str, encoding="utf-8")
    pedidas = ["ESTABLECIMIENTO_ID", "ESTABLECIMIENTO_NOMBRE", "LOCALIDAD_NOMBRE", "PROVINCIA_ID", "DEPARTAMENTO_ID", "ORIGEN_FINANCIAMIENTO",
               "TIPOLOGIA_SIGLA", "TIPOLOGIA_NOMBRE", "DOMICILIO", "LONGITUD", "LATITUD"]
    if faltan := [c for c in pedidas if c not in r.columns]:
        frenar(f"al REFES le faltan columnas: {faltan}")
    r["ORIGEN_FINANCIAMIENTO"] = r.ORIGEN_FINANCIAMIENTO.fillna("").str.strip()
    r["TIPOLOGIA_SIGLA"] = r.TIPOLOGIA_SIGLA.fillna("").str.strip()
    if nuevas := set(r.ORIGEN_FINANCIAMIENTO) - DEP_PUBLICAS - DEP_OTRAS:
        frenar(f"dependencias nuevas en el REFES (decidir si son públicas): {sorted(nuevas)}")
    if nuevas := {s for s in r.TIPOLOGIA_SIGLA if s.startswith("ESCI")} - HOSPITAL - RESIDENCIA:
        frenar(f"tipologías con internación nuevas en el REFES: {sorted(nuevas)}")
    if r.ESTABLECIMIENTO_ID.duplicated().any():
        frenar("códigos REFES repetidos")
    h = r[r.TIPOLOGIA_SIGLA.isin(HOSPITAL) & r.ORIGEN_FINANCIAMIENTO.isin(DEP_PUBLICAS)].copy()
    num = lambda s: pd.to_numeric(s.fillna("").str.replace(",", ".").str.strip(), errors="coerce")
    h = pd.DataFrame({
        "refes_id": h.ESTABLECIMIENTO_ID.str.strip(),
        "nombre": h.ESTABLECIMIENTO_NOMBRE.fillna("").map(lambda s: re.sub(r"\s+", " ", s).strip()),
        "codigo_indec": h.PROVINCIA_ID.str.strip().str.zfill(2),
        "codigo_dep": [codigo_dep_refes(p, d) for p, d in zip(h.PROVINCIA_ID, h.DEPARTAMENTO_ID)],
        "localidad": h.LOCALIDAD_NOMBRE.fillna("").str.strip(),
        "dependencia": h.ORIGEN_FINANCIAMIENTO,
        "tipologia": h.TIPOLOGIA_SIGLA,
        "complejidad": h.TIPOLOGIA_NOMBRE.fillna("").str.strip(),
        "domicilio": h.DOMICILIO.fillna("").map(lambda s: re.sub(r"\s+", " ", s).strip()),
        "lat": num(h.LATITUD), "lon": num(h.LONGITUD),
    })
    malas = h.lat.notna() & ~(h.lat.between(*CAJA["lat"]) & h.lon.between(*CAJA["lon"]))
    h.loc[malas, ["lat", "lon"]] = np.nan          # fuera del país o con los ejes cambiados: mejor sin punto que en otro lugar
    h["ubicacion"] = np.where(h.lat.notna(), "precisa", "sin dato")
    return h, {"fecha": fecha, "establecimientos": int(len(r)), "coordenadas_descartadas": int(malas.sum())}


# ---------------------------------------------------------------- departamentos

def leer_deptos(ruta):
    """Los anillos de cada departamento de Georef (IGN), como arreglos de numpy, y su nombre."""
    g = json.loads(Path(ruta).read_text(encoding="utf-8"))
    deptos = {}
    for f in g["features"]:
        geo = f["geometry"]
        partes = [geo["coordinates"]] if geo["type"] == "Polygon" else geo["coordinates"]
        anillos = [np.asarray(a, dtype=float) for p in partes for a in p]
        deptos[f["properties"]["id"]] = {"nombre": f["properties"]["nombre"], "anillos": anillos}
    return deptos


def fuera_km(lats, lons, anillos):
    """Para cada punto, NaN si cae dentro del polígono (par e impar sobre todos los anillos: respeta los huecos y las partes) y, si cae
    afuera, la distancia en km al borde más cercano."""
    px, py = np.asarray(lons, float)[:, None], np.asarray(lats, float)[:, None]
    x1 = np.concatenate([a[:-1, 0] for a in anillos])[None, :]
    y1 = np.concatenate([a[:-1, 1] for a in anillos])[None, :]
    x2 = np.concatenate([a[1:, 0] for a in anillos])[None, :]
    y2 = np.concatenate([a[1:, 1] for a in anillos])[None, :]
    with np.errstate(divide="ignore", invalid="ignore"):
        cruza = ((y1 > py) != (y2 > py)) & (px < (x2 - x1) * (py - y1) / (y2 - y1) + x1)
    dentro = cruza.sum(axis=1) % 2 == 1
    # distancia a cada segmento en km, con x achicado por el coseno de la latitud de cada punto
    kx, ky = 111.32 * np.cos(np.radians(py)), 110.57
    ax, ay, bx, by, qx, qy = x1 * kx, y1 * ky, x2 * kx, y2 * ky, px * kx, py * ky
    dx, dy = bx - ax, by - ay
    with np.errstate(divide="ignore", invalid="ignore"):
        t = np.clip(((qx - ax) * dx + (qy - ay) * dy) / (dx * dx + dy * dy), 0, 1)
    t = np.nan_to_num(t)
    dist = np.hypot(ax + t * dx - qx, ay + t * dy - qy).min(axis=1)
    return np.where(dentro, np.nan, dist)


def controlar_deptos(t, deptos):
    """Agrega fuera_km (vacío si el punto cae en su departamento) y devuelve el resumen."""
    t["fuera_km"] = np.nan
    desconocidos = sorted(set(t.codigo_dep) - set(deptos))
    for dep, g in t[t.lat.notna() & t.codigo_dep.isin(deptos)].groupby("codigo_dep"):
        t.loc[g.index, "fuera_km"] = fuera_km(g.lat.values, g.lon.values, deptos[dep]["anillos"])
    t["fuera_km"] = t.fuera_km.round(1).clip(lower=0.1)   # afuera por menos de 50 metros no es "0,0 km": queda en 0,1
    return {"codigos_de_departamento_desconocidos": desconocidos,
            "en_el_borde": int((t.fuera_km <= BORDE_KM).sum()),
            "fuera_de_su_departamento": int((t.fuera_km > BORDE_KM).sum())}


# ---------------------------------------------------------------- correcciones a mano

# Decisión 6 del autor (9 de noviembre de 2026): los peores puntos fuera de su departamento (los hospitales a más de 1 km y las escuelas a
# más de 20 km) se revisaron a mano con Georef, y cada corrección quedó en correcciones.csv con su fuente:
# - "punto": el punto estaba mal y la localidad que declara la fuente está, sola, en su departamento. Va a esa localidad (aproximada) o a su
#   domicilio en la calle (mejorada).
# - "departamento": el punto está bien y el departamento anotado no: un lugar con el nombre del domicilio o de la localidad está donde cae.
# - "sin_confirmar": ninguna fuente oficial confirma el punto ni el departamento. No se dibuja en el mapa, sigue contando en su departamento.
# Una corrección se aplica solo si la fuente sigue diciendo lo mismo que cuando se revisó (el mismo punto, a menos de 100 metros, y el mismo
# departamento). Si la fuente cambió, no se aplica y queda en control.json para volver a revisarla: no frena, porque el REFES cambia todos los días.
CORRECCIONES = SALIDA / "correcciones.csv"
ACCIONES = {"punto": "punto", "departamento": "departamento", "sin_confirmar": "sin confirmar"}
MISMO_PUNTO_KM = 0.1


def leer_correcciones(ruta=CORRECCIONES):
    c = pd.read_csv(ruta, dtype={"id": str, "codigo_dep_origen": str, "codigo_dep": str}, keep_default_na=False, na_values=[""])
    if not set(c.accion) <= set(ACCIONES):
        frenar(f"correcciones.csv: acciones desconocidas {sorted(set(c.accion) - set(ACCIONES))}")
    if c.fuente.isna().any() or c.fecha.isna().any():
        frenar("correcciones.csv: una corrección sin fuente o sin fecha")
    if c.duplicated(["tipo", "id"]).any():
        frenar("correcciones.csv: una corrección repetida")
    p = c[c.accion == "punto"]
    if p[["lat", "lon"]].isna().any().any() or not set(p.precision) <= {"aproximada", "mejorada"}:
        frenar("correcciones.csv: una corrección de punto sin punto o sin precisión")
    d = c[c.accion == "departamento"]
    if not d.codigo_dep.fillna("").str.fullmatch(r"\d{5}").all():
        frenar("correcciones.csv: una corrección de departamento sin código de cinco cifras")
    return c


def aplicar_correcciones(t, c, tipo, clave):
    """Aplica las correcciones de un tipo (escuela u hospital). Agrega correccion y correccion_fuente y devuelve el resumen."""
    t["correccion"] = ""
    t["correccion_fuente"] = ""
    res = {"aplicadas": {}, "no_encontradas": [], "la_fuente_cambio": []}
    fila = dict(zip(t[clave], t.index))
    for r in c[c.tipo == tipo].itertuples():
        if r.id not in fila:
            res["no_encontradas"].append(r.id)
            continue
        i = fila[r.id]
        o = t.loc[i]
        if o.codigo_dep != r.codigo_dep_origen or pd.isna(o.lat) or km(o.lat, o.lon, r.lat_origen, r.lon_origen) > MISMO_PUNTO_KM:
            res["la_fuente_cambio"].append(r.id)
            continue
        if r.accion == "punto":
            t.loc[i, ["lat", "lon"]] = [r.lat, r.lon]
            t.loc[i, "ubicacion"] = r.precision
        elif r.accion == "departamento":
            t.loc[i, "codigo_dep"] = r.codigo_dep
        else:
            t.loc[i, "ubicacion"] = "sin confirmar"
        t.loc[i, ["correccion", "correccion_fuente"]] = [ACCIONES[r.accion], r.fuente]
        res["aplicadas"][r.accion] = res["aplicadas"].get(r.accion, 0) + 1
    for k in ("no_encontradas", "la_fuente_cambio"):
        if res[k]:
            print(f"   AVISO: correcciones de {tipo} que no se aplicaron ({k}): {res[k]}")
    return res


# ---------------------------------------------------------------- todo junto

def escribir(t, ruta, columnas):
    t = t[columnas].copy()
    for c in ("lat", "lon"):
        t[c] = t[c].round(5)
    t.to_csv(ruta, index=False, encoding="utf-8", lineterminator="\n")


def por_provincia(t, col=None):
    if col is None:
        return {k: int(v) for k, v in t.groupby("codigo_indec").size().sort_index().items()}
    return {k: {kk: int(vv) for kk, vv in g[col].value_counts().sort_index().items()} for k, g in t.groupby("codigo_indec")}


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[1])
    ap.add_argument("--cache")
    ap.add_argument("--sin-georef", action="store_true")
    a = ap.parse_args()
    cache = Path(a.cache) if a.cache else Path(tempfile.mkdtemp(prefix="establecimientos_"))
    cache.mkdir(parents=True, exist_ok=True)
    hoy = dt.date.today().isoformat()

    print("1. Fuentes, en", cache)
    padron_url = url_padron()
    rutas = {"padron": bajar(padron_url, cache / padron_url.rsplit("/", 1)[1]),
             "mapa": bajar(MAPA_URL, cache / "mapa_educativo.csv"),
             "refes": bajar(REFES_URL, cache / "refes_georef.zip"),
             "deptos": bajar(DEPTOS_URL, cache / "departamentos.geojson")}
    bajado = {k: dt.date.fromtimestamp(v.stat().st_mtime).isoformat() for k, v in rutas.items()}

    print("2. Escuelas")
    e, c_padron = leer_padron(rutas["padron"])
    mapa, c_mapa = leer_mapa(rutas["mapa"])
    e = e.merge(mapa.rename(columns={"cue": "cueanexo"}), on="cueanexo", how="left")
    e["ubicacion"] = e.pre.map({"PRECISA": "precisa", "APROXIMADA": "aproximada"}).fillna("sin dato")
    e.loc[e.ubicacion == "sin dato", ["lat", "lon"]] = np.nan
    c_georef = {"no se consultó": True} if a.sin_georef else mejorar(e)
    print("   Georef:", c_georef)

    print("3. Hospitales")
    h, c_refes = leer_refes(rutas["refes"])

    print("4. Correcciones a mano y departamentos")
    correcciones = leer_correcciones()
    c_corr = {"escuelas": aplicar_correcciones(e, correcciones, "escuela", "cueanexo"),
              "hospitales": aplicar_correcciones(h, correcciones, "hospital", "refes_id")}
    deptos = leer_deptos(rutas["deptos"])
    nombre_dep = {k: v["nombre"] for k, v in deptos.items()}
    e["departamento"] = e.codigo_dep.map(nombre_dep).fillna(e.departamento)
    h["departamento"] = h.codigo_dep.map(nombre_dep).fillna("")
    c_dep_e, c_dep_h = controlar_deptos(e, deptos), controlar_deptos(h, deptos)
    compartidas = e[e.ubicacion != "sin dato"].groupby(["lat", "lon"]).size()

    e = e.sort_values("cueanexo")
    h = h.sort_values("refes_id")
    SALIDA.mkdir(parents=True, exist_ok=True)
    escribir(e, SALIDA / "escuelas.csv", ["cueanexo", "nombre", "codigo_indec", "codigo_dep", "departamento", "localidad", "sector", "ambito",
                                          "primaria", "secundaria", "tecnica", "domicilio", "lat", "lon", "ubicacion", "fuera_km",
                                          "correccion", "correccion_fuente"])
    escribir(h, SALIDA / "hospitales.csv", ["refes_id", "nombre", "codigo_indec", "codigo_dep", "departamento", "localidad", "dependencia",
                                            "tipologia", "complejidad", "domicilio", "lat", "lon", "ubicacion", "fuera_km",
                                            "correccion", "correccion_fuente"])
    control = {
        "armado": hoy,
        "fuentes": {
            "padron": {"url": padron_url, "actualizado": c_padron["fecha"], "bajado": bajado["padron"], "licencia": "CC BY 4.0"},
            "mapa_educativo": {"url": MAPA_URL, "bajado": bajado["mapa"], "licencia": "sin licencia declarada: sale del padrón (CC BY 4.0)"},
            "refes": {"url": REFES_URL, "actualizado": c_refes["fecha"], "bajado": bajado["refes"], "licencia": "CC BY 4.0"},
            "departamentos": {"url": DEPTOS_URL, "bajado": bajado["deptos"]},
        },
        "escuelas": {
            "padron_filas": c_padron["filas"], "total": int(len(e)), "con_primaria": int(e.primaria.sum()),
            "con_secundaria": int(e.secundaria.sum()), "por_provincia": por_provincia(e), "sector": por_provincia(e, "sector"),
            "ubicacion": {k: int(v) for k, v in e.ubicacion.value_counts().sort_index().items()},
            "mapa_educativo": c_mapa, "georef": c_georef, "departamentos": c_dep_e,
            "puntos_compartidos_por_3_o_mas": {"puntos": int((compartidas >= 3).sum()), "escuelas": int(compartidas[compartidas >= 3].sum())},
        },
        "hospitales": {
            "refes_establecimientos": c_refes["establecimientos"], "total": int(len(h)), "por_provincia": por_provincia(h),
            "dependencia": por_provincia(h, "dependencia"),
            "ubicacion": {k: int(v) for k, v in h.ubicacion.value_counts().sort_index().items()},
            "coordenadas_descartadas": c_refes["coordenadas_descartadas"], "departamentos": c_dep_h,
        },
        "correcciones": c_corr,
    }
    (SALIDA / "control.json").write_text(json.dumps(control, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")
    print(f"listo: {len(e)} escuelas y {len(h)} hospitales en {SALIDA.relative_to(RAIZ)}")
    print(json.dumps({k: control["escuelas"][k] for k in ("ubicacion", "departamentos")}, ensure_ascii=False))
    print(json.dumps({k: control["hospitales"][k] for k in ("ubicacion", "departamentos")}, ensure_ascii=False))


if __name__ == "__main__":
    main()
