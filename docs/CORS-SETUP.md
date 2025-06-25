# CORS Configuration Guide

This document explains the CORS (Cross-Origin Resource Sharing) setup for the Simple CMS API.

## Overview

The application implements CORS at multiple levels to ensure secure cross-origin requests from the frontend at `https://abc.com`.

## Implementation Layers

### 1. Global Middleware (`middleware.ts`)

The Next.js middleware handles CORS globally for all API routes:

```typescript
// Handles preflight OPTIONS requests at the middleware level
// Applies to all /api/* routes
export const config = {
  matcher: ['/api/:path*'],
};
```

### 2. CORS Utility Library (`src/lib/cors.ts`)

Centralized CORS configuration and utilities:

```typescript
export const CORS_CONFIG = {
  ALLOWED_ORIGIN: 'https://abc.com',
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
  MAX_AGE: '86400', // 24 hours
};
```

### 3. Individual Route Implementation

Each API route includes CORS headers in responses:

```typescript
// Example from /api/submit/route.ts
export async function OPTIONS(request: Request) {
  return handleCorsPreflightRequest(request as any);
}

export async function POST(request: Request) {
  // ... route logic ...
  return createCorsResponse(data, { status: 200 }, request as any);
}
```

## CORS Headers Explained

### Access-Control-Allow-Origin
- **Value**: `https://abc.com`
- **Purpose**: Specifies which origin can access the resource
- **Security**: Restricts access to only the specified frontend domain

### Access-Control-Allow-Methods
- **Value**: `POST, OPTIONS`
- **Purpose**: Specifies allowed HTTP methods for cross-origin requests
- **Note**: OPTIONS is required for preflight requests

### Access-Control-Allow-Headers
- **Value**: `Content-Type, Authorization, X-Requested-With, Accept, Origin`
- **Purpose**: Specifies which headers can be used in the actual request
- **Custom Headers**: Add any custom headers your frontend sends

### Access-Control-Allow-Credentials
- **Value**: `true`
- **Purpose**: Allows cookies and authorization headers to be sent
- **Security**: Only enable if you need to send credentials

### Access-Control-Max-Age
- **Value**: `86400` (24 hours)
- **Purpose**: How long browsers can cache preflight responses
- **Performance**: Reduces preflight requests for better performance

## Preflight Requests

For complex requests (POST with JSON data, custom headers, credentials), browsers send a preflight OPTIONS request:

1. **Browser sends OPTIONS request** with:
   - `Origin: https://abc.com`
   - `Access-Control-Request-Method: POST`
   - `Access-Control-Request-Headers: Content-Type, Authorization`

2. **Server responds** with:
   - `Access-Control-Allow-Origin: https://abc.com`
   - `Access-Control-Allow-Methods: POST, OPTIONS`
   - `Access-Control-Allow-Headers: Content-Type, Authorization`
   - `Access-Control-Allow-Credentials: true`

3. **Browser sends actual request** if preflight succeeds

## CDN Configuration (Akamai)

If using Akamai or similar CDN, configure these response headers:

### Edge Response Headers

```javascript
// Akamai Property Manager Configuration
{
  "name": "modifyOutgoingResponseHeader",
  "options": {
    "action": "ADD",
    "standardAddHeaderName": "OTHER",
    "headerValue": "https://abc.com",
    "customHeaderName": "Access-Control-Allow-Origin"
  }
},
{
  "name": "modifyOutgoingResponseHeader", 
  "options": {
    "action": "ADD",
    "standardAddHeaderName": "OTHER",
    "headerValue": "POST, OPTIONS, GET",
    "customHeaderName": "Access-Control-Allow-Methods"
  }
},
{
  "name": "modifyOutgoingResponseHeader",
  "options": {
    "action": "ADD", 
    "standardAddHeaderName": "OTHER",
    "headerValue": "Content-Type, Authorization, X-Requested-With, Accept, Origin",
    "customHeaderName": "Access-Control-Allow-Headers"
  }
},
{
  "name": "modifyOutgoingResponseHeader",
  "options": {
    "action": "ADD",
    "standardAddHeaderName": "OTHER", 
    "headerValue": "true",
    "customHeaderName": "Access-Control-Allow-Credentials"
  }
},
{
  "name": "modifyOutgoingResponseHeader",
  "options": {
    "action": "ADD",
    "standardAddHeaderName": "OTHER",
    "headerValue": "86400", 
    "customHeaderName": "Access-Control-Max-Age"
  }
}
```

### Akamai Rule Conditions

Apply these headers only to API routes:

```javascript
{
  "name": "path",
  "options": {
    "matchOperator": "MATCHES_ONE_OF",
    "values": ["/api/*"],
    "matchCaseSensitive": false
  }
}
```

### Handle OPTIONS Requests

Configure Akamai to handle preflight OPTIONS requests:

```javascript
{
  "name": "requestMethod",
  "options": {
    "matchOperator": "IS",
    "value": "OPTIONS"
  }
}
```

Response behavior:
```javascript
{
  "name": "constructResponse",
  "options": {
    "responseCode": 200,
    "body": ""
  }
}
```

## Environment Configuration

Update your environment variables:

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://your-api-domain.com
CORS_ALLOWED_ORIGIN=https://abc.com
```

## Testing CORS

### Using curl

Test preflight request:
```bash
curl -X OPTIONS \
  -H "Origin: https://abc.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v https://your-api.com/api/submit
```

Test actual request:
```bash
curl -X POST \
  -H "Origin: https://abc.com" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{"test": "data"}' \
  -v https://your-api.com/api/submit
```

### Browser DevTools

1. Open Network tab
2. Make a request from `https://abc.com`
3. Check for:
   - Preflight OPTIONS request (if applicable)
   - CORS headers in response
   - No CORS errors in console

## Troubleshooting

### Common Issues

1. **"CORS policy: No 'Access-Control-Allow-Origin' header"**
   - Ensure middleware is running
   - Check origin configuration

2. **"CORS policy: Request header field authorization is not allowed"**
   - Add 'Authorization' to ALLOWED_HEADERS
   - Ensure preflight handling works

3. **"CORS policy: The value of the 'Access-Control-Allow-Credentials' header"**
   - Set ALLOW_CREDENTIALS to true
   - Don't use wildcard (*) for origin when credentials are true

4. **Preflight requests failing**
   - Ensure OPTIONS handler exists
   - Check middleware configuration
   - Verify CDN doesn't block OPTIONS

### Debug Steps

1. Check middleware is loaded: `console.log` in middleware function
2. Verify CORS headers in response: Use browser DevTools Network tab
3. Test without CDN: Direct API calls to origin server
4. Check request/response logs: Server-side logging

## Security Considerations

1. **Never use wildcard (*) for origin** when allowing credentials
2. **Minimize allowed headers** to only what's needed
3. **Use HTTPS** for both frontend and API
4. **Validate origin** server-side for sensitive operations
5. **Monitor CORS errors** in production logs

## Production Checklist

- [ ] Middleware configured and deployed
- [ ] CORS utility functions implemented
- [ ] All API routes include CORS headers
- [ ] CDN configured (if applicable)
- [ ] Environment variables set
- [ ] CORS testing completed
- [ ] Security review completed
- [ ] Monitoring configured 