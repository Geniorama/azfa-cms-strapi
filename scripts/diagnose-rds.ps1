# Script para diagnosticar problemas de conectividad con RDS
# Uso: .\scripts\diagnose-rds.ps1

Write-Host "Diagnosticando conectividad con RDS..." -ForegroundColor Yellow

# Verificar variables de entorno
Write-Host ""
Write-Host "=== VERIFICANDO VARIABLES DE ENTORNO ===" -ForegroundColor Cyan

$RDS_HOST = $env:RDS_HOST
$RDS_PORT = $env:RDS_PORT
$RDS_NAME = $env:RDS_NAME
$RDS_USER = $env:RDS_USER
$RDS_PASSWORD = $env:RDS_PASSWORD

Write-Host "RDS_HOST: $RDS_HOST" -ForegroundColor White
Write-Host "RDS_PORT: $RDS_PORT" -ForegroundColor White
Write-Host "RDS_NAME: $RDS_NAME" -ForegroundColor White
Write-Host "RDS_USER: $RDS_USER" -ForegroundColor White
Write-Host "RDS_PASSWORD: $([string]::IsNullOrEmpty($RDS_PASSWORD) ? 'NO CONFIGURADA' : 'CONFIGURADA')" -ForegroundColor White

# Verificar que todas las variables estén configuradas
if (!$RDS_HOST -or !$RDS_PORT -or !$RDS_NAME -or !$RDS_USER -or !$RDS_PASSWORD) {
    Write-Host ""
    Write-Host "❌ Error: Faltan variables de entorno de RDS" -ForegroundColor Red
    Write-Host "Ejecuta primero: .\scripts\setup-env.ps1" -ForegroundColor Yellow
    exit 1
}

# Probar conectividad de red
Write-Host ""
Write-Host "=== PROBANDO CONECTIVIDAD DE RED ===" -ForegroundColor Cyan

try {
    Write-Host "Probando conexión al puerto 5432..." -ForegroundColor Yellow
    $connection = Test-NetConnection -ComputerName $RDS_HOST -Port $RDS_PORT -InformationLevel Quiet
    
    if ($connection) {
        Write-Host "✅ Puerto 5432 está abierto y accesible" -ForegroundColor Green
    } else {
        Write-Host "❌ Puerto 5432 no está accesible" -ForegroundColor Red
        Write-Host "💡 Verifica:" -ForegroundColor Yellow
        Write-Host "   - Grupo de seguridad de AWS RDS" -ForegroundColor White
        Write-Host "   - Firewall local" -ForegroundColor White
        Write-Host "   - Restricciones de red" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Error al probar conectividad: $($_.Exception.Message)" -ForegroundColor Red
}

# Probar resolución DNS
Write-Host ""
Write-Host "=== PROBANDO RESOLUCIÓN DNS ===" -ForegroundColor Cyan

try {
    Write-Host "Resolviendo nombre de host..." -ForegroundColor Yellow
    $ipAddress = [System.Net.Dns]::GetHostAddresses($RDS_HOST)
    Write-Host "✅ Host resuelto a: $($ipAddress.IPAddressToString)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al resolver DNS: $($_.Exception.Message)" -ForegroundColor Red
}

# Probar conexión PostgreSQL
Write-Host ""
Write-Host "=== PROBANDO CONEXIÓN POSTGRESQL ===" -ForegroundColor Cyan

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

# Probar conexión a postgres
Write-Host ""
Write-Host "Probando conexión a postgres..." -ForegroundColor Yellow

$env:PGPASSWORD = $RDS_PASSWORD
$result = & psql -h $RDS_HOST -p $RDS_PORT -U $RDS_USER -d postgres -c "SELECT version();" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Conexión a postgres exitosa" -ForegroundColor Green
    Write-Host "📋 Información del servidor:" -ForegroundColor Cyan
    $result | ForEach-Object { Write-Host "   $_" -ForegroundColor White }
} else {
    Write-Host "❌ Error al conectar a postgres" -ForegroundColor Red
    Write-Host "💡 Detalles del error:" -ForegroundColor Yellow
    $result | ForEach-Object { Write-Host "   $_" -ForegroundColor White }
    
    Write-Host ""
    Write-Host "🔍 Posibles soluciones:" -ForegroundColor Cyan
    Write-Host "1. Verifica las credenciales en AWS RDS" -ForegroundColor White
    Write-Host "2. Verifica el grupo de seguridad permite tu IP" -ForegroundColor White
    Write-Host "3. Verifica que la instancia esté en estado 'Available'" -ForegroundColor White
    Write-Host "4. Verifica que no haya restricciones de red" -ForegroundColor White
}

Write-Host ""
Write-Host "=== DIAGNÓSTICO COMPLETADO ===" -ForegroundColor Green



