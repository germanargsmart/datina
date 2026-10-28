"""
Pruebas automáticas de los datos (octubre de 2026, pedido del autor). Corren después de 02_procesar.py y antes de armar el
sitio: 03_construir_sitio.py las llama al empezar y la actualización mensual las corre como un paso propio. Si alguna falla,
el sitio no se arma ni se publica.

Qué revisan:
  1. Sumas de control: bancas de cada período del Congreso, votos de cada elección y provincia, provincias que suman el total.
  2. Tasas y porcentajes fuera de rango (mayores a 100 o negativos).
  3. Meses o años faltantes en cada serie.
  4. Valores a más de cinco veces la mediana de su indicador entre las 24 jurisdicciones.
  5. Indicadores con más de una fuente y diferencia mayor al 2%.
  6. Mandatos presidenciales sin huecos ni superposiciones.
  7. La Corte Suprema (etapa 33): jueces en funciones contra los que fija la ley, fechas, superposiciones y quién designó a cada uno.
  8. Errores que ya pasaron (plan del 26 de octubre de 2026, docs/roadmap/PLAN_MEJORA.md), para que no vuelvan: un bloque con el
     nombre de una provincia con legisladores de otra (E1), un total de empresas del país que suma las provincias (E2). El total de motos sin las jurisdicciones excluidas (E3) va en
     las sumas de control. Los pozos no convencionales del mismo mes, iguales en la ficha de pozos y en el mapa (E13). El valor del país de los
     recursos propios provinciales, que no puede ser la mediana. El país de nacimiento que es el primero en más jurisdicciones (E13, 27 de
     octubre de 2026), que el texto dice cuando no es el más frecuente del total.
     Una jurisdicción con otro año que el de su ficha (E12): rotulada y fuera de la mediana.
     Las diferencias y los conteos de un texto, con las cifras que se muestran (R12).
  9. Unidades conocidas (R14 y T13): cada unidad de la tabla larga, una de las conocidas, y unidades y fuentes con sus tildes.

Lo que está explicado se acepta, con su motivo, en ACEPTADAS (y los casos distorsionados por el lugar de registro, en
datos/manual/distorsiones.json, que también usan los textos). Un hallazgo nuevo sin motivo hace fallar las pruebas.
Uso: python scripts/pruebas_datos.py   (sale con código 1 si alguna prueba falla)
"""
import json, pathlib, statistics, sys
import pandas as pd

RAIZ = pathlib.Path(__file__).resolve().parents[1]
SITIO, CRUDO, MANUAL = RAIZ / "sitio", RAIZ / "datos" / "crudo", RAIZ / "datos" / "manual"
PROV24 = [f"{c:02d}" for c in (2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62, 66, 70, 74, 78, 82, 86, 90, 94)]

# Hallazgos explicados: clave -> motivo. La clave es la que imprime cada prueba.
ACEPTADAS = {
    "bancas|Diputados|2013": "el 1 de marzo de 2014 había tres bancas vacantes: los reemplazos (entre ellos el de Jorge Obeid, que murió en enero) juraron el 3 de abril",
    "rango|tasa_neta_escolarizacion_secundaria|42": "desde el cambio de denominador la matrícula de La Pampa supera a la proyección de población: la ficha lo explica y el valor no entra en el texto de máximo",
    "rango|bm_secundaria|00": "es una tasa bruta de finalización del ciclo básico: por definición puede pasar de 100",
    "rango|inflacion_esperada_12m_mediana|00": "real: es la inflación que se espera para un año y puede pasar de 100% (la mediana de las respuestas fue 150% a fines de 2023, según la Di Tella)",
    "rango|resultado_primario_sector_publico_nacional_pct_pbi|00": "real: un déficit es un resultado negativo (Secretaría de Hacienda)",
    "rango|resultado_financiero_sector_publico_nacional_pct_pbi|00": "real: un déficit es un resultado negativo (Secretaría de Hacienda)",
    "rango|deuda_bruta_administracion_central_pct_pbi|00": "real: la deuda puede superar el PBI de un año, como publica la Secretaría de Finanzas",
    "rango|deuda_pbi.pct_pbi|": "real: la deuda puede superar el PBI de un año, como publica la Secretaría de Finanzas",
    "faltan|bm_gini|00": "el Banco Mundial no tiene 2015: ese año el INDEC no publicó la EPH",
    "faltan|nacidos_en_argentina_en_otro_pais|00": "las Naciones Unidas estiman cada cinco años, de 1990 a 2020, y en 2024",
    "faltan|bm_pobreza_relativa|00": "ídem",
    "faltan|bm_internet|00": "el Banco Mundial no tiene dato de 1991",
    "faltan|tarjetas_sube_dia_habil_mediana|00": "la fuente no publica ningún día de esos meses: el gráfico deja el hueco y la nota lo dice",
    "faltan|reservas_netas_bcra|00": "en algunos meses la planilla de reservas del BCRA no está publicada o no se pudo leer la sección de lo que hay que pagar a un año (sobre todo en 2007): el gráfico corta la línea en esos meses y la nota lo dice",
    "mediana|turistas_extranjeros_provincias.cada_1000|02": "la Encuesta de Turismo Internacional solo cuenta a quienes salen por Ezeiza y Aeroparque: favorece a la Ciudad y a los destinos con vuelos internacionales (lo dice la nota)",
    "mediana|turistas_extranjeros_provincias.cada_1000|54": "ídem", "mediana|turistas_extranjeros_provincias.cada_1000|62": "ídem",
    "mediana|turistas_extranjeros_provincias.cada_1000|78": "ídem", "mediana|turistas_extranjeros_provincias.cada_1000|94": "ídem",
    "mediana|electricidad_industrial_por_habitante.valor|26": "real: casi toda la demanda industrial de Chubut es de grandes usuarios del mercado mayorista que CAMMESA registra en la provincia (lo dice la nota)",
    "mediana|cruces_provincias.densidad|02": "la Ciudad es un distrito urbano: su densidad es real", "mediana|cruces_provincias.densidad|06": "real: incluye el conurbano",
    "mediana|cruces_provincias.densidad|90": "real: Tucumán es la provincia más chica del continente",
    "mediana|exportaciones_provincias.usd_por_habitante|58": "real: petróleo y gas de Vaca Muerta", "mediana|exportaciones_provincias.usd_por_habitante|78": "real: minería y petróleo",
    "mediana|exportaciones_usd_por_habitante.valor|58": "ídem", "mediana|exportaciones_usd_por_habitante.valor|78": "ídem",
    "mediana|extranjeros_provincias.cada_100|02": "real: la Ciudad concentra a la población migrante",
    "mediana|poblacion_nacida_en_otro_pais.valor|02": "real: la Ciudad concentra a la población migrante (Censo 2022, como en el RENAPER)",
    "mediana|representacion_provincias.hab_por_senador|06": "real: tres senadores por provincia sin importar la población",
    "mediana|transferencias_acumulado.otras_hab|78": "real: lo muestra la ficha de transferencias", "mediana|transferencias_acumulado.ley_hab|94": "real: Tierra del Fuego recibe coparticipación por ley propia",
    "mediana|transferencias_acumulado.atn_pct|06": "real: Buenos Aires concentra los ATN y la población", "mediana|transferencias_acumulado.pob_pct|06": "real: es la provincia más poblada",
    "mediana|ministros_provincias.por_millon|02": "real: muchos ministros nacieron en la Ciudad (lo explica la ficha)",
    "fuentes|mortalidad_infantil": "la comparación con la OCDE usa la estimación armonizada del grupo interinstitucional de las Naciones Unidas, rotulada como estimación con su año; el dato principal es el de la DEIS",
    "fuentes|esperanza_vida|2022": "la comparación con la OCDE usa la estimación de la División de Población de las Naciones Unidas, rotulada como estimación; el dato principal es el del INDEC",
    "fuentes|protegida|2025": "miden cosas distintas: la base mundial no cuenta dos veces las superposiciones y el CIAM suma cada designación (lo explican las dos notas)",
    # petróleo, gas, construcción y vivienda (etapa 18, octubre de 2026)
    **{f"mediana|{k}|{c}": "real: regalías de petróleo y gas (y de minería e hidroelectricidad, que la ficha también cuenta)"
       for k in ("regalias_provincias.pct_regalias", "regalias_pct_ingresos.valor") for c in ("26", "50", "58", "62", "78")},
    **{f"mediana|{k}|58": "real: el empleo en obras ligadas a Vaca Muerta (el SIPA lo asigna a la provincia del empleador)"
       for k in ("empleo_construccion_provincias.construccion_cada_1000", "empleo_construccion_cada_1000_hab.valor")},
    "mediana|vivienda_provincias.pct_electricidad|02": "real: en la Ciudad muchos departamentos cocinan con electricidad",
    **{f"mediana|vivienda_provincias.pct_lena|{c}": "real: provincias con poca o ninguna red de gas, donde se cocina con leña o carbón"
       for c in ("18", "22", "34", "54", "66", "86")},
    "mediana|vivienda_provincias.pct_materiales_4|70": "real: en San Juan es común el techo de caña o tabla con barro, que el Censo clasifica en la calidad más baja (lo dice la nota)",
    "mediana|gas_consumo_usuario_residencial.valor|94": "real: el invierno más largo y frío del país, con la tarifa diferencial de zona fría (lo dicen la nota y Para entender los datos)",
    "mediana|gas_consumo_usuario_residencial.valor|78": "ídem",
    "mediana|justicia_federal_provincias.cargos_cada_100mil|02": "real: en la Ciudad están también los tribunales federales que atienden casos de todo el país (Casación Penal, Seguridad Social, Contencioso Administrativo Federal, Civil y Comercial Federal y Electoral), y el texto de la ficha lo dice",
    "mediana|jueces_federales_cada_100mil.valor|02": "ídem",
    "mediana|fiscalias_defensorias_federales.defensorias_cada_100mil|94": "real: Tierra del Fuego tiene la población más chica del país (unos 182.000 habitantes) y cuatro defensorías federales",
    "mediana|obra_publica_provincias.obras_hab|38": "real: la autopista de las rutas nacionales 66 y 34 en el corredor del NOA, que hace Vialidad Nacional con un préstamo del Banco Mundial",
    "mediana|obra_publica_provincias.transf_hab|10": "real: obras de agua potable y saneamiento financiadas con préstamos del BID y de la AFD",
    "mediana|obra_publica_provincias.transf_hab|46": "real: obras viales fuera de la red nacional que la Nación transfiere a la provincia y a sus municipios",
    # dengue y vacuna triple viral (plan de mejora, sección 10, 28 de octubre de 2026)
    **{f"rango|cobertura_triple_viral_dosis{n}|{c}": "real: es una cobertura administrativa, dosis aplicadas sobre la población estimada de "
       "esa edad, y puede pasar de 100% cuando se vacuna a chicos de otras provincias o la población estimada se queda corta (lo dice la nota)"
       for n in (1, 2) for c in PROV24},
    **{f"mediana|casos_dengue_cada_100000.valor|{c}": "real: el dengue llega en epidemias que se concentran en algunas provincias, sobre todo en "
       "el norte, y en las temporadas con pocos casos la mediana es casi cero" for c in PROV24},
    **{f"mediana|vivienda_provincias.pct_ocupados_minas|{c}": "real: provincias petroleras y mineras" for c in ("26", "58", "78")},
    **{f"fuentes|petroleo|{a}": "la EIA estima el crudo con condensado con su propio método: el sitio usa la serie de la Secretaría de Energía "
       "y la EIA solo para comparar países (lo dice la nota de la ficha)" for a in (2019, 2020)},
    # la Corte Suprema (etapa 33)
    "corte|exceso|1975-09-30": "las dos fechas son de la propia Corte: dice que Pablo Ramella entró a fines de septiembre de 1975 en lugar de "
                               "Manuel Arauz Castex y que Arauz Castex renunció el 2 de octubre",
}


def cargar():
    d = json.loads((SITIO / "datos" / "fichas.json").read_text(encoding="utf-8"))
    t = pd.read_csv(RAIZ / "datos" / "ordenado" / "tabla_larga.csv", dtype={"codigo_indec": str, "periodo": str})
    t["codigo_indec"] = t.codigo_indec.fillna("--")
    dis = json.loads((MANUAL / "distorsiones.json").read_text(encoding="utf-8")) if (MANUAL / "distorsiones.json").exists() else {}
    return d, t, dis


# ---------------------------------------------------------------- 1. sumas de control
# Bancas que corresponden a cada período: Diputados 254 hasta 1991 y 257 desde la provincialización de Tierra del Fuego
# (ley 23.775), Senado 46 hasta 1991, 48 con Tierra del Fuego y 72 desde la reforma de 1994 (tres por distrito).
def bancas_esperadas(camara, anio):
    if camara == "Diputados":
        return 254 if anio < 1991 else 257
    return 46 if anio < 1993 else 48 if anio < 1995 else 72


def prueba_sumas(d, t):
    sale = []
    cg = pd.DataFrame(d["datos"]["congreso_composicion"])
    esp = [c for c in cg.columns if c not in ("camara", "anio", "periodo")]
    ult = int(cg.anio.max())
    for _, f in cg.iterrows():
        s, e = int(f[esp].sum()), bancas_esperadas(f.camara, int(f.anio))
        if s != e:
            clave = f"bancas|{f.camara}|{f.anio}"
            sale.append((clave, f"{f.camara} {f.periodo}: suman {s} bancas y corresponden {e}"))
            # faltan bancas por reemplazos sin fecha en la fuente (y en el Senado, la transición a tres senadores): conocido.
            # Más bancas que las que corresponden, o una diferencia en el período actual, es un error y falla
            # Antes de 2007 (Patrimonio Legislativo de la HCDN) hay reemplazos sin fecha y tramos superpuestos: se aceptan diferencias
            # chicas en los dos sentidos. Desde 2007, solo bancas de menos (reemplazos sin fecha) y nunca en el período actual
            viejo = int(f.anio) < 2007
            if int(f.anio) != ult and ((f.camara == "Diputados" and (abs(e - s) <= 4 if viejo else 0 < e - s <= 2)) or (f.camara == "Senado" and viejo and s < e)):
                ACEPTADAS.setdefault(clave, "la fuente no tiene la fecha de algunos reemplazos" + (" y tiene tramos superpuestos" if viejo and s > e else "") +
                                     (", y el Senado pasó de dos a tres bancas por provincia" if f.camara == "Senado" and int(f.anio) >= 1995 else ""))
    el = pd.DataFrame(d["datos"]["elecciones_presidenciales"])
    for (e, c), s in el.groupby(["eleccion", "codigo_indec"]).pct.sum().items():
        if abs(s - 100) > .1:
            sale.append((f"votos|{e}|{c}", f"elección {e}, jurisdicción {c}: los porcentajes suman {s:.2f}"))
    # provincias que suman el total del país (cantidades, no tasas)
    pa = pd.DataFrame(d["datos"]["patentamientos_anual"]).set_index("anio")
    pp = pd.DataFrame(d["datos"]["patentamientos_provincias"])
    anio_p = int(pa.index.max())
    for col in ("autos", "motos"):
        # E3 (26 de octubre de 2026): las jurisdicciones marcadas "excluir" en distorsiones.json no entran en el total del país. Con
        # las motos de Tierra del Fuego de 2025 adentro, el país sumaba 4,6% más que las demás provincias
        excl = [t_ for t_, x in d["resumen"]["distorsiones"].get(f"patentamientos_provincias.{col}_1000", {}).items() if x["accion"] == "excluir"]
        s, n = pp[~pp.territorio.isin(excl)][col].sum(), pa.loc[anio_p, col]
        if abs(s / n - 1) > .01:
            sale.append((f"total|patentamientos_{col}", f"patentamientos de {col} {anio_p}: las provincias suman {s:,.0f} y el país {n:,.0f}"))
    sp = pd.DataFrame(d["datos"]["suicidio_provincias"]); ss = pd.DataFrame(d["datos"]["suicidio_serie"]).set_index("anio")
    s, n = sp.casos.sum(), ss.casos.iloc[-1]
    if abs(s / n - 1) > .01:
        sale.append(("total|suicidios", f"suicidios: las provincias suman {s:,.0f} y el país {n:,.0f}"))
    # Aprender (diagnóstico educativo): las provincias suman el país, y los departamentos más los que la fuente oculta suman su provincia
    ad = pd.DataFrame(d["datos"]["aprender_diagnostico"]).set_index("codigo_indec")
    s, n = ad.drop("00").n.sum(), ad.loc["00", "n"]
    if abs(s - n) > 1:
        sale.append(("total|aprender", f"Aprender: las provincias suman {s:,.0f} estudiantes y el país {n:,.0f}"))
    # petróleo y gas (etapa 18): las provincias y el mar suman el país en los doce meses de la ficha (archivo agrupado contra la serie
    # del país), los pozos por provincia suman los pozos por tipo, y el Censo da los totales que publica el INDEC
    r = d["resumen"]
    hp = pd.DataFrame(d["datos"]["hidrocarburos_provincias"])
    hm = pd.DataFrame(d["datos"]["hidrocarburos_mensual"]).set_index("periodo")
    meses = [str(p) for p in pd.period_range(end=pd.Period(r["petroleo"]["v_hasta_p"], "M"), periods=12, freq="M")]
    dias = sum(pd.Period(p, "M").days_in_month for p in meses)
    for k in ("pet_total", "gas_total"):
        pais = sum(hm.loc[p, k] * pd.Period(p, "M").days_in_month for p in meses) / dias
        s = hp["pet_kbd" if k == "pet_total" else "gas_mmm3d"].sum()
        if abs(s / pais - 1) > .01:
            sale.append((f"total|hidrocarburos_{k}", f"{k}: las provincias suman {s:,.1f} y el país {pais:,.1f} en los doce meses de la ficha"))
    if sum(f["total"] for f in d["datos"]["pozos_provincias"]) != sum(f["pozos"] for f in d["datos"]["pozos_tipo"]):
        sale.append(("total|pozos", "pozos: las provincias no suman lo mismo que los tipos de recurso"))
    va = r["construccion"]["viv_abs"]
    for k, v in {"hogares": 15932302, "gas_red": 8390191, "garrafa": 6203636}.items():  # INDEC, cuadro c2022_tp_hogares_c4.xlsx
        if va[k] != v:
            sale.append((f"total|censo_{k}", f"Censo 2022, {k}: el resumen por radio da {va[k]:,} y el cuadro del INDEC {v:,}"))
    dep = pd.DataFrame(d["datos"]["aprender_departamentos"]).groupby("codigo_indec").n.sum()
    oculto = d["resumen"]["diagnostico"]["enmascarados"]["alumnos"]
    if abs(dep.sum() + oculto - n) > 2:
        sale.append(("total|aprender_departamentos", f"Aprender: los departamentos suman {dep.sum():,.0f} y los ocultos {oculto:,.0f}, y el país {n:,.0f}"))
    if (dep > ad.drop("00").n.reindex(dep.index) + 1).any():
        sale.append(("total|aprender_dep_prov", "Aprender: algún departamento suma más estudiantes que su provincia"))
    return sale


# ---------------------------------------------------------------- 2. rango
# indicadores en porcentaje que pueden ser negativos (un déficit, más cierres que aperturas)
CON_SIGNO = {"resultado_financiero_pct_ingresos"}


def prueba_rango(d, t):
    sale = []
    pct = t[t.unidad.str.startswith("%") & ~t.variable.isin(CON_SIGNO)]
    for _, f in pct[(pct.valor > 100) | (pct.valor < 0)].iterrows():
        sale.append((f"rango|{f.variable}|{f.codigo_indec}", f"{f.variable} {f.territorio} {f.periodo}: {f.valor:g} (fuera de 0 a 100)"))
    for nombre, filas in d["datos"].items():
        if not (isinstance(filas, list) and filas and isinstance(filas[0], dict)):
            continue
        for col in filas[0]:
            if not (col.startswith("pct") or col in ("tasa_inicio", "tasa_final")):
                continue
            for f in filas:
                v = f.get(col)
                if isinstance(v, (int, float)) and (v > 100 or v < 0):
                    sale.append((f"rango|{nombre}.{col}|{f.get('codigo_indec', f.get('anio', ''))}", f"{nombre}.{col} {f.get('territorio', f.get('anio', ''))}: {v:g} (fuera de 0 a 100)"))
    return sale


# ---------------------------------------------------------------- 3. períodos faltantes
def siguiente(p):
    if len(p) == 4 and p.isdigit():
        return str(int(p) + 1)
    if len(p) == 7 and p[4] == "-":
        a, m = int(p[:4]), int(p[5:])
        return f"{a + (m == 12)}-{1 if m == 12 else m + 1:02d}"
    if "S" in p:  # semestres: 1S2017
        s, a = int(p[0]), int(p[2:])
        return f"{2 if s == 1 else 1}S{a + (s == 2)}"
    if "T" in p:  # trimestres: 2T2026 (etapa 23)
        q, a = int(p[0]), int(p[2:])
        return f"{1 if q == 4 else q + 1}T{a + (q == 4)}"
    return None


def orden(p):
    return (int(p[2:]), int(p[0])) if "S" in p or "T" in p else p


# series que por diseño no tienen un dato por año: elecciones cada dos o cuatro años y PISA cada tres
IRREGULARES = ("participacion_presidencial", "pisa_puntaje_", "voto_presidente_")


def prueba_faltantes(d, t):
    sale = []
    for (v, c), g in t.groupby(["variable", "codigo_indec"]):
        if v.startswith(IRREGULARES):
            continue
        per = sorted(set(g.periodo), key=orden)
        if len(per) < 3 or siguiente(per[0]) is None:
            continue
        pres = set(per); p = per[0]; falta = []
        while p != per[-1]:
            p = siguiente(p)
            if p not in pres:
                falta.append(p)
        if falta:
            sale.append((f"faltan|{v}|{c}", f"{v} ({c}): faltan {', '.join(falta[:8])}" + (f" y {len(falta) - 8} más" if len(falta) > 8 else "")))
    return sale


# ---------------------------------------------------------------- 4. valores a más de cinco veces la mediana
# solo tasas y valores por habitante: una cantidad absoluta (asalariados, turistas) es mucho mayor en las provincias grandes
# sin que eso sea raro. En la tabla larga, solo el último período de cada indicador.
ES_TASA = ("cada", "_1000", "_100", "por_", "_hab", "tasa", "pct", "accesos", "densidad")
UNIDAD_TASA = ("cada", "por ", "%")


def prueba_mediana(d, t, dis):
    sale = []
    def revisar(nombre, filas, col):
        vals = [(f["codigo_indec"], f[col]) for f in filas if f.get("codigo_indec") in PROV24 and isinstance(f.get(col), (int, float))]
        if len(vals) < 10:
            return
        med = statistics.median(v for _, v in vals)
        if med <= 0:
            return
        for c, v in vals:
            if v > 5 * med:
                clave = f"mediana|{nombre}.{col}|{c}"
                sale.append((clave, f"{nombre}.{col} {c}: {v:,.1f}, {v / med:.1f} veces la mediana ({med:,.1f})"))
    for nombre, filas in d["datos"].items():
        if isinstance(filas, list) and len(filas) == 24 and isinstance(filas[0], dict) and "codigo_indec" in filas[0]:
            for col in filas[0]:
                if any(k in col for k in ES_TASA) and not col.endswith("_anio") and "neta" not in col:
                    revisar(nombre, filas, col)
    prov = t[t.codigo_indec.isin(PROV24) & t.unidad.str.contains("|".join(UNIDAD_TASA), regex=True) & ~t.variable.isin(CON_SIGNO)]
    for v, g in prov.groupby("variable"):
        if v.startswith(("voto_presidente", "participacion")):
            continue
        ult = max(g.periodo, key=orden)
        revisar(f"{v}", g[g.periodo == ult].to_dict("records"), "valor")
    # los casos distorsionados por el lugar de registro tienen su motivo en distorsiones.json
    for clave, _ in list(sale):
        _, cual, c = clave.split("|")
        tabla_col = cual
        if any(tabla_col.endswith(k) or k == tabla_col for k in dis) and any(c in dis[k] for k in dis if tabla_col.endswith(k) or k == tabla_col):
            ACEPTADAS.setdefault(clave, "distorsión por el lugar de registro (distorsiones.json)")
    return sale


# ---------------------------------------------------------------- 5. dos fuentes para lo mismo
def deis_nacidos_total(anio):
    f = CRUDO / f"deis_nacidos_{anio}.csv"
    if not f.exists():
        return None
    for sep in (";", ","):
        for enc in ("utf-8-sig", "latin-1"):
            try:
                x = pd.read_csv(f, sep=sep, encoding=enc, dtype=str)
                x.columns = [c.strip().strip('"').upper() for c in x.columns]
                if "CUENTA" in x.columns:
                    return int(pd.to_numeric(x.CUENTA.str.strip().str.strip('"'), errors="coerce").sum())
            except Exception:
                continue
    return None


def prueba_fuentes(d, t):
    sale = []
    def comparar(clave, que, a, b, na, nb):
        if a is None or b is None or not b:
            return
        dif = a / b - 1
        if abs(dif) > .02:
            sale.append((f"fuentes|{clave}", f"{que}: {na} {a:,.2f} y {nb} {b:,.2f} ({dif * 100:+.1f}%)"))
    def tl(var, cod, per):
        x = t[(t.variable == var) & (t.codigo_indec == cod) & (t.periodo == str(per))]
        return float(x.valor.iloc[0]) if len(x) else None
    nac = {r["anio"]: r["nacimientos"] for r in d["datos"]["nacimientos"]}
    for a in sorted(nac):
        comparar(f"nacimientos|{a}", f"nacimientos {a}", nac[a], deis_nacidos_total(a), "en el sitio", "DEIS")
    difs = []
    for a in range(2012, 2025):
        bm_, de_ = tl("bm_mortalidad_infantil", "00", a), tl("tasa_mortalidad_infantil", "00", a)
        if bm_ and de_ and abs(bm_ / de_ - 1) > .02:
            difs.append(f"{a} ({bm_:g} y {de_:g})")
    if difs:
        sale.append(("fuentes|mortalidad_infantil", f"mortalidad infantil, Banco Mundial y DEIS difieren más de 2% en {', '.join(difs)}"))
    r = d["resumen"]
    comparar("esperanza_vida|2022", "esperanza de vida 2022", tl("bm_esperanza_vida", "00", 2022), r["nuevos"].get("ev_pais"), "Banco Mundial", "INDEC")
    comparar("protegida|2025", "territorio protegido 2025", tl("bm_protegida", "00", 2025), r["naturaleza"].get("pct"), "Banco Mundial", "CIAM")
    # petróleo: la estimación de la EIA contra la serie de la Secretaría de Energía, año por año desde 2015
    # gas residencial: la suma de las provincias del cuadro I.10 del ENARGAS contra la serie del país de la API de Series de Tiempo
    if (CRUDO / "gas_residencial_pais.csv").exists():
        for f in pd.read_csv(CRUDO / "gas_residencial_pais.csv").itertuples(index=False):
            a = int(str(f[0])[:4])
            if a <= r["energia"]["gas_anio"]:
                comparar(f"gas_residencial|{a}", f"gas entregado a usuarios residenciales {a}", tl("gas_residencial_entregado", "00", a), float(f[1]),
                         "ENARGAS por provincia", "API de Series de Tiempo")
    # electricidad residencial: la suma de las provincias de CAMMESA contra la serie del país de la API de Series de Tiempo (367.3)
    if (CRUDO / "energia_emae.csv").exists():
        _em = pd.read_csv(CRUDO / "energia_emae.csv").dropna(subset=["demanda_residencial"])
        _em = _em.groupby(_em.indice_tiempo.str[:4]).demanda_residencial.agg(["sum", "size"])
        for a, f in _em[_em["size"] == 12].iterrows():
            if r["energia"]["el_ini"] <= int(a) <= r["energia"]["el_ult"]:
                comparar(f"electricidad_residencial|{a}", f"demanda eléctrica residencial {a}", tl("electricidad_residencial_gwh", "00", int(a)), float(f["sum"]),
                         "CAMMESA por provincia", "API de Series de Tiempo")
    for a in range(2015, r["petroleo"]["anio_ult"] + 1):
        comparar(f"petroleo|{a}", f"producción de petróleo {a}", tl("eia_produccion_crudo", "00", a), tl("produccion_petroleo", "00", a), "EIA", "Secretaría de Energía")
    return sale


# ---------------------------------------------------------------- 6. mandatos
def prueba_mandatos(d, t):
    sale = []
    pr = sorted(d["datos"]["presidentes"], key=lambda p: p["inicio"])
    for a, b in zip(pr, pr[1:]):
        hueco = (pd.Timestamp(b["inicio"]) - pd.Timestamp(a["fin"])).days
        if hueco < 0:
            sale.append((f"mandatos|{a['nombre']}|{b['nombre']}", f"{a['nombre']} termina el {a['fin']} y {b['nombre']} empieza antes, el {b['inicio']}"))
        elif hueco > 1:
            sale.append((f"mandatos|{a['nombre']}|{b['nombre']}", f"entre {a['nombre']} ({a['fin']}) y {b['nombre']} ({b['inicio']}) quedan {hueco - 1} días sin presidente"))
    return sale


# ---------------------------------------------------------------- 7. la Corte Suprema (etapa 33)
# Las tablas de la pieza del Laboratorio se arman a mano (datos/manual/corte_*.csv y presidentes_fuerza.csv): estas pruebas buscan errores
# de carga. Para contar jueces a la vez, las fechas sin día van del lado prudente (un ingreso desde el final de su mes o año y una salida
# desde su principio), así una fecha incompleta no inventa una superposición
def fecha_corte(s, modo):
    if not isinstance(s, str) or not s.strip():
        return pd.NaT
    s = s.strip()
    if len(s) == 10:
        return pd.Timestamp(s)
    a = pd.Timestamp(s + ("-01-01" if len(s) == 4 else "-01"))
    return a if modo == "ini" else a + (pd.offsets.YearEnd(0) if len(s) == 4 else pd.offsets.MonthEnd(0))


def ley_corte(tam, d):
    """Jueces que fija la ley, con la reducción gradual de la ley 26.183: siete hasta la muerte de Argibay y seis hasta la de Petracchi."""
    if pd.Timestamp("2006-12-18") <= d < pd.Timestamp("2014-05-10"):
        return 7
    if pd.Timestamp("2014-05-10") <= d < pd.Timestamp("2014-10-12"):
        return 6
    for r in tam.itertuples():
        if pd.Timestamp(r.desde) <= d and (not isinstance(r.hasta, str) or d < pd.Timestamp(r.hasta)):
            return float(r.cantidad_de_jueces) if isinstance(r.cantidad_de_jueces, str) else None
    return None


def prueba_corte(d, t):
    sale, hoy = [], pd.Timestamp.now().normalize()
    j = pd.read_csv(MANUAL / "corte_jueces.csv", dtype=str)
    p = pd.read_csv(MANUAL / "presidentes_fuerza.csv", dtype=str)
    tam = pd.read_csv(MANUAL / "corte_tamano.csv", dtype=str)
    en = j.motivo_cese.fillna("").eq("en funciones")
    ini = [a if isinstance(a, str) else b for a, b in zip(j.fecha_jura, j.fecha_decreto)]
    j["d0"], j["d1"] = [fecha_corte(x, "fin") for x in ini], [fecha_corte(x, "ini") for x in ini]
    j["h0"] = [hoy if e else fecha_corte(c, "ini") for c, e in zip(j.fecha_cese, en)]
    j["h1"] = [hoy if e else fecha_corte(c, "fin") for c, e in zip(j.fecha_cese, en)]
    for r in j.itertuples():
        if pd.isna(r.d1) or pd.isna(r.h1):
            sale.append((f"corte|fecha|{r.nombre}", f"{r.nombre}: falta la fecha de inicio o de fin"))
        elif r.h1 < r.d1:
            sale.append((f"corte|fecha|{r.nombre}", f"{r.nombre} termina ({r.fecha_cese}) antes de empezar ({r.fecha_jura or r.fecha_decreto})"))
    # quién designó: el presidente que gobernaba en la fecha del decreto (o de la jura, si falta)
    p["ini"], p["fin_"] = pd.to_datetime(p.inicio), pd.to_datetime(p.fin).fillna(hoy)
    p["nom"] = p.presidente.str.replace(r" \(.*\)$", "", regex=True)
    for r in j.itertuples():
        s = r.fecha_decreto if isinstance(r.fecha_decreto, str) else r.fecha_jura
        if p[(p.nom == r.designado_por) & (p.ini <= fecha_corte(s, "fin")) & (p.fin_ >= fecha_corte(s, "ini"))].empty:
            sale.append((f"corte|designado|{r.nombre}|{s}", f"{r.nombre}: {r.designado_por} no gobernaba en {s}"))
    pp = p.sort_values("ini")
    for a, b in zip(pp.itertuples(), list(pp.itertuples())[1:]):
        if b.ini < a.fin_:
            sale.append((f"corte|presidentes|{a.nom}|{b.nom}", f"{a.presidente} termina el {a.fin} y {b.presidente} empieza antes, el {b.inicio}"))
    # desde 1983, los mismos presidentes y fechas que la ficha de presidentes
    for r in pd.read_csv(MANUAL / "presidentes.csv", dtype=str).itertuples():
        m = p[(p.nom == r.nombre) & (p.inicio == r.inicio)]
        if m.empty or (isinstance(r.fin, str) and m.iloc[0].fin != r.fin):
            sale.append((f"corte|presidente_sitio|{r.nombre}", f"{r.nombre}: las fechas de presidentes_fuerza.csv no son las de presidentes.csv"))
    # una confirmación sigue al mismo juez: no es otra persona a la vez
    c = j[j.tipo_designacion != "confirmación"].copy()
    for r in j[j.tipo_designacion == "confirmación"].itertuples():
        c.loc[c[c.nombre == r.nombre].index.max(), "h0"] = r.h0
    for n, g in c.groupby("nombre"):
        g = g.sort_values("d0")
        for a, b in zip(g.itertuples(), list(g.itertuples())[1:]):
            if b.d0 < a.h0:
                sale.append((f"corte|superpuesto|{n}", f"{n} tiene dos períodos superpuestos en la Corte"))
    for dia in sorted(set(c.d0.dropna()) | set(c.h0.dropna())):
        if dia < pd.Timestamp("1863-01-15") or dia > hoy:
            continue
        n, ley = int(((c.d0 <= dia) & (c.h0 > dia)).sum()), ley_corte(tam, dia)
        if ley and n > ley:
            sale.append((f"corte|exceso|{dia.date()}", f"el {dia.date()} hay {n} jueces y la ley fija {int(ley)}"))
    return sale


# ---------------------------------------------------------------- 8. errores que ya pasaron (26 de octubre de 2026)
# Cada error de dato que encontró la auditoría del 26 de octubre de 2026 (docs/roadmap/PLAN_MEJORA.md, sección 1) deja acá su prueba.
# E1: la copia de ¿Cómo Votó? les puso a los diputados del PRO de CABA y de Buenos Aires el bloque "Partido Bloquista de San Juan" en
# 2012 y 2013. Un bloque cuyo nombre lleva una provincia (o su gentilicio) no puede tener legisladores de otra. "Buenos Aires" no
# entra: lo usan bloques de CABA y de la provincia
BLOQUE_PROVINCIA = [(r"san juan|sanjuanin", "San Juan"), (r"neuquin", "Neuquén"), (r"fuegui", "Tierra del Fuego"), (r"santiago", "Santiago del Estero"),
                    (r"\bsalta\b|salteñ", "Salta"), (r"catamarca", "Catamarca"), (r"c[oó]rdoba|cordobes", "Córdoba"), (r"corrientes|correntin", "Corrientes"),
                    (r"mendoza|mendocin", "Mendoza"), (r"misiones|misioner", "Misiones"), (r"r[ií]o negro|rionegrin", "Río Negro"),
                    (r"santa cruz", "Santa Cruz"), (r"santa fe|santafesin", "Santa Fe"), (r"san luis|puntan", "San Luis"), (r"tucum[aá]n", "Tucumán"),
                    (r"chubut", "Chubut"), (r"entre r[ií]os|entrerrian", "Entre Ríos"), (r"la pampa", "La Pampa"), (r"jujuy|jujeñ", "Jujuy"),
                    (r"formos", "Formosa"), (r"chaco|chaqueñ", "Chaco"), (r"la rioja|riojan", "La Rioja"), (r"bonaerense", "Buenos Aires")]


def prueba_errores(d, t):
    import re
    sale = []
    vt = pd.read_csv(SITIO / "datos" / "votaciones_leyes_clave.csv")
    for (bloque, prov), g in vt.groupby(["bloque", "provincia"]):
        dueña = next((p for rx, p in BLOQUE_PROVINCIA if re.search(rx, str(bloque).lower())), None)
        if dueña and prov != dueña:
            sale.append((f"bloque|{bloque}|{prov}", f"el bloque «{bloque}» tiene {len(g)} votos de legisladores de {prov} ({', '.join(sorted(set(g.ley)))[:120]})"))
    # E2: el total de empresas del país no puede salir de sumar las provincias, que cuentan una vez en cada una a la empresa con personal
    # en varias (lo dice la nota metodológica del OEDE). El total sin doble conteo es menor que esa suma
    em = d["resumen"].get("empresas")
    if em:
        suma = sum(f["empresas"] for f in d["datos"]["empresas_provincias"])
        if em["total_pais"] >= suma:
            sale.append(("total-doble|empresas", f"empresas: el total del país ({em['total_pais']:,}) no es menor que la suma de las provincias ({suma:,.0f})"))
    # E13: la ficha de pozos y el mapa de los pozos no convencionales cuentan lo mismo cuando hablan del mismo mes (con agosto de 2026
    # daban 2.922 y 2.918 pozos de shale, de dos archivos bajados en días distintos)
    pg = d["resumen"]["petroleo"]
    if pg["pozos_mes"] == pg["map_mes"]:
        for k in ("shale", "tight"):
            if pg[f"map_{k}"] != pg[f"pozos_{k}"]:
                sale.append((f"pozos|{k}", f"pozos de {k} en {pg['pozos_mes']}: la ficha de pozos dice {pg[f'pozos_{k}']:,} y el mapa {pg[f'map_{k}']:,}"))
        if pg["map_activos"] != pg["pozos_shale"] + pg["pozos_tight"]:
            sale.append(("pozos|activos", f"pozos no convencionales en {pg['pozos_mes']}: el mapa dice {pg['map_activos']:,} y la ficha de pozos suma {pg['pozos_shale'] + pg['pozos_tight']:,}"))
    # recursos propios: el valor del país del perfil provincial era la mediana de las provincias. Tiene que ser el de las provincias
    # sumadas, que queda entre la más baja y la más alta y no es la mediana
    fi = d["resumen"]["fiscal"]
    vals = [f["autonomia"] for f in d["datos"]["fiscal_provincias"] if f["anio"] == fi["anio"]]
    if "pais" not in fi:
        sale.append(("fiscal|pais", "recursos propios: el resumen no tiene el valor del país (las provincias sumadas)"))
    elif not min(vals) <= fi["pais"] <= max(vals) or fi["pais"] == fi["mediana"]:
        sale.append(("fiscal|pais", f"recursos propios: el valor del país ({fi['pais']}) no es el de las provincias sumadas (mediana {fi['mediana']}, de {min(vals):.1f} a {max(vals):.1f})"))
    # E13 (27 de octubre de 2026): el texto de nacidos en otro país decía que Paraguay, el primero del total, era el primero en 7
    # jurisdicciones, y no decía que Chile lo era en 8. El resumen tiene que traer el país que es el primero en más, contado de la tabla
    mg = d["resumen"]["migraciones"]["censo"]
    cuenta = pd.Series([f["primer_pais"] for f in d["datos"]["nacidos_otro_pais_provincias"] if f["codigo_indec"] != "00"]).value_counts()
    if "primer_pais_mas" not in mg:
        sale.append(("nacidos|primer", "nacidos en otro país: el resumen no tiene el país que es el primero en más jurisdicciones"))
    elif mg["primer_pais_mas"][0][1] != int(cuenta.max()) or mg["primer_pais_n"] != int(cuenta.get(mg["paises"][0][0], 0)):
        sale.append(("nacidos|primer", f"nacidos en otro país: el resumen dice {mg['primer_pais_mas'][0]} y {mg['paises'][0][0]} en {mg['primer_pais_n']}, "
                                       f"y la tabla cuenta {dict(cuenta.head(3))}"))
    # E12 (27 de octubre de 2026): La Pampa figuraba con 2024 en las fichas de recursos propios y de regalías de 2025, sin rótulo, y su
    # dato entraba en la mediana. Toda jurisdicción con otro año tiene que estar en la lista que la ficha rotula, y la mediana no la cuenta
    otro_anio = {f["territorio"]: f["anio"] for f in d["datos"]["fiscal_provincias"] if f["anio"] != fi["anio"]}
    if otro_anio != fi.get("atrasadas"):
        sale.append(("otro-anio|fiscal", f"recursos propios: con otro año que {fi['anio']} están {otro_anio} y la ficha rotula {fi.get('atrasadas')}"))
    del_anio = [f["autonomia"] for f in d["datos"]["fiscal_provincias"] if f["anio"] == fi["anio"]]
    if abs(statistics.median(del_anio) - fi["mediana"]) > 0.051 or fi.get("mediana_n") != len(del_anio):
        sale.append(("otro-anio|fiscal-mediana", f"recursos propios: la mediana ({fi['mediana']}, de {fi.get('mediana_n')}) no es la de las {len(del_anio)} "
                                                 f"jurisdicciones con datos de {fi['anio']} ({statistics.median(del_anio):.1f})"))
    pg_reg = {f["territorio"]: f["anio_aif"] for f in d["datos"]["regalias_provincias"] if f["anio_aif"] != pg["reg_anio"]}
    if pg_reg != pg.get("reg_atrasadas"):
        sale.append(("otro-anio|regalias", f"regalías: con otro año que {pg['reg_anio']} están {pg_reg} y la ficha rotula {pg.get('reg_atrasadas')}"))
    # R12 (27 de octubre de 2026): las diferencias y los conteos que dice un texto salen de las cifras que se muestran. PISA decía
    # "95 puntos" entre 378 y 472, y Jujuy se veía "1,0%" en las regalías y contaba entre las de menos del 1%
    pz = d["resumen"]["pisa"]
    if pz["dif_mat"] != pz["ocde_mat"] - pz["mat"]:
        sale.append(("redondeo|pisa", f"PISA: la diferencia dice {pz['dif_mat']} puntos y la resta de lo que se ve da {pz['ocde_mat'] - pz['mat']}"))
    vistos = [round(f["pct_regalias"] + 1e-9, 1) for f in d["datos"]["regalias_provincias"]]
    if pg["reg_n_1"] != sum(v >= 1 for v in vistos) or pg["reg_n_10"] != sum(v >= 10 for v in vistos):
        sale.append(("redondeo|regalias", f"regalías: el texto cuenta {pg['reg_n_1']} con 1% o más y {pg['reg_n_10']} con 10% o más, "
                                          f"y con lo que se ve son {sum(v >= 1 for v in vistos)} y {sum(v >= 10 for v in vistos)}"))
    return sale


# ---------------------------------------------------------------- 9. unidades conocidas
# Plan de mejora, R14 y T13 (27 de octubre de 2026): la tabla larga que se descarga traía la misma unidad escrita de varias formas
# ("millones de dolares" y "millones de dólares", "anios" y "años") y fuentes sin tildes. 02_procesar.py las arregla al sumar cada serie
# (lg_texto). Cada unidad tiene que ser una de UNIDADES, y ninguna unidad ni fuente puede tener una de las palabras de SIN_TILDE. Los años de
# una unidad ("pesos de 2025") no cuentan: cambian con los datos. Una unidad nueva se suma acá, después de revisar que no sea otra forma de
# una que ya está
UNIDADES = {"%", "% de los chicos de la edad", "% de estudiantes de 6 grado", "% de hogares", "% de la electricidad generada", "% de la población",
            "% de la población de 15 años o más", "% de la población económicamente activa", "% de la población en edad de terminarlo",
            "% de la población en viviendas particulares", "% de la producción de gas", "% de la producción de petróleo",
            "% de la superficie continental", "% de las empresas", "% de las personas privadas de libertad", "% de las personas ocupadas", "% de los electores", "% de los hogares",
            "% de los ingresos totales", "% de los votos positivos", "% de personas", "% del PBI", "% del producto interno bruto",
            "% del salario promedio registrado", "% del territorio", "% para los doce meses siguientes", "GWh", "GWh por año", "MW",
            "aportantes por beneficio", "asalariados registrados cada 1.000 habitantes", "años",
            "beneficiarios cada 100 asalariados privados registrados",
            "beneficiarios de la prestación por desempleo cada 1.000 habitantes", "cargos cada 1.000 habitantes", "cargos de juez",
            "cargos de juez cada 100.000 habitantes", "casos", "casos cada 100.000 habitantes", "defensorías", "dólares por habitante",
            "dólares por litro al tipo de cambio de referencia (Com. A 3500), mediana de las estaciones", "empresas",
            "etapas de fractura por año", "fiscalías", "grados Celsius", "hechos cada 100.000 habitantes", "hectáreas",
            "hijos con AUH cada 100 menores de 18 años", "hijos por mujer", "kWh por habitante por año", "kilos por habitante por año",
            "kilovatios hora por año", "miles", "miles de barriles por día", "miles de barriles por pozo en sus primeros doce meses",
            "miles de millones de m³", "miles de pesos", "millones de dólares", "millones de kg", "millones de litros",
            "millones de m³", "millones de m³ por día", "muertes de menores de un año por cada 1.000 nacidos vivos",
            "m² por habitante", "m³ por usuario por año", "nacimientos por cada 1.000 mujeres de 15 a 19 años",
            "pensiones (promedio mensual)", "pensiones cada 1.000 habitantes", "personas", "personas (promedio mensual)",
            "personas al 31 de diciembre", "personas cada 100.000 habitantes",
            "pesos corrientes por alumno de gestión estatal por año", "pesos corrientes por mes",
            "pesos corrientes por mes, promedio por puesto, con aguinaldo en junio y diciembre", "pesos de AAAA por habitante",
            "pesos por habitante", "pesos por litro, mediana de las estaciones", "por 1.000 nacidos vivos",
            "por 100.000 habitantes de 5 años y más", "por cada 100.000 habitantes", "pozos terminados por año", "puntos",
            "solicitudes", "tarjetas", "toneladas", "toneladas por año", "trámites", "turistas", "turistas por cada 100 habitantes",
            "vehículos", "viajeros", "viajes de turistas", "viajes por mes", "visitas", "víctimas cada 100.000 habitantes",
            "índice de 0 a 100", "índice de 0 a 5", "índice, 17 de diciembre de AAAA = 100", "índice, AAAA = 100",
            "índice, diciembre de AAAA = 100"}
SIN_TILDE = r"(?i)\b(anios?|capitulo|direccion|dolares|economia|educacion|energia|estadisticas|estimacion|gestion|indices?|informacion|petroleo|poblacion|produccion|secretaria|tramites|vehiculos|via|dia)\b"


def prueba_unidades(d, t):
    import re
    sale = []
    for u in sorted(t.unidad.dropna().unique()):
        if re.sub(r"\b(19|20)\d{2}\b", "AAAA", u) not in UNIDADES:
            sale.append((f"unidad|{u}", f"unidad que no está entre las conocidas: «{u}» ({', '.join(sorted(set(t[t.unidad == u].variable)))[:120]})"))
    for campo in ("unidad", "fuente"):
        for x in sorted(t[campo].dropna().unique()):
            if m := re.search(SIN_TILDE, x):
                sale.append((f"tilde|{campo}|{x}", f"{campo} con «{m.group(0)}» sin tilde: «{x}»"))
    return sale


PRUEBAS = [("Sumas de control", prueba_sumas), ("Tasas y porcentajes fuera de rango", prueba_rango), ("Períodos faltantes", prueba_faltantes),
           ("Más de cinco veces la mediana", None), ("Dos fuentes para lo mismo", prueba_fuentes), ("Mandatos presidenciales", prueba_mandatos),
           ("La Corte Suprema", prueba_corte), ("Errores que ya pasaron", prueba_errores), ("Unidades conocidas", prueba_unidades)]


def correr(mostrar=True):
    d, t, dis = cargar()
    fallas, aceptadas = 0, 0
    for nombre, f in PRUEBAS:
        hall = prueba_mediana(d, t, dis) if f is None else f(d, t)
        malas = [(k, m) for k, m in hall if k not in ACEPTADAS]
        fallas += len(malas); aceptadas += len(hall) - len(malas)
        if mostrar:
            print(f"\n== {nombre}: {'bien' if not malas else f'{len(malas)} sin explicar'}" + (f" ({len(hall) - len(malas)} explicadas)" if len(hall) > len(malas) else ""))
            for k, m in malas:
                print(f"   FALLA  {m}   [{k}]")
            for k, m in hall:
                if k in ACEPTADAS:
                    print(f"   ok     {m}: {ACEPTADAS[k]}")
    if mostrar:
        print(f"\n{fallas} hallazgos sin explicar, {aceptadas} explicados")
    return fallas


if __name__ == "__main__":
    sys.exit(1 if correr() else 0)
