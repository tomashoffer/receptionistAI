# Script para arreglar el frontend manualmente
param(
    [string]$ServerHost = "137.131.174.209",
    [string]$ServerUser = "ubuntu",
    [string]$SshKey = "$env:USERPROFILE\Desktop\ssh-key-2025-11-14.key"
)

Write-Host "=== ARREGLANDO FRONTEND MANUALMENTE ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Deteniendo servicio frontend..." -ForegroundColor Yellow
ssh -i $SshKey -o StrictHostKeyChecking=no ${ServerUser}@${ServerHost} "sudo systemctl stop frontend.service"

Write-Host "`n2. Verificando qué hay en el servidor..." -ForegroundColor Yellow
ssh -i $SshKey -o StrictHostKeyChecking=no ${ServerUser}@${ServerHost} @"
    cd /home/ubuntu/receptionistAI-main
    
    echo '=== Estructura actual ==='
    ls -la app/ | head -10
    echo ''
    echo '=== ¿Existe .next? ==='
    ls -la app/.next/ 2>&1 | head -10 || echo 'No existe .next'
    echo ''
    echo '=== ¿Existe el tar.gz? ==='
    ls -lh /tmp/app-next.tar.gz 2>&1
"@

Write-Host "`n3. Extrayendo el tar.gz si existe..." -ForegroundColor Yellow
ssh -i $SshKey -o StrictHostKeyChecking=no ${ServerUser}@${ServerHost} @"
    set -e
    cd /home/ubuntu/receptionistAI-main
    
    if [ -f /tmp/app-next.tar.gz ]; then
        echo 'Extrayendo app-next.tar.gz...'
        # Asegurar que el directorio existe
        mkdir -p app/.next
        
        # Ver qué contiene el tar.gz
        echo 'Contenido del tar.gz (primeros 20 archivos):'
        tar -tzf /tmp/app-next.tar.gz | head -20
        
        # Extraer
        tar xzf /tmp/app-next.tar.gz -C app
        
        echo ''
        echo '=== Después de extraer ==='
        echo '¿Existe app/.next/standalone?'
        ls -la app/.next/standalone/ 2>&1 | head -10 || echo 'No existe standalone'
        
        echo ''
        echo '¿Existe server.js?'
        find app/.next -name 'server.js' -type f 2>/dev/null || echo 'No se encontró server.js'
        
        if [ -f app/.next/standalone/server.js ]; then
            echo '✅ server.js encontrado!'
            ls -lh app/.next/standalone/server.js
        else
            echo '❌ server.js NO encontrado'
            echo 'Buscando en toda la estructura:'
            find app/.next -type f -name '*.js' | head -10
        fi
    else
        echo '❌ /tmp/app-next.tar.gz no existe'
        echo 'Necesitas hacer deploy nuevamente o reconstruir el frontend'
    fi
"@

Write-Host "`n4. Si no existe standalone, necesitamos reconstruir..." -ForegroundColor Yellow
Write-Host "Ejecuta esto en el servidor si el standalone no existe:" -ForegroundColor White
Write-Host "cd /home/ubuntu/receptionistAI-main/app && npm ci --legacy-peer-deps && npm run build" -ForegroundColor Gray

Write-Host "`n5. Reiniciando servicio..." -ForegroundColor Yellow
ssh -i $SshKey -o StrictHostKeyChecking=no ${ServerUser}@${ServerHost} @"
    sudo systemctl start frontend.service
    sleep 3
    sudo systemctl status frontend.service --no-pager | head -15
"@

Write-Host "`n=== FIN ===" -ForegroundColor Cyan

