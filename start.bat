@echo off
REM Script de inicio para ReceptionistAI (Windows)
REM Este script inicia todos los servicios necesarios con Docker

echo.
echo ========================================
echo 🚀 ReceptionistAI SaaS Multitenant
echo ========================================
echo.

REM Verificar si Docker está instalado
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker no está instalado. Por favor, instala Docker Desktop.
    pause
    exit /b 1
)

REM Verificar si Docker Compose está disponible
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose no está disponible. Por favor, instala Docker Compose.
    pause
    exit /b 1
)

echo ✅ Docker está instalado correctamente
echo.

REM Verificar si existe el archivo .env
if not exist .env (
    echo ⚠️  No se encontró el archivo .env
    echo 📝 Por favor, crea un archivo .env con tus configuraciones
    echo.
    echo Variables importantes a configurar:
    echo   - OPENAI_API_KEY
    echo   - ELEVENLABS_API_KEY
    echo   - GOOGLE_CLIENT_ID
    echo   - GOOGLE_CLIENT_SECRET
    echo   - NGROK_AUTHTOKEN
    echo.
    pause
    exit /b 1
)

echo 🐳 Construyendo e iniciando servicios con Docker Compose...
echo.

REM Detener servicios existentes (si los hay)
docker-compose down

REM Construir e iniciar servicios
docker-compose up --build -d

echo.
echo ⏳ Esperando a que los servicios estén listos...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo ✅ ¡ReceptionistAI está corriendo!
echo ========================================
echo.
echo 📊 Servicios disponibles:
echo   🌐 Frontend:     http://localhost:3000  ⭐ ¡COMIENZA AQUÍ!
echo   🔧 Backend API:  http://localhost:3001
echo   📋 N8N:          http://localhost:5678  (admin / admin123)
echo   🗄️  PostgreSQL:   localhost:5433
echo.
echo 📝 Comandos útiles:
echo   Ver logs:              docker-compose logs -f
echo   Ver logs del frontend: docker-compose logs -f frontend
echo   Ver logs del backend:  docker-compose logs -f backend
echo   Detener servicios:     docker-compose down
echo   Reiniciar:             docker-compose restart
echo.
echo 🎉 ¡Listo para usar! Abre http://localhost:3000 en tu navegador.
echo.
pause

