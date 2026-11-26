window.DATINA_PARTES = window.DATINA_PARTES || {};
window.DATINA_PARTES["educacion"] = () => {
textosParte({
"pisa-nota": `Puntaje promedio de los estudiantes de 15 años escolarizados que rindieron la prueba. La OCDE excluyó de las comparaciones el resultado nacional de 2015 por problemas de cobertura de la muestra. Por eso ese año no aparece en el gráfico, aunque figura en la tabla descargable. En 2000 esta fuente solo tiene el puntaje de lectura. El promedio OCDE es el promedio simple de los países miembros en cada ciclo.`,
"escolarizacion-nota": `Alumnos de 12 a 17 años (13 a 17 en las provincias con secundaria de cinco años) matriculados en el nivel secundario, incluidas la educación especial y la de jóvenes y adultos, sobre la población de esa edad. Desde 2022 la población de referencia son las proyecciones del INDEC basadas en el Censo 2022, así que parte del cambio entre 2021 y 2022 responde al cambio de denominador. Algunos valores superan el 100% por diferencias entre la matrícula y la proyección de población. El círculo claro marca ${es.ini} y el lleno ${es.fin}.`,
"aprender-nota": `Aprender es la evaluación nacional de aprendizajes de la Secretaría de Educación. En ${ap.anio} fue censal para 6° grado de primaria. Los porcentajes se calculan con la base agregada por departamento, sector y ámbito que publica la Secretaría, y cuentan solo a quienes tienen un nivel de desempeño asignado. Por eso pueden diferir levemente de los del informe oficial.${DIST["aprender_provincias.mat_logra"]?.["Neuquén"] ? ` En Neuquén, ${DIST["aprender_provincias.mat_logra"]["Neuquén"].motivo}.` : ""}`,
"salario-docente-nota": `Salario bruto por mes de un cargo de referencia, no el promedio de lo que cobran los ` +
`docentes: maestro de grado de primaria, jornada simple, con 10 años de antigüedad, con lo que paga cada provincia. Incluye los adicionales comunes al cargo, como ` +
`zona o residencia donde se pagan, y las sumas extraordinarias del trimestre. Hasta ${DC.fonid_fin} incluía también el Fondo Nacional de Incentivo Docente y la ` +
`conectividad que pagaba la Nación. El país es el promedio ponderado que publica la fuente. Los datos son provisorios y cada edición revisa trimestres anteriores.`,
"inversion-educativa-nota": `Gasto público en educación por alumno de gestión estatal: lo que gasta ` +
`cada provincia en educación más las transferencias no automáticas de la Nación, sin lo que se transfiere a las escuelas de gestión privada, dividido por los ` +
`alumnos de las escuelas estatales. La parte del gasto público no cuenta esas transferencias de la Nación. Montos en pesos de cada año. En la vista Año por año, descontada la inflación, en pesos de ${IE.anio} ` +
`con el deflactor del PBI. Datos provisorios.`,
"escuelas-primarias-nota": `Escuelas primarias comunes del Padrón Oficial de ` +
`Establecimientos Educativos de ${ESP.fecha}: estatales, privadas y de gestión social o cooperativa, también las que no se dibujan en el ` +
`mapa de la página de cada provincia. Cada sede cuenta aparte: un anexo, que funciona en otro lugar, es una escuela más. Cuenta escuelas, no ` +
`alumnos ni vacantes: una escuela rural de diez alumnos vale lo mismo que una de cientos en una ciudad. Chicos de 5 a 14 años de las ` +
`proyecciones del INDEC de ${ESP.anio}, que vienen en grupos de cinco años: la primaria dura seis o siete años según la provincia, y esos dos ` +
`grupos contienen sus edades. Las secundarias están en la ficha siguiente. Que dos medidas vayan juntas no dice que una cause la otra.`,
"escuelas-secundarias-nota": `Escuelas con secundaria común del Padrón Oficial ` +
`de Establecimientos Educativos de ${ESS.fecha}, estatales, privadas y de gestión social o cooperativa. Cada sede cuenta aparte, como en ` +
`las primarias. Chicos de 12 a 17 años de las proyecciones del INDEC de ${ESS.anio}: vienen en grupos de cinco años, así que son tres quintos ` +
`del grupo de 10 a 14 y tres quintos del de 15 a 19. Qué no dice este dato: cuenta escuelas, no alumnos ni vacantes, y algunas provincias ` +
`registran como secundarias aparte las secciones rurales que funcionan en otra escuela, así que tienen más escuelas sin tener más lugar.`,
"privadas-aprender-nota": `Cada punto es un departamento, partido o comuna. En el eje horizontal, qué parte de las escuelas primarias comunes del Padrón ` +
`Oficial de Establecimientos Educativos de ${PAP.fecha} es privada (las de gestión social o cooperativa no cuentan como privadas). En el vertical, qué parte ` +
`de los alumnos de 6° grado alcanzó el nivel satisfactorio o avanzado en matemática en Aprender ${PAP.anio}, con la base agregada por departamento de la ` +
`Secretaría de Educación. Solo entran los departamentos con al menos ${n0(PAP.min)} alumnos evaluados. La línea punteada es solo una guía de la tendencia. ` +
`La correlación es la de rangos de Spearman, que va de menos 1 a 1. Qué no dice este dato: que una escuela privada enseñe mejor. Sus alumnos vienen de ` +
`otros hogares: según el cuestionario de Aprender, el ${pct(PAP.nse_q1_estatal)} de los alumnos de las estatales pertenece al 20% del país con menor ` +
`nivel socioeconómico, y en las privadas el ${pct(PAP.nse_q1_privado)}, y eso también va junto con los resultados. La comparación es entre promedios ` +
`de departamentos, no entre alumnos ni entre escuelas, y cuenta escuelas, no alumnos: una escuela rural chica pesa lo mismo que una grande. ` +
`Que dos datos vayan juntos no prueba que uno cause el otro.`,
"abandono-nota": `Tasa de abandono interanual: alumnos de la secundaria de un año que no se matriculan en el ` +
`año lectivo siguiente. Tasa de repitencia: alumnos que al año siguiente se matriculan en el mismo año de estudio. En % de los alumnos de la ` +
`secundaria común de cada jurisdicción, según los Relevamientos Anuales de la Secretaría de Educación. La fuente aclara que el cálculo supone que ` +
`entre un año y el siguiente no entran alumnos de otras jurisdicciones ni de otras cohortes, y que eso puede sesgar las tasas.` +
(ABN.regimen.length ? ` Desde ${ABN.anio}, ${lista(ABN.regimen)} aplica un régimen académico nuevo en la secundaria (Resolución 1650/2024 de su ` +
`Dirección General de Cultura y Educación), con la acreditación por materia: sus repitientes son los alumnos que no acreditaron ninguna materia ` +
`y siguen en el mismo año, y la fuente avisa que el cambio también puede incidir en el total del país.` : ""),
});
Object.assign(MED, {
pisa: "mat",
aprender: "mat",
});
Object.assign(DIB, {
pisa: a => lineas(G("pisa"), {anim:a, data: T.pisa_argentina_ocde, x:"anio", y0:340, yf: v => v,
series:[{k:`arg_${MED.pisa}_grafico`, lab:"Argentina", c:NAR, w:3}, {k:`ocde_${MED.pisa}`, lab:"Promedio OCDE", c:css("--ocde"), w:2.6}]}),
escolarizacion: a => pesas(G("escolarizacion"), {anim:a, data: T.escolarizacion_secundaria_provincias, a:"tasa_inicio", b:"tasa_final",
la: String(es.ini), lb: String(es.fin), x0: 50, mejor: "sube", uDif: " puntos", pais: [es.pais_ini, es.pais_fin]}),
aprender: a => barrasH(G("aprender"), {anim:a, data: T.aprender_provincias, k:`${MED.aprender}_logra`,
ref: MED.aprender === "mat" ? ap.mat : ap.len, refLab: `País ${pct(MED.aprender === "mat" ? ap.mat : ap.len)}`,
vf: v => n1(v) + "%", af: v => v + "%", dif: "puntos"}),
});
Object.assign(MED, {
"salario-docente": "prov",
"inversion-educativa": "alumno",
abandono: "ab",
});
Object.assign(DIB, {
"salario-docente": conTablas("salario-docente", () => MED["salario-docente"] === "serie" ? ["salario_docente_serie"] : [], a => {
const el = G("salario-docente"), fp = T.salario_docente.find(r => r.codigo_indec === prov);
let txt = LEAD["salario-docente"](MED["salario-docente"]);
if (MED["salario-docente"] === "serie") {
const suya = fp ? new Map(T.salario_docente_serie.filter(r => r.codigo_indec === prov).map(r => [r.periodo, r.bruto_real])) : null;
const data = T.salario_docente_serie.filter(r => r.codigo_indec === "00").map(r => ({periodo: r.periodo, t: tPer(r.periodo), pais: r.bruto_real, prov: suya ? suya.get(r.periodo) ?? null : null}));
if (fp) txt += ` En ${fp.territorio}, descontada la inflación, el salario de ${DC.trim} ${cambioPct(fp.var_real_12m)} frente a ${DC.ant}.`;
$t("salario-docente").textContent = txt;
return lineas(el, {anim: a, data, x: "t", y0: 0, vf: millonesM, yf: ejeM, xl: r => mesPer(r.periodo),
series: [{k: "pais", lab: "Promedio del país", c: NAR}, ...(fp ? [{k: "prov", lab: fp.territorio, c: FRI}] : [])]});
}
if (fp && fp.territorio !== DC.top[0] && fp.territorio !== DC.bajo[0]) txt += ` En ${fp.territorio}, ${n0(fp.bruto)} pesos${conVeces(fp.bruto, DC.pais)}.`;
$t("salario-docente").textContent = txt;
barrasH(el, {anim: a, data: T.salario_docente.filter(r => r.codigo_indec !== "00"), k: "bruto", vf: millonesM, af: ejeM, ref: DC.pais, refLab: `País ${millonesM(DC.pais)}`,
tip: d => `<b>${d.territorio}</b><br>${n0(d.bruto)} pesos brutos en ${DC.trim}` + (d.extra > 0 ? `<br>Incluye una suma extraordinaria de ${n0(d.extra)}` : "") +
`<br>Descontada la inflación, ${cambioPct(d.var_real_12m)} frente a ${DC.ant}`});
}),
"inversion-educativa": conTablas("inversion-educativa", () => MED["inversion-educativa"] === "serie" ? ["inversion_educativa_serie"] : [], a => {
const k = MED["inversion-educativa"], el = G("inversion-educativa"), fp = T.inversion_educativa.find(r => r.codigo_indec === prov);
let txt = LEAD["inversion-educativa"](k);
if (k === "serie") {
const suya = fp ? new Map(T.inversion_educativa_serie.filter(r => r.codigo_indec === prov).map(r => [r.anio, r.por_alumno_real])) : null;
const data = T.inversion_educativa_serie.filter(r => r.codigo_indec === "00").map(r => ({anio: r.anio, pais: r.por_alumno_real, prov: suya ? suya.get(r.anio) ?? null : null}));
if (fp) txt += ` En ${fp.territorio}, ${n0(fp.gasto_por_alumno)} pesos por alumno en ${IE.anio}.`;
$t("inversion-educativa").textContent = txt;
return lineas(el, {anim: a, data, x: "anio", y0: 0, vf: millonesM, yf: ejeM,
series: [{k: "pais", lab: "Todo el país", c: NAR}, ...(fp ? [{k: "prov", lab: fp.territorio, c: FRI}] : [])]});
}
const pctV = k === "pct", col = pctV ? "pct_gasto" : "gasto_por_alumno", ref = pctV ? IE.pct_pais : IE.pais, f = pctV ? pct : millonesM;
const nombradas = pctV ? [IE.pct_top[0], IE.pct_bajo[0]] : [IE.top[0], IE.bajo[0]];
if (fp && !nombradas.includes(fp.territorio)) txt += pctV ? ` En ${fp.territorio}, el ${pct(fp.pct_gasto)}.` : ` En ${fp.territorio}, ${n0(fp.gasto_por_alumno)} pesos por alumno${conVeces(fp.gasto_por_alumno, IE.pais)}.`;
$t("inversion-educativa").textContent = txt;
barrasH(el, {anim: a, data: T.inversion_educativa.filter(r => r.codigo_indec !== "00"), k: col, vf: f, af: pctV ? f : ejeM, ref, refLab: `País ${f(ref)}`, anota: true,
tip: d => `<b>${d.territorio}</b><br>${n0(d.gasto_por_alumno)} pesos por alumno de gestión estatal<br>La educación, ${pct(d.pct_gasto)} del gasto público, ${IE.anio}`});
}),
"escuelas-primarias": a => {
const fp = T.escuelas_primarias_provincias.find(r => r.codigo_indec === prov);
const nombrados = [ESP.top[0], ESP.top2[0], ESP.bajo[0], ESP.bajo2[0], ESP.rural_top[0], ESP.rural_bajo[0]];
let txt = LEAD["escuelas-primarias"]();
if (fp && !nombrados.includes(fp.territorio))
txt += ` En ${fp.territorio}, ${n1(fp.primarias_cada_1000_chicos)} cada 1.000 chicos (${n0(fp.escuelas_primarias)} escuelas, el ` +
`${pct(fp.pct_rurales)} rurales).`;
$t("escuelas-primarias").textContent = txt;
barrasH(G("escuelas-primarias"), {anim: a, data: T.escuelas_primarias_provincias, k: "primarias_cada_1000_chicos", vf: n1, af: n0,
ref: ESP.pais, refLab: `País ${n1(ESP.pais)}`,
tip: d => `<b>${d.territorio}</b><br>${n1(d.primarias_cada_1000_chicos)} escuelas primarias cada 1.000 chicos de 5 a 14 años<br>` +
`${n0(d.escuelas_primarias)} escuelas (${pct(d.pct_rurales)} rurales) y ${n0(d.chicos_5_14)} chicos`});
},
"escuelas-secundarias": a => {
const fp = T.escuelas_secundarias_provincias.find(r => r.codigo_indec === prov);
const nombrados = [ESS.top[0], ESS.top2[0], ESS.bajo[0], ESS.bajo2[0], ESS.por_primaria_min[0], ESS.por_primaria_max[0]];
let txt = LEAD["escuelas-secundarias"]();
if (fp && !nombrados.includes(fp.territorio))
txt += ` En ${fp.territorio}, ${n1(fp.secundarias_cada_1000_chicos)} cada 1.000 chicos (${n0(fp.escuelas_secundarias)} escuelas, el ` +
`${pct(fp.pct_rurales)} rurales).`;
$t("escuelas-secundarias").textContent = txt;
barrasH(G("escuelas-secundarias"), {anim: a, data: T.escuelas_secundarias_provincias, k: "secundarias_cada_1000_chicos", vf: n1, af: n0,
ref: ESS.pais, refLab: `País ${n1(ESS.pais)}`,
tip: d => `<b>${d.territorio}</b><br>${n1(d.secundarias_cada_1000_chicos)} escuelas secundarias cada 1.000 chicos de 12 a 17 años<br>` +
`${n0(d.escuelas_secundarias)} escuelas (${pct(d.pct_rurales)} rurales) y ${n0(d.chicos_12_17)} chicos<br>` +
`${n2(d.secundarias_por_primaria)} secundarias por cada primaria`});
},
"privadas-aprender": conTablas("privadas-aprender", ["privadas_aprender_departamentos"], a => {
const datos = T.privadas_aprender_departamentos.map(d => ({...d, codigo_indec: d.codigo_dep, prov: d.codigo_indec, territorio: `${d.departamento} (${d.provincia})`}));
dispersion(G("privadas-aprender"), {anim: a, data: datos, x: "pct_privadas", y: "mat_logra",
xLab: `Escuelas primarias privadas, ${PAP.fecha}`, yLab: `Satisfactorio o avanzado en matemática, ${PAP.anio}`});
}),
abandono: a => {
const v = MED.abandono, el = G("abandono"), fp = T.abandono_provincias.find(r => r.codigo_indec === prov);
let txt = LEAD.abandono(v);
if (v === "serie") {
$t("abandono").textContent = txt;
return lineas(el, {anim: a, data: T.abandono_pais, x: "anio", y0: 0, vf: pct, yf: v => n0(v) + "%", xl: r => `de ${r.anio} a ${r.anio + 1}`,
series: [{k: "abandono", lab: "Abandono", corto: "Abandono", c: NAR}, {k: "repitencia", lab: "Repitencia", corto: "Repitencia", c: FRI}]});
}
const k = v === "rep" ? "repitencia" : "abandono", pais = v === "rep" ? ABN.rep_pais : ABN.pais;
const ext = v === "rep" ? [ABN.rep_top[0], ABN.rep_bajo[0]] : [ABN.top[0], ABN.top2[0], ABN.bajo[0]];
if (fp && !fp.regimen_nuevo && !ext.includes(fp.territorio)) txt += ` En ${fp.territorio}, el ${pct(fp[k])}.`;
$t("abandono").textContent = txt;
barrasH(el, {anim: a, data: T.abandono_provincias.map(r => r.regimen_nuevo ? {...r, territorio: `${r.territorio} (régimen nuevo)`} : r), k,
l: 196, lAngosto: 140, corto: d => d.regimen_nuevo ? "Bs. As. (rég. nuevo)" : d.territorio, vf: pct, af: v => n0(v) + "%", ref: pais, refLab: `País ${pct(pais)}`,
tip: d => `<b>${d.territorio}</b><br>Abandono: ${pct(d.abandono)} de ${ABN.anio} a ${ABN.sig}<br>Repitencia: ${pct(d.repitencia)} de ` +
`${ABN.rep_anio} a ${ABN.rep_sig}<br>Abandono de ${ABN.ini} a ${ABN.ini + 1}: ${pct(d[`abandono_${ABN.ini}`])}`});
},
});
};
