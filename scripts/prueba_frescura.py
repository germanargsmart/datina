"""Prueba de la frescura de las fichas (plan de mejora, T3, 27 de octubre de 2026): scripts/frescura.py.

Controla, con casos fijos, que:
- cada forma en que el resumen escribe un período termine en el mes que corresponde ("agosto de 2026", "2T2026", "primer semestre
  de 2026", "2022 a 2024", "2025 (La Pampa, 2024)"), y que lo que no es un período no cuente;
- "desde {{...}}" y la base de un índice ("{{...}} = 100") no cuenten como el último dato;
- el aviso salga cuando el dato pasa del doble de su frecuencia: la nafta con julio en octubre sí, con agosto no; una ficha de
  cada mes que muestra años completos se mide por años; la demora habitual de una fuente corre el tope;
- las frecuencias sin ritmo fijo (censo, elección, encuesta en pausa) no lleven aviso.

Uso: python scripts/prueba_frescura.py. Devuelve 1 si algo falla. 03_construir_sitio.py la corre antes de armar.
"""
import sys

import frescura as fr


def revisar():
    malos, casos = [], []

    def igual(nombre, dio, esperado):
        casos.append(nombre)
        if dio != esperado:
            malos.append(f"{nombre}: dio {dio!r} y tenía que dar {esperado!r}")

    for valor, esperado in [("agosto de 2026", (2026, 8, "mes")), ("enero a septiembre de 2026", (2026, 9, "mes")),
                            ("2026-07", (2026, 7, "mes")), ("2026-07-31", (2026, 7, "mes")),
                            ("primer trimestre de 2026", (2026, 3, "trimestre")), ("2.º trimestre de 2026", (2026, 6, "trimestre")),
                            ("2T2026", (2026, 6, "trimestre")), ("primer semestre de 2026", (2026, 6, "semestre")),
                            ("1S2026", (2026, 6, "semestre")), (2025, (2025, 12, "anio")), ("2022 a 2024", (2024, 12, "anio")),
                            ("2025 y 2026", (2026, 12, "anio")), ("2025 (La Pampa, 2024)", (2025, 12, "anio")),
                            (246, None), ("los municipios", None), ("", None)]:
        igual(f"fin_periodo({valor!r})", fr.fin_periodo(valor), esperado)

    resumen = {"c": {"desde": 2005, "ult": "julio de 2026", "base": "diciembre de 2016", "anio": 2026}}
    igual("periodos_de con un rango", fr.periodos_de("Precios, {{c.desde}} a {{c.ult}}", resumen), (2026, 7, "mes", "julio de 2026"))
    igual("periodos_de con 'desde'", fr.periodos_de("Reservas, mes a mes desde {{c.desde}}", resumen), None)
    igual("periodos_de con la base de un índice", fr.periodos_de("Costo ({{c.base}} = 100), {{c.desde}} a {{c.anio}}", resumen),
          (2026, 12, "anio", "2026"))
    igual("periodos_de con una ruta que no está", fr.periodos_de("Algo, {{c.no_esta}}", resumen), None)

    hoy = "24/10/2026"
    igual("la nafta con julio en octubre", fr.atraso((2026, 7, "mes"), "mes", hoy), 3)
    igual("la nafta con agosto en octubre", fr.atraso((2026, 8, "mes"), "mes", hoy), None)
    igual("una ficha de cada mes con años completos (2025)", fr.atraso((2025, 12, "anio"), "mes", hoy), None)
    igual("una ficha de cada mes con años completos (2023)", fr.atraso((2023, 12, "anio"), "mes", hoy), 34)
    igual("una ficha anual con 2024", fr.atraso((2024, 12, "anio"), "anio", hoy), None)
    igual("un trimestre con el primero de 2026", fr.atraso((2026, 3, "trimestre"), "trimestre", hoy), 7)
    igual("la misma, con un mes de demora habitual", fr.atraso((2026, 3, "trimestre"), "trimestre", hoy, demora=1), None)
    igual("un semestre con el segundo de 2025", fr.atraso((2025, 12, "semestre"), "semestre", hoy), None)
    igual("un dato censal", fr.atraso((2022, 12, "anio"), "censo", hoy), None)
    igual("sin período", fr.atraso(None, "mes", hoy), None)
    return malos, len(casos)


if __name__ == "__main__":
    malos, n = revisar()
    if malos:
        print("Frescura de las fichas: hay problemas\n  " + "\n  ".join(malos))
        sys.exit(1)
    print(f"Frescura de las fichas: {n} casos bien.")
