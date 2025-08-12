# Script para limpiar la codificación del archivo de backup
# Uso: .\scripts\fix-backup-encoding.ps1 [archivo_backup.sql]

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile
)

Write-Host "🔧 Limpiando codificación del archivo de backup..." -ForegroundColor Yellow
Write-Host "📁 Archivo: $BackupFile" -ForegroundColor Cyan

# Verificar si el archivo existe
if (!(Test-Path $BackupFile)) {
    Write-Host "❌ Error: El archivo $BackupFile no existe" -ForegroundColor Red
    exit 1
}

# Crear nombre del archivo limpio
$BackupDir = Split-Path $BackupFile -Parent
$BackupName = Split-Path $BackupFile -Leaf
$CleanBackupFile = Join-Path $BackupDir "clean_$BackupName"

Write-Host "📝 Creando archivo limpio: $CleanBackupFile" -ForegroundColor Yellow

try {
    # Leer el archivo y eliminar BOM
    $content = Get-Content $BackupFile -Raw -Encoding UTF8
    
    # Eliminar caracteres BOM y otros caracteres problemáticos
    $cleanContent = $content -replace '^\uFEFF', '' -replace '^\uFFFE', '' -replace '^\u200B', ''
    
    # Escribir el contenido limpio
    [System.IO.File]::WriteAllText($CleanBackupFile, $cleanContent, [System.Text.Encoding]::UTF8)
    
    Write-Host "✅ Archivo limpio creado exitosamente!" -ForegroundColor Green
    Write-Host "📁 Archivo original: $BackupFile" -ForegroundColor White
    Write-Host "📁 Archivo limpio: $CleanBackupFile" -ForegroundColor Green
    
    # Mostrar información del archivo
    $originalSize = (Get-Item $BackupFile).Length
    $cleanSize = (Get-Item $CleanBackupFile).Length
    
    Write-Host ""
    Write-Host "📊 Información del archivo:" -ForegroundColor Cyan
    Write-Host "   Original: $([math]::Round($originalSize / 1KB, 2)) KB" -ForegroundColor White
    Write-Host "   Limpio: $([math]::Round($cleanSize / 1KB, 2)) KB" -ForegroundColor White
    
    Write-Host ""
    Write-Host "🚀 Ahora puedes restaurar usando:" -ForegroundColor Cyan
    Write-Host "   .\scripts\restore-database.ps1 $CleanBackupFile" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error al limpiar el archivo: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
