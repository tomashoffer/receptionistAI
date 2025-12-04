import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const businessId = searchParams.get('business_id');
    const search = searchParams.get('search') || '';
    const tags = searchParams.get('tags') || '';
    const source = searchParams.get('source') || '';

    if (!businessId) {
      return NextResponse.json(
        { error: 'business_id es requerido' },
        { status: 400 }
      );
    }

    const accessToken = request.cookies.get('access_token')?.value;
    const cookieHeader = request.headers.get('cookie') || '';

    const queryParams = new URLSearchParams({
      business_id: businessId,
      ...(search && { search }),
      ...(tags && { tags }),
      ...(source && { source }),
    });

    const response = await fetch(
      `${API_BASE_URL}/contacts/export?${queryParams.toString()}`,
      {
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          Cookie: cookieHeader,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: error || 'Error al exportar contactos' },
        { status: response.status }
      );
    }

    // Obtener el buffer del archivo Excel
    const buffer = await response.arrayBuffer();
    
    // Generar nombre de archivo con fecha
    const date = new Date().toISOString().split('T')[0];
    const filename = `contactos-${date}.xlsx`;

    // Retornar como archivo descargable
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Error en GET /api/contacts/export:', error);
    return NextResponse.json(
      { error: error.message || 'Error al exportar contactos' },
      { status: 500 }
    );
  }
}

