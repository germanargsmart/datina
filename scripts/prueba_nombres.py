"""Prueba de los nombres de legisladores y de bloques (plan de mejora, R10, 27 de octubre de 2026): scripts/nombres_propios.py.

Controla, con casos fijos, que:
- las tildes salgan de la tabla (Rodríguez, María) o de la otra fuente de la misma persona (Insfrán), y que la tabla saque las que la
  fuente pone de más (Juán);
- el apellido en mayúsculas pase a minúsculas con inicial mayúscula, con "de", "la" y "los" en minúscula dentro del nombre y no al
  empezar el apellido (De la Rúa), "la" y "los" en minúscula solo después de una preposición (Alianza La Libertad Avanza, Gómez La
  Rosa), y con las iniciales y los apodos como vienen;
- en los bloques, las siglas sigan en mayúsculas aunque la fuente las escriba "Ucr" o "Pts", y las letras con punto también (A.R.I);
- los bloques que la fuente escribe con mayúsculas y minúsculas solo cambien en las palabras de enlace, las siglas y las tildes;
- dos formas de un mismo bloque den el mismo nombre ("COALICION CIVICA" y "Coalicion Civica").

Uso: python scripts/prueba_nombres.py. Devuelve 1 si algo falla. 03_construir_sitio.py la corre antes de armar.
"""
import sys

import nombres_propios as np_


def revisar():
    malos, casos = [], []

    def igual(nombre, dio, esperado):
        casos.append(nombre)
        if dio != esperado:
            malos.append(f"{nombre}: dio {dio!r} y tenía que dar {esperado!r}")

    todas = np_.variantes(["ACERENZA, Samanta María Celeste", "Acerenza, Samanta Maria Celeste", "INSFRAN, Gildo", "Insfrán, Gildo",
                           "DE LA RUA, Fernando", "De la Rúa, Fernando"])
    for n, esperado in [("RODRIGUEZ, Marcela Virginia", "Rodríguez, Marcela Virginia"),
                        ("Acerenza, Samanta Maria Celeste", "Acerenza, Samanta María Celeste"),
                        ("INSFRAN, Gildo", "Insfrán, Gildo"), ("DE LA RUA, Fernando", "De la Rúa, Fernando"),
                        ("ABDALA DE MATARAZZO, Norma Amanda", "Abdala de Matarazzo, Norma Amanda"),
                        ("GARCIA, María de los Angeles", "García, María de los Ángeles"), ("DEL CAÑO, Nicolás", "Del Caño, Nicolás"),
                        ("JUÁN, Beatríz", "Juan, Beatriz"), ("PEREZ, Juan E.", "Pérez, Juan E."),
                        ("BARBARO, HECTOR 'CACHO'", "Bárbaro, Héctor 'Cacho'"), ("D'ALESSANDRO, Darío", "D'Alessandro, Darío"),
                        ("LAMBERTO, Oscar", "Lamberto, Oscar"), ("LA ROSA, Ana", "La Rosa, Ana"), ("GOMEZ LA ROSA, Ana", "Gómez La Rosa, Ana"), ("SOLA, Felipe", "Sola, Felipe")]:
        igual(f"persona({n!r})", np_.persona(n, todas), esperado)

    for b, esperado in [("COALICION CIVICA - ARI", "Coalición Cívica - ARI"), ("Ucr - Union Civica Radical", "UCR - Unión Cívica Radical"),
                        ("FRENTE JUSTICIALISTA para la  VICTORIA", "Frente Justicialista para la Victoria"),
                        ("Pts-frente De Izquierda Unidad", "PTS-Frente de Izquierda Unidad"),
                        ("Izquierda Socialista Fit-unidad", "Izquierda Socialista FIT-Unidad"),
                        ("SOLIDARIDAD E IGUALDAD (SI) - ARI (T.D.F.)", "Solidaridad e Igualdad (SI) - ARI (T.D.F.)"),
                        ("A.R.I AUTONOMO 8 +", "A.R.I Autónomo 8 +"), ("PRO Y UNIÓN POR ENTRE RÍOS", "PRO y Unión por Entre Ríos"),
                        ("LA LIBERTAD AVANZA", "La Libertad Avanza"), ("ALIANZA LA LIBERTAD AVANZA", "Alianza La Libertad Avanza"),
                        ("PARTIDO JUSTICIALISTA LA PAMPA", "Partido Justicialista La Pampa"), ("UNION POR LA PATRIA", "Unión por la Patria"),
                        ("Alianza por el Trabajo, la Justicia y la Educación", "Alianza por el Trabajo, la Justicia y la Educación"),
                        ("UNIDAD PARA EL DESARROLLO SOCIAL Y LA EQUIDAD", "Unidad para el Desarrollo Social y la Equidad"), ("DEL BICENTENARIO", "Del Bicentenario"),
                        ("PERONISMO MAS AL SUR", "Peronismo Más al Sur"), ("Fte. Renov. de la Conc. Misiones - FPV-PJ", "Fte. Renov. de la Conc. Misiones - FPV-PJ"),
                        ("PARTIDO OBRERO &ndash; FRENTE DE IZQUIERDA", "Partido Obrero – Frente de Izquierda"),
                        ("Frente\xa0Federal\xa0para\xa0el  Trabajo", "Frente Federal para el Trabajo"), ("Unión PRO", "Unión PRO")]:
        igual(f"bloque({b!r})", np_.bloque(b), esperado)
    igual("dos formas de un mismo bloque", np_.bloque("COALICION CIVICA"), np_.bloque("Coalicion Civica"))
    igual("un nombre vacío", np_.persona(None), None)
    return malos, len(casos)


if __name__ == "__main__":
    malos, n = revisar()
    if malos:
        print("Nombres del Congreso: hay problemas\n  " + "\n  ".join(malos))
        sys.exit(1)
    print(f"Nombres del Congreso: {n} casos bien.")
