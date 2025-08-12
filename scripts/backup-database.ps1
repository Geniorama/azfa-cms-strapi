# Script de PowerShell para hacer backup de la base de datos PostgreSQL
# Uso: .\scripts\backup-database.ps1

# Configuración de la base de datos
$DB_HOST = if ($env:DATABASE_HOST) { $env:DATABASE_HOST } else { "localhost" }
$DB_PORT = if ($env:DATABASE_PORT) { $env:DATABASE_PORT } else { "5432" }
$DB_NAME = if ($env:DATABASE_NAME) { $env:DATABASE_NAME } else { "strapi" }
$DB_USER = if ($env:DATABASE_USERNAME) { $env:DATABASE_USERNAME } else { "strapi" }
$DB_PASSWORD = if ($env:DATABASE_PASSWORD) { $env:DATABASE_PASSWORD } else { "strapi" }

# Directorio de backup
$BACKUP_DIR = ".\backups"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = "strapi_backup_${TIMESTAMP}.sql"

# Crear directorio de backup si no existe
if (!(Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
}

Write-Host "🔄 Iniciando backup de la base de datos..." -ForegroundColor Yellow
Write-Host "📊 Base de datos: $DB_NAME en $DB_HOST`:$DB_PORT" -ForegroundColor Cyan

# Verificar si pg_dump está disponible
try {
    $pgDumpVersion = & pg_dump --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ pg_dump encontrado: $pgDumpVersion" -ForegroundColor Green
    } else {
        throw "pg_dump no está disponible"
    }
} catch {
    Write-Host "❌ Error: pg_dump no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "💡 Instala PostgreSQL client desde: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "💡 O usa: winget install PostgreSQL.PostgreSQL" -ForegroundColor Yellow
    exit 1
}

# Hacer backup usando pg_dump
Write-Host "📥 Creando backup..." -ForegroundColor Yellow

$env:PGPASSWORD = $DB_PASSWORD
& pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME --clean --if-exists --create --verbose --file="$BACKUP_DIR\$BACKUP_FILE"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backup completado exitosamente!" -ForegroundColor Green
    Write-Host "📁 Archivo guardado en: $BACKUP_DIR\$BACKUP_FILE" -ForegroundColor Green
    
    $fileSize = (Get-Item "$BACKUP_DIR\$BACKUP_FILE").Length
    $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
    Write-Host "💾 Tamaño del archivo: $fileSizeMB MB" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "🚀 Próximo paso: Restaurar en RDS usando:" -ForegroundColor Cyan
    Write-Host "   .\scripts\restore-database.ps1 $BACKUP_DIR\$BACKUP_FILE" -ForegroundColor White
} else {
    Write-Host "❌ Error al hacer backup de la base de datos" -ForegroundColor Red
    exit 1
}
