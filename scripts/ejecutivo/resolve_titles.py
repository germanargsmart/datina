# -*- coding: utf-8 -*-
"""Resuelve títulos de artículos de Wikipedia ES a título canónico + QID de Wikidata (pageprops)."""
from wp_common import wp


def resolve(titles):
    titles = sorted({t for t in titles if isinstance(t, str) and t.strip()})
    out = {}
    for i in range(0, len(titles), 50):
        chunk = titles[i:i + 50]
        r = wp({"action": "query", "titles": "|".join(chunk), "redirects": 1,
                "prop": "pageprops", "ppprop": "wikibase_item"})
        q = r["query"]
        norm = {n["from"]: n["to"] for n in q.get("normalized", [])}
        red = {n["from"]: n["to"] for n in q.get("redirects", [])}
        pages = {p["title"]: p for p in q["pages"]}
        for t in chunk:
            t2 = norm.get(t, t)
            t3 = red.get(t2, t2)
            p = pages.get(t3, {})
            out[t] = (t3 if not p.get("missing") else None, p.get("pageprops", {}).get("wikibase_item"))
    return out
