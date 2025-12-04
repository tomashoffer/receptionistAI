# Integración VAPI - Sistema de Contactos

## Resumen
El sistema de contactos se integra con VAPI para crear/actualizar contactos automáticamente durante las conversaciones del asistente AI.

## Backend Endpoint

### POST /contacts/from-conversation

Crea o actualiza un contacto basado en la información recopilada durante una conversación.

**URL:** `https://apirecepcionistai.pedidosatr.com/contacts/from-conversation`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_API_KEY"
}
```

**Body:**
```json
{
  "business_id": "uuid-del-business",
  "phone": "+5491154686272",
  "name": "María González",
  "email": "maria@example.com",
  "source": "call",
  "notes": "Cliente interesado en agendar turno para masajes",
  "intent": "agendar_turno",
  "conversation_id": "vapi-call-id-123",
  "appointment_request": {
    "preferred_date": "2025-12-15",
    "service": "Masaje relajante",
    "notes": "Prefiere horarios de tarde"
  }
}
```

**Response:**
```json
{
  "success": true,
  "contact_id": "uuid-del-contacto",
  "is_new": true,
  "message": "Nuevo contacto creado"
}
```

## Configuración VAPI Function Tool

### 1. Definición de la Tool

Agregar esta function tool en la configuración del asistente de VAPI:

```json
{
  "type": "function",
  "function": {
    "name": "create_or_update_contact",
    "description": "Crea o actualiza un contacto en el sistema CRM cuando obtienes información del cliente durante la conversación. Úsala SIEMPRE que captures nombre, teléfono, email o cualquier dato del contacto.",
    "parameters": {
      "type": "object",
      "properties": {
        "phone": {
          "type": "string",
          "description": "Número de teléfono del contacto con código de país. Formato internacional (ej: +5491154686272)"
        },
        "name": {
          "type": "string",
          "description": "Nombre completo del contacto tal como se presentó"
        },
        "email": {
          "type": "string",
          "description": "Email del contacto si lo proporciona (opcional)"
        },
        "notes": {
          "type": "string",
          "description": "Notas importantes de la conversación: qué necesita, preferencias, comentarios relevantes"
        },
        "intent": {
          "type": "string",
          "enum": ["agendar_turno", "consulta", "cancelacion", "informacion", "reserva"],
          "description": "Intención principal detectada en la conversación"
        },
        "appointment_request": {
          "type": "object",
          "description": "Datos de la solicitud de turno/reserva si el cliente quiere agendar",
          "properties": {
            "preferred_date": {
              "type": "string",
              "description": "Fecha preferida en formato ISO (YYYY-MM-DD)"
            },
            "service": {
              "type": "string",
              "description": "Servicio o tratamiento que solicita"
            },
            "notes": {
              "type": "string",
              "description": "Notas adicionales sobre el turno/reserva"
            }
          }
        }
      },
      "required": ["phone", "name"]
    }
  },
  "server": {
    "url": "https://apirecepcionistai.pedidosatr.com/contacts/from-conversation",
    "secret": "YOUR_SECRET_KEY"
  }
}
```

### 2. Actualizar System Prompt del Asistente

Agregar estas instrucciones al system prompt:

```markdown
# Gestión de Contactos

**IMPORTANTE:** Debes recopilar y guardar la información del contacto.

## Cuándo llamar a create_or_update_contact:

1. **Al inicio de la conversación:**
   - Siempre pide el nombre: "¿Con quién tengo el gusto?"
   - El teléfono lo obtienes automáticamente del caller_id
   - Si lo da el cliente, úsalo para validar

2. **Durante la conversación:**
   - Si menciona su email, actualiza el contacto
   - Captura preferencias y notas importantes
   - Identifica la intención (agendar, consultar, cancelar, etc.)

3. **Al finalizar:**
   - Antes de despedirte, asegúrate de haber llamado a create_or_update_contact
   - Guarda un resumen de la conversación en "notes"

## Ejemplo de uso:

**Cliente:** "Hola, quiero agendar un turno"
**Tú:** "¡Hola! Un placer atenderle. ¿Con quién tengo el gusto?"
**Cliente:** "Soy María González"
**Tú:** "Encantado, María. ¿Para qué día le gustaría agendar?"
**Cliente:** "Para el martes que viene si es posible"

[LLAMAR FUNCIÓN create_or_update_contact]:
{
  "phone": "+5491154686272",
  "name": "María González",
  "source": "call",
  "notes": "Cliente solicita turno para martes próximo",
  "intent": "agendar_turno",
  "appointment_request": {
    "preferred_date": "2025-12-17",
    "notes": "Prefiere martes"
  }
}

## Reglas:
- ✅ SIEMPRE obtén el nombre del cliente
- ✅ El teléfono es obligatorio (ya lo tienes del caller_id)
- ✅ Normaliza el teléfono con código de país (+54, +1, etc.)
- ✅ Si el cliente ya existe, actualizarás su información
- ✅ Sé natural al pedir los datos, no parezcas un formulario
```

## Tags Automáticos

El sistema asigna tags automáticamente según:

### Por Intención:
- `agendar_turno` → Tag "Solicitud de Turno" 📅 (azul)
- `consulta` → Tag "Consulta" ❓ (morado)
- `cancelacion` → Tag "Quiere Cancelar" ❌ (rojo)
- `reserva` → Tag "Posible Huésp" 🛏️ (naranja)
- `informacion` → Tag "Información" ℹ️ (gris)

### Por Fuente:
- `call` → Tag "Llamada" ☎️ (verde)
- `whatsapp` → Tag "WhatsApp" 💬 (verde)
- `instagram` → Tag "Instagram" 📷 (rosa)
- `facebook` → Tag "Facebook" 👥 (azul)
- `web` → Tag "Web" 🌐 (índigo)

### Tag General:
- Todos los contactos nuevos reciben: "Lead Entrante" 👤 (rosa)

## Metadata del Business en VAPI

Al crear el asistente o phone number en VAPI, pasa el `business_id` en metadata:

```typescript
const assistant = await vapi.assistants.create({
  name: "Receptionist Test Medical",
  // ... otras configuraciones
  metadata: {
    business_id: "uuid-del-business-desde-tu-db"
  }
});
```

Esta metadata se enviará automáticamente en cada llamada a la function tool.

## Testing

### 1. Test Manual (Postman/cURL):

```bash
curl -X POST https://apirecepcionistai.pedidosatr.com/contacts/from-conversation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "business_id": "tu-business-uuid",
    "phone": "+5491154686272",
    "name": "Test Contact",
    "source": "call",
    "intent": "agendar_turno",
    "notes": "Test desde VAPI"
  }'
```

### 2. Test desde VAPI:

1. Crear un test call
2. Hacer que el asistente pregunte tu nombre y teléfono
3. Verificar en la tabla de Contactos que aparezca el nuevo contacto
4. Verificar que tenga los tags automáticos asignados

## Endpoints Disponibles

### Contactos
- `GET /contacts?business_id={id}&page=1&limit=50&search=&tags=&source=`
- `POST /contacts` - Crear contacto manual
- `GET /contacts/{id}?business_id={id}`
- `PATCH /contacts/{id}?business_id={id}`
- `DELETE /contacts/{id}?business_id={id}`
- `POST /contacts/from-conversation` - **Para VAPI**

### Tags
- `GET /tags?business_id={id}` - Listar tags del business
- `POST /tags` - Crear tag personalizado
- `PATCH /tags/{id}?business_id={id}` - Editar tag
- `DELETE /tags/{id}?business_id={id}` - Eliminar tag

### Contact Tags
- `GET /contacts/{id}/tags` - Tags del contacto
- `POST /contacts/{id}/tags` - Asignar tags (body: `{ tag_ids: [...] }`)
- `DELETE /contacts/{id}/tags/{tagId}` - Quitar tag

## Próximos Pasos

1. **Crear tablas en la BD:**
   ```sql
   -- Ejecutar las migraciones de TypeORM
   npm run migration:run
   ```

2. **Configurar VAPI:**
   - Agregar la function tool en el dashboard de VAPI
   - Actualizar el system prompt con las instrucciones
   - Configurar el `business_id` en metadata

3. **Probar:**
   - Hacer una llamada de prueba
   - Verificar que el contacto se cree automáticamente
   - Verificar que los tags se asignen correctamente

