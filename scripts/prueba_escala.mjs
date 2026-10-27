// Prueba de la escala de fuerza de las correlaciones (plan de mejora, E5 y T6, 27 de octubre de 2026). Hasta entonces datina.js tenía cinco
// escalas, y el mismo valor recibía otra palabra según la página: Cruces llamaba "fuerte" a un 0,52 que los artículos llamaban "moderada".
// Controla que:
// - haya una sola función que pone la palabra (fuerza) y ningún otro "? "fuerte" :" o parecido en sitio/datina.js;
// - los casos fijos del plan den la palabra de la escala (0,39, 0,40, 0,52, 0,60 y 0,70, y los negativos igual);
// - la palabra siga al número que se muestra con dos decimales: un 0,395 se ve "0,40" y es "moderada";
// - la respuesta destacada de los artículos salga de la misma escala (E4, 28 de octubre de 2026): "Sí." desde 0,60, "En parte." desde 0,40,
//   "Apenas." desde 0,20, y ningún artículo escriba "Sí, en general." por su cuenta.
// Uso: node scripts/prueba_escala.mjs   (Node 22 o más, después de armar el sitio). La corre cada PR (.github/workflows/pruebas.yml)
import { readFileSync } from "node:fs";

const fuente = readFileSync(new URL("../sitio/datina.js", import.meta.url), "utf8");
const lineas = fuente.split("\n");
const PALABRAS = /[?:]\s*"(muy fuerte|fuerte|moderada|débil|casi nula|prácticamente nula)"/;
const errores = [];

const defs = lineas.map((l, i) => [i + 1, l]).filter(([, l]) => /^\s*const fuerza\s*=/.test(l));
if (defs.length !== 1) errores.push(`tiene que haber una sola "const fuerza", hay ${defs.length}`);
const otras = lineas.map((l, i) => [i + 1, l]).filter(([, l]) => PALABRAS.test(l) && !/^\s*const fuerza\s*=/.test(l));
for (const [n, l] of otras) errores.push(`otra escala en la línea ${n}: ${l.trim().slice(0, 140)}`);

let fuerza = null;
if (defs.length === 1) fuerza = new Function(`${defs[0][1].trim()}; return fuerza;`)();
const CASOS = [[0, "casi nula"], [0.19, "casi nula"], [0.2, "débil"], [0.39, "débil"], [0.395, "moderada"], [0.4, "moderada"], [0.52, "moderada"],
  [-0.52, "moderada"], [0.595, "moderada"], [0.599, "fuerte"], [0.6, "fuerte"], [0.7, "fuerte"], [-0.7, "fuerte"], [1, "fuerte"]];
let bien = 0;
if (fuerza) for (const [r, esperada] of CASOS) {
  const dio = fuerza(r);
  if (dio === esperada) bien++;
  else errores.push(`fuerza(${r}) dio "${dio}" y tenía que dar "${esperada}" (se muestra ${r.toFixed(2).replace(".", ",")})`);
}

const lineaDe = rx => lineas.find(l => rx.test(l));
const defResp = [lineaDe(/^\s*const RESP\s*=/), lineaDe(/^\s*const respuestaR\s*=/)];
if (defResp.some(l => !l) || !defs.length) errores.push('faltan "const RESP" o "const respuestaR" en datina.js');
else {
  const respuestaR = new Function(`${defs[0][1].trim()} ${defResp[0].trim()} ${defResp[1].trim()} return respuestaR;`)();
  for (const [r, esperada] of [[0.19, "No hay un patrón claro."], [0.2, "Apenas."], [0.39, "Apenas."], [0.395, "En parte."], [0.44, "En parte."],
    [-0.44, "En parte."], [0.6, "Sí."], [0.81, "Sí."], [-0.85, "Sí."]]) {
    const dio = respuestaR(r);
    if (dio === esperada) bien++;
    else errores.push(`respuestaR(${r}) dio "${dio}" y tenía que dar "${esperada}"`);
  }
}
for (const [n, l] of lineas.map((l, i) => [i + 1, l]).filter(([, l]) => /"Sí, en general\."/.test(l)))
  errores.push(`una respuesta escrita aparte de la escala en la línea ${n}: ${l.trim().slice(0, 140)}`);

if (errores.length) {
  console.error("Escala de fuerza: hay problemas");
  for (const e of errores) console.error("  " + e);
  process.exit(1);
}
console.log(`Escala de fuerza: una sola en datina.js, también para la respuesta de los artículos, y ${bien} casos bien.`);
