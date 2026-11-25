// Parte de datina.js de los artículos, que piden solo sus páginas (a-coparticipacion.html...: PARTE_EN en 03, con todos los artículos de la
// plantilla). Plan técnico, fase 5 (25 de noviembre de 2026): 03_construir_sitio.py la publica en sitio/partes/articulos.js, achicada como
// datina.js, y esas páginas la piden antes de datina.js. Acá solo se anota: datina.js la corre con parte("articulos") donde estaba este código,
// así que tiene a mano todo lo que datina.js definió antes. Era un solo tramo de datina.js, que va acá entero: los artículos de cruces (ART,
// con sus cuentas, calcularArt y textoArt, y las dos formas de la nota, artNuevo y la de antes) y los de series (ART_SERIE, cada uno con su
// texto(), sus gráficos y lo que inicia, como la calculadora de la canasta), y ARTS, los dos juntos en el orden de la lista de Artículos.
// Lo que se ve de ellos fuera de sus páginas (las tarjetas de la portada, la respuesta de cada uno en Artículos y "Artículos con este dato"
// en el pie de cada ficha) lo calcula DATINA_ARMADO_ARTICULOS, al final, que scripts/texto_en_html.mjs corre en el armado y deja escrito en
// el HTML de todas las páginas. Quedan en datina.js SEC y nombreSec, que usan la lupa y las fichas en todas las páginas. 03 lee de acá el id,
// cada cuánto se actualiza y la bajada de cada artículo (para la lista de Artículos y la lupa), y qué artículos son de series y de las
// capitales, y catalogo.py, las tablas de cada uno. Lo que se declara acá adentro queda para esta parte.
window.DATINA_PARTES = window.DATINA_PARTES || {};
window.DATINA_PARTES["articulos"] = () => {
/* ---------- artículos: preguntas respondidas cruzando dos indicadores de las 24 jurisdicciones ----------
   Los números y las frases que dependen de ellos se calculan acá desde la tabla de cruces, así se actualizan solos.
   A mano van solo la pregunta (data-titulo en el marcado), el contexto y los límites propios de cada cruce, sin cifras.
   Las advertencias generales (pocos casos, correlación no es causalidad, promedios provinciales, períodos distintos,
   Spearman y Pearson que difieren) se agregan siempre que corresponden. */
// La precisión de la pobreza de cada capital, como la califica la nota del INDEC: con un coeficiente de variación de entre 16% y 25%, con
// cuidado, y de más de 25%, no confiable (etapa 27). Las capitales de cada grupo salen del resumen.
const CV_EPH = (() => {
  const r = R.capitales_eph_res, C = r.cuidado, N = r.no_confiable;
  const ini = "El INDEC publica la precisión de cada estimación de pobreza (su coeficiente de variación): pide considerar con cuidado las que tienen entre 16% y 25%, y como no confiables las que pasan de 25%.";
  if (!C.length && !N.length) return `${ini} En el ${r.semestre}, ninguna capital llega a 16%.`;
  const c = C.length ? `${C.length > 1 ? "las" : "la"} de ${lista(C)} ${C.length > 1 ? "están" : "está"} entre 16% y 25%` : "ninguna capital está entre 16% y 25%";
  const n = N.length ? `${N.length > 1 ? "las" : "la"} de ${lista(N)} ${N.length > 1 ? "pasan" : "pasa"} de 25%` : "ninguna pasa de 25%";
  return `${ini} En el ${r.semestre}, ${c}, y ${n}.`;
})();
// La unidad de los artículos de la EPH: el aglomerado, que no es el municipio del censo
const LIM_AGLO = "Cada capital es su aglomerado urbano según la Encuesta Permanente de Hogares, que en algunos casos junta dos ciudades, como Rawson con Trelew o Ushuaia con Río Grande. Es un área distinta del municipio que usan los artículos de las viviendas, que salen del censo.";
const ART = [
  // etapa 27: tres artículos de las capitales con la Encuesta Permanente de Hogares (tabla capitales_eph, por aglomerado)
  {id: "a-pobreza-desocupacion", tabla: "capitales_eph", frec: "La desocupación y el empleo se actualizan cada trimestre",
    dek: "La desocupación y la parte de la población que trabaja en cada capital de provincia, en promedio de los últimos cuatro trimestres, frente a la parte de sus habitantes bajo la línea de pobreza, según la Encuesta Permanente de Hogares del INDEC.",
    contexto: "La desocupación cuenta a quienes buscan trabajo y no lo consiguen: quien dejó de buscar, o no busca, no figura. La tasa de empleo mira otra cosa, la parte de toda la población que trabaja. La pobreza mira si los ingresos del hogar alcanzan para la canasta básica total. Este artículo pone la pobreza al lado de los dos datos del trabajo, capital por capital, con la Encuesta Permanente de Hogares (EPH) del INDEC.",
    // etapa 5: junta los dos artículos de las capitales sobre el trabajo y la pobreza (hasta entonces, a-pobreza-desocupacion y a-empleo-pobreza)
    nuevo: true,
    medimos: ["La Encuesta Permanente de Hogares (EPH) del INDEC pregunta cada trimestre a una muestra de hogares de 31 aglomerados urbanos. Las capitales " +
      "son 24 de esos aglomerados."],
    preg: {desocupacion: "¿Cuánta desocupación hay en cada capital?", pobreza: "¿Qué parte de la población es pobre en cada capital?",
      empleo: "¿Qué parte de la población trabaja en cada capital?"},
    txtVar: {desocupacion: "Una desocupación baja puede deberse a que hay trabajo o a que mucha gente dejó de buscarlo: por eso se mira junto con el empleo.",
      empleo: "La tasa de empleo depende también de la edad: donde viven más chicos y más personas mayores, trabaja una parte menor."},
    notas: ["Desocupación y empleo: EPH, INDEC, promedio de los últimos cuatro trimestres publicados de cada aglomerado.",
      "Pobreza: EPH, INDEC, último semestre publicado, % de las personas de cada aglomerado."],
    partes: [
      {x: "desocupacion", y: "pobreza", espera: 1, preg: "¿Hay más pobreza en las capitales con más desocupación?", lx: "desocupación", ly: "pobreza", ux: "% de quienes trabajan o buscan trabajo", uy: "% de las personas",
        limites: ["Una persona puede tener trabajo y ser pobre: la desocupación no dice cuánto se gana."]},
      {x: "empleo", y: "pobreza", espera: -1, desde: "menos", preg: "¿Y en las capitales donde trabaja una parte menor de la población?", lx: "empleo", ly: "pobreza", ux: "% de la población", uy: "% de las personas",
        limites: ["La tasa de empleo se calcula sobre toda la población, con los chicos: donde hay más chicos, trabaja una parte menor, y la pobreza es más alta entre los chicos.",
          "Tener trabajo no dice cuánto se gana ni si el trabajo está registrado."]}],
    limites: [LIM_AGLO,
      "La EPH es una encuesta por muestra, y en los aglomerados chicos la tasa de un trimestre es poco precisa: por eso se usa el promedio de cuatro.",
      CV_EPH]},
  {id: "a-alquiler-pobreza", tabla: "capitales_eph", desde: "menos", x: "pobreza", y: "alquila", espera: -1, frec: "La parte de los hogares que alquila se actualiza cada trimestre",
    lx: "pobreza", ly: "hogares que alquilan", ux: "% de las personas", uy: "% de los hogares",
    dek: "La parte de los habitantes de cada capital de provincia bajo la línea de pobreza, frente a la parte de sus hogares que alquila la vivienda donde vive, según la Encuesta Permanente de Hogares del INDEC.",
    contexto: "Quien no es dueño de la vivienda donde vive puede alquilarla o vivir en una prestada, entre otras situaciones. Alquilar puede ser una elección, para mudarse con más facilidad, o la única opción para quien no tiene ahorros ni acceso a un crédito hipotecario: por eso el alquiler, solo, no dice si un hogar está mejor o peor. Este cruce compara, capital por capital, la parte de las personas bajo la línea de pobreza con la parte de los hogares que alquila, según la Encuesta Permanente de Hogares (EPH) del INDEC. Las dos cosas se miden en los mismos hogares.",
    nuevo: true,
    medimos: ["La Encuesta Permanente de Hogares (EPH) del INDEC pregunta cada trimestre a una muestra de hogares de 31 aglomerados urbanos por su trabajo " +
      "y sus ingresos. Las capitales de provincia son 24 de esos aglomerados. El dato de cada una es una estimación con margen de error, más grande " +
      "cuanto más chica es la ciudad y su muestra.",
      "La pobreza es la parte de las personas que viven en hogares cuyos ingresos no alcanzan para la canasta básica total de su región. Los hogares " +
      "que alquilan son los que pagan un alquiler por la vivienda donde viven, sin contar a quienes viven en una vivienda prestada o cedida. Un hogar es " +
      "el grupo de personas que vive bajo un mismo techo y comparte los gastos de comida."],
    preg: {pobreza: "¿Qué parte de la población es pobre en cada capital?", alquila: "¿Qué parte de los hogares alquila en cada capital?"},
    txtVar: {pobreza: "La línea de pobreza de cada capital es la canasta de su región, así que una misma cantidad de pesos puede alcanzar en una capital y no en otra.",
      alquila: "Alquilar es más común en las ciudades grandes, donde las viviendas cuestan más, y en las que reciben estudiantes o trabajadores de otros lugares."},
    notas: ["Pobreza: EPH, INDEC, último semestre publicado, % de las personas de cada aglomerado.",
      "Hogares que alquilan: cálculo propio con las bases de microdatos de la EPH de los últimos cuatro trimestres publicados, sobre el total de hogares de cada aglomerado."],
    // con la pobreza en el eje del primer dato: si las capitales con menos pobreza alquilan más, una lectura posible, sin confirmarla
    txt: c => c.rs <= -.2 ? "Una lectura posible es que alquilar sea más común entre los hogares de ingresos medios de las ciudades grandes, y que los " +
      "hogares pobres vivan más en viviendas propias precarias, prestadas o en barrios populares. Los datos por capital no alcanzan para confirmarlo." : "",
    limites: [LIM_AGLO,
      "La parte de los hogares que alquila es un cálculo propio con las bases de la EPH de los últimos cuatro trimestres publicados. El censo de 2022, que cuenta todo el municipio, da cifras parecidas pero no iguales.",
      "La EPH pregunta si el hogar alquila la vivienda, no cuánto paga ni desde cuándo.",
      CV_EPH, "Alquilar puede ir también con otras cosas que este cruce no mide, como el tamaño de la ciudad o la llegada de personas de otras provincias."]},
  // etapa 26: artículos de las 24 capitales de provincia, con la tabla de las capitales (Censo 2022 por municipio). Van antes que los de
  // las provincias porque son los más nuevos
  // etapa 5: el eje pasa de las viviendas por habitante (casi la inversa del tamaño del hogar, auditoría de los artículos) a los departamentos
  {id: "a-viviendas-alquiler", tabla: "capitales", x: "en_departamento", y: "alquila", espera: 1, frec: "Se actualiza con cada censo",
    lx: "departamentos", ly: "hogares que alquilan", ux: "% de las viviendas particulares", uy: "% de los hogares",
    dek: "La parte de las viviendas de cada capital de provincia que son departamentos, frente a la parte de sus hogares que alquila la vivienda donde vive, según el último censo.",
    contexto: "Un hogar que no es dueño de su vivienda puede alquilarla, y en las ciudades se alquilan sobre todo departamentos. Las ciudades crecen hacia arriba o hacia los costados: con edificios en el centro o con barrios de casas en las afueras, y cada forma cambia cuánto cuesta construir, cuánta gente entra en cada cuadra y quién puede comprar. Este cruce compara, capital por capital, qué parte de las viviendas son departamentos con qué parte de los hogares alquila, según el último censo.",
    nuevo: true,
    medimos: ["El censo cuenta todas las viviendas y todos los hogares de cada municipio, sin muestra: el dato de cada capital no tiene el margen de error " +
      "de una encuesta. La desventaja es que se hace cada diez años o más: conviene mirarlo junto con datos más recientes, como los de la Encuesta " +
      "Permanente de Hogares. El de 2022 fue el primero que se pudo responder también por internet.",
      "Las viviendas en departamento son las que están en un edificio con varias unidades. Los hogares que alquilan son los que pagan un alquiler " +
      "por la vivienda donde viven. Un hogar es el grupo de personas que vive bajo un mismo techo y comparte los gastos de comida."],
    preg: {en_departamento: "¿Qué parte de las viviendas son departamentos en cada capital?", alquila: "¿Qué parte de los hogares alquila en cada capital?"},
    txtVar: {en_departamento: "Los departamentos se concentran en las ciudades grandes y densas, donde el suelo es caro y se construye en altura. En las " +
      "capitales chicas predominan las casas: en varias, menos de una vivienda de cada siete es un departamento. Un departamento puede estar en un " +
      "edificio de dos plantas o en una torre: el censo no distingue la altura.",
      alquila: w => "Alquilar es más común donde hay más hogares chicos, estudiantes y personas que llegan de otros lugares, y donde comprar una vivienda cuesta más." +
        (w.F.filter(f => f.alquila > 100 / 3).length > 1 ? ` En ${w.F.filter(f => f.alquila > 100 / 3).length} capitales, más de un tercio de los hogares alquila.` : "")},
    notas: ["Departamentos y alquiler: INDEC, Censo 2022, por municipio. En CABA, sus 15 comunas. El municipio de cada capital puede ser más chico que la ciudad que se ve en un mapa.",
      "Viviendas en departamento: viviendas particulares de tipo departamento sobre el total de viviendas particulares habitadas. Hogares que alquilan: " +
      "hogares que declaran alquilar la vivienda donde viven, sobre el total de hogares."],
    txt: c => c.rs >= .4 ? "Que vayan juntos tiene una explicación sencilla: un departamento suele ser más fácil de alquilar que una casa, y muchos se " +
      "construyen para eso. Pero también pesan el tamaño de la ciudad, el precio de las viviendas y la gente que llega de otros lugares, que este cruce no separa." : "",
    limites: ["Los departamentos se concentran en las ciudades más grandes y más densas, donde también hay más hogares chicos, más estudiantes y más personas que llegan de otros lugares: este cruce no separa esas cosas.",
      "El censo pregunta si el hogar alquila la vivienda, no cuánto paga ni desde cuándo.",
      "El alquiler se cuenta entre los hogares: las viviendas vacías y las de uso temporal, como las de veraneo, no entran en el cálculo aunque se alquilen.",
      "Cada capital es su municipio, y CABA, sus 15 comunas. En Mendoza y San Juan el municipio es solo el centro de una ciudad mucho más grande, y el de San Miguel de Tucumán incluye una parte del departamento de Lules.",
      "No hay una estadística oficial de precios de venta o de alquiler de viviendas que permita comparar las 24 capitales. Por eso este cruce no dice si alquilar cuesta más o menos donde hay más departamentos."]},
  {id: "a-atn-presupuesto", x: "atn_hab", y: "apoyo_presupuesto", espera: 1, frec: "Se actualiza cada año",
    lx: "ATN por habitante", ly: "apoyo al presupuesto", uy: "% de los votos",
    // descontada la inflación y en promedio de todos los años: sin eso, los pesos no se pueden leer (auditoría de los artículos)
    ux: `pesos de ${R.transferencias.ult} por habitante por año`,
    dek: "Cuánto recibió cada provincia por habitante en Aportes del Tesoro Nacional, frente a qué parte de los votos de sus legisladores de fuera del bloque oficialista fue a favor del presupuesto nacional.",
    contexto: "Los Aportes del Tesoro Nacional (ATN) son un fondo para atender emergencias y desequilibrios financieros de las provincias. El presupuesto es la ley que fija cada año los gastos y los recursos de la administración nacional. Este cruce compara, provincia por provincia, cuánto recibió cada una en ATN por habitante con cuánto votaron a favor del presupuesto sus legisladores de fuera del bloque oficialista. Si las dos cosas van juntas, hay varias lecturas posibles: que los ATN se repartan según el apoyo de los legisladores, que los legisladores voten según los ATN que recibe su provincia o que las dos cosas dependan de otra, como el tamaño de cada provincia o la relación de su gobernador con el gobierno nacional.",
    nuevo: true,
    medimos: ["Los ATN se forman con una parte de los impuestos que se coparticipan y los asigna el Ministerio del Interior, sin una regla fija.",
      "El apoyo al presupuesto suma los votos de los diputados y senadores de cada provincia que no son del bloque oficialista, en la votación en " +
      "general de cada ley de presupuesto: es la parte de esos votos que fue a favor.",
      `Como los ATN cambian mucho de un año a otro, para cada provincia se toma el promedio por año de ${R.transferencias.desde} a ${R.transferencias.ult}, en pesos de ${R.transferencias.ult}.`],
    preg: {atn_hab: "¿Cuánto recibió cada provincia en ATN por habitante?",
      apoyo_presupuesto: "¿Cuánto votaron a favor del presupuesto los legisladores de fuera del oficialismo?"},
    txtVar: {atn_hab: "Un mismo monto rinde más por habitante donde vive menos gente: por eso las provincias chicas suelen aparecer arriba.",
      apoyo_presupuesto: "Un apoyo alto puede venir de legisladores aliados del gobierno de turno, de acuerdos de cada año o de la relación del gobernador con la Nación."},
    serie: {atn_hab: {tipo: "serie", id: "atn_hab", preg: "¿Cómo cambiaron los ATN con los años?", dato: "Lo recibido por habitante",
      unidad: "pesos por habitante, descontada la inflación", u: "pesos por habitante"}},
    notas: ["ATN: Presupuesto Abierto, Secretaría de Hacienda, crédito devengado por provincia de destino, descontada la inflación con el deflactor del PBI.",
      "Votaciones: las votaciones en general de las leyes de presupuesto en las dos cámaras, con el bloque de cada legislador en ese momento."],
    limites: [
      "Las provincias con menos habitantes tienen más legisladores por habitante, por cómo se reparten las bancas, y un mismo monto de ATN da más por habitante donde hay menos gente. Este cruce no descuenta el tamaño de cada provincia.", "Son pocas personas que votan muchas veces, y las ausencias cuentan como votos que no fueron a favor.",
      "El bloque oficialista es el bloque más numeroso del espacio del presidente. Los legisladores aliados que están en otros bloques cuentan como de fuera, así que suman más apoyo las provincias con legisladores que suelen acompañar al gobierno de turno.",
      ]},
  {id: "a-exportaciones-empleo", x: "exportaciones", y: "empleo_privado", espera: 1, frec: "Se actualiza cada año",
    lx: "exportaciones por habitante", ly: "empleo privado registrado", ux: "dólares por habitante", uy: "asalariados cada 100 habitantes",
    dek: "Lo que cada provincia exporta en bienes por habitante, frente a cuántos asalariados privados registrados tiene cada 100 habitantes.",
    contexto: "Exportar trae dólares, pero no todas las actividades necesitan la misma cantidad de trabajadores para producir lo mismo. La extracción de " +
      "petróleo o de minerales mueve mucho dinero con pocos empleados directos, mientras que la industria, el comercio y los servicios, que venden " +
      "sobre todo dentro del país, emplean a mucha más gente. Este cruce pone un dato al lado del otro, provincia por provincia, para ver si las " +
      "que más venden al exterior por habitante son también las que tienen más trabajo registrado en empresas privadas.",
    nuevo: true,
    medimos: ["Las exportaciones de cada provincia son las de bienes, según la provincia donde se produjo la mercadería, divididas por su población.",
      "El empleo privado registrado son los asalariados de empresas privadas declarados en el Sistema Integrado Previsional Argentino (SIPA), cada 100 " +
      "habitantes. No cuenta a quienes trabajan por su cuenta ni a los que no están registrados."],
    preg: {exportaciones: "¿Cuánto exporta cada provincia por habitante?", empleo_privado: "¿Cuánto empleo privado registrado hay en cada provincia?"},
    txtVar: {exportaciones: w => "Las provincias con petróleo, minería o granos exportan mucho por habitante, sobre todo si tienen poca población. " +
        `${w.alto.territorio} exporta por habitante unas ${n0(w.alto.exportaciones / w.med)} veces lo que la jurisdicción del medio.`,
      empleo_privado: w => {
        const s = w.F.filter(f => codA(f) !== "02").sort((q, r) => r.empleo_privado - q.empleo_privado)[0];
        return "CABA aparece muy alta porque muchas empresas declaran allí a trabajadores que hacen su tarea en otras provincias." +
          (codA(w.alto) === "02" ? ` Sin CABA, el valor más alto es el de ${s.territorio}, con ${w.v(s)}.` : "");
      }},
    serie: {exportaciones: {tipo: "serie", id: "exportaciones", preg: "¿Cómo cambiaron las exportaciones con los años?", dato: "Lo exportado por habitante",
        unidad: "dólares de cada año por habitante", u: "dólares por habitante",
        txt: "Son dólares de cada año, sin descontar la inflación de los Estados Unidos, así que una parte de la suba viene de ahí. Los saltos de un " +
          "año a otro siguen sobre todo a las cosechas y a los precios internacionales de los granos, del petróleo y de los minerales."},
      empleo_privado: {tipo: "serie", id: "empleo_privado", preg: "¿Y el empleo privado registrado?", dato: "El empleo privado registrado",
        u: "asalariados cada 100 habitantes", txt: r => r.m1 < r.m0 ? "Donde bajó, la cantidad de asalariados privados registrados creció " +
          "menos que la población, o se redujo." : ""}},
    txt: c => {
      const t3 = [...c.F].sort((q, r) => r.exportaciones - q.exportaciones).slice(0, 3);
      return `Las tres que más exportan por habitante, ${listaY(t3.map(f => f.territorio))}, están en los puestos ${listaY(t3.map(f => c.py.get(f) + ".º"))} ` +
        `de las ${c.n} en empleo privado registrado.`;
    },
    notas: ["Exportaciones: INDEC, origen provincial de las exportaciones, dólares de cada año por habitante.",
      "Empleo privado: Secretaría de Trabajo, SIPA, asalariados registrados del sector privado cada 100 habitantes."],
    limites: ["Las exportaciones son solo de bienes: no cuentan los servicios, como el software, los servicios profesionales o el turismo.", "El Sistema Integrado Previsional Argentino (SIPA) asigna cada empleo a la provincia donde está inscripto el empleador. Por eso CABA aparece muy alta, aunque parte de esos trabajos se hagan en otras provincias.",
      "Las exportaciones por habitante dependen mucho de la población: una provincia con poca gente y un gran yacimiento aparece muy arriba aunque " +
      "exporte menos en total que una provincia grande."]},
  {id: "a-cloacas-mortalidad", desde: "menos", x: "cloaca", y: "mortalidad_infantil", espera: -1, frec: "Se actualiza cada año",
    lx: "hogares con cloacas", ly: "mortalidad infantil", ux: "% de los hogares", uy: "muertes cada 1.000 nacidos vivos",
    dek: "La parte de los hogares con desagüe a la red cloacal según el último censo, frente a las muertes de bebés menores de un año cada 1.000 nacidos vivos.",
    contexto: "La red cloacal se lleva las aguas servidas de la vivienda y evita que contaminen el agua y el suelo cerca de donde vive la familia. " +
      "La mortalidad infantil, las muertes de bebés antes de cumplir un año, se usa en todo el mundo como un indicador de las condiciones de vida y " +
      "de salud de una población. Este cruce compara la parte de los hogares conectados a la red cloacal en cada provincia con su tasa de mortalidad infantil. Sirve para ver una desigualdad entre provincias, no para medir el efecto de las cloacas en la salud de los bebés.",
    nuevo: true,
    medimos: ["Las cloacas son la parte de los hogares con desagüe a la red cloacal, según el censo, que cuenta todos los hogares.",
      "La mortalidad infantil cuenta las muertes de bebés antes de cumplir un año cada 1.000 nacidos vivos, con las estadísticas vitales del " +
      "Ministerio de Salud."],
    preg: {cloaca: "¿Qué parte de los hogares tiene cloacas en cada provincia?", mortalidad_infantil: "¿Cuántos bebés mueren antes del año en cada provincia?"},
    txtVar: {cloaca: w => { const k = w.F.filter(f => f.cloaca < 50).length;
        return "Llevar cloacas a una ciudad dispersa o a las zonas rurales cuesta más que a una ciudad densa, y muchos hogares tienen pozo o cámara séptica." +
          (k ? ` En ${k} de las ${w.F.length} jurisdicciones, menos de la mitad de los hogares tiene cloacas.` : ""); },
      mortalidad_infantil: "En las provincias con pocos nacimientos, unas pocas muertes cambian mucho la tasa: por eso se usa un promedio de tres años. " +
        "La mayor parte de esas muertes ocurre en el primer mes de vida."},
    serie: {cloaca: {tipo: "pesas", filas: () => T.censos_provincias.filter(r => r.indicador === "cloaca").map(r => ({codigo_indec: r.codigo_indec, territorio: r.territorio, a: r.valor_2010, b: r.valor_2022})), la: 2010, lb: 2022, mejor: "sube", preg: "¿Cuánto cambió entre los dos últimos censos?",
        dato: "La parte de hogares con cloacas", txt: "Entre dos censos pasan doce años: las obras de cloacas tardan, y en ese tiempo también se suman " +
          "hogares nuevos que hay que conectar."},
      mortalidad_infantil: {tipo: "serie", id: "mortalidad_infantil", baja: true, preg: "¿Cómo cambió la mortalidad infantil con los años?",
        dato: "La mortalidad infantil", unidad: "muertes de menores de un año cada 1.000 nacidos vivos, de cada año", u: "cada 1.000 nacidos vivos",
        txt: "Es la tasa de cada año, no el promedio de tres años que usa el cruce, y por eso salta más en las provincias con pocos nacimientos."}},
    notas: ["Cloacas: INDEC, Censos 2010 y 2022, % de los hogares.", "Mortalidad infantil: DEIS, Ministerio de Salud, estadísticas vitales."],
    limites: ["Muchas muertes de bebés se deben a afecciones perinatales, como la prematurez, o a malformaciones congénitas. Las causas que suelen estar más ligadas a las condiciones de vida, como las enfermedades infecciosas y respiratorias, son solo una parte.", "La mortalidad infantil es un promedio de tres años, porque en las provincias con pocos nacimientos la tasa de un solo año salta mucho.",
      "La mortalidad infantil depende también de la atención durante el embarazo y el parto, de los ingresos de las familias y de su cobertura de salud, que este cruce no mide. Las provincias con menos cloacas suelen tener también más pobreza y menos cobertura de salud: el cruce no separa una cosa de la otra.",
      "El censo mide la conexión de la vivienda a la red, no si el agua que usa el hogar es segura: el agua de red es otro dato del mismo censo."]},
  {id: "a-cobertura-esperanza", frec: "Se actualiza cada año",
    dek: "La parte de la población sin obra social ni prepaga de cada provincia, según el último censo, frente a su esperanza de vida al nacer y a la parte de sus nacimientos que son de madres menores de 20 años.",
    contexto: "En la Argentina, la obra social llega sobre todo con el empleo registrado. Por eso la falta de obra social o prepaga se usa acá como una marca de las condiciones económicas de cada provincia, no como una medida del acceso a la salud: el hospital público atiende a todas las personas. Este artículo la compara con dos datos: la esperanza de vida al nacer, que resume las condiciones de mortalidad, y la parte de los nacimientos que son de madres adolescentes.",
    nuevo: true,
    medimos: ["Sin obra social ni prepaga son las personas que no tienen obra social, prepaga ni plan estatal de salud, según el censo.",
      "La esperanza de vida al nacer es cuántos años viviría en promedio un bebé si las tasas de mortalidad de cada edad se mantuvieran como hoy. " +
      "La maternidad adolescente es la parte de los nacimientos cuya madre tenía menos de 20 años."],
    preg: {sin_cobertura: "¿Qué parte de la población no tiene obra social ni prepaga?", esperanza_vida: "¿Cuántos años se espera que viva un bebé en cada provincia?",
      madres_adolescentes: "¿Qué parte de los nacimientos son de madres adolescentes?"},
    txtVar: {sin_cobertura: "Donde hay más empleo registrado, hay más obra social: la falta de cobertura sigue a la informalidad del trabajo.",
      esperanza_vida: "Las mujeres viven en promedio más que los varones en todas las jurisdicciones: el dato junta a los dos.",
      madres_adolescentes: "Es una proporción: si las mujeres adultas tienen menos hijos, la parte de las adolescentes sube aunque sus nacimientos no cambien."},
    serie: {sin_cobertura: {tipo: "pesas", filas: () => T.censos_provincias.filter(r => r.indicador === "sin_cobertura").map(r => ({codigo_indec: r.codigo_indec, territorio: r.territorio, a: r.valor_2010, b: r.valor_2022})), la: 2010, lb: 2022, mejor: "baja", baja: true,
        preg: "¿Cuánto cambió entre los dos últimos censos?", dato: "La parte sin cobertura"},
      madres_adolescentes: {tipo: "pesas", filas: () => T.madres_adolescentes_provincias.map(r => ({codigo_indec: r.codigo_indec, territorio: r.territorio,
        a: r[ADO_INI], b: r[ADO_ULT]})), la: nac.anio_ini, lb: nac.anio_ult, mejor: "baja", baja: true, preg: "¿Cuánto cambió la maternidad adolescente?",
        dato: "La maternidad adolescente"}},
    notas: ["Cobertura: INDEC, Censos 2010 y 2022, % de las personas.", "Esperanza de vida: INDEC, tablas de mortalidad por provincia.",
      "Maternidad adolescente: DEIS, Ministerio de Salud, % de los nacidos vivos."],
    // etapa 5: junta los dos artículos de la cobertura (hasta entonces, a-cobertura-esperanza y a-cobertura-adolescentes)
    partes: [
      {x: "sin_cobertura", y: "esperanza_vida", espera: -1, yAuto: true, preg: "¿Se vive menos donde menos gente tiene obra social o prepaga?", lx: "personas sin obra social ni prepaga", ly: "esperanza de vida", ux: "% de las personas", uy: "años",
        limites: ["La esperanza de vida resume la mortalidad de todas las edades de un año, y cambia con hechos de ese año, como una epidemia: conviene mirar de qué año es el dato antes de compararlo con otros períodos."]},
      {x: "sin_cobertura", y: "madres_adolescentes", espera: 1, preg: "¿Y hay más madres adolescentes?", lx: "personas sin obra social ni prepaga", ly: "maternidad adolescente", ux: "% de las personas", uy: "% de los nacimientos",
        limites: ["La maternidad adolescente se mide como la parte de los nacimientos que son de madres menores de 20 años, no como los nacimientos cada 1.000 adolescentes: depende también de cuántos hijos tienen las mujeres adultas de cada provincia.",
          "La ficha de maternidad adolescente compara el mismo dato con otros indicadores del censo, como las necesidades básicas insatisfechas y la parte de los adultos con el secundario completo."]}]},
  {id: "a-internet-aprender", x: "internet", y: "aprender_mat", espera: 1, frec: "Se actualiza con cada Aprender",
    lx: "hogares con internet", ly: "chicos con nivel satisfactorio o avanzado en matemática", ux: "% de los hogares", uy: "% de los chicos de 6° grado",
    dek: "La parte de los hogares con internet según el último censo, frente a la parte de los chicos de 6° grado con nivel satisfactorio o avanzado en matemática en la evaluación Aprender.",
    contexto: "Desde la pandemia, cuando las clases pasaron a hacerse a distancia, la conexión del hogar se volvió parte de la escuela: para buscar " +
      "información, hacer las tareas o seguir una clase. Pero internet en el hogar suele acompañar a otras ventajas, como más ingresos o más años de " +
      "estudio de los adultos. Por eso este cruce sirve para ver una desigualdad entre provincias, no para medir el efecto de internet en el " +
      "aprendizaje. Primero se mira cada dato por separado y después, los dos juntos.",
    nuevo: true,
    medimos: ["Los hogares con internet son los que tienen conexión a internet en la vivienda, fija o por el celular, según el censo.",
      "Aprender es la evaluación nacional de los aprendizajes. En matemática, mide qué parte de los chicos de 6° grado llega a un nivel " +
      "satisfactorio o avanzado, los dos más altos de cuatro."],
    preg: {internet: "¿Qué parte de los hogares tiene internet en cada provincia?", aprender_mat: "¿Qué parte de los chicos aprende matemática en cada provincia?"},
    txtVar: {internet: w => "La conexión llega antes a las ciudades que a los pueblos y al campo: las provincias más rurales quedan abajo. " +
        `Entre ${w.alto.territorio} y ${w.bajo.territorio} hay ${n0(w.alto.internet - w.bajo.internet)} puntos de diferencia. La conexión fija es más ` +
        "común en las ciudades grandes, adonde llegan las redes de cable y de fibra.",
      aprender_mat: () => "Aprender evalúa a los chicos de escuelas estatales y privadas, con la misma prueba en todo el país. " + aprPais()},
    serie: {internet: {tipo: "serie", id: "internet_fijo", preg: "¿Y cómo creció la conexión con los años?", dato: "La cantidad de accesos fijos",
      pre: "", dec: 1, u: "accesos fijos cada 100 hogares", unidad: "accesos fijos a internet cada 100 hogares, promedio de cada año",
      txt: "El censo se hace cada diez años. Para ver la evolución, el ENACOM cuenta los accesos fijos a internet cada 100 hogares: no es la misma " +
        "medida que la del censo, porque no cuenta la conexión por el celular y un hogar puede tener más de un acceso."}},
    txt: c => { const r = aprEstatal(c, "internet");
      return r == null ? "" : `Si se miran solo los resultados de las escuelas estatales, la correlación es de ${rTxt(r)}, una relación ${fuerza(r)}.`; },
    notas: ["Internet: INDEC, Censo 2022, % de los hogares. Accesos fijos: ENACOM, promedio de los cuatro trimestres de cada año.", "Aprender: cálculo propio de Datina sobre la base agregada de la evaluación, % de los chicos de 6° grado."],
    limites: ["Tener conexión no dice cómo se usa ni si los chicos tienen una computadora: el censo pregunta solo por la conexión del hogar.",
      "Aprender mide a los chicos de 6° grado de un solo año: una camada puede salir mejor o peor por razones propias de ese año, como las clases perdidas.",
      "Los chicos que van a escuelas privadas suelen vivir en hogares con más ingresos, que también tienen más conexión: parte de la relación puede venir de ahí.",
      "Los resultados de Aprender son un cálculo propio de Datina sobre la base agregada y difieren levemente de los del informe oficial."]},
  // etapa 24: la inversión por alumno (Coordinación General de Estudio de Costos del Sistema Educativo (CGECSE)) frente a Aprender
  {id: "a-inversion-aprender", x: "gasto_alumno", y: "aprender_mat", espera: 1, frec: "Se actualiza cada año",
    lx: "inversión en educación por alumno", ly: "chicos con nivel satisfactorio o avanzado en matemática", ux: "pesos por alumno de escuela estatal por año", uy: "% de los chicos de 6° grado",
    dek: "Lo que invierte el Estado por cada alumno de las escuelas estatales de cada provincia, frente a la parte de los chicos de 6° grado con nivel satisfactorio o avanzado en matemática en la evaluación Aprender.",
    contexto: "La mayor parte de lo que se invierte en educación son los salarios docentes, y sostener escuelas cuesta distinto en cada territorio. Este cruce mira si las provincias que más invierten por alumno son también las que tienen mejores resultados en matemática.",
    nuevo: true,
    medimos: ["La inversión por alumno es lo que gasta en educación cada provincia, con los fondos de la Nación, por cada alumno de sus escuelas estatales.",
      "Aprender es la evaluación nacional de los aprendizajes. En matemática, mide qué parte de los chicos de 6° grado llega a un nivel " +
      "satisfactorio o avanzado, los dos más altos de cuatro."],
    preg: {gasto_alumno: "¿Cuánto invierte cada provincia por alumno?", aprender_mat: "¿Qué parte de los chicos aprende matemática en cada provincia?"},
    txtVar: {gasto_alumno: "Las provincias con escuelas chicas y dispersas, o con salarios docentes más altos, gastan más por alumno.",
      aprender_mat: () => "Aprender evalúa a los chicos de escuelas estatales y privadas, con la misma prueba en todo el país. " + aprPais()},
    serie: {gasto_alumno: {tipo: "serie", tabla: "inversion_educativa_serie", col: "por_alumno_real", clave: "gasto_alumno",
      preg: "¿Cómo cambió la inversión por alumno con los años?", dato: "La inversión por alumno", unidad: "pesos por alumno, descontada la inflación",
      u: "pesos por alumno", txt: "La inversión sigue sobre todo a los salarios docentes, que son la mayor parte del gasto: cuando los salarios " +
        "pierden frente a la inflación, la inversión por alumno baja."}},
    txt: c => { const r = aprEstatal(c, "gasto_alumno");
      return r == null ? "" : "Como la inversión cuenta solo a las escuelas estatales, conviene mirar también sus resultados. Si se compara con la " +
        `parte de los chicos de escuelas estatales que llega al nivel satisfactorio o avanzado, la correlación es de ${rTxt(r)}, una relación ${fuerza(r)}.`; },
    notas: ["Inversión: Coordinación General de Estudio de Costos del Sistema Educativo (CGECSE), gasto educativo por alumno de escuela estatal.",
      "Aprender: cálculo propio de Datina sobre la base agregada de la evaluación, % de los chicos de 6° grado."],
    limites: ["La inversión está en pesos del año del dato, sin ajustar por lo que cuesta vivir en cada provincia ni por el tamaño de las escuelas: donde hay pocos alumnos por escuela o los salarios son más altos, cada alumno cuesta más.",
      "Aprender evalúa a los alumnos de 6° grado de las escuelas estatales y privadas, y la inversión cuenta solo a los de las escuelas estatales.",
      "La inversión no cuenta lo que pagan las familias en las escuelas privadas, que también entran en Aprender.",
      "Los resultados de Aprender son un cálculo propio de Datina sobre la base agregada y difieren levemente de los del informe oficial."]},
];
const META_CX = Object.fromEntries(R.cruces.map(m => [m.id, m]));
// Aprender por tipo de escuela, para los artículos que lo cruzan (tanda 5): el país, y la correlación de un dato con los resultados de las escuelas
// estatales de cada jurisdicción
const codA = f => String(f.codigo_indec).padStart(2, "0");
const aprPais = () => {
  const d = (T.aprender_diagnostico || []).find(r => codA(r) === "00");
  return d ? `En el país, ${n1(d.mat_logra_privado)}% de los chicos de escuelas privadas llega al nivel satisfactorio o avanzado, frente a ${n1(d.mat_logra_estatal)}% en las ` +
    `estatales. En las escuelas rurales, ${n1(d.mat_logra_rural)}%.` : "";
};
const aprEstatal = (c, x) => {
  const D = new Map((T.aprender_diagnostico || []).map(r => [codA(r), r.mat_logra_estatal])), F = c.F.filter(f => D.get(codA(f)) != null);
  return F.length > 20 ? CX.spearman(F.map(f => f[x]), F.map(f => D.get(codA(f)))) : null;
};
// cada artículo de cruces usa la tabla de las provincias o, con tabla: "capitales", la de las 24 capitales (etapa 26), con su metadato y su
// forma de nombrar los casos
const tablaArt = a => a.tabla || "cruces_provincias";
const META_TAB = {cruces_provincias: META_CX, capitales: Object.fromEntries(R.capitales.map(m => [m.id, m])),
  capitales_eph: Object.fromEntries(R.capitales_eph.map(m => [m.id, m]))};
const CASOS_ART = {
  cruces_provincias: {s: "jurisdicción", pl: "jurisdicciones", prom: "Son promedios de cada jurisdicción: no dicen qué pasa con cada persona ni con los municipios de una misma provincia."},
  capitales: {s: "capital", pl: "capitales", prom: "Son promedios de cada ciudad: no dicen qué pasa con cada persona ni con los barrios de una misma ciudad."},
  capitales_eph: {s: "capital", pl: "capitales", prom: "Son promedios de cada aglomerado: no dicen qué pasa con cada persona ni con los barrios de una misma ciudad."}};
// "del primer semestre de 2026", "de los cuatro trimestres hasta...", "de 2022": el período detrás de "es de" (etapa 27)
const delPer = p => /^(primer|segundo|tercer|cuarto) /.test(p) ? "del " + p : "de " + p;
// "−0,53" con el signo menos tipográfico, que los lectores de pantalla leen "menos" (hasta la etapa 5 iba escrito en letras)
const rTxt = r => n2(r).replace(/[-−]/, "−");
// la primera letra en minúscula, salvo que el nombre empiece con un nombre propio (antes se bajaba todo: "voto a milei", etapa 24)
const minusc = t => /^(Aprender|PISA|ATN|Asignación Universal)/.test(t) ? t : t.charAt(0).toLowerCase() + t.slice(1);
const mayusc = t => t.charAt(0).toUpperCase() + t.slice(1);
// "% de los hogares" se pega al número (45,2%) y el resto de la unidad va después
const partesU = u => u.startsWith("%") ? ["%", u.replace(/^%\s*/, "")] : ["", u];
// El cruce de un artículo. Plantilla nueva (plan de mejora, etapa 5, 28 de octubre de 2026): además de las correlaciones y del caso que más
// pesa, las dos mitades por el primer dato con la mediana del segundo en cada una, los casos de los dos extremos del primer dato, el que más
// se aparta del orden general (por su puesto en los dos datos, la misma lógica que la correlación de Spearman, y no por la distancia a la
// recta, como hasta entonces) y, si no hay patrón, dos casos vecinos en el primer dato y lo más lejos posible en el segundo.
// Un artículo puede juntar varios cruces de la misma tabla (a.partes, etapa 5): cada parte lleva sus datos (x, y, espera, lx, ly, ux, uy,
// desde, yAuto y sus límites), y el artículo, lo común. Sin partes, el artículo es su única parte
const partesArt = a => a.partes || [a];
function calcularArt(a, p = a) {
  const F = T[tablaArt(a)].filter(f => f[p.x] != null && f[p.y] != null), n = F.length, h = Math.floor(n / 2);
  const xs = F.map(f => f[p.x]), ys = F.map(f => f[p.y]);
  const S = CX.simple(xs, ys), iCook = d3.maxIndex(S.cook), sinC = F.filter((_, i) => i !== iCook), rs = CX.spearman(xs, ys);
  // el puesto de cada caso en los dos datos (1 = el valor más alto)
  const ordX = [...F].sort((u, v) => v[p.x] - u[p.x]), ordY = [...F].sort((u, v) => v[p.y] - u[p.y]);
  const px = new Map(ordX.map((f, i) => [f, i + 1])), py = new Map(ordY.map((f, i) => [f, i + 1]));
  const desvio = f => Math.abs((rs >= 0 ? px.get(f) : n + 1 - px.get(f)) - py.get(f));
  let par = null;
  ordX.forEach((f, i) => ordX.slice(i + 1, i + 3).forEach(g => { if (!par || Math.abs(f[p.y] - g[p.y]) > Math.abs(par[0][p.y] - par[1][p.y])) par = [f, g]; }));
  return {F, n, h, rs, rp: CX.pearson(xs, ys), rs2: CX.spearman(sinC.map(f => f[p.x]), sinC.map(f => f[p.y])), cook: F[iCook], px, py, par,
    lejos: F.reduce((m, f) => desvio(f) > desvio(m) ? f : m, F[0]), mas: ordX[0], menos: ordX[n - 1],
    medMas: d3.median(ordX.slice(0, h), f => f[p.y]), medMenos: d3.median(ordX.slice(n - h), f => f[p.y])};
}
// Las advertencias de todo cruce, iguales en todos los artículos: van en un recuadro fijo, "Cómo leer un cruce", y cada artículo lista solo las
// suyas, la más importante primero (auditoría de los artículos: repetidas palabra por palabra al comienzo de la lista, el lector las salteaba
// justo antes de las que importan)
const leerCruce = (c, U) => `Son ${c.n} ${U.pl}: con tan pocos casos, una o dos pueden cambiar el resultado. Que dos datos vayan juntos no ` +
  `prueba que uno cause el otro: los dos pueden responder a otras cosas que el cruce no mide. ${U.prom}`;
// el texto de una parte. Con varias partes, la casualidad y los períodos nombran los dos datos de su cruce
function textoArt(a, c, p = a, varias = false) {
  const Mx = META_TAB[tablaArt(a)][p.x], My = META_TAB[tablaArt(a)][p.y], U = CASOS_ART[tablaArt(a)];
  const fx = v => loc.format(`,.${Mx.dec}f`)(v), fy = v => loc.format(`,.${My.dec}f`)(v);
  const [px, rx] = partesU(p.ux), [py, ry] = partesU(p.uy);
  const vx = f => `${fx(f[p.x])}${px} ${rx}`, vy = f => `${fy(f[p.y])}${py} ${ry}`;
  const ab = Math.abs(c.rs), mismo = Math.sign(c.rs) === p.espera, entre = varias ? ` entre ${p.lx} y ${p.ly}` : "";
  const respuesta = ab >= .2 && !mismo ? "No: la relación va en sentido contrario." : respuestaR(c.rs);
  // las dos mitades, en el sentido de la pregunta del título: p.desde = "menos" cuando el título pregunta por las que tienen menos del primer dato
  const menos = p.desde === "menos", [A, B] = menos ? [c.menos, c.mas] : [c.mas, c.menos];
  const [m1, m2] = menos ? [c.medMenos, c.medMas] : [c.medMas, c.medMenos], [d1, d2] = menos ? ["menos", "más"] : ["más", "menos"];
  const frase = `${mayusc(p.ly)} en las ${c.h} ${U.pl} con ${d1} ${p.lx}: ${fy(m1)}${py} ${ry}. En las ${c.h} con ${d2}: ${fy(m2)}${py}.` +
    (ab >= .2 && fuerza(c.rs2) !== fuerza(c.rs) ? ` Sin ${c.cook.territorio}, la relación pasa a ser ${fuerza(c.rs2)}.` : "");
  // el gancho: los dos extremos del primer dato y lo que tienen en el segundo, en el sentido del título
  const gancho = `${A.territorio} es la ${U.s} con ${d1} ${p.lx} (${vx(A)}) y ${B.territorio}, la que ${d2} (${fx(B[p.x])}${px}). ` +
    `En ${p.ly}, ${A.territorio} tiene ${vy(A)} y ${B.territorio}, ${fy(B[p.y])}${py}.`;
  const [P, Q] = c.par, L = c.lejos;
  const caso = ab < .2
    ? `Dos ${U.pl} vecinas en ${p.lx} pueden estar lejos en ${p.ly}: ${P.territorio}, con ${vx(P)} y ${vy(P)}, y ${Q.territorio}, con ${vx(Q)} y ${vy(Q)}.`
    : `La que más se aparta del orden general es ${L.territorio}: es la ${c.px.get(L)}.ª de las ${c.n} con más ${p.lx} (${vx(L)}) y la ` +
      `${c.py.get(L)}.ª con más ${p.ly} (${vy(L)}).`;
  // en "Cómo se calcula": lo general una vez por artículo y lo de cada cruce aparte
  const comun = [`Las dos mitades ordenan las ${c.n} ${U.pl} por el primer dato: las ${c.h} con más y las ${c.h} con menos. De cada mitad se muestra la ` +
    `mediana del segundo dato, el valor que deja a la mitad de esas ${U.pl} por encima y a la otra mitad por debajo.`,
    `La relación se mide con la correlación de Spearman, que compara el orden de las ${c.n} ${U.pl} en los dos datos. Va de −1 a 1: cuanto más lejos ` +
    `está de 0, más marcada es la relación, y un valor negativo quiere decir que cuando un dato sube, el otro tiende a bajar. Desde 0,60 la relación es ` +
    "fuerte, desde 0,40 moderada, desde 0,20 débil y por debajo, casi nula. La línea punteada de cada gráfico es la recta que mejor se acerca a los puntos."];
  const propio = `${varias ? mayusc(p.lx) + " y " + p.ly + ": la" : "Acá la"} correlación es de ${rTxt(c.rs)}, una relación ${fuerza(c.rs)}. ` +
    `${c.cook.territorio} es la ${U.s} que más pesa en el resultado. ` + (Math.abs(c.rs2 - c.rs) < .05
      ? `Sin ella, la correlación ${rTxt(c.rs2) === rTxt(c.rs) ? "no cambia" : "casi no cambia"}: da ${rTxt(c.rs2)}.`
      : `Sin ella, pasa de ${rTxt(c.rs)} a ${rTxt(c.rs2)}` + (fuerza(c.rs2) !== fuerza(c.rs) ? `, una relación ${fuerza(c.rs2)}.` : ".")) +
    (Math.abs(c.rs - c.rp) > .2 ? ` La correlación de Pearson, que pesa más los valores extremos, da ${rTxt(c.rp)}: que las dos den tan distinto indica ` +
      "que unos pocos casos influyen mucho." : "");
  const lim = [
    ...(ab < .2 ? [`Con ${c.n} casos y una relación casi nula${entre}, la diferencia entre las dos mitades puede ser casualidad.`]
      : ab < .4 ? [`Con ${c.n} casos, una relación débil como esta${entre} puede aparecer por casualidad.`] : []),
    ...(p.limites || []),
    ...(Mx.periodo !== My.periodo ? [`Los datos son de períodos distintos: el de ${p.lx} es ${delPer(Mx.periodo)} y el de ${p.ly}, ${delPer(My.periodo)}.`] : [])];
  return {respuesta, frase, gancho, caso, comun, propio, lim, leer: leerCruce(c, U), vx, vy, Mx, My};
}
const fuenteArt = m => m.fuente.includes(m.periodo) ? m.fuente : `${m.fuente} (${m.periodo})`;
// la tarjeta de un artículo en la portada. La lista de Artículos, con la bajada de cada uno, la escribe el constructor (Fase 2, paso 4)
const tarjetaArt = a => `<a class="tarjeta art-card" href="${urlPagina(a.id)}"><span class="art-ico">${icono(a.icono)}</span>` +
  `<span class="art-txt"><b style="view-transition-name:t-${a.id}">${a.titulo}</b><small>${nombreSec(a.sec)}. ${a.frec}</small></span></a>`;
// título, ícono y sección de cada artículo: de la plantilla (data-titulo, data-ico y data-sec), por el índice del sitio
const DAT_ART = Object.fromEntries(SITIO.articulos.map(([id, titulo, icono, sec]) => [id, {titulo, icono, sec}]));
// las cuentas de cada artículo se hacen en las páginas de los artículos (y en el armado, para lo que se ve de ellos en las demás páginas,
// DATINA_ARMADO_ARTICULOS, al final; hasta el 25 de noviembre de 2026, en todas las páginas): si las de uno fallan, se anota en la
// consola (la prueba de páginas lo ve) y ese artículo queda afuera, sin cortar el resto de la página (estabilización, P2-17). a.c y a.t
// tienen una entrada por parte
ART.forEach(a => {
  Object.assign(a, DAT_ART[a.id]);
  try { a.c = partesArt(a).map(p => calcularArt(a, p)); a.t = partesArt(a).map((p, i) => textoArt(a, a.c[i], p, partesArt(a).length > 1)); }
  catch (e) { a.c = a.t = null; console.error(`Datina: no se pudo armar el artículo ${a.id}.`, e); }
});
// El modelo nuevo de los cruces (2 de noviembre de 2026, pedido del autor: "Ampliarlos", como los artículos de series): cada dato por separado,
// con su gráfico por caso y su mediana, su evolución si tiene serie (a.serie), y después el cruce, con "En síntesis", "Qué medimos" y "Fuentes y
// metodología". Es opcional por artículo (a.nuevo). El recuadro de síntesis conserva la clase nota-frase y la respuesta en <mark>, que buscan la
// lista de Artículos y la prueba de fallas. A mano van el contexto, medimos, las preguntas (a.preg), los textos de cada dato (a.txtVar) y notas
function artNuevo(a) {
  const P = partesArt(a), tabla = tablaArt(a), U = CASOS_ART[tabla], t0 = a.t[0];
  const ficha = id => id && paginaDe(id) ? urlPagina(paginaDe(id), "#" + id) : null;
  const fichas = [...new Map(a.t.flatMap(t => [[t.Mx.ficha, t.Mx.nombre], [t.My.ficha, t.My.nombre]])).entries()].filter(([id]) => ficha(id));
  const fts = [...new Set(a.t.flatMap(t => [fuenteArt(t.Mx), fuenteArt(t.My)]))];
  const key = i => "art-" + a.id + (i ? "-" + i : "");
  const nota = document.getElementById(a.id); if (!nota) return;
  // los datos de todas las partes, cada uno una vez y en el orden en que aparecen
  const vars = [], fmt = w => x => loc.format(`,.${w.M.dec}f`)(x) + w.pre;
  P.forEach((p, i) => [[p.x, a.t[i].Mx, a.t[i].vx, p.ux], [p.y, a.t[i].My, a.t[i].vy, p.uy]].forEach(([id, M, v, u]) => {
    if (vars.some(w => w.id === id)) return;
    const F = T[tabla].filter(f => f[id] != null), ord = [...F].sort((q, r) => r[id] - q[id]), med = d3.median(F, f => f[id]);
    vars.push({id, M, v, pre: partesU(u)[0], F, alto: ord[0], bajo: ord.at(-1), med, j: vars.length});
  }));
  const vtxt = w => `${w.alto.territorio} tiene el valor más alto, ${w.v(w.alto)}, y ${w.bajo.territorio}, el más bajo, ${w.v(w.bajo)}. ` +
    `La mediana de las ${w.F.length} ${U.pl} es ${w.v({[w.id]: w.med})}: la mitad está por encima y la otra mitad, por debajo.`;
  const sintesis = [...a.t.map(t => `<mark>${t.respuesta}</mark> ${t.frase}`),
    ...(P.length > 1 ? [] : vars.map(w => `${w.M.nombre}: de ${w.v(w.bajo)} en ${w.bajo.territorio} a ${w.v(w.alto)} en ${w.alto.territorio}.`))];
  // la unidad y el período de cada dato (la de la EPH ya dice "promedio de cuatro trimestres", y su período, cuáles)
  const yaPer = w => w.M.unidad.includes(w.M.periodo);
  const medimos = [...(a.medimos || []), ...vars.map(w => `${w.M.nombre}: ${minusc(w.M.unidad).replace(/, promedio de cuatro trimestres$/, "")}` +
    (yaPer(w) ? "." : `, ${/^los cuatro trimestres/.test(w.M.periodo) ? "promedio " : ""}${delPer(w.M.periodo)}.`))];
  // en el título, el segundo valor sin repetir la unidad cuando es un porcentaje
  const corto = (w, f) => w.pre ? fmt(w)(f[w.id]) : w.v(f);
  // en las notas, cómo se mide la relación (las dos mitades ya las explica el texto) y, con varias partes, solo la correlación de cada una
  const notas = [...(a.notas || []), ...t0.comun.slice(1), ...a.t.map(t => P.length > 1 ? t.propio.split(/(?<=\.) /)[0] : t.propio)];
  const sec = (preg, tit, graf, pie, txt) => `<div class="nota-sec"><h2>${preg}</h2><div class="nota-graf"><h3>${tit}</h3>${graf}` +
    `<p class="nota-pie-graf">${pie}</p></div>${txt.map(x => `<p>${x}</p>`).join("")}</div>`;
  // la evolución de un dato (a.serie[id]): con tipo "pesas", dos años de una tabla que ya está (filas() da codigo_indec, territorio, a y b, y la
  // y lb, los años); con tipo "serie", una serie anual de cruces_series.csv (id) o de una tabla diferida (tabla y col), resumida en
  // R.cruces_series_med[clave] para el texto. Cada una con su mediana del primer y del último año y en cuántas jurisdicciones subió
  const resSerie = (w, S) => {
    if (S.tipo === "pesas") {
      const F = S.filas().filter(f => f.a != null && f.b != null);
      return {ini: S.la, fin: S.lb, m0: d3.median(F, f => f.a), m1: d3.median(F, f => f.b), sube: F.filter(f => f.b > f.a).length, n: F.length};
    }
    const M = R.cruces_series_med[S.clave || S.id];
    return {ini: M.ini, fin: M.fin, m0: M.med_ini, m1: M.med_fin, sube: M.sube, n: M.n};
  };
  const preS = (w, S) => S.pre ?? w.pre, fmtS = (w, S) => x => loc.format(`,.${S.dec ?? w.M.dec}f`)(x) + preS(w, S);
  const secSerie = w => {
    const S = a.serie?.[w.id]; if (!S) return "";
    const r = resSerie(w, S), f = x => fmtS(w, S)(x) + (S.u ? " " + S.u : ""), k = S.baja ? r.n - r.sube : r.sube;
    const en = k === r.n ? `en las ${r.n}` : k === 0 ? "en ninguna" : `en ${k} de las ${r.n}`;
    const txt = `Entre ${r.ini} y ${r.fin}, la mediana de las jurisdicciones pasó de ${f(r.m0)} a ${f(r.m1)}. ${S.dato || w.M.nombre} ${S.baja ? "bajó" : "subió"} ${en}.` +
      (S.txt ? " " + (typeof S.txt === "function" ? S.txt(r) : S.txt) : "");
    return sec(S.preg || `¿Cómo cambió con los años?`, `La mediana pasó de ${f(r.m0)} en ${r.ini} a ${f(r.m1)} en ${r.fin}`,
      `<div class="grafico" data-g="${key(0)}-s${w.j}" data-forma="${S.tipo === "pesas" ? "barras" : "lineas"}"></div>`,
      S.pie || (S.tipo === "pesas" ? `${mayusc(S.unidad || w.M.unidad)}. El círculo claro marca ${r.ini} y el lleno, ${r.fin}.` :
        `${mayusc(S.unidad || w.M.unidad)}, por año. La línea es la mediana de las ${U.pl} y la franja abarca a la mitad de ellas que queda en el medio.`), [txt]);
  };
  yaEscrito(nota).innerHTML =
    `<div class="nota-cab"><span class="nota-ico">${icono(a.icono)}</span><div><p class="nota-meta">${nombreSec(a.sec)}. ${a.frec}</p><h1 class="nota-tit" style="view-transition-name:t-${a.id}">${a.titulo}</h1></div></div>` +
    `<p class="nota-bajada">${t0.gancho}</p>` +
    `<div class="nota-frase nota-sintesis"><h2>En síntesis</h2><ul>${sintesis.map(x => `<li>${x}</li>`).join("")}</ul></div>` +
    `<p>${a.contexto}</p><div class="nota-medimos"><h2>Qué medimos</h2>${medimos.map(x => `<p>${x}</p>`).join("")}</div>` +
    vars.map(w => sec(a.preg?.[w.id] || `¿Cómo cambia ${minusc(w.M.nombre)} entre las ${U.pl}?`, `${w.alto.territorio} tiene ${w.v(w.alto)}, y ${w.bajo.territorio}, ${corto(w, w.bajo)}`,
      `<div class="grafico" data-g="${key(0)}-v${w.j}" data-forma="barras"></div>`,
      `${mayusc(w.M.unidad)}${yaPer(w) ? "" : ", " + w.M.periodo}. La línea marca la mediana de las ${w.F.length} ${U.pl}.`,
      [vtxt(w), ...[typeof a.txtVar?.[w.id] === "function" ? a.txtVar[w.id](w) : a.txtVar?.[w.id]].filter(Boolean)]) + secSerie(w)).join("") +
    P.map((p, i) => { const t = a.t[i];
      // con una sola parte, la parte es el artículo y su preg es la lista de preguntas de cada dato: el cruce va con el título
      return sec((typeof p.preg === "string" && p.preg) || a.titulo, `${t.Mx.nombre} y ${minusc(t.My.nombre)}: una relación ${fuerza(a.c[i].rs)}`,
        `<div class="grafico" data-g="${key(i)}" data-forma="puntos"></div>`,
        `Cada punto es una ${U.s}. ${t.Mx.nombre}: ${t.Mx.unidad}. ${t.My.nombre}: ${t.My.unidad}. La línea punteada muestra la tendencia.`,
        [t.caso, ...[typeof p.txt === "function" ? p.txt(a.c[i]) : p.txt].filter(Boolean)]); }).join("") +
    `<div class="nota-limites"><h2>Qué no dice este dato</h2><ul>${[...a.t.flatMap(t => t.lim), ...(P.length > 1 ? a.limites || [] : [])].map(l => `<li>${l}</li>`).join("")}</ul>` +
    `<div class="nota-leer"><h3>Cómo leer un cruce</h3><p>${t0.leer}</p></div></div>` +
    `<div class="nota-fuentes"><h2>Fuentes y metodología</h2><ol class="nota-notas">${notas.map(x => `<li>${x}</li>`).join("")}</ol>` +
    `<p>${fts.length > 1 ? "Fuentes" : "Fuente"}: ${listaY(fts)}.</p><div class="acciones">` +
    fichas.map(([id, nom]) => `<a class="boton chico accion" href="${ficha(id)}">Ficha: ${minusc(nom)}</a>`).join("") +
    (tabla === "cruces_provincias" ? P.map(p => `<a class="boton chico accion" href="cruces?cx=${p.x}&cy=${p.y}">Abrir en Cruces${P.length > 1 ? `: ${p.lx}` : ""}</a>`).join("") : "") +
    `<a class="boton chico accion" href="datos/${tabla}.csv" download>Descargar CSV</a></div></div>`;
  // cada dato por caso, con la mediana, y los cruces con nombre en las jurisdicciones que menciona el texto
  vars.forEach(w => { DIB[`${key(0)}-v${w.j}`] = anim => barrasH(G(`${key(0)}-v${w.j}`), {anim, data: w.F, k: w.id, vf: fmt(w),
    af: x => n0(x) + w.pre, ref: w.med, refLab: `Mediana ${fmt(w)(w.med)}`, tip: d => `<b>${d.territorio}</b><br>${w.v(d)}`}); });
  vars.filter(w => a.serie?.[w.id]).forEach(w => {
    const S = a.serie[w.id], g = `${key(0)}-s${w.j}`;
    if (S.tipo === "pesas") {
      DIB[g] = anim => pesas(G(g), {anim, data: S.filas().filter(f => f.a != null && f.b != null), a: "a", b: "b", la: String(S.la), lb: String(S.lb),
        vf: fmtS(w, S), af: x => n0(x) + preS(w, S), mejor: S.mejor, uDif: preS(w, S) === "%" ? " puntos" : ""});
      return;
    }
    // la serie anual: la mediana de cada año y la franja de la mitad del medio (del primer al tercer cuartil). Con la más baja y la más alta, un
    // solo caso extremo estiraba el eje y aplastaba la línea de la mediana
    const cargar = () => S.tabla ? cargarTabla(S.tabla).then(F => { const o = {}; F.forEach(r => { const c = String(r.codigo_indec).padStart(2, "0"); if (c !== "00") (o[c] ||= {})[r.anio] = r[S.col]; }); return o; })
      : cargarSeriesCru().then(t => t[S.id]);
    DIB[g] = anim => {
      const el = G(g); if (!el) return;
      if (!el.querySelector("svg")) esperando(el);
      cargar().then(o => {
        const anios = [...new Set(Object.values(o).flatMap(x => Object.keys(x).map(Number)))].sort((p, q) => p - q);
        const data = anios.map(an => { const v = Object.values(o).map(x => x[an]).filter(x => x != null).sort(d3.ascending);
          return {anio: an, med: d3.median(v), lo: d3.quantile(v, .25), hi: d3.quantile(v, .75)}; });
        el.removeAttribute("aria-busy");
        lineas(el, {anim, x: "anio", y0: 0, vf: fmtS(w, S), yf: x => n0(x) + preS(w, S), data, banda: {lo: "lo", hi: "hi", lab: "La mitad del medio:"}, series: [{k: "med", lab: "Mediana", c: NAR}]});
      }).catch(() => sinDatos(el, "No se pudieron cargar los datos. Probá recargar la página."));
    };
  });
  P.forEach((p, i) => {
    const c = a.c[i], t = a.t[i], [px] = partesU(p.ux), [py] = partesU(p.uy);
    DIB[key(i)] = anim => dispersion(G(key(i)), {anim, data: c.F, x: p.x, y: p.y, yAuto: p.yAuto, xLab: t.Mx.nombre, yLab: t.My.nombre,
      marcar: [c.mas, c.menos, ...(Math.abs(c.rs) < .2 ? c.par : [c.lejos]), c.cook].map(f => f.codigo_indec),
      fx: v => n0(v) + px, fy: v => n0(v) + py, vx: v => t.vx({[p.x]: v}), vy: v => t.vy({[p.y]: v})});
  });
}
// el orden de la nota (etapa 5): el gancho como bajada, "En una frase" con la respuesta y las dos mitades de cada cruce, el contexto, el gráfico
// y el caso que se aparta de cada cruce, "Cómo se calcula" plegado, los límites propios con el recuadro fijo de cómo leer un cruce, y las fuentes
ART.forEach(a => {
  if (!a.t) { const nota = document.getElementById(a.id); if (nota) nota.innerHTML = '<p class="nota">No se pudo armar este artículo. Probá recargar la página.</p>'; return; }
  if (a.nuevo) { artNuevo(a); return; }
  const P = partesArt(a), tabla = tablaArt(a), U = CASOS_ART[tabla], t0 = a.t[0];
  const ficha = id => id && paginaDe(id) ? urlPagina(paginaDe(id), "#" + id) : null;
  const fichas = [...new Map(a.t.flatMap(t => [[t.Mx.ficha, t.Mx.nombre], [t.My.ficha, t.My.nombre]])).entries()].filter(([id]) => ficha(id));
  const fts = [...new Set(a.t.flatMap(t => [fuenteArt(t.Mx), fuenteArt(t.My)]))];
  const key = i => "art-" + a.id + (i ? "-" + i : "");
  const nota = document.getElementById(a.id); if (!nota) return;
  yaEscrito(nota).innerHTML =
    `<div class="nota-cab"><span class="nota-ico">${icono(a.icono)}</span><div><p class="nota-meta">${nombreSec(a.sec)}. ${a.frec}</p><h1 class="nota-tit" style="view-transition-name:t-${a.id}">${a.titulo}</h1></div></div>` +
    `<p class="nota-bajada">${t0.gancho}</p>` +
    `<div class="nota-frase"><h2>En una frase</h2>${a.t.map(t => `<p><mark>${t.respuesta}</mark> ${t.frase}</p>`).join("")}</div><p>${a.contexto}</p>` +
    // data-forma reserva el alto del gráfico mientras se dibuja, así el texto de abajo no salta (revisión de la línea de base)
    a.t.map((t, i) => `<div class="nota-graf"><h2>${t.Mx.nombre} ${yE(minusc(t.My.nombre))}, por ${U.s}</h2><div class="grafico" data-g="${key(i)}" data-forma="puntos"></div>` +
      `<p class="nota-pie-graf">Cada punto es una ${U.s}. ${t.Mx.nombre}: ${t.Mx.unidad}. ${t.My.nombre}: ${t.My.unidad}. La línea punteada muestra la tendencia.</p></div>` +
      `<p>${t.caso}</p>`).join("") +
    `<details class="nota-calculo"><summary>Cómo se calcula</summary>${[...t0.comun, ...a.t.map(t => t.propio)].map(x => `<p>${x}</p>`).join("")}</details>` +
    `<div class="nota-limites"><h2>Qué no dice este dato</h2><ul>${[...a.t.flatMap(t => t.lim), ...(P.length > 1 ? a.limites || [] : [])].map(l => `<li>${l}</li>`).join("")}</ul>` +
    `<div class="nota-leer"><h3>Cómo leer un cruce</h3><p>${t0.leer}</p></div></div>` +
    `<div class="nota-fuentes"><p>${fts.length > 1 ? "Fuentes" : "Fuente"}: ${listaY(fts)}.</p><div class="acciones">` +
    fichas.map(([id, nom]) => `<a class="boton chico accion" href="${ficha(id)}">Ficha: ${minusc(nom)}</a>`).join("") +
    (tabla === "cruces_provincias" ? P.map(p => `<a class="boton chico accion" href="cruces?cx=${p.x}&cy=${p.y}">Abrir en Cruces${P.length > 1 ? `: ${p.lx}` : ""}</a>`).join("") : "") +
    `<a class="boton chico accion" href="datos/${tabla}.csv" download>Descargar CSV</a></div></div>`;
  // en cada gráfico van con nombre las jurisdicciones que menciona el texto
  P.forEach((p, i) => {
    const c = a.c[i], t = a.t[i], [px] = partesU(p.ux), [py] = partesU(p.uy);
    DIB[key(i)] = anim => dispersion(G(key(i)), {anim, data: c.F, x: p.x, y: p.y, yAuto: p.yAuto, xLab: t.Mx.nombre, yLab: t.My.nombre,
      marcar: [c.mas, c.menos, ...(Math.abs(c.rs) < .2 ? c.par : [c.lejos]), c.cook].map(f => f.codigo_indec),
      fx: v => n0(v) + px, fy: v => n0(v) + py, vx: v => t.vx({[p.x]: v}), vy: v => t.vy({[p.y]: v})});
  });
});
/* ---------- artículos con series del país (etapa 22): preguntas que se responden cruzando series en el tiempo ----------
   Las cifras salen del resumen (02_procesar.py las calcula sobre los trimestres) y las tablas de los gráficos se bajan aparte, al abrir el
   artículo. A mano van solo la pregunta (data-titulo en el marcado), el contexto y los límites propios, sin cifras. Las correlaciones se
   describen con la misma escala que los artículos de cruces, leída sobre el valor que se muestra, y la respuesta destacada sale de los datos.
   Para sumar uno: su nota en la plantilla, sus cifras en el resumen, sus tablas en DIFERIDAS y su entrada acá. */
const DL = R.dolar;
const r100 = r => Math.round(r * 100) / 100, fz = fuerza, ab = r => Math.abs(r100(r));
const ORD_T = ["1.er", "2.º", "3.er", "4.º"], triCorto = r => `${ORD_T[r.trimestre - 1]} trim. ${r.anio}`;
const pctAbs = v => pct(Math.abs(v));
const PLURAL = {"fuerte": "fuertes", "moderada": "moderadas", "débil": "débiles", "casi nula": "casi nulas"};
// dos relaciones a la vez: "las dos relaciones son débiles" o "la primera relación es fuerte y la segunda, moderada"
const dosRel = (r1, r2) => fz(r1) === fz(r2) ? `las dos relaciones son ${PLURAL[fz(r1)]}` : `la primera relación es ${fz(r1)} y la segunda, ${fz(r2)}`;
// el final del texto de los límites para comprar dólares al tipo de cambio oficial, que repiten los artículos del dólar (un hecho fijo,
// como en FIJOS de 03). Los años enteros que abarcaron los calcula 02
const LIMITES = "septiembre de 2019 y abril de 2025";
const ART_SERIE = [{
  // 25 de noviembre de 2026 (pedido del autor, la versión argentina de un mapa de Guadalajara): qué parte de las mujeres de 25 a 54 años está
  // ocupada en cada provincia y en cada departamento, con el Censo. El texto usa solo R.empleo_mujeres (02_procesar.py)
  id: "a-empleo-mujeres", frec: "Se actualiza con cada censo", tablas: ["empleo_mujeres_provincias", "empleo_mujeres_departamentos", "empleo_mujeres_edad"],
  dek: "Qué parte de las mujeres de 25 a 54 años tiene empleo en cada provincia y en cada departamento según el último censo, qué distancia hay con los varones, cómo cambia con la edad, cuánto varía entre CABA y el Gran Buenos Aires y si va junto con el secundario completo.",
  fichas: [["f-desocupacion", "desocupación y empleo"]],
  csv: [["empleo_mujeres_departamentos", "Descargar CSV por departamento"], ["empleo_mujeres_provincias", "Descargar CSV por provincia"],
    ["empleo_mujeres_edad", "Descargar CSV por edad"]],
  fuentes: "INDEC, Censo Nacional de Población, Hogares y Viviendas, características económicas y nivel de instrucción, y Encuesta Permanente de Hogares, tasas del mercado de trabajo",
  texto: () => {
    const E = R.empleo_mujeres, nom = ([t, v]) => `${t} (${pct(v)})`, dep = ([d, p]) => `${d} (${p})`;
    const [pt, pb] = [E.prov_top, E.prov_bajas], difP = pt[0][1] - pb[0][1], difD = E.top[0][2] - E.bajos[0][2];
    const enCaba = E.top.filter(x => x[1] === "CABA").length, [pm, nm] = E.menos_mitad_prov[0], chico = (E.n_muj / 1e6);
    const respuesta = `En ${pt[0][0]}: el ${pct(pt[0][1])} de las mujeres de 25 a 54 años tiene empleo, frente al ${pct(pb[0][1])} en ${pb[0][0]}.`;
    const bajada = `En todo el país es el ${pct(E.m)}, según el censo de ${E.anio}. Por departamento, entre los de ${n0(E.min_pob)} habitantes o más, ` +
      `va del ${pct(E.bajos[0][2])} en ${dep(E.bajos[0])} al ${pct(E.top[0][2])} en la ${dep(E.top[0])}.`;
    const contexto = "Cuántas mujeres tienen empleo cambia mucho de un lugar a otro, más que cuántos varones lo tienen. Este artículo lo mide en cada " +
      "provincia y en los departamentos, partidos y comunas del país, con una misma pregunta del censo y con la edad controlada. La idea viene de " +
      "un mapa del empleo de las mujeres en las zonas de Guadalajara, México. No mide cuánto trabajan las mujeres: el trabajo " +
      "de la casa y el de cuidado de personas no entran en esta cuenta.";
    const medimos = ["Ocupada es quien trabajó al menos una hora en la semana anterior al censo para producir bienes o servicios para el mercado, o tenía un " +
      "trabajo del que estuvo ausente. Cuenta igual un empleo formal, una changa o la ayuda en un negocio de la familia, y no cuenta lo que se " +
      "produce solo para la propia casa.",
      "Se toman las mujeres de 25 a 54 años, la edad en que la mayoría ya no estudia y todavía no se jubila. Así un lugar con muchas estudiantes o " +
      `con muchas jubiladas no da más bajo solo por eso. De los ${n1(chico)} millones de mujeres de esa edad que viven en viviendas particulares, ` +
      `${n1(E.n_ocu / 1e6)} millones están ocupadas.`];
    const s1 = `${listaY(pt.map(nom))} tienen las partes más altas. Las más bajas son las de ${listaY(pb.map(nom))}. Entre los dos extremos hay ` +
      `${n1(difP)} puntos. La mediana de las 24 jurisdicciones es del ${pct(E.mediana)}. Si se cuentan todas las mujeres de 14 años o más, la parte ` +
      `del país baja al ${pct(E.m14)}, pero el orden de las jurisdicciones casi no cambia.`;
    const s2 = `El mapa separa los ${E.n_dep} departamentos en cinco grupos del mismo tamaño, del que menos mujeres ocupadas tiene al que más. ` +
      `El 10% de las mujeres vive en departamentos con menos del ${pct(E.p10)} y otro 10%, en departamentos con más del ${pct(E.p90)}. ` +
      `En ${E.menos_mitad} de los ${E.n_grandes} departamentos de ${n0(E.min_pob)} habitantes o más, menos de la mitad de las mujeres de esa edad tiene empleo: ` +
      `${nm} están en ${pm}. Los ${n0(E.n_dep - E.n_grandes)} departamentos más chicos están en el mapa, pero el artículo no los nombra porque pocas personas cambian mucho el porcentaje.`;
    const s3 = `${enCaba} de los 10 departamentos con la parte más alta son comunas de CABA. Los más bajos están en ` +
      `${listaY([...new Set(E.bajos.map(x => x[1]))])}. Entre el primero y el último hay ${n1(difD)} puntos. En los lugares donde menos mujeres tienen ` +
      `empleo también suele haber menos varones con empleo: en ${dep(E.bajos[0])}, el ${pct(E.bajos[0][3])}, frente al ${pct(E.v)} de todo el país. ` +
      "El censo no cuenta como ocupado a quien produce solo para su propia casa, y estos datos no dicen cuánto pesa eso en cada lugar.";
    const bx = E.brecha_max[0];
    const s4 = `En todas las jurisdicciones hay más varones ocupados que mujeres. En el país la distancia es de ${n1(E.brecha)} puntos: ${pct(E.v)} de los varones y ` +
      `${pct(E.m)} de las mujeres. La más grande es la de ${bx[0]}, ${n1(bx[1])} puntos (${pct(bx[3])} y ${pct(bx[2])}), y la más chica, la de ` +
      `${E.brecha_min[0][0]}, ${n1(E.brecha_min[0][1])}. Entre las jurisdicciones, la parte de los varones va del ${pct(E.rango_v[0])} al ${pct(E.rango_v[1])}, y la de las ` +
      `mujeres, del ${pct(E.rango_m[0])} al ${pct(E.rango_m[1])}: las diferencias entre lugares son mayores entre las mujeres.`;
    const ed = d => E.edad.find(x => x[0] === d), mx = E.edad_max, j = ed("60 a 64");
    const s5 = `La parte más alta es la de las mujeres de ${mx[0]} años, ${pct(mx[1])}. En las de 20 a 24 es del ${pct(ed("20 a 24")[1])}, y en las de 60 a 64, del ` +
      `${pct(j[1])}, frente al ${pct(j[2])} de los varones: la edad para jubilarse en el régimen general es de 60 años para las mujeres y de 65 para los varones.`;
    const s6 = `En CABA tiene empleo el ${pct(E.caba.m)} de las mujeres de 25 a 54 años, y en los 24 partidos del Gran Buenos Aires, el ${pct(E.gba.m)}. Dentro de CABA, ` +
      `el valor va del ${pct(E.caba.min[2])} en la ${E.caba.min[0]} al ${pct(E.caba.max[2])} en la ${E.caba.max[0]}. Entre los partidos, del ` +
      `${pct(E.gba.min[2])} en ${E.gba.min[0]} al ${pct(E.gba.max[2])} en ${E.gba.max[0]}. ${E.comunas_sobre_gba} de las 15 comunas superan al partido más alto.`;
    const s7 = `${respuestaR(E.sec.rs)} En las ${E.sec.h} jurisdicciones donde más adultos terminaron el secundario, la mediana de mujeres con empleo es del ` +
      `${pct(E.sec.mas)}. En las ${E.sec.h} con menos, del ${pct(E.sec.menos)}. Son dos datos que van juntos entre provincias: no dicen que una cosa cause la otra ` +
      `ni qué pasa con cada mujer. Son 24 casos: sin ${E.sec.sin[0]}, la que más mueve el resultado, la correlación pasa de ${rTxt(E.sec.rs)} a ${rTxt(E.sec.sin[1])}, una relación ${fuerza(E.sec.sin[1])}.`;
    const sintesis = [`El ${pct(E.m)} de las mujeres de 25 a 54 años tiene empleo en el país: ${n1(E.brecha)} puntos menos que los varones.`,
      `La parte más alta es la de ${pt[0][0]} (${pct(pt[0][1])}), y la más baja, la de ${pb[0][0]} (${pct(pb[0][1])}).`,
      `En ${E.menos_mitad} departamentos de ${n0(E.min_pob)} habitantes o más, menos de la mitad de las mujeres de esa edad tiene empleo.`,
      `Donde más adultos tienen el secundario completo hay más mujeres con empleo: una relación ${fuerza(E.sec.rs)} entre las jurisdicciones.`];
    const lim = ["No mide cultura ni roles de género. Una parte más baja puede deberse a la falta de empleo cerca, a la falta de lugares de cuidado, al ingreso " +
      "de los demás o a decisiones propias, y estos datos no separan esas causas.",
      "No cuenta el trabajo de la casa, el de cuidado de personas ni lo que se produce para el consumo propio.",
      "Estar ocupada no dice nada de la calidad del empleo, del ingreso ni de las horas: cuenta igual un trabajo de una hora que uno de tiempo completo.",
      `El nivel depende de la fuente. La tasa de empleo de toda la población en el censo fue del ${pct(E.eph.caba[0])} en CABA y del ${pct(E.eph.gba[0])} en los 24 partidos. ` +
      `La Encuesta Permanente de Hogares del segundo trimestre de ese año dio ${pct(E.eph.caba[1])} y ${pct(E.eph.gba[1])}. Por eso este artículo compara lugares y no fija el nivel. ` +
      "La comparación por sexo y edad con la encuesta no se hizo.",
      `El mapa cuenta también los ${n0(E.n_chicos)} departamentos con menos de mil mujeres de esa edad, donde unas pocas personas mueven el porcentaje. El más chico tiene ${n0(E.min_mujeres)}.`,
      `El censo es de ${E.anio}: no dice cómo cambió el empleo en cada lugar desde entonces.`,
      "Los porcentajes describen lugares, no personas: no se puede concluir cómo es cada mujer por el lugar donde vive."];
    const notas = [`Ocupación: INDEC, Censo ${E.anio}, cuadros 2.1 a 2.24 de características económicas de la población, en viviendas particulares, por sexo registrado al nacer y grupos de cinco años de edad. ` +
      "El INDEC repartió entre mujeres y varones las respuestas de la categoría X. Los ocupados de cada departamento coinciden con los de la base por radio censal del mismo censo.",
      `Departamentos: se nombran los de ${n0(E.min_pob)} habitantes o más en viviendas particulares.`,
      `La relación con el secundario se mide con la correlación de Spearman, de menos 1 a 1: ${rTxt(E.sec.rs)}. Entre las jurisdicciones, la parte de las mujeres de 25 a 54 años y la de 14 años o más dan ${rTxt(E.spearman_14)}. Entre los departamentos de ${n0(E.min_pob)} habitantes o más, la parte de las mujeres y la de los varones dan ${rTxt(E.corr_mv)}.`,
      `Secundario completo: adultos de 25 años o más, Censo ${E.anio}. Tasa de empleo de la encuesta: INDEC, EPH, segundo trimestre de ${E.anio}, ocupados sobre el total de la población.`];
    return {respuesta, bajada, contexto, medimos, sintesis, lim, notas, secciones: [
      {preg: "¿En qué provincias tienen más empleo las mujeres?", g: "em-provincias", forma: "barras",
        tit: `En ${pt[0][0]} tiene empleo el ${pct(pt[0][1])} de las mujeres de 25 a 54 años`,
        pie: `% de las mujeres de 25 a 54 años ocupadas en viviendas particulares, censo de ${E.anio}. La línea marca el total del país.`, txt: [s1]},
      {preg: "¿Y en cada departamento?", g: "em-mapa", forma: "barras",
        html: `<div class="grafico mp-mapa" data-g="art-em-mapa" data-forma="barras" style="--filas:25"></div>`,
        tit: `En ${E.menos_mitad} departamentos, menos de la mitad de las mujeres tiene empleo`,
        pie: `% de las mujeres de 25 a 54 años ocupadas, censo de ${E.anio}, los ${E.n_dep} departamentos, partidos y comunas en cinco grupos del mismo tamaño. ` +
          `La cuenta del título es de los de ${n0(E.min_pob)} habitantes o más. Con una provincia elegida, el mapa la muestra de cerca.`, txt: [s2]},
      {preg: "¿En qué departamentos es más alta y más baja?", g: "em-departamentos", forma: "barras",
        tit: `De ${pct(E.top[0][2])} en la ${E.top[0][0]} de CABA a ${pct(E.bajos[0][2])} en ${E.bajos[0][0]}`,
        pie: `% de las mujeres de 25 a 54 años ocupadas, los diez departamentos con la parte más alta y los diez con la más baja, censo de ${E.anio}. Solo los de ${n0(E.min_pob)} habitantes o más.`, txt: [s3]},
      {preg: "¿Qué distancia hay con los varones?", g: "em-brecha", forma: "barras",
        tit: `Hay ${n1(E.brecha)} puntos de distancia en el país y hasta ${n1(bx[1])} en ${bx[0]}`,
        pie: `Puntos porcentuales entre la parte de los varones y la de las mujeres de 25 a 54 años ocupadas, censo de ${E.anio}. La línea marca el total del país.`, txt: [s4]},
      {preg: "¿A qué edad tienen más empleo las mujeres?", g: "em-edad", forma: "lineas",
        tit: `La parte más alta es la de las mujeres de ${mx[0]} años: ${pct(mx[1])}`,
        pie: `% ocupado de cada grupo de cinco años de edad, país, censo de ${E.anio}. El eje marca el comienzo de cada grupo.`, txt: [s5]},
      {preg: "¿Y en CABA y en el Gran Buenos Aires?", g: "em-amba", forma: "barras",
        tit: `En CABA tiene empleo el ${pct(E.caba.m)}, y en los 24 partidos, el ${pct(E.gba.m)}`,
        pie: `% de las mujeres de 25 a 54 años ocupadas en las 15 comunas de CABA y los 24 partidos del Gran Buenos Aires, censo de ${E.anio}. En azul más oscuro, las comunas.`, txt: [s6]},
      {preg: "¿Tienen más empleo donde más adultos terminaron el secundario?", g: "em-secundario", forma: "puntos",
        tit: `Secundario completo y empleo de las mujeres: una relación ${fuerza(E.sec.rs)}`,
        pie: `Cada punto es una jurisdicción, censo de ${E.anio}. Secundario: % de los adultos de 25 años o más que lo completó. Empleo: % de las mujeres de 25 a 54 años. La línea punteada muestra la tendencia.`, txt: [s7]},
    ]};
  },
  dib: {
    "em-provincias": (el, a) => barrasH(el, {anim: a, data: T.empleo_mujeres_provincias.filter(r => r.codigo_indec !== "00"), k: "pct_mujeres", vf: pct, af: v => n0(v) + "%",
      ref: R.empleo_mujeres.m, refLab: `País ${pct(R.empleo_mujeres.m)}`,
      tip: d => `<b>${d.territorio}</b><br>Mujeres ocupadas: ${pct(d.pct_mujeres)}<br>Varones ocupados: ${pct(d.pct_varones)}`}),
    "em-mapa": (el, a) => {
      const D = new Map(T.empleo_mujeres_departamentos.map(r => [r.codigo_dep, r]));
      return mapaDep(el, {anim: a, filas: T.empleo_mujeres_departamentos, k: "pct_mujeres", nombre: "Mujeres de 25 a 54 años ocupadas", vf: v => n0(v) + "%", tf: pct,
        extra: id => { const r = D.get(id); return r ? `<br>Varones: ${pct(r.pct_varones)}<br>${n0(r.mujeres)} mujeres de esa edad` : ""; }});
    },
    "em-departamentos": (el, a) => {
      const F = T.empleo_mujeres_departamentos.filter(r => r.poblacion_vp >= R.empleo_mujeres.min_pob).sort((p, q) => q.pct_mujeres - p.pct_mujeres);
      const data = [...F.slice(0, 10), ...F.slice(-10)].map(r => ({...r, codigo_indec: r.codigo_dep, territorio: `${r.departamento} (${NOMBRES[r.codigo_indec] || r.codigo_indec})`}));
      return barrasH(el, {anim: a, data, k: "pct_mujeres", vf: pct, af: v => n0(v) + "%", l: 260, lAngosto: 175,
        tip: d => `<b>${d.territorio}</b><br>Mujeres ocupadas: ${pct(d.pct_mujeres)}<br>Varones ocupados: ${pct(d.pct_varones)}<br>${n0(d.mujeres)} mujeres de 25 a 54 años`});
    },
    "em-brecha": (el, a) => barrasH(el, {anim: a, data: T.empleo_mujeres_provincias.filter(r => r.codigo_indec !== "00"), k: "brecha", vf: n1, af: n0,
      ref: R.empleo_mujeres.brecha, refLab: `País ${n1(R.empleo_mujeres.brecha)}`,
      tip: d => `<b>${d.territorio}</b><br>${n1(d.brecha)} puntos<br>Varones ${pct(d.pct_varones)}, mujeres ${pct(d.pct_mujeres)}`}),
    "em-edad": (el, a) => lineas(el, {anim: a, data: T.empleo_mujeres_edad, x: "desde", y0: 0, y1: 100, vf: pct, yf: v => n0(v) + "%", xl: d => `${d.edad} años`,
      series: [{k: "pct_varones", lab: "Varones", c: NAR}, {k: "pct_mujeres", lab: "Mujeres", c: FRI}]}),
    "em-amba": (el, a) => {
      const G = new Set(R.empleo_mujeres.gba_codigos);
      const data = T.empleo_mujeres_departamentos.filter(r => r.codigo_indec === "02" || G.has(r.codigo_dep)).map(r => ({...r, codigo_indec: r.codigo_dep,
        territorio: r.codigo_dep.startsWith("02") ? `${r.departamento} (CABA)` : r.departamento}));
      return barrasH(el, {anim: a, data, k: "pct_mujeres", vf: pct, af: v => n0(v) + "%", l: 190, lAngosto: 150,
        color: d => d.codigo_indec.startsWith("02") ? css("--celeste-fuerte") : css("--celeste"),
        tip: d => `<b>${d.territorio}</b><br>Mujeres ocupadas: ${pct(d.pct_mujeres)}<br>Varones ocupados: ${pct(d.pct_varones)}`});
    },
    "em-secundario": (el, a) => {
      const F = T.empleo_mujeres_provincias.filter(r => r.codigo_indec !== "00");
      dispersion(el, {anim: a, data: F, x: "pct_secundario", y: "pct_mujeres", xLab: "Adultos con secundario completo", yLab: "Mujeres ocupadas",
        fx: v => n0(v) + "%", fy: v => n0(v) + "%", vx: v => `${pct(v)} de los adultos de 25 años o más`, vy: v => `${pct(v)} de las mujeres de 25 a 54 años`});
    },
  },
}, {
  // etapa 5 del plan de mejora: el nombre más elegido en cada provincia (auditoría de los artículos, idea 10)
  id: "a-nombres-provincias", frec: "Se actualiza cada año", tablas: ["nombres_top", "nombres_serie"],
  dek: "El nombre más inscripto para las nenas y para los varones en cada provincia en el último año, en cuántas jurisdicciones gana cada uno, cuáles son los diez más elegidos del país, cómo cambiaron año por año y qué nombres se repiten en más provincias.",
  fichas: [["f-nombres", "nombres de los bebés"]],
  csv: [["nombres_top", "Descargar CSV de los nombres"], ["nombres_serie", "Descargar CSV de los nombres del país por año"]],
  fuentes: "Registro Nacional de las Personas (RENAPER), nombres más frecuentes por provincia, y Dirección de Estadísticas e Información en Salud (DEIS), nacimientos",
  texto: () => {
    const cu = R.curiosidades, N = T.nombres_top, cods = Object.keys(NOMBRES);
    const primero = (c, s) => N.filter(r => r.codigo_indec === c && r.sexo === s).sort((a, b) => b.cantidad - a.cantidad)[0];
    const filas = cods.map(c => ({codigo_indec: c, territorio: NOMBRES[c], nena: primero(c, "F")?.mostrar, varon: primero(c, "M")?.mostrar}))
      .filter(f => f.nena && f.varon).sort((a, b) => a.territorio.localeCompare(b.territorio));
    const nF = filas.filter(f => f.nena === cu.nena).length, nM = filas.filter(f => f.varon === cu.varon).length;
    const distintos = new Set(filas.flatMap(f => [f.nena, f.varon])).size;
    // los diez del país y en cuántas provincias aparece cada nombre entre sus diez primeros
    const diez = s => N.filter(r => r.codigo_indec === "00" && r.sexo === s).sort((a, b) => b.cantidad - a.cantidad).slice(0, 10);
    const dF = diez("F"), dM = diez("M"), sumF = d3.sum(dF, r => r.cantidad), sumM = d3.sum(dM, r => r.cantidad);
    const enProv = {};
    N.filter(r => r.codigo_indec !== "00").forEach(r => { (enProv[r.mostrar + "|" + r.sexo] ||= {nombre: r.mostrar, sexo: r.sexo, n: 0}).n++; });
    const rep = Object.values(enProv).sort((a, b) => b.n - a.n), unaSola = rep.filter(r => r.n === 1);
    const todas = rep.filter(r => r.n === cods.length);
    const respuesta = `${cu.varon} para los varones ${yE(cu.nena)} para las nenas, en todo el país en ${cu.nom_anio}.`;
    const bajada = `Pero cambia de una provincia a otra: ${cu.varon} es el más elegido para los varones en ${nM} de las ${filas.length} jurisdicciones, ` +
      `${yE(cu.nena)}, para las nenas, en ${nF}. Entre las ${filas.length}, los más elegidos son ${distintos} nombres distintos.`;
    const contexto = "Elegir el nombre de un hijo es una decisión muy personal, pero los nombres siguen modas: se ponen de moda por una familia " +
      "conocida, un personaje, un deportista o el sonido de una época, y después pasan. Mirar qué nombres se eligen en cada provincia muestra " +
      "qué se comparte en todo el país y qué cambia de un lugar a otro. Y mirar los mismos nombres año por año muestra qué modas duran y cuáles pasan rápido. " +
      "Desde 2015, el Código Civil y Comercial permite inscribir hasta tres nombres de pila y acepta nombres de origen indígena y latinoamericano, " +
      "pero no los extravagantes, los apellidos como nombre ni el mismo primer nombre de un hermano vivo.";
    const medimos = ["El Registro Nacional de las Personas (RENAPER) publica cada año los nombres más inscriptos de los bebés de cada provincia. " +
      "Datina toma los diez más frecuentes de cada sexo en cada provincia en el último año publicado, y los diez del país en cada año desde " + cu.nom_ini + ". " +
      "El registro publica los nombres sin tildes: se muestran con la " +
      "tilde que llevan casi siempre. Cada nombre se cuenta en la provincia que informa el registro."];
    // 1. el más elegido de cada provincia
    const s1 = `En ${cu.nom_anio}, ${cu.varon} fue el nombre más inscripto para los varones en ${nM} jurisdicciones ${yE(cu.nena)} para las nenas en ${nF}. ` +
      `Las nenas reparten más el primer puesto que los varones: ${new Set(filas.map(f => f.nena)).size} nombres distintos ganan en alguna jurisdicción, ` +
      `frente a ${new Set(filas.map(f => f.varon)).size} de los varones. Las jurisdicciones donde gana otro nombre de nena son ` +
      `${listaY(filas.filter(f => f.nena !== cu.nena).map(f => `${f.territorio} (${f.nena})`))}.` +
      (nM < filas.length ? ` Entre los varones, donde no gana ${cu.varon}: ${listaY(filas.filter(f => f.varon !== cu.varon).map(f => `${f.territorio} (${f.varon})`))}.` : "");
    // 2. en cuántas gana cada nombre
    const s2 = `En ${cu.nom_ini}, el primer año de la serie, los más inscriptos del país habían sido ${cu.nena0} para las nenas ${yE(cu.varon0)} para los varones.` +
      (cu.lionel_anio ? ` En ${cu.lionel_anio}, después del Mundial de 2022, se inscribieron ${n0(cu.lionel_max)} bebés llamados Lionel, ${veces(cu.lionel_max, cu.lionel_prev)} veces los del año anterior.` : "");
    // 3 y 4. los diez del país
    const s3 = `Se inscribieron ${n0(cu.nena_n)} nenas llamadas ${cu.nena}. Las diez primeras de la lista suman ${n0(sumF)} inscripciones, y entre la primera y la ` +
      `décima, ${dF.at(-1).mostrar}, hay ${n0(dF[0].cantidad - dF.at(-1).cantidad)} de diferencia. Del segundo al cuarto puesto quedaron ` +
      `${listaY(dF.slice(1, 4).map(r => `${r.mostrar}, con ${n0(r.cantidad)}`))}. ${cu.nena} sola es el ${pct(cu.nena_n / sumF * 100)} de las diez primeras.`;
    const s4 = `Se inscribieron ${n0(cu.varon_n)} varones llamados ${cu.varon}. Del segundo al cuarto puesto quedaron ` +
      `${listaY(dM.slice(1, 4).map(r => `${r.mostrar}, con ${n0(r.cantidad)}`))}. Los diez primeros suman ${n0(sumM)} inscripciones, ` +
      `${sumM > sumF ? "más" : "menos"} que los diez primeros nombres de nena: ` +
      `${sumM > sumF ? "los nombres de varón se concentran más en pocos nombres" : "los nombres de nena se concentran más en pocos nombres"}.` +
      (nac.anio_ult === cu.nom_anio ? ` Para tener una escala, ese año las estadísticas vitales registraron ${n0(nac.n_ult)} nacimientos en todo el país.` : "");
    // 5. año por año: los primeros de cada año, en tramos seguidos
    const tramos = s => cu.nom_primeros.reduce((t, f) => { const n = s === "F" ? f[1] : f[2], u = t.at(-1); if (u && u.n === n) u.fin = f[0]; else t.push({n, ini: f[0], fin: f[0]}); return t; }, []);
    const rango = t => t.ini === t.fin ? `en ${t.ini}` : `de ${t.ini} a ${t.fin}`, tF = tramos("F"), tM = tramos("M"), nA = cu.nom_primeros.length;
    const s6 = (tM.length === 1 ? `${tM[0].n} fue el nombre más inscripto para los varones en los ${nA} años de la serie, de ${cu.nom_ini} a ${cu.nom_anio}. ` :
      `Para los varones, el primer puesto fue de ${listaY(tM.map(t => `${t.n} ${rango(t)}`))}. `) +
      `Para las nenas cambió más: fue de ${listaY(tF.map(t => `${t.n} ${rango(t)}`))}. ` +
      "Un nombre que llega al primer puesto suele quedarse varios años: las modas de los nombres cambian despacio.";
    // 6. los nombres compartidos
    const s5 = (todas.length ? `${listaY(todas.map(r => r.nombre))} ${todas.length === 1 ? "está" : "están"} entre los diez más elegidos en las ${cods.length} jurisdicciones. ` :
      `El nombre que más se repite es ${rep[0].nombre}, entre los diez más elegidos de ${rep[0].n} jurisdicciones. `) +
      `Le siguen ${listaY(rep.filter(r => r.n < (todas.length ? cods.length : rep[0].n + 1)).slice(todas.length ? 0 : 1, todas.length ? 3 : 4).map(r => `${r.nombre}, en ${r.n}`))}. En el otro extremo, ${unaSola.length} nombres aparecen entre los diez primeros de una sola jurisdicción, como ${listaY(unaSola.slice(0, 3).map(r => r.nombre))}. ` +
      "En las provincias chicas alcanzan pocas inscripciones para entrar en la lista, y ahí aparecen los nombres más locales.";
    const sintesis = [`${cu.varon} ${yE(cu.nena)} fueron los nombres más inscriptos del país en ${cu.nom_anio}.`,
      `${cu.varon} ganó en ${nM} jurisdicciones ${yE(cu.nena)}, en ${nF}.`,
      `Entre las ${filas.length} jurisdicciones, los más elegidos son ${distintos} nombres distintos.`,
      `${unaSola.length} nombres aparecen entre los diez primeros de una sola jurisdicción.`,
      tM.length === 1 ? `${tM[0].n} fue el primero de los varones en los ${nA} años desde ${cu.nom_ini}, y las nenas tuvieron ${tF.length} nombres distintos en el primer puesto.` :
        `Desde ${cu.nom_ini}, el primer puesto cambió ${tM.length - 1} veces en los varones y ${tF.length - 1} en las nenas.`];
    const tabla = tablaDatos(filas.map(f => ({codigo_indec: f.codigo_indec, territorio: f.territorio, "nombre_de_nena": f.nena, "nombre_de_varón": f.varon})), "a-nombres-provincias")
      .replace('aria-label="Tabla: Datos"', 'aria-label="Tabla: el nombre más elegido en cada provincia"').replace(">Datos</caption>", ">El nombre más elegido en cada provincia</caption>");
    const lim = ["Son las inscripciones de nombres de pila en el RENAPER de cada año: cuentan cuántas veces se eligió cada nombre, no cuántas personas viven con ese nombre.",
      "En las provincias chicas, pocas inscripciones alcanzan para cambiar el primer puesto: dos nombres pueden quedar casi empatados.",
      "Los nombres que se escriben de dos formas cuentan por separado, como dos nombres distintos.",
      "Los nombres que caen fuera de los diez primeros de un año no tienen dato ese año: en el gráfico de cada año, la línea se corta.",
      "Las inscripciones del RENAPER y los nacimientos de las estadísticas vitales son registros distintos y no tienen por qué coincidir.",
      `La serie del país empieza en ${cu.nom_ini}: las modas de antes no se ven acá.`];
    const notas = [`Nombres: RENAPER, los diez nombres más inscriptos de cada sexo en cada provincia y en el país, ${cu.nom_anio}.`,
      "Nacimientos: estadísticas vitales de la DEIS, Ministerio de Salud."];
    return {respuesta, bajada, contexto, medimos, sintesis, lim, notas, secciones: [
      {preg: "¿Cuál es el nombre más elegido en cada provincia?", tit: `${cu.varon} es el más elegido para los varones en ${nM} de las ${filas.length} jurisdicciones`,
        html: `<div class="nota-tabla">${tabla}</div>`, pie: `Último año publicado: ${cu.nom_anio}. Ordenadas por nombre.`, txt: [s1]},
      {preg: "¿En cuántas jurisdicciones gana cada nombre?", g: "nombres-ganan", forma: "barras",
        tit: `Entre las ${filas.length} jurisdicciones, los más elegidos son ${distintos} nombres distintos`,
        pie: `Cantidad de jurisdicciones en las que cada nombre fue el más inscripto en ${cu.nom_anio}.`, txt: [s2]},
      {preg: "¿Cuáles son los diez nombres más elegidos para las nenas?", g: "nombres-nenas", forma: "barras",
        tit: `${cu.nena} fue el nombre de ${n0(cu.nena_n)} nenas`,
        pie: `Inscripciones de cada nombre en todo el país, ${cu.nom_anio}.`, txt: [s3]},
      {preg: "¿Y para los varones?", g: "nombres-varones", forma: "barras",
        tit: `${cu.varon} fue el nombre de ${n0(cu.varon_n)} varones`,
        pie: `Inscripciones de cada nombre en todo el país, ${cu.nom_anio}.`, txt: [s4]},
      {preg: `¿Cómo cambiaron los nombres más elegidos desde ${cu.nom_ini}?`, g: "nombres-anios", forma: "lineas",
        tit: tM.length === 1 ? `${tM[0].n} fue el primero de los varones en todos los años, y las nenas tuvieron ${tF.length} nombres distintos en el primer puesto` :
          `El primer puesto cambió ${tM.length - 1} veces en los varones y ${tF.length - 1} en las nenas`,
        pie: `Inscripciones de cada año en todo el país. Los tres nombres de nena más elegidos de ${cu.nom_anio} y el primero de ${cu.nom_ini}. La línea se corta en los años en que el nombre no estuvo entre los diez primeros.`, txt: [s6]},
      {preg: "¿Qué nombres se eligen en más provincias?", g: "nombres-repetidos", forma: "barras",
        tit: `${rep[0].nombre} está entre los diez más elegidos de ${rep[0].n} jurisdicciones`,
        pie: `Cantidad de jurisdicciones en las que cada nombre está entre los diez más inscriptos de su sexo, ${cu.nom_anio}. Los 12 que más se repiten.`, txt: [s5]},
    ]};
  },
  dib: {
    "nombres-ganan": (el, a) => {
      const N = T.nombres_top, cods = Object.keys(NOMBRES), cuenta = {};
      cods.forEach(c => ["F", "M"].forEach(s => {
        const p = N.filter(r => r.codigo_indec === c && r.sexo === s).sort((x, y) => y.cantidad - x.cantidad)[0];
        if (p) (cuenta[p.mostrar + "|" + s] ||= {codigo_indec: p.mostrar + s, territorio: `${p.mostrar} (${s === "F" ? "nena" : "varón"})`, n: 0}).n++;
      }));
      barrasH(el, {anim: a, data: Object.values(cuenta), k: "n", vf: n0, af: n0, l: 170, lAngosto: 140, cambiaConProv: true,
        tip: d => `<b>${d.territorio}</b><br>El más elegido en ${d.n} ${d.n === 1 ? "jurisdicción" : "jurisdicciones"}`});
    },
    "nombres-nenas": (el, a) => barrasH(el, {anim: a, k: "cantidad", vf: n0, af: n0, l: 150, lAngosto: 128,
      data: T.nombres_top.filter(r => r.codigo_indec === "00" && r.sexo === "F").sort((p, q) => q.cantidad - p.cantidad).slice(0, 10)
        .map(r => ({...r, codigo_indec: "F-" + r.nombre, territorio: r.mostrar})), tip: d => `<b>${d.territorio}</b><br>${n0(d.cantidad)} inscripciones`}),
    "nombres-varones": (el, a) => barrasH(el, {anim: a, k: "cantidad", vf: n0, af: n0, l: 150, lAngosto: 128,
      data: T.nombres_top.filter(r => r.codigo_indec === "00" && r.sexo === "M").sort((p, q) => q.cantidad - p.cantidad).slice(0, 10)
        .map(r => ({...r, codigo_indec: "M-" + r.nombre, territorio: r.mostrar})), tip: d => `<b>${d.territorio}</b><br>${n0(d.cantidad)} inscripciones`}),
    "nombres-anios": (el, a) => {
      // las tres nenas más elegidas del último año y la primera del primer año, una columna por nombre y una fila por año
      const S = T.nombres_serie.filter(r => r.sexo === "F"), anios = [...new Set(S.map(r => r.anio))].sort();
      const ult = S.filter(r => r.anio === anios.at(-1)).sort((p, q) => q.cantidad - p.cantidad).slice(0, 3).map(r => r.mostrar);
      const pri = S.filter(r => r.anio === anios[0]).sort((p, q) => q.cantidad - p.cantidad)[0].mostrar;
      const noms = [...new Set([...ult, pri])], cols = [NAR, FRI, css("--azul-hondo"), css("--sol-borde")];
      const data = anios.map(an => Object.fromEntries([["anio", an], ...noms.map(n => [n, S.find(r => r.anio === an && r.mostrar === n)?.cantidad ?? null])]));
      return lineas(el, {anim: a, x: "anio", y0: 0, vf: n0, yf: ejeMil, huecos: true, data, series: noms.map((n, i) => ({k: n, lab: n, c: cols[i]}))});
    },
    "nombres-repetidos": (el, a) => {
      const en = {};
      T.nombres_top.filter(r => r.codigo_indec !== "00").forEach(r => { (en[r.mostrar + "|" + r.sexo] ||= {codigo_indec: r.mostrar + r.sexo, territorio: `${r.mostrar} (${r.sexo === "F" ? "nena" : "varón"})`, n: 0}).n++; });
      return barrasH(el, {anim: a, data: Object.values(en).sort((p, q) => q.n - p.n).slice(0, 12), k: "n", vf: n0, af: n0, l: 170, lAngosto: 140,
        tip: d => `<b>${d.territorio}</b><br>Entre los diez primeros de ${d.n} ${d.n === 1 ? "jurisdicción" : "jurisdicciones"}`});
    },
  },
}, {
  // etapa 5 del plan de mejora: la producción de Vaca Muerta y lo que le deja a Neuquén en regalías y empleo (auditoría de los artículos, idea 9)
  id: "a-vaca-muerta", frec: "Se actualiza cada mes", tablas: ["hidrocarburos_anual", "regalias_provincias"],
  dek: "Cuánto petróleo y cuánto gas salen de Vaca Muerta frente al resto del país, año por año, de qué cuencas sale la producción, cuánto rinde cada pozo, y cuánto pesan las regalías en los ingresos de Neuquén y de las otras provincias petroleras.",
  fichas: [["f-petroleo", "producción de petróleo"], ["f-hidro-provincias", "petróleo y gas por provincia"], ["f-regalias", "regalías"], ["f-empleo-hidro", "empleo en petróleo y gas"]],
  csv: [["hidrocarburos_anual", "Descargar CSV de la producción por año"], ["regalias_provincias", "Descargar CSV de las regalías"]],
  fuentes: "Secretaría de Energía, producción de petróleo y gas por pozo (capítulo IV), datos de fractura y regalías, Ministerio de Economía, esquema " +
    "ahorro-inversión-financiamiento de cada provincia, y Secretaría de Trabajo, SIPA",
  texto: () => {
    const P = PG, H = T.hidrocarburos_anual.filter(r => r.anio <= P.anio_ult), h0 = H[0], hU = H.at(-1), CU = P.cuencas_pet;
    const respuesta = `${n0(P.vm_kbd)} mil barriles de petróleo por día, el ${pct(P.vm_pct)} del país, entre ${P.v_desde} y ${P.v_hasta}.`;
    const bajada = `En los mismos meses, ${P.top} produjo ${n0(P.top_kbd)} mil barriles por día. Diez años antes, entre ${P.v10_desde} y ${P.v10_hasta}, ` +
      `${n0(P.top_antes)} mil. ` + (P.reg_top === P.top ? `Para la provincia, las regalías fueron el ${pct(P.reg_top_pct)} de todos sus ingresos en ${P.reg_anio}.` : "");
    const contexto = "Vaca Muerta es una formación de roca de la cuenca neuquina, sobre todo en Neuquén, con petróleo y gas que no salen solos: se " +
      "extraen con pozos horizontales y fractura hidráulica, lo que se llama producción no convencional, o shale. Empezó a producir en escala en la " +
      "década de 2010. Cambió la producción del país, que venía cayendo, y la economía de la provincia donde está.";
    const medimos = ["La producción de petróleo se mide en miles de barriles por día, el promedio de cada año. Un barril tiene casi 159 litros. El gas " +
      "se mide en millones de metros cúbicos por día.",
      "Las regalías son lo que la provincia cobra por lo que se extrae de su suelo: un porcentaje del valor del petróleo y el gas en boca de pozo."];
    // 1. el petróleo
    const ini = h0.pct_pet_nc < .5 ? "menos del 1%" : pct(h0.pct_pet_nc);
    const s1 = `En ${P.anio_ult}, el petróleo no convencional fue el ${pct(P.pct_nc_ult)} de la producción del país. En ${h0.anio}, ${ini}. ` +
      `La producción total pasó de ${n0(P.kbd_ini)} mil barriles por día en ${P.anio_ini} a ${n0(P.kbd_ult)} mil en ${P.anio_ult}, con su mínimo en ${P.anio_min}: ${n0(P.kbd_min)} mil. ` +
      `El convencional, en cambio, bajó de ${n0(h0.pet_conv)} a ${n0(hU.pet_conv)} mil barriles por día.` +
      (P.record ? ` En ${P.mes}, el país produjo ${n0(P.kbd)} mil barriles por día, el máximo de la serie.` : "") +
      ` Entre enero y ${MESES[P.ytd.pet.mes - 1]} de ${P.ytd.pet.anio}, la producción de petróleo ${cambioPct(P.ytd.pet.var)} frente a los mismos meses del año anterior.`;
    // 2. el gas
    const s2 = `Con el gas pasó algo parecido. En ${P.anio_ult}, el no convencional fue el ${pct(P.pct_gas_nc_ult)} del gas del país. La producción total ` +
      `fue de ${n1(P.gas_ult)} millones de metros cúbicos por día, frente a ${n1(P.gas_ini)} en ${P.anio_ini}, con su mínimo en ${P.anio_min_gas}: ${n1(P.gas_min)}. ` +
      `El gas no convencional reemplazó al que se dejaba de sacar de los yacimientos viejos. Entre enero y ${MESES[P.ytd.gas.mes - 1]} de ${P.ytd.gas.anio}, ` +
      `la producción de gas ${cambioPct(P.ytd.gas.var)} frente a los mismos meses del año anterior.`;
    // 3. las cuencas
    const s3 = `En ${P.mes}, la cuenca neuquina, donde está Vaca Muerta, dio el ${pct(CU.neuquina)} del petróleo del país y el ${pct(P.cuencas_gas.neuquina)} del gas. ` +
      `La del golfo San Jorge, entre Chubut y Santa Cruz, la cuenca petrolera más importante durante décadas, dio el ${pct(CU.gsj)} del petróleo. ` +
      `${P.segundo}, la segunda provincia productora, pasó de ${n0(P.segundo_antes)} a ${n0(P.segundo_kbd)} mil barriles por día en diez años.`;
    // 4. lo que rinde cada pozo
    const s4 = `En ${P.pozos_mes} había ${n0(P.pozos)} pozos de petróleo en producción. Los de shale eran el ${pct(P.pct_pozos_shale)} de los pozos y dieron el ` +
      `${pct(P.pct_pet_shale_pozos)} del petróleo: un pozo de shale produjo en promedio ${n0(P.bpd_shale)} barriles por día, y uno convencional, ${n1(P.bpd_conv)}. ` +
      `En ${P.fr_ult} se hicieron ${n0(P.fr_etapas)} etapas de fractura, ${P.fr_veces} veces las de ${P.fr_ini}, y el ${pct(P.fr_vm_pct)} fueron en Vaca Muerta. ` +
      `En Vaca Muerta, los pozos fracturados en ${P.fr_ult} llevaron en promedio ${n1(P.dv_etapas_ult)} etapas y una rama horizontal de ${n0(P.dv_rama_ult)} metros, frente a ` +
      `${n1(P.dv_etapas_ini)} etapas y ${n0(P.dv_rama_ini)} metros en ${P.dv_ini}. La empresa que más petróleo produce es ${P.emp_top}, con el ${pct(P.emp_top_pct)}.`;
    // 5. las regalías en los ingresos
    const s5 = `En ${P.reg_anio}, las regalías fueron el 10% o más de los ingresos totales en ${P.reg_n_10} provincias, y la parte más alta fue la de ${P.reg_top}: ` +
      `${pct(P.reg_top_pct)}. La provincia recibe además ingresos brutos por la actividad, que no se cuentan como regalías. ` +
      `${CN.pet_emp_top} es la provincia con más puestos asalariados registrados en la extracción de petróleo y gas y sus servicios: ${n0(CN.pet_emp_top_v)} en el ${CN.emp_trim}.`;
    // 6. por habitante
    const RG = T.regalias_provincias.filter(r => r.usd_crudo_hab > 0).sort((a, b) => b.usd_crudo_hab - a.usd_crudo_hab);
    const s6 = `Las regalías de petróleo crudo equivalieron a ${n0(P.reg_usd_top_hab)} dólares por habitante en ${P.reg_usd_top}. Le siguen ` +
      `${listaY(RG.filter(r => r.territorio !== P.reg_usd_top).slice(0, 2).map(r => `${r.territorio}, con ${n0(r.usd_crudo_hab)}`))}. ` +
      "Por habitante, una provincia con poca población y mucha producción recibe mucho más que una grande. " +
      `En total, las regalías de petróleo crudo de ${RG[0].territorio} fueron ${n0(RG[0].usd_crudo_millones)} millones de dólares.`;
    const sintesis = [`Entre ${P.v_desde} y ${P.v_hasta}, Vaca Muerta dio ${n0(P.vm_kbd)} mil barriles de petróleo por día, el ${pct(P.vm_pct)} del país.`,
      `En ${P.anio_ult}, el no convencional fue el ${pct(P.pct_nc_ult)} del petróleo y el ${pct(P.pct_gas_nc_ult)} del gas.`,
      `Un pozo de shale produjo en promedio ${n0(P.bpd_shale)} barriles por día, y uno convencional, ${n1(P.bpd_conv)}.`,
      `En ${P.reg_top}, las regalías fueron el ${pct(P.reg_top_pct)} de los ingresos en ${P.reg_anio}.`];
    const lim = ["El petróleo no convencional es casi todo de Vaca Muerta, pero no todo: una parte es tight, de otras formaciones.",
      "Las regalías cambian con la producción, con el precio internacional y con el tipo de cambio.",
      "La producción de un pozo de shale cae rápido en sus primeros años: el promedio por pozo mezcla pozos nuevos y viejos.",
      "Las regalías de los yacimientos del mar son del Estado nacional, no de las provincias.",
      "El empleo registrado se cuenta en la provincia donde la empresa declara a sus trabajadores, que puede no ser la del yacimiento."];
    const notas = ["Producción: Secretaría de Energía, producción por pozo (capítulo IV), promedio de cada año completo. Shale y tight según el tipo de recurso declarado de cada pozo.",
      "Pozos y fractura: pozos con producción de petróleo en el mes y etapas de fractura informadas a la Secretaría de Energía.",
      `Regalías: esquema ahorro-inversión-financiamiento de cada provincia (Ministerio de Economía), % de los ingresos totales, ${P.reg_anio_txt}. En dólares, las de petróleo crudo de la Secretaría de Energía, por habitante con las proyecciones del INDEC.`];
    return {respuesta, bajada, contexto, medimos, sintesis, lim, notas, secciones: [
      {preg: "¿Cuánto petróleo sale de Vaca Muerta?", g: "vm-produccion", forma: "lineas",
        tit: `En ${P.anio_ult}, el no convencional fue el ${pct(P.pct_nc_ult)} del petróleo del país`,
        pie: "Miles de barriles por día, promedio de cada año. Shale: no convencional de formaciones como Vaca Muerta. Tight: no convencional de otras arenas.", txt: [s1]},
      {preg: "¿Y cuánto gas?", g: "vm-gas", forma: "lineas",
        tit: `En ${P.anio_ult}, el no convencional fue el ${pct(P.pct_gas_nc_ult)} del gas del país`,
        pie: "Millones de metros cúbicos por día, promedio de cada año.", txt: [s2]},
      {preg: "¿De qué cuencas sale el petróleo?", g: "vm-cuencas", forma: "barras",
        tit: `En ${P.mes}, la cuenca neuquina dio el ${pct(CU.neuquina)} del petróleo del país`,
        pie: `% de la producción de petróleo del país, ${P.mes}.`, txt: [s3]},
      {preg: "¿Cuánto rinde un pozo de Vaca Muerta?", g: "vm-pozos", forma: "barras",
        tit: `Un pozo de shale produjo ${P.veces} veces lo que uno convencional`,
        pie: `Barriles de petróleo por día por pozo en producción, promedio de ${P.pozos_mes}.`, txt: [s4]},
      {preg: "¿Cuánto pesan las regalías en cada provincia?", g: "vm-regalias", forma: "barras",
        tit: `En ${P.reg_top}, las regalías fueron el ${pct(P.reg_top_pct)} de los ingresos`,
        pie: `% de los ingresos totales de cada provincia, ${P.reg_anio_txt}. Solo las provincias con regalías.`, txt: [s5]},
      {preg: "¿Y por habitante?", g: "vm-regalias-hab", forma: "barras",
        tit: `Las regalías de petróleo de ${P.reg_usd_top} fueron ${n0(P.reg_usd_top_hab)} dólares por habitante`,
        pie: "Regalías de petróleo crudo, dólares por habitante. Solo las provincias con regalías de petróleo.", txt: [s6]},
    ]};
  },
  dib: {
    "vm-produccion": (el, a) => lineas(el, {anim: a, data: T.hidrocarburos_anual.filter(r => r.anio <= PG.anio_ult), x: "anio", y0: 0, vf: n0, yf: n0,
      series: [{k: "pet_conv", lab: "Convencional", c: COL_TIPO.conv}, {k: "pet_shale", lab: "Shale", c: COL_TIPO.shale}, {k: "pet_tight", lab: "Tight", c: COL_TIPO.tight}]}),
    "vm-gas": (el, a) => lineas(el, {anim: a, data: T.hidrocarburos_anual.filter(r => r.anio <= PG.anio_ult), x: "anio", y0: 0, vf: n1, yf: n0,
      series: [{k: "gas_conv", lab: "Convencional", c: COL_TIPO.conv}, {k: "gas_shale", lab: "Shale", c: COL_TIPO.shale}, {k: "gas_tight", lab: "Tight", c: COL_TIPO.tight}]}),
    "vm-cuencas": (el, a) => {
      const NOM = {neuquina: "Neuquina", gsj: "Golfo San Jorge", austral: "Austral", cuyana: "Cuyana", noroeste: "Noroeste"};
      return barrasH(el, {anim: a, k: "v", vf: pct, af: v => n0(v) + "%", l: 170, lAngosto: 140,
        data: Object.entries(PG.cuencas_pet).map(([k, v]) => ({codigo_indec: k, territorio: NOM[k] || k, v})), tip: d => `<b>${d.territorio}</b><br>${pct(d.v)} del petróleo del país`});
    },
    "vm-pozos": (el, a) => barrasH(el, {anim: a, k: "v", vf: v => v >= 100 ? n0(v) : n1(v), af: n0, l: 170, lAngosto: 140,
      data: [{codigo_indec: "shale", territorio: "Pozo de shale", v: PG.bpd_shale}, {codigo_indec: "conv", territorio: "Pozo convencional", v: PG.bpd_conv}],
      color: d => d.codigo_indec === "shale" ? COL_TIPO.shale : COL_TIPO.conv, tip: d => `<b>${d.territorio}</b><br>${n1(d.v)} barriles por día`}),
    "vm-regalias": (el, a) => barrasH(el, {anim: a, data: T.regalias_provincias.filter(r => r.pct_regalias > 0).map(r => PG.reg_atrasadas[r.territorio] ? {...r, territorio: `${r.territorio} (${r.anio_aif})`} : r),
      k: "pct_regalias", vf: pct, af: v => n0(v) + "%", tip: d => `<b>${d.territorio}</b><br>Regalías: ${pct(d.pct_regalias)} de los ingresos en ${d.anio_aif}`}),
    "vm-regalias-hab": (el, a) => barrasH(el, {anim: a, data: T.regalias_provincias.filter(r => r.usd_crudo_hab > 0), k: "usd_crudo_hab", vf: n0, af: n0,
      tip: d => `<b>${d.territorio}</b><br>${n0(d.usd_crudo_hab)} dólares por habitante<br>${n1(d.usd_crudo_millones)} millones de dólares en total`}),
  },
}, {
  // etapa 5 del plan de mejora: a qué provincias se muda la gente de otras provincias, con el último censo (auditoría de los artículos, idea 8)
  id: "a-migracion-interna", frec: "Se actualiza con cada censo", tablas: ["cruces_provincias", "nacidos_otro_pais_provincias", "migraciones_departamentos"],
  dek: "Qué parte de quienes viven en cada provincia nació en otra, según el último censo, cuántas personas son, en qué departamentos son más de la mitad, cuántos nacieron en otro país y si alquilan más hogares y se gana más donde más gente llegó de otra provincia.",
  fichas: [["f-migracion-interna", "migración interna"], ["f-nacidos-otro-pais", "nacidos en otro país"], ["f-vivienda", "vivienda"]],
  csv: [["cruces_provincias", "Descargar CSV por provincia"], ["nacidos_otro_pais_provincias", "Descargar CSV del lugar de nacimiento por provincia"],
    ["migraciones_departamentos", "Descargar CSV por departamento"]],
  fuentes: "INDEC, Censo Nacional de Población, Hogares y Viviendas, lugar de nacimiento y tenencia de la vivienda, y Secretaría de Trabajo, " +
    "remuneración de los asalariados registrados del sector privado (SIPA)",
  texto: () => {
    const M = R.migraciones.censo, Dp = R.migraciones.departamentos, F = T.cruces_provincias.filter(r => r.otra_provincia != null);
    const L = T.nacidos_otro_pais_provincias.filter(r => r.codigo_indec !== "00"), mil = v => v >= 1e6 ? `${n2(v / 1e6)} millones` : `${n0(v / 1e3)} mil`;
    const ord = [...F].sort((a, b) => b.otra_provincia - a.otra_provincia), top = ord.slice(0, 3), anio = META_CX.otra_provincia.periodo;
    const respuesta = `A ${listaY(top.map(r => r.territorio))}: en ${top[0].territorio}, ${pct(top[0].otra_provincia)} de quienes viven nacieron en otra provincia.`;
    const bajada = `En todo el país, el ${pct(M.otra_pct)} de las personas vive en una provincia distinta de la que nació, según el censo de ${anio}: ` +
      `${n0(M.otra_personas)} personas. La parte más baja es la de ${listaY(M.otra_bajos[0])}, el ${pct(M.otra_bajos[1])}.`;
    const contexto = "La gente se muda de provincia para trabajar, para estudiar, para acompañar a su familia o para vivir más barato. A lo largo del " +
      "siglo veinte, muchas personas del interior se mudaron a la zona de Buenos Aires, y en las últimas décadas crecieron sobre todo las provincias " +
      "de la Patagonia, con el petróleo y el turismo. Este artículo mira dónde viven hoy quienes nacieron en otra provincia. " +
      "También hay mudanzas dentro de cada provincia, del campo a la ciudad o de un pueblo a la capital, que este dato no ve.";
    const medimos = ["El censo pregunta a cada persona dónde nació. Quien vive en una provincia distinta de la de su nacimiento se mudó alguna vez, " +
      "aunque el censo no dice cuándo. Por eso este dato no mide los movimientos de un año, sino lo que se acumuló en la vida de las personas que " +
      "viven hoy en cada provincia: llegadas de hace décadas y de hace meses.",
      "Nacido en otro país es quien nació fuera de la Argentina, sin importar su nacionalidad de hoy. Los hijos de quienes llegaron de otro país, " +
      "nacidos acá, cuentan como nacidos en la Argentina."];
    // 1. la parte de cada provincia
    const seis = ord.slice(0, 6), pat = seis.filter(r => r.region === "Patagonia").length;
    const s1 = (pat >= 3 ? `${pat} de las 6 provincias con más personas nacidas en otra son de la Patagonia. ` : "") +
      (top[0].otra_provincia > 50 ? `En ${top[0].territorio}, más de la mitad de quienes viven nació en otra provincia. ` : "") +
      (M.otra_bajos[1] < 10 ? `En el otro extremo, en ${listaY(M.otra_bajos[0])}, menos de una persona de cada diez. ` : "") +
      `La mediana de las 24 jurisdicciones es del ${pct(d3.median(F, r => r.otra_provincia))}.`;
    // 2. en cantidad
    const porN = [...L].sort((a, b) => b.en_otra_provincia - a.en_otra_provincia), t3 = porN.slice(0, 3), s3n = d3.sum(t3, r => r.en_otra_provincia);
    const s2 = `En cantidad, el orden cambia: ${listaY(t3.map(r => `${r.territorio}, con ${mil(r.en_otra_provincia)}`))} son las jurisdicciones con más personas ` +
      `nacidas en otra provincia. Las tres juntas suman el ${pct(s3n / M.otra_personas * 100)} de todas. Una provincia grande puede recibir mucha gente ` +
      `y que igual sea una parte chica de su población. La que menos personas nacidas en otra provincia tiene es ${porN.at(-1).territorio}, con ${mil(porN.at(-1).en_otra_provincia)}.`;
    // 3. los departamentos
    const s3 = `En ${Dp.otra_mitad} departamentos, más de la mitad de quienes viven nacieron en otra provincia. Los de la parte más alta son ` +
      `${listaY(Dp.otra_top.map(([d, p, v]) => `${d} (${p}), con ${pct(v)}`))}.`;
    // 4. nacidos en otro país
    const ext = [...L].sort((a, b) => b.pct_otro_pais - a.pct_otro_pais), dos = ext.slice(0, 2);
    const s4 = `En todo el país, el ${pct(M.pct)} de las personas nació en otro país: ${n0(M.personas)}. La parte más alta es la de ${dos[0].territorio}, ${pct(dos[0].pct_otro_pais)}, seguida por ${dos[1].territorio}, ${pct(dos[1].pct_otro_pais)}. ` +
      `El ${pct(M.limitrofes_pct)} de quienes nacieron en otro país vino de un país limítrofe, y el primero es ${M.paises[0][0]}, con el ${pct(M.paises[0][2])}. Le siguen ` +
      `${M.paises[1][0]}, con el ${pct(M.paises[1][2])}, y ${M.paises[2][0]}, con el ${pct(M.paises[2][2])}. ${M.primer_pais_mas[0][0]} es el primer país de origen en ` +
      `${M.primer_pais_mas[0][1]} jurisdicciones, ${M.primer_pais_mas[1][0]} en ${M.primer_pais_mas[1][1]} y ${M.primer_pais_mas[2][0]} en ${M.primer_pais_mas[2][1]}. ` +
      `En ${R.migraciones.historia.ini}, el primer censo, era del ${pct(R.migraciones.historia.ini_pct)}, y en ${R.migraciones.historia.max_anio}, el más alto, del ${pct(R.migraciones.historia.max_pct)}.`;
    // 5. el alquiler
    const c = calcularArt({tabla: "cruces_provincias"}, {x: "otra_provincia", y: "alquila"});
    const s5 = `${c.rs <= -.2 ? "No: la relación va en sentido contrario." : respuestaR(c.rs)} ` +
      `En las ${c.h} jurisdicciones con más personas nacidas en otra provincia, la mediana de hogares que alquilan es ${pct(c.medMas)}. En las ${c.h} con menos, ${pct(c.medMenos)}. ` +
      "Puede que quien llega de otra provincia alquile al principio, pero estos datos no dicen si son ellos los que alquilan. " +
      `La que más se aparta de la tendencia es ${c.lejos.territorio}, con ${pct(c.lejos.otra_provincia)} de nacidos en otra provincia y ${pct(c.lejos.alquila)} de hogares que alquilan.`;
    // 6. el salario
    const w = calcularArt({tabla: "cruces_provincias"}, {x: "salario", y: "otra_provincia"});
    const s6 = `${w.rs <= -.2 ? "No: la relación va en sentido contrario." : respuestaR(w.rs)} En las ${w.h} jurisdicciones con el salario privado registrado más alto, ` +
      `la mediana de personas nacidas en otra provincia es del ${pct(w.medMas)}. En las ${w.h} con el más bajo, del ${pct(w.medMenos)}. Que vayan juntos no quiere decir ` +
      "que uno cause el otro: los salarios son de hoy y las mudanzas, de toda la vida de las personas. " +
      `La que más se aparta de la tendencia es ${w.lejos.territorio}, con ${pct(w.lejos.otra_provincia)} de personas nacidas en otra provincia.`;
    const sintesis = [`El ${pct(M.otra_pct)} de las personas vive en una provincia distinta de la que nació: ${n0(M.otra_personas)}.`,
      `La parte más alta es la de ${top[0].territorio}, ${pct(top[0].otra_provincia)}, y en cantidad, ${porN[0].territorio}, con ${mil(porN[0].en_otra_provincia)}.`,
      `En ${Dp.otra_mitad} departamentos, más de la mitad de quienes viven nacieron en otra provincia.`,
      `Más personas nacidas en otra provincia y un salario más alto: una relación ${fuerza(w.rs)} entre las jurisdicciones.`];
    const lim = ["Una persona nacida en CABA que vive en el Gran Buenos Aires cuenta como nacida en otra provincia, aunque se haya mudado a pocas cuadras.",
      "Estos datos no dicen de qué provincia llegó cada persona ni cuándo. Los hijos de quienes llegaron, nacidos ya en la provincia, cuentan como nacidos ahí.",
      "El censo cuenta a cada persona donde vive el día del censo: quien pasa parte del año en otra provincia, como quien trabaja por temporada, cuenta en una sola.",
      "Las relaciones con el alquiler y el salario son entre provincias, no entre personas: no dicen que quienes llegaron alquilen más o ganen más que quienes nacieron ahí.",
      ...[c, w].filter(x => Math.abs(x.rs) < .4).slice(0, 1).map(x => `Con ${x.n} jurisdicciones y relaciones de esta fuerza, la diferencia entre las dos mitades puede ser casualidad.`)];
    const notas = [`Lugar de nacimiento: INDEC, Censo ${anio}, población en viviendas particulares.`,
      `Departamentos: los de ${n0(Dp.min_pob)} habitantes o más.`,
      `Salario: remuneración promedio de los asalariados registrados del sector privado (SIPA), ${META_CX.salario.periodo}.`,
      `Las relaciones se miden con la correlación de Spearman, de menos 1 a 1: ${rTxt(c.rs)} con el alquiler y ${rTxt(w.rs)} con el salario.`];
    return {respuesta, bajada, contexto, medimos, sintesis, lim, notas, secciones: [
      {preg: "¿En qué provincias vive más gente nacida en otra?", g: "migra-provincias", forma: "barras",
        tit: `En ${top[0].territorio}, ${pct(top[0].otra_provincia)} de quienes viven nacieron en otra provincia`,
        pie: `% de la población en viviendas particulares de cada jurisdicción, censo de ${anio}. La línea marca el total del país.`, txt: [s1]},
      {preg: "¿Y en cantidad de personas?", g: "migra-cantidad", forma: "barras",
        tit: `${porN[0].territorio} es donde viven más personas nacidas en otra provincia: ${mil(porN[0].en_otra_provincia)}`,
        pie: `Miles de personas nacidas en otra provincia, censo de ${anio}.`, txt: [s2]},
      {preg: "¿En qué departamentos son más de la mitad?", g: "migra-departamentos", forma: "barras",
        tit: `En ${Dp.otra_mitad} departamentos, más de la mitad nació en otra provincia`,
        pie: `Los 15 departamentos con la parte más alta, % de la población, censo de ${anio}. Solo los de ${n0(Dp.min_pob)} habitantes o más.`, txt: [s3]},
      {preg: "¿Y quienes nacieron en otro país?", g: "migra-otro-pais", forma: "barras",
        tit: `El ${pct(M.pct)} de las personas nació en otro país`,
        pie: `% de la población en viviendas particulares, censo de ${anio}. La línea marca el total del país.`, txt: [s4]},
      {preg: "¿Alquilan más hogares donde más gente llegó de otra provincia?", g: "migra-alquiler", forma: "puntos",
        tit: `Nacidos en otra provincia y hogares que alquilan: una relación ${fuerza(c.rs)}`,
        pie: "Cada punto es una jurisdicción. Nacidos en otra provincia: % de la población. Alquilan: % de los hogares. La línea punteada muestra la tendencia.", txt: [s5]},
      {preg: "¿Vive más gente de otras provincias donde se gana más?", g: "migra-salario", forma: "puntos",
        tit: `Salario y nacidos en otra provincia: una relación ${fuerza(w.rs)}`,
        pie: `Cada punto es una jurisdicción. Salario: pesos por mes, ${META_CX.salario.periodo}. Nacidos en otra provincia: % de la población, ${anio}. La línea punteada muestra la tendencia.`, txt: [s6]},
    ]};
  },
  dib: {
    "migra-provincias": (el, a) => barrasH(el, {anim: a, data: T.cruces_provincias.filter(r => r.otra_provincia != null), k: "otra_provincia", vf: pct, af: v => n0(v) + "%",
      ref: R.migraciones.censo.otra_pct, refLab: `País ${pct(R.migraciones.censo.otra_pct)}`, tip: d => `<b>${d.territorio}</b><br>${pct(d.otra_provincia)} nació en otra provincia`}),
    "migra-cantidad": (el, a) => barrasH(el, {anim: a, data: T.nacidos_otro_pais_provincias.filter(r => r.codigo_indec !== "00"), k: "en_otra_provincia",
      vf: v => n0(v / 1e3) + " mil", af: ejeMil, tip: d => `<b>${d.territorio}</b><br>${n0(d.en_otra_provincia)} personas nacidas en otra provincia`}),
    "migra-departamentos": (el, a) => {
      const data = T.migraciones_departamentos.filter(r => r.poblacion_vp >= R.migraciones.departamentos.min_pob).sort((p, q) => q.pct_otra_provincia - p.pct_otra_provincia)
        .slice(0, 15).map(r => ({...r, codigo_indec: r.codigo_dep, territorio: `${r.departamento} (${NOMBRES[r.codigo_indec] || r.codigo_indec})`}));
      return barrasH(el, {anim: a, data, k: "pct_otra_provincia", vf: pct, af: v => n0(v) + "%", l: 230, lAngosto: 170,
        tip: d => `<b>${d.territorio}</b><br>${pct(d.pct_otra_provincia)} nació en otra provincia<br>${n0(d.poblacion_vp)} habitantes`});
    },
    "migra-otro-pais": (el, a) => barrasH(el, {anim: a, data: T.nacidos_otro_pais_provincias.filter(r => r.codigo_indec !== "00"), k: "pct_otro_pais", vf: pct, af: v => n0(v) + "%",
      ref: R.migraciones.censo.pct, refLab: `País ${pct(R.migraciones.censo.pct)}`,
      tip: d => `<b>${d.territorio}</b><br>${pct(d.pct_otro_pais)} nació en otro país<br>El primero: ${d.primer_pais}`}),
    "migra-alquiler": (el, a) => {
      const c = calcularArt({tabla: "cruces_provincias"}, {x: "otra_provincia", y: "alquila"});
      dispersion(el, {anim: a, data: c.F, x: "otra_provincia", y: "alquila", xLab: "Nacidos en otra provincia", yLab: "Hogares que alquilan",
        marcar: [c.mas, c.menos, c.lejos].map(f => f.codigo_indec), fx: v => n0(v) + "%", fy: v => n0(v) + "%", vx: v => `${pct(v)} de la población`, vy: v => `${pct(v)} de los hogares`});
    },
    "migra-salario": (el, a) => {
      const w = calcularArt({tabla: "cruces_provincias"}, {x: "salario", y: "otra_provincia"});
      dispersion(el, {anim: a, data: w.F, x: "salario", y: "otra_provincia", xLab: "Salario privado registrado", yLab: "Nacidos en otra provincia",
        marcar: [w.mas, w.menos, w.lejos].map(f => f.codigo_indec), fx: v => n1(v / 1e6) + " M", fy: v => n0(v) + "%",
        vx: v => `${n0(v)} pesos por mes`, vy: v => `${pct(v)} de la población`});
    },
  },
}, {
  // etapa 5 del plan de mejora: la fórmula más votada en cada provincia en cada vuelta presidencial desde 1983 (auditoría de los artículos,
  // idea 7). Sale del resumen de las elecciones (gan_prov, 02_procesar.py), sin bajar la tabla de los resultados
  id: "a-ganador-provincias", frec: "Se actualiza con cada elección", tablas: [],
  dek: "Qué fórmula sacó más votos en cada provincia en cada primera y segunda vuelta presidencial desde 1983, qué provincias votaron más veces como el país, con qué parte de los votos ganó cada fórmula, en cuántas provincias y cuánta gente fue a votar.",
  fichas: [["f-elecciones", "elecciones presidenciales"], ["f-congreso", "composición del Congreso"]],
  csv: [["elecciones_presidenciales", "Descargar CSV de los resultados"]],
  fuentes: "Dirección Nacional Electoral, resultados de las elecciones presidenciales por provincia",
  texto: () => {
    const E = R.elecciones.filter(e => e.vuelta >= 1), n = E.length, ini = E[0].anio, cods = Object.keys(E[0].gan_prov);
    const esp = (e, c) => e.candidatos.find(x => x.c === e.gan_prov[c])?.espacio || "Otras fuerzas";
    const coinc = c => E.filter(e => e.gan_prov[c] === e.ganador).length, nom = c => NOMBRES[c];
    const siempre = cods.filter(c => coinc(c) === n), menos = Math.min(...cods.map(coinc)), lasMenos = cods.filter(c => coinc(c) === menos);
    const fieles = d3.groups(cods.filter(c => new Set(E.map(e => esp(e, c))).size === 1), c => esp(E[0], c));
    const P1 = E.filter(e => e.vuelta === 1), primeras = P1.length, segundas = E.filter(e => e.vuelta === 2).map(e => e.anio);
    const vuelta = e => `${e.anio}${e.vuelta === 2 ? ", segunda vuelta" : ""}`;
    const respuesta = siempre.length
      ? `${listaY(siempre.map(nom))} ${siempre.length > 1 ? "votaron" : "votó"} a la fórmula más votada del país en las ${n} vueltas desde ${ini}.`
      : `Ninguna provincia votó a la fórmula más votada del país en todas las vueltas desde ${ini}.`;
    const bajada = fieles.map(([k, cs]) => `En ${listaY(cs.map(nom))}, la más votada fue siempre una fórmula ${k === "Peronismo" ? "del peronismo" : `de ${k}`}.`).join(" ") +
      ` ${listaY(lasMenos.map(nom))} ${lasMenos.length > 1 ? "son las que menos coincidieron" : "es la que menos coincidió"} con el país: en ${menos} de las ${n} vueltas.`;
    const contexto = `La elección de ${ini} fue la primera después de la dictadura que empezó en 1976. Desde entonces hubo ${primeras} elecciones presidenciales. En ${listaY(segundas.map(String))} hubo además una segunda vuelta ` +
      "entre las dos fórmulas más votadas. En 2003 no hubo segunda vuelta: la fórmula más votada en la primera no se presentó a la segunda, y asumió la " +
      "segunda más votada. Este artículo muestra, para cada provincia y cada vuelta, qué fórmula sacó más votos, si coincidió con la más votada del país, " +
      "con qué parte de los votos ganó cada fórmula y cuánta gente fue a votar.";
    const medimos = ["La fórmula más votada es la que sacó más votos positivos en esa provincia o en el país, aunque no haya ganado la elección. " +
      "Los votos positivos son los que van a alguna fórmula, sin los votos en blanco ni los nulos.",
      "Cada fórmula se agrupa en un espacio político, con la misma clasificación que la composición del Congreso. La participación es la parte de las " +
      "personas habilitadas para votar que votó. Las primarias abiertas, que existen desde 2011, no se cuentan."];
    // 1. el mapa de cada vuelta
    const cambios = c => P1.reduce((s, e, i, l) => s + (i && esp(e, c) !== esp(l[i - 1], c) ? 1 : 0), 0);
    const maxC = Math.max(...cods.map(cambios)), cambiantes = cods.filter(c => cambios(c) === maxC);
    const s1 = `En las primeras vueltas, ${listaY(cambiantes.map(nom))} ${cambiantes.length > 1 ? "son las que más veces cambiaron" : "es la que más veces cambió"} ` +
      `de espacio político entre una elección y la siguiente: ${maxC} veces en ${primeras} elecciones. En ${cods.filter(c => cambios(c) === 0).length} jurisdicciones, ` +
      "la más votada en las primeras vueltas fue siempre del mismo espacio. " +
      (() => { const cu = d3.rollups(P1.flatMap(e => cods.map(c => esp(e, c))), v => v.length, k => k).sort((a, b) => b[1] - a[1])[0];
        return `Sumando todas las provincias y todas las primeras vueltas, el espacio que más veces fue el más votado es ${cu[0] === "Peronismo" ? "el peronismo" : cu[0]}: ` +
          `${cu[1]} de ${P1.length * cods.length} casos. Los colores muestran el espacio de cada fórmula, no a sus candidatos: un mismo espacio presentó fórmulas distintas en cada elección.`; })();
    // 2. las coincidencias con el país
    const mediaC = d3.median(cods, coinc);
    const s2 = `La mitad de las jurisdicciones votó como el país en ${n0(mediaC)} vueltas o más, de ${n}. ` +
      (siempre.length ? `${listaY(siempre.map(nom))} ${siempre.length > 1 ? "coincidieron" : "coincidió"} en todas. ` : "") +
      (cods.filter(c => coinc(c) === n - 1).length ? `Con una sola diferencia, en ${n - 1} de ${n}: ${listaY(cods.filter(c => coinc(c) === n - 1).map(nom))}. ` : "") +
      `En el otro extremo, ${listaY(lasMenos.map(nom))} ${lasMenos.length > 1 ? "coincidieron" : "coincidió"} en ${menos}. Coincidir con el país no es un mérito ` +
      "ni un defecto: las provincias con más votantes pesan más en el total, y su resultado suele parecerse más al del país.";
    // 3. con qué parte de los votos ganó cada fórmula
    const pMax = E.reduce((a, b) => b.pct_ganador > a.pct_ganador ? b : a), pMin = E.reduce((a, b) => b.pct_ganador < a.pct_ganador ? b : a);
    const s3 = `La fórmula más votada del país sacó entre el ${pct(pMin.pct_ganador)} de los votos positivos, en ${vuelta(pMin)}, y el ${pct(pMax.pct_ganador)}, en ` +
      `${vuelta(pMax)}. En las primeras vueltas, superó la mitad de los votos en ${P1.filter(e => e.pct_ganador > 50).length} de ${primeras} elecciones. ` +
      (() => { const mx = d3.rollups(E, v => v.length, e => e.max_prov).sort((a, b) => b[1] - a[1])[0];
        return `${mx[0]} fue la provincia donde la fórmula más votada del país sacó su mejor porcentaje en ${mx[1]} de las ${n} vueltas. `; })() +
      "Desde 1995, para ganar en primera vuelta hace falta más del 45% de los votos positivos, o el 40% con diez puntos de ventaja sobre la segunda." +
      (() => { const dist = E.filter(e => e.vuelta === 2 && P1.find(p => p.anio === e.anio)?.ganador !== e.ganador).map(e => String(e.anio));
        return dist.length ? ` En ${listaY(dist)}, la fórmula que ganó la segunda vuelta no había sido la más votada en la primera.` : ""; })();
    // 4. en cuántas provincias ganó
    const gMax = E.reduce((a, b) => b.prov_ganador > a.prov_ganador ? b : a), gMin = E.reduce((a, b) => b.prov_ganador < a.prov_ganador ? b : a);
    const s4 = `La fórmula más votada del país fue también la más votada en ${gMax.prov_ganador} jurisdicciones en ${vuelta(gMax)}, y en ${gMin.prov_ganador} en ` +
      `${vuelta(gMin)}. ` + (() => { const pocas = E.filter(e => e.prov_ganador < 12);
        return pocas.length === 1 && pocas[0] === gMin ? "Fue la única vuelta en que ganó en menos de la mitad de las jurisdicciones. " :
          pocas.length ? `En ${listaY(pocas.map(vuelta))}, ganó en menos de la mitad de las jurisdicciones. ` : ""; })() +
      `Ganar en pocas provincias y en el país a la vez es posible porque los votos se suman en todo el país: una provincia grande pesa ` +
      "más que varias chicas.";
    // 5. la participación
    const u = P1.at(-1), pa = P1.reduce((a, b) => b.participacion > a.participacion ? b : a), pb = P1.reduce((a, b) => b.participacion < a.participacion ? b : a);
    const s5 = `En las primeras vueltas, la participación fue del ${pct(P1[0].participacion)} en ${P1[0].anio} y del ${pct(u.participacion)} en ${u.anio}. ` +
      `La más alta fue la de ${pa.anio}, ${pct(pa.participacion)}, y la más baja, la de ${pb.anio}, ${pct(pb.participacion)}. ` +
      (segundas.length ? `En las segundas vueltas fue del ${listaY(E.filter(e => e.vuelta === 2).map(e => `${pct(e.participacion)} en ${e.anio}`))}. ` : "") +
      `La participación bajó frente a la elección anterior en ${P1.slice(1).filter((e, i) => e.participacion < P1[i].participacion).length} de las ${primeras - 1} primeras vueltas. ` +
      "El voto es obligatorio de los 18 a los 70 años, y optativo de los 16 a los 18 y desde los 70.";
    const sintesis = [respuesta, `La fórmula más votada del país sacó entre el ${pct(pMin.pct_ganador)} y el ${pct(pMax.pct_ganador)} de los votos positivos.`,
      `Ganó en entre ${gMin.prov_ganador} y ${gMax.prov_ganador} jurisdicciones.`,
      `La participación de la última primera vuelta fue del ${pct(u.participacion)}.`,
      `${listaY(lasMenos.map(nom))} ${lasMenos.length > 1 ? "coincidieron" : "coincidió"} con el país en ${menos} de las ${n} vueltas.`];
    const lim = ["Muestra la fórmula más votada, no por cuánto ganó: una provincia puede figurar con una fórmula que sacó apenas un voto más que la segunda.",
      "Los espacios agrupan partidos y alianzas afines, con una clasificación propia. Una misma fórmula pudo tener otro nombre en cada elección.",
      "Cada provincia cuenta igual en el gráfico, pero no en la elección: Buenos Aires tiene casi cuatro de cada diez votantes del país.",
      "Hasta 1989 el presidente lo elegía un colegio electoral, con electores votados en cada provincia. Desde 1995 se elige por voto directo, con segunda vuelta si ninguna fórmula llega a los votos que pide la Constitución.",
      ...(E.some(e => e.provisorio) ? [`En ${listaY([...new Set(E.filter(e => e.provisorio).map(e => String(e.anio)))])}, los resultados son los del escrutinio provisorio, porque el definitivo no está publicado como datos abiertos.`] : [])];
    const notas = ["Resultados: Dirección Nacional Electoral, votos de cada fórmula por provincia en cada primera y segunda vuelta presidencial.",
      "Espacios políticos: clasificación propia de Datina, la misma de la composición del Congreso.",
      "Participación: votantes sobre las personas habilitadas para votar en el padrón.",
      "Las primarias abiertas, simultáneas y obligatorias (PASO) no eligen presidente: definen qué fórmulas se presentan, y no se cuentan acá."];
    // las claves de los años llevan un "_" (se ve como espacio): con un año solo, el navegador las ordena antes que las de las segundas vueltas
    const filas = cods.map(c => ({codigo_indec: c, territorio: nom(c), ...Object.fromEntries(E.map(e => [e.anio + (e.vuelta === 2 ? "_segunda_vuelta" : "_"), e.gan_prov[c]])),
      "como_el_país": coinc(c)})).sort((a, b) => b["como_el_país"] - a["como_el_país"] || a.territorio.localeCompare(b.territorio));
    const nomT = "la fórmula más votada en cada provincia";
    const tabla = tablaDatos(filas, "a-ganador-provincias").replace('aria-label="Tabla: Datos"', `aria-label="Tabla: ${nomT}"`).replace(">Datos</caption>", `>${mayusc(nomT)}</caption>`);
    const usados = [...new Set(E.flatMap(e => cods.map(c => esp(e, c))))];
    const ley = `<div class="pol-ley">${Object.keys(ESP_COLOR).filter(k => usados.includes(k)).map(k => `<span><i style="background:${ESP_COLOR[k]}"></i>${k}</span>`).join("")}</div>`;
    return {respuesta, bajada, contexto, medimos, sintesis, lim, notas, secciones: [
      {preg: "¿Qué fórmula sacó más votos en cada provincia?", g: "ganadores", forma: "bloque", alto: "560px", antes: ley,
        tit: `En las primeras vueltas, ${listaY(cambiantes.map(nom))} ${cambiantes.length > 1 ? "cambiaron" : "cambió"} ${maxC} veces de espacio político`,
        despues: `<details class="nota-calculo"><summary>Ver la tabla</summary>${tabla}</details>`,
        pie: `Cada cuadro es la fórmula más votada en esa provincia, con el color de su espacio. «·2»: segunda vuelta. A la derecha, en cuántas de las ${n} vueltas coincidió con la más votada del país.`, txt: [s1]},
      {preg: "¿Qué provincias votaron más veces como el país?", g: "gan-coinc", forma: "barras",
        tit: siempre.length ? `${listaY(siempre.map(nom))} ${siempre.length > 1 ? "votaron" : "votó"} como el país en las ${n} vueltas` : `Ninguna provincia votó como el país en las ${n} vueltas`,
        pie: `Cantidad de vueltas, de ${n}, en que la fórmula más votada de cada jurisdicción fue la más votada del país.`, txt: [s2]},
      {preg: "¿Con qué parte de los votos ganó cada fórmula?", g: "gan-pct", forma: "barras",
        tit: `La fórmula más votada sacó entre el ${pct(pMin.pct_ganador)} y el ${pct(pMax.pct_ganador)} de los votos positivos`,
        pie: "% de los votos positivos de la fórmula más votada del país en cada vuelta. La línea marca la mitad.", txt: [s3]},
      {preg: "¿En cuántas provincias ganó la fórmula más votada del país?", g: "gan-provs", forma: "barras",
        tit: `La fórmula más votada del país ganó en entre ${gMin.prov_ganador} y ${gMax.prov_ganador} jurisdicciones`,
        pie: "Cantidad de jurisdicciones, de 24, en las que la fórmula más votada del país fue también la más votada.", txt: [s4]},
      {preg: "¿Cuánta gente fue a votar?", g: "gan-part", forma: "lineas",
        tit: `La participación pasó del ${pct(P1[0].participacion)} en ${P1[0].anio} al ${pct(u.participacion)} en ${u.anio}`,
        pie: "% de las personas habilitadas que votaron en cada primera vuelta presidencial.", txt: [s5]},
    ]};
  },
  dib: {
    "ganadores": el => {
      const E = R.elecciones.filter(e => e.vuelta >= 1), n = E.length, cods = Object.keys(E[0].gan_prov);
      const esp = (e, c) => e.candidatos.find(x => x.c === e.gan_prov[c])?.espacio || "Otras fuerzas";
      const coinc = c => E.filter(e => e.gan_prov[c] === e.ganador).length;
      const filas = cods.map(c => ({c, k: coinc(c), t: NOMBRES[c]})).sort((a, b) => b.k - a.k || a.t.localeCompare(b.t));
      const angosto = el.clientWidth < 520, l = angosto ? 112 : 150, alto = 22 * filas.length + 30;
      // los años de las columnas, en dos filas alternadas para que no se pisen
      const arriba = 36, C = lienzo(el, alto + arriba - 26, {t: arriba, r: 30, b: 4, l}), {g, iw} = C;
      const x = d3.scaleBand().domain(E.map(e => e.id)).range([0, iw]).paddingInner(.12), y = d3.scaleBand().domain(filas.map(f => f.c)).range([0, 22 * filas.length]).paddingInner(.14);
      g.selectAll("text.col").data(E).join("text").attr("class", "etq-suave").attr("text-anchor", "middle").attr("x", e => x(e.id) + x.bandwidth() / 2)
        .attr("y", (e, i) => i % 2 === 0 ? -22 : -10)
        .text(e => (angosto ? String(e.anio).slice(2) : e.anio) + (e.vuelta === 2 ? "·2" : ""));
      g.selectAll("text.fila").data(filas).join("text").attr("class", "etq").attr("text-anchor", "end").attr("x", -8).attr("y", f => y(f.c) + y.bandwidth() / 2 + 4).text(f => f.t);
      g.selectAll("text.k").data(filas).join("text").attr("class", "etq-suave").attr("x", iw + 8).attr("y", f => y(f.c) + y.bandwidth() / 2 + 4).text(f => f.k);
      const celdas = filas.flatMap(f => E.map(e => ({f, e, esp: esp(e, f.c)})));
      g.selectAll("rect").data(celdas).join("rect").attr("x", d => x(d.e.id)).attr("y", d => y(d.f.c)).attr("width", x.bandwidth()).attr("height", y.bandwidth())
        .attr("rx", 2).attr("fill", d => ESP_COLOR[d.esp] || ESP_COLOR["Otras fuerzas"])
        .on("pointerenter", (ev, d) => mostrarTip(el, `<b>${d.f.t}, ${d.e.anio}${d.e.vuelta === 2 ? ", segunda vuelta" : ""}</b><br>${d.e.gan_prov[d.f.c]} (${d.esp})` +
          `<br>${d.e.gan_prov[d.f.c] === d.e.ganador ? "Como en el país" : `En el país: ${d.e.ganador}`}`, l + x(d.e.id) + x.bandwidth() / 2, arriba + y(d.f.c)))
        .on("pointerleave", ocultarSiMouse);
    },
    "gan-coinc": (el, a) => {
      const E = R.elecciones.filter(e => e.vuelta >= 1), cods = Object.keys(E[0].gan_prov);
      return barrasH(el, {anim: a, k: "k", vf: n0, af: n0, data: cods.map(c => ({codigo_indec: c, territorio: NOMBRES[c], k: E.filter(e => e.gan_prov[c] === e.ganador).length})),
        tip: d => `<b>${d.territorio}</b><br>Votó como el país en ${d.k} de ${E.length} vueltas`});
    },
    "gan-pct": (el, a) => barrasH(el, {anim: a, sinOrden: true, k: "pct_ganador", vf: pct, af: v => n0(v) + "%", ref: 50, refLab: "La mitad", l: 220, lAngosto: 185,
      data: R.elecciones.filter(e => e.vuelta >= 1).map(e => ({...e, codigo_indec: e.id, territorio: `${e.anio}${e.vuelta === 2 ? " (2.ª vuelta)" : ""}, ${e.ganador}`})),
      tip: d => `<b>${d.territorio}</b><br>${pct(d.pct_ganador)} de los votos positivos`}),
    "gan-provs": (el, a) => barrasH(el, {anim: a, sinOrden: true, k: "prov_ganador", vf: n0, af: n0, l: 220, lAngosto: 185,
      data: R.elecciones.filter(e => e.vuelta >= 1).map(e => ({...e, codigo_indec: e.id, territorio: `${e.anio}${e.vuelta === 2 ? " (2.ª vuelta)" : ""}, ${e.ganador}`})),
      tip: d => `<b>${d.territorio}</b><br>La más votada en ${d.prov_ganador} jurisdicciones`}),
    "gan-part": (el, a) => lineas(el, {anim: a, x: "anio", y0: 0, vf: pct, yf: v => n0(v) + "%",
      data: R.elecciones.filter(e => e.vuelta === 1), series: [{k: "participacion", lab: "Participación", c: NAR}]}),
  },
}, {
  // etapa 5 del plan de mejora: cuánto compra un salario registrado frente a otros años, con los cambios de gobierno marcados sin adjetivos
  // (auditoría de los artículos, idea 6). Cada gobierno se mide del último mes antes de que asuma al último antes del siguiente (02_procesar.py)
  id: "a-salario-real", frec: "Se actualiza cada mes", tablas: ["salario_real_mensual", "salarios_provincias"],
  dek: "Cuánto compran los salarios registrados del sector privado y del sector público frente a los precios, mes por mes desde fines de 2016, cuántas veces le ganaron a la inflación, cuánto cambió ese poder de compra en cada gobierno y en qué provincias subió en el último año.",
  fichas: [["f-salario-real", "salario real"], ["f-salarios", "salarios por provincia"], ["f-inflacion", "inflación"]],
  csv: [["salario_real_mensual", "Descargar CSV por mes"], ["salarios_provincias", "Descargar CSV por provincia"]],
  fuentes: "INDEC, índice de salarios e índice de precios al consumidor, y Secretaría de Trabajo, remuneración de los asalariados registrados del sector " +
    "privado por provincia (SIPA)",
  texto: () => {
    const S = ESR, P = R.salarios, mm = v => Math.round(Math.abs(v) * 10) === 0 ? "lo mismo" : `${pct(Math.abs(v))} ${v < 0 ? "menos" : "más"}`;
    const un = v => Math.round(Math.abs(v) * 10) === 0 ? "lo mismo" : "un " + mm(v);
    const respuesta = `${mayusc(mm(S.vs_base_priv))} que en ${S.base}, en el sector privado registrado.`;
    const bajada = `Es lo que compraba en ${S.mes} un salario privado registrado, descontada la inflación, frente a lo que compraba en ${S.base}. ` +
      `Uno del sector público compraba ${mm(S.vs_base_pub)}. En los últimos doce meses, el salario real privado ${cambioPct(S.real_priv)} y el público ${cambioPct(S.real_pub)}.`;
    const contexto = "Un aumento de sueldo no dice por sí solo si alguien está mejor: depende de cuánto subieron los precios en el mismo tiempo. " +
      "El salario real es el salario descontada la inflación, y dice cuántas cosas se pueden comprar con él. Datina lo calcula dividiendo " +
      "el índice de salarios del INDEC por el índice de precios al consumidor del mismo mes. " +
      `Las dos series empiezan en ${S.base}, el primer mes del índice de precios de todo el país: 100 es lo que compraba un salario ese mes.`;
    const medimos = ["El índice de salarios del INDEC sigue lo que se paga en los puestos de trabajo registrados del sector privado y del sector público. " +
      "No es el salario de una persona sino cómo cambia el pago de un mismo puesto de un mes a otro.",
      "Para las provincias, el dato es otro: la remuneración promedio de los asalariados registrados del sector privado, de la Secretaría de Trabajo, " +
      "descontada la inflación del país."];
    // 1. el nivel frente al comienzo de la serie
    const s1 = `El salario real privado llegó a su punto más alto en ${S.max_priv_mes}, con ${n1(S.max_priv)}, y al más bajo en ${S.min_priv_mes}, con ${n1(S.min_priv)}. ` +
      `En ${S.mes}, el del sector público compraba ${mm(S.vs_base_pub)} que en ${S.base}, y el de todos los asalariados registrados, ${mm(S.vs_base_reg)}.`;
    // 2. el último año: salarios y precios
    const s2 = `Entre ${S.mes_ant} y ${S.mes}, los salarios privados registrados subieron ${pct(S.nom_priv)} y los públicos, ${pct(S.nom_pub)}. Los precios ` +
      `subieron ${pct(S.ipc)}. Descontada la inflación, el salario real privado ${cambioPct(S.real_priv)} y el público ${cambioPct(S.real_pub)}. ` +
      "Cuando la inflación es alta, unos pocos puntos de diferencia entre los aumentos y los precios cambian mucho lo que se puede comprar.";
    // 3. cuántas veces le ganó al año anterior
    const [maxM, maxV] = S.ia_max_priv, [minM, minV] = S.ia_min_priv;
    const s3 = `Desde ${S.ia_desde}, en ${S.ia_pos_priv} de los ${S.ia_n} meses el salario real privado compraba más que en el mismo mes del año anterior. ` +
      `El público, en ${S.ia_pos_pub}. La mejora más grande fue la de ${maxM}, con ${pct(maxV)} más que un año antes, y la caída más grande, la de ${minM}, ` +
      `con ${pctAbs(minV)} menos. Las subas y las bajas no se compensan: una caída del 10% necesita una suba de más del 11% para volver al mismo nivel.`;
    // 4. cada gobierno
    const G = S.gobiernos, nBaja = G.filter(g => g.priv < 0).length;
    const s4 = G.map(g => `Entre ${g.desde}${g.parcial ? ", cuando empieza la serie," : ""} y ${g.hasta}${g.en_curso ? ", el último mes con datos," : ","} ` +
      `con ${g.presidente}, el salario real privado ${cambioPct(g.priv)} y el público ${cambioPct(g.pub)}.`).join(" ");
    // 5. las provincias, con la remuneración del SIPA
    const s5 = `Entre ${P.ant} y ${P.mes}, la remuneración promedio de los asalariados privados registrados ${cambioPct(P.var_real_12m)} descontada la inflación ` +
      `en el conjunto del país. Subió en ${P.n_suben} de las 24 jurisdicciones. En pesos de ${P.mes}, fue de ${n0(P.top[1])} en ${P.top[0]} y de ` +
      `${n0(P.bajo[1])} en ${P.bajo[0]}: ${veces(P.top[1], P.bajo[1])} veces más. Una parte de esa diferencia viene de las actividades de cada provincia, ` +
      "como el petróleo o la minería, que pagan más que el comercio o el campo.";
    const sintesis = [`En ${S.mes}, un salario privado registrado compraba ${un(S.vs_base_priv)} que en ${S.base}, y uno público, ${un(S.vs_base_pub)}.`,
      `En el último año, los salarios privados subieron ${pct(S.nom_priv)} y los precios, ${pct(S.ipc)}.`,
      `En ${S.ia_pos_priv} de los ${S.ia_n} meses desde ${S.ia_desde}, el salario real privado le ganó al del año anterior.`,
      `En el último año, el salario real privado subió en ${P.n_suben} de las 24 jurisdicciones.`];
    const lim = ["El índice de salarios sigue lo que se paga en los puestos registrados, no lo que cobra cada persona: si alguien cambia de trabajo, suma otro o lo pierde, no se ve.",
      "No incluye a los asalariados no registrados ni a quienes trabajan por su cuenta. El INDEC publica el índice de los no registrados con cinco meses de rezago, y por eso no se compara con los precios del mismo mes.",
      "Lo que cambió en cada gobierno depende también de la economía del mundo, de las sequías y de lo que venía de antes: no mide solo las decisiones de cada uno.",
      `Que ${S.base} valga 100 no quiere decir que ese mes fuera bueno o malo para el salario: es solo el punto de partida de la serie.`,
      "La remuneración por provincia se descuenta con la inflación del país, aunque los precios no suben igual en todas las regiones."];
    const notas = ["Salario real: índice de salarios del INDEC (sector privado registrado, sector público y total registrado), dividido por el índice de precios al consumidor del país del mismo mes, con " + S.base + " = 100.",
      "Gobiernos: del último mes antes de que asuma cada presidente, o del comienzo de la serie, al último mes antes de que asuma el siguiente, o al último mes con datos. Sin los interinos.",
      `Provincias: remuneración promedio por todo concepto de los asalariados registrados del sector privado (Secretaría de Trabajo, SIPA), por provincia donde está declarado el trabajador, de ${P.mes}, sin aguinaldo.`];
    return {respuesta, bajada, contexto, medimos, sintesis, lim, notas, secciones: [
      {preg: "¿Cuánto compra hoy un salario?", g: "salario-real", forma: "lineas",
        tit: `Un salario privado registrado compra ${un(S.vs_base_priv)} que en ${S.base}`,
        pie: `Índice, ${S.base} = 100 (la línea gris): el índice de salarios dividido por el de precios. Las líneas punteadas marcan el mes en que asumió cada presidente.`, txt: [s1]},
      {preg: "¿Le ganaron los salarios a la inflación en el último año?", g: "sal-anio", forma: "barras",
        tit: `Los salarios privados subieron ${pct(S.nom_priv)} en un año y los precios, ${pct(S.ipc)}`,
        pie: `% de suba entre ${S.mes_ant} y ${S.mes}, sin descontar la inflación.`, txt: [s2]},
      {preg: "¿Cuántas veces le ganó el salario al del año anterior?", g: "sal-ia", forma: "lineas",
        tit: `En ${S.ia_pos_priv} de los ${S.ia_n} meses, el salario real privado compraba más que un año antes`,
        pie: "% de cambio del salario real frente al mismo mes del año anterior. Arriba de la línea del cero, compraba más que un año antes.", txt: [s3]},
      {preg: "¿Cuánto cambió en cada gobierno?", g: "sal-gob", forma: "barras",
        tit: nBaja === G.length ? `El salario real privado bajó en los ${G.length} períodos de gobierno de la serie` : `El salario real privado bajó en ${nBaja} de los ${G.length} períodos de gobierno de la serie`,
        pie: "% de cambio del salario real entre el comienzo y el final de cada período. El primero empieza con la serie, no con el gobierno.", txt: [s4]},
      {preg: "¿En qué provincias subió el salario real en el último año?", g: "sal-prov", forma: "barras",
        tit: `La remuneración real privada subió en ${P.n_suben} de las 24 jurisdicciones`,
        pie: `% de cambio de la remuneración promedio de los asalariados privados registrados entre ${P.ant} y ${P.mes}, descontada la inflación. La línea marca el país.`, txt: [s5]},
    ]};
  },
  dib: {
    "salario-real": (el, a) => lineas(el, {anim: a, data: T.salario_real_mensual.map(r => ({...r, t: tPer(r.periodo)})), x: "t", y0: 0, vf: n1, yf: n0,
      xl: r => mesPer(r.periodo), mensual: true, ref: 100,
      eventos: ESR.gobiernos.filter(g => !g.parcial).map(g => ({x: tPer(g.desde_p) + 1 / 12, lab: g.corto})),
      series: [{k: "privado", lab: "Privado registrado", corto: "Privado", c: NAR}, {k: "publico", lab: "Público", c: FRI}]}),
    "sal-anio": (el, a) => barrasH(el, {anim: a, sinOrden: true, k: "v", vf: pct, af: v => n0(v) + "%", l: 190, lAngosto: 150,
      data: [{codigo_indec: "priv", territorio: "Salarios privados", v: ESR.nom_priv}, {codigo_indec: "pub", territorio: "Salarios públicos", v: ESR.nom_pub},
        {codigo_indec: "ipc", territorio: "Precios", v: ESR.ipc}],
      color: d => css(d.codigo_indec === "ipc" ? "--sol" : "--celeste"), tip: d => `<b>${d.territorio}</b><br>${pct(d.v)} entre ${ESR.mes_ant} y ${ESR.mes}`}),
    "sal-ia": (el, a) => {
      const data = T.salario_real_mensual.filter(r => r.interanual_real_privado != null).map(r => ({...r, t: tPer(r.periodo)}));
      return lineas(el, {anim: a, data, x: "t", conNegativos: true, ref: 0, vf: v => (v > 0 ? "+" : "") + pct(v), yf: v => n0(v) + "%",
        xl: r => mesPer(r.periodo), mensual: true,
        series: [{k: "interanual_real_privado", lab: "Privado registrado", corto: "Privado", c: NAR}, {k: "interanual_real_publico", lab: "Público", c: FRI}]});
    },
    "sal-gob": (el, a) => barrasH(el, {anim: a, sinOrden: true, k: "v", vf: v => (v > 0 ? "+" : "") + pct(v), af: v => n0(v) + "%", l: 190, lAngosto: 150,
      data: ESR.gobiernos.flatMap(g => [{codigo_indec: g.corto + "-priv", territorio: `${g.corto}, privado`, v: g.priv, priv: true},
        {codigo_indec: g.corto + "-pub", territorio: `${g.corto}, público`, v: g.pub, priv: false}]),
      color: d => css(d.priv ? "--celeste" : "--sol"), tip: d => `<b>${d.territorio}</b><br>${cambioPct(d.v)} descontada la inflación`}),
    "sal-prov": (el, a) => barrasH(el, {anim: a, k: "var_real_12m", vf: v => (v > 0 ? "+" : "") + pct(v), af: v => n0(v) + "%",
      data: T.salarios_provincias.filter(r => r.codigo_indec !== "00"), ref: R.salarios.var_real_12m, refLab: `País ${pct(R.salarios.var_real_12m)}`,
      tip: d => `<b>${d.territorio}</b><br>${cambioPct(d.var_real_12m)} descontada la inflación<br>${n0(d.salario)} pesos en ${R.salarios.mes}`}),
  },
}, {
  // etapa 5 del plan de mejora: aportantes por jubilación o pensión desde 1994, con los haberes frente al salario (auditoría de los
  // artículos, idea 5)
  id: "a-aportantes", frec: "Se actualiza cada trimestre", tablas: ["jubilaciones_aportantes", "haberes_previsionales"],
  dek: "Cuántas personas aportan al sistema previsional que administra ANSES por cada jubilación o pensión que paga, año por año desde 1994, cuánto crecieron unos y otros, y cuánto representan y cuánto compran los haberes.",
  fichas: [["f-envejecimiento", "aportantes y envejecimiento"], ["f-haberes", "haberes previsionales"]],
  csv: [["jubilaciones_aportantes", "Descargar CSV de aportantes y beneficios"], ["haberes_previsionales", "Descargar CSV de los haberes"]],
  fuentes: "Secretaría de Seguridad Social y ANSES, aportantes y beneficios del sistema previsional, haberes, y salario de los asalariados registrados, " +
    "e INDEC, proyecciones de población e índice de precios al consumidor",
  texto: () => {
    const J = JU, H = HB, A = T.jubilaciones_aportantes, ini = A[0], ult = A.at(-1), cuando = J.mes ? `${MESES[J.mes - 1]} de ${J.anio}` : String(J.anio);
    const mll = v => `${n1(v / 1e6)} millones`;
    const respuesta = `${n2(J.ratio)} aportantes por cada jubilación o pensión, en ${cuando}.`;
    const bajada = `Son ${n0(J.aportantes)} personas que aportan y ${n0(J.beneficios)} beneficios que paga ANSES. En ${J.ini} había ${n2(J.ini_ratio)} aportantes ` +
      `por beneficio. El valor más alto de la serie fue ${n2(J.max)}, en ${J.max_anio}, y el más bajo, ${n2(J.min)}, en ${J.min_anio}.`;
    const contexto = "Desde 2008 el sistema previsional nacional es de reparto: los aportes de quienes trabajan hoy, junto con impuestos asignados y otros " +
      "recursos, pagan las jubilaciones y pensiones de hoy. Por eso se mira cuántas personas aportan por cada beneficio que se paga. Ese número depende " +
      "de dos cosas: cuánta gente tiene un trabajo registrado y aporta, y cuántas personas cobran un beneficio, algo que crece con el envejecimiento de " +
      "la población y que creció también con las moratorias, que desde mediados de los años 2000 permitieron jubilarse a personas sin todos los años de aportes.";
    const medimos = ["Los aportantes son las personas que aportan al sistema que administra ANSES: asalariados, autónomos, monotributistas y trabajadoras " +
      "de casas particulares. Los beneficios son las jubilaciones y pensiones que paga.",
      "Los haberes se comparan con el salario promedio de los asalariados registrados y, para saber cuánto compran, se descuenta la inflación con el " +
      "índice de precios al consumidor del INDEC. El haber mínimo es la jubilación más baja que paga ANSES, y los refuerzos son sumas que se pagan aparte " +
      "del haber, que fija el Gobierno."];
    // 1. la razón
    const s1 = `En ${cuando} había ${n2(J.ratio)} aportantes por cada jubilación o pensión, frente a ${n2(J.ini_ratio)} en ${J.ini}. El valor más alto fue el de ` +
      `${J.max_anio}, ${n2(J.max)}, y el más bajo, el de ${J.min_anio}, ${n2(J.min)}` +
      (J.min_anio >= 2001 && J.min_anio <= 2003 ? ", en medio de la crisis de 2001 y 2002, cuando cayó el empleo registrado." : ".") +
      ` Desde ${J.max_anio}, la razón bajó ${n2(J.max - J.ratio)} aportantes por beneficio. Para que vuelva a subir, los aportantes tienen que crecer más ` +
      "rápido que los beneficios, y eso depende sobre todo de cuánto empleo registrado se crea.";
    // 2. los dos lados de la cuenta
    const vA = (ult.aportantes / ini.aportantes - 1) * 100, vB = (ult.beneficios / ini.beneficios - 1) * 100;
    const s2 = `Desde ${ini.anio}, ` + (vA > 0 && vB > 0 ? `los aportantes crecieron ${pct(vA)} y los beneficios, ${pct(vB)}. ` : `los aportantes ${cambioPl(vA)} y los beneficios ${cambioPl(vB)}. `) +
      `Pasaron de ${mll(ini.aportantes)} a ${mll(ult.aportantes)} de aportantes y de ${mll(ini.beneficios)} a ${mll(ult.beneficios)} de beneficios.` +
      (vB > vA ? " Los beneficios crecieron más rápido, y por eso hay menos aportantes por beneficio que al comienzo. " : " ") +
      `En la población, según las proyecciones del INDEC, las personas de 15 a 64 años por cada persona de 65 o más pasan de ${n1(EV.trab_hoy)} en ${EV.anio} ` +
      `a ${n1(EV.trab_fin)} en ${EV.anio_fin}. Con menos personas en edad de trabajar por cada persona mayor, sostener la misma razón va a pedir más ` +
      "empleo registrado.";
    // 3. el crecimiento de cada año, solo con los años completos
    const comp = A.filter(r => !r.mes), cre = comp.slice(1).map((r, i) => ({anio: r.anio, a: (r.aportantes / comp[i].aportantes - 1) * 100, b: (r.beneficios / comp[i].beneficios - 1) * 100}));
    const salto = cre.reduce((x, y) => y.b > x.b ? y : x), masB = cre.filter(r => r.b > r.a).length;
    const s3 = `El año en que más crecieron los beneficios fue ${salto.anio}: ${pct(salto.b)} en un año, mientras los aportantes ${cambioPl(salto.a)}. ` +
      `En ${masB} de los ${cre.length} años, los beneficios crecieron más que los aportantes. Los saltos más grandes de los beneficios coinciden con las moratorias, ` +
      "que sumaron de una vez a muchas personas que no tenían todos los años de aportes. Los aportantes, en cambio, siguen al empleo registrado: " +
      "crecen cuando crece la economía y caen en las crisis, como en 2002 y en 2020.";
    // 4. los haberes frente al salario
    const hU = T.haberes_previsionales.at(-1);
    const s4 = `En ${H.anio}${H.meses < 12 ? `, hasta ${MESES[H.meses - 1]},` : ""} la jubilación promedio equivalía al ${pct(H.pct_jub)} del salario promedio de los asalariados ` +
      `registrados, y el haber mínimo con los refuerzos que se pagan aparte, al ${pct(H.pct_min_ad)}. En ${H.ini}, al ${pct(H.ini_pct_jub)} y al ${pct(H.ini_pct_min_ad)}. ` +
      `El haber mínimo con refuerzos llegó a su punto más alto frente al salario en ${H.max_pct.anio}, con el ${pct(H.max_pct.v)}, y al más bajo en ${H.min_pct.anio}, con el ${pct(H.min_pct.v)}. ` +
      `La pensión promedio equivalía en ${H.anio} al ${pct(hU.pct_pension)} del salario, y el haber promedio de todos los beneficios, al ${pct(H.pct_haber)}.`;
    // 5. lo que compran los haberes
    const s5 = `Descontada la inflación, entre ${H.ini_real} y ${H.anio} el haber mínimo con refuerzos ${cambioPct(H.var_real_min_ad)}, la jubilación promedio ` +
      `${cambioPct(H.var_real_jub)} y el salario promedio de los asalariados registrados ${cambioPct(H.var_real_sal)}. El haber mínimo con refuerzos fue el más alto ` +
      `en ${H.min_ad_real_max.anio}, con ${n0(H.min_ad_real_max.v)} pesos de ${mesPer(H.mes_real)}, y en ${H.anio} fue de ${n0(H.min_ad_real)}.` +
      ` En pesos de ${mesPer(H.mes_real)}, la jubilación promedio de ${H.anio} fue de ${n0(hU.jubilacion_promedio_real)} y el salario promedio, de ${n0(hU.salario_promedio_real)}.` +
      (H.var_real_min_ad < H.var_real_sal ? ` Como el haber mínimo cayó más que el salario, desde ${H.ini_real} también bajó lo que representa frente a él.` : "");
    const sintesis = [`En ${cuando} había ${n2(J.ratio)} aportantes por cada jubilación o pensión, frente a ${n2(J.ini_ratio)} en ${J.ini}.`,
      `Desde ${ini.anio}, los aportantes ${cambioPl(vA)} y los beneficios ${cambioPl(vB)}.`,
      `La jubilación promedio equivalía al ${pct(H.pct_jub)} del salario promedio de los asalariados registrados en ${H.anio}.`,
      `Descontada la inflación, el haber mínimo con refuerzos ${cambioPct(H.var_real_min_ad)} desde ${H.ini_real}.`];
    const lim = ["Un beneficio no es una persona: alguien puede cobrar una jubilación y una pensión a la vez.",
      "Los aportantes incluyen también a jubilados que siguen aportando.",
      "Los aportes no son el único recurso del sistema: también lo financian impuestos asignados y fondos del Tesoro. Cuántos aportantes hay por beneficio no dice si al sistema le alcanza o le falta.",
      "No incluye las cajas provinciales ni los regímenes que no administra ANSES. Desde abril de 2019 se cuentan solo los beneficios no suspendidos, y hasta 2008 la serie incluye el sistema de capitalización."];
    const notas = ["Aportantes y beneficios: Secretaría de Seguridad Social y ANSES, promedio de cada año. " +
      `El último, ${ult.mes ? `${ult.anio}, es el último mes publicado` : "el último mes publicado"}.`,
      "Haberes: haber mínimo, haber mínimo con los refuerzos que se pagan aparte, jubilación promedio y salario promedio de los asalariados registrados sujeto a aportes, sin aguinaldo, promedio de cada año.",
      `Pesos de ${mesPer(H.mes_real)}: descontada la inflación con el índice de precios al consumidor del INDEC, desde ${H.ini_real}, el primer año completo del índice de todo el país.`,
      "Población: proyecciones del INDEC con base en el Censo 2022."];
    return {respuesta, bajada, contexto, medimos, sintesis, lim, notas, secciones: [
      {preg: "¿Cuántos aportantes hay por cada jubilación?", g: "aportantes-ratio", forma: "lineas",
        tit: `En ${cuando} había ${n2(J.ratio)} aportantes por cada jubilación o pensión`,
        pie: "Personas que aportan sobre beneficios que paga ANSES, promedio de cada año.", txt: [s1]},
      {preg: "¿Cuántos aportan y cuántos cobran?", g: "ap-cuentas", forma: "lineas",
        tit: `Desde ${ini.anio}, los aportantes ${cambioPl(vA)} y los beneficios ${cambioPl(vB)}`,
        pie: "Millones de personas que aportan y de beneficios que paga ANSES, promedio de cada año.", txt: [s2]},
      {preg: "¿En qué años crecieron más los beneficios?", g: "ap-crec", forma: "lineas",
        tit: `El año en que más crecieron los beneficios fue ${salto.anio}: ${pct(salto.b)}`,
        pie: "% de cambio frente al año anterior, años completos.", txt: [s3]},
      {preg: "¿Cuánto representa una jubilación frente a un salario?", g: "aportantes-haberes", forma: "lineas",
        tit: `La jubilación promedio equivalía al ${pct(H.pct_jub)} del salario promedio en ${H.anio}`,
        pie: "% del salario promedio de los asalariados registrados sujeto a aportes, sin aguinaldo. Promedio de cada año.", txt: [s4]},
      {preg: "¿Cuánto compran los haberes?", g: "ap-real", forma: "lineas",
        tit: `Descontada la inflación, el haber mínimo con refuerzos ${cambioPct(H.var_real_min_ad)} desde ${H.ini_real}`,
        pie: `Pesos de ${mesPer(H.mes_real)} por mes, descontada la inflación. Promedio de cada año.`, txt: [s5]},
    ]};
  },
  dib: {
    "aportantes-ratio": (el, a) => lineas(el, {anim: a, data: T.jubilaciones_aportantes, x: "anio", y0: 0, vf: n2, yf: v => n1(v),
      series: [{k: "aportantes_por_beneficio", c: NAR, lab: "Por beneficio"}], xl: d => d.mes ? `${MESES[d.mes - 1]} de ${d.anio}` : d.anio}),
    "ap-cuentas": (el, a) => lineas(el, {anim: a, data: T.jubilaciones_aportantes, x: "anio", y0: 0, vf: v => n1(v / 1e6) + " M", yf: v => v === 0 ? "0" : n0(v / 1e6) + " M",
      xl: d => d.mes ? `${MESES[d.mes - 1]} de ${d.anio}` : d.anio,
      series: [{k: "aportantes", lab: "Aportantes", c: NAR}, {k: "beneficios", lab: "Beneficios", c: FRI}]}),
    "ap-crec": (el, a) => {
      const comp = T.jubilaciones_aportantes.filter(r => !r.mes);
      const data = comp.slice(1).map((r, i) => ({anio: r.anio, a: (r.aportantes / comp[i].aportantes - 1) * 100, b: (r.beneficios / comp[i].beneficios - 1) * 100}));
      return lineas(el, {anim: a, data, x: "anio", conNegativos: true, ref: 0, vf: v => (v > 0 ? "+" : "") + pct(v), yf: v => n0(v) + "%",
        series: [{k: "b", lab: "Beneficios", c: FRI}, {k: "a", lab: "Aportantes", c: NAR}]});
    },
    "aportantes-haberes": (el, a) => lineas(el, {anim: a, data: T.haberes_previsionales, x: "anio", y0: 0, vf: pct, yf: v => n0(v) + "%",
      xl: r => r.meses < 12 ? `${r.anio}, hasta ${MESES[r.meses - 1]}` : r.anio,
      series: [{k: "pct_jubilacion", lab: "Jubilación promedio", corto: "Promedio", c: NAR}, {k: "pct_minimo_adicionales", lab: "Mínimo con refuerzos", corto: "Con refuerzos", c: FRI}]}),
    "ap-real": (el, a) => lineas(el, {anim: a, data: T.haberes_previsionales.filter(r => r.jubilacion_promedio_real != null), x: "anio", y0: 0,
      vf: v => n0(v / 1e3) + " mil", yf: v => v === 0 ? "0" : n1(v / 1e6).replace(/,0$/, "") + " M", xl: r => r.meses < 12 ? `${r.anio}, hasta ${MESES[r.meses - 1]}` : r.anio,
      series: [{k: "salario_promedio_real", lab: "Salario promedio", corto: "Salario", c: css("--azul-hondo")}, {k: "jubilacion_promedio_real", lab: "Jubilación promedio", corto: "Jubilación", c: NAR},
        {k: "haber_minimo_adicionales_real", lab: "Mínimo con refuerzos", corto: "Mínimo", c: FRI}]}),
  },
}, {
  // etapa 5 del plan de mejora: la maternidad adolescente en el primer y el último año con datos, provincia por provincia (auditoría de los
  // artículos, idea 4: antes y después, sin atribuir la causa)
  id: "a-madres-adolescentes", frec: "Se actualiza cada año", tablas: ["madres_adolescentes_provincias", "nacimientos", "cruces_provincias"],
  dek: "La parte de los nacimientos de cada provincia que son de madres menores de 20 años, en el primer y en el último año con datos, cuánto bajó en proporción, cuántos nacimientos de madres adolescentes hubo cada año, cómo bajaron frente al resto y frente a la OCDE, y si hay más donde más hogares tienen necesidades básicas insatisfechas.",
  fichas: [["f-adolescentes", "maternidad adolescente"], ["f-adolescentes-nse", "maternidad adolescente y condiciones de vida"], ["f-nacimientos", "nacimientos"]],
  csv: [["madres_adolescentes_provincias", "Descargar CSV por provincia"], ["nacimientos", "Descargar CSV por año"]],
  fuentes: "Dirección de Estadísticas e Información en Salud (DEIS), Ministerio de Salud, estadísticas vitales, Banco Mundial, tasa de natalidad y " +
    "población de los países de la OCDE, e INDEC, Censo Nacional de Población, Hogares y Viviendas",
  texto: () => {
    const N = nac, P = T.madres_adolescentes_provincias, Y = T.nacimientos, dif = r => r[ADO_INI] - r[ADO_ULT];
    const bajaron = P.filter(r => r[ADO_ULT] < r[ADO_INI]).length, mas = [...P].sort((a, b) => dif(b) - dif(a))[0];
    const rel = r => dif(r) / r[ADO_INI] * 100, porRel = [...P].sort((a, b) => rel(b) - rel(a)), masRel = porRel[0], menosRel = porRel.at(-1);
    const alto = [...P].sort((a, b) => b[ADO_ULT] - a[ADO_ULT])[0], bajo = [...P].sort((a, b) => a[ADO_ULT] - b[ADO_ULT])[0];
    const mitad = P.filter(r => rel(r) >= 50).length, y0 = Y[0], yU = Y.at(-1);
    const vAdo = (yU.madres_menores_20 / y0.madres_menores_20 - 1) * 100, vTot = (yU.nacimientos / y0.nacimientos - 1) * 100;
    const respuesta = `De ${n1(N.pct_ini)} a ${n1(N.pct_ult)} de cada 100 nacimientos del país, entre ${N.anio_ini} y ${N.anio_ult}.`;
    const bajada = `En cantidad, los nacimientos de madres menores de 20 años pasaron de ${n0(N.ado_pico)} en ${N.ado_anio_pico}, el máximo desde ${N.anio_ini}, ` +
      `a ${n0(N.ado_ult)} en ${N.anio_ult}: ${pct(Math.abs(N.ado_caida))} menos. ` +
      (bajaron === P.length ? `La parte de madres adolescentes bajó en las ${P.length} jurisdicciones.` : `La parte de madres adolescentes bajó en ${bajaron} de las ${P.length} jurisdicciones.`);
    const contexto = "Tener un hijo antes de los 20 años cambia la vida de una adolescente: puede cortar la escuela y el primer trabajo, y muchos de esos " +
      "embarazos no fueron buscados. Por eso la maternidad adolescente es uno de los datos que más se siguen en salud pública. En los mismos años bajó " +
      "también la cantidad total de nacimientos, en todas las edades de las madres. Este artículo muestra cuánto bajó en cada provincia, sin atribuirle una causa.";
    const medimos = ["La maternidad adolescente se mide acá como la parte de los nacimientos de cada año cuya madre tenía menos de 20 años, según las " +
      "estadísticas vitales del Ministerio de Salud. Cada nacimiento se cuenta en la provincia donde vive la madre.",
      "Las necesidades básicas insatisfechas son una medida del censo: un hogar las tiene si suma al menos una de cinco carencias, como más de tres " +
      "personas por cuarto, una vivienda precaria, no tener baño o un chico de 6 a 12 años que no va a la escuela."];
    // 1. cada provincia, antes y después
    const s1 = `La que más bajó, en puntos, fue ${mas.territorio}: de ${pct(mas[ADO_INI])} a ${pct(mas[ADO_ULT])} de los nacimientos. ` +
      `En ${N.anio_ult}, la parte más alta era la de ${alto.territorio}, ${pct(alto[ADO_ULT])}, y la más baja, la de ${bajo.territorio}, ${pct(bajo[ADO_ULT])}. ` +
      `En ${N.anio_ini}, la más alta había sido de ${pct(Math.max(...P.map(r => r[ADO_INI])))}. En ${N.anio_ult}, la parte era mayor que el promedio del país en ` +
      `${P.filter(r => r[ADO_ULT] > N.pct_ult).length} jurisdicciones: ${listaY(P.filter(r => r[ADO_ULT] > N.pct_ult).map(r => r.territorio).sort())}.`;
    // 2. en proporción
    const s2 = `En proporción a lo que había en ${N.anio_ini}, la que más bajó fue ${masRel.territorio}: ${pct(rel(masRel))} menos. La que menos bajó fue ` +
      `${menosRel.territorio}, ${pct(rel(menosRel))}. En ${mitad} de las ${P.length} jurisdicciones, la parte de madres adolescentes se redujo a la mitad o menos. ` +
      `La baja mediana, en proporción, fue del ${pct(d3.median(P, rel))}. ` +
      "Una provincia con poca maternidad adolescente puede bajar pocos puntos y mucho en proporción: por eso se miran las dos cosas.";
    // 3. la cantidad por año
    const s3 = `Desde ${N.anio_ini}, los nacimientos de madres adolescentes bajaron ${pctAbs(vAdo)}: de ${n0(y0.madres_menores_20)} a ${n0(yU.madres_menores_20)}, ` +
      `es decir, de unos ${n0(y0.madres_menores_20 / 365)} por día a unos ${n0(yU.madres_menores_20 / 365)}. ` +
      (Y.filter(r => r.anio > N.ado_anio_pico).every((r, i, xs) => r.madres_menores_20 < (i ? xs[i - 1] : Y.find(x => x.anio === N.ado_anio_pico)).madres_menores_20)
        ? `Desde ${N.ado_anio_pico}, cada año hubo menos que el anterior.` : "");
    // 4. frente al total de nacimientos
    const s4 = `Los nacimientos de madres adolescentes bajaron más que el total: desde ${N.anio_ini}, ${pctAbs(vAdo)} contra ${pctAbs(vTot)}. Por eso su parte ` +
      `en los nacimientos también bajó, de ${pct(N.pct_ini)} a ${pct(N.pct_ult)}. Si hubieran bajado igual que el resto, la parte habría quedado igual. ` +
      `Los nacimientos de madres de 20 años o más bajaron ${pctAbs(((yU.nacimientos - yU.madres_menores_20) / (y0.nacimientos - y0.madres_menores_20) - 1) * 100)}: ` +
      "la baja de los nacimientos es general, pero es más fuerte entre las adolescentes.";
    // 5. frente a la OCDE
    const s5 = `La caída de los nacimientos no es solo de la Argentina, pero acá fue más rápida. Desde ${N.anio_pico}, el año con más nacimientos de la serie, ` +
      `bajaron ${pctAbs(N.caida)} en el país y ${pctAbs(N.ocde_caida)} en el conjunto de los 38 países de la OCDE, hasta ${N.ocde_ult}. ` +
      "La OCDE reúne sobre todo a países de ingresos altos, donde los nacimientos ya venían bajando desde hace décadas y la maternidad adolescente era " +
      `mucho más baja. En ${yU.anio}, la Argentina tuvo ${n0(yU.idx_argentina)} nacimientos por cada 100 de ${y0.anio}. ` +
      "La comparación es con el total de nacimientos, no con los de madres adolescentes.";
    // 6. el cruce con las necesidades básicas insatisfechas
    const c = calcularArt({tabla: "cruces_provincias"}, {x: "pct_hog_nbi_2022", y: "madres_adolescentes"});
    const s6 = `${c.rs <= -.2 ? "No: la relación va en sentido contrario." : respuestaR(c.rs)} En las ${c.h} jurisdicciones con más hogares con necesidades ` +
      `básicas insatisfechas, la mediana de madres adolescentes es del ${pct(c.medMas)} de los nacimientos. En las ${c.h} con menos, del ${pct(c.medMenos)}. ` +
      `La jurisdicción que más se aparta de la tendencia es ${c.lejos.territorio}, con ${pct(c.lejos.pct_hog_nbi_2022)} de hogares con necesidades básicas ` +
      `insatisfechas y ${pct(c.lejos.madres_adolescentes)} de madres adolescentes. Que vayan juntos no quiere decir que uno cause el otro.`;
    const sintesis = [`La parte de los nacimientos de madres menores de 20 años bajó de ${pct(N.pct_ini)} a ${pct(N.pct_ult)} entre ${N.anio_ini} y ${N.anio_ult}.`,
      bajaron === P.length ? `Bajó en las ${P.length} jurisdicciones, y en ${mitad} se redujo a la mitad o menos.` : `Bajó en ${bajaron} de las ${P.length} jurisdicciones.`,
      `Los nacimientos de madres adolescentes bajaron ${pctAbs(vAdo)} y el total, ${pctAbs(vTot)}.`,
      `En ${N.anio_ult}, la parte más alta era la de ${alto.territorio}, ${pct(alto[ADO_ULT])}, y la más baja, la de ${bajo.territorio}, ${pct(bajo[ADO_ULT])}.`,
      `Entre las jurisdicciones, las necesidades básicas insatisfechas y la maternidad adolescente tienen una relación ${fuerza(c.rs)}.`];
    const lim = ["Es la parte de los nacimientos, no la cantidad de nacimientos cada 1.000 adolescentes: también cambia cuando cambian los nacimientos de las madres adultas.",
      "En esos años cambiaron las políticas de salud sexual y reproductiva, entre ellas un plan nacional de prevención del embarazo no intencional en la " +
      "adolescencia desde 2017, la educación y la economía. Estos datos no permiten separar el efecto de cada cambio.",
      "Las estadísticas vitales se publican con más de un año de demora, y un nacimiento puede registrarse tarde.",
      "La relación con las necesidades básicas insatisfechas es entre provincias, no entre personas, y compara el censo de 2022 con los nacimientos de " + N.anio_ult + ".",
      ...(Math.abs(c.rs) < .4 ? [`Con ${c.n} jurisdicciones y una relación ${fuerza(c.rs)}, la diferencia entre las dos mitades puede ser casualidad.`] : [])];
    const notas = ["Nacimientos: estadísticas vitales de la DEIS (Ministerio de Salud), nacidos vivos por edad de la madre y provincia de residencia.",
      `OCDE: estimación del Banco Mundial para ${N.ocde_ult}, con la tasa de natalidad y la población de los 38 países miembros, sin la Argentina.`,
      "Necesidades básicas insatisfechas: INDEC, Censo 2022, % de los hogares.",
      `La relación se mide con la correlación de Spearman: ${rTxt(c.rs)}, en una escala de menos 1 a 1.`];
    return {respuesta, bajada, contexto, medimos, sintesis, lim, notas, secciones: [
      {preg: "¿Cuánto bajó en cada provincia?", g: "ado-provincias", forma: "pesas",
        tit: bajaron === P.length ? `La parte de madres adolescentes bajó en las ${P.length} jurisdicciones` : `La parte de madres adolescentes bajó en ${bajaron} de las ${P.length} jurisdicciones`,
        pie: `% de los nacidos vivos de cada provincia. El círculo claro marca ${N.anio_ini} y el oscuro, ${N.anio_ult}.`, txt: [s1]},
      {preg: "¿Dónde bajó más en proporción?", g: "ado-rel", forma: "barras",
        tit: `En ${mitad} de las ${P.length} jurisdicciones, se redujo a la mitad o menos`,
        pie: `% de baja de la parte de madres adolescentes entre ${N.anio_ini} y ${N.anio_ult}, frente a lo que había en ${N.anio_ini}.`, txt: [s2]},
      {preg: "¿Cuántos nacimientos de madres adolescentes hay por año?", g: "ado-serie", forma: "lineas",
        tit: `De ${n0(N.ado_pico)} en ${N.ado_anio_pico} a ${n0(N.ado_ult)} en ${N.anio_ult}`,
        pie: "Nacidos vivos de madres menores de 20 años, registrados en las estadísticas vitales.", txt: [s3]},
      {preg: "¿Bajaron más que el resto de los nacimientos?", g: "ado-indices", forma: "lineas",
        tit: `Desde ${N.anio_ini}, los de madres adolescentes bajaron ${pctAbs(vAdo)} y el total, ${pctAbs(vTot)}`,
        pie: `Índice, ${N.anio_ini} = 100.`, txt: [s4]},
      {preg: "¿Bajaron los nacimientos también en otros países?", g: "ado-ocde", forma: "lineas",
        tit: `Desde ${N.anio_pico}, los nacimientos bajaron ${pctAbs(N.caida)} en la Argentina y ${pctAbs(N.ocde_caida)} en la OCDE`,
        pie: `Índice, ${N.anio_ini} = 100. La OCDE es una estimación del Banco Mundial para los 38 países miembros.`, txt: [s5]},
      {preg: "¿Hay más madres adolescentes donde más hogares tienen necesidades básicas insatisfechas?", g: "ado-nbi", forma: "puntos",
        tit: `Necesidades básicas insatisfechas y madres adolescentes: una relación ${fuerza(c.rs)}`,
        pie: `Cada punto es una jurisdicción. Necesidades básicas insatisfechas: % de los hogares, censo de 2022. Madres adolescentes: % de los nacimientos, ${N.anio_ult}. La línea punteada muestra la tendencia.`, txt: [s6]},
    ]};
  },
  dib: {
    "ado-provincias": (el, a) => pesas(el, {anim: a, data: T.madres_adolescentes_provincias, a: ADO_INI, b: ADO_ULT, la: String(nac.anio_ini), lb: String(nac.anio_ult),
      mejor: "baja", uDif: " puntos", pais: [nac.pct_ini, nac.pct_ult]}),
    "ado-rel": (el, a) => barrasH(el, {anim: a, k: "baja", vf: pct, af: v => n0(v) + "%", ref: (nac.pct_ini - nac.pct_ult) / nac.pct_ini * 100,
      refLab: `País ${pct((nac.pct_ini - nac.pct_ult) / nac.pct_ini * 100)}`,
      data: T.madres_adolescentes_provincias.map(r => ({...r, baja: (r[ADO_INI] - r[ADO_ULT]) / r[ADO_INI] * 100})),
      tip: d => `<b>${d.territorio}</b><br>Bajó ${pct(d.baja)}: de ${pct(d[ADO_INI])} a ${pct(d[ADO_ULT])} de los nacimientos`}),
    "ado-serie": (el, a) => lineas(el, {anim: a, x: "anio", y0: 0, vf: n0, yf: ejeMil, data: T.nacimientos,
      series: [{k: "madres_menores_20", lab: "Madres menores de 20 años", corto: "Menores de 20", c: NAR}]}),
    "ado-indices": (el, a) => {
      const y0 = T.nacimientos[0];
      return lineas(el, {anim: a, x: "anio", y0: 0, vf: n0, yf: n0, ref: 100, data: T.nacimientos.map(r => ({...r, ado: r.madres_menores_20 / y0.madres_menores_20 * 100})),
        series: [{k: "idx_argentina", lab: "Todos los nacimientos", corto: "Todos", c: NAR}, {k: "ado", lab: "De madres adolescentes", corto: "Adolescentes", c: FRI}]});
    },
    "ado-ocde": (el, a) => lineas(el, {anim: a, x: "anio", y0: 0, vf: n0, yf: n0, ref: 100, data: T.nacimientos,
      series: [{k: "idx_argentina", lab: "Argentina", c: NAR}, {k: "idx_ocde", lab: "OCDE", c: css("--ocde")}]}),
    "ado-nbi": (el, a) => {
      const c = calcularArt({tabla: "cruces_provincias"}, {x: "pct_hog_nbi_2022", y: "madres_adolescentes"});
      dispersion(el, {anim: a, data: c.F, x: "pct_hog_nbi_2022", y: "madres_adolescentes", xLab: "Hogares con necesidades básicas insatisfechas", yLab: "Madres adolescentes",
        marcar: [c.mas, c.menos, c.lejos].map(f => f.codigo_indec), fx: v => n0(v) + "%", fy: v => n0(v) + "%",
        vx: v => `${pct(v)} de los hogares`, vy: v => `${pct(v)} de los nacimientos`});
    },
  },
}, {
  // etapa 5 del plan de mejora: el peso de cada provincia en el Congreso y su relación con los ATN, sin sugerir un intercambio (auditoría
  // de los artículos, idea 3: las dos cosas van con el tamaño de la provincia)
  id: "a-peso-voto", frec: "Se actualiza cada año", tablas: ["representacion_provincias", "cruces_provincias"],
  dek: "Cuántas bancas de diputados y senadores tiene cada provincia frente a su parte de la población, cuánto pesa solo en Diputados, cuántos habitantes representa cada legislador, cuántas bancas tendría si se repartieran solo por población y cómo se relaciona ese peso con los ATN que recibió cada provincia.",
  fichas: [["f-representacion", "representación en el Congreso"], ["f-atn", "ATN"], ["f-congreso", "composición del Congreso"]],
  csv: [["representacion_provincias", "Descargar CSV de la representación"]],
  fuentes: "Ley 22.847, Constitución Nacional, INDEC, proyecciones de población, y Presupuesto Abierto, Secretaría de Hacienda (ATN)",
  texto: () => {
    const K = R.congreso, TR = R.transferencias, rp = T.representacion_provincias, n = rp.length;
    const pobTot = d3.sum(rp, r => r.poblacion), dipTot = d3.sum(rp, r => r.diputados);
    // las bancas de Diputados si se repartieran solo por población, y el peso solo en Diputados
    const conProp = rp.map(r => ({...r, prop: r.poblacion / pobTot * dipTot, pesoDip: (r.diputados / dipTot) / (r.poblacion / pobTot)}));
    const ganan = conProp.filter(r => r.diputados > Math.round(r.prop)), pierden = conProp.filter(r => r.diputados < Math.round(r.prop));
    const masPierde = conProp.reduce((a, b) => (b.diputados - b.prop) < (a.diputados - a.prop) ? b : a);
    const dMax = conProp.reduce((a, b) => b.pesoDip > a.pesoDip ? b : a), dMin = conProp.reduce((a, b) => b.pesoDip < a.pesoDip ? b : a);
    const respuesta = `${n1(K.peso_max_v)} veces lo que le tocaría por su población en ${K.peso_max}, y ${n2(K.peso_min_v)} veces en ${K.peso_min}.`;
    const bajada = "El peso compara la parte de las bancas de las dos cámaras que tiene cada provincia con su parte de la población del país. " +
      "Con 1, el reparto sería proporcional. Con más de 1, sus habitantes tienen más legisladores que los que les tocarían por su cantidad, y con menos de 1, menos.";
    const contexto = `El Congreso tiene ${K.n_dip} diputados y ${K.n_sen} senadores. El Senado representa a las provincias, no a los habitantes: ` +
      "cada provincia y CABA tienen tres bancas, cualquiera sea su población. En Diputados, las bancas se reparten según la población, pero la ley " +
      "22.847, de 1983, fija un mínimo de cinco por provincia y todavía usa como base el censo de 1980. Las dos reglas dan más representación, por " +
      "habitante, a las provincias con menos población. Muchos países federales hacen algo parecido en su Senado, para que las regiones chicas no " +
      "queden siempre en minoría.";
    const medimos = ["El peso de una provincia es su parte de las bancas sobre su parte de la población. Si tiene el 2% de las bancas y el 1% de los " +
      "habitantes, su peso es 2: cada habitante tiene el doble de representación que si el reparto fuera proporcional.",
      `La población es la que proyecta el INDEC para ${R.anio_pob}. Las bancas de Diputados son las de la ley vigente.`];
    // 1. el peso en las dos cámaras
    const mas1 = rp.filter(r => r.peso_voto > 1), pobMas = d3.sum(mas1, r => r.poblacion);
    const s1 = `En ${mas1.length} de las ${n} jurisdicciones el peso es mayor que 1. Juntas tienen el ${pct(pobMas / pobTot * 100)} de la población del país. ` +
      `En el otro extremo, ${K.peso_min} tiene ${n2(K.peso_min_v)}: sus habitantes tienen el ${pct(K.peso_min_v * 100)} de la representación que les tocaría.`;
    // 2. solo en Diputados
    const s2 = `Sin el Senado, el peso cambia mucho menos. Solo en Diputados va de ${n2(dMin.pesoDip)} en ${dMin.territorio} a ${n1(dMax.pesoDip)} en ${dMax.territorio}. ` +
      "La diferencia viene sobre todo del mínimo de cinco diputados por provincia y de un reparto que todavía sigue al censo de 1980, cuando las provincias " +
      "patagónicas tenían bastante menos población. " +
      `Con este cálculo, ${conProp.filter(r => r.pesoDip > 1).length} jurisdicciones tienen en Diputados un peso mayor que 1.`;
    // 3. habitantes por diputado
    const s3 = `En ${K.rep_min} hay un diputado cada ${n0(K.rep_min_v)} habitantes. En ${K.rep_max}, uno cada ${n0(K.rep_max_v)}: ${veces(K.rep_max_v, K.rep_min_v)} veces más. ` +
      `En el promedio del país, uno cada ${n0(pobTot / dipTot)}. ${rp.filter(r => r.diputados === 5).length} jurisdicciones tienen el mínimo de cinco diputados.`;
    // 4. habitantes por senador
    const sen = [...rp].sort((a, b) => a.hab_por_senador - b.hab_por_senador), sMin = sen[0], sMax = sen.at(-1);
    const s4 = `En el Senado la diferencia es mayor: un senador cada ${n0(sMin.hab_por_senador)} habitantes en ${sMin.territorio} y uno cada ` +
      `${n0(sMax.hab_por_senador)} en ${sMax.territorio}, ${veces(sMax.hab_por_senador, sMin.hab_por_senador)} veces más. Es lo que busca el Senado: que cada provincia pese igual, ` +
      "tenga la población que tenga.";
    // 5. las bancas por población
    const s5 = `Si las ${dipTot} bancas de Diputados se repartieran solo por la población de hoy, ${ganan.length} jurisdicciones tendrían menos diputados que ` +
      `ahora y ${pierden.length} tendrían más. La que más sumaría es ${masPierde.territorio}: ${n0(masPierde.prop)} bancas en lugar de ${masPierde.diputados}. ` +
      "Para cambiar el reparto hace falta una ley del Congreso, que votan también los legisladores de las provincias que perderían bancas.";
    // 6. el peso y los ATN: las dos mitades por peso, y los dos datos frente a la población
    const c = calcularArt({tabla: "cruces_provincias"}, {x: "peso_voto", y: "atn_hab"});
    const conPob = k => CX.spearman(c.F.map(f => f.poblacion), c.F.map(f => f[k]));
    const s6 = `${c.rs <= -.2 ? "No: la relación va en sentido contrario." : respuestaR(c.rs)} ` +
      `En las ${c.h} con más peso, la mediana fue de ${n0(c.medMas)} pesos de ${TR.ult} por habitante por año, en promedio de ${TR.desde} a ${TR.ult}. ` +
      `En las ${c.h} con menos peso, de ${n0(c.medMenos)} pesos.` +
      (conPob("peso_voto") <= -.6 && conPob("atn_hab") <= -.2 ? " Las dos cosas van con el tamaño de la provincia: el peso en el Congreso depende casi solo de la " +
        "población, y las provincias con menos habitantes también recibieron, en general, más ATN por habitante. Por eso este cruce no permite saber si una cosa influye en la otra." : "") +
      ` La que más se aparta de la tendencia es ${c.lejos.territorio}, con un peso de ${n2(c.lejos.peso_voto)} y ${n0(c.lejos.atn_hab)} pesos de ATN por habitante.`;
    const sintesis = [`El peso de cada habitante en el Congreso va de ${n2(K.peso_min_v)} en ${K.peso_min} a ${n1(K.peso_max_v)} en ${K.peso_max}.`,
      `Solo en Diputados, va de ${n2(dMin.pesoDip)} a ${n1(dMax.pesoDip)}: la mayor parte de la diferencia viene del Senado.`,
      `Con un reparto solo por población, ${masPierde.territorio} tendría ${n0(masPierde.prop)} diputados en lugar de ${masPierde.diputados}.`,
      `El peso en el Congreso y los ATN por habitante tienen una relación ${fuerza(c.rs)}, y los dos van con el tamaño de la provincia.`];
    const lim = ["El peso usa la población proyectada por el INDEC para hoy, no la del censo de 1980 con la que se repartieron las bancas de Diputados.",
      "Cuenta las bancas de cada provincia, no cómo votan sus legisladores: dos diputados de la misma provincia pueden votar distinto.",
      "Los ATN son un promedio de muchos años y los asigna el Ministerio del Interior. Este artículo no dice que se den a cambio de votos: el artículo sobre los ATN y el presupuesto mira eso por separado.",
      "La ley 22.847 se dictó en julio de 1983, antes de que asumiera el gobierno elegido en las elecciones de ese año, y no se cambió desde entonces.",
      "Las bancas por población son un cálculo con la regla más simple, sin mínimos ni redondeos de ley: sirven para ver la distancia, no como propuesta.",
      ...(Math.abs(c.rs) < .4 ? [`Con ${c.n} jurisdicciones y una relación ${fuerza(c.rs)}, la diferencia entre las dos mitades puede ser casualidad.`] : [])];
    const notas = ["Bancas: Constitución Nacional (tres senadores por provincia y por CABA) y ley 22.847 (diputados por provincia).",
      `Población: proyecciones del INDEC con base en el Censo 2022, ${R.anio_pob}.`,
      `ATN: Presupuesto Abierto, Secretaría de Hacienda, en pesos de ${TR.ult} con el deflactor del PBI, promedio por año de ${TR.desde} a ${TR.ult}.`,
      `La relación se mide con la correlación de Spearman: ${rTxt(c.rs)}, en una escala de menos 1 a 1.`];
    return {respuesta, bajada, contexto, medimos, sintesis, lim, notas, secciones: [
      {preg: "¿Cuánto pesa en el Congreso el voto de cada provincia?", g: "peso-voto", forma: "barras",
        tit: `Un habitante de ${K.peso_max} tiene ${n1(K.peso_max_v)} veces la representación que le tocaría por su población`,
        pie: "Parte de las bancas de diputados y senadores de cada jurisdicción sobre su parte de la población. La línea marca 1, el reparto proporcional.", txt: [s1]},
      {preg: "¿Y solo en Diputados?", g: "peso-dip", forma: "barras",
        tit: `Solo en Diputados, el peso va de ${n2(dMin.pesoDip)} a ${n1(dMax.pesoDip)}`,
        pie: "Parte de las bancas de diputados de cada jurisdicción sobre su parte de la población. La línea marca 1.", txt: [s2]},
      {preg: "¿Cuántos habitantes representa cada diputado?", g: "peso-diputado", forma: "barras",
        tit: `Un diputado de ${K.rep_max} representa ${veces(K.rep_max_v, K.rep_min_v)} veces más habitantes que uno de ${K.rep_min}`,
        pie: `Población proyectada por el INDEC para ${R.anio_pob} sobre las bancas de diputados de cada jurisdicción.`, txt: [s3]},
      {preg: "¿Y cada senador?", g: "peso-senador", forma: "barras",
        tit: `Un senador de ${sMax.territorio} representa ${veces(sMax.hab_por_senador, sMin.hab_por_senador)} veces más habitantes que uno de ${sMin.territorio}`,
        pie: `Población proyectada por el INDEC para ${R.anio_pob} sobre las tres bancas de senadores de cada jurisdicción.`, txt: [s4]},
      {preg: "¿Cuántas bancas tendría cada provincia con un reparto solo por población?", g: "peso-bancas", forma: "barras",
        tit: `${masPierde.territorio} tendría ${n0(masPierde.prop)} diputados en lugar de ${masPierde.diputados}`,
        pie: `Bancas de diputados de más o de menos frente a un reparto de las ${dipTot} bancas solo por la población de ${R.anio_pob}.`, txt: [s5]},
      {preg: "¿Recibieron más ATN las provincias con más peso en el Congreso?", g: "peso-atn", forma: "puntos",
        tit: `Peso en el Congreso y ATN por habitante: una relación ${fuerza(c.rs)}`,
        pie: `Cada punto es una jurisdicción. ATN: pesos de ${TR.ult} por habitante por año, en promedio de ${TR.desde} a ${TR.ult}. La línea punteada muestra la tendencia.`, txt: [s6]},
    ]};
  },
  dib: {
    "peso-voto": (el, a) => barrasH(el, {anim: a, data: T.representacion_provincias, k: "peso_voto", vf: n2, af: v => n1(v).replace(/,0$/, ""),
      ref: 1, refLab: "Proporcional: 1", tip: d => `<b>${d.territorio}</b><br>Peso: ${n2(d.peso_voto)}<br>${d.diputados} diputados y 3 senadores`}),
    "peso-dip": (el, a) => {
      const rp = T.representacion_provincias, pob = d3.sum(rp, r => r.poblacion), dip = d3.sum(rp, r => r.diputados);
      return barrasH(el, {anim: a, k: "p", vf: n2, af: v => n1(v).replace(/,0$/, ""), ref: 1, refLab: "Proporcional: 1",
        data: rp.map(r => ({...r, p: (r.diputados / dip) / (r.poblacion / pob)})), tip: d => `<b>${d.territorio}</b><br>Peso en Diputados: ${n2(d.p)}<br>${d.diputados} diputados`});
    },
    "peso-diputado": (el, a) => barrasH(el, {anim: a, data: T.representacion_provincias, k: "hab_por_diputado", vf: n0, af: ejeMil,
      tip: d => `<b>${d.territorio}</b><br>${n0(d.hab_por_diputado)} habitantes por diputado<br>${n0(d.hab_por_senador)} habitantes por senador`}),
    "peso-senador": (el, a) => barrasH(el, {anim: a, data: T.representacion_provincias, k: "hab_por_senador", vf: n0, af: ejeMil,
      tip: d => `<b>${d.territorio}</b><br>${n0(d.hab_por_senador)} habitantes por senador`}),
    "peso-bancas": (el, a) => {
      const rp = T.representacion_provincias, pob = d3.sum(rp, r => r.poblacion), dip = d3.sum(rp, r => r.diputados);
      return barrasH(el, {anim: a, k: "d", vf: v => (v > 0 ? "+" : "") + n0(v), af: n0,
        data: rp.map(r => ({...r, prop: r.poblacion / pob * dip, d: Math.round(r.poblacion / pob * dip) - r.diputados})),
        tip: d => `<b>${d.territorio}</b><br>Hoy: ${d.diputados} diputados<br>Solo por población: ${n0(d.prop)}`});
    },
    "peso-atn": (el, a) => {
      const c = calcularArt({tabla: "cruces_provincias"}, {x: "peso_voto", y: "atn_hab"});
      dispersion(el, {anim: a, data: c.F, x: "peso_voto", y: "atn_hab", xLab: "Peso en el Congreso", yLab: "ATN por habitante",
        marcar: [c.mas, c.menos, c.lejos].map(f => f.codigo_indec), fx: v => n1(v).replace(/,0$/, ""), fy: n0,
        vx: n2, vy: v => `${n0(v)} pesos de ${R.transferencias.ult} por habitante por año`});
    },
  },
}, {
  // etapa 5 del plan de mejora: qué es la coparticipación y cuánto recibe cada provincia (auditoría de los artículos, idea 2). Suma el cruce
  // de los recursos propios con el empleo privado, que hasta entonces era un artículo aparte (a-recursos-empleo). Desde el 2 de noviembre de
  // 2026 (pedido del autor: artículos más largos, mejor estructurados y con más gráficos, como los de Fundar), el piloto del modelo nuevo:
  // "En síntesis", "Qué medimos", secciones con su pregunta y un gráfico cuyo título es la conclusión, y "Fuentes y metodología" con notas
  id: "a-coparticipacion", frec: "Se actualiza cada año", tablas: ["coparticipacion_provincias", "fiscal_provincias", "cruces_provincias", "transferencias_provincias"],
  dek: "Cómo reparte la Nación los impuestos con las provincias, cuánto recibe cada una por habitante, qué parte de sus ingresos es y cómo cambió, cuánto recauda cada provincia por su cuenta y cuánto pesan los fondos que la Nación reparte sin una regla fija.",
  fichas: [["f-coparticipacion", "coparticipación"], ["f-fiscal", "cuentas de las provincias"], ["f-atn", "transferencias de la Nación"], ["f-empleo", "empleo privado"]],
  csv: [["coparticipacion_provincias", "Descargar CSV de la coparticipación"], ["fiscal_provincias", "Descargar CSV de las cuentas de las provincias"],
    ["transferencias_provincias", "Descargar CSV de las transferencias no automáticas"]],
  fuentes: "Ministerio de Economía, esquema ahorro-inversión-financiamiento de cada provincia (tributos de origen nacional, recursos propios e " +
    "ingresos totales), Secretaría de Hacienda, Presupuesto Abierto (transferencias no automáticas), INDEC, proyecciones de población, y Secretaría " +
    "de Trabajo, Sistema Integrado Previsional Argentino (SIPA)",
  texto: () => {
    const C = CPA, F = R.fiscal, TR = R.transferencias, mill = v => v < 1e6 ? `${n0(v / 1e3)} mil pesos` : `${n2(v / 1e6)} millones de pesos`;
    const at = Object.entries(C.atrasadas), sin = at.length ? `, sin contar ${lista(at.map(([p]) => p))}` : "";
    const respuesta = `De ${mill(C.bajo_hab[1])} por habitante en ${C.bajo_hab[0]} a ${mill(C.top_hab[1])} en ${C.top_hab[0]}, en ${C.anio}.`;
    const bajada = `Es lo que recibió cada jurisdicción por la coparticipación federal y por los otros impuestos nacionales que se reparten por ley. ` +
      `En total, las provincias y CABA recibieron ${billones(C.millones)}${sin}: ${mill(C.pais_hab)} por habitante. El ${pct(C.federal)} fue coparticipación federal.`;
    const contexto = "La Nación cobra los impuestos que más recaudan, como el IVA y Ganancias, y reparte una parte con las provincias. Las reglas " +
      "están en la ley de coparticipación federal, la 23.548, de 1988. La parte de las provincias " +
      "se reparte con un porcentaje fijo para cada una, que no cambia con su población ni con lo que recauda. CABA y " +
      "Tierra del Fuego no figuran en esos porcentajes: su parte se fijó después. La Constitución de 1994 pidió una ley nueva, acordada entre la Nación y las provincias, que no se aprobó.";
    const medimos = ["Los recursos propios son lo que la provincia recauda por su cuenta, con sus impuestos, sus regalías y otros " +
      "ingresos. Las transferencias no automáticas son fondos que la Nación envía sin una regla fija: los Aportes del Tesoro Nacional (ATN) y otras."];
    // el reparto y la población: las dos mitades de jurisdicciones, por cantidad de habitantes
    const cp = T.coparticipacion_provincias, cpA = cp.filter(r => r.anio === C.anio), pob = Object.fromEntries(T.cruces_provincias.map(r => [r.codigo_indec, r.poblacion]));
    const porPob = [...cpA].filter(r => pob[r.codigo_indec]).sort((a, b) => pob[a.codigo_indec] - pob[b.codigo_indec]), h = Math.floor(porPob.length / 2);
    const medChicas = d3.median(porPob.slice(0, h), r => r.por_habitante), medGrandes = d3.median(porPob.slice(-h), r => r.por_habitante);
    const s1 = `${C.top_hab[0]} recibió por habitante ${veces(C.top_hab[1], C.bajo_hab[1])} veces lo que recibió ${C.bajo_hab[0]}. ` +
      `Como el reparto no sigue la cantidad de habitantes, las ${h} jurisdicciones con menos población recibieron una mediana de ${mill(medChicas)} ` +
      `por habitante, y las ${h} con más, ${mill(medGrandes)}.`;
    const s2 = `En ${C.mas_mitad} de las 24 jurisdicciones, estos fondos fueron más de la mitad de todos sus ingresos. La parte más alta fue la de ` +
      `${C.top_pct[0]}, el ${pct(C.top_pct[1])}, y la más baja, la de ${C.bajo_pct[0]}, el ${pct(C.bajo_pct[1])}. En el conjunto de las provincias y CABA, ` +
      `fue el ${pct(C.pct_pais)}.`;
    // cómo cambió desde el primer año de las cuentas: la parte de los ingresos de cada jurisdicción en ese año y en el último
    const cam = cp.filter(r => r.pct_ingresos_ini != null).map(r => ({...r, d: r.pct_ingresos - r.pct_ingresos_ini}));
    const subio = cam.filter(r => r.d >= .05).length, bajo = cam.filter(r => r.d <= -.05).length;
    const mx = cam.reduce((a, b) => b.d > a.d ? b : a), mn = cam.reduce((a, b) => b.d < a.d ? b : a);
    const s3 = `Entre ${C.ini} y ${C.anio}, la parte de estos fondos en los ingresos subió en ${subio} jurisdicciones y bajó en ${bajo}. ` +
      `En el conjunto pasó del ${pct(C.pct_pais_ini)} al ${pct(C.pct_pais)}. El cambio más grande hacia arriba fue el de ${mx.territorio}, ` +
      `de ${n1(mx.d)} puntos, y el más grande hacia abajo, el de ${mn.territorio}, de ${n1(Math.abs(mn.d))} puntos.`;
    const s4 = `De cada 100 pesos que ingresaron a ${F.low}, ${n0(F.low_v)} los recaudó la provincia. En ${F.top}, ${n0(F.top_v)}. ` +
      `La mitad de las provincias recaudó por su cuenta menos del ${pct(F.mediana)} de sus ingresos. En ${F.ini}, esa mediana era del ${pct(F.mediana_ini)}.`;
    // los fondos sin regla fija, en pesos del mismo año que la coparticipación cuando coinciden los años
    const mismo = TR.ult === C.anio, cada100 = mismo ? TR.otras_ult_pais / C.pais_hab * 100 : null;
    const s5 = `En ${TR.ult}, las transferencias no automáticas distintas de los ATN fueron de ${n0(TR.otras_ult_pais)} pesos por habitante en el conjunto ` +
      `de las provincias${mismo ? `, unos ${n1(cada100)} pesos por cada 100 de coparticipación y otros impuestos nacionales` : ""}. Por habitante, fueron de ` +
      `${n0(TR.otras_ult_min_v)} pesos en ${TR.otras_ult_min} a ${n0(TR.otras_ult_max_v)} en ${TR.otras_ult_max}. ` +
      (TR.n_atn_ult ? `Los ATN llegaron a ${TR.n_atn_ult} jurisdicciones, de ${n0(TR.atn_ult_min_v)} pesos por habitante en ${TR.atn_ult_min} a ${n0(TR.atn_ult_max_v)} en ${TR.atn_ult_max}.` :
        "Ese año no hubo ATN.") + ` La Nación decide cada año a quién se los da y cuánto.`;
    // el cruce que era un artículo aparte: recursos propios y empleo privado registrado
    const c = calcularArt({tabla: "cruces_provincias"}, {x: "autonomia_fiscal", y: "empleo_privado"});
    const s6 = `${c.rs <= -.2 ? "No: la relación va en sentido contrario." : respuestaR(c.rs)} En las ${c.h} jurisdicciones con más recursos propios, ` +
      `la mediana es de ${n1(c.medMas)} asalariados privados registrados cada 100 habitantes. En las ${c.h} con menos, de ${n1(c.medMenos)}. ` +
      `Que vayan juntos no quiere decir que uno cause el otro.`;
    const sintesis = [`${C.top_hab[0]} recibió por habitante ${veces(C.top_hab[1], C.bajo_hab[1])} veces lo que recibió ${C.bajo_hab[0]}.`,
      `En ${C.mas_mitad} de las 24 jurisdicciones, la coparticipación y los otros impuestos nacionales fueron más de la mitad de los ingresos.`,
      `La mitad de las provincias recaudó por su cuenta menos del ${pct(F.mediana)} de sus ingresos.`,
      ...(mismo ? [`Las transferencias no automáticas distintas de los ATN fueron unos ${n1(cada100)} pesos por cada 100 de coparticipación.`] : [])];
    const lim = ["Los montos son los tributos de origen nacional que registra cada provincia en sus cuentas: la coparticipación federal y lo que se reparte por otras leyes. No incluyen los ATN ni otras transferencias que la Nación decide cada año, que se muestran aparte.",
      "Son pesos de cada año. Por eso la comparación con " + C.ini + " usa porcentajes de los ingresos y no montos.",
      ...at.map(([p, a]) => `${p} todavía no publicó sus cuentas de ${C.anio}: en la parte de sus ingresos figura con ${a}, y no está en los pesos por habitante, porque los pesos de ${a} no se comparan con los de ${C.anio}.`),
      "Una parte de la relación entre recursos propios y empleo privado es contable: el impuesto provincial que más recauda, ingresos brutos, se cobra sobre la actividad de las empresas, que es también la que da empleo privado.",
      "Los recursos propios incluyen las regalías: una provincia con petróleo, gas o minería puede recaudar mucho sin tener mucho empleo privado.",
      "El SIPA asigna cada empleo a la provincia donde está inscripto el empleador. Por eso CABA aparece muy alta en el empleo privado, aunque parte de esos trabajos se hagan en otras provincias.",
      ...(Math.abs(c.rs) < .4 ? [`Con ${c.n} jurisdicciones y una relación ${fuerza(c.rs)}, la diferencia entre las dos mitades puede ser casualidad.`] : [])];
    const notas = ["Tributos de origen nacional: esquema ahorro-inversión-financiamiento de cada provincia (Ministerio de Economía), en pesos de cada año. Por habitante, con las proyecciones de población del INDEC del mismo año.",
      "Recursos propios: ingresos corrientes menos los tributos de origen nacional y las transferencias, más los recursos propios de capital, sobre los ingresos totales.",
      `Transferencias no automáticas: crédito devengado por provincia de destino (Presupuesto Abierto), en pesos de ${TR.ult} con el deflactor del PBI.`,
      "Empleo privado registrado: asalariados privados del SIPA cada 100 habitantes. La relación se mide con la correlación de Spearman, sobre los puestos de cada jurisdicción."];
    return {respuesta, bajada, contexto, lim, sintesis, medimos, notas, secciones: [
      {preg: "¿Cuánto recibe cada jurisdicción por habitante?", g: "copa-hab", forma: "barras",
        tit: `${C.top_hab[0]} recibe por habitante ${veces(C.top_hab[1], C.bajo_hab[1])} veces lo que recibe ${C.bajo_hab[0]}`,
        pie: `Coparticipación y otros impuestos nacionales, millones de pesos por habitante, ${C.anio}. La línea marca el conjunto de las provincias y CABA.`, txt: [s1]},
      {preg: "¿Qué parte de sus ingresos son esos fondos?", g: "copa-pct", forma: "barras",
        tit: `En ${C.mas_mitad} de las 24 jurisdicciones, más de la mitad de los ingresos llega por esta vía`,
        pie: `% de los ingresos totales de cada jurisdicción, ${C.anio_txt}.`, txt: [s2]},
      {preg: `¿Cambió esa dependencia desde ${C.ini}?`, g: "copa-cambio", forma: "barras",
        tit: `La parte de estos fondos en los ingresos subió en ${subio} jurisdicciones y bajó en ${bajo}`,
        pie: `% de los ingresos totales de cada jurisdicción. Círculo claro: ${C.ini}. Círculo lleno: ${C.anio_txt}.`, txt: [s3]},
      {preg: "¿Cuánto recauda cada provincia por su cuenta?", g: "copa-propios", forma: "barras",
        tit: `De cada 100 pesos que ingresan a ${F.top}, ${n0(F.top_v)} los recauda la provincia. En ${F.low}, ${n0(F.low_v)}`,
        pie: `Recursos propios, % de los ingresos totales de cada jurisdicción, ${F.anio_txt}.`, txt: [s4]},
      {preg: "¿Y los fondos que la Nación reparte sin una regla fija?", g: "copa-no-aut", forma: "barras",
        tit: mismo ? `Las transferencias no automáticas distintas de los ATN fueron unos ${n1(cada100)} pesos por cada 100 de coparticipación` :
          `Las transferencias no automáticas van de ${n0(TR.otras_ult_min_v)} a ${n0(TR.otras_ult_max_v)} pesos por habitante`,
        pie: `Transferencias no automáticas (ATN y otras), pesos por habitante, ${TR.ult}. La línea marca el conjunto de las provincias.`, txt: [s5]},
      {preg: "¿Tienen más empleo privado las provincias que recaudan más por su cuenta?", g: "copa-empleo", forma: "puntos",
        tit: `Recursos propios y empleo privado registrado: una relación ${fuerza(c.rs)}`,
        pie: "Cada punto es una jurisdicción. Recursos propios: % de sus ingresos. Empleo privado: asalariados registrados cada 100 habitantes. La línea punteada muestra la tendencia.", txt: [s6]},
    ]};
  },
  dib: {
    "copa-hab": (el, a) => barrasH(el, {anim: a, data: T.coparticipacion_provincias.filter(r => r.anio === CPA.anio), k: "por_habitante", vf: millonesM, af: ejeM,
      ref: CPA.pais_hab, refLab: `País ${millonesM(CPA.pais_hab)}`, tip: d => `<b>${d.territorio}</b><br>${n0(d.por_habitante)} pesos por habitante en ${CPA.anio}`}),
    "copa-pct": (el, a) => barrasH(el, {anim: a, data: T.coparticipacion_provincias.map(r => CPA.atrasadas[r.territorio] ? {...r, territorio: `${r.territorio} (${CPA.atrasadas[r.territorio]})`} : r),
      k: "pct_ingresos", vf: pct, af: v => n0(v) + "%", ref: CPA.pct_pais, refLab: `País ${pct(CPA.pct_pais)}`,
      tip: d => `<b>${d.territorio}</b><br>${pct(d.pct_ingresos)} de sus ingresos en ${d.anio}`}),
    "copa-cambio": (el, a) => pesas(el, {anim: a, data: T.coparticipacion_provincias.filter(r => r.pct_ingresos_ini != null), a: "pct_ingresos_ini", b: "pct_ingresos",
      la: String(CPA.ini), lb: String(CPA.anio), vf: pct, af: v => n0(v) + "%", x0: 0, ref: CPA.pct_pais, refLab: `País ${CPA.anio}: ${pct(CPA.pct_pais)}`}),
    "copa-propios": (el, a) => barrasH(el, {anim: a, data: T.fiscal_provincias.map(r => r.anio !== R.fiscal.anio ? {...r, territorio: `${r.territorio} (${r.anio})`} : r),
      k: "autonomia", vf: pct, af: v => n0(v) + "%", ref: R.fiscal.pais, refLab: `País ${pct(R.fiscal.pais)}`,
      tip: d => `<b>${d.territorio}</b><br>Recursos propios: ${pct(d.autonomia)} de sus ingresos en ${d.anio}`}),
    "copa-no-aut": (el, a) => {
      const u = T.transferencias_provincias.filter(r => r.anio === R.transferencias.ult).map(r => ({...r, no_aut: r.atn_hab + r.otras_hab}));
      const pais = d3.sum(u, r => r.atn + r.otras) * 1e6 / d3.sum(u, r => r.pob);
      return barrasH(el, {anim: a, data: u, k: "no_aut", vf: n0, af: ejeMil, ref: pais, refLab: `Conjunto ${n0(pais)}`,
        tip: d => `<b>${d.territorio}</b><br>${n0(d.no_aut)} pesos por habitante en ${R.transferencias.ult}<br>ATN: ${n0(d.atn_hab)}. Otras: ${n0(d.otras_hab)}`});
    },
    "copa-empleo": (el, a) => {
      const c = calcularArt({tabla: "cruces_provincias"}, {x: "autonomia_fiscal", y: "empleo_privado"});
      dispersion(el, {anim: a, data: c.F, x: "autonomia_fiscal", y: "empleo_privado", xLab: "Recursos propios", yLab: "Empleo privado registrado",
        marcar: [c.mas, c.menos, c.lejos].map(f => f.codigo_indec), fx: v => n0(v) + "%", fy: n0,
        vx: v => `${pct(v)} de sus ingresos`, vy: v => `${n1(v)} asalariados cada 100 habitantes`});
    },
  },
}, {
  // etapa 5 del plan de mejora: la línea de pobreza de cada región, con una calculadora para armar el hogar propio (auditoría de los
  // artículos, idea 1). La canasta de cada región es la del último mes del informe semestral, y la tabla de adulto equivalente, la del INDEC
  id: "a-canasta-regiones", frec: "Se actualiza cada semestre", tablas: ["canasta_regiones", "adulto_equivalente", "pobreza_aglomerados", "canasta_mensual"],
  dek: "Lo que necesita por mes un hogar para no quedar bajo la línea de pobreza en cada una de las seis regiones del INDEC, una calculadora para el hogar propio, cuánto pesan los alimentos, cuánto subió la canasta y la parte de las personas bajo las líneas de pobreza y de indigencia en cada región.",
  fichas: [["f-canastas", "canastas básicas"], ["f-pobreza-aglomerados", "pobreza por región y por ciudad"], ["f-pobreza", "pobreza e indigencia"]],
  csv: [["canasta_regiones", "Descargar CSV de las canastas por región"], ["adulto_equivalente", "Descargar CSV de la tabla de adulto equivalente"],
    ["canasta_mensual", "Descargar CSV de la canasta del Gran Buenos Aires por mes"]],
  fuentes: "INDEC, canasta básica alimentaria y canasta básica total (valores por región del informe de pobreza, serie mensual del Gran Buenos Aires y " +
    "tabla de adulto equivalente), e incidencia de la pobreza y la indigencia, Encuesta Permanente de Hogares",
  texto: () => {
    const C = ECB, ae = C.adultos_hogar, regs = T.canasta_regiones, [rMin, vMin] = C.reg_min, [rMax, vMax] = C.reg_max;
    const fila = n => regs.find(r => r.region === n), pr = T.pobreza_aglomerados.filter(r => r.tipo === "region"), tot = T.pobreza_aglomerados.find(r => r.tipo === "total");
    const respuesta = `De ${n0(vMin * ae)} pesos por mes en ${REG_ART[rMin]} a ${n0(vMax * ae)} en ${REG_ART[rMax]}.`;
    const bajada = `Es la canasta básica total de ${C.reg_mes} para el hogar de ejemplo del INDEC, de cuatro integrantes: un varón de 35 años, una mujer de 31, ` +
      "un hijo de 6 y una hija de 8. Si los ingresos de un hogar así no llegan a esa cifra, el hogar y quienes viven en él cuentan como pobres." +
      (C.periodo !== regs[0].periodo ? ` En el Gran Buenos Aires, la canasta se publica cada mes: la de ${C.mes} fue de ${n0(C.cbt_hogar)} pesos.` : "");
    const contexto = "El INDEC mide la pobreza por los ingresos. Primero valoriza una canasta de alimentos que cubre lo que necesita comer una persona, " +
      "la canasta básica alimentaria, que marca la línea de indigencia. Después le suma los demás bienes y servicios, como la ropa, el transporte, " +
      "la educación y la salud: es la canasta básica total, que marca la línea de pobreza. Y como los precios y lo que se consume cambian de un lugar " +
      "a otro, el INDEC calcula una canasta para cada una de las seis regiones del país.";
    const medimos = ["Como un chico no necesita lo mismo que un adulto, cada persona cuenta según su edad y su sexo, en adultos equivalentes: un varón de " +
      "30 a 60 años vale 1, y los demás, una parte de eso. La canasta de un hogar es la de un adulto multiplicada por los adultos equivalentes que suma.",
      "La pobreza y la indigencia son la parte de las personas que viven en hogares con ingresos por debajo de su canasta total y de su canasta " +
      "alimentaria, en los aglomerados urbanos que releva la Encuesta Permanente de Hogares."];
    // 1. la canasta de cada región
    const fMax = fila(rMax), fMin = fila(rMin), difT = (vMax / vMin - 1) * 100, difA = (fMax.cba / fMin.cba - 1) * 100;
    const s1 = `La canasta ${deReg(rMax)} cuesta ${pct(difT)} más que la ${deReg(rMin)}.` +
      (difA < difT / 2 ? ` En los alimentos solos, la diferencia es de ${pct(difA)}: el resto viene de los demás bienes y servicios, que pesan distinto en cada región.` : "") +
      ` En el Gran Buenos Aires, el hogar de ejemplo necesitaba ${n0(fila("Gran Buenos Aires").cbt * ae)} pesos.`;
    // 2. cuánto pesan los alimentos en la canasta total
    const al = regs.map(r => ({region: r.region, v: r.cba / r.cbt * 100})), aMax = al.reduce((a, b) => b.v > a.v ? b : a), aMin = al.reduce((a, b) => b.v < a.v ? b : a);
    const s2 = `En ${REG_ART[aMax.region]}, los alimentos son el ${pct(aMax.v)} de la canasta total, y en ${REG_ART[aMin.region]}, el ${pct(aMin.v)}. ` +
      "Donde los alimentos pesan más, el resto de los bienes y servicios cuesta menos frente a ellos, y la canasta total queda más cerca de la alimentaria. " +
      "Por eso una misma suba de los alimentos mueve más la línea de pobreza de esas regiones.";
    // 3. cuánto subió en un año
    const ia = regs.map(r => r.interanual_cbt), iaMin = Math.min(...ia), iaMax = Math.max(...ia);
    const s3 = `En los doce meses hasta ${C.mes}, la canasta total del Gran Buenos Aires subió ${pct(C.ia_cbt)}, la alimentaria, ${pct(C.ia_cba)}, y los precios ` +
      `en general, ${pct(C.ia_ipc_gba)}. En el último mes, la canasta total subió ${pct(C.m_cbt)}. Por región, en el año hasta ${C.reg_mes} la canasta total ` +
      `subió entre ${pct(iaMin)} y ${pct(iaMax)}.` + (C.ia_cbt > C.ia_ipc_gba ? " Cuando la canasta sube más que los precios, la línea de pobreza se aleja aunque los ingresos acompañen a la inflación." : "");
    // 4. la pobreza por región
    const masPob = pr.reduce((a, b) => b.pobreza > a.pobreza ? b : a), menosPob = pr.reduce((a, b) => b.pobreza < a.pobreza ? b : a);
    const pobDe = n => pr.find(r => r.nombre === n);
    const s4 = (menosPob.nombre === rMax
      ? `La región con la canasta más cara, ${REG_ART[rMax]}, es la que tiene menos personas bajo la línea de pobreza: ${pct(menosPob.pobreza)}.`
      : `${mayusc(REG_ART[rMax])}, la región con la canasta más cara, tiene ${pct(pobDe(rMax).pobreza)} de sus personas bajo la línea de pobreza.`) +
      ` La de más pobreza es ${REG_ART[masPob.nombre]}, con ${pct(masPob.pobreza)}` + (masPob.nombre !== rMax ? `, y su canasta cuesta ${n0(fila(masPob.nombre).cbt * ae)} pesos.` : ".") +
      ` En el total de los 31 aglomerados, la pobreza es del ${pct(tot.pobreza)}. La pobreza depende de lo que cuesta la canasta y también de lo que ganan los hogares de cada región.`;
    // 5. la indigencia por región
    const masInd = pr.reduce((a, b) => b.indigencia > a.indigencia ? b : a), menosInd = pr.reduce((a, b) => b.indigencia < a.indigencia ? b : a);
    const s5 = `Bajo la línea de indigencia, la de los hogares que no llegan a cubrir los alimentos, está el ${pct(tot.indigencia)} de las personas de los ` +
      `31 aglomerados. Va del ${pct(menosInd.indigencia)} en ${REG_ART[menosInd.nombre]} al ${pct(masInd.indigencia)} en ${REG_ART[masInd.nombre]}. ` +
      "Con porcentajes chicos, la encuesta tiene más margen de error: una diferencia de un punto entre dos regiones puede no ser real.";
    const sintesis = [`El hogar de ejemplo del INDEC necesitaba de ${n0(vMin * ae)} pesos por mes en ${REG_ART[rMin]} a ${n0(vMax * ae)} en ${REG_ART[rMax]}.`,
      `Los alimentos van del ${pct(aMin.v)} de la canasta total en ${REG_ART[aMin.region]} al ${pct(aMax.v)} en ${REG_ART[aMax.region]}.`,
      `En el último año, la canasta total del Gran Buenos Aires subió ${pct(C.ia_cbt)} y los precios, ${pct(C.ia_ipc_gba)}.`,
      `La pobreza va del ${pct(menosPob.pobreza)} de las personas en ${REG_ART[menosPob.nombre]} al ${pct(masPob.pobreza)} en ${REG_ART[masPob.nombre]}.`];
    const lim = ["La línea de pobreza mira solo los ingresos: un hogar que gana apenas más que su canasta no cuenta como pobre, aunque le falten otras cosas, como una vivienda adecuada.",
      "Las canastas por región salen del informe semestral de pobreza, con el último mes de cada semestre. Solo la del Gran Buenos Aires se publica todos los meses.",
      "El INDEC no calcula canastas por provincia ni por ciudad: la calculadora usa la de la región, y dentro de una región los precios también cambian.",
      "La pobreza por región es la de los aglomerados urbanos que releva la Encuesta Permanente de Hogares, no la de toda la región: la encuesta no cubre las zonas rurales ni los pueblos.",
      "La encuesta registra los ingresos que declaran los hogares, que pueden no coincidir con lo que cobran."];
    const notas = ["Canastas por región: informe semestral de pobreza del INDEC, valores del último mes del semestre por adulto equivalente. Para el hogar de ejemplo, multiplicados por sus " + n2(ae) + " adultos equivalentes.",
      "Canasta del Gran Buenos Aires: serie mensual del INDEC. Los precios son los del índice de precios al consumidor del Gran Buenos Aires.",
      `Pobreza e indigencia: Encuesta Permanente de Hogares, ${PZA.semestre}, % de las personas de los aglomerados urbanos de cada región.`];
    const opcR = regs.map(r => `<option value="${r.codigo}">${r.region}</option>`).join("");
    const calc = `<div class="calc" id="calc-canasta"><label class="selector-ficha"><span>Región</span><select class="calc-region">${opcR}</select></label>` +
      `<fieldset class="calc-personas"><legend>Quiénes viven en el hogar</legend><ol class="calc-lista"></ol>` +
      `<button type="button" class="boton chico calc-sumar">Sumar una persona</button></fieldset>` +
      // F9 (plan de mejora, 1 de noviembre de 2026): con el ingreso del hogar, si queda bajo la línea de pobreza o de indigencia. No se guarda ni se envía
      `<label class="selector-ficha calc-ingreso"><span>Ingresos del hogar por mes, en pesos (opcional)</span><input type="number" min="0" step="1000" inputmode="numeric" class="calc-ingreso-in"></label>` +
      `<p class="calc-res" aria-live="polite"></p></div>`;
    return {respuesta, bajada, contexto, medimos, sintesis, lim, notas, secciones: [
      {preg: "¿Cuánto necesita un hogar en cada región?", g: "canasta-regiones", forma: "barras",
        tit: `La canasta ${deReg(rMax)} cuesta ${pct(difT)} más que la ${deReg(rMin)}`,
        pie: `Canasta básica total del hogar de ejemplo, pesos por mes, ${C.reg_mes}. Hogar de cuatro integrantes, ${n2(ae)} adultos equivalentes.`, txt: [s1]},
      {preg: "¿Cuánto necesita tu hogar?", tit: "La canasta de un hogar según quiénes viven en él y en qué región", html: calc,
        pie: `Cada persona cuenta según la tabla de adulto equivalente del INDEC, y la canasta es la de ${C.reg_mes} de cada región. Lo que se elige y el ingreso que se escribe no se guardan ni se envían: el cálculo se hace en tu navegador.`, txt: []},
      {preg: "¿Cuánto pesan los alimentos en la canasta?", g: "canasta-alimentos", forma: "barras",
        tit: `En ${REG_ART[aMax.region]}, los alimentos son el ${pct(aMax.v)} de la canasta total`,
        pie: `Canasta básica alimentaria como % de la canasta básica total, ${C.reg_mes}.`, txt: [s2]},
      {preg: "¿Cuánto subió la canasta en el último año?", g: "canasta-suba", forma: "lineas",
        tit: `En el último año, la canasta total del Gran Buenos Aires subió ${pct(C.ia_cbt)} y los precios, ${pct(C.ia_ipc_gba)}`,
        pie: "% de suba frente al mismo mes del año anterior, Gran Buenos Aires.", txt: [s3]},
      {preg: "¿Dónde hay más personas bajo la línea de pobreza?", g: "canasta-pobreza", forma: "barras",
        tit: `La pobreza va del ${pct(menosPob.pobreza)} en ${REG_ART[menosPob.nombre]} al ${pct(masPob.pobreza)} en ${REG_ART[masPob.nombre]}`,
        pie: `% de las personas de los aglomerados urbanos de cada región, ${PZA.semestre}. La línea marca el total de los 31 aglomerados.`, txt: [s4]},
      {preg: "¿Y bajo la línea de indigencia?", g: "canasta-indigencia", forma: "barras",
        tit: `La indigencia va del ${pct(menosInd.indigencia)} en ${REG_ART[menosInd.nombre]} al ${pct(masInd.indigencia)} en ${REG_ART[masInd.nombre]}`,
        pie: `% de las personas de los aglomerados urbanos de cada región, ${PZA.semestre}. La línea marca el total de los 31 aglomerados.`, txt: [s5]},
    ]};
  },
  // la calculadora: arranca con el hogar de ejemplo del INDEC y la región de la provincia elegida
  iniciar: nota => {
    const caja = nota.querySelector("#calc-canasta"), tab = T.adulto_equivalente, regs = T.canasta_regiones;
    if (!caja || !tab) return;
    const lista = caja.querySelector(".calc-lista"), selR = caja.querySelector(".calc-region"), res = caja.querySelector(".calc-res");
    const sumar = caja.querySelector(".calc-sumar"), ing = caja.querySelector(".calc-ingreso-in"), MAX = 12;
    selR.value = (REG_IPC[prov] || ["gba"])[0];
    const deEdad = e => tab.findIndex(r => r.edad_desde <= e && (r.edad_hasta == null || r.edad_hasta >= e));
    // F9: con un ingreso escrito, frente a la canasta total (la línea de pobreza) y a la alimentaria (la de indigencia), con la aclaración del mes
    const bajoLinea = (v, cbt, cba) => !(v > 0) ? "" : `<br>Con ${n0(v)} pesos por mes, ` + (v < cba
      ? `queda bajo la línea de indigencia y también bajo la de pobreza: le faltan ${n0(cbt - v)} pesos para llegar a su canasta total.`
      : v < cbt ? `queda bajo la línea de pobreza: le faltan ${n0(cbt - v)} pesos para llegar a su canasta total.`
      : `queda por encima de la línea de pobreza: sus ingresos son ${n2(v / cbt)} veces su canasta total.`) +
      ` La canasta es la de ${ECB.reg_mes}: si el ingreso es de un mes posterior, los precios también subieron.`;
    const calcular = () => {
      const filas = [...lista.children], n = filas.length;
      filas.forEach((li, i) => {
        li.querySelector(".calc-n").textContent = `Persona ${i + 1}`;
        li.querySelectorAll("select").forEach(s => s.setAttribute("aria-label", `${s.dataset.c === "edad" ? "Edad" : "Sexo"} de la persona ${i + 1}`));
        li.querySelector(".calc-quitar").setAttribute("aria-label", `Quitar a la persona ${i + 1}`);
        li.querySelector(".calc-quitar").hidden = n === 1;
      });
      sumar.disabled = n >= MAX;
      const u = filas.reduce((s, li) => s + tab[+li.querySelector('[data-c="edad"]').value][li.querySelector('[data-c="sexo"]').value], 0);
      const r = regs.find(x => x.codigo === selR.value);
      res.innerHTML = `${n === 1 ? "Una persona" : `Un hogar de ${n} personas`} suma ${n2(u)} ${u === 1 ? "adulto equivalente" : "adultos equivalentes"}. ` +
        `En ${REG_ART[r.region]}, su canasta básica total de ${ECB.reg_mes} era de <b>${n0(u * r.cbt)} pesos por mes</b>: con ingresos por debajo de esa cifra, ` +
        `el INDEC lo cuenta como pobre. Su canasta alimentaria, la línea de indigencia, era de ${n0(u * r.cba)} pesos.` + bajoLinea(+ing.value, u * r.cbt, u * r.cba);
    };
    const persona = (edad, sexo) => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="calc-n"></span><label class="selector-ficha"><span>Edad</span><select data-c="edad">` +
        tab.map((r, i) => `<option value="${i}">${r.edad}</option>`).join("") + `</select></label>` +
        `<label class="selector-ficha"><span>Sexo</span><select data-c="sexo"><option value="mujeres">Mujer</option><option value="varones">Varón</option></select></label>` +
        `<button type="button" class="enlace calc-quitar">Quitar</button>`;
      li.querySelector('[data-c="edad"]').value = deEdad(edad);
      li.querySelector('[data-c="sexo"]').value = sexo;
      li.querySelector(".calc-quitar").addEventListener("click", () => {
        const sig = li.nextElementSibling || li.previousElementSibling;
        li.remove(); calcular();
        (sig?.querySelector("select") || sumar).focus();
      });
      lista.append(li);
    };
    [[35, "varones"], [31, "mujeres"], [6, "varones"], [8, "mujeres"]].forEach(([e, s]) => persona(e, s));
    caja.addEventListener("change", calcular);
    ing.addEventListener("input", calcular);
    sumar.addEventListener("click", () => { persona(35, "mujeres"); calcular(); lista.lastElementChild.querySelector("select").focus(); });
    calcular();
  },
  dib: {
    "canasta-regiones": (el, a) => {
      const ae = ECB.adultos_hogar, regs = new Set((REG_IPC[prov] || []).map(r => "r-" + r));
      barrasH(el, {anim: a, data: T.canasta_regiones.map(r => ({codigo_indec: "r-" + r.codigo, territorio: r.region, v: r.cbt * ae, cba: r.cba * ae})),
        k: "v", vf: v => n0(v / 1000) + " mil", af: ejeMil, l: 150, lAngosto: 128, marcar: regs,
        tip: d => `<b>${d.territorio}</b><br>Canasta básica total: ${n0(d.v)} pesos por mes<br>Canasta básica alimentaria: ${n0(d.cba)} pesos`});
    },
    "canasta-alimentos": (el, a) => {
      const regs = new Set((REG_IPC[prov] || []).map(r => "r-" + r));
      barrasH(el, {anim: a, data: T.canasta_regiones.map(r => ({codigo_indec: "r-" + r.codigo, territorio: r.region, v: r.cba / r.cbt * 100})),
        k: "v", vf: pct, af: v => n0(v) + "%", l: 150, lAngosto: 128, marcar: regs,
        tip: d => `<b>${d.territorio}</b><br>Los alimentos son el ${pct(d.v)} de la canasta total`});
    },
    "canasta-suba": (el, a) => lineas(el, {anim: a, data: T.canasta_mensual.filter(r => r.interanual_cbt != null).map(r => ({...r, t: tPer(r.periodo)})), x: "t", y0: 0,
      vf: pct, yf: v => n0(v) + "%", xl: r => mesPer(r.periodo), mensual: true,
      series: [{k: "interanual_cbt", lab: "Canasta total", corto: "Canasta", c: NAR}, {k: "interanual_ipc_gba", lab: "Precios", c: FRI}]}),
    "canasta-pobreza": (el, a) => {
      const tot = T.pobreza_aglomerados.find(r => r.tipo === "total"), regs = new Set((REG_IPC[prov] || []).map(r => "r-" + r));
      barrasH(el, {anim: a, data: T.pobreza_aglomerados.filter(r => r.tipo === "region").map(r => ({codigo_indec: "r-" + r.clave, territorio: r.nombre, v: r.pobreza, ind: r.indigencia})),
        k: "v", vf: pct, af: v => n0(v) + "%", l: 150, lAngosto: 128, marcar: regs, ref: tot.pobreza, refLab: `Total ${pct(tot.pobreza)}`,
        tip: d => `<b>${d.territorio}</b><br>Pobreza: ${pct(d.v)} de las personas<br>Indigencia: ${pct(d.ind)}`});
    },
    "canasta-indigencia": (el, a) => {
      const tot = T.pobreza_aglomerados.find(r => r.tipo === "total"), regs = new Set((REG_IPC[prov] || []).map(r => "r-" + r));
      barrasH(el, {anim: a, data: T.pobreza_aglomerados.filter(r => r.tipo === "region").map(r => ({codigo_indec: "r-" + r.clave, territorio: r.nombre, v: r.indigencia, pob: r.pobreza})),
        k: "v", vf: pct, af: v => n0(v) + "%", l: 150, lAngosto: 128, marcar: regs, ref: tot.indigencia, refLab: `Total ${pct(tot.indigencia)}`,
        tip: d => `<b>${d.territorio}</b><br>Indigencia: ${pct(d.v)} de las personas<br>Pobreza: ${pct(d.pob)}`});
    },
  },
}, {
  // etapa 5: la pregunta pasa a ser la de la construcción, y las compras de dólares, que eran su cuarta sección, van en su propio artículo
  id: "a-dolar-inversion", frec: "Se actualiza cada trimestre", tablas: ["dolar_inversion_trimestral"],
  dek: "Lo que cuesta construir medido en dólares, trimestre por trimestre, frente a lo que cambia la inversión en construcción en el año siguiente. También muestra cómo se reparte la inversión, el dólar en términos reales, la parte que va a máquinas importadas y cuánto cambia la inversión con el dólar.",
  fichas: [["f-isac", "actividad de la construcción"], ["f-costo", "costo de la construcción"], ["f-hipotecas", "créditos hipotecarios"]],
  csv: [["dolar_inversion_trimestral", "Descargar CSV por trimestre"]],
  fuentes: "Banco Central de la República Argentina, índice de tipo de cambio real multilateral, e INDEC y Banco Central vía API de Series de Tiempo: " +
    "inversión bruta interna fija (oferta y demanda globales) y tipo de cambio de referencia (Comunicación \"A\" 3500)",
  texto: () => {
    const d = DL, sin = d.primeros_hasta + 1, ip = d.inv_pct;
    // la respuesta: la construcción del año siguiente, desde el fin de los primeros años de la serie (los que siguieron a la devaluación de 2002);
    // si en toda la serie la relación es más marcada, lo dice
    const respuesta = fz(d.rs_sig_sin) === fz(d.rs_sig) ? respuestaR(d.rs_sig_sin)
      : `Desde ${sin}, ${respuestaR(d.rs_sig_sin).toLowerCase()} Antes, la relación era más marcada.`;
    const dirImp = d.rs_imp < 0 ? "pesaron menos" : "pesaron más", dirSig = d.rs_sig < 0 ? "crecer más" : "crecer menos";
    const bajada = `Desde el ${d.desde}, con el dólar más caro en términos reales, las máquinas y equipos importados ${dirImp} en la inversión, ` +
      `y cuando construir fue más barato en dólares, la inversión en construcción tendió a ${dirSig} en el año siguiente. ` +
      `Desde ${sin}, ${dosRel(d.rs_imp_sin, d.rs_sig_sin)}.`;
    const contexto = "El tipo de cambio mueve los precios relativos. Con un dólar caro, lo que se trae de afuera cuesta más pesos, y lo que se hace en el país, " +
      "como una obra, cuesta menos dólares. " +
      `Este artículo pone al lado, trimestre por trimestre desde ${d.desde_anio}, lo que cuesta construir medido en dólares, ` +
      "la inversión en construcción, el dólar en términos reales y la inversión en máquinas y equipos.";
    const medimos = ["La inversión es la inversión bruta interna fija del INDEC: lo que se gasta en construcciones, máquinas, equipos y vehículos que " +
      "sirven para producir durante varios años. Se mide en pesos de 2004, así que sus cambios son cambios en la cantidad, no en los precios.",
      "El dólar real es el índice de tipo de cambio real multilateral del Banco Central: cuando sube, el dólar está más caro frente a los precios del país."];
    // 1. el dólar real y lo que cuesta construir en dólares
    const extremo = (q, max, min, nom) => q === max ? `, el ${nom} más alto de la serie` : q === min ? `, el ${nom} más bajo de la serie` : "";
    const espejo = ab(d.rs_espejo) >= .7 ? "va casi en espejo" : "tiende a moverse en sentido contrario";
    const s1 = `En el ${d.ult}, el índice del dólar real estaba ` +
      `${pctAbs(d.itcrm_vs_prom)} ${d.itcrm_vs_prom < 0 ? "por debajo" : "por encima"} de su promedio desde ${d.desde_anio}${extremo(d.ult, d.itcrm_max, d.itcrm_min, "valor")}.` +
      ` Lo que cuesta construir medido en dólares ${espejo}, como es esperable: los dos índices comparan los precios del país con el dólar, en sentido contrario. ` +
      `En ese trimestre, construir costaba en dólares un ${pctAbs(d.costo_vs_prom)} ${d.costo_vs_prom < 0 ? "menos" : "más"} que su promedio desde ${d.desde_anio}` +
      `${extremo(d.ult, d.costo_max, d.costo_min, "valor")}.` + (d.costo_max !== d.ult ? ` El más caro fue el ${d.costo_max}.` : "");
    // 2. cómo se reparte la inversión, en años completos
    const s2 = `Entre ${d.inv_ini} y ${d.inv_ult}, la inversión ${d.inv_var < 0 ? "cayó" : "creció"} ${pctAbs(d.inv_var)}, descontados los precios. ` +
      (d.inv_max_anio === d.inv_ult ? `${d.inv_ult} fue el año más alto de la serie. ` : `El año más alto fue ${d.inv_max_anio}, y en ${d.inv_ult} la inversión estaba un ${pctAbs(d.inv_ult_vs_max)} por debajo. `) +
      `En ese tiempo cambió también en qué se invierte: la construcción pasó del ${pct(ip.construccion[0])} al ${pct(ip.construccion[1])} de toda la inversión, ` +
      `las máquinas y equipos importados, del ${pct(ip.equipo_importado[0])} al ${pct(ip.equipo_importado[1])}, y los nacionales, del ${pct(ip.equipo_nacional[0])} ` +
      `al ${pct(ip.equipo_nacional[1])}. El resto son otros rubros de la inversión.`;
    // 3. qué parte de la inversión va a equipos importados según el dólar real
    const sImp = ab(d.rs_imp) < .2 ? "La parte de la inversión que va a máquinas, equipos y vehículos importados casi no se mueve con el dólar real."
      : `La parte de la inversión que va a máquinas, equipos y vehículos importados tiende a ser mayor cuando el dólar está ${d.rs_imp < 0 ? "barato" : "caro"} en términos reales.`;
    const s3 = `${sImp} En el tercio de los trimestres con el dólar real más bajo, fue en promedio el ${pct(d.imp_dolar_barato)} de toda la inversión, y en el tercio ` +
      `con el dólar más alto, el ${pct(d.imp_dolar_caro)}. Desde ${sin}, la relación es ${fz(d.rs_imp_sin)}. ` +
      `En el ${d.ult}, la parte importada era del ${pct(d.imp_ult)}.`;
    // 4. cuánto cambia la inversión de un año a otro con lo que cambia el dólar
    const maxVar = Math.max(ab(d.rs_var_total), ab(d.rs_var_imp), ab(d.rs_var_nac), ab(d.rs_var_cons));
    const s4 = `Si se compara cada trimestre con el mismo del año anterior, lo que cambió el dólar real y lo que cambió la inversión total tienen una relación ` +
      `${fz(d.rs_var_total)}. Para los equipos importados es ${fz(d.rs_var_imp)}, para los nacionales, ${fz(d.rs_var_nac)}, y para la construcción, ${fz(d.rs_var_cons)}. ` +
      (maxVar < .2 ? "El cambio del dólar casi no anticipa cuánto cambia la inversión ese año."
        : maxVar < .4 ? `Cuando el dólar real sube, la inversión de ese año tiende a ${d.rs_var_total < 0 ? "caer" : "subir"}, con muchas excepciones.`
        : `Cuando el dólar real sube, la inversión de ese año tiende a ${d.rs_var_total < 0 ? "caer" : "subir"}.`);
    // 5. lo que cuesta construir en dólares y la construcción del año siguiente
    const cambio = v => `${v < 0 ? "cayó" : "creció"} ${pctAbs(v)}`;
    const s5 = (ab(d.rs_sig) < .2 ? "Lo que costaba construir en dólares casi no anticipa lo que pasó con la construcción en el año siguiente. "
      : `Cuando construir fue más barato en dólares, la inversión en construcción tendió a ${dirSig} en el año siguiente. `) +
      `En el tercio de los trimestres con la construcción más barata en dólares, la inversión en construcción ${cambio(d.sig_barato)} en los cuatro trimestres ` +
      `siguientes (la mediana). En el tercio intermedio ${cambio(d.sig_medio)} y en el más caro, ${cambio(d.sig_caro)}. ` +
      `Pero ${d.barato_primeros} de esos ${d.barato_n} trimestres más baratos son de ${d.desde_anio} a ${d.primeros_hasta}, los primeros años de la serie, después de la ` +
      `devaluación de 2002. Desde ${sin}, la relación es ${fz(d.rs_sig_sin)}.`;
    const sintesis = [`La construcción pasó del ${pct(ip.construccion[0])} al ${pct(ip.construccion[1])} de la inversión entre ${d.inv_ini} y ${d.inv_ult}, y los equipos importados, del ${pct(ip.equipo_importado[0])} al ${pct(ip.equipo_importado[1])}.`,
      `Con el dólar real barato, los equipos importados fueron en promedio el ${pct(d.imp_dolar_barato)} de la inversión, y con el dólar caro, el ${pct(d.imp_dolar_caro)}.`,
      `Desde ${sin}, lo que cuesta construir en dólares y la construcción del año siguiente tienen una relación ${fz(d.rs_sig_sin)}.`];
    const lim = [`Son ${d.n} trimestres de una sola economía, y los trimestres seguidos no son casos independientes: una misma crisis pesa en varios a la vez.`,
      "Una correlación no prueba que una cosa cause la otra. En los mismos trimestres cambiaron la actividad, el crédito, las tasas de interés y los impuestos.",
      "La pandemia de COVID-19 hizo caer la construcción en 2020 y rebotar en 2021: esos trimestres son los puntos más alejados del gráfico de la construcción.",
      "El índice de tipo de cambio real compara con una canasta de monedas, no solo con el dólar estadounidense, y usa los tipos de cambio oficiales.",
      "El INDEC revisa los últimos trimestres en cada publicación."];
    const notas = ["Inversión: inversión bruta interna fija del INDEC (oferta y demanda globales), en pesos de 2004, por trimestre. Los años completos suman sus cuatro trimestres.",
      "Dólar real: índice de tipo de cambio real multilateral del Banco Central, promedio de cada trimestre.",
      "Lo que cuesta construir en dólares: el índice de precios implícitos de la inversión en construcción (lo invertido en construcción a precios de cada año, dividido por lo mismo a precios de 2004), pasado a dólares con el tipo de cambio de referencia del Banco Central (Comunicación \"A\" 3500).",
      `Correlación de Spearman, de menos 1 a 1: ${rTxt(d.rs_espejo)} entre los dos índices, ${rTxt(d.rs_imp)} con la parte importada, ` +
      `${rTxt(d.rs_var_total)} con la inversión y ${rTxt(d.rs_sig)} con la construcción del año siguiente (${rTxt(d.rs_sig_sin)} desde ${sin}).`];
    return {respuesta, bajada, contexto, medimos, sintesis, lim, notas, secciones: [
      {preg: "¿Qué pasa con lo que cuesta construir cuando sube el dólar?", g: "dolar-espejo", forma: "lineas",
        tit: `Lo que cuesta construir en dólares ${espejo} del dólar real`,
        pie: `Índices, con el promedio desde ${d.desde_anio} = 100. Un índice más alto del dólar real es un dólar más caro frente a los precios del país.`, txt: [s1]},
      {preg: "¿En qué se invierte?", g: "inv-partes", forma: "lineas",
        tit: `La construcción pasó del ${pct(ip.construccion[0])} al ${pct(ip.construccion[1])} de la inversión entre ${d.inv_ini} y ${d.inv_ult}`,
        pie: "Inversión de cada año completo, en miles de millones de pesos de 2004.", txt: [s2]},
      {preg: "¿Pesan más las máquinas importadas cuando el dólar está barato?", g: "dolar-equipos", forma: "puntos",
        tit: `Con el dólar real barato, los equipos importados fueron el ${pct(d.imp_dolar_barato)} de la inversión, y con el dólar caro, el ${pct(d.imp_dolar_caro)}`,
        pie: "Cada punto es un trimestre. La línea punteada muestra la tendencia. La inversión se mide en pesos de 2004.", txt: [s3]},
      {preg: "¿Cambia cuánto se invierte cuando cambia el dólar?", g: "inv-var", forma: "puntos",
        tit: `Lo que cambia el dólar real y lo que cambia la inversión ese año: una relación ${fz(d.rs_var_total)}`,
        pie: "Cada punto es un trimestre, frente al mismo trimestre del año anterior. La línea punteada muestra la tendencia.", txt: [s4]},
      {preg: "¿Se construye más después de que construir fue barato en dólares?", g: "dolar-construccion", forma: "puntos",
        tit: `Lo que cuesta construir en dólares y la construcción del año siguiente: una relación ${fz(d.rs_sig)}`,
        pie: `Cada punto es un trimestre: lo que costaba construir en dólares (promedio desde ${d.desde_anio} = 100) y cuánto cambió la inversión en construcción en los cuatro trimestres siguientes.`, txt: [s5]},
    ]};
  },
  // los gráficos de cada sección, con las tablas del artículo ya cargadas
  dib: {
    "dolar-espejo": (el, a) => lineas(el, {anim: a, x: "t", y0: 0, vf: n0, yf: n0, xl: triCorto,
      data: T.dolar_inversion_trimestral.map(r => ({...r, t: r.anio + (r.trimestre - 1) / 4})),
      series: [{k: "indice_dolar_real", lab: "Dólar real", c: NAR}, {k: "indice_construccion_usd", lab: "Construir en dólares", c: FRI}]}),
    "inv-partes": (el, a) => {
      // los años con sus cuatro trimestres, en miles de millones de pesos de 2004
      const ks = ["construccion", "equipo_importado", "equipo_nacional"];
      const data = d3.groups(T.dolar_inversion_trimestral.filter(r => r.inversion_total != null), r => r.anio).filter(([, rs]) => rs.length === 4)
        .map(([anio, rs]) => Object.fromEntries([["anio", anio], ...ks.map(k => [k, d3.sum(rs, r => r[k]) / 1e3])]));
      return lineas(el, {anim: a, x: "anio", y0: 0, vf: n1, yf: n0, data,
        series: [{k: "construccion", lab: "Construcción", c: NAR}, {k: "equipo_importado", lab: "Equipos importados", corto: "Importados", c: FRI},
          {k: "equipo_nacional", lab: "Equipos nacionales", corto: "Nacionales", c: css("--azul-hondo")}]});
    },
    "dolar-equipos": (el, a) => dispersion(el, {anim: a, x: "itcrm", y: "pct_equipo_importado", yAuto: true,
      data: T.dolar_inversion_trimestral.map(r => ({...r, codigo_indec: r.periodo, territorio: triCorto(r)})),
      marcar: [T.dolar_inversion_trimestral.at(-1).periodo], xLab: "Dólar real (índice del Banco Central)", yLab: "Equipos importados, % de la inversión",
      fx: n0, fy: v => n0(v) + "%", vx: n1, vy: pct}),
    "inv-var": (el, a) => {
      const data = T.dolar_inversion_trimestral.filter(r => r.var_itcrm != null && r.var_inversion_total != null).map(r => ({...r, codigo_indec: r.periodo, territorio: triCorto(r)}));
      return dispersion(el, {anim: a, data, x: "var_itcrm", y: "var_inversion_total", yAuto: true, marcar: [data.at(-1).periodo],
        xLab: "Cambio del dólar real", yLab: "Cambio de la inversión", fx: v => n0(v) + "%", fy: v => n0(v) + "%",
        vx: v => (v > 0 ? "+" : "") + pct(v), vy: v => (v > 0 ? "+" : "") + pct(v)});
    },
    "dolar-construccion": (el, a) => dispersion(el, {anim: a, x: "indice_construccion_usd", y: "construccion_anio_siguiente", yAuto: true,
      data: T.dolar_inversion_trimestral.filter(r => r.construccion_anio_siguiente != null).map(r => ({...r, codigo_indec: r.periodo, territorio: triCorto(r)})),
      xLab: "Lo que cuesta construir en dólares (índice)", yLab: "Cambio de la construcción en el año siguiente",
      fx: n0, fy: v => n0(v) + "%", vx: n1, vy: v => (v > 0 ? "+" : "") + pct(v)}),
  },
}, {
  // etapa 5: las compras de dólares de personas y empresas, que hasta entonces eran la cuarta sección del artículo del dólar y la inversión
  id: "a-compras-dolares", frec: "Se actualiza cada mes", tablas: ["compras_dolares_anual", "dolar_inversion_trimestral"],
  dek: "Cuántos dólares compraron en neto las personas y las empresas en el mercado oficial de cambios, año por año y trimestre por trimestre, cuánto suman desde el comienzo de la serie, cuánto cambiaron con los límites para comprar y cómo se movieron con el dólar en términos reales.",
  fichas: [["f-bcra", "dólar, tasas y dinero"]],
  csv: [["compras_dolares_anual", "Descargar CSV por año"], ["dolar_inversion_trimestral", "Descargar CSV por trimestre"]],
  fuentes: "Banco Central de la República Argentina, balance cambiario, vía API de Series de Tiempo, e índice de tipo de cambio real multilateral",
  texto: () => {
    const d = DL, y = d.fae_ytd, mill = v => `${n0(v)} millones`;
    const respuesta = `${n0(d.fae_ult)} millones de dólares en ${d.fae_anio}.`;
    const bajada = `Es lo que compraron en neto, en billetes y divisas, las personas y las empresas en el mercado oficial de cambios: las compras menos las ventas` +
      (d.fae_max_anio === d.fae_anio ? `. Es el monto más alto de la serie, que empieza en ${d.fae_ini}.` : `. El año más alto de la serie, que empieza en ${d.fae_ini}, fue ${d.fae_max_anio}.`);
    const contexto = "Las personas y las empresas compran dólares para ahorrar, para viajar, para importar o para pagar deudas en dólares, y los venden cuando " +
      "necesitan pesos. Después de muchos años de inflación alta, muchas personas ahorran en dólares para que sus ahorros no pierdan valor. El Banco Central " +
      `registra cada mes esas compras y ventas en el mercado oficial de cambios. Este artículo suma lo comprado en neto cada año y cada trimestre desde ${d.fae_ini}, ` +
      "calcula cuánto se acumuló, compara los años con límites para comprar con los demás y pone las compras al lado del dólar en términos reales.";
    const medimos = ["Las compras netas son las compras de billetes y divisas menos las ventas, del sector privado no financiero: personas, empresas e " +
      "inversores institucionales. Un número positivo quiere decir que compraron más de lo que vendieron, y uno negativo, que vendieron más de lo que compraron.",
      "El dólar real es el índice de tipo de cambio real multilateral del Banco Central. Compara los precios de la Argentina con los de sus principales " +
      "socios comerciales, medidos en la misma moneda. Cuando sube, el dólar y las otras monedas están más caros frente a los precios del país."];
    // todo sale del resumen: el texto se arma antes de que lleguen las tablas diferidas, que usan solo los gráficos
    // 1. los años: los tres más altos, el promedio y lo que va del año
    const tot = d.fae_total, top5 = d.fae_top5_pct, pCon = d.fae_con_prom, pSin = d.fae_sin_prom;
    const s1 = `Los tres años con más compras netas fueron ${lista(d.fae_top.slice(0, 3).map(([an, v]) => `${an}, con ${mill(v)}`))}. ` +
      `En promedio, desde ${d.fae_ini}, compraron ${mill(d.fae_prom)} de dólares por año.` +
      (d.fae_neg.length ? ` En ${listaY(d.fae_neg.map(String))}, vendieron más de lo que compraron.` : "") +
      (y ? ` Entre enero y ${MESES[y.mes - 1]} de ${y.anio} compraron ${mill(y.millones)}, frente a ${n0(y.ant)} en los mismos meses de ${y.anio - 1}.` : "");
    // 2. lo acumulado y cuánto pesan los cinco años más altos
    const s2 = `Sumados todos los años desde ${d.fae_ini} hasta ${d.fae_anio}, las personas y las empresas compraron en neto ${mill(tot)} de dólares. ` +
      `Los cinco años con más compras explican el ${pct(top5)} de ese total: ${listaY(d.fae_top.map(([an]) => an).sort().map(String))}. ` +
      "Por eso la curva sube a saltos.";
    // 3. los años enteros con límites para comprar dólares, en tramos seguidos (de 02)
    const rango = t => t.ini === t.fin ? String(t.ini) : `${t.ini} a ${t.fin}`;
    const s3 = `Entre fines de 2011 y fines de 2015, y entre ${LIMITES}, las personas tuvieron límites para comprar dólares al tipo de cambio oficial. ` +
      `En los ${d.fae_con_n} años enteros con límites, las compras netas promediaron ${mill(pCon)} de dólares por año, y en los otros ${d.fae_sin_n}, ${mill(pSin)}. ` +
      `Los años con límites suman el ${pct(d.fae_con_pct)} de lo comprado en toda la serie. ` +
      "Los límites cambian lo que se puede comprar en el mercado oficial, no lo que la gente quiere comprar: una parte de la demanda pasó a otros mercados.";
    // 4. los trimestres
    const [qMax, vMax] = d.fae_q_max, [qMin, vMin] = d.fae_q_min, [qUlt, vUlt] = d.fae_q_ult;
    const s4 = `El trimestre con más compras netas fue el ${qMax}, con ${mill(vMax)} de dólares, y el de más ventas, el ${qMin}, con ` +
      `${mill(-vMin)} vendidos en neto. En ${d.fae_q_neg} de los ${d.fae_q_n} trimestres, las personas y las empresas vendieron más dólares de los que ` +
      `compraron. En el ${qUlt} compraron ${mill(vUlt)}.`;
    // 5. el nivel del dólar real: las compras del tercio de trimestres con el dólar más barato y las del tercio con el más caro
    const medBar = d.fae_tcr_barato, medCar = d.fae_tcr_caro;
    const s5 = `${ab(d.rs_fae) < .2 ? "Las compras de cada trimestre casi no se mueven con el nivel del dólar real." :
      `Las compras de cada trimestre tienden a ser ${d.rs_fae < 0 ? "mayores" : "menores"} con el dólar real barato.`} ` +
      `En el tercio de los trimestres con el dólar más barato, la mediana fue de ${mill(medBar)} de dólares, y en el tercio con el dólar más caro, de ` +
      `${mill(medCar)}. Con el dólar barato, comprar rinde más, pero en varios de esos trimestres había límites para hacerlo.`;
    const sintesis = [`En ${d.fae_anio}, las personas y las empresas compraron en neto ${mill(d.fae_ult)} de dólares.`,
      `Desde ${d.fae_ini}, suman ${mill(tot)} de dólares, y los cinco años con más compras explican el ${pct(top5)}.`,
      `En los años enteros con límites para comprar, las compras promediaron ${mill(pCon)} de dólares por año, y en los demás, ${mill(pSin)}.`,
      `Con el dólar real barato o caro, las compras de cada trimestre ${ab(d.rs_fae) < .2 ? "no muestran un patrón claro" : `muestran una relación ${fz(d.rs_fae)}`}.`];
    const lim = [
      "Las compras de dólares son las del sector privado no financiero en el mercado oficial de cambios que registra el Banco Central, en neto: compras menos ventas. " +
      "No dicen en qué se usaron esos dólares, si quedaron guardados, si se depositaron en un banco del país o si sirvieron para comprar una vivienda o hacer una obra.",
      "Entre fines de 2011 y fines de 2015, y entre " + LIMITES + ", las personas tuvieron límites para comprar dólares al tipo de cambio " +
      "oficial: lo que se compró en esos años depende de esas reglas, además de lo que la gente quería comprar. Los años en que los límites rigieron solo una parte del año cuentan entre los demás.",
      "Las compras por fuera del mercado oficial, como las del dólar que no pasa por los bancos, no se cuentan.",
      "Son dólares de cada año, sin descontar la inflación de los Estados Unidos.",
      "Una correlación no prueba que una cosa cause la otra, y los trimestres seguidos no son casos independientes: una misma crisis pesa en varios a la vez."];
    const notas = ["Compras netas: compras menos ventas de billetes y divisas del sector privado no financiero, balance cambiario del Banco Central, millones de dólares por mes, sumados por año y por trimestre. Un trimestre cuenta solo si tiene sus tres meses.",
      "Dólar real: índice de tipo de cambio real multilateral del Banco Central, promedio de cada trimestre.",
      `Correlación de Spearman entre las compras de cada trimestre y el dólar real, de menos 1 a 1: ${rTxt(d.rs_fae)}.`,
      "Los años enteros con límites para comprar son los que los tuvieron de enero a diciembre."];
    return {respuesta, bajada, contexto, medimos, sintesis, lim, notas, secciones: [
      {preg: "¿Cuántos dólares compran por año?", g: "dolar-compras", forma: "lineas",
        tit: d.fae_max_anio === d.fae_anio ? `${d.fae_anio} fue el año con más compras netas desde ${d.fae_ini}` : `El año con más compras netas desde ${d.fae_ini} fue ${d.fae_max_anio}`,
        pie: "Millones de dólares de cada año: compras menos ventas de billetes y divisas del sector privado no financiero (personas, empresas e inversores institucionales) en el mercado oficial de cambios.", txt: [s1]},
      {preg: `¿Cuánto suman desde ${d.fae_ini}?`, g: "compras-acum", forma: "lineas",
        tit: `Desde ${d.fae_ini}, compraron en neto ${mill(tot)} de dólares`,
        pie: `Compras netas acumuladas desde ${d.fae_ini}, millones de dólares de cada año.`, txt: [s2]},
      {preg: "¿Cambiaron las compras con los límites para comprar dólares?", g: "compras-tramos", forma: "barras",
        tit: `Con límites, las compras promediaron ${mill(pCon)} por año, frente a ${mill(pSin)} en los demás años`,
        pie: `Promedio por año de las compras netas, millones de dólares. Con límites para comprar todo el año: ${listaY(d.fae_tramos.filter(t => t.limites).map(rango))}.`, txt: [s3]},
      {preg: "¿Cómo se mueven trimestre por trimestre?", g: "compras-trim", forma: "lineas",
        tit: `El trimestre con más compras netas fue el ${qMax}`,
        pie: "Compras netas de cada trimestre, millones de dólares. Debajo de la línea del cero, vendieron más de lo que compraron.", txt: [s4]},
      {preg: "¿Se compran más dólares cuando el dólar está barato?", g: "compras-tcr", forma: "puntos",
        tit: `Las compras de cada trimestre y el dólar real: una relación ${fz(d.rs_fae)}`,
        pie: "Cada punto es un trimestre: el índice de tipo de cambio real multilateral y las compras netas de ese trimestre. La línea punteada muestra la tendencia.", txt: [s5]},
    ]};
  },
  dib: {
    "dolar-compras": (el, a) => lineas(el, {anim: a, x: "anio", y0: Math.min(0, d3.min(T.compras_dolares_anual, r => r.millones_usd)), ref: 0, vf: n0, yf: n0,
      data: T.compras_dolares_anual, series: [{k: "millones_usd", lab: "Compras netas", corto: "Compras", c: NAR}]}),
    "compras-acum": (el, a) => {
      let s = 0;
      const data = T.compras_dolares_anual.map(r => ({anio: r.anio, acum: s += r.millones_usd}));
      return lineas(el, {anim: a, x: "anio", y0: Math.min(0, d3.min(data, r => r.acum)), vf: n0, yf: n0, data, series: [{k: "acum", lab: "Acumulado", c: NAR}]});
    },
    "compras-tramos": (el, a) => barrasH(el, {anim: a, sinOrden: true, k: "prom", vf: n0, af: n0, l: 190, lAngosto: 180,
      data: DL.fae_tramos.map((t, i) => ({...t, codigo_indec: "t" + i, territorio: (t.ini === t.fin ? String(t.ini) : `${t.ini} a ${t.fin}`) + (t.limites ? ", con límites" : "")})),
      color: d => css(d.limites ? "--sol" : "--celeste"), tip: d => `<b>${d.territorio}</b><br>${n0(d.prom)} millones de dólares por año, en promedio`}),
    "compras-trim": (el, a) => {
      const data = T.dolar_inversion_trimestral.filter(r => r.compras_netas_usd != null).map(r => ({...r, t: r.anio + (r.trimestre - 1) / 4}));
      return lineas(el, {anim: a, x: "t", y0: Math.min(0, d3.min(data, r => r.compras_netas_usd)), ref: 0, vf: n0, yf: n0, xl: triCorto, data,
        series: [{k: "compras_netas_usd", lab: "Compras netas", corto: "Compras", c: NAR}]});
    },
    "compras-tcr": (el, a) => {
      const data = T.dolar_inversion_trimestral.filter(r => r.compras_netas_usd != null && r.itcrm != null).map(r => ({...r, codigo_indec: r.periodo, territorio: triCorto(r)}));
      return dispersion(el, {anim: a, data, x: "itcrm", y: "compras_netas_usd", yAuto: true, marcar: [data.at(-1).periodo],
        xLab: "Dólar real (índice del Banco Central)", yLab: "Compras netas, millones de dólares", fx: n0, fy: n0, vx: n1, vy: v => `${n0(v)} millones`});
    },
  },
}, {
  // etapa 24: el turismo internacional y el dólar real, mes por mes (SINTA y BCRA)
  id: "a-turismo-dolar", frec: "Se actualiza cada mes", tablas: ["turismo_dolar_mensual"],
  dek: "Cuántos turistas extranjeros llegan y cuántos residentes viajan al exterior, mes por mes, cuál es la diferencia entre los dos, de dónde llegan los turistas y cómo se mueven esos viajes con el dólar en términos reales.",
  fichas: [["f-receptivo", "turistas extranjeros"]],
  csv: [["turismo_dolar_mensual", "Descargar CSV por mes"]],
  fuentes: "Secretaría de Turismo y Ambiente, SINTA, estimación de turismo internacional (viajes de turistas no residentes y residentes), y Banco Central " +
    "de la República Argentina, índices de tipo de cambio real multilateral y bilaterales",
  texto: () => {
    const t = R.turismo_dolar, mm = v => `${n1(v / 1e6)} millones`, O = t.origen_12m, OP = t.origen_pct, O0 = t.origen_ini;
    const debil = Math.min(ab(t.rs_llegan), ab(t.rs_salen)), fuerte = Math.max(ab(t.rs_llegan), ab(t.rs_salen));
    const respuesta = fz(debil) === fz(fuerte) || fuerte < .4 ? respuestaR(debil) : "En parte.";
    const salen = t.rs_salen < 0 ? "viajan menos" : "viajan más", llegan = t.rs_llegan > 0 ? "llegan más" : "llegan menos";
    const bajada = `Cuando el dólar real sube frente al mismo mes del año anterior, ${salen} residentes al exterior y ${llegan} turistas extranjeros: ` +
      `${dosRel(t.rs_salen, t.rs_llegan)}. Los meses de la pandemia, con las fronteras cerradas o con restricciones, no se cuentan.`;
    const contexto = "Un dólar caro abarata los viajes a la Argentina para quien llega con otra moneda y encarece los viajes al exterior para quien cobra " +
      "en pesos. Con un dólar barato pasa lo contrario. Este artículo pone al lado, mes por mes, cuántos turistas extranjeros llegan, cuántos residentes viajan al exterior, de dónde " +
      "vienen los turistas y el dólar en términos reales.";
    const medimos = ["Se cuentan viajes de turistas: personas que pasan al menos una noche en el país que visitan. Los turistas extranjeros son los que " +
      "viven en otro país y llegan a la Argentina, y los residentes, los que viven en la Argentina y viajan al exterior.",
      "El dólar real es el índice de tipo de cambio real multilateral del Banco Central: compara los precios del país con los de sus principales socios " +
      "comerciales, medidos en la misma moneda. El tipo de cambio real con Brasil hace lo mismo solo con Brasil."];
    // 1. los flujos de los últimos doce meses
    const s1 = `En los doce meses hasta ${t.ult} llegaron ${mm(t.llegan_12m)} de turistas extranjeros y viajaron al exterior ${mm(t.salen_12m)} de residentes. ` +
      `Las llegadas fueron las más altas de la serie en los doce meses hasta ${t.llegan_12m_max_mes}, con ${mm(t.llegan_12m_max)}, y las salidas, en los doce meses ` +
      `hasta ${t.salen_12m_max_mes}, con ${mm(t.salen_12m_max)}. En ${t.tcr_ult}, el dólar real estaba ${pctAbs(t.tcr_vs_prom)} ${t.tcr_vs_prom < 0 ? "por debajo" : "por encima"} de su promedio desde ${t.desde}.`;
    // 2. la balanza: llegadas menos salidas en doce meses
    const [bMax, vMax] = t.bz_max, [bMin, vMin] = t.bz_min, neg = t.bz_n - t.bz_pos;
    const dif = t.balanza_12m < 0 ? `salieron ${mm(-t.balanza_12m)} más de los que llegaron` : `llegaron ${mm(t.balanza_12m)} más de los que salieron`;
    const s2 = `En los doce meses hasta ${t.ult}, ${dif}. Desde ${t.bz_desde}, en ${neg} de los ${t.bz_n} períodos de doce meses viajaron al exterior más ` +
      `residentes que los turistas extranjeros que llegaron. La diferencia más grande hacia las salidas fue la de los doce meses hasta ${bMin}, con ${mm(-vMin)}, ` +
      (vMax > 0 ? `y la más grande hacia las llegadas, la de los doce meses hasta ${bMax}, con ${n0(vMax / 1e3)} mil. ` : ". ") +
      `La balanza tiene una relación ${fz(t.rs_balanza)} con el dólar real promedio de esos doce meses: ` +
      (t.rs_balanza > 0 ? "con el dólar más caro, la diferencia se inclina hacia las llegadas." : "con el dólar más caro, la diferencia se inclina hacia las salidas.");
    // 3. las salidas y el dólar real, frente al mismo mes del año anterior
    const s3 = `Si se compara cada mes con el mismo mes del año anterior, cuando el dólar real sube, ${salen} residentes al exterior: la relación es ` +
      `${fz(t.rs_salen)}. Para las llegadas de turistas extranjeros es ${fz(t.rs_llegan)}. Con los meses de la pandemia adentro, las dos se ` +
      `${ab(t.rs_salen_con) + ab(t.rs_llegan_con) < ab(t.rs_salen) + ab(t.rs_llegan) ? "debilitan" : "mantienen"}. ` +
      "El dólar pesa en todo el viaje de quien cobra en pesos, y para un extranjero es solo una de las cosas que cuentan.";
    // 4. de dónde llegan
    const s4 = `${t.brasil_primero ? "Brasil es el país del que llegan más turistas" : "Brasil es uno de los países de los que llegan más turistas"}: fue el ` +
      `${pct(OP.brasil)} de las llegadas de los últimos doce meses, con ${mm(O.brasil)} de viajes. Chile fue el ${pct(OP.chile)} y Uruguay, el ${pct(OP.uruguay)}. ` +
      `En los primeros doce meses de la serie, en ${t.anio_ini}, llegaron ${mm(O0.brasil)} de turistas de Brasil, ${mm(O0.chile)} de Chile y ${mm(O0.uruguay)} de ` +
      `Uruguay, sobre un total de ${mm(t.llegan_ini_12m)}.`;
    // 5. Brasil y su tipo de cambio real
    const s5 = `El tipo de cambio real con Brasil sube cuando la Argentina se abarata para quien viaja con reales. En ${t.tcr_ult} estaba ` +
      `${pctAbs(t.tcr_brasil_vs_prom)} ${t.tcr_brasil_vs_prom < 0 ? "por debajo" : "por encima"} de su promedio desde ${t.desde}. Frente al mismo mes del año ` +
      `anterior, lo que cambió ese tipo de cambio y lo que cambiaron las llegadas desde Brasil tienen una relación ${fz(t.rs_brasil)}. Con Chile es ` +
      `${fz(t.rs_chile)}, y con Uruguay, ${fz(t.rs_uruguay)}.`;
    const sintesis = [`En los doce meses hasta ${t.ult} llegaron ${mm(t.llegan_12m)} de turistas extranjeros y viajaron al exterior ${mm(t.salen_12m)} de residentes.`,
      `En ${neg} de los ${t.bz_n} períodos de doce meses desde ${t.bz_desde}, salieron más residentes que los turistas que llegaron.`,
      `Cuando el dólar real sube, ${salen} residentes al exterior (una relación ${fz(t.rs_salen)}) y ${llegan} turistas extranjeros (${fz(t.rs_llegan)}).`];
    const lim = [`Los meses entre ${t.pand_ini} y ${t.pand_fin} quedaron fuera de las correlaciones principales: con las fronteras cerradas o con restricciones, ` +
      "los viajes no dependían del dólar.",
      "Una correlación no prueba que una cosa cause la otra, y los meses seguidos no son casos independientes. También cuentan los ingresos en cada país, los vuelos, las temporadas y los feriados.",
      `Entre fines de 2011 y fines de 2015, y entre ${LIMITES}, hubo límites para comprar dólares y recargos a los gastos con tarjeta en el exterior: lo que pagaba un turista podía estar lejos del tipo de cambio oficial.`,
      `Los datos desde ${t.provisorio_desde} son provisorios.`];
    const notas = ["Turistas: estimación de turismo internacional del SINTA (Secretaría de Turismo y Ambiente), viajes de turistas no residentes que llegan y de residentes que viajan al exterior, por mes. Los doce meses suman cada mes con los once anteriores.",
      "Dólar real: índices de tipo de cambio real multilateral y bilaterales del Banco Central, promedio de cada mes.",
      "Pandemia: los meses desde 2020 en que llegó menos de la mitad de los turistas que en el mismo mes de 2019, y los que se comparan con uno de ellos.",
      `Correlación de Spearman, de menos 1 a 1: ${rTxt(t.rs_salen)} para las salidas, ${rTxt(t.rs_llegan)} para las llegadas, ${rTxt(t.rs_balanza)} para la balanza y ${rTxt(t.rs_brasil)} para Brasil.`];
    return {respuesta, bajada, contexto, medimos, sintesis, lim, notas, secciones: [
      {preg: "¿Cuántos turistas llegan y cuántos residentes viajan al exterior?", g: "turismo-flujos", forma: "lineas",
        tit: `En los doce meses hasta ${t.ult} viajaron al exterior ${mm(t.salen_12m)} de residentes y llegaron ${mm(t.llegan_12m)} de turistas`,
        pie: `Viajes de turistas en los doce meses que terminan en cada mes, en millones. Las salidas de residentes empiezan en ${t.desde_salen}.`, txt: [s1]},
      {preg: "¿Son más los turistas que llegan o los residentes que salen?", g: "turismo-balanza", forma: "lineas",
        tit: `En ${neg} de los ${t.bz_n} períodos de doce meses salieron más residentes que los turistas que llegaron`,
        pie: "Turistas extranjeros que llegan menos residentes que viajan al exterior, en los doce meses que terminan en cada mes, en millones. Debajo de la línea del cero, salen más de los que llegan.", txt: [s2]},
      {preg: "¿Viajan menos residentes al exterior cuando el dólar está caro?", g: "turismo-salidas", forma: "puntos",
        tit: `Lo que cambia el dólar real y lo que cambian los viajes al exterior: una relación ${fz(t.rs_salen)}`,
        pie: "Cada punto es un mes, frente al mismo mes del año anterior. Sin los meses de la pandemia. La línea punteada muestra la tendencia.", txt: [s3]},
      {preg: "¿De dónde llegan los turistas?", g: "turismo-origen", forma: "lineas",
        tit: `Brasil fue el ${pct(OP.brasil)} de las llegadas de los últimos doce meses`,
        pie: "Viajes de turistas de cada país en los doce meses que terminan en cada mes, en millones.", txt: [s4]},
      {preg: "¿Llegan más turistas de Brasil cuando la Argentina se abarata para ellos?", g: "turismo-brasil", forma: "puntos",
        tit: `El tipo de cambio real con Brasil y los turistas de Brasil: una relación ${fz(t.rs_brasil)}`,
        pie: "Cada punto es un mes, frente al mismo mes del año anterior. Sin los meses de la pandemia. La línea punteada muestra la tendencia.", txt: [s5]},
    ]};
  },
  dib: {
    "turismo-flujos": (el, a) => lineas(el, {anim: a, x: "t", y0: 0, vf: v => n1(v / 1e6) + " M", yf: v => v === 0 ? "0" : n0(v / 1e6) + " M", xl: r => mesPer(r.mes),
      data: T.turismo_dolar_mensual.filter(r => r.llegan_12m != null).map(r => ({...r, t: tPer(r.mes)})), mensual: true,
      series: [{k: "llegan_12m", lab: "Llegan", c: NAR}, {k: "salen_12m", lab: "Salen", c: FRI}]}),
    "turismo-balanza": (el, a) => {
      const data = T.turismo_dolar_mensual.filter(r => r.balanza_12m != null).map(r => ({...r, t: tPer(r.mes)}));
      return lineas(el, {anim: a, x: "t", y0: Math.min(0, d3.min(data, r => r.balanza_12m)), ref: 0, mensual: true, xl: r => mesPer(r.mes),
        vf: v => n1(v / 1e6) + " M", yf: v => v === 0 ? "0" : n0(v / 1e6) + " M", data, series: [{k: "balanza_12m", lab: "Llegan menos salen", corto: "Balanza", c: NAR}]});
    },
    "turismo-salidas": (el, a) => {
      const data = T.turismo_dolar_mensual.filter(r => r.var_valida && r.var_salen != null && r.var_tcr_itcrm != null).map(r => ({...r, codigo_indec: r.mes, territorio: mesPer(r.mes)}));
      return dispersion(el, {anim: a, data, x: "var_tcr_itcrm", y: "var_salen", yAuto: true, marcar: [data.at(-1).mes],
        xLab: "Cambio del dólar real", yLab: "Cambio de los viajes al exterior", fx: v => n0(v) + "%", fy: v => n0(v) + "%",
        vx: v => (v > 0 ? "+" : "") + pct(v), vy: v => (v > 0 ? "+" : "") + pct(v)});
    },
    "turismo-origen": (el, a) => {
      // los doce meses de cada país, sumados acá: la tabla trae solo los viajes de cada mes
      const M = T.turismo_dolar_mensual, ks = ["llegan_brasil", "llegan_chile", "llegan_uruguay"];
      const data = M.slice(11).map((r, i) => Object.fromEntries([["mes", r.mes], ["t", tPer(r.mes)], ...ks.map(k => [k, d3.sum(M.slice(i, i + 12), x => x[k])])]));
      return lineas(el, {anim: a, x: "t", y0: 0, mensual: true, xl: r => mesPer(r.mes), vf: v => n1(v / 1e6) + " M", yf: v => v === 0 ? "0" : n1(v / 1e6) + " M", data,
        series: [{k: "llegan_brasil", lab: "Brasil", c: NAR}, {k: "llegan_chile", lab: "Chile", c: FRI}, {k: "llegan_uruguay", lab: "Uruguay", c: css("--azul-hondo")}]});
    },
    "turismo-brasil": (el, a) => {
      const data = T.turismo_dolar_mensual.filter(r => r.var_valida && r.var_llegan_brasil != null && r.var_tcr_brasil != null).map(r => ({...r, codigo_indec: r.mes, territorio: mesPer(r.mes)}));
      return dispersion(el, {anim: a, data, x: "var_tcr_brasil", y: "var_llegan_brasil", yAuto: true, marcar: [data.at(-1).mes],
        xLab: "Cambio del tipo de cambio real con Brasil", yLab: "Cambio de los turistas de Brasil", fx: v => n0(v) + "%", fy: v => n0(v) + "%",
        vx: v => (v > 0 ? "+" : "") + pct(v), vy: v => (v > 0 ? "+" : "") + pct(v)});
    },
  },
}, {
  // etapa 24: la nafta súper en dólares al tipo de cambio oficial y el petróleo Brent, mes por mes
  id: "a-nafta-dolares", frec: "Se actualiza cada mes", tablas: ["nafta_dolares_mensual", "nafta_dolares_anual"],
  dek: "El precio de la nafta súper en el surtidor medido en dólares al tipo de cambio oficial, frente al precio internacional del petróleo: cuánto más cuesta, cuánto se suma por encima del petróleo, si sigue sus subas y bajas y cómo acompaña en pesos al dólar oficial.",
  fichas: [["f-combustibles", "precio de los combustibles"]],
  csv: [["nafta_dolares_mensual", "Descargar CSV por mes"], ["nafta_dolares_anual", "Descargar CSV por año"]],
  fuentes: "Secretaría de Energía, precios en estaciones de servicio (Resolución 1104/2004), Banco Central de la República Argentina, tipo de cambio de " +
    "referencia (Comunicación \"A\" 3500), y Administración de Información Energética de los Estados Unidos (EIA), precio del petróleo Brent",
  texto: () => {
    const t = R.nafta_dolares, usd = v => n2(v), m = Math.max(ab(t.rs_var), ab(t.rs_nivel));
    const respuesta = respuestaR(m);
    const bajada = `Al tipo de cambio oficial, cuando el petróleo Brent sube frente al mismo mes del año anterior, la nafta en dólares tiende a ` +
      `${t.rs_var > 0 ? "subir" : "bajar"}: la relación es ${fz(t.rs_var)}. Entre los precios de cada mes, la relación es ${fz(t.rs_nivel)}` +
      (ab(t.rs_nivel) < .4 ? ": hubo años con el petróleo caro y la nafta barata en dólares, y al revés." : ".");
    const contexto = "La nafta se hace con petróleo, que se compra y se vende en dólares en todo el mundo. Pero en el precio también pesan los impuestos, la refinación, el transporte, " +
      "la distribución y las decisiones de precios de las petroleras y del Estado. Este artículo compara, mes por mes desde " + t.desde + ", el precio de " +
      "la nafta súper medido en dólares al tipo de cambio oficial con el del petróleo Brent, una referencia internacional.";
    const medimos = ["El precio de la nafta es la mediana de lo que declaran las estaciones de servicio de todo el país para la nafta súper: la mitad " +
      "cobraba más y la otra mitad, menos. Se pasa a dólares con el tipo de cambio oficial de referencia del Banco Central, promedio de cada mes.",
      "El Brent es el precio del petróleo del Mar del Norte, una referencia internacional. Un barril tiene casi 159 litros, así que el precio del barril " +
      "se divide por esos litros para compararlo con el de un litro de nafta."];
    // 1. el precio de hoy y los extremos
    const s1 = `En ${t.ult}, el litro de nafta súper costaba ${n0(t.nafta)} pesos en la mediana de las estaciones del país: ${usd(t.nafta_usd)} dólares al tipo de ` +
      `cambio oficial de referencia. Un litro de petróleo Brent costaba ${usd(t.brent_litro)} dólares (${n2(t.brent)} el barril). Medida en dólares al tipo de cambio oficial, la nafta ` +
      `fue la más cara en ${t.usd_max_mes}, con ${usd(t.usd_max)} dólares por litro, y la más barata en ${t.usd_min_mes}, con ${usd(t.usd_min)}.`;
    // 2. cuántas veces el petróleo
    const s2 = "Un litro de nafta cuesta más que un litro de petróleo, porque suma la refinación, los impuestos, el transporte y la distribución. Pero esa " +
      `diferencia cambió mucho: en ${t.veces_min_anio}, la nafta costó en promedio ${n1(t.veces_min)} veces lo que un litro de Brent, y en ${t.veces_max_anio}, ` +
      `${n1(t.veces_max)} veces. En ${t.veces_ult_anio} fueron ${n1(t.veces_ult)} veces.`;
    // 3. lo que se suma por encima del petróleo
    const [dMax, vMax] = t.dif_max, [dMin, vMin] = t.dif_min;
    const s3 = `En ${t.ult}, al litro de nafta se le sumaban ${usd(t.dif_ult)} dólares por encima de lo que costaba un litro de Brent. En promedio desde ` +
      `${t.desde}, fueron ${usd(t.dif_prom)} dólares. La diferencia más grande fue la de ${dMax}, con ${usd(vMax)} dólares, y la más chica, la de ${dMin}, con ` +
      `${usd(vMin)}. Esa diferencia paga los impuestos, la refinación, el transporte, la distribución y el margen de las estaciones. No se puede separar ` +
      "cuánto es cada cosa con estos datos.";
    // 4. los cambios del petróleo y de la nafta en dólares
    const s4 = `Si se compara cada mes con el mismo mes del año anterior, lo que cambió el Brent y lo que cambió la nafta en dólares tienen una relación ` +
      `${fz(t.rs_var)}, y desde ${t.sin_desde}, ${fz(t.rs_var_sin)}. Entre los precios de cada mes, sin compararlos con el año anterior, la relación es ` +
      `${fz(t.rs_nivel)}. Entre el petróleo y el surtidor están el tipo de cambio y los impuestos.`;
    // 5. la nafta en pesos y el dólar oficial
    const s5 = `En pesos, lo que cambió la nafta frente al mismo mes del año anterior y lo que cambió el dólar oficial tienen una relación ${fz(t.rs_pesos_tc)}. ` +
      `En ${t.pesos_mas_tc} de los ${t.n_pesos} meses, la nafta en pesos subió más que el dólar, es decir, se encareció en dólares. En ${t.ult}, la nafta ` +
      `${t.pesos_var_ult < 0 ? "bajaba" : "subía"} ${pctAbs(t.pesos_var_ult)} frente al mismo mes del año anterior y el dólar oficial, ${pctAbs(t.tc_var_ult)}. ` +
      "Cuando el dólar sube de golpe, el surtidor puede tardar en acompañar, y en esos meses la nafta se abarata en dólares.";
    const sintesis = [`En ${t.ult}, el litro de nafta súper costaba ${usd(t.nafta_usd)} dólares al tipo de cambio oficial, y un litro de Brent, ${usd(t.brent_litro)}.`,
      `En ${t.veces_ult_anio}, la nafta costó ${n1(t.veces_ult)} veces lo que el petróleo. Fue de ${n1(t.veces_min)} veces en ${t.veces_min_anio} a ${n1(t.veces_max)} en ${t.veces_max_anio}.`,
      `Lo que cambia el petróleo y lo que cambia la nafta en dólares tienen una relación ${fz(t.rs_var)}.`,
      `En pesos, la nafta y el dólar oficial tienen una relación ${fz(t.rs_pesos_tc)}.`];
    const lim = ["El precio en dólares usa el tipo de cambio oficial de referencia del Banco Central. Entre fines de 2011 y fines de " +
      `2015, y entre ${LIMITES}, las personas tuvieron límites para comprar dólares, y con otros tipos de cambio el precio en dólares de esos años sería más bajo.`,
      "El petróleo que procesan las refinerías del país puede tener otro precio que el Brent.",
      "Una correlación no prueba que una cosa cause la otra, y los meses seguidos no son casos independientes: una misma devaluación pesa en varios a la vez.",
      "Son dólares de cada año, sin descontar la inflación de los Estados Unidos."];
    const notas = ["Nafta súper: mediana de los precios que declaran las estaciones de servicio de todo el país (Secretaría de Energía, Resolución 1104/2004), en pesos por litro.",
      "Tipo de cambio: tipo de cambio de referencia del Banco Central (Comunicación \"A\" 3500), promedio de cada mes.",
      "Brent: precio del petróleo Brent de la Administración de Información Energética de los Estados Unidos (EIA), promedio de cada mes, dividido por 158,987 litros por barril.",
      `Correlación de Spearman, de menos 1 a 1: ${rTxt(t.rs_var)} entre los cambios del Brent y de la nafta en dólares, ${rTxt(t.rs_nivel)} entre los precios ` +
      `y ${rTxt(t.rs_pesos_tc)} entre la nafta en pesos y el dólar oficial. Los promedios de cada año cuentan solo los años completos.`];
    return {respuesta, bajada, contexto, medimos, sintesis, lim, notas, secciones: [
      {preg: "¿Cuánto cuesta la nafta en dólares?", g: "nafta-dolares", forma: "lineas",
        tit: `En ${t.ult}, el litro de nafta súper costaba ${usd(t.nafta_usd)} dólares al tipo de cambio oficial`,
        pie: "Dólares por litro. La nafta, al tipo de cambio oficial de referencia, mediana de las estaciones del país. El Brent, promedio de cada mes.", txt: [s1]},
      {preg: "¿Cuánto más cara que el petróleo es la nafta?", g: "nafta-veces", forma: "lineas",
        tit: `En ${t.veces_ult_anio}, un litro de nafta costó ${n1(t.veces_ult)} veces lo que un litro de petróleo`,
        pie: "Promedio de cada año completo: la nafta en dólares dividida por el Brent por litro.", txt: [s2]},
      {preg: "¿Cuánto se suma por encima del petróleo?", g: "nafta-dif", forma: "lineas",
        tit: `Por encima del petróleo, el litro de nafta suma ${usd(t.dif_ult)} dólares`,
        pie: "Dólares por litro: la nafta súper al tipo de cambio oficial menos un litro de Brent, por mes.", txt: [s3]},
      {preg: "¿Sube la nafta cuando sube el petróleo?", g: "nafta-cambios", forma: "puntos",
        tit: `Lo que cambia el petróleo y lo que cambia la nafta en dólares: una relación ${fz(t.rs_var)}`,
        pie: "Cada punto es un mes, frente al mismo mes del año anterior. La línea punteada muestra la tendencia.", txt: [s4]},
      {preg: "¿Y en pesos, la nafta sigue al dólar?", g: "nafta-tc", forma: "puntos",
        tit: `Lo que cambia el dólar oficial y lo que cambia la nafta en pesos: una relación ${fz(t.rs_pesos_tc)}`,
        pie: "Cada punto es un mes, frente al mismo mes del año anterior. Arriba de la línea punteada, la nafta subió más de lo que indica la tendencia.", txt: [s5]},
    ]};
  },
  dib: {
    "nafta-dolares": (el, a) => lineas(el, {anim: a, x: "t", y0: 0, vf: n2, yf: n1, xl: r => mesPer(r.mes), mensual: true,
      data: T.nafta_dolares_mensual.map(r => ({...r, t: tPer(r.mes)})),
      series: [{k: "nafta_usd", lab: "Nafta súper", c: NAR}, {k: "brent_litro", lab: "Petróleo Brent", c: FRI}]}),
    "nafta-veces": (el, a) => lineas(el, {anim: a, x: "anio", y0: 0, vf: n1, yf: n0, data: T.nafta_dolares_anual,
      series: [{k: "veces", lab: "Veces", c: NAR}]}),
    "nafta-dif": (el, a) => lineas(el, {anim: a, x: "t", y0: 0, vf: n2, yf: n1, xl: r => mesPer(r.mes), mensual: true,
      data: T.nafta_dolares_mensual.map(r => ({...r, t: tPer(r.mes), dif: r.nafta_usd - r.brent_litro})),
      series: [{k: "dif", lab: "Por encima del petróleo", corto: "Diferencia", c: NAR}]}),
    "nafta-cambios": (el, a) => {
      const data = T.nafta_dolares_mensual.filter(r => r.var_brent != null && r.var_nafta_usd != null).map(r => ({...r, codigo_indec: r.mes, territorio: mesPer(r.mes)}));
      return dispersion(el, {anim: a, data, x: "var_brent", y: "var_nafta_usd", yAuto: true, marcar: [data.at(-1).mes],
        xLab: "Cambio del Brent", yLab: "Cambio de la nafta en dólares", fx: v => n0(v) + "%", fy: v => n0(v) + "%",
        vx: v => (v > 0 ? "+" : "") + pct(v), vy: v => (v > 0 ? "+" : "") + pct(v)});
    },
    "nafta-tc": (el, a) => {
      // los cambios frente al mismo mes del año anterior, calculados acá con la nafta en pesos y el tipo de cambio de la tabla
      const M = T.nafta_dolares_mensual, data = M.slice(12).map((r, i) => ({...r, codigo_indec: r.mes, territorio: mesPer(r.mes),
        var_pesos: (r.nafta / M[i].nafta - 1) * 100, var_tc: (r.a3500 / M[i].a3500 - 1) * 100}));
      return dispersion(el, {anim: a, data, x: "var_tc", y: "var_pesos", yAuto: true, marcar: [data.at(-1).mes],
        xLab: "Cambio del dólar oficial", yLab: "Cambio de la nafta en pesos", fx: v => n0(v) + "%", fy: v => n0(v) + "%",
        vx: v => (v > 0 ? "+" : "") + pct(v), vy: v => (v > 0 ? "+" : "") + pct(v)});
    },
  },
}, {
  // etapa 24: las cantidades exportadas por rubro y el dólar real, trimestre por trimestre (INDEC y BCRA)
  id: "a-exportaciones-dolar", frec: "Se actualiza cada trimestre", tablas: ["exportaciones_dolar_trimestral", "exportaciones_cantidades_anual"],
  dek: "Qué exporta el país, cuánto cambiaron las cantidades exportadas por gran rubro, sin el efecto de los precios, cómo se movió el dólar en términos reales y si se exporta más cuando el dólar está caro.",
  fichas: [["f-exportaciones", "exportaciones por provincia"]],
  csv: [["exportaciones_dolar_trimestral", "Descargar CSV por trimestre"], ["exportaciones_cantidades_anual", "Descargar CSV por año"]],
  fuentes: "INDEC, índices de valor, precio y cantidad de las exportaciones de bienes e intercambio comercial argentino, vía API de Series de Tiempo, y Banco " +
    "Central de la República Argentina, índices de tipo de cambio real multilateral y bilateral con Brasil",
  texto: () => {
    const t = R.exportaciones_dolar, rs = t.rs, P = t.pct, K = t.cant_ult, mx = Math.max(ab(rs.total), ab(t.rs_moi_brasil));
    // los rubros con su artículo, para nombrarlos en cualquier lugar de la oración
    const NOM = {primarios: "los productos primarios", moa: "las manufacturas de origen agropecuario", moi: "las manufacturas de origen industrial", combustibles: "los combustibles y la energía"};
    const May = x => x[0].toUpperCase() + x.slice(1);
    const rub = Object.keys(NOM), topP = rub.reduce((a, b) => P[b] > P[a] ? b : a), topR = rub.reduce((a, b) => ab(rs[b]) > ab(rs[a]) ? b : a);
    const respuesta = respuestaR(mx);
    const sube = rs.total > 0 ? "crecer" : "caer";
    const bajada = `Cuando el dólar real sube frente al año anterior, las cantidades que exporta el país medio año después tienden a ${sube}` +
      `: la relación es ${fz(rs.total)}. En el mismo trimestre, la relación es ${fz(t.rs_mismo)}.`;
    const contexto = "Con un dólar caro, lo que se produce en el país cuesta menos dólares en el exterior y cada dólar que se vende rinde más pesos. Pero " +
      "cuánto se exporta depende también de las cosechas, de los precios en el mundo, de lo que se puede producir y de los impuestos a las exportaciones. " +
      `Este artículo compara, trimestre por trimestre desde ${t.desde_anio}, las cantidades que exporta el país, sin el efecto de los precios, con el dólar ` +
      "en términos reales.";
    const medimos = ["Las cantidades exportadas son los índices de cantidad del INDEC: cuánto se vende al exterior sin el efecto de los precios, con " +
      `${t.desde_anio} igual a 100.`,
      "El dólar real es el índice de tipo de cambio real multilateral del Banco Central. Cuando sube, lo que se produce en el país es más barato para el resto del mundo."];
    // 1. qué se exporta, en dólares
    const s1 = `En los doce meses hasta ${t.doce_hasta}, el país exportó ${n0(t.doce_total)} millones de dólares: el ${pct(P.moa)} fueron manufacturas de ` +
      `origen agropecuario, como harinas, aceites y carnes, el ${pct(P.moi)}, manufacturas de origen industrial, como autos y productos químicos, el ` +
      `${pct(P.primarios)}, productos primarios, como granos y minerales, y el ${pct(P.combustibles)}, combustibles y energía. Los productos primarios y las ` +
      `manufacturas de origen agropecuario suman el ${pct(P.primarios + P.moa)}.`;
    // 2. las cantidades por rubro
    const cam = v => `${v < 100 ? "un " + pctAbs(v - 100) + " menos" : "un " + pct(v - 100) + " más"} que en ${t.desde_anio}`;
    const s2 = `Medidas en cantidades, sin el efecto de los precios, las exportaciones de ${t.anio_ult} fueron ` +
      (t.total_max_anio === t.anio_ult ? `las más altas de la serie: ${cam(K.total)}. ` : `${cam(K.total)}, menores que las de ${t.total_max_anio}, el año más alto. `) +
      `Por rubro, los productos primarios exportaron ${cam(K.primarios)}, las manufacturas de origen agropecuario, ${cam(K.moa)}, las de origen industrial, ` +
      `${cam(K.moi)}, y los combustibles, ${cam(K.combustibles)}. Los combustibles se multiplicaron por ${n1(t.comb_veces)} desde ${t.comb_min_anio}, y los ` +
      `productos primarios tuvieron su mayor caída en ${t.pp_caida_anio}, cuando bajaron ${pctAbs(t.pp_caida)} frente al año anterior.`;
    // 3. el dólar real
    const s3 = `En el ${t.ult}, el dólar real estaba ${pctAbs(t.tcr_vs_prom)} ${t.tcr_vs_prom < 0 ? "por debajo" : "por encima"} de su promedio desde ${t.desde_anio}, ` +
      `y el tipo de cambio real con Brasil, ${pctAbs(t.tcr_brasil_vs_prom)} ${t.tcr_brasil_vs_prom < 0 ? "por debajo" : "por encima"} del suyo. El dólar real más alto de la ` +
      `serie fue el del ${t.tcr_max}, y el más bajo, el del ${t.tcr_min}.`;
    // 4. el dólar de medio año antes y las cantidades
    const s4 = `Si se compara cada trimestre con el mismo del año anterior, lo que cambió el dólar real medio año antes y lo que cambiaron las cantidades ` +
      `exportadas tienen una relación ${fz(rs.total)}. Desde ${t.sin_desde}, es ${fz(t.rs_sin)}. Con el dólar del mismo trimestre es ${fz(t.rs_mismo)}, y con el ` +
      `de un año antes, ${fz(t.rs_anio)}.` + (ab(rs.total) > Math.max(ab(t.rs_mismo), ab(t.rs_anio)) ?
      " El medio año de espera es el que muestra la relación más marcada: los cambios en las ventas al exterior llevan tiempo." : "");
    // 5. por rubro
    const otros = rub.filter(k => k !== topR).sort((p, q) => ab(rs[q]) - ab(rs[p]));
    const s5 = `Por rubro, con medio año de espera, la relación más marcada es la de ${NOM[topR]}: ${fz(rs[topR])}. Es ` +
      `${lista(otros.map(k => `${fz(rs[k])} en ${NOM[k]}`))}. Las cosechas dependen del clima, y los combustibles, de lo invertido en pozos.`;
    // 6. Brasil y las manufacturas industriales
    const s6 = "Brasil es uno de los principales socios comerciales del país y uno de los principales destinos de las manufacturas industriales, como los autos. " +
      `Con el tipo de cambio real con Brasil de medio año antes, la relación de esas manufacturas es ${fz(t.rs_moi_brasil)}` +
      (fz(t.rs_moi_brasil) === fz(rs.moi) ? ", como con el dólar real multilateral" : `, frente a una relación ${fz(rs.moi)} con el dólar real multilateral`) +
      `, y desde ${t.sin_desde}, ${fz(t.rs_moi_brasil_sin)}.`;
    const sintesis = [`En los doce meses hasta ${t.doce_hasta}, el país exportó ${n0(t.doce_total)} millones de dólares. ${May(NOM[topP])} fueron el ${pct(P[topP])}.`,
      `Las cantidades exportadas de ${t.anio_ult} fueron ${cam(K.total)}.`,
      `Lo que cambia el dólar real y lo que cambian las cantidades exportadas medio año después tienen una relación ${fz(rs.total)}.`];
    const lim = ["Son trimestres de una sola economía, y los trimestres seguidos no son casos independientes: una misma crisis o una misma cosecha pesa en varios a la vez.",
      "Una correlación no prueba que una cosa cause la otra. En los mismos años cambiaron las cosechas, los precios internacionales, la producción de petróleo " +
      "y gas, los impuestos a las exportaciones y las reglas para cobrar los dólares de lo que se exporta.",
      "El índice de tipo de cambio real usa los tipos de cambio oficiales. En algunos períodos, los exportadores pudieron cobrar parte de sus ventas a tipos " +
      "de cambio distintos del oficial.",
      "La parte de cada rubro en las exportaciones se mide en dólares, así que cambia también con los precios internacionales."];
    const notas = [`Cantidades: índices de cantidad de las exportaciones del INDEC, del total y de cada gran rubro, por trimestre, con ${t.desde_anio} = 100. Los años completos promedian sus cuatro trimestres.`,
      "Parte de cada rubro: exportaciones en dólares de los últimos doce meses (INDEC, intercambio comercial argentino).",
      "Dólar real: índices de tipo de cambio real multilateral y bilateral con Brasil del Banco Central, promedio de cada trimestre. El de medio año antes es el cambio de dos trimestres atrás.",
      `Correlación de Spearman, de menos 1 a 1: ${rTxt(rs.total)} para el total, ${rTxt(t.rs_mismo)} con el mismo trimestre y ${rTxt(t.rs_moi_brasil)} para las manufacturas industriales con Brasil. El INDEC revisa los últimos trimestres en cada publicación.`];
    return {respuesta, bajada, contexto, medimos, sintesis, lim, notas, secciones: [
      {preg: "¿Qué exporta el país?", g: "export-partes", forma: "barras",
        tit: `${May(NOM[topP])} fueron el ${pct(P[topP])} de lo exportado en los últimos doce meses`,
        pie: `% de las exportaciones en dólares de los doce meses hasta ${t.doce_hasta}.`, txt: [s1]},
      {preg: "¿Cuánto cambiaron las cantidades exportadas?", g: "export-cantidades", forma: "lineas", alto: "396px",
        tit: `Las cantidades exportadas de ${t.anio_ult} fueron ${cam(K.total)}`,
        pie: `Índices de cantidad del INDEC, ${t.desde_anio} = 100, sin el efecto de los precios. Años completos.`, txt: [s2]},
      {preg: "¿Cómo se movió el dólar real?", g: "export-tcr", forma: "lineas",
        tit: `En el ${t.ult}, el dólar real estaba ${pctAbs(t.tcr_vs_prom)} ${t.tcr_vs_prom < 0 ? "por debajo" : "por encima"} de su promedio`,
        pie: "Índices de tipo de cambio real del Banco Central, promedio de cada trimestre. Más alto quiere decir un país más barato frente a sus socios.", txt: [s3]},
      {preg: "¿Se exporta más medio año después de que sube el dólar?", g: "export-dolar", forma: "puntos",
        tit: `Lo que cambia el dólar real y lo que cambian las cantidades exportadas medio año después: una relación ${fz(rs.total)}`,
        pie: "Cada punto es un trimestre, frente al mismo trimestre del año anterior. La línea punteada muestra la tendencia.", txt: [s4]},
      {preg: "¿Qué rubro se mueve más con el dólar?", g: "export-rubros", forma: "barras",
        tit: `La relación más marcada es la de ${NOM[topR]}`,
        pie: "Correlación entre el cambio del dólar real de medio año antes y el de las cantidades exportadas de cada rubro, de menos 1 a 1.", txt: [s5]},
      {preg: "¿Y las manufacturas industriales con Brasil?", g: "export-brasil", forma: "puntos",
        tit: `El tipo de cambio real con Brasil y las manufacturas de origen industrial: una relación ${fz(t.rs_moi_brasil)}`,
        pie: "Cada punto es un trimestre: el cambio del tipo de cambio real con Brasil de medio año antes y el de las cantidades de manufacturas de origen industrial exportadas.", txt: [s6]},
    ]};
  },
  dib: {
    "export-partes": (el, a) => {
      const X = R.exportaciones_dolar, NOM = {primarios: "Productos primarios", moa: "Manufacturas agropecuarias", moi: "Manufacturas industriales", combustibles: "Combustibles"};
      return barrasH(el, {anim: a, data: Object.entries(NOM).map(([k, n]) => ({codigo_indec: k, territorio: n, v: X.pct[k]})), k: "v", vf: pct, af: v => n0(v) + "%",
        l: 190, lAngosto: 180, tip: d => `<b>${d.territorio}</b><br>${pct(d.v)} de las exportaciones de los doce meses hasta ${X.doce_hasta}`});
    },
    "export-cantidades": (el, a) => lineas(el, {anim: a, x: "anio", y0: 0, vf: n0, yf: n0, data: T.exportaciones_cantidades_anual,
      series: [{k: "primarios", lab: "Productos primarios", c: NAR}, {k: "moa", lab: "Manufacturas agropecuarias", c: FRI},
        {k: "moi", lab: "Manufacturas industriales", c: css("--azul-hondo")}, {k: "combustibles", lab: "Combustibles", c: css("--sol-borde")}]}),
    "export-tcr": (el, a) => lineas(el, {anim: a, x: "t", y0: 0, vf: n0, yf: n0, xl: triCorto,
      data: T.exportaciones_dolar_trimestral.map(r => ({...r, t: r.anio + (r.trimestre - 1) / 4})),
      series: [{k: "tcr", lab: "Dólar real", c: NAR}, {k: "tcr_brasil", lab: "Con Brasil", c: FRI}]}),
    "export-dolar": (el, a) => {
      const data = T.exportaciones_dolar_trimestral.filter(r => r.var_tcr_antes != null && r.var_total != null).map(r => ({...r, codigo_indec: r.periodo, territorio: triCorto(r)}));
      return dispersion(el, {anim: a, data, x: "var_tcr_antes", y: "var_total", yAuto: true, marcar: [data.at(-1).periodo],
        xLab: "Cambio del dólar real, medio año antes", yLab: "Cambio de las cantidades exportadas", fx: v => n0(v) + "%", fy: v => n0(v) + "%",
        vx: v => (v > 0 ? "+" : "") + pct(v), vy: v => (v > 0 ? "+" : "") + pct(v)});
    },
    "export-rubros": (el, a) => {
      const X = R.exportaciones_dolar, NOM = {total: "Total", primarios: "Productos primarios", moa: "Manufacturas agropecuarias", moi: "Manufacturas industriales", combustibles: "Combustibles"};
      return barrasH(el, {anim: a, data: Object.entries(NOM).map(([k, n]) => ({codigo_indec: k, territorio: n, v: X.rs[k]})), k: "v", vf: rTxt, af: n1,
        l: 190, lAngosto: 180, marcar: new Set(["total"]), tip: d => `<b>${d.territorio}</b><br>Correlación de ${rTxt(d.v)}, una relación ${fz(d.v)}`});
    },
    "export-brasil": (el, a) => {
      const data = T.exportaciones_dolar_trimestral.filter(r => r.var_tcr_brasil_antes != null && r.var_moi != null).map(r => ({...r, codigo_indec: r.periodo, territorio: triCorto(r)}));
      return dispersion(el, {anim: a, data, x: "var_tcr_brasil_antes", y: "var_moi", yAuto: true, marcar: [data.at(-1).periodo],
        xLab: "Cambio del tipo de cambio real con Brasil, medio año antes", yLab: "Cambio de las manufacturas industriales", fx: v => n0(v) + "%", fy: v => n0(v) + "%",
        vx: v => (v > 0 ? "+" : "") + pct(v), vy: v => (v > 0 ? "+" : "") + pct(v)});
    },
  },
}];
ART_SERIE.forEach(a => {
  Object.assign(a, DAT_ART[a.id]);
  const nota = document.getElementById(a.id); if (!nota) return;
  const t = a.texto(), ficha = id => id && paginaDe(id) ? urlPagina(paginaDe(id), "#" + id) : null;
  yaEscrito(nota).innerHTML =
    `<div class="nota-cab"><span class="nota-ico">${icono(a.icono)}</span><div><p class="nota-meta">${nombreSec(a.sec)}. ${a.frec}</p><h1 class="nota-tit" style="view-transition-name:t-${a.id}">${a.titulo}</h1></div></div>` +
    `<p class="nota-bajada"><mark>${t.respuesta}</mark> ${t.bajada}</p>` +
    // modelo nuevo (2 de noviembre de 2026, pedido del autor, como los artículos de Fundar): "En síntesis" arriba, "Qué medimos", cada sección
    // con su pregunta (h2) y un gráfico cuyo título es la conclusión (h3), y "Fuentes y metodología" con notas numeradas. Los artículos que
    // todavía no lo tienen se ven como antes
    // texto() corre al cargar la página, y también en el armado para las tarjetas de Artículos (DATINA_ARMADO_ARTICULOS), antes de que lleguen las tablas diferidas:
    // usa solo el resumen (R), y lo que necesita se calcula en 02_procesar.py. Las tablas son para los gráficos (dib)
    (t.sintesis ? `<div class="nota-frase nota-sintesis"><h2>En síntesis</h2><ul>${t.sintesis.map(x => `<li>${x}</li>`).join("")}</ul></div>` : "") +
    `<p>${t.contexto}</p>` + (t.medimos ? `<div class="nota-medimos"><h2>Qué medimos</h2>${t.medimos.map(x => `<p>${x}</p>`).join("")}</div>` : "") +
    t.secciones.map(s => (s.preg ? `<div class="nota-sec"><h2>${s.preg}</h2>` : "") + `<div class="nota-graf"><h${s.preg ? 3 : 2}>${s.tit}</h${s.preg ? 3 : 2}>` +
      (s.html || (s.antes || "") + `<div class="grafico" data-g="art-${s.g}" data-forma="${s.forma}"${s.alto ? ` style="--alto:${s.alto}"` : ""}></div>` + (s.despues || "")) +
      `<p class="nota-pie-graf">${s.pie}</p></div>` + s.txt.map(p => `<p>${p}</p>`).join("") + (s.preg ? "</div>" : "")).join("") +
    `<div class="nota-limites"><h2>Qué no dice este dato</h2><ul>${t.lim.map(l => `<li>${l}</li>`).join("")}</ul></div>` +
    `<div class="nota-fuentes">` + (t.notas ? `<h2>Fuentes y metodología</h2><ol class="nota-notas">${t.notas.map(x => `<li>${x}</li>`).join("")}</ol>` : "") +
    `<p>Fuentes: ${a.fuentes}.</p><div class="acciones">` +
    a.fichas.filter(([id]) => ficha(id)).map(([id, nom]) => `<a class="boton chico accion" href="${ficha(id)}">Ficha: ${nom}</a>`).join("") +
    a.csv.map(([n, lab]) => `<a class="boton chico accion" href="datos/${n}.csv" download>${lab}</a>`).join("") + `</div></div>`;
  Object.entries(a.dib).forEach(([g, f]) => { DIB["art-" + g] = conTablas("art-" + g, a.tablas, anim => f(G("art-" + g), anim)); });
  // lo que no es un gráfico, como la calculadora de la canasta (etapa 5 del plan de mejora)
  a.iniciar?.(nota);
});
// todos los artículos, primero los de series (los más nuevos). La lista de Artículos la escribe el constructor en este mismo orden
const ARTS = [...ART_SERIE, ...ART];
/* Lo que se ve de los artículos fuera de sus páginas (plan técnico, fase 5, 25 de noviembre de 2026): las tres tarjetas de la portada, la
   respuesta de cada artículo en la página Artículos y "Artículos con este dato" en el pie de cada ficha. Hasta entonces lo armaba datina.js al
   cargar cada página, con las cuentas de todos los artículos. Desde entonces lo calcula esta función, con el mismo código, en el armado:
   scripts/texto_en_html.mjs la corre en las páginas que la tienen (las de los artículos, que piden esta parte), controla que todas den lo mismo
   y lo deja escrito en el HTML de cada página. Así las demás páginas no necesitan esta parte, y sin JavaScript también se ve. Ninguna de las tres cosas depende del día ni de la
   provincia elegida (se controló al hacer el cambio).
   - La portada: una fila de tres, con el artículo de la relación más marcada primero (hasta el 10 de octubre de 2026 era el destacado
     amarillo) y después los más nuevos. Los de política no se eligen por un cálculo automático. El resto, en "Todos los artículos". Van antes
     de las piezas del Laboratorio, que escribe el constructor (Fase 2, paso 2).
   - La página Artículos (etapa 5 del plan de mejora): la respuesta de cada artículo en su tarjeta, la misma que lo abre. En los de series,
     una respuesta corta ("En parte.") va con la primera oración de su bajada, que dice de qué. Si las cuentas de un artículo fallan, su
     tarjeta va sin respuesta (null).
   - "Artículos con este dato" (Fase 2, paso 4, respuesta del autor del 23 de octubre de 2026): cada ficha enlaza a los artículos que la usan,
     la misma relación de los botones "Ficha: …" de cada artículo, al revés, en el orden de la lista de Artículos. Va en el pie, debajo de
     las acciones (en datina.js, después de parte("articulos"), el párrafo vuelve al final del pie cuando datina.js lo completa) */
const sinMarcas = t => String(t).replace(/<[^>]*>/g, "");
window.DATINA_ARMADO_ARTICULOS = () => {
  const fuerte = ART.filter(a => a.sec !== "politica" && a.c).sort((p, q) => Math.abs(q.c[0].rs) - Math.abs(p.c[0].rs))[0];
  const portada = [fuerte, ...ARTS.filter(a => a !== fuerte)].slice(0, 3).map(tarjetaArt).join("");
  const respuestas = Object.fromEntries(ARTS.map(a => {
    try {
      const t = a.c ? null : a.texto(), r = a.c ? `${a.t[0].respuesta} ${a.t[0].frase}` : t.respuesta;
      return [a.id, sinMarcas(r.length < 40 && t ? `${r} ${sinMarcas(t.bajada).split(/(?<=\.)\s/)[0]}` : r)];
    } catch { return [a.id, null]; }
  }));
  const de = {};
  ART.forEach(a => { const M = META_TAB[tablaArt(a)];
    new Set(partesArt(a).flatMap(p => [M[p.x].ficha, M[p.y].ficha])).forEach(id => { if (id) (de[id] ||= []).push(a); }); });
  ART_SERIE.forEach(a => a.fichas.forEach(([id]) => (de[id] ||= []).push(a)));
  const pies = Object.fromEntries(Object.keys(de).sort().map(id => { const arts = ARTS.filter(a => de[id].includes(a));
    return [id, `<p class="pie-arts"><span>${arts.length > 1 ? "Artículos" : "Artículo"} con este dato:</span>` +
      arts.map(a => `<a class="enlace" href="${urlPagina(a.id)}">${a.titulo}</a>`).join("") + "</p>"]; }));
  return {portada, respuestas, pies};
};
};
