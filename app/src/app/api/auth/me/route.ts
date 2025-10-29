import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, importSPKI } from 'jose';

const JWT_ALGORITHM = 'RS256';

// Helper function to get and import the public key
async function getJwtPublicKey() {
  const publicKeyBase64 = process.env.JWT_PUBLIC_KEY_BASE64;
  
  if (!publicKeyBase64) {
    throw new Error('JWT_PUBLIC_KEY_BASE64 variable no esta definida!');
  }

  // Decode the base64 string back into a proper UTF-8 PEM key
  const publicKeyPem = Buffer.from(publicKeyBase64, 'base64').toString('utf-8').trim();
  return await importSPKI(publicKeyPem, JWT_ALGORITHM);
}

export async function GET(request: NextRequest) {
  try {
    // Intentar obtener el token con ambos nombres
    const accessToken = request.cookies.get('accessToken')?.value || request.cookies.get('access_token')?.value;
    
    if (!accessToken) {
      console.log('❌ No se encontró accessToken en las cookies');
      console.log('Cookies disponibles:', request.cookies.getAll());
      return new NextResponse('No autorizado: No se encontró el token de acceso.', { status: 401 });
    }
    
    console.log('✅ AccessToken encontrado:', accessToken.substring(0, 20) + '...');

    // Securely decode the token locally to check the user's role first.
    const publicKey = await getJwtPublicKey();
    const { payload } = await jwtVerify(accessToken, publicKey, {
      algorithms: [JWT_ALGORITHM],
    });

    // If the user is a GUEST, construct and return a guest user object directly.
    // This avoids making an unnecessary and failing API call to the backend.
    if (payload.role === 'GUEST') {
      console.log('API /me: GUEST role detectado. Retornando datos de usuario falso...');
      const guestUser = {
        id: payload.sub, // The 'sub' claim holds the unique guest ID
        role: 'GUEST',
        first_name: 'Invitado',
        last_name: '',
        email: 'sin@correo.com',
      };
      return NextResponse.json(guestUser);
    }

    // If the user is NOT a guest, proceed with the existing logic.
    // Make a call to the backend to get the full user data
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    // Obtener todas las cookies de la request
    const cookieHeader = request.headers.get('cookie') || '';
    
    const backendResponse = await fetch(`${backendUrl}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Cookie': cookieHeader, // Pasar las cookies explícitamente
      },
    });

    if (!backendResponse.ok) {
      if (backendResponse.status === 401) {
        return new NextResponse('Token inválido o expirado.', { status: 401 });
      }
      throw new Error(`Backend error: ${backendResponse.status}`);
    }

    const userData = await backendResponse.json();
    // Asegurar que solo devolvemos datos serializables
    const cleanUserData = {
      id: userData.user?.id,
      email: userData.user?.email,
      first_name: userData.user?.first_name,
      last_name: userData.user?.last_name,
      role: userData.user?.role,
      phone: userData.user?.phone,
      business_id: userData.user?.business_id,
      business_name: userData.user?.business_name,
    };
    return NextResponse.json(cleanUserData);

  } catch (error) {
    console.error('Error en /api/auth/me:', error);
    return new NextResponse('Error interno del servidor.', { status: 500 });
  }
}
