#!/usr/bin/env bash
# git_changelog.sh
# -------------------------------------------------
# Uso: git_changelog.sh <version_inicial> <version_final> [archivo_salida]
# Ejemplo:
#   ./git_changelog.sh v1.0.0.8 v1.0.1.0 misc_commits.md
# Si no se indica archivo_salida, se usará "misc_commits.md".
# IMPORTANTE: Antes de ejecutar, asegúrate de haber creado el TAG para la versión FINAL.
#   ej. git tag -a v1.0.1.0 -m "Versión 1.0.1.0 producción"
# -------------------------------------------------

set -euo pipefail

if [[ $# -lt 2 || $# -gt 3 ]]; then
  echo "Uso: $(basename "$0") <version_inicial> <version_final> [archivo_salida]"
  exit 1
fi

START_TAG=$1
END_TAG=$2
OUTPUT_FILE=${3:-misc_commits.md}

# Detecta la raíz del repositorio Git (funciona aunque este script esté en /scripts)
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
if [[ -z "$REPO_ROOT" ]]; then
  echo "Error: no se pudo determinar la raíz del repositorio Git" >&2
  exit 1
fi

# Genera el log de commits entre las dos versiones
git -C "$REPO_ROOT" log "${START_TAG}..${END_TAG}" \
  --pretty=format:"----------------------------------------%n- %s (%h)%n%b%n" \
  --no-merges > "$OUTPUT_FILE"

echo "Changelog generado en $OUTPUT_FILE"
