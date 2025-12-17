# Guía de Uso de API para Templates de n8n

Esta guía explica cómo utilizar los endpoints de la API para reemplazar las operaciones de Google Sheets en los workflows de n8n.

## 🔐 Autenticación

✅ **BUENAS NOTICIAS:** Los endpoints necesarios para n8n son **públicos** (no requieren autenticación).

**No necesitas configurar headers de autenticación** para estos endpoints:
- `/contacts/by-identifier`
- `/contacts` (POST)
- `/contacts/{id}/appointments`
- `/appointments/range`
- `/appointments/by-calendar-id`
- `/appointments/with-contact`
- `/appointments/{id}` (PATCH/DELETE)
- `/call-logs/webhook`

**Solo necesitas:**
```
Content-Type: application/json
```

**Nota:** Si en el futuro necesitas endpoints protegidos, puedes usar el endpoint `/auth/login` para obtener un token JWT.

---

## 📋 Variables de Entorno Recomendadas en n8n

Configura estas variables en n8n para facilitar el uso:

- `API_BASE_URL`: URL base de tu API (ej: `http://localhost:3001` o `https://api.tudominio.com`)
- `BUSINESS_ID`: ID del negocio (business_id) que usarás en todas las llamadas

**Nota:** Ya no necesitas `API_TOKEN` porque los endpoints son públicos.

---

## 📝 Templates y sus Endpoints

### 1. **Client Lookup** (Búsqueda de Cliente)

**Objetivo:** Buscar un cliente en el CRM por email o teléfono y verificar si tiene appointments previos.

#### Paso 1: Buscar Contacto
**Endpoint:** `GET /contacts/by-identifier`

**Configuración en n8n:**
- **Método:** GET
- **URL:** `{{$env.API_BASE_URL}}/contacts/by-identifier`
- **Query Parameters:**
  - `business_id`: `{{$env.BUSINESS_ID}}`
  - `email`: `={{ $json.email }}` (del workflow input)
  - `phone`: `={{ $json.phone }}` (opcional, si tienes teléfono)

**Headers:**
```
Content-Type: application/json
```
*(No requiere autenticación - endpoint público)*

**Respuesta:**
- Si encuentra el contacto: retorna objeto con `id`, `name`, `email`, `phone`, etc.
- Si no encuentra: retorna `null` o `{}`

#### Paso 2: Verificar Appointments (si el contacto existe)
**Endpoint:** `GET /contacts/{contact_id}/appointments`

**Configuración en n8n:**
- **Método:** GET
- **URL:** `{{$env.API_BASE_URL}}/contacts/{{ $json.id }}/appointments`
- **Headers:**
```
Content-Type: application/json
```
*(No requiere autenticación - endpoint público)*

**Respuesta:**
```json
{
  "all": [...],
  "past": [...],
  "upcoming": [...],
  "last": {...},
  "next": {...},
  "total": 5
}
```

#### Lógica del Workflow:
1. Si contacto existe Y tiene appointments → mensaje: "Cliente existe con historial"
2. Si contacto existe PERO NO tiene appointments → mensaje: "Cliente existe sin historial"
3. Si contacto NO existe → mensaje: "Nuevo cliente"

---

### 2. **New Client CRM** (Crear Nuevo Cliente)

**Objetivo:** Crear un nuevo contacto en el CRM.

**Endpoint:** `POST /contacts`

**Configuración en n8n:**
- **Método:** POST
- **URL:** `{{$env.API_BASE_URL}}/contacts`
- **Headers:**
  ```
  Content-Type: application/json
  ```
  *(No requiere autenticación - endpoint público)*
- **Body (JSON):**
```json
{
  "business_id": "{{$env.BUSINESS_ID}}",
  "name": "={{ $json.fullName }}",
  "phone": "={{ $json.phoneNumber }}",
  "email": "={{ $json.email }}",
  "source": "call"
}
```

**Respuesta:**
```json
{
  "id": "uuid-del-contacto",
  "name": "...",
  "email": "...",
  "phone": "...",
  ...
}
```

**Nota:** Si el contacto ya existe (por teléfono o email), retornará error 409 (Conflict).

---

### 3. **Check Availability** (Verificar Disponibilidad)

**Objetivo:** Verificar disponibilidad de appointments en un rango de tiempo.

**Endpoint:** `GET /appointments/range`

**Configuración en n8n:**
- **Método:** GET
- **URL:** `{{$env.API_BASE_URL}}/appointments/range`
- **Query Parameters:**
  - `startDate`: `={{ $json.afterTime }}` (formato: `YYYY-MM-DD` o `YYYY-MM-DDTHH:mm:ssZ`)
  - `endDate`: `={{ $json.beforeTime }}` (formato: `YYYY-MM-DD` o `YYYY-MM-DDTHH:mm:ssZ`)

**Headers:**
```
Content-Type: application/json
```
*(No requiere autenticación - endpoint público)*

**Transformación de Fechas (si es necesario):**
Si recibes fechas en formato ISO 8601 (`2024-01-15T10:00:00Z`), puedes extraer solo la fecha:
```javascript
{{ $json.afterTime.split('T')[0] }}
```

**Respuesta:**
- Array vacío `[]` → "El día completo está disponible"
- Array con appointments → Lista de appointments ocupados

**Lógica del Workflow:**
1. Si `response.length === 0` → mensaje: "El día completo está disponible"
2. Si `response.length > 0` → retornar lista de appointments ocupados

---

### 4. **Book Event** (Reservar Cita)

**Objetivo:** Crear un appointment y asociarlo a un contacto (creando el contacto si no existe).

**⚠️ IMPORTANTE:** n8n debe crear el evento en Google Calendar **PRIMERO**, y luego llamar a la API pasando el `googleCalendarEventId`.

**Flujo Recomendado en n8n:**

#### Paso 1: Crear Evento en Google Calendar
- **Node:** Google Calendar - "Create an event"
- **Configuración:** Usar los datos del workflow (startTime, endTime, email, eventSummary)
- **Resultado:** Obtener el `id` del evento creado

#### Paso 2: Llamar a la API
**Endpoint:** `POST /appointments/with-contact`

**Configuración en n8n:**
- **Método:** POST
- **URL:** `{{$env.API_BASE_URL}}/appointments/with-contact`
- **Headers:**
```
Content-Type: application/json
```
*(No requiere autenticación - endpoint público)*
- **Body (JSON):**
```json
{
  "business_id": "{{$env.BUSINESS_ID}}",
  "clientName": "={{ $json.clientName }}",
  "clientPhone": "={{ $json.phone }}",
  "clientEmail": "={{ $json.email }}",
  "serviceType": "={{ $json.eventSummary }}",
  "appointmentDate": "={{ $json.startTime.split('T')[0] }}",
  "appointmentTime": "={{ $json.startTime.split('T')[1].substring(0, 5) }}",
  "googleCalendarEventId": "={{ $('Create an event').item.json.id }}",
  "notes": "Appointment Booked"
}
```

**Transformación de Fechas:**
- `startTime` viene como ISO 8601: `2024-01-15T10:00:00Z`
- `appointmentDate`: extraer fecha → `2024-01-15`
- `appointmentTime`: extraer hora → `10:00`

**Respuesta:**
```json
{
  "id": "uuid-del-appointment",
  "contactId": "uuid-del-contacto",
  "clientName": "...",
  "appointmentDate": "2024-01-15",
  "appointmentTime": "10:00",
  "googleCalendarEventId": "event-id-de-google-calendar",
  ...
}
```

**Nota:** Este endpoint automáticamente:
1. Busca el contacto por email o teléfono
2. Si no existe, lo crea
3. Crea el appointment en nuestra base de datos
4. Asocia el appointment al contacto
5. Guarda el `googleCalendarEventId` del evento creado por n8n

**⚠️ La API NO crea eventos en Google Calendar** - n8n es responsable de eso.

---

### 5. **Lookup Appointment** (Buscar Citas)

**Objetivo:** Obtener appointments en un rango de tiempo.

**Endpoint:** `GET /appointments/range`

**Configuración en n8n:**
- **Método:** GET
- **URL:** `{{$env.API_BASE_URL}}/appointments/range`
- **Query Parameters:**
  - `startDate`: `={{ $json.afterTime }}`
  - `endDate`: `={{ $json.beforeTime }}`

**Headers:**
```
Content-Type: application/json
```
*(No requiere autenticación - endpoint público)*

**Respuesta:**
Array de appointments con toda la información.

---

### 6. **Update Appointment** (Actualizar Cita)

**Objetivo:** Actualizar un appointment existente.

**Paso 1: Buscar Appointment por Google Calendar Event ID**
**Endpoint:** `GET /appointments/by-calendar-id`

**Configuración en n8n:**
- **Método:** GET
- **URL:** `{{$env.API_BASE_URL}}/appointments/by-calendar-id`
- **Query Parameters:**
  - `googleCalendarEventId`: `={{ $json.eventID }}`

**Headers:**
```
Content-Type: application/json
```
*(No requiere autenticación - endpoint público)*

**Respuesta:**
```json
{
  "id": "uuid-del-appointment",
  "googleCalendarEventId": "...",
  ...
}
```

**Paso 2: Actualizar Appointment**
**Endpoint:** `PATCH /appointments/{id}`

**Configuración en n8n:**
- **Método:** PATCH
- **URL:** `{{$env.API_BASE_URL}}/appointments/{{ $json.id }}`
- **Headers:**
```
Content-Type: application/json
```
*(No requiere autenticación - endpoint público)*
- **Body (JSON):**
```json
{
  "appointmentDate": "={{ $json.startTime.split('T')[0] }}",
  "appointmentTime": "={{ $json.startTime.split('T')[1].substring(0, 5) }}",
  "notes": "Moved to {{ $json.startTime }}"
}
```

**Nota:** El workflow actual actualiza Google Calendar primero, luego actualiza el appointment. Mantén ese orden.

---

### 7. **Delete Appointment** (Eliminar Cita)

**Objetivo:** Marcar un appointment como cancelado (o eliminarlo).

**Paso 1: Buscar Appointment por Google Calendar Event ID**
**Endpoint:** `GET /appointments/by-calendar-id`

**Configuración en n8n:**
- **Método:** GET
- **URL:** `{{$env.API_BASE_URL}}/appointments/by-calendar-id`
- **Query Parameters:**
  - `googleCalendarEventId`: `={{ $json.eventID }}`

**Headers:**
```
Content-Type: application/json
```
*(No requiere autenticación - endpoint público)*

**Paso 2: Actualizar Appointment como Cancelado**
**Endpoint:** `PATCH /appointments/{id}`

**Configuración en n8n:**
- **Método:** PATCH
- **URL:** `{{$env.API_BASE_URL}}/appointments/{{ $json.id }}`
- **Headers:**
```
Content-Type: application/json
```
*(No requiere autenticación - endpoint público)*
- **Body (JSON):**
```json
{
  "status": "cancelled",
  "notes": "Canceled"
}
```

**Alternativa (Eliminar completamente):**
Si prefieres eliminar el appointment en lugar de marcarlo como cancelado:

**Endpoint:** `DELETE /appointments/{id}`

**Configuración en n8n:**
- **Método:** DELETE
- **URL:** `{{$env.API_BASE_URL}}/appointments/{{ $json.id }}`
- **Headers:** Solo Authorization

**Nota:** El workflow actual elimina de Google Calendar primero, luego actualiza el registro. Mantén ese orden.

---

### 8. **Hercules Receptionist EOC Report** (Reporte de Fin de Llamada)

**Objetivo:** Guardar un registro de llamada (call log) con el resumen y resultado.

**Endpoint:** `POST /call-logs/webhook` (Endpoint público, no requiere autenticación)

**Configuración en n8n:**
- **Método:** POST
- **URL:** `{{$env.API_BASE_URL}}/call-logs/webhook`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (JSON):**
```json
{
  "business_id": "{{$env.BUSINESS_ID}}",
  "call_sid": "={{ $json.body.message.callSid || 'unknown' }}",
  "caller_number": "={{ $json.body.message.from }}",
  "called_number": "={{ $json.body.message.to }}",
  "direction": "inbound",
  "status": "completed",
  "duration_seconds": 0,
  "started_at": "={{ $now.toISO() }}",
  "summary": "={{ $json.body.message.analysis.summary }}",
  "outcome": "={{ $json.body.message.analysis.structuredData.Outcome }}",
  "transcription": "={{ $json.body.message.transcript }}"
}
```

**Respuesta:**
```json
{
  "id": "uuid-del-call-log",
  "summary": "...",
  "outcome": "...",
  ...
}
```

**Nota:** Este endpoint es público (no requiere autenticación) para facilitar el uso desde webhooks externos.

---

## 🔄 Transformaciones de Datos Comunes

### Convertir Fecha ISO 8601 a Date y Time

Si recibes `startTime` como `2024-01-15T10:00:00Z`:

**En n8n (Expressions):**
```javascript
// Para appointmentDate (solo fecha)
{{ $json.startTime.split('T')[0] }}

// Para appointmentTime (solo hora)
{{ $json.startTime.split('T')[1].substring(0, 5) }}
```

### Convertir Fecha ISO 8601 a Timestamp

```javascript
{{ new Date($json.startTime).toISOString() }}
```

---

## 📊 Resumen de Endpoints

| Workflow | Endpoint | Método | Autenticación |
|----------|----------|--------|---------------|
| Client Lookup | `/contacts/by-identifier` | GET | ❌ (Público) |
| Client Lookup | `/contacts/{id}/appointments` | GET | ❌ (Público) |
| New Client CRM | `/contacts` | POST | ❌ (Público) |
| Check Availability | `/appointments/range` | GET | ❌ (Público) |
| Book Event | `/appointments/with-contact` | POST | ❌ (Público) |
| Lookup Appointment | `/appointments/range` | GET | ❌ (Público) |
| Update Appointment | `/appointments/by-calendar-id` | GET | ❌ (Público) |
| Update Appointment | `/appointments/{id}` | PATCH | ❌ (Público) |
| Delete Appointment | `/appointments/by-calendar-id` | GET | ❌ (Público) |
| Delete Appointment | `/appointments/{id}` | PATCH/DELETE | ❌ (Público) |
| EOC Report | `/call-logs/webhook` | POST | ❌ (Público) |

---

## ⚠️ Consideraciones Importantes

1. **Business ID:** Todos los endpoints (excepto algunos públicos) requieren `business_id`. Configúralo como variable de entorno.

2. **Formato de Fechas:**
   - API espera: `appointmentDate: "YYYY-MM-DD"` y `appointmentTime: "HH:MM"`
   - Google Calendar usa: ISO 8601 (`YYYY-MM-DDTHH:mm:ssZ`)
   - Usa las transformaciones mostradas arriba

3. **Manejo de Errores:**
   - 404: Recurso no encontrado
   - 409: Conflicto (ej: contacto duplicado)
   - 401: No autenticado
   - 403: Sin permisos

4. **Relaciones:**
   - Los appointments se relacionan con contacts mediante `contact_id`
   - El endpoint `/appointments/with-contact` maneja esto automáticamente

5. **Google Calendar:**
   - Los workflows aún interactúan con Google Calendar
   - La API guarda el `googleCalendarEventId` en el appointment
   - Usa `/appointments/by-calendar-id` para buscar por ese ID

---

## 🚀 Ejemplo Completo: Book Event

Aquí tienes un ejemplo completo de cómo configurar el workflow "Book Event":

### Node 1: HTTP Request - Crear Appointment con Contacto

**Configuración:**
- **Name:** "Create Appointment with Contact"
- **Method:** POST
- **URL:** `{{$env.API_BASE_URL}}/appointments/with-contact`
- **Headers:**
  - **Name:** `Content-Type`
  - **Value:** `application/json`
- **Body Parameters (JSON):**
```json
{
  "business_id": "{{$env.BUSINESS_ID}}",
  "clientName": "={{ $json.fullName }}",
  "clientPhone": "={{ $json.phone }}",
  "clientEmail": "={{ $json.email }}",
  "serviceType": "={{ $json.eventSummary }}",
  "appointmentDate": "={{ $json.startTime.split('T')[0] }}",
  "appointmentTime": "={{ $json.startTime.split('T')[1].substring(0, 5) }}",
  "notes": "Appointment Booked"
}
```

**Respuesta esperada:**
```json
{
  "id": "abc-123",
  "contactId": "xyz-789",
  "googleCalendarEventId": "cal-event-id",
  ...
}
```

---

## 📞 Soporte

Si tienes dudas sobre algún endpoint o necesitas ayuda con la configuración, consulta la documentación de la API o contacta al equipo de desarrollo.

