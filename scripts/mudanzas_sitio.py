"""Los datos de la herramienta de mudanzas y población (mudanzas.html, 25 de noviembre de 2026, docs/roadmap/MUDANZAS.md).

Lee lo que guardó una vez scripts/censo_2022_mudanzas.py en datos/manual/ (la matriz de residencia entre jurisdicciones y la población de 2010 y 2022 por
departamento) y las viviendas por departamento de datos/manual/censo2022_departamentos.csv (scripts/censo_2022_vivienda.py), y arma:
- datos/mudanzas.json, lo único que baja scripts/mudanzas.js
- datos/mudanzas_matriz.csv, datos/mudanzas_provincias.csv y datos/mudanzas_departamentos.csv, las tablas que se descargan
- datos/vecinos.topo.json, el fondo del mapa: los países de alrededor, de Natural Earth a 1:50 millones (world-atlas, scripts/lib)

El saldo sale solo de las personas que dijeron de qué provincia venían: con quienes no lo dijeron no se sabe de dónde se fueron. Como prueba de robustez se
calcula otra vez repartiéndolas, en cada destino, en la misma proporción que las demás (saldo_repartido).
"""
import csv
import json
import pathlib

RAIZ = pathlib.Path(__file__).resolve().parent.parent
MANUAL = RAIZ / "datos" / "manual"
NOMBRES = {"02": "CABA", "06": "Buenos Aires", "10": "Catamarca", "14": "Córdoba", "18": "Corrientes", "22": "Chaco", "26": "Chubut", "30": "Entre Ríos",
           "34": "Formosa", "38": "Jujuy", "42": "La Pampa", "46": "La Rioja", "50": "Mendoza", "54": "Misiones", "58": "Neuquén", "62": "Río Negro",
           "66": "Salta", "70": "San Juan", "74": "San Luis", "78": "Santa Cruz", "82": "Santa Fe", "86": "Santiago del Estero", "90": "Tucumán",
           "94": "Tierra del Fuego"}
# departamentos creados entre los dos censos: su cambio de población es el de los dos juntos, como lo publica el INDEC
JUNTOS = {"06218": ("06218", "06466"), "06466": ("06218", "06466"), "94008": ("94008", "94011"), "94011": ("94008", "94011")}
MOTIVOS = ["uso_temporal", "alquiler_venta", "en_construccion", "residentes_ausentes", "oficina_comercio", "otra_situacion"]
VECINOS = {"152": "Chile", "068": "Bolivia", "600": "Paraguay", "076": "Brasil", "858": "Uruguay", "604": "Perú"}


def leer(nombre):
    with open(MANUAL / nombre, encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def calcular():
    cods = sorted(NOMBRES)
    m = {(r["origen"], r["destino"]): int(r["personas"]) for r in leer("censo2022_mudanzas_matriz.csv")}
    assert {o for o, _ in m} == set(cods) | {"ignorada", "exterior"} and {d for _, d in m} == set(cods)
    deps = leer("censo2022_mudanzas_departamentos.csv")
    ent = lambda v: int(v) if v != "" else None
    provs = []
    llegan = {c: sum(m[o, c] for o in cods if o != c) for c in cods}
    for c in cods:
        se_van = sum(m[c, d] for d in cods if d != c)
        viven = sum(m[o, c] for o in cods) + m["ignorada", c] + m["exterior", c]
        van_rep = sum(m[c, d] * (1 + m["ignorada", d] / llegan[d]) for d in cods if d != c)
        p10, p22 = (sum(ent(r[k]) or 0 for r in deps if r["codigo_indec"] == c) for k in ("poblacion_2010", "poblacion_2022"))
        provs.append({"codigo_indec": c, "territorio": NOMBRES[c], "viven_5_mas": viven, "llegaron": llegan[c], "se_fueron": se_van, "saldo": llegan[c] - se_van,
                      "saldo_cada_1000": round((llegan[c] - se_van) / viven * 1000, 4), "llegaron_sin_decir_provincia": m["ignorada", c],
                      "pct_sin_decir": round(m["ignorada", c] / (llegan[c] + m["ignorada", c]) * 100, 4), "llegaron_de_otro_pais": m["exterior", c],
                      "saldo_repartido": round(llegan[c] + m["ignorada", c] - van_rep), "poblacion_2010": p10, "poblacion_2022": p22,
                      "cambio_pct": round((p22 / p10 - 1) * 100, 4)})
    assert sum(p["saldo"] for p in provs) == 0 and abs(sum(p["saldo_repartido"] for p in provs)) <= 24
    viv = {r["codigo_dep"]: r for r in leer("censo2022_departamentos.csv")}
    por = {r["codigo_dep"]: r for r in deps}
    filas = []
    for r in deps:
        c = r["codigo_dep"]
        if c not in viv:  # Antártida e Islas del Atlántico Sur: solo las bases, sin viviendas particulares
            assert c == "94028"
            continue
        grupo = JUNTOS.get(c, (c,))
        p10 = sum(ent(por[g]["poblacion_2010"]) or 0 for g in grupo)
        p22 = sum(ent(por[g]["poblacion_2022"]) for g in grupo)
        v = viv[c]
        con, sin = int(v["con_personas"]), int(v["sin_personas"])
        assert int(v["viviendas"]) == con + sin, c
        assert sum(int(v[k]) for k in MOTIVOS) == sin, (c, sin, [v[k] for k in MOTIVOS])
        filas.append({"codigo_dep": c, "codigo_indec": r["codigo_indec"], "departamento": r["departamento"],
                      "poblacion_2010": ent(r["poblacion_2010"]), "poblacion_2022": ent(r["poblacion_2022"]),
                      "cambio_personas": p22 - p10, "cambio_pct": round((p22 / p10 - 1) * 100, 4),
                      "se_compara_con": " y ".join(por[g]["departamento"] for g in grupo) if len(grupo) > 1 else "",
                      "viven_5_mas": ent(r["residencia_total"]), "llegaron_de_otra_provincia": ent(r["otra_provincia"]),
                      "llegaron_de_otro_pais": ent(r["otro_pais"]), "viviendas_particulares": con + sin, "viviendas_sin_personas": sin,
                      **{k: int(v[k]) for k in MOTIVOS}})
    assert len(filas) == 527
    return cods, m, provs, filas


def escribir_csv(ruta, filas):
    with open(ruta, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(filas[0]), lineterminator="\n")
        w.writeheader()
        w.writerows(filas)


def vecinos(salida):
    """Solo los países de alrededor, con los arcos que usan, del mapa del mundo que ya está en scripts/lib."""
    t = json.loads((RAIZ / "scripts" / "lib" / "world-atlas-2.0.2-countries-50m.json").read_text(encoding="utf-8"))
    geos = [g for g in t["objects"]["countries"]["geometries"] if g.get("id") in VECINOS]
    assert len(geos) == len(VECINOS)
    usados = {}

    def arco(i):
        real = ~i if i < 0 else i
        n = usados.setdefault(real, len(usados))
        return ~n if i < 0 else n

    def recorrer(a):
        return [recorrer(x) for x in a] if isinstance(a[0], list) else [arco(x) for x in a]

    nuevas = [{"type": g["type"], "id": g["id"], "properties": {"nombre": VECINOS[g["id"]]}, "arcs": recorrer(g["arcs"])} for g in geos]
    datos = {"type": "Topology", "transform": t["transform"], "objects": {"vecinos": {"type": "GeometryCollection", "geometries": nuevas}},
             "arcs": [t["arcs"][i] for i in usados]}
    salida.write_text(json.dumps(datos, ensure_ascii=False, separators=(",", ":")), encoding="utf-8", newline="\n")


def armar(carpeta):
    cods, m, provs, filas = calcular()
    escribir_csv(carpeta / "mudanzas_matriz.csv", [
        {"origen_codigo": o, "origen": NOMBRES.get(o, {"ignorada": "Otra provincia, sin decir cuál", "exterior": "Otro país"}.get(o)), "destino_codigo": d,
         "destino": NOMBRES[d], "personas": m[o, d]} for o in cods + ["ignorada", "exterior"] for d in cods])
    escribir_csv(carpeta / "mudanzas_provincias.csv", provs)
    escribir_csv(carpeta / "mudanzas_departamentos.csv", filas)
    vecinos(carpeta / "vecinos.topo.json")
    datos = {"desde": 2017, "anio": 2022, "censo_antes": 2010,
             "prov": [[p["codigo_indec"], p["territorio"], p["viven_5_mas"], p["llegaron_sin_decir_provincia"], p["llegaron_de_otro_pais"], p["saldo_repartido"],
                       p["poblacion_2010"], p["poblacion_2022"]] for p in provs],
             "m": [[m[o, d] for d in cods] for o in cods],
             "motivos": MOTIVOS,
             "dep": [[f["codigo_dep"], f["departamento"], f["poblacion_2010"], f["poblacion_2022"], f["cambio_personas"], f["cambio_pct"], f["se_compara_con"],
                      f["viven_5_mas"], f["llegaron_de_otra_provincia"], f["llegaron_de_otro_pais"], f["viviendas_particulares"], f["viviendas_sin_personas"],
                      *[f[k] for k in MOTIVOS]] for f in filas]}
    (carpeta / "mudanzas.json").write_text(json.dumps(datos, ensure_ascii=False, separators=(",", ":")), encoding="utf-8", newline="\n")
    return f"mudanzas: {len(provs)} jurisdicciones, {len(filas)} departamentos"


if __name__ == "__main__":
    print(armar(RAIZ / "sitio" / "datos"))
    for p in sorted(calcular()[2], key=lambda p: -p["saldo"]):
        print(f'{p["territorio"]:20} {p["saldo"]:8} repartido {p["saldo_repartido"]:8} {"CAMBIA EL SIGNO" if p["saldo"] * p["saldo_repartido"] < 0 else ""} sin decir {p["pct_sin_decir"]:.1f}%')
