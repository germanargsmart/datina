#!/usr/bin/env bash
# Último paso de la actualización mensual (.github/workflows/actualizar.yml): guarda lo que bajó 01 y lo que armaron 02 y 03, y lo sube a
# la rama. Se prueba con scripts/prueba_guardar_actualizacion.sh.
#
# Si mientras corría la actualización se unió otra cosa a la rama, no se junta con lo armado: se vuelve a armar sobre la rama nueva. El 5
# de noviembre de 2026 la corrida 34 pasó todas las pruebas y no se guardó, porque el PR #95 se unió mientras corría y cambiaba las mismas
# páginas de sitio/ ("git pull --rebase" chocó). Juntar dos versiones de archivos armados tampoco alcanza cuando no chocan: sitio/ tiene que
# ser lo que arman las fuentes de la rama, y la prueba de cada PR lo controla.
# Al volver a armar, la rama nueva toma de esta corrida solo los archivos de datos/crudo/ que 01 cambió (lo que la rama nueva cambió en los
# demás queda), y _registro.csv suma las filas que la rama nueva tenga y esta corrida no (una fuente nueva bajada con --solo). Después
# corren los mismos pasos que en el flujo (02, las pruebas de los datos, 03 y la prueba de páginas): si alguno falla, no se sube nada.
#
# Todo va dentro de las llaves para que bash lea el programa entero antes de empezar: "git reset" puede cambiar este mismo archivo.
{
set -euo pipefail

rama="${GITHUB_REF_NAME:-$(git rev-parse --abbrev-ref HEAD)}"
git config user.name "actualizador"
git config user.email "actualizador@users.noreply.github.com"

base=$(git rev-parse HEAD)
git add -A
if git diff --cached --quiet; then
  echo "Sin cambios para guardar."
  exit 0
fi
git commit -q -m "Actualizacion automatica de datos"

# a lo sumo dos armados más: cada uno tarda unos diez minutos y el trabajo se corta a las dos horas
for intento in 1 2 3; do
  git fetch -q origin "$rama"
  arriba=$(git rev-parse FETCH_HEAD)
  if [ "$arriba" = "$base" ]; then
    if git push origin "HEAD:$rama"; then
      echo "Guardado en $rama."
      exit 0
    fi
    # alguien subió algo entre la consulta y el envío: se vuelve a consultar
    continue
  fi
  [ "$intento" = 3 ] && break
  echo "La rama $rama cambió mientras corría la actualización ($base a $arriba): se vuelve a armar sobre ella."
  git log --oneline "$base..$arriba" || true
  bajado=$(git rev-parse HEAD)
  git reset -q --hard "$arriba"
  git diff --name-only --no-renames --diff-filter=AM "$base" "$bajado" -- datos/crudo | xargs -r -d '\n' git checkout "$bajado" --
  git diff --name-only --no-renames --diff-filter=D "$base" "$bajado" -- datos/crudo | xargs -r -d '\n' git rm -q --ignore-unmatch --
  python - "$bajado" "$arriba" <<'PY'
import csv, io, subprocess, sys

def filas(ref):
    t = subprocess.run(["git", "show", f"{ref}:datos/crudo/_registro.csv"], capture_output=True, encoding="utf-8")
    return list(csv.reader(io.StringIO(t.stdout))) if t.returncode == 0 else []

nuestro, arriba = filas(sys.argv[1]), filas(sys.argv[2])
if nuestro:
    vistos = {f[0] for f in nuestro[1:] if f}
    with open("datos/crudo/_registro.csv", "w", newline="", encoding="utf-8") as f:
        csv.writer(f).writerows(nuestro + [f for f in arriba[1:] if f and f[0] not in vistos])
PY
  pip install -q -r requirements.txt
  python scripts/02_procesar.py
  python scripts/pruebas_datos.py
  python scripts/03_construir_sitio.py
  node scripts/prueba_paginas.mjs
  base="$arriba"
  git add -A
  if git diff --cached --quiet; then
    echo "Armado sobre la rama nueva, sin cambios para guardar."
    exit 0
  fi
  git commit -q -m "Actualizacion automatica de datos"
done
echo "La rama $rama siguió cambiando: no se guardó nada. Volver a lanzar la actualización." >&2
exit 1
}
