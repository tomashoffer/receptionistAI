# Script para recompilar el backend en el servidor con los cambios de Swagger
param(
    [string]$ServerHost = "137.131.174.209",
    [string]$ServerUser = "ubuntu",
    [string]$SshKey = "$env:USERPROFILE\Desktop\keys\recepcionist\ssh-key-2025-11-14.key"
)

Write-Host "=== RECOMPILANDO BACKEND EN SERVIDOR ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Haciendo pull de los últimos cambios..." -ForegroundColor Yellow
ssh -i $SshKey -o StrictHostKeyChecking=no ${ServerUser}@${ServerHost} @"
    cd /home/ubuntu/receptionistAI-main
    git pull origin main || echo '⚠️ Git pull falló, continuando con código actual...'
"@

Write-Host "`n2. Recompilando backend..." -ForegroundColor Yellow
ssh -i $SshKey -o StrictHostKeyChecking=no ${ServerUser}@${ServerHost} @"
    set -e
    cd /home/ubuntu/receptionistAI-main/api
    echo 'Instalando dependencias...'
    npm ci --legacy-peer-deps
    echo 'Compilando...'
    npm run build
    echo '✅ Compilación completada'
    ls -lh dist/main.js
"@

Write-Host "`n3. Reiniciando servicio backend..." -ForegroundColor Yellow
ssh -i $SshKey -o StrictHostKeyChecking=no ${ServerUser}@${ServerHost} @"
    sudo systemctl restart receptionistai.service
    sleep 3
    sudo systemctl status receptionistai.service --no-pager | head -15
"@

Write-Host "`n4. Verificando Swagger..." -ForegroundColor Yellow
ssh -i $SshKey -o StrictHostKeyChecking=no ${ServerUser}@${ServerHost} "curl -s http://localhost:3001/api | grep -i 'swagger\|api documentation' | head -3"

Write-Host "`n=== FIN ===" -ForegroundColor Cyan
Write-Host "`nAhora puedes acceder a Swagger en: https://apirecepcionistai.pedidosatr.com/api" -ForegroundColor Green

