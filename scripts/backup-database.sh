#!/bin/bash

# Script para hacer backup de la base de datos PostgreSQL
# Uso: ./scripts/backup-database.sh

# Configuración de la base de datos
DB_HOST=${DATABASE_HOST:-localhost}
DB_PORT=${DATABASE_PORT:-5432}
DB_NAME=${DATABASE_NAME:-strapi}
DB_USER=${DATABASE_USERNAME:-strapi}
DB_PASSWORD=${DATABASE_PASSWORD:-strapi}

# Directorio de backup
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="strapi_backup_${TIMESTAMP}.sql"

# Crear directorio de backup si no existe
mkdir -p $BACKUP_DIR

echo "🔄 Iniciando backup de la base de datos..."
echo "📊 Base de datos: $DB_NAME en $DB_HOST:$DB_PORT"

# Hacer backup usando pg_dump
PGPASSWORD=$DB_PASSWORD pg_dump \
  -h $DB_HOST \
  -p $DB_PORT \
  -U $DB_USER \
  -d $DB_NAME \
  --clean \
  --if-exists \
  --create \
  --verbose \
  --file="$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "✅ Backup completado exitosamente!"
  echo "📁 Archivo guardado en: $BACKUP_DIR/$BACKUP_FILE"
  echo "💾 Tamaño del archivo: $(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)"
else
  echo "❌ Error al hacer backup de la base de datos"
  exit 1
fi

