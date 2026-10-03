// Cliente mínimo del protocolo de Chrome (DevTools Protocol), sin dependencias: Node 22 o más ya trae WebSocket.
// Abre Chrome sin ventana, crea pestañas y deja mandar comandos, evaluar JavaScript y recorrer la página.
// Lo usa scripts/prueba_paginas.mjs. La ruta de Chrome se puede dar en la variable CHROME.
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = process.env.CHROME || {
  win32: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  darwin: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
}[process.platform] || "google-chrome";
export const espera = ms => new Promise(r => setTimeout(r, ms));

export async function abrirChrome(puerto = 9333) {
  const perfil = mkdtempSync(join(tmpdir(), "cdp-"));
  // en Linux (la actualización automática de GitHub) Chrome no puede usar su aislamiento dentro de la máquina virtual
  const linux = process.platform === "linux" ? ["--no-sandbox", "--disable-dev-shm-usage"] : [];
  const proc = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${puerto}`, `--user-data-dir=${perfil}`, ...linux,
    "--no-first-run", "--no-default-browser-check", "--hide-scrollbars", "--mute-audio", "--disable-gpu",
    "--force-color-profile=srgb", "--font-render-hinting=none", "about:blank"], { stdio: "ignore" });
  proc.on("error", e => { console.error(`No se pudo abrir Chrome (${CHROME}): ${e.message}`); process.exit(1); });
  let ok = false;
  for (let i = 0; i < 100 && !ok; i++) {
    try { await (await fetch(`http://127.0.0.1:${puerto}/json/version`)).json(); ok = true; } catch { await espera(150); }
  }
  if (!ok) throw new Error(`Chrome no respondió (${CHROME})`);
  return {
    async pestana() {
      const t = await (await fetch(`http://127.0.0.1:${puerto}/json/new?about:blank`, { method: "PUT" })).json();
      return conectar(t.webSocketDebuggerUrl);
    },
    async cerrar() { try { proc.kill(); } catch {} await espera(400); try { rmSync(perfil, { recursive: true, force: true }); } catch {} },
  };
}

async function conectar(url) {
  const ws = new WebSocket(url);
  await new Promise((ok, mal) => { ws.onopen = ok; ws.onerror = mal; });
  let n = 0;
  const pend = new Map(), oyentes = new Map();
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pend.has(m.id)) { const { ok, mal } = pend.get(m.id); pend.delete(m.id); m.error ? mal(new Error(m.error.message)) : ok(m.result); }
    else if (m.method) (oyentes.get(m.method) || []).forEach(f => f(m.params));
  };
  const send = (method, params = {}) => new Promise((ok, mal) => { const i = ++n; pend.set(i, { ok, mal }); ws.send(JSON.stringify({ id: i, method, params })); });
  const on = (ev, f) => { if (!oyentes.has(ev)) oyentes.set(ev, []); oyentes.get(ev).push(f); };
  const errores = [];
  on("Runtime.exceptionThrown", p => errores.push("excepción: " + (p.exceptionDetails.exception?.description || p.exceptionDetails.text)));
  on("Runtime.consoleAPICalled", p => { if (p.type === "error") errores.push("console.error: " + p.args.map(a => a.value ?? a.description).join(" ")); });
  on("Log.entryAdded", p => { if (p.entry.level === "error") errores.push(`log: ${p.entry.text} ${p.entry.url || ""}`); });
  let cargada = () => {};
  on("Page.loadEventFired", () => cargada());
  await send("Page.enable"); await send("Runtime.enable"); await send("Log.enable");
  const pag = {
    send, errores,
    async tamano(ancho, alto) {
      await send("Emulation.setDeviceMetricsOverride", { width: ancho, height: alto, deviceScaleFactor: 1, mobile: ancho < 768 });
    },
    async ir(u, extra = 1200) {
      errores.length = 0;
      const carga = new Promise(r => { cargada = r; });
      await send("Page.navigate", { url: u });
      await Promise.race([carga, espera(20000)]);
      await pag.eval("document.fonts ? document.fonts.ready.then(() => true) : true");
      await espera(extra);
    },
    async eval(expr) {
      const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error("eval: " + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
      return r.result.value;
    },
    async recorrer(paso = 700, pausa = 120) {
      // baja por toda la página para que se dibuje cada ficha (los gráficos se dibujan al entrar en pantalla) y vuelve arriba.
      // La página crece mientras se dibujan: el largo se vuelve a medir en cada paso
      for (let y = 0; ; ) {
        await pag.eval(`window.scrollTo(0, ${y})`); await espera(pausa);
        const fin = await pag.eval("document.documentElement.scrollHeight - innerHeight");
        if (y >= fin) break;
        y = Math.min(y + paso, fin);
      }
      await pag.eval("window.scrollTo(0, 0)");
    },
  };
  return pag;
}
