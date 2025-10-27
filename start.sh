#!/bin/bash

# Script de inicio para ReceptionistAI
# Este script inicia todos los servicios necesarios con Docker

echo "🚀 Iniciando ReceptionistAI SaaS Multitenant..."
echo ""

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor, instala Docker y Docker Compose."
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor, instala Docker Compose."
    exit 1
fi

# Verificar si existe el archivo .env
if [ ! -f .env ]; then
    echo "⚠️  No se encontró el archivo .env"
    echo "📝 Creando archivo .env desde .env.example..."
    
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Archivo .env creado. Por favor, edita .env con tus valores reales."
        echo ""
        echo "Variables importantes a configurar:"
        echo "  - OPENAI_API_KEY"
        echo "  - ELEVENLABS_API_KEY"
        echo "  - GOOGLE_CLIENT_ID"
        echo "  - GOOGLE_CLIENT_SECRET"
        echo "  - NGROK_AUTHTOKEN"
        echo ""
        read -p "Presiona Enter cuando hayas configurado el archivo .env..."
    else
        echo "❌ No se encontró .env.example. Por favor, crea un archivo .env manualmente."
        exit 1
    fi
fi

echo "🐳 Construyendo e iniciando servicios con Docker Compose..."
echo ""

# Detener servicios existentes (si los hay)
docker-compose down

# Construir e iniciar servicios
docker-compose up --build -d

echo ""
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

echo ""
echo "✅ ¡ReceptionistAI está corriendo!"
echo ""
echo "📊 Servicios disponibles:"
echo "  🌐 Frontend:     http://localhost:3000  ⭐ ¡COMIENZA AQUÍ!"
echo "  🔧 Backend API:  http://localhost:3001"
echo "  📋 N8N:          http://localhost:5678  (admin / admin123)"
echo "  🗄️  PostgreSQL:   localhost:5433"
echo ""
echo "📝 Comandos útiles:"
echo "  Ver logs:              docker-compose logs -f"
echo "  Ver logs del frontend: docker-compose logs -f frontend"
echo "  Ver logs del backend:  docker-compose logs -f backend"
echo "  Detener servicios:     docker-compose down"
echo "  Reiniciar:             docker-compose restart"
echo ""
echo "🎉 ¡Listo para usar! Abre http://localhost:3000 en tu navegador."
echo ""

