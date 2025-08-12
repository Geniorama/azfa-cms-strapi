#!/bin/bash

# Script para restaurar la base de datos en RDS
# Uso: ./scripts/restore-database.sh [archivo_backup.sql]

# Verificar si se proporcionó un archivo de backup
if [ $# -eq 0 ]; then
  echo "❌ Error: Debes especificar el archivo de backup"
  echo "Uso: ./scripts/restore-database.sh [archivo_backup.sql]"
  echo ""
  echo "Archivos de backup disponibles:"
  ls -la ./backups/*.sql 2>/dev/null || echo "No hay archivos de backup en ./backups/"
  exit 1
fi

BACKUP_FILE=$1

# Verificar si el archivo existe
if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Error: El archivo $BACKUP_FILE no existe"
  exit 1
fi

# Configuración de RDS (cambiar según tu configuración)
RDS_HOST=${RDS_HOST:-"tu-instancia-rds.region.rds.amazonaws.com"}
RDS_PORT=${RDS_PORT:-5432}
RDS_NAME=${RDS_NAME:-strapi}
RDS_USER=${RDS_USER:-strapi}
RDS_PASSWORD=${RDS_PASSWORD:-""}

echo "🔄 Iniciando restauración de la base de datos..."
echo "📊 RDS: $RDS_NAME en $RDS_HOST:$RDS_PORT"
echo "📁 Archivo de backup: $BACKUP_FILE"

# Verificar conexión a RDS
echo "🔍 Verificando conexión a RDS..."
PGPASSWORD=$RDS_PASSWORD psql \
  -h $RDS_HOST \
  -p $RDS_PORT \
  -U $RDS_USER \
  -d postgres \
  -c "SELECT version();" > /dev/null 2>&1

if [ $? -ne 0 ]; then
  echo "❌ Error: No se puede conectar a RDS"
  echo "Verifica las credenciales y la conectividad"
  exit 1
fi

echo "✅ Conexión a RDS exitosa"

# Crear base de datos si no existe
echo "🔧 Creando base de datos si no existe..."
PGPASSWORD=$RDS_PASSWORD psql \
  -h $RDS_HOST \
  -p $RDS_PORT \
  -U $RDS_USER \
  -d postgres \
  -c "CREATE DATABASE $RDS_NAME;" 2>/dev/null || echo "Base de datos ya existe"

# Restaurar backup
echo "📥 Restaurando backup..."
PGPASSWORD=$RDS_PASSWORD psql \
  -h $RDS_HOST \
  -p $RDS_PORT \
  -U $RDS_USER \
  -d $RDS_NAME \
  -f "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "✅ Restauración completada exitosamente!"
  echo "🎉 Base de datos $RDS_NAME restaurada en RDS"
else
  echo "❌ Error al restaurar la base de datos"
  exit 1
fi

