window.DATINA_PARTES = window.DATINA_PARTES || {};
window.DATINA_PARTES["energia"] = () => {
const TEC_CEN = [{k: "termica", lab: "Térmica", c: "#8C9AAB"}, {k: "hidraulica", lab: "Hidroeléctrica", c: "#2C74B5"}, {k: "nuclear", lab: "Nuclear", c: "#85340A"},
{k: "eolica", lab: "Eólica", c: "#74ACDF"}, {k: "solar", lab: "Solar", c: "#F6B40E"}, {k: "biogas", lab: "Biomasa y biogás", c: "#5E9E6E"}];
const COL_CEN = Object.fromEntries(TEC_CEN.map(t => [t.lab, t.c]));
textosParte({
"gas-consumo-nota": `Gas que las distribuidoras entregaron en el año a sus usuarios residenciales (domiciliarios), dividido por el promedio de esos usuarios, según los datos operativos del ENARGAS. ` +
`El ENARGAS cuenta clientes y no hogares: un edificio con caldera central para calefacción o agua caliente es un solo usuario, y los usuarios de las subdistribuidoras, que llevan el gas desde la red de una distribuidora hasta un grupo de usuarios, no figuran. ` +
`Es el gas entregado en cada mes, que no coincide exactamente con el facturado. El consumo depende del clima de cada lugar y de lo frío que sea cada invierno, y también de la tarifa: ` +
`la Patagonia, el departamento de Malargüe y la Puna tienen el régimen de zona fría (ver Para entender los datos). ` +
(e.gas_chicas.length ? `${lista(e.gas_chicas.map(([t, u]) => `${t} (${n0(u)} usuarios)`))} ${e.gas_chicas.length > 1 ? "tienen" : "tiene"} menos de ${n0(e.gas_min_usuarios)} usuarios residenciales ` +
`y no se ${e.gas_chicas.length > 1 ? "comparan" : "compara"}. ` : "") +
(e.gas_sin.length ? `${lista(e.gas_sin)} no ${e.gas_sin.length > 1 ? "figuran" : "figura"} en los datos de las distribuidoras. ` : "") +
`Para tener una referencia, en Gran Bretaña un medidor residencial consumió en promedio ${n0(e.gas_ru.kwh)} kilovatios hora de gas en ${e.gas_ru.anio}, con la corrección por clima de su fuente, ` +
`el Departamento de Seguridad Energética y Cero Neto del Reino Unido: unos ${n0(e.gas_ru.m3)} metros cúbicos de gas de 9.300 kilocalorías, en una conversión aproximada.` +
(e.gas_ru.ar ? ` Ese año, un usuario residencial de la Argentina consumió ${n0(e.gas_ru.ar)} metros cúbicos.` : ""),
"centrales-nota": `Centrales del listado de la Secretaría de Energía, con datos de CAMMESA, actualizado en ${e.cen_fecha}. El tamaño de cada círculo es su potencia, y las ` +
`${n0(e.cen_sin_pot)} centrales que no la informan (${n0(e.cen_mem_sin_pot)} de ellas conectadas al mercado eléctrico mayorista) van como círculos vacíos: por eso la potencia no se suma ` +
`por provincia. La potencia del país es la que publica CAMMESA para cada año, por tecnología: la térmica reúne ciclos combinados, turbinas a gas, turbinas de vapor y motores diésel, ` +
`y la hidroeléctrica incluye las centrales de menos de 50 megavatios.` +
(e.cen_sin_atucha1 ? ` Las nucleares del listado son ${lista(e.cen_nuc)}, con ${n0(e.cen_nuc_mw)} megavatios. CAMMESA cuenta ${n0(e.pot_nuc_mw)}: suma Atucha I, de 362 megavatios, que el listado no tiene.` : ""),
"subsidios-nota": `Gasto corriente en subsidios económicos a la energía del Sector Público Nacional no Financiero, en base caja, ` +
`según el Informe Mensual de Ingresos y Gastos que la Secretaría de Hacienda publica desde ${e.sub_ini}. Es la serie oficial tal como la publica Hacienda: el sitio no arma su propia definición de subsidio. ` +
`El PBI es el del INDEC a precios corrientes. Los pesos de ${e.sub_ult} usan el deflactor del PBI, y la comparación de lo que va del año, el índice de precios al consumidor del INDEC. ` +
`La Oficina de Presupuesto del Congreso sigue los subsidios con otro criterio (cuenta los gastos devengados de la Administración Nacional), y sus cifras pueden diferir.`,
"gas-hogares-nota": `Combustible que el hogar usa principalmente para cocinar, según el Censo 2022. El gas de red es el que llega por cañería de una distribuidora. El zeppelin es un tanque de gas a granel en el lugar. ` +
`En el mapa, cada departamento muestra el porcentaje de hogares que cocina con gas de red, en cinco grupos del mismo tamaño. Si elegís una provincia en Tu provincia, el mapa se acerca a ella.`,
"tarifa-luz-nota": `Cargo fijo y cargo variable de la categoría residencial que corresponde a cada consumo, en el cuadro tarifario del ENRE ` +
`vigente cada mes, promedio de Edenor y Edesur. Cuando la factura era bimestral se toma la mitad. Hasta ` +
`agosto de 2022 la tarifa era la misma para todos los hogares y tenía subsidios del Estado en el precio de la energía. Desde la segmentación ` +
`de septiembre de 2022 la línea es la de los hogares sin subsidio: los que tienen subsidio pagan menos. Esta tarifa no suma el ` +
`IVA ni las tasas, y vale solo para la zona de Edenor y Edesur (CABA y el conurbano). En el resto del país las tarifas las fijan las ` +
`provincias o los municipios.`,
"meses-nota": `Promedio mensual de la demanda total en GWh para ${e.meses_desde}, ${e.meses_desde + 1} y ${e.meses_hasta}. El último mes disponible en la fuente es ${e.ultimo_mes}.`,
"electricidad-provincias-nota": `Demanda residencial que los distribuidores declaran cada mes a CAMMESA, por provincia, ` +
`dividida por la población de cada año (proyecciones del INDEC desde 2022 y, antes, la población que se deduce de las tasas del Sistema Nacional de Información Criminal, SNIC). La parte de los hogares se calcula sobre las tres categorías de tarifa ` +
`que publica CAMMESA: residencial, comercial e industrial o comercial grande. CAMMESA no separa CABA de la provincia de Buenos Aires, así que van juntas, y no informa Tierra del Fuego: ` +
`el valor del país es el de las demás jurisdicciones. La serie empieza en ${e.el_ini} porque antes CAMMESA contaba el alumbrado público como residencial. ` +
`Los últimos meses son provisorios (el último publicado es ${e.el_hasta}). Si elegís CABA o la provincia de Buenos Aires en Tu provincia, el gráfico resalta la fila que las junta.`,
"electricidad-sectores-nota": `Demanda que los distribuidores y los grandes usuarios declaran ` +
`cada mes a CAMMESA, por provincia y categoría de tarifa, dividida por la población del año (proyecciones del INDEC). Comercios y servicios son los usuarios de las ` +
`distribuidoras que no son hogares y demandan menos de 300 kW, con los clubes y el alumbrado público. Industrias y grandes comercios son las demandas de 300 kW o más: ` +
`las que abastecen las distribuidoras y los grandes usuarios que compran su energía en el mercado mayorista, que CAMMESA registra en la provincia donde consumen. ` +
`Por eso, donde hay una gran planta industrial o minera, una sola empresa puede concentrar buena parte de la demanda de la provincia. CAMMESA no separa CABA ` +
`de la provincia de Buenos Aires, así que van juntas, y no informa Tierra del Fuego: el valor del país es el de las demás jurisdicciones. ` +
`Los últimos meses son provisorios (el último publicado es ${e.el_hasta}).`,
});
function mapaCentrales(el, cfg) {
if (!GEO) {
if (!el.querySelector("svg")) esperando(el);
cargarGeo().then(() => mapaCentrales(el, cfg)).catch(() => sinDatos(el, "No se pudo cargar el mapa."));
return;
}
const w = Math.min(560, Math.max(300, el.clientWidth)), h = Math.round(w * 1.55);
el.innerHTML = ""; el.removeAttribute("aria-busy"); el.resaltar = null;
const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${w} ${h}`).attr("role", "img").style("overflow", "hidden")
.attr("aria-label", `Mapa de las ${n0(T.centrales.length)} centrales eléctricas del listado de la Secretaría de Energía, por tecnología y potencia`);
const proy = d3.geoMercator().fitExtent([[6, 6], [w - 6, h - 6]], GEO), camino = d3.geoPath(proy);
svg.append("g").selectAll("path").data(GEO.features).join("path").attr("d", camino).attr("fill", css("--superficie-2")).attr("stroke", css("--borde")).attr("stroke-width", .8);
const radio = d3.scaleSqrt().domain([0, d3.max(T.centrales, c => c.potencia_mw)]).range([2.2, w > 400 ? 15 : 11]);
const vis = T.centrales.map(c => { const [px, py] = proy([c.x, c.y]); return {...c, px, py, r: c.potencia_mw ? radio(c.potencia_mw) : 2.8}; })
.sort((a, b) => b.r - a.r);
const circ = svg.append("g").selectAll("circle").data(vis).join("circle").attr("cx", c => c.px).attr("cy", c => c.py).attr("r", c => c.r)
.attr("fill", c => c.potencia_mw ? COL_CEN[c.tecnologia] : "#fff").attr("fill-opacity", .85)
.attr("stroke", c => c.potencia_mw ? "#fff" : COL_CEN[c.tecnologia]).attr("stroke-width", c => c.potencia_mw ? .6 : 1.4);
if (cfg.anim && !REDUCIR) circ.attr("opacity", 0).transition().delay(escalon).duration(DUR_G).attr("opacity", 1);
const anillo = svg.append("circle").attr("fill", "none").attr("stroke", css("--ink")).attr("stroke-width", 1.5).attr("opacity", 0);
const dl = d3.Delaunay.from(vis, c => c.px, c => c.py);
const tip = c => `<b>${tituloArea(c.nombre)}</b><br>${c.detalle}<br>${c.potencia_mw ? n0(c.potencia_mw) + " megavatios" : "Sin dato de potencia en el listado"}` +
`<br>${[c.departamento, c.provincia].filter(Boolean).join(", ")}<br>${c.sistema}`;
const ver = ev => {
const [sx, sy] = d3.pointer(ev, svg.node()), [ex, ey] = d3.pointer(ev, el), c = vis[dl.find(sx, sy)];
if (c && Math.hypot(c.px - sx, c.py - sy) < Math.max(12, c.r)) { anillo.attr("cx", c.px).attr("cy", c.py).attr("r", c.r + 3).attr("opacity", 1); return mostrarTip(el, tip(c), ex, ey); }
anillo.attr("opacity", 0); ocultarTip();
};
svg.append("rect").attr("width", w).attr("height", h).attr("fill", "transparent").style("touch-action", "pan-y")
.on("pointermove", ver).on("pointerdown", ver).on("pointerleave", () => { anillo.attr("opacity", 0); ocultarTip(); });
const fi = el.closest(".ficha"), bi = fi?.querySelector(".accion.imagen"); if (bi) bi.hidden = !svgUnico(fi);
}
Object.assign(DIB, {
hogares: a => lineas(G("hogares"), {anim:a, data: T.energia_hogares, x:"anio", y0:80, ref:100, yf: v => v, vf: v => n0(v),
series: MED.hogares === "usuarios" ? [{k:"idx_residencial", lab:"Hogares", c:NAR, w:3}, {k:"idx_resto", lab:"Resto", c:FRI}]
: [{k:"idx_demanda", lab:"Electricidad", c:NAR, w:3}, {k:"idx_emae", lab:"Actividad", c:GRIS}]}),
meses: a => columnas(G("meses"), {anim:a, data: T.energia_estacionalidad}),
});
Object.assign(MED, {
"tarifa-luz": "250",
"electricidad-provincias": "prov",
"electricidad-sectores": "ind",
subsidios: "pbi",
"gas-consumo": "prov",
centrales: "mapa",
"gas-hogares-vista": "prov",
});
Object.assign(DIB, {
"gas-hogares": conTablas("gas-hogares", () => MED["gas-hogares-vista"] === "mapa" ? ["vivienda_departamentos"] : [], a => {
const mapa = MED["gas-hogares-vista"] === "mapa";
$("gas-hogares-ley").hidden = mapa;
if (mapa) return mapaDep(G("gas-hogares"), {anim: a, filas: T.vivienda_departamentos, k: "pct_gas_red", nombre: "Hogares que cocinan con gas de red", vf: pct});
const cl = [{k: "pct_gas_red", lab: "Gas de red", c: "#1F5E97"}, {k: "pct_zeppelin", lab: "Gas a granel (zeppelin)", c: "#74ACDF", texto: "#18212B"},
{k: "pct_garrafa", lab: "Garrafa", c: "#F6B40E", texto: "#18212B"}, {k: "pct_electricidad", lab: "Electricidad", c: "#C6DCF1", texto: "#18212B"},
{k: "pct_lena", lab: "Leña o carbón", c: "#85340A"}];
leyenda("gas-hogares-ley", cl);
const filas = [{codigo_indec: "00", territorio: "Todo el país", ...VV}, ...[...T.vivienda_provincias].sort((p, q) => q.pct_gas_red - p.pct_gas_red)];
apiladasH(G("gas-hogares"), {anim: a, claves: cl, data: filas});
}),
"gas-consumo": conTablas("gas-consumo", () => ({mes: ["gas_usuario_mensual"], serie: ["gas_usuario_serie"]})[MED["gas-consumo"]] || [], a => {
const k = MED["gas-consumo"], el = G("gas-consumo"), fp = T.gas_usuario_provincias.find(r => r.codigo_indec === prov);
let txt = LEAD["gas-consumo"](k);
if (k === "prov") {
$t("gas-consumo").textContent = txt;
const antes = "m3_usuario_" + (e.gas_anio - 10);
return barrasH(el, {anim: a, data: T.gas_usuario_provincias, k: "m3_usuario", vf: n0, af: n0, ref: e.gas_pais, refLab: `País ${n0(e.gas_pais)}`,
tip: d => `<b>${d.territorio}</b><br>${n0(d.m3_usuario)} m³ por usuario, ${n1(d.veces_pais)} veces el promedio del país<br>${n0(d.usuarios)} usuarios residenciales` +
(d[antes] != null ? `<br>En ${e.gas_anio - 10}: ${n0(d[antes])} m³ por usuario` : "")});
}
const filas = (tabla, x) => {
const suya = fp ? new Map(tabla.filter(r => r.codigo_indec === prov).map(r => [r[x], r.m3_usuario])) : null;
return tabla.filter(r => r.codigo_indec === "00").map(r => ({[x]: r[x], pais: r.m3_usuario, prov: suya ? suya.get(r[x]) ?? null : null}));
};
const series = [{k: "pais", lab: "Todo el país", c: NAR}, ...(fp ? [{k: "prov", lab: fp.territorio, c: FRI}] : [])];
if (k === "mes") {
if (fp) {
const m = d3.rollup(T.gas_usuario_mensual.filter(r => r.codigo_indec === prov && +r.periodo.slice(0, 4) >= e.gas_est_desde && +r.periodo.slice(0, 4) <= e.gas_est_hasta),
v => d3.mean(v, r => r.m3_usuario), r => +r.periodo.slice(5, 7));
const mx = d3.greatest(m, ([, v]) => v), mn = d3.least(m, ([, v]) => v);
txt += ` En ${fp.territorio}, ${n0(mx[1])} metros cúbicos en ${MESES[mx[0] - 1]} y ${n0(mn[1])} en ${MESES[mn[0] - 1]}.`;
}
$t("gas-consumo").textContent = txt;
return lineas(el, {anim: a, data: filas(T.gas_usuario_mensual, "periodo").map(r => ({...r, t: tPer(r.periodo)})), x: "t", series, y0: 0, vf: n0, yf: n0,
xl: r => mesPer(r.periodo)});
}
if (fp) {
const s = T.gas_usuario_serie.filter(r => r.codigo_indec === prov);
txt += ` En ${fp.territorio}, ${n0(s[0].m3_usuario)} metros cúbicos en ${s[0].anio} y ${n0(fp.m3_usuario)} en ${e.gas_anio}.`;
}
$t("gas-consumo").textContent = txt;
lineas(el, {anim: a, data: filas(T.gas_usuario_serie, "anio"), x: "anio", series, y0: 0, vf: n0, yf: n0});
}),
centrales: conTablas("centrales", () => MED.centrales === "mapa" ? ["centrales"] : [], a => {
const k = MED.centrales;
$t("centrales").textContent = LEAD.centrales(k);
leyenda("centrales-ley", TEC_CEN);
if (k === "mapa") return mapaCentrales(G("centrales"), {anim: a});
columnasApiladas(G("centrales"), {anim: a, claves: TEC_CEN, cadaTick: 3, vf: n0, af: v => v >= 1000 ? n0(v / 1000) + " mil" : n0(v), l: 46,
unidad: "megavatios", data: T.potencia_instalada});
}),
"electricidad-provincias": conTablas("electricidad-provincias", () => ({mes: ["electricidad_mensual"], serie: ["electricidad_serie"]})[MED["electricidad-provincias"]] || [], a => {
const k = MED["electricidad-provincias"], el = G("electricidad-provincias");
const cod = prov === "02" || prov === "06" ? "02-06" : prov, fp = T.electricidad_provincias.find(r => r.codigo_indec === cod);
let txt = LEAD["electricidad-provincias"](k);
if (k === "prov") {
$t("electricidad-provincias").textContent = txt;
barrasH(el, {anim: a, data: T.electricidad_provincias, k: "kwh_hab", vf: n0, af: n0, ref: e.el_pais, refLab: `País ${n0(e.el_pais)}`, marcar: new Set(fp ? [cod] : []),
tip: d => `<b>${d.territorio}</b><br>${n0(d.kwh_hab)} kWh por habitante<br>${n0(d.gwh)} GWh residenciales en ${e.el_ult}<br>Los hogares, ${pct(d.pct_residencial)} de la demanda` +
(d.kwh_hab_antes != null ? `<br>En ${e.el_ult - 10}: ${n0(d.kwh_hab_antes)} kWh por habitante` : "")});
el.resaltar = null;
return;
}
const filas = (tabla, x) => {
const suya = fp ? new Map(tabla.filter(r => r.codigo_indec === cod).map(r => [r[x], r.kwh_hab])) : null;
return tabla.filter(r => r.codigo_indec === "00").map(r => ({[x]: r[x], pais: r.kwh_hab, prov: suya ? suya.get(r[x]) ?? null : null}));
};
const series = [{k: "pais", lab: "Todo el país", c: NAR}, ...(fp ? [{k: "prov", lab: fp.territorio, c: FRI}] : [])];
if (k === "mes") {
if (fp) {
const m = d3.rollup(T.electricidad_mensual.filter(r => r.codigo_indec === cod && +r.periodo.slice(0, 4) >= e.el_est_desde && +r.periodo.slice(0, 4) <= e.el_ult),
v => d3.mean(v, r => r.kwh_hab), r => +r.periodo.slice(5, 7));
const mx = d3.greatest(m, ([, v]) => v), mn = d3.least(m, ([, v]) => v);
txt += ` En ${fp.territorio}, el de más consumo fue ${MESES[mx[0] - 1]}, con ${n0(mx[1])} kWh por habitante, y el de menos, ${MESES[mn[0] - 1]}, con ${n0(mn[1])}.`;
}
$t("electricidad-provincias").textContent = txt;
return lineas(el, {anim: a, data: filas(T.electricidad_mensual, "periodo").map(r => ({...r, t: tPer(r.periodo)})), x: "t", series, y0: 0, vf: n0, yf: n0,
xl: r => mesPer(r.periodo), mensual: true});
}
if (fp) {
const s = T.electricidad_serie.filter(r => r.codigo_indec === cod);
txt += ` En ${fp.territorio}, ${n0(s[0].kwh_hab)} kWh por habitante en ${s[0].anio} y ${n0(fp.kwh_hab)} en ${e.el_ult}.`;
}
$t("electricidad-provincias").textContent = txt;
lineas(el, {anim: a, data: filas(T.electricidad_serie, "anio"), x: "anio", series, y0: 0, vf: n0, yf: n0});
}),
"electricidad-sectores": a => {
const k = MED["electricidad-sectores"], el = G("electricidad-sectores");
const cod = prov === "02" || prov === "06" ? "02-06" : prov, fp = prov ? T.electricidad_sectores.find(r => r.codigo_indec === cod) : null;
const cl = [{k: "pct_res", lab: "Hogares", c: "#74ACDF", texto: "#18212B"}, {k: "pct_com", lab: "Comercios y servicios", c: "#F6B40E", texto: "#18212B"},
{k: "pct_ind", lab: "Industrias y grandes comercios", c: "#1F5E97"}];
let txt = LEAD["electricidad-sectores"](k);
$("electricidad-sectores-ley").hidden = k !== "partes";
if (k === "partes") {
leyenda("electricidad-sectores-ley", cl);
if (fp) txt += ` En ${fp.territorio}, los hogares son el ${pct(fp.pct_res)} de la demanda, los comercios y servicios el ${pct(fp.pct_com)} y las industrias y los grandes comercios el ${pct(fp.pct_ind)}.`;
$t("electricidad-sectores").textContent = txt;
const pais = T.electricidad_sectores.find(r => r.codigo_indec === "00"), suya = r => r.codigo_indec === "02-06" && cod === "02-06" ? {...r, codigo_indec: prov} : r;
apiladasH(el, {anim: a, claves: cl, data: [{...pais, territorio: "Todo el país"}, ...T.electricidad_sectores.filter(r => r.codigo_indec !== "00").sort((p, q) => q.pct_ind - p.pct_ind).map(suya)]});
el.resaltar = null;
return;
}
const col = k === "com" ? "kwh_hab_com" : "kwh_hab_ind", ref = k === "com" ? e.els_com : e.els_ind;
if (fp) txt += ` En ${fp.territorio}, ${n0(fp[col])} kWh por habitante${conVeces(fp[col], ref)}.`;
$t("electricidad-sectores").textContent = txt;
barrasH(el, {anim: a, data: T.electricidad_sectores.filter(r => r.codigo_indec !== "00"), k: col, vf: n0, af: n0, ref, refLab: `País ${n0(ref)}`, marcar: new Set(fp ? [cod] : []),
tip: d => `<b>${d.territorio}</b><br>${n0(d[col])} kWh por habitante en ${e.el_ult}<br>De su demanda: hogares ${pct(d.pct_res)}, comercios y servicios ${pct(d.pct_com)}, ` +
`industrias y grandes comercios ${pct(d.pct_ind)}`});
el.resaltar = null;
},
subsidios: a => {
const pbi = MED.subsidios === "pbi";
$t("subsidios").textContent = LEAD.subsidios(MED.subsidios);
columnasApiladas(G("subsidios"), {anim: a, cadaTick: 2, l: 44, data: pbi ? T.subsidios_energia.filter(r => r.pct_pbi != null) : T.subsidios_energia,
vf: pbi ? v => n2(v) + "%" : n0, af: pbi ? v => n1(v) + "%" : n0, unidad: pbi ? "del PBI" : `miles de millones de pesos de ${e.sub_ult}`,
claves: [{k: pbi ? "pct_pbi" : "miles_millones_reales", lab: "Subsidios a la energía", c: NAR}]});
},
});
DIB["tarifa-luz"] = conTablas("tarifa-luz", ["tarifa_luz"], a => {
const c = MED["tarifa-luz"], k = "pct_salario_minimo_" + c;
$t("tarifa-luz").textContent = LEAD["tarifa-luz"](c);
lineas(G("tarifa-luz"), {anim: a, mensual: true, y0: 0, vf: pct, yf: v => n0(v) + "%", x: "t", xl: r => mesPer(r.periodo),
data: T.tarifa_luz.filter(r => r[k] != null).map(r => ({...r, t: tPer(r.periodo)})),
series: [{k, lab: `${c} kWh por mes, sin subsidio`, corto: `${c} kWh`, c: NAR, w: 3}]});
});
};
