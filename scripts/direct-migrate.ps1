# Script para migrar directamente de una base de datos a RDS
# Uso: .\scripts\direct-migrate.ps1

Write-Host "Migracion directa de base de datos a RDS..." -ForegroundColor Yellow

# Verificar que las variables de entorno esten configuradas
$SOURCE_HOST = $env:DATABASE_HOST
$SOURCE_PORT = $env:DATABASE_PORT
$SOURCE_NAME = $env:DATABASE_NAME
$SOURCE_USER = $env:DATABASE_USERNAME
$SOURCE_PASSWORD = $env:DATABASE_PASSWORD

$RDS_HOST = $env:RDS_HOST
$RDS_PORT = $env:RDS_PORT
$RDS_NAME = $env:RDS_NAME
$RDS_USER = $env:RDS_USER
$RDS_PASSWORD = $env:RDS_PASSWORD

# Verificar configuracion de origen
if (!$SOURCE_HOST -or !$SOURCE_USER -or !$SOURCE_PASSWORD) {
    Write-Host "Error: Variables de entorno de origen no configuradas" -ForegroundColor Red
    Write-Host "Configura las variables de entorno:" -ForegroundColor Cyan
    Write-Host "   `$env:DATABASE_HOST = 'tu-servidor-origen'" -ForegroundColor White
    Write-Host "   `$env:DATABASE_USERNAME = 'tu-usuario'" -ForegroundColor White
    Write-Host "   `$env:DATABASE_PASSWORD = 'tu-contraseña'" -ForegroundColor White
    exit 1
}

# Verificar configuracion de RDS
if (!$RDS_HOST -or !$RDS_USER -or !$RDS_PASSWORD) {
    Write-Host "Error: Variables de entorno de RDS no configuradas" -ForegroundColor Red
    Write-Host "Configura las variables de entorno:" -ForegroundColor Cyan
    Write-Host "   `$env:RDS_HOST = 'tu-endpoint-rds'" -ForegroundColor White
    Write-Host "   `$env:RDS_USER = 'tu-usuario'" -ForegroundColor White
    Write-Host "   `$env:RDS_PASSWORD = 'tu-contraseña'" -ForegroundColor White
    exit 1
}

Write-Host "Configuracion detectada:" -ForegroundColor Cyan
Write-Host "   Origen: $SOURCE_NAME en $SOURCE_HOST`:$SOURCE_PORT" -ForegroundColor White
Write-Host "   Destino: $RDS_NAME en $RDS_HOST`:$RDS_PORT" -ForegroundColor White

# Verificar conectividad a la base de datos origen
Write-Host ""
Write-Host "Verificando conectividad a la base de datos origen..." -ForegroundColor Yellow

$env:PGPASSWORD = $SOURCE_PASSWORD
$result = & psql -h $SOURCE_HOST -p $SOURCE_PORT -U $SOURCE_USER -d $SOURCE_NAME -c "SELECT version();" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: No se puede conectar a la base de datos origen" -ForegroundColor Red
    Write-Host "Verifica las credenciales y la conectividad" -ForegroundColor Yellow
    exit 1
}

Write-Host "Conexion a la base de datos origen exitosa" -ForegroundColor Green

# Verificar conectividad a RDS
Write-Host ""
Write-Host "Verificando conectividad a RDS..." -ForegroundColor Yellow

$env:PGPASSWORD = $RDS_PASSWORD
$result = & psql -h $RDS_HOST -p $RDS_PORT -U $RDS_USER -d postgres -c "SELECT version();" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: No se puede conectar a RDS" -ForegroundColor Red
    Write-Host "Verifica las credenciales y la conectividad" -ForegroundColor Yellow
    exit 1
}

Write-Host "Conexion a RDS exitosa" -ForegroundColor Green

# Crear base de datos en RDS si no existe
Write-Host ""
Write-Host "Creando base de datos en RDS..." -ForegroundColor Yellow

& psql -h $RDS_HOST -p $RDS_PORT -U $RDS_USER -d postgres -c "CREATE DATABASE $RDS_NAME;" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Base de datos creada" -ForegroundColor Green
} else {
    Write-Host "Base de datos ya existe" -ForegroundColor Yellow
}

# Hacer backup directo y restaurar
Write-Host ""
Write-Host "Iniciando migracion directa..." -ForegroundColor Yellow

# Crear archivo temporal
$tempFile = "temp_migration_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"

try {
    # Hacer backup de la base de datos origen
    Write-Host "Haciendo backup de la base de datos origen..." -ForegroundColor Yellow
    
    $env:PGPASSWORD = $SOURCE_PASSWORD
    & pg_dump -h $SOURCE_HOST -p $SOURCE_PORT -U $SOURCE_USER -d $SOURCE_NAME --clean --if-exists --create --verbose --file=$tempFile
    
    if ($LASTEXITCODE -ne 0) {
        throw "Error al hacer backup de la base de datos origen"
    }
    
    Write-Host "Backup completado" -ForegroundColor Green
    
    # Restaurar en RDS
    Write-Host "Restaurando en RDS..." -ForegroundColor Yellow
    
    $env:PGPASSWORD = $RDS_PASSWORD
    & psql -h $RDS_HOST -p $RDS_PORT -U $RDS_USER -d $RDS_NAME -f $tempFile
    
    if ($LASTEXITCODE -ne 0) {
        throw "Error al restaurar en RDS"
    }
    
    Write-Host "Restauracion completada exitosamente!" -ForegroundColor Green
    Write-Host "Migracion completada!" -ForegroundColor Green
    
    # Limpiar archivo temporal
    if (Test-Path $tempFile) {
        Remove-Item $tempFile
        Write-Host "Archivo temporal eliminado" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Proximos pasos:" -ForegroundColor Cyan
    Write-Host "1. Actualiza tu archivo .env con las credenciales de RDS" -ForegroundColor White
    Write-Host "2. Ejecuta 'npm run build' para recompilar Strapi" -ForegroundColor White
    Write-Host "3. Ejecuta 'npm run start' para iniciar con la nueva base de datos" -ForegroundColor White
    
} catch {
    Write-Host "Error durante la migracion: $($_.Exception.Message)" -ForegroundColor Red
    
    # Limpiar archivo temporal en caso de error
    if (Test-Path $tempFile) {
        Remove-Item $tempFile
        Write-Host "Archivo temporal eliminado" -ForegroundColor Yellow
    }
    
    exit 1
}
