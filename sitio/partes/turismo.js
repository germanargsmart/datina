window.DATINA_PARTES = window.DATINA_PARTES || {};
window.DATINA_PARTES["turismo"] = () => {
textosParte({
"receptivo-nota": `Viajes de turistas no residentes, es decir personas que viven en otro país y pasan al menos una noche en la Argentina, por todos los pasos aéreos, terrestres y fluviales. Se cuentan por el país donde viven, no por su nacionalidad: un argentino que vive afuera es no residente. Una persona que entra dos veces en el año cuenta como dos viajes. Solo se muestran años completos.${tu.provisorio ? " Los últimos meses son datos provisorios." : ""}`,
"hoteles-nota": `Encuesta de Ocupación Hotelera, que releva hoteles y parahoteles de las principales localidades turísticas agrupadas en siete regiones. No publica datos por provincia. El último mes publicado es ${tu.eoh_ultimo}, por eso el último año completo es ${tu.eoh_anio}. El INDEC informó que, al no renovarse el convenio de financiamiento con la Secretaría de Turismo y Ambiente, la encuesta se reformulará y su difusión se reprogramará. El Instituto de Estadística de la Ciudad de Buenos Aires continúa el relevamiento solo en CABA.`,
"eti-nota": `Encuesta de Turismo Internacional. Solo cubre a los turistas que dejan el país por los aeropuertos de Ezeiza y Aeroparque, así que subestima a las provincias que reciben turistas por otros pasos, como las limítrofes. Un turista que visitó varias provincias cuenta en cada una. La cantidad por habitante usa la población que proyecta el INDEC para ${R.anio_pob_ficha.turistas_extranjeros_provincias}, el mismo año. Desde 2026 el INDEC reformula esta encuesta y reprogramó su difusión porque no se renovó el convenio de financiamiento con la Secretaría de Turismo.`,
});
Object.assign(MED, {
eti: "cada_1000",
});
Object.assign(DIB, {
receptivo: a => lineas(G("receptivo"), {anim:a, data: T.turistas_no_residentes_anual, x:"anio", y0:0, vf: v => n2(v / 1e6) + " M", yf: M,
series:[{k:"turistas", lab:"Turistas", c:NAR, w:3}]}),
hoteles: a => lineas(G("hoteles"), {anim:a, data: T.viajeros_hoteles_anual, x:"anio", y0:0, vf: v => n1(v / 1e6) + " M", yf: M,
series:[{k:"residentes", lab:"Residentes", c:NAR, w:3}, {k:"no_residentes", lab:"No residentes", c:FRI, w:2.4}]}),
eti: a => MED.eti === "cada_1000"
? barrasH(G("eti"), {anim:a, data: T.turistas_extranjeros_provincias, k:"cada_1000", vf: n1, af: n0})
: barrasH(G("eti"), {anim:a, data: T.turistas_extranjeros_provincias, k:"turistas", vf: n0, af: v => n0(v / 1000) + " mil"}),
});
};
