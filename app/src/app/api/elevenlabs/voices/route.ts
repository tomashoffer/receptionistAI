import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    // Obtener voces del backend
    const response = await fetch(`${API_BASE_URL}/elevenlabs/voices`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error obteniendo voces:', errorText);
      return NextResponse.json(
        { error: 'Error obteniendo voces del backend', details: errorText },
        { status: response.status }
      );
    }

    const voices = await response.json();

    return NextResponse.json(voices);

  } catch (error) {
    console.error('Error en GET /api/elevenlabs/voices:', error);
    
    // Devolver voces por defecto en caso de error
    const fallbackVoices = [
      {
        id: 'p7AwDmKvTdoHTBuueGvP',
        name: 'Malena (Voz Femenina - Español)',
        language: 'es-ES',
        gender: 'female',
        provider: 'elevenlabs',
      },
      {
        id: 'voivgekQLm3GYiKMHUnPVvY',
        name: 'Agustin (Voz Masculina - Español)',
        language: 'es-ES',
        gender: 'male',
        provider: 'elevenlabs',
      },
      {
        id: 'gBTPbHzRd0ZmV75Z5Zk4',
        name: 'Carlos (Voz Masculina - Español)',
        language: 'es-ES',
        gender: 'male',
        provider: 'elevenlabs',
      },
    ];

    return NextResponse.json(fallbackVoices);
  }
}

