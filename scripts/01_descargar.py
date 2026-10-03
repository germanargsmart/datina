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

# Petróleo, gas y construcción (etapa 18, octubre de 2026)
SE = "http://datos.energia.gob.ar"  # portal de datos de la Secretaría de Energía: responde solo por http (https redirige a http)
SE_POZO = "c846e79c-026c-4040-897f-1ad3543b407c"  # producción de petróleo y gas por pozo (Capítulo IV de la Resolución SE 319/1993)
SE_REG = "https://www.energia.gob.ar/contenidos/archivos/Reorganizacion/informacion_del_mercado/mercado_hidrocarburos/informacion_estadistica/regalias/"
ISAC = "https://infra.datos.gob.ar/catalog/sspm/dataset/33/distribution/"
FUENTES.update({
    # Producción mensual de petróleo y de gas del país por cuenca y por tipo de recurso (shale, tight y el resto), Capítulo IV
    "se_petroleo_cuenca.csv": ckan_recurso(SE, SE_POZO, "producción de petróleo por cuenca y sub tipo",
        f"{SE}/dataset/{SE_POZO}/resource/af8c50bb-fde0-43b7-98eb-7cd14daf586c/download/serie-histrica-de-produccin-de-petrleo-por-cuenca-y-sub-tipo-de-recurso-captulo-iv-.csv"),
    "se_gas_cuenca.csv": ckan_recurso(SE, SE_POZO, "producción de gas natural por cuenca y sub tipo",
        f"{SE}/dataset/{SE_POZO}/resource/a3244ddd-38bc-4800-a700-360b649d2f3a/download/serie-histrica-de-produccin-de-gas-natural-por-cuenca-y-sub-tipo-de-recurso-captulo-iv-.csv"),
    # Regalías de petróleo crudo por provincia, en dólares, mensual desde 1991, con los precios de cada tipo de crudo (Secretaría de Energía)
    "se_regalias_crudo.zip": SE_REG + "Regalias_CRUDO.zip",
    # Exportaciones de combustibles y energía e importaciones de combustibles y lubricantes, millones de dólares (INDEC, ICA)
    "indec_ica_energia.csv": API + "74.3_IECE_0_M_35,74.3_IICL_0_M_42",
    # Indicador Sintético de la Actividad de la Construcción (INDEC): nivel general y despachos de insumos, base 2004 = 100
    "isac.csv": ISAC + "33.2/download/indicador-sintetico-actividad-construccion-valores-mensuales-base-2004.csv",
    "isac_insumos.csv": ISAC + "33.3/download/indicador-sintetico-actividad-construccion-insumos-serie-original.csv",
    # Índice del Costo de la Construcción en el Gran Buenos Aires (INDEC): variaciones desde noviembre de 2015 e índices desde 2022
    "indec_icc.xls": "https://www.indec.gob.ar/ftp/cuadros/economia/icc_variaciones_indices_2016.xls",
    # Índice de precios al consumidor, nivel general nacional, base diciembre de 2016 (INDEC)
    "ipc_nacional.csv": API + "148.3_INIVELNAL_DICI_M_26",
    # Fracturas de pozos (Adjunto IV, Secretaría de Energía, se actualiza a diario): por pozo, la fecha, las etapas de fractura, la
    # rama horizontal, la arena y el agua (etapa 19)
    "se_fracturas.csv": ckan_recurso(SE, "datos-de-fractura-de-pozos-adjunto-iv", "fractura de pozos",
        f"{SE}/dataset/71fa2e84-0316-4a1b-af68-7f35e41f58d7/resource/2280ad92-6ed3-403e-a095-50139863ab0d/download/datos-de-fractura-de-pozos-de-hidrocarburos-adjunto-iv-actualizacin-diaria.csv"),
    # Pozos terminados por mes, tipo (explotación, exploración, avanzada y servicio) y provincia, desde 2009 (Secretaría de Energía)
    # Potencia instalada del país por tecnología, MW por año (CAMMESA, publicada por la Subsecretaría de Programación Macroeconómica)
    "potencia_instalada.csv": API + "367.1_POTENCIA_ITAL__24,367.1_POTENCIA_IDOS__36,367.1_POTENCIA_IGAS__32,367.1_POTENCIA_IPOR__29,367.1_POTENCIA_ISEL__31,367.1_POTENCIA_IICA__29,367.1_POTENCIA_IBLE__39,367.1_POTENCIA_IEAR__26,367.1_POTENCIA_IICA__25,367.1_POTENCIA_ILAR__24,367.1_POTENCIA_IGAS__25",
    "se_pozos_terminados.csv": ckan_recurso(SE, "perforacion-de-pozos-de-petroleo-y-gas", "pozos terminados por tipo de pozo y provincia",
        f"{SE}/dataset/7ea2ac77-d7a0-4129-9fbf-6f1a25d94e21/resource/66b0266a-b028-4812-b95f-1da31835b0aa/download/pozos-terminados-por-tipo-de-pozo-y-provincia.csv"),
})

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
       [(2012, "nacweb12.csv"), (2013, "nacweb13.csv"), (2014, "nacweb14.csv"), (2015, "nacweb15.csv"), (2016, "nacweb16.csv"),
        (2017, "nacweb17.csv"), (2018, "nacweb18.csv"), (2019, "nacweb19.csv"), (2020, "nacweb20_0.csv"), (2021, "nacweb21_0.csv"),
        (2022, "nacweb22_0.csv"), (2023, "nacweb23.csv"), (2024, "datos_sobre_nacidos_vivos_2024.csv")]},
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
VALIDA.update({
    "se_petroleo_cuenca.csv": lambda b: b.lstrip(b"\xef\xbb\xbf").startswith(b"indice_tiempo,cuenca_austral"),
    "se_gas_cuenca.csv": lambda b: b.lstrip(b"\xef\xbb\xbf").startswith(b"indice_tiempo,produccion_gas_natural_cuenca_austral"),
    "se_regalias_crudo.zip": lambda b: b[:2] == b"PK",
    "indec_ica_energia.csv": lambda b: b.startswith(b"indice_tiempo,ica_exportacion_combustible_energia"),
    "isac.csv": lambda b: b.startswith(b"indice_tiempo,isac_nivel_general"),
    "isac_insumos.csv": lambda b: b.startswith(b"indice_tiempo,isac_articulos_sanitarios"),
    "indec_icc.xls": lambda b: b[:4] == bytes.fromhex("d0cf11e0"),
    "ipc_nacional.csv": lambda b: b.startswith(b"indice_tiempo,"),
    "se_fracturas.csv": lambda b: b.lstrip(b"\xef\xbb\xbf").startswith(b"id_base_fractura_adjiv,idpozo"),
    "se_pozos_terminados.csv": lambda b: b.lstrip(b"\xef\xbb\xbf").startswith(b"anio,mes,indice_tiempo,tipo_pozo,provincia"),
    "potencia_instalada.csv": lambda b: b.startswith(b"indice_tiempo,potencia_instalada_total"),
})
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
    por edad, generacion, nivel educativo, quintil de ingreso per capita familiar y registro, y desde octubre de 2026 por tipo
    de trabajo: empleo estatal o privado (PP04A), cantidad de personas que trabajan en el lugar (PP04C, y PP04C99 si la persona
    respondio por tramos) y calificacion de la tarea (quinto digito del codigo de ocupacion PP04D_COD, Clasificador Nacional
    de Ocupaciones 2001: 1 profesional, 2 tecnica, 3 operativa, 4 no calificada, segun definiciones_conceptuales_cno.pdf del
    INDEC). Codigos segun el diseno de registro oficial (EPH_registro_1T2026.pdf). Los cortes por ingreso usan PONDIH, el
    ponderador que el INDEC indica para los ingresos, y el resto PONDERA."""
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
                        usecols=["ANO4", "TRIMESTRE", "ESTADO", "CAT_OCUP", "PP07A", "PP07H", "CH06", "NIVEL_ED", "P_DECCF", "PONDERA", "PONDIH",
                                 "PP04A", "PP04C", "PP04C99", "PP04D_COD"], dtype={"PP04D_COD": str})
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
    # cantidad de personas en el lugar de trabajo, en los tramos que usa el INDEC (PP04C de 1 a 12, o el tramo de PP04C99)
    tam = pd.to_numeric(d.PP04C, errors="coerce")
    tramo = pd.Series(None, index=d.index, dtype=object)
    tramo[tam.between(1, 5)] = "Hasta 5 personas"
    tramo[tam.between(6, 8)] = "De 6 a 40 personas"
    tramo[tam.between(9, 12)] = "Más de 40 personas"
    sin_dato = tam.eq(99) | tam.isna()
    tramo[sin_dato] = pd.to_numeric(d.PP04C99, errors="coerce")[sin_dato].map({1: "Hasta 5 personas", 2: "De 6 a 40 personas", 3: "Más de 40 personas"})
    cod = d.PP04D_COD.fillna("").str.strip()
    calif = cod.where(cod.str.len() == 5, "").str[-1].map({"1": "Profesional", "2": "Técnica", "3": "Operativa", "4": "No calificada"})
    grupos = {
        "edad": pd.cut(d.CH06, [0, 24, 34, 44, 54, 64, 120], labels=["Hasta 24 años", "25 a 34", "35 a 44", "45 a 54", "55 a 64", "65 y más"]),
        "generacion": pd.cut(nac, [0, 1964, 1980, 1996, 3000], labels=["Nacidos antes de 1965", "1965 a 1980", "1981 a 1996", "Desde 1997"]),
        "educacion": d.NIVEL_ED.map({7: "Hasta primaria completa", 1: "Hasta primaria completa", 2: "Hasta primaria completa", 3: "Secundaria incompleta",
                                     4: "Secundaria completa", 5: "Superior incompleto", 6: "Superior completo"}),
        "ingreso": pd.to_numeric(d.P_DECCF, errors="coerce").map(lambda x: f"Quintil {int((x + 1) // 2)}" if 1 <= x <= 10 else None),
        "registro": d.PP07H.map({1: "Con descuento jubilatorio", 2: "Sin descuento jubilatorio"}),
        "sector": pd.to_numeric(d.PP04A, errors="coerce").map({1: "Estatal", 2: "Privado"}),
        "tamano": tramo,
        "calificacion": calif,
        "total": pd.Series("Total de asalariados", index=d.index),
    }
    ORDEN_EPH = {"educacion": ["Hasta primaria completa", "Secundaria incompleta", "Secundaria completa", "Superior incompleto", "Superior completo"],
                 "sector": ["Estatal", "Privado"], "tamano": ["Hasta 5 personas", "De 6 a 40 personas", "Más de 40 personas"],
                 "calificacion": ["Profesional", "Técnica", "Operativa", "No calificada"]}
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


def hidrocarburos():
    """Producción de petróleo y gas (Capítulo IV de la Resolución SE 319/1993, Secretaría de Energía): las empresas declaran cada
    mes la producción de cada pozo. Los archivos son grandes (unos 125 MB el agrupado por yacimiento y formación, y unos 300 MB cada
    año por pozo): se bajan a memoria y se guardan solo resúmenes chicos en datos/crudo/.
    - se_produccion_resumen.csv: producción por mes, provincia y tipo de recurso (convencional, shale, tight u otro), separando la
      formación Vaca Muerta, desde 2006 (archivo agrupado por yacimiento y formación productiva).
    - se_produccion_empresas.csv: producción por mes y empresa desde 2018.
    - se_produccion_areas.csv: producción por año y área de concesión, con su provincia, cuenca y la empresa que más produjo.
    - se_pozos_resumen.csv: pozos que produjeron petróleo o gas y su producción, por mes, provincia y tipo, de los archivos por pozo
      del año en curso y del anterior (los meses más viejos quedan del resumen anterior).
    Hay dos juegos de archivos por pozo: se usa el común (no el de "DDJJ abiertas y cerradas"), que coincide con la serie del país.
    Algunos años aparecen dos veces con el mismo nombre (guion largo y corto): se toma el modificado más recientemente."""
    import io, pandas as pd
    recursos = json.loads(leer(f"{SE}/api/3/action/package_show?id={SE_POZO}", 60))["result"]["resources"]

    def url(cond):
        r = sorted([x for x in recursos if cond(x["name"].lower())], key=lambda x: x.get("last_modified") or "")
        if not r:
            raise ValueError("no se encontró el archivo en el catálogo de la Secretaría de Energía")
        return r[-1]["url"].replace("https://", "http://")

    def tipo(d):
        t = pd.Series("otro", index=d.index)
        t[d.tipo_de_recurso.eq("CONVENCIONAL")] = "convencional"
        nc = d.tipo_de_recurso.eq("NO CONVENCIONAL")
        t[nc & d.sub_tipo_recurso.eq("SHALE")] = "shale"
        t[nc & d.sub_tipo_recurso.eq("TIGHT")] = "tight"
        return t

    def csv_grande(u, columnas):
        datos = leer(u, 900)
        if not datos.lstrip(b"\xef\xbb\xbf").startswith(b"idempresa,anio,mes"):
            raise ValueError(f"formato inesperado en {u.rsplit('/', 1)[-1]}")
        return pd.read_csv(io.BytesIO(datos), usecols=columnas, low_memory=False)

    ag = csv_grande(url(lambda n: "agrupada por yacimiento y formación" in n),
                    ["anio", "mes", "prod_pet", "prod_gas", "empresa", "formacion", "idareapermisoconcesion", "areapermisoconcesion",
                     "tipo_de_recurso", "sub_tipo_recurso", "cuenca", "provincia"])
    ag["tipo"] = tipo(ag)
    ag["vaca_muerta"] = ag.formacion.fillna("").str.strip().str.lower().eq("vaca muerta")
    (ag.groupby(["anio", "mes", "provincia", "tipo", "vaca_muerta"], as_index=False)[["prod_pet", "prod_gas"]].sum()
     .round(3).to_csv(CRUDO / "se_produccion_resumen.csv", index=False))
    (ag[ag.anio >= 2018].groupby(["anio", "mes", "empresa"], as_index=False)[["prod_pet", "prod_gas"]].sum()
     .query("prod_pet > 0 or prod_gas > 0").round(3).to_csv(CRUDO / "se_produccion_empresas.csv", index=False))
    ag["nc"] = ag.tipo.isin(["shale", "tight"])
    ag["pet_nc"], ag["gas_nc"] = ag.prod_pet.where(ag.nc, 0), ag.prod_gas.where(ag.nc, 0)
    claves = ["anio", "idareapermisoconcesion"]
    areas = ag.groupby(claves, as_index=False).agg(area=("areapermisoconcesion", "first"), provincia=("provincia", "first"),
        cuenca=("cuenca", "first"), prod_pet=("prod_pet", "sum"), prod_gas=("prod_gas", "sum"), pet_nc=("pet_nc", "sum"), gas_nc=("gas_nc", "sum"))
    por_emp = ag.assign(v=ag.prod_pet + ag.prod_gas).groupby(claves + ["empresa"], as_index=False).v.sum()
    areas = areas.merge(por_emp.sort_values("v").drop_duplicates(claves, keep="last")[claves + ["empresa"]], on=claves, how="left")
    areas[(areas.prod_pet > 0) | (areas.prod_gas > 0)].round(3).to_csv(CRUDO / "se_produccion_areas.csv", index=False)
    # pozos que produjeron: archivos por pozo del año en curso y del anterior
    hoy = datetime.date.today().year
    filas = []
    for a in (hoy - 1, hoy):
        try:
            u = url(lambda n: "producción de pozos de gas y petróleo" in n and n.rstrip().endswith(str(a)) and "ddjj" not in n)
        except ValueError:
            continue
        d = csv_grande(u, ["anio", "mes", "idpozo", "prod_pet", "prod_gas", "tipo_de_recurso", "sub_tipo_recurso", "provincia"])
        d["tipo"] = tipo(d)
        d["con_pet"], d["con_gas"] = d.prod_pet > 0, d.prod_gas > 0
        d["produce"] = d.con_pet | d.con_gas
        filas.append(d.groupby(["anio", "mes", "provincia", "tipo"], as_index=False).agg(
            pozos=("produce", "sum"), pozos_pet=("con_pet", "sum"), pozos_gas=("con_gas", "sum"), prod_pet=("prod_pet", "sum"), prod_gas=("prod_gas", "sum")))
    if not filas:
        raise ValueError("no se encontraron los archivos por pozo")
    nuevo = pd.concat(filas)
    previo = CRUDO / "se_pozos_resumen.csv"
    if previo.exists():
        viejo = pd.read_csv(previo)
        nuevo = pd.concat([viejo[viejo.anio < nuevo.anio.min()], nuevo])
    nuevo.round(3).to_csv(previo, index=False)
    return f"{SE} Capítulo IV ({len(ag):,} filas agrupadas)"


def reservas_hidrocarburos():
    """Reservas de petróleo y gas al 31 de diciembre de cada año hasta el final de la vida útil de los yacimientos (Secretaría de
    Energía, un ZIP por año; se usan desde 2006, cuando empezó a regir la Resolución SE 324/2006). Dos formatos: hasta 2016, una planilla por cuenca y provincia que termina con la fila
    "TOTAL PAIS"; desde 2017, una fila por yacimiento con un bloque convencional y otro no convencional (y la provincia). Se guarda
    solo el total del país por año y, desde 2017, por provincia y tipo (se_reservas_resumen.csv). Petróleo en miles de m3 y gas en
    millones de m3, como los publica la fuente."""
    import io, zipfile, pandas as pd
    recursos = json.loads(leer(f"{SE}/api/3/action/package_show?id=reservas-de-petroleo-y-gas", 60))["result"]["resources"]
    filas = []
    for r in recursos:
        anio = re.search(r"31/12/(\d{4})", r["name"])
        if not anio or "vida útil" not in r["name"].lower() or not r["url"].lower().endswith(".zip"):
            continue
        anio = int(anio.group(1))
        if anio < 2006:  # desde 2006 rige la Resolución SE 324/2006 y el formato es parejo (2004 y 2005 tienen otras planillas)
            continue
        z = zipfile.ZipFile(io.BytesIO(leer(r["url"], 120)))
        nombre = next(n for n in z.namelist() if n.lower().endswith((".xls", ".xlsx")))
        x = pd.ExcelFile(io.BytesIO(z.read(nombre)))
        hoja = next((s for s in x.sheet_names if "vid" in s.lower() or "fvu" in s.lower()), x.sheet_names[0])
        d = pd.read_excel(x, hoja, header=None)
        texto = d.astype(str).apply(lambda c: c.str.strip().str.upper())
        fila_de = lambda v: next(i for i in d.index if (texto.loc[i] == v).any())
        if anio <= 2016:
            tot = d[texto[0].str.match(rf"TOTAL PA[IÍ]S\s*{anio}")].iloc[0]
            filas.append({"anio": anio, "provincia": "Total", "tipo": "total", "pet_comprobadas": tot[2], "gas_comprobadas": tot[3],
                          "pet_probables": tot[4], "gas_probables": tot[5]})
            continue
        bloque, categoria, fluido = (texto.loc[fila_de(v)].where(texto.loc[fila_de(v)] != "NAN").ffill() for v in ("CONVENCIONAL", "COMPROBADAS", "PET"))
        inicio = fila_de("OPERADOR") + 1
        datos = d.loc[inicio:][d.loc[inicio:, 1].notna() & d.loc[inicio:, 2].notna()]
        for b, t in (("CONVENCIONAL", "convencional"), ("NO CONVENCIONAL", "no_convencional")):
            fila = {}
            for cat in ("COMPROBADAS", "PROBABLES"):
                for fl, pre in (("PET", "pet"), ("GAS", "gas")):
                    col = [c for c in d.columns if bloque[c] == b and categoria[c] == cat and fluido[c] == fl]
                    if len(col) != 1:
                        raise ValueError(f"reservas {anio}: no se encontró la columna {b} {cat} {fl}")
                    fila[f"{pre}_{cat.lower()}"] = pd.to_numeric(datos[col[0]], errors="coerce").fillna(0)
            prov = datos[2].astype(str).str.strip()
            por_prov = pd.DataFrame(fila).groupby(prov).sum()
            for pv, v in por_prov.iterrows():
                filas.append({"anio": anio, "provincia": pv, "tipo": t, **v.to_dict()})
    res = pd.DataFrame(filas)
    if res.anio.nunique() < 15:
        raise ValueError("faltan años de reservas")
    res.round(3).to_csv(CRUDO / "se_reservas_resumen.csv", index=False)
    return f"{SE} reservas {res.anio.min()} a {res.anio.max()}"


def oede_empleo():
    """Observatorio de Empleo y Dinámica Empresarial (Ministerio de Capital Humano): asalariados registrados del sector privado por
    provincia y rama de actividad (CIIU revisión 3 a dos dígitos), trimestral desde 1996, con base en el SIPA. Una hoja por provincia
    (Buenos Aires viene separada en partidos del GBA y resto). Se guardan solo construcción (sección F), extracción de petróleo y gas
    (rama 11) y el total de cada provincia (oede_empleo_ramas.csv). El nombre del Excel cambia con cada edición: se lee de la página."""
    import io, pandas as pd
    pagina = leer("https://www.argentina.gob.ar/trabajo/estadisticas/oede-estadisticas-provinciales", 60).decode("utf-8", "ignore")
    enlace = re.search(r'href="(/sites/default/files/provinciales_serie_empleo_trimestral_2dig[^"]*\.xlsx)"', pagina)
    if not enlace:
        raise ValueError("no se encontró la serie de empleo por rama en la página del OEDE")
    x = pd.ExcelFile(io.BytesIO(leer("https://www.argentina.gob.ar" + enlace.group(1), 300)))
    filas = []
    for hoja in x.sheet_names:
        if hoja in ("Carátula", "Indice", "Descriptores de actividad"):
            continue
        d = pd.read_excel(x, hoja, header=None)
        trims = {j: v for j, v in d.iloc[3].items() if isinstance(v, str) and "Trim" in v}
        if not trims:
            continue
        cod = d[0].astype(str).str.strip()
        sel = {"construccion": cod.eq("F"), "petroleo_gas": cod.eq("11"), "total": d[1].astype(str).str.strip().str.upper().eq("TOTAL")}
        for rama, m in sel.items():
            if m.sum() != 1:
                raise ValueError(f"OEDE {hoja}: no se encontró una única fila de {rama}")
            f = d[m].iloc[0]
            for j, tr in trims.items():
                n, a = re.match(r"(\d)\D+(\d{4})", tr).groups()
                filas.append({"hoja": hoja, "rama": rama, "anio": int(a), "trimestre": int(n), "valor": f[j]})
    out = pd.DataFrame(filas)
    out["valor"] = pd.to_numeric(out.valor, errors="coerce")  # "s.d.": secreto estadístico
    if out.hoja.nunique() < 25:
        raise ValueError("faltan provincias en el empleo por rama del OEDE")
    out.to_csv(CRUDO / "oede_empleo_ramas.csv", index=False)
    return "https://www.argentina.gob.ar" + enlace.group(1)


def eia_internacional():
    """Producción de petróleo crudo (con condensado, miles de barriles por día) y de gas natural seco (miles de millones de m3) de
    cada país, según las estadísticas internacionales de energía de la Administración de Información Energética de los Estados
    Unidos (EIA, archivo masivo INTL.zip, de dominio público, unos 24 MB). Se guardan solo esas dos series de los países (no los
    agregados regionales) desde 1990 (eia_produccion_paises.csv)."""
    import io, zipfile
    z = zipfile.ZipFile(io.BytesIO(leer("https://www.eia.gov/opendata/bulk/INTL.zip", 300)))
    filas = []
    with z.open(z.namelist()[0]) as f:
        for linea in f:
            s = json.loads(linea)
            sid = s.get("series_id", "")
            var = "crudo_kbd" if sid.startswith("INTL.57-1-") and sid.endswith("-TBPD.A") else \
                  "gas_bcm" if sid.startswith("INTL.26-1-") and sid.endswith("-BCM.A") else None
            iso = sid.split("-")[2] if var else ""
            if not var or len(iso) != 3:
                continue
            nombre = s.get("name", "").split(", ")[1] if ", " in s.get("name", "") else iso
            for anio, valor in s.get("data") or []:
                if isinstance(valor, (int, float)) and int(anio) >= 1990:
                    filas.append([iso, nombre, var, int(anio), valor])
    if len({f[0] for f in filas}) < 150:
        raise ValueError("formato inesperado en el archivo de la EIA")
    with open(CRUDO / "eia_produccion_paises.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["iso3", "nombre", "variable", "anio", "valor"])
        w.writerows(filas)
    return "https://www.eia.gov/opendata/bulk/INTL.zip"



def pozos_no_convencionales():
    """Producción mensual de cada pozo no convencional desde 2006 (Capítulo IV de la Resolución SE 319/1993, Secretaría de Energía,
    unos 150 MB): se baja a memoria y se guardan dos resúmenes chicos (etapa 19).
    - se_pozos_nc.csv: una fila por pozo, con su ubicación, empresa, área, provincia, formación, tipo (shale o tight, petrolífero o
      gasífero), el primer y el último mes con producción, la producción del último mes y la de sus primeros doce meses. Algunas
      coordenadas vienen con la latitud y la longitud cambiadas: se corrigen (en la Argentina la longitud va de -74 a -53).
    - se_pozos_nc_cosechas.csv: para los pozos de shale de Vaca Muerta, la producción acumulada promedio por pozo según el año en
      que empezaron a producir y los meses desde ese inicio (1 a 60), contando también los meses sin producción."""
    import io, pandas as pd, numpy as np
    recursos = json.loads(leer(f"{SE}/api/3/action/package_show?id={SE_POZO}", 60))["result"]["resources"]
    u = next(x["url"] for x in recursos if "pozos de gas y petróleo no convencional" in x["name"].lower()).replace("https://", "http://")
    datos = leer(u, 900)
    if not datos.lstrip(b"\xef\xbb\xbf").startswith(b"idempresa,anio,mes,idpozo"):
        raise ValueError("formato inesperado en la producción por pozo no convencional")
    d = pd.read_csv(io.BytesIO(datos), low_memory=False, usecols=["anio", "mes", "idpozo", "prod_pet", "prod_gas", "tipopozo", "formprod",
        "sub_tipo_recurso", "empresa", "sigla", "areapermisoconcesion", "idareapermisoconcesion", "provincia", "coordenadax", "coordenaday"])
    d["t"] = d.anio * 12 + d.mes - 1  # meses corridos desde el año 0
    d = d.sort_values(["idpozo", "t"])
    prod = d[(d.prod_pet > 0) | (d.prod_gas > 0)]
    ini, fin = prod.groupby("idpozo").t.min(), prod.groupby("idpozo").t.max()
    ultimo = int(d.t.max())
    d["k"] = d.t - d.idpozo.map(ini)  # meses desde el inicio (0 = el primer mes con producción)
    p12 = d[d.k.between(0, 11)].groupby("idpozo")[["prod_pet", "prod_gas"]].sum()
    um = d[d.t == ultimo].set_index("idpozo")[["prod_pet", "prod_gas"]]
    w = d.groupby("idpozo").agg(sigla=("sigla", "last"), empresa=("empresa", "last"), area=("areapermisoconcesion", "last"), area_id=("idareapermisoconcesion", "last"), provincia=("provincia", "last"),
        formacion=("formprod", "last"), subtipo=("sub_tipo_recurso", "last"), tipo_pozo=("tipopozo", "last"), x=("coordenadax", "first"), y=("coordenaday", "first"),
        acum_pet_m3=("prod_pet", "sum"), acum_gas_miles_m3=("prod_gas", "sum"))
    cambiadas = (w.x > -53) & (w.y < -53)
    w.loc[cambiadas, ["x", "y"]] = w.loc[cambiadas, ["y", "x"]].values
    w = w.join(ini.rename("t_ini")).join(fin.rename("t_fin")).dropna(subset=["t_ini"])
    w["inicio"] = [f"{int(t) // 12}-{int(t) % 12 + 1:02d}" for t in w.t_ini]
    w["ultimo_mes"] = [f"{int(t) // 12}-{int(t) % 12 + 1:02d}" for t in w.t_fin]
    w["meses_historia"] = ultimo - w.t_ini + 1
    w = w.join(p12.rename(columns={"prod_pet": "pet_12m_m3", "prod_gas": "gas_12m_miles_m3"})).join(
        um.rename(columns={"prod_pet": "pet_ult_m3", "prod_gas": "gas_ult_miles_m3"})).fillna({"pet_ult_m3": 0, "gas_ult_miles_m3": 0})
    w.loc[w.meses_historia < 12, ["pet_12m_m3", "gas_12m_miles_m3"]] = np.nan  # sin doce meses de historia no hay primer año completo
    if len(w) < 4000 or not (w.x.between(-74, -53) & w.y.between(-56, -21)).mean() > .99:
        raise ValueError("la producción por pozo no convencional no tiene los pozos o las coordenadas esperados")
    w = w.drop(columns=["t_ini", "t_fin"]).reset_index()
    w.round({"x": 5, "y": 5, "acum_pet_m3": 1, "acum_gas_miles_m3": 1, "pet_12m_m3": 1, "gas_12m_miles_m3": 1, "pet_ult_m3": 1, "gas_ult_miles_m3": 1}).to_csv(
        CRUDO / "se_pozos_nc.csv", index=False)
    # producción acumulada promedio de los pozos de shale de Vaca Muerta, por año de inicio y meses desde el inicio
    vm = w[w.formacion.str.upper().eq("VMUT") & w.subtipo.eq("SHALE")].set_index("idpozo")
    c = d[d.idpozo.isin(vm.index) & d.k.between(0, 59)].copy()
    c["cosecha"] = c.idpozo.map(ini) // 12
    c["tipo_pozo"] = c.idpozo.map(vm.tipo_pozo)
    c = c.sort_values(["idpozo", "k"])
    c["acum_pet"], c["acum_gas"] = c.groupby("idpozo").prod_pet.cumsum(), c.groupby("idpozo").prod_gas.cumsum()
    filas = []
    for (cos, tp), g in c.groupby(["cosecha", "tipo_pozo"]):
        n_pozos = g.idpozo.nunique()
        for k in range(60):
            # solo los pozos que ya tienen k + 1 meses de historia, para no promediar pozos que todavía no llegaron a ese mes
            elegibles = [p for p in g.idpozo.unique() if ultimo - ini[p] >= k]
            if len(elegibles) < max(5, .8 * n_pozos):
                break
            # un pozo sin fila en ese mes (sin declaración) arrastra su acumulado anterior
            prev = g[g.k <= k].groupby("idpozo")[["acum_pet", "acum_gas"]].last().reindex(elegibles).fillna(0)
            filas.append({"cosecha": int(cos), "tipo_pozo": tp, "mes": k + 1, "pozos": len(elegibles),
                          "acum_pet_m3": prev.acum_pet.mean(), "acum_gas_miles_m3": prev.acum_gas.mean()})
    pd.DataFrame(filas).round(1).to_csv(CRUDO / "se_pozos_nc_cosechas.csv", index=False)
    return f"{SE} producción por pozo no convencional ({len(w):,} pozos)"



def centrales_electricas():
    """Listado de centrales de generación eléctrica de la Secretaría de Energía (con datos de CAMMESA): nombre, tecnología, potencia,
    provincia, departamento, sistema y ubicación de cada una (etapa 19). El archivo no trae fecha: se guarda la de su última
    actualización en el catálogo (se_centrales_meta.json). El SHP y el CSV tienen el mismo nombre: se elige por formato."""
    recursos = json.loads(leer(f"{SE}/api/3/action/package_show?id=generacion-electrica-centrales-de-generacion-", 60))["result"]["resources"]
    r = next(x for x in recursos if (x.get("format") or "").upper() == "CSV")
    datos = leer(r["url"].replace("https://", "http://"), 120)
    if not datos.lstrip(b"\xef\xbb\xbf").startswith(b"nombre,central,tecnologia_etiqueta"):
        raise ValueError("formato inesperado en el listado de centrales")
    (CRUDO / "se_centrales.csv").write_bytes(datos)
    (CRUDO / "se_centrales_meta.json").write_text(json.dumps({"actualizado": (r.get("last_modified") or r.get("created") or "")[:10]}), encoding="utf-8")
    return r["url"]


registro = []
for _nombre, _f in [("votaciones nominales", votaciones), ("exportaciones por semestre", opex_semestre), ("seguridad social (BESS)", bess),
                    ("EPH antiguedad en el empleo", eph_antiguedad), ("empresas por provincia (OEDE)", oede_empresas),
                    ("petróleo y gas (resúmenes del Capítulo IV)", hidrocarburos), ("reservas de petróleo y gas", reservas_hidrocarburos),
                    ("empleo por rama y provincia (OEDE)", oede_empleo), ("producción de petróleo y gas por país (EIA)", eia_internacional),
                    ("producción por pozo no convencional", pozos_no_convencionales),
                    ("centrales de generación eléctrica", centrales_electricas)]:
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
