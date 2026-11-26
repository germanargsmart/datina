// Parte de datina.js que usa solo externo.html (comercio exterior: exportaciones por rubro, complejos, destinos y provincia, balanza,
// importaciones por uso y origen, socios, qué se le vende y compra a cada país, valor por kilo, cuenta corriente y reservas). Plan técnico,
// fase 5 (25 de noviembre de 2026): 03_construir_sitio.py la publica en sitio/partes/externo.js, achicada como datina.js, y solo esa página
// la pide, antes de datina.js. Acá solo se anota: datina.js la corre con parte("externo") donde empezaba el bloque del sector externo, así
// que tiene a mano todo lo que datina.js definió antes. Eran cuatro tramos de datina.js, que van acá en su orden: los dibujos de socios-que
// y valor-kilo (estaban dentro del Object.assign(DIB, {...}) grande y pasan a DIB["..."] = ...), los dos selectores de países de socios-que,
// el bloque del sector externo y las reservas brutas (DIB["reservas-bcra"]). Lo que usan también otras páginas quedó en datina.js (SX, SQ,
// VK, SQ_RUB, SQ_USO, BZ_Y, BZ_S, BZ_P, BCR_PF, BCR_INI, DIB.exportaciones y los textos de TX y LEAD). Lo que se declara acá adentro queda
// para esta parte.
window.DATINA_PARTES = window.DATINA_PARTES || {};
window.DATINA_PARTES["externo"] = () => {
// Desde el 25 de noviembre de 2026 (fase 5, los textos y los gráficos de cada sección) también las notas de TX que no lee la lupa y las
// vistas de entrada de MED de esta página, que estaban en los objetos grandes de datina.js: textosParte las suma a TX y las escribe en
// su lugar, como hace datina.js con las del núcleo al comienzo
textosParte({
  "exporta-rubros-nota": `Valores FOB (la mercadería puesta en el puerto o en la frontera, sin flete ni seguro), en dólares de cada año: no descuentan la inflación de los Estados Unidos. ` +
    `Primarios: granos, semillas, minerales, frutas y pescado sin procesar. Agroindustria: las manufacturas de origen agropecuario, como harinas, aceites, carnes, lácteos y vinos. ` +
    `Industria: las manufacturas de origen industrial, como vehículos, químicos, metales y oro. Energía: petróleo, gas y combustibles. El año en curso, incompleto, no va en el gráfico.`,
  "complejos-nota": `Un complejo exportador reúne los productos de una misma cadena, desde la materia prima hasta las manufacturas: el complejo soja suma los porotos, la harina, el aceite y el biodiésel. ` +
    `Los sectores agrupan varios complejos, y el cuadro de cada barra dice cuánto aportó cada uno. Datos provisorios, en dólares FOB (sin flete ni seguro).`,
  "destinos-nota": `Exportaciones de bienes según el país de destino. Las zonas que juntan varios países (resto del Mercosur, resto de América Latina sin México, resto del Sudeste Asiático) no incluyen a los que aparecen solos. ` +
    `Cuando el dato de una provincia permitiría identificar a una empresa, el INDEC lo reserva por secreto estadístico y va como "sin detalle". Datos provisorios. Si elegís una provincia en Tu provincia, el gráfico muestra sus destinos.`,
  "exprov-nota": `Origen Provincial de las Exportaciones del INDEC: cada venta se asigna a la provincia donde se produjo el bien o se hizo su última transformación, no a la del puerto por donde salió. ` +
    `Una parte no tiene provincia (plataforma continental, extranjero o indeterminado), por eso las provincias no suman el total del país. El último año es provisorio.`,
  "balanza-nota": `Exportaciones en valores FOB (la mercadería puesta en el puerto o en la frontera) e importaciones en valores CIF (con el flete y el seguro), en dólares de cada año, ` +
    `sin descontar la inflación de los Estados Unidos. El saldo es la diferencia entre las dos. Son solo bienes: los servicios, como el turismo, y los intereses y las utilidades ` +
    `están en la cuenta corriente, más abajo. El año en curso, incompleto, no va en el gráfico.`,
  "importaciones-nota": `Valores CIF (con el flete y el seguro), en dólares de cada año. Es la clasificación por uso económico del INDEC: los bienes intermedios son insumos como productos químicos, ` +
    `plásticos, metales o minerales, las piezas y accesorios son partes de máquinas y vehículos, los bienes de capital son máquinas, equipos y vehículos de carga, y los vehículos ` +
    `de pasajeros son los autos. El año en curso, incompleto, no va en el gráfico.`,
  "origen-nota": `Importaciones de bienes según el país de origen, en dólares CIF, desde enero hasta el último mes publicado y comparadas con los mismos meses del año anterior. ` +
    `Las zonas que juntan varios países (resto de la Unión Europea, resto de América Latina sin México, resto del Sudeste Asiático) no incluyen a los que aparecen solos. ` +
    `México y Canadá son los socios de los Estados Unidos en el tratado comercial de América del Norte. No van los orígenes que no llegan al 0,05%. Datos provisorios.`,
  "socios-nota": `Exportaciones en valores FOB (la mercadería puesta en el puerto o en la frontera) e importaciones en valores CIF (con el flete ` +
    `y el seguro), en dólares, sumadas en los últimos doce meses publicados. El saldo es la diferencia entre las dos. Son los ${SX.socios.n} países con más ` +
    `comercio, sumando lo exportado y lo importado: la tabla descargable tiene los ${SX.socios.n_paises}. Desde ${SX.socios_hist.sin_pais_desde} el INDEC publica una parte de las exportaciones ` +
    `como confidenciales, sin rubro ni país, para que no se pueda deducir lo que vende una empresa: van en "Sin país informado". Un saldo en contra con un país no ` +
    `es en sí bueno ni malo: se compra a unos y se vende a otros, y lo que cuenta para las cuentas externas es el saldo con todos.`,
  "socios-hist-nota": `Parte de cada país en el total de cada año, con los valores en dólares del INDEC: FOB las ` +
    `exportaciones y CIF las importaciones. En cada sentido, los ${SX.socios_hist.importa.length} países que más pesaron en ${SX.socios_hist.anio}, la tabla descargable tiene todos. ` +
    `Lo que no tiene país informado cuenta en el total: en las exportaciones, desde ${SX.socios_hist.sin_pais_desde}, sobre todo por el secreto estadístico. Por eso la parte de ` +
    `cada país en esos años puede ser más baja que la real. La serie empieza en ${SX.socios_hist.desde}: en los años anteriores, que el INDEC también publica, ` +
    `una parte grande del comercio figura sin país y Alemania no aparece. ` +
    `El año en curso, incompleto, no va en el gráfico.`,
  "cuenta-corriente-nota": `Balance de pagos del INDEC, con la metodología del sexto manual del FMI. La cuenta corriente suma el saldo de los bienes (valuados FOB y registrados cuando cambian ` +
    `de dueño, por eso difiere del intercambio comercial de más arriba), el de los servicios (viajes, fletes, seguros y servicios profesionales e informáticos), el del ingreso primario ` +
    `(los intereses, las utilidades y los dividendos que se pagan y se cobran con el exterior, y los salarios) y el del ingreso secundario (transferencias, como las remesas). ` +
    `Cuando la cuenta corriente tiene déficit, la diferencia se cubre con deuda, inversiones del exterior o reservas: esos movimientos van en la cuenta financiera del balance de pagos, que esta ficha no muestra. El gráfico no muestra el ingreso secundario, que es chico, ` +
    `pero el total lo incluye. El año en curso, incompleto, no va en el gráfico.`,
  "reservas-bcra": (() => { const V = SX.reservas, f = V.factores, suma = f.reduce((a, x) => a + x.v, 0);
    const TXF = {compras: "las compras de divisas", organismos: "las operaciones con organismos internacionales", sector_publico: "otras operaciones del sector público",
      efectivo_minimo: "el efectivo mínimo de los bancos", otras: "otras operaciones"};
    const mas = [...f].sort((a, b) => b.v - a.v)[0], menos = [...f].sort((a, b) => a.v - b.v)[0], m = v => `${v > 0 ? "+" : ""}${n0(v)} millones`;
    const partes = [mas.v > 0 ? `lo que más las hizo subir fueron ${TXF[mas.k] || mas.lab.toLowerCase()} (${m(mas.v)})` : "",
      menos.v < 0 ? `lo que más las hizo bajar, ${TXF[menos.k] || menos.lab.toLowerCase()} (${m(menos.v)})` : ""].filter(Boolean);
    return `Un año antes, las reservas brutas eran ${n0(V.hace_un_anio)} millones de dólares. El máximo de la serie, con los datos de cada día, fue de ${n0(V.max)} millones, en ${MESES[+V.max_fecha.slice(0, 2) - 1]} de ${V.max_fecha.slice(3)}. ` +
      `En lo que va de ${V.anio} ${suma >= 0 ? "subieron" : "bajaron"} ${n0(Math.abs(suma))} millones` + (partes.length ? `: ${partes.join(" y ")}.` : "."); })(),
  "reservas-netas-nota": `Las reservas netas son, con el criterio de Datina, las brutas menos todo lo que el BCRA tiene que pagar o devolver en moneda extranjera dentro de un ` +
    `año según su planilla de reservas internacionales y liquidez, que publica cada mes con el formato del FMI: los dólares que los bancos dejan en el BCRA como respaldo de los ` +
    `depósitos en dólares, los depósitos del Tesoro, otras deudas a un año, el tramo a término del canje de monedas con el Banco Popular de China (los yuanes cuentan en las ` +
    `brutas, pero hay que devolverlos) y los pases con bancos del exterior. No hay una cifra oficial de reservas netas: otras estimaciones no restan los depósitos del Tesoro o ` +
    `restan también los préstamos de organismos internacionales, y dan otros números. Hasta 2021 la planilla anota el canje con China junto con los pases. Las brutas de la ` +
    `planilla coinciden con las de la API del BCRA. El oro se valúa al precio de mercado y los derechos especiales de giro (DEG) son la moneda del FMI.` +
    (SX.reservas_netas && SX.reservas_netas.n_sin_netas ? ` En ${SX.reservas_netas.n_sin_netas} meses no hay reservas netas porque la planilla no está publicada o no ` +
      `se pudo leer completa (sobre todo en 2007): ahí el gráfico no tiene dato y el mínimo y el máximo son los de los meses con dato.` : ""),
  "reservas-bcra-nota": `Reservas internacionales brutas del Banco Central: el oro, las divisas, las colocaciones y los demás activos en el exterior. Incluyen algunos que tienen una deuda ` +
    `como contrapartida, como los depósitos en dólares que los bancos dejan en el BCRA o los canjes de monedas con otros bancos centrales, por eso no todas se pueden usar libremente: la pestaña de las netas las desagrega y resta esas deudas. ` +
    `Cada punto es el último día con dato de cada mes, desde ${SX.reservas.desde} con la serie mensual del BCRA. "Meses de importación" divide las reservas por el promedio ` +
    `mensual de lo importado en los doce meses anteriores (INDEC): una referencia tradicional es que cubran al menos tres meses. "Qué las movió" muestra los factores con que el BCRA explica la variación de las reservas en lo que va del año, hasta el ` +
    `${fLarga(SX.reservas.factores_hasta)}: compras y ventas de divisas, préstamos y pagos de organismos internacionales como el FMI, otras operaciones del Tesoro, cambios en el ` +
    `efectivo mínimo que los bancos dejan en el BCRA y otras operaciones, entre ellas los cambios de cotización del oro y de las monedas. La tabla trae esos factores por año desde ${SX.reservas.factores_desde}.`,
  "socios-que-nota": `Valor FOB de las exportaciones y CIF de las importaciones, en dólares, del INDEC. Se pueden elegir los ${SQ.n} países con al menos ${n0(SQ.min)} millones de dólares de intercambio en ${SQ.anio}. ` +
    `Desde ${SX.socios_hist.sin_pais_desde}, el INDEC publica parte de las exportaciones como confidenciales, sin país ni rubro. En la fila de todo el mundo son "Sin rubro informado" y no están en la de ningún país. ` +
    `Por eso estos porcentajes no son los de "¿Qué exporta la Argentina?", donde el INDEC reparte lo confidencial entre los rubros. El valor por kilo es el total en dólares dividido por el peso neto, en dólares de cada año: mezcla productos muy distintos y no es un precio.`,
  "valor-kilo-nota": `Valor FOB de las exportaciones y CIF de las importaciones, en dólares de cada año, sin descontar la inflación, dividido por el peso neto, del INDEC. El CIF incluye el flete y el seguro hasta la Argentina, y el FOB no. ` +
    `Cuenta solo lo que tiene peso informado: queda afuera el ${pct(VK.impo_sin_peso)} de lo importado en ${VK.anio}. Lo confidencial de las exportaciones entra en el total, y no en ningún rubro. ` +
    `Los promedios cambian con lo que se vende y se compra cada año: una suba no quiere decir que el mismo producto valga más.`,
});
Object.assign(MED, {
  "socios-que": "vende",
  "valor-kilo": "anual",
});
DIB["socios-que"] = conTablas("socios-que", () => ["comercio_rubro_pais"], a => {
  const v = MED["socios-que"] || "vende", vende = v === "vende", p = vende ? "e_" : "i_", tabla = T.comercio_rubro_pais, fila = c => tabla.find(r => r.codigo === c);
  const A = fila($("sq-a").value), B = fila($("sq-b").value), M = fila("00");
  $t("socios-que").textContent = LEAD["socios-que"](v, [A, B, M]);
  const col = vende ? [css("--celeste-fuerte"), css("--celeste"), css("--sol"), css("--sol-borde")] : [css("--celeste-fuerte"), css("--celeste"), css("--celeste-suave"), css("--sol"), css("--sol-borde"), css("--ink")];
  const oscuro = vende ? [1, 0, 0, 1] : [1, 0, 0, 0, 1, 1];
  const cl = [...(vende ? SQ_RUB : SQ_USO).map((k, i) => ({k: p + k.k, lab: k.lab, c: col[i], ...(oscuro[i] ? {} : {texto: css("--ink")})})),
    {k: p + "otro", lab: vende ? "Sin rubro informado" : "Resto", c: css("--faint"), texto: css("--ink")}];
  leyenda("socios-que-ley", cl);
  const nombre = d => ({...d, codigo_indec: d.codigo === "00" ? "00" : "c" + d.codigo, territorio: d.pais});
  apiladasH(G("socios-que"), {anim: a, claves: cl, sinProv: true, izq: ang => ang ? 104 : 130, recortar: true, data: (A.codigo === B.codigo ? [A, M] : [A, B, M]).map(nombre),
    tipExtra: d => `<br>${n0(vende ? d.exportaciones : d.importaciones)} millones de dólares`});
  G("socios-que").resaltar = null;
});
DIB["valor-kilo"] = conTablas("valor-kilo", () => ["comercio_valor_kilo"], a => {
  const v = MED["valor-kilo"] || "anual", el = G("valor-kilo"), tabla = T.comercio_valor_kilo;
  $t("valor-kilo").textContent = LEAD["valor-kilo"](v);
  if (v === "anual") return lineas(el, {anim: a, data: tabla, x: "anio", y0: 0, vf: n2, yf: n1,
    series: [{k: "expo_total", lab: "Exportado", c: NAR, w: 3}, {k: "impo_total", lab: "Importado", c: FRI, ct: css("--sol-texto"), w: 3}]});
  const u = tabla.at(-1), filas = [...SQ_RUB.map(k => ({lab: `Exportado: ${k.lab.toLowerCase()}`, corto: `Exp., ${k.corto}`, v: u["expo_" + k.k]})), ...SQ_USO.map(k => ({lab: `Importado: ${k.lab.toLowerCase()}`, corto: `Imp., ${k.corto}`, v: u["impo_" + k.k]}))];
  barrasH(el, {anim: a, data: filas.filter(d => d.v != null).map((d, i) => ({codigo_indec: "k" + i, territorio: d.lab, corto: d.corto, v: d.v})), k: "v", vf: n2, af: n0, l: 240, lAngosto: 128, corto: d => d.corto,
    tip: d => `<b>${d.territorio}</b><br>${n2(d.v)} dólares por kilo en ${VK.anio}`});
  el.resaltar = null;
});

// los dos países de "¿Qué le vende y qué le compra la Argentina a cada país?": de entrada, los dos con más intercambio
if (document.getElementById("sq-a")) for (const [id, c] of [["sq-a", SQ.a], ["sq-b", SQ.b]]) {
  $(id).innerHTML = SQ.paises.map(([k, n]) => `<option value="${k}">${n}</option>`).join("");
  $(id).value = c;
  $(id).addEventListener("change", () => cambiarVista("socios-que"));
}

/* ---------- sector externo (etapa 41) ---------- */
// el nombre de cada capa va en un tono que se lee sobre el blanco (ct): el amarillo, el celeste y el gris de las capas no llegan a 4,5 a 1
const RUB_EX = [["moa", "Agroindustria", "#1F5E97"], ["moi", "Industria", "#F6B40E", "--sol-texto"], ["primarios", "Primarios", "#74ACDF", "--celeste-fuerte"],
  ["combustibles", "Energía", "#C3CAD2", "--muted"]];
DIB["exporta-rubros"] = a => areasApiladas(G("exporta-rubros"), {anim: a, data: T.exportaciones_rubros_anual, x: "anio",
  series: RUB_EX.map(([k, lab, c, ct]) => ({k, lab, c, ct})), vf: n0, yf: v => n0(v / 1000) + " mil", unidad: "millones de dólares"});
const corto = n => n.replace(/^(Complejo|Sector) /, "").replace(/^./, c => c.toUpperCase());
DIB.complejos = a => {
  const T5 = T.exportaciones_complejos, partes = d3.group(T5.filter(r => r.nivel === 2), r => r.grupo);
  barrasH(G("complejos"), {anim: a, data: T5.filter(r => r.nivel === 1).map(r => ({...r, codigo_indec: r.complejo, territorio: corto(r.complejo)})), k: "pct",
    vf: pct, af: v => v + "%", marcar: new Set(), l: 190, lAngosto: 128, color: d => d.complejo.startsWith("Resto") ? css("--faint") : css("--celeste"),
    tip: d => `<b>${d.complejo}</b><br>${n0(d.millones_usd)} millones de dólares` + (d.variacion != null ? `, ${conSigno(d.variacion)} frente al año anterior` : "") +
      (partes.get(d.complejo) || []).map(p => `<br>${p.complejo}: ${n0(p.millones_usd)}`).join("")});
};
DIB.destinos = conTablas("destinos", ["exportaciones_destinos"], a => {
  const c = NOMBRES[prov] ? prov : "00", D = SX.destinos, el = G("destinos");
  // sin los destinos que no llegan a 0,05% (se leerían 0,0%)
  const filas = T.exportaciones_destinos.filter(r => r.codigo_indec === c && r.pct >= .05);
  const nombres = filas.filter(r => !r.destino.startsWith("resto") && r.destino !== "reservado").sort((p, q) => q.millones_usd - p.millones_usd);
  const res = filas.find(r => r.destino === "reservado");
  $t("destinos").textContent = (c === "00"
    ? `Sin contar las zonas que agrupan varios países, los primeros destinos del ${D.periodo} fueron ${lista(nombres.slice(0, 3).map(r => `${r.destino_nombre} (${pct(r.pct)})`))}. ` +
      (() => { const x = D.top.filter(t => t.var != null).sort((p, q) => q.var - p.var)[0]; return x ? `Entre los seis primeros países, las ventas que más crecieron frente al mismo período del año anterior fueron las de ${x.n}: ${conSigno(x.var)}. ` : ""; })() +
      ""
    : `En el ${D.periodo}, el primer destino de ${NOMBRES[c]} fue ${nombres[0].destino_nombre}, con el ${pct(nombres[0].pct)} de lo que exportó la provincia` +
      (nombres.length > 2 ? `, seguido por ${nombres[1].destino_nombre} (${pct(nombres[1].pct)}) ${yE(nombres[2].destino_nombre)} (${pct(nombres[2].pct)})` : "") + "." +
      (res && res.pct >= 1 ? ` El ${pct(res.pct)} no tiene destino publicado por secreto estadístico.` : ""));
  barrasH(el, {anim: a, data: filas.map(r => ({...r, codigo_indec: r.destino, territorio: r.destino_nombre})), k: "pct", vf: pct, af: v => v + "%",
    marcar: new Set(), l: 196, lAngosto: 136, color: d => d.destino === "reservado" || d.destino.startsWith("resto") ? css("--faint") : css("--celeste"),
    tip: d => `<b>${d.destino_nombre}</b><br>${n0(d.millones_usd)} millones de dólares, el ${pct(d.pct)} del total` +
      (d.millones_usd_anterior > 0 ? `<br>${conSigno((d.millones_usd / d.millones_usd_anterior - 1) * 100)} frente al mismo período del año anterior` : "")});
  // sin resaltado propio: con otra provincia elegida, el gráfico se vuelve a dibujar con sus destinos
  delete el.resaltar;
});
MED.exprov = "rubro";
DIB.exprov = a => {
  const P = SX.provincias, cl = [["manufacturas_agro", "Agroindustria", "#1F5E97", "#fff"], ["manufacturas_industriales", "Industria", "#F6B40E", "#18212B"],
    ["primarios", "Primarios", "#74ACDF", "#18212B"], ["combustibles_energia", "Energía", "#C3CAD2", "#18212B"]].map(([k, lab, c, texto]) => ({k, lab, c, texto}));
  const ley = $("exprov-ley"), filas = T.exportaciones_provincias;
  const tip = d => `<b>${d.territorio}</b><br>${n0(d.millones_usd)} millones de dólares` + cl.map(x => `<br>${x.lab}: ${n0(d[x.k])}`).join("");
  if (MED.exprov === "usd") {
    ley.hidden = true;
    return barrasH(G("exprov"), {anim: a, data: filas, k: "millones_usd", vf: v => n0(v) + " M", af: v => n0(v / 1000) + " mil", tip});
  }
  ley.hidden = false;
  ley.innerHTML = cl.map(k => `<span><i style="background:${k.c}"></i>${k.lab}</span>`).join("");
  const pais = {codigo_indec: "00", territorio: "Todo el país", ...Object.fromEntries(cl.map(x => [x.k, P.rubros_pais[x.k]]))};
  apiladasH(G("exprov"), {anim: a, claves: cl, data: [pais, ...[...filas].sort((p, q) => q.millones_usd - p.millones_usd)
    .map(r => ({...r, ...Object.fromEntries(cl.map(x => [x.k, r[x.k] / r.millones_usd * 100]))}))]});
};

DIB.balanza = a => {
  const d = T.balanza_comercial;
  lineas(G("balanza"), {anim: a, data: d, x: "anio", y0: Math.min(0, d3.min(d, r => r.saldo)), ref: 0, vf: v => n0(v) + " M", yf: v => n0(v / 1000) + " mil",
    series: [{k: "exportaciones", lab: "Exportaciones", c: NAR}, {k: "importaciones", lab: "Importaciones", c: FRI}, {k: "saldo", lab: "Saldo", c: css("--muted"), w: 1.6}]});
};
// las importaciones por uso: los insumos en celeste, el capital en azul, el consumo en amarillo y el resto en gris
const RUB_IM = [["intermedios", "Intermedios", "#74ACDF", "--celeste-fuerte"], ["piezas", "Piezas", "#A9CBEA", "--celeste-fuerte"], ["capital", "Capital", "#1F5E97"],
  ["consumo", "Consumo", "#F6B40E", "--sol-texto"], ["vehiculos", "Autos", "#FAD375", "--sol-texto"], ["combustibles", "Combustibles", "#C3CAD2", "--muted"],
  ["resto", "Resto", "#E4E9EF", "--muted"]];
DIB.importaciones = a => areasApiladas(G("importaciones"), {anim: a, data: T.importaciones_usos, x: "anio",
  series: RUB_IM.map(([k, lab, c, ct]) => ({k, lab, c, ct})), vf: n0, yf: v => n0(v / 1000) + " mil", unidad: "millones de dólares"});
DIB.origen = a => barrasH(G("origen"), {anim: a, data: T.importaciones_origen.filter(r => r.pct >= .05).map(r => ({...r, codigo_indec: r.origen, territorio: r.origen_nombre})),
  k: "pct", vf: pct, af: v => v + "%", marcar: new Set(), l: 196, lAngosto: 136, color: d => d.origen.startsWith("resto") ? css("--faint") : css("--celeste"),
  tip: d => `<b>${d.origen_nombre}</b><br>${n0(d.millones_usd)} millones de dólares, el ${pct(d.pct)} del total` +
    (d.millones_usd_anterior > 0 ? `<br>${conSigno(d.variacion)} frente a los mismos meses del año anterior` : "")});
// socios comerciales (3 de noviembre de 2026): los países con más comercio en los últimos doce meses, por el saldo, lo exportado o lo importado.
// El saldo va en celeste a favor y en amarillo en contra: no es un cambio bueno o malo indiscutido, por eso no va en verde y rojo
MED.socios = "saldo";
DIB.socios = a => {
  const v = MED.socios || "saldo", S = SX.socios, el = G("socios"), k = {saldo: "s", exporta: "e", importa: "i"}[v];
  $t("socios").textContent = LEAD.socios(v);
  const data = S.top.map(r => ({codigo_indec: r.k, territorio: r.n, v: r[k], e: r.e, i: r.i, s: r.s}));
  const sp = T.comercio_socios.find(r => r.tipo === "sin_pais");
  if (v !== "saldo" && sp) data.push({codigo_indec: "sin_pais", territorio: "Sin país informado", v: v === "exporta" ? sp.exportaciones : sp.importaciones,
    e: sp.exportaciones, i: sp.importaciones, sinPais: true});
  barrasH(el, {anim: a, data, k: "v", vf: n0, af: x => x ? n0(x / 1000) + " mil" : "0", marcar: new Set(), l: 150, lAngosto: 118,
    color: d => d.sinPais ? css("--faint") : v === "saldo" && d.v < 0 ? css("--sol") : css("--celeste"),
    tip: d => `<b>${d.territorio}</b><br>Exportaciones: ${n0(d.e)} millones de dólares<br>Importaciones: ${n0(d.i)} millones` +
      (d.sinPais ? "<br>Sin país informado, por el secreto estadístico" : `<br>Saldo: ${saldoTx(d.s)}`)});
  el.resaltar = null;
};
// la historia desde 1986: la parte de los cuatro países con más comercio en el último año completo, en lo importado o lo exportado de cada año
MED["socios-hist"] = "importa";
DIB["socios-hist"] = conTablas("socios-hist", ["comercio_socios_historia"], a => {
  const v = MED["socios-hist"] || "importa", H = SX.socios_hist, el = G("socios-hist"), col = v === "exporta" ? "pct_exportaciones" : "pct_importaciones";
  $t("socios-hist").textContent = LEAD["socios-hist"](v);
  const ser = v === "exporta" ? H.exporta : H.importa, cods = [...ser.map(s => s.k), ...(v === "exporta" ? ["sin_pais"] : [])];
  const porAnio = d3.rollup(T.comercio_socios_historia.filter(r => cods.includes(r.codigo)), g => Object.fromEntries(g.map(r => [r.codigo, r[col]])), r => r.anio);
  const data = [...porAnio].sort((p, q) => p[0] - q[0]).map(([anio, o]) => ({anio, ...Object.fromEntries(cods.map(c => [c, o[c] ?? 0]))}));
  // los nombres al final de cada línea, en tonos que se leen sobre el blanco (ct)
  const colores = [["--celeste-fuerte"], ["--sol-fuerte", "--sol-texto"], ["--ink"], ["--muted"]];
  lineas(el, {anim: a, data, x: "anio", y0: 0, vf: pct, yf: x => n0(x) + "%",
    series: [...ser.map((s, i) => ({k: s.k, lab: s.lab, c: css(colores[i % colores.length][0]), ct: colores[i % colores.length][1]})),
      ...(v === "exporta" ? [{k: "sin_pais", lab: "Sin país informado", corto: "Sin país", c: css("--faint"), ct: "--faint-texto"}] : [])]});
});
DIB["cuenta-corriente"] = a => {
  const d = T.cuenta_corriente;
  lineas(G("cuenta-corriente"), {anim: a, data: d, x: "anio", y0: d3.min(d, r => Math.min(r.bienes, r.servicios, r.primario, r.cuenta_corriente)), ref: 0,
    vf: v => n0(v) + " M", yf: v => n0(v / 1000) + " mil",
    series: [{k: "cuenta_corriente", lab: "Cuenta corriente", corto: "Saldo total", c: css("--ink"), w: 3}, {k: "bienes", lab: "Bienes", c: NAR},
      {k: "servicios", lab: "Servicios", c: FRI}, {k: "primario", lab: "Ingreso primario", corto: "Rentas", c: css("--muted"), w: 1.8}]});
};
MED["reservas-bcra"] = "serie";
/* Reservas netas (etapa 42, pedido del autor del 12 de octubre de 2026): las brutas y las netas por mes, de dónde salen las netas en el último mes
   (una cascada: las brutas, cada deuda a un año y lo que queda) y de qué están hechas las brutas */
MED["reservas-netas"] = "serie";
DIB["reservas-netas"] = conTablas("reservas-netas", ["reservas_netas"], a => {
  const el = G("reservas-netas"), N = SX.reservas_netas, v = MED["reservas-netas"], m = mesPer(N.mes);
  const datos = () => T.reservas_netas.map(r => ({...r, t: tPer(r.mes)}));
  if (v === "cascada") {
    const otras = N.depositos_bancos != null ? N.depositos_y_deudas - N.depositos_bancos - (N.depositos_tesoro || 0) : null;
    const filas = [{k: "brutas", lab: "Reservas brutas", v: N.brutas},
      ...(otras != null ? [{k: "bancos", lab: "Dólares de los bancos en el BCRA", v: -N.depositos_bancos},
        ...(N.depositos_tesoro != null ? [{k: "tesoro", lab: "Depósitos del Tesoro", v: -N.depositos_tesoro}] : []), {k: "otras", lab: "Otras deudas a un año", v: -otras}]
        : [{k: "depositos", lab: "Depósitos y otras deudas a un año", v: -N.depositos_y_deudas}]),
      {k: "china", lab: "Canje de monedas con China", v: -N.canje_china}, {k: "pases", lab: "Pases con bancos del exterior", v: -N.pases_y_otros},
      {k: "netas", lab: "Reservas netas", v: N.netas}];
    $t("reservas-netas").textContent = `De los ${n0(N.brutas)} millones de dólares de reservas brutas de ${m}, el BCRA tenía que pagar o devolver dentro de un año ` +
      `${n0(N.depositos_y_deudas)} millones en depósitos en dólares y otras deudas` +
      (N.depositos_bancos != null ? ` (${n0(N.depositos_bancos)} de los bancos${N.depositos_tesoro != null ? ` y ${n0(N.depositos_tesoro)} del Tesoro` : ""})` : "") +
      `, ${n0(N.canje_china)} millones del canje de monedas con China y ${n0(N.pases_y_otros)} millones de pases con bancos del exterior. Quedan ${n0(N.netas)} millones.`;
    return barrasH(el, {anim: a, data: filas.map(f => ({codigo_indec: f.k, territorio: f.lab, v: f.v})), k: "v", vf: v => (v > 0 ? "" : "−") + n0(Math.abs(v)),
      af: v => n0(v / 1000) + " mil", nt: 3, marcar: new Set(), l: 250, lAngosto: 150, sinOrden: true,
      corto: d => ({bancos: "Dólares de bancos", tesoro: "Tesoro", otras: "Otras deudas", depositos: "Depósitos y deudas", china: "Canje con China", pases: "Pases"})[d.codigo_indec] || d.territorio,
      color: d => ["brutas", "netas"].includes(d.codigo_indec) ? css("--celeste-fuerte") : css("--sol"),
      tip: d => `<b>${d.territorio}</b><br>${(d.v < 0 ? "−" : "") + n0(Math.abs(d.v))} millones de dólares, ${m}`});
  }
  if (v === "composicion") {
    $t("reservas-netas").textContent = `En ${m}, de los ${n0(N.brutas)} millones de dólares de reservas brutas, ${n0(N.divisas)} eran divisas y títulos en moneda extranjera ` +
      `(entre ellas, los yuanes del canje con China), ${n0(N.oro)} eran oro${N.oro_onzas ? `, ${n2(N.oro_onzas)} millones de onzas` : ""}, y ${n0(N.deg)} derechos especiales de giro del FMI.`;
    return areasApiladas(el, {anim: a, data: datos().filter(r => r.brutas != null), x: "t", vf: n0, yf: v => n0(v / 1000) + " mil", xl: r => mesPer(r.mes), unidad: "millones de dólares",
      series: [{k: "divisas", lab: "Divisas y títulos", c: css("--celeste-fuerte")}, {k: "oro", lab: "Oro", c: css("--sol-fuerte")},
        {k: "deg", lab: "DEG", c: css("--celeste")}, {k: "otros_activos", lab: "Otros", c: GRIS}]});
  }
  $t("reservas-netas").textContent = `A fin de ${m}, el último mes de la planilla, las reservas brutas del BCRA eran ${n0(N.brutas)} millones de dólares y las netas, ${n0(N.netas)} millones, el ${pct(N.pct_netas)} de las brutas. ` +
    (N.hace_un_anio != null ? `Un año antes, las netas eran ${n0(N.hace_un_anio)} millones. ` : "") +
    (N.ult_negativa ? `Fueron negativas por última vez en ${mesPer(N.ult_negativa)}. ` : "") +
    `${N.n_sin_netas ? "En los meses con dato desde" : "Desde"} ${mesPer(N.desde)}, el valor más bajo fue de ${n0(N.min.v)} millones, en ${mesPer(N.min.mes)}, y el más alto, de ${n0(N.max.v)} millones, en ${mesPer(N.max.mes)}.`;
  lineas(el, {anim: a, data: datos(), x: "t", conNegativos: true, ref: 0, vf: v => n0(v) + " M", yf: v => n0(v / 1000) + " mil", xl: r => mesPer(r.mes), mensual: true, huecos: true,
    series: [{k: "brutas", lab: "Brutas", c: GRIS}, {k: "netas", lab: "Netas", c: css("--celeste-fuerte"), w: 2.6}]});
});

DIB["reservas-bcra"] = conTablas("reservas-bcra", ["reservas_bcra"], a => {
  const el = G("reservas-bcra"), V = SX.reservas, CORTO = {sector_publico: "Otras del sector público", efectivo_minimo: "Efectivo mínimo", organismos: "FMI y otros organismos"};
  const MI = V.meses_imp;
  $t("reservas-bcra").textContent = MED["reservas-bcra"] === "meses" && MI
    ? `Con lo importado en los doce meses anteriores, las reservas brutas de ${mesPer(MI.mes)} equivalían a ${n1(MI.v)} meses de compras al exterior, contra ${n1(MI.hace_un_anio)} un año antes. ` +
      `Desde ${mesPer(MI.desde)}, el máximo fue de ${n1(MI.max)} meses, en ${mesPer(MI.max_mes)}, y el mínimo, de ${n1(MI.min)}, en ${mesPer(MI.min_mes)}.`
    : TX["reservas-bcra"];
  if (MED["reservas-bcra"] === "meses" && MI)
    return lineas(el, {anim: a, data: T.reservas_bcra.filter(r => r.meses_importaciones != null).map(r => ({...r, t: tPer(r.mes)})), x: "t", y0: 0, ref: 3, refLab: "3 meses",
      vf: v => n1(v) + " meses", yf: n0, xl: r => mesPer(r.mes), mensual: true, series: [{k: "meses_importaciones", lab: "Meses de importaciones", corto: "Reservas", c: NAR}]});
  if (MED["reservas-bcra"] === "factores")
    return barrasH(el, {anim: a, data: V.factores.map(f => ({codigo_indec: f.k, territorio: f.lab, v: f.v})), k: "v", vf: v => (v > 0 ? "+" : "") + n0(v),
      af: v => n0(v / 1000) + " mil", marcar: new Set(), l: 236, lAngosto: 160, corto: d => CORTO[d.codigo_indec] || d.territorio,
      tip: d => `<b>${d.territorio}</b><br>${(d.v > 0 ? "+" : "") + n0(d.v)} millones de dólares en lo que va de ${V.anio}, hasta el ${fLarga(V.factores_hasta)}`});
  lineas(el, {anim: a, data: T.reservas_bcra.map(r => ({...r, t: tPer(r.mes)})), x: "t", y0: 0, vf: v => n0(v) + " M", yf: v => n0(v / 1000) + " mil",
    xl: r => mesPer(r.mes), mensual: true, series: [{k: "millones_usd", lab: "Reservas", c: NAR}]});
});
};
