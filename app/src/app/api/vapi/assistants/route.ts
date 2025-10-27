import { NextRequest, NextResponse } from 'next/server';

const VAPI_API_URL = 'https://api.vapi.ai';
const VAPI_API_KEY = process.env.VAPI_API_KEY;

if (!VAPI_API_KEY) {
  console.error('VAPI_API_KEY no está definida en las variables de entorno');
}

export async function POST(request: NextRequest) {
  try {
    if (!VAPI_API_KEY) {
      return NextResponse.json({ error: 'VAPI no configurado' }, { status: 500 });
    }

    const body = await request.json();
    const { name, prompt, voice, language, firstMessage, businessId } = body;

    // Validar datos requeridos
    if (!name || !prompt || !voice || !language || !businessId) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos: name, prompt, voice, language, businessId' },
        { status: 400 }
      );
    }

    // Crear assistant en VAPI
    const vapiResponse = await fetch(`${VAPI_API_URL}/assistant`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${name} - Recepcionista`,
        model: {
          provider: 'openai',
          model: 'gpt-4o',
          systemMessage: prompt,
          maxTokens: 500,
        },
        voice: {
          provider: 'azure',
          voiceId: voice,
        },
        transcriber: {
          provider: 'deepgram',
          model: 'nova-2',
          language: language === 'es' ? 'es' : 'en',
        },
        language: language,
        maxDurationSeconds: 300,
        backgroundSound: 'off',
        endCallMessage: '¡Gracias por llamar! ¡Que tengas un excelente día!',
        endCallPhrases: ['adiós', 'hasta luego', 'chao', 'nos vemos'],
        fillersEnabled: true,
        backchannelingEnabled: true,
        interruptionThreshold: 0.8,
        interruptionMessage: 'Perdón por interrumpirte, por favor continúa.',
        maxInterruptions: 3,
        silenceTimeoutSeconds: 30,
        responseDelaySeconds: 1.2,
        llmRequestDelaySeconds: 0.1,
        numWordsToInterruptAssistant: 2,
        firstMessage: firstMessage || '¡Hola! ¿En qué puedo ayudarte?',
        webhook: {
          url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/webhooks/vapi/${businessId}`,
          secret: process.env.VAPI_WEBHOOK_SECRET,
        },
      }),
    });

    if (!vapiResponse.ok) {
      const errorText = await vapiResponse.text();
      console.error('Error de VAPI:', errorText);
      return NextResponse.json(
        { error: 'Error creando assistant en VAPI', details: errorText },
        { status: vapiResponse.status }
      );
    }

    const assistant = await vapiResponse.json();

    // Actualizar el business en nuestra base de datos
    try {
      const businessResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/businesses/${businessId}`, {
        method: 'PUT',
        headers: {
          'Authorization': request.headers.get('Authorization') || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vapi_assistant_id: assistant.id,
          ai_prompt: prompt,
          ai_voice_id: voice,
          ai_language: language,
        }),
      });

      if (!businessResponse.ok) {
        console.error('Error actualizando business:', await businessResponse.text());
        // No fallamos aquí, el assistant ya se creó en VAPI
      }
    } catch (error) {
      console.error('Error actualizando business:', error);
      // No fallamos aquí, el assistant ya se creó en VAPI
    }

    return NextResponse.json({
      success: true,
      assistant: {
        id: assistant.id,
        name: assistant.name,
        prompt: prompt,
        voice: voice,
        language: language,
        status: assistant.status,
        createdAt: assistant.createdAt,
        updatedAt: assistant.updatedAt,
      },
    });

  } catch (error) {
    console.error('Error en POST /api/vapi/assistants:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!VAPI_API_KEY) {
      return NextResponse.json({ error: 'VAPI no configurado' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const assistantId = searchParams.get('id');

    let url = `${VAPI_API_URL}/assistant`;
    if (assistantId) {
      url += `/${assistantId}`;
    }

    const vapiResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!vapiResponse.ok) {
      const errorText = await vapiResponse.text();
      console.error('Error de VAPI:', errorText);
      return NextResponse.json(
        { error: 'Error obteniendo assistant de VAPI', details: errorText },
        { status: vapiResponse.status }
      );
    }

    const data = await vapiResponse.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en GET /api/vapi/assistants:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
