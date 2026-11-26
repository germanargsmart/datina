// Parte de datina.js que usa solo trabajo.html (Trabajo): los textos y los gráficos de sus fichas. Plan técnico, fase 5 (25 de noviembre
// de 2026): 03_construir_sitio.py la publica en sitio/partes/trabajo.js, achicada como datina.js, y solo esa página la pide, antes de datina.js.
// Acá solo se anota: datina.js la corre con parte("trabajo") antes de cambiarVista, después de todos los gráficos del núcleo, así que tiene a
// mano todo lo que datina.js definió antes. Lleva, en el orden en que estaban, las entradas de esta página que estaban en los objetos grandes
// de datina.js (DIB, MED, TABLA_PROPIA, las notas de TX que no lee la lupa y, si hay, las de LEAD que no usa ningún texto del núcleo),
// dentro de un Object.assign, o de textosParte para los textos (los suma a TX y los escribe en su lugar), y los nombres que solo usan
// ellas. Quedan en datina.js los textos que la lupa lee de TX en todas las páginas (los que nombra el índice del sitio, con los de LEAD
// que usan) y lo que leen otras páginas. Lo que se declara acá adentro queda para esta parte.
window.DATINA_PARTES = window.DATINA_PARTES || {};
window.DATINA_PARTES["trabajo"] = () => {
textosParte({
  "rotacion-nota": `Procesamiento propio de las bases usuarias de la Encuesta Permanente de Hogares del INDEC, con ${n0(RO.casos)} respuestas de los cuatro últimos trimestres publicados. Se usa la pregunta sobre cuánto tiempo hace que la persona trabaja en ese empleo en forma continua, que se hace a los asalariados salvo el servicio doméstico. ` +
    `La antigüedad corta no siempre significa rotación: también incluye a quienes consiguieron su primer empleo o volvieron a trabajar. La generación se calcula con la edad declarada. El tamaño del lugar de trabajo es la cantidad de personas que trabajan allí, en los tramos que usa el INDEC. La calificación es la de la tarea y no la de la persona, según el Clasificador Nacional de Ocupaciones del INDEC: mide la complejidad de lo que se hace en ese puesto. Los quintiles ordenan a las personas por el ingreso per cápita de su hogar y usan el ponderador de ingresos del INDEC. La encuesta cubre solo aglomerados urbanos y no permite resultados confiables por provincia con este detalle.`,
  "desempleo-nota": DS ? `El seguro de desempleo, cuyo nombre oficial es prestación por desempleo, lo cobran los asalariados registrados de la Ley de Contrato de Trabajo y de la construcción que quedan sin ` +
    `trabajo por un despido sin causa u otro motivo que fija la ley y que aportaron al Fondo Nacional de Empleo. Dura de 2 a 12 meses según el tiempo trabajado y lo paga ANSES. Los trabajadores rurales tienen un sistema aparte, que no ` +
    `se incluye. Cada año es el promedio de los doce meses y el último dato es el de un solo mes. Cada beneficiario cuenta en la provincia donde cobra. El empleo registrado es el ` +
    `de los asalariados privados del SIPA de ${MESES[DS.sipa_mes - 1]} de ${DS.sipa_anio}, que se cuenta donde declara el empleador: por eso CABA queda muy abajo y Buenos Aires ` +
    `arriba, porque mucha gente vive en el Gran Buenos Aires y trabaja en CABA. La población es la proyección del INDEC para ${R.anio_pob_ficha.prestacion_desempleo_provincias}, el mismo año. La cantidad de beneficiarios ` +
    `depende del desempleo, pero también de cuánta gente tiene un empleo registrado y de los cambios en las reglas del seguro.` : "",
  "salarios-nota": `Remuneración bruta promedio por todo concepto (antes de los aportes y las contribuciones) de los asalariados ` +
    `registrados del sector privado, por puesto de trabajo: una persona con dos empleos cuenta dos veces. Cada puesto se cuenta en la provincia donde el trabajador ` +
    `está declarado. Es un promedio y no una mediana, así que unos pocos sueldos muy altos lo suben. Junio y diciembre incluyen el aguinaldo: por eso la comparación ` +
    `entre provincias usa ${SA.mes}, el último mes sin aguinaldo (el último publicado es ${SA.ult}). La provincia de Buenos Aires reúne los partidos del Gran Buenos Aires ` +
    `y el resto de la provincia, ponderados por su empleo. No incluye el empleo público ni el trabajo no registrado. Los dos últimos años son provisorios. La variación del salario en Precios y actividad sale de otra medida, el índice de salarios del INDEC, y puede dar otro número.`,
  "informalidad-nota": `Informal es el empleo sin la protección de la seguridad social. Para los asalariados, el que no tiene descuento jubilatorio. ` +
    `Para los patrones y los trabajadores por cuenta propia, el de quienes no tienen su actividad registrada, ` +
    `con los criterios del INDEC. Los trabajadores familiares sin remuneración son informales por ` +
    `definición. Es la clasificación que el INDEC agregó a la Encuesta Permanente de Hogares desde el ${INF.ini}, la misma de sus tasas de empleo ` +
    `formal e informal: el cálculo de Datina con las bases da su misma cifra del total. En las ciudades chicas un trimestre tiene pocas personas ` +
    `encuestadas, así que se juntan los cuatro trimestres (el aglomerado con menos casos tiene ${n0(INF.casos_min)} ocupados encuestados). La EPH ` +
    `mide 31 aglomerados urbanos, no las provincias enteras ni el campo. Qué no dice este dato: no dice cuánto se gana ni si el trabajo alcanza para vivir.`,
  "desocupacion-nota": `Desocupada es la persona que no tiene trabajo, lo buscó activamente y está ` +
    `disponible para trabajar. La tasa se calcula sobre la población económicamente activa: las personas que trabajan o buscan trabajo. La EPH es una ` +
    `encuesta del INDEC en 31 aglomerados urbanos, que no mide las zonas rurales ni las ciudades chicas. Un aglomerado es una ciudad con su área urbana ` +
    `y puede juntar dos ciudades (Neuquén con Plottier) o dos provincias (Viedma con Carmen de Patagones). El Gran Buenos Aires va en dos partes, CABA ` +
    `y los partidos del conurbano. En los aglomerados chicos la encuesta tiene pocos casos y la tasa de un trimestre, un margen de error grande: por eso ` +
    `cada uno va con el promedio de cuatro trimestres, y dos ciudades con tasas parecidas pueden no ser distintas. Si el INDEC no publicó la tasa de un ` +
    `aglomerado en un trimestre, por tener pocos casos, el promedio usa los otros tres. El seguro de desempleo, en la ficha siguiente, cuenta otra cosa: ` +
    `las personas que cobran la prestación.`,
  "exportaciones-nota": `Valor FOB (la mercadería puesta en el puerto o en la frontera, sin flete ni seguro) de los bienes exportados, según la provincia donde se produjeron. El ${pct(nv.ex_provincial_pct)} del total tiene una provincia de origen identificada. El resto sale de la plataforma continental, es mercadería extranjera o tiene origen indeterminado. La tabla descargable separa productos primarios, manufacturas agropecuarias, manufacturas industriales y combustibles. La población es la proyección del INDEC para ${R.anio_pob_ficha.exportaciones_provincias}, el mismo año.`,
});
// Barras horizontales por grupo (no por provincia), con una línea de referencia
function barrasGrupos(el, cfg) {
  const data = cfg.data, angosto = el.clientWidth < 520, fila = 32;
  const izq = angosto ? 128 : 190;
  const C = lienzo(el, data.length * fila + 40, {t:24, r:56, b:16, l: izq});
  const {g, iw} = C;
  const x = d3.scaleLinear().domain([0, d3.max(data, d => d[cfg.k]) * 1.05]).nice().range([0, iw]);
  const y = d3.scaleBand().domain(data.map(d => d.grupo)).range([0, data.length * fila]).padding(.3);
  g.append("g").attr("class","eje").call(d3.axisTop(x).ticks(angosto ? 3 : 5).tickFormat(v => v + "%").tickSize(0).tickPadding(6)).call(a => a.select(".domain").remove());
  const f = g.selectAll("g.f").data(data).join("g").attr("class", "f").attr("transform", d => `translate(0,${y(d.grupo)})`);
  const b = f.append("rect").attr("height", y.bandwidth()).attr("rx", rBarra(y.bandwidth())).attr("width", d => x(d[cfg.k])).attr("fill", css("--celeste"));
  f.append("text").attr("x", -10).attr("y", y.bandwidth()/2).attr("dy",".35em").attr("text-anchor","end").attr("class","etq").text(d => d.grupo);
  const v = f.append("text").attr("x", d => x(d[cfg.k]) + 6).attr("y", y.bandwidth()/2).attr("dy",".35em").attr("class","etq-fuerte").text(d => pct(d[cfg.k]));
  if (cfg.ref != null) {
    g.append("line").attr("x1", x(cfg.ref)).attr("x2", x(cfg.ref)).attr("y1", -4).attr("y2", data.length * fila).attr("stroke", css("--ink")).attr("stroke-dasharray","3 3").lower();
    g.append("text").attr("x", x(cfg.ref) + 5).attr("y", data.length * fila + 12).attr("class","etq-suave").text(cfg.refLab);
  }
  if (cfg.anim) {
    b.attr("width", 0).transition().delay(escalon).duration(DUR_G).ease(EASE).attr("width", d => x(d[cfg.k]));
    aparecer(v, 400);
  }
}
Object.assign(MED, {
  rotacion: "edad",
  empleo: "cada_100",
});
Object.assign(DIB, {
  rotacion: a => barrasGrupos(G("rotacion"), {anim:a, data: T.rotacion_laboral.filter(d => d.dimension === MED.rotacion).sort((x, y) => x.orden - y.orden),
    k:"pct_un_anio_o_menos", ref: RO.total, refLab: `Total ${pct(RO.total)}`}),
  desempleo: a => {
    const v = MED.desempleo, el = G("desempleo"), filas = T.prestacion_desempleo_provincias.filter(r => r.codigo_indec !== "00");
    const extra = r => `<br>${n0(r.beneficiarios)} beneficiarios en ${MESES[DS.prov_mes - 1]} de ${DS.prov_anio}<br>${pct(r.pct_pais)} de los del país`;
    if (v === "serie") {
      $t("desempleo").textContent = `En ${MESES[DS.mes - 1]} de ${DS.anio} cobraban el seguro de desempleo ${n0(DS.v)} personas, contra un promedio de ${n0(DS.v_anio_ant)} ` +
        `por mes en ${DS.anio_ant}. Desde ${DS.ini}, el promedio anual más alto fue el de ${DS.max_anio}, ${n0(DS.max)}, y el más bajo, el de ${DS.min_anio}, ${n0(DS.min)}.`;
      return lineas(el, {anim: a, data: T.prestacion_desempleo, x: "anio", y0: 0, vf: n0, yf: v => n0(v / 1000) + " mil",
        xl: r => r.meses < 12 ? `${MESES[r.meses - 1]} de ${r.anio}` : r.anio,
        series: [{k: "beneficiarios", lab: "Beneficiarios", c: css("--celeste-fuerte")}]});
    }
    if (v === "asalariados") {
      $t("desempleo").textContent = `En ${MESES[DS.prov_mes - 1]} de ${DS.prov_anio} cobraban el seguro de desempleo ${n1(DS.pais_100)} personas cada 100 asalariados ` +
        `privados registrados en el país. Sin contar CABA (${n1(DS.caba_a_v)}) ni Buenos Aires (${n1(DS.pba_a_v)}), que se distorsionan porque mucha gente trabaja en una y vive ` +
        `en la otra, ${DS.top_a} tenía la proporción más alta, ${n1(DS.top_a_v)}, y ${DS.low_a} la más baja, ${n1(DS.low_a_v)}.`;
      return barrasH(el, {anim: a, data: filas, k: "cada_100_asalariados", vf: n1, af: n0, ref: DS.pais_100, refLab: `País ${n1(DS.pais_100)}`,
        tip: d => `<b>${d.territorio}</b><br>${n1(d.cada_100_asalariados)} cada 100 asalariados privados registrados` + extra(d)});
    }
    if (v === "cantidad") {
      const tot = T.prestacion_desempleo_provincias.find(r => r.codigo_indec === "00").beneficiarios;
      $t("desempleo").textContent = textoCantidad(filas, "beneficiarios",
        `En ${MESES[DS.prov_mes - 1]} de ${DS.prov_anio} cobraban el seguro de desempleo ${n0(tot)} personas en todo el país.`, "Cada 1.000");
      return barrasH(el, {anim: a, data: filas, k: "beneficiarios", vf: n0, af: ejeMil,
        tip: d => `<b>${d.territorio}</b><br>${n0(d.beneficiarios)} beneficiarios en ${MESES[DS.prov_mes - 1]} de ${DS.prov_anio}<br>${pct(d.pct_pais)} de los del país` +
          `<br>${n1(d.cada_1000_habitantes)} cada 1.000 habitantes`});
    }
    $t("desempleo").textContent = TX.desempleo;
    barrasH(el, {anim: a, data: filas, k: "cada_1000_habitantes", vf: n1, af: n0, ref: DS.pais_1000, refLab: `País ${n1(DS.pais_1000)}`,
      tip: d => `<b>${d.territorio}</b><br>${n1(d.cada_1000_habitantes)} cada 1.000 habitantes` + extra(d)});
  },
  empleo: a => ($("clave-empleo").hidden = MED.empleo === "cada_100") ? barrasH(G("empleo"), {anim:a, data: T.empleo_provincias, k:"cada_100", ref: R.empleo.cada_100_pais,
        tip: d => `<b>${d.territorio}</b><br>${n1(d.cada_100)} cada 100 habitantes<br>${n0(d.miles * 1000)} asalariados registrados<br>${n0(d.poblacion)} habitantes`, refLab:`País ${n1(R.empleo.cada_100_pais)}`})
    : barrasH(G("empleo"), {anim:a, data: T.empleo_provincias, k:"var_12m",
        tip: d => `<b>${d.territorio}</b><br>${n0(d.miles * 1000)} asalariados registrados<br>${n0(d.miles_hace12 * 1000)} doce meses antes`, vf: v => (v > 0 ? "+" : "") + n1(v) + "%", af: v => v + "%",
        mejor: "sube", pais: R.empleo.var_nac}),
});
Object.assign(MED, {
  salarios: "prov",
  desocupacion: "ciudad",
});
Object.assign(DIB, {
  // salarios (etapa 23): por provincia en el último mes sin aguinaldo, o mes a mes en pesos de igual valor con la línea de la provincia elegida
  salarios: conTablas("salarios", () => MED.salarios === "mes" ? ["salarios_serie"] : [], a => {
    const el = G("salarios"), fp = T.salarios_provincias.find(r => r.codigo_indec === prov);
    let txt = LEAD.salarios(MED.salarios);
    if (MED.salarios === "mes") {
      const suya = fp ? new Map(T.salarios_serie.filter(r => r.codigo_indec === prov).map(r => [r.periodo, r.salario_real])) : null;
      const data = T.salarios_serie.filter(r => r.codigo_indec === "00").map(r => ({periodo: r.periodo, t: tPer(r.periodo), pais: r.salario_real, prov: suya ? suya.get(r.periodo) ?? null : null}));
      if (fp) txt += ` En ${fp.territorio}, descontada la inflación, el salario de ${SA.mes} ${cambioPct(fp.var_real_12m)} frente a ${SA.ant}.`;
      $t("salarios").textContent = txt;
      return lineas(el, {anim: a, data, x: "t", y0: 0, vf: millonesM, yf: ejeM, xl: r => mesPer(r.periodo), mensual: true,
        series: [{k: "pais", lab: "Todo el país", c: NAR}, ...(fp ? [{k: "prov", lab: fp.territorio, c: FRI}] : [])]});
    }
    if (fp && fp.territorio !== SA.top[0] && fp.territorio !== SA.bajo[0]) txt += ` En ${fp.territorio}, ${n0(fp.salario)} pesos${conVeces(fp.salario, SA.pais)}.`;
    $t("salarios").textContent = txt;
    barrasH(el, {anim: a, data: T.salarios_provincias.filter(r => r.codigo_indec !== "00"), k: "salario", vf: millonesM, af: ejeM, ref: SA.pais, refLab: `País ${millonesM(SA.pais)}`, anota: true,
      tip: d => `<b>${d.territorio}</b><br>${n0(d.salario)} pesos en ${SA.mes}<br>Descontada la inflación, ${cambioPct(d.var_real_12m)} frente a ${SA.ant}`});
  }),
  // la informalidad (14 de noviembre de 2026): cada aglomerado de la EPH con la línea de los 31, resaltados los de la provincia elegida, como la
  // desocupación, o el total de los 31 por tipo de trabajo, sexo y edad, en ese orden (sin los trabajadores familiares, informales por definición)
  informalidad: conTablas("informalidad", () => MED.informalidad === "grupo" ? ["informalidad_grupos"] : ["informalidad_aglomerados"], a => {
    const el = G("informalidad");
    if (MED.informalidad === "grupo") {
      $t("informalidad").textContent = `En ${INF.trimestres}, tenía un empleo informal el ${pct(INF.asalariados)} de los asalariados, el ` +
        `${pct(INF.cuenta_propia)} de los trabajadores por cuenta propia y el ${pct(INF.patrones)} de los patrones. Entre las mujeres ocupadas, ` +
        `el ${pct(INF.mujeres)}, y entre los varones, el ${pct(INF.varones)}. Por edad, era más alta entre los ocupados de hasta 24 años, el ` +
        `${pct(INF.jovenes)}, y los de 65 y más, el ${pct(INF.mayores)}, y más baja entre los de ${INF.edad_min[0]} años, el ${pct(INF.edad_min[1])}.`;
      const filas = T.informalidad_grupos.filter(r => r.grupo !== "Trabajadores familiares sin remuneración")
        .map(r => ({...r, codigo_indec: "g" + r.dimension + r.orden, territorio: r.dimension === "edad" && r.grupo !== "Hasta 24 años" ? r.grupo + " años" : r.grupo}));
      barrasH(el, {anim: a, data: filas, k: "informalidad", vf: pct, af: v => n0(v) + "%", ref: INF.pais, refLab: `Total ${pct(INF.pais)}`, sinOrden: true,
        l: 150, lAngosto: 118, tip: d => `<b>${d.territorio}</b><br>${pct(d.informalidad)} con empleo informal, ${INF.trimestres}` +
          `<br>Solo el ${INF.ultimo}: ${pct(d.informalidad_ultimo_trimestre)}<br>${n0(d.ocupados_encuestados)} ocupados encuestados`});
      el.resaltar = null;
      return;
    }
    const filas = T.informalidad_aglomerados.filter(r => r.aglomerado > 0).map(r => ({...r, codigo_indec: "a" + r.aglomerado, territorio: r.nombre}));
    const suyas = prov ? filas.filter(r => String(r.provincias).split(",").includes(prov)) : [];
    let txt = TX.informalidad;
    if (suyas.length === 1 && suyas[0].nombre !== INF.max[0] && suyas[0].nombre !== INF.min[0]) txt += ` En ${suyas[0].nombre}, el ${pct(suyas[0].informalidad)}.`;
    if (suyas.length > 1) txt += ` En los aglomerados de ${NOMBRES[prov]}, ${lista(suyas.map(r => `${pct(r.informalidad)} en ${r.nombre}`))}.`;
    $t("informalidad").textContent = txt;
    barrasH(el, {anim: a, data: filas, k: "informalidad", vf: pct, af: v => n0(v) + "%", ref: INF.pais, refLab: `31 aglomerados ${pct(INF.pais)}`,
      marcar: new Set(suyas.map(r => r.codigo_indec)), l: 220, lAngosto: 132,
      corto: d => d.nombre === "Partidos del Gran Buenos Aires" ? "Partidos del GBA" : IA_CORTO[d.nombre] || d.nombre,
      tip: d => `<b>${d.nombre}</b><br>${pct(d.informalidad)} de los ocupados con empleo informal, ${INF.trimestres}` +
        (d.informalidad_ultimo_trimestre != null ? `<br>Solo el ${INF.ultimo}: ${pct(d.informalidad_ultimo_trimestre)}` : "") +
        `<br>${n0(d.ocupados_encuestados)} ocupados encuestados`});
    el.resaltar = null;
  }),
  // la desocupación (plan de mejora, etapa 4): cada aglomerado de la EPH con la línea de los 31, resaltados los de la provincia elegida (se
  // redibuja al cambiarla, como los ingresos por aglomerado), o el total de los 31 trimestre a trimestre
  desocupacion: a => {
    const el = G("desocupacion");
    let txt = LEAD.desocupacion(MED.desocupacion);
    if (MED.desocupacion === "serie") {
      $t("desocupacion").textContent = txt;
      return lineas(el, {anim: a, data: T.desocupacion_serie.map(r => ({...r, t: +r.periodo.slice(2) + (+r.periodo[0] - 1) / 4})), x: "t", y0: 0,
        vf: pct, yf: v => n0(v) + "%", xl: r => trimTx(r.periodo), mensual: true, series: [{k: "desocupacion", lab: "31 aglomerados", c: NAR}]});
    }
    const filas = T.desocupacion_aglomerados.filter(r => r.aglomerado > 0).map(r => ({...r, codigo_indec: "a" + r.aglomerado, territorio: r.nombre}));
    const suyas = prov ? filas.filter(r => String(r.provincias).split(",").includes(prov)) : [];
    if (suyas.length === 1 && suyas[0].nombre !== DSO.max[0] && suyas[0].nombre !== DSO.min[0]) txt += ` En ${suyas[0].nombre}, el ${pct(suyas[0].desocupacion)}.`;
    if (suyas.length > 1) txt += ` En los aglomerados de ${NOMBRES[prov]}, ${lista(suyas.map(r => `${pct(r.desocupacion)} en ${r.nombre}`))}.`;
    $t("desocupacion").textContent = txt;
    barrasH(el, {anim: a, data: filas, k: "desocupacion", vf: pct, af: v => n0(v) + "%", ref: DSO.pais, refLab: `31 aglomerados ${pct(DSO.pais)}`,
      marcar: new Set(suyas.map(r => r.codigo_indec)), l: 220, lAngosto: 132,
      corto: d => d.nombre === "Partidos del Gran Buenos Aires" ? "Partidos del GBA" : IA_CORTO[d.nombre] || d.nombre,
      tip: d => `<b>${d.nombre}</b><br>${pct(d.desocupacion)} de desocupación, promedio de ${DSO.trimestres}` +
        (d.desocupacion_ultimo_trimestre != null ? `<br>Solo el ${DSO.ultimo}: ${pct(d.desocupacion_ultimo_trimestre)}` : `<br>Sin dato del ${DSO.ultimo}`) +
        `<br>Tasa de empleo: ${pct(d.empleo)}`});
    el.resaltar = null;
  },
});
MED.desempleo = "habitantes";
};
