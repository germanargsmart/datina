window.DATINA_PARTES = window.DATINA_PARTES || {};
window.DATINA_PARTES["seguridad"] = () => {
const CORTO_DEL = {"Otros delitos contra la propiedad": "Otros contra la propiedad", "Lesiones culposas en siniestros viales": "Lesiones en tránsito",
"Infracciones a la ley de estupefacientes": "Estupefacientes", "Delitos de otras leyes especiales": "Otras leyes especiales",
"Delitos contra la administración pública": "Administración pública", "Otros delitos contra las personas": "Otros contra las personas",
"Otros delitos contra la integridad sexual": "Otros delitos sexuales", "Abusos sexuales con acceso carnal": "Abusos con acceso carnal",
"Delitos contra la seguridad pública": "Seguridad pública", "Otros delitos contra la libertad": "Otros contra la libertad",
"Homicidios dolosos": "Homicidios dolosos", "Lesiones culposas por otros hechos": "Otras lesiones culposas",
"Tentativas de homicidio doloso": "Tentativas de homicidio", "Muertes en siniestros viales": "Muertes en tránsito"};
textosParte({
"delitos-nota": `El SNIC reúne los hechos que registran las fuerzas policiales y de seguridad, y en algunas provincias el Ministerio Público ` +
`Fiscal, en sus primeras actuaciones: los delitos que nadie denuncia ni detecta no figuran, y algunos de los registrados pueden no confirmarse después. Cada hecho ` +
`cuenta como un delito. El total suma los delitos de todos los tipos salvo las contravenciones, y el gráfico muestra los catorce más frecuentes (la tabla tiene todos). Tasas cada 100.000 habitantes con las proyecciones de población del INDEC ` +
`de cada momento (desde 2022, con base en el Censo 2022). Entre 2009 y 2013, el SNIC completó el total del país porque faltan datos de Buenos Aires y de Córdoba.`,
"robos-nota": `Hechos que registran las fuerzas policiales y de seguridad, cada 100.000 habitantes. El robo es quedarse con algo ajeno con fuerza ` +
`en las cosas o violencia en las personas, y el hurto, sin fuerza ni violencia. Los robos no incluyen las tentativas ni los agravados por el resultado de lesiones o ` +
`muertes, que el SNIC cuenta aparte. Las diferencias entre provincias dependen también de cuánto se denuncia y de cómo registra cada fuerza.`,
"homicidios-nota": `Víctimas de homicidios dolosos que registran las fuerzas policiales y de seguridad. Un homicidio es doloso cuando alguien le quita la vida a otra persona con intención de hacerlo. ` +
`Por provincia, la tasa suma las víctimas de ${SG.hom3_desde} a ${SG.anio} y las divide por la población del INDEC de esos años, porque donde hay ` +
`pocos casos la tasa de un solo año cambia mucho. Las muertes en siniestros viales y los femicidios están en la ficha de muertes de Salud.`,
"sin-condena-nota": `Sin condena quiere decir que la persona estaba procesada, con la causa todavía en trámite, o en otra situación legal. ` +
`Cada provincia es su servicio penitenciario: CABA no tiene uno propio y el Servicio Penitenciario Federal va aparte. La línea del país suma todos, también el federal. ` +
`No se cuentan las personas detenidas en comisarías ni las que tienen prisión domiciliaria.`,
"carceles-nota": `Censo de las personas alojadas en establecimientos penitenciarios al 31 de diciembre de cada año. No incluye a las ` +
`personas detenidas en comisarías ni a las que tienen prisión domiciliaria. Por provincia, cada servicio penitenciario provincial sobre la población de su provincia que proyecta el INDEC para el mismo año: ` +
`las cárceles federales van aparte y una cárcel puede alojar a personas detenidas por la justicia de otra provincia. El país, sobre la población que usa el SNIC. ` +
`El salto de 2004 viene del dato de la provincia de Buenos Aires de ese año, mucho más alto que el de los años vecinos.`,
});
Object.assign(MED, {
delitos: "tipo",
robos: "robos",
homicidios: "prov",
carceles: "serie",
"sin-condena": "prov",
});
Object.assign(DIB, {
delitos: a => {
const el = G("delitos");
$t("delitos").textContent = LEAD.delitos(MED.delitos);
if (MED.delitos === "serie") return lineas(el, {anim: a, data: T.delitos_serie, x: "anio", y0: 0, vf: n0, yf: n0, series: [{k: "robos", lab: "Robos", c: NAR},
{k: "hurtos", lab: "Hurtos", c: FRI}, {k: "amenazas", lab: "Amenazas", c: css("--azul-hondo")}, {k: "lesiones", lab: "Lesiones dolosas", c: css("--muted")}]});
const data = T.delitos_tipo.slice(0, 14).map(r => ({codigo_indec: "d" + r.codigo, territorio: r.delito, tasa: r.tasa, hechos: r.hechos, pct: r.pct}));
barrasH(el, {anim: a, data, k: "tasa", vf: n0, af: n0, l: 236, lAngosto: 150, corto: d => CORTO_DEL[d.territorio] || d.territorio,
tip: d => `<b>${d.territorio}</b><br>${n0(d.hechos)} hechos en ${SG.anio}<br>${n0(d.tasa)} cada 100.000 habitantes<br>${pct(d.pct)} de los delitos registrados`});
},
robos: conTablas("robos", () => MED.robos === "serie" ? ["seguridad_serie_prov"] : [], a => {
const k = MED.robos, el = G("robos"), fp = T.robos_provincias.find(r => r.codigo_indec === prov);
let txt = LEAD.robos(k);
if (k === "serie") {
const suya = fp ? new Map(T.seguridad_serie_prov.filter(r => r.codigo_indec === prov).map(r => [r.anio, r])) : null;
const data = T.delitos_serie.map(r => ({anio: r.anio, robos: r.robos, hurtos: r.hurtos, robos_p: suya?.get(r.anio)?.robos ?? null, hurtos_p: suya?.get(r.anio)?.hurtos ?? null}));
if (fp) txt += ` En ${fp.territorio}, ${n0(fp.robos)} robos y ${n0(fp.hurtos)} hurtos cada 100.000 habitantes en ${SG.anio}.`;
$t("robos").textContent = txt;
return lineas(el, {anim: a, data, x: "anio", y0: 0, vf: n0, yf: n0, series: [{k: "robos", lab: "Robos en el país", c: NAR}, {k: "hurtos", lab: "Hurtos en el país", c: css("--azul-hondo")},
...(fp ? [{k: "robos_p", lab: `Robos en ${fp.territorio}`, c: FRI}, {k: "hurtos_p", lab: `Hurtos en ${fp.territorio}`, c: css("--sol-borde")}] : [])]});
}
const ref = k === "hurtos" ? SG.hurtos : SG.robos, nombradas = k === "hurtos" ? [SG.hurtos_top[0], SG.hurtos_bajo[0]] : [SG.robos_top[0], SG.robos_bajo[0]];
if (fp && !nombradas.includes(fp.territorio)) txt += ` En ${fp.territorio}, ${n0(fp[k])} cada 100.000 habitantes${conVeces(fp[k], ref)}.`;
$t("robos").textContent = txt;
barrasH(el, {anim: a, data: T.robos_provincias.filter(r => r.codigo_indec !== "00"), k, vf: n0, af: n0, ref, refLab: `País ${n0(ref)}`,
tip: d => `<b>${d.territorio}</b><br>${n0(d[k])} ${k} cada 100.000 habitantes en ${SG.anio}<br>En ${SG.anio - 1}, ${n0(d[k + "_ant"])}`});
}),
homicidios: conTablas("homicidios", () => MED.homicidios === "serie" ? ["seguridad_serie_prov"] : [], a => {
const el = G("homicidios"), fp = T.homicidios_provincias.find(r => r.codigo_indec === prov);
let txt = LEAD.homicidios(MED.homicidios);
if (MED.homicidios === "serie") {
const suya = fp ? new Map(T.seguridad_serie_prov.filter(r => r.codigo_indec === prov).map(r => [r.anio, r.homicidios])) : null;
const data = T.delitos_serie.map(r => ({anio: r.anio, pais: r.homicidios, prov: suya ? suya.get(r.anio) ?? null : null}));
if (fp) txt += ` En ${fp.territorio}, ${n1(fp.tasa)} en ${SG.anio}.`;
$t("homicidios").textContent = txt;
return lineas(el, {anim: a, data, x: "anio", y0: 0, vf: n1, yf: n0,
series: [{k: "pais", lab: "Todo el país", c: NAR}, ...(fp ? [{k: "prov", lab: fp.territorio, c: FRI}] : [])]});
}
if (fp && fp.territorio !== SG.hom3_top[0] && fp.territorio !== SG.hom3_bajo[0]) txt += ` En ${fp.territorio}, ${n1(fp.tasa_3)} por año entre ${SG.hom3_desde} y ${SG.anio}${conVeces(fp.tasa_3, SG.hom3_pais)}: ${n0(fp.victimas_3)} víctimas en tres años.`;
$t("homicidios").textContent = txt;
barrasH(el, {anim: a, data: T.homicidios_provincias.filter(r => r.codigo_indec !== "00"), k: "tasa_3", vf: n1, af: n0, ref: SG.hom3_pais, refLab: `País ${n1(SG.hom3_pais)} (${SG.hom3_desde} a ${SG.anio})`,
tip: d => `<b>${d.territorio}</b><br>${n1(d.tasa_3)} víctimas cada 100.000 habitantes por año, ${SG.hom3_desde} a ${SG.anio}<br>${n0(d.victimas_3)} víctimas en esos tres años<br>En ${SG.anio}: ${n0(d.victimas)}`});
}),
carceles: a => {
const el = G("carceles"), fp = T.carceles_provincias.find(r => r.codigo_indec === prov);
let txt = LEAD.carceles(MED.carceles);
if (MED.carceles === "prov") {
if (fp) txt += ` En ${fp.territorio}, ${n0(fp.tasa)} cada 100.000 habitantes: ${n0(fp.personas)} personas, el ${pct(fp.pct_condenados)} con condena.`;
$t("carceles").textContent = txt;
return barrasH(el, {anim: a, data: T.carceles_provincias, k: "tasa", vf: n0, af: n0,
tip: d => `<b>${d.territorio}</b><br>${n0(d.personas)} personas en el servicio penitenciario provincial al 31 de diciembre de ${SG.sn_anio}<br>${n0(d.tasa)} cada 100.000 habitantes<br>${pct(d.pct_condenados)} con condena`});
}
$t("carceles").textContent = txt;
lineas(el, {anim: a, data: T.carceles_serie, x: "anio", y0: 0, vf: n0, yf: n0, series: [{k: "tasa", lab: "Todo el país", c: NAR}]});
},
"sin-condena": a => {
const el = G("sin-condena"), fp = T.carceles_provincias.find(r => r.codigo_indec === prov);
let txt = LEAD["sin-condena"](MED["sin-condena"]);
if (MED["sin-condena"] === "prov") {
if (fp) txt += ` En ${fp.territorio}, el ${pct(fp.pct_sin_condena)}: ${n0(fp.personas - fp.condenados)} de ${n0(fp.personas)} personas.`;
$t("sin-condena").textContent = txt;
return barrasH(el, {anim: a, data: T.carceles_provincias, k: "pct_sin_condena", vf: pct, af: v => n0(v) + "%", ref: SG.sn_sin, refLab: `País ${pct(SG.sn_sin)}`,
tip: d => `<b>${d.territorio}</b><br>${pct(d.pct_sin_condena)} sin condena al 31 de diciembre de ${SG.sn_anio}<br>${n0(d.personas - d.condenados)} de ${n0(d.personas)} personas en el servicio penitenciario provincial`});
}
$t("sin-condena").textContent = txt;
lineas(el, {anim: a, data: T.carceles_serie, x: "anio", y0: 0, vf: pct, yf: v => n0(v) + "%", series: [{k: "pct_sin_condena", lab: "Todo el país", c: NAR}]});
},
});
};
