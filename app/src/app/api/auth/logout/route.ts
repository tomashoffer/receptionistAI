import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = new NextResponse(JSON.stringify({ message: 'Logout successful' }), {
      status: 200,
    });

    // Instruct the browser to clear the cookies by setting their maxAge to 0.
    // This effectively destroys the session on the client side.
    response.cookies.set('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict',
      maxAge: 0,
    });

    response.cookies.set('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Error en logout:', error);
    return new NextResponse(JSON.stringify({ message: 'Logout failed' }), {
      status: 500,
    });
  }
}
