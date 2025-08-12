#!/bin/bash

# Script para configurar la base de datos en RDS desde cero
# Uso: ./scripts/setup-rds.sh

# Configuración de RDS (cambiar según tu configuración)
RDS_HOST=${RDS_HOST:-"tu-instancia-rds.region.rds.amazonaws.com"}
RDS_PORT=${RDS_PORT:-5432}
RDS_NAME=${RDS_NAME:-strapi}
RDS_USER=${RDS_USER:-strapi}
RDS_PASSWORD=${RDS_PASSWORD:-""}

echo "🚀 Configurando base de datos en RDS..."
echo "📊 RDS: $RDS_NAME en $RDS_HOST:$RDS_PORT"

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

# Crear base de datos
echo "🔧 Creando base de datos $RDS_NAME..."
PGPASSWORD=$RDS_PASSWORD psql \
  -h $RDS_HOST \
  -p $RDS_PORT \
  -U $RDS_USER \
  -d postgres \
  -c "CREATE DATABASE $RDS_NAME;" 2>/dev/null || echo "Base de datos ya existe"

# Verificar que la base de datos existe
echo "🔍 Verificando que la base de datos existe..."
PGPASSWORD=$RDS_PASSWORD psql \
  -h $RDS_HOST \
  -p $RDS_PORT \
  -U $RDS_USER \
  -d $RDS_NAME \
  -c "SELECT current_database();" > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo "✅ Base de datos $RDS_NAME configurada correctamente"
  echo ""
  echo "📋 Próximos pasos:"
  echo "1. Actualiza las variables de entorno con las credenciales de RDS"
  echo "2. Ejecuta 'npm run build' para compilar Strapi"
  echo "3. Ejecuta 'npm run start' para iniciar con la nueva base de datos"
  echo ""
  echo "🔧 Variables de entorno necesarias:"
  echo "DATABASE_HOST=$RDS_HOST"
  echo "DATABASE_PORT=$RDS_PORT"
  echo "DATABASE_NAME=$RDS_NAME"
  echo "DATABASE_USERNAME=$RDS_USER"
  echo "DATABASE_PASSWORD=[tu-contraseña]"
  echo "DATABASE_SSL=true"
else
  echo "❌ Error al configurar la base de datos"
  exit 1
fi

