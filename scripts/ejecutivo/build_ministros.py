# -*- coding: utf-8 -*-
"""Construye ministros.csv a partir de:
  1. wp_gabinetes_raw.csv  (parse_wikipedia_gabinetes.py: anexos 'Gabinete de Ministros de X' de Wikipedia ES)
  2. correcciones manuales verificadas contra los anexos por ministerio (parse_wikipedia_por_ministerio.py)
  3. personas_nacimiento_raw.csv (build_personas.py: Wikidata P19/P131 + ficha de Wikipedia ES)
  4. wd_raw.csv (consulta 1 de ministros_wikidata.rq) para medir cobertura de Wikidata P39.
Regla para el lugar de nacimiento: Wikidata si coincide con Wikipedia ES o si WP ES solo dice
'Buenos Aires'/vacío (WD más específico); si discrepan, se resuelve a mano (OVERRIDES) y se marca.
"""
import os
import re

import pandas as pd

from birthplaces import GBA24, GRAN_LA_PLATA, PROVINCIAS, norm

HERE = os.path.dirname(os.path.abspath(__file__))
CABA = "Ciudad Autónoma de Buenos Aires"

PRES_PERIODOS = [  # para recortar fechas y asignar presidente
    ("Raúl Alfonsín", "1983-12-10", "1989-07-08"), ("Carlos Menem", "1989-07-08", "1999-12-10"),
    ("Fernando de la Rúa", "1999-12-10", "2001-12-21"), ("Ramón Puerta", "2001-12-21", "2001-12-23"),
    ("Adolfo Rodríguez Saá", "2001-12-23", "2001-12-30"), ("Eduardo Camaño", "2001-12-30", "2002-01-01"),
    ("Eduardo Duhalde", "2002-01-02", "2003-05-25"), ("Néstor Kirchner", "2003-05-25", "2007-12-10"),
    ("Cristina Fernández de Kirchner", "2007-12-10", "2015-12-10"), ("Mauricio Macri", "2015-12-10", "2019-12-10"),
    ("Alberto Fernández", "2019-12-10", "2023-12-10"), ("Javier Milei", "2023-12-10", "2026-09-29"),
]

# ---------------- correcciones de cargos (verificadas contra anexos por ministerio) ----------------
FIX_ROWS = [
    # (presidente, articulo, ministerio_actual_regex, cambios dict, nota)
    ("Carlos Menem", "Rodolfo Díaz", "Trabajo", {"inicio": "1992-01-16"},
     "Inicio corregido 1991-01-16->1992-01-16 (sucede a Triaca, que sale el 16/01/1992; Anexo:Ministros de Trabajo)"),
    ("Cristina Fernández de Kirchner", "Florencio Randazzo", "Interior", {},
     "Desde 06/06/2012 Interior y Transporte"),
    ("Mauricio Macri", "Carolina Stanley", "Salud y Desarrollo",
     {"ministerio": "Ministerio de Desarrollo Social", "fin": "2018-09-05"},
     "Anexo de gabinete la listaba como 'Salud y Desarrollo Social' desde 2015; dividido en dos filas"),
    ("Adolfo Rodríguez Saá", "Luis Bernardo Lusquiños", "Jefatura", {},
     "Casa Rosada (ficha de Rodríguez Saá) indica como JGM a Jorge Obeid y Wikidata tiene a ambos; el artículo WP ES de Obeid afirma que rechazó el cargo y que es un error difundido. Se mantiene Lusquiños"),
    ("Eduardo Duhalde", "Juan José Álvarez", "Justicia", {},
     "Fecha de inicio dudosa: Anexo:Ministros de Justicia indica 10/07/2002"),
]
_CR = "https://www.casarosada.gob.ar/nuestro-pais/presidentes/"
_P = "Ramón Puerta"
_PN = f"Agregado desde Casa Rosada ({_CR}47089-federico-ramon-puerta-2001); Wikipedia ES no tiene anexo de gabinete de Puerta; fechas = período presidencial"
_CN = f"Agregado desde Casa Rosada ({_CR}47087-eduardo-oscar-camano-2001); Wikipedia ES no tiene anexo; fechas = período presidencial"
ADD_ROWS = [
    # --- gabinetes de los interinatos (Casa Rosada; Schiavoni y Cafiero confirmados por sus artículos WP ES y Wikidata P39)
    dict(presidente=_P, ministerio="Jefatura de Gabinete de Ministros", articulo_wp="Humberto Schiavoni",
         inicio="2001-12-21", fin="2001-12-23", partido_wp="Partido Justicialista", nota=_PN),
    dict(presidente=_P, ministerio="Ministerio de Economía, Desarrollo Social, Trabajo y Salud",
         articulo_wp="Jorge Capitanich", inicio="2001-12-21", fin="2001-12-23", partido_wp="Partido Justicialista", nota=_PN),
    dict(presidente=_P, ministerio="Ministerio del Interior y de Justicia", articulo_wp="Miguel Ángel Toma",
         inicio="2001-12-21", fin="2001-12-23", partido_wp="", nota=_PN),
    dict(presidente=_P, ministerio="Ministerio de Relaciones Exteriores y Culto",
         articulo_wp="Adalberto Rodríguez Giavarini", inicio="2001-12-21", fin="2001-12-23",
         partido_wp="Unión Cívica Radical", nota=_PN + " (continuidad del gabinete de De la Rúa)"),
    dict(presidente=_P, ministerio="Ministerio de Defensa", articulo_wp="Horacio Jaunarena", inicio="2001-12-21",
         fin="2001-12-23", partido_wp="Unión Cívica Radical", nota=_PN + " (continuidad del gabinete de De la Rúa)"),
    dict(presidente=_P, ministerio="Ministerio de Educación", articulo_wp="Ricardo Biazzi", inicio="2001-12-21",
         fin="2001-12-23", partido_wp="", nota=_PN),
    dict(presidente="Adolfo Rodríguez Saá", ministerio="Secretaría de Justicia y Asuntos Legislativos (rango de ministro)", articulo_wp="Alberto Zuppi",
         inicio="2001-12-23", fin="2001-12-30", partido_wp="",
         nota=f"Agregado desde Casa Rosada ({_CR}47088-adolfo-rodriguez-saa-2001); en el anexo WP ES figura en 'Secretarías'; su artículo WP ES le asigna rango de ministro"),
    dict(presidente="Eduardo Camaño", ministerio="Jefatura de Gabinete de Ministros", articulo_wp="Antonio Cafiero",
         inicio="2001-12-30", fin="2002-01-01", partido_wp="Partido Justicialista", nota=_CN),
    dict(presidente="Eduardo Camaño", ministerio="Ministerio del Interior", articulo_wp="Rodolfo Gabrielli",
         inicio="2001-12-30", fin="2002-01-01", partido_wp="Partido Justicialista", nota=_CN),
    # --- correcciones detectadas contra anexos por ministerio
    dict(presidente="Cristina Fernández de Kirchner", ministerio="Ministerio del Interior",
         articulo_wp="Florencio Randazzo", inicio="2007-12-10", fin="2012-06-06", partido_wp="Partido Justicialista",
         nota="Agregado: faltaba en el anexo de gabinete (sí en Anexo:Ministros del Interior)"),
    dict(presidente="Mauricio Macri", ministerio="Ministerio de Salud y Desarrollo Social",
         articulo_wp="Carolina Stanley", inicio="2018-09-05", fin="2019-12-10", partido_wp="Propuesta Republicana",
         nota="Agregado (Salud absorbida el 05/09/2018)"),
    dict(presidente="Mauricio Macri", ministerio="Ministerio de Agricultura, Ganadería y Pesca",
         articulo_wp="Luis Miguel Etchevehere", inicio="2019-08-02", fin="2019-12-10", partido_wp="Independiente",
         nota="Agregado: ministerio restituido en 2019 (Anexo:Ministros de Agricultura)"),
    dict(presidente="Fernando de la Rúa", ministerio="Ministerio de Economía", articulo_wp="Nicolás Gallo",
         inicio="2001-12-20", fin="2001-12-21", partido_wp="Unión Cívica Radical",
         nota="Agregado: interino tras la renuncia de Cavallo (Anexo:Ministros de Economía)"),
]

# ---------------- lugar de nacimiento: resoluciones manuales ----------------
# articulo -> (localidad, partido/departamento, provincia, motivo)
OVERRIDES = {
    "Domingo Cavallo": ("San Francisco", "San Justo", "Córdoba",
                        "Wikidata P19 apunta a San Francisco (Catamarca) por error; WP ES: San Francisco, Córdoba"),
    "José Luis Machinea": ("Puerto Madryn", "Biedma", "Chubut", "WP ES: Puerto Madryn; Wikidata: Buenos Aires"),
    "Julián Domínguez": ("Chacabuco", "Chacabuco", "Buenos Aires", "WP ES: Chacabuco; Wikidata: Córdoba"),
    "Jorge Matzkin": ("Rivera", "Adolfo Alsina", "Buenos Aires", "WP ES: Rivera (BA); Wikidata: prov. La Pampa"),
    "Alfredo Atanasof": ("La Plata", "La Plata", "Buenos Aires", "WP ES: La Plata; Wikidata: Buenos Aires (CABA)"),
    "Felisa Miceli": ("Luján", "Luján", "Buenos Aires", "WP ES: Luján; Wikidata: Carlos Casares"),
    "Andrés Horacio Ibarra": ("Vicente López", "Vicente López", "Buenos Aires",
                              "Wikidata: Partido de Vicente López; WP ES: 'Buenos Aires' (ambiguo). AMBA en ambos casos"),
    "Gabriel Katopodis": ("General San Martín", "General San Martín", "Buenos Aires",
                          "Wikidata: San Martín; WP ES: 'Buenos Aires' (ambiguo). AMBA en ambos casos"),
    "Roberto José Dromi": ("Mendoza", "Capital", "Mendoza", "WP ES: Mendoza; Wikidata lista Mendoza y Rivadavia"),
    "Jaime Perczyk": ("Buenos Aires (Palermo)", CABA, CABA, "WP ES (entradilla): Palermo, Buenos Aires"),
    "Antonio Salonia": ("General Alvear", "General Alvear", "Mendoza", "Solo WP ES (Wikidata sin P19)"),
    "Adalberto Rodríguez Giavarini": ("", "", "Buenos Aires",
                                      "Solo 'Provincia de Buenos Aires' (WP ES y Wikidata): AMBA indeterminado"),
    "Alberto Flamarique": ("", "", "Mendoza", "Solo 'Provincia de Mendoza'"),
    "Ricardo Buryaile": ("", "Patiño", "Formosa", "Solo 'Departamento Patiño'"),
    "Juan José Álvarez": ("Hurlingham", "Hurlingham", "Buenos Aires", ""),
    "Alberto Iribarne": ("Buenos Aires", CABA, CABA, "Wikidata solo 'Argentina'; WP ES: Buenos Aires"),
    "Héctor Lombardo": ("Buenos Aires", CABA, CABA, "Solo WP ES (Wikidata sin P19)"),
    "Néstor Mario Rapanelli": ("Buenos Aires", CABA, CABA, "Solo WP ES (Wikidata sin P19)"),
    "Pedro Trucco": ("Buenos Aires", CABA, CABA, "Solo WP ES (Wikidata sin P19)"),
    "Raúl Granillo Ocampo": ("Anillaco", "Castro Barros", "La Rioja", ""),
    "Jorge Alberto Rodríguez": ("Coronel Hilario Lagos", "Chapaleufú", "La Pampa", ""),
    "Oraldo Britos": ("Villa Mercedes", "General Pedernera", "San Luis", "WP ES: San Luis (provincia); Wikidata: Villa Mercedes"),
    "Sabina Frederic": ("Lomas de Zamora", "Lomas de Zamora", "Buenos Aires", "Wikidata; WP ES solo 'Buenos Aires'"),
    "Luis Basterra": ("Resistencia", "San Fernando", "Chaco", "WP ES: Resistencia; Wikidata: prov. del Chaco"),
    "Juan Cabandié": ("Buenos Aires (nacido en la ESMA)", CABA, CABA, ""),
    "Teresa Parodi": ("Corrientes", "Capital", "Corrientes", "Wikidata con dos P19 (ciudad y provincia); WP ES: Corrientes"),
    "Ricardo Biazzi": ("San Francisco", "San Justo", "Córdoba",
                       "Wikidata P19 apunta a San Francisco (Catamarca) por error; WP ES: San Francisco, Córdoba"),
    "Miguel Ángel Toma": ("Muñiz", "San Miguel", "Buenos Aires", "WP ES: Muñiz; Wikidata: solo provincia de Buenos Aires"),
    "Alberto Zuppi": ("", "", "", "Sin dato en Wikipedia ES ni Wikidata"),
    "Carlos Alderete": ("", "", "", "Sin dato en Wikipedia ES ni Wikidata"),
    "Julio Corzo": ("", "", "", "Sin dato (Wikidata: solo 'Argentina')"),
    "Miguel Ángel Roig": ("", "", "", "Sin dato (Wikidata: solo 'Argentina')"),
}
PARTIDO_ALIAS = {"San Martín": "General San Martín", "General Pueyrredón": "General Pueyrredon"}


def presidente_de(fecha):
    for p, a, b in PRES_PERIODOS:
        if a <= fecha < b:
            return p
    return None


def main():
    g = pd.read_csv(os.path.join(HERE, "wp_gabinetes_raw.csv"), dtype=str)
    g["nota"] = ""
    for pres, art, mre, ch, nota in FIX_ROWS:
        m = (g.presidente == pres) & (g.articulo_wp == art) & g.ministerio.str.contains(mre)
        assert m.sum() == 1, (pres, art, m.sum())
        for k, v in ch.items():
            g.loc[m, k] = v
        g.loc[m, "nota"] = nota
    g = pd.concat([g, pd.DataFrame(ADD_ROWS)], ignore_index=True)
    g["nota"] = g["nota"].fillna("")

    # nombre = título canónico sin desambiguación
    raw = pd.read_csv(os.path.join(HERE, "personas_nacimiento_raw.csv"), dtype=str)
    from resolve_titles import resolve
    res = resolve(list(g.articulo_wp.dropna()))
    g["articulo_wp"] = g.articulo_wp.map(lambda t: res[t][0])
    g["qid"] = g.articulo_wp.map({v[0]: v[1] for v in res.values()})
    g["nombre"] = g.articulo_wp.str.replace(r"\s*\(.*\)$", "", regex=True)
    g["ministerio"] = g.ministerio.str.replace("​", "").str.replace(r"\s*\((disuelto)\)", " (disuelto)",
                                                                           regex=True).str.strip()
    # recorte al período presidencial
    rng = {p: (a, b) for p, a, b in PRES_PERIODOS}
    g["fin_en_fuente"] = g["fin"]
    for i, r in g.iterrows():
        a, b = rng[r.presidente]
        if isinstance(r.fin, str) and r.fin > b and r.presidente != "Javier Milei":
            g.at[i, "fin"] = b
            g.at[i, "nota"] = (r.nota + "; " if r.nota else "") + f"fin recortado al fin de la presidencia (fuente: {r.fin})"
    g["en_ejercicio"] = g.fin.isna()

    # partido
    g["partido"] = g.partido_wp.fillna("").str.replace("​", "").str.replace(r"^>\s*", "", regex=True).str.strip()
    g["partido"] = g.partido.replace({"Ind.": "Independiente", "nan": ""})
    g["partido"] = g.partido.str.replace("político independiente", "Independiente")
    wdp = raw.set_index("articulo_wp")["wd_partidos_politicos"]
    g["partido_fuente"] = "Wikipedia ES (anexo de gabinete)"
    m = g.partido.eq("")
    g.loc[m, "partido"] = g.loc[m, "articulo_wp"].map(wdp).fillna("")
    g.loc[m, "partido_fuente"] = "Wikidata P102"
    g.loc[m & g.partido.eq(""), "partido_fuente"] = ""
    g["partido"] = g.partido.str.replace("político independiente", "Independiente")

    # nacimiento
    raw = raw.set_index("articulo_wp")
    out = []
    for t in g.articulo_wp:
        r = raw.loc[t]
        if t in OVERRIDES:
            loc, part, prov, why = OVERRIDES[t]
            fuente = "manual (ver nota)"
        else:
            loc = r.wd_birth if isinstance(r.wd_birth, str) else ""
            prov = r.wd_provincia if isinstance(r.wd_provincia, str) else ""
            part = r.wd_partido if isinstance(r.wd_partido, str) else ""
            why = ""
            fuente = "Wikidata P19/P131; coincide con Wikipedia ES"
            wpf = r.wp_ficha_nacimiento if isinstance(r.wp_ficha_nacimiento, str) else ""
            if not wpf or wpf.startswith("|") or norm(wpf).startswith("buenos aires"):
                fuente = "Wikidata P19/P131 (WP ES sin dato o genérico)"
            if prov == CABA and loc != "Buenos Aires":
                loc = f"Buenos Aires ({loc})"
        part = PARTIDO_ALIAS.get(part, part) if prov == "Buenos Aires" else part
        part = part[:1].upper() + part[1:] if part else part
        if prov == "Buenos Aires" and not part and loc:
            part = loc
        amba = None
        if prov == CABA:
            amba = True
        elif prov == "Buenos Aires":
            amba = (part in GBA24) if part else None  # sin partido: indeterminado
        elif prov:
            amba = False
        out.append(dict(lugar_nacimiento=loc, partido_departamento_nacimiento=part, provincia_nacimiento=prov,
                        amba=amba, gran_la_plata=(prov == "Buenos Aires" and part in GRAN_LA_PLATA),
                        fuente_nacimiento=fuente, nota_nacimiento=why,
                        wd_lugar_nacimiento=r.wd_birth, wp_ficha_nacimiento=r.wp_ficha_nacimiento))
    g = pd.concat([g.reset_index(drop=True), pd.DataFrame(out)], axis=1)
    bad = g[~g.provincia_nacimiento.isin(PROVINCIAS + [""]) & ~g.provincia_nacimiento.str.startswith("Exterior")]
    assert bad.empty, bad[["nombre", "provincia_nacimiento"]]

    # cobertura Wikidata P39: ¿hay una declaración para esta persona que se solape con el período?
    wd = pd.read_csv(os.path.join(HERE, "wd_raw.csv"), dtype=str)
    wd["qid"] = wd.person.str.rsplit("/", n=1).str[1]
    wd["s"] = wd.start.str[:10]
    wd["e"] = wd.end.str[:10]

    def en_wd(r):
        c = wd[wd.qid == r.qid]
        if c.empty:
            return "no"
        fin = r.fin if isinstance(r.fin, str) else "9999"
        for x in c.itertuples():
            s = x.s if isinstance(x.s, str) else None
            e = x.e if isinstance(x.e, str) else "9999"
            if s and s <= fin and e >= r.inicio:
                return "si"
        return "persona_sin_fechas_coincidentes"
    g["wikidata_p39"] = g.apply(en_wd, axis=1)

    cols = ["nombre", "ministerio", "inicio", "fin", "en_ejercicio", "presidente", "partido", "partido_fuente",
            "lugar_nacimiento", "partido_departamento_nacimiento", "provincia_nacimiento", "amba", "gran_la_plata",
            "fuente_nacimiento", "nota_nacimiento", "wikidata", "articulo_wp", "wikidata_p39", "fin_en_fuente",
            "nota", "wd_lugar_nacimiento", "wp_ficha_nacimiento"]
    g = g.rename(columns={"qid": "wikidata"})
    g["articulo_wp"] = "https://es.wikipedia.org/wiki/" + g.articulo_wp.str.replace(" ", "_")
    order = {p: i for i, (p, _, _) in enumerate(PRES_PERIODOS)}
    g = g.assign(_o=g.presidente.map(order)).sort_values(["_o", "ministerio", "inicio"])[cols]
    g.to_csv(os.path.join(HERE, "ministros.csv"), index=False, encoding="utf-8")
    print(len(g), "filas;", g.nombre.nunique(), "personas")


if __name__ == "__main__":
    main()
