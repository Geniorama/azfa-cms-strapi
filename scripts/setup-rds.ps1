# Script de PowerShell para configurar la base de datos en RDS desde cero
# Uso: .\scripts\setup-rds.ps1

# Configuración de RDS (cambiar según tu configuración)
$RDS_HOST = if ($env:RDS_HOST) { $env:RDS_HOST } else { "tu-instancia-rds.region.rds.amazonaws.com" }
$RDS_PORT = if ($env:RDS_PORT) { $env:RDS_PORT } else { "5432" }
$RDS_NAME = if ($env:RDS_NAME) { $env:RDS_NAME } else { "strapi" }
$RDS_USER = if ($env:RDS_USER) { $env:RDS_USER } else { "strapi" }
$RDS_PASSWORD = if ($env:RDS_PASSWORD) { $env:RDS_PASSWORD } else { "" }

Write-Host "🚀 Configurando base de datos en RDS..." -ForegroundColor Yellow
Write-Host "📊 RDS: $RDS_NAME en $RDS_HOST`:$RDS_PORT" -ForegroundColor Cyan

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

# Crear base de datos
Write-Host "🔧 Creando base de datos $RDS_NAME..." -ForegroundColor Yellow
& psql -h $RDS_HOST -p $RDS_PORT -U $RDS_USER -d postgres -c "CREATE DATABASE $RDS_NAME;" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Base de datos creada" -ForegroundColor Green
} else {
    Write-Host "ℹ️ Base de datos ya existe" -ForegroundColor Yellow
}

# Verificar que la base de datos existe
Write-Host "🔍 Verificando que la base de datos existe..." -ForegroundColor Yellow
& psql -h $RDS_HOST -p $RDS_PORT -U $RDS_USER -d $RDS_NAME -c "SELECT current_database();" 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Base de datos $RDS_NAME configurada correctamente" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
    Write-Host "1. Actualiza las variables de entorno con las credenciales de RDS" -ForegroundColor White
    Write-Host "2. Ejecuta 'npm run build' para compilar Strapi" -ForegroundColor White
    Write-Host "3. Ejecuta 'npm run start' para iniciar con la nueva base de datos" -ForegroundColor White
    
    Write-Host ""
    Write-Host "🔧 Variables de entorno necesarias:" -ForegroundColor Cyan
    Write-Host "DATABASE_HOST=$RDS_HOST" -ForegroundColor White
    Write-Host "DATABASE_PORT=$RDS_PORT" -ForegroundColor White
    Write-Host "DATABASE_NAME=$RDS_NAME" -ForegroundColor White
    Write-Host "DATABASE_USERNAME=$RDS_USER" -ForegroundColor White
    Write-Host "DATABASE_PASSWORD=[tu-contraseña]" -ForegroundColor White
    Write-Host "DATABASE_SSL=true" -ForegroundColor White
    
    Write-Host ""
    Write-Host "💡 Para crear el archivo .env:" -ForegroundColor Yellow
    Write-Host "   copy env.example .env" -ForegroundColor White
    Write-Host "   notepad .env" -ForegroundColor White
} else {
    Write-Host "❌ Error al configurar la base de datos" -ForegroundColor Red
    exit 1
}

