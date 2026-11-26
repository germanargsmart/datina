// Parte de datina.js que usa solo economia.html (Economía): los textos y los gráficos de sus fichas. Plan técnico, fase 5 (25 de noviembre
// de 2026): 03_construir_sitio.py la publica en sitio/partes/economia.js, achicada como datina.js, y solo esa página la pide, antes de datina.js.
// Acá solo se anota: datina.js la corre con parte("economia") antes de cambiarVista, después de todos los gráficos del núcleo, así que tiene a
// mano todo lo que datina.js definió antes. Lleva, en el orden en que estaban, las entradas de esta página que estaban en los objetos grandes
// de datina.js (DIB, MED, TABLA_PROPIA, las notas de TX que no lee la lupa y, si hay, las de LEAD que no usa ningún texto del núcleo),
// dentro de un Object.assign, o de textosParte para los textos (los suma a TX y los escribe en su lugar), y los nombres que solo usan
// ellas. Quedan en datina.js los textos que la lupa lee de TX en todas las páginas (los que nombra el índice del sitio, con los de LEAD
// que usan) y lo que leen otras páginas. Lo que se declara acá adentro queda para esta parte.
window.DATINA_PARTES = window.DATINA_PARTES || {};
window.DATINA_PARTES["economia"] = () => {
const mesTx = p => `${MESES[+p.slice(5, 7) - 1]} de ${p.slice(0, 4)}`;
// la región de la provincia elegida, en una frase, con el valor de una tabla de regiones: "Chaco está en el Noreste: 37,0%."
const enSuRegion = (filas, k, f) => {
  const regs = REG_IPC[prov]; if (!regs) return "";
  const v = r => filas.find(x => x.codigo === r);
  if (regs.length === 2) return ` La provincia de Buenos Aires está en dos regiones: los 24 partidos, en el Gran Buenos Aires, con ${f(v("gba")[k])}, y el resto, ` +
    `en la región Pampeana, con ${f(v("pampeana")[k])}.`;
  return ` ${NOMBRES[prov]} está en ${REG_ART[v(regs[0]).region]}: ${f(v(regs[0])[k])}.`;
};
textosParte({
  // expectativas de inflación y confianza del consumidor (etapa 42): los textos los arma el dibujo
  "expectativas-nota": R.expectativas_inflacion ? `Encuesta mensual de la Universidad Torcuato Di Tella a personas de todo el país: cada una dice cuánta inflación espera ` +
    `para los doce meses siguientes. La mediana es el valor que deja la mitad de las respuestas por debajo y la otra mitad por encima, y suele ir en números redondos. ` +
    `El promedio lo mueven más las respuestas extremas. La inflación que hubo en los doce meses siguientes sale del índice de precios al consumidor nacional del INDEC, que ` +
    `empieza en diciembre de 2016: antes no hay con qué comparar en el sitio, y en los meses más recientes todavía no pasaron los doce meses. Lo que esperan los analistas, según el Relevamiento de Expectativas de Mercado del Banco Central, está en la última ficha de la página.` : "",
  "confianza-consumidor-nota": R.confianza_consumidor ? `Encuesta mensual de la Universidad Torcuato Di Tella. El índice va de 0 a 100 y resume tres partes: la situación ` +
    `económica personal y de la familia, la situación económica del país y si es un buen momento para comprar bienes durables, como electrodomésticos, e inmuebles. Por región, la encuesta separa CABA, los partidos del Gran Buenos Aires (GBA en el gráfico) y el interior del ` +
    `país. Como toda encuesta, tiene margen de error: los cambios chicos de un mes al otro pueden no ser significativos.` : "",
  "bcra-nota": `Datos de la API de Estadísticas Monetarias del Banco Central, con el último dato publicado de cada mes, cada serie desde que empieza. Son ${SX.bcra.n} de sus ` +
    `variables principales: las reservas están en Sector externo y la inflación, al principio de esta página, con los datos del INDEC. Las tasas son anuales: la nominal no suma ` +
    `los intereses de los intereses y la efectiva sí. BADLAR, TM20 y TAMAR son las tasas que pagan los bancos privados por plazos fijos de 30 a 35 días de más de un millón ` +
    `de pesos, de 20 millones o más y de 1.000 millones o más, y BAIBAR es la de los préstamos entre bancos privados. Las tasas para juicios son valores acumulados desde el comienzo de cada serie, que los tribunales usan para calcular intereses. ` +
    `Para descontar la inflación, los montos en pesos pasan a pesos de ${mesTx(SX.bcra.ipc_mes)} con el índice de precios al consumidor del INDEC, que empieza en ` +
    `${mesTx(SX.bcra.ipc_desde)} (antes no hay un índice para todo el país), o se miden en % del PBI a precios corrientes del INDEC, desde ${SX.bcra.pib_desde}. ` +
    `En la vista «Sin inflación», el dólar descuenta la inflación de la Argentina y la de los Estados Unidos con el tipo de cambio real bilateral del BCRA. La tasa real compara lo que ` +
    `paga una tasa a 30 días con la inflación del mes siguiente, y los índices de actualización y las tasas para juicios se comparan con la inflación de los mismos doce meses. ` +
    `Los montos, el dólar y los índices en pesos de cada mes van en escala logarítmica: una misma pendiente es un mismo ritmo de crecimiento. ` +
    (SX.bcra.hist_desde ? `La serie histórica del dinero (base monetaria, M1, M2 y M3) está expresada en la moneda actual: entre 1970 y 1992 a la moneda se le sacaron 13 ceros. ` +
      `El BCRA la publica desde 1940, en miles de pesos con cuatro decimales, así que los primeros años dan cero o quedan redondeados: acá empieza en ` +
      `${SX.bcra.hist_desde}, cuando el redondeo ya pesa menos de 0,5%. ` : "") +
    `La parte del M3 en moneda extranjera la calcula Datina con los dos M3 del BCRA. Los depósitos y ` +
    `los préstamos en dólares, en % del PBI, se pasan a pesos con el dólar mayorista de fin de cada mes.` +
    (SX.bcra.rem_viejo ? ` La inflación esperada es la del Relevamiento de Expectativas de Mercado actual: la API también trae datos de ${SX.bcra.rem_viejo[0]} a ${SX.bcra.rem_viejo[1]} ` +
      `de un relevamiento anterior, que no se muestran porque no son comparables con los del actual.` : ""),
  "supermercados-nota": `Encuesta de Supermercados del INDEC: un panel fijo de empresas de supermercados ` +
    `con alguna boca de 200 m² o más, o que suman esa superficie entre todas sus bocas, que no es una muestra al azar. Las ventas incluyen el IVA. La serie mes a mes es el índice del país que publica el ` +
    `INDEC a precios constantes, que descuenta los precios de cada grupo de artículos con el índice de precios al consumidor del país. El INDEC publica ` +
    `las ventas de cada provincia solo a precios corrientes: el sitio las lleva a pesos de ${ESU.mes} con el índice de precios de los bienes de su región ` +
    `(en la provincia de Buenos Aires, los 24 partidos del Gran Buenos Aires con el de esa región y el resto con el de la región Pampeana), así que la ` +
    `variación del país de ese gráfico difiere un poco de la del índice del INDEC. No se comparan las ventas por habitante: dependen de cuántos locales ` +
    `del panel hay en cada provincia.`,
  "inflacion-nota": `Índice de precios al consumidor del INDEC, base diciembre de 2016 = 100: mide cuánto cambia el costo de una ` +
    `canasta fija de bienes y servicios que compran los hogares de las ciudades del país. Las variaciones del mes y de doce meses son las que publica el INDEC, con ` +
    `un decimal, y la de lo que va del año sale del índice. El índice del país empieza en diciembre de 2016: no hay uno anterior para todo el país. Las regiones son ` +
    `grupos de ciudades donde se relevan los precios. El Gran Buenos Aires es CABA y los 24 partidos que la rodean. La región Pampeana reúne el ` +
    `resto de la provincia de Buenos Aires, con el Gran La Plata, y Córdoba, Entre Ríos, La Pampa y Santa Fe. Las demás reúnen estas provincias: Noreste (Corrientes, ` +
    `Chaco, Formosa y Misiones), Noroeste (Catamarca, Jujuy, La Rioja, Salta, Santiago del Estero y Tucumán), Cuyo (Mendoza, San Juan y San Luis) y Patagonia (Chubut, ` +
    `Neuquén, Río Negro, Santa Cruz y Tierra del Fuego). Si elegís una provincia en Tu provincia, el gráfico suma su región.`,
  "inflacion-rubros-nota": `Variación de los precios de cada rubro en los doce meses hasta ${EIP.mes}, ` +
    `en todo el país, según el INDEC. Los rubros son las doce divisiones de la clasificación del consumo que usa el índice. Los precios regulados son los de los ` +
    `combustibles para la vivienda, la electricidad, el agua, los sistemas de salud, el transporte público, el funcionamiento y el mantenimiento de los vehículos, ` +
    `con la nafta, el correo, el teléfono, la educación formal y los cigarrillos. Los estacionales, los de las frutas, las verduras, la ropa exterior, el transporte ` +
    `por turismo y el alojamiento. La inflación núcleo es la de los demás. La tabla tiene también la variación de cada rubro en las seis regiones. ` +
    `En "Tu inflación", los pesos de partida son los de cada región en el índice (la Encuesta Nacional de Gastos de los Hogares 2004/05, la que usa el INDEC), ` +
    `cambiados por lo que subió cada rubro hasta el comienzo de los doce meses: con ellos la cuenta da la inflación oficial de la región, con menos de tres ` +
    `décimas de diferencia. Es una aproximación: el INDEC calcula cada rubro con más detalle. Lo que se escribe en la calculadora no se guarda ni se envía.`,
  "salario-minimo-nota": `El salario mínimo, vital y móvil es el piso legal del sueldo mensual de un trabajador registrado de jornada completa. Lo fija ` +
    `el Consejo Nacional del Empleo, la Productividad y el Salario Mínimo, Vital y Móvil, que reúne a las cámaras empresarias, los sindicatos y el ` +
    `Gobierno, y si no hay acuerdo lo decide el Gobierno. La canasta es la del hogar de referencia del INDEC para la línea de pobreza: un varón de 35 ` +
    `años, una mujer de 31, un hijo de 6 y una hija de 8, en el Gran Buenos Aires. Qué no dice este dato: cuántos hogares son pobres. Un hogar puede ` +
    `tener más de un ingreso, y el salario mínimo es el piso, no el sueldo habitual. Muestra cuánto alcanza un solo salario mínimo frente a lo que ` +
    `necesita esa familia. Los dos están en pesos de cada mes, así que el porcentaje ya descuenta la suba de los precios.`,
  "canastas-nota": `Canasta básica alimentaria: los alimentos que cubren las necesidades de energía y de proteínas de un varón ` +
    `adulto de actividad moderada, el adulto equivalente. La canasta básica total suma los demás bienes y servicios, como la ropa, el transporte, la educación y la ` +
    `salud. Las dos se valorizan con los precios del índice de precios al consumidor. Un hogar es pobre si sus ingresos no alcanzan para su canasta básica total, e ` +
    `indigente si no alcanzan para la alimentaria. Lo que necesita cada hogar depende de cuántas personas lo forman, su edad y su sexo: el hogar de cuatro ` +
    `integrantes del ejemplo del INDEC equivale a ${n2(ECB.adultos_hogar)} adultos equivalentes. Las canastas de las seis regiones salen cada semestre, con el informe ` +
    `de pobreza del INDEC: la última es de ${ECB.reg_mes}. Cuántas personas son pobres está en Pobreza y hogares.`,
  "industria-nota": "Los índices de producción industrial del INDEC miden cuánto producen, en cantidades y no en " +
    "pesos, las ramas de la industria manufacturera y de la minería. Por rama, la variación frente al mismo mes del año anterior, con la serie " +
    "original. Mes a mes, la serie sin estacionalidad, que quita el efecto de la época del año, con el primer mes que tienen en común los dos " +
    "índices = 100. La minería incluye la extracción de petróleo y gas: su producción en metros cúbicos, con los datos de la Secretaría de " +
    "Energía, está en Petróleo y gas.",
  "crianza-nota": "La canasta de crianza del INDEC mide lo que cuesta por mes criar a un chico según su edad. Los bienes y " +
    "servicios (alimentos, ropa, salud, educación, transporte y vivienda) salen de la canasta básica total. El cuidado es el tiempo que el chico " +
    "necesita de un adulto, valuado con el salario de las trabajadoras de casas particulares que cuidan personas. No es lo que gasta una familia " +
    "en particular, sino una referencia, que se usa por ejemplo para calcular cuotas alimentarias. Mes a mes, en pesos del último mes con datos de " +
    "precios, descontada la inflación con el índice de precios al consumidor del país. Frente al salario: la canasta de 6 a 12 años del mes de los " +
    "salarios dividida por el salario bruto promedio de los asalariados registrados del sector privado de cada provincia (OEDE, con datos del SIPA), " +
    "el último mes sin aguinaldo. El salario bruto incluye los aportes que se le descuentan al trabajador. La canasta se arma con precios del " +
    "Gran Buenos Aires y es una sola para todo el país.",
  "salario-real-nota": `Índice de salarios del INDEC dividido por el índice de precios al consumidor del país, con ` +
    `${ESR.base} = 100, el primer mes del índice de precios del país. El índice de salarios tiene ponderaciones fijas: mide cuánto cambian los salarios, no cuánto ` +
    `cobra en promedio cada persona. El INDEC publica también el del sector privado no registrado, que la ficha no muestra: sale de la Encuesta Permanente de ` +
    `Hogares y llega con cinco meses de rezago, así que no se puede comparar con los precios del mismo mes. Los salarios promedio de cada provincia están en Trabajo: son otra medida, el promedio por puesto del OEDE, y pueden variar distinto.`,
  "mayoristas-nota": `El índice de precios internos al por mayor (IPIM) del INDEC mide los precios de los productos nacionales e importados que se venden en el mercado interno. ` +
    `El índice de precios al consumidor (IPC) mide lo que pagan los hogares, también por servicios, que el IPIM no cuenta. El dólar es el mayorista de referencia del Banco Central, el último valor de cada mes. ` +
    `Nivel: cada serie con ${EMY.desde} = 100, el primer mes del IPC del país. La correlación es de rangos entre los aumentos mensuales, ${EMY.n_meses} meses desde ${EMY.desde_anio}: en el mismo mes da ${n2(EMY.r_mismo)}. ` +
    `Que un aumento venga antes que otro no prueba que lo cause.`,
  "sectores-empleo-nota": `Actividad: el Estimador Mensual de Actividad Económica del INDEC de cada sección de la CIIU (revisión 3), promedio de los doce meses. ` +
    `Empleo: los asalariados registrados del sector privado de la misma sección (OEDE, Secretaría de Trabajo, Ministerio de Capital Humano, con datos del SIPA), promedio de los cuatro trimestres. ` +
    `Sin la administración pública, que el OEDE no cuenta. En la enseñanza y la salud la actividad incluye a los establecimientos públicos y el empleo, solo a los privados. ` +
    `El empleo registrado no incluye a los asalariados sin aportes ni a los cuentapropistas. El texto nombra un sector cuando la actividad y el empleo se mueven ` +
    `${n1(ESE.min)} puntos o más cada uno. Que dos variaciones vayan juntas o separadas no prueba una causa.`,
  "emae-nota": `Estimador Mensual de Actividad Económica del INDEC, base 2004 = 100: un indicador provisorio de cómo ` +
    `cambia el producto interno bruto a precios constantes, que se arma con información parcial. El INDEC revisa la serie completa con cada publicación. La serie sin ` +
    `estacionalidad quita el efecto de la época del año, para comparar un mes con el anterior. Por sector, los últimos doce meses frente a los doce anteriores, ` +
    `porque algunos, como la pesca y el agro, cambian mucho de un mes a otro. La vista por sector no incluye los impuestos netos de subsidios, que el INDEC suma al total.`,
});
Object.assign(MED, {
  "sectores-empleo": "uno",
  mayoristas: "doce",
  supermercados: "prov",
  inflacion: "doce",
  "inflacion-rubros": "division",
  canastas: "region",
  emae: "mes",
});
Object.assign(DIB, {
  // inflación (etapa 25): en doce meses o mes a mes, el país y la región de la provincia elegida, o las seis regiones en el último mes
  inflacion: conTablas("inflacion", () => MED.inflacion === "region" ? [] : ["inflacion_mensual"], a => {
    const v = MED.inflacion, el = G("inflacion"), regs = REG_IPC[prov] || [];
    let txt = LEAD.inflacion(v);
    if (v === "monto") { $t("inflacion").textContent = txt; return calcInflacion(el); }
    if (v === "region") {
      txt += enSuRegion(T.inflacion_regiones, "interanual", pct);
      $t("inflacion").textContent = txt;
      const data = T.inflacion_regiones.filter(r => r.codigo !== "nacional").map(r => ({codigo_indec: "r-" + r.codigo, territorio: r.region, ia: r.interanual,
        m: r.mensual, anio: r.en_el_anio}));
      barrasH(el, {anim: a, data, k: "ia", vf: pct, af: v => n0(v) + "%", ref: EIP.interanual, refLab: `País ${pct(EIP.interanual)}`, l: 150, lAngosto: 128,
        marcar: new Set(regs.map(r => "r-" + r)),
        tip: d => `<b>${d.territorio}</b><br>${pct(d.ia)} en los doce meses hasta ${EIP.mes}<br>${pct(d.m)} en el mes<br>${pct(d.anio)} en lo que va del año`});
      el.resaltar = null;  // con otra provincia elegida se vuelve a dibujar
      return;
    }
    const k = v === "mes" ? "mensual" : "interanual";
    txt += enSuRegion(T.inflacion_regiones, v === "mes" ? "mensual" : "interanual", pct);
    $t("inflacion").textContent = txt;
    const nom = Object.fromEntries(T.inflacion_regiones.map(r => [r.codigo, r.region]));
    const data = T.inflacion_mensual.filter(r => r[k] != null).map(r => ({periodo: r.periodo, t: tPer(r.periodo), pais: r[k],
      ...Object.fromEntries(regs.map(g => [g, r[k + "_" + g]]))}));
    lineas(el, {anim: a, data, x: "t", y0: 0, vf: pct, yf: v => n0(v) + "%", xl: r => mesPer(r.periodo), mensual: true,
      series: [{k: "pais", lab: "Todo el país", c: NAR}, ...regs.map((g, i) => ({k: g, lab: nom[g], c: i ? css("--sol-borde") : FRI}))]});
  }),
  // inflación por rubro (etapa 25): las doce divisiones, las tres categorías o los bienes y los servicios, en los doce meses hasta el último mes
  "inflacion-rubros": a => {
    const g = MED["inflacion-rubros"];
    $t("inflacion-rubros").textContent = LEAD["inflacion-rubros"](g);
    $("ipd-elige").hidden = g !== "detalle";
    if (g === "tu") return cargarTabla("inflacion_personal").then(() => calcInflacionPersonal(G("inflacion-rubros")),
      () => sinDatos(G("inflacion-rubros"), "No se pudieron cargar los datos. Probá recargar la página."));
    if (g === "detalle") return cargarTabla("inflacion_detalle").then(() => ipcDetalle(a),
      () => sinDatos(G("inflacion-rubros"), "No se pudieron cargar los datos. Probá recargar la página."));
    // los códigos van con una letra delante: un código de rubro no tiene que coincidir con el de la provincia elegida
    const data = T.inflacion_rubros.filter(r => r.grupo === g).map(r => ({codigo_indec: "i" + r.codigo, territorio: r.rubro, corto: r.corto, ia: r.interanual, m: r.mensual}));
    barrasH(G("inflacion-rubros"), {anim: a, data, k: "ia", vf: pct, af: v => n0(v) + "%", ref: EIP.interanual, refLab: `Nivel general ${pct(EIP.interanual)}`,
      paisLab: "Nivel general", l: g === "division" ? 236 : 150, lAngosto: 150, corto: d => d.corto,
      tip: d => `<b>${d.territorio}</b><br>${pct(d.ia)} en los doce meses hasta ${EIP.mes}<br>${pct(d.m)} en el mes`});
  },
  // el salario mínimo frente a la canasta básica total y la alimentaria de un hogar de cuatro integrantes, mes a mes (14 de noviembre de 2026).
  // La línea del 100% es la canasta entera
  "salario-minimo": conTablas("salario-minimo", ["salario_minimo_canasta"], a => lineas(G("salario-minimo"), {anim: a, mensual: true,
    data: T.salario_minimo_canasta.map(r => ({...r, t: tPer(r.periodo)})), x: "t", y0: 0, vf: pct, yf: v => n0(v) + "%", xl: r => mesPer(r.periodo),
    ref: 100, refLab: "100%: la canasta entera", refLabCorto: "100%",
    series: [{k: "pct_canasta_alimentaria", lab: "Canasta alimentaria", corto: "Alimentaria", c: FRI},
      {k: "pct_canasta_total", lab: "Canasta total", corto: "Total", c: NAR, w: 3}]})),
  // canastas básicas (etapa 25): las seis regiones en el último mes del informe semestral, o la del Gran Buenos Aires frente a los precios
  canastas: conTablas("canastas", () => MED.canastas === "precios" ? ["canasta_mensual"] : [], a => {
    const v = MED.canastas, el = G("canastas"), regs = REG_IPC[prov] || [];
    let txt = LEAD.canastas(v);
    if (v === "precios") {
      $t("canastas").textContent = txt;
      const data = T.canasta_mensual.filter(r => r.interanual_cbt != null).map(r => ({periodo: r.periodo, t: tPer(r.periodo), cbt: r.interanual_cbt,
        cba: r.interanual_cba, ipc: r.interanual_ipc_gba}));
      return lineas(el, {anim: a, data, x: "t", y0: 0, vf: pct, yf: v => n0(v) + "%", xl: r => mesPer(r.periodo), mensual: true,
        series: [{k: "cbt", lab: "Canasta básica total", corto: "Total", c: NAR}, {k: "cba", lab: "Canasta básica alimentaria", corto: "Alimentaria", c: FRI},
          {k: "ipc", lab: "Precios del Gran Buenos Aires", corto: "Precios", c: css("--muted"), dash: "4 3"}]});
    }
    txt += enSuRegion(T.canasta_regiones, "cbt", v => n0(v) + " pesos por adulto equivalente");
    $t("canastas").textContent = txt;
    const data = T.canasta_regiones.map(r => ({codigo_indec: "r-" + r.codigo, territorio: r.region, cbt: r.cbt, cba: r.cba, ia: r.interanual_cbt}));
    barrasH(el, {anim: a, data, k: "cbt", vf: n0, af: v => n0(v / 1000) + " mil", l: 150, lAngosto: 128, marcar: new Set(regs.map(r => "r-" + r)),
      tip: d => `<b>${d.territorio}</b><br>Canasta básica total: ${n0(d.cbt)} pesos por adulto equivalente<br>Canasta básica alimentaria: ${n0(d.cba)} pesos` +
        (d.ia != null ? `<br>La total, en doce meses: ${cambioPct(d.ia)}` : "")});
    el.resaltar = null;  // con otra provincia elegida se vuelve a dibujar
  }),
  // producción industrial y minera (3 de noviembre de 2026): las ramas de la industria o los grupos de la minería frente al mismo mes del año
  // anterior, o los dos niveles generales sin estacionalidad mes a mes
  industria: conTablas("industria", () => MED.industria === "mes" ? ["produccion_mensual"] : [], a => {
    const v = MED.industria || "industria", el = G("industria");
    $t("industria").textContent = LEAD.industria(v);
    if (v === "mes") return lineas(el, {anim: a, data: T.produccion_mensual.map(r => ({...r, t: tPer(r.periodo)})), x: "t", y0: 0, vf: n1, yf: n0,
      xl: r => mesPer(r.periodo), mensual: true, series: [{k: "industria", lab: "Industria", c: NAR}, {k: "mineria", lab: "Minería", c: FRI}]});
    const min = v === "mineria", ref = min ? IND.min_ia : IND.ia, todo = min ? "Toda la minería" : "Toda la industria";
    const data = T.industria_ramas.filter(r => r.sector === (min ? "mineria" : "industria"))
      .map((r, i) => ({codigo_indec: "i" + i, territorio: r.rama, v: r.interanual, desc: r.descripcion}));
    barrasH(el, {anim: a, data, k: "v", vf: pct, af: x => n0(x) + "%", ref, refLab: `${todo} ${pct(ref)}`, paisLab: todo, l: 176, lAngosto: 140,
      tip: d => `<b>${d.desc}</b><br>${pct(d.v)} en ${IND.mes}, frente a ${IND.mes_ant}`});
    el.resaltar = null;
  }),
  // canasta de crianza (3 de noviembre de 2026): las cuatro edades en el último mes, en bienes y servicios y en cuidado, o mes a mes descontada la inflación
  crianza: conTablas("crianza", () => MED.crianza === "mes" ? ["canasta_crianza"] : [], a => {
    const v = MED.crianza, el = G("crianza");
    $t("crianza").textContent = LEAD.crianza(v);
    if (v === "mes") return lineas(el, {anim: a, data: T.canasta_crianza.filter(r => r.real_6a12 != null).map(r => ({...r, t: tPer(r.periodo)})), x: "t", y0: 0,
      vf: n0, yf: x => n0(x / 1000) + " mil", xl: r => mesPer(r.periodo), mensual: true,
      series: ECR.edades.map((e, i) => ({k: "real_" + e.k, lab: e.lab, c: [css("--faint"), css("--celeste"), FRI, NAR][i]}))});
    if (v === "salario") return barrasH(el, {anim: a, data: T.crianza_salario.filter(r => r.codigo_indec !== "00"), k: "pct_6a12", vf: pct, af: x => n0(x) + "%",
      ref: ECR.salario.pais, refLab: `País ${pct(ECR.salario.pais)}`,
      tip: d => `<b>${d.territorio}</b><br>Salario bruto promedio: ${n0(d.salario)} pesos<br>Canasta de 6 a 12 años: ${pct(d.pct_6a12)} del salario<br>` +
        `De 1 a 3 años: ${pct(d.pct_1a3)}`});
    barrasH(el, {anim: a, data: ECR.edades.map(e => ({codigo_indec: "c-" + e.k, territorio: e.lab, tot: e.tot, bys: e.bys, cuid: e.cuid})), k: "tot",
      vf: n0, af: x => n0(x / 1000) + " mil", l: 150, lAngosto: 128,
      tip: d => `<b>${d.territorio}</b><br>Total: ${n0(d.tot)} pesos por mes<br>Bienes y servicios: ${n0(d.bys)}<br>Cuidado: ${n0(d.cuid)}`});
    el.resaltar = null;
  }),
  // salarios registrados descontada la inflación (etapa 25): índice del INDEC dividido por el IPC, diciembre de 2016 = 100
  "salario-real": conTablas("salario-real", () => ["salario_real_mensual"], a => {
    $t("salario-real").textContent = LEAD["salario-real"]();
    lineas(G("salario-real"), {anim: a, data: T.salario_real_mensual.map(r => ({...r, t: tPer(r.periodo)})), x: "t", y0: 0, vf: n1, yf: n0,
      xl: r => mesPer(r.periodo), mensual: true, series: [{k: "privado", lab: "Privado registrado", c: NAR}, {k: "publico", lab: "Público", c: FRI}]});
  }),
  mayoristas: conTablas("mayoristas", () => ["mayoristas_mensual"], a => {
    const v = MED.mayoristas || "doce", doce = v === "doce", el = G("mayoristas"), p = doce ? "ia_" : "";
    $t("mayoristas").textContent = LEAD.mayoristas(v);
    lineas(el, {anim: a, data: T.mayoristas_mensual.filter(r => r.ia_ipc != null || !doce).map(r => ({...r, t: tPer(r.periodo)})), x: "t", y0: 0,
      vf: doce ? pct : n0, yf: doce ? (x => n0(x) + "%") : n0, xl: r => mesPer(r.periodo), mensual: true,
      series: [{k: p + "ipim", lab: "Mayoristas", c: NAR}, {k: p + "ipc", lab: "Al consumidor", c: FRI, ct: css("--sol-texto")}, {k: p + "dolar", lab: "Dólar", c: css("--ink")}]});
  }),
  "sectores-empleo": a => {
    const v = MED["sectores-empleo"] || "uno", k = v === "uno" ? "1" : "10";
    $t("sectores-empleo").textContent = LEAD["sectores-empleo"](v);
    const data = T.sectores_empleo.map((r, i) => ({codigo_indec: "s" + i, territorio: r.corto, act: r["actividad_" + k], emp: r["empleo_" + k], sector: r.sector}));
    // sin animación: los dos puntos son dos medidas del mismo período, no un antes y un después
    pesas(G("sectores-empleo"), {anim: false, data, a: "act", b: "emp", la: "Actividad", lb: "Empleo registrado", vf: conSigno, af: x => x + "%",
      x0: Math.min(0, d3.min(data, d => Math.min(d.act, d.emp)) * 1.1), ref: 0, refLab: "Sin cambio", refC: "--muted"});
  },
  emae: conTablas("emae", () => MED.emae === "mes" ? ["actividad_mensual"] : [], a => {
    const v = MED.emae, el = G("emae");
    $t("emae").textContent = LEAD.emae(v);
    if (v === "mes") return lineas(el, {anim: a, data: T.actividad_mensual.map(r => ({...r, t: tPer(r.periodo)})), x: "t", y0: 0, vf: n1, yf: n0,
      xl: r => mesPer(r.periodo), mensual: true, series: [{k: "desestacionalizada", lab: "Sin estacionalidad", corto: "Actividad", c: NAR}]});
    const data = T.actividad_sectores.map(r => ({codigo_indec: "s" + r.letra, territorio: r.sector, corto: r.corto, v: r.doce_meses, ia: r.interanual}));
    barrasH(el, {anim: a, data, k: "v", vf: pct, af: v => n0(v) + "%", ref: EMA.doce, refLab: `Toda la economía ${pct(EMA.doce)}`, paisLab: "Toda la economía",
      l: 236, lAngosto: 150, corto: d => d.corto,
      tip: d => `<b>${d.territorio}</b><br>${pct(d.v)} en los doce meses hasta ${EMA.mes}, frente a los doce anteriores<br>${pct(d.ia)} en el mes, frente a ${EMA.mes_ant}`});
  }),
  // ventas en supermercados (etapa 26): la variación de cada provincia en doce meses, o el índice del país mes a mes
  supermercados: conTablas("supermercados", () => MED.supermercados === "mes" ? ["supermercados_mensual"] : [], a => {
    const v = MED.supermercados, el = G("supermercados"), fp = T.supermercados_provincias.find(r => r.codigo_indec === prov);
    let txt = LEAD.supermercados(v);
    if (v === "mes") {
      $t("supermercados").textContent = txt;
      return lineas(el, {anim: a, data: T.supermercados_mensual.map(r => ({...r, t: tPer(r.periodo)})), x: "t", y0: 0, vf: n1, yf: n0,
        xl: r => mesPer(r.periodo), mensual: true, series: [{k: "desestacionalizada", lab: "Sin estacionalidad", corto: "Ventas", c: NAR}]});
    }
    if (fp && fp.territorio !== ESU.prov.top[0] && fp.territorio !== ESU.prov.bajo[0]) txt += ` En ${fp.territorio}, ${conSigno(fp.var_12m)}.`;
    $t("supermercados").textContent = txt;
    barrasH(el, {anim: a, data: T.supermercados_provincias, k: "var_12m", vf: conSigno, af: v => n0(v) + "%", ref: ESU.prov.pais,
      refLab: `País ${conSigno(ESU.prov.pais)}`, tip: d => `<b>${d.territorio}</b><br>${conSigno(d.var_12m)} en los doce meses hasta ${ESU.mes}, ` +
        `frente a los doce anteriores<br>${conSigno(d.var_mes)} en ${ESU.mes}, frente a ${ESU.mes_ant}<br>Con la inflación de la región ${d.region}`});
  }),
});
/* Expectativas de inflación y confianza del consumidor (etapa 42): series mensuales de la Di Tella */
DIB.expectativas = conTablas("expectativas", ["expectativas_inflacion"], a => {
  const E = R.expectativas_inflacion, d = T.expectativas_inflacion.map(r => ({...r, t: tPer(r.mes)}));
  $t("expectativas").textContent = `En ${mesPer(E.mes)}, la mitad de las personas encuestadas esperaba una inflación de hasta ${pct(E.mediana)} para los doce meses siguientes ` +
    `y el promedio de las respuestas fue ${pct(E.promedio)}. En los doce meses hasta ${mesPer(E.ipc_mes)}, la inflación del INDEC fue ${pct(E.ipc_12m)}. De los ${E.comp_n} meses ` +
    `entre ${mesPer(E.comp_desde)} y ${mesPer(E.comp_hasta)}, en ${E.comp_debajo} la mediana de lo esperado quedó por debajo de la inflación que hubo después.`;
  lineas(G("expectativas"), {anim: a, data: d, x: "t", y0: 0, mensual: true, vf: pct, yf: v => n0(v) + "%", xl: r => mesPer(r.mes),
    series: [{k: "inflacion_12m_siguientes", lab: "La que hubo en los doce meses siguientes", corto: "La que hubo", c: GRIS, w: 2},
      {k: "promedio", lab: "Esperada, promedio", corto: "Promedio", c: FRI, w: 1.8}, {k: "mediana", lab: "Esperada, mediana", corto: "Mediana", c: css("--celeste-fuerte"), w: 2.6}]});
});
MED["confianza-consumidor"] = "partes";
DIB["confianza-consumidor"] = conTablas("confianza-consumidor", ["confianza_consumidor"], a => {
  const C = R.confianza_consumidor, reg = MED["confianza-consumidor"] === "regiones";
  const comp = C.hace_un_anio == null ? "" : `, contra ${n1(C.hace_un_anio)} un año antes`;
  $t("confianza-consumidor").textContent = reg
    ? `En ${mesPer(C.mes)} el índice era ${n1(C.capital)} en CABA, ${n1(C.gba)} en el Gran Buenos Aires ${yE(n1(C.interior))} en el interior del país, ` +
      `con ${n1(C.nacional)} para el total.`
    : `En ${mesPer(C.mes)} el Índice de Confianza del Consumidor fue ${n1(C.nacional)} en una escala de 0 a 100${comp}. De sus partes, la situación macroeconómica ` +
      `estaba en ${n1(C.macro)}, la situación personal en ${n1(C.personal)} y el momento para comprar bienes durables e inmuebles en ${n1(C.bienes)}. Desde ${mesPer(C.desde)}, ` +
      `el valor más alto fue ${n1(C.max.v)}, en ${mesPer(C.max.mes)}, y el más bajo, ${n1(C.min.v)}, en ${mesPer(C.min.mes)}.`;
  lineas(G("confianza-consumidor"), {anim: a, data: T.confianza_consumidor.map(r => ({...r, t: tPer(r.mes)})), x: "t", y0: 0, mensual: true, vf: n1, yf: n0, xl: r => mesPer(r.mes),
    series: reg
      ? [{k: "capital", lab: "CABA", corto: "CABA", c: css("--muted"), w: 1.8}, {k: "gba", lab: "Gran Buenos Aires", corto: "GBA", c: FRI, w: 1.8},
         {k: "interior", lab: "Interior", c: GRIS, w: 1.8}, {k: "nacional", lab: "Total", c: css("--celeste-fuerte"), w: 2.6}]
      : [{k: "macro", lab: "Situación macroeconómica", corto: "Macro", c: FRI, w: 1.6}, {k: "personal", lab: "Situación personal", corto: "Personal", c: css("--muted"), w: 1.6},
         {k: "bienes", lab: "Bienes durables e inmuebles", corto: "Bienes", c: GRIS, w: 1.6}, {k: "nacional", lab: "Índice", c: css("--celeste-fuerte"), w: 2.6}]});
});
const bCorto = x => Number.isInteger(x) ? n0(x) : (Math.abs(x) < 1 ? n2(x) : n1(x)).replace(/,0+$/, "");
// los montos de las series que empiezan en 1940, en pesos de hoy, son ínfimos (a la moneda se le sacaron 13 ceros): van en pesos, con dos cifras
const bInfimo = new Intl.NumberFormat("es-AR", {maximumSignificantDigits: 2});
const bMonto = v => v >= 1e6 ? `${n1(v / 1e6)} billones` : v >= 1e3 ? `${n1(v / 1e3)} mil millones` : v >= 1 ? `${n0(v)} millones` : `${bInfimo.format(v * 1e6)} pesos`;
const bMontoEje = v => v === 0 ? "0" : v >= 1e6 ? bCorto(v / 1e6) + " bill." : v >= 1e3 ? bCorto(v / 1e3) + " mil M" : v >= 1 ? bCorto(v) + " M" : "$ " + bInfimo.format(v * 1e6);
const bUsd = v => v >= 1e3 ? `${n1(v / 1e3)} mil millones de dólares` : `${n0(v)} millones de dólares`;
const bUsdEje = v => v === 0 ? "0" : v >= 1e3 ? bCorto(v / 1e3) + " mil M" : bCorto(v) + " M";
const bDolar = v => v >= 100 ? n0(v) : n2(v);
const bIndice = v => v >= 1000 ? n0(v) : v >= 100 ? n1(v) : n2(v);
const ejePct = x => n0(x) + "%";
const BCR_VISTAS = {millones: [["nominal", "En pesos"], ["real", "Sin inflación"], ["pbi", "% del PBI"]], dolar: [["nominal", "En pesos"], ["real", "Sin inflación"]],
  tna: [["nominal", "Tasa"], ["real", "Tasa real"]], tea: [["nominal", "Tasa"], ["real", "Tasa real"]], var: [["nominal", "Con inflación"], ["real", "Sin inflación"]],
  indice: [["nominal", "Valor"], ["var", "En 12 meses"]], pesos: [["nominal", "Valor"], ["var", "En 12 meses"]], acum: [["nominal", "Valor"], ["var", "En 12 meses"]],
  usd: [["nominal", "En dólares"], ["pbi", "% del PBI"]]};
// qué se dibuja en cada vista: la columna (k), su formato (f), el del eje (yf), la escala logarítmica y una segunda línea con la inflación del INDEC
const bcrCfg = (v, m) => {
  const inf12 = {k: "inflacion_12m", lab: "Inflación de los mismos 12 meses", corto: "Inflación", c: FRI};
  if (v.t === "millones") return m === "pbi" ? {k: "pct_pbi", f: x => pct(x) + " del PBI", yf: ejePct}
    : m === "real" ? {k: "valor_real", f: x => bMonto(x) + " de pesos", yf: bMontoEje} : {k: "valor", f: x => bMonto(x) + " de pesos", yf: bMontoEje, log: true};
  if (v.t === "dolar") return {k: m === "real" ? "valor_real" : "valor", f: x => bDolar(x) + " pesos", yf: bCorto, log: m !== "real"};
  // las tasas nominales de los años de inflación muy alta (la serie desde 1985) pasan de miles por ciento: con eso, escala logarítmica (logAuto)
  if (v.t === "tna" || v.t === "tea") return m === "real" ? {k: "tasa_real_mensual", f: conSigno, yf: ejePct, ref: 0, lab: "Tasa real a 30 días", corto: "Tasa real"}
    : {k: "valor", f: x => `${pct(x)} ${v.u.replace(/^%\s*/, "")}`, yf: ejePct, corto: "Tasa", logAuto: true};
  if (v.t === "tasa_usd") return {k: "valor", f: x => `${pct(x)} ${v.u.replace(/^%\s*/, "")}`, yf: ejePct, corto: "Tasa"};
  if (v.t === "pct") return {k: "valor", f: pct, yf: ejePct};
  if (v.t === "usd") return m === "pbi" ? {k: "pct_pbi", f: x => pct(x) + " del PBI", yf: ejePct} : {k: "valor", f: bUsd, yf: bUsdEje};
  if (v.t === "var") return m === "real" ? {k: "variacion_real_12m", f: conSigno, yf: ejePct, ref: 0, lab: "Sin la inflación", corto: "Sin inflación"}
    : {k: "valor", f: pct, yf: ejePct, corto: "M2", extra: inf12};
  if (["indice", "pesos", "acum"].includes(v.t)) return m === "var"
    ? {k: "variacion_12m", f: pct, yf: ejePct, lab: `${v.n}, variación en 12 meses`, corto: v.t === "acum" ? "Tasa" : v.n.split(" (")[0], extra: inf12}
    : {k: "valor", f: v.t === "acum" ? (x => n1(x) + "% acumulado") : v.t === "pesos" ? (x => n2(x) + " pesos") : bIndice, yf: bCorto, log: true};
  if (v.t === "rem") return {k: "valor", f: pct, yf: ejePct, lab: "Inflación esperada", corto: "Esperada",
    extra: {k: "inflacion_12m_siguientes", lab: "Inflación que hubo en esos 12 meses", corto: "La que hubo", c: FRI}};
  return {k: "valor", f: n2, yf: bCorto};
};
// el conmutador cambia con el tipo de variable. Los botones se rehacen solo si cambian las vistas, así el foco del teclado no se pierde
const bcrConm = v => {
  const conm = $("bcra-conm"), vistas = BCR_VISTAS[v.t] || [["nominal", "Valor"]];
  if (!vistas.some(([m]) => m === MED["bcra-m"])) MED["bcra-m"] = vistas[0][0];
  if (conm.dataset.vistas !== vistas.join()) {
    conm.dataset.vistas = vistas.join();
    conm.innerHTML = vistas.map(([m, lab]) => `<button type="button" data-m="${m}">${lab}</button>`).join("");
  }
  conm.hidden = vistas.length < 2;
  conm.style.setProperty("--n", vistas.length);
  conm.style.setProperty("--i", vistas.findIndex(([m]) => m === MED["bcra-m"]));
  conm.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.m === MED["bcra-m"])));
};
// el texto de cada vista: el último dato, la comparación que corresponde y el rango de la serie
const bcrTxt = (v, m, c, filas) => {
  const k = c.k, con = filas.filter(r => r[k] != null), u = con[con.length - 1], mes = r => mesPer(r.mes);
  const ant = con.find(r => r.mes === `${+u.mes.slice(0, 4) - 1}${u.mes.slice(4)}`);
  const mx = con.reduce((a, r) => r[k] > a[k] ? r : a), mn = con.reduce((a, r) => r[k] < a[k] ? r : a);
  const rango = f => ` Desde ${mes(con[0])}, el valor más alto fue de ${f(mx[k])}, en ${mes(mx)}, y el más bajo, de ${f(mn[k])}, en ${mes(mn)}.`;
  const doce = ant ? `, ${conSigno((u[k] / ant[k] - 1) * 100)} en doce meses` : "";
  const ambos = c.extra ? filas.filter(r => r[k] != null && r[c.extra.k] != null) : [];
  const b = ambos[ambos.length - 1];
  if (v.t === "millones") return m === "nominal"
    ? `${v.n}: ${c.f(u[k])} en ${mes(u)}${doce}. En pesos de cada mes, la serie sube sobre todo por la inflación: para comparar en el tiempo están las vistas sin la inflación, ` +
      `desde ${mesPer(BV.ipc_desde)}, y en % del PBI, desde ${BV.pib_desde}.`
    : m === "real" ? `${v.n}, en pesos de ${mesPer(BV.ipc_mes)}: ${bMonto(u[k])} en ${mes(u)}${doce}.` + rango(bMonto)
    : `${v.n}: ${c.f(u[k])} en ${mes(u)}.` + rango(c.f);
  if (v.t === "dolar") return m === "real"
    ? `${v.n}, descontada la inflación de la Argentina y la de los Estados Unidos: ${c.f(u[k])} por dólar en ${mes(u)}.` + rango(c.f) + ` Todos los valores están en pesos de ${mesPer(BV.tcr_mes)}.`
    : `${v.n}: ${c.f(u[k])} por dólar en ${mes(u)}${doce}. La vista «Sin inflación» descuenta la inflación de la Argentina y la de los Estados Unidos.`;
  if (v.t === "tna" || v.t === "tea") {
    if (m === "nominal") return `${v.n}: ${c.f(u[k])} en ${mes(u)}` + (ant ? `, contra ${pct(ant[k])} un año antes` : "") + `. El valor más alto desde ${mes(con[0])} fue de ${pct(mx[k])}, en ${mes(mx)}.`;
    const ult = con.slice(-12), pos = ult.filter(r => r[k] > 0).length;
    return `${v.n}: tasa real a 30 días de ${conSigno(u[k])} en ${mes(u)}, con una inflación de ${pct(u.inflacion_mes_siguiente)} en el mes siguiente.` +
      (ult.length === 12 ? ` En los últimos doce meses con dato fue positiva en ${pos} y negativa en ${12 - pos}.` : "") +
      ` Desde ${mes(con[0])}, el promedio fue de ${conSigno(d3.mean(con, r => r[k]))} por mes.`;
  }
  if (v.t === "var") return m === "real" ? `${v.n}, descontada la inflación: ${conSigno(u[k])} en ${mes(u)}.` + rango(conSigno)
    : `${v.n}: ${pct(u[k])} en ${mes(u)}.` + (b ? ` En ${mes(b)}, el último mes con inflación publicada, fue de ${pct(b[k])}, con una inflación de ${pct(b[c.extra.k])} en los mismos doce meses.` : "");
  if (["indice", "pesos", "acum"].includes(v.t)) return m === "var"
    ? (b ? `${v.n}: ${conSigno(b[k])} en los doce meses hasta ${mes(b)}, contra una inflación de ${pct(b[c.extra.k])}.` : `${v.n}: ${conSigno(u[k])} en los doce meses hasta ${mes(u)}.`)
    : `${v.n}: ${c.f(u[k])} en ${mes(u)}` + (v.t === "acum" ? `, lo que suman los intereses desde ${mes(con[0])}` : "") + `. La vista en 12 meses compara su variación con la inflación.`;
  if (v.t === "usd") return m === "pbi" ? `${v.n}: ${c.f(u[k])} en ${mes(u)}, pasado a pesos con el dólar mayorista de fin de mes.` + rango(c.f)
    : `${v.n}: ${c.f(u[k])} en ${mes(u)}${doce}.` + rango(c.f);
  if (v.t === "rem") {
    const mas = ambos.filter(r => r[c.extra.k] > r[k]).length;
    return `En ${mes(u)}, quienes responden el Relevamiento de Expectativas de Mercado del BCRA esperaban ${pct(u[k])} de inflación para los doce meses siguientes.` +
      (b ? ` La última expectativa que ya se puede comparar, la de ${mes(b)}, fue de ${pct(b[k])}, y la inflación de esos doce meses resultó de ${pct(b[c.extra.k])}.` +
        ` En ${mas} de los ${ambos.length} meses comparables, la inflación fue mayor que la esperada.` : "");
  }
  return `${v.n}: ${c.f(u[k])} en ${mes(u)}.` + rango(c.f);
};
DIB.bcra = conTablas("bcra", ["bcra_variables"], a => {
  const v = bcrVar(), el = G("bcra");
  bcrConm(v);
  const m = MED["bcra-m"], c = bcrCfg(v, m);
  const filas = T.bcra_variables.filter(r => r.id === v.id && (r[c.k] != null || (c.extra && r[c.extra.k] != null)))
    .map(r => ({...r, valor: bcrValor(r), t: tPer(r.mes)}));
  if (!filas.some(r => r[c.k] != null)) return sinDatos(el, "No hay datos de esta variable.");
  $t("bcra").textContent = bcrTxt(v, m, c, filas);
  const vals = filas.flatMap(r => [r[c.k], c.extra ? r[c.extra.k] : null]).filter(x => x != null);
  const log = c.log || (c.logAuto && d3.min(vals) > 0 && d3.max(vals) > 300);
  lineas(el, {anim: a, data: filas, x: "t", log, y0: Math.min(0, d3.min(vals)), ref: c.ref, vf: c.f, yf: c.yf, xl: r => mesPer(r.mes), mensual: true,
    series: [{k: c.k, lab: c.lab || v.n, corto: c.corto || "Último dato", c: NAR}, ...(c.extra ? [c.extra] : [])]});
  // la tabla abierta sigue a la variable elegida
  const caja = document.querySelector("#f-bcra .tabla-datos"); if (caja) caja.innerHTML = tablaDatos(TABLA_VISTA["f-bcra"](T.bcra_variables), "f-bcra");
});
};
