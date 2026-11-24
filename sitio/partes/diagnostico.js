window.DATINA_PARTES = window.DATINA_PARTES || {};
window.DATINA_PARTES["diagnostico"] = () => {
(() => {
const selTema = document.getElementById("dx-tema");
if (!selTema) return;
const RD = R.diagnostico, DX = Object.fromEntries(T.aprender_diagnostico.map(f => [f.codigo_indec, f]));
const CR = Object.fromEntries(T.cruces_provincias.map(f => [f.codigo_indec, f]));
const P24 = PROV.map(([c]) => c), MAX = 6, MIN = RD.min, AP = `Aprender ${RD.anio}, Secretaría de Educación`;
const r1 = x => +x.toFixed(1);
const IND = {
mat: {nombre: "Aprender, matemática", corto: "matemática en Aprender", v: c => DX[c]?.mat_logra, pais: DX["00"].mat_logra, anio: RD.anio, cita: AP,
ficha: "#f-aprender", dist: "aprender_provincias.mat_logra", que: "de los estudiantes de 6° grado alcanzó el nivel satisfactorio o avanzado en matemática"},
len: {nombre: "Aprender, lengua", corto: "lengua en Aprender", v: c => DX[c]?.len_logra, pais: DX["00"].len_logra, anio: RD.anio, cita: AP,
ficha: "#f-aprender", dist: "aprender_provincias.len_logra", que: "de los estudiantes de 6° grado alcanzó el nivel satisfactorio o avanzado en lengua"},
sob: {nombre: "Sobreedad en 6° grado", corto: "sobreedad en 6° grado", v: c => DX[c]?.sobreedad, pais: DX["00"].sobreedad, anio: RD.anio, cita: AP,
que: "de los estudiantes de 6° grado tiene al menos un año más que la edad teórica, que es de 11 años"},
esc: {nombre: "Escolarización secundaria", corto: "escolarización secundaria", v: c => DX[c]?.esc_hasta, pais: DX["00"].esc_hasta, anio: RD.esc_hasta,
cita: `Relevamiento Anual, Secretaría de Educación, ${RD.esc_hasta}`, ficha: "#f-escolarizacion",
que: "de los adolescentes en edad de ir a la secundaria está matriculado en ese nivel (tasa neta)"},
int: {nombre: "Internet en el hogar", corto: "internet en el hogar", v: c => CR[c]?.internet, pais: nv.censo.internet, anio: 2022, cita: "INDEC, Censo 2022",
ficha: "#f-censo", que: "de los hogares tiene internet"},
com: {nombre: "Computadora en el hogar", corto: "computadora en el hogar", v: c => CR[c]?.computadora, pais: nv.censo.computadora, anio: 2022,
cita: "INDEC, Censo 2022", ficha: "#f-censo", que: "de los hogares tiene computadora, notebook o tableta"},
adu: {nombre: "Adultos con secundario completo", corto: "adultos con secundario completo", v: c => CR[c]?.pct_25mas_secundario_completo_o_mas,
pais: RD.adultos_pais, anio: 2022, cita: "INDEC, Censo 2022", ficha: "#f-adolescentes-nse", que: "de las personas de 25 años o más terminó la secundaria"},
};
const TEMAS = [
{id: "mat", nombre: "Matemática en 6° grado", ind: ["mat"], area: "mat"},
{id: "len", nombre: "Lengua en 6° grado", ind: ["len"], area: "len"},
{id: "sob", nombre: "Sobreedad en 6° grado", ind: ["sob"], area: "sob"},
{id: "esc", nombre: "Adolescentes en la secundaria", ind: ["esc"]},
{id: "con", nombre: "Internet y computadora en casa", ind: ["int", "com"]},
{id: "adu", nombre: "Adultos con secundario completo", ind: ["adu"]},
];
const ST = Object.fromEntries(Object.entries(IND).map(([k, ind]) => {
const vals = P24.map(ind.v).filter(v => v != null), m = d3.mean(vals);
return [k, {vals, sd: Math.sqrt(d3.sum(vals, v => (v - m) ** 2) / (vals.length - 1))}];
}));
const puesto = (k, c) => { const v = IND[k].v(c); return v == null ? null : 1 + ST[k].vals.filter(x => x > v).length; };
const dif = (k, c) => r1(IND[k].v(c)) - r1(IND[k].pais);
const vsPais = (k, c) => {
const d = dif(k, c);
return Math.abs(d) < .05 ? `Igual al total del país (${pct(IND[k].pais)}).` : `${n1(Math.abs(d))} puntos ${d > 0 ? "más" : "menos"} que el total del país (${pct(IND[k].pais)}).`;
};
const unos = x => n0(x < 1000 ? Math.round(x / 10) * 10 : Math.round(x / 100) * 100);
const cita = k => ` <cite>${IND[k].cita}</cite>` + (IND[k].ficha ? ` <a class="enlace" href="${destinoDe(IND[k].ficha) || IND[k].ficha}">Ver la ficha</a>` : "");
const motivo = (k, c) => IND[k].dist && DIST[IND[k].dist]?.[NOMBRES[c]]?.motivo;
const unidad = c => c === "02" ? "comunas" : c === "06" ? "partidos" : "departamentos";
let DEP = null, tema = "mat", sel = [];
const q = new URLSearchParams(location.search);
if (TEMAS.some(t => t.id === q.get("dx"))) tema = q.get("dx");
sel = (q.get("dp") || "").split(",").filter((c, i, a) => NOMBRES[c] && a.indexOf(c) === i).slice(0, MAX);
if (!q.has("dp") && prov && NOMBRES[prov]) sel = [prov];
const tm = () => TEMAS.find(t => t.id === tema);
function dentro(c, area) {
const f = DX[c], col = area === "sob" ? "sobreedad" : area + "_logra", out = [];
const v = s => f[`${col}_${s}`];
if (v("estatal") != null && v("privado") != null)
out.push(`Escuelas estatales ${pct(v("estatal"))} y privadas ${pct(v("privado"))}. En las estatales, el ${pct(f.nse_q1_estatal)} de los estudiantes pertenece al 20% del país con menor nivel socioeconómico, y en las privadas el ${pct(f.nse_q1_privado)}.`);
else if (v("estatal") != null) out.push(`Las escuelas privadas tienen menos de ${MIN} estudiantes de 6° grado: no se muestra su porcentaje.`);
if (v("urbano") != null && v("rural") != null) out.push(`Escuelas urbanas ${pct(v("urbano"))} y rurales ${pct(v("rural"))}.`);
else if (f.n_rural > 0) out.push(`Las escuelas rurales tienen menos de ${MIN} estudiantes de 6° grado: no se muestra su porcentaje.`);
if (c !== "00" && area !== "sob" && DEP) {
const deps = DEP.filter(d => d.codigo_indec === c), con = deps.filter(d => d[col] != null).sort((a, b) => b[col] - a[col]);
const chicos = deps.length - con.length;
if (con.length > 1)
out.push(`Entre sus ${con.length} ${unidad(c)} con ${MIN} estudiantes o más, el valor va de ${pct(con[0][col])} en ${con[0].departamento} a ${pct(con[con.length - 1][col])} en ${con[con.length - 1].departamento}.` +
(chicos ? ` ${chicos === 1 ? "Otro tiene" : `Otros ${chicos} tienen`} menos estudiantes y no se ${chicos === 1 ? "muestra" : "muestran"}.` : ""));
}
if (area !== "sob") out.push(`Unos ${unos(f[area + "_debajo_n"])} estudiantes de 6° grado quedaron por debajo del nivel básico, el ${pct(f[area + "_debajo"])}.`);
return out;
}
function resumenProv(c) {
const ks = Object.keys(IND).filter(k => IND[k].v(c) != null), altos = [], bajos = [];
ks.forEach(k => { const p = puesto(k, c), n = ST[k].vals.length; if (p <= 5) altos.push(IND[k].corto); else if (p > n - 5) bajos.push(IND[k].corto); });
const lejos = ks.map(k => ({k, z: dif(k, c) / ST[k].sd})).sort((a, b) => Math.abs(b.z) - Math.abs(a.z))[0];
const t = [];
if (altos.length) t.push(`Está entre las cinco provincias con valores más altos en ${lista(altos)}.`);
if (bajos.length) t.push(`Está entre las cinco con valores más bajos en ${lista(bajos)}.`);
if (lejos && Math.abs(lejos.z) >= .1) t.push(`Su mayor distancia con el total del país, en relación con cuánto varían las provincias en cada indicador, está en ${IND[lejos.k].corto}, ${lejos.z > 0 ? "por encima" : "por debajo"}.`);
return t.join(" ");
}
const tabla = c => `<div class="tabla-desliza"><table class="tabla-areas dx-tabla"><caption class="solo-lector">Indicadores de educación de ${NOMBRES[c]}</caption>` +
`<thead><tr><th>Indicador</th><th class="n">Valor</th><th class="n">Puesto</th><th class="n">Todo el país</th></tr></thead><tbody>` +
Object.keys(IND).filter(k => IND[k].v(c) != null).map(k => `<tr${tm().ind.includes(k) ? ' class="elegida"' : ""}><td>${IND[k].nombre}<small>${IND[k].cita}</small></td>` +
`<td class="n" data-l="Valor">${pct(IND[k].v(c))}</td><td class="n" data-l="Puesto">${puesto(k, c)} de ${ST[k].vals.length}</td><td class="n" data-l="Todo el país">${pct(IND[k].pais)}</td></tr>`).join("") +
`</tbody></table></div><p class="dx-pie-tabla">Puesto entre las 24 jurisdicciones, ordenadas de mayor a menor valor.</p>`;
function tarjeta(c) {
const t = tm(), avisos = new Set(t.ind.map(k => motivo(k, c)).filter(Boolean));
let h = `<article class="dx-prov"><h3>${conBandera(c, NOMBRES[c])}</h3>`;
avisos.forEach(m => { h += `<p class="dx-aviso">${NOMBRES[c]}: ${m}.</p>`; });
t.ind.forEach(k => {
h += `<p class="dx-cifra"><b>${pct(IND[k].v(c))}</b> ${IND[k].que}.</p>` +
`<p class="dx-pos">Puesto ${puesto(k, c)} de ${ST[k].vals.length}, de mayor a menor. ${vsPais(k, c)}${cita(k)}</p>`;
});
if (t.id === "esc") {
const f = DX[c];
h += `<p class="dx-linea">Entre ${RD.esc_desde} y ${RD.esc_hasta}, con la misma población de referencia, pasó de ${pct(f.esc_desde)} a ${pct(f.esc_hasta)}.` +
(f.esc_hasta >= 99.5 ? " Un valor cercano a 100 o mayor refleja diferencias entre la matrícula y la proyección de población." : "") + `</p>`;
}
if (t.area) h += `<h4>Dentro de la provincia</h4><ul class="dx-lista">${dentro(c, t.area).map(x => `<li>${x}</li>`).join("")}</ul>`;
h += `<h4>Sus indicadores de educación</h4>${tabla(c)}<p class="dx-linea">${resumenProv(c)}</p></article>`;
return h;
}
function tarjetaPais() {
const t = tm();
let h = `<article class="dx-prov dx-pais"><h3>${conBandera("00", "Todo el país")}</h3>`;
t.ind.forEach(k => {
const orden = P24.filter(c => IND[k].v(c) != null).sort((a, b) => IND[k].v(b) - IND[k].v(a));
const arriba = orden.filter(c => k !== "esc" || IND[k].v(c) < 99.5), afuera = orden.filter(c => !arriba.includes(c));
h += `<p class="dx-cifra"><b>${pct(IND[k].pais)}</b> ${IND[k].que}.</p><p class="dx-pos">Las provincias van de ${pct(IND[k].v(arriba[0]))} en ${NOMBRES[arriba[0]]} a ` +
`${pct(IND[k].v(orden[orden.length - 1]))} en ${NOMBRES[orden[orden.length - 1]]}` +
(afuera.length ? `, sin contar ${lista(afuera.map(c => NOMBRES[c]))}, con valores de 100 o cercanos por diferencias entre la matrícula y la proyección de población` : "") + `.${cita(k)}</p>`;
});
if (t.area) h += `<h4>Dentro del país</h4><ul class="dx-lista">${dentro("00", t.area).map(x => `<li>${x}</li>`).join("")}</ul>`;
return h + `<p class="dx-ayuda">Sumá una o más provincias arriba para ver su diagnóstico.</p></article>`;
}
function conjunto() {
const t = tm();
if (sel.length < 2 || !t.area) return "";
const n = d3.sum(sel, c => DX[c].n), tot = DX["00"].n;
let x = `Las ${sel.length} provincias elegidas reúnen unos ${unos(n)} estudiantes de 6° grado, el ${pct(n / tot * 100)} del país`;
if (t.area !== "sob") {
const d = d3.sum(sel, c => DX[c][t.area + "_debajo_n"]), dt = DX["00"][t.area + "_debajo_n"];
x += `, y unos ${unos(d)} de los que quedaron por debajo del nivel básico en ${t.area === "mat" ? "matemática" : "lengua"}, el ${pct(d / dt * 100)} de los de todo el país`;
}
return `<p class="dx-conjunto">${x}. <cite>${AP}</cite></p>`;
}
function contexto() {
const t = tm(), pz = R.pisa;
if (!["mat", "len"].includes(t.id)) return "";
const a = t.id === "mat" ? ["matemática", pz.mat, pz.ocde_mat] : ["lectura", pz.lec, pz.ocde_lec];
return `<p class="dx-contexto"><b>Contexto del país.</b> En PISA ${pz.anio}, que evalúa a estudiantes de 15 años y no tiene resultados por provincia, la Argentina obtuvo ${n0(a[1])} puntos en ${a[0]} y el promedio de los países de la OCDE, ${n0(a[2])}. <cite>OCDE, PISA</cite></p>`;
}
function noDice() {
const t = tm(), x = ["Describe posiciones y diferencias. No dice qué hacer ni por qué cada provincia está donde está."];
if (t.area) x.push("La diferencia entre escuelas estatales y privadas refleja también quiénes asisten a cada una: por eso va junto al nivel socioeconómico de sus estudiantes.",
`Aprender mide 6° grado de primaria en ${RD.anio}: no habla de toda la trayectoria escolar.`,
`Los grupos de menos de ${MIN} estudiantes no muestran porcentajes. La fuente oculta los departamentos más chicos, con unos ${unos(RD.enmascarados.alumnos)} estudiantes en total, que cuentan en su provincia pero no en la lista.`);
if (t.id === "esc") x.push(`La escolarización se compara desde ${RD.esc_desde}, porque ese año cambió la población de referencia.`);
if (["con", "adu"].includes(t.id)) x.push("El Censo 2022 es el último dato por provincia: no muestra lo que cambió después.");
if (sel.length) x.push(`Los indicadores de la tabla son de años distintos, entre 2022 y ${Math.max(RD.anio, RD.esc_hasta)}.`);
return x.map(y => `<li>${y}</li>`).join("");
}
const salida = document.getElementById("dx-salida"), eleg = document.getElementById("dx-elegidas"), sumar = document.getElementById("dx-sumar");
selTema.innerHTML = TEMAS.map(t => `<option value="${t.id}">${t.nombre}</option>`).join("");
function pintarControles() {
selTema.value = tema;
const lleno = sel.length >= MAX;
sumar.innerHTML = `<option value="">${lleno ? `Hasta ${MAX} provincias` : "Elegí una provincia"}</option>` +
PROV.map(([c, n]) => `<option value="${c}"${sel.includes(c) ? " disabled" : ""}>${n}</option>`).join("");
sumar.disabled = lleno;
eleg.innerHTML = sel.length
? `<ul class="dx-chips" aria-label="Provincias elegidas">${sel.map(c => `<li>${conBandera(c, NOMBRES[c])}<button type="button" class="dx-quitar" data-c="${c}" aria-label="Quitar ${NOMBRES[c]}">` +
`<svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M3 3l6 6M9 3l-6 6"/></svg></button></li>`).join("")}</ul>` +
(sel.length > 1 ? `<button type="button" class="enlace dx-limpiar">Quitar todas</button>` : "")
: `<p class="dx-vacio">Sin provincias elegidas: abajo se ve todo el país.</p>`;
}
function pintar(cambio) {
pintarControles();
salida.innerHTML = conjunto() + (sel.length ? sel.map(tarjeta).join("") : tarjetaPais()) + contexto();
document.getElementById("dx-no-dice").innerHTML = noDice();
const k = tm().ind[0];
document.getElementById("dx-grafico-tit").textContent = `${IND[k].nombre}, ${IND[k].anio}. Las 24 jurisdicciones, de mayor a menor`;
document.getElementById("dx-estado").textContent = `Diagnóstico de ${tm().nombre.toLowerCase()} para ${sel.length ? lista(sel.map(c => NOMBRES[c])) : "todo el país"}.`;
if (cambio) {
salida.animate([{opacity: 0}, {opacity: 1}], {duration: 200, easing: "cubic-bezier(.23,1,.32,1)"});
const el = G("diagnostico");
if (el && el.closest(".visto")) cambiarVista("diagnostico");
}
}
const guardar = () => { const u = new URL(location.href); u.searchParams.set("dx", tema); u.searchParams.set("dp", sel.join(",")); history.replaceState(history.state, "", u); };
selTema.addEventListener("change", () => { tema = selTema.value; guardar(); pintar(true); });
sumar.addEventListener("change", () => {
const c = sumar.value;
if (c && !sel.includes(c) && sel.length < MAX) { sel.push(c); guardar(); pintar(true); }
sumar.focus({preventScroll: true});
});
eleg.addEventListener("click", ev => {
const b = ev.target.closest(".dx-quitar"), todas = ev.target.closest(".dx-limpiar");
if (!b && !todas) return;
const i = b ? sel.indexOf(b.dataset.c) : -1;
sel = todas ? [] : sel.filter(c => c !== b.dataset.c);
guardar(); pintar(true);
const sig = eleg.querySelectorAll(".dx-quitar")[Math.min(Math.max(i, 0), sel.length - 1)];
(todas || !sig ? sumar : sig).focus({preventScroll: true});
});
DIB.diagnostico = a => {
const el = G("diagnostico"); if (!el) return;
const k = tm().ind[0];
barrasH(el, {anim: a, data: P24.map(c => ({codigo_indec: c, territorio: NOMBRES[c], v: IND[k].v(c)})).filter(d => d.v != null), k: "v",
vf: pct, af: v => v + "%", ref: IND[k].pais, refLab: `País ${pct(IND[k].pais)}`, marcar: new Set(sel)});
};
pintar(false);
cargarTabla("aprender_departamentos").then(t => { DEP = t; pintar(false); });
})();
};
