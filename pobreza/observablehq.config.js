// Configuración del sitio. Documentación: https://observablehq.com/framework/config
export default {
  title: "Pobreza en la Argentina: consultas",
  root: "src",
  output: "dist",

  // Dos páginas: la de consultas y el diccionario de datos
  pages: [
    {name: "Consultas", path: "/"},
    {name: "Diccionario de datos", path: "/diccionario"}
  ],
  sidebar: false,
  pager: false,
  toc: false,
  search: false,

  // Tema claro de Framework más la hoja de estilos propia (colores, tipografía)
  style: "estilo.css",
  // el ícono de la pestaña, el mismo gorro de Datina (scripts/plantilla.html): sin él el navegador pedía /favicon.ico, que no existe, y la
  // consola marcaba un error (etapa C del rediseño, 24 de octubre de 2026). Va en base64 porque Framework vuelve a codificar los % del SVG
  head: `<link rel="icon" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCA0MCAzNic+PHBhdGggZmlsbD0nI0M4MTAyRScgZD0nTTcsMjkgQzUuNSwxNyAxMCw2LjUgMTkuNSw0LjIgQzI2LjUsMi42IDMzLjUsNS4yIDM2LDEwLjYgQzM3LjIsMTMuMiAzNSwxNS40IDMyLjYsMTMuOCBDMzEsMTIuNiAyOS4yLDExLjYgMjcsMTIuMiBDMzEuNiwxNiAzMy44LDIxLjYgMzMuNiwyOSBaJy8+PHBhdGggZmlsbD0nIzhBMTQyMicgZD0nTTUuNiwyNy42IEwzNSwyNy42IFEzNS44LDMxLjYgMzUsMzMuNCBRMjAuMywzNS42IDUuNiwzMy40IFE0LjgsMzEuNiA1LjYsMjcuNiBaJy8+PC9zdmc+">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght@8..144,300..700&display=swap">
<script>
// Framework reescribe los enlaces que salen de este sitio: el de vuelta a Datina se corrige al cargar la página. Desde la Fase 2 (paso 4,
// 23 de octubre de 2026, pedido del autor) lleva a Pobreza y hogares, de donde se llega al consultor, y no a la portada
document.addEventListener("DOMContentLoaded", () => {
  const a = document.querySelector(".cabecera .volver");
  if (a) a.href = new URL("../pobreza.html", location.href.replace(/[^/]*$/, "")).href;
});
</script>
<meta name="description" content="Datos abiertos y consultables de pobreza e indigencia en la Argentina: 31 aglomerados urbanos (INDEC, EPH) y estimaciones por partido del GBA y comuna de la Ciudad, primer semestre de 2026.">`,
  header: `<nav class="cabecera"><a href="../pobreza.html" class="volver">Datina: Pobreza y hogares</a><a href="./">Consultas</a><a href="./diccionario">Diccionario de datos</a></nav>`,
  footer: `Elaboración propia sobre INDEC: Encuesta Permanente de Hogares y Censo 2022. Las cifras por partido, comuna y fracción son estimaciones estadísticas, no mediciones oficiales.`
};
