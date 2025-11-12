# 🎬 Guion para Video de Presentación Técnica
## Receptionist AI - Demostración de Habilidades Full Stack

**Duración:** 5-7 minutos  
**Objetivo:** Demostrar experiencia en Node.js, React y asistentes de código (Cursor/Claude)

---

## 📋 ESTRUCTURA DEL VIDEO

### 1️⃣ PRESENTACIÓN BREVE (30 segundos)
**[00:00 - 00:30]**

**GUION:**
```
"¡Hola! Soy Tomás, desarrollador Full Stack con experiencia en Node.js y React.

Hoy les voy a mostrar un proyecto real que construí: Receptionist AI, 
un sistema completo de recepcionista con inteligencia artificial que 
gestiona citas mediante voz, usando una arquitectura moderna de microservicios.

Este proyecto es el ejemplo perfecto para demostrar mi experiencia con Node.js 
en el backend, React en el frontend, y cómo utilizo asistentes de código como 
Cursor con Claude para acelerar mi desarrollo."
```

**QUÉ MOSTRAR:**
- Tu cara/presentación personal
- Opcional: Logo o pantalla inicial del proyecto

---

### 2️⃣ BACKEND - NODE.JS CON NESTJS (2 minutos)
**[00:30 - 02:30]**

#### A) Arquitectura del Backend (40 seg)

**GUION:**
```
"Empecemos con el backend. Está construido con NestJS, que es un framework 
robusto de Node.js con TypeScript que sigue los principios de arquitectura limpia.

Como pueden ver aquí [MOSTRAR ESTRUCTURA DE CARPETAS], el proyecto está 
organizado en módulos independientes:
- Módulo de autenticación con JWT y Google OAuth
- Módulo de citas (appointments)
- Módulo de integración con servicios de voz usando OpenAI
- Módulo de Google APIs para Calendar y Sheets
- WebSockets para comunicación en tiempo real"
```

**QUÉ MOSTRAR:**
- `api/src/` - Estructura de carpetas
- `api/package.json` - Dependencias (NestJS, TypeORM, OpenAI, etc.)
- `api/src/modules/` - Módulos organizados

#### B) Ejemplo de Código Backend (80 seg)

**GUION:**
```
"Aquí tengo un ejemplo concreto [ABRIR ARCHIVO]. Este es el módulo de citas 
que maneja toda la lógica de negocio:

1. Uso TypeORM para la persistencia con PostgreSQL
2. Implemento DTOs con class-validator para validación robusta
3. Integro con Google Calendar API para verificar disponibilidad en tiempo real
4. Todo está tipado con TypeScript para mayor seguridad

[NAVEGAR POR EL CÓDIGO]

Y aquí ven cómo uso decoradores de NestJS para crear una API RESTful limpia,
con documentación automática en Swagger."
```

**QUÉ MOSTRAR:**
- `api/src/modules/appointments/` - Servicio completo
- Decoradores de NestJS (`@Injectable`, `@Controller`, `@Get`, `@Post`)
- TypeORM entities con relaciones
- DTOs con validaciones
- Integración con Google APIs

**ARCHIVOS SUGERIDOS PARA MOSTRAR:**
```
api/src/modules/appointments/appointments.service.ts
api/src/modules/appointments/appointments.controller.ts
api/src/modules/appointments/entities/appointment.entity.ts
api/src/modules/appointments/dto/create-appointment.dto.ts
```

---

### 3️⃣ FRONTEND - REACT CON NEXT.JS (1.5 minutos)
**[02:30 - 04:00]**

#### A) Arquitectura Frontend (30 seg)

**GUION:**
```
"Pasando al frontend, está construido con Next.js 15, la última versión, 
con React 19 y TypeScript.

Uso un stack moderno: Tailwind CSS para estilos, shadcn/ui para componentes 
reutilizables, Zustand para gestión de estado, y Socket.io para actualizaciones 
en tiempo real."
```

**QUÉ MOSTRAR:**
- `app/package.json` - Dependencias de React
- `app/src/components/` - Estructura de componentes

#### B) Componentes React (60 seg)

**GUION:**
```
"Aquí tengo un componente complejo [ABRIR ConfiguracionAsistenteTab.tsx] 
que muestra varias buenas prácticas:

1. Uso hooks de React como useState, useMemo para optimización
2. TypeScript con interfaces bien definidas
3. Integración con Zustand para estado global
4. Componentes modulares y reutilizables de shadcn/ui
5. Lógica de negocio separada en hooks personalizados

[NAVEGAR POR EL CÓDIGO]

El sistema tiene una interfaz completa con Dashboard, gestión de contactos, 
conversaciones en tiempo real, y configuración del asistente AI."
```

**QUÉ MOSTRAR:**
- `app/src/components/conocimiento/ConfiguracionAsistenteTab.tsx` (ya lo tienes abierto)
- `app/src/components/Dashboard.tsx`
- `app/src/components/Conversaciones.tsx`
- `app/src/stores/userStore.ts` - Estado con Zustand
- Componentes UI de shadcn

---

### 4️⃣ ASISTENTES DE CÓDIGO - CURSOR/CLAUDE (1.5 minutos)
**[04:00 - 05:30]**

#### A) Demostración en Vivo (90 seg)

**GUION:**
```
"Y ahora lo más importante: cómo uso asistentes de código como Cursor con Claude 
para acelerar mi desarrollo.

[ABRIR CURSOR Y MOSTRAR]

Voy a mostrarles cómo utilizo el asistente para:

1. **Refactoring inteligente**: [EJEMPLO]
   'Voy a pedirle que refactorice esta función para mejor legibilidad'
   [Ctrl+K y pedir: "Refactoriza esta función usando early returns y mejor tipado"]

2. **Generación de código**: [EJEMPLO]
   'Necesito agregar un nuevo endpoint. Le voy a decir exactamente qué necesito'
   [Ctrl+L y describir: "Crea un endpoint GET para obtener estadísticas de citas 
   del último mes, con filtros por estado"]

3. **Debugging y análisis**: [EJEMPLO]
   'El asistente me ayuda a entender código complejo rápidamente'
   [Seleccionar código complejo y preguntar: "Explica qué hace esta función y 
   sugiere optimizaciones"]

4. **Documentación automática**: [EJEMPLO]
   [Pedir: "Genera JSDoc comments para estas funciones"]

Como ven, no se trata solo de autocompletar, sino de tener un par programming 
partner que entiende el contexto completo del proyecto y me ayuda a escribir 
código de mejor calidad más rápido."
```

**QUÉ MOSTRAR:**
- Cursor AI en acción con comandos Ctrl+K y Ctrl+L
- Sugerencias contextuales del asistente
- Refactorización en vivo
- Generación de código
- Chat con el asistente mostrando el contexto del proyecto

**EJEMPLOS PRÁCTICOS PARA HACER EN VIVO:**

**Ejemplo 1: Refactoring**
```typescript
// Seleccionar una función y pedir:
// "Mejora esta función aplicando principios SOLID y mejor manejo de errores"
```

**Ejemplo 2: Nueva funcionalidad**
```typescript
// Ctrl+L y pedir:
// "Crea un hook personalizado useAppointments que maneje el estado 
// y las operaciones CRUD de citas, con loading y error states"
```

**Ejemplo 3: Testing**
```typescript
// Pedir:
// "Genera tests unitarios con Jest para este servicio"
```

---

### 5️⃣ INTEGRACIÓN Y ARQUITECTURA COMPLETA (1 minuto)
**[05:30 - 06:30]**

**GUION:**
```
"Para cerrar, quiero mostrarles cómo todo se integra:

[MOSTRAR DOCKER-COMPOSE.YML]

El proyecto usa Docker para orquestación con:
- Backend NestJS en un contenedor
- Frontend Next.js en otro
- PostgreSQL para la base de datos
- N8N para automatizaciones
- Ngrok para webhooks en desarrollo

[MOSTRAR DIAGRAMA O FLUJO]

El flujo completo es:
1. El cliente llama por teléfono → VAPI procesa la voz
2. VAPI envía webhook → N8N lo procesa
3. N8N consulta disponibilidad → Backend NestJS
4. Se crea la cita → PostgreSQL + Google Calendar
5. La UI React se actualiza en tiempo real → WebSockets

Todo el código está tipado con TypeScript, dockerizado, y versionado en Git.
Y como vieron, uso asistentes de código para acelerar cada parte del desarrollo."
```

**QUÉ MOSTRAR:**
- `docker-compose.yml`
- Diagrama de arquitectura del README
- Terminal con Docker containers corriendo
- Aplicación funcionando en vivo (navegador)

---

### 6️⃣ CIERRE (30 segundos)
**[06:30 - 07:00]**

**GUION:**
```
"En resumen:
- ✅ Backend robusto con Node.js y NestJS
- ✅ Frontend moderno con React y Next.js
- ✅ TypeScript en todo el stack
- ✅ Integraciones con APIs modernas (OpenAI, Google)
- ✅ Uso profesional de asistentes de código para mayor productividad

Este proyecto demuestra mi capacidad para construir aplicaciones full stack 
completas, bien arquitecturadas, y usando las herramientas más modernas del 
ecosistema JavaScript/TypeScript.

¡Muchas gracias por ver el video! Quedo a disposición para cualquier pregunta."
```

**QUÉ MOSTRAR:**
- Tu cara/cierre personal
- Opcional: GitHub profile o links de contacto

---

## 🎯 CHECKLIST PRE-GRABACIÓN

### Preparación del Entorno:
- [ ] Cerrar pestañas innecesarias del navegador
- [ ] Limpiar escritorio
- [ ] Tener VS Code/Cursor abierto con el proyecto
- [ ] Tener navegador con la app corriendo en localhost:3000
- [ ] Terminal con `docker-compose ps` mostrando servicios activos
- [ ] README.md abierto para mostrar diagramas

### Archivos Clave para Tener Abiertos en Tabs:
```
1. README.md
2. api/package.json
3. app/package.json
4. api/src/modules/appointments/appointments.service.ts
5. api/src/modules/appointments/appointments.controller.ts
6. app/src/components/conocimiento/ConfiguracionAsistenteTab.tsx
7. app/src/components/Dashboard.tsx
8. docker-compose.yml
```

### Puntos Técnicos para Mencionar:
- ✅ NestJS (Node.js framework)
- ✅ TypeScript en todo el stack
- ✅ TypeORM con PostgreSQL
- ✅ JWT + OAuth (Google)
- ✅ React 19 + Next.js 15
- ✅ Zustand (state management)
- ✅ shadcn/ui (componentes)
- ✅ Docker + Docker Compose
- ✅ WebSockets (tiempo real)
- ✅ OpenAI API (Whisper + GPT)
- ✅ Google APIs (Calendar + Sheets)
- ✅ RESTful API + Swagger
- ✅ Testing (Jest)

---

## 💡 TIPS PARA LA GRABACIÓN

### Audio:
- Usa un micrófono decente o auriculares con buen micrófono
- Graba en un lugar silencioso
- Habla claro y a ritmo moderado

### Video:
- Usa Windows + G (Game Bar) en Windows
- Graba en 1080p si es posible
- Asegúrate de que el código sea legible (zoom si es necesario)

### Contenido:
- ⚡ Sé natural y entusiasta
- ⚡ Muestra confianza en tu código
- ⚡ No te detengas demasiado en detalles pequeños
- ⚡ Enfócate en demostrar habilidades, no en explicar cada línea
- ⚡ El uso de Cursor/Claude en vivo es tu diferenciador clave

### Timing:
- Presentación: 30 seg
- Backend: 2 min
- Frontend: 1.5 min
- Cursor/Claude: 1.5 min (¡IMPORTANTE!)
- Integración: 1 min
- Cierre: 30 seg
- **Total: 7 minutos**

---

## 🚀 COMANDOS ÚTILES PARA MOSTRAR

```bash
# Levantar el proyecto
docker-compose up -d

# Ver servicios corriendo
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f backend

# Ver estructura del proyecto
tree -L 2 -I node_modules
```

---

## 🎬 ORDEN SUGERIDO DE VENTANAS

1. **Inicio**: Tu cara + pantalla de título
2. **Backend**: VS Code con archivos del backend
3. **Frontend**: VS Code con componentes React
4. **Cursor AI**: Demostración en vivo con el asistente
5. **Arquitectura**: Docker + Navegador con app corriendo
6. **Cierre**: Tu cara

---

## ✨ DIFERENCIADORES CLAVE

Lo que te hace destacar en este video:

1. **Proyecto Real y Complejo**: No es un TODO app, es un sistema completo de producción
2. **Stack Moderno**: Últimas versiones (Next.js 15, React 19, NestJS 10)
3. **Arquitectura Profesional**: Microservicios, Docker, TypeScript end-to-end
4. **Integraciones Reales**: OpenAI, Google APIs, VAPI, WebSockets
5. **Uso Experto de AI Tools**: Demostrar Cursor/Claude en vivo te diferencia del 90% de candidatos

---

## 📝 GUION ALTERNATIVO CORTO (5 minutos)

Si necesitas reducir a 5 minutos:
- Presentación: 20 seg
- Backend: 1.5 min (omitir algunos detalles de módulos)
- Frontend: 1 min (mostrar solo 2 componentes)
- Cursor/Claude: 1.5 min (lo más importante)
- Cierre con arquitectura: 1 min

---

¡Éxito con tu video, Tomás! 🚀

