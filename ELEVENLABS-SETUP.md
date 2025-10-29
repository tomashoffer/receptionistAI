# Guía Completa de Integración con ElevenLabs Conversational AI

## Paso 1: Crear API Key con Permisos de Conversational AI

### En ElevenLabs:
1. Ve a https://elevenlabs.io/app/settings/api-keys
2. Haz clic en "Create API Key"
3. Dale un nombre (ej: "ReceptionistAI Dev")
4. **IMPORTANTE**: Asegúrate de que la key tenga permisos de "Agents" (Conversational AI)
5. Copia la API key (formato: `sk_...`)

### Configurar en el proyecto:

1. Abre el archivo `.env` en la raíz del proyecto y agrega tu API key:

```bash
ELEVENLABS_API_KEY=sk_tu_api_key_aqui
```

2. Reinicia el backend:

```bash
docker-compose restart backend
```

## Paso 2: Verificar Permisos

Tu API key debe tener permisos de:
- ✅ **Text to Speech**
- ✅ **Agents (Conversational AI)**

Si tu cuenta es gratuita y no tienes acceso a Agents:
- Ve a https://elevenlabs.io/pricing/api
- El plan gratuito incluye **15 minutos de Agents por mes**
- Si no aparece, puede requerir activación manual en el dashboard

## Paso 3: Probar la Integración

Una vez configurada la API key:

1. Ve al dashboard de tu app: http://localhost:3000/dashboard
2. Configura un assistant con:
   - Nombre del negocio
   - Prompt personalizado
   - Voz seleccionada (Malena, Agustin, etc.)
   - Idioma (Español/English)
3. Haz clic en "Crear Assistant"
4. El assistant se creará tanto localmente como en ElevenLabs

## Paso 4: Verificar en ElevenLabs Dashboard

Los agents creados aparecerán en:
https://elevenlabs.io/app/agents

Deberías ver:
- Nombre del agent
- Voice ID usado
- Estado (activo/inactivo)
- Fecha de creación

## Estructura de la API

El backend ahora envía el siguiente payload a ElevenLabs:

```json
{
  "name": "Nombre del Negocio",
  "conversation_config": {
    "agent": {
      "first_message": "¡Hola! ¿En qué puedo ayudarte?",
      "language": "es",
      "prompt": "Tu prompt aquí..."
    },
    "tts": {
      "model_id": "eleven_turbo_v2",
      "voice_id": "p7AwDmKvTdoHTBuueGvP"
    }
  }
}
```

## Endpoints de ElevenLabs

- **Crear Agent**: `POST /v1/convai/agents/create`
- **Obtener Agent**: `GET /v1/convai/agents/:agent_id`
- **Suscripción WebSockets**: Para conversaciones en tiempo real

## Troubleshooting

### Error: "missing the permission convai_write"
**Solución**: Verifica que tu API key tenga permisos de Agents. Algunas cuentas gratuitas requieren activación manual.

### El agent no aparece en el dashboard de ElevenLabs
**Solución**: Verifica que estés usando la misma cuenta que creó la API key.

### Error 401 Unauthorized
**Solución**: Verifica que `ELEVENLABS_API_KEY` esté correctamente configurada en `.env`.

## Recursos Útiles

- Documentación: https://elevenlabs.io/docs
- API Reference: https://www.postman.com/elevenlabs/documentation
- Dashboard: https://elevenlabs.io/app/agents
- Pricing: https://elevenlabs.io/pricing/api

## Próximos Pasos

Una vez que el assistant esté funcionando:

1. Implementar el widget de ElevenLabs en el frontend
2. Agregar soporte para webhooks
3. Integrar conversaciones en tiempo real via WebSockets
4. Agregar analytics y métricas de uso
