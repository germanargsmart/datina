// Configuración del sitio. Documentación: https://observablehq.com/framework/config
export default {
  title: "Consultor de pobreza | Datina",
  root: "src",
  output: "dist",

  // Dos páginas: la del consultor y el diccionario de datos. Desde el 28 de octubre de 2026 (plan de mejora, etapa 6: "Consultas" queda solo
  // para la IA) la primera se llama "Consultor de pobreza" y en la cabecera "Consultor" (más largo no entra en un renglón en 320 píxeles)
  pages: [
    {name: "Consultor de pobreza", path: "/"},
    {name: "Diccionario de datos", path: "/diccionario"}
  ],
  sidebar: false,
  pager: false,
  toc: {show: false, label: "En esta página"},
  search: false,

  // Tema claro de Framework más la hoja de estilos propia (colores, tipografía)
  style: "estilo.css",
  // el ícono de la pestaña, el mismo gorro de Datina (scripts/plantilla.html): sin él el navegador pedía /favicon.ico, que no existe, y la
  // consola marcaba un error (etapa C del rediseño, 24 de octubre de 2026). Va en base64 porque Framework vuelve a codificar los % del SVG.
  // Al final, las etiquetas de Open Graph y Twitter, como en el resto del sitio, para la vista previa al compartir el enlace (P2-12)
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
<meta name="description" content="Pobreza e indigencia en la Argentina para consultar, filtrar y descargar: los 31 aglomerados urbanos de la EPH del INDEC y estimaciones por partido del Gran Buenos Aires y comuna de CABA.">
<meta property="og:site_name" content="Datina">
<meta property="og:locale" content="es_AR">
<meta property="og:type" content="website">
<meta property="og:title" content="Consultor de pobreza: ¿Cuánta pobreza hay en cada aglomerado, partido y comuna?">
<meta property="og:description" content="Pobreza e indigencia en la Argentina para consultar, filtrar y descargar: los 31 aglomerados urbanos de la EPH del INDEC y estimaciones por partido del Gran Buenos Aires y comuna de CABA.">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="Consultor de pobreza: ¿Cuánta pobreza hay en cada aglomerado, partido y comuna?">
<meta name="twitter:description" content="Pobreza e indigencia en la Argentina para consultar, filtrar y descargar: los 31 aglomerados urbanos de la EPH del INDEC y estimaciones por partido del Gran Buenos Aires y comuna de CABA.">`,
  header: `<nav class="cabecera"><a href="../pobreza.html" class="volver">Datina: Pobreza y hogares</a><a href="./">Consultor</a><a href="./diccionario">Diccionario de datos</a></nav>`,
  footer: `Elaboración de Datina con datos del INDEC: Encuesta Permanente de Hogares y Censo 2022. Las cifras por partido, comuna y fracción son estimaciones estadísticas, no mediciones oficiales.`
};
