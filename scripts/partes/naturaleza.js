// Parte de datina.js que usa solo naturaleza.html (Naturaleza): los textos y los gráficos de sus fichas. Plan técnico, fase 5 (25 de noviembre
// de 2026): 03_construir_sitio.py la publica en sitio/partes/naturaleza.js, achicada como datina.js, y solo esa página la pide, antes de datina.js.
// Acá solo se anota: datina.js la corre con parte("naturaleza") antes de cambiarVista, después de todos los gráficos del núcleo, así que tiene a
// mano todo lo que datina.js definió antes. Lleva, en el orden en que estaban, las entradas de esta página que estaban en los objetos grandes
// de datina.js (DIB, MED, TABLA_PROPIA, las notas de TX que no lee la lupa y, si hay, las de LEAD que no usa ningún texto del núcleo),
// dentro de un Object.assign, o de textosParte para los textos (los suma a TX y los escribe en su lugar), y los nombres que solo usan
// ellas. Quedan en datina.js los textos que la lupa lee de TX en todas las páginas (los que nombra el índice del sitio, con los de LEAD
// que usan) y lo que leen otras páginas. Lo que se declara acá adentro queda para esta parte.
window.DATINA_PARTES = window.DATINA_PARTES || {};
window.DATINA_PARTES["naturaleza"] = () => {
textosParte({
  "protegida-nota": `Superficie terrestre dentro de áreas protegidas de jurisdicción nacional o provincial y de sitios con designación internacional, como reservas de biosfera y sitios Ramsar. La fuente suma la superficie de cada designación, así que una misma zona puede contarse más de una vez. No incluye las áreas marinas. Los metros cuadrados por habitante usan la población que proyecta el INDEC para ${R.anio_pob_ficha.areas_protegidas_provincias}, el mismo año. La línea punteada violeta marca el promedio simple de los países de la OCDE en ${OC.protegida.anio} según el Banco Mundial, que usa otra base (la Base Mundial de Áreas Protegidas) y no suma superposiciones.`,
  "parques-nota": `Superficie acumulada según el año de creación de cada área, con su superficie actual. No refleja ampliaciones posteriores ni cambios de categoría.`,
  "especies-nota": `Especies animales, vertebradas e invertebradas, registradas en cada área protegida nacional terrestre según el Sistema de Información de Biodiversidad. El número también refleja cuánto se estudió cada lugar: las áreas más antiguas e investigadas acumulan más registros, por eso no mide por sí solo la riqueza de fauna.`,
  "visitas-nota": `Visitas registradas en los parques nacionales con control de ingreso. Una persona que entra dos veces cuenta como dos visitas. Solo se muestran años completos. Esta fuente no publica datos abiertos por parque: la pestaña de cada parque usa el tablero de la Secretaría de Turismo y Ambiente.`,
  "mapa-areas-nota": `Color: porcentaje de la superficie de cada provincia dentro de áreas protegidas de cualquier jurisdicción, ${nt.anio}. Círculos: áreas protegidas nacionales terrestres, con tamaño proporcional a su superficie. Pasá el cursor o tocá para ver los valores.`,
  "lista-areas-nota": `Las ${nt.pn_n} áreas protegidas de la Administración de Parques Nacionales, ordenadas por año de creación. Superficie actual en hectáreas según el Sistema de Información de Biodiversidad.`,
  "cobertura-suelo-nota": `MapBiomas Argentina, Colección 3: una red de instituciones y ` +
    `organizaciones que clasifica la cobertura del suelo de cada año desde ${MBS.ini} con imágenes satelitales Landsat. No es una estadística oficial ` +
    `y la clasificación puede tener errores. La vegetación natural son los bosques, los arbustales, ` +
    `los pastizales y las turberas. Lo demás es uso agropecuario, áreas urbanas, suelo sin vegetación o agua. El registro de bosques nativos del ` +
    `Estado usa otra metodología y puede dar otras cifras. Licencia CC BY 4.0.`,
  "cumbres-nota": `Las alturas son las de la tabla «Máximas alturas» del Instituto Geográfico Nacional (IGN), que no dice de qué año es cada medición ni si están todas las cumbres de esa altura. ` +
    `El relieve es un recuadro de 12 km de lado alrededor de cada cumbre, con una curva de nivel cada ${CU.PASO} metros, y sale de un modelo de elevación ` +
    `satelital (SRTM, con un punto cada 30 metros) que no reproduce exacta ninguna cumbre: según el lugar, da unos metros más o menos que la altura oficial. Para que las cumbres ` +
    `se comparen entre sí, todas tienen la misma escala, la altura exagerada ${n1(CU.EXAG)} veces y la base del bloque a ${n0(CU.BASE)} metros. Los glaciares ` +
    `son los del Inventario Nacional de Glaciares, que cuenta también los cubiertos de roca y los de escombros, y llega solo hasta el límite con Chile.`,
  "ant-mapa-nota": `Cada instalación cuenta para el país que la opera en primer lugar, y cada programa nacional informa la suya. Figuran cerradas por ahora ${ANT.cerradas}. Macquarie (Australia), al norte del paralelo 60, queda fuera del mapa y está en la tabla. ` +
    `En amarillo, las zonas antárticas especialmente protegidas y especialmente administradas vigentes, con los polígonos que publica la Secretaría del Tratado Antártico: las que en el mapa serían demasiado chicas para verse van como un rombo. Las zonas creadas después de esa publicación todavía no están. ` +
    `Corregimos una coordenada de la fuente: Zhongshan Skiway (China) figura con latitud norte, al lado de la base Zhongshan, que está al sur.`,
  "ant-bases-nota": `La línea marca desde cuándo existe cada base, no que haya funcionado sin pausa: San Martín, por ejemplo, volvió a abrir en 1976. Las fuentes oficiales no coinciden en Petrel: el Comando Conjunto Antártico, la página de Antártida de la Cancillería y COMNAP la cuentan como permanente, y la página de bases de la Dirección Nacional del Antártico, como temporaria. ` +
    `COMNAP marca a ${ANT.base_cerradas.join(" y ")} como cerradas por ahora. Carlini y Brown figuran a cargo de la Cancillería y las demás, del Comando Conjunto Antártico (Ministerio de Defensa). En 2024 se anunció el pase de esas dos a Defensa, y no encontramos una norma publicada que lo confirme. ` +
    `En el Censo 2010 fueron ${ANT.censo10} personas en el departamento Antártida Argentina, más ${ANT.censo10_orcadas} en Orcadas, que entonces se contaba en Islas del Atlántico Sur. No encontramos una explicación publicada de la diferencia con ${ANT.censo}.`,
  "ant-paises-nota": `Cada instalación cuenta igual, sea una estación grande o un refugio. La capacidad es la cantidad máxima de personas que informa cada programa para el momento de mayor actividad, no cuánta gente hay un día cualquiera. No la informan ${ANT.sin_cap} instalaciones, entre ellas Belgrano II: por eso la suma de un país puede quedar corta.`,
  "ant-reclamos-nota": `Describimos lo que dice la norma de cada país, sin tomar posición sobre la disputa de soberanía. La medida del IGN no cuenta unos ${n0(ANT.barreras_km2)} km² de barreras de hielo. La Cancillería da otra: ${n0(ANT.cancilleria_km2)} km² en total, con ${n0(ANT.cancilleria_tierra_km2)} km² de tierra firme. Los grados de longitud miden cuánto abarca cada sector alrededor del polo, no su superficie de tierra. La norma de cada país y su fuente están en la tabla: el año es el de esa norma, no necesariamente el del primer reclamo del país.`,
  "ant-tratado-nota": `Un país que se suma después de los firmantes es parte consultiva solo si hace investigación científica importante en la Antártida. Tienen vigente además ${ANT.protocolo} países el Protocolo de protección del medio ambiente, de 1991, que prohíbe la actividad minera salvo la investigación científica. La fecha de cada país es la de su adhesión, y en los firmantes originales, la de la entrada en vigor.`,
  "ant-zonas-nota": `Una propuesta de varios países cuenta para cada uno. Se cuentan las vigentes en ${ANT.ats_fecha}, sin las revocadas. Una zona protegida limita el ingreso y las actividades para cuidar valores ambientales, científicos o históricos.`,
  "ant-temperatura-nota": `Cada línea es una sola base y no dice qué pasa en todo el continente, y las series empiezan en años distintos. Un año entra si tiene al menos diez meses con dato: la fuente tiene huecos, sobre todo desde 2020. Para no mezclar meses fríos y cálidos, cada mes se compara con su promedio de 1991 a 2020, el mismo período de la ficha de la temperatura del país. ` +
    `Carlini figura en la fuente con su nombre anterior, Jubany. La temperatura más alta del continente que verificó la Organización Meteorológica Mundial se midió en Esperanza: 18,3 °C, el 6 de febrero de 2020.`,
  "ant-hielo-nota": `Mide la extensión: la superficie del mar con al menos 15% de hielo, en el promedio de cada mes. Es el hielo de mar de todo el continente, no solo el del sector argentino, y no es el de los glaciares ni el de las barreras. La tabla trae los valores de cada mes.`,
  "ant-turismo-nota": `Cuenta a quienes viajan con empresas de IAATO, que dice reunir al 98% del turismo, sin científicos ni funcionarios. Hasta 1998-99 no hay dato de quienes no desembarcan, y los que van al interior están completos desde 2014-15: la suma de los años anteriores queda corta. IAATO corrigió años viejos: se usa el documento más reciente de cada temporada. ` +
    `Para ${ANT.tu_max_temp} y la temporada siguiente publicó totales de ${n0(ANT.tu_pub_a)} y ${n0(ANT.tu_pub_b)}, que no coinciden con la suma de su propio desglose, que es la que mostramos. Según IAATO, la mayoría de los viajes sale de Ushuaia, sin dar qué parte. En ese puerto, los cruceros antárticos llevaron al ${pct(ANT.ush_pct)} de los ${n0(ANT.ush_n)} cruceristas de ${ANT.ush_temp}, según el Instituto Fueguino de Turismo.`,
  "ant-presupuesto-nota": `Suma lo devengado en los programas y actividades que el presupuesto rotula como antárticos, más la reparación del Irízar, que terminó de pagarse en ${ANT.irizar_ult}. Lo que las fuerzas gastan en la Antártida sin ese rótulo queda afuera. Desde ${ANT.fuerzas_desde}, el Alistamiento Antártico de cada fuerza aparece con su nombre: ese salto es en parte de rótulo y no de gasto. ` +
    `El Sostén Logístico aparece con ese nombre desde ${ANT.sosten_desde}. Los montos van en pesos de ${ANT.gasto_anio}, con el deflactor del PBI, como la obra pública por provincia.`,
  "glaciares-nota": `Cantidad de glaciares y cuerpos de hielo inventariados por el Instituto Argentino de Nivología, Glaciología y Ciencias Ambientales (IANIGLA). Las provincias que no aparecen no tienen glaciares inventariados. La cifra de Tierra del Fuego, Antártida e Islas del Atlántico Sur suma la Isla Grande y las islas Georgias del Sur y Sandwich del Sur.`,
  "clima-nota": `Desvío de la temperatura media anual del país respecto del promedio de 1991 a 2020, el período de referencia que usa hoy el Servicio Meteorológico Nacional (SMN). Cada franja es un año: celeste, más frío que la referencia, y rojo, más cálido. Pasá el cursor o tocá para ver el valor.`,
  // la cifra destacada ya dice las visitas al parque más visitado: el texto empieza por su parte del total
  "visitas-parque": `En ${vpq.ult}, ${vpq.top} (${vpq.top_lugar}) concentró el ${pct(vpq.pct_top)} de las visitas a los parques nacionales. Le siguió ${vpq.dos}, con ${n0(vpq.dos_v)} visitas. En 2019, antes de la pandemia, ${vpq.top} había recibido ${n0(vpq.top_2019)}.` +
    (vpq.par ? ` Entre enero y ${MESES[vpq.par_mes - 1]} de ${vpq.par}, según este tablero, los parques nacionales recibieron un ${pct(Math.abs(vpq.par_var))} ${vpq.par_var >= 0 ? "más" : "menos"} de visitas que en los mismos meses de ${vpq.par - 1}.` : ""),
  "vp-b1": String(vpq.ult),
  "vp-b2": vpq.par ? `${vpq.par}, ene a ${MESES[vpq.par_mes - 1].slice(0, 3)}` : "",
  "visitas-parque-nota": `Visitas registradas en ${vpq.n} áreas protegidas nacionales con control de ingreso, según el tablero de áreas protegidas de la Secretaría de Turismo y Ambiente. ` +
    `El tablero no tiene un enlace de descarga fijo: Datina guarda una copia de la exportación completa, mes a mes desde 2008, y la renueva a mano, así que puede quedar desactualizada respecto de la fuente.`,
  "pesca-nota": `Capturas de la flota comercial desembarcadas en puertos argentinos, en toneladas, según la Subsecretaría de Pesca y Acuicultura. La tabla descargable incluye el total de todas las especies.`,
  "pesca-rio-nota": `Captura comercial registrada en ríos y lagunas de las provincias que informan datos, en toneladas. No incluye la pesca deportiva ni la de subsistencia. La tabla descargable muestra cada especie por provincia.`,
  "soja-nota": `Superficie sembrada con soja de primera y de segunda (la que se siembra después de cosechar trigo u otro cultivo de invierno), en hectáreas, ` +
    `según la Dirección de Estimaciones Agrícolas de la Secretaría de Agricultura, Ganadería y Pesca. La soja de la campaña ${SJ.campania} se sembró en la primavera y el ` +
    `verano de ${SJ.campania.slice(0, 4)} y se cosechó en el otoño siguiente. ` +
    `El mapa divide a los departamentos que siembran soja en cinco grupos del mismo tamaño, y en gris quedan los que no la siembran. Un departamento grande ` +
    `puede sembrar más hectáreas sin que la soja ocupe una parte mayor de su tierra. Las cifras de la última campaña pueden corregirse en las publicaciones siguientes.`,
});
function mapaAreas(anim) {
  const el = G("mapa-areas");
  if (!el || !el.offsetParent) return;
  if (!GEO) { cargarGeo().then(() => mapaAreas(anim)).catch(() => sinDatos(el, "No se pudo cargar el mapa.")); return; }
  el.innerHTML = "";
  const w = Math.min(560, el.clientWidth), h = Math.round(w * 1.62) + 40;
  const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${w} ${h}`).attr("role", "img")
    .attr("aria-label", "Mapa de la Argentina con el porcentaje de territorio protegido por provincia");
  const proy = d3.geoMercator().fitExtent([[6, 6], [w - 6, h - 92]], GEO), camino = d3.geoPath(proy);
  const val = Object.fromEntries(T.areas_protegidas_provincias.map(d => [d.codigo_indec, d]));
  const cortes = [5, 10, 15, 20, 30], colores = ["#EEF5FC", "#D2E4F5", "#A9CBEA", "#7DAEDD", "#4C8DCA", "#2C74B5"];
  const escala = d3.scaleThreshold().domain(cortes).range(colores);
  const provs = svg.append("g").selectAll("path").data(GEO.features).join("path")
    .attr("class", d => "prov" + (d.properties.codigo_indec === prov ? " elegida" : "")).attr("d", camino)
    .attr("fill", d => escala(val[d.properties.codigo_indec]?.pct_territorio ?? 0));
  provs.filter(".elegida").raise();
  el.resaltar = () => { provs.attr("class", d => "prov" + (d.properties.codigo_indec === prov ? " elegida" : "")); provs.filter(".elegida").raise(); };
  // con el mouse al pasar y con el dedo al tocar (revisión de accesibilidad: en el celular el cuadro no aparecía)
  provs.on("pointermove pointerdown", (ev, d) => {
      const v = val[d.properties.codigo_indec], [mx, my] = d3.pointer(ev, el);
      mostrarTip(el, `<b>${v ? v.territorio : d.properties.nombre}</b><br>${v ? pct(v.pct_territorio) : "Sin dato"} del territorio protegido` +
        (v ? `<br>${n0(v.ha_terrestres)} hectáreas` : ""), mx, my);
    }).on("pointerleave", ocultarSiMouse);
  const areas = T.parques_nacionales_lista.filter(d => !d.marina && d.lat != null && d.lng != null);
  const r = d3.scaleSqrt().domain([0, d3.max(areas, d => d.hectareas)]).range([1.6, w < 420 ? 11 : 15]);
  const burb = svg.append("g").selectAll("circle").data(areas.sort((a, b) => b.hectareas - a.hectareas)).join("circle")
    .attr("class", "burbuja").attr("cx", d => proy([d.lng, d.lat])[0]).attr("cy", d => proy([d.lng, d.lat])[1]).attr("r", d => r(d.hectareas));
  if (anim) burb.attr("opacity", 0).transition().delay(escalon).duration(DUR_G).attr("opacity", 1);
  burb.on("pointermove pointerdown", (ev, d) => { const [mx, my] = d3.pointer(ev, el);
      mostrarTip(el, `<b>${d.nombre}</b><br>${d.caracter}, ${d.anio}<br>${n0(d.hectareas)} hectáreas`, mx, my); })
    .on("pointerleave", ocultarSiMouse);
  // leyenda: seis cuadros de 46 píxeles, más angostos si no entran (en 320 píxeles se cortaba el último, el de 30% o más)
  const paso = Math.min(46, (w - 12) / 6);
  const ley = svg.append("g").attr("class", "leyenda-mapa").attr("transform", `translate(${Math.max(6, w / 2 - paso * 3)},${h - 38})`);
  const et = ["0", "5", "10", "15", "20", "30%"];
  colores.forEach((c, i) => {
    ley.append("rect").attr("x", i * paso).attr("width", paso - 2).attr("height", 10).attr("rx", 2).attr("fill", c);
    ley.append("text").attr("x", i * paso).attr("y", 26).text(et[i]);
  });
  ley.append("text").attr("x", 0).attr("y", -6).text("% del territorio protegido");
}
/* Mapas de la Antártida (noviembre de 2026, pedido del autor: "un mapa con las bases de la Argentina y de los demás países"). Los otros mapas del sitio
   usan Mercator, que no llega al polo: estos usan una proyección estereográfica centrada en el Polo Sur, con el meridiano 60 Oeste hacia arriba, así la
   Península queda arriba, apuntando a Ushuaia. La geometría (scripts/geometria_antartida.py) se pide recién al dibujar. Al pasar el mouse o al tocar, la
   instalación más cercana a menos de 14 píxeles. La alternativa a todo esto es "Ver tabla". */
let TOPO_ANT = null;
const cargarAnt = () => TOPO_ANT ? Promise.resolve(TOPO_ANT) : d3.json("datos/antartida.topo.json").then(t => (TOPO_ANT = t));
const antProy = () => d3.geoStereographic().rotate([60, 90]);
const antCapa = k => topojson.feature(TOPO_ANT, TOPO_ANT.objects[k]);
// sin borde: el polígono de la tierra corta el globo por el meridiano 180, y con borde esa línea se ve en el Mar de Ross
function antFondo(svg, camino, detalle) {
  const g = svg.append("g");
  g.append("path").datum(antCapa(detalle ? "peninsula" : "tierra")).attr("d", camino).attr("fill", css("--faint")).attr("fill-opacity", .5);
  g.append("path").datum(antCapa(detalle ? "peninsula_barreras" : "barreras")).attr("d", camino).attr("fill", css("--superficie"));
  return g;
}
// los nombres de los puntos, sin pisarse: cada uno prueba ocho lugares alrededor del punto y, si ninguno está libre, no se escribe. Devuelve lo ocupado,
// para que los nombres de lugares que se escriben después tampoco pisen nada
function antEtiquetas(capa, puntos, w, h, nombre, clase, reservado = []) {
  const ocupado = [...reservado, ...puntos.map(p => [p.px - 5, p.py - 5, p.px + 5, p.py + 5])];
  const choca = c => ocupado.some(o => c[0] < o[2] && c[2] > o[0] && c[1] < o[3] && c[3] > o[1]);
  puntos.forEach(p => {
    const t = capa.append("text").attr("class", clase).text(nombre(p)), l = t.node().getComputedTextLength();
    for (const [dx, dy, anc] of [[8, 4, "start"], [-8, 4, "end"], [0, -9, "middle"], [0, 16, "middle"], [8, -7, "start"], [-8, -7, "end"], [8, 15, "start"], [-8, 15, "end"]]) {
      const x0 = anc === "start" ? p.px + dx : anc === "end" ? p.px + dx - l : p.px - l / 2, c = [x0, p.py + dy - 11, x0 + l, p.py + dy + 3];
      if (c[0] >= 2 && c[2] <= w - 2 && c[1] >= 2 && c[3] <= h - 2 && !choca(c)) { ocupado.push(c); t.attr("x", p.px + dx).attr("y", p.py + dy).attr("text-anchor", anc); return; }
    }
    t.remove();
  });
  return ocupado;
}
// las zonas protegidas (24 de noviembre de 2026, decisión del autor): los polígonos de la Secretaría del Tratado Antártico, simplificados por
// scripts/antartida_zonas_mapa.py. Si no llegan, el mapa se dibuja igual, sin ellas. d3 dibuja una figura con su contorno en el sentido de las
// agujas del reloj: una al revés cubriría todo el globo menos la zona, así que las que vienen al revés se dan vuelta
let ZONAS_ANT = null;
const cargarZonasAnt = () => ZONAS_ANT ? Promise.resolve(ZONAS_ANT) : d3.json("datos/antartida_zonas.geo.json").then(z => {
  z.features.forEach(f => f.geometry.coordinates.forEach(pol => { if (d3.geoArea({type: "Polygon", coordinates: pol}) > 2 * Math.PI) pol.forEach(a => a.reverse()); }));
  return (ZONAS_ANT = z);
}).catch(() => (ZONAS_ANT = {features: []}));
const antCorto = d => d.nombre_corto || d.nombre.replace(/^Base (Antártica |Naval Antártica |Aérea Antártica )?/, "").replace(/ (Station|Base|Antarctic Station|Research Station)$/, "");
function mapaAntartida(anim) {
  const el = G("ant-mapa");
  if (!el || !el.offsetParent) return;
  if (!TOPO_ANT || !T.antartida_instalaciones || !ZONAS_ANT) {
    if (!el.querySelector("svg")) esperando(el);
    Promise.all([cargarAnt(), cargarTabla("antartida_instalaciones"), cargarZonasAnt()]).then(() => mapaAntartida(anim)).catch(() => sinDatos(el, "No se pudo cargar el mapa."));
    return;
  }
  const sel = document.getElementById("ant-pais"), pais = MED["ant-pais"], pen = MED["ant-mapa"] === "peninsula";
  if (sel && sel.options.length < 2) {
    sel.innerHTML = [...new Set(T.antartida_instalaciones.map(d => d.pais))].sort((a, b) => a.localeCompare(b, "es")).map(p => `<option value="${p}">${p}</option>`).join("");
    sel.value = pais;
  }
  const w = Math.min(720, Math.max(300, el.clientWidth)), h = Math.round(w * (pen ? 1 : 1.1));
  el.innerHTML = ""; el.removeAttribute("aria-busy"); el.resaltar = null;
  const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${w} ${h}`).attr("role", "img").style("overflow", "hidden")
    .attr("aria-label", `Mapa de ${pen ? "la Península Antártica" : "la Antártida"} con las instalaciones de los programas antárticos, con las de ${pais} resaltadas, y las zonas protegidas. Los datos de las instalaciones están en «Ver tabla», debajo`);
  // el recuadro de cada vista: el continente sin el mar que queda lejos, y la Península desde Bahía Margarita hasta las Shetland del Sur. Las Orcadas
  // quedan afuera: están lejos, dejaban vacío un tercio del recuadro y se ven en el continente
  const marco = pen ? {type: "MultiPoint", coordinates: [[-70, -68.9], [-53, -61.4], [-66.5, -61.4], [-52, -66]]}
    : {type: "MultiPoint", coordinates: [[-68.3, -53.6], [120, -63], [30, -63], [-150, -63]]};
  const proy = antProy().clipAngle(pen ? 45 : 40).fitExtent([[8, 8], [w - 8, h - 8]], marco), camino = d3.geoPath(proy);
  svg.append("rect").attr("width", w).attr("height", h).attr("fill", css("--celeste-suave")).attr("opacity", .45);
  antFondo(svg, camino, pen);
  svg.append("path").datum(d3.geoCircle().center([0, -90]).radius(30)()).attr("d", camino).attr("fill", "none").attr("stroke", css("--muted")).attr("stroke-width", .8).attr("stroke-dasharray", "3 4");
  // las zonas protegidas, debajo de las bases: las que medirían menos de 4 píxeles van como un rombo en su centro
  const marcoZ = d => d.px >= 0 && d.px <= w && d.py >= 0 && d.py <= h;
  const zonas = ZONAS_ANT.features.map(f => { const b = camino.bounds(f), [px, py] = proy(d3.geoCentroid(f));
    return {f, px, py, chica: !(Math.max(b[1][0] - b[0][0], b[1][1] - b[0][1]) >= 4)}; }).filter(marcoZ);
  const capaZ = svg.append("g").attr("fill", css("--sol")).attr("stroke", css("--sol-fuerte")).attr("stroke-width", .8);
  capaZ.selectAll("path").data(zonas.filter(z => !z.chica)).join("path").attr("d", z => camino(z.f)).attr("fill-opacity", .6);
  capaZ.selectAll("rect").data(zonas.filter(z => z.chica)).join("rect").attr("x", z => z.px - 2.5).attr("y", z => z.py - 2.5).attr("width", 5).attr("height", 5)
    .attr("transform", z => `rotate(45 ${z.px} ${z.py})`);
  const lugares = pen ? [[-59, -61.7, "Islas Shetland del Sur"], [-64.5, -66.8, "Península Antártica"], [-54.5, -66, "Mar de Weddell"]]
    : [[-68.3, -54.8, "Ushuaia"], [60, -90, "Polo Sur"], [-42, -74, "Mar de Weddell"], [-170, -74, "Mar de Ross"], [-60, -60, "Paralelo 60 Sur"]];
  const capaLugares = svg.append("g");
  const marcoV = d => d.px >= 0 && d.px <= w && d.py >= 0 && d.py <= h;
  const vis = T.antartida_instalaciones.map(d => { const [px, py] = proy([d.lon, d.lat]); return {...d, px, py, sel: d.pais === pais || d.otro_pais === pais}; }).filter(marcoV).sort((a, b) => a.sel - b.sel);
  const color = d => d.sel ? css("--celeste-fuerte") : css("--muted");
  const llena = d => d.temporada === "Todo el año";
  const puntos = svg.append("g").selectAll("circle").data(vis).join("circle").attr("cx", d => d.px).attr("cy", d => d.py).attr("r", d => d.sel ? (pen ? 6 : 5) : (pen ? 4 : 3))
    .attr("fill", d => llena(d) ? color(d) : css("--bg")).attr("stroke", color).attr("stroke-width", d => d.sel ? 2 : 1.2);
  if (anim && !REDUCIR) puntos.attr("opacity", 0).transition().delay(escalon).duration(DUR_G).attr("opacity", 1);
  // primero los nombres de las más grandes y de las que no informan capacidad: suelen ser las más alejadas
  const conNombre = vis.filter(d => d.sel).sort((a, b) => (b.capacidad ?? 999) - (a.capacidad ?? 999));
  // la leyenda, donde no hay bases: abajo a la izquierda en el continente y abajo a la derecha en la Península, sobre el Mar de Weddell
  const leyY = h - 70, anchoLey = 92 + Math.max(0, pais.length - 11) * 6 + 110, leyX = pen ? w - anchoLey - 4 : 12;
  const ocupado = antEtiquetas(svg.append("g"), conNombre, w, h, antCorto, "etq-fuerte", [[leyX - 8, leyY - 12, leyX + anchoLey + 4, leyY + 52]]);
  lugares.forEach(([lon, lat, nom]) => {
    const [x, y] = proy([lon, lat]), t = capaLugares.append("text").attr("class", "etq-suave").attr("text-anchor", "middle").attr("x", x).attr("y", y).text(nom), l = t.node().getComputedTextLength();
    const c = [x - l / 2, y - 11, x + l / 2, y + 3];
    if (c[0] < 2 || c[2] > w - 2 || ocupado.some(o => c[0] < o[2] && c[2] > o[0] && c[1] < o[3] && c[3] > o[1])) t.remove(); else ocupado.push(c);
  });
  const ley = svg.append("g").attr("transform", `translate(${leyX},${leyY})`);
  ley.append("rect").attr("x", -6).attr("y", -11).attr("width", anchoLey + 8).attr("height", 62).attr("rx", 6).attr("fill", css("--bg")).attr("opacity", .85);
  ley.append("rect").attr("x", 1.5).attr("y", 36.5).attr("width", 7).attr("height", 7).attr("rx", 1).attr("fill", css("--sol")).attr("fill-opacity", .6).attr("stroke", css("--sol-fuerte")).attr("stroke-width", .8);
  ley.append("text").attr("x", 14).attr("y", 44).attr("class", "etq").text("Zona protegida");
  [[0, 0, css("--muted"), true, "Todo el año"], [92, 0, css("--muted"), false, "Solo en verano"], [0, 20, css("--celeste-fuerte"), true, pais], [92 + Math.max(0, pais.length - 11) * 6, 20, css("--muted"), true, "Otros países"]].forEach(([x, y, c, ll, t]) => {
    ley.append("circle").attr("cx", x + 5).attr("cy", y).attr("r", 4.5).attr("fill", ll ? c : css("--bg")).attr("stroke", c).attr("stroke-width", 1.4);
    ley.append("text").attr("x", x + 14).attr("y", y + 4).attr("class", "etq").text(t);
  });
  const anillo = svg.append("circle").attr("r", 9).attr("fill", "none").attr("stroke", css("--ink")).attr("stroke-width", 1.5).attr("opacity", 0);
  const dl = d3.Delaunay.from(vis, d => d.px, d => d.py);
  const tipo = d => `${d.tipo}, ${d.temporada.toLowerCase()}`;
  const ver = ev => {
    const [sx, sy] = d3.pointer(ev, svg.node()), [ex, ey] = d3.pointer(ev, el), d = vis[dl.find(sx, sy)];
    if (d && Math.hypot(d.px - sx, d.py - sy) < 14) {
      anillo.attr("cx", d.px).attr("cy", d.py).attr("opacity", 1);
      return mostrarTip(el, `<b>${d.nombre}</b><br>${d.pais}${d.otro_pais ? ` ${yE(d.otro_pais)}` : ""}<br>${tipo(d)}` + (d.anio ? `<br>Desde ${d.anio}` : "") +
        (d.capacidad != null ? `<br>Capacidad máxima: ${n0(d.capacidad)} personas` : "<br>Capacidad sin informar") + (d.estado === "Abierta" ? "" : `<br>${d.estado}`), ex, ey);
    }
    // sin una base cerca, la zona protegida que está debajo o, si es un rombo, cerca
    const z = zonas.find(z => z.chica && Math.hypot(z.px - sx, z.py - sy) < 8) || zonas.find(z => !z.chica && d3.geoContains(z.f, proy.invert([sx, sy])));
    anillo.attr("opacity", 0);
    if (z) { const q = z.f.properties;
      return mostrarTip(el, `<b>${q.nombre}</b><br>Zona antártica especialmente ${q.tipo === "ZAEP" ? "protegida" : "administrada"} ${q.numero}${q.marina ? ", marina" : ""}` +
        `<br>Propuesta por ${lista(q.paises)}<br>Superficie: ${q.km2 < 10 ? n1(q.km2) : n0(q.km2)} km²`, ex, ey); }
    ocultarTip();
  };
  svg.append("rect").attr("width", w).attr("height", h).attr("fill", "transparent").style("touch-action", "pan-y")
    .on("pointermove", ver).on("pointerdown", ver).on("pointerleave", () => { anillo.attr("opacity", 0); ocultarTip(); });
  const fi = el.closest(".ficha"), bi = fi?.querySelector(".accion.imagen"); if (bi) bi.hidden = !svgUnico(fi);
}
/* Los siete reclamos. Hasta el paralelo 60, cada sector es una porción: las superpuestas se ven más oscuras. Afuera, una banda por país con su nombre,
   en tres renglones arriba, donde se superponen la Argentina, Chile y el Reino Unido. Se dibujan como figuras en la pantalla y no como polígonos del globo,
   porque los meridianos y el paralelo no son rectas de la esfera */
function mapaReclamos(anim) {
  const el = G("ant-reclamos");
  if (!el || !el.offsetParent) return;
  if (!TOPO_ANT || !T.antartida_reclamos) {
    if (!el.querySelector("svg")) esperando(el);
    Promise.all([cargarAnt(), cargarTabla("antartida_reclamos")]).then(() => mapaReclamos(anim)).catch(() => sinDatos(el, "No se pudo cargar el mapa."));
    return;
  }
  const w = Math.min(660, Math.max(300, el.clientWidth)), angosto = w < 460, banda = angosto ? 17 : 19, luz = 3, paso = banda + luz, m = 6;
  const R0 = w / 2 - m - paso - (angosto ? 2 : 8), h = 2 * R0 + 4 * paso + 2 * m + (angosto ? 14 : 18), cx = w / 2, cy = m + 3 * paso + R0;
  el.innerHTML = ""; el.removeAttribute("aria-busy"); el.resaltar = null;
  const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${w} ${h}`).attr("role", "img").style("overflow", "hidden")
    .attr("aria-label", "Mapa de la Antártida con los sectores que reclaman siete países, y dónde se superponen. Los datos están en «Ver tabla», debajo");
  const proy = antProy().clipAngle(30).scale(R0 / Math.tan(Math.PI / 12)).translate([cx, cy]), camino = d3.geoPath(proy);
  // el ángulo en la pantalla de un meridiano: el 60 Oeste va hacia arriba y los grados crecen hacia el este, en el sentido de las agujas del reloj
  const ang = lon => (lon + 60) * Math.PI / 180, pt = (lon, r) => [cx + r * Math.sin(ang(lon)), cy - r * Math.cos(ang(lon))];
  const grados = t => ((t.hasta - t.desde) % 360 + 360) % 360;
  const porcion = t => { const [a, b] = pt(t.desde, R0), [c, d] = pt(t.hasta, R0); return `M${cx},${cy}L${a},${b}A${R0},${R0} 0 ${grados(t) > 180 ? 1 : 0} 1 ${c},${d}Z`; };
  svg.append("circle").attr("cx", cx).attr("cy", cy).attr("r", R0).attr("fill", css("--celeste-suave")).attr("opacity", .45);
  antFondo(svg, camino, false);
  const tramos = T.antartida_reclamos, reclamos = tramos.filter(t => t.pais !== "Sin reclamar");
  const esArg = t => t.pais === "Argentina";
  const porciones = svg.append("g").selectAll("path").data(reclamos).join("path").attr("d", porcion)
    .attr("fill", d => esArg(d) ? css("--celeste-fuerte") : css("--muted")).attr("fill-opacity", d => esArg(d) ? .38 : .16).attr("stroke", css("--bg")).attr("stroke-width", 1);
  if (anim && !REDUCIR) porciones.attr("opacity", 0).transition().delay(escalon).duration(DUR_G).attr("opacity", 1);
  svg.append("circle").attr("cx", cx).attr("cy", cy).attr("r", R0).attr("fill", "none").attr("stroke", css("--muted")).attr("stroke-width", .8);
  svg.append("circle").attr("cx", cx).attr("cy", cy).attr("r", 2.5).attr("fill", css("--ink"));
  svg.append("text").attr("x", cx).attr("y", cy + 16).attr("text-anchor", "middle").attr("class", "etq-suave").text("Polo Sur");
  // las bandas: cada una en su renglón, con el nombre adentro siguiendo la curva, y afuera si no entra
  const renglon = t => t.pais === "Chile" ? 1 : t.pais === "Reino Unido" ? 2 : 0;
  const rDe = t => R0 + luz + banda / 2 + renglon(t) * paso;
  const arco = (t, r, alRevez) => { const [a, b] = pt(t.desde, r), [c, d] = pt(t.hasta, r); return alRevez ? `M${c},${d}A${r},${r} 0 ${grados(t) > 180 ? 1 : 0} 0 ${a},${b}` : `M${a},${b}A${r},${r} 0 ${grados(t) > 180 ? 1 : 0} 1 ${c},${d}`; };
  const capa = svg.append("g");
  tramos.forEach((t, i) => {
    const libre = t.pais === "Sin reclamar", medio = t.desde + grados(t) / 2, abajo = Math.cos(ang(medio)) < 0, r = rDe(t);
    capa.append("path").attr("d", arco(t, r, false)).attr("fill", "none").attr("stroke", esArg(t) ? css("--celeste-fuerte") : libre ? css("--faint") : css("--superficie-3")).attr("stroke-width", libre ? 1.2 : banda)
      .attr("stroke-dasharray", libre ? "3 4" : null);
    const idArco = `ant-arco-${i}`;
    capa.append("path").attr("id", idArco).attr("d", arco(t, abajo ? r + 4 : r - 4, abajo)).attr("fill", "none");
    const nombre = t.pais, medir = capa.append("text").attr("class", "etq").text(nombre), largo = medir.node().getComputedTextLength(); medir.remove();
    if (largo + 10 < r * grados(t) * Math.PI / 180) {
      const tx = capa.append("text").attr("class", esArg(t) ? "etq-fuerte" : libre ? "etq-suave" : "etq").style("fill", esArg(t) ? css("--bg") : null).style("stroke", "none");
      tx.append("textPath").attr("href", `#${idArco}`).attr("startOffset", "50%").attr("text-anchor", "middle").text(nombre);
    } else {
      const [x, y] = pt(medio, r + banda / 2 + (abajo ? 12 : 8));
      capa.append("text").attr("class", "etq").attr("x", x).attr("y", y).attr("text-anchor", "middle").text(nombre);
    }
  });
  // al pasar el mouse o tocar: quién reclama ese meridiano
  const quien = lon => reclamos.filter(t => { const g = ((lon - t.desde) % 360 + 360) % 360; return g < grados(t); });
  const lista = l => l.length > 1 ? `${l.slice(0, -1).join(", ")} ${yE(l[l.length - 1])}` : l[0];
  const ver = ev => {
    const [sx, sy] = d3.pointer(ev, svg.node()), [ex, ey] = d3.pointer(ev, el), dx = sx - cx, dy = sy - cy, r = Math.hypot(dx, dy);
    if (r > R0 + 3 * paso + 4) return ocultarTip();
    const lon = ((Math.atan2(dx, -dy) * 180 / Math.PI - 60 + 540) % 360) - 180, l = quien(lon);
    const mer = `Meridiano ${Math.abs(Math.round(lon))}° ${lon < 0 ? "Oeste" : "Este"}`;
    mostrarTip(el, `<b>${mer}</b><br>` + (l.length ? `Lo reclama${l.length > 1 ? "n" : ""} ${lista([...new Set(l.map(t => t.pais))])}` : "Ningún país lo reclama"), ex, ey);
  };
  svg.append("rect").attr("width", w).attr("height", h).attr("fill", "transparent").style("touch-action", "pan-y").on("pointermove", ver).on("pointerdown", ver).on("pointerleave", ocultarTip);
  const fi = el.closest(".ficha"), bi = fi?.querySelector(".accion.imagen"); if (bi) bi.hidden = !svgUnico(fi);
}
/* Las bases argentinas: una fila por base, de la más vieja a la más nueva, con una línea desde el año en que se fundó hasta hoy. Llena si funciona todo el año y
   punteada si funciona solo en verano. La línea dice desde cuándo existe, no que haya funcionado sin pausa: lo aclara la nota */
function lineaBases(el, anim) {
  const data = [...T.antartida_bases].sort((a, b) => d3.ascending(a.fundacion, b.fundacion)), angosto = el.clientWidth < 520, fila = angosto ? 26 : 28;
  const C = lienzo(el, data.length * fila + 58, {t: 52, r: 14, b: 6, l: angosto ? 76 : 96}), {g, iw, svg} = C;
  const fin = +R.actualizado.slice(-4), x = d3.scaleLinear().domain([1900, fin]).range([0, iw]);
  g.append("g").attr("class", "grilla").call(d3.axisTop(x).tickValues(d3.range(1900, fin, 25)).tickSize(-data.length * fila).tickFormat("")).call(a => a.select(".domain").remove());
  g.append("g").attr("class", "eje").call(d3.axisTop(x).tickValues(d3.range(1900, fin, 25)).tickFormat(d3.format("d")).tickSize(0).tickPadding(6)).call(a => a.select(".domain").remove());
  const col = css("--celeste-fuerte"), perm = d => d.condicion === "permanente";
  const ley = svg.append("g").attr("transform", "translate(6,16)");
  [[0, null, "Todo el año"], [106, "5 4", "Solo en verano"]].forEach(([xx, dash, t]) => {
    ley.append("line").attr("x1", xx).attr("x2", xx + 22).attr("y1", 0).attr("y2", 0).attr("stroke", col).attr("stroke-width", 3).attr("stroke-dasharray", dash);
    ley.append("text").attr("x", xx + 28).attr("y", 4).attr("class", "etq").text(t);
  });
  const filas = g.selectAll("g.f").data(data).join("g").attr("class", "f").attr("transform", (d, i) => `translate(0,${i * fila + fila / 2})`);
  filas.append("rect").attr("x", -C.w).attr("y", -fila / 2).attr("width", C.w * 2).attr("height", fila).attr("fill", "transparent");
  const trazos = filas.append("line").attr("x1", d => x(d.anio)).attr("x2", iw).attr("stroke", col).attr("stroke-width", 3).attr("stroke-dasharray", d => perm(d) ? null : "5 4");
  filas.append("circle").attr("cx", d => x(d.anio)).attr("r", 5).attr("fill", col).attr("stroke", css("--bg")).attr("stroke-width", 1.5);
  filas.append("text").attr("x", -10).attr("dy", ".35em").attr("text-anchor", "end").attr("class", "etq-fuerte").text(d => d.base);
  filas.append("text").attr("x", d => x(d.anio) + 9).attr("y", -6).attr("class", "etq-suave").text(d => d.anio);
  if (anim && !REDUCIR) trazos.attr("opacity", 0).transition().delay(escalon).duration(DUR_G).attr("opacity", 1);
  const dia = s => { const [a, m, dd] = s.split("-"); return `${+dd} de ${MESES[+m - 1]} de ${a}`; };
  filas.on("pointermove pointerdown", (ev, d) => { const [mx, my] = d3.pointer(ev, el);
    mostrarTip(el, `<b>${d.base}</b><br>${d.lugar}<br>Desde el ${dia(d.fundacion)}<br>${perm(d) ? "Funciona todo el año" : "Funciona solo en verano"}<br>A cargo de: ${d.administra}` +
      (d.capacidad != null ? `<br>Capacidad máxima: ${n0(d.capacidad)} personas` : "<br>Capacidad sin informar") + (d.estado === "Abierta" ? "" : `<br>${d.estado} (COMNAP)`), mx, my); })
    .on("pointerleave", ocultarSiMouse);
}
Object.assign(MED, {
  "ant-paises": "instalaciones",
  "ant-zonas": "zonas_protegidas",
  protegida: "pct_territorio",
  "visitas-parque": "visitas_ult",
});
Object.assign(DIB, {
  protegida: a => MED.protegida === "pct_territorio"
    ? barrasH(G("protegida"), {anim:a, data: T.areas_protegidas_provincias, k:"pct_territorio", ref: nt.pct, refLab:`País ${pct(nt.pct)}`,
        ref2: OC.protegida.ocde, ref2Lab: `Promedio OCDE ${OC.protegida.anio}: ${pct(OC.protegida.ocde)}`, vf: v => n1(v) + "%", af: v => v + "%", dif: "puntos"})
    : barrasH(G("protegida"), {anim:a, data: T.areas_protegidas_provincias, k:"m2_por_habitante", ref: nt.m2_pais, refLab:`País ${n0(nt.m2_pais)} m²`,
        vf: v => n0(v) + " m²", af: v => n0(v)}),
  parques: a => lineas(G("parques"), {anim:a, data: T.parques_nacionales_historia, x:"anio", y0:0, escalones:true, vf: v => M(v) + " ha", yf: M,
    series:[{k:"ha_terrestres", lab:"Terrestres", c:NAR, w:3}, {k:"ha_marinas", lab:"Marinas", c:FRI, w:2.4}]}),
  especies: a => barrasH(G("especies"), {anim:a, data: T.especies_areas_nacionales, k:"animales", vf: n0, af: n0, l: 250, lAngosto: 170}),
  visitas: a => lineas(G("visitas"), {anim:a, data: T.visitas_parques_nacionales, x:"anio", y0:0, vf: v => n2(v / 1e6) + " M", yf: M,
    series:[{k:"total", lab:"Total", c:css("--ink"), w:2.6}, {k:"residentes", lab:"Residentes", c:NAR, w:2.4}, {k:"no_residentes", lab:"No residentes", c:FRI, w:2.4}]}),
  "mapa-areas": a => mapaAreas(a),
  "visitas-parque": a => barrasH(G("visitas-parque"), {anim:a, data: T.visitas_por_parque.filter(d => d[MED["visitas-parque"]] != null),
    k: MED["visitas-parque"], vf: n0, af: v => n0(v / 1000) + " mil", l: 270, lAngosto: 175}),
  pesca: a => lineas(G("pesca"), {anim:a, data: T.desembarques_especies, x:"anio", y0:0, vf: v => n0(v / 1000) + " mil t", yf: v => n0(v / 1000) + " mil",
    series: pe.top.map((k, i) => ({k, lab: k.replace(" argentino", "").replace(" argentina", ""), c: [NAR, FRI, GRIS][i], w: i ? 2.4 : 3}))}),
  "pesca-rio": a => barrasH(G("pesca-rio"), {anim:a, data: T.pesca_continental, k:"toneladas", vf: v => n0(v) + " t", af: n0}),
  // soja (tanda 3 del plan de mejora): el mapa por departamento, las provincias y la serie del país
  soja: conTablas("soja", () => MED.soja === "mapa" ? ["soja_departamentos"] : [], a => {
    const v = MED.soja, el = G("soja"), filas = T.soja_provincias.filter(r => r.codigo_indec !== "00"), fp = filas.find(r => r.codigo_indec === prov);
    const tipP = r => `<br>${pct(r.pct_pais)} de la del país<br>${n0(r.produccion_t)} toneladas producidas` +
      (r.rendimiento_kg_ha ? `<br>${n0(r.rendimiento_kg_ha)} kilos por hectárea cosechada` : "");
    refrescarTabla("f-soja");
    if (v === "serie") {
      const ult = T.soja_pais[T.soja_pais.length - 1];
      $t("soja").textContent = `La superficie sembrada con soja pasó de ${n0(SJ.ini_ha)} hectáreas en la campaña ${SJ.ini} a ${n1(SJ.millones_ha)} millones en ${SJ.campania}. ` +
        `La más grande fue la de ${SJ.max_campania}, con ${n1(SJ.max_millones_ha)} millones. En ${SJ.campania} se cosecharon ${n1(SJ.cosechada_millones_ha)} millones de ` +
        `hectáreas y se produjeron ${n1(SJ.produccion_millones_t)} millones de toneladas, ${n0(ult.rendimiento_kg_ha)} kilos por hectárea cosechada.`;
      return lineas(el, {anim: a, data: T.soja_pais, x: "anio", y0: 0, vf: v => n1(v / 1e6) + " M", yf: v => n0(v / 1e6) + " M", xl: r => `Campaña ${r.campania}`,
        series: [{k: "sembrada_ha", lab: "Sembrada", c: NAR, w: 3}, {k: "cosechada_ha", lab: "Cosechada", c: FRI, w: 2.4}]});
    }
    $t("soja").textContent = (NOMBRES[prov] ? (fp ? `En ${fp.territorio} se sembraron ${n0(fp.sembrada_ha)} hectáreas de soja en la campaña ${SJ.campania}, el ` +
      `${pct(fp.pct_pais)} de la superficie del país. ` : `En ${NOMBRES[prov]} no se registró soja sembrada en la campaña ${SJ.campania}. `) : "") + TX.soja;
    if (v === "provincias")
      return barrasH(el, {anim: a, data: filas, k: "sembrada_ha", vf: v => v >= 1e6 ? n1(v / 1e6) + " M" : n0(v / 1e3) + " mil",
        af: v => v >= 1e6 ? n1(v / 1e6).replace(/,0$/, "") + " M" : ejeMil(v),
        tip: d => `<b>${d.territorio}</b><br>${n0(d.sembrada_ha)} hectáreas sembradas en ${SJ.campania}` + tipP(d)});
    const dep = Object.fromEntries(T.soja_departamentos.map(r => [r.codigo_dep, r]));
    mapaDep(el, {anim: a, filas: T.soja_departamentos, k: "sembrada_ha", nombre: "Hectáreas sembradas con soja", vf: ejeMil, tf: n0, sin: "no siembra soja", cero: "sin soja",
      extra: id => dep[id] ? tipP(dep[id]) : ""});
  }),
  glaciares: a => barrasH(G("glaciares"), {anim:a, data: T.glaciares_provincias, k:"glaciares", vf: n0, af: n0}),
  // la Antártida (noviembre de 2026): las tablas se piden al dibujar. En los gráficos de países se resalta la Argentina
  "ant-mapa": a => mapaAntartida(a),
  "ant-reclamos": a => mapaReclamos(a),
  "ant-bases": conTablas("ant-bases", ["antartida_bases"], a => lineaBases(G("ant-bases"), a)),
  "ant-paises": conTablas("ant-paises", ["antartida_paises"], a => { const k = MED["ant-paises"];
    barrasH(G("ant-paises"), {anim:a, data: T.antartida_paises.filter(d => d[k] > 0).map(d => ({...d, codigo_indec: d.pais, territorio: d.pais})), k, marcar: new Set(["Argentina"]), vf: n0, af: n0, l: 130, lAngosto: 104,
      tip: d => `<b>${d.pais}</b><br>${d.instalaciones} ${d.instalaciones === 1 ? "instalación" : "instalaciones"}: ${d.todo_el_anio} todo el año y ${d.solo_en_verano} solo en verano<br>Capacidad máxima: ${n0(d.capacidad)} personas` + (d.sin_capacidad_informada ? ` (${d.sin_capacidad_informada} sin informar)` : "")}); }),
  "ant-tratado": conTablas("ant-tratado", ["antartida_tratado_serie"], a => lineas(G("ant-tratado"), {anim:a, data: T.antartida_tratado_serie, x:"anio", y0:0, escalones:true, vf: n0,
    series: [{k:"partes", lab:"Todas las partes", corto:"Partes", c:NAR, w:3}, {k:"consultivas", lab:"Partes consultivas", corto:"Consultivas", c:FRI, w:2.4}]})),
  "ant-zonas": conTablas("ant-zonas", ["antartida_zonas_paises"], a => { const k = MED["ant-zonas"];
    barrasH(G("ant-zonas"), {anim:a, data: T.antartida_zonas_paises.filter(d => d[k] > 0).map(d => ({...d, codigo_indec: d.pais, territorio: d.pais})), k, marcar: new Set(["Argentina"]), vf: n0, af: n0, l: 130, lAngosto: 104,
      tip: d => `<b>${d.pais}</b><br>${d.zonas_protegidas} zonas protegidas, ${d.zonas_administradas} zonas administradas y ${d.sitios_historicos} sitios históricos`}); }),
  "ant-temperatura": conTablas("ant-temperatura", ["antartida_temperatura"], a => { const s = MED["ant-temperatura"], e = ANT.temp[s], sg = v => (v > 0 ? "+" : "") + n1(v);
    lineas(G("ant-temperatura"), {anim:a, data: T.antartida_temperatura.filter(r => r.anio >= e.ini && r.anio <= e.fin), x:"anio", conNegativos:true, ref:0, vf: v => sg(v) + " °C", yf: sg,
      series: [{k:s, lab:"Cada año", c:css("--celeste"), w:1.4, ct:"--celeste-fuerte"}, {k:`${s}_10`, lab:"Promedio de diez años", corto:"Diez años", c:NAR, w:3}]}); }),
  "ant-hielo": conTablas("ant-hielo", ["antartida_hielo"], a => { const sg = v => (v > 0 ? "+" : "") + n2(v);
    lineas(G("ant-hielo"), {anim:a, data: T.antartida_hielo, x:"anio", conNegativos:true, ref:0, vf: sg, yf: v => (v > 0 ? "+" : "") + n1(v),
      series: [{k:"septiembre_dif", lab:"Septiembre", c:NAR, w:2.6}, {k:"febrero_dif", lab:"Febrero", c:FRI, w:2.2}]}); }),
  "ant-turismo": conTablas("ant-turismo", ["antartida_turismo"], a => lineas(G("ant-turismo"), {anim:a, data: T.antartida_turismo, x:"anio", xl: d => d.temporada, y0:0, vf: n0, yf: v => n0(v / 1000) + " mil",
    series: [{k:"total", lab:"En total", c:NAR, w:3}, {k:"desembarcan", lab:"Desembarcan", c:FRI, w:2.2}, {k:"solo_crucero", lab:"Solo crucero", c:GRIS, w:2, ct:"--muted"}]})),
  "ant-presupuesto": conTablas("ant-presupuesto", ["antartida_presupuesto"], a => lineas(G("ant-presupuesto"), {anim:a, data: T.antartida_presupuesto, x:"anio", y0:0, vf: n1, yf: n0,
    series: [{k:"total", lab:"En total", c:NAR, w:3}, {k:"sosten_logistico", lab:"Sostén logístico", corto:"Sostén", c:FRI, w:2.2}, {k:"plan_antartico", lab:"Plan Antártico", corto:"Plan", c:GRIS, w:2, ct:"--muted"}]})),
  clima: a => franjas(G("clima"), {anim:a, data: T.clima_desvio, k:"desvio_temperatura"}),
});
Object.assign(MED, {
  "cobertura-suelo": "natural",
});
Object.assign(DIB, {
  // la cobertura del suelo (plan de mejora, sección 10, 31 de octubre de 2026): cada provincia en el primer año y en el último, sin verde ni
  // rojo (no es un cambio bueno o malo indiscutido)
  "cobertura-suelo": a => {
    const v = MED["cobertura-suelo"], fp = T.cobertura_suelo_provincias.find(r => r.codigo_indec === prov);
    let txt = LEAD["cobertura-suelo"](v);
    if (fp && !MBS.top.some(t => t[0] === fp.territorio) && fp.territorio !== MBS.bos_top[0])
      txt += ` En ${fp.territorio}, del ${pct(fp[`pct_${v}_inicio`])} al ${pct(fp[`pct_${v}_final`])}.`;
    $t("cobertura-suelo").textContent = txt;
    pesas(G("cobertura-suelo"), {anim: a, data: T.cobertura_suelo_provincias, a: `pct_${v}_inicio`, b: `pct_${v}_final`, la: String(MBS.ini),
      lb: String(MBS.fin), uDif: " puntos", pais: v === "bosque" ? [MBS.bos_ini, MBS.bos] : [MBS.nat_ini, MBS.nat]});
  },
});
const cuPedidos = {};
// el archivo de una cumbre: las alturas llegan como enteros de 16 bits en base64 (la altura menos la mínima del recuadro)
const cuCargar = id => cuPedidos[id] ||= d3.json(`datos/relieve/${id}.json?v=${RELIEVE[id]}`).then(d => {
  const n = d.n, bin = atob(d.z), z = new Float64Array(n * n);
  for (let i = 0; i < z.length; i++) z[i] = d.min + (bin.charCodeAt(2 * i) | bin.charCodeAt(2 * i + 1) << 8);
  return prepararCumbre(d, z);
}, e => { delete cuPedidos[id]; throw e; });
function prepararCumbre(d, crudo) {
  const n = d.n, celda = d.lado_km * 1000 / n;
  // un suavizado de una celda saca las islas de una sola celda que deja el modelo (la altura del puntero usa el dato sin suavizar)
  const z = d3.blur2({data: Float64Array.from(crudo), width: n, height: n}, 1).data;
  const aPath = coords => {
    const p = new Path2D();
    for (const pol of coords) for (const anillo of pol) { anillo.forEach(([x, y], k) => k ? p.lineTo(x, y) : p.moveTo(x, y)); p.closePath(); }
    return p;
  };
  const capas = d3.contours().size([n, n]).thresholds(d3.range(CU.BASE + CU.PASO, d3.max(z) + 1, CU.PASO))(z)
    .filter(c => c.coordinates.length).map(c => ({h: c.value, path: aPath(c.coordinates), indice: c.value % CU.INDICE === 0}));
  // la altura de la capa que cubre cada celda: la de los costados del bloque y la que ubica el puntero
  const esc = z.map(v => Math.max(CU.BASE, Math.floor(v / CU.PASO) * CU.PASO));
  // la cumbre: el punto más alto del modelo a menos de 1,5 km de las coordenadas del IGN (en el recuadro puede haber otra más alta)
  let cima = -1;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++)
    if (Math.hypot(i + .5 - n / 2, j + .5 - n / 2) <= 1500 / celda && (cima < 0 || crudo[j * n + i] > crudo[cima])) cima = j * n + i;
  const glaciares = (d.glaciares || []).length ? aPath(d.glaciares) : null;
  return {n, celda, crudo, esc, capas, cima, glaciares, lado: d.lado_km, inventarios: d.inventarios || [], anios: d.anios_imagenes || []};
}
function dibujarCumbre(ctx, M, pico, st, W, H) {
  const n = M.n, diag = n * Math.SQRT2, t = st.t;
  const fi = Math.PI / 2 - t * (Math.PI / 2 - CU.FI), sf = Math.sin(fi);
  // que entre entero en los dos estados: inclinado lo limita el ancho y visto desde arriba, el alto
  const s = Math.min(W * .94 / diag, (H - 72) / (diag * sf + CU.R_MAX / M.celda * CU.EXAG * Math.cos(fi)));
  const k = s * CU.EXAG * Math.cos(fi) / M.celda;     // píxeles por metro de altura
  const cx = W / 2, cy = 36 + (H - 72) / 2 + CU.R_MAX * k / 2;
  // como mapa, el norte arriba: el giro elegido se aplica a medida que se levanta
  const th = st.giro * t, cos = Math.cos(th), sin = Math.sin(th);
  const pr = (x, y, h) => {
    const u = x - n / 2, v = y - n / 2;
    return [cx + s * (cos * u - sin * v), cy + s * sf * (sin * u + cos * v) - k * (h - CU.BASE)];
  };
  const E = devicePixelRatio || 1;
  const tr = h => [s * cos, s * sf * sin, -s * sin, s * sf * cos, cx - s * (cos - sin) * n / 2, cy - s * sf * (sin + cos) * n / 2 - k * (h - CU.BASE)].map(v => v * E);
  ctx.setTransform(E, 0, 0, E, 0, 0);
  ctx.clearRect(0, 0, W, H);
  // los costados del bloque que miran hacia quien mira, con una línea cada 500 metros
  const lados = [
    {nx: 0, ny: 1, a: [0, n], b: [n, n], celda: i => (n - 1) * n + i},
    {nx: 0, ny: -1, a: [n, 0], b: [0, 0], celda: i => n - 1 - i},
    {nx: 1, ny: 0, a: [n, n], b: [n, 0], celda: i => (n - 1 - i) * n + n - 1},
    {nx: -1, ny: 0, a: [0, 0], b: [0, n], celda: i => i * n},
  ];
  if (k > 1e-3) for (const L of lados) {
    if (sin * L.nx + cos * L.ny <= 0) continue;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const h = M.esc[L.celda(i)];
      for (const f of [i / n, (i + 1) / n]) pts.push(pr(L.a[0] + (L.b[0] - L.a[0]) * f, L.a[1] + (L.b[1] - L.a[1]) * f, h));
    }
    pts.push(pr(L.b[0], L.b[1], CU.BASE - CU.PIE), pr(L.a[0], L.a[1], CU.BASE - CU.PIE));
    const p = new Path2D(); pts.forEach(([x, y], j) => j ? p.lineTo(x, y) : p.moveTo(x, y)); p.closePath();
    ctx.fillStyle = L.nx ? "#DCCBA2" : "#E5D6B2"; ctx.fill(p);
    ctx.save(); ctx.clip(p); ctx.strokeStyle = "rgba(127,85,0,.22)"; ctx.lineWidth = 1;
    for (let h = CU.BASE; h <= 7000; h += CU.INDICE) {
      const [x1, y1] = pr(L.a[0], L.a[1], h), [x2, y2] = pr(L.b[0], L.b[1], h);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
    ctx.restore();
  }
  const todo = new Path2D(); todo.rect(0, 0, n, n);
  ctx.setTransform(...tr(CU.BASE)); ctx.fillStyle = CU.tinte(CU.BASE); ctx.fill(todo);
  const glaciar = (path, h) => {
    if (!M.glaciares) return;
    ctx.save(); ctx.setTransform(...tr(h)); ctx.clip(path, "evenodd"); ctx.fillStyle = "rgba(116,172,223,.5)"; ctx.fill(M.glaciares, "evenodd"); ctx.restore();
  };
  glaciar(todo, CU.BASE);
  // cada capa: su pared (copias corridas hacia abajo), su cara de arriba, los glaciares que caen en ella y su curva
  const paso = CU.PASO * k, copias = Math.min(6, Math.ceil(paso / 1.2));
  for (const c of M.capas) {
    const color = CU.tinte(c.h);
    if (paso > .3) {
      ctx.fillStyle = d3.interpolateRgb(color, "#A8926A")(.45);
      for (let j = copias; j >= 1; j--) { ctx.setTransform(...tr(c.h - CU.PASO * j / copias)); ctx.fill(c.path, "evenodd"); }
    }
    ctx.setTransform(...tr(c.h)); ctx.fillStyle = color; ctx.fill(c.path, "evenodd");
    glaciar(c.path, c.h);
    ctx.setTransform(...tr(c.h));
    ctx.lineWidth = (c.indice ? 1.3 : .6) / s;
    ctx.strokeStyle = c.indice ? "rgba(44,116,181,.75)" : "rgba(44,116,181,.4)";
    ctx.stroke(c.path);
  }
  ctx.setTransform(E, 0, 0, E, 0, 0);
  // la cumbre con su nombre y la altura oficial, y el norte
  const [px, py] = pr(M.cima % n + .5, Math.floor(M.cima / n) + .5, M.esc[M.cima]);
  const tinta = css("--ink");
  ctx.strokeStyle = tinta; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py - 34); ctx.stroke();
  ctx.fillStyle = tinta; ctx.beginPath(); ctx.arc(px, py, 3, 0, 2 * Math.PI); ctx.fill();
  ctx.textAlign = "center"; ctx.lineJoin = "round"; ctx.strokeStyle = "#fff"; ctx.lineWidth = 4;
  ctx.font = `600 15px ${css("--f")}`;
  ctx.strokeText(pico.nombre, px, py - 56); ctx.fillText(pico.nombre, px, py - 56);
  ctx.font = `500 13px ${css("--mono")}`; ctx.fillStyle = css("--muted");
  ctx.strokeText(`${n0(pico.altura_m)} m`, px, py - 40); ctx.fillText(`${n0(pico.altura_m)} m`, px, py - 40);
  const [nx, ny] = pr(n / 2, -6, CU.BASE);
  ctx.font = `600 13px ${css("--mono")}`; ctx.fillStyle = css("--azul"); ctx.textBaseline = "middle"; ctx.fillText("N", nx, ny); ctx.textBaseline = "alphabetic";
  return {pr, cos, sin};
}
/* El dibujo de la ficha: el bloque con su conmutador (Relieve y Mapa, propio: anima la inclinación en lugar de fundir), y la lista de
   cumbres en barras desde cero, que la elige. El estado (cumbre, giro y vista) queda en el contenedor y sobrevive a los redibujos */
DIB.cumbres = a => {
  const el = G("cumbres"), filas = T.cumbres_ign;
  if (!el || !filas) return;
  // el estado queda en el contenedor: la cumbre, el giro, la inclinación a la vista (t) y la elegida (obj), y el dibujo del canvas de
  // ahora (st.dibujar), así una animación que empezó antes de un redibujo (el sitio redibuja al cambiar el ancho o al imprimir) sigue en
  // el canvas nuevo
  const st = el.cu ||= {id: filas[0].id, giro: CU.GIRO, t: 1, obj: 1, M: null};
  el.removeAttribute("aria-busy"); ocultarTip();
  el.innerHTML = `<div class="cu-bloque"><canvas tabindex="0"></canvas></div><p class="cu-detalle"></p><p class="cu-ayuda">Arrastrá el relieve de costado o usá las flechas para girarlo.</p>` +
    `<ol class="cu-lista" aria-label="Las ${filas.length} cumbres de la tabla del IGN, de la más alta a la más baja"></ol>`;
  const detalle = el.querySelector(".cu-detalle"), caja = el.querySelector(".cu-bloque"), cv = caja.querySelector("canvas"), ctx = cv.getContext("2d"), lista = el.querySelector(".cu-lista");
  const conm = document.querySelector('.conmutador[data-g="cumbres"]');
  lista.innerHTML = filas.map((f, i) => `<li><button type="button" data-id="${f.id}" aria-pressed="${f.id === st.id}">` +
    `<span><span class="cu-nom">${f.nombre}</span> <span class="cu-prov">${f.provincia}</span></span>` +
    `<span class="cu-alt">${n0(f.altura_m)} m</span></button></li>`).join("");
  let W = 0, H = 0, cam = null;
  const medir = () => {
    W = caja.clientWidth;
    const diag = 160 * Math.SQRT2, s = W * .94 / diag;
    H = Math.round(s * (diag * Math.sin(CU.FI) + CU.R_MAX / 75 * CU.EXAG * Math.cos(CU.FI)) + 72);
    const E = devicePixelRatio || 1;
    cv.style.height = H + "px"; cv.width = Math.round(W * E); cv.height = Math.round(H * E);
  };
  const cumbre = () => filas.find(f => f.id === st.id);
  const dibujar = st.dibujar = () => { if (st.M) cam = dibujarCumbre(ctx, st.M, cumbre(), st, W, H); };
  const nombrar = st.nombrar = () => {
    const f = cumbre(), M = st.M;
    cv.setAttribute("aria-label", `${nombreGrafico(el)}. Relieve de ${f.nombre} (${f.provincia}), ${n0(f.altura_m)} metros según el IGN, ` +
      `en un recuadro de ${M ? n0(M.lado) : 12} km de lado` + (st.obj === 1 ? ", visto de costado" : ", visto desde arriba como mapa"));
    cv.setAttribute("role", "img");
  };
  const elegir = id => {
    st.id = id;
    lista.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b.dataset.id === id));
    cuCargar(id).then(M => {
      if (st.id !== id) return;
      st.M = M; caja.classList.remove("cu-cargando"); dibujar(); nombrar();
      const f = cumbre(), inv = M.inventarios.includes("ING2") ? "de la actualización del Inventario Nacional de Glaciares" : "del Inventario Nacional de Glaciares";
      detalle.textContent = (f.altura_m === M.crudo[M.cima] ? `El modelo de elevación da en la cumbre lo mismo que el IGN, ${n0(f.altura_m)} metros. `
        : `En la cumbre, el modelo de elevación da ${n0(M.crudo[M.cima])} metros y el IGN, ${n0(f.altura_m)}. `) +
        (M.glaciares ? `En celeste, los glaciares ${inv}, con imágenes de ${listaY(M.anios.map(String))}.` : "En el recuadro no hay glaciares inventariados.");
    },
      // si el archivo no llega, el canvas queda vacío y el aviso va donde va el detalle: la lista sigue y elegir de nuevo vuelve a pedirlo
      () => {
        if (st.id !== id) return;
        st.M = null; caja.classList.remove("cu-cargando"); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
        const t = `No se pudo cargar el relieve de ${cumbre().nombre}. Elegila de nuevo en la lista para volver a intentar.`;
        detalle.textContent = t; avisar(t);
      });
    if (!cuPedidos[id] || !st.M) caja.classList.add("cu-cargando");
  };
  // la inclinación: de mapa (0) a relieve (1) en DUR_G, o de una vez con movimiento reducido
  const inclinar = (hacia, anim = !REDUCIR) => {
    const desde = st.t, t0 = performance.now(), vuelta = st.vuelta = (st.vuelta || 0) + 1;
    st.obj = hacia;
    if (!anim) { st.t = hacia; st.dibujar(); st.nombrar(); return; }
    const cuadro = ahora => {
      if (vuelta !== st.vuelta) return;   // otra inclinación la reemplazó
      const f = Math.min(1, (ahora - t0) / DUR_G);
      st.t = desde + (hacia - desde) * EASE(f); st.dibujar();
      if (f < 1) requestAnimationFrame(cuadro); else st.nombrar();
    };
    requestAnimationFrame(cuadro);
  };
  if (conm) {
    conm.dataset.propio = "";
    conm.querySelectorAll("button").forEach((b, i) => {
      b.setAttribute("aria-pressed", (b.dataset.m === "relieve") === (st.obj === 1));
      b.onclick = () => {
        const arriba = b.dataset.m === "relieve";
        if ((st.obj === 1) === arriba) return;
        conm.style.setProperty("--i", i);
        conm.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b));
        inclinar(arriba ? 1 : 0);
      };
    });
    conm.style.setProperty("--i", st.obj === 1 ? 0 : 1);
  }
  lista.querySelectorAll("button").forEach(b => b.addEventListener("click", () => elegir(b.dataset.id)));
  // la altura del modelo donde está el puntero: de las celdas que caen a menos de 4 píxeles, la que está más adelante
  const alturaEn = (mx, my) => {
    if (!cam || !st.M) return null;
    const {n, esc} = st.M;
    let mejor = null, prof = -Infinity;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const [x, y] = cam.pr(i + .5, j + .5, esc[j * n + i]);
      if (Math.abs(x - mx) > 4 || Math.abs(y - my) > 4) continue;
      const d = cam.sin * (i - n / 2) + cam.cos * (j - n / 2);
      if (d > prof) { prof = d; mejor = j * n + i; }
    }
    return mejor;
  };
  let arrastre = null;
  cv.addEventListener("pointerdown", ev => { arrastre = {x: ev.clientX, giro: st.giro, movio: false}; });
  cv.addEventListener("pointermove", ev => {
    const r = cv.getBoundingClientRect(), mx = ev.clientX - r.left, my = ev.clientY - r.top;
    if (arrastre && st.obj === 1 && Math.abs(ev.clientX - arrastre.x) > 4) {
      if (!arrastre.movio) { arrastre.movio = true; cv.setPointerCapture?.(ev.pointerId); }
      st.giro = arrastre.giro - (ev.clientX - arrastre.x) / 180; dibujar(); ocultarTip(); return;
    }
    if (arrastre?.movio) return;
    const idx = alturaEn(mx, my);
    if (idx == null) return ocultarTip();
    mostrarTip(cv, `<b>${n0(st.M.crudo[idx])} m</b> según el modelo de elevación`, mx, my);
  });
  const soltar = ev => {
    const toque = arrastre && !arrastre.movio && ev.type === "pointerup" && ev.pointerType !== "mouse";
    arrastre = null;
    if (!toque) return;
    const r = cv.getBoundingClientRect(), idx = alturaEn(ev.clientX - r.left, ev.clientY - r.top);
    if (idx != null) mostrarTip(cv, `<b>${n0(st.M.crudo[idx])} m</b> según el modelo de elevación`, ev.clientX - r.left, ev.clientY - r.top);
  };
  cv.addEventListener("pointerup", soltar); cv.addEventListener("pointercancel", soltar);
  cv.addEventListener("pointerleave", ocultarSiMouse);
  cv.addEventListener("keydown", ev => {
    if (ev.key !== "ArrowLeft" && ev.key !== "ArrowRight") return;
    ev.preventDefault();
    st.giro += (ev.key === "ArrowLeft" ? 1 : -1) * Math.PI / 12;
    if (st.obj !== 1) conm?.querySelector('[data-m="relieve"]')?.click(); else dibujar();
  });
  medir();
  const ro = new ResizeObserver(() => {
    if (!caja.isConnected) return ro.disconnect();
    if (caja.clientWidth && Math.abs(caja.clientWidth - W) > 1) { medir(); dibujar(); }
  });
  ro.observe(caja);
  elegir(st.id);
  // al entrar en pantalla, la primera vez, el mapa se levanta
  if (a && !REDUCIR && st.t === 1 && !st.vuelta) { st.t = 0; cuCargar(st.id).then(() => inclinar(1), () => { st.t = 1; }); }
};
MED.soja = "mapa";
// "Ver tabla" de la soja: lo que muestra la vista elegida (los departamentos, las provincias o el país)
TABLA_PROPIA["f-soja"] = () => {
  const v = MED.soja, cols = r => ({"hectáreas sembradas": r.sembrada_ha, "% del país": r.pct_pais, toneladas: r.produccion_t,
    "kilos por hectárea": r.rendimiento_kg_ha == null ? null : Math.round(r.rendimiento_kg_ha)});
  if (v === "serie") return Promise.resolve(T.soja_pais.map(r => ({campaña: r.campania, "hectáreas sembradas": r.sembrada_ha, "hectáreas cosechadas": r.cosechada_ha,
    toneladas: r.produccion_t, "kilos por hectárea": r.rendimiento_kg_ha == null ? null : Math.round(r.rendimiento_kg_ha)})));
  if (v === "provincias") return Promise.resolve(T.soja_provincias.map(r => ({codigo_indec: r.codigo_indec, territorio: r.territorio, ...cols(r)})));
  return cargarTabla("soja_departamentos").then(t => t.map(r => ({departamento: r.departamento, provincia: r.provincia, ...cols(r)})));
};
};
