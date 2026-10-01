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

# Indicadores provinciales que no publica Argendata (Fundar), para las fichas nuevas y el explorador de cruces
FUENTES.update({
    # Tablas de mortalidad 2020 a 2022 del INDEC: esperanza de vida al nacer por provincia y sexo
    "indec_tablas_mortalidad.csv": "https://censo.gob.ar/wp-content/uploads/2025/10/tabla_mortalidad_2020_2022_base_csv.csv",
    # ENACOM: accesos a internet fijo cada 100 hogares y velocidad media de bajada, por provincia y trimestre
    "enacom_internet_accesos.csv": "https://indicadores.enacom.gob.ar/Files/DatosAbiertos/internet_accesos_penetracion_provincias.csv",
    "enacom_internet_velocidad.csv": "https://indicadores.enacom.gob.ar/Files/DatosAbiertos/internet_velocidad_media_descarga_provincias.csv",
    # Exportaciones por provincia de origen y rubro, millones de dólares, 1993 al último año (INDEC, Origen Provincial de las Exportaciones)
    "exportaciones_provincias.xls": "https://www.indec.gob.ar/ftp/cuadros/economia/sh_opex_regiones_economicas_grubros_1993_2025.xls",
    # Personas nacidas en otro país identificadas por el RENAPER, por provincia de residencia
    "renaper_extranjeros.csv": "https://datosabiertos.renaper.gob.ar/poblacion_extranjera_identificada_provincia_junio_206.csv",
    # Defunciones por causa (CIE-10, 3 caracteres), provincia, sexo y edad, y nacidos vivos por provincia (DEIS, Ministerio de Salud)
    **{f"deis_defunciones_{a}.csv": "https://www.argentina.gob.ar/sites/default/files/2021/03/" + f for a, f in
       [(2022, "defweb22_0.csv"), (2023, "defweb23.csv"), (2024, "datos_sobre_defunciones_2024.csv")]},
    **{f"deis_nacidos_{a}.csv": "https://www.argentina.gob.ar/sites/default/files/2021/03/" + f for a, f in
       [(2022, "nacweb22_0.csv"), (2023, "nacweb23.csv"), (2024, "datos_sobre_nacidos_vivos_2024.csv")]},
    # Proyecciones de poblacion por provincia, sexo y edad quinquenal, 2022 a 2040 (INDEC, base Censo 2022)
    "indec_proyecciones_provincias.csv": "https://censo.gob.ar/wp-content/uploads/2025/10/proyecciones_jurisdicciones_2022_2040_base.csv",
    # Cuentas fiscales de cada provincia (esquema ahorro-inversion-financiamiento), anual desde 2005, Ministerio de Economia
    "aif_provincias.xlsx": "https://www.argentina.gob.ar/sites/default/files/serie_aif-apnf-2025.xlsx",
    # Tasa de natalidad por provincia, anual desde 2000 (DEIS)
    "deis_natalidad.csv": ckan_csv("http://datos.salud.gob.ar", "314e08d7-70a1-4704-aa2f-e86ce03b359d",
        "http://datos.salud.gob.ar/dataset/314e08d7-70a1-4704-aa2f-e86ce03b359d/resource/0f68d5c6-e667-40ca-90fd-4784336e092e/download/tasa-natalidad-deis-2000-2023.csv"),
})

# Comparación con la OCDE: Indicadores del Desarrollo Mundial del Banco Mundial para la Argentina y los 38 países miembros.
# El promedio se calcula en 02_procesar.py como promedio simple de los miembros, igual que el "promedio OCDE" de sus informes.
OCDE = ("AUS AUT BEL CAN CHL COL CRI CZE DNK EST FIN FRA DEU GRC HUN ISL IRL ISR ITA JPN KOR LVA LTU LUX MEX "
        "NLD NZL NOR POL PRT SVK SVN ESP SWE CHE TUR GBR USA").split()
BM_INDICADORES = ["SP.DYN.TFRT.IN", "SP.ADO.TFRT", "SP.DYN.IMRT.IN", "SP.DYN.LE00.IN", "SH.XPD.CHEX.GD.ZS",
                  "SH.STA.SUIC.P5", "VC.IHR.PSRC.P5", "SH.STA.TRAF.P5", "SL.UEM.TOTL.ZS", "SL.EMP.TOTL.SP.ZS",
                  "EG.USE.ELEC.KH.PC", "EN.GHG.CO2.PC.CE.AR5", "ER.LND.PTLD.ZS", "ST.INT.ARVL", "ER.FSH.CAPT.MT",
                  "SP.POP.TOTL", "SI.DST.50MD", "SI.POV.GINI", "SE.SEC.CMPT.LO.ZS", "IT.NET.USER.ZS",
                  "SP.DYN.CBRT.IN", "NY.GDP.DEFL.ZS"]
# Todos los países, con nombres en español, para "si tu provincia fuera un país"
FUENTES["bm_paises.json"] = "https://api.worldbank.org/v2/es/country?format=json&per_page=400"
for _ind in ["SP.DYN.LE00.IN", "SP.DYN.IMRT.IN"]:
    FUENTES[f"bm_mundo_{_ind}.json"] = f"https://api.worldbank.org/v2/es/country/all/indicator/{_ind}?format=json&per_page=20000&date=2015:2030"
for _ind in BM_INDICADORES:
    FUENTES[f"bm_{_ind}.json"] = (f"https://api.worldbank.org/v2/country/{';'.join(['ARG'] + OCDE)}/indicator/{_ind}"
                                   "?format=json&per_page=20000&date=1990:2030")

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
VALIDA.update({
    "aif_provincias.xlsx": lambda b: b[:2] == b"PK",
    "indec_proyecciones_provincias.csv": lambda b: b"Jurisdiccion" in b[:40],
    **{f"deis_{t}_{a}.csv": (lambda b: b"PROVRES" in b[:20]) for t in ["defunciones", "nacidos"] for a in [2022, 2023, 2024]},
    "deis_natalidad.csv": lambda b: b"natalidad" in b[:300],
    "indec_tablas_mortalidad.csv": lambda b: b"Jurisdiccion_cod" in b[:40],
    "enacom_internet_accesos.csv": lambda b: b.startswith(b"anio,trimestre,provincia"),
    "enacom_internet_velocidad.csv": lambda b: b.startswith(b"anio,trimestre,provincia"),
    "exportaciones_provincias.xls": lambda b: b[:4] == bytes.fromhex("d0cf11e0"),
    "renaper_extranjeros.csv": lambda b: b.startswith(b"pais_nacimiento"),
})
VALIDA["bm_paises.json"] = lambda b: b'"capitalCity"' in b
for _ind in ["SP.DYN.LE00.IN", "SP.DYN.IMRT.IN"]:
    VALIDA[f"bm_mundo_{_ind}.json"] = lambda b: b'"countryiso3code"' in b
for _ind in BM_INDICADORES:
    VALIDA[f"bm_{_ind}.json"] = lambda b: b.lstrip()[:1] == b"[" and b'"countryiso3code"' in b


def bajar(nombre, url):
    if not url:
        raise ValueError("no se encontro la direccion en el catalogo")
    datos = leer(url)
    if nombre in VALIDA and not VALIDA[nombre](datos):
        raise ValueError("el archivo descargado no tiene el formato esperado")
    (CRUDO / nombre).write_bytes(datos)


def departamentos():
    """SNIC por departamento (70 MB) y poblacion identificada del RENAPER por departamento.
    Se bajan a memoria y se guarda solo un resumen chico en datos/crudo/."""
    import io, pandas as pd
    snic = pd.read_csv(io.BytesIO(leer("https://cloud-snic.minseg.gob.ar/Bases/SNIC/snic-departamentos-anual.csv", 600)), sep=";",
                       dtype={"departamento_id": str, "provincia_id": str}, decimal=",",
                       usecols=["anio", "provincia_id", "departamento_id", "departamento_nombre", "codigo_delito_snic_nombre",
                                "cantidad_hechos", "cantidad_victimas", "tasa_hechos", "tasa_victimas"])
    ult = int(snic.anio.max())
    snic = snic[(snic.anio >= ult - 2) & snic.codigo_delito_snic_nombre.isin(
        ["Homicidios dolosos", "Muertes en accidentes viales", "Robos (excluye los agravados por el resultado de lesiones y/o muertes)"])]
    snic.to_csv(CRUDO / "snic_departamentos_resumen.csv", index=False)
    ren = pd.read_csv(io.BytesIO(leer("https://datosabiertos.renaper.gob.ar/poblacion_identificada_departamento_junio_2026.csv", 300)))
    ren = ren.groupby(["provincia_id", "departamento_id", "nombre_departamento", "edad_quinquenal", "pais_nacimiento"], as_index=False).cantidad.sum()
    ren.to_csv(CRUDO / "renaper_departamentos_resumen.csv", index=False)


def votaciones():
    """Votaciones nominales de Diputados (desde 1993) y del Senado (desde 2005). Las paginas oficiales de actas no tienen
    descarga masiva (y votaciones.hcdn.gob.ar bloquea las consultas seguidas), asi que se usa la copia de las actas que
    mantiene el proyecto abierto Como Voto (github.com/rquiroga7/como_voto, se actualiza a diario). Se guarda comprimida,
    con la version (commit) usada en congreso_votaciones_meta.json. Los totales de las leyes clave se cotejan con las
    actas oficiales en scripts/verificar_votaciones.py."""
    import gzip
    sha = json.loads(leer("https://api.github.com/repos/rquiroga7/como_voto/commits/main", 60))["sha"]
    for camara in ["diputados", "senadores"]:
        datos = leer(f"https://raw.githubusercontent.com/rquiroga7/como_voto/{sha}/data/{camara}.json", 300)
        db = json.loads(datos)
        assert len(db["votaciones"]) > 1000 and {"names", "blocs", "provinces"} <= set(db), f"formato inesperado en {camara}"
        (CRUDO / f"congreso_votaciones_{camara}.json.gz").write_bytes(gzip.compress(datos, 9, mtime=0))
    (CRUDO / "congreso_votaciones_meta.json").write_text(json.dumps({"commit": sha, "descargado": datetime.date.today().isoformat()}), encoding="utf-8")


def opex_semestre():
    """Origen Provincial de las Exportaciones: el anexo con el ultimo semestre se llama opex_anexo_cuadros_DD_MM_YY.xls
    (la fecha es la de publicacion) y no tiene una pagina indice fija. Se prueban las fechas de principios de marzo
    (dato anual) y de septiembre (primer semestre), de la mas nueva a la mas vieja, y se guarda el primero que exista."""
    hoy = datetime.date.today()
    candidatos = [datetime.date(a, m, d) for a in (hoy.year, hoy.year - 1) for m in (9, 3) for d in range(25, 0, -1)]
    for f in sorted((c for c in candidatos if c <= hoy), reverse=True):
        url = f"https://www.indec.gob.ar/ftp/cuadros/economia/opex_anexo_cuadros_{f:%d_%m_%y}.xls"
        try:
            datos = leer(url, 60)
        except urllib.error.HTTPError:
            continue
        if datos[:4] != bytes.fromhex("d0cf11e0"):
            continue
        (CRUDO / "exportaciones_semestre.xls").write_bytes(datos)
        (CRUDO / "exportaciones_semestre_meta.json").write_text(json.dumps({"url": url, "publicado": f.isoformat()}), encoding="utf-8")
        return url
    raise ValueError("no se encontro el anexo del OPEX")


def bess():
    """Boletin Estadistico de la Seguridad Social (Secretaria de Seguridad Social). Los nombres de los Excel cambian con
    cada edicion (sufijos de fecha), asi que se leen desde la pagina del boletin."""
    pagina = leer("https://www.argentina.gob.ar/trabajo/seguridadsocial/bess", 60).decode("utf-8", "ignore")
    enlace = re.search(r'href="(/sites/default/files/estadisticas_de_seguridad_social_indicadores_[^"]+\.xlsx)"', pagina)
    if not enlace:
        raise ValueError("no se encontro el cuadro de indicadores en la pagina del BESS")
    url = "https://www.argentina.gob.ar" + enlace.group(1)
    datos = leer(url, 120)
    if datos[:2] != b"PK":
        raise ValueError("el archivo del BESS no es un Excel")
    (CRUDO / "bess_indicadores.xlsx").write_bytes(datos)
    return url


def eph_antiguedad():
    """Encuesta Permanente de Hogares (INDEC), bases usuarias de los cuatro ultimos trimestres publicados.
    Se bajan a memoria y se guarda solo un resumen: porcentaje de asalariados (sin servicio domestico, que no responde
    la pregunta) con un anio o menos en su empleo actual (PP07A de 1 a 4) y con mas de cinco anios (PP07A = 6),
    por edad, generacion, nivel educativo, quintil de ingreso per capita familiar y registro. Codigos segun el
    diseno de registro oficial (EPH_registro_1T2026.pdf). Los cortes por ingreso usan PONDIH, el ponderador que el
    INDEC indica para los ingresos, y el resto PONDERA."""
    import io, zipfile, pandas as pd
    hoy = datetime.date.today()
    candidatos = [(a, t) for a in range(hoy.year, hoy.year - 3, -1) for t in (4, 3, 2, 1)]
    bases = []
    for a, t in candidatos:
        url = f"https://www.indec.gob.ar/ftp/cuadros/menusuperior/eph/EPH_usu_{t}_Trim_{a}_txt.zip"
        try:
            z = zipfile.ZipFile(io.BytesIO(leer(url, 300)))
        except Exception:
            continue
        ind = next(n for n in z.namelist() if "individual" in n.lower())
        d = pd.read_csv(z.open(ind), sep=";", low_memory=False, decimal=",",
                        usecols=["ANO4", "TRIMESTRE", "ESTADO", "CAT_OCUP", "PP07A", "PP07H", "CH06", "NIVEL_ED", "P_DECCF", "PONDERA", "PONDIH"])
        bases.append(d)
        if len(bases) == 4:
            break
    if len(bases) < 4:
        raise ValueError("no se encontraron cuatro trimestres de la EPH")
    d = pd.concat(bases)
    d = d[(d.ESTADO == 1) & (d.CAT_OCUP == 3) & d.PP07A.between(1, 6)].copy()
    d["corto"] = d.PP07A.between(1, 4)
    d["largo"] = d.PP07A == 6
    nac = d.ANO4 - d.CH06
    grupos = {
        "edad": pd.cut(d.CH06, [0, 24, 34, 44, 54, 64, 120], labels=["Hasta 24 años", "25 a 34", "35 a 44", "45 a 54", "55 a 64", "65 y más"]),
        "generacion": pd.cut(nac, [0, 1964, 1980, 1996, 3000], labels=["Nacidos antes de 1965", "1965 a 1980", "1981 a 1996", "Desde 1997"]),
        "educacion": d.NIVEL_ED.map({7: "Hasta primaria completa", 1: "Hasta primaria completa", 2: "Hasta primaria completa", 3: "Secundaria incompleta",
                                     4: "Secundaria completa", 5: "Superior incompleto", 6: "Superior completo"}),
        "ingreso": pd.to_numeric(d.P_DECCF, errors="coerce").map(lambda x: f"Quintil {int((x + 1) // 2)}" if 1 <= x <= 10 else None),
        "registro": d.PP07H.map({1: "Con descuento jubilatorio", 2: "Sin descuento jubilatorio"}),
        "total": pd.Series("Total de asalariados", index=d.index),
    }
    ORDEN_EPH = {"educacion": ["Hasta primaria completa", "Secundaria incompleta", "Secundaria completa", "Superior incompleto", "Superior completo"]}
    filas = []
    for dim, g in grupos.items():
        peso = d.PONDIH if dim == "ingreso" else d.PONDERA
        orden = list(g.cat.categories) if hasattr(g, "cat") else ORDEN_EPH.get(dim, sorted(g.dropna().unique()))
        for i, cat in enumerate(orden):
            m = g == cat
            w = peso[m]
            if w.sum() == 0:
                continue
            filas.append({"dimension": dim, "grupo": cat, "orden": i, "casos": int(m.sum()),
                          "pct_un_anio_o_menos": round(float((w * d.corto[m]).sum() / w.sum() * 100), 1),
                          "pct_mas_de_cinco_anios": round(float((w * d.largo[m]).sum() / w.sum() * 100), 1)})
    pd.DataFrame(filas).to_csv(CRUDO / "eph_antiguedad_resumen.csv", index=False)
    trims = sorted({(int(a), int(t)) for a, t in d[["ANO4", "TRIMESTRE"]].drop_duplicates().values})
    (CRUDO / "eph_antiguedad_meta.json").write_text(json.dumps({"trimestres": trims}), encoding="utf-8")
    return "indec.gob.ar EPH bases usuarias " + ", ".join(f"{t}T{a}" for a, t in trims)


def oede_empresas():
    """Observatorio de Empleo y Dinamica Empresarial (Ministerio de Capital Humano): empresas privadas empleadoras por
    provincia y aperturas y cierres de empresas locales desde 1996, con base en el SIPA. El nombre del Excel cambia con
    cada edicion (provinciales_serie_empresas2_N.xlsx), asi que se lee desde la pagina de estadisticas provinciales."""
    pagina = leer("https://www.argentina.gob.ar/trabajo/estadisticas/oede-estadisticas-provinciales", 60).decode("utf-8", "ignore")
    enlace = re.search(r'href="(/sites/default/files/provinciales_serie_empresas2[^"]*\.xlsx)"', pagina)
    if not enlace:
        raise ValueError("no se encontro la serie de empresas en la pagina del OEDE")
    url = "https://www.argentina.gob.ar" + enlace.group(1)
    datos = leer(url, 120)
    if datos[:2] != b"PK":
        raise ValueError("el archivo del OEDE no es un Excel")
    (CRUDO / "oede_empresas_provincias.xlsx").write_bytes(datos)
    return url


registro = []
for _nombre, _f in [("votaciones nominales", votaciones), ("exportaciones por semestre", opex_semestre), ("seguridad social (BESS)", bess),
                    ("EPH antiguedad en el empleo", eph_antiguedad), ("empresas por provincia (OEDE)", oede_empresas)]:
    try:
        _origen = _f() or "github.com/rquiroga7/como_voto"
        registro.append([_nombre, _origen, datetime.datetime.now().isoformat(timespec="seconds"), "ok"])
    except Exception as e:  # si falla se conservan los archivos anteriores
        registro.append([_nombre, "", datetime.datetime.now().isoformat(timespec="seconds"), f"error: {e}"])
        print(f"{_nombre}: error", e)
try:
    departamentos()
    registro.append(["departamentos (resumen)", "SNIC y RENAPER por departamento", datetime.datetime.now().isoformat(timespec="seconds"), "ok"])
except Exception as e:  # si falla se conservan los resumenes anteriores
    registro.append(["departamentos (resumen)", "SNIC y RENAPER por departamento", datetime.datetime.now().isoformat(timespec="seconds"), f"error: {e}"])
    print("departamentos: error", e)
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
