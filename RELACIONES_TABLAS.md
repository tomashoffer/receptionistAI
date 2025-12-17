# Relaciones entre Tablas - Resumen

## ✅ Relaciones Implementadas

### 1. **contacts ↔ appointments**

**Relación:** `One-to-Many` (Un contacto puede tener muchos appointments)

**En `Contact` entity:**
```typescript
@OneToMany(() => AppointmentEntity, (appointment) => appointment.contact)
appointments?: AppointmentEntity[];
```

**En `AppointmentEntity`:**
```typescript
@Column({ name: 'contact_id', nullable: true, type: 'uuid' })
contactId?: string;

@ManyToOne(() => Contact, { nullable: true })
@JoinColumn({ name: 'contact_id' })
contact?: Contact;
```

**Foreign Key:** `appointments.contact_id` → `contacts.id`
- **onDelete:** `SET NULL` (si se elimina el contacto, el appointment mantiene su `contact_id` como null)

**Migración:** `1733360400000-AddContactIdToAppointments.ts`

---

### 2. **contacts ↔ call_logs**

**Relación:** `One-to-Many` (Un contacto puede tener muchos call logs)

**En `Contact` entity:**
```typescript
@OneToMany(() => CallLog, (callLog) => callLog.contact)
callLogs?: CallLog[];
```

**En `CallLog` entity:**
```typescript
@Column({ type: 'uuid', nullable: true })
contact_id: string;

@ManyToOne(() => Contact, { nullable: true })
@JoinColumn({ name: 'contact_id' })
contact?: Contact;
```

**Foreign Key:** `call_logs.contact_id` → `contacts.id`
- **onDelete:** `SET NULL` (si se elimina el contacto, el call log mantiene su `contact_id` como null)

**Migración:** `1733400000000-AddSummaryAndContactIdToCallLogs.ts`

---

## 📊 Diagrama de Relaciones

```
contacts (1)
  │
  ├─── (1:N) ───> appointments
  │                - contact_id (FK, nullable)
  │
  └─── (1:N) ───> call_logs
                   - contact_id (FK, nullable)
```

---

## 🔍 Uso de las Relaciones

### Obtener appointments de un contacto:
```typescript
const contact = await contactRepository.findOne({
  where: { id: contactId },
  relations: ['appointments'] // Carga los appointments relacionados
});
```

### Obtener call logs de un contacto:
```typescript
const contact = await contactRepository.findOne({
  where: { id: contactId },
  relations: ['callLogs'] // Carga los call logs relacionados
});
```

### Obtener contacto de un appointment:
```typescript
const appointment = await appointmentRepository.findOne({
  where: { id: appointmentId },
  relations: ['contact'] // Carga el contacto relacionado
});
```

### Obtener contacto de un call log:
```typescript
const callLog = await callLogRepository.findOne({
  where: { id: callLogId },
  relations: ['contact'] // Carga el contacto relacionado
});
```

---

## ⚠️ Notas Importantes

1. **Relaciones Opcionales:** Tanto `appointments.contact_id` como `call_logs.contact_id` son `nullable: true`
   - Esto permite tener appointments/call logs sin contacto asociado (datos legacy o casos especiales)

2. **onDelete: SET NULL:** Si se elimina un contacto:
   - Los appointments asociados NO se eliminan, solo se les pone `contact_id = null`
   - Los call logs asociados NO se eliminan, solo se les pone `contact_id = null`
   - Esto preserva el historial de datos

3. **Dependencias Circulares:** Las relaciones usan funciones arrow `() => Entity` para evitar problemas de importación circular:
   ```typescript
   @ManyToOne(() => Contact, { nullable: true })
   ```

4. **Lazy Loading:** Las relaciones se cargan solo cuando se especifica en `relations: []` o cuando se accede a la propiedad

---

## 🚀 Flujo de Datos en n8n

### Al crear un appointment:
1. Se busca/crea el contacto
2. Se crea el appointment
3. Se asigna `contact_id` al appointment
4. ✅ Relación establecida automáticamente

### Al crear un call log:
1. Se puede buscar el contacto por teléfono/email
2. Se crea el call log
3. Se asigna `contact_id` al call log (opcional)
4. ✅ Relación establecida si se proporciona `contact_id`

---

## 📝 Campos Agregados

### En `appointments`:
- ✅ `contact_id` (uuid, nullable) - Ya existía desde migración anterior

### En `call_logs`:
- ✅ `summary` (text, nullable) - Nuevo campo para resumen de llamada
- ✅ `contact_id` (uuid, nullable) - Nuevo campo para relación con contacto

---

## ✅ Estado Final

- ✅ Relaciones TypeORM configuradas
- ✅ Foreign Keys en base de datos (via migraciones)
- ✅ Campos agregados a entidades
- ✅ Migraciones creadas y listas para ejecutar
- ✅ Sin errores de linting
- ✅ Sin dependencias circulares (usando funciones arrow)

