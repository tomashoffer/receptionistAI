# Configuración de VAPI para Recepcionista AI

## 🎯 Descripción

VAPI es el servicio que utilizamos para crear y gestionar los asistentes de voz AI. Cada business puede crear su propio assistant personalizado que manejará las llamadas entrantes.

## 🔧 Configuración Inicial

### 1. Obtener API Key de VAPI

1. Ve a [VAPI Dashboard](https://dashboard.vapi.ai)
2. Crea una cuenta o inicia sesión
3. Ve a **Settings** > **API Keys**
4. Crea una nueva API Key
5. Copia la API Key

### 2. Configurar Variables de Entorno

Agrega estas variables a tu archivo `app/.env`:

```bash
# VAPI Configuration
VAPI_API_KEY=tu_vapi_api_key_aqui
VAPI_WEBHOOK_SECRET=tu_webhook_secret_aqui
```

### 3. Configurar Webhook Secret

1. En VAPI Dashboard, ve a **Settings** > **Webhooks**
2. Crea un nuevo webhook con la URL: `https://tu-dominio.com/api/webhooks/vapi/[businessId]`
3. Genera un secret para el webhook
4. Agrega el secret a `VAPI_WEBHOOK_SECRET`

## 🚀 Flujo de Funcionamiento

### 1. Crear Assistant

Cuando un business configura su recepcionista AI:

1. **Usuario completa el formulario** en "Configuración del Sistema"
2. **Nuestra app llama a VAPI** para crear el assistant
3. **VAPI crea el assistant** con la configuración especificada
4. **Guardamos el Assistant ID** en nuestra base de datos
5. **El assistant está listo** para recibir llamadas

### 2. Recibir Llamadas

1. **Twilio recibe llamada** entrante al número del business
2. **Twilio redirige** la llamada al assistant de VAPI
3. **Assistant maneja** la conversación según el prompt configurado
4. **VAPI envía webhooks** con información de la llamada

## 📋 Características del Assistant

### Configuración Automática

- **Modelo**: GPT-4o (OpenAI)
- **Transcripción**: Azure Whisper
- **Voz**: Azure Neural Voices
- **Idioma**: Configurable por business
- **Duración máxima**: 5 minutos
- **Mensaje de despedida**: Personalizable
- **Frases de cierre**: Configurables

### Webhooks Implementados

- `call-started`: Llamada iniciada
- `call-ended`: Llamada finalizada
- `transcript`: Transcripción en tiempo real
- `function-call`: Llamadas a funciones personalizadas

## 🔧 API Endpoints

### Frontend Service

```typescript
import { vapiService } from '@/services/vapi.service';

// Crear assistant
const assistant = await vapiService.createAssistant({
  name: 'Mi Negocio',
  prompt: 'Eres un recepcionista...',
  voice: 'es-ES-ElviraNeural',
  language: 'es',
  businessId: 'business-id'
});

// Obtener voces disponibles
const voices = await vapiService.getVoices();

// Obtener assistant
const assistant = await vapiService.getAssistant('assistant-id');

// Actualizar assistant
const updated = await vapiService.updateAssistant('assistant-id', {
  prompt: 'Nuevo prompt...'
});

// Eliminar assistant
await vapiService.deleteAssistant('assistant-id');
```

### API Routes

- `POST /api/vapi/assistants` - Crear assistant
- `GET /api/vapi/assistants?id=assistant-id` - Obtener assistant
- `GET /api/vapi/voices` - Obtener voces disponibles
- `POST /api/webhooks/vapi/[businessId]` - Webhook de VAPI

## 🎨 Interfaz de Usuario

### Página de Configuración del Sistema

1. **AI Prompt**: Textarea para definir el comportamiento
2. **Selección de Voz**: Dropdown con voces de VAPI
3. **Idioma**: Selector de idioma
4. **Crear Assistant**: Botón para crear en VAPI
5. **Estado**: Muestra si el assistant está creado

### Voces Disponibles

- **Álvaro**: Voz masculina en español
- **Elvira**: Voz femenina en español
- **Dalia**: Voz femenina en español (México)
- **Jorge**: Voz masculina en español (México)

## 🔒 Seguridad

### Autenticación

- **API Key**: Se usa para autenticar con VAPI
- **Webhook Secret**: Se usa para verificar webhooks
- **Business ID**: Se incluye en la URL del webhook

### Validación

- **Datos requeridos**: name, prompt, voice, language, businessId
- **Validación de entrada**: En frontend y backend
- **Manejo de errores**: Respuestas claras al usuario

## 📊 Monitoreo

### Logs

- **Creación de assistants**: Se registra en logs
- **Webhooks recibidos**: Se registran con business ID
- **Errores**: Se registran con detalles

### Métricas

- **Assistants creados**: Por business
- **Llamadas recibidas**: Por assistant
- **Errores**: Por tipo y frecuencia

## 🚨 Troubleshooting

### Errores Comunes

1. **"VAPI no configurado"**
   - Verificar que `VAPI_API_KEY` esté configurada

2. **"Error creando assistant en VAPI"**
   - Verificar que la API Key sea válida
   - Verificar que el prompt no sea demasiado largo

3. **"Error obteniendo voces de VAPI"**
   - Verificar conexión a internet
   - Verificar que la API Key tenga permisos

### Debugging

```bash
# Ver logs del backend
docker logs receptionistai-backend

# Ver logs del frontend
npm run dev
```

## 📚 Recursos Adicionales

- [VAPI Documentation](https://docs.vapi.ai)
- [VAPI Dashboard](https://dashboard.vapi.ai)
- [Azure Neural Voices](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support#neural-voices)

## 🔄 Próximos Pasos

1. **Integración con Twilio**: Conectar números de teléfono
2. **Análisis de llamadas**: Dashboard con métricas
3. **Personalización avanzada**: Más opciones de configuración
4. **Integración con CRM**: Sincronizar datos de clientes
