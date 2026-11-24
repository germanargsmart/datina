// Parte de datina.js que usa solo catalogo.html (el Catálogo de datos). Plan técnico, fase 5 (24 de noviembre de 2026): 03_construir_sitio.py la publica
// en sitio/partes/catalogo.html.js, achicada como datina.js, y solo esa página la pide, antes de datina.js. Acá solo se anota: datina.js la corre
// con parte("catalogo.html") en el mismo lugar donde estaba este código, así que tiene a mano todo lo que datina.js definió antes y corre en el
// mismo orden que cuando era un solo archivo. Lo que se declara acá adentro queda para esta parte.
window.DATINA_PARTES = window.DATINA_PARTES || {};
window.DATINA_PARTES["catalogo"] = () => {
/* ---------- catálogo de datos (catalogo.html, 11 de octubre de 2026) ----------
   La lista, los filtros y el diccionario de cada tabla los escribe el constructor (scripts/catalogo.py). Acá: buscar con todas las palabras
   y sin tildes, como el Explorador de relaciones, filtrar por tema, organismo, cobertura y año, guardar todo eso en el enlace para poder
   compartirlo, y la vista previa, que baja la tabla recién cuando alguien la pide y muestra sus primeras 10 filas tal como vienen en el CSV */
(() => {
  const lista = document.getElementById("cat-lista");
  if (!lista) return;
  const items = [...lista.children], q = document.getElementById("cat-q"), cuenta = document.getElementById("cat-cuenta");
  const vacio = document.getElementById("cat-vacio"), limpiar = document.getElementById("cat-limpiar"), ia = document.getElementById("cat-ia");
  const sels = {tema: "cat-tema", org: "cat-org", cob: "cat-cob", anio: "cat-anio"};
  Object.keys(sels).forEach(k => { sels[k] = document.getElementById(sels[k]); });
  const sinTildes = t => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  // lo que se busca: lo que se ve de cada tabla y los nombres de sus columnas
  const textos = new Map(items.map(li => [li, sinTildes([li.id.slice(4), ...[...li.querySelectorAll(".etiqueta, .cat-tit, .cat-sub, .cat-datos dd, .cat-dic code")].map(x => x.textContent)].join(" "))]));
  // de a 24 tablas (auditoría de UX del 22 de octubre de 2026, pedido del autor): con las 205 a la vista, en el celular la página medía
  // unas 116 pantallas. Se ven las primeras 24 de las que coinciden con la búsqueda y los filtros, que buscan en todas, y "Mostrar más"
  // suma otras 24. Sin JavaScript se ven todas, como antes
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
    // con algo escrito, ofrece llevarlo a Consultas con IA (etapa 6 del plan de mejora: el Catálogo busca tablas y ofrece preguntarles)
    if (ia) {
      ia.hidden = !q.value.trim();
      ia.querySelector("a").setAttribute("href", "consulta-ia" + (q.value.trim() ? "?q=" + encodeURIComponent(q.value.trim()) : ""));
    }
    if (!guardar) return;
    const u = new URL(location.href);
    [["q", q.value.trim()], ...Object.entries(sels).map(([k, s]) => [k, s.value])].forEach(([k, v]) => v ? u.searchParams.set(k, v) : u.searchParams.delete(k));
    history.replaceState(history.state, "", u);
  }
  // un enlace con filtros (catalogo.html?q=salta&org=org:indec) los trae puestos, si existen
  const par = new URLSearchParams(location.search);
  q.value = par.get("q") || "";
  Object.entries(sels).forEach(([k, s]) => { const v = par.get(k); if (v && [...s.options].some(o => o.value === v)) s.value = v; });
  filtrar(false);
  q.addEventListener("input", () => filtrar());
  Object.values(sels).forEach(s => s.addEventListener("change", () => filtrar()));
  // las tablas que se suman: el foco va a la primera, para seguir leyendo desde ahí con el teclado o el lector de pantalla
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
      // la red falló: un aviso que se anuncia, y al volver a abrir se prueba de nuevo
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
  // un enlace a una tabla (catalogo.html#cat-salarios_provincias) la muestra abierta
  const elegida = location.hash.startsWith("#cat-") ? document.getElementById(location.hash.slice(1)) : null;
  // si está más abajo de las primeras 24, se muestran todas hasta ella, sin saltear ninguna
  if (elegida?.classList.contains("cat-item")) {
    const i = coinciden.indexOf(elegida);
    if (i >= tope) { tope = Math.ceil((i + 1) / PASO) * PASO; filtrar(false, false); }
    elegida.hidden = false;
    elegida.querySelector(".cat-ver").click();
  }
})();
};
