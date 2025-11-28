# Script para hacer build del backend localmente y subirlo a Oracle
# Uso: .\scripts\deploy-backend.ps1

$ErrorActionPreference = "Stop"

# Configuracion
$SSH_HOST = "137.131.174.209"
$SSH_USER = "ubuntu"
$SSH_KEY = "$env:USERPROFILE\Desktop\ssh-key-2025-11-14.key"
$PROJECT_PATH = "~/receptionistAI-main"
$BACKEND_SERVICE = "receptionistai.service"

Write-Host "Iniciando deploy del backend..." -ForegroundColor Cyan
Write-Host ""

# Paso 1: Verificar que estamos en el directorio correcto
if (-not (Test-Path "api\package.json")) {
    Write-Host "Error: No se encontro api\package.json" -ForegroundColor Red
    Write-Host "   Asegurate de ejecutar este script desde la raiz del proyecto" -ForegroundColor Yellow
    exit 1
}

# Paso 2: Verificar que existe la clave SSH
if (-not (Test-Path $SSH_KEY)) {
    Write-Host "Error: No se encontro la clave SSH en: $SSH_KEY" -ForegroundColor Red
    Write-Host "   Por favor, verifica la ruta de la clave SSH" -ForegroundColor Yellow
    exit 1
}

# Paso 3: Build del backend
Write-Host "Compilando backend..." -ForegroundColor Cyan
Set-Location api

try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Build fallo con codigo $LASTEXITCODE"
    }
    Write-Host "Build completado" -ForegroundColor Green
} catch {
    Write-Host "Error al compilar: $_" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Paso 4: Crear archivo tar.gz
Write-Host "Creando archivo comprimido..." -ForegroundColor Cyan
Set-Location ..

# Limpiar archivo anterior si existe
if (Test-Path "api-dist.tar.gz") {
    Remove-Item "api-dist.tar.gz" -Force
}

# Crear tar.gz
try {
    tar -czf api-dist.tar.gz -C api dist
    if ($LASTEXITCODE -ne 0) {
        throw "Error al crear tar.gz"
    }
    Write-Host "Archivo api-dist.tar.gz creado" -ForegroundColor Green
} catch {
    Write-Host "Error al crear tar.gz: $_" -ForegroundColor Red
    Write-Host "   Asegurate de tener tar instalado (Windows 10+ lo incluye)" -ForegroundColor Yellow
    exit 1
}

# Paso 5: Subir archivo a Oracle
Write-Host "Subiendo archivo a Oracle..." -ForegroundColor Cyan
try {
    $scpTarget = $SSH_USER + "@" + $SSH_HOST + ":/tmp/"
    & scp -i $SSH_KEY api-dist.tar.gz $scpTarget
    if ($LASTEXITCODE -ne 0) {
        throw "Error al subir archivo"
    }
    Write-Host "Archivo subido correctamente" -ForegroundColor Green
} catch {
    Write-Host "Error al subir archivo: $_" -ForegroundColor Red
    exit 1
}

# Paso 6: Extraer y reiniciar servicio en Oracle
Write-Host "Desplegando y reiniciando servicio..." -ForegroundColor Cyan
try {
    $sshTarget = $SSH_USER + "@" + $SSH_HOST
    $separator = ' && '
    $cmd1 = 'cd ' + $PROJECT_PATH
    $cmd2 = 'tar xzf /tmp/api-dist.tar.gz -C api'
    $cmd3 = 'rm /tmp/api-dist.tar.gz'
    $cmd4 = 'sudo systemctl restart ' + $BACKEND_SERVICE
    $fullCommand = $cmd1 + $separator + $cmd2 + $separator + $cmd3 + $separator + $cmd4
    
    & ssh -i $SSH_KEY $sshTarget $fullCommand
    
    if ($LASTEXITCODE -ne 0) {
        throw 'Error al desplegar'
    }
    Write-Host "Deploy completado" -ForegroundColor Green
} catch {
    Write-Host "Error al desplegar: $_" -ForegroundColor Red
    exit 1
}

# Paso 7: Limpiar archivo local
Write-Host "Limpiando archivo local..." -ForegroundColor Cyan
Remove-Item "api-dist.tar.gz" -Force
Write-Host "Archivo local eliminado" -ForegroundColor Green

Write-Host ""
Write-Host "Deploy completado exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "Verifica el estado del servicio:" -ForegroundColor Cyan
$verifyCmd = 'ssh -i ' + $SSH_KEY + ' ' + $sshTarget + ' sudo systemctl status ' + $BACKEND_SERVICE
Write-Host ('  ' + $verifyCmd) -ForegroundColor Yellow
Write-Host ""
