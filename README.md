# 🤖 Recepcionista AI - Sistema de Agendamiento con Voz

Un sistema inteligente de recepcionista AI que permite agendar turnos usando comandos de voz, con integración completa a Google Sheets y Google Calendar.

## ✨ Características

- 🎤 **Reconocimiento de voz** usando OpenAI Whisper
- 🧠 **Procesamiento de lenguaje natural** con GPT-3.5-turbo
- 📅 **Integración con Google Calendar** para eventos automáticos
- 📊 **Sincronización con Google Sheets** para registro de citas
- 🗄️ **Base de datos PostgreSQL** para persistencia
- 🌐 **Interfaz web moderna** con Next.js y TypeScript
- 🐳 **Despliegue con Docker** para fácil configuración

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   Next.js       │◄──►│   NestJS        │◄──►│   PostgreSQL    │
│   TypeScript    │    │   TypeScript    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         │              │   AI Services   │
         │              │   OpenAI API    │
         │              │   Google APIs   │
         │              └─────────────────┘
         │
         ▼
┌─────────────────┐
│   Google        │
│   Calendar      │
│   Sheets        │
└─────────────────┘
```

## 🚀 Instalación Rápida

### Prerrequisitos

- Docker y Docker Compose
- Cuentas de API:
  - **Vapi AI** (para asistente de voz) - [Obtener API Key](https://vapi.ai)
  - **OpenAI API Key** (para LLM y TTS)
  - **Google Cloud Console** (para OAuth y Calendar)

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd receptionistAI
```

### 2. Configurar variables de entorno (Docker)

**⚡ OPCIÓN RECOMENDADA: Usar Docker**

```bash
# Copia el archivo de ejemplo
cp env.docker.example .env

# Edita .env con tus valores reales
# VAPI_API_KEY, OPENAI_API_KEY, GOOGLE_CLIENT_ID, etc.
```

Ver [DOCKER-SETUP.md](DOCKER-SETUP.md) para instrucciones detalladas.

### 3. Levantar todo con Docker

```bash
# Construir e iniciar todos los servicios (Frontend + Backend + PostgreSQL + N8N + ngrok)
docker-compose up --build

# En modo detached (segundo plano)
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f frontend
docker-compose logs -f backend
```

### 4. Acceder a los servicios

- **Frontend**: http://localhost:3000 ⭐ **¡COMIENZA AQUÍ!**
- **Backend API**: http://localhost:3001
- **N8N**: http://localhost:5678 (usuario: `admin`, contraseña: `admin123`)
- **PostgreSQL**: localhost:5433 (puerto externo)

---

## 🛠️ Instalación Manual (Sin Docker)

### 2. Configurar variables de entorno

#### Backend (API)
Copia el archivo de ejemplo y configura tus API keys:

```bash
cp api/env.example api/.env
```

Edita `api/.env` con tus credenciales:

```env
# Base de datos PostgreSQL
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=river123
DB_DATABASE=receptionistai
POSTGRES_USER=postgres
POSTGRES_PASSWORD=river123
POSTGRES_DB=receptionistai

# OpenAI API
OPENAI_API_KEY=tu_openai_api_key_aqui

# Google APIs
GOOGLE_CLIENT_ID=tu_google_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_google_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

# Google Sheets
GOOGLE_SHEETS_ID=tu_google_sheets_id_aqui
GOOGLE_SHEETS_RANGE=A:Z

# Google Calendar
GOOGLE_CALENDAR_ID=primary
```

#### Frontend (App)
Copia el archivo de ejemplo y configura las variables:

```bash
cp app/env.local.example app/.env.local
```

Edita `app/.env.local` con tu configuración:

```env
# URL del backend API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Configuración de la aplicación
NEXT_PUBLIC_APP_NAME=Recepcionista AI
NEXT_PUBLIC_APP_VERSION=1.0.0

# Configuración de desarrollo
NODE_ENV=development
```

### 3. Ejecutar con Docker (Recomendado)

```bash
# Construir y ejecutar todos los servicios
docker-compose up --build

# En modo desarrollo (con hot reload)
docker-compose -f docker-compose.dev.yml up --build
```

### 4. Ejecutar manualmente

#### Backend (API)

```bash
cd api
npm install
npm run start:dev
```

#### Frontend (App)

```bash
cd app
npm install
npm run dev
```

#### Base de datos

```bash
# Con Docker
docker run --name postgres -e POSTGRES_PASSWORD=river123 -e POSTGRES_DB=receptionistai -p 5432:5432 -d postgres:15

# O instalar PostgreSQL localmente
```

## 📱 Uso del Sistema

### Interfaz Web

1. Abre `http://localhost:3000` en tu navegador
2. Permite el acceso al micrófono cuando se solicite
3. Haz clic en el botón del micrófono y habla
4. El sistema procesará tu voz y responderá

### Comandos de Voz Soportados

- **Agendar cita**: "Hola, me gustaría agendar una cita para mañana a las 2 PM"
- **Cancelar cita**: "Quiero cancelar mi cita"
- **Consultar citas**: "Quiero consultar mis citas"
- **Saludo**: "Hola" o "Buenos días"

### API Endpoints

#### Procesar audio de voz
```bash
POST /voice/process
Content-Type: multipart/form-data
Body: audio file
```

#### Procesar texto (para testing)
```bash
POST /voice/process-text
Content-Type: application/json
Body: { "text": "Hola, me gustaría agendar una cita" }
```

#### Estado del servicio
```bash
GET /voice/status
```

#### Gestión de citas
```bash
GET /appointments          # Listar todas las citas
POST /appointments         # Crear nueva cita
GET /appointments/:id      # Obtener cita específica
PUT /appointments/:id      # Actualizar cita
DELETE /appointments/:id   # Eliminar cita
```

## 🔧 Configuración de Google APIs

### 1. Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las APIs:
   - Google Calendar API
   - Google Sheets API

### 2. Credenciales OAuth2

1. Ve a "Credenciales" en la consola
2. Crea credenciales OAuth2
3. Configura las URIs de redirección autorizadas
4. Descarga el archivo JSON de credenciales

### 3. Google Sheets

1. Crea una nueva hoja de cálculo en Google Sheets
2. Comparte con el email del servicio (si usas Service Account)
3. Copia el ID de la hoja de la URL

### 4. Google Calendar

1. Crea un calendario específico o usa "primary"
2. Configura los permisos necesarios

## 🛠️ Desarrollo

### Estructura del Proyecto

```
receptionistAI/
├── api/                    # Backend NestJS
│   ├── src/
│   │   ├── appointments/   # Módulo de citas
│   │   ├── voice/         # Módulo de voz AI
│   │   ├── google/       # Integración Google APIs
│   │   └── database/     # Entidades de base de datos
│   ├── Dockerfile
│   └── package.json
├── app/                   # Frontend Next.js
│   ├── src/
│   │   └── app/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

### Scripts Disponibles

#### Backend
```bash
npm run start:dev     # Desarrollo con hot reload
npm run build         # Compilar para producción
npm run start:prod    # Ejecutar en producción
npm run test          # Ejecutar tests
npm run lint          # Linter
```

#### Frontend
```bash
npm run dev           # Desarrollo con hot reload
npm run build         # Compilar para producción
npm run start         # Ejecutar en producción
npm run lint          # Linter
```

## 🧪 Testing

### Probar el sistema de voz

1. Usa el endpoint `/voice/process-text` para probar sin micrófono
2. Envía texto como: `"Hola, me gustaría agendar una cita para mañana a las 2 PM"`
3. Verifica la respuesta y la creación automática de citas

### Verificar integraciones

1. Revisa Google Calendar para eventos creados
2. Verifica Google Sheets para registros de citas
3. Consulta la base de datos PostgreSQL

## 🚨 Solución de Problemas

### Error de micrófono
- Verifica permisos del navegador
- Usa HTTPS en producción
- Prueba con el endpoint de texto

### Error de OpenAI API
- Verifica tu API key
- Revisa los límites de uso
- Confirma que tienes créditos disponibles

### Error de Google APIs
- Verifica las credenciales
- Confirma que las APIs están habilitadas
- Revisa los permisos del calendario/hoja

### Error de base de datos
- Verifica la conexión a PostgreSQL
- Confirma que la base de datos existe
- Revisa las credenciales de conexión

## 📈 Próximas Mejoras

- [ ] Soporte para múltiples idiomas
- [ ] Integración con WhatsApp/SMS
- [ ] Dashboard de administración
- [ ] Notificaciones por email
- [ ] Sistema de recordatorios
- [ ] Análisis de sentimientos
- [ ] Integración con sistemas de pago

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

---

🔄 FLUJO DETALLADO PASO A PASO:
1. 📞 INICIO DE LLAMADA
Cliente marca el número de Twilio
Twilio conecta con VAPI
VAPI inicia el asistente de voz
2. 🎤 CONVERSACIÓN
VAPI saluda al cliente
Extrae información usando IA:
Nombre del cliente
Email
Teléfono
Tipo de servicio
Fecha preferida
Hora preferida
3. 📡 WEBHOOK A N8N
VAPI envía datos extraídos a N8N
URL: http://localhost:5678/webhook/vapi-appointment
4. 🔄 N8N PROCESA
Nodo 1: Recibe webhook de VAPI
Nodo 2: Extrae y organiza datos
Nodo 3: Consulta Google Calendar (disponibilidad)
Nodo 4: Crea evento en Google Calendar
Nodo 5: Envía datos al backend NestJS
5. 🗄️ BACKEND GUARDA
NestJS recibe datos de N8N
Guarda cita en PostgreSQL
Registra interacción de voz
6. ✅ CONFIRMACIÓN
Google Calendar crea el evento
Backend confirma éxito
N8N responde a VAPI
VAPI confirma al cliente por teléfono
🛠️ TECNOLOGÍAS POR PASO:
Paso	Tecnología	Función
1-2	Twilio + VAPI	Llamada y conversación
3	N8N Webhook	Recibe datos de VAPI
4	N8N + Google Calendar	Verifica disponibilidad
5	N8N + NestJS	Guarda en base de datos
6	VAPI	Confirma al cliente

**¡Disfruta usando tu Recepcionista AI! 🤖✨**
voice receptionist with AI
