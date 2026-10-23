# Publicar Datina en Cloudflare Pages

Decisión del autor del 23 de octubre de 2026: el sitio se publica en Cloudflare Pages, sin dominio propio por ahora y sin formularios (el de Contacto y la suscripción quedan ocultos hasta elegir quién los recibe). Conectar la cuenta, el repositorio y más adelante el dominio lo hace el autor: son pasos de infraestructura que no hace un agente (`CLAUDE.md`, "Publicación").

## Qué ya está preparado en el repositorio

- `sitio/` es lo único que se publica. No hace falta armar nada en Cloudflare: el sitio ya está armado en el repositorio y la actualización mensual lo vuelve a armar en GitHub y lo sube a `main`.
- `sitio/_headers` (lo escribe `03_construir_sitio.py`): los archivos que las páginas piden con su huella (`?v=...`) se guardan un año en el navegador. Es el equivalente de los `[[headers]]` de `netlify.toml`, que queda en el repositorio sin uso.
- `sitio/404.html`: Cloudflare la muestra sola en cualquier dirección que no existe.
- Formularios: con `"formularios": ""` en `datos/manual/sitio.json`, el armado los saca. Con `"netlify"` vuelven (solo sirven en Netlify).
- Sin dominio (`"url": ""` en `datos/manual/sitio.json`): no hay `sitemap.xml`, `robots.txt` ni enlaces canónicos absolutos. Se agregan solos en el armado siguiente a completar la dirección.

## Límite que hay que tener en cuenta

Cloudflare Pages no acepta archivos de más de 25 MiB ([límites de Cloudflare Pages](https://developers.cloudflare.com/pages/platform/limits/)): si hay uno solo más grande, rechaza la publicación entera. Hasta el 23 de octubre de 2026 el consultor de pobreza traía dos archivos de DuckDB de 35,7 y 40,6 MB. Desde ese día el editor de SQL los baja de jsDelivr y ya no están en `sitio/` (ver "Consultor de pobreza", más abajo). El archivo más grande que queda en `sitio/` pesa menos de 20 MB.

## Conectar (lo hace el autor, una sola vez)

1. Antes: que `main` tenga todo (el PR #3 y el de estabilización y producción unidos) y que el consultor de pobreza ya no tenga los dos archivos grandes.
2. Entrar a <https://dash.cloudflare.com> (la cuenta gratis alcanza) y ir a "Workers & Pages", "Create", pestaña "Pages", "Connect to Git".
3. Autorizar a Cloudflare a leer GitHub y elegir el repositorio `germanargsmart/datina`.
4. Configuración del proyecto:
   - Project name: `datina` (la dirección va a ser `https://datina.pages.dev`, o con un sufijo si el nombre está tomado).
   - Production branch: `main`.
   - Framework preset: `None`.
   - Build command: vacío.
   - Build output directory: `sitio`.
   - Root directory: vacío.
   - Environment variables: `SKIP_DEPENDENCY_INSTALL` = `1`. Apaga la instalación automática de paquetes de Cloudflare, que no hace falta porque el sitio ya viene armado (sin la variable, puede intentar instalar lo de `requirements.txt` en cada publicación).
5. "Save and Deploy". La primera publicación tarda unos minutos (sube unos 420 archivos). Desde ahí, cada cambio en `main` se publica solo, también la actualización mensual del día 5.

## Verificar (después de cada publicación importante)

1. Abrir en computadora y en celular: la portada, una sección (por ejemplo, Trabajo), un artículo, Tu provincia, Cruces, el Catálogo, el Explorador de relaciones y el consultor de pobreza (la consulta guiada y abrir el editor de SQL).
2. Una dirección que no existe (`https://datina.pages.dev/a/b/c`): tiene que mostrar "Esta página no existe" con estilos y la barra.
3. La caché: en el navegador, herramientas de desarrollo, pestaña "Red", recargar la portada y mirar `datina.js?v=...`: tiene que decir `Cache-Control: public, max-age=31536000, immutable`.
4. Cloudflare saca el `.html` de las direcciones (`/trabajo.html` pasa a `/trabajo`). Los enlaces viejos siguen andando porque redirige solo.
5. Anotar en `CHANGELOG_DEPLOY.md` la fecha, el commit y el resultado.

## Volver atrás

- En Cloudflare: el proyecto, "Deployments", elegir una publicación anterior y "Rollback to this deployment". No cambia el repositorio.
- En el repositorio: revertir el commit con el problema en `main`, y Cloudflare publica de nuevo.

## Dominio propio (más adelante)

1. En el proyecto de Cloudflare Pages, "Custom domains", "Set up a custom domain", y seguir los pasos de DNS (lo hace el autor).
2. Completar `"url"` en `datos/manual/sitio.json` con la dirección (con `https://` y sin barra final) y armar el sitio: suma `sitemap.xml`, `robots.txt` y los enlaces canónicos.

## Consultor de pobreza

Ver `pobreza/README.md`. Desde el 23 de octubre de 2026 su editor de SQL baja DuckDB 1.29.0 de jsDelivr (y DuckDB baja de su servidor la extensión para leer Parquet), así que el consultor pesa 7 MB en lugar de 88 y entra en Cloudflare. Es lo único del sitio que depende de un servidor de afuera: si jsDelivr no responde, la consulta guiada anda igual y el editor de SQL no abre (muestra el error técnico).
