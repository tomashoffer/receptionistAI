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
    
    console.log('🌐 Llamando al backend:', `${backendUrl}/auth/me`);
    
    // Obtener todas las cookies de la request
    const cookieHeader = request.headers.get('cookie') || '';
    
    const backendResponse = await fetch(`${backendUrl}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Cookie': cookieHeader, // Pasar las cookies explícitamente
      },
    });

    console.log('📡 Respuesta del backend - Status:', backendResponse.status);
    console.log('📡 Respuesta del backend - Headers:', Object.fromEntries(backendResponse.headers.entries()));

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ Backend error response:', errorText);
      
      if (backendResponse.status === 401) {
        return new NextResponse('Token inválido o expirado.', { status: 401 });
      }
      throw new Error(`Backend error: ${backendResponse.status} - ${errorText}`);
    }

    const responseText = await backendResponse.text();
    console.log('📄 Respuesta del backend (texto):', responseText);
    
    let userData;
    try {
      userData = responseText ? JSON.parse(responseText) : null;
    } catch (parseError) {
      console.error('❌ Error parseando JSON del backend:', parseError);
      console.error('Texto recibido:', responseText);
      
      // FALLBACK: Si el backend falla, usar datos del JWT
      console.warn('⚠️ Usando datos del JWT como fallback');
      const fallbackUser = {
        id: payload.sub as string,
        email: payload.email as string || 'usuario@email.com',
        first_name: payload.first_name as string || 'Usuario',
        last_name: payload.last_name as string || '',
        role: payload.role as string,
        phone: payload.phone as string || '',
        business_id: payload.business_id as string || null,
        business_name: payload.business_name as string || null,
      };
      return NextResponse.json(fallbackUser);
    }
    
    console.log('📦 Datos recibidos del backend:', JSON.stringify(userData, null, 2));
    
    // El backend puede devolver diferentes estructuras:
    // 1. { user: { id, email, ... } }  <- Estructura anidada
    // 2. { id, email, ... }            <- Estructura directa
    // 3. null o undefined              <- Error
    
    let userInfo;
    
    if (!userData) {
      console.error('❌ userData es null o undefined - Usando datos del JWT como fallback');
      
      // FALLBACK: Si el backend devuelve null, usar datos del JWT
      const fallbackUser = {
        id: payload.sub as string,
        email: payload.email as string || 'usuario@email.com',
        first_name: payload.first_name as string || 'Usuario',
        last_name: payload.last_name as string || '',
        role: payload.role as string,
        phone: payload.phone as string || '',
        business_id: payload.business_id as string || null,
        business_name: payload.business_name as string || null,
      };
      return NextResponse.json(fallbackUser);
    }
    
    // Si tiene la propiedad 'user', usar esa (estructura anidada)
    if (userData.user) {
      userInfo = userData.user;
    } 
    // Si tiene 'id' directamente, usar userData completo (estructura directa)
    else if (userData.id) {
      userInfo = userData;
    }
    // Si no tiene ni user ni id, usar JWT como fallback
    else {
      console.error('❌ userData no tiene estructura válida - Usando datos del JWT como fallback');
      console.error('userData recibido:', userData);
      
      const fallbackUser = {
        id: payload.sub as string,
        email: payload.email as string || 'usuario@email.com',
        first_name: payload.first_name as string || 'Usuario',
        last_name: payload.last_name as string || '',
        role: payload.role as string,
        phone: payload.phone as string || '',
        business_id: payload.business_id as string || null,
        business_name: payload.business_name as string || null,
      };
      return NextResponse.json(fallbackUser);
    }
    
    // Asegurar que solo devolvemos datos serializables
    const cleanUserData = {
      id: userInfo.id,
      email: userInfo.email,
      first_name: userInfo.first_name,
      last_name: userInfo.last_name,
      role: userInfo.role,
      phone: userInfo.phone,
      business_id: userInfo.business_id,
      business_name: userInfo.business_name,
    };
    
    console.log('✅ Devolviendo datos limpios:', cleanUserData);
    return NextResponse.json(cleanUserData);

  } catch (error) {
    console.error('Error en /api/auth/me:', error);
    return new NextResponse('Error interno del servidor.', { status: 500 });
  }
}
