window.DATINA_PARTES = window.DATINA_PARTES || {};
window.DATINA_PARTES["salud"] = () => {
textosParte({
"causas-nota": `Porcentaje de las muertes de menores de un año de cada provincia según el grupo de causa (capítulos de la CIE-10), sumando ${R.mi_causas.anios[0]} a ${R.mi_causas.anios[1]} porque en las provincias chicas hay pocas muertes por año. Las provincias están ordenadas por su tasa de mortalidad infantil del período, de mayor a menor. ` +
`Según la DEIS, en ${R.mi_causas.reducibles.anio} el ${pct(R.mi_causas.reducibles.neonatal)} de las muertes de menores de 28 días y el ${pct(R.mi_causas.reducibles.posneonatal)} de las de 28 días a 11 meses del país eran reducibles con prevención, diagnóstico o tratamiento oportunos. Ese dato no se publica por provincia y no se puede calcular con los datos abiertos, que traen solo los tres primeros caracteres del código de cada causa. ` +
`Las correlaciones comparan la tasa de cada grupo de causas con el porcentaje de población sin obra social, prepaga ni plan estatal de salud del Censo 2022.`,
"transito-nota": `Personas que murieron en siniestros viales según los registros de las policías y las fuerzas federales (SNIC, Ministerio de ` +
`Seguridad), por la provincia donde ocurrió el hecho. Cada 100.000 habitantes con la población de ${TRN.anio_pob}, el año del medio. Qué no dice ` +
`este dato: la Agencia Nacional de Seguridad Vial cuenta también a quienes mueren dentro de los 30 días del siniestro y da otros números. Las ` +
`estadísticas vitales del Ministerio de Salud no sirven para comparar provincias: en CABA y en Buenos Aires la mayoría de las muertes por causas ` +
`externas se registran sin decir si fueron en el tránsito.`,
"causas-muerte-nota": `Tasas ajustadas por edad con el método directo: la tasa de cada grupo de edad de la provincia se pondera con la población del país de ${CM.anio_std} por edad, así se comparan provincias más jóvenes y más envejecidas. ` +
`Promedio anual de ${CM.desde} a ${CM.hasta}, por provincia de residencia, con la causa básica de muerte agrupada por capítulos de la CIE-10. Las causas externas reúnen los accidentes, las agresiones y las lesiones intencionales. ` +
`El ${pct(CM.mal_def_pais)} de las muertes del país tiene una causa mal definida, desde el ${pct(CM.mal_def_min_v)} en ${CM.mal_def_min} hasta el ${pct(CM.mal_def_max_v)} en ${CM.mal_def_max}: donde hay más causas mal definidas, las demás parecen más bajas de lo que son. ` +
`Población: proyecciones del INDEC de cada año. Las muertes sin edad registrada (el ${pct(CM.sin_edad_pct)}) se reparten en proporción.`,
"muertes-nota": `Cantidad de víctimas por año. Homicidios dolosos y muertes en siniestros viales según el mismo registro del SNIC. Femicidios: víctimas directas según el Registro Nacional de Femicidios de la Justicia Argentina. La figura se incorporó al Código Penal en diciembre de 2012 (Ley 26.791) y los datos abiertos del registro empiezan en ${R.femicidios.ini}. Incluye travesticidios y transfemicidios.`,
"mortalidad-nota": `Defunciones de menores de un año por cada 1.000 nacidos vivos, según la provincia de residencia de la madre. En las provincias con pocos nacimientos la tasa de un solo año varía mucho, por eso se compara el promedio de tres años. El círculo claro marca ${mo.tri_base} y el lleno ${mo.tri_act}. La tabla descargable incluye también el valor de ${mo.anio}. La línea punteada violeta marca el promedio simple de los países de la OCDE en ${OC.mortalidad_infantil.anio}, según el Banco Mundial.`,
"distancia-hospital-nota": `Distancia en línea recta, no por ruta: el ` +
`viaje real es más largo. Las escuelas rurales (primarias y secundarias comunes del padrón oficial) sirven de marca de dónde vive la gente en ` +
`el campo, y cada una cuenta una vez, tenga pocos o muchos alumnos. Los hospitales son los públicos con internación de la ficha de arriba y, ` +
`en la otra vista, los que el registro clasifica con terapia intensiva. El más cercano puede estar en otra provincia. Las escuelas sin una ` +
`ubicación confirmada no entran. La mediana es la distancia que deja a la mitad de las escuelas más cerca y a la otra mitad más lejos. CABA no ` +
`tiene escuelas rurales.`,
"hospitales-nota": `Hospitales públicos con internación del Registro Federal de ` +
`Establecimientos de Salud del Ministerio de Salud: nacionales, provinciales, municipales, universitarios y mixtos, sin las residencias para ` +
`personas mayores. Son los mismos del mapa de escuelas y hospitales de la página de cada provincia. Cuenta establecimientos, no camas: uno de ` +
`cientos de camas en una ciudad grande vale lo mismo que uno de pocas camas en un pueblo. Las clínicas y los sanatorios privados no están, y ` +
`en varias provincias tienen buena parte de las camas. Con terapia intensiva: los que el registro clasifica como de alto riesgo con terapia ` +
`intensiva, una categoría que declara cada provincia. Cada 100.000 habitantes, con la población del INDEC de ${HSP.anio}.`,
"medicos-nota": `Médicos por provincia de residencia, según el informe "Médicos activos en Argentina" del ` +
`Observatorio Federal de Talento Humano en Salud del Ministerio de Salud. Habilitados: con matrícula vigente en la Red Federal de Registros de ` +
`Profesionales de la Salud. Activos: los que alguna de seis fuentes administrativas de empleo, impuestos, jubilaciones y migraciones muestra ` +
`trabajando. El informe no cuenta a los jubilados sin actividad, a los que emigraron ni a los que no tienen actividad registrada. Cada 10.000 ` +
`habitantes, con la población del INDEC de ${MDC.anio}. Un médico puede atender en otra provincia que la de su residencia.`,
"dengue-nota": `Casos confirmados de dengue, incluidos los de embarazadas, según la provincia donde vive cada persona, notificados al Sistema Nacional de ` +
`Vigilancia de la Salud del Ministerio de Salud. La temporada va de la semana epidemiológica 31 de un año, a fines de julio o principios de agosto, a la 30 del ` +
`siguiente, como en los boletines epidemiológicos del Ministerio: los casos se concentran entre el verano y el otoño. La tasa usa la población que proyecta el ` +
`INDEC (base Censo 2022) para el año en que termina cada temporada, por eso empieza en la ${DG.prov_desde}. Los datos llegan hasta la semana ${DG.sem_ult} de ` +
`${DG.anio_ult} y las semanas más recientes pueden sumar casos en las publicaciones siguientes.`,
"vacunas-nota": `La triple viral protege contra el sarampión, las paperas y la rubéola. La primera dosis se da al año de vida y la segunda al entrar a la escuela, ` +
`a los 5 años. Es una cobertura administrativa: las dosis que se aplicaron sobre la población que se estima para esa edad, así que puede pasar de 100% cuando se ` +
`vacuna a chicos de otras provincias o la población estimada se queda corta. La Organización Panamericana de la Salud recomienda llegar al 95% de los chicos para ` +
`frenar el sarampión. El archivo no trae el total del país: la evolución muestra la mediana de las 24 jurisdicciones, la que tiene tantas por encima como por debajo.`,
"esperanza-nota": `Años que viviría en promedio una persona nacida en ${nv.ev_anio} si se mantuvieran las tasas de mortalidad por edad de ese año. El círculo claro marca a los varones y el lleno a las mujeres. El INDEC publica tablas para 2020, 2021 y 2022, y las de 2020 y 2021 reflejan la mortalidad de la pandemia de COVID-19. La línea punteada violeta marca el promedio simple de los países de la OCDE en ${OC.esperanza_vida.anio}, para ambos sexos, según el Banco Mundial.`,
"cobertura-nota": `Personas en viviendas particulares según el Censo 2022 que no tenían obra social (incluido el ` +
`PAMI), prepaga ni un programa o plan estatal de salud: dependían solo de los hospitales y centros de salud públicos, que atienden a todas las personas. ` +
`El INDEC no publica estos totales provinciales en un archivo propio: se suman desde los resultados por radio censal, así que pueden diferir levemente de sus cuadros.`,
});
function piramide(el, cfg) {
const data = cfg.data, fila = 22, angosto = el.clientWidth < 520;
const C = lienzo(el, data.length * fila + 40, {t:30, r:10, b:10, l:10});
const {g, iw} = C, centro = iw / 2, gap = angosto ? 34 : 44;
const mx = d3.max(data, d => Math.max(d.pct_varones, d.pct_mujeres));
const x = d3.scaleLinear().domain([0, mx]).range([0, centro - gap - 34]);
const y = d3.scaleBand().domain(data.map(d => d.edad).reverse()).range([0, data.length*fila]).padding(.2);
g.append("text").attr("x", centro - gap).attr("y", -12).attr("text-anchor","end").attr("class","etq-fuerte").attr("fill",css("--celeste-fuerte")).text("Varones");
g.append("text").attr("x", centro + gap).attr("y", -12).attr("class","etq-fuerte").attr("fill",css("--sol-fuerte")).text("Mujeres");
const f = g.selectAll("g.f").data(data).join("g").attr("transform", d => `translate(0,${y(d.edad)})`);
const v = f.append("rect").attr("x", d => centro - gap - x(d.pct_varones)).attr("width", d => x(d.pct_varones)).attr("height", y.bandwidth()).attr("rx", rBarra(y.bandwidth())).attr("fill", css("--celeste"));
const m = f.append("rect").attr("x", centro + gap).attr("width", d => x(d.pct_mujeres)).attr("height", y.bandwidth()).attr("rx", rBarra(y.bandwidth())).attr("fill", css("--sol"));
f.append("text").attr("x", centro).attr("y", y.bandwidth()/2).attr("dy",".35em").attr("text-anchor","middle").attr("class","etq-suave").text(d => d.edad.replace(" y más","+").replace("Menos de ","<"));
const tv = f.append("text").attr("x", d => centro - gap - x(d.pct_varones) - 5).attr("y", y.bandwidth()/2).attr("dy",".35em").attr("text-anchor","end").attr("class","etq-suave").text(d => n1(d.pct_varones) + "%");
const tm = f.append("text").attr("x", d => centro + gap + x(d.pct_mujeres) + 5).attr("y", y.bandwidth()/2).attr("dy",".35em").attr("class","etq-suave").text(d => n1(d.pct_mujeres) + "%");
if (cfg.anim) {
v.attr("x", centro - gap).attr("width", 0).transition().delay(escalon).duration(DUR_G).ease(EASE)
.attr("x", d => centro - gap - x(d.pct_varones)).attr("width", d => x(d.pct_varones));
m.attr("width", 0).transition().delay(escalon).duration(DUR_G).ease(EASE).attr("width", d => x(d.pct_mujeres));
aparecer(tv, 500); aparecer(tm, 500);
}
}
Object.assign(DIB, {
mortalidad: a => pesas(G("mortalidad"), {anim:a, data: T.mortalidad_infantil_provincias, a:"tmi_base", b:"tmi_actual", la: mo.tri_base, lb: mo.tri_act,
mejor: "baja", pais: [mo.pais_base, mo.pais_act],
vf: n1, af: v => v, ref: OC.mortalidad_infantil.ocde, refLab: `Promedio OCDE ${OC.mortalidad_infantil.anio}: ${n1(OC.mortalidad_infantil.ocde)}`}),
suicidio: a => lineas(G("suicidio"), {anim:a, data: T.suicidio_serie, x:"anio", y0:0, vf: n1, yf: v => v,
series:[{k:"tasa_varones", lab:"Varones", c:NAR, w:2}, {k:"tasa", lab:"Total", c:css("--ink"), w:2.6}, {k:"tasa_mujeres", lab:"Mujeres", c:FRI, w:2}]}),
"suicidio-prov": a => mapaProv(G("suicidio-prov"), {anim: a, filas: T.suicidio_provincias, k: "tasa", nombre: "Suicidios por cada 100.000 habitantes de 5 años y más", vf: n1,
extra: r => `<br>${n0(r.casos)} ${r.casos === 1 ? "caso" : "casos"} en ${R.suicidio.anio}`}),
edad: a => piramide(G("edad"), {anim:a, data: T.suicidio_edad_sexo}),
muertes: a => lineas(G("muertes"), {anim:a, data: T.muertes_violentas, x:"anio", y0:0,
series:[{k:"suicidios", lab:"Suicidios", c:NAR, w:3}, {k:"siniestros_viales", lab:"Viales", c:FRI}, {k:"homicidios", lab:"Homicidios", c:GRIS},
{k:"femicidios", lab:"Femicidios", c:css("--rojo"), w:2.4}]}),
esperanza: a => pesas(G("esperanza"), {anim:a, data: T.esperanza_vida_provincias, a:"varones", b:"mujeres", la:"Varones", lb:"Mujeres",
vf: v => n1(v) + " años", af: v => v, x0: 66, ref: OC.esperanza_vida.ocde, refLab: `Promedio OCDE ${OC.esperanza_vida.anio}: ${n1(OC.esperanza_vida.ocde)}`,
pais: [nv.ev_v, nv.ev_m]}),
cobertura: a => {
$("cobertura-ley").hidden = MED.cobertura !== "tipo";
if (MED.cobertura === "tipo") return conTablas("cobertura", ["cobertura_tipo_provincias"], b => {
const CT = R.cobertura_tipo, P = CT.pais, ft = T.cobertura_tipo_provincias.find(r => r.codigo_indec === prov);
const cl = [{k: "obra_social_prepaga", lab: "Obra social o prepaga", c: css("--celeste-fuerte")},
{k: "plan_estatal", lab: "Plan estatal de salud", c: css("--sol"), texto: css("--ink")},
{k: "sin_cobertura", lab: "Ninguna", c: css("--celeste"), texto: css("--ink")}];
leyenda("cobertura-ley", cl);
$t("cobertura").textContent = `En el Censo 2022, el ${pct(P.obra_social_prepaga)} de las personas tenía obra social o prepaga, incluido el PAMI, ` +
`el ${pct(P.plan_estatal)} solo un programa o plan estatal de salud y el ${pct(P.sin_cobertura)} ninguna de las dos. La obra social o prepaga ` +
`iba del ${pct(CT.os_min[1])} en ${CT.os_min[0]} al ${pct(CT.os_max[1])} en ${CT.os_max[0]}, y el plan estatal, del ${pct(CT.plan_min[1])} en ` +
`${CT.plan_min[0]} al ${pct(CT.plan_max[1])} en ${CT.plan_max[0]}.` + (ft ? ` En ${ft.territorio}, ${pct(ft.obra_social_prepaga)}, ${pct(ft.plan_estatal)} ` +
`y ${pct(ft.sin_cobertura)}.` : "");
apiladasH(G("cobertura"), {anim: b, claves: cl, valF: n1, data: [{...P, codigo_indec: "00", territorio: "Todo el país"}, ...T.cobertura_tipo_provincias]});
G("cobertura").resaltar = null;
})(a);
const fp = T.censo2022_provincias.find(r => r.codigo_indec === prov);
let txt = textoCenso("sin_cobertura");
if (fp && fp.territorio !== nv.censo_top.sin_cobertura[0] && fp.territorio !== nv.censo_low.sin_cobertura[0]) txt += ` En ${fp.territorio}, el ${pct(fp.sin_cobertura)}.`;
$t("cobertura").textContent = txt;
barrasH(G("cobertura"), {anim: a, data: T.censo2022_provincias, k: "sin_cobertura", ref: nv.censo.sin_cobertura, refLab: `País ${pct(nv.censo.sin_cobertura)}`,
vf: pct, af: v => n0(v) + "%"});
},
});
Object.assign(MED, {
medicos: "activos",
hospitales: "hospitales",
"distancia-hospital": "hospital",
});
Object.assign(DIB, {
"distancia-hospital": a => {
const v = MED["distancia-hospital"], ti = v === "terapia", k = ti ? "mediana_km_terapia" : "mediana_km_hospital", pais = ti ? DHO.pais_ti : DHO.pais;
const fp = T.distancia_hospital_provincias.find(r => r.codigo_indec === prov);
const nombrados = ti ? [DHO.top_ti[0], DHO.top2_ti[0], DHO.bajo_ti[0]] : [DHO.top[0], DHO.top2[0], DHO.bajo[0], ...DHO.pocas.map(x => x[0])];
let txt = LEAD["distancia-hospital"](v);
if (fp && !nombrados.includes(fp.territorio))
txt += ` En ${fp.territorio}, la mitad de sus ${n0(fp.escuelas_rurales)} escuelas rurales queda a más de ${n1(fp[k])} km.`;
else if (prov === "02") txt += " CABA no tiene escuelas rurales.";
$t("distancia-hospital").textContent = txt;
barrasH(G("distancia-hospital"), {anim: a, data: T.distancia_hospital_provincias, k, vf: n1, af: n0, ref: pais, refLab: `País ${n1(pais)} km`,
tip: d => `<b>${d.territorio}</b><br>${n0(d.escuelas_rurales)} escuelas rurales<br>La mitad, a más de ${n1(d.mediana_km_hospital)} km de un hospital ` +
`público con internación (${pct(d.pct_mas_20_km)} a más de 20 km)<br>La mitad, a más de ${n1(d.mediana_km_terapia)} km de uno con terapia ` +
`intensiva (${pct(d.pct_terapia_mas_100_km)} a más de 100 km)`});
},
hospitales: a => {
const v = MED.hospitales, ti = v === "terapia", k = `${v}_cada_100000`, pais = ti ? HSP.pais_ti : HSP.pais;
const fp = T.hospitales_provincias.find(r => r.codigo_indec === prov);
const nombrados = ti ? [HSP.top_ti[0], HSP.bajo_ti[0]] : [HSP.top[0], HSP.top2[0], HSP.bajo[0], HSP.bajo2[0]];
let txt = LEAD.hospitales(v);
if (fp && !nombrados.includes(fp.territorio))
txt += ` En ${fp.territorio}, ${n1(fp[k])} cada 100.000 habitantes (${n0(ti ? fp.con_terapia_intensiva : fp.hospitales)}).`;
$t("hospitales").textContent = txt;
barrasH(G("hospitales"), {anim: a, data: T.hospitales_provincias, k, vf: n1, af: ti ? n1 : n0, ref: pais, refLab: `País ${n1(pais)}`,
tip: d => `<b>${d.territorio}</b><br>${n1(d.hospitales_cada_100000)} hospitales públicos con internación cada 100.000 habitantes (${n0(d.hospitales)})<br>` +
`${n1(d.terapia_cada_100000)} con terapia intensiva cada 100.000 (${n0(d.con_terapia_intensiva)})`});
},
medicos: a => {
const v = MED.medicos, k = `${v}_cada_10000`, pais = v === "habilitados" ? MDC.pais_hab : MDC.pais;
const fp = T.medicos_provincias.find(r => r.codigo_indec === prov);
let txt = LEAD.medicos(v);
if (fp && ![MDC.top[0], MDC.top2[0], MDC.bajo[0], MDC.bajo2[0], MDC.inactivos_max[0]].includes(fp.territorio))
txt += ` En ${fp.territorio}, ${n1(fp[k])} cada 10.000 habitantes.`;
$t("medicos").textContent = txt;
barrasH(G("medicos"), {anim: a, data: T.medicos_provincias, k, vf: n1, af: n0, ref: pais, refLab: `País ${n1(pais)}`,
tip: d => `<b>${d.territorio}</b><br>${n1(d.activos_cada_10000)} médicos activos cada 10.000 habitantes (${n0(d.activos)})<br>` +
`${n1(d.habilitados_cada_10000)} habilitados cada 10.000 (${n0(d.habilitados)})<br>${pct(d.pct_activos)} de los habilitados, activos`});
},
});
DIB["causas-muerte"] = a => {
const g = MED["causas-muerte"], k = "tasa_" + g, filas = T.causas_muerte_provincias, pais = filas.find(r => r.codigo_indec === "00");
const f = v => v >= 100 ? n0(v) : n1(v), mk = g === "total" ? "muertes" : "muertes_" + g;
barrasH(G("causas-muerte"), {anim: a, data: filas.filter(r => r.codigo_indec !== "00"), k, vf: f, af: n0, ref: pais[k], refLab: `País ${f(pais[k])}`,
tip: d => `<b>${d.territorio}</b><br>${f(d[k])} muertes por año cada 100.000 habitantes, ajustada por edad` +
(g === "total" ? `<br>${n0(d.tasa_bruta)} sin ajustar` : `<br>${pct(d[mk] / d.muertes * 100)} de las muertes de la provincia`) +
`<br>${n0(d[mk])} muertes de ${CM.desde} a ${CM.hasta}`});
};
MED.transito = "prov";
DIB.transito = conTablas("transito", () => MED.transito === "serie" ? ["transito_pais"] : [], a => {
const el = G("transito");
$t("transito").textContent = MED.transito === "serie" ? TX["transito-serie"] : TX.transito;
if (MED.transito === "serie") return barrasH(el, {anim: a, sinOrden: true, vf: n0, af: ejeMil, l: 60, lAngosto: 48, k: "muertes",
data: T.transito_pais.map(r => ({codigo_indec: "a" + r.anio, territorio: String(r.anio), muertes: r.muertes})),
tip: d => `<b>${d.territorio}</b><br>${n0(d.muertes)} muertes en siniestros viales`});
const filas = T.transito_provincias, pais = filas.find(r => r.codigo_indec === "00");
barrasH(el, {anim: a, data: filas.filter(r => r.codigo_indec !== "00"), k: "cada_100000", vf: n1, af: n0, ref: pais.cada_100000,
refLab: `País ${n1(pais.cada_100000)}`,
tip: d => `<b>${d.territorio}</b><br>${n1(d.cada_100000)} muertes por año cada 100.000 habitantes<br>${n0(d.muertes_por_anio)} muertes por año, ` +
`promedio de ${TRN.desde} a ${TRN.hasta}`});
});
const CAUSA_COL = {perinatales: "#2C74B5", malformaciones: "#74ACDF", respiratorias: "#F6B40E", infecciosas: "#D9453B", externas: "#7A1F2B", mal_definidas: "#C3CAD2", otras: "#E4E9EF"};
DIB.causas = conTablas("causas", ["mortalidad_infantil_causas"], a => {
const gr = MC.grupos, gk = Object.fromEntries(gr.map(x => [x.k, x]));
const vida = ["respiratorias", "infecciosas", "externas"], sumaVida = d3.sum(vida, k => gk[k].pct);
const fuertes = gr.filter(x => Math.abs(x.r_cobertura) >= .4).sort((p, q) => Math.abs(q.r_cobertura) - Math.abs(p.r_cobertura));
const causasSentido = (l, s) => l.length ? `la mortalidad por ${listaY(l.map(x => `${x.lab.toLowerCase()} (correlación de ${n2(x.r_cobertura)})`))} tiende a ser más ${s}` : "";
document.querySelector('[data-t="causas"]').textContent = `Entre ${MC.anios[0]} y ${MC.anios[1]} murieron en el país ${n0(MC.muertes)} bebés antes de cumplir un año. ` +
`El ${pct(gk.perinatales.pct)} murió por afecciones perinatales, como la prematurez y las complicaciones del embarazo y el parto, y el ${pct(gk.malformaciones.pct)}, por malformaciones congénitas. ` +
`Las enfermedades respiratorias, las infecciosas y las causas externas, que suelen estar más ligadas a las condiciones de vida, sumaron el ${pct(sumaVida)}. ` +
(fuertes.length ? `En las provincias con más población sin obra social, prepaga ni plan estatal de salud, ${listaY([causasSentido(fuertes.filter(x => x.r_cobertura > 0), "alta"), causasSentido(fuertes.filter(x => x.r_cobertura < 0), "baja")].filter(Boolean))}. ${fuertes.length > 1 ? "Esas relaciones no se ven en el gráfico y no prueban" : "Esa relación no se ve en el gráfico y no prueba"} que una cosa cause la otra.` : "");
const cl = gr.map(x => ({k: x.k, lab: x.lab, c: CAUSA_COL[x.k], texto: ["#F6B40E", "#74ACDF", "#C3CAD2", "#E4E9EF"].includes(CAUSA_COL[x.k]) ? "#18212B" : "#fff"}));
document.getElementById("causas-ley").innerHTML = cl.map(k => `<span><i style="background:${k.c}"></i>${k.lab}</span>`).join("");
const filas = T.mortalidad_infantil_causas, pais = filas.find(d => d.codigo_indec === "00");
apiladasH(G("causas"), {anim: a, claves: cl, data: [pais, ...filas.filter(d => d.codigo_indec !== "00").sort((p, q) => q.tasa - p.tasa)]});
});
MED.dengue = "provincias";
const dgFilas = () => T.dengue_provincias.filter(r => r.temporada === MED["dengue-temp"]);
DIB.dengue = conTablas("dengue", ["dengue_provincias"], a => {
const v = MED.dengue, el = G("dengue");
$("dg-elige").hidden = v === "serie";
refrescarTabla("f-dengue");
if (v === "serie") {
$t("dengue").textContent = TX["dengue-serie"];
return barrasH(el, {anim: a, data: T.dengue_pais.map(r => ({codigo_indec: r.temporada, territorio: r.temporada, casos: r.casos, cada_100000: r.cada_100000})),
k: "casos", sinOrden: true, vf: n0, af: ejeMil, l: 90, lAngosto: 72,
tip: d => `<b>Temporada ${d.territorio}</b><br>${n0(d.casos)} casos confirmados` + (d.cada_100000 == null ? "" : `<br>${fDg(d.cada_100000)} cada 100.000 habitantes`)});
}
const t = MED["dengue-temp"], filas = dgFilas(), fp = filas.find(r => r.codigo_indec === prov);
const pp = T.dengue_pais.find(r => r.temporada === t), pais = t === DG.juntas ? DG.pais_100000_juntas : pp.cada_100000;
const top = [...filas].sort((x, y) => y.cada_100000 - x.cada_100000)[0], sin = filas.filter(r => r.casos === 0).length;
const txt = t === DG.juntas ? TX.dengue : `En la temporada ${t} se confirmaron ${n0(pp.casos)} casos de dengue en el país, ${fDg(pp.cada_100000)} cada 100.000 habitantes. ` +
`La tasa más alta fue la de ${top.territorio}, con ${fDg(top.cada_100000)}.` + (sin ? ` En ${sin === 1 ? "una jurisdicción" : `${sin} jurisdicciones`} no hubo casos confirmados.` : "");
$t("dengue").textContent = (fp ? `En ${fp.territorio} se confirmaron ${n0(fp.casos)} casos ${t === DG.juntas ? `de la temporada ${DG.prov_desde} a la ${DG.temp}` : `en la ${t}`}, ` +
`${fDg(fp.cada_100000)} cada 100.000 habitantes. ` : "") + txt;
barrasH(el, {anim: a, data: filas, k: "cada_100000", vf: fDg, af: n0, ref: pais, refLab: `País ${fDg(pais)}`,
tip: d => `<b>${d.territorio}</b><br>${fDg(d.cada_100000)} casos cada 100.000 habitantes<br>${n0(d.casos)} casos confirmados`});
});
TABLA_PROPIA["f-dengue"] = () => cargarTabla("dengue_provincias").then(() => MED.dengue === "serie"
? T.dengue_pais.map(r => ({temporada: r.temporada, casos: r.casos, "casos cada 100.000 habitantes": r.cada_100000}))
: dgFilas().map(r => ({codigo_indec: r.codigo_indec, territorio: r.territorio, temporada: r.temporada, casos: r.casos, "casos cada 100.000 habitantes": r.cada_100000})));
MED.vacunas = "dosis1";
DIB.vacunas = a => {
const v = MED.vacunas, el = G("vacunas"), fp = T.vacunas_provincias.find(r => r.codigo_indec === prov);
refrescarTabla("f-vacunas");
if (v === "serie") {
$t("vacunas").textContent = TX["vacunas-serie"];
return lineas(el, {anim: a, data: T.vacunas_serie, x: "anio", y0: 0, vf: pct, yf: v => n0(v) + "%", ref: 95, refLab: "95%, lo que recomienda la OPS", refLabCorto: "95%",
series: [{k: "mediana_dosis1", lab: "Primera dosis", c: css("--celeste-fuerte"), w: 3}, {k: "mediana_dosis2", lab: "Segunda dosis", c: FRI, w: 2.4}]});
}
$t("vacunas").textContent = (fp ? `En ${fp.territorio}, la primera dosis llegó al ${pct(fp.dosis1)} de los chicos de un año y la segunda, al ${pct(fp.dosis2)} ` +
`de los que entraban a la escuela, en ${VC.anio}. ` : "") + TX[v === "dosis1" ? "vacunas" : "vacunas-2"];
barrasH(el, {anim: a, data: T.vacunas_provincias, k: v, vf: pct, af: v => n0(v) + "%", ref: 95, refLab: "95%, lo que recomienda la OPS",
paisLab: "Lo que recomienda la OPS", tip: d => `<b>${d.territorio}</b><br>Primera dosis: ${pct(d.dosis1)}<br>Segunda dosis: ${pct(d.dosis2)}`});
};
TABLA_PROPIA["f-vacunas"] = () => Promise.resolve(MED.vacunas === "serie"
? T.vacunas_serie.map(r => ({año: r.anio, "primera dosis, mediana (%)": r.mediana_dosis1, "segunda dosis, mediana (%)": r.mediana_dosis2,
"jurisdicciones debajo del 95%, primera dosis": r.bajo_95_dosis1, "jurisdicciones debajo del 95%, segunda dosis": r.bajo_95_dosis2}))
: T.vacunas_provincias.map(r => ({codigo_indec: r.codigo_indec, territorio: r.territorio, "primera dosis (%)": r.dosis1, "segunda dosis (%)": r.dosis2})));
};
