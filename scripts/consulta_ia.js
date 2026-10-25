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
   La respuesta se escribe como texto (nunca como HTML) y los enlaces de las fichas solo pueden ir a páginas del propio sitio.
   Revisión de accesibilidad del mismo día: el botón no se deshabilita (el foco se perdía) y mientras trabaja dice "Detener"; al terminar,
   bien o mal, el foco va al título de la tarjeta; el aviso para lectores de pantalla existe desde que carga la página; un error se ve
   como "No se pudo contestar", con un enlace al Catálogo de datos, y nunca deja una respuesta a medias como si estuviera completa; la
   respuesta crece al final, sin volver a escribir los párrafos que ya estaban */
(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const form = $("ia-form");
  if (!form || !window.fetch || !window.TextDecoder) return;
  const campo = $("ia-pregunta"), boton = $("ia-enviar"), estado = $("ia-estado"), caja = $("ia-respuesta"), texto = $("ia-texto"),
    fuentes = $("ia-fuentes"), lista = $("ia-fichas"), titulo = $("ia-respuesta-tit"), eco = $("ia-pregunta-eco"), salida = $("ia-salida");
  const NO_DISPONIBLE = "Las consultas con IA no están disponibles en este momento. Probá más tarde.";
  const CORTADA = "La respuesta se cortó antes de terminar. No uses lo que llegó a escribirse: probá de nuevo.";
  const ESPERA_MAX = 90000;   // sin ningún dato del servidor en este tiempo, la consulta se da por caída
  // solo enlaces a páginas del sitio: "trabajo.html#f-salarios", "provincia.html", "./"
  const URL_PROPIA = /^(?:\.\/|[\w-]+\.html)(?:#[\w-]+)?$/;
  let actual = null;

  // la pregunta que llega en el enlace (?q=..., desde el buscador) queda escrita, sin enviarse: cada consulta tiene un costo y la decide
  // quien pregunta
  const q = new URLSearchParams(location.search).get("q");
  if (q) {
    campo.value = q.slice(0, 400);
    estado.textContent = "Tu pregunta quedó escrita. Tocá Preguntar para enviarla.";
  }

  // la respuesta, párrafo por párrafo: solo cambia el último y se agregan los nuevos (un lector de pantalla no pierde su lugar)
  let escrito = "", pendiente = false;
  const pintar = () => {
    pendiente = false;
    // sin marcas de formato: el modelo escribe párrafos, y si se le escapa un ** no se muestra
    const parrafos = escrito.replace(/\*\*/g, "").split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
    const hay = texto.children;
    while (hay.length > parrafos.length) hay[hay.length - 1].remove();
    parrafos.forEach((p, i) => {
      if (!hay[i]) texto.append(document.createElement("p"));
      if (hay[i].textContent !== p) hay[i].textContent = p;
    });
  };
  const agregar = t => {
    if (!escrito) { caja.hidden = false; avisar("Escribiendo la respuesta…"); }
    escrito += t;
    if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); }
  };
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
        // la tabla que leyó, para bajarla como desde el pie de la ficha
        if (typeof f.tabla === "string" && /^\w+$/.test(f.tabla)) {
          const t = Object.assign(document.createElement("a"), {className: "ia-tabla", href: `datos/${f.tabla}.csv`, textContent: `${f.tabla}.csv`});
          t.setAttribute("download", "");
          li.append(" ", t);
        }
        return li;
      });
    lista.replaceChildren(...items);
    fuentes.hidden = !items.length;
  };

  const ocupado = si => {
    form.toggleAttribute("aria-busy", si);
    boton.querySelectorAll(".ia-e").forEach(e => e.classList.toggle("activa", e.dataset.e === (si ? "trabaja" : "listo")));
  };
  const TARDA = "La consulta tardó demasiado. Probá de nuevo o con una pregunta más acotada.";
  const terminar = (mensaje, pregunta, nombre = "No se pudo contestar") => {
    ocupado(false);
    caja.hidden = false;
    if (mensaje) {
      // un error no es una respuesta: se dice en el título, lo escrito a medias se borra y se ofrece seguir en el catálogo
      titulo.textContent = nombre;
      escrito = mensaje; pintar();
      mostrarFuentes([]);
      salida.href = "catalogo.html?q=" + encodeURIComponent(pregunta);
      salida.hidden = false;
      avisar("");
    } else avisar("Respuesta lista.");
    titulo.focus({preventScroll: true});
  };

  form.addEventListener("submit", async ev => {
    ev.preventDefault();
    // mientras trabaja, el mismo botón detiene la consulta
    if (form.hasAttribute("aria-busy")) { if (actual) { actual.motivo = "persona"; actual.abort(); } return; }
    const pregunta = campo.value.trim();
    if (pregunta.length < 3) { avisar("Escribí una pregunta de al menos tres letras."); return; }
    const corte = actual = new AbortController();
    let reloj = 0;
    const vigilar = () => { clearTimeout(reloj); reloj = setTimeout(() => { corte.motivo = "espera"; corte.abort(); }, ESPERA_MAX); };
    ocupado(true);
    borrar();
    mostrarFuentes([]);
    caja.hidden = true;
    salida.hidden = true;
    titulo.textContent = "Respuesta";
    eco.textContent = pregunta;
    avisar("Buscando en los datos de Datina…");
    let fallo = "", fin = false;
    try {
      vigilar();
      const r = await fetch("api/consulta", {method: "POST", headers: {"Content-Type": "application/json"},
                                             body: JSON.stringify({pregunta}), signal: corte.signal});
      if (!r.ok || !r.body) {
        let m = NO_DISPONIBLE;
        try { const j = await r.json(); if (j && typeof j.error === "string") m = j.error; } catch (e) { /* sin cuerpo en JSON */ }
        throw Object.assign(new Error(m), {propio: true});
      }
      const lector = r.body.getReader(), dec = new TextDecoder();
      let resto = "";
      const evento = linea => {
        if (!linea.trim()) return;
        let e;
        try { e = JSON.parse(linea); } catch (x) { return; }
        if (e.t === "texto" && typeof e.texto === "string") agregar(e.texto);
        else if (e.t === "reinicio") { borrar(); caja.hidden = true; avisar("Buscando más datos…"); }
        else if (e.t === "paso" && typeof e.texto === "string") avisar(e.texto);
        else if (e.t === "fuentes" && Array.isArray(e.fichas)) mostrarFuentes(e.fichas);
        else if (e.t === "error") fallo = typeof e.texto === "string" ? e.texto : NO_DISPONIBLE;
        else if (e.t === "fin") fin = true;
      };
      for (;;) {
        const {value, done} = await lector.read();
        if (done) break;
        vigilar();
        resto += dec.decode(value, {stream: true});
        const lineas = resto.split("\n");
        resto = lineas.pop();
        lineas.forEach(evento);
      }
      evento(resto + dec.decode());
      pintar();
      if (fallo) throw Object.assign(new Error(fallo), {propio: true});
      // sin "fin", la respuesta llegó cortada (se cayó la conexión o la función)
      if (!fin || !escrito.trim()) throw Object.assign(new Error(escrito.trim() ? CORTADA : NO_DISPONIBLE), {propio: true});
      if (actual === corte) terminar("", pregunta);
    } catch (err) {
      if (actual !== corte) return;   // la reemplazó otra consulta
      if (corte.motivo === "persona") terminar("La detuviste antes de que terminara.", pregunta, "Consulta detenida");
      else terminar(err?.propio ? err.message : corte.motivo === "espera" ? TARDA : NO_DISPONIBLE, pregunta);
    } finally {
      clearTimeout(reloj);
      if (actual === corte) actual = null;
    }
  });
})();
