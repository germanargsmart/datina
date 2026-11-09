"""
Prueba de scripts/establecimientos.py (escuelas y hospitales de cada provincia, 9 de noviembre de 2026), sin red: la limpieza de domicilios
para Georef, qué punto de Georef se acepta, los códigos de departamento del REFES, la lectura del padrón (encabezado en dos filas y nombres
repetidos por bloque), del Mapa Educativo (ejes al revés) y del REFES con archivos de juguete, el control de departamentos con un cuadrado,
y lo escrito en datos/manual/establecimientos/ contra su control.json. Uso: python scripts/prueba_establecimientos.py
"""
import io, json, math, pathlib, sys, tempfile, zipfile

import numpy as np
import openpyxl
import pandas as pd

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import establecimientos as est  # noqa: E402

fallas = []


def ver(cond, msg):
    if not cond:
        fallas.append(msg)


def frena(f, *a):
    try:
        f(*a)
    except SystemExit:
        return True
    return False


# ---- limpieza de domicilios
CASOS = {
    "9 DE JULIO 1080 CENTRO": "9 DE JULIO 1080",
    "AV.1° DE MAYO 850": "AVENIDA 1 DE MAYO 850",
    "AVDA. HIPOLITO YRIGOYEN 2005 LA VIÑITA": "AVENIDA HIPOLITO YRIGOYEN 2005",
    "AVELLANEDA 120": "AVELLANEDA 120",
    "SANTIAGO DEL ESTERO 1570": "SANTIAGO DEL ESTERO 1570",
    "BELGRANO N° 345": "BELGRANO 345",
    "  san   martín  77 ": "SAN MARTÍN 77",
    "PASCO E/SEGUÍ Y YATASTO": "PASCO ENTRE SEGUÍ Y YATASTO",
    "1420 E/ 1413 Y 1423   BARRIO SAN FRANSISCO": "1420 ENTRE 1413 Y 1423",
    "MITRE 55 BARRIO CENTRO": "MITRE 55",
    "CALLE 7 1234": "CALLE 7 1234",
    "25 DE MAYO 300 PISO 2": "25 DE MAYO 300",
    "MITRE 55 B° SAN JOSÉ MZA 3": "MITRE 55",
    "PARAJE LAGUNA GRANDE": None,
    "CUARTEL VII": None,
    "AV. DOCENTES ARGENTINOS S/N  SAN ROQUE": None,
    "RUTA 14 KM 5": None,
    "MZA 4 CASA 12": None,
    "MANUEL DE SARRATEA": None,
    "": None,
    None: None,
    float("nan"): None,
}
for entrada, esperado in CASOS.items():
    ver(est.limpiar_domicilio(entrada) == esperado, f"limpiar_domicilio({entrada!r}) dio {est.limpiar_domicilio(entrada)!r}, se esperaba {esperado!r}")

# ---- qué punto de Georef se acepta
base = {"ubicacion_lat": -34.60, "ubicacion_lon": -58.40, "altura_valor": 1000, "calle_cruce_1_id": None, "departamento_id": "02007"}
def res(**k):
    return {"direcciones": [{**base, **k}]}
ver(est.aceptar(None, "02007", -34.6, -58.4)[1] == "sin resultado", "aceptar: sin respuesta")
ver(est.aceptar({"direcciones": []}, "02007", -34.6, -58.4)[1] == "sin resultado", "aceptar: lista vacía")
ver(est.aceptar(res(ubicacion_lat=None), "02007", -34.6, -58.4)[1] == "sin punto", "aceptar: sin ubicación")
ver(est.aceptar(res(altura_valor=None), "02007", -34.6, -58.4)[1] == "sin número de calle", "aceptar: sin altura ni esquina")
ver(est.aceptar(res(altura_valor=None, calle_cruce_1_id="123"), "02007", -34.6, -58.4)[1] == "aceptada", "aceptar: una esquina sirve")
ver(est.aceptar(res(departamento_id="02014"), "02007", -34.6, -58.4)[1] == "otro departamento", "aceptar: otro departamento")
ver(est.aceptar(res(), "02007", -34.75, -58.4)[1] == "lejos", "aceptar: a más de MAX_KM")
ver(est.aceptar(res(), "02007", -34.62, -58.41) == ((-34.60, -58.40), "aceptada"), "aceptar: el caso bueno")
ver(abs(est.km(-34.6, -58.4, -34.7, -58.4) - 11.12) < 0.05, "km: 0,1 grado de latitud son unos 11,1 km")

# ---- códigos de departamento del REFES
for (p, d), esperado in {("02", "001"): "02007", ("02", "015"): "02105", ("02", "7"): "02049", ("94", "007"): "94008",
                         ("94", "014"): "94015", ("94", "028"): "94028", ("06", "217"): "06218", ("06", "441"): "06441"}.items():
    ver(est.codigo_dep_refes(p, d) == esperado, f"codigo_dep_refes({p}, {d}) dio {est.codigo_dep_refes(p, d)}, se esperaba {esperado}")

tmp = pathlib.Path(tempfile.mkdtemp(prefix="prueba_establecimientos_"))

# ---- padrón de juguete, con la forma del de junio de 2026
BLOQUES = ["Establecimiento - Localización"] + [None] * 12 + ["Modalidad", None, None, "Común"] + [None] * 7 + ["Especial"] + [None] * 4 \
    + ["Adultos"] + [None] * 4 + ["Hospitalaria", None, None, "Talleres - Artística", "Servicios complementarios", "Validez_títulos"]
NOMBRES = ["Jurisdicción", "Sector", "Ámbito", "Departamento", "Código de departamento", "Localidad", "Código de localidad", "Cueanexo",
           "Nombre", "Domicilio", "C. P.", "Teléfono", "Mail", "Común", "Especial", "Adultos", "Nivel inicial - Jardín maternal",
           "Nivel inicial - Jardín de infantes", "Primario", "Secundario", "Secundario - INET", "SNU", "SNU - INET", "SNU - Cursos",
           "Nivel inicial - Educación temprana", "Nivel inicial - Jardín de infantes", "Primario", "Secundario",
           "Integración a la modalidad común/ adultos", "Primario", "Secundario", "Formación Profesional", "Formación Profesional - INET",
           "Alfabetización", "Inicial", "Primario", "Secundario", None, None, None]
COL = {n: i for i, n in enumerate(NOMBRES) if n and n not in ("Primario", "Secundario")}
COMUN_PRIM, COMUN_SEC, COMUN_INET, ESP_PRIM, ADU_SEC = 18, 19, 20, 26, 30


def padron(filas, ruta):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.cell(10, 1, "Fecha de actualización: 16/06/2026.")
    for j, v in enumerate(BLOQUES, 1):
        if v:
            ws.cell(12, j, v)
    for j, v in enumerate(NOMBRES, 1):
        if v:
            ws.cell(13, j, v)
    for i, f in enumerate(filas, 14):
        for j, v in f.items():
            ws.cell(i, j + 1, v)
    wb.save(ruta)
    return ruta


def escuela(cue, sector="Estatal", **niveles):
    f = {COL["Jurisdicción"]: "Neuquén", COL["Sector"]: sector, COL["Ámbito"]: "Urbano", COL["Departamento"]: "Confluencia",
         COL["Código de departamento"]: "58035", COL["Localidad"]: "NEUQUEN", COL["Cueanexo"]: cue, COL["Nombre"]: "ESCUELA " + cue,
         COL["Domicilio"]: "SAN MARTÍN  100", COL["Teléfono"]: "0299 444", COL["Mail"]: "a@b.ar"}
    f.update({k: "1" for k in niveles.values()})
    return f


filas = [escuela("580000100", p=COMUN_PRIM), escuela("580000200", "Privado", s=COMUN_INET), escuela("580000300", j=16),
         escuela("580000400", p=ESP_PRIM), escuela("580000500", "Social/cooperativa", s=ADU_SEC), escuela("580000600", p=COMUN_PRIM, s=COMUN_SEC)]
e, c = est.leer_padron(padron(filas, tmp / "padron.xlsx"))
ver(c == {"fecha": "2026-06-16", "filas": 6}, f"leer_padron: control {c}")
ver(sorted(e.cueanexo) == ["580000100", "580000200", "580000600"], f"leer_padron: entran solo las comunes con primaria o secundaria, entraron {sorted(e.cueanexo)}")
fila = e.set_index("cueanexo")
ver(tuple(fila.loc["580000200", ["primaria", "secundaria", "tecnica"]]) == (0, 1, 1), "leer_padron: la técnica del INET cuenta como secundaria")
ver(tuple(fila.loc["580000600", ["primaria", "secundaria", "tecnica"]]) == (1, 1, 0), "leer_padron: primaria y secundaria juntas")
ver(fila.loc["580000100", "domicilio"] == "SAN MARTÍN 100" and fila.loc["580000100", "codigo_indec"] == "58", "leer_padron: domicilio y provincia")
ver(not {"telefono", "Teléfono", "mail", "Mail"} & set(e.columns), "leer_padron: no guarda teléfono ni correo")
ver(frena(est.leer_padron, padron(filas + [escuela("580000100", p=COMUN_PRIM)], tmp / "rep.xlsx")), "leer_padron: no frena con un CUE-anexo repetido")
ver(frena(est.leer_padron, padron([escuela("580000700", "Mixto", p=COMUN_PRIM)], tmp / "sector.xlsx")), "leer_padron: no frena con un sector nuevo")

# ---- Mapa Educativo de juguete: POINT (latitud longitud)
def mapa(puntos, ruta):
    filas = ["FID,the_geom,fna,gna,nam,fun,cue,amg,ges,mde,nen,sag,pre"]
    filas += [f"x.{i},POINT ({a} {b}),N,N,N,Activo,{cue},Urbano,Estatal,Común; ,x; ,DIEE,{pre}" for i, (cue, a, b, pre) in enumerate(puntos)]
    ruta.write_text("\n".join(filas) + "\n", encoding="utf-8")
    return ruta


m, c = est.leer_mapa(mapa([("580000100", -38.95, -68.06, "PRECISA"), ("580000200", -38.9, -68.1, "APROXIMADA"),
                           ("580000200", -38.9, -68.1, "APROXIMADA")], tmp / "mapa.csv"))
ver(len(m) == 2 and c["cue_repetidos"] == 1 and c["repetidos_con_otro_punto"] == 0, f"leer_mapa: repetidos {c}")
ver(abs(m.set_index("cue").loc["580000100", "lat"] + 38.95) < 1e-9, "leer_mapa: la primera coordenada es la latitud")
ver(frena(est.leer_mapa, mapa([("580000100", -68.06, -38.95, "PRECISA")], tmp / "mapa_al_reves.csv")), "leer_mapa: no frena con los ejes al revés")
ver(frena(est.leer_mapa, mapa([("580000100", -38.95, -68.06, "DUDOSA")], tmp / "mapa_pre.csv")), "leer_mapa: no frena con una precisión nueva")

# ---- REFES de juguete
COLS_REFES = ["ESTABLECIMIENTO_ID", "ESTABLECIMIENTO_NOMBRE", "LOCALIDAD_ID", "LOCALIDAD_NOMBRE", "CUIT", "PROVINCIA_ID", "PROVINCIA_NOMBRE",
              "DEPARTAMENTO_ID", "DEPARTAMENTO_NOMBRE", "CODLOC", "CODENT", "ORIGEN_FINANCIAMIENTO", "TIPOLOGIA_ID", "TIPOLOGIA_SIGLA",
              "TIPOLOGIA_NOMBRE", "CP", "DOMICILIO", "SITIO_WEB", "LONGITUD", "LATITUD"]


def refes(filas, ruta):
    t = pd.DataFrame([{**{c: "" for c in COLS_REFES}, **f} for f in filas], columns=COLS_REFES)
    with zipfile.ZipFile(ruta, "w") as z:
        z.writestr(zipfile.ZipInfo("refes_georef.csv", (2026, 11, 9, 7, 0, 0)), t.to_csv(index=False))
    return ruta


def hosp(i, dep="Provincial", sigla="ESCIG", prov="58", depto="035", lat="-38.95", lon="-68.06"):
    return {"ESTABLECIMIENTO_ID": str(i), "ESTABLECIMIENTO_NOMBRE": f"HOSPITAL  {i}", "PROVINCIA_ID": prov, "DEPARTAMENTO_ID": depto,
            "ORIGEN_FINANCIAMIENTO": dep, "TIPOLOGIA_SIGLA": sigla, "TIPOLOGIA_NOMBRE": "Alto riesgo", "CUIT": "30-1-0",
            "LATITUD": lat, "LONGITUD": lon}


h, c = est.leer_refes(refes([hosp(1), hosp(2, "Municipal", "ESCIRES"), hosp(3, "Privado"), hosp(4, sigla="ESSIDT"),
                             hosp(5, "Municipal", "ESCIEP", "02", "003"), hosp(6, "Nacional", lat="0", lon="0")], tmp / "refes.zip"))
ver(sorted(h.refes_id) == ["1", "5", "6"], f"leer_refes: entran los públicos con internación sin residencias, entraron {sorted(h.refes_id)}")
ver(c == {"fecha": "2026-11-09", "establecimientos": 6, "coordenadas_descartadas": 1}, f"leer_refes: control {c}")
hh = h.set_index("refes_id")
ver(hh.loc["5", "codigo_dep"] == "02021", "leer_refes: la Comuna 3 del REFES es la 02021 del INDEC")
ver(hh.loc["6", "ubicacion"] == "sin dato" and math.isnan(hh.loc["6", "lat"]), "leer_refes: una coordenada fuera del país queda sin punto")
ver(hh.loc["1", "nombre"] == "HOSPITAL 1" and "CUIT" not in h.columns, "leer_refes: nombre sin espacios dobles y sin CUIT")
ver(frena(est.leer_refes, refes([hosp(1, "Cooperativa")], tmp / "refes_dep.zip")), "leer_refes: no frena con una dependencia nueva")
ver(frena(est.leer_refes, refes([hosp(1, sigla="ESCIX")], tmp / "refes_sig.zip")), "leer_refes: no frena con una tipología con internación nueva")
ver(frena(est.leer_refes, refes([hosp(1), hosp(1)], tmp / "refes_rep.zip")), "leer_refes: no frena con un código repetido")

# ---- control de departamentos: un cuadrado de un grado con un hueco
cuadro = [np.array([[-60, -35], [-59, -35], [-59, -34], [-60, -34], [-60, -35]], float),
          np.array([[-59.6, -34.6], [-59.4, -34.6], [-59.4, -34.4], [-59.6, -34.4], [-59.6, -34.6]], float)]
r = est.fuera_km([-34.2, -34.5, -34.5], [-59.8, -59.5, -58.9], cuadro)
ver(math.isnan(r[0]), "fuera_km: un punto adentro da NaN")
esperado = 0.1 * 111.32 * math.cos(math.radians(34.5))
ver(abs(r[1] - esperado) < 0.05, f"fuera_km: un punto en el hueco está afuera, a 0,1 grado del borde del hueco (dio {r[1]:.2f})")
ver(abs(r[2] - esperado) < 0.05, f"fuera_km: un punto a 0,1 grado al este (dio {r[2]:.2f}, se esperaba {esperado:.2f})")

# ---- correcciones a mano sobre una tabla de juguete
toy = pd.DataFrame({"cueanexo": ["1", "2", "3", "4"], "codigo_dep": ["58035", "58035", "58035", "58035"],
                    "lat": [-38.95, -38.95, -38.95, -38.95], "lon": [-68.06, -68.06, -68.06, -68.06], "ubicacion": ["precisa"] * 4})
cor = pd.DataFrame([
    {"tipo": "escuela", "id": "1", "accion": "punto", "lat_origen": -38.95, "lon_origen": -68.06, "codigo_dep_origen": "58035",
     "lat": -39.0, "lon": -68.1, "codigo_dep": None, "precision": "aproximada", "fuente": "Georef X", "fecha": "2026-11-09"},
    {"tipo": "escuela", "id": "2", "accion": "departamento", "lat_origen": -38.95, "lon_origen": -68.06, "codigo_dep_origen": "58035",
     "lat": None, "lon": None, "codigo_dep": "58042", "precision": None, "fuente": "Georef Y", "fecha": "2026-11-09"},
    {"tipo": "escuela", "id": "3", "accion": "sin_confirmar", "lat_origen": -38.95, "lon_origen": -68.06, "codigo_dep_origen": "58035",
     "lat": None, "lon": None, "codigo_dep": None, "precision": None, "fuente": "revisión", "fecha": "2026-11-09"},
    {"tipo": "escuela", "id": "4", "accion": "punto", "lat_origen": -38.0, "lon_origen": -68.06, "codigo_dep_origen": "58035",
     "lat": -39.0, "lon": -68.1, "codigo_dep": None, "precision": "aproximada", "fuente": "Georef Z", "fecha": "2026-11-09"},
    {"tipo": "escuela", "id": "9", "accion": "sin_confirmar", "lat_origen": -38.95, "lon_origen": -68.06, "codigo_dep_origen": "58035",
     "lat": None, "lon": None, "codigo_dep": None, "precision": None, "fuente": "revisión", "fecha": "2026-11-09"},
    {"tipo": "hospital", "id": "1", "accion": "sin_confirmar", "lat_origen": -38.95, "lon_origen": -68.06, "codigo_dep_origen": "58035",
     "lat": None, "lon": None, "codigo_dep": None, "precision": None, "fuente": "revisión", "fecha": "2026-11-09"}])
r = est.aplicar_correcciones(toy, cor, "escuela", "cueanexo")
tt = toy.set_index("cueanexo")
ver(tuple(tt.loc["1", ["lat", "lon", "ubicacion", "correccion"]]) == (-39.0, -68.1, "aproximada", "punto"), "aplicar_correcciones: el punto")
ver(tt.loc["2", "codigo_dep"] == "58042" and tt.loc["2", "lat"] == -38.95, "aplicar_correcciones: el departamento, sin mover el punto")
ver(tt.loc["3", "ubicacion"] == "sin confirmar" and tt.loc["3", "lat"] == -38.95, "aplicar_correcciones: sin confirmar conserva el punto de la fuente")
ver(tt.loc["4", "correccion"] == "" and tt.loc["4", "lat"] == -38.95, "aplicar_correcciones: si la fuente cambió el punto, no se aplica")
ver(r == {"aplicadas": {"punto": 1, "departamento": 1, "sin_confirmar": 1}, "no_encontradas": ["9"], "la_fuente_cambio": ["4"]},
    f"aplicar_correcciones: resumen {r}")

# ---- lo escrito, contra su control
D = est.SALIDA
if (D / "control.json").exists():
    ctl = json.loads((D / "control.json").read_text(encoding="utf-8"))
    tipos = {"cueanexo": str, "refes_id": str, "codigo_indec": str, "codigo_dep": str}
    esc = pd.read_csv(D / "escuelas.csv", dtype=tipos, keep_default_na=False, na_values=[""])
    hos = pd.read_csv(D / "hospitales.csv", dtype=tipos, keep_default_na=False, na_values=[""])
    for n in ("escuelas.csv", "hospitales.csv", "control.json"):
        ver(b"\r\n" not in (D / n).read_bytes(), f"{n}: tiene finales de línea CRLF")
    for n, t in (("escuelas", esc), ("hospitales", hos)):
        ver(not {c for c in t.columns if any(x in c.lower() for x in ("tel", "mail", "cuit"))}, f"{n}: guarda teléfono, correo o CUIT")
        ver(len(t) == ctl[n]["total"], f"{n}: {len(t)} filas, el control dice {ctl[n]['total']}")
        ver({k: int(v) for k, v in t.groupby("codigo_indec").size().items()} == ctl[n]["por_provincia"], f"{n}: los totales por provincia no dan el control")
        ver({k: int(v) for k, v in t.ubicacion.value_counts().items()} == ctl[n]["ubicacion"], f"{n}: la ubicación no da el control")
        ver(t.codigo_indec.nunique() == 24, f"{n}: no están las 24 jurisdicciones")
        ver((t.codigo_dep.str[:2] == t.codigo_indec).all(), f"{n}: un departamento de otra provincia")
        con = t.ubicacion != "sin dato"
        ver((t.lat.notna() == con).all() and (t.lon.notna() == con).all(), f"{n}: punto y ubicación no coinciden")
        ver((t.lat[con].between(*est.CAJA["lat"]) & t.lon[con].between(*est.CAJA["lon"])).all(), f"{n}: un punto fuera del país")
        ver((t.fuera_km.dropna() > 0).all(), f"{n}: fuera_km tiene ceros")
        ver(not ctl[n]["departamentos"]["codigos_de_departamento_desconocidos"], f"{n}: códigos de departamento que Georef no conoce")
    ver(esc.cueanexo.is_unique and hos.refes_id.is_unique, "códigos repetidos")
    ver(((esc.primaria == 1) | (esc.secundaria == 1)).all(), "escuelas: una sin primaria ni secundaria")
    ver((esc.secundaria[esc.tecnica == 1] == 1).all(), "escuelas: una técnica sin secundaria")
    ver(set(esc.sector) <= est.SECTORES, f"escuelas: sectores {set(esc.sector)}")
    ver(set(esc.ubicacion) <= {"precisa", "mejorada", "aproximada", "sin dato", "sin confirmar"}, f"escuelas: ubicaciones {set(esc.ubicacion)}")
    ver(set(hos.dependencia) <= est.DEP_PUBLICAS, f"hospitales: dependencias {set(hos.dependencia)}")
    ver(set(hos.tipologia) <= est.HOSPITAL, f"hospitales: tipologías {set(hos.tipologia)}")
    ver(set(hos.ubicacion) <= {"precisa", "mejorada", "aproximada", "sin dato", "sin confirmar"}, f"hospitales: ubicaciones {set(hos.ubicacion)}")
    # las correcciones a mano (decisión 6 del autor): todas con fuente y fecha, todas aplicadas, y lo corregido ya cae en su departamento
    cor = est.leer_correcciones()
    for k in ("escuelas", "hospitales"):
        ver(not ctl["correcciones"][k]["no_encontradas"] and not ctl["correcciones"][k]["la_fuente_cambio"],
            f"correcciones de {k} sin aplicar: {ctl['correcciones'][k]}")
    for n, t, clave, tipo in (("escuelas", esc, "cueanexo", "escuela"), ("hospitales", hos, "refes_id", "hospital")):
        ids = set(cor[cor.tipo == tipo].id)
        ver(ids <= set(t[clave]), f"{n}: correcciones de códigos que no están")
        hechas = t[t.correccion.notna()]
        ver(set(hechas[clave]) == ids, f"{n}: las filas corregidas no son las de correcciones.csv")
        ver(hechas.correccion_fuente.notna().all(), f"{n}: una corrección sin fuente")
        ok = hechas[hechas.correccion != "sin confirmar"]
        ver(not (ok.fuera_km > est.BORDE_KM).any(), f"{n}: una corrección que sigue fuera de su departamento: {ok[ok.fuera_km > est.BORDE_KM][clave].tolist()}")
        ver((t.ubicacion == "sin confirmar").sum() == (hechas.correccion == "sin confirmar").sum(), f"{n}: sin confirmar que no salen de la revisión")
    ver(ctl["escuelas"]["padron_filas"] >= ctl["escuelas"]["total"], "escuelas: más filas que el padrón")
else:
    fallas.append("no está datos/manual/establecimientos/control.json: correr python scripts/establecimientos.py")

if fallas:
    print("prueba_establecimientos: FALLA")
    for f in fallas:
        print(" -", f)
    sys.exit(1)
print("prueba_establecimientos: bien (limpieza de domicilios, Georef, códigos del REFES, padrón, Mapa Educativo, REFES, departamentos"
      ", correcciones a mano y lo escrito contra su control)")
