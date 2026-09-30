# -*- coding: utf-8 -*-
"""Helpers comunes: sesión HTTP con User-Agent, caché en disco, API MediaWiki y SPARQL de Wikidata."""
import hashlib
import json
import os
import time

import requests

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "cache")
os.makedirs(CACHE, exist_ok=True)

S = requests.Session()
S.headers["User-Agent"] = "ArgEnDatosBot/0.1 (static statistics site research; python-requests)"

WP_API = "https://es.wikipedia.org/w/api.php"
WD_SPARQL = "https://query.wikidata.org/sparql"


def _cached(key, fn):
    h = hashlib.sha1(key.encode("utf-8")).hexdigest()
    p = os.path.join(CACHE, h + ".json")
    if os.path.exists(p):
        with open(p, encoding="utf-8") as f:
            return json.load(f)
    data = fn()
    with open(p, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)
    return data


def wp(params):
    params = dict(params, format="json", formatversion=2)
    key = "wp:" + json.dumps(params, sort_keys=True, ensure_ascii=False)

    def go():
        for i in range(8):
            r = S.get(WP_API, params=params, timeout=60)
            if r.status_code == 200:
                time.sleep(1.0)
                return r.json()
            ra = r.headers.get("Retry-After")
            time.sleep(int(ra) if ra and ra.isdigit() else 10 * (i + 1))
        r.raise_for_status()

    return _cached(key, go)


def wp_html(title):
    """HTML renderizado de una página (sigue redirecciones)."""
    d = wp({"action": "parse", "page": title, "prop": "text|revid", "redirects": 1})
    if "error" in d:
        return None, None
    return d["parse"]["text"], d["parse"]["title"]


def wp_wikitext(title):
    d = wp({"action": "parse", "page": title, "prop": "wikitext", "redirects": 1})
    if "error" in d:
        return None
    return d["parse"]["wikitext"]


def sparql(query):
    key = "wd:" + query

    def go():
        for i in range(5):
            r = S.post(WD_SPARQL, data={"query": query},
                       headers={"Accept": "application/sparql-results+json"}, timeout=120)
            if r.status_code == 200:
                return r.json()
            time.sleep(5 + 5 * i)
        r.raise_for_status()

    return _cached(key, go)
