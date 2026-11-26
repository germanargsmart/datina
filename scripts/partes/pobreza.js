// Parte de datina.js que usa solo pobreza.html (Pobreza): los textos y los gráficos de sus fichas. Plan técnico, fase 5 (25 de noviembre
// de 2026): 03_construir_sitio.py la publica en sitio/partes/pobreza.js, achicada como datina.js, y solo esa página la pide, antes de datina.js.
// Acá solo se anota: datina.js la corre con parte("pobreza") antes de cambiarVista, después de todos los gráficos del núcleo, así que tiene a
// mano todo lo que datina.js definió antes. Lleva, en el orden en que estaban, las entradas de esta página que estaban en los objetos grandes
// de datina.js (DIB, MED, TABLA_PROPIA, las notas de TX que no lee la lupa y, si hay, las de LEAD que no usa ningún texto del núcleo),
// dentro de un Object.assign, o de textosParte para los textos (los suma a TX y los escribe en su lugar), y los nombres que solo usan
// ellas. Quedan en datina.js los textos que la lupa lee de TX en todas las páginas (los que nombra el índice del sitio, con los de LEAD
// que usan) y lo que leen otras páginas. Lo que se declara acá adentro queda para esta parte.
window.DATINA_PARTES = window.DATINA_PARTES || {};
window.DATINA_PARTES["pobreza"] = () => {
textosParte({
  "ingresos-aglomerados-nota": R.ingresos_aglomerados ? `Procesamiento propio de las bases usuarias de la Encuesta Permanente de Hogares del INDEC. El ingreso por persona ` +
    `del hogar es el ingreso total del hogar dividido por la cantidad de integrantes (el ingreso per cápita familiar). El del trabajo es el de la ocupación principal de los ` +
    `ocupados que cobran por su trabajo, sin contar a quienes trabajan sin cobrar. Son los ingresos que declaran las personas encuestadas, con los ponderadores que el INDEC ` +
    `indica para los ingresos. La mediana es el valor que deja a la mitad por debajo y a la mitad por encima: a diferencia del promedio, no la mueven los ingresos muy altos. ` +
    `En las ciudades chicas un trimestre tiene pocas personas encuestadas, así que se juntan ${R.ingresos_aglomerados.trimestres}: cada ingreso se compara con la ` +
    `mediana de los 31 aglomerados de su trimestre, para que no pesen los aumentos de precios de un trimestre al otro, y esa proporción se pasa a pesos del ` +
    `${R.ingresos_aglomerados.trimestre}. Las respuestas suelen ir en números redondos, por eso los montos se muestran redondeados al millar. Los montos no descuentan ` +
    `que los precios cambian entre regiones: la canasta básica del Noreste cuesta menos que la del Gran Buenos Aires. La EPH mide los aglomerados urbanos, no las ` +
    `provincias: la Ciudad de Buenos Aires y los Partidos del GBA son dos aglomerados distintos.` : "",
  "pensiones-invalidez-nota": `La pensión no contributiva por invalidez es para personas que no pueden trabajar por una incapacidad y no tienen ingresos, bienes ni otra ` +
    `jubilación o pensión que alcancen. La paga ANSES. Cada año es el promedio de los doce meses y el último dato es el de un solo mes. Desde abril de 2019 el boletín ` +
    `separa los beneficios suspendidos: en ${MESES[PIN.mes - 1]} de ${PIN.anio} eran ${n0(PIN.v - PIN.v_no_susp)}. Por provincia, el último mes es ${MESES[PIN.prov_mes - 1]} de ` +
    `${PIN.prov_anio} y la población, la proyección del INDEC para ${R.anio_pob_ficha.pensiones_invalidez_provincias}, el mismo año. No incluye las pensiones por discapacidad que pagan las provincias ni la asignación por hijo ` +
    `con discapacidad. La proporción depende de la edad y de la situación de cada población, no solo de cómo se otorgan las pensiones.`,
  "auh-nota": `La AUH la cobra, por cada hijo menor de 18 años o con discapacidad, quien no tiene trabajo, trabaja en la informalidad o en casas particulares, es ` +
    `monotributista social o cobra menos que el salario mínimo. La paga ANSES. Cada beneficio es un hijo: ${n0(AU.discapacidad)} son por hijo con discapacidad, que no tiene ` +
    `límite de edad. Los menores de 18 de cada provincia salen de las proyecciones del INDEC para ${R.anio_pob_ficha.auh_provincias}, el mismo año, que vienen en grupos de cinco años (los de 15 a 17 se toman como tres ` +
    `quintos del grupo de 15 a 19), así que la proporción es aproximada. "Cobertura" es el cuadro de cobertura del boletín, que estima la población con ` +
    `proyecciones de las Naciones Unidas y registros de ANSES. Los programas como Volver al Trabajo, Acompañamiento Social o la Prestación Alimentar no publican datos abiertos por provincia.`,
  "pobreza-ninez-nota": `Personas de 0 a 17 años que viven en hogares cuyos ingresos no alcanzan la canasta básica total (pobreza) o la canasta ` +
    `básica alimentaria (indigencia). La pobreza se mide por hogar: un chico es pobre si su hogar lo es. La EPH releva solo ` +
    `los 31 aglomerados urbanos, no el campo ni las ciudades chicas, y no mide otras carencias, como la vivienda, la salud o la escuela.`,
  "pobreza-nota": `Porcentaje de personas en hogares cuyos ingresos no alcanzan la canasta básica total (pobreza) o la canasta básica alimentaria (indigencia). La EPH releva solo los 31 aglomerados urbanos, no el total del país ni las provincias. En el consultor de pobreza están los aglomerados, los partidos del Gran Buenos Aires y las comunas de CABA, con sus intervalos de confianza.`,
  "pobreza-aglomerados-nota": `Personas en hogares cuyos ingresos no alcanzan la canasta ` +
    `básica total, según la Encuesta Permanente de Hogares del INDEC, que releva 31 aglomerados urbanos y no mide las zonas rurales ni las ciudades chicas. ` +
    `Las regiones son las de la encuesta: Gran Buenos Aires (CABA y los partidos del conurbano), Noroeste, Noreste, Cuyo, Pampeana y Patagonia. El Gran ` +
    `Buenos Aires va en dos partes también entre las ciudades. Un aglomerado es una ciudad con su área urbana y puede juntar dos ciudades o dos provincias. ` +
    `El coeficiente de variación mide la precisión de cada estimación: cuanto más alto, menos precisa. Está en el cuadro de cada barra, con la indigencia. ` +
    `La pobreza por provincia es un cálculo de Datina, no un dato del INDEC: junta los aglomerados de la encuesta de cada provincia, cada uno ` +
    `pesado por las personas que representa, y no mide el resto de la provincia. San Nicolás-Villa Constitución, que abarca dos provincias, no entra ` +
    `en ninguna. En el consultor de pobreza están los partidos del Gran Buenos Aires y las comunas de CABA.`,
  "telefonia-nota": `Accesos de telefonía fija en servicio, según el ENACOM. Son líneas, no hogares: cuentan ` +
    `las de los hogares y también las de comercios, organismos públicos y otros usos, así que una jurisdicción puede pasar de 100 cada 100 hogares. ` +
    `Los accesos a internet fijo están en la ficha anterior.`,
  "tv-paga-nota": `Accesos de TV por suscripción (cable y fibra) en servicio, según el ENACOM. Son abonos, ` +
    `no hogares: cuentan también los de comercios y otros usos. Por provincia el ENACOM publica solo la TV por suscripción, sin la satelital, ` +
    `que está en la evolución del país. No cuenta las plataformas por internet, como las de películas y series.`,
  "censo-nota": `Hogares en viviendas particulares según el Censo 2022. Agua de red: agua corriente de red pública. Cloacas: inodoro con descarga de agua y desagüe a red pública. Internet: conexión en la vivienda, incluida la del celular. Necesidades básicas insatisfechas: hacinamiento, vivienda precaria, sin baño, chicos sin escuela o baja capacidad de subsistencia, según la definición del INDEC. El INDEC no publica estos totales provinciales en un archivo propio: se suman desde los resultados por radio censal, así que pueden diferir levemente de sus cuadros.`,
  "internet-nota": `Accesos a internet fijo informados por las empresas prestadoras al ENACOM, divididos por la cantidad de hogares. Incluye conexiones de empresas y oficinas, por eso algunas jurisdicciones superan los 100. La velocidad es el promedio de la velocidad contratada de bajada. No incluye internet por celular, que sí cuenta el Censo 2022 en la ficha anterior.`,
});
Object.assign(MED, {
  censo: "cloaca",
  internet: "accesos_100_hogares",
});
Object.assign(DIB, {
  auh: a => {
    const v = MED.auh, el = G("auh"), filas = T.auh_provincias.filter(r => r.codigo_indec !== "00");
    const extra = r => `<br>${n0(r.beneficios)} hijos con AUH<br>${n0(r.menores)} menores de 18 años (estimado)`;
    if (v === "cobertura") {
      $t("auh").textContent = `En ${MESES[AU.cob_mes - 1]} de ${AU.cob_anio}, el ${pct(AU.cob_total)} de los menores de 18 años del país recibía alguna asignación familiar: el ` +
        `${pct(AU.cob_auh)} por la AUH y el ${pct(AU.cob_rd)} por el trabajo registrado de su padre o su madre. El ${pct(100 - AU.cob_total)} no recibía ninguna: entre ` +
        `ellos están los hijos de quienes superan el tope de ingresos y los deducen del impuesto a las ganancias, y los que no tienen ninguna cobertura.`;
      const CORTO_AU = {RD: "Asalariado registrado", Monotributo: "Monotributista", PNC: "Pensión no contributiva", SIPA: "Jubilado o pensionado",
        Desempleo: "Seguro de desempleo", AUH: "AUH", ninguna: "Ninguna"};
      return barrasH(el, {anim: a, data: [...T.asignaciones_cobertura].sort((p, q) => q.pct_menores - p.pct_menores).map(r => ({codigo_indec: r.via, territorio: r.nombre, v: r.pct_menores})),
        k: "v", vf: pct, af: v => n0(v) + "%", marcar: new Set(), l: 290, lAngosto: 160, corto: d => CORTO_AU[d.codigo_indec] || d.territorio,
        tip: d => `<b>${d.territorio}</b><br>${pct(d.v)} de los menores de 18 años`});
    }
    if (v === "cantidad") {
      $t("auh").textContent = textoCantidad(filas, "beneficios", `En ${MESES[AU.mes - 1]} de ${AU.anio}, ${n0(AU.beneficios)} chicos recibían la AUH en todo el país.`, "Cada 100");
      return barrasH(el, {anim: a, data: filas, k: "beneficios", vf: n0, af: ejeMil,
        tip: d => `<b>${d.territorio}</b><br>${n0(d.beneficios)} hijos con AUH<br>${pct(d.pct_pais)} de los del país<br>${n1(d.cada_100_menores)} cada 100 menores de 18`});
    }
    $t("auh").textContent = TX.auh;
    if (v === "mapa") return mapaProv(el, {anim: a, filas, k: "cada_100_menores", nombre: "Hijos con AUH cada 100 menores de 18", vf: n1, extra, max: 380});
    barrasH(el, {anim: a, data: filas, k: "cada_100_menores", vf: n1, af: n0, ref: AU.pais_100, refLab: `País ${n1(AU.pais_100)}`,
      tip: d => `<b>${d.territorio}</b><br>${n1(d.cada_100_menores)} cada 100 menores de 18` + extra(d)});
  },
  "pensiones-invalidez": a => {
    const v = MED["pensiones-invalidez"], el = G("pensiones-invalidez"), filas = T.pensiones_invalidez_provincias.filter(r => r.codigo_indec !== "00");
    const extra = r => `<br>${n0(r.pensiones)} pensiones en ${MESES[PIN.prov_mes - 1]} de ${PIN.prov_anio}<br>${pct(r.pct_pais)} de las del país`;
    if (v === "serie") {
      $t("pensiones-invalidez").textContent = `En ${MESES[PIN.mes - 1]} de ${PIN.anio} se pagaban ${n0(PIN.v)} pensiones no contributivas por invalidez, contra un promedio de ` +
        `${n0(PIN.ini_v)} por mes en ${PIN.ini}. El promedio anual más alto fue el de ${PIN.max_anio}, con ${n0(PIN.max)} por mes. En ${PIN.anio_ant}, el promedio fue de ${n0(PIN.v_anio_ant)}.`;
      return lineas(el, {anim: a, data: T.pensiones_invalidez, x: "anio", y0: 0, vf: n0, yf: v => n0(v / 1000) + " mil",
        xl: r => r.meses < 12 ? `${MESES[r.meses - 1]} de ${r.anio}` : r.anio,
        series: [{k: "pensiones", lab: "Todas", corto: "Todas", c: css("--celeste-fuerte")}, {k: "pensiones_no_suspendidas", lab: "Sin las suspendidas", corto: "Sin suspendidas", c: FRI}]});
    }
    // la cantidad de pensiones de cada provincia (14 de octubre de 2026, pedido del autor), de mayor a menor
    if (v === "cantidad") {
      const tot = T.pensiones_invalidez_provincias.find(r => r.codigo_indec === "00").pensiones;
      $t("pensiones-invalidez").textContent = textoCantidad(filas, "pensiones",
        `En ${MESES[PIN.prov_mes - 1]} de ${PIN.prov_anio} se pagaban ${n0(tot)} pensiones no contributivas por invalidez en todo el país.`, "Cada 1.000");
      return barrasH(el, {anim: a, data: filas, k: "pensiones", vf: n0, af: ejeMil,
        tip: d => `<b>${d.territorio}</b><br>${n0(d.pensiones)} pensiones en ${MESES[PIN.prov_mes - 1]} de ${PIN.prov_anio}<br>${pct(d.pct_pais)} de las del país` +
          `<br>${n1(d.cada_1000)} cada 1.000 habitantes`});
    }
    $t("pensiones-invalidez").textContent = TX["pensiones-invalidez"];
    if (v === "provincias")
      return barrasH(el, {anim: a, data: filas, k: "cada_1000", vf: n1, af: n0, ref: PIN.pais_cada_1000, refLab: `País ${n1(PIN.pais_cada_1000)}`,
        tip: d => `<b>${d.territorio}</b><br>${n1(d.cada_1000)} cada 1.000 habitantes` + extra(d)});
    mapaProv(el, {anim: a, filas, k: "cada_1000", nombre: "Pensiones cada 1.000 habitantes", vf: n1, extra, max: 380});
  },
  pobreza: a => lineas(G("pobreza"), {anim:a, data: T.pobreza_serie, x:"t", y0:0, mensual:true, vf: v => n1(v) + "%", yf: v => v + "%",
    xl: d => `${d.semestre === 1 ? "Primer" : "Segundo"} semestre ${d.anio}`,
    series:[{k:"pobreza_personas", lab:"Pobreza", c:NAR, w:3}, {k:"indigencia_personas", lab:"Indigencia", c:FRI, w:2.4}]}),
  // chicos en hogares pobres: la serie de 0 a 17 años frente a toda la población, o el último semestre por tramo de edad
  "pobreza-ninez": a => {
    const el = G("pobreza-ninez"), v = MED["pobreza-ninez"];
    $t("pobreza-ninez").textContent = v === "edad" ? TX["pobreza-ninez-edad"] : TX["pobreza-ninez"];
    if (v === "edad") {
      const u = T.pobreza_ninez[T.pobreza_ninez.length - 1];
      return barrasH(el, {anim: a, sinOrden: true, vf: pct, af: v => n0(v) + "%", l: 130, lAngosto: 110, k: "p",
        data: [["0_5", "0 a 5 años"], ["6_11", "6 a 11 años"], ["12_17", "12 a 17 años"], ["65_y_mas", "65 años y más"], ["total", "Toda la población"]]
          .map(([k, n]) => ({codigo_indec: "e" + k, territorio: n, p: u["pobreza_" + k], i: u["indigencia_" + k]})),
        tip: d => `<b>${d.territorio}</b><br>${pct(d.p)} bajo la línea de pobreza<br>${pct(d.i)} bajo la línea de indigencia<br>${PNZ.fin}`});
    }
    return lineas(el, {anim: a, data: T.pobreza_ninez, x: "t", y0: 0, mensual: true, vf: v => n1(v) + "%", yf: v => v + "%",
      xl: d => `${d.semestre === 1 ? "Primer" : "Segundo"} semestre ${d.anio}`,
      series: [{k: "pobreza_0_17", lab: "De 0 a 17 años", corto: "0 a 17", c: NAR, w: 3}, {k: "pobreza_total", lab: "Toda la población", corto: "Total", c: FRI, w: 2.4}]});
  },
  censo: a => {
    document.querySelector('[data-t="censo"]').textContent = textoCenso(MED.censo);
    barrasH(G("censo"), {anim:a, data: T.censo2022_provincias, k: MED.censo, ref: nv.censo[MED.censo], refLab: `País ${pct(nv.censo[MED.censo])}`,
      vf: v => n1(v) + "%", af: v => v + "%", dif: "puntos"});
  },
  internet: a => MED.internet === "mbps"
    ? barrasH(G("internet"), {anim:a, data: T.internet_fijo_provincias, k:"mbps", vf: v => n0(v) + " Mbps", af: n0})
    : barrasH(G("internet"), {anim:a, data: T.internet_fijo_provincias, k:"accesos_100_hogares", ref: nv.in_pais, refLab: `País ${n1(nv.in_pais)}`, vf: n1, af: n0}),
});
Object.assign(MED, {
  telefonia: "prov",
  "tv-paga": "prov",
  "pobreza-aglomerados": "region",
});
Object.assign(DIB, {
  // la pobreza (plan de mejora, etapa 4): las seis regiones o los 32 aglomerados de la EPH con la línea de los 31, resaltadas la región o los
  // aglomerados de la provincia elegida (se redibuja al cambiarla)
  "pobreza-aglomerados": a => {
    const v = MED["pobreza-aglomerados"], el = G("pobreza-aglomerados");
    // por provincia: los aglomerados de cada una juntos, pesados por su población en la encuesta (cálculo propio)
    if (v === "prov") {
      const fp = T.pobreza_provincias.find(r => r.codigo_indec === prov);
      let tp = LEAD["pobreza-aglomerados"](v);
      if (fp && ![PZA.prov_min[0], PZA.prov_max[0], PZA.prov_max2[0]].includes(fp.territorio))
        tp += ` En ${fp.territorio}, el ${pct(fp.pobreza)}${fp.n_aglomerados > 1 ? `, con ${fp.aglomerados}` : `, en ${fp.aglomerados}`}.`;
      $t("pobreza-aglomerados").textContent = tp;
      barrasH(el, {anim: a, data: T.pobreza_provincias, k: "pobreza", vf: pct, af: v => n0(v) + "%", ref: PZA.pais, refLab: `31 aglomerados ${pct(PZA.pais)}`,
        tip: d => `<b>${d.territorio}</b><br>${pct(d.pobreza)} bajo la línea de pobreza en el ${PZA.semestre}<br>${d.n_aglomerados > 1 ? "Aglomerados" : "Aglomerado"}: ` +
          `${d.aglomerados}<br>Indigencia: ${pct(d.indigencia)}`});
      return;
    }
    const filas = T.pobreza_aglomerados.filter(r => r.tipo === (v === "region" ? "region" : "aglomerado")).map(r => ({...r, codigo_indec: r.clave, territorio: r.nombre}));
    const suyas = !prov ? [] : v === "region" ? filas.filter(r => (REG_IPC[prov] || []).includes(r.clave)) : filas.filter(r => String(r.provincias).split(",").includes(prov));
    let txt = LEAD["pobreza-aglomerados"](v);
    if (v === "region" && suyas.length) txt += ` ${NOMBRES[prov]} está en ${lista(suyas.map(r => `${REG_ART[r.nombre]} (${pct(r.pobreza)})`))}.`;
    if (v === "ciudad" && suyas.length === 1) txt += ` En ${suyas[0].nombre}, el ${pct(suyas[0].pobreza)}.`;
    if (v === "ciudad" && suyas.length > 1) txt += ` En los aglomerados de ${NOMBRES[prov]}, ${lista(suyas.map(r => `${pct(r.pobreza)} en ${r.nombre}`))}.`;
    $t("pobreza-aglomerados").textContent = txt;
    barrasH(el, {anim: a, data: filas, k: "pobreza", vf: pct, af: v => n0(v) + "%", ref: PZA.pais, refLab: `31 aglomerados ${pct(PZA.pais)}`,
      marcar: new Set(suyas.map(r => r.codigo_indec)), l: v === "region" ? 150 : 220, lAngosto: 132,
      corto: d => d.nombre === "Partidos del Gran Buenos Aires" ? "Partidos del GBA" : IA_CORTO[d.nombre] || d.nombre,
      tip: d => `<b>${d.nombre}</b><br>${pct(d.pobreza)} bajo la línea de pobreza en el ${PZA.semestre}<br>Coeficiente de variación: ${pct(d.cv_pobreza)}` +
        `<br>Indigencia: ${pct(d.indigencia)}`});
    el.resaltar = null;
  },
  // la telefonía fija (plan de mejora, sección 10, 31 de octubre de 2026): cada provincia con la línea del país, o la evolución del país por
  // trimestre, cada 100 hogares y cada 100 habitantes
  telefonia: a => {
    const v = MED.telefonia, el = G("telefonia"), fp = T.telefonia_fija_provincias.find(r => r.codigo_indec === prov);
    let txt = LEAD.telefonia(v);
    if (v === "serie") {
      $t("telefonia").textContent = txt;
      return lineas(el, {anim: a, data: T.telefonia_fija_pais, x: "x", y0: 0, vf: n1, yf: n0, xl: r => `${r.periodo[0]}.º trimestre de ${r.periodo.slice(2)}`, mensual: true,
        series: [{k: "accesos_100_hogares", lab: "Cada 100 hogares", corto: "Hogares", c: NAR}, {k: "accesos_100_habitantes", lab: "Cada 100 habitantes", corto: "Habitantes", c: FRI}]});
    }
    if (fp && ![TF.top[0], TF.top2[0], TF.bajo[0]].includes(fp.territorio))
      txt += ` En ${fp.territorio}, ${n1(fp.accesos_100_hogares)}, contra ${n1(fp[`accesos_100_hogares_${TF.ini}`])} en el ${TF.ini_trim}.`;
    $t("telefonia").textContent = txt;
    barrasH(el, {anim: a, data: T.telefonia_fija_provincias, k: "accesos_100_hogares", vf: n1, af: n0, ref: TF.pais, refLab: `País ${n1(TF.pais)}`,
      tip: d => `<b>${d.territorio}</b><br>${n1(d.accesos_100_hogares)} accesos cada 100 hogares en el ${TF.trim}<br>${n1(d.accesos_100_habitantes)} cada ` +
        `100 habitantes<br>En el ${TF.ini_trim}, ${n1(d[`accesos_100_hogares_${TF.ini}`])} cada 100 hogares`});
  },
  "tv-paga": a => {
    const v = MED["tv-paga"], el = G("tv-paga"), fp = T.tv_paga_provincias.find(r => r.codigo_indec === prov);
    let txt = LEAD["tv-paga"](v);
    if (v === "serie") {
      $t("tv-paga").textContent = txt;
      return lineas(el, {anim: a, data: T.tv_paga_pais, x: "x", y0: 0, vf: n1, yf: n0, xl: r => `${r.periodo[0]}.º trimestre de ${r.periodo.slice(2)}`, mensual: true,
        series: [{k: "suscripcion_100_hogares", lab: "TV por suscripción", corto: "Suscripción", c: NAR}, {k: "satelital_100_hogares", lab: "TV satelital", corto: "Satelital", c: FRI}]});
    }
    if (fp && ![TVP.top[0], TVP.top2[0], TVP.bajo[0]].includes(fp.territorio))
      txt += ` En ${fp.territorio}, ${n1(fp.accesos_100_hogares)}, contra ${n1(fp[`accesos_100_hogares_${TVP.ini_prov}`])} en el ${TVP.ini_prov_trim}.`;
    $t("tv-paga").textContent = txt;
    barrasH(el, {anim: a, data: T.tv_paga_provincias, k: "accesos_100_hogares", vf: n1, af: n0, ref: TVP.pais, refLab: `País ${n1(TVP.pais)}`,
      tip: d => `<b>${d.territorio}</b><br>${n1(d.accesos_100_hogares)} accesos cada 100 hogares en el ${TVP.trim}<br>${n1(d.accesos_100_habitantes)} cada ` +
        `100 habitantes<br>En el ${TVP.ini_prov_trim}, ${n1(d[`accesos_100_hogares_${TVP.ini_prov}`])} cada 100 hogares`});
  },
});
// "la Ciudad de Buenos Aires" lleva artículo, los demás aglomerados no
const conArt = (n, inicio) => n.startsWith("Ciudad") ? (inicio ? "La " : "la ") + n : n;
MED["ingresos-aglomerados"] = "ipcf";
DIB["ingresos-aglomerados"] = conTablas("ingresos-aglomerados", ["ingresos_aglomerados"], a => {
  const t = MED["ingresos-aglomerados"], E = IA[t], el = G("ingresos-aglomerados"), mil = v => n0(Math.round(v / 1000) * 1000);
  const filas = T.ingresos_aglomerados.filter(r => r.aglomerado > 0).map(r => ({...r, codigo_indec: "a" + r.aglomerado, territorio: r.nombre}));
  $t("ingresos-aglomerados").textContent = (t === "ipcf"
    ? `En ${IA.trimestres}, en pesos del ${IA.trimestre}, la mitad de las personas de los 31 aglomerados urbanos vivía en hogares con un ingreso de hasta ${mil(E.pais)} pesos por mes por cada integrante. `
    : `En ${IA.trimestres}, en pesos del ${IA.trimestre}, la mitad de los ocupados que cobran por su trabajo en los 31 aglomerados urbanos ganaba hasta ${mil(E.pais)} pesos por mes en su ocupación principal. `) +
    `${conArt(E.max, true)} tenía la mediana más alta, ${mil(E.max_v)} pesos, y ${conArt(E.min)}, la más baja, ` +
    `${mil(E.min_v)} pesos. La más alta es ${n1(E.veces)} veces la más baja.`;
  const marcar = new Set(prov ? filas.filter(r => String(r.provincias).split(",").includes(prov)).map(r => r.codigo_indec) : []);
  barrasH(el, {anim: a, data: filas, k: `${t}_pesos`, vf: mil, af: v => v === 0 ? "0" : v < 1e6 ? n0(v / 1e3) + " mil" : v === 1e6 ? "1 millón" : n1(v / 1e6).replace(/,0$/, "") + " millones",
    ref: E.pais, refLab: `31 aglomerados ${mil(E.pais)}`,
    marcar, l: 220, lAngosto: 132, corto: d => IA_CORTO[d.nombre] || d.nombre,
    tip: d => `<b>${d.nombre}</b><br>${mil(d[t + "_pesos"])} pesos por mes, ${pct(d[t + "_pct_pais"])} de la mediana de los 31 aglomerados` +
      `<br>${n0(d[t + "_casos"])} ${t === "ipcf" ? "personas" : "ocupados"} encuestados en los cuatro trimestres<br>Solo con el ${IA.trimestre}: ${mil(d[t + "_pesos_ultimo_trimestre"])}`});
  el.resaltar = null;
});
MED["pensiones-invalidez"] = "mapa";
MED.auh = "provincias";
};
