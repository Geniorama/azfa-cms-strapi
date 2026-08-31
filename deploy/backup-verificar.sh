#!/usr/bin/env bash
# =============================================================================
# Comprobador del respaldo automático
# =============================================================================
# Un respaldo que deja de ejecutarse no avisa: sigue todo aparentemente bien
# hasta el día que hace falta. Este script existe para que eso no pase.
#
# Comprueba tres cosas distintas, porque fallan de formas distintas:
#   1. Que el script se ejecutó hace poco  (¿sigue vivo el cron?)
#   2. Que hay un fichero reciente EN DRIVE (¿llegó de verdad?)
#   3. Que el último volcado es restaurable (¿sirve para algo?)
#
# Uso:   bash deploy/backup-verificar.sh
#        Sale con código 0 si todo está bien, 1 si algo falla.
# =============================================================================
set -uo pipefail

RCLONE_CONF="/home/ubuntu/.config/rclone/rclone.conf"
REMOTO="backup"
ESTADO="/var/lib/azfa-backup/ultimo-exito"
MAX_HORAS=30                          # margen sobre las 24 h del cron

rc() { rclone --config "$RCLONE_CONF" "$@"; }
ok()   { printf '  \033[32mOK\033[0m    %s\n' "$*"; }
mal()  { printf '  \033[31mFALLA\033[0m %s\n' "$*"; PROBLEMAS=$((PROBLEMAS+1)); }
PROBLEMAS=0

echo "Comprobación del respaldo — $(date '+%Y-%m-%d %H:%M')"
echo

# --- 1. ¿Se ejecutó? --------------------------------------------------------
if [ -f "$ESTADO" ]; then
  ULTIMO=$(cat "$ESTADO")
  SEGUNDOS=$(( $(date +%s) - $(date -d "$ULTIMO" +%s) ))
  HORAS=$(( SEGUNDOS / 3600 ))
  if [ "$HORAS" -le "$MAX_HORAS" ]; then
    ok "última ejecución correcta hace ${HORAS} h"
  else
    mal "la última ejecución correcta fue hace ${HORAS} h (máximo esperado: ${MAX_HORAS} h)"
  fi
else
  mal "no hay constancia de ninguna ejecución correcta"
fi

# --- 2. ¿Llegó a Drive? -----------------------------------------------------
if ! rc lsd "$REMOTO:" >/dev/null 2>&1; then
  mal "no se puede acceder al remoto de Drive"
else
  RECIENTE=$(rc lsjson "$REMOTO:diario" --max-age 30h 2>/dev/null | grep -c '"Name"') || RECIENTE=0
  if [ "${RECIENTE:-0}" -ge 1 ]; then
    ok "hay $RECIENTE volcado(s) de menos de 30 h en Drive"
  else
    mal "no hay ningún volcado reciente en Drive"
  fi
  TOTAL=$(rc size "$REMOTO:" 2>/dev/null | tail -1)
  [ -n "$TOTAL" ] && echo "        ocupación total: $TOTAL"
fi

# --- 3. ¿Sirve? -------------------------------------------------------------
# Se descarga el último volcado y se comprueba que pg_restore puede leer su
# índice. Es la única prueba que distingue un respaldo de un fichero.
if rc lsd "$REMOTO:" >/dev/null 2>&1; then
  ULTIMO_DUMP=$(rc lsf "$REMOTO:diario" 2>/dev/null | sort | tail -1)
  if [ -n "$ULTIMO_DUMP" ]; then
    TMP=$(mktemp -d)
    if rc copy "$REMOTO:diario/$ULTIMO_DUMP" "$TMP/" >/dev/null 2>&1; then
      OBJETOS=$(pg_restore -l "$TMP/$ULTIMO_DUMP" 2>/dev/null | grep -c '^[0-9]') || OBJETOS=0
      if [ "${OBJETOS:-0}" -gt 100 ]; then
        ok "el último volcado ($ULTIMO_DUMP) se descifra y es restaurable — $OBJETOS objetos"
      else
        mal "el último volcado se descargó pero pg_restore solo ve ${OBJETOS:-0} objetos"
      fi
    else
      mal "no se pudo descargar el último volcado desde Drive"
    fi
    rm -rf "$TMP"
  else
    mal "no hay ningún volcado en la carpeta diaria"
  fi
fi

echo
if [ "$PROBLEMAS" -eq 0 ]; then
  echo "Todo correcto."
  exit 0
else
  echo "$PROBLEMAS comprobación(es) fallida(s) — revisar /var/log/azfa-backup.log"
  exit 1
fi
