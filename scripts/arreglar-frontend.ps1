# Script para arreglar el frontend después del deploy
param(
    [string]$ServerHost = "137.131.174.209",
    [string]$ServerUser = "ubuntu",
    [string]$SshKey = "$env:USERPROFILE\Desktop\ssh-key-2025-11-14.key"
)

Write-Host "=== DIAGNÓSTICO Y ARREGLO DEL FRONTEND ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Verificando qué hay en el servidor..." -ForegroundColor Yellow
ssh -i $SshKey -o StrictHostKeyChecking=no ${ServerUser}@${ServerHost} @"
    echo '=== Estructura de directorios ==='
    ls -la /home/ubuntu/receptionistAI-main/app/ | head -20
    echo ''
    echo '=== ¿Existe .next? ==='
    ls -la /home/ubuntu/receptionistAI-main/app/.next/ 2>&1 | head -10
    echo ''
    echo '=== ¿Existe standalone? ==='
    ls -la /home/ubuntu/receptionistAI-main/app/.next/standalone/ 2>&1 | head -10
    echo ''
    echo '=== Archivos en /tmp ==='
    ls -lh /tmp/*.tar.gz 2>&1
"@

Write-Host "`n2. Verificando el servicio systemd..." -ForegroundColor Yellow
ssh -i $SshKey -o StrictHostKeyChecking=no ${ServerUser}@${ServerHost} "cat /etc/systemd/system/frontend.service"

Write-Host "`n3. Verificando si hay archivos para extraer..." -ForegroundColor Yellow
ssh -i $SshKey -o StrictHostKeyChecking=no ${ServerUser}@${ServerHost} @"
    if [ -f /tmp/app-next.tar.gz ]; then
        echo '✅ app-next.tar.gz existe'
        echo 'Tamaño:'
        ls -lh /tmp/app-next.tar.gz
        echo ''
        echo 'Contenido del tar.gz:'
        tar -tzf /tmp/app-next.tar.gz | head -20
    else
        echo '❌ app-next.tar.gz NO existe en /tmp'
    fi
"@

Write-Host "`n4. Intentando arreglar..." -ForegroundColor Yellow
ssh -i $SshKey -o StrictHostKeyChecking=no ${ServerUser}@${ServerHost} @"
    set -e
    cd /home/ubuntu/receptionistAI-main
    
    # Detener el servicio
    sudo systemctl stop frontend.service
    
    # Si existe el tar.gz, extraerlo
    if [ -f /tmp/app-next.tar.gz ]; then
        echo 'Extrayendo app-next.tar.gz...'
        # Asegurar que el directorio existe
        mkdir -p app/.next
        # Extraer
        tar xzf /tmp/app-next.tar.gz -C app/.next
        echo '✅ Extracción completada'
        
        # Verificar que se extrajo correctamente
        if [ -f app/.next/standalone/server.js ]; then
            echo '✅ server.js encontrado'
            ls -lh app/.next/standalone/server.js
        else
            echo '❌ server.js NO encontrado después de extraer'
            echo 'Estructura de .next después de extraer:'
            find app/.next -name 'server.js' 2>/dev/null || echo 'No se encontró server.js'
        fi
    else
        echo '❌ No hay archivo para extraer. Necesitas hacer deploy nuevamente.'
    fi
    
    # Reiniciar servicio
    sudo systemctl start frontend.service
    sleep 3
    sudo systemctl status frontend.service --no-pager | head -15
"@

Write-Host "`n=== FIN ===" -ForegroundColor Cyan

