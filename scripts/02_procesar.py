"""
Paso 2. Ordena los datos y arma las fichas.
Lee datos/crudo/, escribe:
  datos/ordenado/tabla_larga.csv   todas las series en un solo formato
  sitio/datos/fichas.json          lo que dibuja el sitio
  sitio/datos/<ficha>.csv          la tabla de cada ficha, para descargar
Uso: python scripts/02_procesar.py
"""
import datetime, io, json, pathlib, re, unicodedata, zipfile
from decimal import Decimal, ROUND_HALF_UP
import numpy as np
import pandas as pd


def r1(x):
    """Un decimal, redondeando la mitad hacia arriba sobre el valor exacto, igual que el navegador (round() de Python lleva los
    empates al par: 8,25 daba 8,2 y el gráfico mostraba 8,3)."""
    return float(Decimal(float(x)).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP))



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
# Casos que el lugar de registro o un error de la fuente distorsionan (datos/manual/distorsiones.json): los textos los aclaran
# en la misma oración o los dejan fuera del máximo, con el motivo
DIST = {k: v for k, v in json.loads((CRUDO.parent / "manual" / "distorsiones.json").read_text(encoding="utf-8")).items() if not k.startswith("_")}
EXCLUIR = lambda clave: [c for c, x in DIST.get(clave, {}).items() if x["accion"] == "excluir"]

# ---------------------------------------------------------------- poblacion
# Un solo modulo de poblacion (regla del autor, octubre de 2026): toda tasa por habitante que arma el sitio usa las proyecciones
# del INDEC 2022 a 2040 (base Censo 2022), por provincia, del anio 2025. Antes se deducia de las tasas de hurtos del SNIC
# (cantidad / tasa x 100.000), que dan exactamente los mismos valores porque el SNIC usa esas proyecciones (verificado en las 24).
# Excepciones, declaradas en cada ficha: las tasas que publica la fuente (SNIC, DEIS, ENACOM) se usan tal cual, y las series
# por provincia anteriores a 2022 (transferencias y cruces animados) usan la poblacion implicita en las tasas del SNIC de cada
# anio, que sale de las proyecciones del INDEC vigentes en ese momento.
ANIO_POB = 2025
_pr = pd.read_csv(CRUDO / "indec_proyecciones_provincias.csv", sep=";")
_pr.columns = [c.strip() for c in _pr.columns]
_pr["Poblacion"] = pd.to_numeric(_pr.Poblacion.astype(str).str.replace(".", "", regex=False), errors="coerce")
POB = {f"{int(j):02d}": float(v) for j, v in _pr[_pr.Fecha == ANIO_POB].groupby("Jurisdiccion").Poblacion.sum().items()}
assert len(POB) == 24, "faltan provincias en las proyecciones del INDEC"

# Proyecciones del INDEC por provincia, sexo y edad (base Censo 2022): envejecimiento y relacion de dependencia
proy = pd.read_csv(CRUDO / "indec_proyecciones_provincias.csv", sep=";")
proy.columns = [c.strip() for c in proy.columns]
proy = proy.rename(columns={"Jurisdiccion": "prov", "Edad(q)": "edad", "Poblacion": "pob", "Fecha": "anio"})
proy["pob"] = pd.to_numeric(proy.pob.astype(str).str.strip().replace("-", "0"), errors="coerce").fillna(0)
proy["codigo_indec"] = proy.prov.map(lambda x: f"{int(x):02d}")
proy["grupo"] = pd.cut(proy.edad, [-1, 14, 64, 200], labels=["menores", "activos", "mayores"])
_pv = proy.groupby(["codigo_indec", "anio", "grupo"], observed=True).pob.sum().unstack()
_pv = pd.concat([_pv, _pv.groupby(level="anio").sum().assign(codigo_indec="00").set_index("codigo_indec", append=True).reorder_levels([1, 0])])
_pv["vejez"] = _pv.mayores / _pv.activos * 100  # personas de 65 y mas cada 100 de 15 a 64
_pv["pct_mayores"] = _pv.mayores / _pv[["menores", "activos", "mayores"]].sum(axis=1) * 100
ANIO_PROY = int(pd.Timestamp.now().year)
envejec = _pv.vejez.unstack("anio").reset_index()
envejec = envejec[envejec.codigo_indec != "00"][["codigo_indec", ANIO_PROY, 2040]].rename(columns={ANIO_PROY: "vejez_hoy", 2040: "vejez_2040"})
envejec["territorio"] = envejec.codigo_indec.map(CORTO)
envejec_pais = _pv.xs("00", level="codigo_indec")[["vejez", "pct_mayores"]].reset_index().round(2)
_ep = envejec_pais.set_index("anio")
_eo = envejec.sort_values("vejez_hoy")
env_res = {"anio": ANIO_PROY, "hoy": r1(_ep.vejez[ANIO_PROY]), "ini": r1(_ep.vejez[2022]), "fin": r1(_ep.vejez[2040]),
           "trab_hoy": round(100 / float(_ep.vejez[ANIO_PROY]), 1), "trab_fin": round(100 / float(_ep.vejez[2040]), 1),
           "max": _eo.iloc[-1].territorio, "max_v": r1(_eo.vejez_hoy.max()), "min": _eo.iloc[0].territorio, "min_v": r1(_eo.vejez_hoy.min()),
           "pct_mayores_hoy": r1(_ep.pct_mayores[ANIO_PROY]), "pct_mayores_fin": r1(_ep.pct_mayores[2040])}
envejec = envejec.round({"vejez_hoy": 1, "vejez_2040": 1})
d = _pv.reset_index()
d = d[d.codigo_indec != "00"].rename(columns={"anio": "periodo", "vejez": "valor"}); d["territorio"] = d.codigo_indec.map(CORTO)
agregar(d, "personas_65_mas_cada_100_de_15_a_64", "personas", "INDEC, proyecciones de poblacion 2022 a 2040")

# Piramide de poblacion: personas por sexo y grupo de edad quinquenal, anio en curso y 2040, por provincia y pais.
# En el archivo del INDEC el sexo 1 son mujeres y el 2 varones: al nacer hay mas del 2 (unos 104 cada 100, como en todas
# las poblaciones) y entre las personas mayores y en el total hay mas del 1.
_pi = proy[proy.anio.isin([ANIO_PROY, 2040])].copy()
_pi["sexo"] = _pi.Sexo.map({1: "mujeres", 2: "varones"})
_pi["edad"] = _pi.edad.clip(upper=90)  # 90 y mas en un solo grupo
_pi = _pi.groupby(["codigo_indec", "anio", "sexo", "edad"]).pob.sum().reset_index()
_pi = pd.concat([_pi, _pi.groupby(["anio", "sexo", "edad"]).pob.sum().reset_index().assign(codigo_indec="00")])
piramide = _pi.pivot_table(index=["codigo_indec", "edad", "sexo"], columns="anio", values="pob").reset_index()
piramide.columns = ["codigo_indec", "edad", "sexo", "personas_hoy", "personas_2040"]
piramide["territorio"] = piramide.codigo_indec.map(lambda c: "Total del país" if c == "00" else CORTO[c])
piramide = piramide[["codigo_indec", "territorio", "sexo", "edad", "personas_hoy", "personas_2040"]].round(0)
_pp = piramide[piramide.codigo_indec == "00"]
_med = lambda col: float(np.interp(_pp.groupby("edad")[col].sum().sum() / 2, _pp.groupby("edad")[col].sum().cumsum().values, _pp.groupby("edad")[col].sum().index.values + 5))
pir_res = {"anio": ANIO_PROY, "edad_mediana_hoy": round(_med("personas_hoy")), "edad_mediana_2040": round(_med("personas_2040")),
           "menores15_hoy": r1(_pp[_pp.edad < 15].personas_hoy.sum() / _pp.personas_hoy.sum() * 100),
           "menores15_2040": r1(_pp[_pp.edad < 15].personas_2040.sum() / _pp.personas_2040.sum() * 100)}

# Aportantes por beneficio previsional (Boletin Estadistico de la Seguridad Social, cuadro 4.1.1.1): regimenes de ANSES,
# promedio anual, el ultimo anio es el ultimo mes disponible. No se compara entre provincias: trece provincias tienen su
# propia caja previsional fuera de ANSES.
jub_res, jubil = None, None
if (CRUDO / "bess_indicadores.xlsx").exists():
    t = pd.read_excel(CRUDO / "bess_indicadores.xlsx", sheet_name="4.1.1.1", header=None)
    filas = []
    for i in range(len(t)):
        v0 = t.iat[i, 0]
        anio = v0.year if isinstance(v0, (pd.Timestamp, datetime.datetime)) else (int(v0) if isinstance(v0, (int, float, np.integer)) and not pd.isna(v0) and 1990 < v0 < 2100 else None)
        if anio and pd.notna(t.iat[i, 1]) and pd.notna(t.iat[i, 2]):
            mes = v0.month if isinstance(v0, (pd.Timestamp, datetime.datetime)) else None
            filas.append({"anio": anio, "mes": mes, "aportantes": round(float(t.iat[i, 1])), "beneficios": round(float(t.iat[i, 2]))})
    jubil = pd.DataFrame(filas)
    jubil["aportantes_por_beneficio"] = (jubil.aportantes / jubil.beneficios).round(3)
    _u, _i = jubil.iloc[-1], jubil.iloc[0]
    _mx = jubil.loc[jubil.aportantes_por_beneficio.idxmax()]
    _mn = jubil.loc[jubil.aportantes_por_beneficio.idxmin()]
    jub_res = {"anio": int(_u.anio), "mes": None if pd.isna(_u.mes) else int(_u.mes), "ratio": round(float(_u.aportantes_por_beneficio), 2),
               "aportantes": int(_u.aportantes), "beneficios": int(_u.beneficios), "ini": int(_i.anio), "ini_ratio": round(float(_i.aportantes_por_beneficio), 2),
               "max_anio": int(_mx.anio), "max": round(float(_mx.aportantes_por_beneficio), 2), "min_anio": int(_mn.anio), "min": round(float(_mn.aportantes_por_beneficio), 2)}
    d = jubil[["anio", "aportantes_por_beneficio"]].rename(columns={"anio": "periodo", "aportantes_por_beneficio": "valor"})
    d["codigo_indec"], d["territorio"] = "00", "Argentina"
    agregar(d, "aportantes_por_beneficio_previsional", "aportantes por beneficio", "Secretaria de Seguridad Social, BESS")

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
# Nacidos vivos de la DEIS (estadísticas vitales, por jurisdicción de residencia de la madre y edad de la madre), un archivo
# por año desde 2012. La suma de cada archivo coincide con el total oficial del anuario "Estadísticas vitales" (verificado el
# 2 de octubre de 2026 en los 13 años: 777.012 en 2014, 460.902 en 2023 y 413.135 en 2024). Reemplaza al RENAPER, que
# registraba menos nacimientos (entre 1,3% y 3,9% menos según el año). El RENAPER queda para los nombres.
def leer_deis(f):
    raw = (CRUDO / f).read_bytes()
    try:
        txt = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        txt = raw.decode("latin1")
    x = pd.read_csv(io.StringIO(txt), sep=";" if ";" in txt.split("\n")[0] else ",", dtype=str)
    x.columns = [c.strip().strip('"') for c in x.columns]
    return x


ANIOS_NAC = sorted(int(m.group(1)) for f in CRUDO.glob("deis_nacidos_*.csv") if (m := re.match(r"deis_nacidos_(\d{4})\.csv", f.name)))
_nd = []
for a in ANIOS_NAC:
    x = leer_deis(f"deis_nacidos_{a}.csv")
    _nd.append(pd.DataFrame({"anio": a, "prov": x.PROVRES.str.strip().str.zfill(2), "c": pd.to_numeric(x.CUENTA.str.strip(), errors="coerce"),
                             "ado": x.IMEDAD.str.strip().str.match(r"^[12]\.")}))   # 1.Menor de 15 y 2.15 a 19
nd = pd.concat(_nd)
assert set(range(2012, ANIOS_NAC[-1] + 1)) <= set(ANIOS_NAC), "faltan años de nacidos vivos de la DEIS"
nac = nd.groupby("anio").c.sum()                     # el total del país incluye a las madres que viven en otro país o sin dato
nac_ado = nd[nd.ado].groupby("anio").c.sum()
nac_df = pd.DataFrame({"anio": nac.index, "nacimientos": nac.values, "madres_menores_20": nac_ado.reindex(nac.index).values})
nac_df["pct_madres_menores_20"] = nac_df.madres_menores_20 / nac_df.nacimientos * 100

_n24 = nd[nd.prov.isin([c for c in CORTO if c != "00"])]
tot_p = _n24.groupby(["prov", "anio"]).c.sum()
ado_p = _n24[_n24.ado].groupby(["prov", "anio"]).c.sum()
pp = (ado_p / tot_p * 100).rename("pct").reset_index().rename(columns={"prov": "provincia_id"})
ado_prov = pp.pivot(index="provincia_id", columns="anio", values="pct")[[2012, 2024]].reset_index()
ado_prov.columns = ["codigo_indec", "pct_2012", "pct_2024"]
ado_prov["territorio"] = ado_prov.codigo_indec.map(CORTO)

d = nac_df.rename(columns={"anio": "periodo", "nacimientos": "valor"})
d["codigo_indec"], d["territorio"] = "00", "Argentina"
agregar(d, "nacimientos", "personas", "DEIS, Ministerio de Salud")
d = pp.rename(columns={"provincia_id": "codigo_indec", "anio": "periodo", "pct": "valor"})
d["territorio"] = d.codigo_indec.map(CORTO)
agregar(d, "pct_nacimientos_madres_menores_20", "%", "DEIS, Ministerio de Salud")

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
agregar(d, "tasa_suicidios_100mil_5_anios_y_mas", "por 100.000 habitantes de 5 años y más", "SNIC, Ministerio de Seguridad")

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

PROV24 = [c for c in CORTO if c != "00"]

# ---------------------------------------------------------------- por que: causas de muerte infantil y nivel socioeconomico
# Nivel socioeconomico por provincia, Censo 2022 (INDEC): NBI (serie_nbi_2022.xlsx), cobertura de salud (c2022_tp_salud_c1.xlsx,
# que tiene invertidos los codigos de Tucuman y Tierra del Fuego: se unio por nombre), maximo nivel educativo, cloacas y agua
# (cuadros por provincia). Tabla armada una sola vez: datos/manual/nse_censo2022_provincias.csv.
nse = pd.read_csv(RAIZ / "datos" / "manual" / "nse_censo2022_provincias.csv")
nse["codigo_indec"] = nse.prov_indec.map(lambda x: f"{int(x):02d}")
NSE_IND = {"pct_pob_solo_cobertura_publica": "Población sin obra social ni prepaga", "pct_hog_nbi_2022": "Hogares con necesidades básicas insatisfechas",
           "pct_25mas_secundario_completo_o_mas": "Adultos de 25 años o más con secundario completo", "pct_hog_cloaca": "Hogares con desagüe a red cloacal"}
nse = nse[["codigo_indec"] + list(NSE_IND)]
spearman = lambda a, b: round(float(pd.Series(a).rank().corr(pd.Series(b).rank())), 2)
nse_ado = nse.merge(ado_prov[["codigo_indec", "territorio", "pct_2024"]], on="codigo_indec")
ado_nse_res = {"anio": 2024, "indicadores": [{"k": k, "lab": v, "r": spearman(nse_ado[k].values, nse_ado.pct_2024.values)} for k, v in NSE_IND.items()]}

# Muertes de menores de un anio por grupo de causa (DEIS, defunciones por causa CIE-10 y provincia de residencia).
# Tres anios juntos, porque en las provincias chicas hay pocas muertes por anio. Nacimientos de la misma fuente.
GRUPOS_MI = [("perinatales", "Afecciones perinatales", r"^P"), ("malformaciones", "Malformaciones congénitas", r"^Q"),
             ("respiratorias", "Enfermedades respiratorias", r"^J"), ("infecciosas", "Infecciosas y parasitarias", r"^[AB]"),
             ("externas", "Causas externas", r"^[VWXY]"), ("mal_definidas", "Mal definidas", r"^R"), ("otras", "Otras causas", r".")]
# Reducibilidad (DEIS, Anuario de Estadisticas Vitales 2023, cuadros 36 y 37): solo se publica para el total del pais y en PDF.
# Con los codigos de 3 caracteres de los datos abiertos no se puede calcular por provincia.
REDUCIBLES_PAIS = {"anio": 2023, "neonatal": 68.4, "posneonatal": 68.0}


def deis_csv(f):
    raw = (CRUDO / f).read_bytes()
    try:
        txt = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        txt = raw.decode("latin1")
    return pd.read_csv(io.StringIO(txt), sep=";" if ";" in txt.split("\n")[0] else ",", dtype=str)


_def, _nac = [], []
ANIOS_CAUSA = [a for a in range(TRI_ACT[0], TRI_ACT[1] + 1) if (CRUDO / f"deis_defunciones_{a}.csv").exists()]
for a in ANIOS_CAUSA:
    d = deis_csv(f"deis_defunciones_{a}.csv")
    d = d[d.GRUPEDAD.str.match(r"^01_|^0[123]\.|^031")].copy()  # menores de un anio (desde 2024 separados en tramos)
    d["anio"] = a
    _def.append(d)
    n = deis_csv(f"deis_nacidos_{a}.csv")
    n["anio"] = a
    _nac.append(n)
dmi = pd.concat(_def)
dmi["cuenta"] = dmi.CUENTA.astype(int)
dmi["codigo_indec"] = dmi.PROVRES.str.strip().str.zfill(2)
dmi["causa"] = dmi.CAUSA.str.strip().str.upper()
dmi["grupo"] = dmi.causa.map(lambda c: next(k for k, _, rx in GRUPOS_MI if re.match(rx, c)))
nmi = pd.concat(_nac)
nmi["codigo_indec"] = nmi.PROVRES.str.strip().str.zfill(2)
nac_prov = nmi.assign(c=nmi.CUENTA.astype(int)).groupby("codigo_indec").c.sum()
causas = dmi[dmi.codigo_indec.isin(PROV24)].pivot_table(index="codigo_indec", columns="grupo", values="cuenta", aggfunc="sum", fill_value=0)
causas.loc["00"] = dmi.pivot_table(index="grupo", values="cuenta", aggfunc="sum").cuenta  # pais, incluye residencia sin dato
causas = causas[[k for k, _, _ in GRUPOS_MI]]
_tot_mi = causas.sum(axis=1)
causas_pct = causas.div(_tot_mi, axis=0) * 100
causas_tasa = causas.div(pd.Series({**nac_prov[nac_prov.index.isin(PROV24)].to_dict(), "00": nac_prov.sum()}), axis=0) * 1000
mi_causas = causas_pct.round(1).reset_index()
mi_causas["territorio"] = mi_causas.codigo_indec.map(lambda c: "Total del país" if c == "00" else CORTO[c])
mi_causas["tasa"] = mi_causas.codigo_indec.map((_tot_mi / pd.Series({**nac_prov.to_dict(), "00": nac_prov.sum()}) * 1000).round(1))
mi_causas["muertes"] = mi_causas.codigo_indec.map(_tot_mi)
for k, _, _ in GRUPOS_MI:
    mi_causas[f"tasa_{k}"] = mi_causas.codigo_indec.map(causas_tasa[k].round(2))
# cruce: tasa de cada grupo de causas contra la poblacion sin obra social ni prepaga
_cz = causas_tasa.drop("00").join(nse.set_index("codigo_indec"))
_pp = causas_pct.loc["00"]
mi_causas_res = {
    "anios": [ANIOS_CAUSA[0], ANIOS_CAUSA[-1]], "muertes": int(_tot_mi["00"]),
    "grupos": [{"k": k, "lab": lab, "pct": r1(_pp[k]),
                "r_cobertura": spearman(_cz[k].values, _cz.pct_pob_solo_cobertura_publica.values),
                "max": CORTO[causas_tasa[k].drop("00").idxmax()], "max_v": round(float(causas_tasa[k].drop("00").max()), 2),
                "min": CORTO[causas_tasa[k].drop("00").idxmin()], "min_v": round(float(causas_tasa[k].drop("00").min()), 2)} for k, lab, _ in GRUPOS_MI],
    "reducibles": REDUCIBLES_PAIS,
}
mi_causas = mi_causas.sort_values("codigo_indec").reset_index(drop=True)

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
sube_m = sube.groupby("mes")[MODOS].median()
# meses sin ningún día en la fuente (agosto de 2022 y enero de 2024): quedan vacíos, así el gráfico muestra el hueco
SUBE_FALTAN = [m for m in pd.period_range(sube_m.index.min(), sube_m.index.max(), freq="M") if m not in sube_m.index]
sube_m = sube_m.reindex(pd.period_range(sube_m.index.min(), sube_m.index.max(), freq="M")).rename_axis("mes").reset_index()
# lanchas: el primer mes en que la serie pasa a más de diez veces la mediana de los seis meses anteriores (la fuente no explica el salto)
_l = sube_m.set_index("mes").lancha
SUBE_LANCHA = next((m for i, m in enumerate(_l.index) if i >= 6 and _l.iloc[i] > 10 * _l.iloc[i - 6:i].median()), None)
sube_m["anio"], sube_m["n_mes"] = sube_m.mes.dt.year, sube_m.mes.dt.month
sube_m["t"] = sube_m.anio + (sube_m.n_mes - 1) / 12
sube_m["periodo"] = sube_m.mes.astype(str)
# Referencia previa a la pandemia: dias habiles del 2 al 13 de marzo de 2020, antes del aislamiento
pre_modos = sube[sube.indice_tiempo.between("2020-03-02", "2020-03-13")][MODOS].median()
pre = pre_modos.total
d = sube_m[["periodo", "total"]].dropna().rename(columns={"total": "valor"})
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

# Diagnóstico educativo (etapa 10, octubre de 2026): la misma base de Aprender trae, para cada combinación de jurisdicción,
# departamento, sector (estatal o privado) y ámbito (urbano o rural), cuántos estudiantes hay en cada nivel de desempeño, en
# cada situación de edad y en cada quinto del nivel socioeconómico del país (conteos expandidos). Un grupo de menos de MIN_DIAG
# estudiantes no lleva porcentajes. Los departamentos que la fuente oculta ("Enmascarado") cuentan en su provincia y no en la lista.
MIN_DIAG = 300
def aprender_base(archivo, pref):
    d = pd.read_csv(CRUDO / archivo, sep=";", encoding="utf-8-sig", low_memory=False)
    num = [c for c in d.columns if c.startswith((pref + "desemp_", "sobreedad_", "NSE_nivel_"))]
    d = pd.concat([d[["jurisdiccion", "departamento", "sector", "ambito"]],
                   d[num].apply(lambda c: pd.to_numeric(c.astype(str).str.strip().str.replace(",", "."), errors="coerce")).fillna(0)], axis=1)
    des = [c for c in num if c.startswith(pref + "desemp_")]
    niv = {c: norm(c.split("desemp_")[1].replace("_", " ")) for c in des}
    sob = [c for c in num if c.startswith("sobreedad_")]
    atraso = [c for c in sob if c.endswith("_de_sobreedad")]
    nse = [c for c in num if c.startswith("NSE_nivel_")]
    assert len(atraso) == 3 and len(nse) == 5 and sum("Q1" in c for c in nse) == 1, "Cambiaron las columnas de edad o nivel socioeconomico de Aprender"
    d["n"] = d[des].sum(axis=1)
    d["logra"] = d[[c for c in des if niv[c] in ("satisfactorio", "avanzado")]].sum(axis=1)
    d["debajo"] = d[[c for c in des if niv[c].startswith("por debajo")]].sum(axis=1)
    d["edad_n"], d["sobreedad"] = d[sob].sum(axis=1), d[atraso].sum(axis=1)
    d["nse_n"], d["nse_q1"] = d[nse].sum(axis=1), d[[c for c in nse if "Q1" in c]].sum(axis=1)
    d["codigo_indec"] = d.jurisdiccion.map(codigo)
    assert d.codigo_indec.notna().all(), "Hay jurisdicciones de Aprender sin codigo INDEC"
    return d
dx_m, dx_l = aprender_base("aprender_primaria_matematica.csv", "m"), aprender_base("aprender_primaria_lengua.csv", "l")
def dx_resumir(fm, fl, por):
    m = fm.groupby(por)[["n", "logra", "debajo", "edad_n", "sobreedad", "nse_n", "nse_q1"]].sum()
    l = fl.groupby(por)[["n", "logra", "debajo"]].sum().reindex(m.index)
    pct = lambda a, b: (a / b * 100).where(b >= MIN_DIAG)
    return pd.DataFrame({"n": m.n, "mat_logra": pct(m.logra, m.n), "mat_debajo": pct(m.debajo, m.n), "mat_debajo_n": m.debajo,
                         "len_logra": pct(l.logra, l.n), "len_debajo": pct(l.debajo, l.n), "len_debajo_n": l.debajo,
                         "sobreedad": pct(m.sobreedad, m.edad_n), "nse_q1": pct(m.nse_q1, m.nse_n)})
def dx_provincias(fm, fl):
    r = dx_resumir(fm, fl, "codigo_indec")
    r.loc["00"] = dx_resumir(fm.assign(t="00"), fl.assign(t="00"), "t").iloc[0]
    return r
dx = dx_provincias(dx_m, dx_l)
for col, grupos in (("sector", {"Estatal": "estatal", "Privado": "privado"}), ("ambito", {"Urbano": "urbano", "Rural": "rural"})):
    assert set(dx_m[col]) == set(grupos), f"Cambiaron los grupos de {col} en Aprender"
    for k, suf in grupos.items():
        r = dx_provincias(dx_m[dx_m[col] == k], dx_l[dx_l[col] == k]).reindex(dx.index)
        dx[f"n_{suf}"] = r.n.fillna(0)
        for c in ("mat_logra", "len_logra", "sobreedad", "nse_q1"):
            dx[f"{c}_{suf}"] = r[c]
assert abs(dx.loc["00", "mat_logra"] - ap_pais.mat_logra) < .01 and abs(dx.loc["00", "len_logra"] - ap_pais.len_logra) < .01
# escolarización con el mismo denominador: desde 2022 (proyecciones del Censo 2022) hasta el último año
ESC_DESDE = 2022
_esc = esc.set_index("codigo_indec")
dx["esc_desde"], dx["esc_hasta"] = _esc[ESC_DESDE].astype(float), _esc[ESC_FIN].astype(float)
dx = dx.reset_index().rename(columns={"index": "codigo_indec"})
dx.insert(1, "territorio", dx.codigo_indec.map({**CORTO, "00": "Argentina"}))
dx = dx.sort_values("codigo_indec").reset_index(drop=True)
# departamentos: el nombre con tildes de Georef (la base de Aprender trae muchos en mayúsculas y sin tilde)
_geo = list(json.loads((SITIO / "departamentos.topo.json").read_text(encoding="utf-8"))["objects"].values())[0]["geometries"]
NOMBRE_DEP = {(g["properties"]["prov"], norm(g["properties"]["nombre"])): g["properties"]["nombre"] for g in _geo}
# los que Aprender abrevia distinto que Georef
ALIAS_DEP = {("06", "coronel de marina l rosales"): "coronel de marina leonardo rosales", ("22", "mayor luis j fontana"): "mayor luis j. fontana",
             ("22", "o higgins"): "o'higgins", ("38", "doctor manuel belgrano"): "dr. manuel belgrano",
             ("46", "coronel felipe varela"): "general felipe varela", ("46", "general angel v penaloza"): "angel vicente penaloza",
             ("46", "general juan f quiroga"): "general juan facundo quiroga", ("46", "general ocampo"): "general ortiz de ocampo",
             ("54", "libertador grl san martin"): "libertador general san martin", ("74", "libertador grl san martin"): "libertador general san martin",
             ("74", "general juan martin de pueyrredon"): "juan martin de pueyrredon", ("86", "juan f ibarra"): "juan felipe ibarra",
             ("90", "juan b alberdi"): "juan bautista alberdi"}
def nombre_dep(c, n):
    n_alias = ALIAS_DEP.get((c, norm(n)))
    if n_alias and (c, n_alias) in NOMBRE_DEP:
        return NOMBRE_DEP[(c, n_alias)]
    if (c, norm(n)) in NOMBRE_DEP:
        return NOMBRE_DEP[(c, norm(n))]
    if not n.isupper():
        return n
    return " ".join(w if w in ("de", "del", "la", "las", "los", "y", "el") and i else w.capitalize() for i, w in enumerate(n.lower().split()))
_enm = dx_m.departamento == "Enmascarado"
dx_dep = dx_resumir(dx_m[~_enm], dx_l[dx_l.departamento != "Enmascarado"], ["codigo_indec", "departamento"]).reset_index()
dx_dep["departamento"] = [nombre_dep(c, n) for c, n in zip(dx_dep.codigo_indec, dx_dep.departamento)]
dx_dep.insert(1, "provincia", dx_dep.codigo_indec.map(CORTO))
dx_dep = dx_dep[["codigo_indec", "provincia", "departamento", "n", "mat_logra", "mat_debajo", "len_logra", "len_debajo"]]
dx_dep = dx_dep.sort_values(["codigo_indec", "departamento"]).reset_index(drop=True)
_nse25 = pd.read_csv(RAIZ / "datos" / "manual" / "nse_censo2022_provincias.csv")
DX_ENMASCARADOS = {"alumnos": round(float(dx_m[_enm].n.sum())), "provincias": int(dx_m[_enm].codigo_indec.nunique())}

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
# Tablero de areas protegidas de la Secretaria de Turismo (tableros.yvera.tur.ar/tablero_areas_protegidas), visitas
# mensuales por parque desde 2008. Es una aplicacion interactiva sin enlace fijo: la exportacion completa se guarda a mano
# en datos/manual/visitas_parques_nacionales_mensual.csv (agrupamiento por anio, mes, provincia y area protegida).
vpm = pd.read_csv(RAIZ / "datos" / "manual" / "visitas_parques_nacionales_mensual.csv")
vpm.columns = ["anio", "mes", "provincia", "area", "total", "residentes", "no_residentes"]
MES_N = {m: i + 1 for i, m in enumerate(["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"])}
vpm["m"] = vpm.mes.str.strip().str.lower().map(MES_N)
assert vpm.m.notna().all()
_meses = vpm.groupby("anio").m.nunique()
VP_ULT = int(_meses[_meses == 12].index.max())  # ultimo anio completo
VP_PAR = int(vpm.anio.max()) if vpm.anio.max() > VP_ULT else None  # anio en curso
VP_MES = int(vpm[vpm.anio == VP_PAR].m.max()) if VP_PAR else 12
sin_esp = lambda t: re.sub(r"[^a-z]", "", norm(t))
lugares = {sin_esp(n): l for n, l in zip(pn_lista.nombre, pn_lista.lugar)}
def lugar_parque(n):
    k = sin_esp(n)
    return next((l for c, l in lugares.items() if k and (k in c or c in k)), "")
_vp = vpm.groupby(["area", "anio"]).total.sum().unstack()
_vpp = vpm[vpm.m <= VP_MES].groupby(["area", "anio"]).total.sum().unstack()  # mismos meses que el anio en curso
_vnr = vpm[vpm.anio == VP_ULT].groupby("area").no_residentes.sum()
vpp = pd.DataFrame({"area": _vp.index, "visitas_ult": _vp[VP_ULT].values, "visitas_pre": _vp.get(2019).values,
                    "visitas_par": _vpp[VP_PAR].values if VP_PAR else None, "visitas_par_ant": _vpp[VP_PAR - 1].values if VP_PAR else None})
vpp["no_residentes_ult"] = vpp.area.map(_vnr)
vpp = vpp[vpp.visitas_ult.fillna(0) > 0]
vpp["lugar"] = vpp.area.map(lugar_parque)
vpp["territorio"] = vpp.area + vpp.lugar.map(lambda l: f" ({l})" if l else "")
vpp["codigo_indec"] = vpp.area
visitas_parque = vpp[["codigo_indec", "territorio", "visitas_ult", "visitas_par", "visitas_pre", "no_residentes_ult"]]
vp_top = vpp.sort_values("visitas_ult", ascending=False).iloc[0]; vp_2 = vpp.sort_values("visitas_ult", ascending=False).iloc[1]
vp_tot = vpp.visitas_ult.sum()

# ---------------------------------------------------------------- curiosidades
# Nombres mas frecuentes (RENAPER): 20 nombres por provincia, anio y sexo. El codigo 99 es el total del pais.
nom = pd.read_csv(CRUDO / "renaper_nombres_frecuentes.csv", encoding="utf-8-sig")
nom["codigo_indec"] = nom.provincia_id.map(lambda x: "00" if int(x) == 99 else f"{int(x):02d}")
ANIO_N = int(nom.anio.max())
nom["nombre"] = nom.nombre.str.strip().str.title()
# El RENAPER publica los nombres sin tildes. Para mostrarlos se usa una tabla de equivalencias (datos/manual/nombres_con_tilde.csv):
# el dato y el CSV conservan el nombre como lo publica la fuente
TILDES = dict(pd.read_csv(RAIZ / "datos" / "manual" / "nombres_con_tilde.csv").values)
nom["mostrar"] = nom.nombre.map(lambda n: TILDES.get(n, n))
nombres_top = (nom[nom.anio == ANIO_N].sort_values("cantidad", ascending=False)
               .groupby(["codigo_indec", "sexo"]).head(10)[["codigo_indec", "sexo", "nombre", "mostrar", "cantidad"]])
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


def en_lo_que_va(fechas, valores):
    """Variacion de lo que va del ultimo anio contra los mismos meses del anio anterior."""
    s_ = pd.Series(valores.values, index=pd.to_datetime(fechas.values)).groupby(level=0).sum()
    u = s_.index.max()
    cur = s_[(s_.index.year == u.year) & (s_.index.month <= u.month)].sum()
    ant = s_[(s_.index.year == u.year - 1) & (s_.index.month <= u.month)].sum()
    return {"anio": int(u.year), "mes": int(u.month), "var": r1((cur / ant - 1) * 100)}


_vm = mi_v[mi_v.frecuencia_nombre == "Mensual"]
YTD = {"vino": en_lo_que_va(_vm.indice_tiempo, _vm.valor), "yerba": en_lo_que_va(molino.indice_tiempo, molino.valor),
       "demanda": en_lo_que_va(e.indice_tiempo, e.demanda_total), "residencial": en_lo_que_va(e.indice_tiempo, e.demanda_residencial)}
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

# ---------------------------------------------------------------- comparacion con la OCDE
# Indicadores del Desarrollo Mundial (Banco Mundial) para la Argentina y los 38 paises miembros.
# El promedio OCDE es el promedio simple de los miembros con dato ese anio, como en los informes de la OCDE.
# Solo se usan los anios con dato para al menos 29 de los 38 miembros (tres cuartos).
def bm(serie):
    filas = json.loads((CRUDO / f"bm_{serie}.json").read_text(encoding="utf-8"))[1]
    d = pd.DataFrame([{"pais": x["countryiso3code"], "anio": int(x["date"]), "valor": x["value"]} for x in filas])
    return d.dropna(subset=["valor"])


bm_pob = bm("SP.POP.TOTL").rename(columns={"valor": "pob"})


def por_habitante(serie, factor):
    d = bm(serie).merge(bm_pob, on=["pais", "anio"])
    d["valor"] = d.valor / d.pob * factor
    return d[["pais", "anio", "valor"]]


# id: (serie, frase para el texto, unidad, decimales, fuente original)
OCDE_META = {
    "fecundidad": ("SP.DYN.TFRT.IN", "la tasa global de fecundidad", "hijos por mujer", 2, "División de Población de las Naciones Unidas"),
    "fecundidad_adolescente": ("SP.ADO.TFRT", "la tasa de fecundidad adolescente", "nacimientos por cada 1.000 mujeres de 15 a 19 años", 1, "División de Población de las Naciones Unidas"),
    "mortalidad_infantil": ("SP.DYN.IMRT.IN", "la tasa de mortalidad infantil", "muertes de menores de un año por cada 1.000 nacidos vivos", 1, "Grupo Interinstitucional de las Naciones Unidas para la Estimación de la Mortalidad Infantil"),
    "esperanza_vida": ("SP.DYN.LE00.IN", "la esperanza de vida al nacer", "años", 1, "División de Población de las Naciones Unidas"),
    "gasto_salud": ("SH.XPD.CHEX.GD.ZS", "el gasto corriente en salud", "% del producto interno bruto", 1, "Organización Mundial de la Salud"),
    "suicidio": ("SH.STA.SUIC.P5", "la tasa de suicidios ajustada por edad", "por cada 100.000 habitantes", 1, "Organización Mundial de la Salud"),
    "homicidios": ("VC.IHR.PSRC.P5", "la tasa de homicidios intencionales", "por cada 100.000 habitantes", 1, "Oficina de las Naciones Unidas contra la Droga y el Delito"),
    "viales": ("SH.STA.TRAF.P5", "la tasa de muertes en siniestros viales", "por cada 100.000 habitantes", 1, "Organización Mundial de la Salud"),
    "desocupacion": ("SL.UEM.TOTL.ZS", "la tasa de desocupación", "% de la población económicamente activa", 1, "Organización Internacional del Trabajo, estimación modelada"),
    "empleo": ("SL.EMP.TOTL.SP.ZS", "la tasa de empleo", "% de la población de 15 años o más", 1, "Organización Internacional del Trabajo, estimación modelada"),
    "electricidad": ("EG.USE.ELEC.KH.PC", "el consumo de electricidad por habitante", "kilovatios hora por año", 0, "Agencia Internacional de Energía"),
    "co2": ("EN.GHG.CO2.PC.CE.AR5", "la emisión de dióxido de carbono por habitante (sin contar el cambio de uso del suelo)", "toneladas por año", 1, "Base EDGAR de la Comisión Europea"),
    "protegida": ("ER.LND.PTLD.ZS", "la superficie terrestre protegida", "% del territorio", 1, "Base Mundial de Áreas Protegidas (PNUMA-WCMC)"),
    "turistas": ("ST.INT.ARVL", "la llegada de turistas internacionales", "turistas por cada 100 habitantes", 0, "ONU Turismo"),
    "pesca": ("ER.FSH.CAPT.MT", "la pesca de captura", "kilos por habitante por año", 1, "Organización de las Naciones Unidas para la Alimentación y la Agricultura"),
    "pobreza_relativa": ("SI.DST.50MD", "la proporción de personas con ingresos por debajo de la mitad de la mediana", "% de la población", 1, "Plataforma de Pobreza y Desigualdad del Banco Mundial"),
    "gini": ("SI.POV.GINI", "el índice de Gini (0 es igualdad total y 100 desigualdad máxima)", "puntos", 1, "Plataforma de Pobreza y Desigualdad del Banco Mundial"),
    "secundaria": ("SE.SEC.CMPT.LO.ZS", "la tasa de finalización del ciclo básico de la secundaria", "% de la población en edad de terminarlo", 1, "Instituto de Estadística de la UNESCO"),
    "internet": ("IT.NET.USER.ZS", "el uso de internet", "% de la población", 1, "Unión Internacional de Telecomunicaciones"),
}
OCDE_DERIVADO = {"turistas": lambda: por_habitante("ST.INT.ARVL", 100), "pesca": lambda: por_habitante("ER.FSH.CAPT.MT", 1000)}
ocde_filas, ocde_res = [], {}
for k, (o_serie, frase, unidad, dec, origen) in OCDE_META.items():
    o_d = OCDE_DERIVADO[k]() if k in OCDE_DERIVADO else bm(o_serie)
    o_arg = o_d[o_d.pais == "ARG"].set_index("anio").valor
    o_mie = o_d[o_d.pais != "ARG"]
    o_g = o_mie.groupby("anio").valor
    o_est = pd.DataFrame({"ocde_promedio": o_g.mean(), "ocde_p25": o_g.quantile(.25), "ocde_p75": o_g.quantile(.75),
                          "ocde_mediana": o_g.median(), "ocde_paises": o_g.count()})
    o_est = o_est[(o_est.ocde_paises >= 29) & (o_est.index >= 1995)]
    o_est["argentina"] = o_arg.reindex(o_est.index)
    o_est = o_est.reset_index()
    o_est.insert(0, "indicador", k)
    ocde_filas.append(o_est)
    o_comun = o_est.dropna(subset=["argentina"])
    o_u, o_p = o_comun.iloc[-1], o_comun.iloc[0]
    o_ult = o_mie[o_mie.anio == o_u.anio]
    ocde_res[k] = {
        "serie": o_serie, "frase": frase, "unidad": unidad, "dec": dec, "origen": origen,
        "anio": int(o_u.anio), "arg": round(float(o_u.argentina), dec), "ocde": round(float(o_u.ocde_promedio), dec),
        "p25": round(float(o_u.ocde_p25), dec), "p75": round(float(o_u.ocde_p75), dec),
        "mediana": round(float(o_u.ocde_mediana), dec), "n": int(o_u.ocde_paises),
        "mas_alto": int((o_ult.valor > o_u.argentina).sum()),
        "ini": int(o_p.anio), "arg_ini": round(float(o_p.argentina), dec), "ocde_ini": round(float(o_p.ocde_promedio), dec),
    }
    o_a = o_arg.reset_index().rename(columns={"anio": "periodo"})
    o_a["codigo_indec"], o_a["territorio"] = "00", "Argentina"
    agregar(o_a, f"bm_{k}", unidad, f"Banco Mundial ({o_serie}), {origen}")
ocde_tabla = pd.concat(ocde_filas, ignore_index=True)
ocde_tabla = ocde_tabla[["indicador", "anio", "argentina", "ocde_promedio", "ocde_mediana", "ocde_p25", "ocde_p75", "ocde_paises"]]
ocde_tabla[["argentina", "ocde_promedio", "ocde_mediana", "ocde_p25", "ocde_p75"]] = ocde_tabla[["argentina", "ocde_promedio", "ocde_mediana", "ocde_p25", "ocde_p75"]].round(2)

# Nacimientos del conjunto de la OCDE: tasa bruta de natalidad por poblacion, sumado sobre los 38 miembros.
# Se pasa a indice con base en el primer anio de la serie de la DEIS para ponerlo en el mismo grafico.
o_nac = bm("SP.DYN.CBRT.IN").merge(bm_pob, on=["pais", "anio"])
o_nac = o_nac[o_nac.pais != "ARG"]
o_nac["nac"] = o_nac.valor * o_nac.pob / 1000
o_nac = o_nac.groupby("anio").agg(nac=("nac", "sum"), n=("pais", "count"))
o_nac = o_nac[o_nac.n == 38].nac  # solo anios con dato para los 38 miembros
NAC_BASE = int(nac_df.anio.min())
nac_df["idx_argentina"] = nac_df.nacimientos / nac_df.set_index("anio").nacimientos[NAC_BASE] * 100
nac_df["idx_ocde"] = nac_df.anio.map(o_nac / o_nac[NAC_BASE] * 100)
nac_df["nacimientos_ocde"] = nac_df.anio.map(o_nac).round(0)

MES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto",
       "septiembre", "octubre", "noviembre", "diciembre"]

# ---------------------------------------------------------------- indicadores provinciales nuevos
# Datos por provincia que no estan en Argendata (Fundar): esperanza de vida, censo 2022, internet, exportaciones y
# poblacion nacida en otro pais.

# Esperanza de vida al nacer por provincia y sexo (tablas de mortalidad del INDEC)
tm = pd.read_csv(CRUDO / "indec_tablas_mortalidad.csv", sep=";", decimal=",", encoding="utf-8-sig")
tm = tm[tm.Edad == 0]
ANIO_EV = int(tm["Año"].max())
ev = (tm[tm["Año"] == ANIO_EV].pivot_table(index="Jurisdiccion_cod", columns="Sexo", values="e")
      .rename(columns={"A": "total", "M": "mujeres", "V": "varones"}).reset_index())
ev["codigo_indec"] = ev.Jurisdiccion_cod.map(lambda x: f"{int(x):02d}")
ev_pais = ev[ev.codigo_indec == "00"].iloc[0]
ev = ev[ev.codigo_indec != "00"].copy()
ev["territorio"] = ev.codigo_indec.map(CORTO)
ev = ev[["codigo_indec", "territorio", "total", "mujeres", "varones"]]
d = ev.rename(columns={"total": "valor"}); d["periodo"] = ANIO_EV
agregar(d, "esperanza_vida_al_nacer", "anios", "INDEC, tablas de mortalidad")

# Censo 2022: servicios, equipamiento y cobertura de salud (resumen hecho por scripts/censo_2022.py)
censo = pd.read_csv(RAIZ / "datos" / "manual" / "censo2022_provincias.csv", dtype={"codigo_indec": str})
censo["territorio"] = censo.codigo_indec.map(CORTO)
CENSO_COLS = ["agua_red", "cloaca", "internet", "computadora", "nbi", "sin_cobertura"]
censo_pais = {c: float((censo[c] * censo[f"{c}_base"]).sum() / censo[f"{c}_base"].sum()) for c in CENSO_COLS}
for c in CENSO_COLS:
    d = censo[["codigo_indec", "territorio", c]].rename(columns={c: "valor"}); d["periodo"] = 2022
    agregar(d, f"censo2022_{c}", "% de hogares" if c != "sin_cobertura" else "% de personas", "INDEC, Censo 2022")
censo = censo[["codigo_indec", "territorio"] + CENSO_COLS]

# Internet fijo: accesos cada 100 hogares y velocidad media de bajada (ENACOM), ultimo trimestre
ALIAS = {"santiago del estero": "86", "tierra del fuego": "94"}
cod2 = lambda t: codigo(t) or ALIAS.get(norm(t))
ia = pd.read_csv(CRUDO / "enacom_internet_accesos.csv")
iv = pd.read_csv(CRUDO / "enacom_internet_velocidad.csv")
for t in (ia, iv):
    t["codigo_indec"] = t.provincia.map(cod2)
    assert t.codigo_indec.notna().all(), "Hay provincias de ENACOM sin codigo"
ult_ia = ia[["anio", "trimestre"]].drop_duplicates().sort_values(["anio", "trimestre"]).iloc[-1]
TRIM_ENACOM = f"{int(ult_ia.trimestre)}.º trimestre de {int(ult_ia.anio)}"
sel = lambda t: t[(t.anio == ult_ia.anio) & (t.trimestre == ult_ia.trimestre)].set_index("codigo_indec")
internet_fijo = pd.DataFrame({"codigo_indec": sorted(CORTO)}).query("codigo_indec != '00'")
internet_fijo = internet_fijo[internet_fijo.codigo_indec.isin(ia.codigo_indec)].copy()
internet_fijo["territorio"] = internet_fijo.codigo_indec.map(CORTO)
internet_fijo["accesos_100_hogares"] = internet_fijo.codigo_indec.map(sel(ia).accesos_cada_100_hogares)
internet_fijo["mbps"] = internet_fijo.codigo_indec.map(sel(iv).Mbps)

# Exportaciones por provincia de origen, en dolares por habitante (INDEC, Origen Provincial de las Exportaciones).
# Planilla con una hoja por bloque de anios: provincias en filas y, por cada rubro (total, PP, MOA, MOI, CyE), una columna por anio.
RUBROS = {"Total": "millones_usd", "(PP)": "primarios", "(MOA)": "manufacturas_agro", "(MOI)": "manufacturas_industriales", "(CyE)": "combustibles_energia"}
_filas_ex = []
_xe = pd.ExcelFile(CRUDO / "exportaciones_provincias.xls")
for hoja in _xe.sheet_names:
    t = _xe.parse(hoja, header=None)
    f_rub = t.index[t.apply(lambda r: r.astype(str).str.strip().eq("Total").any(), axis=1)][0]
    f_anio = f_rub + 2
    rubro = None
    cols = {}
    for j in range(2, t.shape[1]):
        h = str(t.iat[f_rub, j])
        rubro = next((v for k, v in RUBROS.items() if k in h), rubro) if h != "nan" else rubro
        m = re.match(r"(\d{4})", str(t.iat[f_anio, j]))
        if m and rubro:
            cols[(rubro, int(m.group(1)))] = j
    for i in range(f_anio + 1, len(t)):
        cod = codigo(str(t.iat[i, 1]).replace(", Antártida e Islas del Atlántico Sur", "")) if pd.notna(t.iat[i, 1]) else None
        es_total = str(t.iat[i, 1]).strip() == "Total"
        if not cod and not es_total:
            continue
        for (rub, anio), j in cols.items():
            v = pd.to_numeric(t.iat[i, j], errors="coerce")
            _filas_ex.append({"codigo_indec": "00" if es_total else cod, "anio": anio, "rubro": rub, "valor": 0.0 if pd.isna(v) else float(v)})
ex = pd.DataFrame(_filas_ex).drop_duplicates(["codigo_indec", "anio", "rubro"], keep="last")
ex = ex.pivot_table(index=["codigo_indec", "anio"], columns="rubro", values="valor").reset_index()
ANIO_EX = int(ex.anio.max())
assert ex[ex.anio == ANIO_EX].codigo_indec.nunique() == 25, "Faltan provincias en las exportaciones"
RUB_EX = ["primarios", "manufacturas_agro", "manufacturas_industriales", "combustibles_energia"]
exp_prov = ex[(ex.anio == ANIO_EX) & (ex.codigo_indec != "00")].copy()
exp_prov["territorio"] = exp_prov.codigo_indec.map(CORTO)
exp_prov["usd_por_habitante"] = exp_prov.millones_usd * 1e6 / exp_prov.codigo_indec.map(POB)
exp_prov["rubro_principal"] = exp_prov[RUB_EX].idxmax(axis=1)
exp_prov = exp_prov[["codigo_indec", "territorio", "millones_usd", "usd_por_habitante", "rubro_principal"] + RUB_EX]
EXP_TOTAL = float(ex[(ex.anio == ANIO_EX) & (ex.codigo_indec == "00")].millones_usd.iloc[0])
d = exp_prov[["codigo_indec", "territorio", "usd_por_habitante"]].rename(columns={"usd_por_habitante": "valor"}); d["periodo"] = ANIO_EX
agregar(d, "exportaciones_usd_por_habitante", "dolares por habitante", "INDEC, Origen Provincial de las Exportaciones")

# Ultimo semestre publicado contra el mismo semestre del anio anterior (anexo del OPEX, ver opex_semestre() en 01_descargar.py).
# Los valores son provisorios. Si el anexo es de un anio ya completo en la serie anual, no agrega nada.
EX_SEM = None
if (CRUDO / "exportaciones_semestre.xls").exists():
    _xs = pd.ExcelFile(CRUDO / "exportaciones_semestre.xls")
    _hoja = next((h for h in _xs.sheet_names if h.lower().startswith("region-prov") and "semestre" in h.lower()), None)
    if _hoja:
        t = _xs.parse(_hoja, header=None)
        f_anio = t.index[t.apply(lambda r: r.astype(str).str.match(r"^20\d\d").sum() >= 3, axis=1)][0]
        anios = {j: int(str(t.iat[f_anio, j])[:4]) for j in range(2, t.shape[1]) if re.match(r"^20\d\d", str(t.iat[f_anio, j]))}
        u = max(anios.values())
        ju, ja = [j for j, a in anios.items() if a == u][0], [j for j, a in anios.items() if a == u - 1][0]
        filas = []
        for i in range(f_anio + 1, len(t)):
            nom = str(t.iat[i, 1]).strip()
            cod = "00" if nom == "Total general" else (codigo(nom.replace(", Antártida e Islas del Atlántico Sur", "")) if nom != "nan" else None)
            if cod:
                filas.append({"codigo_indec": cod, "actual": float(t.iat[i, ju]), "anterior": float(t.iat[i, ja])})
        sem = pd.DataFrame(filas).drop_duplicates("codigo_indec")
        sem["var"] = (sem.actual / sem.anterior - 1) * 100
        if u > ANIO_EX and sem.codigo_indec.nunique() == 25:
            _p = sem[sem.codigo_indec == "00"].iloc[0]
            _pr = sem[sem.codigo_indec != "00"].assign(territorio=lambda x: x.codigo_indec.map(CORTO))
            _sube = int((_pr["var"] > 0).sum())
            _t, _b = _pr.sort_values("var").iloc[-1], _pr.sort_values("var").iloc[0]
            EX_SEM = {"anio": u, "total": round(_p.actual), "var": r1(_p["var"]), "suben": _sube,
                      "top": _t.territorio, "top_v": r1(_t["var"]), "low": _b.territorio, "low_v": r1(_b["var"])}
            exp_prov = exp_prov.merge(sem[["codigo_indec", "actual", "var"]].rename(columns={
                "actual": f"millones_usd_1er_semestre_{u}", "var": f"variacion_1er_semestre_{u}_vs_{u - 1}"}), on="codigo_indec", how="left")

# Empresas privadas empleadoras (OEDE, en base al SIPA). Una empresa con personal en varias provincias se cuenta en cada
# una (cuadro 1). La apertura y el cierre usan las empresas locales: cada empresa es local en la provincia donde declara
# la mayor parte de su empleo, asi que las provincias suman el total del pais (cuadros 6 y 7). La provincia de Buenos
# Aires viene separada en partidos del GBA y resto: se suman las cantidades y las tasas se recalculan con el denominador
# implicito (aperturas / tasa de entrada).
empresas, empresas_serie, emp_res = None, None, None
if (CRUDO / "oede_empresas_provincias.xlsx").exists():
    _xo = pd.ExcelFile(CRUDO / "oede_empresas_provincias.xlsx")
    def _cod_oede(t):
        t = norm(str(t))
        c = "06" if t in ("partidos de gba", "resto de buenos aires") else ("02" if t == "capital federal" else codigo(t))
        return None if c == "00" else c
    _t1 = _xo.parse("T1", header=None)
    _anio_emp = int(re.search(r"(20\d\d)", " ".join(_xo.parse("Indice", header=None)[0].dropna().astype(str))).group(1))
    _fila_tit = _t1.index[_t1[0].astype(str).str.strip() == "Provincia"][0]
    _col_tot = [j for j in range(_t1.shape[1]) if str(_t1.iat[_fila_tit, j]).strip() == "Total"][0]
    _cant = {}
    for i in range(_fila_tit + 1, len(_t1)):
        c = _cod_oede(_t1.iat[i, 0])
        if c and pd.notna(_t1.iat[i, _col_tot]):
            _cant[c] = _cant.get(c, 0) + float(_t1.iat[i, _col_tot])
    _filas = []
    for hoja, tipo in [("T6", "cantidad"), ("T7", "tasa")]:
        t = _xo.parse(hoja, header=None)
        f_anio = t.index[t.apply(lambda r: pd.to_numeric(r, errors="coerce").between(1990, 2100).sum() > 10, axis=1)][0]
        anios = {j: int(t.iat[f_anio, j]) for j in range(t.shape[1]) if pd.notna(pd.to_numeric(t.iat[f_anio, j], errors="coerce")) and 1990 < float(t.iat[f_anio, j]) < 2100}
        prov, sector = None, None
        for i in range(f_anio + 1, len(t)):
            v0 = t.iat[i, 0]
            if pd.notna(v0) and norm(str(v0)) == "total":
                sector = "Total"
            elif pd.notna(v0):
                c = _cod_oede(v0)
                if c:
                    prov = c if norm(str(v0)) not in ("partidos de gba", "resto de buenos aires") else norm(str(v0))
                    sector = None
                    continue
                sector = str(v0).strip()
            med = str(t.iat[i, 1]).strip().lower()
            if prov and sector == "Total" and med in ("aperturas", "cierres"):
                for j, a_ in anios.items():
                    _filas.append({"prov": prov, "anio": a_, "tipo": tipo, "medida": med, "valor": pd.to_numeric(t.iat[i, j], errors="coerce")})
    _m = pd.DataFrame(_filas).pivot_table(index=["prov", "anio"], columns=["tipo", "medida"], values="valor").reset_index()
    _m.columns = ["prov", "anio", "aperturas", "cierres", "tasa_entrada", "tasa_salida"]
    _m["base"] = _m.aperturas / _m.tasa_entrada
    _m["codigo_indec"] = _m.prov.map(lambda x: "06" if x in ("partidos de gba", "resto de buenos aires") else x)
    _m = _m.groupby(["codigo_indec", "anio"])[["aperturas", "cierres", "base"]].sum().reset_index()
    empresas_serie = _m.groupby("anio")[["aperturas", "cierres", "base"]].sum().reset_index()
    for d_ in (_m, empresas_serie):
        d_["tasa_entrada"] = d_.aperturas / d_.base * 100
        d_["tasa_salida"] = d_.cierres / d_.base * 100
        d_["tasa_neta"] = d_.tasa_entrada - d_.tasa_salida
    _ult = int(_m.anio.max())
    _u = _m[_m.anio == _ult].set_index("codigo_indec")
    _c5 = _m[_m.anio > _ult - 5].groupby("codigo_indec")[["aperturas", "cierres", "base"]].sum()
    empresas = pd.DataFrame({"codigo_indec": sorted(_cant)})
    assert len(empresas) == 24, "Faltan provincias en las empresas del OEDE"
    empresas["territorio"] = empresas.codigo_indec.map(CORTO)
    empresas["empresas"] = empresas.codigo_indec.map(_cant).round(0)
    empresas["cada_1000_hab"] = empresas.empresas / empresas.codigo_indec.map(POB) * 1000
    for k in ("aperturas", "cierres", "tasa_entrada", "tasa_salida", "tasa_neta"):
        empresas[f"{k}_{_ult}"] = empresas.codigo_indec.map(_u[k])
    empresas[f"tasa_neta_{_ult - 4}_{_ult}"] = empresas.codigo_indec.map((_c5.aperturas - _c5.cierres) / _c5.base * 100)
    empresas = empresas.round(2)
    empresas_serie = empresas_serie.drop(columns="base").round(2)
    _es = empresas_serie.set_index("anio")
    _e = empresas.sort_values("cada_1000_hab")
    _n = empresas.sort_values(f"tasa_neta_{_ult}")
    _neg = [int(a_) for a_ in _es.index if _es.tasa_neta[a_] < 0]
    emp_res = {"anio": _anio_emp, "ult": _ult, "total_pais": int(float(_t1[_t1[0].astype(str).str.strip() == "Total"].iloc[0, _col_tot])),
               "top": _e.iloc[-1].territorio, "top_v": r1(_e.cada_1000_hab.max()), "low": _e.iloc[0].territorio, "low_v": r1(_e.cada_1000_hab.min()),
               "pais_1000": round(float(_t1[_t1[0].astype(str).str.strip() == "Total"].iloc[0, _col_tot]) / POB_PAIS * 1000, 1),
               "ap": int(_es.aperturas[_ult]), "ci": int(_es.cierres[_ult]), "te": r1(_es.tasa_entrada[_ult]), "ts": r1(_es.tasa_salida[_ult]),
               "neta": r1(_es.tasa_neta[_ult]), "neta_top": _n.iloc[-1].territorio, "neta_top_v": r1(_n[f"tasa_neta_{_ult}"].max()),
               "neta_low": _n.iloc[0].territorio, "neta_low_v": r1(_n[f"tasa_neta_{_ult}"].min()),
               "positivas": int((empresas[f"tasa_neta_{_ult}"] > 0).sum()), "ini": int(_es.index.min()),
               "te_max_anio": int(_es.tasa_entrada.idxmax()), "te_max": r1(_es.tasa_entrada.max()),
               "anios_negativos": len(_neg), "ultimos_negativos": [a_ for a_ in _neg if a_ > _ult - 5]}
    d = empresas[["codigo_indec", "territorio", "cada_1000_hab"]].rename(columns={"cada_1000_hab": "valor"}); d["periodo"] = _anio_emp
    agregar(d, "empresas_privadas_cada_1000_habitantes", "empresas", "OEDE, Ministerio de Capital Humano, en base al SIPA")

# Antiguedad en el empleo de los asalariados (EPH, cuatro ultimos trimestres, resumen armado en 01_descargar.py)
rotacion, rot_res = None, None
if (CRUDO / "eph_antiguedad_resumen.csv").exists():
    rotacion = pd.read_csv(CRUDO / "eph_antiguedad_resumen.csv")
    _tr = json.loads((CRUDO / "eph_antiguedad_meta.json").read_text(encoding="utf-8"))["trimestres"]
    _g = lambda dim, grupo, col="pct_un_anio_o_menos": float(rotacion[(rotacion.dimension == dim) & (rotacion.grupo == grupo)][col].iloc[0])
    rot_res = {"desde": _tr[0], "hasta": _tr[-1], "total": _g("total", "Total de asalariados"), "total_largo": _g("total", "Total de asalariados", "pct_mas_de_cinco_anios"),
               "jovenes": _g("edad", "Hasta 24 años"), "e45": _g("edad", "45 a 54"), "sin_desc": _g("registro", "Sin descuento jubilatorio"),
               "con_desc": _g("registro", "Con descuento jubilatorio"), "q1": _g("ingreso", "Quintil 1"), "q5": _g("ingreso", "Quintil 5"),
               "sec_inc": _g("educacion", "Secundaria incompleta"), "sup_comp": _g("educacion", "Superior completo"),
               # tipo de trabajo (desde octubre de 2026)
               "estatal": _g("sector", "Estatal"), "privado": _g("sector", "Privado"), "chico": _g("tamano", "Hasta 5 personas"),
               "grande": _g("tamano", "Más de 40 personas"), "no_calif": _g("calificacion", "No calificada"), "profesional": _g("calificacion", "Profesional"),
               "casos": int(rotacion[rotacion.dimension == "total"].casos.iloc[0])}

# Personas nacidas en otro pais identificadas por el RENAPER, cada 100 habitantes
rx = pd.read_csv(CRUDO / "renaper_extranjeros.csv")
rx["codigo_indec"] = rx.provincia_id.map(lambda x: f"{int(x):02d}")
extranjeros = rx.groupby("codigo_indec").cantidad.sum().rename("personas").reset_index()
extranjeros["territorio"] = extranjeros.codigo_indec.map(CORTO)
extranjeros["cada_100"] = extranjeros.personas / extranjeros.codigo_indec.map(POB) * 100
top_origen = rx.groupby("pais_nacimiento").cantidad.sum().sort_values(ascending=False)

# ---------------------------------------------------------------- si tu provincia fuera un pais
# Ultimo valor de cada pais (sin agregados regionales) para esperanza de vida y mortalidad infantil
paises = [x for x in json.loads((CRUDO / "bm_paises.json").read_text(encoding="utf-8"))[1] if x["region"]["id"] != "NA"]
NOMBRE_PAIS = {x["id"]: x["name"] for x in paises}
mundo = pd.DataFrame({"iso3": sorted(NOMBRE_PAIS)})
mundo["pais"] = mundo.iso3.map(NOMBRE_PAIS)
for serie, col in [("SP.DYN.LE00.IN", "esperanza_vida"), ("SP.DYN.IMRT.IN", "mortalidad_infantil")]:
    filas = json.loads((CRUDO / f"bm_mundo_{serie}.json").read_text(encoding="utf-8"))[1]
    w = pd.DataFrame([{"iso3": x["countryiso3code"], "anio": int(x["date"]), "valor": x["value"]} for x in filas]).dropna()
    w = w[w.iso3.isin(NOMBRE_PAIS)]
    if col == "esperanza_vida":  # el mismo anio que las tablas provinciales del INDEC
        w = w[w.anio <= ANIO_EV]
    w = w.sort_values("anio").groupby("iso3").last()
    mundo[col] = mundo.iso3.map(w.valor).round(1)
    mundo[f"{col}_anio"] = mundo.iso3.map(w.anio).astype("Int64")
mundo = mundo[(mundo.iso3 != "ARG") & mundo[["esperanza_vida", "mortalidad_infantil"]].notna().any(axis=1)]

# ---------------------------------------------------------------- cuentas fiscales provinciales
# Esquema ahorro-inversion-financiamiento de cada provincia (Ministerio de Economia), millones de pesos corrientes.
# Recursos propios = ingresos corrientes menos tributos de origen nacional y transferencias, mas recursos propios de capital.
xl = pd.ExcelFile(CRUDO / "aif_provincias.xlsx")
fisc = []
for hoja in xl.sheet_names[1:]:
    cod = codigo(hoja.replace("Ciudad", "CABA").replace("  ", " "))
    t = pd.read_excel(xl, hoja, header=None)
    fila_anios = t.index[t[0].astype(str).str.strip().str.upper() == "CONCEPTO"][0]
    anios_f = {j: int(v) for j, v in t.loc[fila_anios].items() if j > 0 and pd.notna(v)}
    etiqueta = t[0].astype(str).map(lambda x: norm(x).strip(" .-"))
    def fila(texto, desde=0):
        i = [k for k in t.index[desde:] if etiqueta[k].startswith(texto)][0]
        return t.loc[i], i
    ic, i_ic = fila("i. ingresos corrientes")
    nac, _ = fila("de origen nacional", i_ic)
    trc, _ = fila("transferencias corrientes", i_ic)
    rpc, _ = fila("recursos propios de capital")
    tot, _ = fila("vi. ingresos totales")
    gas, _ = fila("vii. gastos totales")
    per, _ = fila("personal")
    res, _ = fila("viii. resultado financiero")
    for j, a in anios_f.items():
        v = lambda r: float(r[j])
        if not v(tot) > 0:  # anios sin datos en la planilla
            continue
        fisc.append({"codigo_indec": cod, "anio": a, "autonomia": (v(ic) - v(nac) - v(trc) + v(rpc)) / v(tot) * 100,
                     "resultado": v(res) / v(tot) * 100, "personal": v(per) / v(gas) * 100})
fisc = pd.DataFrame(fisc)
assert fisc.codigo_indec.nunique() == 24, "Faltan provincias en las cuentas fiscales"
# ultimo anio con dato para al menos 20 provincias. Las que todavia no lo publicaron van con su ultimo anio disponible
ANIO_FISC = int(fisc.groupby("anio").codigo_indec.nunique().loc[lambda x: x >= 20].index.max())
fiscal = fisc[fisc.anio <= ANIO_FISC].sort_values("anio").drop_duplicates("codigo_indec", keep="last").copy()
FISC_ATRASADAS = {CORTO[c]: int(a) for c, a in zip(fiscal.codigo_indec, fiscal.anio) if a < ANIO_FISC}
fiscal["territorio"] = fiscal.codigo_indec.map(CORTO)
fiscal = fiscal[["codigo_indec", "territorio", "anio", "autonomia", "resultado", "personal"]]
for col, var in [("autonomia", "recursos_propios_pct_ingresos"), ("resultado", "resultado_financiero_pct_ingresos"), ("personal", "gasto_personal_pct_gasto")]:
    d = fisc[["codigo_indec", "anio", col]].rename(columns={"anio": "periodo", col: "valor"}); d["territorio"] = d.codigo_indec.map(CORTO)
    agregar(d, var, "%", "Ministerio de Economia, cuentas provinciales (esquema AIF)")

# Tasa de natalidad por provincia (DEIS), nacidos vivos cada 1.000 habitantes
na = pd.read_csv(CRUDO / "deis_natalidad.csv", encoding="utf-8-sig")
na["anio"] = na.indice_tiempo.astype(str).str[-4:].astype(int)
na = na.melt(id_vars="anio", value_vars=[c for c in na.columns if c.startswith("natalidad_")], var_name="k", value_name="valor").dropna()
na["codigo_indec"] = na.k.str.replace("natalidad_", "").map(lambda x: "00" if x == "argentina" else codigo(x.replace("_", " ")))
assert na.codigo_indec.notna().all(), "Hay provincias de natalidad sin codigo"
ANIO_NAT = int(na.anio.max())
natalidad = na[na.anio == ANIO_NAT].set_index("codigo_indec").valor

# ---------------------------------------------------------------- departamentos
# Indicadores de los 529 departamentos para el mapa. Los codigos de la Ciudad (comunas), Chascomus, Quilmes,
# Rio Grande y Ushuaia difieren entre el SNIC y la geometria de Georef: se traducen aca.
sd = pd.read_csv(CRUDO / "snic_departamentos_resumen.csv", dtype={"departamento_id": str, "provincia_id": str})
TRADUCE = {"06217": "06218", "06058": "06658", "94007": "94008", "94014": "94015",
           **{f"02{n:03d}": f"02{7 * n:03d}" for n in range(1, 16)}}
sd["id"] = sd.departamento_id.replace(TRADUCE)
sd = sd[~sd.id.str.endswith("999")]
ANIO_DEP = int(sd.anio.max())
def tasa_dep(nombre, col, anios):
    d = sd[(sd.codigo_delito_snic_nombre == nombre) & sd.anio.isin(anios)]
    return d.groupby("id")[col].mean()
dep = pd.DataFrame({"id": sorted(sd.id.unique())})
dep["homicidios"] = dep.id.map(tasa_dep("Homicidios dolosos", "tasa_victimas", range(ANIO_DEP - 2, ANIO_DEP + 1)))
dep["viales"] = dep.id.map(tasa_dep("Muertes en accidentes viales", "tasa_victimas", range(ANIO_DEP - 2, ANIO_DEP + 1)))
dep["robos"] = dep.id.map(tasa_dep("Robos (excluye los agravados por el resultado de lesiones y/o muertes)", "tasa_hechos", [ANIO_DEP]))
nombres_dep = sd.drop_duplicates("id").set_index("id").departamento_nombre
rd = pd.read_csv(CRUDO / "renaper_departamentos_resumen.csv")
rd["id"] = rd.departamento_id.map(lambda x: f"{int(x):05d}")
rd.loc[rd.id.str.startswith("02"), "id"] = "02000"
edad_ini = rd.edad_quinquenal.str.extract(r"^(\d+)")[0].astype(int)
por_dep = rd.groupby("id").cantidad.sum()
ren_dep = pd.DataFrame({
    "poblacion_identificada": por_dep,
    "mayores_65": rd[edad_ini >= 65].groupby("id").cantidad.sum() / por_dep * 100,
    "menores_15": rd[edad_ini < 15].groupby("id").cantidad.sum() / por_dep * 100,
    "nacidos_otro_pais": rd[rd.pais_nacimiento != "ARGENTINA"].groupby("id").cantidad.sum() / por_dep * 100,
})
geo_ids = [g["properties"]["id"] for g in list(json.loads((SITIO / "departamentos.topo.json").read_text(encoding="utf-8"))["objects"].values())[0]["geometries"]]
departamentos = pd.DataFrame({"id": geo_ids})
departamentos = departamentos.merge(dep, on="id", how="left")
clave_ren = departamentos.id.where(~departamentos.id.str.startswith("02"), "02000")
for c in ren_dep.columns:
    departamentos[c] = clave_ren.map(ren_dep[c])
departamentos["provincia"] = departamentos.id.str[:2].map(CORTO)
departamentos = departamentos.round(2)
DEP_META = {
    "homicidios": ("Homicidios dolosos", f"víctimas cada 100.000 habitantes, promedio {ANIO_DEP - 2} a {ANIO_DEP}", "SNIC, Ministerio de Seguridad"),
    "robos": ("Robos", f"hechos cada 100.000 habitantes, {ANIO_DEP}", "SNIC, Ministerio de Seguridad"),
    "viales": ("Muertes viales", f"víctimas cada 100.000 habitantes, promedio {ANIO_DEP - 2} a {ANIO_DEP}", "SNIC, Ministerio de Seguridad"),
    "mayores_65": ("Personas de 65 años o más", "% de la población identificada, junio de 2026", "RENAPER"),
    "menores_15": ("Menores de 15 años", "% de la población identificada, junio de 2026", "RENAPER"),
    "nacidos_otro_pais": ("Nacidos en otro país", "% de la población identificada, junio de 2026", "RENAPER"),
}
departamentos.to_csv(SITIO / "departamentos.csv", index=False)

# ---------------------------------------------------------------- elecciones presidenciales
# Direccion Nacional Electoral: definitivos 1983 a 2019 y provisorios 2023 (scripts/elecciones_presidenciales.py).
# Cada formula se identifica por el apellido de quien encabezaba la lista. Las cuatro mas votadas del pais se muestran
# por separado y el resto va a "Otras". Porcentajes sobre votos positivos, como en el escrutinio oficial.
el = pd.read_csv(RAIZ / "datos" / "manual" / "presidenciales_provincia.csv", dtype={"codigo_indec": str})
CAND_LISTA = {  # 2015 y 2023 no traen la formula, solo la alianza
    "ALIANZA FRENTE PARA LA VICTORIA": "Scioli", "ALIANZA CAMBIEMOS": "Macri", "ALIANZA UNIDOS POR UNA NUEVA ALTERNATIVA (UNA)": "Massa",
    "ALIANZA FRENTE DE IZQUIERDA Y DE LOS TRABAJADORES": "Del Caño", "ALIANZA PROGRESISTAS": "Stolbizer", "ALIANZA COMPROMISO FEDERAL": "Rodríguez Saá",
    "UNION POR LA PATRIA": "Massa", "LA LIBERTAD AVANZA": "Milei", "JUNTOS POR EL CAMBIO": "Bullrich", "HACEMOS POR NUESTRO PAIS": "Schiaretti",
    "FRENTE DE IZQUIERDA Y DE TRABAJADORES - UNIDAD": "Bregman"}
CAND_ARREGLO = {"De La Rúa": "De la Rúa", "Fernández De Kirchner": "Fernández de Kirchner", "Alberto Fernández": "Fernández",
                "Mauricio Macri": "Macri", "Roberto Lavagna": "Lavagna", "Nicolás Del Caño": "Del Caño", "Juan Gómez Centurión": "Gómez Centurión",
                "José Espert": "Espert", "De La Sota": "De la Sota", "Juan Gomez": "Gómez Centurión"}


def candidato(fila):
    if isinstance(fila.formula, str) and fila.formula.strip():
        c = fila.formula.split(" - ")[0].split(",")[0].strip().title()  # PASO 2015: "Apellido, Nombre - ..."
        return CAND_ARREGLO.get(c, c)
    return CAND_LISTA.get(fila.partido, "Otras")


el["candidato"] = el.apply(candidato, axis=1)
el["eleccion"] = el.anio.astype(str) + el.vuelta.map({0: "-paso", 1: "", 2: "-2"})
# PASO (vuelta 0): cada fila es una lista interna. La unidad del grafico es la agrupacion, que se nombra por su
# precandidatura mas votada en el pais. Las listas internas quedan en "precand"
el["precand"] = el.candidato
_p = el.vuelta == 0
_lab = (el[_p].groupby(["eleccion", "partido", "precand"]).votos.sum().reset_index().sort_values("votos")
        .drop_duplicates(["eleccion", "partido"], keep="last").set_index(["eleccion", "partido"]).precand)
el.loc[_p, "candidato"] = [_lab[(e_, p_)] for e_, p_ in zip(el[_p].eleccion, el[_p].partido)]
PROVISORIAS = set(el[el.fuente.str.contains("provisorio")].eleccion)
tot_el = el.drop_duplicates(["eleccion", "codigo_indec"])[["eleccion", "anio", "vuelta", "codigo_indec", "electores", "votantes", "positivos"]]
nac_el = el.groupby(["eleccion", "candidato"]).votos.sum().reset_index()
nac_el = nac_el[nac_el.candidato != "Otras"].sort_values(["eleccion", "votos"], ascending=[True, False])
TOP_EL = nac_el.groupby("eleccion").head(4).groupby("eleccion").candidato.apply(list).to_dict()
el["cand"] = [c if c in TOP_EL[e] else "Otras" for e, c in zip(el.eleccion, el.candidato)]
pres = el.groupby(["eleccion", "anio", "vuelta", "codigo_indec", "cand"]).votos.sum().reset_index()
pres = pres.merge(tot_el[["eleccion", "codigo_indec", "positivos"]], on=["eleccion", "codigo_indec"])
pais_el = pres.groupby(["eleccion", "anio", "vuelta", "cand"]).agg(votos=("votos", "sum"), positivos=("positivos", "sum")).reset_index()
pres = pd.concat([pres, pais_el.assign(codigo_indec="00")], ignore_index=True)
pres["positivos"] = pres.groupby(["eleccion", "codigo_indec"]).positivos.transform("first")
pais_pos = tot_el.groupby("eleccion").positivos.sum()
pres.loc[pres.codigo_indec == "00", "positivos"] = pres.loc[pres.codigo_indec == "00", "eleccion"].map(pais_pos)
pres["pct"] = (pres.votos / pres.positivos * 100).round(2)
presidenciales = pres.pivot_table(index=["eleccion", "anio", "vuelta", "codigo_indec"], columns="cand", values="pct").reset_index()
presidenciales["territorio"] = presidenciales.codigo_indec.map(lambda c: "Total del país" if c == "00" else CORTO[c])
# nombre de la fuerza de cada candidatura: la agrupacion que mas votos le aporto en el pais
FUERZA_EL = (el.groupby(["eleccion", "candidato", "partido"]).votos.sum().reset_index().sort_values("votos")
             .drop_duplicates(["eleccion", "candidato"], keep="last").set_index(["eleccion", "candidato"]).partido)
# participacion: votantes sobre electores habilitados
tot_el["participacion"] = tot_el.votantes / tot_el.electores * 100
# Oficialismo nacional: la formula del partido o la alianza que gobernaba al momento de votar.
# En 2003 se toma la de Kirchner, que era la del presidente Duhalde. En 1983 no hubo oficialismo (gobierno de facto).
OFICIALISMO = {"1989": "Angeloz", "1995": "Menem", "1999": "Duhalde", "2003": "Kirchner", "2007": "Fernández de Kirchner",
               "2011": "Fernández de Kirchner", "2015": "Scioli", "2015-2": "Scioli", "2019": "Macri", "2023": "Massa", "2023-2": "Massa"}
ofi = el[el.apply(lambda r: OFICIALISMO.get(r.eleccion) == r.candidato, axis=1)].groupby(["eleccion", "anio", "codigo_indec"]).votos.sum().reset_index()
ofi = ofi.merge(tot_el[["eleccion", "codigo_indec", "positivos"]], on=["eleccion", "codigo_indec"])
ofi["valor"] = ofi.votos / ofi.positivos * 100
ofi = ofi[ofi.eleccion.str.fullmatch(r"\d{4}")]  # solo primera vuelta
for c in ["participacion"]:
    d = tot_el[tot_el.vuelta == 1].rename(columns={"anio": "periodo", c: "valor"}); d["territorio"] = d.codigo_indec.map(CORTO)
    agregar(d, "participacion_presidencial", "% de los electores", "Direccion Nacional Electoral")
d = pres[pres.codigo_indec != "00"].rename(columns={"anio": "periodo", "pct": "valor"})
for e_, g_ in d.groupby("eleccion"):
    for cand_, g2 in g_.groupby("cand"):
        g2 = g2.copy(); g2["territorio"] = g2.codigo_indec.map(CORTO)
        agregar(g2, f"voto_presidente_{e_}_{norm(cand_).replace(' ', '_')}", "% de los votos positivos", "Direccion Nacional Electoral")
ELECCIONES = sorted(presidenciales.eleccion.unique(), key=lambda e: (int(e[:4]), {"-paso": 0, "": 1, "-2": 2}[e[4:]]))
ganador_el = {e: nac_el[nac_el.eleccion == e].iloc[0].candidato for e in ELECCIONES}
round1 = lambda x: r1(x)
# espacio de cada candidatura, con los mismos nombres que en el Congreso (sirve para darle el mismo color en todas las elecciones)
_PJ, _UCR, _JXC = "Peronismo", "UCR y aliados", "Cambiemos y Juntos por el Cambio"
CAND_ESP = {"Alfonsín": _UCR, "Luder": _PJ, "Menem": _PJ, "Angeloz": _UCR, "Vicente": "Izquierda", "Massaccesi": _UCR, "De la Rúa": _UCR,
            "Duhalde": _PJ, "Walsh": "Izquierda", "Kirchner": _PJ, "Rodríguez Saá": _PJ, "Fernández de Kirchner": _PJ, "Scioli": _PJ,
            "Macri": _JXC, "Del Caño": "Izquierda", "Fernández": _PJ, "Bullrich": _JXC, "Milei": "La Libertad Avanza", "Bregman": "Izquierda",
            ("2023", "Massa"): _PJ}
MINUSC = {"De", "Del", "La", "Las", "Los", "Y", "Por", "Para", "El", "Una"}


def nombre_fuerza(t):
    """Nombre legible de la agrupacion: sin aliados menores y sin el prefijo formal de alianza."""
    t = str(t).split(" - ")[0].strip()
    if t.isupper():
        t = " ".join(w.lower() if w.title() in MINUSC and i else w.title() for i, w in enumerate(t.split()))
        t = t.replace("Union", "Unión").replace("Pais", "País").replace("(Una)", "(UNA)")
    if re.match(r"Alianza (Frente|Confederaci|Concertaci|Movimiento|Izquierda|Compromiso|Coalici|Uni[oó]n para|Afirmaci|Cambiemos|Progresistas|Unidos)", t):
        t = t[len("Alianza "):]
    return t


el_meta = []
for e in ELECCIONES:
    pp = presidenciales[(presidenciales.eleccion == e) & (presidenciales.codigo_indec != "00")]
    g_ = ganador_el[e]
    otros_gan = pp.set_index("territorio")[TOP_EL[e]].idxmax(axis=1)
    _int = el[el.eleccion == e].groupby(["candidato", "precand"]).votos.sum()
    _listas = {c: [{"n": k, "pct": round1(v / pais_pos[e] * 100)} for k, v in _int[c].sort_values(ascending=False).items()]
               for c in TOP_EL[e]} if e.endswith("-paso") else {}
    el_meta.append({"id": e, "anio": int(e[:4]), "vuelta": {"-paso": 0, "": 1, "-2": 2}[e[4:]],
                    "candidatos": [{"c": c, "fuerza": nombre_fuerza(FUERZA_EL.get((e, c), "")), "espacio": CAND_ESP.get((e[:4], c), CAND_ESP.get(c, "Otras fuerzas")),
                                    "listas": _listas.get(c, [])} for c in TOP_EL[e]],
                    "ganador": g_, "pct_ganador": round1(float(presidenciales[(presidenciales.eleccion == e) & (presidenciales.codigo_indec == "00")][g_].iloc[0])),
                    "prov_ganador": int((otros_gan == g_).sum()),
                    "max_prov": pp.sort_values(g_).iloc[-1].territorio, "max_v": round1(pp[g_].max()),
                    "min_prov": pp.sort_values(g_).iloc[0].territorio, "min_v": round1(pp[g_].min()),
                    "participacion": round1(tot_el[tot_el.eleccion == e].votantes.sum() / tot_el[tot_el.eleccion == e].electores.sum() * 100),
                    "provisorio": e in PROVISORIAS,
                    "oficialismo": OFICIALISMO.get(e)})
pres_w = presidenciales
presidenciales = pres[["eleccion", "codigo_indec", "cand", "pct"]].rename(columns={"cand": "candidato"}).sort_values(["eleccion", "codigo_indec", "pct"], ascending=[True, True, False])
presidenciales["territorio"] = presidenciales.codigo_indec.map(lambda c: "Total del país" if c == "00" else CORTO[c])

# ---------------------------------------------------------------- congreso
# Senado: listado historico oficial (senado.gob.ar). Diputados: datos abiertos de la HCDN desde 2007 y, de 1983 a 2007,
# el Patrimonio Legislativo de la HCDN (scripts/legisladores/). Desde 2007 los diputados figuran con su bloque real,
# antes y en el Senado con el partido o la alianza por la que fueron electos.
# Espacios: agrupacion amplia y neutral de cada bloque o partido. La UCR y el PRO van separados: el PRO no existia
# como fuerza nacional antes de 2005. Las alianzas Cambiemos y Juntos por el Cambio (2015 a 2023) van aparte cuando la
# fuente solo da el nombre de la alianza (el Senado), porque no se puede saber de que partido era cada legislador.
HOY = pd.Timestamp.now().normalize()
ESPACIOS = ["Peronismo", "UCR y aliados", "PRO", "Cambiemos y Juntos por el Cambio", "La Libertad Avanza", "Izquierda",
            "Fuerzas provinciales", "Otras fuerzas"]
ESPACIO_FAM = {"peronismo": "Peronismo", "UCR / Cambiemos / JxC": "UCR y aliados", "LLA / libertarios": "La Libertad Avanza",
               "izquierda": "Izquierda", "partidos provinciales": "Fuerzas provinciales"}
REGLAS_ESPACIO = [  # la primera que coincide gana; si ninguna coincide, se usa la familia de scripts/legisladores/build.py
    ("Otras fuerzas", r"FREPASO|FRENTE GRANDE|PAIS SOLIDARIO|FRENTE PROGRESISTA|\bGEN\b|ENCUENTRO FEDERAL|COALICION CIVICA|\bARI\b|"
                      r"AFIRMACION PARA UNA REPUBLICA|HACEMOS COALICION|CAMBIO FEDERAL|RECREAR|JUNTOS POR ARGENTINA"),
    # frentes provinciales y bloques de gobernadores: aparte, aunque algunos tengan origen peronista o radical
    ("Fuerzas provinciales", r"CONCORDIA|INNOVACION FEDERAL|ARGENTINA FEDERAL|FRENTE CIVICO POR SANTIAGO|PROVINCIAS UNIDAS|NEUQUINO|"
                             r"^INDEPENDENCIA$|PRIMERO SAN LUIS|MOVERE|^MISIONES$|FRENTE CIVICO DE LA PROVINCIA"),
    ("PRO", r"^PRO\b|UNION PRO|PROPUESTA REPUBLICANA|FRENTE PRO$"),
    ("Cambiemos y Juntos por el Cambio", r"CAMBIEMOS|JUNTOS POR EL CAMBIO|TODOS JUNTOS POR SAN JUAN|ECO \+ VAMOS|UNION PARA VIVIR MEJOR"),
]


def espacio_leg(bloque, fam):
    b = norm(bloque).upper() if isinstance(bloque, str) else ""
    for esp_, rx in REGLAS_ESPACIO:
        if re.search(rx, b):
            return esp_
    return ESPACIO_FAM.get(fam, "Otras fuerzas")


leg = []
for camara, archivo in [("Diputados", "diputados_nacionales.csv"), ("Senado", "senadores_nacionales.csv")]:
    d = pd.read_csv(RAIZ / "datos" / "manual" / archivo, parse_dates=["inicio", "fin", "mandato_inicio", "mandato_fin"])
    d["camara"] = camara
    leg.append(d)
leg = pd.concat(leg, ignore_index=True)
leg["inicio_aprox"] = leg.inicio_aprox.fillna(False).astype(bool)
# en el Senado, las observaciones dicen a quien reemplaza o de quien completa el mandato un senador
_obs = leg.observaciones.fillna("").str.extract(r"(?i)(?:REEMPLAZA|COMPLETA)(.*)")[0]
leg["reemplaza"] = leg.reemplaza.where(leg.camara == "Diputados", _obs)
leg["codigo_indec"] = leg.provincia.map(codigo)
assert leg.codigo_indec.notna().all(), leg[leg.codigo_indec.isna()].provincia.unique()
leg["espacio"] = [espacio_leg(b, f) for b, f in zip(leg.bloque, leg.familia)]
leg["fin"] = leg.fin.fillna(pd.Timestamp("2100-01-01"))
# la fuente repite a algunas personas con dos códigos para el mismo mandato (por ejemplo, el nombre con y sin tilde): se unifican
_persona = leg.nombre.map(lambda n: re.sub(r"[^A-Z]", "", norm(n).upper()))
leg["id"] = leg.groupby([leg.camara, leg.codigo_indec, _persona, leg.mandato_fin]).id.transform("first")
# estadías en la banca: los tramos de bloque seguidos de una persona en un mandato (con hasta una semana entre uno y otro) son una
# sola. Un hueco más largo es una ausencia real (en las rotaciones de bancas, alguien deja la banca y vuelve meses después)
_e = leg.sort_values(["camara", "id", "mandato_fin", "inicio"]).copy()
_e["previo"] = _e.groupby(["camara", "id", "mandato_fin"]).fin.transform(lambda f: f.cummax().shift())
_e["estadia"] = (_e.previo.isna() | (_e.inicio > _e.previo + pd.Timedelta(days=7))).cumsum()
EST = _e.groupby("estadia").agg(camara=("camara", "first"), id=("id", "first"), mandato_fin=("mandato_fin", "first"),
                                inicio=("inicio", "min"), fin=("fin", "max"), aprox=("inicio_aprox", "max")).reset_index(drop=True)


def en_la_banca(fecha):
    """Quién ocupa cada banca en una fecha: una estadía que la cubre."""
    return (EST[(EST.inicio <= fecha) & (EST.fin >= fecha) & ~EST.aprox].sort_values("mandato_fin")
            .drop_duplicates(["camara", "id"], keep="last")[["camara", "id", "mandato_fin"]])
# un mandato por persona: del primer al ultimo tramo de bloque
man = (leg.sort_values("inicio").groupby(["camara", "id", "mandato_fin"])
       .agg(nombre=("nombre", "first"), codigo_indec=("codigo_indec", "first"), inicio=("inicio", "min"), fin=("fin", "max"),
            mandato_inicio=("mandato_inicio", "min"),
            aprox=("inicio_aprox", "max"), reemplaza=("reemplaza", "first")).reset_index())


def espacio_en(ids_fechas, clave=("camara", "id", "mandato_fin")):
    """Bloque y espacio en una fecha: el ultimo tramo de bloque que empezo antes (o el primero, si todavia no empezo)."""
    clave = list(clave)
    t = leg.merge(ids_fechas[clave + ["fecha"]], on=clave)
    t = t.assign(antes=t.inicio <= t.fecha).sort_values(["antes", "inicio"])
    return t.drop_duplicates(clave, keep="last").set_index(clave)[["bloque", "espacio"]]


# periodos legislativos: del 10 de diciembre de cada anio impar al 9 de diciembre dos anios despues
PERIODOS = [a for a in range(1983, HOY.year + 1, 2) if pd.Timestamp(f"{a}-12-10") <= HOY]
comp, filas_p = [], []
for a in PERIODOS:
    ini_p, fin_p = pd.Timestamp(f"{a}-12-10"), pd.Timestamp(f"{a + 2}-12-09")
    # composicion al 1 de marzo, cuando empiezan las sesiones ordinarias (ya asumieron los reemplazos de diciembre)
    corte = min(pd.Timestamp(f"{a + 1}-03-01"), HOY)
    # quien ocupa la banca ese día: un tramo que cubre la fecha. No alcanza con el primer y el último tramo del mandato, porque
    # puede haber un hueco (en las rotaciones de bancas una persona deja la banca y vuelve meses después)
    act = en_la_banca(corte)
    act = act.join(espacio_en(act.assign(fecha=corte)[["camara", "id", "mandato_fin", "fecha"]]), on=["camara", "id", "mandato_fin"])
    for (camara, espacio_), n in act.groupby(["camara", "espacio"]).id.count().items():
        comp.append({"camara": camara, "anio": a, "periodo": f"{a} a {a + 2}", "espacio": espacio_, "bancas": int(n)})
    # todos los que ocuparon una banca en el periodo, con los reemplazos enlazados
    # tambien quienes dejaron la banca poco antes de empezar el periodo con el mandato todavia vigente (por ejemplo, para asumir otro cargo)
    m = man[(man.inicio <= fin_p) & ((man.fin >= ini_p) | ((man.fin >= ini_p - pd.Timedelta(days=45)) & (man.mandato_fin > ini_p + pd.Timedelta(days=30))))]
    # quien renueva la banca sin interrupcion aparece una sola vez
    m = m.sort_values(["camara", "id", "inicio"]).copy()
    sigue_ = (m.camara == m.camara.shift()) & (m.id == m.id.shift()) & (m.inicio <= m.fin.shift() + pd.Timedelta(days=30))
    m["tramo"] = (~sigue_).cumsum()
    m = m.groupby("tramo").agg(camara=("camara", "first"), id=("id", "first"), mandato_fin=("mandato_fin", "last"), nombre=("nombre", "first"),
                               codigo_indec=("codigo_indec", "first"), inicio=("inicio", "first"), fin=("fin", "last"),
                               mandato_inicio=("mandato_inicio", "first"),
                               aprox=("aprox", "max"), reemplaza=("reemplaza", "first"), mf0=("mandato_fin", "first"))
    m["fecha"] = m.inicio.where(m.inicio > ini_p, ini_p)
    m = m.join(espacio_en(m.drop(columns="mandato_fin").drop_duplicates(["camara", "id"]).assign(fecha=m.fecha), ("camara", "id")), on=["camara", "id"])
    m["sale"] = m.fin < fin_p - pd.Timedelta(days=3)
    m["reemplaza_a"] = None
    _ape = m.nombre.map(lambda n: set(norm(n.split(",")[0]).upper().split()))
    for (camara, cod), g in m.groupby(["camara", "codigo_indec"]):
        # primero, los reemplazos que la fuente nombra (Patrimonio Legislativo y observaciones del Senado)
        usados = set()
        for j, r in g[g.reemplaza.notna()].sort_values("inicio").iterrows():
            txt = set(re.sub(r"[^A-Z ]", " ", norm(r.reemplaza).upper()).split())
            ok = np.array([i != j and not g.at[i, "aprox"] and i not in usados and bool(_ape[i]) and _ape[i] <= txt
                           and (r.aprox or g.at[i, "fin"] <= r.inicio + pd.Timedelta(days=15)) for i in g.index])
            prev = g[ok]
            if len(prev):
                k = prev.sort_values("fin").index[-1]
                m.at[j, "reemplaza_a"] = g.at[k, "nombre"]
                usados.add(k)
        g = m.loc[g.index]
        # despues, por fecha: quien entra a una banca de la misma provincia poco despues de que alguien la deja
        # entra a mitad de periodo, o asume a mitad de un mandato ya empezado (reemplazos de diciembre)
        tarde = (g.inicio > ini_p + pd.Timedelta(days=3)) | ((g.inicio - g.mandato_inicio).dt.days > 30)
        if camara == "Senado":  # el Senado fecha el mandato desde que asume: desde 2001 son seis anios, si dura menos completa el de otro
            tarde |= (g.inicio >= pd.Timestamp("2001-12-01")) & ((g.mandato_fin - g.inicio).dt.days < 6 * 365 - 60)
        libres = set(g[tarde & ~g.aprox & g.reemplaza_a.isna()].index)
        for i, r in g[g.sale & ~g.index.isin(usados)].sort_values("fin").iterrows():
            cand = g.loc[[j for j in libres if g.at[j, "inicio"] >= r.fin - pd.Timedelta(days=15)]]
            if len(cand):
                orden = cand.assign(mf=(cand.mandato_fin - r.mandato_fin).dt.days.abs() > 60, otro=cand.espacio != r.espacio,
                                    dias=(cand.inicio - r.fin).dt.days.abs())
                j = orden.sort_values(["mf", "otro", "dias"]).index[0]
                m.at[j, "reemplaza_a"] = r.nombre
                libres.discard(j)
    m["entra"] = ((m.inicio > ini_p + pd.Timedelta(days=3)) | m.reemplaza_a.notna()) & ~m.aprox
    m["desde"] = np.where(m.aprox & m.reemplaza_a.notna(), "sin fecha", np.where(m.entra, m.inicio.dt.strftime("%Y-%m"), ""))
    m["hasta"] = np.where(m.sale, m.fin.dt.strftime("%Y-%m"), "")
    # los reemplazos sin fecha que no se pudieron enlazar no se muestran: su periodo no se conoce
    m = m[~(m.aprox & m.reemplaza_a.isna())]
    m["periodo"] = a
    filas_p.append(m)
congreso = pd.DataFrame(comp).pivot_table(index=["camara", "anio", "periodo"], columns="espacio", values="bancas", fill_value=0).reset_index()
congreso = congreso[["camara", "anio", "periodo"] + [e for e in ESPACIOS if e in congreso.columns]]
leg_p = pd.concat(filas_p, ignore_index=True).sort_values(["periodo", "camara", "codigo_indec", "inicio", "nombre"])
leg_p["territorio"] = leg_p.codigo_indec.map(CORTO)
leg_p[["periodo", "camara", "codigo_indec", "territorio", "nombre", "bloque", "espacio", "desde", "hasta", "reemplaza_a"]].rename(
    columns={"periodo": "periodo_inicio"}).to_csv(SITIO / "legisladores_por_periodo.csv", index=False)
# version compacta para la pagina, que se carga al abrir la ficha: nombres y bloques en listas aparte
_nom = sorted(set(leg_p.nombre) | set(leg_p.reemplaza_a.dropna()))
_blo = sorted(set(leg_p.bloque.fillna("Sin dato")))
_in, _ib = {n: i for i, n in enumerate(_nom)}, {b: i for i, b in enumerate(_blo)}
(SITIO / "legisladores_por_periodo.json").write_text(json.dumps({
    "espacios": ESPACIOS, "nombres": _nom, "bloques": _blo,
    "filas": [[int(r.periodo), 0 if r.camara == "Diputados" else 1, r.codigo_indec, _in[r.nombre], _ib[r.bloque if isinstance(r.bloque, str) else "Sin dato"],
               ESPACIOS.index(r.espacio), r.desde, r.hasta, _in[r.reemplaza_a] if isinstance(r.reemplaza_a, str) else -1]
              for r in leg_p.itertuples()]}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
# hoy
# composición de hoy con el mismo criterio que cada período: quien ocupa la banca ese día
act = en_la_banca(HOY)
act = act.join(espacio_en(act.assign(fecha=HOY)[["camara", "id", "mandato_fin", "fecha"]]), on=["camara", "id", "mandato_fin"])
# representacion: habitantes por banca de diputado en cada provincia
DIP_LEY = {"02": 25, "06": 70, "10": 5, "14": 18, "18": 7, "22": 7, "26": 5, "30": 9, "34": 5, "38": 6, "42": 5, "46": 5, "50": 10,
           "54": 7, "58": 5, "62": 5, "66": 7, "70": 6, "74": 5, "78": 5, "82": 19, "86": 7, "90": 9, "94": 5}  # ley 22.847
assert sum(DIP_LEY.values()) == 257
representacion = pd.DataFrame({"codigo_indec": list(DIP_LEY), "diputados": list(DIP_LEY.values())})
representacion["territorio"] = representacion.codigo_indec.map(CORTO)
representacion["poblacion"] = representacion.codigo_indec.map(POB).round(0)
representacion["hab_por_diputado"] = (representacion.poblacion / representacion.diputados).round(0)
representacion["hab_por_senador"] = (representacion.poblacion / 3).round(0)
# peso del voto: bancas totales (diputados mas senadores) sobre la proporcion de poblacion; 1 = proporcional
representacion["peso_voto"] = ((representacion.diputados + 3) / (257 + 72)) / (representacion.poblacion / representacion.poblacion.sum())
representacion = representacion.round({"peso_voto": 2})
_rp = representacion.sort_values("hab_por_diputado")
_hoy = act.groupby(["camara", "espacio"]).id.count()
congreso_res = {
    "anio": int(max(PERIODOS)), "fecha": HOY.strftime("%d/%m/%Y"), "periodos": PERIODOS,
    "dip": {e: int(_hoy.get(("Diputados", e), 0)) for e in ESPACIOS},
    "sen": {e: int(_hoy.get(("Senado", e), 0)) for e in ESPACIOS},
    "espacios": ESPACIOS,
    "rep_min": _rp.iloc[0].territorio, "rep_min_v": int(_rp.iloc[0].hab_por_diputado),
    "rep_max": _rp.iloc[-1].territorio, "rep_max_v": int(_rp.iloc[-1].hab_por_diputado),
    "peso_max": _rp.sort_values("peso_voto").iloc[-1].territorio, "peso_max_v": float(_rp.peso_voto.max()),
    "peso_min": _rp.sort_values("peso_voto").iloc[0].territorio, "peso_min_v": float(_rp.peso_voto.min()),
    "n_dip": int((act.camara == "Diputados").sum()), "n_sen": int((act.camara == "Senado").sum()),
}
# historico completo solo para descargar
for camara, nombre_arch in [("Diputados", "diputados_nacionales.csv"), ("Senado", "senadores_nacionales.csv")]:
    h_ = leg[leg.camara == camara].copy()
    h_["fin"] = h_.fin.where(h_.fin.dt.year < 2100)
    h_.assign(territorio=h_.codigo_indec.map(CORTO))[["nombre", "codigo_indec", "territorio", "inicio", "fin", "mandato_fin", "bloque", "espacio", "fuente"]] \
        .to_csv(SITIO / nombre_arch, index=False, date_format="%Y-%m-%d")

# ---------------------------------------------------------------- presidentes y ministros
# Lugar de nacimiento de presidentes (Wikipedia, Wikidata y Casa Rosada, las tres coinciden) y de los ministros con rango
# de ministro y jefes de gabinete (anexos de gabinete de Wikipedia, corregidos con los anexos por ministerio y con
# Wikidata). Tablas armadas una sola vez con scripts/ejecutivo/. AMBA: la Ciudad y los 24 partidos del Gran Buenos Aires (INDEC).
PARTIDOS_GBA = ["Almirante Brown", "Avellaneda", "Berazategui", "Esteban Echeverría", "Ezeiza", "Florencio Varela", "General San Martín",
                "Hurlingham", "Ituzaingó", "José C. Paz", "La Matanza", "Lanús", "Lomas de Zamora", "Malvinas Argentinas", "Merlo", "Moreno",
                "Morón", "Quilmes", "San Fernando", "San Isidro", "San Miguel", "Tigre", "Tres de Febrero", "Vicente López"]
_rdp = pd.read_csv(CRUDO / "renaper_departamentos_resumen.csv")
assert _rdp[(_rdp.provincia_id == 6) & _rdp.nombre_departamento.isin(PARTIDOS_GBA)].nombre_departamento.nunique() == 24
AMBA_PCT = float((_rdp[_rdp.provincia_id == 2].cantidad.sum() + _rdp[(_rdp.provincia_id == 6) & _rdp.nombre_departamento.isin(PARTIDOS_GBA)].cantidad.sum())
                 / _rdp.cantidad.sum() * 100)


def origen(prov_, amba_):
    if not isinstance(prov_, str):
        return "Sin dato"
    if prov_.startswith("Exterior"):
        return "Otro país"
    if prov_.startswith("Ciudad"):
        return "Ciudad de Buenos Aires"
    if prov_ == "Buenos Aires":
        return "Conurbano" if str(amba_) == "True" else "Resto de Buenos Aires"
    return "Otras provincias"


ORIGENES = ["Ciudad de Buenos Aires", "Conurbano", "Resto de Buenos Aires", "Otras provincias", "Otro país", "Sin dato"]
pr = pd.read_csv(RAIZ / "datos" / "manual" / "presidentes.csv", parse_dates=["inicio", "fin"])
pr["fin_"] = pr.fin.fillna(HOY)
pr["dias"] = (pr.fin_ - pr.inicio).dt.days
pr["origen"] = [origen(a, b) for a, b in zip(pr.provincia, pr.amba)]
pr["codigo_nac"] = pr.provincia.map(codigo)
presidentes = pr.assign(inicio=pr.inicio.dt.strftime("%Y-%m-%d"), fin=pr.fin.dt.strftime("%Y-%m-%d"))[
    ["nombre", "inicio", "fin", "partido", "lugar_nacimiento", "provincia", "origen", "interino", "dias"]]
_amba_pr = pr[pr.origen.isin(["Ciudad de Buenos Aires", "Conurbano"])]
pres_res = {"n": int(len(pr)), "amba": int(len(_amba_pr)), "amba_nombres": list(_amba_pr.nombre),
            "anios_amba": round1(_amba_pr.dias.sum() / 365.25), "anios": round1(pr.dias.sum() / 365.25),
            "pct_tiempo_amba": round1(_amba_pr.dias.sum() / pr.dias.sum() * 100), "amba_pob": round1(AMBA_PCT),
            "prov_distintas": int(pr.provincia.nunique())}
mi = pd.read_csv(RAIZ / "datos" / "manual" / "ministros.csv")
mi["origen"] = [origen(a, b) for a, b in zip(mi.provincia_nacimiento, mi.amba)]
INTERINOS = {"Ramón Puerta", "Adolfo Rodríguez Saá", "Eduardo Camaño"}
mi["gobierno"] = mi.presidente.where(~mi.presidente.isin(INTERINOS), "Interinos de 2001")
ORDEN_GOB = list(dict.fromkeys(mi.sort_values("inicio").gobierno))
_pm = mi.drop_duplicates(["gobierno", "nombre"])
gab = _pm.groupby(["gobierno", "origen"]).nombre.count().unstack(fill_value=0).reindex(ORDEN_GOB)
gab = gab[[o for o in ORIGENES if o in gab.columns]]
gab_pct = gab.div(gab.drop(columns=["Sin dato"], errors="ignore").sum(axis=1), axis=0) * 100
gabinetes = gab_pct.drop(columns=["Sin dato"], errors="ignore").round(1).reset_index()
gabinetes["ministros"] = gab.sum(axis=1).values
gabinetes["con_dato"] = gab.drop(columns=["Sin dato"], errors="ignore").sum(axis=1).values
personas = mi.drop_duplicates("nombre")
_amba_mi = personas[personas.origen.isin(["Ciudad de Buenos Aires", "Conurbano"])]
_con = personas[personas.origen != "Sin dato"]
por_prov_mi = personas.assign(codigo_indec=personas.provincia_nacimiento.map(codigo)).dropna(subset=["codigo_indec"]).groupby("codigo_indec").nombre.count()
ministros_prov = pd.DataFrame({"codigo_indec": sorted(DIP_LEY)})
ministros_prov["territorio"] = ministros_prov.codigo_indec.map(CORTO)
ministros_prov["ministros"] = ministros_prov.codigo_indec.map(por_prov_mi).fillna(0).astype(int)
ministros_prov["por_millon"] = (ministros_prov.ministros / ministros_prov.codigo_indec.map(POB) * 1e6).round(2)
_g = gabinetes.set_index("gobierno")
_amba_gob = (_g["Ciudad de Buenos Aires"] + _g.get("Conurbano", 0))
gab_res = {"personas": int(len(personas)), "con_dato": int(len(_con)), "amba": int(len(_amba_mi)),
           "pct_amba": round1(len(_amba_mi) / len(_con) * 100), "caba": int((_con.origen == "Ciudad de Buenos Aires").sum()),
           "sin_ministro": list(ministros_prov[ministros_prov.ministros == 0].territorio),
           "max_gob": list(_amba_gob[_amba_gob.round(1) == _amba_gob.round(1).max()].index), "max_gob_v": round1(_amba_gob.max()),
           "min_gob": _amba_gob.drop("Interinos de 2001").idxmin(), "min_gob_v": round1(_amba_gob.drop("Interinos de 2001").min()),
           "top_otras": ministros_prov[~ministros_prov.codigo_indec.isin(["02", "06"])].sort_values("ministros").iloc[-1].territorio,
           "top_otras_v": int(ministros_prov[~ministros_prov.codigo_indec.isin(["02", "06"])].ministros.max())}
ministros_lista = mi.assign(provincia=mi.provincia_nacimiento)[["nombre", "ministerio", "inicio", "fin", "presidente", "partido", "lugar_nacimiento", "provincia", "origen"]]
ministros_lista.to_csv(SITIO / "ministros_nacionales.csv", index=False)

# ---------------------------------------------------------------- transferencias de la Nacion a las provincias
# Presupuesto Abierto: credito devengado de las transferencias a gobiernos provinciales y municipales, por provincia de
# destino (scripts/transferencias_presupuesto.py). ATN, otras no automaticas y las fijadas por ley o por fallo.
# Desde 2000, primer anio con los ATN asignados a cada provincia, hasta el ultimo anio completo.
# Pesos del ultimo anio con el deflactor del PBI (INDEC, via Banco Mundial). Por habitante con las proyecciones del INDEC.
trf = pd.read_csv(RAIZ / "datos" / "manual" / "transferencias_provincias.csv", dtype={"codigo_indec": str})
TR_ULT = int(HOY.year - 1)
defl = bm("NY.GDP.DEFL.ZS")
defl = defl[defl.pais == "ARG"].set_index("anio").valor
assert TR_ULT in defl.index and trf.anio.max() >= TR_ULT
trf = trf[(trf.anio >= 2000) & (trf.anio <= TR_ULT)].copy()
trf["real"] = trf.millones_corrientes * defl[TR_ULT] / trf.anio.map(defl)  # millones de pesos del ultimo anio
_hp = snic_prov[snic_prov.codigo_delito_snic_nombre == "Hurtos"].copy()
POB_T = (_hp.cantidad_hechos / _hp.tasa_hechos * 1e5).groupby([_hp.provincia_id, _hp.anio]).first()
TIPO_T = {"ATN": "atn", "Otras no automáticas": "otras", "Por ley o por fallo": "ley"}
_tp = trf[trf.codigo_indec != "sin provincia"].pivot_table(index=["anio", "codigo_indec"], columns="tipo", values="real", aggfunc="sum")
_grid = pd.MultiIndex.from_product([range(2000, TR_ULT + 1), sorted(DIP_LEY)], names=["anio", "codigo_indec"])
transf = _tp.reindex(_grid).fillna(0).rename(columns=TIPO_T).reset_index()
transf["pob"] = [POB_T.get((c, a)) for c, a in zip(transf.codigo_indec, transf.anio)]
assert transf.pob.notna().all()
transf["territorio"] = transf.codigo_indec.map(CORTO)
for k in ["atn", "otras", "ley"]:
    transf[f"{k}_hab"] = transf[k] * 1e6 / transf.pob  # pesos del ultimo anio por habitante
    _pais = transf.groupby("anio")[k].sum() * 1e6 / transf.groupby("anio").pob.sum()
    transf[f"{k}_indice"] = transf[f"{k}_hab"] / transf.anio.map(_pais) * 100  # 100 = promedio del pais ese anio
transf_serie = trf.groupby(["anio", "tipo"]).real.sum().unstack(fill_value=0).rename(columns=TIPO_T).reset_index()
transf_serie[["atn", "otras", "ley"]] = transf_serie[["atn", "otras", "ley"]] / 1000  # miles de millones
transf_serie["provincias_atn"] = transf_serie.anio.map(transf[transf.atn > 0].groupby("anio").codigo_indec.nunique()).fillna(0).astype(int)
# acumulado del periodo: suma de lo recibido por habitante cada anio
acum_t = transf.groupby(["codigo_indec", "territorio"])[["atn_hab", "otras_hab", "ley_hab"]].sum().reset_index()
acum_t["atn_pct"] = acum_t.codigo_indec.map(transf.groupby("codigo_indec").atn.sum() / transf.atn.sum() * 100)
acum_t["pob_pct"] = acum_t.codigo_indec.map(transf[transf.anio == TR_ULT].set_index("codigo_indec").pob / transf[transf.anio == TR_ULT].pob.sum() * 100)
_u = transf[transf.anio == TR_ULT]
_ua = _u[_u.atn > 0].sort_values("atn_hab")
_pico = transf_serie.sort_values("atn").iloc[-1]
_ac = acum_t.sort_values("atn_hab")
transf_res = {
    "ult": TR_ULT, "desde": 2000,
    "atn_ult": round1(transf_serie.set_index("anio").atn[TR_ULT]), "n_atn_ult": int(len(_ua)),
    "atn_ult_max": _ua.iloc[-1].territorio if len(_ua) else None, "atn_ult_max_v": round(float(_ua.atn_hab.max())) if len(_ua) else 0,
    "atn_ult_min": _ua.iloc[0].territorio if len(_ua) else None, "atn_ult_min_v": round(float(_ua.atn_hab.min())) if len(_ua) else 0,
    "sin_atn_ult": list(_u[_u.atn == 0].territorio),
    "atn_pico_anio": int(_pico.anio), "atn_pico_v": round1(_pico.atn),
    "atn_acum_max": _ac.iloc[-1].territorio, "atn_acum_max_v": round(float(_ac.atn_hab.max())),
    "atn_acum_min": _ac.iloc[0].territorio, "atn_acum_min_v": round(float(_ac.atn_hab.min())),
    "atn_acum_max_pct": round1(_ac.iloc[-1].atn_pct), "atn_acum_max_pob": round1(_ac.iloc[-1].pob_pct),
    "otras_ult": round1(transf_serie.set_index("anio").otras[TR_ULT]),
    "otras_ult_max": _u.sort_values("otras_hab").iloc[-1].territorio, "otras_ult_max_v": round(float(_u.otras_hab.max())),
    "otras_ult_min": _u.sort_values("otras_hab").iloc[0].territorio, "otras_ult_min_v": round(float(_u.otras_hab.min())),
    "otras_ult_pais": round(float(_u.otras.sum() * 1e6 / _u.pob.sum())),
    "otras_pico_anio": int(transf_serie.sort_values("otras").iloc[-1].anio), "otras_pico_v": round1(transf_serie.otras.max()),
}
transf = transf.round({"atn": 2, "otras": 2, "ley": 2, "pob": 0, "atn_hab": 0, "otras_hab": 0, "ley_hab": 0, "atn_indice": 1, "otras_indice": 1, "ley_indice": 1})
transf_serie = transf_serie.round(2)
acum_t = acum_t.round({"atn_hab": 0, "otras_hab": 0, "ley_hab": 0, "atn_pct": 2, "pob_pct": 2})

# ---------------------------------------------------------------- votaciones nominales en el Congreso
# Actas de votacion nominal de Diputados (votaciones.hcdn.gob.ar, desde 1993) y del Senado (senado.gob.ar/votaciones/actas,
# desde 2005), en la copia que mantiene el proyecto abierto Como Voto (github.com/rquiroga7/como_voto). 01_descargar.py la
# guarda comprimida. Cada voto: [legislador, bloque, provincia, voto], con 1 afirmativo, 2 negativo, 3 abstencion,
# 4 ausente y 5 presidente de la sesion (no vota salvo empate, se descarta). Los totales de las leyes clave se cotejaron con
# las actas oficiales (scripts/verificar_votaciones.py). El Senado no publica algunas actas nominales (por ejemplo, la de
# la resolucion 125 en 2008): esas leyes quedan solo con Diputados.
# Espacio de cada voto: el bloque del acta con las mismas reglas que la composicion del Congreso (REGLAS_ESPACIO y
# scripts/legisladores/familias.py).
import gzip, sys
sys.path.insert(0, str(RAIZ / "scripts" / "legisladores"))
from familias import familia

_filas_v, _meta_v, VOT_DESCARTADAS = [], [], []
for cam, arch in [("Diputados", "diputados"), ("Senado", "senadores")]:
    db = json.loads(gzip.decompress((CRUDO / f"congreso_votaciones_{arch}.json.gz").read_bytes()))
    _cod_p = [codigo(p.replace("C.A.B.A.", "caba").replace("Capital Federal", "caba")) for p in db["provinces"]]
    _esp_b = [espacio_leg(b, familia(b)) for b in db["blocs"]]
    for e in db["votaciones"]:
        m = re.search(r"(\d{2})/(\d{2})/(\d{4})", e["d"])
        if not m:
            continue
        vv = np.array(e["v"] if isinstance(e["v"], list) else json.loads(e["v"]), dtype=int).reshape(-1, 4)
        if len(vv) and (vv[:, 0].max() >= len(db["names"]) or vv[:, 1].max() >= len(db["blocs"]) or vv[:, 2].max() >= len(db["provinces"])):
            VOT_DESCARTADAS.append(f"{cam} {e['id']}")  # indices fuera de rango en la copia (4 actas de 2011 y 2012)
            continue
        vv = vv[(vv[:, 3] >= 1) & (vv[:, 3] <= 4)]
        _meta_v.append((cam, str(e["id"]), pd.Timestamp(f"{m.group(3)}-{m.group(2)}-{m.group(1)}")))
        _filas_v.append(pd.DataFrame({"camara": cam, "vid": str(e["id"]), "nombre": [db["names"][i] for i in vv[:, 0]],
                                      "bloque": [db["blocs"][i] for i in vv[:, 1]], "espacio": [_esp_b[i] for i in vv[:, 1]],
                                      "codigo_indec": [_cod_p[i] for i in vv[:, 2]], "voto": vv[:, 3]}))
votos = pd.concat(_filas_v, ignore_index=True)
votos = votos.merge(pd.DataFrame(_meta_v, columns=["camara", "vid", "fecha"]), on=["camara", "vid"])
votos["codigo_indec"] = votos.codigo_indec.where(votos.codigo_indec.isin(DIP_LEY))

# Espacio del gobierno nacional en cada fecha (presidentes desde 1989). En el gobierno de Macri, el PRO y la alianza
# Cambiemos. El bloque oficialista de cada votacion es el bloque mas numeroso de ese espacio en la camara.
GOBIERNOS = [("1989-07-08", "Menem", ("Peronismo",)), ("1999-12-10", "De la Rúa", ("UCR y aliados",)),
             ("2001-12-21", "Duhalde", ("Peronismo",)), ("2003-05-25", "Kirchner", ("Peronismo",)),
             ("2007-12-10", "Fernández de Kirchner", ("Peronismo",)), ("2015-12-10", "Macri", ("PRO", "Cambiemos y Juntos por el Cambio")),
             ("2019-12-10", "Fernández", ("Peronismo",)), ("2023-12-10", "Milei", ("La Libertad Avanza",))]
_gi = pd.Series([pd.Timestamp(f) for f, _, _ in GOBIERNOS])


def gobierno(fecha):
    return GOBIERNOS[int((_gi <= fecha).sum()) - 1]


VOTOS_N = {1: "si", 2: "no", 3: "abs", 4: "aus"}
_pos = []
for (cam, vid), g in votos.groupby(["camara", "vid"], sort=False):
    _, pres, esp_g = gobierno(g.fecha.iloc[0])
    g_of = g[g.espacio.isin(esp_g)]
    if g_of.empty:
        continue
    blo = g_of.bloque.value_counts().index[0]
    b = g[g.bloque == blo].voto.value_counts()
    si_, no_ = b.get(1, 0), b.get(2, 0)
    if si_ == no_:
        continue
    pos = 1 if si_ > no_ else 2
    pres_v = g[g.voto <= 3]
    distinto = (pres_v.voto != pos).mean() if len(pres_v) else 0
    _pos.append((cam, vid, pres, blo, pos, distinto))
pos_v = pd.DataFrame(_pos, columns=["camara", "vid", "presidente", "bloque_of", "pos", "distinto"])

# ---- leyes clave: como voto cada espacio y cada legislador
lc = pd.read_csv(RAIZ / "datos" / "manual" / "leyes_clave.csv", dtype={"dip": str, "sen": str})
_esp_idx = {e: i for i, e in enumerate(ESPACIOS)}
_nom_v, _blo_v, leyes_v, filas_csv = {}, {}, [], []
for r in lc.itertuples():
    # ed: ley de efecto directo (selección propia, columna efecto_directo de leyes_clave.csv, criterio en la nota de la ficha)
    ley = {"k": r.clave, "anio": int(r.anio), "nombre": r.nombre, "que": r.que_cambia, "desenlace": r.desenlace,
           "ed": str(r.efecto_directo).strip().lower() in ("sí", "si"), "camaras": {}}
    for cam, vid in [("Diputados", r.dip), ("Senado", r.sen)]:
        if not isinstance(vid, str):
            continue
        g = votos[(votos.camara == cam) & (votos.vid == vid)]
        assert len(g) > (200 if cam == "Diputados" else 60), (r.clave, cam, len(g))
        fecha = g.fecha.iloc[0]
        _, pres, esp_g = gobierno(fecha)
        cuenta = {VOTOS_N[k]: int(v) for k, v in g.voto.value_counts().items()}
        por_esp = {e: [int((x.voto == k).sum()) for k in (1, 2, 3, 4)] for e, x in g.groupby("espacio")}
        ley["camaras"][cam] = {"fecha": fecha.strftime("%Y-%m-%d"), "gobierno": pres, "esp_gob": list(esp_g),
                               "total": {k: cuenta.get(k, 0) for k in ["si", "no", "abs", "aus"]},
                               "espacios": {e: por_esp[e] for e in ESPACIOS if e in por_esp}}
        for x in g.itertuples():
            filas_csv.append({"ley": r.nombre, "camara": cam, "fecha": fecha.strftime("%Y-%m-%d"), "legislador": x.nombre, "bloque": x.bloque,
                              "espacio": x.espacio, "provincia": CORTO.get(x.codigo_indec, ""), "voto": {1: "Afirmativo", 2: "Negativo", 3: "Abstención", 4: "Ausente"}[x.voto]})
    leyes_v.append(ley)
votos_clave = pd.DataFrame(filas_csv)
votos_clave.to_csv(SITIO / "votaciones_leyes_clave.csv", index=False)
# version compacta para los puntos de cada legislador, que se carga al abrir la ficha
_nv = sorted(set(votos_clave.legislador))
_bv = sorted(set(votos_clave.bloque))
_inv, _ibv = {n: i for i, n in enumerate(_nv)}, {b: i for i, b in enumerate(_bv)}
_cod_corto = {v: k for k, v in CORTO.items()}
_vn = {"Afirmativo": 1, "Negativo": 2, "Abstención": 3, "Ausente": 4}
(SITIO / "votaciones_leyes_clave.json").write_text(json.dumps({
    "espacios": ESPACIOS, "nombres": _nv, "bloques": _bv,
    "votos": {f"{k}|{c}": [[_inv[x.legislador], _ibv[x.bloque], _esp_idx[x.espacio], _cod_corto.get(x.provincia, ""), _vn[x.voto]]
                           for x in g.itertuples()] for (k, c), g in votos_clave.assign(k=votos_clave.ley.map(dict(zip(lc.nombre, lc.clave)))).groupby(["k", "camara"])}},
    ensure_ascii=False, separators=(",", ":")), encoding="utf-8")


# ---- apoyo al gobierno de los legisladores de cada provincia y ATN
# En cada votacion dividida (al menos una cuarta parte de los presentes voto distinto que el bloque oficialista), se mira
# si cada legislador de fuera del bloque oficialista voto igual que ese bloque. Presentes: afirmativo, negativo o abstencion.
# Por provincia y anio, porcentaje de votos coincidentes, sumando las dos camaras. Desde 2005, primer anio con Senado.
AP_DESDE = 2005
_vd = pos_v[pos_v.distinto >= 0.25]
_ap = votos.merge(_vd, on=["camara", "vid"])
_ap = _ap[(_ap.bloque != _ap.bloque_of) & (_ap.voto <= 3) & _ap.codigo_indec.notna() & (_ap.fecha.dt.year >= AP_DESDE)]
_ap = _ap.assign(anio=_ap.fecha.dt.year, coincide=(_ap.voto == _ap.pos))
apoyo = _ap.groupby(["anio", "codigo_indec"]).agg(apoyo=("coincide", "mean"), votos=("coincide", "size")).reset_index()
apoyo["apoyo"] = apoyo.apoyo * 100
apoyo["territorio"] = apoyo.codigo_indec.map(CORTO)
apoyo = apoyo.merge(transf[["anio", "codigo_indec", "atn_hab", "otras_hab"]], on=["anio", "codigo_indec"], how="left")
apoyo["presidente"] = apoyo.anio.map(lambda a: gobierno(pd.Timestamp(f"{a}-07-01"))[1])
_div_anio = _vd.merge(votos[["camara", "vid", "fecha"]].drop_duplicates(["camara", "vid"]), on=["camara", "vid"])
_div_anio = _div_anio.groupby(_div_anio.fecha.dt.year).size()
AP_ANIOS = [a for a in range(AP_DESDE, TR_ULT + 1) if apoyo[apoyo.anio == a].codigo_indec.nunique() == 24]
apoyo_res = {"desde": AP_DESDE, "hasta": AP_ANIOS[-1], "anios": []}
for a in AP_ANIOS:
    t = apoyo[apoyo.anio == a]
    con = t[t.atn_hab > 0]
    apoyo_res["anios"].append({"anio": a, "presidente": t.presidente.iloc[0], "votaciones": int(_div_anio.get(a, 0)),
                               "r_atn": spearman(t.atn_hab.values, t.apoyo.values) if len(con) >= 8 else None,
                               "r_otras": spearman(t.otras_hab.values, t.apoyo.values),
                               "n_atn": int(len(con)), "max": t.sort_values("apoyo").iloc[-1].territorio, "max_v": round1(t.apoyo.max()),
                               "min": t.sort_values("apoyo").iloc[0].territorio, "min_v": round1(t.apoyo.min())})
apoyo = apoyo[apoyo.anio.isin(AP_ANIOS)].round({"apoyo": 1})
# ---- voto de los legisladores en las leyes clave y voto de su provincia al presidente
# Por gobierno y provincia: porcentaje de los votos de sus diputados y senadores presentes que coincidieron con la posicion
# del bloque oficialista en las leyes clave, contra el porcentaje de votos positivos que ese presidente saco en la
# provincia en la primera vuelta de la eleccion que lo llevo al gobierno. Incluye a los legisladores del bloque oficialista.
ELECCION_DEL_GOBIERNO = {"Kirchner": "2003", "Macri": "2015", "Fernández": "2019", "Milei": "2023"}
def _eleccion_gob(fecha, pres):
    if pres == "Fernández de Kirchner":
        return "2007" if fecha < pd.Timestamp("2011-12-10") else "2011"
    return ELECCION_DEL_GOBIERNO.get(pres)
_pp = el.groupby(["eleccion", "candidato", "codigo_indec"]).votos.sum().reset_index().merge(
    tot_el[["eleccion", "codigo_indec", "positivos"]], on=["eleccion", "codigo_indec"])
_pp["pct_presidente"] = _pp.votos / _pp.positivos * 100
_rv = []
for r in lc.itertuples():
    for cam, vid in [("Diputados", r.dip), ("Senado", r.sen)]:
        if not isinstance(vid, str):
            continue
        pv = pos_v[(pos_v.camara == cam) & (pos_v.vid == vid)]
        if pv.empty:
            continue
        g = votos[(votos.camara == cam) & (votos.vid == vid) & (votos.voto <= 3) & votos.codigo_indec.notna()]
        _rv.append(g.assign(ley=r.clave, presidente=pv.presidente.iloc[0], coincide=(g.voto == pv.pos.iloc[0])))
_rv = pd.concat(_rv)
_rv["eleccion"] = [_eleccion_gob(f, pr) for f, pr in zip(_rv.fecha, _rv.presidente)]
_rv = _rv[_rv.eleccion.notna()]
rep_voto = _rv.groupby(["presidente", "eleccion", "codigo_indec"]).agg(
    pct_coincide=("coincide", "mean"), votos=("coincide", "size"), leyes=("ley", "nunique")).reset_index()
rep_voto["pct_coincide"] *= 100
rep_voto = rep_voto.merge(_pp.rename(columns={"candidato": "presidente"})[["eleccion", "presidente", "codigo_indec", "pct_presidente"]],
                          on=["eleccion", "presidente", "codigo_indec"], how="left")
rep_voto["territorio"] = rep_voto.codigo_indec.map(CORTO)
rep_voto = rep_voto[["presidente", "eleccion", "codigo_indec", "territorio", "pct_presidente", "pct_coincide", "votos", "leyes"]].round(1)
rep_res = []
for (pr, ec), t in rep_voto.groupby(["presidente", "eleccion"], sort=False):
    t = t.dropna(subset=["pct_presidente"])
    leyes_g = sorted(_rv[(_rv.presidente == pr) & (_rv.eleccion == ec)].ley.unique())
    rep_res.append({"presidente": pr, "eleccion": ec, "leyes": len(leyes_g), "n": int(len(t)),
                    "anios": [int(min(lc[lc.clave.isin(leyes_g)].anio)), int(max(lc[lc.clave.isin(leyes_g)].anio))],
                    "r": spearman(t.pct_presidente.values, t.pct_coincide.values) if len(t) >= 20 else None})
rep_res.sort(key=lambda x: x["anios"][0])

# metadatos de la seccion
_meta_cv = json.loads((CRUDO / "congreso_votaciones_meta.json").read_text(encoding="utf-8"))
votaciones_res = {
    "leyes": leyes_v, "espacios": ESPACIOS, "commit": _meta_cv["commit"][:7], "descargado": _meta_cv["descargado"],
    "n_dip": int(votos[votos.camara == "Diputados"].vid.nunique()), "n_sen": int(votos[votos.camara == "Senado"].vid.nunique()),
    # primer anio con al menos 20 votaciones (el Senado tiene un acta suelta de 1983)
    **{f"{k}_desde": int(_c[_c >= 20].index.min()) for k, cam in [("dip", "Diputados"), ("sen", "Senado")]
       for _c in [votos[votos.camara == cam].drop_duplicates("vid").fecha.dt.year.value_counts()]},
    "ult": votos.fecha.max().strftime("%Y-%m-%d"), "descartadas": len(VOT_DESCARTADAS),
    "apoyo": apoyo_res,
    "representacion": rep_res,
}

# ---------------------------------------------------------------- cruces entre indicadores provinciales
# Una fila por provincia y una columna por indicador, para el explorador de cruces del sitio.
# Solo tasas, porcentajes o valores por habitante: cruzar totales solo mostraria el tamanio de cada provincia.
# Las tasas de suicidio quedan fuera, igual que en el perfil provincial.
REGION = {"02": "CABA", **{c: "Pampeana" for c in ["06", "14", "30", "42", "82"]},
          **{c: "NOA" for c in ["10", "38", "46", "66", "86", "90"]}, **{c: "NEA" for c in ["18", "22", "34", "54"]},
          **{c: "Cuyo" for c in ["50", "70", "74"]}, **{c: "Patagonia" for c in ["26", "58", "62", "78", "94"]}}
cru = pd.DataFrame({"codigo_indec": sorted(REGION)})
cru["territorio"] = cru.codigo_indec.map(CORTO)
cru["region"] = cru.codigo_indec.map(REGION)
cru["poblacion"] = cru.codigo_indec.map(POB).round(0)
sup = pd.read_csv(CRUDO / "ciam_superficie_provincias.csv", sep=";", dtype=str)
sup["codigo_indec"] = sup["jurisdicción"].map(codigo)
sup["km2"] = pd.to_numeric(sup.superficie_en_km2, errors="coerce")
# La fuente suma a Tierra del Fuego el sector antartico y las islas del Atlantico Sur. Para la densidad
# se usa la superficie de la parte americana de la provincia, como hace el INDEC (21.571 km2).
sup.loc[sup.codigo_indec == "94", "km2"] = 21571
cru["densidad"] = cru.codigo_indec.map(sup.dropna(subset=["codigo_indec"]).set_index("codigo_indec").km2).rdiv(cru.poblacion)
snic_25 = snic_prov[snic_prov.anio == ANIO_SNIC]


def snic_tasa(nombre, col="tasa_hechos"):
    return snic_25[snic_25.codigo_delito_snic_nombre == nombre].set_index("provincia_id")[col]


cru["homicidios"] = cru.codigo_indec.map(snic_tasa("Homicidios dolosos", "tasa_victimas"))
cru["robos"] = cru.codigo_indec.map(snic_tasa("Robos (excluye los agravados por el resultado de lesiones y/o muertes)"))
cru["viales"] = cru.codigo_indec.map(snic_tasa("Muertes en accidentes viales", "tasa_victimas"))


def columna(tabla, col):
    return cru.codigo_indec.map(tabla.set_index("codigo_indec")[col])


cru["mortalidad_infantil"] = columna(mi_prov, "tmi_actual")
cru["madres_adolescentes"] = columna(ado_prov, "pct_2024")
cru["escolarizacion"] = columna(esc_prov, "tasa_final")
cru["aprender_mat"] = columna(ap_prov, "mat_logra")
cru["aprender_len"] = columna(ap_prov, "len_logra")
cru["empleo_privado"] = columna(emp, "cada_100")
cru["empleo_var"] = columna(emp, "var_12m")
cru["protegida"] = columna(area, "pct_territorio")
cru["turistas_eti"] = columna(etp, "cada_1000")
cru["autos"] = columna(pat_prov, "autos_1000")
cru["motos"] = columna(pat_prov, "motos_1000")
cru["esperanza_vida"] = columna(ev, "total")
for c in CENSO_COLS:
    cru[c] = columna(censo, c)
cru["internet_fijo"] = columna(internet_fijo, "accesos_100_hogares")
cru["velocidad"] = columna(internet_fijo, "mbps")
cru["exportaciones"] = columna(exp_prov, "usd_por_habitante")
if empresas is not None:
    cru["empresas"] = columna(empresas, "cada_1000_hab")
    cru["empresas_neta"] = columna(empresas, f"tasa_neta_{emp_res['ult'] - 4}_{emp_res['ult']}")
cru["extranjeros"] = columna(extranjeros, "cada_100")
cru["natalidad"] = cru.codigo_indec.map(natalidad)
cru["autonomia_fiscal"] = columna(fiscal, "autonomia")
cru["resultado_fiscal"] = columna(fiscal, "resultado")
cru["gasto_personal"] = columna(fiscal, "personal")
cru["peso_voto"] = columna(representacion, "peso_voto")
cru["vejez"] = columna(envejec, "vejez_hoy")
for k_ in ["pct_pob_solo_cobertura_publica", "pct_hog_nbi_2022", "pct_25mas_secundario_completo_o_mas", "pct_hog_cloaca"]:
    cru[k_] = columna(nse, k_)
cru["atn_hab"] = columna(acum_t.assign(v=acum_t.atn_hab / (TR_ULT - 1999)), "v")
cru["transf_no_aut_hab"] = columna(transf[transf.anio == TR_ULT], "otras_hab")
cru["apoyo_gobierno"] = columna(apoyo[apoyo.anio == apoyo_res["hasta"]], "apoyo")
_b23 = pres_w[pres_w.eleccion == "2023-2"]
cru["voto_milei_2023"] = columna(_b23, "Milei")
cru["participacion_2023"] = cru.codigo_indec.map(tot_el[tot_el.eleccion == "2023"].set_index("codigo_indec").participacion)
cru["voto_oficialismo_2023"] = cru.codigo_indec.map(ofi[ofi.eleccion == "2023"].set_index("codigo_indec").valor)

# id: (nombre, unidad, anio, tema, fuente, ficha, decimales)
CRUCES_META = {
    "poblacion": ("Población", "habitantes", "2025", "Población", "INDEC, proyecciones de población 2022 a 2040", "", 0),
    "densidad": ("Densidad de población", "habitantes por km²", "2025", "Población", "INDEC y Ministerio de Ambiente", "", 1),
    "mortalidad_infantil": ("Mortalidad infantil", "muertes de menores de 1 año cada 1.000 nacidos vivos, promedio 3 años", f"{TRI_ACT[0]} a {TRI_ACT[1]}", "Salud", "DEIS, Ministerio de Salud", "f-mortalidad", 1),
    "madres_adolescentes": ("Maternidad adolescente", "% de los nacimientos con madres menores de 20 años", "2024", "Población", "DEIS, Ministerio de Salud", "f-adolescentes", 1),
    "escolarizacion": ("Escolarización secundaria", "tasa neta, %", str(ESC_FIN), "Educación", "Ministerio de Educación", "f-escolarizacion", 1),
    "aprender_mat": ("Aprender, matemática", "% de 6° grado con nivel satisfactorio o avanzado", str(meta_ap["anio"]), "Educación", "Ministerio de Educación", "f-aprender", 1),
    "aprender_len": ("Aprender, lengua", "% de 6° grado con nivel satisfactorio o avanzado", str(meta_ap["anio"]), "Educación", "Ministerio de Educación", "f-aprender", 1),
    "empleo_privado": ("Empleo privado registrado", "asalariados cada 100 habitantes", f"{MES[fin.month - 1]} de {fin.year}", "Trabajo", "SIPA", "f-empleo", 1),
    "empleo_var": ("Variación del empleo privado", "% en doce meses", f"{MES[fin.month - 1]} de {fin.year}", "Trabajo", "SIPA", "f-empleo", 1),
    "homicidios": ("Homicidios dolosos", "víctimas cada 100.000 habitantes", str(ANIO_SNIC), "Seguridad", "SNIC, Ministerio de Seguridad", "f-muertes", 1),
    "robos": ("Robos", "hechos cada 100.000 habitantes", str(ANIO_SNIC), "Seguridad", "SNIC, Ministerio de Seguridad", "", 0),
    "viales": ("Muertes viales", "víctimas cada 100.000 habitantes", str(ANIO_SNIC), "Seguridad", "SNIC, Ministerio de Seguridad", "f-muertes", 1),
    "protegida": ("Territorio protegido", "% de la superficie", str(anio_ap), "Flora y fauna", "Ministerio de Ambiente, CIAM", "f-protegida", 1),
    "turistas_eti": ("Turistas extranjeros", "cada 1.000 habitantes, salidos por Ezeiza o Aeroparque", str(ANIO_ETI), "Turismo", "Encuesta de Turismo Internacional", "f-eti", 1),
    "autos": ("Autos nuevos", "cada 1.000 habitantes", str(ANIO_AU), "Movilidad", "DNRPA", "f-patentes-prov", 1),
    "motos": ("Motos nuevas", "cada 1.000 habitantes", str(ANIO_AU), "Movilidad", "DNRPA", "f-patentes-prov", 1),
    "esperanza_vida": ("Esperanza de vida", "años al nacer", str(ANIO_EV), "Salud", "INDEC, tablas de mortalidad", "f-esperanza", 1),
    "sin_cobertura": ("Sin obra social ni prepaga", "% de las personas, sin cobertura de salud ni plan estatal", "2022", "Salud", "INDEC, Censo 2022", "f-censo", 1),
    "agua_red": ("Agua de red", "% de los hogares", "2022", "Condiciones de vida", "INDEC, Censo 2022", "f-censo", 1),
    "cloaca": ("Cloacas", "% de los hogares con desagüe a red cloacal", "2022", "Condiciones de vida", "INDEC, Censo 2022", "f-censo", 1),
    "nbi": ("Necesidades básicas insatisfechas", "% de los hogares", "2022", "Condiciones de vida", "INDEC, Censo 2022", "f-censo", 1),
    "internet": ("Internet en el hogar", "% de los hogares", "2022", "Conectividad", "INDEC, Censo 2022", "f-censo", 1),
    "computadora": ("Computadora en el hogar", "% de los hogares con computadora, notebook o tableta", "2022", "Conectividad", "INDEC, Censo 2022", "f-censo", 1),
    "internet_fijo": ("Accesos a internet fijo", "cada 100 hogares", TRIM_ENACOM, "Conectividad", "ENACOM", "f-internet", 1),
    "velocidad": ("Velocidad de internet fijo", "megabits por segundo de bajada, promedio", TRIM_ENACOM, "Conectividad", "ENACOM", "f-internet", 1),
    "exportaciones": ("Exportaciones", "dólares por habitante", str(ANIO_EX), "Trabajo", "INDEC, Origen Provincial de las Exportaciones", "f-exportaciones", 0),
    "natalidad": ("Natalidad", "nacidos vivos cada 1.000 habitantes", str(ANIO_NAT), "Población", "DEIS, Ministerio de Salud", "", 1),
    "autonomia_fiscal": ("Recursos propios", "% de los ingresos totales de la provincia", str(ANIO_FISC), "Finanzas provinciales", "Ministerio de Economía, cuentas provinciales", "f-fiscal", 1),
    "resultado_fiscal": ("Resultado fiscal", "superávit o déficit financiero, % de los ingresos totales", str(ANIO_FISC), "Finanzas provinciales", "Ministerio de Economía, cuentas provinciales", "f-fiscal", 1),
    "gasto_personal": ("Gasto en personal", "% del gasto total de la provincia", str(ANIO_FISC), "Finanzas provinciales", "Ministerio de Economía, cuentas provinciales", "f-fiscal", 1),
    "peso_voto": ("Peso de cada habitante en el Congreso", "bancas de diputados y senadores sobre la proporción de población, 1 = proporcional", "2025", "Política", "Ley 22.847 y proyecciones del INDEC", "f-representacion", 2),
    "pct_pob_solo_cobertura_publica": ("Población sin obra social ni prepaga", "% de la población, solo cobertura pública", "2022", "Salud", "INDEC, Censo 2022", "f-adolescentes-nse", 1),
    "pct_hog_nbi_2022": ("Hogares con necesidades básicas insatisfechas", "% de los hogares", "2022", "Pobreza", "INDEC, Censo 2022", "f-adolescentes-nse", 1),
    "pct_25mas_secundario_completo_o_mas": ("Adultos con secundario completo", "% de la población de 25 años o más", "2022", "Educación", "INDEC, Censo 2022", "f-adolescentes-nse", 1),
    "pct_hog_cloaca": ("Hogares con cloacas", "% de los hogares con desagüe a red pública", "2022", "Pobreza", "INDEC, Censo 2022", "f-adolescentes-nse", 1),
    **({"empresas": ("Empresas privadas empleadoras", "empresas cada 1.000 habitantes", str(emp_res["anio"]), "Empresas y oportunidades", "OEDE, Ministerio de Capital Humano (SIPA)", "f-empresas", 1),
        "empresas_neta": ("Cambio neto de empresas locales", "aperturas menos cierres, % de las empresas, promedio de cinco años", f"{emp_res['ult'] - 4} a {emp_res['ult']}", "Empresas y oportunidades", "OEDE, Ministerio de Capital Humano (SIPA)", "f-dinamica-empresas", 1)}
       if emp_res else {}),
    "vejez": ("Personas mayores por cada 100 en edad de trabajar", "personas de 65 años o más cada 100 de 15 a 64", str(ANIO_PROY), "Población", "INDEC, proyecciones de población", "f-envejecimiento", 1),
    "atn_hab": ("ATN por habitante", f"pesos de {TR_ULT} por habitante por año, promedio 2000 a {TR_ULT}", f"2000 a {TR_ULT}", "Política", "Presupuesto Abierto, Secretaría de Hacienda", "f-atn", 0),
    "transf_no_aut_hab": ("Transferencias no automáticas por habitante", f"pesos de {TR_ULT} por habitante", str(TR_ULT), "Política", "Presupuesto Abierto, Secretaría de Hacienda", "f-transferencias", 0),
    "apoyo_gobierno": ("Apoyo al gobierno de sus legisladores", "% de los votos de diputados y senadores de fuera del bloque oficialista que coincidieron con él en votaciones divididas", str(apoyo_res["hasta"]), "Política", "Actas de votación de Diputados y del Senado, vía Cómo Votó", "f-apoyo", 1),
    "voto_milei_2023": ("Voto a Milei en el balotaje", "% de los votos positivos, segunda vuelta presidencial", "2023, escrutinio provisorio", "Política", "Dirección Nacional Electoral", "f-elecciones", 1),
    "voto_oficialismo_2023": ("Voto al oficialismo nacional", "% de los votos positivos a la fórmula del gobierno, primera vuelta presidencial", "2023, escrutinio provisorio", "Política", "Dirección Nacional Electoral", "f-elecciones", 1),
    "participacion_2023": ("Participación electoral", "% de los electores habilitados que votó, primera vuelta presidencial", "2023, escrutinio provisorio", "Política", "Dirección Nacional Electoral", "f-elecciones", 1),
    "extranjeros": ("Nacidos en otro país", "personas identificadas por el RENAPER cada 100 habitantes", "junio de 2026", "Población", "RENAPER", "", 1),
}

# ---------------------------------------------------------------- series por provincia para animar los cruces
# Una fila por provincia, anio e indicador, desde 2000. Se carga aparte, solo cuando alguien pide ver la evolucion.
hp = snic_prov[snic_prov.codigo_delito_snic_nombre == "Hurtos"].copy()
hp["pob"] = hp.cantidad_hechos / hp.tasa_hechos * 1e5
POB_ANIO = hp.set_index(["provincia_id", "anio"]).pob  # poblacion implicita en las tasas del SNIC
ser = []


def a_serie(df, ident):
    d = df[["codigo_indec", "anio", "valor"]].dropna()
    d = d[(d.anio >= 2000) & d.codigo_indec.isin(REGION)].copy()
    d["id"] = ident
    ser.append(d)


def por_hab(df, factor):
    d = df.copy()
    d["valor"] = d.valor / [POB_ANIO.get((c, a)) for c, a in zip(d.codigo_indec, d.anio)] * factor
    return d


for nombre, ident, col in [("Homicidios dolosos", "homicidios", "tasa_victimas"), ("Muertes en accidentes viales", "viales", "tasa_victimas"),
                           ("Robos (excluye los agravados por el resultado de lesiones y/o muertes)", "robos", "tasa_hechos")]:
    d = snic_prov[snic_prov.codigo_delito_snic_nombre == nombre].rename(columns={"provincia_id": "codigo_indec", col: "valor"})
    a_serie(d, ident)
a_serie(mil.rename(columns={"periodo": "anio_"}), "mortalidad_infantil")
sipa = pd.read_csv(CRUDO / "sipa_provincias.csv", parse_dates=["indice_tiempo"])
sipa = sipa.rename(columns={c: COL[c.replace("asalariados_priv_", "")] for c in sipa.columns if c != "indice_tiempo"})
sipa = sipa.melt(id_vars="indice_tiempo", var_name="codigo_indec", value_name="miles").dropna()
sipa["anio"] = sipa.indice_tiempo.dt.year
sipa = sipa.groupby(["codigo_indec", "anio"]).agg(miles=("miles", "mean"), meses=("miles", "size")).reset_index()
a_serie(por_hab(sipa[sipa.meses == 12].assign(valor=lambda x: x.miles * 1000), 100), "empleo_privado")
for t, col, ident in [(ia, "accesos_cada_100_hogares", "internet_fijo"), (iv, "Mbps", "velocidad")]:
    d = t.groupby(["codigo_indec", "anio"]).agg(valor=(col, "mean"), n=(col, "size")).reset_index()
    a_serie(d[d.n == 4], ident)
a_serie(por_hab(ex[ex.codigo_indec != "00"].assign(valor=lambda x: x.millones_usd * 1e6)[["codigo_indec", "anio", "valor"]], 1), "exportaciones")
for d, ident in [(au, "autos"), (mo_, "motos")]:
    pat_anual = d[d.anio <= ANIO_AU].groupby(["codigo_indec", "anio"])[ident].sum().rename("valor").reset_index()
    a_serie(por_hab(pat_anual, 1000), ident)
a_serie(na[na.codigo_indec != "00"], "natalidad")
for col, ident in [("autonomia", "autonomia_fiscal"), ("resultado", "resultado_fiscal"), ("personal", "gasto_personal")]:
    a_serie(fisc.rename(columns={col: "valor"}), ident)
a_serie(ofi, "voto_oficialismo_2023")
a_serie(_pv.reset_index().rename(columns={"vejez": "valor"}).query("codigo_indec != '00' and anio <= @ANIO_PROY"), "vejez")
a_serie(transf.rename(columns={"atn_hab": "valor"}), "atn_hab")
a_serie(transf.rename(columns={"otras_hab": "valor"}), "transf_no_aut_hab")
a_serie(apoyo.rename(columns={"apoyo": "valor"}), "apoyo_gobierno")
a_serie(tot_el[tot_el.vuelta == 1].rename(columns={"participacion": "valor"}), "participacion_2023")
cruces_series = pd.concat(ser, ignore_index=True)
cruces_series["valor"] = cruces_series.valor.round(2)
cruces_series = cruces_series.dropna()[["id", "codigo_indec", "anio", "valor"]].sort_values(["id", "codigo_indec", "anio"])
cruces_series.to_csv(SITIO / "cruces_series.csv", index=False)
SERIES_IDS = sorted(cruces_series.id.unique())

# ---------------------------------------------------------------- salida
pd.concat(largo, ignore_index=True).to_csv(ORDEN / "tabla_larga.csv", index=False)



tablas = {
    "energia_hogares": anual[["anio", "total", "residencial", "resto", "pct_residencial",
                              "idx_residencial", "idx_resto", "idx_demanda", "idx_emae"]],
    "energia_estacionalidad": perfil.round(0),
    "nacimientos": nac_df,
    "madres_adolescentes_provincias": ado_prov.round(1),
    "aprender_diagnostico": dx,
    "aprender_departamentos": dx_dep,
    "suicidio_serie": tasa_sui,
    "suicidio_provincias": sui_prov,
    "suicidio_edad_sexo": edad,
    "muertes_violentas": muertes,
    "empleo_provincias": emp,
    "mortalidad_infantil_provincias": mi_prov,
    "sube_dia_habil": sube_m[["periodo", "t"] + MODOS].round({"t": 4}),
    "pisa_argentina_ocde": pisa.round(1),
    "escolarizacion_secundaria_provincias": esc_prov[["codigo_indec", "territorio", "tasa_inicio", "tasa_final"]].round(1),
    "aprender_provincias": ap_prov.round(1),
    "areas_protegidas_provincias": area,
    "parques_nacionales_historia": pn_hist.round(0),
    "especies_areas_nacionales": esp,
    "visitas_parques_nacionales": visitas,
    "turistas_no_residentes_anual": receptivo,
    "viajeros_hoteles_anual": hoteles,
    "turistas_extranjeros_provincias": etp,
    "parques_nacionales_lista": pn_lista.round({"hectareas": 0, "lat": 4, "lng": 4}),
    "patentamientos_anual": patent,
    "patentamientos_provincias": pat_prov[["codigo_indec", "territorio", "autos", "motos", "autos_1000", "motos_1000"]],
    "nombres_top": nombres_top,
    "desembarques_especies": pesca,
    "desembarques_top": pesca_top,
    "pesca_continental": rio,
    "pesca_continental_provincias": pesca_rio_prov,
    "visitas_por_parque": visitas_parque,
    "carne_vacuna": carne.round(1),
    "vino_mercado_interno": vino,
    "yerba_molino": yerba,
    "glaciares_provincias": glaciares,
    "clima_desvio": clima,
    "ocde_comparacion": ocde_tabla,
    "cruces_provincias": cru.round(3),
    "mundo_paises": mundo,
    "esperanza_vida_provincias": ev,
    "censo2022_provincias": censo,
    "internet_fijo_provincias": internet_fijo,
    "exportaciones_provincias": exp_prov,
    "extranjeros_provincias": extranjeros,
    "fiscal_provincias": fiscal,
    "elecciones_presidenciales": presidenciales,
    "congreso_composicion": congreso,
    "representacion_provincias": representacion,
    "envejecimiento_provincias": envejec,
    "mortalidad_infantil_causas": mi_causas,
    "madres_adolescentes_nse": nse_ado,
    "envejecimiento_pais": envejec_pais,
    "piramide_poblacion": piramide,
    **({"empresas_provincias": empresas, "empresas_serie_pais": empresas_serie} if empresas is not None else {}),
    **({"rotacion_laboral": rotacion} if rotacion is not None else {}),
    **({"jubilaciones_aportantes": jubil} if jubil is not None else {}),
    "presidentes": presidentes,
    "voto_legisladores_y_provincia": rep_voto,
    "apoyo_gobierno_provincias": apoyo[["anio", "codigo_indec", "territorio", "presidente", "apoyo", "votos", "atn_hab", "otras_hab"]],
    "transferencias_provincias": transf[["anio", "codigo_indec", "territorio", "atn", "otras", "ley", "atn_hab", "otras_hab", "ley_hab", "atn_indice", "otras_indice", "pob"]],
    "transferencias_serie": transf_serie,
    "transferencias_acumulado": acum_t,
    "gabinetes_origen": gabinetes,
    "ministros_provincias": ministros_prov,
    "pobreza_serie": pobreza[["periodo", "anio", "semestre", "t", "pobreza_personas", "indigencia_personas", "pobreza_hogares", "indigencia_hogares"]],
}
# Redondeo único (pedido del autor, octubre de 2026): las tablas guardan cuatro decimales y cada número se redondea una sola vez,
# al mostrarlo. Antes se guardaban con dos y el gráfico volvía a redondear a uno: 38,4499 se guardaba 38,45 y se veía 38,5,
# mientras el texto decía 38,4
for k, t in list(tablas.items()):
    assert not isinstance(t, str), k
    tablas[k] = t = t.round(4)
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
        "ocde_ult": int(nac_df.dropna(subset=["idx_ocde"]).anio.max()),
        "ocde_caida": r1((nac_df.dropna(subset=["idx_ocde"]).iloc[-1].nacimientos_ocde / nac_df.set_index("anio").nacimientos_ocde[int(pico.anio)] - 1) * 100),
        "arg_caida_ocde_ult": r1((nac_df.dropna(subset=["idx_ocde"]).iloc[-1].nacimientos / pico.nacimientos - 1) * 100),
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
    # los valores de 99,5% o más (y los que pasan de 100) reflejan diferencias entre la matrícula y la proyección de población:
    # no se presentan como el máximo (pedido del autor, octubre de 2026)
    "escolarizacion": {
        "ini": ESC_INI, "fin": ESC_FIN, "pais_ini": r1(esc_pais[ESC_INI]), "pais_fin": r1(esc_pais[ESC_FIN]),
        "top": esc_prov[esc_prov.tasa_final < 99.5].sort_values("tasa_final").iloc[-1].territorio,
        "top_v": r1(esc_prov[esc_prov.tasa_final < 99.5].tasa_final.max()),
        "top_excluidos": esc_prov[esc_prov.tasa_final >= 99.5].territorio.tolist(),
        "low": esc_prov.sort_values("tasa_final").iloc[0].territorio, "low_v": r1(esc_prov.tasa_final.min()),
        "suben": int((esc_prov.tasa_final > esc_prov.tasa_inicio).sum()),
    },
    "aprender": {
        "anio": meta_ap["anio"], "nivel": meta_ap["nivel"],
        "mat": r1(ap_pais.mat_logra), "len": r1(ap_pais.len_logra), "mat_debajo": r1(ap_pais.mat_debajo),
        "top": ap_prov.sort_values("mat_logra").iloc[-1].territorio, "top_v": r1(ap_prov.mat_logra.max()),
        "low": ap_prov.sort_values("mat_logra").iloc[0].territorio, "low_v": r1(ap_prov.mat_logra.min()),
    },
    "diagnostico": {
        "anio": meta_ap["anio"], "min": MIN_DIAG, "esc_desde": ESC_DESDE, "esc_hasta": ESC_FIN,
        "deps": int(dx_dep.mat_logra.notna().sum()), "deps_chicos": int(dx_dep.mat_logra.isna().sum()),
        "enmascarados": DX_ENMASCARADOS, "alumnos": round(float(dx.loc[dx.codigo_indec == "00", "n"].iloc[0])),
        # adultos con secundario completo en todo el país: el promedio de las provincias pesado por su población de 25 años o más (Censo 2022)
        "adultos_pais": r1((_nse25.pct_25mas_secundario_completo_o_mas * _nse25.pob25mas_2022).sum() / _nse25.pob25mas_2022.sum()),
    },
    "naturaleza": {
        "anio": anio_ap, "areas": int(ap_tot.total_cantidad), "pct": r1(ap_tot.porcentaje_terrestre_protegido),
        "ha_millones": r1(ap_tot.terrestre_ha / 1e6), "m2_pais": round(float(m2_pais)),
        "top": area.sort_values("pct_territorio").iloc[-1].territorio, "top_v": r1(area.pct_territorio.max()),
        "low": area.sort_values("pct_territorio").iloc[0].territorio, "low_v": r1(area.pct_territorio.min()),
        "m2_top": area.sort_values("m2_por_habitante").iloc[-1].territorio, "m2_top_v": round(float(area.m2_por_habitante.max())),
        "m2_low": area.sort_values("m2_por_habitante").iloc[0].territorio, "m2_low_v": r1(area.m2_por_habitante.min()),
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
    "visitas_parque": {"ult": VP_ULT, "par": VP_PAR, "par_mes": VP_MES, "top": vp_top.area, "top_lugar": vp_top.lugar, "top_v": int(vp_top.visitas_ult),
                       "top_nr": int(vp_top.no_residentes_ult), "dos": vp_2.area, "dos_v": int(vp_2.visitas_ult),
                       "pct_top": r1(vp_top.visitas_ult / vp_tot * 100), "top_2019": int(vp_top.visitas_pre), "n": int(len(vpp)),
                       "tot": int(vp_tot), "par_var": r1((vpp.visitas_par.sum() / vpp.visitas_par_ant.sum() - 1) * 100) if VP_PAR else None},
    "curiosidades": {
        "nom_anio": ANIO_N, "nom_ini": ini_n, "nena": top_f.mostrar, "nena_n": int(top_f.cantidad), "varon": top_m.mostrar, "varon_n": int(top_m.cantidad),
        "nena0": top_f0.mostrar, "varon0": top_m0.mostrar,
        "varon_prov": prov_top_m.mostrar.value_counts().index[0], "varon_prov_n": int(prov_top_m.nombre.value_counts().iloc[0]),
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
        "var_anual": r1((su.total / su_prev.total.iloc[0] - 1) * 100) if len(su_prev) and pd.notna(su_prev.total.iloc[0]) else None,
        "colectivo_millones": round(float(su.colectivo) / 1e6, 2), "tren_miles": round(float(su.tren) / 1e3),
        "subte_miles": round(float(su.subte) / 1e3),
        "pre_millones": round(float(pre) / 1e6, 2), "vs_pre": r1((su.total / pre - 1) * 100),
        "ultimo_dia": ULT_DIA.strftime("%d/%m/%Y"),
        "tren_pre_miles": round(float(pre_modos.tren) / 1e3), "subte_pre_miles": round(float(pre_modos.subte) / 1e3),
        "tren_vs_pre": r1((su.tren / pre_modos.tren - 1) * 100), "subte_vs_pre": r1((su.subte / pre_modos.subte - 1) * 100),
        "colectivo_vs_pre": r1((su.colectivo / pre_modos.colectivo - 1) * 100),
        "faltan": [f"{MES[m.month - 1]} de {m.year}" for m in SUBE_FALTAN],
        "lancha_salto": f"{MES[SUBE_LANCHA.month - 1]} de {SUBE_LANCHA.year}" if SUBE_LANCHA is not None else None,
    },
    "autos": {
        "anio": ANIO_AU, "autos": int(patent.autos.iloc[-1]), "motos": int(patent.motos.iloc[-1]),
        "max_anio": int(pa_max.anio), "max": int(pa_max.autos), "min_anio": int(pa_min.anio), "min": int(pa_min.autos),
        "ini": int(patent.anio.min()), "motos_ini": int(mo_.anio.min()),
        "ytd": f"enero y {MES[int(ult_au) - 1]} de {int(au.anio.max())}", "ytd_var": r1((ytd_au / ytd_au_prev - 1) * 100),
        "top": pat_prov.sort_values("autos_1000").iloc[-1].territorio, "top_v": r1(pat_prov.autos_1000.max()),
        "low": pat_prov.sort_values("autos_1000").iloc[0].territorio, "low_v": r1(pat_prov.autos_1000.min()),
        "moto_top": pat_prov[~pat_prov.codigo_indec.isin(EXCLUIR("patentamientos_provincias.motos_1000"))].sort_values("motos_1000").iloc[-1].territorio,
        "moto_top_v": r1(pat_prov[~pat_prov.codigo_indec.isin(EXCLUIR("patentamientos_provincias.motos_1000"))].motos_1000.max()),
        "moto_excluidos": [CORTO[c] for c in EXCLUIR("patentamientos_provincias.motos_1000")],
        "pais_1000": r1(pat_prov.autos.sum() / POB_PAIS * 1000), "motos_pais_1000": r1(pat_prov.motos.sum() / POB_PAIS * 1000),
    },
}

resumen["ocde"] = ocde_res
resumen["distorsiones"] = {k: {CORTO[c]: x for c, x in v.items()} for k, v in DIST.items()}
top_bot = lambda t, c: (t.sort_values(c).iloc[-1], t.sort_values(c).iloc[0])
_ev_t, _ev_b = top_bot(ev, "total")
_ex_t, _ex_b = top_bot(exp_prov, "usd_por_habitante")
_in_t, _in_b = top_bot(internet_fijo, "accesos_100_hogares")
_ve_t, _ve_b = top_bot(internet_fijo, "mbps")
_fa_t, _fa_b = top_bot(fiscal, "autonomia")
resumen["fiscal"] = {
    "anio": ANIO_FISC, "top": _fa_t.territorio, "top_v": r1(_fa_t.autonomia), "low": _fa_b.territorio, "low_v": r1(_fa_b.autonomia),
    "deficit": int((fiscal.resultado < 0).sum()), "superavit": int((fiscal.resultado > 0).sum()),
    "mediana": r1(fiscal.autonomia.median()), "ini": int(fisc.anio.min()),
    "mediana_ini": r1(fisc[fisc.anio == fisc.anio.min()].autonomia.median()),
    "atrasadas": FISC_ATRASADAS,
}
resumen["departamentos"] = {"meta": {k: {"nombre": v[0], "unidad": v[1], "fuente": v[2]} for k, v in DEP_META.items()},
                            "anio_snic": ANIO_DEP, "n": int(len(departamentos))}
resumen["elecciones"] = el_meta
resumen["congreso"] = congreso_res
resumen["presidentes"] = pres_res
resumen["envejecimiento"] = env_res
resumen["piramide"] = pir_res
resumen["empresas"] = emp_res
resumen["rotacion"] = rot_res
resumen["jubilaciones"] = jub_res
resumen["mi_causas"] = mi_causas_res
resumen["ado_nse"] = ado_nse_res
resumen["ytd"] = YTD
resumen["transferencias"] = transf_res
resumen["votaciones"] = votaciones_res
resumen["gabinetes"] = gab_res
resumen["nuevos"] = {
    "ev_anio": ANIO_EV, "ev_pais": r1(ev_pais.total), "ev_m": r1(ev_pais.mujeres), "ev_v": r1(ev_pais.varones),
    "ev_top": _ev_t.territorio, "ev_top_v": r1(_ev_t.total), "ev_low": _ev_b.territorio, "ev_low_v": r1(_ev_b.total),
    "censo": {c: r1(v) for c, v in censo_pais.items()},
    "censo_top": {c: [censo.sort_values(c).iloc[-1].territorio, r1(censo[c].max())] for c in CENSO_COLS},
    "censo_low": {c: [censo.sort_values(c).iloc[0].territorio, r1(censo[c].min())] for c in CENSO_COLS},
    "in_trim": TRIM_ENACOM, "in_top": _in_t.territorio, "in_top_v": r1(_in_t.accesos_100_hogares), "in_low": _in_b.territorio, "in_low_v": r1(_in_b.accesos_100_hogares),
    "ve_top": _ve_t.territorio, "ve_top_v": r1(_ve_t.mbps), "ve_low": _ve_b.territorio, "ve_low_v": r1(_ve_b.mbps),
    "ex_anio": ANIO_EX, "ex_total": round(EXP_TOTAL), "ex_pc_pais": round(EXP_TOTAL * 1e6 / POB_PAIS),
    "ex_top": _ex_t.territorio, "ex_top_v": round(float(_ex_t.usd_por_habitante)), "ex_low": _ex_b.territorio, "ex_low_v": round(float(_ex_b.usd_por_habitante)),
    "ex_provincial_pct": r1(exp_prov.millones_usd.sum() / EXP_TOTAL * 100), "ex_sem": EX_SEM,
    "xt_pais": r1(extranjeros.personas.sum() / POB_PAIS * 100), "xt_top": extranjeros.sort_values("cada_100").iloc[-1].territorio,
    "xt_top_v": r1(extranjeros.cada_100.max()), "xt_origen": list(top_origen.index[:3]),
}
resumen["cruces"] = [{"id": k, "nombre": v[0], "unidad": v[1], "periodo": v[2], "tema": v[3], "fuente": v[4], "ficha": v[5], "dec": v[6]}
                     for k, v in CRUCES_META.items()]
assert all(m["id"] in cru.columns for m in resumen["cruces"])
resumen["cruces_series"] = {k: [int(cruces_series[cruces_series.id == k].anio.min()), int(cruces_series[cruces_series.id == k].anio.max())] for k in SERIES_IDS}

(SITIO / "fichas.json").write_text(json.dumps({
    "resumen": resumen,
    # las tablas que solo se usan al abrir un bloque se cargan aparte desde su CSV
    "datos": {k: json.loads(t.to_json(orient="records")) for k, t in tablas.items() if k not in {"ocde_comparacion"}},
}, ensure_ascii=False), encoding="utf-8")
print(json.dumps(resumen, ensure_ascii=False, indent=1))
