// Parte de datina.js que usa solo la portada (el mapa de la portada). Plan técnico, fase 5 (24 de noviembre de 2026): 03_construir_sitio.py la publica
// en sitio/partes/inicio.js, achicada como datina.js, y solo esa página la pide, antes de datina.js. Acá solo se anota: datina.js la corre
// con parte("inicio") en el mismo lugar donde estaba este código, así que tiene a mano todo lo que datina.js definió antes y corre en el
// mismo orden que cuando era un solo archivo. Lo que se declara acá adentro queda para esta parte.
window.DATINA_PARTES = window.DATINA_PARTES || {};
window.DATINA_PARTES["inicio"] = () => {
/* ---------- portada: el mundo visto desde la Argentina y las 24 provincias ----------
   Proyección azimutal equidistante centrada en la Argentina, ajustada para que el país llene su lugar en la portada
   (a la derecha del texto, o debajo en el celular). Los anillos marcan distancias iguales desde el centro del país.
   Cada provincia lleva a su perfil. El mapa no recibe el foco del teclado: "Elegí tu provincia" hace lo mismo. */
async function mapa() {
  const el = document.getElementById("mapa"), por = document.querySelector(".portada");
  const caja = document.getElementById("portada-mapa"), ayuda = document.getElementById("mapa-ayuda");
  // Rompecabezas (6 de octubre de 2026, pedido del autor): las provincias llegan desde afuera y se arman en el país, de la más lejana
  // del centro a la más cercana, y con el país armado nace el sol. Mientras tanto la portada lleva "armando" (ver datina.css). Se arma
  // una sola vez, con el dibujo definitivo: un redibujo en medio (la letra que llega tarde, un cambio de ancho) deja todo en su lugar.
  // Con movimiento reducido no hay rompecabezas
  let pendiente = !REDUCIR && por.classList.contains("armando"), vuelo = null;
  const soltar = () => { clearTimeout(seguro); clearTimeout(vuelo); vuelo = null; pendiente = false; por.classList.remove("armando"); };
  const seguro = setTimeout(soltar, 10000);   // el sol nunca se queda esperando, aunque los datos del mapa tarden
  if (!pendiente) soltar();
  // Cada provincia sale de afuera, sobre la línea que la une con el centro del país (el de los anillos), con un poco de desvío y de giro,
  // como una pieza suelta. El desvío sale del código de la provincia, así el rompecabezas es siempre el mismo
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
      // las Malvinas llegan con Tierra del Fuego
      [p.a, ...(p.a.dataset.c === "94" ? [el.querySelector(".malvinas")] : [])].forEach(n => {
        n.animate([{transform: `translate(${p.dx.toFixed(1)}px,${p.dy.toFixed(1)}px) rotate(${p.giro.toFixed(1)}deg)`}, {transform: "none"}],
          {...t, duration: DUR_P, easing: "cubic-bezier(.16,1,.3,1)"});
        n.animate([{opacity: 0}, {opacity: 1}], {...t, duration: 300, easing: "ease-out"});
      });
    });
    // el sol empieza a nacer cuando la última pieza está llegando
    vuelo = setTimeout(soltar, (piezas.length - 1) * PASO_P + DUR_P * .7);
  };
  let mundo;
  try { [mundo] = await Promise.all([fetch("datos/mundo-110m.json").then(r => r.json()), cargarGeo()]); } catch (_) { soltar(); return; }
  // la Argentina y las Malvinas del mapa del mundo no se dibujan: van las provincias, con su contorno oficial
  const paises = topojson.feature(mundo, mundo.objects.countries).features.filter(d => d.id !== "032" && d.id !== "238");
  // Las Malvinas son parte de la provincia en el archivo (código 94, los polígonos al este de los 62 grados oeste). Se dibujan aparte para que
  // sean un dibujo y nada más: sin mouse, sin clic y sin dar los datos de Tierra del Fuego (pedido del autor, noviembre de 2026). El ajuste del
  // mapa al lugar sigue usando el archivo entero, y los otros mapas del sitio no cambian
  const esMalvinas = pol => d3.geoCentroid({type: "Polygon", coordinates: pol})[0] > -62;
  const conMalvinas = GEO.features.find(f => f.properties.codigo_indec === "94");
  const soloIslas = {type: "MultiPolygon", coordinates: conMalvinas.geometry.coordinates.filter(esMalvinas)};
  const sinMalvinas = {...conMalvinas, geometry: {type: "MultiPolygon", coordinates: conMalvinas.geometry.coordinates.filter(p => !esMalvinas(p))}};
  const provMapa = GEO.features.map(f => f === conMalvinas ? sinMalvinas : f);
  // con mouse se hace clic, en el celular se toca
  const CON_MOUSE = matchMedia("(hover:hover) and (pointer:fine)").matches;
  const AYUDA = CON_MOUSE ? "Hacé clic en una provincia para ver sus datos" : ayuda.textContent;
  ayuda.textContent = AYUDA;
  // al costado del país, en pantallas anchas: la instrucción y, al pasar el mouse, el nombre con un dato explicado
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
    // el país ocupa el lugar del mapa. En pantallas anchas deja libre la esquina del sol
    const x0 = c.left - pr.left, y0 = c.top - pr.top + (angosto ? 0 : 12);
    const x1 = c.right - pr.left - (angosto ? 0 : sl.width * .55), y1 = c.bottom - pr.top - ayuda.offsetHeight - 10;
    const proy = d3.geoAzimuthalEquidistant().rotate([64, 38]).clipAngle(179.9).fitExtent([[x0, y0], [x1, y1]], GEO);
    // en pantallas anchas la Argentina va al borde izquierdo de su lugar, cerca del texto (antes quedaba centrada y lejos)
    if (!angosto) { const b0 = d3.geoPath(proy).bounds(GEO), t0 = proy.translate(); proy.translate([t0[0] + x0 + 8 - b0[0][0], t0[1]]); }
    const camino = d3.geoPath(proy), svg = d3.select(el).attr("viewBox", `0 0 ${W} ${H}`);
    // la ayuda va pegada debajo del país, como instrucción del mapa
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
      // el nombre de la provincia para los lectores de pantalla (accesibilidad de Lighthouse, 23 de noviembre de 2026): con el teclado se llega por la lista de provincias
      .attr("href", d => urlProv(d.properties.codigo_indec)).attr("tabindex", -1).attr("aria-label", d => `${NOMBRES[d.properties.codigo_indec]}: ver sus datos`)
      .attr("data-c", d => d.properties.codigo_indec);
    enlaces.append("path").attr("d", camino);
    g.append("path").attr("class", "malvinas").attr("aria-hidden", "true").attr("d", camino(soloIslas));
    // la Ciudad de Buenos Aires es un punto a esta escala: un círculo para poder tocarla
    const [cx, cy] = proy(d3.geoCentroid(GEO.features.find(f => f.properties.codigo_indec === "02")));
    g.select('a[data-c="02"]').raise().append("circle").attr("cx", cx).attr("cy", cy).attr("r", angosto ? 6 : 5);
    // el rompecabezas: mientras está pendiente, las provincias esperan sin verse hasta el dibujo definitivo
    if (vuelo) soltar();
    if (armar && pendiente) rompecabezas(enlaces, camino, proy, bp);
    else if (pendiente) g.style("opacity", 0);
    enlaces.on("pointerenter", (ev, d) => { const c = d.properties.codigo_indec; ayuda.innerHTML = conBandera(c, `${NOMBRES[c]}: ver sus datos`); ladoProv(c); })
      .on("pointerleave", () => { ayuda.textContent = AYUDA; lado.innerHTML = LADO_REPOSO; })
      // tocar una provincia abre una tarjeta con datos de su perfil (pedido del autor, octubre de 2026). No la elige: eso se hace
      // solo en provincia.html, al que lleva el botón de la tarjeta
      .on("click", (ev, d) => { ev.preventDefault(); tarjetaMapa(d.properties.codigo_indec); });
    marcarMapa();
    el.classList.add("listo");
  };
  dibujar();
  // la tipografía condensada cambia el alto del texto: se recalcula cuando termina de cargar, y ese es el dibujo que se arma como
  // rompecabezas. Si la letra tarda más de dos segundos y medio, se arma igual, y el redibujo de cuando llegue deja todo en su lugar
  let armado = false;
  const armar = () => { if (!armado) { armado = true; dibujar(true); } };
  if (document.fonts) document.fonts.ready.then(() => armado ? dibujar() : armar()); else armar();
  setTimeout(armar, 2500);
  let ancho = por.clientWidth, t;
  new ResizeObserver(() => { if (por.clientWidth === ancho) return; ancho = por.clientWidth; clearTimeout(t); t = setTimeout(dibujar, 150); }).observe(por);
}
// Tarjeta del mapa: cuatro indicadores del perfil con su posición entre las 24 y el enlace al perfil completo.
// Al lado del país en pantallas anchas y debajo del mapa en el celular. Se cierra con Escape, con "Cerrar" o tocando afuera
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
  // desde 1200 píxeles la ubica datina.css, debajo del sol y en lugar de la descripción
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
// la provincia elegida, en amarillo
const marcarMapa = () => {
  document.querySelectorAll("#mapa .provs a").forEach(a => a.classList.toggle("elegida", a.dataset.c === prov));
  document.querySelector("#mapa .malvinas")?.classList.toggle("elegida", prov === "94");
};
alCambiarProv.push(marcarMapa);
mapa();
};
