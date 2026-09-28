"""
Paso 1. Descarga de fuentes publicas.
Guarda cada archivo tal como lo publica el organismo en datos/crudo/
y anota la fecha de descarga en datos/crudo/_registro.csv
Uso: python scripts/01_descargar.py
"""
import urllib.error
import csv, datetime, http.cookiejar, json, pathlib, re, ssl, urllib.request

RAIZ = pathlib.Path(__file__).resolve().parents[1]
CRUDO = RAIZ / "datos" / "crudo"
CRUDO.mkdir(parents=True, exist_ok=True)
UA = {"User-Agent": "Mozilla/5.0 (argentina-en-datos)"}


# Servidores oficiales con el certificado de seguridad vencido (septiembre 2026). Solo para estos se reintenta
# sin verificar el certificado, y el contenido se valida igual antes de guardarlo (ver VALIDA).
CERTIFICADO_VENCIDO = ("www.economia.gob.ar", "www.mecon.gob.ar")


def leer(url, timeout=180):
    """Baja una direccion con un manejo de cookies nuevo en cada llamada.
    Los archivos de Aprender estan en un OneDrive del Ministerio que exige cookies propias por archivo."""
    def abrir(contexto=None):
        manejadores = [urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar())]
        if contexto:
            manejadores.append(urllib.request.HTTPSHandler(context=contexto))
        abridor = urllib.request.build_opener(*manejadores)
        abridor.addheaders = list(UA.items())
        with abridor.open(url, timeout=timeout) as r:
            return r.read()
    try:
        return abrir()
    except urllib.error.URLError as e:
        if not any(h in url for h in CERTIFICADO_VENCIDO) or "CERTIFICATE" not in str(e).upper():
            raise
        print(f"  aviso: certificado vencido en {url.split('/')[2]}, se reintenta sin verificarlo")
        return abrir(ssl._create_unverified_context())


def ckan_recurso(portal, paquete, contiene, respaldo=None):
    """Direccion del recurso cuyo nombre contiene el texto indicado, segun el catalogo del portal."""
    try:
        recursos = json.loads(leer(f"{portal}/api/3/action/package_show?id={paquete}", 60))["result"]["resources"]
        return next(x["url"] for x in recursos if contiene.lower() in x["name"].lower())
    except Exception:
        return respaldo


def ckan_id(portal, paquete, recurso, respaldo):
    """Direccion vigente de un recurso identificado por su id dentro de un paquete del catalogo."""
    try:
        recursos = json.loads(leer(f"{portal}/api/3/action/package_show?id={paquete}", 60))["result"]["resources"]
        return next(x["url"] for x in recursos if x["id"] == recurso)
    except Exception:
        return respaldo


YV = "https://datos.yvera.gob.ar"  # datos abiertos del Ministerio de Turismo (SINTA)

def femicidios():
    """Bases de victimas del Registro Nacional de Femicidios de la Justicia Argentina (Corte Suprema), una por anio.
    Se usa el archivo .sav, que existe para todos los anios, y se busca en el catalogo para sumar los anios nuevos."""
    try:
        res = json.loads(leer("https://datos.csjn.gob.ar/api/3/action/package_search?q=femicidio&rows=50", 60))["result"]["results"]
    except Exception:
        return {}
    salida = {}
    for paq in res:
        anio = re.search(r"(20\d{2})", paq["name"])
        if not anio:
            continue
        for r in paq["resources"]:
            if r["url"].lower().endswith(".sav") and "victima" in r["url"].lower():
                salida[f"csjn_femicidios_{anio.group(1)}.sav"] = r["url"]
                break
    return salida


APRENDER = {}  # anio y nivel de la ultima evaluacion Aprender encontrada, para los textos del sitio


def aprender(area):
    """Base agregada de Aprender de 6 grado de primaria del anio mas reciente publicado en datos.gob.ar."""
    try:
        res = json.loads(leer("https://datos.gob.ar/api/3/action/package_search?q=aprender&rows=50", 60))["result"]["results"]
        paquetes = sorted([x for x in res if re.fullmatch(r"aprender-\d{4}", x["name"])], key=lambda x: x["name"], reverse=True)
        for paq in paquetes:
            for r in paq["resources"]:
                if "Primaria 6" in r["name"] and "Agregada - Desempe" in r["name"] and area in r["name"]:
                    APRENDER.update(anio=int(paq["name"][-4:]), nivel="6 grado de primaria")
                    return r["url"] + ("&" if "?" in r["url"] else "?") + "download=1"
    except Exception:
        pass
    return None


def ckan_csv(portal, paquete, respaldo):
    """Busca en el catalogo del portal el CSV vigente de un conjunto de datos.
    Sirve para fuentes que cambian el nombre del archivo cada anio (por ejemplo '1990-2024').
    Si el catalogo no responde, usa la direccion conocida."""
    try:
        req = urllib.request.Request(f"{portal}/api/3/action/package_show?id={paquete}", headers=UA)
        with urllib.request.urlopen(req, timeout=60) as r:
            recursos = json.load(r)["result"]["resources"]
        csvs = [x for x in recursos if (x.get("format") or "").upper() == "CSV"]
        csvs.sort(key=lambda x: x.get("last_modified") or x.get("created") or "")
        return csvs[-1]["url"] if csvs else respaldo
    except Exception:
        return respaldo

API = "https://apis.datos.gob.ar/series/api/series/?format=csv&limit=5000&start_date=2004-01-01&ids="

# Asalariados privados registrados, serie original por provincia (SIPA, publicada por la SSPM)
SIPA = [
    "154.1_CABA_C_0_0_4", "154.1_BOS_AIRRES_C_0_0_12", "154.1_CMARCARCA_C_0_0_9",
    "154.1_COACO_C_0_0_5", "154.1_CUTBUT_C_0_0_6", "154.1_COBAOBA_C_0_0_7",
    "154.1_CIENTESTES_C_0_0_10", "154.1_EE_RIOSIOS_C_0_0_10", "154.1_FOSAOSA_C_0_0_7",
    "154.1_JYJUY_C_0_0_5", "154.1_LAMPAMPA_C_0_0_8", "154.1_LIOJAOJA_C_0_0_8",
    "154.1_MOZAOZA_C_0_0_7", "154.1_MONESNES_C_0_0_8", "154.1_NUENUEN_C_0_0_7",
    "154.1_RNEGROGRO_C_0_0_9", "154.1_SALTA_C_0_0_5", "154.1_SJUANUAN_C_0_0_8",
    "154.1_SLUISUIS_C_0_0_8", "154.1_SA_CRUZRUZ_C_0_0_10", "154.1_SA_FE_FE_C_0_0_8",
    "154.1_SIAGO_EERO_C_0_0_15", "154.1_TRA_FUEEGO_C_0_0_12", "154.1_TMANMAN_C_0_0_7",
]

FUENTES = {
    # Demanda electrica total y residencial (Secretaria de Energia) y EMAE (INDEC)
    "energia_emae.csv": API + "367.3_DEMANDA_TOTAL__13,367.3_DEMANDA_REIAL__19,143.3_NO_PR_2004_A_21",
    # Empleo privado registrado por provincia
    "sipa_provincias.csv": API + ",".join(SIPA),
    # Nacimientos por provincia y edad de la madre (RENAPER)
    "renaper_nacimientos.csv": "https://datosabiertos.renaper.gob.ar/cantidad_de_nacimientos_edad_madre_por_anio_de_nacimiento_2012_2024.csv",
    # Estadisticas criminales por provincia y pais (SNIC, Ministerio de Seguridad)
    "snic_provincias.csv": "https://cloud-snic.minseg.gob.ar/Bases/SNIC/snic-provincias.csv",
    "snic_pais.csv": "https://cloud-snic.minseg.gob.ar/Bases/SNIC/snic-pais.csv",
    # Base de suicidios del Sistema de Alerta Temprana (SNIC). Solo se usan edad y sexo.
    "snic_sat_suicidios.csv": "https://cloud-snic.minseg.gob.ar/Bases/SAT/SS/SAT-SS-BU_2017-2024.csv",
    # Tasa de mortalidad infantil por provincia (DEIS, Ministerio de Salud). El nombre del archivo
    # cambia con cada anio nuevo, por eso se busca en el catalogo.
    "deis_mortalidad_infantil.csv": ckan_csv(
        "https://datos.salud.gob.ar", "tasa-de-mortalidad-infantil",
        "https://datos.salud.gob.ar/dataset/2eff770c-1c2b-4a22-9281-c3b5e9412086/resource/"
        "c1253897-d507-41f7-a3e1-6ed756e7243b/download/tasa-mortalidad-infantil-deis-1990-2024.csv"),
    # Tarjetas SUBE usadas por dia (Ministerio de Transporte). Se baja directo del organismo:
    # la copia en la API de Series de Tiempo quedo detenida en enero de 2026.
    "sube_usuarios_dia.csv": "https://archivos-datos.transporte.gob.ar/upload/Sube/total-usuarios-por-dia.csv",
    # Resultados PISA de la Argentina y promedio OCDE (OCDE, republicado por Our World in Data)
    "pisa_owid.csv": "https://ourworldindata.org/grapher/average-performance-of-15-year-olds-in-mathematics-reading-and-science.csv?v=1&csvType=full&useColumnShortNames=true",
    # Tasas de escolarizacion por provincia (Ministerio de Educacion, Indicadores Educativos). El nombre del archivo cambia.
    "educ_escolarizacion.zip": ckan_recurso("https://datos.gob.ar", "indicadores-educativos", "Escolariz",
        "https://www.argentina.gob.ar/sites/default/files/2018/04/tasas_de_escolarizacion_1.zip"),
    # Evaluacion Aprender, base agregada de 6 grado (Ministerio de Educacion)
    "aprender_primaria_matematica.csv": aprender("Matem"),
    "aprender_primaria_lengua.csv": aprender("Lengua"),
    # Areas protegidas por provincia, 2025, y superficie de cada provincia (Ministerio de Ambiente, CIAM)
    "ciam_areas_protegidas_provincias.csv": "https://ciam.ambiente.gob.ar/dt_csv.php?dt_id=394",
    "ciam_superficie_provincias.csv": "https://ciam.ambiente.gob.ar/dt_csv.php?dt_id=596",
    # Cada area protegida con anio de creacion, superficie y especies registradas (Sistema de Informacion de Biodiversidad)
    "sib_areas_protegidas.json": "https://sib.gob.ar/api/2.0.0/ficha-area-protegida/areas-protegidas",
    # Visitas mensuales a parques nacionales desde 2008 (SINTA)
    "sinta_visitas_parques.csv": ckan_id(YV, "parques-nacionales", "a570af75-ed33-427c-9797-980fc0cd8fd1",
        YV + "/dataset/458bcbe1-855c-4bc3-a1c9-cd4e84fedbbc/resource/a570af75-ed33-427c-9797-980fc0cd8fd1/download/visitas-residentes-y-no-residentes.csv"),
    # Turistas no residentes que llegan al pais, mensual desde 2010 (SINTA)
    "sinta_turistas_no_residentes.csv": ckan_id(YV, "turismo-internacional-total-pais", "fdfe0ae4-4acc-4421-aa48-6149a02bc615",
        YV + "/dataset/4cbf7d4a-702a-4911-8c1e-717a45214902/resource/fdfe0ae4-4acc-4421-aa48-6149a02bc615/download/turistas-no-residentes-serie.csv"),
    # Viajeros hospedados en hoteles por region, mensual desde 2007 (Encuesta de Ocupacion Hotelera)
    "sinta_eoh_viajeros_region.csv": ckan_id(YV, "encuesta-ocupacion-hotelera-parahotelera-eoh", "1f6b78aa-d3b4-440a-bd7d-30d76e1728aa",
        YV + "/dataset/93db331e-6970-4d74-8589-c1223ac9c282/resource/1f6b78aa-d3b4-440a-bd7d-30d76e1728aa/download/viajeros-hospedados-residentes-y-no-residentes-por-destino.csv"),
    # Turistas extranjeros que salen por Ezeiza y Aeroparque segun provincia visitada, desde 2022 (Encuesta de Turismo Internacional)
    "sinta_eti_provincias.csv": ckan_id(YV, "encuesta-turismo-internacional", "4af57562-9ca5-4301-8865-e04e9bfdf327",
        YV + "/dataset/78b880c1-50d5-4a0c-9c87-7350e70548c2/resource/4af57562-9ca5-4301-8865-e04e9bfdf327/download/turistas_pernoctes_por_provincia_segun_origen_y_destinos_visitados_ezeiza_aeroparque.csv"),
    # Carne vacuna, vino y yerba mate: indicadores sectoriales del Ministerio de Economia (SSPMI).
    # El servidor estuvo inestable en septiembre de 2026: si falla, queda el archivo anterior.
    "sspmi_carne_vacuna.csv": "https://www.economia.gob.ar/catalogo-sspmi/nuevo_dataset/sspmi_carnica-vacuna.csv",
    "sspmi_vitivinicultura.csv": "https://www.economia.gob.ar/catalogo-sspmi/nuevo_dataset/sspmi_vitivinicultura.csv",
    "sspmi_yerba_mate.csv": "https://www.economia.gob.ar/catalogo-sspmi/nuevo_dataset/sspmi_yerba-mate.csv",
    # Nombres mas frecuentes por provincia, anio y sexo (RENAPER)
    "renaper_nombres_frecuentes.csv": "https://datosabiertos.renaper.gob.ar/nombres_propios_frecuentes_anio_sexo_provincia_2012_2024.csv",
    # Glaciares por provincia (Inventario Nacional de Glaciares) y anomalia de temperatura desde 1961 (SMN), via CIAM
    "ciam_glaciares.csv": "https://ciam.ambiente.gob.ar/dt_csv.php?dt_id=383",
    "ciam_anomalia_temperatura.csv": "https://ciam.ambiente.gob.ar/dt_csv.php?dt_id=467",
    # Pesca maritima: desembarques por especie desde 2012, y pesca continental por especie y provincia (CIAM)
    "ciam_desembarques_especie.csv": "https://ciam.ambiente.gob.ar/dt_csv.php?dt_id=572",
    "ciam_pesca_continental.csv": "https://ciam.ambiente.gob.ar/dt_csv.php?dt_id=574",
    # Autos y motos nuevos inscriptos por provincia y mes (DNRPA, Ministerio de Justicia)
    "dnrpa_autos_nuevos.csv": ckan_id("https://datos.jus.gob.ar", "estadistica-de-tramites-de-automotores", "4358c995-bb04-4ad9-be4a-a9076dc3e42c",
        "https://datos.jus.gob.ar/dataset/1ab0cc03-ab9b-4520-975c-5757d87d1061/resource/4358c995-bb04-4ad9-be4a-a9076dc3e42c/download/estadistica-inscripciones-iniciales-automotores-2000-01-2026-08.csv"),
    "dnrpa_motos_nuevas.csv": ckan_id("https://datos.jus.gob.ar", "estadistica-de-tramites-de-motovehiculos", "d523dd08-5c12-467e-b947-aa3206a24d21",
        "https://datos.jus.gob.ar/dataset/72d85f23-b751-4d12-935b-25e32ed9445e/resource/d523dd08-5c12-467e-b947-aa3206a24d21/download/estadistica-inscripciones-iniciales-motovehiculos-2007-01-2026-08.csv"),
}

FUENTES.update(femicidios())

# Controles para no pisar un archivo bueno con una pagina de error o de inicio de sesion
VALIDA = {
    "aprender_primaria_matematica.csv": lambda b: b"jurisdiccion" in b[:40],
    "aprender_primaria_lengua.csv": lambda b: b"jurisdiccion" in b[:40],
    "educ_escolarizacion.zip": lambda b: b[:2] == b"PK",
    "pisa_owid.csv": lambda b: b.startswith(b"entity,"),
    "dnrpa_autos_nuevos.csv": lambda b: b"inscripcion" in b[:200],
    "sspmi_carne_vacuna.csv": lambda b: b"sector_id" in b[:200],
    "sspmi_vitivinicultura.csv": lambda b: b"sector_id" in b[:200],
    "sspmi_yerba_mate.csv": lambda b: b"sector_id" in b[:200],
    "renaper_nombres_frecuentes.csv": lambda b: b"provincia_id" in b[:100],
    "ciam_glaciares.csv": lambda b: b"glaciares" in b[:200],
    "ciam_desembarques_especie.csv": lambda b: b"especies" in b[:100],
    "ciam_pesca_continental.csv": lambda b: b"especie" in b[:100],
    "ciam_anomalia_temperatura.csv": lambda b: b"temperatura" in b[:200],
    "dnrpa_motos_nuevas.csv": lambda b: b"inscripcion" in b[:200],
    "sib_areas_protegidas.json": lambda b: b.lstrip()[:1] == b"[",
    "ciam_areas_protegidas_provincias.csv": lambda b: b"jurisdicciones" in b[:60],
    "ciam_superficie_provincias.csv": lambda b: b"superficie" in b[:80],
}


def bajar(nombre, url):
    if not url:
        raise ValueError("no se encontro la direccion en el catalogo")
    datos = leer(url)
    if nombre in VALIDA and not VALIDA[nombre](datos):
        raise ValueError("el archivo descargado no tiene el formato esperado")
    (CRUDO / nombre).write_bytes(datos)


registro = []
for nombre, url in FUENTES.items():
    try:
        bajar(nombre, url)
        estado = "ok"
    except Exception as e:  # una fuente caida no frena al resto
        estado = f"error: {e}"
    print(f"{nombre:28s} {estado}")
    registro.append([nombre, url, datetime.datetime.now().isoformat(timespec="seconds"), estado])

# Algunos archivos del CIAM no traen el anio adentro: se toma del nombre que informa el servidor
meta = {}
for clave, archivo in [("anio", "ciam_areas_protegidas_provincias.csv"), ("pesca_continental", "ciam_pesca_continental.csv")]:
    try:
        abridor = urllib.request.build_opener(); abridor.addheaders = list(UA.items())
        with abridor.open(FUENTES[archivo], timeout=60) as r:
            anio = re.search(r"(\d{4})\.csv", r.headers.get("Content-Disposition", ""))
        if anio:
            meta[clave] = int(anio.group(1))
    except Exception:
        pass
if meta:
    previo = json.loads((CRUDO / "ciam_meta.json").read_text(encoding="utf-8")) if (CRUDO / "ciam_meta.json").exists() else {}
    (CRUDO / "ciam_meta.json").write_text(json.dumps({**previo, **meta}), encoding="utf-8")

if APRENDER:
    (CRUDO / "aprender_meta.json").write_text(json.dumps(APRENDER), encoding="utf-8")

with open(CRUDO / "_registro.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["archivo", "url", "descargado", "estado"])
    w.writerows(registro)
