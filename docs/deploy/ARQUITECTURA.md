# Arquitectura de publicación (D7-01 y D7-02)

Inventario y decisión del 10 de octubre de 2026, en solo lectura. No se instaló nada, no se creó ningún `Dockerfile` ni se tocó ningún servidor, DNS o secreto: esos pasos (D7-03 a D7-06) necesitan al autor (cuenta de DigitalOcean, dominio y acceso) y revisión humana, como pide el plan.

## Qué se publica (D7-01)

| Pieza | Qué es | Dónde se arma |
|---|---|---|
| `sitio/` | El sitio entero: 371 archivos, 110 MB. HTML por sección, `datina.css`, `datina.js`, `relaciones.*`, `datos/` (JSON, CSV, banderas, geometrías) | `scripts/03_construir_sitio.py`, sobre los datos de `02_procesar.py` |
| `sitio/pobreza/` | El consultor de pobreza (Observable Framework con DuckDB en el navegador). Dos archivos `.wasm` de DuckDB pesan 40 y 36 MB | `npm run build` en `pobreza/`, copiado por 03 |
| `netlify.toml` | Publica `sitio/` y fija la caché de un año para los archivos con huella (`?v=`) | A mano |
| Formulario de contacto | `contacto.html` con `data-netlify="true"`: lo recibe Netlify Forms | Plantilla |
| `404.html` | Página para direcciones que no existen (Netlify la sirve sola) | 03 |

- No hay servidor de aplicación, base de datos ni API propia: todo lo que calcula el sitio corre en el navegador (D3, DuckDB WASM).
- La actualización mensual corre en GitHub Actions (`.github/workflows/actualizar.yml`): baja las fuentes, procesa, prueba, arma y guarda en el repositorio. El servidor de publicación solo sirve archivos.
- Lo único que depende de la plataforma es el formulario de contacto (Netlify Forms) y la página 404 automática.
- Secretos: ninguno en el sitio ni en el repositorio. La actualización usa solo el `GITHUB_TOKEN` de GitHub Actions.
- Variables de entorno de producción: ninguna.
- Datos persistentes en el servidor: ninguno. Todo se reconstruye desde el repositorio, así que no hace falta copia de seguridad en el servidor (los mensajes del formulario quedan en Netlify).
- Publicación correcta: las 47 páginas responden, `node scripts/prueba_paginas.mjs` sin problemas contra la dirección publicada, los archivos con huella con la caché larga y el formulario recibe un mensaje de prueba.
- Volver atrás: publicar el commit anterior (en Netlify, "Publish deploy" de un despliegue previo; en cualquier otra opción, volver a publicar `sitio/` de ese commit).

## Decisión: publicación estática (D7-02)

Comparación de las opciones:

| Opción | Complejidad de operación | Persistencia | Despliegue | Volver atrás | Cuándo elegirla |
|---|---|---|---|---|---|
| Netlify (ya configurado) | Mínima: sin servidor que mantener | Ninguna necesaria; Forms guarda los mensajes | Automático con cada commit, cuando el repositorio esté conectado | Un clic sobre un despliegue anterior | Ahora: es lo que el sitio ya espera |
| DigitalOcean App Platform, sitio estático | Baja: sin servidor propio | Ninguna. El formulario necesita otro servicio (Netlify Forms no existe ahí) | Desde GitHub, carpeta `sitio` sin comando de construcción | Volver a un despliegue anterior desde el panel | Si el autor quiere todo en DigitalOcean sin administrar un servidor |
| Droplet con Caddy o nginx (sin Docker) | Media: sistema operativo, actualizaciones de seguridad, certificados (Caddy los renueva solo) y cortafuegos a cargo del autor | Ninguna | `rsync` de `sitio/` o un `git pull` en el servidor | Volver a copiar `sitio/` de un commit anterior | Si hace falta control total del servidor |
| Droplet con Dokploy | Alta: Docker, Docker Swarm y el panel de Dokploy, más todo lo del Droplet | Volúmenes de Docker si un servicio los necesita | Imagen o `compose.yaml` desde el repositorio | Volver a una imagen anterior | Solo cuando haya un servicio que necesite contenedor |

Recomendación: seguir con la publicación estática. Hoy ningún componente necesita un contenedor ni un servidor de aplicación: no hay backend, API, base de datos ni tareas programadas en el servidor (la actualización corre en GitHub Actions). Docker y Dokploy sumarían un servidor que mantener sin resolver nada que el sitio necesite.

- Si el autor prefiere DigitalOcean, la opción más simple es App Platform como sitio estático. Antes de mudarse hay que reemplazar el formulario de contacto (por ejemplo, un servicio de formularios o un enlace de correo) y reescribir en su formato las reglas de caché de `netlify.toml`.
- Dokploy tendría sentido si el Explorador u otra parte del sitio suma un servicio propio: una API, consultas en el servidor (por ejemplo DuckDB del lado del servidor), un asistente o tareas programadas que no puedan correr en GitHub Actions. En ese caso, cada servicio llevaría su contenedor y el sitio estático podría seguir aparte.

Sobre el nombre: el plan decía "Docploy". El nombre correcto es Dokploy, una plataforma propia de código abierto (licencia Apache 2.0) para desplegar aplicaciones y bases de datos con Docker y Docker Swarm en un servidor propio. Se instala con un programa de su sitio y se administra desde un panel web (verificado el 10 de octubre de 2026 en su sitio y en guías de terceros). No se copió su comando de instalación al repositorio: si se usa, seguir su documentación oficial vigente.

## Diagrama

```
GitHub (repositorio)
  ├─ GitHub Actions, día 5: 01 descarga → 02 procesa → pruebas → 03 arma → prueba de páginas → commit
  └─ commit en main ──► Netlify publica sitio/ (HTTPS, caché, Forms, 404)
                          └─ navegador: HTML + datina.js + D3 (cdnjs) + DuckDB WASM (pobreza)
```

## Pasos que quedan para el autor

1. Elegir dónde publicar (recomendado: Netlify, ya configurado).
2. Conectar el repositorio a la plataforma elegida (carpeta `sitio`, sin comando de construcción) y el dominio.
3. Activar el formulario (Netlify Forms) y mandar un mensaje de prueba.
4. Correr la prueba de páginas contra la dirección publicada y anotar la versión en `docs/deploy/CHANGELOG_DEPLOY.md`.

Fuentes sobre Dokploy: [dokploy.com](https://dokploy.com/self-hosted-paas), [guía de Vultr](https://docs.vultr.com/how-to-deploy-dokploy-self-hosted-paas-for-docker-applications).
