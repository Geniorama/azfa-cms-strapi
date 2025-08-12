# Script de PowerShell para restaurar la base de datos en RDS
# Uso: .\scripts\restore-database.ps1 [archivo_backup.sql]

# Verificar si se proporcionó un archivo de backup
if ($args.Count -eq 0) {
    Write-Host "❌ Error: Debes especificar el archivo de backup" -ForegroundColor Red
    Write-Host "Uso: .\scripts\restore-database.ps1 [archivo_backup.sql]" -ForegroundColor White
    Write-Host ""
    Write-Host "Archivos de backup disponibles:" -ForegroundColor Yellow
    
    if (Test-Path ".\backups") {
        Get-ChildItem ".\backups\*.sql" | ForEach-Object {
            Write-Host "   $($_.Name)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "   No hay archivos de backup en .\backups\" -ForegroundColor Red
    }
    exit 1
}

$BACKUP_FILE = $args[0]

# Verificar si el archivo existe
if (!(Test-Path $BACKUP_FILE)) {
    Write-Host "❌ Error: El archivo $BACKUP_FILE no existe" -ForegroundColor Red
    exit 1
}

# Configuración de RDS (cambiar según tu configuración)
$RDS_HOST = if ($env:RDS_HOST) { $env:RDS_HOST } else { "tu-instancia-rds.region.rds.amazonaws.com" }
$RDS_PORT = if ($env:RDS_PORT) { $env:RDS_PORT } else { "5432" }
$RDS_NAME = if ($env:RDS_NAME) { $env:RDS_NAME } else { "strapi" }
$RDS_USER = if ($env:RDS_USER) { $env:RDS_USER } else { "strapi" }
$RDS_PASSWORD = if ($env:RDS_PASSWORD) { $env:RDS_PASSWORD } else { "" }

Write-Host "🔄 Iniciando restauración de la base de datos..." -ForegroundColor Yellow
Write-Host "📊 RDS: $RDS_NAME en $RDS_HOST`:$RDS_PORT" -ForegroundColor Cyan
Write-Host "📁 Archivo de backup: $BACKUP_FILE" -ForegroundColor Cyan

# Verificar si psql está disponible
try {
    $psqlVersion = & psql --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ psql encontrado: $psqlVersion" -ForegroundColor Green
    } else {
        throw "psql no está disponible"
    }
} catch {
    Write-Host "❌ Error: psql no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "💡 Instala PostgreSQL client desde: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

# Verificar conexión a RDS
Write-Host "🔍 Verificando conexión a RDS..." -ForegroundColor Yellow

$env:PGPASSWORD = $RDS_PASSWORD
& psql -h $RDS_HOST -p $RDS_PORT -U $RDS_USER -d postgres -c "SELECT version();" 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: No se puede conectar a RDS" -ForegroundColor Red
    Write-Host "Verifica las credenciales y la conectividad" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Configura las variables de entorno:" -ForegroundColor Cyan
    Write-Host "   `$env:RDS_HOST = 'tu-endpoint-rds'" -ForegroundColor White
    Write-Host "   `$env:RDS_USER = 'tu-usuario'" -ForegroundColor White
    Write-Host "   `$env:RDS_PASSWORD = 'tu-contraseña'" -ForegroundColor White
    exit 1
}

Write-Host "✅ Conexión a RDS exitosa" -ForegroundColor Green

# Crear base de datos si no existe
Write-Host "🔧 Creando base de datos si no existe..." -ForegroundColor Yellow
& psql -h $RDS_HOST -p $RDS_PORT -U $RDS_USER -d postgres -c "CREATE DATABASE $RDS_NAME;" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Base de datos creada" -ForegroundColor Green
} else {
    Write-Host "ℹ️ Base de datos ya existe" -ForegroundColor Yellow
}

# Restaurar backup
Write-Host "📥 Restaurando backup..." -ForegroundColor Yellow
& psql -h $RDS_HOST -p $RDS_PORT -U $RDS_USER -d $RDS_NAME -f $BACKUP_FILE

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Restauración completada exitosamente!" -ForegroundColor Green
    Write-Host "🎉 Base de datos $RDS_NAME restaurada en RDS" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "🚀 Próximos pasos:" -ForegroundColor Cyan
    Write-Host "1. Actualiza tu archivo .env con las credenciales de RDS" -ForegroundColor White
    Write-Host "2. Ejecuta 'npm run build' para recompilar Strapi" -ForegroundColor White
    Write-Host "3. Ejecuta 'npm run start' para iniciar con la nueva base de datos" -ForegroundColor White
} else {
    Write-Host "❌ Error al restaurar la base de datos" -ForegroundColor Red
    exit 1
}

