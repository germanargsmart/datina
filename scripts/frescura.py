"""Frescura de cada ficha (plan de mejora, T3, 27 de octubre de 2026).

El último período de cada ficha sale de su descripción (p.ficha-sub), que por regla lleva el período con {{ruta}} del resumen.
Se compara con la fecha de la última actualización de los datos (resumen["actualizado"]), no con el día del armado: así armar el
mismo sitio otro día da los mismos archivos. Si el dato está más atrasado que el doble de su frecuencia (más la demora habitual de
la fuente), el pie de la ficha lo dice. Caso que lo motivó: la nafta con el último dato de julio en octubre, con el servidor de la
fuente caído.

No frena el armado: si una fuente se cae, la actualización del día 5 tiene que publicar igual y el aviso lo cuenta.
03_construir_sitio.py usa periodos_de() y atraso(). La prueba es scripts/prueba_frescura.py.
"""
import re

MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
# cuántos meses abarca cada frecuencia de FRECUENCIA (03_construir_sitio.py) y cada período. Las demás frecuencias (censo, elección,
# padrón, encuesta en pausa) no tienen un ritmo fijo y no llevan aviso
MESES_DE = {"mes": 1, "trimestre": 3, "semestre": 6, "anio": 12}
_ORDINAL = {"primer": 1, "primero": 1, "1.º": 1, "segundo": 2, "2.º": 2, "tercer": 3, "tercero": 3, "3.º": 3, "cuarto": 4, "4.º": 4}
_MES = "(" + "|".join(MESES) + ")"


def fin_periodo(valor):
    """El mes en que termina un período tal como lo escribe el resumen: (año, mes, unidad), o None si no es un período.

    "agosto de 2026" y "enero a septiembre de 2026" terminan en ese mes. "primer trimestre de 2026", "2.º trimestre de 2026" y
    "2T2026", en el último mes del trimestre. "primer semestre de 2026" y "1S2026", en junio. Un año suelto, "2022 a 2024",
    "2025 y 2026" o "2025 (La Pampa, 2024)", en diciembre del año de la ficha (el primero si hay una aclaración entre paréntesis,
    el último si es un rango)."""
    s = " ".join(str(valor).lower().split())
    if m := re.fullmatch(rf"(?:.* )?{_MES} de (\d{{4}})", s):
        return int(m.group(2)), MESES.index(m.group(1)) + 1, "mes"
    if m := re.fullmatch(r"(\d{4})-(\d{2})(?:-\d{2})?", s):
        return int(m.group(1)), int(m.group(2)), "mes"
    if m := re.fullmatch(r"(?:.* )?(primer|segundo|tercer|cuarto|[1-4]\.º) trimestre de (\d{4})", s):
        return int(m.group(2)), 3 * _ORDINAL[m.group(1)], "trimestre"
    if m := re.fullmatch(r"([1-4])t(\d{4})", s):
        return int(m.group(2)), 3 * int(m.group(1)), "trimestre"
    if m := re.fullmatch(r"(?:.* )?(primer|segundo) semestre de (\d{4})", s):
        return int(m.group(2)), 6 * _ORDINAL[m.group(1)], "semestre"
    if m := re.fullmatch(r"([12])s ?(\d{4})", s):
        return int(m.group(2)), 6 * int(m.group(1)), "semestre"
    if m := re.fullmatch(r"(\d{4})(?: \(.*\))?", s):
        return int(m.group(1)), 12, "anio"
    if m := re.fullmatch(r"\d{4} (?:a|y) (\d{4})", s):
        return int(m.group(1)), 12, "anio"
    return None


def periodos_de(sub, resumen):
    """El período más reciente de una descripción con {{ruta}}: (año, mes, unidad, texto), o None si no tiene ninguno."""
    hallados = []
    for m in re.finditer(r"\{\{([\w.]+)\}\}", sub):
        # "desde {{...}}" es el comienzo de la serie y "({{...}} = 100)", la base de un índice: no dicen hasta cuándo llega el dato
        if sub[:m.start()].lower().endswith("desde ") or sub[m.end():].startswith(" = 100"):
            continue
        ruta = m.group(1)
        v = resumen
        for parte in ruta.split("."):
            v = v.get(parte) if isinstance(v, dict) else None
        f = fin_periodo(v) if v is not None else None
        if f:
            hallados.append((*f, str(v)))
    return max(hallados, key=lambda x: (x[0], x[1])) if hallados else None


def atraso(periodo, frecuencia, actualizado, demora=0):
    """Cuántos meses de atraso tiene un período frente a la fecha de la actualización ("24/10/2026"), si pasa del doble de su
    frecuencia más la demora habitual de la fuente. None si está al día o si la frecuencia no tiene un ritmo fijo.

    La unidad es la frecuencia o la del período, la más larga: una ficha que se actualiza cada mes pero muestra años completos
    se mide por años."""
    if frecuencia not in MESES_DE or periodo is None:
        return None
    anio, mes, unidad = periodo[:3]
    _, m_ref, a_ref = (int(x) for x in actualizado.split("/"))
    meses = (a_ref * 12 + m_ref) - (anio * 12 + mes)
    tope = 2 * max(MESES_DE[frecuencia], MESES_DE[unidad]) + demora
    return meses if meses > tope else None
