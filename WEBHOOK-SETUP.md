# Configuración de Webhook para ElevenLabs

## 📋 Variables de Entorno Necesarias

Agrega al final de tu `.env` del backend:

```env
# Webhook URL para ElevenLabs (ngrok)
WEBHOOK_URL=https://ontogenetic-janene-accommodational.ngrok-free.dev
```

## 🔧 Cómo Funciona

1. **El backend construye la URL completa:**
   - `WEBHOOK_URL` + `/webhook-test/vapi-appointment`
   - Resultado: `https://ontogenetic-janene-accommodational.ngrok-free.dev/webhook-test/vapi-appointment`

2. **Esta URL se coloca en el prompt del LLM:**
   - Cuando el AI recopila todos los datos del cliente
   - Tiene instrucciones en el prompt para llamar a esta URL
   - Envía POST con los datos del cliente

## 🎯 Flujo Completo

```
Cliente habla con AI
  ↓
AI recopila: nombre, email, teléfono, servicio, fecha, hora
  ↓
AI tiene instrucciones en el prompt: "Cuando tengas todos los datos, envía POST a {{webhook_url}}"
  ↓
AI envía POST a: https://ontogenetic-janene-accommodational.ngrok-free.dev/webhook-test/vapi-appointment
  ↓
N8N recibe los datos y procesa el workflow
  ↓
N8N hace POST al backend: http://localhost:3001/api/webhooks/elevenlabs/appointment/:businessId
  ↓
Backend crea el appointment en la BD
```

## ⚠️ OPCIÓN MÁS SIMPLE (sin N8N)

**Usa directamente el backend sin N8N:**

```env
# Webhook URL directo al backend (SIN ngrok intermedio)
WEBHOOK_URL=http://localhost:3001
```

El backend construirá:
- `http://localhost:3001/api/webhooks/elevenlabs/appointment/{businessId}`

## 📌 Recomendación

**Para desarrollo local:**
- No uses N8N intermedio
- Configura: `WEBHOOK_URL=http://localhost:3001`
- El backend genera la URL completa automáticamente

**Para producción con ngrok:**
- Configura: `WEBHOOK_URL=https://ontogenetic-janene-accommodational.ngrok-free.dev`
- El backend genera: `https://ontogenetic-janene-accommodational.ngrok-free.dev/webhook-test/vapi-appointment`

