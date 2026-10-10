# Datina Lab: plan del Explorador de relaciones

> Plan que pasó el autor el 10 de octubre de 2026 ("sigue el plan"), copiado sin cambios de contenido. Nota de la sesión: las ramas de trabajo las fija el entorno de Claude Code (en esta sesión, `claude/awesome-cannon-dkbl1m` en lugar de `feat/datina-lab-graph`). Estado y próxima tarea: `ESTADO.md`.


## Objetivo

Evolucionar Datina por etapas, sin reescribir el sitio ni introducir una infraestructura nueva antes de justificarla. La primera mejora inspirada en Helix Foundry será un **explorador de relaciones entre fuentes, conjuntos de datos e indicadores**, con vistas de grafo y tabla, búsqueda, filtros y un panel de detalle. Se preservan la identidad editorial argentina, la metodología y los enlaces a las fuentes.

## Principios no negociables

1. Un cambio funcional por tarea y por rama/commit.
2. No rehacer todo `datina.js`, `datina.css` ni `scripts/03_construir_sitio.py` en una sola tarea.
3. No migrar a React, Next, Tailwind, una base de datos de grafos ni otra arquitectura salvo que una prueba técnica demuestre que hace falta.
4. Reutilizar primero D3 y los procesos de datos que ya existen.
5. El grafo muestra relaciones documentadas, no causalidad inferida. Cada tipo de arista debe tener una definición.
6. Toda vista de grafo tiene una alternativa accesible en tabla/lista.
7. Ningún resultado se considera listo hasta ejecutar las comprobaciones pertinentes y revisar la página en escritorio y móvil.
8. Claude explica el cambio en lenguaje simple y no toca datos crudos ni ejecuta descargas masivas sin aprobación.

---

## Fase 0 — Preparar Claude Code para que no consuma contexto innecesariamente

### 0.1 Antes de editar

- Crear una rama: `feat/datina-lab-graph`.
- Revisar `git status` y no sobrescribir trabajo local.
- Registrar la línea de base de los comandos existentes para construir y verificar el sitio.
- No ejecutar el pipeline de descarga (`scripts/01_descargar.py`) para cambios visuales.

### 0.2 Reducir y ordenar las instrucciones

El `CLAUDE.md` actual contiene mucho historial de etapas ya terminadas. Convertirlo en una guía de entrada breve, de unas 100–150 líneas como máximo, con solo:

- descripción y propósito de Datina;
- mapa de archivos y pipeline;
- reglas de preservación de datos;
- comandos de construcción y prueba;
- principios de accesibilidad y visualización;
- instrucción de consultar el estado vigente del plan.

Mover el resto a archivos temáticos sin cargarlos siempre:

```text
CLAUDE.md                         # instrucciones permanentes y breves
.claude/
  agents/
    auditor-repo.md               # lectura, sin editar
    revisor-datos.md              # lectura, sin editar
    revisor-visual-a11y.md        # lectura, sin editar
  rules/
    pipeline-datos.md             # reglas para scripts/datos
    visualizaciones.md            # reglas para gráficos e interfaz
    pruebas.md                    # comprobaciones por tipo de cambio
docs/
  roadmap/
    DATINA_LAB.md                 # fases y alcance
    ESTADO.md                     # qué se hizo y cuál es la próxima tarea
    DECISIONES.md                 # decisiones aprobadas y motivos
    CRITERIOS_ACEPTACION.md       # definición de terminado
  historico/
    etapas-previas.md             # registro histórico trasladado desde CLAUDE.md
```

No borrar el historial: moverlo y revisar que `CLAUDE.md` deje de exigir leer todo el historial en cada sesión. En cada sesión consultar `docs/roadmap/ESTADO.md` y solamente el documento relacionado con la tarea actual.

### 0.3 Regla de token para cada tarea

Cada tarea debe caber en un encargo corto con cinco componentes: objetivo, archivos autorizados, archivos prohibidos, criterios de aceptación y comandos de prueba. El informe final de Claude debe ser breve:

- archivos modificados;
- qué cambió;
- pruebas ejecutadas y resultado;
- riesgos o pendientes;
- siguiente tarea sugerida.

Usar `/clear` entre fases distintas. Usar `/compact` solo si la tarea debe continuar en la misma sesión y pedir que conserve archivos afectados, decisiones aprobadas, errores de pruebas y trabajo pendiente. Usar `/context` y `/usage` para inspeccionar consumo. No pedir a los agentes que devuelvan una explicación larga del código.

---

## Roles de agentes

No arrancar con un equipo de agentes autónomos editando a la vez. Usar subagentes especializados como asistentes de lectura y revisión; la sesión principal coordina y es la única que implementa en cada tarea.

### 1. `auditor-repo` — exploración técnica

- Permisos: lectura/búsqueda solamente.
- Trabajo: identificar los puntos de entrada, dependencias existentes, cómo se generan los datos y las páginas, comandos de prueba y zonas delicadas.
- Salida máxima: 15 hallazgos, cada uno con ruta de archivo y líneas/símbolos pertinentes.
- No modifica archivos ni propone una migración general.

### 2. `revisor-datos` — semántica y procedencia

- Permisos: lectura/búsqueda solamente.
- Trabajo: revisar los metadatos disponibles para indicadores y fuentes; proponer un modelo mínimo de nodos y relaciones; detectar dónde no se puede afirmar que existe una relación.
- Salida: tabla de tipos de entidad, relación, evidencia y campos requeridos.
- No calcula ni inventa enlaces que no estén respaldados por la documentación o el pipeline.

### 3. `revisor-visual-a11y` — visualización y accesibilidad

- Permisos: lectura/búsqueda solamente.
- Trabajo: evaluar el prototipo contra criterios de claridad, teclado, contraste, movimiento reducido, móvil y alternativa tabular.
- Salida: lista priorizada P0/P1/P2, con ubicación y pasos para reproducir.
- No modifica CSS, JS ni HTML.

### 4. Sesión principal — implementación

Implementa una sola tarea por vez, lee solo los archivos necesarios, ejecuta pruebas, presenta el diff y actualiza `ESTADO.md`. No inicia otra tarea de código hasta que la anterior esté verificada.

---

## Fases del producto

### Fase 1 — Auditoría y línea de base (solo lectura)

**Objetivo:** entender la arquitectura real antes de tocar código.

Inspeccionar de forma acotada:

- `CLAUDE.md` y pipeline descrito allí;
- `scripts/03_construir_sitio.py`;
- `scripts/02_procesar.py` y el esquema de `sitio/datos/fichas.json`;
- cómo se cargan D3 y las fichas desde `sitio/datina.js`;
- las variables/componentes relevantes de `sitio/datina.css`;
- qué existe dentro de `pobreza/` (Observable Framework + DuckDB en navegador), sin asumir que debe absorber el nuevo producto.

**Entregable:** `docs/roadmap/INVENTARIO.md`, con mapa de dependencias, riesgos y comandos de validación. No hacer cambios de código en esta fase.

### Fase 2 — Definir el prototipo antes de programar

**Objetivo:** aprobar una única pantalla y un conjunto pequeño de datos.

Nombre provisional: **Explorador de relaciones**. No es todavía el “Datina Lab” completo ni un asistente de IA.

Diseño inspirado en Helix Foundry:

- zona principal con conmutador `Grafo | Tabla`;
- buscador y filtros por tema, fuente y tipo de entidad;
- leyenda con tipos de nodo inequívocos;
- al seleccionar un nodo, resaltar sus conexiones y abrir un panel de detalle;
- el panel muestra definición, fuente, período, cobertura territorial, unidad, metodología y enlaces existentes;
- controles para acercar/alejar, centrar y restablecer la vista;
- en móvil, priorizar búsqueda, tabla y ficha; el grafo no debe ser la única forma de explorar;
- movimiento reducido respetado y simulación que se detenga cuando el grafo se estabilice.

No copiar literalmente la paleta de Helix. Usar los tokens de Datina; asignar colores por tipo de entidad de modo consistente, sin que los colores se confundan con valores positivos/negativos.

**Alcance semántico inicial:** comenzar con tres tipos de nodos: `fuente`, `conjunto de datos` e `indicador`. Los campos `jurisdicción`, `período`, `unidad` y `cobertura` se presentan primero como metadatos del panel para evitar un grafo inmanejable. Incorporarlos como nodos solo si una prueba de uso demuestra que añaden valor.

**Relaciones permitidas en el prototipo:** `publica`, `alimenta` o `se calcula a partir de`, únicamente cuando estén documentadas. No mostrar relaciones causales, correlaciones ni equivalencias solo porque dos indicadores compartan tema.

**Entregable:** un wireframe simple y `DECISIONES.md` actualizado. Sin cambios de código.

### Fase 3 — Prueba técnica aislada

**Objetivo:** probar D3 sin alterar los gráficos actuales.

- Crear una página experimental nueva, por ejemplo `sitio/explorador.html`, y archivos específicos para su lógica y estilos. Confirmar primero el patrón correcto de nombres con el generador actual.
- Reutilizar la versión de D3 que ya usa Datina, si el inventario confirma que es compatible.
- Sembrar un conjunto pequeño y curado de prueba (aproximadamente 15–30 nodos y 20–40 relaciones), claramente identificado como muestra de prototipo si no está listo para publicar.
- Evitar editar el gran archivo `sitio/datina.js` salvo que el inventario demuestre que no existe una forma más aislada.
- Mantener el grafo separado del resto de los gráficos existentes.

**Aceptación:** abre sin errores; los nodos se distinguen por tipo; la selección actualiza el panel; búsqueda y filtros funcionan; la tabla muestra las mismas entidades; el diseño no desplaza ni rompe otras páginas.

### Fase 4 — Conectar metadatos reales

**Objetivo:** sustituir datos de prueba por un catálogo mantenible.

- Definir un archivo fuente legible y validable, preferentemente JSON o CSV en el lugar que recomiende el inventario.
- Generar el JSON de publicación dentro del pipeline existente sin duplicar definiciones a mano en HTML y JavaScript.
- Validar IDs únicos, tipos permitidos, relaciones con extremos existentes, campos mínimos y referencias a fuentes.
- Añadir pruebas de integridad que fallen si hay relaciones huérfanas o metadatos incompletos.

**Aceptación:** todas las relaciones mostradas tienen respaldo en los metadatos; no se publican nodos sin identificación o con fuentes ausentes cuando esa fuente es obligatoria.

### Fase 5 — Calidad de interacción y accesibilidad

Comprobar:

- navegación por teclado y foco visible;
- alternativa de tabla/lista equivalente al grafo;
- nombres accesibles para botones e iconos;
- contraste de texto, controles y nodos;
- zoom del navegador y pantallas de 390, 768, 1024 y 1440 px;
- movimiento reducido;
- mensajes de estado cuando no hay resultados;
- interacción táctil sin depender de hover;
- carga, rendimiento y ausencia de errores en consola.

El agente revisor entrega problemas; la sesión principal corrige por lotes pequeños y vuelve a probar.

### Fase 6 — Publicación y ampliación

Solo tras validar la prueba:

- vincular el explorador desde una ubicación clara de la navegación;
- documentar definiciones y límites del grafo;
- elegir un caso de uso adicional según evidencia de uso;
- recién entonces evaluar consultas libres, DuckDB u otras capacidades analíticas.

No implementar IA, base de grafos ni conectores nuevos durante el primer prototipo.

---

## Plantillas breves para Claude Code

### Prompt A — auditoría inicial, sin cambios

```text
Trabajá en modo de planificación y solo lectura. Objetivo: preparar la Fase 1 de docs/roadmap/DATINA_LAB.md. Inspeccioná únicamente CLAUDE.md, scripts/02_procesar.py, scripts/03_construir_sitio.py, el esquema de sitio/datos/fichas.json, los puntos de entrada pertinentes de sitio/datina.js y sitio/datina.css, y la estructura de pobreza/. No leas enteros los archivos grandes: buscá símbolos y leé rangos concretos. No edites, no descargues fuentes y no ejecutes el pipeline completo. Entregá: (1) mapa de arquitectura de hasta 15 puntos, (2) comandos de validación existentes, (3) riesgos de compatibilidad, (4) archivos mínimos para el prototipo. Cada hallazgo debe incluir una ruta. No escribas una reseña extensa.
```

### Prompt B — definir el modelo semántico

```text
Usá el subagente revisor-datos, en solo lectura. Revisá los metadatos existentes y proponé el modelo mínimo para un explorador de relaciones de Datina. Alcance: fuente, conjunto de datos e indicador como nodos; período, unidad, cobertura territorial y metodología como metadatos; relaciones solo con evidencia documentada. No edites. Devolvé una tabla con campos obligatorios/opcionales, tipos de relación permitidos, validaciones y ejemplos reales respaldados por el repositorio. Marcá explícitamente cualquier dato que no pueda verificarse.
```

### Prompt C — implementar una única tarea

```text
Implementá solo la tarea [ID Y NOMBRE] de docs/roadmap/DATINA_LAB.md. Antes de editar, leé docs/roadmap/ESTADO.md y el criterio de aceptación correspondiente; revisá el estado de Git. No amplíes el alcance ni hagas refactors ajenos. Archivos autorizados: [LISTA]. Archivos prohibidos: [LISTA]. Reutilizá la infraestructura existente; no agregues dependencias sin justificarlo. Ejecutá las pruebas indicadas. Si una prueba falla, informá la causa antes de dar la tarea por terminada. Al final, informá archivos cambiados, resultado de cada prueba, riesgos y siguiente tarea. Actualizá ESTADO.md solo después de verificar.
```

### Prompt D — revisión después de implementar

```text
Usá el subagente revisor-visual-a11y en modo de solo lectura para revisar el diff actual y la página en 390 y 1440 px. No modifiques archivos. Devolvé únicamente problemas P0/P1/P2 con archivo o elemento, impacto, cómo reproducirlo y criterio de aceptación incumplido. No incluyas elogios ni una explicación general del proyecto.
```

---

## Backlog inicial con tareas pequeñas

| ID | Tarea | Depende de | Resultado verificable |
|---|---|---|---|
| D0-01 | Registrar estado de Git y pruebas base | — | Línea de base guardada |
| D0-02 | Reducir `CLAUDE.md` y mover el historial sin perderlo | D0-01 | Instrucciones iniciales breves y documentos separados |
| D1-01 | Mapear archivos y contratos de datos | D0-02 | `INVENTARIO.md` |
| D1-02 | Definir pantalla, relaciones y campos | D1-01 | Modelo y wireframe aprobados |
| D2-01 | Crear página aislada con modo grafo/tabla de muestra | D1-02 | Prototipo sin tocar los gráficos existentes |
| D2-02 | Agregar búsqueda, filtros y panel de selección | D2-01 | Interacción completa con datos de muestra |
| D3-01 | Generar catálogo desde metadatos reales | D2-02 | Grafo alimentado por el pipeline |
| D3-02 | Incorporar validaciones de integridad | D3-01 | Pruebas para IDs y relaciones |
| D4-01 | Revisar teclado, móvil y movimiento reducido | D3-02 | Lista de defectos resuelta o documentada |
| D4-02 | Prueba de regresión del sitio completo | D4-01 | Sitio existente sin regresiones |
| D5-01 | Publicar enlace y actualizar documentación | D4-02 | Explorador listo para uso inicial |

## Definición de terminado para cada tarea

- El alcance coincide con una sola fila del backlog.
- Se entiende el diff y no hay archivos modificados accidentalmente.
- Las pruebas relevantes se ejecutaron; no basta con que Claude diga que deberían pasar.
- No hay errores nuevos en consola ni regresiones en páginas existentes.
- Los datos visibles conservan fuente, definición y período cuando corresponda.
- `ESTADO.md` indica la siguiente tarea, no un resumen narrativo de toda la sesión.

### Fase 7 — Despliegue y operación en DigitalOcean

**Objetivo:** publicar Datina de forma reproducible, con infraestructura documentada, configuración segura y un procedimiento de actualización y rollback. Esta fase empieza cuando el prototipo y el proceso de construcción estén estables; no antes.

**Plataforma propuesta:** un servidor (Droplet) en DigitalOcean y **Dokploy** para administrar despliegues de aplicaciones y servicios Dockerizados. Asumo que “Docploy” se refiere a Dokploy; confirmar el nombre y la modalidad de instalación antes de ejecutar cambios de infraestructura.

> **Decisión de arquitectura pendiente:** Datina parece tener una parte importante que puede publicarse como sitio estático. Antes de instalar Dokploy, verificar si realmente hace falta ejecutar contenedores en producción. Para un sitio estático sin backend, una publicación estática puede ser más simple, barata y fácil de mantener. Dokploy tiene más sentido si Datina Lab incorpora un backend, API, tareas programadas, servicios auxiliares o varios contenedores. No añadir infraestructura por anticipado.

#### 7.1 Inventario de despliegue

- Identificar el artefacto exacto que se publica: directorio generado, assets, JSON y páginas finales.
- Identificar comandos de build, dependencias, variables de entorno y rutas que deban persistir.
- Separar datos fuente, artefactos generados y secretos. Ningún token, contraseña, clave privada o `.env` con secretos puede entrar en Git ni en el artefacto público.
- Registrar dominio y DNS, tamaño/ubicación del servidor si se elige Droplet, almacenamiento requerido y responsable de la operación.
- Definir qué se considera una publicación correcta y cómo volver a la versión anterior.

**Entregable:** `docs/deploy/ARQUITECTURA.md`, con diagrama simple, componentes, puertos, rutas, variables necesarias y decisión justificada entre hosting estático y Docker/Dokploy.

#### 7.2 Preparar el artefacto y Docker

Solo si la decisión anterior confirma que hace falta Docker:

- Crear un `Dockerfile` mínimo y reproducible para servir el sitio o ejecutar el servicio necesario.
- Si hay más de un servicio, definir `compose.yaml` con nombres, redes y volúmenes explícitos.
- Fijar versiones de imágenes; evitar `latest` en producción cuando pueda introducir cambios no controlados.
- Ejecutar el build y la prueba del contenedor localmente antes de conectarlo al servidor.
- No incluir herramientas de desarrollo, repositorios de datos innecesarios ni credenciales en la imagen.

**Aceptación:** la imagen se construye desde un clon limpio; el contenedor arranca; el sitio responde; no depende de archivos locales fuera de lo declarado; el contenido esperado está presente.

#### 7.3 DigitalOcean y Dokploy

- Preparar el proyecto/servidor en DigitalOcean y documentar acceso administrativo seguro.
- Instalar y configurar Dokploy siguiendo su documentación oficial vigente, sin copiar comandos de instalación no verificados al repositorio.
- Configurar el proyecto de despliegue y conectar el repositorio o el mecanismo de publicación elegido.
- Configurar dominio, DNS y HTTPS; exponer solo los puertos necesarios y restringir la administración del servidor.
- Guardar secretos en la configuración segura del entorno de despliegue, no en el código, los logs ni las instrucciones de Claude.
- Configurar comprobación de salud, logs accesibles y alertas mínimas de disponibilidad.

**Aceptación:** dominio y HTTPS funcionan; los servicios necesarios están disponibles; los puertos expuestos están documentados; no hay secretos en Git ni en la imagen; los logs permiten diagnosticar fallos.

#### 7.4 Publicación segura y rollback

- Mantener entornos separados cuando el alcance lo justifique: prueba/staging y producción. Si se usa un solo servidor, documentar claramente esa limitación.
- Probar primero una publicación de staging y validar enlaces, archivos estáticos, fuentes, descargas, rutas y comportamiento móvil.
- Publicar producción con una versión identificable (commit o tag).
- Documentar cómo volver a la última versión estable y probar el procedimiento, no solo escribirlo.
- Definir copias de seguridad únicamente para datos persistentes que no puedan reconstruirse desde el repositorio o las fuentes; probar la restauración.
- Registrar fecha, versión desplegada, resultado de smoke tests y posibles incidentes en `docs/deploy/CHANGELOG_DEPLOY.md`.

**Aceptación:** una versión identificada está publicada; los smoke tests pasan; el rollback está documentado y probado; se conoce qué datos necesitan backup y cómo restaurarlos.

#### 7.5 Operación y actualización

- Documentar el flujo desde un cambio aprobado hasta producción.
- No desplegar automáticamente cambios de infraestructura o secretos desde un agente de código.
- Exigir revisión humana para cambios de Docker, configuración de servidor, DNS, firewall, persistencia, backups y producción.
- Definir un procedimiento breve para actualizar, verificar, revertir y registrar cada publicación.

**Entregables de la fase:**

```text
docs/deploy/
  ARQUITECTURA.md
  RUNBOOK.md
  CHANGELOG_DEPLOY.md
```

### Backlog de despliegue

| ID | Tarea | Depende de | Resultado verificable |
|---|---|---|---|
| D7-01 | Inventariar artefactos, comandos y dependencias de producción | Fase 4 estable | Inventario de despliegue |
| D7-02 | Decidir hosting estático frente a Docker/Dokploy | D7-01 | Decisión registrada con motivos y costos operativos |
| D7-03 | Preparar y probar el artefacto localmente | D7-02 | Build reproducible y smoke tests locales |
| D7-04 | Documentar y configurar DigitalOcean/Dokploy, si corresponde | D7-03 | Entorno accesible con dominio y HTTPS |
| D7-05 | Validar staging y publicar una versión identificada | D7-04 | Publicación comprobada y registrada |
| D7-06 | Probar rollback y documentar operación | D7-05 | `RUNBOOK.md` validado mediante prueba |

### Prompt E — auditoría de despliegue, solo lectura

```text
Trabajá en modo solo lectura. Objetivo: preparar D7-01 y D7-02 de docs/roadmap/DATINA_LAB.md. Inspeccioná cómo se construye el sitio y cuál es el artefacto publicable. No instales paquetes, no crees Dockerfile, no conectes servicios, no ejecutes comandos contra infraestructura y no leas ni muestres secretos. Determiná si el sitio puede publicarse como contenido estático o si el repositorio evidencia una necesidad real de backend/servicios Dockerizados. Compará las opciones en una tabla breve: complejidad operativa, persistencia, despliegue, rollback y motivo para elegirla. Si recomendás DigitalOcean + Dokploy, explicitá qué servicio requiere contenedor. No afirmes que “Docploy” es el nombre correcto sin verificarlo. Entregá un borrador de docs/deploy/ARQUITECTURA.md, pero no lo escribas al repositorio hasta recibir aprobación.
```
