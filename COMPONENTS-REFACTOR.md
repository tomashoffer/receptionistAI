# Refactorización de Componentes - Dashboard

## 📁 Componentes Creados

### 1. `BusinessCard.tsx`
**Ubicación:** `app/src/components/reusable/BusinessCard.tsx`

**Descripción:** Card reutilizable para mostrar cada negocio en la vista "Mis Negocios".

**Props:**
- `business`: Objeto del negocio
- `activeBusinessId`: ID del negocio activo
- `onSetActive`: Función para activar un negocio
- `onEdit`: Función para editar un negocio

**Uso:**
```tsx
import BusinessCard from '@/components/reusable/BusinessCard';

{businesses.map((business: any) => (
  <BusinessCard
    key={business.id}
    business={business}
    activeBusinessId={activeBusiness.id}
    onSetActive={handleSetActiveBusiness}
    onEdit={handleEditBusiness}
  />
))}
```

---

### 2. `RecepcionistaConfigForm.tsx`
**Ubicación:** `app/src/components/reusable/RecepcionistaConfigForm.tsx`

**Descripción:** Formulario completo de configuración del recepcionista AI.

**Props:**
- `activeBusiness`: Negocio activo
- `hasAssistant`: Boolean si existe assistant
- `recepcionistaFormData`: Datos del formulario
- `availableVoices`: Lista de voces disponibles
- `isLoadingVoices`: Boolean de carga
- `newFieldName`: Nombre del nuevo campo
- `newFieldType`: Tipo del nuevo campo
- `recepcionistaError`: Mensaje de error
- `recepcionistaSuccess`: Mensaje de éxito
- `hasChanges`: Boolean si hay cambios
- `isCreatingAssistant`: Boolean si está creando
- Múltiples handlers y funciones helper

**Uso:**
```tsx
import RecepcionistaConfigForm from '@/components/reusable/RecepcionistaConfigForm';

<RecepcionistaConfigForm
  activeBusiness={activeBusiness}
  hasAssistant={hasAssistant}
  recepcionistaFormData={recepcionistaFormData}
  availableVoices={availableVoices}
  isLoadingVoices={isLoadingVoices}
  newFieldName={newFieldName}
  newFieldType={newFieldType}
  recepcionistaError={recepcionistaError}
  recepcionistaSuccess={recepcionistaSuccess}
  hasChanges={hasChanges}
  isCreatingAssistant={isCreatingAssistant}
  onInputChange={handleRecepcionistaInputChange}
  onRequiredFieldChange={handleRequiredFieldChange}
  onAddCustomField={handleAddCustomField}
  onRemoveCustomField={handleRemoveCustomField}
  onGenerateFirstMessage={generateFirstMessage}
  onUpdatePromptWithCurrentFields={updatePromptWithCurrentFields}
  onCreateAssistant={handleCreateAssistant}
  onUpdateAssistant={handleUpdateAssistant}
  isFieldRequired={isFieldRequired}
  isCustomField={isCustomField}
  getFieldName={getFieldName}
  getFieldLabel={getFieldLabel}
  getFieldType={getFieldType}
  setNewFieldName={setNewFieldName}
  setNewFieldType={setNewFieldType}
/>
```

---

### 3. `EditBusinessModal.tsx`
**Ubicación:** `app/src/components/reusable/EditBusinessModal.tsx`

**Descripción:** Modal para editar un negocio existente.

**Props:**
- `editingBusiness`: Negocio en edición
- `editFormData`: Datos del formulario de edición
- `onCancel`: Función para cancelar
- `onSave`: Función para guardar
- `onChange`: Función para cambiar campos

**Uso:**
```tsx
import EditBusinessModal from '@/components/reusable/EditBusinessModal';

<EditBusinessModal
  editingBusiness={editingBusiness}
  editFormData={editFormData}
  onCancel={handleCancelEdit}
  onSave={handleSaveEdit}
  onChange={(field, value) => setEditFormData({...editFormData, [field]: value})}
/>
```

---

## 🔧 Integración en page.tsx

Para integrar estos componentes en `page.tsx`, necesitas:

1. **Importar los componentes:**
```tsx
import BusinessCard from '@/components/reusable/BusinessCard';
import RecepcionistaConfigForm from '@/components/reusable/RecepcionistaConfigForm';
import EditBusinessModal from '@/components/reusable/EditBusinessModal';
```

2. **Reemplazar el código de `businesses.map` (líneas 1084-1127) con:**
```tsx
{businesses.map((business: any) => (
  <BusinessCard
    key={business.id}
    business={business}
    activeBusinessId={activeBusiness.id}
    onSetActive={handleSetActiveBusiness}
    onEdit={handleEditBusiness}
  />
))}
```

3. **Reemplazar el contenido del ternario en `activeTab === 'system-config'` (líneas 1158-1563) con:**
```tsx
<RecepcionistaConfigForm
  // ... pasar todas las props necesarias
/>
```

4. **Reemplazar el modal de edición (líneas 1585-1728) con:**
```tsx
<EditBusinessModal
  editingBusiness={editingBusiness}
  editFormData={editFormData}
  onCancel={handleCancelEdit}
  onSave={handleSaveEdit}
  onChange={(field, value) => setEditFormData({...editFormData, [field]: value})}
/>
```

---

## ✅ Beneficios

1. **Código más limpio:** El archivo `page.tsx` se reduce de ~1733 líneas a ~900-1000 líneas.
2. **Reutilización:** Los componentes pueden usarse en otras páginas.
3. **Mantenibilidad:** Más fácil de mantener y debuggear.
4. **Testing:** Cada componente puede testearse independientemente.
5. **Colaboración:** Varios desarrolladores pueden trabajar en componentes distintos.

---

## 📝 Próximos Pasos

1. ✅ Crear los componentes base
2. ⏳ Actualizar `page.tsx` para usar los componentes
3. ⏳ Probar que todo funciona correctamente
4. ⏳ Eliminar código duplicado

