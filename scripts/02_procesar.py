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
# Fin de las proyecciones del INDEC (2022 a 2040): las tablas lo llevan en el nombre de la columna y los textos lo leen del resumen
# ("anio_fin"). Si el INDEC publica otras proyecciones con otro final, este control avisa antes de que algo quede mal
ANIO_FIN_PROY = 2040
assert int(proy.anio.max()) == ANIO_FIN_PROY, f"las proyecciones del INDEC terminan en {int(proy.anio.max())}: revisar envejecimiento y pirámide"
envejec = _pv.vejez.unstack("anio").reset_index()
envejec = envejec[envejec.codigo_indec != "00"][["codigo_indec", ANIO_PROY, 2040]].rename(columns={ANIO_PROY: "vejez_hoy", 2040: "vejez_2040"})
envejec["territorio"] = envejec.codigo_indec.map(CORTO)
envejec_pais = _pv.xs("00", level="codigo_indec")[["vejez", "pct_mayores"]].reset_index().round(2)
_ep = envejec_pais.set_index("anio")
_eo = envejec.sort_values("vejez_hoy")
env_res = {"anio": ANIO_PROY, "hoy": r1(_ep.vejez[ANIO_PROY]), "ini": r1(_ep.vejez[2022]), "fin": r1(_ep.vejez[2040]),
           "trab_hoy": round(100 / float(_ep.vejez[ANIO_PROY]), 1), "trab_fin": round(100 / float(_ep.vejez[2040]), 1),
           "max": _eo.iloc[-1].territorio, "max_v": r1(_eo.vejez_hoy.max()), "min": _eo.iloc[0].territorio, "min_v": r1(_eo.vejez_hoy.min()),
           "pct_mayores_hoy": r1(_ep.pct_mayores[ANIO_PROY]), "pct_mayores_fin": r1(_ep.pct_mayores[2040]), "anio_fin": ANIO_FIN_PROY}
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
pir_res = {"anio": ANIO_PROY, "edad_mediana_hoy": round(_med("personas_hoy")), "anio_fin": ANIO_FIN_PROY, "edad_mediana_fin": round(_med("personas_2040")),
           "menores15_hoy": r1(_pp[_pp.edad < 15].personas_hoy.sum() / _pp.personas_hoy.sum() * 100),
           "menores15_fin": r1(_pp[_pp.edad < 15].personas_2040.sum() / _pp.personas_2040.sum() * 100)}

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
# el último año con los doce meses de las tres series (antes el corte en 2025 estaba escrito a mano)
_meses_e = e.dropna(subset=["demanda_total", "demanda_residencial", "emae_original"]).groupby("anio").indice_tiempo.nunique()
ULT_E = int(_meses_e[_meses_e == 12].index.max())
anual = (e[e.anio.between(2005, ULT_E)].groupby("anio")
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
perfil = (e[e.anio.between(ULT_E - 2, ULT_E)].groupby(e.indice_tiempo.dt.month)
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
# primer y último año de la DEIS (antes 2012 y 2024 escritos a mano). Las columnas llevan el año, y datina.js arma su nombre con el resumen
NAC_INI, NAC_ULT = ANIOS_NAC[0], ANIOS_NAC[-1]
ado_prov = pp.pivot(index="provincia_id", columns="anio", values="pct")[[NAC_INI, NAC_ULT]].reset_index()
ado_prov.columns = ["codigo_indec", f"pct_{NAC_INI}", f"pct_{NAC_ULT}"]
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
nse_ado = nse.merge(ado_prov[["codigo_indec", "territorio", f"pct_{NAC_ULT}"]], on="codigo_indec")
ado_nse_res = {"anio": NAC_ULT, "indicadores": [{"k": k, "lab": v, "r": spearman(nse_ado[k].values, nse_ado[f"pct_{NAC_ULT}"].values)} for k, v in NSE_IND.items()]}

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
                   "total pais": "00", "capital federal": "02"})
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
    "credito_hogares": ("WS_TC", "el crédito a los hogares", "% del producto interno bruto", 1, "Banco de Pagos Internacionales"),
    "eolica_solar": ("owid_energy", "la participación de la energía eólica y la solar", "% de la electricidad generada", 1, "Ember"),
}
# Crédito a los hogares (% del PBI) del Banco de Pagos Internacionales, al cuarto trimestre de cada año, para la ficha de créditos
# hipotecarios (etapa 20). Publica 31 de los 38 miembros de la OCDE: el promedio es el de los que tienen dato.
BIS_ISO3 = {"AR": "ARG", "AT": "AUT", "AU": "AUS", "BE": "BEL", "CA": "CAN", "CH": "CHE", "CL": "CHL", "CO": "COL", "CZ": "CZE", "DE": "DEU",
            "DK": "DNK", "ES": "ESP", "FI": "FIN", "FR": "FRA", "GB": "GBR", "GR": "GRC", "HU": "HUN", "IE": "IRL", "IL": "ISR", "IT": "ITA",
            "JP": "JPN", "KR": "KOR", "LU": "LUX", "MX": "MEX", "NL": "NLD", "NO": "NOR", "NZ": "NZL", "PL": "POL", "PT": "PRT", "SE": "SWE",
            "TR": "TUR", "US": "USA"}


def bis_hogares():
    b = pd.read_csv(CRUDO / "bis_credito_hogares.csv")
    b = b[b.periodo.str.endswith("Q4") & b.pais.isin(BIS_ISO3)]
    return pd.DataFrame({"pais": b.pais.map(BIS_ISO3), "anio": b.periodo.str[:4].astype(int), "valor": b.pct_pbi})




def ember_eolica_solar():  # participación de la eólica y la solar en la electricidad generada (Ember, vía Our World in Data), etapa 20
    o = pd.read_csv(CRUDO / "owid_electricidad.csv")
    return pd.DataFrame({"pais": o.pais, "anio": o.anio, "valor": o.eolica.fillna(0) + o.solar.fillna(0)})


OCDE_FUENTE = {"credito_hogares": "Banco de Pagos Internacionales, crédito al sector privado no financiero (serie de crédito a los hogares)",
               "eolica_solar": "Ember, datos anuales de electricidad, publicados por Our World in Data"}
OCDE_VAR = {"credito_hogares": "bis_credito_hogares", "eolica_solar": "ember_eolica_solar"}
OCDE_DERIVADO = {"turistas": lambda: por_habitante("ST.INT.ARVL", 100), "pesca": lambda: por_habitante("ER.FSH.CAPT.MT", 1000),
                 "credito_hogares": bis_hogares, "eolica_solar": ember_eolica_solar}
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
        "serie": o_serie, "frase": frase, "unidad": unidad, "dec": dec, "origen": origen, "fuente": OCDE_FUENTE.get(k),
        "anio": int(o_u.anio), "arg": round(float(o_u.argentina), dec), "ocde": round(float(o_u.ocde_promedio), dec),
        "p25": round(float(o_u.ocde_p25), dec), "p75": round(float(o_u.ocde_p75), dec),
        "mediana": round(float(o_u.ocde_mediana), dec), "n": int(o_u.ocde_paises),
        "mas_alto": int((o_ult.valor > o_u.argentina).sum()),
        "ini": int(o_p.anio), "arg_ini": round(float(o_p.argentina), dec), "ocde_ini": round(float(o_p.ocde_promedio), dec),
    }
    o_a = o_arg.reset_index().rename(columns={"anio": "periodo"})
    o_a["codigo_indec"], o_a["territorio"] = "00", "Argentina"
    agregar(o_a, OCDE_VAR.get(k, f"bm_{k}"), unidad, OCDE_FUENTE.get(k, f"Banco Mundial ({o_serie}), {origen}"))
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
# Corte del archivo del RENAPER que baja 01_descargar.py (el nombre del archivo lo dice). Cuando se cambie el archivo, cambiar este texto:
# los títulos, las tarjetas y Cruces lo leen de acá
RENAPER_CORTE = "junio de 2026"
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
    reg_f, _ = fila("regalias", i_ic)
    ird_f, _ = fila("inversion real directa")
    for j, a in anios_f.items():
        v = lambda r: float(r[j])
        if not v(tot) > 0:  # anios sin datos en la planilla
            continue
        fisc.append({"codigo_indec": cod, "anio": a, "autonomia": (v(ic) - v(nac) - v(trc) + v(rpc)) / v(tot) * 100,
                     "resultado": v(res) / v(tot) * 100, "personal": v(per) / v(gas) * 100,
                     "regalias": v(reg_f) / v(tot) * 100, "regalias_millones": v(reg_f), "ird_millones": v(ird_f), "ingresos_millones": v(tot)})
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

# ---------------------------------------------------------------- petróleo y gas (etapa 18, octubre de 2026)
# Capítulo IV de la Resolución SE 319/1993: las empresas declaran cada mes la producción de cada pozo (Secretaría de Energía).
# El país sale de la serie mensual por cuenca y tipo de recurso que publica la Secretaría, la más al día. Provincias, empresas y
# Vaca Muerta salen del archivo agrupado por yacimiento y formación y los pozos de los archivos por pozo (resumidos en
# 01_descargar.py), que suman lo mismo que esa serie (verificado mes a mes en octubre de 2026). Las declaraciones llegan con atraso:
# en esos archivos un mes cuenta solo si suma al menos el 99% de la serie del país. Petróleo en m3 y gas en miles de m3; los
# barriles usan el mismo factor que la Secretaría aplica en su serie (se lee de la serie, no se escribe a mano).
sp_ = pd.read_csv(CRUDO / "se_petroleo_cuenca.csv", encoding="utf-8-sig")
sg_ = pd.read_csv(CRUDO / "se_gas_cuenca.csv", encoding="utf-8-sig")
BBL = float((sp_.kbbl_diario * 1000 / sp_.total_diario).median())  # barriles por metro cúbico
assert 6.28 < BBL < 6.30, f"factor de barriles inesperado: {BBL}"
sp_ = sp_.rename(columns=lambda c: c if c == "indice_tiempo" else c + "_p")
sg_ = sg_.rename(columns=lambda c: c if c == "indice_tiempo" else c.replace("produccion_gas_natural_", "").replace("produccion_", "").replace("_gas", "") + "_g")
hm = sp_.merge(sg_, on="indice_tiempo")
hm["fecha"] = pd.to_datetime(hm.indice_tiempo + "-01")
hm["dias"] = hm.fecha.dt.days_in_month
CUENCAS = {"neuquina": "Neuquina", "gsj": "Golfo San Jorge", "austral": "Austral", "noroeste": "Noroeste", "cuyana": "Cuyana"}
hidro_m = pd.DataFrame({"periodo": hm.indice_tiempo, "anio": hm.fecha.dt.year, "mes": hm.fecha.dt.month})
kbd = lambda m3: m3 / hm.dias * BBL / 1000          # m3 en el mes -> miles de barriles por día
mmd = lambda km3: km3 / hm.dias / 1000              # miles de m3 en el mes -> millones de m3 por día
hidro_m["pet_conv"] = kbd(hm.total_p - hm.shale_p - hm.tight_p)
hidro_m["pet_shale"], hidro_m["pet_tight"], hidro_m["pet_total"] = kbd(hm.shale_p), kbd(hm.tight_p), kbd(hm.total_p)
hidro_m["gas_conv"] = mmd(hm.total_g - hm.shale_g - hm.tight_g)
hidro_m["gas_shale"], hidro_m["gas_tight"], hidro_m["gas_total"] = mmd(hm.shale_g), mmd(hm.tight_g), mmd(hm.total_g)
for k in CUENCAS:
    hidro_m[f"pet_{k}"], hidro_m[f"gas_{k}"] = kbd(hm[f"cuenca_{k}_p"]), mmd(hm[f"cuenca_{k}_g"])
hidro_m["pct_pet_nc"] = (hidro_m.pet_shale + hidro_m.pet_tight) / hidro_m.pet_total * 100
hidro_m["pct_gas_nc"] = (hidro_m.gas_shale + hidro_m.gas_tight) / hidro_m.gas_total * 100
# el último mes cuenta si su total llega al 90% del promedio de los tres anteriores (las declaraciones llegan con atraso).
# Solo se miran los últimos meses: una caída real en el medio de la serie, como la de 2020, no se toca
while len(hidro_m) > 4 and any(hidro_m[k].iloc[-1] < .9 * hidro_m[k].iloc[-4:-1].mean() for k in ("pet_total", "gas_total")):
    hidro_m = hidro_m.iloc[:-1]
HM_ULT = hidro_m.iloc[-1]
_cols_h = ["pet_conv", "pet_shale", "pet_tight", "pet_total", "gas_conv", "gas_shale", "gas_tight", "gas_total"]
_dias_m = hidro_m.periodo.map(hm.set_index("indice_tiempo").dias)
_pond = hidro_m[_cols_h].mul(_dias_m, axis=0).assign(dias=_dias_m, anio=hidro_m.anio).groupby("anio").sum()
_n_meses = hidro_m.groupby("anio").size()
hidro_a = _pond[_cols_h].div(_pond.dias, axis=0)[_n_meses == 12].reset_index()
hidro_a["pct_pet_nc"] = (hidro_a.pet_shale + hidro_a.pet_tight) / hidro_a.pet_total * 100
hidro_a["pct_gas_nc"] = (hidro_a.gas_shale + hidro_a.gas_tight) / hidro_a.gas_total * 100
HA_ULT, HA_INI = hidro_a.iloc[-1], hidro_a.iloc[0]
_ha_min_p, _ha_min_g = hidro_a.loc[hidro_a.pet_total.idxmin()], hidro_a.loc[hidro_a.gas_total.idxmin()]
_pm = hidro_m.set_index("periodo")
_max_previo = hidro_m.iloc[:-1].loc[hidro_m.iloc[:-1].pet_total.idxmax()]
_hc = hm[hm.indice_tiempo.isin(hidro_m.periodo)]
YTD_H = {"pet": en_lo_que_va(_hc.fecha, _hc.total_p), "gas": en_lo_que_va(_hc.fecha, _hc.total_g)}
for col, var, uni in [("pet_total", "produccion_petroleo", "miles de barriles por dia"), ("gas_total", "produccion_gas_natural", "millones de m3 por dia"),
                      ("pct_pet_nc", "petroleo_no_convencional", "% de la produccion de petroleo"), ("pct_gas_nc", "gas_no_convencional", "% de la produccion de gas")]:
    d = hidro_a[["anio", col]].rename(columns={"anio": "periodo", col: "valor"})
    d["codigo_indec"], d["territorio"] = "00", "Argentina"
    agregar(d, var, uni, "Secretaria de Energia, Capitulo IV (Res. SE 319/1993)")

# Provincias, empresas y Vaca Muerta: los doce meses completos más recientes del archivo agrupado
pr_ = pd.read_csv(CRUDO / "se_produccion_resumen.csv")
pr_["periodo"] = pr_.anio.astype(str) + "-" + pr_.mes.astype(str).str.zfill(2)
_tot = pr_.groupby("periodo")[["prod_pet", "prod_gas"]].sum()
_ref = hm.set_index("indice_tiempo")[["total_p", "total_g"]]
_comp = [p for p in _tot.index if p in _ref.index and _tot.prod_pet[p] >= .99 * _ref.total_p[p] and _tot.prod_gas[p] >= .99 * _ref.total_g[p]]
AG_ULT = max(_comp)
VENTANA = [str(x) for x in pd.period_range(end=AG_ULT, periods=12, freq="M")]
assert all(p in _comp for p in VENTANA), "faltan meses completos en el archivo agrupado de producción"
VENTANA_10 = [str(x) for x in pd.period_range(end=pd.Period(AG_ULT, "M") - 120, periods=12, freq="M")]
_dias_v = sum(pd.Period(p, "M").days_in_month for p in VENTANA)
MAR = "mar"  # yacimientos en el mar a más de 12 millas: jurisdicción nacional ("Estado Nacional" en la fuente)
pr_["codigo_indec"] = pr_.provincia.map(lambda t: MAR if norm(t) == "estado nacional" else codigo(t))
assert pr_.codigo_indec.notna().all(), f"provincias sin código en la producción: {pr_[pr_.codigo_indec.isna()].provincia.unique()}"
pr_["nc"] = pr_.tipo.isin(["shale", "tight"])


def ventana(d, meses):
    x = d[d.periodo.isin(meses)]
    dias = sum(pd.Period(p, "M").days_in_month for p in meses)
    g = x.groupby("codigo_indec")
    out = pd.DataFrame({"pet_kbd": g.prod_pet.sum() / dias * BBL / 1000, "gas_mmm3d": g.prod_gas.sum() / dias / 1000,
                        "pet_nc": x[x.nc].groupby("codigo_indec").prod_pet.sum() / dias * BBL / 1000,
                        "gas_nc": x[x.nc].groupby("codigo_indec").prod_gas.sum() / dias / 1000,
                        "pet_vm": x[x.vaca_muerta].groupby("codigo_indec").prod_pet.sum() / dias * BBL / 1000}).fillna(0)
    return out


_v, _v10 = ventana(pr_, VENTANA), ventana(pr_, VENTANA_10)
hidro_prov = _v.join(_v10[["pet_kbd", "gas_mmm3d"]].rename(columns=lambda c: c + "_antes"), how="outer").fillna(0).reset_index()
hidro_prov = hidro_prov[(hidro_prov.pet_kbd + hidro_prov.gas_mmm3d + hidro_prov.pet_kbd_antes + hidro_prov.gas_mmm3d_antes) > .05]
hidro_prov["territorio"] = hidro_prov.codigo_indec.map(lambda c: "Mar argentino" if c == MAR else CORTO[c])
hidro_prov["pct_pet_pais"] = hidro_prov.pet_kbd / hidro_prov.pet_kbd.sum() * 100
hidro_prov["pct_gas_pais"] = hidro_prov.gas_mmm3d / hidro_prov.gas_mmm3d.sum() * 100
hidro_prov["pct_pet_nc"] = (hidro_prov.pet_nc / hidro_prov.pet_kbd * 100).where(hidro_prov.pet_kbd > 0)
hidro_prov["pct_gas_nc"] = (hidro_prov.gas_nc / hidro_prov.gas_mmm3d * 100).where(hidro_prov.gas_mmm3d > 0)
hidro_prov = hidro_prov[["codigo_indec", "territorio", "pet_kbd", "gas_mmm3d", "pct_pet_pais", "pct_gas_pais", "pct_pet_nc", "pct_gas_nc",
                         "pet_vm", "pet_kbd_antes", "gas_mmm3d_antes"]].sort_values("pet_kbd", ascending=False)
_vm_kbd = float(hidro_prov.pet_vm.sum())
# producción anual de cada provincia (años completos del archivo agrupado), para "si Neuquén fuera un país"
_pa = pr_[pr_.periodo.isin(_comp)].groupby(["anio", "codigo_indec"])[["prod_pet", "prod_gas"]].sum().reset_index()
_meses_pa = pr_[pr_.periodo.isin(_comp)].groupby("anio").periodo.nunique()
_pa = _pa[_pa.anio.map(_meses_pa) == 12]
_pa["dias"] = _pa.anio.map(lambda a: 366 if pd.Timestamp(f"{a}-12-31").is_leap_year else 365)
_pa["pet_kbd"], _pa["gas_mmm3d"] = _pa.prod_pet / _pa.dias * BBL / 1000, _pa.prod_gas / _pa.dias / 1000
# La serie anual por provincia no va a la tabla larga: el archivo agrupado tiene algunos meses viejos incompletos (enero de 2007,
# junio de 2015, enero de 2019 y septiembre de 2024 suman entre 84% y 96% de la serie del país) y esos años quedarían con huecos


FORMA_SOC = re.compile(r"[\s,]*(\(?sucursal[^)]*\)?|ltd\.?|s\.?\s?a\.?\s?u\.?|s\.?\s?a\.?|s\.?\s?r\.?\s?l\.?|s\.?\s?l\.?|sau)$", re.I)
SIGLAS_EMP = {"YPF", "CGC", "PCR", "GYP"}


def nombre_empresa(n):
    """Nombre corto de una empresa para los gráficos, sin la forma societaria (la tabla conserva el nombre de la fuente)."""
    t, antes = str(n).strip(), None
    while t != antes:
        antes, t = t, FORMA_SOC.sub("", t).strip(" .,")
    return " ".join(w if w.upper() in SIGLAS_EMP or not w.isalpha() else w.lower() if i and w.lower() in ("de", "del", "la", "las", "los", "y") else w.capitalize()
                    for i, w in enumerate(t.split()))


emp_h = pd.read_csv(CRUDO / "se_produccion_empresas.csv")
emp_h["periodo"] = emp_h.anio.astype(str) + "-" + emp_h.mes.astype(str).str.zfill(2)
_e = emp_h[emp_h.periodo.isin(VENTANA)].groupby("empresa")[["prod_pet", "prod_gas"]].sum()
_e["pct_pet"], _e["pct_gas"] = _e.prod_pet / _e.prod_pet.sum() * 100, _e.prod_gas / _e.prod_gas.sum() * 100
_top = sorted(set(_e.nlargest(8, "prod_pet").index) | set(_e.nlargest(8, "prod_gas").index), key=lambda x: -_e.loc[x, "prod_pet"])
hidro_emp = _e.loc[_top].reset_index()
_resto = _e.drop(_top).sum()
hidro_emp = pd.concat([hidro_emp, pd.DataFrame([{"empresa": "Otras empresas", **_resto[["prod_pet", "prod_gas", "pct_pet", "pct_gas"]].to_dict()}])], ignore_index=True)
hidro_emp["nombre"] = [nombre_empresa(x) if x != "Otras empresas" else x for x in hidro_emp.empresa]
hidro_emp["pet_kbd"], hidro_emp["gas_mmm3d"] = hidro_emp.prod_pet / _dias_v * BBL / 1000, hidro_emp.prod_gas / _dias_v / 1000
hidro_emp = hidro_emp[["nombre", "empresa", "pet_kbd", "pct_pet", "gas_mmm3d", "pct_gas"]]
_n_emp_pet = int((_e.prod_pet > 0).sum())

# Pozos que produjeron petróleo o gas: el último mes completo de los archivos por pozo. La producción por pozo es la del mes
# dividida por los días del mes, contando solo los pozos que produjeron (no por los días efectivos de cada pozo)
po_ = pd.read_csv(CRUDO / "se_pozos_resumen.csv")
po_["periodo"] = po_.anio.astype(str) + "-" + po_.mes.astype(str).str.zfill(2)
_tp = po_.groupby("periodo")[["prod_pet", "prod_gas"]].sum()
_pc = [p for p in _tp.index if p in _ref.index and _tp.prod_pet[p] >= .99 * _ref.total_p[p] and _tp.prod_gas[p] >= .99 * _ref.total_g[p]]
PO_ULT = max(_pc)
_dpo = pd.Period(PO_ULT, "M").days_in_month
_u = po_[po_.periodo == PO_ULT]
TIPOS_H = {"convencional": "Convencionales", "shale": "Shale", "tight": "Tight"}
pozos_tipo = _u[_u.tipo.isin(TIPOS_H)].groupby("tipo")[["pozos", "pozos_pet", "pozos_gas", "prod_pet", "prod_gas"]].sum().reindex(list(TIPOS_H)).reset_index()
pozos_tipo["nombre"] = pozos_tipo.tipo.map(TIPOS_H)
pozos_tipo["m3d_pozo_pet"] = pozos_tipo.prod_pet / pozos_tipo.pozos_pet / _dpo
pozos_tipo["bpd_pozo_pet"] = pozos_tipo.m3d_pozo_pet * BBL
pozos_tipo["miles_m3d_pozo_gas"] = pozos_tipo.prod_gas / pozos_tipo.pozos_gas / _dpo
pozos_tipo["pct_pozos"] = pozos_tipo.pozos / pozos_tipo.pozos.sum() * 100
pozos_tipo["pct_pet"] = pozos_tipo.prod_pet / _u.prod_pet.sum() * 100
pozos_tipo["pct_gas"] = pozos_tipo.prod_gas / _u.prod_gas.sum() * 100
pozos_tipo = pozos_tipo[["tipo", "nombre", "pozos", "pozos_pet", "pozos_gas", "m3d_pozo_pet", "bpd_pozo_pet", "miles_m3d_pozo_gas", "pct_pozos", "pct_pet", "pct_gas"]]
_u = _u.assign(codigo_indec=_u.provincia.map(lambda t: MAR if norm(t) == "estado nacional" else codigo(t)))
pozos_prov = _u.pivot_table(index="codigo_indec", columns="tipo", values="pozos", aggfunc="sum").reindex(columns=list(TIPOS_H)).fillna(0).astype(int)
pozos_prov["total"] = pozos_prov.sum(axis=1)
pozos_prov = pozos_prov[pozos_prov.total > 0].reset_index()
pozos_prov["territorio"] = pozos_prov.codigo_indec.map(lambda c: "Mar argentino" if c == MAR else CORTO[c])
pozos_prov = pozos_prov[["codigo_indec", "territorio", "convencional", "shale", "tight", "total"]].sort_values("total", ascending=False)
_pt = pozos_tipo.set_index("tipo")

# Fracturas de pozos (Adjunto IV de la Secretaría de Energía, etapa 19): una fila por fractura informada, con la fecha de inicio, las
# etapas, la rama horizontal, la arena y el agua. Se cuentan las de formaciones no convencionales (shale y tight) por el año en que
# empezó la fractura, desde 2013: desde ese año las fracturas informadas cubren casi todos los pozos de Vaca Muerta que empiezan a
# producir. Las empresas las informan con demora (en 2022 a 2025, a los cuatro meses de terminado el mes estaba cargado cerca del 60%
# de sus etapas y al año, cerca del 85%): por eso van años completos y no meses, y el último año completo puede subir. Las fechas
# posteriores a la última carga son errores de la fuente y no se usan.
fr_ = pd.read_csv(CRUDO / "se_fracturas.csv", low_memory=False)
fr_["ini"] = pd.to_datetime(fr_.fecha_inicio_fractura, errors="coerce")
_carga_fr = pd.to_datetime(fr_.fecha_data, errors="coerce").max()
fr_ = fr_[fr_.ini.notna() & (fr_.ini <= _carga_fr) & fr_.tipo_reservorio.eq("NO CONVENCIONAL")].copy()
fr_["anio"] = fr_.ini.dt.year
fr_["vm"] = fr_.formacion_productiva.fillna("").str.strip().str.lower().eq("vaca muerta")
fr_["arena_tn"] = fr_.arena_bombeada_nacional_tn.fillna(0) + fr_.arena_bombeada_importada_tn.fillna(0)
# un año cuenta recién cuando pasó medio año de carga: a los seis meses ya llegó la mayor parte de sus fracturas
FR_INI, FR_ULT = 2013, int(_carga_fr.year) - (1 if _carga_fr.month >= 7 else 2)
assert FR_ULT >= 2024, "los datos de fracturas no llegan al último año completo"
_fra = fr_[fr_.anio.between(FR_INI, FR_ULT)]
fracturas = _fra.groupby("anio").agg(etapas=("cantidad_fracturas", "sum"), pozos=("idpozo", "nunique"), arena_tn=("arena_tn", "sum"),
                                    agua_m3=("agua_inyectada_m3", "sum"))
fracturas["etapas_vm"] = _fra[_fra.vm].groupby("anio").cantidad_fracturas.sum()
fracturas = fracturas.reindex(range(FR_INI, FR_ULT + 1)).fillna(0)
fracturas["etapas_otras"] = fracturas.etapas - fracturas.etapas_vm
fracturas = fracturas.reset_index()[["anio", "etapas", "etapas_vm", "etapas_otras", "pozos", "arena_tn", "agua_m3"]]
for c in ["etapas", "etapas_vm", "etapas_otras", "pozos"]:
    fracturas[c] = fracturas[c].astype(int)
# Diseño de los pozos de Vaca Muerta por año: cada pozo una vez (algunos tienen más de una fractura informada), en el año de su
# primera fractura. Rama horizontal: la más larga informada para el pozo, solo si es mayor que cero (los verticales informan cero)
_pvm = fr_[fr_.vm].groupby("idpozo").agg(anio=("anio", "min"), etapas=("cantidad_fracturas", "sum"), rama=("longitud_rama_horizontal_m", "max"),
                                         arena_tn=("arena_tn", "sum"))
_pvm = _pvm[_pvm.anio.between(FR_INI, FR_ULT)]
diseno_vm = _pvm.groupby("anio").agg(pozos=("etapas", "size"), etapas_pozo=("etapas", "mean"), arena_pozo_tn=("arena_tn", "mean")).join(
    _pvm[_pvm.rama > 0].groupby("anio").rama.mean().rename("rama_m")).reset_index()
diseno_vm = diseno_vm[["anio", "pozos", "rama_m", "etapas_pozo", "arena_pozo_tn"]]
_dv = diseno_vm.set_index("anio")
DV_INI = int(diseno_vm[diseno_vm.pozos >= 50].anio.min())  # el primer año con al menos 50 pozos, para no comparar con un puñado
FR_U, FR_A = fracturas.set_index("anio").loc[FR_ULT], fracturas.set_index("anio").loc[FR_ULT - 1]
agregar(fracturas.rename(columns={"anio": "periodo", "etapas": "valor"}).assign(codigo_indec="00", territorio="Argentina"),
        "etapas_fractura_no_convencional", "etapas de fractura por año", "Secretaria de Energia, datos de fractura de pozos (Adjunto IV)")

# Pozos terminados por mes, tipo y provincia (Secretaría de Energía, desde 2009): por año completo y, por provincia, los doce meses
# más recientes ("Estado Nacional" es el mar a más de 12 millas, como en la producción)
pt_ = pd.read_csv(CRUDO / "se_pozos_terminados.csv")
pt_["periodo"] = pt_.anio.astype(str) + "-" + pt_.mes.astype(str).str.zfill(2)
pt_["codigo_indec"] = pt_.provincia.map(lambda t: MAR if norm(t) == "estado nacional" else codigo(t))
assert pt_.codigo_indec.notna().all(), f"provincias sin código en los pozos terminados: {pt_[pt_.codigo_indec.isna()].provincia.unique()}"
TIPOS_PT = {"Explotación": "explotacion", "Exploración": "exploracion", "Avanzada": "avanzada", "Servicio": "servicio"}
assert set(pt_.tipo_pozo) <= set(TIPOS_PT), set(pt_.tipo_pozo) - set(TIPOS_PT)
pt_["tipo"] = pt_.tipo_pozo.map(TIPOS_PT)
PT_ULT_M = pt_.periodo.max()
PT_ULT = int(PT_ULT_M[:4]) - (0 if PT_ULT_M.endswith("-12") else 1)  # último año completo
pozos_term = pt_[pt_.anio <= PT_ULT].pivot_table(index="anio", columns="tipo", values="cantidad_pozos", aggfunc="sum").reindex(
    columns=list(TIPOS_PT.values())).fillna(0).astype(int)
pozos_term["total"] = pozos_term.sum(axis=1)
pozos_term = pozos_term.reset_index()
_v12 = [str(p) for p in pd.period_range(end=pd.Period(PT_ULT_M, "M"), periods=12, freq="M")]
_v12a = [str(p) for p in pd.period_range(end=pd.Period(PT_ULT_M, "M") - 12, periods=12, freq="M")]
pozos_term_prov = pt_[pt_.periodo.isin(_v12)].pivot_table(index="codigo_indec", columns="tipo", values="cantidad_pozos", aggfunc="sum").reindex(
    columns=list(TIPOS_PT.values())).fillna(0).astype(int)
pozos_term_prov["total"] = pozos_term_prov.sum(axis=1)
pozos_term_prov["total_antes"] = pt_[pt_.periodo.isin(_v12a)].groupby("codigo_indec").cantidad_pozos.sum().reindex(pozos_term_prov.index).fillna(0).astype(int)
pozos_term_prov = pozos_term_prov[pozos_term_prov.total > 0].reset_index()
pozos_term_prov["territorio"] = pozos_term_prov.codigo_indec.map(lambda c: "Mar argentino" if c == MAR else CORTO[c])
pozos_term_prov["pct"] = pozos_term_prov.total / pozos_term_prov.total.sum() * 100
pozos_term_prov = pozos_term_prov[["codigo_indec", "territorio", "explotacion", "exploracion", "avanzada", "servicio", "total", "total_antes", "pct"]].sort_values("total", ascending=False)
_ptu, _pta = pozos_term.set_index("anio").loc[PT_ULT], pozos_term.set_index("anio")
_pt_max = pozos_term.loc[pozos_term.total.idxmax()]
agregar(pozos_term.rename(columns={"anio": "periodo", "total": "valor"}).assign(codigo_indec="00", territorio="Argentina"),
        "pozos_terminados", "pozos terminados por año", "Secretaria de Energia, perforacion de pozos de petroleo y gas")

# Productividad de los pozos de shale de Vaca Muerta según el año en que empezaron a producir (etapa 19, como la infografía de la
# Secretaría de Energía): producción del primer año de los pozos petrolíferos (doce meses calendario desde el primer mes con
# producción, los meses sin declaración cuentan cero), por pozo y por cada 1.000 metros de rama horizontal (la rama sale de las
# fracturas), y las curvas de producción acumulada por año de inicio. Solo años de inicio completos: los que tienen a todos sus
# pozos con doce meses de historia (los de diciembre necesitan datos hasta noviembre del año siguiente).
pnc_ = pd.read_csv(CRUDO / "se_pozos_nc.csv")
cos_ = pd.read_csv(CRUDO / "se_pozos_nc_cosechas.csv")
_ult_nc = pd.Period(pnc_.ultimo_mes.max(), "M")
COS_ULT = (_ult_nc - 11).year - (0 if (_ult_nc - 11).month == 12 else 1)
_vmo = pnc_[pnc_.formacion.str.upper().eq("VMUT") & pnc_.subtipo.eq("SHALE") & pnc_.tipo_pozo.eq("Petrolífero") & pnc_.pet_12m_m3.notna()].copy()
_vmo["anio"] = _vmo.inicio.str[:4].astype(int)
_vmo["rama"] = _vmo.idpozo.map(fr_.groupby("idpozo").longitud_rama_horizontal_m.max())
_porp = _vmo.groupby("anio").agg(pozos=("idpozo", "size"), pet_12m_m3=("pet_12m_m3", "mean"))
COS_INI = int(_porp[_porp.pozos >= 30].index.min())  # el primer año con al menos 30 pozos, para no comparar con un puñado
_conr = _vmo[_vmo.rama > 100]
_porm = _conr.groupby("anio").agg(pozos_rama=("idpozo", "size"), rama_m=("rama", "mean"))
_porm["m3_por_1000m"] = (_conr.pet_12m_m3 / _conr.rama * 1000).groupby(_conr.anio).mean()
RAMA_DESDE = int(_porm[_porm.pozos_rama >= 50].index.min())  # desde ahí casi todos los pozos informan la rama
productividad_vm = _porp.join(_porm).loc[COS_INI:COS_ULT].reset_index()
productividad_vm["pet_12m_kbbl"] = productividad_vm.pet_12m_m3 * BBL / 1000
productividad_vm["bbl_por_1000m"] = (productividad_vm.m3_por_1000m * BBL).where(productividad_vm.anio >= RAMA_DESDE)
productividad_vm.loc[productividad_vm.anio < RAMA_DESDE, ["pozos_rama", "rama_m"]] = None
productividad_vm = productividad_vm[["anio", "pozos", "pet_12m_kbbl", "pozos_rama", "rama_m", "bbl_por_1000m"]]
_pvd = productividad_vm.set_index("anio")
_pvd_m = _pvd.dropna(subset=["bbl_por_1000m"])
# curvas de producción acumulada (miles de barriles por pozo) de un año de inicio cada dos, terminando en el último completo
_c = cos_[cos_.tipo_pozo.eq("Petrolífero") & cos_.cosecha.between(COS_INI, COS_ULT)]
COS_CURVAS = [a for a in range(COS_ULT, COS_INI - 1, -2)][::-1]
curvas_vm = _c[_c.cosecha.isin(COS_CURVAS)].pivot_table(index="mes", columns="cosecha", values="acum_pet_m3").mul(BBL / 1000)
curvas_vm.columns = [f"c{a}" for a in curvas_vm.columns]
curvas_vm = curvas_vm.reset_index()
_cv = curvas_vm.set_index("mes")
agregar(productividad_vm.rename(columns={"anio": "periodo", "pet_12m_kbbl": "valor"}).assign(codigo_indec="00", territorio="Argentina"),
        "petroleo_primer_anio_pozo_vaca_muerta", "miles de barriles por pozo en sus primeros doce meses", "Secretaria de Energia, produccion por pozo (Capitulo IV)")

# Mapa de los pozos no convencionales (etapa 19): cada pozo que produjo alguna vez, con su ubicación, su empresa, su área, el año en
# que empezó y lo que produjo el último mes de datos. Las áreas de concesión (sitio/datos/concesiones.topo.json, de
# scripts/geometria_concesiones.py) llevan la producción del último año completo de la producción por área, unida por el código SESCO.
pozos_nc = pnc_.copy()
pozos_nc["empresa"] = pozos_nc.empresa.map(nombre_empresa)
pozos_nc["tipo"] = pozos_nc.tipo_pozo.map({"Petrolífero": "Petróleo", "Gasífero": "Gas"}).fillna("Otro")
pozos_nc["recurso"] = pozos_nc.subtipo.str.capitalize()
_dias_u = _ult_nc.days_in_month
pozos_nc["pet_bpd"] = pozos_nc.pet_ult_m3 * BBL / _dias_u
pozos_nc["gas_miles_m3d"] = pozos_nc.gas_ult_miles_m3 / _dias_u
pozos_nc["area"] = pozos_nc.area.str.strip()
pozos_nc = pozos_nc[["sigla", "empresa", "area", "area_id", "provincia", "recurso", "tipo", "inicio", "x", "y", "pet_bpd", "gas_miles_m3d"]].round(
    {"x": 4, "y": 4, "pet_bpd": 1, "gas_miles_m3d": 1})
_activo = (pozos_nc.pet_bpd > 0) | (pozos_nc.gas_miles_m3d > 0)
_act_nq = pozos_nc[_activo].provincia.map(lambda t: codigo(t)).eq("58")
MAP_CORTES = [2015, 2018, 2021, _ult_nc.year - 2]  # cinco grupos por año de inicio: hasta 2015, 2016 a 2018, ...
assert MAP_CORTES[2] < MAP_CORTES[3], "los grupos de años del mapa se superponen"
_top_areas = pozos_nc[_activo].groupby("area").size().sort_values(ascending=False).head(3)
_ap = pd.read_csv(CRUDO / "se_produccion_areas.csv")
AREAS_ANIO = int(_ap.anio.max()) - 1  # el último año completo
# Producción por área de concesión (etapa 21, como las páginas por yacimiento de Norsk Petroleum): las áreas que produjeron petróleo o gas
# en el último año completo, con su provincia, su cuenca y la empresa que más produjo en ellas, y lo que produjo cada una cada año desde el
# primero del archivo, convencional y no convencional (shale y tight; lo convencional incluye lo poco que la fuente no clasifica). Sale del
# archivo agrupado por yacimiento y formación, que tiene algunos meses incompletos (ver la producción anual por provincia, más arriba): en
# esos años la producción de cada área puede quedar algo por debajo, la nota los nombra y la serie por área no va a la tabla larga. El mapa
# de los pozos usa la misma tabla de áreas.
CUENCA_AREA = {"NEUQUINA": "Neuquina", "GOLFO SAN JORGE": "Golfo San Jorge", "AUSTRAL": "Austral", "CUYANA": "Cuyana", "NOROESTE": "Noroeste",
               "NORESTE": "Noreste"}
_ar = _ap[_ap.anio <= AREAS_ANIO].copy()
_ar["codigo_indec"] = _ar.provincia.map(lambda t: MAR if norm(t) == "estado nacional" else codigo(t))
assert _ar.codigo_indec.notna().all(), f"provincias sin código en las áreas de concesión: {_ar[_ar.codigo_indec.isna()].provincia.unique()}"
assert set(_ar.cuenca.dropna()) <= set(CUENCA_AREA), f"cuencas nuevas en las áreas de concesión: {set(_ar.cuenca.dropna()) - set(CUENCA_AREA)}"
_ar_d = _ar.anio.map(lambda a: 366 if pd.Timestamp(f"{a}-12-31").is_leap_year else 365)
_ar["pet_kbd"], _ar["gas_mmm3d"] = _ar.prod_pet / _ar_d * BBL / 1000, _ar.prod_gas / _ar_d / 1000
_ar["pet_nc_kbd"], _ar["gas_nc_mmm3d"] = _ar.pet_nc / _ar_d * BBL / 1000, _ar.gas_nc / _ar_d / 1000
_ar["pet_conv"], _ar["gas_conv"] = (_ar.pet_kbd - _ar.pet_nc_kbd).clip(lower=0), (_ar.gas_mmm3d - _ar.gas_nc_mmm3d).clip(lower=0)
_aru = _ar[_ar.anio == AREAS_ANIO].set_index("idareapermisoconcesion")
assert _aru.index.is_unique and _aru.empresa.notna().all(), "áreas repetidas o sin empresa en el último año completo"
_ar10 = _ar[_ar.anio == AREAS_ANIO - 10].set_index("idareapermisoconcesion")
areas_prod = pd.DataFrame({
    "codigo": _aru.index, "nombre": _aru.area.str.strip().values, "codigo_indec": _aru.codigo_indec.values,
    "territorio": [("Mar argentino" if c == MAR else CORTO[c]) for c in _aru.codigo_indec], "cuenca": _aru.cuenca.map(CUENCA_AREA).values,
    "empresa": _aru.empresa.map(nombre_empresa).values,
    "pet_kbd": _aru.pet_kbd.values, "pct_pet_pais": (_aru.pet_kbd / _aru.pet_kbd.sum() * 100).values,
    "pct_pet_nc": (_aru.pet_nc_kbd / _aru.pet_kbd.where(_aru.pet_kbd > 0) * 100).values,
    "pet_kbd_antes": _ar10.pet_kbd.reindex(_aru.index).fillna(0).values,
    "gas_mmm3d": _aru.gas_mmm3d.values, "pct_gas_pais": (_aru.gas_mmm3d / _aru.gas_mmm3d.sum() * 100).values,
    "pct_gas_nc": (_aru.gas_nc_mmm3d / _aru.gas_mmm3d.where(_aru.gas_mmm3d > 0) * 100).values,
    "gas_mmm3d_antes": _ar10.gas_mmm3d.reindex(_aru.index).fillna(0).values,
}).round(4).sort_values("pet_kbd", ascending=False)
# lo que produjo cada área cada año (solo las que produjeron en el último año completo y los años en que produjeron algo)
areas_serie = _ar.loc[_ar.idareapermisoconcesion.isin(_aru.index), ["idareapermisoconcesion", "anio", "pet_conv", "pet_nc_kbd", "gas_conv", "gas_nc_mmm3d"]].set_axis(
    ["codigo", "anio", "pet_conv", "pet_nc", "gas_conv", "gas_nc"], axis=1).round(4)
areas_serie = areas_serie[areas_serie[["pet_conv", "pet_nc", "gas_conv", "gas_nc"]].sum(axis=1) > 0].sort_values(["codigo", "anio"])
# años con algún mes incompleto en el archivo agrupado: menos del 99% del total del país en petróleo o en gas
AR_INC = sorted({int(p[:4]) for p in _tot.index if p in _ref.index and p not in _comp and int(_ar.anio.min()) <= int(p[:4]) <= AREAS_ANIO})


def _ar_top(k, pct, nc, antes):  # el área que más produjo de un producto en el último año completo
    r = areas_prod.sort_values(k, ascending=False).iloc[0]
    return {"nombre": r.nombre, "territorio": r.territorio, "empresa": r.empresa, "v": float(r[k]), "pct": r1(r[pct]),
            "nc": r1(r[nc]), "antes": float(r[antes])}


def _ar_n50(s):  # cuántas áreas, de mayor a menor, hacen falta para llegar a la mitad del país
    return int((s.sort_values(ascending=False).cumsum() / s.sum() < .5).sum() + 1)


AR_RES = {"areas_ini": int(_ar.anio.min()), "areas_n": int(len(areas_prod)), "areas_n_nc": int(((_aru.pet_nc_kbd > 0) | (_aru.gas_nc_mmm3d > 0)).sum()),
          "areas_top10_pet": r1(areas_prod.pct_pet_pais.nlargest(10).sum()), "areas_top10_gas": r1(areas_prod.pct_gas_pais.nlargest(10).sum()),
          "areas_n50_pet": _ar_n50(_aru.pet_kbd), "areas_n50_gas": _ar_n50(_aru.gas_mmm3d),
          "areas_pet_top": _ar_top("pet_kbd", "pct_pet_pais", "pct_pet_nc", "pet_kbd_antes"),
          "areas_gas_top": _ar_top("gas_mmm3d", "pct_gas_pais", "pct_gas_nc", "gas_mmm3d_antes"), "areas_incompletos": AR_INC}

# Centrales eléctricas (etapa 19): el listado de la Secretaría de Energía, con datos de CAMMESA, trae cada central con su tecnología,
# potencia, provincia y ubicación, pero 177 de 474 no informan potencia (102 de ellas en el mercado mayorista): por eso el mapa las
# muestra sin tamaño y la potencia del país sale de la serie anual de CAMMESA por tecnología. Las tecnologías se agrupan en seis.
cen_ = pd.read_csv(CRUDO / "se_centrales.csv")
cen_["nombre"] = cen_.nombre.map(lambda s: s.encode("latin-1").decode("utf-8") if isinstance(s, str) and "Ã" in s else s)  # doble codificación
GRUPO_CEN = {"Térmica": "Térmica", "Hidroeléctrica": "Hidroeléctrica", "Hidroeléctrica (Menor a 50 Mw)": "Hidroeléctrica", "Nuclear": "Nuclear",
             "Eólica": "Eólica", "Fotovoltaica": "Solar", "Biogas": "Biomasa y biogás", "Biomasa": "Biomasa y biogás"}
assert set(cen_.tecnologia_etiqueta) <= set(GRUPO_CEN), set(cen_.tecnologia_etiqueta) - set(GRUPO_CEN)
cen_["codigo_indec"] = cen_.provincia.map(lambda t: None if pd.isna(t) else "02" if norm(t).startswith("ciudad autonoma") else codigo(t))
# alguna central viene sin provincia en la fuente: queda en el mapa, sin provincia
assert cen_[cen_.provincia.notna()].codigo_indec.notna().all(), f"provincias sin código en las centrales: {cen_[cen_.provincia.notna() & cen_.codigo_indec.isna()].provincia.unique()}"
_xy = cen_.geojson.map(lambda g: json.loads(g)["coordinates"])
centrales = pd.DataFrame({"nombre": cen_.nombre.str.strip(), "tecnologia": cen_.tecnologia_etiqueta.map(GRUPO_CEN), "detalle": cen_.tecnologia_etiqueta,
                          "potencia_mw": cen_.potencia_instalada_mw, "codigo_indec": cen_.codigo_indec, "provincia": cen_.codigo_indec.map(CORTO),
                          "departamento": cen_.departamento, "sistema": cen_.sistema, "x": _xy.str[0].round(4), "y": _xy.str[1].round(4)})
CEN_FECHA = json.loads((CRUDO / "se_centrales_meta.json").read_text(encoding="utf-8"))["actualizado"]
_cn = centrales.tecnologia.value_counts()
_cen_top = {t: centrales[centrales.tecnologia == t].provincia.value_counts() for t in ("Eólica", "Solar")}
# Potencia instalada del país por tecnología (CAMMESA vía API de Series de Tiempo), MW al cierre de cada año
pot_ = pd.read_csv(CRUDO / "potencia_instalada.csv")
pot_["anio"] = pot_.indice_tiempo.str[:4].astype(int)
potencia = pd.DataFrame({"anio": pot_.anio,
    "termica": pot_.potencia_instalada_ciclos_combinados + pot_.potencia_instalada_turbina_a_gas + pot_.potencia_instalada_turbovapor + pot_.potencia_instalada_motor_diesel,
    "hidraulica": pot_.potencia_instalada_hidraulica + pot_.potencia_instalada_hidraulica_renovable, "nuclear": pot_.potencia_instalada_nuclear,
    "eolica": pot_.potencia_instalada_eolica, "solar": pot_.potencia_instalada_solar, "biogas": pot_.potencia_instalada_biogas, "total": pot_.potencia_instalada_total}).fillna(0)
assert (potencia[["termica", "hidraulica", "nuclear", "eolica", "solar", "biogas"]].sum(axis=1) - potencia.total).abs().max() < 1, "las tecnologías no suman la potencia total"
POT_U = potencia.iloc[-1]
POT_I = potencia[potencia.anio == int(POT_U.anio) - 10].iloc[0]  # diez años antes
agregar(potencia.rename(columns={"anio": "periodo", "total": "valor"}).assign(codigo_indec="00", territorio="Argentina"),
        "potencia_instalada", "MW", "CAMMESA, via API de Series de Tiempo")

# Consumo de gas por usuario residencial (ENARGAS, etapa 20): gas entregado a los usuarios domiciliarios de las distribuidoras y cantidad
# de esos usuarios, por provincia y mes (cuadro I.10 de los datos operativos). El consumo de un año divide el gas de sus doce meses por el
# promedio de usuarios del año. Las provincias con menos de GAS_MIN usuarios residenciales (redes que recién empiezan) no se comparan.
gas_ = pd.read_csv(CRUDO / "enargas_gas_residencial.csv")
gas_["codigo_indec"] = gas_.provincia.map(codigo)
assert gas_.codigo_indec.notna().all(), gas_[gas_.codigo_indec.isna()].provincia.unique()
gas_["anio"] = gas_.periodo.str[:4].astype(int)
GAS_MIN = 1000
_gas_meses = gas_.groupby("anio").periodo.nunique()
GAS_ULT = int(_gas_meses[_gas_meses == 12].index.max())  # último año completo
GAS_INI = int(gas_.anio.min())
GAS_UM = gas_.periodo.max()  # último mes publicado


def gas_anual(g):  # gas de los meses del año (miles de m³) y promedio de usuarios
    return pd.Series({"usuarios": g.usuarios.mean(), "miles_m3": g.miles_m3.sum()})


_gas_pm = gas_.groupby("periodo")[["usuarios", "miles_m3"]].sum().reset_index()
_gas_pm["anio"] = _gas_pm.periodo.str[:4].astype(int)
gas_pais_a = _gas_pm[_gas_pm.anio <= GAS_ULT].groupby("anio").apply(gas_anual)
gas_pais_a["m3_usuario"] = gas_pais_a.miles_m3 / gas_pais_a.usuarios * 1000
gas_prov_a = gas_[gas_.anio <= GAS_ULT].groupby(["codigo_indec", "anio"]).apply(gas_anual).reset_index()
gas_prov_a["m3_usuario"] = gas_prov_a.miles_m3 / gas_prov_a.usuarios * 1000
GAS_PAIS = gas_pais_a.loc[GAS_ULT]
_gas_u = gas_prov_a[gas_prov_a.anio == GAS_ULT].set_index("codigo_indec")
_gas_ok = _gas_u[_gas_u.usuarios >= GAS_MIN]
_gas_10 = gas_prov_a[(gas_prov_a.anio == GAS_ULT - 10) & (gas_prov_a.usuarios >= GAS_MIN)].set_index("codigo_indec").m3_usuario
gas_usuario_provincias = pd.DataFrame({
    "codigo_indec": _gas_ok.index, "territorio": _gas_ok.index.map(CORTO), "usuarios": _gas_ok.usuarios.round(0).astype(int).values,
    "millones_m3": (_gas_ok.miles_m3 / 1000).round(1).values, "m3_usuario": _gas_ok.m3_usuario.round(1).values,
    "veces_pais": (_gas_ok.m3_usuario / GAS_PAIS.m3_usuario).round(2).values,
    "m3_usuario_10": _gas_ok.index.map(_gas_10).values.round(1),
}).sort_values("m3_usuario", ascending=False).reset_index(drop=True)
gas_usuario_provincias = gas_usuario_provincias.rename(columns={"m3_usuario_10": f"m3_usuario_{GAS_ULT - 10}"})
# serie anual del país y de cada provincia (solo los años con al menos GAS_MIN usuarios), y meses de los últimos cinco años
_gas_s = gas_prov_a[gas_prov_a.usuarios >= GAS_MIN][["anio", "codigo_indec", "m3_usuario"]]
gas_usuario_serie = pd.concat([gas_pais_a.reset_index()[["anio", "m3_usuario"]].assign(codigo_indec="00"), _gas_s], ignore_index=True)
gas_usuario_serie["territorio"] = gas_usuario_serie.codigo_indec.map(lambda c: "Todo el país" if c == "00" else CORTO[c])
gas_usuario_serie = gas_usuario_serie[["anio", "codigo_indec", "territorio", "m3_usuario"]].round({"m3_usuario": 1})
GAS_MES_DESDE = f"{GAS_ULT - 4}-01"
gas_usuario_mensual = pd.concat([_gas_pm[_gas_pm.periodo >= GAS_MES_DESDE].assign(codigo_indec="00"),
                                 gas_[(gas_.periodo >= GAS_MES_DESDE) & gas_.codigo_indec.isin(_gas_ok.index)]], ignore_index=True)
gas_usuario_mensual["m3_usuario"] = (gas_usuario_mensual.miles_m3 / gas_usuario_mensual.usuarios * 1000).round(2)
gas_usuario_mensual = gas_usuario_mensual[["periodo", "codigo_indec", "m3_usuario"]]
# mes de mayor y de menor consumo, en promedio de los tres últimos años completos
_gas_3 = _gas_pm[(_gas_pm.anio > GAS_ULT - 3) & (_gas_pm.anio <= GAS_ULT)]
_gas_est = (_gas_3.miles_m3 / _gas_3.usuarios * 1000).groupby(_gas_3.periodo.str[5:7].astype(int)).mean()


def gas_hasta_mes(anio, mes):  # m³ por usuario entre enero y ese mes
    x = _gas_pm[(_gas_pm.anio == anio) & (_gas_pm.periodo.str[5:7].astype(int) <= mes)]
    return x.miles_m3.sum() / x.usuarios.mean() * 1000


_gas_ua, _gas_umes = int(GAS_UM[:4]), int(GAS_UM[5:7])
GAS_YTD = None if _gas_ua == GAS_ULT else {
    "anio": _gas_ua, "mes": _gas_umes, "m3": r1(gas_hasta_mes(_gas_ua, _gas_umes)), "m3_ant": r1(gas_hasta_mes(_gas_ua - 1, _gas_umes)),
    "var": r1((gas_hasta_mes(_gas_ua, _gas_umes) / gas_hasta_mes(_gas_ua - 1, _gas_umes) - 1) * 100)}
_gas_pat = _gas_u.loc[[c for c in ("26", "58", "62", "78", "94") if c in _gas_u.index]]  # las cinco provincias patagónicas
# Gran Bretaña (DESNZ): consumo medio por medidor doméstico, corregido por clima, en kWh. Un m³ de 9.300 kilocalorías son unos 10,82 kWh
gas_ru_ = pd.read_csv(CRUDO / "desnz_gas_domestico.csv").iloc[-1]
GAS_KWH_M3 = 9300 * 4.1868 / 3600
for _gas_t, _gas_var, _gas_uni in [(gas_prov_a[gas_prov_a.usuarios >= GAS_MIN].assign(valor=lambda x: x.m3_usuario), "gas_consumo_usuario_residencial", "m³ por usuario por año"),
                                   (gas_pais_a.reset_index().assign(codigo_indec="00", valor=lambda x: x.m3_usuario), "gas_consumo_usuario_residencial", "m³ por usuario por año"),
                                   (gas_pais_a.reset_index().assign(codigo_indec="00", valor=lambda x: x.miles_m3 / 1000), "gas_residencial_entregado", "millones de m³")]:
    _gas_d = _gas_t.assign(territorio=_gas_t.codigo_indec.map(lambda c: "Argentina" if c == "00" else NOMBRE[c]), periodo=_gas_t.anio.astype(str))
    agregar(_gas_d[["codigo_indec", "territorio", "periodo", "valor"]], _gas_var, _gas_uni, "ENARGAS, datos operativos de gas natural (cuadro I.10)")
GAS_RES = {
    "gas_anio": GAS_ULT, "gas_ini": GAS_INI, "gas_hasta": f"{MES[int(GAS_UM[5:7]) - 1]} de {GAS_UM[:4]}", "gas_mes_desde": int(GAS_MES_DESDE[:4]),
    "gas_pais": r1(GAS_PAIS.m3_usuario), "gas_pais_ini": r1(gas_pais_a.loc[GAS_INI].m3_usuario),
    "gas_max": r1(gas_pais_a.m3_usuario.max()), "gas_max_anio": int(gas_pais_a.m3_usuario.idxmax()),
    "gas_min": r1(gas_pais_a.m3_usuario.min()), "gas_min_anio": int(gas_pais_a.m3_usuario.idxmin()),
    "gas_usuarios": round(float(GAS_PAIS.usuarios)), "gas_usuarios_ini": round(float(gas_pais_a.loc[GAS_INI].usuarios)),
    "gas_usuarios_ult": int(_gas_pm[_gas_pm.periodo == GAS_UM].usuarios.iloc[0]),
    "gas_top": [[r.territorio, r1(r.m3_usuario)] for r in gas_usuario_provincias.head(3).itertuples()],
    "gas_bajo": [gas_usuario_provincias.iloc[-1].territorio, r1(gas_usuario_provincias.iloc[-1].m3_usuario)],
    "gas_veces_top": r1(gas_usuario_provincias.iloc[0].m3_usuario / GAS_PAIS.m3_usuario),
    "gas_pat_usuarios": r1(_gas_pat.usuarios.sum() / _gas_u.usuarios.sum() * 100), "gas_pat_gas": r1(_gas_pat.miles_m3.sum() / _gas_u.miles_m3.sum() * 100),
    "gas_est_desde": GAS_ULT - 2, "gas_est_hasta": GAS_ULT,
    "gas_mes_max": MES[int(_gas_est.idxmax()) - 1], "gas_mes_max_m3": r1(_gas_est.max()),
    "gas_mes_min": MES[int(_gas_est.idxmin()) - 1], "gas_mes_min_m3": r1(_gas_est.min()),
    "gas_ytd": GAS_YTD, "gas_min_usuarios": GAS_MIN,
    "gas_chicas": [[CORTO[c], int(round(u))] for c, u in _gas_u[_gas_u.usuarios < GAS_MIN].usuarios.items()],
    "gas_sin": [NOMBRE[c] for c in NOMBRE if c not in set(gas_.codigo_indec)],
    "gas_ru": {"anio": int(gas_ru_.anio), "kwh": round(float(gas_ru_.kwh_medidor)), "m3": round(float(gas_ru_.kwh_medidor) / GAS_KWH_M3),
               "ar": r1(gas_pais_a.loc[int(gas_ru_.anio)].m3_usuario) if int(gas_ru_.anio) in gas_pais_a.index else None},
}

# Reservas comprobadas al 31 de diciembre (hasta el final de la vida útil de los yacimientos), con el horizonte: cuántos años
# alcanzarían al ritmo de producción de ese año. Desde 2017 la fuente separa convencional y no convencional, y trae la provincia
rv_ = pd.read_csv(CRUDO / "se_reservas_resumen.csv")
_rt = rv_.groupby("anio")[["pet_comprobadas", "gas_comprobadas"]].sum()
_rnc = rv_[rv_.tipo == "no_convencional"].groupby("anio")[["pet_comprobadas", "gas_comprobadas"]].sum()
_prod_anual = hm.groupby(hm.fecha.dt.year)[["total_p", "total_g"]].sum()
reservas = pd.DataFrame({"anio": _rt.index, "pet_millones_m3": _rt.pet_comprobadas.values / 1000, "gas_miles_millones_m3": _rt.gas_comprobadas.values / 1000})
reservas["pet_miles_millones_bbl"] = reservas.pet_millones_m3 * BBL / 1000
reservas["pct_pet_nc"] = reservas.anio.map(_rnc.pet_comprobadas / _rt.pet_comprobadas * 100)
reservas["pct_gas_nc"] = reservas.anio.map(_rnc.gas_comprobadas / _rt.gas_comprobadas * 100)
reservas["horizonte_pet"] = reservas.anio.map(_rt.pet_comprobadas * 1000 / _prod_anual.total_p)
reservas["horizonte_gas"] = reservas.anio.map(_rt.gas_comprobadas * 1e6 / (_prod_anual.total_g * 1000))
_meses_h = hm.groupby(hm.fecha.dt.year).size()
reservas = reservas[reservas.anio.isin(_meses_h[_meses_h == 12].index)]
RV_ULT, RV_INI = reservas.iloc[-1], reservas.iloc[0]
_rp = rv_[rv_.anio == int(RV_ULT.anio)].copy()
_rp["codigo_indec"] = _rp.provincia.map(lambda t: MAR if norm(t) == "estado nacional" else codigo(t))
assert _rp.codigo_indec.notna().all(), f"provincias sin código en reservas: {_rp[_rp.codigo_indec.isna()].provincia.unique()}"
reservas_prov = _rp.groupby("codigo_indec")[["pet_comprobadas", "gas_comprobadas"]].sum()
reservas_prov = (reservas_prov / reservas_prov.sum() * 100).rename(columns={"pet_comprobadas": "pct_pet", "gas_comprobadas": "pct_gas"}).reset_index()
reservas_prov["territorio"] = reservas_prov.codigo_indec.map(lambda c: "Mar argentino" if c == MAR else CORTO[c])
for col, var, uni in [("pet_millones_m3", "reservas_comprobadas_petroleo", "millones de m3"), ("gas_miles_millones_m3", "reservas_comprobadas_gas", "miles de millones de m3")]:
    d = reservas[["anio", col]].rename(columns={"anio": "periodo", col: "valor"})
    d["codigo_indec"], d["territorio"] = "00", "Argentina"
    agregar(d, var, uni, "Secretaria de Energia, reservas al 31 de diciembre (Res. SE 324/2006)")

# Regalías: (1) el peso de todas las regalías (petróleo, gas, minería e hidroelectricidad) en los ingresos totales de cada provincia,
# del esquema ahorro-inversión-financiamiento (pesos sobre pesos, las 24); (2) las regalías de petróleo crudo en dólares que publica la
# Secretaría de Energía por provincia. Las de gas se publican en pesos y no se suman con las de crudo.
reg_prov = fisc[["codigo_indec", "anio", "regalias"]].copy()
reg_hist = reg_prov.copy()
reg_prov = reg_prov[reg_prov.anio <= ANIO_FISC].sort_values("anio").drop_duplicates("codigo_indec", keep="last")
reg_prov["territorio"] = reg_prov.codigo_indec.map(CORTO)
_zr = zipfile.ZipFile(CRUDO / "se_regalias_crudo.zip")
_rx = pd.read_excel(io.BytesIO(_zr.read(_zr.namelist()[0])), "Tabla regalías", header=None)
_fila_enc = next(i for i in _rx.index if str(_rx.iat[i, 0]).strip().upper() in ("AÑO", "ANO"))
_rx.columns = [str(c).strip() for c in _rx.iloc[_fila_enc]]
_rx = _rx.iloc[_fila_enc + 1:]
_rx["AÑO"] = pd.to_numeric(_rx["AÑO"], errors="coerce").ffill()
_rx["MES"] = pd.to_numeric(_rx["MES"], errors="coerce")
_rx = _rx.dropna(subset=["MES"])
_cols_r = [c for c in _rx.columns if c not in ("AÑO", "MES", "TOTAL PROVINCIA", "nan")]
_rl = _rx.melt(id_vars=["AÑO", "MES"], value_vars=_cols_r, var_name="provincia", value_name="usd")
_rl["usd"] = pd.to_numeric(_rl.usd, errors="coerce").fillna(0)
_meses_r = _rl[_rl.usd > 0].groupby("AÑO").MES.nunique()
REG_ULT = int(_meses_r[_meses_r == 12].index.max())
_rl["codigo_indec"] = _rl.provincia.map(lambda t: MAR if norm(t) == "estado nacional" else codigo(t))
assert _rl.codigo_indec.notna().all(), f"provincias sin código en regalías: {_rl[_rl.codigo_indec.isna()].provincia.unique()}"
reg_crudo = _rl[_rl["AÑO"] == REG_ULT].groupby("codigo_indec").usd.sum()
reg_prov["usd_crudo_millones"] = reg_prov.codigo_indec.map(reg_crudo / 1e6).fillna(0)
reg_prov["usd_crudo_hab"] = reg_prov.codigo_indec.map(reg_crudo).fillna(0) / reg_prov.codigo_indec.map(POB)
reg_prov = reg_prov.rename(columns={"regalias": "pct_regalias", "anio": "anio_aif"})[["codigo_indec", "territorio", "anio_aif", "pct_regalias", "usd_crudo_millones", "usd_crudo_hab"]]
regalias_serie = (_rl[_rl["AÑO"] <= REG_ULT].groupby("AÑO").usd.sum() / 1e6).rename("usd_crudo_millones").reset_index().rename(columns={"AÑO": "anio"})
regalias_serie["anio"] = regalias_serie.anio.astype(int)
_reg_mar = float(reg_crudo.get(MAR, 0) / 1e6)
d = reg_hist.rename(columns={"anio": "periodo", "regalias": "valor"})
d["territorio"] = d.codigo_indec.map(CORTO)
agregar(d, "regalias_pct_ingresos", "% de los ingresos totales", "Ministerio de Economia, cuentas provinciales (esquema AIF)")

# Comercio exterior de energía (INDEC, Intercambio Comercial Argentino): exportaciones de combustibles y energía e importaciones
# de combustibles y lubricantes, millones de dólares. Años completos y lo que va del año
ica = pd.read_csv(CRUDO / "indec_ica_energia.csv", parse_dates=["indice_tiempo"]).dropna()
ica["anio"] = ica.indice_tiempo.dt.year
_mi = ica.groupby("anio").size()
balanza = ica[ica.anio.isin(_mi[_mi == 12].index)].groupby("anio")[["ica_exportacion_combustible_energia", "ica_importaciones_combustibles_lubricantes"]].sum()
balanza.columns = ["exportaciones", "importaciones"]
balanza["saldo"] = balanza.exportaciones - balanza.importaciones
balanza = balanza.reset_index()
YTD_BAL = {"expo": en_lo_que_va(ica.indice_tiempo, ica.ica_exportacion_combustible_energia),
           "impo": en_lo_que_va(ica.indice_tiempo, ica.ica_importaciones_combustibles_lubricantes)}
_u_ica = ica[ica.anio == ica.anio.max()]
_bal_ytd = {"anio": int(_u_ica.anio.max()), "mes": int(_u_ica.indice_tiempo.dt.month.max()),
            "saldo": round(float(_u_ica.ica_exportacion_combustible_energia.sum() - _u_ica.ica_importaciones_combustibles_lubricantes.sum()))}
BA_ULT = balanza.iloc[-1]
_bal_def = balanza[balanza.saldo < 0]
for col, var in [("exportaciones", "exportaciones_combustibles_energia"), ("importaciones", "importaciones_combustibles_lubricantes")]:
    d = balanza[["anio", col]].rename(columns={"anio": "periodo", col: "valor"})
    d["codigo_indec"], d["territorio"] = "00", "Argentina"
    agregar(d, var, "millones de dolares", "INDEC, Intercambio Comercial Argentino")

# La Argentina entre los productores del mundo: Administración de Información Energética de los Estados Unidos (EIA), petróleo crudo
# con condensado (miles de barriles por día) y gas natural seco (miles de millones de m3). Último año con dato para al menos el 95% de
# los países productores de los años anteriores (unos 100).
# Es una estimación propia de la EIA: para la Argentina difiere apenas de la serie de la Secretaría de Energía (se compara en las pruebas)
eia = pd.read_csv(CRUDO / "eia_produccion_paises.csv", keep_default_na=False, na_values=[""])
eia = eia[eia.valor > 0]
# nombres en español del Banco Mundial, sin la forma de gobierno ("Irán, República Islámica del" -> "Irán")
NOMBRE_PAIS_ES = {x["id"]: {"Federación de Rusia": "Rusia"}.get(x["name"].split(",")[0], x["name"].split(",")[0])
                  for x in json.loads((CRUDO / "bm_paises.json").read_text(encoding="utf-8"))[1]}
RANKING, MUNDO = {}, {}
for var in ("crudo_kbd", "gas_bcm"):
    x = eia[eia.variable == var]
    n_anio = x.groupby("anio").iso3.nunique()
    anio = int(n_anio[n_anio >= .95 * n_anio.max()].index.max())
    x = x[x.anio == anio].sort_values("valor", ascending=False).reset_index(drop=True)
    x["puesto"] = x.index + 1
    x["pais"] = x.iso3.map(NOMBRE_PAIS_ES).fillna(x.nombre)
    arg = x[x.iso3 == "ARG"].iloc[0]
    MUNDO[var] = {"anio": anio, "arg": float(arg.valor), "puesto": int(arg.puesto), "n": int(len(x)), "mundo": float(x.valor.sum()),
                  "pct": float(arg.valor / x.valor.sum() * 100)}
    RANKING[var] = x
# "Si Neuquén fuera un país": su producción de petróleo del mismo año que la EIA, en el ranking de países
_nq = _pa[(_pa.codigo_indec == "58") & (_pa.anio == MUNDO["crudo_kbd"]["anio"])]
_xc = eia[(eia.variable == "crudo_kbd") & (eia.anio == MUNDO["crudo_kbd"]["anio"])].sort_values("valor", ascending=False).reset_index(drop=True)
if len(_nq):
    _nqv = float(_nq.pet_kbd.iloc[0])
    _pos = int((_xc.valor > _nqv).sum())
    MUNDO["neuquen"] = {"anio": MUNDO["crudo_kbd"]["anio"], "kbd": round(_nqv), "puesto": _pos + 1,
                        "arriba": NOMBRE_PAIS_ES.get(_xc.iso3[_pos - 1], _xc.nombre[_pos - 1]) if _pos > 0 else None,
                        "abajo": NOMBRE_PAIS_ES.get(_xc.iso3[_pos], _xc.nombre[_pos]) if _pos < len(_xc) else None}
d = eia[(eia.iso3 == "ARG") & (eia.variable == "crudo_kbd")][["anio", "valor"]].rename(columns={"anio": "periodo"})
d["codigo_indec"], d["territorio"] = "00", "Argentina"
agregar(d, "eia_produccion_crudo", "miles de barriles por dia", "EIA, estadisticas internacionales de energia (estimacion)")
# el gráfico muestra los países que producen más que la Argentina, algunos de los que siguen y, en petróleo, los dos entre los que
# quedaría Neuquén
_lim = {"crudo_kbd": max(20, MUNDO["crudo_kbd"]["puesto"] + 4, MUNDO.get("neuquen", {}).get("puesto", 0)), "gas_bcm": max(20, MUNDO["gas_bcm"]["puesto"] + 4)}
mundo_hidro = pd.concat([x[x.puesto <= _lim[v]].assign(variable=v)[["variable", "anio", "puesto", "iso3", "pais", "valor"]] for v, x in RANKING.items()], ignore_index=True)

# Empleo registrado en la construcción y en la extracción de petróleo y gas, por provincia (OEDE, SIPA): asalariados del sector
# privado, último trimestre con las 24 provincias, contra el mismo trimestre del año anterior. Buenos Aires suma los partidos del
# GBA y el resto de la provincia. Las celdas en secreto estadístico ("s.d.") quedan sin dato
oe = pd.read_csv(CRUDO / "oede_empleo_ramas.csv")
oe["codigo_indec"] = oe.hoja.map(lambda h: "06" if norm(h) in ("partidos de gba", "resto de buenos aires") else codigo(h))
assert oe.codigo_indec.notna().all(), f"hojas del OEDE sin provincia: {oe[oe.codigo_indec.isna()].hoja.unique()}"
oe = oe.groupby(["codigo_indec", "rama", "anio", "trimestre"], as_index=False).valor.sum(min_count=1)
oe["t"] = oe.anio * 10 + oe.trimestre
_tc = oe[oe.rama == "construccion"].groupby("t").valor.count()
OE_T = int(_tc[_tc == 24].index.max())
OE_ANT = OE_T - 10
_w = oe.pivot_table(index=["codigo_indec", "t"], columns="rama", values="valor").reset_index()
_wu, _wa = _w[_w.t == OE_T].set_index("codigo_indec"), _w[_w.t == OE_ANT].set_index("codigo_indec")
empleo_sec = pd.DataFrame({"codigo_indec": sorted(_wu.index)})
empleo_sec["territorio"] = empleo_sec.codigo_indec.map(CORTO)
empleo_sec["construccion"] = empleo_sec.codigo_indec.map(_wu.construccion)
empleo_sec["construccion_cada_1000"] = empleo_sec.construccion / empleo_sec.codigo_indec.map(POB) * 1000
empleo_sec["pct_construccion"] = empleo_sec.construccion / empleo_sec.codigo_indec.map(_wu.total) * 100
empleo_sec["var_construccion"] = (empleo_sec.construccion / empleo_sec.codigo_indec.map(_wa.construccion) - 1) * 100
empleo_sec["petroleo_gas"] = empleo_sec.codigo_indec.map(_wu.petroleo_gas)
empleo_sec["petroleo_gas_cada_1000"] = empleo_sec.petroleo_gas / empleo_sec.codigo_indec.map(POB) * 1000
_ser_c = oe[oe.rama.isin(["construccion", "petroleo_gas", "total"])].groupby(["t", "anio", "trimestre", "rama"]).valor.sum().unstack().reset_index()
empleo_constr_serie = _ser_c[_ser_c.t <= OE_T][["anio", "trimestre", "construccion", "petroleo_gas", "total"]]
_ec_u = empleo_constr_serie.iloc[-1]
_ec_a = empleo_constr_serie[(empleo_constr_serie.anio == _ec_u.anio - 1) & (empleo_constr_serie.trimestre == _ec_u.trimestre)].iloc[0]
_ec_max = empleo_constr_serie.loc[empleo_constr_serie.construccion.idxmax()]
TRIM_TXT = ["primer", "segundo", "tercer", "cuarto"]
# variación del empleo en petróleo y gas: solo las provincias con dato en los dos trimestres (algunas tienen celdas en secreto estadístico)
_pe = oe[(oe.rama == "petroleo_gas") & oe.t.isin([OE_T, OE_ANT])].pivot_table(index="codigo_indec", columns="t", values="valor").dropna()
PET_EMP_VAR = float((_pe[OE_T].sum() / _pe[OE_ANT].sum() - 1) * 100)
for col, var, uni in [("construccion_cada_1000", "empleo_construccion_cada_1000_hab", "asalariados registrados cada 1.000 habitantes")]:
    d = empleo_sec[["codigo_indec", "territorio", col]].rename(columns={col: "valor"})
    d["periodo"] = str(OE_T // 10)
    agregar(d, var, uni, "OEDE, Ministerio de Capital Humano (SIPA)")

# Actividad de la construcción (ISAC, INDEC): índice base 2004 = 100, serie original y desestacionalizada, mensual desde 2012
isac = pd.read_csv(CRUDO / "isac.csv", parse_dates=["indice_tiempo"]).dropna(subset=["isac_nivel_general"])
isac_m = pd.DataFrame({"periodo": isac.indice_tiempo.dt.strftime("%Y-%m"), "original": isac.isac_nivel_general,
                       "desestacionalizada": isac.isac_sin_estacionalidad, "var_interanual": isac.isac_variacion_interanual * 100})
IS_ULT = isac_m.iloc[-1]
_is_max = isac_m.loc[isac_m.desestacionalizada.idxmax()]
YTD_IS = en_lo_que_va(isac.indice_tiempo, isac.isac_nivel_general)
isac["anio"] = isac.indice_tiempo.dt.year
_ia = isac.groupby("anio").isac_nivel_general.agg(["mean", "size"])
isac_anual = _ia[_ia["size"] == 12]["mean"].rename("isac").reset_index()
d = isac_anual.rename(columns={"anio": "periodo", "isac": "valor"})
d["codigo_indec"], d["territorio"] = "00", "Argentina"
agregar(d, "isac_promedio_anual", "indice 2004=100", "INDEC, ISAC")
# Insumos: el consumo aparente (despachos de producción nacional más importaciones) de los últimos doce meses contra los doce anteriores (variación del índice de cada insumo)
ins = pd.read_csv(CRUDO / "isac_insumos.csv", parse_dates=["indice_tiempo"]).set_index("indice_tiempo")
INSUMOS = {"isac_cemento_portland": "Cemento portland", "isac_hierro_redondo_y_aceros_para_la_construccion": "Hierro redondo y aceros",
           "isac_hormigon_elaborado": "Hormigón elaborado", "isac_ladrillos_huecos": "Ladrillos huecos", "isac_asfalto": "Asfalto",
           "isac_pinturas_para_construccion": "Pinturas", "isac_placas_de_yeso": "Placas de yeso", "isac_yeso": "Yeso", "isac_cales": "Cales",
           "isac_pisos_y_revestimientos_ceramicos": "Pisos y revestimientos cerámicos", "isac_articulos_sanitarios_de_ceramica": "Sanitarios de cerámica",
           "isac_mosaicos_graniticos_y_calcareos": "Mosaicos graníticos y calcáreos", "isac_resto": "Resto (grifería, tubos y vidrio)"}
INS_ULT = ins[list(INSUMOS)].dropna(how="all").index.max()
_ins = []
for k, v in INSUMOS.items():
    s = ins[k].dropna()
    if s.index.max() != INS_ULT:  # un insumo que dejó de publicarse no se compara con meses distintos
        continue
    _ins.append({"codigo_indec": k.replace("isac_", ""), "territorio": v, "var_12m": (s.iloc[-12:].sum() / s.iloc[-24:-12].sum() - 1) * 100,
                 "var_ytd": en_lo_que_va(pd.Series(s.index), s)["var"]})
isac_insumos = pd.DataFrame(_ins)

# Costo de la construcción (ICC, INDEC, Gran Buenos Aires) contra los precios al consumidor (IPC nacional, INDEC). El ICC se publica
# como variación mensual desde noviembre de 2015 (y como índice desde enero de 2022): se encadenan las variaciones y se pasa a
# diciembre de 2016 = 100, la base del IPC. El cociente muestra si construir se encareció más o menos que el resto de los precios
_icc = pd.read_excel(CRUDO / "indec_icc.xls", "Nivel general y capítulos_var%", header=None)
_fa = next(i for i in _icc.index if any(str(v).strip().isdigit() and len(str(v).strip()) == 4 for v in _icc.loc[i, 1:]))
_anios = _icc.loc[_fa].ffill()
def _mes_num(v):
    m = re.sub(r"[^a-záéíóúñ]", "", str(v).lower())
    return MES.index(m) + 1 if m in MES else None


_meses = _icc.loc[_fa + 1].map(_mes_num)
_cap = {"nivel general": "icc", "materiales": "materiales", "mano de obra": "mano_obra", "gastos generales": "gastos_generales"}
es_fila = lambda celda, k: re.fullmatch(re.escape(k) + r"(\s*\(\d\))?", norm(str(celda))) is not None  # "Mano de obra (1)"
_filas_icc = {v: next(i for i in _icc.index if es_fila(_icc.iat[i, 0], k)) for k, v in _cap.items()}
_icc_l = [{"fecha": pd.Timestamp(int(float(_anios[j])), int(_meses[j]), 1), **{v: float(pd.to_numeric(_icc.loc[i, j], errors="coerce")) for v, i in _filas_icc.items()}}
          for j in _icc.columns[1:] if pd.notna(_meses[j]) and pd.notna(pd.to_numeric(_icc.loc[_filas_icc["icc"], j], errors="coerce"))]
icc = pd.DataFrame(_icc_l).sort_values("fecha").set_index("fecha")
assert icc.index.is_unique and len(icc) > 100, "ICC: meses repetidos o faltantes"
icc = (1 + icc / 100).cumprod()
# Índice de precios al consumidor del INDEC, base diciembre de 2016 = 100, del país y de sus seis regiones, con sus divisiones, categorías y
# bienes y servicios. Desde la etapa 25 sale del archivo que publica el propio INDEC (serie_ipc_divisiones.csv, en windows-1252, con coma
# decimal), el mismo de la sección Economía y precios: la copia de la API de Series de Tiempo (148.3) que se usaba antes difería en abril de
# 2019. El nivel general del país es el que pasa a pesos de igual valor los salarios, los créditos, los subsidios y los precios del sitio
_ipc_b = (CRUDO / "indec_ipc_divisiones.csv").read_bytes()
try:
    _ipc_t = _ipc_b.decode("utf-8-sig")
except UnicodeDecodeError:
    _ipc_t = _ipc_b.decode("cp1252")
IPC_INDEC = pd.read_csv(io.StringIO(_ipc_t), sep=";", decimal=",", na_values="NA", dtype={"Codigo": str, "Periodo": str})
assert list(IPC_INDEC.columns) == ["Codigo", "Descripcion", "Clasificador", "Periodo", "Indice_IPC", "v_m_IPC", "v_i_a_IPC", "Region"], \
    "cambiaron las columnas del IPC del INDEC"
IPC_INDEC["periodo"] = IPC_INDEC.Periodo.str[:4] + "-" + IPC_INDEC.Periodo.str[4:6]
_ipc_ng = IPC_INDEC[(IPC_INDEC.Region == "Nacional") & (IPC_INDEC.Codigo == "0")].set_index("periodo").Indice_IPC.sort_index()
assert _ipc_ng.index.is_unique and _ipc_ng.index[0] == "2016-12" and abs(_ipc_ng.iloc[0] - 100) < 1e-9, "el IPC del INDEC no empieza en diciembre de 2016 = 100"
assert list(_ipc_ng.index) == list(pd.period_range(_ipc_ng.index[0], _ipc_ng.index[-1], freq="M").strftime("%Y-%m")), "faltan meses en el IPC del INDEC"
ipc = pd.Series(_ipc_ng.values, index=pd.to_datetime(_ipc_ng.index + "-01"))
_base = pd.Timestamp("2016-12-01")
costo = icc.div(icc.loc[_base]).mul(100).join(ipc.rename("ipc"), how="inner")
costo = costo[costo.index >= _base]
for c in ("icc", "materiales", "mano_obra"):
    costo[f"{c}_real"] = costo[c] / costo.ipc * 100
costo = costo.reset_index().rename(columns={"index": "fecha", "indice_tiempo": "fecha"})
costo["periodo"] = costo.fecha.dt.strftime("%Y-%m")
costo = costo[["periodo", "icc", "materiales", "mano_obra", "ipc", "icc_real", "materiales_real", "mano_obra_real"]]
CO_ULT = costo.iloc[-1]
# para el minigráfico de "En cifras": diciembre de cada año y el último mes publicado
costo_anual = costo[costo.periodo.str.endswith("-12") | (costo.index == costo.index[-1])][["periodo", "icc_real"]]
CO_12 = costo.iloc[-13]
# control: el índice encadenado reproduce el índice que publica el INDEC (enero de 2022 = 100)
_ind = pd.read_excel(CRUDO / "indec_icc.xls", "Nivel general y capítulos_ind", header=None)
_fi = next(i for i in _ind.index if es_fila(_ind.iat[i, 0], "nivel general"))
_ult_ind = pd.to_numeric(_ind.loc[_fi, 1:], errors="coerce").dropna().iloc[-1]
_icc22 = icc.icc / icc.icc.loc[pd.Timestamp("2022-01-01")] * 100
assert abs(_icc22.iloc[-1] / _ult_ind - 1) < .005, f"ICC encadenado {_icc22.iloc[-1]:.2f} contra el índice del INDEC {_ult_ind:.2f}"

# Vivienda y combustible para cocinar (Censo 2022, INDEC), por provincia y departamento: resumen por radio censal armado una sola vez
# con scripts/censo_2022_vivienda.py. "Sin personas presentes" incluye las viviendas cuyos residentes no estaban el día del censo
# (una de las categorías del motivo): por eso los textos usan los motivos por separado
cv = pd.read_csv(RAIZ / "datos" / "manual" / "censo2022_departamentos.csv", dtype={"codigo_dep": str, "codigo_indec": str})


def vivienda(g):
    con_rama = g.ocupados - g.ocupados_sin_respuesta - g.ocupados_sin_codificar
    return pd.DataFrame({
        "hogares": g.hogares, "viviendas": g.viviendas,
        "pct_gas_red": g.cocina_gas_red / g.hogares * 100, "pct_garrafa": g.cocina_garrafa / g.hogares * 100,
        "pct_zeppelin": g.cocina_zeppelin / g.hogares * 100, "pct_electricidad": g.cocina_electricidad / g.hogares * 100,
        "pct_lena": g.cocina_lena / g.hogares * 100,
        "pct_alquila": g.alquilada / g.hogares * 100, "pct_propia": g.propia / g.hogares * 100,
        "pct_hacinamiento": g.hac_mas_3 / g.hogares * 100,
        "pct_materiales_4": g.materiales_4 / (g.hogares - g.materiales_ignorado) * 100,
        "pct_sin_personas": g.sin_personas / g.viviendas * 100,
        "pct_uso_temporal": g.uso_temporal / g.viviendas * 100, "pct_alquiler_venta": g.alquiler_venta / g.viviendas * 100,
        "construccion_cada_1000": g.en_construccion / g.viviendas * 1000,
        "pct_ocupados_construccion": g.ocupados_construccion / con_rama * 100,
        "pct_ocupados_minas": g.ocupados_minas / con_rama * 100,
        "pct_sin_rama": (g.ocupados_sin_respuesta + g.ocupados_sin_codificar) / g.ocupados * 100,
    })


_cvp = cv.drop(columns=["codigo_dep"]).groupby("codigo_indec").sum()
vivienda_prov = vivienda(_cvp).reset_index()
vivienda_prov.insert(1, "territorio", vivienda_prov.codigo_indec.map(CORTO))
VIV_PAIS = vivienda(_cvp.sum().to_frame().T).iloc[0]
vivienda_dep = vivienda(cv.set_index("codigo_dep")).reset_index()
vivienda_dep = vivienda_dep[["codigo_dep", "hogares", "pct_gas_red", "pct_garrafa", "pct_lena", "pct_alquila", "pct_hacinamiento", "pct_materiales_4",
                             "pct_uso_temporal", "pct_alquiler_venta", "construccion_cada_1000", "pct_ocupados_construccion", "pct_ocupados_minas"]]
VIV_ABS = {"hogares": int(_cvp.hogares.sum()), "viviendas": int(_cvp.viviendas.sum()), "gas_red": int(_cvp.cocina_gas_red.sum()),
           "en_construccion": int(_cvp.en_construccion.sum()), "alquilan": int(_cvp.alquilada.sum()), "garrafa": int(_cvp.cocina_garrafa.sum()),
           "ausentes": int(_cvp.residentes_ausentes.sum()), "sin_personas": int(_cvp.sin_personas.sum()),
           "constructores": int(_cvp.ocupados_construccion.sum())}
for col, var in [("pct_gas_red", "hogares_gas_de_red_cocina"), ("pct_alquila", "hogares_alquilan"), ("pct_hacinamiento", "hogares_hacinamiento_critico"),
                 ("pct_ocupados_construccion", "ocupados_construccion_censo")]:
    d = vivienda_prov[["codigo_indec", "territorio", col]].rename(columns={col: "valor"})
    d["periodo"] = "2022"
    agregar(d, var, "% de los hogares" if col != "pct_ocupados_construccion" else "% de las personas ocupadas", "INDEC, Censo 2022")

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
})
geo_ids = [g["properties"]["id"] for g in list(json.loads((SITIO / "departamentos.topo.json").read_text(encoding="utf-8"))["objects"].values())[0]["geometries"]]
departamentos = pd.DataFrame({"id": geo_ids})
departamentos = departamentos.merge(dep, on="id", how="left")
clave_ren = departamentos.id.where(~departamentos.id.str.startswith("02"), "02000")
for c in ren_dep.columns:
    departamentos[c] = clave_ren.map(ren_dep[c])
departamentos["provincia"] = departamentos.id.str[:2].map(CORTO)
# Censo 2022 (INDEC): los códigos de departamento del censo coinciden con los de Georef, y a diferencia del RENAPER separa las comunas
_dep_censo = vivienda_dep.set_index("codigo_dep")
for c in ["hogares", "pct_alquila", "pct_hacinamiento", "pct_materiales_4", "pct_gas_red", "pct_lena", "pct_uso_temporal"]:
    departamentos[c] = departamentos.id.map(_dep_censo[c])
# lugar de nacimiento por departamento (Censo 2022, cuadros de migraciones de cada provincia: scripts/censo_2022_migraciones.py, una sola vez).
# Desde la etapa 26 reemplaza a los nacidos en otro país del RENAPER: el censo cuenta a cada persona donde vive y separa las comunas de la
# Ciudad. El origen más frecuente de cada departamento se calcula sin quienes no declararon su país y solo donde lo declararon 100 personas o más
mig_dep = pd.read_csv(RAIZ / "datos" / "manual" / "censo2022_migraciones_departamentos.csv", dtype={"codigo_dep": str, "codigo_indec": str})
mig_dep["pct_otro_pais"] = mig_dep.en_otro_pais / mig_dep.poblacion_vp * 100
mig_dep["pct_otra_provincia"] = mig_dep.en_otra_provincia / mig_dep.poblacion_vp * 100
_MD_PAIS = {"bolivia": "Bolivia", "brasil": "Brasil", "chile": "Chile", "paraguay": "Paraguay", "uruguay": "Uruguay", "colombia": "Colombia",
            "peru": "Perú", "venezuela": "Venezuela", "resto_america": "otros países de América", "espana": "España", "italia": "Italia",
            "resto_europa": "otros países de Europa", "asia": "Asia", "africa": "África", "oceania": "Oceanía"}
_mdp = mig_dep[list(_MD_PAIS)]
mig_dep["declarado"] = mig_dep.en_otro_pais - mig_dep.ignorado
mig_dep["primer_pais"] = _mdp.idxmax(axis=1).map(_MD_PAIS).where(mig_dep.declarado >= 100)
mig_dep["pct_primer_pais"] = (_mdp.max(axis=1) / mig_dep.declarado * 100).where(mig_dep.declarado >= 100)
mig_dep["pct_no_declarado"] = (mig_dep.ignorado / mig_dep.en_otro_pais * 100).where(mig_dep.en_otro_pais > 0)
assert len(mig_dep) == 527 and mig_dep.en_otro_pais.sum() == 1933463
_md = mig_dep.set_index("codigo_dep")
departamentos["nacidos_otro_pais"] = departamentos.id.map(_md.pct_otro_pais)
departamentos["nacidos_otra_provincia"] = departamentos.id.map(_md.pct_otra_provincia)
assert departamentos.nacidos_otro_pais.notna().all(), "hay departamentos del mapa sin el lugar de nacimiento del censo"
migraciones_departamentos = mig_dep[["codigo_dep", "codigo_indec", "departamento", "poblacion_vp", "en_otro_pais", "pct_otro_pais", "en_otra_provincia",
                                     "pct_otra_provincia", "primer_pais", "pct_primer_pais", "pct_no_declarado"]]
departamentos = departamentos.round(2)
DEP_META = {
    "homicidios": ("Homicidios dolosos", f"víctimas cada 100.000 habitantes, promedio {ANIO_DEP - 2} a {ANIO_DEP}", "SNIC, Ministerio de Seguridad"),
    "robos": ("Robos", f"hechos cada 100.000 habitantes, {ANIO_DEP}", "SNIC, Ministerio de Seguridad"),
    "viales": ("Muertes viales", f"víctimas cada 100.000 habitantes, promedio {ANIO_DEP - 2} a {ANIO_DEP}", "SNIC, Ministerio de Seguridad"),
    "mayores_65": ("Personas de 65 años o más", "% de la población identificada, junio de 2026", "RENAPER"),
    "menores_15": ("Menores de 15 años", "% de la población identificada, junio de 2026", "RENAPER"),
    "nacidos_otro_pais": ("Nacidos en otro país", "% de la población en viviendas particulares, Censo 2022", "INDEC, Censo 2022"),
    "nacidos_otra_provincia": ("Nacidos en otra provincia", "% de la población en viviendas particulares, Censo 2022", "INDEC, Censo 2022"),
    "pct_alquila": ("Hogares que alquilan", "% de los hogares, Censo 2022", "INDEC, Censo 2022"),
    "pct_hacinamiento": ("Hacinamiento crítico", "% de los hogares con más de tres personas por cuarto, Censo 2022", "INDEC, Censo 2022"),
    "pct_materiales_4": ("Pisos y techos de la calidad más baja", "% de los hogares, Censo 2022", "INDEC, Censo 2022"),
    "pct_gas_red": ("Hogares que cocinan con gas de red", "% de los hogares, Censo 2022", "INDEC, Censo 2022"),
    "pct_lena": ("Hogares que cocinan con leña o carbón", "% de los hogares, Censo 2022", "INDEC, Censo 2022"),
    "pct_uso_temporal": ("Viviendas de uso temporal", "% de las viviendas, Censo 2022", "INDEC, Censo 2022"),
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
defl = bm("NY.GDP.DEFL.ZS")
defl = defl[defl.pais == "ARG"].set_index("anio").valor.dropna()
# el último año completo, salvo que todavía no esté su deflactor (el Banco Mundial lo publica a mitad del año siguiente): sin esto, en
# enero la actualización se cortaba al no encontrar el deflactor del año que acaba de terminar
TR_ULT = int(min(HOY.year - 1, defl.index.max()))
assert trf.anio.max() >= TR_ULT
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

# ---------------------------------------------------------------- obra pública de la Nación por provincia (etapa 20)
# Presupuesto Abierto (scripts/inversion_presupuesto.py): las construcciones que paga la propia Administración Nacional (inciso 4,
# partida principal 2) y las transferencias de capital a provincias y municipios (inciso 5, partida principal 8, parciales 1 y 6),
# por provincia, desde 2000. Pesos del último año con el mismo deflactor del PBI que las transferencias y, por habitante, la misma
# población (POB_T). Lo que no tiene provincia (obras nacionales, interprovinciales, binacionales o sin clasificar) suma solo en el país.
inv_ = pd.read_csv(RAIZ / "datos" / "manual" / "inversion_provincias.csv", dtype={"codigo_indec": str})
OP_ULT = min(TR_ULT, int(inv_.anio.max()))  # el programa guarda solo años completos: si no se volvió a correr, queda el último que tiene
inv_ = inv_[(inv_.anio >= 2000) & (inv_.anio <= OP_ULT)].copy()
inv_["real"] = inv_.millones_corrientes * defl[OP_ULT] / inv_.anio.map(defl)  # millones de pesos del último año
inv_["k"] = inv_.tipo.map({"Obras de la Nación": "obras", "Transferencias de capital a provincias y municipios": "transf"})
assert inv_.k.notna().all()
obra_publica_serie = (inv_.pivot_table(index="anio", columns="k", values="real", aggfunc="sum").fillna(0) / 1000).reset_index()  # miles de millones
obra_publica_serie["total"] = obra_publica_serie.obras + obra_publica_serie.transf
obra_publica_serie["obras_sin_provincia"] = obra_publica_serie.anio.map(
    inv_[(inv_.k == "obras") & (inv_.codigo_indec == "sin provincia")].groupby("anio").real.sum() / 1000).fillna(0)
_op_p = inv_[inv_.codigo_indec != "sin provincia"].pivot_table(index=["anio", "codigo_indec"], columns="k", values="real", aggfunc="sum")
op_prov = _op_p.reindex(pd.MultiIndex.from_product([range(2000, OP_ULT + 1), sorted(DIP_LEY)], names=["anio", "codigo_indec"])).fillna(0).reset_index()
op_prov["pob"] = [POB_T.get((c, a)) for c, a in zip(op_prov.codigo_indec, op_prov.anio)]
assert op_prov.pob.notna().all()
op_prov["total"] = op_prov.obras + op_prov.transf
for k in ["obras", "transf", "total"]:
    op_prov[f"{k}_hab"] = op_prov[k] * 1e6 / op_prov.pob  # pesos del último año por habitante
_op_u = op_prov[op_prov.anio == OP_ULT]
obra_publica_provincias = _op_u[["codigo_indec", "obras", "transf", "total", "obras_hab", "transf_hab", "total_hab"]].copy()
obra_publica_provincias.insert(1, "territorio", obra_publica_provincias.codigo_indec.map(CORTO))
obra_publica_provincias = obra_publica_provincias.round({"obras": 1, "transf": 1, "total": 1, "obras_hab": 0, "transf_hab": 0, "total_hab": 0})
obra_publica_provincias = obra_publica_provincias.sort_values("total_hab", ascending=False).reset_index(drop=True)
_op_s = obra_publica_serie.set_index("anio")
_op_o = inv_[(inv_.anio == OP_ULT) & (inv_.k == "obras")]
_op_d = op_prov.assign(territorio=op_prov.codigo_indec.map(NOMBRE), periodo=op_prov.anio.astype(str), valor=op_prov.total_hab)
agregar(_op_d[["codigo_indec", "territorio", "periodo", "valor"]], "obra_publica_nacion_por_habitante", f"pesos de {OP_ULT} por habitante",
        "Presupuesto Abierto, Secretaría de Hacienda (crédito devengado)")
OP_RES = {
    "op_ult": OP_ULT, "op_desde": int(obra_publica_serie.anio.min()),
    "op_total": r1(_op_s.total[OP_ULT]), "op_obras": r1(_op_s.obras[OP_ULT]), "op_transf": r1(_op_s.transf[OP_ULT]), "op_ant": r1(_op_s.total[OP_ULT - 1]),
    "op_sin_pct": r1(_op_s.obras_sin_provincia[OP_ULT] / _op_s.obras[OP_ULT] * 100),
    "op_hab_pais": round(float(_op_u.total.sum() * 1e6 / _op_u.pob.sum())),
    "op_top": [obra_publica_provincias.iloc[0].territorio, int(obra_publica_provincias.iloc[0].total_hab)],
    "op_bajo": [obra_publica_provincias.iloc[-1].territorio, int(obra_publica_provincias.iloc[-1].total_hab)],
    "op_max_anio": int(_op_s.total.idxmax()), "op_max": r1(_op_s.total.max()),
    "op_min_anio": int(_op_s.total.idxmin()), "op_min": r1(_op_s.total.min()),
    "op_vialidad_pct": r1(_op_o[_op_o.organismo.str.contains("Vialidad", case=False)].real.sum() / _op_o.real.sum() * 100),
}
obra_publica_serie = obra_publica_serie.round(1)

# ---------------------------------------------------------------- permisos de edificación (INDEC) y créditos hipotecarios UVA (BCRA), etapa 20
# Permisos: superficie cubierta autorizada para construcciones nuevas y ampliaciones en la nómina vigente de municipios del INDEC, desde
# 2021 (las nóminas anteriores son otras muestras y no se unen). Sin serie desestacionalizada: se compara con el mismo mes del año
# anterior, con los mismos meses y los últimos doce meses contra los doce anteriores.
per_ = pd.read_csv(CRUDO / "indec_permisos.csv")
_per_u = per_.iloc[-1]
_per_ant = per_[per_.periodo == f"{int(_per_u.periodo[:4]) - 1}{_per_u.periodo[4:]}"]
per_["m2_12m"] = per_.superficie_m2.rolling(12).mean()  # promedio de doce meses
permisos_mensual = per_[["periodo", "superficie_m2", "m2_12m", "permisos"]].round({"m2_12m": 0})
_mes_per = lambda p: f"{MES[int(p[5:7]) - 1]} de {p[:4]}"
PER_RES = {
    "per_mes": _mes_per(_per_u.periodo), "per_desde": int(per_.periodo.min()[:4]), "per_municipios": int(_per_u.municipios),
    "per_m2": int(_per_u.superficie_m2), "per_permisos": int(_per_u.permisos),
    "per_var": r1((_per_u.superficie_m2 / _per_ant.superficie_m2.iloc[0] - 1) * 100) if len(_per_ant) else None,
    "per_ytd": en_lo_que_va(per_.periodo + "-01", per_.superficie_m2),
    "per_12m": r1(per_.superficie_m2.iloc[-12:].sum() / 1e6), "per_12m_var": r1((per_.superficie_m2.iloc[-12:].sum() / per_.superficie_m2.iloc[-24:-12].sum() - 1) * 100),
}
# Créditos hipotecarios UVA acordados cada mes con el sector privado, en pesos del último mes con el IPC nacional del INDEC (que empieza
# en diciembre de 2016: la serie va desde enero de 2017). En miles de millones de pesos.
hip_ = pd.read_csv(CRUDO / "bcra_hipotecas_uva.csv")
_hip_ipc = _ipc_ng  # el IPC del INDEC por mes ("2026-08"), el mismo de la sección Economía y precios
hip_ = hip_[(hip_.periodo >= "2017-01") & hip_.periodo.isin(_hip_ipc.index)].reset_index(drop=True)
HIP_UM = hip_.periodo.max()
hip_["miles_millones"] = hip_.monto_miles / 1e6 * _hip_ipc[HIP_UM] / hip_.periodo.map(_hip_ipc)
_hip_u, _hip_max = hip_.iloc[-1], hip_.loc[hip_.miles_millones.idxmax()]
_hip_ant = hip_[hip_.periodo == f"{int(HIP_UM[:4]) - 1}{HIP_UM[4:]}"]
_hip_a = hip_.groupby(hip_.periodo.str[:4].astype(int)).agg(m=("miles_millones", "sum"), n=("miles_millones", "size"))
_hip_a = _hip_a[_hip_a.n == 12].m
hipotecas_mensual = hip_[["periodo", "miles_millones", "tasa"]].round({"miles_millones": 1, "tasa": 2})
HIP_RES = {
    "hip_mes": _mes_per(HIP_UM), "hip_desde": int(hip_.periodo.min()[:4]), "hip_ult": r1(_hip_u.miles_millones), "hip_tasa": r1(_hip_u.tasa),
    "hip_var": r1((_hip_u.miles_millones / _hip_ant.miles_millones.iloc[0] - 1) * 100) if len(_hip_ant) and _hip_ant.miles_millones.iloc[0] > 0 else None,
    "hip_max": r1(_hip_max.miles_millones), "hip_max_mes": _mes_per(_hip_max.periodo),
    "hip_ytd": en_lo_que_va(hip_.periodo + "-01", hip_.miles_millones),
    "hip_anio": int(_hip_a.index.max()), "hip_anual": r1(_hip_a.iloc[-1]),
    "hip_anual_max_anio": int(_hip_a.idxmax()), "hip_anual_max": r1(_hip_a.max()),
    "hip_anual_min_anio": int(_hip_a.idxmin()), "hip_anual_min": r1(_hip_a.min()),
}

# Subsidios económicos a la energía (etapa 21): la serie mensual del Informe Mensual de Ingresos y Gastos del Sector Público Nacional no
# Financiero de la Secretaría de Hacienda (base caja, millones de pesos), desde 2016. Por año, en pesos del último año completo con el
# deflactor del PBI, como las transferencias, y como porcentaje del PBI a precios corrientes del INDEC (el promedio de sus cuatro
# trimestres, que vienen en valor anual). Lo que va del año, en pesos del último mes con el IPC nacional. Se usa la serie oficial tal cual:
# el sitio no arma su propia definición de subsidio.
sub_ = pd.read_csv(CRUDO / "subsidios_energia.csv").dropna()
sub_["periodo"] = sub_.indice_tiempo.str[:7]
sub_["anio"] = sub_.periodo.str[:4].astype(int)
_sub_n = sub_.groupby("anio").periodo.nunique()
SUB_ULT = int(min(_sub_n[_sub_n == 12].index.max(), defl.index.max()))
_pib_ = pd.read_csv(CRUDO / "pib_corriente.csv").dropna().rename(columns={"oferta_global_pib": "pib"})
_pib_["anio"] = _pib_.indice_tiempo.str[:4].astype(int)
_pib_a = _pib_.groupby("anio").pib.agg(["mean", "size"])
_pib_a = _pib_a[_pib_a["size"] == 4]["mean"]  # millones de pesos de cada año completo
_sub_a = sub_[sub_.anio <= SUB_ULT].groupby("anio").energia.sum()
subsidios_energia = pd.DataFrame({"anio": _sub_a.index, "millones_corrientes": _sub_a.values,
                                  "miles_millones_reales": (_sub_a * defl[SUB_ULT] / _sub_a.index.map(defl) / 1000).values,
                                  "pct_pbi": (_sub_a / _sub_a.index.map(_pib_a) * 100).values}).round(4)
_sub_r = subsidios_energia.set_index("anio")
_sub_p = _sub_r.pct_pbi.dropna()
assert len(_sub_p) >= 5, "faltan años con el PBI para los subsidios a la energía"
# lo que va del año en pesos del último mes con IPC, contra los mismos meses del año anterior
_sm = sub_[sub_.periodo.isin(_hip_ipc.index)]
_sm_ult = _sm.periodo.max()
_sub_ytd = en_lo_que_va(_sm.periodo + "-01", _sm.energia * _hip_ipc[_sm_ult] / _sm.periodo.map(_hip_ipc))
SUB_RES = {
    "sub_ini": int(_sub_a.index.min()), "sub_ult": SUB_ULT, "sub_ult_real": float(_sub_r.miles_millones_reales[SUB_ULT]),
    "sub_ult_millones": float(_sub_a[SUB_ULT]), "sub_mes": _mes_per(sub_.periodo.max()),
    "sub_pbi_anio": int(_sub_p.index.max()), "sub_pbi": float(_sub_p.iloc[-1]),
    "sub_pbi_max_anio": int(_sub_p.idxmax()), "sub_pbi_max": float(_sub_p.max()), "sub_pbi_min_anio": int(_sub_p.idxmin()), "sub_pbi_min": float(_sub_p.min()),
    "sub_real_max_anio": int(_sub_r.miles_millones_reales.idxmax()), "sub_real_max": float(_sub_r.miles_millones_reales.max()),
    "sub_real_min_anio": int(_sub_r.miles_millones_reales.idxmin()), "sub_real_min": float(_sub_r.miles_millones_reales.min()),
    "sub_ytd": {**_sub_ytd, "millones": float(sub_[(sub_.anio == _sub_ytd["anio"]) & (sub_.periodo <= _sm_ult)].energia.sum())} if _sub_ytd["anio"] > SUB_ULT else None,
}
agregar(subsidios_energia.rename(columns={"anio": "periodo", "pct_pbi": "valor"}).dropna(subset=["valor"]).assign(codigo_indec="00", territorio="Argentina"),
        "subsidios_economicos_energia_pct_pbi", "% del PBI", "Secretaria de Hacienda (IMIG) e INDEC")

# Precios de los combustibles en el surtidor (etapa 21): la mediana de los precios que las estaciones de servicio declaran cada mes a la
# Secretaría de Energía (Resolución 1104/2004), nafta súper y gasoil grado 2, por provincia y del país, desde enero de 2024 (el resumen lo
# arma 01_descargar.py). Las estaciones declaran con demora: el último mes que se usa es el más reciente en el que declararon al menos el
# 95% de las estaciones del país y el 80% de las de cada provincia, contra la mediana de sus doce meses anteriores. La serie mes a mes va
# en pesos del último mes con el IPC nacional.
cb_ = pd.read_csv(CRUDO / "se_precios_combustibles.csv")
cb_["codigo_indec"] = cb_.provincia.map(lambda t: "00" if t == "TOTAL DEL PAIS" else codigo(t))
assert cb_.codigo_indec.notna().all(), f"provincias sin código en los precios de los combustibles: {cb_[cb_.codigo_indec.isna()].provincia.unique()}"
_cb_n = cb_[cb_.producto.eq("nafta")].pivot_table(index="periodo", columns="codigo_indec", values="estaciones").sort_index()
_cb_ref = _cb_n.rolling(12, min_periods=12).median().shift(1)
_cb_ok = (_cb_n["00"] >= .95 * _cb_ref["00"]) & (_cb_n.drop(columns="00") >= .8 * _cb_ref.drop(columns="00")).all(axis=1)
CB_ULT = _cb_ok[_cb_ok].index.max()
assert pd.Period(CB_ULT, "M") >= pd.Period(cb_.periodo.max(), "M") - 4, "los precios de los combustibles no tienen un mes completo reciente"
assert CB_ULT in _hip_ipc.index, "falta el IPC del último mes de los precios de los combustibles"
cb_ = cb_[cb_.periodo <= CB_ULT]
_cbp = cb_.pivot_table(index=["periodo", "codigo_indec"], columns="producto", values="mediana").reset_index()
_cbe = cb_.pivot_table(index=["periodo", "codigo_indec"], columns="producto", values="estaciones").reset_index()
for _cb_p in ("nafta", "gasoil"):
    _cbp[_cb_p + "_real"] = _cbp[_cb_p] * _hip_ipc[CB_ULT] / _cbp.periodo.map(_hip_ipc)
combustibles_mensual = _cbp[["periodo", "codigo_indec", "nafta", "gasoil", "nafta_real", "gasoil_real"]].round(2)
CB_ANT = str(pd.Period(CB_ULT, "M") - 12)
_cbu = _cbp[_cbp.periodo == CB_ULT].set_index("codigo_indec")
_cba = _cbp[_cbp.periodo == CB_ANT].set_index("codigo_indec")
_cbeu = _cbe[_cbe.periodo == CB_ULT].set_index("codigo_indec")
_cb24 = [c for c in _cbu.index if c != "00"]
assert len(_cb24) == 24, "faltan provincias en los precios de los combustibles"
combustibles_provincias = pd.DataFrame({
    "codigo_indec": _cb24, "territorio": [CORTO[c] for c in _cb24], "nafta": _cbu.nafta[_cb24].values, "gasoil": _cbu.gasoil[_cb24].values,
    "nafta_estaciones": _cbeu.nafta[_cb24].astype(int).values, "gasoil_estaciones": _cbeu.gasoil[_cb24].astype(int).values,
    "nafta_antes": _cba.nafta.reindex(_cb24).values, "gasoil_antes": _cba.gasoil.reindex(_cb24).values}).round(2).sort_values("nafta", ascending=False)


def _cb_ext(p):  # el país, la provincia más cara y la más barata, el cambio en doce meses y la serie en pesos del último mes
    s = combustibles_provincias.sort_values(p)
    serie = combustibles_mensual[combustibles_mensual.codigo_indec == "00"].set_index("periodo")[p + "_real"]
    return {p: float(_cbu.loc["00", p]), p + "_alto": [s.iloc[-1].territorio, float(s.iloc[-1][p])], p + "_bajo": [s.iloc[0].territorio, float(s.iloc[0][p])],
            p + "_var": r1((_cbu.loc["00", p] / _cba.loc["00", p] - 1) * 100), p + "_var_real": r1((_cbu.loc["00", p + "_real"] / _cba.loc["00", p + "_real"] - 1) * 100),
            p + "_ini_real": float(serie.iloc[0]), p + "_max_real": float(serie.max()), p + "_max_real_mes": _mes_per(serie.idxmax())}


CB_RES = {"mes": _mes_per(CB_ULT), "periodo": CB_ULT, "mes_antes": _mes_per(CB_ANT), "ini": _mes_per(cb_.periodo.min()),
          "anio_ini": int(cb_.periodo.min()[:4]), "anio_ult": int(CB_ULT[:4]), "estaciones": int(_cbeu.loc["00", "nafta"]), **_cb_ext("nafta"), **_cb_ext("gasoil")}
# La serie larga (etapa 22): la mediana del país de cada mes desde diciembre de 2004, con los archivos anuales que resumió una sola vez
# scripts/combustibles_historia.py (datos/manual/combustibles_2004_2023.csv), unida con la de 01_descargar.py (en los meses repetidos manda
# la de 01). Por año, el promedio de las medianas de los doce meses, del país y de cada provincia, en pesos del último año con deflactor del
# PBI (TR_ULT), como las transferencias: el índice de precios al consumidor del INDEC para todo el país empieza en diciembre de 2016. Solo
# años completos.
_cbh = pd.read_csv(RAIZ / "datos" / "manual" / "combustibles_2004_2023.csv")
_cbl = pd.concat([pd.read_csv(CRUDO / "se_precios_combustibles.csv"), _cbh]).drop_duplicates(["periodo", "producto", "provincia"])
_cbl = _cbl[_cbl.periodo <= CB_ULT]
assert _cbl[_cbl.provincia.eq("TOTAL DEL PAIS")].groupby("producto").periodo.nunique().min() ==     (pd.Period(CB_ULT, "M") - pd.Period("2004-12", "M")).n + 1, "faltan meses en la serie larga de los precios de los combustibles"
_cba_ = _cbl.assign(anio=_cbl.periodo.str[:4].astype(int), codigo_indec=_cbl.provincia.map(lambda t: "00" if t == "TOTAL DEL PAIS" else codigo(t)))
assert _cba_.codigo_indec.notna().all(), "provincias sin código en la serie larga de los combustibles"
_cba_ = _cba_.groupby(["anio", "codigo_indec", "producto"]).mediana.agg(["mean", "count"]).unstack()
_cba_ = _cba_[(_cba_["count"] == 12).all(axis=1)]["mean"].reset_index()
combustibles_anual = _cba_[_cba_.anio <= TR_ULT][["anio", "codigo_indec", "nafta", "gasoil"]].copy()
for _cb_p in ("nafta", "gasoil"):
    combustibles_anual[_cb_p + "_real"] = combustibles_anual[_cb_p] * defl[TR_ULT] / combustibles_anual.anio.map(defl)
combustibles_anual = combustibles_anual.round(4)
_cba_p = combustibles_anual[combustibles_anual.codigo_indec == "00"]
assert combustibles_anual.notna().all().all() and _cba_p.anio.max() == TR_ULT and _cba_p.anio.diff().dropna().eq(1).all(),     "la serie anual de los combustibles tiene huecos o no llega al último año con deflactor"


def _cb_anual(p):  # el último año, el primero y el más caro y el más barato, en pesos del último año
    s = _cba_p.set_index("anio")[p + "_real"]
    return {p + "_anual": float(_cba_p[p].iloc[-1]), p + "_anual_real_ini": float(s.iloc[0]),
            p + "_anual_max_anio": int(s.idxmax()), p + "_anual_max": float(s.max()), p + "_anual_min_anio": int(s.idxmin()), p + "_anual_min": float(s.min())}


CB_RES.update({"anual_ini": int(_cba_p.anio.min()), "anual_ult": int(_cba_p.anio.max()), **_cb_anual("nafta"), **_cb_anual("gasoil")})
# Consumo eléctrico de los hogares por provincia (etapa 21): la demanda residencial que los distribuidores declaran al mercado eléctrico
# mayorista (CAMMESA), por mes y provincia, desde 2014, por habitante: con las proyecciones del INDEC desde 2022 y con la población
# implícita en las tasas del SNIC antes, como las otras series por provincia. CAMMESA registra a Edenor y Edesur en la provincia de
# Buenos Aires, así que la Ciudad y la provincia van juntas (código EL_BA), y no informa Tierra del Fuego: el país es la suma de las otras
# jurisdicciones, sobre su población. Los últimos meses son provisorios. La parte residencial es la de las tres categorías de tarifa.
el_ = pd.read_csv(CRUDO / "cammesa_demanda_provincias.csv")
EL_BA = "02-06"
el_["codigo_indec"] = el_.provincia.map(lambda t: EL_BA if norm(t) == "buenos aires" else "86" if norm(t).startswith("sgo") else codigo(t))
assert el_.codigo_indec.notna().all(), f"provincias sin código en la demanda de CAMMESA: {el_[el_.codigo_indec.isna()].provincia.unique()}"
assert "94" not in set(el_.codigo_indec) and "02" not in set(el_.codigo_indec), "CAMMESA empezó a separar la Ciudad o a informar Tierra del Fuego: revisar"
el_["anio"] = el_.mes.str[:4].astype(int)
_el_meses = el_.groupby("anio").mes.nunique()
EL_ULT, EL_INI = int(_el_meses[_el_meses == 12].index.max()), int(el_.anio.min())
_el_pr = proy.groupby(["codigo_indec", "anio"]).pob.sum()  # proy y no _pr: _pr se vuelve a usar más arriba, en las exportaciones


def _el_pob(c, a):  # población del año: proyecciones del INDEC desde 2022 y la implícita en las tasas del SNIC antes
    return sum(float(_el_pr[(x, a)]) if a >= 2022 else float(POB_T[(x, a)]) for x in c.split("-"))


def _el_por_hab(d, clave):  # suma la demanda residencial por año o por mes, le agrega el país y la divide por la población del año
    d = d.groupby(["codigo_indec", clave]).mwh.sum().reset_index()
    if clave != "anio":
        d["anio"] = d[clave].str[:4].astype(int)
    d["pob"] = [_el_pob(c, a) for c, a in zip(d.codigo_indec, d.anio)]
    pais = d.groupby([clave] if clave == "anio" else [clave, "anio"])[["mwh", "pob"]].sum().reset_index().assign(codigo_indec="00")
    d = pd.concat([d, pais])
    return d.assign(kwh_hab=d.mwh * 1000 / d.pob)


_el_res = el_[el_.categoria == "Residencial"]
_el_a = _el_por_hab(_el_res[_el_res.anio <= EL_ULT], "anio")
_el_m = _el_por_hab(_el_res[_el_res.anio >= EL_ULT - 4], "mes")
EL_NOM = lambda c: "Todo el país" if c == "00" else "CABA y Buenos Aires" if c == EL_BA else CORTO[c]
electricidad_serie = _el_a[["anio", "codigo_indec", "kwh_hab"]].round(4).sort_values(["codigo_indec", "anio"])
electricidad_mensual = _el_m.rename(columns={"mes": "periodo"})[["periodo", "codigo_indec", "kwh_hab"]].round(4).sort_values(["codigo_indec", "periodo"])
_elu = _el_a[_el_a.anio == EL_ULT].set_index("codigo_indec")
_el10 = _el_a[_el_a.anio == EL_ULT - 10].set_index("codigo_indec")
_el_tot = el_[el_.anio == EL_ULT].groupby("codigo_indec").mwh.sum()
_el_cod = [c for c in _elu.index if c != "00"]
electricidad_provincias = pd.DataFrame({
    "codigo_indec": _el_cod, "territorio": [EL_NOM(c) for c in _el_cod], "kwh_hab": _elu.kwh_hab[_el_cod].values, "gwh": (_elu.mwh[_el_cod] / 1000).values,
    "pct_residencial": (_elu.mwh[_el_cod] / _el_tot[_el_cod] * 100).values, "kwh_hab_antes": _el10.kwh_hab.reindex(_el_cod).values,
}).round(4).sort_values("kwh_hab", ascending=False)
# el mes de más y de menos consumo de los hogares del país, en promedio de los tres últimos años completos
_el_est = _el_m[(_el_m.codigo_indec == "00") & _el_m.anio.between(EL_ULT - 2, EL_ULT)]
_el_cal = _el_est.groupby(_el_est.mes.str[5:7].astype(int)).kwh_hab.mean()
_elp, _elr = electricidad_provincias.sort_values("kwh_hab"), electricidad_provincias.sort_values("pct_residencial")
_el_s = _el_a[_el_a.codigo_indec == "00"].set_index("anio").kwh_hab
ELEC_RES = {
    "el_ini": EL_INI, "el_ult": EL_ULT, "el_hasta": _mes_per(el_.mes.max()), "el_pais": float(_el_s[EL_ULT]), "el_pais_ini": float(_el_s[EL_INI]),
    "el_max_anio": int(_el_s.idxmax()), "el_max": float(_el_s.max()), "el_min_anio": int(_el_s.idxmin()), "el_min": float(_el_s.min()),
    "el_top": [_elp.iloc[-1].territorio, float(_elp.iloc[-1].kwh_hab)], "el_bajo": [_elp.iloc[0].territorio, float(_elp.iloc[0].kwh_hab)],
    "el_res_top": [_elr.iloc[-1].territorio, r1(_elr.iloc[-1].pct_residencial)], "el_res_bajo": [_elr.iloc[0].territorio, r1(_elr.iloc[0].pct_residencial)],
    "el_est_desde": EL_ULT - 2, "el_mes_max": MES[int(_el_cal.idxmax()) - 1], "el_mes_max_kwh": float(_el_cal.max()),
    "el_mes_min": MES[int(_el_cal.idxmin()) - 1], "el_mes_min_kwh": float(_el_cal.min()),
}
# Demanda eléctrica de comercios e industrias por provincia (etapa 23): las otras dos categorías de tarifa del mismo archivo de CAMMESA, por
# habitante como la de los hogares. "Comercial" reúne a los usuarios no residenciales de las distribuidoras de menos de 300 kW (comercios,
# servicios, pequeñas industrias, clubes) y el alumbrado público, e "Industrial/Comercial Grande", a las demandas de 300 kW o más: las que
# abastecen las distribuidoras (GUDI) y los grandes usuarios que compran en el mercado mayorista (GUMA y GUME), que CAMMESA registra en la
# provincia donde consumen. La Ciudad y la provincia de Buenos Aires van juntas y no hay datos de Tierra del Fuego, como en los hogares.
_els_cat = {"Residencial": "res", "Comercial": "com", "Industrial/Comercial Grande": "ind"}
assert set(el_.categoria) == set(_els_cat), f"CAMMESA cambió las categorías de tarifa: {sorted(set(el_.categoria))}"
_els_a = {k: _el_por_hab(el_[(el_.categoria == c) & (el_.anio <= EL_ULT)], "anio") for c, k in _els_cat.items()}
_els_u = pd.DataFrame({k: v[v.anio == EL_ULT].set_index("codigo_indec").kwh_hab for k, v in _els_a.items()})
_els_g = pd.DataFrame({k: v[v.anio == EL_ULT].set_index("codigo_indec").mwh / 1000 for k, v in _els_a.items()})
electricidad_sectores = pd.DataFrame({"codigo_indec": _els_u.index, "territorio": [EL_NOM(c) for c in _els_u.index]})
for _els_k in ("res", "com", "ind"):
    electricidad_sectores["kwh_hab_" + _els_k] = _els_u[_els_k].values
    electricidad_sectores["pct_" + _els_k] = (_els_g[_els_k] / _els_g.sum(axis=1) * 100).values
electricidad_sectores["gwh"] = _els_g.sum(axis=1).values
electricidad_sectores = electricidad_sectores.round(4).sort_values("kwh_hab_ind", ascending=False)
assert len(electricidad_sectores) == 23 and electricidad_sectores.notna().all().all(), "faltan provincias en la demanda por categoría de CAMMESA"
# la demanda de cada categoría en el país por año, en GWh (el texto compara el primer año con el último)
electricidad_sectores_serie = pd.DataFrame({"anio": sorted(_els_a["res"].anio.unique())})
for _els_k, _els_v in _els_a.items():
    electricidad_sectores_serie["gwh_" + _els_k] = electricidad_sectores_serie.anio.map(_els_v[_els_v.codigo_indec == "00"].set_index("anio").mwh / 1000)
electricidad_sectores_serie = electricidad_sectores_serie.round(4)
_els_p = electricidad_sectores[electricidad_sectores.codigo_indec != "00"]
_els_0 = electricidad_sectores.set_index("codigo_indec").loc["00"]
_els_s = electricidad_sectores_serie.set_index("anio")
_els_x = lambda d, k: [d.iloc[0].territorio, float(d.iloc[0][k])]  # territorio y valor de la primera fila
ELS_RES = {
    "els_ind": float(_els_0.kwh_hab_ind), "els_com": float(_els_0.kwh_hab_com),
    "els_pct": {k: r1(float(_els_0["pct_" + k])) for k in ("res", "com", "ind")},
    "els_ind_top": _els_x(_els_p.sort_values("kwh_hab_ind", ascending=False), "kwh_hab_ind"),
    "els_ind_bajo": _els_x(_els_p.sort_values("kwh_hab_ind"), "kwh_hab_ind"),
    "els_com_top": _els_x(_els_p.sort_values("kwh_hab_com", ascending=False), "kwh_hab_com"),
    "els_com_bajo": _els_x(_els_p.sort_values("kwh_hab_com"), "kwh_hab_com"),
    "els_pct_ind_top": [_els_p.sort_values("pct_ind").iloc[-1].territorio, r1(float(_els_p.pct_ind.max()))],
    "els_pct_ind_bajo": [_els_p.sort_values("pct_ind").iloc[0].territorio, r1(float(_els_p.pct_ind.min()))],
    "els_gwh_ini": {k: float(_els_s["gwh_" + k].iloc[0]) for k in ("res", "com", "ind")},
    "els_gwh_ult": {k: float(_els_s["gwh_" + k].iloc[-1]) for k in ("res", "com", "ind")},
}
for _els_k, _els_var in (("com", "electricidad_comercial_por_habitante"), ("ind", "electricidad_industrial_por_habitante")):
    _els_t = _els_a[_els_k][_els_a[_els_k].codigo_indec != EL_BA]
    agregar(_els_t.assign(territorio=_els_t.codigo_indec.map(lambda c: "Argentina" if c == "00" else NOMBRE[c]), periodo=_els_t.anio.astype(str), valor=_els_t.kwh_hab)[
        ["codigo_indec", "territorio", "periodo", "valor"]], _els_var, "kWh por habitante por año", "CAMMESA, demanda mensual por provincia y tipo de usuario")
_el_tl = _el_a[_el_a.codigo_indec != EL_BA]
agregar(_el_tl.assign(territorio=_el_tl.codigo_indec.map(lambda c: "Argentina" if c == "00" else NOMBRE[c]), periodo=_el_tl.anio.astype(str), valor=_el_tl.kwh_hab)[
    ["codigo_indec", "territorio", "periodo", "valor"]], "electricidad_residencial_por_habitante", "kWh por habitante por año", "CAMMESA, demanda mensual por provincia y tipo de usuario")
_el_tp = _el_a[_el_a.codigo_indec == "00"]
agregar(_el_tp.assign(territorio="Argentina", periodo=_el_tp.anio.astype(str), valor=_el_tp.mwh / 1000)[["codigo_indec", "territorio", "periodo", "valor"]],
        "electricidad_residencial_gwh", "GWh por año", "CAMMESA, demanda mensual por provincia y tipo de usuario")

_cbh = _cbh[_cbh.periodo < combustibles_mensual.periodo.min()]
_cbh = _cbh.assign(codigo_indec=_cbh.provincia.map(lambda t: "00" if t == "TOTAL DEL PAIS" else codigo(t)))
assert _cbh.codigo_indec.notna().all(), "provincias sin código en la serie larga de los combustibles"
_cbh = _cbh.pivot_table(index=["periodo", "codigo_indec"], columns="producto", values="mediana").reset_index()
for _cb_p, _cb_var in (("nafta", "precio_nafta_super_surtidor"), ("gasoil", "precio_gasoil_grado_2_surtidor")):
    _cb_d = pd.concat([_cbh, combustibles_mensual]).rename(columns={_cb_p: "valor"})
    agregar(_cb_d.assign(territorio=_cb_d.codigo_indec.map(lambda c: "Argentina" if c == "00" else NOMBRE[c]))[["codigo_indec", "territorio", "periodo", "valor"]],
            _cb_var, "pesos por litro, mediana de las estaciones", "Secretaria de Energia, precios en estaciones de servicio (Res. 1104/2004)")

# ---------------------------------------------------------------- artículo: el dólar, la inversión y la construcción (etapa 22)
# Por trimestre desde 2004: el índice de tipo de cambio real multilateral del BCRA (promedio de los tres meses), el tipo de cambio de
# referencia (Comunicación "A" 3500, promedio de los tres meses), la inversión bruta interna fija en pesos de 2004 (total, construcción y
# equipo durable de producción importado y nacional) y el precio implícito de la construcción (la construcción a precios corrientes sobre
# la de pesos de 2004), pasado a dólares con el tipo de cambio de referencia. Los dos índices van con el promedio de toda la serie = 100.
# Las variaciones son contra el mismo trimestre del año anterior, porque la inversión tiene estacionalidad, y la construcción del año
# siguiente es la variación de los cuatro trimestres que siguen. Las compras netas de billetes y divisas del sector privado no financiero
# (personas y empresas) del balance cambiario del BCRA van por año. Las correlaciones son de Spearman (sobre rangos), como en los
# artículos de cruces, y los tercios se arman con los trimestres que tienen los dos datos. Sin años escritos a mano: todo sale de los datos.
_dq = lambda s: pd.to_datetime(s).dt.to_period("Q")
_TRI = ["primer", "segundo", "tercer", "cuarto"]
_tri = lambda q: f"{_TRI[q.quarter - 1]} trimestre de {q.year}"
di_ = pd.read_csv(CRUDO / "inversion_trimestral.csv")
assert list(di_.columns) == ["indice_tiempo", "4.2_DGIT_2004_T_25", "4.2_DGIC_2004_T_32", "4.2_DGIEDPI_2004_T_55", "4.2_DGIEDPN_2004_T_54",
                             "4.4_DGIC_2004_T_32"], "cambiaron las columnas de la inversión trimestral"
di_.columns = ["t", "inversion_total", "construccion", "equipo_importado", "equipo_nacional", "construccion_corriente"]
di_ = di_.assign(q=_dq(di_.t)).set_index("q").drop(columns="t")
_di_tcr = pd.read_csv(CRUDO / "bcra_itcrm.csv")
_di_a35 = pd.read_csv(CRUDO / "tipo_cambio_a3500.csv")


def _di_trim(d, fecha, col):  # promedio de cada trimestre, solo con sus tres meses
    t = d.assign(q=_dq(d[fecha])).groupby("q")[col].agg(["mean", "size"])
    return t[t["size"] == 3]["mean"].rename(col)


di_ = di_.join(_di_trim(_di_tcr, "mes", "itcrm"), how="inner").join(_di_trim(_di_a35, "indice_tiempo", "tipo_cambio_a3500"), how="inner").dropna()
assert di_.index.min() == pd.Period("2004Q1") and (pd.Series(di_.index).diff().dropna().map(lambda x: x.n) == 1).all(), "faltan trimestres en el artículo del dólar"
assert di_.index.max() >= pd.Period(HOY, "Q") - 6, "la inversión trimestral del INDEC no llega a un trimestre reciente"
di_["costo_usd"] = di_.construccion_corriente / di_.construccion / di_.tipo_cambio_a3500
di_["indice_dolar_real"] = di_.itcrm / di_.itcrm.mean() * 100
di_["indice_construccion_usd"] = di_.costo_usd / di_.costo_usd.mean() * 100
di_["pct_equipo_importado"] = di_.equipo_importado / di_.inversion_total * 100
for _di_c in ("itcrm", "inversion_total", "construccion", "equipo_importado", "equipo_nacional"):
    di_["var_" + _di_c] = (di_[_di_c] / di_[_di_c].shift(4) - 1) * 100
di_["construccion_anio_siguiente"] = (di_.construccion.shift(-4) / di_.construccion - 1) * 100
# compras netas de billetes y divisas (compras menos ventas) del sector privado no financiero, millones de dólares por mes
_di_f = pd.read_csv(CRUDO / "compras_dolares_privados.csv")
assert list(_di_f.columns) == ["indice_tiempo", "182.1_C_K_FINC_CINC_0_M_57", "182.1_C_K_FINC_CINC_NO_FINAN_0_M_56"], "cambiaron las columnas del balance cambiario"
_di_f.columns = ["t", "ventas", "compras"]
_di_f = _di_f.assign(anio=_di_f.t.str[:4].astype(int), mes=_di_f.t.str[5:7].astype(int), neto=_di_f.compras - _di_f.ventas)
_di_fq = _di_f.assign(q=_dq(_di_f.t)).groupby("q").neto.agg(["sum", "size"])
di_ = di_.join(_di_fq[_di_fq["size"] == 3]["sum"].rename("compras_netas_usd"))
_di_sp = lambda a, b, d=None: round(float((di_ if d is None else d)[[a, b]].dropna().rank().corr().iloc[0, 1]), 2) + 0.0  # sin "-0.0"
_di_n = lambda a, b: int(di_[[a, b]].dropna().shape[0])
dolar_inversion_trimestral = di_.reset_index().assign(periodo=lambda x: x.q.astype(str).str.replace("Q", "-T"), anio=lambda x: x.q.dt.year,
                                                     trimestre=lambda x: x.q.dt.quarter)[
    ["periodo", "anio", "trimestre", "itcrm", "tipo_cambio_a3500", "indice_dolar_real", "indice_construccion_usd", "inversion_total", "construccion",
     "equipo_importado", "equipo_nacional", "pct_equipo_importado", "var_itcrm", "var_inversion_total", "var_construccion", "var_equipo_importado",
     "var_equipo_nacional", "construccion_anio_siguiente", "compras_netas_usd"]].round(4)
# tercios: los trimestres de dólar real más barato, medio y más caro (con la parte importada de la inversión), y los de construcción más
# barata, media y más cara en dólares (con lo que cambió la construcción en el año siguiente)
_di_t1 = di_.assign(tercio=pd.qcut(di_.itcrm, 3, labels=False)).groupby("tercio").pct_equipo_importado.mean()
_di_s = di_.dropna(subset=["construccion_anio_siguiente"])
_di_s = _di_s.assign(tercio=pd.qcut(_di_s.indice_construccion_usd, 3, labels=False))
_di_t2 = _di_s.groupby("tercio").construccion_anio_siguiente.median()
_di_ult, _di_q0 = di_.iloc[-1], di_.index[0]
_di_fa = _di_f.groupby("anio").agg(millones_usd=("neto", "sum"), meses=("neto", "size"))
compras_dolares_anual = _di_fa[_di_fa.meses == 12].millones_usd.round(1).reset_index()
_di_fu = compras_dolares_anual.iloc[-1]
_di_fm = compras_dolares_anual.set_index("anio").millones_usd
_di_ya = int(_di_f.anio.max())
_di_ym = int(_di_f[_di_f.anio == _di_ya].mes.max())
DOL_RES = {
    "desde": _tri(_di_q0), "desde_anio": int(_di_q0.year), "ult": _tri(di_.index[-1]), "n": len(di_),
    "itcrm_vs_prom": r1(float(_di_ult.indice_dolar_real) - 100), "itcrm_max": _tri(di_.itcrm.idxmax()), "itcrm_min": _tri(di_.itcrm.idxmin()),
    "costo_vs_prom": r1(float(_di_ult.indice_construccion_usd) - 100), "costo_max": _tri(di_.indice_construccion_usd.idxmax()),
    "costo_min": _tri(di_.indice_construccion_usd.idxmin()), "rs_espejo": _di_sp("itcrm", "indice_construccion_usd"),
    "imp_ult": float(_di_ult.pct_equipo_importado), "imp_dolar_caro": float(_di_t1[2]), "imp_dolar_barato": float(_di_t1[0]),
    "rs_imp": _di_sp("itcrm", "pct_equipo_importado"),
    "rs_var_total": _di_sp("var_itcrm", "var_inversion_total"), "rs_var_imp": _di_sp("var_itcrm", "var_equipo_importado"),
    "rs_var_nac": _di_sp("var_itcrm", "var_equipo_nacional"), "rs_var_cons": _di_sp("var_itcrm", "var_construccion"),
    "n_var": _di_n("var_itcrm", "var_inversion_total"),
    "rs_sig": _di_sp("indice_construccion_usd", "construccion_anio_siguiente"), "n_sig": len(_di_s),
    "sig_barato": float(_di_t2[0]), "sig_medio": float(_di_t2[1]), "sig_caro": float(_di_t2[2]),
    # cuántos de los trimestres de construcción más barata en dólares son de los seis primeros años de la serie
    "barato_primeros": int((_di_s[_di_s.tercio == 0].index.year < _di_q0.year + 6).sum()), "barato_n": int((_di_s.tercio == 0).sum()),
    "primeros_hasta": int(_di_q0.year + 5),
    # las mismas relaciones sin esos seis primeros años: muestran cuánto pesan en el resultado
    "rs_imp_sin": _di_sp("itcrm", "pct_equipo_importado", di_[di_.index.year > _di_q0.year + 5]),
    "rs_sig_sin": _di_sp("indice_construccion_usd", "construccion_anio_siguiente", di_[di_.index.year > _di_q0.year + 5]),
    "fae_anio": int(_di_fu.anio), "fae_ult": float(_di_fu.millones_usd), "fae_max_anio": int(_di_fm.idxmax()), "fae_max": float(_di_fm.max()),
    "fae_ini": int(compras_dolares_anual.anio.min()), "fae_neg": [int(a) for a in _di_fm[_di_fm < 0].index],
    "fae_ytd": {"anio": _di_ya, "mes": _di_ym, "millones": float(_di_f[_di_f.anio == _di_ya].neto.sum()),
                "ant": float(_di_f[(_di_f.anio == _di_ya - 1) & (_di_f.mes <= _di_ym)].neto.sum())} if _di_ya > int(_di_fu.anio) else None,
    "rs_fae": _di_sp("itcrm", "compras_netas_usd"),
}
agregar(_di_tcr[_di_tcr.mes >= "2004-01"].rename(columns={"mes": "periodo", "itcrm": "valor"}).assign(codigo_indec="00", territorio="Argentina"),
        "tipo_cambio_real_multilateral", "indice, 17 de diciembre de 2015 = 100", "BCRA, indice de tipo de cambio real multilateral")
agregar(compras_dolares_anual.rename(columns={"anio": "periodo", "millones_usd": "valor"}).assign(codigo_indec="00", territorio="Argentina"),
        "compras_netas_billetes_divisas_sector_privado", "millones de dolares", "BCRA, balance cambiario")

# ---------------------------------------------------------------- salarios de los asalariados registrados privados por provincia (etapa 23)
# Remuneración promedio por todo concepto de los asalariados registrados del sector privado (OEDE, Secretaría de Trabajo, en base al SIPA),
# por mes y provincia, en pesos corrientes y por puesto (cada relación entre una empresa y un trabajador). Cada puesto se cuenta en la
# provincia donde el trabajador está declarado. Junio y diciembre incluyen el aguinaldo: la comparación entre provincias usa el último mes
# sin aguinaldo, y la serie en pesos de igual valor (IPC nacional del INDEC, desde enero de 2017) deja afuera esos dos meses. La provincia
# de Buenos Aires viene partida en los partidos del Gran Buenos Aires y el resto: se une con el empleo registrado de cada parte en el
# trimestre (OEDE, o el último trimestre publicado). Los dos últimos años son provisorios.
sal_ = pd.read_csv(CRUDO / "oede_remuneraciones_provincias.csv")
_sal_w = sal_.pivot_table(index="mes", columns="zona", values="remuneracion")
assert len(_sal_w.columns) == 26, "cambiaron las zonas del boletín de remuneraciones del OEDE"
_sal_e = pd.read_csv(CRUDO / "oede_empleo_ramas.csv")
_sal_e = _sal_e[_sal_e.rama == "total"].assign(q=lambda x: x.anio.astype(str) + "Q" + x.trimestre.astype(str)).pivot_table(index="q", columns="hoja", values="valor")
_sal_q = pd.Series(pd.PeriodIndex(_sal_w.index, freq="M").asfreq("Q").astype(str), index=_sal_w.index)
_sal_q = _sal_q.where(_sal_q <= _sal_e.index.max(), _sal_e.index.max()).where(_sal_q >= _sal_e.index.min(), _sal_e.index.min())
_SAL_ZONA = {"GRAN BUENOS AIRES": "Partidos de GBA", "CAPITAL FEDERAL": "CABA", "BUENOS AIRES": "Resto de Buenos Aires"}
_sal_emp = lambda z: _sal_e.loc[_sal_q.values, _SAL_ZONA.get(z) or next(h for h in _sal_e.columns if norm(h) == norm(z))].values
_sal_pg, _sal_pr = _sal_emp("GRAN BUENOS AIRES"), _sal_emp("BUENOS AIRES")
_sal_w["06"] = (_sal_w["GRAN BUENOS AIRES"] * _sal_pg + _sal_w["BUENOS AIRES"] * _sal_pr) / (_sal_pg + _sal_pr)
# control: el promedio de las 25 zonas pesado por su empleo tiene que dar el total del país (hoy difiere menos de 0,3%)
_sal_z = [z for z in _sal_w.columns if z not in ("Total", "06")]
_sal_dif = (sum(_sal_w[z] * _sal_emp(z) for z in _sal_z) / sum(_sal_emp(z) for z in _sal_z) / _sal_w["Total"] - 1).abs().iloc[-12:]
assert (_sal_dif < .01).all(), f"el promedio de las provincias del OEDE se aleja del total del país: {_sal_dif.max():.2%}"
_sal_cod = {z: "02" if z == "CAPITAL FEDERAL" else "00" if z == "Total" else codigo(z) for z in _sal_w.columns if z not in ("GRAN BUENOS AIRES", "BUENOS AIRES", "06")}
assert all(_sal_cod.values()), f"zonas sin código en el boletín de remuneraciones: {[z for z, c in _sal_cod.items() if not c]}"
sal_m = _sal_w.rename(columns=_sal_cod)[sorted(set(_sal_cod.values()) | {"06"})]
assert len(sal_m.columns) == 25, "faltan provincias en las remuneraciones del OEDE"
SAL_MES = max(m for m in sal_m.index if m[5:7] not in ("06", "12"))  # el último mes sin aguinaldo
_sal_ant = f"{int(SAL_MES[:4]) - 1}{SAL_MES[4:]}"
assert SAL_MES in _hip_ipc.index and _sal_ant in _hip_ipc.index, "falta el IPC del mes de los salarios"
salarios_provincias = pd.DataFrame({"codigo_indec": sal_m.columns, "salario": sal_m.loc[SAL_MES].values, "salario_ant": sal_m.loc[_sal_ant].values})
salarios_provincias["var_real_12m"] = (salarios_provincias.salario / salarios_provincias.salario_ant / (_hip_ipc[SAL_MES] / _hip_ipc[_sal_ant]) - 1) * 100
salarios_provincias["territorio"] = salarios_provincias.codigo_indec.map(lambda c: "Todo el país" if c == "00" else CORTO[c])
salarios_provincias = salarios_provincias[["codigo_indec", "territorio", "salario", "salario_ant", "var_real_12m"]].round(4).sort_values("salario", ascending=False)
# la serie en pesos del último mes sin aguinaldo, sin junio ni diciembre
_sal_r = sal_m[(sal_m.index >= "2017-01") & (sal_m.index <= SAL_MES) & ~sal_m.index.str[5:7].isin(["06", "12"])]
assert _sal_r.index.isin(_hip_ipc.index).all(), "falta el IPC de algún mes de los salarios"
_sal_r = _sal_r.mul(_hip_ipc[SAL_MES] / _sal_r.index.map(_hip_ipc).values, axis=0)
salarios_serie = _sal_r.reset_index().melt(id_vars="mes", var_name="codigo_indec", value_name="salario_real").rename(columns={"mes": "periodo"}).round(1)
_sal_p = salarios_provincias[salarios_provincias.codigo_indec != "00"]
_sal_0 = salarios_provincias.set_index("codigo_indec").loc["00"]
_sal_s = _sal_r["00"]
_sal_ini = f"{_sal_s.index.min()[:4]}{SAL_MES[4:]}"  # el mismo mes del primer año de la serie
SAL_RES = {
    "mes": _mes_per(SAL_MES), "mes_iso": SAL_MES, "ult": _mes_per(sal_m.index.max()), "ant": _mes_per(_sal_ant), "pais": float(_sal_0.salario),
    "top": [_sal_p.iloc[0].territorio, float(_sal_p.iloc[0].salario)], "bajo": [_sal_p.iloc[-1].territorio, float(_sal_p.iloc[-1].salario)],
    "var_real_12m": r1(float(_sal_0.var_real_12m)), "n_suben": int((_sal_p.var_real_12m > 0).sum()),
    "real_desde": _mes_per(_sal_s.index.min()), "real_ini_mes": _mes_per(_sal_ini), "real_vs_ini": r1(float(_sal_s[SAL_MES] / _sal_s[_sal_ini] - 1) * 100),
    "real_max_mes": _mes_per(_sal_s.idxmax()), "real_max": float(_sal_s.max()), "real_min_mes": _mes_per(_sal_s.idxmin()), "real_min": float(_sal_s.min()),
}
_sal_tl = sal_m[sal_m.index >= "2017-01"].reset_index().melt(id_vars="mes", var_name="codigo_indec", value_name="valor").rename(columns={"mes": "periodo"})
agregar(_sal_tl.assign(territorio=_sal_tl.codigo_indec.map(lambda c: "Argentina" if c == "00" else NOMBRE[c])), "remuneracion_promedio_asalariados_privados",
        "pesos corrientes por mes, promedio por puesto, con aguinaldo en junio y diciembre", "OEDE, Secretaria de Trabajo (SIPA)")

# ---------------------------------------------------------------- salario docente por provincia (etapa 23)
# Salario bruto mensual del maestro de grado de primaria con 10 años de antigüedad y jornada simple, el cargo testigo de la Coordinación de
# Evaluación de Costos Educativos (ex CGECSE), por jurisdicción y trimestre desde marzo de 2003, en pesos corrientes. Incluye las sumas
# extraordinarias de cada trimestre, que la fuente informa aparte, y hasta diciembre de 2023 los componentes que pagaba la Nación (FONID y
# Conectividad). El país es el promedio ponderado que publica la fuente. La serie en pesos de igual valor usa el IPC nacional desde marzo
# de 2017. Los datos son provisorios y cada edición revisa trimestres anteriores.
doc_ = pd.read_csv(CRUDO / "cgecse_salario_docente.csv")
doc_["codigo_indec"] = doc_.jurisdiccion.map(lambda t: "00" if norm(t) == "promedio ponderado" else codigo(t))
assert doc_.codigo_indec.notna().all() and doc_.codigo_indec.nunique() == 25, "jurisdicciones sin código en el salario docente"
doc_["periodo"] = doc_.anio.astype(str) + "-" + doc_.mes.map("{:02d}".format)
_doc_ok = doc_.dropna(subset=["bruto"])
DOC_ULT = _doc_ok.periodo.max()
_doc_u = _doc_ok[_doc_ok.periodo == DOC_ULT]
assert len(_doc_u) == 25, "al último trimestre del salario docente le faltan jurisdicciones"
_doc_ant = f"{int(DOC_ULT[:4]) - 1}{DOC_ULT[4:]}"
assert DOC_ULT in _hip_ipc.index and _doc_ant in _hip_ipc.index, "falta el IPC del trimestre del salario docente"
salario_docente = _doc_u.assign(bruto_ant=_doc_u.codigo_indec.map(_doc_ok[_doc_ok.periodo == _doc_ant].set_index("codigo_indec").bruto),
                                territorio=_doc_u.codigo_indec.map(lambda c: "Todo el país" if c == "00" else CORTO[c]))[["codigo_indec", "territorio", "bruto", "extra", "bruto_ant"]]
salario_docente["var_real_12m"] = (salario_docente.bruto / salario_docente.bruto_ant / (_hip_ipc[DOC_ULT] / _hip_ipc[_doc_ant]) - 1) * 100
salario_docente = salario_docente.round(4).sort_values("bruto", ascending=False)
_doc_r = _doc_ok[_doc_ok.periodo >= "2017-03"].copy()
assert _doc_r.periodo.isin(_hip_ipc.index).all(), "falta el IPC de algún trimestre del salario docente"
_doc_r["bruto_real"] = _doc_r.bruto * _hip_ipc[DOC_ULT] / _doc_r.periodo.map(_hip_ipc)
salario_docente_serie = _doc_r[["periodo", "codigo_indec", "bruto_real"]].round(1)
_doc_p = salario_docente[salario_docente.codigo_indec != "00"]
_doc_0 = salario_docente.set_index("codigo_indec").loc["00"]
_doc_s = _doc_r[_doc_r.codigo_indec == "00"].set_index("periodo").bruto_real
# el último trimestre con los componentes nacionales y el primero sin ellos (hecho fijo: la Nación dejó de pagarlos desde 2024)
_doc_f0, _doc_f1 = "2023-12", "2024-03"
_doc_ini = f"{_doc_s.index.min()[:4]}{DOC_ULT[4:]}"
DOC_RES = {
    "trim": _mes_per(DOC_ULT), "ant": _mes_per(_doc_ant), "pais": float(_doc_0.bruto), "var_real_12m": r1(float(_doc_0.var_real_12m)),
    "top": [_doc_p.iloc[0].territorio, float(_doc_p.iloc[0].bruto)], "bajo": [_doc_p.iloc[-1].territorio, float(_doc_p.iloc[-1].bruto)],
    "extra": [[x.territorio, float(x.extra)] for x in _doc_p[_doc_p.extra > 0].itertuples()],
    # contra el mismo trimestre del primer año de la serie en pesos de igual valor (los aumentos llegan en distintos meses del año)
    "real_desde": _mes_per(_doc_s.index.min()), "real_ini": _mes_per(_doc_ini), "real_vs_ini": r1(float(_doc_s[DOC_ULT] / _doc_s[_doc_ini] - 1) * 100),
    "real_max_trim": _mes_per(_doc_s.idxmax()), "real_max": float(_doc_s.max()), "real_min_trim": _mes_per(_doc_s.idxmin()), "real_min": float(_doc_s.min()),
    "fonid_fin": _mes_per(_doc_f0), "fonid_ini": _mes_per(_doc_f1), "fonid_var": r1(float(_doc_s[_doc_f1] / _doc_s[_doc_f0] - 1) * 100),
}
_doc_tl = _doc_ok[_doc_ok.anio >= 2017]
# en la tabla larga, el trimestre se escribe como los semestres de la pobreza: 2T2026
agregar(_doc_tl.assign(territorio=_doc_tl.codigo_indec.map(lambda c: "Argentina" if c == "00" else NOMBRE[c]), valor=_doc_tl.bruto,
                       periodo=(_doc_tl.mes // 3).astype(str) + "T" + _doc_tl.anio.astype(str))[["codigo_indec", "territorio", "periodo", "valor"]],
        "salario_bruto_maestro_grado_10_anios", "pesos corrientes por mes", "Coordinacion de Evaluacion de Costos Educativos, Secretaria de Educacion")

# ---------------------------------------------------------------- inversión en educación por provincia (etapa 23)
# Gasto público en educación por alumno de gestión estatal (incluye las transferencias no automáticas de la Nación y descuenta lo que se
# transfiere a las escuelas de gestión privada) y gasto educativo como parte del gasto público de cada provincia (sin esas transferencias),
# de la Coordinación de Evaluación de Costos Educativos, por año desde 2001. Por alumno, en pesos del último año con el deflactor del PBI,
# como las otras series anuales largas. Provisorio.
ie_ = pd.read_csv(CRUDO / "cgecse_inversion_educativa.csv")
ie_["codigo_indec"] = ie_.jurisdiccion.map(lambda t: "06" if norm(t) == "provincia de buenos aires" else codigo(t))
assert ie_.codigo_indec.notna().all() and ie_.codigo_indec.nunique() == 25, "jurisdicciones sin código en la inversión educativa"
INV_ULT = int(ie_.dropna().anio.max())
assert INV_ULT in defl.index, "falta el deflactor del último año de la inversión educativa"
_ie_u = ie_[ie_.anio == INV_ULT].dropna()
assert len(_ie_u) == 25, "al último año de la inversión educativa le faltan jurisdicciones"
inversion_educativa = _ie_u.assign(territorio=_ie_u.codigo_indec.map(lambda c: "Todo el país" if c == "00" else CORTO[c]),
                                    pct_gasto=_ie_u.pct_gasto_publico * 100)[["codigo_indec", "territorio", "gasto_por_alumno", "pct_gasto"]].round(4)
_ie_s = ie_.dropna(subset=["gasto_por_alumno"])
_ie_s = _ie_s[_ie_s.anio.isin(defl.index)].assign(por_alumno_real=lambda x: x.gasto_por_alumno * defl[INV_ULT] / x.anio.map(defl))
inversion_educativa_serie = _ie_s[["anio", "codigo_indec", "por_alumno_real"]].round(1)
_ie_p = inversion_educativa[inversion_educativa.codigo_indec != "00"]
_ie_0 = inversion_educativa.set_index("codigo_indec").loc["00"]
_ie_ps = _ie_s[_ie_s.codigo_indec == "00"].set_index("anio").por_alumno_real
_ie_a, _ie_g = _ie_p.sort_values("gasto_por_alumno"), _ie_p.sort_values("pct_gasto")
INV_RES = {
    "anio": INV_ULT, "pais": float(_ie_0.gasto_por_alumno), "pct_pais": r1(float(_ie_0.pct_gasto)),
    "top": [_ie_a.iloc[-1].territorio, float(_ie_a.iloc[-1].gasto_por_alumno)], "bajo": [_ie_a.iloc[0].territorio, float(_ie_a.iloc[0].gasto_por_alumno)],
    "pct_top": [_ie_g.iloc[-1].territorio, r1(float(_ie_g.iloc[-1].pct_gasto))], "pct_bajo": [_ie_g.iloc[0].territorio, r1(float(_ie_g.iloc[0].pct_gasto))],
    "ini": int(_ie_ps.index.min()), "real_ini": float(_ie_ps.iloc[0]), "real_max_anio": int(_ie_ps.idxmax()), "real_max": float(_ie_ps.max()),
    "real_min_anio": int(_ie_ps.idxmin()), "real_min": float(_ie_ps.min()),
}
agregar(ie_.dropna(subset=["gasto_por_alumno"]).assign(territorio=lambda x: x.codigo_indec.map(lambda c: "Argentina" if c == "00" else NOMBRE[c]),
                                                       periodo=lambda x: x.anio.astype(str), valor=lambda x: x.gasto_por_alumno)[["codigo_indec", "territorio", "periodo", "valor"]],
        "gasto_educativo_por_alumno_estatal", "pesos corrientes por alumno de gestion estatal por año", "Coordinacion de Evaluacion de Costos Educativos, Secretaria de Educacion")

# ---------------------------------------------------------------- seguridad (etapa 23)
# Delitos que registran las fuerzas policiales y de seguridad, y en algunas provincias el Ministerio Público Fiscal (SNIC, Ministerio de
# Seguridad Nacional), por provincia y año desde 2000, con las tasas cada 100.000 habitantes que publica el SNIC. Se suman solo los códigos
# principales: desde 2017 cada uno es igual a la suma de sus subcódigos. El total de delitos no cuenta las contravenciones (código 30) ni el
# código 31, que no es un delito. Los homicidios dolosos se cuentan por víctimas y lo demás por hechos. Los robos son el código 15 (sin los
# agravados por el resultado de lesiones o muertes, que van aparte y en siete provincias valen cero), como en Cruces. Para comparar provincias
# en homicidios se suman tres años (víctimas sobre la población del INDEC), porque en las provincias chicas la tasa de un año salta mucho.
# El total del país de 2009 a 2013 lo completó el SNIC porque faltan datos de Buenos Aires y Córdoba.
_seg_p = pd.read_csv(CRUDO / "snic_pais.csv", sep=";", decimal=",", dtype={"codigo_delito_snic_id": str})
_seg_v = pd.read_csv(CRUDO / "snic_provincias.csv", sep=";", decimal=",", dtype={"provincia_id": str, "codigo_delito_snic_id": str})
_SEG_FUERA = {"30", "31"}
_seg_pr = lambda d: d[~d.codigo_delito_snic_id.str.contains("_") & ~d.codigo_delito_snic_id.isin(_SEG_FUERA)]
_seg_pob = (_seg_p[_seg_p.codigo_delito_snic_id == "19"].set_index("anio").pipe(lambda x: x.cantidad_hechos / x.tasa_hechos * 1e5))
_seg_tot = _seg_pr(_seg_p).groupby("anio").cantidad_hechos.sum()
_seg_cod = lambda d, c, col="tasa_hechos": d[d.codigo_delito_snic_id == c].set_index("anio")[col]
delitos_serie = pd.DataFrame({"anio": _seg_tot.index, "total": (_seg_tot / _seg_pob * 1e5).values}).set_index("anio")
for _seg_k, _seg_c, _seg_col in (("homicidios", "1", "tasa_victimas"), ("robos", "15", "tasa_hechos"), ("hurtos", "19", "tasa_hechos"),
                                 ("lesiones", "5", "tasa_hechos"), ("amenazas", "13", "tasa_hechos")):
    delitos_serie[_seg_k] = _seg_cod(_seg_p, _seg_c, _seg_col)
delitos_serie = delitos_serie.reset_index().round(4)
SEG_ULT, SEG_INI = int(_seg_tot.index.max()), int(_seg_tot.index.min())
assert SEG_ULT == ANIO_SNIC and delitos_serie.notna().all().all(), "la serie de delitos del SNIC tiene huecos"
# delitos por tipo en el país, el último año (nombres cortos de los códigos principales)
_SEG_NOM = {"1": "Homicidios dolosos", "2": "Tentativas de homicidio doloso", "3": "Muertes en siniestros viales", "4": "Homicidios culposos por otros hechos",
            "5": "Lesiones dolosas", "6": "Lesiones culposas en siniestros viales", "7": "Lesiones culposas por otros hechos",
            "8": "Otros delitos contra las personas", "9": "Delitos contra el honor", "10": "Abusos sexuales con acceso carnal",
            "11": "Otros delitos contra la integridad sexual", "12": "Delitos contra el estado civil", "13": "Amenazas",
            "14": "Otros delitos contra la libertad", "15": "Robos", "16": "Tentativas de robo", "17": "Robos agravados por lesiones o muertes",
            "18": "Tentativas de robos agravados", "19": "Hurtos", "20": "Tentativas de hurto", "21": "Otros delitos contra la propiedad",
            "22": "Delitos contra la seguridad pública", "23": "Delitos contra el orden público", "24": "Delitos contra la seguridad de la nación",
            "25": "Delitos contra los poderes públicos", "26": "Delitos contra la administración pública", "27": "Delitos contra la fe pública",
            "28": "Infracciones a la ley de estupefacientes", "29": "Delitos de otras leyes especiales", "32": "Delitos contra el orden económico y financiero"}
_seg_u = _seg_pr(_seg_p[_seg_p.anio == SEG_ULT])
assert set(_seg_u.codigo_delito_snic_id) <= set(_SEG_NOM), f"códigos nuevos en el SNIC: {set(_seg_u.codigo_delito_snic_id) - set(_SEG_NOM)}"
delitos_tipo = _seg_u.assign(delito=_seg_u.codigo_delito_snic_id.map(_SEG_NOM), pct=_seg_u.cantidad_hechos / _seg_u.cantidad_hechos.sum() * 100)[
    ["codigo_delito_snic_id", "delito", "cantidad_hechos", "tasa_hechos", "pct"]].rename(columns={"codigo_delito_snic_id": "codigo", "cantidad_hechos": "hechos", "tasa_hechos": "tasa"})
delitos_tipo = delitos_tipo.sort_values("hechos", ascending=False).round(4)
# homicidios dolosos por provincia: tres años, víctimas sobre la población del INDEC (la misma que usa el SNIC desde 2022)
_seg_h = _seg_v[_seg_v.codigo_delito_snic_id == "1"]
_seg_h3 = _seg_h[_seg_h.anio > SEG_ULT - 3]
assert _seg_h3.anio.nunique() == 3 and SEG_ULT - 2 >= 2022, "faltan años de homicidios en el SNIC"
_seg_pob3 = proy[proy.anio.between(SEG_ULT - 2, SEG_ULT)].groupby("codigo_indec").pob.sum()
_seg_hv = _seg_h3.groupby("provincia_id").cantidad_victimas.sum()
_seg_hu = _seg_h[_seg_h.anio == SEG_ULT].set_index("provincia_id")
homicidios_provincias = pd.DataFrame({"codigo_indec": _seg_hv.index, "victimas_3": _seg_hv.values})
homicidios_provincias["tasa_3"] = homicidios_provincias.victimas_3 / homicidios_provincias.codigo_indec.map(_seg_pob3) * 1e5
homicidios_provincias["victimas"] = homicidios_provincias.codigo_indec.map(_seg_hu.cantidad_victimas)
homicidios_provincias["tasa"] = homicidios_provincias.codigo_indec.map(_seg_hu.tasa_victimas)
homicidios_provincias["pct_varones"] = homicidios_provincias.codigo_indec.map(_seg_hu.cantidad_victimas_masc / _seg_hu.cantidad_victimas * 100)
_seg_hp = _seg_p[(_seg_p.codigo_delito_snic_id == "1") & (_seg_p.anio > SEG_ULT - 3)]
homicidios_provincias.loc[len(homicidios_provincias)] = {"codigo_indec": "00", "victimas_3": _seg_hp.cantidad_victimas.sum(),
    "tasa_3": _seg_hp.cantidad_victimas.sum() / _seg_pob3.sum() * 1e5, "victimas": float(_seg_cod(_seg_p, "1", "cantidad_victimas")[SEG_ULT]),
    "tasa": float(_seg_cod(_seg_p, "1", "tasa_victimas")[SEG_ULT]),
    "pct_varones": float(_seg_cod(_seg_p, "1", "cantidad_victimas_masc")[SEG_ULT] / _seg_cod(_seg_p, "1", "cantidad_victimas")[SEG_ULT] * 100)}
homicidios_provincias["territorio"] = homicidios_provincias.codigo_indec.map(lambda c: "Todo el país" if c == "00" else CORTO[c])
homicidios_provincias = homicidios_provincias.round(4).sort_values("tasa_3", ascending=False)
assert len(homicidios_provincias) == 25 and homicidios_provincias[["victimas_3", "tasa_3", "victimas", "tasa"]].notna().all().all(), "faltan provincias en los homicidios del SNIC"
# robos y hurtos por provincia, el último año y el anterior
_seg_rh = lambda d, c: d[d.codigo_delito_snic_id == c].pivot_table(index="provincia_id", columns="anio", values="tasa_hechos")
_seg_ro, _seg_hu2 = _seg_rh(_seg_v, "15"), _seg_rh(_seg_v, "19")
robos_provincias = pd.DataFrame({"codigo_indec": _seg_ro.index, "robos": _seg_ro[SEG_ULT].values, "robos_ant": _seg_ro[SEG_ULT - 1].values,
                                 "hurtos": _seg_hu2[SEG_ULT].reindex(_seg_ro.index).values, "hurtos_ant": _seg_hu2[SEG_ULT - 1].reindex(_seg_ro.index).values})
robos_provincias.loc[len(robos_provincias)] = {"codigo_indec": "00", "robos": float(_seg_cod(_seg_p, "15")[SEG_ULT]), "robos_ant": float(_seg_cod(_seg_p, "15")[SEG_ULT - 1]),
                                               "hurtos": float(_seg_cod(_seg_p, "19")[SEG_ULT]), "hurtos_ant": float(_seg_cod(_seg_p, "19")[SEG_ULT - 1])}
robos_provincias["territorio"] = robos_provincias.codigo_indec.map(lambda c: "Todo el país" if c == "00" else CORTO[c])
robos_provincias = robos_provincias.round(4).sort_values("robos", ascending=False)
assert len(robos_provincias) == 25 and robos_provincias.notna().all().all(), "faltan provincias en los robos del SNIC"
# serie de cada provincia (homicidios, robos y hurtos, tasas del SNIC), para la línea de la provincia elegida
_seg_sp = []
for _seg_k, _seg_c, _seg_col in (("homicidios", "1", "tasa_victimas"), ("robos", "15", "tasa_hechos"), ("hurtos", "19", "tasa_hechos")):
    _seg_sp.append(_seg_v[_seg_v.codigo_delito_snic_id == _seg_c].set_index(["provincia_id", "anio"])[_seg_col].rename(_seg_k))
seguridad_serie_prov = pd.concat(_seg_sp, axis=1).reset_index().rename(columns={"provincia_id": "codigo_indec"}).round(2)
# personas privadas de libertad en establecimientos penitenciarios al 31 de diciembre (SNEEP, Ministerio de Justicia), por servicio
# penitenciario: 23 provinciales (la Ciudad no tiene uno propio) y el federal. No incluye a las personas detenidas en comisarías ni a las que
# tienen prisión domiciliaria. Cada 100.000 habitantes: el país con la población implícita en las tasas del SNIC de cada año, y cada
# servicio provincial con la población de su provincia del último año (proyecciones del INDEC)
_sn = pd.read_csv(CRUDO / "sneep_poblacion.csv", encoding="utf-8-sig").set_index("indice_tiempo")
_snc = pd.read_csv(CRUDO / "sneep_condenados.csv", encoding="utf-8-sig").set_index("indice_tiempo")
assert (_sn.drop(columns="total_arg").sum(axis=1) == _sn.total_arg).all(), "los servicios penitenciarios no suman el total del SNEEP"
SN_ULT, SN_INI = int(_sn.index.max()), int(_sn.index.min())
assert SN_ULT in _seg_pob.index, "falta la población del último año del SNEEP"
carceles_serie = pd.DataFrame({"anio": _sn.index, "personas": _sn.total_arg.values, "tasa": (_sn.total_arg / _sn.index.map(_seg_pob) * 1e5).values,
                               "pct_condenados": (_snc.total_arg.reindex(_sn.index) / _sn.total_arg * 100).values}).round(4)
_sn_cod = {c: "94" if c == "tierra_del_fuego" else "86" if c == "santiago_del_estero" else codigo(c.replace("_", " ")) for c in _sn.columns if c not in ("spf", "total_arg")}
assert all(_sn_cod.values()) and len(set(_sn_cod.values())) == 23, f"servicios penitenciarios sin código: {_sn_cod}"
_sn_pob = proy[proy.anio == SN_ULT].groupby("codigo_indec").pob.sum()
carceles_provincias = pd.DataFrame({"codigo_indec": [_sn_cod[c] for c in _sn_cod], "personas": [float(_sn.loc[SN_ULT, c]) for c in _sn_cod],
                                    "condenados": [float(_snc.loc[SN_ULT, c]) for c in _sn_cod]})
carceles_provincias["tasa"] = carceles_provincias.personas / carceles_provincias.codigo_indec.map(_sn_pob) * 1e5
carceles_provincias["pct_condenados"] = carceles_provincias.condenados / carceles_provincias.personas * 100
carceles_provincias["territorio"] = carceles_provincias.codigo_indec.map(CORTO)
carceles_provincias = carceles_provincias.round(4).sort_values("tasa", ascending=False)
_seg_s = delitos_serie.set_index("anio")
_seg_hom = homicidios_provincias[homicidios_provincias.codigo_indec != "00"]
_seg_rob = robos_provincias[robos_provincias.codigo_indec != "00"]
_seg_cs = carceles_serie.set_index("anio")
_seg_ev = _seg_cod(_seg_p, "21_4")
SEG_RES = {
    "anio": SEG_ULT, "anio_ini": SEG_INI, "total": int(_seg_tot[SEG_ULT]), "total_tasa": float(_seg_s.total[SEG_ULT]), "total_tasa_ant": float(_seg_s.total[SEG_ULT - 1]),
    "tipos": [[x.delito, float(x.tasa), r1(float(x.pct))] for x in delitos_tipo.head(3).itertuples()],
    "robos": float(_seg_s.robos[SEG_ULT]), "robos_ant": float(_seg_s.robos[SEG_ULT - 1]), "hurtos": float(_seg_s.hurtos[SEG_ULT]), "hurtos_ant": float(_seg_s.hurtos[SEG_ULT - 1]),
    "robos_max_anio": int(_seg_s.robos.idxmax()), "robos_max": float(_seg_s.robos.max()),
    "hom_ini": float(_seg_s.homicidios[SEG_INI]), "robos_ini": float(_seg_s.robos[SEG_INI]), "hurtos_ini": float(_seg_s.hurtos[SEG_INI]),
    "hom_victimas": int(homicidios_provincias.set_index("codigo_indec").victimas["00"]), "hom_tasa": float(_seg_s.homicidios[SEG_ULT]),
    "hom_max_anio": int(_seg_s.homicidios.idxmax()), "hom_max": float(_seg_s.homicidios.max()), "hom_min_anio": int(_seg_s.homicidios.idxmin()),
    "hom_varones": r1(float(homicidios_provincias.set_index("codigo_indec").pct_varones["00"])),
    "hom3_desde": SEG_ULT - 2, "hom3_pais": float(homicidios_provincias.set_index("codigo_indec").tasa_3["00"]),
    "hom3_top": [_seg_hom.iloc[0].territorio, float(_seg_hom.iloc[0].tasa_3)], "hom3_bajo": [_seg_hom.iloc[-1].territorio, float(_seg_hom.iloc[-1].tasa_3)],
    "robos_top": [_seg_rob.iloc[0].territorio, float(_seg_rob.iloc[0].robos)], "robos_bajo": [_seg_rob.iloc[-1].territorio, float(_seg_rob.iloc[-1].robos)],
    "hurtos_top": [_seg_rob.sort_values("hurtos").iloc[-1].territorio, float(_seg_rob.hurtos.max())],
    "hurtos_bajo": [_seg_rob.sort_values("hurtos").iloc[0].territorio, float(_seg_rob.hurtos.min())],
    "n_robos_bajan": int((_seg_rob.robos < _seg_rob.robos_ant).sum()),
    "estafas_ini": int(_seg_ev.index.min()), "estafas_tasa_ini": float(_seg_ev.iloc[0]), "estafas_tasa": float(_seg_ev[SEG_ULT]),
    "sn_anio": SN_ULT, "sn_ini": SN_INI, "sn_personas": int(_seg_cs.personas[SN_ULT]), "sn_tasa": float(_seg_cs.tasa[SN_ULT]),
    "sn_personas_ini": int(_seg_cs.personas[SN_INI]), "sn_tasa_ini": float(_seg_cs.tasa[SN_INI]), "sn_condenados": r1(float(_seg_cs.pct_condenados[SN_ULT])),
    "sn_spf": int(_sn.loc[SN_ULT, "spf"]),
    "sn_top": [carceles_provincias.iloc[0].territorio, float(carceles_provincias.iloc[0].tasa)], "sn_bajo": [carceles_provincias.iloc[-1].territorio, float(carceles_provincias.iloc[-1].tasa)],
}
for _seg_k, _seg_var, _seg_uni in (("homicidios", "tasa_victimas_homicidios_dolosos", "víctimas cada 100.000 habitantes"),
                                   ("robos", "tasa_robos", "hechos cada 100.000 habitantes"), ("hurtos", "tasa_hurtos", "hechos cada 100.000 habitantes")):
    _seg_t = seguridad_serie_prov[["codigo_indec", "anio", _seg_k]].rename(columns={"anio": "periodo", _seg_k: "valor"})
    _seg_t = pd.concat([_seg_t, delitos_serie[["anio", _seg_k]].rename(columns={"anio": "periodo", _seg_k: "valor"}).assign(codigo_indec="00")])
    agregar(_seg_t.assign(territorio=_seg_t.codigo_indec.map(lambda c: "Argentina" if c == "00" else NOMBRE[c])), _seg_var, _seg_uni, "SNIC, Ministerio de Seguridad")
agregar(carceles_serie.rename(columns={"anio": "periodo", "personas": "valor"}).assign(codigo_indec="00", territorio="Argentina"),
        "personas_privadas_de_libertad_establecimientos_penitenciarios", "personas al 31 de diciembre", "SNEEP, Ministerio de Justicia")

# ---------------------------------------------------------------- artículo: el turismo y el dólar (etapa 24)
# Por mes: los viajes de turistas no residentes que llegan al país (desde 2010) y de residentes que viajan al exterior (desde 2016), del SINTA,
# frente al índice de tipo de cambio real multilateral del BCRA y al bilateral con Brasil, Chile y Uruguay (los países de los que llegan más
# turistas de América del Sur). Las variaciones son contra el mismo mes del año anterior, porque los viajes tienen temporadas. Los meses de la
# pandemia quedan fuera de las correlaciones principales, porque con las fronteras cerradas los viajes no dependían del dólar: la ventana sale de
# los datos (los meses desde 2020 en que llegó menos de la mitad de los turistas del mismo mes de 2019, el año de referencia antes de la
# pandemia), y también quedan afuera las variaciones cuyo mes de comparación cae en ella. Con la pandemia adentro, las correlaciones van como
# control. Correlaciones de Spearman, como en los otros artículos. Sin años escritos a mano, salvo 2019, que es fijo.
_tu_r = pd.read_csv(CRUDO / "sinta_turistas_no_residentes.csv").assign(mes=lambda x: x.indice_tiempo.str[:7])
_tu_e = pd.read_csv(CRUDO / "sinta_turistas_residentes.csv").assign(mes=lambda x: x.indice_tiempo.str[:7])
_tu_t = pd.read_csv(CRUDO / "bcra_itcrm.csv").set_index("mes")
tu_ = pd.DataFrame({"llegan": _tu_r.groupby("mes").viajes_de_turistas_no_residentes.sum(), "salen": _tu_e.groupby("mes").viajes_de_turistas_residentes.sum()})
for _tu_p, _tu_k in (("Brasil", "brasil"), ("Chile", "chile"), ("Uruguay", "uruguay")):
    tu_["llegan_" + _tu_k] = _tu_r[_tu_r.pais_origen == _tu_p].groupby("mes").viajes_de_turistas_no_residentes.sum()
tu_ = tu_.join(_tu_t[["itcrm", "brasil", "chile", "uruguay"]].add_prefix("tcr_"), how="inner")
assert len(pd.period_range(tu_.index.min(), tu_.index.max(), freq="M")) == len(tu_), "faltan meses en el turismo internacional o en el tipo de cambio real"
assert tu_.index.min() <= "2010-01" and tu_.salen.first_valid_index() <= "2016-01", "cambió el comienzo de las series de turismo internacional"
# la pandemia, desde los datos
_tu_19 = tu_.llegan[tu_.index.str[:4] == "2019"].set_axis(tu_.index[tu_.index.str[:4] == "2019"].str[5:7])
_tu_w = [m for m in tu_.index if m >= "2020-01" and tu_.llegan[m] < .5 * _tu_19[m[5:7]]]
assert _tu_w and len(pd.period_range(_tu_w[0], _tu_w[-1], freq="M")) == len(_tu_w), "la ventana de la pandemia no es seguida"
tu_["pandemia"] = tu_.index.isin(_tu_w)
for _tu_k in ("llegan", "salen", "llegan_brasil", "llegan_chile", "llegan_uruguay", "tcr_itcrm", "tcr_brasil", "tcr_chile", "tcr_uruguay"):
    tu_["var_" + _tu_k] = (tu_[_tu_k] / tu_[_tu_k].shift(12) - 1) * 100
# las variaciones válidas: ni el mes ni el de un año antes están en la pandemia
tu_["var_valida"] = ~tu_.pandemia & ~tu_.pandemia.shift(12, fill_value=False)
for _tu_k in ("llegan", "salen"):
    tu_[_tu_k + "_12m"] = tu_[_tu_k].rolling(12).sum()
tu_["balanza_12m"] = tu_.llegan_12m - tu_.salen_12m
tu_["tcr_12m"] = tu_.tcr_itcrm.rolling(12).mean()
# los doce meses que no tocan la pandemia
tu_["doce_validos"] = tu_.pandemia.astype(int).rolling(12).max().eq(0)
_tu_sp = lambda a, b, f: round(float(tu_.loc[f, [a, b]].dropna().rank().corr().iloc[0, 1]), 2) + 0.0
_tu_n = lambda a, b, f: int(tu_.loc[f, [a, b]].dropna().shape[0])
_tu_v, _tu_todas = tu_.var_valida, tu_.index == tu_.index
turismo_dolar_mensual = tu_.reset_index().rename(columns={"index": "mes"}).round(4)
_tu_u = tu_.iloc[-1]
_tu_12 = tu_[tu_.index > tu_.index[-13]]
TU_RES = {
    "desde": _mes_per(tu_.index[0]), "desde_salen": _mes_per(tu_.salen.first_valid_index()), "ult": _mes_per(tu_.index[-1]),
    "llegan_12m": int(_tu_u.llegan_12m), "salen_12m": int(_tu_u.salen_12m), "balanza_12m": int(_tu_u.balanza_12m),
    "llegan_12m_max": int(tu_.llegan_12m.max()), "llegan_12m_max_mes": _mes_per(tu_.llegan_12m.idxmax()),
    "salen_12m_max": int(tu_.salen_12m.max()), "salen_12m_max_mes": _mes_per(tu_.salen_12m.idxmax()),
    "pand_ini": _mes_per(_tu_w[0]), "pand_fin": _mes_per(_tu_w[-1]), "pand_n": len(_tu_w),
    "rs_llegan": _tu_sp("var_tcr_itcrm", "var_llegan", _tu_v), "rs_salen": _tu_sp("var_tcr_itcrm", "var_salen", _tu_v),
    "n_llegan": _tu_n("var_tcr_itcrm", "var_llegan", _tu_v), "n_salen": _tu_n("var_tcr_itcrm", "var_salen", _tu_v),
    "rs_llegan_con": _tu_sp("var_tcr_itcrm", "var_llegan", _tu_todas), "rs_salen_con": _tu_sp("var_tcr_itcrm", "var_salen", _tu_todas),
    "rs_balanza": _tu_sp("tcr_12m", "balanza_12m", tu_.doce_validos), "n_balanza": _tu_n("tcr_12m", "balanza_12m", tu_.doce_validos),
    "rs_brasil": _tu_sp("var_tcr_brasil", "var_llegan_brasil", _tu_v), "rs_chile": _tu_sp("var_tcr_chile", "var_llegan_chile", _tu_v),
    "rs_uruguay": _tu_sp("var_tcr_uruguay", "var_llegan_uruguay", _tu_v),
    "pct_brasil": r1(float(_tu_12.llegan_brasil.sum() / _tu_12.llegan.sum() * 100)),
    # Brasil frente a las demás categorías de origen del SINTA (países y regiones, como Europa) en los últimos doce meses
    "brasil_primero": bool(_tu_r[_tu_r.mes.isin(_tu_12.index)].groupby("pais_origen").viajes_de_turistas_no_residentes.sum().idxmax() == "Brasil"),
    "tcr_vs_prom": r1(float(_tu_u.tcr_itcrm / tu_.tcr_itcrm.mean() * 100 - 100)), "tcr_ult": _mes_per(tu_.index[-1]),
    "provisorio_desde": _mes_per(_tu_r[_tu_r.observaciones.fillna("").str.contains("provisori", case=False)].mes.min()),
}
agregar(pd.DataFrame({"periodo": tu_.index, "valor": tu_.salen}).dropna().assign(codigo_indec="00", territorio="Argentina"),
        "viajes_turistas_residentes_al_exterior", "viajes por mes", "Ministerio de Turismo y Deportes, SINTA, estimacion de turismo internacional")

# ---------------------------------------------------------------- artículo: la nafta en dólares y el petróleo (etapa 24)
# El precio de la nafta súper en el surtidor (la mediana de las estaciones de todo el país, Resolución 1104/2004, desde diciembre de 2004)
# pasado a dólares con el tipo de cambio de referencia del BCRA (Comunicación "A" 3500, promedio del mes), frente al petróleo Brent (EIA,
# dólares por barril, pasados a dólares por litro: un barril tiene 158,987 litros). Variaciones contra el mismo mes del año anterior y
# promedios de cada año, con los años completos. Correlaciones de Spearman, como en los otros artículos. Al tipo de cambio oficial: en los años
# con límites para comprar dólares, con otros tipos de cambio el precio en dólares sería más bajo, y los textos lo dicen.
nf_ = pd.concat([_cbh, combustibles_mensual])
nf_ = nf_[nf_.codigo_indec == "00"][["periodo", "nafta"]].set_index("periodo").nafta.rename("nafta").to_frame()
_nf_a = pd.read_csv(CRUDO / "tipo_cambio_a3500.csv")
_nf_b = pd.read_csv(CRUDO / "eia_brent_mensual.csv").set_index("mes").usd_barril
nf_["a3500"] = pd.Series(_nf_a.tipo_cambio_a3500.values, index=_nf_a.indice_tiempo.str[:7])
nf_["brent"] = _nf_b
nf_ = nf_.dropna()
assert nf_.index.min() == "2004-12" and len(pd.period_range(nf_.index.min(), nf_.index.max(), freq="M")) == len(nf_), "faltan meses en la nafta en dólares"
nf_["nafta_usd"] = nf_.nafta / nf_.a3500
nf_["brent_litro"] = nf_.brent / 158.987
for _nf_k in ("nafta_usd", "brent"):
    nf_["var_" + _nf_k] = (nf_[_nf_k] / nf_[_nf_k].shift(12) - 1) * 100
nafta_dolares_mensual = nf_.reset_index().rename(columns={"periodo": "mes"}).round(4)
_nf_y = nf_.assign(anio=nf_.index.str[:4].astype(int)).groupby("anio").agg(nafta_usd=("nafta_usd", "mean"), brent_litro=("brent_litro", "mean"), meses=("nafta", "size"))
_nf_y = _nf_y[_nf_y.meses == 12].drop(columns="meses")
_nf_y["veces"] = _nf_y.nafta_usd / _nf_y.brent_litro
nafta_dolares_anual = _nf_y.reset_index().round(4)
_nf_sp = lambda a, b, d: round(float(d[[a, b]].dropna().rank().corr().iloc[0, 1]), 2) + 0.0
_nf_u = nf_.iloc[-1]
NF_RES = {
    "desde": _mes_per(nf_.index[0]), "ult": _mes_per(nf_.index[-1]), "nafta": float(_nf_u.nafta), "nafta_usd": float(_nf_u.nafta_usd),
    "brent_litro": float(_nf_u.brent_litro), "brent": float(_nf_u.brent),
    "usd_max_mes": _mes_per(nf_.nafta_usd.idxmax()), "usd_max": float(nf_.nafta_usd.max()), "usd_min_mes": _mes_per(nf_.nafta_usd.idxmin()), "usd_min": float(nf_.nafta_usd.min()),
    "rs_nivel": _nf_sp("brent", "nafta_usd", nf_), "rs_var": _nf_sp("var_brent", "var_nafta_usd", nf_), "n_var": int(nf_[["var_brent", "var_nafta_usd"]].dropna().shape[0]),
    "rs_var_sin": _nf_sp("var_brent", "var_nafta_usd", nf_[nf_.index >= f"{int(nf_.index[0][:4]) + 6}-01"]), "sin_desde": int(nf_.index[0][:4]) + 6,
    "veces_max_anio": int(_nf_y.veces.idxmax()), "veces_max": float(_nf_y.veces.max()), "veces_min_anio": int(_nf_y.veces.idxmin()), "veces_min": float(_nf_y.veces.min()),
    "veces_ult_anio": int(_nf_y.index.max()), "veces_ult": float(_nf_y.veces.iloc[-1]),
    "usd_anio_ult": float(_nf_y.nafta_usd.iloc[-1]), "usd_anio_max_anio": int(_nf_y.nafta_usd.idxmax()), "usd_anio_max": float(_nf_y.nafta_usd.max()),
}
agregar(pd.DataFrame({"periodo": nf_.index, "valor": nf_.nafta_usd}).assign(codigo_indec="00", territorio="Argentina"),
        "precio_nafta_super_surtidor_dolares", "dolares por litro al tipo de cambio de referencia (Com. A 3500), mediana de las estaciones",
        "Secretaria de Energia (Res. 1104/2004) y BCRA")
# el Brent no va a la tabla larga, que tiene solo datos de la Argentina y sus jurisdicciones: queda en la tabla del artículo

# ---------------------------------------------------------------- artículo: las exportaciones y el dólar (etapa 24)
# Por trimestre desde 2004: los índices de cantidad de las exportaciones del INDEC (sin el efecto de los precios, 2004 = 100) del total y de
# cada gran rubro, frente al índice de tipo de cambio real multilateral del BCRA (promedio de los tres meses) y, para las manufacturas de origen
# industrial, el bilateral con Brasil. Los índices "Agro" e "Industria" de la API son las manufacturas de origen agropecuario e industrial:
# verificado el 4 de octubre de 2026, sus índices de valor crecen igual que las exportaciones en dólares de cada rubro (correlación de 0,996 y
# 0,988 entre las variaciones). Las exportaciones responden con rezago: la relación principal usa el cambio del dólar real de medio año antes
# (dos trimestres), y el texto dice también la del mismo trimestre y la de un año antes. Las variaciones son contra el mismo trimestre del año
# anterior. Las exportaciones en dólares de cada rubro (mensuales) dan solo la parte de cada uno en los últimos doce meses.
_xd_q = pd.read_csv(CRUDO / "exportaciones_cantidades.csv")
assert list(_xd_q.columns) == ["indice_tiempo", "80.2_IICENG_0_T_47", "80.2_IICENPP_0_T_59", "80.2_IICENA_0_T_44", "80.2_IICENI_0_T_49", "80.2_IICENC_0_T_52"], \
    "cambiaron las columnas de los índices de cantidad de las exportaciones"
_xd_q.columns = ["t", "total", "primarios", "moa", "moi", "combustibles"]
xd_ = _xd_q.assign(q=_dq(_xd_q.t)).set_index("q").drop(columns="t")
xd_ = xd_.join(_di_trim(_di_tcr, "mes", "itcrm").rename("tcr"), how="inner").join(_di_trim(_di_tcr, "mes", "brasil").rename("tcr_brasil"), how="inner").dropna()
assert (pd.Series(xd_.index).diff().dropna().map(lambda x: x.n) == 1).all(), "faltan trimestres en las cantidades exportadas"
for _xd_k in ("total", "primarios", "moa", "moi", "combustibles", "tcr", "tcr_brasil"):
    xd_["var_" + _xd_k] = (xd_[_xd_k] / xd_[_xd_k].shift(4) - 1) * 100
for _xd_k in ("tcr", "tcr_brasil"):
    xd_["var_" + _xd_k + "_antes"] = xd_["var_" + _xd_k].shift(2)  # el cambio del dólar real de medio año antes
_xd_sp = lambda a, b, d=xd_: round(float(d[[a, b]].dropna().rank().corr().iloc[0, 1]), 2) + 0.0
_xd_sin = xd_[xd_.index.year >= xd_.index[0].year + 6]
exportaciones_dolar_trimestral = xd_.reset_index().assign(periodo=lambda x: x.q.astype(str).str.replace("Q", "-T"), anio=lambda x: x.q.dt.year,
                                                         trimestre=lambda x: x.q.dt.quarter).drop(columns="q").round(4)
_xd_y = xd_.groupby(xd_.index.year)[["total", "primarios", "moa", "moi", "combustibles"]].agg(["mean", "size"])
_xd_y = pd.DataFrame({k: _xd_y[(k, "mean")] for k in ("total", "primarios", "moa", "moi", "combustibles")})[_xd_y[("total", "size")] == 4]
exportaciones_cantidades_anual = _xd_y.rename_axis("anio").reset_index().round(2)
_xd_pp = (_xd_y.primarios / _xd_y.primarios.shift(1) - 1) * 100
# la parte de cada rubro en lo que se exportó en los últimos doce meses, en dólares
_xd_v = pd.read_csv(CRUDO / "exportaciones_rubros.csv")
assert list(_xd_v.columns) == ["indice_tiempo", "74.3_IET_0_M_16", "74.3_IEPP_0_M_35", "74.3_IEMOA_0_M_48", "74.3_IEMOI_0_M_46", "74.3_IECE_0_M_35"], \
    "cambiaron las columnas de las exportaciones por rubro"
_xd_v.columns = ["t", "total", "primarios", "moa", "moi", "combustibles"]
_xd_v = _xd_v.dropna().tail(12)
assert len(_xd_v) == 12 and abs(_xd_v[["primarios", "moa", "moi", "combustibles"]].sum().sum() / _xd_v.total.sum() - 1) < .01, "los rubros no suman el total de las exportaciones"
_xd_u = xd_.index[-1]
XD_RES = {
    "desde": _tri(xd_.dropna(subset=["var_total"]).index[0]), "desde_anio": int(xd_.index[0].year), "ult": _tri(_xd_u), "n": int(xd_.var_total.notna().sum()),
    "rs": {k: _xd_sp("var_tcr_antes", "var_" + k) for k in ("total", "primarios", "moa", "moi", "combustibles")},
    "rs_mismo": _xd_sp("var_tcr", "var_total"), "rs_anio": _xd_sp("var_tcr", "var_total", xd_.assign(var_tcr=xd_.var_tcr.shift(4))),
    "rs_sin": _xd_sp("var_tcr_antes", "var_total", _xd_sin), "sin_desde": int(xd_.index[0].year + 6),
    "rs_moi_brasil": _xd_sp("var_tcr_brasil_antes", "var_moi"), "rs_moi_brasil_sin": _xd_sp("var_tcr_brasil_antes", "var_moi", _xd_sin),
    "pct": {k: r1(float(_xd_v[k].sum() / _xd_v.total.sum() * 100)) for k in ("primarios", "moa", "moi", "combustibles")},
    "doce_hasta": _mes_per(_xd_v.t.iloc[-1][:7]), "doce_total": float(_xd_v.total.sum()),
    "anio_ult": int(_xd_y.index.max()),
    "comb_veces": round(float(_xd_y.combustibles.iloc[-1] / _xd_y.combustibles.min()), 1), "comb_min_anio": int(_xd_y.combustibles.idxmin()),
    "pp_caida_anio": int(_xd_pp.idxmin()), "pp_caida": r1(float(_xd_pp.min())),
    "total_max_anio": int(_xd_y.total.idxmax()),
}
agregar(pd.DataFrame({"periodo": xd_.index.astype(str).str.replace("Q", "T").map(lambda p: p[-1] + "T" + p[:4]), "valor": xd_.total.values}).assign(codigo_indec="00", territorio="Argentina"),
        "indice_cantidad_exportaciones", "indice, 2004 = 100", "INDEC, indices de valor, precio y cantidad de las exportaciones")

# ---------------------------------------------------------------- economía y precios (etapa 25)
# Todo sale del INDEC (pedido del autor: "los datos de inflación salen todos del indec"): el índice de precios al consumidor del país y de sus
# seis regiones con sus divisiones, categorías y bienes y servicios (IPC_INDEC, más arriba), las canastas básicas alimentaria y total del Gran
# Buenos Aires por mes y de las seis regiones del informe semestral de pobreza, el índice de salarios y el Estimador Mensual de Actividad
# Económica. Las variaciones del IPC son las que publica el INDEC, con un decimal: se controla que coincidan con las que salen del índice. Las
# regiones son grupos de aglomerados (Cuadro 5 de la metodología del IPC de 2019), no provincias: no van al perfil provincial, a Cruces ni a la
# tabla larga.
ECO_REG = {"Nacional": "nacional", "GBA": "gba", "Pampeana": "pampeana", "Noreste": "noreste", "Noroeste": "noroeste", "Cuyo": "cuyo", "Patagonia": "patagonia"}
ECO_NOM = {"nacional": "Todo el país", "gba": "Gran Buenos Aires", "pampeana": "Pampeana", "noreste": "Noreste", "noroeste": "Noroeste", "cuyo": "Cuyo",
           "patagonia": "Patagonia"}
assert set(IPC_INDEC.Region) == set(ECO_REG), "cambiaron las regiones del IPC del INDEC"
_ipr = IPC_INDEC.assign(reg=IPC_INDEC.Region.map(ECO_REG))
_ipr_ng = _ipr[_ipr.Codigo == "0"]
_ipr_i = _ipr_ng.pivot(index="periodo", columns="reg", values="Indice_IPC")
_ipr_m = _ipr_ng.pivot(index="periodo", columns="reg", values="v_m_IPC")
_ipr_a = _ipr_ng.pivot(index="periodo", columns="reg", values="v_i_a_IPC")
# control: lo que publica el INDEC con un decimal coincide con lo que sale del índice (la diferencia de redondeo no pasa de una décima)
for _ipr_pub, _ipr_n in ((_ipr_m, 1), (_ipr_a, 12)):
    _ipr_d = ((_ipr_i / _ipr_i.shift(_ipr_n) - 1) * 100 - _ipr_pub).abs().stack().dropna()
    assert len(_ipr_d) > 500 and _ipr_d.max() <= .1 + 1e-6, f"las variaciones del IPC no coinciden con el índice en {_ipr_d.idxmax()}"
_ipr_u = _ipr_i.index[-1]
_ipr_dic = f"{int(_ipr_u[:4]) - 1}-12"
_ipr_ant = f"{int(_ipr_u[:4]) - 1}{_ipr_u[4:]}"
ECO_REGIONES = [r for r in ECO_NOM if r != "nacional"]
inflacion_mensual = pd.DataFrame({"periodo": _ipr_i.index, "indice": _ipr_i.nacional.values, "mensual": _ipr_m.nacional.values,
                                  "interanual": _ipr_a.nacional.values, **{f"mensual_{r}": _ipr_m[r].values for r in ECO_REGIONES},
                                  **{f"interanual_{r}": _ipr_a[r].values for r in ECO_REGIONES}})
# la inflación de cada año completo, de diciembre a diciembre: la variación interanual de diciembre que publica el INDEC
_ipr_dd = _ipr_a[_ipr_a.index.str.endswith("-12")].dropna(subset=["nacional"])
inflacion_anual = pd.DataFrame({"anio": _ipr_dd.index.str[:4].astype(int), **{r: _ipr_dd[r].values for r in ECO_NOM}})
# por región en el último mes: en doce meses y en el mes (lo que publica el INDEC), en lo que va del año y cuántas veces subieron los precios
# desde diciembre de 2016 (del índice)
inflacion_regiones = pd.DataFrame([{"codigo": r, "region": ECO_NOM[r], "interanual": _ipr_a.at[_ipr_u, r], "mensual": _ipr_m.at[_ipr_u, r],
                                    "en_el_anio": (_ipr_i.at[_ipr_u, r] / _ipr_i.at[_ipr_dic, r] - 1) * 100,
                                    "veces_desde_dic_2016": _ipr_i.at[_ipr_u, r] / 100} for r in ECO_NOM])
# por rubro en el último mes: las doce divisiones, las tres categorías y los bienes y los servicios, en el país y en cada región
ECO_CLAS = {"Nivel general y divisiones COICOP": "division", "Categorias": "categoria", "Categorías": "categoria", "Bienes y servicios": "bienes_servicios"}
ECO_CORTO = {"01": "Alimentos", "02": "Alcohol y tabaco", "03": "Ropa y calzado", "04": "Vivienda, agua, luz y gas", "05": "Equipamiento del hogar",
             "06": "Salud", "07": "Transporte", "08": "Comunicación", "09": "Recreación y cultura", "10": "Educación", "11": "Restaurantes y hoteles",
             "12": "Otros bienes y servicios", "Estacional": "Estacionales", "Núcleo": "Núcleo", "Regulados": "Regulados", "B": "Bienes", "S": "Servicios"}
_ipr_r = _ipr[(_ipr.periodo == _ipr_u) & (_ipr.Codigo != "0")]
assert set(_ipr_r.Codigo) == set(ECO_CORTO) and set(_ipr_r.Clasificador) <= set(ECO_CLAS), "cambiaron los rubros del IPC del INDEC"
_ipr_ra = _ipr_r.pivot(index="Codigo", columns="reg", values="v_i_a_IPC")
_ipr_nom = _ipr_r[_ipr_r.reg == "nacional"].set_index("Codigo")
inflacion_rubros = pd.DataFrame([{"codigo": c, "grupo": ECO_CLAS[_ipr_nom.at[c, "Clasificador"]],
                                  "rubro": " ".join(str(_ipr_nom.at[c, "Descripcion"]).split()) if ECO_CLAS[_ipr_nom.at[c, "Clasificador"]] == "division" else ECO_CORTO[c],
                                  "corto": ECO_CORTO[c], "interanual": _ipr_nom.at[c, "v_i_a_IPC"], "mensual": _ipr_nom.at[c, "v_m_IPC"],
                                  **{f"interanual_{r}": _ipr_ra.at[c, r] for r in ECO_REGIONES}} for c in ECO_CORTO])
_ipr_div = inflacion_rubros[inflacion_rubros.grupo == "division"].sort_values("interanual")
# lo que va del año, del índice del país
_ipr_ytd = (_ipr_i.at[_ipr_u, "nacional"] / _ipr_i.at[_ipr_dic, "nacional"] - 1) * 100
_ipr_mx = _ipr_a.nacional.dropna()
_ipr_rg = inflacion_regiones[inflacion_regiones.codigo != "nacional"].sort_values("interanual")
_ipr_cat = inflacion_rubros.set_index("codigo")
IPC_RES = {
    "periodo": _ipr_u, "mes": _mes_per(_ipr_u), "anio": int(_ipr_u[:4]), "mes_ant": _mes_per(_ipr_ant),
    "mensual": float(_ipr_m.at[_ipr_u, "nacional"]), "interanual": float(_ipr_a.at[_ipr_u, "nacional"]), "en_el_anio": r1(_ipr_ytd),
    "ia_ant": float(_ipr_a.at[_ipr_ant, "nacional"]) if _ipr_ant in _ipr_a.index and pd.notna(_ipr_a.at[_ipr_ant, "nacional"]) else None,
    "anio_ult": int(inflacion_anual.anio.max()), "anual": float(inflacion_anual.nacional.iloc[-1]), "anio_ini": int(inflacion_anual.anio.min()),
    "anual_max_anio": int(inflacion_anual.loc[inflacion_anual.nacional.idxmax(), "anio"]), "anual_max": float(inflacion_anual.nacional.max()),
    "anual_min_anio": int(inflacion_anual.loc[inflacion_anual.nacional.idxmin(), "anio"]), "anual_min": float(inflacion_anual.nacional.min()),
    "ia_max": float(_ipr_mx.max()), "ia_max_mes": _mes_per(_ipr_mx.idxmax()), "ia_min": float(_ipr_mx.min()), "ia_min_mes": _mes_per(_ipr_mx.idxmin()),
    "ia_desde": _mes_per(_ipr_mx.index[0]), "m_desde": _mes_per(_ipr_m.nacional.dropna().index[0]), "base": _mes_per(_ipr_i.index[0]),
    "m_max": float(_ipr_m.nacional.max()), "m_max_mes": _mes_per(_ipr_m.nacional.idxmax()),
    "m_min": float(_ipr_m.nacional.min()), "m_min_mes": _mes_per(_ipr_m.nacional.idxmin()),
    "veces": round(float(_ipr_i.at[_ipr_u, "nacional"] / 100), 1),
    "reg_max": [_ipr_rg.iloc[-1].region, float(_ipr_rg.iloc[-1].interanual)], "reg_min": [_ipr_rg.iloc[0].region, float(_ipr_rg.iloc[0].interanual)],
    "div_max": [_ipr_div.iloc[-1].rubro, float(_ipr_div.iloc[-1].interanual)], "div_min": [_ipr_div.iloc[0].rubro, float(_ipr_div.iloc[0].interanual)],
    "div_alim": float(_ipr_cat.at["01", "interanual"]),
    "nucleo": float(_ipr_cat.at["Núcleo", "interanual"]), "regulados": float(_ipr_cat.at["Regulados", "interanual"]),
    "estacionales": float(_ipr_cat.at["Estacional", "interanual"]), "bienes": float(_ipr_cat.at["B", "interanual"]),
    "servicios": float(_ipr_cat.at["S", "interanual"]),
    # para el minigráfico de "En cifras": los últimos diez meses
    "mini_ia": [[p, float(v)] for p, v in _ipr_a.nacional.dropna().iloc[-10:].items()],
    "mini_m": [[p, float(v)] for p, v in _ipr_m.nacional.dropna().iloc[-10:].items()],
}
agregar(pd.DataFrame({"periodo": _ipr_i.index, "valor": _ipr_i.nacional.values}).assign(codigo_indec="00", territorio="Argentina"),
        "indice_precios_consumidor", "indice, diciembre de 2016 = 100", "INDEC, Indice de precios al consumidor")

# Canastas básicas alimentaria (línea de indigencia) y total (línea de pobreza) del Gran Buenos Aires, por mes desde abril de 2016: por adulto
# equivalente y para el hogar 2 de los tres hogares de ejemplo del INDEC (cuatro integrantes: un varón de 35 años, una mujer de 31, un hijo
# de 6 y una hija de 8), con las variaciones que publica el INDEC. Y las de las seis regiones, por adulto equivalente, del anexo del informe
# semestral de pobreza (01_descargar.py las suma edición por edición).
_cbx = pd.ExcelFile(CRUDO / "indec_canastas.xls")
es_mes = lambda x: isinstance(x, datetime.datetime)
_cnt_a = pd.read_excel(_cbx, "CBA-CBT", header=None)
_cnt_h = _cnt_a.index[_cnt_a[0].astype(str).str.strip().eq("Mes")][0]
assert "alimentaria" in str(_cnt_a.iat[_cnt_h, 1]).lower() and "total" in str(_cnt_a.iat[_cnt_h, 3]).lower(), "cambió la hoja de canastas del INDEC"
_cnt_a = _cnt_a[_cnt_a[0].map(es_mes)]
cnt_ = pd.DataFrame({"periodo": _cnt_a[0].map(lambda x: x.strftime("%Y-%m")).values, "cba": _cnt_a[1].astype(float).values,
                     "cbt": _cnt_a[3].astype(float).values})
_cnt_g = pd.read_excel(_cbx, "Hogares", header=None)
assert _cnt_g[0].astype(str).str.contains("Hogar 2: de cuatro integrantes, compuesto por un varón de 35 años, una mujer de 31 años, un hijo de 6 años "
                                         "y una hija de 8 años", regex=False).any(), "cambió el hogar 2 de las canastas del INDEC"
_cnt_gh = _cnt_g.index[_cnt_g[1].astype(str).str.strip().eq("Hogar 1")][0]
_cnt_c2 = [j for j in range(_cnt_g.shape[1]) if str(_cnt_g.iat[_cnt_gh, j]).strip() == "Hogar 2"]
assert len(_cnt_c2) == 2, "cambió la hoja de hogares de las canastas del INDEC"
_cnt_g = _cnt_g[_cnt_g[0].map(es_mes)]
cnt_ = cnt_.merge(pd.DataFrame({"periodo": _cnt_g[0].map(lambda x: x.strftime("%Y-%m")).values, "cba_hogar": _cnt_g[_cnt_c2[0]].astype(float).values,
                                "cbt_hogar": _cnt_g[_cnt_c2[1]].astype(float).values}), on="periodo", how="left", validate="1:1")
_cnt_v = pd.read_excel(_cbx, "Variaciones", header=None)
_cnt_vh = _cnt_v.index[_cnt_v[0].astype(str).str.strip().eq("Mes")][0]
assert "alimentaria" in str(_cnt_v.iat[_cnt_vh, 1]).lower() and "total" in str(_cnt_v.iat[_cnt_vh, 4]).lower(), "cambió la hoja de variaciones de las canastas"
_cnt_v = _cnt_v[_cnt_v[0].map(es_mes)]
cnt_ = cnt_.merge(pd.DataFrame({"periodo": _cnt_v[0].map(lambda x: x.strftime("%Y-%m")).values,
                                **{k: pd.to_numeric(_cnt_v[j], errors="coerce").values for k, j in (("mensual_cba", 1), ("interanual_cba", 2), ("mensual_cbt", 4), ("interanual_cbt", 5))}}),
                  on="periodo", how="left", validate="1:1")
assert cnt_.periodo.is_unique and cnt_.periodo.is_monotonic_increasing and cnt_.cbt_hogar.notna().all(), "faltan meses en las canastas del INDEC"
assert (cnt_.cbt_hogar / cnt_.cbt).between(3.08, 3.10).all(), "el hogar 2 de las canastas ya no es de 3,09 adultos equivalentes"
cnt_["interanual_ipc_gba"] = cnt_.periodo.map(_ipr_a.gba)
canasta_mensual = cnt_
_cnt_u = cnt_.iloc[-1]
_cnt_r = pd.read_csv(CRUDO / "indec_canastas_regiones.csv")
_cnt_ru = _cnt_r.periodo.max()
_cnt_rl = _cnt_r[_cnt_r.periodo == _cnt_ru].set_index("region")
_cnt_ra = _cnt_r[_cnt_r.periodo == f"{int(_cnt_ru[:4]) - 1}{_cnt_ru[4:]}"].set_index("region")
assert len(_cnt_rl) == 6, "faltan regiones en las canastas del último mes"
# control: la canasta total del Gran Buenos Aires del informe semestral es la misma que la de la serie mensual
_cnt_gba = cnt_.set_index("periodo").cbt.get(_cnt_ru)
assert _cnt_gba is None or abs(_cnt_rl.at["gba", "cbt"] / _cnt_gba - 1) < .001, "las canastas por región no coinciden con la del Gran Buenos Aires"
canasta_regiones = pd.DataFrame([{"codigo": r, "region": ECO_NOM[r], "periodo": _cnt_ru, "cba": _cnt_rl.at[r, "cba"], "cbt": _cnt_rl.at[r, "cbt"],
                                  "cbt_anio_anterior": _cnt_ra.at[r, "cbt"] if r in _cnt_ra.index else None,
                                  "interanual_cbt": (_cnt_rl.at[r, "cbt"] / _cnt_ra.at[r, "cbt"] - 1) * 100 if r in _cnt_ra.index else None}
                                 for r in ECO_REGIONES])
_cnt_ro = canasta_regiones.sort_values("cbt")
CNT_RES = {
    "periodo": _cnt_u.periodo, "mes": _mes_per(_cnt_u.periodo), "desde": _mes_per(cnt_.periodo.iloc[0]), "anio_ini": int(cnt_.periodo.iloc[0][:4]),
    "anio": int(_cnt_u.periodo[:4]), "adultos_hogar": round(float(_cnt_u.cbt_hogar / _cnt_u.cbt), 2),
    "cba": float(_cnt_u.cba), "cbt": float(_cnt_u.cbt), "cba_hogar": float(_cnt_u.cba_hogar), "cbt_hogar": float(_cnt_u.cbt_hogar),
    "ia_cba": float(_cnt_u.interanual_cba), "ia_cbt": float(_cnt_u.interanual_cbt), "m_cbt": float(_cnt_u.mensual_cbt),
    "ia_ipc_gba": float(_cnt_u.interanual_ipc_gba) if pd.notna(_cnt_u.interanual_ipc_gba) else None,
    "reg_mes": _mes_per(_cnt_ru), "reg_max": [_cnt_ro.iloc[-1].region, float(_cnt_ro.iloc[-1].cbt)], "reg_min": [_cnt_ro.iloc[0].region, float(_cnt_ro.iloc[0].cbt)],
    "reg_gba": float(_cnt_rl.at["gba", "cbt"]),
    "mini": [[p, float(v)] for p, v in cnt_.set_index("periodo").cbt_hogar.iloc[-10:].items()],
}

# Índice de salarios del INDEC (octubre de 2016 = 100): sector privado registrado, sector público y total registrado, en pesos de igual valor
# con el IPC del país (diciembre de 2016 = 100, el primer mes del IPC). El del sector no registrado no se compara con los precios del mismo mes:
# sale de la Encuesta Permanente de Hogares y tiene cinco meses de rezago.
_srl = pd.read_csv(CRUDO / "indec_indice_salarios.csv", sep=";", decimal=",", na_values="NA", encoding="cp1252")
assert list(_srl.columns) == ["periodo", "IS_sector_privado_registrado", "IS_sector_publico", "IS_total_registrado", "IS_sector_no_registrado", "IS_indice_total"], \
    "cambiaron las columnas del índice de salarios del INDEC"
_srl = _srl.assign(periodo=pd.to_datetime(_srl.periodo, format="%d/%m/%Y").dt.strftime("%Y-%m")).set_index("periodo")
_srl.columns = ["privado", "publico", "registrado", "no_registrado", "total"]
assert abs(_srl.at["2016-10", "privado"] - 100) < 1e-6 and _srl.index.is_unique, "el índice de salarios del INDEC cambió de base"
_srl_n = _srl.loc[(_srl.index >= "2016-12") & _srl.index.isin(_ipc_ng.index), ["privado", "publico", "registrado"]].dropna()
_srl_r = _srl_n.div(_srl_n.loc["2016-12"]).mul(100).div(_ipc_ng[_srl_n.index].values / 100, axis=0)
_srl_ia = (_srl_r / _srl_r.shift(12) - 1) * 100
_srl_u = _srl_r.index[-1]
_srl_12 = f"{int(_srl_u[:4]) - 1}{_srl_u[4:]}"
salario_real_mensual = pd.DataFrame({"periodo": _srl_r.index, **{k: _srl_r[k].values for k in _srl_r.columns},
                                     **{f"interanual_real_{k}": _srl_ia[k].values for k in _srl_r.columns}})
_srl_pmax, _srl_pmin = _srl_r.privado.idxmax(), _srl_r.privado.idxmin()
SRL_RES = {
    "periodo": _srl_u, "mes": _mes_per(_srl_u), "mes_ant": _mes_per(_srl_12), "base": _mes_per("2016-12"),
    "anio_ini": int(_srl_r.index[0][:4]), "anio": int(_srl_u[:4]),
    "real_priv": r1(_srl_ia.at[_srl_u, "privado"]), "real_pub": r1(_srl_ia.at[_srl_u, "publico"]), "real_reg": r1(_srl_ia.at[_srl_u, "registrado"]),
    "nom_priv": r1((_srl.at[_srl_u, "privado"] / _srl.at[_srl_12, "privado"] - 1) * 100),
    "nom_pub": r1((_srl.at[_srl_u, "publico"] / _srl.at[_srl_12, "publico"] - 1) * 100),
    "ipc": float(_ipr_a.at[_srl_u, "nacional"]),
    "vs_base_priv": r1(_srl_r.at[_srl_u, "privado"] - 100), "vs_base_pub": r1(_srl_r.at[_srl_u, "publico"] - 100),
    "max_priv_mes": _mes_per(_srl_pmax), "max_priv": r1(_srl_r.at[_srl_pmax, "privado"]),
    "min_priv_mes": _mes_per(_srl_pmin), "min_priv": r1(_srl_r.at[_srl_pmin, "privado"]),
    "mini": [[p, float(v)] for p, v in _srl_ia.privado.dropna().iloc[-10:].items()],
}

# Estimador Mensual de Actividad Económica (INDEC, base 2004 = 100): la serie original con su variación contra el mismo mes del año anterior
# y la desestacionalizada con su variación contra el mes anterior, desde 2004, y los quince sectores (sin los impuestos netos de subsidios).
# El INDEC revisa toda la serie cada mes.
_ema = pd.read_excel(CRUDO / "indec_emae.xls", header=None)
_ema_h = _ema.index[_ema[0].astype(str).str.strip().str.lower().str.startswith("per")][0]
assert "original" in str(_ema.iat[_ema_h, 2]).lower() and "desestacionalizada" in str(_ema.iat[_ema_h, 4]).lower(), "cambió el EMAE del INDEC"
_ema = _ema.iloc[_ema_h + 1:].assign(anio=lambda x: pd.to_numeric(x[0], errors="coerce").ffill())
_ema = _ema[_ema[1].astype(str).str.strip().str.lower().isin(MES)]
_ema_per = [f"{int(a)}-{MES.index(str(m).strip().lower()) + 1:02d}" for a, m in zip(_ema.anio, _ema[1])]
actividad_mensual = pd.DataFrame({"periodo": _ema_per, "original": pd.to_numeric(_ema[2]).values, "interanual": pd.to_numeric(_ema[3]).values,
                                  "desestacionalizada": pd.to_numeric(_ema[4]).values, "mensual_desest": pd.to_numeric(_ema[5], errors="coerce").values})
actividad_mensual.loc[actividad_mensual.periodo < "2005-01", "interanual"] = None  # el primer año no tiene con qué compararse
assert actividad_mensual.periodo.is_unique and list(actividad_mensual.periodo) == list(pd.period_range(actividad_mensual.periodo.iloc[0],
       actividad_mensual.periodo.iloc[-1], freq="M").strftime("%Y-%m")), "faltan meses en el EMAE del INDEC"
_ems = pd.read_excel(CRUDO / "indec_emae_actividad.xls", "Tabla Letras", header=None)
_ems_h = _ems.index[_ems[0].astype(str).str.strip().str.lower().str.startswith("per")][0]
EMA_SECTOR = {"A": ("Agricultura, ganadería, caza y silvicultura", "Agro", "el agro"), "B": ("Pesca", "Pesca", "la pesca"),
              "C": ("Explotación de minas y canteras", "Minas y canteras", "la explotación de minas y canteras"),
              "D": ("Industria manufacturera", "Industria", "la industria"), "E": ("Electricidad, gas y agua", "Electricidad, gas y agua", "la electricidad, el gas y el agua"),
              "F": ("Construcción", "Construcción", "la construcción"), "G": ("Comercio mayorista, minorista y reparaciones", "Comercio", "el comercio"),
              "H": ("Hoteles y restaurantes", "Hoteles y restaurantes", "los hoteles y restaurantes"),
              "I": ("Transporte y comunicaciones", "Transporte", "el transporte y las comunicaciones"), "J": ("Intermediación financiera", "Finanzas", "la intermediación financiera"),
              "K": ("Actividades inmobiliarias, empresariales y de alquiler", "Inmobiliarias", "las actividades inmobiliarias y empresariales"),
              "L": ("Administración pública, defensa y seguridad social obligatoria", "Administración pública", "la administración pública"),
              "M": ("Enseñanza", "Enseñanza", "la enseñanza"), "N": ("Servicios sociales y de salud", "Salud", "los servicios sociales y de salud"),
              "O": ("Otros servicios comunitarios, sociales y personales", "Otros servicios", "los otros servicios comunitarios, sociales y personales")}
_ems_cols = {str(_ems.iat[_ems_h, j]).strip()[:1]: j for j in range(2, _ems.shape[1]) if re.match(r"^[A-O] -", str(_ems.iat[_ems_h, j]).strip())}
assert list(_ems_cols) == list(EMA_SECTOR), "cambiaron los sectores del EMAE del INDEC"
_ems = _ems.iloc[_ems_h + 1:].assign(anio=lambda x: pd.to_numeric(x[0], errors="coerce").ffill())
_ems = _ems[_ems[1].astype(str).str.strip().str.lower().isin(MES)]
_ems_i = pd.DataFrame({s: pd.to_numeric(_ems[j]).values for s, j in _ems_cols.items()},
                      index=[f"{int(a)}-{MES.index(str(m).strip().lower()) + 1:02d}" for a, m in zip(_ems.anio, _ems[1])])
assert _ems_i.index[-1] == actividad_mensual.periodo.iloc[-1], "el EMAE por sector no llega al mismo mes que el total"
_ema_o = actividad_mensual.set_index("periodo").original
actividad_sectores = pd.DataFrame([{"letra": s, "sector": n, "corto": c, "doce_meses": (_ems_i[s].iloc[-12:].mean() / _ems_i[s].iloc[-24:-12].mean() - 1) * 100,
                                    "interanual": (_ems_i[s].iloc[-1] / _ems_i[s].iloc[-13] - 1) * 100} for s, (n, c, _) in EMA_SECTOR.items()])
_ema_art = {n: art for n, _, art in EMA_SECTOR.values()}
_ema_u = actividad_mensual.iloc[-1]
_ema_a = actividad_mensual.assign(anio=actividad_mensual.periodo.str[:4].astype(int)).groupby("anio").original.agg(["mean", "size"])
_ema_a = _ema_a[_ema_a["size"] == 12]["mean"]
actividad_anual = pd.DataFrame({"anio": _ema_a.index[1:], "variacion": ((_ema_a / _ema_a.shift(1) - 1) * 100).iloc[1:].values})
_ema_y = en_lo_que_va(actividad_mensual.periodo + "-01", actividad_mensual.original)
_ema_so = actividad_sectores.sort_values("doce_meses")
_ema_ia = actividad_mensual.dropna(subset=["interanual"]).set_index("periodo").interanual
EMA_RES = {
    "periodo": _ema_u.periodo, "mes": _mes_per(_ema_u.periodo), "desde": int(actividad_mensual.periodo.iloc[0][:4]), "anio": int(_ema_u.periodo[:4]),
    "mes_ant": _mes_per(f"{int(_ema_u.periodo[:4]) - 1}{_ema_u.periodo[4:]}"),
    "interanual": r1(_ema_u.interanual), "mensual_desest": r1(_ema_u.mensual_desest), "en_el_anio": _ema_y,
    "doce": r1((_ema_o.iloc[-12:].mean() / _ema_o.iloc[-24:-12].mean() - 1) * 100),
    "anio_ult": int(actividad_anual.anio.iloc[-1]), "anual": r1(actividad_anual.variacion.iloc[-1]),
    "anual_max_anio": int(actividad_anual.loc[actividad_anual.variacion.idxmax(), "anio"]), "anual_max": r1(actividad_anual.variacion.max()),
    "anual_min_anio": int(actividad_anual.loc[actividad_anual.variacion.idxmin(), "anio"]), "anual_min": r1(actividad_anual.variacion.min()),
    "sec_max": [_ema_art[_ema_so.iloc[-1].sector], r1(_ema_so.iloc[-1].doce_meses)], "sec_max2": [_ema_art[_ema_so.iloc[-2].sector], r1(_ema_so.iloc[-2].doce_meses)],
    "sec_min": [_ema_art[_ema_so.iloc[0].sector], r1(_ema_so.iloc[0].doce_meses)], "sec_min2": [_ema_art[_ema_so.iloc[1].sector], r1(_ema_so.iloc[1].doce_meses)],
    "sec_suben": int((actividad_sectores.doce_meses.map(r1) > 0).sum()),
    "mini": [[p, float(v)] for p, v in _ema_ia.iloc[-10:].items()],
}
agregar(actividad_mensual[["periodo", "original"]].rename(columns={"original": "valor"}).assign(codigo_indec="00", territorio="Argentina"),
        "estimador_mensual_actividad_economica", "indice, 2004 = 100", "INDEC, Estimador Mensual de Actividad Economica")
# ventas en supermercados (etapa 26): la Encuesta de Supermercados del INDEC, un panel fijo de empresas con alguna boca de 200 m² o más. El país,
# con el índice del INDEC a precios constantes, que descuenta los precios de cada grupo de artículos con el IPC del país. Cada provincia, con sus
# ventas a precios corrientes llevadas a pesos del último mes con el IPC de los bienes de su región (la provincia de Buenos Aires en dos partes:
# los 24 partidos con el del Gran Buenos Aires y el resto con el de la región Pampeana). Con el nivel general, que incluye los servicios y las
# tarifas, la caída del país en doce meses daba cuatro veces la del INDEC, y con los bienes queda cerca. No hay ventas por habitante: dependen de
# cuántas bocas del panel hay en cada provincia, más que de lo que se consume
_su_x = pd.ExcelFile(CRUDO / "indec_supermercados.xlsx")
_su_h = {s.strip().rstrip("."): s for s in _su_x.sheet_names}
_su_1 = pd.read_excel(_su_x, _su_h["Cuadro 1"], header=None)
assert "original" in str(_su_1.iat[2, 1]).lower() and "desestacionalizada" in str(_su_1.iat[2, 5]).lower() and "acumulada" in str(_su_1.iat[4, 3]).lower(), \
    "cambió el cuadro 1 de la Encuesta de Supermercados"
_su_1 = _su_1[pd.to_datetime(_su_1[0], errors="coerce").notna()]
supermercados_mensual = pd.DataFrame({"periodo": pd.to_datetime(_su_1[0]).dt.strftime("%Y-%m").values, "original": pd.to_numeric(_su_1[1]).values,
                                      "interanual": pd.to_numeric(_su_1[2], errors="coerce").values,
                                      "acumulada": pd.to_numeric(_su_1[3], errors="coerce").values,
                                      "desestacionalizada": pd.to_numeric(_su_1[5]).values})
assert list(supermercados_mensual.periodo) == list(pd.period_range(supermercados_mensual.periodo.iloc[0], supermercados_mensual.periodo.iloc[-1],
                                                                   freq="M").strftime("%Y-%m")), "faltan meses en la Encuesta de Supermercados"
_su_5 = pd.read_excel(_su_x, _su_h["Cuadro 5"], header=None)
_su_j = {str(_su_5.iat[2, c]).strip(): c for c in range(1, _su_5.shape[1]) if pd.notna(_su_5.iat[2, c])}
assert len(_su_j) == 26 and all(str(_su_5.iat[3, c]).strip() == "Total" for c in _su_j.values()), "cambió el cuadro 5 de la Encuesta de Supermercados"
_su_f = _su_5[pd.to_datetime(_su_5[0], errors="coerce").notna()]
_su_v = pd.DataFrame({j: pd.to_numeric(_su_f[c]).values for j, c in _su_j.items()}, index=pd.to_datetime(_su_f[0]).dt.strftime("%Y-%m").values)
assert _su_v.notna().all().all() and list(_su_v.index) == list(supermercados_mensual.periodo)
# las jurisdicciones suman el total del país
assert ((_su_v.drop(columns="Total del país").sum(axis=1) / _su_v["Total del país"] - 1).abs() < 1e-6).all(), "las provincias no suman el país"
_SU_REG = {"02": "gba", "10": "noroeste", "14": "pampeana", "18": "noreste", "22": "noreste", "26": "patagonia", "30": "pampeana", "34": "noreste",
           "38": "noroeste", "42": "pampeana", "46": "noroeste", "50": "cuyo", "54": "noreste", "58": "patagonia", "62": "patagonia", "66": "noroeste",
           "70": "cuyo", "74": "cuyo", "78": "patagonia", "82": "pampeana", "86": "noroeste", "90": "noroeste", "94": "patagonia"}
_su_jur = {"24 partidos del Gran Buenos Aires": ("06", "gba"), "Resto de Buenos Aires": ("06", "pampeana")}
_su_jur.update({j: (codigo(j), _SU_REG[codigo(j)]) for j in _su_j if j not in _su_jur and j != "Total del país"})
assert sorted({c for c, _ in _su_jur.values()}) == sorted(CORTO), "faltan provincias en la Encuesta de Supermercados"
_su_ipc = _ipr[_ipr.Codigo == "B"].pivot(index="periodo", columns="reg", values="Indice_IPC").reindex(_su_v.index)
assert _su_ipc.notna().all().all(), "el IPC por región no cubre todos los meses de la Encuesta de Supermercados"
SU_ULT = _su_v.index[-1]
# ventas de cada provincia en miles de pesos del último mes
_su_r = pd.DataFrame({j: _su_v[j] / _su_ipc[r] * _su_ipc.at[SU_ULT, r] for j, (_, r) in _su_jur.items()})
_su_r = _su_r.T.groupby(lambda j: _su_jur[j][0]).sum().T
_su_d = lambda s: (s.iloc[-12:].sum() / s.iloc[-24:-12].sum() - 1) * 100
supermercados_provincias = pd.DataFrame({"codigo_indec": _su_r.columns, "territorio": _su_r.columns.map(CORTO),
                                         "region": [ECO_NOM[_SU_REG.get(c, "gba")] if c != "06" else "Gran Buenos Aires y Pampeana" for c in _su_r.columns],
                                         "var_12m": [_su_d(_su_r[c]) for c in _su_r.columns],
                                         "var_mes": ((_su_r.iloc[-1] / _su_r.iloc[-13] - 1) * 100).values})
_su_pais = _su_d(_su_r.sum(axis=1))
_su_o = supermercados_mensual.set_index("periodo")
_su_s = supermercados_provincias.sort_values("var_12m")
_su_ds = _su_o.desestacionalizada
SUP_RES = {
    "periodo": SU_ULT, "mes": _mes_per(SU_ULT), "mes_ant": _mes_per(f"{int(SU_ULT[:4]) - 1}{SU_ULT[4:]}"), "desde": int(_su_o.index[0][:4]),
    "anio": int(SU_ULT[:4]), "interanual": r1(_su_o.interanual.iloc[-1]), "acumulada": r1(_su_o.acumulada.iloc[-1]),
    "doce": r1((_su_o.original.iloc[-12:].mean() / _su_o.original.iloc[-24:-12].mean() - 1) * 100),
    "max_mes": _mes_per(_su_ds.idxmax()), "vs_max": r1((_su_ds.iloc[-1] / _su_ds.max() - 1) * 100),
    "prov": {"desde": _mes_per(_su_r.index[-12]), "pais": r1(_su_pais), "suben": int((_su_s.var_12m.map(r1) > 0).sum()),
             "bajan": int((_su_s.var_12m.map(r1) < 0).sum()), "top": [_su_s.iloc[-1].territorio, r1(_su_s.iloc[-1].var_12m)],
             "bajo": [_su_s.iloc[0].territorio, r1(_su_s.iloc[0].var_12m)]},
    "mini": [[p, float(v)] for p, v in _su_o.interanual.dropna().iloc[-10:].items()],
}
agregar(supermercados_mensual.rename(columns={"original": "valor"})[["periodo", "valor"]].assign(codigo_indec="00", territorio="Argentina"),
        "indice_ventas_supermercados_precios_constantes", "indice, 2017 = 100", "INDEC, Encuesta de Supermercados")
_su_l = (_su_v.drop(columns="Total del país").T.groupby(lambda j: _su_jur[j][0]).sum().T.rename_axis("periodo").reset_index()
         .melt(id_vars="periodo", var_name="codigo_indec", value_name="valor"))
agregar(_su_l.assign(territorio=_su_l.codigo_indec.map(CORTO)), "ventas_supermercados_precios_corrientes", "miles de pesos",
        "INDEC, Encuesta de Supermercados")
ECO_RES = {"ipc": IPC_RES, "canasta": CNT_RES, "salarios": SRL_RES, "actividad": EMA_RES, "super": SUP_RES}

# ---------------------------------------------------------------- migraciones (etapa 25)
# Censo 2022 (INDEC): población en viviendas particulares por lugar de nacimiento (en la provincia, en otra provincia o en otro país) y por
# país de nacimiento, según jurisdicción. La serie de los censos desde 1869 (datos/manual/censos_nacidos_otro_pais.csv, de dos publicaciones
# del INDEC). Las residencias que otorga la Dirección Nacional de Migraciones, solo para todo el país. Y las personas nacidas en la Argentina
# que viven en otro país, estimadas por las Naciones Unidas. El RENAPER (extranjeros, más arriba) identifica más personas nacidas en otro país
# que el Censo: cuenta documentos con el domicilio que cada persona declaró, no residentes.
_mg1 = pd.read_excel(CRUDO / "censo2022_migraciones_c1.xlsx", "Cuadro 1_24 partidos", header=None)
_mg1_h = _mg1.index[_mg1[3].astype(str).str.strip().eq("En esta provincia")][0]
assert str(_mg1.iat[_mg1_h, 4]).strip() == "En otra provincia" and str(_mg1.iat[_mg1_h, 5]).strip() == "Otro país", "cambió el cuadro 1 de migraciones del Censo"
_mg1_f = []
for _, _mg_r in _mg1.iloc[_mg1_h + 1:].iterrows():
    _mg_c = str(_mg_r[0]).strip()
    if _mg_c == "Total" or (_mg_c.isdigit() and len(_mg_c) == 2):
        _mg1_f.append({"codigo_indec": "00" if _mg_c == "Total" else _mg_c, "poblacion": int(_mg_r[2]), "en_la_provincia": int(_mg_r[3]),
                       "en_otra_provincia": int(_mg_r[4]), "en_otro_pais": int(_mg_r[5])})
mg_nac = pd.DataFrame(_mg1_f)
assert len(mg_nac) == 25 and set(mg_nac.codigo_indec) - {"00"} == set(POB), "faltan jurisdicciones en el cuadro 1 de migraciones del Censo"
_mg_p = mg_nac.set_index("codigo_indec")
assert (_mg_p.drop("00").sum() == _mg_p.loc["00"]).all(), "las jurisdicciones no suman el país en el cuadro 1 de migraciones del Censo"
assert (_mg_p.en_la_provincia + _mg_p.en_otra_provincia + _mg_p.en_otro_pais == _mg_p.poblacion).all(), "los lugares de nacimiento no suman la población"
# país de nacimiento según jurisdicción (cuadro 10): las celdas combinadas del título corren el nombre de algunas provincias, así que los
# nombres se toman en orden y se asignan a las columnas "Total" (una cada tres), y se controla cada una contra el cuadro 1
_mg10 = pd.read_excel(CRUDO / "censo2022_migraciones_c10.xlsx", "Cuadro 10", header=None)
_mg10_p = _mg10.index[_mg10[1].astype(str).str.startswith("País de nacimiento")][0]
_mg10_n = [" ".join(str(v).replace("(1)", "").split()) for v in _mg10.iloc[_mg10_p, 3:].tolist() if pd.notna(v)]
_mg10_t = [j for j in range(3, _mg10.shape[1]) if str(_mg10.iat[_mg10_p + 1, j]).strip() == "Total"]
assert len(_mg10_n) == len(_mg10_t) == 24, "cambió el cuadro 10 de migraciones del Censo"
_mg10_c = {2: "00", **{j: COD_NOMBRE[norm(n)] for j, n in zip(_mg10_t, _mg10_n)}}
assert sorted(_mg10_c.values()) == sorted(mg_nac.codigo_indec), "faltan jurisdicciones en el cuadro 10 de migraciones del Censo"
_mg10_l, _mg_cont = [], None
for _mg_i in range(_mg10_p + 2, _mg10.shape[0]):
    _mg_a, _mg_b = _mg10.iat[_mg_i, 0], _mg10.iat[_mg_i, 1]
    if pd.isna(_mg_b):
        continue
    if pd.notna(_mg_a):
        _mg_cont = " ".join(str(_mg_a).split())
    _mg_pn = " ".join(str(_mg_b).split())
    if _mg_pn.startswith(("Nota", "Fuente")):
        break
    for _mg_j, _mg_c in _mg10_c.items():
        _mg_v = _mg10.iat[_mg_i, _mg_j]
        _mg10_l.append({"continente": _mg_cont, "pais": _mg_pn, "codigo_indec": _mg_c,
                        "personas": 0 if pd.isna(_mg_v) or str(_mg_v).strip() == "-" else int(_mg_v)})
mg_pais = pd.DataFrame(_mg10_l)
_mg_tot = mg_pais[mg_pais.pais == "Total"].set_index("codigo_indec").personas
assert (_mg_tot == _mg_p.en_otro_pais.reindex(_mg_tot.index)).all(), "el cuadro 10 no coincide con el cuadro 1 de migraciones del Censo"
mg_pais = mg_pais[mg_pais.pais != "Total"]
assert mg_pais.groupby("codigo_indec").personas.sum().reindex(_mg_tot.index).eq(_mg_tot).all(), "los países de nacimiento no suman el total del cuadro 10"
mg_pais["ignorado"] = mg_pais.pais.str.upper().eq("IGNORADO")
mg_pais["pais"] = mg_pais.pais.where(~mg_pais.ignorado, "País no declarado")
mg_pais["pct"] = mg_pais.personas / mg_pais.codigo_indec.map(_mg_tot) * 100
LIMITROFES = ["Bolivia", "Brasil", "Chile", "Paraguay", "Uruguay"]
assert set(LIMITROFES) <= set(mg_pais.pais), "faltan países limítrofes en el cuadro 10 de migraciones"
_mg_conoc = mg_pais[~mg_pais.ignorado]
_mg_prim = _mg_conoc.sort_values("personas", ascending=False).groupby("codigo_indec").head(1).set_index("codigo_indec")
mg_nac["territorio"] = mg_nac.codigo_indec.map(CORTO).fillna("Todo el país")
for _mg_k, _mg_c in (("pct_otro_pais", "en_otro_pais"), ("pct_otra_provincia", "en_otra_provincia"), ("pct_la_provincia", "en_la_provincia")):
    mg_nac[_mg_k] = mg_nac[_mg_c] / mg_nac.poblacion * 100
mg_nac["primer_pais"] = mg_nac.codigo_indec.map(_mg_prim.pais)
# el primer país, como parte de las personas nacidas en otro país con el país declarado, y cuántas no lo declararon
mg_nac["pct_primer_pais"] = mg_nac.codigo_indec.map(_mg_prim.personas) / mg_nac.codigo_indec.map(_mg_conoc.groupby("codigo_indec").personas.sum()) * 100
mg_nac["pct_pais_no_declarado"] = mg_nac.codigo_indec.map(mg_pais[mg_pais.ignorado].set_index("codigo_indec").pct)
nacidos_otro_pais_provincias = mg_nac[["codigo_indec", "territorio", "poblacion", "en_otro_pais", "pct_otro_pais", "en_otra_provincia", "pct_otra_provincia",
                                       "en_la_provincia", "pct_la_provincia", "primer_pais", "pct_primer_pais", "pct_pais_no_declarado"]]
# los doce países de nacimiento más frecuentes de cada jurisdicción y del país, y los que no lo declararon
nacidos_otro_pais_paises = (pd.concat([_mg_conoc.sort_values("personas", ascending=False).groupby("codigo_indec").head(12), mg_pais[mg_pais.ignorado]])
                            .assign(territorio=lambda x: x.codigo_indec.map(CORTO).fillna("Todo el país"))
                            [["codigo_indec", "territorio", "pais", "continente", "personas", "pct"]].sort_values(["codigo_indec", "personas"], ascending=[True, False]))
_mg_pp = _mg_conoc[_mg_conoc.codigo_indec == "00"]
_mg_nd = mg_pais[(mg_pais.codigo_indec == "00") & mg_pais.ignorado].iloc[0]
_mg_n = mg_nac[mg_nac.codigo_indec != "00"].assign(r=lambda x: x.pct_otro_pais.map(r1), ro=lambda x: x.pct_otra_provincia.map(r1))
_mg_00 = mg_nac[mg_nac.codigo_indec == "00"].iloc[0]
# la serie de los censos: la parte nacida en países limítrofes en 2022 la calcula el sitio con el cuadro 10 (sobre toda la población)
migracion_censos = pd.read_csv(RAIZ / "datos" / "manual" / "censos_nacidos_otro_pais.csv")
assert migracion_censos.anio.max() == 2022 and abs(migracion_censos.set_index("anio").nacidos_otro_pais_pct[2022] - r1(_mg_00.pct_otro_pais)) < .05, \
    "la serie de los censos no termina con el Censo 2022"
_mg_lim = float(_mg_pp[_mg_pp.pais.isin(LIMITROFES)].personas.sum())
migracion_censos.loc[migracion_censos.anio == 2022, "limitrofes_pct"] = _mg_lim / _mg_00.poblacion * 100
migracion_censos = migracion_censos.drop(columns="fuente")
_mg_hmx = migracion_censos.loc[migracion_censos.nacidos_otro_pais_pct.idxmax()]
# residencias otorgadas por la Dirección Nacional de Migraciones (trámites, no personas), por año y nacionalidad
_mg_dn = pd.read_csv(CRUDO / "dnm_radicaciones.csv")
_mg_dn["nacionalidad"] = _mg_dn.nacionalidad.str.strip().str.capitalize().replace({"Otras": "Otras nacionalidades", "Total": "Total"})
radicaciones_anual = _mg_dn[_mg_dn.nacionalidad == "Total"].drop(columns="nacionalidad").reset_index(drop=True)
assert list(radicaciones_anual.anio) == list(range(radicaciones_anual.anio.min(), radicaciones_anual.anio.max() + 1)), "faltan años de radicaciones"
radicaciones_nacionalidad = _mg_dn[_mg_dn.nacionalidad != "Total"].assign(
    pct=lambda x: x.total / x.anio.map(radicaciones_anual.set_index("anio").total) * 100).sort_values(["anio", "total"], ascending=[True, False])
_mg_da = radicaciones_anual.set_index("anio").total
_mg_du = int(_mg_da.index.max())
_mg_dt = radicaciones_nacionalidad[(radicaciones_nacionalidad.anio == _mg_du) & (radicaciones_nacionalidad.nacionalidad != "Otras nacionalidades")]
# refugio (etapa 26): las solicitudes de reconocimiento de la condición de persona refugiada por año desde 1985 y por nacionalidad, y las personas
# reconocidas como refugiadas, de la Comisión Nacional para los Refugiados (CONARE, que publica solo en PDF: datos/manual/conare_*.csv, de su
# edición más nueva), y las personas refugiadas y solicitantes de asilo que viven en la Argentina y las de origen argentino en otros países, de
# ACNUR, que reúne lo que informa cada gobierno a fin de año. "Otras personas que necesitan protección internacional" es una categoría aparte de
# ACNUR: no se suma a las refugiadas
refugio_solicitudes = pd.read_csv(RAIZ / "datos" / "manual" / "conare_solicitudes.csv").drop(columns="fuente")
_rf_n = pd.read_csv(RAIZ / "datos" / "manual" / "conare_nacionalidades.csv")
RF_ULT = int(refugio_solicitudes.anio.max())
assert int(_rf_n.anio.max()) == RF_ULT and pd.notna(refugio_solicitudes.reconocidas.iloc[-1]), "las tablas de la CONARE no llegan al mismo año"
_RF_NOM = {"RUSA": "Rusa", "BRASILEÑA": "Brasileña", "CUBANA": "Cubana", "VENEZOLANA": "Venezolana", "COLOMBIANA": "Colombiana",
           "BIELORRUSA": "Bielorrusa", "SENEGALESA": "Senegalesa", "MARROQUI": "Marroquí", "ARMENIA": "Armenia", "DOMINICANA": "Dominicana",
           "UCRANIANA": "Ucraniana", "SIRIA": "Siria", "PALESTINA": "Palestina", "ECUATORIANA": "Ecuatoriana", "TURCA": "Turca", "PARAGUAYA": "Paraguaya"}
_RF_CONT = {"AFRICA": "África", "AMERICA": "América", "ASIA": "Asia", "EUROPA": "Europa"}
def _rf_nombre(n):
    m = re.fullmatch(r"Resto de (\w+) \((\d+)\)", n)
    return f"Otras de {_RF_CONT[m.group(1)]} ({m.group(2)} nacionalidades)" if m else _RF_NOM[n]
_rf_nu = _rf_n[(_rf_n.anio == RF_ULT) & (_rf_n.solicitudes > 0)].copy()
_rf_nu["nacionalidad"] = _rf_nu.nacionalidad.map(_rf_nombre)
_rf_nu["pct"] = _rf_nu.solicitudes / _rf_nu.solicitudes.sum() * 100
refugio_nacionalidades = _rf_nu[["nacionalidad", "solicitudes", "pct"]].sort_values("solicitudes", ascending=False).reset_index(drop=True)
_rf_top = refugio_nacionalidades[~refugio_nacionalidades.nacionalidad.str.startswith("Otras")].head(3)
refugio_acnur = pd.read_csv(CRUDO / "acnur_asilo_argentina.csv")[["anio", "refugiados", "solicitantes", "otras_proteccion"]].sort_values("anio")
RA_ULT = int(refugio_acnur.anio.max())
_rf_au = refugio_acnur.iloc[-1]
_rf_ao = pd.read_csv(CRUDO / "acnur_asilo_argentina_origen.csv")
_rf_ao = _rf_ao[_rf_ao.anio == RA_ULT]
_rf_oip = _rf_ao.sort_values("otras_proteccion").iloc[-1]
_rf_fo = pd.read_csv(CRUDO / "acnur_origen_argentina.csv").sort_values("anio").iloc[-1]
_rf_fd = pd.read_csv(CRUDO / "acnur_origen_argentina_destino.csv")
_rf_fd = _rf_fd[_rf_fd.anio == RA_ULT].assign(total=lambda x: x.refugiados + x.solicitantes).sort_values("total", ascending=False)
_RF_PAIS = {"ESP": "España", "USA": "Estados Unidos", "ITA": "Italia", "CAN": "Canadá", "MEX": "México", "BRA": "Brasil", "CHL": "Chile",
            "URY": "Uruguay", "FRA": "Francia", "DEU": "Alemania", "GBR": "Reino Unido", "AUS": "Australia", "PRY": "Paraguay", "BOL": "Bolivia",
            "PER": "Perú", "ISR": "Israel", "CHE": "Suiza", "NLD": "Países Bajos", "BEL": "Bélgica", "SWE": "Suecia", "PRT": "Portugal",
            "IRL": "Irlanda", "NZL": "Nueva Zelanda", "AUT": "Austria", "NOR": "Noruega", "DNK": "Dinamarca", "ECU": "Ecuador", "COL": "Colombia"}
assert _rf_fd.head(3).destino_iso.isin(_RF_PAIS).all(), f"falta el nombre en castellano de un destino: {list(_rf_fd.head(3).destino_iso)}"
_rf_ant = refugio_solicitudes.iloc[-2]
_rf_ult = refugio_solicitudes.iloc[-1]
_rf_max = refugio_solicitudes.loc[refugio_solicitudes.solicitudes.idxmax()]
RF_RES = {"anio": RF_ULT, "ini": int(refugio_solicitudes.anio.min()), "solicitudes": int(_rf_ult.solicitudes), "sol_ant": int(_rf_ant.solicitudes),
          "mujeres_pct": r1(_rf_ult.mujeres / _rf_ult.solicitudes * 100), "total": int(refugio_solicitudes.solicitudes.sum()),
          "max_anio": int(_rf_max.anio), "max": int(_rf_max.solicitudes), "reconocidas": int(_rf_ult.reconocidas), "rec_ant": int(_rf_ant.reconocidas),
          "rec_desde": int(refugio_solicitudes.dropna(subset=["reconocidas"]).anio.min()),
          "top": [[f.nacionalidad, int(f.solicitudes), r1(f.pct)] for f in _rf_top.itertuples()],
          "acnur": {"anio": RA_ULT, "desde": int(refugio_acnur.anio.min()), "refugiados": int(_rf_au.refugiados), "solicitantes": int(_rf_au.solicitantes),
                    "otras": int(_rf_au.otras_proteccion), "otras_origen": "Venezuela" if _rf_oip.origen_iso == "VEN" else str(_rf_oip.origen),
                    "otras_todas": bool(_rf_oip.otras_proteccion == _rf_au.otras_proteccion)},
          "afuera": {"anio": RA_ULT, "refugiados": int(_rf_fo.refugiados), "solicitantes": int(_rf_fo.solicitantes),
                     "destinos": [_RF_PAIS[i] for i in _rf_fd.head(3).destino_iso]}}
agregar(refugio_solicitudes.assign(periodo=refugio_solicitudes.anio.astype(str), valor=refugio_solicitudes.solicitudes, codigo_indec="00", territorio="Argentina"),
        "solicitudes_de_refugio", "solicitudes", "CONARE")
# personas nacidas en la Argentina que viven en otro país (Naciones Unidas), con el nombre de cada país en castellano (código M49). Las
# Malvinas no se listan como un país de destino
ONU_PAIS = {724: "España", 840: "Estados Unidos", 380: "Italia", 152: "Chile", 600: "Paraguay", 68: "Bolivia", 376: "Israel", 858: "Uruguay",
            76: "Brasil", 604: "Perú", 36: "Australia", 484: "México", 124: "Canadá", 756: "Suiza", 862: "Venezuela", 156: "China", 170: "Colombia",
            208: "Dinamarca", 554: "Nueva Zelanda", 591: "Panamá", 56: "Bélgica", 392: "Japón", 218: "Ecuador", 188: "Costa Rica", 620: "Portugal",
            578: "Noruega", 214: "República Dominicana", 710: "Sudáfrica", 20: "Andorra", 630: "Puerto Rico", 300: "Grecia", 320: "Guatemala",
            246: "Finlandia", 348: "Hungría", 705: "Eslovenia", 332: "Haití", 442: "Luxemburgo", 616: "Polonia", 558: "Nicaragua", 222: "El Salvador",
            340: "Honduras", 191: "Croacia", 100: "Bulgaria", 352: "Islandia", 44: "Bahamas", 324: "Guinea", 112: "Belarús", 703: "Eslovaquia",
            674: "San Marino", 196: "Chipre", 478: "Mauritania", 440: "Lituania", 233: "Estonia", 516: "Namibia", 688: "Serbia", 470: "Malta",
            531: "Curazao", 438: "Liechtenstein", 192: "Cuba", 428: "Letonia", 268: "Georgia", 136: "Islas Caimán", 132: "Cabo Verde",
            276: "Alemania", 250: "Francia", 826: "Reino Unido", 528: "Países Bajos", 752: "Suecia", 40: "Austria", 372: "Irlanda"}
_mg_on = pd.read_csv(CRUDO / "onu_migrantes_argentina.csv")
_mg_oa = [c for c in _mg_on.columns if c.isdigit()]
_mg_ow = _mg_on[_mg_on.cod_destino == 900].iloc[0]
argentinos_exterior = pd.DataFrame({"anio": [int(a) for a in _mg_oa], "personas": [float(_mg_ow[a]) for a in _mg_oa]})
_mg_od = _mg_on[(_mg_on.cod_destino < 900) & (_mg_on.cod_destino != 238)].sort_values(_mg_oa[-1], ascending=False)
assert _mg_od.head(15).cod_destino.isin(ONU_PAIS).all(), f"falta el nombre en castellano de algún destino: {set(_mg_od.head(15).cod_destino) - set(ONU_PAIS)}"
argentinos_exterior_destinos = pd.DataFrame({"pais": _mg_od.cod_destino.map(ONU_PAIS).fillna(_mg_od.destino).values,
                                             "personas": _mg_od[_mg_oa[-1]].values, "personas_inicio": _mg_od[_mg_oa[0]].values,
                                             "pct": (_mg_od[_mg_oa[-1]] / _mg_ow[_mg_oa[-1]] * 100).values})
_mg_ot = argentinos_exterior_destinos.head(5)
MG_RES = {
    "censo": {
        "pct": r1(_mg_00.pct_otro_pais), "personas": int(_mg_00.en_otro_pais), "poblacion": int(_mg_00.poblacion),
        "top": [_mg_n.loc[_mg_n.pct_otro_pais.idxmax(), "territorio"], r1(_mg_n.pct_otro_pais.max())],
        "bajos": [list(_mg_n[_mg_n.r == _mg_n.r.min()].sort_values("territorio").territorio), float(_mg_n.r.min())],
        "otra_pct": r1(_mg_00.pct_otra_provincia), "otra_personas": int(_mg_00.en_otra_provincia),
        "otra_top": [_mg_n.loc[_mg_n.pct_otra_provincia.idxmax(), "territorio"], r1(_mg_n.pct_otra_provincia.max())],
        "otra_bajos": [list(_mg_n[_mg_n.ro == _mg_n.ro.min()].sort_values("territorio").territorio), float(_mg_n.ro.min())],
        "paises": [[f.pais, int(f.personas), r1(f.pct)] for f in _mg_pp.sort_values("personas", ascending=False).head(5).itertuples()],
        "no_declarado": int(_mg_nd.personas), "no_declarado_pct": r1(_mg_nd.pct),
        "limitrofes_pct": r1(_mg_lim / _mg_pp.personas.sum() * 100),
        "europa_pct": r1(_mg_pp[_mg_pp.continente == "Europa"].personas.sum() / _mg_pp.personas.sum() * 100),
        "primer_pais_n": int((nacidos_otro_pais_provincias[nacidos_otro_pais_provincias.codigo_indec != "00"].primer_pais
                              == _mg_prim.at["00", "pais"]).sum()),
    },
    # por departamento (etapa 26): los tres más altos entre los de 10.000 habitantes o más, como las listas de Departamentos
    "departamentos": {"n": int(len(mig_dep)), "min_pob": 10000,
                      "top": [[f.departamento, CORTO[f.codigo_indec], r1(f.pct_otro_pais)]
                              for f in mig_dep[mig_dep.poblacion_vp >= 10000].nlargest(3, "pct_otro_pais").itertuples()],
                      "otra_top": [[f.departamento, CORTO[f.codigo_indec], r1(f.pct_otra_provincia)]
                                   for f in mig_dep[mig_dep.poblacion_vp >= 10000].nlargest(3, "pct_otra_provincia").itertuples()],
                      "menos_1": int((mig_dep.pct_otro_pais.map(r1) < 1).sum()),
                      "otra_mitad": int((mig_dep.pct_otra_provincia.map(r1) > 50).sum())},
    "refugio": RF_RES,
    "renaper": {"personas": int(extranjeros.personas.sum()), "corte": RENAPER_CORTE,
                "mas": r1((extranjeros.personas.sum() / _mg_00.en_otro_pais - 1) * 100)},
    "historia": {"ini": int(migracion_censos.anio.min()), "ini_pct": float(migracion_censos.nacidos_otro_pais_pct.iloc[0]),
                 "max_anio": int(_mg_hmx.anio), "max_pct": float(_mg_hmx.nacidos_otro_pais_pct), "censos": int(len(migracion_censos)),
                 "lim_ult": r1(migracion_censos.limitrofes_pct.iloc[-1])},
    "dnm": {"anio": _mg_du, "desde": int(_mg_da.index.min()), "total": int(_mg_da[_mg_du]),
            "permanentes": int(radicaciones_anual.set_index("anio").permanentes[_mg_du]),
            "temporarias": int(radicaciones_anual.set_index("anio").temporarias[_mg_du]),
            "var": r1((_mg_da[_mg_du] / _mg_da[_mg_du - 1] - 1) * 100), "max_anio": int(_mg_da.idxmax()), "max": int(_mg_da.max()),
            "min_anio": int(_mg_da.idxmin()), "min": int(_mg_da.min()),
            "top": [[f.nacionalidad, int(f.total), r1(f.pct)] for f in _mg_dt.head(3).itertuples()]},
    "onu": {"anio": int(_mg_oa[-1]), "desde": int(_mg_oa[0]), "personas": int(_mg_ow[_mg_oa[-1]]), "personas_ini": int(_mg_ow[_mg_oa[0]]),
            "anio_ant": int(_mg_oa[-2]), "personas_ant": int(_mg_ow[_mg_oa[-2]]),
            "top": [[f.pais, int(f.personas), r1(f.pct)] for f in _mg_ot.itertuples()]},
}
agregar(mg_nac.assign(periodo="2022", valor=mg_nac.pct_otro_pais, territorio=mg_nac.territorio.replace("Todo el país", "Argentina")), "poblacion_nacida_en_otro_pais", "% de la poblacion en viviendas particulares",
        "INDEC, Censo 2022")
agregar(mg_nac.assign(periodo="2022", valor=mg_nac.pct_otra_provincia, territorio=mg_nac.territorio.replace("Todo el país", "Argentina")), "poblacion_nacida_en_otra_provincia", "% de la poblacion en viviendas particulares",
        "INDEC, Censo 2022")
agregar(radicaciones_anual.assign(periodo=radicaciones_anual.anio.astype(str), valor=radicaciones_anual.total, codigo_indec="00", territorio="Argentina"),
        "residencias_otorgadas", "tramites", "Direccion Nacional de Migraciones")
agregar(argentinos_exterior.assign(periodo=argentinos_exterior.anio.astype(str), valor=argentinos_exterior.personas, codigo_indec="00", territorio="Argentina"),
        "nacidos_en_argentina_en_otro_pais", "personas", "Naciones Unidas, International Migrant Stock 2024")

# ---------------------------------------------------------------- gobierno (etapa 25)
# Las cuentas del Sector Público Nacional no Financiero (Informe Mensual de Ingresos y Gastos de la Secretaría de Hacienda, base caja, desde
# 2016), la recaudación de cada impuesto nacional (DNIAF, desde 1997), la deuda bruta de la Administración Central (Secretaría de Finanzas),
# los cargos en las administraciones provinciales (DNAP), la dotación de la administración nacional (INDEC) y los recursos tributarios de cada
# provincia (DNAP). Lo que va como porcentaje del PBI usa el PBI a precios corrientes del INDEC de cada año completo (_pib_a, más arriba).
# Las finanzas de cada provincia están en Trabajo (fiscal), las transferencias a las provincias en Política y los subsidios en Energía.
_gbn = pd.read_csv(CRUDO / "imig_mensual.csv")
_gbn["periodo"] = _gbn.indice_tiempo.str[:7]
_gbn["anio"] = _gbn.periodo.str[:4].astype(int)
GBN_ING = ["iva_neto_reintegros", "ganancias", "aportes_contribuciones_seguridad_social", "debitos_creditos", "bienes_personales", "impuestos_internos",
           "combustibles", "derechos_exportacion", "derechos_importacion", "resto_tributarios", "fgs_cobradas_sector_privado_sector_publico_financiero",
           "resto_rentas_propiedad", "ingresos_no_tributarios", "transferencias_corrientes", "resto_ingresos_corrientes", "ingresos_capital"]
GBN_GASTO = {"Jubilaciones, pensiones y otras prestaciones sociales": ["jubilaciones_pensiones_contributivas", "asignacion_familiares_hijo",
                                                                      "pensiones_no_contributivas", "prestaciones_inssjp", "otros_programas"],
             "Salarios": ["salarios"], "Subsidios económicos": ["energia", "transporte", "otras_funciones"],
             "Otros gastos de funcionamiento": ["otros_gastos_funcionamiento"],
             "Transferencias corrientes a las provincias": [c for c in _gbn.columns if c.startswith("transferencias_corrientes_provincias_")],
             "Universidades": ["otros_corrientes_transferencias_universidades"],
             "Otros gastos corrientes": ["otros_corrientes_deficit_operativo_empresas_publicas", "otros_corrientes_resto"],
             "Gasto de capital": [c for c in _gbn.columns if c.startswith("capital_")] + ["fondo_federal_solidario"]}
assert all(c in _gbn.columns for cs in GBN_GASTO.values() for c in cs) and all(c in _gbn.columns for c in GBN_ING), "cambiaron las columnas del IMIG"
_gbn["ingresos"] = _gbn[GBN_ING].sum(axis=1)
for _gbn_k, _gbn_c in GBN_GASTO.items():
    _gbn[_gbn_k] = _gbn[_gbn_c].sum(axis=1)
_gbn["gasto_primario"] = _gbn[list(GBN_GASTO)].sum(axis=1)
# control: los ingresos menos el gasto primario dan el resultado primario que publica Hacienda, y el primario menos los intereses, el financiero
assert ((_gbn.ingresos - _gbn.gasto_primario - _gbn.resultado_primario).abs() < 1).all(), "el IMIG no cierra: ingresos menos gasto primario"
assert ((_gbn.resultado_primario - _gbn.intereses_netos - _gbn.resultado_financiero).abs() < 1).all(), "el IMIG no cierra: primario menos intereses"
_gbn_n = _gbn.groupby("anio").periodo.nunique()
_gbn_a = _gbn[_gbn.anio.isin(_gbn_n[_gbn_n == 12].index) & _gbn.anio.isin(_pib_a.index)].groupby("anio")[
    ["ingresos", "gasto_primario", "intereses_netos", "resultado_primario", "resultado_financiero", *GBN_GASTO]].sum()
GBN_ULT = int(_gbn_a.index.max())
cuentas_nacion = pd.DataFrame({"anio": _gbn_a.index, **{f"{k}_pbi": (_gbn_a[k] / _gbn_a.index.map(_pib_a) * 100).values
                                                      for k in ("ingresos", "gasto_primario", "intereses_netos", "resultado_primario", "resultado_financiero")},
                               **{f"{k}_millones": _gbn_a[k].values for k in ("ingresos", "gasto_primario", "resultado_primario", "resultado_financiero")}})
gasto_nacion_tipo = pd.DataFrame({"tipo": list(GBN_GASTO), "millones": [_gbn_a.at[GBN_ULT, k] for k in GBN_GASTO],
                                  "pct_gasto_primario": [_gbn_a.at[GBN_ULT, k] / _gbn_a.at[GBN_ULT, "gasto_primario"] * 100 for k in GBN_GASTO],
                                  "pct_pbi": [_gbn_a.at[GBN_ULT, k] / _pib_a[GBN_ULT] * 100 for k in GBN_GASTO]}).sort_values("millones", ascending=False)
_gbn_c = cuentas_nacion.set_index("anio")
# lo que va del año, en millones de pesos corrientes (sin comparar con el año anterior: la inflación cambia mucho el valor de los pesos)
_gbn_u = _gbn.periodo.max()
_gbn_y = _gbn[(_gbn.anio == int(_gbn_u[:4]))]
GBN_RES = {
    "anio": GBN_ULT, "desde": int(_gbn_c.index.min()), "primario": r1(_gbn_c.at[GBN_ULT, "resultado_primario_pbi"]),
    "financiero": r1(_gbn_c.at[GBN_ULT, "resultado_financiero_pbi"]), "ingresos": r1(_gbn_c.at[GBN_ULT, "ingresos_pbi"]),
    "gasto": r1(_gbn_c.at[GBN_ULT, "gasto_primario_pbi"]), "intereses": r1(_gbn_c.at[GBN_ULT, "intereses_netos_pbi"]),
    "fin_max_anio": int(_gbn_c.resultado_financiero_pbi.idxmax()), "fin_max": r1(_gbn_c.resultado_financiero_pbi.max()),
    "fin_min_anio": int(_gbn_c.resultado_financiero_pbi.idxmin()), "fin_min": r1(_gbn_c.resultado_financiero_pbi.min()),
    "gasto_tipos": [[f.tipo, r1(f.pct_gasto_primario)] for f in gasto_nacion_tipo.head(3).itertuples()],
    "mes": _mes_per(_gbn_u), "en_el_anio": int(_gbn_u[:4]) > GBN_ULT,
    "ytd_primario": float(_gbn_y.resultado_primario.sum()), "ytd_financiero": float(_gbn_y.resultado_financiero.sum()),
    "mini": [[int(a), float(v)] for a, v in _gbn_c.resultado_primario_pbi.items()],
}
# recaudación de cada impuesto nacional (DNIAF): como parte del PBI cada año completo, y la parte de cada impuesto en los últimos doce meses
_gbr = pd.read_csv(CRUDO / "recaudacion_mensual.csv")
_gbr["periodo"] = _gbr.indice_tiempo.str[:7]
_gbr["anio"] = _gbr.periodo.str[:4].astype(int)
GBR_IMP = {"IVA": ["iva"], "Ganancias": ["ganancias"], "Aportes y contribuciones a la seguridad social": ["sistema_seguridad_social"],
           "Débitos y créditos bancarios": ["creditos_debitos_cta_cte"], "Derechos de exportación": ["derechos_exportacion"],
           "Derechos de importación y tasa de estadística": ["derechos_importacion_otros"], "Combustibles": ["total_combustibles"],
           "Bienes personales": ["bienes_personales"], "Impuesto PAIS": ["impuesto_pais"], "Impuestos internos": ["internos_coparticipados"]}
assert all(c in _gbr.columns for cs in GBR_IMP.values() for c in cs) and "total_recursos_tributarios" in _gbr.columns, "cambiaron las columnas de la recaudación"
for _gbr_k, _gbr_c in GBR_IMP.items():
    _gbr[_gbr_k] = _gbr[_gbr_c].sum(axis=1)
_gbr["Otros"] = _gbr.total_recursos_tributarios - _gbr[list(GBR_IMP)].sum(axis=1)
# en algunos meses viejos los impuestos sueltos suman algo más que el total (devoluciones y ajustes chicos): se controlan los doce meses que se usan
assert _gbr.tail(12).Otros.sum() > -1, "los impuestos de la recaudación suman más que el total en los últimos doce meses"
_gbr_n = _gbr.groupby("anio").periodo.nunique()
_gbr_a = _gbr[_gbr.anio.isin(_gbr_n[_gbr_n == 12].index) & _gbr.anio.isin(_pib_a.index)].groupby("anio")[["total_recursos_tributarios", *GBR_IMP, "Otros"]].sum()
recaudacion_anual = pd.DataFrame({"anio": _gbr_a.index, "total_pbi": (_gbr_a.total_recursos_tributarios / _gbr_a.index.map(_pib_a) * 100).values,
                                  "millones": _gbr_a.total_recursos_tributarios.values})
_gbr_12 = _gbr.tail(12)
assert _gbr_12.periodo.nunique() == 12
recaudacion_impuestos = pd.DataFrame({"impuesto": [*GBR_IMP, "Otros"], "millones_12_meses": [float(_gbr_12[k].sum()) for k in [*GBR_IMP, "Otros"]]})
recaudacion_impuestos["pct"] = recaudacion_impuestos.millones_12_meses / _gbr_12.total_recursos_tributarios.sum() * 100
recaudacion_impuestos = recaudacion_impuestos[recaudacion_impuestos.pct.abs() >= .05].sort_values("millones_12_meses", ascending=False)
# lo que va del año contra los mismos meses del año anterior, en pesos de igual valor con el IPC del INDEC (hasta el último mes con IPC)
_gbr_m = _gbr[_gbr.periodo.isin(_ipc_ng.index)]
_gbr_y = en_lo_que_va(_gbr_m.periodo + "-01", _gbr_m.total_recursos_tributarios * _ipc_ng[_gbr_m.periodo.max()] / _gbr_m.periodo.map(_ipc_ng))
_gbr_r = recaudacion_anual.set_index("anio").total_pbi
_gbr_ri = recaudacion_impuestos.set_index("impuesto").pct
GBR_RES = {
    "anio": int(_gbr_r.index.max()), "desde": int(_gbr_r.index.min()), "pbi": r1(_gbr_r.iloc[-1]),
    "pbi_max_anio": int(_gbr_r.idxmax()), "pbi_max": r1(_gbr_r.max()), "pbi_min_anio": int(_gbr_r.idxmin()), "pbi_min": r1(_gbr_r.min()),
    "doce_hasta": _mes_per(_gbr_12.periodo.iloc[-1]), "doce_millones": float(_gbr_12.total_recursos_tributarios.sum()),
    "iva": r1(_gbr_ri["IVA"]), "ganancias": r1(_gbr_ri["Ganancias"]), "seguridad_social": r1(_gbr_ri["Aportes y contribuciones a la seguridad social"]),
    "exportacion": r1(_gbr_ri["Derechos de exportación"]), "ytd": _gbr_y, "mes": _mes_per(_gbr.periodo.max()),
}
# deuda bruta de la Administración Central (Secretaría de Finanzas): el porcentaje del PBI que publica para cada año y cada trimestre del año
# en curso, y el total en dólares a la fecha de la última planilla
_gbd = pd.read_csv(CRUDO / "deuda_publica.csv", dtype={"periodo": str})
_gbd["x"] = [float(p) if p.isdigit() else int(p[2:]) + (int(p[0]) - 1) / 4 + .125 for p in _gbd.periodo]
_gbd_a = _gbd[_gbd.periodo.str.fullmatch(r"\d{4}")]
_gbd_u = _gbd.iloc[-1]
deuda_pbi = _gbd[["periodo", "x", "pct_pbi"]]
_gbd_f = pd.Timestamp(_gbd_u.fecha)
GBD_RES = {
    "fecha": f"{_gbd_f.day} de {MES[_gbd_f.month - 1]} de {_gbd_f.year}", "usd_millones": float(_gbd_u.usd_millones), "pct": r1(_gbd_u.pct_pbi),
    "desde": int(_gbd_a.periodo.iloc[0]), "anio": int(_gbd_a.periodo.iloc[-1]), "pct_anio": r1(_gbd_a.pct_pbi.iloc[-1]),
    "max_anio": int(_gbd_a.loc[_gbd_a.pct_pbi.idxmax(), "periodo"]), "max": r1(_gbd_a.pct_pbi.max()),
    "min_anio": int(_gbd_a.loc[_gbd_a.pct_pbi.idxmin(), "periodo"]), "min": r1(_gbd_a.pct_pbi.min()),
    "mini": [[p, float(v)] for p, v in zip(_gbd_a.periodo.tail(10), _gbd_a.pct_pbi.tail(10))],
}
# cargos ocupados en las administraciones provinciales (DNAP), cada 1.000 habitantes con la población del INDEC del módulo del sitio
_gbc = pd.read_csv(CRUDO / "dnap_cargos_provinciales.csv")
_gbc["marca"] = _gbc.jurisdiccion.str.contains(r"\(\*\*\)", regex=True)  # (**): cargos presupuestados, según la nota de la planilla
_gbc["nombre"] = _gbc.jurisdiccion.str.replace(r"\(?\*+\)?", "", regex=True).str.strip()
_gbc["codigo_indec"] = _gbc.nombre.map(lambda n: "02" if n.upper() == "G.C.B.A." else codigo(n))
assert _gbc.codigo_indec.notna().all() and _gbc.groupby("anio").codigo_indec.nunique().eq(24).all(), "faltan provincias en los cargos de la DNAP"
GBC_ULT = int(_gbc.anio.max())
_gbc_u = _gbc[_gbc.anio == GBC_ULT].set_index("codigo_indec")
_gbc_10 = _gbc[_gbc.anio == _gbc.anio.min()].set_index("codigo_indec")
assert (abs(_gbc_u.habitantes / pd.Series(POB) - 1) < .001).all(), "la población de la planilla de cargos no es la proyección del INDEC del sitio"
empleo_publico_provincias = pd.DataFrame({"codigo_indec": _gbc_u.index, "territorio": _gbc_u.index.map(CORTO), "cargos": _gbc_u.planta.values,
                                          "cada_1000": (_gbc_u.planta / _gbc_u.index.map(POB) * 1000).values,
                                          "cargos_inicio": _gbc_u.index.map(_gbc_10.planta).values,
                                          "gasto_medio_mensual": _gbc_u.gasto_medio.values, "presupuestados": _gbc_u.marca.values}).sort_values("codigo_indec")
_gbc_p = _gbc_u.planta.sum() / sum(POB.values()) * 1000
_gbc_o = empleo_publico_provincias.sort_values("cada_1000")
# dotación de la administración pública nacional, las empresas y las sociedades del Estado (INDEC), por mes desde julio de 2022
_gbx = pd.read_excel(CRUDO / "indec_dotacion_apn.xlsx", sheet_name=0, header=None)
_gbx_f = {str(v).strip(): i for i, v in enumerate(_gbx.iloc[:, 0].tolist())}
assert {"Total", "Administración pública nacional", "Empresas y sociedades"} <= set(_gbx_f), "cambió la planilla de dotación del INDEC"
_gbx_c = _gbx.index[_gbx.iloc[:, 0].astype(str).str.strip().eq("Estructura organizativa")][0] + 1
_gbx_mes = {m[:3]: i + 1 for i, m in enumerate(MES)}
def _gbx_per(v):
    if isinstance(v, datetime.datetime):
        return v.strftime("%Y-%m")
    m = re.match(r"([a-z]{3})\w*-(\d{2})", str(v).strip().lower())
    return f"20{m.group(2)}-{_gbx_mes[m.group(1)]:02d}" if m else None
_gbx_p = {j: _gbx_per(_gbx.iat[_gbx_c, j]) for j in range(1, _gbx.shape[1])}
dotacion_nacion = pd.DataFrame([{"periodo": p, "total": float(_gbx.iat[_gbx_f["Total"], j]),
                                 "administracion": float(_gbx.iat[_gbx_f["Administración pública nacional"], j]),
                                 "empresas": float(_gbx.iat[_gbx_f["Empresas y sociedades"], j])} for j, p in _gbx_p.items() if p])
assert dotacion_nacion.periodo.is_unique and dotacion_nacion.periodo.is_monotonic_increasing and len(dotacion_nacion) > 30, "la dotación del INDEC vino incompleta"
_gbx_u, _gbx_0 = dotacion_nacion.iloc[-1], dotacion_nacion.iloc[0]
GBC_RES = {
    "anio": GBC_ULT, "inicio": int(_gbc.anio.min()), "cargos": float(_gbc_u.planta.sum()), "cada_1000": r1(_gbc_p),
    "top": [_gbc_o.iloc[-1].territorio, r1(_gbc_o.iloc[-1].cada_1000)], "bajo": [_gbc_o.iloc[0].territorio, r1(_gbc_o.iloc[0].cada_1000)],
    "presupuestados": list(empleo_publico_provincias[empleo_publico_provincias.presupuestados].territorio),
    "dot_mes": _mes_per(_gbx_u.periodo), "dot_desde": _mes_per(_gbx_0.periodo), "dot_total": float(_gbx_u.total), "dot_total_ini": float(_gbx_0.total),
    "dot_adm": float(_gbx_u.administracion), "dot_emp": float(_gbx_u.empresas),
    "dot_var": r1((_gbx_u.total / _gbx_0.total - 1) * 100),
}
# recursos tributarios de origen provincial (DNAP), por habitante en el último año: una provincia sin datos completos de ese año queda afuera
_gbp = pd.read_csv(CRUDO / "dnap_recaudacion_provincial.csv")
_gbp = _gbp[~_gbp.provincia.isin(["Provincias", "Total"])].copy()
_gbp["codigo_indec"] = _gbp.provincia.map(lambda n: {"c.a.b.a.": "02", "sgo. del estero": "86"}.get(norm(n), codigo(n)))
assert _gbp.codigo_indec.notna().all() and _gbp.codigo_indec.nunique() == 24, "faltan provincias en los recursos tributarios provinciales"
GBP_ULT = int(_gbp.anio.max())
_gbp_u = _gbp[_gbp.anio == GBP_ULT].set_index("codigo_indec")
GBP_FALTAN = sorted(c for c in POB if c not in _gbp_u.index or pd.isna(_gbp_u.at[c, "total"]) or _gbp_u.at[c, "total"] <= 0)
impuestos_provinciales = pd.DataFrame({"codigo_indec": sorted(POB), "territorio": [CORTO[c] for c in sorted(POB)]})
impuestos_provinciales["millones"] = impuestos_provinciales.codigo_indec.map(_gbp_u.total).where(~impuestos_provinciales.codigo_indec.isin(GBP_FALTAN))
impuestos_provinciales["por_habitante"] = impuestos_provinciales.millones * 1e6 / impuestos_provinciales.codigo_indec.map(POB)
impuestos_provinciales["pct_ingresos_brutos"] = impuestos_provinciales.codigo_indec.map(_gbp_u.ingresos_brutos) / impuestos_provinciales.millones * 100
_gbp_t = impuestos_provinciales.dropna(subset=["por_habitante"])
_gbp_pais = _gbp_t.millones.sum() * 1e6 / sum(POB[c] for c in _gbp_t.codigo_indec)
_gbp_o = _gbp_t.sort_values("por_habitante")
GBP_RES = {
    "anio": GBP_ULT, "pais": float(_gbp_pais), "faltan": [CORTO[c] for c in GBP_FALTAN],
    "top": [_gbp_o.iloc[-1].territorio, float(_gbp_o.iloc[-1].por_habitante)], "bajo": [_gbp_o.iloc[0].territorio, float(_gbp_o.iloc[0].por_habitante)],
    "iibb": r1(_gbp_t.codigo_indec.map(_gbp_u.ingresos_brutos).sum() / _gbp_t.millones.sum() * 100),
    "millones": float(_gbp_t.millones.sum()),
}
GOB_RES = {"nacion": GBN_RES, "recaudacion": GBR_RES, "deuda": GBD_RES, "empleo": GBC_RES, "provincial": GBP_RES}
agregar(cuentas_nacion.assign(periodo=cuentas_nacion.anio.astype(str), valor=cuentas_nacion.resultado_primario_pbi, codigo_indec="00", territorio="Argentina"),
        "resultado_primario_sector_publico_nacional_pct_pbi", "% del PBI", "Secretaria de Hacienda (IMIG) e INDEC")
agregar(cuentas_nacion.assign(periodo=cuentas_nacion.anio.astype(str), valor=cuentas_nacion.resultado_financiero_pbi, codigo_indec="00", territorio="Argentina"),
        "resultado_financiero_sector_publico_nacional_pct_pbi", "% del PBI", "Secretaria de Hacienda (IMIG) e INDEC")
agregar(recaudacion_anual.assign(periodo=recaudacion_anual.anio.astype(str), valor=recaudacion_anual.total_pbi, codigo_indec="00", territorio="Argentina"),
        "recaudacion_tributaria_nacional_pct_pbi", "% del PBI", "DNIAF e INDEC")
agregar(_gbd_a.assign(valor=_gbd_a.pct_pbi, codigo_indec="00", territorio="Argentina"), "deuda_bruta_administracion_central_pct_pbi", "% del PBI",
        "Secretaria de Finanzas")
agregar(empleo_publico_provincias.assign(periodo=str(GBC_ULT), valor=empleo_publico_provincias.cada_1000), "cargos_administracion_provincial_cada_1000_habitantes",
        "cargos cada 1.000 habitantes", "Direccion Nacional de Asuntos Provinciales e INDEC")
agregar(impuestos_provinciales.dropna(subset=["por_habitante"]).assign(periodo=str(GBP_ULT), valor=lambda x: x.por_habitante),
        "recursos_tributarios_provinciales_por_habitante", "pesos por habitante", "Direccion Nacional de Asuntos Provinciales e INDEC")

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
cru["madres_adolescentes"] = columna(ado_prov, f"pct_{NAC_ULT}")
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
cru["extranjeros"] = columna(nacidos_otro_pais_provincias, "pct_otro_pais")
cru["otra_provincia"] = columna(nacidos_otro_pais_provincias, "pct_otra_provincia")
cru["empleo_publico"] = columna(empleo_publico_provincias, "cada_1000")
cru["impuestos_provinciales"] = columna(impuestos_provinciales, "por_habitante")
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
cru["gas_red"] = columna(vivienda_prov, "pct_gas_red")
cru["alquila"] = columna(vivienda_prov, "pct_alquila")
cru["hacinamiento"] = columna(vivienda_prov, "pct_hacinamiento")
cru["ocupados_construccion"] = columna(vivienda_prov, "pct_ocupados_construccion")
cru["empleo_construccion"] = columna(empleo_sec, "construccion_cada_1000")
cru["regalias"] = columna(reg_prov, "pct_regalias")
cru["salario"] = columna(salarios_provincias, "salario")
cru["salario_docente"] = columna(salario_docente, "bruto")
cru["gasto_alumno"] = columna(inversion_educativa, "gasto_por_alumno")

# id: (nombre, unidad, anio, tema, fuente, ficha, decimales)
CRUCES_META = {
    "poblacion": ("Población", "habitantes", str(ANIO_POB), "Población", "INDEC, proyecciones de población 2022 a 2040", "", 0),
    "densidad": ("Densidad de población", "habitantes por km²", str(ANIO_POB), "Población", "INDEC y Ministerio de Ambiente", "", 1),
    "mortalidad_infantil": ("Mortalidad infantil", "muertes de menores de 1 año cada 1.000 nacidos vivos, promedio 3 años", f"{TRI_ACT[0]} a {TRI_ACT[1]}", "Salud", "DEIS, Ministerio de Salud", "f-mortalidad", 1),
    "madres_adolescentes": ("Maternidad adolescente", "% de los nacimientos con madres menores de 20 años", str(NAC_ULT), "Población", "DEIS, Ministerio de Salud", "f-adolescentes", 1),
    "escolarizacion": ("Escolarización secundaria", "tasa neta, %", str(ESC_FIN), "Educación", "Ministerio de Educación", "f-escolarizacion", 1),
    "aprender_mat": ("Aprender, matemática", "% de 6° grado con nivel satisfactorio o avanzado", str(meta_ap["anio"]), "Educación", "Ministerio de Educación", "f-aprender", 1),
    "aprender_len": ("Aprender, lengua", "% de 6° grado con nivel satisfactorio o avanzado", str(meta_ap["anio"]), "Educación", "Ministerio de Educación", "f-aprender", 1),
    "empleo_privado": ("Empleo privado registrado", "asalariados cada 100 habitantes", f"{MES[fin.month - 1]} de {fin.year}", "Trabajo", "SIPA", "f-empleo", 1),
    "empleo_var": ("Variación del empleo privado", "% en doce meses", f"{MES[fin.month - 1]} de {fin.year}", "Trabajo", "SIPA", "f-empleo", 1),
    "homicidios": ("Homicidios dolosos", "víctimas cada 100.000 habitantes", str(ANIO_SNIC), "Seguridad", "SNIC, Ministerio de Seguridad", "f-homicidios", 1),
    "robos": ("Robos", "hechos cada 100.000 habitantes", str(ANIO_SNIC), "Seguridad", "SNIC, Ministerio de Seguridad", "f-robos", 0),
    "salario": ("Salario promedio de los asalariados registrados privados", "pesos por mes, bruto, promedio por puesto", SAL_RES["mes"], "Trabajo",
                "OEDE, Secretaría de Trabajo (SIPA)", "f-salarios", 0),
    "salario_docente": ("Salario de un maestro de grado", "pesos por mes, bruto, con 10 años de antigüedad y jornada simple", DOC_RES["trim"], "Educación",
                        "Coordinación de Evaluación de Costos Educativos", "f-salario-docente", 0),
    "gasto_alumno": ("Inversión educativa por alumno", "pesos por alumno de gestión estatal por año", str(INV_ULT), "Educación",
                     "Coordinación de Evaluación de Costos Educativos", "f-inversion-educativa", 0),
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
    "peso_voto": ("Peso de cada habitante en el Congreso", "bancas de diputados y senadores sobre la proporción de población, 1 = proporcional", str(ANIO_POB), "Política", "Ley 22.847 y proyecciones del INDEC", "f-representacion", 2),
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
    "extranjeros": ("Nacidos en otro país", "% de la población en viviendas particulares", "2022", "Migraciones", "INDEC, Censo 2022", "f-nacidos-otro-pais", 1),
    "otra_provincia": ("Nacidos en otra provincia", "% de la población en viviendas particulares", "2022", "Migraciones", "INDEC, Censo 2022", "f-migracion-interna", 1),
    "empleo_publico": ("Cargos en la administración provincial", "cada 1.000 habitantes", str(GBC_ULT), "Gobierno", "DNAP", "f-empleo-publico", 1),
    "impuestos_provinciales": ("Impuestos provinciales", "pesos por habitante", str(GBP_ULT), "Gobierno", "DNAP", "f-impuestos-provinciales", 0),
    "gas_red": ("Hogares que cocinan con gas de red", "% de los hogares", "2022", "Energía", "INDEC, Censo 2022", "f-gas-hogares", 1),
    "alquila": ("Hogares que alquilan", "% de los hogares", "2022", "Vivienda", "INDEC, Censo 2022", "f-vivienda", 1),
    "hacinamiento": ("Hacinamiento crítico", "% de los hogares con más de tres personas por cuarto", "2022", "Vivienda", "INDEC, Censo 2022", "f-vivienda", 1),
    "ocupados_construccion": ("Personas ocupadas en la construcción", "% de las personas ocupadas, incluye el trabajo no registrado", "2022", "Construcción", "INDEC, Censo 2022", "f-trabajadores", 1),
    "empleo_construccion": ("Empleo registrado en la construcción", "asalariados privados cada 1.000 habitantes", f"{TRIM_TXT[OE_T % 10 - 1]} trimestre de {OE_T // 10}", "Construcción", "OEDE, Ministerio de Capital Humano (SIPA)", "f-empleo-construccion", 1),
    "regalias": ("Peso de las regalías", "% de los ingresos totales de la provincia (petróleo, gas, minería e hidroelectricidad)", str(ANIO_FISC), "Finanzas provinciales", "Ministerio de Economía, cuentas provinciales", "f-regalias", 1),
}

# ---------------------------------------------------------------- capitales de provincia (etapa 26)
# Censo 2022 (INDEC): las 24 capitales, cada una con su municipio (gobierno local, la Ciudad de Buenos Aires con sus 15 comunas). Las viviendas
# particulares y la población salen del cuadro del INDEC por gobierno local, y la tenencia, el hacinamiento y la ocupación de las viviendas, de
# la base por radio censal (scripts/censo_2022_capitales.py, una sola vez), con las mismas definiciones que la vivienda por provincia. Una fila
# por capital con el código de su provincia, así las banderas y el resaltado de la provincia elegida funcionan igual que en los cruces. Las
# variables del censo de las capitales no se cruzan con las de la EPH, que cubre el aglomerado (otra área) y no el municipio.
_glx = pd.ExcelFile(CRUDO / "indec_gobiernos_locales.xlsx")
_gl = pd.read_excel(_glx, [s for s in _glx.sheet_names if s != "Definiciones"][0], header=None, dtype=str)
_gl = _gl[_gl[2].fillna("").str.strip().str.fullmatch(r"\d{6}")].iloc[:, :12]
_gl.columns = ["jur", "jurisdiccion", "cod_gl", "categoria", "gobierno_local", "viviendas", "poblacion", "viv_part", "pob_viv_part",
               "viv_col", "pob_viv_col", "pob_calle"]
_gl["cod_gl"] = _gl.cod_gl.str.strip()
for c_ in ["viviendas", "poblacion", "viv_part", "pob_viv_part"]:
    _gl[c_] = pd.to_numeric(_gl[c_])
assert len(_gl) > 2000 and _gl.cod_gl.is_unique and _gl.poblacion.sum() == 45892285, (len(_gl), _gl.poblacion.sum())
_cap_c = pd.read_csv(RAIZ / "datos" / "manual" / "censo2022_capitales.csv", dtype={"codigo_indec": str, "cod_gl": str})
_glc = _gl.set_index("cod_gl")
_cap_of = pd.DataFrame([_gl[_gl.jur == "02"][["viv_part", "poblacion"]].sum() if g == "02" else _glc.loc[g, ["viv_part", "poblacion"]]
                        for g in _cap_c.cod_gl]).reset_index(drop=True)
# las viviendas de la base por radio coinciden con las del cuadro, salvo diferencias mínimas de la propia fuente (en Neuquén, 33 viviendas)
assert ((_cap_c.viviendas / _cap_of.viv_part - 1).abs() < .001).all(), _cap_c.assign(of=_cap_of.viv_part)[["capital", "viviendas", "of"]]
# la Ciudad de Buenos Aires se nombra como en los demás cruces (CABA)
capitales = pd.DataFrame({"codigo_indec": _cap_c.codigo_indec, "territorio": _cap_c.capital.where(_cap_c.codigo_indec != "02", CORTO["02"]),
                          "provincia": _cap_c.codigo_indec.map(CORTO)})
capitales["poblacion"] = _cap_of.poblacion
capitales["viviendas"] = _cap_of.viv_part
capitales["viviendas_1000"] = _cap_of.viv_part / _cap_of.poblacion * 1000
capitales["personas_hogar"] = _cap_c.personas / _cap_c.hogares
capitales["alquila"] = _cap_c.alquilada / _cap_c.hogares * 100
capitales["hacinamiento"] = _cap_c.hac_mas_3 / _cap_c.hogares * 100
capitales["sin_personas"] = _cap_c.sin_personas / _cap_c.viviendas * 100
capitales["uso_temporal"] = _cap_c.uso_temporal / _cap_c.viviendas * 100
capitales["en_departamento"] = _cap_c.departamento / _cap_c.viviendas * 100
assert len(capitales) == 24 and capitales.notna().all().all() and set(capitales.codigo_indec) == set(REGION)
# id: (nombre, unidad, anio, tema, fuente, ficha, decimales), como CRUCES_META
CAPITALES_META = {
    "poblacion": ("Población", "habitantes", "2022", "Población", "INDEC, Censo 2022", "", 0),
    "viviendas_1000": ("Viviendas cada 1.000 habitantes", "viviendas particulares cada 1.000 habitantes", "2022", "Vivienda", "INDEC, Censo 2022", "", 0),
    "personas_hogar": ("Personas por hogar", "personas en viviendas particulares por hogar", "2022", "Vivienda", "INDEC, Censo 2022", "", 2),
    "alquila": ("Hogares que alquilan", "% de los hogares", "2022", "Vivienda", "INDEC, Censo 2022", "f-vivienda", 1),
    "hacinamiento": ("Hacinamiento crítico", "% de los hogares con más de tres personas por cuarto", "2022", "Vivienda", "INDEC, Censo 2022", "f-vivienda", 1),
    "sin_personas": ("Viviendas sin personas presentes", "% de las viviendas particulares", "2022", "Vivienda", "INDEC, Censo 2022", "", 1),
    "uso_temporal": ("Viviendas de uso temporal", "% de las viviendas particulares", "2022", "Vivienda", "INDEC, Censo 2022", "f-vivienda", 1),
    "en_departamento": ("Viviendas que son departamentos", "% de las viviendas particulares", "2022", "Vivienda", "INDEC, Censo 2022", "", 1),
}
CAP_PAIS = {"viviendas_1000": r1(_gl.viv_part.sum() / _gl.poblacion.sum() * 1000)}

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
a_serie(reg_hist.rename(columns={"regalias": "valor"}), "regalias")
_oa = oe[oe.rama == "construccion"].groupby(["codigo_indec", "anio"]).valor.agg(["mean", "count"]).reset_index()
a_serie(por_hab(_oa[_oa["count"] == 4].rename(columns={"mean": "valor"})[["codigo_indec", "anio", "valor"]], 1000), "empleo_construccion")
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
    "centrales": centrales,
    "potencia_instalada": potencia.round(1),
    "gas_usuario_provincias": gas_usuario_provincias,
    "gas_usuario_serie": gas_usuario_serie,
    "gas_usuario_mensual": gas_usuario_mensual,
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
    "capitales": capitales.round(3),
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
    # petróleo y gas (etapa 18)
    "hidrocarburos_mensual": hidro_m,
    "hidrocarburos_anual": hidro_a,
    "hidrocarburos_provincias": hidro_prov,
    "hidrocarburos_empresas": hidro_emp,
    "pozos_tipo": pozos_tipo,
    "pozos_provincias": pozos_prov,
    "fracturas_anual": fracturas,
    "diseno_pozos_vm": diseno_vm,
    "pozos_terminados": pozos_term,
    "pozos_terminados_provincias": pozos_term_prov,
    "productividad_vm": productividad_vm,
    "pozos_no_convencionales": pozos_nc,
    "areas_produccion": areas_prod,
    "areas_serie": areas_serie,
    "curvas_vm": curvas_vm,
    "reservas_hidrocarburos": reservas,
    "reservas_provincias": reservas_prov,
    "regalias_provincias": reg_prov,
    "regalias_crudo_serie": regalias_serie,
    "balanza_energetica": balanza,
    "mundo_hidrocarburos": mundo_hidro,
    # construcción y vivienda (etapa 18)
    "empleo_construccion_provincias": empleo_sec,
    "empleo_construccion_serie": empleo_constr_serie,
    "isac_mensual": isac_m,
    "isac_anual": isac_anual,
    "isac_insumos": isac_insumos,
    "obra_publica_provincias": obra_publica_provincias,
    "obra_publica_serie": obra_publica_serie,
    "permisos_mensual": permisos_mensual,
    "hipotecas_mensual": hipotecas_mensual,
    "subsidios_energia": subsidios_energia,
    "combustibles_provincias": combustibles_provincias,
    "combustibles_mensual": combustibles_mensual,
    "combustibles_anual": combustibles_anual,
    "dolar_inversion_trimestral": dolar_inversion_trimestral,
    "compras_dolares_anual": compras_dolares_anual,
    "electricidad_provincias": electricidad_provincias,
    "electricidad_serie": electricidad_serie,
    "electricidad_mensual": electricidad_mensual,
    "electricidad_sectores": electricidad_sectores,
    "salarios_provincias": salarios_provincias,
    "salarios_serie": salarios_serie,
    "salario_docente": salario_docente,
    "salario_docente_serie": salario_docente_serie,
    "inversion_educativa": inversion_educativa,
    "inversion_educativa_serie": inversion_educativa_serie,
    "delitos_serie": delitos_serie,
    "delitos_tipo": delitos_tipo,
    "homicidios_provincias": homicidios_provincias,
    "robos_provincias": robos_provincias,
    "seguridad_serie_prov": seguridad_serie_prov,
    "carceles_serie": carceles_serie,
    "carceles_provincias": carceles_provincias,
    "turismo_dolar_mensual": turismo_dolar_mensual,
    "nafta_dolares_mensual": nafta_dolares_mensual,
    "nafta_dolares_anual": nafta_dolares_anual,
    "exportaciones_dolar_trimestral": exportaciones_dolar_trimestral,
    "exportaciones_cantidades_anual": exportaciones_cantidades_anual,
    "inflacion_mensual": inflacion_mensual,
    "inflacion_anual": inflacion_anual,
    "inflacion_regiones": inflacion_regiones,
    "inflacion_rubros": inflacion_rubros,
    "canasta_mensual": canasta_mensual,
    "canasta_regiones": canasta_regiones,
    "salario_real_mensual": salario_real_mensual,
    "actividad_mensual": actividad_mensual,
    "actividad_anual": actividad_anual,
    "actividad_sectores": actividad_sectores,
    "supermercados_mensual": supermercados_mensual,
    "supermercados_provincias": supermercados_provincias,
    "nacidos_otro_pais_provincias": nacidos_otro_pais_provincias,
    "nacidos_otro_pais_paises": nacidos_otro_pais_paises,
    "migraciones_departamentos": migraciones_departamentos,
    "refugio_solicitudes": refugio_solicitudes,
    "refugio_nacionalidades": refugio_nacionalidades,
    "refugio_acnur": refugio_acnur,
    "migracion_censos": migracion_censos,
    "radicaciones_anual": radicaciones_anual,
    "radicaciones_nacionalidad": radicaciones_nacionalidad,
    "argentinos_exterior": argentinos_exterior,
    "argentinos_exterior_destinos": argentinos_exterior_destinos,
    "cuentas_nacion": cuentas_nacion,
    "gasto_nacion_tipo": gasto_nacion_tipo,
    "recaudacion_anual": recaudacion_anual,
    "recaudacion_impuestos": recaudacion_impuestos,
    "deuda_pbi": deuda_pbi,
    "empleo_publico_provincias": empleo_publico_provincias,
    "dotacion_nacion": dotacion_nacion,
    "impuestos_provinciales": impuestos_provinciales,
    "costo_construccion": costo,
    "costo_anual": costo_anual,
    "vivienda_provincias": vivienda_prov,
    "vivienda_departamentos": vivienda_dep,
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
        "anio_ini": int(a05.anio), "anio_ult": int(a25.anio), "pct_res_ini": r1(a05.pct_residencial), "pct_res_ult": r1(a25.pct_residencial),
        "crec_res": r1((a25.residencial / a05.residencial - 1) * 100),
        "crec_resto": r1((a25.resto / a05.resto - 1) * 100),
        "crec_total": r1((a25.total / a05.total - 1) * 100),
        "crec_emae": r1((a25.emae / a05.emae - 1) * 100),
        "gwh_ult": round(float(a25.total)), "meses_desde": ULT_E - 2, "meses_hasta": ULT_E,
        "mes_max": MES[int(perfil.loc[perfil.gwh.idxmax(), "mes"]) - 1],
        "mes_min": MES[int(perfil.loc[perfil.gwh.idxmin(), "mes"]) - 1],
        "dif_max_min": r1((perfil.gwh.max() / perfil.gwh.min() - 1) * 100),
        "ultimo_mes": f"{MES[ult.indice_tiempo.month - 1]} de {ult.indice_tiempo.year}",
        # centrales eléctricas (listado de la Secretaría de Energía) y potencia instalada del país (CAMMESA)
        "cen_fecha": f"{MES[int(CEN_FECHA[5:7]) - 1]} de {CEN_FECHA[:4]}", "cen_n": int(len(centrales)), "cen_tec": {k: int(v) for k, v in _cn.items()},
        "cen_sin_pot": int(centrales.potencia_mw.isna().sum()), "cen_mem_sin_pot": int((centrales.potencia_mw.isna() & centrales.sistema.eq("Interconectado MEM")).sum()),
        "cen_top_eol": [_cen_top["Eólica"].index[0], int(_cen_top["Eólica"].iloc[0])], "cen_top_sol": [_cen_top["Solar"].index[0], int(_cen_top["Solar"].iloc[0])],
        "pot_anio": int(POT_U.anio), "pot_desde": int(potencia.anio.min()), "pot_total": round(float(POT_U.total)), "pot_ini": int(POT_I.anio),
        "pot_pct": {k: r1(POT_U[k] / POT_U.total * 100) for k in ("termica", "hidraulica", "nuclear", "eolica", "solar", "biogas")},
        "pot_renov_ini": round(float(POT_I.eolica + POT_I.solar)), "pot_renov_ult": round(float(POT_U.eolica + POT_U.solar)),
        "pot_pct_renov_ini": r1((POT_I.eolica + POT_I.solar) / POT_I.total * 100), "pot_pct_renov_ult": r1((POT_U.eolica + POT_U.solar) / POT_U.total * 100),
        # consumo de gas por usuario residencial (ENARGAS) y la referencia de Gran Bretaña
        **GAS_RES,
        # subsidios económicos a la energía (Secretaría de Hacienda)
        **SUB_RES,
        # consumo eléctrico de los hogares por provincia (CAMMESA)
        **ELEC_RES,
        # demanda eléctrica de comercios e industrias por provincia (CAMMESA, etapa 23)
        **ELS_RES,
    },
    "nacimientos": {
        "anio_ini": int(nac_df.iloc[0].anio), "anio_ult": int(n24.anio),
        "anio_pico": int(pico.anio), "pico": int(pico.nacimientos), "n_ult": int(n24.nacimientos),
        "caida": r1((n24.nacimientos / pico.nacimientos - 1) * 100),
        "ado_pico": int(ado_pico.madres_menores_20), "ado_anio_pico": int(ado_pico.anio),
        "ado_ult": int(n24.madres_menores_20),
        "ado_caida": r1((n24.madres_menores_20 / ado_pico.madres_menores_20 - 1) * 100),
        "pct_ini": r1(nac_df.iloc[0].pct_madres_menores_20), "pct_ult": r1(n24.pct_madres_menores_20),
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
        "serie_ini": int(tasa_sui.anio.min()), "sat_desde": int(sat.anio.min()), "sat_hasta": int(sat.anio.max()),
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
resumen["elecciones_ult"] = max(x["anio"] for x in el_meta)   # el título de la ficha de elecciones
resumen["anio_pob"] = ANIO_POB   # año de la población de las tasas por habitante (notas y títulos)
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
    "xt_top_v": r1(extranjeros.cada_100.max()), "xt_origen": list(top_origen.index[:3]), "xt_corte": RENAPER_CORTE,
}
# petróleo y gas, y construcción y vivienda (etapa 18): todo lo que dicen los textos, sin años escritos a mano
mes_txt = lambda p: f"{MES[int(str(p)[5:7]) - 1]} de {str(p)[:4]}"
_hp = hidro_prov.set_index("codigo_indec")
_top_p = hidro_prov.sort_values("pet_kbd").iloc[-1]
_top_g = hidro_prov.sort_values("gas_mmm3d").iloc[-1]
_prov_prod = hidro_prov[hidro_prov.codigo_indec != MAR]
_def = balanza[balanza.saldo < 0]
_rp_ult = reg_prov[reg_prov.anio_aif == ANIO_FISC].sort_values("pct_regalias")
_reg_hab = reg_prov.sort_values("usd_crudo_hab").iloc[-1]
_ep = empleo_sec.dropna(subset=["petroleo_gas"]).sort_values("petroleo_gas").iloc[-1]
_ec = empleo_sec.sort_values("construccion_cada_1000")
_ins = isac_insumos.sort_values("var_12m")
_vp = vivienda_prov.set_index("codigo_indec")
_t_txt = lambda t: f"{TRIM_TXT[int(t) % 10 - 1]} trimestre de {int(t) // 10}"
resumen["petroleo"] = {
    "mes": mes_txt(HM_ULT.periodo), "anio_mes": int(HM_ULT.anio), "kbd": round(float(HM_ULT.pet_total)), "gas": r1(HM_ULT.gas_total),
    "pct_shale": r1(HM_ULT.pet_shale / HM_ULT.pet_total * 100), "pct_nc": r1(HM_ULT.pct_pet_nc), "pct_gas_nc": r1(HM_ULT.pct_gas_nc),
    "record": bool(HM_ULT.pet_total >= hidro_m.pet_total.max()), "max_mes": mes_txt(hidro_m.loc[hidro_m.pet_total.idxmax()].periodo),
    "max_previo_mes": mes_txt(_max_previo.periodo), "max_previo_kbd": round(float(_max_previo.pet_total)),
    "anio_ini": int(HA_INI.anio), "anio_ult": int(HA_ULT.anio), "kbd_ini": round(float(HA_INI.pet_total)), "kbd_ult": round(float(HA_ULT.pet_total)),
    "kbd_min": round(float(_ha_min_p.pet_total)), "anio_min": int(_ha_min_p.anio),
    "gas_ini": r1(HA_INI.gas_total), "gas_ult": r1(HA_ULT.gas_total), "gas_min": r1(_ha_min_g.gas_total), "anio_min_gas": int(_ha_min_g.anio),
    "pct_nc_ult": r1(HA_ULT.pct_pet_nc), "pct_gas_nc_ult": r1(HA_ULT.pct_gas_nc),
    "neuquina_pct": r1(HM_ULT.pet_neuquina / HM_ULT.pet_total * 100), "neuquina_gas_pct": r1(HM_ULT.gas_neuquina / HM_ULT.gas_total * 100),
    "ytd": YTD_H, "bbl": round(BBL, 2),
    "cuencas_pet": {k: r1(HM_ULT[f"pet_{k}"] / HM_ULT.pet_total * 100) for k in CUENCAS}, "cuencas_gas": {k: r1(HM_ULT[f"gas_{k}"] / HM_ULT.gas_total * 100) for k in CUENCAS},
    # provincias, Vaca Muerta y empresas: los doce meses completos más recientes del archivo agrupado
    "v_desde": mes_txt(VENTANA[0]), "v_hasta": mes_txt(VENTANA[-1]), "v_desde_p": VENTANA[0], "v_hasta_p": VENTANA[-1], "v10_desde": mes_txt(VENTANA_10[0]), "v10_hasta": mes_txt(VENTANA_10[-1]),
    "n_prov": int(((_prov_prod.pet_kbd + _prov_prod.gas_mmm3d) > .05).sum()),
    "top": _top_p.territorio, "top_pct": r1(_top_p.pct_pet_pais), "top_gas": _top_g.territorio, "top_gas_pct": r1(_top_g.pct_gas_pais),
    "top_kbd": round(float(_top_p.pet_kbd)), "top_antes": round(float(_top_p.pet_kbd_antes)),
    "segundo": _prov_prod.sort_values("pet_kbd").iloc[-2].territorio, "segundo_kbd": round(float(_prov_prod.sort_values("pet_kbd").iloc[-2].pet_kbd)),
    "segundo_antes": round(float(_prov_prod.sort_values("pet_kbd").iloc[-2].pet_kbd_antes)),
    "mar_gas_pct": r1(_hp.pct_gas_pais.get(MAR, 0)), "vm_kbd": round(_vm_kbd), "vm_pct": r1(_vm_kbd / hidro_prov.pet_kbd.sum() * 100),
    "emp_top": hidro_emp.iloc[0].nombre, "emp_top_pct": r1(hidro_emp.iloc[0].pct_pet),
    "emp_top_gas": hidro_emp[hidro_emp.nombre != "Otras empresas"].sort_values("pct_gas").iloc[-1].nombre,
    "emp_top_gas_pct": r1(hidro_emp[hidro_emp.nombre != "Otras empresas"].pct_gas.max()), "n_empresas": _n_emp_pet,
    "emp_n": int(len(hidro_emp) - 1), "emp_resto_pct": r1(hidro_emp.iloc[-1].pct_pet),
    # pozos: el último mes completo de los archivos por pozo
    "pozos_mes": mes_txt(PO_ULT), "pozos": int(pozos_tipo.pozos.sum()), "pozos_conv": int(_pt.pozos["convencional"]), "pozos_shale": int(_pt.pozos["shale"]),
    "pozos_tight": int(_pt.pozos["tight"]), "pct_pozos_shale": r1(_pt.pct_pozos["shale"]), "pct_pet_shale_pozos": r1(_pt.pct_pet["shale"]),
    "bpd_conv": r1(_pt.bpd_pozo_pet["convencional"]), "bpd_shale": round(float(_pt.bpd_pozo_pet["shale"])),
    "veces": round(float(_pt.m3d_pozo_pet["shale"] / _pt.m3d_pozo_pet["convencional"])),
    "pozos_top": pozos_prov.iloc[0].territorio, "pozos_top_n": int(pozos_prov.iloc[0].total),
    # fracturas (Adjunto IV): años completos de formaciones no convencionales, y el diseño de los pozos de Vaca Muerta
    "fr_ini": FR_INI, "fr_ult": FR_ULT, "fr_etapas": int(FR_U.etapas), "fr_etapas_ant": int(FR_A.etapas), "fr_etapas_ini": int(fracturas.etapas.iloc[0]),
    "fr_var": r1((FR_U.etapas / FR_A.etapas - 1) * 100), "fr_veces": round(float(FR_U.etapas / fracturas.etapas.iloc[0])),
    "fr_vm_pct": r1(FR_U.etapas_vm / FR_U.etapas * 100), "fr_pozos": int(FR_U.pozos), "fr_arena_mt": r1(FR_U.arena_tn / 1e6),
    "fr_record": bool(FR_U.etapas >= fracturas.etapas.max()),
    "dv_ini": DV_INI, "dv_rama_ini": round(float(_dv.rama_m[DV_INI])), "dv_rama_ult": round(float(_dv.rama_m[FR_ULT])),
    "dv_etapas_ini": r1(_dv.etapas_pozo[DV_INI]), "dv_etapas_ult": r1(_dv.etapas_pozo[FR_ULT]), "dv_arena_ini": round(float(_dv.arena_pozo_tn[DV_INI])),
    "dv_arena_ult": round(float(_dv.arena_pozo_tn[FR_ULT])), "dv_pozos_ult": int(_dv.pozos[FR_ULT]),
    # pozos terminados: años completos y, por provincia, los doce meses más recientes
    "pt_anio": PT_ULT, "pt_ini": int(pozos_term.anio.min()), "pt_total": int(_ptu.total), "pt_explot": int(_ptu.explotacion),
    "pt_explor": int(_ptu.exploracion + _ptu.avanzada), "pt_max": int(_pt_max.total), "pt_max_anio": int(_pt_max.anio),
    "pt_mes": mes_txt(PT_ULT_M), "pt_v_desde": mes_txt(_v12[0]), "pt_12m": int(pt_[pt_.periodo.isin(_v12)].cantidad_pozos.sum()),
    "pt_12m_ant": int(pt_[pt_.periodo.isin(_v12a)].cantidad_pozos.sum()), "pt_top": pozos_term_prov.iloc[0].territorio,
    "pt_top_n": int(pozos_term_prov.iloc[0].total), "pt_top_pct": r1(pozos_term_prov.iloc[0].pct), "pt_n_prov": int(len(pozos_term_prov)),
    # productividad de los pozos petrolíferos de shale de Vaca Muerta por año de inicio (años completos)
    "cos_ini": COS_INI, "cos_ult": COS_ULT, "cos_kbbl_ini": r1(_pvd.pet_12m_kbbl[COS_INI]), "cos_kbbl_ult": r1(_pvd.pet_12m_kbbl[COS_ULT]),
    "cos_veces": r1(_pvd.pet_12m_kbbl[COS_ULT] / _pvd.pet_12m_kbbl[COS_INI]), "cos_pozos_ult": int(_pvd.pozos[COS_ULT]),
    "cos_max": int(_pvd.pet_12m_kbbl.idxmax()), "cos_kbbl_max": r1(_pvd.pet_12m_kbbl.max()), "cos_ult_nc": str(_ult_nc),
    "rama_desde": RAMA_DESDE, "bpm_ult": round(float(_pvd_m.bbl_por_1000m[COS_ULT])), "bpm_max": round(float(_pvd_m.bbl_por_1000m.max())),
    "bpm_max_anio": int(_pvd_m.bbl_por_1000m.idxmax()), "bpm_var": r1((_pvd_m.bbl_por_1000m[COS_ULT] / _pvd_m.bbl_por_1000m.max() - 1) * 100),
    "rama_m_ult": round(float(_pvd_m.rama_m[COS_ULT])), "rama_m_bpm_max": round(float(_pvd_m.rama_m[_pvd_m.bbl_por_1000m.idxmax()])),
    "curvas": COS_CURVAS, "curva12_ult": r1(_cv[f"c{COS_ULT}"][12]), "curva12_ini": r1(_cv[f"c{COS_CURVAS[0]}"][12]),
    # mapa de los pozos no convencionales y de las áreas de concesión
    "map_n": int(len(pozos_nc)), "map_activos": int(_activo.sum()), "map_mes": mes_txt(str(_ult_nc)), "map_pct_nq": r1(_act_nq.mean() * 100),
    "map_top_areas": [[a, int(n)] for a, n in _top_areas.items()], "map_cortes": MAP_CORTES, "map_ini": int(pozos_nc.inicio.str[:4].astype(int).min()),
    "map_otras": [[CORTO[c], int(n)] for c, n in pozos_nc[_activo].provincia.map(lambda t: codigo(t)).value_counts().items() if c not in ("58", "62", "50", "42")],
    "map_shale": int((pozos_nc[_activo].recurso == "Shale").sum()), "map_tight": int((pozos_nc[_activo].recurso == "Tight").sum()), "areas_anio": AREAS_ANIO,
    # reservas
    "res_anio": int(RV_ULT.anio), "res_ini": int(RV_INI.anio), "res_pet": round(float(RV_ULT.pet_millones_m3)), "res_bbl": r1(RV_ULT.pet_miles_millones_bbl),
    "res_gas": round(float(RV_ULT.gas_miles_millones_m3)), "res_hor_pet": r1(RV_ULT.horizonte_pet), "res_hor_gas": r1(RV_ULT.horizonte_gas),
    "res_pet_ini": round(float(RV_INI.pet_millones_m3)), "res_gas_ini": round(float(RV_INI.gas_miles_millones_m3)),
    "res_hor_pet_ini": r1(RV_INI.horizonte_pet), "res_hor_gas_ini": r1(RV_INI.horizonte_gas),
    "res_var_pet": r1((RV_ULT.pet_millones_m3 / reservas.iloc[-2].pet_millones_m3 - 1) * 100), "res_anio_ant": int(reservas.iloc[-2].anio),
    "res_nc_pet": r1(RV_ULT.pct_pet_nc), "res_nc_gas": r1(RV_ULT.pct_gas_nc),
    "res_nq_pet": r1(reservas_prov.set_index("codigo_indec").pct_pet.get("58", 0)), "res_nq_gas": r1(reservas_prov.set_index("codigo_indec").pct_gas.get("58", 0)),
    # regalías
    "reg_anio": ANIO_FISC, "reg_top": _rp_ult.iloc[-1].territorio, "reg_top_pct": r1(_rp_ult.iloc[-1].pct_regalias),
    "reg_n_10": int((reg_prov.pct_regalias >= 10).sum()), "reg_n_1": int((reg_prov.pct_regalias >= 1).sum()),
    "reg_atrasadas": {CORTO[c]: int(a) for c, a in zip(reg_prov.codigo_indec, reg_prov.anio_aif) if a < ANIO_FISC},
    "reg_usd_anio": REG_ULT, "reg_usd_total": round(float(reg_prov.usd_crudo_millones.sum() + _reg_mar)), "reg_usd_mar": round(_reg_mar, 1),
    "reg_usd_top": _reg_hab.territorio, "reg_usd_top_hab": round(float(_reg_hab.usd_crudo_hab)),
    "reg_usd_ini": int(regalias_serie.anio.min()), "reg_usd_max": round(float(regalias_serie.usd_crudo_millones.max())),
    "reg_usd_max_anio": int(regalias_serie.loc[regalias_serie.usd_crudo_millones.idxmax()].anio),
    # comercio exterior de energía
    "bal_ini": int(balanza.anio.min()), "bal_anio": int(BA_ULT.anio), "bal_expo": round(float(BA_ULT.exportaciones)), "bal_impo": round(float(BA_ULT.importaciones)),
    "bal_saldo": round(float(BA_ULT.saldo)), "bal_def_desde": int(_def.anio.min()) if len(_def) else None, "bal_def_hasta": int(_def.anio.max()) if len(_def) else None,
    "bal_def_n": int(len(_def)), "bal_def_max": round(float(-_def.saldo.min())) if len(_def) else None, "bal_def_max_anio": int(_def.loc[_def.saldo.idxmin()].anio) if len(_def) else None,
    "bal_ytd": _bal_ytd, "bal_ytd_expo": YTD_BAL["expo"], "bal_ytd_impo": YTD_BAL["impo"],
    # el mundo
    "mundo": MUNDO,
    **AR_RES,  # producción por área de concesión
}
resumen["combustibles"] = CB_RES  # precios de los combustibles en el surtidor (etapa 21)
resumen["dolar"] = DOL_RES  # artículo del dólar, la inversión y la construcción (etapa 22)
resumen["salarios"] = SAL_RES  # salarios de los asalariados registrados privados por provincia (etapa 23)
resumen["docentes"] = DOC_RES  # salario de un maestro de grado por provincia (etapa 23)
resumen["inversion_edu"] = INV_RES  # inversión en educación por alumno y por provincia (etapa 23)
resumen["seguridad"] = SEG_RES  # delitos (SNIC) y personas privadas de libertad (SNEEP), etapa 23
resumen["turismo_dolar"] = TU_RES  # artículo del turismo y el dólar (etapa 24)
resumen["nafta_dolares"] = NF_RES  # artículo de la nafta en dólares y el petróleo (etapa 24)
resumen["exportaciones_dolar"] = XD_RES  # artículo de las exportaciones y el dólar (etapa 24)
resumen["economia"] = ECO_RES  # sección Economía y precios (etapa 25)
resumen["migraciones"] = MG_RES  # sección Migraciones (etapa 25)
resumen["gobierno"] = GOB_RES  # sección Gobierno (etapa 25)
resumen["construccion"] = {
    "isac_mes": mes_txt(IS_ULT.periodo), "isac_anio": int(str(IS_ULT.periodo)[:4]), "isac_var": r1(IS_ULT.var_interanual), "isac_desest": r1(IS_ULT.desestacionalizada),
    "isac_max_mes": mes_txt(_is_max.periodo), "isac_max": r1(_is_max.desestacionalizada),
    "isac_dif_max": r1((IS_ULT.desestacionalizada / _is_max.desestacionalizada - 1) * 100), "isac_ytd": YTD_IS,
    # sin estacionalidad: el mes contra el anterior y, como la ONS, los tres últimos meses contra los tres anteriores (un solo mes mueve mucho)
    "isac_mes_desest": r1((IS_ULT.desestacionalizada / isac_m.desestacionalizada.iloc[-2] - 1) * 100),
    "isac_3m": r1((isac_m.desestacionalizada.iloc[-3:].mean() / isac_m.desestacionalizada.iloc[-6:-3].mean() - 1) * 100),
    "isac_3m_desde": MES[int(isac_m.periodo.iloc[-3][5:7]) - 1] + ("" if isac_m.periodo.iloc[-3][:4] == str(IS_ULT.periodo)[:4] else " de " + isac_m.periodo.iloc[-3][:4]),
    "isac_ini": str(isac_m.periodo.iloc[0])[:4], "isac_anio_ult": int(isac_anual.anio.max()),
    "isac_anual_ult": r1(isac_anual.isac.iloc[-1]), "isac_anual_ant": r1(isac_anual.isac.iloc[-2]),
    "isac_anual_min": int(isac_anual.loc[isac_anual.isac.idxmin()].anio), "isac_anual_max": int(isac_anual.loc[isac_anual.isac.idxmax()].anio),
    "ins_mes": mes_txt(INS_ULT.strftime("%Y-%m")), "ins_n": int(len(isac_insumos)), "ins_suben": int((isac_insumos.var_12m > 0).sum()),
    "ins_top": _ins.iloc[-1].territorio, "ins_top_v": r1(_ins.iloc[-1].var_12m), "ins_low": _ins.iloc[0].territorio, "ins_low_v": r1(_ins.iloc[0].var_12m),
    "cemento_12m": r1(isac_insumos.set_index("codigo_indec").var_12m.get("cemento_portland")),
    "emp_trim": _t_txt(OE_T), "emp_trim_ant": _t_txt(OE_ANT), "emp_total": int(_ec_u.construccion), "emp_var": r1((_ec_u.construccion / _ec_a.construccion - 1) * 100),
    "emp_max": int(_ec_max.construccion), "emp_max_trim": _t_txt(int(_ec_max.anio) * 10 + int(_ec_max.trimestre)),
    "emp_pct": r1(_ec_u.construccion / _ec_u.total * 100), "emp_cada_1000": r1(_ec_u.construccion / POB_PAIS * 1000),
    "emp_ini": int(empleo_constr_serie.anio.min()),
    "emp_top": _ec.iloc[-1].territorio, "emp_top_v": r1(_ec.iloc[-1].construccion_cada_1000),
    "emp_low": _ec.iloc[0].territorio, "emp_low_v": r1(_ec.iloc[0].construccion_cada_1000),
    "emp_suben": int((empleo_sec.var_construccion > 0).sum()),
    "pet_emp": int(_ec_u.petroleo_gas), "pet_emp_var": r1(PET_EMP_VAR),
    "pet_emp_top": _ep.territorio, "pet_emp_top_v": int(_ep.petroleo_gas),
    "costo_mes": mes_txt(CO_ULT.periodo), "costo_desde": mes_txt(costo.periodo.iloc[0]),
    "icc_12": r1((CO_ULT.icc / CO_12.icc - 1) * 100), "ipc_12": r1((CO_ULT.ipc / CO_12.ipc - 1) * 100),
    "mat_12": r1((CO_ULT.materiales / CO_12.materiales - 1) * 100), "mo_12": r1((CO_ULT.mano_obra / CO_12.mano_obra - 1) * 100),
    "icc_real": r1(CO_ULT.icc_real - 100), "mat_real": r1(CO_ULT.materiales_real - 100), "mo_real": r1(CO_ULT.mano_obra_real - 100),
    "viv": {k: r1(v) for k, v in VIV_PAIS.items() if k not in ("hogares", "viviendas")},
    "viv_top": {k: [vivienda_prov.sort_values(k).iloc[-1].territorio, r1(vivienda_prov[k].max())] for k in vivienda_prov.columns if k.startswith(("pct_", "construccion_"))},
    "viv_low": {k: [vivienda_prov.sort_values(k).iloc[0].territorio, r1(vivienda_prov[k].min())] for k in vivienda_prov.columns if k.startswith(("pct_", "construccion_"))},
    "viv_abs": VIV_ABS,
    "gas_nea": [CORTO[c] for c in _vp[_vp.pct_gas_red < 5].index], "gas_nea_max": r1(_vp[_vp.pct_gas_red < 5].pct_gas_red.max()) if (_vp.pct_gas_red < 5).any() else None,
    "gas_mas_90": [CORTO[c] for c in _vp[_vp.pct_gas_red >= 85].index],
    **OP_RES,  # obra pública de la Nación por provincia
    **PER_RES, **HIP_RES,  # permisos de edificación y créditos hipotecarios UVA
}
resumen["cruces"] = [{"id": k, "nombre": v[0], "unidad": v[1], "periodo": v[2], "tema": v[3], "fuente": v[4], "ficha": v[5], "dec": v[6]}
                     for k, v in CRUCES_META.items()]
assert all(m["id"] in cru.columns for m in resumen["cruces"])
resumen["capitales"] = [{"id": k, "nombre": v[0], "unidad": v[1], "periodo": v[2], "tema": v[3], "fuente": v[4], "ficha": v[5], "dec": v[6]}
                        for k, v in CAPITALES_META.items()]
assert all(m["id"] in capitales.columns for m in resumen["capitales"])
resumen["capitales_pais"] = CAP_PAIS
resumen["cruces_series"] = {k: [int(cruces_series[cruces_series.id == k].anio.min()), int(cruces_series[cruces_series.id == k].anio.max())] for k in SERIES_IDS}

(SITIO / "fichas.json").write_text(json.dumps({
    "resumen": resumen,
    # las tablas que solo se usan al abrir un bloque se cargan aparte desde su CSV
    "datos": {k: json.loads(t.to_json(orient="records")) for k, t in tablas.items() if k not in {"ocde_comparacion"}},
}, ensure_ascii=False), encoding="utf-8")
print(json.dumps(resumen, ensure_ascii=False, indent=1))
