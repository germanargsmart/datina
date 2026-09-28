# Datina

Números de las 24 Argentinas.

Estadísticas públicas de la Argentina con contexto, fuente y tabla descargable.

## Cómo seguir en Claude Code (sin programar)

1. Descomprimí esta carpeta en tu computadora, por ejemplo en `Documentos/argentina-en-datos`.
2. Abrí Claude Code (en la app de escritorio, pestaña Code) y elegí esa carpeta como carpeta de trabajo.
3. Pegá este primer mensaje:

   > Leé CLAUDE.md y README.md. Instalá lo necesario, corré los tres scripts de la carpeta scripts en orden, abrí el sitio localmente y confirmame que las diez fichas se ven bien. Después proponeme las dos próximas fichas.

Claude Code ya tiene en `CLAUDE.md` todo el contexto: estructura, reglas de redacción, diseño, cuidados con el tema suicidio y problemas conocidos de las fuentes.

## Actualizar los datos a mano

Pedile a Claude Code: "corré los tres scripts y decime qué cifras cambiaron".

## Publicar

Opción rápida: arrastrá la carpeta `sitio` (no el zip) a app.netlify.com/drop.

Opción automática: pedile a Claude Code que suba el proyecto a un repositorio de GitHub y que lo conecte con Netlify. A partir de ahí los datos se actualizan solos el día 5 de cada mes y el sitio se republica sin intervención.

## Fuentes

Secretaría de Energía, INDEC, RENAPER, SNIC (Ministerio de Seguridad), SIPA (Subsecretaría de Programación Macroeconómica), DEIS (Ministerio de Salud), SUBE (Ministerio de Transporte), Ministerio de Educación (Aprender y Relevamiento Anual) y OCDE (PISA, vía Our World in Data). Registro de cada descarga en `datos/crudo/_registro.csv`.
