window.DATINA_PARTES = window.DATINA_PARTES || {};
window.DATINA_PARTES["inicio"] = () => {
async function mapa() {
const el = document.getElementById("mapa"), por = document.querySelector(".portada");
const caja = document.getElementById("portada-mapa"), ayuda = document.getElementById("mapa-ayuda");
let pendiente = !REDUCIR && por.classList.contains("armando"), vuelo = null;
const soltar = () => { clearTimeout(seguro); clearTimeout(vuelo); vuelo = null; pendiente = false; por.classList.remove("armando"); };
const seguro = setTimeout(soltar, 10000);
if (!pendiente) soltar();
const CENTRO = [-64, -38], DUR_P = 750, PASO_P = 50;
const azar = (c, k) => { const v = Math.sin(+c * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
const rompecabezas = (enlaces, camino, proy, bp) => {
pendiente = false;
const [cx, cy] = proy(CENTRO), alto = bp[1][1] - bp[0][1];
const piezas = enlaces.nodes().map(a => {
const d = d3.select(a).datum(), c = d.properties.codigo_indec, [x, y] = camino.centroid(d);
const ang = Math.atan2(y - cy, x - cx) + (azar(c, 1) - .5) * .6, lejos = alto * (.55 + .3 * azar(c, 2));
return {a, dist: d3.geoDistance(d3.geoCentroid(d), CENTRO), dx: Math.cos(ang) * lejos, dy: Math.sin(ang) * lejos, giro: (azar(c, 3) - .5) * 50};
}).sort((p, q) => q.dist - p.dist);
piezas.forEach((p, i) => {
const t = {delay: i * PASO_P, fill: "backwards"};
[p.a, ...(p.a.dataset.c === "94" ? [el.querySelector(".malvinas")] : [])].forEach(n => {
n.animate([{transform: `translate(${p.dx.toFixed(1)}px,${p.dy.toFixed(1)}px) rotate(${p.giro.toFixed(1)}deg)`}, {transform: "none"}],
{...t, duration: DUR_P, easing: "cubic-bezier(.16,1,.3,1)"});
n.animate([{opacity: 0}, {opacity: 1}], {...t, duration: 300, easing: "ease-out"});
});
});
vuelo = setTimeout(soltar, (piezas.length - 1) * PASO_P + DUR_P * .7);
};
let mundo;
try { [mundo] = await Promise.all([fetch("datos/mundo-110m.json").then(r => r.json()), cargarGeo()]); } catch (_) { soltar(); return; }
const paises = topojson.feature(mundo, mundo.objects.countries).features.filter(d => d.id !== "032" && d.id !== "238");
const esMalvinas = pol => d3.geoCentroid({type: "Polygon", coordinates: pol})[0] > -62;
const conMalvinas = GEO.features.find(f => f.properties.codigo_indec === "94");
const soloIslas = {type: "MultiPolygon", coordinates: conMalvinas.geometry.coordinates.filter(esMalvinas)};
const sinMalvinas = {...conMalvinas, geometry: {type: "MultiPolygon", coordinates: conMalvinas.geometry.coordinates.filter(p => !esMalvinas(p))}};
const provMapa = GEO.features.map(f => f === conMalvinas ? sinMalvinas : f);
const CON_MOUSE = matchMedia("(hover:hover) and (pointer:fine)").matches;
const AYUDA = CON_MOUSE ? "Hacé clic en una provincia para ver sus datos" : ayuda.textContent;
ayuda.textContent = AYUDA;
const lado = document.getElementById("mapa-lado"), EV_LADO = INDP.find(x => x.lab === "Esperanza de vida");
LADO_REPOSO = `<p class="ml-tit">Las 24 jurisdicciones</p><p class="ml-txt">${AYUDA}</p>`;
lado.innerHTML = LADO_REPOSO;
const ladoProv = c => {
const f = EV_LADO?.d.find(d => d.codigo_indec === c);
lado.innerHTML = `<p class="ml-tit">${conBandera(c, NOMBRES[c])}</p><p class="ml-txt">${f ? `Esperanza de vida: ${EV_LADO.f(f[EV_LADO.k])} ${EV_LADO.det}. ` : ""}${CON_MOUSE ? "Hacé clic" : "Tocá"} para ver más datos.</p>`;
};
const dibujar = (armar = false) => {
const W = por.clientWidth, H = por.clientHeight, angosto = W < 760;
const pr = por.getBoundingClientRect(), c = caja.getBoundingClientRect(), sl = document.getElementById("sol").getBoundingClientRect();
const x0 = c.left - pr.left, y0 = c.top - pr.top + (angosto ? 0 : 12);
const x1 = c.right - pr.left - (angosto ? 0 : sl.width * .55), y1 = c.bottom - pr.top - ayuda.offsetHeight - 10;
const proy = d3.geoAzimuthalEquidistant().rotate([64, 38]).clipAngle(179.9).fitExtent([[x0, y0], [x1, y1]], GEO);
if (!angosto) { const b0 = d3.geoPath(proy).bounds(GEO), t0 = proy.translate(); proy.translate([t0[0] + x0 + 8 - b0[0][0], t0[1]]); }
const camino = d3.geoPath(proy), svg = d3.select(el).attr("viewBox", `0 0 ${W} ${H}`);
const bp = camino.bounds(GEO);
ayuda.style.left = `${(bp[0][0] + bp[1][0]) / 2 - (c.left - pr.left)}px`;
ayuda.style.top = `${bp[1][1] - (c.top - pr.top) + 10}px`;
ZONA_MAPA = {der: bp[1][0] - (c.left - pr.left), arr: bp[0][1] - (c.top - pr.top), aba: bp[1][1] - (c.top - pr.top)};
caja.style.setProperty("--mapa-der", `${Math.round(ZONA_MAPA.der + 24)}px`);
svg.selectAll("*").remove();
svg.append("path").attr("class","grat").attr("d", camino(d3.geoGraticule().step([10, 10])()));
[10, 20, 30, 45, 60, 80, 100, 130, 160].forEach(r =>
svg.append("path").attr("class","anillo").attr("d", camino(d3.geoCircle().center([-64, -38]).radius(r)())));
svg.append("g").selectAll("path").data(paises).join("path").attr("class", "tierra").attr("d", camino);
const g = svg.append("g").attr("class", "provs");
const enlaces = g.selectAll("a").data(provMapa).join("a")
.attr("href", d => urlProv(d.properties.codigo_indec)).attr("tabindex", -1).attr("aria-label", d => `${NOMBRES[d.properties.codigo_indec]}: ver sus datos`)
.attr("data-c", d => d.properties.codigo_indec);
enlaces.append("path").attr("d", camino);
g.append("path").attr("class", "malvinas").attr("aria-hidden", "true").attr("d", camino(soloIslas));
const [cx, cy] = proy(d3.geoCentroid(GEO.features.find(f => f.properties.codigo_indec === "02")));
g.select('a[data-c="02"]').raise().append("circle").attr("cx", cx).attr("cy", cy).attr("r", angosto ? 6 : 5);
if (vuelo) soltar();
if (armar && pendiente) rompecabezas(enlaces, camino, proy, bp);
else if (pendiente) g.style("opacity", 0);
enlaces.on("pointerenter", (ev, d) => { const c = d.properties.codigo_indec; ayuda.innerHTML = conBandera(c, `${NOMBRES[c]}: ver sus datos`); ladoProv(c); })
.on("pointerleave", () => { ayuda.textContent = AYUDA; lado.innerHTML = LADO_REPOSO; })
.on("click", (ev, d) => { ev.preventDefault(); tarjetaMapa(d.properties.codigo_indec); });
marcarMapa();
el.classList.add("listo");
};
dibujar();
let armado = false;
const armar = () => { if (!armado) { armado = true; dibujar(true); } };
if (document.fonts) document.fonts.ready.then(() => armado ? dibujar() : armar()); else armar();
setTimeout(armar, 2500);
let ancho = por.clientWidth, t;
new ResizeObserver(() => { if (por.clientWidth === ancho) return; ancho = por.clientWidth; clearTimeout(t); t = setTimeout(dibujar, 150); }).observe(por);
}
let ZONA_MAPA = null, tarjetaM = null, LADO_REPOSO = "";
const MAPA_IND = ["Empleo privado registrado", "Esperanza de vida", "Mortalidad infantil", "Aprender, matemática"];
function tarjetaMapa(c) {
const caja = document.getElementById("portada-mapa");
if (!tarjetaM) {
tarjetaM = document.createElement("div"); tarjetaM.className = "mapa-tarjeta"; tarjetaM.setAttribute("role", "region");
caja.appendChild(tarjetaM);
tarjetaM.addEventListener("click", ev => { if (ev.target.closest(".mt-cerrar")) cerrarTarjetaMapa(); });
document.addEventListener("keydown", ev => { if (ev.key === "Escape") cerrarTarjetaMapa(); });
document.addEventListener("pointerdown", ev => { if (tarjetaM.classList.contains("abierta") && !tarjetaM.contains(ev.target) && !ev.target.closest("#mapa .provs")) cerrarTarjetaMapa(); });
}
const filas = INDP.filter(x => MAPA_IND.includes(x.lab)).map(x => {
const f = x.d.find(d => d.codigo_indec === c); if (!f) return "";
const pos = [...x.d].sort((a, b) => b[x.k] - a[x.k]).findIndex(d => d.codigo_indec === c) + 1;
return `<li><span class="mt-lab">${x.lab}</span><b>${x.f(f[x.k])}</b><small>${puestoTxt(pos, x.d.length)}. País: ${x.f(x.pais)}</small>` +
(notaDist(x, c) ? `<small class="mt-aclara">${notaDist(x, c)}</small>` : "") + `</li>`;
}).join("");
tarjetaM.setAttribute("aria-label", `Datos de ${NOMBRES[c]}`);
tarjetaM.innerHTML = `<div class="mt-cab">${conBandera(c, NOMBRES[c])}<button type="button" class="mt-cerrar" aria-label="Cerrar"><span aria-hidden="true">×</span></button></div>` +
`<ul>${filas}</ul><a class="boton principal chico" href="${urlProv(c)}">Ver perfil completo</a>`;
document.getElementById("mapa-lado").hidden = true;
if (ZONA_MAPA && innerWidth >= 760 && innerWidth < 1200) { tarjetaM.style.left = `${ZONA_MAPA.der + 20}px`; tarjetaM.style.top = `${Math.max(0, ZONA_MAPA.arr + 40)}px`; }
else { tarjetaM.style.left = ""; tarjetaM.style.top = ""; }
document.querySelectorAll("#mapa .provs a").forEach(a => a.classList.toggle("tocada", a.dataset.c === c));
const nueva = !tarjetaM.classList.contains("abierta");
tarjetaM.classList.add("abierta");
if (nueva) tarjetaM.animate(REDUCIR ? [{opacity: 0}, {opacity: 1}] : [{opacity: 0, transform: "translateY(6px)"}, {opacity: 1, transform: "none"}], {duration: 200, easing: "cubic-bezier(.23,1,.32,1)"});
}
function cerrarTarjetaMapa() {
if (!tarjetaM?.classList.contains("abierta")) return;
tarjetaM.classList.remove("abierta");
const lado = document.getElementById("mapa-lado"); lado.hidden = false; lado.innerHTML = LADO_REPOSO;
document.querySelectorAll("#mapa .provs a.tocada").forEach(a => a.classList.remove("tocada"));
}
const marcarMapa = () => {
document.querySelectorAll("#mapa .provs a").forEach(a => a.classList.toggle("elegida", a.dataset.c === prov));
document.querySelector("#mapa .malvinas")?.classList.toggle("elegida", prov === "94");
};
alCambiarProv.push(marcarMapa);
mapa();
};
