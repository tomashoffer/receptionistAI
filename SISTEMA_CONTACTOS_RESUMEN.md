# Sistema de Contactos - Implementación Completa

## ✅ Implementado

### Backend (NestJS + TypeORM)

#### Entidades:
1. **Contact** - Contacto del business
   - `id`, `business_id`, `name`, `phone`, `email`
   - `source` (call, whatsapp, instagram, facebook, web, manual)
   - `total_interactions`, `last_interaction`
   - `last_conversation_summary`, `conversation_id`
   - Relación N-a-N con Tags

2. **Tag** - Etiquetas personalizables por business
   - `id`, `business_id`, `label`, `color`, `icon`
   - Cada business crea sus propias tags
   - Tags con iconos emoji personalizables

3. **ContactTag** - Relación N-a-N
   - Un contacto puede tener múltiples tags
   - Un tag puede asignarse a múltiples contactos

#### Endpoints Implementados:

**Contactos:**
```
GET    /contacts?business_id={id}&page=1&limit=50&search=&tags=&source=
POST   /contacts
GET    /contacts/{id}?business_id={id}
PATCH  /contacts/{id}?business_id={id}
DELETE /contacts/{id}?business_id={id}
POST   /contacts/from-conversation  (VAPI Integration)
```

**Tags:**
```
GET    /tags?business_id={id}
POST   /tags
PATCH  /tags/{id}?business_id={id}
DELETE /tags/{id}?business_id={id}
```

**Contact Tags:**
```
GET    /contacts/{id}/tags
POST   /contacts/{id}/tags (body: { tag_ids: [...] })
DELETE /contacts/{id}/tags/{tagId}
```

#### Características del Backend:

✅ **UPSERT inteligente:** El endpoint `/contacts/from-conversation` busca por `(business_id, phone)` y actualiza si existe o crea si es nuevo

✅ **Tags automáticos:** Según intención y fuente:
- Intención: "Solicitud de Turno", "Consulta", "Quiere Cancelar", etc.
- Fuente: "☎️ Llamada", "💬 WhatsApp", "📷 Instagram"
- Generic: "👤 Lead Entrante"

✅ **Filtros avanzados:** Por búsqueda, tags, fuente

✅ **Paginación:** Configurable (default: 50 por página)

✅ **Multi-tenant:** Aislamiento total por `business_id`

### Frontend (Next.js + React)

#### Componentes Creados:

1. **Contactos.tsx** (reescrito)
   - Fetch de contactos reales desde API
   - Paginación funcional
   - Filtros por tags y fuente
   - Búsqueda en tiempo real
   - Refresh manual
   - Tabla con columnas: Actualizado, Nombre, Contacto, Email, Etiquetas, Creación, Interacciones

2. **TagCell.tsx**
   - Muestra tags del contacto con iconos y colores
   - Botón "+" para agregar tags inline
   - Botón "×" para quitar tags inline
   - Indicador "+N" cuando hay muchos tags (popover)

3. **TagSelector.tsx**
   - Dropdown con búsqueda de tags
   - Multi-select
   - Muestra cantidad de contactos por tag

4. **TagManagerModal.tsx**
   - Gestión completa de tags del business
   - Crear nuevo tag (nombre, color, icono)
   - Ver todos los tags
   - Eliminar tags (con confirmación)
   - Preview en vivo del tag

#### API Routes de Next.js:

```
app/src/app/api/
├── contacts/
│   ├── route.ts (GET, POST)
│   └── [id]/
│       ├── route.ts (GET, PATCH, DELETE)
│       └── tags/
│           ├── route.ts (GET, POST)
│           └── [tagId]/route.ts (DELETE)
└── tags/
    ├── route.ts (GET, POST)
    └── [id]/route.ts (PATCH, DELETE)
```

#### Características del Frontend:

✅ **UI moderna:** Tabla con header púrpura, hover effects, badges con iconos

✅ **Tags inline:** Agregar/quitar tags directamente desde la tabla

✅ **Filtros avanzados:** Panel con checkboxes para tags y fuentes

✅ **Tags personalizables:** 10 colores + 15 iconos emoji

✅ **Búsqueda:** Por nombre, teléfono, email

✅ **Paginación:** Navegación entre páginas con indicadores

✅ **Loading states:** Spinners y mensajes de carga

✅ **Responsive:** Adapta a mobile/tablet/desktop

## 🔧 Configuración VAPI

Ver archivo `VAPI_CONTACTOS_INTEGRATION.md` para:
- Definición de la Function Tool
- System Prompt actualizado
- Configuración de server URL
- Ejemplos de uso

## 📊 Flujo Completo

```
┌─────────────┐
│   Cliente   │ Llama/escribe al asistente AI
└──────┬──────┘
       │
       v
┌──────────────────┐
│  VAPI Assistant  │ Conversa y captura datos:
│  (Voice/Chat)    │ - Nombre
│                  │ - Teléfono
│                  │ - Email (opcional)
│                  │ - Intención
└──────┬───────────┘
       │ Llama a function tool
       v
┌─────────────────────────────────┐
│ POST /contacts/from-conversation│
│ - Busca contacto existente      │
│ - UPSERT (crea o actualiza)     │
│ - Asigna tags automáticos       │
│ - Incrementa total_interactions │
└──────┬──────────────────────────┘
       │
       v
┌───────────────────┐
│   Base de Datos   │
│   ✅ Guardado     │
└──────┬────────────┘
       │
       v
┌────────────────────────┐
│  Frontend (Contactos)  │
│  Usuario ve el contacto│
│  con tags automáticos  │
└────────────────────────┘
```

## 🎨 Colores de Tags Disponibles

| Color | Clase CSS | Uso sugerido |
|-------|-----------|--------------|
| 🩷 Rosa | `bg-pink-100 text-pink-700` | Leads, nuevos |
| 🟧 Naranja | `bg-orange-500 text-white` | Reservas pendientes |
| 🔵 Azul | `bg-blue-500 text-white` | Información general |
| ⚫ Gris | `bg-gray-600 text-white` | Inactivos |
| 🟢 Verde | `bg-green-500 text-white` | Confirmados, activos |
| 🟣 Morado | `bg-purple-500 text-white` | VIP, prioritarios |
| 🔴 Rojo | `bg-red-500 text-white` | Cancelaciones, problemas |
| 🟡 Amarillo | `bg-yellow-400 text-yellow-900` | Pendientes |
| 🔷 Índigo | `bg-indigo-500 text-white` | Web |
| 🔵 Teal | `bg-teal-500 text-white` | Otros |

## 📝 Iconos Disponibles

👤 🛏️ 💬 📅 🎁 ⭐ 🔥 ✅ ❌ 💰 ☎️ 📷 ❓ ℹ️ 🌐

Los usuarios pueden crear tags personalizados con cualquier combinación de nombre + color + icono.

## 🚀 Deploy

Ver archivo `DEPLOY_CONTACTOS.md` para instrucciones detalladas.

### Pasos rápidos:

1. **Ejecutar migración:**
   ```bash
   cd api
   npm run migration:run
   ```

2. **Verificar tablas:**
   ```bash
   sudo -u postgres psql -d receptionistai_db -c "\dt"
   ```

3. **Deploy backend:**
   ```powershell
   .\scripts\deploy-backend.ps1
   ```

4. **Deploy frontend:**
   ```bash
   ssh ubuntu@IP_SERVIDOR
   cd ~/receptionistAI-main/app
   git pull
   npm install
   npm run build
   sudo systemctl restart frontend.service
   ```

## 📈 Próximas Funcionalidades

### Fase 2:
- [ ] Modal para crear contacto manual
- [ ] Vista detalle del contacto (drawer lateral)
- [ ] Columnas dinámicas por industria (hotel vs salud)
- [ ] Appointments/Reservations (último turno, próximo turno)

### Fase 3:
- [ ] Importar contactos desde CSV/Excel
- [ ] Exportar contactos a CSV/Excel
- [ ] Bulk operations (asignar tags a múltiples contactos)
- [ ] Historial de interacciones con el AI

### Fase 4:
- [ ] Analytics de contactos (nuevos por mes, conversión)
- [ ] Tags sugeridos automáticamente por el AI
- [ ] "Próxima acción sugerida" tipo CRM
- [ ] Integración con WhatsApp Business API

