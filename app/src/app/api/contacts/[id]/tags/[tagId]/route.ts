import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; tagId: string }> }
) {
  try {
    const { id, tagId } = await params;
    const accessToken = request.cookies.get('access_token')?.value;
    const cookieHeader = request.headers.get('cookie') || '';

    const response = await fetch(
      `${API_BASE_URL}/contacts/${id}/tags/${tagId}`,
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
        { error: error || 'Error al quitar tag' },
        { status: response.status }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Error en DELETE /api/contacts/[id]/tags/[tagId]:', error);
    return NextResponse.json(
      { error: error.message || 'Error al quitar tag' },
      { status: 500 }
    );
  }
}

