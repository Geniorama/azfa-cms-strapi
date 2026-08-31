#!/usr/bin/env bash
# =============================================================================
# Respaldo automático a Google Drive
# =============================================================================
# Sube a una unidad compartida de Drive, cifrado:
#   - Volcado de la base de datos RDS ....... a diario
#   - Espejo de los medios de S3 ............ semanal, incremental
#   - Código de los dos repositorios ........ semanal
#
# El cifrado lo hace rclone con un remoto `crypt`: el contenido viaja y se
# almacena cifrado, pero los NOMBRES quedan legibles para poder navegar la
# carpeta desde Drive. Quien tenga acceso a la unidad compartida ve la
# estructura, no el contenido.
#
# Uso:   bash /home/ubuntu/azfa-cms-strapi/deploy/backup-drive.sh
#        (lo lanza cron a diario; ver deploy/BACKUP_DRIVE.md)
# =============================================================================
set -uo pipefail

RCLONE_CONF="/home/ubuntu/.config/rclone/rclone.conf"
REMOTO="backup"                       # remoto crypt definido en rclone.conf
REMOTO_S3="s3-azfa"                   # remoto de solo lectura al bucket
ENV_FILE="/home/ubuntu/azfa-cms-strapi/.env"
REPO_CMS="/home/ubuntu/azfa-cms-strapi"
REPO_WEB="${REPO_WEB:-}"              # opcional: ruta al repo del front si está en esta máquina
TRABAJO="/tmp/backup-azfa-$$"
LOG="/var/log/azfa-backup.log"
ESTADO="/var/lib/azfa-backup/ultimo-exito"

# Retención, en días
DIAS_DIARIO=14
DIAS_SEMANAL=56

FECHA="$(date +%Y%m%d)"
DIA_SEMANA="$(date +%u)"              # 1=lunes … 7=domingo
SEMANAL_HOY=0
[ "$DIA_SEMANA" = "7" ] && SEMANAL_HOY=1
[ "${FORZAR_SEMANAL:-0}" = "1" ] && SEMANAL_HOY=1

log() { printf '%s  %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" | tee -a "$LOG"; }
fallo() { log "ERROR: $*"; limpiar; exit 1; }
limpiar() { rm -rf "$TRABAJO"; }
trap limpiar EXIT

rc() { rclone --config "$RCLONE_CONF" "$@"; }

mkdir -p "$TRABAJO" "$(dirname "$ESTADO")" || fallo "no se pudo preparar el directorio de trabajo"
log "===== inicio del respaldo ($FECHA) ====="

# --- Comprobaciones previas -------------------------------------------------
[ -f "$RCLONE_CONF" ] || fallo "falta $RCLONE_CONF — ver deploy/BACKUP_DRIVE.md"
rc lsd "$REMOTO:" >/dev/null 2>&1 || fallo "no se puede acceder al remoto '$REMOTO'. ¿Cuenta de servicio o unidad compartida mal configuradas?"
log "acceso a Drive verificado"

# Espacio libre: el volcado es pequeño, pero los bundles del código no tanto.
LIBRE_MB=$(df -Pm /tmp | awk 'NR==2{print $4}')
[ "$LIBRE_MB" -gt 2048 ] || fallo "quedan solo ${LIBRE_MB} MB libres en /tmp; se necesitan al menos 2 GB"

# --- Subir y VERIFICAR ------------------------------------------------------
# No basta con que rclone no dé error: se comprueba que el fichero está en el
# destino y que su tamaño coincide. Un respaldo que falla en silencio es peor
# que no tener respaldo, porque da confianza falsa.
subir() {
  local origen="$1" destino="$2" nombre
  nombre="$(basename "$origen")"
  local tam_local
  tam_local=$(stat -c%s "$origen")

  rc copy "$origen" "$REMOTO:$destino/" || fallo "fallo al subir $nombre"

  local tam_remoto
  tam_remoto=$(rc lsjson "$REMOTO:$destino/$nombre" 2>/dev/null | grep -o '"Size":[0-9]*' | head -1 | cut -d: -f2)
  if [ -z "$tam_remoto" ]; then
    fallo "$nombre no aparece en el destino tras subirlo"
  fi
  if [ "$tam_remoto" != "$tam_local" ]; then
    fallo "$nombre subió con tamaño distinto (local $tam_local, remoto $tam_remoto)"
  fi
  log "subido y verificado: $destino/$nombre ($(numfmt --to=iec "$tam_local"))"
}

# --- 1. Base de datos (a diario) --------------------------------------------
log "--- volcando la base de datos ---"
val() { grep -E "^$1 *=" "$ENV_FILE" | head -1 | sed -E 's/^[^=]*= *//; s/^"//; s/"$//'; }
export PGHOST="$(val DATABASE_HOST)" PGPORT="$(val DATABASE_PORT)"
export PGDATABASE="$(val DATABASE_NAME)" PGUSER="$(val DATABASE_USERNAME)"
export PGPASSWORD="$(val DATABASE_PASSWORD)" PGSSLMODE=require

DUMP="$TRABAJO/azfa-db-$FECHA.dump"
pg_dump -Fc -Z9 -f "$DUMP" || fallo "pg_dump falló"

# Comprobar que el volcado es RESTAURABLE, no solo que existe: pg_restore -l
# lee el índice del fichero y falla si está truncado o corrupto.
OBJETOS=$(pg_restore -l "$DUMP" 2>/dev/null | grep -c '^[0-9]') || true
[ "${OBJETOS:-0}" -gt 100 ] || fallo "el volcado solo tiene ${OBJETOS:-0} objetos; parece incompleto"
log "volcado correcto: $OBJETOS objetos restaurables"

subir "$DUMP" "diario"

# --- 2. Medios de S3 (semanal, incremental) ---------------------------------
if [ "$SEMANAL_HOY" = "1" ]; then
  log "--- sincronizando los medios de S3 ---"
  # `--backup-dir` es lo que convierte un espejo en un respaldo: si un fichero
  # se borra o se reemplaza en S3, su versión anterior NO desaparece de Drive,
  # se mueve a medios-historico/<fecha>. Sin esto, un borrado accidental en el
  # CMS se propagaría al respaldo y no habría nada que recuperar.
  rc sync "$REMOTO_S3:" "$REMOTO:medios" \
    --backup-dir "$REMOTO:medios-historico/$FECHA" \
    --transfers 4 --checkers 8 --stats-one-line --stats 5m \
    || fallo "fallo al sincronizar los medios"
  N_MEDIOS=$(rc size "$REMOTO:medios" 2>/dev/null | head -1)
  log "medios sincronizados — $N_MEDIOS"
fi

# --- 3. Código (semanal) ----------------------------------------------------
if [ "$SEMANAL_HOY" = "1" ]; then
  log "--- empaquetando el código ---"
  # `git bundle --all` incluye todas las ramas y todo el historial; se restaura
  # con `git clone fichero.bundle`. Es redundante con GitHub a propósito.
  if [ -d "$REPO_CMS/.git" ]; then
    B="$TRABAJO/cms-strapi-azfa-$FECHA.bundle"
    git -C "$REPO_CMS" bundle create "$B" --all >/dev/null 2>&1 \
      && subir "$B" "semanal" || log "AVISO: no se pudo empaquetar el repo del CMS"
  fi
  if [ -n "$REPO_WEB" ] && [ -d "$REPO_WEB/.git" ]; then
    B="$TRABAJO/azfa-web-$FECHA.bundle"
    git -C "$REPO_WEB" bundle create "$B" --all >/dev/null 2>&1 \
      && subir "$B" "semanal" || log "AVISO: no se pudo empaquetar el repo del front"
  else
    log "nota: el repo del front no está en esta máquina; su código vive en GitHub"
  fi
fi

# --- 4. Retención -----------------------------------------------------------
log "--- aplicando retención ---"
rc delete "$REMOTO:diario"  --min-age "${DIAS_DIARIO}d"  2>/dev/null || true
rc delete "$REMOTO:semanal" --min-age "${DIAS_SEMANAL}d" 2>/dev/null || true
rc delete "$REMOTO:medios-historico" --min-age "${DIAS_SEMANAL}d" 2>/dev/null || true
rc rmdirs "$REMOTO:medios-historico" --leave-root 2>/dev/null || true
log "retención aplicada: diario ${DIAS_DIARIO}d · semanal ${DIAS_SEMANAL}d"

# --- 5. Marcar el éxito -----------------------------------------------------
# Este fichero es lo que permite detectar que el respaldo dejó de ejecutarse.
date -Iseconds > "$ESTADO"
log "===== respaldo completado =====";
exit 0
