# Script PowerShell para diagnosticar el servidor después del deploy
param(
    [string]$ServerHost = $env:OCI_HOST,
    [string]$ServerUser = $env:OCI_USER,
    [string]$SshKey = "$env:USERPROFILE\Desktop\ssh-key-2025-11-14.key"
)

if (-not $ServerHost -or -not $ServerUser) {
    Write-Host "❌ Error: OCI_HOST y OCI_USER deben estar configurados" -ForegroundColor Red
    Write-Host "Uso: .\diagnosticar-servidor.ps1 -ServerHost 'tu-servidor' -ServerUser 'usuario'" -ForegroundColor Yellow
    exit 1
}

Write-Host "=== DIAGNÓSTICO DEL SERVIDOR ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Estado de servicios systemd:" -ForegroundColor Yellow
ssh -i $SshKey -o StrictHostKeyChecking=no ${ServerUser}@${ServerHost} "sudo systemctl status frontend.service --no-pager -l | head -20"
Write-Host ""
ssh -i $SshKey -o StrictHostKeyChecking=no ${ServerUser}@${ServerHost} "sudo systemctl status receptionistai.service --no-pager -l | head -20"
Write-Host ""

Write-Host "2. Procesos Node.js corriendo:" -ForegroundColor Yellow
ssh -i $SshKey -o StrictHostKeyChecking=no ${ServerUser}@${ServerHost} "ps aux | grep -E 'node|next' | grep -v grep"
Write-Host ""

Write-Host "3. Puertos escuchando:" -ForegroundColor Yellow
ssh -i $SshKey -o StrictHostKeyChecking=no ${ServerUser}@${ServerHost} "sudo ss -tlnp | grep -E ':3000|:3001'"
Write-Host ""

Write-Host "4. Logs recientes del frontend:" -ForegroundColor Yellow
ssh -i $SshKey -o StrictHostKeyChecking=no ${ServerUser}@${ServerHost} "sudo journalctl -u frontend.service -n 30 --no-pager"
Write-Host ""

Write-Host "5. Logs recientes del backend:" -ForegroundColor Yellow
ssh -i $SshKey -o StrictHostKeyChecking=no ${ServerUser}@${ServerHost} "sudo journalctl -u receptionistai.service -n 30 --no-pager"
Write-Host ""

Write-Host "6. Verificar que el backend responde:" -ForegroundColor Yellow
ssh -i $SshKey -o StrictHostKeyChecking=no ${ServerUser}@${ServerHost} "curl -s http://localhost:3001/api | head -20 || echo '❌ Backend no responde'"
Write-Host ""

Write-Host "7. Verificar archivos desplegados:" -ForegroundColor Yellow
ssh -i $SshKey -o StrictHostKeyChecking=no ${ServerUser}@${ServerHost} "ls -lh /home/ubuntu/receptionistAI-main/app/.next/standalone 2>/dev/null | head -5 || echo '❌ No se encuentra .next/standalone'; ls -lh /home/ubuntu/receptionistAI-main/api/dist 2>/dev/null | head -5 || echo '❌ No se encuentra api/dist'"
Write-Host ""

Write-Host "=== FIN DEL DIAGNÓSTICO ===" -ForegroundColor Cyan

