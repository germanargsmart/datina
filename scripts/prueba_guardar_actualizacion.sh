#!/usr/bin/env bash
# Prueba de scripts/guardar_actualizacion.sh, el último paso de la actualización mensual (5 de noviembre de 2026). Arma repositorios de
# juguete en una carpeta temporal (un remoto, la copia de la actualización y otra que sube cambios mientras "corre"), con programas 02,
# pruebas, 03 y prueba de páginas falsos, y controla cinco casos:
#   1. sin cambios: no sube nada
#   2. la rama no cambió: sube la corrida tal cual
#   3. la rama cambió en las mismas páginas, como el PR #95 en la corrida 34: arma de nuevo con el código nuevo y los datos bajados, deja
#      lo que la rama nueva cambió en datos/crudo y no bajó la corrida, suma su fila nueva del registro y borra lo que la corrida borró
#   4. la rama cambió y el armado sobre ella falla: no sube nada
#   5. la rama cambió solo en la documentación: arma igual y sube
# No usa la red ni toca este repositorio. Uso: bash scripts/prueba_guardar_actualizacion.sh
set -euo pipefail
PROGRAMA="$(cd "$(dirname "$0")" && pwd)/guardar_actualizacion.sh"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
fallas=0
bien() { echo "  bien: $1"; }
mal() { echo "  MAL: $1"; fallas=$((fallas + 1)); }
igual() { if [ "$2" = "$3" ]; then bien "$1"; else mal "$1 (esperado: $(printf %q "$3"), hay: $(printf %q "$2"))"; fi; }

# pip falso: la máquina de GitHub instala de verdad, acá solo se anota
mkdir -p "$TMP/bin"
printf '#!/bin/sh\necho pip >> "%s/pip.log"\n' "$TMP" > "$TMP/bin/pip"
chmod +x "$TMP/bin/pip"
export PATH="$TMP/bin:$PATH"
# sin la configuración de git de la computadora, para que la prueba dé lo mismo en cualquiera
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1
export GIT_AUTHOR_NAME=prueba GIT_AUTHOR_EMAIL=prueba@example.com GIT_COMMITTER_NAME=prueba GIT_COMMITTER_EMAIL=prueba@example.com

# un repositorio de juguete: 02 arma sitio/pagina.html con la versión del código y el dato bajado, y las pruebas fallan si el dato es "malo"
nuevo_remoto() {
  rm -rf "$TMP/remoto.git" "$TMP/inicio" "$TMP/corrida" "$TMP/otro" "$TMP/pip.log"
  git init -q --bare -b main "$TMP/remoto.git"
  git init -q -b main "$TMP/inicio"
  cd "$TMP/inicio"
  git remote add origin "$TMP/remoto.git"
  mkdir -p scripts datos/crudo sitio
  echo 1 > scripts/version.txt
  cat > scripts/02_procesar.py <<'PY'
from pathlib import Path
v = Path("scripts/version.txt").read_text().strip()
d = Path("datos/crudo/dato.txt").read_text().strip()
Path("sitio/pagina.html").write_text(f"version {v}\ndato {d}\n")
PY
  cat > scripts/pruebas_datos.py <<'PY'
import sys
from pathlib import Path
sys.exit(1 if Path("datos/crudo/dato.txt").read_text().strip() == "malo" else 0)
PY
  echo 'print("03")' > scripts/03_construir_sitio.py
  echo 'console.log("prueba de páginas")' > scripts/prueba_paginas.mjs
  : > requirements.txt
  echo viejo > datos/crudo/dato.txt
  echo otro > datos/crudo/otro.txt
  echo viejo > datos/crudo/viejo.txt
  printf 'archivo,url,descargado,estado\r\ndato,u1,2026-10-05,ok\r\notro,u2,2026-10-05,ok\r\n' > datos/crudo/_registro.csv
  mkdir -p docs && echo doc > docs/ESTADO.md
  python scripts/02_procesar.py
  git add -A && git commit -q -m inicio && git push -q origin main
  git clone -q "$TMP/remoto.git" "$TMP/corrida"
  git clone -q "$TMP/remoto.git" "$TMP/otro"
}
# lo que hace la actualización antes de guardar: 01 baja el dato nuevo, cambia el registro y borra viejo.txt, y 02 arma el sitio
correr() {
  cd "$TMP/corrida"
  echo "$1" > datos/crudo/dato.txt
  rm datos/crudo/viejo.txt
  printf 'archivo,url,descargado,estado\r\ndato,u1,2026-11-05,ok\r\notro,u2,2026-11-05,error: no contesta\r\n' > datos/crudo/_registro.csv
  python scripts/02_procesar.py
}
# lo que se une a la rama mientras corre: el código nuevo con su sitio/ armado (con el dato viejo), una fuente nueva bajada con --solo y
# otro.txt bajado de nuevo
unir_mientras_corre() {
  cd "$TMP/otro"
  echo 2 > scripts/version.txt
  python scripts/02_procesar.py
  echo nueva > datos/crudo/nueva.txt
  echo "otro actualizado" > datos/crudo/otro.txt
  printf 'archivo,url,descargado,estado\r\ndato,u1,2026-10-05,ok\r\notro,u2,2026-11-05,ok\r\nnueva,u3,2026-11-05,ok\r\n' > datos/crudo/_registro.csv
  git add -A && git commit -q -m "PR unido mientras corre" && git push -q origin main
}
guardar() { (cd "$TMP/corrida" && GITHUB_REF_NAME=main bash "$PROGRAMA" > "$TMP/salida.log" 2>&1); }
en_remoto() { git --git-dir="$TMP/remoto.git" show "main:$1" 2>/dev/null || echo "(no está)"; }

echo "1. sin cambios"
nuevo_remoto
antes=$(git --git-dir="$TMP/remoto.git" rev-parse main)
if guardar; then bien "termina bien"; else mal "terminó con error"; fi
igual "no sube nada" "$(git --git-dir="$TMP/remoto.git" rev-parse main)" "$antes"

echo "2. la rama no cambió"
nuevo_remoto
antes=$(git --git-dir="$TMP/remoto.git" rev-parse main)
correr nuevo
if guardar; then bien "termina bien"; else mal "terminó con error"; fi
igual "sube un commit sobre la rama" "$(git --git-dir="$TMP/remoto.git" rev-parse main~1)" "$antes"
igual "la página con el dato nuevo" "$(en_remoto sitio/pagina.html)" "$(printf 'version 1\ndato nuevo')"
igual "sin armar de nuevo" "$([ -f "$TMP/pip.log" ] && echo armó || echo no)" "no"

echo "3. la rama cambió en las mismas páginas (como el PR #95 en la corrida 34)"
nuevo_remoto
correr nuevo
unir_mientras_corre
unido=$(git --git-dir="$TMP/remoto.git" rev-parse main)
if guardar; then bien "termina bien"; else mal "terminó con error: $(tail -3 "$TMP/salida.log")"; fi
igual "sube un commit sobre lo unido" "$(git --git-dir="$TMP/remoto.git" rev-parse main~1)" "$unido"
igual "la página con el código nuevo y el dato nuevo" "$(en_remoto sitio/pagina.html)" "$(printf 'version 2\ndato nuevo')"
igual "armó de nuevo una vez" "$(cat "$TMP/pip.log" 2>/dev/null | wc -l | tr -d ' ')" "1"
igual "queda lo que la rama bajó y la corrida no cambió" "$(en_remoto datos/crudo/otro.txt)" "otro actualizado"
igual "queda la fuente nueva" "$(en_remoto datos/crudo/nueva.txt)" "nueva"
igual "lo que la corrida borró, borrado" "$(en_remoto datos/crudo/viejo.txt)" "(no está)"
igual "el registro de la corrida, con la fila nueva al final" "$(en_remoto datos/crudo/_registro.csv | tr -d '\r')" \
  "$(printf 'archivo,url,descargado,estado\ndato,u1,2026-11-05,ok\notro,u2,2026-11-05,error: no contesta\nnueva,u3,2026-11-05,ok')"
igual "el registro sigue con los finales de línea de 01" "$(en_remoto datos/crudo/_registro.csv | head -1 | od -An -c | tr -d ' \n' | tail -c 4)" '\r\n'

echo "4. la rama cambió y el armado sobre ella falla"
nuevo_remoto
correr nuevo
cd "$TMP/otro"
echo 'import sys; sys.exit(1)' > scripts/pruebas_datos.py
git add -A && git commit -q -m "pruebas que fallan con el dato nuevo" && git push -q origin main
unido=$(git --git-dir="$TMP/remoto.git" rev-parse main)
if guardar; then mal "terminó bien y no debía"; else bien "termina con error"; fi
igual "no sube nada" "$(git --git-dir="$TMP/remoto.git" rev-parse main)" "$unido"

echo "5. la rama cambió solo en la documentación"
nuevo_remoto
correr nuevo
cd "$TMP/otro"
echo "doc nueva" > docs/ESTADO.md
git add -A && git commit -q -m "solo documentación" && git push -q origin main
unido=$(git --git-dir="$TMP/remoto.git" rev-parse main)
if guardar; then bien "termina bien"; else mal "terminó con error"; fi
igual "sube un commit sobre lo unido" "$(git --git-dir="$TMP/remoto.git" rev-parse main~1)" "$unido"
igual "queda la documentación nueva" "$(en_remoto docs/ESTADO.md)" "doc nueva"
igual "la página con el dato nuevo" "$(en_remoto sitio/pagina.html)" "$(printf 'version 1\ndato nuevo')"

echo
if [ "$fallas" = 0 ]; then echo "Todo en orden."; else echo "$fallas controles fallaron."; exit 1; fi
