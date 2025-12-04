# Configuración Docker - Sistema de Contactos

## Pasos para ejecutar las migraciones en Docker

### Opción 1: Ejecutar migración en el contenedor (recomendado para dev)

```bash
# Ver contenedores corriendo
docker ps

# Ejecutar migración dentro del contenedor backend
docker exec -it receptionistai-backend npm run migration:run

# Verificar que las tablas se crearon
docker exec -it receptionistai-postgres psql -U postgres -d receptionistai -c "\dt"

# Deberías ver:
# - contacts
# - tags
# - contact_tags
```

### Opción 2: Rebuild del contenedor con migraciones automáticas

Actualizar `api/Dockerfile.dev` para ejecutar migraciones automáticamente al iniciar:

```dockerfile
# ... (resto del Dockerfile)

# Comando para ejecutar la aplicación
CMD ["sh", "-c", "npm run migration:run && npm run start:dev"]
```

Luego rebuild:
```bash
docker-compose down
docker-compose build backend
docker-compose up -d
```

### Opción 3: Crear script helper

Crear `scripts/migrate-docker.sh`:

```bash
#!/bin/bash
echo "🚀 Ejecutando migraciones en Docker..."
docker exec -it receptionistai-backend npm run migration:run
echo "✅ Migraciones completadas"
echo ""
echo "📋 Verificando tablas creadas:"
docker exec -it receptionistai-postgres psql -U postgres -d receptionistai -c "\dt" | grep -E "contacts|tags"
```

Ejecutar:
```bash
chmod +x scripts/migrate-docker.sh
./scripts/migrate-docker.sh
```

### Opción 4: PowerShell para Windows

```powershell
# Ejecutar migración
docker exec -it receptionistai-backend npm run migration:run

# Verificar tablas
docker exec -it receptionistai-postgres psql -U postgres -d receptionistai -c "\dt"
```

## Instalación de dependencia xlsx

La librería `xlsx` se instalará automáticamente cuando reconstruyas el contenedor:

```bash
docker-compose down
docker-compose build backend
docker-compose up -d
```

O manualmente dentro del contenedor:

```bash
docker exec -it receptionistai-backend npm install
```

## Verificación Post-Migración

### 1. Verificar tablas en PostgreSQL:

```bash
docker exec -it receptionistai-postgres psql -U postgres -d receptionistai
```

En el prompt de psql:
```sql
-- Ver todas las tablas
\dt

-- Ver estructura de contacts
\d contacts

-- Ver estructura de tags
\d tags

-- Ver estructura de contact_tags
\d contact_tags

-- Salir
\q
```

### 2. Verificar logs del backend:

```bash
docker logs receptionistai-backend -f
```

Deberías ver:
```
✅ Tablas contacts, tags y contact_tags creadas exitosamente
[Nest] ... - Mapped {/contacts, GET} route
[Nest] ... - Mapped {/tags, GET} route
```

### 3. Test de endpoints:

```bash
# Test desde tu máquina local
curl http://localhost:3001/contacts?business_id=TU_BUSINESS_ID

# Debería retornar:
# { "data": [], "total": 0, "page": 1, "limit": 50 }
```

## Flujo Completo de Deploy con Docker

### 1. Pull de cambios:
```bash
cd C:\Users\Tomas\Desktop\receptionistAI
git pull origin main
```

### 2. Rebuild backend:
```bash
docker-compose down backend
docker-compose build backend
docker-compose up -d backend
```

### 3. Ejecutar migraciones:
```bash
docker exec -it receptionistai-backend npm run migration:run
```

### 4. Verificar:
```bash
docker logs receptionistai-backend --tail 50
docker exec -it receptionistai-postgres psql -U postgres -d receptionistai -c "\dt" | grep -E "contacts|tags"
```

### 5. Test frontend (si está en Docker):
```bash
# Si tienes frontend en Docker (actualmente comentado)
docker-compose down frontend
docker-compose build frontend
docker-compose up -d frontend
```

## Rollback (si algo sale mal)

### Revertir migración:
```bash
docker exec -it receptionistai-backend npm run migration:revert
```

### Restaurar código anterior:
```bash
git reset --hard HEAD~1
docker-compose down
docker-compose build
docker-compose up -d
```

## Variables de Entorno Necesarias

Asegúrate de que tu `.env` o docker-compose tenga:

```env
# Database
DB_HOST=postgres
DB_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=river123
POSTGRES_DB=receptionistai

# Redis (para Bull Queue)
REDIS_HOST=redis
REDIS_PORT=6379

# JWT Keys
JWT_SECRET=your-secret-key
JWT_PRIVATE_KEY=your-private-key
JWT_PUBLIC_KEY_BASE64=your-public-key-base64

# ... (resto de variables)
```

## Troubleshooting

### "Cannot connect to database"
```bash
# Verificar que postgres esté corriendo
docker ps | grep postgres

# Ver logs de postgres
docker logs receptionistai-postgres

# Reiniciar postgres
docker-compose restart postgres
```

### "Migration already executed"
```bash
# Ver migraciones ejecutadas
docker exec -it receptionistai-postgres psql -U postgres -d receptionistai -c "SELECT * FROM migrations;"

# Si está ejecutada pero las tablas no existen, algo falló
# Revisar logs del backend durante la migración
```

### "Module 'xlsx' not found"
```bash
# Reinstalar dependencias en el contenedor
docker exec -it receptionistai-backend npm install

# O rebuild completo
docker-compose build backend
```

## Recomendación para Producción

En producción (Oracle Cloud), NO usar Docker. Ya tienes systemd services configurados.

Para producción, seguir los pasos de `DEPLOY_CONTACTOS.md`.

