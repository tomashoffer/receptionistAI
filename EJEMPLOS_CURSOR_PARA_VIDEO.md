# 🤖 Ejemplos Prácticos para Demostrar Cursor/Claude en el Video

## 🎯 Objetivo
Mostrar cómo usas asistentes de código (Cursor con Claude) para acelerar tu desarrollo y mejorar la calidad del código.

---

## 📋 PREPARACIÓN ANTES DE GRABAR

### 1. Tener listos estos archivos para demostrar:

```
api/src/modules/appointments/appointments.service.ts
api/src/modules/appointments/dto/create-appointment.dto.ts
app/src/components/Dashboard.tsx
app/src/stores/userStore.ts
```

### 2. Tener una función/componente "sin terminar" o "por mejorar" preparada
(Puedes crear un archivo temporal para la demo)

---

## 🚀 DEMOSTRACIÓN 1: Generación de Código (30 segundos)

### Contexto:
"Necesito crear un nuevo hook personalizado para manejar el estado de las notificaciones"

### Qué hacer:
1. Crear archivo nuevo: `app/src/hooks/useNotifications.ts`
2. Presionar `Ctrl + L` (abrir chat de Cursor)
3. Escribir el prompt:

```
Crea un hook personalizado useNotifications que:
- Maneje un array de notificaciones con tipo { id, message, type, timestamp }
- Tenga funciones para agregar, remover y limpiar notificaciones
- Use Zustand para el state management
- Incluya TypeScript types apropiados
- Maneje notificaciones con auto-dismiss después de 5 segundos
```

4. Mostrar cómo el asistente genera todo el código
5. Hacer un cambio rápido con `Ctrl + K` para ajustar algo

### Resultado esperado:
Ver cómo el asistente genera un hook completo, funcional y bien tipado en segundos.

---

## 🔧 DEMOSTRACIÓN 2: Refactoring Inteligente (30 segundos)

### Archivo a usar:
`app/src/components/Dashboard.tsx` (o cualquier componente con lógica compleja)

### Qué hacer:
1. Seleccionar una función/método largo (ejemplo: una función con muchos if/else)
2. Presionar `Ctrl + K`
3. Escribir el prompt:

```
Refactoriza esta función para:
- Usar early returns en lugar de else if anidados
- Aplicar principio de responsabilidad única
- Mejorar el tipado de TypeScript
- Agregar comentarios JSDoc
```

4. Aceptar los cambios y mostrar la diferencia

### Qué mostrar:
- El código "antes" y "después"
- Cómo el asistente entiende el contexto
- La mejora en legibilidad

---

## 🐛 DEMOSTRACIÓN 3: Debugging y Análisis (20 segundos)

### Archivo a usar:
`api/src/modules/appointments/appointments.service.ts`

### Qué hacer:
1. Seleccionar una función compleja (ejemplo: una que hace múltiples llamadas async)
2. Hacer click derecho → "Ask Cursor" o `Ctrl + L`
3. Escribir:

```
Analiza esta función y:
- Explica qué hace paso a paso
- Identifica posibles errores o edge cases
- Sugiere optimizaciones de performance
```

4. Mostrar la explicación del asistente

### Qué mostrar:
- Cómo el asistente "entiende" código complejo
- Sugerencias útiles que mejoran el código

---

## 📝 DEMOSTRACIÓN 4: Generación de Tests (30 segundos)

### Archivo a usar:
Cualquier servicio del backend, ejemplo: `api/src/modules/appointments/appointments.service.ts`

### Qué hacer:
1. Tener abierto el archivo del servicio
2. Crear archivo nuevo: `api/src/modules/appointments/appointments.service.spec.ts`
3. `Ctrl + L` y escribir:

```
Basándote en el archivo appointments.service.ts que está en el contexto,
genera tests unitarios completos usando Jest que incluyan:
- Tests para cada método público
- Mocking de dependencias (TypeORM repository, Google Calendar service)
- Tests de casos de éxito y error
- Coverage de edge cases
```

4. Mostrar cómo genera tests profesionales

### Qué mostrar:
- Tests completos generados automáticamente
- Mocking apropiado
- Cobertura de casos

---

## 🎨 DEMOSTRACIÓN 5: Creación de Componente UI (30 segundos)

### Qué hacer:
1. Crear nuevo archivo: `app/src/components/NotificationToast.tsx`
2. `Ctrl + L` y escribir:

```
Crea un componente React NotificationToast usando:
- TypeScript con interfaces bien definidas
- Tailwind CSS para estilos
- Componentes de shadcn/ui si es apropiado
- Animaciones smooth de entrada/salida
- Props: type (success/error/warning), message, onClose
- Auto-close después de 5 segundos
```

3. Mostrar el componente generado

### Qué mostrar:
- Componente completo con estilos
- TypeScript correctamente tipado
- Uso de buenas prácticas de React

---

## 💡 DEMOSTRACIÓN 6: Documentación Automática (15 segundos)

### Archivo a usar:
Cualquier archivo con funciones sin documentar

### Qué hacer:
1. Seleccionar varias funciones
2. `Ctrl + K`
3. Escribir:

```
Agrega JSDoc comments completos a estas funciones con:
- Descripción clara
- @param para cada parámetro
- @returns explicando el retorno
- @throws para posibles errores
- @example con caso de uso
```

### Qué mostrar:
- Documentación profesional generada automáticamente
- Consistencia en el formato

---

## 🔥 DEMOSTRACIÓN BONUS: Composer (30 segundos)

### Qué hacer:
Si Cursor tiene la feature "Composer", úsala para:

1. Presionar `Ctrl + Shift + I` (o como se active Composer)
2. Describir una feature completa:

```
Necesito agregar un sistema de notificaciones al proyecto:
1. Crear un hook useNotifications con Zustand
2. Crear componente NotificationToast
3. Crear NotificationProvider que envuelva la app
4. Agregar método en el store para mostrar notificaciones
5. Integrar con el sistema de appointments para mostrar notificaciones cuando se crea una cita
```

3. Mostrar cómo Composer crea múltiples archivos y los integra

### Qué mostrar:
- Capacidad de trabajar en múltiples archivos simultáneamente
- Integración coherente entre archivos
- Entendimiento del contexto global del proyecto

---

## 🎯 SCRIPT PARA LA SECCIÓN DE CURSOR (90 segundos)

### Introducción (10 seg)
```
"Ahora lo más importante: cómo uso Cursor con Claude para acelerar mi desarrollo.
No solo es autocompletado, es pair programming con IA."
```

### Demo Rápida 1: Generación (25 seg)
```
"Necesito un nuevo hook. Le voy a describir qué necesito..."
[Hacer DEMOSTRACIÓN 1]
"Como ven, genera código completo, tipado, y siguiendo las mejores prácticas 
del proyecto en segundos."
```

### Demo Rápida 2: Refactoring (25 seg)
```
"También lo uso para mejorar código existente..."
[Hacer DEMOSTRACIÓN 2]
"Esto me permite mantener alta calidad de código sin perder tiempo en 
refactorings manuales."
```

### Demo Rápida 3: Tests (20 seg)
```
"Y para testing, esto es game-changer..."
[Hacer DEMOSTRACIÓN 4]
"Tests completos con mocking apropiado, generados automáticamente."
```

### Cierre (10 seg)
```
"Esto multiplica mi productividad sin sacrificar calidad. De hecho, 
mejora la calidad porque el asistente conoce mejores prácticas y 
patrones que tal vez yo no estaba considerando."
```

---

## 📊 VENTAJAS DE MOSTRAR CADA DEMO

### Generación de Código:
✅ Muestra velocidad de desarrollo  
✅ Demuestra que entiendes cómo guiar al asistente  
✅ Evidencia conocimiento de buenas prácticas (sabes QUÉ pedir)

### Refactoring:
✅ Muestra que te preocupa la calidad del código  
✅ Demuestra conocimiento de principios SOLID  
✅ Evidencia madurez técnica

### Testing:
✅ Muestra que piensas en calidad y mantenibilidad  
✅ Demuestra conocimiento de testing patterns  
✅ Evidencia profesionalismo

---

## 🎬 TIPS PARA LA GRABACIÓN

### DO ✅
- Habla mientras escribes el prompt (explica tu razonamiento)
- Muestra confianza: "Voy a pedirle que..."
- Menciona que el asistente tiene contexto de TODO el proyecto
- Destaca cuando el código generado sigue los patrones del proyecto
- Si algo sale mal, demuestra cómo iteras con el asistente

### DON'T ❌
- No esperes en silencio mientras el asistente genera
- No aceptes código sin revisarlo (muestra que lo entiendes)
- No finjas que todo es perfecto (ser honesto sobre limitaciones es profesional)
- No uses ejemplos triviales (muestra casos reales complejos)

---

## 🚀 PREPARACIÓN FINAL

### Antes de grabar, practica:
1. Los shortcuts de Cursor (Ctrl+K, Ctrl+L, Ctrl+Shift+I)
2. Los prompts exactos que vas a usar
3. Tener los archivos abiertos en tabs
4. Tener una idea de qué vas a generar/refactorizar

### Ten abierto en tabs:
```
Tab 1: README.md (contexto del proyecto)
Tab 2: Archivo para Demo 1 (generación)
Tab 3: Archivo para Demo 2 (refactoring)
Tab 4: Archivo para Demo 3 (testing)
Tab 5: Resultado final (para mostrar después)
```

---

## 💎 EL DIFERENCIADOR

La mayoría de desarrolladores usan Copilot para autocompletar.  
Pocos usan asistentes de IA para:
- Arquitectura de features completas
- Refactoring inteligente
- Testing automatizado
- Code review automático

**Demostrar esto te pone en el top 5% de candidatos.**

---

## 📝 PROMPT TEMPLATE PARA PRACTICAR

Cuando uses Cursor en el video, estructura tus prompts así:

```
[ACCIÓN] que:
- [Requisito 1]
- [Requisito 2]
- [Requisito 3]
- [Consideración técnica]
- [Buena práctica]
```

Ejemplo:
```
Crea un servicio de notificaciones que:
- Use WebSockets para real-time updates
- Integre con el módulo de appointments existente
- Maneje diferentes tipos de notificaciones (success, error, warning)
- Incluya TypeScript types apropiados
- Siga los patrones de arquitectura del proyecto
```

Este formato demuestra que:
1. Sabes QUÉ quieres
2. Conoces las mejores prácticas
3. Entiendes la arquitectura del proyecto
4. Puedes comunicarte efectivamente con herramientas de IA

---

¡Éxito con las demos en vivo! 🚀

