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
  head: `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght@8..144,300..700&display=swap">
<script>
// Framework reescribe los enlaces que salen de este sitio: el de Datina se corrige al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  const a = document.querySelector(".cabecera .volver");
  if (a) a.href = new URL("../", location.href.replace(/[^/]*$/, "")).href;
});
</script>
<meta name="description" content="Datos abiertos y consultables de pobreza e indigencia en la Argentina: 31 aglomerados urbanos (INDEC, EPH) y estimaciones por partido del GBA y comuna de la Ciudad, primer semestre de 2026.">`,
  header: `<nav class="cabecera"><a href="../" class="volver">Datina</a><a href="./">Consultas</a><a href="./diccionario">Diccionario de datos</a></nav>`,
  footer: `Elaboración propia sobre INDEC: Encuesta Permanente de Hogares y Censo 2022. Las cifras por partido, comuna y fracción son estimaciones estadísticas, no mediciones oficiales.`
};
