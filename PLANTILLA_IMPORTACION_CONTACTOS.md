# Plantilla de Importación de Contactos

## Formato del Archivo

### Archivo soportado:
- **CSV** (`.csv`) - recomendado
- **Excel** (`.xlsx`) - también soportado

### Codificación:
- UTF-8 (para caracteres especiales y acentos)

## Columnas Requeridas

| Columna | Requerido | Formato | Ejemplo | Descripción |
|---------|-----------|---------|---------|-------------|
| **Nombre** | ✅ Sí | Texto (máx 100 chars) | `María González` | Nombre completo del contacto |
| **Teléfono** | ✅ Sí | Texto con código país | `+5491154686272` | Número con código internacional (+54, +1, etc.) |
| **Email** | ❌ No | Email válido | `maria@example.com` | Email del contacto |
| **Fuente** | ❌ No | `call`, `whatsapp`, `instagram`, `facebook`, `web`, `manual` | `whatsapp` | Canal de origen |
| **Notas** | ❌ No | Texto libre | `Cliente VIP, prefiere mañanas` | Notas o comentarios |
| **Etiquetas** | ❌ No | Texto separado por comas | `VIP,Cliente Frecuente` | Tags a asignar (se crean automáticamente si no existen) |

## Ejemplo de Plantilla CSV

```csv
Nombre,Teléfono,Email,Fuente,Notas,Etiquetas
María González,+5491154686272,maria@example.com,whatsapp,Cliente interesada en masajes,"Posible Huésp,VIP"
Juan Pérez,+5491143308334,juan@example.com,call,Consulta por precios,Consulta
Ana Rodríguez,+5491158177898,,instagram,Reserva para dos personas,"Posible Huésp,Instagram"
```

## Reglas de Importación

### ✅ Contactos nuevos:
- Se crean automáticamente
- Se asignan las etiquetas especificadas
- Se crea con `source = 'manual'` si no se especifica fuente

### 🔄 Contactos existentes (mismo teléfono):
- **Se actualizan** con los nuevos datos
- Si un campo está vacío, NO se sobrescribe (se mantiene el valor anterior)
- Se agregan las etiquetas nuevas (no se quitan las existentes)

### ⚠️ Validaciones:
1. **Nombre:** No puede estar vacío
2. **Teléfono:** 
   - Debe tener código de país (+54, +1, etc.)
   - Debe tener entre 8 y 20 caracteres
   - Debe ser único por business
3. **Email:** Debe ser formato válido (si se proporciona)
4. **Fuente:** Solo valores permitidos: `call`, `whatsapp`, `instagram`, `facebook`, `web`, `manual`

### ❌ Errores comunes:

| Error | Causa | Solución |
|-------|-------|----------|
| "Nombre es requerido" | Fila sin nombre | Completar nombre |
| "Teléfono es requerido" | Fila sin teléfono | Completar teléfono |
| "Formato de teléfono inválido" | Sin código país | Agregar `+54` al inicio |
| "Email inválido" | Email mal formado | Usar formato válido o dejar vacío |
| "Fuente inválida" | Valor no permitido | Usar uno de los valores válidos |

## Descarga de Plantillas

### Opción 1: Desde la aplicación
1. Ir a **Contactos**
2. Clic en **"Importar contactos"**
3. Clic en **"Descargar plantilla"**
4. Se descarga `plantilla-contactos.csv` o `plantilla-contactos.xlsx`

### Opción 2: Manual
Archivo disponible en: `api/src/modules/contact/templates/plantilla-contactos.csv`

## Proceso de Importación

### Paso 1: Preparar el archivo
1. Descargar la plantilla
2. Completar con tus contactos
3. Guardar como `.csv` o `.xlsx`

### Paso 2: Importar
1. Ir a **Contactos**
2. Clic en **"Importar contactos"**
3. Seleccionar archivo
4. Clic en **"Importar"**

### Paso 3: Revisar resultado
Se mostrará un resumen:
```
✅ 15 contactos importados correctamente
⚠️ 2 contactos actualizados
❌ 1 contacto con errores
```

### Paso 4: Revisar errores (si hay)
Se descarga un archivo `errores-importacion.csv` con:
- Fila con error
- Motivo del error
- Sugerencia de corrección

## Exportación de Contactos

### Formato de exportación:
- Mismo formato que la plantilla
- Incluye TODOS los campos actuales del contacto
- Las etiquetas se exportan separadas por comas

### Cómo exportar:
1. Ir a **Contactos**
2. (Opcional) Aplicar filtros para exportar solo un subset
3. Clic en **"Descargar"**
4. Se descarga `contactos-[BUSINESS_NAME]-[FECHA].xlsx`

### Datos exportados:
- Todos los contactos visibles según filtros actuales
- Si NO hay filtros → exporta TODOS los contactos del business
- Si HAY filtros → exporta solo los filtrados

## Ejemplos de Uso

### Caso 1: Migrar desde otro CRM
1. Exportar contactos desde tu CRM actual
2. Ajustar las columnas al formato de la plantilla
3. Importar en ReceptionistAI
4. Verificar que se importaron correctamente

### Caso 2: Agregar tags masivamente
1. Exportar contactos actuales
2. Agregar etiquetas en la columna "Etiquetas"
3. Re-importar (actualizará y agregará tags)

### Caso 3: Backup periódico
1. Exportar contactos cada semana/mes
2. Guardar el archivo como backup
3. Usar para análisis offline en Excel

## Límites

- **Máximo por importación:** 1,000 contactos por archivo
- **Tamaño máximo de archivo:** 10 MB
- **Timeout:** 2 minutos para procesar

Si necesitas importar más de 1,000 contactos, divide en múltiples archivos.

