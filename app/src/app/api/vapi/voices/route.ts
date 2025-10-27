import { NextRequest, NextResponse } from 'next/server';

const VAPI_API_URL = 'https://api.vapi.ai';
const VAPI_API_KEY = process.env.VAPI_API_KEY;

export async function GET(request: NextRequest) {
  try {
    if (!VAPI_API_KEY) {
      return NextResponse.json({ error: 'VAPI no configurado' }, { status: 500 });
    }

    // Obtener voces disponibles de VAPI
    const vapiResponse = await fetch(`${VAPI_API_URL}/voice`, {
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
        { error: 'Error obteniendo voces de VAPI', details: errorText },
        { status: vapiResponse.status }
      );
    }

    const voices = await vapiResponse.json();

    // Filtrar y formatear voces para español principalmente
    const spanishVoices = voices
      .filter((voice: any) => 
        voice.language?.toLowerCase().includes('es') || 
        voice.name?.toLowerCase().includes('spanish') ||
        voice.name?.toLowerCase().includes('español')
      )
      .map((voice: any) => ({
        id: voice.id,
        name: voice.name,
        language: voice.language,
        gender: voice.gender || 'unknown',
        provider: voice.provider || 'azure',
      }));

    // Si no hay voces en español, devolver voces por defecto
    const defaultVoices = [
      {
        id: 'es-ES-AlvaroNeural',
        name: 'Álvaro (Voz Masculina - Español)',
        language: 'es-ES',
        gender: 'male',
        provider: 'azure',
      },
      {
        id: 'es-ES-ElviraNeural',
        name: 'Elvira (Voz Femenina - Español)',
        language: 'es-ES',
        gender: 'female',
        provider: 'azure',
      },
      {
        id: 'es-MX-DaliaNeural',
        name: 'Dalia (Voz Femenina - Español México)',
        language: 'es-MX',
        gender: 'female',
        provider: 'azure',
      },
      {
        id: 'es-MX-JorgeNeural',
        name: 'Jorge (Voz Masculina - Español México)',
        language: 'es-MX',
        gender: 'male',
        provider: 'azure',
      },
    ];

    return NextResponse.json(spanishVoices.length > 0 ? spanishVoices : defaultVoices);

  } catch (error) {
    console.error('Error en GET /api/vapi/voices:', error);
    
    // Devolver voces por defecto en caso de error
    const fallbackVoices = [
      {
        id: 'es-ES-AlvaroNeural',
        name: 'Álvaro (Voz Masculina - Español)',
        language: 'es-ES',
        gender: 'male',
        provider: 'azure',
      },
      {
        id: 'es-ES-ElviraNeural',
        name: 'Elvira (Voz Femenina - Español)',
        language: 'es-ES',
        gender: 'female',
        provider: 'azure',
      },
    ];

    return NextResponse.json(fallbackVoices);
  }
}
