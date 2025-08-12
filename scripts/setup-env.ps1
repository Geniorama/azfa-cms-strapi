# Script para configurar variables de entorno para migración
# Uso: .\scripts\setup-env.ps1

Write-Host "Configurando variables de entorno para migracion..." -ForegroundColor Yellow

# Solicitar información de la base de datos origen
Write-Host ""
Write-Host "=== CONFIGURACION DE BASE DE DATOS ORIGEN ===" -ForegroundColor Cyan

$env:DATABASE_HOST = Read-Host "Host de la base de datos origen (default: localhost)"
if ([string]::IsNullOrEmpty($env:DATABASE_HOST)) { $env:DATABASE_HOST = "localhost" }

$env:DATABASE_PORT = Read-Host "Puerto de la base de datos origen (default: 5432)"
if ([string]::IsNullOrEmpty($env:DATABASE_PORT)) { $env:DATABASE_PORT = "5432" }

$env:DATABASE_NAME = Read-Host "Nombre de la base de datos origen (default: strapi)"
if ([string]::IsNullOrEmpty($env:DATABASE_NAME)) { $env:DATABASE_NAME = "strapi" }

$env:DATABASE_USERNAME = Read-Host "Usuario de la base de datos origen (default: strapi)"
if ([string]::IsNullOrEmpty($env:DATABASE_USERNAME)) { $env:DATABASE_USERNAME = "strapi" }

$env:DATABASE_PASSWORD = Read-Host "Contraseña de la base de datos origen" -AsSecureString
$env:DATABASE_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($env:DATABASE_PASSWORD))

# Solicitar información de RDS
Write-Host ""
Write-Host "=== CONFIGURACION DE RDS ===" -ForegroundColor Cyan

$env:RDS_HOST = Read-Host "Host de RDS (ej: satrapi-azfa.cmhyaki@cdsg.us-east-1.rds.amazonaws.com)"
$env:RDS_PORT = Read-Host "Puerto de RDS (default: 5432)"
if ([string]::IsNullOrEmpty($env:RDS_PORT)) { $env:RDS_PORT = "5432" }

$env:RDS_NAME = Read-Host "Nombre de la base de datos en RDS (default: satrapi-azfa)"
if ([string]::IsNullOrEmpty($env:RDS_NAME)) { $env:RDS_NAME = "satrapi-azfa" }

$env:RDS_USER = Read-Host "Usuario de RDS (default: strapi_admin)"
if ([string]::IsNullOrEmpty($env:RDS_USER)) { $env:RDS_USER = "strapi_admin" }

$env:RDS_PASSWORD = Read-Host "Contraseña de RDS" -AsSecureString
$env:RDS_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($env:RDS_PASSWORD))

# Mostrar configuración
Write-Host ""
Write-Host "=== CONFIGURACION COMPLETADA ===" -ForegroundColor Green
Write-Host "Origen: $env:DATABASE_NAME en $env:DATABASE_HOST`:$env:DATABASE_PORT" -ForegroundColor White
Write-Host "Destino: $env:RDS_NAME en $env:RDS_HOST`:$env:RDS_PORT" -ForegroundColor White

# Preguntar si quiere ejecutar la migración
Write-Host ""
$continuar = Read-Host "¿Quieres ejecutar la migración ahora? (s/n)"
if ($continuar -eq "s" -or $continuar -eq "S") {
    Write-Host "Ejecutando migracion..." -ForegroundColor Yellow
    .\scripts\direct-migrate.ps1
} else {
    Write-Host ""
    Write-Host "Variables configuradas. Para ejecutar la migración:" -ForegroundColor Cyan
    Write-Host "   .\scripts\direct-migrate.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "Para ver las variables configuradas:" -ForegroundColor Cyan
    Write-Host "   Get-ChildItem Env: | Where-Object { `$_.Name -like '*DATABASE*' -or `$_.Name -like '*RDS*' }" -ForegroundColor White
}

