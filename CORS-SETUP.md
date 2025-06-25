# CORS Configuration Guide

This document explains the CORS (Cross-Origin Resource Sharing) setup for the Simple CMS API.

## Overview

The application implements CORS at multiple levels to ensure secure cross-origin requests from your frontend domain(s). The configuration is now fully customizable through environment variables.

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

Centralized CORS configuration with environment variable support:

```typescript
export const CORS_CONFIG = {
  // Primary allowed origin from environment variable
  ALLOWED_ORIGIN: process.env.CORS_ALLOWED_ORIGIN || 
                  process.env.NEXT_PUBLIC_FRONTEND_URL || 
                  'http://localhost:3000',
  
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

## Environment Configuration

### Required Environment Variables

Add these to your `.env.local` file:

```bash
# Primary allowed origin for CORS requests
CORS_ALLOWED_ORIGIN="https://your-frontend-domain.com"

# Alternative: use NEXT_PUBLIC_FRONTEND_URL if you prefer
# NEXT_PUBLIC_FRONTEND_URL="https://your-frontend-domain.com"

# Additional allowed origins (comma-separated)
# CORS_ADDITIONAL_ORIGINS="https://staging.your-domain.com,https://dev.your-domain.com"
```

### Configuration Options

1. **Single Origin Setup**:
   ```bash
   CORS_ALLOWED_ORIGIN="https://abc.com"
   ```

2. **Multiple Origins Setup**:
   ```bash
   CORS_ALLOWED_ORIGIN="https://abc.com"
   CORS_ADDITIONAL_ORIGINS="https://staging.abc.com,https://dev.abc.com"
   ```

3. **Using Frontend URL Variable**:
   ```bash
   NEXT_PUBLIC_FRONTEND_URL="https://abc.com"
   ```

4. **Development Setup**:
   ```bash
   # Automatically allows localhost in development mode
   CORS_ALLOWED_ORIGIN="http://localhost:3000"
   ```

## Origin Validation Logic

The system validates origins using this priority:

1. **Primary Origin**: Matches `CORS_ALLOWED_ORIGIN` or `NEXT_PUBLIC_FRONTEND_URL`
2. **Additional Origins**: Matches any origin in `CORS_ADDITIONAL_ORIGINS`
3. **Development Mode**: Automatically allows `localhost` origins when `NODE_ENV=development`

```typescript
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
```

## CORS Headers Explained

### Access-Control-Allow-Origin
- **Value**: Dynamic based on request origin and configuration
- **Purpose**: Specifies which origin can access the resource
- **Security**: Restricts access to only configured domains

### Access-Control-Allow-Methods
- **Value**: `GET, POST, PUT, DELETE, OPTIONS`
- **Purpose**: Specifies allowed HTTP methods for cross-origin requests
- **Note**: OPTIONS is required for preflight requests

### Access-Control-Allow-Headers
- **Value**: `Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma`
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

### Dynamic Origin Handling

For multiple origins, use Akamai's variable functionality:

```javascript
{
  "name": "setVariable",
  "options": {
    "variableName": "PMUSER_CORS_ORIGIN",
    "valueSource": "EXPRESSION",
    "expression": "{{builtin.AK_HOST}}"
  }
}
```

## Testing CORS

### Using curl

Test with your configured origin:
```bash
# Replace https://abc.com with your CORS_ALLOWED_ORIGIN
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
2. Make a request from your configured origin
3. Check for:
   - Preflight OPTIONS request (if applicable)
   - CORS headers in response
   - No CORS errors in console

## Deployment Configurations

### Production
```bash
CORS_ALLOWED_ORIGIN="https://your-production-domain.com"
NODE_ENV="production"
```

### Staging
```bash
CORS_ALLOWED_ORIGIN="https://staging.your-domain.com"
CORS_ADDITIONAL_ORIGINS="https://preview.your-domain.com"
NODE_ENV="production"
```

### Development
```bash
CORS_ALLOWED_ORIGIN="http://localhost:3000"
NODE_ENV="development"
# Localhost origins are automatically allowed in development
```

## Troubleshooting

### Common Issues

1. **"CORS policy: No 'Access-Control-Allow-Origin' header"**
   - Check `CORS_ALLOWED_ORIGIN` environment variable
   - Ensure origin matches exactly (including protocol and port)
   - Verify middleware is running

2. **"CORS policy: Request header field authorization is not allowed"**
   - Ensure 'Authorization' is in ALLOWED_HEADERS
   - Check preflight handling works

3. **Origin not allowed**
   - Verify origin is in `CORS_ALLOWED_ORIGIN` or `CORS_ADDITIONAL_ORIGINS`
   - Check for typos in environment variables
   - Ensure environment variables are loaded

4. **Development localhost issues**
   - Ensure `NODE_ENV=development`
   - Check localhost URL format (http://localhost:3000)

### Debug Steps

1. **Check environment variables**:
   ```bash
   console.log('CORS Config:', {
     ALLOWED_ORIGIN: process.env.CORS_ALLOWED_ORIGIN,
     ADDITIONAL_ORIGINS: process.env.CORS_ADDITIONAL_ORIGINS,
     NODE_ENV: process.env.NODE_ENV
   });
   ```

2. **Verify CORS headers**: Use browser DevTools Network tab
3. **Test without CDN**: Direct API calls to origin server
4. **Check request/response logs**: Server-side logging

## Security Considerations

1. **Never use wildcard (*) for origin** when allowing credentials
2. **Use specific domains** in production (avoid broad patterns)
3. **Use HTTPS** for both frontend and API in production
4. **Validate origins** server-side for sensitive operations
5. **Monitor CORS errors** in production logs
6. **Regularly review** allowed origins list

## Production Checklist

- [ ] Environment variables configured
- [ ] CORS_ALLOWED_ORIGIN set to production domain
- [ ] Additional origins configured if needed
- [ ] Middleware configured and deployed
- [ ] All API routes include CORS headers
- [ ] CDN configured (if applicable)
- [ ] CORS testing completed with actual domains
- [ ] Security review completed
- [ ] Monitoring configured
- [ ] Documentation updated with actual domains 