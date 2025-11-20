import { NextRequest, NextResponse } from 'next/server';

// Usar API_INTERNAL_URL para llamadas desde el servidor (evita problemas de localhost en Windows/Docker)
// Si no está definida, usar 127.0.0.1 en lugar de localhost para evitar problemas de resolución DNS/IPv6
const API_BASE_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Llamar al backend
    const backendUrl = API_BASE_URL;
    
    console.log('🔗 Intentando conectar a:', `${backendUrl}/auth/login`);
    
    // Crear un AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos
    
    try {
      const backendResponse = await fetch(`${backendUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      const data = await backendResponse.json();

      if (!backendResponse.ok) {
        return NextResponse.json(
          { message: data.message || 'Error al iniciar sesión' },
          { status: backendResponse.status }
        );
      }

      // Crear respuesta con los datos
      const response = NextResponse.json(data);
      
      // Copiar cookies del backend a la respuesta de Next.js
      // El backend puede enviar múltiples cookies en set-cookie
      const setCookieHeaders = backendResponse.headers.getSetCookie();
      
      if (setCookieHeaders && setCookieHeaders.length > 0) {
        setCookieHeaders.forEach(cookieString => {
          // Parsear la cookie (formato: name=value; attributes)
          const parts = cookieString.split(';');
          const [nameValue] = parts;
          const [name, value] = nameValue.split('=');
          
          if (name && value) {
            // Extraer atributos de la cookie
            const attributes: any = {
              httpOnly: cookieString.includes('HttpOnly'),
              secure: cookieString.includes('Secure') || process.env.NODE_ENV === 'production',
              sameSite: cookieString.includes('SameSite=Strict') ? 'strict' : 
                       cookieString.includes('SameSite=Lax') ? 'lax' : 'lax',
              path: '/',
            };
            
            // Extraer maxAge si existe
            const maxAgeMatch = cookieString.match(/Max-Age=(\d+)/);
            if (maxAgeMatch) {
              attributes.maxAge = parseInt(maxAgeMatch[1]);
            }
            
            response.cookies.set(name.trim(), value.trim(), attributes);
          }
        });
      }

      return response;
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Timeout: El servidor no respondió en 10 segundos');
      }
      throw fetchError;
    }
  } catch (error: any) {
    console.error('Error en login API route:', error);
    return NextResponse.json(
      { message: error.message || 'Error al conectar con el servidor' },
      { status: 500 }
    );
  }
}

