window.DATINA_PARTES = window.DATINA_PARTES || {};
window.DATINA_PARTES["petroleo"] = () => {
Object.assign(LEAD, {
pozos: () => {
const p = T.pozos_provincias.find(r => r.territorio === PG.pozos_top) || {};
return `En ${PG.pozos_mes} produjeron petróleo o gas ${n0(PG.pozos)} pozos. Los ${n0(PG.pozos_shale)} de shale, el ${pct(PG.pct_pozos_shale)} del total, dieron el ${pct(PG.pct_pet_shale_pozos)} del petróleo. ` +
`En promedio, un pozo de shale produjo ${n0(PG.bpd_shale)} barriles de petróleo por día y uno convencional, ${n1(PG.bpd_conv)}. ` +
`${PG.pozos_top} es la provincia con más pozos en producción: ${n0(PG.pozos_top_n)}, ${n0(p.convencional)} de ellos convencionales.`;
},
fracturas: v => v === "rama"
? `La rama horizontal es el tramo del pozo que avanza en horizontal dentro de la formación. Entre ${PG.dv_ini} y ${PG.fr_ult}, la de los pozos de Vaca Muerta ` +
`se hizo ${n1(PG.dv_rama_ult / PG.dv_rama_ini)} veces más larga: de ${n0(PG.dv_rama_ini)} a ${n0(PG.dv_rama_ult)} metros en promedio.`
: v === "etapas_pozo"
? `Cada pozo de Vaca Muerta fracturado en ${PG.fr_ult} llevó en promedio ${n1(PG.dv_etapas_ult)} etapas de fractura y ${n0(PG.dv_arena_ult)} toneladas de arena. ` +
`En ${PG.dv_ini} eran ${n1(PG.dv_etapas_ini)} etapas y ${n0(PG.dv_arena_ini)} toneladas.`
: `Las etapas de fractura de ${PG.fr_ult} fueron ${PG.fr_record ? "el máximo de la serie: " : ""}${PG.fr_var >= 0 ? pct(PG.fr_var) + " más" : pct(-PG.fr_var) + " menos"} ` +
`que en ${PG.fr_ult - 1} y ${PG.fr_veces} veces las de ${PG.fr_ini}. Cada etapa es un tramo de la rama horizontal del pozo que se fractura por separado. En total se bombearon ${n1(PG.fr_arena_mt)} millones de toneladas de arena.`,
"pozos-terminados": v => v === "prov"
? `Entre ${PG.pt_v_desde} y ${PG.pt_mes} se terminaron ${n0(PG.pt_12m)} pozos de petróleo y gas, ` +
`${PG.pt_12m >= PG.pt_12m_ant ? n0(PG.pt_12m - PG.pt_12m_ant) + " más" : n0(PG.pt_12m_ant - PG.pt_12m) + " menos"} que en los doce meses anteriores. ` +
`${PG.pt_top} concentró el ${pct(PG.pt_top_pct)}, con ${n0(PG.pt_top_n)} pozos.`
: `De los pozos de petróleo y gas terminados en ${PG.pt_anio}, ${n0(PG.pt_explot)} fueron de explotación, ${n0(PG.pt_explor)} de exploración o de avanzada y el resto, de servicio.` +
(PG.pt_total < PG.pt_max ? "" : ` En ${PG.pt_anio} se terminaron más pozos que en cualquier otro año de la serie.`),
"mapa-pozos": v => `Desde ${PG.map_ini}, ${n0(PG.map_n)} pozos no convencionales produjeron petróleo o gas. De los que seguían produciendo en ${PG.map_mes}, ` +
`${n0(PG.map_shale)} eran de shale y ${n0(PG.map_tight)} de tight. Las áreas con más pozos en producción son ` +
`${lista(PG.map_top_areas.map(([a, n]) => `${tituloArea(a)} (${n0(n)})`))}.` +
(v === "pais" && PG.map_otras.length ? ` Fuera de la cuenca Neuquina hay pozos no convencionales en producción en ${lista(PG.map_otras.map(([p, n]) => `${p} (${n0(n)})`))}.` : ""),
});
textosParte({
fracturas: LEAD.fracturas("etapas"),
"fracturas-nota": `Fracturas que las empresas informan a la Secretaría de Energía (Adjunto IV), contadas por el año en que empezó cada una, en formaciones no convencionales. ` +
`Las empresas informan con demora, así que las de ${PG.fr_ult} todavía pueden sumar más. La rama horizontal y las etapas por pozo son promedios de los pozos de Vaca Muerta ` +
`según el año de su primera fractura, y la rama cuenta solo los pozos que la informan. La fuente aclara que son datos preliminares, sujetos a revisión.`,
"pozos-terminados": LEAD["pozos-terminados"]("anio"),
"mapa-pozos": LEAD["mapa-pozos"]("cuenca"),
"mapa-pozos-nota": `Cada punto es un pozo no convencional que produjo petróleo o gas alguna vez, según la producción por pozo del Capítulo IV, en la ubicación que informa ` +
`la Secretaría de Energía (en unos pocos pozos la latitud y la longitud vienen cambiadas y se corrigen). El color dice el año en que empezó a producir, y los que no produjeron en ` +
`${PG.map_mes} van más claros. Las áreas son las concesiones de explotación, con una geometría simplificada: al pasar el mouse o tocar un área se ve lo que produjo en ${PG.areas_anio}. ` +
`La vista de la cuenca Neuquina abarca Neuquén, Río Negro, Mendoza y La Pampa. ` +
`Las cantidades de pozos del texto salen del mismo resumen de la Secretaría de Energía que usa la ficha de los pozos en producción, así que las dos dicen lo mismo. ` +
`El listado con la ubicación de cada pozo se baja aparte y puede tener unos pocos pozos más o menos.`,
"productividad-nota": `Pozos de shale de Vaca Muerta que la producción por pozo del Capítulo IV clasifica como petrolíferos, según el año del primer mes con producción. ` +
`El primer año son los doce meses desde ese inicio, y los meses sin declaración cuentan como cero. Van solo los años de inicio en los que todos los pozos ya tienen doce meses de historia ` +
`(los datos llegan a ${MESES[+PG.cos_ult_nc.slice(5, 7) - 1]} de ${PG.cos_ult_nc.slice(0, 4)}). La rama horizontal sale de los datos de fractura: por cada 1.000 metros cuentan los pozos que la informan, desde ${PG.rama_desde}, ` +
`el primer año con al menos 50. Las curvas siguen a cada año de inicio mientras al menos el 80% de sus pozos tiene esos meses de historia.`,
"pozos-terminados-nota": `Pozos terminados por tipo, según la Secretaría de Energía. Por provincia, los doce meses más recientes, entre ${PG.pt_v_desde} y ${PG.pt_mes}.` +
(T.pozos_terminados_provincias.some(r => r.codigo_indec === "mar") ? ` "Mar argentino" son los pozos del mar a más de doce millas de la costa, de jurisdicción nacional.` : ""),
"petroleo-nota": `Producción declarada por las empresas en el Capítulo IV de la Resolución SE 319/1993, que la Secretaría de Energía publica en metros cúbicos. ` +
`Para pasarla a barriles por día se usan los días de cada mes y el mismo factor que la Secretaría aplica en su serie, ${n2(PG.bbl)} barriles por metro cúbico. ` +
`Shale y tight son las dos formas de explotación no convencional que define la Ley 27.007: el shale sale de formaciones de esquisto o pizarra y el tight, de areniscas compactas. ` +
`El último mes puede cambiar cuando lleguen declaraciones atrasadas.`,
"gas-nota": `Millones de metros cúbicos por día: la producción de cada mes, que la Secretaría de Energía publica en miles de metros cúbicos, dividida por sus días. ` +
`El tight gas es el que sale de areniscas compactas y el shale gas, de formaciones de esquisto o pizarra (Ley 27.007). El último mes puede cambiar cuando lleguen declaraciones atrasadas.`,
"hidro-provincias-nota": `Promedio de los doce meses en miles de barriles de petróleo y en millones de metros cúbicos de gas por día. ` +
`"Mar argentino" son los yacimientos del mar a más de doce millas de la costa, que son del Estado nacional (la fuente los llama Estado Nacional). Al pasar el mouse o tocar una barra se ven la parte del país, la parte no convencional y la producción de los mismos meses diez años antes, entre ${PG.v10_desde} y ${PG.v10_hasta}.`,
"areas-hidro-nota": `Promedio de cada año en miles de barriles de petróleo y en millones de metros cúbicos de gas por día, según lo que declaran las empresas para cada área de concesión en el Capítulo IV. ` +
`La empresa de cada área es la que declaró la mayor parte de su producción en ${PG.areas_anio}. No convencional es lo que sale de formaciones de shale y tight, y convencional, el resto. ` +
`"Mar argentino" son las áreas del mar a más de doce millas de la costa, que son del Estado nacional. ` +
(PG.areas_incompletos.length ? `En ${lista(PG.areas_incompletos.map(String))} la fuente tiene algún mes que no llega al 99% del total del país: en esos años, lo que produjo cada área puede quedar algo por debajo. ` : "") +
`Elegí un área en la lista para ver lo que produjo cada año desde ${PG.areas_ini}. Si elegiste una provincia en Tu provincia, sus áreas se resaltan entre las 15 que más producen.`,
pozos: LEAD["pozos"](),
"pozos-nota": `Pozos que declararon producción de petróleo o de gas en el mes. La producción de petróleo por pozo divide el petróleo del mes por los días del mes y por los pozos que produjeron petróleo, así que un pozo que produjo solo algunos días baja el promedio. Un mismo pozo puede producir petróleo y gas. ` +
`Con el factor de la Secretaría, un barril equivale a unos ${n0(1000 / PG.bbl)} litros.`,
"empresas-hidro-nota": `Producción declarada por cada empresa en el Capítulo IV, como operadora de sus áreas: en las áreas compartidas, la producción figura a nombre de la empresa que la declara. ` +
`Los nombres se muestran sin la forma societaria y la tabla los trae como los publica la fuente. Un mismo grupo puede declarar con más de una razón social. Las demás ${PG.n_empresas - PG.emp_n} empresas que declararon producción sumaron el ${pct(PG.emp_resto_pct)} del petróleo.`,
"empleo-hidro-nota": `Asalariados registrados del sector privado en la extracción de petróleo y gas y sus servicios (rama 11 de la clasificación de actividades), según el Sistema Integrado Previsional Argentino (SIPA), en promedio del trimestre. ` +
`El SIPA asigna cada puesto a la provincia donde declara el empleador: por eso CABA, donde tienen sede muchas empresas, aparece con empleo petrolero. ` +
`Las provincias con pocos puestos no se muestran porque el OEDE no publica esos datos por el secreto estadístico. La serie del país suma las provincias con dato. ` +
`Los puestos cada 1.000 habitantes usan la población que proyecta el INDEC para ${R.anio_pob_ficha.empleo_construccion_provincias}, el año del dato.`,
"regalias-nota": `Las regalías son lo que las empresas pagan a la provincia dueña del recurso por lo que extraen. El porcentaje sale de las cuentas de cada provincia (esquema ahorro-inversión-financiamiento del Ministerio de Economía) e incluye todas las regalías, también las mineras y las hidroeléctricas, sobre los ingresos totales.` +
(Object.keys(PG.reg_atrasadas).length ? ` ${lista(Object.entries(PG.reg_atrasadas).map(([p, a]) => `${p} va con ${a}`))}, su último año publicado.` : "") +
` Los dólares por habitante son solo las regalías de petróleo crudo que publica la Secretaría de Energía, divididas por la población que proyecta el INDEC para ${R.anio_pob_ficha.regalias_provincias}, el mismo año. La Secretaría publica las de gas en pesos y no se suman acá. Las del mar argentino, ${n1(PG.reg_usd_mar)} millones de dólares en ${PG.reg_usd_anio}, son del Estado nacional.`,
"reservas-nota": `Reservas comprobadas al 31 de diciembre que las empresas declaran a la Secretaría de Energía según la Resolución SE 324/2006, hasta el final de la vida útil de los yacimientos: lo que se puede extraer con razonable certeza con la técnica y los precios de ese momento. ` +
`Desde 2017 la Secretaría separa las convencionales de las no convencionales. Los años de producción dividen las reservas por la producción de ese año: no son un pronóstico, porque las reservas cambian con la exploración, la tecnología y los precios.`,
"balanza-energetica-nota": `Exportaciones del rubro combustibles y energía e importaciones de combustibles y lubricantes, según el Intercambio Comercial Argentino del INDEC, en millones de dólares de cada año. ` +
`Son dos clasificaciones distintas, una por rubro y otra por uso económico, pero cubren lo mismo en lo principal: petróleo crudo, gas y combustibles.`,
"mundo-petroleo-nota": `Petróleo crudo con condensado y gas natural seco, según las estadísticas internacionales de la Administración de Información Energética de los Estados Unidos (EIA), que estima a todos los países con un mismo criterio. ` +
(PG.mundo.crudo_kbd.anio === PG.anio_ult ? `Para la Argentina estima ${n0(PG.mundo.crudo_kbd.arg)} mil barriles por día en ${PG.anio_ult}, y la serie de la Secretaría de Energía que usa el resto de la página da ${n0(PG.kbd_ult)} mil. ` : "") +
`El dato de Neuquén es de la Secretaría de Energía. El gas llega hasta ${PG.mundo.gas_bcm.anio}, el último año que la EIA publica para casi todos los países. Se muestran los países que producen más que la Argentina y algunos de los que siguen.`,
});
Object.assign(MED, {
"mapa-pozos": "cuenca",
productividad: "pozo",
fracturas: "etapas",
"pozos-terminados": "anio",
petroleo: "tipo",
gas: "tipo",
"hidro-provincias": "pet_kbd",
"areas-hidro": "pet",
pozos: "pozo",
"empresas-hidro": "pct_pet",
"empleo-hidro": "prov",
regalias: "pct_regalias",
reservas: "pet",
"mundo-petroleo": "crudo_kbd",
});
const SERIES_TIPO = p => [{k: `${p}_conv`, lab: "Convencional", c: COL_TIPO.conv}, {k: `${p}_tight`, lab: "Tight", c: COL_TIPO.tight}, {k: `${p}_shale`, lab: "Shale", c: COL_TIPO.shale}];
const SERIES_CUENCA = p => [["cuyana", "Cuyana", "#C3CAD2"], ["noroeste", "Noroeste", "#F6B40E"], ["austral", "Austral", "#A9CBEA"], ["gsj", "Golfo San Jorge", "#74ACDF"],
["neuquina", "Neuquina", "#1F5E97"]].map(([k, lab, c]) => ({k: `${p}_${k}`, lab, c}));
const conT = r => ({...r, t: r.anio + (r.mes - 1) / 12});
const mesP = r => `${MESES[r.mes - 1]} de ${r.anio}`;
const bblF = v => v >= 100 ? n0(v) : n1(v);
const CUENCA_DE = {"Golfo San Jorge": "del Golfo San Jorge", Noroeste: "del Noroeste", Noreste: "del Noreste"};
const cantArea = (v, gas) => gas ? (v >= .1 ? `${n1(v)} millones de metros cúbicos` : n0(v * 1000) === "0" ? "menos de mil metros cúbicos" : `${n0(v * 1000)} mil metros cúbicos`) + " de gas por día"
: (v >= 1 ? `${kbdF(v)} mil barriles` : n0(v * 1000) === "0" ? "menos de un barril" : `${n0(v * 1000)} barriles`) + " de petróleo por día";
function textoArea(r, tot, gas) {
const k = gas ? "gas_mmm3d" : "pet_kbd", nc = gas ? r.pct_gas_nc : r.pct_pet_nc, p = gas ? r.pct_gas_pais : r.pct_pet_pais;
const t = `${tituloArea(r.nombre)} está ${r.territorio === "Mar argentino" ? "en el mar argentino, a más de doce millas de la costa" : "en " + r.territorio}, en la cuenca ${CUENCA_DE[r.cuenca] || r.cuenca}. `;
if (!(r[k] > 0)) return t + `En ${PG.areas_anio} no produjo ${gas ? "gas" : "petróleo"}.`;
const mx = d3.greatest(tot, d => d.v);
return t + `En ${PG.areas_anio} produjo ${cantArea(r[k], gas)}, ${p < .05 ? "menos del 0,1%" : "el " + pct(p)} del país, ` +
(nc >= 99.95 ? "todo de formaciones no convencionales" : nc > 0 ? `el ${pct(nc)} de formaciones no convencionales` : "todo de formaciones convencionales") +
`, y ${r.empresa} declaró la mayor parte. ` +
(mx.anio === PG.areas_anio ? `Es su año de mayor producción desde ${PG.areas_ini}.` : `Su año de mayor producción fue ${mx.anio}, con ${cantArea(mx.v, gas)}.`);
}
Object.assign(DIB, {
petroleo: conTablas("petroleo", ["hidrocarburos_mensual"], a => {
$t("petroleo").textContent = LEAD.petroleo(MED.petroleo);
areasApiladas(G("petroleo"), {anim: a, data: T.hidrocarburos_mensual.map(conT), x: "t", series: MED.petroleo === "cuenca" ? SERIES_CUENCA("pet") : SERIES_TIPO("pet"),
vf: kbdF, yf: n0, xl: mesP, unidad: "mil barriles por día"});
}),
gas: conTablas("gas", ["hidrocarburos_mensual"], a => {
$t("gas").textContent = LEAD.gas(MED.gas);
areasApiladas(G("gas"), {anim: a, data: T.hidrocarburos_mensual.map(conT), x: "t", series: MED.gas === "cuenca" ? SERIES_CUENCA("gas") : SERIES_TIPO("gas"),
vf: n1, yf: n0, xl: mesP, unidad: "millones de m³ por día"});
}),
"hidro-provincias": a => {
const k = MED["hidro-provincias"], gas = k === "gas_mmm3d";
$t("hidro-provincias").textContent = LEAD["hidro-provincias"](k);
barrasH(G("hidro-provincias"), {anim: a, data: T.hidrocarburos_provincias.filter(d => d[k] > .005), k, vf: gas ? n1 : kbdF, af: n0,
tip: d => `<b>${d.territorio}</b><br>` + (gas ? `${n1(d.gas_mmm3d)} millones de m³ por día<br>${pct(d.pct_gas_pais)} del gas del país<br>No convencional: ${pct(d.pct_gas_nc || 0)}<br>Diez años antes: ${n1(d.gas_mmm3d_antes)}`
: `${kbdF(d.pet_kbd)} mil barriles por día<br>${pct(d.pct_pet_pais)} del petróleo del país<br>No convencional: ${pct(d.pct_pet_nc || 0)}<br>Diez años antes: ${kbdF(d.pet_kbd_antes)}`)});
},
"areas-hidro": conTablas("areas-hidro", () => MED.arArea ? ["areas_produccion", "areas_serie"] : ["areas_produccion"], a => {
const gas = MED["areas-hidro"] === "gas", k = gas ? "gas_mmm3d" : "pet_kbd", el = G("areas-hidro"), sel = $("ar-sel");
if (sel.options.length < 2) d3.groups(T.areas_produccion, r => r.territorio).sort((p, q) => p[0].localeCompare(q[0], "es")).forEach(([t, rs]) => {
const g = document.createElement("optgroup"); g.label = t;
rs.map(r => [r.codigo, tituloArea(r.nombre)]).sort((p, q) => p[1].localeCompare(q[1], "es")).forEach(([c, n]) => g.append(new Option(n, c)));
sel.append(g);
});
const r = MED.arArea && T.areas_produccion.find(x => x.codigo === MED.arArea);
$("areas-hidro-ley").hidden = !r;
if (!r) {
$t("areas-hidro").textContent = LEAD["areas-hidro"](MED["areas-hidro"]);
const filas = [...T.areas_produccion].sort((p, q) => q[k] - p[k]).slice(0, 15).map(x => ({...x, provNom: x.territorio, prov: x.codigo_indec, codigo_indec: x.codigo, territorio: tituloArea(x.nombre)}));
barrasH(el, {anim: a, data: filas, k, vf: gas ? n1 : kbdF, af: n0, l: 196, lAngosto: 150, marcar: new Set(filas.filter(x => x.prov === prov).map(x => x.codigo_indec)),
tip: d => `<b>${d.territorio}</b><br>${d.provNom}, cuenca ${CUENCA_DE[d.cuenca] || d.cuenca}<br>${d.empresa}<br>${cantArea(d[k], gas)}<br>${pct(gas ? d.pct_gas_pais : d.pct_pet_pais)} del país<br>` +
`No convencional: ${pct((gas ? d.pct_gas_nc : d.pct_pet_nc) || 0)}<br>En ${PG.areas_anio - 10}: ${d[k + "_antes"] > 0 ? cantArea(d[k + "_antes"], gas) : "sin producción"}`});
el.resaltar = null;
return;
}
const p = gas ? "gas" : "pet", porAnio = new Map(T.areas_serie.filter(x => x.codigo === r.codigo).map(x => [x.anio, x]));
const tot = d3.range(PG.areas_ini, PG.areas_anio + 1).map(y => { const x = porAnio.get(y) || {}; return {anio: y, conv: x[p + "_conv"] || 0, nc: x[p + "_nc"] || 0}; })
.map(d => ({...d, v: d.conv + d.nc}));
$t("areas-hidro").textContent = textoArea(r, tot, gas);
const cl = [{k: "conv", lab: "Convencional", c: COL_TIPO.conv}, {k: "nc", lab: "No convencional", c: COL_TIPO.shale}];
leyenda("areas-hidro-ley", cl);
const mx = d3.max(tot, d => d.v);
if (!mx) return sinDatos(el, `${tituloArea(r.nombre)} no produjo ${gas ? "gas" : "petróleo"} entre ${PG.areas_ini} y ${PG.areas_anio}.`);
const m = (gas ? mx < .1 : mx < 1) ? 1000 : 1, data = tot.map(d => ({anio: d.anio, conv: d.conv * m, nc: d.nc * m})), alto = mx * m;
columnasApiladas(el, {anim: a, claves: cl, cadaTick: 2, l: 44, data, vf: alto >= 10 ? n0 : n1, af: alto >= 10 ? n0 : n1,
unidad: gas ? (m > 1 ? "mil m³ de gas por día" : "millones de m³ de gas por día") : (m > 1 ? "barriles de petróleo por día" : "mil barriles de petróleo por día")});
}),
pozos: a => {
const t = T.pozos_tipo;
$("pozos-ley").hidden = MED.pozos === "pozo";
if (MED.pozos === "pozo") return barrasH(G("pozos"), {anim: a, data: t.map(r => ({...r, codigo_indec: r.tipo, territorio: r.nombre})), k: "bpd_pozo_pet", vf: v => bblF(v) + " barriles", af: n0,
tip: d => `<b>${d.nombre}</b><br>${bblF(d.bpd_pozo_pet)} barriles de petróleo por día por pozo<br>${n0(d.pozos_pet)} pozos que produjeron petróleo<br>${n0(d.pozos)} pozos con petróleo o gas`});
const cl = [{k: "convencional", lab: "Convencionales", c: COL_TIPO.conv, texto: "#18212B"}, {k: "tight", lab: "Tight", c: COL_TIPO.tight, texto: "#18212B"}, {k: "shale", lab: "Shale", c: COL_TIPO.shale}];
leyenda("pozos-ley", cl);
const fila = (id, nombre, col) => ({codigo_indec: id, territorio: nombre, ...Object.fromEntries(t.map(r => [r.tipo, r[col]]))});
apiladasH(G("pozos"), {anim: a, claves: cl, data: [fila("pozos", "Pozos", "pct_pozos"), fila("pet", "Petróleo", "pct_pet"), fila("gas", "Gas", "pct_gas")]});
},
"empresas-hidro": a => {
const k = MED["empresas-hidro"], gas = k === "pct_gas";
$t("empresas-hidro").textContent = LEAD["empresas-hidro"](k);
barrasH(G("empresas-hidro"), {anim: a, data: T.hidrocarburos_empresas.filter(r => r.nombre !== "Otras empresas").map((r, i) => ({...r, codigo_indec: "e" + i, territorio: r.nombre})),
k, vf: pct, af: v => v + "%", l: 196, lAngosto: 158,
tip: d => `<b>${d.nombre}</b><br>${pct(d[k])} del ${gas ? "gas" : "petróleo"} del país<br>` + (gas ? `${n1(d.gas_mmm3d)} millones de m³ por día` : `${kbdF(d.pet_kbd)} mil barriles por día`)});
},
"empleo-hidro": conTablas("empleo-hidro", () => MED["empleo-hidro"] === "serie" ? ["empleo_construccion_serie"] : [], a => {
if (MED["empleo-hidro"] === "serie") return lineas(G("empleo-hidro"), {anim: a, data: T.empleo_construccion_serie.map(r => ({...r, t: r.anio + (r.trimestre - 1) / 4})), x: "t",
series: [{k: "petroleo_gas", lab: "País", c: NAR}], y0: 0, vf: n0, yf: v => n0(v / 1000) + " mil", xl: r => `${TRIM_N[r.trimestre - 1]} trimestre de ${r.anio}`});
barrasH(G("empleo-hidro"), {anim: a, data: T.empleo_construccion_provincias.filter(d => d.petroleo_gas > 0), k: "petroleo_gas", vf: n0, af: n0,
tip: d => `<b>${d.territorio}</b><br>${n0(d.petroleo_gas)} puestos asalariados registrados<br>${n1(d.petroleo_gas_cada_1000)} cada 1.000 habitantes`});
}),
regalias: a => {
const k = MED.regalias, usd = k === "usd_crudo_hab";
$t("regalias").textContent = LEAD.regalias(k);
barrasH(G("regalias"), {anim: a, data: usd ? T.regalias_provincias.filter(d => d.usd_crudo_hab > 0)
: T.regalias_provincias.map(d => PG.reg_atrasadas[d.territorio] ? {...d, territorio: `${d.territorio} (${PG.reg_atrasadas[d.territorio]})`} : d), k,
vf: usd ? n0 : v => n1(v) + "%", af: usd ? n0 : v => v + "%",
tip: d => `<b>${d.territorio}</b><br>Regalías: ${pct(d.pct_regalias)} de los ingresos totales en ${d.anio_aif}` +
(d.usd_crudo_hab > 0 ? `<br>Petróleo crudo: ${n1(d.usd_crudo_millones)} millones de dólares en ${PG.reg_usd_anio}, ${n0(d.usd_crudo_hab)} por habitante` : "")});
},
reservas: a => {
const k = MED.reservas, d = T.reservas_hidrocarburos;
$t("reservas").textContent = LEAD.reservas(k);
$("reservas-ley").hidden = k === "horizonte";
if (k === "horizonte") return lineas(G("reservas"), {anim: a, data: d, x: "anio", series: [{k: "horizonte_pet", lab: "Petróleo", c: NAR}, {k: "horizonte_gas", lab: "Gas", c: FRI}],
y0: 0, vf: v => n1(v) + " años", yf: n0});
const gas = k === "gas", tot = gas ? "gas_miles_millones_m3" : "pet_millones_m3", pc = gas ? "pct_gas_nc" : "pct_pet_nc";
const cl = [{k: "sd", lab: "Sin separar (hasta 2016)", c: "#C3CAD2"}, {k: "conv", lab: "Convencionales", c: COL_TIPO.conv}, {k: "nc", lab: "No convencionales", c: COL_TIPO.shale}];
leyenda("reservas-ley", cl);
columnasApiladas(G("reservas"), {anim: a, claves: cl, cadaTick: 2, vf: n0, af: n0, unidad: gas ? "miles de millones de m³" : "millones de m³",
data: d.map(r => r[pc] == null ? {anio: r.anio, sd: r[tot]} : {anio: r.anio, conv: r[tot] * (1 - r[pc] / 100), nc: r[tot] * r[pc] / 100})});
},
fracturas: a => {
const k = MED.fracturas;
$t("fracturas").textContent = LEAD.fracturas(k);
$("fracturas-ley").hidden = k !== "etapas";
if (k === "etapas") {
const cl = [{k: "etapas_vm", lab: "Vaca Muerta", c: COL_TIPO.shale}, {k: "etapas_otras", lab: "Otras formaciones", c: COL_TIPO.tight}];
leyenda("fracturas-ley", cl);
return columnasApiladas(G("fracturas"), {anim: a, claves: cl, cadaTick: 2, vf: n0, af: v => v >= 1000 ? n0(v / 1000) + " mil" : n0(v), l: 46,
unidad: "etapas", data: T.fracturas_anual});
}
const rama = k === "rama";
columnasApiladas(G("fracturas"), {anim: a, cadaTick: 2, l: 46, data: T.diseno_pozos_vm.filter(r => r.anio >= PG.dv_ini),
vf: rama ? n0 : n1, af: n0, unidad: rama ? "metros por pozo" : "etapas por pozo",
claves: [{k: rama ? "rama_m" : "etapas_pozo", lab: rama ? "Rama horizontal" : "Etapas de fractura", c: COL_TIPO.shale}]});
},
"pozos-terminados": a => {
const k = MED["pozos-terminados"];
$t("pozos-terminados").textContent = LEAD["pozos-terminados"](k);
$("pozos-terminados-ley").hidden = k !== "anio";
if (k === "prov") return barrasH(G("pozos-terminados"), {anim: a, data: T.pozos_terminados_provincias, k: "total", vf: n0, af: n0,
tip: d => `<b>${d.territorio}</b><br>${n0(d.total)} pozos terminados<br>Explotación: ${n0(d.explotacion)}<br>Exploración y avanzada: ${n0(d.exploracion + d.avanzada)}` +
`<br>Servicio: ${n0(d.servicio)}<br>Doce meses antes: ${n0(d.total_antes)}`});
const cl = [{k: "explotacion", lab: "Explotación", c: COL_TIPO.shale}, {k: "exploracion", lab: "Exploración", c: COL_TIPO.tight},
{k: "avanzada", lab: "Avanzada", c: "#74ACDF"}, {k: "servicio", lab: "Servicio", c: "#C3CAD2"}];
leyenda("pozos-terminados-ley", cl);
columnasApiladas(G("pozos-terminados"), {anim: a, claves: cl, cadaTick: 2, vf: n0, af: n0, l: 40, unidad: "pozos", data: T.pozos_terminados});
},
productividad: a => {
const k = MED.productividad;
$t("productividad").textContent = LEAD.productividad(k);
if (k === "curvas") {
const tonos = ["#BBD6EF", "#7FB0DD", "#3F86C6", "#2C74B5", "#1F5E97", "#0F3D66"].slice(-PG.curvas.length);
return lineas(G("productividad"), {anim: a, data: T.curvas_vm, x: "mes", y0: 0, vf: v => n0(v) + " mil", yf: n0, xl: r => `Mes ${r.mes}`,
series: PG.curvas.map((c, i) => ({k: `c${c}`, lab: String(c), c: tonos[i], w: c === PG.cos_ult ? 3 : 2}))});
}
const metro = k === "metro";
columnasApiladas(G("productividad"), {anim: a, cadaTick: 2, l: metro ? 50 : 40, vf: n0, af: metro ? v => n0(v / 1000) + " mil" : n0,
unidad: metro ? "barriles cada 1.000 m de rama" : "mil barriles por pozo",
data: metro ? T.productividad_vm.filter(r => r.bbl_por_1000m != null) : T.productividad_vm,
claves: [{k: metro ? "bbl_por_1000m" : "pet_12m_kbbl", lab: "Primer año", c: COL_TIPO.shale}]});
},
"mapa-pozos": conTablas("mapa-pozos", ["pozos_no_convencionales", "areas_produccion"], a => {
const k = MED["mapa-pozos"], c = PG.map_cortes;
$t("mapa-pozos").textContent = LEAD["mapa-pozos"](k);
leyenda("mapa-pozos-ley", [`Hasta ${c[0]}`, `${c[0] + 1} a ${c[1]}`, `${c[1] + 1} a ${c[2]}`, `${c[2] + 1} a ${c[3]}`, `Desde ${c[3] + 1}`].map((lab, i) => ({lab, c: COL_POZOS[i]})));
mapaPozos(G("mapa-pozos"), {anim: a, vista: k});
}),
"balanza-energetica": a => lineas(G("balanza-energetica"), {anim: a, data: T.balanza_energetica, x: "anio", ref: 0,
series: [{k: "exportaciones", lab: "Exportaciones", c: NAR}, {k: "importaciones", lab: "Importaciones", c: FRI}, {k: "saldo", lab: "Saldo", c: css("--ink"), w: 1.8, dash: "4 3"}],
y0: Math.min(0, d3.min(T.balanza_energetica, r => r.saldo)), vf: n0, yf: n0}),
"mundo-petroleo": a => {
const k = MED["mundo-petroleo"], gas = k === "gas_bcm", q = PG.mundo.neuquen;
$t("mundo-petroleo").textContent = LEAD["mundo-petroleo"](k);
const filas = T.mundo_hidrocarburos.filter(r => r.variable === k).map(r => ({codigo_indec: r.iso3, territorio: r.pais, v: r.valor, puesto: r.puesto}));
if (!gas && q) filas.push({codigo_indec: "NQN", territorio: "Neuquén (provincia)", v: q.kbd});
barrasH(G("mundo-petroleo"), {anim: a, data: filas, k: "v", vf: gas ? n1 : n0, af: n0, l: 168, lAngosto: 142, marcar: new Set(["ARG", "NQN"]),
color: d => d.codigo_indec === "ARG" ? css("--celeste-fuerte") : d.codigo_indec === "NQN" ? css("--sol") : css("--celeste"),
tip: d => `<b>${d.territorio}</b><br>${gas ? n1(d.v) + " mil millones de m³" : n0(d.v) + " mil barriles por día"}<br>` +
(d.puesto ? `Puesto ${d.puesto} en el mundo` : `Provincia de la Argentina: estaría en el puesto ${q.puesto}`)});
},
});
};
