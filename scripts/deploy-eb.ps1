# Script para desplegar en Elastic Beanstalk
# Uso: .\scripts\deploy-eb.ps1 [nombre-aplicacion] [nombre-entorno]

param(
    [Parameter(Mandatory=$true)]
    [string]$ApplicationName,
    
    [Parameter(Mandatory=$true)]
    [string]$EnvironmentName
)

Write-Host "🚀 Iniciando despliegue en Elastic Beanstalk..." -ForegroundColor Yellow
Write-Host "📱 Aplicación: $ApplicationName" -ForegroundColor Cyan
Write-Host "🌍 Entorno: $EnvironmentName" -ForegroundColor Cyan

# Verificar que EB CLI esté instalado
try {
    $ebVersion = & eb --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ EB CLI encontrado: $ebVersion" -ForegroundColor Green
    } else {
        throw "EB CLI no está disponible"
    }
} catch {
    Write-Host "❌ Error: EB CLI no está instalado" -ForegroundColor Red
    Write-Host "💡 Instala EB CLI:" -ForegroundColor Yellow
    Write-Host "   pip install awsebcli" -ForegroundColor White
    Write-Host "   O desde: https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html" -ForegroundColor White
    exit 1
}

# Verificar que estés en el directorio correcto
if (!(Test-Path ".ebextensions")) {
    Write-Host "❌ Error: No estás en el directorio raíz del proyecto" -ForegroundColor Red
    Write-Host "💡 Navega al directorio del proyecto y ejecuta el script desde ahí" -ForegroundColor Yellow
    exit 1
}

# Verificar que el archivo .env esté configurado
if (!(Test-Path ".env")) {
    Write-Host "⚠️ Advertencia: Archivo .env no encontrado" -ForegroundColor Yellow
    Write-Host "💡 Crea el archivo .env basado en env.example" -ForegroundColor Cyan
    Write-Host "   copy env.example .env" -ForegroundColor White
    Write-Host "   notepad .env" -ForegroundColor White
    Write-Host ""
    $continue = Read-Host "¿Continuar con el despliegue? (s/n)"
    if ($continue -ne "s" -and $continue -ne "S") {
        exit 0
    }
}

# Verificar que la base de datos esté configurada
Write-Host ""
Write-Host "🔍 Verificando configuración de la base de datos..." -ForegroundColor Yellow

if ($env:DATABASE_HOST -and $env:DATABASE_HOST -ne "localhost") {
    Write-Host "✅ Base de datos configurada: $env:DATABASE_HOST" -ForegroundColor Green
} else {
    Write-Host "⚠️ Advertencia: Base de datos no configurada para producción" -ForegroundColor Yellow
    Write-Host "💡 Configura las variables de entorno de RDS antes del despliegue" -ForegroundColor Cyan
    Write-Host ""
    $continue = Read-Host "¿Continuar con el despliegue? (s/n)"
    if ($continue -ne "s" -and $continue -ne "S") {
        exit 0
    }
}

# Construir la aplicación
Write-Host ""
Write-Host "🔨 Construyendo la aplicación..." -ForegroundColor Yellow
& npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al construir la aplicación" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Aplicación construida exitosamente" -ForegroundColor Green

# Verificar si ya existe la aplicación
Write-Host ""
Write-Host "🔍 Verificando si la aplicación existe..." -ForegroundColor Yellow

$appExists = & eb list --application-name $ApplicationName 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Aplicación $ApplicationName encontrada" -ForegroundColor Green
} else {
    Write-Host "📱 Creando nueva aplicación..." -ForegroundColor Yellow
    & eb init $ApplicationName --platform node.js --region us-east-1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al crear la aplicación" -ForegroundColor Red
        exit 1
    }
}

# Verificar si ya existe el entorno
Write-Host ""
Write-Host "🔍 Verificando si el entorno existe..." -ForegroundColor Yellow

$envExists = & eb list --environment-name $EnvironmentName 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Entorno $EnvironmentName encontrado" -ForegroundColor Green
    Write-Host "🔄 Actualizando entorno existente..." -ForegroundColor Yellow
    & eb deploy $EnvironmentName
} else {
    Write-Host "🌍 Creando nuevo entorno..." -ForegroundColor Yellow
    & eb create $EnvironmentName --instance-type t3.small --single-instance
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en el despliegue" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Despliegue completado exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Verifica el estado del entorno: eb status $EnvironmentName" -ForegroundColor White
Write-Host "2. Abre la aplicación: eb open $EnvironmentName" -ForegroundColor White
Write-Host "3. Verifica los logs: eb logs $EnvironmentName" -ForegroundColor White
Write-Host "4. Configura el dominio personalizado si es necesario" -ForegroundColor White

# Mostrar información del entorno
Write-Host ""
Write-Host "🔍 Información del entorno:" -ForegroundColor Cyan
& eb status $EnvironmentName

