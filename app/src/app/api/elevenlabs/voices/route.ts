import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    // Obtener voces del backend (endpoint de Vapi)
    const response = await fetch(`${API_BASE_URL}/vapi/voices`, {
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
    
    // Devolver voces por defecto de 11labs (voces de ElevenLabs disponibles en Vapi) en caso de error
    const fallbackVoices = [
      {
        id: '1WXz8v08ntDcSTeVXMN2',
        name: 'Malena Tango',
        language: 'es-ES',
        gender: 'female',
        provider: '11labs',
        recommended: true,
      },
      {
        id: 'PBi4M0xL4G7oVYxKgqww',
        name: 'Franco',
        language: 'es-ES',
        gender: 'male',
        provider: '11labs',
        recommended: true,
      },
      {
        id: 'bN1bDXgDIGX5lw0rtY2B',
        name: 'Melanie',
        language: 'es-ES',
        gender: 'female',
        provider: '11labs',
      },
      {
        id: '2qfp6zPuviqeCOZIE9RZ',
        name: 'Christina',
        language: 'en-US',
        gender: 'female',
        provider: '11labs',
        recommended: true,
      },
      {
        id: 'DHeSUVQvhhYeIxNUbtj3',
        name: 'Christopher',
        language: 'en-US',
        gender: 'male',
        provider: '11labs',
      },
      {
        id: 'D9Thk1W7FRMgiOhy3zVI',
        name: 'Aaron',
        language: 'en-US',
        gender: 'male',
        provider: '11labs',
      },
    ];

    return NextResponse.json(fallbackVoices);
  }
}

