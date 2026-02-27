import { NextResponse } from 'next/server';

// Expected environment variables for authentication
const AUTH_USERNAME = process.env.AUTH_USERNAME;
const AUTH_PASSWORD = process.env.AUTH_PASSWORD;

// Don't cache the results
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    // Validate environment variables
    if (!AUTH_USERNAME || !AUTH_PASSWORD) {
      return NextResponse.json(
        { success: false, message: 'Authentication not configured on server' },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { username, password, clientName } = body;

    // Validate request parameters
    if (!username || !password || !clientName) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: username, password, or clientName',
        },
        { status: 400 }
      );
    }

    // Validate credentials
    if (username === AUTH_USERNAME && password === AUTH_PASSWORD) {
      return NextResponse.json({
        success: true,
        message: 'Authentication successful',
        clientName: clientName,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid username or password',
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
