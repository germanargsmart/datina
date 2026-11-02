# Registro de publicaciones

| Fecha | Versión (commit) | Dónde | Verificación | Incidentes |
|---|---|---|---|---|
| 26/10/2026 | `main` (e8417c4) | Cloudflare Pages, `https://datina.pages.dev`, conectado por el autor (`CLOUDFLARE.md`) | Bien: portada, Trabajo, un artículo, Tu provincia, Cruces, Catálogo, Explorador, 404 y consultor de pobreza en Chrome en 1440 y 390 píxeles, sin errores. Caché de un año de `datina.js` y `/trabajo.html` que redirige a `/trabajo` | El primer intento quedó como Worker y no publicaba: se rehízo como Pages. El Worker borrado deja un chequeo rojo, "Workers Builds: datina", que no bloquea nada |
| 26/10/2026 | `main` (331f240, PR #10) | Cloudflare Pages, `https://datina.pages.dev` | Bien: las mismas 9 páginas en 1440 y 390 píxeles sin errores, la respuesta rápida del buscador, `sitemap.xml`, `robots.txt`, los canonical sin `.html` y producción sin `noindex` | — |
| 1/11/2026 | `main` (PR #55 a #62) | Dominio propio `https://datina.com.ar` (y `www.datina.com.ar`), conectado por el autor en "Custom domains" de Cloudflare Pages | Bien: la portada, `www` y `/trabajo` responden 200 con el sitio y su candado. Al día siguiente, `"url"` pasa a `https://datina.com.ar` | El dominio no abría: NIC.ar ya apuntaba a Cloudflare, pero la zona no tenía registros hasta sumarlo en "Custom domains" |
