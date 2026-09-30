# -*- coding: utf-8 -*-
"""Tabla de presidentes (incl. interinos) desde el 10/12/1983.
Lugar de nacimiento curado a mano y verificado contra: (1) Wikipedia ES (ficha, vía API),
(2) Wikidata P19, (3) Casa Rosada, 'Nuestro país > Presidentes' (ficha 'Datos personales') cuando existe.
El script vuelve a comparar automáticamente con Wikipedia ES/Wikidata (personas_nacimiento_raw.csv)
y escribe presidentes.csv."""
import os

import pandas as pd

from birthplaces import GBA24, GRAN_LA_PLATA

HERE = os.path.dirname(os.path.abspath(__file__))
CR = "https://www.casarosada.gob.ar/nuestro-pais/presidentes/"
WP = "https://es.wikipedia.org/wiki/"

P = [
    # nombre, articulo WP, inicio, fin, partido, localidad, partido/depto, provincia, fuente Casa Rosada, nota
    ("Raúl Alfonsín", "Raúl Alfonsín", "1983-12-10", "1989-07-08", "Unión Cívica Radical",
     "Chascomús", "Chascomús", "Buenos Aires", CR + "47093-raul-ricardo-alfonsin-1983-1989", ""),
    ("Carlos Menem", "Carlos Menem", "1989-07-08", "1999-12-10", "Partido Justicialista",
     "Anillaco", "Castro Barros", "La Rioja", CR + "47092-carlos-saul-menem-i-1989-1995",
     "Dos mandatos consecutivos (1989-1995, 1995-1999)"),
    ("Fernando de la Rúa", "Fernando de la Rúa", "1999-12-10", "2001-12-21", "Unión Cívica Radical (Alianza)",
     "Córdoba", "Capital", "Córdoba", CR + "47090-fernando-de-la-rua-1999-2001",
     "Renunció el 20/12/2001; la Asamblea aceptó la renuncia el 21/12/2001"),
    ("Ramón Puerta", "Ramón Puerta", "2001-12-21", "2001-12-23", "Partido Justicialista",
     "Apóstoles", "Apóstoles", "Misiones", CR + "47089-federico-ramon-puerta-2001",
     "Interino (presidente provisional del Senado a cargo del PEN); no designó gabinete propio"),
    ("Adolfo Rodríguez Saá", "Adolfo Rodríguez Saá", "2001-12-23", "2001-12-30", "Partido Justicialista",
     "San Luis", "Juan Martín de Pueyrredón (ex La Capital)", "San Luis", CR + "47088-adolfo-rodriguez-saa-2001",
     "Designado por la Asamblea Legislativa; renunció el 30/12/2001"),
    ("Eduardo Camaño", "Eduardo Camaño", "2001-12-30", "2002-01-01", "Partido Justicialista",
     "Buenos Aires", "Ciudad Autónoma de Buenos Aires", "Ciudad Autónoma de Buenos Aires",
     CR + "47087-eduardo-oscar-camano-2001",
     "Interino (presidente de la Cámara de Diputados a cargo del PEN); no designó gabinete. "
     "Casa Rosada, Wikipedia ES y Wikidata: 'Buenos Aires' (ciudad); su carrera política es en Quilmes"),
    ("Eduardo Duhalde", "Eduardo Duhalde", "2002-01-02", "2003-05-25", "Partido Justicialista",
     "Lomas de Zamora", "Lomas de Zamora", "Buenos Aires", CR + "47086-eduardo-alberto-duhalde-2002-2003",
     "Designado por la Asamblea Legislativa el 01/01/2002; asumió el 02/01/2002"),
    ("Néstor Kirchner", "Néstor Kirchner", "2003-05-25", "2007-12-10", "Partido Justicialista (Frente para la Victoria)",
     "Río Gallegos", "Güer Aike", "Santa Cruz", CR + "47085-nestor-carlos-kirchner-2003-2007", ""),
    ("Cristina Fernández de Kirchner", "Cristina Fernández de Kirchner", "2007-12-10", "2015-12-10",
     "Partido Justicialista (Frente para la Victoria)",
     "Tolosa (La Plata)", "La Plata", "Buenos Aires", CR + "47083-cristina-fernandez-de-kirchner-2007-2011",
     "Dos mandatos consecutivos. Casa Rosada: La Plata; WP ES y Wikidata: localidad de Tolosa, partido de "
     "La Plata. Gran La Plata, no GBA-24"),
    ("Mauricio Macri", "Mauricio Macri", "2015-12-10", "2019-12-10", "Propuesta Republicana (Cambiemos)",
     "Tandil", "Tandil", "Buenos Aires", CR + "47081-mauricio-macri-2015-2019", ""),
    ("Alberto Fernández", "Alberto Fernández", "2019-12-10", "2023-12-10", "Partido Justicialista (Frente de Todos)",
     "Buenos Aires", "Ciudad Autónoma de Buenos Aires", "Ciudad Autónoma de Buenos Aires", "",
     "Casa Rosada no publica ficha; verificado con Wikipedia ES y Wikidata"),
    ("Javier Milei", "Javier Milei", "2023-12-10", "", "La Libertad Avanza",
     "Buenos Aires", "Ciudad Autónoma de Buenos Aires", "Ciudad Autónoma de Buenos Aires", "",
     "En ejercicio. Casa Rosada no publica ficha; verificado con Wikipedia ES y Wikidata"),
]


def main():
    raw = pd.read_csv(os.path.join(HERE, "personas_nacimiento_raw.csv")).set_index("articulo_wp")
    rows = []
    for (n, art, i, f, part, loc, pd_, prov, cr, nota) in P:
        r = raw.loc[art] if art in raw.index else None
        caba = prov == "Ciudad Autónoma de Buenos Aires"
        rows.append(dict(
            nombre=n, inicio=i, fin=f, partido=part, lugar_nacimiento=loc, partido_departamento=pd_,
            provincia=prov, amba=bool(caba or (prov == "Buenos Aires" and pd_ in GBA24)),
            gran_la_plata=bool(prov == "Buenos Aires" and pd_ in GRAN_LA_PLATA),
            interino=n in ("Ramón Puerta", "Adolfo Rodríguez Saá", "Eduardo Camaño", "Eduardo Duhalde"),
            wikidata=r["qid"] if r is not None else "",
            wp_ficha_nacimiento=r["wp_ficha_nacimiento"] if r is not None else "",
            wd_lugar_nacimiento=r["wd_birth"] if r is not None else "",
            fuente_wikipedia=WP + art.replace(" ", "_"), fuente_casa_rosada=cr, notas=nota))
    df = pd.DataFrame(rows)
    df.to_csv(os.path.join(HERE, "presidentes.csv"), index=False, encoding="utf-8")
    print(df[["nombre", "lugar_nacimiento", "provincia", "amba", "wp_ficha_nacimiento", "wd_lugar_nacimiento"]]
          .to_string())


if __name__ == "__main__":
    main()
