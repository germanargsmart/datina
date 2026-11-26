// Parte de datina.js que usa solo poblacion.html (Población): los textos y los gráficos de sus fichas. Plan técnico, fase 5 (25 de noviembre
// de 2026): 03_construir_sitio.py la publica en sitio/partes/poblacion.js, achicada como datina.js, y solo esa página la pide, antes de datina.js.
// Acá solo se anota: datina.js la corre con parte("poblacion") antes de cambiarVista, después de todos los gráficos del núcleo, así que tiene a
// mano todo lo que datina.js definió antes. Lleva, en el orden en que estaban, las entradas de esta página que estaban en los objetos grandes
// de datina.js (DIB, MED, TABLA_PROPIA, las notas de TX que no lee la lupa y, si hay, las de LEAD que no usa ningún texto del núcleo),
// dentro de un Object.assign, o de textosParte para los textos (los suma a TX y los escribe en su lugar), y los nombres que solo usan
// ellas. Quedan en datina.js los textos que la lupa lee de TX en todas las páginas (los que nombra el índice del sitio, con los de LEAD
// que usan) y lo que leen otras páginas. Lo que se declara acá adentro queda para esta parte.
window.DATINA_PARTES = window.DATINA_PARTES || {};
window.DATINA_PARTES["poblacion"] = () => {
textosParte({
  "adonse-nota": `Cada punto es una provincia. En el eje vertical, el porcentaje de los nacimientos de ${R.ado_nse.anio} cuya madre tenía menos de 20 años (DEIS, estadísticas vitales). En el horizontal, el indicador elegido del Censo 2022. La línea punteada es solo una guía de la tendencia. ` +
    `La correlación es la de rangos de Spearman, que va de menos 1 a 1: cerca de 0 no hay relación, cerca de 1 o de menos 1 la relación es fuerte. Con 24 jurisdicciones, valores menores a 0,4 pueden deberse al azar. Una correlación no prueba que una cosa cause la otra: muestra que van juntas.`,
  "chicos-escuela-nota": `Proyecciones de población del INDEC por provincia, sexo y edad, base Censo 2022: estiman cuántas personas va a haber cada año según los nacimientos, las muertes y las migraciones esperadas. ` +
    `Vienen en grupos de cinco años de edad. El de 5 a 14 años reúne la sala de 5, la primaria y los primeros años de la secundaria. La escolaridad obligatoria va de los 4 años al final de la secundaria, pero las proyecciones no separan esas edades. ` +
    `No es un conteo de alumnos: cuenta a todos los chicos de esas edades, vayan o no a la escuela. ` +
    `En el país, los chicos de 5 a 14 años son el ${pct(ESC.pct_hoy)} de la población en ${ESC.anio} y van a ser el ${pct(ESC.pct_fin)} en ${ESC.anio_fin}.` +
    (ESC.pico_anio > 2022 && ESC.pico_anio < ESC.anio_fin ? ` La cantidad más alta de las proyecciones es la de ${ESC.pico_anio}, ${n1(ESC.pico / 1e6)} millones.` : ""),
  // cuándo hay más personas mayores que chicos (3 de noviembre de 2026): el año de cada provincia sale del resumen, sin extrapolar
  "envejecimiento-mch": `En ${EV.anio} hay en el país ${n0(EV.mch_hoy)} personas de 65 años o más por cada 100 chicos de menos de 15 años. ` +
    (EV.cruce_pais == null ? `Según las proyecciones del INDEC, en ${EV.anio_fin} todavía va a haber más chicos que mayores: ${n0(EV.mch_fin)} por cada 100. `
      : EV.cruce_pais <= EV.anio ? `Hay más mayores que chicos desde ${EV.cruce_pais}, y en ${EV.anio_fin} van a ser ${n0(EV.mch_fin)} por cada 100. `
      : `Según las proyecciones del INDEC, en ${EV.cruce_pais} va a haber por primera vez más mayores que chicos, y en ${EV.anio_fin}, ${n0(EV.mch_fin)} por cada 100. `) +
    (EV.ya.length ? `En ${lista(EV.ya.map(([t]) => t))} ya hay más mayores que chicos. ` : "") +
    (EV.cruzan.length > 1 ? `Otras ${EV.cruzan.length} jurisdicciones pasan a tenerlos hasta ${EV.anio_fin}: la primera es ${EV.cruzan[0][0]} (${EV.cruzan[0][1]}) y la última, ${EV.cruzan.at(-1)[0]} (${EV.cruzan.at(-1)[1]}). `
      : EV.cruzan.length ? `${EV.cruzan[0][0]} pasa a tenerlos en ${EV.cruzan[0][1]}. ` : "") +
    (EV.no_cruzan.length ? `${lista(EV.no_cruzan)} ${EV.no_cruzan.length > 1 ? "siguen" : "sigue"} con más chicos que mayores en ${EV.anio_fin}.` : `En ${EV.anio_fin} las 24 jurisdicciones tienen más mayores que chicos.`),
  "envejecimiento-mch-nota": `Personas de 65 años o más por cada 100 menores de 15 años, de las proyecciones de población del INDEC por provincia, sexo y edad, base Censo 2022. ` +
    `Por encima de 100 hay más personas mayores que chicos. El año de cada provincia es el primero de las proyecciones (${EV.cruce_desde} a ${EV.anio_fin}) con 100 o más: ` +
    `${EV.cruce_desde} quiere decir que ya pasaba ese año o antes. Después de ${EV.anio_fin} no hay proyecciones y el sitio no las estira. ` +
    `El círculo claro marca ${EV.anio} y el lleno, ${EV.anio_fin}. La línea punteada marca 100, tantos mayores como chicos.`,
  "poblacion-proy-nota": `Proyecciones de población del INDEC por provincia, base Censo 2022. Estiman cuántas personas va a haber cada año según los nacimientos, las muertes y las migraciones esperadas, y se revisan con cada censo: no son un conteo. ` +
    `La variación compara la población proyectada de ${PPY.anio} con la de ${PPY.anio_fin}.` +
    (PPY.max_antes.length ? ` Según las mismas proyecciones, ${lista(PPY.max_antes.map(([t, a]) => `${t} ${a < PPY.anio ? "tuvo" : "tiene"} su población más alta en ${a}`))}.` : ""),
  envejecimiento: `En ${EV.anio} hay ${n1(EV.hoy)} personas de 65 años o más por cada 100 de entre 15 y 64 años: unas ${n1(EV.trab_hoy)} personas en edad de trabajar por cada persona mayor. ` +
    `Según las proyecciones del INDEC, en ${EV.anio_fin} serán ${n1(EV.fin)}, unas ${n1(EV.trab_fin)} por cada una. Por provincia, en ${EV.anio} la relación más alta es la de ${EV.max} (${n1(EV.max_v)}) y la más baja, la de ${EV.min} (${n1(EV.min_v)}). ` +
    `En ${EV.anio_fin} la más alta va a ser la de ${EV.max_fin} (${n1(EV.max_fin_v)}) y la más baja, la de ${EV.min_fin} (${n1(EV.min_fin_v)}): es el valor que el gráfico muestra al lado de cada provincia.`,
  "piramide-nota": `Cada barra es el porcentaje de la población total de la jurisdicción que tiene esa edad y ese sexo, en grupos de cinco años (el último reúne a las personas de 90 años o más). Las barras llenas son ${PI.anio} y el contorno, ${PI.anio_fin}. Al elegir una provincia, la pirámide pasa a mostrarla. La edad mediana se estima dentro de los grupos de cinco años.`,
  jubilaciones: `En ${JU.mes ? MESES[JU.mes - 1] + " de " : ""}${JU.anio} había ${n2(JU.ratio)} aportantes por cada jubilación o pensión de los regímenes que administra ANSES: ${n0(JU.aportantes)} personas aportando y ${n0(JU.beneficios)} beneficios. El valor más alto de la serie fue ${n2(JU.max)} en ${JU.max_anio} y el más bajo, ${n2(JU.min)} en ${JU.min_anio}. ` +
    `En la población, según las proyecciones del INDEC, las personas de 15 a 64 años por cada persona de 65 o más pasan de ${n1(EV.trab_hoy)} en ${EV.anio} a ${n1(EV.trab_fin)} en ${EV.anio_fin}.`,
  "haberes-nota": `Promedio de cada año de los haberes que paga ANSES y del salario de los asalariados registrados sujeto a aportes, sin aguinaldo. El haber mínimo es el que fija la ` +
    `Ley 24.241. "Con refuerzos" suma los montos adicionales que se pagaron varios meses seguidos: el subsidio de agosto de 2002 a junio de 2003 y los refuerzos desde septiembre ` +
    `de 2022. Desde 2020 se cuentan solo los beneficios no suspendidos. La vista "Sin inflación" descuenta la inflación con el IPC del INDEC: pasa los montos a pesos de ${MESES[+HB.mes_real.slice(5) - 1]} de ${HB.mes_real.slice(0, 4)} desde ${HB.ini_real}, ` +
    `el primer año completo del índice nacional. ${HB.meses < 12 ? `${HB.anio} es el promedio de enero a ${MESES[HB.meses - 1]}. ` : ""}No incluye las cajas provinciales ni los regímenes ` +
    `que no administra ANSES. Comparar con el salario no dice si alcanza para vivir: para eso están las canastas de Precios y actividad.`,
  "jubilaciones-nota": `Promedio anual de aportantes y de beneficios. El último año es el último mes disponible. Los aportantes incluyen asalariados, autónomos, monotributistas y trabajadoras de casas particulares, también jubilados que siguen aportando. Desde abril de 2019 se cuentan solo los beneficios no suspendidos y hasta 2008 la serie incluye el sistema de capitalización. ` +
    `La cantidad de aportantes depende del empleo registrado, no solo de la edad de la población. No se compara entre provincias porque varias mantienen su propia caja previsional para empleados públicos, fuera de ANSES.`,
  "envejecimiento-nota": `Relación de dependencia de la vejez: personas de 65 años o más sobre personas de 15 a 64, por 100. No todas las personas de 15 a 64 trabajan ni todas las mayores están jubiladas, pero es la medida habitual para anticipar la presión sobre el sistema previsional y la demanda de cuidados. ` +
    `Las personas mayores pasan de ser el ${pct(EV.pct_mayores_hoy)} de la población en ${EV.anio} al ${pct(EV.pct_mayores_fin)} en ${EV.anio_fin}. El círculo claro marca ${EV.anio} y el oscuro ${EV.anio_fin}.`,
});
// Pirámide de población: barras llenas para el año en curso y contorno para 2040, en porcentaje del total
function piramidePob(el, cfg) {
  const filas = cfg.data.filter(d => d.codigo_indec === cfg.cod);
  const th = d3.sum(filas, d => d.personas_hoy), tf = d3.sum(filas, d => d.personas_2040);
  const edades = [...new Set(filas.map(d => d.edad))].sort((a, b) => a - b);
  const data = edades.map(e => {
    const v = filas.find(d => d.edad === e && d.sexo === "varones"), m = filas.find(d => d.edad === e && d.sexo === "mujeres");
    return {edad: e, lab: e >= 90 ? "90+" : `${e}-${e + 4}`, vh: v.personas_hoy / th * 100, mh: m.personas_hoy / th * 100, vf: v.personas_2040 / tf * 100, mf: m.personas_2040 / tf * 100};
  });
  const angosto = el.clientWidth < 520, fila = angosto ? 17 : 20;
  const C = lienzo(el, data.length * fila + 64, {t:48, r:8, b:16, l:8});
  const {g, iw} = C, centro = iw / 2, gap = angosto ? 22 : 28;
  const mx = d3.max(data, d => Math.max(d.vh, d.mh, d.vf, d.mf));
  const x = d3.scaleLinear().domain([0, mx]).range([0, centro - gap - 6]);
  const y = d3.scaleBand().domain(data.map(d => d.edad).reverse()).range([0, data.length * fila]).padding(.14);
  // al cambiar de provincia, cada barra pasa del valor de la anterior al de la nueva (300 ms), con la escala de cada una
  const antes = !cfg.anim && !REDUCIR && el.pir && el.pir.cod !== cfg.cod ? el.pir : null;
  el.pir = {cod: cfg.cod, mx, d: Object.fromEntries(data.map(d => [d.edad, d]))};
  const titulo = g.append("text").attr("x", centro).attr("y", -30).attr("text-anchor","middle").attr("class","etq-fuerte").text(cfg.nombre);
  g.append("text").attr("x", centro - gap).attr("y", -12).attr("text-anchor","end").attr("class","etq-fuerte").attr("fill",css("--celeste-fuerte")).text("Varones");
  g.append("text").attr("x", centro + gap).attr("y", -12).attr("class","etq-fuerte").attr("fill",css("--sol-fuerte")).text("Mujeres");
  const f = g.selectAll("g.f").data(data).join("g").attr("transform", d => `translate(0,${y(d.edad)})`);
  const rx = rBarra(y.bandwidth());
  const v = f.append("rect").attr("x", d => centro - gap - x(d.vh)).attr("width", d => x(d.vh)).attr("height", y.bandwidth()).attr("rx", rx).attr("fill", css("--celeste"));
  const m = f.append("rect").attr("x", centro + gap).attr("width", d => x(d.mh)).attr("height", y.bandwidth()).attr("rx", rx).attr("fill", css("--sol"));
  const ov = f.append("rect").attr("x", d => centro - gap - x(d.vf)).attr("width", d => x(d.vf)).attr("height", y.bandwidth()).attr("rx", rx).attr("fill","none").attr("stroke", css("--ink")).attr("stroke-width", 1.2);
  const om = f.append("rect").attr("x", centro + gap).attr("width", d => x(d.mf)).attr("height", y.bandwidth()).attr("rx", rx).attr("fill","none").attr("stroke", css("--ink")).attr("stroke-width", 1.2);
  f.append("text").attr("x", centro).attr("y", y.bandwidth()/2).attr("dy",".35em").attr("text-anchor","middle").attr("class","etq-suave").style("font-size", angosto ? "10px" : null).text(d => d.lab);
  f.append("rect").attr("x", 0).attr("width", iw).attr("height", y.bandwidth()).attr("fill","transparent")
    .on("pointermove pointerdown", (ev, d) => mostrarTip(el, `<b>${d.lab} años</b><br>Varones: ${n1(d.vh)}% en ${cfg.anio} y ${n1(d.vf)}% en ${PI.anio_fin}<br>Mujeres: ${n1(d.mh)}% en ${cfg.anio} y ${n1(d.mf)}% en ${PI.anio_fin}`, centro, y(d.edad) + 48))
    .on("pointerleave", ocultarSiMouse);
  const ley = g.append("g").attr("transform", `translate(${centro - 56},${data.length * fila + 8})`);
  ley.append("rect").attr("width", 12).attr("height", 9).attr("fill", css("--celeste"));
  ley.append("text").attr("x", 16).attr("y", 9).attr("class","etq-suave").text(String(cfg.anio));
  ley.append("rect").attr("x", 64).attr("width", 12).attr("height", 9).attr("fill","none").attr("stroke", css("--ink"));
  ley.append("text").attr("x", 80).attr("y", 9).attr("class","etq-suave").text(PI.anio_fin);
  if (cfg.anim) {
    v.attr("x", centro - gap).attr("width", 0).transition().delay(escalon).duration(DUR_G).ease(EASE).attr("x", d => centro - gap - x(d.vh)).attr("width", d => x(d.vh));
    m.attr("width", 0).transition().delay(escalon).duration(DUR_G).ease(EASE).attr("width", d => x(d.mh));
    aparecer(ov, 700); aparecer(om, 700);
  }
  if (antes) {
    const xa = d3.scaleLinear().domain([0, antes.mx]).range(x.range()), va = d => antes.d[d.edad] || d;
    const ir = sel => sel.transition().duration(DUR_G).ease(EASE);
    ir(v.attr("x", d => centro - gap - xa(va(d).vh)).attr("width", d => xa(va(d).vh))).attr("x", d => centro - gap - x(d.vh)).attr("width", d => x(d.vh));
    ir(m.attr("width", d => xa(va(d).mh))).attr("width", d => x(d.mh));
    ir(ov.attr("x", d => centro - gap - xa(va(d).vf)).attr("width", d => xa(va(d).vf))).attr("x", d => centro - gap - x(d.vf)).attr("width", d => x(d.vf));
    ir(om.attr("width", d => xa(va(d).mf))).attr("width", d => x(d.mf));
    titulo.attr("opacity", 0).transition().duration(DUR_C).attr("opacity", 1);
  }
}
Object.assign(MED, {
  "poblacion-proy": "var_pct",
  "chicos-escuela": "var_pct",
});
Object.assign(DIB, {
  nacimientos: a => {
    lineas(G("nacimientos"), {anim:a, data: T.nacimientos, x:"anio", y0:40, ref:100, refLab: `${T.nacimientos[0].anio} = 100`, yf: v => v, vf: n0,
      xl: d => `${d.anio}<br><span class="suave">Argentina: ${n0(d.nacimientos)} nacimientos${d.nacimientos_ocde ? `<br>OCDE: ${n1(d.nacimientos_ocde / 1e6)} millones` : ""}</span>`,
      series:[{k:"idx_argentina", lab:"Argentina", c:NAR, w:3}, {k:"idx_ocde", lab:"OCDE", c:css("--ocde"), w:2.6}]}); },
  "poblacion-proy": a => { const pc = MED["poblacion-proy"] === "var_pct";
    return barrasH(G("poblacion-proy"), {anim: a, data: T.poblacion_proyectada_provincias.filter(r => r.codigo_indec !== "00"), k: MED["poblacion-proy"],
      vf: pc ? conSigno : v => (v > 0 ? "+" : "") + n0(v), af: pc ? (v => v + "%") : (v => n0(v / 1000) + " mil"),
      ...(pc ? {ref: PPY.var_pct, refLab: `País ${conSigno(PPY.var_pct)}`} : {}),
      tip: d => `<b>${d.territorio}</b><br>${n0(d.personas_hoy)} habitantes en ${PPY.anio}<br>${n0(d.personas_2040)} en ${PPY.anio_fin}<br>${(d.var_personas > 0 ? "+" : "") + n0(d.var_personas)} personas, ${conSigno(d.var_pct)}`}); },
  "chicos-escuela": a => { const pc = MED["chicos-escuela"] === "var_pct";
    return barrasH(G("chicos-escuela"), {anim: a, data: T.chicos_escuela_provincias.filter(r => r.codigo_indec !== "00"), k: MED["chicos-escuela"],
      vf: pc ? conSigno : v => (v > 0 ? "+" : "") + n0(v), af: pc ? (v => v + "%") : (v => n0(v / 1000) + " mil"),
      ...(pc ? {ref: ESC.var_pct, refLab: `País ${conSigno(ESC.var_pct)}`} : {}),
      tip: d => `<b>${d.territorio}</b><br>${n0(d.chicos_hoy)} chicos de 5 a 14 años en ${ESC.anio}<br>${n0(d.chicos_fin)} en ${ESC.anio_fin}<br>` +
        `${(d.var_chicos > 0 ? "+" : "") + n0(d.var_chicos)} chicos, ${conSigno(d.var_pct)}`}); },
  "envejecimiento-mch": a => pesas(G("envejecimiento-mch"), {anim:a, data: T.envejecimiento_provincias, a:"mayores_chicos_hoy", b:"mayores_chicos_2040",
    la: String(EV.anio), lb: String(EV.anio_fin), vf: n0, af: v => v, ref: 100, refLab: "Tantos mayores como chicos", refC: "--muted", pais: [EV.mch_hoy, EV.mch_fin]}),
  envejecimiento: a => pesas(G("envejecimiento"), {anim:a, data: T.envejecimiento_provincias, a:"vejez_hoy", b:"vejez_2040", la: String(EV.anio), lb: String(EV.anio_fin), vf: n1, af: v => v,
    pais: [EV.hoy, EV.fin]}),
  adolescentes: a => pesas(G("adolescentes"), {anim:a, data: T.madres_adolescentes_provincias, a: ADO_INI, b: ADO_ULT, la: String(nac.anio_ini), lb: String(nac.anio_ult),
    mejor: "baja", uDif: " puntos", pais: [nac.pct_ini, nac.pct_ult]}),
  piramide: conTablas("piramide", ["piramide_poblacion"], a => piramidePob(G("piramide"), {anim:a, data: T.piramide_poblacion, cod: prov || "00", nombre: prov ? NOMBRES[prov] : "Total del país", anio: PI.anio})),
  haberes: a => {
    const real = MED.haberes === "real", cae = v => v < 0 ? `cayó ${pct(-v)}` : `subió ${pct(v)}`;
    $t("haberes").textContent = real
      ? `Descontada la inflación, en pesos de ${mesPer(HB.mes_real)}, el haber mínimo con refuerzos promedió ${n0(HB.min_ad_real)} pesos por mes en ${HB.anio}, ${pct(Math.abs(HB.var_real_min_ad))} ` +
        `${HB.var_real_min_ad < 0 ? "menos" : "más"} que en ${HB.ini_real}. En el mismo período la jubilación promedio ${cae(HB.var_real_jub)} y el salario promedio registrado ${cae(HB.var_real_sal)}.`
      : TX.haberes;
    const xl = r => r.meses < 12 ? `${r.anio}, hasta ${MESES[r.meses - 1]}` : r.anio;
    const series = real
      ? [{k: "jubilacion_promedio_real", lab: "Jubilación promedio", corto: "Promedio", c: css("--celeste-fuerte")}, {k: "haber_minimo_adicionales_real", lab: "Mínimo con refuerzos", corto: "Con refuerzos", c: FRI},
         {k: "haber_minimo_real", lab: "Mínimo sin refuerzos", corto: "Sin refuerzos", c: GRIS}]
      : [{k: "pct_jubilacion", lab: "Jubilación promedio", corto: "Promedio", c: css("--celeste-fuerte")}, {k: "pct_minimo_adicionales", lab: "Mínimo con refuerzos", corto: "Con refuerzos", c: FRI},
         {k: "pct_minimo", lab: "Mínimo sin refuerzos", corto: "Sin refuerzos", c: GRIS}];
    lineas(G("haberes"), {anim: a, data: T.haberes_previsionales.filter(r => !real || r.haber_minimo_adicionales_real != null), x: "anio", y0: 0, xl, series,
      vf: real ? v => "$ " + n0(v) : v => pct(v), yf: real ? v => n0(v / 1000) + " mil" : v => n0(v) + "%"});
  },
  jubilaciones: a => lineas(G("jubilaciones"), {anim:a, data: T.jubilaciones_aportantes, x:"anio", y0:0, vf: n2, yf: v => n1(v),
    series: [{k:"aportantes_por_beneficio", c: css("--celeste-fuerte"), lab:"Por beneficio"}], xl: d => d.mes ? `${MESES[d.mes - 1]} de ${d.anio}` : d.anio}),
});
DIB.adonse = a => {
  const i = AN.indicadores.find(x => x.k === MED.adonse), otros = AN.indicadores.filter(x => x !== i);
  const rel = x => `${fuerza(x.r)}${x.r < 0 ? " e inversa" : ""}`;
  document.querySelector('[data-t="adonse"]').textContent = `Las provincias con más nacimientos de madres menores de 20 años suelen tener también peores indicadores socioeconómicos. ` +
    `Con ${i.lab.toLowerCase()}, la relación es ${rel(i)} (correlación de ${n2(i.r)}): donde ese indicador es más alto, la proporción de madres adolescentes tiende a ser ${i.r > 0 ? "más alta" : "más baja"}. ` +
    `Con los otros indicadores del Censo, la relación es ${listaY(otros.map(o => `${rel(o)} con ${o.lab.toLowerCase()} (${n2(o.r)})`))}. Que dos datos vayan juntos no prueba que uno cause el otro.`;
  dispersion(G("adonse"), {anim: a, data: T.madres_adolescentes_nse, x: i.k, y: ADO_ULT, xLab: `${i.lab}, 2022`, yLab: `Nacimientos de madres menores de 20, ${AN.anio}`});
};
MED.haberes = "pct";
};
