# Capa de datos única (fase 2 del plan técnico)

Preparado el 11 de noviembre de 2026, antes de cambiar ninguna cifra. El plan (`PLAN_TECNICO.md`) pide buscar la historia de las decisiones 1 a 4 del autor de ese día y, para la 4, una tabla con cada ficha por habitante. Lo revisó un agente de solo lectura y se controlaron a mano la regla de población (`02_procesar.py`, líneas 98 a 104, y `docs/historico/etapas-previas.md`, línea 54) y el conteo de filas de los aglomerados.

## Historia de cada decisión

**1. Cuatro decimales en `tabla_larga.csv`: la historia la confirma.** Es la regla del paquete de datos del autor del 2 de octubre de 2026 (commit `e0c9cc1c`, `etapas-previas.md` y `.claude/rules/pipeline-datos.md`). No hay excepción en `ACEPTADAS`. Son 15.751 valores de 101 variables. Dos cuidados:
- Redondear al escribir el archivo, no en `agregar()`: "Cómo cambió su puesto" lee la tabla en memoria antes de escribirla, y redondear antes puede mover un empate.
- Con cuatro decimales, 11 valores redondeados después a un decimal dan otra cifra que la que muestra el sitio (Misiones 2022, esperanza de vida 73,549957: el sitio muestra 73,5, y 73,55 redondeado da 73,6). Afecta a quien redondee el CSV por su cuenta. `esperanza_vida_provincias.csv` ya guarda 73.55.
- Un valor en notación científica (regalías de Jujuy 2019, 8,5e-20, un resto de cálculo) pasa a 0.

**2. Código propio para los 31 aglomerados: nada la contradice, pero son 81 filas, no 40.** El "00" viene del primer commit, sin una decisión anotada. Además de pobreza e indigencia (20 filas cada una) está `tasa_desocupacion_31_aglomerados` (41 filas, territorio "Argentina"). Ninguna ficha lee esas filas de la tabla larga, así que no se rompe nada a la vista. Cuidados: "99" ya se usa para "sin dato" (dengue), y un código de dos dígitos numéricos haría que `relaciones.py` y `catalogo.py` lo cuenten como una jurisdicción más.

**3. "CABA" como único nombre: la regla la confirma.** R5 (`.claude/rules/redaccion.md`) pone "Ciudad Autónoma de Buenos Aires" entre las formas que no se usan. Las 833 filas salen de usar el nombre del SNIC (`NOMBRE`) en lugar del corto (`CORTO`) en siete lugares de `02_procesar.py`. `CORTO` solo cambia el "02". Nada indica que fuera a propósito y ninguna prueba compara por nombre.

**4. Población del mismo año que el dato: choca con una regla escrita del autor.** El paquete de datos del 2 de octubre de 2026 dice que toda tasa por habitante usa la proyección del INDEC "del año 2025" (`ANIO_POB = 2025`). Desde el 27 de octubre varias fichas ya pasaron a la población del año del dato (coparticipación, dengue, médicos, deuda, sociedades y hospitales) sin que la regla cambiara ni conste una aprobación del autor de ese criterio. Por eso se le vuelve a preguntar antes de cambiar nada.

## Fichas que dividen por población

"Sí" en la última columna: el año de la población no es el del dato y ese año tiene proyección del INDEC (hay de 2022 a 2040). La población implícita en el SNIC es igual a la proyección del INDEC de 2022 a 2025 en las 24 jurisdicciones, así que las fichas que la usan del mismo año ya cumplen.

| Sección | Ficha | Período del dato | Población que usa | ¿Lo declara? | ¿Cambia al pasar al mismo año? |
|---|---|---|---|---|---|
| Trabajo | f-empleo (también Cruces, el perfil y la imagen al compartir) | junio de 2026 | 2025 | Sí | Sí, a 2026 |
| Trabajo | f-desempleo, cada 1.000 habitantes | mayo de 2026 | 2025 | Sí | Sí, a 2026 |
| Trabajo | f-exportaciones | 2025 | 2025 | Sí | No |
| Sector privado | f-empresas | 2024 | 2025 | Sí | Sí, a 2024 |
| Sector privado | f-sociedades | 2025 | 2025 | Sí | No |
| Pobreza y hogares | f-pensiones-invalidez | mayo de 2026 | 2025 | Sí | Sí, a 2026 |
| Pobreza y hogares | f-auh, cada 100 menores | mayo de 2026 | 2025 | Sí | Sí, a 2026 |
| Salud | f-dengue | temporadas 2022/23 a 2025/26 | la del año en que termina cada temporada | Sí | No (regla propia) |
| Salud | f-medicos | 2025 | 2025 | Sí | No |
| Salud | f-hospitales | noviembre de 2026 | 2026 | Sí | No |
| Salud | f-causas-muerte | 2022 a 2024 | la de cada año | Sí | No |
| Educación | f-escuelas-primarias | junio de 2026 | 2026 | Sí | No |
| Seguridad | f-delitos | 2000 a 2025 | la de cada año | Sí | No |
| Seguridad | f-homicidios | 2023 a 2025 | la de esos años | Sí | No |
| Seguridad | f-carceles | 2024 | 2024 | En parte, sin el año | No |
| Migraciones | f-extranjeros | junio de 2026 | 2025 | Sí | Sí, a 2026 |
| Instituciones políticas | f-representacion | sin año (bancas por ley) | 2025 | Sí | A decidir |
| Instituciones políticas | f-ministros, por millón | desde 1983 | 2025 | No | A decidir |
| Instituciones políticas | f-atn | 2000 a 2025 | la de cada año | Sí (la nota dice INDEC también antes de 2022, cuando es la implícita en el SNIC) | No |
| Justicia | f-jueces-federales | junio de 2026 | 2025 | Sí | Sí, a 2026 |
| Justicia | f-fiscalias-federales | abril de 2024 | 2025 | Sí | Sí, a 2024 |
| Justicia | f-justicia-provincial | octubre de 2025 (tres filas de 2024) | 2025 | Sí | Solo esas tres filas, a 2024 |
| Cuentas públicas | f-empleo-publico | 2025 | 2025 | Sí | No |
| Cuentas públicas | f-impuestos-provinciales | 2025 | 2025 | En parte, sin el año | No |
| Cuentas públicas | f-coparticipacion | 2025 (La Pampa, 2024) | la del año de cada provincia | Sí | No |
| Cuentas públicas | f-deuda-provincias | junio de 2026 | 2026 | Sí | No |
| Movilidad | f-patentes-prov | 2025 | 2025 | Sí | No |
| Construcción | f-empleo-construccion | primer trimestre de 2026 | 2025 | Sí | Sí, a 2026 |
| Construcción | f-obra-publica | 2000 a 2025 | la de cada año | Sí | No |
| Energía | f-electricidad-provincias | 2014 a 2025 | la de cada año | Sí | No |
| Energía | f-electricidad-sectores | 2025 | 2025 | Sí | No |
| Petróleo y gas | f-regalias | 2025 | 2025 | Sí | No |
| Petróleo y gas | f-empleo-hidro | primer trimestre de 2026 | 2025 | **No** | Sí, a 2026 |
| Turismo | f-eti | 2025 | 2025 | Sí | No |
| Naturaleza | f-protegida | 2025 | 2025 | Sí | No |
| Cruces y perfil | población y densidad | 2025 | 2025 | Sí, en la etiqueta | A decidir. Las demás columnas cambian con sus fichas |

Fuera de la regla, como ya estaba declarado: las tasas que publica la fuente (SNIC, DEIS, ENACOM, la vacuna triple viral, la escolarización y Aprender), el consumo de carne por habitante, las series `bm_*`, las capitales y los departamentos.

**Lo que se mueve con la decisión 4:** 10 fichas y 3 filas de una más. A 2026: empleo, desempleo, pensiones por invalidez, AUH, extranjeros, jueces federales, empleo en la construcción y empleo en petróleo y gas. A 2024: empresas y fiscalías y defensorías federales. Con ellas cambian las cifras del país del resumen, Cruces, el perfil, "En cifras" y la imagen al compartir de Trabajo.

Si se cambia la regla, también se actualizan el comentario de `02_procesar.py` (líneas 98 a 104), `etapas-previas.md`, el comentario de la AUH y el control de la planilla de la DNAP, que hoy exige la población de 2025.

## Respuestas del autor

(pendiente)
