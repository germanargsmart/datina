# Fuentes nuevas para Datina, verificadas el 26 de octubre de 2026

Informe del investigador de fuentes de la auditoría (ver `docs/roadmap/PLAN_MEJORA.md`, sección 10). No se bajó ningún archivo al repositorio: toda descarga nueva necesita la aprobación del autor (`python scripts/01_descargar.py --solo archivo`).

Estados: **Verificado**, se vio la página o el encabezado del archivo. **Parcial**, se vio la página pero no el contenido del archivo. **No verificado**, no se pudo abrir.

**Dos avisos**
- datos.gob.ar (el portal central) devolvió error 502 toda la sesión. Se trabajó con el portal de cada organismo (datos.magyp, datos.salud, datos.jus), que responden la misma consulta.
- Los archivos con la fecha en el nombre no son frágiles (estimaciones agrícolas, dengue, vacuna triple viral). Se encuentran con `package_show`, como 01 ya hace con Migraciones.

## Parte 1. Fuentes argentinas

| Fuente y organismo | URL | Formato | Nivel | Período y última actualización | Frecuencia | Pregunta | Estado |
|---|---|---|---|---|---|---|---|
| Estimaciones agrícolas (MAGyP) | https://datos.magyp.gob.ar/dataset/9e1e77ba-267e-4eaa-a59f-3296e86b5f36/resource/95d066e6-8a0f-4a80-b59d-6f28f88eacd5/download/estimaciones-agricolas-2026-03.csv | CSV | Departamento, con su código | Campañas 1969/70 a 2025/26. Superficie sembrada y cosechada, producción y rendimiento. Modificado el 5/3/2026 | Se republica con la fecha en el nombre | ¿Dónde se siembra más soja? | Verificado (metadatos y columnas) |
| Dengue y zika (Ministerio de Salud) | https://datos.salud.gob.ar/dataset/ceaa8e87-297e-4348-84b8-5c643e172500/resource/33e12e9f-1d14-4bc7-b34c-a1f88ab7b990/download/informacion-publica-dengue-zika-nacional-se-1-2025-a-se41-2026-2026-10-26.csv | CSV separado por punto y coma | Provincia y departamento de residencia, con códigos INDEC (99 y 999 son "desconocido") | Semana 1 de 2025 a semana 41 de 2026, publicado el 26/10/2026. Hay archivos desde 2018 | Semanal o mensual | ¿Dónde hubo más casos de dengue? | Verificado (encabezado) |
| Cobertura de la vacuna triple viral por jurisdicción (DICEI) | https://datos.salud.gob.ar/dataset/f70b1357-b57e-4077-9746-af8193243207/resource/2e316239-2718-4ee8-b896-9d23f79f104c/download/dicei-vacunas-srp-2009-2024.xls | XLS | Provincia | 2009 a 2024. Modificado el 23/4/2026 | Anual | ¿Dónde se vacuna menos a los chicos? | Verificado (metadatos) |
| Establecimientos de salud (REFES) y farmacias (REFAR) | https://datos.salud.gob.ar/dataset/336cf4d9-447a-44c4-8e34-0ba1fc293d55/resource/d91c27de-e440-4cd8-8f4c-0b8a8fd8dfa6/download/establecimientos-asistenciales-asentados-registro-federal-refes-20260114.xlsx y https://datos.salud.gob.ar/dataset/39117f8f-e2bc-4571-a572-15a6ce7ea9e1/resource/8592456f-6854-4044-9566-a58d217d6b41/download/establecimientos-farmacias-asentadas-registro-federal-refar-20260114.csv | XLSX y CSV | Provincia y departamento, con códigos INDEC | Listado al 14/1/2026 | Una o dos veces por año | ¿Cuántos centros de salud y farmacias hay por habitante? | Verificado (metadatos). No trae camas, solo el tipo |
| Médicos activos 2025 (OFETHuS, Ministerio de Salud) | https://www.argentina.gob.ar/sites/default/files/medicos_activos_argentina_2025_ofethus_dncydts_2026_v300926_a_3092026.pdf | PDF | Provincia (cantidades) | Fines de 2025, publicado en septiembre de 2026 | Puntual | ¿Dónde hay más médicos por habitante? | Parcial (visto en una nota de prensa, sin abrir el PDF) |
| Deuda pública provincial (DNAP) | Página: https://www.argentina.gob.ar/economia/sechacienda/coordinacion-fiscal-provincial/deuda-publica-provincial/evolucion-de-stock. Total: https://www.argentina.gob.ar/sites/default/files/stock_ii_trim_2026.xlsx. Por provincia, 24 XLS, por ejemplo https://www.argentina.gob.ar/sites/default/files/provincia_de_cordoba_iv_trim_25_1.xls | XLSX y XLS | Total de las provincias y cada provincia | Total desde 1996 hasta el 2T2026. Por provincia, solo el IV trimestre de 2025 | Trimestral | ¿Qué provincias deben más por habitante? | Verificado (enlaces). Nombres irregulares: La Pampa es de 2024, Santiago figura como "santiag", Formosa dice "iv_tri", Santa Fe termina en "_2" |
| Abandono interanual, promoción efectiva, repitencia y sobreedad (Secretaría de Educación) | https://www.argentina.gob.ar/sites/default/files/2018/04/tasa_de_abandono_interanual.zip (y `tasa_de_promocion_efectiva.zip`, `tasa_de_repitencia.zip`, `tasas_de_sobreedad.zip`) | ZIP con Excel | Provincia y nivel | Desde 2003, último año sin confirmar | Anual (se reemplaza en el mismo lugar, como la escolarización que 01 ya baja) | ¿Dónde dejan más la secundaria? | Parcial |
| Telefonía fija y TV paga (ENACOM) | https://indicadores.enacom.gob.ar/DatosAbiertos/TelefoniaFija/penetracion-provincias.aspx. El CSV probable (`.../Files/DatosAbiertos/telefonia_fija_penetracion_provincias.csv`) dio error 500 | HTML y CSV | Provincia | Hasta el 2T2026 | Trimestral | ¿Dónde quedan teléfonos fijos? | Parcial. La móvil está solo para el país |
| Préstamos y depósitos por provincia (BCRA) | https://www.bcra.gob.ar/archivos/Pdfs/PublicacionesEstadisticas/vol4_ser.txt, `vol3_ser.txt` (más de 10 MB), `din5_ser.txt`. Índice: https://www.bcra.gob.ar/consulta-de-series-estadisticas-en-formato-txt/ | TXT (código, fecha, valor) | Provincia | Visto del 31/3/2023 al 31/3/2026 | Trimestral | ¿Dónde se presta más por habitante? | Parcial. Falta el diccionario de códigos de serie |
| Informe de Inclusión Financiera (BCRA) | https://www.bcra.gob.ar/archivos/Pdfs/publicacionesestadisticas/informes/anexo-estadistico-informe-inclusion-financiera-2026-04.xlsx | XLSX (unas 38 hojas) | Sin confirmar si hay provincias | Segundo semestre de 2025 | Semestral | ¿Dónde tiene cuenta bancaria menos gente? | Parcial |
| Registro Nacional de Sociedades (Ministerio de Justicia) | https://datos.jus.gob.ar/dataset/ee83de85-4305-4c53-9a9f-fd3d15e42c36/resource/13a1a66f-9f49-4d2d-9582-7b4540ef1b83/download/registro-nacional-sociedades-2026.zip | ZIP con CSV | Provincia y localidad del domicilio | Modificado el 18/9/2026 | Bimestral o anual | ¿Dónde se crean más empresas? | Verificado (muestra). Comas sin comillas que corren columnas |
| Anuario de Estadísticas Tributarias (ARCA) | https://contenidos.afip.gob.ar/institucional/estudios/archivos/estadisticasTributarias/Estadisticas-Tributarias-2024.zip | ZIP | Probablemente provincia | 1998 a 2024 | Anual | ¿Cuánto se recauda en cada provincia? | Parcial. La recaudación se asigna por domicilio fiscal |
| Existencias bovinas (SENASA) | https://datos.magyp.gob.ar/dataset/c19a5875-fb39-48b6-b0b2-234382722afb/resource/1b920477-8112-4e12-bc2c-94b564f04183/download/existencias-bovinas-provincia-departamento-2008-2019.csv | CSV | Provincia y departamento | 2008 a 2019 | Detenida | ¿Dónde hay más vacas? | Verificado, pero viejo |
| Siniestros viales (ANSV) | https://argentina.gob.ar/sites/default/files/2018/12/informe_de_siniestralidad_fatal_2023_feb2025_act.pdf | PDF | Provincia | 2023 | Anual, con demora | ¿Dónde mueren más personas en el tránsito? | Parcial. Sin datos abiertos |
| Incendios forestales (Dirección Nacional de Bosques) | https://datos.gob.ar/dataset/ambiente-incendios-forestales | CSV | Provincia | Hasta 2020 o 2022 | Detenido | ¿Dónde se quema más? | No verificado (error 502) |
| Pérdida de bosque nativo (UMSEF) | https://www.argentina.gob.ar/sites/default/files/2018/04/infografia_monitoreo_2024_ok_1.pdf y https://ciam.ambiente.gob.ar/dt_csv.php?dt_id=387 | PDF y CSV | El CSV, solo el país | 2024 | Anual | ¿Dónde se desmonta más? | Parcial |
| Generación distribuida (Secretaría de Energía) | Por ejemplo https://www.argentina.gob.ar/sites/default/files/reporte_de_avance_abril_2024.pdf | PDF | Provincia | El último visto es de abril de 2024 | Mensual (sin confirmar) | ¿Dónde se pusieron más paneles solares? | Parcial |
| Normales climáticas 1981-2010 (SMN) | https://ssl.smn.gob.ar/dpd/descarga_opendata.php?file=observaciones/estadisticas.txt | TXT | Estación | Promedios 1981 a 2010 | Fija | ¿Dónde hace más frío? | Verificado |
| Estadísticas universitarias (DIU) | https://www.argentina.gob.ar/sites/default/files/sintesis_2022-_2023.pdf y https://www.argentina.gob.ar/sites/default/files/00._educ_superior_datos.csv | PDF y CSV | El CSV, solo el país | 2022-2023 | Anual | ¿Cuántos se reciben en la universidad? | Parcial |

**Ya cubierto en Datina:** recaudación provincial, supermercados por jurisdicción, permisos de edificación, hipotecas UVA (solo nacional), madres adolescentes, cobertura de salud del Censo, origen provincial de las exportaciones, salario docente, inversión educativa, escolarización y ANSES a través del BESS. Falta revisar si se usa el cuadro del Censo de jubilación por jurisdicción: https://censo.gob.ar/wp-content/uploads/2023/11/c2022_tp_prevision_c3.xlsx

**No hay fuente nacional oficial de:** alquileres, escrituras, catastro y cheques rechazados por provincia. No hay resultados publicados de la 5.ª Encuesta Nacional de Factores de Riesgo ni camas por provincia.

**No buscado:** salarios de convenio, tarifas, cantidad de docentes, calidad del agua (CIAM, did=369) y shoppings por provincia.

## Parte 2. Fuentes internacionales

| Fuente | URL | Nivel para la Argentina | Período | Licencia | Estado |
|---|---|---|---|---|---|
| Global Data Lab, IDH subnacional | https://globaldatalab.org/shdi/table/shdi/ARG/ | 6 regiones, no las 24 provincias | 1990 a 2023 | Todos los derechos reservados | Verificado. Descartado |
| MapBiomas Argentina, Colección 3 (red de organizaciones, no oficial) | https://argentina.mapbiomas.org/wp-content/uploads/sites/8/2026/09/Estadisticas_por_Provincia.zip | Provincia | 1985 a 2025 | CC BY 4.0 | Verificado (página) |
| Global Forest Watch | https://gfw2-data.s3.amazonaws.com/country-pages/country_stats/download/ARG.xlsx | Probablemente provincia | Hasta 2024 o 2025 | Suele ser CC BY 4.0 | Parcial |
| NASA FIRMS, focos de calor | https://firms.modaps.eosdis.nasa.gov/api/ | Puntos (hay que asignarlos a cada provincia) | VIIRS desde 2012 | Gratis, con clave | Parcial |
| Climate TRACE | https://climatetrace.org/data, API https://api.climatetrace.org/v7 | Fuentes con coordenadas | Versión 5.11.0 del 24/9/2026 | CC 4.0 | Parcial |
| Ookla, velocidad de internet | https://github.com/teamookla/ookla-open-data | Cuadrículas | Hasta el 1T2026 | No comercial | Descartado |
| Luces nocturnas VIIRS (EOG) | https://eogdata.mines.edu/products/vnl/ | Ráster | 2012 a 2020 | CC BY 4.0 | Verificado (página) |
| CHIRPS, lluvias | https://www.chc.ucsb.edu/data/chirps | Ráster entre 50° S y 50° N | Desde 1981 | Dominio público | Descartado: deja afuera el sur de Santa Cruz y Tierra del Fuego |
| Meta, Índice de Riqueza Relativa | (HDX dio 403) | Sin confirmar que esté la Argentina | | CC BY 4.0 | No verificado |
| LAPOP y Latinobarómetro | vanderbilt.edu/lapop | Muestra nacional | | Con registro | Descartado para provincias |
| IHME GBD, ERA5, WorldPop, OpenStreetMap | | Sin dato subnacional útil o con procesamiento pesado | | | No abiertos |
| Solo el país: SEDLAC, CEPALSTAT, ILOSTAT, UNESCO UIS, ERCE, V-Dem, Transparency, OMS, FAO, OMT, FMI, BIS | | Solo el país | | | Sirven para comparar con otros países |

## Ranking de las 15 que más valor le agregan

1. Estimaciones agrícolas del MAGyP: departamento, oficial, CSV, desde 1969.
2. Dengue por provincia y departamento: códigos INDEC, actualizado esta semana.
3. Cobertura de la vacuna triple viral por jurisdicción.
4. Deuda pública provincial de la DNAP (con los nombres irregulares de arriba).
5. Abandono, promoción y repitencia (depende del último año de los ZIP).
6. REFES y REFAR: centros de salud y farmacias por habitante y por departamento.
7. Registro Nacional de Sociedades: empresas nuevas por provincia.
8. ENACOM, telefonía fija y TV paga (falta confirmar la URL del CSV).
9. MapBiomas por provincia (excelente, pero no oficial).
10. Médicos activos de OFETHuS (PDF puntual).
11. BCRA, préstamos y depósitos por provincia (si aparece el diccionario de códigos).
12. Global Forest Watch (falta confirmar la hoja por provincia).
13. NASA FIRMS (hay que asignar los puntos a cada provincia).
14. Anuario tributario de ARCA (si trae cuadros por provincia).
15. SMN, normales por estación (hay que asignar cada estación a su provincia).
