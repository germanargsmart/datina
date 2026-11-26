window.DATINA_PARTES = window.DATINA_PARTES || {};
window.DATINA_PARTES["curiosidades"] = () => {
textosParte({
"precio-consumo-nota": `Precio: el precio promedio del Gran Buenos Aires de la planilla que el INDEC publica con el IPC, dividido por el IPC de esa región, promedio de cada año completo. ` +
`Carne vacuna: promedio simple de asado, carne picada común, paleta, cuadril y nalga. Yerba: paquete de 500 gramos. Vino: vino común, por litro. El INDEC aclara que estos precios sirven para seguir la evolución en el tiempo. ` +
`Consumo: en la carne, los kilos por habitante de todo el país. En la yerba y el vino, el total del país, sin dividir por habitante: lo que despachan los molinos y lo que se vende en el mercado interno. ` +
`Cada serie con ${PCO.carne.ini}, el primer año completo de la planilla frente al IPC, = 100. Con tan pocos años no se calcula una correlación. Que dos cosas vayan en direcciones opuestas no prueba que una cause la otra.`,
"nombres-nota": `Cantidad de veces que cada nombre fue inscripto como nombre de pila en el Registro Nacional de las Personas (RENAPER). El RENAPER publica los nombres sin tildes: Datina se las agrega con una tabla de equivalencias, y la tabla descargable trae las dos formas. Al elegir una provincia, el gráfico muestra sus diez nombres más frecuentes.`,
"carne-nota": `Consumo aparente por habitante estimado a partir de la producción y el comercio exterior. Cada mes se expresa como tasa anual y el valor de cada año es el promedio de sus meses. Solo se muestran años completos.`,
"vino-nota": `Despachos de vino al mercado interno informados por el Instituto Nacional de Vitivinicultura. La provincia es la de origen del vino, no la del lugar donde se consume.`,
"yerba-nota": `Salida de molino informada por el Instituto Nacional de la Yerba Mate: yerba elaborada que despachan los molinos. Solo se muestran años completos.`,
});
Object.assign(MED, {
nombres: "F",
"precio-consumo": "carne",
});
Object.assign(DIB, {
nombres: a => {
const cod = NOMBRES[prov] ? prov : "00";
document.getElementById("contexto-nombres").textContent = `${NOMBRES[prov] || "Total del país"}, ${cu.nom_anio}. Diez nombres más frecuentes.`;
barrasH(G("nombres"), {anim:a, data: T.nombres_top.filter(d => d.codigo_indec === cod && d.sexo === MED.nombres)
.map(d => ({codigo_indec: d.nombre, territorio: d.mostrar || d.nombre, cantidad: d.cantidad})), k:"cantidad", vf: n0, af: n0, cambiaConProv: true});
},
carne: a => lineas(G("carne"), {anim:a, data: T.carne_vacuna, x:"anio", y0:0, vf: v => n1(v) + " kg", yf: v => v + " kg",
series:[{k:"kg_por_habitante", lab:"Carne vacuna", c:NAR, w:3}]}),
vino: a => lineas(G("vino"), {anim:a, data: T.vino_mercado_interno, x:"anio", y0:0, vf: v => n0(v) + " M l", yf: v => n0(v) + " M",
series:[{k:"millones_litros", lab:"Vino", c:NAR, w:3}]}),
yerba: a => lineas(G("yerba"), {anim:a, data: T.yerba_molino, x:"anio", y0:0, vf: v => n1(v) + " M kg", yf: v => n0(v) + " M",
series:[{k:"millones_kg", lab:"Yerba", c:NAR, w:3}]}),
"precio-consumo": a => {
const v = MED["precio-consumo"] || "carne";
$t("precio-consumo").textContent = LEAD["precio-consumo"](v);
lineas(G("precio-consumo"), {anim: a, data: T.precio_consumo.filter(r => r.producto === v), x: "anio", y0: 40, ref: 100, refLab: `${PCO[v].ini} = 100`, yf: x => x, vf: n0,
xl: d => `${d.anio}<br><span class="suave">Consumo: ${n1(d.consumo_valor)} ${d.consumo_unidad}</span>`,
series: [{k: "precio_real", lab: "Precio", c: NAR, w: 3}, {k: "consumo", lab: "Consumo", c: FRI, ct: css("--sol-texto"), w: 3}]});
},
});
};
