# Receptionist AI - Backend API

Backend desarrollado con NestJS y TypeScript para el sistema de recepcionista AI con voz.

## Características

- 🎤 Procesamiento de voz con AI
- 📅 Integración con Google Calendar
- 📊 Integración con Google Sheets
- 🗄️ Base de datos PostgreSQL
- 📚 Documentación automática con Swagger
- 🔒 Validación de datos con class-validator

## Tecnologías

- **Framework**: NestJS
- **Lenguaje**: TypeScript
- **Base de datos**: PostgreSQL con TypeORM
- **APIs externas**: Google Calendar, Google Sheets, OpenAI
- **Documentación**: Swagger/OpenAPI

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

3. Ejecutar en desarrollo:
```bash
npm run start:dev
```

4. Ejecutar en producción:
```bash
npm run build
npm run start:prod
```

## Variables de entorno

- `DB_HOST`: Host de PostgreSQL
- `DB_PORT`: Puerto de PostgreSQL
- `DB_USERNAME`: Usuario de PostgreSQL
- `DB_PASSWORD`: Contraseña de PostgreSQL
- `DB_DATABASE`: Nombre de la base de datos
- `GOOGLE_CLIENT_EMAIL`: Email del service account de Google
- `GOOGLE_PRIVATE_KEY`: Clave privada del service account
- `GOOGLE_CALENDAR_ID`: ID del calendario de Google
- `GOOGLE_SHEETS_ID`: ID de la hoja de cálculo de Google
- `OPENAI_API_KEY`: Clave API de OpenAI

## Endpoints principales

- `POST /appointments` - Crear nueva cita
- `GET /appointments` - Obtener todas las citas
- `POST /voice/process` - Procesar comando de voz
- `GET /google/calendar/events` - Obtener eventos del calendario

## Documentación API

Una vez ejecutando el servidor, la documentación estará disponible en:
`http://localhost:3001/api`
