# Publicar Datina con GitHub Pages

Exploración del 11 de octubre de 2026, a pedido del autor ("explorá la forma de hacer la página por githubpages"). No se activó nada: los cambios de infraestructura necesitan la revisión del autor (`CLAUDE.md`, "Publicación").

## Resumen

Se puede. El repositorio es público, así que GitHub Pages es gratis, y `sitio/` es un sitio estático que entra holgado en los límites. Hacen falta cuatro ajustes, y dos de ellos son decisiones del autor: qué hacer con los formularios y si se usa un dominio propio.

Dirección que tendría: `https://germanargsmart.github.io/datina/` (o un dominio propio, si se configura).

## Lo que ya sirve

| Requisito | Datina hoy | Límite de GitHub Pages |
|---|---|---|
| Sitio estático | Sí: `sitio/` es HTML, CSS, JS y datos | Solo estático |
| Peso publicado | 111 MB (88 MB son el consultor de pobreza) | 1 GB |
| Archivo más grande | 40,6 MB (`duckdb-mvp.wasm`) | 100 MB por archivo en el repositorio |
| Rutas | Relativas (`trabajo.html`, `datos/...`, `./_npm/...`) | Funcionan dentro de `/datina/` |
| Repositorio | Público | Gratis para repositorios públicos |
| Tráfico | Sin medir | 100 GB por mes (límite blando) |

Fuente de los límites: [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

## Lo que hay que ajustar

1. **Publicar con GitHub Actions y no desde una carpeta.** Pages solo publica desde la raíz o desde `docs/` de una rama, y Datina publica `sitio/`. Además el consultor de pobreza tiene carpetas que empiezan con guion bajo (`_npm`, `_file`, `_observablehq`) que el modo clásico (Jekyll) esconde. Con un flujo de Actions que sube `sitio/` tal cual, las dos cosas se resuelven. El flujo propuesto está abajo.

2. **La página 404.** El constructor le pone `<base href="/">` (`scripts/03_construir_sitio.py`, línea 741) para que funcione en cualquier dirección que no existe. En `germanargsmart.github.io/datina/` esa base apunta a la raíz de `github.io` y la 404 queda sin estilos ni enlaces. Arreglo: que el constructor tome la base de una variable (`DATINA_BASE`, por defecto `/`) y que el flujo de Pages arme con `DATINA_BASE=/datina/`. Con un dominio propio la base vuelve a ser `/` y no hace falta nada.

3. **Los formularios (Contacto y la suscripción del pie).** Hoy usan Netlify Forms. En Pages no hay servidor que reciba el envío: el navegador recibe un error 405. Opciones, a decidir por el autor porque implican una cuenta de un tercero que guarda correos de personas:
   - Formspree o un servicio parecido para los dos formularios (plan gratis con límite de envíos por mes).
   - Un servicio de boletín para la suscripción (Buttondown, por ejemplo) y un correo de contacto visible.
   - Un formulario de Google enlazado.
   Hasta que se decida, en Pages conviene esconder los dos formularios y mostrar un correo de contacto.

4. **Los encabezados de caché.** `netlify.toml` le dice al navegador que guarde un año `datina.js`, `datina.css` y los datos con huella. Pages no lee ese archivo y usa 10 minutos para todo. El sitio funciona igual (las huellas `?v=` cambian la dirección cuando cambia el archivo). Solo se pierde la caché larga en las visitas repetidas.

## Diferencias con Netlify

| | GitHub Pages | Netlify |
|---|---|---|
| Costo | Gratis (repositorio público) | Gratis (plan inicial) |
| Formularios | No tiene | Sí (Netlify Forms, ya en el marcado) |
| Encabezados propios | No | Sí (`netlify.toml`) |
| Vista previa por rama | No: publica una sola versión, la de `main` | Sí: un enlace por rama y por pedido de cambio |
| Dominio propio y HTTPS | Sí | Sí |
| Dónde se configura | En el mismo repositorio (Settings → Pages) | Cuenta aparte |

Para ver una rama antes de unirla, como esta, Pages no alcanza: publica solo `main`. Netlify sí da un enlace por rama.

## Flujo propuesto (no está activo)

Iría en `.github/workflows/pages.yml`. Publica cada vez que cambia `main`, incluida la actualización automática del día 5 (que hace un `git push` a `main`).

```yaml
# Publica sitio/ en GitHub Pages cada vez que cambia main
name: Publicar en GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  publicar:
    runs-on: ubuntu-24.04
    environment:
      name: github-pages
      url: ${{ steps.publicacion.outputs.page_url }}
    steps:
      - uses: actions/checkout@v7
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: sitio
      - id: publicacion
        uses: actions/deploy-pages@v4
```

Antes de crearlo hay que confirmar las versiones vigentes de las acciones de Pages. Tiene una salvedad: un `git push` hecho con el `GITHUB_TOKEN` de otro flujo no dispara flujos nuevos, así que la actualización del día 5 no lo activaría sola. Se resuelve sumando `workflow_run` sobre "Actualizar datos" al `on:` o publicando desde el mismo `actualizar.yml`.

## Pasos, si el autor aprueba

1. Decidir los formularios (punto 3) y si habrá dominio propio.
2. Sumar `DATINA_BASE` al constructor y el flujo `pages.yml` (un commit cada uno, con la revisión del autor).
3. El autor activa Pages en GitHub: Settings → Pages → Source: "GitHub Actions".
4. Unir la rama a `main`. El flujo publica y deja el enlace en la pestaña Actions.
5. Probar: portada, una sección, una ficha con gráfico, el consultor de pobreza (consulta y descarga), la 404 y el buscador.
