# -*- coding: utf-8 -*-
"""Lugar de nacimiento de personas (por QID):
  - Wikidata: P19 + cadena P131 (ancestros administrativos) + país (P17)
  - Wikipedia ES: parámetro 'lugar de nacimiento' de la ficha (wikitexto)
Clasifica provincia (24 jurisdicciones o 'Exterior (país)'), partido/departamento y AMBA (INDEC)."""
import re
import unicodedata

from wp_common import sparql, wp

# 24 partidos del Gran Buenos Aires (INDEC, "¿Qué es el Gran Buenos Aires?", 2003)
GBA24 = ["Almirante Brown", "Avellaneda", "Berazategui", "Esteban Echeverría", "Ezeiza",
         "Florencio Varela", "General San Martín", "Hurlingham", "Ituzaingó", "José C. Paz",
         "La Matanza", "Lanús", "Lomas de Zamora", "Malvinas Argentinas", "Merlo", "Moreno",
         "Morón", "Quilmes", "San Fernando", "San Isidro", "San Miguel", "Tigre",
         "Tres de Febrero", "Vicente López"]
GRAN_LA_PLATA = ["La Plata", "Berisso", "Ensenada"]

PROVINCIAS = ["Ciudad Autónoma de Buenos Aires", "Buenos Aires", "Catamarca", "Chaco", "Chubut", "Córdoba",
              "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones",
              "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe",
              "Santiago del Estero", "Tierra del Fuego", "Tucumán"]
# QIDs de primer nivel en Wikidata: se obtienen por SPARQL (instancias de "provincia de Argentina" Q44753)
# + CABA (Q1486). (Verificado: no confiar en QIDs de memoria.)
def _load_prov():
    r = sparql('SELECT ?p ?pLabel WHERE { ?p wdt:P31 wd:Q44753 . '
               'SERVICE wikibase:label { bd:serviceParam wikibase:language "es". } }')
    out = {"Q1486": "Ciudad Autónoma de Buenos Aires"}
    for b in r["results"]["bindings"]:
        q = b["p"]["value"].rsplit("/", 1)[1]
        lab = re.sub(r"^Provincia de(l)? ", "", b["pLabel"]["value"])
        lab = "Tierra del Fuego" if lab.startswith("Tierra del Fuego") else lab
        if lab in PROVINCIAS:
            out[q] = lab
    return out


PROV_QID = _load_prov()


def norm(s):
    s = unicodedata.normalize("NFKD", s or "").encode("ascii", "ignore").decode().lower()
    return re.sub(r"\s+", " ", s).strip()


QUERY_BIRTH = """
SELECT ?person ?birth ?birthLabel ?country ?countryLabel ?anc ?ancLabel ?ancType ?party ?partyLabel WHERE {
  VALUES ?person { %s }
  OPTIONAL { ?person wdt:P19 ?birth .
             OPTIONAL { ?birth wdt:P17 ?country }
             OPTIONAL { ?birth wdt:P131+ ?anc . OPTIONAL { ?anc wdt:P31 ?ancType } } }
  OPTIONAL { ?person wdt:P102 ?party }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "es,en". }
}"""


def wikidata_birth(qids):
    qids = sorted(set(q for q in qids if q))
    info = {}
    for i in range(0, len(qids), 60):
        chunk = qids[i:i + 60]
        res = sparql(QUERY_BIRTH % " ".join("wd:" + q for q in chunk))
        for b in res["results"]["bindings"]:
            q = b["person"]["value"].rsplit("/", 1)[1]
            d = info.setdefault(q, {"births": {}, "parties": {}})
            if "birth" in b:
                bq = b["birth"]["value"].rsplit("/", 1)[1]
                e = d["births"].setdefault(bq, {"label": b["birthLabel"]["value"], "country": None, "anc": {}})
                if "countryLabel" in b:
                    e["country"] = b["countryLabel"]["value"]
                    e["country_qid"] = b["country"]["value"].rsplit("/", 1)[1]
                if "anc" in b:
                    aq = b["anc"]["value"].rsplit("/", 1)[1]
                    e["anc"].setdefault(aq, {"label": b["ancLabel"]["value"], "types": set()})
                    if "ancType" in b:
                        e["anc"][aq]["types"].add(b["ancType"]["value"].rsplit("/", 1)[1])
            if "party" in b:
                d["parties"][b["party"]["value"].rsplit("/", 1)[1]] = b["partyLabel"]["value"]
    return info


PARTIDO_BA_TYPE = "Q13997861"  # partido de la provincia de Buenos Aires (verificado)


def classify_wd(e, birth_qid):
    """Devuelve (provincia, partido_depto) a partir de la cadena P131 de Wikidata."""
    anc = e["anc"]
    prov = None
    if birth_qid in PROV_QID:
        prov = PROV_QID[birth_qid]
    for aq in anc:
        if aq in PROV_QID and prov is None:
            prov = PROV_QID[aq]
    # CABA: barrios / comunas cuelgan de Q1486
    if birth_qid == "Q1486" or "Q1486" in anc:
        return "Ciudad Autónoma de Buenos Aires", "Ciudad Autónoma de Buenos Aires"
    partido = None
    for aq, a in anc.items():
        if aq in PROV_QID or aq == "Q414":
            continue
        lab = re.sub(r"^(Partido|Departamento) (de |del )?", "", a["label"])
        if PARTIDO_BA_TYPE in a["types"] or norm(a["label"]).startswith(("partido", "departamento")):
            partido = lab
            break
    if partido is None and prov == "Buenos Aires":
        # la localidad misma puede ser cabecera homónima del partido (p.ej. 'Quilmes')
        partido = None
    if prov is None and e.get("country_qid") and e.get("country_qid") != "Q414":
        prov = "Exterior (" + (e.get("country") or "?") + ")"
    return prov, partido


# ---------- Wikipedia ES: ficha ----------
def wp_infobox_birth(title):
    r = wp({"action": "parse", "page": title, "prop": "wikitext", "redirects": 1, "section": 0})
    if "error" in r:
        return None
    t = r["parse"]["wikitext"]
    m = re.search(r"\|\s*lugar[ _]de[ _]nacimiento\s*=\s*(.*?)\n\s*\|", t, re.I | re.S)
    if not m:
        m = re.search(r"\|\s*lugar[ _]de[ _]nacimiento\s*=\s*([^\n]*)", t, re.I)
    if not m:
        # texto de entrada: "(Localidad, 3 de mayo de 1950)"
        m2 = re.search(r"\(\s*\[\[([^\]]+)\]\][^)]{0,120}?\d{4}", t)
        return ("LEAD:" + m2.group(0)) if m2 else None
    v = m.group(1).strip()
    return v


def clean_wikitext(v):
    if not v:
        return ""
    v = re.sub(r"<ref[^>]*/>", "", v)
    v = re.sub(r"<ref.*?</ref>", "", v, flags=re.S)
    v = re.sub(r"\{\{\s*(?:bandera|bandera2|banderax|flagicon)[^}]*\}\}", "", v, flags=re.I)
    v = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]+)\]\]", r"\1", v)
    v = re.sub(r"\{\{[^}]*\}\}", "", v)
    v = re.sub(r"<[^>]+>", " ", v)
    v = re.sub(r"'{2,}", "", v)
    return re.sub(r"\s+", " ", v).strip(" ,;")
