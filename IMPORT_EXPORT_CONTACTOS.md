# Sistema de Importación/Exportación de Contactos

## ✅ Implementado

### Backend

**Nuevo Service:** `ContactImportService`
- `importFromFile()` - Procesa CSV/Excel y crea/actualiza contactos
- `exportToExcel()` - Genera Excel con contactos filtrados
- `generateTemplate()` - Genera plantilla de ejemplo

**Nuevos Endpoints:**
```
POST /contacts/import?business_id={id}    (multipart/form-data)
GET  /contacts/export?business_id={id}&search=&tags=&source=
GET  /contacts/template                   (descarga plantilla)
```

**Dependencia agregada:**
- `xlsx` ^0.18.5 (en `package.json`)

### Frontend

**Nuevo Componente:** `ImportContactsModal`
- Drag & drop de archivos
- Validación de formato (CSV, Excel)
- Validación de tamaño (máx 10MB)
- Progress bar durante importación
- Resumen de resultados (creados, actualizados, errores)
- Descarga de plantilla integrada

**Actualizado:** `Contactos.tsx`
- Botón "Importar contactos" → abre modal
- Botón "Descargar" → exporta contactos (respeta filtros activos)
- Estado de carga durante exportación

**API Routes:**
```
POST /api/contacts/import     (recibe file + business_id)
GET  /api/contacts/export     (retorna archivo Excel)
GET  /api/contacts/template   (retorna plantilla)
```

## 📋 Formato de la Plantilla

### Columnas:

| Columna | Requerido | Ejemplo |
|---------|-----------|---------|
| Nombre | ✅ Sí | `María González` |
| Teléfono | ✅ Sí | `+5491154686272` |
| Email | ❌ No | `maria@example.com` |
| Fuente | ❌ No | `whatsapp` |
| Notas | ❌ No | `Cliente VIP` |
| Etiquetas | ❌ No | `VIP,Posible Huésp` |

### Ejemplo CSV:
```csv
Nombre,Teléfono,Email,Fuente,Notas,Etiquetas
María González,+5491154686272,maria@example.com,whatsapp,Cliente interesada en masajes,"Posible Huésp,VIP"
Juan Pérez,+5491143308334,juan@example.com,call,Consulta por precios,Consulta
```

## 🔄 Lógica de Importación

### UPSERT Inteligente:
1. Busca contacto existente por `(business_id, phone)`
2. Si existe → **actualiza** datos (no sobrescribe campos vacíos)
3. Si no existe → **crea** nuevo contacto
4. Asigna las etiquetas especificadas (crea tags si no existen)

### Validaciones:
- ✅ Nombre requerido
- ✅ Teléfono requerido con código de país (+54, +1, etc.)
- ✅ Email debe ser formato válido (si se proporciona)
- ✅ Fuente debe ser: `call`, `whatsapp`, `instagram`, `facebook`, `web`, `manual`
- ✅ Máximo 1,000 contactos por archivo
- ✅ Máximo 10MB de tamaño

### Resultado:
```json
{
  "total": 100,
  "created": 85,
  "updated": 10,
  "errors": [
    {
      "row": 45,
      "data": { "nombre": "", "telefono": "123456" },
      "error": "El nombre es requerido"
    }
  ]
}
```

## 📤 Exportación de Contactos

### Características:
- ✅ Exporta en formato Excel (.xlsx)
- ✅ Respeta filtros activos (search, tags, source)
- ✅ Si NO hay filtros → exporta TODOS
- ✅ Si HAY filtros → exporta solo filtrados
- ✅ Nombre de archivo: `contactos-[BUSINESS]-[FECHA].xlsx`
- ✅ Columnas adicionales en export:
  - Total Interacciones
  - Última Interacción
  - Fecha Creación

### Ejemplo de Export:

| Nombre | Teléfono | Email | Fuente | Notas | Etiquetas | Total Interacciones | Última Interacción | Fecha Creación |
|--------|----------|-------|--------|-------|-----------|---------------------|-------------------|----------------|
| María González | +5491154686272 | maria@example.com | whatsapp | Cliente VIP | Posible Huésp, VIP | 5 | 4/12/2025 15:30 | 1/12/2025 10:00 |

## 🚀 Uso en la Aplicación

### Importar Contactos:

1. Ir a **Contactos**
2. Clic en **"Importar contactos"**
3. (Opcional) Clic en **"Descargar plantilla"** para obtener el formato
4. Completar el archivo con tus contactos
5. Arrastrar archivo a la zona de drop o hacer clic para seleccionar
6. Clic en **"Importar contactos"**
7. Ver resumen de resultados:
   - ✅ X contactos creados
   - 🔄 X contactos actualizados
   - ❌ X contactos con errores

### Exportar Contactos:

1. Ir a **Contactos**
2. (Opcional) Aplicar filtros para exportar solo un subset
3. Clic en **"Descargar"**
4. El archivo se descarga automáticamente

### Gestionar Etiquetas durante Importación:

Si en la columna "Etiquetas" pones tags que no existen:
- Se crean automáticamente
- Color por defecto: azul
- Icono por defecto: 📌

Puedes editarlos después en "Gestionar etiquetas".

## 📦 Instalación de Dependencias

Antes del primer deploy, instalar la librería xlsx:

```bash
cd api
npm install xlsx
```

O se instalará automáticamente con `npm install` al hacer el deploy.

## 🧪 Testing

### Test de Importación:

1. Descargar plantilla desde `/api/contacts/template`
2. Modificar con datos de prueba
3. Importar vía `/api/contacts/import`
4. Verificar en la tabla que aparezcan los contactos

### Test de Exportación:

1. Crear algunos contactos
2. Exportar vía `/api/contacts/export`
3. Abrir el archivo Excel descargado
4. Verificar que tenga todos los datos correctos

### Test de UPSERT:

1. Importar un archivo con 10 contactos
2. Modificar el archivo (cambiar emails, notas)
3. Re-importar el mismo archivo
4. Verificar que se actualizaron (no duplicaron)

## ⚠️ Limitaciones

- Máximo 1,000 contactos por importación
- Máximo 10MB por archivo
- Timeout de 2 minutos para procesar
- Tags con el mismo nombre se consolidan (case-insensitive)

Si necesitas importar más de 1,000 contactos, divide en múltiples archivos.

## 🔐 Seguridad

- ✅ Autenticación JWT requerida
- ✅ Aislamiento por `business_id`
- ✅ Validación de tipo de archivo (anti-malware)
- ✅ Validación de tamaño
- ✅ Sanitización de datos de entrada
- ✅ No se pueden importar contactos de otros businesses

## 📝 Casos de Uso

### Caso 1: Migración desde otro CRM
```
1. Exportar contactos desde Hubspot/Salesforce/etc.
2. Ajustar columnas al formato de la plantilla
3. Importar en ReceptionistAI
4. Verificar y asignar tags adicionales
```

### Caso 2: Agregar tags masivamente
```
1. Exportar contactos actuales
2. Editar columna "Etiquetas" en Excel
3. Re-importar (actualizará y agregará tags)
```

### Caso 3: Backup periódico
```
1. Exportar contactos cada semana/mes
2. Guardar como backup en Drive/Dropbox
3. Usar para análisis offline en Excel/Google Sheets
```

### Caso 4: Compartir contactos entre sucursales
```
1. Exportar contactos de Sucursal A
2. Cambiar business_id al importar en Sucursal B
3. Los contactos se duplican en el nuevo business
```

