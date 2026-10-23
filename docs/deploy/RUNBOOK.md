# Cómo publicar, verificar y volver atrás

Desde el 23 de octubre de 2026 el sitio se publica en Cloudflare Pages (decisión del autor). Los pasos con detalle, en `CLOUDFLARE.md`. Cambios de servidor, DNS, cortafuegos, secretos o producción: siempre con revisión del autor, nunca desde un agente.

## Publicar

1. El cambio llega a `main` (un PR aprobado o la actualización mensual).
2. Cloudflare Pages publica `sitio/` sola cuando el repositorio está conectado (`CLOUDFLARE.md`, "Conectar").
3. Anotar en `CHANGELOG_DEPLOY.md`: fecha, commit, resultado de la verificación.

## Verificar

1. Lo de `CLOUDFLARE.md`, "Verificar": las páginas principales en computadora y en celular, una dirección que no existe y la caché de un archivo con huella.
2. Correr la prueba de páginas sobre el `sitio/` del commit publicado: `node scripts/prueba_paginas.mjs` (revisa las 51 páginas con plantilla).

## Volver atrás

- En Cloudflare: "Deployments", elegir la publicación anterior y "Rollback to this deployment". No cambia el repositorio.
- En el repositorio: revertir el commit con el problema y dejar que se publique de nuevo.
- Probado: pendiente hasta la primera publicación.
