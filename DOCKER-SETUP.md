# 🐳 Setup con Docker

Este proyecto usa **Docker Compose** para levantar todos los servicios necesarios.

## 📦 Servicios incluidos

1. **PostgreSQL** - Base de datos (puerto 5432)
2. **Backend NestJS** - API REST y WebSockets (puerto 3001)
3. **N8N** - Automatización y workflows (puerto 5678)

## 🚀 Inicio rápido

### 1. Configurar variables de entorno

```bash
# Copia el archivo de ejemplo
cp env.docker.example .env

# Edita .env con tus valores reales
```

### 2. Levantar todos los servicios

```bash
# Construir e iniciar todos los contenedores
docker-compose up --build

# O en segundo plano (modo detached)
docker-compose up -d
```

### 3. Acceder a los servicios

- **Backend API**: http://localhost:3001
- **N8N**: http://localhost:5678
  - Usuario: `admin`
  - Contraseña: `admin123`
- **PostgreSQL**: localhost:5432

## 🔧 Comandos útiles

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f n8n

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ borra la base de datos)
docker-compose down -v

# Reiniciar un servicio específico
docker-compose restart backend

# Reconstruir un servicio
docker-compose up -d --build backend
```

## 🔄 Desarrollo con hot-reload

El backend está configurado con volúmenes para hot-reload:
- Los cambios en `api/src` se detectan automáticamente
- No necesitas reconstruir el contenedor

## 🌐 N8N y el Backend

En N8N, para hacer peticiones al backend usa:

```
http://backend:3001/tu-endpoint
```

**NO** uses `localhost:3001` porque están en contenedores diferentes.

### Ejemplo de workflow N8N:

1. **Webhook Node** - Recibe petición de VAPI
2. **HTTP Request Node** - URL: `http://backend:3001/voice/webhooks/vapi-response`
3. **Google Calendar Node** - Consulta disponibilidad

## 📊 Base de datos

Las migraciones se ejecutan automáticamente al iniciar el backend.

Para acceder a la base de datos:

```bash
# Desde terminal
docker-compose exec postgres psql -U postgres -d receptionistai

# O usando cualquier cliente PostgreSQL
# Host: localhost
# Puerto: 5432
# Usuario: postgres
# Password: river123
# Database: receptionistai
```

## 🐛 Troubleshooting

### El backend no se conecta a la base de datos

```bash
# Verifica que postgres esté saludable
docker-compose ps

# Reinicia los servicios
docker-compose restart
```

### N8N no puede conectarse al backend

- Asegúrate de usar `http://backend:3001` (NO `localhost`)
- Verifica que ambos servicios estén en la misma red: `docker-compose ps`

### Cambios en package.json no se reflejan

```bash
# Reconstruir el contenedor
docker-compose down
docker-compose up --build
```

## 🧹 Limpiar todo

```bash
# Eliminar contenedores, redes y volúmenes
docker-compose down -v

# Eliminar imágenes (si quieres empezar desde cero)
docker system prune -a
```

