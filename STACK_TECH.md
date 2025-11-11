# 🚀 Receptionist AI - Stack Tecnológico

## 📋 **Stack Completo**

### **Backend**
- **Framework:** NestJS con TypeScript
- **Database:** PostgreSQL (migrable a Supabase)
- **Authentication:** JWT + Google OAuth
- **Voice AI:** OpenAI (Whisper + GPT-3.5-turbo)
- **Google Integration:** Calendar + Sheets
- **API Documentation:** Swagger

### **Frontend (Próximos pasos)**
- **Framework:** Next.js con TypeScript
- **UI:** Tailwind CSS + shadcn/ui
- **Voice AI:** Vapi (Asistente de voz completo)
  - **LLM:** GPT-4o Mini (optimizado para costos)
  - **TTS:** OpenAI TTS-1 (económico) o ElevenLabs (premium)
  - **STT:** Deepgram Nova-2 (rápido y económico)
- **Database:** Supabase (migración futura)
- **Payment:** Stripe
- **Analytics:** PostHog

### **DevOps & Tools**
- **Version Control:** GitHub
- **Deployment:** Vercel (frontend) + Railway/Render (backend)
- **Automations:** n8n (via Webhook)
- **RAG:** mem0 (futuro)

## 🔧 **Configuración de Google Calendar**

### 1. **Crear Service Account en Google Cloud Console**

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las APIs:
   - Google Calendar API
   - Google Sheets API
4. Ve a "IAM & Admin" > "Service Accounts"
5. Crea un nuevo Service Account
6. Descarga el archivo JSON de credenciales

### 2. **Configurar Variables de Entorno**

```env
# Google Service Account
GOOGLE_CLIENT_EMAIL=tu-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\ntu_private_key_aqui\n-----END PRIVATE KEY-----\n"

# Google Calendar
GOOGLE_CALENDAR_ID=primary

# Google Sheets
GOOGLE_SHEETS_ID=tu_google_sheets_id_aqui
GOOGLE_SHEETS_RANGE=A:J
```

### 3. **Compartir Calendar con Service Account**

1. Ve a [Google Calendar](https://calendar.google.com/)
2. Selecciona el calendario que quieres usar
3. Ve a "Configuración y uso compartido"
4. En "Compartir con personas específicas", agrega:
   - Email del Service Account
   - Permisos: "Hacer cambios en los eventos"

### 4. **Configurar Google Sheets**

1. Crea una nueva hoja de cálculo en Google Sheets
2. Comparte la hoja con el email del Service Account
3. Permisos: "Editor"
4. Copia el ID de la hoja de la URL

## 🎯 **Endpoints de Google Calendar**

### **Verificar Estado**
```
GET /google/status
```

### **Obtener Eventos**
```
GET /google/calendar/events?startDate=2024-01-01&endDate=2024-01-31
```

### **Obtener Slots Disponibles**
```
GET /google/calendar/availability?date=2024-01-15&duration=60
```

### **Verificar Disponibilidad**
```
GET /google/calendar/check-availability?date=2024-01-15&time=10:00&duration=60
```

## 🎯 **Endpoints de Appointments**

### **Crear Cita (con verificación automática)**
```
POST /appointments
{
  "clientName": "Juan Pérez",
  "clientPhone": "1234567890",
  "clientEmail": "juan@email.com",
  "serviceType": "Consulta médica",
  "appointmentDate": "2024-01-15",
  "appointmentTime": "10:00",
  "notes": "Primera consulta"
}
```

### **Obtener Slots Disponibles**
```
GET /appointments/available-slots?date=2024-01-15&duration=60
```

## 🤖 **Integración con Voice AI**

El sistema automáticamente:
1. **Transcribe** el audio con OpenAI Whisper
2. **Extrae intención** con GPT-3.5-turbo
3. **Verifica disponibilidad** en Google Calendar
4. **Crea la cita** si está disponible
5. **Sincroniza** con Google Calendar y Sheets
6. **Envía confirmación** al cliente

## 📱 **Próximos Pasos**

1. **Configurar Google Calendar** siguiendo esta guía
2. **Probar endpoints** con Swagger UI
3. **Migrar frontend** a Next.js + Tailwind + shadcn/ui
4. **Configurar Vapi** con el stack económico (GPT-4o Mini + OpenAI TTS + Deepgram)
5. **Migrar a Supabase** para base de datos
6. **Agregar Stripe** para pagos
7. **Implementar PostHog** para analytics
