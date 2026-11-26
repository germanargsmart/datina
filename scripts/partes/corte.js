// Parte de datina.js de la Corte Suprema (etapa 33), que usan dos páginas: laboratorio.html (la pieza lab-corte, quiénes estaban cada año)
// y corte-suprema.html (la nota #l-corte, con sus tres gráficos). Plan técnico, fase 5 (25 de noviembre de 2026): 03_construir_sitio.py la
// publica en sitio/partes/corte.js, achicada como datina.js, y solo esas dos páginas la piden, antes de datina.js (PARTE_EN en 03). Acá
// solo se anota: datina.js la corre con parte("corte") donde estaba este código, después de las trayectorias del Laboratorio, así que
// tiene a mano todo lo que datina.js definió antes. Era un solo tramo de datina.js, que va acá entero: los colores y nombres de los grupos,
// la leyenda que resalta un grupo (con sus escuchadores de .co-btn en document), los tres dibujos (filasCorte, areasCorte y cuadradosCorte),
// la pieza del Laboratorio (TX["lab-corte"] y DIB["lab-corte"]: la lupa no lee ese texto, que no es de una ficha) y la nota de la página
// (notaCorte, con DIB["cs-tiempo"], DIB["cs-composicion"] y DIB["cs-presidentes"]). Usa mayus, que queda en datina.js después de la
// llamada: solo la lee tipJuez, al pasar el mouse por un juez. Lo que se declara acá adentro queda para esta parte.
window.DATINA_PARTES = window.DATINA_PARTES || {};
window.DATINA_PARTES["corte"] = () => {
/* ---------- La Corte Suprema (etapa 33): pieza del Laboratorio con página propia ----------
   Como "The Supreme Court has had 116 justices. Here's who put them there" de USAFacts: cuánto estuvo cada juez, quiénes estaban cada año
   y cuántos designó cada presidente, con el color del grupo del gobierno que designó a cada uno (la clasificación que aprobó el autor está
   en 02_procesar.py). Los textos salen del resumen (R.corte) y las tablas se bajan al dibujar. Describe quién designó a cada juez, no
   cómo votó */
const CO = R.corte, CO_G = Object.fromEntries(CO.grupos.map(g => [g.k, g]));
const CO_TABLAS = ["corte_jueces", "corte_composicion", "corte_presidentes"];
// con los colores claros, el texto de encima va oscuro
const coClaves = () => CO.grupos.map(g => ({k: g.k, lab: g.lab, c: g.c, texto: ["#9FB86B", "#74ACDF", "#F6B40E"].includes(g.c) ? css("--ink") : "#fff"}));
const CO_DE = {liberales: "de los liberales de Mitre", pan: "del Partido Autonomista Nacional (PAN)", ucr: "de la UCR", facto: "de gobiernos de facto", concordancia: "de la Concordancia",
  peronismo: "del peronismo", pro: "del PRO", lla: "de La Libertad Avanza"};
const coAnios = j => j.en_funciones ? `desde ${j.anio_desde}` : j.anio_hasta === j.anio_desde ? `en ${j.anio_desde}` : `de ${j.anio_desde} a ${j.anio_hasta}`;
// frases sin género: tres juezas pasaron por la Corte
const coMotivo = {"renuncia": "Renunció", "fallecimiento": "Murió en el cargo", "jubilación": "Se jubiló", "juicio político": "Salió por juicio político",
  "cesanteado por un gobierno de facto": "Salió por la cesantía que dispuso un gobierno de facto", "límite de edad": "Llegó al límite de edad",
  "otro": "", "en funciones": "Sigue en el cargo"};
const tipJuez = j => `<b>${j.nombre}</b><br>${mayus(coAnios(j))}, ${n1(j.anios)} años<br>Designación de ${j.designado_por}` +
  `<br><span style="color:${CO_G[j.grupo].c}">■</span> ${CO_G[j.grupo].lab}` + (j.confirmado ? `<br>${j.confirmado}` : "") +
  (j.segunda_designacion ? "<br>Segunda designación" : "") + (coMotivo[j.motivo_cese] ? `<br>${coMotivo[j.motivo_cese]}` : "");

/* Los gráficos de la Corte se rehicieron el 7 de octubre de 2026 (pedido del autor: "los gráficos de jueces son horribles, hacelos muchos
   más lindos y entendibles"). Antes eran una línea de tiempo por carriles sin nombres, 164 columnas separadas y barras con el número
   repetido. Ahora: una fila por juez con su nombre, franjas sin cortes con los lugares vacantes a la vista y un cuadrado por juez.
   La leyenda de los tres resalta un grupo: al pasar el mouse, con el foco o al tocarlo (tocar de nuevo lo suelta). El grupo elegido
   queda en la tarjeta del gráfico (data-grupo), así sigue elegido si el gráfico se vuelve a dibujar, y cada gráfico deja en su
   contenedor la función grupo(), que aclara a los demás */
const coLeyenda = (extra = "") => coClaves().map(k => `<button type="button" class="co-btn" data-k="${k.k}" aria-pressed="false" aria-label="Resaltar ${k.lab}">` +
  `<i style="background:${k.c}"></i>${k.lab}</button>`).join("") + extra;
const CO_VAC = `<span><i class="co-vac"></i>Lugares vacantes</span><span><i class="co-ley"></i>Jueces que fija la ley</span>`;
const CO_FACTO = `<span><i class="co-banda"></i>Años de gobierno de facto</span>`;
// nombres cortos para escribir dentro de las franjas, donde el nombre de la leyenda no entra
const CO_CORTO = {liberales: "Liberales", facto: "De facto"};
const coCaja = el => el.closest(".nota-graf, .lab-graf");
const coAplicar = (caja, k) => caja?.querySelector(".grafico")?.grupo?.(k || null);
const coGrupoInicial = el => { const k = coCaja(el)?.dataset.grupo; if (k) el.grupo(k); };
document.addEventListener("pointerover", ev => { const b = ev.target.closest?.(".co-btn"); if (b && ev.pointerType === "mouse") coAplicar(coCaja(b), b.dataset.k); });
document.addEventListener("pointerout", ev => { const b = ev.target.closest?.(".co-btn");
  if (b && ev.pointerType === "mouse" && !b.contains(ev.relatedTarget)) coAplicar(coCaja(b), coCaja(b).dataset.grupo); });
document.addEventListener("focusin", ev => { const b = ev.target.closest?.(".co-btn"); if (b) coAplicar(coCaja(b), b.dataset.k); });
document.addEventListener("focusout", ev => { const b = ev.target.closest?.(".co-btn"); if (b) coAplicar(coCaja(b), coCaja(b).dataset.grupo); });
document.addEventListener("click", ev => {
  const b = ev.target.closest?.(".co-btn"); if (!b) return;
  const caja = coCaja(b), k = caja.dataset.grupo === b.dataset.k ? "" : b.dataset.k;
  caja.dataset.grupo = k;
  caja.querySelectorAll(".co-btn").forEach(x => x.setAttribute("aria-pressed", x.dataset.k === k));
  coAplicar(caja, k);
});
// aclarar lo que no es del grupo elegido, con un fundido corto
const coAclarar = (sel, k, clave, baja = .18) => sel.transition("grupo").duration(DUR_C).ease(d3.easeCubicOut).attr("opacity", d => !k || clave(d) === k ? 1 : baja);

/* Cuánto estuvo cada juez: una fila por designación, en el orden en que llegaron, como la línea de tiempo de USAFacts. La barra va desde
   la jura (o desde el decreto, si falta la jura) hasta que dejó el cargo, con el color del grupo del gobierno que lo designó, y el nombre
   va pegado a la barra: antes, si entra, y si no, después. Detrás, las franjas grises son los gobiernos de facto (R.corte.facto), y quienes
   siguen en el cargo van en negrita. Al pasar el mouse o tocar, el cuadro del juez de esa fila */
function filasCorte(el, cfg) {
  const J = T.corte_jueces, n = J.length, angosto = el.clientWidth < 560, FILA = CO_FILA, GROSOR = angosto ? 6 : 7;
  const ini = new Date(CO.desde, 0, 1), fin = new Date(), desde = j => new Date(j.desde), hasta = j => j.hasta ? new Date(j.hasta) : fin;
  const C = lienzo(el, n * FILA + 52, {t: 26, r: 6, b: 26, l: 6});
  const {svg, g, iw, ih} = C;
  svg.classed("angosto", angosto).attr("aria-label", `Línea de tiempo de las ${n} designaciones de jueces de la Corte Suprema desde ${CO.desde}, una por fila, ` +
    `con el nombre de cada juez y el color del gobierno que lo designó`);
  const t = d3.scaleTime().domain([ini, fin]).range([0, iw]);
  const x0 = j => t(desde(j)), ancho = j => Math.max(2, t(hasta(j)) - x0(j));
  g.append("g").attr("class", "co-facto").selectAll("rect").data(CO.facto).join("rect")
    .attr("x", p => t(Math.max(+ini, +new Date(p.desde)))).attr("width", p => t(new Date(p.hasta)) - t(Math.max(+ini, +new Date(p.desde))))
    .attr("y", -6).attr("height", ih + 12);
  // una línea cada 20 años, y en el celular, un año escrito cada 40, para que no se toquen
  const marcas = d3.range(Math.ceil(CO.desde / 20) * 20, fin.getFullYear() + 1, 20).map(a => new Date(a, 0, 1));
  g.append("g").attr("class", "grilla").selectAll("line").data(marcas).join("line").attr("x1", t).attr("x2", t).attr("y1", -6).attr("y2", ih + 6);
  for (const yy of [-13, ih + 21]) g.append("g").attr("class", "eje").selectAll("text").data(marcas.filter(d => !angosto || d.getFullYear() % 40 === 0)).join("text")
    .attr("x", t).attr("y", yy).attr("text-anchor", "middle").text(d => d.getFullYear());
  const filas = g.selectAll("g.co-fila").data(J).join("g").attr("class", "co-fila").attr("transform", (j, i) => `translate(0,${i * FILA})`);
  const barras = filas.append("rect").attr("y", (FILA - GROSOR) / 2).attr("height", GROSOR).attr("rx", rBarra(GROSOR))
    .attr("x", x0).attr("width", ancho).attr("fill", j => CO_G[j.grupo].c);
  const nombres = filas.append("text").attr("class", j => "co-nom" + (j.en_funciones ? " fuerte" : "")).attr("y", FILA / 2).attr("dy", ".35em").text(j => j.nombre);
  // el nombre antes de la barra si entra, si no después, y si no entra en ningún lado, del lado con más lugar y recortado
  nombres.each(function(j) {
    const a = x0(j), b = a + ancho(j), w = this.getComputedTextLength(), antes = a - 6, despues = iw - b - 6;
    const izq = w <= antes || (w > despues && antes >= despues);
    d3.select(this).attr("x", izq ? a - 5 : b + 5).attr("text-anchor", izq ? "end" : "start");
    recortarEtq(this, izq ? antes : despues);
  });
  if (cfg.anim) {
    barras.attr("width", 0).transition().delay((j, i) => i / n * 150).duration(DUR_G).ease(EASE).attr("width", ancho);
    aparecer(nombres, 100);
  }
  const marco = g.append("rect").attr("class", "co-marco").attr("height", GROSOR + 4).attr("rx", rBarra(GROSOR) + 2).attr("opacity", 0);
  let activa = -1;
  const soltar = () => { activa = -1; marco.attr("opacity", 0); nombres.classed("activo", false); ocultarTip(); };
  const ver = ev => {
    const [px, py] = d3.pointer(ev, g.node()), i = Math.floor(py / FILA), j = J[i];
    if (!j || py < 0) return soltar();
    if (i !== activa) {
      activa = i;
      marco.attr("x", x0(j) - 2).attr("y", i * FILA + (FILA - GROSOR) / 2 - 2).attr("width", ancho(j) + 4).attr("opacity", 1);
      nombres.classed("activo", (d, k) => k === i);
    }
    mostrarTip(el, tipJuez(j), 6 + Math.max(x0(j), Math.min(px, x0(j) + ancho(j))), 26 + i * FILA);
  };
  svg.append("rect").attr("width", C.w).attr("height", C.h).attr("fill", "transparent").style("touch-action", "pan-y")
    .on("pointermove", ver).on("pointerdown", ver).on("pointerleave", soltar);
  el.grupo = k => coAclarar(filas, k, j => j.grupo, .16);
  coGrupoInicial(el);
}
// alto de cada fila de la línea de tiempo: con él se reserva el lugar del gráfico mientras carga
const CO_FILA = 12;

/* Los jueces de cada año: una franja por grupo, apiladas y sin cortes entre un año y otro, con los jueces en funciones al 31 de diciembre
   (en el año en curso, hoy). Encima, rayados, los lugares vacantes hasta los jueces que fija la ley, que es la línea de arriba. La lectura
   de arriba del gráfico, como en los gráficos de líneas, dice el año y cuántos jueces había de cada grupo, y arranca con hoy. Cada franja
   lleva su nombre donde entra entero, en el lugar más amplio que deja */
function areasCorte(el, cfg) {
  const data = T.corte_composicion, angosto = el.clientWidth < 520, alto = angosto ? 323 : 363, claves = coClaves().filter(k => data.some(d => d[k.k]));
  const anioHoy = new Date().getFullYear(), ult = data[data.length - 1];
  const leer = d => {
    const vac = d.ley != null ? d.ley - d.jueces : 0;
    return `<b>${d.anio === anioHoy ? "Hoy" : d.anio}</b><span>${d.jueces} ${d.jueces === 1 ? "juez" : "jueces"}${d.ley != null ? `, la ley fija ${d.ley}` : ""}</span>` +
      claves.filter(k => d[k.k]).map(k => `<span><i style="background:${k.c}"></i>${k.lab} ${d[k.k]}</span>`).join("") +
      (vac > 0 ? `<span><i class="co-vac"></i>${vac} ${vac === 1 ? "lugar vacante" : "lugares vacantes"}</span>` : "");
  };
  const M = {t: 10, r: 8, b: 28, l: 26};
  const C = lienzo(el, alto, M);
  const lec = d3.select(el).insert("p", "svg").attr("class", "lectura-serie").attr("aria-hidden", "true");
  // la lectura más larga fija el alto de la línea, así nada se corre al pasar el mouse, y el dibujo usa lo que queda del alto reservado
  let hl = 0;
  for (const d of data) { lec.html(leer(d)); hl = Math.max(hl, lec.node().offsetHeight); }
  lec.style("min-height", hl + "px").html(leer(ult));
  // el margen de la lectura cambia según dónde está el gráfico (en las notas, los párrafos llevan más aire)
  const cs = getComputedStyle(lec.node()), hs = Math.max(200, alto - hl - parseFloat(cs.marginTop) - parseFloat(cs.marginBottom));
  const ih = hs - M.t - M.b, {svg, g, iw} = C;
  svg.attr("viewBox", `0 0 ${C.w} ${hs}`).classed("angosto", angosto).attr("aria-label", `Jueces de la Corte Suprema en funciones al final de cada año desde ${CO.desde}, ` +
    `según el grupo del gobierno que designó a cada uno, con los lugares vacantes hasta los que fija la ley`);
  const a0 = data[0].anio, x = d3.scaleLinear().domain([a0, ult.anio + 1]).range([0, iw]);
  const tope = d3.max(data, d => Math.max(d.jueces, d.ley || 0));
  const y = d3.scaleLinear().domain([0, tope + .4]).range([ih, 0]);
  // marcas en los tamaños que fijó la ley (cinco, siete y nueve), no en números redondos
  const marcasY = [0, ...new Set(data.map(d => d.ley).filter(v => v != null))].sort(d3.ascending);
  g.append("g").attr("class", "grilla").selectAll("line").data(marcasY.slice(1)).join("line").attr("x1", 0).attr("x2", iw).attr("y1", y).attr("y2", y);
  g.append("g").attr("class", "eje").selectAll("text").data(marcasY).join("text").attr("x", -8).attr("y", y).attr("dy", ".35em").attr("text-anchor", "end").text(v => v);
  const cada = angosto ? 40 : 20, marcasX = d3.range(Math.ceil(a0 / cada) * cada, ult.anio + 1, cada);
  g.append("g").attr("class", "eje").selectAll("text").data(marcasX).join("text").attr("x", x).attr("y", ih + 20).attr("text-anchor", "middle").text(a => a);
  // el último año se repite un año después, así su tramo tiene ancho
  const serie = [...data, {...ult, anio: ult.anio + 1}];
  const pila = d3.stack().keys(claves.map(k => k.k))(serie);
  const dib = g.append("g");
  const rayas = `rayas${++nRecorte}`;
  svg.append("defs").append("pattern").attr("id", rayas).attr("patternUnits", "userSpaceOnUse").attr("width", 5).attr("height", 5)
    .attr("patternTransform", "rotate(45)").append("rect").attr("width", 1.5).attr("height", 5).attr("fill", css("--faint"));
  dib.append("path").attr("fill", `url(#${rayas})`).attr("opacity", .75)
    .attr("d", d3.area().curve(d3.curveStepAfter).x(d => x(d.anio)).y0(d => y(d.jueces)).y1(d => y(Math.max(d.jueces, d.ley ?? d.jueces)))(serie));
  const franjas = dib.selectAll("path.co-franja").data(pila).join("path").attr("class", "co-franja").attr("fill", s => CO_G[s.key].c)
    .attr("d", d3.area().curve(d3.curveStepAfter).x(d => x(d.data.anio)).y0(d => y(d[0])).y1(d => y(d[1])));
  dib.append("path").attr("class", "co-ley-linea")
    .attr("d", d3.line().curve(d3.curveStepAfter).defined(d => d.ley != null).x(d => x(d.anio)).y(d => y(d.ley))(serie));
  // el nombre de cada franja, en el rectángulo más amplio que entra dentro de ella (si no entra, queda solo en la leyenda)
  const rotulos = dib.append("g").attr("pointer-events", "none");
  for (const s of pila) {
    const k = claves.find(c => c.k === s.key), txt = rotulos.append("text").attr("class", "co-rot").datum(s).attr("fill", k.texto).text(CO_CORTO[k.k] || k.lab);
    const w = txt.node().getComputedTextLength() + 12, hmin = 16;
    let mejor = null;
    for (let i = 0; i < data.length; i++) {
      let arriba = -Infinity, abajo = Infinity;
      for (let j = i; j < data.length; j++) {
        arriba = Math.max(arriba, y(s[j][1])); abajo = Math.min(abajo, y(s[j][0]));
        if (abajo - arriba < hmin) break;
        const ancho = x(data[j].anio + 1) - x(data[i].anio), area = ancho * (abajo - arriba);
        if (ancho >= w && (!mejor || area > mejor.area)) mejor = {area, cx: (x(data[i].anio) + x(data[j].anio + 1)) / 2, cy: (arriba + abajo) / 2};
      }
    }
    if (mejor) txt.attr("x", mejor.cx).attr("y", mejor.cy).attr("dy", ".35em").attr("text-anchor", "middle");
    else txt.remove();
  }
  // al dibujarse, el gráfico se descubre de izquierda a derecha, como corre el tiempo
  const corte = `rb${++nRecorte}`, tapa = svg.append("defs").append("clipPath").attr("id", corte).append("rect")
    .attr("x", -2).attr("y", -M.t).attr("width", iw + 4).attr("height", ih + M.t + 2);
  dib.attr("clip-path", `url(#${corte})`);
  if (cfg.anim) tapa.attr("width", 0).transition().duration(DUR_G).ease(EASE).attr("width", iw + 4);
  const regla = g.append("line").attr("class", "co-regla").attr("y1", 0).attr("y2", ih).attr("opacity", 0);
  const porAnio = new Map(data.map(d => [d.anio, d]));
  const leerEn = ev => {
    const [mx] = d3.pointer(ev, g.node()), a = Math.max(a0, Math.min(ult.anio, Math.floor(x.invert(mx)))), d = porAnio.get(a);
    if (!d) return;
    regla.attr("x1", (x(a) + x(a + 1)) / 2).attr("x2", (x(a) + x(a + 1)) / 2).attr("opacity", 1);
    lec.html(leer(d));
  };
  svg.style("touch-action", "pan-y");
  g.append("rect").attr("width", iw).attr("height", ih).attr("fill", "transparent").on("pointerdown", leerEn).on("pointermove", leerEn)
    .on("pointerleave", ev => { if (ev.pointerType !== "mouse") return; regla.attr("opacity", 0); lec.html(leer(ult)); });
  el.grupo = k => { coAclarar(franjas, k, s => s.key); coAclarar(rotulos.selectAll("text"), k, s => s.key, 0); };
  coGrupoInicial(el);
}

/* Cuántos jueces designó cada presidente: un cuadrado por juez, con el color de su grupo, y los presidentes en el orden en que
   gobernaron (los que no designaron jueces no figuran). Con lugar, en dos columnas. Al pasar el mouse o tocar un cuadrado, el cuadro
   de ese juez, y sobre el nombre del presidente, todos los que designó */
const CO_PRES = {fila: 24, filaC: 22, dos: 760};
// un nombre que no entra abrevia primero los nombres de pila ("M. E. Martínez de Perón"), sin tocar el apellido (lo que sigue a "de"
// o la última palabra), y solo si sigue sin entrar se corta con puntos suspensivos. El nombre completo queda al pasar el mouse
function coAbreviar(nodo, max) {
  if (!(nodo.getComputedTextLength() > max)) return;
  const completo = nodo.textContent, pal = completo.split(" "), part = w => /^(de|del|la|las|los|y)$/i.test(w || "");
  for (let i = 0; i < pal.length - 1 && nodo.getComputedTextLength() > max; i++) {
    if (part(pal[i]) || part(pal[i + 1]) || i === pal.length - 1) break;
    pal[i] = pal[i][0] + "."; nodo.textContent = pal.join(" ");
  }
  if (nodo.getComputedTextLength() > max) { nodo.textContent = completo; recortarEtq(nodo, max); }
  else d3.select(nodo).append("title").text(completo);
}
function cuadradosCorte(el, cfg) {
  const P = T.corte_presidentes, w0 = el.clientWidth, dos = w0 >= CO_PRES.dos, angosto = w0 < 520;
  const FILA = angosto ? CO_PRES.filaC : CO_PRES.fila, porCol = dos ? Math.ceil(P.length / 2) : P.length;
  const C = lienzo(el, porCol * FILA + 8, {t: 4, r: 4, b: 4, l: 4});
  const {svg, g, iw} = C;
  svg.classed("angosto", angosto).attr("aria-label", `Jueces de la Corte Suprema que designó cada presidente desde ${CO.desde}, un cuadrado por juez`);
  // los jueces de cada presidente salen de la tabla de jueces, en el orden de la lista de nombres de cada fila (o: el orden de todos,
  // para que aparezcan en el orden en que fueron designados)
  const usados = new Set(), J = T.corte_jueces;
  let o = 0;
  const filasP = P.map((p, i) => ({...p, i, jueces: p.nombres.split(", ").map(nom => {
    const k = J.findIndex((j, k) => !usados.has(k) && j.nombre === nom && j.designado_por === p.presidente);
    usados.add(k); return {...J[k], o: o++};
  })}));
  const sep = dos ? 40 : 0, colW = (iw - sep) / (dos ? 2 : 1), maxN = d3.max(P, p => p.designados), anioW = angosto ? 37 : 40;
  const filas = g.selectAll("g.co-pfila").data(filasP).join("g").attr("class", "co-pfila")
    .attr("transform", p => `translate(${Math.floor(p.i / porCol) * (colW + sep)},${(p.i % porCol) * FILA})`);
  const rotulo = filas.append("g").attr("class", "co-prot");
  const fondo = rotulo.append("rect").attr("x", -4).attr("height", FILA).attr("fill", "transparent");
  const nom = rotulo.append("text").attr("class", "co-pres").attr("y", FILA / 2).attr("dy", ".35em").attr("text-anchor", "end").text(p => p.presidente);
  // la columna de los nombres mide lo que el más largo, si deja lugar para los cuadrados (de 8 píxeles como mínimo): si no, se recorta
  const nomW = Math.min(d3.max(nom.nodes(), n => n.getComputedTextLength()) + 8, colW - anioW - maxN * 11 - 22);
  const lado = Math.max(8, Math.min(15, Math.floor((colW - nomW - anioW - 24) / maxN) - 3)), paso = lado + 3;
  nom.attr("x", nomW).each(function() { coAbreviar(this, nomW - 4); });
  fondo.attr("width", nomW + anioW + 4);
  rotulo.append("text").attr("class", "co-anio").attr("x", nomW + 6).attr("y", FILA / 2).attr("dy", ".35em").text(p => p.inicio.slice(0, 4));
  const x0 = nomW + anioW;
  const cuad = filas.selectAll("rect.co-cuad").data(p => p.jueces).join("rect").attr("class", "co-cuad")
    .attr("x", (j, k) => x0 + k * paso).attr("y", (FILA - lado) / 2).attr("width", lado).attr("height", lado).attr("rx", Math.min(3, lado / 4))
    .attr("fill", j => CO_G[j.grupo].c);
  filas.append("text").attr("class", "co-cuenta").attr("x", p => x0 + p.designados * paso + 4).attr("y", FILA / 2).attr("dy", ".35em").text(p => p.designados);
  if (cfg.anim) cuad.attr("opacity", 0).transition().delay(j => j.o / o * 150).duration(DUR_G).ease(d3.easeCubicOut).attr("opacity", 1);
  const yFila = p => 4 + (p.i % porCol) * FILA, xCol = p => 4 + Math.floor(p.i / porCol) * (colW + sep);
  cuad.on("pointerenter", function(ev, j) {
      const p = d3.select(this.parentNode).datum();
      d3.select(this).classed("activo", true);
      mostrarTip(el, tipJuez(j), xCol(p) + +this.getAttribute("x") + lado / 2, yFila(p) + (FILA - lado) / 2);
    }).on("pointerleave", function() { d3.select(this).classed("activo", false); ocultarTip(); });
  rotulo.on("pointerenter", (ev, p) => mostrarTip(el, `<b>${p.presidente}</b>, desde ${p.inicio.slice(0, 4)}<br>` +
      `${p.designados} ${p.designados === 1 ? "juez" : "jueces"}: ${listaY(p.jueces.map(j => j.nombre))}`, xCol(p) + nomW / 2, yFila(p)))
    .on("pointerleave", ocultarSiMouse);
  el.grupo = k => coAclarar(filas, k, p => p.grupo, .16);
  coGrupoInicial(el);
}
const coComposicion = (el, a) => areasCorte(el, {anim: a});
// la pieza grande del Laboratorio: quiénes estaban cada año
TX["lab-corte"] = $t("lab-corte").textContent = `Desde ${CO.desde}, ${CO.personas} personas fueron jueces de la Corte Suprema, designadas por ${CO.presidentes} presidentes. ` +
  `Las franjas muestran cuántos jueces había al final de cada año, con el color del gobierno que designó a cada uno. Lo rayado son los lugares vacantes, hasta los jueces que fija la ley.`;
if ($("lab-corte-ley")) $("lab-corte-ley").innerHTML = coLeyenda(CO_VAC);
DIB["lab-corte"] = conTablas("lab-corte", CO_TABLAS, a => {
  coComposicion(G("lab-corte"), a);
  G("lab-corte").resaltar = () => {};
});
// la página de la pieza
const notaCorte = document.getElementById("l-corte");
if (notaCorte) {
  const hoy = CO.hoy, porQuien = d3.groups(hoy, j => j.designado_por);
  // sin género ("llegó", "por designación de"): la frase sirve para cualquier integrante
  const quienes = porQuien.map(([p, js]) => `${listaY(js.map(j => j.nombre))} ${js.length > 1 ? "llegaron" : "llegó"} en ${js[0].desde}, por designación de ${p}.`).join(" ");
  const grupos = Object.entries(CO.por_grupo).sort((p, q) => q[1] - p[1]).map(([k, n], i) => `${n}${i ? "" : " fueron"} ${CO_DE[k]}`);
  const cambios = CO.cambios_ley.filter((c, i, a) => !i || c.jueces !== a[i - 1].jueces);
  const top = CO.top_presidentes, ma = CO.mas_anios;
  const noAs = CO.no_asumieron_lista.map(x => `${x.nombre} (${x.anio})`);
  const tiempo = j => j.hasta ? `de ${j.desde} a ${j.hasta}` : `desde ${j.desde}`;
  const nAnios = CO.anios_composicion;
  // filas del gráfico de los presidentes (Roca está dos veces, una por cada presidencia), para reservar su alto mientras carga
  const nPres = CO.presidencias;
  yaEscrito(notaCorte).innerHTML =
    `<div class="nota-cab"><span class="nota-ico">${icono("balanza")}</span><div><p class="nota-meta">Laboratorio. Se actualiza con cada cambio en la Corte</p>` +
    `<h1 class="nota-tit" style="view-transition-name:t-corte-suprema">¿Qué gobierno designó a cada juez de la Corte Suprema?</h1></div></div>` +
    `<p class="nota-bajada"><mark>Hoy la Corte tiene ${hoy.length} jueces, de los ${CO.ley_hoy} que fija la ley.</mark> ${quienes}</p>` +
    `<p>Desde que se instaló, en ${CO.desde}, la Corte Suprema de Justicia de la Nación tuvo ${CO.personas} jueces en ${CO.designaciones} designaciones, porque ` +
    `${CO.dos_veces.length === 4 ? "cuatro" : CO.dos_veces.length} llegaron dos veces: ${listaY(CO.dos_veces)}. Los designaron ${CO.presidentes} presidentes, constitucionales y de facto. ` +
    `Según el grupo del gobierno que firmó cada designación, ${listaY(grupos)}.</p>` +
    `<p>La Constitución de 1853 fijaba nueve jueces, pero los que designó Urquiza en 1854 no llegaron a formar la Corte. Desde la reforma de 1860, ` +
    `el número lo fija una ley: ${listaY(cambios.map(c => `${{5: "cinco", 7: "siete", 9: "nueve"}[c.jueces] || c.jueces} desde ${c.anio}`))}. ` +
    (/26\.183/.test(cambios.at(-1).norma) ? `La última reducción, de la ley 26.183, se cumplió de a poco, a medida que quedaban cargos vacantes.` : "") + `</p>` +
    `<div class="nota-graf"><h2>¿Cuánto tiempo estuvo cada juez en la Corte?</h2><div class="pol-ley">${coLeyenda(CO_FACTO)}</div>` +
    `<div class="grafico" data-g="cs-tiempo" data-forma="bloque" style="--alto:${CO.designaciones * CO_FILA + 52}px;--alto-c:${CO.designaciones * CO_FILA + 52}px"></div>` +
    `<p class="nota-pie-graf">Una fila por cada una de las ${CO.designaciones} designaciones desde ${CO.desde}, en el orden en que llegaron. La barra va desde la jura (o desde el decreto, si falta la jura) hasta que ` +
    `dejó el cargo, con el color del gobierno que designó a cada juez. Las franjas grises son los gobiernos de facto, y en negrita van quienes siguen en el cargo. ` +
    `Elegí un grupo en la leyenda para resaltar a sus jueces.</p></div>` +
    `<p>${ma[0].nombre} es quien más tiempo estuvo en la Corte: ${n1(ma[0].anios)} años, ${tiempo(ma[0])}. Le siguen ${ma[1].nombre} (${n1(ma[1].anios)}) y ${ma[2].nombre} (${n1(ma[2].anios)}). ` +
    `La mitad de los jueces estuvo ${n1(CO.mediana_anios)} años o menos. Los gobiernos de facto cesaron a ${CO.cesanteados} jueces, y ${CO.juicio_politico} salieron por juicio político.</p>` +
    `<div class="nota-graf"><h2>¿Qué gobiernos designaron a los jueces de cada año?</h2><div class="pol-ley">${coLeyenda(CO_VAC)}</div>` +
    `<div class="grafico" data-g="cs-composicion" data-forma="lineas"></div>` +
    `<p class="nota-pie-graf">Jueces en funciones al 31 de diciembre de cada año desde ${CO.desde} (en el año en curso, hoy), con el color del gobierno que designó a cada uno. ` +
    `Lo rayado son los lugares vacantes: la línea de arriba marca cuántos jueces fija la ley.</p></div>` +
    `<p>En ${CO.anios_un_grupo} de los ${nAnios} años desde ${CO.desde}, todos los jueces en funciones habían sido designados por gobiernos de un mismo grupo. La última vez fue en ${CO.un_grupo_ult}. ` +
    `Los gobiernos de facto hicieron ${CO.por_grupo.facto} de las designaciones, todas sin acuerdo del Senado. En total, ${CO.sin_acuerdo} designaciones no tuvieron ese acuerdo.</p>` +
    `<div class="nota-graf"><h2>¿Cuántos jueces designó cada presidente?</h2><div class="pol-ley">${coLeyenda()}</div>` +
    `<div class="grafico" data-g="cs-presidentes" data-forma="lista" style="--alto:${Math.ceil(nPres / 2) * CO_PRES.fila + 8}px;` +
    `--alto-m:${nPres * CO_PRES.fila + 8}px;--alto-c:${nPres * CO_PRES.filaC + 8}px"></div>` +
    `<p class="nota-pie-graf">Un cuadrado por cada juez que juró desde ${CO.desde}, junto al presidente que lo designó, en el orden en que gobernaron. ` +
    `Los presidentes que no designaron jueces no figuran.</p></div>` +
    `<p>${listaY(top[0].nombres)} ${top[0].nombres.length > 1 ? "designaron" : "designó"} ${top[0].n} jueces, más que cualquier otro presidente. ` +
    `Le siguen ${listaY(top[1].nombres)}, con ${top[1].n}, y ${listaY(top[2].nombres)}, con ${top[2].n}${top[2].nombres.length > 1 ? " cada uno" : ""}. ` +
    `La última designación que llegó a la jura fue la de ${CO.ultimo.nombre}, que hizo ${CO.ultimo.designado_por} en ${CO.ultimo.anio}.</p>` +
    `<div class="nota-fuentes"><details class="nota-calculo nota-limites"><summary>Límites de estos datos</summary><ul>` +
    `<li>Quién designó a un juez no dice cómo votó en cada causa: esta pieza no analiza fallos.</li>` +
    `<li>El grupo de cada gobierno es una clasificación propia y revisable. Sarmiento va con el PAN, que se formó en 1874 con el autonomismo que lo apoyó. ` +
    `Los radicales van juntos: la UCRI de Frondizi y la UCRP de Illia, con la UCR. Guido asumió en 1962 por la ley de acefalía, pero gobernó con un acta firmada ante las ` +
    `Fuerzas Armadas y cerró el Congreso: va con los gobiernos de facto.</li>` +
    `<li>${listaY(CO.confirmados)}, designados por gobiernos de facto, siguieron con un decreto nuevo y el acuerdo del Senado de un gobierno constitucional. ` +
    `Como en la nómina de la Corte, cuentan con el gobierno que los designó primero.</li>` +
    `<li>No cuentan las designaciones que no llegaron a la jura: los ${CO.urquiza} jueces que designó Urquiza en 1854, para una Corte que no se formó, y ${listaY(noAs)}. ` +
    `Rosatti y Rosenkrantz asumieron después por otra designación, con acuerdo del Senado.</li>` +
    `<li>Muchas fechas de designación del siglo XIX y de 1976 a 1983 tienen solo el mes o el año: los gráficos las ubican a mitad de ese período y los cuadros muestran años.</li>` +
    `</ul></details>` +
    `<p>Fuentes: Corte Suprema de Justicia de la Nación, nómina de jueces históricos y biografías (copia del Internet Archive de septiembre de 2024: ` +
    `la Corte ya no la muestra en su sitio), decretos del Boletín Oficial, leyes de InfoLEG y Casa Rosada. Algunas fechas salen solo de Wikipedia: la tabla con las fuentes lo dice, fila por fila.</p>` +
    `<div class="acciones"><a class="boton chico accion" href="datos/corte_jueces_fuentes.csv" download>Jueces, con fuentes y notas (CSV)</a>` +
    `<a class="boton chico accion" href="datos/corte_composicion.csv" download>Composición por año (CSV)</a>` +
    `<a class="boton chico accion" href="datos/corte_presidentes.csv" download>Designaciones por presidente (CSV)</a></div></div>`;
  // cada gráfico queda marcado como visto al dibujarse, así se vuelve a dibujar al cambiar el ancho (la línea de tiempo se da vuelta en el celular)
  const visto = el => el.closest(".nota-graf").classList.add("visto");
  DIB["cs-tiempo"] = conTablas("cs-tiempo", CO_TABLAS, a => { const el = G("cs-tiempo"); filasCorte(el, {anim: a}); el.resaltar = () => {}; visto(el); });
  DIB["cs-composicion"] = conTablas("cs-composicion", CO_TABLAS, a => { const el = G("cs-composicion"); coComposicion(el, a); el.resaltar = () => {}; visto(el); });
  DIB["cs-presidentes"] = conTablas("cs-presidentes", CO_TABLAS, a => { const el = G("cs-presidentes"); cuadradosCorte(el, {anim: a}); el.resaltar = () => {}; visto(el); });
}
};
