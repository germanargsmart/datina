window.DATINA_PARTES = window.DATINA_PARTES || {};
window.DATINA_PARTES["empresas"] = () => {
textosParte({
"empresas-nota": `Empresas privadas que declaran personal en relación de dependencia ante la seguridad social (el SIPA), cada una identificada por su CUIT. No incluye a quienes trabajan solos como monotributistas o autónomos sin empleados, ni el trabajo en casas particulares. Una empresa con personal en varias provincias se cuenta en cada una: por eso la suma de las provincias es mayor que el total del país, que cuenta a cada empresa una sola vez, en la provincia donde tiene más empleo. La población es la proyección del INDEC para ${R.anio_pob_ficha.empresas_provincias}, el año de la cantidad de empresas.`,
"dinamica-nota": `Se cuentan las empresas locales: cada empresa es local en la provincia donde declara la mayor parte de su personal, así que las provincias suman el total del país. Una empresa abre cuando declara personal por primera vez. Se considera que cerró cuando pasan cuatro trimestres seguidos, un año, sin que declare personal ocupado, y el cierre se fecha en el primero de esos trimestres: por eso la serie termina un año antes que la del empleo. El OEDE no marca ese último año como provisorio. ` +
`Las tasas dividen aperturas y cierres por todas las empresas activas en el año, incluidas las que abrieron y las que cerraron. La vista por provincia muestra el cambio neto de ${EM.ult}. El OEDE separa la provincia de Buenos Aires en partidos del Gran Buenos Aires y resto, que acá se suman.`,
"empresas-tamano-nota": `Empresas privadas con al menos una persona en relación de dependencia ` +
`declarada en el SIPA, según el Observatorio de Empleo y Dinámica Empresarial. No cuenta a quienes trabajan por su cuenta sin empleados. Una empresa con ` +
`personal en varias provincias cuenta en cada una, y el país suma las provincias: por eso da más que la cantidad de empresas de la ficha anterior. El ` +
`tamaño es el de toda la empresa, según su personal promedio de los últimos cuatro trimestres, con topes distintos en cada rama: en el comercio minorista, ` +
`una microempresa tiene hasta 5 personas, una pequeña hasta 26 y una mediana hasta 100. El OEDE clasifica por tamaño solo a la industria, el comercio y ` +
`los servicios, el ${pct(EM.tam_cubre)} de las empresas del país: el agro, la minería, la construcción y la electricidad, gas y agua no entran en esa vista.`,
"sociedades-nota": `Sociedades comerciales de la Ley General de Sociedades (anónimas, de responsabilidad ` +
`limitada, de la Sección IV y las demás de esa ley) y sociedades por acciones simplificadas, por el año de su contrato social y la provincia de ` +
`su domicilio fiscal, según el Registro Nacional de Sociedades del Ministerio de Justicia (registro de ${SOC.registro}). Cada sociedad se cuenta ` +
`una vez, aunque tenga varias actividades. No incluye asociaciones civiles, fundaciones, cooperativas, mutuales ni sucursales de empresas ` +
`extranjeras. El domicilio fiscal puede no ser donde la sociedad trabaja. Las que se dieron de baja pueden no estar en el registro. Cada ` +
`100.000 habitantes, con la población del INDEC de ${SOC.anio}.`,
});
Object.assign(MED, {
dinamica: "pais",
});
Object.assign(DIB, {
empresas: a => barrasH(G("empresas"), {anim:a, data: T.empresas_provincias, k:"cada_1000_hab", ref: EM.pais_1000,
tip: d => `<b>${d.territorio}</b><br>${n1(d.cada_1000_hab)} cada 1.000 habitantes<br>${n0(d.empresas)} empresas con empleados`, refLab: `País ${n1(EM.pais_1000)}`}),
dinamica: a => ($("clave-dinamica").hidden = MED.dinamica === "pais") ? lineas(G("dinamica"), {anim:a, data: T.empresas_serie_pais, x:"anio", y0:0, vf: v => n1(v) + "%", yf: v => v + "%",
series: [{k:"tasa_entrada", c: css("--celeste-fuerte"), lab:"Aperturas"}, {k:"tasa_salida", c: css("--sol-fuerte"), lab:"Cierres"}]})
: barrasH(G("dinamica"), {anim:a, data: T.empresas_provincias, k:`tasa_neta_${EM.ult}`, vf: v => (v > 0 ? "+" : "") + n1(v) + "%", af: v => v + "%",
ref: EM.neta, refLab: `País ${n1(EM.neta)}%`, mejor: "sube"}),
});
Object.assign(MED, {
sociedades: "prov",
"empresas-tamano": "tam",
});
Object.assign(DIB, {
"empresas-tamano": conTablas("empresas-tamano", ["empresas_tamano_sector"], a => {
const v = MED["empresas-tamano"], el = G("empresas-tamano"), fp = T.empresas_tamano_sector.find(r => r.codigo_indec === prov);
const cl = v === "sec"
? [{k: "pct_servicios", lab: "Servicios", c: "#2C74B5"}, {k: "pct_comercio", lab: "Comercio", c: "#74ACDF", texto: "#18212B"},
{k: "pct_industria_mineria_energia", lab: "Industria, minería y energía", c: "#1F5E97"},
{k: "pct_construccion", lab: "Construcción", c: "#C3CAD2", texto: "#18212B"}, {k: "pct_agro", lab: "Agro y pesca", c: "#F6B40E", texto: "#18212B"}]
: [{k: "pct_micro", lab: "Micro", c: "#C6DCF1", texto: "#18212B"}, {k: "pct_pequenas", lab: "Pequeñas", c: "#74ACDF", texto: "#18212B"},
{k: "pct_medianas", lab: "Medianas", c: "#2C74B5"}, {k: "pct_grandes", lab: "Grandes", c: "#1F5E97"}];
leyenda("empresas-tamano-ley", cl);
let txt = LEAD["empresas-tamano"](v);
if (fp) txt += v === "sec" ? ` En ${fp.territorio}, el ${pct(fp.pct_servicios)} eran de servicios y el ${pct(fp.pct_agro)} del agro y la pesca.`
: ` En ${fp.territorio}, el ${pct(fp.pct_micro)} eran microempresas y el ${pct(fp.pct_grandes)}, grandes.`;
$t("empresas-tamano").textContent = txt;
const pais = T.empresas_tamano_sector.find(r => r.codigo_indec === "00");
apiladasH(el, {anim: a, claves: cl, valF: n1, data: [pais, ...T.empresas_tamano_sector.filter(r => r.codigo_indec !== "00").sort((p, q) => q[cl[0].k] - p[cl[0].k])]});
}),
sociedades: a => {
const v = MED.sociedades, el = G("sociedades"), fp = T.sociedades_provincias.find(r => r.codigo_indec === prov);
let txt = LEAD.sociedades(v);
if (v === "serie") {
$t("sociedades").textContent = txt;
return lineas(el, {anim: a, data: T.sociedades_pais, x: "anio", y0: 0, vf: n0, yf: ejeMil, xl: r => String(r.anio),
series: [{k: "sociedades", lab: "Sociedades comerciales", corto: "Todas", c: NAR}, {k: "sas", lab: "SAS", corto: "SAS", c: FRI}]});
}
if (fp && ![SOC.top[0], SOC.top2[0], SOC.bajo[0]].includes(fp.territorio))
txt += ` En ${fp.territorio}, ${n1(fp.cada_100000)} cada 100.000 habitantes (${n0(fp.sociedades)} sociedades).`;
$t("sociedades").textContent = txt;
barrasH(el, {anim: a, data: T.sociedades_provincias, k: "cada_100000", vf: n1, af: n0, ref: SOC.pais, refLab: `País ${n1(SOC.pais)}`,
tip: d => `<b>${d.territorio}</b><br>${n0(d.sociedades)} sociedades nuevas en ${SOC.anio}<br>${n1(d.cada_100000)} cada 100.000 habitantes<br>` +
`${pct(d.pct_sas)} SAS<br>${n0(d.sociedades_anterior)} en ${SOC.anio - 1}`});
},
});
};
