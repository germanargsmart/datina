# Cómo publicar, verificar y volver atrás

Procedimiento para la publicación estática recomendada en `ARQUITECTURA.md`. Cambios de servidor, DNS, cortafuegos, secretos o producción: siempre con revisión del autor, nunca desde un agente.

## Publicar

1. El cambio llega a `main` (un PR aprobado o la actualización mensual).
2. Netlify publica `sitio/` sola cuando el repositorio está conectado.
3. Anotar en `CHANGELOG_DEPLOY.md`: fecha, commit, resultado de la verificación.

## Verificar

1. Abrir la portada, una sección, un artículo, `relaciones.html` y `contacto.html` en computadora y en celular.
2. Correr la prueba de páginas contra lo publicado: copiar `sitio/` del commit publicado y correr `node scripts/prueba_paginas.mjs` (revisa las 47 páginas).
3. Revisar que un archivo con huella (`datina.js?v=...`) responda con `Cache-Control: public, max-age=31536000, immutable`.

## Volver atrás

- En Netlify: "Deploys", elegir el despliegue anterior y "Publish deploy". No cambia el repositorio.
- En el repositorio: `git revert` del commit con el problema y dejar que se publique de nuevo.
- Probado: pendiente hasta que el sitio esté publicado (D7-06 necesita la cuenta del autor).
