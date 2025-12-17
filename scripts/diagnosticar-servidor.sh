#!/bin/bash
# Script para diagnosticar problemas en el servidor después del deploy

echo "=== DIAGNÓSTICO DEL SERVIDOR ==="
echo ""

echo "1. Estado de servicios systemd:"
echo "--------------------------------"
sudo systemctl status frontend.service --no-pager -l | head -20
echo ""
sudo systemctl status receptionistai.service --no-pager -l | head -20
echo ""

echo "2. Procesos Node.js corriendo:"
echo "------------------------------"
ps aux | grep -E "node|next" | grep -v grep
echo ""

echo "3. Puertos escuchando:"
echo "---------------------"
sudo ss -tlnp | grep -E ":3000|:3001"
echo ""

echo "4. Logs recientes del frontend:"
echo "-------------------------------"
sudo journalctl -u frontend.service -n 30 --no-pager
echo ""

echo "5. Logs recientes del backend:"
echo "-------------------------------"
sudo journalctl -u receptionistai.service -n 30 --no-pager
echo ""

echo "6. Verificar que el backend responde:"
echo "-------------------------------------"
curl -s http://localhost:3001/api | head -20 || echo "❌ Backend no responde"
echo ""

echo "7. Verificar que el frontend responde:"
echo "--------------------------------------"
curl -s http://localhost:3000 | head -20 || echo "❌ Frontend no responde"
echo ""

echo "8. Verificar archivos desplegados:"
echo "----------------------------------"
ls -lh /home/ubuntu/receptionistAI-main/app/.next/standalone 2>/dev/null | head -5 || echo "❌ No se encuentra .next/standalone"
ls -lh /home/ubuntu/receptionistAI-main/api/dist 2>/dev/null | head -5 || echo "❌ No se encuentra api/dist"
echo ""

echo "=== FIN DEL DIAGNÓSTICO ==="

