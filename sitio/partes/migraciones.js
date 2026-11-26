window.DATINA_PARTES = window.DATINA_PARTES || {};
window.DATINA_PARTES["migraciones"] = () => {
const rangoDep = (filas, k, que) => {
const enP = filas.filter(r => r.codigo_indec === prov), grandes = enP.filter(r => r.poblacion_vp >= MGP.min_pob), base = grandes.length > 1 ? grandes : enP;
if (base.length < 2) return "";
const hi = base.reduce((p, q) => q[k] > p[k] ? q : p), lo = base.reduce((p, q) => q[k] < p[k] ? q : p);
return `En ${NOMBRES[prov]}, la parte de la población ${que} va de ${pct(lo[k])} en ${lo.departamento} a ${pct(hi[k])} en ${hi.departamento}` +
(base === grandes && grandes.length < enP.length ? `, entre los departamentos de ${n0(MGP.min_pob)} habitantes o más.` : ".");
};
textosParte({
"refugio-nota": `Solicitudes de reconocimiento de la condición de persona refugiada presentadas cada año ante la ` +
`CONARE, que decide quién es reconocida como refugiada, y personas reconocidas, según sus estadísticas de ${MGR.anio}. La CONARE las publica solo ` +
`en PDF: el sitio copia sus cuadros. Las cifras de ACNUR son las personas refugiadas y solicitantes de asilo que vivían en el país a fin de cada ` +
`año, que informa cada gobierno: no se suman a las solicitudes, que son trámites de cada año. ACNUR cuenta aparte a las otras personas que ` +
`necesitan protección internacional, que no figuran como refugiadas ni como solicitantes de asilo.`,
"nacidos-otro-pais-nota": `Personas que vivían en viviendas particulares y nacieron en ` +
`otro país, según el Censo 2022 del INDEC, como parte de toda la población en viviendas particulares de cada provincia. Es el primer censo de derecho: ` +
`cuenta a cada persona donde vive habitualmente. El país de nacimiento es el que declaró cada persona, y el ${pct(MGC.no_declarado_pct)} no lo declaró ` +
`(en algunas provincias, muchas más: el texto lo aclara cuando pasa de la quinta parte). Con una provincia elegida, la vista por país muestra los de ` +
`esa provincia. El mapa usa los cuadros de cada provincia, con un dato por departamento, partido o comuna: al pasar el mouse muestra también el ` +
`origen más frecuente entre quienes declararon su país, donde lo declararon al menos 100 personas. El RENAPER identifica más personas nacidas en ` +
`otro país porque cuenta los DNI con el domicilio declarado: está más abajo, en la ficha del RENAPER.`,
"migracion-interna-nota": `Personas que vivían en viviendas particulares según dónde nacieron: en la ` +
`misma provincia, en otra provincia o en otro país, según el Censo 2022 del INDEC. Cuenta dónde nació cada persona y dónde vive, no cuándo se mudó ni ` +
`cuántas veces. El mapa usa los cuadros de cada provincia, con un dato por departamento, partido o comuna, y divide a los departamentos en cinco ` +
`grupos del mismo tamaño.`,
"migracion-historia-nota": `Personas nacidas en otro país como parte de la población total de ` +
`cada censo nacional. Hasta 2001, según el INDEC (Aquí se cuenta, número 12, 2004), y en 2010 y 2022, según la publicación del Censo 2022 sobre ` +
`migraciones. Los nacidos en países limítrofes (Bolivia, Brasil, Chile, Paraguay y Uruguay) hasta 2001 son los de esa publicación del INDEC, y los de ` +
`2022 los calcula el sitio con el cuadro de países de nacimiento del Censo 2022, sobre la población en viviendas particulares. Para 2010 no hay un dato ` +
`publicado con la misma definición. Hasta 2001 los censos contaban a cada persona donde pasó la noche del censo, y el de 2022, donde vive habitualmente.`,
"radicaciones-nota": `Trámites de residencia resueltos a favor por la Dirección Nacional de Migraciones, ` +
`por año y nacionalidad. Cuenta trámites, no personas: alguien puede recibir una residencia temporaria un año y la permanente otro. La residencia ` +
`permanente es para quien quiere establecerse en el país, y la temporaria, para quien viene por un tiempo, por ejemplo a trabajar o a estudiar. ` +
`Las personas de los países del Mercosur y asociados tienen un trámite propio por nacionalidad. No hay datos por provincia.`,
"argentinos-exterior-nota": `Estimación de la División de Población de las Naciones Unidas ` +
`(International Migrant Stock), a mediados de cada año, con los censos y los registros de cada país de destino: no es un conteo. En la mayoría de los ` +
`países cuenta a las personas nacidas en la Argentina, y en algunos, a las de nacionalidad argentina. No es comparable con las cifras de los censos ` +
`del país. La lista de destinos no incluye las Islas Malvinas.`,
"extranjeros-nota": `Personas nacidas en otro país identificadas por el RENAPER, según la provincia del domicilio que declararon en su DNI: es un registro de domicilios declarados, no un conteo de quienes viven en cada provincia, y puede tener domicilios desactualizados. No incluye a quienes viven en el país sin DNI argentino. La población es la proyección del INDEC para ${R.anio_pob_ficha.extranjeros_provincias}, el año del corte.`,
});
Object.assign(DIB, {
extranjeros: a => barrasH(G("extranjeros"), {anim:a, data: T.extranjeros_provincias, k:"cada_100", ref: nv.xt_pais, refLab: `País ${n1(nv.xt_pais)}`, vf: n1, af: n0}),
});
Object.assign(MED, {
refugio: "anio",
"nacidos-otro-pais": "prov",
"migracion-interna": "prov",
radicaciones: "anio",
"argentinos-exterior": "anio",
});
Object.assign(DIB, {
refugio: conTablas("refugio", () => ({nacionalidad: ["refugio_nacionalidades"], acnur: ["refugio_acnur"]})[MED.refugio] || [], a => {
const v = MED.refugio, el = G("refugio");
$t("refugio").textContent = LEAD.refugio(v);
if (v === "nacionalidad") return barrasH(el, {anim: a, data: T.refugio_nacionalidades.map((r, i) => ({codigo_indec: "n" + i, territorio: r.nacionalidad,
solicitudes: r.solicitudes, pct: r.pct})), k: "solicitudes", vf: n0, af: n0, l: 236, lAngosto: 150,
corto: d => d.territorio.replace(/ \(\d+ nacionalidades\)/, ""),
tip: d => `<b>${d.territorio}</b><br>${n0(d.solicitudes)} solicitudes en ${MGR.anio}<br>${pct(d.pct)} del total`});
if (v === "acnur") return lineas(el, {anim: a, data: T.refugio_acnur, x: "anio", y0: 0, vf: n0, yf: n0,
series: [{k: "refugiados", lab: "Personas refugiadas", corto: "Refugiadas", c: NAR}, {k: "solicitantes", lab: "Solicitantes de asilo", corto: "Solicitantes", c: FRI}]});
columnasApiladas(el, {anim: a, data: T.refugio_solicitudes, vf: n0, af: n0, unidad: "solicitudes",
claves: [{k: "solicitudes", lab: "Solicitudes", c: css("--celeste-fuerte")}]});
}),
"nacidos-otro-pais": conTablas("nacidos-otro-pais", () => ({pais: ["nacidos_otro_pais_paises"], mapa: ["migraciones_departamentos"]})[MED["nacidos-otro-pais"]] || [], a => {
const v = MED["nacidos-otro-pais"], el = G("nacidos-otro-pais"), fp = T.nacidos_otro_pais_provincias.find(r => r.codigo_indec === prov);
let txt = LEAD["nacidos-otro-pais"](v);
const nd = fp && fp.pct_pais_no_declarado > 20 ? ` El ${pct(fp.pct_pais_no_declarado)} no declaró su país de nacimiento.` : "";
if (v === "mapa") {
const filas = T.migraciones_departamentos, porDep = Object.fromEntries(filas.map(r => [r.codigo_dep, r]));
$t("nacidos-otro-pais").textContent = (fp ? rangoDep(filas, "pct_otro_pais", "nacida en otro país") + " " : "") + txt;
return mapaDep(el, {anim: a, filas, k: "pct_otro_pais", nombre: "Nacidos en otro país", vf: pct, extra: id => {
const r = porDep[id];
return (r && r.primer_pais ? `<br>Origen más frecuente: ${r.primer_pais}<br>${pct(r.pct_primer_pais)} de quienes declararon su país` : "") +
(r && r.pct_no_declarado > 20 ? `<br>No declaró su país: ${pct(r.pct_no_declarado)}` : "");
}});
}
if (v === "pais") {
const cod = fp ? prov : "00", filas = T.nacidos_otro_pais_paises.filter(r => r.codigo_indec === cod && r.pais !== "País no declarado");
if (fp) txt = `En ${fp.territorio}, los países de nacimiento más frecuentes de las personas nacidas en otro país eran ` +
`${lista(filas.slice(0, 3).map(r => `${r.pais} (${pct(r.pct)})`))}, según el Censo 2022.${nd} En todo el país: ` + inicialMin(txt.replace(/, según el Censo\./, "."));
$t("nacidos-otro-pais").textContent = txt;
barrasH(el, {anim: a, data: filas.map((r, i) => ({codigo_indec: "p" + i, territorio: r.pais, personas: r.personas, pct: r.pct})), k: "personas",
vf: n0, af: v => v >= 1e3 ? n0(v / 1e3) + " mil" : n0(v), l: 150, lAngosto: 118, cambiaConProv: true,
tip: d => `<b>${d.territorio}</b><br>${n0(d.personas)} personas<br>${pct(d.pct)} de las nacidas en otro país${fp ? " que vivían en " + fp.territorio : ""}`});
return;
}
if (fp && fp.territorio !== MGC.top[0] && !MGC.bajos[0].includes(fp.territorio)) txt += ` En ${fp.territorio}, el ${pct(fp.pct_otro_pais)}` +
`${conVeces(fp.pct_otro_pais, MGC.pct)}: ${n0(fp.en_otro_pais)} personas, sobre todo de ${fp.primer_pais}.${nd}`;
$t("nacidos-otro-pais").textContent = txt;
barrasH(el, {anim: a, data: T.nacidos_otro_pais_provincias.filter(r => r.codigo_indec !== "00"), k: "pct_otro_pais", vf: n1, af: n0, ref: MGC.pct,
refLab: `País ${n1(MGC.pct)}`, anota: true, tip: d => `<b>${d.territorio}</b><br>${pct(d.pct_otro_pais)} de la población<br>${n0(d.en_otro_pais)} personas<br>` +
`País más frecuente: ${d.primer_pais}`});
}),
"migracion-interna": conTablas("migracion-interna", () => MED["migracion-interna"] === "mapa" ? ["migraciones_departamentos"] : [], a => {
const fp = T.nacidos_otro_pais_provincias.find(r => r.codigo_indec === prov), mapa = MED["migracion-interna"] === "mapa";
$("migracion-interna-ley").hidden = mapa;
if (mapa) {
$t("migracion-interna").textContent = (fp ? rangoDep(T.migraciones_departamentos, "pct_otra_provincia", "nacida en otra provincia") + " " : "") +
LEAD["migracion-interna"]("mapa");
return mapaDep(G("migracion-interna"), {anim: a, filas: T.migraciones_departamentos, k: "pct_otra_provincia", nombre: "Nacidos en otra provincia", vf: pct});
}
const cl = [{k: "pct_la_provincia", lab: "En la provincia", c: "#1F5E97"}, {k: "pct_otra_provincia", lab: "En otra provincia", c: "#74ACDF", texto: "#18212B"},
{k: "pct_otro_pais", lab: "En otro país", c: "#F6B40E", texto: "#18212B"}];
leyenda("migracion-interna-ley", cl);
let txt = LEAD["migracion-interna"]();
if (fp && fp.territorio !== MGC.otra_top[0] && !MGC.otra_bajos[0].includes(fp.territorio)) txt += ` En ${fp.territorio}, el ${pct(fp.pct_otra_provincia)}` +
` había nacido en otra provincia y el ${pct(fp.pct_otro_pais)}, en otro país.`;
$t("migracion-interna").textContent = txt;
const pais = T.nacidos_otro_pais_provincias.find(r => r.codigo_indec === "00");
apiladasH(G("migracion-interna"), {anim: a, claves: cl, data: [{...pais, territorio: "Todo el país"},
...T.nacidos_otro_pais_provincias.filter(r => r.codigo_indec !== "00").sort((p, q) => q.pct_la_provincia - p.pct_la_provincia)]});
}),
"migracion-historia": a => lineas(G("migracion-historia"), {anim: a, data: T.migracion_censos, x: "anio", y0: 0, vf: pct, yf: v => n0(v) + "%",
series: [{k: "nacidos_otro_pais_pct", lab: "Nacidos en otro país", corto: "Otro país", c: NAR},
{k: "limitrofes_pct", lab: "Nacidos en países limítrofes", corto: "Limítrofes", c: FRI}]}),
radicaciones: conTablas("radicaciones", () => MED.radicaciones === "nacionalidad" ? ["radicaciones_nacionalidad"] : [], a => {
const v = MED.radicaciones, el = G("radicaciones"), cl = [{k: "permanentes", lab: "Permanentes", c: NAR}, {k: "temporarias", lab: "Temporarias", c: css("--celeste")}];
$t("radicaciones").textContent = LEAD.radicaciones(v);
leyenda("radicaciones-ley", cl);
$("radicaciones-ley").hidden = v !== "anio";
if (v === "nacionalidad") {
const filas = T.radicaciones_nacionalidad.filter(r => r.anio === MGD.anio && r.nacionalidad !== "Otras nacionalidades").slice(0, 12);
return barrasH(el, {anim: a, data: filas.map((r, i) => ({codigo_indec: "n" + i, territorio: r.nacionalidad, total: r.total, permanentes: r.permanentes,
temporarias: r.temporarias, pct: r.pct})), k: "total", vf: n0, af: v => v >= 1e3 ? n0(v / 1e3) + " mil" : n0(v), l: 150, lAngosto: 118,
tip: d => `<b>${d.territorio}</b><br>${n0(d.total)} residencias en ${MGD.anio}<br>${n0(d.permanentes)} permanentes y ${n0(d.temporarias)} temporarias<br>` +
`${pct(d.pct)} del total`});
}
columnasApiladas(el, {anim: a, data: T.radicaciones_anual, vf: n0, af: v => n0(v / 1e3) + " mil", unidad: "residencias otorgadas", cadaTick: 1, claves: cl});
}),
"argentinos-exterior": conTablas("argentinos-exterior", () => MED["argentinos-exterior"] === "pais" ? ["argentinos_exterior_destinos"] : [], a => {
const v = MED["argentinos-exterior"], el = G("argentinos-exterior");
$t("argentinos-exterior").textContent = LEAD["argentinos-exterior"](v);
if (v === "pais") return barrasH(el, {anim: a, data: T.argentinos_exterior_destinos.slice(0, 12).map((r, i) => ({codigo_indec: "d" + i, territorio: r.pais,
personas: r.personas, inicio: r.personas_inicio, pct: r.pct})), k: "personas", vf: n0, af: v => v >= 1e3 ? n0(v / 1e3) + " mil" : n0(v), l: 150, lAngosto: 118,
tip: d => `<b>${d.territorio}</b><br>${n0(d.personas)} personas en ${MGO.anio}<br>${pct(d.pct)} del total<br>En ${MGO.desde}, ${n0(d.inicio)}`});
lineas(el, {anim: a, data: T.argentinos_exterior, x: "anio", y0: 0, vf: n0, yf: v => v === 0 ? "0" : n1(v / 1e6) + " M",
series: [{k: "personas", lab: "Nacidos en la Argentina", corto: "Personas", c: NAR}]});
}),
});
};
