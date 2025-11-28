#!/bin/bash

# Script para actualizar variables de entorno después de configurar dominio
# Uso: ./actualizar-env-dominio.sh tu-dominio.com

if [ -z "$1" ]; then
    echo "❌ Error: Debes proporcionar el dominio"
    echo "Uso: ./actualizar-env-dominio.sh tu-dominio.com"
    exit 1
fi

DOMAIN=$1
API_DOMAIN="api.$DOMAIN"
PROJECT_ROOT="$HOME/receptionistAI-main"

echo "🔧 Actualizando variables de entorno para dominio: $DOMAIN"
echo ""

# Verificar que existan los archivos
if [ ! -f "$PROJECT_ROOT/api/.env" ]; then
    echo "❌ Error: No se encontró $PROJECT_ROOT/api/.env"
    exit 1
fi

if [ ! -f "$PROJECT_ROOT/app/.env.local" ]; then
    echo "❌ Error: No se encontró $PROJECT_ROOT/app/.env.local"
    exit 1
fi

# Backup de archivos
echo "📦 Creando backups..."
cp "$PROJECT_ROOT/api/.env" "$PROJECT_ROOT/api/.env.backup.$(date +%Y%m%d_%H%M%S)"
cp "$PROJECT_ROOT/app/.env.local" "$PROJECT_ROOT/app/.env.local.backup.$(date +%Y%m%d_%H%M%S)"

# Actualizar backend .env
echo "🔧 Actualizando backend/.env..."
sed -i "s|BACKEND_URL=.*|BACKEND_URL=https://$API_DOMAIN|g" "$PROJECT_ROOT/api/.env"
sed -i "s|GOOGLE_REDIRECT_URI=.*|GOOGLE_REDIRECT_URI=https://$API_DOMAIN/auth/google/callback|g" "$PROJECT_ROOT/api/.env"
sed -i "s|GOOGLE_CALENDAR_REDIRECT_URI=.*|GOOGLE_CALENDAR_REDIRECT_URI=https://$API_DOMAIN/google-calendar/auth/callback|g" "$PROJECT_ROOT/api/.env"
sed -i "s|CORS_ALLOWED_ORIGINS=.*|CORS_ALLOWED_ORIGINS=https://$DOMAIN,https://www.$DOMAIN|g" "$PROJECT_ROOT/api/.env"
sed -i "s|COOKIE_DOMAIN=.*|COOKIE_DOMAIN=$DOMAIN|g" "$PROJECT_ROOT/api/.env"
sed -i "s|COOKIE_SECURE=.*|COOKIE_SECURE=true|g" "$PROJECT_ROOT/api/.env"
sed -i "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=https://$DOMAIN|g" "$PROJECT_ROOT/api/.env"

# Actualizar frontend .env.local
echo "🔧 Actualizando app/.env.local..."
sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=https://$API_DOMAIN|g" "$PROJECT_ROOT/app/.env.local"

echo ""
echo "✅ Variables actualizadas:"
echo ""
echo "Backend:"
echo "  BACKEND_URL=https://$API_DOMAIN"
echo "  GOOGLE_REDIRECT_URI=https://$API_DOMAIN/auth/google/callback"
echo "  CORS_ALLOWED_ORIGINS=https://$DOMAIN,https://www.$DOMAIN"
echo "  COOKIE_DOMAIN=$DOMAIN"
echo "  COOKIE_SECURE=true"
echo ""
echo "Frontend:"
echo "  NEXT_PUBLIC_API_URL=https://$API_DOMAIN"
echo ""
echo "⚠️  IMPORTANTE:"
echo "1. Actualiza Google OAuth en Google Cloud Console:"
echo "   - Authorized JavaScript origins: https://$DOMAIN, https://www.$DOMAIN"
echo "   - Authorized redirect URIs: https://$API_DOMAIN/auth/google/callback"
echo ""
echo "2. Reinicia los servicios:"
echo "   sudo systemctl restart backend"
echo "   sudo systemctl restart frontend"
echo ""
echo "3. Verifica que todo funcione:"
echo "   - https://$DOMAIN"
echo "   - https://$API_DOMAIN/api"

