# 🚀 Migración a AWS RDS - Guía Completa

Esta guía te ayudará a migrar tu base de datos Strapi a AWS RDS (PostgreSQL).

## 📋 Prerrequisitos

1. **Instancia RDS configurada** en AWS
2. **Cliente PostgreSQL** instalado localmente (`psql`, `pg_dump`)
3. **Acceso a la base de datos actual** (local o remota)
4. **Credenciales de RDS** (endpoint, puerto, usuario, contraseña)

## 🔧 Instalación de herramientas

### En Windows (PowerShell):
```powershell
# Instalar PostgreSQL client
winget install PostgreSQL.PostgreSQL
# O descargar desde: https://www.postgresql.org/download/windows/
```

### En macOS:
```bash
brew install postgresql
```

### En Linux (Ubuntu/Debian):
```bash
sudo apt-get install postgresql-client
```

## 📊 Paso 1: Hacer backup de la base de datos actual

### Opción A: Desde base de datos local
```bash
# Configurar variables de entorno
$env:DATABASE_HOST="localhost"
$env:DATABASE_PORT="5432"
$env:DATABASE_NAME="strapi"
$env:DATABASE_USERNAME="strapi"
$env:DATABASE_PASSWORD="tu-contraseña"

# Ejecutar backup
./scripts/backup-database.sh
```

### Opción B: Desde base de datos remota
```bash
# Configurar variables de entorno para la base de datos remota
$env:DATABASE_HOST="tu-servidor-remoto.com"
$env:DATABASE_PORT="5432"
$env:DATABASE_NAME="strapi"
$env:DATABASE_USERNAME="strapi"
$env:DATABASE_PASSWORD="tu-contraseña"

# Ejecutar backup
./scripts/backup-database.sh
```

### Opción C: Backup manual con pg_dump
```bash
pg_dump -h localhost -U strapi -d strapi --clean --if-exists --create --verbose --file="backup_manual.sql"
```

## 🚀 Paso 2: Configurar RDS

### 2.1 Configurar variables de entorno para RDS
```bash
# Crear archivo .env basado en env.example
copy env.example .env

# Editar .env con tus credenciales de RDS
notepad .env
```

### 2.2 Verificar conexión a RDS
```bash
# Configurar variables de entorno
$env:RDS_HOST="tu-instancia-rds.region.rds.amazonaws.com"
$env:RDS_PORT="5432"
$env:RDS_NAME="strapi"
$env:RDS_USER="strapi"
$env:RDS_PASSWORD="tu-contraseña"

# Probar conexión
./scripts/setup-rds.sh
```

## 📥 Paso 3: Restaurar backup en RDS

### 3.1 Restaurar desde archivo de backup
```bash
# Configurar variables de entorno para RDS
$env:RDS_HOST="tu-instancia-rds.region.rds.amazonaws.com"
$env:RDS_PORT="5432"
$env:RDS_NAME="strapi"
$env:RDS_USER="strapi"
$env:RDS_PASSWORD="tu-contraseña"

# Restaurar backup
./scripts/restore-database.sh ./backups/strapi_backup_YYYYMMDD_HHMMSS.sql
```

### 3.2 Restauración manual con psql
```bash
psql -h tu-instancia-rds.region.rds.amazonaws.com -U strapi -d strapi -f backup_manual.sql
```

## 🔄 Paso 4: Actualizar configuración de Strapi

### 4.1 Verificar archivo .env
Asegúrate de que tu archivo `.env` tenga la configuración correcta de RDS:

```env
DATABASE_CLIENT=postgres
DATABASE_HOST=tu-instancia-rds.region.rds.amazonaws.com
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=tu-contraseña-segura
DATABASE_SSL=true
```

### 4.2 Recompilar y reiniciar Strapi
```bash
# Recompilar Strapi
npm run build

# Iniciar con nueva configuración
npm run start
```

## ✅ Paso 5: Verificar migración

### 5.1 Verificar conexión
```bash
# Conectar a RDS y verificar tablas
psql -h tu-instancia-rds.region.rds.amazonaws.com -U strapi -d strapi -c "\dt"
```

### 5.2 Verificar datos
```bash
# Verificar contenido de tablas principales
psql -h tu-instancia-rds.region.rds.amazonaws.com -U strapi -d strapi -c "SELECT COUNT(*) FROM users;"
psql -h tu-instancia-rds.region.rds.amazonaws.com -U strapi -d strapi -c "SELECT COUNT(*) FROM content;"
```

## 🚨 Solución de problemas comunes

### Error de conexión SSL
```bash
# Si tienes problemas con SSL, puedes deshabilitarlo temporalmente
DATABASE_SSL=false
```

### Error de permisos
```bash
# Verificar que el usuario tenga permisos en RDS
GRANT ALL PRIVILEGES ON DATABASE strapi TO strapi;
GRANT ALL PRIVILEGES ON SCHEMA public TO strapi;
```

### Error de pool de conexiones
```bash
# Ajustar configuración del pool en config/database.ts
pool: { 
  min: env.int('DATABASE_POOL_MIN', 1), 
  max: env.int('DATABASE_POOL_MAX', 5) 
}
```

## 🔒 Seguridad

1. **Nunca** commits credenciales en Git
2. **Usa** contraseñas fuertes para RDS
3. **Configura** grupos de seguridad de AWS apropiadamente
4. **Habilita** encriptación en tránsito y en reposo
5. **Usa** IAM roles cuando sea posible

## 📚 Recursos adicionales

- [Documentación oficial de Strapi](https://docs.strapi.io/)
- [Guía de PostgreSQL en AWS RDS](https://docs.aws.amazon.com/rds/latest/UserGuide/CHAP_PostgreSQL.html)
- [Mejores prácticas de seguridad de RDS](https://docs.aws.amazon.com/rds/latest/UserGuide/UsingWithRDS.html)

## 🆘 Soporte

Si encuentras problemas:

1. Verifica los logs de Strapi
2. Revisa la conectividad de red
3. Verifica las credenciales de RDS
4. Consulta la documentación de AWS RDS
5. Revisa los permisos de seguridad de AWS
