window.DATINA_PARTES = window.DATINA_PARTES || {};
window.DATINA_PARTES["catalogo"] = () => {
(() => {
const lista = document.getElementById("cat-lista");
if (!lista) return;
const items = [...lista.children], q = document.getElementById("cat-q"), cuenta = document.getElementById("cat-cuenta");
const vacio = document.getElementById("cat-vacio"), limpiar = document.getElementById("cat-limpiar"), ia = document.getElementById("cat-ia");
const sels = {tema: "cat-tema", org: "cat-org", cob: "cat-cob", anio: "cat-anio"};
Object.keys(sels).forEach(k => { sels[k] = document.getElementById(sels[k]); });
const sinTildes = t => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const textos = new Map(items.map(li => [li, sinTildes([li.id.slice(4), ...[...li.querySelectorAll(".etiqueta, .cat-tit, .cat-sub, .cat-datos dd, .cat-dic code")].map(x => x.textContent)].join(" "))]));
const PASO = 24;
let tope = PASO, coinciden = [];
lista.insertAdjacentHTML("afterend", `<button type="button" class="boton ver-todos" id="cat-mas" hidden></button>`);
const mas = document.getElementById("cat-mas");
function filtrar(guardar = true, reiniciar = true) {
const pal = sinTildes(q.value).split(/\s+/).filter(Boolean), {tema, org, cob} = Object.fromEntries(Object.entries(sels).map(([k, s]) => [k, s.value]));
const anio = +sels.anio.value || 0;
if (reiniciar) tope = PASO;
coinciden = items.filter(li => {
const d = li.dataset;
return pal.every(p => textos.get(li).includes(p)) && (!tema || d.tema === tema) && (!org || d.org.split(" ").includes(org)) &&
(!cob || d.cob === cob) && (!anio || (d.a0 !== "" && +d.a0 <= anio && anio <= +d.a1));
});
const aLaVista = new Set(coinciden.slice(0, tope)), n = coinciden.length, resto = n - aLaVista.size;
items.forEach(li => { li.hidden = !aLaVista.has(li); });
mas.hidden = resto <= 0;
mas.textContent = resto <= 0 ? "" : resto === 1 ? "Mostrar la última tabla" : resto <= PASO ? `Mostrar las ${resto} tablas que quedan` : `Mostrar ${PASO} tablas más (quedan ${resto})`;
const filtrado = pal.length || tema || org || cob || anio;
cuenta.innerHTML = filtrado ? `<b>${n}</b> de ${items.length} tablas` : `<b>${n}</b> tablas`;
vacio.hidden = n > 0;
limpiar.hidden = !filtrado;
if (ia) {
ia.hidden = !q.value.trim();
ia.querySelector("a").setAttribute("href", "consulta-ia" + (q.value.trim() ? "?q=" + encodeURIComponent(q.value.trim()) : ""));
}
if (!guardar) return;
const u = new URL(location.href);
[["q", q.value.trim()], ...Object.entries(sels).map(([k, s]) => [k, s.value])].forEach(([k, v]) => v ? u.searchParams.set(k, v) : u.searchParams.delete(k));
history.replaceState(history.state, "", u);
}
const par = new URLSearchParams(location.search);
q.value = par.get("q") || "";
Object.entries(sels).forEach(([k, s]) => { const v = par.get(k); if (v && [...s.options].some(o => o.value === v)) s.value = v; });
filtrar(false);
q.addEventListener("input", () => filtrar());
Object.values(sels).forEach(s => s.addEventListener("change", () => filtrar()));
mas.addEventListener("click", () => {
const primera = coinciden[tope];
tope += PASO;
filtrar(false, false);
primera?.querySelector(".cat-tit a")?.focus();
});
limpiar.addEventListener("click", () => {
q.value = ""; Object.values(sels).forEach(s => { s.value = ""; });
filtrar(); q.focus();
});
async function vistaPrevia(caja) {
const filas = caja.querySelector(".cat-filas");
if (filas.dataset.listo) return;
filas.innerHTML = `<p class="nota" role="status">Cargando las primeras filas…</p>`;
try {
const r = await fetch(filas.dataset.csv);
if (!r.ok) throw new Error(r.status);
const [cab, ...resto] = d3.csvParseRows(await r.text()), total = resto.length, muestra = resto.slice(0, 10);
const nombre = filas.dataset.csv.split("/").pop();
const t = document.createElement("table");
t.className = "tabla-areas";
t.createCaption().textContent = `Primeras ${muestra.length} de ${n0(total)} filas de ${nombre}`;
const tr = t.createTHead().insertRow();
cab.forEach(c => { const th = document.createElement("th"); th.scope = "col"; th.textContent = c; tr.appendChild(th); });
const tb = t.createTBody();
muestra.forEach(f => { const fila = tb.insertRow(); cab.forEach((_, i) => { fila.insertCell().textContent = f[i] ?? ""; }); });
const caja2 = document.createElement("div");
caja2.className = "tabla-desliza"; caja2.tabIndex = 0; caja2.setAttribute("role", "region"); caja2.setAttribute("aria-label", `Vista previa de ${nombre}`);
caja2.appendChild(t);
filas.replaceChildren(caja2);
filas.dataset.listo = "1";
} catch {
filas.innerHTML = `<p class="nota" role="status">No se pudo cargar la vista previa. Cerrala y volvé a abrirla para probar de nuevo.</p>`;
}
}
lista.addEventListener("click", ev => {
const b = ev.target.closest(".cat-ver");
if (!b) return;
const caja = document.getElementById(b.getAttribute("aria-controls")), abrir = b.getAttribute("aria-expanded") !== "true";
b.setAttribute("aria-expanded", String(abrir));
caja.hidden = !abrir;
if (abrir) vistaPrevia(caja);
});
const elegida = location.hash.startsWith("#cat-") ? document.getElementById(location.hash.slice(1)) : null;
if (elegida?.classList.contains("cat-item")) {
const i = coinciden.indexOf(elegida);
if (i >= tope) { tope = Math.ceil((i + 1) / PASO) * PASO; filtrar(false, false); }
elegida.hidden = false;
elegida.querySelector(".cat-ver").click();
}
})();
};
