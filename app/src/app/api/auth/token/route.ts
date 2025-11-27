import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

export async function GET(request: NextRequest) {
  try {
    // Obtener todas las cookies de la request
    const cookieHeader = request.headers.get('cookie') || '';
    
    // Crear un AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos
    
    try {
      const backendResponse = await fetch(`${API_BASE_URL}/auth/token`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookieHeader, // Pasar las cookies explícitamente
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error('❌ Backend error response:', errorText);
        
        if (backendResponse.status === 401) {
          return new NextResponse('No autorizado', { status: 401 });
        }
        throw new Error(`Backend error: ${backendResponse.status} - ${errorText}`);
      }

      const data = await backendResponse.json();
      
      // Copiar las cookies del backend a la respuesta de Next.js
      const setCookieHeaders = backendResponse.headers.getSetCookie();
      const response = NextResponse.json(data);
      
      setCookieHeaders.forEach((cookie) => {
        response.headers.append('Set-Cookie', cookie);
      });
      
      return response;
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('❌ Timeout al conectar con el backend');
        return new NextResponse('Timeout al conectar con el servidor', { status: 504 });
      }
      console.error('❌ Error en fetch al backend:', fetchError);
      return new NextResponse('Error al conectar con el servidor', { status: 500 });
    }
  } catch (error) {
    console.error('Error en /api/auth/token:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}

