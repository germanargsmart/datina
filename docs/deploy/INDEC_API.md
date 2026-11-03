# API del INDEC

Desde el 2 de noviembre de 2026 (pedido del autor) la actualización mensual baja algunas tablas del Catálogo API-INDEC (`https://api.indec.gob.ar`), la API oficial del INDEC, en JSON. Lo hace `scripts/indec_api.py`, que llama `01_descargar.py`.

## Qué se baja y para qué

| Tabla de la API | Archivo en `datos/crudo/` | Para qué |
|---|---|---|
| `estimaciones_poblacion_departamento_2022_2035` | `indec_api_estimaciones_poblacion_departamento_2022_2035.json` | Población por departamento y sexo, de 2022 a 2035. El sitio no la tiene: sirve para tasas por departamento con la población de cada año |
| `canasta-crianza` | `indec_api_canasta_crianza.json` | Lo que cuesta criar a un chico, por edad, cada mes. El sitio no la tiene |
| `ipi_manufacturero` | `indec_api_ipi_manufacturero.json` | Producción industrial por rama, cada mes. El sitio no la tiene |
| `ipi_minero` | `indec_api_ipi_minero.json` | Producción minera, cada mes. El sitio no la tiene |
| `proyecciones_poblacion_jurisdiccion_2022_2040` | `indec_api_proyecciones_poblacion_jurisdiccion_2022_2040.json` | La misma fuente que el módulo de población (`POB`), para compararla con la planilla que se baja hoy |

Por ahora `02_procesar.py` no lee ninguna. Cada una entra al sitio en un cambio aparte, después de compararla con lo que ya hay: una ficha nueva con su pregunta, su origen en `datos/manual/relaciones.json` y su tabla en el catálogo, o el reemplazo de un archivo que ya se baja, solo si el resumen da igual antes y después (o cada diferencia se explica por una revisión del INDEC).

Lo demás que tiene la API (precios, salarios, canastas, actividad, comercio exterior, pobreza y empleo) ya se baja de los archivos del INDEC. En pobreza y empleo la API trae solo el total de los 31 aglomerados, y el sitio usa el detalle por aglomerado de las planillas: esas siguen.

## El token (lo hace el autor)

La API pide una cuenta gratuita y un token. Es un secreto: se guarda solo en GitHub y en la computadora, nunca en el chat ni en un archivo del repositorio.

1. Registrarse en `https://api.indec.gob.ar/register` con nombre, correo y organización, y confirmar con el código que llega por correo (puede tardar hasta 5 minutos).
2. En "Gestionar la cuenta", generar el token. Se muestra una sola vez: copiarlo en ese momento.
3. En GitHub, en el repositorio: Settings, Secrets and variables, Actions, New repository secret. Nombre `INDEC_API_TOKEN` y, como valor, el token.
4. En la computadora, para correr la descarga a mano: una variable de entorno con el mismo nombre (en Windows, "Editar las variables de entorno de esta cuenta", Nueva, `INDEC_API_TOKEN`). Hay que abrir de nuevo la terminal para que la tome.

Las preguntas frecuentes de la API dicen que el token vence a los 12 meses, pero el que se generó el 2 de noviembre de 2026 dura 6: vence el 1 de mayo de 2027 (la fecha está dentro del token, en el campo `exp`). El secreto `INDEC_API_TOKEN` lo cargó en GitHub el agente, por pedido del autor, el 2 de noviembre de 2026. Para renovarlo, generar otro en "Gestionar la cuenta" (el anterior deja de andar en ese momento) y reemplazarlo en los dos lugares.

## Cómo se ve si falta o venció

- Sin token, la actualización mensual sigue igual: no baja estas tablas, deja los archivos anteriores y el registro (`datos/crudo/_registro.csv`, fila "tablas de la API del INDEC") dice "falta el token".
- Con el token vencido, la misma fila dice que la API no lo aceptó y que puede estar vencido.
- `python scripts/01_descargar.py --solo indec_api_canasta_crianza.json` baja una sola tabla y, sin token, termina con error.

## Cómo funciona

Cada tabla se pide de a 1000 filas, el máximo de la API, ordenada por su clave completa (lo pide la documentación para que las páginas no repitan ni salteen filas), y lo recibido se compara con el total que informa la API. Si la API dice que se le pidió demasiado (429) o falla el servidor, espera y reintenta. Una tabla que falla no frena a las demás y conserva su archivo anterior. Para sumar una tabla: su nombre y su clave en `TABLAS` de `scripts/indec_api.py` (la clave está en `https://api.indec.gob.ar/docs`, en el parámetro `order` de cada una).

Prueba, sin red ni token: `python scripts/prueba_indec_api.py` (una API simulada con páginas, totales, 401, 429 y 500). La corre cada PR.

Al usar los datos hay que citar "Fuente: INDEC" y el servicio de datos consultado (preguntas frecuentes de la API).
