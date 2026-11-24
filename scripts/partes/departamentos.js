// Parte de datina.js que usa solo departamentos.html (el mapa de los departamentos). Plan técnico, fase 5 (24 de noviembre de 2026): 03_construir_sitio.py la publica
// en sitio/partes/departamentos.html.js, achicada como datina.js, y solo esa página la pide, antes de datina.js. Acá solo se anota: datina.js la corre
// con parte("departamentos.html") en el mismo lugar donde estaba este código, así que tiene a mano todo lo que datina.js definió antes y corre en el
// mismo orden que cuando era un solo archivo. Lo que se declara acá adentro queda para esta parte.
window.DATINA_PARTES = window.DATINA_PARTES || {};
window.DATINA_PARTES["departamentos"] = () => {
/* ---------- mapa de los departamentos: se carga solo al llegar ---------- */
const MAPA_DEP = (() => {
  const META = R.departamentos.meta, sel = document.getElementById("mp-ind");
  if (!sel) return;
  sel.innerHTML = Object.entries(META).map(([k, m]) => `<option value="${k}">${m.nombre}</option>`).join("");
  // cerca: la provincia que se acercó en este mapa y la del sitio en ese momento (si la del sitio cambia, el mapa vuelve a seguirla)
  let ind = "homicidios", topo = null, filas = null, cargando = null, cerca = null;
  sel.addEventListener("change", () => { ind = sel.value; cambiarVista("mapa-dep"); });
  document.getElementById("mp-pais").addEventListener("click", () => { cerca = {c: "", de: prov}; cambiarVista("mapa-dep"); });
  // F17 (plan de mejora): buscar un departamento o partido. Las opciones son "nombre (provincia)", porque hay nombres repetidos (San Martín). Al
  // elegir uno, el mapa acerca su provincia, lo marca y dice su valor y en qué quinto del país queda (los cinco grupos de colores del mapa)
  let elegido = null;
  const buscar = document.getElementById("mp-buscar"), opciones = document.getElementById("mp-deps"), avisoDep = document.getElementById("mp-elegido");
  const sinTilde = t => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const etiquetaDep = f => `${f.properties.nombre} (${NOMBRES[f.properties.prov]})`;
  const llenarOpciones = () => {
    if (opciones.childElementCount) return;
    opciones.innerHTML = topojson.feature(topo, topo.objects.departamentos).features.map(etiquetaDep).sort((p, q) => p.localeCompare(q, "es"))
      .map(t => `<option value="${t.replace(/"/g, "&quot;")}"></option>`).join("");
  };
  // lo escrito puede ser la opción entera o solo el nombre, si no se repite en otra provincia
  const hallarDep = t => {
    const q = sinTilde(t.trim()), todos = topojson.feature(topo, topo.objects.departamentos).features;
    const exacto = todos.filter(f => sinTilde(etiquetaDep(f)) === q);
    if (exacto.length) return exacto[0];
    const porNombre = todos.filter(f => sinTilde(f.properties.nombre) === q);
    return porNombre.length === 1 ? porNombre[0] : null;
  };
  const elegirDep = (final) => {
    if (!topo || !buscar.value.trim()) return;
    const f = hallarDep(buscar.value);
    if (!f) {
      if (final) { avisoDep.hidden = false; avisoDep.textContent = "No encontramos ese departamento o partido. Elegí uno de la lista, con su provincia."; }
      return;
    }
    if (f.properties.id === elegido && cerca && cerca.c === f.properties.prov && cerca.de === prov) return;
    elegido = f.properties.id; cerca = {c: f.properties.prov, de: prov}; buscar.value = etiquetaDep(f);
    cambiarVista("mapa-dep");
  };
  buscar.addEventListener("focus", () => cargar().then(llenarOpciones, () => {}), {once: true});
  buscar.addEventListener("input", () => elegirDep(false));
  buscar.addEventListener("change", () => elegirDep(true));
  buscar.addEventListener("keydown", ev => { if (ev.key === "Enter") { ev.preventDefault(); elegirDep(true); } });
  const cargar = () => cargando || (cargando = Promise.all([d3.json("datos/departamentos.topo.json"), d3.csv("datos/departamentos.csv", d3.autoType)])
    .then(([t, f]) => { topo = t; filas = Object.fromEntries(f.map(r => [String(r.id).padStart(5, "0"), r])); }, e => { cargando = null; throw e; }));
  const MIN_POB = 10000, MIN_HOG = 3000;  // las listas del censo se cortan por hogares, las demás por personas identificadas
  // las escuelas privadas (24 de noviembre de 2026), por cantidad de escuelas: con pocas, una sola escuela mueve mucho la parte
  const MIN_ESC = R.departamentos.min_esc || 20, esEsc = m => m.fuente.startsWith("Padrón");
  const alcanza = (m, r) => esEsc(m) ? (r.escuelas || 0) >= MIN_ESC : m.fuente.startsWith("INDEC") ? (r.hogares || 0) >= MIN_HOG : (r.poblacion_identificada || 0) >= MIN_POB;
  // "Ver tabla" (paso 5): los departamentos que muestra el mapa (los de la provincia acercada o todos), con su nombre y el indicador
  // elegido. El CSV solo trae el código de cada departamento: el nombre sale del mapa
  TABLA_PROPIA["f-mapa"] = () => cargar().then(() => {
    const m = META[ind], pv = cerca && cerca.de === prov ? cerca.c : prov;
    return topojson.feature(topo, topo.objects.departamentos).features.filter(f => !NOMBRES[pv] || f.properties.prov === pv)
      .map(f => ({codigo_indec: f.properties.prov, territorio: NOMBRES[f.properties.prov], departamento: f.properties.nombre,
        [`${m.nombre}, ${m.unidad}`]: filas[f.properties.id]?.[ind] ?? null}))
      .sort((p, q) => p.territorio.localeCompare(q.territorio, "es") || p.departamento.localeCompare(q.departamento, "es"));
  });
  function dibujar(anim) {
    refrescarTabla("f-mapa");
    const el = G("mapa-dep"); if (!el || !el.offsetParent) return;
    if (!topo) { cargar().then(() => dibujar(anim), () => sinDatos(el, "No se pudo cargar el mapa.")); return; }
    // las estimaciones de población del INDEC se leen como el censo (listas por hogares), con su propia nota y su población en el recuadro
    const m = META[ind], censo = m.fuente.startsWith("INDEC"), estim = m.fuente.includes("estimaciones"), escu = esEsc(m), obj = topo.objects.departamentos, todos = topojson.feature(topo, obj).features;
    const pv = cerca && cerca.de === prov ? cerca.c : prov;  // tocar una provincia la acerca sin elegirla en todo el sitio
    const enProv = NOMBRES[pv] ? todos.filter(f => f.properties.prov === pv) : todos;
    el.innerHTML = "";
    const w = Math.min(560, el.clientWidth), h = NOMBRES[pv] ? Math.round(w * 1.1) : Math.round(w * 1.55);
    const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${w} ${h + 44}`).attr("role", "img").attr("aria-label", `Mapa de ${m.nombre} por departamento`);
    const proy = d3.geoMercator().fitExtent([[6, 6], [w - 6, h - 6]], {type: "FeatureCollection", features: enProv}), camino = d3.geoPath(proy);
    const vals = todos.map(f => filas[f.properties.id]?.[ind]).filter(v => v != null);
    const cortes = d3.quantile(vals.sort(d3.ascending), .2) != null ? [.2, .4, .6, .8].map(q => d3.quantile(vals, q)) : [];
    const colores = ["#EEF5FC", "#BBD6EF", "#7FB0DD", "#3F86C6", "#1F5E97"];
    const escala = d3.scaleThreshold().domain(cortes).range(colores);
    const deps = svg.append("g").selectAll("path").data(enProv).join("path").attr("class", "dep").attr("d", camino)
      .attr("fill", f => { const v = filas[f.properties.id]?.[ind]; return v == null ? "#E4E9EF" : escala(v); });
    if (anim && !REDUCIR) deps.attr("opacity", 0).transition().delay(escalon).duration(DUR_G).attr("opacity", 1);
    const marcado = deps.filter(f => f.properties.id === elegido).raise().attr("stroke", css("--ink")).attr("stroke-width", 2.5);
    // un círculo alrededor del elegido: en el Gran Buenos Aires los partidos son muy chicos y el borde solo no se ve
    marcado.each(f => { const [cx, cy] = camino.centroid(f); svg.append("circle").attr("class", "mp-marca").attr("cx", cx).attr("cy", cy).attr("r", 9)
      .attr("fill", "none").attr("stroke", css("--ink")).attr("stroke-width", 2).attr("pointer-events", "none"); });
    const geoms = NOMBRES[pv] ? {type: "GeometryCollection", geometries: obj.geometries.filter(g => g.properties.prov === pv)} : obj;
    svg.append("path").attr("class", "limite").attr("d", camino(topojson.mesh(topo, geoms, (a, b) => a.properties.prov !== b.properties.prov || a === b)));
    const f1 = d3.format(",.1f"), fv = v => v == null ? "sin dato" : loc.format(",.1f")(v);
    deps.on("pointermove pointerdown", (ev, f) => {
      const r = filas[f.properties.id] || {}, [mx, my] = d3.pointer(ev, el);
      mostrarTip(el, `<b>${f.properties.nombre}</b>, ${r.provincia || ""}<br>${m.nombre}: ${fv(r[ind])}` +
        (escu ? (r.escuelas ? `<br>${n0(r.escuelas)} escuelas primarias y secundarias comunes` : "") : estim ? (r.pob_ini ? `<br>${n0(r.pob_ini)} habitantes en ${R.departamentos.pob_ini} y ${n0(r.pob_fin)} estimados para ${R.departamentos.pob_fin}` : "") :
        censo ? (r.hogares ? `<br>${n0(r.hogares)} hogares en el Censo 2022` : "") : r.poblacion_identificada ? `<br>${n0(r.poblacion_identificada)} personas identificadas por el RENAPER` : ""), mx, my);
    }).on("pointerleave", ocultarSiMouse)
      .on("click", (ev, f) => { if (!NOMBRES[pv]) { cerca = {c: f.properties.prov, de: prov}; ocultarTip(); cambiarVista("mapa-dep"); } });
    // leyenda de quintiles
    const paso = Math.min(50, (w - 12) / 5), ley = svg.append("g").attr("transform", `translate(${Math.max(6, w / 2 - paso * 2.5)},${h + 8})`);
    colores.forEach((c, i) => ley.append("rect").attr("x", i * paso).attr("width", paso - 2).attr("height", 10).attr("fill", c));
    ["", ...cortes.map(v => loc.format(",.1f")(v))].forEach((t, i) => ley.append("text").attr("class", "mp-ley").attr("x", i * paso).attr("y", 26).attr("text-anchor", i ? "middle" : "start").text(t));
    // lista lateral
    const lugar = NOMBRES[pv] || "Todo el país";
    document.getElementById("mp-lugar").innerHTML = conBandera(NOMBRES[pv] ? pv : "00", `${lugar}: ${m.nombre.toLowerCase()}`);
    document.getElementById("mp-pais").hidden = !NOMBRES[pv];
    if (elegido) {
      const fe = todos.find(f => f.properties.id === elegido), r = filas[elegido] || {}, v = r[ind];
      const QUINTOS = ["el quinto más bajo", "el segundo quinto", "el quinto del medio", "el cuarto quinto", "el quinto más alto"];
      const pocos = !alcanza(m, r);
      avisoDep.hidden = false;
      avisoDep.innerHTML = `<b>${fe.properties.nombre}</b> (${NOMBRES[fe.properties.prov]}). ${m.nombre}: ` + (v == null ? "sin dato." :
        `${fv(v)} (${m.unidad}). Está en ${QUINTOS[cortes.filter(q => v >= q).length]} de los departamentos del país.` +
        (pocos ? (escu ? " Tiene pocas escuelas: una sola mueve mucho este valor." : " Tiene poca población: unos pocos casos mueven mucho este valor.") : "")) + (marcado.empty() ? "" : " En el mapa, con un círculo.");
    }
    const lista = enProv.map(f => ({f, r: filas[f.properties.id]})).filter(o => o.r && o.r[ind] != null && alcanza(m, o.r))
      .sort((a, b) => b.r[ind] - a.r[ind]);
    const item = o => `<li>${o.f.properties.nombre}${NOMBRES[pv] ? "" : ` (${o.r.provincia})`} <span>${fv(o.r[ind])}</span></li>`;
    document.getElementById("mp-lista").innerHTML = lista.length
      ? `<h3>Valores más altos</h3><ol>${lista.slice(0, 5).map(item).join("")}</ol><h3>Valores más bajos</h3><ol>${lista.slice(-5).reverse().map(item).join("")}</ol>` : "";
    document.getElementById("mp-nota").textContent = `${m.nombre}: ${m.unidad}. Fuente: ${m.fuente}. El color divide a los departamentos del país en cinco grupos del mismo tamaño, de menor a mayor valor. ` + (escu
      ? `Cuenta las sedes con primaria o secundaria común del padrón (cada escuela y cada anexo), no los alumnos. Las de gestión social o cooperativa no cuentan como privadas. ` +
        `Separa las 15 comunas de CABA. Las listas solo incluyen los departamentos con al menos ${n0(MIN_ESC)} escuelas.`
      : estim
      ? `Son estimaciones que el INDEC hizo a partir del Censo 2022: suponen cómo van a seguir los nacimientos, las muertes y las mudanzas en cada ` +
        `departamento, así que no son un dato medido. Separan las 15 comunas de CABA. Las listas solo incluyen los departamentos con al menos ${n0(MIN_HOG)} hogares.`
      : censo
      ? `El censo cuenta a cada persona en la vivienda donde vive habitualmente, y cada porcentaje se calcula sobre el total de personas, hogares o viviendas del departamento, según el indicador. ` +
        `A diferencia del RENAPER, separa las 15 comunas de CABA. Las listas solo incluyen los departamentos con al menos ${n0(MIN_HOG)} hogares.`
      : m.fuente.startsWith("SNIC") ? `El SNIC cuenta los hechos y las víctimas que registran las fuerzas de seguridad, según el lugar donde ocurrieron. En los departamentos con poca población, unos pocos casos mueven mucho una tasa: por eso ${m.unidad.includes("promedio") ? "esta tasa es el promedio de tres años y " : ""}las listas solo incluyen los departamentos con al menos ${n0(MIN_POB)} personas identificadas por el RENAPER.`
      : `El RENAPER cuenta a las personas con DNI según el domicilio que declararon, que puede no ser donde viven hoy: es un registro de domicilios, no un conteo de residentes. Publica CABA sin separar por comuna, así que sus 15 comunas muestran el mismo valor. Las listas solo incluyen los departamentos con al menos ${n0(MIN_POB)} personas identificadas.`);
  }
  DIB["mapa-dep"] = dibujar;
})();
};
