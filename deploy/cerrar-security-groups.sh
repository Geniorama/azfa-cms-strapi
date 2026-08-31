#!/usr/bin/env bash
# =============================================================================
# Paso 5 del cierre del origen: restringir 80 y 443 a los rangos de Cloudflare.
#
# Requiere credenciales de AWS con permisos de EC2 en la cuenta 687980258625.
# Las del perfil por defecto de la máquina de desarrollo NO valen: son de otra
# cuenta (asesol) y solo tienen S3.
#
# Uso:
#   AWS_PROFILE=azfa bash deploy/cerrar-security-groups.sh          # simulación
#   AWS_PROFILE=azfa APLICAR=1 bash deploy/cerrar-security-groups.sh # de verdad
#
# Es idempotente: si algo ya existe, lo reutiliza.
# =============================================================================
set -uo pipefail

REGION="${AWS_REGION:-us-east-1}"
APLICAR="${APLICAR:-0}"

# Los dos security groups que tienen las reglas de entrada web.
# El del CMS tiene además `ec2-rds-1` (sg-064756a879b28cbcf), que es el de la
# base de datos y NO se toca.
SG_CMS="sg-0033bcbcd008162b1"    # launch-wizard-1  · i-04addd99c5857bc23
SG_WEB="sg-0b3d187ac9426e139"    # launch-wizard-2  · i-0a16361b318e8c6d8

say() { printf '\n\033[1;36m== %s\033[0m\n' "$1"; }
run() {
  if [ "$APLICAR" = "1" ]; then "$@"; else echo "   [simulación] $*"; fi
}

# --- 0. Comprobar que las credenciales son de la cuenta correcta -------------
say "Comprobando credenciales"
CUENTA=$(aws sts get-caller-identity --query Account --output text 2>/dev/null)
echo "   cuenta: ${CUENTA:-<sin acceso>}"
if [ "$CUENTA" != "687980258625" ]; then
  echo "   ERROR: se esperaba la cuenta 687980258625 (AZFA). Aborta."
  echo "   Exporta el perfil correcto con AWS_PROFILE=... y vuelve a intentarlo."
  exit 1
fi

# --- 1. Lista de prefijos con los rangos de Cloudflare -----------------------
# Se usa una lista gestionada en vez de 15 reglas sueltas: cuando Cloudflare
# cambie sus rangos se actualiza la lista una vez y los dos security groups lo
# heredan, en lugar de editar regla por regla.
#
# CUIDADO CON EL LÍMITE DE REGLAS. AWS no cuenta la lista como una regla: cuenta
# su `max-entries`. Con max-entries=30 en dos puertos son 60 reglas, y el tope
# por defecto de un security group es 60 -> "maximum number of rules reached".
# Por eso MAX_V4 se queda en 20: 20 x 2 puertos = 40, más el 22 y las reglas
# abiertas que aún conviven, cabe de sobra. Deja 5 huecos de margen sobre los
# 15 rangos actuales; si Cloudflare añadiera más, se sube con
# `aws ec2 modify-managed-prefix-list --max-entries` (solo se puede subir).
#
# NO se crea lista IPv6: ninguna de las dos instancias tiene dirección IPv6
# (comprobado por metadata: /ipv6s devuelve 404), así que Cloudflare solo puede
# alcanzarlas por IPv4 y esas reglas nunca casarían con nada.
MAX_V4=20

say "Descargando los rangos vigentes de Cloudflare"
V4=$(curl -s --fail https://www.cloudflare.com/ips-v4) || { echo "   ERROR al descargar ips-v4"; exit 1; }
N4=$(echo "$V4" | grep -c .)
echo "   IPv4: $N4 rangos (max-entries de la lista: $MAX_V4)"
if [ "$N4" -gt "$MAX_V4" ]; then
  echo "   ERROR: Cloudflare publica más rangos que el max-entries previsto."
  echo "   Sube MAX_V4 en este script, vigilando no pasar de 60 reglas por SG."
  exit 1
fi

crear_lista() {
  local nombre="$1" familia="$2" rangos="$3" maximo="$4"
  local id
  id=$(aws ec2 describe-managed-prefix-lists --region "$REGION" \
        --filters "Name=prefix-list-name,Values=$nombre" \
        --query 'PrefixLists[0].PrefixListId' --output text 2>/dev/null)
  if [ "$id" != "None" ] && [ -n "$id" ]; then
    echo "   ya existe: $nombre ($id)" >&2
    echo "$id"; return
  fi
  local entradas
  entradas=$(echo "$rangos" | grep . | sed 's/.*/{"Cidr":"&"}/' | paste -sd, -)
  if [ "$APLICAR" != "1" ]; then
    echo "   [simulación] crearía $nombre con $maximo entradas máx." >&2
    echo "pl-SIMULADA-$familia"; return
  fi
  aws ec2 create-managed-prefix-list --region "$REGION" \
    --prefix-list-name "$nombre" --address-family "$familia" \
    --max-entries "$maximo" --entries "[$entradas]" \
    --query 'PrefixList.PrefixListId' --output text
}

say "Creando la lista de prefijos"
PL4=$(crear_lista "cloudflare-ipv4" IPv4 "$V4" "$MAX_V4")
echo "   IPv4 -> $PL4"

# --- 2. Añadir las reglas nuevas ANTES de quitar las viejas ------------------
# Este orden importa: durante unos minutos conviven la regla abierta y la
# restringida, así que el sitio no se cae en ningún momento.
say "Añadiendo reglas que permiten solo Cloudflare"
for SG in "$SG_CMS" "$SG_WEB"; do
  for PUERTO in 80 443; do
    echo "   $SG · puerto $PUERTO · $PL4"
    run aws ec2 authorize-security-group-ingress --region "$REGION" \
      --group-id "$SG" \
      --ip-permissions "IpProtocol=tcp,FromPort=$PUERTO,ToPort=$PUERTO,PrefixListIds=[{PrefixListId=$PL4,Description=Cloudflare}]" \
      >/dev/null 2>&1 || echo "      (ya existía o falló, revisar)"
  done
done

echo
echo "-----------------------------------------------------------------------"
echo "PARA AQUÍ Y VERIFICA ANTES DE SEGUIR:"
echo "  curl -s -o /dev/null -w '%{http_code}\\n' https://asociacionzonasfrancas.org/"
echo "  curl -s -o /dev/null -w '%{http_code}\\n' https://cms.asociacionzonasfrancas.org/_health"
echo "Ambos deben responder 200 y 204. Si no, NO ejecutes el paso de abajo."
echo "-----------------------------------------------------------------------"

# --- 3. Quitar las reglas abiertas ------------------------------------------
say "Quitando las reglas 0.0.0.0/0 de los puertos 80 y 443"
echo "   OJO: el puerto 22 NO se toca. Es el acceso SSH y el de los runners"
echo "   de GitHub Actions que despliegan el front."
for SG in "$SG_CMS" "$SG_WEB"; do
  for PUERTO in 80 443; do
    echo "   $SG · puerto $PUERTO · 0.0.0.0/0 y ::/0"
    run aws ec2 revoke-security-group-ingress --region "$REGION" \
      --group-id "$SG" --protocol tcp --port "$PUERTO" --cidr 0.0.0.0/0 \
      >/dev/null 2>&1 || echo "      (no existía)"
    run aws ec2 revoke-security-group-ingress --region "$REGION" \
      --group-id "$SG" \
      --ip-permissions "IpProtocol=tcp,FromPort=$PUERTO,ToPort=$PUERTO,Ipv6Ranges=[{CidrIpv6=::/0}]" \
      >/dev/null 2>&1 || echo "      (no existía)"
  done
done

say "Terminado"
if [ "$APLICAR" != "1" ]; then
  echo "Esto fue una SIMULACIÓN. Repite con APLICAR=1 para ejecutarlo de verdad."
fi
