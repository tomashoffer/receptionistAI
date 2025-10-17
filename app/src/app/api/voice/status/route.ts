import { NextResponse, type NextRequest } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return new NextResponse('Unauthorized: Access token not found.', { status: 401 });
    }

    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/voice/status`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return NextResponse.json(response.data);

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API /voice/status - Axios error:', error.response?.data || error.message);
      return new NextResponse(
        JSON.stringify(error.response?.data) || 'Error fetching voice status from API', 
        { status: error.response?.status || 500 }
      );
    }
    console.error('API /voice/status - Unexpected error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
