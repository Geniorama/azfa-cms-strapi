# Script para probar la conectividad a RDS
# Uso: .\scripts\test-connection.ps1

Write-Host "🔍 Probando conectividad a RDS..." -ForegroundColor Yellow

# Verificar si psql está disponible
try {
    $psqlVersion = & psql --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ psql encontrado: $psqlVersion" -ForegroundColor Green
    } else {
        throw "psql no está disponible"
    }
} catch {
    Write-Host "❌ Error: psql no está instalado" -ForegroundColor Red
    Write-Host "💡 Instala PostgreSQL client: winget install PostgreSQL.PostgreSQL" -ForegroundColor Yellow
    exit 1
}

# Configuración de RDS desde variables de entorno
$RDS_HOST = $env:RDS_HOST
$RDS_PORT = $env:RDS_PORT
$RDS_NAME = $env:RDS_NAME
$RDS_USER = $env:RDS_USER
$RDS_PASSWORD = $env:RDS_PASSWORD

# Verificar que las variables estén configuradas
if (!$RDS_HOST -or !$RDS_USER -or !$RDS_PASSWORD) {
    Write-Host "❌ Error: Variables de entorno no configuradas" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Configura las variables de entorno:" -ForegroundColor Cyan
    Write-Host "   `$env:RDS_HOST = 'tu-endpoint-rds'" -ForegroundColor White
    Write-Host "   `$env:RDS_PORT = '5432'" -ForegroundColor White
    Write-Host "   `$env:RDS_NAME = 'strapi'" -ForegroundColor White
    Write-Host "   `$env:RDS_USER = 'tu-usuario'" -ForegroundColor White
    Write-Host "   `$env:RDS_PASSWORD = 'tu-contraseña'" -ForegroundColor White
    exit 1
}

Write-Host "📊 Configuración detectada:" -ForegroundColor Cyan
Write-Host "   Host: $RDS_HOST" -ForegroundColor White
Write-Host "   Puerto: $RDS_PORT" -ForegroundColor White
Write-Host "   Base de datos: $RDS_NAME" -ForegroundColor White
Write-Host "   Usuario: $RDS_USER" -ForegroundColor White

# Probar conexión a postgres (base de datos del sistema)
Write-Host ""
Write-Host "🔌 Probando conexión a postgres..." -ForegroundColor Yellow

$env:PGPASSWORD = $RDS_PASSWORD
$result = & psql -h $RDS_HOST -p $RDS_PORT -U $RDS_USER -d postgres -c "SELECT version();" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Conexión a postgres exitosa" -ForegroundColor Green
    Write-Host "📋 Información del servidor:" -ForegroundColor Cyan
    $result | ForEach-Object { Write-Host "   $_" -ForegroundColor White }
} else {
    Write-Host "❌ Error al conectar a postgres" -ForegroundColor Red
    Write-Host "💡 Verifica:" -ForegroundColor Yellow
    Write-Host "   - Credenciales correctas" -ForegroundColor White
    Write-Host "   - Grupo de seguridad de AWS" -ForegroundColor White
    Write-Host "   - Endpoint correcto" -ForegroundColor White
    exit 1
}

# Probar conexión a la base de datos específica
Write-Host ""
Write-Host "🔌 Probando conexión a $RDS_NAME..." -ForegroundColor Yellow

$result = & psql -h $RDS_HOST -p $RDS_PORT -U $RDS_USER -d $RDS_NAME -c "SELECT current_database();" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Conexión a $RDS_NAME exitosa" -ForegroundColor Green
    
    # Listar tablas si existen
    Write-Host ""
    Write-Host "📋 Tablas en la base de datos:" -ForegroundColor Cyan
    $tables = & psql -h $RDS_HOST -p $RDS_PORT -U $RDS_USER -d $RDS_NAME -c "\dt" 2>&1
    if ($LASTEXITCODE -eq 0) {
        $tables | ForEach-Object { Write-Host "   $_" -ForegroundColor White }
    } else {
        Write-Host "   No hay tablas o error al listarlas" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️ No se puede conectar a $RDS_NAME" -ForegroundColor Yellow
    Write-Host "💡 La base de datos puede no existir aún" -ForegroundColor Cyan
    Write-Host "   Ejecuta: .\scripts\setup-rds.ps1" -ForegroundColor White
}

Write-Host ""
Write-Host "🎉 Prueba de conectividad completada" -ForegroundColor Green



