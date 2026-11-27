window.DATINA_PARTES = window.DATINA_PARTES || {};
window.DATINA_PARTES["construccion"] = () => {
const CORTO_INS = {"Mosaicos graníticos y calcáreos": "Mosaicos", "Pisos y revestimientos cerámicos": "Pisos cerámicos", "Resto (grifería, tubos y vidrio)": "Grifería, tubos, vidrio"};
const NOTA_VIV = k => `Datos del Censo 2022 sumados desde los radios censales. Un hogar son las personas que comparten la vivienda y los gastos de comida. ` +
(k === "pct_materiales_4" ? `La calidad de los materiales es una clasificación del INDEC según el material de los pisos y los techos y la presencia de cielorraso: la calidad IV es la de materiales de baja calidad tanto en el piso como en el techo. Se calcula sobre los hogares con dato. ` : "") +
`El día del censo, el ${pct(VV.pct_sin_personas)} de las viviendas particulares no tenía personas presentes, y el INDEC registró el motivo: uso temporal, oficina o comercio, alquiler o venta, construcción, residentes que no estaban ese día u otra situación. ` +
`Por eso el selector muestra motivos por separado y no un total de viviendas vacías: una parte de las viviendas sin personas presentes tiene residentes habituales. ` +
`En el mapa, el color divide a los departamentos en cinco grupos del mismo tamaño. Si elegís una provincia en Tu provincia, el mapa se acerca a ella. ` +
`Los precios de la vivienda no tienen una estadística oficial por capital: qué fuentes privadas los miden y qué cubre cada una está en Para entender los datos, al final de la página.`;
Object.assign(LEAD, {
"empleo-construccion": v => `Los puestos asalariados registrados en la construcción privada eran el ${pct(CN.emp_pct)} del empleo privado registrado y ${n1(CN.emp_cada_1000)} cada 1.000 habitantes en el ${CN.emp_trim}. ` +
`Frente al ${CN.emp_trim_ant}, los puestos ${creceCae(CN.emp_var, "crecieron", "cayeron")}` +
(v === "var_construccion" ? ` y ${CN.emp_suben} de las 24 jurisdicciones tuvieron más que un año antes.` : v === "serie" ? `. El máximo de la serie fue de ${n0(CN.emp_max)} puestos, en el ${CN.emp_max_trim}.` :
`. ${CN.emp_top} tenía ${n1(CN.emp_top_v)} cada 1.000 habitantes${conVeces(CN.emp_top_v, CN.emp_cada_1000)} y ${CN.emp_low}, ${n1(CN.emp_low_v)}${conVeces(CN.emp_low_v, CN.emp_cada_1000)}.`),
});
textosParte({
"permisos-nota": `Superficie cubierta que registran los permisos de edificación de obras privadas, nuevas y ampliaciones, en una nómina de ${CN.per_municipios} municipios que elige el INDEC, en miles de metros cuadrados. ` +
`No es el total del país y no se publica por provincia. El INDEC armó la serie desde ${CN.per_desde} con la nómina actual: las de nóminas anteriores son otras muestras y no se pueden unir con ella. ` +
`Los últimos meses son provisorios. El promedio de doce meses suaviza los saltos de un mes a otro.`,
"hipotecas-nota": `Préstamos hipotecarios en unidades de valor adquisitivo (UVA) que los bancos acordaron cada mes con personas y empresas, según el Banco Central, en miles de millones de pesos de ${CN.hip_mes}, ` +
`llevados con el índice de precios al consumidor del INDEC, que empieza en diciembre de 2016. La tasa es el promedio de las del mes, ponderado por el monto de cada préstamo. No incluye los créditos hipotecarios en pesos sin UVA ni los que se dan en dólares. ` +
`El Banco Central no publica los créditos hipotecarios por provincia: su estadística de préstamos por localidad no los separa del resto y asigna cada préstamo a la sucursal que lo otorga.`,
"obra-publica-nota": `Crédito devengado de la Administración Pública Nacional, según Presupuesto Abierto, en pesos de ${CN.op_ult} con el deflactor del producto interno bruto. ` +
`Las obras propias son las construcciones que paga la Nación, como rutas, diques o edificios, incluidas las de participación público-privada. Las transferencias de capital son los fondos que la Nación da a provincias y municipios para sus propias obras y equipos, ` +
`y también forman parte de las transferencias "otras no automáticas" de Instituciones políticas. Cada gasto se asigna a la provincia donde está la obra: las que abarcan varias provincias o todo el país quedan sin provincia y se cuentan solo en el total del país. ` +
`Por habitante, con la población de cada año. No incluye lo que la Nación transfiere para obras a empresas del Estado y fondos fiduciarios, que no figuran con su provincia.`,
"isac-nota": `El ISAC del INDEC sigue la actividad de la construcción con el consumo aparente de un conjunto de insumos, como cemento, hierro, ladrillos, asfalto y pinturas: lo que se despacha al mercado interno de la producción nacional más lo que se importa. ` +
`Es un índice con base 2004 = 100. La serie sin estacionalidad saca los movimientos que se repiten todos los años en los mismos meses, como los de las vacaciones, y sirve para comparar un mes con el anterior. Como un solo mes puede moverse mucho, el texto suma la comparación de los tres últimos meses con los tres anteriores, la que usa la oficina de estadística del Reino Unido para la construcción. ` +
`Desde ${CN.isac_ini}, el promedio anual más alto fue el de ${CN.isac_anual_max} y el más bajo, el de ${CN.isac_anual_min}. En ${CN.isac_anio_ult} el promedio fue ${n1(CN.isac_anual_ult)}, contra ${n1(CN.isac_anual_ant)} el año anterior.`,
"insumos-nota": `Variación del consumo aparente de cada insumo (lo despachado al mercado interno de la producción nacional más lo importado), medida con su índice del ISAC (base 2004 = 100): los doce meses hasta ${CN.ins_mes} contra los doce anteriores, o lo que va del año contra los mismos meses del año anterior. ` +
`El INDEC publica juntos la grifería, los tubos de acero sin costura y el vidrio plano, porque por el secreto estadístico no puede difundir sus variaciones por separado.`,
"empleo-construccion": LEAD["empleo-construccion"]("construccion_cada_1000"),
"empleo-construccion-nota": `Asalariados registrados del sector privado en la construcción (rama 45 de la clasificación de actividades), según el SIPA, en promedio del trimestre. ` +
`El SIPA asigna cada puesto a la provincia donde declara el empleador, no donde está la obra: una empresa con sede en CABA que construye en otra provincia suma en CABA. ` +
`No incluye a quienes trabajan por su cuenta ni el empleo no registrado: el Censo 2022 contó ${n0(CN.viv_abs.constructores)} personas ocupadas en la construcción, con o sin registro (en la otra pestaña). ` +
`La población es la proyección del INDEC para ${R.anio_pob_ficha.empleo_construccion_provincias}, el año del dato. La provincia de Buenos Aires suma los partidos del Gran Buenos Aires y el resto de la provincia, que el OEDE publica por separado.`,
trabajadores: `En el Censo 2022, ${n0(CN.viv_abs.constructores)} personas dijeron trabajar en la construcción. El porcentaje se calcula sobre las personas ocupadas que informaron la rama de actividad. ` +
`La proporción va del ${pct(CN.viv_top.pct_ocupados_construccion[1])} en ${CN.viv_top.pct_ocupados_construccion[0]} al ${pct(CN.viv_low.pct_ocupados_construccion[1])} en ${CN.viv_low.pct_ocupados_construccion[0]}. El censo cuenta a cada persona donde vive y el empleo registrado de la otra pestaña, donde la declara la empresa: por eso las dos vistas ordenan distinto a las provincias.`,
"trabajadores-nota": `Personas ocupadas según la actividad de la empresa, el negocio o la institución donde trabajan, contadas en el lugar donde viven y no donde está la obra. ` +
`Incluye a asalariados con y sin registro, a quienes trabajan por su cuenta y a patrones. El porcentaje se calcula sobre las personas ocupadas con la rama informada: el ${pct(VV.pct_sin_rama)} no respondió o su respuesta no alcanzó para clasificarla. ` +
`En el mapa, el color divide a los departamentos en cinco grupos del mismo tamaño. Si elegís una provincia en Tu provincia, el mapa se acerca a ella.`,
"costo-nota": `Índice del Costo de la Construcción del INDEC para el Gran Buenos Aires: lo que cuesta construir viviendas modelo, con materiales, mano de obra y gastos generales. ` +
`Para compararlo con la inflación, cada índice se divide por el Índice de Precios al Consumidor nacional y se lleva a 100 en ${CN.costo_desde} (la línea punteada): arriba de 100, construir se encareció más que el promedio de los precios, y abajo, menos. ` +
`El INDEC publica el índice como variación de cada mes desde noviembre de 2015, y el sitio encadena esas variaciones (el resultado coincide con el índice que el INDEC publica desde enero de 2022).`,
"vivienda-nota": NOTA_VIV("pct_alquila"),
});
Object.assign(MED, {
"obra-publica": "prov",
insumos: "var_12m",
"empleo-construccion": "construccion_cada_1000",
"trabajadores-vista": "prov",
vivienda: "pct_alquila",
"vivienda-vista": "prov",
});
Object.assign(DIB, {
permisos: a => lineas(G("permisos"), {anim: a, data: T.permisos_mensual.map(r => ({...r, m2: r.superficie_m2 / 1000, m2_12: r.m2_12m == null ? null : r.m2_12m / 1000, t: tPer(r.periodo)})),
x: "t", series: [{k: "m2", lab: "Por mes", c: css("--celeste"), w: 1.6}, {k: "m2_12", lab: "Promedio de doce meses", c: NAR}], y0: 0, vf: n0, yf: n0, xl: r => mesPer(r.periodo)}),
hipotecas: a => lineas(G("hipotecas"), {anim: a, data: T.hipotecas_mensual.map(r => ({...r, t: tPer(r.periodo)})), x: "t",
series: [{k: "miles_millones", lab: "Por mes", c: NAR}], y0: 0, vf: n0, yf: n0, xl: r => mesPer(r.periodo)}),
"obra-publica": a => {
const k = MED["obra-publica"];
$t("obra-publica").textContent = LEAD["obra-publica"](k);
const cl = [{k: "obras", lab: "Obras de la Nación", c: "#1F5E97"}, {k: "transf", lab: "Transferencias de capital a provincias y municipios", c: "#74ACDF", texto: "#18212B"}];
$("obra-publica-ley").hidden = k !== "serie";
if (k === "serie") {
leyenda("obra-publica-ley", cl);
return columnasApiladas(G("obra-publica"), {anim: a, claves: cl, cadaTick: 5, vf: n0, af: n0, l: 46, unidad: `miles de millones de pesos de ${CN.op_ult}`, data: T.obra_publica_serie});
}
barrasH(G("obra-publica"), {anim: a, data: T.obra_publica_provincias, k: "total_hab", vf: n0, af: v => n0(v / 1000) + " mil", ref: CN.op_hab_pais, refLab: `País ${n0(CN.op_hab_pais)}`,
tip: d => `<b>${d.territorio}</b><br>${n0(d.total_hab)} pesos por habitante<br>Obras de la Nación: ${n0(d.obras_hab)}<br>Transferencias de capital: ${n0(d.transf_hab)}`});
},
isac: conTablas("isac", ["isac_mensual"], a => lineas(G("isac"), {anim: a, data: T.isac_mensual.map(r => ({...r, t: tPer(r.periodo)})), x: "t",
y0: Math.floor(d3.min(T.isac_mensual, r => Math.min(r.original, r.desestacionalizada)) / 20) * 20,
series: [{k: "original", lab: "Original", c: css("--celeste"), w: 1.6}, {k: "desestacionalizada", lab: "Sin estacionalidad", c: NAR}], vf: n1, yf: n0, xl: r => mesPer(r.periodo)})),
insumos: a => {
const k = MED.insumos;
$t("insumos").textContent = LEAD.insumos(k);
barrasH(G("insumos"), {anim: a, data: T.isac_insumos, k, vf: masPct, af: v => v + "%", l: 210, lAngosto: 152, corto: d => CORTO_INS[d.territorio] || d.territorio});
},
"empleo-construccion": conTablas("empleo-construccion", () => MED["empleo-construccion"] === "serie" ? ["empleo_construccion_serie"] : [], a => {
const k = MED["empleo-construccion"];
$t("empleo-construccion").textContent = LEAD["empleo-construccion"](k);
$("clave-empleo-construccion").hidden = k !== "var_construccion";
if (k === "serie") return lineas(G("empleo-construccion"), {anim: a, data: T.empleo_construccion_serie.map(r => ({...r, t: r.anio + (r.trimestre - 1) / 4})), x: "t",
series: [{k: "construccion", lab: "País", c: NAR}], y0: 0, vf: n0, yf: v => n0(v / 1000) + " mil", xl: r => `${TRIM_N[r.trimestre - 1]} trimestre de ${r.anio}`});
const tip = d => `<b>${d.territorio}</b><br>${n0(d.construccion)} puestos asalariados registrados<br>${n1(d.construccion_cada_1000)} cada 1.000 habitantes<br>${pct(d.pct_construccion)} del empleo privado registrado`;
if (k === "var_construccion") return barrasH(G("empleo-construccion"), {anim: a, data: T.empleo_construccion_provincias, k, vf: masPct, af: v => v + "%", mejor: "sube", pais: CN.emp_var, tip});
barrasH(G("empleo-construccion"), {anim: a, data: T.empleo_construccion_provincias, k, vf: n1, af: n0, ref: CN.emp_cada_1000, refLab: `País ${n1(CN.emp_cada_1000)}`, tip});
}),
trabajadores: conTablas("trabajadores", () => MED["trabajadores-vista"] === "mapa" ? ["vivienda_departamentos"] : [], a => MED["trabajadores-vista"] === "mapa"
? mapaDep(G("trabajadores"), {anim: a, filas: T.vivienda_departamentos, k: "pct_ocupados_construccion", nombre: "Personas ocupadas en la construcción", vf: pct})
: barrasH(G("trabajadores"), {anim: a, data: T.vivienda_provincias, k: "pct_ocupados_construccion", ref: VV.pct_ocupados_construccion,
refLab: `País ${pct(VV.pct_ocupados_construccion)}`, vf: v => n1(v) + "%", af: v => v + "%", dif: "puntos"})),
costo: conTablas("costo", ["costo_construccion"], a => lineas(G("costo"), {anim: a, data: T.costo_construccion.map(r => ({...r, t: tPer(r.periodo)})), x: "t",
y0: Math.floor(d3.min(T.costo_construccion, r => Math.min(r.icc_real, r.materiales_real, r.mano_obra_real)) / 10) * 10,
ref: 100,
series: [{k: "icc_real", lab: "Costo total", c: NAR}, {k: "materiales_real", lab: "Materiales", c: css("--celeste"), w: 1.8}, {k: "mano_obra_real", lab: "Mano de obra", c: FRI, w: 1.8}],
vf: n1, yf: n0, xl: r => mesPer(r.periodo)})),
vivienda: conTablas("vivienda", () => MED["vivienda-vista"] === "mapa" ? ["vivienda_departamentos"] : [], a => {
const k = MED.vivienda, ind = VIV_IND[k];
$t("vivienda").textContent = ind.t();
$t("vivienda-nota").textContent = NOTA_VIV(k);
if (MED["vivienda-vista"] === "mapa") return mapaDep(G("vivienda"), {anim: a, filas: T.vivienda_departamentos, k, nombre: ind.nombre, vf: ind.f});
const pc = k.startsWith("pct");
barrasH(G("vivienda"), {anim: a, data: T.vivienda_provincias, k, ref: VV[k], refLab: `País ${pc ? pct(VV[k]) : n1(VV[k])}`,
vf: pc ? (v => n1(v) + "%") : n1, af: pc ? (v => v + "%") : n0, dif: pc ? "puntos" : null});
}),
});
};
