# -*- coding: utf-8 -*-
"""Para una lista de artículos de Wikipedia ES, obtiene QID y lugar de nacimiento (Wikidata + ficha WP ES)
y escribe personas_nacimiento_raw.csv para revisión."""
import os
import sys

import pandas as pd

from birthplaces import wikidata_birth, classify_wd, wp_infobox_birth, clean_wikitext
from resolve_titles import resolve

HERE = os.path.dirname(os.path.abspath(__file__))


def build(titles, out_csv):
    res = resolve(titles)
    canon = sorted({v[0] for v in res.values() if v[0]})
    qid_of = {v[0]: v[1] for v in res.values() if v[0]}
    info = wikidata_birth(qid_of.values())
    rows = []
    for t in canon:
        q = qid_of.get(t)
        d = info.get(q, {"births": {}, "parties": {}})
        wd_label = wd_prov = wd_part = wd_chain = None
        if d["births"]:
            # si hay varios P19, se listan todos
            labs, provs, parts, chains = [], [], [], []
            for bq, e in d["births"].items():
                p, pa = classify_wd(e, bq)
                labs.append(e["label"])
                provs.append(p or "")
                parts.append(pa or "")
                chains.append(" > ".join(a["label"] for a in e["anc"].values()))
            wd_label, wd_prov, wd_part, wd_chain = " | ".join(labs), " | ".join(provs), " | ".join(parts), \
                " || ".join(chains)
        raw = wp_infobox_birth(t)
        rows.append(dict(articulo_wp=t, qid=q, wd_birth=wd_label, wd_provincia=wd_prov, wd_partido=wd_part,
                         wd_cadena=wd_chain, wd_partidos_politicos=" | ".join(d["parties"].values()),
                         wp_ficha_nacimiento=clean_wikitext(raw) if raw else None))
    df = pd.DataFrame(rows)
    df.to_csv(out_csv, index=False, encoding="utf-8")
    return df, res


if __name__ == "__main__":
    g = pd.read_csv(os.path.join(HERE, "wp_gabinetes_raw.csv"))
    extra = sys.argv[1:]
    build(list(g.articulo_wp.dropna()) + extra, os.path.join(HERE, "personas_nacimiento_raw.csv"))
