# Deploy del Sistema de Contactos

## 1. Verificar cambios creados

### Backend (API):
```
api/src/modules/contact/
├── entities/
│   ├── contact.entity.ts
│   ├── tag.entity.ts
│   └── contact-tag.entity.ts
├── dto/
│   ├── create-contact.dto.ts
│   ├── update-contact.dto.ts
│   ├── create-contact-from-conversation.dto.ts
│   ├── create-tag.dto.ts
│   ├── update-tag.dto.ts
│   └── assign-tags.dto.ts
├── contact.service.ts
├── tag.service.ts
├── contact.controller.ts
├── tag.controller.ts
└── contact.module.ts

api/src/database/migrations/
└── 1733356800000-CreateContactsTables.ts

api/src/data-source.ts (modificado)
api/src/app.module.ts (modificado)
```

### Frontend:
```
app/src/types/
└── contact.types.ts

app/src/app/api/
├── contacts/
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       └── tags/
│           ├── route.ts
│           └── [tagId]/route.ts
└── tags/
    ├── route.ts
    └── [id]/route.ts

app/src/components/
├── Contactos.tsx (reescrito)
└── contacts/
    ├── TagCell.tsx
    ├── TagSelector.tsx
    └── TagManagerModal.tsx
```

## 2. Ejecutar Migración (Base de Datos)

### Local:
```bash
cd api
npm run migration:run
```

### Producción (Oracle Cloud):
```bash
# Conectar al servidor
ssh ubuntu@IP_SERVIDOR

# Ir al directorio del backend
cd ~/receptionistAI-main/api

# Ejecutar la migración
npm run migration:run

# Verificar que las tablas se crearon
sudo -u postgres psql -d receptionistai_db -c "\dt"

# Deberías ver:
# - contacts
# - tags
# - contact_tags
```

## 3. Deploy Backend

### Opción A: Script automático (desde Windows)
```powershell
# Desde el directorio raíz del proyecto
.\scripts\deploy-backend.ps1
```

### Opción B: Manual
```bash
# En local
cd api
npm run build

# Comprimir
tar -czf backend-build.tar.gz dist node_modules package.json

# Subir al servidor
scp backend-build.tar.gz ubuntu@IP_SERVIDOR:~/

# En el servidor
ssh ubuntu@IP_SERVIDOR
cd ~/receptionistAI-main/api
tar -xzf ~/backend-build.tar.gz
sudo systemctl restart backend.service
sudo systemctl status backend.service
```

## 4. Deploy Frontend

```bash
# Conectar al servidor
ssh ubuntu@IP_SERVIDOR

# Ir al directorio del frontend
cd ~/receptionistAI-main/app

# Pull de los cambios
git pull origin main

# Instalar dependencias y build
npm install
npm run build

# Reiniciar el servicio
sudo systemctl restart frontend.service
sudo systemctl status frontend.service
```

## 5. Verificar que funciona

### Backend:
```bash
# Test endpoint de contactos
curl -X GET "https://apirecepcionistai.pedidosatr.com/contacts?business_id=TU_BUSINESS_ID" \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Cookie: access_token=TU_TOKEN"

# Test endpoint de tags
curl -X GET "https://apirecepcionistai.pedidosatr.com/tags?business_id=TU_BUSINESS_ID" \
  -H "Authorization: Bearer TU_TOKEN"
```

### Frontend:
1. Ir a `https://recepcionistai.pedidosatr.com/dashboard`
2. Navegar a "Contactos" en el menú
3. Verificar que la tabla cargue (puede estar vacía)
4. Hacer clic en "Gestionar etiquetas" → crear un tag de prueba
5. Hacer clic en "Agregar contacto" → crear un contacto de prueba

### VAPI Integration:
1. Ver `VAPI_CONTACTOS_INTEGRATION.md` para configurar la function tool
2. Hacer una llamada de prueba con VAPI
3. Verificar que el contacto aparezca automáticamente en la tabla

## 6. Troubleshooting

### Error: "Tabla contacts no existe"
```bash
# Verificar que la migración se ejecutó
ssh ubuntu@IP_SERVIDOR
cd ~/receptionistAI-main/api
npm run migration:run
```

### Error: "Cannot find module '@/types/contact.types'"
```bash
# Verificar que el archivo existe
ls -la app/src/types/contact.types.ts

# Rebuild del frontend
cd app
npm run build
```

### Error 401 en /api/contacts
- Verificar que estás logueado
- Verificar que el `access_token` se está enviando correctamente
- Ver logs del backend: `sudo journalctl -u backend.service -f`

### Contactos no se filtran por business
- Verificar que `activeBusiness` esté definido en el store
- Abrir DevTools → Network → ver request a `/api/contacts` → verificar query param `business_id`

## 7. Próximos pasos

Una vez que el sistema básico funcione:

1. ✅ **Crear contacto manual** (modal con formulario)
2. ✅ **Importar/Exportar CSV**
3. ✅ **Vista detalle del contacto** (drawer lateral)
4. ✅ **Integración con appointments/reservations** (última cita, próxima cita)
5. ✅ **Bulk operations** (asignar tags a múltiples contactos)
6. ✅ **Analytics** (contactos nuevos por mes, conversión, etc.)

