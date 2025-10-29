import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, importSPKI } from 'jose';

// The `matcher` configuration is updated to run on all paths
// except for internal Next.js assets and API routes.
// This allows the middleware logic to handle both public and private routes.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page - no middleware needed)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
};

// --- Centralized Configuration for different route types ---
const publicPaths = ['/', '/main', '/register', '/registro', '/unauthorized'];
const adminOnlyPaths = [
    '/dashboard/admin',
    '/users',
    '/businesses',
  ];
  

const ADMIN_ROLE = 'ADMIN';
const JWT_ALGORITHM = 'RS256';

// Helper function to get and import the public key
async function getJwtPublicKey() {
  //Read the base64 encoded public key from environment variables.
  const publicKeyBase64 = process.env.JWT_PUBLIC_KEY_BASE64;
  
  if (!publicKeyBase64) {
    throw new Error('JWT_PUBLIC_KEY_BASE64 variable no esta definida!');
  }

  //Decode the base64 string back into a proper UTF-8 PEM key.
  const publicKeyPem = Buffer.from(publicKeyBase64, 'base64').toString('utf-8').trim();
  
  //Import the decoded PEM key to be used for verification.
  return await importSPKI(publicKeyPem, JWT_ALGORITHM);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('access_token')?.value;
  const loginUrl = new URL('/', request.url);

  const isPublicPath = publicPaths.includes(pathname);


  // --- Prevent logged-in users from accessing public-only pages ---
  if (isPublicPath && accessToken) {
    try {
      // Verify token to ensure it's valid before redirecting
      await jwtVerify(accessToken, await getJwtPublicKey());
      // If the token is valid, the user is logged in. Redirect them to their main page.
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      // If token verification fails (e.g., it's expired or invalid),
      // treat them as logged out. We can let the request continue to the public page.
      console.log("Validacion de Token fallida en la ruta publica, permitiendo acceso:", error);
      return NextResponse.next();
    }
  }

  // --- Protect private routes for non-logged-in users ---
  const isPrivatePath = !isPublicPath;
  if (isPrivatePath && !accessToken) {
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // --- For logged-in users on private routes, perform role-based checks ---
  if (isPrivatePath && accessToken) {
    try {
      const publicKey = await getJwtPublicKey();
      const { payload } = await jwtVerify(accessToken, publicKey, {
        algorithms: [JWT_ALGORITHM],
      });

      const isAccessingAdminPath = adminOnlyPaths.some(path => pathname.startsWith(path));
      if (isAccessingAdminPath && payload.role !== ADMIN_ROLE) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    } catch (error) {
      // This catches errors like an expired token on a private route.
      console.error("JWT verificacion fallida por ruta privada:", error);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If no other condition is met, allow the request to proceed.
  return NextResponse.next();
}
