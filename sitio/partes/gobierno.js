window.DATINA_PARTES = window.DATINA_PARTES || {};
window.DATINA_PARTES["gobierno"] = () => {
textosParte({
"cuentas-nacion-nota": `Informe mensual de ingresos y gastos del Sector Público Nacional ` +
`no Financiero de la Secretaría de Hacienda, en base caja: lo que efectivamente entra y sale cada mes. Como parte del PBI a precios corrientes del ` +
`INDEC de cada año completo, y los últimos años del PBI son provisorios. Los ingresos son los que le quedan a la Nación: lo que se reparte en forma ` +
`automática con las provincias por la coparticipación no está. Las utilidades que transfiere el Banco Central no cuentan como ingreso, y los intereses ` +
`son netos de los que se paga el propio Estado. Las transferencias corrientes a las provincias son las que no son automáticas. ` +
`Los ingresos de enero de 2026 incluyen la venta de las acciones del Estado en centrales hidroeléctricas.`,
"recaudacion-nota": `Recursos tributarios nacionales de la Dirección Nacional de Investigaciones y Análisis ` +
`Fiscal: lo que cobran la ARCA y otros organismos nacionales, antes de repartir entre la Nación y las provincias. Como parte del PBI a precios ` +
`corrientes del INDEC de cada año completo. La variación de lo que va del año descuenta la inflación con el índice de precios al consumidor del INDEC. La ley de ` +
`coparticipación reparte con las provincias casi todos los impuestos nacionales, pero no los derechos de exportación y de importación.`,
"deuda-nota": `Deuda bruta de la Administración Central según la Secretaría de Finanzas: la deuda en situación de pago normal, ` +
`los atrasos y la deuda que todavía no entró en las reestructuraciones, también la que tienen otros organismos del propio Estado. Como parte del ` +
`PBI, como la publica la Secretaría para cada fin de año y para cada trimestre del año en curso. No incluye la deuda de las provincias ni la del ` +
`Banco Central.`,
"empleo-publico-nota": `Cargos ocupados en las administraciones públicas provinciales (administración ` +
`central, organismos descentralizados y cuentas especiales) del personal permanente y temporario, según la Dirección Nacional de Asuntos ` +
`Provinciales, con la población que proyecta el INDEC para el mismo año. Cuenta cargos, no personas: alguien puede tener dos cargos. Cada provincia informa los suyos` +
(GBC.presupuestados.length ? `, y ${lista(GBC.presupuestados)} ${GBC.presupuestados.length > 1 ? "informan" : "informa"} los cargos ` +
`presupuestados en lugar de los ocupados` : "") + `. La vista de la Nación es la dotación de la administración pública nacional, las empresas y ` +
`las sociedades del Estado que publica el INDEC: no incluye las universidades, el sistema de ciencia y tecnología, el servicio exterior ni el ` +
`personal militar y de seguridad, y tiene meses con datos estimados por el INDEC.`,
"impuestos-provinciales-nota": `Recursos tributarios de origen provincial: ingresos ` +
`brutos, inmobiliario, sellos, automotor y otros, según la Dirección Nacional de Asuntos Provinciales, que replica lo que publica la dirección de ` +
`rentas de cada provincia. Por habitante con la población que proyecta el INDEC para el mismo año. Las provincias no cobran los mismos impuestos: en algunas, el automotor lo ` +
`cobran los municipios. Las finanzas de cada provincia, con lo que recibe de la Nación, están en la ficha siguiente.`,
"coparticipacion-nota": `Tributos de origen nacional del esquema ahorro inversión financiamiento ` +
`de cada provincia, según el Ministerio de Economía: la coparticipación federal de impuestos (Ley 23.548, con la parte que la Ley 26.075 destina ` +
`a educación) y otros impuestos nacionales que se reparten por ley. No incluye lo que pasa por el presupuesto nacional, como los ATN y las demás ` +
`transferencias no automáticas, que están en Instituciones políticas. El reparto entre provincias no sigue a la población: la Ley 23.548, de 1988, ` +
`fija un porcentaje para cada una. CABA y Tierra del Fuego, que en 1988 no eran provincias, reciben su parte de la que le toca a la Nación, con ` +
`porcentajes que fijan otras normas: los de CABA cambiaron en 2016 y en 2020. En pesos de cada año. Por habitante, con la población del INDEC de ese año.`,
"deuda-provincias-nota": `Stock de deuda pública de cada provincia y de CABA al ` +
`${DPR.fecha_txt}, en pesos, según la Subsecretaría de Coordinación Fiscal Provincial del Ministerio de Economía. Los datos son preliminares y ` +
`pueden revisarse. No incluye la deuda flotante ni la contingente, y los bonos van a su valor residual, como aclara la fuente. El Gobierno ` +
`nacional incluye dos fondos fiduciarios nacionales, el Fondo Fiduciario Federal de Infraestructura Regional y el Fondo Fiduciario para el ` +
`Desarrollo Provincial. Bancos y otros incluye lo que la fuente llama deuda consolidada. Por habitante, con la población del INDEC de ${DPR.anio}.` +
(DPR.faltan.length ? ` ${lista(DPR.faltan)} no ${DPR.faltan.length > 1 ? "informaron" : "informó"} su deuda de esa fecha: ${DPR.faltan.length > 1 ? "quedan" : "queda"} sin dato.` : ""),
"fiscal-nota": `Administración pública no financiera de cada provincia, ejecución del año completo según el Ministerio de Economía. Recursos propios: ingresos corrientes menos los tributos de origen nacional, como la coparticipación, y las transferencias, más los recursos propios de capital, sobre los ingresos totales. Incluye impuestos provinciales y regalías. Resultado financiero: ingresos totales menos gastos totales, sobre los ingresos totales. Gasto en personal: sueldos y cargas sociales sobre el gasto total. La serie desde ${R.fiscal.ini} está en el explorador de cruces.` +
Object.entries(R.fiscal.atrasadas).map(([p, a]) => ` ${p} todavía no publicó ${R.fiscal.anio}: figura con ${a}.`).join(""),
});
Object.assign(MED, {
fiscal: "autonomia",
});
Object.assign(DIB, {
fiscal: a => {
const k = MED.fiscal, d = T.fiscal_provincias, fz = R.fiscal, ord = [...d].sort((p, q) => q[k] - p[k]);
document.querySelector('[data-t="fiscal"]').textContent = k === "autonomia"
? `En ${fz.anio}, los recursos propios, sobre todo impuestos provinciales y regalías, fueron el ${pct(fz.top_v)} de los ingresos de ${fz.top} y el ${pct(fz.low_v)} de los de ${fz.low}. La mediana de ${fz.mediana_n === 24 ? "las 24 jurisdicciones" : `las ${fz.mediana_n} jurisdicciones con datos de ${fz.anio}`} fue de ${pct(fz.mediana)}, contra ${pct(fz.mediana_ini)} en ${fz.ini}. El resto de los ingresos llega de la Nación, por coparticipación y otras transferencias.${Object.entries(fz.atrasadas).map(([p, a]) => ` ${p} todavía no publicó ${fz.anio}: figura con ${a}.`).join("")}`
: k === "resultado"
? `En ${fz.anio}, ${fz.superavit} jurisdicciones cerraron con superávit financiero y ${fz.deficit} con déficit. El mayor superávit, en proporción a sus ingresos, fue el de ${ord[0].territorio} (${sg(ord[0].resultado)}) y el mayor déficit, el de ${ord[ord.length - 1].territorio} (${sg(ord[ord.length - 1].resultado)}).${Object.entries(fz.atrasadas).map(([p, a]) => ` ${p} figura con ${a}.`).join("")}`
: `En ${fz.anio}, los sueldos y cargas sociales fueron el ${pct(ord[0].personal)} del gasto de ${ord[0].territorio} y el ${pct(ord[ord.length - 1].personal)} del de ${ord[ord.length - 1].territorio}.${Object.entries(fz.atrasadas).map(([p, a]) => ` ${p} figura con ${a}.`).join("")}`;
barrasH(G("fiscal"), {anim:a, data: d.map(r => fz.atrasadas[r.territorio] ? {...r, territorio: `${r.territorio} (${fz.atrasadas[r.territorio]})`} : r), k, vf: v => (k === "resultado" && v > 0 ? "+" : "") + n1(v) + "%", af: v => v + "%",
color: k === "resultado" ? (r => r.resultado < 0 ? css("--sol") : css("--celeste")) : null});
},
});
Object.assign(MED, {
"cuentas-nacion": "resultado",
recaudacion: "impuesto",
"empleo-publico": "prov",
coparticipacion: "hab",
"deuda-provincias": "hab",
});
Object.assign(DIB, {
coparticipacion: a => {
const v = MED.coparticipacion, el = G("coparticipacion"), fp = T.coparticipacion_provincias.find(r => r.codigo_indec === prov);
let txt = LEAD.coparticipacion(v);
if (v === "hab") {
if (fp && fp.anio === CPA.anio && fp.territorio !== CPA.top_hab[0] && fp.territorio !== CPA.bajo_hab[0])
txt += ` En ${fp.territorio}, ${n2(fp.por_habitante / 1e6)} millones de pesos por habitante${conVeces(fp.por_habitante, CPA.pais_hab)}.`;
$t("coparticipacion").textContent = txt;
return barrasH(el, {anim: a, data: T.coparticipacion_provincias.filter(r => r.anio === CPA.anio), k: "por_habitante", vf: millonesM, af: ejeM,
ref: CPA.pais_hab, refLab: `País ${millonesM(CPA.pais_hab)}`, tip: d => `<b>${d.territorio}</b><br>${n0(d.por_habitante)} pesos por habitante en ${CPA.anio}<br>` +
`${billones(d.millones)}<br>${pct(d.pct_ingresos)} de sus ingresos`});
}
if (fp && fp.territorio !== CPA.top_pct[0] && fp.territorio !== CPA.bajo_pct[0])
txt += ` En ${fp.territorio}, el ${pct(fp.pct_ingresos)}${fp.anio !== CPA.anio ? ` en ${fp.anio}` : ""}. En ${CPA.ini}, el ${pct(fp.pct_ingresos_ini)}.`;
$t("coparticipacion").textContent = txt;
barrasH(el, {anim: a, data: T.coparticipacion_provincias.map(r => CPA.atrasadas[r.territorio] ? {...r, territorio: `${r.territorio} (${CPA.atrasadas[r.territorio]})`} : r),
k: "pct_ingresos", vf: pct, af: v => n0(v) + "%", ref: CPA.pct_pais, refLab: `País ${pct(CPA.pct_pais)}`,
tip: d => `<b>${d.territorio}</b><br>${pct(d.pct_ingresos)} de sus ingresos en ${d.anio}<br>En ${CPA.ini}, ${pct(d.pct_ingresos_ini)}`});
},
"deuda-provincias": conTablas("deuda-provincias", ["deuda_provincias"], a => {
const v = MED["deuda-provincias"], el = G("deuda-provincias"), datos = T.deuda_provincias.filter(r => r.millones != null);
const fp = datos.find(r => r.codigo_indec === prov);
let txt = LEAD["deuda-provincias"](v);
$("deuda-provincias-ley").hidden = v !== "acreedor";
if (v === "acreedor") {
const cl = [{k: "pct_bonos", lab: "Bonos", c: "#1F5E97"}, {k: "pct_organismos", lab: "Organismos internacionales", c: "#74ACDF", texto: "#18212B"},
{k: "pct_nacion", lab: "Gobierno nacional y fondos fiduciarios", c: "#F6B40E", texto: "#18212B"},
{k: "pct_bancos_otros", lab: "Bancos y otros", c: "#C3CAD2", texto: "#18212B"}];
leyenda("deuda-provincias-ley", cl);
if (fp) txt += ` En ${fp.territorio}, el ${pct(fp.pct_bonos)} era en bonos y el ${pct(fp.pct_nacion)}, con el Gobierno nacional.`;
$t("deuda-provincias").textContent = txt;
const pais = {codigo_indec: "00", territorio: "Todo el país", ...Object.fromEntries(cl.map(k => [k.k, DPR[k.k]]))};
return apiladasH(el, {anim: a, claves: cl, data: [pais, ...datos.sort((p, q) => q.pct_bonos - p.pct_bonos)]});
}
if (fp && fp.territorio !== DPR.top[0] && fp.territorio !== DPR.bajo[0])
txt += ` En ${fp.territorio}, ${pesosDeuda(fp.por_habitante)} por habitante${conVeces(fp.por_habitante, DPR.pais_hab)}.`;
$t("deuda-provincias").textContent = txt;
barrasH(el, {anim: a, data: datos, k: "por_habitante", vf: milDeuda, af: ejeMil, ref: DPR.pais_hab, refLab: `País ${milDeuda(DPR.pais_hab)}`,
tip: d => `<b>${d.territorio}</b><br>${pesosDeuda(d.por_habitante)} por habitante al ${DPR.fecha_txt}<br>${billones(d.millones)} en total<br>` +
`${pct(d.pct_bonos)} en bonos`});
}),
"cuentas-nacion": a => {
const v = MED["cuentas-nacion"], el = G("cuentas-nacion");
$t("cuentas-nacion").textContent = LEAD["cuentas-nacion"](v);
if (v === "gasto") return barrasH(el, {anim: a, data: T.gasto_nacion_tipo.map((r, i) => ({codigo_indec: "g" + i, territorio: r.tipo, corto: r.tipo
.replace("Jubilaciones, pensiones y otras prestaciones sociales", "Prestaciones sociales").replace("Transferencias corrientes a las provincias", "A provincias")
.replace("Otros gastos de funcionamiento", "Otros de funcionamiento"), pct: r.pct_gasto_primario, pbi: r.pct_pbi, millones: r.millones})), k: "pct", vf: pct,
af: v => n0(v) + "%", l: 290, lAngosto: 150, corto: d => d.corto,
tip: d => `<b>${d.territorio}</b><br>${pct(d.pct)} del gasto primario de ${GBN.anio}<br>${n2(d.pbi)}% del PBI<br>${billones(d.millones)}`});
const lo = d3.min(T.cuentas_nacion, r => Math.min(r.resultado_primario_pbi, r.resultado_financiero_pbi));
lineas(el, {anim: a, data: T.cuentas_nacion, x: "anio", y0: Math.floor(lo) - 1, ref: 0, vf: pct, yf: v => n0(v) + "%",
series: [{k: "resultado_primario_pbi", lab: "Resultado primario", corto: "Primario", c: NAR}, {k: "resultado_financiero_pbi", lab: "Resultado financiero", corto: "Financiero", c: FRI}]});
},
recaudacion: a => {
const v = MED.recaudacion, el = G("recaudacion");
$t("recaudacion").textContent = LEAD.recaudacion(v);
if (v === "anio") return lineas(el, {anim: a, data: T.recaudacion_anual, x: "anio", y0: 0, vf: pct, yf: v => n0(v) + "%",
series: [{k: "total_pbi", lab: "Recaudación nacional", corto: "Recaudación", c: NAR}]});
barrasH(el, {anim: a, data: T.recaudacion_impuestos.map((r, i) => ({codigo_indec: "t" + i, territorio: r.impuesto, corto: r.impuesto
.replace("Aportes y contribuciones a la seguridad social", "Seguridad social").replace("Derechos de importación y tasa de estadística", "Derechos de importación")
.replace("Débitos y créditos bancarios", "Débitos y créditos"), pct: r.pct, millones: r.millones_12_meses})), k: "pct", vf: pct, af: v => n0(v) + "%",
l: 290, lAngosto: 150, corto: d => d.corto, tip: d => `<b>${d.territorio}</b><br>${pct(d.pct)} de lo recaudado<br>${billones(d.millones)} en doce meses`});
},
deuda: a => {
$t("deuda").textContent = LEAD.deuda();
lineas(G("deuda"), {anim: a, data: T.deuda_pbi, x: "x", y0: 0, vf: pct, yf: v => n0(v) + "%",
xl: r => r.periodo.includes("T") ? `${["primer", "segundo", "tercer", "cuarto"][+r.periodo[0] - 1]} trimestre de ${r.periodo.slice(2)}` : `fin de ${r.periodo}`,
series: [{k: "pct_pbi", lab: "Deuda bruta", corto: "Deuda", c: NAR}]});
},
"empleo-publico": a => {
const v = MED["empleo-publico"], el = G("empleo-publico"), fp = T.empleo_publico_provincias.find(r => r.codigo_indec === prov);
let txt = LEAD["empleo-publico"](v);
if (v === "nacion") {
$t("empleo-publico").textContent = txt;
return lineas(el, {anim: a, data: T.dotacion_nacion.map(r => ({...r, t: tPer(r.periodo)})), x: "t", y0: 0, vf: n0, yf: v => v === 0 ? "0" : n0(v / 1e3) + " mil",
xl: r => mesPer(r.periodo), mensual: true, series: [{k: "total", lab: "Total", c: NAR}, {k: "administracion", lab: "Administración pública nacional",
corto: "Administración", c: css("--azul-hondo")}, {k: "empresas", lab: "Empresas y sociedades del Estado", corto: "Empresas", c: FRI}]});
}
if (fp && fp.territorio !== GBC.top[0] && fp.territorio !== GBC.bajo[0]) txt += ` En ${fp.territorio}, ${n1(fp.cada_1000)}${conVeces(fp.cada_1000, GBC.cada_1000)}: ` +
`${n0(fp.cargos)} cargos.`;
$t("empleo-publico").textContent = txt;
barrasH(el, {anim: a, data: T.empleo_publico_provincias, k: "cada_1000", vf: n1, af: n0, ref: GBC.cada_1000, refLab: `País ${n1(GBC.cada_1000)}`,
tip: d => `<b>${d.territorio}</b><br>${n1(d.cada_1000)} cargos cada 1.000 habitantes<br>${n0(d.cargos)} cargos en ${GBC.anio}<br>En ${GBC.inicio}, ${n0(d.cargos_inicio)}`});
},
"impuestos-provinciales": a => {
const fp = T.impuestos_provinciales.find(r => r.codigo_indec === prov && r.por_habitante != null);
let txt = LEAD["impuestos-provinciales"]();
if (fp && fp.territorio !== GBP.top[0] && fp.territorio !== GBP.bajo[0]) txt += ` En ${fp.territorio}, ${n0(fp.por_habitante)} pesos por habitante` +
`${conVeces(fp.por_habitante, GBP.pais)}, y el ${pct(fp.pct_ingresos_brutos)} de ingresos brutos.`;
$t("impuestos-provinciales").textContent = txt;
barrasH(G("impuestos-provinciales"), {anim: a, data: T.impuestos_provinciales.filter(r => r.por_habitante != null), k: "por_habitante", vf: millonesM, af: ejeM,
ref: GBP.pais, refLab: `País ${millonesM(GBP.pais)}`, tip: d => `<b>${d.territorio}</b><br>${n0(d.por_habitante)} pesos por habitante en ${GBP.anio}<br>` +
`${billones(d.millones)}<br>${pct(d.pct_ingresos_brutos)} de ingresos brutos`});
},
});
};
