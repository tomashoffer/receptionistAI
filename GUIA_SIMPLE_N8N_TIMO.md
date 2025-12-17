# 📋 Guía Simple para Usar la API en Templates de n8n

**Para:** Timo  
**API URL:** `https://apirecepcionistai.pedidosatr.com/`  
**Fecha:** Diciembre 2024

---

## 🎯 Lo Básico que Necesitas Saber

### 1. **URL de la API**
Usa esta URL base para todos los endpoints:
```
https://apirecepcionistai.pedidosatr.com
```

### 2. **Business ID**
Necesitas un `business_id` (ID del negocio). Este es un código único que identifica tu negocio en el sistema.

**¿Cómo obtenerlo?**
- Pregúntale a Tomás o revisa en la base de datos
- Es un código que se ve así: `123e4567-e89b-12d3-a456-426614174000`

**Configúralo como variable en n8n:**
- Ve a Settings → Variables
- Crea una variable llamada `BUSINESS_ID`
- Pega tu business_id ahí

### 3. **No Necesitas Autenticación**
Todos los endpoints que vas a usar son públicos. Solo necesitas:
- Header: `Content-Type: application/json`

---

## 📝 Templates y Qué Hacer en Cada Uno

### 1. **Client Lookup** (Buscar Cliente)

**¿Qué hace?** Busca si un cliente existe en el sistema y si tiene citas previas.

**Paso 1: Buscar el Cliente**
- **Tipo de Node:** HTTP Request
- **Método:** GET
- **URL:** `https://apirecepcionistai.pedidosatr.com/contacts/by-identifier`
- **Query Parameters:**
  - `business_id` = `{{$env.BUSINESS_ID}}`
  - `email` = `={{ $json.email }}` (el email que viene del workflow)

**Paso 2: Si el Cliente Existe, Ver sus Citas**
- **Tipo de Node:** HTTP Request
- **Método:** GET
- **URL:** `https://apirecepcionistai.pedidosatr.com/contacts/{{ $json.id }}/appointments`
- (Usa el `id` que te devolvió el paso anterior)

**Resultado:**
- Si encuentra el cliente y tiene citas → "Cliente existe con historial"
- Si encuentra el cliente pero NO tiene citas → "Cliente existe sin historial"
- Si NO encuentra el cliente → "Nuevo cliente"

---

### 2. **New Client CRM** (Crear Cliente Nuevo)

**¿Qué hace?** Crea un nuevo cliente en el sistema.

**Qué Hacer:**
- **Tipo de Node:** HTTP Request
- **Método:** POST
- **URL:** `https://apirecepcionistai.pedidosatr.com/contacts`
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

**Nota:** Si el cliente ya existe, te dará un error. Eso está bien, significa que ya está registrado.

---

### 3. **Check Availability** (Verificar Disponibilidad)

**¿Qué hace?** Verifica si hay citas ocupadas en un rango de fechas.

**Qué Hacer:**
- **Tipo de Node:** HTTP Request
- **Método:** GET
- **URL:** `https://apirecepcionistai.pedidosatr.com/appointments/range`
- **Query Parameters:**
  - `startDate` = `={{ $json.afterTime.split('T')[0] }}`
  - `endDate` = `={{ $json.beforeTime.split('T')[0] }}`

**Resultado:**
- Si te devuelve un array vacío `[]` → "El día completo está disponible"
- Si te devuelve citas → Muestra las citas ocupadas

---

### 4. **Book Event** (Reservar Cita)

**¿Qué hace?** Crea una cita en el sistema y la asocia a un cliente.

**⚠️ IMPORTANTE:** Primero creas el evento en Google Calendar (como siempre), y LUEGO llamas a la API.

**Paso 1: Crear Evento en Google Calendar** (Ya lo haces normalmente)
- Usa el nodo de Google Calendar
- Obtén el `id` del evento creado

**Paso 2: Guardar en la API**
- **Tipo de Node:** HTTP Request
- **Método:** POST
- **URL:** `https://apirecepcionistai.pedidosatr.com/appointments/with-contact`
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

**Nota:** 
- `googleCalendarEventId` es el ID del evento que creaste en Google Calendar (Paso 1)
- La API automáticamente busca o crea el cliente
- La API guarda la cita en nuestra base de datos

---

### 5. **Lookup Appointment** (Buscar Citas)

**¿Qué hace?** Obtiene todas las citas en un rango de fechas.

**Qué Hacer:**
- **Tipo de Node:** HTTP Request
- **Método:** GET
- **URL:** `https://apirecepcionistai.pedidosatr.com/appointments/range`
- **Query Parameters:**
  - `startDate` = `={{ $json.afterTime.split('T')[0] }}`
  - `endDate` = `={{ $json.beforeTime.split('T')[0] }}`

**Resultado:** Te devuelve un array con todas las citas en ese rango.

---

### 6. **Update Appointment** (Actualizar Cita)

**¿Qué hace?** Actualiza una cita existente.

**Paso 1: Buscar la Cita**
- **Tipo de Node:** HTTP Request
- **Método:** GET
- **URL:** `https://apirecepcionistai.pedidosatr.com/appointments/by-calendar-id`
- **Query Parameters:**
  - `googleCalendarEventId` = `={{ $json.eventID }}`

**Paso 2: Actualizar la Cita**
- **Tipo de Node:** HTTP Request
- **Método:** PATCH
- **URL:** `https://apirecepcionistai.pedidosatr.com/appointments/{{ $json.id }}`
- **Body (JSON):**
```json
{
  "appointmentDate": "={{ $json.startTime.split('T')[0] }}",
  "appointmentTime": "={{ $json.startTime.split('T')[1].substring(0, 5) }}",
  "notes": "Moved to {{ $json.startTime }}"
}
```

**Nota:** 
- Primero actualizas Google Calendar (como siempre)
- Luego actualizas en la API usando el `id` que obtuviste en el Paso 1

---

### 7. **Delete Appointment** (Eliminar Cita)

**¿Qué hace?** Marca una cita como cancelada.

**Paso 1: Buscar la Cita**
- **Tipo de Node:** HTTP Request
- **Método:** GET
- **URL:** `https://apirecepcionistai.pedidosatr.com/appointments/by-calendar-id`
- **Query Parameters:**
  - `googleCalendarEventId` = `={{ $json.eventID }}`

**Paso 2: Marcar como Cancelada**
- **Tipo de Node:** HTTP Request
- **Método:** PATCH
- **URL:** `https://apirecepcionistai.pedidosatr.com/appointments/{{ $json.id }}`
- **Body (JSON):**
```json
{
  "status": "cancelled",
  "notes": "Canceled"
}
```

**Nota:**
- Primero eliminas de Google Calendar (como siempre)
- Luego actualizas en la API usando el `id` que obtuviste en el Paso 1

---

### 8. **Hercules Receptionist EOC Report** (Reporte de Fin de Llamada)

**¿Qué hace?** Guarda un registro de la llamada con el resumen y resultado.

**Qué Hacer:**
- **Tipo de Node:** HTTP Request
- **Método:** POST
- **URL:** `https://apirecepcionistai.pedidosatr.com/call-logs/webhook`
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

---

## 🔧 Configuración en n8n

### Variables de Entorno que Necesitas

Ve a **Settings → Variables** y crea estas variables:

1. **API_BASE_URL**
   - Valor: `https://apirecepcionistai.pedidosatr.com`

2. **BUSINESS_ID**
   - Valor: Tu business_id (pregúntale a Tomás)

### Headers que Siempre Necesitas

En cada HTTP Request node, agrega este header:
- **Name:** `Content-Type`
- **Value:** `application/json`

---

## 📋 Resumen Rápido por Template

| Template | Endpoint | Método | ¿Necesita business_id? |
|----------|----------|--------|------------------------|
| Client Lookup | `/contacts/by-identifier` | GET | ✅ Sí (en query) |
| Client Lookup | `/contacts/{id}/appointments` | GET | ❌ No |
| New Client CRM | `/contacts` | POST | ✅ Sí (en body) |
| Check Availability | `/appointments/range` | GET | ❌ No |
| Book Event | `/appointments/with-contact` | POST | ✅ Sí (en body) |
| Lookup Appointment | `/appointments/range` | GET | ❌ No |
| Update Appointment | `/appointments/by-calendar-id` | GET | ❌ No |
| Update Appointment | `/appointments/{id}` | PATCH | ❌ No |
| Delete Appointment | `/appointments/by-calendar-id` | GET | ❌ No |
| Delete Appointment | `/appointments/{id}` | PATCH | ❌ No |
| EOC Report | `/call-logs/webhook` | POST | ✅ Sí (en body) |

---

## ⚠️ Puntos Importantes

1. **Google Calendar:** Tú manejas Google Calendar directamente en n8n. La API solo guarda los datos.

2. **Business ID:** Siempre que veas `business_id` en el body o query, usa `{{$env.BUSINESS_ID}}`

3. **Fechas:** Si recibes fechas como `2024-01-15T10:00:00Z`:
   - Para fecha: `={{ $json.startTime.split('T')[0] }}` → `2024-01-15`
   - Para hora: `={{ $json.startTime.split('T')[1].substring(0, 5) }}` → `10:00`

4. **Errores Comunes:**
   - 404: No encontró el recurso (cliente, cita, etc.)
   - 409: Conflicto (ej: cliente duplicado)
   - Si algo falla, revisa que el `business_id` esté correcto

---

## 🆘 Si Algo No Funciona

1. **Verifica el business_id:** Debe estar configurado como variable en n8n
2. **Verifica la URL:** Debe ser `https://apirecepcionistai.pedidosatr.com`
3. **Verifica los headers:** Debe tener `Content-Type: application/json`
4. **Revisa los logs:** n8n te mostrará el error exacto

---

## 📞 Contacto

Si tienes dudas, pregúntale a Tomás. Él tiene acceso a la base de datos y puede ayudarte con el `business_id` o cualquier problema técnico.

---

**Última actualización:** Diciembre 2024  
**Versión:** 1.0

