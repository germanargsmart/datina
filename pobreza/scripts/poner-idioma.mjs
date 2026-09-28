// Framework genera <html> sin atributo de idioma. Este paso, que corre después de
// "observable build", marca todas las páginas de dist como español de la Argentina.
import {readdir, readFile, writeFile} from "node:fs/promises";
import {join} from "node:path";

async function* html(dir) {
  for (const e of await readdir(dir, {withFileTypes: true})) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* html(p);
    else if (e.name.endsWith(".html")) yield p;
  }
}

let n = 0;
for await (const archivo of html("dist")) {
  const texto = await readFile(archivo, "utf8");
  const nuevo = texto.replace(/<html(?![^>]*\blang=)([^>]*)>/i, '<html lang="es-AR"$1>');
  if (nuevo !== texto) { await writeFile(archivo, nuevo); n++; }
}
console.log(`Idioma es-AR marcado en ${n} página(s) de dist.`);
