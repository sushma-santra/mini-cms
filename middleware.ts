import { NextRequest, NextResponse } from 'next/server';
import { CORS_CONFIG } from '@/lib/cors';

export function middleware(request: NextRequest) {
  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': CORS_CONFIG.ALLOWED_ORIGIN,
          'Access-Control-Allow-Methods': CORS_CONFIG.ALLOWED_METHODS.join(', '),
          'Access-Control-Allow-Headers': CORS_CONFIG.ALLOWED_HEADERS.join(', '),
          'Access-Control-Allow-Credentials': CORS_CONFIG.ALLOW_CREDENTIALS.toString(),
          'Access-Control-Max-Age': CORS_CONFIG.MAX_AGE,
          'Vary': 'Origin',
        },
      });
    }

    // For other requests, continue to the API route
    // The individual routes will add CORS headers to their responses
    return NextResponse.next();
  }

  // For non-API routes, continue normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
}; 