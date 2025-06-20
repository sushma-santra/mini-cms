# Form Submissions API Documentation

## Overview
This document outlines the unified form submission API endpoint that handles ebook downloads, newsletter subscriptions, and contact form submissions.

## Base URL
```
POST /api/submit
```

## Request Format
All requests must be sent as `POST` requests with `Content-Type: application/json`.

## Common Fields
All submissions require these common fields:
| Field | Type | Description |
|-------|------|-------------|
| `module_name` | string | The type of submission. Must be one of: `"ebook"`, `"newsletter"`, or `"contacts"` |
| `captcha` | string | The Google reCAPTCHA response token |

## Module-Specific Fields

### 1. Ebook Download (`module_name: "ebook"`)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `first_name` | string | Yes | Max length: 100 characters |
| `last_name` | string | Yes | Max length: 100 characters |
| `organisation_name` | string | Yes | Max length: 200 characters |
| `country` | string | Yes | Max length: 100 characters |
| `email` | string | Yes | Valid email format, max length: 255 characters |
| `privacy_policy` | boolean | Yes | Must be true to proceed |

Example Request:
```json
{
  "module_name": "ebook",
  "first_name": "John",
  "last_name": "Doe",
  "organisation_name": "Example Corp",
  "country": "United States",
  "email": "john@example.com",
  "privacy_policy": true,
  "captcha": "recaptcha-response-token"
}
```

### 2. Newsletter Subscription (`module_name: "newsletter"`)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Valid email format, max length: 255 characters |

Example Request:
```json
{
  "module_name": "newsletter",
  "email": "subscriber@example.com",
  "captcha": "recaptcha-response-token"
}
```

### 3. Contact Form (`module_name: "contacts"`)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `first_name` | string | Yes | Max length: 100 characters |
| `last_name` | string | Yes | Max length: 100 characters |
| `organisation` | string | Yes | Max length: 200 characters |
| `type_of_organisation` | string | Yes | Max length: 100 characters |
| `country` | string | Yes | Max length: 100 characters |
| `phone_number` | string | Yes | Max length: 50 characters |
| `email` | string | Yes | Valid email format, max length: 255 characters |
| `message` | string | Yes | The inquiry message |
| `privacy_policy` | boolean | No | Optional privacy policy acceptance |

Example Request:
```json
{
  "module_name": "contacts",
  "first_name": "Jane",
  "last_name": "Smith",
  "organisation": "Tech Corp",
  "type_of_organisation": "Technology",
  "country": "Canada",
  "phone_number": "+1234567890",
  "email": "jane@techcorp.com",
  "message": "I would like to learn more about your services",
  "privacy_policy": true,
  "captcha": "recaptcha-response-token"
}
```

## Response Format

### Success Response
**Status Code:** 200
```json
{
  "message": "Submission successful"
}
```

### Error Responses

#### 1. Validation Error
**Status Code:** 400
```json
{
  "error": "Validation failed",
  "details": [
    {
      "code": "invalid_type",
      "message": "Required",
      "path": ["field_name"]
    }
  ]
}
```

#### 2. Captcha Error
**Status Code:** 400
```json
{
  "error": "Invalid captcha verification"
}
```

#### 3. Server Error
**Status Code:** 500
```json
{
  "error": "Internal server error"
}
```

## reCAPTCHA Integration

### Frontend Requirements
The frontend team needs to:
1. Get the reCAPTCHA site key from Google Console
2. Add the reCAPTCHA script to your HTML:
```html
<script src="https://www.google.com/recaptcha/api.js" async defer></script>
```

3. Add the reCAPTCHA widget to your form:
```html
<div class="g-recaptcha" data-sitekey="your_frontend_site_key_here"></div>
```

4. When submitting the form, include the reCAPTCHA response:
```javascript
const captchaResponse = grecaptcha.getResponse();
// Include captchaResponse in your submission data
```

### Backend Configuration
The backend only requires the reCAPTCHA secret key in the environment:
```
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here
```

This secret key is used server-side to verify the captcha tokens received from the frontend.

## Notes
1. All string fields have maximum length restrictions
2. Email fields must be in valid email format
3. The privacy policy field must be true for ebook downloads
4. All requests must include a valid reCAPTCHA token
5. The API uses JSON for both requests and responses
6. All dates in responses are in ISO 8601 format 