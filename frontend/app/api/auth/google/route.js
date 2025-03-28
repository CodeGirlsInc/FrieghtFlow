import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { token } = await request.json();
    const backendResponse = await fetch(`${process.env.BACKEND_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!backendResponse.ok) {
      throw new Error('Authentication failed');
    }

    const data = await backendResponse.json();
    
    return NextResponse.json({
      success: true,
      access_token: data.data.access_token,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 400 }
    );
  }
}