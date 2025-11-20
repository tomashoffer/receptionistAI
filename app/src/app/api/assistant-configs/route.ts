import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, importSPKI } from 'jose';

const API_BASE_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';
const JWT_ALGORITHM = 'RS256';

async function getJwtPublicKey() {
  const publicKeyBase64 = process.env.JWT_PUBLIC_KEY_BASE64;
  
  if (!publicKeyBase64) {
    throw new Error('JWT_PUBLIC_KEY_BASE64 variable no esta definida!');
  }

  const publicKeyPem = Buffer.from(publicKeyBase64, 'base64').toString('utf-8').trim();
  return await importSPKI(publicKeyPem, JWT_ALGORITHM);
}

async function getAccessToken(request: NextRequest): Promise<string | null> {
  const accessToken = request.cookies.get('access_token')?.value;
  return accessToken || null;
}

// POST /api/assistant-configs - Crear una nueva configuración
export async function POST(request: NextRequest) {
  try {
    const accessToken = await getAccessToken(request);
    
    if (!accessToken) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    // Verificar el token
    try {
      const publicKey = await getJwtPublicKey();
      await jwtVerify(accessToken, publicKey, { algorithms: [JWT_ALGORITHM] });
    } catch (error) {
      return new NextResponse('Token inválido o expirado', { status: 401 });
    }

    const body = await request.json();
    const cookieHeader = request.headers.get('cookie') || '';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const backendResponse = await fetch(`${API_BASE_URL}/assistant-configs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Cookie': cookieHeader,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error('❌ Backend error response:', errorText);
        return new NextResponse(errorText || 'Error del servidor', { status: backendResponse.status });
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        return new NextResponse('Timeout al conectar con el servidor', { status: 504 });
      }
      console.error('❌ Error en fetch al backend:', fetchError);
      return new NextResponse('Error al conectar con el servidor', { status: 500 });
    }
  } catch (error) {
    console.error('Error en /api/assistant-configs POST:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}

