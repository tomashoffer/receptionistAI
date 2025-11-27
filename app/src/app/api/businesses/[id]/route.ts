import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, importSPKI } from 'jose';

const API_BASE_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';
const JWT_ALGORITHM = 'RS256';

// Helper function to get and import the public key
async function getJwtPublicKey() {
  const publicKeyBase64 = process.env.JWT_PUBLIC_KEY_BASE64;
  
  if (!publicKeyBase64) {
    throw new Error('JWT_PUBLIC_KEY_BASE64 variable no esta definida!');
  }

  const publicKeyPem = Buffer.from(publicKeyBase64, 'base64').toString('utf-8').trim();
  return await importSPKI(publicKeyPem, JWT_ALGORITHM);
}

async function getAccessToken(request: NextRequest): Promise<string | null> {
  const accessToken = request.cookies.get('accessToken')?.value || request.cookies.get('access_token')?.value;
  return accessToken || null;
}

// GET /api/businesses/[id] - Obtener un negocio por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const cookieHeader = request.headers.get('cookie') || '';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      console.log(`🌐 Llamando al backend: ${API_BASE_URL}/businesses/${params.id}`);
      
      const backendResponse = await fetch(`${API_BASE_URL}/businesses/${params.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Cookie': cookieHeader,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error('❌ Backend error response:', errorText);
        return new NextResponse(errorText || 'Error del servidor', { status: backendResponse.status });
      }

      const data = await backendResponse.json();
      console.log('✅ Business obtenido exitosamente');
      return NextResponse.json(data);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('❌ Timeout al conectar con el backend');
        return new NextResponse('Timeout al conectar con el servidor', { status: 504 });
      }
      console.error('❌ Error en fetch al backend:', {
        message: fetchError.message,
        code: fetchError.code,
        errno: fetchError.errno,
        syscall: fetchError.syscall,
        url: `${API_BASE_URL}/businesses/${params.id}`,
      });
      
      // Si es ECONNRESET, proporcionar un mensaje más específico
      if (fetchError.code === 'ECONNRESET') {
        return new NextResponse('Error de conexión con el servidor. El servidor cerró la conexión inesperadamente.', { status: 503 });
      }
      
      return new NextResponse('Error al conectar con el servidor', { status: 500 });
    }
  } catch (error) {
    console.error('Error en /api/businesses/[id] GET:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}

// PATCH /api/businesses/[id] - Actualizar un negocio
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      const backendResponse = await fetch(`${API_BASE_URL}/businesses/${params.id}`, {
        method: 'PATCH',
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
    console.error('Error en /api/businesses/[id] PATCH:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}

// DELETE /api/businesses/[id] - Eliminar un negocio
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const cookieHeader = request.headers.get('cookie') || '';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const backendResponse = await fetch(`${API_BASE_URL}/businesses/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Cookie': cookieHeader,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error('❌ Backend error response:', errorText);
        return new NextResponse(errorText || 'Error del servidor', { status: backendResponse.status });
      }

      return new NextResponse(null, { status: 204 });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        return new NextResponse('Timeout al conectar con el servidor', { status: 504 });
      }
      console.error('❌ Error en fetch al backend:', fetchError);
      return new NextResponse('Error al conectar con el servidor', { status: 500 });
    }
  } catch (error) {
    console.error('Error en /api/businesses/[id] DELETE:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}

