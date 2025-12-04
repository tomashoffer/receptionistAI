import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

export async function GET(request: NextRequest) {
  try {
    const businessId = request.nextUrl.searchParams.get('business_id');

    if (!businessId) {
      return NextResponse.json(
        { error: 'business_id es requerido' },
        { status: 400 }
      );
    }

    const accessToken = request.cookies.get('access_token')?.value;
    const cookieHeader = request.headers.get('cookie') || '';

    const response = await fetch(
      `${API_BASE_URL}/tags?business_id=${businessId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          Cookie: cookieHeader,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: error || 'Error al obtener tags' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error en GET /api/tags:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accessToken = request.cookies.get('access_token')?.value;
    const cookieHeader = request.headers.get('cookie') || '';

    const response = await fetch(`${API_BASE_URL}/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        Cookie: cookieHeader,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error en POST /api/tags:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear tag' },
      { status: 500 }
    );
  }
}

