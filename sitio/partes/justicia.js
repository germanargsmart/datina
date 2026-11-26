window.DATINA_PARTES = window.DATINA_PARTES || {};
window.DATINA_PARTES["justicia"] = () => {
textosParte({
"corte-casos-nota": `Un caso es un expediente que llega a la Corte. La mayoría son recursos contra sentencias de otros tribunales. Un caso resuelto es el que ` +
`tuvo en el año la decisión que lo cierra en la Corte, aunque el asunto siga en otra instancia. Un fallo puede cerrar muchos casos iguales a la vez: en ` +
`${R.justicia.corte.hasta} la Corte firmó ${n0(R.justicia.corte.fallos)} fallos en ${R.justicia.corte.acuerdos} acuerdos de sus jueces` +
(R.justicia.corte.fallos_ant ? `, y en ${R.justicia.corte.hasta - 1}, ${n0(R.justicia.corte.fallos_ant)}` : "") + `. La Oficina de Estadísticas de la Corte ` +
`publica la serie desde ${R.justicia.corte.desde} solo en PDF y en tableros interactivos: las cifras se cargaron a mano, cada una con la página de la que sale, y la cantidad de ` +
`fallos está desde ${R.justicia.corte.fallos_desde}. Las notas anuales del Centro de Información Judicial, anteriores a esta serie, contaban de otra manera y no se mezclan con ella.`,
"jueces-federales-nota": (() => { const F = R.justicia.federal;
return `Un cargo es el lugar de un juez en un juzgado, una cámara o un tribunal oral: una cámara o un tribunal tiene varios. Se cuentan los cargos de ` +
`los órganos que funcionan. Hay ${n0(F.sin_funcionar_cargos)} cargos más en ${n0(F.sin_funcionar_organos)} juzgados, cámaras y tribunales creados por ley que ` +
`todavía no funcionan. No incluye a la Corte Suprema. La Justicia Nacional, que es la justicia ordinaria de CABA (civil, comercial, ` +
`laboral y penal), tiene otros ${n0(F.nacional_cargos)} cargos, ${n0(F.nacional_sin_titular)} sin titular, y no entra en las barras para que las provincias se ` +
`puedan comparar. Padrón del Ministerio de Justicia de ${F.fecha} y población proyectada por el INDEC para ${R.anio_pob_ficha.justicia_federal_provincias}, el año del padrón.`; })(),
"fiscalias-federales-nota": (() => { const M = R.justicia.mp;
return `Una fiscalía o una defensoría puede tener más de un cargo. Se cuentan las que funcionan. Es el último padrón del Ministerio de Justicia que trae a los ` +
`fiscales y los defensores: el de ${R.justicia.federal.fecha} trae solo a los jueces. No incluye a la Procuración General ni a la Defensoría General de la ` +
`Nación. En CABA funcionan además ${n0(M.nacional_fiscalias)} fiscalías y ${n0(M.nacional_defensorias)} defensorías de la Justicia ` +
`Nacional, su justicia ordinaria, que no entran en las barras. La población es la que proyecta el INDEC para ${R.anio_pob_ficha.fiscalias_defensorias_federales}, el año del padrón.`; })(),
"cortes-provinciales-nota": (() => { const P = R.justicia.prov;
return `Cada provincia llama distinto a su máximo tribunal: Corte Suprema, Superior Tribunal o Tribunal Superior de Justicia. Los ministros en funciones ` +
`son los que cargó cada poder judicial en el Mapa de Género de la Oficina de la Mujer de la Corte Suprema, al 31 de octubre de ${P.anio}. Los lugares ` +
`que fija la ley salen de la constitución o la ley orgánica de cada provincia, vigentes hoy, y van solo donde se leyó el número en la norma: en ` +
`${24 - P.cortes_ley} jurisdicciones la constitución da solo un mínimo o un rango y no se encontró el texto de la ley que fija el número.`; })(),
"justicia-provincial-nota": (() => { const P = R.justicia.prov, LAB = {fiscales: "fiscales", defensores: "defensores", magistratura: "jueces", ministros: "ministros"};
const lista = l => l.length > 1 ? l.slice(0, -1).join(", ") + " " + yE(l.at(-1)) : l[0];
const faltan = Object.entries(P.anteriores).filter(([, l]) => l.length).map(([k, l]) => `los ${LAB[k]} de ${lista(l)}`);
const ant = faltan.length ? [`En ${P.anio} no se cargaron ${faltan.length > 1 ? faltan.slice(0, -1).join(", ") + " ni " + faltan.at(-1) : faltan[0]}: va el dato ` +
`de ${P.anio_ant}, como en el Mapa publicado.`] : [];
const bajas = Object.entries(P.bajas).flatMap(([k, l]) => l.map(b => `En ${P.anio}, ${b.territorio} informó ${n0(b.v)} ${LAB[k]}, contra ${n0(b.ant)} en ${P.anio_ant}: es lo que cargó la provincia.`));
return `Son las personas en cada cargo al 31 de octubre de ${P.anio}, no los cargos que fija la ley: un juzgado vacante no se cuenta. Los jueces ` +
`incluyen a los ministros del máximo tribunal, a los camaristas, a los integrantes de tribunales colegiados y a la justicia de paz, que en algunas provincias ` +
`tiene muchos juzgados y en otras pocos. Los fiscales incluyen a los procuradores generales, y los defensores, a los defensores generales. ` +
[...ant, ...bajas].join(" ") + " " +
P.mp_unico.map(m => `${m.territorio} tiene un solo ministerio público y carga juntos a sus fiscales y defensores (${n0(m.v)}): no entra en esas dos vistas.`).join(" ") +
` No incluye a la justicia federal ni a la Justicia Nacional de CABA. Cada jurisdicción carga sus datos en el Mapa de Género de la Justicia Argentina, ` +
`de la Oficina de la Mujer de la Corte Suprema. Cada dato se divide por la población que proyecta el INDEC para su año.`; })(),
});
Object.assign(MED, {
"jueces-federales": "cargos",
"fiscalias-federales": "cantidad",
"justicia-provincial": "magistratura",
});
DIB["corte-casos"] = a => lineas(G("corte-casos"), {anim: a, data: T.corte_casos, x: "anio", y0: 0, vf: n0, yf: v => n0(v / 1000) + " mil",
series: [{k: "ingresados", lab: "Llegaron", c: FRI, w: 3}, {k: "resueltos", lab: "Resueltos", c: NAR, w: 3}],
xl: d => `${d.anio}` + (d.fallos ? `<br><span class="suave">${n0(d.fallos)} fallos en ${d.acuerdos} acuerdos</span>` : "")});
const JUS_CLAVES = {
jueces: [{k: "titular", lab: "Con juez titular", c: "#2C74B5"}, {k: "subrogante", lab: "Sin titular, con subrogante", c: "#74ACDF", texto: "#18212B"},
{k: "sin_cubrir", lab: "Sin titular ni subrogante", c: "#C3CAD2", texto: "#18212B"}],
mp: [{k: "fiscalias", lab: "Fiscalías", c: "#2C74B5"}, {k: "defensorias", lab: "Defensorías", c: "#F6B40E", texto: "#18212B"}]};
const jusLeyenda = (id, claves, ver) => { const l = $(id); l.innerHTML = claves.map(k => `<span><i style="background:${k.c}"></i>${k.lab}</span>`).join("");
l.style.display = ver ? "" : "none"; };
const jusApiladas = (g, filas, claves, f, a, fin = null, tipExtra, sinValores = false) => {
const el = G(g), total = d => d3.sum(claves, k => d[k.k]), mx = d3.max(filas, total);
apiladasH(el, {anim: a, claves, data: [...filas].sort((p, q) => total(q) - total(p)), max: mx * 1.14, ticks: d3.ticks(0, mx, el.clientWidth < 520 ? 2 : 4),
ejeF: f, tipF: f, alFinal: fin || (d => f(total(d))), tipExtra, sinValores});
};
DIB["jueces-federales"] = a => {
const F = R.justicia.federal, filas = T.justicia_federal_provincias, porHab = MED["jueces-federales"] !== "cargos";
jusLeyenda("jf-ley", JUS_CLAVES.jueces, !porHab);
if (!porHab) return jusApiladas("jueces-federales", filas, JUS_CLAVES.jueces, n0, a);
barrasH(G("jueces-federales"), {anim: a, data: filas, k: "cargos_cada_100mil", ref: F.cada_100mil, refLab: `País ${n1(F.cada_100mil)}`, vf: n1, af: n1,
tip: d => `<b>${d.territorio}</b><br>${n1(d.cargos_cada_100mil)} cargos cada 100.000 habitantes<br>${n0(d.cargos)} cargos de juez federal`});
};
DIB["fiscalias-federales"] = a => {
const porHab = MED["fiscalias-federales"] !== "cantidad";
jusLeyenda("mpf-ley", JUS_CLAVES.mp, true);
jusApiladas("fiscalias-federales", T.fiscalias_defensorias_federales,
porHab ? JUS_CLAVES.mp.map(k => ({...k, k: k.k + "_cada_100mil"})) : JUS_CLAVES.mp, porHab ? n1 : n0, a);
};
const CP_CLAVES = [{k: "ministros", lab: "Ministras y ministros", c: "#2C74B5"}, {k: "vacantes_ley", lab: "Lugares vacantes según la ley", c: "#C3CAD2", texto: "#18212B"}];
DIB["cortes-provinciales"] = conTablas("cortes-provinciales", ["justicia_provincias"], a => {
jusLeyenda("cp-ley", CP_CLAVES, true);
const filas = T.justicia_provincias.map(d => ({...d, vacantes_ley: d.miembros_ley != null ? Math.max(0, d.miembros_ley - d.ministros) : null}));
jusApiladas("cortes-provinciales", filas, CP_CLAVES, n0, a, d => d.miembros_ley != null ? `${n0(d.ministros)} de ${n0(d.miembros_ley)}` : n0(d.ministros),
d => `<br>${d.tribunal}` + (d.miembros_ley != null ? `<br>La ley fija ${d.miembros_ley}` : "<br>Sin verificar en la ley cuántos lugares tiene"), true);
});
const JP_NOMBRE = {magistratura: "jueces", fiscales: "fiscales", defensores: "defensores"};
DIB["justicia-provincial"] = conTablas("justicia-provincial", ["justicia_provincias"], a => {
const m = MED["justicia-provincial"], P = R.justicia.prov, k = m + "_cada_100mil";
barrasH(G("justicia-provincial"), {anim: a, data: T.justicia_provincias.filter(d => d[k] != null), k, ref: P.pais[m], refLab: `País ${n1(P.pais[m])}`,
vf: n1, af: n0, tip: d => `<b>${d.territorio}</b><br>${n1(d[k])} ${JP_NOMBRE[m]} cada 100.000 habitantes<br>${n0(d[m])} en total` +
(d[m + "_anio"] !== P.anio ? `<br>Dato de ${d[m + "_anio"]}` : "")});
});
};
