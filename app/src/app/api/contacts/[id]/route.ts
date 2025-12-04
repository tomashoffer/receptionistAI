import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      `${API_BASE_URL}/contacts/${id}?business_id=${businessId}`,
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
        { error: error || 'Error al obtener contacto' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error en GET /api/contacts/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const businessId = request.nextUrl.searchParams.get('business_id');
    const body = await request.json();

    if (!businessId) {
      return NextResponse.json(
        { error: 'business_id es requerido' },
        { status: 400 }
      );
    }

    const accessToken = request.cookies.get('access_token')?.value;
    const cookieHeader = request.headers.get('cookie') || '';

    const response = await fetch(
      `${API_BASE_URL}/contacts/${id}?business_id=${businessId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          Cookie: cookieHeader,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error en PATCH /api/contacts/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar contacto' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      `${API_BASE_URL}/contacts/${id}?business_id=${businessId}`,
      {
        method: 'DELETE',
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
        { error: error || 'Error al eliminar contacto' },
        { status: response.status }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Error en DELETE /api/contacts/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Error al eliminar contacto' },
      { status: 500 }
    );
  }
}

