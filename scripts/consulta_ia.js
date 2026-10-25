/* Consultas con IA (25 de octubre de 2026, pedido del autor: "empezá a integrar IA para consultas generativas con la información").
   Lo copia 03_construir_sitio.py a sitio/consulta-ia.js solo con "consulta_ia": true en datos/manual/sitio.json, y lo pide la página de
   las consultas (sección consulta-ia de la plantilla). Envía la pregunta a la función de Cloudflare Pages /api/consulta
   (functions/api/consulta.js) y escribe lo que contesta a medida que llega: una línea de JSON por evento (docs/ia/CONSULTAS.md).
     {"t":"paso","texto":...}     qué está leyendo el modelo (va al aviso para lectores de pantalla)
     {"t":"texto","texto":...}    un pedazo de la respuesta
     {"t":"reinicio"}             lo escrito hasta ahí no era la respuesta (el modelo siguió leyendo tablas): se borra
     {"t":"fuentes","fichas":[{"titulo","url","tabla"}]}   las fichas de las tablas que leyó
     {"t":"error","texto":...}    no se pudo contestar
     {"t":"fin"}
   La respuesta se escribe como texto (nunca como HTML) y los enlaces de las fichas solo pueden ir a páginas del propio sitio. */
(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const form = $("ia-form");
  if (!form || !window.fetch || !window.TextDecoder) return;
  const campo = $("ia-pregunta"), boton = $("ia-enviar"), estado = $("ia-estado"), caja = $("ia-respuesta"), texto = $("ia-texto"),
    fuentes = $("ia-fuentes"), lista = $("ia-fichas"), titulo = $("ia-respuesta-tit");
  const NO_DISPONIBLE = "Las consultas con IA no están disponibles en este momento. Probá más tarde o buscá el dato en el Catálogo de datos.";
  // solo enlaces a páginas del sitio: "trabajo.html#f-salarios", "provincia.html", "./"
  const URL_PROPIA = /^(?:\.\/|[\w-]+\.html)(?:#[\w-]+)?$/;
  let actual = null;

  // la pregunta que llega en el enlace (?q=...) queda escrita, sin enviarse: cada consulta tiene un costo y la decide quien pregunta
  const q = new URLSearchParams(location.search).get("q");
  if (q) campo.value = q.slice(0, 400);

  let escrito = "", pendiente = false;
  const pintar = () => {
    pendiente = false;
    // sin marcas de formato: el modelo escribe párrafos, y si se le escapa un ** no se muestra
    const parrafos = escrito.replace(/\*\*/g, "").split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
    texto.replaceChildren(...parrafos.map(p => Object.assign(document.createElement("p"), {textContent: p})));
  };
  const agregar = t => { escrito += t; if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); } };
  const borrar = () => { escrito = ""; pintar(); };
  const avisar = t => { estado.textContent = t; };

  const mostrarFuentes = fichas => {
    const vistas = new Set();
    const items = fichas.filter(f => f && typeof f.url === "string" && URL_PROPIA.test(f.url) && !vistas.has(f.url) && vistas.add(f.url))
      .map(f => {
        const li = document.createElement("li"), a = document.createElement("a");
        a.className = "enlace";
        a.href = f.url;
        a.textContent = String(f.titulo || f.url);
        li.append(a);
        if (f.tabla) li.append(Object.assign(document.createElement("code"), {textContent: ` ${f.tabla}.csv`}));
        return li;
      });
    lista.replaceChildren(...items);
    fuentes.hidden = !items.length;
  };

  const terminar = mensaje => {
    form.removeAttribute("aria-busy");
    boton.disabled = false;
    if (mensaje) avisar(mensaje);
  };

  form.addEventListener("submit", async ev => {
    ev.preventDefault();
    const pregunta = campo.value.trim();
    if (pregunta.length < 3) { avisar("Escribí una pregunta."); campo.focus(); return; }
    if (actual) actual.abort();
    const corte = actual = new AbortController();
    form.setAttribute("aria-busy", "true");
    boton.disabled = true;
    borrar();
    mostrarFuentes([]);
    caja.hidden = false;
    avisar("Buscando en los datos de Datina…");
    let fallo = "";
    try {
      const r = await fetch("api/consulta", {method: "POST", headers: {"Content-Type": "application/json"},
                                             body: JSON.stringify({pregunta}), signal: corte.signal});
      if (!r.ok || !r.body) {
        let m = NO_DISPONIBLE;
        try { const j = await r.json(); if (j && typeof j.error === "string") m = j.error; } catch (e) { /* sin cuerpo en JSON */ }
        throw new Error(m);
      }
      const lector = r.body.getReader(), dec = new TextDecoder();
      let resto = "";
      const evento = linea => {
        if (!linea.trim()) return;
        let e;
        try { e = JSON.parse(linea); } catch (x) { return; }
        if (e.t === "texto" && typeof e.texto === "string") agregar(e.texto);
        else if (e.t === "reinicio") borrar();
        else if (e.t === "paso" && typeof e.texto === "string") avisar(e.texto);
        else if (e.t === "fuentes" && Array.isArray(e.fichas)) mostrarFuentes(e.fichas);
        else if (e.t === "error") fallo = typeof e.texto === "string" ? e.texto : NO_DISPONIBLE;
      };
      for (;;) {
        const {value, done} = await lector.read();
        if (done) break;
        resto += dec.decode(value, {stream: true});
        const lineas = resto.split("\n");
        resto = lineas.pop();
        lineas.forEach(evento);
      }
      evento(resto + dec.decode());
      pintar();
      if (fallo) throw new Error(fallo);
      if (!escrito.trim()) throw new Error(NO_DISPONIBLE);
      if (actual === corte) terminar("Respuesta lista.");
    } catch (err) {
      if (corte.signal.aborted) return;
      const m = err && err.message && err.name !== "TypeError" ? err.message : NO_DISPONIBLE;
      if (!escrito.trim()) { escrito = m; pintar(); }
      terminar(m);
      titulo.focus();
    } finally {
      if (actual === corte) actual = null;
    }
  });
})();
