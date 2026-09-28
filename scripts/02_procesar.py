"""
Paso 2. Ordena los datos y arma las fichas.
Lee datos/crudo/, escribe:
  datos/ordenado/tabla_larga.csv   todas las series en un solo formato
  sitio/datos/fichas.json          lo que dibuja el sitio
  sitio/datos/<ficha>.csv          la tabla de cada ficha, para descargar
Uso: python scripts/02_procesar.py
"""
import io, json, pathlib, re, unicodedata, zipfile
import pandas as pd

RAIZ = pathlib.Path(__file__).resolve().parents[1]
CRUDO = RAIZ / "datos" / "crudo"
ORDEN = RAIZ / "datos" / "ordenado"
SITIO = RAIZ / "sitio" / "datos"
ORDEN.mkdir(parents=True, exist_ok=True)
SITIO.mkdir(parents=True, exist_ok=True)

largo = []  # filas: codigo_indec, territorio, periodo, variable, valor, unidad, fuente


def agregar(df, variable, unidad, fuente):
    d = df.copy()
    d["variable"], d["unidad"], d["fuente"] = variable, unidad, fuente
    largo.append(d[["codigo_indec", "territorio", "periodo", "variable", "valor", "unidad", "fuente"]])


# Nombres y codigos INDEC de provincia (tomados del SNIC, que usa la codificacion oficial)
snic_prov = pd.read_csv(CRUDO / "snic_provincias.csv", sep=";", decimal=",", dtype={"provincia_id": str})
NOMBRE = (snic_prov[["provincia_id", "provincia_nombre"]].drop_duplicates()
          .set_index("provincia_id").provincia_nombre.to_dict())
NOMBRE["94"] = "Tierra del Fuego"
CORTO = {**NOMBRE, "02": "CABA"}

# ---------------------------------------------------------------- poblacion
# Poblacion 2025 implicita en las tasas del SNIC (cantidad / tasa x 100.000).
# El SNIC calcula sus tasas con las proyecciones de poblacion del INDEC.
h = snic_prov[(snic_prov.codigo_delito_snic_nombre == "Hurtos") & (snic_prov.anio == 2025)].copy()
h["pob"] = h.cantidad_hechos / h.tasa_hechos * 1e5
POB = h.set_index("provincia_id").pob.to_dict()

# ---------------------------------------------------------------- energia
e = pd.read_csv(CRUDO / "energia_emae.csv", parse_dates=["indice_tiempo"])
e["anio"] = e.indice_tiempo.dt.year
anual = (e[e.anio.between(2005, 2025)].groupby("anio")
         .agg(total=("demanda_total", "sum"), residencial=("demanda_residencial", "sum"),
              emae=("emae_original", "mean")).reset_index())
anual["resto"] = anual.total - anual.residencial
anual["pct_residencial"] = anual.residencial / anual.total * 100
base = anual.iloc[0]
anual["idx_demanda"] = anual.total / base.total * 100
anual["idx_emae"] = anual.emae / base.emae * 100
anual["idx_residencial"] = anual.residencial / base.residencial * 100
anual["idx_resto"] = anual.resto / base.resto * 100

for col, var, uni in [("total", "demanda_electrica_total", "GWh"),
                      ("residencial", "demanda_electrica_residencial", "GWh"),
                      ("emae", "emae_promedio_anual", "indice 2004=100")]:
    d = anual[["anio", col]].rename(columns={"anio": "periodo", col: "valor"})
    d["codigo_indec"], d["territorio"] = "00", "Argentina"
    agregar(d, var, uni, "Secretaria de Energia / INDEC, API Series de Tiempo")

ult = e.dropna(subset=["demanda_total"]).iloc[-1]
perfil = (e[e.anio.between(2023, 2025)].groupby(e.indice_tiempo.dt.month)
          .demanda_total.mean().reset_index().rename(columns={"indice_tiempo": "mes", "demanda_total": "gwh"}))

# ---------------------------------------------------------------- nacimientos
r = pd.read_csv(CRUDO / "renaper_nacimientos.csv")
# RENAPER deja sin codigo a algunas provincias: se completa a partir del nombre
SIN_CODIGO = {"Cordoba": 14, "Entre Rios": 30, "Neuquen": 58, "Rio Negro": 62, "Tucuman": 90}
r["provincia_id"] = r.provincia_id.fillna(r.provincia_nombre.map(SIN_CODIGO))
assert r.provincia_id.notna().all(), "Hay provincias de RENAPER sin codigo INDEC"
ADO = ["10-14", "15-19"]
nac = r.groupby("anio").cantidad.sum()
nac_ado = r[r.grupo_etario_madre.isin(ADO)].groupby("anio").cantidad.sum()
nac_df = pd.DataFrame({"anio": nac.index, "nacimientos": nac.values,
                       "madres_menores_20": nac_ado.values})
nac_df["pct_madres_menores_20"] = nac_df.madres_menores_20 / nac_df.nacimientos * 100

tot_p = r.groupby(["provincia_id", "anio"]).cantidad.sum()
ado_p = r[r.grupo_etario_madre.isin(ADO)].groupby(["provincia_id", "anio"]).cantidad.sum()
pp = (ado_p / tot_p * 100).rename("pct").reset_index()
pp["provincia_id"] = pp.provincia_id.astype(int).map(lambda x: f"{x:02d}")
ado_prov = pp.pivot(index="provincia_id", columns="anio", values="pct")[[2012, 2024]].reset_index()
ado_prov.columns = ["codigo_indec", "pct_2012", "pct_2024"]
ado_prov["territorio"] = ado_prov.codigo_indec.map(CORTO)

d = nac_df.rename(columns={"anio": "periodo", "nacimientos": "valor"})
d["codigo_indec"], d["territorio"] = "00", "Argentina"
agregar(d, "nacimientos", "personas", "RENAPER")
d = pp.rename(columns={"provincia_id": "codigo_indec", "anio": "periodo", "pct": "valor"})
d["territorio"] = d.codigo_indec.map(CORTO)
agregar(d, "pct_nacimientos_madres_menores_20", "%", "RENAPER")

# ---------------------------------------------------------------- SNIC
sp = pd.read_csv(CRUDO / "snic_pais.csv", sep=";", decimal=",")
MAP = {"Suicidios (consumados)": "suicidios", "Homicidios dolosos": "homicidios",
       "Muertes en accidentes viales": "siniestros_viales"}
sp = sp[sp.codigo_delito_snic_nombre.isin(MAP)].copy()
sp["k"] = sp.codigo_delito_snic_nombre.map(MAP)
muertes = sp.pivot(index="anio", columns="k", values="cantidad_victimas").reset_index()
tasa_sui = sp[sp.k == "suicidios"][["anio", "tasa_victimas", "tasa_victimas_masc", "tasa_victimas_fem",
                                     "cantidad_victimas"]].rename(columns={
    "tasa_victimas": "tasa", "tasa_victimas_masc": "tasa_varones",
    "tasa_victimas_fem": "tasa_mujeres", "cantidad_victimas": "casos"})
# Antes de 2017 el SNIC no registra el sexo de las victimas de forma completa: esas tasas quedan vacias.
tasa_sui.loc[tasa_sui.anio < 2017, ["tasa_varones", "tasa_mujeres"]] = None
for k in MAP.values():
    d = muertes[["anio", k]].rename(columns={"anio": "periodo", k: "valor"})
    d["codigo_indec"], d["territorio"] = "00", "Argentina"
    agregar(d, f"victimas_{k}", "personas", "SNIC, Ministerio de Seguridad")

sui_p = snic_prov[snic_prov.codigo_delito_snic_nombre == "Suicidios (consumados)"]
ANIO_SNIC = int(sui_p.anio.max())
sui_prov = (sui_p[sui_p.anio == ANIO_SNIC][["provincia_id", "cantidad_victimas", "tasa_victimas"]]
            .rename(columns={"provincia_id": "codigo_indec", "cantidad_victimas": "casos", "tasa_victimas": "tasa"}))
sui_prov["territorio"] = sui_prov.codigo_indec.map(CORTO)
d = sui_p[["provincia_id", "anio", "tasa_victimas"]].rename(
    columns={"provincia_id": "codigo_indec", "anio": "periodo", "tasa_victimas": "valor"})
d["territorio"] = d.codigo_indec.map(CORTO)
agregar(d, "tasa_suicidios_100mil", "por 100.000 hab.", "SNIC, Ministerio de Seguridad")

# Edad y sexo. Deliberadamente solo se leen estas columnas de la base SAT.
sat = pd.read_csv(CRUDO / "snic_sat_suicidios.csv", sep=None, engine="python",
                  usecols=["anio", "suicida_sexo", "suicida_tr_edad"])
sat = sat[sat.suicida_tr_edad != "Sin determinar"]
sat["edad"] = sat.suicida_tr_edad.replace({"5-9": "Menos de 15", "10-14": "Menos de 15",
                                           "80-84": "80 y más", "85-89": "80 y más", "90 y más": "80 y más"})
ORDEN_EDAD = ["Menos de 15", "15-19", "20-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50-54",
              "55-59", "60-64", "65-69", "70-74", "75-79", "80 y más"]
sat = sat[sat.suicida_sexo.isin(["Masculino", "Femenino"])]
edad = pd.crosstab(sat.edad, sat.suicida_sexo).reindex(ORDEN_EDAD).reset_index()
edad.columns = ["edad", "mujeres", "varones"]
n_sat = int(edad[["mujeres", "varones"]].sum().sum())
edad["pct_mujeres"] = edad.mujeres / n_sat * 100
edad["pct_varones"] = edad.varones / n_sat * 100
pct_jovenes = edad[edad.edad.isin(["15-19", "20-24", "25-29"])][["mujeres", "varones"]].sum().sum() / n_sat * 100
pct_varones = edad.varones.sum() / n_sat * 100

# ---------------------------------------------------------------- empleo
s = pd.read_csv(CRUDO / "sipa_provincias.csv", parse_dates=["indice_tiempo"])
COL = {"caba": "02", "buenos_aires": "06", "catamarca": "10", "chaco": "22", "chubut": "26",
       "cordoba": "14", "corrientes": "18", "entre_rios": "30", "formosa": "34", "jujuy": "38",
       "la_pampa": "42", "la_rioja": "46", "mendoza": "50", "misiones": "54", "neuquen": "58",
       "rio_negro": "62", "salta": "66", "san_juan": "70", "san_luis": "74", "santa_cruz": "78",
       "santa_fe": "82", "santiago_estero": "86", "tierra_fuego": "94", "tucuman": "90"}
s = s.rename(columns={c: COL[c.replace("asalariados_priv_", "")] for c in s.columns if c != "indice_tiempo"})
s = s.dropna(how="all", subset=list(COL.values()))
fin = s.indice_tiempo.max()
hace12 = fin - pd.DateOffset(years=1)
emp = pd.DataFrame({"codigo_indec": list(COL.values())})
emp["miles"] = emp.codigo_indec.map(s.set_index("indice_tiempo").loc[fin])
emp["miles_hace12"] = emp.codigo_indec.map(s.set_index("indice_tiempo").loc[hace12])
emp["poblacion"] = emp.codigo_indec.map(POB)
emp["cada_100"] = emp.miles * 1000 / emp.poblacion * 100
emp["var_12m"] = (emp.miles / emp.miles_hace12 - 1) * 100
emp["territorio"] = emp.codigo_indec.map(CORTO)
tot_emp = emp.miles.sum() * 1000
tot_pob = emp.poblacion.sum()
var_nac = (emp.miles.sum() / emp.miles_hace12.sum() - 1) * 100

sl = s.melt(id_vars="indice_tiempo", var_name="codigo_indec", value_name="valor")
sl["periodo"] = sl.indice_tiempo.dt.strftime("%Y-%m")
sl["territorio"] = sl.codigo_indec.map(CORTO)
agregar(sl, "asalariados_privados_registrados", "miles", "SIPA, SSPM, API Series de Tiempo")

# ---------------------------------------------------------------- mortalidad infantil
# Defunciones de menores de un anio por cada 1.000 nacidos vivos (DEIS). Una columna por jurisdiccion.
mi = pd.read_csv(CRUDO / "deis_mortalidad_infantil.csv", encoding="utf-8-sig")
mi["anio"] = mi.indice_tiempo.astype(str).str[-4:].astype(int)
COL_MI = {"argentina": "00", "caba": "02", "buenosaires": "06", "catamarca": "10", "cordoba": "14",
          "corrientes": "18", "chaco": "22", "chubut": "26", "entrerios": "30", "formosa": "34", "jujuy": "38",
          "lapampa": "42", "larioja": "46", "mendoza": "50", "misiones": "54", "neuquen": "58", "rionegro": "62",
          "salta": "66", "sanjuan": "70", "sanluis": "74", "santacruz": "78", "santafe": "82",
          "santiagodelestero": "86", "tucuman": "90", "tierradelfuego": "94"}
mi = mi.rename(columns={c: COL_MI[c.replace("mortalidad_infantil_", "")] for c in mi.columns
                        if c.startswith("mortalidad_infantil_")})
assert set(COL_MI.values()) <= set(mi.columns), "Falta alguna jurisdiccion en el archivo de la DEIS"
mil = mi.melt(id_vars="anio", value_vars=list(COL_MI.values()), var_name="codigo_indec", value_name="valor").dropna()
mil["periodo"] = mil.anio
mil["territorio"] = mil.codigo_indec.map({**CORTO, "00": "Argentina"})
agregar(mil, "tasa_mortalidad_infantil", "por 1.000 nacidos vivos", "DEIS, Ministerio de Salud")

# En provincias con pocos nacimientos la tasa anual salta mucho de un anio a otro.
# Por eso la comparacion provincial usa el promedio de tres anios (como hace la DEIS).
ANIO_MI = int(mi.anio.max())
TRI_ACT, TRI_BASE = [ANIO_MI - 2, ANIO_MI], [ANIO_MI - 12, ANIO_MI - 10]
prom = lambda a, b: mi[mi.anio.between(a, b)][list(COL_MI.values())].mean()
p_act, p_base = prom(*TRI_ACT), prom(*TRI_BASE)
mi_prov = pd.DataFrame({"codigo_indec": [c for c in COL_MI.values() if c != "00"]})
mi_prov["territorio"] = mi_prov.codigo_indec.map(CORTO)
mi_prov["tmi_base"] = mi_prov.codigo_indec.map(p_base)
mi_prov["tmi_actual"] = mi_prov.codigo_indec.map(p_act)
mi_prov["tmi_ultimo_anio"] = mi_prov.codigo_indec.map(mi.set_index("anio").loc[ANIO_MI])
mi_pais = mi.set_index("anio")["00"]

# ---------------------------------------------------------------- SUBE
# Tarjetas distintas que registraron al menos un viaje cada dia (Ministerio de Transporte).
sube = pd.read_csv(CRUDO / "sube_usuarios_dia.csv", parse_dates=["indice_tiempo"])
sube = sube[sube.indice_tiempo.dt.dayofweek < 5].copy()  # solo dias habiles (lunes a viernes)
sube["mes"] = sube.indice_tiempo.dt.to_period("M")
ULT_DIA = pd.read_csv(CRUDO / "sube_usuarios_dia.csv", parse_dates=["indice_tiempo"]).indice_tiempo.max()
# Solo meses completos: si el ultimo mes todavia no termino, queda afuera
if ULT_DIA < ULT_DIA + pd.offsets.MonthEnd(0):
    sube = sube[sube.mes < ULT_DIA.to_period("M")]
# La mediana de los dias habiles evita que feriados o paros bajen el promedio
MODOS = ["total", "colectivo", "tren", "subte", "lancha"]
sube_m = sube.groupby("mes")[MODOS].median().reset_index()
sube_m["anio"], sube_m["n_mes"] = sube_m.mes.dt.year, sube_m.mes.dt.month
sube_m["t"] = sube_m.anio + (sube_m.n_mes - 1) / 12
sube_m["periodo"] = sube_m.mes.astype(str)
# Referencia previa a la pandemia: dias habiles del 2 al 13 de marzo de 2020, antes del aislamiento
pre_modos = sube[sube.indice_tiempo.between("2020-03-02", "2020-03-13")][MODOS].median()
pre = pre_modos.total
d = sube_m[["periodo", "total"]].rename(columns={"total": "valor"})
d["codigo_indec"], d["territorio"] = "00", "Argentina"
agregar(d, "tarjetas_sube_dia_habil_mediana", "tarjetas", "Ministerio de Transporte, datos abiertos")
su, su_prev = sube_m.iloc[-1], sube_m[sube_m.mes == sube_m.mes.iloc[-1] - 12]

# ---------------------------------------------------------------- educacion
# Las fuentes educativas identifican a las provincias solo por nombre, con grafias variables
def norm(t):
    t = unicodedata.normalize("NFKD", str(t)).encode("ascii", "ignore").decode().lower()
    return re.sub(r"\s+", " ", t).strip()
COD_NOMBRE = {norm(v): k for k, v in NOMBRE.items()}
COD_NOMBRE.update({"ciudad de buenos aires": "02", "ciudad autonoma de buenos aires": "02", "caba": "02",
                   "tierra del fuego": "94", "tierra del fuego, antartida e islas del atlantico sur": "94",
                   "total pais": "00"})
codigo = lambda t: COD_NOMBRE.get(norm(t))

# PISA: Argentina y promedio de los paises de la OCDE (OCDE, via Our World in Data)
pz = pd.read_csv(CRUDO / "pisa_owid.csv")
AREAS = {"pisa_math_all_average": "mat", "pisa_reading_all_average": "lec", "pisa_science_all_average": "cie"}
arg_p = pz[pz.code == "ARG"].set_index("year")[list(AREAS)].rename(columns=AREAS)
ocde_p = pz[pz.entity == "OECD average"].set_index("year")[list(AREAS)].rename(columns=AREAS)
pisa = arg_p.add_prefix("arg_").join(ocde_p.add_prefix("ocde_"), how="left").reset_index().rename(columns={"year": "anio"})
# La OCDE excluyo de las comparaciones el resultado nacional de 2015 por la cobertura de la muestra
pisa["arg_comparable"] = pisa.anio != 2015
for area in AREAS.values():
    pisa[f"arg_{area}_grafico"] = pisa[f"arg_{area}"].where(pisa.arg_comparable)
for area, nombre_area in [("mat", "matematica"), ("lec", "lectura"), ("cie", "ciencias")]:
    d = pisa[["anio", f"arg_{area}"]].rename(columns={"anio": "periodo", f"arg_{area}": "valor"}).dropna()
    d["codigo_indec"], d["territorio"] = "00", "Argentina"
    agregar(d, f"pisa_puntaje_{nombre_area}", "puntos", "OCDE PISA, via Our World in Data")
ANIO_PISA = int(pisa.anio.max())
pu, pp_prev = pisa[pisa.anio == ANIO_PISA].iloc[0], pisa[pisa.arg_comparable & (pisa.anio < ANIO_PISA)].iloc[-1]

# Tasa neta de escolarizacion secundaria por provincia (Ministerio de Educacion, DiNIEE)
with zipfile.ZipFile(CRUDO / "educ_escolarizacion.zip") as z:
    xl = next(n for n in z.namelist() if n.lower().endswith(".xlsx"))
    hoja = pd.read_excel(io.BytesIO(z.read(xl)), sheet_name="Tasa neta escol Secun", header=None)
fila_anios = hoja.index[hoja[0].astype(str).str.contains("Territorial", na=False)][0]
anios = hoja.loc[fila_anios, 2:].dropna().astype(int)
esc = hoja.loc[fila_anios + 1:, [0] + list(anios.index)].copy()
esc.columns = ["nombre"] + anios.tolist()
esc["codigo_indec"] = esc.nombre.map(codigo)
esc = esc.dropna(subset=["codigo_indec"])
assert esc.codigo_indec.nunique() == 25, "Faltan jurisdicciones en la tasa de escolarizacion"
esc_l = esc.melt(id_vars=["nombre", "codigo_indec"], var_name="periodo", value_name="valor").dropna(subset=["valor"])
esc_l["valor"] = esc_l.valor.astype(float)
esc_l["territorio"] = esc_l.codigo_indec.map({**CORTO, "00": "Argentina"})
agregar(esc_l, "tasa_neta_escolarizacion_secundaria", "%", "Ministerio de Educacion, DiNIEE")
ESC_INI, ESC_FIN = int(anios.min()), int(anios.max())
esc_prov = esc[esc.codigo_indec != "00"][["codigo_indec", ESC_INI, ESC_FIN]].rename(columns={ESC_INI: "tasa_inicio", ESC_FIN: "tasa_final"})
esc_prov[["tasa_inicio", "tasa_final"]] = esc_prov[["tasa_inicio", "tasa_final"]].astype(float)
esc_prov["territorio"] = esc_prov.codigo_indec.map(CORTO)
esc_pais = esc[esc.codigo_indec == "00"].iloc[0]

# Aprender: estudiantes de 6 grado por nivel de desempeno (Ministerio de Educacion)
meta_ap = json.loads((CRUDO / "aprender_meta.json").read_text(encoding="utf-8"))
def aprender(archivo, pref):
    d = pd.read_csv(CRUDO / archivo, sep=";", encoding="utf-8-sig", low_memory=False)
    cols = [c for c in d.columns if c.startswith(pref + "desemp_")]
    for c in cols:  # decimales con coma y celdas vacias con un espacio
        d[c] = pd.to_numeric(d[c].astype(str).str.strip().str.replace(",", "."), errors="coerce")
    g = d.groupby("jurisdiccion")[cols].sum()
    g.loc["Total pais"] = g.sum()
    niv = {c: norm(c.split("desemp_")[1].replace("_", " ")) for c in cols}
    logra = [c for c in cols if niv[c] in ("satisfactorio", "avanzado")]
    debajo = [c for c in cols if niv[c].startswith("por debajo")]
    assert len(logra) == 2 and len(debajo) == 1, "Cambiaron los niveles de desempeno de Aprender"
    t = g.sum(axis=1)
    return pd.DataFrame({"logra": g[logra].sum(axis=1) / t * 100, "debajo": g[debajo].sum(axis=1) / t * 100})
ap_m, ap_l = aprender("aprender_primaria_matematica.csv", "m"), aprender("aprender_primaria_lengua.csv", "l")
ap = ap_m.add_prefix("mat_").join(ap_l.add_prefix("len_")).reset_index().rename(columns={"jurisdiccion": "nombre"})
ap["codigo_indec"] = ap.nombre.map(codigo)
assert ap.codigo_indec.notna().all() and len(ap) == 25, "Hay jurisdicciones de Aprender sin codigo INDEC"
ap["territorio"] = ap.codigo_indec.map({**CORTO, "00": "Argentina"})
for col, var in [("mat_logra", "aprender_matematica_satisfactorio_o_avanzado"), ("len_logra", "aprender_lengua_satisfactorio_o_avanzado")]:
    d = ap[["codigo_indec", "territorio", col]].rename(columns={col: "valor"})
    d["periodo"] = meta_ap["anio"]
    agregar(d, var, "% de estudiantes de 6 grado", "Ministerio de Educacion, Aprender")
ap_pais = ap[ap.codigo_indec == "00"].iloc[0]
ap_prov = ap[ap.codigo_indec != "00"][["codigo_indec", "territorio", "mat_logra", "mat_debajo", "len_logra", "len_debajo"]]

# ---------------------------------------------------------------- naturaleza
COD_NOMBRE.update({"ciudad a. de buenos aires": "02", "total": "00"})
POB_PAIS = sum(POB.values())

# Superficie protegida por provincia: nacional, provincial y con designacion internacional (Ministerio de Ambiente, CIAM)
anio_ap = json.loads((CRUDO / "ciam_meta.json").read_text(encoding="utf-8"))["anio"]
apr = pd.read_csv(CRUDO / "ciam_areas_protegidas_provincias.csv", sep=";", dtype=str).dropna(how="all")
apr["codigo_indec"] = apr.jurisdicciones.map(codigo)
apr = apr.dropna(subset=["codigo_indec"])
for c in ["total_cantidad", "terrestre_ha", "porcentaje_terrestre_protegido"]:
    apr[c] = pd.to_numeric(apr[c], errors="coerce")
assert apr.codigo_indec.nunique() == 25, "Faltan jurisdicciones en las areas protegidas"
area = apr[apr.codigo_indec != "00"].rename(columns={"total_cantidad": "areas", "terrestre_ha": "ha_terrestres",
                                                     "porcentaje_terrestre_protegido": "pct_territorio"})
area["m2_por_habitante"] = area.ha_terrestres * 1e4 / area.codigo_indec.map(POB)
area["territorio"] = area.codigo_indec.map(CORTO)
area = area[["codigo_indec", "territorio", "areas", "ha_terrestres", "pct_territorio", "m2_por_habitante"]]
ap_tot = apr[apr.codigo_indec == "00"].iloc[0]
m2_pais = ap_tot.terrestre_ha * 1e4 / POB_PAIS
for col, var, uni in [("pct_territorio", "pct_territorio_protegido", "% de la superficie continental"),
                      ("m2_por_habitante", "m2_protegidos_por_habitante", "m2 por habitante")]:
    d = area[["codigo_indec", "territorio", col]].rename(columns={col: "valor"}); d["periodo"] = anio_ap
    agregar(d, var, uni, "Ministerio de Ambiente, CIAM")

# Areas protegidas nacionales con anio de creacion, superficie y especies (Sistema de Informacion de Biodiversidad)
sib = pd.DataFrame(json.loads((CRUDO / "sib_areas_protegidas.json").read_text(encoding="utf-8")))
apn = sib[sib.jurisdiccion == "APN"].copy()
apn["superficie"] = pd.to_numeric(apn.superficie, errors="coerce")
apn["anio"] = pd.to_numeric(apn.ano_creacion, errors="coerce").astype("Int64")
apn["marina"] = pd.to_numeric(apn.is_marina, errors="coerce").fillna(0).astype(int) == 1
apn["animales"] = apn.cant_especies.map(lambda x: (x or {}).get("animales", 0))
apn["plantas"] = apn.cant_especies.map(lambda x: (x or {}).get("plantas", 0))
apn["especies"] = apn.cant_especies.map(lambda x: (x or {}).get("total", 0))
apn = apn.dropna(subset=["anio", "superficie"])
anios_pn = range(int(apn.anio.min()), int(apn.anio.max()) + 1)
por_anio = apn.groupby(["anio", "marina"]).superficie.sum().unstack(fill_value=0).reindex(anios_pn, fill_value=0)
pn_hist = pd.DataFrame({"anio": list(anios_pn),
                        "ha_terrestres": por_anio.get(False, 0).cumsum().values,
                        "ha_marinas": por_anio.get(True, 0).cumsum().values,
                        "areas": apn.groupby("anio").size().reindex(anios_pn, fill_value=0).cumsum().values})
d = pn_hist[["anio", "ha_terrestres"]].rename(columns={"anio": "periodo", "ha_terrestres": "valor"})
d["codigo_indec"], d["territorio"] = "00", "Argentina"
agregar(d, "ha_terrestres_areas_protegidas_nacionales_acumuladas", "ha", "Sistema de Informacion de Biodiversidad (APN)")
terr = apn[~apn.marina]
mayor, primera, ultima = terr.sort_values("superficie").iloc[-1], apn.sort_values("anio").iloc[0], apn.sort_values("anio").iloc[-1]
def lugar(u, prov):
    """Provincias donde esta el area, con nombres oficiales (la fuente las escribe de formas distintas)."""
    partes = [codigo(x) for x in re.split(r"\s+y\s+|,", str(u or "")) if x.strip()]
    nombres = [CORTO[c] for c in partes if c and c != "00"]
    if not nombres and codigo(prov):
        nombres = [CORTO[codigo(prov)]]
    return " y ".join(dict.fromkeys(nombres)) or "Mar Argentino"
apn["lugar"] = [lugar(u, pv) for u, pv in zip(apn.ubicacion, apn.provincia)]
apn.loc[apn.marina, "lugar"] = "Mar Argentino"
terr = apn[~apn.marina]
pn_lista = (apn.sort_values(["anio", "nombre"])[["nombre", "caracter", "lugar", "anio", "superficie", "marina", "lat", "lng"]]
            .rename(columns={"superficie": "hectareas"}))
pn_lista["anio"] = pn_lista.anio.astype(int)
pn_lista["lat"], pn_lista["lng"] = pd.to_numeric(pn_lista.lat, errors="coerce"), pd.to_numeric(pn_lista.lng, errors="coerce")
esp = (terr.assign(nombre=terr.nombre.str.strip() + " (" + terr.lugar + ")").sort_values("animales", ascending=False).head(15)
       .rename(columns={"slug": "codigo_indec", "nombre": "territorio"})
       [["codigo_indec", "territorio", "caracter", "anio", "animales", "plantas", "especies"]])
esp["anio"] = esp.anio.astype(int)

# Visitas a parques nacionales (SINTA): solo anios completos
vp = pd.read_csv(CRUDO / "sinta_visitas_parques.csv", encoding="utf-8-sig")
vp["fecha"] = pd.to_datetime(vp.indice_tiempo, format="%Y-%m-%d")
vp["anio"], vp["mes"] = vp.fecha.dt.year, vp.fecha.dt.month
vt = vp.pivot_table(index=["anio", "mes"], columns="origen_visitantes", values="visitas", aggfunc="sum").reset_index()
completos = vt.groupby("anio").mes.count().pipe(lambda x: x[x == 12].index)
visitas = (vt[vt.anio.isin(completos)].groupby("anio")[["residentes", "no residentes", "total"]].sum().reset_index()
           .rename(columns={"no residentes": "no_residentes"}))
ult_vp = vt.iloc[-1]
meses_vp = int(ult_vp.mes)
ytd = vt[(vt.anio == ult_vp.anio) & (vt.mes <= meses_vp)].total.sum()
ytd_prev = vt[(vt.anio == ult_vp.anio - 1) & (vt.mes <= meses_vp)].total.sum()
d = visitas[["anio", "total"]].rename(columns={"anio": "periodo", "total": "valor"})
d["codigo_indec"], d["territorio"] = "00", "Argentina"
agregar(d, "visitas_parques_nacionales", "visitas", "SINTA, Ministerio de Turismo")

# ---------------------------------------------------------------- turismo
# Turistas no residentes que llegan al pais (SINTA)
tr = pd.read_csv(CRUDO / "sinta_turistas_no_residentes.csv", encoding="utf-8-sig", parse_dates=["indice_tiempo"])
trm = tr.groupby("indice_tiempo").viajes_de_turistas_no_residentes.sum()
tra = trm.groupby(trm.index.year).agg(["sum", "count"])
receptivo = tra[tra["count"] == 12]["sum"].rename("turistas").reset_index().rename(columns={"indice_tiempo": "anio"})
ult_tr = trm.index.max()
doce, doce_prev = trm.iloc[-12:].sum(), trm.iloc[-24:-12].sum()
provisorio = tr[tr.indice_tiempo == ult_tr].observaciones.astype(str).str.contains("provisorio", case=False).any()
d = receptivo.rename(columns={"anio": "periodo", "turistas": "valor"})
d["codigo_indec"], d["territorio"] = "00", "Argentina"
agregar(d, "turistas_no_residentes", "viajes de turistas", "SINTA, Ministerio de Turismo")

# Viajeros hospedados en hoteles y parahoteles por region (Encuesta de Ocupacion Hotelera)
eoh = pd.read_csv(CRUDO / "sinta_eoh_viajeros_region.csv", encoding="utf-8-sig", parse_dates=["indice_tiempo"])
eoh["anio"] = eoh.indice_tiempo.dt.year
meses_eoh = eoh.groupby("anio").indice_tiempo.nunique()
eoh_c = eoh[eoh.anio.isin(meses_eoh[meses_eoh == 12].index)]
hoteles = eoh_c.pivot_table(index="anio", columns="origen_viajeros", values="viajeros", aggfunc="sum").reset_index()
hoteles = hoteles.rename(columns={"Residentes": "residentes", "No residentes": "no_residentes"})
hoteles["total"] = hoteles.residentes + hoteles.no_residentes
ANIO_EOH = int(hoteles.anio.max())
reg = eoh_c[eoh_c.anio == ANIO_EOH].groupby("region_de_destino").viajeros.sum().sort_values(ascending=False)
ult_eoh = eoh.indice_tiempo.max()
d = hoteles[["anio", "total"]].rename(columns={"anio": "periodo", "total": "valor"})
d["codigo_indec"], d["territorio"] = "00", "Argentina"
agregar(d, "viajeros_hospedados_hoteles", "viajeros", "Encuesta de Ocupacion Hotelera, INDEC y SINTA")

# Turistas extranjeros que salen por Ezeiza y Aeroparque, segun la provincia que visitaron (Encuesta de Turismo Internacional)
eti = pd.read_csv(CRUDO / "sinta_eti_provincias.csv", encoding="utf-8-sig", parse_dates=["indice_tiempo"])
eti["anio"] = eti.indice_tiempo.dt.year
meses_eti = eti.groupby("anio").indice_tiempo.nunique()
ANIO_ETI = int(meses_eti[meses_eti == 12].index.max())
e_ = eti[(eti.anio == ANIO_ETI) & eti.destinos_visitados.isin(["Solo provincia", "Provincia y resto"])]
etp = e_.groupby("provincia_de_destino").turistas_no_residentes.sum().reset_index()
etp["codigo_indec"] = etp.provincia_de_destino.map(codigo)
etp = etp.dropna(subset=["codigo_indec"]).rename(columns={"turistas_no_residentes": "turistas"})
assert len(etp) == 24, "Faltan provincias en la Encuesta de Turismo Internacional"
etp["cada_1000"] = etp.turistas / etp.codigo_indec.map(POB) * 1000
etp["territorio"] = etp.codigo_indec.map(CORTO)
etp = etp[["codigo_indec", "territorio", "turistas", "cada_1000"]]
d = etp[["codigo_indec", "territorio", "turistas"]].rename(columns={"turistas": "valor"}); d["periodo"] = ANIO_ETI
agregar(d, "turistas_extranjeros_ezeiza_aeroparque_por_provincia", "turistas", "Encuesta de Turismo Internacional, INDEC y SINTA")

# ---------------------------------------------------------------- pobreza
# Serie semestral de pobreza e indigencia de los 31 aglomerados urbanos (INDEC, EPH).
# Sale del mismo archivo que alimenta el sitio de consultas en pobreza/ (se actualiza a mano cada semestre).
todo_pob = json.loads((RAIZ / "pobreza" / "datos" / "crudo" / "ALL.json").read_text(encoding="utf-8"))["pais"]
ps = todo_pob["serie_nacional"]
pobreza = pd.DataFrame({"periodo": todo_pob["periodos"], "pobreza_personas": ps["pobreza_personas"],
                        "indigencia_personas": ps["indigencia_personas"],
                        "pobreza_hogares": ps["pobreza_hogares"], "indigencia_hogares": ps["indigencia_hogares"]})
pobreza["semestre"] = pobreza.periodo.str[0].astype(int)
pobreza["anio"] = pobreza.periodo.str[-4:].astype(int)
pobreza["t"] = pobreza.anio + (pobreza.semestre - 1) / 2
for col, var in [("pobreza_personas", "pobreza_personas_31_aglomerados"), ("indigencia_personas", "indigencia_personas_31_aglomerados")]:
    d = pobreza[["periodo", col]].rename(columns={col: "valor"})
    d["codigo_indec"], d["territorio"] = "00", "31 aglomerados urbanos"
    agregar(d, var, "% de personas", "INDEC, Encuesta Permanente de Hogares")
SEM = {1: "primer", 2: "segundo"}
sem_txt = lambda f: f"{SEM[int(f.semestre)]} semestre de {int(f.anio)}"
pu_, pp_ = pobreza.iloc[-1], pobreza.iloc[-3]
pmax = pobreza.loc[pobreza.pobreza_personas.idxmax()]

# ---------------------------------------------------------------- autos y motos nuevos (DNRPA)
def patentes(archivo, nombre):
    d = pd.read_csv(CRUDO / archivo, encoding="utf-8-sig", dtype={"provincia_id": str})
    d = d.rename(columns={"anio_inscripcion_inicial": "anio", "mes_inscripcion_inicial": "mes",
                          "cantidad_inscripciones_iniciales": nombre, "provincia_id": "codigo_indec"})
    d["codigo_indec"] = d.codigo_indec.str.zfill(2)
    return d[["anio", "mes", "codigo_indec", nombre]]
au, mo_ = patentes("dnrpa_autos_nuevos.csv", "autos"), patentes("dnrpa_motos_nuevas.csv", "motos")
meses_au = au.groupby("anio").mes.nunique()
ANIO_AU = int(meses_au[meses_au == 12].index.max())
patent = (au.groupby("anio").autos.sum().to_frame().join(mo_.groupby("anio").motos.sum(), how="left")
          .loc[lambda x: x.index <= ANIO_AU].reset_index())
patent["motos"] = patent.motos.where(patent.anio >= int(mo_.anio.min()))
ult_au = au[au.anio == au.anio.max()].mes.max()
ytd_au = au[(au.anio == au.anio.max()) & (au.mes <= ult_au)].autos.sum()
ytd_au_prev = au[(au.anio == au.anio.max() - 1) & (au.mes <= ult_au)].autos.sum()
pat_prov = (au[au.anio == ANIO_AU].groupby("codigo_indec").autos.sum().to_frame()
            .join(mo_[mo_.anio == ANIO_AU].groupby("codigo_indec").motos.sum()).reset_index())
pat_prov["autos_1000"] = pat_prov.autos / pat_prov.codigo_indec.map(POB) * 1000
pat_prov["motos_1000"] = pat_prov.motos / pat_prov.codigo_indec.map(POB) * 1000
pat_prov["territorio"] = pat_prov.codigo_indec.map(CORTO)
assert pat_prov.territorio.notna().all() and len(pat_prov) == 24, "Faltan provincias en los patentamientos"
for col, var in [("autos", "autos_nuevos_inscriptos"), ("motos", "motos_nuevas_inscriptas")]:
    d = patent[["anio", col]].dropna().rename(columns={"anio": "periodo", col: "valor"})
    d["codigo_indec"], d["territorio"] = "00", "Argentina"
    agregar(d, var, "vehiculos", "DNRPA, Ministerio de Justicia")
pa_max = patent.loc[patent.autos.idxmax()]; pa_min = patent.loc[patent.autos.idxmin()]

# ---------------------------------------------------------------- femicidios
# Victimas directas de femicidio por anio (Registro Nacional de Femicidios de la Justicia Argentina, Corte Suprema).
# La figura se incorporo al Codigo Penal en diciembre de 2012 (Ley 26.791). Los datos abiertos empiezan en 2017.
import pyreadstat
fem = []
for f in sorted(CRUDO.glob("csjn_femicidios_*.sav")):
    d, _ = pyreadstat.read_sav(f, encoding="latin1")
    col = {c.lower(): c for c in d.columns}
    tipo = next(col[c] for c in col if c.startswith("tipo_victima") or c == "tipo_victima")
    anio = int(re.search(r"(20\d{2})", f.name).group(1))
    directas = d[pd.to_numeric(d[tipo], errors="coerce") == 1]
    juris = next((col[c] for c in col if c.startswith("jurisdic")), None)
    fem.append({"anio": anio, "femicidios": int(len(directas)),
                "provincias": directas[juris].map(lambda x: f"{int(x):02d}" if pd.notna(x) else None).value_counts().to_dict() if juris else {}})
femi = pd.DataFrame(fem)[["anio", "femicidios"]].sort_values("anio")
muertes = muertes.merge(femi, on="anio", how="left")
d = femi.rename(columns={"anio": "periodo", "femicidios": "valor"}); d["codigo_indec"], d["territorio"] = "00", "Argentina"
agregar(d, "victimas_directas_femicidio", "personas", "Registro Nacional de Femicidios de la Justicia Argentina (CSJN)")
fe_u = femi.iloc[-1]

# ---------------------------------------------------------------- peces y pesca
# Desembarques de pesca maritima por especie (toneladas), formato ancho con una columna por anio
ds = pd.read_csv(CRUDO / "ciam_desembarques_especie.csv", sep=";", dtype=str).dropna(how="all").drop_duplicates()
ds["especies"] = ds.especies.str.strip()
anios_ds = [c for c in ds.columns if c.startswith("año_")]
for c in anios_ds:
    ds[c] = pd.to_numeric(ds[c].str.replace(".", "", regex=False), errors="coerce")
dl = ds.melt(id_vars="especies", value_vars=anios_ds, var_name="anio", value_name="toneladas")
dl["anio"] = dl.anio.str[-4:].astype(int)
tot_ds = dl[dl.especies == "Total"].set_index("anio").toneladas
ANIO_DS = int(tot_ds.dropna().index.max())
esp_ds = dl[(dl.especies != "Total") & (dl.anio == ANIO_DS)].sort_values("toneladas", ascending=False)
top3 = esp_ds.especies.head(3).tolist()
pesca = dl[dl.especies.isin(top3 + ["Total"])].pivot(index="anio", columns="especies", values="toneladas").reset_index()
pesca.columns = ["anio"] + [c for c in pesca.columns[1:]]
pesca_top = esp_ds.head(10).rename(columns={"especies": "territorio"}).assign(codigo_indec=lambda x: x.territorio)[["codigo_indec", "territorio", "toneladas"]]
d = tot_ds.rename("valor").reset_index().rename(columns={"anio": "periodo"}); d["codigo_indec"], d["territorio"] = "00", "Argentina"
agregar(d, "desembarques_pesca_maritima", "toneladas", "Ministerio de Ambiente, CIAM (datos de la Subsecretaria de Pesca)")

# Pesca continental comercial por especie y provincia
pc = pd.read_csv(CRUDO / "ciam_pesca_continental.csv", sep=";", dtype=str).dropna(how="all").drop_duplicates()
pc["toneladas"] = pd.to_numeric(pc.toneladas.str.replace(".", "", regex=False), errors="coerce")
pc = pc[~pc.especie.str.lower().str.startswith("total") & pc.provincia.fillna("").str.strip().ne("")]
pc["especie"] = pc.especie.str.strip()
anio_pc = json.loads((CRUDO / "ciam_meta.json").read_text(encoding="utf-8")).get("pesca_continental")
pc_esp = pc.groupby("especie").toneladas.sum().sort_values(ascending=False)
pc_prov = pc.groupby("provincia").toneladas.sum().sort_values(ascending=False)
rio = pc_esp.rename("toneladas").reset_index().rename(columns={"especie": "territorio"}).assign(codigo_indec=lambda x: x.territorio)[["codigo_indec", "territorio", "toneladas"]]
pesca_rio_prov = pc.pivot_table(index="especie", columns="provincia", values="toneladas", aggfunc="sum").fillna(0).reset_index()

# ---------------------------------------------------------------- visitas por parque nacional
# No hay datos abiertos por parque: tabla fija tomada del Anuario Estadistico de Turismo 2022 (Tabla 5.2),
# con 2019 calculado a partir de la variacion 2022/2019 que publica el mismo cuadro.
vpp = pd.read_csv(RAIZ / "datos" / "manual" / "visitas_por_parque_2022.csv")
vpp["visitas_2019"] = (vpp.visitas_2022 / (1 + vpp.variacion_2022_2019_pct / 100)).round()
sin_esp = lambda t: re.sub(r"[^a-z]", "", norm(t).replace("predelta", "predelta"))
lugares = {sin_esp(n): l for n, l in zip(pn_lista.nombre, pn_lista.lugar)}
def lugar_parque(n):
    k = sin_esp(n)
    return next((l for c, l in lugares.items() if k and (k in c or c in k)), "")
vpp["lugar"] = vpp.area.map(lugar_parque)
vpp["territorio"] = vpp.area + vpp.lugar.map(lambda l: f" ({l})" if l else "")
vpp["codigo_indec"] = vpp.area
visitas_parque = vpp[["codigo_indec", "territorio", "visitas_2022", "visitas_2019", "residentes_2022", "no_residentes_2022"]]
vp_top = vpp.sort_values("visitas_2022", ascending=False).iloc[0]; vp_2 = vpp.sort_values("visitas_2022", ascending=False).iloc[1]
vp_tot = vpp.visitas_2022.sum()

# ---------------------------------------------------------------- curiosidades
# Nombres mas frecuentes (RENAPER): 20 nombres por provincia, anio y sexo. El codigo 99 es el total del pais.
nom = pd.read_csv(CRUDO / "renaper_nombres_frecuentes.csv", encoding="utf-8-sig")
nom["codigo_indec"] = nom.provincia_id.map(lambda x: "00" if int(x) == 99 else f"{int(x):02d}")
ANIO_N = int(nom.anio.max())
nom["nombre"] = nom.nombre.str.strip().str.title()
nombres_top = (nom[nom.anio == ANIO_N].sort_values("cantidad", ascending=False)
               .groupby(["codigo_indec", "sexo"]).head(10)[["codigo_indec", "sexo", "nombre", "cantidad"]])
pais_n = nom[nom.codigo_indec == "00"]
top_f = pais_n[(pais_n.anio == ANIO_N) & (pais_n.sexo == "F")].sort_values("cantidad").iloc[-1]
top_m = pais_n[(pais_n.anio == ANIO_N) & (pais_n.sexo == "M")].sort_values("cantidad").iloc[-1]
ini_n = int(nom.anio.min())
top_f0 = pais_n[(pais_n.anio == ini_n) & (pais_n.sexo == "F")].sort_values("cantidad").iloc[-1]
top_m0 = pais_n[(pais_n.anio == ini_n) & (pais_n.sexo == "M")].sort_values("cantidad").iloc[-1]
lionel = pais_n[pais_n.nombre == "Lionel"].set_index("anio").cantidad
lio_max = int(lionel.idxmax()) if len(lionel) else None
prov_top_m = nom[(nom.anio == ANIO_N) & (nom.codigo_indec != "00") & (nom.sexo == "M")].sort_values("cantidad").groupby("codigo_indec").tail(1)

# Carne vacuna, vino y yerba mate: indicadores sectoriales del Ministerio de Economia (formato largo)
def sspmi(archivo):
    d = pd.read_csv(CRUDO / archivo, encoding="latin-1", low_memory=False, parse_dates=["indice_tiempo"])
    d["anio"] = d.indice_tiempo.dt.year
    return d
def anual_completo(d, como="sum"):
    """Agrega por anio solo los anios con los 12 meses."""
    m = d.groupby("anio").indice_tiempo.nunique()
    return d[d.anio.isin(m[m == 12].index)].groupby("anio").valor.agg(como)
cv = sspmi("sspmi_carne_vacuna.csv")
cons = cv[cv.indicador.str.startswith("Consumo per c") & (cv.alcance_tipo == "PAIS")]
carne = anual_completo(cons, "mean").rename("kg_por_habitante").reset_index()
ult_cons = cons.indice_tiempo.max()
cons_ytd = cons[cons.anio == ult_cons.year].valor.mean()
asado = cv[cv.indicador.str.contains("Asado-Pollo", na=False)].sort_values("indice_tiempo")
vi = sspmi("sspmi_vitivinicultura.csv")
mi_v = vi[(vi.indicador == "Mercado interno") & (vi.unidad_de_medida == "hl")]
vino_a = mi_v[(mi_v.frecuencia_nombre == "Anual") & (mi_v.anio <= 2000)].groupby("anio").valor.sum()
vino_m = anual_completo(mi_v[mi_v.frecuencia_nombre == "Mensual"].groupby(["anio", "indice_tiempo"]).valor.sum().reset_index())
vino = pd.concat([vino_a, vino_m[vino_m.index > 2000]]).rename("hl").reset_index()
vino["millones_litros"] = vino.hl * 100 / 1e6
ANIO_V = int(vino.anio.max())
mza = mi_v[(mi_v.frecuencia_nombre == "Mensual") & (mi_v.anio == ANIO_V)]
mza_pct = mza[mza.alcance_nombre == "MENDOZA"].valor.sum() / mza.valor.sum() * 100
ym = sspmi("sspmi_yerba_mate.csv")
molino = ym[(ym.indicador == "Salida de molino") & (ym.alcance_tipo == "PAIS")]
yerba = (anual_completo(molino) / 1e6).rename("millones_kg").reset_index()
for tabla_, col, var, uni in [(carne, "kg_por_habitante", "consumo_carne_vacuna_por_habitante", "kg por habitante por anio"),
                               (vino, "millones_litros", "vino_mercado_interno", "millones de litros"),
                               (yerba, "millones_kg", "yerba_mate_salida_de_molino", "millones de kg")]:
    d = tabla_[["anio", col]].rename(columns={"anio": "periodo", col: "valor"})
    d["codigo_indec"], d["territorio"] = "00", "Argentina"
    agregar(d, var, uni, "Ministerio de Economia, SSPMI")

# Glaciares por provincia (Inventario Nacional de Glaciares, IANIGLA, via CIAM). El archivo repite las filas.
gl = pd.read_csv(CRUDO / "ciam_glaciares.csv", sep=";", dtype=str).dropna(how="all").drop_duplicates()
gl["codigo_indec"] = gl.provincia.map(codigo)
gl["glaciares"] = pd.to_numeric(gl.cantidad_de_glaciares, errors="coerce")
glaciares = gl.dropna(subset=["codigo_indec", "glaciares"]).groupby("codigo_indec").glaciares.max().reset_index()
glaciares["territorio"] = glaciares.codigo_indec.map(CORTO)

# Diferencia de la temperatura media anual del pais con el valor de referencia (SMN, via CIAM)
cl = pd.read_csv(CRUDO / "ciam_anomalia_temperatura.csv", sep=";", dtype=str).dropna(how="all").drop_duplicates()
cl.columns = ["anio", "desvio_temperatura", "desvio_precipitacion"]
cl = cl.apply(pd.to_numeric, errors="coerce").dropna(subset=["anio"]).astype({"anio": int}).sort_values("anio")
clima = cl[["anio", "desvio_temperatura", "desvio_precipitacion"]]
d = clima[["anio", "desvio_temperatura"]].rename(columns={"anio": "periodo", "desvio_temperatura": "valor"})
d["codigo_indec"], d["territorio"] = "00", "Argentina"
agregar(d, "desvio_temperatura_media_anual", "grados C", "Servicio Meteorologico Nacional, via CIAM")
cal = clima.sort_values("desvio_temperatura").iloc[-1]; fri_ = clima.sort_values("desvio_temperatura").iloc[0]

# ---------------------------------------------------------------- salida
pd.concat(largo, ignore_index=True).to_csv(ORDEN / "tabla_larga.csv", index=False)

MES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto",
       "septiembre", "octubre", "noviembre", "diciembre"]


def r1(x):
    return round(float(x), 1)


tablas = {
    "energia_hogares": anual[["anio", "total", "residencial", "resto", "pct_residencial",
                              "idx_residencial", "idx_resto", "idx_demanda", "idx_emae"]].round(2),
    "energia_estacionalidad": perfil.round(0),
    "nacimientos": nac_df.round(2),
    "madres_adolescentes_provincias": ado_prov.round(1),
    "suicidio_serie": tasa_sui.round(2),
    "suicidio_provincias": sui_prov.round(2),
    "suicidio_edad_sexo": edad.round(2),
    "muertes_violentas": muertes,
    "empleo_provincias": emp.round(2),
    "mortalidad_infantil_provincias": mi_prov.round(2),
    "sube_dia_habil": sube_m[["periodo", "t"] + MODOS].round({"t": 4}),
    "pisa_argentina_ocde": pisa.round(1),
    "escolarizacion_secundaria_provincias": esc_prov[["codigo_indec", "territorio", "tasa_inicio", "tasa_final"]].round(1),
    "aprender_provincias": ap_prov.round(1),
    "areas_protegidas_provincias": area.round(2),
    "parques_nacionales_historia": pn_hist.round(0),
    "especies_areas_nacionales": esp,
    "visitas_parques_nacionales": visitas,
    "turistas_no_residentes_anual": receptivo,
    "viajeros_hoteles_anual": hoteles,
    "turistas_extranjeros_provincias": etp.round(2),
    "parques_nacionales_lista": pn_lista.round({"hectareas": 0, "lat": 4, "lng": 4}),
    "patentamientos_anual": patent,
    "patentamientos_provincias": pat_prov[["codigo_indec", "territorio", "autos", "motos", "autos_1000", "motos_1000"]].round(2),
    "nombres_top": nombres_top,
    "desembarques_especies": pesca,
    "desembarques_top": pesca_top,
    "pesca_continental": rio,
    "pesca_continental_provincias": pesca_rio_prov,
    "visitas_por_parque": visitas_parque,
    "carne_vacuna": carne.round(1),
    "vino_mercado_interno": vino.round(2),
    "yerba_molino": yerba.round(2),
    "glaciares_provincias": glaciares,
    "clima_desvio": clima,
    "pobreza_serie": pobreza[["periodo", "anio", "semestre", "t", "pobreza_personas", "indigencia_personas", "pobreza_hogares", "indigencia_hogares"]],
}
for k, t in tablas.items():
    t.to_csv(SITIO / f"{k}.csv", index=False)

a05, a25 = anual.iloc[0], anual.iloc[-1]
m25 = muertes[muertes.anio == ANIO_SNIC].iloc[0]
s24, s25 = tasa_sui[tasa_sui.anio == ANIO_SNIC - 1].iloc[0], tasa_sui[tasa_sui.anio == ANIO_SNIC].iloc[0]
pico = nac_df.loc[nac_df.nacimientos.idxmax()]
n24 = nac_df.iloc[-1]
ado_pico = nac_df.loc[nac_df.madres_menores_20.idxmax()]
top_emp, low_emp = emp.sort_values("cada_100").iloc[-1], emp.sort_values("cada_100").iloc[0]
top_sui, low_sui = sui_prov.sort_values("tasa").iloc[-1], sui_prov.sort_values("tasa").iloc[0]

resumen = {
    "actualizado": pd.Timestamp.now().strftime("%d/%m/%Y"),
    "energia": {
        "pct_res_2005": r1(a05.pct_residencial), "pct_res_2025": r1(a25.pct_residencial),
        "crec_res": r1((a25.residencial / a05.residencial - 1) * 100),
        "crec_resto": r1((a25.resto / a05.resto - 1) * 100),
        "crec_total": r1((a25.total / a05.total - 1) * 100),
        "crec_emae": r1((a25.emae / a05.emae - 1) * 100),
        "gwh_2025": round(float(a25.total)),
        "mes_max": MES[int(perfil.loc[perfil.gwh.idxmax(), "mes"]) - 1],
        "mes_min": MES[int(perfil.loc[perfil.gwh.idxmin(), "mes"]) - 1],
        "dif_max_min": r1((perfil.gwh.max() / perfil.gwh.min() - 1) * 100),
        "ultimo_mes": f"{MES[ult.indice_tiempo.month - 1]} de {ult.indice_tiempo.year}",
    },
    "nacimientos": {
        "anio_pico": int(pico.anio), "pico": int(pico.nacimientos), "n_2024": int(n24.nacimientos),
        "caida": r1((n24.nacimientos / pico.nacimientos - 1) * 100),
        "ado_pico": int(ado_pico.madres_menores_20), "ado_anio_pico": int(ado_pico.anio),
        "ado_2024": int(n24.madres_menores_20),
        "ado_caida": r1((n24.madres_menores_20 / ado_pico.madres_menores_20 - 1) * 100),
        "pct_2012": r1(nac_df.iloc[0].pct_madres_menores_20), "pct_2024": r1(n24.pct_madres_menores_20),
    },
    "suicidio": {
        "anio": ANIO_SNIC, "casos": int(s25.casos), "tasa": r1(s25.tasa), "tasa_prev": r1(s24.tasa),
        "casos_prev": int(s24.casos), "tasa_v": r1(s25.tasa_varones), "tasa_m": r1(s25.tasa_mujeres),
        "homicidios": int(m25.homicidios), "viales": int(m25.siniestros_viales),
        "razon_hom": r1(m25.suicidios / m25.homicidios),
        "top": top_sui.territorio, "top_tasa": r1(top_sui.tasa),
        "low": low_sui.territorio, "low_tasa": r1(low_sui.tasa),
        "pct_jovenes": r1(pct_jovenes), "pct_varones": r1(pct_varones), "n_sat": n_sat,
        "anio_cruce": int(next(a for a in muertes.anio.sort_values()
                               if (muertes[muertes.anio >= a].suicidios > muertes[muertes.anio >= a].siniestros_viales).all())),
    },
    "empleo": {
        "mes": f"{MES[fin.month - 1]} de {fin.year}", "total_millones": r1(tot_emp / 1e6),
        "cada_100_pais": r1(tot_emp / tot_pob * 100), "var_nac": r1(var_nac),
        "top": top_emp.territorio, "top_v": r1(top_emp.cada_100),
        "low": low_emp.territorio, "low_v": r1(low_emp.cada_100),
        "suben": int((emp.var_12m > 0).sum()),
    },
    "mortalidad": {
        "anio": ANIO_MI, "tasa": r1(mi_pais[ANIO_MI]), "tasa_prev": r1(mi_pais[ANIO_MI - 1]),
        "anio_inicio": int(mi_pais.index.min()), "tasa_inicio": r1(mi_pais.iloc[0]),
        "tri_act": f"{TRI_ACT[0]} a {TRI_ACT[1]}", "tri_base": f"{TRI_BASE[0]} a {TRI_BASE[1]}",
        "pais_act": r1(p_act["00"]), "pais_base": r1(p_base["00"]),
        "top": mi_prov.sort_values("tmi_actual").iloc[-1].territorio, "top_v": r1(mi_prov.tmi_actual.max()),
        "low": mi_prov.sort_values("tmi_actual").iloc[0].territorio, "low_v": r1(mi_prov.tmi_actual.min()),
        "bajan": int((mi_prov.tmi_actual < mi_prov.tmi_base).sum()),
    },
    "pisa": {
        "anio": ANIO_PISA, "anio_prev": int(pp_prev.anio),
        "mat": round(float(pu.arg_mat)), "lec": round(float(pu.arg_lec)), "cie": round(float(pu.arg_cie)),
        "ocde_mat": round(float(pu.ocde_mat)), "ocde_lec": round(float(pu.ocde_lec)), "ocde_cie": round(float(pu.ocde_cie)),
        "dif_mat": round(float(pu.ocde_mat - pu.arg_mat)), "var_mat": round(float(pu.arg_mat - pp_prev.arg_mat)),
        "var_lec": round(float(pu.arg_lec - pp_prev.arg_lec)), "var_cie": round(float(pu.arg_cie - pp_prev.arg_cie)),
    },
    "escolarizacion": {
        "ini": ESC_INI, "fin": ESC_FIN, "pais_ini": r1(esc_pais[ESC_INI]), "pais_fin": r1(esc_pais[ESC_FIN]),
        "top": esc_prov.sort_values("tasa_final").iloc[-1].territorio, "top_v": r1(esc_prov.tasa_final.max()),
        "low": esc_prov.sort_values("tasa_final").iloc[0].territorio, "low_v": r1(esc_prov.tasa_final.min()),
        "suben": int((esc_prov.tasa_final > esc_prov.tasa_inicio).sum()),
    },
    "aprender": {
        "anio": meta_ap["anio"], "nivel": meta_ap["nivel"],
        "mat": r1(ap_pais.mat_logra), "len": r1(ap_pais.len_logra), "mat_debajo": r1(ap_pais.mat_debajo),
        "top": ap_prov.sort_values("mat_logra").iloc[-1].territorio, "top_v": r1(ap_prov.mat_logra.max()),
        "low": ap_prov.sort_values("mat_logra").iloc[0].territorio, "low_v": r1(ap_prov.mat_logra.min()),
    },
    "naturaleza": {
        "anio": anio_ap, "areas": int(ap_tot.total_cantidad), "pct": r1(ap_tot.porcentaje_terrestre_protegido),
        "ha_millones": r1(ap_tot.terrestre_ha / 1e6), "m2_pais": round(float(m2_pais)),
        "top": area.sort_values("pct_territorio").iloc[-1].territorio, "top_v": r1(area.pct_territorio.max()),
        "low": area.sort_values("pct_territorio").iloc[0].territorio, "low_v": r1(area.pct_territorio.min()),
        "m2_top": area.sort_values("m2_por_habitante").iloc[-1].territorio, "m2_top_v": round(float(area.m2_por_habitante.max())),
        "m2_low": area.sort_values("m2_por_habitante").iloc[0].territorio, "m2_low_v": round(float(area.m2_por_habitante.min()), 1),
        "pn_n": int(len(apn)), "pn_terr_millones": r1(terr.superficie.sum() / 1e6), "pn_mar_millones": r1(apn[apn.marina].superficie.sum() / 1e6),
        "pn_primeras": " y ".join(apn[apn.anio == primera.anio].nombre.sort_values()), "pn_primera_anio": int(primera.anio), "pn_ultima": ultima.nombre, "pn_ultima_anio": int(ultima.anio),
        "pn_mayor": mayor.nombre, "pn_mayor_ha": round(float(mayor.superficie)), "pn_mayor_anio": int(mayor.anio),
        "anio_ini": int(pn_hist.anio.min()), "anio_fin": int(pn_hist.anio.max()),
        "esp_top": esp.iloc[0].territorio, "esp_top_v": int(esp.iloc[0].animales), "esp_top_car": esp.iloc[0].caracter,
        "esp_2": esp.iloc[1].territorio, "esp_2_v": int(esp.iloc[1].animales),
        "vis_anio": int(visitas.anio.max()), "vis": int(visitas.total.iloc[-1]), "vis_ini_anio": int(visitas.anio.min()),
        "vis_ini": int(visitas.total.iloc[0]), "vis_max_anio": int(visitas.loc[visitas.total.idxmax(), "anio"]),
        "vis_max": int(visitas.total.max()), "vis_nr_pct": r1(visitas.no_residentes.iloc[-1] / visitas.total.iloc[-1] * 100),
        "vis_min_anio": int(visitas.loc[visitas.total.idxmin(), "anio"]), "vis_min": int(visitas.total.min()),
        "ytd_frase": (f"En enero de {int(ult_vp.anio)}" if meses_vp == 1 else f"Entre enero y {MES[meses_vp - 1]} de {int(ult_vp.anio)}"), "ytd_var": r1((ytd / ytd_prev - 1) * 100),
    },
    "turismo": {
        "anio": int(receptivo.anio.max()), "turistas": int(receptivo.turistas.iloc[-1]), "anio_ini": int(receptivo.anio.min()),
        "max_anio": int(receptivo.loc[receptivo.turistas.idxmax(), "anio"]), "max": int(receptivo.turistas.max()),
        "doce": int(doce), "doce_var": r1((doce / doce_prev - 1) * 100),
        "doce_hasta": f"{MES[ult_tr.month - 1]} de {ult_tr.year}", "provisorio": bool(provisorio),
        "eoh_anio": ANIO_EOH, "eoh_ini": int(hoteles.anio.min()), "eoh_total": round(float(hoteles.total.iloc[-1]) / 1e6, 1),
        "eoh_nr_pct": r1(hoteles.no_residentes.iloc[-1] / hoteles.total.iloc[-1] * 100),
        "eoh_reg": reg.index[0], "eoh_reg_pct": r1(reg.iloc[0] / reg.sum() * 100), "eoh_ultimo": f"{MES[ult_eoh.month - 1]} de {ult_eoh.year}",
        "eoh_max_anio": int(hoteles.loc[hoteles.total.idxmax(), "anio"]), "eoh_max": round(float(hoteles.total.max()) / 1e6, 1),
        "eti_anio": ANIO_ETI, "eti_top": etp.sort_values("turistas").iloc[-1].territorio, "eti_top_v": int(etp.turistas.max()),
        "eti_2": etp.sort_values("turistas").iloc[-2].territorio, "eti_2_v": int(etp.sort_values("turistas").iloc[-2].turistas),
        "eti_pc_top": etp.sort_values("cada_1000").iloc[-1].territorio, "eti_pc_top_v": r1(etp.cada_1000.max()),
    },
    "pobreza": {
        "ini": int(pobreza.anio.iloc[0]), "fin": int(pu_.anio), "sem": sem_txt(pu_), "sem_prev": sem_txt(pp_),
        "pob": r1(pu_.pobreza_personas), "ind": r1(pu_.indigencia_personas),
        "pob_prev": r1(pp_.pobreza_personas), "ind_prev": r1(pp_.indigencia_personas),
        "max": r1(pmax.pobreza_personas), "max_sem": sem_txt(pmax),
    },
    "pesca": {
        "anio": ANIO_DS, "ini": int(min(tot_ds.dropna().index)), "total": round(float(tot_ds[ANIO_DS])),
        "total_ini": round(float(tot_ds.dropna().iloc[0])), "top": top3, "top_t": [round(float(x)) for x in esp_ds.toneladas.head(3)],
        "top_pct": r1(esp_ds.toneladas.iloc[0] / tot_ds[ANIO_DS] * 100),
        "rio_anio": anio_pc, "rio_total": round(float(pc_esp.sum())), "rio_top": pc_esp.index[0], "rio_top_pct": r1(pc_esp.iloc[0] / pc_esp.sum() * 100),
        "rio_provs": list(pc_prov.index), "rio_prov_top": pc_prov.index[0], "rio_prov_top_pct": r1(pc_prov.iloc[0] / pc_prov.sum() * 100),
    },
    "femicidios": {"ini": int(femi.anio.min()), "anio": int(fe_u.anio), "n": int(fe_u.femicidios),
                   "max_anio": int(femi.loc[femi.femicidios.idxmax(), "anio"]), "max": int(femi.femicidios.max())},
    "visitas_parque": {"top": vp_top.area, "top_lugar": vp_top.lugar, "top_v": int(vp_top.visitas_2022), "top_nr": int(vp_top.no_residentes_2022),
                       "dos": vp_2.area, "dos_v": int(vp_2.visitas_2022), "pct_top": r1(vp_top.visitas_2022 / vp_tot * 100),
                       "top_2019": int(vp_top.visitas_2019), "n": int(vpp.visitas_2022.notna().sum())},
    "curiosidades": {
        "nom_anio": ANIO_N, "nom_ini": ini_n, "nena": top_f.nombre, "nena_n": int(top_f.cantidad), "varon": top_m.nombre, "varon_n": int(top_m.cantidad),
        "nena0": top_f0.nombre, "varon0": top_m0.nombre,
        "varon_prov": prov_top_m.nombre.value_counts().index[0], "varon_prov_n": int(prov_top_m.nombre.value_counts().iloc[0]),
        "lionel_anio": lio_max, "lionel_max": int(lionel.max()) if lio_max else None,
        "lionel_prev": int(lionel.get(lio_max - 1, 0)) if lio_max else None,
        "carne_ini": int(carne.anio.iloc[0]), "carne_ini_v": r1(carne.kg_por_habitante.iloc[0]),
        "carne_anio": int(carne.anio.iloc[-1]), "carne_v": r1(carne.kg_por_habitante.iloc[-1]),
        "carne_ytd": r1(cons_ytd), "carne_ytd_hasta": f"{MES[ult_cons.month - 1]} de {ult_cons.year}",
        "carne_min_serie": bool(cons_ytd < carne.kg_por_habitante.min()),
        "asado_ini": r1(asado.valor.iloc[0]), "asado_ini_anio": int(asado.anio.iloc[0]),
        "asado": r1(asado.valor.iloc[-1]), "asado_hasta": f"{MES[asado.indice_tiempo.iloc[-1].month - 1]} de {asado.indice_tiempo.iloc[-1].year}",
        "vino_ini": int(vino.anio.iloc[0]), "vino_ini_v": round(float(vino.millones_litros.iloc[0])), "vino_anio": ANIO_V,
        "vino_v": round(float(vino.millones_litros.iloc[-1])), "vino_caida": r1((vino.millones_litros.iloc[-1] / vino.millones_litros.iloc[0] - 1) * 100),
        "vino_mza": r1(mza_pct),
        "yerba_ini": int(yerba.anio.iloc[0]), "yerba_anio": int(yerba.anio.iloc[-1]), "yerba_v": r1(yerba.millones_kg.iloc[-1]),
        "yerba_max_anio": int(yerba.loc[yerba.millones_kg.idxmax(), "anio"]), "yerba_max": r1(yerba.millones_kg.max()),
        "gl_total": int(glaciares.glaciares.sum()), "gl_n": int(len(glaciares)),
        "gl_top": glaciares.sort_values("glaciares").iloc[-1].territorio, "gl_top_v": int(glaciares.glaciares.max()),
        "gl_2": glaciares.sort_values("glaciares").iloc[-2].territorio, "gl_2_v": int(glaciares.sort_values("glaciares").iloc[-2].glaciares),
        "cl_ini": int(clima.anio.min()), "cl_fin": int(clima.anio.max()), "cl_ult": float(clima.desvio_temperatura.iloc[-1]),
        "cl_max_anio": int(cal.anio), "cl_max": float(cal.desvio_temperatura), "cl_min_anio": int(fri_.anio), "cl_min": float(fri_.desvio_temperatura),
        "cl_pos_desde2000": int((clima[clima.anio >= 2000].desvio_temperatura > 0).sum()), "cl_n_desde2000": int((clima.anio >= 2000).sum()),
    },
    "sube": {
        "mes": f"{MES[int(su.n_mes) - 1]} de {int(su.anio)}", "mes_prev": f"{MES[int(su.n_mes) - 1]} de {int(su.anio) - 1}",
        "total_millones": round(float(su.total) / 1e6, 2),
        "var_anual": r1((su.total / su_prev.total.iloc[0] - 1) * 100) if len(su_prev) else None,
        "colectivo_millones": round(float(su.colectivo) / 1e6, 2), "tren_miles": round(float(su.tren) / 1e3),
        "subte_miles": round(float(su.subte) / 1e3),
        "pre_millones": round(float(pre) / 1e6, 2), "vs_pre": r1((su.total / pre - 1) * 100),
        "ultimo_dia": ULT_DIA.strftime("%d/%m/%Y"),
        "tren_pre_miles": round(float(pre_modos.tren) / 1e3), "subte_pre_miles": round(float(pre_modos.subte) / 1e3),
        "tren_vs_pre": r1((su.tren / pre_modos.tren - 1) * 100), "subte_vs_pre": r1((su.subte / pre_modos.subte - 1) * 100),
        "colectivo_vs_pre": r1((su.colectivo / pre_modos.colectivo - 1) * 100),
    },
    "autos": {
        "anio": ANIO_AU, "autos": int(patent.autos.iloc[-1]), "motos": int(patent.motos.iloc[-1]),
        "max_anio": int(pa_max.anio), "max": int(pa_max.autos), "min_anio": int(pa_min.anio), "min": int(pa_min.autos),
        "ini": int(patent.anio.min()), "motos_ini": int(mo_.anio.min()),
        "ytd": f"enero y {MES[int(ult_au) - 1]} de {int(au.anio.max())}", "ytd_var": r1((ytd_au / ytd_au_prev - 1) * 100),
        "top": pat_prov.sort_values("autos_1000").iloc[-1].territorio, "top_v": r1(pat_prov.autos_1000.max()),
        "low": pat_prov.sort_values("autos_1000").iloc[0].territorio, "low_v": r1(pat_prov.autos_1000.min()),
        "moto_top": pat_prov.sort_values("motos_1000").iloc[-1].territorio, "moto_top_v": r1(pat_prov.motos_1000.max()),
        "pais_1000": r1(pat_prov.autos.sum() / POB_PAIS * 1000), "motos_pais_1000": r1(pat_prov.motos.sum() / POB_PAIS * 1000),
    },
}

(SITIO / "fichas.json").write_text(json.dumps({
    "resumen": resumen,
    "datos": {k: json.loads(t.to_json(orient="records")) for k, t in tablas.items()},
}, ensure_ascii=False), encoding="utf-8")
print(json.dumps(resumen, ensure_ascii=False, indent=1))
