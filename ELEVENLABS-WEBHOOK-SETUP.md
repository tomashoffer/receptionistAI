# Integración ElevenLabs Workflows + Backend

Esta guía te explica cómo configurar el flujo de trabajo de ElevenLabs para que automáticamente cree appointments y envíe calendar invites por email.

## 📋 Flujo Completo

1. **Usuario llama** → El assistant de ElevenLabs recopila datos
2. **Assistant recopila** → Nombre, email, teléfono, servicio, fecha, hora
3. **Webhook activado** → ElevenLabs envía datos a nuestro backend
4. **Backend procesa** → Crea el appointment en la BD
5. **Google Calendar** → Se crea el evento automáticamente
6. **Email enviado** → El cliente recibe el calendar invite (.ics)

---

## 🔧 Configuración en ElevenLabs

### 1. Configurar el Webhook en el Workflow de ElevenLabs

1. Ve a tu agente en ElevenLabs
2. Click en **"Flujo de trabajo"** (Workflow)
3. Crea un nuevo workflow o edita el existente
4. Agrega un **nodo "Webhook"** al final del flujo

### 2. Configurar el Endpoint del Webhook

```
URL del webhook:
https://tu-dominio.com/api/webhooks/elevenlabs/appointment/:businessId

Método: POST
Headers:
  Content-Type: application/json
```

**Ejemplo de URL completa:**
```
https://tu-dominio.com/api/webhooks/elevenlabs/appointment/123e4567-e89b-12d3-a456-426614174000
```

### 3. Configurar el Payload del Webhook

En el nodo Webhook de ElevenLabs, configura el payload así:

```json
{
  "client_name": "{{nombre_cliente}}",
  "client_email": "{{email_cliente}}",
  "client_phone": "{{telefono_cliente}}",
  "service_type": "{{tipo_servicio}}",
  "appointment_date": "{{fecha_cita}}",
  "appointment_time": "{{hora_cita}}",
  "notes": "Cita creada mediante ElevenLabs AI"
}
```

**Variables que debes capturar:**
- `nombre_cliente` - Nombre completo del cliente
- `email_cliente` - Email válido
- `telefono_cliente` - Teléfono con código de país
- `tipo_servicio` - Tipo de servicio (ej: "consulta", "tratamiento")
- `fecha_cita` - Fecha en formato YYYY-MM-DD
- `hora_cita` - Hora en formato HH:MM

---

## 🎯 Cómo Capturar los Datos en ElevenLabs

### Opción 1: Usar Variables de Conversación

En el prompt de tu agente, instruye al AI para recopilar datos:

```markdown
Cuando el cliente quiera agendar una cita, debes preguntar:

1. Nombre completo
2. Email
3. Teléfono
4. Tipo de servicio que necesita
5. Fecha preferida
6. Hora preferida

Una vez que tengas todos los datos, díselo al cliente confirmando:
"Perfecto, voy a agendar tu cita para el [fecha] a las [hora]. Te enviaré un email con el confirmación."

Usa estas variables para almacenar los datos:
- nombre_cliente
- email_cliente
- telefono_cliente
- tipo_servicio
- fecha_cita
- hora_cita
```

### Opción 2: Usar Tools/Functions

En el panel "Avanzado" de tu agente en ElevenLabs, puedes definir funciones:

```json
{
  "type": "function",
  "function": {
    "name": "crear_cita",
    "description": "Crea una cita en el sistema",
    "parameters": {
      "type": "object",
      "properties": {
        "nombre": {
          "type": "string",
          "description": "Nombre completo del cliente"
        },
        "email": {
          "type": "string",
          "description": "Email del cliente"
        },
        "telefono": {
          "type": "string",
          "description": "Teléfono del cliente"
        },
        "servicio": {
          "type": "string",
          "description": "Tipo de servicio"
        },
        "fecha": {
          "type": "string",
          "format": "date"
        },
        "hora": {
          "type": "string",
          "format": "time"
        }
      },
      "required": ["nombre", "email", "telefono", "servicio", "fecha", "hora"]
    }
  }
}
```

Luego en el Workflow, conecta la función al Webhook.

---

## 🔌 Endpoint del Backend

Tu endpoint ya está configurado en:

```
POST /api/webhooks/elevenlabs/appointment/:businessId
```

**El backend automáticamente:**

1. ✅ Valida los datos recibidos
2. ✅ Crea el appointment en la base de datos
3. ✅ Crea el evento en Google Calendar del business
4. ✅ Genera el archivo .ics (calendar invite)
5. ✅ Envía el email al cliente con el .ics adjunto
6. ✅ Guarda el Google Calendar event ID en la BD

---

## 📧 Email con Calendar Invite

El cliente recibirá un email automáticamente con:

- **Asunto:** "Confirmación de cita - [Nombre del Business]"
- **Contenido:** Detalles de la cita
- **Adjunto:** Archivo `.ics` para agregar al calendario

El archivo `.ics` funciona con:
- Google Calendar
- Outlook
- Apple Calendar
- Yahoo Calendar
- Cualquier cliente de calendario estándar

---

## 🧪 Testing

### 1. Probar con Postman/curl

```bash
curl -X POST \
  https://tu-dominio.com/api/webhooks/elevenlabs/appointment/TU_BUSINESS_ID \
  -H 'Content-Type: application/json' \
  -d '{
    "client_name": "Juan Pérez",
    "client_email": "juan@ejemplo.com",
    "client_phone": "+549123456789",
    "service_type": "consulta",
    "appointment_date": "2025-11-15",
    "appointment_time": "10:30",
    "notes": "Primera consulta"
  }'
```

### 2. Verificar en la BD

```sql
SELECT * FROM appointments 
WHERE client_email = 'juan@ejemplo.com' 
ORDER BY created_at DESC;
```

### 3. Verificar en Google Calendar

El evento debe aparecer automáticamente en el calendario del business.

---

## 🚀 Siguientes Pasos

1. **Configura el workflow en ElevenLabs** con el webhook
2. **Prueba con una llamada** real
3. **Verifica** que el appointment se crea
4. **Verifica** que el cliente recibe el email
5. **Ajusta el prompt** del AI según tus necesidades

---

## ⚙️ Variables de Entorno Necesarias

Asegúrate de tener configurado en tu `.env`:

```env
# Google Calendar (para crear eventos)
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_REDIRECT_URI=https://tu-dominio.com/auth/google/callback

# Email (para enviar calendar invites)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
EMAIL_FROM=noreply@tu-dominio.com
```

---

## 🎯 Tips

1. **Personaliza el prompt** del AI para que recopile los datos de forma natural
2. **Agrega validación** de horarios disponibles en el prompt
3. **Usa el workflow** de ElevenLabs para manejar confirmaciones
4. **Configura horarios laborales** en el AI prompt
5. **Agrega recordatorios** opcionales

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs del backend: `docker logs receptionistai-backend`
2. Verifica el webhook en ElevenLabs está configurado correctamente
3. Prueba el endpoint manualmente con curl/Postman
4. Verifica que Google Calendar esté conectado

