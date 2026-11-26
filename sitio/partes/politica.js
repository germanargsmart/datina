window.DATINA_PARTES = window.DATINA_PARTES || {};
window.DATINA_PARTES["politica"] = () => {
textosParte({
"confianza-gobierno-nota": R.confianza_gobierno ? `El índice resume cinco preguntas de una encuesta mensual de opinión pública de alcance nacional que hace la Universidad ` +
`Torcuato Di Tella sobre el gobierno nacional: la evaluación general del gobierno, si gobierna pensando en el bien general o en intereses de sectores, si administra ` +
`bien el gasto público, la honestidad de sus miembros y su capacidad para resolver los problemas del país. Va de 0, ninguna confianza, a 5, mucha confianza. Mide la ` +
`opinión sobre el gobierno de cada momento y, como toda encuesta, tiene margen de error: los cambios chicos de un mes al otro pueden no ser significativos. En el ` +
`promedio de cada gobierno no se cuenta el mes en que asumió uno nuevo, porque según la fecha de la encuesta puede medir al que se va o al que llega. Eduardo Duhalde ` +
`asumió el 2 de enero de 2002 y ese mes va con él. Fernando de la Rúa, con un solo mes en la serie, y los presidentes interinos de diciembre de 2001 no tienen promedio.` +
(R.confianza_gobierno.elecciones ? ` En la vista de elecciones, arriba va el índice mes a mes y abajo, el voto en cada elección presidencial: las primeras vueltas desde ` +
`${R.confianza_gobierno.elecciones.desde} (punto lleno) y las PASO desde que empezaron, en 2011 (punto hueco). El voto es el de la candidatura del gobierno nacional sobre los votos positivos, con los resultados de la Dirección ` +
`Nacional Electoral (provisorios en 2023): en las PASO, el de todas las listas de su agrupación, y en 2003, el de Néstor Kirchner, que era el candidato del presidente ` +
`Duhalde. El índice que se compara es el del mes anterior a cada elección (el punto sobre la línea de arriba), el último medido entero antes de votar. Son pocas elecciones, y la PASO y la primera vuelta de un mismo ` +
`año están muy relacionadas entre sí, así que la correlación exagera lo que se puede afirmar. La que da el texto de esa vista, ${n2(R.confianza_gobierno.elecciones.r)}, es la de Pearson, que usa los valores. La de Spearman, que usa el orden y no los valores, es ` +
`${n2(R.confianza_gobierno.elecciones.rs)}. Que el índice y el voto vayan juntos no quiere decir que uno cause el otro: el voto depende también de quiénes son los ` +
`candidatos, de la oposición y de la situación económica. Las elecciones legislativas no están: el sitio tiene los resultados de las presidenciales.` : "") : "",
"mujeres-congreso-nota": `Bancas ocupadas hoy y el 1 de marzo de cada período, como en la ficha de las bancas de cada espacio político. Los ` +
`registros de las cámaras no dicen el sexo de cada legislador: Datina lo toma de su nombre de pila, con una tabla revisada a mano, y los ` +
`nombres que pueden ser de mujer o de varón se revisaron uno por uno. ${MJC.sin_det_serie ? `En ${MJC.sin_det_serie} casos de toda la serie no se ` +
`pudo determinar y quedan fuera del porcentaje. ` : ""}No dice cuántas mujeres encabezan listas, presiden bloques o comisiones, ` +
`ni cuántas votantes hay en cada padrón.`,
});
const ESP_VARIANTE = {"Peronismo": ["#2C74B5", "#6FA3D8", "#A9CBEA"], "Otras fuerzas": ["#56606C", "#98A2AE", "#C3CAD2"]};
const EL = Object.fromEntries(R.elecciones.map(e => [e.id, e]));
const nombreEl = e => `${e.anio}${e.vuelta === 0 ? ", PASO" : e.vuelta === 2 ? ", segunda vuelta" : e.anio === 2015 || e.anio === 2023 ? ", primera vuelta" : e.anio >= 2011 ? ", generales" : ""}`;
const nomListas = c => listaY(c.listas.map(l => `${l.n} (${pct(l.pct)})`));
MED.elecciones = R.elecciones[R.elecciones.length - 1].id;
$("el-sel").innerHTML = [...R.elecciones].reverse().map(e => `<option value="${e.id}">${nombreEl(e)}</option>`).join("");
function clavesEl(e) {
const usados = {};
const cl = e.candidatos.map(c => {
const i = usados[c.espacio] = (usados[c.espacio] ?? -1) + 1;
const col = (ESP_VARIANTE[c.espacio] || [ESP_COLOR[c.espacio]])[Math.min(i, 2)] || ESP_COLOR[c.espacio];
const paso = e.vuelta === 0;
return {k: c.c, lab: paso ? c.fuerza : c.c, fuerza: paso ? listaY(c.listas.map(l => l.n)) : c.fuerza, c: col, texto: ["#F6B40E", "#F08A24", "#A9CBEA", "#C3CAD2", "#74ACDF", "#6FA3D8"].includes(col) ? "#18212B" : "#fff"};
});
const hayOtras = T.elecciones_presidenciales.some(d => d.eleccion === e.id && d.candidato === "Otras" && d.pct > 0);
return hayOtras ? [...cl, {k: "Otras", lab: "Otras", c: "#E4E9EF", texto: "#18212B"}] : cl;
}
DIB.elecciones = conTablas("elecciones", ["elecciones_presidenciales"], a => {
const e = EL[MED.elecciones], cl = clavesEl(e), filas = {};
T.elecciones_presidenciales.filter(d => d.eleccion === e.id).forEach(d => {
(filas[d.codigo_indec] ??= {codigo_indec: d.codigo_indec, territorio: d.territorio})[d.candidato] = d.pct; });
const g0 = cl[0].k, pais = filas["00"];
const resto = Object.values(filas).filter(d => d.codigo_indec !== "00").sort((p, q) => (q[g0] || 0) - (p[g0] || 0));
const gan = e.candidatos.find(c => c.c === e.ganador);
const intro = e.vuelta === 2 ? `En la segunda vuelta de ${e.anio}` : e.anio === 2015 || e.anio === 2023 ? `En la primera vuelta de ${e.anio}` : `En la elección de ${e.anio}`;
const internas = e.candidatos.filter(c => c.listas.length > 1);
document.querySelector('[data-t="elecciones"]').textContent = e.vuelta === 0
? `En las PASO de ${e.anio}, la agrupación más votada fue la de ${e.ganador} (${gan.fuerza}), con el ${pct(e.pct_ganador)} de los votos positivos del país, ` +
`y salió primera ${deLas24(e.prov_ganador)}. Su porcentaje más alto fue el de ${e.max_prov} (${pct(e.max_v)}) y el más bajo, el de ${e.min_prov} (${pct(e.min_v)}). ` +
(internas.length ? internas.map(c => `En ${c.fuerza} compitieron ${nomListas(c)}. `).join("") : "Ninguna de las cuatro agrupaciones más votadas tuvo competencia interna. ") +
`Votó el ${pct(e.participacion)} de los electores habilitados.` + (e.provisorio ? " Son datos del escrutinio provisorio." : "")
: `${intro}, la fórmula de ${e.ganador} (${gan.fuerza}) obtuvo el ${pct(e.pct_ganador)} de los votos positivos del país ` +
`y fue la más votada ${deLas24(e.prov_ganador)}. Su porcentaje más alto fue el de ${e.max_prov} (${pct(e.max_v)}) y el más bajo, el de ${e.min_prov} (${pct(e.min_v)}). ` +
`Votó el ${pct(e.participacion)} de los electores habilitados.` + (e.provisorio ? " Son datos del escrutinio provisorio." : "");
document.getElementById("el-ley").innerHTML = cl.map(k => `<span><i style="background:${k.c}"></i><b>${k.lab}</b>${k.fuerza ? ` <small>${k.fuerza}</small>` : ""}</span>`).join("");
apiladasH(G("elecciones"), {anim: a, data: [pais, ...resto], claves: cl});
});
MED.congreso = "Diputados";
DIB.congreso = conTablas("congreso", ["congreso_composicion"], a => {
const cam = MED.congreso, esp = CG.espacios, v = cam === "Diputados" ? CG.dip : CG.sen, n = cam === "Diputados" ? CG.n_dip : CG.n_sen;
const ord = esp.filter(k => v[k]).sort((p, q) => v[q] - v[p]);
document.querySelector('[data-t="congreso"]').textContent = cam === "Diputados"
? `Al ${fLarga(CG.fecha)}, en la Cámara de Diputados ${ESP_TXT[ord[0]]} tenía ${v[ord[0]]} de las ${n} bancas, ${ESP_TXT[ord[1]]}, ${v[ord[1]]}, y ${ESP_TXT[ord[2]]}, ${v[ord[2]]}. El gráfico muestra el reparto al 1 de marzo de cada período desde 1983: la última barra puede no coincidir con hoy por los cambios de bloque y los reemplazos. Tocá un espacio en la leyenda para ver cómo votó las leyes y los proyectos clave.`
: `Al ${fLarga(CG.fecha)}, en el Senado ${ESP_TXT[ord[0]]} tenía ${v[ord[0]]} de las ${n} bancas, ${ESP_TXT[ord[1]]}, ${v[ord[1]]}, y ${ESP_TXT[ord[2]]}, ${v[ord[2]]}. Cada senador figura con el partido o la alianza por la que fue electo, no con su bloque actual. Tocá un espacio en la leyenda para ver cómo votó las leyes y los proyectos clave.`;
const filas = T.congreso_composicion.filter(d => d.camara === cam);
const cl = esp.filter(k => filas.some(d => d[k] > 0)).map(k => ({k, lab: k, c: ESP_COLOR[k]}));
document.getElementById("cg-ley").innerHTML = cl.map(k => VT.espacios.includes(k.k)
? `<button type="button" class="esp-btn" data-e="${k.k}" aria-haspopup="dialog"><i style="background:${k.c}"></i>${k.lab}</button>`
: `<span><i style="background:${k.c}"></i>${k.lab}</span>`).join("");
columnasApiladas(G("congreso"), {anim: a, data: filas, claves: cl, cadaTick: 2});
});
$("lg-sel").innerHTML = PROV.map(([c, nom]) => `<option value="${c}">${nom}</option>`).join("");
const LG_PER = CG.periodos, LG_ULT = LG_PER[LG_PER.length - 1];
$("lg-per").innerHTML = [...LG_PER].reverse().map(a => `<option value="${a}">${a} a ${a + 2}${a === LG_ULT ? " (el actual)" : ""}</option>`).join("");
MED.legisladores = null; MED.lgPer = LG_ULT;
let LGP = null, lgCargando = null;
const lgCargar = () => lgCargando || (lgCargando = d3.json("datos/legisladores_por_periodo.json").then(j => { LGP = j; }, e => { lgCargando = null; throw e; }));
["lg-sel", "lg-per"].forEach(id => $(id).addEventListener("change", ev => {
if (id === "lg-sel") MED.legisladores = ev.target.value; else MED.lgPer = +ev.target.value;
DIB.legisladores();
}));
const lgMes = t => t === "sin fecha" ? "sin fecha" : `${MESES[+t.slice(5, 7) - 1]} de ${t.slice(0, 4)}`;
const lgNom = i => { const n = LGP.nombres[i], k = n.indexOf(", "); return k < 0 ? n : `${n.slice(k + 2)} ${n.slice(0, k)}`; };
TABLA_PROPIA["f-legisladores"] = () => lgCargar().then(() => {
const c = MED.legisladores || prov || "02", per = MED.lgPer;
return LGP.filas.filter(f => f[0] === per && f[2] === c)
.map(f => ({cámara: f[1] ? "Senado" : "Diputados", legislador: lgNom(f[3]), bloque: LGP.bloques[f[4]], espacio: LGP.espacios[f[5]],
desde: f[6] || "", hasta: f[7] || "", reemplaza_a: f[8] >= 0 ? lgNom(f[8]) : ""}))
.sort((p, q) => p.cámara.localeCompare(q.cámara, "es") || p.legislador.localeCompare(q.legislador, "es"));
});
const bancasHemi = per => (LGP.hemiciclo[per] || []).map(([cam, p, i, bl, e]) => ({cam, prov: p, nom: lgNom(i), bloque: LGP.bloques[bl], e}));
const leyHemi = arr => CG.espacios.filter(k => arr.some(b => LGP.espacios[b.e] === k))
.map(k => `<span><i style="background:${ESP_COLOR[k]}"></i>${k} <b>${arr.filter(b => LGP.espacios[b.e] === k).length}</b></span>`).join("");
const tipBanca = b => `<b>${b.nom}</b><br>${bandera(b.prov)}${NOMBRES[b.prov]}<br>${b.bloque}`;
const hemiFig = (bh, cam) => `<figure class="hemi ha-f${cam}"><h3>${cam ? "Senado" : "Diputados"}, ${bh.filter(b => b.cam === cam).length} bancas</h3>` +
`<div class="hemi-svg" data-cam="${cam}"></div></figure>`;
function hemiciclo(el, bancas, prov, tipBanca) {
el.innerHTML = "";
const n = bancas.length, W = Math.max(240, el.clientWidth), filas = n > 150 ? 9 : n > 60 ? 6 : 4;
const geo = R => {
const r0 = R * (n > 150 ? .36 : .34), radios = d3.range(filas).map(i => r0 + (R - r0) * i / (filas - 1));
const porFila = radios.map(r => Math.floor(n * r / d3.sum(radios)));
for (let i = filas - 1, falta = n - d3.sum(porFila); falta > 0; falta--, i = (i + filas - 1) % filas) porFila[i]++;
return {radios, porFila, rb: Math.min((R - r0) / (filas - 1), Math.PI * r0 / Math.max(1, porFila[0] - 1)) * .42};
};
const R = W / 2 - geo(W / 2).rb - 1, {radios, porFila, rb} = geo(R), H = R + 2 * rb + 2;
const pos = radios.flatMap((r, i) => d3.range(porFila[i]).map(j => {
const t = Math.PI * (1 - j / Math.max(1, porFila[i] - 1));
return {x: W / 2 + r * Math.cos(t), y: R + rb + 1 - r * Math.sin(t), t, r};
})).sort((p, q) => q.t - p.t || p.r - q.r);
const orden = [...bancas].sort((p, q) => p.e - q.e || p.prov.localeCompare(q.prov) || p.nom.localeCompare(q.nom, "es"));
orden.forEach((b, i) => Object.assign(b, pos[i]));
const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("role", "img")
.attr("aria-label", `${n} bancas: ` + listaY(CG.espacios.filter(k => orden.some(b => LGP.espacios[b.e] === k))
.map(k => `${orden.filter(b => LGP.espacios[b.e] === k).length} ${deEsp(k)}`)));
svg.selectAll("circle.banca").data(orden).join("circle").attr("class", "banca").attr("cx", b => b.x).attr("cy", b => b.y).attr("r", rb)
.attr("fill", b => ESP_COLOR[LGP.espacios[b.e]]).attr("opacity", b => !prov || b.prov === prov ? 1 : .45);
const anillo = svg.append("circle").attr("r", rb + 2.5).attr("fill", "none").attr("stroke", "var(--ink)").attr("stroke-width", 1.5)
.attr("opacity", 0).attr("pointer-events", "none");
const dl = d3.Delaunay.from(orden, b => b.x, b => b.y);
const ver = ev => {
const [sx, sy] = d3.pointer(ev, svg.node()), [ex, ey] = d3.pointer(ev, el), b = orden[dl.find(sx, sy)];
if (b && Math.hypot(b.x - sx, b.y - sy) < rb * 3) { anillo.attr("cx", b.x).attr("cy", b.y).attr("opacity", 1); return mostrarTip(el, tipBanca(b), ex, ey); }
anillo.attr("opacity", 0); ocultarTip();
};
svg.append("rect").attr("width", W).attr("height", H).attr("fill", "transparent").style("touch-action", "pan-y")
.on("pointermove", ver).on("pointerdown", ver).on("pointerleave", () => { anillo.attr("opacity", 0); ocultarTip(); });
}
DIB.legisladores = () => {
refrescarTabla("f-legisladores");
const c = MED.legisladores || prov || "02", per = MED.lgPer, el = G("legisladores");
document.getElementById("lg-sel").value = c; document.getElementById("lg-per").value = per;
if (!LGP) { esperando(el); lgCargar().then(DIB.legisladores).catch(() => sinDatos(el, "No se pudo cargar la lista de legisladores.")); return; }
const F = LGP.filas.filter(f => f[0] === per && f[2] === c);
const nom = lgNom;
const bancas = cam => {
const filas = F.filter(f => f[1] === cam), sig = new Map(filas.filter(f => f[8] >= 0).map(f => [f[8], f]));
return filas.filter(f => f[8] < 0).sort((p, q) => LGP.nombres[p[3]].localeCompare(LGP.nombres[q[3]], "es")).map(h => {
const partes = [];
let cur = h, n = 0;
while (sig.has(cur[3]) && n++ < 8) {
const s_ = sig.get(cur[3]);
partes.push(`${cur[7] ? `hasta ${lgMes(cur[7])}, ` : ""}siguió ${nom(s_[3])}${s_[6] === "sin fecha" ? ", sin fecha de asunción" : s_[6] ? ` desde ${lgMes(s_[6])}` : ""}`);
cur = s_;
}
if (cur[7]) partes.push(`hasta ${lgMes(cur[7])}`);
return {h, texto: partes.length ? ` (${partes.join(", luego ")})` : "", cambios: n};
});
};
const li = b => `<li><i style="background:${ESP_COLOR[LGP.espacios[b.h[5]]]}"></i><span>${nom(b.h[3])}${b.texto}</span>` +
`<small>${LGP.bloques[b.h[4]]}${b.h[6] && b.h[6] !== "sin fecha" ? `, desde ${lgMes(b.h[6])}` : ""}</small></li>`;
const dip = bancas(0), sen = bancas(1);
const cuenta = arr => CG.espacios.filter(k => arr.some(b => LGP.espacios[b.h[5]] === k))
.map(k => `${arr.filter(b => LGP.espacios[b.h[5]] === k).length} de ${ESP_TXT[k]}`.replace(" de el ", " del "));
const cambios = d3.sum([...dip, ...sen], b => b.cambios);
document.querySelector('[data-t="legisladores"]').textContent = `En el período ${per} a ${per + 2}, ${NOMBRES[c]} ${per === LG_ULT ? "tiene" : "tuvo"} ` +
`${dip.length} bancas de diputados y ${sen.length} de senadores nacionales. En Diputados: ${listaY(cuenta(dip))}. En el Senado: ${listaY(cuenta(sen))}. ` +
(cambios ? `Hubo ${cambios === 1 ? "un cambio" : `${cambios} cambios`} de legislador ${per === LG_ULT ? "en lo que va del" : "durante el"} período, que ${cambios === 1 ? "figura" : "figuran"} entre paréntesis.`
: `No hubo cambios de legisladores ${per === LG_ULT ? "en lo que va del" : "durante el"} período.`);
el.removeAttribute("aria-busy");
const bh = bancasHemi(per);
const marcada = MED.legisladores || (NOMBRES[prov] ? prov : "");
el.innerHTML = `<div class="lg-hemis">${hemiFig(bh, 0)}${hemiFig(bh, 1)}` +
[0, 1].map(cam => `<div class="pol-ley ha-l${cam}">${leyHemi(bh.filter(b => b.cam === cam))}</div>`).join("") +
`<p class="hemi-pie">Cada punto es una banca, con quien la ${per === LG_ULT ? "ocupa hoy" : `ocupaba el ${fechaLarga(LGP.hemiciclo_fecha[per])}`}. ` +
`Los espacios van en el orden de la leyenda y, dentro de cada uno, por provincia. ` +
(marcada ? `Las bancas de ${NOMBRES[marcada]} quedan resaltadas.` : "Al elegir una provincia, sus bancas quedan resaltadas.") + `</p></div>` +
`<div class="senado"><h3>Senado</h3><ul>${sen.map(li).join("")}</ul></div><div><h3>Diputados</h3><ul>${dip.map(li).join("")}</ul></div>`;
el.querySelectorAll(".hemi-svg").forEach(h => hemiciclo(h, bh.filter(b => b.cam === +h.dataset.cam), marcada, tipBanca));
};
MED.anioscong = "total";
MED["mujeres-congreso"] = "prov";
DIB["mujeres-congreso"] = conTablas("mujeres-congreso", () => MED["mujeres-congreso"] === "serie" ? ["mujeres_congreso"] : [], a => {
const el = G("mujeres-congreso"), v = MED["mujeres-congreso"];
$t("mujeres-congreso").textContent = v === "serie" ? TX["mujeres-congreso-serie"] : TX["mujeres-congreso"];
if (v === "serie") return lineas(el, {anim: a, data: T.mujeres_congreso, x: "anio", y0: 0, vf: pct, yf: v => n0(v) + "%", xl: r => `Período ${r.periodo}`,
series: [{k: "pct_mujeres_diputados", lab: "Diputados", corto: "Diputados", c: NAR, w: 3}, {k: "pct_mujeres_senado", lab: "Senado", corto: "Senado", c: FRI, w: 2.4}]});
barrasH(el, {anim: a, data: T.mujeres_congreso_provincias, k: "pct_mujeres", vf: pct, af: v => n0(v) + "%", ref: MJC.total, refLab: `Todo el Congreso ${pct(MJC.total)}`,
tip: d => `<b>${d.territorio}</b><br>${d.mujeres_diputados} diputadas de ${d.bancas_diputados}<br>${d.mujeres_senado} senadoras de ${d.bancas_senado}`});
});
DIB.anioscong = conTablas("anioscong", ["anios_congreso"], a => {
const el = G("anioscong"); if (!el) return;
const v = MED.anioscong, k = AC_K[v], p = NOMBRES[prov] ? prov : "";
const filas = T.anios_congreso.filter(d => d[k] > 0 && (!p || d.codigo_indec === p))
.sort((x, y) => y[k] - x[k] || x.nombre.localeCompare(y.nombre, "es")).slice(0, p ? 10 : 15);
const claves = [{k: "dip", lab: "Diputados", c: css("--azul")}, {k: "sen", lab: "Senado", c: css("--celeste"), texto: css("--ink")}]
.filter(c => v === "total" || c.k === v);
const data = filas.map((d, i) => ({...d, codigo_indec: "a" + i, prov: d.codigo_indec, territorio: d.nombre,
dip: v === "sen" ? 0 : d.anios_diputados, sen: v === "dip" ? 0 : d.anios_senado}));
const tope = (d3.max(filas, d => d[k]) || 1) * 1.18, marcas = d3.range(0, tope, 10);
apiladasH(el, {anim: a, data, claves, bandera: d => d.prov, max: tope, ticks: marcas, ejeF: x => x === marcas[marcas.length - 1] ? `${x} años` : x,
izq: angosto => angosto ? 176 : 236, recortar: true, sinProv: true, tipF: x => `${n1(x)} años`, alFinal: d => n1(d[k]), fuerte: d => d.sigue,
tipExtra: d => `<br>${bandera(d.prov)}${d.provincias}` + (d.periodos_diputados ? `<br>Diputados: ${d.periodos_diputados}` : "") +
(d.periodos_senado ? `<br>Senado: ${d.periodos_senado}` : "") + `<br>${d.espacios}` + (d.sigue ? "<br>Sigue en el cargo" : "")});
el.resaltar = null;
$t("anioscong").textContent = textoAnios(filas, v, p);
});
const VT = R.votaciones, VT_LEY = Object.fromEntries(VT.leyes.map(l => [l.k, l]));
const VOTO_COL = ["", "#2C7A5B", "#C0504D", "#E3A92B", "#C3CAD2"], VOTO_LAB = ["", "A favor", "En contra", "Abstención", "Ausente"];
const ESP_CORTO = {"Peronismo": "Peronismo", "UCR y aliados": "UCR y aliados", "PRO": "PRO", "Cambiemos y Juntos por el Cambio": "Cambiemos y JxC",
"La Libertad Avanza": "LLA", "Izquierda": "Izquierda", "Fuerzas provinciales": "Provinciales", "Otras fuerzas": "Otras"};
const ESP_PLURAL = new Set(["UCR y aliados", "Fuerzas provinciales", "Otras fuerzas"]);
const deEsp = e => ("de " + ESP_TXT[e]).replace(/^de el /, "del ");
const postura = c => { const [si, no, ab, au] = c; return si + no + ab < au ? "aus" : si > no + ab ? "si" : no > si + ab ? "no" : "div"; };
const nomVt = n => { const k = n.indexOf(","); return k < 0 ? n : `${n.slice(k + 1).trim()} ${n.slice(0, k)}`; };
function resumenEspacios(esp) {
const gr = {si: [], no: [], div: [], aus: []};
VT.espacios.filter(e => esp[e]).forEach(e => gr[postura(esp[e])].push(e));
const plural = arr => arr.length > 1 || ESP_PLURAL.has(arr[0]);
const txt = arr => listaY(arr.map(e => ESP_TXT[e])), verbo = arr => plural(arr) ? "votaron" : "votó";
let s = gr.si.length && gr.no.length ? `Por mayoría de sus legisladores, ${txt(gr.si)} ${verbo(gr.si)} a favor, y ${txt(gr.no)}, en contra.`
: gr.si.length ? `Por mayoría de sus legisladores, ${txt(gr.si)} ${verbo(gr.si)} a favor.` : gr.no.length ? `Por mayoría de sus legisladores, ${txt(gr.no)} ${verbo(gr.no)} en contra.` : "";
if (gr.div.length) s += ` ${mayus(txt(gr.div))} ${plural(gr.div) ? "se dividieron" : "se dividió"}.`;
if (gr.aus.length) s += ` La mayoría de los legisladores ${listaY(gr.aus.map(deEsp))} no estuvo en la votación.`;
return s.trim();
}
const opcionLey = l => `<option value="${l.k}">${l.anio}, ${l.nombre.replace(` (${l.anio})`, "")}</option>`;
$("vt-sel").innerHTML = `<optgroup label="Leyes y proyectos de la vida diaria">${[...VT.leyes].reverse().filter(l => l.ed).map(opcionLey).join("")}</optgroup>` +
`<optgroup label="Otras leyes y proyectos clave">${[...VT.leyes].reverse().filter(l => !l.ed).map(opcionLey).join("")}</optgroup>`;
MED.vtLey = VT.leyes[VT.leyes.length - 1].k; MED.votaciones = "Diputados"; MED.vtmatriz = "Diputados"; MED.vtfiltro = "todas";
DIB.vtfiltro = () => DIB.vtmatriz(false);
const vtIrALegisladores = () => {
const t = document.getElementById("tab-f-votaciones-1");
if (t && t.getAttribute("aria-selected") !== "true") { t.click(); t.focus({preventScroll: true}); } else DIB.votaciones(!REDUCIR);
DIB.vtmatriz(false);
document.getElementById("f-votaciones").scrollIntoView({behavior: REDUCIR ? "auto" : "smooth", block: "start"});
};
let VTJ = null, vtCargando = null;
const vtCargar = () => vtCargando || (vtCargando = d3.json("datos/votaciones_leyes_clave.json").then(j => { VTJ = j; }, e => { vtCargando = null; throw e; }));
TABLA_PROPIA["f-votaciones"] = () => vtCargar().then(() => (VTJ.votos[`${MED.vtLey}|${MED.votaciones}`] || [])
.map(x => ({codigo_indec: x[3], territorio: NOMBRES[x[3]] || "Sin provincia", legislador: nomVt(VTJ.nombres[x[0]]), bloque: VTJ.bloques[x[1]],
espacio: VT.espacios[x[2]], voto: VOTO_LAB[x[4]]}))
.sort((p, q) => p.territorio.localeCompare(q.territorio, "es") || p.legislador.localeCompare(q.legislador, "es")));
TABLA_PROPIA["f-votaciones-espacios"] = async () => {
const cam = MED.vtmatriz, soloEd = MED.vtfiltro === "ed";
return [...VT.leyes].reverse().filter(l => l.camaras[cam] && (!soloEd || l.ed)).flatMap(l => VT.espacios
.filter(e => d3.sum(l.camaras[cam].espacios[e] || []))
.map(e => { const c = l.camaras[cam].espacios[e];
return {ley: l.nombre, año: +l.camaras[cam].fecha.slice(0, 4), espacio: e, a_favor: c[0], en_contra: c[1], abstenciones: c[2], ausentes: c[3]}; }));
};
const vtConm = (g, cam) => {
const conm = document.querySelector(`.conmutador[data-g="${g}"]`);
conm.querySelectorAll("button").forEach((b, i) => { const on = b.dataset.m === cam; b.setAttribute("aria-pressed", on); if (on) conm.style.setProperty("--i", i); });
};
$("vt-sel").addEventListener("change", ev => { MED.vtLey = ev.target.value; cambiarVista("votaciones"); DIB.vtmatriz(false); });
function partirLista(nodo, max) {
if (!(nodo.getComputedTextLength() > max)) return;
const s = d3.select(nodo), partes = nodo.textContent.split(", ");
s.text("");
let linea = [], t = s.append("tspan").attr("x", s.attr("x"));
partes.forEach(p => {
t.text([...linea, p].join(", "));
if (linea.length && t.node().getComputedTextLength() > max) {
t.text(linea.join(", ") + ",");
linea = [];
t = s.append("tspan").attr("x", s.attr("x")).attr("dy", "1.2em");
}
linea.push(p);
t.text(linea.join(", "));
});
}
function puntosVoto(el, cfg) {
const w = Math.max(300, el.clientWidth), angosto = w < 560;
const paso = cfg.senado ? (angosto ? 13 : 16) : (angosto ? 8.6 : 10.5), r = paso * .4;
const labW = angosto ? 0 : 170, arriba = angosto ? 34 : 0, cols = Math.max(8, Math.floor((w - labW) / paso));
const cuentaDe = f => { const cu = [1, 2, 3, 4].map(k => f.v.filter(x => x[4] === k).length);
return [[0, "a favor"], [1, "en contra"], [2, cu[2] === 1 ? "abstención" : "abstenciones"], [3, cu[3] === 1 ? "ausente" : "ausentes"]].filter(([i]) => cu[i]).map(([i, t]) => `${cu[i]} ${t}`).join(", "); };
const renglones = cfg.filas.map(() => 1);
if (!angosto) {
const prueba = d3.select(el).append("svg").style("position", "absolute").style("visibility", "hidden"), t = prueba.append("text").attr("class", "etq-suave").attr("x", 0);
cfg.filas.forEach((f, j) => { t.text(cuentaDe(f)); partirLista(t.node(), labW - 8); renglones[j] = Math.max(1, t.selectAll("tspan").size()); });
prueba.remove();
}
let alto = 0;
const lay = cfg.filas.map((f, j) => { const y0 = alto; alto += arriba + Math.max(Math.ceil(f.v.length / cols) * paso, angosto ? 0 : 38 + (renglones[j] - 1) * 16) + 14; return {f, y0}; });
const C = lienzo(el, alto, {t: 0, r: 0, b: 0, l: 0}), g = C.g;
lay.forEach(({f, y0}, j) => {
g.append("text").attr("class", "etq-fuerte").attr("x", 0).attr("y", y0 + 13).text(ESP_CORTO[f.e]);
const cuenta = g.append("text").attr("class", "etq-suave").attr("x", 0).attr("y", y0 + 29).text(cuentaDe(f));
if (!angosto) partirLista(cuenta.node(), labW - 8);
const pt = g.append("g").selectAll("circle").data(f.v).join("circle")
.attr("cx", (d, i) => labW + (i % cols) * paso + paso / 2).attr("cy", (d, i) => y0 + arriba + Math.floor(i / cols) * paso + paso / 2).attr("r", r)
.attr("fill", d => d[4] === 4 ? "none" : VOTO_COL[d[4]]).attr("stroke", d => d[3] === prov && prov ? css("--ink") : d[4] === 4 ? VOTO_COL[4] : "none")
.attr("stroke-width", d => d[3] === prov && prov ? 2 : 1.2);
pt.on("pointerenter", function(ev, d) {
mostrarTip(el, `<b>${nomVt(VTJ.nombres[d[0]])}</b><br>${VTJ.bloques[d[1]]}<br>${NOMBRES[d[3]] || "Sin provincia"}<br>${VOTO_LAB[d[4]]}`, +this.getAttribute("cx"), +this.getAttribute("cy"));
}).on("pointerleave", ocultarSiMouse);
if (cfg.anim) pt.attr("opacity", 0).transition().delay(Math.min(150, j * 30)).duration(DUR_G).attr("opacity", 1);
});
}
DIB.votaciones = a => {
refrescarTabla("f-votaciones");
const L = VT_LEY[MED.vtLey], cam = MED.votaciones, C = L.camaras[cam], el = G("votaciones");
document.getElementById("vt-sel").value = L.k;
const t = C ? C.total : null, en = cam === "Diputados" ? "En Diputados" : "En el Senado";
const base = `${L.que} ` + (C
? `${en}, el ${fechaLarga(C.fecha)}, votaron ${t.si} a favor y ${t.no} en contra` + (t.abs ? `, hubo ${t.abs} ${t.abs === 1 ? "abstención" : "abstenciones"}` : "") +
(t.aus ? ` y ${t.aus} ${t.aus === 1 ? "legislador no estuvo" : "legisladores no estuvieron"}.` : " y no faltó nadie.") + ` ${resumenEspacios(C.espacios)} `
: `El Senado no publica el acta con el voto de cada senador de esta votación. `) + L.desenlace;
const lead = document.querySelector('[data-t="votaciones"]');
lead.textContent = base;
document.getElementById("vt-ley").innerHTML = [1, 2, 3, 4].map(k => `<span><i style="${k === 4 ? `border:1.5px solid ${VOTO_COL[4]};border-radius:50%;box-sizing:border-box` : `background:${VOTO_COL[k]};border-radius:50%`}"></i>${VOTO_LAB[k]}</span>`).join("") +
(prov ? `<span><i style="border:2px solid var(--ink);border-radius:50%;box-sizing:border-box"></i>${NOMBRES[prov]}</span>` : "");
if (!C) { el.innerHTML = `<p class="nota">El Senado no publica el acta con el voto de cada senador de esta votación. Elegí Diputados para verla.</p>`; return; }
if (!VTJ) { esperando(el); vtCargar().then(() => DIB.votaciones(a)).catch(() => sinDatos(el, "No se pudieron cargar los votos.")); return; }
const V = VTJ.votos[`${L.k}|${cam}`];
const filas = VT.espacios.map((e, i) => ({e, v: V.filter(x => x[2] === i).sort((p, q) => p[4] - q[4] || VTJ.nombres[p[0]].localeCompare(VTJ.nombres[q[0]], "es"))})).filter(f => f.v.length);
if (prov) {
const mio = V.filter(x => x[3] === prov), cu = [1, 2, 3, 4].map(k => mio.filter(x => x[4] === k).length);
const fr = [[0, "votó a favor", "votaron a favor"], [1, "votó en contra", "votaron en contra"], [2, "se abstuvo", "se abstuvieron"], [3, "no estuvo", "no estuvieron"]]
.filter(([i]) => cu[i]).map(([i, s1, s2]) => `${cu[i]} ${cu[i] === 1 ? s1 : s2}`);
if (mio.length) lead.textContent = base + ` De ${mio.length === 1 ? "el legislador" : `los ${mio.length} ${cam === "Diputados" ? "diputados" : "senadores"}`} de ${NOMBRES[prov]}, ${listaY(fr)}.`.replace("De el ", "Del ");
}
puntosVoto(el, {anim: a, filas, senado: cam === "Senado"});
};
const CNE_2023 = "https://www.electoral.gob.ar/nuevo/paginas/pdf/plataformas/2023/GENERALES/";
const PLATAFORMA_2023 = {
"Peronismo": ["Unión por la Patria", "ON 134 UNION POR LA PATRIA PLATAFORMA.pdf"],
"La Libertad Avanza": ["La Libertad Avanza", "ON 135 LA LIBERTAD AVANZA PLATAFORMA.pdf"],
"PRO": ["Juntos por el Cambio", "ON 132 JUNTOS POR EL CAMBIO.pdf"],
"UCR y aliados": ["Juntos por el Cambio", "ON 132 JUNTOS POR EL CAMBIO.pdf"],
"Cambiemos y Juntos por el Cambio": ["Juntos por el Cambio", "ON 132 JUNTOS POR EL CAMBIO.pdf"],
"Izquierda": ["Frente de Izquierda y de Trabajadores Unidad", "ON 136 FRENTE DE IZQUIERDA Y DE TRABAJADORES - UNIDAD PLATAFORMA.pdf"],
};
const plataformaCelda = e => {
const pl = PLATAFORMA_2023[e];
return pl ? `<td class="plat"><a href="${CNE_2023 + encodeURIComponent(pl[1])}" target="_blank" rel="noopener" title="Plataforma de ${pl[0]}, elecciones 2023">PDF</a></td>` : `<td class="sin">—</td>`;
};
DIB.vtmatriz = a => {
refrescarTabla("f-votaciones-espacios");
const cam = MED.vtmatriz, el = G("vtmatriz"), soloEd = MED.vtfiltro === "ed";
const filas = VT.leyes.filter(l => !soloEd || l.ed);
const leyes = filas.filter(l => l.camaras[cam]);
const esp = VT.espacios.filter(e => leyes.filter(l => d3.sum(l.camaras[cam].espacios[e] || []) >= 3).length >= 3);
const col = d3.scaleLinear().domain([0, 50, 100]).range([VOTO_COL[2], "#EEF1F4", VOTO_COL[1]]);
const celda = (l, e) => {
const c = l.camaras[cam] && l.camaras[cam].espacios[e];
if (!l.camaras[cam]) return "";
if (!c || !d3.sum(c)) return `<td class="sin">—</td>`;
const tit = `${e}: ${c[0]} a favor, ${c[1]} en contra, ${c[2]} ${c[2] === 1 ? "abstención" : "abstenciones"} y ${c[3]} ${c[3] === 1 ? "ausente" : "ausentes"}`;
if (postura(c) === "aus") return `<td class="sin" title="${tit}"><span aria-hidden="true">aus.</span><span class="solo-lector">${tit}</span></td>`;
const p = c[0] / (c[0] + c[1] + c[2]) * 100, fondo = col(p);
return `<td title="${tit}" style="background:${fondo};color:${tintaSobre(fondo)}"><span aria-hidden="true">${Math.round(p)}</span><span class="solo-lector">${Math.round(p)}% a favor. ${tit}</span></td>`;
};
el.innerHTML = `<table><thead><tr><th>Ley</th>${esp.map(e => `<th><button type="button" class="esp-btn" data-e="${e}" aria-haspopup="dialog">${ESP_CORTO[e]}</button></th>`).join("")}</tr></thead><tbody>` +
[...filas].reverse().map(l => `<tr data-k="${l.k}"${l.k === MED.vtLey ? ' class="elegida"' : ""}><td class="ley"><button type="button" class="vt-ley" aria-pressed="${l.k === MED.vtLey}">${l.nombre}</button><small>${l.camaras[cam] ? l.camaras[cam].fecha.slice(0, 4) : l.anio}${l.ed ? ", vida diaria" : ""}</small></td>` +
(l.camaras[cam] ? esp.map(e => celda(l, e)).join("") : `<td class="sin" colspan="${esp.length}">El Senado no publica el acta nominal</td>`) + "</tr>").join("") + "</tbody>" +
`<tfoot><tr><td class="ley">Plataforma electoral de 2023<small>qué propuso cada alianza (PDF)</small></td>${esp.map(plataformaCelda).join("")}</tr></tfoot></table>`;
el.querySelectorAll("tr[data-k]").forEach(tr => {
const ir = () => {
MED.vtLey = tr.dataset.k; MED.votaciones = VT_LEY[tr.dataset.k].camaras[cam] ? cam : "Diputados"; vtConm("votaciones", MED.votaciones);
vtIrALegisladores();
};
tr.addEventListener("click", ev => { if (!ev.target.closest("a")) ir(); });
});
const pares = [];
esp.forEach((e1, i) => esp.slice(i + 1).forEach(e2 => {
let n = 0, igual = 0;
leyes.forEach(l => { const c1 = l.camaras[cam].espacios[e1], c2 = l.camaras[cam].espacios[e2];
if (!c1 || !c2) return; const p1 = postura(c1), p2 = postura(c2);
if ((p1 === "si" || p1 === "no") && (p2 === "si" || p2 === "no")) { n++; if (p1 === p2) igual++; } });
if (n >= 6) pares.push({e1, e2, n, igual, f: igual / n});
}));
pares.sort((p, q) => q.f - p.f || q.n - p.n);
const mas = pares[0], menos = pares[pares.length - 1];
document.querySelector('[data-t="vtm"]').textContent = `${cam === "Diputados" ? "En Diputados" : "En el Senado"} hay acta nominal de ${leyes.length === filas.length ? `las ${filas.length}` : `${leyes.length} de las ${filas.length}`} leyes y proyectos ${soloEd ? "de la vida diaria (los que cambian, o proponían cambiar, algo que llega a muchas personas)" : "clave"}. ` +
(mas ? `Contando la postura de la mayoría de cada espacio, los que más coincidieron fueron ${ESP_TXT[mas.e1]} y ${ESP_TXT[mas.e2]}: votaron igual en ${mas.igual === mas.n ? `las ${mas.n}` : `${mas.igual} de las ${mas.n}`} leyes y proyectos en que los dos tomaron posición. ` +
`Los que menos coincidieron fueron ${ESP_TXT[menos.e1]} y ${ESP_TXT[menos.e2]}: votaron distinto en ${menos.n - menos.igual} de ${menos.n}. ` : "") +
`Tocá una ley para ver el voto de cada legislador, o el nombre de un espacio para ver su recorrido ley por ley.`;
};
const POSTURA_CORTA = {si: "A favor", no: "En contra", div: "Dividido", aus: "Ausente"}, POSTURA_COL = {si: 1, no: 2, div: 3, aus: 4};
let dlgEsp = null;
const conLegisladores = (l, cam, e) => l.camaras[cam] && d3.sum(l.camaras[cam].espacios[e] || []) > 0;
function cerrarEspacio() {
if (!dlgEsp?.open) return;
if (REDUCIR) return dlgEsp.close();
dlgEsp.animate([{opacity: 1}, {opacity: 0}], {duration: 150, easing: "ease-out"}).onfinish = () => dlgEsp.close();
}
function abrirEspacio(e) {
if (!dlgEsp) {
dlgEsp = document.createElement("dialog"); dlgEsp.className = "esp-dialogo"; dlgEsp.setAttribute("aria-labelledby", "esp-tit");
document.body.appendChild(dlgEsp);
dlgEsp.addEventListener("click", ev => {
if (ev.target === dlgEsp) return cerrarEspacio();
if (ev.target.closest(".esp-cerrar")) return cerrarEspacio();
const ver = ev.target.closest(".esp-ver");
if (ver) {
const k = ver.dataset.k; dlgEsp.close();
MED.vtLey = k; MED.votaciones = VT_LEY[k].camaras.Diputados ? "Diputados" : "Senado"; vtConm("votaciones", MED.votaciones);
vtIrALegisladores();
}
});
dlgEsp.addEventListener("cancel", ev => { ev.preventDefault(); cerrarEspacio(); });
}
const en = cam => cam === "Diputados" ? "En Diputados" : "En el Senado";
const resumen = ["Diputados", "Senado"].map(cam => {
const total = VT.leyes.filter(l => l.camaras[cam]).length, leyes = VT.leyes.filter(l => conLegisladores(l, cam, e));
if (!leyes.length) return `${en(cam)} no tuvo legisladores en ninguna de las ${total} leyes y proyectos clave con acta nominal.`;
const n = {si: 0, no: 0, div: 0, aus: 0}; leyes.forEach(l => n[postura(l.camaras[cam].espacios[e])]++);
const partes = [n.si && `votó a favor en ${n.si}`, n.no && `en contra en ${n.no}`, n.div && `se dividió en ${n.div}`, n.aus && `no estuvo en ${n.aus}`].filter(Boolean);
return `${en(cam)} tuvo legisladores en ${leyes.length === total ? `las ${total}` : `${leyes.length} de las ${total}`} leyes y proyectos clave con acta nominal, y la mayoría del espacio ${listaY(partes)}.`;
}).join(" ");
const pl = PLATAFORMA_2023[e];
const plat = pl ? `<a href="${CNE_2023 + encodeURIComponent(pl[1])}" target="_blank" rel="noopener">Plataforma electoral de ${pl[0]}</a> <small>(PDF presentado ante la Cámara Nacional Electoral)</small>`
: `Este grupo reúne a partidos distintos y no tiene una plataforma nacional única.`;
const voto = (l, cam) => {
if (!l.camaras[cam]) return `<li><span>${cam}</span><em class="sin">Sin acta nominal publicada</em></li>`;
const c = l.camaras[cam].espacios[e];
if (!c || !d3.sum(c)) return `<li><span>${cam}</span><em class="sin">Sin legisladores del espacio</em></li>`;
const p = postura(c), det = [[0, "a favor"], [1, "en contra"], [2, c[2] === 1 ? "abstención" : "abstenciones"], [3, c[3] === 1 ? "ausente" : "ausentes"]]
.filter(([i]) => c[i]).map(([i, t]) => `${c[i]} ${t}`).join(", ");
return `<li><span>${cam}</span><em style="--pv:${VOTO_COL[POSTURA_COL[p]]}">${POSTURA_CORTA[p]}</em><small>${det}</small></li>`;
};
const leyes = [...VT.leyes].reverse().filter(l => conLegisladores(l, "Diputados", e) || conLegisladores(l, "Senado", e));
dlgEsp.innerHTML = `<div class="esp-cab"><i style="background:${ESP_COLOR[e]}" aria-hidden="true"></i><div><p class="esp-eb">Espacio político</p><h3 id="esp-tit">${e}</h3></div>` +
`<button type="button" class="boton chico esp-cerrar">Cerrar</button></div><div class="esp-cuerpo"><p class="esp-res">${resumen}</p>` +
`<div class="esp-plat"><p class="esp-eb">Qué propuso en 2023</p><p>${plat}</p></div>` +
`<h4 class="esp-eb">Ley por ley</h4><ol class="esp-leyes">` + leyes.map(l => `<li class="esp-ley"><div><b>${l.nombre}</b><small>${l.anio}</small></div><p>${l.que}</p>` +
`<ul class="esp-votos">${voto(l, "Diputados")}${voto(l, "Senado")}</ul><button type="button" class="enlace esp-ver" data-k="${l.k}">Ver el voto de cada legislador</button></li>`).join("") +
`</ol><p class="nota">Postura de la mayoría de los legisladores del espacio en la votación en general, según el acta de cada cámara. ` +
`El espacio de cada legislador sale del bloque que registra el acta, con la clasificación propia de esta sección. La selección de leyes y proyectos también es propia.</p></div>`;
dlgEsp.showModal(); dlgEsp.scrollTop = 0;
if (!document.documentElement.classList.contains("teclado"))
dlgEsp.animate(REDUCIR ? [{opacity: 0}, {opacity: 1}] : [{opacity: 0, transform: "translateY(8px) scale(.98)"}, {opacity: 1, transform: "none"}], {duration: 200, easing: "cubic-bezier(.23,1,.32,1)"});
}
document.addEventListener("click", ev => { const b = ev.target.closest(".esp-btn"); if (b) abrirEspacio(b.dataset.e); });
const AP = VT.apoyo, AP_A = Object.fromEntries(AP.anios.map(x => [x.anio, x]));
MED.apoyo = "atn_hab"; MED.apAnio = AP.hasta;
$("ap-sel").innerHTML = [...AP.anios].reverse().map(x => `<option value="${x.anio}">${x.anio} (${x.presidente})</option>`).join("");
$("ap-sel").addEventListener("change", ev => { MED.apAnio = +ev.target.value; cambiarVista("apoyo"); });
DIB.apoyo = conTablas("apoyo", ["apoyo_gobierno_provincias"], a => {
const y = MED.apAnio, A = AP_A[y], k = MED.apoyo, rr = x => k === "atn_hab" ? x.r_atn : x.r_otras, r = rr(A);
const nomT = k === "atn_hab" ? "los ATN" : "las otras transferencias no automáticas";
const serie = AP.anios.filter(x => rr(x) != null), pos = serie.filter(x => rr(x) >= .4).map(x => String(x.anio)), neg = serie.filter(x => rr(x) <= -.4).map(x => String(x.anio));
document.getElementById("ap-sel").value = y;
document.querySelector('[data-t="apoyo"]').textContent = `En ${y}, con ${A.presidente} en la presidencia, hubo ${A.votaciones} votaciones divididas en el Congreso. ` +
`Los diputados y senadores de otros bloques que más votaron como el bloque oficialista fueron los de ${A.max}, en el ${pct(A.max_v)} de los casos, y los que menos, los de ${A.min}, en el ${pct(A.min_v)}. ` +
(r == null ? `Ese año solo ${A.n_atn} provincias recibieron ATN, muy pocas para medir una relación. `
: `La relación entre esa coincidencia y ${nomT} por habitante fue ${fuerza(r)} (correlación de ${n2(r)})` + (k === "atn_hab" && A.n_atn < 24 ? `, con ${A.n_atn} provincias que recibieron ATN` : "") + `. `) +
`Entre ${AP.desde} y ${AP.hasta}, la relación ` +
(pos.length ? `fue positiva y al menos moderada en ${pos.length === 1 ? "un año" : `${pos.length} años`} (${listaY(pos)})` : "nunca fue positiva y al menos moderada") +
(neg.length ? `, y fue negativa y al menos moderada en ${listaY(neg)}.` : `, y nunca fue negativa y al menos moderada.`) + ` Positiva quiere decir que las provincias con más coincidencia tendieron a recibir más por habitante, y negativa, menos. Que las dos cosas vayan juntas no muestra que los fondos dependan de los votos ni que los votos dependan de los fondos.`;
dispersion(G("apoyo"), {anim: a, data: T.apoyo_gobierno_provincias.filter(d => d.anio === y), x: k, y: "apoyo",
xLab: `${k === "atn_hab" ? "ATN" : "Otras no automáticas"} por habitante, pesos de ${TRR.ult}`, yLab: "Votos como el bloque oficialista",
fx: v => n0(v), vx: v => n0(v) + " pesos"});
});
TX["votaciones-nota"] = $t("votaciones-nota").textContent = `Votación en general de cada ley o proyecto en cada cámara, según el acta de votación nominal. Cada punto es un legislador: pasá el mouse o tocá un punto para ver quién es. Leyes de la vida diaria: las que cambian, o proponían cambiar, algo que llega a la vida diaria de muchas personas o de muchos hogares, como los ingresos, las jubilaciones, los impuestos que pagan los asalariados, los derechos civiles, la salud o el trabajo. Es una selección propia y revisable, que incluye los proyectos que no se aprobaron. ` +
`Ausente incluye a quien estaba en la sesión pero no votó. Quien preside la sesión solo vota si hay empate y no figura en el acta. ` +
`El espacio de cada legislador sale del bloque que registra el acta, con la misma clasificación que la composición del Congreso, pero el PRO y la UCR siempre van por separado. ` +
`La selección es propia: leyes y proyectos muy debatidos o con efectos amplios, de todos los gobiernos desde ${R.votaciones.leyes[0].anio}. ` +
`El Senado no publica el acta nominal de ${listaY(R.votaciones.leyes.filter(l => !l.camaras.Senado).map(l => `${l.nombre.charAt(0).toLowerCase() + l.nombre.slice(1)} de ${l.anio}`))}. ` +
`Las actas salen de la copia de los sitios oficiales que mantiene el proyecto abierto ¿Cómo Votó?, de Rodrigo Quiroga, con ${n0(R.votaciones.n_dip)} votaciones de Diputados desde ${R.votaciones.dip_desde} y ${n0(R.votaciones.n_sen)} del Senado desde ${R.votaciones.sen_desde}, hasta el ${fechaLarga(R.votaciones.ult)}. ` +
`Se cotejaron con los datos abiertos de la Cámara de Diputados (todas las actas de 2011 a 2019) y con el sitio del Senado (todas las de estas leyes desde 2008 y una muestra), sin diferencias. ` +
`Las de 2006 y 2007 se cotejaron con los totales que publicó la prensa: coinciden, salvo un voto a favor de más y una abstención de menos en la reforma del Consejo de la Magistratura en ` +
`Diputados y una abstención de menos en la de bosques. El total de la reasignación de partidas por el jefe de Gabinete en Diputados no se encontró publicado: es el acta de la votación en general de esa sesión.`;
const PV_K = ["fuera_a_favor", "fuera_en_contra", "fuera_abstencion", "fuera_ausente"];
const PV_CLAVES = [1, 2, 3, 4].map((v, i) => ({k: PV_K[i], lab: VOTO_LAB[v], c: VOTO_COL[v], texto: v >= 3 ? css("--ink") : null}));
if ($("pv-ley")) $("pv-ley").innerHTML = PV_CLAVES.map(k => `<span><i style="background:${k.c}"></i>${k.lab}</span>`).join("");
MED.presupuesto = "Diputados";
DIB.presupuesto = a => {
const cam = MED.presupuesto, el = G("presupuesto"); if (!el) return;
const data = T.presupuesto_votos.filter(d => d.camara === cam).map(d => ({...d, codigo_indec: String(d.ejercicio), territorio: `${d.ejercicio}, ${d.presidente}`}));
apiladasH(el, {anim: a, data, claves: PV_CLAVES, sinProv: true, izq: angosto => angosto ? 150 : 214, recortar: true,
tipExtra: d => `<br>Votado el ${fechaLarga(d.fecha)}<br>Resultado: ${d.a_favor} a favor y ${d.en_contra} en contra${d.aprobado ? "" : ", rechazado"}` +
`<br>Bloque oficialista: ${d.bloque_oficialista}<br>Legisladores de fuera de ese bloque: ${d.fuera}`});
$t("presupuesto").textContent = textoPresupuesto(cam);
};
const RV = R.votaciones.representacion.filter(g => g.r != null);
const rvClave = g => g.presidente + "|" + g.eleccion;
const rvNombre = g => `${g.presidente}, ${g.anios[0] === g.anios[1] ? g.anios[0] : g.anios[0] + " a " + g.anios[1]} (elección de ${g.eleccion})`;
const rvSel = $("vprov-sel");
rvSel.innerHTML = RV.map(g => `<option value="${rvClave(g)}">${rvNombre(g)}</option>`).join("");
MED.vprov = rvClave(RV[RV.length - 1]); rvSel.value = MED.vprov;
TX["vprov"] = $t("vprov").textContent = 
`La relación entre el voto al presidente en la primera vuelta y la coincidencia de los legisladores de cada provincia con el bloque oficialista, en las leyes y los proyectos clave, cambia de un gobierno a otro. ` +
RV.map(g => `Con ${g.presidente} fue ${fuerza(g.r)} (correlación de ${n2(g.r).replace("-", "menos ")}, en ${g.leyes} ${g.leyes === 1 ? "ley o proyecto" : "leyes o proyectos"} ${g.anios[0] === g.anios[1] ? `de ${g.anios[0]}` : `entre ${g.anios[0]} y ${g.anios[1]}`})`).join(". ") + ". Con pocas leyes, un solo voto puede mover mucho el resultado. Que las dos medidas vayan juntas no muestra que una explique la otra.";
DIB.vprov = conTablas("vprov", ["voto_legisladores_y_provincia"], a => {
const g = RV.find(x => rvClave(x) === MED.vprov);
dispersion(G("vprov"), {anim: a, data: T.voto_legisladores_y_provincia.filter(d => d.presidente === g.presidente && d.eleccion === g.eleccion),
x: "pct_presidente", y: "pct_coincide", xLab: `Votos de ${g.presidente} en la primera vuelta de ${g.eleccion}`, yLab: "Votos de sus legisladores que coincidieron con el oficialismo"});
});
TX["vprov-nota"] = $t("vprov-nota").textContent = `Cada punto es una provincia. El eje horizontal es el porcentaje de votos positivos que sacó el presidente en esa provincia en la primera vuelta de la elección que lo llevó al gobierno. ` +
`El vertical, el porcentaje de los votos de sus diputados y senadores presentes que coincidió con la posición del bloque oficialista en las leyes y los proyectos clave de ese gobierno, contando también a los del propio bloque oficialista. ` +
`Los legisladores fueron elegidos en distintos años, no solo en esa elección, y con pocas leyes por gobierno el resultado es frágil. La correlación de Spearman compara el orden de las provincias en las dos medidas: no prueba que un voto explique el otro.`;
TX["vtm-nota"] = $t("vtm-nota").textContent = `Cada celda muestra el porcentaje de los legisladores presentes de ese espacio que votó a favor en la votación en general: verde es a favor y rojo, en contra. ` +
`"aus." indica que la mayoría del espacio no estuvo en la votación y el punto, que el espacio no tenía legisladores en esa cámara o tenía menos de tres. ` +
`En la comparación entre espacios, un espacio toma posición en una ley cuando más de la mitad de sus presentes votó lo mismo. Espacios con legisladores en al menos tres de estas votaciones. ` +
`La última fila enlaza la plataforma electoral nacional que cada alianza presentó ante la Justicia Nacional Electoral para las elecciones de 2023, publicada por la Cámara Nacional Electoral: lo que cada espacio propuso, junto a lo que votó. ` +
`La UCR y el PRO la presentaron juntos, dentro de Juntos por el Cambio. Las fuerzas provinciales y las otras fuerzas no tienen una plataforma nacional única. ` +
`Leyes de la vida diaria: las que cambian, o proponían cambiar, algo que llega a la vida diaria de muchas personas o de muchos hogares, como los ingresos, las jubilaciones, los impuestos que pagan los asalariados, los derechos civiles, la salud o el trabajo. Es una selección propia y revisable, que incluye los proyectos que no se aprobaron.`;
TX["apoyo-nota"] = $t("apoyo-nota").textContent = `En cada votación dividida, aquella en la que al menos una cuarta parte de los presentes votó distinto que el bloque oficialista, se mira si cada diputado y senador de otro bloque votó igual que él. ` +
`El porcentaje suma las dos cámaras y todas las votaciones divididas del año, no solo las leyes y proyectos clave. El bloque oficialista es el más numeroso del espacio del presidente en cada cámara. ` +
`Transferencias por habitante del mismo año, en pesos de ${R.transferencias.ult}. La correlación es la de rangos de Spearman entre las 24 jurisdicciones, de menos 1 a 1: cerca de 0 no hay relación. ` +
`No se calcula para los ATN cuando los recibieron menos de 8 provincias. Que dos cosas vayan juntas no prueba que una cause la otra: puede haber una tercera explicación, por ejemplo que las provincias gobernadas por aliados del gobierno tengan legisladores que lo acompañan y también más acceso a esos fondos.`;
function icgElecciones(el, filas, serie, anim) {
const angosto = el.clientWidth < 520, AZ = css("--celeste-fuerte"), AM = css("--sol-fuerte");
const elecTx = d => `${d.tipo === "PASO" ? "PASO" : "Primera vuelta"} de ${d.anio}`;
const C = lienzo(el, angosto ? 400 : 430, {t: 22, r: angosto ? 58 : 104, b: 30, l: 40});
const {g, iw, ih} = C;
C.svg.attr("aria-label", "Arriba, el índice de confianza en el gobierno mes a mes. Abajo, el voto a la candidatura del gobierno en cada elección: " +
filas.map(d => `${elecTx(d)}, ${pct(d.voto_gobierno_pct)}, con el índice en ${n2(d.indice)} el mes anterior`).join(". "));
const lec = d3.select(el).insert("p", "svg").attr("class", "lectura-serie").attr("aria-hidden", "true");
const s = serie.map(r => ({...r, t: tPer(r.mes)})), e = filas.map(d => ({...d, t: tPer(d.fecha.slice(0, 7)) + (+d.fecha.slice(8, 10) - 1) / 365, ti: tPer(d.mes_indice)}));
const x = d3.scaleLinear().domain(d3.extent(s, r => r.t)).range([0, iw]);
const hA = Math.round(ih * .5), y0B = hA + 40, hB = ih - y0B;
const yA = d3.scaleLinear().domain([0, Math.max(3, d3.max(s, r => r.icg))]).nice().range([hA, 0]);
const yB = d3.scaleLinear().domain([0, Math.max(60, d3.max(e, d => d.voto_gobierno_pct))]).nice().range([y0B + hB, y0B]);
const panel = (y, ticks, f) => {
g.append("g").attr("class", "grilla").call(d3.axisLeft(y).ticks(ticks).tickSize(-iw).tickFormat("")).call(a => a.select(".domain").remove());
g.append("g").attr("class", "eje").call(d3.axisLeft(y).ticks(ticks).tickFormat(f).tickSize(0).tickPadding(8)).call(a => a.select(".domain").remove());
};
panel(yA, 3, n0);
panel(yB, 3, v => v + "%");
g.append("text").attr("class", "etq-suave").attr("x", 0).attr("y", -9).text(angosto ? "Confianza en el gobierno, de 0 a 5" : "Confianza en el gobierno, índice de 0 a 5, mes a mes");
g.append("text").attr("class", "etq-suave").attr("x", 0).attr("y", y0B - 12).text(angosto ? "Voto a la candidatura del gobierno" : "Voto a la candidatura del gobierno en cada elección presidencial, % de los votos positivos");
const anios = d3.range(Math.ceil(x.domain()[0]), Math.floor(x.domain()[1]) + 1), paso = angosto ? 4 : 2;
g.append("g").attr("class", "eje").attr("transform", `translate(0,${ih})`)
.call(d3.axisBottom(x).tickValues(anios.filter(v => v % paso === 0)).tickFormat(d3.format("d")).tickSizeOuter(0));
g.selectAll("line.elec").data(e).join("line").attr("class", "elec").attr("x1", d => x(d.t)).attr("x2", d => x(d.t)).attr("y1", 0).attr("y2", ih)
.attr("stroke", css("--faint")).attr("stroke-dasharray", "3 3");
const trA = g.append("path").datum(s).attr("fill", "none").attr("stroke", AZ).attr("stroke-width", 2.2).attr("stroke-linejoin", "round")
.attr("d", d3.line().x(r => x(r.t)).y(r => yA(r.icg)).curve(d3.curveMonotoneX));
const ptA = g.selectAll("circle.ind").data(e).join("circle").attr("class", "ind").attr("cx", d => x(d.ti)).attr("cy", d => yA(d.indice)).attr("r", 4)
.attr("fill", "#fff").attr("stroke", AZ).attr("stroke-width", 2);
const trB = g.append("path").datum(e).attr("fill", "none").attr("stroke", AM).attr("stroke-width", 2.2).attr("stroke-linejoin", "round")
.attr("d", d3.line().x(d => x(d.t)).y(d => yB(d.voto_gobierno_pct)));
const ptB = g.selectAll("circle.voto").data(e).join("circle").attr("class", "voto").attr("cx", d => x(d.t)).attr("cy", d => yB(d.voto_gobierno_pct)).attr("r", 4.5)
.attr("fill", d => d.tipo === "PASO" ? "#fff" : AM).attr("stroke", d => d.tipo === "PASO" ? AM : "#fff").attr("stroke-width", 2);
let ultX = -99;
e.filter(d => d.tipo !== "PASO").forEach(d => {
const px = x(d.t);
if (px - ultX < 34) return;
ultX = px;
g.append("text").attr("class", "etq").attr("x", px).attr("y", yB(d.voto_gobierno_pct) - 9).attr("text-anchor", "middle").text(n0(d.voto_gobierno_pct) + "%");
});
const fin = g.append("g"), uA = s[s.length - 1], uB = e[e.length - 1];
[[yA(uA.icg), AZ, angosto ? "Confianza" : "Confianza", n2(uA.icg)], [yB(uB.voto_gobierno_pct), AM, angosto ? "Voto" : "Voto al gobierno", pct(uB.voto_gobierno_pct)]].forEach(([yy, c, lab, v]) => {
const t = fin.append("text").attr("x", iw + 8).attr("y", yy - 4).attr("class", "etq-fuerte").style("fill", c === AM ? css("--ink") : c);
t.append("tspan").text(lab);
t.append("tspan").attr("x", iw + 8).attr("dy", 15).attr("class", "etq-suave").text(v);
});
const leerEl = d => `<b>${elecTx(d)}</b><span><i style="background:${AM}"></i>${d.candidatura_gobierno} ${pct(d.voto_gobierno_pct)}${d.salio_primero ? ", la más votada" : ""}</span>` +
`<span><i style="background:${AZ}"></i>Confianza en ${mesPer(d.mes_indice)} ${n2(d.indice)}</span>`;
const leerMes = r => `<b>${mesPer(r.mes)}</b><span><i style="background:${AZ}"></i>Confianza ${n2(r.icg)}${r.presidente ? ", gobierno de " + r.presidente : ""}</span>`;
lec.html(leerEl(e[e.length - 1]));
if (anim) {
trazar(trA); trazar(trB);
aparecer(ptA, 150); aparecer(ptB, 150);
}
const regla = g.append("line").attr("y1", 0).attr("y2", ih).attr("stroke", css("--faint")).attr("opacity", 0);
const marca = g.append("circle").attr("r", 4.5).attr("fill", AZ).attr("stroke", "#fff").attr("stroke-width", 2).attr("opacity", 0);
const leerEn = ev => {
const [mx] = d3.pointer(ev), xv = x.invert(mx);
const el2 = d3.least(e, d => Math.abs(d.t - xv));
if (el2 && Math.abs(el2.t - xv) < 2 / 12) {
regla.attr("x1", x(el2.t)).attr("x2", x(el2.t)).attr("opacity", 1);
marca.attr("cx", x(el2.ti)).attr("cy", yA(el2.indice)).attr("opacity", 1);
ptB.attr("r", d => d === el2 ? 6.5 : 4.5);
return lec.html(leerEl(el2));
}
const r = d3.least(s, r => Math.abs(r.t - xv));
regla.attr("x1", x(r.t)).attr("x2", x(r.t)).attr("opacity", 1);
marca.attr("cx", x(r.t)).attr("cy", yA(r.icg)).attr("opacity", 1);
ptB.attr("r", 4.5);
lec.html(leerMes(r));
};
C.svg.style("touch-action", "pan-y");
g.append("rect").attr("width", iw).attr("height", ih).attr("fill", "transparent")
.on("pointerdown", leerEn).on("pointermove", leerEn)
.on("pointerleave", ev => {
if (ev.pointerType !== "mouse") return;
regla.attr("opacity", 0); marca.attr("opacity", 0); ptB.attr("r", 4.5); lec.html(leerEl(e[e.length - 1]));
});
}
MED["confianza-gobierno"] = "serie";
DIB["confianza-gobierno"] = conTablas("confianza-gobierno", ["confianza_gobierno"], a => {
const el = G("confianza-gobierno"), C = R.confianza_gobierno;
if (MED["confianza-gobierno"] === "elecciones") {
const E = C.elecciones, elec = x => x.tipo === "PASO" ? `las PASO de ${x.anio}` : `la primera vuelta de ${x.anio}`;
const grado = fuerza(E.r);
const rel = E.r >= .4 ? `Las dos líneas suben y bajan juntas: en las ${E.n} elecciones presidenciales entre ${E.desde} y ${E.hasta}, la candidatura del gobierno tendió a sacar ` +
`más votos cuando la confianza en el gobierno del mes anterior era más alta. La relación es ${grado} (correlación de ${n2(E.r)})`
: E.r <= -.4 ? `Las dos líneas van en sentido contrario: en las ${E.n} elecciones presidenciales entre ${E.desde} y ${E.hasta}, la candidatura del gobierno tendió a sacar ` +
`menos votos cuando la confianza en el gobierno del mes anterior era más alta. La relación es ${grado} (correlación de ${n2(E.r)})`
: `En las ${E.n} elecciones presidenciales entre ${E.desde} y ${E.hasta} no hubo una relación clara entre la confianza en el gobierno del mes anterior ` +
`y el voto a la candidatura del gobierno (correlación de ${n2(E.r)})`;
$t("confianza-gobierno").textContent = `${rel}. Antes de ${elec(E.max)} el índice estaba en ${n2(E.max.indice)}, el más alto antes de una elección, y ` +
`${E.max.cand} sacó el ${pct(E.max.voto)} de los votos positivos. Antes de ${elec(E.min)} estaba en ${n2(E.min.indice)}, el más bajo, y ${E.min.cand} sacó el ` +
`${pct(E.min.voto)}. La candidatura del gobierno fue la más votada en ${E.primero} de las ${E.n} elecciones. Que el índice y el voto vayan juntos no muestra que uno cause el otro.`;
return icgElecciones(el, T.confianza_gobierno_elecciones, T.confianza_gobierno, a);
}
if (MED["confianza-gobierno"] === "gobiernos") {
const filas = T.confianza_gobierno_gobiernos, u = filas[filas.length - 1];
const corto = n => (C.cambios.find(c => c.presidente === n) || {}).corto || n;
$t("confianza-gobierno").textContent = `Promedio mensual del índice con cada gobierno, en la escala de 0 a 5: ` +
lista(filas.map(f => `${f.presidente} (${n2(f.promedio)})`)) + `. El gobierno actual lleva ${u.meses} meses en la serie, así que su promedio ` +
`todavía no abarca un mandato completo. El promedio de toda la serie es ${n2(C.promedio)}.`;
return barrasH(el, {anim: a, data: filas.map(f => ({codigo_indec: f.presidente, territorio: f.presidente, v: f.promedio, f})), k: "v", vf: n2, af: n1,
ref: C.promedio, refLab: `Promedio ${n2(C.promedio)}`, marcar: new Set(), sinOrden: true, l: 230, lAngosto: 130, corto: d => corto(d.territorio),
color: () => css("--celeste-fuerte"),
tip: d => `<b>${d.territorio}</b><br>Promedio ${n2(d.v)}, ${d.f.meses} meses (${mesPer(d.f.desde)} a ${mesPer(d.f.hasta)})<br>Primeros doce meses ${n2(d.f.primeros_12)}` +
`<br>Mínimo ${n2(d.f.minimo)} y máximo ${n2(d.f.maximo)}`});
}
const comp = C.hace_un_anio == null ? "" : C.hace_un_anio === C.v ? ", igual que un año antes" : `, contra ${n2(C.hace_un_anio)} un año antes`;
$t("confianza-gobierno").textContent = `En ${mesPer(C.mes)} el Índice de Confianza en el Gobierno fue de ${n2(C.v)} en una escala de 0 a 5${comp}. Es una encuesta: un cambio de pocas centésimas puede no ser significativo. ` +
`Desde ${mesPer(C.desde)}, el valor más alto fue ${n2(C.max.v)}, en ${mesPer(C.max.mes)}, con ${C.max.presidente}, y el más bajo, ${n2(C.min.v)}, ` +
`en ${mesPer(C.min.mes)}, con ${C.min.presidente}. El promedio de toda la serie es ${n2(C.promedio)}.`;
lineas(el, {anim: a, data: T.confianza_gobierno.map(r => ({...r, t: tPer(r.mes)})), x: "t", y0: 0, y1: 5, mensual: true, vf: n2, yf: n0,
xl: r => `${mesPer(r.mes)}${r.presidente ? ", " + r.presidente : ", cambio de gobierno"}`,
eventos: C.cambios.map(c => ({x: tPer(c.mes), lab: c.corto, corto: c.corto.replace("Fernández de Kirchner", "Fernández de K.")})),
series: [{k: "icg", lab: "Confianza en el gobierno", corto: "Índice", c: css("--celeste-fuerte"), w: 2.4}]});
});
const TRS = T.transferencias_serie, TRA = T.transferencias_acumulado;
const TR_COL = {atn: "#2C74B5", otras: "#74ACDF", ley: "#C3CAD2"};
const TR_LAB = {atn: "ATN", otras: "Otras no automáticas", ley: "Por ley o por fallo"};
const trOpciones = sel => { $(sel).innerHTML = [`<option value="serie">Total del país por año</option>`, `<option value="acum">Por provincia, suma por habitante de ${TRR.desde} a ${TRR.ult}</option>`,
...d3.range(TRR.ult, TRR.desde - 1, -1).map(a => `<option value="${a}">Por provincia, ${a}</option>`)].join(""); };
trOpciones("atn-sel"); trOpciones("tr-sel");
MED.atn = "serie"; MED.transferencias = String(TRR.ult);
["atn", "tr"].forEach(id => $(`${id}-sel`).addEventListener("change", ev => {
const g = id === "atn" ? "atn" : "transferencias"; MED[g] = ev.target.value; cambiarVista(g); }));
TX["atn-nota"] = $t("atn-nota").textContent = `Descontada la inflación con el deflactor del PBI, en pesos de ${TRR.ult}. La tabla por provincia está en millones de pesos y el total por año, en miles de millones. Crédito devengado del presupuesto nacional, con la provincia de destino. Incluye los ATN a provincias y municipios. ` +
`Los ATN salen del Fondo de Aportes del Tesoro Nacional, que se forma con parte de la coparticipación y que el gobierno nacional reparte sin fórmula. Desde 2017 el presupuesto los identifica como actividad propia. ` +
`Entre 2002 y 2016 se toman los del programa de asistencia financiera a provincias del Ministerio del Interior financiados con ese fondo. Antes de 2000 casi todos figuran sin provincia, por eso la serie empieza ese año. ` +
`Por habitante con las proyecciones de población del INDEC de cada año. La suma del período es la suma de lo recibido por habitante en cada año.`;
TX["transferencias-nota"] = $t("transferencias-nota").textContent = `Descontada la inflación con el deflactor del PBI, en pesos de ${TRR.ult}. La tabla por provincia está en millones de pesos y el total por año, en miles de millones. Crédito devengado del presupuesto nacional en transferencias corrientes y de capital a gobiernos provinciales y municipales, con la provincia de destino. ` +
`No incluye la coparticipación ni las demás transferencias automáticas, que no pasan por el presupuesto. Se separan las fijadas por ley o por fallo judicial: coparticipación de la Ciudad y de Tierra del Fuego cuando pasaba por el presupuesto, Fondo Federal Solidario, ` +
`Fondo Nacional de Incentivo Docente, devolución del 15% de la coparticipación, policía de la Ciudad y cautelar de la Corte Suprema a favor de la Ciudad. Las otras no automáticas incluyen obras, vivienda, programas sociales y de salud y la asistencia financiera del Tesoro. Por provincia se muestran las otras no automáticas por habitante.`;
function trProvincias(el, k, anio, a) {
const acum = anio === "acum", data = acum ? TRA : T.transferencias_provincias.filter(d => d.anio === +anio);
barrasH(el, {anim: a, data, k: `${k}_hab`, vf: n0, af: v => v >= 1e6 ? `${n1(v / 1e6)} M` : v >= 1e3 ? `${n0(v / 1e3)} mil` : n0(v),
color: () => TR_COL[k], l: 150, ntAngosto: 2});
return data;
}
DIB.atn = conTablas("atn", () => /^\d+$/.test(MED.atn) ? ["transferencias_provincias"] : [], a => {
const v = MED.atn, el = G("atn"), t = document.querySelector('[data-t="atn"]');
document.getElementById("atn-sel").value = v;
if (v === "serie") {
t.textContent = `El año con más ATN fue ${TRR.atn_pico_anio}, con ${milM(TRR.atn_pico_v)} de pesos de ${TRR.ult}. En ${TRR.ult} se repartieron ${milM(TRR.atn_ult)} entre ${TRR.n_atn_ult} provincias. ` +
`La ley 23.548 los destina a emergencias y desequilibrios financieros de las provincias y no fija una fórmula para repartirlos.`;
columnasApiladas(el, {anim: a, data: TRS, claves: [{k: "atn", lab: "ATN", c: TR_COL.atn}], cadaTick: 5, unidad: `mil millones de pesos de ${TRR.ult}`, vf: n1, af: n0});
return;
}
const data = trProvincias(el, "atn", v, a);
if (v === "acum") {
t.textContent = `Sumando lo recibido por habitante entre ${TRR.desde} y ${TRR.ult}, ${TRR.atn_acum_max} fue la que más ATN recibió (${n0(TRR.atn_acum_max_v)} pesos de ${TRR.ult} por habitante) y ${TRR.atn_acum_min}, la que menos (${n0(TRR.atn_acum_min_v)}). ` +
`La provincia de Buenos Aires recibió el ${pct(TRA.find(d => d.codigo_indec === "06").atn_pct)} de los ATN del período y tiene el ${pct(TRA.find(d => d.codigo_indec === "06").pob_pct)} de la población del país.`;
return;
}
const con = data.filter(d => d.atn > 0).sort((p, q) => q.atn_hab - p.atn_hab), sin = data.filter(d => d.atn === 0).map(d => d.territorio);
const tot = TRS.find(d => d.anio === +v).atn;
t.textContent = con.length
? `En ${v} el gobierno nacional repartió ${milM(tot)} de pesos de ${TRR.ult} en ATN entre ${con.length} provincias. Por habitante, la que más recibió fue ${con[0].territorio} (${n0(con[0].atn_hab)} pesos) ` +
`y la que menos, ${con[con.length - 1].territorio} (${n0(con[con.length - 1].atn_hab)}).` + (sin.length ? ` No recibieron ATN: ${listaY(sin)}.` : "")
: `En ${v} no hubo ATN asignados a provincias.`;
});
DIB.transferencias = conTablas("transferencias", () => /^\d+$/.test(MED.transferencias) ? ["transferencias_provincias"] : [], a => {
const v = MED.transferencias, el = G("transferencias"), t = document.querySelector('[data-t="transferencias"]'), ley = document.getElementById("tr-ley");
document.getElementById("tr-sel").value = v;
if (v === "serie") {
const cl = ["otras", "atn", "ley"].map(k => ({k, lab: TR_LAB[k], c: TR_COL[k]}));
ley.hidden = false; ley.innerHTML = cl.map(k => `<span><i style="background:${k.c}"></i>${k.lab}</span>`).join("");
t.textContent = `Las transferencias no automáticas, sin contar los ATN, llegaron a su máximo en ${TRR.otras_pico_anio}, con ${milM(TRR.otras_pico_v)} de pesos de ${TRR.ult}. En ${TRR.ult} fueron ${milM(TRR.otras_ult)}.`;
columnasApiladas(el, {anim: a, data: TRS, claves: cl, cadaTick: 5, unidad: `mil millones de pesos de ${TRR.ult}`, vf: n1, af: n0});
return;
}
ley.hidden = true;
const data = trProvincias(el, "otras", v, a).slice().sort((p, q) => q.otras_hab - p.otras_hab);
const pais = v === "acum" ? null : d3.sum(data, d => d.otras) * 1e6 / d3.sum(data, d => d.pob);
t.textContent = v === "acum"
? `Sumando lo recibido por habitante entre ${TRR.desde} y ${TRR.ult}, ${data[0].territorio} fue la que más transferencias no automáticas recibió sin contar los ATN (${n0(data[0].otras_hab)} pesos de ${TRR.ult} por habitante) y ${data[data.length - 1].territorio}, la que menos (${n0(data[data.length - 1].otras_hab)}).`
: `En ${v}, las transferencias no automáticas sin contar los ATN fueron de ${n0(pais)} pesos de ${TRR.ult} por habitante en el promedio del país. La que más recibió fue ${data[0].territorio}, con ${n0(data[0].otras_hab)} por habitante, y la que menos, ${data[data.length - 1].territorio}, con ${n0(data[data.length - 1].otras_hab)}.`;
});
const ORIGEN_COLOR = {"Ciudad de Buenos Aires": "#2C74B5", "Conurbano": "#74ACDF", "Resto de Buenos Aires": "#A9CBEA", "Otras provincias": "#F6B40E", "Otro país": "#98A2AE"};
const ORIGEN_TEXTO = {"Ciudad de Buenos Aires": "#fff", "Conurbano": "#18212B", "Resto de Buenos Aires": "#18212B", "Otras provincias": "#18212B", "Otro país": "#18212B"};
const origenLab = k => k === "Ciudad de Buenos Aires" ? "CABA" : k;
const leyOrigen = ks => ks.map(k => `<span><i style="background:${ORIGEN_COLOR[k]}"></i>${origenLab(k)}</span>`).join("");
const GBR = R.gabinetes;
const apellido = n => ({"Cristina Fernández de Kirchner": "Fernández de Kirchner", "Adolfo Rodríguez Saá": "Rodríguez Saá", "Fernando de la Rúa": "De la Rúa",
"Interinos de 2001": "Interinos de 2001"})[n] || n.split(" ").slice(-1)[0];
const prEspacio = p => /^Unión Cívica Radical/.test(p) ? "UCR y aliados" : /^Partido Justicialista/.test(p) ? "Peronismo" : /^Propuesta Republicana/.test(p) ? "PRO"
: /Libertad Avanza/.test(p) ? "La Libertad Avanza" : "Otras fuerzas";
const prColor = d => ESP_COLOR[prEspacio(d.partido)];
const prTexto = d => prEspacio(d.partido) === "PRO" ? "#18212B" : "#fff";
const iniciales = n => n.split(" ").filter(w => /^[A-ZÁÉÍÓÚÑ]/.test(w)).map(w => w[0]).join("");
const prAnios = d => `${d.inicio.slice(0, 4)}${d.fin && d.fin.slice(0, 4) === d.inicio.slice(0, 4) ? "" : ` a ${d.fin ? d.fin.slice(0, 4) : "hoy"}`}`;
DIB.presidentes = a => {
const P = T.presidentes, el = G("presidentes");
document.querySelector('[data-t="presidentes"]').textContent = `De los ${PRR.n} presidentes desde 1983, contando a los interinos de 2001, ${PRR.amba} nacieron en el Área Metropolitana de Buenos Aires (AMBA), ` +
`donde vive el ${pct(PRR.amba_pob)} de la población: ${listaY(PRR.amba_nombres.map(apellido))}. Entre ellos gobernaron ${n1(PRR.anios_amba)} de los ${n1(PRR.anios)} años, ` +
`el ${pct(PRR.pct_tiempo_amba)} del tiempo. Los ${PRR.n} nacieron en ${PRR.prov_distintas} jurisdicciones distintas.`;
const espacios = [...new Set(P.map(d => prEspacio(d.partido)))];
document.getElementById("pr-ley").innerHTML = espacios.map(k => `<span><i style="background:${ESP_COLOR[k]}"></i>${k}</span>`).join("");
const angosto = el.clientWidth < 520, C = lienzo(el, 98, {t:8, r:4, b:26, l:4}), {g, iw} = C;
const t0 = new Date(P[0].inicio), t1 = new Date();
const x = d3.scaleTime().domain([t0, t1]).range([0, iw]);
const fin = d => d.fin ? new Date(d.fin) : t1;
const ancho = d => x(fin(d)) - x(new Date(d.inicio));
const r = g.append("g").attr("clip-path", recorte(C.svg, 0, 0, iw, 38, RADIO_BARRA)).selectAll("rect").data(P).join("rect").attr("x", d => x(new Date(d.inicio))).attr("y", 0).attr("height", 38)
.attr("width", d => Math.max(1.5, ancho(d) - 1)).attr("fill", prColor);
const letra = angosto ? 11 : 12, medir = g.append("text").attr("font-size", letra).attr("font-weight", 600);
const largo = s => { medir.text(s); return medir.node().getComputedTextLength(); };
const entra = new Set(P.filter(d => ancho(d) >= largo(iniciales(d.nombre)) + 5));
medir.remove();
g.selectAll("text.n").data(P.filter(d => entra.has(d))).join("text").attr("class", "n").attr("text-anchor", "middle").attr("font-weight", 600)
.attr("x", d => x(new Date(d.inicio)) + ancho(d) / 2).attr("y", 23).attr("font-size", letra).attr("fill", prTexto).text(d => iniciales(d.nombre));
const grupos = [];
for (const d of P) {
if (entra.has(d)) continue;
const u = grupos.at(-1);
if (u && P.indexOf(u.at(-1)) === P.indexOf(d) - 1) u.push(d); else grupos.push([d]);
}
for (const gr of grupos) {
const x0 = x(new Date(gr[0].inicio)), x1 = x(fin(gr.at(-1))), xm = (x0 + x1) / 2;
const txt = listaY(gr.map(d => iniciales(d.nombre)));
g.append("line").attr("x1", xm).attr("x2", xm).attr("y1", 39).attr("y2", 44).attr("stroke", "var(--ink)").attr("stroke-width", 1);
const tx = g.append("text").attr("y", 56).attr("font-size", 11).attr("fill", "var(--ink)").text(txt);
const w = tx.node().getComputedTextLength();
tx.attr("x", Math.max(0, Math.min(iw - w, xm - w / 2)));
}
g.append("g").attr("class","eje").attr("transform","translate(0,64)").call(d3.axisBottom(x).ticks(angosto ? 4 : 8).tickSize(0).tickPadding(8)).call(s => s.select(".domain").remove());
if (a) r.attr("opacity", 0).transition().delay(escalon).duration(DUR_G).attr("opacity", 1);
r.on("pointerenter", (ev, d) => mostrarTip(el, `<b>${d.nombre} (${iniciales(d.nombre)})</b><br>${d.partido}<br>${prAnios(d)}<br>Nació en ${d.provincia.startsWith("Ciudad") ? "CABA" : `${d.lugar_nacimiento}, ${d.provincia}`}`,
4 + x(new Date(d.inicio)) + ancho(d) / 2, 8)).on("pointerleave", ocultarSiMouse);
document.getElementById("pr-lista").innerHTML = P.map(d => `<li><i style="background:${prColor(d)}"></i>${bandera(COD_PROV[d.provincia])}<span>${d.nombre} (${iniciales(d.nombre)})${d.interino ? ", interino" : ""}, ${prAnios(d)}</span>` +
`<small>${d.lugar_nacimiento === d.provincia || d.provincia.startsWith("Ciudad") ? d.provincia.replace("Ciudad Autónoma de Buenos Aires", "CABA") : `${d.lugar_nacimiento}, ${d.provincia}`}</small></li>`).join("");
};
MED.ministros = "gobierno";
let miTabla = null;
TABLA_PROPIA["f-ministros"] = () => miTabla ||= d3.csv("datos/ministros_nacionales.csv").catch(e => { miTabla = null; throw e; });
DIB.ministros = a => {
document.querySelector('[data-t="ministros"]').textContent = `De las ${GBR.personas} personas que fueron ministros o jefes de gabinete desde 1983, se conoce el lugar de nacimiento de ${GBR.con_dato}. ` +
`El ${pct(GBR.pct_amba)} nació en el Área Metropolitana de Buenos Aires (AMBA), donde vive el ${pct(PRR.amba_pob)} de la población. En CABA nacieron ${GBR.caba}. ` +
(GBR.max_gob.length > 1 ? `Los gabinetes con más nacidos en el AMBA fueron los de ${listaY(GBR.max_gob.map(apellido))} (${pct(GBR.max_gob_v)} cada uno)` : `El gabinete con más nacidos en el AMBA fue el de ${apellido(GBR.max_gob[0])} (${pct(GBR.max_gob_v)})`) + ` y el que menos, sin contar a los interinos de 2001, el de ${apellido(GBR.min_gob)} (${pct(GBR.min_gob_v)}). ` +
(GBR.sin_ministro.length ? `Ninguna de esas personas nació en ${listaY(GBR.sin_ministro).replace(/ y ([^y]+)$/, " ni $1")}.` : "");
const ley = document.getElementById("mi-ley");
if (MED.ministros === "gobierno") {
const ks = Object.keys(ORIGEN_COLOR).filter(k => T.gabinetes_origen.some(d => d[k] > 0));
ley.innerHTML = leyOrigen(ks); ley.hidden = false;
const INTERINOS = T.presidentes.filter(p => p.interino && p.inicio.startsWith("2001"));
const presi = n => T.presidentes.find(p => p.nombre === n);
apiladasH(G("ministros"), {anim: a, claves: ks.map(k => ({k, lab: origenLab(k), c: ORIGEN_COLOR[k], texto: ORIGEN_TEXTO[k]})),
data: T.gabinetes_origen.map(d => ({...d, codigo_indec: d.gobierno, territorio: apellido(d.gobierno)})),
bandera: d => d.gobierno === "Interinos de 2001" ? INTERINOS.length : COD_PROV[presi(d.gobierno)?.provincia],
tipExtra: d => d.gobierno === "Interinos de 2001"
? "<br>" + INTERINOS.map(p => `${bandera(COD_PROV[p.provincia])} ${apellido(p.nombre)}, nacido en ${p.provincia.replace("Ciudad Autónoma de Buenos Aires", "CABA")}`).join("<br>")
: (p => p ? `<br>${bandera(COD_PROV[p.provincia])} Nacido en ${p.provincia.replace("Ciudad Autónoma de Buenos Aires", "CABA")}` : "")(presi(d.gobierno))});
} else {
ley.hidden = true;
barrasH(G("ministros"), {anim: a, data: T.ministros_provincias, k: "ministros", vf: n0, af: n0});
}
};
DIB.representacion = a => {
const rp = T.representacion_provincias, prom = d3.sum(rp, d => d.poblacion) / 257;
document.querySelector('[data-t="representacion"]').textContent = `Cada jurisdicción elige al menos cinco diputados y tres senadores, sin importar su población, y el reparto de los diputados todavía sigue el censo de 1980. ` +
`Por eso en ${CG.rep_min} hay una banca de diputado cada ${n0(CG.rep_min_v)} habitantes y en ${CG.rep_max}, una cada ${n0(CG.rep_max_v)}. ` +
`Sumando las dos cámaras, ${CG.peso_max} tiene ${n1(CG.peso_max_v)} veces las bancas que le corresponderían por su población y ${CG.peso_min}, ${n2(CG.peso_min_v)} veces.`;
barrasH(G("representacion"), {anim: a, data: rp, k: "hab_por_diputado", ref: prom, refLab: `País ${n0(prom)}`, vf: v => n0(v), af: v => n0(v / 1000) + " mil"});
};
};
