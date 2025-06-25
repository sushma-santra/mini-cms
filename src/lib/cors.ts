import { NextRequest, NextResponse } from 'next/server';

// CORS configuration - configurable through environment variables
export const CORS_CONFIG = {
  // Primary allowed origin from environment variable, fallback to localhost for development
  ALLOWED_ORIGIN: process.env.CORS_ALLOWED_ORIGIN || process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
  
  // Additional allowed origins (comma-separated in env var)
  ADDITIONAL_ORIGINS: process.env.CORS_ADDITIONAL_ORIGINS ? 
    process.env.CORS_ADDITIONAL_ORIGINS.split(',').map(origin => origin.trim()) : 
    [],
  
  ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  ALLOWED_HEADERS: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'Pragma'
  ],
  ALLOW_CREDENTIALS: true,
  MAX_AGE: '86400', // 24 hours cache for preflight
};

/**
 * Check if an origin is allowed
 */
function isOriginAllowed(origin: string): boolean {
  // Check primary origin
  if (origin === CORS_CONFIG.ALLOWED_ORIGIN) {
    return true;
  }
  
  // Check additional origins
  if (CORS_CONFIG.ADDITIONAL_ORIGINS.includes(origin)) {
    return true;
  }
  
  // Allow localhost in development
  if (process.env.NODE_ENV === 'development' && 
      (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:'))) {
    return true;
  }
  
  return false;
}

/**
 * Creates standard CORS headers
 */
export function createCorsHeaders(origin?: string): Record<string, string> {
  // Determine the allowed origin
  let allowedOrigin = CORS_CONFIG.ALLOWED_ORIGIN;
  
  if (origin && isOriginAllowed(origin)) {
    allowedOrigin = origin;
  }
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': CORS_CONFIG.ALLOWED_METHODS.join(', '),
    'Access-Control-Allow-Headers': CORS_CONFIG.ALLOWED_HEADERS.join(', '),
    'Access-Control-Allow-Credentials': CORS_CONFIG.ALLOW_CREDENTIALS.toString(),
    'Access-Control-Max-Age': CORS_CONFIG.MAX_AGE,
    'Vary': 'Origin', // Important for caching
  };
}

/**
 * Handles preflight OPTIONS requests
 */
export function handleCorsPreflightRequest(request: NextRequest): NextResponse {
  const origin = request.headers.get('origin');
  const corsHeaders = createCorsHeaders(origin || undefined);
  
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

/**
 * Adds CORS headers to an existing NextResponse
 */
export function addCorsHeaders(response: NextResponse, request?: NextRequest): NextResponse {
  const origin = request?.headers.get('origin');
  const corsHeaders = createCorsHeaders(origin || undefined);
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

/**
 * Creates a NextResponse with CORS headers
 */
export function createCorsResponse(
  data: any,
  init?: ResponseInit,
  request?: NextRequest
): NextResponse {
  const origin = request?.headers.get('origin');
  const corsHeaders = createCorsHeaders(origin || undefined);
  
  return NextResponse.json(data, {
    ...init,
    headers: {
      ...corsHeaders,
      ...(init?.headers || {}),
    },
  });
}

/**
 * Middleware function to handle CORS for API routes
 */
export function withCors(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return handleCorsPreflightRequest(request);
    }
    
    // Process the actual request
    const response = await handler(request);
    
    // Add CORS headers to the response
    return addCorsHeaders(response, request);
  };
} 