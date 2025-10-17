import { NextResponse, type NextRequest } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    
    console.log('🔍 Debug - All cookies:', request.cookies.getAll());
    console.log('🔍 Debug - Access token:', accessToken);

    if (!accessToken) {
      console.log('❌ No access token found in cookies');
      return new NextResponse('Unauthorized: Access token not found.', { status: 401 });
    }

    const formData = await request.formData();
    
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'multipart/form-data',
    };
    
    console.log('🚀 Sending request to backend with headers:', headers);
    
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/voice/process`, formData, {
      headers,
    });

    return NextResponse.json(response.data);

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API /voice/process - Axios error:', error.response?.data || error.message);
      return new NextResponse(
        JSON.stringify(error.response?.data) || 'Error processing voice from API', 
        { status: error.response?.status || 500 }
      );
    }
    console.error('API /voice/process - Unexpected error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
