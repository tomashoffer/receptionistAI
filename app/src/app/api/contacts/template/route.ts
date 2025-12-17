import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('access_token')?.value;
    const cookieHeader = request.headers.get('cookie') || '';

    const response = await fetch(`${API_BASE_URL}/contacts/template`, {
      headers: {
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        Cookie: cookieHeader,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: error || 'Error al generar plantilla' },
        { status: response.status }
      );
    }

    // Obtener el buffer del archivo Excel
    const buffer = await response.arrayBuffer();

    // Retornar como archivo descargable
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="plantilla-contactos.xlsx"',
      },
    });
  } catch (error: any) {
    console.error('Error en GET /api/contacts/template:', error);
    return NextResponse.json(
      { error: error.message || 'Error al generar plantilla' },
      { status: 500 }
    );
  }
}



