# Criterios de aceptación

## Definición de terminado (toda tarea)

- El alcance coincide con una sola fila del backlog de `DATINA_LAB.md`.
- El diff se entiende y no hay archivos modificados por accidente (ni páginas de `sitio/` reescritas solo por los finales de línea).
- Las pruebas que corresponden (`.claude/rules/pruebas.md`) se ejecutaron y se informa el resultado real.
- No hay errores nuevos en la consola ni cambios en las páginas existentes que la tarea no buscaba.
- Los datos visibles conservan fuente, definición y período.
- `ESTADO.md` dice cuál es la siguiente tarea, sin un resumen narrativo de la sesión.

## Explorador de relaciones

### Modelo (D1-02, D3-01, D3-02)

- Solo tres tipos de nodo: `fuente`, `conjunto` e `indicador`. Período, unidad, cobertura territorial y metodología van como datos del panel.
- Solo tres relaciones: `publica` (fuente a conjunto), `alimenta` (conjunto a indicador) y `se calcula a partir de` (indicador a indicador). Cada arista tiene su evidencia (archivo y línea del código o del dato).
- Nunca relaciones causales, correlaciones ni equivalencias por compartir tema.
- Validaciones que frenan el armado: ids únicos, tipos permitidos, la relación respeta los tipos de sus extremos, ninguna arista huérfana, todo conjunto tiene una fuente, todo indicador tiene al menos un conjunto o un indicador de origen, y toda fuente escrita en el sitio se resuelve a una fuente del catálogo.

### Página (D2-01, D2-02, D4-01)

- Abre sin errores en la consola y no cambia ninguna otra página.
- Los nodos se distinguen por tipo con forma y color, con una leyenda. Los colores salen de los valores de `datina.css` y no se confunden con el verde y el rojo de bueno y malo ni con el violeta de la OCDE.
- Conmutador Grafo | Tabla. La tabla muestra las mismas entidades y relaciones que el grafo.
- Buscador y filtros por tipo, tema y fuente. Un mensaje cuando no hay resultados.
- Elegir un nodo resalta sus conexiones y abre el panel: definición, fuente, período, cobertura, unidad, método y enlaces a la ficha, el CSV y la fuente.
- Acercar, alejar, centrar y restablecer la vista, con botones con nombre accesible.
- En el celular se prioriza buscar, la tabla y el panel: el grafo no es la única forma de explorar.
- Teclado completo y foco visible. Escape cierra el panel. Nada depende solo del mouse.
- Con movimiento reducido no hay simulación animada. La simulación se detiene cuando el grafo se estabiliza.
- Revisada en 390, 768, 1024 y 1440 píxeles.
