# Integración Google Calendar por Business

## 🎯 Problema

Cada business debe tener SU PROPIO calendario de Google. No podemos usar un solo calendario global porque:
- Cada usuario puede tener múltiples businesses
- Cada business puede tener su propio email/calendario
- Las citas deben ir al calendario correcto

## ✅ Solución Implementada

### 1. Estructura en la Base de Datos

El `Business` entity ya tiene la estructura para Google Calendar:

```typescript
@Column({ type: 'json', nullable: true })
google_calendar_config: {
  calendar_id: string;
  access_token: string;
  refresh_token: string;
  enabled: boolean;
};
```

### 2. Flujo de Autenticación

#### Paso 1: El Business hace OAuth con Google

1. El owner del business va a su dashboard
2. Click en "Conectar Google Calendar"
3. Se redirige a Google OAuth
4. Google devuelve `access_token` y `refresh_token`
5. Los guardamos en `business.google_calendar_config`

#### Paso 2: Cuando se crea un appointment

1. ElevenLabs envía webhook con los datos del appointment
2. El backend busca el `businessId` en la URL
3. Busca el `google_calendar_config` del business
4. Si no tiene Google Calendar conectado → Solo crea en BD (sin calendar)
5. Si tiene Google Calendar → Crea evento en el calendario del business

### 3. Endpoint de OAuth

```typescript
// Iniciar OAuth con Google
GET /api/business/:id/google/connect

// Callback de Google
GET /api/business/:id/google/callback?code=...
```

## 🔧 Implementación Necesaria

### 1. Modificar GoogleService para trabajar con tokens por business

```typescript
async createCalendarEvent(appointment: AppointmentEntity, businessId: string) {
  // Buscar el business
  const business = await this.businessService.findOne(businessId);
  
  if (!business.google_calendar_config?.enabled) {
    this.logger.warn('Google Calendar no está configurado para este business');
    return null;
  }

  // Crear cliente OAuth2 con los tokens del business
  const oauth2Client = new google.auth.OAuth2(
    this.configService.get('GOOGLE_CLIENT_ID'),
    this.configService.get('GOOGLE_CLIENT_SECRET')
  );

  oauth2Client.setCredentials({
    access_token: business.google_calendar_config.access_token,
    refresh_token: business.google_calendar_config.refresh_token
  });

  // Crear calendario con los credenciales del business
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  // Crear evento
  const event = await calendar.events.insert({
    calendarId: business.google_calendar_config.calendar_id,
    requestBody: {
      summary: `Cita: ${appointment.clientName}`,
      description: appointment.notes,
      start: {
        dateTime: `${appointment.appointmentDate}T${appointment.appointmentTime}:00`,
        timeZone: 'America/Argentina/Buenos_Aires'
      },
      end: {
        dateTime: `${appointment.appointmentDate}T${appointment.appointmentTime}:00`,
        timeZone: 'America/Argentina/Buenos_Aires'
      },
      attendees: [{ email: appointment.clientEmail }]
    }
  });

  return event;
}
```

### 2. Crear endpoints de OAuth para Business

```typescript
// GET /api/business/:id/google/connect
@Get(':id/google/connect')
async connectGoogleCalendar(@Param('id') id: string, @Res() res: Response) {
  const oauth2Client = new google.auth.OAuth2(
    this.configService.get('GOOGLE_CLIENT_ID'),
    this.configService.get('GOOGLE_CLIENT_SECRET'),
    this.configService.get('GOOGLE_REDIRECT_URI') // http://localhost:3001/api/business/:id/google/callback
  );

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ],
    state: id // Pasar el business ID en el state
  });

  res.redirect(url);
}

// GET /api/business/:id/google/callback
@Get(':id/google/callback')
async handleGoogleCallback(
  @Param('id') id: string,
  @Query('code') code: string,
  @Res() res: Response
) {
  const oauth2Client = new google.auth.OAuth2(
    this.configService.get('GOOGLE_CLIENT_ID'),
    this.configService.get('GOOGLE_CLIENT_SECRET'),
    this.configService.get('GOOGLE_REDIRECT_URI')
  );

  const { tokens } = await oauth2Client.getToken(code);
  
  // Listar calendarios del usuario para que elija
  oauth2Client.setCredentials(tokens);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const calendars = await calendar.calendarList.list();
  
  // Guardar configuración en el business
  await this.businessService.update(id, {
    google_calendar_config: {
      calendar_id: calendars.data.items[0].id, // o permitir que elija
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      enabled: true
    }
  });

  res.redirect(`http://localhost:3000/dashboard?google_connected=true`);
}
```

### 3. Modificar el webhook de ElevenLabs

```typescript
@Post('elevenlabs/appointment/:businessId')
async handleElevenLabsAppointment(
  @Param('businessId') businessId: string,
  @Body() webhookData: any
) {
  // ... validar datos ...

  // Buscar el business
  const business = await this.businessService.findOne(businessId);
  
  if (!business) {
    return { success: false, message: 'Business no encontrado' };
  }

  // Crear el appointment
  const appointment = await this.appointmentsService.create({
    ...webhookData,
    businessId
  });

  // Intentar crear evento en Google Calendar (si está configurado)
  if (business.google_calendar_config?.enabled) {
    try {
      const calendarEvent = await this.googleService.createCalendarEvent(
        appointment,
        businessId
      );
      
      // Actualizar el appointment con el calendar event ID
      await this.appointmentsService.update(appointment.id, {
        googleCalendarEventId: calendarEvent.id
      });
    } catch (error) {
      this.logger.error('Error creando evento en Google Calendar:', error);
      // No fallar el appointment, solo loguear el error
    }
  }

  return { success: true, appointment_id: appointment.id };
}
```

## 🎯 Flujo Completo

### Para el Business Owner:

1. **Crear un business** → Ya tiene `google_calendar_config: null`
2. **Conectar Google Calendar**:
   - Va a Dashboard
   - Click "Conectar Google Calendar"
   - Se abre popup de Google OAuth
   - Selecciona cuenta y permisos
   - Se guarda `access_token` y `refresh_token` en el business
3. **Listo** → Ahora las citas se crearán en SU calendario

### Cuando se crea un appointment:

1. ElevenLabs envía webhook
2. Backend busca el business
3. Si tiene Google Calendar conectado:
   - Crea el evento en SU calendario
   - Envía email al cliente con el .ics
4. Si NO tiene Google Calendar:
   - Solo guarda en BD
   - No envía email (o envía email sin .ics)

## 📝 Checklist de Implementación

- [ ] Modificar `GoogleService.createCalendarEvent()` para usar tokens del business
- [ ] Crear endpoint `GET /api/business/:id/google/connect`
- [ ] Crear endpoint `GET /api/business/:id/google/callback`
- [ ] Crear endpoint `GET /api/business/:id/google/calendars` (para listar calendarios)
- [ ] Crear endpoint `POST /api/business/:id/google/select-calendar` (para elegir calendario)
- [ ] Modificar webhook de ElevenLabs para usar business-specific calendar
- [ ] Agregar UI en el dashboard para conectar Google Calendar
- [ ] Agregar indicador visual si tiene/no tiene Google Calendar conectado
- [ ] Permitir desconectar Google Calendar
- [ ] Permitir elegir entre múltiples calendarios de la misma cuenta

## 🔑 Configuración por Business

Cada business puede tener:
- ✅ Su propio email de Google Calendar
- ✅ Múltiples calendarios (ej: "Consultas", "Seguimientos", etc.)
- ✅ Configuración independiente de otros businesses del mismo owner

## ⚠️ Consideraciones de Seguridad

1. **Tokens encriptados**: Los `access_token` y `refresh_token` deberían encriptarse en la BD
2. **Refresh automático**: Implementar refresh del token antes de expirar
3. **Permisos mínimos**: Solo solicitar permisos de Calendar (no email, drive, etc.)
4. **Revocación**: Si el business desconecta, revocar el token

## 🧪 Testing

```bash
# 1. Conectar Google Calendar para un business
GET http://localhost:3001/api/business/{businessId}/google/connect

# 2. Verificar que se guardó la config
GET http://localhost:3001/api/business/{businessId}

# 3. Crear appointment desde ElevenLabs
POST http://localhost:3001/api/webhooks/elevenlabs/appointment/{businessId}
{
  "client_name": "Juan Pérez",
  "client_email": "juan@ejemplo.com",
  ...
}

# 4. Verificar en Google Calendar que el evento se creó
# 5. Verificar que el cliente recibió el email con .ics
```

## 📧 Email con Calendar Invite

Si Google Calendar está configurado:
- ✅ Se crea el evento en el calendario del business
- ✅ Se genera el archivo `.ics`
- ✅ Se envía email al cliente con el `.ics` adjunto

Si Google Calendar NO está configurado:
- ✅ Se guarda el appointment en la BD
- ⚠️ Se envía email sin adjunto (o no se envía)
- ⚠️ No se crea evento en Google Calendar

## 🎯 Siguiente Paso

Implementar la autenticación OAuth por business para que cada business pueda conectar su propio Google Calendar.

