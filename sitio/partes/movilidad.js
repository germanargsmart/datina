window.DATINA_PARTES = window.DATINA_PARTES || {};
window.DATINA_PARTES["movilidad"] = () => {
textosParte({
"sube-nota": `Cantidad de tarjetas distintas que registraron al menos un viaje en el día. Se toma la mediana de los días hábiles de cada mes, así los feriados o paros no bajan el valor del mes. En ${su.mes} se usaron por día ${n1(su.colectivo_millones)} millones de tarjetas en colectivo, ${n0(su.tren_miles)} mil en tren y ${n0(su.subte_miles)} mil en subte (una tarjeta que combina modos cuenta en cada uno). La SUBE funciona en el AMBA y en decenas de ciudades del interior. No incluye ciudades con sistemas de pago propios. Cuenta tarjetas y no pasajeros: quien paga con tarjeta bancaria, celular o QR, donde se puede, no aparece. ` +
(su.faltan.length ? `La fuente no publica ningún día de ${su.faltan.join(" ni de ")}: el gráfico deja el hueco. ` : "") +
(su.lancha_salto ? `Desde ${su.lancha_salto} la cantidad de tarjetas en lanchas de la serie se multiplica de un mes a otro, y la fuente no explica por qué. ` : "") +
`Último día disponible en la fuente: ${su.ultimo_dia}.`,
"sube-modos": `En ${su.mes}, en un día hábil típico se usaron ${n0(su.subte_miles)} mil tarjetas SUBE en subtes. En los primeros días hábiles de marzo de 2020, antes del aislamiento, eran ${n0(su.tren_pre_miles)} mil en trenes y ${n0(su.subte_pre_miles)} mil en subtes. ` +
`Frente a entonces, los trenes tienen ${pct(Math.abs(su.tren_vs_pre))} ${su.tren_vs_pre < 0 ? "menos" : "más"} tarjetas y los colectivos, ${pct(Math.abs(su.colectivo_vs_pre))} ${su.colectivo_vs_pre < 0 ? "menos" : "más"}. ` +
`En el subte hay ${pct(Math.abs(su.subte_vs_pre))} ${su.subte_vs_pre < 0 ? "menos" : "más"}, pero esa diferencia no mide pasajeros: desde diciembre de 2024 parte de los viajes en subte se paga sin SUBE y no figura en estos datos.`,
"sube-modos-nota": `Mediana de las tarjetas distintas que viajaron cada día hábil en cada modo. El subte funciona solo en CABA y los trenes con SUBE, sobre todo en el Área Metropolitana. ` +
`Desde diciembre de 2024 el subte acepta tarjetas bancarias y celulares sin contacto, y desde mayo de 2025 pagos con QR: esos viajes no usan la SUBE y no están en estos datos, así que la baja de tarjetas en el subte no es lo mismo que una baja de pasajeros.`,
"patentes-nota": `Inscripciones iniciales de vehículos cero kilómetro. Automotores incluye autos, camionetas y vehículos de carga. Los datos de motos empiezan en ${au.motos_ini}.`,
"combustibles-nota": `La mediana de los precios en el surtidor que cada estación de servicio declara para el mes a la Secretaría de Energía ` +
`(Resolución 1104/2004): la mitad de las estaciones cobra más y la otra mitad, menos. Solo la venta al público en bocas de expendio con movimiento en el mes, y sin los precios ` +
`que se alejan a menos de la mitad o a más del doble de la mediana del país, en su mayoría cargados divididos por mil. La nafta súper es la de 92 a 95 octanos y el gasoil, el de grado 2. ` +
`Las estaciones declaran con demora: el último mes es el más reciente en el que declararon casi todas (${n0(CB.estaciones)} vendieron nafta súper al público en ${CB.mes}). ` +
`La serie mes a mes pasa los precios a pesos de ${CB.mes} con el índice de precios al consumidor del INDEC. La serie año por año es el promedio de la mediana ` +
`de los doce meses de cada año, desde ${CB.anual_ini}, el primer año completo desde que rige la resolución, y pasa los precios a pesos de ${CB.anual_ult} con el deflactor ` +
`del producto interno bruto que publica el Banco Mundial, porque el índice de precios al consumidor del INDEC para todo el país empieza en diciembre de 2016.`,
"patentes-prov-nota": `La provincia es la del registro donde se hizo la inscripción, que no siempre coincide con el lugar donde se usa el vehículo. Por eso algunas jurisdicciones muestran valores muy altos. La población es la proyección del INDEC para ${R.anio_pob_ficha.patentamientos_provincias}, el mismo año.`,
});
Object.assign(MED, {
"patentes-prov": "autos_1000",
});
Object.assign(DIB, {
sube: a => lineas(G("sube"), {anim:a, data: T.sube_dia_habil, x:"t", y0:0, mensual:true, huecos:true, ref: su.pre_millones * 1e6,
refLab: "Marzo de 2020, antes del aislamiento", refLabCorto: "Marzo de 2020", vf: v => n2(v / 1e6) + " M", yf: v => n1(v / 1e6) + " M",
xl: d => { const [y, m] = d.periodo.split("-"); return `${MESES[+m - 1]} ${y}`; },
series:[{k:"total", lab:"Tarjetas", c:NAR, w:2.4}]}),
"sube-modos": a => lineas(G("sube-modos"), {anim:a, data: T.sube_dia_habil, x:"t", y0:0, mensual:true, huecos:true,
ref: su.tren_pre_miles * 1e3, refLab: "Trenes, marzo de 2020", refLabCorto: "Trenes, marzo 2020",
vf: v => n0(v / 1e3) + " mil", yf: v => n0(v / 1e3) + " mil",
xl: d => { const [y, m] = d.periodo.split("-"); return `${MESES[+m - 1]} ${y}`; },
series:[{k:"tren", lab:"Trenes", c:NAR, w:2.4}, {k:"subte", lab:"Subtes", c:FRI, w:2.4}]}),
patentes: a => lineas(G("patentes"), {anim:a, data: T.patentamientos_anual, x:"anio", y0:0, vf: v => n0(v / 1e3) + " mil", yf: v => n0(v / 1e3) + " mil",
series:[{k:"autos", lab:"Autos", c:NAR, w:3}, {k:"motos", lab:"Motos", c:FRI, w:2.4}]}),
"patentes-prov": a => barrasH(G("patentes-prov"), {anim:a, data: T.patentamientos_provincias, k: MED["patentes-prov"],
ref: MED["patentes-prov"] === "autos_1000" ? au.pais_1000 : au.motos_pais_1000,
refLab: `País ${n1(MED["patentes-prov"] === "autos_1000" ? au.pais_1000 : au.motos_pais_1000)}`, vf: n1, af: n0}),
});
Object.assign(MED, {
combustibles: "nafta",
"combustibles-vista": "prov",
});
Object.assign(DIB, {
combustibles: conTablas("combustibles", () => ({mes: ["combustibles_mensual"], anio: ["combustibles_anual"]})[MED["combustibles-vista"]] || [], a => {
const p = MED.combustibles, el = G("combustibles"), fp = T.combustibles_provincias.find(r => r.codigo_indec === prov);
let txt = LEAD.combustibles(p, MED["combustibles-vista"]);
if (MED["combustibles-vista"] === "anio") {
const suya = fp ? new Map(T.combustibles_anual.filter(r => r.codigo_indec === prov).map(r => [r.anio, r[p + "_real"]])) : null;
if (fp && suya.has(CB.anual_ult)) txt += ` En ${fp.territorio}, ${n0(suya.get(CB.anual_ult))} pesos en ${CB.anual_ult}.`;
$t("combustibles").textContent = txt;
return lineas(el, {anim: a, x: "anio", y0: 0, vf: n0, yf: n0,
data: T.combustibles_anual.filter(r => r.codigo_indec === "00").map(r => ({anio: r.anio, pais: r[p + "_real"], prov: suya ? suya.get(r.anio) ?? null : null})),
series: [{k: "pais", lab: "Todo el país", c: NAR}, ...(fp ? [{k: "prov", lab: fp.territorio, c: FRI}] : [])]});
}
if (MED["combustibles-vista"] === "mes") {
const suya = fp ? new Map(T.combustibles_mensual.filter(r => r.codigo_indec === prov).map(r => [r.periodo, r[p + "_real"]])) : null;
if (fp) txt += ` En ${fp.territorio}, ${n0(suya.get(CB.periodo))} pesos en ${CB.mes}.`;
$t("combustibles").textContent = txt;
return lineas(el, {anim: a, x: "t", y0: 0, vf: n0, yf: n0, xl: r => mesPer(r.periodo), mensual: true,
data: T.combustibles_mensual.filter(r => r.codigo_indec === "00").map(r => ({t: tPer(r.periodo), periodo: r.periodo, pais: r[p + "_real"], prov: suya ? suya.get(r.periodo) ?? null : null})),
series: [{k: "pais", lab: "Todo el país", c: NAR}, ...(fp ? [{k: "prov", lab: fp.territorio, c: FRI}] : [])]});
}
$t("combustibles").textContent = txt;
barrasH(el, {anim: a, data: T.combustibles_provincias, k: p, vf: n0, af: n0, ref: CB[p], refLab: `País ${n0(CB[p])}`,
tip: d => `<b>${d.territorio}</b><br>${n0(d[p])} pesos por litro<br>${n0(d[p + "_estaciones"])} estaciones<br>En ${CB.mes_antes}: ${n0(d[p + "_antes"])}`});
}),
});
};
