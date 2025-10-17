import { NextResponse, type NextRequest } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return new NextResponse('Unauthorized: Access token not found.', { status: 401 });
    }

    const body = await request.json();
    
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/voice/process-text`, body, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data);

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API /voice/process-text - Axios error:', error.response?.data || error.message);
      return new NextResponse(
        JSON.stringify(error.response?.data) || 'Error processing text from API', 
        { status: error.response?.status || 500 }
      );
    }
    console.error('API /voice/process-text - Unexpected error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
