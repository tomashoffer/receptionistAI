# Script para arreglar problemas comunes después del deploy
param(
    [string]$ServerHost = $env:OCI_HOST,
    [string]$ServerUser = $env:OCI_USER,
    [string]$SshKey = "$env:USERPROFILE\Desktop\ssh-key-2025-11-14.key"
)

Write-Host "=== ARREGLANDO SERVIDOR ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Verificando estado de servicios..." -ForegroundColor Yellow
ssh -i $SshKey -o StrictHostKeyChecking=no ${ServerUser}@${ServerHost} "echo 'Estado del backend:'; sudo systemctl status receptionistai.service --no-pager | head -5; echo ''; echo 'Estado del frontend:'; sudo systemctl status frontend.service --no-pager | head -5"

Write-Host "`n2. Reiniciando backend (para aplicar cambios de Swagger)..." -ForegroundColor Yellow
ssh -i $SshKey -o StrictHostKeyChecking=no ${ServerUser}@${ServerHost} "sudo systemctl restart receptionistai.service && sleep 3 && sudo systemctl status receptionistai.service --no-pager | head -10"

Write-Host "`n3. Reiniciando frontend..." -ForegroundColor Yellow
ssh -i $SshKey -o StrictHostKeyChecking=no ${ServerUser}@${ServerHost} "sudo systemctl restart frontend.service && sleep 3 && sudo systemctl status frontend.service --no-pager | head -10"

Write-Host "`n4. Verificando que los servicios responden..." -ForegroundColor Yellow
Write-Host "Backend (puerto 3001):"
ssh -i $SshKey -o StrictHostKeyChecking=no ${ServerUser}@${ServerHost} "curl -s http://localhost:3001/api | head -5 || echo '❌ Backend no responde'"

Write-Host "`nFrontend (puerto 3000):"
ssh -i $SshKey -o StrictHostKeyChecking=no ${ServerUser}@${ServerHost} "curl -s http://localhost:3000 | head -5 || echo '❌ Frontend no responde'"

Write-Host "`n5. Verificando Swagger..." -ForegroundColor Yellow
ssh -i $SshKey -o StrictHostKeyChecking=no ${ServerUser}@${ServerHost} "curl -s http://localhost:3001/api | grep -i swagger || echo '⚠️ Swagger puede no estar disponible'"

Write-Host "`n=== FIN ===" -ForegroundColor Cyan
Write-Host "`nSi el frontend sigue sin funcionar, revisa los logs con:" -ForegroundColor Yellow
Write-Host "ssh -i $SshKey ${ServerUser}@${ServerHost} 'sudo journalctl -u frontend.service -n 50 --no-pager'" -ForegroundColor White

