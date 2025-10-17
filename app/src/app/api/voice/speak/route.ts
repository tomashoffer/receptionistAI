import { NextResponse, type NextRequest } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return new NextResponse('Unauthorized: Access token not found.', { status: 401 });
    }

    const body = await request.json();
    const { text } = body;
    
    if (!text) {
      return new NextResponse('Text is required', { status: 400 });
    }

    // Llamar al backend para generar audio con OpenAI TTS
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/voice/speak`, 
      { text }, 
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer', // Para recibir audio binario
      }
    );

    // Devolver el audio como blob
    return new NextResponse(response.data, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': response.data.length.toString(),
      },
    });

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API /voice/speak - Axios error:', error.response?.data || error.message);
      return new NextResponse(
        JSON.stringify(error.response?.data) || 'Error generating speech from API', 
        { status: error.response?.status || 500 }
      );
    }
    console.error('API /voice/speak - Unexpected error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
