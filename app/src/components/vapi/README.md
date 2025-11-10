# Componente VapiWidget

Widget oficial de Vapi para interactuar con asistentes de voz en React/Next.js.

Implementación basada en la **documentación oficial**: https://docs.vapi.ai/quickstart/web#voice-widget-implementation

## 📦 Archivos

- `VapiWidget.tsx` - Componente principal del widget

## 🎯 Uso

```tsx
import VapiWidget from '@/components/vapi/VapiWidget';

// En tu componente:
<VapiWidget
  assistantId={business.assistant.vapi_assistant_id}
  publicKey={business.assistant.vapi_public_key}
/>
```

## 🔧 Props

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `assistantId` | `string` | ✅ | ID del asistente de Vapi |
| `publicKey` | `string` | ✅ | Public key de Vapi (del business) |

## 📝 Comportamiento

### ✅ Implementación oficial con SDK de Vapi

Este componente usa la **clase `Vapi`** del paquete `@vapi-ai/web`:

```typescript
import Vapi from '@vapi-ai/web';
const vapiInstance = new Vapi(publicKey);
vapiInstance.start(assistantId);
```

**NO usa** web components (`<vapi-widget>`), que son solo para HTML estático.

### Estados del widget:

1. **No conectado**: Botón "🎤 Hablar con el Asistente"
2. **Conectado**: Panel con transcripción en tiempo real
   - Indicador de estado (verde = escuchando, rojo = hablando)
   - Botón "Finalizar" para terminar la llamada
   - Historial de conversación (mensajes del usuario y asistente)

## 🔄 Ciclo de vida

```
1. Component mounts
   └─> new Vapi(publicKey)
   └─> Registrar event listeners
   
2. Usuario hace click en "Hablar con el Asistente"
   └─> vapi.start(assistantId)
   └─> isConnected = true
   
3. Durante la llamada
   └─> Events: call-start, speech-start, speech-end, message, error
   └─> Actualizar UI en tiempo real
   
4. Usuario hace click en "Finalizar"
   └─> vapi.stop()
   └─> isConnected = false
   
5. Component unmounts o cambia business
   └─> vapi.stop()
   └─> Cleanup automático
```

## 🐛 Debugging

El componente tiene **logs extensivos** en consola:

- `🎯` - Render del componente
- `🎙️` - Inicialización del SDK
- `✅` - Llamada iniciada
- `🔴` - Llamada finalizada
- `🗣️` - Asistente hablando
- `🔇` - Asistente dejó de hablar
- `💬` - Mensajes de transcripción
- `❌` - Errores
- `🧹` - Cleanup
- `⏸️` - Widget no renderizado (falta data)

## 🎨 Estilos del widget

- **Botón inactivo**: Botón turquesa flotante con efecto hover
- **Panel activo**: Panel blanco con transcripción en tiempo real
- **Posición**: Fija en la esquina inferior derecha
- **Colores**: 
  - Turquesa (`#14B8A6`) para el botón y mensajes del usuario
  - Gris oscuro para mensajes del asistente
  - Rojo para el indicador de "hablando"

## 📦 Dependencias

```json
{
  "@vapi-ai/web": "^2.4.0"
}
```

Ya incluido en `app/package.json`.

## ⚠️ Notas importantes

1. **El `publicKey` DEBE venir de `activeBusiness?.assistant?.vapi_public_key`**, NO del `.env`
2. **El widget NO aparece si falta `assistantId` o `publicKey`**
3. **Solo funciona en client-side** (componente marcado con `'use client'`)
4. **El widget se desmonta automáticamente** cuando cambias de business (gracias al `key` prop en el padre)
5. **La transcripción se resetea** cuando inicias una nueva llamada

## 📊 Estado del componente

```typescript
const [vapi, setVapi] = useState<Vapi | null>(null);         // Instancia del SDK
const [isConnected, setIsConnected] = useState(false);       // ¿Llamada activa?
const [isSpeaking, setIsSpeaking] = useState(false);         // ¿Asistente hablando?
const [transcript, setTranscript] = useState<Array<...>>([]); // Historial de mensajes
```

## 🔗 Recursos

- [Documentación oficial de Vapi Web SDK](https://docs.vapi.ai/quickstart/web)
- [GitHub del SDK @vapi-ai/web](https://github.com/VapiAI/web)
- [Ejemplos de implementación](https://docs.vapi.ai/assistants/examples)
